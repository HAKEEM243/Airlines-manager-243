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
    return { success: true, route };
  },

  launchFlight(route, aircraft) {
    if (!aircraft || !route) return;
    const o = getAirport(route.origin);
    const d = getAirport(route.destination);
    if (!o || !d) return;
    const model = getAircraftModel(aircraft.modelId);
    if (!model) return;
    const now = GS.gameDate;
    const dist = route.distanceKm;
    const durationHours = route.durationHours;
    const durationMs = durationHours * 3600 * 1000 / (GS.gameSpeed || 1);
    aircraft.status = 'flying';
    aircraft.flightId = GSHelpers.createFlightId(route.origin, route.destination);
    aircraft.routeId = route.id;
    aircraft.departureTime = new Date(now);
    aircraft.arrivalTime = new Date(now.getTime() + durationHours * 3600 * 1000);
    aircraft.durationHours = durationHours;
    aircraft.phase = 'ground';
    aircraft.progress = 0;
    aircraft.distanceKm = dist;
    aircraft.origin = route.origin;
    aircraft.destination = route.destination;
    aircraft.passengers = Math.round(model.paxCapacity * (route.loadFactor || 0.82));
    aircraft.currentAlt = 0;
    aircraft.currentSpeed = 0;
    aircraft.lat = o.lat;
    aircraft.lon = o.lon;
    aircraft.heading = this.calcBearing(o.lat, o.lon, d.lat, d.lon);
    const pts = geodesicPoints(o, d, 100);
    aircraft.pathPoints = pts;
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
    const capacityRatio = demand / model.paxCapacity;
    let lf = Math.min(0.98, 0.55 + capacityRatio * 0.3);
    lf += (serviceLevel - 1) * 0.04;
    if (GS.alliances.includes('skyworld')) lf += 0.05;
    if (GS.alliances.includes('pacifica')) lf += 0.04;
    const rep = GS.company ? GS.company.reputation : 0;
    lf += rep * 0.002;
    return Math.min(0.98, Math.max(0.35, lf));
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
