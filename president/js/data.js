'use strict';

/* ═══════════════════════════════════════════════════════════
   HAKVISION PRESIDENT LIFE — DONNÉES MAÎTRES
   Simulateur présidentiel complet (style Power & Revolution)
═══════════════════════════════════════════════════════════ */

const GAME_START = { year: 2026, month: 0, day: 1 }; // 1 Janvier 2026

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

/* ─────────────── PAYS JOUABLES ─────────────── */
const COUNTRIES = [
  {
    id:'rdc', flag:'🇨🇩', name:'Rép. Dém. du Congo', short:'RDC', capital:'Kinshasa',
    featured:true,
    treasury: 3500, gdp: 64000, gdpGrowth: 6.2,
    population: 102, happiness: 42, security: 35, literacy: 77,
    lifeExp: 61, idh: 0.481, inflation: 8.2, unemployment: 23,
    taxRate: 14, corpTax: 30, vatRate: 16,
    defBudget: 450, intelBudget: 80,
    energyCap: 2800, electrRate: 21, roadKm: 3200, airports: 4,
    healthRank: 175, hydroPct: 100,
    resources: ['cobalt','cuivre','coltan','or','diamant','petrole','bois'],
    isRDC: true,
    electionTerm: 5
  },
  {
    id:'france', flag:'🇫🇷', name:'France', short:'FRA', capital:'Paris',
    treasury: 280000, gdp: 3100000, gdpGrowth: 1.1,
    population: 68, happiness: 58, security: 70, literacy: 99,
    lifeExp: 82, idh: 0.910, inflation: 2.8, unemployment: 7.3,
    taxRate: 30, corpTax: 25, vatRate: 20,
    defBudget: 51000, intelBudget: 9000,
    energyCap: 130000, electrRate: 100, roadKm: 1060000, airports: 30,
    healthRank: 12, hydroPct: 12,
    resources: ['ble','vin','aeronautique','nucleaire'],
    electionTerm: 5
  },
  {
    id:'usa', flag:'🇺🇸', name:'États-Unis', short:'USA', capital:'Washington',
    treasury: 900000, gdp: 28000000, gdpGrowth: 2.5,
    population: 340, happiness: 60, security: 72, literacy: 99,
    lifeExp: 79, idh: 0.927, inflation: 3.1, unemployment: 4.0,
    taxRate: 24, corpTax: 21, vatRate: 7,
    defBudget: 880000, intelBudget: 90000,
    energyCap: 1200000, electrRate: 100, roadKm: 6500000, airports: 450,
    healthRank: 30, hydroPct: 7,
    resources: ['petrole','tech','agriculture','finance'],
    electionTerm: 4
  },
  {
    id:'chine', flag:'🇨🇳', name:'Chine', short:'CHN', capital:'Pékin',
    treasury: 3200000, gdp: 19000000, gdpGrowth: 4.8,
    population: 1410, happiness: 55, security: 82, literacy: 97,
    lifeExp: 78, idh: 0.788, inflation: 1.2, unemployment: 5.0,
    taxRate: 25, corpTax: 25, vatRate: 13,
    defBudget: 300000, intelBudget: 70000,
    energyCap: 3000000, electrRate: 100, roadKm: 5200000, airports: 250,
    healthRank: 64, hydroPct: 18,
    resources: ['terres_rares','electronique','acier','solaire'],
    electionTerm: 0
  },
  {
    id:'nigeria', flag:'🇳🇬', name:'Nigéria', short:'NGA', capital:'Abuja',
    treasury: 8200, gdp: 510000, gdpGrowth: 3.3,
    population: 223, happiness: 44, security: 38, literacy: 62,
    lifeExp: 55, idh: 0.548, inflation: 24, unemployment: 33,
    taxRate: 18, corpTax: 30, vatRate: 7.5,
    defBudget: 4200, intelBudget: 800,
    energyCap: 13000, electrRate: 59, roadKm: 195000, airports: 22,
    healthRank: 187, hydroPct: 30,
    resources: ['petrole','gaz','cacao','or'],
    electionTerm: 4
  }
];

