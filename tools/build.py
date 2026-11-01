#!/usr/bin/env python3
"""Bake the site into _site/.

    python tools/build.py           one-off build (what CI runs)
    python tools/build.py --serve   dev server with rebuild + live reload on save
"""
import argparse
import hashlib
import html
import math
import re
import shutil
import threading
import time
import urllib.request
from datetime import date
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote

import yaml
from jinja2 import Environment, FileSystemLoader, StrictUndefined
from markdown_it import MarkdownIt
from markupsafe import Markup
from pygments import lex
from pygments.lexers import get_lexer_by_name
from pygments.token import Comment, Keyword, Literal, Name, Number, String
from pygments.util import ClassNotFound

ROOT = Path(__file__).resolve().parent.parent
CONTENT, TEMPLATES, OUT, CACHE = (ROOT / d for d in ('content', 'templates', '_site', '.cache'))
STATIC = [ROOT / d for d in ('assets', 'css', 'js')]
README_MAX_AGE = 24 * 3600  # dev builds reuse a fetched README for a day

# Pygments tokens -> highlight.js classes, so css/code-*.css keeps styling the baked code.
HLJS = [(Comment.Preproc, 'meta'), (Comment, 'comment'), (Keyword.Type, 'type'), (Keyword.Constant, 'literal'),
        (Keyword, 'keyword'), (String, 'string'), (Number, 'number'), (Name.Function, 'title'),
        (Name.Class, 'title class_'), (Name.Builtin, 'built_in'), (Literal, 'literal')]
HLJS_WORDS = {'const': 'type', 'true': 'literal', 'false': 'literal'}


def token_class(token, text, following):
    if text in HLJS_WORDS:
        return HLJS_WORDS[text]
    is_call = following.lstrip().startswith('(')
    if is_call and (token in Keyword.Type or (token in Name and token not in Name.Function)):
        return 'built_in'
    return next((css for parent, css in HLJS if token in parent), None)


def highlight(code, lang='', _attrs=''):
    lang = lang or 'cpp'  # nearly all code on the site is C++
    if lang in ('bash', 'powershell', 'shell'):
        body = re.sub(r'(?<=\s)--?[A-Za-z]\S*', lambda m: f'<span class="hljs-literal">{m.group()}</span>',
                      html.escape(code, quote=False))
        return f'<pre><code class="hljs language-{lang}">{body}</code></pre>'
    try:
        tokens = list(lex(code, get_lexer_by_name(lang)))
    except ClassNotFound:
        tokens = [(None, code)]
    body = ''
    depth = 0  # parentheses open in a function definition's parameter list; -1 until the first one
    for index, (token, text) in enumerate(tokens):
        following = ''.join(next_text for _, next_text in tokens[index + 1:index + 3])
        css = token_class(token, text, following) if token else None
        follows_type = index > 1 and tokens[index - 1][1].isspace() and tokens[index - 2][0] in Name
        if css == 'title' or (css == 'built_in' and token in Name and follows_type):
            css, depth = 'title', -1
        elif text == '(' and depth == -1:
            depth = 1
        elif depth > 0:
            depth += text.count('(') - text.count(')')
            if depth > 0 and not css and text.strip():
                css = 'params'
        text = html.escape(text, quote=False)
        body += f'<span class="hljs-{css}">{text}</span>' if css else text
    return f'<pre><code class="hljs language-{lang}">{body}</code></pre>'


MARKDOWN = MarkdownIt('commonmark', {'html': True, 'highlight': highlight}).enable(['table', 'strikethrough'])


def highlight_raw_blocks(page_html):
    """Indented code and hand-written <pre><code> blocks skip the fence renderer."""
    return re.sub(r'<pre><code(?: class="language-([\w+-]+)")?>(.*?)</code></pre>',
                  lambda m: highlight(html.unescape(m.group(2)), m.group(1)), page_html, flags=re.DOTALL)


def render_markdown(text):
    return (highlight_raw_blocks(MARKDOWN.render(text))
            .replace('<img ', '<img class="img-fluid mx-auto d-block" loading="lazy" ')
            .replace('<table>', '<div class="table-responsive-sm table-responsive-xl">'
                                '<table class="table table-bordered">')
            .replace('</table>', '</table></div>')
            .replace('<h1>', '<h1 class="text-center text-lg-center">')
            .replace('<h2>', '<h2 class="text-center text-lg-center">')
            .replace('<h3>', '<h3 class="text-center text-lg-center">'))


def fetch_readme(url):
    """Download a project README once per build (per day in dev), and make its relative links absolute."""
    cached = CACHE / (hashlib.sha1(url.encode()).hexdigest() + '.md')
    if not cached.exists() or time.time() - cached.stat().st_mtime > README_MAX_AGE:
        try:
            with urllib.request.urlopen(url, timeout=20) as response:
                text = response.read().decode('utf-8')
            CACHE.mkdir(exist_ok=True)
            cached.write_text(text, encoding='utf-8')
        except OSError as error:
            if not cached.exists():
                raise
            print(f'warning: using cached {url}: {error}')
    raw_base = url.rsplit('/', 1)[0] + '/'
    blob_base = raw_base.replace('raw.githubusercontent.com', 'github.com').replace('/master/', '/blob/master/')

    def absolute(match):
        bang, label, target = match.groups()
        if re.match(r'[a-z]+:|#|/', target):
            return match.group(0)
        return f'{bang}[{label}]({raw_base if bang else blob_base}{target})'

    return re.sub(r'(!?)\[([^\]]*)\]\(([^)\s]+)\)', absolute, cached.read_text(encoding='utf-8'))


