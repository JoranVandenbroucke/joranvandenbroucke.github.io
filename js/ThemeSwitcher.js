hljs.debugMode();
hljs.highlightAll();

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
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