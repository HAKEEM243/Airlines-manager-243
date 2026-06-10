/* ===== CERTIFICATIONS · FINANCE · MAINTENANCE — Hakvision Aircraft ===== */
/* Replaces the XP/level system with realistic business unlocks */

/* =====================================================================
   TYPE RATINGS — Pilot qualification by aircraft family
   ===================================================================== */
const TypeRatings = {
  FAMILIES: {
    atr:         { name: 'ATR / Turboprops',         cost: 15000, trainingDays: 20,  aircraft: ['atr42','atr72','dash8'] },
    crj:         { name: 'Bombardier CRJ',            cost: 18000, trainingDays: 20,  aircraft: ['crj200','crj700','crj900'] },
    e_jet:       { name: 'Embraer E-Jet',             cost: 22000, trainingDays: 25,  aircraft: ['e170','e175'] },
    e2_jet:      { name: 'Embraer E2 / E190',         cost: 28000, trainingDays: 28,  aircraft: ['e190','e195'] },
    a220:        { name: 'Airbus A220',               cost: 32000, trainingDays: 30,  aircraft: ['a220-100','a220-300'] },
    a320_family: { name: 'Airbus A320 Family',        cost: 38000, trainingDays: 32,  aircraft: ['a319','a320','a320neo','a321','a321xlr'] },
    a330_family: { name: 'Airbus A330 / A340',        cost: 58000, trainingDays: 45,  aircraft: ['a330-200','a330-300','a330-900neo','a340-600'] },
    a350_family: { name: 'Airbus A350',               cost: 72000, trainingDays: 50,  aircraft: ['a350-900','a350-1000'] },
    a380_type:   { name: 'Airbus A380',               cost: 95000, trainingDays: 60,  aircraft: ['a380'] },
    b737_family: { name: 'Boeing 737 / 757',          cost: 36000, trainingDays: 30,  aircraft: ['b737-700','b737-800','b737max8','b737max10','b757-200','b737f'] },
    b767_b777:   { name: 'Boeing 767 / 777',          cost: 55000, trainingDays: 45,  aircraft: ['b767-300er','b767f','b777-200er','b777-300er','b777x'] },
    b787_family: { name: 'Boeing 787 Dreamliner',     cost: 65000, trainingDays: 50,  aircraft: ['b787-8','b787-9','b787-10'] },
    b747_family: { name: 'Boeing 747',                cost: 80000, trainingDays: 55,  aircraft: ['b747-400','b747-8'] },
    concorde:    { name: 'Supersonique (Concorde)',   cost: 120000, trainingDays: 90, aircraft: ['concorde'] },
  },

  getFamilyForModel(modelId) {
    for (const [fam, def] of Object.entries(this.FAMILIES)) {
      if (def.aircraft.includes(modelId)) return fam;
    }
    return null;
  },

  pilotHasRating(pilot, modelId) {
    const fam = this.getFamilyForModel(modelId);
    if (!fam) return true;
    if (!pilot.typeRatings || pilot.typeRatings.length === 0) return false;
    return pilot.typeRatings.includes(fam);
  },

  getQualifiedPilots(modelId) {
    const fam = this.getFamilyForModel(modelId);
    if (!fam) return GS.crew.filter(c => c.type === 'pilot');
    return GS.crew.filter(c => c.type === 'pilot' && c.typeRatings && c.typeRatings.includes(fam));
  },

  hasAnyQualifiedPilot(modelId) {
    return this.getQualifiedPilots(modelId).length > 0;
  },

  startTraining(pilotId, family) {
    const pilot = GS.crew.find(c => c.id === pilotId);
    const famDef = this.FAMILIES[family];
    if (!pilot || !famDef) return { error: 'Pilote ou qualification introuvable.' };
    if (pilot.typeRatings && pilot.typeRatings.includes(family)) return { error: 'Qualification déjà obtenue.' };
    if (pilot.inTraining) return { error: 'Ce pilote est déjà en formation.' };
    if (GS.finances.balance < famDef.cost) return { error: `Fonds insuffisants. Coût : $${famDef.cost.toLocaleString()}` };

    GS.addToBalance(-famDef.cost, 'training', `Formation ${famDef.name} — ${pilot.name}`);
    pilot.inTraining = family;
    pilot.trainingEndDate = new Date(GS.gameDate.getTime() + famDef.trainingDays * 86400000);
    return { success: true };
  },

  tickTraining() {
    GS.crew.forEach(pilot => {
      if (!pilot.inTraining) return;
      const endDate = pilot.trainingEndDate instanceof Date ? pilot.trainingEndDate : new Date(pilot.trainingEndDate);
      if (GS.gameDate >= endDate) {
        if (!pilot.typeRatings) pilot.typeRatings = [];
        if (!pilot.typeRatings.includes(pilot.inTraining)) {
          pilot.typeRatings.push(pilot.inTraining);
          const famName = (this.FAMILIES[pilot.inTraining] || {}).name || pilot.inTraining;
          if (typeof UI !== 'undefined') {
            UI.notify(`✈ ${pilot.name} a obtenu sa qualification ${famName} !`, 'success', 5000);
          }
        }
        pilot.inTraining = null;
        pilot.trainingEndDate = null;
      }
    });
  },

  getDaysRemaining(pilot) {
    if (!pilot.inTraining || !pilot.trainingEndDate) return 0;
    const end = pilot.trainingEndDate instanceof Date ? pilot.trainingEndDate : new Date(pilot.trainingEndDate);
    const diff = end - GS.gameDate;
    return Math.max(0, Math.ceil(diff / 86400000));
  },
};

