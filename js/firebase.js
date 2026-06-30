// js/firebase.js — Firebase Firestore sync

const firebaseConfig = {
  apiKey:            "AIzaSyDdf6cb2PT8Ju33gnyIVVbVfen2bepWqF4",
  authDomain:        "zomerweken-inpaklijst.firebaseapp.com",
  projectId:         "zomerweken-inpaklijst",
  storageBucket:     "zomerweken-inpaklijst.firebasestorage.app",
  messagingSenderId: "427676322645",
  appId:             "1:427676322645:web:975f2febc1f681c5333ddc",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const FirebaseSync = {
  docRef:      db.collection('inpaklijst').doc('shared'),
  saveTimer:   null,
  isListening: false,
  lastSaved:   null,

  // Save all data to Firestore (debounced 1.5s to avoid too many writes)
  scheduleSave() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveNow(), 1500);
  },

  async saveNow() {
    const data = {
      checklist:  Storage.getChecklist(),
      notes:      Storage.getNotes(),
      timestamps: Storage.getTimestamps(),
      favorites:  Storage.getFavorites(),
      updatedAt:  new Date().toISOString(),
    };

    // Skip if nothing changed
    const serialized = JSON.stringify(data);
    if (serialized === this.lastSaved) return;
    this.lastSaved = serialized;

    try {
      await this.docRef.set(data);
      this._showSyncStatus('synced');
    } catch (e) {
      console.error('Firebase save error:', e);
      this._showSyncStatus('error');
    }
  },

  // Load from Firestore on startup and merge into localStorage (3s timeout fallback)
  async loadAndMerge() {
    this._showSyncStatus('syncing');
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 4000)
      );
      const fetch = this.docRef.get();
      const doc = await Promise.race([fetch, timeout]);
      if (doc.exists) {
        const data = doc.data();
        Storage.importAll(data);
        this.lastSaved = JSON.stringify(data);
        this._showSyncStatus('synced');
        return true;
      }
      this._showSyncStatus('synced');
      return false;
    } catch (e) {
      console.warn('Firebase load failed, using localStorage:', e.message);
      this._showSyncStatus('offline');
      return false;
    }
  },

  // Listen for real-time changes from other devices
  startListening() {
    if (this.isListening) return;
    this.isListening = true;

    this.docRef.onSnapshot(doc => {
      if (!doc.exists) return;
      const data     = doc.data();
      const incoming = JSON.stringify(data);

      // Ignore if this is our own save coming back
      if (incoming === this.lastSaved) return;
      this.lastSaved = incoming;

      // Silently merge into localStorage
      const oldChecklist = JSON.stringify(Storage.getChecklist());
      Storage.importAll(data);
      const newChecklist = JSON.stringify(Storage.getChecklist());

      // Only update UI if checklist actually changed
      if (oldChecklist === newChecklist) return;

      // Update checkboxes in-place without re-rendering the page
      this._patchCheckboxes(data.checklist || {}, data.timestamps || {});

      // Update progress bars and nav badges silently
      if (typeof App !== 'undefined') App.updateAllProgress();
      if (typeof Navigation !== 'undefined') Navigation.updateNavBadges();

      Toast.show('Updated from another device', 'info', 2000);
    }, err => {
      console.error('Firebase listener error:', err);
    });
  },

  // Patch only the changed checkboxes in the DOM without full re-render
  _patchCheckboxes(checklist, timestamps) {
    CATEGORY_ORDER.forEach(catId => {
      CHECKLIST_DATA[catId].items.forEach(item => {
        const cb     = document.getElementById(`cb-${item.id}`);
        const itemEl = document.getElementById(`item-${item.id}`);
        if (!cb || !itemEl) return;

        const shouldBeChecked = !!checklist[item.id];
        if (cb.checked === shouldBeChecked) return;

        cb.checked = shouldBeChecked;
        itemEl.classList.toggle('checked', shouldBeChecked);

        const tsEl = itemEl.querySelector('.item-timestamp');
        if (shouldBeChecked && timestamps[item.id]) {
          if (tsEl) {
            tsEl.innerHTML = `${ICONS.clock} Packed ${App.formatTime(timestamps[item.id])}`;
          } else {
            const body = itemEl.querySelector('.item-body');
            if (body) {
              const span = document.createElement('span');
              span.className = 'item-timestamp';
              span.innerHTML = `${ICONS.clock} Packed ${App.formatTime(timestamps[item.id])}`;
              body.appendChild(span);
            }
          }
        } else {
          if (tsEl) tsEl.remove();
        }
      });
    });
  },

  _showSyncStatus(status) {
    const el = document.getElementById('sync-status');
    if (!el) return;
    const states = {
      syncing: { text: 'Syncing…',  color: 'var(--warning)', icon: '↻' },
      synced:  { text: 'Synced',    color: 'var(--success)', icon: '✓' },
      offline: { text: 'Offline',   color: 'var(--text-muted)', icon: '⚠' },
      error:   { text: 'Sync error',color: 'var(--danger)',  icon: '✕' },
    };
    const s = states[status] || states.synced;
    el.textContent  = `${s.icon} ${s.text}`;
    el.style.color  = s.color;
  },
};
