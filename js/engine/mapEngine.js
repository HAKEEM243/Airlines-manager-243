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
      center: [15, 20],
      zoom: 3,
      zoomControl: true,
      attributionControl: true,
      minZoom: 2,
      maxZoom: 12,
      worldCopyJump: true,
    });

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
      marker.bindPopup(this.buildAirportPopup(ap), { className: 'ap-popup' });
      marker.on('click', e => {
        e.originalEvent.stopPropagation();
      });
      marker.addTo(this.layers.airports);
      this.markers.airports[ap.iata] = marker;
    });
  },

  buildAirportPopup(ap) {
    const dist = GS.company ? (() => {
      const hub = getAirport(GS.company.hub);
      return hub ? calcDistance(hub, ap) + ' km' : '-';
    })() : '-';
    return `<div class="popup-title">${ap.city} (${ap.iata})</div>
      <div class="popup-row"><span>Pays</span><strong>${ap.country}</strong></div>
      <div class="popup-row"><span>Demande PAX</span><strong>${ap.demandPax.toLocaleString()}/j</strong></div>
      <div class="popup-row"><span>Cargo</span><strong>${ap.demandCargo} t/j</strong></div>
      <div class="popup-row"><span>Attractivité</span><strong>${ap.attractivity}/10</strong></div>
      <div class="popup-row"><span>Taxe d'atterrissage</span><strong>$${ap.landingFee.toLocaleString()}</strong></div>
      <div class="popup-row"><span>Dist. depuis hub</span><strong>${dist}</strong></div>`;
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
    const pts = geodesicPoints(o, d, 80);
    const pl = L.polyline(pts, {
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
      const icon = this.buildAircraftIcon(aircraft.heading || 0, '#00d4ff', model);
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
      const icon = this.buildAircraftIcon(ac.heading || 90, ai.color || '#ff6b35', null);
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

  buildAircraftIcon(heading, color, model) {
    const size = model && model.category === 'widebody' ? 24 : 20;
    const r = heading - 90;
    const svg = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
      style="transform:rotate(${r}deg);filter:drop-shadow(0 2px 4px rgba(0,0,0,0.8))">
      <path d="M21 15l-9-5.5L3 15V13l9-9.5 9 9.5v2z" fill="${color}" opacity="0.95"/>
      <path d="M12 3.5L3 13v2l9-5.5 9 5.5v-2L12 3.5z" fill="${color}" opacity="0.5"/>
    </svg>`;
    return L.divIcon({
      className: 'ac-marker',
      html: svg,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
    });
  },

  showFlightTooltip(aircraft) {
    const tooltip = document.getElementById('flight-tooltip');
    if (!tooltip) return;
    const route = GS.getRoute(aircraft.routeId);
    document.getElementById('ft-airline').textContent = GS.company ? GS.company.name : '-';
    document.getElementById('ft-num').textContent = aircraft.flightId || '-';
    document.getElementById('ft-route').textContent = route ? `${route.origin} → ${route.destination}` : '-';
    document.getElementById('ft-phase').textContent = FlightEngine.getPhaseLabel(aircraft.phase);
    document.getElementById('ft-alt').textContent = aircraft.currentAlt ? `${aircraft.currentAlt.toLocaleString()} m` : '0 m';
    document.getElementById('ft-spd').textContent = aircraft.currentSpeed ? `${aircraft.currentSpeed} km/h` : '-';
    document.getElementById('ft-pax').textContent = aircraft.passengers || 0;
    document.getElementById('ft-eta').textContent = FlightEngine.getETA(aircraft);
    tooltip.classList.remove('hidden');
    if (aircraft.lat && aircraft.lon) {
      this.map.panTo([aircraft.lat, aircraft.lon], { animate: true, duration: 0.5 });
    }
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
  },
};