def load_page(path, section):
    match = re.match(r'---\n(.*?)\n---\n?(.*)', path.read_text(encoding='utf-8').replace('\r\n', '\n'), re.DOTALL)
    if not match:
        raise ValueError(f'{path}: missing YAML front matter')
    page = yaml.safe_load(match.group(1))
    body = match.group(2).strip()
    if body.startswith('http'):
        body = fetch_readme(body)
    page.update(section=section, slug=path.stem, html=Markup(render_markdown(body)),
                read_time=math.ceil(len(body.split()) / 200), math='$' in body)
    page['url'] = page.get('permalink', f'/{section}/{path.stem}/')
    return page


def absolute_url(site, path):
    return path if path.startswith('http') else site['url'] + path


def share_image(site, image):
    """Link previews need an absolute URL to a raster image."""
    return absolute_url(site, site['image'] if image.endswith('.svg') else image)


def icon(name, css=''):
    svg = (TEMPLATES / 'icons' / f'{name}.svg').read_text(encoding='utf-8')
    svg = re.sub(r'<!--.*?-->', '', svg, flags=re.DOTALL).strip()
    return Markup(svg.replace('<svg ', f'<svg class="icon {css}" aria-hidden="true" ', 1))


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding='utf-8')


def sync_static():
    for source_dir in STATIC:
        for source in source_dir.rglob('*'):
            target = OUT / source.relative_to(ROOT)
            if source.is_file() and (not target.exists() or target.stat().st_mtime < source.stat().st_mtime):
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, target)


def warn_missing_images():
    """GitHub Pages is case-sensitive, Windows is not, so compare exact paths."""
    known = {'/' + file.relative_to(OUT).as_posix() for file in OUT.rglob('*') if file.is_file()}
    for page in OUT.rglob('*.html'):
        for source in re.findall(r'<img[^>]*src="(/[^"]+)"', page.read_text(encoding='utf-8')):
            if unquote(source) not in known:
                print(f'warning: {page.relative_to(OUT).as_posix()} uses missing image {source}')


def build(dev=False):
    started = time.time()
    if not dev:
        shutil.rmtree(OUT, ignore_errors=True)
    sync_static()

    site = yaml.safe_load((CONTENT / 'site.yaml').read_text(encoding='utf-8'))
    env = Environment(loader=FileSystemLoader(TEMPLATES), autoescape=True, undefined=StrictUndefined,
                      trim_blocks=True, lstrip_blocks=True)
    env.globals.update(site=site, icon=icon, dev=dev, year=date.today().year)
    env.filters.update(absolute=partial(absolute_url, site), share_image=partial(share_image, site))

    pages = {section: [load_page(path, section) for path in (CONTENT / section).rglob('*.md')]
             for section in ('projects', 'blogs')}
    listed = {section: sorted((p for p in items if 'order' in p), key=lambda p: p['order'])
              for section, items in pages.items()}

    urls = ['/', '/about']
    write(OUT / 'index.html', env.get_template('index.html').render(url='/', **listed))
    write(OUT / 'about.html', env.get_template('about.html').render(url='/about'))
    write(OUT / '404.html', env.get_template('404.html').render(url='/404'))
    for section, items in pages.items():
        template = env.get_template(section.rstrip('s') + '.html')
        for page in items:
            target = page['url'].lstrip('/')
            write(OUT / (target if target.endswith('.html') else target + 'index.html'),
                  template.render(page=page, url=page['url']))
            urls.append(page['url'])

    locations = ''.join(f'<url><loc>{site["url"]}{u}</loc></url>' for u in sorted(urls))
    write(OUT / 'sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n'
          f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{locations}</urlset>\n')
    write(OUT / 'robots.txt', f'User-agent: *\nAllow: /\nSitemap: {site["url"]}/sitemap.xml\n')
    warn_missing_images()
    print(f'built {len(urls) + 1} pages in {time.time() - started:.2f}s')


class Reloader:
    """Lets each open browser tab wait until the next successful rebuild."""

    def __init__(self):
        self.version = 0
        self.changed = threading.Condition()

    def bump(self):
        with self.changed:
            self.version += 1
            self.changed.notify_all()

    def wait(self, seen):
        with self.changed:
            self.changed.wait_for(lambda: self.version != seen, timeout=25)
            return self.version


RELOADER = Reloader()


class DevHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/__reload':
            return self.stream_reloads()
        path = self.path.split('?')[0].split('#')[0]
        file = OUT / path.lstrip('/')
        if not file.exists() and file.with_suffix('.html').exists():  # /about works, as on GitHub Pages
            self.path = path + '.html'
        elif not file.exists():
            body = (OUT / '404.html').read_bytes()
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return None
        return super().do_GET()

    def stream_reloads(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream')
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        seen = RELOADER.version
        try:
            while True:
                current = RELOADER.wait(seen)
                self.wfile.write(b'data: reload\n\n' if current != seen else b': ping\n\n')
                self.wfile.flush()
                seen = current
        except OSError:
            pass  # tab closed

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *args):
        pass


def snapshot():
    return {f: f.stat().st_mtime for d in (CONTENT, TEMPLATES, *STATIC) for f in d.rglob('*') if f.is_file()}


def watch():
    seen = snapshot()
    while True:
        time.sleep(0.3)
        current = snapshot()
        if current == seen:
            continue
        seen = current
        try:
            build(dev=True)
            RELOADER.bump()
        except Exception as error:  # keep serving: the next save may fix it
            print(f'build failed: {error}')


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--serve', action='store_true', help='serve _site and rebuild on save')
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    build(dev=args.serve)
    if args.serve:
        threading.Thread(target=watch, daemon=True).start()
        server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(DevHandler, directory=str(OUT)))
        server.daemon_threads = True
        print(f'serving http://127.0.0.1:{args.port} (Ctrl+C to stop)')
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == '__main__':
    main()
