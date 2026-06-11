'use strict';

const COUNTRIES = [
  {
    id:'rdc', flag:'🇨🇩', name:'Rép. Dém. du Congo', short:'RDC',
    featured: true,
    treasury: 3500, gdp: 60000, gdpGrowth: 3.2,
    population: 102, happiness: 38, security: 30, literacy: 77,
    lifeExp: 61, idh: 0.481, inflation: 8.2, unemployment: 15,
    taxRate: 14, corpTax: 30, vatRate: 16,
    defBudget: 450, intelBudget: 80,
    energyCap: 2800, electrRate: 19, roadKm: 2800, airports: 4,
    healthRank: 175, hydroPct: 100,
    resources: ['cobalt','coltan','cuivre','or','diamants'],
    isRDC: true,
    specialModules: ['Hub Mondial des Ressources','Projet Grand Inga','Sécurité Est'],
    elections: 5,
    mandat: 1
  },
  {
    id:'france', flag:'🇫🇷', name:'France', short:'FRA',
    treasury: 280000, gdp: 2800000, gdpGrowth: 1.1,
    population: 68, happiness: 62, security: 72, literacy: 99,
    lifeExp: 82, idh: 0.903, inflation: 2.3, unemployment: 7.1,
    taxRate: 30, corpTax: 25, vatRate: 20,
    defBudget: 41000, intelBudget: 8000,
    energyCap: 130000, electrRate: 100, roadKm: 1060000, airports: 14,
    healthRank: 15, hydroPct: 12,
    resources: ['blé','luxe','aéronautique','nucléaire'],
    elections: 5, mandat: 1
  },
  {
    id:'usa', flag:'🇺🇸', name:'États-Unis', short:'USA',
    treasury: 900000, gdp: 26000000, gdpGrowth: 2.5,
    population: 335, happiness: 68, security: 75, literacy: 99,
    lifeExp: 79, idh: 0.921, inflation: 3.4, unemployment: 3.8,
    taxRate: 21, corpTax: 21, vatRate: 0,
    defBudget: 900000, intelBudget: 80000,
    energyCap: 1200000, electrRate: 100, roadKm: 6500000, airports: 450,
    healthRank: 37, hydroPct: 7,
    resources: ['pétrole','tech','agriculture','finance'],
    elections: 4, mandat: 1
  },
  {
    id:'chine', flag:'🇨🇳', name:'Chine', short:'CHN',
    treasury: 3200000, gdp: 18000000, gdpGrowth: 5.2,
    population: 1412, happiness: 52, security: 80, literacy: 97,
    lifeExp: 77, idh: 0.768, inflation: 0.7, unemployment: 5.2,
    taxRate: 25, corpTax: 25, vatRate: 13,
    defBudget: 290000, intelBudget: 60000,
    energyCap: 3000000, electrRate: 100, roadKm: 5200000, airports: 248,
    healthRank: 92, hydroPct: 18,
    resources: ['terres rares','électronique','acier','énergie solaire'],
    elections: 0, mandat: 1
  },
  {
    id:'nigeria', flag:'🇳🇬', name:'Nigéria', short:'NGA',
    treasury: 8200, gdp: 477000, gdpGrowth: 2.9,
    population: 220, happiness: 42, security: 35, literacy: 62,
    lifeExp: 55, idh: 0.539, inflation: 22, unemployment: 33,
    taxRate: 18, corpTax: 30, vatRate: 7.5,
    defBudget: 4200, intelBudget: 800,
    energyCap: 12000, electrRate: 57, roadKm: 195000, airports: 22,
    healthRank: 187, hydroPct: 30,
    resources: ['pétrole','gaz','cacao','or'],
    elections: 4, mandat: 1
  }
];

