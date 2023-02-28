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
    var navbarShrink = function () {
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

function loadMarkDown(directoin) {
    var converter = new showdown.Converter({tables: true, strikethrough: true});

    var xhr = new XMLHttpRequest();
    xhr.open('GET', directoin, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var markdown = xhr.responseText;
            document.getElementById("output").innerHTML = converter.makeHtml(markdown);

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