/* ─────────────── RESSOURCES (prix mondiaux) ─────────────── */
const RESOURCES = {
  cobalt:      { name:'Cobalt',     emoji:'🔋', unit:'tonne', basePrice: 33000, volatility: 0.14, desc:'Batteries Li-ion, véhicules électriques' },
  cuivre:      { name:'Cuivre',     emoji:'🟤', unit:'tonne', basePrice: 8500,  volatility: 0.09, desc:'Câblage, infrastructure électrique' },
  coltan:      { name:'Coltan',     emoji:'⚫', unit:'kg',    basePrice: 480,   volatility: 0.20, desc:'Condensateurs, smartphones' },
  or:          { name:'Or',         emoji:'🟡', unit:'oz',    basePrice: 2350,  volatility: 0.07, desc:'Réserves, joaillerie' },
  diamant:     { name:'Diamant',    emoji:'💎', unit:'carat', basePrice: 320,   volatility: 0.06, desc:'Industrie, joaillerie' },
  petrole:     { name:'Pétrole',    emoji:'🛢️', unit:'baril', basePrice: 84,    volatility: 0.11, desc:'Énergie, carburants' },
  bois:        { name:'Bois',       emoji:'🪵', unit:'m³',    basePrice: 290,   volatility: 0.05, desc:'Forêt équatoriale, construction' },
  cacao:       { name:'Cacao',      emoji:'🍫', unit:'tonne', basePrice: 7200,  volatility: 0.16, desc:'Agriculture d\'exportation' },
  cafe:        { name:'Café',       emoji:'☕', unit:'tonne', basePrice: 4100,  volatility: 0.13, desc:'Agriculture d\'exportation' },
  gaz:         { name:'Gaz',        emoji:'🔥', unit:'m³',    basePrice: 12,    volatility: 0.10, desc:'Énergie' },
  ble:         { name:'Blé',        emoji:'🌾', unit:'tonne', basePrice: 240,   volatility: 0.06, desc:'Céréales' },
  vin:         { name:'Vin',        emoji:'🍷', unit:'hl',    basePrice: 520,   volatility: 0.04, desc:'Produit de luxe' },
  aeronautique:{ name:'Aéronautique',emoji:'✈️',unit:'unité', basePrice: 95000000, volatility: 0.03, desc:'Industrie de pointe' },
  nucleaire:   { name:'Nucléaire',  emoji:'⚛️', unit:'MWh',   basePrice: 65,    volatility: 0.04, desc:'Énergie' },
  tech:        { name:'Technologie',emoji:'💻', unit:'lot',   basePrice: 1200,  volatility: 0.08, desc:'Électronique grand public' },
  agriculture: { name:'Agriculture',emoji:'🌽', unit:'tonne', basePrice: 310,   volatility: 0.05, desc:'Production alimentaire' },
  finance:     { name:'Finance',    emoji:'🏦', unit:'lot',   basePrice: 5000,  volatility: 0.09, desc:'Services financiers' },
  terres_rares:{ name:'Terres rares',emoji:'🔩',unit:'tonne', basePrice: 145000,volatility: 0.15, desc:'Aimants, haute technologie' },
  electronique:{ name:'Électronique',emoji:'📱',unit:'lot',   basePrice: 2200,  volatility: 0.07, desc:'Manufacture' },
  acier:       { name:'Acier',      emoji:'🏗️', unit:'tonne', basePrice: 720,   volatility: 0.06, desc:'Construction' },
  solaire:     { name:'Solaire',    emoji:'☀️', unit:'MWh',   basePrice: 45,    volatility: 0.05, desc:'Énergie renouvelable' }
};

// Production initiale & réserves par pays (production en unités/an)
const RESOURCE_PRODUCTION = {
  rdc: {
    cobalt:  { production: 130000, reserves: 6000000,  exports: 0.85 },
    cuivre:  { production: 2800000,reserves: 80000000, exports: 0.80 },
    coltan:  { production: 700000, reserves: 9000000,  exports: 0.90 },
    or:      { production: 1800000,reserves: 25000000, exports: 0.75 },
    diamant: { production: 14000000,reserves:150000000,exports: 0.88 },
    petrole: { production: 8000000, reserves: 180000000,exports: 0.70 },
    bois:    { production: 4500000, reserves: 99000000, exports: 0.40 }
  }
};