const RESOURCES = {
  cobalt:   { name:'Cobalt',   emoji:'🔵', unit:'tonne', basePrice: 32000, stock: 180000, volatility: 0.12, desc:'Essentiel pour batteries Li-ion' },
  coltan:   { name:'Coltan',   emoji:'⚫', unit:'kg',    basePrice: 450,   stock: 8500,   volatility: 0.18, desc:'Indispensable pour l\'électronique' },
  cuivre:   { name:'Cuivre',   emoji:'🟤', unit:'tonne', basePrice: 8200,  stock: 2200000,volatility: 0.08, desc:'Infrastructure et énergie' },
  or:       { name:'Or',       emoji:'🟡', unit:'oz',    basePrice: 2050,  stock: 1800,   volatility: 0.06, desc:'Réserves et bijouterie' },
  diamants: { name:'Diamants', emoji:'💎', unit:'carat', basePrice: 280,   stock: 420000, volatility: 0.05, desc:'Diamants industriels et gemmes' },
  blé:      { name:'Blé',      emoji:'🌾', unit:'tonne', basePrice: 210,   stock: 0,      volatility: 0.04, desc:'Céréales exportation' },
  pétrole:  { name:'Pétrole',  emoji:'🛢️', unit:'baril', basePrice: 82,    stock: 0,      volatility: 0.09, desc:'Brut exportation' }
};

const INFRASTRUCTURE = {
  energy: [
    { id:'solar_farm',  name:'Ferme Solaire',      emoji:'☀️',  cost:120,  income:8,   days:90,  effect:'⚡+200MW, Écologie+5%',  built:false, building:false, progress:0 },
    { id:'hydro_dam',   name:'Barrage Hydraulique', emoji:'💧',  cost:450,  income:28,  days:365, effect:'⚡+800MW, Électrif+4%',  built:false, building:false, progress:0 },
    { id:'grand_inga',  name:'Grand Inga (Phase 3)',emoji:'🏗️',  cost:6000, income:180, days:1825,effect:'⚡+4400MW, Électrif+15%',built:false, building:false, progress:0 },
    { id:'gas_plant',   name:'Centrale à Gaz',      emoji:'🔥',  cost:280,  income:15,  days:180, effect:'⚡+400MW',               built:false, building:false, progress:0 }
  ],
  road: [
    { id:'highway_n1',  name:'Autoroute N1',        emoji:'🛣️',  cost:800,  income:12,  days:730, effect:'Commerce+8%, Securité+5%',built:false, building:false, progress:0 },
    { id:'airport_lsh', name:'Aéroport Lubumbashi',  emoji:'✈️',  cost:350,  income:22,  days:365, effect:'Commerce+5%, Tourisme+3%',built:false, building:false, progress:0 },
    { id:'rail_line',   name:'Ligne Ferroviaire',    emoji:'🚂',  cost:1200, income:18,  days:1095,effect:'Transport+12%, PIB+1.5%',built:false, building:false, progress:0 }
  ]
};

const HEALTH_BUILDINGS = [
  { id:'ambulance',  name:'Ambulance',           emoji:'🚑', cost:10,  income:0, effect:'Santé+1%',   days:10 },
  { id:'dispensary', name:'Dispensaire',          emoji:'🏥', cost:20,  income:0, effect:'Santé+2%',   days:20 },
  { id:'clinic',     name:'Clinique',             emoji:'🏨', cost:50,  income:0, effect:'Santé+4%',   days:20 },
  { id:'maternity',  name:'Maternité',            emoji:'👶', cost:25,  income:0, effect:'Natalité+1%',days:25 },
  { id:'convalesc',  name:'Maison de repos',      emoji:'🛌', cost:30,  income:0, effect:'IDH+0.5%',   days:30 },
  { id:'hospital',   name:'CHU Moderne',          emoji:'🏥', cost:200, income:0, effect:'Santé+10%',  days:180 }
];

