// js/checklist.js — Checklist item rendering and interaction

const Checklist = {
  renderItem(item, categoryColor) {
    const checklist  = Storage.getChecklist();
    const notes      = Storage.getNotes();
    const timestamps = Storage.getTimestamps();
    const favorites  = Storage.getFavorites();
    const isChecked  = !!checklist[item.id];
    const hasNote    = !!notes[item.id];
    const isFavorite = !!favorites[item.id];
    const ts         = timestamps[item.id];

    const badges = [];
    if (item.optional) badges.push(`<span class="badge badge-optional">Optional</span>`);
    if (item.weather)  badges.push(`<span class="badge badge-weather">${ICONS.cloud} Weather</span>`);
    if (item.conditional) badges.push(`<span class="badge badge-conditional">Conditional</span>`);

    return `
      <div class="checklist-item${isChecked ? ' checked' : ''}" data-id="${item.id}" id="item-${item.id}">
        <label class="item-checkbox-wrapper" for="cb-${item.id}" aria-label="Pack ${item.name}">
          <input type="checkbox" id="cb-${item.id}" class="item-checkbox sr-only"
            data-id="${item.id}" ${isChecked ? 'checked' : ''}>
          <span class="custom-checkbox" style="--check-color:${categoryColor}">
            <span class="check-icon">${ICONS.check}</span>
          </span>
        </label>

        <div class="item-body">
          <div class="item-top-row">
            <span class="item-name">${item.name}</span>
            <div class="item-badges">${badges.join('')}</div>
          </div>
          ${item.subtitle ? `<span class="item-subtitle">${item.subtitle}</span>` : ''}
          ${ts ? `<span class="item-timestamp">${ICONS.clock} Packed ${App.formatTime(ts)}</span>` : ''}
        </div>

        <div class="item-actions">
          <button class="action-btn note-btn${hasNote ? ' has-note' : ''}"
            data-id="${item.id}" data-name="${item.name}"
            title="${hasNote ? 'Edit note' : 'Add note'}"
            aria-label="${hasNote ? 'Edit note' : 'Add note'} for ${item.name}">
            ${ICONS.note}
          </button>
          <button class="action-btn fav-btn${isFavorite ? ' is-favorite' : ''}"
            data-id="${item.id}" title="Favourite" aria-label="Toggle favourite for ${item.name}">
            ${isFavorite ? ICONS.starFilled : ICONS.star}
          </button>
        </div>
      </div>
    `;
  },

  renderCategory(categoryId, filterFn = null) {
    const cat   = CHECKLIST_DATA[categoryId];
    const items = filterFn ? cat.items.filter(filterFn) : cat.items;

    if (items.length === 0) {
      return `<p class="empty-state">No items match your search.</p>`;
    }
    return items.map(item => this.renderItem(item, cat.color)).join('');
  },

  bindEvents(container) {
    // Checkbox toggle
    container.querySelectorAll('.item-checkbox').forEach(cb => {
      cb.addEventListener('change', e => {
        const id = e.target.dataset.id;
        this.toggle(id, e.target.checked);
      });
    });

    // Note button
    container.querySelectorAll('.note-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Notes.open(btn.dataset.id, btn.dataset.name);
      });
    });

    // Favourite button
    container.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = btn.dataset.id;
        const favs = Storage.getFavorites();
        const next = !favs[id];
        if (next) favs[id] = true; else delete favs[id];
        Storage.setFavorites(favs);
        btn.classList.toggle('is-favorite', next);
        btn.innerHTML = next ? ICONS.starFilled : ICONS.star;
        Toast.show(next ? 'Added to favourites' : 'Removed from favourites', 'info');
      });
    });
  },

  toggle(itemId, checked) {
    const checklist  = Storage.getChecklist();
    const timestamps = Storage.getTimestamps();

    // Store for undo
    App.undoStack.push({
      type: 'toggle',
      itemId,
      wasChecked: !!checklist[itemId],
      wasTimestamp: timestamps[itemId],
    });

    if (checked) {
      checklist[itemId]  = true;
      timestamps[itemId] = new Date().toISOString();
    } else {
      delete checklist[itemId];
      delete timestamps[itemId];
    }

    Storage.setChecklist(checklist);
    Storage.setTimestamps(timestamps);

    // Find item info for activity log
    let itemName = itemId, catName = '';
    CATEGORY_ORDER.forEach(catId => {
      const found = CHECKLIST_DATA[catId].items.find(i => i.id === itemId);
      if (found) { itemName = found.name; catName = CHECKLIST_DATA[catId].name; }
    });

    if (checked) {
      Storage.addActivity({ action: 'packed', itemId, itemName, catName });
    }

    // Update UI in place
    const itemEl = document.getElementById(`item-${itemId}`);
    if (itemEl) {
      itemEl.classList.toggle('checked', checked);
      const tsEl = itemEl.querySelector('.item-timestamp');
      if (checked) {
        const now = new Date().toISOString();
        if (tsEl) {
          tsEl.innerHTML = `${ICONS.clock} Packed ${App.formatTime(now)}`;
        } else {
          const body = itemEl.querySelector('.item-body');
          const span = document.createElement('span');
          span.className = 'item-timestamp';
          span.innerHTML = `${ICONS.clock} Packed ${App.formatTime(now)}`;
          body.appendChild(span);
        }
      } else {
        if (tsEl) tsEl.remove();
      }
    }

    // Update progress bars and nav badges
    App.updateAllProgress();
    Navigation.updateNavBadges();

    // Check for completion
    if (checked && Statistics.isEverythingPacked()) {
      App.celebrateCompletion();
    } else if (checked) {
      Toast.show(`${itemName} packed!`, 'success');
    }
  },
};
