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
    // All IDs verified to return 200 from the Unsplash CDN
    const U = id => `https://images.unsplash.com/photo-${id}?w=480&h=480&fit=crop&auto=format&q=70`;
    const PHOTO = {
        setMixed:   U('1617196034796-73dfa7b1fd56'),
        setDragon:  U('1607301406259-dfb186e15de8'),
        setSalmon:  U('1579952363873-27f3bade9f55'),
        setBlack:   U('1622866306950-81d17097d458'),
        setGold:    U('1583623025817-d180a2221d0a'),

        rollSalmon: U('1611143669185-af224c5e3252'),
        rollPhilly: U('1559847844-5315695dadae'),
        rollDragon: U('1607301406259-dfb186e15de8'),
        rollTuna:   U('1565299585323-38d6b0865b47'),
        rollSpicy:  U('1601050690597-df0568f70950'),
        rollEel:    U('1591814468924-caf88d1232e1'),
        rollShrimp: U('1559847844-5315695dadae'),
        rollCheese: U('1563612116625-3012372fccce'),
        rollCrab:   U('1496116218417-1a781b1c416c'),
        rollGreen:  U('1564489563601-c53cfc451e93'),
        spring:     U('1606471191009-63994c53433b'),
        rolDog:     U('1568901346375-23c9450c58cd'),

        baked:      U('1559762717-99c81ac85459'),
        tempura:    U('1581873372796-635b67ca2008'),
        burger:     U('1568901346375-23c9450c58cd'),
        palychka:   U('1581873372796-635b67ca2008'),
        onigiri:    U('1565299624946-b28f40a0ae38'),

        makiSalmon: U('1553621042-f6e147245754'),
        makiTuna:   U('1553621042-f6e147245754'),
        makiVeg:    U('1553621042-f6e147245754'),
        makiEel:    U('1564489563601-c53cfc451e93'),

        nigiriSalmon: U('1582450871972-ab5ca641643d'),
        nigiriShrimp: U('1582450871972-ab5ca641643d'),
        nigiriEel:    U('1582450871972-ab5ca641643d'),

        bowlSalmon: U('1546069901-ba9599a7e63c'),
        bowlShrimp: U('1614680376408-81e91ffe3db7'),
        sashimi:    U('1567620832903-9fc6debc209f'),
        tartar:     U('1546069901-ba9599a7e63c'),

        udon:       U('1623341214825-9f4f963727da'),
        yakisoba:   U('1569718212165-3a8278d5f624'),
        funchoza:   U('1572715376701-98568319fd0b'),
        tepan:      U('1569718212165-3a8278d5f624'),

        donut:      U('1564631027894-5bdb17618445'),

        chuka:      U('1606471191009-63994c53433b'),
        cheese:     U('1564834724105-918b73d1b9e0'),
        shrimpTemp: U('1581873372796-635b67ca2008'),
        nuggets:    U('1623653387945-2fd25214f8fc'),
        onion:      U('1518779578993-ec3579fee39f'),
        fries:      U('1604152135912-04a022e23696'),
        balls:      U('1604152135912-04a022e23696')
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

    function attachPhotos() {
        document.querySelectorAll('.dish').forEach(dish => {
            const visual = dish.querySelector('.dish__visual');
            if (!visual || visual.querySelector('img')) return;
            const url = pickPhoto(dish);
            if (!url) return;
            const img = document.createElement('img');
            img.src = url;
            img.alt = '';
            img.loading = 'lazy';
            img.decoding = 'async';
            // If the photo can't load, drop the <img> so the coloured fallback remains visible
            img.addEventListener('error', () => img.remove(), { once: true });
            visual.appendChild(img);
        });
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