/* ─────────────── VILLES DE LA RDC ─────────────── */
// Coordonnées x,y sur la carte RDC (viewBox 0 0 600 560)
const RDC_CITIES = [
  { id:'kinshasa',  name:'Kinshasa',   x:118, y:330, pop:17.0, employment:55, happiness:44, infra:48, capital:true },
  { id:'lubumbashi',name:'Lubumbashi', x:430, y:478, pop:2.8,  employment:62, happiness:50, infra:55 },
  { id:'mbujimayi', name:'Mbuji-Mayi', x:330, y:380, pop:3.4,  employment:40, happiness:38, infra:30 },
  { id:'kananga',   name:'Kananga',    x:290, y:380, pop:1.6,  employment:38, happiness:36, infra:28 },
  { id:'kisangani', name:'Kisangani',  x:355, y:200, pop:1.4,  employment:42, happiness:41, infra:33 },
  { id:'goma',      name:'Goma',       x:455, y:280, pop:1.0,  employment:35, happiness:30, infra:35, conflict:true },
  { id:'bukavu',    name:'Bukavu',     x:455, y:310, pop:1.1,  employment:33, happiness:29, infra:31, conflict:true },
  { id:'matadi',    name:'Matadi',     x:70,  y:345, pop:0.5,  employment:58, happiness:47, infra:52, port:true },
  { id:'kolwezi',   name:'Kolwezi',    x:400, y:470, pop:0.6,  employment:70, happiness:48, infra:50, mining:true },
  { id:'tshikapa',  name:'Tshikapa',   x:235, y:400, pop:1.3,  employment:36, happiness:37, infra:25 },
  { id:'bunia',     name:'Bunia',      x:430, y:215, pop:0.9,  employment:34, happiness:32, infra:27, conflict:true },
  { id:'uvira',     name:'Uvira',      x:455, y:340, pop:0.7,  employment:32, happiness:31, infra:29 }
];

/* ─────────────── MINISTRES ─────────────── */
const MINISTERS = [
  { role:'Premier Ministre',        emoji:'🎩', name:'Jean-Michel Sama', competence:78, corruption:35, loyalty:80 },
  { role:'Ministre de l\'Économie', emoji:'💰', name:'Nicolas Kazadi',   competence:85, corruption:25, loyalty:72 },
  { role:'Ministre des Finances',   emoji:'🏦', name:'Doudou Fwamba',    competence:80, corruption:30, loyalty:75 },
  { role:'Ministre de la Défense',  emoji:'⚔️', name:'Guy Kabombo',      competence:74, corruption:40, loyalty:85 },
  { role:'Ministre des Mines',      emoji:'⛏️', name:'Antoinette N\'Samba',competence:82,corruption:45, loyalty:68 },
  { role:'Ministre des Affaires Étr.',emoji:'🌍',name:'Thérèse Wagner',   competence:88, corruption:20, loyalty:78 },
  { role:'Ministre de la Santé',    emoji:'🏥', name:'Roger Kamba',      competence:70, corruption:28, loyalty:74 },
  { role:'Ministre de l\'Éducation',emoji:'🎓', name:'Tony Mwaba',       competence:76, corruption:22, loyalty:80 },
  { role:'Ministre des Sports',     emoji:'⚽', name:'Didier Budimbu',   competence:65, corruption:38, loyalty:70 },
  { role:'Ministre de l\'Intérieur',emoji:'🚔', name:'Jacquemain Shabani',competence:79,corruption:42, loyalty:88 }
];

/* ─────────────── TYPES D'ENTREPRISES ─────────────── */
const COMPANY_TYPES = [
  { id:'mining',   name:'Société Minière',     emoji:'⛏️', minInvest:200, jobsPerM:80,  revPerM:0.45, resource:'cobalt' },
  { id:'oil',      name:'Compagnie Pétrolière',emoji:'🛢️', minInvest:500, jobsPerM:40,  revPerM:0.55, resource:'petrole' },
  { id:'bank',     name:'Banque',              emoji:'🏦', minInvest:300, jobsPerM:120, revPerM:0.35, resource:'finance' },
  { id:'factory',  name:'Usine Manufacturière',emoji:'🏭', minInvest:150, jobsPerM:200, revPerM:0.30, resource:'electronique' },
  { id:'agri',     name:'Entreprise Agricole', emoji:'🌾', minInvest:80,  jobsPerM:300, revPerM:0.22, resource:'agriculture' },
  { id:'airline',  name:'Compagnie Aérienne',  emoji:'✈️', minInvest:400, jobsPerM:60,  revPerM:0.38, resource:'aeronautique' },
  { id:'telecom',  name:'Opérateur Télécom',   emoji:'📡', minInvest:250, jobsPerM:90,  revPerM:0.42, resource:'tech' },
  { id:'construct',name:'BTP / Construction',  emoji:'🏗️', minInvest:120, jobsPerM:250, revPerM:0.28, resource:'acier' }
];

