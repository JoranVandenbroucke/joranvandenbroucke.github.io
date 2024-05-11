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
