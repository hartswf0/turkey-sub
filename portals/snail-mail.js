/* ============================================================================
 * Trout Sub · Wave 3 Canonical 3-Pass Snail Mail & Alien Listening Post Layer
 * File: portals/snail-mail.js  (paired with ./alien-passes.js)
 *
 * Upgrades all 55 SCION Setup-A portals (window.PORTAL_SCENES[1..55]) to the
 * 13.0-second (312 frames @ 24fps) 3-Pass Snail Mail Chain across the glass:
 *
 *   - 0.0–1.6s : Setup-A Cockpit Action (Lamp Toggle / Ballast Slot)
 *   - 1.6–5.0s : FIRST PASS · PROBABLE (Faces 1–2 · Teal #1d596e)
 *                Turkey Looks Out -> slips postcard at 3.9s -> Mail Snail
 *                crosses glass 7:30 -> 3:50 at 4.3–5.2s!
 *   - 5.0–8.8s : SECOND PASS · PLAUSIBLE (Faces 3–4 · Green #2d6846)
 *                Trout Looks In (via Snail Mail) -> stamps green reply ->
 *                at 8.1–9.0s Mail Snail climbs right brass bezel to 12:00
 *                ("To the Alien Listening Post / Dear Alien")!
 *   - 8.8–13.0s: THIRD PASS · PREPOSTEROUS / OUT OF BOUNDS (Faces 5–6 · Rust #9e3d1c)
 *                Articulated 3-eyed Trout Town Alien Listener in miniature
 *                brass-and-glass Saucer Listening Pod peers in at upper rim,
 *                scanning the porthole object with violet-emerald telemetry
 *                beam + holographic measurement rings, pulsing 5-pip & 6-pip
 *                Preposterous rust bolts, and stamping a cosmic triangle
 *                postmark on Mail Snail's envelope!
 *
 * PAELEO BLIND-CRITIC INVARIANT:
 *   When state && state.showCaptions === false, draws ZERO text strings
 *   anywhere (0 fillText / strokeText calls across both origRender & overlay).
 * ============================================================================ */
