/* ===== PROGRESSION · FINANCE · MAINTENANCE — Hakvision Aircraft ===== */
/* Tycoon depth systems: XP/levels/unlocks, achievements, bank loans, fleet checks */

/* =====================================================================
   PROGRESSION — Company levels, XP, unlocks, achievements
   ===================================================================== */
const Progression = {
  // Cumulative XP required to REACH each level (index = level-1)
  LEVELS: [
    { lvl: 1,  xp: 0,      title: 'Startup Aérien',        reward: 0 },
    { lvl: 2,  xp: 250,    title: 'Transporteur Local',    reward: 500000 },
    { lvl: 3,  xp: 650,    title: 'Compagnie Régionale',   reward: 1200000 },
    { lvl: 4,  xp: 1300,   title: 'Opérateur National',    reward: 2500000 },
    { lvl: 5,  xp: 2300,   title: 'Compagnie Établie',     reward: 4000000 },
    { lvl: 6,  xp: 3800,   title: 'Transporteur Majeur',   reward: 7000000 },
    { lvl: 7,  xp: 6000,   title: 'Réseau International',  reward: 11000000 },
    { lvl: 8,  xp: 9000,   title: 'Acteur Continental',    reward: 16000000 },
    { lvl: 9,  xp: 13500,  title: 'Compagnie Mondiale',    reward: 24000000 },
    { lvl: 10, xp: 20000,  title: 'Leader du Marché',      reward: 35000000 },
    { lvl: 11, xp: 29000,  title: 'Géant Aérien',          reward: 50000000 },
    { lvl: 12, xp: 42000,  title: 'Empire Transcontinental', reward: 75000000 },
    { lvl: 13, xp: 60000,  title: 'Mégacarrier',           reward: 110000000 },
    { lvl: 14, xp: 85000,  title: 'Titan de l\'Aviation',  reward: 160000000 },
    { lvl: 15, xp: 120000, title: 'Légende Hakvision',     reward: 250000000 },
  ],

  // Minimum company level required to buy each aircraft category
  CATEGORY_UNLOCK: {
    turboprop: 1,
    regional_jet: 1,
    narrowbody: 2,
    widebody: 4,
    cargo: 6,
    supersonic: 9,
  },

  CUSTOM_EDITOR_LEVEL: 3,

  getLevel() {
    return (GS.company && GS.company.level) || 1;
  },

  getXP() {
    return (GS.company && GS.company.xp) || 0;
  },

  // Returns {level, title, currentLevelXp, nextLevelXp, intoLevel, neededForNext, progress}
  getProgress() {
    const xp = this.getXP();
    let level = 1;
    for (let i = 0; i < this.LEVELS.length; i++) {
      if (xp >= this.LEVELS[i].xp) level = this.LEVELS[i].lvl;
    }
    const cur = this.LEVELS[level - 1];
    const next = this.LEVELS[level] || null;
    const currentLevelXp = cur.xp;
    const nextLevelXp = next ? next.xp : cur.xp;
    const intoLevel = xp - currentLevelXp;
    const neededForNext = next ? next.xp - currentLevelXp : 1;
    const progress = next ? Math.min(1, intoLevel / neededForNext) : 1;
    return { level, title: cur.title, xp, currentLevelXp, nextLevelXp, intoLevel, neededForNext, progress, isMax: !next };
  },

  // Award XP and process any level-ups (rewards + notifications)
  addXP(amount, reason = '') {
    if (!GS.company || !amount) return;
    GS.company.xp = (GS.company.xp || 0) + Math.round(amount);
    const before = GS.company.level || 1;
    const prog = this.getProgress();
    if (prog.level > before) {
      for (let l = before + 1; l <= prog.level; l++) {
        const def = this.LEVELS[l - 1];
        if (!def) continue;
        if (def.reward > 0) {
          GS.addToBalance(def.reward, 'bonus', `Bonus niveau ${l}`);
        }
        if (typeof UI !== 'undefined') {
          UI.notify(`🎉 Niveau ${l} atteint — ${def.title} !${def.reward ? ` Bonus de $${(def.reward/1e6).toFixed(1)}M` : ''}`, 'success', 7000);
          this.announceUnlock(l);
        }
      }
      GS.company.level = prog.level;
      if (typeof UI !== 'undefined' && UI.currentTab === 'dashboard') UI.refreshPanel();
    }
  },

  announceUnlock(level) {
    const unlocks = [];
    Object.keys(this.CATEGORY_UNLOCK).forEach(cat => {
      if (this.CATEGORY_UNLOCK[cat] === level) {
        const label = { widebody: 'Long-courriers (widebody)', cargo: 'Avions Cargo', supersonic: 'Supersoniques', narrowbody: 'Court-courriers' }[cat] || cat;
        unlocks.push(label);
      }
    });
    if (level === this.CUSTOM_EDITOR_LEVEL) unlocks.push('Éditeur d\'appareil personnalisé');
    if (unlocks.length && typeof UI !== 'undefined') {
      setTimeout(() => UI.notify(`🔓 Débloqué : ${unlocks.join(', ')}`, 'info', 7000), 800);
    }
  },

  isCategoryUnlocked(category) {
    const need = this.CATEGORY_UNLOCK[category] || 1;
    return this.getLevel() >= need;
  },

  categoryUnlockLevel(category) {
    return this.CATEGORY_UNLOCK[category] || 1;
  },

  isCustomUnlocked() {
    return this.getLevel() >= this.CUSTOM_EDITOR_LEVEL;
  },

  /* ===== ACHIEVEMENTS ===== */
  ACHIEVEMENTS: [
    { id: 'first_flight',   icon: '🛫', name: 'Premier Décollage',      desc: 'Compléter votre premier vol',            xp: 100,   cash: 100000,   check: s => s.totalFlights >= 1 },
    { id: 'five_routes',    icon: '🗺️', name: 'Réseau Naissant',         desc: 'Exploiter 5 routes simultanément',       xp: 250,   cash: 500000,   check: s => s.activeRoutes >= 5 },
    { id: 'ten_aircraft',   icon: '✈️', name: 'Flotte Conséquente',      desc: 'Posséder 10 appareils',                  xp: 400,   cash: 1000000,  check: s => s.fleetSize >= 10 },
    { id: 'hundred_flights',icon: '💯', name: 'Centurion du Ciel',       desc: 'Compléter 100 vols',                     xp: 500,   cash: 1500000,  check: s => s.totalFlights >= 100 },
    { id: 'intercont',      icon: '🌍', name: 'Long-Courrier',           desc: 'Ouvrir une route de plus de 8 000 km',   xp: 350,   cash: 800000,   check: s => s.longestRoute >= 8000 },
    { id: 'millionaire',    icon: '💰', name: 'Premier Million',         desc: 'Atteindre $100M de capital',             xp: 400,   cash: 0,        check: s => s.balance >= 100000000 },
    { id: 'billionaire',    icon: '🏦', name: 'Milliardaire',            desc: 'Atteindre $1 milliard de capital',       xp: 2000,  cash: 0,        check: s => s.balance >= 1000000000 },
    { id: 'rep_master',     icon: '⭐', name: 'Référence du Secteur',    desc: 'Atteindre 80 de réputation',             xp: 800,   cash: 5000000,  check: s => s.reputation >= 80 },
    { id: 'alliance',       icon: '🤝', name: 'Allié Stratégique',       desc: 'Rejoindre une alliance',                 xp: 300,   cash: 500000,   check: s => s.alliances >= 1 },
    { id: 'big_fleet',      icon: '🛬', name: 'Mégaflotte',              desc: 'Posséder 30 appareils',                  xp: 1500,  cash: 10000000, check: s => s.fleetSize >= 30 },
    { id: 'widebody_owner', icon: '🦅', name: 'Maître du Long-Courrier', desc: 'Acquérir un appareil widebody',          xp: 600,   cash: 2000000,  check: s => s.hasWidebody },
    { id: 'beat_ai',        icon: '🏆', name: 'Domination',              desc: 'Dépasser le concurrent en capital',      xp: 700,   cash: 3000000,  check: s => s.beatAI },
  ],

  getStats() {
    const fleet = GS.fleet || [];
    let longestRoute = 0;
    (GS.routes || []).forEach(r => { if ((r.distanceKm || 0) > longestRoute) longestRoute = r.distanceKm; });
    return {
      totalFlights: (GS.routes || []).reduce((s, r) => s + (r.totalFlights || 0), 0),
      activeRoutes: (GS.routes || []).filter(r => r.status === 'active').length,
      fleetSize: fleet.length,
      longestRoute,
      balance: GS.finances.balance,
      reputation: GS.company ? GS.company.reputation : 0,
      alliances: (GS.alliances || []).length,
      hasWidebody: fleet.some(a => { const m = getAircraftModel(a.modelId); return m && m.category === 'widebody'; }),
      beatAI: GS.ai ? GS.finances.balance > (GS.ai.cash || 0) : false,
    };
  },

  checkAchievements() {
    if (!GS.company) return;
    if (!GS.company.achievements) GS.company.achievements = [];
    const stats = this.getStats();
    this.ACHIEVEMENTS.forEach(a => {
      if (GS.company.achievements.includes(a.id)) return;
      let ok = false;
      try { ok = a.check(stats); } catch (e) { ok = false; }
      if (ok) {
        GS.company.achievements.push(a.id);
        if (a.cash > 0) GS.addToBalance(a.cash, 'bonus', `Succès : ${a.name}`);
        this.addXP(a.xp, 'achievement');
        if (typeof UI !== 'undefined') {
          UI.notify(`${a.icon} Succès débloqué : ${a.name}${a.cash ? ` (+$${(a.cash/1e6).toFixed(1)}M)` : ''}`, 'success', 6000);
        }
      }
    });
  },

  isAchievementUnlocked(id) {
    return GS.company && GS.company.achievements && GS.company.achievements.includes(id);
  },
};

