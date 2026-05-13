/**
 * XYX Personal Website - Main JavaScript
 * Vanilla JS, no frameworks
 */

(function() {
    'use strict';

    // ========================================
    // Data Storage
    // ========================================
    let thoughtsData = [];
    let notesData = [];

    // ========================================
    // DOM Elements
    // ========================================
    const loader = document.getElementById('loader');
    const nav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    const scrollProgressBar = document.querySelector('.scroll-progress-bar');
    const articleOverlay = document.getElementById('article-overlay');
    const articleContent = document.getElementById('article-content');
    const articleClose = document.querySelector('.article-close');

    // ========================================
    // Canvas Background Animation
    // ========================================
    let particles = [];
    let animationId = null;
    let mouseX = 0;
    let mouseY = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse interaction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                this.x -= dx * force * 0.02;
                this.y -= dy * force * 0.02;
            }

            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 65, ${this.opacity})`;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    const opacity = (1 - dist / 120) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 204, 51, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animateCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw subtle grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
        ctx.lineWidth = 0.5;
        const gridSize = 60;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();

        animationId = requestAnimationFrame(animateCanvas);
    }

    // ========================================
    // Loading
    // ========================================
    function hideLoader() {
        setTimeout(() => {
            loader.classList.add('hidden');
            initPage();
        }, 2000);
    }

    // ========================================
    // Navigation
    // ========================================
    function updateNav(sectionId) {
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });
    }

    function showSection(sectionId) {
        sections.forEach(sec => {
            sec.classList.toggle('active', sec.id === sectionId);
        });
        updateNav(sectionId);
        window.scrollTo({ top: 0, behavior: 'instant' });
        initScrollReveal();
    }

    function handleRoute() {
        const hash = window.location.hash.slice(1) || 'home';
        const validSections = ['home', 'thoughts', 'notes', 'about'];
        const sectionId = validSections.includes(hash) ? hash : 'home';
        showSection(sectionId);
    }

    // ========================================
    // Scroll Effects
    // ========================================
    function handleScroll() {
        const scrollY = window.scrollY;

        // Nav background
        nav.classList.toggle('scrolled', scrollY > 50);

        // Scroll progress
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
        scrollProgressBar.style.width = `${progress}%`;
    }

    // ========================================
    // Scroll Reveal Animation
    // ========================================
    let scrollObserver = null;

    function initScrollReveal() {
        // Disconnect previous observer
        if (scrollObserver) {
            scrollObserver.disconnect();
        }

        // Only animate content cards and list items (not headers/filters)
        const revealElements = document.querySelectorAll('.content-card, .content-list-item, .note-card');

        // Clear old state immediately to avoid flash
        revealElements.forEach(el => {
            el.classList.remove('reveal', 'visible');
        });

        // Use requestAnimationFrame to batch the reveal add after layout
        requestAnimationFrame(() => {
            revealElements.forEach(el => {
                el.classList.add('reveal');
            });

            scrollObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        scrollObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

            revealElements.forEach(el => scrollObserver.observe(el));
        });
    }

    // ========================================
    // Counter Animation
    // ========================================
    function animateCounter(element, target, duration = 1500) {
        const start = performance.now();
        const startValue = 0;

        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(startValue + (target - startValue) * easeOut);
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    function updateStats() {
        const essaysEl = document.getElementById('stat-essays');
        const notesEl = document.getElementById('stat-notes');
        const daysEl = document.getElementById('stat-days');

        if (essaysEl) animateCounter(essaysEl, thoughtsData.length);
        if (notesEl) animateCounter(notesEl, notesData.length);

        // Calculate days since first article or default to something reasonable
        let days = 0;
        const allDates = [...thoughtsData, ...notesData].map(d => new Date(d.date));
        if (allDates.length > 0) {
            const earliest = new Date(Math.min(...allDates));
            days = Math.floor((new Date() - earliest) / (1000 * 60 * 60 * 24));
        }
        if (daysEl) animateCounter(daysEl, Math.max(days, 1));
    }

    // ========================================
    // Content Rendering
    // ========================================
    function renderRecent() {
        const container = document.getElementById('recent-grid');
        if (!container) return;

        const all = [...thoughtsData, ...notesData]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        container.innerHTML = all.map(item => `
            <div class="content-card" data-id="${item.id}" data-type="${item.type}"
                onclick="window.openArticle('${item.id}', '${item.type}')">
                <span class="card-tag">${item.type === 'essay' ? 'THOUGHT' : 'NOTE'}</span>
                <h3 class="card-title">${escapeHtml(item.title)}</h3>
                <p class="card-excerpt">${escapeHtml(item.excerpt || '')}</p>
                <div class="card-meta">
                    <span class="card-date">${formatDate(item.date)}</span>
                    ${item.tags ? `<span>${item.tags.slice(0, 2).join(', ')}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    function renderThoughts(filter = 'all') {
        const container = document.getElementById('thoughts-list');
        if (!container) return;

        const filtered = filter === 'all'
            ? thoughtsData
            : thoughtsData.filter(e => e.category === filter || (e.tags && e.tags.includes(filter)));

        container.innerHTML = filtered.map(item => `
            <div class="content-list-item" data-id="${item.id}" onclick="window.openArticle('${item.id}', 'essay')">
                <span class="item-date">${formatDate(item.date)}</span>
                <div class="item-main">
                    <h3 class="item-title">${escapeHtml(item.title)}</h3>
                    <p class="item-excerpt">${escapeHtml(item.excerpt || '')}</p>
                </div>
                <div class="item-tags">
                    ${(item.tags || []).map(t => `<span class="item-tag">${escapeHtml(t)}</span>`).join('')}
                </div>
            </div>
        `).join('');

        initScrollReveal();
    }

    function renderNotes(filter = 'all') {
        const container = document.getElementById('notes-grid');
        if (!container) return;

        const filtered = filter === 'all'
            ? notesData
            : notesData.filter(n => n.category === filter || (n.tags && n.tags.includes(filter)));

        container.innerHTML = filtered.map(item => `
            <div class="note-card" data-id="${item.id}" onclick="window.openArticle('${item.id}', 'note')">
                <div class="note-icon">
                    ${getNoteIcon(item.category || item.tags?.[0] || 'default')}
                </div>
                <h3 class="note-title">${escapeHtml(item.title)}</h3>
                <p class="note-preview">${escapeHtml(item.excerpt || '')}</p>
                <div class="note-meta">${formatDate(item.date)}</div>
            </div>
        `).join('');

        initScrollReveal();
    }

    function getNoteIcon(category) {
        const icons = {
            frontend: '&#128187;',
            backend: '&#128295;',
            algorithm: '&#128290;',
            tool: '&#128295;',
            default: '&#128221;'
        };
        return icons[category] || icons.default;
    }

    // ========================================
    // Article Detail
    // ========================================
    window.openArticle = function(id, type) {
        const data = type === 'essay' ? thoughtsData : notesData;
        const article = data.find(a => a.id === id);
        if (!article) return;

        const typeLabel = type === 'essay' ? 'THOUGHT' : 'NOTE';
        const tagsHtml = (article.tags || []).map(t => `<span class="item-tag">${escapeHtml(t)}</span>`).join('');

        articleContent.innerHTML = `
            <h1>${escapeHtml(article.title)}</h1>
            <div class="article-meta">
                <span>${typeLabel}</span>
                <span style="margin: 0 8px;">·</span>
                <span>${formatDate(article.date)}</span>
                ${tagsHtml ? `<span style="margin: 0 8px;">·</span>${tagsHtml}` : ''}
            </div>
            ${article.content || `<p>${escapeHtml(article.excerpt || '')}</p><p style="color: var(--text-muted); font-style: italic; margin-top: 40px;">（完整内容请在 Markdown 源文件中编辑）</p>`}
        `;

        articleOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    function closeArticle() {
        articleOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ========================================
    // Filter Handlers
    // ========================================
    function setupFilters() {
        document.querySelectorAll('.filter-bar').forEach(bar => {
            bar.addEventListener('click', (e) => {
                if (!e.target.classList.contains('filter-btn')) return;

                bar.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');

                const filter = e.target.dataset.filter;
                const section = bar.closest('section');

                if (section.id === 'thoughts') {
                    renderThoughts(filter);
                } else if (section.id === 'notes') {
                    renderNotes(filter);
                }
            });
        });
    }

    // ========================================
    // Utilities
    // ========================================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}.${m}.${day}`;
    }

    // ========================================
    // Data Loading
    // ========================================
    async function loadData() {
        try {
            const [essaysRes, notesRes] = await Promise.all([
                fetch('data/essays.json').catch(() => null),
                fetch('data/notes.json').catch(() => null)
            ]);

            if (essaysRes && essaysRes.ok) {
                thoughtsData = await essaysRes.json();
            }
            if (notesRes && notesRes.ok) {
                notesData = await notesRes.json();
            }
        } catch (e) {
            console.warn('Could not load data:', e);
        }

        // Fallback demo data if nothing loaded
        if (thoughtsData.length === 0 && notesData.length === 0) {
            thoughtsData = [
                {
                    id: 'demo-essay-1',
                    type: 'essay',
                    title: '关于构建个人网站的思考',
                    excerpt: '在这个信息过载的时代，拥有一个属于自己的数字空间变得越来越重要。这不仅是一个展示自我的窗口，更是一个整理思绪、记录成长的容器。',
                    date: '2026-04-20',
                    category: 'tech',
                    tags: ['前端', '设计', '个人成长'],
                    content: ''
                },
                {
                    id: 'demo-essay-2',
                    type: 'essay',
                    title: '深色模式设计的美学探索',
                    excerpt: '深色模式不仅仅是颜色的反转，它涉及到对比度、层级、色彩心理学的深层考量。一个好的深色主题应该在保护视力的同时，营造出沉浸式的阅读体验。',
                    date: '2026-04-15',
                    category: 'design',
                    tags: ['UI设计', '色彩理论'],
                    content: ''
                }
            ];
            notesData = [
                {
                    id: 'demo-note-1',
                    type: 'note',
                    title: 'CSS Grid 布局速查',
                    excerpt: 'grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) 是实现响应式网格布局的利器。配合 gap 属性可以快速构建整齐的卡片布局。',
                    date: '2026-04-22',
                    category: 'frontend',
                    tags: ['CSS', '布局'],
                    content: ''
                },
                {
                    id: 'demo-note-2',
                    type: 'note',
                    title: 'IntersectionObserver 使用技巧',
                    excerpt: '使用 IntersectionObserver 替代 scroll 事件监听，可以大幅提升滚动动画的性能。记得设置合理的 threshold 和 rootMargin。',
                    date: '2026-04-18',
                    category: 'frontend',
                    tags: ['JavaScript', '性能优化'],
                    content: ''
                },
                {
                    id: 'demo-note-3',
                    type: 'note',
                    title: 'Markdown 最佳实践',
                    excerpt: '使用 YAML Front Matter 可以为 Markdown 文件添加元数据，配合构建脚本自动生成索引，是实现静态内容管理的优雅方案。',
                    date: '2026-04-10',
                    category: 'tool',
                    tags: ['Markdown', '工作流'],
                    content: ''
                }
            ];
        }

        renderRecent();
        renderThoughts();
        renderNotes();
        updateStats();
    }

    // ========================================
    // Event Listeners
    // ========================================
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    window.addEventListener('scroll', handleScroll, { passive: true });

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener('hashchange', handleRoute);

    menuToggle.addEventListener('click', () => {
        navLinksContainer.classList.toggle('open');
    });

    articleClose.addEventListener('click', closeArticle);
    articleOverlay.querySelector('.article-backdrop').addEventListener('click', closeArticle);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeArticle();
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinksContainer.classList.remove('open');
        });
    });

    // ========================================
    // Initialization
    // ========================================
    function initPage() {
        resizeCanvas();
        initParticles();
        animateCanvas();
        handleRoute();
        handleScroll();
        setupFilters();
        initScrollReveal();
    }

    // Start
    loadData().then(() => {
        hideLoader();
    });

})();
