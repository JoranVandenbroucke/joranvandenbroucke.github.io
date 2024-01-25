hljs.debugMode();
hljs.highlightAll();

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


window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    applyTheme(e);
});

applyTheme(window.matchMedia('(prefers-color-scheme: dark)'));