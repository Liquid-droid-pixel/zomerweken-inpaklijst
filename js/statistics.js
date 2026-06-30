// js/statistics.js — Progress and statistics calculations

const Statistics = {
  getCategoryStats(categoryId) {
    const category = CHECKLIST_DATA[categoryId];
    if (!category) return { total: 0, packed: 0, remaining: 0, percent: 0 };
    const checklist = Storage.getChecklist();
    const total     = category.items.length;
    const packed    = category.items.filter(item => checklist[item.id]).length;
    const remaining = total - packed;
    const percent   = total > 0 ? Math.round((packed / total) * 100) : 0;
    return { total, packed, remaining, percent };
  },

  getOverallStats() {
    const checklist = Storage.getChecklist();
    let total = 0, packed = 0;
    CATEGORY_ORDER.forEach(catId => {
      const cat = CHECKLIST_DATA[catId];
      total  += cat.items.length;
      packed += cat.items.filter(i => checklist[i.id]).length;
    });
    const remaining = total - packed;
    const percent   = total > 0 ? Math.round((packed / total) * 100) : 0;
    return { total, packed, remaining, percent };
  },

  getAllCategoryStats() {
    return CATEGORY_ORDER.map(id => ({
      id,
      ...CHECKLIST_DATA[id],
      ...this.getCategoryStats(id),
    }));
  },

  getRecentlyPacked(limit = 8) {
    const timestamps = Storage.getTimestamps();
    const checklist  = Storage.getChecklist();
    const notes      = Storage.getNotes();
    const items = [];

    CATEGORY_ORDER.forEach(catId => {
      const cat = CHECKLIST_DATA[catId];
      cat.items.forEach(item => {
        if (checklist[item.id] && timestamps[item.id]) {
          items.push({
            ...item,
            categoryId:   catId,
            categoryName: cat.name,
            categoryColor:cat.color,
            packedAt:     timestamps[item.id],
            hasNote:      !!notes[item.id],
          });
        }
      });
    });

    return items
      .sort((a, b) => new Date(b.packedAt) - new Date(a.packedAt))
      .slice(0, limit);
  },

  getItemsWithNotes() {
    const notes = Storage.getNotes();
    const result = [];
    CATEGORY_ORDER.forEach(catId => {
      const cat = CHECKLIST_DATA[catId];
      cat.items.forEach(item => {
        if (notes[item.id]) {
          result.push({
            ...item,
            categoryId:   catId,
            categoryName: cat.name,
            categoryColor:cat.color,
            note:         notes[item.id],
          });
        }
      });
    });
    return result;
  },

  getUnpackedItems() {
    const checklist = Storage.getChecklist();
    const result = [];
    CATEGORY_ORDER.forEach(catId => {
      const cat = CHECKLIST_DATA[catId];
      cat.items.forEach(item => {
        if (!checklist[item.id]) {
          result.push({
            ...item,
            categoryId:   catId,
            categoryName: cat.name,
            categoryColor:cat.color,
          });
        }
      });
    });
    return result;
  },

  isEverythingPacked() {
    const { total, packed } = this.getOverallStats();
    return total > 0 && total === packed;
  },
};
