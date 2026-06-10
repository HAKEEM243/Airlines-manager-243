/* ===== UI CONTROLLER — Hakvision Aircraft ===== */
const UI = {
  currentTab: null,
  currentModal: null,

  /* ===== HEADER ===== */
  updateHeader() {
    if (!GS.company) return;
    const fmt = n => {
      const s = n < 0 ? '-' : '';
      const a = Math.abs(n);
      if (a >= 1e9) return s + '$' + (a/1e9).toFixed(2) + 'B';
      if (a >= 1e6) return s + '$' + (a/1e6).toFixed(2) + 'M';
      if (a >= 1e3) return s + '$' + Math.round(a/1e3) + 'K';
      return s + '$' + Math.round(a).toLocaleString();
    };
    document.getElementById('hdr-cname').textContent = GS.company.name;
    document.getElementById('hdr-iata').textContent = GS.company.iata;
    const cashEl = document.getElementById('h-cash');
    cashEl.textContent = fmt(GS.finances.balance);
    cashEl.style.color = GS.finances.balance < 0 ? 'var(--red)' : 'var(--txt)';
    document.getElementById('h-rep').textContent = `${Math.round(GS.company.reputation)}/100`;
    document.getElementById('h-fleet').textContent = GS.fleet.length;
    document.getElementById('h-routes').textContent = GS.routes.filter(r=>r.status==='active').length;
    const d = GS.gameDate;
    const months = ['Janv','Févr','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'];
    document.getElementById('h-date').textContent = `${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  /* ===== TABS / PANELS ===== */
  openPanel(tab) {
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    this.currentTab = tab;
    const panel = document.getElementById('panel');
    panel.classList.remove('hidden');
    const titleMap = {
      fleet: '✈ Gestion de Flotte',
      routes: '🗺 Planification des Routes',
      company: '🏢 Compagnie & Finances',
      dashboard: '📊 Dashboard KPI',
      admin: '⚡ Console Admin',
    };
    document.getElementById('panel-title').textContent = titleMap[tab] || tab;
    const body = document.getElementById('panel-body');
    body.innerHTML = '';
    switch (tab) {
      case 'fleet': this.renderFleet(body); break;
      case 'routes': this.renderRoutes(body); break;
      case 'company': this.renderCompany(body); break;
      case 'dashboard': this.renderDashboard(body); break;
      case 'admin': this.renderAdmin(body); break;
    }
  },

  closePanel() {
    document.getElementById('panel').classList.add('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    this.currentTab = null;
  },

  refreshPanel() {
    if (this.currentTab) this.openPanel(this.currentTab);
  },

  /* ===== FLEET PANEL ===== */
  renderFleet(body) {
    let activeTab = GS.fleet.length === 0 ? 'market' : 'owned';
    const render = () => {
      body.innerHTML = `
        <div class="fleet-tabs">
          <button class="fleet-tab ${activeTab==='owned'?'active':''}" data-ft="owned">Mes Appareils (${GS.fleet.length})</button>
          <button class="fleet-tab ${activeTab==='market'?'active':''}" data-ft="market">Marché ✈</button>
          <button class="fleet-tab ${activeTab==='custom'?'active':''}" data-ft="custom">Custom</button>
        </div>
        <div id="fleet-content"></div>
      `;
      body.querySelectorAll('.fleet-tab').forEach(btn => {
        btn.addEventListener('click', () => { activeTab = btn.dataset.ft; render(); });
      });
      const content = document.getElementById('fleet-content');
      if (activeTab === 'owned') this.renderOwnedFleet(content);
      else if (activeTab === 'market') this.renderMarket(content);
      else this.renderCustomEditor(content);
    };
    render();
  },

  renderOwnedFleet(container) {
    if (!GS.fleet.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="es-icon">✈</div>
          <p>Votre flotte est vide.</p>
          <p style="margin-top:8px;font-size:12px;color:var(--txt-dim)">Allez dans l'onglet <strong style="color:var(--cyan)">Marché</strong> pour acheter votre premier appareil.<br>Capital disponible : <strong style="color:var(--gold)">${GS.getBalanceFormatted()}</strong></p>
        </div>`;
      return;
    }
    container.innerHTML = GS.fleet.map(ac => {
      const model = getAircraftModel(ac.modelId);
      const statusLabel = { flying:'En vol','ground':'Au sol',maintenance:'Maintenance',assigned:'Assigné',available:'Disponible' };
      const statusColors = { flying:'var(--green)',ground:'var(--txt-muted)',maintenance:'var(--orange)',assigned:'var(--cyan)',available:'var(--txt-dim)' };
      return `<div class="aircraft-card" data-acid="${ac.id}">
        <div class="ac-card-row1">
          <div>
            <div class="ac-card-name">${ac.name}</div>
            <div class="ac-card-model">${model ? model.name : ac.modelId} · ${model ? model.manufacturer : ''}</div>
          </div>
          <div class="ac-card-status">
            <div class="status-dot ${ac.status}"></div>
            <span style="font-size:10px;color:${statusColors[ac.status]||'var(--txt-dim)'}">${statusLabel[ac.status]||ac.status}</span>
          </div>
        </div>
        <div class="ac-card-stats">
          <span>🛣 ${model ? model.range+'km' : '-'}</span>
          <span>👤 ${model ? model.paxCapacity+' PAX' : '-'}</span>
          <span>🔧 ${Math.round(ac.condition||100)}%</span>
          ${(typeof Maintenance!=='undefined' && Maintenance.getStatus(ac)?.due) ? `<span class="text-red" title="Maintenance en retard">🔧 À réviser</span>` : ''}
          ${ac.flightId ? `<span class="text-cyan">✈ ${ac.flightId}</span>` : ''}
        </div>
        ${ac.status==='flying' ? `<div style="margin-top:6px;"><div class="progress-bar"><div class="progress-fill fill-cyan" style="width:${Math.round((ac.progress||0)*100)}%"></div></div><div style="font-size:10px;color:var(--txt-dim);margin-top:2px;">${FlightEngine.getPhaseLabel(ac.phase)} · ${Math.round((ac.progress||0)*100)}%</div></div>` : ''}
      </div>`;
    }).join('');
    container.querySelectorAll('.aircraft-card').forEach(card => {
      card.addEventListener('click', () => {
        const ac = GS.getAircraft(parseInt(card.dataset.acid));
        if (ac) this.showAircraftDetail(ac);
      });
    });
  },

  showAircraftDetail(aircraft) {
    const model = getAircraftModel(aircraft.modelId);
    if (!model) return;
    const sellPrice = getSellPrice(model, aircraft.ageHours ? Math.round(aircraft.ageHours / 720) : 0);
    this.showModal(`${model.name} — Détail`, `
      <div class="ac-detail-header">
        <div class="ac-detail-icon">${model.icon}</div>
        <div class="ac-detail-title">
          <h4>${aircraft.name}</h4>
          <p>${model.manufacturer} · ${model.name}</p>
          <p style="margin-top:4px">${this.makeStars(model.comfortLevel)}</p>
        </div>
      </div>
      <div class="ac-detail-grid">
        <div class="ac-detail-stat"><div class="lbl">Autonomie</div><div class="val">${model.range.toLocaleString()} km</div></div>
        <div class="ac-detail-stat"><div class="lbl">Vitesse croisière</div><div class="val">${model.cruiseSpeed} km/h</div></div>
        <div class="ac-detail-stat"><div class="lbl">Capacité PAX</div><div class="val">${model.paxCapacity}</div></div>
        <div class="ac-detail-stat"><div class="lbl">Cargo</div><div class="val">${model.cargoCapacity} t</div></div>
        <div class="ac-detail-stat"><div class="lbl">Carburant/h</div><div class="val">${model.fuelBurnPerHour.toLocaleString()} L</div></div>
        <div class="ac-detail-stat"><div class="lbl">Maintenance/h</div><div class="val">$${model.maintenanceCostPerHour.toLocaleString()}</div></div>
      </div>
      <div class="ac-condition-bar">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--txt-dim);margin-bottom:4px;">
          <span>État technique</span><span>${Math.round(aircraft.condition||100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${(aircraft.condition||100) > 60 ? 'fill-green' : 'fill-gold'}" style="width:${Math.round(aircraft.condition||100)}%"></div>
        </div>
      </div>
      <div style="font-size:12px;color:var(--txt-dim);margin-bottom:8px;">Heures de vol : ${Math.round(aircraft.ageHours||0)} h</div>
      ${this.buildMaintenanceBlock(aircraft)}
      <div class="ac-actions">
        ${aircraft.status === 'ground' || aircraft.status === 'available' ? `<button class="btn-primary btn-sm" id="btn-assign">Assigner une route</button>` : ''}
        <button class="btn-danger btn-sm" id="btn-sell">Revendre ($${sellPrice.toLocaleString()})</button>
      </div>
    `, []);
    this.bindMaintenanceButtons(aircraft);
    document.getElementById('btn-sell')?.addEventListener('click', () => {
      if (aircraft.status === 'flying') { this.notify('Impossible de vendre un appareil en vol.','error'); return; }
      GS.addToBalance(sellPrice, 'fleet', `Vente ${aircraft.name}`);
      const idx = GS.fleet.findIndex(a => a.id === aircraft.id);
      if (idx !== -1) GS.fleet.splice(idx, 1);
      if (aircraft.routeId) RouteEngine.removeRoute(aircraft.routeId);
      this.closeModal();
      this.refreshPanel();
      this.notify(`${aircraft.name} revendu pour $${sellPrice.toLocaleString()}.`, 'success');
    });
    document.getElementById('btn-assign')?.addEventListener('click', () => {
      this.closeModal();
      this.openPanel('routes');
    });
  },

  buildMaintenanceBlock(aircraft) {
    if (typeof Maintenance === 'undefined') return '';
    const st = Maintenance.getStatus(aircraft);
    if (!st) return '';
    const pct = Math.min(100, Math.round((st.sinceHours / st.interval) * 100));
    const statusCls = st.due ? 'mnt-due' : pct > 75 ? 'mnt-soon' : 'mnt-ok';
    const statusTxt = st.due ? `⚠ ${st.label} EN RETARD` : pct > 75 ? `${st.label} bientôt` : `${st.label} OK`;
    const canDo = aircraft.status !== 'flying';
    return `
      <div class="mnt-block">
        <div class="mnt-head">
          <span class="mnt-title">🔧 Maintenance</span>
          <span class="mnt-badge ${statusCls}">${statusTxt}</span>
        </div>
        <div class="mnt-bar"><div class="mnt-bar-fill ${statusCls}" style="width:${pct}%"></div></div>
        <div class="mnt-info">${st.desc} · ${st.due ? `en retard de ${st.sinceHours - st.interval} h` : `dans ${st.remainingHours} h`}</div>
        ${st.due && !canDo ? `<div class="mnt-warn">L'appareil doit être au sol pour la maintenance.</div>` : ''}
        ${canDo ? `<div class="mnt-actions">
          <button class="mnt-btn ${st.dueA||st.due?'urgent':''}" data-check="A">Check A · $${(getAircraftModel(aircraft.modelId).purchasePrice*0.004/1000).toFixed(0)}K</button>
          <button class="mnt-btn ${st.dueC?'urgent':''}" data-check="C">Check C · $${(getAircraftModel(aircraft.modelId).purchasePrice*0.02/1e6).toFixed(2)}M</button>
          <button class="mnt-btn ${st.dueD?'urgent':''}" data-check="D">Check D · $${(getAircraftModel(aircraft.modelId).purchasePrice*0.06/1e6).toFixed(2)}M</button>
        </div>` : ''}
      </div>`;
  },

  bindMaintenanceButtons(aircraft) {
    document.querySelectorAll('.mnt-btn[data-check]').forEach(btn => {
      btn.addEventListener('click', () => {
        const result = Maintenance.performCheck(aircraft, btn.dataset.check);
        if (result.error) { this.notify(result.error, 'error'); return; }
        this.notify(`${Maintenance.CHECKS[btn.dataset.check].label} effectué sur ${aircraft.name} ($${result.cost.toLocaleString()}).`, 'success');
        this.closeModal();
        this.showAircraftDetail(aircraft);
        this.updateHeader();
      });
    });
  },

  renderMarket(container) {
    const categories = [
      { id: 'all', label: 'Tous' }, { id: 'turboprop', label: 'Turboprop' },
      { id: 'regional_jet', label: 'Régional' }, { id: 'narrowbody', label: 'Court-courrier' },
      { id: 'widebody', label: 'Long-courrier' }, { id: 'cargo', label: 'Cargo' }, { id: 'supersonic', label: 'Supersonique' },
    ];
    let filter = 'all';
    const render = () => {
      const models = filter === 'all' ? AIRCRAFT_MODELS : AIRCRAFT_MODELS.filter(m => m.category === filter);
      container.innerHTML = `
        <input class="search-input" id="mkt-search" placeholder="Rechercher un appareil…">
        <div class="filter-bar">${categories.map(c => `<button class="filter-btn ${filter===c.id?'active':''}" data-cat="${c.id}">${c.label}</button>`).join('')}</div>
        <div id="mkt-list">${this.buildMarketList(models)}</div>
      `;
      container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => { filter = btn.dataset.cat; render(); });
      });
      document.getElementById('mkt-search')?.addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        const filtered = (filter==='all' ? AIRCRAFT_MODELS : AIRCRAFT_MODELS.filter(m=>m.category===filter))
          .filter(m => m.name.toLowerCase().includes(q) || m.manufacturer.toLowerCase().includes(q));
        document.getElementById('mkt-list').innerHTML = this.buildMarketList(filtered);
        this.bindMarketButtons(container);
      });
      this.bindMarketButtons(container);
    };
    render();
  },

  buildMarketList(models) {
    if (!models.length) return '<div class="empty-state"><div class="es-icon">🔍</div><p>Aucun appareil trouvé.</p></div>';
    const catLabel = { turboprop:'Turbopropulseur', regional_jet:'Jet Régional', narrowbody:'Court-courrier', widebody:'Long-courrier', cargo:'Cargo', supersonic:'Supersonique' };
    const canAfford = m => GS.finances.balance >= m.purchasePrice;
    return models.map(m => {
      const hasRating = typeof TypeRatings !== 'undefined' ? TypeRatings.hasAnyQualifiedPilot(m.id) : true;
      const famId = typeof TypeRatings !== 'undefined' ? TypeRatings.getFamilyForModel(m.id) : null;
      const famName = famId && TypeRatings.FAMILIES[famId] ? TypeRatings.FAMILIES[famId].name : '';
      return `
      <div class="mac-v2" data-macid="${m.id}">
        <div class="mac-v2-illustration">
          ${typeof getAircraftImage === 'function' ? getAircraftImage(m.category) : ''}
          ${!hasRating ? `<div class="mac-v2-lock-overlay" style="background:rgba(200,140,0,0.88)"><div class="mac-v2-lock-ico">🎓</div><div class="mac-v2-lock-txt">Qualification pilote requise</div></div>` : ''}
        </div>
        <div class="mac-v2-body">
          <div class="mac-v2-top">
            <div class="mac-v2-title-block">
              <div class="mac-v2-name">${m.name}</div>
              <div class="mac-v2-maker">${m.manufacturer} <span class="mac-v2-cat">${catLabel[m.category] || m.category}</span></div>
            </div>
            <div class="mac-v2-price-block">
              <div class="mac-v2-price">$${(m.purchasePrice/1e6).toFixed(1)}M</div>
              <div class="mac-v2-lease-price">${Math.round(m.purchasePrice*0.002/1000)}K/mois</div>
            </div>
          </div>
          <div class="mac-v2-specs">
            <div class="mac-v2-spec">
              <div class="mac-v2-spec-val">${m.paxCapacity}</div>
              <div class="mac-v2-spec-lbl">PAX</div>
            </div>
            <div class="mac-v2-spec">
              <div class="mac-v2-spec-val">${m.range.toLocaleString()}</div>
              <div class="mac-v2-spec-lbl">km</div>
            </div>
            <div class="mac-v2-spec">
              <div class="mac-v2-spec-val">${m.cruiseSpeed}</div>
              <div class="mac-v2-spec-lbl">km/h</div>
            </div>
            <div class="mac-v2-spec">
              <div class="mac-v2-spec-val">${(m.fuelBurnPerHour/1000).toFixed(1)}k</div>
              <div class="mac-v2-spec-lbl">L/h</div>
            </div>
            <div class="mac-v2-spec">
              <div class="mac-v2-spec-val">${m.comfortLevel}<span style="font-size:10px">/10</span></div>
              <div class="mac-v2-spec-lbl">Confort</div>
            </div>
          </div>
          <p class="mac-v2-desc">${m.description}</p>
          <div class="mac-v2-actions">
            ${!hasRating ? `<div style="font-size:11px;color:var(--gold);margin-bottom:6px">🎓 Qualifiez un pilote ${famName} pour exploiter cet appareil</div>` : ''}
            <button class="mac-v2-btn-buy ${canAfford(m)?'':'mac-v2-btn-disabled'}" data-buy="${m.id}" ${canAfford(m)?'':'disabled'}>
              <span>✈</span> Acheter
            </button>
            <button class="mac-v2-btn-lease" data-lease="${m.id}">
              <span>📋</span> Louer
            </button>
          </div>
        </div>
      </div>
    `;}).join('');
  },

  bindMarketButtons(container) {
    container.querySelectorAll('[data-buy]').forEach(btn => {
      btn.addEventListener('click', () => this.buyAircraft(btn.dataset.buy, false));
    });
    container.querySelectorAll('[data-lease]').forEach(btn => {
      btn.addEventListener('click', () => this.buyAircraft(btn.dataset.lease, true));
    });
  },

  buyAircraft(modelId, lease) {
    const model = getAircraftModel(modelId);
    if (!model) return;
    const cost = lease ? Math.round(model.purchasePrice * 0.002) : model.purchasePrice;
    if (!lease && GS.finances.balance < cost) {
      this.notify('Fonds insuffisants.', 'error'); return;
    }
    this.showModal(`${lease?'Louer':'Acheter'} — ${model.name}`,`
      <div style="text-align:center;padding:0 0 12px">
        <div style="width:100%;height:120px;background:#08111f;border-radius:10px;overflow:hidden;margin-bottom:14px">${typeof getAircraftImage === 'function' ? getAircraftImage(model.category) : ''}</div>
        <div style="font-size:18px;font-weight:700;color:#fff;margin-bottom:4px">${model.name}</div>
        <div style="font-size:13px;color:var(--txt-dim);margin-bottom:20px">${model.manufacturer}</div>
        <div class="card-grid" style="margin-bottom:20px">
          <div class="kpi-card"><div class="kpi-label">Coût</div><div class="kpi-value">$${cost.toLocaleString()}</div></div>
          <div class="kpi-card"><div class="kpi-label">Capital restant</div><div class="kpi-value ${GS.finances.balance-cost<0?'negative':''}">${GS.getBalanceFormatted()}</div></div>
        </div>
        <div class="fg"><label>Nom de l'appareil</label><input type="text" id="inp-acname" value="${GS.company.iata}-${(GS.fleet.length+1).toString().padStart(3,'0')}" style="width:100%;background:var(--bg-dark);border:1px solid var(--border);border-radius:6px;color:var(--txt);padding:10px;font-size:14px;font-family:var(--font-body)"></div>
      </div>
    `,[
      { label: 'Annuler', cls: 'btn-ghost', action: () => this.closeModal() },
      { label: lease ? '📋 Confirmer la location' : '✈ Confirmer l\'achat', cls: 'btn-primary', action: () => {
        const name = document.getElementById('inp-acname')?.value || model.name;
        if (!lease) GS.addToBalance(-cost, 'fleet', `Achat ${name}`);
        const ac = {
          id: GS.genId(),
          modelId: model.id,
          name,
          status: 'available',
          condition: 100,
          ageHours: 0,
          routeId: null,
          flightId: null,
          phase: 'ground',
          progress: 0,
          lat: getAirport(GS.company.hub)?.lat || 0,
          lon: getAirport(GS.company.hub)?.lon || 0,
          heading: 90,
          passengers: 0,
          currentAlt: 0,
          currentSpeed: 0,
          leased: lease,
          leaseCost: lease ? cost : 0,
        };
        GS.fleet.push(ac);
        this.closeModal();
        this.refreshPanel();
        this.notify(`${name} ajouté à votre flotte !`, 'success');
        if (GS.company) GS.addReputation(0.5);
      }},
    ]);
  },

  renderCustomEditor(container) {
    const baseModels = AIRCRAFT_MODELS.filter(m => m.category !== 'cargo' && m.category !== 'supersonic');
    let selectedBase = baseModels[0];
    let customData = {
      name: 'Mon Appareil',
      speed: selectedBase.cruiseSpeed,
      pax: selectedBase.paxCapacity,
      color: '#00d4ff',
      logo: '✈',
    };
    const render = () => {
      container.innerHTML = `
        <div class="section-title">Éditeur d'Appareil Personnalisé</div>
        <div class="ce-preview" id="ce-preview">${this.buildCustomPreview(selectedBase, customData)}</div>
        <div class="ce-controls">
          <div class="ce-field">
            <label>Modèle de base</label>
            <select id="ce-base">${baseModels.map(m=>`<option value="${m.id}" ${m.id===selectedBase.id?'selected':''}>${m.name}</option>`).join('')}</select>
          </div>
          <div class="ce-field">
            <label>Nom de l'appareil</label>
            <input type="text" id="ce-name" value="${customData.name}" maxlength="30">
          </div>
          <div class="ce-field">
            <label>Vitesse croisière : <span id="ce-speed-val" class="range-val">${customData.speed} km/h</span></label>
            <div class="row">
              <input type="range" id="ce-speed" min="${Math.round(selectedBase.cruiseSpeed*0.85)}" max="${Math.round(selectedBase.cruiseSpeed*1.0)}" value="${customData.speed}" step="5">
            </div>
          </div>
          <div class="ce-field">
            <label>Capacité PAX : <span id="ce-pax-val" class="range-val">${customData.pax}</span></label>
            <input type="range" id="ce-pax" min="${Math.round(selectedBase.paxCapacity*0.7)}" max="${Math.round(selectedBase.paxCapacity*1.0)}" value="${customData.pax}" step="1">
          </div>
          <div class="ce-field">
            <label>Couleur principale de la livrée</label>
            <div class="row">
              <input type="color" id="ce-color" value="${customData.color}">
              <span style="font-size:12px;color:var(--txt-dim);margin-left:8px">Couleur dominante</span>
            </div>
          </div>
          <div class="ce-field">
            <label>Logo sur la dérive</label>
            <input type="text" id="ce-logo" value="${customData.logo}" maxlength="2">
          </div>
          <div style="margin-top:4px;font-size:11px;color:var(--txt-muted)">Coût : $${Math.round(selectedBase.purchasePrice*1.08).toLocaleString()} (+8% personnalisation)</div>
          <button class="btn-primary w100 mt2" id="btn-build-custom">Construire cet appareil</button>
        </div>
      `;
      const updatePreview = () => {
        document.getElementById('ce-preview').innerHTML = this.buildCustomPreview(selectedBase, customData);
      };
      document.getElementById('ce-base').addEventListener('change', e => {
        selectedBase = getAircraftModel(e.target.value);
        customData.speed = selectedBase.cruiseSpeed;
        customData.pax = selectedBase.paxCapacity;
        render();
      });
      document.getElementById('ce-name').addEventListener('input', e => { customData.name = e.target.value; updatePreview(); });
      document.getElementById('ce-speed').addEventListener('input', e => {
        customData.speed = parseInt(e.target.value);
        document.getElementById('ce-speed-val').textContent = customData.speed + ' km/h';
        updatePreview();
      });
      document.getElementById('ce-pax').addEventListener('input', e => {
        customData.pax = parseInt(e.target.value);
        document.getElementById('ce-pax-val').textContent = customData.pax;
        updatePreview();
      });
      document.getElementById('ce-color').addEventListener('input', e => { customData.color = e.target.value; updatePreview(); });
      document.getElementById('ce-logo').addEventListener('input', e => { customData.logo = e.target.value; updatePreview(); });
      document.getElementById('btn-build-custom').addEventListener('click', () => {
        const cost = Math.round(selectedBase.purchasePrice * 1.08);
        if (GS.finances.balance < cost) { this.notify('Fonds insuffisants.','error'); return; }
        GS.addToBalance(-cost, 'fleet', `Custom ${customData.name}`);
        const customModel = { ...selectedBase, id: 'custom_' + GS.genId(), name: customData.name, cruiseSpeed: customData.speed, paxCapacity: customData.pax, icon: customData.logo, custom: true };
        AIRCRAFT_MODELS.push(customModel);
        AIRCRAFT_MAP[customModel.id] = customModel;
        const ac = {
          id: GS.genId(), modelId: customModel.id, name: customData.name,
          status: 'available', condition: 100, ageHours: 0,
          routeId: null, flightId: null, phase: 'ground', progress: 0,
          lat: getAirport(GS.company.hub)?.lat||0, lon: getAirport(GS.company.hub)?.lon||0,
          heading: 90, passengers: 0, currentAlt: 0, currentSpeed: 0,
          customColor: customData.color, leased: false,
        };
        GS.fleet.push(ac);
        this.notify(`Appareil personnalisé "${customData.name}" construit !`, 'success');
        this.openPanel('fleet');
      });
    };
    render();
  },

  buildCustomPreview(model, custom) {
    const color = custom.color || '#00d4ff';
    const logo = custom.logo || '✈';
    return `<svg width="200" height="80" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="50" rx="85" ry="8" fill="${color}" opacity="0.2"/>
      <path d="M30,48 L120,40 L170,45 L120,52 L30,48Z" fill="${color}" opacity="0.9"/>
      <path d="M100,40 L120,25 L130,28 L110,44Z" fill="${color}"/>
      <path d="M100,52 L120,65 L130,62 L110,48Z" fill="${color}" opacity="0.8"/>
      <path d="M30,48 L45,42 L45,54Z" fill="${color}" opacity="0.7"/>
      <text x="75" y="51" fill="white" font-size="12" text-anchor="middle" font-family="Orbitron">${logo}</text>
      <text x="100" y="78" fill="rgba(255,255,255,0.6)" font-size="9" text-anchor="middle" font-family="Space Grotesk">${custom.name || model.name}</text>
      <text x="100" y="15" fill="${color}" font-size="10" text-anchor="middle" font-family="Space Grotesk">${custom.pax} PAX · ${custom.speed} km/h</text>
    </svg>`;
  },

  /* ===== QUICK ROUTE FROM MAP (Airline-Manager style) ===== */
  quickRouteTo(destIata) {
    if (!GS.company) return;
    const hub = getAirport(GS.company.hub);
    const dest = getAirport(destIata);
    if (!hub || !dest) return;
    const dist = calcDistance(hub, dest);

    // Find an available aircraft that can fly this distance
    const available = GS.fleet.filter(a =>
      (a.status === 'available' || a.status === 'ground')
    );
    const flyable = available.filter(a => {
      const m = getAircraftModel(a.modelId);
      return m && canFlyRoute(m, dist);
    });

    const info = RouteEngine.getRouteInfo(GS.company.hub, destIata);
    const demand = info ? info.demand : 0;

    if (!flyable.length) {
      const reason = available.length
        ? `Aucun de vos appareils disponibles n'a l'autonomie pour ${dist.toLocaleString()} km.`
        : `Vous n'avez aucun appareil disponible.`;
      this.showModal(`Route ${GS.company.hub} → ${destIata}`, `
        <div style="text-align:center;padding:10px 0">
          <div style="font-size:40px;margin-bottom:10px">🛫</div>
          <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:6px">${hub.city} → ${dest.city}</div>
          <div style="font-size:12px;color:var(--txt-dim);margin-bottom:14px">Distance : ${dist.toLocaleString()} km · Demande : ${demand.toLocaleString()} PAX/j</div>
          <div style="background:rgba(255,107,53,0.1);border:1px solid rgba(255,107,53,0.3);border-radius:var(--radius);padding:12px;font-size:12px;color:var(--orange)">${reason}</div>
        </div>
      `, [
        { label: '✈ Aller au Marché', cls: 'btn-primary', action: () => { this.closeModal(); this.openPanel('fleet'); } },
        { label: 'Fermer', cls: 'btn-ghost', action: () => this.closeModal() },
      ]);
      return;
    }

    // Pick the best-fit aircraft (smallest range that still works → efficiency)
    flyable.sort((a, b) => getAircraftModel(a.modelId).range - getAircraftModel(b.modelId).range);
    const ac = flyable[0];
    const model = getAircraftModel(ac.modelId);

    // Build a temporary route preview to estimate profit
    const tmpRoute = {
      origin: GS.company.hub, destination: destIata,
      aircraftModelId: ac.modelId,
      loadFactor: RouteEngine.estimateLoadFactor(dist, demand, model, GS.company.service.level),
      cabinConfig: { economy: 0.80, premeco: 0.12, business: 0.06, first: 0.02 },
    };
    const profit = Economy.calcRouteProfit(tmpRoute);

    this.showModal(`Nouvelle route — ${GS.company.hub} → ${destIata}`, `
      <div style="text-align:center;padding:6px 0 14px">
        <div style="font-size:40px;margin-bottom:8px">🛫</div>
        <div style="font-size:16px;font-weight:700;color:#fff">${hub.city} → ${dest.city}</div>
        <div style="font-size:12px;color:var(--txt-dim);margin-top:3px">${dest.country}</div>
      </div>
      <div class="card-grid" style="margin-bottom:14px">
        <div class="kpi-card"><div class="kpi-label">Distance</div><div class="kpi-value">${dist.toLocaleString()} km</div></div>
        <div class="kpi-card"><div class="kpi-label">Demande</div><div class="kpi-value">${demand.toLocaleString()}</div><div class="kpi-sub">PAX/jour</div></div>
        <div class="kpi-card"><div class="kpi-label">Remplissage est.</div><div class="kpi-value">${Math.round(tmpRoute.loadFactor*100)}%</div></div>
        <div class="kpi-card"><div class="kpi-label">Profit/vol</div><div class="kpi-value ${profit>=0?'positive':'negative'}">${profit>=0?'+':''}$${profit.toLocaleString()}</div></div>
      </div>
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:12px;display:flex;align-items:center;gap:12px">
        <span style="font-size:24px">${model.icon}</span>
        <div>
          <div style="font-weight:700;color:#fff;font-size:13px">${ac.name}</div>
          <div style="font-size:11px;color:var(--txt-dim)">${model.name} · ${model.paxCapacity} PAX · ${model.range.toLocaleString()} km</div>
        </div>
      </div>
    `, [
      { label: '✈ Ouvrir la ligne', cls: 'btn-primary', action: () => {
        const result = RouteEngine.createRoute(GS.company.hub, destIata, ac.id, { cabinConfig: tmpRoute.cabinConfig });
        if (result.error) { this.notify(result.error, 'error'); return; }
        MapEngine.addRoutePolyline(result.route);
        this.closeModal();
        this.notify(`Route ${GS.company.hub} → ${destIata} ouverte ! ✈`, 'success');
        if (this.currentTab) this.refreshPanel();
      }},
      { label: 'Annuler', cls: 'btn-ghost', action: () => this.closeModal() },
    ]);
  },

  /* ===== ROUTES PANEL ===== */
  renderRoutes(body) {
    let view = 'list';
    const render = () => {
      if (view === 'list') this.renderRouteList(body, () => { view='create'; render(); });
      else this.renderRouteBuilder(body, () => { view='list'; render(); });
    };
    render();
  },

  renderRouteList(body, onNew) {
    const routes = GS.routes;
    body.innerHTML = `
      <button class="btn-primary w100" id="btn-new-route" style="margin-bottom:12px">+ Créer une nouvelle route</button>
      ${routes.length ? routes.map(r => this.buildRouteCard(r)).join('') : `
        <div class="empty-state">
          <div class="es-icon">🗺</div>
          <p>Aucune route active.<br>Créez votre première ligne commerciale.</p>
          <div style="margin-top:12px;font-size:12px;color:var(--txt-dim);line-height:1.5">
            💡 Dans la Flotte → Marché, achetez un appareil,<br>puis revenez ici pour ouvrir une ligne.
          </div>
        </div>`}
    `;
    document.getElementById('btn-new-route')?.addEventListener('click', onNew);
    body.querySelectorAll('.itin-v2').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.classList.contains('btn-depart') || e.target.closest('.btn-depart')) return;
        const route = GS.getRoute(parseInt(card.dataset.rid));
        if (route) this.showRouteDetail(route);
      });
    });
    body.querySelectorAll('.btn-depart').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const route = GS.getRoute(parseInt(btn.dataset.rid));
        if (!route) return;
        const aircraft = GS.fleet.find(a => a.routeId === route.id);
        if (!aircraft) { this.notify('Aucun appareil assigné à cette route.','error'); return; }
        if (aircraft.status === 'flying') { this.notify('Cet appareil est déjà en vol.','warning'); return; }
        const result = RouteEngine.dispatchFlight(route, aircraft);
        if (result && result.error) { this.notify(result.error, 'error'); return; }
        this.notify(`✈ ${aircraft.name} — départ ${aircraft.origin} → ${aircraft.destination}`, 'success');
        this.refreshPanel();
      });
    });
  },

  buildRouteCard(r) {
    const o = getAirport(r.origin);
    const d = getAirport(r.destination);
    const profit = Economy.calcRouteProfit(r);
    const aircraft = GS.fleet.find(a => a.routeId === r.id);
    const model = aircraft ? getAircraftModel(aircraft.modelId) : null;
    const isFlying = aircraft?.status === 'flying';
    const routeCode = `${GS.company?.iata || 'HA'}-${String(r.id).padStart(3,'0')}`;
    const lf = Math.round((r.loadFactor||0)*100);
    const eco = Math.round((r.cabinConfig?.economy||0.8)*100);
    const biz = Math.round((r.cabinConfig?.business||0.06)*100);
    const first = Math.round((r.cabinConfig?.first||0.02)*100);
    return `<div class="itin-v2" data-rid="${r.id}">
      <div class="itin-v2-left">
        <div class="itin-v2-code">${routeCode}</div>
        <div class="itin-v2-airports">
          <span class="itin-iata">${r.origin}</span>
          <span class="itin-arrow">→</span>
          <span class="itin-iata">${r.destination}</span>
        </div>
        <div class="itin-v2-cities">${o?.city||r.origin}${r.waypoints?.length?` › ${r.waypoints.join(' › ')}`:''} → ${d?.city||r.destination}</div>
        <div class="itin-v2-aircraft">${aircraft ? `${model?.icon||'✈'} ${aircraft.name}${(!isFlying && aircraft.locationIata)?` · <span class="text-cyan">au sol à ${aircraft.locationIata}</span>`:''}` : '<span class="text-red">Aucun appareil assigné</span>'}</div>
      </div>
      <div class="itin-v2-mid">
        <div class="itin-v2-stat">
          <div class="ivs-val">${r.distanceKm?.toLocaleString()||'-'}<span class="ivs-unit">km</span></div>
          <div class="ivs-lbl">Distance</div>
        </div>
        <div class="itin-v2-stat">
          <div class="ivs-val">${lf}<span class="ivs-unit">%</span></div>
          <div class="ivs-lbl">Remplissage</div>
        </div>
        <div class="itin-v2-stat">
          <div class="ivs-val" style="color:var(--cyan)">${typeof MarketShare!=='undefined'?MarketShare.calcShare(r)*100|0:'-'}<span class="ivs-unit">%</span></div>
          <div class="ivs-lbl">Part marché</div>
        </div>
        <div class="itin-v2-cabin">
          <span class="cab-badge cab-eco">Y${eco}%</span>
          <span class="cab-badge cab-biz">J${biz}%</span>
          <span class="cab-badge cab-first">F${first}%</span>
        </div>
        <div class="itin-v2-flights">${r.totalFlights||0} vols · $${(r.totalRevenue||0).toLocaleString()}</div>
      </div>
      <div class="itin-v2-right">
        <div class="itin-profit ${profit>=0?'pos':'neg'}">${profit>=0?'+':'-'}$${Math.abs(profit).toLocaleString()}</div>
        <div class="itin-profit-lbl">/vol</div>
        ${isFlying
          ? `<div class="itin-status-flying">
               <div class="itin-flying-dot"></div>
               <span>En vol ${Math.round((aircraft.progress||0)*100)}%</span>
             </div>`
          : aircraft
            ? `<button class="btn-depart" data-rid="${r.id}">${aircraft.locationIata === r.destination ? '↩ Retour' : '▶ Départ'}</button>`
            : ''
        }
      </div>
    </div>`;
  },

  showRouteDetail(route) {
    const o = getAirport(route.origin);
    const d = getAirport(route.destination);
    const aircraft = GS.fleet.find(a => a.routeId === route.id);
    const profit = Economy.calcRouteProfit(route);
    this.showModal(`Route ${route.origin} → ${route.destination}`, `
      <div class="card-grid" style="margin-bottom:16px">
        <div class="kpi-card"><div class="kpi-label">Distance</div><div class="kpi-value">${route.distanceKm?.toLocaleString()} km</div></div>
        <div class="kpi-card"><div class="kpi-label">Durée vol</div><div class="kpi-value">${route.durationHours?.toFixed(1)} h</div></div>
        <div class="kpi-card"><div class="kpi-label">Profit/vol</div><div class="kpi-value ${profit>0?'positive':'negative'}">${profit>0?'+':''}$${profit.toLocaleString()}</div></div>
        <div class="kpi-card"><div class="kpi-label">Remplissage</div><div class="kpi-value">${Math.round((route.loadFactor||0)*100)}%</div></div>
        <div class="kpi-card"><div class="kpi-label">Total vols</div><div class="kpi-value">${route.totalFlights||0}</div></div>
        <div class="kpi-card"><div class="kpi-label">Revenue total</div><div class="kpi-value">$${(route.totalRevenue||0).toLocaleString()}</div></div>
      </div>
      <div style="font-size:12px;color:var(--txt-dim);margin-bottom:8px">Appareil : ${aircraft ? aircraft.name : 'Aucun'}${aircraft && aircraft.status!=='flying' && aircraft.locationIata ? ` · au sol à ${aircraft.locationIata}` : ''}</div>
      ${route.waypoints?.length ? `<div style="font-size:12px;color:var(--txt-dim);margin-bottom:8px">Escales : ${route.waypoints.join(' → ')}</div>` : ''}
      <div class="route-toggle-row">
        <div>
          <div class="rt-toggle-name">Vols retour automatiques</div>
          <div class="rt-toggle-desc">${route.autoReturn!==false ? 'L\'appareil enchaîne aller-retour en continu' : 'Vous lancez chaque départ manuellement (bouton Départ/Retour)'}</div>
        </div>
        <label class="toggle-switch"><input type="checkbox" id="rt-auto" ${route.autoReturn!==false?'checked':''}><span class="toggle-slider"></span></label>
      </div>
      ${profit < 0 ? `<div class="route-loss-warn">⚠ Cette route perd de l'argent. L'appareil est probablement trop grand pour la demande, ou la distance trop coûteuse. Essayez un appareil plus petit ou une destination plus fréquentée.</div>` : ''}
    `, [
      { label: 'Supprimer la route', cls: 'btn-danger', action: () => {
        RouteEngine.removeRoute(route.id);
        MapEngine.removeRoutePolyline(route.id);
        this.closeModal();
        this.refreshPanel();
        this.notify('Route supprimée.', 'warning');
      }},
      { label: 'Fermer', cls: 'btn-ghost', action: () => this.closeModal() },
    ]);
    document.getElementById('rt-auto')?.addEventListener('change', e => {
      route.autoReturn = e.target.checked;
      this.notify(route.autoReturn ? 'Vols retour automatiques activés.' : 'Mode manuel : lancez les départs depuis la liste des routes.', 'info');
      // If turning auto back on and the aircraft is parked, resume immediately
      if (route.autoReturn && aircraft && aircraft.status === 'ground') {
        RouteEngine.dispatchFlight(route, aircraft);
      }
      this.closeModal();
      this.refreshPanel();
    });
  },

  renderRouteBuilder(body, onBack) {
    let origin = GS.company?.hub || '';
    let destination = '';
    let waypoints = [];
    let selectedAircraftId = null;
    let routeInfo = null;
    let cabinConfig = { economy: 0.80, premeco: 0.10, business: 0.08, first: 0.02 };

    const update = () => {
      if (origin && destination) {
        routeInfo = RouteEngine.getRouteInfo(origin, destination);
      }
    };

    const render = () => {
      update();
      const availableAircraft = GS.fleet.filter(a => a.status === 'available' || a.status === 'ground');
      body.innerHTML = `
        <button class="btn-back" id="rb-back">← Retour à la liste</button>
        <div class="section-title">Planifier une Ligne</div>

        <div class="rb-label">Aéroport de départ</div>
        <button class="rb-airport-btn" id="rb-origin-btn">
          <div class="ap-info">
            <span class="ap-name">${origin ? getAirport(origin)?.city || origin : 'Sélectionner…'}</span>
            <span class="ap-country">${origin ? getAirport(origin)?.country || '' : ''}</span>
          </div>
          <span class="ap-iata">${origin || '--'}</span>
        </button>

        <div style="margin:8px 0;display:flex;align-items:center;gap:8px">
          <div style="flex:1;height:1px;background:var(--border)"></div>
          <button class="btn-ghost btn-sm" id="btn-add-waypoint" title="Ajouter une escale">+ Escale</button>
          <div style="flex:1;height:1px;background:var(--border)"></div>
        </div>

        ${waypoints.length > 0 ? `<div class="rb-waypoints">${waypoints.map((w,i) => `<div class="wb-wp"><span class="wp-iata">${w}</span><span class="wp-name">${getAirport(w)?.city||w}</span><button class="btn-remove-wp" data-wi="${i}">✕</button></div>`).join('')}</div>` : ''}

        <div class="rb-label">Aéroport de destination</div>
        <button class="rb-airport-btn" id="rb-dest-btn">
          <div class="ap-info">
            <span class="ap-name">${destination ? getAirport(destination)?.city || destination : 'Sélectionner…'}</span>
            <span class="ap-country">${destination ? getAirport(destination)?.country || '' : ''}</span>
          </div>
          <span class="ap-iata">${destination || '--'}</span>
        </button>

        ${routeInfo ? `<div class="rb-route-calc">
          <div class="rb-calc-row"><span>Distance orthodromique</span><strong>${routeInfo.distance.toLocaleString()} km</strong></div>
          <div class="rb-calc-row"><span>Demande estimée</span><strong>${routeInfo.demand.toLocaleString()} PAX/j</strong></div>
          <div class="rb-calc-row"><span>Capacité idéale</span><strong>~${RouteEngine.getRecommendedCapacity(routeInfo.demand).toLocaleString()} sièges</strong></div>
        </div>` : ''}

        <div class="section-title" style="margin-top:16px">Sélectionner un Appareil</div>
        ${availableAircraft.length ? `
          <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
            ${availableAircraft.map(ac => {
              const m = getAircraftModel(ac.modelId);
              const ok = routeInfo && m ? canFlyRoute(m, routeInfo.distance) : true;
              const fit = (routeInfo && m) ? RouteEngine.rateRightSizing(routeInfo.demand, m.paxCapacity) : null;
              return `<label style="display:flex;align-items:center;gap:10px;background:var(--bg-card);border:1px solid ${selectedAircraftId===ac.id?'var(--border-h)':'var(--border)'};border-radius:8px;padding:10px;cursor:pointer;opacity:${ok?1:0.4}">
                <input type="radio" name="ac-sel" value="${ac.id}" ${selectedAircraftId===ac.id?'checked':''} ${ok?'':'disabled'}>
                <div style="flex:1">
                  <div style="font-weight:600;font-size:13px">${ac.name} ${fit&&ok?`<span class="fit-badge fit-${fit.cls}">${fit.label}</span>`:''}</div>
                  <div style="font-size:11px;color:var(--txt-dim)">${m?.name} · ${m?.range?.toLocaleString()} km · ${m?.paxCapacity} PAX${!ok?' · <span style="color:var(--red)">Autonomie insuffisante</span>':''}</div>
                </div>
              </label>`;
            }).join('')}
          </div>` : GS.fleet.length === 0
            ? `<div class="empty-state" style="margin-bottom:12px"><p>Aucun appareil dans la flotte.<br><button class="btn-primary btn-sm" onclick="UI.openPanel('fleet')" style="margin-top:8px">✈ Acheter un appareil</button></p></div>`
            : `<div class="empty-state" style="margin-bottom:12px"><p>Tous vos appareils sont en vol.<br><span style="font-size:12px;color:var(--txt-dim)">Attendez qu'un vol arrive à destination.</span></p></div>`}

        <div class="section-title">Configuration Cabine</div>
        <div class="cabin-config">
          <div class="cabin-item"><div class="class-icon">💺</div><label>Économique (%)</label><input type="number" id="cb-eco" min="0" max="100" value="${Math.round(cabinConfig.economy*100)}"></div>
          <div class="cabin-item"><div class="class-icon">🪑</div><label>Premium Éco (%)</label><input type="number" id="cb-pe" min="0" max="100" value="${Math.round(cabinConfig.premeco*100)}"></div>
          <div class="cabin-item"><div class="class-icon">🛋</div><label>Business (%)</label><input type="number" id="cb-biz" min="0" max="100" value="${Math.round(cabinConfig.business*100)}"></div>
          <div class="cabin-item"><div class="class-icon">👑</div><label>Première (%)</label><input type="number" id="cb-first" min="0" max="100" value="${Math.round(cabinConfig.first*100)}"></div>
        </div>

        <button class="btn-primary w100 mt2" id="btn-create-route" ${(!origin||!destination||!selectedAircraftId)?'disabled':''}>✈ Ouvrir cette ligne</button>
      `;

      document.getElementById('rb-back').addEventListener('click', onBack);
      document.getElementById('rb-origin-btn').addEventListener('click', () => this.openAirportPicker('origin', iata => { origin = iata; render(); }));
      document.getElementById('rb-dest-btn').addEventListener('click', () => this.openAirportPicker('destination', iata => { destination = iata; render(); }));
      document.getElementById('btn-add-waypoint').addEventListener('click', () => this.openAirportPicker('waypoint', iata => { if (!waypoints.includes(iata)) waypoints.push(iata); render(); }));
      body.querySelectorAll('[name=ac-sel]').forEach(inp => inp.addEventListener('change', e => { selectedAircraftId = parseInt(e.target.value); render(); }));
      body.querySelectorAll('.btn-remove-wp').forEach(btn => btn.addEventListener('click', () => { waypoints.splice(parseInt(btn.dataset.wi),1); render(); }));
      document.getElementById('btn-create-route')?.addEventListener('click', () => {
        cabinConfig = {
          economy: parseInt(document.getElementById('cb-eco')?.value||80)/100,
          premeco: parseInt(document.getElementById('cb-pe')?.value||10)/100,
          business: parseInt(document.getElementById('cb-biz')?.value||8)/100,
          first: parseInt(document.getElementById('cb-first')?.value||2)/100,
        };
        const result = RouteEngine.createRoute(origin, destination, selectedAircraftId, { waypoints, cabinConfig });
        if (result.error) { this.notify(result.error, 'error'); return; }
        MapEngine.addRoutePolyline(result.route);
        this.notify(`Route ${origin} → ${destination} ouverte ! ✈`, 'success');
        onBack();
      });
    };
    render();
  },

  openAirportPicker(label, onSelect) {
    this.showModal(`Sélectionner — ${label}`, `
      <input class="ap-picker-search" id="ap-search" placeholder="Rechercher par ville, pays, code IATA…" autofocus>
      <div id="ap-list" class="ap-picker-list">${this.buildAirportPickerList(AIRPORTS.slice(0,30))}</div>
    `, [{ label:'Fermer', cls:'btn-ghost', action:()=>this.closeModal() }]);
    setTimeout(() => {
      const search = document.getElementById('ap-search');
      const list = document.getElementById('ap-list');
      if (!search || !list) return;
      search.focus();
      search.addEventListener('input', e => {
        const results = searchAirports(e.target.value, 40);
        list.innerHTML = this.buildAirportPickerList(results.length ? results : AIRPORTS.slice(0,30));
        this.bindPickerItems(list, onSelect);
      });
      this.bindPickerItems(list, onSelect);
    }, 50);
  },

  buildAirportPickerList(airports) {
    return airports.map(ap => `<div class="ap-picker-item" data-iata="${ap.iata}">
      <div class="api-left"><div class="api-city">${ap.city}</div><div class="api-country">${ap.country}</div></div>
      <div class="api-right"><div class="api-iata">${ap.iata}</div><div class="api-demand">${ap.demandPax.toLocaleString()} PAX/j</div></div>
    </div>`).join('');
  },

  bindPickerItems(list, onSelect) {
    list.querySelectorAll('.ap-picker-item').forEach(item => {
      item.addEventListener('click', () => { onSelect(item.dataset.iata); this.closeModal(); });
    });
  },

  /* ===== COMPANY PANEL ===== */
  renderCompany(body) {
    let activeTab = 'finances';
    const tabs = [
      { id:'finances', label:'💰 Finances' },
      { id:'crew', label:'👤 Équipage' },
      { id:'services', label:'✈ Services' },
      { id:'alliances', label:'🤝 Alliances' },
      { id:'marketing', label:'📣 Marketing' },
      { id:'events', label:'⚡ Événements' },
    ];
    const render = () => {
      body.innerHTML = `
        <div class="inner-tabs">${tabs.map(t=>`<button class="inner-tab ${t.id===activeTab?'active':''}" data-it="${t.id}">${t.label}</button>`).join('')}</div>
        <div id="company-content"></div>
      `;
      body.querySelectorAll('.inner-tab').forEach(btn => { btn.addEventListener('click', () => { activeTab = btn.dataset.it; render(); }); });
      const content = document.getElementById('company-content');
      switch(activeTab) {
        case 'finances': this.renderFinances(content); break;
        case 'crew': this.renderCrew(content); break;
        case 'services': this.renderServices(content); break;
        case 'alliances': this.renderAlliances(content); break;
        case 'marketing': this.renderMarketing(content); break;
        case 'events': this.renderEvents(content); break;
      }
    };
    render();
  },

  renderFinances(container) {
    const f = GS.finances;
    const totalRev = GS.getTotalRevenue();
    const totalCost = GS.getTotalCosts();
    const balance = GS.finances.balance;
    container.innerHTML = `
      <div class="dashboard-grid">
        <div class="kpi-card"><div class="kpi-label">Capital</div><div class="kpi-value ${balance<0?'negative':''}">${GS.getBalanceFormatted()}</div></div>
        <div class="kpi-card"><div class="kpi-label">Carburant actuel</div><div class="kpi-value">$${GS.market.fuelPrice.toFixed(2)}/L</div></div>
        <div class="kpi-card"><div class="kpi-label">Revenus/mois</div><div class="kpi-value positive">+$${totalRev.toLocaleString()}</div><div class="kpi-sub">PAX + Cargo</div></div>
        <div class="kpi-card"><div class="kpi-label">Charges/mois</div><div class="kpi-value negative">-$${totalCost.toLocaleString()}</div><div class="kpi-sub">Carburant + Équipage</div></div>
      </div>
      <div class="section-title">Détail P&L ce mois</div>
      <table class="data-table">
        <tr><th>Poste</th><th>Montant</th></tr>
        <tr><td>Revenus PAX</td><td class="text-green">+$${f.revenue.pax.toLocaleString()}</td></tr>
        <tr><td>Revenus Cargo</td><td class="text-green">+$${f.revenue.cargo.toLocaleString()}</td></tr>
        <tr><td>Carburant</td><td class="text-red">-$${f.costs.fuel.toLocaleString()}</td></tr>
        <tr><td>Maintenance</td><td class="text-red">-$${f.costs.maintenance.toLocaleString()}</td></tr>
        <tr><td>Taxes aéroportuaires</td><td class="text-red">-$${f.costs.fees.toLocaleString()}</td></tr>
        <tr><td>Équipage</td><td class="text-red">-$${f.costs.crew.toLocaleString()}</td></tr>
        <tr><td>Marketing</td><td class="text-red">-$${f.costs.marketing.toLocaleString()}</td></tr>
        <tr><td><strong>Résultat net</strong></td><td class="${totalRev-totalCost>=0?'text-green':'text-red'}"><strong>${totalRev-totalCost>=0?'+':''} $${(totalRev-totalCost).toLocaleString()}</strong></td></tr>
      </table>
      ${this.buildFinancingSection()}
      <div class="section-title">Historique récent</div>
      <div style="max-height:200px;overflow-y:auto">
        ${GS.finances.history.slice().reverse().slice(0,20).map(h=>`
          <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:11px">
            <span style="color:var(--txt-dim)">${h.description||h.type}</span>
            <span class="${h.amount>=0?'text-green':'text-red'}">${h.amount>=0?'+':''}$${Math.abs(h.amount).toLocaleString()}</span>
          </div>
        `).join('')}
      </div>
    `;
    this.bindFinancingButtons(container);
  },

  buildFinancingSection() {
    if (typeof Finance === 'undefined') return '';
    const loans = GS.finances.loans || [];
    const debt = Finance.totalDebt();
    const nw = Finance.netWorth();
    const fv = Finance.fleetValue();
    const maxBorrow = Finance.maxBorrowable();
    const fmt = n => '$' + Math.round(n).toLocaleString();
    return `
      <div class="section-title">💳 Financement</div>
      <div class="fin-summary">
        <div class="fin-stat"><div class="fin-stat-lbl">Valeur nette</div><div class="fin-stat-val ${nw<0?'neg':'pos'}">${fmt(nw)}</div></div>
        <div class="fin-stat"><div class="fin-stat-lbl">Valeur flotte</div><div class="fin-stat-val">${fmt(fv)}</div></div>
        <div class="fin-stat"><div class="fin-stat-lbl">Dette totale</div><div class="fin-stat-val ${debt>0?'neg':''}">${fmt(debt)}</div></div>
        <div class="fin-stat"><div class="fin-stat-lbl">Capacité d'emprunt</div><div class="fin-stat-val">${fmt(maxBorrow)}</div></div>
      </div>
      ${loans.length ? `<div class="fin-loans">${loans.map(l => {
        const paidPct = Math.round((1 - l.remaining / l.principal) * 100);
        return `<div class="fin-loan">
          <div class="fin-loan-top">
            <span class="fin-loan-name">${l.product}</span>
            <span class="fin-loan-rate">${(l.annualRate*100).toFixed(1)}%/an · ${l.termMonths} mois</span>
          </div>
          <div class="fin-loan-bar"><div class="fin-loan-bar-fill" style="width:${paidPct}%"></div></div>
          <div class="fin-loan-bot">
            <span>Restant : <strong>${fmt(l.remaining)}</strong></span>
            <span>Échéance : ${fmt(l.monthlyPayment)}/mois</span>
            <button class="fin-repay-btn" data-repay="${l.id}">Solder</button>
          </div>
        </div>`;
      }).join('')}</div>` : `<div class="fin-noloan">Aucun prêt en cours. Empruntez pour accélérer votre expansion.</div>`}
      <button class="btn-primary w100" id="btn-take-loan" style="margin-top:10px">💰 Contracter un prêt</button>
    `;
  },

  bindFinancingButtons(container) {
    if (typeof Finance === 'undefined') return;
    container.querySelector('#btn-take-loan')?.addEventListener('click', () => this.showLoanModal());
    container.querySelectorAll('[data-repay]').forEach(btn => {
      btn.addEventListener('click', () => {
        const result = Finance.repayLoan(parseInt(btn.dataset.repay));
        if (result.error) { this.notify(result.error, 'error'); return; }
        this.notify('Prêt soldé par anticipation.', 'success');
        this.refreshPanel();
        this.updateHeader();
      });
    });
  },

  showLoanModal() {
    const offers = Finance.getOffers();
    const maxBorrow = Finance.maxBorrowable();
    let selected = offers[1] || offers[0];
    let amount = Math.min(selected.max, Math.round(maxBorrow / 2 / 100000) * 100000) || 1000000;
    const fmt = n => '$' + Math.round(n).toLocaleString();
    const render = () => {
      const pay = Finance.monthlyPayment(amount, selected.annualRate, selected.termMonths);
      const totalRepay = pay * selected.termMonths;
      document.getElementById('modal-body').innerHTML = `
        <div class="loan-offers">
          ${offers.map(o => `<button class="loan-offer ${o.id===selected.id?'active':''}" data-offer="${o.id}">
            <div class="loan-offer-name">${o.name}</div>
            <div class="loan-offer-meta">${(o.annualRate*100).toFixed(1)}%/an · ${o.termMonths} mois</div>
            <div class="loan-offer-max">Max ${fmt(o.max)}</div>
          </button>`).join('')}
        </div>
        <div class="fg" style="margin-top:14px">
          <label>Montant emprunté : <strong style="color:var(--cyan)">${fmt(amount)}</strong></label>
          <input type="range" id="loan-amount" min="500000" max="${Math.max(500000, Math.min(selected.max, maxBorrow))}" step="100000" value="${Math.min(amount, selected.max, maxBorrow)}" style="width:100%;accent-color:var(--cyan)">
        </div>
        <div class="card-grid" style="margin-top:8px">
          <div class="kpi-card"><div class="kpi-label">Mensualité</div><div class="kpi-value">${fmt(pay)}</div></div>
          <div class="kpi-card"><div class="kpi-label">Coût total</div><div class="kpi-value">${fmt(totalRepay)}</div></div>
        </div>
        <div style="font-size:11px;color:var(--txt-dim);margin-top:8px">Capacité d'emprunt restante : ${fmt(maxBorrow)}</div>
      `;
      document.querySelectorAll('.loan-offer').forEach(b => b.addEventListener('click', () => {
        selected = offers.find(o => o.id === b.dataset.offer);
        amount = Math.min(amount, selected.max, maxBorrow);
        render();
      }));
      document.getElementById('loan-amount')?.addEventListener('input', e => { amount = parseInt(e.target.value); render(); });
    };
    this.showModal('💰 Contracter un prêt', '<div id="loan-modal-inner"></div>', [
      { label: 'Confirmer le prêt', cls: 'btn-primary', action: () => {
        const result = Finance.takeLoan(selected.id, amount);
        if (result.error) { this.notify(result.error, 'error'); return; }
        this.notify(`Prêt de ${fmt(amount)} accordé !`, 'success');
        this.closeModal();
        this.refreshPanel();
        this.updateHeader();
      }},
      { label: 'Annuler', cls: 'btn-ghost', action: () => this.closeModal() },
    ]);
    render();
  },

  renderCrew(container) {
    let activeTab = 'roster';
    const render = () => {
      const salaries = GS.crew.reduce((s,c)=>s+c.salary,0);
      const pilots = GS.crew.filter(c => c.type === 'pilot');
      container.innerHTML = `
        <div style="display:flex;gap:6px;margin-bottom:12px">
          <div class="kpi-card" style="flex:1"><div class="kpi-label">Effectif</div><div class="kpi-value">${GS.crew.length}</div></div>
          <div class="kpi-card" style="flex:1"><div class="kpi-label">Pilotes</div><div class="kpi-value">${pilots.length}</div></div>
          <div class="kpi-card" style="flex:1"><div class="kpi-label">Salaires/mois</div><div class="kpi-value negative" style="font-size:11px">$${salaries.toLocaleString()}</div></div>
        </div>
        <div class="inner-tabs" style="margin-bottom:10px">
          <button class="inner-tab ${activeTab==='roster'?'active':''}" data-it="roster">👤 Personnel</button>
          <button class="inner-tab ${activeTab==='qualifications'?'active':''}" data-it="qualifications">🎓 Qualifications</button>
        </div>
        <div id="crew-content"></div>
        <button class="btn-secondary w100 mt2" id="btn-hire">+ Recruter du personnel ($15,000)</button>
      `;
      container.querySelectorAll('.inner-tab').forEach(btn => { btn.addEventListener('click', () => { activeTab = btn.dataset.it; render(); }); });
      const content = document.getElementById('crew-content');
      if (activeTab === 'roster') {
        content.innerHTML = GS.crew.map(c => {
          const ratingCount = c.typeRatings ? c.typeRatings.length : 0;
          const trainingLeft = c.inTraining ? (typeof TypeRatings !== 'undefined' ? TypeRatings.getDaysRemaining(c) : '?') : 0;
          return `<div class="crew-card">
            <div class="crew-avatar">${c.type==='pilot'?'🎖':'🧑‍✈️'}</div>
            <div class="crew-info">
              <div class="crew-name">${c.name}</div>
              <div class="crew-role">${c.role}${c.type==='pilot'?' · '+ratingCount+' qualification'+(ratingCount!==1?'s':''):''}</div>
              ${c.inTraining ? `<div style="font-size:11px;color:var(--gold)">📚 Formation en cours (${trainingLeft}j restants)</div>` : ''}
              <div class="crew-stats">
                <div class="crew-skill">Exp: ${c.experience}%<div class="crew-bar"><div class="crew-bar-fill" style="width:${c.experience}%;background:var(--cyan)"></div></div></div>
              </div>
            </div>
            <div style="font-size:12px;color:var(--gold);font-weight:600;white-space:nowrap">$${c.salary.toLocaleString()}/mois</div>
          </div>`;
        }).join('');
      } else {
        this.renderQualifications(content);
      }
      document.getElementById('btn-hire')?.addEventListener('click', () => {
        if (GS.finances.balance < 15000) { this.notify('Fonds insuffisants.','error'); return; }
        GS.addToBalance(-15000, 'crew', 'Recrutement');
        const isPilot = Math.random() > 0.5;
        const crew = {
          id: GS.genId(), name: ['Alex Leroy','Maria Santos','James Wright','Aiko Yamamoto','Kwame Mensah','Selin Demir','Carlos Ruiz'][Math.floor(Math.random()*7)],
          role: isPilot?'Commandant de bord':'Agent de bord', type: isPilot?'pilot':'cabin',
          experience: 20+Math.floor(Math.random()*40), reliability: 50+Math.floor(Math.random()*40),
          longHaulSpec: Math.random()>0.6, salary: isPilot?7000+Math.floor(Math.random()*3000):2000+Math.floor(Math.random()*1000),
          assignedAircraft: null, typeRatings: isPilot ? ['atr'] : [],
        };
        GS.crew.push(crew);
        this.notify(`${crew.name} recruté !`, 'success');
        render();
      });
    };
    render();
  },

  renderQualifications(container) {
    if (typeof TypeRatings === 'undefined') {
      container.innerHTML = '<p>Système de qualifications non disponible.</p>';
      return;
    }
    const pilots = GS.crew.filter(c => c.type === 'pilot');
    if (!pilots.length) {
      container.innerHTML = '<div class="empty-state"><p>Aucun pilote dans votre équipe.</p></div>';
      return;
    }
    const families = TypeRatings.FAMILIES;
    container.innerHTML = `
      <div style="font-size:12px;color:var(--txt-dim);margin-bottom:12px;line-height:1.6">
        Les pilotes doivent être qualifiés sur chaque famille d'appareils. Sans qualification, les achats sont possibles mais les vols ne peuvent pas être lancés.
      </div>
      ${pilots.map(p => {
        const ratings = p.typeRatings || [];
        const trainingLeft = p.inTraining ? TypeRatings.getDaysRemaining(p) : 0;
        const famTraining = p.inTraining ? (families[p.inTraining] || {}).name : '';
        return `<div class="qual-card">
          <div class="qual-pilot-hdr">
            <span class="qual-pilot-name">🎖 ${p.name}</span>
            <span class="qual-pilot-exp">Exp ${p.experience}%</span>
          </div>
          ${p.inTraining ? `<div class="qual-training-banner">📚 Formation ${famTraining} — ${trainingLeft} jours restants</div>` : ''}
          <div class="qual-ratings">
            ${ratings.map(r => `<span class="qual-badge qual-got">${(families[r]||{}).name||r}</span>`).join('')}
            ${!ratings.length && !p.inTraining ? '<span style="font-size:11px;color:var(--txt-dim)">Aucune qualification</span>' : ''}
          </div>
          ${!p.inTraining ? `<div class="qual-train-section">
            <select class="qual-fam-sel" data-pid="${p.id}">
              <option value="">— Choisir une formation —</option>
              ${Object.entries(families).filter(([fId]) => !ratings.includes(fId)).map(([fId, fDef]) =>
                `<option value="${fId}">${fDef.name} · $${fDef.cost.toLocaleString()} · ${fDef.trainingDays}j</option>`
              ).join('')}
            </select>
            <button class="btn-secondary btn-sm qual-train-btn" data-pid="${p.id}">Lancer la formation</button>
          </div>` : ''}
        </div>`;
      }).join('')}
    `;
    container.querySelectorAll('.qual-train-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pilotId = parseInt(btn.dataset.pid);
        const sel = container.querySelector(`.qual-fam-sel[data-pid="${pilotId}"]`);
        const family = sel ? sel.value : '';
        if (!family) { this.notify('Sélectionnez une qualification.', 'warning'); return; }
        const result = TypeRatings.startTraining(pilotId, family);
        if (result.error) { this.notify(result.error, 'error'); return; }
        const famName = (TypeRatings.FAMILIES[family] || {}).name || family;
        this.notify(`Formation ${famName} lancée !`, 'success');
        this.renderQualifications(container);
      });
    });
  },

  renderServices(container) {
    if (!GS.company) return;
    if (!GS.company.ancillary) GS.company.ancillary = {};
    const anc = GS.company.ancillary;
    const svc = GS.company.service || { level: 1, wifi: false, catering: false };

    const services = [
      { id:'seatFee',  label:'Frais de siège choisi', desc:'Supplément pour le choix du siège à la réservation.', icon:'💺', rev: 18, cost:0, toggle:true },
      { id:'baggage',  label:'Bagages en soute payants', desc:'Première valise facturée séparément (modèle low-cost).', icon:'🧳', rev: 32, cost:0, toggle:true },
      { id:'wifi',     label:'Wi-Fi payant à bord',    desc:'Connexion internet vendue $12/PAX.', icon:'📶', rev: 12, cost:50000, toggle:false },
      { id:'meals',    label:'Service repas premium',  desc:'Repas chauds vendus à bord sur vols >2h.', icon:'🍽', rev: 22, cost:30000, toggle:false },
    ];

    // Cabin service level
    const serviceLabels = ['', 'Basique', 'Confort', 'Premium', 'Affaires Elite', 'Luxe'];

    container.innerHTML = `
      <div class="section-title">Revenus Annexes (par PAX)</div>
      <div style="font-size:12px;color:var(--txt-dim);margin-bottom:12px;line-height:1.6">
        Configurez les services vendus à bord et les suppléments. Chaque service activé augmente les revenus par passager.
      </div>
      ${services.map(s => {
        const active = s.toggle ? anc[s.id] !== false : !!anc[s.id];
        const canBuy = !s.toggle && !active;
        const affordable = GS.finances.balance >= s.cost;
        return `<div class="svc-card">
          <div class="svc-icon">${s.icon}</div>
          <div class="svc-info">
            <div class="svc-name">${s.label}</div>
            <div class="svc-desc">${s.desc}</div>
            <div class="svc-rev">+$${s.rev}/PAX</div>
          </div>
          ${s.toggle
            ? `<label class="toggle-switch"><input type="checkbox" class="svc-toggle" data-svc="${s.id}" ${active?'checked':''}><span class="toggle-slider"></span></label>`
            : active
              ? `<div class="badge badge-green">Actif ✓</div>`
              : `<button class="btn-primary btn-sm svc-buy" data-svc="${s.id}" ${affordable?'':'disabled'}>Activer $${s.cost.toLocaleString()}</button>`
          }
        </div>`;
      }).join('')}

      <div class="section-title" style="margin-top:20px">Niveau de Service Cabine</div>
      <div style="font-size:12px;color:var(--txt-dim);margin-bottom:10px">Un meilleur service attire plus de passagers et améliore la réputation.</div>
      <div class="svc-levels">
        ${[1,2,3,4,5].map(lvl => {
          const costs = [0, 500000, 2000000, 8000000, 25000000];
          const active = svc.level === lvl;
          const canUpgrade = svc.level < lvl && svc.level === lvl - 1;
          return `<div class="svc-level ${active?'active':''}">
            <div class="svc-lvl-num">${lvl}</div>
            <div class="svc-lvl-name">${serviceLabels[lvl]}</div>
            ${canUpgrade
              ? `<button class="btn-primary btn-sm svc-upgrade" data-lvl="${lvl}" ${GS.finances.balance>=costs[lvl-1]?'':'disabled'}>$${(costs[lvl-1]/1e6).toFixed(1)}M</button>`
              : active ? '<div style="font-size:9px;color:var(--cyan)">Actuel</div>' : ''}
          </div>`;
        }).join('')}
      </div>

      <div class="section-title" style="margin-top:20px">Identité Visuelle</div>
      <div style="display:flex;gap:12px;align-items:center;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:14px">
        <div style="font-size:40px">${GS.company.logo || '✈'}</div>
        <div style="flex:1">
          <div style="font-weight:700;color:#fff;margin-bottom:4px">${GS.company.name}</div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <input type="color" id="livery-color" value="${GS.company.liveryColor||'#00d4ff'}" style="width:36px;height:36px;border:none;background:none;cursor:pointer;border-radius:6px">
            <input type="text" id="livery-logo" value="${GS.company.logo||'✈'}" maxlength="2" style="width:48px;background:var(--bg-dark);border:1px solid var(--border);border-radius:6px;color:var(--txt);padding:6px;font-size:20px;text-align:center">
            <button class="btn-secondary btn-sm" id="btn-save-livery">Appliquer</button>
          </div>
          <div style="font-size:11px;color:var(--txt-dim);margin-top:4px">Couleur de livrée · Logo de dérive</div>
        </div>
      </div>
    `;

    container.querySelectorAll('.svc-toggle').forEach(chk => {
      chk.addEventListener('change', e => {
        anc[e.target.dataset.svc] = e.target.checked;
        this.notify(e.target.checked ? 'Service activé.' : 'Service désactivé.', 'info');
      });
    });
    container.querySelectorAll('.svc-buy').forEach(btn => {
      btn.addEventListener('click', () => {
        const svcDef = services.find(s => s.id === btn.dataset.svc);
        if (!svcDef) return;
        GS.addToBalance(-svcDef.cost, 'services', `Activation ${svcDef.label}`);
        anc[btn.dataset.svc] = true;
        this.notify(`${svcDef.label} activé !`, 'success');
        this.renderServices(container);
      });
    });
    container.querySelectorAll('.svc-upgrade').forEach(btn => {
      btn.addEventListener('click', () => {
        const lvl = parseInt(btn.dataset.lvl);
        const costs = [0, 500000, 2000000, 8000000, 25000000];
        const cost = costs[lvl - 1] || 0;
        if (GS.finances.balance < cost) { this.notify('Fonds insuffisants.', 'error'); return; }
        GS.addToBalance(-cost, 'services', `Amélioration service niveau ${lvl}`);
        GS.company.service.level = lvl;
        GS.addReputation(lvl * 3);
        this.notify(`Service amélioré au niveau ${lvl} — ${serviceLabels[lvl]} !`, 'success');
        this.renderServices(container);
      });
    });
    document.getElementById('btn-save-livery')?.addEventListener('click', () => {
      GS.company.liveryColor = document.getElementById('livery-color')?.value || '#00d4ff';
      GS.company.logo = document.getElementById('livery-logo')?.value || '✈';
      this.notify('Identité visuelle mise à jour !', 'success');
      this.updateHeader();
    });
  },

  renderAlliances(container) {
    container.innerHTML = ALLIANCES.map(a => {
      const joined = GS.alliances.includes(a.id);
      return `<div class="alliance-card">
        <div>
          <div class="alliance-name">${a.name}</div>
          <div class="alliance-benefit">${a.benefit}</div>
          <div class="alliance-benefit" style="margin-top:3px">Membres : ${a.members} compagnies</div>
        </div>
        ${joined ? `<div class="alliance-joined">✓ Membre</div>` : `
          <div>
            <div class="alliance-cost">$${(a.cost/1e6).toFixed(1)}M</div>
            <div style="font-size:10px;color:var(--txt-muted)">+$${(a.annual/1000).toFixed(0)}K/an</div>
            <button class="btn-primary btn-sm mt2" data-join="${a.id}">Rejoindre</button>
          </div>`}
      </div>`;
    }).join('');
    container.querySelectorAll('[data-join]').forEach(btn => {
      btn.addEventListener('click', () => {
        const alliance = ALLIANCES.find(a => a.id === btn.dataset.join);
        if (!alliance) return;
        if (GS.finances.balance < alliance.cost) { this.notify('Fonds insuffisants.','error'); return; }
        GS.addToBalance(-alliance.cost, 'fees', `Adhésion ${alliance.name}`);
        GS.alliances.push(alliance.id);
        this.notify(`Vous avez rejoint ${alliance.name} !`, 'success');
        this.renderAlliances(container);
      });
    });
  },

  renderMarketing(container) {
    const campaigns = [
      { id:'social', name:'Campagne Réseaux Sociaux', effect:'+5% demande', cost:50000, monthly:15000, icon:'📱' },
      { id:'tv', name:'Publicité TV internationale', effect:'+12% demande · +5 réputation', cost:200000, monthly:80000, icon:'📺' },
      { id:'loyalty', name:'Programme de fidélité Premium', effect:'+15% loyauté clients', cost:100000, monthly:30000, icon:'🎖' },
      { id:'b2b', name:'Accords Corporate B2B', effect:'+20% taux Business', cost:150000, monthly:45000, icon:'🤝' },
    ];
    container.innerHTML = `
      <div class="kpi-card" style="margin-bottom:12px"><div class="kpi-label">Campagnes actives</div><div class="kpi-value">${GS.marketing.campaigns.length}</div></div>
      ${campaigns.map(c => {
        const active = GS.marketing.campaigns.includes(c.id);
        return `<div class="card" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:600;margin-bottom:2px">${c.icon} ${c.name}</div>
            <div style="font-size:11px;color:var(--cyan);margin-bottom:2px">${c.effect}</div>
            <div style="font-size:11px;color:var(--txt-dim)">Lancement: $${c.cost.toLocaleString()} · Mensuel: $${c.monthly.toLocaleString()}</div>
          </div>
          ${active ? `<div class="badge badge-green">Actif ✓</div>` : `<button class="btn-primary btn-sm" data-camp="${c.id}">Lancer</button>`}
        </div>`;
      }).join('')}
    `;
    container.querySelectorAll('[data-camp]').forEach(btn => {
      btn.addEventListener('click', () => {
        const camp = campaigns.find(c => c.id === btn.dataset.camp);
        if (!camp) return;
        if (GS.finances.balance < camp.cost) { this.notify('Fonds insuffisants.','error'); return; }
        GS.addToBalance(-camp.cost, 'marketing', camp.name);
        GS.marketing.campaigns.push(camp.id);
        GS.market.demandMultiplier = Math.min(2, (GS.market.demandMultiplier||1) + 0.05);
        this.notify(`Campagne "${camp.name}" lancée !`, 'success');
        this.renderMarketing(container);
      });
    });
  },

  renderEvents(container) {
    const active = GS.events.filter(e => e.active);
    container.innerHTML = `
      <div class="section-title">Événements actifs (${active.length})</div>
      ${active.length ? active.map(e=>`<div class="event-card ${e.impact}">
        <div class="event-ico">${e.icon}</div>
        <div>
          <div class="event-title">${e.title}</div>
          <div class="event-desc">${e.desc}</div>
          ${e.duration > 0 ? `<div class="event-impact" style="color:var(--txt-dim)">Durée restante : ${e.daysRemaining||0} jours</div>` : ''}
        </div>
      </div>`).join('') : `<div class="empty-state"><p>Aucun événement en cours.</p></div>`}
      <div class="section-title">Historique récent</div>
      ${GS.events.filter(e=>!e.active).slice(-5).reverse().map(e=>`<div class="event-card" style="opacity:0.5">
        <div class="event-ico">${e.icon}</div>
        <div><div class="event-title">${e.title}</div><div class="event-desc" style="font-size:10px">Terminé</div></div>
      </div>`).join('') || `<div class="empty-state"><p>Aucun événement passé.</p></div>`}
    `;
  },

  /* ===== DASHBOARD ===== */
  renderDashboard(body) {
    const rep = GS.company ? GS.company.reputation : 0;
    const lf = GS.getLoadFactor();
    const balance = GS.finances.balance;
    const totalRev = GS.getTotalRevenue();
    const ai = GS.ai;
    const inAir = GS.getFleetInAir().length;
    const nw = typeof Finance !== 'undefined' ? Finance.netWorth() : balance;
    const debt = typeof Finance !== 'undefined' ? Finance.totalDebt() : 0;
    const fv = typeof Finance !== 'undefined' ? Finance.fleetValue() : 0;
    const pdm = typeof MarketShare !== 'undefined' ? MarketShare.totalShare() : 0;
    const position = typeof MarketShare !== 'undefined' ? MarketShare.getPositionLabel() : '';
    const totalPax = GS.company ? (GS.company.totalPaxCarried || 0) : 0;
    const repStars = '⭐'.repeat(Math.min(5, Math.round(rep / 20))) + '☆'.repeat(Math.max(0, 5 - Math.round(rep / 20)));
    const fmt = n => n>=1e9?'$'+(n/1e9).toFixed(2)+'B':n>=1e6?'$'+(n/1e6).toFixed(1)+'M':n>=1e3?'$'+(n/1e3).toFixed(0)+'K':'$'+Math.round(n).toLocaleString();
    const fuelPrice = GS.market ? GS.market.fuelPrice : 0.95;
    const oilBarrel = GS.market ? (GS.market.oilBarrel || 80) : 80;
    body.innerHTML = `
      <!-- COMPANY PROFILE -->
      <div class="company-hero">
        <div class="ch-logo">${GS.company?.logo || '✈'}</div>
        <div class="ch-info">
          <div class="ch-name">${GS.company?.name || '-'}</div>
          <div class="ch-position">${position}</div>
          <div class="ch-rep">${repStars} <span style="color:var(--txt-dim);font-size:12px">${Math.round(rep)}/100</span></div>
        </div>
        <div class="ch-mode">
          <div style="font-size:10px;color:var(--txt-dim);text-align:center">Mode</div>
          <div style="font-size:13px;font-weight:700;color:var(--cyan)">${GS.timeMode==='realistic'?'Réaliste':GS.timeMode==='fast'?'Rapide':'Standard'}</div>
        </div>
      </div>

      <div class="section-title">Indicateurs Clés</div>
      <div class="dashboard-grid">
        <div class="kpi-card"><div class="kpi-label">Capital</div><div class="kpi-value ${balance<0?'negative':''}">${GS.getBalanceFormatted()}</div></div>
        <div class="kpi-card"><div class="kpi-label">Valeur nette</div><div class="kpi-value ${nw<0?'negative':'positive'}">${fmt(nw)}</div>${debt>0?`<div class="kpi-sub text-red">Dette ${fmt(debt)}</div>`:''}</div>
        <div class="kpi-card"><div class="kpi-label">Valeur flotte</div><div class="kpi-value">${fmt(fv)}</div><div class="kpi-sub">${GS.fleet.length} appareils</div></div>
        <div class="kpi-card"><div class="kpi-label">Part de marché</div><div class="kpi-value" style="color:var(--cyan)">${pdm}%</div><div class="kpi-sub">sur vos routes</div></div>
        <div class="kpi-card"><div class="kpi-label">Remplissage</div><div class="kpi-value ${lf>75?'positive':lf>50?'':'negative'}">${lf}%</div></div>
        <div class="kpi-card"><div class="kpi-label">Flotte en vol</div><div class="kpi-value ${inAir>0?'positive':''}">${inAir} / ${GS.fleet.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">PAX transportés</div><div class="kpi-value">${totalPax.toLocaleString()}</div><div class="kpi-sub">depuis création</div></div>
        <div class="kpi-card"><div class="kpi-label">Pétrole brut</div><div class="kpi-value">$${oilBarrel}/bbl</div><div class="kpi-sub">Kérosène $${fuelPrice.toFixed(2)}/L</div></div>
      </div>
      ${GS.routes.length === 0 ? `
        <div style="background:rgba(0,212,255,0.06);border:1px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:16px">
          <div style="font-weight:700;color:var(--cyan);margin-bottom:8px">🚀 Pour commencer</div>
          <div style="font-size:12px;color:var(--txt-dim);line-height:1.8">
            1. <strong style="color:#fff">Flotte → Marché</strong> : Achetez un appareil<br>
            2. <strong style="color:#fff">Routes → Créer</strong> : Ouvrez votre première ligne<br>
            3. Regardez votre avion décoller sur la carte !
          </div>
        </div>` : ''}

      ${typeof Progression !== 'undefined' ? this.buildAchievementsBlock() : ''}

      <div class="section-title">Routes par Rentabilité</div>
      ${GS.routes.length ? `<table class="data-table">
        <tr><th>Route</th><th>Profit/vol</th><th>Vols</th><th>Remplissage</th></tr>
        ${GS.routes.sort((a,b)=>Economy.calcRouteProfit(b)-Economy.calcRouteProfit(a)).slice(0,8).map(r=>{
          const p = Economy.calcRouteProfit(r);
          return `<tr><td>${r.origin} → ${r.destination}</td><td class="${p>=0?'text-green':'text-red'}">${p>=0?'+':''}$${p.toLocaleString()}</td><td>${r.totalFlights||0}</td><td>${Math.round((r.loadFactor||0)*100)}%</td></tr>`;
        }).join('')}
      </table>` : '<div class="empty-state"><p>Aucune route active.</p></div>'}

      ${ai ? `
        <div class="section-title">Vs Concurrent — ${ai.name}</div>
        <div class="ai-comparison">
          <div class="ai-comp-row"><span class="metric">Vous</span><span class="player-val">${GS.company?.name}</span><span class="ai-val">${ai.name}</span></div>
          <div class="ai-comp-row"><span class="metric">Capital</span><span class="player-val">${GS.getBalanceFormatted()}</span><span class="ai-val">$${(ai.cash/1e6).toFixed(1)}M</span></div>
          <div class="ai-comp-row"><span class="metric">Flotte</span><span class="player-val">${GS.fleet.length}</span><span class="ai-val">${ai.fleet.length}</span></div>
          <div class="ai-comp-row"><span class="metric">Réputation</span><span class="player-val">${Math.round(rep)}</span><span class="ai-val">${Math.round(ai.reputation||0)}</span></div>
          <div class="ai-comp-row"><span class="metric">Total vols</span><span class="player-val">${GS.routes.reduce((s,r)=>s+(r.totalFlights||0),0)}</span><span class="ai-val">${ai.totalFlights||0}</span></div>
        </div>` : ''}
    `;
  },

  buildAchievementsBlock() {
    const list = Progression.ACHIEVEMENTS;
    const unlocked = list.filter(a => Progression.isAchievementUnlocked(a.id)).length;
    return `
      <div class="section-title">🏆 Succès (${unlocked}/${list.length})</div>
      <div class="ach-grid">
        ${list.map(a => {
          const got = Progression.isAchievementUnlocked(a.id);
          return `<div class="ach-cell ${got?'got':'locked'}" title="${a.desc}">
            <div class="ach-ico">${got ? a.icon : '🔒'}</div>
            <div class="ach-name">${a.name}</div>
            <div class="ach-desc">${a.desc}</div>
            ${got ? '<div class="ach-check">✓</div>' : ''}
          </div>`;
        }).join('')}
      </div>`;
  },

  /* ===== ADMIN PANEL ===== */
  renderAdmin(body) {
    const ai = GS.ai;
    body.innerHTML = `
      <div class="admin-warning">⚠️ Panel Sandbox — Modifications directes du moteur de jeu. Usage développeur/test uniquement.</div>

      <div class="admin-section">
        <h4>💰 Capital & Réputation</h4>
        <div class="admin-row"><label>Ajouter capital ($)</label><input class="admin-input" id="adm-cash-val" type="number" value="5000000" min="0"></div>
        <div class="admin-btn-row">
          <button class="admin-btn gold" id="adm-add-cash">+ Ajouter fonds</button>
          <button class="admin-btn danger" id="adm-remove-cash">− Retirer fonds</button>
          <button class="admin-btn" id="adm-bankrupt">Mettre en faillite</button>
        </div>
        <div class="admin-row" style="margin-top:8px"><label>Réputation</label><input class="admin-input" id="adm-rep-val" type="number" value="25" min="0" max="100"></div>
        <div class="admin-btn-row">
          <button class="admin-btn" id="adm-set-rep">Définir réputation</button>
        </div>
      </div>

      <div class="admin-section">
        <h4>✈ Générer des Appareils Gratuits</h4>
        <div class="admin-row"><label>Modèle</label>
          <select class="admin-input" id="adm-ac-model">
            ${AIRCRAFT_MODELS.map(m=>`<option value="${m.id}">${m.name}</option>`).join('')}
          </select>
        </div>
        <div class="admin-btn-row">
          <button class="admin-btn gold" id="adm-gen-ac">✈ Générer cet appareil</button>
        </div>
      </div>

      <div class="admin-section">
        <h4>⛽ Marché</h4>
        <div class="admin-row"><label>Prix carburant ($/L)</label><input class="admin-input" id="adm-fuel-val" type="number" value="${GS.market.fuelPrice.toFixed(2)}" step="0.05" min="0.3" max="3.0"></div>
        <div class="admin-btn-row"><button class="admin-btn" id="adm-set-fuel">Définir prix</button></div>
        <div class="admin-row" style="margin-top:8px"><label>Multiplicateur demande</label><input class="admin-input" id="adm-demand-val" type="number" value="${GS.market.demandMultiplier.toFixed(2)}" step="0.1" min="0.1" max="5.0"></div>
        <div class="admin-btn-row"><button class="admin-btn" id="adm-set-demand">Définir multiplicateur</button></div>
      </div>

      <div class="admin-section">
        <h4>🤖 IA Rivale</h4>
        <div class="admin-toggle">
          <label class="toggle-switch"><input type="checkbox" id="adm-ai-toggle" ${!ai || ai.enabled!==false ? 'checked':''}><span class="toggle-slider"></span></label>
          <span class="toggle-label">IA ${ai?.name || 'Non initialisée'} — ${ai?.fleet?.length||0} appareils</span>
        </div>
        <div class="admin-btn-row" style="margin-top:8px">
          <button class="admin-btn" id="adm-reset-ai">Réinitialiser IA</button>
          <button class="admin-btn" id="adm-trigger-event">Déclencher événement aléatoire</button>
        </div>
      </div>

      <div class="admin-section">
        <h4>💾 Données</h4>
        <div class="admin-btn-row">
          <button class="admin-btn" id="adm-save-now">Sauvegarder maintenant</button>
          <button class="admin-btn danger" id="adm-delete-save">Supprimer la sauvegarde</button>
        </div>
      </div>
    `;
    document.getElementById('adm-add-cash')?.addEventListener('click', () => {
      const v = parseFloat(document.getElementById('adm-cash-val').value)||0;
      GS.addToBalance(v, 'admin', 'Admin: ajout de fonds');
      this.notify(`+$${v.toLocaleString()} ajouté.`, 'success');
      this.updateHeader();
    });
    document.getElementById('adm-remove-cash')?.addEventListener('click', () => {
      const v = parseFloat(document.getElementById('adm-cash-val').value)||0;
      GS.addToBalance(-v, 'admin', 'Admin: retrait de fonds');
      this.notify(`-$${v.toLocaleString()} retiré.`, 'warning');
      this.updateHeader();
    });
    document.getElementById('adm-bankrupt')?.addEventListener('click', () => {
      GS.finances.balance = 0;
      this.notify('Capital mis à zéro.', 'error');
      this.updateHeader();
    });
    document.getElementById('adm-set-rep')?.addEventListener('click', () => {
      const v = parseInt(document.getElementById('adm-rep-val').value)||0;
      if (GS.company) GS.company.reputation = Math.max(0, Math.min(100, v));
      this.notify(`Réputation définie à ${v}.`, 'success');
      this.updateHeader();
    });
    document.getElementById('adm-gen-ac')?.addEventListener('click', () => {
      const modelId = document.getElementById('adm-ac-model').value;
      const model = getAircraftModel(modelId);
      if (!model) return;
      const ac = {
        id: GS.genId(), modelId: model.id, name: `${GS.company?.iata||'HV'}-${GS.fleet.length+1}-ADMIN`,
        status: 'available', condition: 100, ageHours: 0, routeId: null, flightId: null,
        phase: 'ground', progress: 0,
        lat: getAirport(GS.company?.hub)?.lat||0, lon: getAirport(GS.company?.hub)?.lon||0,
        heading: 90, passengers: 0, currentAlt: 0, currentSpeed: 0, leased: false,
      };
      GS.fleet.push(ac);
      this.notify(`${model.name} généré gratuitement !`, 'success');
      this.updateHeader();
    });
    document.getElementById('adm-set-fuel')?.addEventListener('click', () => {
      const v = parseFloat(document.getElementById('adm-fuel-val').value)||0.95;
      GS.market.fuelPrice = Math.max(0.3, Math.min(3.0, v));
      this.notify(`Prix carburant : $${GS.market.fuelPrice.toFixed(2)}/L`, 'success');
    });
    document.getElementById('adm-set-demand')?.addEventListener('click', () => {
      const v = parseFloat(document.getElementById('adm-demand-val').value)||1.0;
      GS.market.demandMultiplier = Math.max(0.1, Math.min(5.0, v));
      this.notify(`Multiplicateur demande : ×${GS.market.demandMultiplier.toFixed(2)}`, 'success');
    });
    document.getElementById('adm-ai-toggle')?.addEventListener('change', e => {
      AIEngine.toggle(e.target.checked);
      this.notify(`IA ${e.target.checked ? 'activée' : 'désactivée'}.`, 'info');
    });
    document.getElementById('adm-reset-ai')?.addEventListener('click', () => {
      if (GS.company) {
        MapEngine.layers.aiAircraft.clearLayers();
        MapEngine.markers.aiAircraft = {};
        AIEngine.create(GS.company.hub);
      }
      this.notify('IA réinitialisée.', 'success');
    });
    document.getElementById('adm-trigger-event')?.addEventListener('click', () => {
      const pool = EVENTS_POOL;
      const ev = pool[Math.floor(Math.random() * pool.length)];
      const instance = { ...ev, active: true, startDate: new Date(GS.gameDate), daysRemaining: ev.duration };
      GS.events.push(instance);
      Economy.applyEvent(instance);
      this.notify(`Événement déclenché : ${ev.title}`, 'warning');
    });
    document.getElementById('adm-save-now')?.addEventListener('click', () => {
      SaveSystem.save();
      this.notify('Partie sauvegardée.', 'success');
    });
    document.getElementById('adm-delete-save')?.addEventListener('click', () => {
      SaveSystem.deleteSave();
      this.notify('Sauvegarde supprimée.', 'error');
    });
  },

  /* ===== MODAL ===== */
  showModal(title, content, buttons = []) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    const footer = document.getElementById('modal-footer');
    footer.innerHTML = '';
    buttons.forEach(btn => {
      const el = document.createElement('button');
      el.className = btn.cls || 'btn-ghost';
      el.textContent = btn.label;
      el.addEventListener('click', btn.action);
      footer.appendChild(el);
    });
    document.getElementById('modal-overlay').classList.remove('hidden');
    this.currentModal = title;
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    this.currentModal = null;
  },

  /* ===== NOTIFICATIONS ===== */
  notify(message, type = 'info', duration = 4000) {
    const area = document.getElementById('notif-area');
    if (!area) return;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const div = document.createElement('div');
    div.className = `notif ${type}`;
    div.innerHTML = `<span class="notif-ico">${icons[type]||'ℹ️'}</span><div class="notif-text">${message}</div>`;
    area.appendChild(div);
    setTimeout(() => { div.style.opacity='0'; div.style.transform='translateX(30px)'; div.style.transition='all .3s'; setTimeout(()=>div.remove(), 300); }, duration);
  },

  /* ===== HELPERS ===== */
  makeStars(n) {
    return `<span class="stars">${'★'.repeat(Math.round(n))}${'☆'.repeat(10-Math.round(n))}</span>`;
  },
};