/* ─────────────── PARTENAIRES COMMERCIAUX ─────────────── */
const TRADE_PARTNERS = [
  { id:'chine',  flag:'🇨🇳', name:'Chine',       demand:1.3, priceMod:1.05 },
  { id:'usa',    flag:'🇺🇸', name:'États-Unis',  demand:1.1, priceMod:1.12 },
  { id:'france', flag:'🇫🇷', name:'France',      demand:0.9, priceMod:1.08 },
  { id:'inde',   flag:'🇮🇳', name:'Inde',        demand:1.0, priceMod:1.02 },
  { id:'belgique',flag:'🇧🇪',name:'Belgique',    demand:0.7, priceMod:1.10 },
  { id:'uae',    flag:'🇦🇪', name:'Émirats AU',  demand:0.8, priceMod:1.15 }
];

/* ─────────────── AMBASSADES ─────────────── */
const EMBASSIES = [
  { id:'france', flag:'🇫🇷', name:'France',      relation:65, visaLevel:'normal', tradeDeal:true,  militaryCoop:false, aid:0 },
  { id:'chine',  flag:'🇨🇳', name:'Chine',       relation:78, visaLevel:'normal', tradeDeal:true,  militaryCoop:true,  aid:0 },
  { id:'usa',    flag:'🇺🇸', name:'États-Unis',  relation:55, visaLevel:'normal', tradeDeal:false, militaryCoop:false, aid:0 },
  { id:'belgique',flag:'🇧🇪',name:'Belgique',    relation:60, visaLevel:'normal', tradeDeal:true,  militaryCoop:false, aid:0 },
  { id:'rwanda', flag:'🇷🇼', name:'Rwanda',      relation:22, visaLevel:'restricted', tradeDeal:false, militaryCoop:false, aid:0 },
  { id:'angola', flag:'🇦🇴', name:'Angola',      relation:70, visaLevel:'open',   tradeDeal:true,  militaryCoop:true,  aid:0 },
  { id:'russie', flag:'🇷🇺', name:'Russie',      relation:48, visaLevel:'normal', tradeDeal:false, militaryCoop:false, aid:0 },
  { id:'afrisud',flag:'🇿🇦', name:'Afrique du Sud',relation:62,visaLevel:'normal',tradeDeal:true,  militaryCoop:false, aid:0 }
];

const VISA_LEVELS = {
  open:       { label:'Ouverte', emoji:'🟢', immigrationMod:+1.5, relationMod:+5 },
  normal:     { label:'Normale', emoji:'🟡', immigrationMod:+0.5, relationMod:0 },
  restricted: { label:'Restreinte',emoji:'🟠',immigrationMod:-0.5, relationMod:-3 },
  closed:     { label:'Fermée',  emoji:'🔴', immigrationMod:-1.5, relationMod:-10 }
};

/* ─────────────── ARMÉE ─────────────── */
const ARMY_UNITS = [
  { id:'soldiers', name:'Soldats (FARDC)', emoji:'🪖', cost:0.5, power:1,  upkeep:0.02 },
  { id:'tanks',    name:'Chars de combat', emoji:'🛡️', cost:8,   power:25, upkeep:0.3 },
  { id:'planes',   name:'Avions de chasse',emoji:'✈️', cost:45,  power:80, upkeep:1.2 },
  { id:'ships',    name:'Navires de guerre',emoji:'🚢',cost:120,  power:150,upkeep:2.5 },
  { id:'drones',   name:'Drones',          emoji:'🚁', cost:5,    power:18, upkeep:0.15 }
];