/* =====================================================================
   MARKET SHARE — Competitive demand split between airlines
   ===================================================================== */
const MarketShare = {
  // Returns the fraction of route demand captured by the player (0–1)
  calcShare(route) {
    if (!GS.company) return 0.5;
    const rep = GS.company.reputation || 0;
    const freq = route.frequency || 1;

    // Base share derived from reputation (0–100 → 25%–85%)
    let share = 0.25 + (rep / 100) * 0.60;

    // Frequency bonus: each additional daily frequency adds share
    share *= Math.min(1.5, 1 + (freq - 1) * 0.07);

    // Marketing bonuses
    if (GS.marketing && GS.marketing.campaigns) {
      if (GS.marketing.campaigns.includes('loyalty')) share += 0.05;
      if (GS.marketing.campaigns.includes('tv'))      share += 0.07;
      if (GS.marketing.campaigns.includes('b2b'))     share += 0.04;
    }

    // Alliance bonuses
    if (GS.alliances) {
      if (GS.alliances.includes('pacifica')) share += 0.05;
      if (GS.alliances.includes('transatlantic')) share += 0.05;
    }

    // AI competition penalty: if the AI operates the same route, lose share
    if (typeof AIEngine !== 'undefined' && AIEngine.airline) {
      const aiRoutes = (AIEngine.airline.routes || []);
      const competing = aiRoutes.filter(r =>
        (r.origin === route.origin && r.destination === route.destination) ||
        (r.origin === route.destination && r.destination === route.origin)
      ).length;
      share -= competing * 0.10;
    }

    return Math.min(0.97, Math.max(0.10, share));
  },

  // Total market share across all active routes (weighted by demand)
  totalShare() {
    const active = GS.routes.filter(r => r.status === 'active');
    if (!active.length) return 0;
    let totalDemand = 0, capturedDemand = 0;
    active.forEach(r => {
      const demand = Economy.calcRouteDemand(r.origin, r.destination);
      const share = this.calcShare(r);
      totalDemand += demand;
      capturedDemand += demand * share;
    });
    return totalDemand > 0 ? Math.round((capturedDemand / totalDemand) * 100) : 0;
  },

  // Human-readable competitive position label
  getPositionLabel() {
    const rep = GS.company ? GS.company.reputation : 0;
    const fleet = GS.fleet.length;
    const routes = GS.routes.length;
    if (routes === 0) return 'Nouvelle compagnie';
    if (rep < 20 && fleet < 3) return 'Compagnie débutante';
    if (rep < 40 && fleet < 8) return 'Transporteur régional';
    if (rep < 60 && fleet < 15) return 'Compagnie établie';
    if (rep < 75 && fleet < 30) return 'Opérateur international';
    if (rep < 90) return 'Compagnie majeure';
    return 'Leader mondial';
  },
};

/* =====================================================================
   FINANCE — Bank loans, credit management
   ===================================================================== */
