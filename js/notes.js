// js/notes.js — Notes modal management

const Notes = {
  currentItemId: null,
  currentItemName: null,

  open(itemId, itemName) {
    this.currentItemId   = itemId;
    this.currentItemName = itemName;

    const notes      = Storage.getNotes();
    const existingNote = notes[itemId] || '';

    const overlay = document.getElementById('modal-overlay');
    const title   = document.getElementById('modal-title');
    const textarea= document.getElementById('modal-textarea');
    const counter = document.getElementById('modal-char-count');

    title.textContent    = itemName;
    textarea.value       = existingNote;
    counter.textContent  = `${existingNote.length} / 500`;

    overlay.classList.add('active');
    setTimeout(() => textarea.focus(), 100);

    textarea.oninput = () => {
      const len = textarea.value.length;
      counter.textContent = `${len} / 500`;
      if (len > 500) textarea.value = textarea.value.slice(0, 500);
    };
  },

  close() {
    document.getElementById('modal-overlay').classList.remove('active');
    this.currentItemId   = null;
    this.currentItemName = null;
  },

  save() {
    if (!this.currentItemId) return;
    const textarea = document.getElementById('modal-textarea');
    const text = textarea.value.trim();
    const notes = Storage.getNotes();

    if (text) {
      notes[this.currentItemId] = text;
    } else {
      delete notes[this.currentItemId];
    }

    Storage.setNotes(notes);
    App.refreshNoteButton(this.currentItemId, !!text);
    Toast.show(text ? 'Note saved' : 'Note deleted', text ? 'success' : 'info');
    this.close();
  },

  delete() {
    if (!this.currentItemId) return;
    const notes = Storage.getNotes();
    delete notes[this.currentItemId];
    Storage.setNotes(notes);
    App.refreshNoteButton(this.currentItemId, false);
    Toast.show('Note deleted', 'info');
    this.close();
  },
};