/* ─────────────── SPORTS & STADES ─────────────── */
const STADIUMS = [
  { id:'martyrs',   name:'Stade des Martyrs',    city:'Kinshasa',   cost:250, capacity:80000, built:true,  emoji:'🏟️' },
  { id:'tp_mazembe',name:'Stade TP Mazembe',     city:'Lubumbashi', cost:180, capacity:35000, built:true,  emoji:'🏟️' },
  { id:'goma_arena',name:'Arena de Goma',        city:'Goma',       cost:150, capacity:25000, built:false, emoji:'🏟️' },
  { id:'kisangani_s',name:'Stade de Kisangani',  city:'Kisangani',  cost:160, capacity:30000, built:false, emoji:'🏟️' },
  { id:'national',  name:'Stade National Moderne',city:'Kinshasa',  cost:600, capacity:100000,built:false, emoji:'🏟️' }
];

const SPORTS_DISCIPLINES = [
  { id:'football',  name:'Football',     emoji:'⚽', level:62, budget:120 },
  { id:'basket',    name:'Basketball',   emoji:'🏀', level:55, budget:45 },
  { id:'athletics', name:'Athlétisme',   emoji:'🏃', level:48, budget:30 },
  { id:'boxing',    name:'Boxe',         emoji:'🥊', level:58, budget:25 },
  { id:'judo',      name:'Judo',         emoji:'🥋', level:45, budget:15 }
];

const SPORT_EVENTS = [
  { id:'can',       name:'Organiser la CAN',           emoji:'🏆', cost:1200, happiness:12, tourism:8,  prestige:15, duration:30 },
  { id:'worldcup',  name:'Candidature Coupe du Monde', emoji:'🌍', cost:4500, happiness:20, tourism:18, prestige:30, duration:60 },
  { id:'jeux_afr',  name:'Jeux Africains',             emoji:'🥇', cost:600,  happiness:8,  tourism:5,  prestige:10, duration:20 }
];

/* ─────────────── INFRASTRUCTURES ─────────────── */
const INFRA_PROJECTS = [
  { id:'grand_inga', name:'Barrage Grand Inga', emoji:'💧', cost:6000, days:1095, income:200, effect:{electrRate:18, energyCap:11000}, desc:'Le plus grand projet hydroélectrique d\'Afrique' },
  { id:'hydro_dam',  name:'Barrage Hydraulique', emoji:'🌊', cost:450, days:365, income:28, effect:{electrRate:4, energyCap:800}, desc:'Centrale hydroélectrique régionale' },
  { id:'solar_farm', name:'Ferme Solaire',      emoji:'☀️', cost:120, days:90,  income:8,  effect:{electrRate:2, energyCap:300}, desc:'Énergie renouvelable' },
  { id:'highway',    name:'Autoroute',          emoji:'🛣️', cost:800, days:540, income:15, effect:{roadKm:600}, desc:'Axe routier inter-provincial' },
  { id:'port_matadi',name:'Extension Port Matadi',emoji:'⚓',cost:550, days:420, income:35, effect:{}, desc:'Capacité portuaire et commerce maritime' },
  { id:'airport',    name:'Aéroport International',emoji:'🛫',cost:400, days:365, income:22, effect:{airports:1}, desc:'Connexion aérienne mondiale' },
  { id:'hospital',   name:'CHU Moderne',        emoji:'🏥', cost:200, days:240, income:0,  effect:{healthRank:-15}, desc:'Centre hospitalier universitaire' },
  { id:'university', name:'Université',          emoji:'🎓', cost:150, days:300, income:5,  effect:{literacy:3, idh:0.02}, desc:'Enseignement supérieur' },
  { id:'school',     name:'Réseau d\'écoles',   emoji:'🏫', cost:60,  days:120, income:0,  effect:{literacy:2}, desc:'Éducation primaire et secondaire' }
];

