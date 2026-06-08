/* ===== AIRCRAFT ILLUSTRATIONS — Hakvision Aircraft ===== */
/* Side-view SVG illustrations per category, 320×160 viewport */

const AC_IMAGES = {

  turboprop: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
    <defs>
      <linearGradient id="tp-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0a1628"/>
        <stop offset="100%" stop-color="#112244"/>
      </linearGradient>
      <linearGradient id="tp-fuse" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8eef5"/>
        <stop offset="100%" stop-color="#c8d4e0"/>
      </linearGradient>
      <linearGradient id="tp-wing" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d0dce8"/>
        <stop offset="100%" stop-color="#b0bcc8"/>
      </linearGradient>
    </defs>
    <rect width="320" height="160" fill="url(#tp-sky)"/>
    <!-- Horizon glow -->
    <ellipse cx="160" cy="130" rx="180" ry="40" fill="rgba(0,100,200,0.08)"/>
    <!-- Main fuselage (high-wing turboprop) -->
    <path d="M40 90 Q55 82 90 80 L240 78 Q265 78 275 85 Q265 88 240 88 L90 90 Q60 92 40 90Z" fill="url(#tp-fuse)"/>
    <!-- Nose -->
    <path d="M240 78 Q275 78 290 84 Q275 90 240 88Z" fill="#dde6ef"/>
    <!-- Tail fin (T-tail) -->
    <path d="M55 80 L52 55 L65 52 L70 80Z" fill="url(#tp-wing)"/>
    <!-- Horizontal stabilizer -->
    <path d="M48 54 L90 56 L90 60 L48 60Z" fill="url(#tp-wing)"/>
    <!-- High wing -->
    <path d="M130 80 L125 48 L170 50 L175 80Z" fill="url(#tp-wing)"/>
    <path d="M175 80 L180 48 L225 50 L220 80Z" fill="url(#tp-wing)"/>
    <!-- Engine nacelles (twins, left & right of fuselage on wing) -->
    <rect x="118" y="52" width="22" height="9" rx="4" fill="#a0aab5"/>
    <ellipse cx="118" cy="56" rx="5" ry="5" fill="#2a3a4a"/>
    <!-- Propeller blur left -->
    <ellipse cx="112" cy="56" rx="2" ry="16" fill="rgba(255,255,255,0.15)" transform="rotate(-10,112,56)"/>
    <ellipse cx="112" cy="56" rx="2" ry="16" fill="rgba(255,255,255,0.1)" transform="rotate(80,112,56)"/>
    <rect x="192" y="52" width="22" height="9" rx="4" fill="#a0aab5"/>
    <ellipse cx="192" cy="56" rx="5" ry="5" fill="#2a3a4a"/>
    <!-- Propeller blur right -->
    <ellipse cx="186" cy="56" rx="2" ry="16" fill="rgba(255,255,255,0.15)" transform="rotate(-10,186,56)"/>
    <ellipse cx="186" cy="56" rx="2" ry="16" fill="rgba(255,255,255,0.1)" transform="rotate(80,186,56)"/>
    <!-- Windows row -->
    <g fill="rgba(0,180,255,0.7)">
      <rect x="110" y="82" width="5" height="4" rx="1"/>
      <rect x="120" y="82" width="5" height="4" rx="1"/>
      <rect x="130" y="82" width="5" height="4" rx="1"/>
      <rect x="140" y="82" width="5" height="4" rx="1"/>
      <rect x="150" y="82" width="5" height="4" rx="1"/>
      <rect x="160" y="82" width="5" height="4" rx="1"/>
      <rect x="170" y="82" width="5" height="4" rx="1"/>
      <rect x="180" y="82" width="5" height="4" rx="1"/>
      <rect x="190" y="82" width="5" height="4" rx="1"/>
      <rect x="200" y="82" width="5" height="4" rx="1"/>
      <rect x="210" y="82" width="5" height="4" rx="1"/>
    </g>
    <!-- Cyan livery stripe -->
    <path d="M90 88 L240 86 L240 90 L90 92Z" fill="rgba(0,212,255,0.5)"/>
    <!-- Landing gear -->
    <line x1="150" y1="90" x2="150" y2="100" stroke="#778899" stroke-width="2"/>
    <line x1="145" y1="100" x2="155" y2="100" stroke="#778899" stroke-width="2"/>
    <line x1="230" y1="90" x2="230" y2="100" stroke="#778899" stroke-width="2"/>
    <line x1="225" y1="100" x2="235" y2="100" stroke="#778899" stroke-width="2"/>
    <!-- Label -->
    <text x="160" y="148" text-anchor="middle" fill="rgba(0,212,255,0.6)" font-family="Orbitron,sans-serif" font-size="9" font-weight="700" letter-spacing="2">TURBOPROP</text>
  </svg>`,

  regional_jet: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
    <defs>
      <linearGradient id="rj-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0a1628"/>
        <stop offset="100%" stop-color="#112244"/>
      </linearGradient>
      <linearGradient id="rj-fuse" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#eaf0f7"/>
        <stop offset="100%" stop-color="#ccd8e4"/>
      </linearGradient>
      <linearGradient id="rj-eng" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8090a0"/>
        <stop offset="100%" stop-color="#607080"/>
      </linearGradient>
    </defs>
    <rect width="320" height="160" fill="url(#rj-sky)"/>
    <ellipse cx="160" cy="130" rx="180" ry="38" fill="rgba(0,100,200,0.07)"/>
    <!-- Fuselage: slender, rear-engine T-tail (CRJ style) -->
    <path d="M45 88 Q60 80 95 79 L250 77 Q272 77 285 84 Q272 89 250 89 L95 91 Q62 93 45 88Z" fill="url(#rj-fuse)"/>
    <!-- Nose -->
    <path d="M250 77 Q285 77 298 84 Q285 91 250 89Z" fill="#dce8f0"/>
    <!-- Swept low wing -->
    <path d="M140 89 L120 110 L170 110 L175 89Z" fill="#c0ccd8"/>
    <path d="M175 89 L200 110 L235 108 L215 89Z" fill="#c0ccd8"/>
    <!-- T-tail vertical fin -->
    <path d="M58 79 L55 48 L70 46 L73 79Z" fill="#c0ccd8"/>
    <!-- Horizontal stab (on top of fin) -->
    <path d="M42 48 L100 50 L100 54 L42 54Z" fill="#c0ccd8"/>
    <!-- Rear-mounted engines (CRJ: aft fuselage) -->
    <path d="M80 82 Q95 78 118 79 L118 84 Q95 85 80 88Z" fill="url(#rj-eng)"/>
    <circle cx="80" cy="85" r="5" fill="#1a2a3a"/>
    <ellipse cx="80" cy="85" rx="3" ry="5" fill="rgba(255,160,0,0.3)"/>
    <path d="M80 70 Q95 66 118 67 L118 72 Q95 73 80 76Z" fill="url(#rj-eng)"/>
    <circle cx="80" cy="73" r="5" fill="#1a2a3a"/>
    <ellipse cx="80" cy="73" rx="3" ry="5" fill="rgba(255,160,0,0.3)"/>
    <!-- Windows -->
    <g fill="rgba(0,180,255,0.75)">
      <rect x="115" y="81" width="5" height="4" rx="1"/>
      <rect x="125" y="81" width="5" height="4" rx="1"/>
      <rect x="135" y="81" width="5" height="4" rx="1"/>
      <rect x="145" y="81" width="5" height="4" rx="1"/>
      <rect x="155" y="81" width="5" height="4" rx="1"/>
      <rect x="165" y="81" width="5" height="4" rx="1"/>
      <rect x="175" y="81" width="5" height="4" rx="1"/>
      <rect x="185" y="81" width="5" height="4" rx="1"/>
      <rect x="195" y="81" width="5" height="4" rx="1"/>
      <rect x="205" y="81" width="5" height="4" rx="1"/>
      <rect x="215" y="81" width="5" height="4" rx="1"/>
      <rect x="225" y="81" width="5" height="4" rx="1"/>
    </g>
    <!-- Cyan stripe -->
    <path d="M95 87 L250 85 L250 89 L95 91Z" fill="rgba(0,212,255,0.55)"/>
    <!-- Gear -->
    <line x1="165" y1="90" x2="165" y2="100" stroke="#778899" stroke-width="2"/>
    <line x1="160" y1="100" x2="170" y2="100" stroke="#778899" stroke-width="2"/>
    <text x="160" y="148" text-anchor="middle" fill="rgba(0,212,255,0.6)" font-family="Orbitron,sans-serif" font-size="9" font-weight="700" letter-spacing="2">REGIONAL JET</text>
  </svg>`,

  narrowbody: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
    <defs>
      <linearGradient id="nb-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#08111f"/>
        <stop offset="100%" stop-color="#0e1d38"/>
      </linearGradient>
      <linearGradient id="nb-fuse" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f0f5fa"/>
        <stop offset="100%" stop-color="#d0dce8"/>
      </linearGradient>
      <linearGradient id="nb-eng" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#607080"/>
        <stop offset="100%" stop-color="#9aacbc"/>
      </linearGradient>
    </defs>
    <rect width="320" height="160" fill="url(#nb-sky)"/>
    <ellipse cx="160" cy="125" rx="200" ry="50" fill="rgba(0,80,180,0.06)"/>
    <!-- Fuselage: wider, round nose (A320 style) -->
    <path d="M38 88 Q52 78 88 77 L252 75 Q276 75 292 83 Q276 91 252 91 L88 93 Q55 95 38 88Z" fill="url(#nb-fuse)"/>
    <!-- Nose cone -->
    <path d="M252 75 Q290 75 305 83 Q290 91 252 91Z" fill="#e0eaf4"/>
    <!-- Swept main wing (under-wing engines) -->
    <path d="M145 91 L105 118 L165 116 L170 91Z" fill="#bccad8"/>
    <path d="M170 91 L200 118 L245 115 L230 91Z" fill="#bccad8"/>
    <!-- Wing winglets -->
    <path d="M105 118 L103 108 L110 108Z" fill="#a0b0c0"/>
    <path d="M245 115 L248 105 L240 106Z" fill="#a0b0c0"/>
    <!-- Under-wing CFM engines (A320neo style, with serrated exhaust) -->
    <path d="M120 104 L145 100 L150 108 L125 113 Z" fill="url(#nb-eng)" rx="4"/>
    <ellipse cx="120" cy="108" rx="7" ry="7" fill="#1a2a3a"/>
    <ellipse cx="120" cy="108" rx="4" ry="4" fill="rgba(255,140,0,0.35)"/>
    <!-- Serrated fan cowl left -->
    <path d="M113 103 L117 98 M113 108 L108 108 M113 113 L117 118" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <path d="M200 100 L225 97 L230 105 L205 109 Z" fill="url(#nb-eng)"/>
    <ellipse cx="200" cy="104" rx="7" ry="7" fill="#1a2a3a"/>
    <ellipse cx="200" cy="104" rx="4" ry="4" fill="rgba(255,140,0,0.35)"/>
    <!-- Tail fin -->
    <path d="M60 77 L55 44 L73 42 L77 77Z" fill="#bccad8"/>
    <!-- Horizontal stab -->
    <path d="M48 65 L90 67 L90 71 L48 71Z" fill="#bccad8"/>
    <!-- Windows (single row) -->
    <g fill="rgba(0,190,255,0.8)">
      <rect x="105" y="80" width="6" height="4" rx="1"/>
      <rect x="116" y="80" width="6" height="4" rx="1"/>
      <rect x="127" y="80" width="6" height="4" rx="1"/>
      <rect x="138" y="80" width="6" height="4" rx="1"/>
      <rect x="149" y="80" width="6" height="4" rx="1"/>
      <rect x="160" y="80" width="6" height="4" rx="1"/>
      <rect x="171" y="80" width="6" height="4" rx="1"/>
      <rect x="182" y="80" width="6" height="4" rx="1"/>
      <rect x="193" y="80" width="6" height="4" rx="1"/>
      <rect x="204" y="80" width="6" height="4" rx="1"/>
      <rect x="215" y="80" width="6" height="4" rx="1"/>
      <rect x="226" y="80" width="6" height="4" rx="1"/>
      <rect x="237" y="80" width="6" height="4" rx="1"/>
    </g>
    <!-- Cyan livery cheat line -->
    <path d="M88 89 L252 87 L252 91 L88 93Z" fill="rgba(0,212,255,0.6)"/>
    <!-- Main gear -->
    <line x1="158" y1="92" x2="158" y2="104" stroke="#778899" stroke-width="2.5"/>
    <line x1="152" y1="104" x2="164" y2="104" stroke="#778899" stroke-width="2.5"/>
    <line x1="230" y1="92" x2="230" y2="102" stroke="#778899" stroke-width="2"/>
    <line x1="226" y1="102" x2="234" y2="102" stroke="#778899" stroke-width="2"/>
    <text x="160" y="148" text-anchor="middle" fill="rgba(0,212,255,0.6)" font-family="Orbitron,sans-serif" font-size="9" font-weight="700" letter-spacing="2">NARROWBODY</text>
  </svg>`,

  widebody: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
    <defs>
      <linearGradient id="wb-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#050e1c"/>
        <stop offset="100%" stop-color="#0a1830"/>
      </linearGradient>
      <linearGradient id="wb-fuse" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f2f7fc"/>
        <stop offset="100%" stop-color="#ccd8e6"/>
      </linearGradient>
      <linearGradient id="wb-eng" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#506070"/>
        <stop offset="100%" stop-color="#8a9cac"/>
      </linearGradient>
    </defs>
    <rect width="320" height="160" fill="url(#wb-sky)"/>
    <ellipse cx="160" cy="130" rx="210" ry="45" fill="rgba(0,80,180,0.07)"/>
    <!-- Wide fuselage (B777 style: large, two rows) -->
    <path d="M30 89 Q46 76 84 74 L254 72 Q280 72 298 81 Q280 90 254 92 L84 94 Q48 97 30 89Z" fill="url(#wb-fuse)"/>
    <!-- Nose -->
    <path d="M254 72 Q295 72 312 81 Q295 90 254 92Z" fill="#deeaf4"/>
    <!-- Long swept wing -->
    <path d="M135 92 L80 126 L165 123 L175 92Z" fill="#b8c8d8"/>
    <path d="M175 92 L215 126 L270 122 L250 92Z" fill="#b8c8d8"/>
    <!-- Raked wingtips -->
    <path d="M80 126 L77 114 L86 115Z" fill="#9ab0c4"/>
    <path d="M270 122 L274 110 L264 112Z" fill="#9ab0c4"/>
    <!-- 2 pairs of under-wing engines (B777 has GE90s, very large) -->
    <path d="M112 110 L142 105 L147 115 L117 121Z" fill="url(#wb-eng)" rx="5"/>
    <ellipse cx="112" cy="116" rx="8" ry="8" fill="#141f2a"/>
    <ellipse cx="112" cy="116" rx="5" ry="5" fill="rgba(255,130,0,0.4)"/>
    <path d="M155 106 L180 103 L184 111 L159 115Z" fill="url(#wb-eng)"/>
    <ellipse cx="155" cy="111" rx="7" ry="7" fill="#141f2a"/>
    <ellipse cx="155" cy="111" rx="4" ry="4" fill="rgba(255,130,0,0.35)"/>
    <path d="M195 103 L222 100 L225 108 L198 111Z" fill="url(#wb-eng)"/>
    <ellipse cx="195" cy="107" rx="7" ry="7" fill="#141f2a"/>
    <ellipse cx="195" cy="107" rx="4" ry="4" fill="rgba(255,130,0,0.35)"/>
    <path d="M238 100 L260 97 L262 105 L240 108Z" fill="url(#wb-eng)"/>
    <ellipse cx="238" cy="104" rx="6" ry="6" fill="#141f2a"/>
    <ellipse cx="238" cy="104" rx="3" ry="3" fill="rgba(255,130,0,0.35)"/>
    <!-- Tail fin (tall) -->
    <path d="M48 74 L43 36 L64 34 L70 74Z" fill="#b8c8d8"/>
    <!-- Horizontal stab -->
    <path d="M34 58 L86 60 L86 65 L34 65Z" fill="#b8c8d8"/>
    <!-- Upper windows row -->
    <g fill="rgba(0,190,255,0.75)">
      <rect x="105" y="77" width="6" height="3.5" rx="1"/>
      <rect x="116" y="77" width="6" height="3.5" rx="1"/>
      <rect x="127" y="77" width="6" height="3.5" rx="1"/>
      <rect x="138" y="77" width="6" height="3.5" rx="1"/>
      <rect x="149" y="77" width="6" height="3.5" rx="1"/>
      <rect x="160" y="77" width="6" height="3.5" rx="1"/>
      <rect x="171" y="77" width="6" height="3.5" rx="1"/>
      <rect x="182" y="77" width="6" height="3.5" rx="1"/>
      <rect x="193" y="77" width="6" height="3.5" rx="1"/>
      <rect x="204" y="77" width="6" height="3.5" rx="1"/>
      <rect x="215" y="77" width="6" height="3.5" rx="1"/>
      <rect x="226" y="77" width="6" height="3.5" rx="1"/>
      <rect x="237" y="77" width="6" height="3.5" rx="1"/>
    </g>
    <!-- Lower windows row -->
    <g fill="rgba(0,190,255,0.55)">
      <rect x="115" y="83" width="5" height="3" rx="1"/>
      <rect x="126" y="83" width="5" height="3" rx="1"/>
      <rect x="137" y="83" width="5" height="3" rx="1"/>
      <rect x="148" y="83" width="5" height="3" rx="1"/>
      <rect x="159" y="83" width="5" height="3" rx="1"/>
      <rect x="170" y="83" width="5" height="3" rx="1"/>
      <rect x="181" y="83" width="5" height="3" rx="1"/>
      <rect x="192" y="83" width="5" height="3" rx="1"/>
      <rect x="203" y="83" width="5" height="3" rx="1"/>
      <rect x="214" y="83" width="5" height="3" rx="1"/>
      <rect x="225" y="83" width="5" height="3" rx="1"/>
    </g>
    <!-- Cyan livery band -->
    <path d="M84 90 L254 88 L254 92 L84 94Z" fill="rgba(0,212,255,0.55)"/>
    <!-- Gear -->
    <line x1="160" y1="93" x2="160" y2="106" stroke="#778899" stroke-width="3"/>
    <line x1="153" y1="106" x2="167" y2="106" stroke="#778899" stroke-width="3"/>
    <text x="160" y="148" text-anchor="middle" fill="rgba(0,212,255,0.6)" font-family="Orbitron,sans-serif" font-size="9" font-weight="700" letter-spacing="2">WIDEBODY</text>
  </svg>`,

  cargo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
    <defs>
      <linearGradient id="cg-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#07101e"/>
        <stop offset="100%" stop-color="#0d1b32"/>
      </linearGradient>
      <linearGradient id="cg-fuse" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e0e8f0"/>
        <stop offset="100%" stop-color="#b8c8d8"/>
      </linearGradient>
      <linearGradient id="cg-eng" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#485860"/>
        <stop offset="100%" stop-color="#788898"/>
      </linearGradient>
    </defs>
    <rect width="320" height="160" fill="url(#cg-sky)"/>
    <ellipse cx="160" cy="128" rx="200" ry="42" fill="rgba(0,60,160,0.07)"/>
    <!-- Large boxy cargo fuselage (B747F with hump) -->
    <path d="M28 90 Q42 78 78 76 L254 73 Q280 73 298 82 Q280 91 254 93 L78 95 Q45 97 28 90Z" fill="url(#cg-fuse)"/>
    <!-- Characteristic 747 hump (upper deck) -->
    <path d="M200 73 Q210 60 235 58 L265 58 Q278 60 285 73Z" fill="#d0dcea"/>
    <!-- Nose -->
    <path d="M254 73 Q295 73 310 82 Q295 91 254 93Z" fill="#d0dcea"/>
    <!-- Upward-hinged nose (open for cargo loading) hint -->
    <line x1="254" y1="73" x2="260" y2="68" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
    <!-- Swept wing (4 engines) -->
    <path d="M130 93 L72 128 L165 124 L170 93Z" fill="#a8b8c8"/>
    <path d="M170 93 L210 128 L265 124 L250 93Z" fill="#a8b8c8"/>
    <!-- 4 engines -->
    <path d="M102 114 L130 110 L134 119 L106 124Z" fill="url(#cg-eng)"/>
    <ellipse cx="102" cy="119" rx="7" ry="7" fill="#111820"/>
    <ellipse cx="102" cy="119" rx="4" ry="4" fill="rgba(255,120,0,0.4)"/>
    <path d="M142 109 L165 106 L168 114 L145 118Z" fill="url(#cg-eng)"/>
    <ellipse cx="142" cy="114" rx="6" ry="6" fill="#111820"/>
    <ellipse cx="142" cy="114" rx="3" ry="3" fill="rgba(255,120,0,0.4)"/>
    <path d="M190 106 L214 103 L216 111 L192 115Z" fill="url(#cg-eng)"/>
    <ellipse cx="190" cy="111" rx="6" ry="6" fill="#111820"/>
    <ellipse cx="190" cy="111" rx="3" ry="3" fill="rgba(255,120,0,0.4)"/>
    <path d="M228 103 L248 101 L250 108 L230 111Z" fill="url(#cg-eng)"/>
    <ellipse cx="228" cy="107" rx="5" ry="5" fill="#111820"/>
    <ellipse cx="228" cy="107" rx="3" ry="3" fill="rgba(255,120,0,0.4)"/>
    <!-- Tail fin -->
    <path d="M46 76 L40 38 L62 36 L68 76Z" fill="#a8b8c8"/>
    <!-- Horizontal stab -->
    <path d="M30 56 L84 58 L84 63 L30 63Z" fill="#a8b8c8"/>
    <!-- CARGO text on fuselage (no windows, just doors) -->
    <text x="170" y="87" text-anchor="middle" fill="rgba(255,165,0,0.85)" font-family="Orbitron,sans-serif" font-size="10" font-weight="900" letter-spacing="3">CARGO</text>
    <!-- Cargo door outlines -->
    <rect x="108" y="76" width="25" height="14" rx="2" fill="none" stroke="rgba(255,165,0,0.4)" stroke-width="1"/>
    <rect x="145" y="75" width="30" height="15" rx="2" fill="none" stroke="rgba(255,165,0,0.4)" stroke-width="1"/>
    <!-- Orange livery stripe -->
    <path d="M78 91 L254 89 L254 93 L78 95Z" fill="rgba(255,165,0,0.45)"/>
    <line x1="155" y1="93" x2="155" y2="106" stroke="#778899" stroke-width="3"/>
    <line x1="148" y1="106" x2="162" y2="106" stroke="#778899" stroke-width="3"/>
    <text x="160" y="148" text-anchor="middle" fill="rgba(255,165,0,0.7)" font-family="Orbitron,sans-serif" font-size="9" font-weight="700" letter-spacing="2">CARGO</text>
  </svg>`,

  supersonic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
    <defs>
      <linearGradient id="ss-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#020710"/>
        <stop offset="100%" stop-color="#070f24"/>
      </linearGradient>
      <linearGradient id="ss-fuse" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f5f8fc"/>
        <stop offset="100%" stop-color="#d8e4f0"/>
      </linearGradient>
      <linearGradient id="ss-eng" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#405060"/>
        <stop offset="100%" stop-color="#708090"/>
      </linearGradient>
      <linearGradient id="ss-heat" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(255,120,0,0)"/>
        <stop offset="100%" stop-color="rgba(255,60,0,0.6)"/>
      </linearGradient>
    </defs>
    <rect width="320" height="160" fill="url(#ss-sky)"/>
    <!-- Stars -->
    <circle cx="20" cy="20" r="1" fill="white" opacity="0.5"/>
    <circle cx="50" cy="35" r="0.8" fill="white" opacity="0.4"/>
    <circle cx="90" cy="15" r="1" fill="white" opacity="0.3"/>
    <circle cx="200" cy="25" r="0.8" fill="white" opacity="0.5"/>
    <circle cx="280" cy="10" r="1" fill="white" opacity="0.4"/>
    <circle cx="310" cy="40" r="0.8" fill="white" opacity="0.3"/>
    <!-- Sonic boom shockwave -->
    <path d="M25 75 L40 90 L25 105" fill="none" stroke="rgba(255,200,100,0.15)" stroke-width="3"/>
    <path d="M18 68 L38 89 L18 110" fill="none" stroke="rgba(255,200,100,0.08)" stroke-width="4"/>
    <!-- Heat shimmer behind engines -->
    <path d="M18 82 L45 82 L45 98 L18 98Z" fill="url(#ss-heat)"/>
    <!-- Slender ogival fuselage (Concorde) with droop nose -->
    <path d="M42 88 Q58 80 95 79 L270 77 Q288 77 305 83 Q295 87 290 84 Q288 85 305 83 Q288 91 270 89 L95 91 Q60 94 42 88Z" fill="url(#ss-fuse)"/>
    <!-- Drooped nose (signature Concorde) -->
    <path d="M268 77 Q290 77 310 83 L310 83 Q293 88 268 89Z" fill="#e0eaf4"/>
    <path d="M285 80 Q305 83 315 83 Q305 84 285 83Z" fill="#c8d8e8"/>
    <!-- Ogee delta wing (Concorde's curved leading edge) -->
    <path d="M95 79 L68 118 L200 116 L250 91 L95 79Z" fill="#b0c4d8" opacity="0.9"/>
    <!-- Wing leading edge curve detail -->
    <path d="M95 79 Q78 95 68 118" fill="none" stroke="#9ab0c4" stroke-width="1.5"/>
    <!-- No separate horizontal tail on delta wing -->
    <!-- Tail fin (tall, swept) -->
    <path d="M78 79 L72 44 L88 42 L94 79Z" fill="#b0c4d8"/>
    <!-- 4 paired engines under delta wing -->
    <path d="M115 108 L140 104 L144 114 L119 118Z" fill="url(#ss-eng)"/>
    <ellipse cx="115" cy="113" rx="6" ry="6" fill="#101820"/>
    <ellipse cx="115" cy="113" rx="3" ry="3" fill="rgba(255,100,0,0.5)"/>
    <!-- Afterburner flame left inner -->
    <path d="M109 110 L98 112 L109 115" fill="rgba(255,80,0,0.7)"/>
    <path d="M98 112 L85 112 L98 112" fill="rgba(255,160,0,0.4)"/>
    <path d="M150 104 L170 102 L173 110 L152 114Z" fill="url(#ss-eng)"/>
    <ellipse cx="150" cy="108" rx="5" ry="5" fill="#101820"/>
    <ellipse cx="150" cy="108" rx="3" ry="3" fill="rgba(255,100,0,0.5)"/>
    <!-- Afterburner flame left outer -->
    <path d="M145 106 L133 108 L145 110" fill="rgba(255,80,0,0.7)"/>
    <path d="M133 108 L120 108 L133 108" fill="rgba(255,160,0,0.3)"/>
    <path d="M188 101 L208 99 L210 107 L190 110Z" fill="url(#ss-eng)"/>
    <ellipse cx="188" cy="106" rx="5" ry="5" fill="#101820"/>
    <ellipse cx="188" cy="106" rx="3" ry="3" fill="rgba(255,100,0,0.5)"/>
    <path d="M222 99 L238 97 L240 105 L224 107Z" fill="url(#ss-eng)"/>
    <ellipse cx="222" cy="103" rx="5" ry="5" fill="#101820"/>
    <ellipse cx="222" cy="103" rx="3" ry="3" fill="rgba(255,100,0,0.5)"/>
    <!-- Windows (tiny, oval, Concorde style) -->
    <g fill="rgba(0,200,255,0.8)">
      <ellipse cx="155" cy="81" rx="3" ry="2.5"/>
      <ellipse cx="167" cy="81" rx="3" ry="2.5"/>
      <ellipse cx="179" cy="81" rx="3" ry="2.5"/>
      <ellipse cx="191" cy="81" rx="3" ry="2.5"/>
      <ellipse cx="203" cy="81" rx="3" ry="2.5"/>
      <ellipse cx="215" cy="81" rx="3" ry="2.5"/>
      <ellipse cx="227" cy="81" rx="3" ry="2.5"/>
      <ellipse cx="239" cy="81" rx="3" ry="2.5"/>
      <ellipse cx="251" cy="81" rx="3" ry="2.5"/>
    </g>
    <!-- Purple/gold supersonic livery stripe -->
    <path d="M95 87 L268 85 L268 89 L95 91Z" fill="rgba(168,85,247,0.55)"/>
    <path d="M95 90 L268 88 L268 91 L95 93Z" fill="rgba(255,190,0,0.3)"/>
    <!-- Speed lines -->
    <line x1="8" y1="83" x2="40" y2="83" stroke="rgba(168,85,247,0.4)" stroke-width="1.5"/>
    <line x1="5" y1="88" x2="38" y2="88" stroke="rgba(168,85,247,0.6)" stroke-width="2"/>
    <line x1="10" y1="93" x2="42" y2="93" stroke="rgba(168,85,247,0.4)" stroke-width="1.5"/>
    <text x="160" y="148" text-anchor="middle" fill="rgba(168,85,247,0.8)" font-family="Orbitron,sans-serif" font-size="9" font-weight="700" letter-spacing="2">SUPERSONIC</text>
  </svg>`,
};

function getAircraftImage(category) {
  return AC_IMAGES[category] || AC_IMAGES['narrowbody'];
}