/* =====================================================================
   FINANCE — Bank loans / debt financing
   ===================================================================== */
const Finance = {
  // Loan products scale with company level
  getOffers() {
    const lvl = Progression.getLevel();
    const nw = this.netWorth();
    // Max single-loan principal scales with level and net worth
    const base = 5000000 + lvl * 5000000;
    const offers = [
      { id: 'short', name: 'Crédit Court Terme', termMonths: 12, annualRate: 0.08, max: Math.max(base, nw * 0.4) },
      { id: 'medium', name: 'Prêt Développement', termMonths: 36, annualRate: 0.06, max: Math.max(base * 2, nw * 0.8) },
      { id: 'long', name: 'Obligation Long Terme', termMonths: 60, annualRate: 0.05, max: Math.max(base * 4, nw * 1.5) },
    ];
    return offers.map(o => ({ ...o, max: Math.round(o.max / 100000) * 100000 }));
  },

  fleetValue() {
    return (GS.fleet || []).reduce((s, ac) => {
      const m = getAircraftModel(ac.modelId);
      if (!m || ac.leased) return s;
      const ageMonths = Math.round((ac.ageHours || 0) / 720);
      const val = typeof getSellPrice === 'function' ? getSellPrice(m, ageMonths) : m.purchasePrice * 0.6;
      return s + val;
    }, 0);
  },

  totalDebt() {
    return (GS.finances.loans || []).reduce((s, l) => s + (l.remaining || 0), 0);
  },

  netWorth() {
    return GS.finances.balance + this.fleetValue() - this.totalDebt();
  },

  maxBorrowable() {
    // Cannot exceed 2.5x net worth in total debt
    const cap = Math.max(2000000, this.netWorth() * 2.5);
    return Math.max(0, cap - this.totalDebt());
  },

  monthlyPayment(principal, annualRate, termMonths) {
    const r = annualRate / 12;
    if (r === 0) return principal / termMonths;
    return principal * r / (1 - Math.pow(1 + r, -termMonths));
  },

  takeLoan(offerId, principal) {
    const offer = this.getOffers().find(o => o.id === offerId);
    if (!offer) return { error: 'Offre invalide.' };
    principal = Math.round(principal);
    if (principal <= 0) return { error: 'Montant invalide.' };
    if (principal > offer.max) return { error: `Maximum pour cette offre : $${offer.max.toLocaleString()}.` };
    if (principal > this.maxBorrowable()) return { error: `Capacité d'emprunt dépassée. Max : $${Math.round(this.maxBorrowable()).toLocaleString()}.` };
    if (!GS.finances.loans) GS.finances.loans = [];
    const pay = this.monthlyPayment(principal, offer.annualRate, offer.termMonths);
    GS.finances.loans.push({
      id: GS.genId(),
      product: offer.name,
      principal,
      remaining: principal,
      annualRate: offer.annualRate,
      termMonths: offer.termMonths,
      monthsPaid: 0,
      monthlyPayment: Math.round(pay),
      takenAt: new Date(GS.gameDate),
    });
    GS.addToBalance(principal, 'loan', `Prêt : ${offer.name}`);
    return { success: true };
  },

  repayLoan(loanId) {
    const loan = (GS.finances.loans || []).find(l => l.id === loanId);
    if (!loan) return { error: 'Prêt introuvable.' };
    if (GS.finances.balance < loan.remaining) return { error: 'Fonds insuffisants pour le remboursement anticipé.' };
    GS.addToBalance(-loan.remaining, 'loan', `Remboursement anticipé : ${loan.product}`);
    loan.remaining = 0;
    GS.finances.loans = GS.finances.loans.filter(l => l.remaining > 0.5);
    return { success: true };
  },

  // Called once per game-month
  tickMonthly() {
    if (!GS.finances.loans || !GS.finances.loans.length) return;
    let totalPaid = 0;
    GS.finances.loans.forEach(loan => {
      if (loan.remaining <= 0) return;
      const interest = loan.remaining * (loan.annualRate / 12);
      let payment = loan.monthlyPayment;
      if (payment > loan.remaining + interest) payment = loan.remaining + interest;
      const principalPaid = payment - interest;
      loan.remaining = Math.max(0, loan.remaining - principalPaid);
      loan.monthsPaid = (loan.monthsPaid || 0) + 1;
      totalPaid += payment;
    });
    if (totalPaid > 0) {
      GS.addToBalance(-Math.round(totalPaid), 'loan', 'Échéances de prêts');
      GS.finances.costs.fees += Math.round(totalPaid);
    }
    GS.finances.loans = GS.finances.loans.filter(l => l.remaining > 0.5);
  },
};

