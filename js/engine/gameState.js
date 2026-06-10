/* ===== GAME STATE — Hakvision Aircraft ===== */
const GS = {
  company: null,
  fleet: [],
  routes: [],
  crew: [],
  events: [],
  finances: {
    balance: 50000000,
    history: [],
    revenue: { pax: 0, cargo: 0, mail: 0 },
    costs: { fuel: 0, maintenance: 0, fees: 0, crew: 0, marketing: 0 },
    lastMonthPL: 0,
  },
  alliances: [],
  marketing: { campaigns: [], loyaltyPoints: 0 },
  cargo: { contracts: [], dedicated: [] },
  market: { fuelPrice: 0.95, demandMultiplier: 1.0 },
  ai: null,
  gameDate: new Date(2024, 0, 1),
  gameSpeed: 1,
  paused: false,
  settings: {
    showRoutes: true,
    showAirports: true,
    showNight: false,
    autoSave: true,
  },
  _nextId: 1,
  _tickAccum: 0,

  genId() { return this._nextId++; },

  init(company, hubIata) {
    this.company = {
      name: company.name,
      iata: company.iata,
      hub: hubIata,
      reputation: 0,
      founded: new Date(this.gameDate),
      logo: '✈',
      alliance: null,
      loyalty: { name: company.name + ' Miles', members: 0 },
      service: { level: 1, wifi: false, catering: false },
      totalPaxCarried: 0,
    };
    this.fleet = [];
    this.routes = [];
    this.crew = GSHelpers.generateInitialCrew(8);
    this.events = [];
    this.finances = {
      balance: 50000000,
      history: [],
      revenue: { pax: 0, cargo: 0, mail: 0 },
      costs: { fuel: 0, maintenance: 0, fees: 0, crew: 0, marketing: 0 },
      loans: [],
      lastMonthPL: 0,
    };
    this.alliances = [];
    this.marketing.campaigns = [];
    this.cargo.contracts = GSHelpers.generateCargoContracts(5);
    this.market = { fuelPrice: 0.95, demandMultiplier: 1.0, oilBarrel: 80 };
    this.ai = null;
    this.gameDate = new Date(2024, 0, 1);
    this.timeMode = 'standard';
    this.paused = false;
    this._nextId = 100;
    this._tickAccum = 0;
  },

  addToBalance(amount, type = 'other', description = '') {
    this.finances.balance += amount;
    this.finances.history.push({
      date: new Date(this.gameDate),
      amount,
      type,
      description,
      balance: this.finances.balance,
    });
    if (this.finances.history.length > 500) {
      this.finances.history.shift();
    }
  },

  getBalanceFormatted() {
    const b = this.finances.balance;
    const sign = b < 0 ? '-' : '';
    const abs = Math.abs(b);
    if (abs >= 1e9) return sign + '$' + (abs/1e9).toFixed(2) + 'B';
    if (abs >= 1e6) return sign + '$' + (abs/1e6).toFixed(2) + 'M';
    if (abs >= 1e3) return sign + '$' + (abs/1e3).toFixed(0) + 'K';
    return sign + '$' + Math.round(abs).toLocaleString();
  },

  getAircraft(id) { return this.fleet.find(a => a.id === id); },

  getRoute(id) { return this.routes.find(r => r.id === id); },

  getActiveRoutes() { return this.routes.filter(r => r.status === 'active'); },

  getFleetInAir() { return this.fleet.filter(a => a.status === 'flying'); },

  addReputation(delta) {
    this.company.reputation = Math.max(0, Math.min(100, this.company.reputation + delta));
    return false;
  },

  getTotalRevenue() {
    const f = this.finances;
    return f.revenue.pax + f.revenue.cargo + f.revenue.mail;
  },

  getTotalCosts() {
    const f = this.finances;
    return f.costs.fuel + f.costs.maintenance + f.costs.fees + f.costs.crew + f.costs.marketing;
  },

  getMonthlyPL() {
    return this.getTotalRevenue() - this.getTotalCosts();
  },

  getLoadFactor() {
    const active = this.fleet.filter(a => a.status === 'flying' && a.route);
    if (!active.length) return 0;
    const total = active.reduce((s, a) => {
      const model = getAircraftModel(a.modelId);
      return s + (model ? model.paxCapacity : 0);
    }, 0);
    const used = active.reduce((s, a) => s + (a.passengers || 0), 0);
    return total ? Math.round((used / total) * 100) : 0;
  },

  serializeForSave() {
    return JSON.stringify({
      company: this.company,
      fleet: this.fleet,
      routes: this.routes,
      crew: this.crew,
      finances: this.finances,
      alliances: this.alliances,
      cargo: this.cargo,
      market: this.market,
      events: this.events,
      marketing: this.marketing,
      settings: this.settings,
      aiState: this.ai ? this.ai.serialize() : null,
      gameDate: this.gameDate.toISOString(),
      timeMode: this.timeMode || 'standard',
      _nextId: this._nextId,
      _tickAccum: this._tickAccum || 0,
    });
  },

  deserializeFromSave(data) {
    const d = JSON.parse(data);
    this.company = d.company;
    this.fleet = (d.fleet || []).map(ac => {
      if (ac.departureTime) ac.departureTime = new Date(ac.departureTime);
      if (ac.arrivalTime) ac.arrivalTime = new Date(ac.arrivalTime);
      return ac;
    });
    this.routes = (d.routes || []).map(r => {
      if (r.createdAt) r.createdAt = new Date(r.createdAt);
      return r;
    });
    this.crew = d.crew;
    this.finances = d.finances;
    if (!this.finances.loans) this.finances.loans = [];
    if (this.company) {
      if (typeof this.company.xp !== 'number') this.company.xp = 0;
      if (!Array.isArray(this.company.achievements)) this.company.achievements = [];
      // Recompute level from XP for saves that predate the progression system
      if (typeof Progression !== 'undefined') this.company.level = Progression.getProgress().level;
    }
    this.alliances = d.alliances || [];
    this.cargo = d.cargo || { contracts: [], dedicated: [] };
    this.market = d.market || { fuelPrice: 0.95, demandMultiplier: 1.0, oilBarrel: 80 };
    if (!this.market.oilBarrel) this.market.oilBarrel = 80;
    this.events = d.events || [];
    this.marketing = d.marketing || { campaigns: [], loyaltyPoints: 0 };
    if (d.settings) this.settings = { ...this.settings, ...d.settings };
    if (this.company) {
      if (!this.company.totalPaxCarried) this.company.totalPaxCarried = 0;
    }
    this.gameDate = new Date(d.gameDate);
    this.timeMode = d.timeMode || 'standard';
    this._nextId = d._nextId;
    this._tickAccum = d._tickAccum || 0;
    return d.aiState;
  },
};