const Finance = {
  getOffers() {
    const bal = GS.finances.balance || 0;
    const fv = this.fleetValue();
    const debt = this.totalDebt();
    const nw = Math.max(0, bal + fv - debt);

    // Borrowing capacity scales with company's real economic size
    const maxBase = Math.max(5000000, nw * 1.8 + fv * 0.3);
    return [
      {
        id: 'short',
        name: 'Court terme · 12 mois',
        annualRate: 0.08,
        termMonths: 12,
        max: Math.round(Math.min(maxBase * 0.25, 60000000) / 500000) * 500000,
        color: 'var(--cyan)',
      },
      {
        id: 'medium',
        name: 'Moyen terme · 36 mois',
        annualRate: 0.06,
        termMonths: 36,
        max: Math.round(Math.min(maxBase * 0.55, 200000000) / 1000000) * 1000000,
        color: 'var(--gold)',
      },
      {
        id: 'long',
        name: 'Long terme · 60 mois',
        annualRate: 0.05,
        termMonths: 60,
        max: Math.round(Math.min(maxBase, 500000000) / 1000000) * 1000000,
        color: 'var(--green)',
      },
    ];
  },

  monthlyPayment(principal, annualRate, termMonths) {
    if (!principal || !termMonths) return 0;
    const r = annualRate / 12;
    if (r === 0) return Math.round(principal / termMonths);
    return Math.round(principal * (r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1));
  },

  takeLoan(offerId, principal) {
    const offers = this.getOffers();
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return { error: 'Offre introuvable.' };
    if (principal <= 0 || principal > offer.max) return { error: `Montant invalide (max $${offer.max.toLocaleString()}).` };
    if (!GS.finances.loans) GS.finances.loans = [];

    const monthly = this.monthlyPayment(principal, offer.annualRate, offer.termMonths);
    const loan = {
      id: GS.genId(),
      product: offer.name,
      principal,
      remaining: principal,
      termMonths: offer.termMonths,
      annualRate: offer.annualRate,
      monthlyPayment: monthly,
      paidMonths: 0,
      takenAt: new Date(GS.gameDate),
    };
    GS.finances.loans.push(loan);
    GS.addToBalance(principal, 'loan', `Emprunt — ${offer.name}`);
    return { success: true, loan };
  },

  repayLoan(loanId) {
    const loan = (GS.finances.loans || []).find(l => l.id === loanId);
    if (!loan) return { error: 'Prêt introuvable.' };
    // 2% early repayment penalty
    const penalty = Math.round(loan.remaining * 0.02);
    const total = loan.remaining + penalty;
    if (GS.finances.balance < total) return { error: `Fonds insuffisants ($${total.toLocaleString()} requis).` };
    GS.addToBalance(-total, 'loan_repay', `Remboursement anticipé + pénalité 2%`);
    GS.finances.loans = (GS.finances.loans || []).filter(l => l.id !== loanId);
    return { success: true };
  },

  tickMonthly() {
    if (!GS.finances.loans || !GS.finances.loans.length) return;
    GS.finances.loans.forEach(loan => {
      if (loan.paidMonths >= loan.termMonths) return;
      GS.addToBalance(-loan.monthlyPayment, 'loan_payment', `Mensualité prêt — ${loan.product}`);
      // Reduce remaining principal (interest portion stays as finance cost)
      const interestPart = loan.remaining * (loan.annualRate / 12);
      const principalPart = loan.monthlyPayment - interestPart;
      loan.remaining = Math.max(0, loan.remaining - principalPart);
      loan.paidMonths++;
    });
    // Clean up fully paid loans
    GS.finances.loans = GS.finances.loans.filter(l => l.paidMonths < l.termMonths && l.remaining > 100);
  },

  netWorth() {
    return (GS.finances.balance || 0) + this.fleetValue() - this.totalDebt();
  },

  fleetValue() {
    return (GS.fleet || []).reduce((s, ac) => {
      const model = getAircraftModel(ac.modelId);
      if (!model) return s;
      const ageMonths = (ac.ageHours || 0) / 720;
      return s + getSellPrice(model, ageMonths);
    }, 0);
  },

  totalDebt() {
    return (GS.finances.loans || []).reduce((s, l) => s + (l.remaining || 0), 0);
  },

  maxBorrowable() {
    const offers = this.getOffers();
    return Math.max(...offers.map(o => o.max));
  },
};

