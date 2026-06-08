/* ===== FLIGHT PHYSICS ENGINE — 9 Phases — Hakvision Aircraft ===== */
const FlightEngine = {
  PHASES: ['ground', 'taxiing', 'takeoff', 'climb', 'cruise', 'descent', 'approach', 'landing', 'arrived'],
  PHASE_LABELS: {
    ground: 'Au sol', taxiing: 'Roulage', takeoff: 'Décollage',
    climb: 'Montée', cruise: 'Croisière', descent: 'Descente',
    approach: 'Approche', landing: 'Atterrissage', arrived: 'Arrivé',
  },
  PHASE_LABELS_FR: {
    ground: 'Au sol', taxiing: 'Roulage', takeoff: 'Décollage',
    climb: 'En montée', cruise: 'En croisière', descent: 'En descente',
    approach: 'En approche', landing: 'À l\'atterrissage', arrived: 'Arrivé à destination',
  },

  PHASE_ALTITUDE_MAX: {
    ground: 0, taxiing: 0, takeoff: 500, climb: 10700,
    cruise: 11000, descent: 10700, approach: 1500, landing: 0, arrived: 0,
  },
  PHASE_SPEED_FACTOR: {
    ground: 0, taxiing: 0.02, takeoff: 0.35, climb: 0.75,
    cruise: 1.0, descent: 0.85, approach: 0.45, landing: 0.20, arrived: 0,
  },

  PHASE_DURATION_FRACTION: {
    ground: 0.00,
    taxiing: 0.01,
    takeoff: 0.02,
    climb: 0.12,
    cruise: 0.68,
    descent: 0.10,
    approach: 0.05,
    landing: 0.02,
    arrived: 1.00,
  },

  tick(gameMinutes) {
    if (!GS.company) return;
    const completions = [];
    GS.fleet.forEach(aircraft => {
      if (aircraft.status !== 'flying') return;
      if (!aircraft.departureTime || !aircraft.arrivalTime) return;
      this.updateAircraftPosition(aircraft, gameMinutes, completions);
    });
    completions.forEach(aircraft => {
      this.completeFlight(aircraft);
    });
  },

  updateAircraftPosition(aircraft, gameMinutes, completions) {
    const totalGameMs = aircraft.durationHours
      ? aircraft.durationHours * 3600 * 1000
      : (aircraft.arrivalTime - aircraft.departureTime);
    if (!totalGameMs || isNaN(totalGameMs) || totalGameMs <= 0) return;
    const elapsedMs = GS.gameDate - aircraft.departureTime;
    aircraft.progress = Math.min(1, elapsedMs / totalGameMs);

    if (aircraft.progress >= 1.0 && aircraft.phase !== 'arrived') {
      aircraft.phase = 'arrived';
      aircraft.progress = 1.0;
      completions.push(aircraft);
      return;
    }

    const phase = this.getPhaseForProgress(aircraft.progress);
    if (aircraft.phase !== phase) {
      aircraft.phase = phase;
    }

    const model = getAircraftModel(aircraft.modelId);
    if (!model) return;

    aircraft.currentAlt = this.calcAltitude(aircraft.progress, model);
    aircraft.currentSpeed = this.calcSpeed(aircraft.progress, model);

    const pts = aircraft.pathPoints;
    if (pts && pts.length > 1) {
      const idx = Math.min(pts.length - 1, Math.floor(aircraft.progress * (pts.length - 1)));
      const frac = aircraft.progress * (pts.length - 1) - idx;
      if (idx < pts.length - 1) {
        aircraft.lat = pts[idx][0] + frac * (pts[idx+1][0] - pts[idx][0]);
        aircraft.lon = pts[idx][1] + frac * (pts[idx+1][1] - pts[idx][1]);
        if (idx < pts.length - 2) {
          aircraft.heading = RouteEngine.calcBearing(
            pts[idx][0], pts[idx][1], pts[idx+1][0], pts[idx+1][1]
          );
        }
      } else {
        aircraft.lat = pts[pts.length - 1][0];
        aircraft.lon = pts[pts.length - 1][1];
      }
    }
  },

  getPhaseForProgress(p) {
    const cum = {};
    let acc = 0;
    const phases = this.PHASES.slice(0, -1);
    const durations = {
      ground: 0.00, taxiing: 0.015, takeoff: 0.025, climb: 0.13,
      cruise: 0.65, descent: 0.11, approach: 0.055, landing: 0.015,
    };
    for (const ph of phases) {
      acc += durations[ph] || 0;
      cum[ph] = acc;
    }
    if (p < cum.taxiing) return 'taxiing';
    if (p < cum.takeoff) return 'takeoff';
    if (p < cum.climb) return 'climb';
    if (p < cum.cruise) return 'cruise';
    if (p < cum.descent) return 'descent';
    if (p < cum.approach) return 'approach';
    if (p < cum.landing) return 'landing';
    if (p < 1.0) return 'landing';
    return 'arrived';
  },

  calcAltitude(progress, model) {
    const ph = this.getPhaseForProgress(progress);
    const maxAlt = model.category === 'turboprop' ? 7500 : 11000;
    const t = this.getPhaseLocalT(progress, ph);
    switch (ph) {
      case 'ground': case 'taxiing': return 0;
      case 'takeoff': return Math.round(t * 500);
      case 'climb': return Math.round(500 + t * (maxAlt - 500));
      case 'cruise': return maxAlt;
      case 'descent': return Math.round(maxAlt * (1 - t * 0.87));
      case 'approach': return Math.round(maxAlt * 0.13 * (1 - t));
      case 'landing': return Math.round(1500 * (1 - t));
      default: return 0;
    }
  },

  calcSpeed(progress, model) {
    const ph = this.getPhaseForProgress(progress);
    const cs = model.cruiseSpeed;
    const t = this.getPhaseLocalT(progress, ph);
    switch (ph) {
      case 'ground': return 0;
      case 'taxiing': return Math.round(25 + t * 15);
      case 'takeoff': return Math.round(40 + t * (280 - 40));
      case 'climb': return Math.round(280 + t * (cs - 280));
      case 'cruise': return cs;
      case 'descent': return Math.round(cs * (1 - t * 0.35));
      case 'approach': return Math.round(cs * 0.65 * (1 - t * 0.45));
      case 'landing': return Math.round(240 * (1 - t));
      default: return 0;
    }
  },

  getPhaseLocalT(progress, phase) {
    const durations = {
      taxiing: 0.015, takeoff: 0.025, climb: 0.13,
      cruise: 0.65, descent: 0.11, approach: 0.055, landing: 0.015,
    };
    const starts = {};
    let acc = 0;
    ['taxiing','takeoff','climb','cruise','descent','approach','landing'].forEach(p => {
      starts[p] = acc;
      acc += durations[p] || 0;
    });
    const start = starts[phase] || 0;
    const dur = durations[phase] || 0.01;
    return dur > 0 ? Math.min(1, (progress - start) / dur) : 0;
  },

  completeFlight(aircraft) {
    const route = GS.getRoute(aircraft.routeId);
    const profit = Economy.processFlightCompletion(aircraft);
    const dest = getAirport(aircraft.destination);
    if (dest) {
      aircraft.lat = dest.lat;
      aircraft.lon = dest.lon;
    }
    aircraft.currentAlt = 0;
    aircraft.currentSpeed = 0;
    aircraft.phase = 'arrived';
    aircraft.progress = 1;
    const model = getAircraftModel(aircraft.modelId);
    const duration = aircraft.durationHours || 0;
    aircraft.ageHours = (aircraft.ageHours || 0) + duration;
    aircraft.condition = Math.max(10, (aircraft.condition || 100) - duration * 0.05);

    // Progression: award XP for completing the flight
    if (typeof Progression !== 'undefined') {
      const lf = route ? (route.loadFactor || 0.8) : 0.8;
      const xp = Math.round(8 + lf * 10 + Math.max(0, (profit || 0)) / 50000);
      Progression.addXP(xp, 'flight');
      Progression.checkAchievements();
    }

    // Maintenance: roll for an incident if checks are overdue
    let incident = null;
    if (typeof Maintenance !== 'undefined') {
      incident = Maintenance.rollIncident(aircraft);
    }

    const profitStr = profit != null ? ` · ${profit > 0 ? '+' : ''}$${Math.abs(profit || 0).toLocaleString()}` : '';
    UI.notify(
      `✈ Vol ${aircraft.flightId} arrivé — ${aircraft.origin} → ${aircraft.destination}${profitStr}`,
      profit > 0 ? 'success' : 'warning',
      4500
    );
    if (incident) {
      UI.notify(`🔧 Incident technique sur ${aircraft.name} — maintenance en retard ! Coût $${incident.cost.toLocaleString()}`, 'error', 6000);
    }
    // Park the aircraft at the airport it just reached
    aircraft.status = 'ground';
    aircraft.locationIata = aircraft.destination;
    aircraft.currentSpeed = 0;
    aircraft.currentAlt = 0;

    if (route && route.status === 'active') {
      if (route.autoReturn !== false) {
        // Continuous service: automatically dispatch the next leg back
        setTimeout(() => {
          if (route.status === 'active' && aircraft.status === 'ground') {
            RouteEngine.dispatchFlight(route, aircraft);
          }
        }, 100);
      } else {
        // Manual mode: wait for the player to dispatch the return flight
        const back = aircraft.locationIata === route.destination ? route.origin : route.destination;
        UI.notify(`🛬 ${aircraft.name} au sol à ${aircraft.destination} — prêt pour ${back}. Lancez le départ depuis Routes.`, 'info', 6000);
        if (UI.currentTab === 'routes') UI.refreshPanel();
      }
    } else {
      aircraft.routeId = null;
    }
  },

  getETA(aircraft) {
    if (!aircraft || !aircraft.arrivalTime) return '-';
    const diff = aircraft.arrivalTime - GS.gameDate;
    if (diff <= 0) return 'À l\'arrivée';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}min` : `${m} min`;
  },

  getPhaseLabel(phase) {
    return this.PHASE_LABELS_FR[phase] || phase;
  },
};
