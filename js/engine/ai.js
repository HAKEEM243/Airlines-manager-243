/* ===== AI RIVAL COMPANY ENGINE — Hakvision Aircraft ===== */
const AIEngine = {
  NAMES: ['StarWing Airways','AeroNova','Continental Prestige','SkyBridge Airlines','MegaJet International'],
  COLORS: ['#ff6b35','#a855f7','#f59e0b','#ef4444','#10b981'],

  create(hubIata) {
    const idx = Math.floor(Math.random() * this.NAMES.length);
    const hub = getAirport(hubIata) || AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
    const model = AIRCRAFT_MODELS[Math.floor(Math.random() * Math.min(15, AIRCRAFT_MODELS.length))];
    const company = {
      name: this.NAMES[idx],
      iata: 'AI',
      hub: hub.iata,
      color: this.COLORS[idx],
      cash: 50000000 + Math.random() * 20000000,
      reputation: 15 + Math.floor(Math.random() * 25),
      fleet: [],
      routes: [],
      totalRevenue: 0,
      totalFlights: 0,
      tickCounter: 0,
      enabled: true,
    };
    for (let i = 0; i < 3; i++) {
      const m = AIRCRAFT_MODELS[Math.floor(Math.random() * 12)];
      company.fleet.push({
        id: 'ai_' + i,
        modelId: m.id,
        name: m.name,
        status: 'ground',
        lat: hub.lat + (Math.random() - 0.5) * 2,
        lon: hub.lon + (Math.random() - 0.5) * 2,
        progress: 0,
        phase: 'ground',
        color: company.color,
      });
    }
    this.addInitialRoutes(company, 3);
    GS.ai = company;
    GS.ai.serialize = () => this.serializeAI();
    GS.ai.loadState = (state) => this.loadAI(state);
  },

  tick(gameMinutes) {
    const ai = GS.ai;
    if (!ai || !ai.enabled) return;
    ai.tickCounter = (ai.tickCounter || 0) + gameMinutes;
    ai.fleet.forEach(ac => this.updateAIAircraft(ac, gameMinutes));
    if (ai.tickCounter % 10080 < gameMinutes) {
      this.makeStrategicDecision(ai);
    }
    if (ai.tickCounter % 43200 < gameMinutes) {
      ai.reputation = Math.min(100, (ai.reputation || 20) + 0.5);
      ai.cash += 150000;
    }
  },

  updateAIAircraft(ac, gameMinutes) {
    if (!ac.route) {
      if (Math.random() < 0.01) {
        this.assignRandomRoute(ac);
      }
      return;
    }
    if (ac.status === 'flying') {
      ac.progress = Math.min(1, (ac.progress || 0) + gameMinutes / (ac.durationMinutes || 600));
      const o = getAirport(ac.route.origin);
      const d = getAirport(ac.route.dest);
      if (o && d && ac.pathPoints) {
        const idx = Math.floor(ac.progress * (ac.pathPoints.length - 1));
        if (idx < ac.pathPoints.length) {
          ac.lat = ac.pathPoints[idx][0];
          ac.lon = ac.pathPoints[idx][1];
          const nxt = ac.pathPoints[Math.min(ac.pathPoints.length - 1, idx + 1)];
          if (nxt) ac.heading = RouteEngine.calcBearing(ac.lat, ac.lon, nxt[0], nxt[1]);
        }
      }
      ac.phase = FlightEngine.getPhaseForProgress(ac.progress);
      if (ac.progress >= 1.0) {
        this.completeAIFlight(ac);
      }
    }
  },

  assignRandomRoute(ac) {
    const ai = GS.ai;
    if (!ai) return;
    const hubAp = getAirport(ai.hub);
    if (!hubAp) return;
    const candidates = AIRPORTS.filter(a => a.iata !== ai.hub && a.demandPax > 3000);
    if (!candidates.length) return;
    const dest = candidates[Math.floor(Math.random() * candidates.length)];
    const model = getAircraftModel(ac.modelId);
    const dist = calcDistance(hubAp, dest);
    if (!model || !canFlyRoute(model, dist)) return;
    const pts = geodesicPoints(hubAp, dest, 60);
    ac.route = { origin: ai.hub, dest: dest.iata };
    ac.pathPoints = pts;
    ac.progress = 0;
    ac.status = 'flying';
    ac.durationMinutes = calcFlightDuration(dist, model) * 60;
    ac.phase = 'taxiing';
    ac.lat = hubAp.lat;
    ac.lon = hubAp.lon;
    GS.ai.totalFlights++;
  },

  completeAIFlight(ac) {
    const ai = GS.ai;
    if (ac.route) {
      const o = getAirport(ac.route.origin);
      const d = getAirport(ac.route.dest);
      if (d) { ac.lat = d.lat; ac.lon = d.lon; }
      if (o && d) {
        const model = getAircraftModel(ac.modelId);
        const dist = calcDistance(o, d);
        if (model) {
          const rev = Economy.calcTicketPrice(dist, 'economy') * model.paxCapacity * 0.78;
          ai.cash += rev;
          ai.totalRevenue += rev;
        }
      }
    }
    ac.status = 'ground';
    ac.phase = 'arrived';
    ac.route = null;
    ac.pathPoints = null;
    ac.progress = 0;
    setTimeout(() => {
      if (ai.enabled !== false) this.assignRandomRoute(ac);
    }, Math.random() * 5000 + 1000);
  },

  makeStrategicDecision(ai) {
    const roll = Math.random();
    if (roll < 0.3 && ai.cash > 30000000) {
      const model = AIRCRAFT_MODELS[Math.floor(Math.random() * 15)];
      if (ai.cash >= model.purchasePrice) {
        ai.fleet.push({
          id: 'ai_' + ai.fleet.length,
          modelId: model.id,
          name: model.name,
          status: 'ground',
          lat: getAirport(ai.hub)?.lat || 0,
          lon: getAirport(ai.hub)?.lon || 0,
          progress: 0,
          phase: 'ground',
          color: ai.color,
        });
        ai.cash -= model.purchasePrice;
      }
    }
    if (roll > 0.8) {
      ai.reputation = Math.min(100, ai.reputation + 1);
    }
  },

  addInitialRoutes(company, count) {
    const hub = getAirport(company.hub);
    if (!hub) return;
    const candidates = AIRPORTS.filter(a => a.iata !== company.hub && a.demandPax > 5000);
    for (let i = 0; i < Math.min(count, candidates.length); i++) {
      company.routes.push({ origin: company.hub, destination: candidates[i].iata });
    }
  },

  toggle(enabled) {
    if (GS.ai) GS.ai.enabled = enabled;
  },

  serializeAI() {
    if (!GS.ai) return null;
    const { serialize, loadState, ...rest } = GS.ai;
    return rest;
  },

  loadAI(state) {
    if (!state) return;
    GS.ai = state;
    GS.ai.serialize = () => this.serializeAI();
    GS.ai.loadState = (s) => this.loadAI(s);
    if (!('enabled' in GS.ai)) GS.ai.enabled = true;
  },
};
