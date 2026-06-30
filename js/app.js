// js/app.js — Main application orchestration

// ─── Toast Notifications ────────────────────────────────────────────────────
const Toast = {
  show(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = { success: ICONS.check, info: ICONS.zap, error: ICONS.x, warning: ICONS.cloud };
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || ICONS.zap}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Dismiss">${ICONS.x}</button>
    `;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('visible'));

    const remove = () => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('.toast-close').addEventListener('click', remove);
    setTimeout(remove, duration);
  },
};

// ─── Confetti ────────────────────────────────────────────────────────────────
const Confetti = {
  canvas: null,
  ctx: null,
  particles: [],
  running: false,

  launch() {
    if (this.running) return;
    this.canvas = document.getElementById('confetti-canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.particles = [];
    const colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#fff'];
    for (let i = 0; i < 200; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: -20,
        w: Math.random() * 10 + 4,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 2,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 6,
        opacity: 1,
      });
    }
    this.running = true;
    this.animate();
    setTimeout(() => { this.running = false; this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height); }, 4000);
  },

  animate() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.rot += p.rotSpeed;
      p.vy += 0.08;
      p.opacity = Math.max(0, p.opacity - 0.006);
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rot * Math.PI / 180);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle   = p.color;
      this.ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      this.ctx.restore();
    });
    requestAnimationFrame(() => this.animate());
  },
};

// ─── Pages ───────────────────────────────────────────────────────────────────
const Pages = {
  renderHome() {
    const stats   = Statistics.getOverallStats();
    const allCats = Statistics.getAllCategoryStats();
    const recent  = Statistics.getRecentlyPacked(6);
    const main    = document.getElementById('main-content');

    main.innerHTML = `
      <div class="page page-home">
        <!-- Hero welcome card -->
        <div class="hero-card glass-card">
          <div class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title">Randmeren Inpaklijst</h1>
              <p class="hero-subtitle">Zomerweken ${new Date().getFullYear()} — Packing Dashboard</p>
              <div class="hero-meta">
                <span class="hero-badge">${ICONS.target} ${stats.percent}% Complete</span>
                <span class="hero-badge badge-secondary">${stats.packed} / ${stats.total} items</span>
              </div>
            </div>
            <div class="hero-chart">
              ${App.renderCircularProgress(stats.percent)}
            </div>
          </div>
          <div class="progress-bar-wrapper">
            <div class="progress-bar" style="--target:${stats.percent}%">
              <div class="progress-fill" style="width:${stats.percent}%"></div>
            </div>
          </div>
        </div>

        <!-- Stat cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(59,130,246,.15);color:#3b82f6">${ICONS.package}</div>
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Total Items</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(16,185,129,.15);color:#10b981">${ICONS.check}</div>
            <div class="stat-value success-text">${stats.packed}</div>
            <div class="stat-label">Packed</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(245,158,11,.15);color:#f59e0b">${ICONS.clock}</div>
            <div class="stat-value warning-text">${stats.remaining}</div>
            <div class="stat-label">Remaining</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(139,92,246,.15);color:#8b5cf6">${ICONS.target}</div>
            <div class="stat-value purple-text">${stats.percent}%</div>
            <div class="stat-label">Complete</div>
          </div>
        </div>

        <!-- Category progress grid -->
        <section class="section">
          <h2 class="section-title">${ICONS.activity} Category Progress</h2>
          <div class="category-grid">
            ${allCats.map(cat => `
              <div class="category-card clickable" data-page="${cat.id}" role="button" tabindex="0"
                aria-label="Open ${cat.name}">
                <div class="category-card-header">
                  <div class="category-icon-wrap" style="background:${cat.color}22;color:${cat.color}">
                    ${ICONS[cat.icon]}
                  </div>
                  <div class="category-card-info">
                    <div class="category-card-name">${cat.name}</div>
                    <div class="category-card-count">${cat.packed} / ${cat.total}</div>
                  </div>
                  <div class="category-percent" style="color:${cat.color}">${cat.percent}%</div>
                </div>
                <div class="progress-bar-sm">
                  <div class="progress-fill-sm" style="width:${cat.percent}%;background:${cat.color}"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Recent activity -->
        ${recent.length > 0 ? `
        <section class="section">
          <h2 class="section-title">${ICONS.clock} Recently Packed</h2>
          <div class="recent-list">
            ${recent.map(item => `
              <div class="recent-item">
                <div class="recent-dot" style="background:${item.categoryColor}"></div>
                <div class="recent-info">
                  <span class="recent-name">${item.name}</span>
                  <span class="recent-cat">${item.categoryName}</span>
                </div>
                <span class="recent-time">${App.formatTime(item.packedAt)}</span>
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}

        <!-- Quick access -->
        <section class="section">
          <h2 class="section-title">${ICONS.zap} Quick Access</h2>
          <div class="quick-grid">
            ${CATEGORY_ORDER.map(id => {
              const cat = CHECKLIST_DATA[id];
              const s   = Statistics.getCategoryStats(id);
              return `
                <button class="quick-btn" data-page="${id}"
                  style="--cat-color:${cat.color};--cat-color-dark:${cat.colorDark}">
                  <span class="quick-icon">${ICONS[cat.icon]}</span>
                  <span class="quick-name">${cat.name}</span>
                  <span class="quick-pct">${s.percent}%</span>
                </button>
              `;
            }).join('')}
          </div>
        </section>
      </div>
    `;

    // Bind quick-access clicks
    main.querySelectorAll('[data-page]').forEach(el => {
      const handler = () => Navigation.navigate(el.dataset.page);
      el.addEventListener('click', handler);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(); });
    });

    // Animate progress bars
    requestAnimationFrame(() => {
      main.querySelectorAll('.progress-fill, .progress-fill-sm').forEach(el => {
        el.style.transition = 'width 1s cubic-bezier(.4,0,.2,1)';
      });
    });
  },

  renderCategory(categoryId) {
    const cat    = CHECKLIST_DATA[categoryId];
    const stats  = Statistics.getCategoryStats(categoryId);
    const main   = document.getElementById('main-content');
    const collapsed = Storage.getCollapsed();
    const isCollapsed = collapsed[categoryId];

    main.innerHTML = `
      <div class="page page-category" data-category="${categoryId}">
        <!-- Category hero -->
        <div class="cat-hero glass-card" style="--cat-color:${cat.color}">
          <div class="cat-hero-left">
            <div class="cat-hero-icon" style="background:${cat.color}22;color:${cat.color}">
              ${ICONS[cat.icon]}
            </div>
            <div>
              <h1 class="cat-hero-title">${cat.name}</h1>
              <p class="cat-hero-sub">${stats.packed} packed · ${stats.remaining} remaining</p>
            </div>
          </div>
          <div class="cat-hero-pct" style="color:${cat.color}">${stats.percent}%</div>
        </div>

        <!-- Progress bar -->
        <div class="cat-progress-card glass-card">
          <div class="cat-progress-labels">
            <span>Progress</span>
            <span>${stats.packed} / ${stats.total}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" id="cat-progress-fill"
              style="width:${stats.percent}%;background:${cat.color}"></div>
          </div>
        </div>

        <!-- Filter / search bar -->
        <div class="cat-toolbar">
          <div class="search-box-inline">
            <span class="search-icon-inline">${ICONS.search}</span>
            <input type="text" id="cat-search" placeholder="Search items…" class="search-input-inline"
              aria-label="Search items in ${cat.name}">
          </div>
          <div class="filter-chips" id="filter-chips">
            <button class="chip active" data-filter="all">All</button>
            <button class="chip" data-filter="packed">Packed</button>
            <button class="chip" data-filter="missing">Missing</button>
            <button class="chip" data-filter="notes">With Notes</button>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="cat-quick-actions">
          <button class="btn-ghost btn-sm" id="btn-check-all" title="Check all items">
            ${ICONS.check} Pack All
          </button>
          <button class="btn-ghost btn-sm" id="btn-uncheck-all" title="Uncheck all items">
            ${ICONS.x} Unpack All
          </button>
          <button class="btn-ghost btn-sm" id="btn-collapse" title="Collapse/expand">
            ${ICONS.chevronDown} Collapse
          </button>
        </div>

        <!-- Checklist -->
        <div class="checklist-card glass-card" id="checklist-container">
          <div class="checklist-items" id="checklist-items">
            ${Checklist.renderCategory(categoryId)}
          </div>
        </div>
      </div>
    `;

    Checklist.bindEvents(main);

    // Search
    const searchInput = document.getElementById('cat-search');
    searchInput.addEventListener('input', () => {
      App.filterCategory(categoryId, searchInput.value);
    });

    // Filter chips
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        App.applyFilter(categoryId, chip.dataset.filter, searchInput.value);
      });
    });

    // Pack all / Unpack all
    document.getElementById('btn-check-all').addEventListener('click', () => {
      cat.items.forEach(item => {
        const cb = document.getElementById(`cb-${item.id}`);
        if (cb && !cb.checked) { cb.checked = true; Checklist.toggle(item.id, true); }
      });
    });
    document.getElementById('btn-uncheck-all').addEventListener('click', () => {
      cat.items.forEach(item => {
        const cb = document.getElementById(`cb-${item.id}`);
        if (cb && cb.checked) { cb.checked = false; Checklist.toggle(item.id, false); }
      });
    });

    // Collapse
    const collapseBtn = document.getElementById('btn-collapse');
    const itemsEl     = document.getElementById('checklist-items');
    if (isCollapsed) itemsEl.style.display = 'none';
    collapseBtn.addEventListener('click', () => {
      const now = Storage.getCollapsed();
      if (itemsEl.style.display === 'none') {
        itemsEl.style.display = '';
        delete now[categoryId];
        collapseBtn.innerHTML = `${ICONS.chevronDown} Collapse`;
      } else {
        itemsEl.style.display = 'none';
        now[categoryId] = true;
        collapseBtn.innerHTML = `${ICONS.chevronRight} Expand`;
      }
      Storage.setCollapsed(now);
    });

    // Animate progress
    requestAnimationFrame(() => {
      const fill = document.getElementById('cat-progress-fill');
      if (fill) fill.style.transition = 'width 1s cubic-bezier(.4,0,.2,1)';
    });
  },

  renderOverview() {
    const stats   = Statistics.getOverallStats();
    const allCats = Statistics.getAllCategoryStats();
    const withNotes = Statistics.getItemsWithNotes();
    const checklist = Storage.getChecklist();
    const main    = document.getElementById('main-content');

    main.innerHTML = `
      <div class="page page-overview">
        <div class="overview-hero glass-card">
          <h1 class="overview-title">${ICONS.overview} Overzicht</h1>
          <p class="overview-sub">Complete packing overview — ${stats.percent}% done</p>
          <div class="overview-actions">
            <button class="btn-primary" id="btn-print">${ICONS.printer} Print</button>
            <button class="btn-ghost" id="btn-export-pdf">${ICONS.download} Export PDF</button>
            <button class="btn-ghost" id="btn-export-json">${ICONS.save} Export JSON</button>
            <label class="btn-ghost" title="Import JSON">
              ${ICONS.upload} Import JSON
              <input type="file" id="import-file" accept=".json" style="display:none">
            </label>
          </div>
        </div>

        <!-- Overall progress -->
        <div class="overview-stats">
          <div class="stat-card"><div class="stat-value">${stats.total}</div><div class="stat-label">Total</div></div>
          <div class="stat-card"><div class="stat-value success-text">${stats.packed}</div><div class="stat-label">Packed</div></div>
          <div class="stat-card"><div class="stat-value warning-text">${stats.remaining}</div><div class="stat-label">Missing</div></div>
          <div class="stat-card"><div class="stat-value purple-text">${stats.percent}%</div><div class="stat-label">Done</div></div>
        </div>

        <!-- Per-category breakdown -->
        ${allCats.map(cat => {
          const catItems  = CHECKLIST_DATA[cat.id].items;
          const packed    = catItems.filter(i => checklist[i.id]);
          const missing   = catItems.filter(i => !checklist[i.id]);
          return `
            <div class="overview-section glass-card">
              <div class="overview-section-header" style="border-left:4px solid ${cat.color}">
                <div class="cat-title-row">
                  <span class="cat-icon-sm" style="color:${cat.color}">${ICONS[cat.icon]}</span>
                  <span class="cat-name-lg">${cat.name}</span>
                  <span class="cat-pct-sm" style="color:${cat.color}">${cat.percent}%</span>
                </div>
                <div class="progress-bar-sm">
                  <div class="progress-fill-sm" style="width:${cat.percent}%;background:${cat.color}"></div>
                </div>
              </div>

              ${packed.length > 0 ? `
                <div class="ov-group">
                  <div class="ov-group-title success-text">${ICONS.check} Packed (${packed.length})</div>
                  <div class="ov-items">
                    ${packed.map(i => `
                      <div class="ov-item ov-packed">
                        <span class="ov-check">${ICONS.check}</span>
                        <span class="ov-name">${i.name}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${missing.length > 0 ? `
                <div class="ov-group">
                  <div class="ov-group-title warning-text">${ICONS.clock} Missing (${missing.length})</div>
                  <div class="ov-items">
                    ${missing.map(i => `
                      <div class="ov-item ov-missing">
                        <span class="ov-dot"></span>
                        <span class="ov-name">${i.name}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}

        <!-- Notes section -->
        ${withNotes.length > 0 ? `
          <div class="overview-section glass-card">
            <h2 class="section-title">${ICONS.note} All Notes</h2>
            ${withNotes.map(item => `
              <div class="note-overview-item">
                <div class="note-ov-header">
                  <span class="note-ov-dot" style="background:${item.categoryColor}"></span>
                  <strong>${item.name}</strong>
                  <span class="note-ov-cat">${item.categoryName}</span>
                </div>
                <p class="note-ov-text">"${item.note}"</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    document.getElementById('btn-print').addEventListener('click', () => window.print());
    document.getElementById('btn-export-json').addEventListener('click', () => App.exportJSON());
    document.getElementById('btn-export-pdf').addEventListener('click', () => App.exportPDF());
    document.getElementById('import-file').addEventListener('change', e => App.importJSON(e));
  },
};

// ─── Main App ─────────────────────────────────────────────────────────────────
const App = {
  undoStack: [],
  autoSaveTimer: null,
  currentFilter: 'all',
  currentSearch: '',

  init() {
    // Apply saved theme
    const theme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-toggle').innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;

    // Build navigation
    Navigation.buildSidebar();
    Navigation.buildBottomNav();

    // Render default page
    Navigation.navigate('home', false);

    // Modal events
    document.getElementById('modal-save').addEventListener('click', () => Notes.save());
    document.getElementById('modal-delete').addEventListener('click', () => Notes.delete());
    document.getElementById('modal-close').addEventListener('click', () => Notes.close());
    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target === document.getElementById('modal-overlay')) Notes.close();
    });

    // Global search
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
      globalSearch.addEventListener('input', e => {
        this.currentSearch = e.target.value.trim().toLowerCase();
        App.handleGlobalSearch(this.currentSearch);
      });
    }

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next    = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      Storage.setTheme(next);
      document.getElementById('theme-toggle').innerHTML = next === 'dark' ? ICONS.sun : ICONS.moon;
      Toast.show(`${next === 'dark' ? 'Dark' : 'Light'} mode enabled`, 'info');
    });

    // Mobile menu toggle
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('mobile-open');
    });

    // Sidebar overlay close
    document.getElementById('sidebar-overlay').addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('mobile-open');
    });

    // FAB
    document.getElementById('fab-btn').addEventListener('click', () => {
      document.getElementById('fab-menu').classList.toggle('open');
    });
    document.getElementById('fab-export').addEventListener('click', () => {
      this.exportJSON();
      document.getElementById('fab-menu').classList.remove('open');
    });
    document.getElementById('fab-undo').addEventListener('click', () => {
      this.undo();
      document.getElementById('fab-menu').classList.remove('open');
    });
    document.getElementById('fab-home').addEventListener('click', () => {
      Navigation.navigate('home');
      document.getElementById('fab-menu').classList.remove('open');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      // Escape closes modal / FAB menu
      if (e.key === 'Escape') {
        Notes.close();
        document.getElementById('fab-menu').classList.remove('open');
        document.getElementById('sidebar').classList.remove('mobile-open');
      }
      // Ctrl+Z undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        this.undo();
      }
      // Ctrl+/ focus search
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        const s = document.getElementById('global-search') || document.getElementById('cat-search');
        if (s) s.focus();
      }
    });

    // Auto-save indicator
    this.autoSaveTimer = setInterval(() => {
      const el = document.getElementById('autosave-indicator');
      if (el) { el.classList.add('pulse'); setTimeout(() => el.classList.remove('pulse'), 1000); }
    }, 10000);
  },

  // ── Progress ──────────────────────────────────────────────────────────────
  updateAllProgress() {
    const stats = Statistics.getOverallStats();

    // Update sticky progress widget
    const widgetPct  = document.getElementById('widget-pct');
    const widgetFill = document.getElementById('widget-fill');
    if (widgetPct)  widgetPct.textContent = `${stats.percent}%`;
    if (widgetFill) widgetFill.style.width = `${stats.percent}%`;

    // Update category page progress if open
    const catPage = document.querySelector('.page-category');
    if (catPage) {
      const catId = catPage.dataset.category;
      const cs    = Statistics.getCategoryStats(catId);
      const fill  = document.getElementById('cat-progress-fill');
      if (fill) fill.style.width = `${cs.percent}%`;
      const heroSub = document.querySelector('.cat-hero-sub');
      if (heroSub) heroSub.textContent = `${cs.packed} packed · ${cs.remaining} remaining`;
      const heroPct = document.querySelector('.cat-hero-pct');
      if (heroPct) heroPct.textContent = `${cs.percent}%`;
    }
  },

  // ── Note button refresh ───────────────────────────────────────────────────
  refreshNoteButton(itemId, hasNote) {
    const btn = document.querySelector(`.note-btn[data-id="${itemId}"]`);
    if (!btn) return;
    btn.classList.toggle('has-note', hasNote);
    btn.title = hasNote ? 'Edit note' : 'Add note';
  },

  // ── Filters ───────────────────────────────────────────────────────────────
  filterCategory(categoryId, search) {
    const filter = document.querySelector('.chip.active')?.dataset.filter || 'all';
    this.applyFilter(categoryId, filter, search);
  },

  applyFilter(categoryId, filter, search = '') {
    const checklist = Storage.getChecklist();
    const notes     = Storage.getNotes();
    const cat       = CHECKLIST_DATA[categoryId];
    const term      = search.toLowerCase();

    const visible = cat.items.filter(item => {
      const matchSearch = !term || item.name.toLowerCase().includes(term);
      const matchFilter =
        filter === 'all'    ? true :
        filter === 'packed' ? !!checklist[item.id] :
        filter === 'missing'? !checklist[item.id] :
        filter === 'notes'  ? !!notes[item.id] : true;
      return matchSearch && matchFilter;
    });

    const container = document.getElementById('checklist-items');
    if (!container) return;
    container.innerHTML = visible.length > 0
      ? visible.map(item => Checklist.renderItem(item, cat.color)).join('')
      : `<p class="empty-state">No items match your filters.</p>`;

    Checklist.bindEvents(container);
  },

  handleGlobalSearch(term) {
    const page = Navigation.currentPage;
    if (page !== 'home' && CHECKLIST_DATA[page]) {
      const catSearch = document.getElementById('cat-search');
      if (catSearch) { catSearch.value = term; this.filterCategory(page, term); }
    }
  },

  // ── Undo ─────────────────────────────────────────────────────────────────
  undo() {
    const action = this.undoStack.pop();
    if (!action) { Toast.show('Nothing to undo', 'info'); return; }

    if (action.type === 'toggle') {
      const checklist  = Storage.getChecklist();
      const timestamps = Storage.getTimestamps();
      if (action.wasChecked) {
        checklist[action.itemId]  = true;
        timestamps[action.itemId] = action.wasTimestamp;
      } else {
        delete checklist[action.itemId];
        delete timestamps[action.itemId];
      }
      Storage.setChecklist(checklist);
      Storage.setTimestamps(timestamps);

      const cb = document.getElementById(`cb-${action.itemId}`);
      if (cb) {
        cb.checked = action.wasChecked;
        const itemEl = document.getElementById(`item-${action.itemId}`);
        if (itemEl) {
          itemEl.classList.toggle('checked', action.wasChecked);
          const tsEl = itemEl.querySelector('.item-timestamp');
          if (action.wasChecked && action.wasTimestamp) {
            if (tsEl) tsEl.innerHTML = `${ICONS.clock} Packed ${this.formatTime(action.wasTimestamp)}`;
          } else {
            if (tsEl) tsEl.remove();
          }
        }
      }

      this.updateAllProgress();
      Navigation.updateNavBadges();
      Toast.show('Action undone', 'info');
    }
  },

  // ── Celebrations ──────────────────────────────────────────────────────────
  celebrateCompletion() {
    Confetti.launch();
    Toast.show('🎉 Everything packed! You\'re ready!', 'success', 6000);
  },

  // ── Export / Import ──────────────────────────────────────────────────────
  exportJSON() {
    const data = Storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `randmeren-inpaklijst-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.show('JSON exported', 'success');
  },

  importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        Storage.importAll(data);
        Toast.show('Import successful — reloading…', 'success');
        setTimeout(() => Navigation.navigate(Navigation.currentPage), 800);
      } catch {
        Toast.show('Import failed: invalid JSON', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  },

  exportPDF() {
    Toast.show('Opening print dialog for PDF…', 'info');
    setTimeout(() => window.print(), 400);
  },

  // ── Helpers ───────────────────────────────────────────────────────────────
  formatTime(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000)   return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000)return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  },

  renderCircularProgress(percent) {
    const r   = 54;
    const c   = 2 * Math.PI * r;
    const off = c - (percent / 100) * c;
    return `
      <svg class="circular-progress" viewBox="0 0 120 120" aria-label="${percent}% complete">
        <circle class="cp-track" cx="60" cy="60" r="${r}" fill="none" stroke-width="10"/>
        <circle class="cp-fill" cx="60" cy="60" r="${r}" fill="none" stroke-width="10"
          stroke-dasharray="${c}" stroke-dashoffset="${off}"
          transform="rotate(-90 60 60)"/>
        <text class="cp-text" x="60" y="60" text-anchor="middle" dominant-baseline="middle"
          font-size="22" font-weight="700">${percent}%</text>
      </svg>
    `;
  },
};

// ── Sticky progress widget update on scroll ───────────────────────────────────
window.addEventListener('scroll', () => {
  const widget = document.getElementById('progress-widget');
  if (widget) {
    widget.classList.toggle('visible', window.scrollY > 200);
  }
});

// ── Init on DOM ready ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
