hljs.debugMode();
hljs.highlightAll();

// Function for changing theme
function applyTheme(theme) {
    const activeTheme = theme.matches ? "dark code" : "light code";
    const inactiveTheme = theme.matches ? "light code" : "dark code";

    document.querySelector(`link[title="${activeTheme}"]`).removeAttribute("disabled");
    document.querySelector(`link[title="${inactiveTheme}"]`).setAttribute("disabled", "disabled");
}

const theme = window.matchMedia("(prefers-color-scheme: dark)");
theme.addEventListener('change', applyTheme);
applyTheme(theme);

document.addEventListener("DOMContentLoaded", function () {
    hljs.debugMode();
    hljs.highlightAll();
});