const GSHelpers = {
  generateInitialCrew(count) {
    const names = [
      'Jean-Marc Dubois','Sophie Martin','Carlos Reyes','Amara Diallo',
      'Liu Wei','Elena Petrova','Mohamed Hassan','Marie Leclerc',
      'David Okonkwo','Fatima Al-Rashid','Pierre Moreau','Yuki Tanaka',
    ];
    const crew = [];
    for (let i = 0; i < count; i++) {
      const isPilot = i < count / 2;
      crew.push({
        id: 100 + i,
        name: names[i % names.length],
        role: isPilot ? 'Commandant de bord' : 'Personnel navigant',
        type: isPilot ? 'pilot' : 'cabin',
        experience: 40 + Math.floor(Math.random() * 60),
        reliability: 60 + Math.floor(Math.random() * 40),
        longHaulSpec: Math.random() > 0.5,
        salary: isPilot ? 8000 + Math.floor(Math.random() * 4000) : 2500 + Math.floor(Math.random() * 1500),
        assignedAircraft: null,
      });
    }
    return crew;
  },

  generateCargoContracts(count) {
    const contracts = [];
    for (let i = 0; i < count; i++) {
      const airports = AIRPORTS.filter(a => a.demandCargo > 1000);
      const from = airports[Math.floor(Math.random() * airports.length)];
      const to = airports[Math.floor(Math.random() * airports.length)];
      if (from.iata === to.iata) continue;
      contracts.push({
        id: 200 + i,
        from: from.iata,
        to: to.iata,
        weight: 2 + Math.floor(Math.random() * 20),
        valuePerTon: 800 + Math.floor(Math.random() * 600),
        deadline: 30 + Math.floor(Math.random() * 60),
        accepted: false,
      });
    }
    return contracts;
  },

  createFlightId(origin, dest) {
    const iata = GS.company ? GS.company.iata : 'HV';
    const num = 100 + Math.floor(Math.random() * 8900);
    return iata + num;
  },
};

