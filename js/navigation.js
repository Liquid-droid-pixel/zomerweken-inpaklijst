// js/navigation.js — SPA routing and page rendering

const Navigation = {
  currentPage: 'home',

  pages: {
    home:       { label: 'Home',         icon: 'home',      render: () => Pages.renderHome()      },
    zeiltas:    { label: 'Zeiltas',      icon: 'anchor',    render: () => Pages.renderCategory('zeiltas')    },
    kleding:    { label: 'Kleding',      icon: 'shirt',     render: () => Pages.renderCategory('kleding')    },
    toilet:     { label: 'Toilet',       icon: 'droplets',  render: () => Pages.renderCategory('toilet')     },
    rugzak:     { label: 'Rugzak',       icon: 'backpack',  render: () => Pages.renderCategory('rugzak')     },
    turkentas:  { label: 'Turken tas',   icon: 'tent',      render: () => Pages.renderCategory('turkentas')  },
    lossehand:  { label: 'Losse hand',   icon: 'hand',      render: () => Pages.renderCategory('lossehand')  },
    overzicht:  { label: 'Overzicht',    icon: 'overview',  render: () => Pages.renderOverview()  },
  },

  navigate(pageId, pushState = true) {
    if (!this.pages[pageId]) return;
    this.currentPage = pageId;

    // Update active states in sidebr and bottom nav
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === pageId);
    });
    document.querySelectorAll('.bottom-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === pageId);
    });

    // Render page content
    const main = document.getElementById('main-content');
    main.classList.add('page-exit');

    setTimeout(() => {
      main.innerHTML = '';
      this.pages[pageId].render();
      main.classList.remove('page-exit');
      main.classList.add('page-enter');
      setTimeout(() => main.classList.remove('page-enter'), 400);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 150);

    // Update page title in header
    const headerTitle = document.getElementById('header-page-title');
    if (headerTitle) {
      headerTitle.textContent = pageId === 'home' ? 'Dashboard' : this.pages[pageId].label;
    }
  },

  buildSidebar() {
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = Object.entries(this.pages).map(([id, page]) => `
      <a class="nav-item${id === this.currentPage ? ' active' : ''}" data-page="${id}" href="#" title="${page.label}">
        <span class="nav-icon">${ICONS[page.icon]}</span>
        <span class="nav-label">${page.label}</span>
        ${id !== 'home' && id !== 'overzicht' ? `<span class="nav-badge" id="nav-badge-${id}"></span>` : ''}
      </a>
    `).join('');

    nav.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        this.navigate(el.dataset.page);
        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('mobile-open');
      });
    });

    this.updateNavBadges();
  },

  buildBottomNav() {
    const mobilePages = ['home', 'zeiltas', 'kleding', 'overzicht'];
    const nav = document.getElementById('bottom-nav');
    nav.innerHTML = Object.entries(this.pages).map(([id, page]) => `
      <button class="bottom-nav-item${id === this.currentPage ? ' active' : ''}" data-page="${id}" title="${page.label}">
        <span class="bottom-nav-icon">${ICONS[page.icon]}</span>
        <span class="bottom-nav-label">${page.label}</span>
      </button>
    `).join('');

    nav.querySelectorAll('.bottom-nav-item').forEach(el => {
      el.addEventListener('click', () => this.navigate(el.dataset.page));
    });
  },

  updateNavBadges() {
    CATEGORY_ORDER.forEach(catId => {
      const badge = document.getElementById(`nav-badge-${catId}`);
      if (!badge) return;
      const { percent } = Statistics.getCategoryStats(catId);
      badge.textContent  = `${percent}%`;
      badge.style.background = percent === 100
        ? 'var(--success)'
        : percent > 0 ? 'var(--accent-blue)' : 'var(--bg-card-alt)';
    });
  },
};
