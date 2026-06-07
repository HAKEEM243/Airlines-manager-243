/* ===== AIRCRAFT DATABASE — Hakvision Aircraft ===== */
/* 42 real aircraft models with accurate specifications */
const AIRCRAFT_MODELS = [

  /* ======= TURBOPROPS / REGIONAL ======= */
  { id:"dash8", name:"Dash 8-400", manufacturer:"De Havilland Canada", category:"turboprop", type:"regional",
    paxCapacity:78, cargoCapacity:6.5, range:2040, cruiseSpeed:667, fuelBurnPerHour:1100,
    purchasePrice:32000000, maintenanceCostPerHour:480, comfortLevel:2, minRunway:1200,
    icon:"🛩", description:"Turbopropulseur court-courrier fiable et économique." },

  { id:"atr42", name:"ATR 42-600", manufacturer:"ATR", category:"turboprop", type:"regional",
    paxCapacity:50, cargoCapacity:5.0, range:1600, cruiseSpeed:556, fuelBurnPerHour:920,
    purchasePrice:21000000, maintenanceCostPerHour:420, comfortLevel:2, minRunway:1100,
    icon:"🛩", description:"Parfait pour les liaisons régionales courtes." },

  { id:"atr72", name:"ATR 72-600", manufacturer:"ATR", category:"turboprop", type:"regional",
    paxCapacity:70, cargoCapacity:7.5, range:1528, cruiseSpeed:510, fuelBurnPerHour:1050,
    purchasePrice:28000000, maintenanceCostPerHour:450, comfortLevel:2, minRunway:1290,
    icon:"🛩", description:"Le best-seller ATR, économique et polyvalent." },

  /* ======= REGIONAL JETS ======= */
  { id:"crj200", name:"CRJ-200", manufacturer:"Bombardier", category:"regional_jet", type:"regional",
    paxCapacity:50, cargoCapacity:4.5, range:3148, cruiseSpeed:830, fuelBurnPerHour:1450,
    purchasePrice:24000000, maintenanceCostPerHour:540, comfortLevel:3, minRunway:1600,
    icon:"✈", description:"Jet régional populaire pour les courtes distances." },

  { id:"crj700", name:"CRJ-700", manufacturer:"Bombardier", category:"regional_jet", type:"regional",
    paxCapacity:70, cargoCapacity:6.0, range:3045, cruiseSpeed:830, fuelBurnPerHour:1800,
    purchasePrice:36000000, maintenanceCostPerHour:650, comfortLevel:3, minRunway:1800,
    icon:"✈", description:"Version allongée du CRJ pour les marchés régionaux." },

  { id:"crj900", name:"CRJ-900", manufacturer:"Bombardier", category:"regional_jet", type:"regional",
    paxCapacity:90, cargoCapacity:7.5, range:2956, cruiseSpeed:870, fuelBurnPerHour:2100,
    purchasePrice:45000000, maintenanceCostPerHour:780, comfortLevel:3, minRunway:1950,
    icon:"✈", description:"Jet régional haute capacité, idéal pour l'Afrique." },

  { id:"e170", name:"Embraer E170", manufacturer:"Embraer", category:"regional_jet", type:"regional",
    paxCapacity:72, cargoCapacity:7.0, range:3735, cruiseSpeed:870, fuelBurnPerHour:1900,
    purchasePrice:38000000, maintenanceCostPerHour:700, comfortLevel:4, minRunway:1750,
    icon:"✈", description:"Jet régional brésilien de nouvelle génération." },

  { id:"e175", name:"Embraer E175", manufacturer:"Embraer", category:"regional_jet", type:"regional",
    paxCapacity:80, cargoCapacity:8.0, range:3735, cruiseSpeed:870, fuelBurnPerHour:2050,
    purchasePrice:43000000, maintenanceCostPerHour:750, comfortLevel:4, minRunway:1800,
    icon:"✈", description:"Version E175, plus de capacité pour les marchés régionaux." },

  { id:"e190", name:"Embraer E190", manufacturer:"Embraer", category:"narrowbody", type:"medium_haul",
    paxCapacity:100, cargoCapacity:9.5, range:4537, cruiseSpeed:870, fuelBurnPerHour:2300,
    purchasePrice:52000000, maintenanceCostPerHour:900, comfortLevel:4, minRunway:1880,
    icon:"✈", description:"Pont commercial idéal entre régional et court-courrier." },

  { id:"e195", name:"Embraer E195-E2", manufacturer:"Embraer", category:"narrowbody", type:"medium_haul",
    paxCapacity:132, cargoCapacity:12.0, range:4800, cruiseSpeed:870, fuelBurnPerHour:2500,
    purchasePrice:68000000, maintenanceCostPerHour:1100, comfortLevel:5, minRunway:2000,
    icon:"✈", description:"Nouvelle génération E2, très économe en carburant." },

  /* ======= NARROW BODY ======= */
  { id:"a220-100", name:"Airbus A220-100", manufacturer:"Airbus", category:"narrowbody", type:"medium_haul",
    paxCapacity:110, cargoCapacity:11.5, range:5900, cruiseSpeed:871, fuelBurnPerHour:2400,
    purchasePrice:87000000, maintenanceCostPerHour:1200, comfortLevel:5, minRunway:1800,
    icon:"✈", description:"Nouvelle génération mono-couloir, très confortable." },

  { id:"a220-300", name:"Airbus A220-300", manufacturer:"Airbus", category:"narrowbody", type:"medium_haul",
    paxCapacity:150, cargoCapacity:14.0, range:6300, cruiseSpeed:871, fuelBurnPerHour:2700,
    purchasePrice:102000000, maintenanceCostPerHour:1400, comfortLevel:5, minRunway:1890,
    icon:"✈", description:"Version allongée de l'A220, parfaite pour les nouvelles routes." },

  { id:"a319", name:"Airbus A319", manufacturer:"Airbus", category:"narrowbody", type:"medium_haul",
    paxCapacity:144, cargoCapacity:14.0, range:6850, cruiseSpeed:833, fuelBurnPerHour:2600,
    purchasePrice:91000000, maintenanceCostPerHour:1350, comfortLevel:4, minRunway:1800,
    icon:"✈", description:"Version courte de l'A320, idéale pour les routes secondaires." },

  { id:"a320", name:"Airbus A320", manufacturer:"Airbus", category:"narrowbody", type:"medium_haul",
    paxCapacity:180, cargoCapacity:17.5, range:6150, cruiseSpeed:833, fuelBurnPerHour:2700,
    purchasePrice:101000000, maintenanceCostPerHour:1500, comfortLevel:4, minRunway:2090,
    icon:"✈", description:"L'avion court/moyen-courrier le plus vendu au monde." },

  { id:"a320neo", name:"Airbus A320neo", manufacturer:"Airbus", category:"narrowbody", type:"medium_haul",
    paxCapacity:194, cargoCapacity:19.0, range:6300, cruiseSpeed:833, fuelBurnPerHour:2350,
    purchasePrice:110000000, maintenanceCostPerHour:1550, comfortLevel:5, minRunway:2100,
    icon:"✈", description:"Nouvelle motorisation CFM LEAP, 15% plus économe." },

  { id:"a321", name:"Airbus A321", manufacturer:"Airbus", category:"narrowbody", type:"medium_haul",
    paxCapacity:220, cargoCapacity:21.0, range:5930, cruiseSpeed:833, fuelBurnPerHour:3000,
    purchasePrice:129000000, maintenanceCostPerHour:1800, comfortLevel:4, minRunway:2200,
    icon:"✈", description:"Version longue de la famille A320, haute densité." },

  { id:"a321xlr", name:"Airbus A321XLR", manufacturer:"Airbus", category:"narrowbody", type:"long_haul",
    paxCapacity:220, cargoCapacity:21.0, range:8700, cruiseSpeed:833, fuelBurnPerHour:2900,
    purchasePrice:149000000, maintenanceCostPerHour:1900, comfortLevel:5, minRunway:2200,
    icon:"✈", description:"Révolutionne le long-courrier à fuselage étroit avec 8700 km d'autonomie." },

  { id:"b737-700", name:"Boeing 737-700", manufacturer:"Boeing", category:"narrowbody", type:"medium_haul",
    paxCapacity:149, cargoCapacity:14.5, range:6230, cruiseSpeed:829, fuelBurnPerHour:2550,
    purchasePrice:89000000, maintenanceCostPerHour:1350, comfortLevel:4, minRunway:2090,
    icon:"✈", description:"737 compact, idéal pour les lignes à faible densité." },

  { id:"b737-800", name:"Boeing 737-800", manufacturer:"Boeing", category:"narrowbody", type:"medium_haul",
    paxCapacity:189, cargoCapacity:18.0, range:5765, cruiseSpeed:842, fuelBurnPerHour:2800,
    purchasePrice:106000000, maintenanceCostPerHour:1600, comfortLevel:4, minRunway:2090,
    icon:"✈", description:"Concurrent de l'A320, robuste et éprouvé." },

  { id:"b737max8", name:"Boeing 737 MAX 8", manufacturer:"Boeing", category:"narrowbody", type:"medium_haul",
    paxCapacity:189, cargoCapacity:18.0, range:6570, cruiseSpeed:839, fuelBurnPerHour:2550,
    purchasePrice:121000000, maintenanceCostPerHour:1600, comfortLevel:5, minRunway:2090,
    icon:"✈", description:"737 nouvelle génération, 14% d'économies de carburant." },

  { id:"b737max10", name:"Boeing 737 MAX 10", manufacturer:"Boeing", category:"narrowbody", type:"medium_haul",
    paxCapacity:230, cargoCapacity:21.0, range:6110, cruiseSpeed:839, fuelBurnPerHour:2750,
    purchasePrice:135000000, maintenanceCostPerHour:1750, comfortLevel:5, minRunway:2200,
    icon:"✈", description:"La plus grande version du 737 MAX, haute capacité." },

  { id:"b757-200", name:"Boeing 757-200", manufacturer:"Boeing", category:"narrowbody", type:"long_haul",
    paxCapacity:200, cargoCapacity:24.0, range:7278, cruiseSpeed:850, fuelBurnPerHour:3400,
    purchasePrice:89000000, maintenanceCostPerHour:1900, comfortLevel:4, minRunway:1980,
    icon:"✈", description:"Long-courrier étroit, excellent pour les transatlantiques." },

  /* ======= WIDE BODY / LONG HAUL ======= */
  { id:"a330-200", name:"Airbus A330-200", manufacturer:"Airbus", category:"widebody", type:"long_haul",
    paxCapacity:246, cargoCapacity:38.0, range:13430, cruiseSpeed:871, fuelBurnPerHour:6200,
    purchasePrice:238000000, maintenanceCostPerHour:3500, comfortLevel:7, minRunway:2770,
    icon:"✈", description:"Long-courrier biréacteur robuste et économique." },

  { id:"a330-300", name:"Airbus A330-300", manufacturer:"Airbus", category:"widebody", type:"long_haul",
    paxCapacity:295, cargoCapacity:44.0, range:11750, cruiseSpeed:871, fuelBurnPerHour:6800,
    purchasePrice:264000000, maintenanceCostPerHour:3800, comfortLevel:7, minRunway:2900,
    icon:"✈", description:"Version longue de l'A330, capacité accrue." },

  { id:"a330-900neo", name:"Airbus A330-900neo", manufacturer:"Airbus", category:"widebody", type:"long_haul",
    paxCapacity:310, cargoCapacity:48.0, range:13330, cruiseSpeed:912, fuelBurnPerHour:5800,
    purchasePrice:296000000, maintenanceCostPerHour:3600, comfortLevel:8, minRunway:2900,
    icon:"✈", description:"Version neo ultra-efficace avec Rolls-Royce Trent 7000." },

  { id:"a350-900", name:"Airbus A350-900", manufacturer:"Airbus", category:"widebody", type:"ultra_long_haul",
    paxCapacity:325, cargoCapacity:51.0, range:15000, cruiseSpeed:910, fuelBurnPerHour:6000,
    purchasePrice:317000000, maintenanceCostPerHour:3800, comfortLevel:9, minRunway:3000,
    icon:"✈", description:"Composite haute performance, le meilleur long-courrier." },

  { id:"a350-1000", name:"Airbus A350-1000", manufacturer:"Airbus", category:"widebody", type:"ultra_long_haul",
    paxCapacity:369, cargoCapacity:60.0, range:16100, cruiseSpeed:910, fuelBurnPerHour:6500,
    purchasePrice:366000000, maintenanceCostPerHour:4200, comfortLevel:9, minRunway:3100,
    icon:"✈", description:"La version la plus puissante de la famille A350." },

  { id:"a380", name:"Airbus A380", manufacturer:"Airbus", category:"widebody", type:"ultra_long_haul",
    paxCapacity:555, cargoCapacity:84.0, range:15200, cruiseSpeed:903, fuelBurnPerHour:11500,
    purchasePrice:432000000, maintenanceCostPerHour:7500, comfortLevel:10, minRunway:3100,
    icon:"✈", description:"Le plus grand avion de ligne du monde, double pont." },

  { id:"b767-300er", name:"Boeing 767-300ER", manufacturer:"Boeing", category:"widebody", type:"long_haul",
    paxCapacity:218, cargoCapacity:33.0, range:11065, cruiseSpeed:851, fuelBurnPerHour:6000,
    purchasePrice:202000000, maintenanceCostPerHour:3200, comfortLevel:6, minRunway:2560,
    icon:"✈", description:"Biréacteur moyen-long courrier, populaire sur les transatlantiques." },

  { id:"b777-200er", name:"Boeing 777-200ER", manufacturer:"Boeing", category:"widebody", type:"ultra_long_haul",
    paxCapacity:314, cargoCapacity:55.0, range:13080, cruiseSpeed:905, fuelBurnPerHour:9000,
    purchasePrice:277000000, maintenanceCostPerHour:4500, comfortLevel:8, minRunway:3050,
    icon:"✈", description:"Triple sept, référence des longs-courriers depuis 30 ans." },

  { id:"b777-300er", name:"Boeing 777-300ER", manufacturer:"Boeing", category:"widebody", type:"ultra_long_haul",
    paxCapacity:396, cargoCapacity:68.0, range:13650, cruiseSpeed:905, fuelBurnPerHour:9800,
    purchasePrice:346000000, maintenanceCostPerHour:5200, comfortLevel:8, minRunway:3050,
    icon:"✈", description:"Version longue du 777, roi des long-courriers haute capacité." },

  { id:"b777x", name:"Boeing 777X", manufacturer:"Boeing", category:"widebody", type:"ultra_long_haul",
    paxCapacity:426, cargoCapacity:72.0, range:13500, cruiseSpeed:905, fuelBurnPerHour:9000,
    purchasePrice:442000000, maintenanceCostPerHour:5500, comfortLevel:9, minRunway:3050,
    icon:"✈", description:"La nouvelle génération du 777, ailes composites pliantes." },

  { id:"b787-8", name:"Boeing 787-8 Dreamliner", manufacturer:"Boeing", category:"widebody", type:"long_haul",
    paxCapacity:248, cargoCapacity:40.0, range:13530, cruiseSpeed:903, fuelBurnPerHour:5800,
    purchasePrice:239000000, maintenanceCostPerHour:3200, comfortLevel:8, minRunway:2800,
    icon:"✈", description:"Dreamliner en carbone, révolutionne le confort et l'efficience." },

  { id:"b787-9", name:"Boeing 787-9 Dreamliner", manufacturer:"Boeing", category:"widebody", type:"ultra_long_haul",
    paxCapacity:296, cargoCapacity:48.0, range:14140, cruiseSpeed:903, fuelBurnPerHour:6100,
    purchasePrice:281000000, maintenanceCostPerHour:3600, comfortLevel:8, minRunway:2800,
    icon:"✈", description:"Version étendue du Dreamliner, autonomie record." },

  { id:"b787-10", name:"Boeing 787-10 Dreamliner", manufacturer:"Boeing", category:"widebody", type:"long_haul",
    paxCapacity:336, cargoCapacity:58.0, range:11910, cruiseSpeed:903, fuelBurnPerHour:6500,
    purchasePrice:325000000, maintenanceCostPerHour:4000, comfortLevel:8, minRunway:2800,
    icon:"✈", description:"Le plus grand Dreamliner, parfait pour les hubs régionaux." },

  { id:"b747-400", name:"Boeing 747-400", manufacturer:"Boeing", category:"widebody", type:"ultra_long_haul",
    paxCapacity:416, cargoCapacity:73.5, range:13450, cruiseSpeed:913, fuelBurnPerHour:11200,
    purchasePrice:298000000, maintenanceCostPerHour:6200, comfortLevel:7, minRunway:3300,
    icon:"✈", description:"La Jumbo Jet iconique, symbole de l'aviation commerciale." },

  { id:"b747-8", name:"Boeing 747-8", manufacturer:"Boeing", category:"widebody", type:"ultra_long_haul",
    paxCapacity:467, cargoCapacity:82.0, range:14815, cruiseSpeed:988, fuelBurnPerHour:11800,
    purchasePrice:418000000, maintenanceCostPerHour:6800, comfortLevel:8, minRunway:3100,
    icon:"✈", description:"La Jumbo Jet modernisée, version ultime du 747." },

  /* ======= CARGO ======= */
  { id:"an32", name:"Antonov AN-32", manufacturer:"Antonov", category:"cargo", type:"regional",
    paxCapacity:0, cargoCapacity:6.7, range:2500, cruiseSpeed:530, fuelBurnPerHour:2200,
    purchasePrice:8000000, maintenanceCostPerHour:850, comfortLevel:1, minRunway:900,
    icon:"🛩", description:"Cargo régional robuste, parfait pour l'Afrique." },

  { id:"b737f", name:"Boeing 737-800SF (Cargo)", manufacturer:"Boeing", category:"cargo", type:"medium_haul",
    paxCapacity:0, cargoCapacity:22.0, range:5765, cruiseSpeed:842, fuelBurnPerHour:2900,
    purchasePrice:78000000, maintenanceCostPerHour:1600, comfortLevel:1, minRunway:2090,
    icon:"🛩", description:"Cargo narrow-body pour liaisons courtes et moyennes." },

  { id:"b767f", name:"Boeing 767-300F (Cargo)", manufacturer:"Boeing", category:"cargo", type:"long_haul",
    paxCapacity:0, cargoCapacity:52.0, range:6025, cruiseSpeed:851, fuelBurnPerHour:6500,
    purchasePrice:185000000, maintenanceCostPerHour:3800, comfortLevel:1, minRunway:2560,
    icon:"🛩", description:"Cargo intercontinental, référence du fret aérien." },

  /* ======= SPECIAL / LEGACY ======= */
  { id:"concorde", name:"Concorde", manufacturer:"Aérospatiale/BAC", category:"supersonic", type:"ultra_long_haul",
    paxCapacity:100, cargoCapacity:8.0, range:7250, cruiseSpeed:2179, fuelBurnPerHour:22000,
    purchasePrice:350000000, maintenanceCostPerHour:28000, comfortLevel:10, minRunway:3600,
    icon:"🚀", description:"Supersonique légendaire, traverse l'Atlantique en 3h30." },

  { id:"a340-600", name:"Airbus A340-600", manufacturer:"Airbus", category:"widebody", type:"ultra_long_haul",
    paxCapacity:380, cargoCapacity:60.0, range:14450, cruiseSpeed:880, fuelBurnPerHour:9500,
    purchasePrice:265000000, maintenanceCostPerHour:5500, comfortLevel:7, minRunway:3100,
    icon:"✈", description:"Quadriréacteur pour les très longues distances." },

];