const ALLIANCES = [
  { id:'skyworld', name:'SkyWorld Alliance', benefit:'−15% taxes aéroportuaires', bonus:'landingFee', value: -0.15, cost: 2000000, annual: 500000, members: 12 },
  { id:'pacifica', name:'Pacifica Star', benefit:'+20% taux de remplissage Asie-Pacifique', bonus:'loadFactor', region:'AS', value: 0.20, cost: 3500000, annual: 800000, members: 8 },
  { id:'afrijet', name:'AfriJet Union', benefit:'+25% demande Afrique', bonus:'demand', region:'AF', value: 0.25, cost: 1500000, annual: 300000, members: 15 },
  { id:'transatlantic', name:'TransAtlantic Group', benefit:'+15% revenus sur routes NA/EU', bonus:'revenue', value: 0.15, cost: 4000000, annual: 900000, members: 10 },
];

const EVENTS_POOL = [
  { id:'fuel_rise', type:'economic', impact:'negative', icon:'⛽', title:'Hausse du pétrole', desc:"Les prix du baril ont bondi de 18%. Coûts opérationnels en hausse.", effect:{ fuelMultiplier: 1.18 }, duration: 60 },
  { id:'fuel_drop', type:'economic', impact:'positive', icon:'⛽', title:'Baisse du pétrole', desc:"Le baril chute à son plus bas depuis 2 ans. Économies substantielles.", effect:{ fuelMultiplier: 0.82 }, duration: 60 },
  { id:'strike', type:'social', impact:'negative', icon:'✊', title:'Grève du personnel', desc:"20% de la flotte immobilisée pendant 3 jours.", effect:{ fleetPenalty: 0.20 }, duration: 3 },
  { id:'tourism_boom', type:'market', impact:'positive', icon:'🌍', title:'Boom touristique', desc:"Afflux de touristes record. Demande en hausse de 30%.", effect:{ demandMultiplier: 1.30 }, duration: 90 },
  { id:'pandemic_alert', type:'health', impact:'negative', icon:'🦠', title:'Alerte sanitaire', desc:"Restrictions de voyage sur 3 régions. −40% de demande.", effect:{ demandMultiplier: 0.60 }, duration: 30 },
  { id:'airport_expansion', type:'infrastructure', impact:'positive', icon:'🏗', title:'Expansion aéroportuaire', desc:"Votre hub a élargi sa capacité. +10 slots disponibles.", effect:{ hubSlots: 10 }, duration: 0 },
  { id:'weather', type:'operational', impact:'negative', icon:'🌪', title:'Conditions météo sévères', desc:"Tempête sur l'Atlantique. Retards généralisés.", effect:{ delayPenalty: 0.15 }, duration: 5 },
  { id:'award', type:'reputation', impact:'positive', icon:'🏆', title:'Récompense Skytrax', desc:"Hakvision Aircraft élu meilleure compagnie émergente. +15 réputation.", effect:{ reputation: 15 }, duration: 0 },
  { id:'accident', type:'operational', impact:'negative', icon:'⚠️', title:'Incident technique', desc:"Un appareil immobilisé 48h pour inspection. Compensation passagers.", effect:{ oneTimeCost: 150000 }, duration: 0 },
  { id:'codeshare', type:'commercial', impact:'positive', icon:'🤝', title:'Accord de Codeshare', desc:"Un partenaire majeur partage ses codes. +8% de revenus.", effect:{ revenueMultiplier: 1.08 }, duration: 180 },
];
