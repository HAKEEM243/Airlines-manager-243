'use strict';

/* ═══════════════════════════════════════════════════════════
   HAKVISION PRESIDENT LIFE — INTERFACE
═══════════════════════════════════════════════════════════ */

const UI = (() => {
  const $ = id => document.getElementById(id);
  const E = Engine;
  let selectedCountry = 'rdc';
  let selectedDiff = 'normal';

  function money(n){ return E.fmtMoney(n); }
  function stars(n){ n=Math.round(n); return '★'.repeat(Math.max(0,Math.min(5,n)))+'☆'.repeat(Math.max(0,5-n)); }
  function bar(pct, cls){ return `<div class="meter-bar"><div class="meter-fill ${cls||''}" style="width:${Math.max(0,Math.min(100,pct))}%"></div></div>`; }

  /* ───────── SPLASH ───────── */
  function runSplash() {
    let p=0; const fill=$('loadFill'), pct=$('loadPct');
    const iv=setInterval(()=>{ p+=Math.random()*14+4; if(p>=100){p=100;clearInterval(iv);setTimeout(showSetup,400);} fill.style.width=p+'%'; pct.textContent=Math.floor(p)+'%'; },110);
  }
  function showSetup(){ $('splash').classList.add('hidden'); $('setup').classList.remove('hidden'); renderCountryGrid(); bindSetup(); }

  function renderCountryGrid() {
    $('countryGrid').innerHTML = COUNTRIES.map(c=>`
      <div class="country-card ${c.featured?'featured':''} ${c.id===selectedCountry?'selected':''}" data-id="${c.id}">
        <div class="cc-flag">${c.flag}</div>
        <div class="cc-info"><div class="cc-name">${c.name}</div><div class="cc-gdp">PIB: ${money(c.gdp)}</div></div>
      </div>`).join('');
    document.querySelectorAll('.country-card').forEach(card=>card.addEventListener('click',()=>{
      selectedCountry=card.dataset.id;
      document.querySelectorAll('.country-card').forEach(c=>c.classList.remove('selected'));
      card.classList.add('selected');
    }));
  }
  function bindSetup() {
    document.querySelectorAll('.diff-btn').forEach(b=>b.addEventListener('click',()=>{
      document.querySelectorAll('.diff-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); selectedDiff=b.dataset.diff;
    }));
    $('btnStart').addEventListener('click',()=>{ const n=($('presName').value||'Le Président').trim(); start(selectedCountry,n,selectedDiff,false); });
    if (E.hasSave()) { const b=$('btnContinue'); b.classList.remove('hidden'); b.addEventListener('click',()=>start(null,null,null,true)); }
  }

  function start(country,name,diff,fromSave) {
    $('setup').classList.add('hidden'); $('game').classList.remove('hidden');
    if (fromSave) { if(!E.load()){ alert('Sauvegarde introuvable'); return; } }
    else E.init(country,name,diff);
    bindGame(); renderAll(); E.startTicker(); E.setSpeed(1); setSpeedUI(1);
  }

  /* ───────── NAV ───────── */
  function setSpeedUI(s){ document.querySelectorAll('.speed-btn').forEach(b=>b.classList.remove('active')); ({0:'btnPause',1:'btn1x',2:'btn2x',5:'btn5x'}[s]&&$(({0:'btnPause',1:'btn1x',2:'btn2x',5:'btn5x'})[s]).classList.add('active')); }

  function show(id) {
    document.querySelectorAll('.panel').forEach(p=>{
      if(p.id==='panel-home') p.classList.add('active');
      else { p.classList.remove('active'); p.classList.add('hidden'); }
    });
    if(id!=='home'){ const t=$('panel-'+id); if(t){ t.classList.remove('hidden'); setTimeout(()=>t.classList.add('active'),10); } }
    const r={cabinet:renderCabinet,economy:renderEconomy,resources:renderResources,companies:renderCompanies,
      trade:renderTrade,worldmap:renderWorldMap,national:renderNational,embassies:renderEmbassies,
      ministers:renderMinisters,army:renderArmy,infra:renderInfra,sports:renderSports,
      elections:renderElections,social:renderSocial,news:renderNews,un:renderUN};
    if(r[id]) r[id]();
  }

  function bindGame() {
    document.querySelectorAll('.app-icon').forEach(i=>{ if(i.dataset.panel) i.addEventListener('click',()=>show(i.dataset.panel)); });
    document.querySelectorAll('.back-btn').forEach(b=>b.addEventListener('click',()=>show('home')));
    $('homeBtn').addEventListener('click',()=>show('home'));
    $('btnPause').addEventListener('click',()=>{E.setSpeed(0);setSpeedUI(0);});
    $('btn1x').addEventListener('click',()=>{E.setSpeed(1);setSpeedUI(1);});
    $('btn2x').addEventListener('click',()=>{E.setSpeed(2);setSpeedUI(2);});
    $('btn5x').addEventListener('click',()=>{E.setSpeed(5);setSpeedUI(5);});
    $('alertClose').addEventListener('click',()=>$('alertBanner').classList.add('hidden'));
    // tabs
    document.querySelectorAll('.tabs').forEach(bar=>{
      bar.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>{
        const panel=bar.closest('.panel');
        panel.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
        panel.querySelectorAll('.tab-content').forEach(c=>c.classList.add('hidden'));
        tab.classList.add('active');
        const tgt=panel.querySelector('#'+tab.dataset.tab); if(tgt) tgt.classList.remove('hidden');
      }));
    });
  }

  /* ───────── REFRESH (status + home) ───────── */
  function refresh() {
    const s=E.get(); if(!s) return;
    $('sbDate').textContent = E.fmtDate(s.date);
    $('sbMoney').textContent = '💰 '+money(s.treasury);
    $('sbApproval').textContent = '👥 '+s.happiness.toFixed(0)+'%';
    $('sbApproval').style.color = s.happiness>50?'#43A047':s.happiness>30?'#FFD700':'#C62828';
    $('dateBanner').textContent = '📅 '+E.fmtDateLong(s.date);
    $('chCountry').textContent = s.country.name.toUpperCase();
    $('chPresident').textContent = 'Président: '+s.presidentName;
    $('chFlag').textContent = s.country.flag;
    $('chMandat').textContent = s.mandat;

    $('kpiTreasury').textContent = money(s.treasury);
    $('kpiTreasury').className='kpi-val '+(s.treasury>=0?'green':'red');
    const net=s.dailyIncome-s.dailyExpenses;
    $('kpiTreasuryDelta').textContent = (net>=0?'+':'')+net.toFixed(0)+'M/j';
    $('kpiTreasuryDelta').style.color = net>=0?'#43A047':'#C62828';
    $('kpiGDP').textContent = money(s.gdp);
    $('kpiGDPDelta').textContent = '▲ '+s.gdpGrowth.toFixed(1)+'%/an';
    $('kpiHappy').textContent = s.happiness.toFixed(0)+'%';
    $('happyBar').style.width = s.happiness+'%';
    $('kpiSec').textContent = s.security.toFixed(0)+'%';
    $('secBar').style.width = s.security+'%';

    // élection strip
    if (s.electionDate) {
      const days = Math.max(0, Math.ceil((s.electionDate - s.date)/86400000));
      $('electionStrip').innerHTML = `🗳️ Prochaine élection : <b>${E.fmtDate(s.electionDate)}</b> &nbsp;·&nbsp; dans ${days.toLocaleString('fr-FR')} jours`;
    } else $('electionStrip').innerHTML = '🏛️ Régime sans élection présidentielle';

    // ticker
    const t=[`💰 ${money(s.treasury)}`,`📈 PIB ${money(s.gdp)}`,`😊 ${s.happiness.toFixed(0)}%`,`🔒 ${s.security.toFixed(0)}%`,
      `💼 Chômage ${s.unemployment.toFixed(1)}%`,`🏢 ${s.companies.filter(c=>c.active).length} entreprises`,
      `⚔️ Puissance militaire ${E.totalArmyPower().toLocaleString('fr-FR')}`,
      ...(s.socialFeed[0]?[`📱 ${s.socialFeed[0].text.substring(0,60)}...`]:[]),
      ...(s.wars.length?[`⚔️ EN GUERRE (${s.wars.length})`]:[])];
    $('ticker').textContent = t.join('   ·   ');

    if (s.happiness<25 && !s.gameOver) { $('alertBanner').classList.remove('hidden'); $('alertText').textContent=`⚠️ Popularité critique (${s.happiness.toFixed(0)}%) — Risque de révolution !`; $('alertBanner').style.background=''; }
  }

  /* ───────── CABINET ───────── */
  function renderCabinet() {
    const s=E.get(); const act=s.cabinetMessages.filter(m=>!m.resolved);
    $('cabinetBody').innerHTML = act.length ? act.map(m=>{
      const idx=s.cabinetMessages.indexOf(m);
      return `<div class="cabinet-msg"><div class="cm-from">${m.from}</div><div class="cm-text">${m.text}</div>
        <div class="cm-choices">${m.choices.map((c,ci)=>`<button class="cm-choice ${ci===0?'yes':ci===1?'no':'mid'}" onclick="UI.cab(${idx},${ci})">${c.label}</button>`).join('')}</div>
        <div class="cm-timestamp">📅 ${m.date}</div></div>`;
    }).join('') : '<div class="empty-msg">Aucun dossier urgent. Le cabinet vous recontactera.</div>';
  }
  function cab(i,c){ E.resolveCabinet(i,c); renderCabinet(); }

  /* ───────── ÉCONOMIE ───────── */
  function renderEconomy() {
    const s=E.get();
    $('eco-over').innerHTML = `<div class="stat-grid">${[
      ['PIB',money(s.gdp)],['Croissance',s.gdpGrowth.toFixed(1)+'%'],['Trésor',money(s.treasury)],
      ['Inflation',s.inflation.toFixed(1)+'%'],['Chômage',s.unemployment.toFixed(1)+'%'],['IDH',s.idh.toFixed(3)],
      ['Revenu/j','+'+s.dailyIncome.toFixed(0)+'M'],['Dépenses/j','-'+s.dailyExpenses.toFixed(0)+'M']
    ].map(([l,v])=>`<div class="stat-card"><div class="stat-card-label">${l}</div><div class="stat-card-val">${v}</div></div>`).join('')}</div>`;

    $('eco-tax').innerHTML = `
      ${slider('Impôt sur le revenu','taxRate',s.taxRate,5,60)}
      ${slider('Impôt sociétés','corpTax',s.corpTax,5,60)}
      ${slider('TVA','vatRate',s.vatRate,0,30)}
      <div class="stat-row"><span>Revenu fiscal/jour</span><span>+${s.dailyIncome.toFixed(0)}M</span></div>
      <div class="stat-row"><span>Effet popularité</span><span style="color:${s.taxRate>35?'#C62828':'#43A047'}">${s.taxRate>35?'⬇️ Charge lourde':'✅ Acceptable'}</span></div>`;
    bindSliders();

    const jobs = s._companyJobs||0;
    $('eco-jobs').innerHTML = `
      <div class="stat-row"><span>💼 Emplois créés (entreprises)</span><span>${jobs.toLocaleString('fr-FR')}</span></div>
      <div class="stat-row"><span>📊 Taux de chômage</span><span style="color:${s.unemployment>20?'#C62828':'#43A047'}">${s.unemployment.toFixed(1)}%</span></div>
      <div class="stat-row"><span>🏢 Entreprises actives</span><span>${s.companies.filter(c=>c.active).length}</span></div>
      <p class="hint">Créez des entreprises (onglet Entreprises) pour générer des emplois, réduire le chômage et augmenter la popularité.</p>`;
  }
  function slider(label,key,val,min,max,unit){
    unit = unit===undefined ? '%' : unit;
    return `<div class="slider-row"><div class="slider-label"><span>${label}</span><span class="slider-val" id="sv-${key}">${val}${unit}</span></div>
      <input type="range" data-key="${key}" min="${min}" max="${max}" value="${val}"></div>`;
  }
  function bindSliders(){
    document.querySelectorAll('#eco-tax input[type=range]').forEach(r=>r.addEventListener('input',()=>{
      $('sv-'+r.dataset.key).textContent=r.value+'%';
      E.setTax(r.dataset.key, +r.value);
    }));
  }

  /* ───────── RESSOURCES ───────── */
  function renderResources() {
    const s=E.get(); const keys=Object.keys(s.resources);
    $('resourceBody').innerHTML = keys.length ? keys.map(r=>{
      const def=RESOURCES[r], R=s.resources[r];
      const change=((R.price-def.basePrice)/def.basePrice*100);
      const up=change>=0;
      return `<div class="resource-card">
        <div class="rc-icon">${def.emoji}</div>
        <div class="rc-info">
          <div class="rc-name">${def.name}</div>
          <div class="rc-price">$${Math.round(R.price).toLocaleString('fr-FR')} /${def.unit}</div>
          <div class="rc-stock">Prod: ${Math.round(R.production).toLocaleString('fr-FR')}/an · Export ${Math.round(R.exports*100)}% · Stock ${Math.round(R.stock).toLocaleString('fr-FR')}</div>
        </div>
        <div style="text-align:right">
          <div class="rc-trend ${up?'up':'down'}">${up?'↑':'↓'}${Math.abs(change).toFixed(1)}%</div>
          <button class="btn-sm btn-sell" onclick="Engine.sellResource('${r}',${Math.round(R.production/12)})">Vendre</button>
          <button class="btn-sm btn-invest" onclick="Engine.investResource('${r}',150);UI.renderResources()">Invest +8%</button>
        </div>
      </div>`;
    }).join('') : '<div class="empty-msg">Aucune ressource exploitable.</div>';
  }

  /* ───────── ENTREPRISES ───────── */
  function renderCompanies() {
    const s=E.get();
    const mine=s.companies;
    $('co-mine').innerHTML = mine.length ? mine.map(c=>`
      <div class="company-card ${c.active?'':'closed'}">
        <div class="cmp-head"><span>${c.emoji} ${c.name}</span><span class="${c.active?'text-green':'text-red'}">${c.active?'🟢 Active':'🔴 Fermée'}</span></div>
        <div class="cmp-line">${c.typeName} · Fondée le ${c.founded}</div>
        <div class="cmp-stats">
          <span>💼 ${c.jobs.toLocaleString('fr-FR')} emplois</span>
          <span>💰 +$${c.dailyRevenue.toFixed(2)}M/j</span>
          <span>🏗️ $${c.investment}M investis</span>
        </div>
        ${c.active?`<button class="btn-sm btn-sell" style="margin-top:6px" onclick="if(confirm('Fermer ${c.name} ? Les emplois seront perdus.')){Engine.closeCompany('${c.id}');UI.renderCompanies();}">Fermer</button>`:''}
      </div>`).join('') : '<div class="empty-msg">Vous n\'avez créé aucune entreprise.<br>Allez dans l\'onglet « Créer ».</div>';

    $('co-new').innerHTML = `
      <div class="form-block">
        <label>Type d'entreprise</label>
        <select id="coType" onchange="UI.coTypeChange()">${COMPANY_TYPES.map(t=>`<option value="${t.id}">${t.emoji} ${t.name} (min $${t.minInvest}M)</option>`).join('')}</select>
        <label>Nom de l'entreprise</label>
        <input id="coName" type="text" placeholder="Ex: HakVision Mining" value="HakVision Mining"/>
        <label>Investissement ($M) — <span id="coInvestLbl">200</span></label>
        <input id="coInvest" type="range" min="50" max="3000" value="200" oninput="document.getElementById('coInvestLbl').textContent=this.value;UI.coPreview()">
        <div id="coPreview" class="co-preview"></div>
        <button class="btn-create" onclick="UI.createCompany()">⚡ CRÉER L'ENTREPRISE</button>
      </div>`;
    coTypeChange();
  }
  function coTypeChange(){ coPreview(); }
  function coPreview() {
    const t=COMPANY_TYPES.find(x=>x.id=== $('coType').value);
    const inv=+$('coInvest').value;
    const jobs=Math.round(inv*t.jobsPerM), rev=(inv*t.revPerM/365).toFixed(2);
    $('coPreview').innerHTML = `<div class="stat-row"><span>💼 Emplois créés</span><span>${jobs.toLocaleString('fr-FR')}</span></div>
      <div class="stat-row"><span>💰 Revenu estimé/jour</span><span>~$${rev}M</span></div>
      <div class="stat-row"><span>📈 Ressource liée</span><span>${RESOURCES[t.resource]?.emoji||''} ${RESOURCES[t.resource]?.name||'-'}</span></div>`;
  }
  function createCompany() {
    const t=$('coType').value, name=$('coName').value.trim()||'Entreprise', inv=+$('coInvest').value;
    if (E.createCompany(t,name,inv)) { renderCompanies(); refresh(); }
  }

  /* ───────── COMMERCE ───────── */
  function renderTrade() {
    const s=E.get();
    $('tr-contracts').innerHTML = s.tradeContracts.length ? s.tradeContracts.map(t=>`
      <div class="contract-card">
        <div class="cmp-head"><span>${t.emoji} ${t.resourceName} → ${t.partnerFlag} ${t.partnerName}</span><span class="text-gold">${t.yearsLeft} an(s)</span></div>
        <div class="cmp-stats"><span>📦 ${t.volume.toLocaleString('fr-FR')} u/an</span><span>💰 +$${t.dailyRevenue.toFixed(2)}M/j</span><span>📅 dès ${t.signed}</span></div>
      </div>`).join('') : '<div class="empty-msg">Aucun contrat actif. Signez-en un dans « Nouveau contrat ».</div>';

    const keys=Object.keys(s.resources);
    $('tr-new').innerHTML = keys.length ? `
      <div class="form-block">
        <label>Ressource à exporter</label>
        <select id="trRes">${keys.map(r=>`<option value="${r}">${RESOURCES[r].emoji} ${RESOURCES[r].name} ($${Math.round(s.resources[r].price).toLocaleString('fr-FR')}/${RESOURCES[r].unit})</option>`).join('')}</select>
        <label>Pays acheteur</label>
        <select id="trPartner">${TRADE_PARTNERS.map(p=>`<option value="${p.id}">${p.flag} ${p.name} (prix ×${p.priceMod})</option>`).join('')}</select>
        <label>Volume annuel (unités) — <span id="trVolLbl">100000</span></label>
        <input id="trVol" type="range" min="10000" max="2000000" step="10000" value="100000" oninput="document.getElementById('trVolLbl').textContent=(+this.value).toLocaleString('fr-FR');UI.trPreview()">
        <label>Durée du contrat — <span id="trYrLbl">5</span> ans</label>
        <input id="trYr" type="range" min="1" max="15" value="5" oninput="document.getElementById('trYrLbl').textContent=this.value;UI.trPreview()">
        <div id="trPreview" class="co-preview"></div>
        <button class="btn-create" onclick="UI.signContract()">✍️ SIGNER LE CONTRAT</button>
      </div>` : '<div class="empty-msg">Aucune ressource à exporter.</div>';
    if(keys.length) trPreview();
  }
  function trPreview() {
    const s=E.get(); const r=$('trRes').value; const p=TRADE_PARTNERS.find(x=>x.id===$('trPartner').value);
    const vol=+$('trVol').value; const price=s.resources[r].price*p.priceMod;
    const daily=(vol*price/365/1e6).toFixed(2);
    $('trPreview').innerHTML=`<div class="stat-row"><span>💰 Revenu/jour</span><span>+$${daily}M</span></div>
      <div class="stat-row"><span>💵 Prix unitaire</span><span>$${Math.round(price).toLocaleString('fr-FR')}</span></div>`;
  }
  function signContract() {
    if (E.signTradeContract($('trRes').value,$('trPartner').value,+$('trVol').value,+$('trYr').value)) { renderTrade(); refresh(); }
  }

  /* ───────── CARTE DU MONDE ───────── */
  let mapScale=1, mapX=0, mapY=0;
  function renderWorldMap() {
    const s=E.get();
    const me=MAP_COORDS[s.countryId]||[558,272];
    const markers=s.nations.map(n=>{
      const c=MAP_COORDS[n.id]; if(!c) return '';
      const col=s.wars.includes(n.id)?'#FF1744':n.relation==='ally'?'#43A047':n.relation==='hostile'?'#C62828':'#90A4AE';
      return `<circle cx="${c[0]}" cy="${c[1]}" r="8" fill="${col}" stroke="#fff" stroke-width="1.5" style="cursor:pointer" onclick="UI.mapSel('${n.id}')"/>
        <text x="${c[0]}" y="${c[1]-12}" text-anchor="middle" font-size="13" style="cursor:pointer" onclick="UI.mapSel('${n.id}')">${n.flag}</text>`;
    }).join('');
    const wars=s.wars.map(w=>{const c=MAP_COORDS[w];return c?`<line x1="${me[0]}" y1="${me[1]}" x2="${c[0]}" y2="${c[1]}" stroke="#FF1744" stroke-width="2" stroke-dasharray="6,4"/>`:'';}).join('');
    const allies=s.nations.filter(n=>n.relation==='ally'&&MAP_COORDS[n.id]).map(n=>{const c=MAP_COORDS[n.id];return `<line x1="${me[0]}" y1="${me[1]}" x2="${c[0]}" y2="${c[1]}" stroke="#43A047" stroke-width="1" stroke-dasharray="3,5" opacity="0.4"/>`;}).join('');
    $('worldMapBody').innerHTML=`
      <div class="map-controls">
        <button class="map-btn" onclick="UI.mapZoom(1.3)">➕</button>
        <button class="map-btn" onclick="UI.mapZoom(0.77)">➖</button>
        <button class="map-btn" onclick="UI.mapReset()">⟳</button>
        <span class="map-hint">Touchez un pays</span>
      </div>
      <div class="map-wrap" id="mapWrap">
        <svg viewBox="0 0 1000 500" class="world-svg" id="worldSvg" style="transform:scale(${mapScale}) translate(${mapX}px,${mapY}px)">
          <rect width="1000" height="500" fill="#0a1428"/>
          ${WORLD_MAP_PATHS.map(p=>`<path d="${p}" fill="#1c2e4a" stroke="#2d4a73" stroke-width="1.5"/>`).join('')}
          ${allies}${wars}
          <circle cx="${me[0]}" cy="${me[1]}" r="11" fill="#FFD700" stroke="#fff" stroke-width="2"><animate attributeName="r" values="9;13;9" dur="2s" repeatCount="indefinite"/></circle>
          <text x="${me[0]}" y="${me[1]-16}" text-anchor="middle" font-size="13" fill="#FFD700" font-weight="bold">${s.country.flag}</text>
          ${markers}
        </svg>
      </div>
      <div class="map-legend"><span>🟡 Vous</span><span>🟢 Allié</span><span>⚪ Neutre</span><span>🔴 Hostile</span></div>
      <div id="mapAction"></div>`;
    mapSel(s.countryId, true);
  }
  function mapZoom(f){ mapScale=Math.max(1,Math.min(4,mapScale*f)); const e=$("worldSvg"); if(e) e.style.transform=`scale(${mapScale}) translate(${mapX}px,${mapY}px)`; }
  function mapReset(){ mapScale=1;mapX=0;mapY=0; const e=$('worldSvg'); if(e) e.style.transform='scale(1)'; }
  function mapSel(id, isMe) {
    const s=E.get();
    if (id===s.countryId || isMe&&id===s.countryId) {
      const res=Object.keys(s.resources).map(r=>RESOURCES[r].emoji).join(' ');
      $('mapAction').innerHTML=`<div class="map-info-card you">
        <div class="mic-head">${s.country.flag} ${s.country.name} <span class="badge-you">VOUS</span></div>
        <div class="stat-row"><span>👥 Population</span><span>${s.population.toFixed(1)}M</span></div>
        <div class="stat-row"><span>📈 PIB</span><span>${money(s.gdp)}</span></div>
        <div class="stat-row"><span>⚔️ Puissance militaire</span><span>${E.totalArmyPower().toLocaleString('fr-FR')}</span></div>
        <div class="stat-row"><span>⛏️ Ressources</span><span>${res}</span></div>
        <div class="stat-row"><span>🤝 Alliés</span><span>${s.nations.filter(n=>n.relation==='ally').length}</span></div>
      </div>`; return;
    }
    const n=s.nations.find(x=>x.id===id); if(!n) return;
    const atWar=s.wars.includes(n.id);
    $('mapAction').innerHTML=`<div class="map-info-card">
      <div class="mic-head">${n.flag} ${n.name} ${atWar?'<span class="war-badge">⚔️ GUERRE</span>':n.relation==='ally'?'<span class="ally-badge">ALLIÉ</span>':''}</div>
      <div class="stat-row"><span>📈 PIB</span><span>${money(n.gdp)}</span></div>
      <div class="stat-row"><span>⚔️ Armée</span><span>${n.army}/100</span></div>
      <div class="stat-row"><span>🤝 Relation</span><span class="nc-rel ${n.relation}">${n.relation==='ally'?'Allié':n.relation==='hostile'?'Hostile':'Neutre'}</span></div>
      <div class="nc-actions" style="margin-top:8px">
        ${n.relation!=='ally'&&!atWar?`<button class="btn-diplo" onclick="Engine.diplo('${n.id}','ally');UI.renderWorldMap()">🤝 Alliance ($50M)</button>`:''}
        ${!atWar?`<button class="btn-diplo" onclick="Engine.diplo('${n.id}','trade');UI.renderWorldMap()">📦 Commerce</button>`:''}
        ${atWar?`<button class="btn-diplo" onclick="Engine.diplo('${n.id}','peace');UI.renderWorldMap()">🕊️ Paix</button>`:(n.relation!=='ally'?`<button class="btn-diplo btn-war" onclick="if(confirm('Déclarer la guerre à ${n.name} ?')){Engine.diplo('${n.id}','war');UI.renderWorldMap();}">⚔️ Guerre</button>`:'')}
      </div></div>`;
  }

  /* ───────── CARTE NATIONALE ───────── */
  function renderNational() {
    const s=E.get();
    if (!s.cities.length) { $('nationalBody').innerHTML='<div class="empty-msg">Carte nationale disponible uniquement pour la RDC.</div>'; return; }
    const dots=s.cities.map(c=>{
      const col=c.conflict?'#FF1744':c.capital?'#FFD700':c.mining?'#FF8F00':c.port?'#29B6F6':'#43A047';
      const r=c.capital?9:Math.max(4,Math.min(8,c.pop*1.5));
      return `<circle cx="${c.x}" cy="${c.y}" r="${r}" fill="${col}" stroke="#fff" stroke-width="1.5" style="cursor:pointer" onclick="UI.citySel('${c.id}')"/>
        <text x="${c.x}" y="${c.y-r-3}" text-anchor="middle" font-size="11" fill="#E8E8F0" style="cursor:pointer" onclick="UI.citySel('${c.id}')">${c.name}</text>`;
    }).join('');
    $('nationalBody').innerHTML=`
      <div class="map-wrap">
        <svg viewBox="0 0 600 560" class="world-svg">
          <rect width="600" height="560" fill="#0a1428"/>
          <path d="${RDC_MAP_PATH}" fill="#1c4a2e" stroke="#FFD700" stroke-width="2"/>
          ${dots}
        </svg>
      </div>
      <div class="map-legend"><span>🟡 Capitale</span><span>🟠 Minière</span><span>🔵 Port</span><span>🔴 Conflit</span></div>
      <div id="cityAction"><div class="empty-msg">Touchez une ville.</div></div>`;
    citySel('kinshasa');
  }
  function citySel(id) {
    const s=E.get(); const c=s.cities.find(x=>x.id===id); if(!c) return;
    $('cityAction').innerHTML=`<div class="map-info-card">
      <div class="mic-head">📍 ${c.name} ${c.capital?'⭐':''} ${c.conflict?'<span class="war-badge">⚠️ Conflit</span>':''}</div>
      <div class="stat-row"><span>👥 Population</span><span>${c.pop.toFixed(1)}M hab.</span></div>
      <div class="stat-row"><span>💼 Emploi</span><span>${c.employment.toFixed(0)}%</span></div>${bar(c.employment,'happy-fill')}
      <div class="stat-row"><span>😊 Bonheur</span><span>${c.happiness.toFixed(0)}%</span></div>${bar(c.happiness,'happy-fill')}
      <div class="stat-row"><span>🏗️ Infrastructures</span><span>${c.infra.toFixed(0)}%</span></div>${bar(c.infra,'sec-fill')}
    </div>`;
  }

  /* ───────── AMBASSADES ───────── */
  function renderEmbassies() {
    const s=E.get();
    $('embassyBody').innerHTML = `<div class="stat-row"><span>✈️ Solde migratoire</span><span style="color:${s.immigration>=0?'#43A047':'#C62828'}">${s.immigration>=0?'+':''}${s.immigration.toFixed(2)}/mois</span></div>` +
      s.embassies.map(e=>{
      const v=VISA_LEVELS[e.visaLevel];
      return `<div class="embassy-card">
        <div class="cmp-head"><span>${e.flag} Ambassade — ${e.name}</span><span>${v.emoji} ${v.label}</span></div>
        <div class="stat-row"><span>🤝 Relation</span><span>${e.relation}/100</span></div>${bar(e.relation,'happy-fill')}
        <div class="emb-tags">${e.tradeDeal?'<span class="tag green">📦 Accord commercial</span>':''}${e.militaryCoop?'<span class="tag blue">🛡️ Coop. militaire</span>':''}</div>
        <div class="emb-visa">
          <span class="emb-lbl">Politique de visa :</span>
          ${Object.keys(VISA_LEVELS).map(lv=>`<button class="visa-btn ${e.visaLevel===lv?'active':''}" onclick="Engine.setVisa('${e.id}','${lv}');UI.renderEmbassies()">${VISA_LEVELS[lv].emoji} ${VISA_LEVELS[lv].label}</button>`).join('')}
        </div>
        <div class="nc-actions">
          ${!e.tradeDeal?`<button class="btn-diplo" onclick="Engine.embassyAction('${e.id}','trade');UI.renderEmbassies()">📦 Accord ($30M)</button>`:''}
          <button class="btn-diplo" onclick="Engine.embassyAction('${e.id}','aid');UI.renderEmbassies()">💰 Demander aide</button>
          ${!e.militaryCoop?`<button class="btn-diplo" onclick="Engine.embassyAction('${e.id}','military');UI.renderEmbassies()">🛡️ Coop. mil. ($100M)</button>`:''}
        </div>
      </div>`;
    }).join('');
  }

  /* ───────── MINISTRES ───────── */
  function renderMinisters() {
    const s=E.get();
    $('ministerBody').innerHTML = s.ministers.map(m=>`
      <div class="minister-card">
        <div class="min-head"><span>${m.emoji} ${m.role}</span></div>
        <div class="min-name">${m.name}</div>
        <div class="min-stat"><span>Compétence</span><span class="text-green">${m.competence}%</span></div>${bar(m.competence,'happy-fill')}
        <div class="min-stat"><span>Corruption</span><span class="${m.corruption>40?'text-red':'text-gold'}">${m.corruption}%</span></div>${bar(m.corruption,'sec-fill')}
        <div class="min-stat"><span>Loyauté</span><span class="text-gold">${m.loyalty}%</span></div>${bar(m.loyalty,'happy-fill')}
        <button class="btn-sm btn-sell" style="margin-top:6px" onclick="UI.sackMinister('${m.role.replace(/'/g,'\\\'')}')">Limoger</button>
      </div>`).join('');
  }
  function sackMinister(role) {
    const s=E.get(); const m=s.ministers.find(x=>x.role===role); if(!m) return;
    const names=['Albert Mbuyi','Florence Kasa','Patrick Lumumba','Grace Tshala','Olivier Mabaya','Carine Nzuzi'];
    m.name=names[Math.floor(Math.random()*names.length)];
    m.competence=50+Math.floor(Math.random()*45); m.corruption=10+Math.floor(Math.random()*40); m.loyalty=60+Math.floor(Math.random()*35);
    toast(`👔 Nouveau ${m.role} nommé`,'info'); renderMinisters();
  }

  /* ───────── ARMÉE ───────── */
  function renderArmy() {
    const s=E.get();
    $('ar-forces').innerHTML = `<div class="stat-row"><span>⚔️ Puissance totale</span><span class="text-gold">${E.totalArmyPower().toLocaleString('fr-FR')}</span></div>` +
      ARMY_UNITS.map(u=>`
      <div class="army-card">
        <div class="cmp-head"><span>${u.emoji} ${u.name}</span><span class="text-gold">${(s.army[u.id]||0).toLocaleString('fr-FR')}</span></div>
        <div class="cmp-line">Coût: $${u.cost}M/unité · Puissance ${u.power} · Entretien $${u.upkeep}M/an</div>
        <div class="nc-actions">
          <button class="btn-sm btn-invest" onclick="Engine.buyArmy('${u.id}',${u.id==='soldiers'?1000:u.id==='tanks'?10:1});UI.renderArmy();UI.refresh()">+ Acheter</button>
          <button class="btn-sm btn-invest" onclick="Engine.buyArmy('${u.id}',${u.id==='soldiers'?10000:u.id==='tanks'?50:5});UI.renderArmy();UI.refresh()">+ En masse</button>
        </div>
      </div>`).join('');
    $('ar-budget').innerHTML = `
      ${slider('Budget de défense ($M/an)','defBudget',Math.round(s.defBudget),100,Math.max(2000,Math.floor(s.gdp*0.1)),'M')}
      <div class="stat-row"><span>% du PIB</span><span>${(s.defBudget/s.gdp*100).toFixed(2)}%</span></div>
      <div class="stat-row"><span>🔒 Effet sécurité</span><span class="text-green">+${(s.defBudget/1000).toFixed(1)} pts</span></div>
      <div class="stat-row"><span>⚔️ Conflits actifs</span><span class="${s.wars.length?'text-red':'text-green'}">${s.wars.length}</span></div>`;
    const r=document.querySelector('#ar-budget input[type=range]');
    if(r) r.addEventListener('input',()=>{ $('sv-defBudget').textContent='$'+(+r.value).toLocaleString('fr-FR')+'M'; Engine.setDefBudget(+r.value); });
  }

  /* ───────── INFRASTRUCTURES ───────── */
  function renderInfra() {
    const s=E.get();
    $('infraBody').innerHTML = `
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-card-label">⚡ Énergie</div><div class="stat-card-val">${s.energyCap.toLocaleString('fr-FR')} MW</div></div>
        <div class="stat-card"><div class="stat-card-label">🔌 Électrification</div><div class="stat-card-val">${s.electrRate.toFixed(0)}%</div></div>
        <div class="stat-card"><div class="stat-card-label">🛣️ Routes</div><div class="stat-card-val">${s.roadKm.toLocaleString('fr-FR')} km</div></div>
        <div class="stat-card"><div class="stat-card-label">✈️ Aéroports</div><div class="stat-card-val">${s.airports}</div></div>
      </div>
      <div class="build-grid">${INFRA_PROJECTS.map(p=>{
        const st=s.infra.find(x=>x.id===p.id);
        return `<div class="build-card ${st.built?'built':st.building?'building':''}">
          <div class="bc-emoji">${p.emoji}</div><div class="bc-name">${p.name}</div>
          <div class="bc-cost">💰 $${p.cost}M</div><div class="bc-effect">${p.desc}</div>
          <div class="bc-status">${st.built?'✅ Terminé':st.building?`🏗️ ${st.progress}/${p.days} j`:`⏳ ${p.days} jours`}</div>
          ${!st.built&&!st.building?`<button class="btn-sm btn-invest" style="margin-top:6px" onclick="Engine.buildInfra('${p.id}');UI.renderInfra();UI.refresh()">Construire</button>`:''}
        </div>`;
      }).join('')}</div>`;
  }

  /* ───────── SPORTS ───────── */
  function renderSports() {
    const s=E.get();
    $('sp-stadiums').innerHTML = s.stadiums.map(st=>`
      <div class="build-card-wide ${st.built?'built':st.building?'building':''}">
        <div class="cmp-head"><span>${st.emoji} ${st.name}</span><span>${st.built?'✅':st.building?`🏗️ ${st.progress||0}/180j`:''}</span></div>
        <div class="cmp-line">📍 ${st.city} · 🪑 ${st.capacity.toLocaleString('fr-FR')} places · 💰 $${st.cost}M</div>
        ${!st.built&&!st.building?`<button class="btn-sm btn-invest" style="margin-top:6px" onclick="Engine.buildStadium('${st.id}');UI.renderSports();UI.refresh()">Construire</button>`:''}
      </div>`).join('');
    $('sp-disc').innerHTML = s.sports.map(sp=>`
      <div class="sport-card">
        <div class="cmp-head"><span>${sp.emoji} ${sp.name}</span><span class="stars">${stars(sp.level/20)}</span></div>
        <div class="cmp-line">Niveau ${Math.round(sp.level)}/100 · Budget $${Math.round(sp.budget)}M</div>
        <div class="nc-actions"><button class="btn-sm btn-invest" onclick="Engine.fundSport('${sp.id}',50);UI.renderSports();UI.refresh()">+$50M</button><button class="btn-sm btn-invest" onclick="Engine.fundSport('${sp.id}',150);UI.renderSports();UI.refresh()">+$150M</button></div>
      </div>`).join('');
    $('sp-events').innerHTML = (s.activeSportEvents.length?`<div class="rdc-badge">🔴 EN COURS : ${s.activeSportEvents.map(e=>e.emoji+' '+e.name+' ('+e.daysLeft+'j)').join(', ')}</div>`:'') +
      SPORT_EVENTS.map(e=>`
      <div class="build-card-wide">
        <div class="cmp-head"><span>${e.emoji} ${e.name}</span><span class="text-gold">$${e.cost}M</span></div>
        <div class="cmp-line">😊 Bonheur +${e.happiness} · 🏖️ Tourisme +${e.tourism} · ⭐ Prestige +${e.prestige}</div>
        <button class="btn-sm btn-invest" style="margin-top:6px" onclick="Engine.hostSportEvent('${e.id}');UI.renderSports();UI.refresh()">Organiser</button>
      </div>`).join('');
  }

  /* ───────── ÉLECTIONS ───────── */
  function renderElections() {
    const s=E.get();
    if (!s.electionDate) { $('electionBody').innerHTML='<div class="empty-msg">Régime sans élection présidentielle.</div>'; return; }
    const days=Math.max(0,Math.ceil((s.electionDate-s.date)/86400000));
    const poll=Math.floor(40+s.happiness*0.4+s.prestige*0.1);
    $('electionBody').innerHTML=`
      <div class="election-hero">
        <div class="eh-icon">🗳️</div>
        <div class="eh-title">Élection présidentielle</div>
        <div class="eh-date">${E.fmtDate(s.electionDate)}</div>
        <div class="eh-sub">dans ${days.toLocaleString('fr-FR')} jours · Mandat ${s.mandat}</div>
      </div>
      <div class="stat-row"><span>📊 Intentions de vote (estimé)</span><span class="${poll>50?'text-green':'text-red'}">${poll}%</span></div>${bar(poll,'happy-fill')}
      <div class="stat-row"><span>⭐ Prestige</span><span>${s.prestige.toFixed(0)}/100</span></div>
      <h4 class="sec-h">Campagne électorale</h4>
      <button class="btn-sm btn-invest" style="width:100%;margin-bottom:6px" onclick="UI.campaign('meeting')">🎤 Organiser un meeting (-$80M, +popularité)</button>
      <button class="btn-sm btn-invest" style="width:100%;margin-bottom:6px" onclick="UI.campaign('media')">📺 Campagne médiatique (-$150M, +prestige)</button>
      <button class="btn-sm btn-invest" style="width:100%" onclick="UI.campaign('party')">🏛️ Financer le parti (-$200M, +intentions)</button>`;
  }
  function campaign(type) {
    const s=E.get();
    const cost={meeting:80,media:150,party:200}[type];
    if(s.treasury<cost){ toast('Fonds insuffisants','error'); return; }
    s.treasury-=cost;
    if(type==='meeting') s.happiness=Math.min(100,s.happiness+4);
    if(type==='media') s.prestige=Math.min(100,s.prestige+6);
    if(type==='party'){ s.happiness=Math.min(100,s.happiness+3); s.prestige=Math.min(100,s.prestige+3); }
    toast('🎉 Action de campagne effectuée','success'); renderElections(); refresh();
  }

  /* ───────── RÉSEAU SOCIAL ───────── */
  function renderSocial() {
    const s=E.get();
    $('socialBody').innerHTML = `<div class="social-head">📱 CongoX — Réseau social national</div>` +
      (s.socialFeed.length?s.socialFeed.map(p=>`
      <div class="tweet ${p.sentiment>0?'pos':p.sentiment<0?'neg':''}">
        <div class="tw-top"><span class="tw-user">${p.user}</span><span class="tw-date">${p.date}</span></div>
        <div class="tw-text">${p.text}</div>
        <div class="tw-meta">💬 ${Math.floor(p.likes/8)} &nbsp; 🔁 ${p.reposts} &nbsp; ❤️ ${p.likes}</div>
      </div>`).join(''):'<div class="empty-msg">Pas encore de publications.</div>');
  }

  /* ───────── ACTUALITÉS ───────── */
  function renderNews() {
    const s=E.get();
    $('newsLocal').innerHTML = s.newsLocal.slice(0,8).map(n=>`<div class="news-item">${n.text}<div class="news-date">📅 ${n.date}</div></div>`).join('')||'<div class="empty-msg">—</div>';
    $('newsWorld').innerHTML = s.newsWorld.slice(0,8).map(n=>`<div class="news-item">${n.text}<div class="news-date">📅 ${n.date}</div></div>`).join('')||'<div class="empty-msg">—</div>';
  }

  /* ───────── ONU ───────── */
  function renderUN() {
    const s=E.get();
    $('unBody').innerHTML = `<div class="rdc-badge">🇺🇳 Conseil de Sécurité — Votes internationaux</div>` +
      UN_RESOLUTIONS.map(r=>{
        const voted=s.unResolutionsVoted.includes(r.id);
        return `<div class="un-card">
          <div class="un-title">${r.title}</div>
          <div class="un-desc">${r.desc}</div>
          ${voted?'<div class="un-voted">✅ Vote enregistré</div>':`<div class="nc-actions">
            <button class="btn-sm btn-buy" onclick="Engine.unVote('${r.id}','yes');UI.renderUN();UI.refresh()">✅ POUR</button>
            <button class="btn-sm btn-sell" onclick="Engine.unVote('${r.id}','no');UI.renderUN();UI.refresh()">❌ CONTRE</button>
          </div>`}
        </div>`;
      }).join('');
  }

  /* ───────── ÉVÉNEMENTS / TOASTS ───────── */
  function showEvent(ev) {
    $('evIcon').textContent=ev.icon; $('evTitle').textContent=ev.title; $('evDesc').textContent=ev.desc;
    $('evChoices').innerHTML=ev.choices.map((c,i)=>`<button class="event-choice" onclick="UI.ev(${i})">${c.label}</button>`).join('');
    $('eventOverlay').classList.remove('hidden'); $('eventOverlay')._ev=ev;
  }
  function hideEvent(){ $('eventOverlay').classList.add('hidden'); }
  function ev(i){ const e=$('eventOverlay')._ev; const s=E.get(); if(s&&s.gameOver){ location.reload(); return; } E.resolveEvent(e,i); }

  function toast(msg,type) {
    const el=$('alertBanner'); el.classList.remove('hidden'); $('alertText').textContent=msg;
    el.style.background = type==='error'?'linear-gradient(135deg,#C62828,#B71C1C)':type==='success'?'linear-gradient(135deg,#2E7D32,#1B5E20)':'linear-gradient(135deg,#E65100,#BF360C)';
    clearTimeout(el._t); el._t=setTimeout(()=>el.classList.add('hidden'),3000);
  }
  function badge(app,count){ const el=$('badge-'+app); if(!el)return; if(count>0){el.textContent=count>9?'9+':count;el.classList.remove('hidden');}else el.classList.add('hidden'); }

  function renderAll() {
    refresh(); renderCabinet(); renderEconomy(); renderResources(); renderCompanies();
    renderTrade(); renderEmbassies(); renderMinisters(); renderArmy(); renderInfra();
    renderSports(); renderElections(); renderSocial(); renderNews(); renderUN();
  }

  document.addEventListener('DOMContentLoaded', runSplash);

  return {
    refresh, toast, badge, showEvent, hideEvent, ev,
    renderCabinet, renderEconomy, renderResources, renderCompanies, renderTrade,
    renderWorldMap, renderNational, renderEmbassies, renderMinisters, renderArmy,
    renderInfra, renderSports, renderElections, renderSocial, renderNews, renderUN,
    cab, coTypeChange, coPreview, createCompany, trPreview, signContract,
    mapZoom, mapReset, mapSel, citySel, sackMinister, campaign
  };
})();
