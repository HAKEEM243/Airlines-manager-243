/* ===== ROUTES ENGINE — Hakvision Aircraft ===== */
const RouteEngine = {

  createRoute(origin, destination, aircraftId, options = {}) {
    const o = getAirport(origin);
    const d = getAirport(destination);
    if (!o || !d) return { error: 'Aéroports invalides.' };
    if (origin === destination) return { error: 'Origine et destination identiques.' };

    const aircraft = GS.getAircraft(aircraftId);
    if (!aircraft) return { error: 'Appareil introuvable.' };
    if (aircraft.status !== 'ground' && aircraft.status !== 'available') {
      return { error: 'Cet appareil est déjà assigné à une route.' };
    }

    const model = getAircraftModel(aircraft.modelId);
    const dist = calcDistance(o, d);

    if (!canFlyRoute(model, dist)) {
      return { error: `L'autonomie de ${model.name} (${model.range} km) est insuffisante pour cette route (${dist} km).` };
    }

    const waypoints = options.waypoints || [];
    const totalDist = this.calcTotalDistance(origin, destination, waypoints);
    const duration = calcFlightDuration(totalDist, model);
    const demand = Economy.calcRouteDemand(origin, destination);
    const cabinConfig = options.cabinConfig || { economy: 0.80, premeco: 0.10, business: 0.08, first: 0.02 };
    const serviceLevel = options.serviceLevel || GS.company.service.level;
    const loadFactor = this.estimateLoadFactor(dist, demand, model, serviceLevel);

    const route = {
      id: GS.genId(),
      origin,
      destination,
      waypoints,
      aircraftId,
      aircraftModelId: aircraft.modelId,
      status: 'active',
      distanceKm: totalDist,
      durationHours: duration,
      demand,
      loadFactor,
      cabinConfig,
      serviceLevel,
      frequency: options.frequency || 1,
      autoReturn: options.autoReturn !== false,
      totalFlights: 0,
      totalRevenue: 0,
      totalProfit: 0,
      createdAt: new Date(GS.gameDate),
      estimatedMonthlyProfit: 0,
    };

    route.estimatedMonthlyProfit = Economy.calcRouteProfit(route) * route.frequency * 30;
    GS.routes.push(route);
    aircraft.status = 'assigned';
    aircraft.routeId = route.id;
    this.launchFlight(route, aircraft);
    if (typeof Progression !== 'undefined') {
      Progression.addXP(40, 'new_route');
      Progression.checkAchievements();
    }
    return { success: true, route };
  },

  // Builds a multi-segment geodesic path through an ordered list of IATA stops.
  // Supports stopovers (escales) so the aircraft visibly routes via waypoints.
  buildLegPath(stops) {
    let points = [];
    let totalDist = 0;
    const labels = [];
    for (let i = 0; i < stops.length - 1; i++) {
      const a = getAirport(stops[i]);
      const b = getAirport(stops[i + 1]);
      if (!a || !b) continue;
      totalDist += calcDistance(a, b);
      const seg = geodesicPoints(a, b, 50);
      if (i > 0 && seg.length) seg.shift(); // avoid duplicate junction point
      points = points.concat(seg);
      labels.push(stops[i]);
    }
    labels.push(stops[stops.length - 1]);
    return { points, totalDist, stops: labels };
  },

  // Launches a flight from the aircraft's CURRENT location toward the far
  // endpoint of the route (outbound origin→dest, or return dest→origin),
  // routing through any waypoints along the way.
  launchFlight(route, aircraft) {
    return this.dispatchFlight(route, aircraft);
  },

  dispatchFlight(route, aircraft) {
    if (!aircraft || !route) return { error: 'Données invalides.' };
    const model = getAircraftModel(aircraft.modelId);
    if (!model) return { error: 'Modèle introuvable.' };
    if (aircraft.status === 'flying') return { error: 'Appareil déjà en vol.' };

    const here = aircraft.locationIata || route.origin;
    const atDest = here === route.destination;
    const wp = route.waypoints || [];
    const stops = atDest
      ? [route.destination, ...[...wp].reverse(), route.origin]
      : [route.origin, ...wp, route.destination];

    const fromIata = stops[0];
    const toIata = stops[stops.length - 1];
    const fromAp = getAirport(fromIata);
    const toAp = getAirport(toIata);
    if (!fromAp || !toAp) return { error: 'Aéroports invalides.' };

    const leg = this.buildLegPath(stops);
    const durationHours = calcFlightDuration(leg.totalDist, model);
    const now = GS.gameDate;

    aircraft.status = 'flying';
    aircraft.flightId = GSHelpers.createFlightId(fromIata, toIata);
    aircraft.routeId = route.id;
    aircraft.departureTime = new Date(now);
    aircraft.arrivalTime = new Date(now.getTime() + durationHours * 3600 * 1000);
    aircraft.durationHours = durationHours;
    aircraft.phase = 'taxiing';
    aircraft.progress = 0;
    aircraft.distanceKm = leg.totalDist;
    aircraft.origin = fromIata;
    aircraft.destination = toIata;
    aircraft.legStops = leg.stops;
    aircraft.passengers = Math.round(model.paxCapacity * (route.loadFactor || 0.82));
    aircraft.currentAlt = 0;
    aircraft.currentSpeed = 0;
    aircraft.lat = fromAp.lat;
    aircraft.lon = fromAp.lon;
    aircraft.locationIata = null;
    aircraft.pathPoints = leg.points;
    const nxt = leg.points[1] || [toAp.lat, toAp.lon];
    aircraft.heading = this.calcBearing(fromAp.lat, fromAp.lon, nxt[0], nxt[1]);
    return { success: true };
  },

  calcTotalDistance(origin, destination, waypoints = []) {
    const stops = [origin, ...waypoints, destination];
    let total = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      const a = getAirport(stops[i]);
      const b = getAirport(stops[i + 1]);
      if (a && b) total += calcDistance(a, b);
    }
    return total;
  },

  estimateLoadFactor(distKm, demand, model, serviceLevel = 1) {
    if (!demand || !model) return 0.5;
    // Right-sizing curve: matching capacity to demand is rewarded; an
    // oversized aircraft on a thin route fills poorly and loses money.
    const ratio = demand / model.paxCapacity;
    let lf = 0.97 * (ratio / (ratio + 0.4));
    lf += (serviceLevel - 1) * 0.04;
    if (GS.alliances.includes('skyworld')) lf += 0.04;
    if (GS.alliances.includes('pacifica')) lf += 0.04;
    const rep = GS.company ? GS.company.reputation : 0;
    lf += rep * 0.0015;
    return Math.min(0.98, Math.max(0.30, lf));
  },

  // Suggests an ideal seat count for a route's daily demand
  getRecommendedCapacity(demand) {
    // Target a healthy ~85% load factor: ratio ≈ 1.9 gives lf≈0.80
    return Math.max(50, Math.round(demand / 1.9));
  },

  // Rates how well an aircraft's capacity fits a route's demand
  rateRightSizing(demand, capacity) {
    if (!demand || !capacity) return { label: '—', cls: 'mid', ratio: 0 };
    const ratio = demand / capacity;
    if (ratio < 0.6) return { label: 'Surdimensionné', cls: 'bad', ratio };
    if (ratio < 1.1) return { label: 'Un peu grand', cls: 'mid', ratio };
    if (ratio <= 4) return { label: 'Bon dimensionnement', cls: 'good', ratio };
    return { label: 'Forte demande — agrandir', cls: 'mid', ratio };
  },

  removeRoute(routeId) {
    const idx = GS.routes.findIndex(r => r.id === routeId);
    if (idx === -1) return false;
    const route = GS.routes[idx];
    const aircraft = GS.fleet.find(a => a.routeId === routeId);
    if (aircraft) {
      aircraft.status = 'ground';
      aircraft.routeId = null;
      aircraft.flightId = null;
      aircraft.phase = 'arrived';
      const dest = getAirport(route.destination);
      if (dest) { aircraft.lat = dest.lat; aircraft.lon = dest.lon; }
    }
    GS.routes.splice(idx, 1);
    return true;
  },

  calcBearing(lat1, lon1, lat2, lon2) {
    const toRad = d => d * Math.PI / 180;
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  },

  getRouteInfo(origin, destination) {
    const o = getAirport(origin);
    const d = getAirport(destination);
    if (!o || !d) return null;
    const dist = calcDistance(o, d);
    const demand = Economy.calcRouteDemand(origin, destination);
    return {
      distance: dist,
      demand,
      fuelImpact: (dist / 1000).toFixed(1),
      recommended: AIRCRAFT_MODELS.filter(m => canFlyRoute(m, dist) && m.category !== 'cargo').map(m => m.id),
    };
  },

  exportRouteSummary() {
    return GS.routes.map(r => {
      const profit = Economy.calcRouteProfit(r);
      return {
        id: r.id,
        origin: r.origin,
        destination: r.destination,
        aircraft: r.aircraftId,
        distKm: r.distanceKm,
        profitPerFlight: profit,
        status: r.status,
      };
    });
  },
};