const AIRCRAFT_MAP = {};
AIRCRAFT_MODELS.forEach(a => { AIRCRAFT_MAP[a.id] = a; });

function getAircraftModel(id) { return AIRCRAFT_MAP[id] || null; }

function getAircraftByCategory(category) {
  if (!category) return AIRCRAFT_MODELS;
  return AIRCRAFT_MODELS.filter(a => a.category === category);
}

function getAircraftIcon(model) {
  return model ? (model.icon || "✈") : "✈";
}

function canFlyRoute(model, distanceKm) {
  return model && model.range >= distanceKm;
}

function calcFlightDuration(distanceKm, model) {
  if (!model) return 0;
  const climbDescentKm = Math.min(distanceKm * 0.15, 800);
  const cruiseKm = distanceKm - climbDescentKm;
  const groundTime = 0.5; // hours for taxi/takeoff/landing
  const climbTime = climbDescentKm / (model.cruiseSpeed * 0.7) / 2;
  const cruiseTime = cruiseKm / model.cruiseSpeed;
  return groundTime + climbTime * 2 + cruiseTime;
}

function calcFuelCost(model, durationHours, fuelPricePerLiter) {
  if (!model) return 0;
  return model.fuelBurnPerHour * durationHours * fuelPricePerLiter;
}

function getSellPrice(model, ageMonths) {
  if (!model) return 0;
  const depreciation = Math.max(0.25, 0.85 - (ageMonths / 360));
  return Math.round(model.purchasePrice * depreciation);
}
