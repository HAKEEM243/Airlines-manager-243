'use strict';

const UI = (() => {

  /* ── helpers ── */
  const $ = id => document.getElementById(id);
  const qs = sel => document.querySelector(sel);

  function fmt(n) { return Engine.formatMoney(n); }
  function fmtDate(d) { return Engine.formatDate(d); }

  function stars(n) {
    return '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n));
  }

  function rankColor(r) {
    if (r <= 30) return 'rank-good';
    if (r <= 70) return 'rank-mid';
    return 'rank-bad';
  }

  /* ── Splash ── */
  function runSplash() {
    let pct = 0;
    const fill = $('loadFill');
    const pctEl = $('loadPct');
    const iv = setInterval(() => {
      pct += Math.random() * 12 + 3;
      if (pct >= 100) { pct = 100; clearInterval(iv); setTimeout(showSetup, 400); }
      fill.style.width = pct + '%';
      pctEl.textContent = Math.floor(pct) + '%';
    }, 120);
  }

  function showSetup() {
    $('splash').classList.add('hidden');
    $('setup').classList.remove('hidden');
    renderCountryGrid();
    bindSetup();
  }

  /* ── Setup ── */
  let selectedCountry = 'rdc';
  let selectedDiff = 'normal';

  function renderCountryGrid() {
    const grid = $('countryGrid');
    grid.innerHTML = COUNTRIES.map(c => `
      <div class="country-card ${c.featured ? 'featured' : ''} ${c.id === selectedCountry ? 'selected' : ''}"
           data-id="${c.id}">
        <div class="cc-flag">${c.flag}</div>
        <div class="cc-info">
          <div class="cc-name">${c.name}</div>
          <div class="cc-gdp">PIB: ${fmt(c.gdp)}</div>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.country-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedCountry = card.dataset.id;
        grid.querySelectorAll('.country-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
  }

  function bindSetup() {
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDiff = btn.dataset.diff;
      });
    });

    $('btnStart').addEventListener('click', () => {
      const name = ($('presName').value || 'Le Président').trim();
      startGame(selectedCountry, name, selectedDiff);
    });

    // Bouton "Continuer" si une sauvegarde existe
    if (Engine.hasSave()) {
      const btn = $('btnContinue');
      btn.classList.remove('hidden');
      btn.addEventListener('click', () => {
        if (Engine.load()) {
          $('setup').classList.add('hidden');
          $('game').classList.remove('hidden');
          bindGame();
          renderAll();
          Engine.startTicker();
          Engine.setSpeed(1);
          setSpeedUI(1);
        }
      });
    }
  }

  /* ── Game Start ── */
  function startGame(countryId, name, diff) {
    $('setup').classList.add('hidden');
    $('game').classList.remove('hidden');
    Engine.init(countryId, name, diff);
    bindGame();
    renderAll();
    Engine.startTicker();
    Engine.setSpeed(1);
    setSpeedUI(1);
  }

  /* ── Speed Controls ── */
  function setSpeedUI(s) {
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    if (s === 0) $('btnPause').classList.add('active');
    else if (s === 1) $('btn1x').classList.add('active');
    else if (s === 2) $('btn2x').classList.add('active');
    else if (s === 5) $('btn5x').classList.add('active');
  }

  /* ── Panel Navigation ── */
  function showPanel(id) {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(p => {
      if (p.id === 'panel-home') {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
        p.classList.add('hidden');
      }
    });
    if (id !== 'home') {
      const target = $(`panel-${id}`);
      if (target) {
        target.classList.remove('hidden');
        setTimeout(() => target.classList.add('active'), 10);
      }
    }
    // Re-render on open
    if (id === 'cabinet') renderCabinet();
    if (id === 'economy') renderEconomy();
    if (id === 'energy') renderEnergy();
    if (id === 'development') renderDevelopment();
    if (id === 'diplomacy') renderDiplomacy();
    if (id === 'defense') renderDefense();
    if (id === 'intelligence') renderIntelligence();
    if (id === 'news') renderNews();
    if (id === 'sports') renderSports();
    if (id === 'resources') renderResourceMarket();
    if (id === 'editor') renderEditor();
    if (id === 'police') renderPolice();
    if (id === 'social') renderSocial();
    if (id === 'population') renderPopulation();
    if (id === 'worldmap') renderWorldMap();
  }

  function bindGame() {
    // App icons
    document.querySelectorAll('.app-icon').forEach(icon => {
      if (icon.dataset.panel) icon.addEventListener('click', () => showPanel(icon.dataset.panel));
    });

    // Save button
    const saveBtn = $('appSave');
    if (saveBtn) saveBtn.addEventListener('click', () => {
      Engine.save();
      notify('💾 Partie sauvegardée !', 'success');
    });

    // Back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', () => showPanel('home'));
    });

    // Home button
    $('homeBtn').addEventListener('click', () => showPanel('home'));

    // Speed buttons
    $('btnPause').addEventListener('click', () => { Engine.setSpeed(0); setSpeedUI(0); });
    $('btn1x').addEventListener('click', () => { Engine.setSpeed(1); setSpeedUI(1); });
    $('btn2x').addEventListener('click', () => { Engine.setSpeed(2); setSpeedUI(2); });
    $('btn5x').addEventListener('click', () => { Engine.setSpeed(5); setSpeedUI(5); });

    // Alert close
    $('alertClose').addEventListener('click', () => $('alertBanner').classList.add('hidden'));

    // Tab switching (delegated)
    document.querySelectorAll('.tabs').forEach(tabBar => {
      tabBar.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const panel = tabBar.closest('.panel');
          panel.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          panel.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
          tab.classList.add('active');
          const target = panel.querySelector(`#${tab.dataset.tab}`);
          if (target) target.classList.remove('hidden');
        });
      });
    });
  }

  /* ── Master Update ── */
  function update() {
    const s = Engine.get();
    if (!s) return;

    // Status bar
    $('sbDate').textContent = fmtDate(s.date);
    $('sbMoney').textContent = `💰 ${fmt(s.treasury)}`;
    $('sbApproval').style.color = s.happiness > 50 ? '#43A047' : s.happiness > 30 ? '#FFD700' : '#C62828';
    $('sbApproval').textContent = `👥 ${s.happiness.toFixed(0)}%`;
    $('sbPop').textContent = `🏙 ${s.population.toFixed(0)}M`;

    // Country header
    $('chCountry').textContent = s.country.name.toUpperCase();
    $('chPresident').textContent = `Président: ${s.presidentName}`;
    $('chFlag').textContent = s.country.flag;
    $('chMandat').textContent = s.mandat;

    // KPI cards
    $('kpiTreasury').textContent = fmt(s.treasury);
    $('kpiTreasury').className = 'kpi-val ' + (s.treasury >= 0 ? 'green' : 'red');
    const netDaily = s.dailyIncome - s.dailyExpenses;
    $('kpiTreasuryDelta').textContent = `${netDaily >= 0 ? '+' : ''}${netDaily.toFixed(0)}M/j`;
    $('kpiGDP').textContent = fmt(s.gdp);
    $('kpiGDPDelta').textContent = `▲ ${s.gdpGrowth.toFixed(1)}%/an`;
    $('kpiHappy').textContent = `${s.happiness.toFixed(0)}%`;
    $('happyBar').style.width = s.happiness + '%';
    $('kpiSec').textContent = `${s.security.toFixed(0)}%`;
    $('secBar').style.width = s.security + '%';

    // Ticker
    updateTicker(s);

    // Alert if happiness critical
    if (s.happiness < 25) {
      $('alertBanner').classList.remove('hidden');
      $('alertText').textContent = `⚠️ Alerte : Taux d'approbation critique (${s.happiness.toFixed(0)}%) — Risque de manifestations !`;
    }
  }

  function updateTicker(s) {
    const items = [
      `💰 Trésor: ${fmt(s.treasury)}`,
      `📈 PIB: ${fmt(s.gdp)}`,
      `😊 Bonheur: ${s.happiness.toFixed(0)}%`,
      `🔒 Sécurité: ${s.security.toFixed(0)}%`,
      `⚡ Énergie: ${s.energyCap.toLocaleString()} MW`,
      ...(s.newsLocal[0] ? [`📰 ${s.newsLocal[0].text.substring(0, 80)}...`] : []),
      ...(s.wars.length ? [`⚔️ En guerre contre: ${s.wars.join(', ')}`] : []),
      `📅 Élections dans ${s.daysToElection} jours`
    ];
    $('ticker').textContent = items.join('   ·   ');
  }

  /* ── Cabinet ── */
  function renderCabinet() {
    const s = Engine.get();
    const body = $('cabinetBody');
    const active = s.cabinetMessages.filter(m => !m.resolved);
    const resolved = s.cabinetMessages.filter(m => m.resolved);

    if (!active.length && !resolved.length) {
      body.innerHTML = '<div class="empty-msg">Aucun message urgent pour l\'instant.</div>';
      return;
    }

    body.innerHTML = active.map((msg, i) => `
      <div class="cabinet-msg">
        <div class="cm-from">${msg.from}</div>
        <div class="cm-text">${msg.text}</div>
        <div class="cm-choices">
          ${msg.choices.map((c, ci) => `
            <button class="cm-choice ${ci === 0 ? 'yes' : ci === 1 ? 'no' : 'mid'}"
              onclick="UI.cabinetChoice(${s.cabinetMessages.indexOf(msg)}, ${ci})">
              ${c.label}
            </button>
          `).join('')}
        </div>
        <div class="cm-timestamp">📅 ${msg.date}</div>
      </div>
    `).join('') + (resolved.length ? `<div class="panel-header" style="position:static;margin-top:8px;"><h3 style="font-size:11px">RÉSOLUS (${resolved.length})</h3></div>` + resolved.slice(0,3).map(msg => `
      <div class="cabinet-msg" style="opacity:0.5">
        <div class="cm-from">${msg.from} ✅</div>
        <div class="cm-text">${msg.text}</div>
        <div class="cm-timestamp">${msg.date}</div>
      </div>
    `).join('') : '');
  }

  function cabinetChoice(msgIdx, choiceIdx) {
    Engine.resolveCabinet(msgIdx, choiceIdx);
  }

  /* ── Economy ── */
  function renderEconomy() {
    const s = Engine.get();

    // Overview
    $('ecoStats').innerHTML = [
      ['PIB', fmt(s.gdp)],
      ['Croissance', `${s.gdpGrowth.toFixed(1)}%`],
      ['Trésor', fmt(s.treasury)],
      ['Inflation', `${s.inflation.toFixed(1)}%`],
      ['Chômage', `${s.unemployment.toFixed(1)}%`],
      ['Revenu/jour', `+${s.dailyIncome.toFixed(0)}M`],
      ['Dépenses/jour', `-${s.dailyExpenses.toFixed(0)}M`],
      ['IDH', s.idh.toFixed(3)]
    ].map(([label, val]) => `
      <div class="stat-card">
        <div class="stat-card-label">${label}</div>
        <div class="stat-card-val">${val}</div>
      </div>
    `).join('');

    // Taxes
    $('taxSliders').innerHTML = `
      <div class="slider-row">
        <div class="slider-label"><span>🏛️ Impôt sur le revenu</span><span class="slider-val" id="sv-tax">${s.taxRate}%</span></div>
        <input type="range" min="5" max="60" value="${s.taxRate}" oninput="document.getElementById('sv-tax').textContent=this.value+'%'; Engine.setTax('taxRate',+this.value)">
      </div>
      <div class="slider-row">
        <div class="slider-label"><span>🏢 Impôt sociétés</span><span class="slider-val" id="sv-corp">${s.corpTax}%</span></div>
        <input type="range" min="5" max="60" value="${s.corpTax}" oninput="document.getElementById('sv-corp').textContent=this.value+'%'; Engine.setTax('corpTax',+this.value)">
      </div>
      <div class="slider-row">
        <div class="slider-label"><span>🛒 TVA</span><span class="slider-val" id="sv-vat">${s.vatRate}%</span></div>
        <input type="range" min="0" max="30" value="${s.vatRate}" oninput="document.getElementById('sv-vat').textContent=this.value+'%'; Engine.setTax('vatRate',+this.value)">
      </div>
      <div class="stat-row" style="margin-top:12px">
        <span>Revenu fiscal/jour</span>
        <span>${s.dailyIncome.toFixed(0)}M</span>
      </div>
      <div class="stat-row">
        <span>Impact bonheur</span>
        <span style="color:${s.taxRate > 35 ? '#C62828' : '#43A047'}">${s.taxRate > 35 ? '⬇️ Charge élevée' : '✅ Modéré'}</span>
      </div>
    `;

    renderResources();
    renderTrade();
  }

  function renderResources() {
    const s = Engine.get();
    const el = $('resourceCards');
    if (!el) return;
    const myRes = Object.keys(s.resourcePrices);
    if (!myRes.length) {
      el.innerHTML = '<div class="empty-msg">Aucune ressource extractible.</div>'; return;
    }
    el.innerHTML = myRes.map(r => {
      const res = RESOURCES[r];
      if (!res) return '';
      const price = s.resourcePrices[r];
      const change = ((price - res.basePrice) / res.basePrice * 100).toFixed(1);
      const up = price >= res.basePrice;
      return `
        <div class="resource-card">
          <div class="rc-icon">${res.emoji}</div>
          <div class="rc-info">
            <div class="rc-name">${res.name}</div>
            <div class="rc-price">$${price.toLocaleString()} /${res.unit}</div>
            <div class="rc-stock">Stock: ${(s.resourceStocks[r] || 0).toLocaleString()} ${res.unit}s</div>
          </div>
          <div class="rc-trend ${up ? 'up' : 'down'}">${up ? '↑' : '↓'}${Math.abs(change)}%</div>
          <div class="rc-actions">
            <button class="btn-sm btn-sell" onclick="Engine.sellResource('${r}', 1000)">Vendre 1K</button>
            <button class="btn-sm btn-invest" onclick="Engine.investResource('${r}', 100)">Invest $100M</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderTrade() {
    const s = Engine.get();
    const el = $('tradePanel');
    if (!el) return;
    el.innerHTML = `
      <div class="stat-row"><span>Exportations/an</span><span>${fmt(s.gdp * 0.2)}</span></div>
      <div class="stat-row"><span>Importations/an</span><span>${fmt(s.gdp * 0.18)}</span></div>
      <div class="stat-row"><span>Balance commerciale</span><span class="text-green">+${fmt(s.gdp * 0.02)}</span></div>
      <div style="margin-top:12px">
        ${s.nations.filter(n => n.relation === 'ally').map(n => `
          <div class="stat-row"><span>${n.flag} ${n.name}</span><span class="text-green">Partenaire ✅</span></div>
        `).join('')}
      </div>
    `;
  }

  /* ── Energy ── */
  function renderEnergy() {
    const s = Engine.get();
    $('energyCap').textContent = `${s.energyCap.toLocaleString()} MW`;
    $('electrRate').textContent = `${s.electrRate.toFixed(0)}%`;
    $('hydroPct').textContent = `${s.hydroPct.toFixed(0)}%`;

    $('energyProjects').innerHTML = s.infrastructure.energy.map(b => `
      <div class="build-card ${b.built ? 'built' : b.building ? 'building' : ''}">
        <div class="bc-emoji">${b.emoji}</div>
        <div class="bc-name">${b.name}</div>
        <div class="bc-cost">💰 $${b.cost}M</div>
        <div class="bc-effect">${b.effect}</div>
        <div class="bc-status">${
          b.built ? '✅ Opérationnel' :
          b.building ? `🏗️ ${b.progress}/${b.days} jours` :
          `⏳ ${b.days} jours`
        }</div>
        ${!b.built && !b.building ? `<button class="btn-sm btn-invest" style="margin-top:6px" onclick="Engine.buildInfra('energy','${b.id}')">Construire</button>` : ''}
      </div>
    `).join('');

    $('roadKm').textContent = `${s.roadKm.toLocaleString()} km`;
    $('airports').textContent = s.airports;

    $('roadProjects').innerHTML = s.infrastructure.road.map(b => `
      <div class="build-card ${b.built ? 'built' : b.building ? 'building' : ''}">
        <div class="bc-emoji">${b.emoji}</div>
        <div class="bc-name">${b.name}</div>
        <div class="bc-cost">💰 $${b.cost}M</div>
        <div class="bc-effect">${b.effect}</div>
        <div class="bc-status">${
          b.built ? '✅ Opérationnel' :
          b.building ? `🏗️ ${b.progress}/${b.days} jours` :
          `⏳ ${b.days} jours`
        }</div>
        ${!b.built && !b.building ? `<button class="btn-sm btn-invest" style="margin-top:6px" onclick="Engine.buildInfra('road','${b.id}')">Construire</button>` : ''}
      </div>
    `).join('');

    renderNetworks();

    $('infraBuild').innerHTML = `
      <div class="stat-row"><span>⚡ Capacité totale</span><span>${s.energyCap.toLocaleString()} MW</span></div>
      <div class="stat-row"><span>🔌 Taux électrification</span><span>${s.electrRate.toFixed(0)}%</span></div>
      <div class="stat-row"><span>🛣️ Réseau routier</span><span>${s.roadKm.toLocaleString()} km</span></div>
      <div class="stat-row"><span>✈️ Aéroports</span><span>${s.airports}</span></div>
    `;
  }

  /* ── Development ── */
  function renderDevelopment() {
    const s = Engine.get();
    $('literacy').textContent = `${s.literacy.toFixed(0)}%`;
    $('idh').textContent = s.idh.toFixed(3);
    $('lifeExp').textContent = `${s.lifeExp.toFixed(0)} ans`;
    $('healthRank').textContent = `${s.healthRank}ème mondial`;

    $('healthBuild').innerHTML = HEALTH_BUILDINGS.map(b => {
      const builtCount = s.healthBuilt.filter(x => x.id === b.id).length;
      return `
        <div class="build-card">
          <div class="bc-emoji">${b.emoji}</div>
          <div class="bc-name">${b.name}</div>
          <div class="bc-cost">💰 -$${b.cost}M</div>
          <div class="bc-effect">${b.effect}</div>
          <div class="bc-status">Construit: ${builtCount}x</div>
          <button class="btn-sm btn-invest" style="margin-top:6px" onclick="Engine.buildHealth('${b.id}')">Construire</button>
        </div>
      `;
    }).join('');

    $('eduBuild').innerHTML = EDU_BUILDINGS.map(b => {
      const builtCount = s.eduBuilt.filter(x => x.id === b.id).length;
      return `
        <div class="build-card">
          <div class="bc-emoji">${b.emoji}</div>
          <div class="bc-name">${b.name}</div>
          <div class="bc-cost">💰 -$${b.cost}M</div>
          <div class="bc-effect">${b.effect}</div>
          <div class="bc-status">Construit: ${builtCount}x</div>
          <button class="btn-sm btn-invest" style="margin-top:6px" onclick="Engine.buildEdu('${b.id}')">Construire</button>
        </div>
      `;
    }).join('');
  }

  /* ── Diplomacy ── */
  function renderDiplomacy() {
    const s = Engine.get();
    $('nationsList').innerHTML = s.nations.map(n => `
      <div class="nation-card">
        <div class="nc-flag">${n.flag}</div>
        <div class="nc-info">
          <div class="nc-name">${n.name}
            ${s.wars.includes(n.id) ? '<span class="war-badge">⚔️ GUERRE</span>' : ''}
            ${n.relation === 'ally' && !s.wars.includes(n.id) ? '<span class="ally-badge">🤝 ALLIÉ</span>' : ''}
          </div>
          <div class="nc-rel ${n.relation}">
            ${n.relation === 'ally' ? '🟢 Allié' : n.relation === 'hostile' ? '🔴 Hostile' : '⚪ Neutre'}
            · PIB: ${fmt(n.gdp)} · Armée: ${n.army}/100
          </div>
        </div>
        <div class="nc-actions">
          ${n.relation !== 'ally' && !s.wars.includes(n.id) ? `<button class="btn-diplo" onclick="Engine.diplo('${n.id}','ally')">🤝 Alliance</button>` : ''}
          ${!s.wars.includes(n.id) ? `<button class="btn-diplo" onclick="Engine.diplo('${n.id}','trade')">📦 Commerce</button>` : ''}
          ${s.wars.includes(n.id) ? `<button class="btn-diplo" onclick="Engine.diplo('${n.id}','peace')">🕊️ Paix</button>` :
            n.relation !== 'ally' ? `<button class="btn-diplo btn-war" onclick="if(confirm('Déclarer la guerre à ${n.name} ?')) Engine.diplo('${n.id}','war')">⚔️ Guerre</button>` : ''
          }
        </div>
      </div>
    `).join('');

    $('alliancesList').innerHTML = `
      <div class="stat-row"><span>🤝 Alliés</span><span>${s.nations.filter(n=>n.relation==='ally').length}</span></div>
      <div class="stat-row"><span>⚔️ Conflits actifs</span><span class="${s.wars.length ? 'text-red' : 'text-green'}">${s.wars.length}</span></div>
      <div class="stat-row"><span>⚪ Relations neutres</span><span>${s.nations.filter(n=>n.relation==='neutral').length}</span></div>
      ${s.nations.filter(n=>n.relation==='ally').map(n=>`
        <div class="nation-card" style="margin-top:8px">
          <div class="nc-flag">${n.flag}</div>
          <div class="nc-info"><div class="nc-name">${n.name} <span class="ally-badge">ALLIÉ</span></div>
          <div class="nc-rel ally">PIB combiné: ${fmt(n.gdp)}</div></div>
        </div>
      `).join('')}
    `;

    $('tradeAgreements').innerHTML = `
      <div class="stat-row"><span>📦 Accords actifs</span><span>${s.nations.filter(n=>n.relation==='ally').length * 2}</span></div>
      <div class="stat-row"><span>💰 Revenus commerciaux/an</span><span class="text-green">${fmt(s.dailyIncome * 30)}</span></div>
      <p style="color:var(--text-dim);font-size:12px;padding:12px">Signez des alliances pour débloquer des accords commerciaux préférentiels.</p>
    `;
  }

  /* ── Defense ── */
  function renderDefense() {
    const s = Engine.get();
    $('defBudget').innerHTML = `
      <div class="budget-card">
        <div class="budget-title">⚔️ Budget Militaire</div>
        <div class="slider-row">
          <div class="slider-label"><span>Budget annuel</span><span class="slider-val" id="sv-def">$${s.defBudget}M</span></div>
          <input type="range" min="100" max="${Math.floor(s.gdp * 0.1)}" value="${s.defBudget}"
            oninput="document.getElementById('sv-def').textContent='$'+this.value+'M'; Engine.setDefBudget(+this.value)">
        </div>
        <div class="stat-row"><span>% du PIB</span><span>${(s.defBudget / s.gdp * 100).toFixed(2)}%</span></div>
        <div class="stat-row"><span>Impact sécurité</span><span class="text-green">+${(s.defBudget / 1000).toFixed(1)} pts</span></div>
      </div>
      <div class="budget-card">
        <div class="budget-title">🕵️ Budget Renseignement</div>
        <div class="stat-row"><span>Budget annuel</span><span>${fmt(s.intelBudget)}</span></div>
        <button class="btn-sm btn-invest" style="margin-top:8px" onclick="if(Engine.get().treasury > 50) { Engine.get().intelBudget += 50; Engine.get().treasury -= 50; UI.renderDefense(); }">+ $50M Renforcer</button>
      </div>
    `;

    $('defArmy').innerHTML = `
      <div class="stat-row"><span>👨‍✈️ Effectifs FARDC</span><span>${Math.floor(134000 + s.defBudget * 10).toLocaleString()}</span></div>
      <div class="stat-row"><span>🚁 Hélicoptères</span><span>${Math.floor(s.defBudget / 150)}</span></div>
      <div class="stat-row"><span>🛡️ Blindés</span><span>${Math.floor(s.defBudget / 80)}</span></div>
      <div class="stat-row"><span>🔒 Niveau cyberdéfense</span><span>${s.intelBudget > 200 ? '🟢 Élevé' : s.intelBudget > 100 ? '🟡 Moyen' : '🔴 Faible'}</span></div>
      <div class="stat-row"><span>⚡ Niveau alerte</span><span>${s.wars.length ? '🔴 GUERRE' : s.security < 40 ? '🟡 ÉLEVÉ' : '🟢 NORMAL'}</span></div>
    `;

    $('defWar').innerHTML = s.wars.length ? s.wars.map(wId => {
      const n = s.nations.find(x => x.id === wId);
      return `
        <div class="nation-card">
          <div class="nc-flag">${n?.flag || '🏳️'}</div>
          <div class="nc-info">
            <div class="nc-name">${n?.name || wId} <span class="war-badge">EN GUERRE</span></div>
            <div class="nc-rel hostile">Conflit actif — Coût: $${(s.defBudget * 0.3).toFixed(0)}M/an</div>
          </div>
          <button class="btn-diplo" onclick="Engine.diplo('${wId}','peace')">🕊️ Négocier la paix</button>
        </div>
      `;
    }).join('') : '<div class="empty-msg">✅ Aucun conflit actif.</div>';
  }

  /* ── Intelligence ── */
  function renderIntelligence() {
    const s = Engine.get();
    $('intelBody').innerHTML = `
      <div style="padding:12px">
        <div class="stat-row"><span>🕵️ Agents actifs</span><span>${Math.floor(s.intelBudget / 5)}</span></div>
        <div class="stat-row"><span>🌍 Opérations à l'étranger</span><span>${Math.floor(s.intelBudget / 20)}</span></div>
        <div class="stat-row"><span>💻 Cyberdéfense</span><span>${s.intelBudget > 150 ? '🟢 Haute' : '🟡 Moyenne'}</span></div>
        <div class="stat-row"><span>📡 Capacité SIGINT</span><span>${s.intelBudget > 200 ? '🟢 Active' : '🔴 Limitée'}</span></div>
        <div style="margin-top:12px; padding:12px; background:var(--surface2); border-radius:10px; border:1px solid var(--border)">
          <div style="font-size:11px;color:var(--gold);margin-bottom:8px;letter-spacing:2px">RAPPORT CONFIDENTIEL</div>
          <div style="font-size:13px;line-height:1.6">
            ${s.nations.filter(n=>n.relation==='hostile' || s.wars.includes(n.id)).map(n=>
              `⚠️ ${n.flag} ${n.name} — Activité militaire anormale détectée à la frontière.`
            ).join('<br>') || '✅ Aucune menace détectée sur le territoire national.'}
          </div>
        </div>
        <button class="btn-sm btn-invest" style="width:100%;margin-top:12px" onclick="if(Engine.get().treasury>100){Engine.get().intelBudget+=100;Engine.get().treasury-=100;UI.renderIntelligence();}">+ $100M Opération Spéciale</button>
      </div>
    `;
  }

  /* ── News ── */
  function renderNews() {
    const s = Engine.get();
    $('newsLocal').innerHTML = s.newsLocal.slice(0, 8).map(n => `
      <div class="news-item">
        ${n.text}
        <div class="news-date">📅 ${n.date}</div>
      </div>
    `).join('') || '<div class="empty-msg">Pas d\'actualités.</div>';

    $('newsWorld').innerHTML = s.newsWorld.slice(0, 8).map(n => `
      <div class="news-item">
        ${n.text}
        <div class="news-date">📅 ${n.date}</div>
      </div>
    `).join('') || '<div class="empty-msg">Pas d\'actualités.</div>';

    setBadge('news', 0);
  }

  /* ── Sports ── */
  function renderSports() {
    const s = Engine.get();
    $('sportsRank').innerHTML = `
      <table class="sports-table">
        <thead><tr><th>Sport</th><th>Rang Mondial</th><th>Niveau</th></tr></thead>
        <tbody>
          ${s.sports.map(sp => `
            <tr>
              <td>${sp.emoji} ${sp.name}</td>
              <td><span class="rank-num ${rankColor(sp.rank)}">${Math.floor(sp.rank)}</span></td>
              <td><span class="stars">${stars(sp.stars)}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    $('sportsManage').innerHTML = s.sports.map((sp, i) => `
      <div class="stat-row" style="flex-direction:column;align-items:flex-start;gap:6px">
        <div style="display:flex;justify-content:space-between;width:100%">
          <span>${sp.emoji} ${sp.name}</span>
          <span class="text-gold">Budget: $${sp.budget}M</span>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn-sm btn-invest" onclick="Engine.investSport(${i}, 50)">+$50M</button>
          <button class="btn-sm btn-invest" onclick="Engine.investSport(${i}, 100)">+$100M</button>
          <button class="btn-sm btn-invest" onclick="Engine.investSport(${i}, 200)">+$200M</button>
        </div>
      </div>
    `).join('');

    $('sportsResults').innerHTML = `
      <div class="stat-row"><span>🥇 Médailles d'or</span><span>${s.sports.filter(sp=>sp.rank<=10).length}</span></div>
      <div class="stat-row"><span>🥈 Médailles d'argent</span><span>${s.sports.filter(sp=>sp.rank>10&&sp.rank<=25).length}</span></div>
      <div class="stat-row"><span>🏆 Top 50 mondial</span><span>${s.sports.filter(sp=>sp.rank<=50).length} sports</span></div>
      <div class="stat-row"><span>🌍 Rang sportif global</span><span class="text-gold">${Math.floor(s.sports.reduce((a,sp)=>a+sp.rank,0)/s.sports.length)}ème</span></div>
      <div style="margin-top:12px">
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px">PROCHAINS ÉVÉNEMENTS</div>
        <div class="news-item">🏆 CAN 2025 — Qualification: ${s.sports[0]?.rank < 50 ? '✅ Qualifié' : '❌ Éliminé'}</div>
        <div class="news-item">🌍 Jeux Africains — Délégation: ${Math.floor(s.sports.length * 2.5)} athlètes</div>
      </div>
    `;
  }

  /* ── Resource Market (RDC Hub) ── */
  function renderResourceMarket() {
    const s = Engine.get();
    const el = $('resourceMarket');
    const myRes = Object.keys(s.resourcePrices);

    if (!myRes.length) {
      el.innerHTML = '<div class="empty-msg">Aucune ressource minière disponible.</div>'; return;
    }

    el.innerHTML = myRes.map(r => {
      const res = RESOURCES[r];
      if (!res) return '';
      const price = s.resourcePrices[r];
      const base = res.basePrice;
      const change = ((price - base) / base * 100).toFixed(1);
      const up = price >= base;
      const bars = Array.from({length:8}, (_,i) => {
        const h = 10 + Math.random() * 30;
        return `<div class="chart-bar" style="left:${i*11+2}px;height:${h}px;background:${up?'var(--green-light)':'var(--red)'}"></div>`;
      }).join('');
      return `
        <div class="market-card">
          <div class="market-name">
            <span>${res.emoji} ${res.name}</span>
            <span style="color:${up?'var(--green-light)':'var(--red)'}">${up?'↑':'↓'}${Math.abs(change)}%</span>
          </div>
          <div class="market-price">$${price.toLocaleString(undefined,{maximumFractionDigits:0})} <span style="font-size:11px;color:var(--text-dim)">/${res.unit}</span></div>
          <div class="market-chart">${bars}</div>
          <div class="stat-row" style="margin-top:8px"><span>Stock</span><span>${(s.resourceStocks[r]||0).toLocaleString()} ${res.unit}s</span></div>
          <div class="stat-row"><span>Description</span><span style="font-size:11px">${res.desc}</span></div>
          <div class="market-actions">
            <button class="btn-sm btn-sell" onclick="Engine.sellResource('${r}',1000)">Vendre 1 000</button>
            <button class="btn-sm btn-sell" onclick="Engine.sellResource('${r}',10000)">Vendre 10 000</button>
            <button class="btn-sm btn-invest" onclick="Engine.investResource('${r}',200)">Invest $200M</button>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ── Police & Justice ── */
  function renderPolice() {
    const s = Engine.get();
    const year = s.date.getFullYear();

    $('pol-stats').innerHTML = `
      <div class="section-title">Les statistiques estimées sur l'année ${year} :</div>
      ${CRIME_TYPES.map(c => `
        <div class="crime-row">
          <span>${c.name} :</span>
          <span class="crime-val">${(s.crimes[c.id] || 0).toLocaleString('fr-FR')}</span>
        </div>
      `).join('')}
      <div class="section-title" style="margin-top:16px">L'avis des gens sur la situation actuelle :</div>
      ${s.opinions.slice(0, 5).map(o => `
        <div class="opinion-item">
          <span class="op-avatar">👤</span>
          <div>
            <div class="op-name">${o.name}, ${o.age} ans</div>
            <div class="op-text">💬 ${o.text}</div>
          </div>
        </div>
      `).join('')}
    `;

    $('pol-budget').innerHTML = `
      <div class="budget-card">
        <div class="budget-title">🚔 Budget de la Police Nationale</div>
        <div class="slider-row">
          <div class="slider-label"><span>Budget annuel</span><span class="slider-val" id="sv-pol">$${s.policeBudget}M</span></div>
          <input type="range" min="20" max="${Math.max(500, Math.floor(s.gdp * 0.02))}" value="${s.policeBudget}"
            oninput="document.getElementById('sv-pol').textContent='$'+this.value+'M'; Engine.setPoliceBudget(+this.value)">
        </div>
        <div class="stat-row"><span>👮 Effectifs</span><span>${Math.floor(s.policeBudget * 180).toLocaleString('fr-FR')} agents</span></div>
        <div class="stat-row"><span>🚓 Véhicules de patrouille</span><span>${Math.floor(s.policeBudget * 4).toLocaleString('fr-FR')}</span></div>
        <div class="stat-row"><span>📹 Caméras de surveillance</span><span>${Math.floor(s.policeBudget * 25).toLocaleString('fr-FR')}</span></div>
        <div class="stat-row"><span>Efficacité</span><span>${s.policeBudget / s.population > 5 ? '🟢 Élevée' : s.policeBudget / s.population > 2 ? '🟡 Moyenne' : '🔴 Insuffisante'}</span></div>
        <p style="color:var(--text-dim);font-size:12px;margin-top:8px">Un meilleur financement réduit directement la criminalité estimée.</p>
      </div>
    `;

    $('pol-opinions').innerHTML = s.opinions.map(o => `
      <div class="opinion-item">
        <span class="op-avatar">👤</span>
        <div>
          <div class="op-name">${o.name}, ${o.age} ans</div>
          <div class="op-text">💬 ${o.text}</div>
        </div>
      </div>
    `).join('') || '<div class="empty-msg">Aucun avis pour le moment.</div>';
  }

  /* ── Social ── */
  function renderSocial() {
    const s = Engine.get();

    $('soc-fin').innerHTML = s.social.map(p => `
      <div class="policy-row">
        <span class="policy-name">${p.name}</span>
        <div class="stepper">
          <button class="step-btn minus" onclick="Engine.setPolicy('${p.id}', -1)">−</button>
          <span class="step-val">${p.val}</span>
          <button class="step-btn plus" onclick="Engine.setPolicy('${p.id}', 1)">+</button>
        </div>
      </div>
    `).join('');

    const workWeek = Engine.getPolicy('workWeek');
    $('soc-impact').innerHTML = `
      <div class="stat-row"><span>💰 Coût social total/jour</span><span class="text-red">-$${(s.dailyExpenses * 0.3).toFixed(1)}M</span></div>
      <div class="stat-row"><span>😊 Impact bonheur</span><span class="${workWeek <= 40 ? 'text-green' : 'text-red'}">${workWeek <= 40 ? '✅ Positif' : '⚠️ Négatif'}</span></div>
      <div class="stat-row"><span>📈 Impact productivité</span><span>${workWeek >= 40 ? '🟢 ' : '🟡 '}${(80 + workWeek / 2).toFixed(0)}%</span></div>
      <div class="stat-row"><span>👴 Retraités estimés</span><span>${(s.population * (70 - Engine.getPolicy('retirementAge')) * 0.012).toFixed(1)}M</span></div>
      <div class="stat-row"><span>📊 Taux de chômage</span><span>${s.unemployment.toFixed(1)}%</span></div>
      <p style="color:var(--text-dim);font-size:12px;padding:12px">
        Des allocations généreuses augmentent le bonheur mais pèsent sur le budget.
        Une semaine de travail courte plaît à la population mais réduit la productivité nationale.
      </p>
    `;
  }

  /* ── Population ── */
  function renderPopulation() {
    const s = Engine.get();
    const popExact = Math.floor(s.population * 1e6);
    const births = Math.floor(popExact * s.birthRate / 1000);
    const deaths = Math.floor(popExact * s.mortality / 1000);
    const natural = births - deaths;

    $('pop-stats').innerHTML = `
      <div class="crime-row"><span>Population :</span><span class="crime-val">${popExact.toLocaleString('fr-FR')}</span></div>
      <div class="crime-row"><span>Taux de natalité :</span><span class="crime-val">${s.birthRate.toFixed(1)} ‰</span></div>
      <div class="crime-row"><span>Taux de mortalité :</span><span class="crime-val">${s.mortality.toFixed(1)} ‰</span></div>
      <div class="crime-row"><span>Naissances estimées/an :</span><span class="crime-val">${births.toLocaleString('fr-FR')}</span></div>
      <div class="crime-row"><span>Décès estimés/an :</span><span class="crime-val">${deaths.toLocaleString('fr-FR')}</span></div>
      <div class="crime-row"><span>Accroissement naturel :</span><span class="crime-val" style="color:${natural >= 0 ? 'var(--green-light)' : 'var(--red)'}">${natural >= 0 ? '+' : ''}${natural.toLocaleString('fr-FR')}</span></div>
      <div class="crime-row"><span>Espérance de vie des hommes :</span><span class="crime-val">${Math.floor(s.lifeExpM)} ans</span></div>
      <div class="crime-row"><span>Espérance de vie des femmes :</span><span class="crime-val">${Math.floor(s.lifeExpF)} ans</span></div>
      <div class="crime-row"><span>Alphabétisation :</span><span class="crime-val">${s.literacy.toFixed(0)} %</span></div>
      <div class="crime-row"><span>IDH :</span><span class="crime-val">${s.idh.toFixed(3)}</span></div>
    `;

    $('pop-policy').innerHTML = `
      <div class="budget-card">
        <div class="budget-title">👶 Politique familiale</div>
        <button class="btn-sm btn-invest" style="width:100%;margin-bottom:8px"
          onclick="const s=Engine.get(); if(s.treasury>=100){s.treasury-=100;s.birthRate+=0.5;UI.notify('👶 Allocations familiales renforcées (+0.5‰ natalité)','success');UI.renderPopulation();UI.update();}else{UI.notify('Fonds insuffisants !','error');}">
          💰 Allocations familiales (-$100M, natalité +0.5‰)
        </button>
        <button class="btn-sm btn-invest" style="width:100%;margin-bottom:8px"
          onclick="const s=Engine.get(); if(s.treasury>=200){s.treasury-=200;s.mortality=Math.max(4,s.mortality-0.4);s.lifeExpM+=0.5;s.lifeExpF+=0.5;UI.notify('🏥 Campagne de vaccination nationale (-0.4‰ mortalité)','success');UI.renderPopulation();UI.update();}else{UI.notify('Fonds insuffisants !','error');}">
          💉 Campagne de vaccination (-$200M, mortalité -0.4‰)
        </button>
        <button class="btn-sm btn-invest" style="width:100%"
          onclick="const s=Engine.get(); if(s.treasury>=150){s.treasury-=150;s.lifeExpM+=1;s.lifeExpF+=1;UI.notify('🍚 Programme nutrition (+1 an espérance de vie)','success');UI.renderPopulation();UI.update();}else{UI.notify('Fonds insuffisants !','error');}">
          🍚 Programme nutrition (-$150M, +1 an espérance de vie)
        </button>
      </div>
    `;
  }

  /* ── Réseaux d'infrastructure ── */
  function renderNetworks() {
    const s = Engine.get();
    const el = $('networksQuality');
    if (!el || !s.networks) return;

    el.innerHTML = `
      <div class="stat-row"><span>🌍 La place en termes de l'infrastructure</span><span>${Engine.infraRank()}ème place</span></div>
      ${s.networks.map(n => {
        const def = NETWORK_DEFS.find(d => d.id === n.id);
        const nstars = Engine.networkStars(n);
        return `
          <div class="network-card ${n.building ? 'net-building' : ''}">
            <div class="net-head">
              <span>${def.emoji} ${def.name}</span>
              <span class="stars">${'★'.repeat(nstars)}${'☆'.repeat(5 - nstars)}</span>
            </div>
            <div class="net-info">
              <span>📏 ${Math.floor(n.km).toLocaleString('fr-FR')} km</span>
              <span class="${n.building ? 'text-gold' : 'text-dim'}">${n.building ? `🏗️ +${def.kmDay} km/j · -$${def.costDay}M/j` : `Coût: $${def.costDay}M/j`}</span>
            </div>
            <button class="btn-sm ${n.building ? 'btn-sell' : 'btn-invest'}" style="width:100%;margin-top:6px"
              onclick="Engine.toggleNetwork('${n.id}')">
              ${n.building ? '⏹️ Arrêter la construction' : '🏗️ Lancer la construction'}
            </button>
          </div>
        `;
      }).join('')}
    `;
  }

  /* ── Carte du Monde ── */
  function renderWorldMap() {
    const s = Engine.get();
    const playerCoord = MAP_COORDS[s.countryId] || [500, 250];

    const markers = s.nations.map(n => {
      const c = MAP_COORDS[n.id];
      if (!c) return '';
      const color = s.wars.includes(n.id) ? '#FF1744' : n.relation === 'ally' ? '#43A047' : n.relation === 'hostile' ? '#C62828' : '#90A4AE';
      return `
        <circle cx="${c[0]}" cy="${c[1]}" r="9" fill="${color}" stroke="#fff" stroke-width="1.5"
          style="cursor:pointer" onclick="UI.mapSelect('${n.id}')"/>
        <text x="${c[0]}" y="${c[1] - 14}" text-anchor="middle" font-size="13" fill="#E8E8F0"
          style="cursor:pointer;font-family:Rajdhani" onclick="UI.mapSelect('${n.id}')">${n.flag}</text>
      `;
    }).join('');

    const warLines = s.wars.map(wId => {
      const c = MAP_COORDS[wId];
      if (!c) return '';
      return `<line x1="${playerCoord[0]}" y1="${playerCoord[1]}" x2="${c[0]}" y2="${c[1]}"
        stroke="#FF1744" stroke-width="2" stroke-dasharray="6,4" opacity="0.8"/>`;
    }).join('');

    const allyLines = s.nations.filter(n => n.relation === 'ally' && MAP_COORDS[n.id]).map(n => {
      const c = MAP_COORDS[n.id];
      return `<line x1="${playerCoord[0]}" y1="${playerCoord[1]}" x2="${c[0]}" y2="${c[1]}"
        stroke="#43A047" stroke-width="1" stroke-dasharray="3,5" opacity="0.4"/>`;
    }).join('');

    $('worldMapBody').innerHTML = `
      <div class="map-wrap">
        <svg viewBox="0 0 1000 500" class="world-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="1000" height="500" fill="#0a1428"/>
          ${WORLD_MAP_PATHS.map(p => `<path d="${p}" fill="#1c2e4a" stroke="#2d4a73" stroke-width="1.5"/>`).join('')}
          ${allyLines}
          ${warLines}
          <circle cx="${playerCoord[0]}" cy="${playerCoord[1]}" r="12" fill="#FFD700" stroke="#fff" stroke-width="2">
            <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite"/>
          </circle>
          <text x="${playerCoord[0]}" y="${playerCoord[1] - 18}" text-anchor="middle" font-size="14" fill="#FFD700"
            font-weight="bold" style="font-family:Orbitron">${s.country.flag} VOUS</text>
          ${markers}
        </svg>
      </div>
      <div class="map-legend">
        <span>🟡 Vous</span><span>🟢 Allié</span><span>⚪ Neutre</span><span>🔴 Hostile / Guerre</span>
      </div>
      <div id="mapAction"><div class="empty-msg">Touchez un pays sur la carte pour interagir.</div></div>
    `;
  }

  function mapSelect(nationId) {
    const s = Engine.get();
    const n = s.nations.find(x => x.id === nationId);
    if (!n) return;
    const atWar = s.wars.includes(n.id);
    $('mapAction').innerHTML = `
      <div class="nation-card" style="margin:8px">
        <div class="nc-flag">${n.flag}</div>
        <div class="nc-info">
          <div class="nc-name">${n.name}
            ${atWar ? '<span class="war-badge">⚔️ GUERRE</span>' : n.relation === 'ally' ? '<span class="ally-badge">🤝 ALLIÉ</span>' : ''}
          </div>
          <div class="nc-rel ${n.relation}">PIB: ${fmt(n.gdp)} · Armée: ${n.army}/100</div>
        </div>
        <div class="nc-actions">
          ${n.relation !== 'ally' && !atWar ? `<button class="btn-diplo" onclick="Engine.diplo('${n.id}','ally');UI.renderWorldMap()">🤝</button>` : ''}
          ${!atWar ? `<button class="btn-diplo" onclick="Engine.diplo('${n.id}','trade');UI.renderWorldMap()">📦</button>` : ''}
          ${atWar ? `<button class="btn-diplo" onclick="Engine.diplo('${n.id}','peace');UI.renderWorldMap()">🕊️</button>` :
            n.relation !== 'ally' ? `<button class="btn-diplo btn-war" onclick="if(confirm('Déclarer la guerre à ${n.name} ?')){Engine.diplo('${n.id}','war');UI.renderWorldMap();}">⚔️</button>` : ''}
        </div>
      </div>
    `;
  }

  /* ── God Mode Editor ── */
  function renderEditor() {
    const s = Engine.get();
    $('editorBody').innerHTML = `
      <div class="editor-form">
        <div>
          <label>Nom de la ressource / industrie</label>
          <input type="text" id="edName" placeholder="Ex: Usine Lithium, Tourisme Numérique...">
        </div>
        <div>
          <label>Émoji</label>
          <input type="text" id="edEmoji" placeholder="🔋" maxlength="2">
        </div>
        <div>
          <label>Coût de création ($M)</label>
          <input type="number" id="edCost" placeholder="500" min="1">
        </div>
        <div>
          <label>Revenu annuel généré ($M)</label>
          <input type="number" id="edIncome" placeholder="80" min="0">
        </div>
        <div>
          <label>Type d'impact</label>
          <select id="edType">
            <option value="resource">Ressource minière</option>
            <option value="industry">Industrie manufacturière</option>
            <option value="tech">Technologie / Innovation</option>
            <option value="tourism">Tourisme</option>
          </select>
        </div>
        <div>
          <label>Description / Effet</label>
          <input type="text" id="edEffect" placeholder="Ex: Réduit la dépendance aux importations">
        </div>
        <button class="btn-create" onclick="UI.createResource()">⚡ AJOUTER À L'ÉCONOMIE NATIONALE</button>
      </div>
      <div style="padding:0 12px 12px">
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px;letter-spacing:2px">RESSOURCES EXISTANTES</div>
        ${Object.keys(s.resourcePrices).map(r => {
          const res = RESOURCES[r];
          return res ? `<div class="stat-row"><span>${res.emoji} ${res.name}</span><span class="text-gold">$${Math.floor(s.resourcePrices[r]).toLocaleString()}</span></div>` : '';
        }).join('')}
      </div>
    `;
  }

  function createResource() {
    const name = document.getElementById('edName').value.trim();
    const emoji = document.getElementById('edEmoji').value.trim() || '🏭';
    const cost = parseFloat(document.getElementById('edCost').value) || 500;
    const income = parseFloat(document.getElementById('edIncome').value) || 50;
    const effect = document.getElementById('edEffect').value.trim() || 'Nouvelle industrie nationale';
    if (!name) { notify('Entrez un nom de ressource !', 'error'); return; }
    Engine.addCustomResource(name, emoji, cost, income, effect);
    renderEditor();
  }

  /* ── Events / Notifications ── */
  function showEvent(ev) {
    const overlay = $('eventOverlay');
    $('evIcon').textContent = ev.icon;
    $('evTitle').textContent = ev.title;
    $('evDesc').textContent = ev.desc;
    $('evChoices').innerHTML = ev.choices.map((c, i) => `
      <button class="event-choice" onclick="UI.resolveEvent(${i})">${c.label}</button>
    `).join('');
    overlay.classList.remove('hidden');
    overlay._ev = ev;
  }

  function hideEvent() {
    $('eventOverlay').classList.add('hidden');
  }

  function resolveEvent(idx) {
    const ev = $('eventOverlay')._ev;
    Engine.resolveEvent(ev, idx);
  }

  function notify(msg, type) {
    const el = $('alertBanner');
    el.classList.remove('hidden');
    $('alertText').textContent = msg;
    el.style.background = type === 'error' ? 'linear-gradient(135deg,#C62828,#B71C1C)'
      : type === 'success' ? 'linear-gradient(135deg,#2E7D32,#1B5E20)'
      : 'linear-gradient(135deg,#E65100,#BF360C)';
    clearTimeout(el._timeout);
    el._timeout = setTimeout(() => el.classList.add('hidden'), 3500);
  }

  function setBadge(app, count) {
    const el = $(`badge-${app}`);
    if (!el) return;
    if (count > 0) {
      el.textContent = count > 9 ? '9+' : count;
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  }

  function showGameOver() {
    const s = Engine.get();
    $('alertBanner').classList.remove('hidden');
    $('alertText').textContent = `🏁 FIN DE PARTIE — Score: ${s.score} pts | Jour ${s.day} | Mandat ${s.mandat}`;
  }

  /* ── Render All ── */
  function renderAll() {
    const s = Engine.get();
    update();
    renderCabinet();
    renderEconomy();
    renderEnergy();
    renderDevelopment();
    renderDiplomacy();
    renderDefense();
    renderIntelligence();
    renderNews();
    renderSports();
    renderResourceMarket();
    renderEditor();
    renderPolice();
    renderSocial();
    renderPopulation();
    renderWorldMap();
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    runSplash();
  });

  return {
    update, notify, setBadge, showEvent, hideEvent,
    renderCabinet, renderEconomy, renderEnergy, renderDevelopment,
    renderDiplomacy, renderDefense, renderIntelligence, renderNews,
    renderSports, renderResources, renderResourceMarket, renderEditor,
    renderPolice, renderSocial, renderPopulation, renderWorldMap, renderNetworks,
    mapSelect, cabinetChoice, resolveEvent, createResource
  };
})();
