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
      if (aiState) {
        AIEngine.loadAI(aiState);
      }
      // Background simulation catch-up: advance time for while the game was closed
      this.applyOfflineProgress();
      return true;
    } catch (e) {
      console.error('Load failed:', e);
      return false;
    }
  },

  // Simulate game progress for time elapsed since last save
  applyOfflineProgress() {
    const meta = this.getMeta();
    if (!meta || !meta.savedAt) return;
    const savedAt = new Date(meta.savedAt);
    const now = new Date();
    const elapsedRealMs = now - savedAt;
    if (elapsedRealMs < 60000) return; // less than 1 min, no catch-up needed

    // Game time to add: based on Standard mode (8 game-min / real-sec)
    // Cap at 7 days of game time to avoid overflow
    const realMinutes = elapsedRealMs / 60000;
    const gameMinutes = Math.min(realMinutes * 8, 7 * 24 * 60);
    const gameMs = gameMinutes * 60 * 1000;

    if (gameMinutes < 1) return;
    GS.gameDate = new Date(GS.gameDate.getTime() + gameMs);

    // Fast-complete any in-flight aircraft
    let completedFlights = 0;
    GS.fleet.forEach(aircraft => {
      if (aircraft.status === 'flying' && aircraft.arrivalTime) {
        const arrivalMs = new Date(aircraft.arrivalTime) - new Date(meta.savedAt);
        if (arrivalMs <= elapsedRealMs * 8) {
          aircraft.phase = 'arrived';
          aircraft.progress = 1;
          aircraft.status = 'ground';
          aircraft.locationIata = aircraft.destination;
          aircraft.currentAlt = 0;
          aircraft.currentSpeed = 0;
          completedFlights++;
        }
      }
    });

    // Award offline revenue approximation
    const activeProfitableRoutes = GS.routes.filter(r => r.status === 'active');
    if (activeProfitableRoutes.length > 0 && gameMinutes > 60) {
      const hoursOffline = gameMinutes / 60;
      let offlineRevenue = 0;
      activeProfitableRoutes.forEach(r => {
        const profit = Economy.calcRouteProfit(r);
        if (profit > 0) {
          // Estimate ~1 flight per 8h avg
          const estimatedFlights = Math.floor(hoursOffline / 8);
          offlineRevenue += profit * estimatedFlights;
        }
      });
      if (offlineRevenue > 0) {
        GS.addToBalance(offlineRevenue, 'offline', `Revenus hors ligne (${Math.round(hoursOffline)}h)`);
        if (typeof UI !== 'undefined') {
          setTimeout(() => {
            UI.notify(`🛫 Hors ligne ${Math.round(realMinutes)}min · ${completedFlights} vols complétés · +$${offlineRevenue.toLocaleString()} de revenus`, 'success', 7000);
          }, 2000);
        }
      }
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
