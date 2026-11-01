const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const after = (element, callback) => setTimeout(callback, parseFloat(getComputedStyle(element).transitionDuration) * 1000);

// Navbar: solid background once scrolled.
const nav = $('#mainNav');
const shrinkNav = () => nav.classList.toggle('navbar-shrink', scrollY > 0);
addEventListener('scroll', shrinkNav, {passive: true});
shrinkNav();

// Navbar: animated mobile menu.
const menu = $('#navbarResponsive');
const toggler = $('.navbar-toggler');

function toggleMenu() {
    const open = !menu.classList.contains('show');
    menu.style.height = open ? '0' : `${menu.offsetHeight}px`;
    menu.classList.remove('collapse', 'show');
    menu.classList.add('collapsing');
    menu.offsetHeight; // start the transition from the height set above
    menu.style.height = open ? `${menu.scrollHeight}px` : '';
    toggler.setAttribute('aria-expanded', open);
    after(menu, () => {
        menu.classList.replace('collapsing', 'collapse');
        menu.classList.toggle('show', open);
        menu.style.height = '';
    });
}

toggler.addEventListener('click', toggleMenu);
$$('.nav-link', menu).forEach(link => link.addEventListener('click', () => {
    if (getComputedStyle(toggler).display !== 'none') toggleMenu();
}));

// Navbar: highlight the section in view.
const spy = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    $$('.nav-link', menu).forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
}), {rootMargin: '0px 0px -40%'});
$$('.nav-link', menu).forEach(link => {
    const section = document.getElementById(link.hash.slice(1));
    if (section) spy.observe(section);
});

// Portfolio tabs.
$$('[data-tab]').forEach(tab => tab.addEventListener('click', () => {
    const current = $('.tab-pane.active');
    const next = document.getElementById(tab.dataset.tab);
    if (current === next) return;
    $$('[data-tab]').forEach(other => {
        other.classList.toggle('active', other === tab);
        other.setAttribute('aria-selected', other === tab);
    });
    current.classList.remove('show');
    after(current, () => {
        current.classList.remove('active');
        next.classList.add('active');
        next.offsetHeight;
        next.classList.add('show');
    });
}));

// Project carousels: Bootstrap's markup and CSS, driven from here.
$$('.carousel').forEach(carousel => {
    const items = $$('.carousel-item', carousel);
    const dots = $$('.carousel-indicators button', carousel);
    let index = 0, sliding = false, hovered = false, touchX = null;

    function show(target, forward = target > index) {
        target = (target + items.length) % items.length;
        if (sliding || target === index) return;
        sliding = true;
        const from = items[index], to = items[target];
        const [enter, leave] = forward ? ['carousel-item-next', 'carousel-item-start'] : ['carousel-item-prev', 'carousel-item-end'];
        to.classList.add(enter);
        to.offsetHeight;
        from.classList.add(leave);
        to.classList.add(leave);
        dots[index].classList.remove('active');
        dots[target].classList.add('active');
        index = target;
        after(from, () => {
            from.classList.remove('active', leave);
            to.classList.remove(enter, leave);
            to.classList.add('active');
            sliding = false;
            $('img', items[(index + 1) % items.length]).loading = 'eager'; // have the next slide ready
        });
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    $('.carousel-control-prev', carousel).addEventListener('click', () => show(index - 1, false));
    $('.carousel-control-next', carousel).addEventListener('click', () => show(index + 1, true));
    carousel.addEventListener('keydown', ({key}) => {
        if (key === 'ArrowLeft') show(index - 1, false);
        if (key === 'ArrowRight') show(index + 1, true);
    });
    carousel.addEventListener('mouseenter', () => hovered = true);
    carousel.addEventListener('mouseleave', () => hovered = false);
    carousel.addEventListener('touchstart', ({touches}) => touchX = touches[0].clientX, {passive: true});
    carousel.addEventListener('touchend', ({changedTouches}) => {
        const distance = changedTouches[0].clientX - touchX;
        if (Math.abs(distance) > 40) show(index + (distance < 0 ? 1 : -1), distance < 0);
    });
    setInterval(() => {
        if (!hovered && !document.hidden) show(index + 1, true);
    }, 5000);
});

// Blog feedback form: opens the visitor's mail client.
const form = $('#EmailForm');
form?.addEventListener('submit', event => {
    event.preventDefault();
    const {name, emailAddress, subject, message} = form.elements;
    const body = `Name: ${name.value}\nEmail: ${emailAddress.value}\nPage URL: ${location.href}\n`
        + `-- Please don't remove the text above. --\n\nMessage:\n\n${message.value}`;
    location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject.value)}&body=${encodeURIComponent(body)}`;
});
