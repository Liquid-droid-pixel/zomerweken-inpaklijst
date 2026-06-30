// js/storage.js — LocalStorage persistence layer

const Storage = {
  KEYS: {
    CHECKLIST:  'randmeren_checklist',
    NOTES:      'randmeren_notes',
    THEME:      'randmeren_theme',
    TIMESTAMPS: 'randmeren_timestamps',
    FAVORITES:  'randmeren_favorites',
    ACTIVITY:   'randmeren_activity',
    COLLAPSED:  'randmeren_collapsed',
  },

  _get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  _set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  },

  getChecklist()       { return this._get(this.KEYS.CHECKLIST)  || {}; },
  setChecklist(d)      { return this._set(this.KEYS.CHECKLIST, d); },

  getNotes()           { return this._get(this.KEYS.NOTES)       || {}; },
  setNotes(d)          { return this._set(this.KEYS.NOTES, d); },

  getTheme()           { return this._get(this.KEYS.THEME)       || 'dark'; },
  setTheme(t)          { return this._set(this.KEYS.THEME, t); },

  getTimestamps()      { return this._get(this.KEYS.TIMESTAMPS)  || {}; },
  setTimestamps(d)     { return this._set(this.KEYS.TIMESTAMPS, d); },

  getFavorites()       { return this._get(this.KEYS.FAVORITES)   || {}; },
  setFavorites(d)      { return this._set(this.KEYS.FAVORITES, d); },

  getCollapsed()       { return this._get(this.KEYS.COLLAPSED)   || {}; },
  setCollapsed(d)      { return this._set(this.KEYS.COLLAPSED, d); },

  getActivity()        { return this._get(this.KEYS.ACTIVITY)    || []; },

  addActivity(entry) {
    const list = this.getActivity();
    list.unshift({ ...entry, id: Date.now() });
    if (list.length > 30) list.splice(30);
    this._set(this.KEYS.ACTIVITY, list);
  },

  clearAll() {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
  },

  exportAll() {
    return {
      checklist:  this.getChecklist(),
      notes:      this.getNotes(),
      timestamps: this.getTimestamps(),
      favorites:  this.getFavorites(),
      exportedAt: new Date().toISOString(),
    };
  },

  importAll(data) {
    if (data.checklist)  this.setChecklist(data.checklist);
    if (data.notes)      this.setNotes(data.notes);
    if (data.timestamps) this.setTimestamps(data.timestamps);
    if (data.favorites)  this.setFavorites(data.favorites);
  },
};
