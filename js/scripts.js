function loadMarkDown(direction) {
    const converter = createMarkdownConverter();
    const xhr = new XMLHttpRequest();

    xhr.open('GET', direction, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            processMarkdown(xhr.responseText);
        }
    };
    xhr.send();
}

function createMarkdownConverter() {
    return new showdown.Converter({
        tables: true,
        strikethrough: true,
        extensions: [showdownKatex({
            // ... (your Katex options)
        })]
    });
}

function processMarkdown(markdown) {
    let headerHTML = "";
    let contentHTML = "";

    const { header, content } = extractHeaderAndContent(markdown);

    if (header !== null && header !== "") {
        headerHTML = processHeader(header);
    }

    if (content.startsWith("http")) {
        loadMarkDown(content);
    } else {
        contentHTML = processContent(content);
        document.getElementById("output").innerHTML = headerHTML + contentHTML;
    }

    hljs.highlightAll();
}

function extractHeaderAndContent(markdown) {
    const firstSeparatorIndex = markdown.indexOf('---\r\n');
    let header = '';
    let content = markdown;

    if (firstSeparatorIndex !== -1) {
        markdown = markdown.slice(firstSeparatorIndex + 4, markdown.length).trim();
        const secondSeparatorIndex = markdown.indexOf('---\r\n');

        if (secondSeparatorIndex !== -1) {
            header = markdown.slice(0, secondSeparatorIndex).trim();
            content = markdown.slice(secondSeparatorIndex + 4, markdown.length).trim();
        }
    }

    return { header, content };
}

function processHeader(header) {
    try {
        const headerData = jsyaml.load(header);
        const readTimeMinutes = calculateReadTime(headerData);

        if (headerData.image.url.includes("Blogs")) {
            return createHeaderHTML(headerData, readTimeMinutes);
        }
    } catch (e) {
        console.log(e);
    }

    return "";
}

function calculateReadTime(headerData) {
    const wordsPerMinute = 200; // Adjust this value based on your reading speed estimation
    const wordCount = headerData.description.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}

function createHeaderHTML(headerData, readTimeMinutes) {
    return `
        <dev class="my-0 py-0">
            <h1>${headerData.title}</h1>
            <p>Description: ${headerData.description}</p>
            <img style="width: 15%;border-radius: 50%;margin-right:10px;" src="${headerData.authorPP}" alt=";(" />
            <p style="margin-right:10px;"><b>Author:</b> ${headerData.author}</p>
            <p style="display:inline-block;margin-right:10px;"><b>Published on:</b> ${headerData.pubDate}</p>
            <p style="display:inline-block;margin-right:10px;"><b>Read Time (Minutes):</b> ${readTimeMinutes}</p>
            <p><b>Tags:</b> ${headerData.tags.join(', ')}</p>
        </dev>`;
}

function processContent(content) {
    const converter = createMarkdownConverter();
    let contentHTML = converter.makeHtml(content);
    contentHTML = contentHTML.replace(/<h1/g, '<h1 class="text-center text-lg-center"');
    contentHTML = contentHTML.replace(/<h2/g, '<h2 class="text-center text-lg-center"');
    contentHTML = contentHTML.replace(/<h3/g, '<h3 class="text-center text-lg-center"');

    contentHTML = contentHTML.replace(/<p\b/g, '<div class="container px-5 py-4 "> <p class="text-second"');
    contentHTML = contentHTML.replace(/<\/p>/g, '</p></div>');
    return contentHTML;
}