/* ─────────────── CRISES ─────────────── */
const CRISES = [
  { id:'ebola',     icon:'🦠', title:'ÉPIDÉMIE D\'EBOLA', desc:'Une épidémie d\'Ebola se déclare dans l\'Est. L\'OMS alerte sur un risque de propagation rapide.',
    choices:[
      { label:'🚨 Confinement + aide OMS (-$400M, Santé+, Bonheur+5)', effect:{treasury:-400, happiness:5, security:-2} },
      { label:'💊 Vaccination ciblée (-$200M, lent)', effect:{treasury:-200, happiness:2} },
      { label:'❌ Minimiser (Bonheur-12, propagation)', effect:{happiness:-12, security:-5} }
    ] },
  { id:'floods',    icon:'🌊', title:'INONDATIONS', desc:'Des pluies torrentielles inondent Kinshasa. Des milliers de sinistrés et des infrastructures détruites.',
    choices:[
      { label:'🆘 Secours d\'urgence (-$250M, Bonheur+8)', effect:{treasury:-250, happiness:8} },
      { label:'🏗️ Reconstruction lente (-$120M, Bonheur+3)', effect:{treasury:-120, happiness:3} }
    ] },
  { id:'drought',   icon:'☀️', title:'SÉCHERESSE', desc:'Une sécheresse menace les récoltes dans le sud. Risque de pénurie alimentaire.',
    choices:[
      { label:'🌾 Importer des vivres (-$300M)', effect:{treasury:-300, happiness:4} },
      { label:'💧 Irrigation d\'urgence (-$180M)', effect:{treasury:-180, happiness:2} }
    ] },
  { id:'corruption',icon:'💼', title:'SCANDALE DE CORRUPTION', desc:'Un ministre est accusé de détournement de $80M de fonds publics. Les médias s\'emballent.',
    choices:[
      { label:'⚖️ Limoger et poursuivre (Bonheur+10, Loyauté-)', effect:{happiness:10} },
      { label:'🤐 Étouffer l\'affaire (Bonheur-15 si découvert)', effect:{happiness:-8} }
    ] },
  { id:'strike',    icon:'✊', title:'GRÈVE GÉNÉRALE', desc:'Les syndicats appellent à une grève générale. Le pays est paralysé.',
    choices:[
      { label:'💰 Augmenter les salaires (-$200M, Bonheur+8)', effect:{treasury:-200, happiness:8} },
      { label:'🤝 Négocier (-$80M, Bonheur+3)', effect:{treasury:-80, happiness:3} },
      { label:'🚔 Réprimer (Bonheur-10, Sécurité-5)', effect:{happiness:-10, security:-5} }
    ] },
  { id:'rebellion', icon:'⚔️', title:'OFFENSIVE À L\'EST', desc:'Un groupe armé lance une offensive majeure près de Goma. Les FARDC sont en difficulté.',
    choices:[
      { label:'⚔️ Contre-offensive (-$350M, Sécurité+12)', effect:{treasury:-350, security:12, happiness:3} },
      { label:'🇺🇳 Appel à l\'ONU (Sécurité+5, lent)', effect:{security:5} },
      { label:'🕊️ Négociation (Sécurité+3, Bonheur-3)', effect:{security:3, happiness:-3} }
    ] }
];

/* ─────────────── ONU ─────────────── */
const UN_RESOLUTIONS = [
  { id:'climate',  title:'Accord climatique mondial', desc:'Vote pour un traité réduisant les émissions de CO₂ de 40% d\'ici 2040.',
    yes:{relation:8, treasury:-100, happiness:3}, no:{relation:-5} },
  { id:'minerals', title:'Régulation des minerais de conflit', desc:'Résolution imposant la traçabilité du cobalt et du coltan.',
    yes:{relation:6, treasury:-50}, no:{relation:-8, treasury:80} },
  { id:'sanctions',title:'Sanctions contre le Rwanda', desc:'Proposition de sanctions économiques pour soutien à des groupes armés.',
    yes:{relation:4, security:5}, no:{relation:2} },
  { id:'peacekeeping',title:'Mission de maintien de la paix', desc:'Renforcement des casques bleus dans l\'Est de la RDC.',
    yes:{security:10, treasury:-80, relation:5}, no:{security:-3} },
  { id:'debt',     title:'Allègement de la dette africaine', desc:'Initiative d\'annulation partielle des dettes des pays en développement.',
    yes:{treasury:500, relation:6}, no:{relation:-4} }
];

