/* ============================================================
   Суші Шінобі — 3D animations + UI interactions
   ============================================================ */

(() => {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ----------------------------------------------------------
       Menu rendering — dish cards are built from data/menu.json so
       the owner can edit the menu via /admin/ without touching code.
       menuReady resolves once the cards are in the DOM, so the
       category filter can wait for them.
       ---------------------------------------------------------- */
    const esc = (s) => String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const menuReady = (async function renderMenu() {
        const grid = document.getElementById("menu-grid");
        if (!grid) return;
        let items = [];
        try {
            const r = await fetch("data/menu.json", { cache: "no-cache" });
            if (r.ok) {
                const data = await r.json();
                items = Array.isArray(data) ? data : (data.items || []);
            }
        } catch (e) { /* leave grid empty on failure */ }
        if (!items.length) return;

        const frag = document.createDocumentFragment();
        items.forEach(item => {
            const art = document.createElement("article");
            art.className = "dish" + (item.big ? " dish--big" : "");
            art.dataset.category = item.category || "";
            art.setAttribute("data-order-trigger", "");
            if (item.color) art.style.setProperty("--c", item.color);

            const visual = document.createElement("div");
            visual.className = "dish__visual" + (item.variant ? " dish__visual--" + item.variant : "");
            if (item.photo) {
                const p = item.photo;
                const src = (p.indexOf("http") === 0) ? p
                          : (p.charAt(0) === "/" ? p.slice(1) : "img/dishes/" + p);
                const img = document.createElement("img");
                img.src = src;
                img.alt = item.name || "";
                img.loading = "lazy";
                img.decoding = "async";
                img.addEventListener("error", () => img.remove(), { once: true });
                visual.appendChild(img);
            }

            const body = document.createElement("div");
            body.className = "dish__body";
            body.innerHTML =
                (item.tag ? `<span class="dish__tag">${esc(item.tag)}</span>` : "") +
                `<h3 class="dish__name">${esc(item.name)}</h3>` +
                (item.desc ? `<p class="dish__desc">${esc(item.desc)}</p>` : "") +
                `<div class="dish__foot"><span class="dish__price">${esc(item.price)}</span><span class="dish__weight">${esc(item.weight)}</span></div>`;

            art.appendChild(visual);
            art.appendChild(body);
            frag.appendChild(art);
        });
        grid.appendChild(frag);
    })();

    /* ----------------------------------------------------------
       CMS data injection — fetches data/*.json and patches the
       parts of the page the cafe owner can edit via /admin/.
       Wrapped in try/catch so a missing/broken file never breaks
       the rest of the site.
       ---------------------------------------------------------- */
    (async function cmsInject() {
        const readJson = async (path) => {
            try {
                const r = await fetch(path, { cache: 'no-cache' });
                if (!r.ok) return null;
                return await r.json();
            } catch { return null; }
        };

        const [site, hero] = await Promise.all([
            readJson('data/site.json'),
            readJson('data/hero.json')
        ]);

        if (site) {
            // Brand-wide bits that aren't tied to a specific location.
            // Per-location address/phone/hours are hardcoded in the HTML
            // so each tel: link points to the right city.
            const setText = (sel, val) => {
                if (val == null) return;
                document.querySelectorAll(sel).forEach(el => el.textContent = val);
            };
            const setHref = (sel, val) => {
                if (val == null) return;
                document.querySelectorAll(sel).forEach(el => el.setAttribute('href', val));
            };
            setText('[data-site="brand_tagline"]',  site.brand_tagline);
            setText('[data-site="rating"]',         site.rating ? '★ ' + site.rating : null);
            // Any explicit [data-site="phone"] spots still show the primary number
            setText('[data-site="phone"]',          site.primary_phone_display);
            setHref('[data-site="instagram_url"]',  site.instagram_url);
            setText('[data-site="instagram_handle"]', site.instagram_handle ? '@' + site.instagram_handle : null);

            // ── Render the two (or more) locations from site.locations ──
            const locs = Array.isArray(site.locations) ? site.locations : [];
            if (locs.length) {
                const tel = (p) => 'tel:' + String(p || '').replace(/\s+/g, '');
                const route = (q) => 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(q || '');
                const ICN_PIN   = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/></svg>';
                const ICN_PHONE = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 15.5c-1.3 0-2.6-.2-3.8-.6a1 1 0 0 0-1 .2l-2.2 2.2a15.1 15.1 0 0 1-6.6-6.6l2.2-2.2a1 1 0 0 0 .2-1A11 11 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1A17 17 0 0 0 20 21a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1Z"/></svg>';
                const ICN_CLOCK = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 11h-5v-2h3V6h2Z"/></svg>';
                const ICN_ARROW = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M5 12h12.17l-3.58-3.59L15 7l6 6-6 6-1.41-1.41L17.17 14H5z"/></svg>';

                // Contact cards
                const grid = document.getElementById('locations-grid');
                if (grid) {
                    grid.innerHTML = locs.map((l, i) => {
                        const tag = i === 0 ? 'Заклад №1 · головний' : 'Заклад №' + (i + 1);
                        const cityLine = esc(l.city) + (l.postal ? ', ' + esc(l.postal) : '');
                        return `<article class="location reveal is-in">
                            <header class="location__head">
                                <span class="location__tag">${esc(tag)}</span>
                                <h3 class="location__city">${esc(l.city)}</h3>
                            </header>
                            <ul class="location__list">
                                <li><span class="contact__icn">${ICN_PIN}</span><div><em>Адреса</em><b>${esc(l.address)}<br>${cityLine}</b></div></li>
                                <li><a href="${tel(l.phone)}"><span class="contact__icn">${ICN_PHONE}</span><div><em>Телефон</em><b>${esc(l.phone_display)}</b></div></a></li>
                                <li><span class="contact__icn">${ICN_CLOCK}</span><div><em>Графік</em><b>${esc(l.hours)}</b></div></li>
                            </ul>
                            <a class="location__route" href="${route(l.map_query)}" target="_blank" rel="noopener">Прокласти маршрут ${ICN_ARROW}</a>
                        </article>`;
                    }).join('');
                }

                // Order-modal location picker
                const modalLocs = document.getElementById('modal-locations');
                if (modalLocs) {
                    modalLocs.innerHTML = locs.map(l => `
                        <a href="${tel(l.phone)}" class="order-modal__loc">
                            <span class="order-modal__loc-city">${esc(l.city)}</span>
                            <span class="order-modal__loc-addr">${esc(l.address)}</span>
                            <span class="order-modal__loc-phone">${ICN_PHONE}${esc(l.phone_display)}</span>
                        </a>`).join('');
                }

                // Footer location columns
                const footerLocs = document.getElementById('footer-locations');
                if (footerLocs) {
                    footerLocs.innerHTML = locs.map(l => `
                        <div>
                            <h4>${esc(l.city)}</h4>
                            <span>${esc(l.address)}</span>
                            <a href="${tel(l.phone)}">${esc(l.phone_display)}</a>
                            <span>${esc(l.hours)}</span>
                        </div>`).join('');
                }
            }
        }

        if (hero) {
            const jp     = document.querySelector('[data-hero="title_jp"]');    if (jp)    jp.textContent     = hero.title_jp;
            const l1     = document.querySelector('[data-hero="title_line1"]');  if (l1)   l1.textContent     = hero.title_line1;
            const l2     = document.querySelector('[data-hero="title_line2"]');  if (l2)   l2.textContent     = hero.title_line2;
            const ds     = document.querySelector('[data-hero="description"]');  if (ds)   ds.textContent     = hero.description;
        }
    })();


    /* ----------------------------------------------------------
       Cookie consent + Google Maps gating
       Consent stored in localStorage as 'cookie-consent' = 'accept' | 'decline'.
       Map iframe is injected only after explicit accept.
       ---------------------------------------------------------- */
    (function cookieConsent() {
        const KEY = 'cookie-consent';
        const banner = document.getElementById('cookie-banner');
        const mapEl = document.getElementById('contact-map');
        const placeholder = document.getElementById('map-placeholder');
        const mapAcceptBtn = document.getElementById('map-accept');
        const mapTabs = document.getElementById('map-tabs');

        const consentGiven = () => {
            try { return localStorage.getItem(KEY) === 'accept'; } catch { return false; }
        };

        // Build/replace the iframe for the currently-selected location.
        function loadMap() {
            if (!mapEl) return;
            const src = mapEl.dataset.mapSrc;
            if (!src) return;
            let iframe = mapEl.querySelector('iframe');
            if (iframe) {
                if (iframe.src !== src) iframe.src = src;
            } else {
                iframe = document.createElement('iframe');
                iframe.title = 'Суші Шінобі — карта';
                iframe.loading = 'lazy';
                iframe.referrerPolicy = 'no-referrer-when-downgrade';
                iframe.src = src;
                mapEl.insertBefore(iframe, mapEl.firstChild);
            }
            if (placeholder && placeholder.parentNode) placeholder.remove();
        }

        const stored = (() => { try { return localStorage.getItem(KEY); } catch { return null; } })();

        if (stored === 'accept') {
            loadMap();
        } else if (!stored && banner) {
            // First visit — show banner after a short delay so it doesn't jump in
            setTimeout(() => banner.classList.add('is-visible'), 600);
        }

        if (banner) {
            banner.querySelectorAll('[data-cookie]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const choice = btn.dataset.cookie;
                    try { localStorage.setItem(KEY, choice); } catch {}
                    banner.classList.remove('is-visible');
                    if (choice === 'accept') loadMap();
                });
            });
        }

        // Visitor can opt-in to the map directly from the placeholder
        if (mapAcceptBtn) {
            mapAcceptBtn.addEventListener('click', () => {
                try { localStorage.setItem(KEY, 'accept'); } catch {}
                if (banner) banner.classList.remove('is-visible');
                loadMap();
            });
        }

        // Location tabs — switch which cafe is pinned on the map.
        if (mapTabs && mapEl) {
            mapTabs.querySelectorAll('.map-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    mapTabs.querySelectorAll('.map-tab').forEach(t => {
                        const active = t === tab;
                        t.classList.toggle('is-active', active);
                        t.setAttribute('aria-selected', active ? 'true' : 'false');
                    });
                    mapEl.dataset.mapSrc = tab.dataset.mapSrc;
                    // Only (re)load the iframe if the user already consented —
                    // otherwise the placeholder stays and the choice updates the
                    // pending src for when they accept.
                    if (consentGiven()) loadMap();
                });
            });
        }
    })();


    /* ----------------------------------------------------------
       Mobile nav
       ---------------------------------------------------------- */
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    if (burger && nav) {
        burger.addEventListener('click', () => {
            const open = nav.classList.toggle('is-open');
            burger.classList.toggle('is-open', open);
            document.body.style.overflow = open ? 'hidden' : '';
        });
        nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            nav.classList.remove('is-open');
            burger.classList.remove('is-open');
            document.body.style.overflow = '';
        }));
    }

    /* ----------------------------------------------------------
       Order modal — opens on any [data-order-trigger] click,
       closes on backdrop / [data-close] / Escape
       ---------------------------------------------------------- */
    const orderModal = document.getElementById('order-modal');
    if (orderModal) {
        let lastFocused = null;

        const openModal = (triggerEl) => {
            lastFocused = triggerEl || document.activeElement;
            orderModal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');
            // Focus the first location button after the open animation kicks in
            setTimeout(() => {
                const cta = orderModal.querySelector('.order-modal__loc');
                if (cta) cta.focus({ preventScroll: true });
            }, 350);
        };
        const closeModal = () => {
            orderModal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            if (lastFocused && typeof lastFocused.focus === 'function') {
                lastFocused.focus({ preventScroll: true });
            }
        };

        // Delegate clicks: any [data-order-trigger] anywhere on the page
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-order-trigger]');
            if (trigger) {
                // Don't intercept the explicit tel: link inside the modal itself
                if (orderModal.contains(trigger)) return;
                // Don't intercept if the user clicked the "Замовити" link nested elsewhere as <a href=tel>
                const tel = e.target.closest('a[href^="tel:"]');
                if (tel) return;
                e.preventDefault();
                openModal(trigger);
                return;
            }
            // Close handlers
            if (e.target.closest('[data-close]') && orderModal.contains(e.target)) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && orderModal.getAttribute('aria-hidden') === 'false') {
                closeModal();
            }
        });

        // After user taps a location's tel: link, close the modal so the
        // dialer takes over. Location buttons are rendered async, so delegate.
        orderModal.addEventListener('click', (e) => {
            if (e.target.closest('.order-modal__loc')) {
                setTimeout(closeModal, 250);
            }
        });
    }

    /* ----------------------------------------------------------
       Menu category filter
       ---------------------------------------------------------- */
    const filterBtns = document.querySelectorAll('.menu__filter');
    const menuGrid = document.getElementById('menu-grid');
    if (filterBtns.length && menuGrid) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const f = btn.dataset.filter;
                filterBtns.forEach(b => b.classList.toggle('is-active', b === btn));
                // Query live — cards are rendered asynchronously from menu.json
                menuGrid.querySelectorAll('.dish').forEach(d => {
                    const match = (f === 'all') || (d.dataset.category === f);
                    d.hidden = !match;
                });
                // Smooth scroll only if a category is selected (not "all")
                if (f !== 'all') {
                    const head = document.querySelector('.menu .section__head');
                    if (head) {
                        const y = head.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                }
            });
        });
    }

    /* ----------------------------------------------------------
       Reveal on scroll
       ---------------------------------------------------------- */
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('is-in');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-in'));
    }

    /* ----------------------------------------------------------
       Sakura petals (DOM particles)
       ---------------------------------------------------------- */
    const sakuraLayer = document.getElementById('sakura-layer');
    if (sakuraLayer && !prefersReduced && window.innerWidth >= 700) {
        const count = 10;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('span');
            p.className = 'sakura';
            const size = 8 + Math.random() * 14;
            p.style.left = Math.random() * 100 + '%';
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.animationDuration = (10 + Math.random() * 18) + 's';
            p.style.animationDelay = (-Math.random() * 20) + 's';
            p.style.setProperty('--drift', ((Math.random() - 0.5) * 200) + 'px');
            p.style.opacity = 0.4 + Math.random() * 0.5;
            sakuraLayer.appendChild(p);
        }
    }

    /* ----------------------------------------------------------
       Card tilt (hero menu cards)
       ---------------------------------------------------------- */
    if (!prefersReduced && window.matchMedia('(hover: hover)').matches) {
        document.querySelectorAll('[data-tilt]').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width;
                const y = (e.clientY - r.top) / r.height;
                const rx = (0.5 - y) * 6;
                const ry = (x - 0.5) * 8;
                el.style.transform = `translateY(-6px) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
                el.style.setProperty('--mx', (x * 100) + '%');
                el.style.setProperty('--my', (y * 100) + '%');
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }

    /* ----------------------------------------------------------
       3D parallax tilt for the Бушидо featured photo
       ---------------------------------------------------------- */
    if (!prefersReduced && window.matchMedia('(hover: hover)').matches) {
        document.querySelectorAll('[data-sets-tilt]').forEach(el => {
            const maxTilt = 8; // degrees
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width;
                const y = (e.clientY - r.top) / r.height;
                const rx = (0.5 - y) * maxTilt;
                const ry = (x - 0.5) * maxTilt;
                el.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
                el.style.setProperty('--gx', (x * 100) + '%');
                el.style.setProperty('--gy', (y * 100) + '%');
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }

    /* ----------------------------------------------------------
       Animated number counter (data-count → data-count-end)
       Triggers when the element scrolls into the viewport, or on
       page load if already visible.
       ---------------------------------------------------------- */
    function startCounter(el) {
        if (el._counted) return;
        el._counted = true;
        const end = parseFloat(el.dataset.countEnd);
        const start = parseFloat(el.dataset.count || '0');
        if (start === end) { el.textContent = String(end); return; }
        const suffix = el.dataset.countSuffix || '';
        const format = el.dataset.countFormat;
        const duration = 1600;
        const startTime = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3);
        const fmt = (n) => {
            const v = Math.round(n);
            if (format === 'space') {
                return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            }
            return v.toString();
        };
        function tick(now) {
            const t = Math.min((now - startTime) / duration, 1);
            const value = start + (end - start) * ease(t);
            el.textContent = fmt(value) + suffix;
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    if (!prefersReduced) {
        const counters = Array.from(document.querySelectorAll('[data-count-end]'));
        const checkCounters = () => {
            counters.forEach(el => {
                if (el._counted) return;
                const r = el.getBoundingClientRect();
                if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
                    startCounter(el);
                }
            });
        };
        checkCounters();
        window.addEventListener('scroll', checkCounters, { passive: true });
        window.addEventListener('resize', checkCounters);
    }

    /* ----------------------------------------------------------
       Three.js setup helpers
       ---------------------------------------------------------- */
    if (typeof THREE === 'undefined') {
        console.warn('Three.js failed to load; skipping 3D scenes.');
        return;
    }

    const IS_MOBILE = window.innerWidth < 700;
    const DPR_CAP = Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1 : 1.5);

    // Track tab visibility — pause all scenes when the tab is in the
    // background to save battery / CPU. Each scene checks `pageVisible`
    // in its tick function.
    let pageVisible = !document.hidden;
    document.addEventListener('visibilitychange', () => {
        pageVisible = !document.hidden;
    });

    /* ==========================================================
       SCENE 1 — Background: drifting particles + low-poly torus
       Skip on mobile to save battery and GPU.
       ========================================================== */
    (function backgroundScene() {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return;
        if (IS_MOBILE) { canvas.style.display = 'none'; return; }

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0a0a0c, 0.06);

        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.set(0, 0, 12);

        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setPixelRatio(DPR_CAP);

        /* Particle field --------------------------------------- */
        const particleCount = IS_MOBILE ? 60 : 150;
        const positions = new Float32Array(particleCount * 3);
        const speeds = new Float32Array(particleCount);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
            speeds[i] = 0.002 + Math.random() * 0.006;
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const pMat = new THREE.PointsMaterial({
            color: 0xd4af37,
            size: 0.05,
            transparent: true,
            opacity: 0.55,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const points = new THREE.Points(pGeo, pMat);
        scene.add(points);

        /* Red-tinted accent particles -------------------------- */
        const accentCount = IS_MOBILE ? 18 : 40;
        const accentPositions = new Float32Array(accentCount * 3);
        for (let i = 0; i < accentCount; i++) {
            accentPositions[i * 3]     = (Math.random() - 0.5) * 30;
            accentPositions[i * 3 + 1] = (Math.random() - 0.5) * 22;
            accentPositions[i * 3 + 2] = (Math.random() - 0.5) * 14;
        }
        const aGeo = new THREE.BufferGeometry();
        aGeo.setAttribute('position', new THREE.BufferAttribute(accentPositions, 3));
        const aMat = new THREE.PointsMaterial({
            color: 0xff4c5e,
            size: 0.08,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const accent = new THREE.Points(aGeo, aMat);
        scene.add(accent);

        /* Low-poly torus ambient sculpture --------------------- */
        const torusGeo = new THREE.TorusKnotGeometry(2.6, 0.35, 64, 8, 2, 3);
        const torusMat = new THREE.MeshBasicMaterial({
            color: 0xd4af37,
            wireframe: true,
            transparent: true,
            opacity: 0.10
        });
        const torus = new THREE.Mesh(torusGeo, torusMat);
        torus.position.set(6, -2, -6);
        scene.add(torus);

        /* Resize ----------------------------------------------- */
        function resize() {
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
        }
        resize();
        window.addEventListener('resize', resize);

        /* Mouse parallax --------------------------------------- */
        const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
        window.addEventListener('mousemove', (e) => {
            mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
        });
        window.addEventListener('scroll', () => {
            const s = window.scrollY * 0.0008;
            torus.position.y = -2 + Math.sin(s * 2) * 0.5;
        }, { passive: true });

        /* Animate ---------------------------------------------- */
        let last = performance.now();
        const FRAME_MS = 1000 / 30; // throttle bg to ~30fps (it's just ambient)
        let acc = 0;
        function tick(now) {
            if (!pageVisible) { requestAnimationFrame(tick); return; }
            const elapsed = now - last;
            last = now;
            acc += elapsed;
            if (acc < FRAME_MS) {
                requestAnimationFrame(tick);
                return;
            }
            const dt = Math.min(acc / 16.67, 3);
            acc = 0;

            mouse.x += (mouse.tx - mouse.x) * 0.04;
            mouse.y += (mouse.ty - mouse.y) * 0.04;

            const pos = pGeo.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                pos[i * 3 + 1] -= speeds[i] * dt;
                if (pos[i * 3 + 1] < -11) {
                    pos[i * 3 + 1] = 11;
                    pos[i * 3]     = (Math.random() - 0.5) * 30;
                }
            }
            pGeo.attributes.position.needsUpdate = true;

            points.rotation.y += 0.0005 * dt;
            accent.rotation.y -= 0.0008 * dt;
            accent.rotation.x += 0.0003 * dt;

            torus.rotation.x += 0.002 * dt;
            torus.rotation.y += 0.003 * dt;

            camera.position.x += (mouse.x * 1.4 - camera.position.x) * 0.04;
            camera.position.y += (-mouse.y * 1.0 - camera.position.y) * 0.04;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    })();


    /* ==========================================================
       SCENE 2 — Hero: rotating 3D sushi roll
       ========================================================== */
    (function heroScene() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
        camera.position.set(0, 1.4, 7.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setPixelRatio(DPR_CAP);
        renderer.outputEncoding = THREE.sRGBEncoding;

        /* Lights ----------------------------------------------- */
        scene.add(new THREE.AmbientLight(0xfff2dd, 0.35));

        const key = new THREE.DirectionalLight(0xfff1d8, 1.1);
        key.position.set(4, 6, 4);
        scene.add(key);

        const rim = new THREE.DirectionalLight(0xff4c5e, 0.7);
        rim.position.set(-5, 2, -3);
        scene.add(rim);

        const fill = new THREE.PointLight(0xd4af37, 0.8, 12);
        fill.position.set(0, -2, 3);
        scene.add(fill);

        /* Plate ------------------------------------------------ */
        const plateGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.08, 64);
        const plateMat = new THREE.MeshStandardMaterial({
            color: 0x0d0d10,
            roughness: 0.3,
            metalness: 0.7
        });
        const plate = new THREE.Mesh(plateGeo, plateMat);
        plate.position.y = -0.85;
        scene.add(plate);

        const plateRim = new THREE.Mesh(
            new THREE.TorusGeometry(2.2, 0.04, 16, 80),
            new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.9 })
        );
        plateRim.position.y = -0.81;
        plateRim.rotation.x = Math.PI / 2;
        scene.add(plateRim);

        /* Sushi roll factory ----------------------------------- */
        function makeRoll(fillingColor, accent) {
            const group = new THREE.Group();

            // Nori (outer dark wrap)
            const nori = new THREE.Mesh(
                new THREE.CylinderGeometry(0.55, 0.55, 0.55, 48, 1, false),
                new THREE.MeshStandardMaterial({
                    color: 0x1b1f1c,
                    roughness: 0.85,
                    metalness: 0.05
                })
            );
            group.add(nori);

            // Rice ring (slightly inside the nori, visible top and bottom)
            const rice = new THREE.Mesh(
                new THREE.CylinderGeometry(0.52, 0.52, 0.56, 48, 1, false),
                new THREE.MeshStandardMaterial({
                    color: 0xfdf4e0,
                    roughness: 0.95,
                    metalness: 0.0
                })
            );
            group.add(rice);

            // Filling core
            const fillingGroup = new THREE.Group();
            const fillingMat = new THREE.MeshStandardMaterial({
                color: fillingColor,
                roughness: 0.5,
                metalness: 0.1
            });
            const filling = new THREE.Mesh(
                new THREE.CylinderGeometry(0.18, 0.18, 0.58, 32),
                fillingMat
            );
            fillingGroup.add(filling);

            // Accent strip (avocado green) next to the salmon
            if (accent) {
                const a = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.07, 0.07, 0.58, 24),
                    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.6 })
                );
                a.position.x = 0.22;
                fillingGroup.add(a);
            }
            group.add(fillingGroup);

            // Sesame sprinkles on top + bottom
            const sesameMat = new THREE.MeshStandardMaterial({
                color: 0xfff5d8,
                roughness: 0.4,
                metalness: 0.2
            });
            const sesameGeo = new THREE.SphereGeometry(0.02, 6, 6);
            for (let i = 0; i < 4; i++) {
                const s = new THREE.Mesh(sesameGeo, sesameMat);
                const a = Math.random() * Math.PI * 2;
                const r = Math.random() * 0.45;
                s.position.set(Math.cos(a) * r, 0.29, Math.sin(a) * r);
                group.add(s);
            }

            // Default orientation: lying on its side so the spiral faces camera.
            group.rotation.x = Math.PI / 2;
            return group;
        }

        /* Six rolls arranged in a ring -------------------------- */
        const ringGroup = new THREE.Group();
        scene.add(ringGroup);

        const fillingPalette = [
            { core: 0xfa8072, accent: 0x6aa86a }, // salmon + avocado
            { core: 0xe8a456, accent: null      }, // tempura
            { core: 0xfa8072, accent: 0xf4b8a0 }, // philly
            { core: 0xc8362d, accent: 0x6aa86a }, // spicy tuna
            { core: 0xfa8072, accent: 0x6aa86a },
            { core: 0xe8a456, accent: 0xf4b8a0 }
        ];

        const radius = 1.45;
        const rolls = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const p = fillingPalette[i];
            const roll = makeRoll(p.core, p.accent);
            roll.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
            // Tilt the roll so its circular face points slightly outward
            roll.rotation.y = -angle + Math.PI / 2;
            ringGroup.add(roll);
            rolls.push(roll);
        }

        /* Center hero roll (larger, with garnish) -------------- */
        const heroRoll = makeRoll(0xfa8072, 0x6aa86a);
        heroRoll.scale.set(1.6, 1.6, 1.6);
        // Garnish: a tiny ginger curl
        const garnish = new THREE.Mesh(
            new THREE.TorusGeometry(0.18, 0.04, 12, 24, Math.PI * 1.3),
            new THREE.MeshStandardMaterial({ color: 0xf6c79b, roughness: 0.6 })
        );
        garnish.position.set(0, 0.4, 0);
        garnish.rotation.z = Math.PI / 6;
        heroRoll.add(garnish);
        scene.add(heroRoll);

        /* Resize ----------------------------------------------- */
        function resize() {
            const r = canvas.getBoundingClientRect();
            const size = Math.max(r.width, 1);
            renderer.setSize(size, size, false);
            camera.aspect = 1;
            camera.updateProjectionMatrix();
        }
        resize();

        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        /* Pointer parallax ------------------------------------ */
        const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
        canvas.addEventListener('pointermove', (e) => {
            const r = canvas.getBoundingClientRect();
            pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 0.6;
            pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 0.6;
        });
        canvas.addEventListener('pointerleave', () => {
            pointer.tx = 0; pointer.ty = 0;
        });

        /* Animate --------------------------------------------- */
        let last = performance.now();
        let running = true;
        const visObserver = new IntersectionObserver(([entry]) => {
            running = entry.isIntersecting;
            if (running) { last = performance.now(); requestAnimationFrame(tick); }
        }, { threshold: 0.05 });
        visObserver.observe(canvas);

        function tick(now) {
            if (!running) return;
            if (!pageVisible) { requestAnimationFrame(tick); return; }
            const dt = Math.min((now - last) / 16.67, 3);
            last = now;

            pointer.x += (pointer.tx - pointer.x) * 0.06;
            pointer.y += (pointer.ty - pointer.y) * 0.06;

            ringGroup.rotation.y += 0.006 * dt;
            ringGroup.rotation.x = pointer.y * 0.4;
            ringGroup.position.y = Math.sin(now * 0.0012) * 0.08;

            rolls.forEach((r, i) => {
                r.rotation.z += (0.01 + i * 0.002) * dt;
            });

            heroRoll.rotation.z += 0.004 * dt;
            heroRoll.rotation.y = pointer.x * 0.6 + Math.sin(now * 0.0008) * 0.2;
            heroRoll.position.y = Math.sin(now * 0.0015) * 0.1;

            plate.rotation.y += 0.001 * dt;

            renderer.render(scene, camera);
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    })();


    /* ==========================================================
       SCENE 3 — About section: floating chopsticks + soy droplets
       Runs only while the About section is in the viewport.
       ========================================================== */
    (function aboutScene() {
        const canvas = document.getElementById('about-canvas');
        if (!canvas || prefersReduced) return;
        if (IS_MOBILE) { canvas.style.display = 'none'; return; }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.set(0, 0, 10);

        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));

        // Lights — single directional + ambient is enough for the scale of this scene
        scene.add(new THREE.AmbientLight(0xffeacc, 0.55));
        const key = new THREE.DirectionalLight(0xfff1d8, 0.85);
        key.position.set(3, 4, 5);
        scene.add(key);

        // Chopsticks — a thin tapered cone group, in pairs
        function makeChopstickPair(color) {
            const group = new THREE.Group();
            const mat = new THREE.MeshStandardMaterial({
                color, roughness: 0.55, metalness: 0.1
            });
            for (let i = 0; i < 2; i++) {
                const stick = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.025, 0.06, 2.2, 8),
                    mat
                );
                stick.rotation.z = (i === 0 ? -0.12 : 0.12);
                stick.position.x = (i === 0 ? -0.10 : 0.10);
                group.add(stick);
            }
            return group;
        }

        // Soy droplet — small sphere
        function makeDroplet(color) {
            const mat = new THREE.MeshStandardMaterial({
                color, roughness: 0.2, metalness: 0.3
            });
            const geo = new THREE.SphereGeometry(0.18, 16, 12);
            return new THREE.Mesh(geo, mat);
        }

        // Sesame seed — tiny flat ellipsoid
        function makeSesame() {
            const mat = new THREE.MeshStandardMaterial({
                color: 0xfff5d8, roughness: 0.4, metalness: 0.2
            });
            const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), mat);
            m.scale.set(1, 0.45, 1.7);
            return m;
        }

        const sceneObjects = [];

        const isMobile = window.innerWidth < 700;
        const chopstickCount = isMobile ? 2 : 3;
        const dropCount      = isMobile ? 3 : 4;
        const sesameCount    = isMobile ? 6 : 9;

        const stickColors = [0xd4af37, 0xe8a456, 0x8b5a2b, 0xb8763d];
        for (let i = 0; i < chopstickCount; i++) {
            const pair = makeChopstickPair(stickColors[i]);
            pair.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4);
            pair.rotation.z = Math.random() * Math.PI;
            pair.rotation.x = Math.random() * 0.6;
            scene.add(pair);
            sceneObjects.push({ mesh: pair, rotSpeed: (Math.random() - 0.5) * 0.006, floatPhase: Math.random() * Math.PI * 2, floatSpeed: 0.4 + Math.random() * 0.6 });
        }
        const dropColors = [0x6b3416, 0x5a2810, 0x7a3a18];
        for (let i = 0; i < dropCount; i++) {
            const d = makeDroplet(dropColors[i % dropColors.length]);
            d.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4);
            scene.add(d);
            sceneObjects.push({ mesh: d, rotSpeed: (Math.random() - 0.5) * 0.02, floatPhase: Math.random() * Math.PI * 2, floatSpeed: 0.6 + Math.random() * 0.8 });
        }
        for (let i = 0; i < sesameCount; i++) {
            const s = makeSesame();
            s.position.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 5);
            s.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            scene.add(s);
            sceneObjects.push({ mesh: s, rotSpeed: (Math.random() - 0.5) * 0.025, floatPhase: Math.random() * Math.PI * 2, floatSpeed: 0.8 + Math.random() * 1.2 });
        }

        function resize() {
            const r = canvas.getBoundingClientRect();
            if (r.width < 1) return;
            renderer.setSize(r.width, r.height, false);
            camera.aspect = r.width / r.height;
            camera.updateProjectionMatrix();
        }
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        // Only render when the section is on screen
        let running = false;
        const visObserver = new IntersectionObserver(([entry]) => {
            running = entry.isIntersecting;
            if (running) requestAnimationFrame(tick);
        }, { threshold: 0.05 });
        visObserver.observe(canvas);

        // Throttle to ~40fps to keep CPU/GPU light
        let last = performance.now();
        const FRAME_MS = 1000 / 40;
        let acc = 0;
        function tick(now) {
            if (!running) return;
            if (!pageVisible) { requestAnimationFrame(tick); return; }
            acc += now - last;
            last = now;
            if (acc < FRAME_MS) {
                requestAnimationFrame(tick);
                return;
            }
            const dt = Math.min(acc / 16.67, 3);
            acc = 0;
            const t = now * 0.001;

            sceneObjects.forEach((o) => {
                o.mesh.rotation.x += o.rotSpeed * dt;
                o.mesh.rotation.y += o.rotSpeed * 0.7 * dt;
                o.mesh.position.y += Math.sin(t * o.floatSpeed + o.floatPhase) * 0.005;
            });

            renderer.render(scene, camera);
            requestAnimationFrame(tick);
        }
    })();

})();
