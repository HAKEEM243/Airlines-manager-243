/* ===== PUSH NOTIFICATIONS — Hakvision Aircraft ===== */
/* Browser Notification API for urgent CEO alerts */
const GameNotifications = {
  enabled: false,
  permission: 'default',

  async requestPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') {
      this.enabled = true;
      this.permission = 'granted';
      return true;
    }
    const result = await Notification.requestPermission();
    this.permission = result;
    this.enabled = result === 'granted';
    return this.enabled;
  },

  push(title, body, icon = '✈') {
    if (!this.enabled || Notification.permission !== 'granted') return;
    if (document.hasFocus()) return; // Only push when tab is not active
    try {
      const n = new Notification(`✈ Hakvision — ${title}`, {
        body,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">' + icon + '</text></svg>',
        tag: 'hakvision',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">✈</text></svg>',
      });
      n.onclick = () => { window.focus(); n.close(); };
      setTimeout(() => n.close(), 8000);
    } catch(e) { /* ignore notification errors */ }
  },

  // Check game state and push urgent alerts
  checkAlerts() {
    if (!GS.company) return;

    // Low balance alert
    if (GS.finances.balance < 0) {
      this.push('Capital négatif !',
        `${GS.company.name} est à découvert ($${Math.abs(GS.finances.balance).toLocaleString()}). Action requise !`, '💸');
    }

    // Aircraft grounded due to overdue maintenance
    const overdueAircraft = (GS.fleet || []).filter(ac => {
      if (typeof Maintenance === 'undefined') return false;
      return Maintenance.getStatus(ac).overdue;
    });
    if (overdueAircraft.length > 0) {
      this.push('Maintenance en retard !',
        `${overdueAircraft.length} appareil(s) nécessitent une révision urgente. Risque d'incident.`, '🔧');
    }

    // Active negative events
    const activeNegativeEvents = (GS.events || []).filter(e => e.active && e.impact === 'negative');
    if (activeNegativeEvents.length > 0) {
      const ev = activeNegativeEvents[0];
      this.push(ev.title, ev.desc, ev.icon);
    }
  },
};