/* =====================================================================
   MAINTENANCE — A/C/D checks, wear, incident risk
   ===================================================================== */
const Maintenance = {
  CHECKS: {
    A: { interval: 600,   label: 'Check A', costFactor: 0.004, restoreCondition: 8,  desc: 'Inspection légère' },
    C: { interval: 3000,  label: 'Check C', costFactor: 0.02,  restoreCondition: 40, desc: 'Révision approfondie' },
    D: { interval: 12000, label: 'Check D (Grande Visite)', costFactor: 0.06, restoreCondition: 100, desc: 'Refonte complète' },
  },

  // Returns the most urgent check status for an aircraft
  getStatus(ac) {
    if (!ac) return null;
    const model = getAircraftModel(ac.modelId);
    const hours = ac.ageHours || 0;
    const lastA = ac.lastCheckA || 0;
    const lastC = ac.lastCheckC || 0;
    const lastD = ac.lastCheckD || 0;
    const sinceA = hours - lastA;
    const sinceC = hours - lastC;
    const sinceD = hours - lastD;
    // Determine due states
    const dueD = sinceD >= this.CHECKS.D.interval;
    const dueC = sinceC >= this.CHECKS.C.interval;
    const dueA = sinceA >= this.CHECKS.A.interval;
    let next = 'A', sinceNext = sinceA, interval = this.CHECKS.A.interval;
    // Choose the highest-tier due/most-urgent check to surface
    if (dueD) { next = 'D'; sinceNext = sinceD; interval = this.CHECKS.D.interval; }
    else if (dueC) { next = 'C'; sinceNext = sinceC; interval = this.CHECKS.C.interval; }
    else if (dueA) { next = 'A'; sinceNext = sinceA; interval = this.CHECKS.A.interval; }
    else {
      // None due — surface the one closest to due (by fraction)
      const fA = sinceA / this.CHECKS.A.interval;
      const fC = sinceC / this.CHECKS.C.interval;
      const fD = sinceD / this.CHECKS.D.interval;
      if (fD >= fC && fD >= fA) { next = 'D'; sinceNext = sinceD; interval = this.CHECKS.D.interval; }
      else if (fC >= fA) { next = 'C'; sinceNext = sinceC; interval = this.CHECKS.C.interval; }
      else { next = 'A'; sinceNext = sinceA; interval = this.CHECKS.A.interval; }
    }
    const due = dueA || dueC || dueD;
    const overdueRatio = sinceNext / interval;
    const cost = model ? Math.round(model.purchasePrice * this.CHECKS[next].costFactor) : 0;
    return {
      nextCheck: next,
      label: this.CHECKS[next].label,
      desc: this.CHECKS[next].desc,
      sinceHours: Math.round(sinceNext),
      interval,
      remainingHours: Math.max(0, Math.round(interval - sinceNext)),
      due, dueA, dueC, dueD,
      overdueRatio,
      cost,
      condition: ac.condition || 100,
    };
  },

  performCheck(ac, checkType) {
    const model = getAircraftModel(ac.modelId);
    if (!model) return { error: 'Modèle introuvable.' };
    const def = this.CHECKS[checkType];
    if (!def) return { error: 'Type de check invalide.' };
    if (ac.status === 'flying') return { error: 'Impossible : appareil en vol.' };
    const cost = Math.round(model.purchasePrice * def.costFactor);
    if (GS.finances.balance < cost) return { error: 'Fonds insuffisants.' };
    GS.addToBalance(-cost, 'maintenance', `${def.label} ${ac.name}`);
    GS.finances.costs.maintenance += cost;
    ac.condition = Math.min(100, (ac.condition || 100) + def.restoreCondition);
    const hours = ac.ageHours || 0;
    // A higher-tier check satisfies lower tiers too
    if (checkType === 'A') ac.lastCheckA = hours;
    if (checkType === 'C') { ac.lastCheckA = hours; ac.lastCheckC = hours; }
    if (checkType === 'D') { ac.lastCheckA = hours; ac.lastCheckC = hours; ac.lastCheckD = hours; }
    return { success: true, cost };
  },

  // Per-flight incident roll for overdue aircraft. Returns incident object or null.
  rollIncident(ac) {
    const st = this.getStatus(ac);
    if (!st || !st.due) return null;
    // Probability grows with how overdue; D-checks are riskiest
    const tierRisk = { A: 0.01, C: 0.03, D: 0.06 }[st.nextCheck] || 0.01;
    const overdueExcess = Math.max(0, st.overdueRatio - 1);
    const prob = Math.min(0.35, tierRisk + overdueExcess * 0.15);
    if (Math.random() > prob) return null;
    const model = getAircraftModel(ac.modelId);
    const cost = model ? Math.round(model.purchasePrice * 0.015) : 50000;
    GS.addToBalance(-cost, 'maintenance', `Incident technique ${ac.name}`);
    GS.finances.costs.maintenance += cost;
    ac.condition = Math.max(5, (ac.condition || 100) - 12);
    if (typeof GS.addReputation === 'function') GS.addReputation(-1.5);
    return { cost, type: st.nextCheck };
  },
};
