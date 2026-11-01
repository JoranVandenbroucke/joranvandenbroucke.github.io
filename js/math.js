// Loaded only on pages that contain math. KaTeX needs Node to run at build time.
addEventListener('DOMContentLoaded', () => renderMathInElement(document.getElementById('output'), {
    leqno: false,
    fleqn: false,
    throwOnError: true,
    errorColor: '#cc0000',
    strict: 'error',
    output: 'html',
    trust: false,
    macros: {'\\f': '#1f(#2)'},
    delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '\\begin{equation}', right: '\\end{equation}', display: true},
        {left: '\\begin{align}', right: '\\end{align}', display: true},
        {left: '\\begin{alignat}', right: '\\end{alignat}', display: true},
        {left: '\\begin{gather}', right: '\\end{gather}', display: true},
        {left: '\\begin{CD}', right: '\\end{CD}', display: true},
        {left: '\\[', right: '\\]', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
    ],
}));
