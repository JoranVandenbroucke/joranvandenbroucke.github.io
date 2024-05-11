// Function for calculating read time
function calculateReadTime(markdown) {
    const wordsPerMinute = 200; // Adjust this value based on your reading speed estimation
    const wordCount = markdown.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}
function loadMarkDown(direction) {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', direction, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                processMarkdown(xhr.responseText);
            } else {
                console.error(`Failed to load file: ${xhr.status}`);
            }
        }
    };
    xhr.send();

}

function createMarkdownConverter() {
    return new showdown.Converter({tables: true, strikethrough: true})
}

function processMarkdown(markdown) {
    let headerHTML = "";
    let contentHTML = "";

    const { header, content } = extractHeaderAndContent(markdown);

    if (header !== null && header !== "") {
        headerHTML = processHeader(header, content);
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
    let sepperator = '---';
    if (markdown.includes('\r\n')) {
        sepperator += '\r\n';
    } else if (markdown.includes('\n'))
    {
        sepperator += '\n';
    }
    let firstSeparatorIndex = markdown.indexOf(sepperator);
    let header = '';
    let content = markdown;

    if (firstSeparatorIndex !== -1) {
        markdown = markdown.slice(firstSeparatorIndex + 4, markdown.length).trim();
        const secondSeparatorIndex = markdown.indexOf(sepperator);

        if (secondSeparatorIndex !== -1) {
            header = markdown.slice(0, secondSeparatorIndex).trim();
            content = markdown.slice(secondSeparatorIndex + 4, markdown.length).trim();
        }
    }

    return { header, content };
}

function processHeader(header, markdown) {
    try {
        const headerData = jsyaml.load(header);
        const readTimeMinutes = calculateReadTime(markdown);

        if (headerData.image.url.includes("blogs")) {
            return createHeaderHTML(headerData, readTimeMinutes);
        }
    } catch (e) {
        console.log(e);
    }

    return "";
}

function createHeaderHTML(headerData, readTimeMinutes) {
    return `
        <div class="my-0 py-0">
            <h1>${headerData.title}</h1>
            <p>Description: ${headerData.description}</p>
            <img style="width: 15%;border-radius: 50%;margin-right:10px;" src="${headerData.authorPP}" alt="Author's profile picture" />
            <p style="margin-right:10px;"><b>Author:</b> ${headerData.author}</p>
            <p style="display:inline-block;margin-right:10px;"><b>Published on:</b> ${headerData.pubDate}</p>
            <p style="display:inline-block;margin-right:10px;"><b>Read Time (Minutes):</b> ${readTimeMinutes}</p>
            <p><b>Tags:</b> ${headerData.tags.join(', ')}</p>
        </div>`;
}

function processContent(content) {
    let newHtml = createMarkdownConverter().makeHtml(content);

    // Create a temporary div element
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = newHtml;

    renderMathInElement(tempDiv,
        {
            "displayMode": true,
            "leqno": false,
            "fleqn": false,
            "throwOnError": true,
            "errorColor": "#cc0000",
            "strict": "error",
            "output": "html",
            "trust": false,
            "macros": {"\\f": "#1f(#2)"},
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "\\begin{equation}", right: "\\end{equation}", display: true},
                {left: "\\begin{align}", right: "\\end{align}", display: true},
                {left: "\\begin{alignat}", right: "\\end{alignat}", display: true},
                {left: "\\begin{gather}", right: "\\end{gather}", display: true},
                {left: "\\begin{CD}", right: "\\end{CD}", display: true},
                {left: "\\[", right: "\\]", display: true},
                {left: "$", right: "$", display: false},
                {left: "\\(", right: "\\)", display: false}
            ]
        }
    );

    // Get the HTML string back from the temporary div
    newHtml = tempDiv.innerHTML;

    return newHtml
        .replace(/<h1/g, '<h1 class="text-center text-lg-center"')
        .replace(/<h2/g, '<h2 class="text-center text-lg-center"')
        .replace(/<h3/g, '<h3 class="text-center text-lg-center"')
}
