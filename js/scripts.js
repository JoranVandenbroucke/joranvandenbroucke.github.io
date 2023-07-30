/*!
* Start Bootstrap - Grayscale v7.0.3 (https://startbootstrap.com/theme/grayscale)
* Copyright 2013-2021 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-grayscale/blob/master/LICENSE)
*/
//
// Scripts
//

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    const navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    }

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });
});

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
                headerHTML += '<img style="width: 5%;border-radius: 50%;margin-right:10px;" src="' + headerData.image.url + '" alt="' + headerData.image.alt + '" />';
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