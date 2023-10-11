hljs.debugMode();
hljs.highlightAll();

// Function for changing theme
function applyTheme(theme) {
    let activeTheme = theme.matches ? 'dark code' : 'light code';
    let inactiveTheme = theme.matches ? 'light code' : 'dark code';

    document.querySelector(`link[title="${activeTheme}"]`).removeAttribute('disabled');
    document.querySelector(`link[title="${inactiveTheme}"]`).setAttribute('disabled', 'disabled');
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (e.matches) {
        document
            .querySelector(`link[title="dark code"]`)
            .removeAttribute("disabled");
        document
            .querySelector(`link[title="light code"]`)
            .setAttribute("disabled", "disabled");
    } else {
        document
            .querySelector(`link[title="light code"]`)
            .removeAttribute("disabled");
        document
            .querySelector(`link[title="dark code"]`)
            .setAttribute("disabled", "disabled");
    }
});