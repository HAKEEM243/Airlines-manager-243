/* ===== MAIN ENTRY POINT — Hakvision Aircraft ===== */
(function() {
  'use strict';

  const GAME_TICK_INTERVAL = 1000;
  // Minutes of game time advanced per real second in each mode
  const TIME_MODE_MINUTES = { paused: 0, realistic: 2, standard: 8, fast: 30 };
  let gameLoopTimer = null;
  let renderLoopId = null;
  let monthTickCounter = 0;
  let lastDayTick = 0;
  let lastLowBalanceWarn = -1e9;

  /* ===== STARTER CONTENT FOR NEW GAME ===== */
  function makeStarterAircraft(modelId, num) {
    const hub = getAirport(GS.company.hub);
    return {
      id: GS.genId(),
      modelId,
      name: GS.company.iata + '-' + String(num).padStart(3, '0'),
      status: 'available',
      condition: 96,
      ageHours: 0,
      routeId: null,
      flightId: null,
      phase: 'ground',
      progress: 0,
      lat: hub ? hub.lat : 0,
      lon: hub ? hub.lon : 0,
      heading: 90,
      passengers: 0,
      currentAlt: 0,
      currentSpeed: 0,
      leased: false,
      leaseCost: 0,
    };
  }

  function giveStarterContent() {
    const hub = getAirport(GS.company.hub);
    if (!hub) return;

    // Give starter pilots their initial type ratings (ATR + CRJ, matching starter aircraft)
    GS.crew.filter(c => c.type === 'pilot').forEach(p => {
      p.typeRatings = ['atr', 'crj'];
    });

    // Two free starter aircraft: one flies immediately, one stays parked
    const flyer = makeStarterAircraft('atr72', 1);
    const parked = makeStarterAircraft('crj900', 2);
    GS.fleet.push(flyer, parked);

    // Auto-launch the first aircraft toward the best nearby destination
    const model = getAircraftModel('atr72');
    if (model) {
      const candidates = AIRPORTS.filter(ap => {
        if (ap.iata === hub.iata) return false;
        const dist = calcDistance(hub, ap);
        return dist > 150 && dist <= model.range * 0.9 && ap.demandPax >= 2000;
      }).sort((a, b) => b.demandPax - a.demandPax);

      if (candidates.length > 0) {
        const dest = candidates[0];
        const result = RouteEngine.createRoute(hub.iata, dest.iata, flyer.id, {
          cabinConfig: { economy: 0.85, premeco: 0.10, business: 0.05, first: 0 },
        });
        if (result.success) {
          MapEngine.addRoutePolyline(result.route);
        }
      }
    }
    UI.updateHeader();
  }

  /* ===== WELCOME TUTORIAL ===== */
  function showWelcomeTutorial() {
    const firstRoute = GS.routes[0];
    const firstAc = GS.fleet[0];
    const destName = firstRoute ? (getAirport(firstRoute.destination)?.city || firstRoute.destination) : '-';
    const profit = firstRoute ? Economy.calcRouteProfit(firstRoute) : 0;
    UI.showModal('🎮 Bienvenue dans Hakvision Aircraft !', `
      <div style="text-align:center;padding:8px 0 14px">
        <div style="font-size:48px;margin-bottom:10px">✈</div>
        <h3 style="color:#fff;font-size:16px;margin-bottom:6px">Votre empire aérien commence !</h3>
        <p style="color:var(--txt-dim);font-size:13px;line-height:1.6">
          Capital de départ : <strong style="color:var(--gold)">$50,000,000</strong><br>
          Vous avez reçu <strong style="color:var(--cyan)">2 appareils gratuits</strong> :
          un ATR 72 ${firstRoute ? `déjà en vol vers <strong style="color:var(--cyan)">${destName}</strong>` : ''} et un CRJ-900 prêt à partir.
        </p>
      </div>
      ${firstRoute ? `<div style="background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);border-radius:var(--radius);padding:12px;margin-bottom:14px;font-size:12px;text-align:center">
        <div style="color:var(--green);font-weight:700;font-size:14px">🛫 Premier vol lancé automatiquement !</div>
        <div style="color:var(--txt-dim);margin-top:4px">${firstRoute.origin} → ${firstRoute.destination} · ${profit>0?'+':''}$${Math.abs(profit).toLocaleString()}/vol · regardez l'avion sur la carte</div>
      </div>` : ''}
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="background:rgba(0,212,255,0.06);border:1px solid var(--border-h);border-radius:var(--radius);padding:11px 14px;display:flex;gap:12px;align-items:center">
          <span style="font-size:22px;flex-shrink:0">👆</span>
          <div><strong style="color:var(--cyan);font-size:13px">Touchez un aéroport sur la carte</strong><br><span style="font-size:11px;color:var(--txt-dim)">→ « Créer une route ici » ouvre une ligne en 1 clic !</span></div>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px;display:flex;gap:12px;align-items:center">
          <span style="font-size:22px;flex-shrink:0">📊</span>
          <div><strong style="color:#fff;font-size:13px">Barre du bas</strong> → Flotte · Routes · Compagnie · Stats · Admin<br><span style="font-size:11px;color:var(--txt-dim)">Toute la gestion est là</span></div>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px;display:flex;gap:12px;align-items:center">
          <span style="font-size:22px;flex-shrink:0">⚡</span>
          <div><strong style="color:#fff;font-size:13px">Vitesse 5× activée</strong><br><span style="font-size:11px;color:var(--txt-dim)">Les vols se terminent en quelques secondes · changez en haut à droite</span></div>
        </div>
      </div>
    `, [
      { label: '🗺 Créer une route', cls: 'btn-primary', action: () => { UI.closeModal(); UI.openPanel('routes'); } },
      { label: 'Explorer la carte', cls: 'btn-ghost', action: () => { UI.closeModal(); } },
    ]);
  }

  /* ===== SPLASH SCREEN SETUP ===== */
  function initSplash() {
    const hasSave = SaveSystem.hasSave();
    if (hasSave) {
      const meta = SaveSystem.getMeta();
      document.getElementById('save-notice').classList.remove('hidden');
      document.getElementById('save-notice-text').textContent = meta
        ? `${meta.company} (${meta.iata}) · ${SaveSystem.formatGameDate(meta.gameDate)}`
        : 'Partie sauvegardée trouvée';
      document.getElementById('btn-continue').classList.remove('hidden');
    }
    document.getElementById('btn-new-game').addEventListener('click', showSetup);
    document.getElementById('btn-continue').addEventListener('click', continueGame);
  }

  function showSetup() {
    document.getElementById('splash-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
    initSetupForm();
  }

  function continueGame() {
    const ok = SaveSystem.load();
    if (!ok) { UI.notify('Erreur de chargement.','error'); return; }
    document.getElementById('splash-screen').classList.add('hidden');
    startGame(false);
  }

  /* ===== SETUP FORM ===== */
  function initSetupForm() {
    const btnLaunch = document.getElementById('btn-launch');
    const inpName = document.getElementById('inp-cname');
    const inpIata = document.getElementById('inp-iata');
    const inpHub = document.getElementById('inp-hub');
    const inpHubIata = document.getElementById('inp-hub-iata');
    const hubList = document.getElementById('hub-list');
    const hubCard = document.getElementById('hub-card');

    function validate() {
      const ok = inpName.value.trim().length >= 2 && inpIata.value.trim().length === 2 && inpHubIata.value;
      btnLaunch.disabled = !ok;
    }

    inpName.addEventListener('input', validate);
    inpIata.addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); validate(); });

    inpHub.addEventListener('input', e => {
      const q = e.target.value;
      if (q.length < 2) { hubList.classList.add('hidden'); return; }
      const results = searchAirports(q, 10);
      if (!results.length) { hubList.classList.add('hidden'); return; }
      hubList.innerHTML = results.map(ap =>
        `<div class="dropdown-item" data-iata="${ap.iata}">
          <div><span class="di-city">${ap.city}</span><br><span class="di-country">${ap.country}</span></div>
          <span class="di-iata">${ap.iata}</span>
        </div>`
      ).join('');
      hubList.classList.remove('hidden');
      hubList.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
          const ap = getAirport(item.dataset.iata);
          if (!ap) return;
          inpHub.value = `${ap.city} (${ap.iata})`;
          inpHubIata.value = ap.iata;
          hubList.classList.add('hidden');
          document.getElementById('hc-city').textContent = ap.city;
          document.getElementById('hc-country').textContent = ap.country;
          document.getElementById('hc-pax').textContent = ap.demandPax.toLocaleString();
          document.getElementById('hc-cargo').textContent = ap.demandCargo;
          document.getElementById('hc-attr').textContent = ap.attractivity + '/10';
          hubCard.classList.remove('hidden');
          validate();
        });
      });
    });

    document.getElementById('btn-back-splash').addEventListener('click', () => {
      document.getElementById('setup-screen').classList.add('hidden');
      document.getElementById('splash-screen').classList.remove('hidden');
    });

    btnLaunch.addEventListener('click', () => {
      const name = inpName.value.trim();
      const iata = inpIata.value.trim().toUpperCase();
      const hub = inpHubIata.value;
      GS.init({ name, iata }, hub);
      AIEngine.create(AIRPORTS[Math.floor(Math.random() * Math.min(20, AIRPORTS.length))].iata);
      document.getElementById('setup-screen').classList.add('hidden');
      startGame(true);
    });
  }

  /* ===== START GAME ===== */
  function startGame(isNew) {
    document.getElementById('game').classList.remove('hidden');
    MapEngine.init();
    setupGameControls();
    MapEngine.renderRoutes();
    MapEngine.focusHub();
    if (!isNew) {
      GS.routes.forEach(r => {
        const ac = GS.fleet.find(a => a.routeId === r.id);
        if (ac && ac.status === 'flying' && !ac.pathPoints) {
          const o = getAirport(ac.origin || r.origin);
          const d = getAirport(ac.destination || r.destination);
          if (o && d) {
            ac.pathPoints = geodesicPoints(o, d, 100);
            ac.departureTime = ac.departureTime ? new Date(ac.departureTime) : new Date(GS.gameDate);
            ac.arrivalTime = ac.arrivalTime ? new Date(ac.arrivalTime) : new Date(GS.gameDate.getTime() + 3600000 * 5);
          }
        }
      });
      MapEngine.renderRoutes();
    }
    UI.updateHeader();

    // Default to Standard mode
    GS.timeMode = GS.timeMode || 'standard';
    GS.paused = false;
    document.querySelectorAll('.spd').forEach(b => b.classList.toggle('active', b.dataset.mode === (GS.timeMode || 'standard')));

    startGameLoop();
    startRenderLoop();
    SaveSystem.startAutoSave();

    // Request push notification permission
    if (typeof GameNotifications !== 'undefined') {
      setTimeout(() => GameNotifications.requestPermission(), 3000);
    }

    if (isNew) {
      giveStarterContent();
      setTimeout(() => MapEngine.renderRoutes(), 200);
      setTimeout(() => showWelcomeTutorial(), 800);
    } else {
      UI.notify(`Reprise de la partie — ${GS.company.name}`, 'success', 3000);
    }
  }

  /* ===== GAME LOOP ===== */
  function startGameLoop() {
    if (gameLoopTimer) clearInterval(gameLoopTimer);
    gameLoopTimer = setInterval(gameTick, GAME_TICK_INTERVAL);
  }

  function gameTick() {
    if (GS.paused) return;
    const minutes = TIME_MODE_MINUTES[GS.timeMode || 'standard'] || 8;
    if (minutes === 0) return;
    GS.gameDate = new Date(GS.gameDate.getTime() + minutes * 60 * 1000);
    GS._tickAccum = (GS._tickAccum || 0) + minutes;
    FlightEngine.tick(minutes);
    AIEngine.tick(minutes);
    monthTickCounter += minutes;
    if (monthTickCounter >= 43200) {
      Economy.tickMonthlyCharges();
      Economy.tickFuelPrice();
      if (typeof Finance !== 'undefined') Finance.tickMonthly();
      monthTickCounter = 0;
    }
    if (GS._tickAccum - lastDayTick >= 1440) {
      const event = Economy.maybeSpawnEvent();
      if (event) {
        UI.notify(`⚡ ${event.title} : ${event.desc}`, event.impact === 'positive' ? 'success' : 'warning', 6000);
        if (UI.currentTab === 'company') UI.refreshPanel();
      }
      Economy.tickEvents();
      if (typeof TypeRatings !== 'undefined') TypeRatings.tickTraining();
      if (typeof GameNotifications !== 'undefined') GameNotifications.checkAlerts();
      lastDayTick = GS._tickAccum;

      // Guidance when player is in the red
      if (GS.finances.balance < 0 && (GS._tickAccum - lastLowBalanceWarn) > 20160) {
        lastLowBalanceWarn = GS._tickAccum;
        const losing = GS.routes.filter(r => Economy.calcRouteProfit(r) < 0).length;
        const msg = losing > 0
          ? `💸 Capital négatif ! ${losing} route(s) perdent de l'argent. Utilisez un appareil mieux dimensionné ou ouvrez de nouvelles lignes rentables.`
          : `💸 Capital négatif ! Contractez un prêt (Compagnie → Finances) ou ouvrez plus de routes.`;
        UI.notify(msg, 'warning', 8000);
      }
    }
    UI.updateHeader();
  }

  /* ===== RENDER LOOP ===== */
  function startRenderLoop() {
    let lastRender = 0;
    function loop(ts) {
      if (ts - lastRender > 200) {
        MapEngine.refresh();
        MapEngine.updateNightOverlay();
        lastRender = ts;
      }
      renderLoopId = requestAnimationFrame(loop);
    }
    renderLoopId = requestAnimationFrame(loop);
  }

  /* ===== CONTROLS SETUP ===== */
  function setupGameControls() {
    document.querySelectorAll('.spd').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (!mode) return;
        GS.timeMode = mode;
        GS.paused = (mode === 'paused');
        document.querySelectorAll('.spd').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
      });
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (UI.currentTab === tab) UI.closePanel();
        else UI.openPanel(tab);
      });
    });

    document.getElementById('btn-panel-close')?.addEventListener('click', () => UI.closePanel());
    document.getElementById('btn-modal-close')?.addEventListener('click', () => UI.closeModal());
    document.getElementById('modal-overlay')?.addEventListener('click', e => {
      if (e.target === document.getElementById('modal-overlay')) UI.closeModal();
    });
    document.getElementById('btn-save')?.addEventListener('click', () => {
      SaveSystem.save();
      UI.notify('Partie sauvegardée !', 'success', 2000);
    });

    document.getElementById('mc-routes-toggle')?.addEventListener('click', e => {
      GS.settings.showRoutes = !GS.settings.showRoutes;
      e.currentTarget.classList.toggle('active', GS.settings.showRoutes);
      MapEngine.toggleRoutes(GS.settings.showRoutes);
    });
    document.getElementById('mc-airports-toggle')?.addEventListener('click', e => {
      GS.settings.showAirports = !GS.settings.showAirports;
      e.currentTarget.classList.toggle('active', GS.settings.showAirports);
      MapEngine.toggleAirports(GS.settings.showAirports);
    });
    document.getElementById('mc-night-toggle')?.addEventListener('click', e => {
      GS.settings.showNight = !GS.settings.showNight;
      e.currentTarget.classList.toggle('active', GS.settings.showNight);
      MapEngine.updateNightOverlay();
    });

    document.getElementById('ft-close')?.addEventListener('click', () => {
      document.getElementById('flight-tooltip').classList.add('hidden');
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (UI.currentModal) UI.closeModal();
        else if (UI.currentTab) UI.closePanel();
      }
      if (e.key === ' ' && !e.target.matches('input,select,textarea')) {
        GS.paused = !GS.paused;
        if (!GS.paused && (GS.timeMode === 'paused' || !GS.timeMode)) GS.timeMode = 'standard';
        const activeMode = GS.paused ? 'paused' : (GS.timeMode || 'standard');
        document.querySelectorAll('.spd').forEach(b => b.classList.toggle('active', b.dataset.mode === activeMode));
        e.preventDefault();
      }
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        SaveSystem.save(); UI.notify('Sauvegardé.','success',1500); e.preventDefault();
      }
    });
  }

  /* ===== INIT ===== */
  document.addEventListener('DOMContentLoaded', () => {
    initSplash();
  });

  window.addEventListener('resize', () => {
    MapEngine.updateNightOverlay();
  });

})();
