/* ===== ECONOMY ENGINE — Hakvision Aircraft ===== */
const Economy = {
  // Ticket rates ($/km) — tuned so well-sized routes are clearly profitable
  BASE_TICKET_ECONOMY: 0.115,
  BASE_TICKET_PREMECO: 0.195,
  BASE_TICKET_BUSINESS: 0.44,
  BASE_TICKET_FIRST: 0.82,
  CARGO_RATE: 3.4,

  // Ancillary revenue per passenger (configurable per company service profile)
  ANCILLARY: {
    seatFee:  { base: 18,  label: 'Frais de siège choisi' },
    baggage:  { base: 32,  label: 'Bagages en soute' },
    wifi:     { base: 12,  label: 'Wi-Fi à bord' },
    meals:    { base: 22,  label: 'Repas à bord' },
  },

  // Returns total ancillary revenue per passenger based on company ancillary config
  calcAncillaryPerPax(distanceKm) {
    const config = GS.company ? (GS.company.ancillary || {}) : {};
    let total = 0;
    if (config.seatFee !== false) total += this.ANCILLARY.seatFee.base;
    if (config.baggage !== false) total += this.ANCILLARY.baggage.base;
    if (config.wifi) total += this.ANCILLARY.wifi.base;
    if (config.meals || distanceKm > 2000) total += this.ANCILLARY.meals.base * (distanceKm > 2000 ? 1 : 0.5);
    return Math.round(total);
  },

  calcTicketPrice(distanceKm, cabinClass, qualityIndex = 1.0) {
    const base = { economy: this.BASE_TICKET_ECONOMY, premeco: this.BASE_TICKET_PREMECO, business: this.BASE_TICKET_BUSINESS, first: this.BASE_TICKET_FIRST };
    const rate = base[cabinClass] || base.economy;
    let price = distanceKm * rate * qualityIndex;
    const demMult = GS.market.demandMultiplier || 1;
    price *= demMult;
    return Math.round(price);
  },

  calcRouteDemand(origin, dest) {
    const o = getAirport(origin);
    const d = getAirport(dest);
    if (!o || !d) return 0;
    const dist = calcDistance(o, d);
    const baseDemand = Math.sqrt(o.demandPax * d.demandPax) / 10;
    const attractMult = (o.attractivity + d.attractivity) / 20;
    const distPenalty = dist > 10000 ? 0.7 : dist > 6000 ? 0.85 : 1.0;
    // Seasonal demand: tourism peaks in summer (Jul/Aug) and Christmas (Dec)
    const month = GS.gameDate.getMonth(); // 0-11
    const seasonal = [0.88, 0.86, 0.92, 0.95, 1.00, 1.08, 1.18, 1.20, 1.05, 0.97, 0.90, 1.12][month] || 1;
    const mkt = GS.market.demandMultiplier || 1;
    return Math.round(baseDemand * attractMult * distPenalty * seasonal * mkt);
  },

  calcCargoRevenue(weightTons, distanceKm) {
    return Math.round(weightTons * distanceKm * this.CARGO_RATE * 0.001 * (GS.market.demandMultiplier || 1));
  },

  calcLandingFee(airportIata, model) {
    const airport = getAirport(airportIata);
    if (!airport || !model) return 0;
    // Landing fees scale with aircraft size (MTOW proxy). The published fee is
    // calibrated for a ~180-seat narrowbody; smaller aircraft pay much less.
    const sizeFactor = Math.max(0.22, Math.min(2.6, (model.paxCapacity + (model.cargoCapacity || 0) * 4) / 180));
    let fee = airport.landingFee * sizeFactor;
    if (GS.alliances.includes('skyworld')) fee *= 0.85;
    if (GS.alliances.includes('afrijet') && airport.continent === 'AF') fee *= 0.80;
    return Math.round(fee);
  },

  calcFuelCost(model, durationHours) {
    if (!model) return 0;
    // fuelBurnPerHour is in liters/hour; fuelPrice is $/liter derived from oil barrel price
    const lph = model.fuelBurnPerHour;
    const pricePerLiter = GS.market.fuelPrice;
    return Math.round(lph * durationHours * pricePerLiter);
  },

  calcMaintenanceCost(model, durationHours) {
    if (!model) return 0;
    return Math.round(model.maintenanceCostPerHour * durationHours);
  },

  calcCrewCost(model, durationHours) {
    if (!model) return 0;
    const pilotsPerFlight = model.category === 'widebody' ? 2 : model.range > 8000 ? 3 : 2;
    const cabinCrew = Math.max(2, Math.ceil(model.paxCapacity / 50));
    const crewHourlyRate = 60;
    return Math.round((pilotsPerFlight + cabinCrew) * crewHourlyRate * durationHours);
  },

  calcRouteProfit(route) {
    const o = getAirport(route.origin);
    const d = getAirport(route.destination);
    if (!o || !d) return 0;
    const dist = calcDistance(o, d);
    const model = getAircraftModel(route.aircraftModelId);
    if (!model) return 0;
    const duration = calcFlightDuration(dist, model);
    const demand = this.calcRouteDemand(route.origin, route.destination);
    const loadFactor = route.loadFactor || 0.82;
    const paxCarried = Math.round(model.paxCapacity * loadFactor);
    const cabin = route.cabinConfig || { economy: 1.0 };
    let ticketRevenue = 0;
    if (cabin.economy) ticketRevenue += this.calcTicketPrice(dist, 'economy') * paxCarried * (cabin.economy || 0.75);
    if (cabin.premeco) ticketRevenue += this.calcTicketPrice(dist, 'premeco') * Math.round(paxCarried * (cabin.premeco || 0));
    if (cabin.business) ticketRevenue += this.calcTicketPrice(dist, 'business') * Math.round(paxCarried * (cabin.business || 0));
    if (cabin.first) ticketRevenue += this.calcTicketPrice(dist, 'first') * Math.round(paxCarried * (cabin.first || 0));
    const cargoRev = this.calcCargoRevenue(model.cargoCapacity * 0.6, dist);
    const ancillaryRev = this.calcAncillaryPerPax(dist) * paxCarried;
    const fuelCost = this.calcFuelCost(model, duration);
    const landing = this.calcLandingFee(route.origin, model) + this.calcLandingFee(route.destination, model);
    const maintenance = this.calcMaintenanceCost(model, duration);
    const crew = this.calcCrewCost(model, duration);
    return Math.round(ticketRevenue + cargoRev + ancillaryRev - fuelCost - landing - maintenance - crew);
  },

  processFlightCompletion(flight) {
    const route = GS.getRoute(flight.routeId);
    if (!route) return;
    const o = getAirport(route.origin);
    const d = getAirport(route.destination);
    if (!o || !d) return;
    const dist = calcDistance(o, d);
    const model = getAircraftModel(flight.modelId);
    if (!model) return;
    const duration = calcFlightDuration(dist, model);
    const loadFactor = route.loadFactor || 0.82;
    const paxCarried = Math.round(model.paxCapacity * loadFactor);
    const cabin = route.cabinConfig || { economy: 1.0 };
    let revenue = 0;
    if (cabin.economy && cabin.economy > 0) revenue += this.calcTicketPrice(dist, 'economy') * Math.round(paxCarried * cabin.economy);
    if (cabin.premeco && cabin.premeco > 0) revenue += this.calcTicketPrice(dist, 'premeco') * Math.round(paxCarried * cabin.premeco);
    if (cabin.business && cabin.business > 0) revenue += this.calcTicketPrice(dist, 'business') * Math.round(paxCarried * cabin.business);
    if (cabin.first && cabin.first > 0) revenue += this.calcTicketPrice(dist, 'first') * Math.round(paxCarried * cabin.first);
    const cargoRev = this.calcCargoRevenue(model.cargoCapacity * 0.6, dist);
    revenue += cargoRev;
    const ancillaryRev = this.calcAncillaryPerPax(dist) * paxCarried;
    revenue += ancillaryRev;
    const fuelCost = this.calcFuelCost(model, duration);
    const landingFee = this.calcLandingFee(route.origin, model) + this.calcLandingFee(route.destination, model);
    const maintenanceCost = this.calcMaintenanceCost(model, duration);
    const crewCost = this.calcCrewCost(model, duration);
    const profit = revenue - fuelCost - landingFee - maintenanceCost - crewCost;
    GS.addToBalance(profit, 'flight', `${route.origin}→${route.destination}`);
    GS.finances.revenue.pax += revenue - cargoRev;
    GS.finances.revenue.cargo += cargoRev;
    GS.finances.costs.fuel += fuelCost;
    GS.finances.costs.fees += landingFee;
    GS.finances.costs.maintenance += maintenanceCost;
    GS.finances.costs.crew += crewCost;
    const repGain = loadFactor > 0.9 ? 0.3 : loadFactor > 0.75 ? 0.15 : 0.05;
    GS.addReputation(repGain);
    if (GS.company) GS.company.totalPaxCarried = (GS.company.totalPaxCarried || 0) + paxCarried;
    flight.paxLastFlight = paxCarried;
    flight.profitLastFlight = profit;
    route.totalFlights = (route.totalFlights || 0) + 1;
    route.totalRevenue = (route.totalRevenue || 0) + revenue;
    route.totalProfit = (route.totalProfit || 0) + profit;
    return profit;
  },

  tickMonthlyCharges() {
    if (!GS.company) return;
    const crewSalaries = GS.crew.reduce((s, c) => s + c.salary, 0);
    GS.addToBalance(-crewSalaries, 'crew', 'Salaires mensuels');
    GS.finances.costs.crew += crewSalaries;
    if (GS.marketing.campaigns.length > 0) {
      const MONTHLY_COSTS = { social: 15000, tv: 80000, loyalty: 30000, b2b: 45000 };
      const mktCost = GS.marketing.campaigns.reduce((s, c) => s + (MONTHLY_COSTS[c] || 0), 0);
      if (mktCost > 0) {
        GS.addToBalance(-mktCost, 'marketing', 'Campagnes marketing');
        GS.finances.costs.marketing += mktCost;
      }
    }
    GS.alliances.forEach(aId => {
      const a = ALLIANCES.find(x => x.id === aId);
      if (a) GS.addToBalance(-a.annual / 12, 'fees', `Alliance ${a.name}`);
    });
    const hubAirport = getAirport(GS.company.hub);
    if (hubAirport) {
      const hubFee = hubAirport.landingFee * 3;
      GS.addToBalance(-hubFee, 'fees', 'Frais de hub mensuel');
    }
    GS.finances.lastMonthPL = GS.getMonthlyPL();
    GS.finances.revenue = { pax: 0, cargo: 0, mail: 0 };
    GS.finances.costs = { fuel: 0, maintenance: 0, fees: 0, crew: 0, marketing: 0 };
    if (GS.finances.history.length > 0) {
      const last30 = GS.finances.history.slice(-30);
      GS.finances.history = GS.finances.history.slice(0, -30).concat(last30);
    }
  },

  tickFuelPrice() {
    // Oil barrel price ($/barrel) drives jet fuel price ($/liter)
    const oilDelta = (Math.random() - 0.5) * 4.5;
    GS.market.oilBarrel = Math.max(40, Math.min(200, (GS.market.oilBarrel || 80) + oilDelta));
    // Jet fuel ≈ oil barrel / 159 liters * 1.35 refining margin
    GS.market.fuelPrice = Math.round((GS.market.oilBarrel / 159 * 1.35) * 100) / 100;
    GS.market.fuelPrice = Math.max(0.40, Math.min(1.80, GS.market.fuelPrice));
  },

  maybeSpawnEvent() {
    if (Math.random() > 0.04) return null;
    const pool = EVENTS_POOL.filter(e => !GS.events.find(x => x.id === e.id && x.active));
    if (!pool.length) return null;
    const ev = pool[Math.floor(Math.random() * pool.length)];
    const instance = { ...ev, active: true, startDate: new Date(GS.gameDate), daysRemaining: ev.duration };
    GS.events.push(instance);
    this.applyEvent(instance);
    return instance;
  },

  applyEvent(ev) {
    if (ev.effect.fuelMultiplier) GS.market.fuelPrice *= ev.effect.fuelMultiplier;
    if (ev.effect.demandMultiplier) GS.market.demandMultiplier = ev.effect.demandMultiplier;
    if (ev.effect.reputation) GS.addReputation(ev.effect.reputation);
    if (ev.effect.oneTimeCost) GS.addToBalance(-ev.effect.oneTimeCost, 'event', ev.title);
  },

  tickEvents() {
    GS.events.forEach(ev => {
      if (!ev.active) return;
      if (ev.duration > 0) {
        ev.daysRemaining = (ev.daysRemaining || ev.duration) - 1;
        if (ev.daysRemaining <= 0) {
          ev.active = false;
          if (ev.effect.demandMultiplier) GS.market.demandMultiplier = 1.0;
          if (ev.effect.fuelMultiplier) GS.market.fuelPrice /= ev.effect.fuelMultiplier;
        }
      }
    });
    GS.events = GS.events.filter(e => e.active || (GS.gameDate - e.startDate) < 1000 * 60 * 60 * 24 * 7);
  },
};
