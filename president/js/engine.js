'use strict';

const Engine = (() => {
  let state = null;
  let ticker = null;
  let speed = 1;
  let paused = false;
  let dayMs = 1000;

  function init(countryId, presidentName, difficulty) {
    const base = COUNTRIES.find(c => c.id === countryId);
    const diff = { easy: 1.3, normal: 1.0, hard: 0.7 }[difficulty] || 1;

    state = {
      presidentName,
      countryId,
      country: JSON.parse(JSON.stringify(base)),
      date: new Date(2025, 0, 1),
      day: 0,
      difficulty,
      treasury: base.treasury * diff,
      gdp: base.gdp,
      gdpGrowth: base.gdpGrowth,
      population: base.population,
      happiness: base.happiness,
      security: base.security,
      literacy: base.literacy,
      lifeExp: base.lifeExp,
      idh: base.idh,
      inflation: base.inflation,
      unemployment: base.unemployment,
      taxRate: base.taxRate,
      corpTax: base.corpTax,
      vatRate: base.vatRate,
      defBudget: base.defBudget,
      intelBudget: base.intelBudget,
      energyCap: base.energyCap,
      electrRate: base.electrRate,
      roadKm: base.roadKm,
      airports: base.airports,
      healthRank: base.healthRank,
      hydroPct: base.hydroPct,
      mandat: 1,
      elections: base.elections * 365,
      daysToElection: base.elections * 365,
      infrastructure: JSON.parse(JSON.stringify(INFRASTRUCTURE)),
      healthBuilt: [],
      eduBuilt: [],
      sports: JSON.parse(JSON.stringify(SPORTS_LIST)),
      nations: JSON.parse(JSON.stringify(NATIONS)),
      resources: {},
      wars: [],
      cabinetMessages: [],
      newsLocal: [],
      newsWorld: [],
      eventQueue: [],
      pendingCabinetIdx: 0,
      resourcePrices: {},
      resourceStocks: {},
      resourceRevenue: 0,
      dailyIncome: 0,
      dailyExpenses: 0,
      totalDebt: 0,
      score: 0,
      gameOver: false
    };

    // Init resources
    const myResources = base.resources || [];
    myResources.forEach(r => {
      if (RESOURCES[r]) {
        state.resourcePrices[r] = RESOURCES[r].basePrice;
        state.resourceStocks[r] = RESOURCES[r].stock;
      }
    });

    recalcEconomy();
    generateInitialNews();
    scheduleCabinetMessage();

    return state;
  }

  function recalcEconomy() {
    const s = state;
    // Daily income = GDP * tax rate / 365
    const taxIncome = (s.gdp * s.taxRate / 100) / 365;
    const corpIncome = (s.gdp * 0.3 * s.corpTax / 100) / 365;
    const vatIncome = (s.gdp * 0.5 * s.vatRate / 100) / 365;

    // Resource revenue
    let resRev = 0;
    Object.keys(s.resourcePrices).forEach(r => {
      const res = RESOURCES[r];
      if (res) resRev += (s.resourcePrices[r] * res.stock * 0.001) / 365;
    });

    s.dailyIncome = taxIncome + corpIncome + vatIncome + resRev;

    // Expenses
    const defDaily = s.defBudget / 365;
    const intelDaily = s.intelBudget / 365;
    const infraDaily = s.energyCap * 0.0001;
    const socialDaily = (s.population * 0.8) / 365 * (1 + (100 - s.happiness) / 200);

    s.dailyExpenses = defDaily + intelDaily + infraDaily + socialDaily;
    s.resourceRevenue = resRev;
  }

  function tick() {
    if (paused || !state || state.gameOver) return;

    state.day++;
    state.date = new Date(state.date.getTime() + 86400000);
    state.daysToElection--;

    // Treasury update
    const net = state.dailyIncome - state.dailyExpenses;
    state.treasury += net;

    // GDP growth (monthly)
    if (state.day % 30 === 0) {
      state.gdp *= (1 + state.gdpGrowth / 100 / 12);
      state.inflation += (Math.random() - 0.5) * 0.3;
      state.inflation = Math.max(0, Math.min(50, state.inflation));
      recalcEconomy();
    }

    // Price fluctuations
    if (state.day % 7 === 0) fluctuatePrices();

    // Building progress
    updateBuildings();

    // Happiness drift
    const happyTarget = calcHappinessTarget();
    state.happiness += (happyTarget - state.happiness) * 0.005;
    state.happiness = Math.max(0, Math.min(100, state.happiness));

    // Security drift
    const secTarget = calcSecurityTarget();
    state.security += (secTarget - state.security) * 0.003;
    state.security = Math.max(0, Math.min(100, state.security));

    // Random events (every ~60-120 days)
    if (state.day % Math.floor(60 + Math.random() * 60) === 0) {
      triggerRandomEvent();
    }

    // Cabinet messages (every ~30-60 days)
    if (state.day % Math.floor(30 + Math.random() * 30) === 0) {
      scheduleCabinetMessage();
    }

    // News update (every 7 days)
    if (state.day % 7 === 0) generateNews();

    // Sports update (every 90 days)
    if (state.day % 90 === 0) updateSports();

    // Elections
    if (state.daysToElection <= 0) handleElection();

    // Score
    state.score = Math.floor(
      state.happiness * 0.3 + state.security * 0.2 +
      state.idh * 100 * 0.3 + Math.log10(Math.max(1, state.treasury)) * 5
    );

    // Game over checks
    if (state.treasury < -50000) triggerBankruptcy();

    UI.update();
  }

  function calcHappinessTarget() {
    const s = state;
    let h = 50;
    h += (s.literacy - 70) * 0.2;
    h += (s.security - 50) * 0.2;
    h -= s.inflation * 0.5;
    h += (s.electrRate - 50) * 0.1;
    h += (s.idh - 0.5) * 30;
    return Math.max(5, Math.min(95, h));
  }

  function calcSecurityTarget() {
    const s = state;
    let sec = 50;
    sec += (s.defBudget / s.gdp * 1000) * 0.5;
    sec -= s.wars.length * 10;
    sec += (s.happiness - 40) * 0.1;
    return Math.max(5, Math.min(95, sec));
  }

  function fluctuatePrices() {
    Object.keys(state.resourcePrices).forEach(r => {
      const res = RESOURCES[r];
      if (!res) return;
      const change = (Math.random() - 0.5) * 2 * res.volatility;
      state.resourcePrices[r] = Math.max(
        res.basePrice * 0.5,
        Math.min(res.basePrice * 2.5, state.resourcePrices[r] * (1 + change))
      );
    });
  }

  function updateBuildings() {
    ['energy','road'].forEach(cat => {
      state.infrastructure[cat].forEach(b => {
        if (b.building && !b.built) {
          b.progress++;
          if (b.progress >= b.days) {
            b.built = true;
            b.building = false;
            applyBuildingEffect(b, cat);
            UI.notify(`✅ ${b.name} terminé !`, 'success');
          }
        }
      });
    });
  }

  function applyBuildingEffect(b, cat) {
    if (cat === 'energy') {
      const mw = parseInt(b.effect.match(/\+(\d+)MW/)?.[1] || 0);
      state.energyCap += mw;
      const ep = parseInt(b.effect.match(/Électrif\+(\d+)/)?.[1] || 0);
      state.electrRate = Math.min(100, state.electrRate + ep);
      state.dailyIncome += b.income / 365;
    } else if (cat === 'road') {
      state.roadKm += 500;
      state.dailyIncome += b.income / 365;
    }
  }

  function scheduleCabinetMessage() {
    const msgs = CABINET_EVENTS;
    if (state.pendingCabinetIdx >= msgs.length) state.pendingCabinetIdx = 0;
    const template = msgs[state.pendingCabinetIdx++];
    const msg = JSON.parse(JSON.stringify(template));

    msg.text = msg.text
      .replace('{inf}', state.inflation.toFixed(1))
      .replace('{approval}', state.happiness.toFixed(0))
      .replace('{name}', state.presidentName);

    msg.date = formatDate(state.date);
    msg.resolved = false;
    state.cabinetMessages.unshift(msg);

    // Update badge
    const count = state.cabinetMessages.filter(m => !m.resolved).length;
    UI.setBadge('cabinet', count);
  }

  function generateInitialNews() {
    for (let i = 0; i < 4; i++) generateNews();
  }

  function generateNews() {
    const local = LOCAL_NEWS_TEMPLATES[Math.floor(Math.random() * LOCAL_NEWS_TEMPLATES.length)];
    const world = WORLD_NEWS_TEMPLATES[Math.floor(Math.random() * WORLD_NEWS_TEMPLATES.length)];

    const fillLocal = local
      .replace('{name}', state.presidentName)
      .replace('{mw}', Math.floor(100 + Math.random() * 400))
      .replace('{price}', Math.floor(state.resourcePrices['cobalt'] || 32000).toLocaleString())
      .replace('{cost}', Math.floor(100 + Math.random() * 900))
      .replace('{nation}', NATIONS[Math.floor(Math.random() * NATIONS.length)].name)
      .replace('{n}', Math.floor(10 + Math.random() * 200))
      .replace('{tons}', Math.floor(5000 + Math.random() * 20000))
      .replace('{beds}', Math.floor(100 + Math.random() * 500))
      .replace('{inf}', state.inflation.toFixed(1))
      .replace('{pct}', Math.floor(10 + Math.random() * 90));

    const fillWorld = world
      .replace('{n}', Math.floor(5 + Math.random() * 200))
      .replace('{pct}', (1 + Math.random() * 8).toFixed(1))
      .replace('{year}', state.date.getFullYear());

    state.newsLocal.unshift({ text: fillLocal, date: formatDate(state.date) });
    state.newsWorld.unshift({ text: fillWorld, date: formatDate(state.date) });

    if (state.newsLocal.length > 20) state.newsLocal.pop();
    if (state.newsWorld.length > 20) state.newsWorld.pop();

    UI.setBadge('news', Math.min(9, Math.floor(Math.random() * 3 + 1)));
  }

  function triggerRandomEvent() {
    const ev = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    UI.showEvent(ev);
    paused = true;
  }

  function resolveEvent(ev, choiceIdx) {
    const choice = ev.choices[choiceIdx];
    applyEffect(choice.effect);
    paused = false;
    UI.hideEvent();
    UI.update();
  }

  function applyEffect(effect) {
    if (!effect) return;
    if (effect.treasury) state.treasury += effect.treasury;
    if (effect.happiness) state.happiness = Math.max(0, Math.min(100, state.happiness + effect.happiness));
    if (effect.security) state.security = Math.max(0, Math.min(100, state.security + effect.security));
    if (effect.gdpGrowth) state.gdpGrowth += effect.gdpGrowth;
    if (effect.idh) state.idh = Math.min(1, state.idh + effect.idh);
    recalcEconomy();
  }

  function resolveCabinet(msgIdx, choiceIdx) {
    const msg = state.cabinetMessages[msgIdx];
    if (!msg || msg.resolved) return;
    applyEffect(msg.choices[choiceIdx].effect);
    msg.resolved = true;
    const count = state.cabinetMessages.filter(m => !m.resolved).length;
    UI.setBadge('cabinet', count);
    UI.renderCabinet();
    UI.update();
  }

  function updateSports() {
    state.sports.forEach(s => {
      const trend = (Math.random() - 0.5) * 20;
      s.rank = Math.max(1, Math.min(200, s.rank + trend));
      s.stars = s.rank <= 20 ? 5 : s.rank <= 50 ? 4 : s.rank <= 80 ? 3 : s.rank <= 120 ? 2 : 1;
    });
  }

  function investSport(idx, amount) {
    if (state.treasury < amount) { UI.notify('Fonds insuffisants !', 'error'); return; }
    state.treasury -= amount;
    state.sports[idx].rank = Math.max(1, state.sports[idx].rank - Math.floor(amount / 10));
    state.sports[idx].budget += amount;
    state.sports[idx].stars = state.sports[idx].rank <= 20 ? 5 : state.sports[idx].rank <= 50 ? 4 : state.sports[idx].rank <= 80 ? 3 : 2;
    UI.notify(`💰 Investissement sport: $${amount}M`, 'success');
    UI.renderSports();
    UI.update();
  }

  function buildInfra(cat, id) {
    const items = state.infrastructure[cat];
    const b = items.find(i => i.id === id);
    if (!b || b.built || b.building) return;
    if (state.treasury < b.cost) { UI.notify('Fonds insuffisants !', 'error'); return; }
    state.treasury -= b.cost;
    b.building = true;
    b.progress = 0;
    UI.notify(`🏗️ Construction lancée: ${b.name}`, 'info');
    UI.renderEnergy();
  }

  function buildHealth(id) {
    const b = HEALTH_BUILDINGS.find(h => h.id === id);
    if (!b) return;
    if (state.treasury < b.cost) { UI.notify('Fonds insuffisants !', 'error'); return; }
    state.treasury -= b.cost;
    state.healthBuilt.push({ ...b, progress: 0, done: false });
    const hp = parseInt(b.effect.match(/\+(\d+)/)?.[1] || 0);
    state.healthRank = Math.max(1, state.healthRank - hp * 2);
    UI.notify(`🏥 Construction: ${b.name}`, 'info');
    UI.renderDevelopment();
    UI.update();
  }

  function buildEdu(id) {
    const b = EDU_BUILDINGS.find(e => e.id === id);
    if (!b) return;
    if (state.treasury < b.cost) { UI.notify('Fonds insuffisants !', 'error'); return; }
    state.treasury -= b.cost;
    state.eduBuilt.push({ ...b, progress: 0, done: false });
    if (b.effect.includes('Alphabétisation')) {
      state.literacy = Math.min(100, state.literacy + parseInt(b.effect.match(/\+(\d+)/)?.[1] || 0));
    }
    if (b.effect.includes('IDH')) {
      state.idh = Math.min(1, state.idh + 0.01);
    }
    UI.notify(`📚 Construction: ${b.name}`, 'info');
    UI.renderDevelopment();
    UI.update();
  }

  function diplo(nationId, action) {
    const n = state.nations.find(x => x.id === nationId);
    if (!n) return;
    if (action === 'ally') {
      if (state.treasury < 50) { UI.notify('Fonds insuffisants !', 'error'); return; }
      state.treasury -= 50;
      n.relation = 'ally';
      UI.notify(`🤝 Alliance conclue avec ${n.name}`, 'success');
    } else if (action === 'trade') {
      if (state.treasury < 20) { UI.notify('Fonds insuffisants !', 'error'); return; }
      state.treasury -= 20;
      state.dailyIncome += 5;
      UI.notify(`📦 Accord commercial avec ${n.name}`, 'success');
    } else if (action === 'war') {
      n.relation = 'hostile';
      state.wars.push(nationId);
      state.treasury -= 200;
      state.security -= 5;
      UI.notify(`⚔️ Déclaration de guerre: ${n.name} !`, 'error');
    } else if (action === 'peace') {
      n.relation = 'neutral';
      state.wars = state.wars.filter(w => w !== nationId);
      state.treasury -= 100;
      UI.notify(`🕊️ Traité de paix: ${n.name}`, 'success');
    }
    UI.renderDiplomacy();
    UI.update();
  }

  function sellResource(r, amount) {
    if ((state.resourceStocks[r] || 0) < amount) { UI.notify('Stock insuffisant !', 'error'); return; }
    const revenue = amount * state.resourcePrices[r] / 1000;
    state.treasury += revenue;
    state.resourceStocks[r] -= amount;
    UI.notify(`💰 Vente: +$${revenue.toFixed(1)}M`, 'success');
    UI.renderResources();
    UI.update();
  }

  function investResource(r, amount) {
    if (state.treasury < amount) { UI.notify('Fonds insuffisants !', 'error'); return; }
    state.treasury -= amount;
    state.resourceStocks[r] = (state.resourceStocks[r] || 0) + amount * 500;
    UI.notify(`⛏️ Investissement minier: $${amount}M`, 'success');
    UI.renderResources();
    UI.update();
  }

  function setTax(type, val) {
    state[type] = val;
    recalcEconomy();
    UI.update();
  }

  function setDefBudget(val) {
    state.defBudget = val;
    recalcEconomy();
    UI.update();
  }

  function addCustomResource(name, emoji, cost, income, effect) {
    const id = name.toLowerCase().replace(/\s+/g, '_');
    RESOURCES[id] = { name, emoji, unit:'unité', basePrice: income * 1000, stock: 10000, volatility: 0.1, desc: effect };
    state.resourcePrices[id] = income * 1000;
    state.resourceStocks[id] = 10000;
    state.treasury -= cost;
    state.dailyIncome += income / 365;
    UI.notify(`✅ ${emoji} ${name} ajouté à l'économie nationale !`, 'success');
    UI.renderResources();
    UI.renderResourceMarket();
    UI.update();
  }

  function handleElection() {
    state.daysToElection = state.country.elections * 365;
    const winProb = state.happiness / 100;
    if (Math.random() < winProb) {
      state.mandat++;
      UI.showEvent({
        id:'election_win', icon:'🏆', title:'VICTOIRE ÉLECTORALE !',
        desc:`Félicitations ! Vous avez été réélu pour un ${state.mandat}ème mandat avec ${Math.floor(45 + state.happiness * 0.4)}% des voix !`,
        choices:[{ label:'✅ Commencer le nouveau mandat', effect:{ happiness: 5 } }]
      });
    } else {
      UI.showEvent({
        id:'election_loss', icon:'❌', title:'DÉFAITE ÉLECTORALE',
        desc:`Vous avez perdu les élections avec ${Math.floor(35 + (100 - state.happiness) * 0.3)}% contre vous. La nation vous remercie pour vos services.`,
        choices:[{ label:'Accepter le résultat', effect:{} }]
      });
      setTimeout(() => { state.gameOver = true; stopTicker(); UI.showGameOver(); }, 3000);
    }
  }

  function triggerBankruptcy() {
    state.gameOver = true;
    stopTicker();
    UI.showEvent({
      id:'bankrupt', icon:'💸', title:'FAILLITE NATIONALE',
      desc:'Le trésor public est épuisé. Le pays ne peut plus payer ses fonctionnaires ni rembourser ses dettes. C\'est la fin de votre gouvernement.',
      choices:[{ label:'😞 Recommencer', effect:{} }]
    });
  }

  function startTicker() {
    if (ticker) clearInterval(ticker);
    ticker = setInterval(() => tick(), dayMs / speed);
  }

  function stopTicker() {
    if (ticker) { clearInterval(ticker); ticker = null; }
  }

  function setSpeed(s) {
    speed = s;
    if (s === 0) { paused = true; stopTicker(); }
    else { paused = false; startTicker(); }
  }

  function formatDate(d) {
    const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function formatMoney(n) {
    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';
    if (abs >= 1e6) return `${sign}$${(abs/1e6).toFixed(1)}T`;
    if (abs >= 1e3) return `${sign}$${(abs/1e3).toFixed(1)}B`;
    return `${sign}$${abs.toFixed(0)}M`;
  }

  return {
    init, startTicker, stopTicker, setSpeed,
    resolveEvent, resolveCabinet,
    buildInfra, buildHealth, buildEdu,
    investSport, diplo,
    sellResource, investResource,
    setTax, setDefBudget,
    addCustomResource,
    formatDate, formatMoney,
    get: () => state
  };
})();