/* ─────────────── RÉSEAU SOCIAL (CongoX) ─────────────── */
const SOCIAL_POSTS = {
  positive: [
    { user:'@KinoiseFiere', text:'Le président a inauguré un nouveau stade aujourd\'hui ! 🏟️ Fier de mon pays 🇨🇩', sentiment:+1 },
    { user:'@JeuneEntrepreneur', text:'J\'ai enfin trouvé un emploi grâce aux nouvelles entreprises. Merci ! 💼', sentiment:+1 },
    { user:'@MamaCommerce', text:'Les prix au marché sont stables ce mois-ci, on respire 🙏', sentiment:+1 },
    { user:'@CongoDev', text:'L\'électricité est enfin stable dans mon quartier 💡 Bravo au gouvernement', sentiment:+1 },
    { user:'@SportifRDC', text:'La RDC organise la CAN ! Tout le continent nous regarde ⚽🔥', sentiment:+1 }
  ],
  negative: [
    { user:'@CitoyenEnColere', text:'Le prix du carburant augmente encore ⛽😡 Ça suffit !', sentiment:-1 },
    { user:'@EtudiantKin', text:'Les étudiants manifestent à Kinshasa pour de meilleures conditions 📢', sentiment:-1 },
    { user:'@SyndicatUni', text:'Grève générale annoncée. Le gouvernement n\'écoute pas le peuple ✊', sentiment:-1 },
    { user:'@HabitantGoma', text:'La sécurité à l\'Est se dégrade. On a peur 😢', sentiment:-1 },
    { user:'@AnalysteEco', text:'L\'inflation grimpe dangereusement. Le pouvoir d\'achat s\'effondre 📉', sentiment:-1 }
  ],
  neutral: [
    { user:'@ActuRDC', text:'Le cours du cobalt atteint un nouveau record sur les marchés mondiaux 📊', sentiment:0 },
    { user:'@MeteoCongo', text:'Saison des pluies en cours sur l\'ouest du pays 🌧️', sentiment:0 },
    { user:'@DiploWatch', text:'Le président rencontre son homologue chinois cette semaine 🤝', sentiment:0 }
  ]
};

/* ─────────────── NATIONS (carte du monde) ─────────────── */
const NATIONS = [
  { id:'angola',  flag:'🇦🇴', name:'Angola',        relation:'ally',    gdp:124000,  army:8  },
  { id:'rwanda',  flag:'🇷🇼', name:'Rwanda',        relation:'hostile', gdp:13000,   army:6  },
  { id:'uganda',  flag:'🇺🇬', name:'Ouganda',       relation:'neutral', gdp:48000,   army:5  },
  { id:'zambia',  flag:'🇿🇲', name:'Zambie',        relation:'ally',    gdp:29000,   army:3  },
  { id:'tanzania',flag:'🇹🇿', name:'Tanzanie',      relation:'neutral', gdp:84000,   army:4  },
  { id:'usa',     flag:'🇺🇸', name:'États-Unis',    relation:'neutral', gdp:28000000,army:98 },
  { id:'china',   flag:'🇨🇳', name:'Chine',         relation:'ally',    gdp:19000000,army:88 },
  { id:'russia',  flag:'🇷🇺', name:'Russie',        relation:'neutral', gdp:2200000, army:80 },
  { id:'france',  flag:'🇫🇷', name:'France',        relation:'ally',    gdp:3100000, army:45 },
  { id:'south_af',flag:'🇿🇦', name:'Afrique du Sud',relation:'ally',    gdp:420000,  army:16 },
  { id:'belgium', flag:'🇧🇪', name:'Belgique',      relation:'ally',    gdp:620000,  army:12 },
  { id:'india',   flag:'🇮🇳', name:'Inde',          relation:'neutral', gdp:3700000, army:75 }
];

/* Positions sur la carte du monde (viewBox 0 0 1000 500) */
const MAP_COORDS = {
  rdc:[558,272], angola:[540,300], rwanda:[578,268], uganda:[582,258],
  zambia:[568,305], tanzania:[592,282], usa:[200,150], china:[800,160],
  russia:[720,90], france:[505,120], south_af:[560,360], belgium:[508,112],
  india:[715,200], chine:[800,160]
};

/* Carte du monde — tracés de continents (viewBox 0 0 1000 500) */
const WORLD_MAP_PATHS = [
  'M50,95 L110,60 L185,48 L245,58 L275,85 L262,115 L278,130 L250,165 L228,200 L210,228 L195,205 L172,212 L148,188 L112,160 L80,128 L58,112 Z',
  'M295,35 L350,28 L368,58 L340,80 L305,68 Z',
  'M240,245 L285,228 L318,250 L322,290 L305,340 L282,388 L265,425 L252,388 L240,340 L228,290 Z',
  'M488,75 L548,55 L580,78 L570,105 L545,122 L512,132 L490,122 L475,100 Z',
  'M482,160 L552,142 L595,170 L604,220 L585,268 L562,310 L540,345 L515,365 L494,332 L478,278 L466,220 L464,182 Z',
  'M588,55 L710,35 L835,48 L905,80 L915,118 L878,150 L832,178 L790,205 L748,182 L705,195 L662,158 L620,140 L592,108 L580,82 Z',
  'M715,200 L752,188 L763,232 L735,270 L716,232 Z',
  'M800,228 L838,222 L850,255 L822,272 L802,255 Z',
  'M828,342 L905,328 L935,362 L912,402 L856,406 L826,372 Z',
  'M912,128 L928,118 L935,150 L918,162 Z'
];