const EDU_BUILDINGS = [
  { id:'school_p',   name:'École primaire',      emoji:'📚', cost:15,  effect:'Alphabétisation+1%', days:30 },
  { id:'school_s',   name:'Lycée',               emoji:'🎒', cost:35,  effect:'Alphabétisation+2%', days:60 },
  { id:'universite', name:'Université',           emoji:'🎓', cost:150, effect:'IDH+2%, PIB+0.5%',  days:180 },
  { id:'tech_inst',  name:'Institut Tech',        emoji:'💻', cost:80,  effect:'Innovation+5%',      days:120 }
];

const SPORTS_LIST = [
  { name:'Football',      emoji:'⚽', budget:120, rank:68, stars:2 },
  { name:'Basketball',    emoji:'🏀', budget:45,  rank:82, stars:2 },
  { name:'Athlétisme',    emoji:'🏃', budget:30,  rank:55, stars:3 },
  { name:'Boxe',          emoji:'🥊', budget:25,  rank:48, stars:3 },
  { name:'Tennis',        emoji:'🎾', budget:15,  rank:95, stars:1 },
  { name:'Natation',      emoji:'🏊', budget:20,  rank:88, stars:2 },
  { name:'Volleyball',    emoji:'🏐', budget:18,  rank:76, stars:2 },
  { name:'Handball',      emoji:'🤾', budget:12,  rank:91, stars:1 },
  { name:'Karaté',        emoji:'🥋', budget:10,  rank:72, stars:2 },
  { name:'Jeu d\'échecs', emoji:'♟️', budget:5,   rank:62, stars:3 }
];

const NATIONS = [
  { id:'angola',    flag:'🇦🇴', name:'Angola',       relation:'ally',    gdp: 95000, army:8  },
  { id:'rwanda',    flag:'🇷🇼', name:'Rwanda',       relation:'hostile', gdp: 11000, army:6  },
  { id:'uganda',    flag:'🇺🇬', name:'Ouganda',      relation:'neutral', gdp: 48000, army:5  },
  { id:'zambia',    flag:'🇿🇲', name:'Zambie',       relation:'ally',    gdp: 22000, army:3  },
  { id:'tanzania',  flag:'🇹🇿', name:'Tanzanie',     relation:'neutral', gdp: 76000, army:4  },
  { id:'usa',       flag:'🇺🇸', name:'États-Unis',   relation:'neutral', gdp:26000000,army:95},
  { id:'china',     flag:'🇨🇳', name:'Chine',        relation:'ally',    gdp:18000000,army:85},
  { id:'russia',    flag:'🇷🇺', name:'Russie',       relation:'neutral', gdp: 2100000,army:78},
  { id:'france',    flag:'🇫🇷', name:'France',       relation:'ally',    gdp: 2800000,army:42},
  { id:'south_af',  flag:'🇿🇦', name:'Afrique du Sud',relation:'ally',   gdp: 400000, army:15}
];

