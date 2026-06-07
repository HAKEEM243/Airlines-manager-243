/* ===== SAVE / LOAD SYSTEM — Hakvision Aircraft ===== */
const SaveSystem = {
  KEY: 'hakvision_aircraft_save',
  META_KEY: 'hakvision_aircraft_meta',
  AUTO_INTERVAL: 60000, // 60 seconds real time
  _timer: null,

  hasSave() {
    return !!localStorage.getItem(this.KEY);
  },

  getMeta() {
    const raw = localStorage.getItem(this.META_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  save() {
    try {
      const data = GS.serializeForSave();
      localStorage.setItem(this.KEY, data);
      const meta = {
        company: GS.company ? GS.company.name : 'Inconnu',
        iata: GS.company ? GS.company.iata : 'XX',
        balance: GS.finances.balance,
        fleet: GS.fleet.length,
        routes: GS.routes.length,
        reputation: GS.company ? GS.company.reputation : 0,
        gameDate: GS.gameDate.toISOString(),
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(this.META_KEY, JSON.stringify(meta));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  },

  load() {
    try {
      const data = localStorage.getItem(this.KEY);
      if (!data) return false;
      const aiState = GS.deserializeFromSave(data);
      if (aiState && GS.ai) {
        GS.ai.loadState(aiState);
      }
      return true;
    } catch (e) {
      console.error('Load failed:', e);
      return false;
    }
  },

  deleteSave() {
    localStorage.removeItem(this.KEY);
    localStorage.removeItem(this.META_KEY);
  },

  startAutoSave() {
    if (this._timer) clearInterval(this._timer);
    this._timer = setInterval(() => {
      if (!GS.paused && GS.company && GS.settings.autoSave) {
        this.save();
        UI.notify('Partie sauvegardée automatiquement.', 'info', 2000);
      }
    }, this.AUTO_INTERVAL);
  },

  stopAutoSave() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  },

  formatDate(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  formatGameDate(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  },
};
