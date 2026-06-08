/* ===== MAP ENGINE — Hakvision Aircraft ===== */
const MapEngine = {
  map: null,
  layers: {
    satellite: null,
    labels: null,
    routes: null,
    airports: null,
    aircraft: null,
    aiAircraft: null,
  },
  markers: {
    airports: {},
    aircraft: {},
    aiAircraft: {},
  },
  polylines: {},
  showRoutes: true,
  showAirports: true,
  initialized: false,

  init() {
    this.map = L.map('map', {
      center: [10, 20],
      zoom: 4,
      zoomControl: true,
      attributionControl: true,
      minZoom: 2,
      maxZoom: 12,
      worldCopyJump: true,
      dragging: true,
      tap: false,            // iOS Safari: let native touch drive Leaflet handlers
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      inertia: true,
    });
    // Place zoom control bottom-right so it's clear of the header
    this.map.zoomControl.setPosition('bottomright');

    this.layers.satellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '© ESRI World Imagery', maxZoom: 18 }
    ).addTo(this.map);

    this.layers.labels = L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { attribution: '', maxZoom: 18, opacity: 0.85 }
    ).addTo(this.map);

    this.layers.routes = L.layerGroup().addTo(this.map);
    this.layers.airports = L.layerGroup().addTo(this.map);
    this.layers.aircraft = L.layerGroup().addTo(this.map);
    this.layers.aiAircraft = L.layerGroup().addTo(this.map);

    this.renderAirports();
    this.map.on('click', () => {
      const tooltip = document.getElementById('flight-tooltip');
      if (tooltip) tooltip.classList.add('hidden');
    });

    this.map.on('zoomend', () => this.onZoomChange());
    this.initialized = true;
  },

  onZoomChange() {
    const z = this.map.getZoom();
    Object.values(this.markers.airports).forEach(m => {
      if (z < 4) m.setOpacity(0.6);
      else m.setOpacity(1);
    });
  },

  renderAirports() {
    this.layers.airports.clearLayers();
    this.markers.airports = {};
    if (!this.showAirports) return;
    AIRPORTS.forEach(ap => {
      const size = ap.demandPax > 50000 ? 10 : ap.demandPax > 20000 ? 8 : ap.demandPax > 5000 ? 6 : 5;
      const color = ap.hub ? '#ffd700' : (ap.continent === 'AF' ? '#00ffaa' : '#00d4ff');
      const icon = L.divIcon({
        className: 'ap-dot',
        html: `<svg width="${size*2}" height="${size*2}"><circle cx="${size}" cy="${size}" r="${size-1}" fill="${color}" fill-opacity="0.8" stroke="#fff" stroke-width="0.5"/></svg>`,
        iconSize: [size*2, size*2],
        iconAnchor: [size, size],
      });
      const marker = L.marker([ap.lat, ap.lon], { icon, zIndexOffset: 100 });
      marker.bindPopup(this.buildAirportPopup(ap), { className: 'ap-popup', minWidth: 220 });
      marker.on('click', e => {
        e.originalEvent.stopPropagation();
      });
      marker.on('popupopen', () => {
        const btn = document.querySelector(`.popup-route-btn[data-dest="${ap.iata}"]`);
        if (btn && !btn.classList.contains('is-hub')) {
          btn.addEventListener('click', () => {
            this.map.closePopup();
            UI.quickRouteTo(ap.iata);
          });
        }
      });
      marker.addTo(this.layers.airports);
      this.markers.airports[ap.iata] = marker;
    });
  },

  buildAirportPopup(ap) {
    const hub = GS.company ? getAirport(GS.company.hub) : null;
    const isHub = hub && hub.iata === ap.iata;
    const distKm = hub && !isHub ? calcDistance(hub, ap) : 0;
    const distStr = isHub ? 'Votre hub' : (hub ? distKm.toLocaleString() + ' km' : '-');
    const btn = isHub
      ? `<button class="popup-route-btn is-hub" data-dest="${ap.iata}" disabled>⭐ Votre hub principal</button>`
      : `<button class="popup-route-btn" data-dest="${ap.iata}">✈ Créer une route ici</button>`;
    return `<div class="popup-title">${ap.city} (${ap.iata})</div>
      <div class="popup-row"><span>Pays</span><strong>${ap.country}</strong></div>
      <div class="popup-row"><span>Demande PAX</span><strong>${ap.demandPax.toLocaleString()}/j</strong></div>
      <div class="popup-row"><span>Attractivité</span><strong>${ap.attractivity}/10</strong></div>
      <div class="popup-row"><span>Taxe d'atterrissage</span><strong>$${ap.landingFee.toLocaleString()}</strong></div>
      <div class="popup-row"><span>Dist. depuis hub</span><strong>${distStr}</strong></div>
      ${btn}`;
  },

  renderRoutes() {
    this.layers.routes.clearLayers();
    this.polylines = {};
    if (!this.showRoutes) return;
    GS.routes.forEach(route => this.addRoutePolyline(route));
  },

  addRoutePolyline(route) {
    const o = getAirport(route.origin);
    const d = getAirport(route.destination);
    if (!o || !d) return;
    // Route through waypoints (escales) so the drawn line matches the real path
    const stops = [route.origin, ...(route.waypoints || []), route.destination];
    const leg = (typeof RouteEngine !== 'undefined' && RouteEngine.buildLegPath)
      ? RouteEngine.buildLegPath(stops)
      : { points: geodesicPoints(o, d, 80) };
    const pl = L.polyline(leg.points, {
      color: '#00d4ff',
      weight: 1.5,
      opacity: 0.5,
      dashArray: '6,4',
    });
    pl.on('click', () => {
      UI.openPanel('routes');
    });
    pl.addTo(this.layers.routes);
    this.polylines[route.id] = pl;
    // Mark waypoint airports along the route
    (route.waypoints || []).forEach(w => {
      const ap = getAirport(w);
      if (ap) {
        L.circleMarker([ap.lat, ap.lon], { radius: 3, color: '#ffd700', fillColor: '#ffd700', fillOpacity: 0.9, weight: 1 })
          .addTo(this.layers.routes);
      }
    });
  },

  removeRoutePolyline(routeId) {
    if (this.polylines[routeId]) {
      this.layers.routes.removeLayer(this.polylines[routeId]);
      delete this.polylines[routeId];
    }
  },

  renderAircraft() {
    GS.fleet.forEach(aircraft => {
      if (aircraft.status !== 'flying') {
        if (this.markers.aircraft[aircraft.id]) {
          this.layers.aircraft.removeLayer(this.markers.aircraft[aircraft.id]);
          delete this.markers.aircraft[aircraft.id];
        }
        return;
      }
      const model = getAircraftModel(aircraft.modelId);
      const label = aircraft.flightId || (GS.company ? GS.company.iata : '');
      const icon = this.buildAircraftIcon(aircraft.heading || 0, '#00d4ff', model, label, false);
      if (this.markers.aircraft[aircraft.id]) {
        this.markers.aircraft[aircraft.id]
          .setLatLng([aircraft.lat, aircraft.lon])
          .setIcon(icon);
      } else {
        const marker = L.marker([aircraft.lat, aircraft.lon], { icon, zIndexOffset: 500 });
        marker.on('click', e => {
          e.originalEvent.stopPropagation();
          this.showFlightTooltip(aircraft);
        });
        marker.addTo(this.layers.aircraft);
        this.markers.aircraft[aircraft.id] = marker;
      }
    });
    Object.keys(this.markers.aircraft).forEach(id => {
      if (!GS.fleet.find(a => a.id == id && a.status === 'flying')) {
        this.layers.aircraft.removeLayer(this.markers.aircraft[id]);
        delete this.markers.aircraft[id];
      }
    });
  },

  renderAIAircraft() {
    const ai = GS.ai;
    if (!ai || !ai.enabled) return;
    (ai.fleet || []).forEach(ac => {
      if (ac.status !== 'flying') {
        if (this.markers.aiAircraft[ac.id]) {
          this.layers.aiAircraft.removeLayer(this.markers.aiAircraft[ac.id]);
          delete this.markers.aiAircraft[ac.id];
        }
        return;
      }
      const model = getAircraftModel(ac.modelId);
      const icon = this.buildAircraftIcon(ac.heading || 90, ai.color || '#ff6b35', model, ai.iata || 'AI', true);
      if (this.markers.aiAircraft[ac.id]) {
        this.markers.aiAircraft[ac.id]
          .setLatLng([ac.lat, ac.lon])
          .setIcon(icon);
      } else {
        const marker = L.marker([ac.lat, ac.lon], { icon, zIndexOffset: 400 });
        marker.bindPopup(`<div class="popup-title">${ai.name}</div><div class="popup-row"><span>Phase</span><strong>${FlightEngine.getPhaseLabel(ac.phase)}</strong></div>`, { className: 'ap-popup' });
        marker.addTo(this.layers.aiAircraft);
        this.markers.aiAircraft[ac.id] = marker;
      }
    });
  },

  buildAircraftIcon(heading, color, model, label, isAI) {
    const size = model && model.category === 'widebody' ? 34
               : model && model.category === 'supersonic' ? 32
               : model && (model.category === 'turboprop' || model.category === 'regional_jet') ? 26
               : 30;
    const r = (heading || 0);   // SVG nose points north (0°); heading is CW from north
    // Detailed top-down airplane silhouette (nose points up at 0°)
    const plane = `<svg class="ac-plane-svg" width="${size}" height="${size}" viewBox="0 0 32 32"
        style="transform:translate(-50%,-50%) rotate(${r}deg)" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 1.5c-1 0-1.7 1.4-1.9 3.4l-.3 6.2-11 6.1c-.5.3-.8.8-.8 1.4v1.3l11.9-3.4.3 6.3-3.2 2.4c-.3.2-.5.6-.5 1v.9l5.5-1.6h.4l5.5 1.6v-.9c0-.4-.2-.8-.5-1l-3.2-2.4.3-6.3 11.9 3.4v-1.3c0-.6-.3-1.1-.8-1.4l-11-6.1-.3-6.2C17.7 2.9 17 1.5 16 1.5z"
          fill="${color}" stroke="#06101f" stroke-width="0.9" stroke-linejoin="round"/>
        <ellipse cx="16" cy="9" rx="1" ry="3.4" fill="#fff" opacity="0.45"/>
      </svg>`;
    const glow = `<div class="ac-plane-glow" style="background:radial-gradient(circle, ${color}55 0%, transparent 65%)"></div>`;
    const pulse = `<div class="ac-pulse-ring" style="color:${color}"></div>`;
    const tag = label ? `<div class="ac-label ${isAI ? 'ai' : ''}">${label}</div>` : '';
    const html = `<div class="ac-plane-wrap">${pulse}${glow}${plane}${tag}</div>`;
    return L.divIcon({
      className: 'ac-marker',
      html,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
    });
  },

  showFlightTooltip(aircraft) {
    const tooltip = document.getElementById('flight-tooltip');
    if (!tooltip) return;
    this._activeTooltipId = aircraft.id;
    this.updateFlightTooltip();
    tooltip.classList.remove('hidden');
    if (aircraft.lat && aircraft.lon) {
      this.map.panTo([aircraft.lat, aircraft.lon], { animate: true, duration: 0.5 });
    }
  },

  // Live-refreshes the open flight tooltip so altitude/speed/ETA/position update in real time
  updateFlightTooltip() {
    const tooltip = document.getElementById('flight-tooltip');
    if (!tooltip || tooltip.classList.contains('hidden')) return;
    if (this._activeTooltipId == null) return;
    const aircraft = GS.getAircraft(this._activeTooltipId);
    if (!aircraft || aircraft.status !== 'flying') {
      tooltip.classList.add('hidden');
      this._activeTooltipId = null;
      return;
    }
    const route = GS.getRoute(aircraft.routeId);
    const pct = Math.round((aircraft.progress || 0) * 100);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('ft-airline', GS.company ? GS.company.name : '-');
    set('ft-num', aircraft.flightId || '-');
    set('ft-route', `${aircraft.origin || route?.origin || '?'} → ${aircraft.destination || route?.destination || '?'} · ${pct}%`);
    set('ft-phase', FlightEngine.getPhaseLabel(aircraft.phase));
    set('ft-alt', `${(aircraft.currentAlt || 0).toLocaleString()} m`);
    set('ft-spd', `${aircraft.currentSpeed || 0} km/h`);
    set('ft-pax', aircraft.passengers || 0);
    set('ft-eta', FlightEngine.getETA(aircraft));
  },

  focusHub() {
    if (!GS.company) return;
    const hub = getAirport(GS.company.hub);
    if (hub) this.map.flyTo([hub.lat, hub.lon], 5, { duration: 1 });
  },

  focusAirport(iata) {
    const ap = getAirport(iata);
    if (ap) this.map.flyTo([ap.lat, ap.lon], 7, { duration: 1 });
  },

  updateNightOverlay() {
    const canvas = document.getElementById('night-canvas');
    if (!canvas) return;
    const show = GS.settings.showNight;
    canvas.style.opacity = show ? '0.45' : '0';
    if (!show) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const now = GS.gameDate;
    const hours = now.getUTCHours() + now.getUTCMinutes() / 60;
    const sunLon = (hours / 24) * 360 - 180;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    const nightStart = ((sunLon + 180 + 90) % 360) / 360;
    const dayStart = ((sunLon + 180 - 90) % 360) / 360;
    gradient.addColorStop(0, 'rgba(0,5,30,0.8)');
    gradient.addColorStop(0.5, 'rgba(0,5,30,0)');
    gradient.addColorStop(1, 'rgba(0,5,30,0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  },

  toggleRoutes(show) {
    this.showRoutes = show;
    if (show) {
      this.renderRoutes();
    } else {
      this.layers.routes.clearLayers();
    }
  },

  toggleAirports(show) {
    this.showAirports = show;
    if (show) this.renderAirports();
    else this.layers.airports.clearLayers();
  },

  refresh() {
    if (!this.initialized) return;
    this.renderAircraft();
    this.renderAIAircraft();
    this.updateFlightTooltip();
  },
};
