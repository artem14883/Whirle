/* ============================================================
   Суші Шінобі — 3D animations + UI interactions
   ============================================================ */

(() => {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ----------------------------------------------------------
       Photo library — real sushi photography (Unsplash CDN, free
       for commercial use). Each card gets a photo matched to its
       category and name keywords. If the photo fails to load,
       the underlying coloured CSS visual stays visible.
       ---------------------------------------------------------- */
    // All URLs pulled from real Unsplash category searches so each
    // photo actually depicts food of the matching kind.
    const U = id => `https://images.unsplash.com/photo-${id}?w=480&h=480&fit=crop&auto=format&q=70`;
    const PHOTO = {
        // Sushi platters — for SETS
        setMixed:    U('1764183122524-974ccfb709fd'),
        setDragon:   U('1774635804786-5ebb8f88dcdf'),
        setSalmon:   U('1763647756796-af9230245bf8'),
        setBlack:    U('1770164520620-a5612325635b'),
        setGold:     U('1770966666358-37668256a29f'),
        setExtra1:   U('1663334038419-71e6f82e333f'),
        setExtra2:   U('1736885978380-8d7d9f7d7880'),

        // Sushi rolls — from sushi-roll search
        rollSalmon:  U('1579871494447-9811cf80d66c'),
        rollPhilly:  U('1628676825875-031ad212c31e'),
        rollDragon:  U('1659549307726-799b5dc4e7b9'),
        rollTuna:    U('1579584425555-c3ce17fd4351'),
        rollSpicy:   U('1629793981691-feaf80ccb0da'),
        rollEel:     U('1712725213572-443fe866a69a'),
        rollShrimp:  U('1774635812959-bd5cbaa9e496'),
        rollCheese:  U('1609158987097-ce23ef9da2fc'),
        rollCrab:    U('1629296334504-9b072456cab5'),
        rollGreen:   U('1599569955274-e46bfc0cef6a'),
        spring:      U('1689821675939-8b7bea53b32b'),
        rolDog:      U('1640057661469-2943a8ed9ad0'),

        // Baked / hot rolls
        baked:       U('1657895116431-cc32a587af2c'),
        tempura:     U('1774635812959-bd5cbaa9e496'),
        burger:      U('1675870792385-76389bc93f75'),
        palychka:    U('1726824863411-615d1922e515'),
        onigiri:     U('1615361200141-f45040f367be'),

        // Maki rolls
        makiSalmon:  U('1599569958048-2051d3f9a3e9'),
        makiTuna:    U('1555341748-a9d443dc3c14'),
        makiVeg:     U('1548907368-35e5ea8cbc8a'),
        makiEel:     U('1558985212-92c2ff0b56e7'),

        // Nigiri
        nigiriSalmon: U('1710945301326-d60727e4833a'),
        nigiriShrimp: U('1562707786-7d2b807961c4'),
        nigiriEel:    U('1637074930269-089fde202b57'),

        // Poke / sashimi bowls
        bowlSalmon:   U('1597958792579-bd3517df6399'),
        bowlShrimp:   U('1604259597308-5321e8e4789c'),
        sashimi:      U('1670816978291-a5cf23d87968'),
        tartar:       U('1604259596863-57153177d40b'),

        // Noodles
        udon:         U('1700323861852-069271b695b3'),
        yakisoba:     U('1599314250681-8e05113e0e1b'),
        funchoza:     U('1632381151399-cf5877736890'),
        tepan:        U('1700323467210-9f9019cdbfd4'),

        // Sushi donuts
        donut:        U('1640057661469-2943a8ed9ad0'),

        // Snacks
        chuka:        U('1606471191009-63994c53433b'),
        cheese:       U('1564834724105-918b73d1b9e0'),
        shrimpTemp:   U('1759823338930-7996c1787c3b'),
        nuggets:      U('1619881590738-a111d176d906'),
        nuggets2:     U('1627662168223-7df99068099a'),
        onion:        U('1639024471283-03518883512d'),
        onion2:       U('1637231854063-dcc3b5c4e8aa'),
        fries:        U('1630384060421-cb20d0e0649d'),
        friesAlt:     U('1585109649139-366815a0d713'),
        balls:        U('1541592106381-b31e9677c0e5')
    };

    // Map of exact dish names → local photo file (in img/dishes/).
    // The user drops a photo here with the matching filename and the site
    // automatically picks it up. If the file is missing, we fall back to
    // the Unsplash stock photo.
    const LOCAL = {
        // Sets
        'Дракон Сет': 'dragon-set.jpg',
        'Преміум': 'premium-set.jpg',
        'Філадельфія Сет': 'philadelphia-set.jpg',
        'Блек': 'black-set.jpg',
        'Сет Голд': 'gold-set.jpg',
        'Лосось Сет': 'losos-set.jpg',
        'Токіо': 'tokio-set.jpg',
        'Фрі Сет': 'fri-set.jpg',
        '50 / 50': '5050-set.jpg',
        'Гриль Сет': 'gril-set.jpg',
        'Триніті': 'triniti-set.jpg',

        // Rolls
        'Філадельфія': 'philadelphia.jpg',
        'Філадельфія Класік': 'philadelphia-classic.jpg',
        'Філадельфія Чедер': 'philadelphia-cheddar.jpg',
        'Філадельфія Подвійний Сир': 'philadelphia-double-cheese.jpg',
        'Фурі Рол': 'furi.jpg',
        'Чедер Рол': 'cheddar-roll.jpg',
        'Чорний Дракон': 'black-dragon.jpg',
        'Червоний Дракон': 'red-dragon.jpg',
        'Зелений Дракон': 'green-dragon.jpg',
        'Тигровий Дракон': 'tiger-dragon.jpg',
        'Чіз Рол': 'chiz-roll.jpg',
        'Вугор з Лососем': 'vugor-losos.jpg',
        'Грін Рол': 'grin-roll.jpg',
        'Даба Лосось': 'daba-losos.jpg',
        'Еббі Кранч': 'ebbi-kranch.jpg',
        'Ебі Чедер': 'ebi-cheddar.jpg',
        'Ебі Чіз': 'ebi-chiz.jpg',
        'Каліфорнія': 'california.jpg',
        'Кампай Сяке': 'kampay-syake.jpg',
        'Кіро': 'kiro.jpg',
        'Краб Рол': 'krab-roll.jpg',
        'Магуро Тунець': 'maguro-tunets.jpg',
        'Потрійна Креветка': 'potriyna-krevetka.jpg',
        'Спайсі': 'spicy.jpg',
        'Тобіко': 'tobiko.jpg',
        'Рол-Дог з Куркою': 'rol-dog-kurka.jpg',
        'Рол-Дог з Тунцем': 'rol-dog-tunets.jpg',
        'Рол-Дог з Лососем': 'rol-dog-losos.jpg',
        'Спрінг Сніжний': 'spring-snijniy.jpg',
        'Спрінг з Креветкою': 'spring-krevetka.jpg',
        'Спрінг з Лососем': 'spring-losos.jpg',
        'Спрінг Туна-Лосось': 'spring-tuna-losos.jpg',

        // Hot
        'Запечений з Лососем': 'zapecheny-losos.jpg',
        'Запечений з Тунцем': 'zapecheny-tunets.jpg',
        'Панко': 'panko.jpg',
        'Темпура': 'tempura.jpg',
        'Тунець Хот': 'tunets-hot.jpg',
        'Філадельфія Хот': 'philadelphia-hot.jpg',
        'Чікен Чіз': 'chicken-chiz.jpg',
        'Онігірі Фрі Креветка': 'onigiri-krevetka.jpg',
        'Онігірі Фрі Лосось': 'onigiri-losos.jpg',
        'Онігірі Фрі Тунець': 'onigiri-tunets.jpg',
        'Паличка Фрі з Крабом': 'palychka-krab.jpg',
        'Паличка Фрі з Лососем': 'palychka-losos.jpg',
        'Паличка Фрі з Креветкою': 'palychka-krevetka.jpg',
        'Бургер з Креветкою': 'burger-krevetka.jpg',
        'Бургер з Тунцем': 'burger-tunets.jpg',
        'Бургер з Лососем': 'burger-losos.jpg',

        // Maki
        'Макі Креветка': 'maki-krevetka.jpg',
        'Макі Авокадо': 'maki-avokado.jpg',
        'Макі Чука': 'maki-chuka.jpg',
        'Макі Тунець': 'maki-tunets.jpg',
        'Макі Огірок': 'maki-ogirok.jpg',
        'Макі Лосось': 'maki-losos.jpg',
        'Макі Копчений': 'maki-kopcheny.jpg',
        'Макі Вугор': 'maki-vugor.jpg',

        // Nigiri
        'Нігірі Вугор': 'nigiri-vugor.jpg',
        'Нігірі Лосось': 'nigiri-losos.jpg',
        'Нігірі Креветка': 'nigiri-krevetka.jpg',

        // Bowls & tartars
        'Сашимі Мікс': 'sashimi-mix.jpg',
        'Боул з Креветками': 'bowl-krevetka.jpg',
        'Боул з Лососем': 'bowl-losos.jpg',
        'Тартар Вугор з Лососем': 'tartar-vugor-losos.jpg',
        'Тартар з Креветкою': 'tartar-krevetka.jpg',

        // Noodles
        'Тепаньяки з Куркою': 'tepanyaki-kurka.jpg',
        'Удон з Куркою': 'udon-kurka.jpg',
        'Удон з Морепродуктами': 'udon-moreprodukti.jpg',
        'Удон Чікен Спайсі': 'udon-chicken-spicy.jpg',
        'Фунчоза': 'funchoza.jpg',
        'Харусаме з Морепродуктами': 'harusame-moreprodukti.jpg',
        'Харусаме з Куркою': 'harusame-kurka.jpg',
        'Якісоба з Рисом': 'yakisoba.jpg',

        // Donuts
        'Суші Пончик з Лососем': 'ponchik-losos.jpg',
        'Суші Пончик з Креветкою': 'ponchik-krevetka.jpg',
        'Суші Пончик з Вугрем': 'ponchik-vugor.jpg',
        'Суші Пончик з Чедером': 'ponchik-cheddar.jpg',
        'Суші Пончик з Тунцем': 'ponchik-tunets.jpg',
        'Фрі-Пончик з Куркою': 'ponchik-kurka.jpg',

        // Snacks
        'Салат Чука': 'salat-chuka.jpg',
        'Сир Брі': 'syr-bri.jpg',
        'Креветки Темпура': 'krevetka-tempura.jpg',
        'Курячі Стріпси': 'kuriachi-stripsi.jpg',
        'Нагетси': 'nagetsi.jpg',
        'Сирні Стріпси': 'syrni-stripsi.jpg',
        'Цибулеві Кільця': 'cybulevi-kiltsia.jpg',
        'Картопля Фрі': 'kartoplya-fri.jpg',
        'Кульки Фрі': 'kulky-fri.jpg',
        'Мікс Фрі': 'miks-fri.jpg',
        'Крокети Картопляні': 'krokety.jpg'
    };

    function pickPhoto(dish) {
        const name = (dish.querySelector('.dish__name')?.textContent || '').toLowerCase();
        const cat  = dish.dataset.category;

        // === Sets ===
        if (cat === 'sets') {
            if (name.includes('дракон'))   return PHOTO.setDragon;
            if (name.includes('блек'))     return PHOTO.setBlack;
            if (name.includes('голд'))     return PHOTO.setGold;
            if (name.includes('лосось'))   return PHOTO.setSalmon;
            return PHOTO.setMixed;
        }
        // === Nigiri ===
        if (cat === 'nigiri') {
            if (name.includes('лосось'))   return PHOTO.nigiriSalmon;
            if (name.includes('креветк'))  return PHOTO.nigiriShrimp;
            if (name.includes('вугор'))    return PHOTO.nigiriEel;
            return PHOTO.nigiriSalmon;
        }
        // === Maki ===
        if (cat === 'maki') {
            if (name.includes('тунець'))   return PHOTO.makiTuna;
            if (name.includes('вугор'))    return PHOTO.makiEel;
            if (name.includes('авокадо') || name.includes('огірок') || name.includes('чука')) return PHOTO.makiVeg;
            return PHOTO.makiSalmon;
        }
        // === Bowls / sashimi ===
        if (cat === 'bowls') {
            if (name.includes('сашимі'))   return PHOTO.sashimi;
            if (name.includes('тартар'))   return PHOTO.tartar;
            if (name.includes('креветк'))  return PHOTO.bowlShrimp;
            return PHOTO.bowlSalmon;
        }
        // === Noodles ===
        if (cat === 'noodles') {
            if (name.includes('фунчоз'))   return PHOTO.funchoza;
            if (name.includes('якісоб'))   return PHOTO.yakisoba;
            if (name.includes('тепаньяк')) return PHOTO.tepan;
            return PHOTO.udon;
        }
        // === Donuts ===
        if (cat === 'donuts') return PHOTO.donut;
        // === Snacks ===
        if (cat === 'snacks') {
            if (name.includes('чука'))     return PHOTO.chuka;
            if (name.includes('сир') && name.includes('брі')) return PHOTO.cheese;
            if (name.includes('сирн'))     return PHOTO.cheese;
            if (name.includes('креветк'))  return PHOTO.shrimpTemp;
            if (name.includes('нагетси') || name.includes('куряч')) return PHOTO.nuggets;
            if (name.includes('цибул'))    return PHOTO.onion;
            if (name.includes('фрі') && (name.includes('кульк'))) return PHOTO.balls;
            if (name.includes('крокети'))  return PHOTO.balls;
            if (name.includes('картопл') || name.includes('мікс')) return PHOTO.fries;
            return PHOTO.fries;
        }
        // === Hot / baked ===
        if (cat === 'hot') {
            if (name.includes('бургер'))   return PHOTO.burger;
            if (name.includes('паличк'))   return PHOTO.palychka;
            if (name.includes('онігірі'))  return PHOTO.onigiri;
            if (name.includes('темпур') || name.includes('панко')) return PHOTO.tempura;
            return PHOTO.baked;
        }
        // === Rolls (default) ===
        if (name.includes('дракон')) {
            if (name.includes('червон'))   return PHOTO.rollDragon;
            if (name.includes('зелен'))    return PHOTO.rollGreen;
            return PHOTO.rollDragon;
        }
        if (name.includes('спайсі') || name.includes('тигр')) return PHOTO.rollSpicy;
        if (name.includes('тунець') || name.includes('магуро')) return PHOTO.rollTuna;
        if (name.includes('вугор'))         return PHOTO.rollEel;
        if (name.includes('креветк') || name.includes('ебі') || name.includes('еббі')) return PHOTO.rollShrimp;
        if (name.includes('чедер') || name.includes('сир') || name.includes('чіз')) return PHOTO.rollCheese;
        if (name.includes('краб'))          return PHOTO.rollCrab;
        if (name.includes('грін') || name.includes('зелен') || name.includes('авокад')) return PHOTO.rollGreen;
        if (name.includes('спрінг'))        return PHOTO.spring;
        if (name.includes('рол-дог'))       return PHOTO.rolDog;
        if (name.includes('філадельф'))     return PHOTO.rollPhilly;
        if (name.includes('лосось'))        return PHOTO.rollSalmon;
        return PHOTO.rollSalmon;
    }

    // HEAD-check the local file once (in parallel for all cards). If it
    // returns 200 we use the local photo; otherwise fall back to Unsplash.
    // This avoids the lazy-loading race where the 404 never fires error.
    async function attachPhotos() {
        const dishes = Array.from(document.querySelectorAll('.dish'));
        await Promise.all(dishes.map(async dish => {
            const visual = dish.querySelector('.dish__visual');
            if (!visual || visual.querySelector('img')) return;

            const exactName = dish.querySelector('.dish__name')?.textContent?.trim() || '';
            let url = null;

            if (LOCAL[exactName]) {
                const localUrl = `img/dishes/${LOCAL[exactName]}`;
                try {
                    const r = await fetch(localUrl, { method: 'HEAD' });
                    if (r.ok) url = localUrl;
                } catch { /* network error → fall through to stock */ }
            }
            if (!url) url = pickPhoto(dish);
            if (!url) return;

            const img = document.createElement('img');
            img.src = url;
            img.alt = '';
            img.loading = 'lazy';
            img.decoding = 'async';
            img.addEventListener('error', () => img.remove(), { once: true });
            visual.appendChild(img);
        }));
    }
    attachPhotos();

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
            // Focus the call button after the open animation kicks in
            setTimeout(() => {
                const cta = orderModal.querySelector('.order-modal__cta');
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

        // After user taps the tel: link, close the modal so the dialer takes over
        const telCta = orderModal.querySelector('.order-modal__cta');
        if (telCta) {
            telCta.addEventListener('click', () => {
                setTimeout(closeModal, 250);
            });
        }
    }

    /* ----------------------------------------------------------
       Menu category filter
       ---------------------------------------------------------- */
    const filterBtns = document.querySelectorAll('.menu__filter');
    const menuGrid = document.getElementById('menu-grid');
    if (filterBtns.length && menuGrid) {
        const dishes = Array.from(menuGrid.querySelectorAll('.dish'));
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const f = btn.dataset.filter;
                filterBtns.forEach(b => b.classList.toggle('is-active', b === btn));
                dishes.forEach(d => {
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
    if (sakuraLayer && !prefersReduced) {
        const count = window.innerWidth < 700 ? 8 : 16;
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
       Three.js setup helpers
       ---------------------------------------------------------- */
    if (typeof THREE === 'undefined') {
        console.warn('Three.js failed to load; skipping 3D scenes.');
        return;
    }

    const DPR_CAP = Math.min(window.devicePixelRatio || 1, 1.5);
    const IS_MOBILE = window.innerWidth < 700;

    /* ==========================================================
       SCENE 1 — Background: drifting particles + low-poly torus
       ========================================================== */
    (function backgroundScene() {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return;

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
        const particleCount = IS_MOBILE ? 120 : 220;
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
        const accentCount = IS_MOBILE ? 30 : 60;
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
        const FRAME_MS = 1000 / 40; // throttle bg to ~40fps
        let acc = 0;
        function tick(now) {
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

})();
