function loadMarkDown(direction) {
    const converter = new showdown.Converter({
        tables: true,
        strikethrough: true,
        extensions: [showdownKatex({
            "displayMode": true,
            "leqno": false,
            "fleqn": true,
            "throwOnError": false,
            "errorColor": "#ff0000",
            "strict": "error",
            "output": "html",
            "trust": false,
            delimiters: [{left: "$$", right: "$$", display: true}, {
                left: "\\(",
                right: "\\)",
                display: false
            }, {left: "\\begin{equation}", right: "\\end{equation}", display: true}, {
                left: "\\begin{align}",
                right: "\\end{align}",
                display: true
            }, {left: "\\begin{alignat}", right: "\\end{alignat}", display: true}, {
                left: "\\begin{gather}",
                right: "\\end{gather}",
                display: true
            }, {left: "\\begin{CD}", right: "\\end{CD}", display: true}, {left: "\\[", right: "\\]", display: true}]
        })]
    });

    const xhr = new XMLHttpRequest();
    xhr.open('GET', direction, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let markdown = xhr.responseText;
            let firstSeparatorIndex = markdown.indexOf('---\r\n');
            let header = '';
            let content = markdown;
            if (firstSeparatorIndex !== -1) {
                markdown = markdown.slice(firstSeparatorIndex + 4, markdown.length).trim();
                let secondSeparatorIndex = markdown.indexOf('---\r\n');
                if (secondSeparatorIndex !== -1) {
                    header = markdown.slice(0, secondSeparatorIndex).trim();
                    content = markdown.slice(secondSeparatorIndex + 4, markdown.length).trim();
                }
            }

            let headerHTML;
            if (header !== null && header !== "") {
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
                    document.getElementById("output").innerHTML = headerHTML + converter.makeHtml(content);
                } catch (e) {
                    console.log(e);
                }
            } else {
                document.getElementById("output").innerHTML = converter.makeHtml(content);
            }
            hljs.highlightAll();
        }
    };
    xhr.send();
}