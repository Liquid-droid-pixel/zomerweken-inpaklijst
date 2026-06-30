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

  // Load from Firestore on startup and merge into localStorage
  async loadAndMerge() {
    this._showSyncStatus('syncing');
    try {
      const doc = await this.docRef.get();
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
      console.error('Firebase load error:', e);
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

      // Only update if data actually changed and didn't come from us
      if (incoming === this.lastSaved) return;
      this.lastSaved = incoming;

      // Merge into localStorage
      Storage.importAll(data);

      // Refresh the current page view
      if (typeof Navigation !== 'undefined') {
        Navigation.navigate(Navigation.currentPage, false);
        Navigation.updateNavBadges();
      }

      // Update sticky widget
      if (typeof App !== 'undefined') {
        App.updateAllProgress();
      }

      Toast.show('Synced from another device', 'info');
    }, err => {
      console.error('Firebase listener error:', err);
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
