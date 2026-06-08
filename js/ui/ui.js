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
      <div class="ac-actions">
        ${aircraft.status === 'ground' || aircraft.status === 'available' ? `<button class="btn-primary btn-sm" id="btn-assign">Assigner une route</button>` : ''}
        ${aircraft.status === 'ground' ? `<button class="btn-secondary btn-sm" id="btn-maintenance">Maintenance ($${Math.round(model.purchasePrice*0.01).toLocaleString()})</button>` : ''}
        <button class="btn-danger btn-sm" id="btn-sell">Revendre ($${sellPrice.toLocaleString()})</button>
      </div>
    `, []);
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
    document.getElementById('btn-maintenance')?.addEventListener('click', () => {
      const cost = Math.round(model.purchasePrice * 0.01);
      if (GS.finances.balance < cost) { this.notify('Fonds insuffisants.', 'error'); return; }
      GS.addToBalance(-cost, 'maintenance', `Maintenance ${aircraft.name}`);
      aircraft.condition = Math.min(100, (aircraft.condition||100) + 25);
      this.closeModal();
      this.notify(`Maintenance de ${aircraft.name} effectuée.`, 'success');
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
    return models.map(m => `
      <div class="market-aircraft-card">
        <div class="mac-header">
          <div>
            <div class="mac-name">${m.icon} ${m.name}</div>
            <div class="mac-manufacturer">${m.manufacturer} · <span class="tag tag-category">${m.category}</span></div>
          </div>
          <div class="mac-price">$${(m.purchasePrice/1e6).toFixed(1)}M</div>
        </div>
        <div class="mac-specs">
          <div class="mac-spec"><div class="ms-val">${m.paxCapacity}</div><div class="ms-lbl">PAX</div></div>
          <div class="mac-spec"><div class="ms-val">${m.range.toLocaleString()}</div><div class="ms-lbl">km</div></div>
          <div class="mac-spec"><div class="ms-val">${m.cruiseSpeed}</div><div class="ms-lbl">km/h</div></div>
          <div class="mac-spec"><div class="ms-val">${m.comfortLevel}/10</div><div class="ms-lbl">Confort</div></div>
        </div>
        <p style="font-size:11px;color:var(--txt-dim);margin:6px 0 10px">${m.description}</p>
        <div class="mac-actions">
          <button class="btn-primary btn-sm" data-buy="${m.id}">✈ Acheter</button>
          <button class="btn-ghost btn-sm" data-lease="${m.id}">📋 Louer (${Math.round(m.purchasePrice*0.002/100)*100}$/mois)</button>
        </div>
      </div>
    `).join('');
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
      <div style="text-align:center;padding:12px 0">
        <div style="font-size:48px;margin-bottom:12px">${model.icon}</div>
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
    body.querySelectorAll('.route-card').forEach(card => {
      card.addEventListener('click', () => {
        const route = GS.getRoute(parseInt(card.dataset.rid));
        if (route) this.showRouteDetail(route);
      });
    });
  },

  buildRouteCard(r) {
    const o = getAirport(r.origin);
    const d = getAirport(r.destination);
    const profit = Economy.calcRouteProfit(r);
    const aircraft = GS.fleet.find(a => a.routeId === r.id);
    return `<div class="route-card" data-rid="${r.id}">
      <div class="rc-header">
        <div class="rc-route">
          <span class="iata">${r.origin}</span>
          <span class="arrow">→</span>
          <span class="iata">${r.destination}</span>
        </div>
        <span class="badge ${profit>0?'badge-green':'badge-red'}">${profit>0?'+':'-'}$${Math.abs(profit).toLocaleString()}</span>
      </div>
      <div class="rc-stats">
        <div class="rc-stat"><span>Distance</span><strong>${r.distanceKm?.toLocaleString()} km</strong></div>
        <div class="rc-stat"><span>Durée</span><strong>${r.durationHours?.toFixed(1)}h</strong></div>
        <div class="rc-stat"><span>Remplissage</span><strong>${Math.round((r.loadFactor||0)*100)}%</strong></div>
        <div class="rc-stat"><span>Vols</span><strong>${r.totalFlights||0}</strong></div>
      </div>
      <div class="rc-aircraft">${aircraft ? `✈ ${aircraft.name}` : '<span style="color:var(--red)">Aucun appareil</span>'} · ${r.waypoints?.length ? r.waypoints.length + ' escale(s)' : 'Direct'}</div>
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
      <div style="font-size:12px;color:var(--txt-dim);margin-bottom:8px">Appareil : ${aircraft ? aircraft.name : 'Aucun'}</div>
      ${route.waypoints?.length ? `<div style="font-size:12px;color:var(--txt-dim);margin-bottom:8px">Escales : ${route.waypoints.join(' → ')}</div>` : ''}
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
          <div class="rb-calc-row"><span>Appareils compatibles</span><strong>${routeInfo.recommended.length}</strong></div>
        </div>` : ''}

        <div class="section-title" style="margin-top:16px">Sélectionner un Appareil</div>
        ${availableAircraft.length ? `
          <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
            ${availableAircraft.map(ac => {
              const m = getAircraftModel(ac.modelId);
              const ok = routeInfo && m ? canFlyRoute(m, routeInfo.distance) : true;
              return `<label style="display:flex;align-items:center;gap:10px;background:var(--bg-card);border:1px solid ${selectedAircraftId===ac.id?'var(--border-h)':'var(--border)'};border-radius:8px;padding:10px;cursor:pointer;opacity:${ok?1:0.4}">
                <input type="radio" name="ac-sel" value="${ac.id}" ${selectedAircraftId===ac.id?'checked':''} ${ok?'':'disabled'}>
                <div>
                  <div style="font-weight:600;font-size:13px">${ac.name}</div>
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
  },

  renderCrew(container) {
    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div class="kpi-card" style="flex:1;margin-right:8px"><div class="kpi-label">Effectif total</div><div class="kpi-value">${GS.crew.length}</div></div>
        <div class="kpi-card" style="flex:1"><div class="kpi-label">Masse salariale</div><div class="kpi-value negative">$${GS.crew.reduce((s,c)=>s+c.salary,0).toLocaleString()}/mois</div></div>
      </div>
      ${GS.crew.map(c=>`<div class="crew-card">
        <div class="crew-avatar">${c.type==='pilot'?'🎖':'🧑‍✈️'}</div>
        <div class="crew-info">
          <div class="crew-name">${c.name}</div>
          <div class="crew-role">${c.role} ${c.longHaulSpec?'· 🌍 Long-courrier':''}</div>
          <div class="crew-stats">
            <div class="crew-skill" style="margin-right:12px">Exp: ${c.experience}%
              <div class="crew-bar"><div class="crew-bar-fill" style="width:${c.experience}%;background:var(--cyan)"></div></div>
            </div>
            <div class="crew-skill">Fiabilité: ${c.reliability}%
              <div class="crew-bar"><div class="crew-bar-fill" style="width:${c.reliability}%;background:var(--green)"></div></div>
            </div>
          </div>
        </div>
        <div style="font-size:12px;color:var(--gold);font-weight:600;white-space:nowrap">$${c.salary.toLocaleString()}/mois</div>
      </div>`).join('')}
      <button class="btn-secondary w100 mt2" id="btn-hire">+ Recruter du personnel ($15,000)</button>
    `;
    document.getElementById('btn-hire')?.addEventListener('click', () => {
      if (GS.finances.balance < 15000) { this.notify('Fonds insuffisants.','error'); return; }
      GS.addToBalance(-15000, 'crew', 'Recrutement');
      const isPilot = Math.random() > 0.5;
      const crew = {
        id: GS.genId(), name: ['Alex Leroy','Maria Santos','James Wright','Aiko Yamamoto','Kwame Mensah'][Math.floor(Math.random()*5)],
        role: isPilot?'Commandant de bord':'Agent de bord', type: isPilot?'pilot':'cabin',
        experience: 20+Math.floor(Math.random()*40), reliability: 50+Math.floor(Math.random()*40),
        longHaulSpec: Math.random()>0.6, salary: isPilot?7000+Math.floor(Math.random()*3000):2000+Math.floor(Math.random()*1000),
        assignedAircraft: null,
      };
      GS.crew.push(crew);
      this.notify(`${crew.name} recruté !`, 'success');
      this.renderCrew(container);
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
    body.innerHTML = `
      <div class="section-title">Vue d'Ensemble</div>
      <div class="dashboard-grid">
        <div class="kpi-card"><div class="kpi-label">Capital</div><div class="kpi-value ${balance<0?'negative':''}">${GS.getBalanceFormatted()}</div></div>
        <div class="kpi-card"><div class="kpi-label">Taux remplissage</div><div class="kpi-value ${lf>75?'positive':lf>50?'':'negative'}">${lf}%</div></div>
        <div class="kpi-card"><div class="kpi-label">Flotte en vol</div><div class="kpi-value ${inAir>0?'positive':''}">${inAir} / ${GS.fleet.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Revenus ce mois</div><div class="kpi-value positive">+$${totalRev.toLocaleString()}</div></div>
      </div>
      ${GS.routes.length === 0 ? `
        <div style="background:rgba(0,212,255,0.06);border:1px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:16px">
          <div style="font-weight:700;color:var(--cyan);margin-bottom:8px">🚀 Pour commencer</div>
          <div style="font-size:12px;color:var(--txt-dim);line-height:1.8">
            1. <strong style="color:#fff">Flotte → Marché</strong> : Achetez un appareil<br>
            2. <strong style="color:#fff">Routes → Créer</strong> : Ouvrez votre première ligne<br>
            3. Regardez votre avion décoller sur la carte !<br>
            <span style="color:var(--txt-muted)">💡 Admin → ajoutez des fonds pour accélérer le test</span>
          </div>
        </div>` : ''}

      <div class="section-title">Réputation</div>
      <div class="rep-display" style="margin-bottom:12px">
        <div class="rep-stars">${'★'.repeat(GS.company?.level||1)}${'☆'.repeat(5-(GS.company?.level||1))}</div>
        <div class="rep-num">${Math.round(rep)}</div>
        <div style="font-size:12px;color:var(--txt-dim);margin-left:8px">/ 100 · Niveau ${GS.company?.level||1}</div>
      </div>
      <div class="progress-bar" style="margin-bottom:16px">
        <div class="progress-fill fill-gold" style="width:${rep}%"></div>
      </div>

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
