import os
import sys
import re
import yaml
import math


def generate_carousel_indicators(images):
    indicators_html = ""
    for i in range(len(images)):
        active_class = 'active' if i == 0 else ''
        indicators_html += (f'<button type="button" data-bs-target="#demo" data-bs-slide-to="{i}" '
                            f'class="{active_class}"></button>\n')
    return indicators_html


def generate_carousel_inner(images):
    inner_html = ""
    for i, image_path in enumerate(images):
        active_class = 'active' if i == 0 else ''
        inner_html += (
            f'<div class="carousel-item {active_class}">\n'
            f'    <img src="{image_path}" alt="view {i + 1}" class="mx-auto d-block">\n'
            f'</div>\n'
        )
    return inner_html


def extract_document_data(file_content, file):
    # Extract YAML front matter using regex
    match = re.match(r'---\n(.*?)\n---\n(.*)', file_content, re.DOTALL)
    if match:
        front_matter, content = match.groups()
        # Load YAML front matter
        header_data = yaml.safe_load(front_matter)
        # Add content to document data
        words_per_minute = 200
        word_count = len(content)
        read_time_minutes = math.ceil(word_count / words_per_minute)
        carousel_images = header_data.get('carouselImages', [])
        return {
            'Title': header_data['title'],
            'SubTitle': header_data['subTitle'],
            'Description': header_data['description'],
            'Image': {'url': header_data['image']['url'], 'alt': header_data['image']['alt']},
            'Author': header_data['author'],
            'Pubdate': header_data['pubDate'],
            'Tags': header_data['tags'],
            'CarouselImages': carousel_images,
            'ReadTime': read_time_minutes,
            'FileName': re.sub(r'^(\w+)/(\w+/)?(\w+)\.md$', r'\1/\3.html', re.sub(r'\s', '', file))
        }
    else:
        return None


def generate_html_page(document, html_file_name):
    # read template file
    template = ""
    markdown_url = ''
    if "blogs" in document['FileName']:
        with open('tools/blogs.html', 'r') as template_file:
            template = template_file.read()
        markdown_url = '/assets/markdown/' + html_file_name
    elif "projects" in document['FileName']:
        with open('tools/projects.html', 'r') as template_file:
            template = template_file.read()
        markdown_url = '/assets/markdown/' + html_file_name
        carousel_indicators = generate_carousel_indicators(document['CarouselImages'])
        carousel_inner = generate_carousel_inner(document['CarouselImages'])
        template = template.replace(f'{{{"Carousel_Indicators"}}}', carousel_indicators)
        template = template.replace(f'{{{"Carousel_Inner"}}}', carousel_inner)

    # Adjusting image URL
    image_url = document['Image']['url']

    # Creating a limited number of keyword combinations
    keyword_combinations = ', '.join(document['Tags'] + document['Author'].split() + document['Title'].split()[:3])
    canonical = 'https://joranvandenbroucke.github.io/' + document['FileName'].replace('.html', '')

    # Replace placeholders in the template
    template = template.replace(f'{{{"Title"}}}', document['Title'])
    template = template.replace(f'{{{"SubTitle"}}}', document['SubTitle'])
    template = template.replace(f'{{{"Description"}}}', document['Description'])
    template = template.replace(f'{{{"Image"}}}', image_url)
    template = template.replace(f'{{{"URL"}}}', canonical)
    template = template.replace(f'{{{"Author"}}}', document['Author'])
    template = template.replace(f'{{{"KeyWords"}}}', keyword_combinations)

    template = template.replace(f'{{{"MarkdownDir"}}}', markdown_url)

    # write the generated HTML to a new file
    output_filename = document['FileName'].replace('.html', '/index.html')
    print(output_filename)
    os.makedirs(os.path.dirname(output_filename), exist_ok=True)
    with open(output_filename, 'w') as output_file:
        output_file.write(template)


# list of documents
documents = ["blogs/GANM/ganm1.md",
             "blogs/GART/gart1.md",
             "blogs/LCM/LCM.md",
             "blogs/LCM/LCM_Recast.md",
             "projects/SoftwareRasterizer.md",
             "projects/CodeToSVG.md",
             "projects/SoftwareRayTracer.md",
             "projects/AIProgramming.md",
             "projects/NOX.md",
             "projects/CoL.md",
             "projects/Balbino/Balbino.md",
             "projects/Balbino/FawnAlgebra.md"
             ]

# iterate through each document file
for filename in documents:
    try:
        with open(os.path.join('assets/markdown', filename), 'r') as document_file:
            document_data = extract_document_data(document_file.read(), filename)
            if document_data:
                generate_html_page(document_data, filename)
    except IOError as e:
        print(f"I/O error({e.errno}): {e.strerror}")
    except:
        print (f"Unexpected error:{sys.exc_info()[0]}")
