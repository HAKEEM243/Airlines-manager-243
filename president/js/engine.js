'use strict';

/* ═══════════════════════════════════════════════════════════
   HAKVISION PRESIDENT LIFE — MOTEUR DE JEU
═══════════════════════════════════════════════════════════ */

const Engine = (() => {
  let S = null;          // state
  let ticker = null;
  let speed = 1;
  let paused = false;
  const DAY_MS = 1100;   // 1 jour réel à vitesse x1

  /* ───────── INIT ───────── */
  function init(countryId, presidentName, difficulty) {
    const base = COUNTRIES.find(c => c.id === countryId) || COUNTRIES[0];
    const diffMul = { easy:1.4, normal:1, hard:0.7 }[difficulty] || 1;

    S = {
      presidentName, countryId, difficulty,
      country: JSON.parse(JSON.stringify(base)),
      date: new Date(GAME_START.year, GAME_START.month, GAME_START.day),
      day: 0,

      treasury: Math.round(base.treasury * diffMul),
      gdp: base.gdp, gdpGrowth: base.gdpGrowth,
      population: base.population,
      happiness: base.happiness, security: base.security,
      literacy: base.literacy, lifeExp: base.lifeExp, idh: base.idh,
      inflation: base.inflation, unemployment: base.unemployment,
      taxRate: base.taxRate, corpTax: base.corpTax, vatRate: base.vatRate,
      defBudget: base.defBudget, intelBudget: base.intelBudget,
      energyCap: base.energyCap, electrRate: base.electrRate,
      roadKm: base.roadKm, airports: base.airports,
      healthRank: base.healthRank, hydroPct: base.hydroPct,
      prestige: 40, tourism: 30,

      mandat: 1,
      electionTerm: base.electionTerm,
      electionDate: base.electionTerm > 0
        ? new Date(GAME_START.year + base.electionTerm, 10, 15) // 15 nov
        : null,

      // Systèmes
      cities: countryId === 'rdc' ? JSON.parse(JSON.stringify(RDC_CITIES)) : [],
      resources: {},
      companies: [],
      ministers: JSON.parse(JSON.stringify(MINISTERS)),
      embassies: JSON.parse(JSON.stringify(EMBASSIES)),
      tradeContracts: [],
      army: { soldiers: 134000, tanks: 150, planes: 12, ships: 4, drones: 30 },
      stadiums: JSON.parse(JSON.stringify(STADIUMS)),
      sports: JSON.parse(JSON.stringify(SPORTS_DISCIPLINES)),
      activeSportEvents: [],
      infra: INFRA_PROJECTS.map(p => ({ id:p.id, building:false, progress:0, built: p.id==='hydro_dam'?false:false })),
      nations: JSON.parse(JSON.stringify(NATIONS)),
      wars: [],
      socialFeed: [],
      newsLocal: [], newsWorld: [],
      cabinetMessages: [], pendingCabinetIdx: 0,
      immigration: 0,
      unResolutionsVoted: [],

      dailyIncome: 0, dailyExpenses: 0,
      totalDebt: 0, score: 0, gameOver: false
    };

    // Ressources
    const prod = RESOURCE_PRODUCTION[countryId] || {};
    (base.resources || []).forEach(r => {
      const def = RESOURCES[r];
      if (!def) return;
      const p = prod[r] || { production: Math.round(base.gdp/50), reserves: base.gdp*100, exports:0.6 };
      S.resources[r] = {
        price: def.basePrice,
        production: p.production,
        reserves: p.reserves,
        exports: p.exports,
        stock: Math.round(p.production * 0.3)
      };
    });

    recalc();
    for (let i=0;i<5;i++){ generateNews(); }
    for (let i=0;i<4;i++){ generateSocialPost(); }
    scheduleCabinet();
    return S;
  }

  /* ───────── ÉCONOMIE ───────── */
  function minister(role) { return S.ministers.find(m => m.role.includes(role)); }
  function corruptionLoss() {
    // perte moyenne due à la corruption des ministres économiques
    const eco = S.ministers.filter(m => /Économie|Finances|Mines/.test(m.role));
    const avg = eco.reduce((a,m)=>a+m.corruption,0)/Math.max(1,eco.length);
    return avg / 100 * 0.12; // jusqu'à 12% de fuite
  }

  function recalc() {
    const s = S;
    const taxIncome = (s.gdp * s.taxRate/100)/365;
    const corpIncome = (s.gdp * 0.3 * s.corpTax/100)/365;
    const vatIncome = (s.gdp * 0.5 * s.vatRate/100)/365;

    // Revenu des entreprises
    let compIncome = 0, compJobs = 0;
    s.companies.forEach(c => {
      if (c.active) { compIncome += c.dailyRevenue * (s.corpTax/100); compJobs += c.jobs; }
    });

    // Revenu ressources (production exportée × prix)
    let resIncome = 0;
    Object.keys(s.resources).forEach(r => {
      const R = s.resources[r];
      resIncome += (R.production * R.exports * R.price) / 365 / 1e6; // en M$
    });

    // Contrats commerciaux
    let contractIncome = 0;
    s.tradeContracts.forEach(t => { if (t.yearsLeft > 0) contractIncome += t.dailyRevenue; });

    s.dailyIncome = (taxIncome + corpIncome + vatIncome + compIncome + resIncome + contractIncome);
    s.dailyIncome *= (1 - corruptionLoss());

    // Dépenses
    const defDaily = s.defBudget/365;
    const intelDaily = s.intelBudget/365;
    const social = (s.population * 0.9)/365 * (1 + (100-s.happiness)/150);
    let armyUpkeep = 0;
    ARMY_UNITS.forEach(u => { armyUpkeep += (s.army[u.id]||0) * u.upkeep / 365; });
    let infraDaily = 0;
    s.infra.forEach(i => { if (i.building) { const p = INFRA_PROJECTS.find(x=>x.id===i.id); infraDaily += p.cost/p.days; } });
    let sportDaily = s.stadiums.filter(st=>st.building).reduce((a,st)=>a+st.cost/180,0);

    s.dailyExpenses = defDaily + intelDaily + social + armyUpkeep + infraDaily + sportDaily;

    // Emploi : entreprises réduisent le chômage
    s._companyJobs = compJobs;
  }

  /* ───────── TICK QUOTIDIEN ───────── */
  function tick() {
    if (paused || !S || S.gameOver) return;
    const s = S;
    s.day++;
    s.date = new Date(s.date.getTime() + 86400000);

    // Trésor
    s.treasury += (s.dailyIncome - s.dailyExpenses);

    // Prix des ressources changent CHAQUE JOUR
    Object.keys(s.resources).forEach(r => {
      const def = RESOURCES[r], R = s.resources[r];
      const change = (Math.random()-0.5) * 2 * def.volatility * 0.15;
      R.price = Math.max(def.basePrice*0.4, Math.min(def.basePrice*3, R.price*(1+change)));
      R.stock += R.production/365 * (1 - R.exports);
    });

    // Mensuel
    if (s.day % 30 === 0) {
      s.gdp *= (1 + s.gdpGrowth/100/12);
      s.inflation += (Math.random()-0.5)*0.4;
      s.inflation = Math.max(0, Math.min(60, s.inflation));
      // Emploi
      const targetUnemp = Math.max(3, s.country.unemployment - (s._companyJobs/s.population/1e4));
      s.unemployment += (targetUnemp - s.unemployment)*0.1;
      // Immigration affecte population
      s.population += s.immigration/120;
      s.population = Math.max(1, s.population);
      updateCities();
      recalc();
    }

    // Contrats commerciaux : décompte annuel
    if (s.day % 365 === 0) {
      s.tradeContracts.forEach(t => { if (t.yearsLeft>0) t.yearsLeft--; });
      s.tradeContracts = s.tradeContracts.filter(t => t.yearsLeft > 0);
      recalc();
    }

    // Construction infra
    s.infra.forEach(i => {
      if (i.building && !i.built) {
        const p = INFRA_PROJECTS.find(x=>x.id===i.id);
        i.progress++;
        if (i.progress >= p.days) { i.built = true; i.building = false; applyInfra(p); UI.toast(`✅ ${p.name} terminé !`,'success'); }
      }
    });
    // Construction stades
    s.stadiums.forEach(st => {
      if (st.building) { st.progress = (st.progress||0)+1; if (st.progress>=180){ st.building=false; st.built=true; s.happiness=clamp(s.happiness+4); s.tourism+=5; UI.toast(`🏟️ ${st.name} inauguré !`,'success'); } }
    });

    // Événements sportifs en cours
    s.activeSportEvents.forEach(e => { e.daysLeft--; });
    s.activeSportEvents = s.activeSportEvents.filter(e => e.daysLeft > 0);

    // Dérive bonheur / sécurité
    s.happiness += (happinessTarget()-s.happiness)*0.006;
    s.happiness = clamp(s.happiness);
    s.security += (securityTarget()-s.security)*0.004;
    s.security = clamp(s.security);

    // Réseau social (tous les 4 jours)
    if (s.day % 4 === 0) generateSocialPost();
    // Actualités (tous les 7 jours)
    if (s.day % 7 === 0) generateNews();
    // Cabinet (~tous les 35 jours)
    if (s.day % 35 === 0) scheduleCabinet();
    // Crises aléatoires (~tous les 80-140 jours)
    if (s.day % Math.floor(80+Math.random()*60) === 0) triggerCrisis();
    // Sauvegarde auto
    if (s.day % 30 === 0) save();

    // Élections
    if (s.electionDate && s.date >= s.electionDate) handleElection();

    // Score
    s.score = Math.round(s.happiness*0.3 + s.security*0.2 + s.idh*100*0.25 + s.prestige*0.15 + Math.log10(Math.max(1,s.treasury))*4);

    // Game over
    if (s.treasury < -80000) bankruptcy();
    if (s.happiness < 8) revolution();

    UI.refresh();
  }

  function clamp(v){ return Math.max(0, Math.min(100, v)); }

  function happinessTarget() {
    const s = S;
    let h = 48;
    h += (s.literacy-70)*0.15;
    h += (s.security-50)*0.18;
    h -= s.inflation*0.5;
    h += (s.electrRate-50)*0.08;
    h += (s.idh-0.5)*25;
    h -= s.unemployment*0.3;
    h += (s.prestige-40)*0.1;
    h -= s.taxRate>35 ? (s.taxRate-35)*0.25 : 0;
    h += s.stadiums.filter(st=>st.built).length*0.5;
    return Math.max(5, Math.min(95, h));
  }
  function securityTarget() {
    const s = S;
    let sec = 45;
    sec += (s.defBudget/s.gdp*1000)*0.4;
    sec += (totalArmyPower()/5000);
    sec -= s.wars.length*8;
    sec += (s.happiness-40)*0.1;
    const conflictCities = s.cities.filter(c=>c.conflict).length;
    sec -= conflictCities*2;
    return Math.max(5, Math.min(95, sec));
  }
  function totalArmyPower(){ return ARMY_UNITS.reduce((a,u)=>a+(S.army[u.id]||0)*u.power,0); }

  function applyInfra(p) {
    const e = p.effect||{};
    if (e.electrRate) S.electrRate = Math.min(100, S.electrRate+e.electrRate);
    if (e.energyCap) S.energyCap += e.energyCap;
    if (e.roadKm) S.roadKm += e.roadKm;
    if (e.airports) S.airports += e.airports;
    if (e.healthRank) S.healthRank = Math.max(1, S.healthRank+e.healthRank);
    if (e.literacy) S.literacy = Math.min(100, S.literacy+e.literacy);
    if (e.idh) S.idh = Math.min(1, S.idh+e.idh);
    S.dailyIncome += (p.income||0)/365;
    recalc();
  }

  function updateCities() {
    S.cities.forEach(c => {
      c.employment = clamp(c.employment + (100-S.unemployment-c.employment)*0.05);
      c.happiness = clamp(c.happiness + (S.happiness-c.happiness)*0.06 + (c.conflict?-0.3:0));
      c.infra = clamp(c.infra + (S.electrRate-c.infra)*0.02);
    });
  }

  /* ───────── ENTREPRISES ───────── */
  function createCompany(typeId, name, investment) {
    const t = COMPANY_TYPES.find(x=>x.id===typeId);
    if (!t) return false;
    investment = Math.max(t.minInvest, investment);
    if (S.treasury < investment) { UI.toast('Fonds insuffisants !','error'); return false; }
    S.treasury -= investment;
    const jobs = Math.round(investment * t.jobsPerM);
    const company = {
      id:'c'+Date.now(), name, type:typeId, typeName:t.name, emoji:t.emoji,
      investment, jobs, active:true,
      dailyRevenue: investment * t.revPerM / 365 * (0.8+Math.random()*0.4),
      founded: fmtDate(S.date)
    };
    S.companies.push(company);
    S.gdp += investment*1.5;
    recalc();
    UI.toast(`🏢 ${name} créée ! ${jobs.toLocaleString('fr-FR')} emplois`,'success');
    return true;
  }
  function closeCompany(id) {
    const c = S.companies.find(x=>x.id===id);
    if (!c) return;
    c.active = false;
    S.happiness = clamp(S.happiness - Math.min(8, c.jobs/S.population/1e4));
    S.unemployment += Math.min(5, c.jobs/S.population/1e4);
    UI.toast(`📉 ${c.name} fermée. ${c.jobs.toLocaleString('fr-FR')} emplois perdus !`,'error');
    recalc();
  }

  /* ───────── COMMERCE INTERNATIONAL ───────── */
  function signTradeContract(resourceId, partnerId, volume, years) {
    const R = S.resources[resourceId];
    const partner = TRADE_PARTNERS.find(p=>p.id===partnerId);
    if (!R || !partner) return false;
    const def = RESOURCES[resourceId];
    const price = R.price * partner.priceMod;
    const dailyRevenue = (volume * price) / 365 / 1e6; // M$/jour
    S.tradeContracts.push({
      id:'t'+Date.now(), resource:resourceId, resourceName:def.name, emoji:def.emoji,
      partner:partnerId, partnerName:partner.name, partnerFlag:partner.flag,
      volume, years, yearsLeft:years, price, dailyRevenue,
      signed: fmtDate(S.date)
    });
    const emb = S.embassies.find(e=>e.id===partnerId);
    if (emb) emb.relation = Math.min(100, emb.relation+5);
    recalc();
    UI.toast(`📦 Contrat signé avec ${partner.name} : +$${dailyRevenue.toFixed(1)}M/jour`,'success');
    return true;
  }

  /* ───────── AMBASSADES ───────── */
  function setVisa(embId, level) {
    const e = S.embassies.find(x=>x.id===embId);
    if (!e) return;
    e.visaLevel = level;
    const v = VISA_LEVELS[level];
    e.relation = Math.max(0, Math.min(100, e.relation + v.relationMod));
    recomputeImmigration();
    UI.toast(`${v.emoji} Visa ${v.label} pour ${e.name}`, level==='closed'?'error':'info');
  }
  function recomputeImmigration() {
    S.immigration = S.embassies.reduce((a,e)=>{
      const v = VISA_LEVELS[e.visaLevel]; return a + v.immigrationMod * (e.relation/100);
    }, 0);
  }
  function embassyAction(embId, action) {
    const e = S.embassies.find(x=>x.id===embId);
    if (!e) return;
    if (action==='trade') {
      if (S.treasury<30){UI.toast('Fonds insuffisants','error');return;}
      S.treasury-=30; e.tradeDeal=true; e.relation=Math.min(100,e.relation+8);
      S.dailyIncome+=6; UI.toast(`🤝 Accord commercial avec ${e.name}`,'success');
    } else if (action==='aid') {
      // demande d'aide financière
      const amount = Math.round(e.relation*3);
      if (e.relation<40){ UI.toast(`${e.name} refuse l'aide (relation trop faible)`,'error'); return; }
      S.treasury+=amount; e.relation=Math.max(0,e.relation-10);
      UI.toast(`💰 Aide reçue de ${e.name} : +$${amount}M`,'success');
    } else if (action==='military') {
      if (S.treasury<100){UI.toast('Fonds insuffisants','error');return;}
      S.treasury-=100; e.militaryCoop=true; e.relation=Math.min(100,e.relation+6);
      S.security=clamp(S.security+4); UI.toast(`🛡️ Coopération militaire avec ${e.name}`,'success');
    }
    recalc();
  }

  /* ───────── ARMÉE ───────── */
  function buyArmy(unitId, qty) {
    const u = ARMY_UNITS.find(x=>x.id===unitId);
    if (!u) return;
    const cost = u.cost*qty;
    if (S.treasury<cost){UI.toast('Fonds insuffisants','error');return;}
    S.treasury-=cost; S.army[unitId]=(S.army[unitId]||0)+qty;
    S.security=clamp(S.security + (u.power*qty)/8000);
    recalc();
    UI.toast(`${u.emoji} +${qty.toLocaleString('fr-FR')} ${u.name}`,'success');
  }
  function setDefBudget(v){ S.defBudget=v; recalc(); UI.refresh(); }
  function setTax(key,v){ S[key]=v; recalc(); UI.refresh(); }

  /* ───────── SPORTS & STADES ───────── */
  function buildStadium(id) {
    const st = S.stadiums.find(x=>x.id===id);
    if (!st || st.built || st.building) return;
    if (S.treasury<st.cost){UI.toast('Fonds insuffisants','error');return;}
    S.treasury-=st.cost; st.building=true; st.progress=0;
    UI.toast(`🏗️ Construction: ${st.name}`,'info'); recalc();
  }
  function fundSport(id, amount) {
    const sp = S.sports.find(x=>x.id===id);
    if (!sp) return;
    if (S.treasury<amount){UI.toast('Fonds insuffisants','error');return;}
    S.treasury-=amount; sp.budget+=amount; sp.level=Math.min(99, sp.level+amount/30);
    UI.toast(`${sp.emoji} ${sp.name} financé (+niveau)`,'success'); recalc();
  }
  function hostSportEvent(id) {
    const e = SPORT_EVENTS.find(x=>x.id===id);
    if (!e) return;
    if (S.treasury<e.cost){UI.toast('Fonds insuffisants','error');return;}
    S.treasury-=e.cost;
    S.happiness=clamp(S.happiness+e.happiness);
    S.tourism+=e.tourism; S.prestige=Math.min(100,S.prestige+e.prestige);
    S.activeSportEvents.push({ id:e.id, name:e.name, emoji:e.emoji, daysLeft:e.duration });
    UI.toast(`${e.emoji} ${e.name} lancé ! Bonheur +${e.happiness}, Prestige +${e.prestige}`,'success');
    recalc();
  }

  /* ───────── INFRASTRUCTURES ───────── */
  function buildInfra(id) {
    const i = S.infra.find(x=>x.id===id);
    const p = INFRA_PROJECTS.find(x=>x.id===id);
    if (!i || !p || i.built || i.building) return;
    if (S.treasury<p.cost){UI.toast('Fonds insuffisants','error');return;}
    S.treasury-=p.cost; i.building=true; i.progress=0;
    UI.toast(`🏗️ ${p.name} lancé (${p.days} jours)`,'info'); recalc();
  }

  /* ───────── RESSOURCES (vente directe marché) ───────── */
  function sellResource(r, units) {
    const R = S.resources[r];
    if (!R) return;
    if (R.stock < units) { UI.toast('Stock insuffisant','error'); return; }
    const revenue = units*R.price/1e6;
    S.treasury+=revenue; R.stock-=units;
    UI.toast(`💰 Vendu ${units.toLocaleString('fr-FR')} ${RESOURCES[r].unit} : +$${revenue.toFixed(1)}M`,'success');
  }
  function investResource(r, amount) {
    const R = S.resources[r];
    if (!R) return;
    if (S.treasury<amount){UI.toast('Fonds insuffisants','error');return;}
    S.treasury-=amount; R.production*=1.08; R.reserves*=1.02;
    UI.toast(`⛏️ Production de ${RESOURCES[r].name} +8%`,'success'); recalc();
  }

  /* ───────── DIPLOMATIE / GUERRE ───────── */
  function diplo(nationId, action) {
    const n = S.nations.find(x=>x.id===nationId);
    if (!n) return;
    if (action==='ally'){ if(S.treasury<50){UI.toast('Fonds insuffisants','error');return;} S.treasury-=50; n.relation='ally'; UI.toast(`🤝 Alliance avec ${n.name}`,'success'); }
    else if (action==='trade'){ if(S.treasury<20){UI.toast('Fonds insuffisants','error');return;} S.treasury-=20; S.dailyIncome+=5; UI.toast(`📦 Commerce avec ${n.name}`,'success'); }
    else if (action==='war'){ n.relation='hostile'; S.wars.push(nationId); S.treasury-=200; S.security=clamp(S.security-5); UI.toast(`⚔️ Guerre déclarée à ${n.name} !`,'error'); }
    else if (action==='peace'){ n.relation='neutral'; S.wars=S.wars.filter(w=>w!==nationId); S.treasury-=100; UI.toast(`🕊️ Paix avec ${n.name}`,'success'); }
    recalc();
  }

  /* ───────── ONU ───────── */
  function unVote(resId, choice) {
    const r = UN_RESOLUTIONS.find(x=>x.id===resId);
    if (!r || S.unResolutionsVoted.includes(resId)) return;
    const eff = choice==='yes' ? r.yes : r.no;
    if (eff.treasury) S.treasury+=eff.treasury;
    if (eff.happiness) S.happiness=clamp(S.happiness+eff.happiness);
    if (eff.security) S.security=clamp(S.security+eff.security);
    if (eff.relation) { S.embassies.forEach(e=>{ e.relation=Math.max(0,Math.min(100,e.relation+eff.relation)); }); S.prestige=Math.min(100,S.prestige+(eff.relation>0?3:-2)); }
    S.unResolutionsVoted.push(resId);
    UI.toast(`🇺🇳 Vote enregistré: ${choice==='yes'?'POUR':'CONTRE'}`,'info');
    recalc();
  }

  /* ───────── CRISES & ÉVÉNEMENTS ───────── */
  function triggerCrisis() {
    const c = CRISES[Math.floor(Math.random()*CRISES.length)];
    paused = true;
    UI.showEvent(c);
  }
  function resolveEvent(ev, idx) {
    applyEffect(ev.choices[idx].effect);
    paused = false;
    UI.hideEvent();
    UI.refresh();
  }
  function applyEffect(e) {
    if (!e) return;
    if (e.treasury) S.treasury+=e.treasury;
    if (e.happiness) S.happiness=clamp(S.happiness+e.happiness);
    if (e.security) S.security=clamp(S.security+e.security);
    if (e.gdpGrowth) S.gdpGrowth+=e.gdpGrowth;
    if (e.idh) S.idh=Math.min(1,S.idh+e.idh);
    recalc();
  }

  /* ───────── CABINET ───────── */
  function scheduleCabinet() {
    if (S.pendingCabinetIdx >= CABINET_EVENTS.length) S.pendingCabinetIdx = 0;
    const tpl = CABINET_EVENTS[S.pendingCabinetIdx++];
    const msg = JSON.parse(JSON.stringify(tpl));
    msg.text = msg.text.replace('{inf}', S.inflation.toFixed(1));
    msg.date = fmtDate(S.date); msg.resolved = false;
    S.cabinetMessages.unshift(msg);
    UI.badge('cabinet', S.cabinetMessages.filter(m=>!m.resolved).length);
  }
  function resolveCabinet(idx, choice) {
    const m = S.cabinetMessages[idx];
    if (!m || m.resolved) return;
    applyEffect(m.choices[choice].effect);
    m.resolved = true;
    UI.badge('cabinet', S.cabinetMessages.filter(x=>!x.resolved).length);
    UI.refresh();
  }

  /* ───────── RÉSEAU SOCIAL ───────── */
  function generateSocialPost() {
    let pool;
    const r = Math.random();
    if (S.happiness > 60) pool = r<0.6 ? SOCIAL_POSTS.positive : r<0.85 ? SOCIAL_POSTS.neutral : SOCIAL_POSTS.negative;
    else if (S.happiness < 35) pool = r<0.6 ? SOCIAL_POSTS.negative : r<0.85 ? SOCIAL_POSTS.neutral : SOCIAL_POSTS.positive;
    else pool = r<0.4 ? SOCIAL_POSTS.neutral : r<0.7 ? SOCIAL_POSTS.positive : SOCIAL_POSTS.negative;
    const post = pool[Math.floor(Math.random()*pool.length)];
    S.socialFeed.unshift({
      ...post, date: fmtDate(S.date),
      likes: Math.floor(Math.random()*9000)+100,
      reposts: Math.floor(Math.random()*2000)
    });
    // Impact popularité
    S.happiness = clamp(S.happiness + post.sentiment*0.15);
    if (S.socialFeed.length>25) S.socialFeed.pop();
  }

  /* ───────── ACTUALITÉS ───────── */
  function generateNews() {
    const l = LOCAL_NEWS[Math.floor(Math.random()*LOCAL_NEWS.length)];
    const w = WORLD_NEWS[Math.floor(Math.random()*WORLD_NEWS.length)];
    const cobalt = S.resources.cobalt ? Math.round(S.resources.cobalt.price) : 33000;
    const fill = t => t
      .replace('{mw}', Math.floor(100+Math.random()*400))
      .replace('{price}', cobalt.toLocaleString('fr-FR'))
      .replace('{cost}', Math.floor(100+Math.random()*900))
      .replace('{n}', Math.floor(10+Math.random()*200))
      .replace('{tons}', Math.floor(5000+Math.random()*20000))
      .replace('{beds}', Math.floor(100+Math.random()*500))
      .replace('{pct}', (1+Math.random()*8).toFixed(1));
    S.newsLocal.unshift({ text:fill(l), date:fmtDate(S.date) });
    S.newsWorld.unshift({ text:fill(w), date:fmtDate(S.date) });
    if (S.newsLocal.length>20) S.newsLocal.pop();
    if (S.newsWorld.length>20) S.newsWorld.pop();
  }

  /* ───────── ÉLECTIONS ───────── */
  function handleElection() {
    const winProb = S.happiness/100 * (0.7 + S.prestige/300);
    S.electionDate = new Date(S.date.getFullYear()+S.electionTerm, 10, 15);
    paused = true;
    if (Math.random() < winProb) {
      S.mandat++;
      UI.showEvent({ icon:'🏆', title:'VICTOIRE ÉLECTORALE !',
        desc:`Réélu pour un ${S.mandat}ᵉ mandat avec ${Math.floor(45+S.happiness*0.4)}% des voix ! Le peuple vous renouvelle sa confiance.`,
        choices:[{ label:'✅ Continuer', effect:{happiness:5, prestige:8} }] });
    } else {
      UI.showEvent({ icon:'❌', title:'DÉFAITE ÉLECTORALE',
        desc:`Vous perdez avec ${Math.floor(35+(100-S.happiness)*0.3)}% contre vous. Votre mandat prend fin.`,
        choices:[{ label:'Accepter le verdict', effect:{} }] });
      S.gameOver = true; stopTicker();
    }
  }

  function bankruptcy() {
    S.gameOver=true; stopTicker(); paused=true;
    UI.showEvent({ icon:'💸', title:'FAILLITE NATIONALE',
      desc:'Le trésor est épuisé. L\'État ne peut plus payer ses fonctionnaires. C\'est la fin de votre gouvernement.',
      choices:[{ label:'😞 Recommencer', effect:{} }] });
  }
  function revolution() {
    S.gameOver=true; stopTicker(); paused=true;
    UI.showEvent({ icon:'🔥', title:'RÉVOLUTION',
      desc:'Le peuple en colère envahit le palais présidentiel. Vous êtes renversé par une révolution populaire.',
      choices:[{ label:'😞 Recommencer', effect:{} }] });
  }

  /* ───────── SAUVEGARDE ───────── */
  function save() {
    try { localStorage.setItem('hpl_v2', JSON.stringify({ ...S, date:S.date.toISOString(), electionDate:S.electionDate?S.electionDate.toISOString():null })); } catch(e){}
  }
  function load() {
    try {
      const raw = localStorage.getItem('hpl_v2'); if (!raw) return false;
      const d = JSON.parse(raw);
      d.date = new Date(d.date);
      d.electionDate = d.electionDate ? new Date(d.electionDate) : null;
      S = d; recalc(); return true;
    } catch(e){ return false; }
  }
  function hasSave(){ try { return !!localStorage.getItem('hpl_v2'); } catch(e){ return false; } }

  /* ───────── TICKER / SPEED ───────── */
  function startTicker(){ if(ticker)clearInterval(ticker); ticker=setInterval(tick, DAY_MS/speed); }
  function stopTicker(){ if(ticker){clearInterval(ticker);ticker=null;} }
  function setSpeed(s){ speed=s; if(s===0){paused=true;stopTicker();} else {paused=false;startTicker();} }

  /* ───────── FORMATTAGE ───────── */
  function fmtDate(d){ return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`; }
  function fmtDateLong(d){ return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`; }
  function fmtMoney(n){
    const a=Math.abs(n), s=n<0?'-':'';
    if(a>=1e6) return `${s}$${(a/1e6).toFixed(1)}T`;
    if(a>=1e3) return `${s}$${(a/1e3).toFixed(1)}B`;
    return `${s}$${a.toFixed(0)}M`;
  }

  return {
    init, startTicker, stopTicker, setSpeed,
    createCompany, closeCompany,
    signTradeContract, setVisa, embassyAction,
    buyArmy, setDefBudget, setTax,
    buildStadium, fundSport, hostSportEvent,
    buildInfra, sellResource, investResource,
    diplo, unVote, resolveEvent, resolveCabinet,
    save, load, hasSave,
    fmtDate, fmtDateLong, fmtMoney, totalArmyPower,
    get:()=>S
  };
})();