/* Carte de la RDC — tracé du territoire (viewBox 0 0 600 560) */
const RDC_MAP_PATH = 'M95,300 L60,330 L75,355 L120,345 L150,318 L175,330 L200,310 L235,318 L268,300 L295,318 L320,300 L350,310 L380,290 L410,205 L425,180 L445,200 L448,240 L460,265 L455,300 L468,335 L455,360 L440,400 L455,440 L435,480 L405,495 L380,478 L350,455 L320,438 L295,420 L268,408 L240,415 L215,400 L195,378 L175,360 L155,340 L135,335 L110,330 Z M380,180 L400,120 L420,90 L445,110 L440,155 L420,178 L400,200 Z';

/* ─────────────── ÉVÉNEMENTS DU CABINET ─────────────── */
const CABINET_EVENTS = [
  { id:'inflation', from:'🏦 Ministre des Finances', urgent:true,
    text:'L\'inflation atteint {inf}%. La population perd du pouvoir d\'achat. Quelle mesure ?',
    choices:[
      { label:'✅ Geler les prix (-$50M, Bonheur+5)', effect:{treasury:-50, happiness:5} },
      { label:'❌ Laisser le marché (Bonheur-3)', effect:{happiness:-3} },
      { label:'⚡ Subventionner (-$80M, Bonheur+8)', effect:{treasury:-80, happiness:8} }
    ] },
  { id:'china_deal', from:'🌍 Ministre des Affaires Étrangères', urgent:false,
    text:'La Chine propose $2.4 milliards pour un contrat de cobalt sur 10 ans, avec 3 universités et 2 hôpitaux.',
    choices:[
      { label:'✅ Accepter (+$2400M, IDH+3%)', effect:{treasury:2400, idh:0.03} },
      { label:'🔄 Renégocier à $3.2B', effect:{} },
      { label:'❌ Refuser', effect:{} }
    ] },
  { id:'mine_strike', from:'⛏️ Ministre des Mines', urgent:true,
    text:'Les creuseurs de cobalt de Kolwezi sont en grève depuis 5 jours. La production est bloquée.',
    choices:[
      { label:'💰 Augmenter les salaires (-$120M, Bonheur+6)', effect:{treasury:-120, happiness:6} },
      { label:'🚔 Forces de l\'ordre (Sécurité-5, Bonheur-4)', effect:{security:-5, happiness:-4} },
      { label:'🤝 Médiation (-$40M)', effect:{treasury:-40, happiness:2} }
    ] }
];

/* ─────────────── ACTUALITÉS ─────────────── */
const LOCAL_NEWS = [
  'Kinshasa : inauguration de la centrale solaire de {mw} MW.',
  'Le cobalt congolais atteint ${price}/tonne sur les marchés.',
  'Début des travaux de l\'autoroute, financée à ${cost}M.',
  'Les FARDC neutralisent un groupe armé à l\'Est.',
  'Construction de {n} nouvelles écoles primaires annoncée.',
  'Production record de cobalt : {tons} tonnes exportées ce mois.',
  'L\'équipe nationale se qualifie pour les quarts de la CAN.',
  'Ouverture du CHU de Lubumbashi, {beds} lits.',
  'Le barrage Grand Inga atteint {pct}% d\'avancement.'
];
const WORLD_NEWS = [
  'Inde : explosion dans une usine, {n} victimes à Pune.',
  'ONU : résolution adoptée sur la crise au Moyen-Orient.',
  'Marchés : le cobalt monte de {pct}% (demande chinoise).',
  'UE : nouvelles règles sur les minerais de conflit.',
  'Afrique du Sud : grève dans les mines de platine.',
  'FMI : croissance africaine estimée à {pct}% cette année.',
  'Chine : lancement d\'un satellite d\'observation des ressources.'
];
