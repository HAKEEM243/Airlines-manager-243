/* ===== AIRPORTS DATABASE — Hakvision Aircraft ===== */
/* 260+ airports across all continents */
const AIRPORTS = [

  /* ===================== AFRICA ===================== */

  /* === DRC — RDC (Niveau de détail maximal) === */
  { iata:"FIH", name:"Aéroport International de N'Djili", city:"Kinshasa", country:"RD Congo", continent:"AF", lat:-4.3858, lon:15.4446, demandPax:14000, demandCargo:5800, attractivity:9.0, landingFee:2200, slots:60, hub:true },
  { iata:"FBM", name:"Aéroport International de Lubumbashi", city:"Lubumbashi", country:"RD Congo", continent:"AF", lat:-11.5913, lon:27.5309, demandPax:5500, demandCargo:3200, attractivity:7.0, landingFee:1600, slots:36, hub:false },
  { iata:"GOM", name:"Aéroport International de Goma", city:"Goma", country:"RD Congo", continent:"AF", lat:-1.6708, lon:29.2385, demandPax:4200, demandCargo:2100, attractivity:6.5, landingFee:1400, slots:24, hub:false },
  { iata:"FKI", name:"Aéroport de Bangoka", city:"Kisangani", country:"RD Congo", continent:"AF", lat:0.4814, lon:25.1572, demandPax:3800, demandCargo:1800, attractivity:6.0, landingFee:1200, slots:20, hub:false },
  { iata:"MJM", name:"Aéroport de Mbuji-Mayi", city:"Mbuji-Mayi", country:"RD Congo", continent:"AF", lat:-6.1214, lon:23.5686, demandPax:3600, demandCargo:1500, attractivity:5.8, landingFee:1100, slots:18, hub:false },
  { iata:"BKY", name:"Aéroport de Bukavu", city:"Bukavu", country:"RD Congo", continent:"AF", lat:-2.3098, lon:28.8088, demandPax:2900, demandCargo:1200, attractivity:5.5, landingFee:1000, slots:14, hub:false },
  { iata:"MAT", name:"Aéroport de Matadi", city:"Matadi", country:"RD Congo", continent:"AF", lat:-5.7996, lon:13.4401, demandPax:2400, demandCargo:980, attractivity:5.0, landingFee:900, slots:12, hub:false },
  { iata:"KGA", name:"Aéroport de Kananga", city:"Kananga", country:"RD Congo", continent:"AF", lat:-5.9005, lon:22.4692, demandPax:2200, demandCargo:850, attractivity:4.8, landingFee:850, slots:10, hub:false },

  /* === Algeria === */
  { iata:"ALG", name:"Aéroport Houari Boumédiène", city:"Alger", country:"Algérie", continent:"AF", lat:36.6910, lon:3.2154, demandPax:9500, demandCargo:3800, attractivity:7.5, landingFee:1800, slots:48, hub:false },
  { iata:"ORN", name:"Aéroport Ahmed Ben Bella", city:"Oran", country:"Algérie", continent:"AF", lat:35.6241, lon:-0.6212, demandPax:4200, demandCargo:1500, attractivity:5.5, landingFee:1200, slots:24, hub:false },

  /* === Angola === */
  { iata:"LAD", name:"Aéroport International de Luanda", city:"Luanda", country:"Angola", continent:"AF", lat:-8.8582, lon:13.2312, demandPax:8800, demandCargo:4200, attractivity:7.8, landingFee:2000, slots:42, hub:false },
  { iata:"SDD", name:"Aéroport de Lubango", city:"Lubango", country:"Angola", continent:"AF", lat:-14.9249, lon:13.5750, demandPax:2100, demandCargo:800, attractivity:4.5, landingFee:900, slots:12, hub:false },

  /* === Benin === */
  { iata:"COO", name:"Aéroport International de Cotonou", city:"Cotonou", country:"Bénin", continent:"AF", lat:6.3572, lon:2.3844, demandPax:3200, demandCargo:1100, attractivity:5.0, landingFee:1100, slots:18, hub:false },

  /* === Botswana === */
  { iata:"GBE", name:"Aéroport International Sir Seretse Khama", city:"Gaborone", country:"Botswana", continent:"AF", lat:-24.5552, lon:25.9182, demandPax:2800, demandCargo:900, attractivity:4.8, landingFee:1000, slots:16, hub:false },

  /* === Burkina Faso === */
  { iata:"OUA", name:"Aéroport International Thomas Sankara", city:"Ouagadougou", country:"Burkina Faso", continent:"AF", lat:12.3532, lon:-1.5124, demandPax:3500, demandCargo:1200, attractivity:5.2, landingFee:1100, slots:20, hub:false },

  /* === Burundi === */
  { iata:"BJM", name:"Aéroport International Melchior Ndadaye", city:"Bujumbura", country:"Burundi", continent:"AF", lat:-3.3240, lon:29.3188, demandPax:2600, demandCargo:900, attractivity:4.5, landingFee:950, slots:14, hub:false },

  /* === Cameroon === */
  { iata:"DLA", name:"Aéroport International de Douala", city:"Douala", country:"Cameroun", continent:"AF", lat:4.0061, lon:9.7195, demandPax:7200, demandCargo:3000, attractivity:6.8, landingFee:1600, slots:36, hub:false },
  { iata:"NSI", name:"Aéroport International Nsimalen", city:"Yaoundé", country:"Cameroun", continent:"AF", lat:3.7226, lon:11.5531, demandPax:4500, demandCargo:1600, attractivity:5.8, landingFee:1300, slots:24, hub:false },

  /* === Cape Verde === */
  { iata:"RAI", name:"Aéroport International Nelson Mandela", city:"Praia", country:"Cap-Vert", continent:"AF", lat:14.9245, lon:-23.4935, demandPax:2200, demandCargo:600, attractivity:5.5, landingFee:900, slots:14, hub:false },

  /* === Central African Republic === */
  { iata:"BGF", name:"Aéroport International Bangui M'Poko", city:"Bangui", country:"RCA", continent:"AF", lat:4.3985, lon:18.5188, demandPax:1800, demandCargo:700, attractivity:4.0, landingFee:900, slots:12, hub:false },

  /* === Chad === */
  { iata:"NDJ", name:"Aéroport International Hassan Djamous", city:"N'Djamena", country:"Tchad", continent:"AF", lat:12.1337, lon:15.0340, demandPax:2900, demandCargo:1000, attractivity:4.8, landingFee:1100, slots:18, hub:false },

  /* === Comoros === */
  { iata:"HAH", name:"Aéroport International Prince Said Ibrahim", city:"Moroni", country:"Comores", continent:"AF", lat:-11.5337, lon:43.2719, demandPax:1500, demandCargo:450, attractivity:4.2, landingFee:800, slots:10, hub:false },

  /* === Republic of Congo === */
  { iata:"BZV", name:"Aéroport International Maya-Maya", city:"Brazzaville", country:"Congo", continent:"AF", lat:-4.2517, lon:15.2531, demandPax:5500, demandCargo:2200, attractivity:6.0, landingFee:1400, slots:28, hub:false },
  { iata:"PNR", name:"Aéroport de Pointe-Noire", city:"Pointe-Noire", country:"Congo", continent:"AF", lat:-4.8161, lon:11.8865, demandPax:3800, demandCargo:1800, attractivity:5.5, landingFee:1200, slots:20, hub:false },

  /* === Côte d'Ivoire === */
  { iata:"ABJ", name:"Aéroport International Félix Houphouët-Boigny", city:"Abidjan", country:"Côte d'Ivoire", continent:"AF", lat:5.2613, lon:-3.9263, demandPax:9000, demandCargo:4000, attractivity:7.5, landingFee:1800, slots:42, hub:false },

  /* === Djibouti === */
  { iata:"JIB", name:"Aéroport International de Djibouti-Ambouli", city:"Djibouti", country:"Djibouti", continent:"AF", lat:11.5473, lon:43.1595, demandPax:2800, demandCargo:1100, attractivity:5.0, landingFee:1000, slots:16, hub:false },

  /* === Egypt === */
  { iata:"CAI", name:"Aéroport International du Caire", city:"Le Caire", country:"Égypte", continent:"AF", lat:30.1219, lon:31.4056, demandPax:18000, demandCargo:7500, attractivity:8.5, landingFee:2500, slots:72, hub:false },
  { iata:"HRG", name:"Aéroport International de Hurghada", city:"Hurghada", country:"Égypte", continent:"AF", lat:27.1783, lon:33.7994, demandPax:8500, demandCargo:1500, attractivity:7.0, landingFee:1500, slots:36, hub:false },
  { iata:"LXR", name:"Aéroport de Louxor", city:"Louxor", country:"Égypte", continent:"AF", lat:25.6710, lon:32.7066, demandPax:4200, demandCargo:800, attractivity:6.0, landingFee:1100, slots:20, hub:false },

  /* === Equatorial Guinea === */
  { iata:"SSG", name:"Aéroport International de Malabo", city:"Malabo", country:"Guinée Équatoriale", continent:"AF", lat:3.7553, lon:8.7086, demandPax:1800, demandCargo:900, attractivity:4.2, landingFee:1000, slots:12, hub:false },

  /* === Eritrea === */
  { iata:"ASM", name:"Aéroport International d'Asmara", city:"Asmara", country:"Érythrée", continent:"AF", lat:15.2919, lon:38.9107, demandPax:1500, demandCargo:500, attractivity:4.0, landingFee:850, slots:10, hub:false },

  /* === Ethiopia === */
  { iata:"ADD", name:"Aéroport International Bole", city:"Addis-Abeba", country:"Éthiopie", continent:"AF", lat:8.9779, lon:38.7993, demandPax:15000, demandCargo:6200, attractivity:8.8, landingFee:2200, slots:64, hub:false },

  /* === Gabon === */
  { iata:"LBV", name:"Aéroport International Léon-M'Ba", city:"Libreville", country:"Gabon", continent:"AF", lat:0.4584, lon:9.4123, demandPax:4500, demandCargo:2000, attractivity:5.8, landingFee:1400, slots:24, hub:false },

  /* === Gambia === */
  { iata:"BJL", name:"Aéroport International Banjul", city:"Banjul", country:"Gambie", continent:"AF", lat:13.3380, lon:-16.6522, demandPax:2200, demandCargo:700, attractivity:4.5, landingFee:900, slots:14, hub:false },

  /* === Ghana === */
  { iata:"ACC", name:"Aéroport International Kotoka", city:"Accra", country:"Ghana", continent:"AF", lat:5.6052, lon:-0.1668, demandPax:10000, demandCargo:4200, attractivity:7.8, landingFee:2000, slots:48, hub:false },

  /* === Guinea === */
  { iata:"CKY", name:"Aéroport International Ahmed Sékou Touré", city:"Conakry", country:"Guinée", continent:"AF", lat:9.5769, lon:-13.6120, demandPax:3500, demandCargo:1200, attractivity:5.2, landingFee:1100, slots:18, hub:false },

  /* === Guinea-Bissau === */
  { iata:"OXB", name:"Aéroport International Osvaldo Vieira", city:"Bissau", country:"Guinée-Bissau", continent:"AF", lat:11.8949, lon:-15.6536, demandPax:1400, demandCargo:450, attractivity:3.8, landingFee:750, slots:8, hub:false },

  /* === Kenya === */
  { iata:"NBO", name:"Aéroport International Jomo Kenyatta", city:"Nairobi", country:"Kenya", continent:"AF", lat:-1.3192, lon:36.9275, demandPax:16000, demandCargo:7000, attractivity:9.0, landingFee:2400, slots:68, hub:false },
  { iata:"MBA", name:"Aéroport International Moi", city:"Mombasa", country:"Kenya", continent:"AF", lat:-4.0348, lon:39.5942, demandPax:5500, demandCargo:1800, attractivity:6.5, landingFee:1400, slots:28, hub:false },

  /* === Lesotho === */
  { iata:"MSU", name:"Aéroport Moshoeshoe I", city:"Maseru", country:"Lesotho", continent:"AF", lat:-29.4624, lon:27.5523, demandPax:800, demandCargo:250, attractivity:3.0, landingFee:700, slots:8, hub:false },

  /* === Liberia === */
  { iata:"ROB", name:"Aéroport International Roberts", city:"Monrovia", country:"Libéria", continent:"AF", lat:6.2338, lon:-10.3623, demandPax:2200, demandCargo:700, attractivity:4.2, landingFee:900, slots:14, hub:false },

  /* === Libya === */
  { iata:"TIP", name:"Aéroport International Mitiga", city:"Tripoli", country:"Libye", continent:"AF", lat:32.6635, lon:13.1590, demandPax:5000, demandCargo:1800, attractivity:5.5, landingFee:1300, slots:28, hub:false },

  /* === Madagascar === */
  { iata:"TNR", name:"Aéroport International Ivato", city:"Antananarivo", country:"Madagascar", continent:"AF", lat:-18.7969, lon:47.4788, demandPax:4800, demandCargo:1900, attractivity:6.0, landingFee:1300, slots:24, hub:false },
  { iata:"NOS", name:"Aéroport de Fascène", city:"Nosy Be", country:"Madagascar", continent:"AF", lat:-13.3121, lon:48.3148, demandPax:1800, demandCargo:400, attractivity:5.5, landingFee:900, slots:12, hub:false },

  /* === Malawi === */
  { iata:"LLW", name:"Aéroport International Kamuzu", city:"Lilongwe", country:"Malawi", continent:"AF", lat:-13.7894, lon:33.7810, demandPax:2500, demandCargo:800, attractivity:4.5, landingFee:950, slots:14, hub:false },

  /* === Mali === */
  { iata:"BKO", name:"Aéroport International Bamako-Sénou", city:"Bamako", country:"Mali", continent:"AF", lat:12.5335, lon:-7.9499, demandPax:4500, demandCargo:1600, attractivity:5.5, landingFee:1200, slots:24, hub:false },

  /* === Mauritania === */
  { iata:"NKC", name:"Aéroport International Oumtounsy", city:"Nouakchott", country:"Mauritanie", continent:"AF", lat:18.0981, lon:-15.9500, demandPax:2800, demandCargo:900, attractivity:4.8, landingFee:1000, slots:18, hub:false },

  /* === Mauritius === */
  { iata:"MRU", name:"Aéroport International Sir Seewoosagur Ramgoolam", city:"Port Louis", country:"Maurice", continent:"AF", lat:-20.4302, lon:57.6836, demandPax:5500, demandCargo:2000, attractivity:7.5, landingFee:1600, slots:32, hub:false },

  /* === Morocco === */
  { iata:"CMN", name:"Aéroport Mohammed V", city:"Casablanca", country:"Maroc", continent:"AF", lat:33.3675, lon:-7.5898, demandPax:14000, demandCargo:5500, attractivity:8.2, landingFee:2200, slots:60, hub:false },
  { iata:"RAK", name:"Aéroport Marrakech Menara", city:"Marrakech", country:"Maroc", continent:"AF", lat:31.6069, lon:-8.0363, demandPax:7500, demandCargo:1800, attractivity:7.5, landingFee:1600, slots:36, hub:false },

  /* === Mozambique === */
  { iata:"MPM", name:"Aéroport International de Maputo", city:"Maputo", country:"Mozambique", continent:"AF", lat:-25.9208, lon:32.5726, demandPax:4200, demandCargo:1600, attractivity:5.8, landingFee:1200, slots:22, hub:false },

  /* === Namibia === */
  { iata:"WDH", name:"Aéroport International Hosea Kutako", city:"Windhoek", country:"Namibie", continent:"AF", lat:-22.4799, lon:17.4709, demandPax:3200, demandCargo:1100, attractivity:5.2, landingFee:1100, slots:18, hub:false },

  /* === Niger === */
  { iata:"NIM", name:"Aéroport International Diori Hamani", city:"Niamey", country:"Niger", continent:"AF", lat:13.4815, lon:2.1836, demandPax:2800, demandCargo:900, attractivity:4.5, landingFee:1000, slots:16, hub:false },

  /* === Nigeria === */
  { iata:"LOS", name:"Aéroport International Murtala Muhammed", city:"Lagos", country:"Nigéria", continent:"AF", lat:6.5774, lon:3.3212, demandPax:20000, demandCargo:8500, attractivity:9.2, landingFee:2800, slots:80, hub:false },
  { iata:"ABV", name:"Aéroport International Nnamdi Azikiwe", city:"Abuja", country:"Nigéria", continent:"AF", lat:9.0069, lon:7.2632, demandPax:10000, demandCargo:4000, attractivity:7.8, landingFee:2200, slots:48, hub:false },
  { iata:"KAN", name:"Aéroport International Mallam Aminu Kano", city:"Kano", country:"Nigéria", continent:"AF", lat:12.0476, lon:8.5247, demandPax:6500, demandCargo:2500, attractivity:6.5, landingFee:1600, slots:32, hub:false },
  { iata:"PHC", name:"Aéroport International Port Harcourt", city:"Port Harcourt", country:"Nigéria", continent:"AF", lat:5.0155, lon:6.9496, demandPax:5500, demandCargo:2200, attractivity:6.0, landingFee:1500, slots:28, hub:false },

  /* === Rwanda === */
  { iata:"KGL", name:"Aéroport International de Kigali", city:"Kigali", country:"Rwanda", continent:"AF", lat:-1.9686, lon:30.1395, demandPax:5500, demandCargo:2000, attractivity:7.0, landingFee:1500, slots:28, hub:false },

  /* === Senegal === */
  { iata:"DSS", name:"Aéroport International Blaise Diagne", city:"Dakar", country:"Sénégal", continent:"AF", lat:14.6701, lon:-17.0730, demandPax:8500, demandCargo:3200, attractivity:7.2, landingFee:1800, slots:40, hub:false },

  /* === Seychelles === */
  { iata:"SEZ", name:"Aéroport International des Seychelles", city:"Mahé", country:"Seychelles", continent:"AF", lat:-4.6743, lon:55.5218, demandPax:2200, demandCargo:600, attractivity:6.5, landingFee:1200, slots:14, hub:false },

  /* === Sierra Leone === */
  { iata:"FNA", name:"Aéroport International Lungi", city:"Freetown", country:"Sierra Leone", continent:"AF", lat:8.6164, lon:-13.1955, demandPax:2200, demandCargo:700, attractivity:4.2, landingFee:900, slots:12, hub:false },

  /* === Somalia === */
  { iata:"MGQ", name:"Aéroport International Aden Adde", city:"Mogadiscio", country:"Somalie", continent:"AF", lat:2.0144, lon:45.3047, demandPax:2800, demandCargo:900, attractivity:3.5, landingFee:900, slots:14, hub:false },

  /* === South Africa === */
  { iata:"JNB", name:"Aéroport International O.R. Tambo", city:"Johannesburg", country:"Afrique du Sud", continent:"AF", lat:-26.1392, lon:28.2460, demandPax:22000, demandCargo:9000, attractivity:9.5, landingFee:3000, slots:90, hub:false },
  { iata:"CPT", name:"Aéroport International du Cap", city:"Le Cap", country:"Afrique du Sud", continent:"AF", lat:-33.9649, lon:18.6017, demandPax:14000, demandCargo:5000, attractivity:9.0, landingFee:2400, slots:60, hub:false },
  { iata:"DUR", name:"Aéroport International King Shaka", city:"Durban", country:"Afrique du Sud", continent:"AF", lat:-29.6144, lon:31.1197, demandPax:7500, demandCargo:2800, attractivity:7.2, landingFee:1800, slots:36, hub:false },

  /* === South Sudan === */
  { iata:"JUB", name:"Aéroport International de Juba", city:"Juba", country:"Soudan du Sud", continent:"AF", lat:4.8720, lon:31.6011, demandPax:2500, demandCargo:900, attractivity:4.0, landingFee:1000, slots:16, hub:false },

  /* === Sudan === */
  { iata:"KRT", name:"Aéroport International de Khartoum", city:"Khartoum", country:"Soudan", continent:"AF", lat:15.5895, lon:32.5532, demandPax:4500, demandCargo:1600, attractivity:5.0, landingFee:1200, slots:24, hub:false },

  /* === Tanzania === */
  { iata:"DAR", name:"Aéroport International Julius Nyerere", city:"Dar es Salaam", country:"Tanzanie", continent:"AF", lat:-6.8781, lon:39.2026, demandPax:9000, demandCargo:3800, attractivity:7.5, landingFee:2000, slots:42, hub:false },
  { iata:"JRO", name:"Aéroport International Kilimandjaro", city:"Kilimandjaro", country:"Tanzanie", continent:"AF", lat:-3.4291, lon:37.0745, demandPax:4500, demandCargo:1200, attractivity:7.0, landingFee:1400, slots:24, hub:false },
  { iata:"ZNZ", name:"Aéroport International Abeid Amani Karume", city:"Zanzibar", country:"Tanzanie", continent:"AF", lat:-6.2220, lon:39.2249, demandPax:4200, demandCargo:900, attractivity:7.2, landingFee:1300, slots:22, hub:false },

  /* === Togo === */
  { iata:"LFW", name:"Aéroport International Gnassingbé Eyadéma", city:"Lomé", country:"Togo", continent:"AF", lat:6.1657, lon:1.2545, demandPax:3500, demandCargo:1300, attractivity:5.5, landingFee:1200, slots:20, hub:false },

  /* === Tunisia === */
  { iata:"TUN", name:"Aéroport International Tunis-Carthage", city:"Tunis", country:"Tunisie", continent:"AF", lat:36.8510, lon:10.2272, demandPax:8000, demandCargo:2800, attractivity:7.0, landingFee:1700, slots:40, hub:false },
  { iata:"DJE", name:"Aéroport International Zarzis", city:"Djerba", country:"Tunisie", continent:"AF", lat:33.8751, lon:10.7755, demandPax:4200, demandCargo:700, attractivity:6.5, landingFee:1200, slots:22, hub:false },

  /* === Uganda === */
  { iata:"EBB", name:"Aéroport International Entebbe", city:"Kampala", country:"Ouganda", continent:"AF", lat:0.0424, lon:32.4435, demandPax:6500, demandCargo:2500, attractivity:6.8, landingFee:1600, slots:32, hub:false },

  /* === Zambia === */
  { iata:"LUN", name:"Aéroport International Kenneth Kaunda", city:"Lusaka", country:"Zambie", continent:"AF", lat:-15.3308, lon:28.4526, demandPax:4200, demandCargo:1600, attractivity:5.8, landingFee:1300, slots:22, hub:false },

  /* === Zimbabwe === */
  { iata:"HRE", name:"Aéroport International Robert Gabriel Mugabe", city:"Harare", country:"Zimbabwe", continent:"AF", lat:-17.9318, lon:31.0928, demandPax:4800, demandCargo:1800, attractivity:6.0, landingFee:1300, slots:24, hub:false },

  /* === São Tomé and Príncipe === */
  { iata:"TMS", name:"Aéroport International São Tomé", city:"São Tomé", country:"São Tomé-et-Príncipe", continent:"AF", lat:0.3781, lon:6.7122, demandPax:800, demandCargo:250, attractivity:3.5, landingFee:700, slots:8, hub:false },

  /* === Eswatini === */
  { iata:"MTS", name:"Aéroport de Matsapha", city:"Manzini", country:"Eswatini", continent:"AF", lat:-26.5290, lon:31.3077, demandPax:900, demandCargo:300, attractivity:3.2, landingFee:700, slots:8, hub:false },

  /* ===================== EUROPE ===================== */

  { iata:"LHR", name:"Aéroport de Londres Heathrow", city:"Londres", country:"Royaume-Uni", continent:"EU", lat:51.4775, lon:-0.4614, demandPax:95000, demandCargo:35000, attractivity:10.0, landingFee:8500, slots:240, hub:false },
  { iata:"CDG", name:"Aéroport Paris Charles-de-Gaulle", city:"Paris", country:"France", continent:"EU", lat:49.0097, lon:2.5479, demandPax:85000, demandCargo:32000, attractivity:10.0, landingFee:7500, slots:220, hub:false },
  { iata:"AMS", name:"Aéroport d'Amsterdam Schiphol", city:"Amsterdam", country:"Pays-Bas", continent:"EU", lat:52.3105, lon:4.7683, demandPax:75000, demandCargo:28000, attractivity:9.5, landingFee:7000, slots:200, hub:false },
  { iata:"FRA", name:"Aéroport de Francfort", city:"Francfort", country:"Allemagne", continent:"EU", lat:50.0379, lon:8.5622, demandPax:80000, demandCargo:30000, attractivity:9.5, landingFee:7200, slots:210, hub:false },
  { iata:"MAD", name:"Aéroport Adolfo Suárez Madrid-Barajas", city:"Madrid", country:"Espagne", continent:"EU", lat:40.4936, lon:-3.5668, demandPax:65000, demandCargo:22000, attractivity:9.2, landingFee:5500, slots:180, hub:false },
  { iata:"FCO", name:"Aéroport de Rome Fiumicino", city:"Rome", country:"Italie", continent:"EU", lat:41.8003, lon:12.2389, demandPax:58000, demandCargo:18000, attractivity:9.0, landingFee:5200, slots:160, hub:false },
  { iata:"ZRH", name:"Aéroport de Zurich", city:"Zurich", country:"Suisse", continent:"EU", lat:47.4647, lon:8.5492, demandPax:38000, demandCargo:14000, attractivity:8.8, landingFee:6500, slots:120, hub:false },
  { iata:"MUC", name:"Aéroport de Munich", city:"Munich", country:"Allemagne", continent:"EU", lat:48.3538, lon:11.7861, demandPax:52000, demandCargo:18000, attractivity:9.0, landingFee:6000, slots:150, hub:false },
  { iata:"IST", name:"Aéroport International d'Istanbul", city:"Istanbul", country:"Turquie", continent:"EU", lat:41.2608, lon:28.7418, demandPax:78000, demandCargo:30000, attractivity:9.5, landingFee:6500, slots:200, hub:false },
  { iata:"SVO", name:"Aéroport de Moscou Sheremetyevo", city:"Moscou", country:"Russie", continent:"EU", lat:55.9726, lon:37.4146, demandPax:55000, demandCargo:20000, attractivity:8.5, landingFee:4500, slots:150, hub:false },
  { iata:"LIS", name:"Aéroport International Humberto Delgado", city:"Lisbonne", country:"Portugal", continent:"EU", lat:38.7813, lon:-9.1359, demandPax:38000, demandCargo:12000, attractivity:8.5, landingFee:4500, slots:120, hub:false },
  { iata:"BCN", name:"Aéroport de Barcelone El Prat", city:"Barcelone", country:"Espagne", continent:"EU", lat:41.2971, lon:2.0785, demandPax:48000, demandCargo:14000, attractivity:8.8, landingFee:5000, slots:140, hub:false },
  { iata:"BRU", name:"Aéroport de Bruxelles", city:"Bruxelles", country:"Belgique", continent:"EU", lat:50.9014, lon:4.4844, demandPax:28000, demandCargo:11000, attractivity:8.2, landingFee:5500, slots:100, hub:false },
  { iata:"VIE", name:"Aéroport de Vienne", city:"Vienne", country:"Autriche", continent:"EU", lat:48.1103, lon:16.5697, demandPax:35000, demandCargo:12000, attractivity:8.5, landingFee:5500, slots:110, hub:false },
  { iata:"CPH", name:"Aéroport de Copenhague", city:"Copenhague", country:"Danemark", continent:"EU", lat:55.6180, lon:12.6508, demandPax:32000, demandCargo:10000, attractivity:8.5, landingFee:5500, slots:110, hub:false },
  { iata:"ARN", name:"Aéroport de Stockholm Arlanda", city:"Stockholm", country:"Suède", continent:"EU", lat:59.6519, lon:17.9186, demandPax:30000, demandCargo:9000, attractivity:8.2, landingFee:5200, slots:100, hub:false },
  { iata:"HEL", name:"Aéroport d'Helsinki-Vantaa", city:"Helsinki", country:"Finlande", continent:"EU", lat:60.3172, lon:24.9633, demandPax:22000, demandCargo:7000, attractivity:7.8, landingFee:4800, slots:80, hub:false },
  { iata:"ATH", name:"Aéroport International d'Athènes", city:"Athènes", country:"Grèce", continent:"EU", lat:37.9364, lon:23.9445, demandPax:30000, demandCargo:8000, attractivity:8.5, landingFee:4500, slots:100, hub:false },
  { iata:"WAW", name:"Aéroport Chopin de Varsovie", city:"Varsovie", country:"Pologne", continent:"EU", lat:52.1657, lon:20.9671, demandPax:22000, demandCargo:6500, attractivity:7.5, landingFee:4000, slots:80, hub:false },

  /* ===================== NORTH AMERICA ===================== */

  { iata:"JFK", name:"Aéroport International John F. Kennedy", city:"New York", country:"États-Unis", continent:"NA", lat:40.6413, lon:-73.7781, demandPax:75000, demandCargo:28000, attractivity:10.0, landingFee:8000, slots:220, hub:false },
  { iata:"LAX", name:"Aéroport International de Los Angeles", city:"Los Angeles", country:"États-Unis", continent:"NA", lat:33.9425, lon:-118.4081, demandPax:72000, demandCargo:26000, attractivity:10.0, landingFee:7500, slots:210, hub:false },
  { iata:"ORD", name:"Aéroport International O'Hare", city:"Chicago", country:"États-Unis", continent:"NA", lat:41.9742, lon:-87.9073, demandPax:68000, demandCargo:25000, attractivity:9.5, landingFee:7000, slots:200, hub:false },
  { iata:"ATL", name:"Aéroport International Hartsfield-Jackson", city:"Atlanta", country:"États-Unis", continent:"NA", lat:33.6407, lon:-84.4277, demandPax:80000, demandCargo:28000, attractivity:9.5, landingFee:7000, slots:200, hub:false },
  { iata:"DFW", name:"Aéroport International de Dallas/Fort Worth", city:"Dallas", country:"États-Unis", continent:"NA", lat:32.8998, lon:-97.0403, demandPax:72000, demandCargo:25000, attractivity:9.5, landingFee:6800, slots:200, hub:false },
  { iata:"MIA", name:"Aéroport International de Miami", city:"Miami", country:"États-Unis", continent:"NA", lat:25.7959, lon:-80.2870, demandPax:55000, demandCargo:20000, attractivity:9.2, landingFee:6500, slots:160, hub:false },
  { iata:"SFO", name:"Aéroport International de San Francisco", city:"San Francisco", country:"États-Unis", continent:"NA", lat:37.6213, lon:-122.3790, demandPax:55000, demandCargo:18000, attractivity:9.5, landingFee:6800, slots:160, hub:false },
  { iata:"YYZ", name:"Aéroport International Pearson", city:"Toronto", country:"Canada", continent:"NA", lat:43.6777, lon:-79.6248, demandPax:52000, demandCargo:18000, attractivity:9.2, landingFee:6500, slots:160, hub:false },
  { iata:"MEX", name:"Aéroport International Felipe Ángeles / Benito Juárez", city:"Mexico", country:"Mexique", continent:"NA", lat:19.4363, lon:-99.0721, demandPax:50000, demandCargo:15000, attractivity:9.0, landingFee:5000, slots:140, hub:false },
  { iata:"SEA", name:"Aéroport International Seattle-Tacoma", city:"Seattle", country:"États-Unis", continent:"NA", lat:47.4502, lon:-122.3088, demandPax:38000, demandCargo:12000, attractivity:8.8, landingFee:5500, slots:120, hub:false },

  /* ===================== SOUTH AMERICA ===================== */

  { iata:"GRU", name:"Aéroport International de São Paulo-Guarulhos", city:"São Paulo", country:"Brésil", continent:"SA", lat:-23.4356, lon:-46.4731, demandPax:48000, demandCargo:18000, attractivity:9.2, landingFee:4800, slots:140, hub:false },
  { iata:"GIG", name:"Aéroport International du Galeão", city:"Rio de Janeiro", country:"Brésil", continent:"SA", lat:-22.8099, lon:-43.2505, demandPax:32000, demandCargo:10000, attractivity:9.0, landingFee:4000, slots:100, hub:false },
  { iata:"EZE", name:"Aéroport International Ezeiza", city:"Buenos Aires", country:"Argentine", continent:"SA", lat:-34.8222, lon:-58.5358, demandPax:30000, demandCargo:9000, attractivity:8.8, landingFee:3800, slots:95, hub:false },
  { iata:"SCL", name:"Aéroport Arturo Merino Benítez", city:"Santiago", country:"Chili", continent:"SA", lat:-33.3930, lon:-70.7858, demandPax:28000, demandCargo:8500, attractivity:8.5, landingFee:3600, slots:90, hub:false },
  { iata:"BOG", name:"Aéroport International El Dorado", city:"Bogota", country:"Colombie", continent:"SA", lat:4.7016, lon:-74.1469, demandPax:35000, demandCargo:12000, attractivity:8.8, landingFee:3800, slots:100, hub:false },
  { iata:"LIM", name:"Aéroport International Jorge Chávez", city:"Lima", country:"Pérou", continent:"SA", lat:-12.0219, lon:-77.1143, demandPax:25000, demandCargo:7500, attractivity:8.2, landingFee:3400, slots:80, hub:false },

  /* ===================== ASIA ===================== */

  { iata:"DXB", name:"Aéroport International de Dubaï", city:"Dubaï", country:"EAU", continent:"AS", lat:25.2532, lon:55.3657, demandPax:90000, demandCargo:38000, attractivity:10.0, landingFee:7500, slots:240, hub:false },
  { iata:"DOH", name:"Aéroport International Hamad", city:"Doha", country:"Qatar", continent:"AS", lat:25.2609, lon:51.6138, demandPax:65000, demandCargo:28000, attractivity:9.8, landingFee:6500, slots:180, hub:false },
  { iata:"AUH", name:"Aéroport International Zayed", city:"Abu Dhabi", country:"EAU", continent:"AS", lat:24.4330, lon:54.6511, demandPax:45000, demandCargo:18000, attractivity:9.2, landingFee:6000, slots:140, hub:false },
  { iata:"SIN", name:"Aéroport International Changi", city:"Singapour", country:"Singapour", continent:"AS", lat:1.3644, lon:103.9915, demandPax:68000, demandCargo:30000, attractivity:10.0, landingFee:7500, slots:200, hub:false },
  { iata:"BKK", name:"Aéroport International Suvarnabhumi", city:"Bangkok", country:"Thaïlande", continent:"AS", lat:13.6900, lon:100.7501, demandPax:65000, demandCargo:22000, attractivity:9.5, landingFee:5500, slots:180, hub:false },
  { iata:"HKG", name:"Aéroport International de Hong Kong", city:"Hong Kong", country:"Hong Kong", continent:"AS", lat:22.3080, lon:113.9185, demandPax:72000, demandCargo:35000, attractivity:9.8, landingFee:8000, slots:210, hub:false },
  { iata:"NRT", name:"Aéroport International de Narita", city:"Tokyo", country:"Japon", continent:"AS", lat:35.7720, lon:140.3929, demandPax:70000, demandCargo:28000, attractivity:9.5, landingFee:7500, slots:200, hub:false },
  { iata:"ICN", name:"Aéroport International d'Incheon", city:"Séoul", country:"Corée du Sud", continent:"AS", lat:37.4602, lon:126.4407, demandPax:72000, demandCargo:30000, attractivity:9.5, landingFee:6500, slots:200, hub:false },
  { iata:"PEK", name:"Aéroport International Capital de Pékin", city:"Pékin", country:"Chine", continent:"AS", lat:40.0799, lon:116.6031, demandPax:80000, demandCargo:30000, attractivity:9.5, landingFee:6000, slots:210, hub:false },
  { iata:"PVG", name:"Aéroport International Pudong de Shanghai", city:"Shanghai", country:"Chine", continent:"AS", lat:31.1443, lon:121.8083, demandPax:75000, demandCargo:32000, attractivity:9.5, landingFee:5800, slots:200, hub:false },
  { iata:"KUL", name:"Aéroport International de Kuala Lumpur", city:"Kuala Lumpur", country:"Malaisie", continent:"AS", lat:2.7456, lon:101.7072, demandPax:58000, demandCargo:22000, attractivity:9.2, landingFee:4500, slots:160, hub:false },
  { iata:"CGK", name:"Aéroport International Soekarno-Hatta", city:"Jakarta", country:"Indonésie", continent:"AS", lat:-6.1255, lon:106.6559, demandPax:60000, demandCargo:20000, attractivity:9.0, landingFee:4200, slots:160, hub:false },
  { iata:"MNL", name:"Aéroport International Ninoy Aquino", city:"Manille", country:"Philippines", continent:"AS", lat:14.5086, lon:121.0197, demandPax:48000, demandCargo:16000, attractivity:8.8, landingFee:3800, slots:130, hub:false },
  { iata:"BOM", name:"Aéroport International Chhatrapati Shivaji Maharaj", city:"Mumbai", country:"Inde", continent:"AS", lat:19.0887, lon:72.8679, demandPax:55000, demandCargo:20000, attractivity:9.2, landingFee:4500, slots:160, hub:false },
  { iata:"DEL", name:"Aéroport International Indira Gandhi", city:"New Delhi", country:"Inde", continent:"AS", lat:28.5665, lon:77.1031, demandPax:65000, demandCargo:22000, attractivity:9.2, landingFee:4800, slots:180, hub:false },
  { iata:"RUH", name:"Aéroport International King Khaled", city:"Riyad", country:"Arabie Saoudite", continent:"AS", lat:24.9576, lon:46.6988, demandPax:45000, demandCargo:16000, attractivity:8.8, landingFee:5500, slots:130, hub:false },
  { iata:"KWI", name:"Aéroport International de Koweït", city:"Koweït", country:"Koweït", continent:"AS", lat:29.2267, lon:47.9689, demandPax:15000, demandCargo:5000, attractivity:7.5, landingFee:3800, slots:50, hub:false },
  { iata:"MCT", name:"Aéroport International de Mascate", city:"Mascate", country:"Oman", continent:"AS", lat:23.5932, lon:58.2844, demandPax:18000, demandCargo:6500, attractivity:7.8, landingFee:4200, slots:60, hub:false },
  { iata:"CMB", name:"Aéroport International Bandaranaike", city:"Colombo", country:"Sri Lanka", continent:"AS", lat:7.1808, lon:79.8841, demandPax:12000, demandCargo:4000, attractivity:7.2, landingFee:2800, slots:44, hub:false },
  { iata:"DAC", name:"Aéroport International Hazrat Shahjalal", city:"Dacca", country:"Bangladesh", continent:"AS", lat:23.8433, lon:90.3978, demandPax:18000, demandCargo:5500, attractivity:7.5, landingFee:2800, slots:60, hub:false },
  { iata:"TAS", name:"Aéroport International de Tachkent", city:"Tachkent", country:"Ouzbékistan", continent:"AS", lat:41.2578, lon:69.2812, demandPax:8000, demandCargo:2500, attractivity:6.5, landingFee:2500, slots:36, hub:false },
  { iata:"GYD", name:"Aéroport International Heydar Aliyev", city:"Bakou", country:"Azerbaïdjan", continent:"AS", lat:40.4675, lon:50.0467, demandPax:10000, demandCargo:3200, attractivity:7.0, landingFee:3000, slots:40, hub:false },
  { iata:"TBS", name:"Aéroport International de Tbilissi", city:"Tbilissi", country:"Géorgie", continent:"AS", lat:41.6692, lon:44.9547, demandPax:5500, demandCargo:1500, attractivity:6.5, landingFee:2200, slots:28, hub:false },

  /* === North Korea === */
  { iata:"FNJ", name:"Aéroport International de Sunan", city:"Pyongyang", country:"Corée du Nord", continent:"AS", lat:39.2240, lon:125.6699, demandPax:500, demandCargo:200, attractivity:2.0, landingFee:5000, slots:6, hub:false },

  /* ===================== OCEANIA ===================== */

  { iata:"SYD", name:"Aéroport International de Sydney Kingsford Smith", city:"Sydney", country:"Australie", continent:"OC", lat:-33.9399, lon:151.1753, demandPax:48000, demandCargo:18000, attractivity:9.5, landingFee:6000, slots:140, hub:false },
  { iata:"MEL", name:"Aéroport International de Melbourne", city:"Melbourne", country:"Australie", continent:"OC", lat:-37.6733, lon:144.8430, demandPax:42000, demandCargo:15000, attractivity:9.2, landingFee:5500, slots:120, hub:false },
  { iata:"BNE", name:"Aéroport International de Brisbane", city:"Brisbane", country:"Australie", continent:"OC", lat:-27.3842, lon:153.1175, demandPax:25000, demandCargo:8000, attractivity:8.5, landingFee:4500, slots:80, hub:false },
  { iata:"AKL", name:"Aéroport International d'Auckland", city:"Auckland", country:"Nouvelle-Zélande", continent:"OC", lat:-37.0082, lon:174.7850, demandPax:22000, demandCargo:7500, attractivity:8.5, landingFee:4500, slots:80, hub:false },
  { iata:"PPT", name:"Aéroport International de Faa'a", city:"Papeete", country:"Polynésie française", continent:"OC", lat:-17.5537, lon:-149.6064, demandPax:3500, demandCargo:800, attractivity:7.5, landingFee:2200, slots:20, hub:false },

];