const CABINET_EVENTS = [
  {
    id:'inflation', from:'🏦 Ministre des Finances', urgent: true,
    text:'L\'inflation a atteint {inf}%. La population perd du pouvoir d\'achat. Devons-nous geler les prix des denrées de base ?',
    choices:[
      { label:'✅ Gel des prix (-$50M, Bonheur+5%)', effect:{ treasury:-50, happiness:5 } },
      { label:'❌ Laisser le marché agir (Bonheur-3%)', effect:{ treasury:0, happiness:-3 } },
      { label:'⚡ Subventionner (-$80M, Bonheur+8%)', effect:{ treasury:-80, happiness:8 } }
    ]
  },
  {
    id:'mine_strike', from:'⛏️ Ministre des Mines', urgent: true,
    text:'Les creuseurs de cobalt à Kolwezi sont en grève. La production est bloquée depuis 5 jours. Des négociations sont nécessaires.',
    choices:[
      { label:'💰 Augmenter les salaires (-$120M)', effect:{ treasury:-120, happiness:6, resources: true } },
      { label:'🚔 Intervention forces de l\'ordre (Sécurité-5, Bonheur-4)', effect:{ security:-5, happiness:-4 } },
      { label:'🤝 Médiation syndicale (-$40M, +15j)', effect:{ treasury:-40, happiness:2 } }
    ]
  },
  {
    id:'election_prep', from:'📣 Directeur de campagne', urgent: false,
    text:'Les élections approchent dans 180 jours. Votre taux d\'approbation est de {approval}%. Recommandez-vous une campagne active ?',
    choices:[
      { label:'🎤 Campagne intensive (-$200M, Approbation+8%)', effect:{ treasury:-200, happiness:8 } },
      { label:'📺 Communication médias (-$80M, Approbation+3%)', effect:{ treasury:-80, happiness:3 } },
      { label:'⏳ Attendre les résultats économiques', effect:{} }
    ]
  },
  {
    id:'china_deal', from:'🌍 Ministre des Affaires Étrangères', urgent: false,
    text:'La Chine propose un accord d\'extraction de cobalt sur 10 ans pour $2.4 milliards. En contrepartie, ils construiront 3 universités et 2 hôpitaux.',
    choices:[
      { label:'✅ Accepter l\'accord (+$2400M, IDH+3%)', effect:{ treasury:2400, idh:0.03 } },
      { label:'🔄 Renégocier à $3.2B (+3 mois)', effect:{ treasury:0 } },
      { label:'❌ Refuser, chercher d\'autres partenaires', effect:{} }
    ]
  },
  {
    id:'east_crisis', from:'⚔️ Chef d\'État-Major', urgent: true,
    text:'Situation critique à l\'Est : des groupes armés ont attaqué 3 villages près de Goma. Les FARDC demandent des renforts et équipements.',
    choices:[
      { label:'⚔️ Déploiement militaire (-$180M, Sécurité+8%)', effect:{ treasury:-180, security:8 } },
      { label:'🇺🇳 Demander l\'aide de l\'ONU (Sécurité+4%, lent)', effect:{ security:4 } },
      { label:'🤝 Négociation diplomatique (Sécurité+2%, -3% troupes)', effect:{ security:2 } }
    ]
  },
  {
    id:'tax_reform', from:'💰 Ministre des Finances', urgent: false,
    text:'Une réforme fiscale est proposée : augmenter l\'impôt sur les sociétés de 5% pour financer l\'éducation et la santé.',
    choices:[
      { label:'✅ Adopter la réforme (PIB-0.5%, IDH+2%)', effect:{ gdpGrowth:-0.5, idh:0.02 } },
      { label:'❌ Maintenir la pression fiscale actuelle', effect:{} },
      { label:'⚡ Réforme partielle (+2.5%, IDH+1%)', effect:{ idh:0.01 } }
    ]
  }
];

const LOCAL_NEWS_TEMPLATES = [
  'Kinshasa : Le Président {name} inaugure la nouvelle centrale solaire de {mw} MW à Kinkole.',
  'Économie : Le cobalt congolais atteint ${price}/tonne sur les marchés mondiaux.',
  'Infrastructure : Début des travaux de l\'autoroute Kinshasa-Brazzaville, financée à ${cost}M.',
  'Diplomatie : Le Président {name} reçoit son homologue {nation} à Kinshasa.',
  'Sécurité : Les FARDC neutralisent un groupe armé à l\'Est, {n} combattants capturés.',
  'Social : Le gouvernement annonce la construction de {n} nouvelles écoles primaires.',
  'Mines : Production record de cobalt : {tons} tonnes exportées ce mois-ci.',
  'Sport : L\'équipe nationale de football se qualifie pour les quarts de finale de la CAN.',
  'Santé : Ouverture du CHU de Lubumbashi, {beds} lits, financé à ${cost}M.',
  'Économie : Le taux d\'inflation revient à {inf}% grâce aux mesures gouvernementales.',
  'Énergie : Le barrage de Grand Inga atteint {pct}% d\'avancement selon les ingénieurs.',
  'Agriculture : La récolte de manioc dépasse les prévisions, assurant la sécurité alimentaire.'
];

