# joranvandenbroucke.github.io

Source of https://joranvandenbroucke.github.io. A small Python script bakes everything to plain
HTML, CSS and JavaScript in `_site/`. There is no Node and no bundler.

## Develop

```
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python tools\build.py --serve
```

Open http://127.0.0.1:8000. Saving anything in `content/`, `templates/`, `assets/`, `css/` or `js/`
rebuilds the site and reloads the browser. Restart the server after changing `tools/build.py`.

## Where things live

- `content/projects/`, `content/blogs/`: one Markdown file per page, published automatically.
  Add `order: <n>` to the front matter to show it on the homepage; leave it out to keep the page unlisted.
  If the body is only a URL, that Markdown file (such as a GitHub README) is downloaded at build time.
- `content/site.yaml`: name, contact links and other values used on every page.
- `templates/`: Jinja2 layouts. `base.html` holds the head, navbar and footer, `index.html` the homepage.
  `templates/icons/` holds the Font Awesome Free SVGs (see its `LICENSE.txt`).
- `js/site.js`: navbar, tabs, carousel and feedback form. `js/math.js` runs KaTeX on pages that contain `$`.
- `tools/build.py`: the build and the dev server.

Pushing to `main` builds and deploys through GitHub Actions, which also rebuilds every Monday to pick up
README changes.