/* Build lookup maps */
const AIRPORT_MAP = {};
AIRPORTS.forEach(a => { AIRPORT_MAP[a.iata] = a; });

function getAirport(iata) { return AIRPORT_MAP[iata] || null; }

function searchAirports(query, limit = 15) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return AIRPORTS
    .filter(a =>
      a.city.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q) ||
      a.iata.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)
    )
    .slice(0, limit);
}

function calcDistance(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const s = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1-s)));
}

function geodesicPoints(from, to, n = 80) {
  const pts = [];
  const lat1 = from.lat * Math.PI / 180;
  const lon1 = from.lon * Math.PI / 180;
  const lat2 = to.lat * Math.PI / 180;
  const lon2 = to.lon * Math.PI / 180;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const A = Math.sin((1-t)*Math.PI) / Math.sin(Math.PI);
    const B = Math.sin(t*Math.PI) / Math.sin(Math.PI);
    // Slerp approx via great circle
    const d = 2 * Math.asin(Math.sqrt(Math.sin((lat2-lat1)/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin((lon2-lon1)/2)**2));
    const sinD = d === 0 ? 1 : Math.sin(d);
    const a2 = Math.sin((1-t)*d) / sinD;
    const b2 = Math.sin(t*d) / sinD;
    const x = a2*Math.cos(lat1)*Math.cos(lon1) + b2*Math.cos(lat2)*Math.cos(lon2);
    const y = a2*Math.cos(lat1)*Math.sin(lon1) + b2*Math.cos(lat2)*Math.sin(lon2);
    const z = a2*Math.sin(lat1) + b2*Math.sin(lat2);
    const lat = Math.atan2(z, Math.sqrt(x*x+y*y)) * 180/Math.PI;
    const lon = Math.atan2(y, x) * 180/Math.PI;
    pts.push([lat, lon]);
  }
  return pts;
}
