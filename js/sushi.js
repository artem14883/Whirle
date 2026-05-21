/* ============================================================
   Суші Шінобі — 3D animations + UI interactions
   ============================================================ */

(() => {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
