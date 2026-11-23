// js/app.js: shared script for every page.
// Base: itruonghai/itruonghai.github.io js/app.js (MIT License, Copyright (c) 2022 Yi Ren).
// Particle background, footer stamp and Tracking data: eronguyen/eronguyen.github.io (MIT).

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Scroll Effect
    const navbar = document.querySelector('.navbar');
    const root = document.documentElement;

    // Particle network background (from eronguyen.github.io, MIT): one full-screen canvas on every page.
    const particleCanvas = document.createElement('canvas');
    particleCanvas.className = 'particle-bg';
    particleCanvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(particleCanvas);
    (() => {
        const canvas = particleCanvas;
        const ctx = canvas.getContext('2d');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const mouse = { x: null, y: null, radius: 150 };
        let particles = [];
        let numParticles = 130;

        window.addEventListener('mousemove', (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        });
        document.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const base = window.innerWidth < 768 ? 70 : 130;
            const areaScale = Math.sqrt((canvas.width * canvas.height) / (1280 * 720));
            numParticles = Math.max(22, Math.min(180, Math.round(base * Math.max(0.8, Math.min(1.4, areaScale)))));
        }

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.sizeBase = Math.random() * 2.8 + 1.8;
                this.size = this.sizeBase;
                this.sizePhase = Math.random() * Math.PI * 2;
                this.sizeSpeed = 0.01 + Math.random() * 0.02;
                this.sizeAmplitude = 0.2 + Math.random() * 0.55;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 20) + 1;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.angle = Math.random() * Math.PI * 2;
                this.spin = (Math.random() - 0.5) * 0.04;
                const r = Math.random();
                this.shape = r < 0.34 ? 'circle' : r < 0.54 ? 'diamond' : r < 0.74 ? 'triangle' : r < 0.9 ? 'plus' : 'ring';
                const palette = [
                    'rgba(14, 165, 233, 0.55)',
                    'rgba(6, 182, 212, 0.5)',
                    'rgba(56, 189, 248, 0.5)',
                    'rgba(13, 148, 136, 0.48)'
                ];
                this.color = palette[Math.floor(Math.random() * palette.length)];
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.shadowColor = 'rgba(14, 165, 233, 0.35)';
                ctx.shadowBlur = 8;
                ctx.fillStyle = this.color;
                ctx.strokeStyle = this.color;
                ctx.beginPath();
                if (this.shape === 'circle') {
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                    ctx.fill();
                } else if (this.shape === 'diamond') {
                    ctx.moveTo(0, -this.size * 1.5);
                    ctx.lineTo(this.size * 1.15, 0);
                    ctx.lineTo(0, this.size * 1.5);
                    ctx.lineTo(-this.size * 1.15, 0);
                    ctx.closePath();
                    ctx.fill();
                } else if (this.shape === 'triangle') {
                    ctx.moveTo(0, -this.size * 1.7);
                    ctx.lineTo(this.size * 1.45, this.size * 1.3);
                    ctx.lineTo(-this.size * 1.45, this.size * 1.3);
                    ctx.closePath();
                    ctx.fill();
                } else if (this.shape === 'plus') {
                    const l = this.size * 1.8;
                    ctx.lineWidth = Math.max(1, this.size * 0.65);
                    ctx.lineCap = 'round';
                    ctx.moveTo(-l, 0);
                    ctx.lineTo(l, 0);
                    ctx.moveTo(0, -l);
                    ctx.lineTo(0, l);
                    ctx.stroke();
                } else {
                    ctx.lineWidth = Math.max(1, this.size * 0.5);
                    ctx.arc(0, 0, this.size * 1.5, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.angle += this.spin;
                this.sizePhase += this.sizeSpeed;
                this.size = Math.max(0.45, this.sizeBase + Math.sin(this.sizePhase) * this.sizeAmplitude + (Math.random() - 0.5) * 0.08);

                if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
                if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

                if (mouse.x != null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance === 0) return;
                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.x -= (dx / distance) * force * this.density;
                        this.y -= (dy / distance) * force * this.density;
                    } else {
                        this.x -= (this.x - this.baseX) / 20;
                        this.y -= (this.y - this.baseY) / 20;
                    }
                }

                this.baseX += this.vx;
                this.baseY += this.vy;
            }
        }

        function init() {
            particles = Array.from({ length: numParticles }, () => new Particle());
        }

        function drawFrame(move) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                if (move) particles[i].update();
                particles[i].draw();
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 130) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(14, 165, 233, ${0.2 - distance / 900})`;
                        ctx.lineWidth = 1.8;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            drawFrame(true);
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', () => {
            resize();
            init();
            if (reduceMotion) drawFrame(false);
        });
        resize();
        init();
        // Reduced motion: keep the network as a still picture.
        if (reduceMotion) drawFrame(false); else animate();
    })();

    const scrollProgress = document.createElement('div');
    scrollProgress.className = 'scroll-progress';
    scrollProgress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(scrollProgress);

    function updateScrollProgress() {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
        root.style.setProperty('--scroll-progress', progress.toFixed(4));
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateScrollProgress();
    });
    window.addEventListener('resize', updateScrollProgress);
    updateScrollProgress();

    // 2. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navContainer = document.querySelector('.nav-container');

    if (navContainer && mobileBtn) {
        const navActions = document.createElement('div');
        const themeToggle = document.createElement('button');
        let savedTheme = null;
        try { savedTheme = localStorage.getItem('ero_theme'); } catch (error) { savedTheme = null; }

        navActions.className = 'nav-actions';
        themeToggle.className = 'theme-toggle';
        themeToggle.type = 'button';

        function applyTheme(theme) {
            root.dataset.theme = theme;
            themeToggle.innerHTML = theme === 'dark'
                ? '<i class="fas fa-sun" aria-hidden="true"></i>'
                : '<i class="fas fa-moon" aria-hidden="true"></i>';
            themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
            themeToggle.setAttribute('title', theme === 'dark' ? 'Light mode' : 'Dark mode');
        }

        applyTheme(savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark');

        themeToggle.addEventListener('click', () => {
            const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
            try { localStorage.setItem('ero_theme', nextTheme); } catch (error) { /* storage blocked */ }
            applyTheme(nextTheme);
        });

        navContainer.insertBefore(navActions, mobileBtn);
        navActions.appendChild(themeToggle);
        navActions.appendChild(mobileBtn);
    }

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('show')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // 3. Highlight Active Nav Link
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-links a');

    links.forEach(link => {
        // Handle root / index.html
        if (currentPath === '/' || currentPath.endsWith('index.html')) {
            if (link.getAttribute('href') === 'index.html' || link.getAttribute('href') === '/') {
                link.classList.add('active');
            }
        }
        // Handle other pages
        else if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href').replace('./', ''))) {
            link.classList.add('active');
        }
    });

    // 4. Scroll Reveal with IntersectionObserver
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    const railSections = [...document.querySelectorAll('section[id]')].filter(section => {
        const id = section.getAttribute('id');
        return id && section.offsetHeight > 120;
    });

    if (railSections.length > 1) {
        const sectionRail = document.createElement('nav');
        sectionRail.className = 'section-rail';
        sectionRail.setAttribute('aria-label', 'Section navigation');

        railSections.forEach(section => {
            const link = document.createElement('a');
            const title = section.dataset.railLabel || section.querySelector('h1, h2, h3')?.textContent?.trim() || section.id;
            link.href = `#${section.id}`;
            link.setAttribute('aria-label', title.replace(/[^\w\s&-]/g, '').trim());
            sectionRail.appendChild(link);
        });

        document.body.appendChild(sectionRail);

        const railLinks = [...sectionRail.querySelectorAll('a')];
        const railObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                railLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
                });
            });
        }, {
            rootMargin: '-42% 0px -42% 0px',
            threshold: 0
        });

        railSections.forEach(section => railObserver.observe(section));
    }


    // Subtle portrait tilt on pointer devices; leave reduced-motion layouts static.
    const profileContainer = document.querySelector('.profile-image-container');
    if (profileContainer && window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
        profileContainer.addEventListener('mousemove', (e) => {
            const rect = profileContainer.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element.
            const y = e.clientY - rect.top;  // y position within the element.

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -15; // Max tilt 15deg
            const rotateY = ((x - centerX) / centerX) * 15;

            profileContainer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            profileContainer.style.transition = 'transform 0.1s ease';
        });

        profileContainer.addEventListener('mouseleave', () => {
            profileContainer.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
            profileContainer.style.transition = 'transform 0.5s ease';
        });
    }

    // 7. Shared 3D tilt for cards and page panels
    const canUseTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (canUseTilt) {
        const tiltTargets = document.querySelectorAll(
            '.glass-card, .paper-card, .education-card, .theme-toggle'
        );

        window.addEventListener('pointermove', (event) => {
            const shift = ((event.clientX / window.innerWidth) - 0.5) * 42;
            document.documentElement.style.setProperty('--atmosphere-shift', `${shift}px`);
        });

        tiltTargets.forEach(target => {
            target.addEventListener('pointermove', (event) => {
                const rect = target.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) - 0.5;
                const y = ((event.clientY - rect.top) / rect.height) - 0.5;
                const maxTilt = 5;

                target.style.setProperty('--tilt-x', `${y * -maxTilt}deg`);
                target.style.setProperty('--tilt-y', `${x * maxTilt}deg`);
            });

            target.addEventListener('pointerleave', () => {
                target.style.setProperty('--tilt-x', '0deg');
                target.style.setProperty('--tilt-y', '0deg');
            });
        });
    }


    const typewriter = document.querySelector('.typewriter-text');
    if (typewriter && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const phrases = [
            'AI Engineer',
            'LLM agents · Backend systems',
            'Computer vision on edge devices'
        ];
        let phrase = 0;
        let length = phrases[0].length;
        let deleting = true;

        function typeNext() {
            const text = phrases[phrase];
            length += deleting ? -1 : 1;
            typewriter.textContent = text.slice(0, length);
            let delay = deleting ? 45 : 80;
            if (length === 0) {
                phrase = (phrase + 1) % phrases.length;
                deleting = false;
                delay = 250;
            } else if (length === text.length) {
                deleting = true;
                delay = 2200;
            }
            window.setTimeout(typeNext, delay);
        }

        window.setTimeout(typeNext, 2200);
    }

    // Footer last-updated stamp
    const footerParagraph = document.querySelector('footer p');
    if (footerParagraph && document.lastModified) {
        const modifiedDate = new Date(document.lastModified);
        if (!Number.isNaN(modifiedDate.getTime())) {
            const formatted = modifiedDate.toLocaleString([], {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            const stamp = document.createElement('span');
            stamp.innerHTML = `<br>Last updated: ${formatted}`;
            footerParagraph.appendChild(stamp);
        }
    }

    // Tracking page live data
    const trackingSection = document.getElementById('tracking');
    if (trackingSection) {
        const githubUser = (trackingSection.getAttribute('data-github-user') || '').trim();
        const leetcodeUser = (trackingSection.getAttribute('data-leetcode-user') || '').trim();

        const updateText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        const updateWidth = (id, pct) => {
            const el = document.getElementById(id);
            if (!el) return;
            const bounded = Math.max(0, Math.min(100, pct));
            el.style.width = `${bounded}%`;
        };
        const formatNumber = (value) => {
            if (value == null || value === '') return '--';
            const n = Number(value);
            if (!Number.isFinite(n)) return String(value);
            return n.toLocaleString();
        };
        const asNumber = (value) => {
            const n = Number(value);
            return Number.isFinite(n) ? n : 0;
        };
        const nowLabel = () => new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        const fetchJSON = async (url, timeoutMs = 12000) => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const response = await fetch(url, { signal: controller.signal });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } finally {
                clearTimeout(timer);
            }
        };

        const initGitHubTracking = async () => {
            const ghProfileLink = document.getElementById('gh-profile-link');
            if (ghProfileLink) ghProfileLink.href = `https://github.com/${githubUser}`;

            try {
                const [profile, events, repos] = await Promise.all([
                    fetchJSON(`https://api.github.com/users/${githubUser}`),
                    fetchJSON(`https://api.github.com/users/${githubUser}/events/public?per_page=100`),
                    fetchJSON(`https://api.github.com/users/${githubUser}/repos?per_page=100&sort=updated`)
                ]);

                const now = Date.now();
                const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
                const recentEvents = Array.isArray(events)
                    ? events.filter((event) => new Date(event.created_at).getTime() >= thirtyDaysAgo)
                    : [];

                let commitCount30 = 0;
                const activeRepoSet = new Set();
                const repoCommitMap = new Map();

                recentEvents.forEach((event) => {
                    if (event.type !== 'PushEvent') return;
                    const repoName = event.repo && event.repo.name ? event.repo.name : '';
                    activeRepoSet.add(repoName);
                    const commits = (event.payload && Array.isArray(event.payload.commits))
                        ? event.payload.commits.length
                        : 0;
                    commitCount30 += commits;
                    if (repoName) {
                        repoCommitMap.set(repoName, (repoCommitMap.get(repoName) || 0) + commits);
                    }
                });

                updateText('gh-commits-30', String(commitCount30));
                updateText('gh-active-repos', String(Array.from(activeRepoSet).filter(Boolean).length));
                const publicRepos = (profile && profile.public_repos != null) ? profile.public_repos : '--';
                updateText('gh-public-repos', String(publicRepos));
                updateText('github-status', `Live data for @${githubUser}`);
                updateText('gh-name', `@${githubUser}`);
                updateText('gh-followers', formatNumber(profile && profile.followers != null ? profile.followers : '--'));
                updateText('gh-following', formatNumber(profile && profile.following != null ? profile.following : '--'));
                const avatarEl = document.getElementById('gh-avatar');
                if (avatarEl && profile && profile.avatar_url) avatarEl.src = profile.avatar_url;

                const languageCount = {};
                if (Array.isArray(repos)) {
                    repos.forEach((repo) => {
                        const lang = repo && repo.language ? repo.language : null;
                        if (!lang) return;
                        languageCount[lang] = (languageCount[lang] || 0) + 1;
                    });
                }
                const topLanguage = Object.entries(languageCount).sort((a, b) => b[1] - a[1])[0];
                updateText('gh-language', topLanguage ? `Language: ${topLanguage[0]}` : 'Language: --');

                const dailyPace = commitCount30 / 30;
                const pacePercent = Math.min(100, (dailyPace / 5) * 100);
                updateText('gh-pace-label', `${dailyPace.toFixed(1)} / day`);
                updateText('gh-pace-pct', `${Math.round(pacePercent)}%`);
                updateWidth('gh-pace-bar', pacePercent);
                updateText('gh-updated', `Updated: ${nowLabel()}`);

                const repoListEl = document.getElementById('gh-repo-list');
                if (repoListEl) {
                    const topRepos = Array.from(repoCommitMap.entries())
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5);

                    if (topRepos.length === 0) {
                        repoListEl.innerHTML = '<li class="gh-repo-item"><span class="gh-repo-name">No recent push activity</span><span class="gh-repo-count">0</span></li>';
                    } else {
                        repoListEl.innerHTML = topRepos.map(([fullName, count]) => {
                            const repoShort = fullName.includes('/') ? fullName.split('/').pop() : fullName;
                            return `<li class="gh-repo-item"><span class="gh-repo-name">${repoShort}</span><span class="gh-repo-count">${count}</span></li>`;
                        }).join('');
                    }
                }
            } catch (error) {
                updateText('gh-commits-30', '--');
                updateText('gh-active-repos', '--');
                updateText('gh-public-repos', '--');
                updateText('gh-name', `@${githubUser}`);
                updateText('gh-followers', '--');
                updateText('gh-following', '--');
                updateText('gh-language', 'Language: --');
                updateText('gh-pace-label', '-- / day');
                updateText('gh-pace-pct', '--%');
                updateWidth('gh-pace-bar', 0);
                updateText('github-status', 'Live data unavailable right now.');
                updateText('gh-updated', 'Updated: --');
                const repoListEl = document.getElementById('gh-repo-list');
                if (repoListEl) {
                    repoListEl.innerHTML = '<li class="gh-repo-item"><span class="gh-repo-name">Could not load repositories</span><span class="gh-repo-count">--</span></li>';
                }
            }
        };

        const initLeetCodeTracking = async () => {
            const lcProfileLink = document.getElementById('lc-profile-link');
            if (lcProfileLink) lcProfileLink.href = `https://leetcode.com/u/${leetcodeUser}/`;

            try {
                // Primary source requested by user: noworneverev/leetcode-api
                const data = await fetchJSON(`https://leetcode-api-pied.vercel.app/user/${leetcodeUser}`);

                const profile = data && data.profile ? data.profile : {};
                const totals = data && data.totals ? data.totals : {};
                const solved = data && data.solved ? data.solved : {};
                const stats = data && data.stats ? data.stats : {};

                const easySolved = (
                    solved.easy != null ? solved.easy :
                    stats.easySolved != null ? stats.easySolved :
                    data.easySolved != null ? data.easySolved :
                    '--'
                );
                const mediumSolved = (
                    solved.medium != null ? solved.medium :
                    stats.mediumSolved != null ? stats.mediumSolved :
                    data.mediumSolved != null ? data.mediumSolved :
                    '--'
                );
                const hardSolved = (
                    solved.hard != null ? solved.hard :
                    stats.hardSolved != null ? stats.hardSolved :
                    data.hardSolved != null ? data.hardSolved :
                    '--'
                );
                const totalSolved = (
                    solved.total != null ? solved.total :
                    stats.totalSolved != null ? stats.totalSolved :
                    data.totalSolved != null ? data.totalSolved :
                    (asNumber(easySolved) + asNumber(mediumSolved) + asNumber(hardSolved))
                );
                const easyTotal = asNumber(
                    totals.easy != null ? totals.easy :
                    stats.totalEasy != null ? stats.totalEasy :
                    data.totalEasy
                );
                const mediumTotal = asNumber(
                    totals.medium != null ? totals.medium :
                    stats.totalMedium != null ? stats.totalMedium :
                    data.totalMedium
                );
                const hardTotal = asNumber(
                    totals.hard != null ? totals.hard :
                    stats.totalHard != null ? stats.totalHard :
                    data.totalHard
                );
                const rawAcceptance = (
                    profile.acceptanceRate != null ? profile.acceptanceRate :
                    stats.acceptanceRate != null ? stats.acceptanceRate :
                    data.acceptanceRate
                );
                const acceptanceRate = (rawAcceptance != null && rawAcceptance !== '')
                    ? `${rawAcceptance}%`
                    : '--';
                const ranking = (
                    profile.ranking != null ? profile.ranking :
                    stats.ranking != null ? stats.ranking :
                    data.ranking
                );

                const easySolvedNum = asNumber(easySolved);
                const mediumSolvedNum = asNumber(mediumSolved);
                const hardSolvedNum = asNumber(hardSolved);

                const easyPct = easyTotal > 0 ? (easySolvedNum / easyTotal) * 100 : 0;
                const mediumPct = mediumTotal > 0 ? (mediumSolvedNum / mediumTotal) * 100 : 0;
                const hardPct = hardTotal > 0 ? (hardSolvedNum / hardTotal) * 100 : 0;

                updateText('lc-total', formatNumber(totalSolved));
                updateText('lc-acceptance', acceptanceRate);
                updateText('lc-ranking', formatNumber(ranking));
                updateText('lc-easy-label', `${formatNumber(easySolvedNum)}${easyTotal > 0 ? ` / ${formatNumber(easyTotal)}` : ''}`);
                updateText('lc-medium-label', `${formatNumber(mediumSolvedNum)}${mediumTotal > 0 ? ` / ${formatNumber(mediumTotal)}` : ''}`);
                updateText('lc-hard-label', `${formatNumber(hardSolvedNum)}${hardTotal > 0 ? ` / ${formatNumber(hardTotal)}` : ''}`);
                updateText('lc-easy-pct', `${Math.round(easyPct)}%`);
                updateText('lc-medium-pct', `${Math.round(mediumPct)}%`);
                updateText('lc-hard-pct', `${Math.round(hardPct)}%`);
                updateWidth('lc-easy-bar', easyPct);
                updateWidth('lc-medium-bar', mediumPct);
                updateWidth('lc-hard-bar', hardPct);
                updateText('leetcode-status', `Live data for @${leetcodeUser}`);
                updateText('lc-updated', `Updated: ${nowLabel()}`);
            } catch (error) {
                updateText('lc-total', '--');
                updateText('lc-acceptance', '--');
                updateText('lc-ranking', '--');
                updateText('lc-easy-label', '--');
                updateText('lc-medium-label', '--');
                updateText('lc-hard-label', '--');
                updateText('lc-easy-pct', '--%');
                updateText('lc-medium-pct', '--%');
                updateText('lc-hard-pct', '--%');
                updateWidth('lc-easy-bar', 0);
                updateWidth('lc-medium-bar', 0);
                updateWidth('lc-hard-bar', 0);
                updateText('leetcode-status', 'Live data unavailable right now.');
                updateText('lc-updated', 'Updated: --');
            }
        };

        const initVisitorTracking = () => {
            const statusEl = document.getElementById('visitor-status');
            const mapContainer = document.getElementById('visitor-map-container');
            const noteEl = document.getElementById('visitor-note');
            const clustrToken = (trackingSection.getAttribute('data-clustrmaps-token') || '').trim();

            if (!mapContainer || !statusEl) return;

            if (!clustrToken) {
                statusEl.textContent = 'Visitor map is not configured yet.';
                if (noteEl) {
                    noteEl.innerHTML = 'Add your ClustrMaps token to <code>data-clustrmaps-token</code> in <code>tracking.html</code>.';
                }
                return;
            }

            try {
                mapContainer.innerHTML = '';
                const script = document.createElement('script');
                script.id = 'clustrmaps';
                script.async = true;
                script.src = `https://cdn.clustrmaps.com/map_v2.js?cl=ffffff&w=900&t=tt&d=${encodeURIComponent(clustrToken)}&co=0b1220&ct=ffffff&cmo=3acc3a&cmn=ff5353`;

                script.onload = () => {
                    statusEl.textContent = 'Live global visitor map loaded.';
                    if (noteEl) noteEl.textContent = 'Map and visit counts are provided by ClustrMaps.';
                };
                script.onerror = () => {
                    statusEl.textContent = 'Could not load visitor map right now.';
                    if (noteEl) noteEl.textContent = 'Check your token or network settings.';
                };

                mapContainer.appendChild(script);
            } catch (error) {
                statusEl.textContent = 'Could not initialize visitor map.';
                if (noteEl) noteEl.textContent = 'Please verify the widget configuration.';
            }
        };

        initGitHubTracking();
        const leetCardImage = document.getElementById('leetcode-card-image');
        if (!leetCardImage) {
            initLeetCodeTracking();
        }
        initVisitorTracking();
    }
});
