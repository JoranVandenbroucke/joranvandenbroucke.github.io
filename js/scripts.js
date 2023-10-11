
function includeHTML() {
    // Include the header
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            const headerContainer = document.getElementById('header');
            const newHeader = document.createRange().createContextualFragment(data);
            headerContainer.replaceWith(newHeader);
        });

    // Include the footer
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            const footerContainer = document.getElementById('footer');
            const newFooter = document.createRange().createContextualFragment(data);
            footerContainer.replaceWith(newFooter);
        });
}

function loadMarkDown(direction) {
    const converter = new showdown.Converter({tables: true, strikethrough: true});

    const xhr = new XMLHttpRequest();
    xhr.open('GET', direction, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let markdown = xhr.responseText;
            const firstSeparatorIndex = markdown.indexOf('---\r\n');
            if (firstSeparatorIndex === -1) {
                throw new Error('Invalid markdown format: Header separator (---) not found');
            }
            markdown = markdown.slice(firstSeparatorIndex + 4, markdown.length).trim();
            const secondSeparatorIndex = markdown.indexOf('---\r\n');
            if (secondSeparatorIndex === -1) {
                throw new Error('Invalid markdown format: Header separator (---) not found');
            }

            const header = markdown.slice(0, secondSeparatorIndex).trim();
            const content = markdown.slice(secondSeparatorIndex + 4, markdown.length).trim();

            let headerHTML;
            try {
                const headerData = jsyaml.load(header);

                const wordsPerMinute = 200; // Adjust this value based on your reading speed estimation
                const wordCount = markdown.trim().split(/\s+/).length;
                const readTimeMinutes = Math.ceil(wordCount / wordsPerMinute);

                headerHTML = '<dev class="my-0 py-0">';
                headerHTML += '<h1>' + headerData.title + '</h1>';
                headerHTML += '<p>Description: ' + headerData.description + '</p>';
                headerHTML += '<img style="width: 15%;border-radius: 50%;margin-right:10px;" src="' + headerData.image.url + '" alt="' + headerData.image.alt + '" />';
                headerHTML += '<p style="margin-right:10px;"><b>Author:</b> ' + headerData.author + '</p>';
                headerHTML += '<p style="display:inline-block;margin-right:10px;"><b>Published on:</b> ' + headerData.pubDate + '</p>';
                headerHTML += '<p style="display:inline-block;margin-right:10px;"><b>Read Time (Minutes):</b> ' + readTimeMinutes + '</p>';
                headerHTML += '<p><b>Tags:</b> ' + headerData.tags.join(', ') + '</p>';
                headerHTML += '</dev>';

            } catch (e) {
                console.log(e);
            }

            document.getElementById("output").innerHTML = headerHTML + converter.makeHtml(content);

            renderMathInElement(
                document.body,
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
            hljs.highlightAll();
        }
    };
    xhr.send();
}