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

    const {header, content} = extractHeaderAndContent(markdown);

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
    } else if (markdown.includes('\n')) {
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

    return {header, content};
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

// Function for changing theme
function applyTheme(theme) {
    let activeTheme = theme.matches ? 'dark code' : 'light code';
    let inactiveTheme = theme.matches ? 'light code' : 'dark code';

    let activeLink = document.querySelector(`link[title="${activeTheme}"]`);
    let inactiveLink = document.querySelector(`link[title="${inactiveTheme}"]`);

    // Check if the query results are not null before manipulating the elements
    if (activeLink !== null) {
        activeLink.removeAttribute('disabled');
    }
    if (inactiveLink !== null) {
        inactiveLink.setAttribute('disabled', 'disabled');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const projectsContainer = document.getElementById('projects-container');
    const blogsContainer = document.getElementById('blogs-container');

// Parses the markdown and file info to return an object with blog info
    const getFileInfo = (markdown, file) => {
        let separator = '---';
        if (markdown.includes('\r\n')) {
            separator += '\r\n';
        } else if (markdown.includes('\n')) {
            separator += '\n';
        }
        let firstSeparatorIndex = markdown.indexOf(separator);
        let header = '';
        if (firstSeparatorIndex !== -1) {
            markdown = markdown.slice(firstSeparatorIndex + separator.length, markdown.length).trim();
            let secondSeparatorIndex = markdown.indexOf(separator);
            if (secondSeparatorIndex !== -1) {
                header = markdown.slice(0, secondSeparatorIndex).trim();
            }
        }
        let headerData = {};
        let readTimeMinutes;
        if (header !== null && header !== "") {
            try {
                headerData = jsyaml.load(header);
                const wordsPerMinute = 200; // Adjust this value based on your reading speed estimation
                const wordCount = markdown.trim().split(/\s+/).length;
                readTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
            } catch (error) {
                console.error('Error parsing YAML:', error);
                // Return a default object if the header can't be parsed
                return {
                    title: '',
                    subTitle: '',
                    description: '',
                    image: {url: '', alt: ''},
                    author: '',
                    authorPP: '',
                    pubdate: '',
                    tags: [],
                    readTime: 0,
                    fileName: ''
                };
            }
        }
        return {
            title: headerData.title || '',
            subTitle: headerData.subTitle || '',
            description: headerData.description, // Assuming the entire content is the description for simplicity
            image: {url: headerData.image.url || '', alt: headerData.image.alt || ''},
            author: headerData.author || '',
            authorPP: headerData.authorPP || '',
            pubdate: headerData.pubdate || '',
            tags: headerData.tags || [],
            readTime: readTimeMinutes || 0,
            fileName: file.replace(/\s/g, '').replace(/^(\w+)\/(\w+\/)?(\w+)\.md$/g, '$1/$3') || ''
        };
    };

    function appendItem(fileData, index) {
        let item;
        if (index === 0) {
            item = document.createElement('featured-item');
        } else if (index % 2 === 0) {
            item = document.createElement('right-item');
        } else {
            item = document.createElement('left-item');
        }
        item.setAttribute('link', fileData.fileName);
        item.setAttribute('image', fileData.image.url);
        item.setAttribute('title', fileData.title);
        item.innerHTML = fileData.description;
        if (fileData.fileName.includes('blogs'))
            blogsContainer.appendChild(item);
        else
            projectsContainer.appendChild(item)
    }

    function iterateBlogFiles() {
        const blogFiles = [
            "projects/Balbino/Balbino.md",
            "projects/Balbino/FawnAlgebra.md",
            "projects/CoL.md",
            "projects/NOX.md",
            "projects/SoftwareRayTracer.md",
            "projects/SoftwareRasterizer.md",
            "projects/AIProgramming.md",
            "blogs/LCM/LCM.md"
        ];

        const promises = blogFiles.map(file => {
            const direction = `./assets/markdown/${file}`;
            return fetch(direction)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch file: ${response.status}`);
                    }
                    return response.text();
                })
                .then(markdown => {
                    return getFileInfo(markdown, file);
                })
                .catch(error => {
                    console.error(error);
                    throw error;
                });
        });

        Promise.all(promises)
            .then(blogInfos => {
                blogInfos.forEach(appendItem);
            })
            .catch(error => {
                console.error(`Failed to fetch files: ${error}`);
            });
    }

    iterateBlogFiles();

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

    // Shrink the navbar when the page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
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

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    applyTheme(e);
});

class HTMLBaseElement extends HTMLElement {
    constructor(...args) {
        super(...args);
        this.parsed = false; // guard to make it easy to do certain stuff only once
        this.parentNodes = [];
    }

    setup() {
        // collect the parentNodes
        let el = this;
        while (el.parentNode) {
            el = el.parentNode;
            this.parentNodes.push(el);
        }
        if (this.nextSibling || this.parentNodes.some(el => el.nextSibling) || document.readyState !== 'loading') {
            this.childrenAvailableCallback();
        } else {
            this.mutationObserver = new MutationObserver(() => {
                if (this.nextSibling || this.parentNodes.some(el => el.nextSibling) || document.readyState !== 'loading') {
                    this.childrenAvailableCallback();
                    this.mutationObserver.disconnect();
                }
            });

            this.mutationObserver.observe(this, {childList: true});
        }
    }
}

class HeaderNav extends HTMLBaseElement {
    constructor(...args) {
        super(...args);
    }

    connectedCallback() {
        this.setup();
    }

    childrenAvailableCallback() {
        this.parsed = true;

        const newHTML = `
            <!-- Navigation-->
            <nav class="navbar navbar-expand fixed-top" id="mainNav">
                <div class="container px-4 px-5">
                    <a class="navbar-brand" href="/">Joran J. C. Vandenbroucke</a>
                    <button class="navbar-toggler navbar-toggler-right text-second" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false"
                            aria-label="Toggle navigation">
                        Menu
                        <i class="fas fa-bars"></i>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarResponsive">
                        <ul class="navbar-nav ms-auto">
                            <li class="nav-item"><a class="nav-link" href="/#about">About</a></li>
                            <li class="nav-item"><a class="nav-link" href="/#portfolio">Portfolio</a></li>
                            <li class="nav-item"><a class="nav-link" href="/#contact">Contact</a></li>
                        </ul>
                    </div>
                </div>
            </nav>
        `;
        try {
            const newElement = document.createRange().createContextualFragment(newHTML);
            this.replaceWith(newElement);
        } catch (error) {
            console.error('Failed to create new element:', error);
        }
    }
}

class FooterNav extends HTMLBaseElement {
    constructor(...args) {
        super(...args);
    }

    connectedCallback() {
        this.setup();
    }

    childrenAvailableCallback() {
        this.parsed = true;

        const newHTML = `
            <!-- Contact-->
            <section class="signup-section" id="contact">
                <div class="container px-5">
                    <div class="row gx-5 justify-content-center">
                        <div class="col-4 mb-0">
                            <div class="card py-4 h-100">
                                <div class="card-body text-center">
                                    <i class="fab fa-github text-first mb-2"></i>
                                    <h4 class="text-uppercase m-0">GitHub</h4>
                                    <hr class="my-4 mx-auto"/>
                                    <div class="small"><a href="https://github.com/JoranVandenbroucke/">https://github.com/JoranVandenbroucke/</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-4 mb-0">
                            <div class="card py-4 h-100">
                                <div class="card-body text-center">
                                    <i class="fas fa-envelope text-first mb-2"></i>
                                    <h4 class="text-uppercase m-0">Email</h4>
                                    <hr class="my-4 mx-auto"/>
                                    <div class="small">
                                        <a href="mailto: joran.vandenbroucke@yandex.com">joran.vandenbroucke@yandex.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-4 mb-0">
                            <div class="card py-4 h-100">
                                <div class="card-body text-center">
                                    <i class="fab fa-linkedin text-first mb-2"></i>
                                    <h4 class="text-uppercase m-0">LinkedIn</h4>
                                    <hr class="my-4 mx-auto"/>
                                    <div class="small"><a href="https://www.linkedin.com/in/joran-vandenbroucke-1350a3222/">https://www.linkedin.com/in/joran-vandenbroucke-1350a3222/</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Footer-->
            <footer class="footer small text-center">
                <div class="container px-5">Copyright &copy; Joran Vandenbroucke 2022</div>
            </footer>
        `;
        try {
            const newElement = document.createRange().createContextualFragment(newHTML);
            this.replaceWith(newElement);
        } catch (error) {
            console.error('Failed to create new element:', error);
        }

    }
}

class FeaturedItem extends HTMLBaseElement {
    constructor(...args) {
        super(...args);
    }

    connectedCallback() {
        this.setup();
    }

    childrenAvailableCallback() {
        this.parsed = true;
        const link = this.getAttribute("link");
        const image = this.getAttribute("image");
        const title = this.getAttribute("title");
        const description = this.innerHTML;
        let type = 'a';
        if (link === null || link === "") {
            type = 'dev'
        }

        const newElement = document.createElement(type);
        newElement.href = link;
        newElement.style.textDecoration = 'none';
        newElement.classList.add("row", "gx-0", "mb-4", "mb-5", "align-items-center");
        newElement.innerHTML = `
                    <div class="col-xl-8 col-7">
                        <img alt="..." class="img-fluid mb-3 mb-0" src="${image}" />
                    </div>
                    <div class="col-xl-4 col-5">
                        <div class="featured-text text-center text-left">
                            <h4>${title}</h4>
                            <p class="mb-2">${description}</p>
                        </div>
                    </div>
`;
        try {
            this.replaceWith(newElement);
        } catch (error) {
            console.error('Failed to create new element:', error);
        }

    }
}

class LeftItem extends HTMLBaseElement {
    constructor(...args) {
        super(...args);
    }

    connectedCallback() {
        this.setup();
    }

    childrenAvailableCallback() {
        this.parsed = true;
        const link = this.getAttribute("link");
        const image = this.getAttribute("image");
        const title = this.getAttribute("title");
        const description = this.innerHTML;
        let type = 'a';
        if (link === null || link === "") {
            type = 'div'
        }


        const newElement = document.createElement(type);
        newElement.href = link;
        newElement.style.textDecoration = 'none';
        newElement.classList.add('row', 'gx-0', 'justify-content-center', 'bg-second');
        newElement.innerHTML = `
    <div class="col-6"><img alt="..." class="img-fluid" src="${image}"/></div>
    <div class="col-6 order-first">
        <div class="text-center h-100 project">
            <div class="d-flex h-100">
                <div class="project-text w-100 my-auto text-center text-right">
                    <h4>${title}</h4>
                    <p class="mb-0">${description}</p>
                </div>
            </div>
        </div>
    </div>
`;
        try {
            this.replaceWith(newElement);
        } catch (error) {
            console.error('Failed to create new element:', error);
        }
    }
}

class RightItem extends HTMLBaseElement {
    constructor(...args) {
        super(...args);
    }

    connectedCallback() {
        this.setup();
    }

    childrenAvailableCallback() {
        this.parsed = true;
        const link = this.getAttribute("link");
        const image = this.getAttribute("image");
        const title = this.getAttribute("title");
        const description = this.innerHTML;

        let type = 'a';
        if (link === null || link === "") {
            type = 'dev'
        }

        const newElement = document.createElement(type);
        newElement.href = link;
        newElement.style.textDecoration = 'none';
        newElement.classList.add('row', 'gx-0', 'justify-content-center', 'bg-second');
        newElement.innerHTML = `
    <div class="col-6"><img alt="..." class="img-fluid" src="${image}"/></div>
    <div class="col-6">
        <div class="text-center h-100 project">
            <div class="d-flex h-100">
                <div class="project-text w-100 my-auto text-center text-left">
                    <h4>${title}</h4>
                    <p class="mb-0">${description}</p>
                </div>
            </div>
        </div>
    </div>
`;
        try {
            this.replaceWith(newElement);
        } catch (error) {
            console.error('Failed to create new element:', error);
        }

    }
}

customElements.define("header-nav", HeaderNav);
customElements.define("footer-nav", FooterNav);
customElements.define("featured-item", FeaturedItem);
customElements.define("left-item", LeftItem);
customElements.define("right-item", RightItem);

applyTheme(window.matchMedia('(prefers-color-scheme: dark)'));
hljs.debugMode();
hljs.highlightAll();
