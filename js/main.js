/* ===== MAIN ENTRY POINT — Hakvision Aircraft ===== */
(function() {
  'use strict';

  const GAME_TICK_INTERVAL = 1000;
  const MINUTES_PER_TICK_SPEED = { 0: 0, 1: 1, 2: 2, 5: 5, 10: 10 };
  let gameLoopTimer = null;
  let renderLoopId = null;
  let monthTickCounter = 0;
  let lastDayTick = 0;

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
    startGameLoop();
    startRenderLoop();
    SaveSystem.startAutoSave();
    if (isNew) {
      UI.notify(`Bienvenue, ${GS.company.name} ! Votre aventure commence.`, 'success', 5000);
      setTimeout(() => UI.notify('Conseil : Achetez des appareils et créez vos premières routes.', 'info', 6000), 1500);
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
    if (GS.paused || GS.gameSpeed === 0) return;
    const minutes = MINUTES_PER_TICK_SPEED[GS.gameSpeed] || 1;
    GS.gameDate = new Date(GS.gameDate.getTime() + minutes * 60 * 1000);
    GS._tickAccum = (GS._tickAccum || 0) + minutes;
    FlightEngine.tick(minutes);
    AIEngine.tick(minutes);
    monthTickCounter += minutes;
    if (monthTickCounter >= 43200) {
      Economy.tickMonthlyCharges();
      Economy.tickFuelPrice();
      monthTickCounter = 0;
    }
    if (GS._tickAccum - lastDayTick >= 1440) {
      const event = Economy.maybeSpawnEvent();
      if (event) {
        UI.notify(`⚡ ${event.title} : ${event.desc}`, event.impact === 'positive' ? 'success' : 'warning', 6000);
        if (UI.currentTab === 'company') UI.refreshPanel();
      }
      Economy.tickEvents();
      lastDayTick = GS._tickAccum;
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
        const speed = parseInt(btn.dataset.speed);
        GS.gameSpeed = speed;
        GS.paused = speed === 0;
        document.querySelectorAll('.spd').forEach(b => b.classList.toggle('active', b.dataset.speed == speed));
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
        if (GS.paused) GS.gameSpeed = 0;
        else GS.gameSpeed = 1;
        document.querySelectorAll('.spd').forEach(b => b.classList.toggle('active', b.dataset.speed == GS.gameSpeed));
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
