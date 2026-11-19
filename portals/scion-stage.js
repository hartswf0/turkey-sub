/* ============================================================================
 * Turkey Sub \u00b7 BOLAS Oulipo Screening Room & Multi-SCION Rostrum Stage Toolkit
 * File: portals/scion-stage.js  (window.SCION_STAGE)
 *
 * Powers V2 Multi-SCION Remake films & live 60fps cockpits (portals/remake-01..11.js)
 * across all 55 portholes (#01\u2013#55) at 1280\u00d7720, 24fps, 16.0s (384 frames):
 *   - 0.0\u20134.0s   : Variation I   \u00b7 (A) Real Creek
 *   - 4.0\u20138.0s   : Variation II  \u00b7 (B) Probable \u00b7 Turkey (+ Snail Mail Out)
 *   - 8.0\u201312.0s  : Variation III \u00b7 (C) Plausible \u00b7 Trout (+ Snail Mail Reply)
 *   - 12.0\u201316.0s : Variation IV  \u00b7 (D) Preposterous \u00b7 Alien Listening Post
 *
 * Authentic PAELEO / BOLAS Oulipo Screening Room Materiality
 * ("Foraged or handmade, never faked"):
 *   - preloadPortalPlates(id) / getPortalPlates(id): loads real ./portholes/pNN.jpg
 *     and ./assets/atlas-stills/atlas-MM.webp in headless Chrome & live browser.
 *   - drawScissorCutout(...): irregular scissor-cut crops from real bitmap plates
 *     with 4.5px cream paper halos, archival mono/sepia/litho filters, & drop shadows.
 *   - drawTornPaperFlat(...): ragged torn-deckle paper architectural flats & floors
 *     (modeled after exercices-de-style.webp).
 *   - drawCardboardPuppetPiece(...) + drawSplitPin(...): mottled grey-cardboard
 *     jointed puppets with charcoal rib/fold shading & glinting metallic brads
 *     (modeled after la-mort-en-ce-jardin.webp).
 *   - 5 BOLAS Rostrum Visual Families: "queneau-rostrum", "cardboard-parallax",
 *     "daumier-litho", "perec-stage", "duchamp-optic".
 *   - drawBolasSlateAndStrip(...) / drawRubricBar(...): miniature 4-box contact
 *     filmstrip with stamp-red #d42a1e active frame + BOLAS editorial slate.
 *   - CRITICAL PAELEO INVARIANT: When state && state.showCaptions === false,
 *     emits ZERO fillText or strokeText calls anywhere on canvas!
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var DEFAULT_W = 1280;
  var DEFAULT_H = 720;
  var STAGE_H = 638;
  var RUBRIC_Y = 638;
  var RUBRIC_H = 82;
  var DURATION = 16.0;
  var LOOP_DUR = 16.0;
  var BEAT_DUR = 4.0;
  var FPS = 24;
  var TOTAL_FRAMES = 384;

  // Auto-detect turkey-sub root directory from script URL so relative plates resolve from ANY page or /tmp harness
  var BASE_URL = "./";
  try {
    if (root && root.__TURKEY_SUB_ROOT) {
      BASE_URL = String(root.__TURKEY_SUB_ROOT).replace(/\/?$/, "/");
    } else if (typeof document !== "undefined" && document.currentScript && document.currentScript.src) {
      BASE_URL = new URL("..", document.currentScript.src).href;
    }
  } catch (e) {
    BASE_URL = "./";
  }

  var COLORS = {
    real: "#14110d",
    probable: "#1d596e",
    plausible: "#0f8f80",
    preposterous: "#d42a1e",
    turkey: "#1d596e",
    trout: "#0f8f80",
    alien: "#d42a1e",
    paper: "#fbfaf7",
    paper2: "#f1ede2",
    butter: "#f7dd8c",
    kraft: "#d4b982",
    slateTaupe: "#857d74",
    ink: "#14110d",
    inkSoft: "#3d3831",
    mute: "#6e675f",
    rule: "#dcd6c8",
    stamp: "#d42a1e",
    teal: "#0f8f80",
    dusk: "#2a3a63",
    brassHi: "#f3d184",
    brass: "#d4a44c",
    brassMid: "#a6782a",
    brassDark: "#6a4914"
  };

  var DIE_PIPS = {
    1: [[0, 0]],
    2: [[-0.46, -0.46], [0.46, 0.46]],
    3: [[-0.50, -0.50], [0, 0], [0.50, 0.50]],
    4: [[-0.46, -0.46], [0.46, -0.46], [-0.46, 0.46], [0.46, 0.46]],
    5: [[-0.48, -0.48], [0.48, -0.48], [0, 0], [-0.48, 0.48], [0.48, 0.48]],
    6: [[-0.46, -0.52], [0.46, -0.52], [-0.46, 0], [0.46, 0], [-0.46, 0.52], [0.46, 0.52]]
  };

  // 1-indexed map of porthole id (1..55) -> matched atlas-MM.webp index
  var ATLAS_STILL_FOR_PORTAL = [
    0,
    21, 47, 49, 39, 53,  5, 19, 16, 44, 34,
     7,  9, 54,  2, 29,  8, 55, 38, 35, 41,
     1, 33, 42, 51, 45, 48, 17,  3, 20, 43,
    11, 40, 13, 10,  4, 15, 26, 37, 24, 25,
    28, 32, 30, 52, 36, 50, 12, 22, 18, 31,
    14, 23, 27, 46,  6
  ];

  // Built-in fallback copy of STUDENT_OPTIONS[1..55], recipe badges & bolasStyle
  var FALLBACK_OPTIONS = {
    1: ["#01 \u00b7 Bow", "A giant Size 11 rubber boot", "A sunken wooden shipwreck", "A pinching crab\u2019s dark cave", "The Emperor\u2019s lost moon-boot", "Ripois \u00b7 S01 Gilliam \u00b7 cardboard-parallax", "cardboard-parallax"],
    2: ["#02 \u00b7 Galley", "Trout Cook holding a silver baster", "A friendly submarine air pump", "A canned roast dinner delivery", "A warp-core fuel syringe", "Oubapo \u00b7 S11 VideoPuppet \u00b7 queneau-rostrum", "queneau-rostrum"],
    3: ["#03 \u00b7 Starbd", "A sunken Room 4 chalkboard", "A Most Wanted bandit poster", "The dreaded creek Hook Monster", "A galactic bounty-hunter board", "Outypopo \u00b7 S17 SouthPark \u00b7 perec-stage", "perec-stage"],
    4: ["#04 \u00b7 Belly", "A snapping turtle on a key", "A rival iron mini-submarine", "A grumpy thief\u2019s back-scratcher", "An ancient starship ignition key", "MortJardin \u00b7 S02 Reiniger \u00b7 daumier-litho", "daumier-litho"],
    5: ["#05 \u00b7 Scope", "A raccoon washing a tin plate", "A sneaky creek hubcap thief", "A bubbly floating pie tin", "A masked UFO saucer polisher", "99Ways \u00b7 S13 Willett \u00b7 duchamp-optic", "duchamp-optic"],
    6: ["#06 \u00b7 Stern", "Sheriff Carp inspecting a lure", "A cook measuring my roasting pan", "An undercover fish police deputy", "A comet-hook space bounty hunter", "Oulipopo \u00b7 S20 Harmony \u00b7 daumier-litho", "daumier-litho"],
    7: ["#07 \u00b7 Hatch", "A soggy sunken birthday pi\u00f1ata", "A spiky underwater naval mine", "A noisy brass birthday kazoo", "A candy-stuffed alien mothership", "Oumupo \u00b7 S22 PerfCapture \u00b7 queneau-rostrum", "queneau-rostrum"],
    8: ["#08 \u00b7 Gauge", "A tiny snail crawling on glass", "A bug eating our treasure map", "A giant eyeball behind the glass", "A glowing slime-trail wormhole", "Ripois \u00b7 S05 Norstein \u00b7 perec-stage", "perec-stage"],
    9: ["#09 \u00b7 Port", "A trout pushing a shopping cart", "A heavy iron ramming cage", "A rude grocery aisle blocker", "A rolling asteroid mining rover", "Fugue \u00b7 S53 CivicFootage \u00b7 cardboard-parallax", "cardboard-parallax"],
    10: ["#10 \u00b7 PA", "A clam-shell school loudspeaker", "A giant snapping monster jaw", "A stolen metal school lunchbox", "A telepathic space megaphone", "Cit\u00e9Queneau \u00b7 S16 JibJab \u00b7 perec-stage", "perec-stage"],
    11: ["#11 \u00b7 Tank", "A sunken picnic water cooler", "An emergency air-supply tank", "A fizzy creek soda dispenser", "A frozen alien cryo-sleep pod", "Teuf-Teuf \u00b7 S08 Sutherland \u00b7 queneau-rostrum", "queneau-rostrum"],
    12: ["#12 \u00b7 Keel", "A cardboard stage floor window", "A spinning creek whirlpool drain", "A one-dollar sideshow spotlight", "A secret pocket-universe trapdoor", "MorningStroll \u00b7 S01 Gilliam \u00b7 duchamp-optic", "duchamp-optic"],
    13: ["#13 \u00b7 Arch", "A brass twig-bell on a rock", "A sneaky tripwire dinner bell", "A polite creek ferry doorbell", "A cosmic stargate toll chime", "Boucle-l\u00e0 \u00b7 S02 Reiniger \u00b7 cardboard-parallax", "cardboard-parallax"],
    14: ["#14 \u00b7 Tower", "A sinking red autumn maple leaf", "A scary Thanksgiving countdown sign", "A bright scarlet bird feather", "A tiny solar-sail landing craft", "HommeDort \u00b7 S05 Norstein \u00b7 perec-stage", "perec-stage"],
    15: ["#15 \u00b7 Lens", "A wall of wavy glass blocks", "A badly cracked submarine window", "Nine tiny blurry baby chickens", "A pixelated alien force-field grid", "Oupeinpo \u00b7 S06 Whitney \u00b7 duchamp-optic", "duchamp-optic"],
    16: ["#16 \u00b7 Aft", "A twin Turkey Sub waving back", "A shiny sunken pond mirror", "A two-headed tin creek monster", "A parallel-universe turkey clone", "CercleVicieux \u00b7 S27 Remotion \u00b7 daumier-litho", "daumier-litho"],
    17: ["#17 \u00b7 Dorsal", "Fish arguing around a stone table", "A stern underwater courtroom jury", "A shiny new creek parking meter", "The high Galactic Senate tribunal", "Oupolpot \u00b7 S25 RiveState \u00b7 daumier-litho", "daumier-litho"],
    18: ["#18 \u00b7 Vent", "A star-carved old steamer trunk", "A sunken pirate treasure chest", "A stage magician\u2019s trick box", "A trapped pocket constellation", "99WaysSubj \u00b7 S02 Reiniger \u00b7 perec-stage", "perec-stage"],
    19: ["#19 \u00b7 Bilge", "A potato poked with bendy straws", "A giant spiky sea urchin", "A sneaky potato-eating creek bug", "A ten-antennaed potato satellite", "BangBang \u00b7 S09 Igarashi \u00b7 duchamp-optic", "duchamp-optic"],
    20: ["#20 \u00b7 Dome", "A colorful pebble glass window", "A grand sunken royal palace", "A glowing angel in a jar", "A crystal mothership warp beam", "BelleHortense \u00b7 S18 Saloon \u00b7 perec-stage", "perec-stage"],
    21: ["#21 \u00b7 Fwd", "Five big trout tapping bus screens", "Enemy fish hacking our radar", "A late morning creek city bus", "Giant hive-mind telepathy Titans", "RenzoLuciana \u00b7 S19 MohoRig \u00b7 perec-stage", "perec-stage"],
    22: ["#22 \u00b7 Trim", "A fish coach leading water squats", "Angry river guards marching closer", "A heavy iron gym kettlebell", "Mind-control zero-gravity aerobics", "ExercicesAnim \u00b7 S14 Pose2Pose \u00b7 queneau-rostrum", "queneau-rostrum"],
    23: ["#23 \u00b7 Scope B", "A pink sea-anemone wall clock", "A hungry underwater monster plant", "The Principal\u2019s gold pocketwatch", "A living time-machine dial", "Ouphopo \u00b7 S07 Fold\u00e8s \u00b7 duchamp-optic", "duchamp-optic"],
    24: ["#24 \u00b7 Rudder", "A chewed-up green fishing net", "A sneaky hunter\u2019s turkey trap", "Giant tin scissors cutting twine", "Tangled space-kraken dental floss", "Outrapo \u00b7 S23 SpineIK \u00b7 cardboard-parallax", "cardboard-parallax"],
    25: ["#25 \u00b7 Lock", "A trout wearing a glass fishbowl", "A deep-sea diver\u2019s glass helmet", "A wild bird in a bottle", "A gill-breathing alien spacesuit", "95Crossed \u00b7 S24 Live2D \u00b7 queneau-rostrum", "queneau-rostrum"],
    26: ["#26 \u00b7 Boiler", "Glowing hot coals on the riverbed", "A giant pot of turkey soup", "A camper\u2019s sunken cooking stove", "A fiery baby star hatchery", "Exercices \u00b7 S05 Norstein \u00b7 cardboard-parallax", "cardboard-parallax"],
    27: ["#27 \u00b7 Port M", "An old sunken rabbit-ear TV", "An urgent rescue radio signal", "The creek cable repairman\u2019s van", "An alien brainwashing ray-tube", "MartinoVar \u00b7 S28 PlateFoundry \u00b7 duchamp-optic", "duchamp-optic"],
    28: ["#28 \u00b7 Stbd M", "Silver minnows swimming in a wave", "A glowing highway exit arrow", "A flashy holiday parade leader", "A swarm of liquid-metal nanobots", "Oucipo \u00b7 S06 Whitney \u00b7 daumier-litho", "daumier-litho"],
    29: ["#29 \u00b7 Deck", "An open sunken family photo album", "A spilled bag of soggy letters", "A nosy celebrity camera flash", "A lost time-traveler\u2019s scrapbook", "EllisIsland \u00b7 S04 Mouris \u00b7 queneau-rostrum", "queneau-rostrum"],
    30: ["#30 \u00b7 Top", "Six glowing letter bubbles rising", "Floating underwater explosive mines", "A loud school spelling-bee buzzer", "Planet Earth\u2019s self-destruct code", "Oulipo \u00b7 S18 Saloon \u00b7 queneau-rostrum", "queneau-rostrum"],
    31: ["#31 \u00b7 Galley B", "A dented metal bread-roll baking tin", "A terrifying Thanksgiving oven pan", "A cozy heated minnow hot-tub", "A scorched spaceship heat-shield", "Oucuipo \u00b7 S52 GilliamEphem \u00b7 queneau-rostrum", "queneau-rostrum"],
    32: ["#32 \u00b7 Beak Arm", "Metal tongs pinching an old key", "A giant snapping crab pincer", "A scary mechanical fish dentist", "A robotic UFO abduction claw", "Teuf-Teuf \u00b7 S01 Gilliam \u00b7 cardboard-parallax", "cardboard-parallax"],
    33: ["#33 \u00b7 Salon", "Dark drainpipe bars in the shadows", "A fancy red theater stage curtain", "An old-timey creek movie projector", "Hungry beasts from Shadow Space", "Ripois \u00b7 S03 Ernst/Zeman \u00b7 daumier-litho", "daumier-litho"],
    34: ["#34 \u00b7 Organ", "An old boiler with brass pipes", "A friendly steamboat rescue crew", "A loud circus music riverboat", "A giant planet-breathing space lung", "Ouarchpo \u00b7 S26 M\u00e9li\u00e8sStage \u00b7 perec-stage", "perec-stage"],
    35: ["#35 \u00b7 Post #44", "An old canvas sack of letters", "A bag of dirty crew laundry", "A sneaky porch-pirate mail thief", "A secret Sector 44 spy drop", "MachineTemps \u00b7 S50 LOC \u00b7 cardboard-parallax", "cardboard-parallax"],
    36: ["#36 \u00b7 Bench", "A hound statue holding a letter", "The Governor\u2019s Thanksgiving pardon", "A shiny brass creekside mailbox", "A messenger from the Dog Star", "QuartSeconde \u00b7 S03 Ernst/Zeman \u00b7 daumier-litho", "daumier-litho"],
    37: ["#37 \u00b7 Bulkhead", "A folded muddy creek trail map", "A tricky hidden ambush trap", "A friendly fin-to-claw handshake", "A secret wormhole star chart", "FoldedComic \u00b7 S10 MLS-Origami \u00b7 queneau-rostrum", "queneau-rostrum"],
    38: ["#38 \u00b7 Visor", "A soggy marker posterboard chart", "A scary butcher-shop meat diagram", "A magical creek wish-machine", "Top-secret Roswell saucer plans", "MakiMococo \u00b7 S49 Atelier \u00b7 queneau-rostrum", "queneau-rostrum"],
    39: ["#39 \u00b7 Parlor", "A flooded wallpapered living room", "Grandma\u2019s cozy dry front parlor", "A giant noisy rug vacuum", "An alien zoo\u2019s human cage", "Fugue \u00b7 S05 Norstein \u00b7 perec-stage", "perec-stage"],
    40: ["#40 \u00b7 Reef", "Spools of old cassette music tape", "Wiggly ribbons of cranberry sauce", "A booming underwater jukebox", "A sparkling sugar-crystal space city", "Outrapo \u00b7 S07 Fold\u00e8s \u00b7 duchamp-optic", "duchamp-optic"],
    41: ["#41 \u00b7 Catwalk", "A fish in sunglasses on stilts", "A dizzy low-air water mirage", "A rolling tin can of soup", "An undercover Men-in-Black agent", "Zazie \u00b7 S15 Yuasa/Puppet \u00b7 daumier-litho", "daumier-litho"],
    42: ["#42 \u00b7 Ferry", "Two paper puppets between two trees", "Grumpy bridge tollbooth guards", "The brand-new river ferryboat", "Twin cosmic portal gatekeepers", "Ouhispo \u00b7 S02 Reiniger \u00b7 queneau-rostrum", "queneau-rostrum"],
    43: ["#43 \u00b7 Snout", "A spotted toy yellow shark nose", "A hungry lemon-pepper sea monster", "A friendly giant yellow sunfish", "A robotic space-banana probe", "99Ways \u00b7 S18 Saloon \u00b7 queneau-rostrum", "queneau-rostrum"],
    44: ["#44 \u00b7 Rotor", "A spinning striped paper disc", "A dizzying hypnosis mind-trap", "The diner\u2019s lucky pie-prize wheel", "A swirling alien memory-wiper", "An\u00e9micCin\u00e9ma \u00b7 S06 Whitney \u00b7 duchamp-optic", "duchamp-optic"],
    45: ["#45 \u00b7 Extruder", "A plastic funnel full of beads", "A machine that melts turkey basters", "A giant creek gravel vacuum", "An alien atom-pellet replicator", "ChantStyr\u00e8ne \u00b7 S51 MourisArch \u00b7 duchamp-optic", "duchamp-optic"],
    46: ["#46 \u00b7 Steps", "Giant brass letters spelling GOBBLE", "An emergency escape step-ladder", "A falling store-front metal sign", "Floating anti-gravity space stairs", "Zazie \u00b7 S01 Gilliam \u00b7 queneau-rostrum", "queneau-rostrum"],
    47: ["#47 \u00b7 Armada", "Glass jars tied into a raft", "A spooky pickle-jar factory", "A floating creek trading boat", "A hundred-dome Mars colony fleet", "ALAMO \u00b7 S18 Saloon \u00b7 perec-stage", "perec-stage"],
    48: ["#48 \u00b7 Belfry", "A flooded tin church steeple", "A dry roof to roost on", "A spinning rooster weathervane", "A sunken silver rocket nose-cone", "EllisIsland \u00b7 S50 LOC \u00b7 cardboard-parallax", "cardboard-parallax"],
    49: ["#49 \u00b7 Corner", "A sunken street traffic stoplight", "Early twinkling Christmas lights", "A speeding yellow creek taxicab", "An intergalactic space checkpoint", "RenzoLuciana \u00b7 S53 Civic \u00b7 cardboard-parallax", "cardboard-parallax"],
    50: ["#50 \u00b7 Riffle", "One tiny fish guarding a sign", "A strict government river roadblock", "A noisy mini creek bulldozer", "Earth\u2019s supreme force-field guardian", "Ouhispo \u00b7 S50 LOC \u00b7 daumier-litho", "daumier-litho"],
    51: ["#51 \u00b7 Grotto", "A huge pearl inside a clam", "A giant peeled hard-boiled egg", "A stolen white bowling ball", "A glowing alien moon-egg core", "BelleHortense \u00b7 S03 Ernst/Zeman \u00b7 daumier-litho", "daumier-litho"],
    52: ["#52 \u00b7 Bridge", "A tight red rope between rocks", "A giant red squid tentacle", "A helpful creek tow-truck line", "An orbital space-elevator cable", "Ripois \u00b7 S12 Jacobson \u00b7 cardboard-parallax", "cardboard-parallax"],
    53: ["#53 \u00b7 Flume", "An old iron watermill wheel", "A giant kitchen pie-crust crimper", "A heavy log jamming the creek", "Planet Earth\u2019s main spin gear", "Oucipo \u00b7 S50 LOC \u00b7 cardboard-parallax", "cardboard-parallax"],
    54: ["#54 \u00b7 Ledge", "A giant wrinkled creek salamander", "A ruffled porcelain gravy boat", "A clunky tin hermit crab", "The frilly Emperor of Space", "Oubapo \u00b7 S13 Willett \u00b7 cardboard-parallax", "cardboard-parallax"],
    55: ["#55 \u00b7 Eddy", "A corked brass tube of postcards", "An angry landlord\u2019s eviction note", "The lost dead-letter creek dropbox", "A message pod from 54 galaxies", "Compiler \u00b7 S54 Provenance \u00b7 queneau-rostrum", "queneau-rostrum"]
  };

  // ---------- Pure Math & Easing ----------
  function pad2(n) { return n < 10 ? "0" + n : String(n); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function smooth(a, b, x) {
    var u = clamp((x - a) / ((b - a) || 1e-6), 0, 1);
    return u * u * (3 - 2 * u);
  }
  function easeInOutCubic(u) {
    var x = clamp(u, 0, 1);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }
  function easeOutBack(u) {
    var x = clamp(u, 0, 1);
    var c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }
  function hash(n) {
    var s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  function roundedRectPath(ctx, x, y, w, h, r) {
    var rr = Math.max(0, Math.min(r, w * 0.5, h * 0.5));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function isBlind(state) {
    return !!(state && state.showCaptions === false);
  }

  function safeText(ctx, text, x, y, state, maxWidth) {
    if (isBlind(state)) return;
    if (typeof maxWidth === "number") ctx.fillText(String(text == null ? "" : text), x, y, maxWidth);
    else ctx.fillText(String(text == null ? "" : text), x, y);
  }

  function safeStrokeText(ctx, text, x, y, state, maxWidth) {
    if (isBlind(state)) return;
    if (typeof maxWidth === "number") ctx.strokeText(String(text == null ? "" : text), x, y, maxWidth);
    else ctx.strokeText(String(text == null ? "" : text), x, y);
  }

  function normalizeTime(rawT) {
    var t = (typeof rawT === "number" && isFinite(rawT)) ? rawT : 0;
    if (t < 0) t = 0;
    if (t > DURATION + 0.0001) t = t % DURATION;
    return t;
  }

  // ---------- 16.0s 4-Variation Timeline & State Resolver ----------
  function resolveBeat(rawT, state) {
    var t = normalizeTime(rawT);
    var st = state || {};
    var v = typeof st.view === "string" ? st.view.toLowerCase() : "auto";

    var index = 0, key = "a", code = "A", roman = "I", label = "A \u00b7 Real Creek", color = COLORS.real;
    var localT = 0, dur = BEAT_DUR;

    if (v === "real" || v === "a" || v === "creek") {
      index = 0; key = "a"; code = "A"; roman = "I"; label = "A \u00b7 Real Creek"; color = COLORS.real;
      localT = t % dur;
    } else if (v === "turkey" || v === "probable" || v === "b") {
      index = 1; key = "b"; code = "B"; roman = "II"; label = "B \u00b7 Probable (Turkey)"; color = COLORS.probable;
      localT = t % dur;
    } else if (v === "trout" || v === "plausible" || v === "c") {
      index = 2; key = "c"; code = "C"; roman = "III"; label = "C \u00b7 Plausible (Trout)"; color = COLORS.plausible;
      localT = t % dur;
    } else if (v === "alien" || v === "preposterous" || v === "d") {
      index = 3; key = "d"; code = "D"; roman = "IV"; label = "D \u00b7 Preposterous (Alien)"; color = COLORS.preposterous;
      localT = t % dur;
    } else {
      if (t < 4.0) {
        index = 0; key = "a"; code = "A"; roman = "I"; label = "A \u00b7 Real Creek"; color = COLORS.real;
        localT = t;
      } else if (t < 8.0) {
        index = 1; key = "b"; code = "B"; roman = "II"; label = "B \u00b7 Probable (Turkey)"; color = COLORS.probable;
        localT = t - 4.0;
      } else if (t < 12.0) {
        index = 2; key = "c"; code = "C"; roman = "III"; label = "C \u00b7 Plausible (Trout)"; color = COLORS.plausible;
        localT = t - 8.0;
      } else {
        index = 3; key = "d"; code = "D"; roman = "IV"; label = "D \u00b7 Preposterous (Alien)"; color = COLORS.preposterous;
        localT = t - 12.0;
      }
    }

    var lampOn = (typeof st.lamp === "boolean") ? st.lamp : true;
    var ballastOn = (typeof st.ballast === "boolean") ? st.ballast : false;
    var roll = (typeof st.roll === "number" && st.roll >= 1 && st.roll <= 6) ? Math.round(st.roll) : 0;

    return {
      t: t,
      view: v,
      index: index,
      beat: index,
      num: index + 1,
      roman: roman,
      key: key,
      code: code,
      label: label,
      color: color,
      localT: localT,
      dur: dur,
      u: clamp(localT / dur, 0, 1),
      blind: isBlind(st),
      lampOn: lampOn,
      lampAmt: lampOn ? 1.0 : 0.25,
      ballastOn: ballastOn,
      ballastAmt: ballastOn ? 1.0 : 0.0,
      roll: roll,
      snailActive: !!st.snailActive,
      snailT: (typeof st.snailT === "number") ? clamp(st.snailT, 0, 1) : null
    };
  }

  function getStudentOptions(id) {
    var pid = clamp(Math.round(id || 1), 1, 55);
    var ext = (root && root.STUDENT_OPTIONS && root.STUDENT_OPTIONS[pid]) || null;
    var fb = FALLBACK_OPTIONS[pid] || FALLBACK_OPTIONS[1];
    if (ext && String(ext.station || "").indexOf("\u00c2") === -1 && String(ext.c || "").indexOf("\u00e2") === -1) {
      return {
        station: ext.station || fb[0],
        a: ext.a || fb[1],
        b: ext.b || fb[2],
        c: ext.c || fb[3],
        d: ext.d || fb[4]
      };
    }
    return { station: fb[0], a: fb[1], b: fb[2], c: fb[3], d: fb[4] };
  }

  function getStack(id) {
    var pid = clamp(Math.round(id || 1), 1, 55);
    if (root && root.PORTHOLE_SCION_STACKS && root.PORTHOLE_SCION_STACKS[pid]) {
      return root.PORTHOLE_SCION_STACKS[pid];
    }
    return null;
  }

  function getRecipeBadge(id) {
    var pid = clamp(Math.round(id || 1), 1, 55);
    var st = getStack(pid);
    if (st && st.recipeBadge) return st.recipeBadge;
    var fb = FALLBACK_OPTIONS[pid];
    return fb ? fb[5] : "Ripois \u00b7 SCION Multi-Swarm";
  }

  function getBolasStyle(id) {
    var pid = clamp(Math.round(id || 1), 1, 55);
    var st = getStack(pid);
    if (st && st.bolasStyle) return st.bolasStyle;
    var fb = FALLBACK_OPTIONS[pid];
    return fb ? fb[6] : "queneau-rostrum";
  }

  // ---------- Foraged Real Plate Preloader & Synchronous Cache ----------
  var _plateCache = {};

  function resolveAssetUrl(relPath) {
    var clean = String(relPath || "").replace(/^\.\//, "");
    try {
      return new URL(clean, BASE_URL).href;
    } catch (e) {
      return "./" + clean;
    }
  }

  function plateUrlsForId(id) {
    var pid = clamp(Math.round(id || 1), 1, 55);
    var st = getStack(pid);
    var pRel = (st && st.portholePlate) ? st.portholePlate : ("./portholes/p" + pad2(pid) + ".jpg");
    var aIdx = ATLAS_STILL_FOR_PORTAL[pid] || pid;
    var aRel = (st && st.atlasPlate) ? st.atlasPlate : ("./assets/atlas-stills/atlas-" + pad2(aIdx) + ".webp");
    return {
      portholeUrl: resolveAssetUrl(pRel),
      atlasUrl: resolveAssetUrl(aRel)
    };
  }

  function loadSingleImage(url) {
    return new Promise(function (resolve) {
      if (typeof Image === "undefined") {
        resolve(null);
        return;
      }
      var img = new Image();
      img.decoding = "async";
      var done = false;
      function finish(res) {
        if (done) return;
        done = true;
        resolve(res);
      }
      img.onload = function () { finish(img); };
      img.onerror = function () { finish(null); };
      img.src = url;
      if (img.complete && img.naturalWidth > 0) {
        finish(img);
      }
    });
  }

  function preloadSinglePortalPlates(id) {
    var pid = clamp(Math.round(id || 1), 1, 55);
    if (_plateCache[pid] && _plateCache[pid].promise) {
      return _plateCache[pid].promise;
    }
    var urls = plateUrlsForId(pid);
    var record = {
      id: pid,
      portholeImg: null,
      atlasImg: null,
      ready: false,
      promise: null
    };
    _plateCache[pid] = record;

    // Kick off Image objects immediately so getPortalPlates(pid) sees them as soon as decoded
    if (typeof Image !== "undefined") {
      var pImg = new Image();
      var aImg = new Image();
      record.portholeImg = pImg;
      record.atlasImg = aImg;
      var pDone = false, aDone = false;
      record.promise = new Promise(function (resolve) {
        function check() {
          if (pDone && aDone) {
            record.ready = true;
            resolve(record);
          }
        }
        pImg.onload = function () { pDone = true; check(); };
        pImg.onerror = function () { record.portholeImg = null; pDone = true; check(); };
        aImg.onload = function () { aDone = true; check(); };
        aImg.onerror = function () { record.atlasImg = null; aDone = true; check(); };
        pImg.src = urls.portholeUrl;
        aImg.src = urls.atlasUrl;
      });
    } else {
      record.ready = true;
      record.promise = Promise.resolve(record);
    }
    return record.promise;
  }

  // Accepts a single id (1..55) OR an array of ids ([1,2,3,4,5])
  function preloadPortalPlates(idOrList) {
    if (Array.isArray(idOrList)) {
      return Promise.all(idOrList.map(preloadSinglePortalPlates));
    }
    return preloadSinglePortalPlates(idOrList);
  }

  // Synchronous accessor safe to call inside 60fps render()
  function getPortalPlates(id) {
    var pid = clamp(Math.round(id || 1), 1, 55);
    if (!_plateCache[pid]) {
      preloadSinglePortalPlates(pid);
    }
    var rec = _plateCache[pid];
    var pOk = !!(rec.portholeImg && rec.portholeImg.complete && rec.portholeImg.naturalWidth > 0);
    var aOk = !!(rec.atlasImg && rec.atlasImg.complete && rec.atlasImg.naturalWidth > 0);
    return {
      id: pid,
      portholeImg: pOk ? rec.portholeImg : null,
      atlasImg: aOk ? rec.atlasImg : null,
      ready: pOk && aOk
    };
  }

  // ---------- Cached Procedural Paper Fibre & Grey-Cardboard Patterns ----------
  var _paperPat = null;
  var _cardPatterns = {};

  function getPaperPattern(ctx) {
    if (_paperPat) return _paperPat;
    try {
      if (typeof document !== "undefined" && document.createElement) {
        var c = document.createElement("canvas");
        c.width = 96;
        c.height = 96;
        var g = c.getContext("2d");
        var img = g.createImageData(96, 96);
        for (var i = 0; i < 96 * 96; i++) {
          var n1 = hash(i * 1.73 + 3.1);
          var n2 = hash(i * 7.13 + 19.7);
          var v = Math.floor(205 + (n1 - 0.5) * 70);
          var speck = n2 > 0.985 ? -95 : 0;
          img.data[i * 4 + 0] = clamp(v + speck, 0, 255);
          img.data[i * 4 + 1] = clamp(v - 6 + speck, 0, 255);
          img.data[i * 4 + 2] = clamp(v - 16 + speck, 0, 255);
          img.data[i * 4 + 3] = n2 > 0.985 ? 42 : 16;
        }
        g.putImageData(img, 0, 0);
        // Tiny organic pulp hairlines
        g.strokeStyle = "rgba(85, 72, 54, 0.08)";
        g.lineWidth = 0.8;
        for (var f = 0; f < 18; f++) {
          var fx = hash(f * 11.3) * 96;
          var fy = hash(f * 23.9) * 96;
          var fa = hash(f * 5.7) * TAU;
          g.beginPath();
          g.moveTo(fx, fy);
          g.lineTo(fx + Math.cos(fa) * 9, fy + Math.sin(fa) * 9);
          g.stroke();
        }
        _paperPat = ctx.createPattern(c, "repeat");
      }
    } catch (e) { _paperPat = null; }
    return _paperPat;
  }

  function getCardboardPattern(ctx, baseHex) {
    var key = baseHex || "#8a8985";
    if (_cardPatterns[key]) return _cardPatterns[key];
    try {
      if (typeof document !== "undefined" && document.createElement) {
        var c = document.createElement("canvas");
        c.width = 80;
        c.height = 80;
        var g = c.getContext("2d");
        g.fillStyle = key;
        g.fillRect(0, 0, 80, 80);

        // Mottled grey/kraft cardboard blotches & dark pulp flecks (like la-mort-en-ce-jardin.webp!)
        for (var i = 0; i < 160; i++) {
          var x = hash(i * 3.7 + 1.1) * 80;
          var y = hash(i * 9.3 + 4.7) * 80;
          var r = 1.2 + hash(i * 5.1) * 4.5;
          var light = hash(i * 13.7) > 0.5;
          g.fillStyle = light ? "rgba(255,252,245,0.085)" : "rgba(18,17,15,0.105)";
          g.beginPath();
          g.arc(x, y, r, 0, TAU);
          g.fill();
        }
        g.strokeStyle = "rgba(30,28,25,0.12)";
        g.lineWidth = 0.9;
        for (var j = 0; j < 26; j++) {
          var lx = hash(j * 17.1) * 80;
          var ly = hash(j * 29.3) * 80;
          var la = hash(j * 7.9) * TAU;
          g.beginPath();
          g.moveTo(lx, ly);
          g.lineTo(lx + Math.cos(la) * 11, ly + Math.sin(la) * 11);
          g.stroke();
        }
        _cardPatterns[key] = ctx.createPattern(c, "repeat");
      }
    } catch (e) {
      return key;
    }
    return _cardPatterns[key] || key;
  }

  function drawPaperGrainOverlay(ctx, W, H, alpha, opts) {
    var w = W || DEFAULT_W;
    var h = H || DEFAULT_H;
    var a = (typeof alpha === "number") ? clamp(alpha, 0, 1) : 0.75;
    var cfg = opts || {};

    var pat = getPaperPattern(ctx);
    ctx.save();
    if (pat) {
      ctx.globalAlpha = a;
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, w, h);
    }
    if (cfg.vignette !== false) {
      var vig = ctx.createRadialGradient(w * 0.5, h * 0.48, w * 0.28, w * 0.5, h * 0.48, w * 0.66);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(18,15,11," + (0.18 * a).toFixed(3) + ")");
      ctx.globalAlpha = 1;
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  // ---------- BOLAS Rostrum Craft Primitives ----------

  function normalizePts(pts) {
    var out = [];
    if (!pts || !pts.length) return out;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (Array.isArray(p)) out.push({ x: p[0], y: p[1] });
      else if (p && typeof p === "object") out.push({ x: p.x || 0, y: p.y || 0 });
    }
    return out;
  }

  function tracePolygon(ctx, pts) {
    ctx.beginPath();
    for (var i = 0; i < pts.length; i++) {
      if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
      else ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
  }

  // Build scissor-cut polygon in destination world coords around (dx, dy, dw, dh)
  function buildScissorDestPolygon(dx, dy, dw, dh, polygonPts, seed) {
    var raw = normalizePts(polygonPts);
    if (raw.length >= 3) {
      // Detect normalized [0..1] vs local [0..dw] vs world [dx..dx+dw]
      var isNorm = true;
      var maxX = -1e9, minX = 1e9, maxY = -1e9, minY = 1e9;
      for (var i = 0; i < raw.length; i++) {
        if (raw[i].x < -0.35 || raw[i].x > 1.35 || raw[i].y < -0.35 || raw[i].y > 1.35) {
          isNorm = false;
        }
        if (raw[i].x > maxX) maxX = raw[i].x;
        if (raw[i].x < minX) minX = raw[i].x;
        if (raw[i].y > maxY) maxY = raw[i].y;
        if (raw[i].y < minY) minY = raw[i].y;
      }
      if (isNorm) {
        return raw.map(function (p) {
          return { x: dx + p.x * dw, y: dy + p.y * dh };
        });
      }
      // Check if local pixel offsets (0..dw, 0..dh) when dx/dy are far from 0
      if ((Math.abs(dx) > 40 || Math.abs(dy) > 40) && minX >= -25 && maxX <= dw + 25 && minY >= -25 && maxY <= dh + 25) {
        return raw.map(function (p) {
          return { x: dx + p.x, y: dy + p.y };
        });
      }
      return raw;
    }

    // Default: organic 16-point hand-scissored paper crop polygon
    var autoPts = [];
    var s = seed || (dx * 0.13 + dy * 0.29 + dw * 0.07);
    var edges = [
      [0.05, 0.04], [0.28, 0.02], [0.54, 0.03], [0.80, 0.02], [0.96, 0.05],
      [0.98, 0.28], [0.97, 0.56], [0.98, 0.82],
      [0.95, 0.96], [0.72, 0.98], [0.46, 0.97], [0.20, 0.98], [0.04, 0.95],
      [0.02, 0.74], [0.03, 0.46], [0.02, 0.22]
    ];
    for (var k = 0; k < edges.length; k++) {
      var jx = (hash(s + k * 3.1) - 0.5) * 0.035;
      var jy = (hash(s + k * 7.7) - 0.5) * 0.035;
      autoPts.push({
        x: dx + clamp(edges[k][0] + jx, 0.01, 0.99) * dw,
        y: dy + clamp(edges[k][1] + jy, 0.01, 0.99) * dh
      });
    }
    return autoPts;
  }

  function cssFilterForMode(filterOpt) {
    if (!filterOpt || filterOpt === "none") return "none";
    if (filterOpt === "mono" || filterOpt === "bw") return "grayscale(1) contrast(1.18) brightness(1.02)";
    if (filterOpt === "sepia") return "grayscale(1) sepia(0.52) contrast(1.14)";
    if (filterOpt === "litho") return "grayscale(1) contrast(2.35) brightness(1.08)";
    if (filterOpt === "cyan") return "grayscale(1) sepia(0.68) hue-rotate(155deg) saturate(1.25) contrast(1.1)";
    return String(filterOpt);
  }

  /* drawScissorCutout supports BOTH:
   *   Full 12-arg:  (ctx, img, sx, sy, sw, sh, dx, dy, dw, dh, polygonPts, opts)
   *   Short 8-arg:  (ctx, img, dx, dy, dw, dh, polygonPts, opts)
   */
  function drawScissorCutout(ctx, img, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    var sx, sy, sw, sh, dx, dy, dw, dh, polygonPts, cfg;
    var hasValidImg = !!(img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);

    if (typeof a6 === "number" && typeof a9 === "number") {
      sx = a2; sy = a3; sw = a4; sh = a5;
      dx = a6; dy = a7; dw = a8; dh = a9;
      polygonPts = a10;
      cfg = a11 || {};
    } else {
      sx = 0;
      sy = 0;
      sw = hasValidImg ? img.naturalWidth : 512;
      sh = hasValidImg ? img.naturalHeight : 512;
      dx = a2 || 0;
      dy = a3 || 0;
      dw = a4 || 200;
      dh = a5 || 200;
      polygonPts = a6;
      cfg = a7 || {};
    }

    var poly = buildScissorDestPolygon(dx, dy, dw, dh, polygonPts, cfg.seed || (sx + sy + dw));
    var haloW = (typeof cfg.haloWidth === "number") ? cfg.haloWidth : 4.5;
    var haloCol = cfg.haloColor || "#fbfaf5";

    ctx.save();
    if (cfg.rot) {
      var rcx = cfg.pivotX != null ? cfg.pivotX : (dx + dw * 0.5);
      var rcy = cfg.pivotY != null ? cfg.pivotY : (dy + dh * 0.5);
      ctx.translate(rcx, rcy);
      ctx.rotate(cfg.rot);
      ctx.translate(-rcx, -rcy);
    }
    if (typeof cfg.alpha === "number") ctx.globalAlpha = clamp(cfg.alpha, 0, 1);

    // 1. Rostrum table contact shadow
    if (cfg.shadow !== false) {
      ctx.save();
      ctx.translate(cfg.shadowX != null ? cfg.shadowX : 4, cfg.shadowY != null ? cfg.shadowY : 6);
      tracePolygon(ctx, poly);
      ctx.fillStyle = cfg.shadowColor || "rgba(12, 10, 8, 0.34)";
      ctx.fill();
      ctx.restore();
    }

    // 2. Crisp white/cream scissor-cut paper halo + hairline cut edge
    if (haloW > 0) {
      ctx.save();
      ctx.lineJoin = "round";
      tracePolygon(ctx, poly);
      ctx.strokeStyle = "rgba(18, 15, 11, 0.28)";
      ctx.lineWidth = haloW * 2 + 1.6;
      ctx.stroke();

      tracePolygon(ctx, poly);
      ctx.strokeStyle = haloCol;
      ctx.lineWidth = haloW * 2;
      ctx.stroke();

      ctx.fillStyle = haloCol;
      ctx.fill();
      ctx.restore();
    }

    // 3. Clipped Real Bitmap Plate Crop (or tactile cardboard stand-in before decode)
    ctx.save();
    tracePolygon(ctx, poly);
    ctx.clip();

    if (hasValidImg) {
      var iw = img.naturalWidth;
      var ih = img.naturalHeight;
      var csx = clamp(sx, 0, iw - 2);
      var csy = clamp(sy, 0, ih - 2);
      var csw = clamp(sw, 2, iw - csx);
      var csh = clamp(sh, 2, ih - csy);

      var flt = cssFilterForMode(cfg.filter);
      if (flt !== "none" && "filter" in ctx) {
        try { ctx.filter = flt; } catch (e) {}
      }
      ctx.drawImage(img, csx, csy, csw, csh, dx, dy, dw, dh);
      if ("filter" in ctx) {
        try { ctx.filter = "none"; } catch (e) {}
      }
    } else {
      // Tactile mottled cardboard + engraving hatch fallback if plate still decoding
      ctx.fillStyle = getCardboardPattern(ctx, cfg.fallbackColor || "#7d7b76");
      ctx.fillRect(dx, dy, dw, dh);
      drawEngravingCrosshatch(ctx, dw, dh, 0.16, 7, { x: dx, y: dy });
    }

    if (cfg.tint) {
      ctx.fillStyle = cfg.tint;
      ctx.fillRect(dx, dy, dw, dh);
    }

    var pPat = getPaperPattern(ctx);
    if (pPat && cfg.grain !== false) {
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = pPat;
      ctx.fillRect(dx, dy, dw, dh);
    }
    ctx.restore();

    // Optional inner ink outline
    if (cfg.stroke) {
      tracePolygon(ctx, poly);
      ctx.strokeStyle = cfg.stroke === true ? "#14110d" : cfg.stroke;
      ctx.lineWidth = cfg.lineWidth || 1.8;
      ctx.stroke();
    }

    // Optional split-pin brad at pivot
    if (cfg.pin) {
      drawSplitPin(ctx, cfg.pin.x, cfg.pin.y, cfg.pin.r || 4.8, cfg.pin);
    }

    ctx.restore();
  }

  // Ragged torn-deckle paper architectural flat (like SERVICE door & floor in exercices-de-style.webp!)
  function drawTornPaperFlat(ctx, x, y, w, h, opts) {
    var cfg = opts || {};
    var deckle = (typeof cfg.deckle === "number") ? cfg.deckle : 7.5;
    var seed = cfg.seed != null ? cfg.seed : (x * 0.31 + y * 0.17 + w * 0.09);
    var paperCol = cfg.paperColor || "#f0eadc";
    var fillCol = cfg.fill || "#263a19";

    function buildRaggedRect(rx, ry, rw, rh, amp, sOff) {
      var pts = [];
      var nTop = Math.max(6, Math.round(rw / 18));
      var nSide = Math.max(6, Math.round(rh / 18));
      var i;
      for (i = 0; i <= nTop; i++) {
        pts.push({ x: rx + (i / nTop) * rw, y: ry + (hash(sOff + i * 2.3) - 0.5) * amp });
      }
      for (i = 1; i <= nSide; i++) {
        pts.push({ x: rx + rw + (hash(sOff + 100 + i * 2.9) - 0.5) * amp, y: ry + (i / nSide) * rh });
      }
      for (i = nTop - 1; i >= 0; i--) {
        pts.push({ x: rx + (i / nTop) * rw, y: ry + rh + (hash(sOff + 200 + i * 3.7) - 0.5) * amp });
      }
      for (i = nSide - 1; i >= 1; i--) {
        pts.push({ x: rx + (hash(sOff + 300 + i * 4.1) - 0.5) * amp, y: ry + (i / nSide) * rh });
      }
      return pts;
    }

    var outerPts = buildRaggedRect(x - deckle, y - deckle, w + deckle * 2, h + deckle * 2, deckle * 0.9, seed);
    var innerPts = buildRaggedRect(x, y, w, h, Math.max(2.5, deckle * 0.55), seed + 55.5);

    ctx.save();
    if (cfg.rot) {
      var cx = x + w * 0.5, cy = y + h * 0.5;
      ctx.translate(cx, cy);
      ctx.rotate(cfg.rot);
      ctx.translate(-cx, -cy);
    }

    // Drop shadow
    if (cfg.shadow !== false) {
      ctx.save();
      ctx.translate(3.5, 5.0);
      tracePolygon(ctx, outerPts);
      ctx.fillStyle = "rgba(15, 12, 9, 0.26)";
      ctx.fill();
      ctx.restore();
    }

    // Torn cream paper backing
    if (deckle > 0) {
      tracePolygon(ctx, outerPts);
      ctx.fillStyle = paperCol;
      ctx.fill();
      ctx.strokeStyle = "rgba(35, 29, 21, 0.22)";
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }

    // Inner painted gouache surface + mottled texture
    tracePolygon(ctx, innerPts);
    ctx.fillStyle = getCardboardPattern(ctx, fillCol);
    ctx.fill();

    if (cfg.stroke) {
      ctx.strokeStyle = cfg.stroke;
      ctx.lineWidth = cfg.lineWidth || 1.6;
      ctx.stroke();
    }

    ctx.restore();
  }

  // Glinting metallic brass/silver split-pin paper fastener (la-mort-en-ce-jardin.webp!)
  function drawSplitPin(ctx, x, y, r, opts) {
    var rad = (typeof r === "number" && r > 0) ? r : 4.8;
    var cfg = opts || {};
    var metal = cfg.metal || "silver"; // "silver" | "brass"

    ctx.save();
    ctx.translate(x, y);

    // Pin indentation shadow on cardboard
    ctx.fillStyle = "rgba(10, 10, 10, 0.45)";
    ctx.beginPath();
    ctx.arc(0.9, 1.3, rad + 0.8, 0, TAU);
    ctx.fill();

    var g = ctx.createRadialGradient(-rad * 0.35, -rad * 0.35, 0.5, 0, 0, rad);
    if (metal === "brass") {
      g.addColorStop(0.0, "#fff2bd");
      g.addColorStop(0.55, "#d8a242");
      g.addColorStop(1.0, "#6e4b14");
    } else {
      g.addColorStop(0.0, "#ffffff");
      g.addColorStop(0.55, "#c5c7ca");
      g.addColorStop(1.0, "#5c5f63");
    }
    ctx.fillStyle = g;
    ctx.strokeStyle = "#181818";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Subtle split-pin crease
    ctx.strokeStyle = "rgba(25, 25, 25, 0.55)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(-rad * 0.55, -rad * 0.2);
    ctx.lineTo(rad * 0.55, rad * 0.2);
    ctx.stroke();

    ctx.restore();
  }

  // Mottled grey-cardboard jointed puppet piece with charcoal hatch & split-pins (la-mort-en-ce-jardin.webp!)
  function drawCardboardPuppetPiece(ctx, pts, opts) {
    var poly = normalizePts(pts);
    if (poly.length < 3) return;
    var cfg = opts || {};
    var tone = cfg.tone || cfg.fill || "#8e8d89"; // "#8e8d89" mid-grey, "#4e4d4b" dark card, "#b8b4ac" light card

    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // 1. Contact shadow between overlapping puppet limbs
    if (cfg.shadow !== false) {
      ctx.save();
      ctx.translate(cfg.shadowX != null ? cfg.shadowX : 3, cfg.shadowY != null ? cfg.shadowY : 4.5);
      tracePolygon(ctx, poly);
      ctx.fillStyle = "rgba(8, 8, 8, 0.36)";
      ctx.fill();
      ctx.restore();
    }

    // 2. Mottled cardboard pulp fill
    tracePolygon(ctx, poly);
    ctx.fillStyle = getCardboardPattern(ctx, tone);
    ctx.fill();

    // 3. Charcoal edge shading + optional rib/fold strokes inside clip
    if (cfg.charcoal !== false) {
      ctx.save();
      tracePolygon(ctx, poly);
      ctx.clip();

      // Compute centroid & bounding box for automatic charcoal shading strokes
      var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
      for (var i = 0; i < poly.length; i++) {
        if (poly[i].x < minX) minX = poly[i].x;
        if (poly[i].x > maxX) maxX = poly[i].x;
        if (poly[i].y < minY) minY = poly[i].y;
        if (poly[i].y > maxY) maxY = poly[i].y;
      }
      ctx.strokeStyle = "rgba(24, 23, 21, 0.22)";
      ctx.lineWidth = 3.2;
      var spanY = maxY - minY;
      var ribs = cfg.ribs != null ? cfg.ribs : (spanY > 45 ? 3 : 1);
      for (var r = 1; r <= ribs; r++) {
        var ry = lerp(minY, maxY, r / (ribs + 1));
        ctx.beginPath();
        ctx.moveTo(lerp(minX, maxX, 0.18), ry - 3);
        ctx.quadraticCurveTo(lerp(minX, maxX, 0.5), ry + 3, lerp(minX, maxX, 0.72), ry - 1);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Hand-pencilled graphite contour
    tracePolygon(ctx, poly);
    ctx.strokeStyle = cfg.stroke || "#1a1918";
    ctx.lineWidth = cfg.lineWidth || 2.0;
    ctx.stroke();

    // 5. Optional split-pin brads
    if (cfg.pin) {
      drawSplitPin(ctx, cfg.pin.x, cfg.pin.y, cfg.pin.r || 4.6, cfg.pin);
    }
    if (Array.isArray(cfg.pins)) {
      for (var pi = 0; pi < cfg.pins.length; pi++) {
        var pn = cfg.pins[pi];
        drawSplitPin(ctx, pn.x != null ? pn.x : pn[0], pn.y != null ? pn.y : pn[1], pn.r || 4.6, pn);
      }
    }

    ctx.restore();
  }

  // ---------- Camera Push-Through & Multiplane Parallax ----------
  var _camStack = [];

  function extractStateFromOpts(opts) {
    if (!opts || typeof opts !== "object") return null;
    if (opts.state && typeof opts.state === "object") return opts.state;
    if (
      "showCaptions" in opts ||
      "view" in opts ||
      "lamp" in opts ||
      "ballast" in opts ||
      "snailActive" in opts ||
      "roll" in opts
    ) {
      return opts;
    }
    return null;
  }

  function beginCamera(ctx, W, H, rawT, opts) {
    var w = W || DEFAULT_W;
    var h = H || DEFAULT_H;
    var t = normalizeTime(rawT);
    var cfg = (opts && typeof opts === "object") ? opts : {};
    var st = extractStateFromOpts(cfg);
    var pushDur = (typeof cfg.pushDur === "number" && cfg.pushDur > 0) ? cfg.pushDur : 0.65;
    var lockedView = st && st.view && st.view !== "auto";
    var pushU = lockedView ? 1.0 : easeInOutCubic(clamp(t / pushDur, 0, 1));

    var ballastShiftY = (st && st.ballast) ? 11 : 0;
    var ballastRoll = (st && st.ballast) ? Math.sin(t * 1.2) * 0.008 : 0;

    var baseZoom = lerp(0.93, 1.0, pushU) * (typeof cfg.zoom === "number" ? cfg.zoom : 1.0);
    var driftX = Math.sin(t * 0.48) * 5.0 * pushU + (cfg.panX || 0);
    var driftY = Math.cos(t * 0.36) * 3.0 * pushU + ballastShiftY + (cfg.panY || 0);
    var rot = ballastRoll + (cfg.rot || 0);

    _camStack.push({
      W: w,
      H: h,
      t: t,
      opts: cfg,
      state: st,
      pushU: pushU
    });

    ctx.save();
    var cx = w * 0.5;
    var cy = h * 0.46;
    ctx.translate(cx + driftX, cy + driftY);
    if (rot) ctx.rotate(rot);
    ctx.scale(baseZoom, baseZoom);
    ctx.translate(-cx, -cy);
  }

  function drawPortholePushFrame(ctx, W, H, t, pushU, state, opts) {
    // Over 0.0\u20130.65s, pushes through the chipped brass bread-tin porthole into full-bleed
    // BOLAS rostrum cinema, leaving only subtle corner brass porthole rivets/rim arcs!
    var cx = W * 0.5;
    var cy = lerp(H * 0.46, H * 0.47, pushU);
    var rInner = lerp(276, 706, pushU);
    var rimWidth = lerp(52, 42, pushU);
    var rOuter = rInner + rimWidth;

    ctx.save();

    if (rInner < 742) {
      ctx.beginPath();
      ctx.rect(-4, -4, W + 8, H + 8);
      ctx.arc(cx, cy, rInner + rimWidth * 0.72, 0, TAU, true);
      ctx.fillStyle = "#181a1c";
      ctx.fill("evenodd");
    }

    if (pushU < 0.90) {
      // Left iron hinge & right brass dog-latch during opening push-through
      ctx.save();
      ctx.translate(cx - rOuter + 6, cy);
      ctx.fillStyle = "#484c4f";
      ctx.strokeStyle = "#141618";
      ctx.lineWidth = 2.4;
      roundedRectPath(ctx, -25, -50, 32, 100, 5);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(cx + rOuter - 10, cy + 6);
      ctx.fillStyle = COLORS.brass;
      ctx.strokeStyle = "#1b1408";
      ctx.lineWidth = 2.2;
      roundedRectPath(ctx, -11, -36, 22, 72, 7);
      ctx.fill();
      ctx.stroke();
      roundedRectPath(ctx, -22, -11, 42, 22, 5);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Subtle antique-brass porthole corner arcs & rivets
    var bGrad = ctx.createLinearGradient(cx - rOuter, cy - rOuter, cx + rOuter, cy + rOuter);
    bGrad.addColorStop(0.0, "#edd089");
    bGrad.addColorStop(0.35, "#c99842");
    bGrad.addColorStop(0.75, "#8f6420");
    bGrad.addColorStop(1.0, "#593c10");

    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, TAU, false);
    ctx.arc(cx, cy, rInner, 0, TAU, true);
    ctx.fillStyle = bGrad;
    ctx.fill("evenodd");

    ctx.strokeStyle = "#171410";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(cx, cy, rInner, 0, TAU);
    ctx.stroke();

    // 2-o'clock chipped rim notch
    var chipAng = -Math.PI / 6;
    var chX = cx + Math.cos(chipAng) * (rInner + 3);
    var chY = cy + Math.sin(chipAng) * (rInner + 3);
    ctx.save();
    ctx.translate(chX, chY);
    ctx.rotate(chipAng);
    ctx.fillStyle = "#241b0f";
    ctx.beginPath();
    ctx.moveTo(-5, -9);
    ctx.lineTo(8, -4);
    ctx.lineTo(6, 7);
    ctx.lineTo(-5, 9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Corner split-pin / hex rivets
    var boltAngles = [-Math.PI * 0.77, -Math.PI * 0.23, Math.PI * 0.23, Math.PI * 0.77];
    var rBolt = rInner + rimWidth * 0.46;
    for (var bi = 0; bi < boltAngles.length; bi++) {
      var bx = cx + Math.cos(boltAngles[bi]) * rBolt;
      var by = cy + Math.sin(boltAngles[bi]) * rBolt;
      if (bx < -20 || bx > W + 20 || by < -20 || by > H + 20) continue;
      drawSplitPin(ctx, bx, by, 7.2, { metal: "brass" });
    }

    if (state && typeof state.roll === "number" && state.roll >= 1 && state.roll <= 6) {
      var rFace = Math.round(state.roll);
      var rCol = rFace <= 2 ? COLORS.probable : (rFace <= 4 ? COLORS.plausible : COLORS.preposterous);
      drawDieBadge(ctx, 48, 44, rFace, t, rCol);
    }

    ctx.restore();
  }

  function endCamera(ctx) {
    ctx.restore();
    var info = _camStack.pop();
    if (!info) return;
    if (info.opts && info.opts.cornerBezel === false) return;
    drawPortholePushFrame(ctx, info.W, info.H, info.t, info.pushU, info.state, info.opts);
  }

  function parallaxX(depth, rawT, state) {
    var t = normalizeTime(rawT);
    var d = (typeof depth === "number" && isFinite(depth)) ? depth : 0.5;
    if (d > 1.5) d = Math.min(d * 0.25, 1.4);
    var beatInfo = resolveBeat(t, state);
    var beatPan = (beatInfo.index - 1.5) * 14 * d;
    var wave = Math.sin(t * 0.58 + d * 1.1) * 16 * d;
    return beatPan + wave;
  }

  function parallaxY(depth, rawT, state) {
    var t = normalizeTime(rawT);
    var d = (typeof depth === "number" && isFinite(depth)) ? depth : 0.5;
    if (d > 1.5) d = Math.min(d * 0.25, 1.4);
    var bal = (state && state.ballast) ? 13 * d : 0;
    return Math.cos(t * 0.46 + d * 0.8) * 6 * d + bal;
  }

  function drawDieBadge(ctx, x, y, roll, t, color) {
    var face = clamp(Math.round(roll || 1), 1, 6);
    var col = color || (face <= 2 ? COLORS.probable : (face <= 4 ? COLORS.plausible : COLORS.preposterous));
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(12, 12, 12, 0.36)";
    roundedRectPath(ctx, -18, -16, 38, 38, 6);
    ctx.fill();

    ctx.fillStyle = "#fbfaf7";
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.8;
    roundedRectPath(ctx, -19, -19, 38, 38, 6);
    ctx.fill();
    ctx.stroke();

    var pips = DIE_PIPS[face] || DIE_PIPS[1];
    ctx.fillStyle = col;
    for (var i = 0; i < pips.length; i++) {
      ctx.beginPath();
      ctx.arc(pips[i][0] * 18, pips[i][1] * 18, 3.4, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // ---------- 5 Authentic BOLAS Backdrops + Director Shaders ----------
  function resolvePalette(paletteOrId) {
    if (typeof paletteOrId === "number") {
      var st = getStack(paletteOrId);
      if (st && st.directorSwarm && st.directorSwarm.palette) return st.directorSwarm.palette;
    }
    var p = (paletteOrId && typeof paletteOrId === "object") ? paletteOrId : {};
    return {
      bgTop: p.bgTop || "#f7dd8c",
      bgBot: p.bgBot || "#dfc06c",
      ink: p.ink || "#14110d",
      accent: p.accent || "#d42a1e",
      glow: p.glow || "#fff6dc",
      paper: p.paper || "#fbfaf7"
    };
  }

  function drawBolasBackdrop(ctx, W, H, bolasStyle, palette, rawT, state, opts) {
    var w = W || DEFAULT_W;
    var h = H || DEFAULT_H;
    var t = normalizeTime(rawT);
    var pal = resolvePalette(palette);
    var key = String(bolasStyle || "queneau-rostrum").toLowerCase();
    var cfg = opts || {};
    var lampFactor = (state && state.lamp === false) ? 0.72 : 1.0;

    ctx.save();

    if (key.indexOf("queneau") >= 0 || key.indexOf("rostrum") >= 0) {
      // 1. Buttercream / Ochre Queneau Rostrum Stock (like exercices-de-style.webp!)
      var qg = ctx.createLinearGradient(0, 0, 0, h);
      qg.addColorStop(0.0, cfg.paperTop || "#fae194");
      qg.addColorStop(1.0, cfg.paperBot || "#eed07c");
      ctx.fillStyle = qg;
      ctx.fillRect(-20, -20, w + 40, h + 40);

      // Giant pale architectural watermark arcs (pure vector so blind mode emits 0 text!)
      ctx.save();
      ctx.fillStyle = "rgba(255, 252, 236, 0.44)";
      ctx.fillRect(108, -20, 82, 570);
      ctx.beginPath();
      ctx.arc(465, 365, 195, 0, TAU);
      ctx.arc(465, 365, 108, 0, TAU, true);
      ctx.fill("evenodd");
      ctx.fillRect(360, 335, 210, 56);
      ctx.restore();

      // Torn-deckle dark-green floor strip along bottom of rostrum stage
      if (cfg.floor !== false) {
        drawTornPaperFlat(ctx, -16, 548, w + 32, 96, {
          fill: cfg.floorColor || "#273b19",
          paperColor: "#f2ece0",
          deckle: 6,
          shadow: false,
          seed: 17.3
        });
        // Two thin torn-cream horizontal track stripes across the green floor (exact exercices-de-style motif!)
        drawTornPaperFlat(ctx, -12, 576, w + 24, 7, { fill: "#d8d4c2", deckle: 0, shadow: false, seed: 31.1 });
        drawTornPaperFlat(ctx, -12, 608, w + 24, 7, { fill: "#d8d4c2", deckle: 0, shadow: false, seed: 47.9 });
      }
    } else if (key.indexOf("cardboard") >= 0 || key.indexOf("mort") >= 0 || key.indexOf("parallax") >= 0) {
      // 2. Silver-Gelatin Monochrome Parallax Stage + Dark Side Mattes (like la-mort-en-ce-jardin.webp!)
      var mg = ctx.createLinearGradient(0, 0, 0, h);
      mg.addColorStop(0.0, "#46494c");
      mg.addColorStop(0.58, "#292b2d");
      mg.addColorStop(1.0, "#17181a");
      ctx.fillStyle = mg;
      ctx.fillRect(-20, -20, w + 40, h + 40);

      drawNorsteinFog(ctx, w, h, t, 0.18 * lampFactor, "228, 230, 228");

      // Authentic 4:3 / Academy side pillar mattes (#191a1c)
      if (cfg.pillarbox !== false) {
        ctx.fillStyle = "#191a1c";
        ctx.fillRect(-10, -10, 96, h + 20);
        ctx.fillRect(w - 86, -10, 96, h + 20);
      }
    } else if (key.indexOf("daumier") >= 0 || key.indexOf("litho") >= 0 || key.indexOf("boucle") >= 0) {
      // 3. Stark Cream-White Paper + Wide Ink-Black Cinema Band (like boucle-la.webp!)
      ctx.fillStyle = "#fbfaf7";
      ctx.fillRect(-20, -20, w + 40, h + 40);

      var bandTop = cfg.bandTop != null ? cfg.bandTop : 142;
      var bandBot = cfg.bandBot != null ? cfg.bandBot : 566;
      ctx.fillStyle = "#0b0c0e";
      ctx.fillRect(-20, bandTop, w + 40, bandBot - bandTop);
    } else if (key.indexOf("perec") >= 0 || key.indexOf("fugue") >= 0 || key.indexOf("stage") >= 0) {
      // 4. Carved Ochre Sandstone Masonry Proscenium + Tinted Archival Recess (like les-lieux-dune-fugue.webp!)
      var openX = cfg.openX != null ? cfg.openX : 190;
      var openY = cfg.openY != null ? cfg.openY : 112;
      var openW = cfg.openW != null ? cfg.openW : 490;
      var openH = cfg.openH != null ? cfg.openH : 526;

      // Cool cyanotype/slate archival recess behind doorway
      var rg = ctx.createLinearGradient(openX, openY, openX, openY + openH);
      rg.addColorStop(0.0, "#2f3840");
      rg.addColorStop(0.6, "#586670");
      rg.addColorStop(1.0, "#3a444c");
      ctx.fillStyle = rg;
      ctx.fillRect(-20, -20, w + 40, h + 40);

      // Carved ochre sandstone masonry wall surrounding the doorway aperture
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.rect(openX, openY, openW, openH);
      ctx.clip("evenodd");

      ctx.fillStyle = "#8c7248";
      ctx.fillRect(0, 0, w, h);

      // Relief stone block courses
      var rowH = 74;
      for (var row = 0; row * rowH < h + rowH; row++) {
        var ry = row * rowH;
        var stOff = (row % 2) * 115;
        for (var bx = -120 + stOff; bx < w + 120; bx += 230) {
          var shade = (hash(row * 13.1 + bx * 0.07) - 0.5) * 22;
          var rCol = clamp(Math.round(142 + shade), 95, 175);
          var gCol = clamp(Math.round(115 + shade * 0.8), 75, 145);
          var bCol = clamp(Math.round(72 + shade * 0.5), 45, 98);
          ctx.fillStyle = "rgb(" + rCol + "," + gCol + "," + bCol + ")";
          ctx.fillRect(bx + 3, ry + 3, 224, rowH - 6);
          ctx.strokeStyle = "rgba(255, 232, 185, 0.22)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx + 3.5, ry + 3.5, 223, rowH - 7);
          ctx.strokeStyle = "rgba(28, 21, 12, 0.48)";
          ctx.strokeRect(bx + 2, ry + 2, 226, rowH - 4);
        }
      }

      // Carved stone doorway jambs & lintel
      ctx.fillStyle = "#7d643d";
      ctx.strokeStyle = "#2b2012";
      ctx.lineWidth = 2.4;
      ctx.fillRect(openX - 42, openY - 42, openW + 84, 42);
      ctx.strokeRect(openX - 42, openY - 42, openW + 84, 42);
      ctx.fillRect(openX - 42, openY, 42, openH);
      ctx.strokeRect(openX - 42, openY, 42, openH);
      ctx.fillRect(openX + openW, openY, 42, openH);
      ctx.strokeRect(openX + openW, openY, 42, openH);
      ctx.restore();

      // Hinged dark paper double shutters opened inward at doorway edges
      if (cfg.doors !== false) {
        var openSwing = 0.72 + Math.sin(t * 0.45) * 0.04;
        var doorW = 86 * openSwing;
        ctx.fillStyle = "#1b1411";
        ctx.strokeStyle = "#0b0807";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(openX, openY);
        ctx.lineTo(openX + doorW, openY - 18);
        ctx.lineTo(openX + doorW, openY + openH + 10);
        ctx.lineTo(openX, openY + openH);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(openX + openW, openY);
        ctx.lineTo(openX + openW - doorW * 1.15, openY - 20);
        ctx.lineTo(openX + openW - doorW * 1.15, openY + openH + 12);
        ctx.lineTo(openX + openW, openY + openH);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (key.indexOf("duchamp") >= 0 || key.indexOf("optic") >= 0 || key.indexOf("whitney") >= 0 || key.indexOf("s06") >= 0) {
      // 5. Dark Engraved Workshop Slate (like anemic-cinema / chant-du-styrene!)
      var dg = ctx.createRadialGradient(w * 0.5, h * 0.45, 40, w * 0.5, h * 0.45, w * 0.65);
      dg.addColorStop(0.0, "#232830");
      dg.addColorStop(1.0, "#101216");
      ctx.fillStyle = dg;
      ctx.fillRect(-20, -20, w + 40, h + 40);

      // Subtle engraved concentric rostrum registration rings
      ctx.strokeStyle = "rgba(245, 240, 228, 0.08)";
      ctx.lineWidth = 1.2;
      for (var ri = 1; ri <= 4; ri++) {
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.44, ri * 105, 0, TAU);
        ctx.stroke();
      }
    } else {
      // Fallback director-palette paper/multiplane wash
      var bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0.0, pal.bgTop);
      bg.addColorStop(1.0, pal.bgBot);
      ctx.fillStyle = bg;
      ctx.fillRect(-20, -20, w + 40, h + 40);
    }

    drawPaperGrainOverlay(ctx, w, h, 0.72, { vignette: key.indexOf("daumier") < 0 });
    ctx.restore();
  }

  // Unified drawBackdrop: understands all 5 bolasStyle keys AND legacy director styles!
  function drawBackdrop(ctx, W, H, palette, style, rawT, state, opts) {
    var stKey = String(style || "").toLowerCase();
    if (
      stKey.indexOf("queneau") >= 0 ||
      stKey.indexOf("rostrum") >= 0 ||
      stKey.indexOf("cardboard") >= 0 ||
      stKey.indexOf("daumier") >= 0 ||
      stKey.indexOf("litho") >= 0 ||
      stKey.indexOf("perec") >= 0 ||
      stKey.indexOf("duchamp") >= 0 ||
      stKey.indexOf("optic") >= 0
    ) {
      drawBolasBackdrop(ctx, W, H, stKey, palette, rawT, state, opts);
      return;
    }
    // Map director lineage keywords cleanly onto matching BOLAS registers
    if (stKey.indexOf("ernst") >= 0 || stKey.indexOf("zeman") >= 0 || stKey.indexOf("s03") >= 0) {
      drawBolasBackdrop(ctx, W, H, "daumier-litho", palette, rawT, state, opts);
      return;
    }
    if (stKey.indexOf("norstein") >= 0 || stKey.indexOf("s05") >= 0 || stKey.indexOf("archive") >= 0) {
      drawBolasBackdrop(ctx, W, H, "cardboard-parallax", palette, rawT, state, opts);
      return;
    }
    if (stKey.indexOf("saloon") >= 0 || stKey.indexOf("melies") >= 0 || stKey.indexOf("s18") >= 0) {
      drawBolasBackdrop(ctx, W, H, "perec-stage", palette, rawT, state, opts);
      return;
    }
    if (stKey.indexOf("whitney") >= 0 || stKey.indexOf("s06") >= 0) {
      drawBolasBackdrop(ctx, W, H, "duchamp-optic", palette, rawT, state, opts);
      return;
    }
    drawBolasBackdrop(ctx, W, H, "queneau-rostrum", palette, rawT, state, opts);
  }

  function drawReinigerFiligreeHinge(ctx, x, y, r, opts) {
    var rad = (typeof r === "number" && r > 0) ? r : 7.0;
    var cfg = opts || {};
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = cfg.collar || "#121212";
    ctx.beginPath();
    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * TAU;
      var px = Math.cos(a) * rad * 1.12;
      var py = Math.sin(a) * rad * 1.12;
      ctx.moveTo(px + rad * 0.45, py);
      ctx.arc(px, py, rad * 0.45, 0, TAU);
    }
    ctx.fill();
    drawSplitPin(ctx, 0, 0, rad * 0.78, { metal: cfg.metal || "brass" });
    ctx.restore();
  }

  function drawEngravingCrosshatch(ctx, W, H, alpha, spacing, opts) {
    var w = W || DEFAULT_W;
    var h = H || DEFAULT_H;
    var a = (typeof alpha === "number") ? clamp(alpha, 0, 1) : 0.12;
    var sp = Math.max(4, (typeof spacing === "number") ? spacing : 8);
    var cfg = opts || {};
    var x0 = cfg.x || 0;
    var y0 = cfg.y || 0;

    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = cfg.color || "#0b0c0e";
    ctx.lineWidth = cfg.lineWidth || 1.0;

    ctx.beginPath();
    for (var y = y0; y <= y0 + h; y += sp) {
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + w, y + sp * 0.22);
    }
    ctx.stroke();

    ctx.globalAlpha = a * 0.55;
    ctx.beginPath();
    for (var d = -h; d <= w + h; d += sp * 1.6) {
      ctx.moveTo(x0 + d, y0);
      ctx.lineTo(x0 + d - h * 0.52, y0 + h);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawNorsteinFog(ctx, W, H, rawT, alpha, tint) {
    var w = W || DEFAULT_W;
    var h = H || DEFAULT_H;
    var t = normalizeTime(rawT);
    var a = (typeof alpha === "number") ? clamp(alpha, 0, 1) : 0.20;
    var rgb = tint || "226, 230, 228";

    ctx.save();
    var bands = [
      { y: h * 0.25, rx: w * 0.48, ry: 76, sp: 16, ph: 0.3 },
      { y: h * 0.48, rx: w * 0.56, ry: 92, sp: -22, ph: 1.9 },
      { y: h * 0.70, rx: w * 0.52, ry: 80, sp: 14, ph: 3.7 }
    ];
    for (var i = 0; i < bands.length; i++) {
      var b = bands[i];
      var cx = (w * 0.5) + Math.sin(t * 0.3 + b.ph) * 130 + (t * b.sp * 0.32);
      cx = ((cx % (w + 280)) + (w + 280)) % (w + 280) - 140;
      var fg = ctx.createRadialGradient(cx, b.y, 12, cx, b.y, b.rx);
      fg.addColorStop(0.0, "rgba(" + rgb + ", " + (a * 0.9).toFixed(3) + ")");
      fg.addColorStop(0.55, "rgba(" + rgb + ", " + (a * 0.4).toFixed(3) + ")");
      fg.addColorStop(1.0, "rgba(" + rgb + ", 0)");
      ctx.fillStyle = fg;
      ctx.save();
      ctx.translate(cx, b.y);
      ctx.scale(1, b.ry / b.rx);
      ctx.beginPath();
      ctx.arc(0, 0, b.rx, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawCutoutPaperEdge(ctx, pts, fill, stroke, opts) {
    var poly = normalizePts(pts);
    if (poly.length < 3) return;
    var cfg = opts || {};
    var paperRim = cfg.paperColor || "#fbfaf5";
    var rimWidth = (typeof cfg.paperRim === "number") ? cfg.paperRim : 4.5;

    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    if (cfg.shadow !== false) {
      ctx.save();
      ctx.translate(cfg.shadowX != null ? cfg.shadowX : 4, cfg.shadowY != null ? cfg.shadowY : 5.5);
      tracePolygon(ctx, poly);
      ctx.fillStyle = "rgba(12, 10, 8, 0.32)";
      ctx.fill();
      ctx.restore();
    }

    if (rimWidth > 0) {
      tracePolygon(ctx, poly);
      ctx.strokeStyle = "rgba(18, 15, 11, 0.25)";
      ctx.lineWidth = rimWidth * 2 + 1.4;
      ctx.stroke();

      tracePolygon(ctx, poly);
      ctx.strokeStyle = paperRim;
      ctx.lineWidth = rimWidth * 2;
      ctx.stroke();
    }

    tracePolygon(ctx, poly);
    if (fill) {
      ctx.fillStyle = getCardboardPattern(ctx, fill);
      ctx.fill();
    }
    if (stroke !== false) {
      ctx.strokeStyle = stroke || "#14110d";
      ctx.lineWidth = cfg.lineWidth || 2.0;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWaterCaustics(ctx, W, H, rawT, alpha, opts) {
    var w = W || DEFAULT_W;
    var h = H || DEFAULT_H;
    var t = normalizeTime(rawT);
    var a = (typeof alpha === "number") ? clamp(alpha, 0, 1) : 0.14;
    var cfg = opts || {};

    ctx.save();
    ctx.strokeStyle = cfg.color || "rgba(235, 244, 240, " + a.toFixed(3) + ")";
    ctx.lineCap = "round";
    for (var r = 0; r < 5; r++) {
      var baseY = 90 + r * 86;
      ctx.lineWidth = 2.0 - r * 0.2;
      ctx.beginPath();
      for (var x = -20; x <= w + 20; x += 34) {
        var wy = baseY + Math.sin(x * 0.011 + t * 1.4 + r * 1.3) * 11 + Math.cos(x * 0.022 - t * 0.9 + r) * 5;
        if (x === -20) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawLampBeam(ctx, W, H, rawT, state, opts) {
    var w = W || DEFAULT_W;
    var h = H || DEFAULT_H;
    var t = normalizeTime(rawT);
    if (state && state.lamp === false) return;
    var cfg = opts || {};
    var srcX = cfg.x != null ? cfg.x : w * 0.5;
    var srcY = cfg.y != null ? cfg.y : h - 40;
    var aimX = (cfg.aimX != null ? cfg.aimX : w * 0.5) + Math.sin(t * 0.7) * 24;
    var spread = cfg.spread || 300;
    var strength = cfg.alpha != null ? cfg.alpha : 0.18;

    ctx.save();
    var lg = ctx.createLinearGradient(srcX, srcY, aimX, 50);
    lg.addColorStop(0.0, "rgba(255, 224, 150, " + (strength * 1.2).toFixed(3) + ")");
    lg.addColorStop(0.5, "rgba(255, 220, 145, " + (strength * 0.55).toFixed(3) + ")");
    lg.addColorStop(1.0, "rgba(255, 220, 145, 0)");

    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(srcX - 42, srcY);
    ctx.lineTo(aimX - spread, 20);
    ctx.lineTo(aimX + spread, 20);
    ctx.lineTo(srcX + 42, srcY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Rostrum card / shutter transition at 4.0s, 8.0s, 12.0s!
  function drawCutShutter(ctx, W, H, rawT, state) {
    if (state && state.view && state.view !== "auto") return;
    var w = W || DEFAULT_W;
    var h = H || DEFAULT_H;
    var t = normalizeTime(rawT);
    var cuts = [4.0, 8.0, 12.0];
    var cutColors = [COLORS.probable, COLORS.plausible, COLORS.preposterous];

    for (var i = 0; i < cuts.length; i++) {
      var dt = Math.abs(t - cuts[i]);
      var halfWin = 0.14;
      if (dt < halfWin) {
        var u = 1 - dt / halfWin;
        var ease = u * u;
        ctx.save();
        var bladeH = h * 0.45 * ease;
        ctx.fillStyle = "#12100e";
        ctx.fillRect(0, 0, w, bladeH);
        ctx.fillRect(0, h - bladeH, w, bladeH);

        ctx.fillStyle = cutColors[i];
        ctx.fillRect(0, bladeH - 3, w, 3.5);
        ctx.fillRect(0, h - bladeH - 0.5, w, 3.5);

        ctx.fillStyle = "rgba(251, 250, 247, " + (0.24 * ease).toFixed(3) + ")";
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
        break;
      }
    }
  }

  // ---------- Kinematics ----------
  function solveIK2(x0, y0, l1, l2, tx, ty, bendDir) {
    var dx = tx - x0;
    var dy = ty - y0;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1e-6;
    var minD = Math.abs(l1 - l2) + 1e-4;
    var maxD = l1 + l2 - 1e-4;
    var d = clamp(dist, minD, maxD);

    var baseAng = Math.atan2(dy, dx);
    var cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
    var angOffset = Math.acos(cosA);
    var dir = (bendDir === -1 || bendDir === false) ? -1 : 1;

    var a1 = baseAng + dir * angOffset;
    var jx = x0 + Math.cos(a1) * l1;
    var jy = y0 + Math.sin(a1) * l1;
    var ex = x0 + (dx / dist) * d;
    var ey = y0 + (dy / dist) * d;
    var a2 = Math.atan2(ey - jy, ex - jx);

    return {
      x0: x0, y0: y0,
      jx: jx, jy: jy,
      ex: ex, ey: ey,
      x1: jx, y1: jy,
      x2: ex, y2: ey,
      elbowX: jx, elbowY: jy,
      endX: ex, endY: ey,
      a1: a1, a2: a2
    };
  }

  function spring(rawT, t0, freq, damp) {
    var dt = (rawT || 0) - (t0 || 0);
    if (dt <= 0) return 0;
    var w = (typeof freq === "number" && freq > 0) ? freq : 13.0;
    var d = (typeof damp === "number" && damp > 0) ? damp : 5.2;
    var decay = Math.exp(-d * dt);
    return 1 - decay * (Math.cos(w * dt) + (d / w) * Math.sin(w * dt));
  }

  function springImpulse(rawT, t0, freq, damp) {
    var dt = (rawT || 0) - (t0 || 0);
    if (dt <= 0) return 0;
    var w = (typeof freq === "number" && freq > 0) ? freq : 14.0;
    var d = (typeof damp === "number" && damp > 0) ? damp : 4.8;
    return Math.exp(-d * dt) * Math.sin(w * dt);
  }

  function wobble(rawT, freq, amp, phase) {
    var t = rawT || 0;
    var f = (typeof freq === "number") ? freq : 3.0;
    var a = (typeof amp === "number") ? amp : 1.0;
    var p = phase || 0;
    return Math.sin(t * f + p) * a + Math.sin(t * f * 1.618 + p * 1.7 + 0.8) * (a * 0.24);
  }

  // ---------- Canonical Handmade Split-Pin Cardboard & Cutout Couriers (0 Text!) ----------

  function renderTurkeyActor(ctx, x, y, scale, t, opts) {
    var cfg = opts || {};
    var sc = scale || 1.0;
    var flip = cfg.flip ? -1 : 1;
    var bob = Math.sin((t || 0) * 2.5) * 2.0;
    var dispatch = clamp(cfg.dispatch || 0, 0, 1);

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(sc * flip, sc);
    if (typeof cfg.alpha === "number") ctx.globalAlpha = clamp(cfg.alpha, 0, 1);

    // Scissor-cut cream backing behind entire cardboard turkey puppet
    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.ellipse(-4, 10, 52, 48, 0, 0, TAU);
    ctx.fill();

    // Grey-kraft cardboard body piece
    drawCardboardPuppetPiece(
      ctx,
      [[-46, 44], [-42, 6], [-12, -4], [24, 12], [28, 46], [-18, 52]],
      { tone: "#7d583c", ribs: 3, shadow: true }
    );

    // Jointed neck & head cardboard piece + brass split-pin at neck!
    drawCardboardPuppetPiece(
      ctx,
      [[-20, 12], [-22, -22], [-2, -30], [18, -22], [18, 4], [2, 16]],
      { tone: "#b8967c", ribs: 1, pin: { x: -4, y: 10, r: 4.2, metal: "brass" } }
    );

    // Cut-paper crimson wattle & hooked kraft beak
    drawCutoutPaperEdge(ctx, [[12, -2], [22, 10], [14, 21], [7, 14]], "#b83326", "#14110d", { paperRim: 2, shadow: false });
    drawCutoutPaperEdge(ctx, [[14, -13], [38, -7], [35, 1], [14, -2]], "#d9a23d", "#14110d", { paperRim: 2, shadow: false });

    // Pencilled eye
    ctx.fillStyle = "#fbfaf5";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(2, -11, 6.5, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#14110d";
    ctx.beginPath();
    ctx.arc(3.5, -11, 2.8, 0, TAU);
    ctx.fill();

    // Articulated split-pin wing + optional wax-sealed postcard!
    var wingAng = -0.22 - dispatch * 0.55 + Math.sin((t || 0) * 3.8) * 0.07;
    ctx.save();
    ctx.translate(4, 22);
    ctx.rotate(wingAng);
    drawCardboardPuppetPiece(
      ctx,
      [[-6, -8], [34, -10], [44, 0], [32, 10], [-6, 8]],
      { tone: "#694830", ribs: 2, pin: { x: 0, y: 0, r: 4.2, metal: "silver" } }
    );
    if (dispatch > 0.08) {
      drawCutoutPaperEdge(ctx, [[34, -10], [60, -8], [58, 9], [32, 7]], "#fbfaf5", "#14110d", { paperRim: 2 });
      ctx.fillStyle = COLORS.stamp;
      ctx.beginPath();
      ctx.arc(46, 0, 3.5, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  }

  function drawTurkeyInCorner(ctx, a, b, c, d, e) {
    if (typeof a === "number" && typeof b === "number" && a >= 600 && b >= 360) {
      var H = b;
      var t = normalizeTime(c);
      var opts = d || {};
      var tx = opts.x != null ? opts.x : 114;
      var ty = opts.y != null ? opts.y : Math.min(H - 122, 520);
      renderTurkeyActor(ctx, tx, ty, opts.scale || 1.05, t, opts);
    } else {
      renderTurkeyActor(ctx, a || 114, b || 520, c || 1.05, normalizeTime(d), e || {});
    }
  }

  function drawTurkeyCutawayBadge(ctx, x, y, scale, rawT, opts) {
    var cx = (typeof x === "number") ? x : 122;
    var cy = (typeof y === "number") ? y : 510;
    var sc = (typeof scale === "number" && scale > 0) ? scale : 1.0;
    var t = normalizeTime(rawT);
    var cfg = opts || {};
    var rad = 60 * sc;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = "rgba(12, 10, 8, 0.34)";
    ctx.beginPath();
    ctx.arc(4, 5, rad + 6, 0, TAU);
    ctx.fill();

    // White scissor-cut paper circle halo
    ctx.fillStyle = "#fbfaf5";
    ctx.strokeStyle = "rgba(20,17,13,0.28)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, rad + 5, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, TAU);
    ctx.clip();
    ctx.fillStyle = "#3b2c1e";
    ctx.fillRect(-rad, -rad, rad * 2, rad * 2);
    renderTurkeyActor(ctx, -6 * sc, 10 * sc, 0.88 * sc, t, { dispatch: cfg.dispatch != null ? cfg.dispatch : 0.65 });
    ctx.restore();

    ctx.strokeStyle = COLORS.brassMid;
    ctx.lineWidth = 4 * sc;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function drawBrookTrout(ctx, x, y, scale, rawT, flip, opts) {
    var tx = (typeof x === "number") ? x : 960;
    var ty = (typeof y === "number") ? y : 340;
    var sc = (typeof scale === "number" && scale > 0) ? scale : 1.0;
    var t = normalizeTime(rawT);
    var cfg = (flip && typeof flip === "object") ? flip : (opts || {});
    var dir = (flip === true || flip === -1 || cfg.flip) ? -1 : 1;
    var tilt = cfg.tilt || Math.sin(t * 1.9) * 0.04;
    var wag = Math.sin(t * 5.8) * 0.17;

    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(tilt);
    ctx.scale(sc * dir, sc);

    // White scissor-cutout backing around body + tail
    ctx.save();
    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.ellipse(4, 0, 96, 33, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Articulated Tail Piece + Split-Pin at Peduncle!
    ctx.save();
    ctx.translate(66, 0);
    ctx.rotate(wag);
    drawCardboardPuppetPiece(
      ctx,
      [[-4, -7], [34, -24], [26, 0], [34, 24], [-4, 7]],
      { tone: "#6c7b67", ribs: 2, shadow: false }
    );
    ctx.restore();

    // Dorsal & Pectoral Paper Fins
    drawCutoutPaperEdge(ctx, [[-6, -20], [12, -37], [28, -20]], "#5f705c", "#14110d", { paperRim: 2, shadow: false });

    // Mottled Grey-Olive Cardboard Torso with Charcoal Hatch & Speckle Dots
    drawCardboardPuppetPiece(
      ctx,
      [[-76, -2], [-48, -25], [22, -24], [70, -7], [70, 7], [22, 23], [-44, 22], [-68, 8]],
      { tone: "#8f9c8a", ribs: 3, pin: { x: 66, y: 0, r: 3.8, metal: "silver" } }
    );

    // Hinged Pectoral Fin with Split-Pin
    ctx.save();
    ctx.translate(-32, 10);
    ctx.rotate(0.3 + Math.sin(t * 7.2) * 0.18);
    drawCardboardPuppetPiece(
      ctx,
      [[-3, -3], [19, 5], [16, 15], [-4, 6]],
      { tone: "#b87458", ribs: 1, shadow: false, pin: { x: 0, y: 0, r: 3.2, metal: "brass" } }
    );
    ctx.restore();

    // Hand-spotted Brook Trout Speckles
    var sp = [[-26, -8, "#d42a1e"], [-8, -10, "#f2cf70"], [10, -8, "#d42a1e"], [28, -6, "#f2cf70"], [-16, 1, "#222"], [4, 2, "#d42a1e"], [22, 1, "#222"]];
    for (var i = 0; i < sp.length; i++) {
      ctx.fillStyle = sp[i][2];
      ctx.beginPath();
      ctx.arc(sp[i][0], sp[i][1], 2.3, 0, TAU);
      ctx.fill();
    }

    // Eye & Gill Curve
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(-43, -1, 12, -0.8, 0.9);
    ctx.stroke();

    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.arc(-56, -6, 5.5, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#14110d";
    ctx.beginPath();
    ctx.arc(-57, -6, 2.7, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  function drawMailSnail(ctx, x, y, scale, rawT, opts) {
    var sx = (typeof x === "number") ? x : 560;
    var sy = (typeof y === "number") ? y : 460;
    var sc = (typeof scale === "number" && scale > 0) ? scale : 1.18;
    var t = normalizeTime(rawT);
    var cfg = opts || {};
    var rot = cfg.rot || 0;
    var flip = cfg.flip ? -1 : 1;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(rot);
    ctx.scale(sc * flip, sc);

    // Torn-paper slime ribbon wake
    if (cfg.trail !== false) {
      ctx.strokeStyle = "rgba(251, 250, 245, 0.65)";
      ctx.lineWidth = 5.5;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(-64, 11);
      ctx.lineTo(2, 11);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Stamped Cream Porthole Postcard Cutout (0 text!)
    if (cfg.postcard !== false) {
      ctx.save();
      ctx.translate(-14, -18 + Math.sin(t * 4.8) * 1.0);
      ctx.rotate(-0.16);
      drawCutoutPaperEdge(ctx, [[-16, -11], [16, -11], [16, 11], [-16, 11]], "#fbfaf5", "#14110d", { paperRim: 2.5 });
      ctx.strokeStyle = "rgba(20,17,13,0.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-14, -9); ctx.lineTo(0, 1); ctx.lineTo(14, -9);
      ctx.stroke();
      ctx.fillStyle = COLORS.probable;
      ctx.beginPath(); ctx.arc(0, 1.5, 3.5, 0, TAU); ctx.fill();
      if (cfg.hasReply) {
        ctx.strokeStyle = COLORS.plausible;
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(9, -4, 4.0, 0, TAU); ctx.stroke();
      }
      if (cfg.hasAlienStamp) {
        ctx.strokeStyle = COLORS.preposterous;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-9, -7.5); ctx.lineTo(-4.5, -0.5); ctx.lineTo(-13.5, -0.5);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();
    }

    // Cardboard Foot & Eyestalks
    drawCardboardPuppetPiece(
      ctx,
      [[-26, 11], [-10, 3], [14, 3], [26, 0], [27, 11], [-24, 12]],
      { tone: "#b2bfae", ribs: 1 }
    );

    for (var ei = -1; ei <= 1; ei += 2) {
      var ex = 21 + ei * 3 + Math.sin(t * 6 + ei) * 1.3;
      var ey = -11 + Math.cos(t * 5.4 + ei) * 1.4;
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(19 + ei, 1);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.fillStyle = "#fbfaf5";
      ctx.beginPath(); ctx.arc(ex, ey, 3.2, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#14110d";
      ctx.beginPath(); ctx.arc(ex + 0.7, ey, 1.4, 0, TAU); ctx.fill();
    }

    // Kraft-Gold Spiral Shell + Split-Pin Hub + Postal Cap
    ctx.save();
    ctx.translate(-5, -5 + Math.sin(t * 4.8) * 0.9);
    drawCutoutPaperEdge(
      ctx,
      [[-17, 2], [-13, -13], [2, -16], [16, -9], [17, 6], [5, 15], [-12, 13]],
      "#d99e3b",
      "#14110d",
      { paperRim: 3.0 }
    );
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    for (var si = 0; si <= 32; si++) {
      var sa = 0.4 + (si / 32) * Math.PI * 4.2;
      var sr = 1.5 + (si / 32) * 12.5;
      var px = Math.cos(sa) * sr, py = Math.sin(sa) * sr * 0.9;
      if (si === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    drawSplitPin(ctx, 0, 0, 3.4, { metal: "brass" });

    // Cut-paper Postal Cap
    drawCutoutPaperEdge(ctx, [[-9, -14], [-6, -24], [8, -22], [11, -14]], "#1d242b", "#14110d", { paperRim: 1.8, shadow: false });
    ctx.restore();

    ctx.restore();
  }

  function drawAlienSaucer(ctx, x, y, scale, rawT, beamX, beamY, opts) {
    var sx = (typeof x === "number") ? x : 640;
    var sy = (typeof y === "number") ? y : 122;
    var sc = (typeof scale === "number" && scale > 0) ? scale : 1.15;
    var t = normalizeTime(rawT);
    var cfg = opts || {};

    var hoverX = sx + Math.sin(t * 2.0) * 7;
    var hoverY = sy + Math.cos(t * 2.7) * 4;
    var bank = Math.sin(t * 2.2) * 0.05;
    var hasBeam = (beamX !== false && cfg.beam !== false);
    var tx = (typeof beamX === "number") ? beamX : (hoverX + Math.sin(t * 1.9) * 28);
    var ty = (typeof beamY === "number") ? beamY : 430;

    // 1. Cut-Paper / Optical Telemetry Cone & Concentric Measurement Rings
    if (hasBeam) {
      ctx.save();
      var spread = (cfg.beamSpread || 140) * sc;
      var bg = ctx.createLinearGradient(hoverX, hoverY + 16 * sc, tx, ty + 50);
      bg.addColorStop(0.0, "rgba(212, 42, 30, 0.24)");
      bg.addColorStop(0.5, "rgba(15, 143, 128, 0.18)");
      bg.addColorStop(1.0, "rgba(15, 143, 128, 0)");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(hoverX - 22 * sc, hoverY + 14 * sc);
      ctx.lineTo(tx - spread, ty + 40);
      ctx.lineTo(tx + spread, ty + 40);
      ctx.lineTo(hoverX + 22 * sc, hoverY + 14 * sc);
      ctx.closePath();
      ctx.fill();

      for (var ri = 0; ri < 3; ri++) {
        var ru = ((t * 0.52 + ri / 3) % 1);
        var rx = lerp(hoverX, tx, ru);
        var ry = lerp(hoverY + 36 * sc, ty + 14, ru);
        var radX = lerp(28 * sc, spread * 0.82, ru);
        var radY = radX * 0.25;
        var ra = Math.sin(ru * Math.PI) * 0.75;
        ctx.strokeStyle = (ri % 2 === 0)
          ? "rgba(15, 143, 128, " + ra.toFixed(3) + ")"
          : "rgba(212, 42, 30, " + ra.toFixed(3) + ")";
        ctx.lineWidth = 2.0;
        ctx.setLineDash([8, 5]);
        ctx.beginPath();
        ctx.ellipse(rx, ry, radX, radY, 0, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    }

    // 2. Handmade Cardboard & Brass Split-Pin Saucer Listening Pod
    ctx.save();
    ctx.translate(hoverX, hoverY);
    ctx.rotate(bank);
    ctx.scale(sc, sc);

    // White scissor-cutout paper halo around pod
    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.ellipse(0, -6, 63, 38, 0, 0, TAU);
    ctx.fill();

    // Tripod wire landing skids
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-26, 10); ctx.lineTo(-34, 22); ctx.lineTo(-21, 22);
    ctx.moveTo(26, 10);  ctx.lineTo(34, 22);  ctx.lineTo(21, 22);
    ctx.stroke();

    // Translucent paper dome
    ctx.fillStyle = "rgba(216, 240, 234, 0.65)";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, -4, 34, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3-Eyed Cut-Paper Alien Listener wearing Brass Headphones
    drawCardboardPuppetPiece(
      ctx,
      [[-15, -3], [-18, -22], [0, -28], [18, -22], [15, -3], [0, 3]],
      { tone: "#78ad83", ribs: 1, shadow: false }
    );
    ctx.strokeStyle = "#c98a2c";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, -14, 19, Math.PI * 1.08, -Math.PI * 0.08);
    ctx.stroke();

    var eyes = [[-8, -13, 3.8], [0, -18, 4.2], [8, -13, 3.8]];
    for (var ei = 0; ei < 3; ei++) {
      ctx.fillStyle = "#fbfaf5";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(eyes[ei][0], eyes[ei][1], eyes[ei][2], 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#14110d";
      ctx.beginPath();
      ctx.arc(eyes[ei][0], eyes[ei][1] + 0.6, 1.7, 0, TAU);
      ctx.fill();
    }

    // Riveted Cardboard & Brass Saucer Skirt with Split-Pin Brads!
    drawCardboardPuppetPiece(
      ctx,
      [[-56, 3], [-38, -5], [38, -5], [56, 3], [40, 14], [-40, 14]],
      {
        tone: "#b88a44",
        ribs: 1,
        pins: [[-34, 4], [-17, 6], [0, 6.5], [17, 6], [34, 4]]
      }
    );

    ctx.restore();
  }

  // ---------- Authentic BOLAS Screening Room 4-Box Contact Strip & Slate ----------
  function drawMiniBeatGlyph(ctx, x, y, w, h, idx, isActive) {
    // 100% vector miniature frame icon inside the 4-box contact strip (like exercices-de-style.webp!)
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    var bgs = ["#2a2d2f", "#d7e6ea", "#dceee9", "#201c22"];
    ctx.fillStyle = bgs[idx] || "#2a2d2f";
    ctx.fillRect(x, y, w, h);

    var cx = x + w * 0.5;
    var cy = y + h * 0.52;
    if (idx === 0) {
      // Beat I: Real Creek silhouette & lamp cone
      ctx.fillStyle = "rgba(247, 221, 140, 0.35)";
      ctx.beginPath();
      ctx.moveTo(cx, y + h); ctx.lineTo(cx - 18, y + 4); ctx.lineTo(cx + 18, y + 4);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fbfaf5";
      ctx.beginPath(); ctx.arc(cx, cy - 2, 10, 0, TAU); ctx.fill();
      ctx.fillStyle = "#14110d";
      ctx.beginPath(); ctx.arc(cx, cy - 2, 7.5, 0, TAU); ctx.fill();
    } else if (idx === 1) {
      // Beat II: Turkey + Snail Mail postcard
      ctx.fillStyle = COLORS.probable;
      ctx.fillRect(x, y + h - 10, w, 10);
      ctx.fillStyle = "#fbfaf5";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 1.4;
      ctx.fillRect(cx - 12, cy - 8, 24, 15);
      ctx.strokeRect(cx - 12, cy - 8, 24, 15);
      ctx.fillStyle = COLORS.stamp;
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, TAU); ctx.fill();
    } else if (idx === 2) {
      // Beat III: Brook Trout witness
      ctx.fillStyle = COLORS.plausible;
      ctx.fillRect(x, y + h - 10, w, 10);
      ctx.fillStyle = "#14110d";
      ctx.beginPath();
      ctx.ellipse(cx - 2, cy - 2, 14, 6, 0, 0, TAU);
      ctx.moveTo(cx + 10, cy - 2); ctx.lineTo(cx + 19, cy - 8); ctx.lineTo(cx + 19, cy + 4);
      ctx.fill();
    } else {
      // Beat IV: Alien Listening Post saucer & scan cone
      ctx.fillStyle = "rgba(212, 42, 30, 0.38)";
      ctx.beginPath();
      ctx.moveTo(cx, cy - 6); ctx.lineTo(cx - 18, y + h); ctx.lineTo(cx + 18, y + h);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fbfaf5";
      ctx.beginPath(); ctx.ellipse(cx, cy - 7, 15, 5, 0, 0, TAU); ctx.fill();
    }

    ctx.restore();

    ctx.strokeStyle = isActive ? COLORS.stamp : "#fbfaf5";
    ctx.lineWidth = isActive ? 3.2 : 1.5;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  function fmtSlateClock(sec) {
    var s = Math.max(0, Math.floor(sec));
    var frames = Math.floor(((sec - s) * 24) + 0.001) % 24;
    return pad2(s) + ":" + pad2(frames);
  }

  function drawBolasSlateAndStrip(ctx, W, H, rawT, state, id, opts) {
    // CRITICAL PAELEO INVARIANT: ZERO fillText/strokeText & ZERO HUD in blind critic mode!
    if (state && state.showCaptions === false) return;

    var w = W || DEFAULT_W;
    var h = H || DEFAULT_H;
    var pid = clamp(Math.round(id || 1), 1, 55);
    var cfg = opts || {};

    var beat = resolveBeat(rawT, state);
    var student = getStudentOptions(pid);
    var recipe = getRecipeBadge(pid);
    var phrases = [student.a, student.b, student.c, student.d];
    var activePhrase = phrases[beat.index] || student.a;

    var barH = RUBRIC_H; // 82px
    var barY = h - barH; // y = 638..720

    ctx.save();

    // 1. Miniature 4-Box Contact Filmstrip Tracker sitting just above the slate (x = 24..288, y = 584..634)
    if (cfg.filmstrip !== false) {
      var stripX = 24;
      var stripY = barY - 54;
      var cellW = 62;
      var cellH = 46;
      ctx.fillStyle = "rgba(20, 17, 13, 0.35)";
      ctx.fillRect(stripX - 2, stripY - 2, cellW * 4 + 10, cellH + 6);
      ctx.fillStyle = "#fbfaf5";
      ctx.fillRect(stripX - 3, stripY - 3, cellW * 4 + 9, cellH + 6);

      for (var ci = 0; ci < 4; ci++) {
        if (ci !== beat.index) {
          drawMiniBeatGlyph(ctx, stripX + ci * (cellW + 1), stripY, cellW, cellH, ci, false);
        }
      }
      // Draw active stamp-red frame LAST so its 3.2px #d42a1e border sits cleanly on top!
      drawMiniBeatGlyph(ctx, stripX + beat.index * (cellW + 1), stripY, cellW, cellH, beat.index, true);
    }

    // 2. BOLAS Screening Room Bottom Slate (y = 638..720)
    ctx.fillStyle = COLORS.paper;
    ctx.fillRect(0, barY, w, barH);
    ctx.fillStyle = COLORS.ink;
    ctx.fillRect(0, barY, w, 2.5);

    // Top row: Station + 4 (A)(B)(C)(D) Variation Pills + SCION Swarm Recipe
    var topY = barY + 8;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.font = '700 12.5px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = COLORS.ink;
    ctx.fillText(student.station, 22, topY + 12);

    var pillDefs = [
      { code: "(A)", name: "Real Creek", col: COLORS.real },
      { code: "(B)", name: "Probable \u00b7 Turkey", col: COLORS.probable },
      { code: "(C)", name: "Plausible \u00b7 Trout", col: COLORS.plausible },
      { code: "(D)", name: "Preposterous \u00b7 Alien", col: COLORS.preposterous }
    ];

    var px = 148;
    ctx.font = '600 11.5px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
    for (var i = 0; i < 4; i++) {
      var pd = pillDefs[i];
      var isAct = (i === beat.index);
      var txt = pd.code + " " + pd.name;
      var tw = ctx.measureText(txt).width;
      var pw = Math.ceil(tw + 16);

      roundedRectPath(ctx, px, topY + 1, pw, 22, 3);
      if (isAct) {
        ctx.fillStyle = pd.col;
        ctx.fill();
        ctx.fillStyle = "#ffffff";
      } else {
        ctx.fillStyle = COLORS.paper2;
        ctx.fill();
        ctx.strokeStyle = COLORS.rule;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = COLORS.inkSoft;
      }
      ctx.fillText(txt, px + 8, topY + 12.5);
      px += pw + 7;
    }

    ctx.textAlign = "right";
    ctx.font = '600 11px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = COLORS.mute;
    ctx.fillText(recipe, w - 22, topY + 12.5, Math.max(150, w - px - 24));

    // Main row: Stamp badge (A/B/C/D) + Bold Literary Student Reading + Right Timecode & Variation Tag
    var mainY = barY + 55;
    ctx.fillStyle = beat.color;
    roundedRectPath(ctx, 22, mainY - 13, 28, 26, 3);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = '800 14px "Big Shoulders Display", -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(beat.code, 36, mainY + 0.5);

    ctx.textAlign = "left";
    ctx.fillStyle = COLORS.ink;
    ctx.font = '600 22.5px "Literata", Georgia, "Iowan Old Style", serif';
    ctx.fillText(activePhrase, 60, mainY + 0.5, w - 340);

    // Right-hand exercices-de-style timecode + EXERCICE / VARIATION label
    ctx.textAlign = "right";
    ctx.fillStyle = COLORS.ink;
    ctx.font = '700 15px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText(fmtSlateClock(beat.t), w - 22, mainY - 6);

    var vVoice = beat.index === 0
      ? "VARIATION I \u00b7 REAL CREEK"
      : (beat.index === 1
        ? "VARIATION II \u00b7 TURKEY + SNAIL MAIL"
        : (beat.index === 2 ? "VARIATION III \u00b7 TROUT REPLY" : "VARIATION IV \u00b7 LISTENING POST"));
    ctx.fillStyle = beat.color;
    ctx.font = '600 10.5px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText(vVoice, w - 22, mainY + 10);

    // Bottom progress hairline across 16.0s
    ctx.fillStyle = COLORS.rule;
    ctx.fillRect(0, h - 3.5, w, 3.5);
    ctx.fillStyle = beat.color;
    var progU = (beat.view === "auto") ? clamp(beat.t / DURATION, 0, 1) : beat.u;
    ctx.fillRect(0, h - 3.5, w * progU, 3.5);

    ctx.restore();
  }

  // Alias drawRubricBar -> drawBolasSlateAndStrip so BOTH method names work identically!
  function drawRubricBar(ctx, W, H, rawT, state, id, opts) {
    drawBolasSlateAndStrip(ctx, W, H, rawT, state, id, opts);
  }

  var SCION_STAGE = {
    W: DEFAULT_W,
    H: DEFAULT_H,
    STAGE_H: STAGE_H,
    RUBRIC_Y: RUBRIC_Y,
    RUBRIC_H: RUBRIC_H,
    DURATION: DURATION,
    LOOP_DUR: LOOP_DUR,
    BEAT_DUR: BEAT_DUR,
    FPS: FPS,
    TOTAL_FRAMES: TOTAL_FRAMES,
    COLORS: COLORS,

    // Math & state helpers
    pad2: pad2,
    clamp: clamp,
    lerp: lerp,
    smooth: smooth,
    easeInOutCubic: easeInOutCubic,
    easeOutBack: easeOutBack,
    hash: hash,
    isBlind: isBlind,
    safeText: safeText,
    safeStrokeText: safeStrokeText,
    resolveBeat: resolveBeat,
    getBeat: resolveBeat,
    getStudentOptions: getStudentOptions,
    getStack: getStack,
    getRecipeBadge: getRecipeBadge,
    getBolasStyle: getBolasStyle,

    // Real Plate Preloading &BOLAS Cutout / Cardboard Primitives
    preloadPortalPlates: preloadPortalPlates,
    preloadAllPlates: preloadPortalPlates,
    getPortalPlates: getPortalPlates,
    drawScissorCutout: drawScissorCutout,
    drawTornPaperFlat: drawTornPaperFlat,
    drawCardboardPuppetPiece: drawCardboardPuppetPiece,
    drawSplitPin: drawSplitPin,
    drawPaperGrainOverlay: drawPaperGrainOverlay,
    drawBolasBackdrop: drawBolasBackdrop,
    drawBolasSlateAndStrip: drawBolasSlateAndStrip,

    // Camera & Parallax
    beginCamera: beginCamera,
    endCamera: endCamera,
    parallaxX: parallaxX,
    parallaxY: parallaxY,
    drawDieBadge: drawDieBadge,

    // Aesthetic Lineage Treatments
    drawBackdrop: drawBackdrop,
    drawReinigerFiligreeHinge: drawReinigerFiligreeHinge,
    drawEngravingCrosshatch: drawEngravingCrosshatch,
    drawNorsteinFog: drawNorsteinFog,
    drawCutoutPaperEdge: drawCutoutPaperEdge,
    drawWaterCaustics: drawWaterCaustics,
    drawLampBeam: drawLampBeam,
    drawCutShutter: drawCutShutter,

    // Kinematics
    solveIK2: solveIK2,
    spring: spring,
    springImpulse: springImpulse,
    wobble: wobble,

    // Canonical Couriers & Actors
    drawTurkeyInCorner: drawTurkeyInCorner,
    drawTurkeyCutawayBadge: drawTurkeyCutawayBadge,
    drawBrookTrout: drawBrookTrout,
    drawMailSnail: drawMailSnail,
    drawAlienSaucer: drawAlienSaucer,

    // Rubric Bar / BOLAS Slate (0 text in blind mode!)
    drawRubricBar: drawRubricBar
  };

  if (root) {
    root.SCION_STAGE = SCION_STAGE;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = SCION_STAGE;
  }
})(typeof window !== "undefined" ? window : globalThis);