const WORLD_NEWS_TEMPLATES = [
  'Inde : Une explosion dans une usine cause {n} victimes dans la ville de Pune.',
  'ONU : Le Conseil de sécurité adopte une résolution sur la crise au Moyen-Orient.',
  'Marchés : Le cours du cobalt monte de {pct}% suite à la demande chinoise.',
  'Brésil : Élections présidentielles prévues dans 3 mois, sondages serrés.',
  'Russie : Nouvelles sanctions économiques imposées par l\'Union Européenne.',
  'FMI : Nouveau rapport : la croissance africaine estimée à {pct}% pour {year}.',
  'Chine : Lancement d\'un satellite d\'observation des ressources naturelles.',
  'États-Unis : Le Sénat approuve un plan d\'infrastructure de $1.2 trillion.',
  'UE : Bruxelles impose de nouvelles règles sur les minerais de conflit.',
  'Afrique du Sud : Grève dans les mines de platine, 40 000 travailleurs concernés.',
  'Rwanda : Le président Kagame signe un accord de coopération avec l\'UE.',
  'Angola : Découverte d\'un nouveau gisement pétrolier offshore estimé à 2 milliards de barils.'
];

const RANDOM_EVENTS = [
  {
    id:'earthquake', icon:'🌋', title:'CATASTROPHE NATURELLE',
    desc:'Un tremblement de terre de magnitude 5.8 a frappé la province du Kivu. Des milliers de personnes sont sinistrées.',
    choices:[
      { label:'🆘 Aide d\'urgence massive (-$300M, Bonheur+10%)', effect:{ treasury:-300, happiness:10 } },
      { label:'🏗️ Reconstruction progressive (-$150M, Bonheur+5%)', effect:{ treasury:-150, happiness:5 } }
    ]
  },
  {
    id:'cobalt_boom', icon:'📈', title:'BOOM DU COBALT',
    desc:'La demande mondiale en cobalt explose suite à l\'essor des véhicules électriques. Les prix ont doublé en 3 mois.',
    choices:[
      { label:'⛏️ Accélérer la production (+$800M)', effect:{ treasury:800 } },
      { label:'🌱 Production durable (+$400M, Écologie+10%)', effect:{ treasury:400 } }
    ]
  },
  {
    id:'coup_attempt', icon:'⚠️', title:'TENTATIVE DE COUP D\'ÉTAT',
    desc:'Des officiers dissidents tentent un coup d\'État militaire. Les loyalistes tiennent le palais présidentiel.',
    choices:[
      { label:'⚔️ Répression militaire (-$200M, Sécurité+15%)', effect:{ treasury:-200, security:15 } },
      { label:'🕊️ Dialogue national (-$80M, Stabilité+8%)', effect:{ treasury:-80, happiness:5 } }
    ]
  },
  {
    id:'pandemic', icon:'🦠', title:'ÉPIDÉMIE',
    desc:'Une épidémie de choléra se propage dans les zones rurales. Le système de santé est sous pression.',
    choices:[
      { label:'💊 Plan d\'urgence sanitaire (-$250M, Santé+8%)', effect:{ treasury:-250, health:8 } },
      { label:'🌍 Aide internationale (délai 30j, gratuit)', effect:{} }
    ]
  },
  {
    id:'imf_loan', icon:'🏦', title:'OFFRE DU FMI',
    desc:'Le FMI propose un prêt de $2 milliards à 3.5% sur 20 ans pour financer les infrastructures.',
    choices:[
      { label:'✅ Accepter le prêt (+$2000M, Dette+2000M)', effect:{ treasury:2000 } },
      { label:'❌ Refuser (indépendance financière)', effect:{} }
    ]
  }
];