(function () {
  "use strict";

  var TAU = Math.PI * 2;
  var CX = 640;
  var CY = 255;
  var R_GLASS = 185;
  var SPLIT_Y = 536;
  var LOOP_DUR = 13.0;

  // Canonical Tier Palette (Wave 3 Rubric)
  var COL_PROBABLE = "#1d596e";     // First Pass  · Faces 1-2 · Teal (Turkey)
  var COL_PLAUSIBLE = "#2d6846";    // Second Pass · Faces 3-4 · Green (Trout)
  var COL_PREPOSTEROUS = "#9e3d1c"; // Third Pass  · Faces 5-6 · Rust (Alien)

  // Built-in fallback copy of window.ALIEN_PASSES so script load order is 100% resilient
  var FALLBACK_ALIEN_PASSES = {
    1: "Emperor’s lost moon-boot or gravity-well foot?",
    2: "Warp-core turkey syringe or fish-piloted saucer?",
    3: "Galactic bounty board or alien spelling test?",
    4: "Armored starship key or time-lock guardian?",
    5: "Masked saucer polisher or hubcap space-bandit?",
    6: "Clone-scanning sheriff or comet-hook bounty hunter?",
    7: "Paper-mâché supernova bomb or candy mothership?",
    8: "Star-chart navigator titan or slime-trail wormhole?",
    9: "Asteroid mining rover or bargain-planet loot cage?",
    10: "Telepathic bivalve megaphone or singing asteroid jaw?",
    11: "Cryo-sleep fuel pod or spacewalk umbilical hose?",
    12: "Pocket-universe trapdoor or wormhole stage hatch?",
    13: "Stargate toll chime or meteor dinner gong?",
    14: "Solar-sail landing craft or Martian calendar leaf?",
    15: "Pixelated force-field grid or compound-eye holoscreen?",
    16: "Parallel-universe turkey clone or time-loop hull?",
    17: "Galactic Senate tribunal or planetary tax audit?",
    18: "TARDIS cargo trunk or trapped pocket constellation?",
    19: "Potato sputnik satellite or ten-antennaed brain?",
    20: "Prism warp-beam projector or crystal mothership?",
    21: "Hive-mind telepathy Titans or orbital transit hub?",
    22: "Zero-gravity boot-camp or mind-control aerobics?",
    23: "Tentacled doomsday clock or living time-machine dial?",
    24: "Snapped tractor-beam web or space-kraken dental floss?",
    25: "Reverse-ocean space helmet or gill-breather UFO?",
    26: "Subterranean magma thruster or baby star hatchery?",
    27: "Alpha-Centauri sponge ad or brainwashing ray-tube?",
    28: "Liquid-mercury nanobot swarm or living starlane?",
    29: "Ejected memory archive or time-traveler’s scrapbook?",
    30: "Floating plasma-orb cipher or planet self-destruct code?",
    31: "Re-entry heat-shield pan or crashed mothership mold?",
    32: "Robotic abduction claw or dimension-vault key?",
    33: "Saucer camera iris or shadow-dimension beasts?",
    34: "Steam-powered nebula organ or terraforming lung?",
    35: "Time-warped 1943 dead-letters or Sector 44 drop?",
    36: "Sirius Dog-Star courier or galactic treaty hound?",
    37: "Folded wormhole chart or First-Contact handshake?",
    38: "Leaked Roswell saucer blueprint or abduction map?",
    39: "Earthling zoo enclosure or 4th-dimension parlor?",
    40: "Black-box planet recorder or sugar-crystal city?",
    41: "Undercover Men-in-Black fish or stilt Martian?",
    42: "Twin portal gatekeepers or flatland overlords?",
    43: "Bio-engineered banana probe or yellow leviathan?",
    44: "Vortex mind-wiper disc or spinning wormhole iris?",
    45: "Matter-deconstructor funnel or atom-pellet replicator?",
    46: "Monumental Rosetta turkey cipher or anti-grav stairs?",
    47: "Hundred-dome colony fleet or bottled-air star-barge?",
    48: "Submerged deep-space spire or tin launch-nose?",
    49: "Intergalactic customs checkpoint or hover-lane cop?",
    50: "Supreme planetary guardian or force-field minnow?",
    51: "Incubating moon-egg core or clam fusion reactor?",
    52: "Orbital space-elevator cable or asteroid tether?",
    53: "Planetary rotation gearwheel or vault airlock dial?",
    54: "Ancient amphibious ambassador or ruffled star-emperor?",
    55: "54-timeline capsule log or Dear Alien reply?"
  };

  if (!window.ALIEN_PASSES) {
    window.ALIEN_PASSES = FALLBACK_ALIEN_PASSES;
  }

  function getAlienFork(id) {
    var map = window.ALIEN_PASSES || FALLBACK_ALIEN_PASSES;
    return map[id] || FALLBACK_ALIEN_PASSES[id] || "Cosmic starship artifact or pocket-wormhole decoy?";
  }

  // Key Porthole Coordinates
  var HATCH_X = 504;   // ~7:35 antique brass mail-hatch (Turkey side)
  var HATCH_Y = 382;
  var HATCH_ANG = 0.68;

  var PERCH_X = 794;   // ~3:50 right inner bezel perch (Trout side)
  var PERCH_Y = 334;

  // Lower-glass crossing Bezier control points (7:30 -> 3:50)
  var ARC_C1X = 578;
  var ARC_C1Y = 388;
  var ARC_C2X = 716;
  var ARC_C2Y = 376;

  // Right-rim upward climb arc (3:50 -> 12:35 Alien Listening Post dock)
  var CLIMB_R = 179;
  var CLIMB_ANG_START = Math.atan2(PERCH_Y - CY, PERCH_X - CX); // ~ +0.452 rad
  var CLIMB_ANG_END = -1.16;                                    // ~ 12:35 upper rim (x≈711, y≈91)
  var ALIEN_POD_X = 608;
  var ALIEN_POD_Y = 110;

  // 6 Porthole Bolt Angles (12:00=#1, 2:00=#2, 4:00=#3, 6:00=#4, 8:00=#5, 10:00=#6)
  var BOLT_ANGLES = [
    -Math.PI / 2,
    -Math.PI / 6,
    Math.PI / 6,
    Math.PI / 2,
    (5 * Math.PI) / 6,
    (7 * Math.PI) / 6
  ];

  var DEFAULT_ROLLS = {
    1: 5, 2: 6, 3: 5, 4: 3, 5: 6,
    6: 4, 7: 2, 8: 6, 9: 5, 10: 4,
    11: 2, 12: 5, 13: 6, 14: 2, 15: 4,
    16: 5, 17: 6, 18: 2, 19: 4, 20: 5,
    21: 6, 22: 4, 23: 6, 24: 2, 25: 5,
    26: 2, 27: 4, 28: 5, 29: 4, 30: 6,
    31: 5, 32: 4, 33: 6, 34: 2, 35: 5,
    36: 6, 37: 2, 38: 5, 39: 6, 40: 6,
    41: 5, 42: 6, 43: 2, 44: 5, 45: 6,
    46: 2, 47: 5, 48: 6, 49: 4, 50: 6,
    51: 5, 52: 4, 53: 6, 54: 5, 55: 6
  };

  // Pure non-text 1..6 die-pip dot coordinates
  var DIE_PIPS = {
    1: [[0, 0]],
    2: [[-0.46, -0.46], [0.46, 0.46]],
    3: [[-0.50, -0.50], [0, 0], [0.50, 0.50]],
    4: [[-0.46, -0.46], [0.46, -0.46], [-0.46, 0.46], [0.46, 0.46]],
    5: [[-0.48, -0.48], [0.48, -0.48], [0, 0], [-0.48, 0.48], [0.48, 0.48]],
    6: [[-0.46, -0.52], [0.46, -0.52], [-0.46, 0], [0.46, 0], [-0.46, 0.52], [0.46, 0.52]]
  };

  function clamp(v, a, b) {
    return v < a ? a : (v > b ? b : v);
  }

  function lerp(a, b, u) {
    return a + (b - a) * u;
  }

  function smooth(a, b, x) {
    var u = clamp((x - a) / ((b - a) || 1e-6), 0, 1);
    return u * u * (3 - 2 * u);
  }

  function cubicPt(p0x, p0y, c1x, c1y, c2x, c2y, p1x, p1y, u) {
    var inv = 1 - u;
    var b0 = inv * inv * inv;
    var b1 = 3 * inv * inv * u;
    var b2 = 3 * inv * u * u;
    var b3 = u * u * u;
    return {
      x: b0 * p0x + b1 * c1x + b2 * c2x + b3 * p1x,
      y: b0 * p0y + b1 * c1y + b2 * c2y + b3 * p1y
    };
  }

  function cubicTan(p0x, p0y, c1x, c1y, c2x, c2y, p1x, p1y, u) {
    var inv = 1 - u;
    var dx = 3 * inv * inv * (c1x - p0x) + 6 * inv * u * (c2x - c1x) + 3 * u * u * (p1x - c2x);
    var dy = 3 * inv * inv * (c1y - p0y) + 6 * inv * u * (c2y - c1y) + 3 * u * u * (p1y - c2y);
    return Math.atan2(dy, dx);
  }

  function climbPt(u) {
    var ang = lerp(CLIMB_ANG_START, CLIMB_ANG_END, u);
    var rad = CLIMB_R + Math.sin(u * Math.PI) * 5;
    return {
      x: CX + Math.cos(ang) * rad,
      y: CY + Math.sin(ang) * rad,
      ang: ang
    };
  }

  function roundedRectPath(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  // ---------- Remap 13.0s Outer Timeline -> Crew 10.0s Inner Timeline ----------
  function resolveTimelineMap(rawT, state, sceneId) {
    var t = (typeof rawT === "number" && isFinite(rawT)) ? rawT : 0;
    if (t < 0) t = 0;
    if (t > LOOP_DUR + 0.001) t = t % LOOP_DUR;

    var st = state || {};
    var id = sceneId || 1;
    var blindMode = (st.showCaptions === false);
    var view = (st.view === "turkey" || st.view === "trout" || st.view === "alien") ? st.view : "auto";

    var innerT = 0;
    var innerView = "auto";
    var passNum = 0; // 0=setup, 1=turkey(probable), 2=trout(plausible), 3=alien(preposterous)

    if (view === "turkey") {
      passNum = 1;
      innerView = "turkey";
      innerT = 2.35 + ((t * 0.85) % 2.85);
    } else if (view === "trout") {
      passNum = 2;
      innerView = "trout";
      innerT = 6.05 + ((t * 0.85) % 3.25);
    } else if (view === "alien") {
      passNum = 3;
      innerView = "auto";
      innerT = 6.45 + ((t * 0.78) % 2.95);
    } else {
      // Timed 13.0s 3-Pass Arc
      if (t < 1.6) {
        passNum = 0;
        innerT = lerp(0.0, 2.0, t / 1.6); // t=0.8s -> innerT=1.0s (exact switch operation!)
      } else if (t < 5.0) {
        passNum = 1;
        innerT = lerp(2.02, 5.56, (t - 1.6) / 3.4); // t=3.0s -> innerT=3.48s
      } else if (t < 8.8) {
        passNum = 2;
        innerT = lerp(5.64, 9.85, (t - 5.0) / 3.8); // t=6.8s -> innerT=7.63s, 8.6s -> 9.63s (full Act 3 rig action!)
      } else {
        passNum = 3;
        innerT = lerp(6.50, 9.55, (t - 8.8) / 4.2); // keeps water, kelp, prop & Brook Trout alive!
      }
    }

    var explicitRoll = (typeof st.roll === "number" && st.roll >= 1 && st.roll <= 6) ? Math.round(st.roll) : 0;
    var innerRoll = explicitRoll;
    if (!innerRoll) {
      if (passNum === 2) innerRoll = (id % 2 === 0) ? 4 : 3;
      else if (passNum === 3) innerRoll = (id % 2 === 0) ? 6 : 5;
    }

    var innerState = {
      lamp: st.lamp,
      ballast: st.ballast,
      view: innerView,
      roll: innerRoll,
      showCaptions: !blindMode
    };
    if (typeof st.lamp !== "boolean") delete innerState.lamp;
    if (typeof st.ballast !== "boolean") delete innerState.ballast;

    return {
      t: t,
      innerT: innerT,
      passNum: passNum,
      view: view,
      blindMode: blindMode,
      explicitRoll: explicitRoll,
      innerState: innerState
    };
  }

  // ---------- Resolve Complete Mail Snail + Alien Saucer Pose ----------
  function getCourierPose(rawT, state, scene) {
    var id = (scene && scene.id) ? scene.id : 1;
    var tm = resolveTimelineMap(rawT, state, id);
    var t = tm.t;
    var st = state || {};

    var roll = tm.explicitRoll;
    if (!roll && tm.view === "auto" && t >= 10.2) {
      roll = DEFAULT_ROLLS[id] || 5;
    }

    var x = HATCH_X;
    var y = HATCH_Y;
    var rot = 0.08;
    var crawlSpeed = 0;
    var lean = 0;
    var trail1U = 0;
    var trail1Alpha = 0;
    var trail2U = 0;
    var trail2Alpha = 0;
    var envTuck = 0;
    var wingSlip = 0;
    var hatchOpen = 0;
    var stampGlint = 0;
    var hasReply = false;      // Trout green postmark
    var hasAlienStamp = false; // Alien cosmic triangle postmark
    var alienDeploy = 0;       // 0..1 Alien Saucer Pod presence
    var alienScan = 0;         // 0..1 telemetry beam & holographic measurement rings
    var chartPulse = 0;
    var inTransit = false;
    var dispatchLabel = "";
    var phase = "perched-left";
    var progress = 0;

    var hasInteractiveTrip = !!(st.snailActive || typeof st.snailT === "number");
    var hasOverrideProgress = (typeof st.snailProgress === "number" && isFinite(st.snailProgress));

    if (hasInteractiveTrip) {
      // Interactive Video-to-Game 3-Stop Round-Trip: Turkey (7:30) -> Trout (3:50) -> Alien (12:30) -> Chart
      var stU = clamp(typeof st.snailT === "number" ? st.snailT : 0.5, 0, 1);
      progress = stU;
      inTransit = stU < 0.96;
      dispatchLabel = stU < 0.52 ? "SNAIL MAIL · TO TROUT" : "DEAR ALIEN · DISPATCH";

      if (stU < 0.10) {
        var u1 = stU / 0.10;
        phase = "dispatch-load";
        x = HATCH_X;
        y = HATCH_Y;
        rot = 0.06;
        wingSlip = Math.sin(u1 * Math.PI);
        hatchOpen = Math.sin(u1 * Math.PI);
        envTuck = smooth(0.1, 0.9, u1);
        lean = u1 * 0.5;
      } else if (stU < 0.46) {
        var u2 = smooth(0.10, 0.46, stU);
        phase = "crossing-trout";
        var pt2 = cubicPt(HATCH_X, HATCH_Y, ARC_C1X, ARC_C1Y, ARC_C2X, ARC_C2Y, PERCH_X, PERCH_Y, u2);
        x = pt2.x;
        y = pt2.y;
        rot = cubicTan(HATCH_X, HATCH_Y, ARC_C1X, ARC_C1Y, ARC_C2X, ARC_C2Y, PERCH_X, PERCH_Y, u2) * 0.68;
        crawlSpeed = 1.0;
        lean = 1.0;
        envTuck = 1.0;
        trail1U = u2;
        trail1Alpha = 0.95;
        stampGlint = clamp(1 - Math.abs(stU - 0.44) / 0.06, 0, 1);
        hasReply = stU >= 0.42;
      } else if (stU < 0.78) {
        var u3 = smooth(0.46, 0.78, stU);
        phase = "climbing-alien";
        var cp3 = climbPt(u3);
        x = cp3.x;
        y = cp3.y;
        rot = cp3.ang - Math.PI * 0.5;
        crawlSpeed = 1.0;
        lean = 1.0;
        envTuck = 1.0;
        hasReply = true;
        trail1U = 1.0;
        trail1Alpha = 0.75;
        trail2U = u3;
        trail2Alpha = 0.92;
        alienDeploy = smooth(0.15, 0.75, u3);
        alienScan = smooth(0.45, 1.0, u3);
        stampGlint = clamp(1 - Math.abs(stU - 0.76) / 0.06, 0, 1);
        hasAlienStamp = stU >= 0.74;
      } else {
        var u4 = smooth(0.78, 1.0, stU);
        phase = "alien-docked";
        var cp4 = climbPt(1.0);
        x = cp4.x;
        y = cp4.y;
        rot = -0.35;
        crawlSpeed = 0.2 * (1 - u4);
        lean = 0.25;
        envTuck = 1.0;
        hasReply = true;
        hasAlienStamp = true;
        trail1U = 1.0;
        trail1Alpha = 0.6;
        trail2U = 1.0;
        trail2Alpha = 0.85;
        alienDeploy = 1.0;
        alienScan = 1.0;
        chartPulse = Math.sin(u4 * Math.PI);
      }
    } else if (hasOverrideProgress) {
      var ov = clamp(st.snailProgress, 0, 1);
      progress = ov;
      var ptO = cubicPt(HATCH_X, HATCH_Y, ARC_C1X, ARC_C1Y, ARC_C2X, ARC_C2Y, PERCH_X, PERCH_Y, ov);
      x = ptO.x;
      y = ptO.y;
      rot = cubicTan(HATCH_X, HATCH_Y, ARC_C1X, ARC_C1Y, ARC_C2X, ARC_C2Y, PERCH_X, PERCH_Y, ov) * 0.65;
      crawlSpeed = (ov > 0.01 && ov < 0.99) ? 1.0 : 0;
      lean = crawlSpeed;
      envTuck = 1.0;
      trail1U = ov;
      trail1Alpha = 0.85;
      hasReply = ov >= 0.5;
    } else if (tm.view === "turkey") {
      phase = "perched-left";
      x = HATCH_X + Math.sin(t * 2.0) * 1.4;
      y = HATCH_Y + Math.cos(t * 2.4) * 1.1;
      rot = 0.08;
      envTuck = 1.0;
      lean = 0.15;
    } else if (tm.view === "trout") {
      phase = "parked-right";
      x = PERCH_X;
      y = PERCH_Y + Math.sin(t * 2.2) * 1.2;
      rot = -0.22;
      envTuck = 1.0;
      hasReply = true;
      trail1U = 1.0;
      trail1Alpha = 0.72;
    } else if (tm.view === "alien") {
      phase = "alien-docked";
      var cpA = climbPt(1.0);
      x = cpA.x;
      y = cpA.y + Math.sin(t * 2.5) * 1.5;
      rot = -0.32;
      envTuck = 1.0;
      hasReply = true;
      hasAlienStamp = true;
      trail1U = 1.0;
      trail1Alpha = 0.50;
      trail2U = 1.0;
      trail2Alpha = 0.82;
      alienDeploy = 1.0;
      alienScan = 1.0;
    } else {
      // Canonical 13.0s Timed Film Choreography:
      //   0.0 - 4.3s : Perched at 7:30 hatch; Turkey wing slips postcard at 3.85 - 4.30s
      //   4.3 - 5.2s : Crossing #1 across lower glass (t=4.8s mid-crossing!)
      //   5.2 - 8.1s : Parked at 3:50 beside Brook Trout (t=6.8s!)
      //   8.1 - 9.0s : Climb #2 up right brass bezel to 12:35 Alien Listening Post (t=8.6s mid-climb!)
      //   8.8 - 13.0s: Alien Listening Post saucer pod hovering & scanning (t=10.8s peak Alien scan!)
      if (t < 4.30) {
        phase = "perched-left";
        x = HATCH_X + Math.sin(t * 1.9) * 1.2;
        y = HATCH_Y + Math.cos(t * 2.3) * 1.0;
        rot = 0.08 + Math.sin(t * 1.6) * 0.03;
        if (t >= 3.82) {
          wingSlip = Math.sin(clamp((t - 3.82) / 0.48, 0, 1) * Math.PI);
          hatchOpen = Math.sin(clamp((t - 3.80) / 0.50, 0, 1) * Math.PI);
          envTuck = smooth(3.88, 4.24, t);
          lean = smooth(4.00, 4.30, t) * 0.6;
        }
      } else if (t < 5.20) {
        phase = "crossing-trout";
        inTransit = true;
        dispatchLabel = "SNAIL MAIL · TO TROUT";
        var rawC1 = clamp((t - 4.30) / 0.90, 0, 1);
        var uC1 = lerp(smooth(0, 1, rawC1), rawC1, 0.35);
        progress = uC1 * 0.5;
        var ptC1 = cubicPt(HATCH_X, HATCH_Y, ARC_C1X, ARC_C1Y, ARC_C2X, ARC_C2Y, PERCH_X, PERCH_Y, uC1);
        x = ptC1.x;
        y = ptC1.y;
        rot = cubicTan(HATCH_X, HATCH_Y, ARC_C1X, ARC_C1Y, ARC_C2X, ARC_C2Y, PERCH_X, PERCH_Y, uC1) * 0.68;
        crawlSpeed = 1.0;
        lean = 1.0;
        envTuck = 1.0;
        trail1U = uC1;
        trail1Alpha = 0.95;
        if (t >= 4.76 && t <= 5.18) {
          stampGlint = clamp(1 - Math.abs(t - 4.98) / 0.22, 0, 1);
        }
        hasReply = (t >= 5.0);
      } else if (t < 8.10) {
        phase = "parked-right";
        progress = 0.5;
        var settle2 = smooth(5.20, 5.75, t);
        var nod2 = Math.sin(clamp((t - 5.20) / 0.48, 0, 1) * Math.PI * 2) * 0.09 * (1 - settle2 * 0.5);
        x = PERCH_X;
        y = PERCH_Y + Math.sin(t * 2.2) * 1.1;
        rot = -0.22 + nod2;
        crawlSpeed = (1 - settle2) * 0.25;
        lean = lerp(0.45, 0.14, settle2);
        envTuck = 1.0;
        hasReply = true;
        trail1U = 1.0;
        trail1Alpha = lerp(0.92, 0.58, smooth(5.2, 8.0, t));
      } else if (t < 9.02) {
        phase = "climbing-alien";
        inTransit = true;
        dispatchLabel = "DEAR ALIEN · CLIMBING";
        var rawC2 = clamp((t - 8.10) / 0.92, 0, 1);
        var uC2 = lerp(smooth(0, 1, rawC2), rawC2, 0.35); // at t=8.6s -> uC2 ≈ 0.55 mid-climb up right bezel!
        progress = 0.5 + uC2 * 0.5;
        var cpC2 = climbPt(uC2);
        x = cpC2.x;
        y = cpC2.y;
        // Tangent for counter-clockwise climb along circle: ang - PI/2
        rot = lerp(-0.22, cpC2.ang - Math.PI * 0.5, smooth(0.0, 0.18, uC2));
        crawlSpeed = 1.0;
        lean = 1.0;
        envTuck = 1.0;
        hasReply = true;
        trail1U = 1.0;
        trail1Alpha = 0.54;
        trail2U = uC2;
        trail2Alpha = 0.95;

        // Alien Saucer Pod descends into upper porthole from t = 8.32s so it's visible during the 8.6s climb!
        alienDeploy = smooth(8.32, 8.98, t);
        alienScan = smooth(8.78, 9.25, t);
        if (t >= 8.85) {
          stampGlint = clamp(1 - Math.abs(t - 9.05) / 0.22, 0, 1);
        }
        hasAlienStamp = (t >= 8.98);
      } else {
        phase = "alien-docked";
        progress = 1.0;
        var cpDone = climbPt(1.0);
        var settle3 = smooth(9.02, 9.55, t);
        x = cpDone.x;
        y = cpDone.y + Math.sin(t * 2.5) * 1.4;
        rot = lerp(-1.55, -0.32, settle3);
        crawlSpeed = (1 - settle3) * 0.25;
        lean = 0.22;
        envTuck = 1.0;
        hasReply = true;
        hasAlienStamp = true;
        trail1U = 1.0;
        trail1Alpha = 0.45;
        trail2U = 1.0;
        trail2Alpha = lerp(0.92, 0.65, smooth(9.0, 12.8, t));
        alienDeploy = 1.0;
        alienScan = smooth(8.85, 9.35, t);
        if (t <= 9.30) {
          stampGlint = clamp(1 - Math.abs(t - 9.05) / 0.24, 0, 1);
        }
      }
    }

    if (st.snailNote && String(st.snailNote).trim().length > 0 && envTuck < 1) {
      envTuck = 1.0;
    }

    return {
      t: t,
      innerT: tm.innerT,
      passNum: tm.passNum,
      view: tm.view,
      blindMode: tm.blindMode,
      x: x,
      y: y,
      rHit: 38,
      rot: rot,
      crawlSpeed: crawlSpeed,
      lean: lean,
      trail1U: trail1U,
      trail1Alpha: trail1Alpha,
      trail2U: trail2U,
      trail2Alpha: trail2Alpha,
      envTuck: envTuck,
      wingSlip: wingSlip,
      hatchOpen: hatchOpen,
      stampGlint: stampGlint,
      hasReply: hasReply,
      hasAlienStamp: hasAlienStamp,
      alienDeploy: alienDeploy,
      alienScan: alienScan,
      chartPulse: chartPulse,
      roll: roll,
      explicitRoll: tm.explicitRoll,
      inTransit: inTransit,
      dispatchLabel: dispatchLabel,
      phase: phase,
      progress: progress
    };
  }

  // ---------- 1. Brass 7:30 Mail-Hatch & Turkey Wing Slip ----------
  function drawBrassMailHatchAndSlip(ctx, pose) {
    ctx.save();
    ctx.translate(HATCH_X - 8, HATCH_Y + 12);
    ctx.rotate(HATCH_ANG);

    ctx.fillStyle = "rgba(10, 14, 15, 0.45)";
    roundedRectPath(ctx, -20, -7, 40, 16, 5);
    ctx.fill();

    var bg = ctx.createLinearGradient(-19, -7, 19, 7);
    bg.addColorStop(0, "#d8ad5b");
    bg.addColorStop(0.5, "#b68839");
    bg.addColorStop(1, "#7c5920");
    ctx.fillStyle = bg;
    ctx.strokeStyle = "#1c1409";
    ctx.lineWidth = 1.8;
    roundedRectPath(ctx, -19, -7, 38, 14, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f5d78e";
    ctx.beginPath();
    ctx.arc(-14, 0, 1.8, 0, TAU);
    ctx.arc(14, 0, 1.8, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#161008";
    roundedRectPath(ctx, -10, -2.5, 20, 5 + pose.hatchOpen * 2.5, 1.5);
    ctx.fill();

    ctx.fillStyle = "#ecc673";
    ctx.strokeStyle = "#1c1409";
    ctx.lineWidth = 1.2;
    var flapH = lerp(3.4, 1.2, pose.hatchOpen);
    ctx.fillRect(-10, -3.2 - pose.hatchOpen * 2.2, 20, flapH);
    ctx.strokeRect(-10, -3.2 - pose.hatchOpen * 2.2, 20, flapH);
    ctx.restore();

    if (pose.wingSlip > 0.02) {
      var u = pose.wingSlip;
      var shX = 434, shY = 468;
      var tipX = lerp(452, HATCH_X - 10, u);
      var tipY = lerp(452, HATCH_Y + 8, u);

      ctx.save();
      ctx.strokeStyle = "rgba(8, 14, 16, 0.42)";
      ctx.lineWidth = 20;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(shX, shY + 6);
      ctx.quadraticCurveTo(456, 436, tipX, tipY + 5);
      ctx.stroke();

      ctx.strokeStyle = "#6d3f25";
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(shX, shY);
      ctx.quadraticCurveTo(456, 430, tipX, tipY);
      ctx.stroke();

      var ang = Math.atan2(tipY - 430, tipX - 456);
      ctx.translate(tipX, tipY);
      ctx.rotate(ang);
      for (var f = -1; f <= 1; f++) {
        ctx.save();
        ctx.rotate(f * 0.20);
        ctx.fillStyle = (f === 0) ? "#9c5c36" : "#7e4829";
        ctx.strokeStyle = "#1b1009";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(10, 0, 14, 4.2, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ecd7b4";
        ctx.fillRect(13, -2.8, 3.2, 5.6);
        ctx.restore();
      }
      ctx.restore();
    }
  }

  // ---------- 2. Shimmering Slime Trails (Lower Crossing + Right-Rim Alien Climb) ----------
  function drawGlassSlimeTrails(ctx, pose) {
    // Trail 1: Lower porthole glass crossing (7:30 -> 3:50)
    if (pose.trail1U > 0.015 && pose.trail1Alpha > 0.01) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R_GLASS - 1, 0, TAU);
      ctx.clip();

      var steps = 28;
      var maxU = clamp(pose.trail1U, 0, 1);
      ctx.beginPath();
      for (var i = 0; i <= steps; i++) {
        var u = (i / steps) * maxU;
        var p = cubicPt(HATCH_X, HATCH_Y + 6, ARC_C1X, ARC_C1Y + 7, ARC_C2X, ARC_C2Y + 7, PERCH_X - 6, PERCH_Y + 8, u);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(186, 240, 242, " + (0.28 * pose.trail1Alpha).toFixed(3) + ")";
      ctx.lineWidth = 10.0;
      ctx.stroke();

      var headPt = cubicPt(HATCH_X, HATCH_Y + 6, ARC_C1X, ARC_C1Y + 7, ARC_C2X, ARC_C2Y + 7, PERCH_X - 6, PERCH_Y + 8, maxU);
      var sg = ctx.createLinearGradient(HATCH_X, HATCH_Y, headPt.x, headPt.y);
      sg.addColorStop(0.0, "rgba(205, 238, 245, " + (0.22 * pose.trail1Alpha).toFixed(3) + ")");
      sg.addColorStop(0.55, "rgba(232, 250, 254, " + (0.52 * pose.trail1Alpha).toFixed(3) + ")");
      sg.addColorStop(1.0, "rgba(252, 255, 255, " + (0.85 * pose.trail1Alpha).toFixed(3) + ")");
      ctx.strokeStyle = sg;
      ctx.lineWidth = 3.8;
      ctx.stroke();

      for (var k = 1; k <= 8; k++) {
        var bu = (k / 9) * maxU;
        if (bu < 0.04) continue;
        var bp = cubicPt(HATCH_X, HATCH_Y + 6, ARC_C1X, ARC_C1Y + 7, ARC_C2X, ARC_C2Y + 7, PERCH_X - 6, PERCH_Y + 8, bu);
        var twinkle = 0.45 + 0.55 * Math.sin(pose.t * 6.4 + k * 1.9);
        ctx.fillStyle = "rgba(255, 255, 255, " + (0.58 * pose.trail1Alpha * twinkle).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(bp.x, bp.y - 1.2 + (k % 2) * 2.2, 1.4, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // Trail 2: Upward climb along right porthole rim/glass (3:50 -> 12:35 Alien Listening Post)
    if (pose.trail2U > 0.015 && pose.trail2Alpha > 0.01) {
      ctx.save();
      var steps2 = 28;
      var maxU2 = clamp(pose.trail2U, 0, 1);
      ctx.beginPath();
      for (var j = 0; j <= steps2; j++) {
        var u2 = (j / steps2) * maxU2;
        var cp = climbPt(u2);
        if (j === 0) ctx.moveTo(cp.x, cp.y);
        else ctx.lineTo(cp.x, cp.y);
      }
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(156, 245, 214, " + (0.30 * pose.trail2Alpha).toFixed(3) + ")";
      ctx.lineWidth = 9.5;
      ctx.stroke();

      ctx.strokeStyle = "rgba(235, 255, 248, " + (0.82 * pose.trail2Alpha).toFixed(3) + ")";
      ctx.lineWidth = 3.6;
      ctx.stroke();

      for (var m = 1; m <= 7; m++) {
        var cu = (m / 8) * maxU2;
        var mp = climbPt(cu);
        var tw2 = 0.5 + 0.5 * Math.sin(pose.t * 7.2 + m * 1.7);
        ctx.fillStyle = "rgba(218, 255, 238, " + (0.72 * pose.trail2Alpha * tw2).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(mp.x, mp.y, 1.7, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // ---------- 3. Tiered 1d6 Hex Bolt Aura & Non-Text Pip Badges ----------
  function drawTierBoltHighlights(ctx, pose) {
    // Highlight the active pass's pair of bolts:
    //   Pass 1 (Probable, Teal)      -> Bolts #1 & #2 (12:00 & 2:00)
    //   Pass 2 (Plausible, Green)    -> Bolts #3 & #4 (4:00 & 6:00)
    //   Pass 3 (Preposterous, Rust)  -> Bolts #5 & #6 (8:00 & 10:00 — bold cosmic pulse!)
    var activeBolts = [];
    var col = COL_PROBABLE;
    var glowCol = "#49d2e8";
    var strength = 0.55;

    if (pose.passNum === 1) {
      activeBolts = [1, 2];
      col = COL_PROBABLE;
      glowCol = "#4ad4eb";
      strength = 0.50;
    } else if (pose.passNum === 2) {
      activeBolts = [3, 4];
      col = COL_PLAUSIBLE;
      glowCol = "#5ce096";
      strength = 0.55;
    } else if (pose.passNum === 3 || pose.alienDeploy > 0.4) {
      activeBolts = [5, 6];
      col = COL_PREPOSTEROUS;
      glowCol = "#ff7847";
      strength = 0.95 * (pose.passNum === 3 ? 1 : pose.alienDeploy);
    } else {
      return;
    }

    for (var i = 0; i < activeBolts.length; i++) {
      var face = activeBolts[i];
      var ang = BOLT_ANGLES[face - 1];
      var bx = CX + Math.cos(ang) * 208;
      var by = CY + Math.sin(ang) * 208;
      var pulse = 0.72 + 0.28 * Math.sin(pose.t * 6.8 + i * 1.4);

      ctx.save();
      ctx.translate(bx, by);
      ctx.globalAlpha = clamp(strength, 0, 1);

      // Outer pulsing ring
      ctx.strokeStyle = glowCol;
      ctx.lineWidth = (pose.passNum === 3) ? 3.4 : 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 16.5 + pulse * 3.5, 0, TAU);
      ctx.stroke();

      // In Pass 3 (Preposterous), stamp crisp 5-pip & 6-pip rust/gold bolt caps (pure dots, zero text!)
      if (pose.passNum === 3 || pose.alienDeploy > 0.5) {
        var rg = ctx.createRadialGradient(0, 0, 2, 0, 0, 24);
        rg.addColorStop(0, "rgba(255, 136, 76, 0.45)");
        rg.addColorStop(1, "rgba(158, 61, 28, 0)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, TAU);
        ctx.fill();

        ctx.fillStyle = "#ffd980";
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(0, 0, 9.2, 0, TAU);
        ctx.fill();
        ctx.stroke();

        var pips = DIE_PIPS[face] || [];
        ctx.fillStyle = "#7a230c";
        for (var p = 0; p < pips.length; p++) {
          ctx.beginPath();
          ctx.arc(pips[p][0] * 4.8, pips[p][1] * 4.8, 1.35, 0, TAU);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  // ---------- 4. Handmade Trout Town Alien Listener & Saucer Pod Rig ----------
  function drawAlienSaucerRig(ctx, pose) {
    if (pose.alienDeploy <= 0.01) return;

    var dep = pose.alienDeploy;
    var scan = pose.alienScan;
    var t = pose.t;

    // Smoothly descends from above top rim (y = -48) to upper porthole perch (y = 110)
    var hoverX = ALIEN_POD_X + Math.sin(t * 2.1) * 7;
    var hoverY = lerp(-48, ALIEN_POD_Y, dep) + Math.cos(t * 2.9) * 4;
    var bank = Math.sin(t * 2.4) * 0.065;

    // ---- A. Violet-Emerald Telemetry / Tractor Scan Cone + Holographic Rings (clipped inside porthole glass) ----
    if (scan > 0.02) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R_GLASS - 1, 0, TAU);
      ctx.clip();

      var sweepX = CX + Math.sin(t * 2.5) * 26;
      var targetY = CY + 42;

      var beamGrad = ctx.createLinearGradient(hoverX, hoverY + 18, sweepX, targetY + 75);
      beamGrad.addColorStop(0.0, "rgba(182, 120, 255, " + (0.38 * scan).toFixed(3) + ")");
      beamGrad.addColorStop(0.48, "rgba(82, 242, 188, " + (0.24 * scan).toFixed(3) + ")");
      beamGrad.addColorStop(1.0, "rgba(82, 242, 188, 0.0)");

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(hoverX - 22, hoverY + 18);
      ctx.lineTo(sweepX - 118, targetY + 80);
      ctx.lineTo(sweepX + 118, targetY + 80);
      ctx.lineTo(hoverX + 22, hoverY + 18);
      ctx.closePath();
      ctx.fill();

      // 3 Animated Holographic Saucer Measurement Rings scanning the porthole object (pure geometry, zero text!)
      for (var ri = 0; ri < 3; ri++) {
        var ringU = ((t * 0.55 + ri / 3) % 1);
        var ryPos = lerp(hoverY + 46, CY + 68, ringU);
        var rxPos = lerp(hoverX, sweepX, ringU);
        var rxRad = lerp(28, 92, ringU);
        var ryRad = rxRad * 0.27;
        var rAlpha = Math.sin(ringU * Math.PI) * 0.78 * scan;

        ctx.save();
        ctx.translate(rxPos, ryPos);
        ctx.strokeStyle = (ri % 2 === 0)
          ? "rgba(104, 250, 204, " + rAlpha.toFixed(3) + ")"
          : "rgba(208, 146, 255, " + rAlpha.toFixed(3) + ")";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.ellipse(0, 0, rxRad, ryRad, 0, 0, TAU);
        ctx.stroke();

        // 4 Rotating cardinal measurement tick nodes around each holographic ring
        for (var tk = 0; tk < 4; tk++) {
          var ta = t * 2.2 + ri + tk * (Math.PI * 0.5);
          var tx = Math.cos(ta) * rxRad;
          var ty = Math.sin(ta) * ryRad;
          ctx.fillStyle = "rgba(255, 240, 165, " + (rAlpha * 1.1).toFixed(3) + ")";
          ctx.beginPath();
          ctx.arc(tx, ty, 2.3, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();
    }

    // ---- B. Miniature Brass-and-Glass Saucer Listening Pod + 3-Eyed Alien Listener ----
    ctx.save();
    ctx.translate(hoverX, hoverY);
    ctx.rotate(bank);

    // Soft cosmic aura behind saucer pod
    var podGlow = ctx.createRadialGradient(0, -4, 8, 0, -4, 74);
    podGlow.addColorStop(0.0, "rgba(130, 250, 200, 0.26)");
    podGlow.addColorStop(0.55, "rgba(168, 110, 245, 0.14)");
    podGlow.addColorStop(1.0, "rgba(168, 110, 245, 0)");
    ctx.fillStyle = podGlow;
    ctx.beginPath();
    ctx.arc(0, -4, 74, 0, TAU);
    ctx.fill();

    // Underneath brass telemetry emitter dish + 2 dainty tripod landing skids
    ctx.strokeStyle = "#19130b";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-26, 11); ctx.lineTo(-34, 22); ctx.lineTo(-22, 22);
    ctx.moveTo(26, 11);  ctx.lineTo(34, 22);  ctx.lineTo(22, 22);
    ctx.stroke();

    ctx.fillStyle = "#5ef0bc";
    ctx.strokeStyle = "#14211c";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, 15, 16, 5.5, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Right-side Brass Airmail Receiver Horn (where Mail Snail docks at 12:35!)
    ctx.save();
    ctx.translate(52, -2);
    ctx.rotate(0.12);
    ctx.fillStyle = "#d9a648";
    ctx.strokeStyle = "#1a1308";
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(-4, -3.5);
    ctx.lineTo(15, -9.5);
    ctx.quadraticCurveTo(19, 0, 15, 9.5);
    ctx.lineTo(-4, 3.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#2b1d10";
    ctx.beginPath();
    ctx.ellipse(15, 0, 3.0, 8.2, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Clear Blown-Glass Saucer Dome Back Tint
    var domeBack = ctx.createRadialGradient(-8, -22, 4, 0, -14, 38);
    domeBack.addColorStop(0, "rgba(210, 255, 242, 0.36)");
    domeBack.addColorStop(1, "rgba(88, 178, 185, 0.22)");
    ctx.fillStyle = domeBack;
    ctx.beginPath();
    ctx.arc(0, -4, 35, Math.PI, 0);
    ctx.closePath();
    ctx.fill();

    // ---- Articulated Trout Town Alien Listener Inside the Dome! ----
    ctx.save();
    var headSway = Math.sin(t * 3.4) * 2.2;
    ctx.translate(headSway, -4);

    // Rust-and-brass Flight Jumpsuit Collar
    ctx.fillStyle = "#9e3d1c";
    ctx.strokeStyle = "#151c18";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-21, 5);
    ctx.quadraticCurveTo(0, -6, 21, 5);
    ctx.lineTo(18, 9);
    ctx.lineTo(-18, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Twin Articulated Spring-Antennae with Glowing Violet & Amber Bulbs!
    var antSides = [
      { dir: -1, col: "#cf82ff", glow: "rgba(207,130,255,0.65)", ph: 0 },
      { dir: 1,  col: "#ffd25a", glow: "rgba(255,210,90,0.65)",  ph: 1.6 }
    ];
    for (var ai = 0; ai < 2; ai++) {
      var ant = antSides[ai];
      var flex = Math.sin(t * 6.2 + ant.ph) * 4.5;
      var tipX = ant.dir * 16 + flex;
      var tipY = -36 + Math.cos(t * 5.4 + ant.ph) * 2.0;

      // Coiled brass spring stem
      ctx.strokeStyle = "#16201b";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(ant.dir * 7, -23);
      ctx.bezierCurveTo(ant.dir * 14, -27, ant.dir * 8 + flex * 0.5, -31, tipX, tipY);
      ctx.stroke();

      // Bulb glow + orb
      ctx.fillStyle = ant.glow;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 7.5 + Math.sin(t * 8 + ant.ph) * 1.8, 0, TAU);
      ctx.fill();

      ctx.fillStyle = ant.col;
      ctx.strokeStyle = "#16201b";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 4.0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Pear-shaped Celadon-Emerald Alien Head
    var alGrad = ctx.createRadialGradient(-4, -18, 3, 0, -13, 22);
    alGrad.addColorStop(0.0, "#a8f5ad");
    alGrad.addColorStop(0.6, "#5bc878");
    alGrad.addColorStop(1.0, "#2f8651");
    ctx.fillStyle = alGrad;
    ctx.strokeStyle = "#132118";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-15, -3);
    ctx.bezierCurveTo(-21, -14, -17, -27, 0, -27);
    ctx.bezierCurveTo(17, -27, 21, -14, 15, -3);
    ctx.quadraticCurveTo(0, 4, -15, -3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Listening-Post Headphones (brass headband + dark bakelite earcups + pulsing sound arcs!)
    ctx.strokeStyle = "#e0b152";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, -14, 19.5, Math.PI * 1.08, -Math.PI * 0.08);
    ctx.stroke();

    for (var hc = -1; hc <= 1; hc += 2) {
      ctx.fillStyle = "#242a30";
      ctx.strokeStyle = "#e0b152";
      ctx.lineWidth = 1.6;
      roundedRectPath(ctx, hc * 18.5 - 3.5, -18, 7, 11, 3);
      ctx.fill();
      ctx.stroke();

      // Tiny pulsing radio reception arcs beside earcups
      var waveA = 0.4 + 0.5 * Math.sin(t * 7.5 + hc);
      ctx.strokeStyle = "rgba(116, 250, 206, " + waveA.toFixed(3) + ")";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(hc * 22, -12.5, 5.5, hc > 0 ? -0.7 : Math.PI - 0.7, hc > 0 ? 0.7 : Math.PI + 0.7);
      ctx.stroke();
    }

    // THREE Blinking Emerald-Gold Alien Eyes!
    var eyes = [
      { ex: -8.5, ey: -12.5, r: 4.3, blinkOff: 0.0 },
      { ex: 0.0,  ey: -18.2, r: 4.7, blinkOff: 0.4 },
      { ex: 8.5,  ey: -12.5, r: 4.3, blinkOff: 0.8 }
    ];
    var lookAtSnail = (Math.sin(t * 1.7) > 0.35) ? 1.3 : 0.2;
    for (var ei = 0; ei < 3; ei++) {
      var ey = eyes[ei];
      var isBlink = Math.sin(t * 2.4 + ey.blinkOff) > 0.95;
      ctx.save();
      ctx.translate(ey.ex, ey.ey);
      ctx.scale(1, isBlink ? 0.14 : 1);

      ctx.fillStyle = "#10241b";
      ctx.strokeStyle = "#f4f9e8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, ey.r, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // Luminous emerald-gold iris & catchlight looking down into porthole / over at Mail Snail
      ctx.fillStyle = "#69f5b2";
      ctx.beginPath();
      ctx.arc(lookAtSnail, 1.1, ey.r * 0.52, 0, TAU);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(lookAtSnail - 1.1, -1.1, 1.15, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // Delighted little "ooh!" cosmic smile
    ctx.strokeStyle = "#132118";
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(0.5, -5.8, 3.4, 0.15, Math.PI - 0.15);
    ctx.stroke();

    // Little 3-fingered green hand waving toward Mail Snail on right!
    ctx.save();
    ctx.translate(15, -2);
    ctx.rotate(Math.sin(t * 6.0) * 0.25);
    ctx.fillStyle = "#6ad886";
    ctx.strokeStyle = "#132118";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 3.8, 0, TAU);
    ctx.fill();
    ctx.stroke();
    for (var fi = -1; fi <= 1; fi++) {
      ctx.beginPath();
      ctx.moveTo(fi * 2.0, -2.5);
      ctx.lineTo(fi * 3.2, -6.5);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore(); // end alien character

    // Clear Blown-Glass Dome Front Specular Rim & Highlight Arc
    ctx.strokeStyle = "rgba(225, 255, 250, 0.78)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, -4, 35, Math.PI, 0);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.58)";
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, -4, 30, Math.PI * 1.16, Math.PI * 1.48);
    ctx.stroke();

    // Riveted Antique-Brass & Rust Saucer Skirt Collar
    var skirtG = ctx.createLinearGradient(-56, 0, 56, 12);
    skirtG.addColorStop(0.0, "#7c4f1e");
    skirtG.addColorStop(0.32, "#e0ae56");
    skirtG.addColorStop(0.68, "#b88232");
    skirtG.addColorStop(1.0, "#633d15");
    ctx.fillStyle = skirtG;
    ctx.strokeStyle = "#19120a";
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.ellipse(0, 4, 56, 13.5, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // 7 Chasing Cosmic Saucer Rim Lights (Emerald / Violet / Gold)
    var rimCols = ["#64f5be", "#d08aff", "#ffd466"];
    for (var li = -3; li <= 3; li++) {
      var lx = li * 14.2;
      var ly = 4.5 + Math.cos((li / 3.5) * 1.1) * 3.2;
      var activeLamp = ((Math.floor(t * 7) + li + 6) % 3);
      ctx.fillStyle = rimCols[activeLamp];
      ctx.strokeStyle = "#19120a";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(lx, ly, 3.1, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // ---------- 5. Handmade Trout Town Mail Snail Rig (Porthole_Post_Worksheet.png) ----------
  function drawMailSnailRig(ctx, opts) {
    var x = opts.x || 0;
    var y = opts.y || 0;
    var scale = opts.scale || 1.08;
    var rot = opts.rot || 0;
    var t = opts.t || 0;
    var crawlSpeed = opts.crawlSpeed || 0;
    var lean = clamp(opts.lean || 0, 0, 1);
    var envTuck = clamp(opts.envTuck == null ? 1 : opts.envTuck, 0, 1);
    var hasReply = !!opts.hasReply;
    var hasAlienStamp = !!opts.hasAlienStamp;
    var roll = opts.roll || 0;
    var stampGlint = clamp(opts.stampGlint || 0, 0, 1);
    var lookLeft = !!opts.lookLeft;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(scale, scale);

    // Contact shadow
    ctx.fillStyle = "rgba(7, 15, 18, 0.36)";
    ctx.beginPath();
    ctx.ellipse(-2, 12, 28, 6.5, 0, 0, TAU);
    ctx.fill();

    // A. Spiral Honey-Amber Shell
    var shellBob = Math.sin(t * (crawlSpeed > 0.2 ? 9.0 : 2.8)) * (crawlSpeed > 0.2 ? 1.2 : 0.5);
    var shX = -6;
    var shY = -6 + shellBob;

    ctx.save();
    ctx.translate(shX, shY);
    ctx.rotate(-0.06 + lean * 0.08);

    var shellGrad = ctx.createRadialGradient(-4, -5, 2, 0, 0, 19);
    shellGrad.addColorStop(0.0, "#fae094");
    shellGrad.addColorStop(0.48, "#eab146");
    shellGrad.addColorStop(0.85, "#c98121");
    shellGrad.addColorStop(1.0, "#995c12");
    ctx.fillStyle = shellGrad;
    ctx.strokeStyle = "#171a1c";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 17.5, 16.0, -0.10, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 250, 228, 0.55)";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    for (var hi = 0; hi <= 28; hi++) {
      var ha = (hi / 28) * Math.PI * 3.6;
      var hr = 1.6 + (hi / 28) * 11.2;
      var hx = Math.cos(ha) * hr - 0.5;
      var hy = Math.sin(ha) * hr * 0.92 - 0.5;
      if (hi === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.stroke();

    ctx.strokeStyle = "#171a1c";
    ctx.lineWidth = 2.35;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (var si = 0; si <= 40; si++) {
      var sa = 0.4 + (si / 40) * Math.PI * 4.5;
      var sr = 1.2 + (si / 40) * 13.6;
      var sx = Math.cos(sa) * sr;
      var sy = Math.sin(sa) * sr * 0.92;
      if (si === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // B. Tiny Dark Tilted Postal Cap
    ctx.save();
    ctx.translate(1, -15.5);
    ctx.rotate(0.10 + lean * 0.16);

    ctx.fillStyle = "#1a2026";
    ctx.strokeStyle = "#0e1215";
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(-11.5, 2.5);
    ctx.bezierCurveTo(-13.5, -6.5, -4.5, -10.5, 4.5, -8.2);
    ctx.quadraticCurveTo(10.5, -6.5, 9.8, 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#ebc05d";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-10.5, 1.3);
    ctx.quadraticCurveTo(0, -0.5, 9.5, 0.8);
    ctx.stroke();

    ctx.fillStyle = "#ffd978";
    ctx.beginPath();
    ctx.arc(3.5, -3.2, 1.9, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#111519";
    ctx.strokeStyle = "#0b0e11";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(2.0, 0.8);
    ctx.quadraticCurveTo(13.5, -0.5, 16.2, 2.8);
    ctx.quadraticCurveTo(9.5, 4.6, 0.5, 2.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();

    // C. Golden-Ochre Snail Foot & Head
    var wavePhase = t * (crawlSpeed > 0.2 ? 12.0 : 2.5);
    var headBob = Math.sin(t * 4.2) * 0.9;

    var footGrad = ctx.createLinearGradient(0, -14, 0, 13);
    footGrad.addColorStop(0.0, "#f9d670");
    footGrad.addColorStop(0.55, "#eab03c");
    footGrad.addColorStop(1.0, "#c5821c");

    ctx.fillStyle = footGrad;
    ctx.strokeStyle = "#171a1c";
    ctx.lineWidth = 2.3;
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(-31, 8.5);
    for (var wi = 1; wi <= 6; wi++) {
      var wu = wi / 6;
      var wx = lerp(-31, 18, wu);
      var ripple = Math.sin(wavePhase - wu * 5.2) * (0.6 + crawlSpeed * 1.3);
      var wy = lerp(9.5, 11.2, Math.sin(wu * Math.PI)) + ripple;
      ctx.lineTo(wx, wy);
    }
    var headX = 25.5 + lean * 2.5;
    var headY = -3.5 + headBob + lean * 1.0;
    ctx.quadraticCurveTo(25.5, 9.5, headX + 3.5, headY + 3.0);
    ctx.bezierCurveTo(headX + 5.5, headY - 3.5, headX + 1.5, headY - 9.5, headX - 5.5, headY - 8.5);
    ctx.quadraticCurveTo(12.5, headY - 5.5, 8.5, 3.5);
    ctx.quadraticCurveTo(-8.0, 7.5, -21.0, 5.5);
    ctx.quadraticCurveTo(-27.5, 5.5, -31, 8.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#171a1c";
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(headX - 0.5, headY - 1.2, 4.0, 0.25, 1.35);
    ctx.stroke();

    // D. Two Expressive Eyestalks
    var stalkConfigs = [
      { bx: headX - 5.2, by: headY - 7.6, baseAng: -1.32, len: 12.0, ph: 0.0 },
      { bx: headX - 0.8, by: headY - 7.0, baseAng: -0.88, len: 12.8, ph: 1.35 }
    ];
    for (var ei = 0; ei < 2; ei++) {
      var sc = stalkConfigs[ei];
      var bobAng = Math.sin(t * 4.8 + sc.ph) * 0.12 + lean * 0.26 + (lookLeft ? -0.35 : 0);
      var tipAng = sc.baseAng + bobAng;
      var ex = sc.bx + Math.cos(tipAng) * sc.len;
      var ey = sc.by + Math.sin(tipAng) * sc.len;

      ctx.strokeStyle = "#171a1c";
      ctx.lineWidth = 4.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sc.bx, sc.by);
      ctx.quadraticCurveTo((sc.bx + ex) * 0.5 - 1.2, (sc.by + ey) * 0.5, ex, ey);
      ctx.stroke();

      ctx.strokeStyle = "#f4c85c";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.fillStyle = "#fdfbf2";
      ctx.strokeStyle = "#171a1c";
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.arc(ex, ey, 4.2, 0, TAU);
      ctx.fill();
      ctx.stroke();

      var pxOff = lookLeft ? -1.1 : 1.1;
      var pyOff = lookLeft ? -0.7 : -0.2;
      ctx.fillStyle = "#14181b";
      ctx.beginPath();
      ctx.arc(ex + pxOff, ey + pyOff, 1.85, 0, TAU);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ex + pxOff - 0.7, ey + pyOff - 0.8, 0.75, 0, TAU);
      ctx.fill();
    }

    // E. Crisp White Porthole Postcard Envelope + Triple Stamps (Turkey Red + Trout Green + Alien Triangle!)
    if (envTuck > 0.02) {
      ctx.save();
      var envSlideX = lerp(-28, -13.5, envTuck);
      var envSlideY = lerp(11, 2.5 + shellBob * 0.7, envTuck);
      ctx.translate(envSlideX, envSlideY);
      ctx.rotate(lerp(0.28, -0.11, envTuck));
      var envScale = lerp(0.72, 1.0, envTuck);
      ctx.scale(envScale, envScale);

      var ew = 28.0;
      var eh = 19.0;

      ctx.fillStyle = "rgba(12, 18, 20, 0.28)";
      roundedRectPath(ctx, -ew * 0.5 + 1.4, -eh * 0.5 + 1.8, ew, eh, 2.2);
      ctx.fill();

      ctx.fillStyle = "#fcfaf2";
      ctx.strokeStyle = "#171a1c";
      ctx.lineWidth = 2.0;
      roundedRectPath(ctx, -ew * 0.5, -eh * 0.5, ew, eh, 2.0);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "#2b3136";
      ctx.lineWidth = 1.35;
      ctx.beginPath();
      ctx.moveTo(-ew * 0.5 + 1, eh * 0.5 - 1);
      ctx.lineTo(-3.2, 0.5);
      ctx.moveTo(ew * 0.5 - 1, eh * 0.5 - 1);
      ctx.lineTo(3.2, 0.5);
      ctx.stroke();

      ctx.strokeStyle = "#171a1c";
      ctx.lineWidth = 1.55;
      ctx.beginPath();
      ctx.moveTo(-ew * 0.5 + 0.8, -eh * 0.5 + 0.8);
      ctx.lineTo(0, 2.2);
      ctx.lineTo(ew * 0.5 - 0.8, -eh * 0.5 + 0.8);
      ctx.stroke();

      // 1. Turkey's Red Corner Stamp (Top-Right)
      var stX = ew * 0.5 - 7.6;
      var stY = -eh * 0.5 + 2.0;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(stX - 0.8, stY - 0.8, 6.8, 6.8);
      ctx.fillStyle = "#d13424";
      ctx.fillRect(stX, stY, 5.2, 5.2);

      // 2. Trout's Plausible Green Circular Reply Postmark (Top-Left)
      if (hasReply) {
        ctx.strokeStyle = "#1f7a58";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(-ew * 0.5 + 5.6, -eh * 0.5 + 5.2, 3.1, 0, TAU);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-ew * 0.5 + 9.0, -eh * 0.5 + 4.1);
        ctx.lineTo(-ew * 0.5 + 13.4, -eh * 0.5 + 4.1);
        ctx.moveTo(-ew * 0.5 + 9.0, -eh * 0.5 + 6.4);
        ctx.lineTo(-ew * 0.5 + 13.0, -eh * 0.5 + 6.4);
        ctx.stroke();
      }

      // 3. Alien's Cosmic Triangle Postmark (Bottom-Right, pure geometry, zero text!)
      if (hasAlienStamp) {
        ctx.save();
        ctx.translate(ew * 0.5 - 6.2, eh * 0.5 - 4.8);
        ctx.fillStyle = "rgba(182, 118, 255, 0.35)";
        ctx.strokeStyle = COL_PREPOSTEROUS;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, -4.4);
        ctx.lineTo(4.2, 3.2);
        ctx.lineTo(-4.2, 3.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#7a2bc2";
        ctx.beginPath();
        ctx.arc(0, 0.6, 1.15, 0, TAU);
        ctx.fill();
        ctx.restore();
      }

      // Gold Wax Seal + Pure 1..6 Die-Pip Dots (when rolled)
      if (hasReply || hasAlienStamp) {
        var sealR = (roll >= 1 && roll <= 6) ? 5.5 : 3.9;
        var sealY = 2.8;
        ctx.fillStyle = "#f2c144";
        ctx.strokeStyle = "#6e490c";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(-1.5, sealY, sealR, 0, TAU);
        ctx.fill();
        ctx.stroke();

        if (roll >= 1 && roll <= 6 && DIE_PIPS[roll]) {
          var pips = DIE_PIPS[roll];
          ctx.fillStyle = "#191207";
          for (var pi = 0; pi < pips.length; pi++) {
            ctx.beginPath();
            ctx.arc(-1.5 + pips[pi][0] * 3.0, sealY + pips[pi][1] * 3.0, 0.9, 0, TAU);
            ctx.fill();
          }
        }
      }

      // Starburst Postal Glint across handoff cuts
      if (stampGlint > 0.02) {
        ctx.save();
        var ga = stampGlint;
        var gr = ctx.createRadialGradient(0, 0, 2, 0, 0, 30);
        gr.addColorStop(0.0, "rgba(255, 246, 190, " + (0.94 * ga).toFixed(3) + ")");
        gr.addColorStop(0.45, hasAlienStamp ? "rgba(202, 132, 255, " + (0.55 * ga).toFixed(3) + ")" : "rgba(255, 204, 92, " + (0.52 * ga).toFixed(3) + ")");
        gr.addColorStop(1.0, "rgba(255, 190, 72, 0)");
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, TAU);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 252, 224, " + (0.95 * ga).toFixed(3) + ")";
        ctx.lineWidth = 2.1;
        for (var ri = 0; ri < 8; ri++) {
          var ra = ri * (Math.PI / 4) + t * 1.6;
          var rOut = (ri % 2 === 0 ? 24 : 15) * (0.65 + 0.35 * ga);
          ctx.beginPath();
          ctx.moveTo(Math.cos(ra) * 6, Math.sin(ra) * 6);
          ctx.lineTo(Math.cos(ra) * rOut, Math.sin(ra) * rOut);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  // ---------- 6. Unified 3-Pass Editorial Cream Paper Strip (y = 536..720) ----------
  function drawUnifiedThreePassStrip(ctx, pose, scene) {
    var station = (scene && scene.station) || "#01 · Port";
    var clue = (scene && scene.clue) || "Submerged river clue";
    var turkeyFork = (scene && scene.turkeyFork) || "Safe shelter or hidden trap?";
    var troutFork = (scene && scene.troutFork) || "Friendly neighbor or noisy visitor?";
    var scionRule = (scene && scene.scionRule) || "SCION Two-Sided Reading";
    var id = (scene && scene.id) || 1;
    var alienFork = getAlienFork(id);

    ctx.save();
    // Clean cream paper base covering y = 536..720 uniformly across all 55 portals
    ctx.fillStyle = "#faf8f3";
    ctx.fillRect(0, SPLIT_Y, 1280, 720 - SPLIT_Y);

    ctx.strokeStyle = "#d4cec0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, SPLIT_Y + 0.75);
    ctx.lineTo(1280, SPLIT_Y + 0.75);
    ctx.stroke();

    // CRITICAL PAELEO BLIND-CRITIC INVARIANT:
    // When state.showCaptions === false, draw ZERO text strings—only non-text 3-tier progress geometry!
    if (pose.blindMode) {
      var barX = 72, barW = 1136, barY = 628;
      // 3 muted color segments (Probable Teal | Plausible Green | Preposterous Rust)
      var s1 = barW * (5.0 / LOOP_DUR);
      var s2 = barW * (3.8 / LOOP_DUR);
      var s3 = barW - s1 - s2;

      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "rgba(29, 89, 110, 0.22)";
      ctx.beginPath(); ctx.moveTo(barX, barY); ctx.lineTo(barX + s1 - 4, barY); ctx.stroke();

      ctx.strokeStyle = "rgba(45, 104, 70, 0.22)";
      ctx.beginPath(); ctx.moveTo(barX + s1 + 4, barY); ctx.lineTo(barX + s1 + s2 - 4, barY); ctx.stroke();

      ctx.strokeStyle = "rgba(158, 61, 28, 0.22)";
      ctx.beginPath(); ctx.moveTo(barX + s1 + s2 + 4, barY); ctx.lineTo(barX + barW, barY); ctx.stroke();

      var progU = clamp(pose.t / LOOP_DUR, 0, 1);
      var activeCol = pose.passNum === 1 ? COL_PROBABLE : (pose.passNum === 2 ? COL_PLAUSIBLE : (pose.passNum === 3 ? COL_PREPOSTEROUS : "#8b6d32"));
      ctx.strokeStyle = activeCol;
      ctx.beginPath();
      ctx.moveTo(barX, barY);
      ctx.lineTo(barX + barW * progU, barY);
      ctx.stroke();

      ctx.fillStyle = activeCol;
      ctx.beginPath();
      ctx.arc(barX + barW * progU, barY, 5.5, 0, TAU);
      ctx.fill();
      ctx.restore();
      return;
    }

    // ---- Captioned Editorial Mode (showCaptions !== false) ----
    var kickerCol, headCol, kickerTxt, mainTxt, subTxt;
    var defaultToolName = (scene && scene.defaultTool === "ballast") ? "BALLAST SLOT" : "LAMP TOGGLE";

    if (pose.passNum === 0) {
      kickerCol = "#6b5530";
      headCol = "#1f282a";
      kickerTxt = "SETUP A · BREAD-TIN COCKPIT   (" + station + ")   ·   OPERATE " + defaultToolName;
      mainTxt = clue;
      subTxt = "Three Snail Mail passes ahead: 1–2 Probable (Turkey)  ·  3–4 Plausible (Trout)  ·  5–6 Preposterous (Alien)";
    } else if (pose.passNum === 1) {
      kickerCol = COL_PROBABLE;
      headCol = COL_PROBABLE;
      kickerTxt = "FIRST PASS · PROBABLE (FACES 1–2) · TURKEY LOOKS OUT   (" + station + ")";
      mainTxt = "“" + turkeyFork + "”";
      subTxt = "Write Probable faces (1 · 2)  ·  " + scionRule + "  ·  Clue: " + clue;
    } else if (pose.passNum === 2) {
      kickerCol = COL_PLAUSIBLE;
      headCol = COL_PLAUSIBLE;
      kickerTxt = "SECOND PASS · PLAUSIBLE (FACES 3–4) · TROUT LOOKS IN · SNAIL MAIL   (" + station + ")";
      mainTxt = "“" + troutFork + "”";
      subTxt = "Write Plausible faces (3 · 4)  ·  Snail Mail crosses glass -> climbs at 8.1s to Dear Alien!";
    } else {
      kickerCol = COL_PREPOSTEROUS;
      headCol = COL_PREPOSTEROUS;
      kickerTxt = "THIRD PASS · PREPOSTEROUS / OUT OF BOUNDS (FACES 5–6) · ALIEN LISTENING POST";
      mainTxt = "“" + alienFork + "”";
      var rollInfo = pose.roll > 0 ? ("Rolled 1d6 Bolt #" + pose.roll + "  ·  ") : "";
      subTxt = "Write Preposterous faces (5 · 6)  ·  " + rollInfo + "Dear Alien saucer scan (" + station + ")";
    }

    // Top 3px live pass progress rule along SPLIT_Y
    ctx.fillStyle = kickerCol;
    ctx.fillRect(0, SPLIT_Y, 1280 * clamp(pose.t / LOOP_DUR, 0, 1), 3);

    var leftX = 64;
    var maxTextW = 900; // leaves clean gutter before right-side 3-Tier Rubric Key at x=986

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = kickerCol;
    ctx.font = "600 13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText(kickerTxt, leftX, 572);

    // Auto-fit headline font size so long forks never touch the right-side rubric badges
    var fontPx = 33;
    ctx.font = "700 " + fontPx + "px Georgia, 'Times New Roman', serif";
    while (fontPx > 22 && ctx.measureText(mainTxt).width > maxTextW) {
      fontPx -= 2;
      ctx.font = "700 " + fontPx + "px Georgia, 'Times New Roman', serif";
    }
    ctx.fillStyle = headCol;
    ctx.fillText(mainTxt, leftX, 624);

    ctx.fillStyle = "#52585a";
    ctx.font = "italic 16px Georgia, serif";
    ctx.fillText(subTxt, leftX, 684);

    // Right-Side Unified 3-Tier Rubric Key (x = 986..1236, y = 566..654)
    var rx = 986;
    var ry = 566;
    var tiers = [
      { pass: 1, lbl: "1·2 PROBABLE · Turkey",     col: COL_PROBABLE,     rolled: pose.explicitRoll === 1 || pose.explicitRoll === 2 },
      { pass: 2, lbl: "3·4 PLAUSIBLE · Trout",     col: COL_PLAUSIBLE,    rolled: pose.explicitRoll === 3 || pose.explicitRoll === 4 },
      { pass: 3, lbl: "5·6 PREPOSTEROUS · Alien",  col: COL_PREPOSTEROUS, rolled: pose.explicitRoll === 5 || pose.explicitRoll === 6 }
    ];
    ctx.font = "600 11.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    for (var ti = 0; ti < 3; ti++) {
      var tr = tiers[ti];
      var by = ry + ti * 29;
      var isAct = (pose.passNum === tr.pass) || tr.rolled;
      roundedRectPath(ctx, rx, by, 250, 23, 5);
      ctx.fillStyle = isAct ? tr.col : "#f0ece2";
      ctx.fill();
      ctx.strokeStyle = isAct ? tr.col : "#d5cec0";
      ctx.lineWidth = 1.25;
      ctx.stroke();

      ctx.fillStyle = isAct ? "#ffffff" : tr.col;
      ctx.fillText(tr.lbl + (tr.rolled ? " ★" : ""), rx + 11, by + 15.5);
    }

    // Transit Dispatch Pill at top-right lip (y = 541..559, strictly above ry=566!)
    if (pose.inTransit && pose.dispatchLabel) {
      var pillW = 202;
      var pillH = 18;
      var pillX = 1236 - pillW;
      var pillY = SPLIT_Y + 4.5;
      var pCol = (pose.phase === "climbing-alien") ? COL_PREPOSTEROUS : COL_PLAUSIBLE;

      ctx.fillStyle = "#faf8f3";
      ctx.strokeStyle = pCol;
      ctx.lineWidth = 1.25;
      roundedRectPath(ctx, pillX, pillY, pillW, pillH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#d13424";
      ctx.fillRect(pillX + 7, pillY + 5, 8, 8);
      ctx.fillStyle = pCol;
      ctx.font = "600 10.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.textBaseline = "middle";
      ctx.fillText(pose.dispatchLabel, pillX + 20, pillY + pillH * 0.5 + 0.5);
    }

    ctx.restore();
  }

  // ---------- 7. Main Courier + Alien Listening Post Overlay ----------
  function drawCourier(ctx, W, H, t, state, scene) {
    if (!ctx) return;
    var w = W || 1280;
    var h = H || 720;
    var pose = getCourierPose(t, state, scene);

    ctx.save();
    if (w !== 1280 || h !== 720) {
      ctx.scale(w / 1280, h / 720);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowBlur = 0;
    if (ctx.setLineDash) ctx.setLineDash([]);

    // 1. Shimmering glass & rim slime arcs (7:30 -> 3:50 & 3:50 -> 12:35)
    drawGlassSlimeTrails(ctx, pose);

    // 2. Antique brass 7:30 mail-hatch + Turkey feathered wing slip
    drawBrassMailHatchAndSlip(ctx, pose);

    // 3. Tiered 1d6 bolt highlights & 5-pip / 6-pip Preposterous rust bolt pulses
    drawTierBoltHighlights(ctx, pose);

    // 4. Articulated Trout Town Alien Listener in Brass-and-Glass Saucer Pod (Pass 3)
    drawAlienSaucerRig(ctx, pose);

    // 5. Handmade articulated Trout Town Mail Snail Courier
    drawMailSnailRig(ctx, {
      x: pose.x,
      y: pose.y,
      scale: 1.08,
      rot: pose.rot,
      t: pose.t,
      crawlSpeed: pose.crawlSpeed,
      lean: pose.lean,
      envTuck: pose.envTuck,
      hasReply: pose.hasReply,
      hasAlienStamp: pose.hasAlienStamp,
      roll: pose.roll,
      stampGlint: pose.stampGlint,
      lookLeft: (pose.phase === "parked-right" || pose.phase === "alien-docked")
    });

    // 6. Unified 3-Pass Editorial Cream Paper Strip (strictly 0 text when showCaptions === false!)
    drawUnifiedThreePassStrip(ctx, pose, scene);

    ctx.restore();
  }

  // ---------- 8. Pointer Hit-Testing (Snail, 7:30 Hatch, 3:50 Perch, 12:00 Alien Pod) ----------
  function hitTest(mx, my, t, state, scene) {
    var pose = getCourierPose(t, state, scene);
    var dx = mx - pose.x, dy = my - pose.y;
    if (dx * dx + dy * dy <= 42 * 42) return true;
    var hx = mx - HATCH_X, hy = my - HATCH_Y;
    if (hx * hx + hy * hy <= 30 * 30) return true;
    var px = mx - PERCH_X, py = my - PERCH_Y;
    if (px * px + py * py <= 30 * 30) return true;
    if (pose.alienDeploy > 0.3) {
      var ax = mx - ALIEN_POD_X, ay = my - ALIEN_POD_Y;
      if (ax * ax + ay * ay <= 58 * 58) return true;
    }
    return false;
  }

  // ---------- 9. Idempotent 13.0s 3-Pass Scene Wrapper ----------
  function attachScene(scene) {
    if (!scene || typeof scene !== "object") return false;
    if (typeof scene.render !== "function" && !scene._origRender) return false;

    if (scene.id) {
      scene.alienFork = getAlienFork(scene.id);
      scene.duration = LOOP_DUR;
    }

    if (scene._snailWrappedV3) return false;

    var origRender = scene._origRender || scene.render;
    scene._origRender = origRender;
    scene._snailWrapped = true;
    scene._snailWrappedV3 = true;

    scene.render = function (ctx, W, H, t, state) {
      var tm = resolveTimelineMap(t, state, scene.id);
      origRender.call(this, ctx, W, H, tm.innerT, tm.innerState);
      drawCourier(ctx, W, H, t, state, scene);
    };
    return true;
  }

  function attachAll() {
    var scenes = window.PORTAL_SCENES;
    if (!scenes || typeof scenes !== "object") return 0;
    var count = 0;
    for (var id = 1; id <= 55; id++) {
      if (scenes[id] && attachScene(scenes[id])) {
        count++;
      }
    }
    return count;
  }

  function ensureAutoProxy() {
    var raw = window.PORTAL_SCENES || {};
    if (raw._isSnailProxy || typeof Proxy !== "function") {
      window.PORTAL_SCENES = raw;
      return;
    }
    try {
      window.PORTAL_SCENES = new Proxy(raw, {
        get: function (target, prop) {
          if (prop === "_isSnailProxy") return true;
          return target[prop];
        },
        set: function (target, prop, value) {
          var num = Number(prop);
          if (num >= 1 && num <= 55 && value && typeof value === "object") {
            attachScene(value);
          }
          target[prop] = value;
          return true;
        }
      });
    } catch (e) {
      window.PORTAL_SCENES = raw;
    }
  }

  window.SNAIL_MAIL = {
    LOOP_DUR: LOOP_DUR,
    ALIEN_PASSES: window.ALIEN_PASSES,
    getAlienFork: getAlienFork,
    attachAll: attachAll,
    attachScene: attachScene,
    drawCourier: drawCourier,
    drawMailSnailRig: drawMailSnailRig,
    drawAlienSaucerRig: drawAlienSaucerRig,
    getCourierPose: getCourierPose,
    hitTest: hitTest,
    HATCH: { x: HATCH_X, y: HATCH_Y },
    PERCH: { x: PERCH_X, y: PERCH_Y },
    ALIEN_POD: { x: ALIEN_POD_X, y: ALIEN_POD_Y }
  };

  ensureAutoProxy();
  attachAll();
})();