/* =====================================================================
   MAINTENANCE — A/C/D check system
   ===================================================================== */
const Maintenance = {
  CHECKS: {
    A: { hours: 600,   costFactor: 0.004, conditionRestore: 8,   label: 'Révision A — Inspection légère (600h)' },
    C: { hours: 3000,  costFactor: 0.020, conditionRestore: 40,  label: 'Révision C — Inspection approfondie (3 000h)' },
    D: { hours: 12000, costFactor: 0.060, conditionRestore: 100, label: 'Grande révision D (12 000h)' },
  },

  getStatus(aircraft) {
    const hours = aircraft.ageHours || 0;
    let nextType = null, hoursUntilNext = Infinity, isOverdue = false;

    for (const [t, chk] of Object.entries(this.CHECKS)) {
      const lastDone = aircraft['lastCheck_' + t] || 0;
      const sinceCheck = hours - lastDone;
      if (sinceCheck >= chk.hours) {
        // Overdue
        if (sinceCheck - chk.hours < (nextType ? Infinity : Infinity)) {
          nextType = t;
          hoursUntilNext = -(sinceCheck - chk.hours); // negative = overdue
          isOverdue = true;
        }
      } else {
        // Still upcoming
        const until = chk.hours - sinceCheck;
        if (until < hoursUntilNext) {
          hoursUntilNext = until;
          if (!isOverdue) nextType = t;
        }
      }
    }

    // Re-scan properly
    let overdueCheck = null;
    for (const [t, chk] of Object.entries(this.CHECKS)) {
      const lastDone = aircraft['lastCheck_' + t] || 0;
      if (hours - lastDone >= chk.hours && !overdueCheck) overdueCheck = t;
    }

    if (overdueCheck) {
      const chk = this.CHECKS[overdueCheck];
      const model = getAircraftModel(aircraft.modelId);
      const cost = model ? Math.round(model.purchasePrice * chk.costFactor) : 0;
      return { type: overdueCheck, check: chk, hoursUntil: 0, cost, overdue: true };
    }

    // Next upcoming check
    let nearest = null, nearestHours = Infinity;
    for (const [t, chk] of Object.entries(this.CHECKS)) {
      const lastDone = aircraft['lastCheck_' + t] || 0;
      const until = chk.hours - (hours - lastDone);
      if (until > 0 && until < nearestHours) { nearestHours = until; nearest = t; }
    }

    const model = getAircraftModel(aircraft.modelId);
    const chk = nearest ? this.CHECKS[nearest] : this.CHECKS.A;
    const cost = model ? Math.round(model.purchasePrice * chk.costFactor) : 0;
    return { type: nearest || 'A', check: chk, hoursUntil: nearestHours, cost, overdue: false };
  },

  performCheck(aircraft, type) {
    const chk = this.CHECKS[type];
    if (!chk) return { error: 'Type de révision invalide.' };
    const model = getAircraftModel(aircraft.modelId);
    if (!model) return { error: 'Modèle introuvable.' };
    if (aircraft.status === 'flying') return { error: 'L\'appareil doit être au sol pour la révision.' };
    const cost = Math.round(model.purchasePrice * chk.costFactor);
    if (GS.finances.balance < cost) return { error: `Fonds insuffisants. Coût : $${cost.toLocaleString()}` };
    GS.addToBalance(-cost, 'maintenance', chk.label + ' — ' + aircraft.name);
    aircraft['lastCheck_' + type] = aircraft.ageHours || 0;
    aircraft.condition = Math.min(100, (aircraft.condition || 50) + chk.conditionRestore);
    return { success: true, cost };
  },

  rollIncident(aircraft) {
    const status = this.getStatus(aircraft);
    if (!status.overdue) return null;
    // Overdue maintenance: 15% incident chance per flight completion
    if (Math.random() > 0.15) return null;
    const model = getAircraftModel(aircraft.modelId);
    const cost = model ? Math.round(model.purchasePrice * (0.002 + Math.random() * 0.003)) : 50000;
    GS.addToBalance(-cost, 'incident', `Incident technique — ${aircraft.name}`);
    GS.addReputation(-3);
    aircraft.condition = Math.max(10, (aircraft.condition || 50) - 12);
    return { cost };
  },
};
