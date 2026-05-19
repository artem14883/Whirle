(function () {
    'use strict';

    const NAV_LINKS = [
        { key: 'features', label: 'Features', href: 'features.html' },
        { key: 'pricing', label: 'Pricing', href: 'pricing.html' },
        { key: 'integrations', label: 'Integrations', href: 'integrations.html' },
        { key: 'learn', label: 'Learn', href: 'learn.html' }
    ];

    const FOOTER_INFO = [
        { label: 'Features', href: 'features.html' },
        { label: 'Pricing', href: 'pricing.html' },
        { label: 'Blog', href: 'blog.html' },
        { label: 'Support', href: 'support.html' },
        { label: 'Terms & Conditions', href: 'terms.html' },
        { label: 'Privacy Policy', href: 'privacy.html' }
    ];

    const FOOTER_ADMIN = [
        { label: 'Style Guide', href: 'style-guide.html' },
        { label: 'Licenses', href: 'licenses.html' },
        { label: 'Instructions', href: 'instructions.html' },
        { label: 'Changelog', href: 'changelog.html' },
        { label: 'Password', href: 'password.html' },
        { label: '404', href: '404.html' }
    ];

    function buildHeader(active) {
        const links = NAV_LINKS.map(function (l) {
            const cls = 'header__link' + (l.key === active ? ' header__link--active' : '');
            return '<a href="' + l.href + '" class="' + cls + '">' + l.label + '</a>';
        }).join('');

        return '' +
            '<header class="header">' +
            '  <div class="container">' +
            '    <div class="header__row">' +
            '      <div class="header__left">' +
            '        <a href="index.html" class="header__logo" aria-label="Whirl home">' +
            '          <img src="img/logo.svg" alt="Whirl">' +
            '        </a>' +
            '        <nav class="header__nav" id="header-nav" aria-label="Primary">' + links +
            '          <div class="header__nav-cta">' +
            '            <a href="signin.html" class="header__nav-sign">Sign in</a>' +
            '            <a href="demo.html" class="header__nav-book">Book a demo</a>' +
            '          </div>' +
            '        </nav>' +
            '      </div>' +
            '      <div class="header__right">' +
            '        <a href="signin.html" class="header__sign">Sign in</a>' +
            '        <a href="demo.html" class="header__book button button-s">Book a demo</a>' +
            '      </div>' +
            '      <button class="header__toggle" id="menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="header-nav">' +
            '        <span></span><span></span><span></span>' +
            '      </button>' +
            '    </div>' +
            '  </div>' +
            '</header>';
    }

    function buildFooter() {
        const info = FOOTER_INFO.map(function (l) {
            return '<a href="' + l.href + '" class="footer__link">' + l.label + '</a>';
        }).join('');
        const admin = FOOTER_ADMIN.map(function (l) {
            return '<a href="' + l.href + '" class="footer__link">' + l.label + '</a>';
        }).join('');
        const year = new Date().getFullYear();

        return '' +
            '<footer class="footer">' +
            '  <div class="container">' +
            '    <div class="footer__main">' +
            '      <div class="footer__col footer__col--01">' +
            '        <a href="index.html" class="footer__logo" aria-label="Whirl home">' +
            '          <img src="img/logo.svg" alt="Whirl">' +
            '        </a>' +
            '        <p class="footer__text">Built by <a href="https://nikolaibain.com" target="_blank" rel="noopener">Nikolai Bain</a>.</p>' +
            '        <p class="footer__text">Powered by <a href="https://webflow.com" target="_blank" rel="noopener">Webflow</a>.</p>' +
            '      </div>' +
            '      <div class="footer__col footer__col--02">' +
            '        <h6 class="footer__title">Info</h6>' +
            '        <nav class="footer__nav" aria-label="Info">' + info + '</nav>' +
            '      </div>' +
            '      <div class="footer__col footer__col--03">' +
            '        <h6 class="footer__title">Admin</h6>' +
            '        <nav class="footer__nav" aria-label="Admin">' + admin + '</nav>' +
            '      </div>' +
            '      <div class="footer__col footer__col--04">' +
            '        <h6 class="footer__title">Newsletter</h6>' +
            '        <p class="footer__paragraph">Sign up for the latest news, company insights, and Whirl updates.</p>' +
            '        <form action="#" class="footer__form" id="newsletter-form" novalidate>' +
            '          <div class="footer__form-row">' +
            '            <label class="visually-hidden" for="newsletter-email">Your email</label>' +
            '            <input type="email" id="newsletter-email" name="email" placeholder="Your email" class="footer__input" required>' +
            '            <button type="submit" class="footer__button" aria-label="Subscribe">' +
            '              <img src="img/arrow.svg" alt="">' +
            '            </button>' +
            '          </div>' +
            '          <p class="footer__form-message" id="newsletter-message" role="status" aria-live="polite"></p>' +
            '        </form>' +
            '      </div>' +
            '    </div>' +
            '    <div class="footer__bottom">' +
            '      <p class="footer__text">© ' + year + ' Whirl. All Rights Reserved. Illustrations by <a href="https://streamlinehq.com" target="_blank" rel="noopener">Streamline</a>.</p>' +
            '      <div class="footer__social">' +
            '        <a href="https://twitter.com" target="_blank" rel="noopener" class="footer__social-link" aria-label="Twitter">' +
            '          <img src="img/twitter.svg" alt="">' +
            '        </a>' +
            '        <a href="https://linkedin.com" target="_blank" rel="noopener" class="footer__social-link" aria-label="LinkedIn">' +
            '          <img src="img/link.svg" alt="">' +
            '        </a>' +
            '        <a href="https://facebook.com" target="_blank" rel="noopener" class="footer__social-link" aria-label="Facebook">' +
            '          <img src="img/fb.svg" alt="">' +
            '        </a>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '</footer>';
    }

    function injectLayout() {
        const headerSlot = document.querySelector('[data-include="header"]');
        if (headerSlot) {
            const active = headerSlot.getAttribute('data-active') || '';
            headerSlot.outerHTML = buildHeader(active);
        }
        const footerSlot = document.querySelector('[data-include="footer"]');
        if (footerSlot) {
            footerSlot.outerHTML = buildFooter();
        }
    }

    function initMenu() {
        const toggle = document.getElementById('menu-toggle');
        const nav = document.getElementById('header-nav');
        if (!toggle || !nav) return;

        function close() {
            nav.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Open menu');
            document.body.classList.remove('no-scroll');
        }
        function open() {
            nav.classList.add('active');
            toggle.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Close menu');
            document.body.classList.add('no-scroll');
        }

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            if (nav.classList.contains('active')) close(); else open();
        });

        nav.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', close);
        });

        document.addEventListener('click', function (e) {
            if (!nav.classList.contains('active')) return;
            if (nav.contains(e.target) || toggle.contains(e.target)) return;
            close();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 991) close();
        });
    }

    function initNewsletter() {
        const form = document.getElementById('newsletter-form');
        if (!form) return;
        const input = form.querySelector('input[type="email"]');
        const message = form.querySelector('#newsletter-message');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!input.value || !input.checkValidity()) {
                message.textContent = 'Please enter a valid email address.';
                message.classList.remove('footer__form-message--ok');
                message.classList.add('footer__form-message--error');
                input.focus();
                return;
            }
            message.textContent = 'Thanks! You are subscribed.';
            message.classList.remove('footer__form-message--error');
            message.classList.add('footer__form-message--ok');
            form.reset();
        });
    }

    function initSmoothAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                const id = a.getAttribute('href');
                if (!id || id === '#') return;
                const target = document.querySelector(id);
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    function initGenericForm() {
        const forms = document.querySelectorAll('form[data-handler]');
        forms.forEach(function (form) {
            const status = form.querySelector('[data-form-status]');
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                if (!form.checkValidity()) {
                    if (status) {
                        status.textContent = 'Please complete the required fields.';
                        status.className = 'form__status form__status--error';
                    }
                    form.reportValidity();
                    return;
                }
                if (status) {
                    status.textContent = form.getAttribute('data-success') || 'Thanks! We will be in touch shortly.';
                    status.className = 'form__status form__status--ok';
                }
                form.reset();
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        injectLayout();
        initMenu();
        initNewsletter();
        initSmoothAnchors();
        initGenericForm();
    });
})();
