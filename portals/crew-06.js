/* ==========================================================================
 * PAELEO / Oulipo + Video-to-Game Portal Animation Module — Crew 06 (#26–#30)
 * Handmade 2D Canvas Multiplane & Articulated Rigs for Trout Sub (Setup A)
 * ========================================================================== */
(function () {
  "use strict";

  window.PORTAL_SCENES = window.PORTAL_SCENES || {};

  var TAU = Math.PI * 2;
  var CX = 640;
  var CY = 255;
  var R_GLASS = 185;
  var R_INNER_BEVEL = 191;
  var R_OUTER_BRASS = 214;
  var STRIP_Y = 536;

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }
  function lerp(a, b, u) {
    return a + (b - a) * u;
  }
  function smoothstep(e0, e1, x) {
    var u = clamp((x - e0) / (e1 - e0 || 1e-6), 0, 1);
    return u * u * (3 - 2 * u);
  }
  function easeOutBack(x) {
    var u = clamp(x, 0, 1);
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
  }
  function hash1(n) {
    var s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  // Resolve deterministic timeline + optional interactive overrides
  function resolveState(meta, rawT, state) {
    var st = state || {};
    var time = typeof rawT === "number" && isFinite(rawT) ? Math.max(0, rawT) : 0;
    var tl = time <= 10.001 ? time : time % 10.0;

    var showCaptions = st.showCaptions === false ? false : true;

    var hasLampOverride = typeof st.lamp === "boolean";
    var hasBallastOverride = typeof st.ballast === "boolean";

    var autoLampAmt = meta.defaultTool === "lamp" ? smoothstep(0.92, 1.28, tl) : 0;
    var autoBallastAmt = meta.defaultTool === "ballast" ? smoothstep(0.92, 1.32, tl) : 0;

    var lampAmt = hasLampOverride ? (st.lamp ? 1 : 0) : autoLampAmt;
    var ballastAmt = hasBallastOverride ? (st.ballast ? 1 : 0) : autoBallastAmt;
    var lampOn = lampAmt >= 0.5;
    var ballastOn = ballastAmt >= 0.5;

    var taskLightAmt = Math.max(
      lampAmt,
      ballastAmt * 0.85,
      hasLampOverride && !st.lamp && (!hasBallastOverride || !st.ballast) ? 0.15 : smoothstep(0.95, 1.35, tl) * 0.78
    );

    var phase = "act1";
    if (st.view === "turkey") {
      phase = "turkey";
    } else if (st.view === "trout") {
      phase = "trout";
    } else {
      if (tl < 2.0) phase = "act1";
      else if (tl < 5.6) phase = "turkey";
      else phase = "trout";
    }

    var turkeyPresence = phase === "turkey" ? smoothstep(1.9, 2.4, Math.max(tl, st.view === "turkey" ? 3.5 : tl)) : (phase === "act1" ? 0.35 : 0.65);
    var troutPresence = phase === "trout" ? (st.view === "trout" && tl < 5.6 ? 1 : smoothstep(5.6, 6.35, tl)) : 0;

    var defaultRollMap = { 26: 2, 27: 4, 28: 3, 29: 4, 30: 6 };
    var activeRoll = 0;
    if (typeof st.roll === "number" && st.roll >= 1 && st.roll <= 6) {
      activeRoll = Math.round(st.roll);
    } else if (phase === "trout" && (tl >= 6.15 || st.view === "trout")) {
      activeRoll = defaultRollMap[meta.id] || ((meta.id % 6) + 1);
    }

    var chartProgress = st.view === "trout" && tl < 5.6
      ? 1.0
      : clamp((tl - 1.15) / 7.2, 0, 1);
    var hasLandmarkDot = (phase === "trout" && (tl >= 5.6 || st.view === "trout")) || activeRoll > 0;

    return {
      t: time,
      tl: tl,
      showCaptions: showCaptions,
      lampOn: lampOn,
      lampAmt: lampAmt,
      ballastOn: ballastOn,
      ballastAmt: ballastAmt,
      taskLightAmt: taskLightAmt,
      phase: phase,
      turkeyPresence: turkeyPresence,
      troutPresence: troutPresence,
      roll: activeRoll,
      chartProgress: chartProgress,
      hasLandmarkDot: hasLandmarkDot
    };
  }

  // Shared underwater caustics, stipple grain, and volumetric lamp cone inside clipped porthole
  function drawWaterAtmosphere(ctx, rs, opts) {
    var o = opts || {};
    var sightShiftY = rs.ballastAmt * 22;

    // Animated caustic ribbons at top of porthole
    ctx.save();
    ctx.globalAlpha = 0.16 + 0.14 * rs.lampAmt;
    for (var i = 0; i < 6; i++) {
      var wy = CY - 155 + i * 24 + sightShiftY * 0.35;
      ctx.beginPath();
      for (var x = CX - 195; x <= CX + 195; x += 16) {
        var wave = Math.sin((x * 0.024) + rs.t * (1.5 + i * 0.17) + i * 1.3) * (6 + i * 1.2);
        if (x === CX - 195) ctx.moveTo(x, wy + wave);
        else ctx.lineTo(x, wy + wave);
      }
      ctx.strokeStyle = o.causticColor || "#9ef0e2";
      ctx.lineWidth = 3.2 - i * 0.3;
      ctx.stroke();
    }
    ctx.restore();

    // Fast current silt streaks when ballast is NOT settled (visible especially at t=0.8s on ballast scenes)
    var driftTurbulence = (1 - rs.ballastAmt) * (o.baseCurrent || 0.45);
    if (driftTurbulence > 0.05) {
      ctx.save();
      ctx.strokeStyle = "rgba(195, 226, 222, " + (0.28 * driftTurbulence).toFixed(3) + ")";
      ctx.lineWidth = 1.6;
      for (var s = 0; s < 16; s++) {
        var sx = ((CX - 190) + ((hash1(s * 19.3) * 380 + rs.t * (95 + s * 7) * (0.4 + driftTurbulence)) % 380));
        var sy = CY - 150 + hash1(s * 7.7) * 300;
        var len = 14 + 26 * driftTurbulence;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - len, sy + Math.sin(rs.t * 3 + s) * 3);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Floating river motes / stipple suspension
    ctx.save();
    for (var m = 0; m < 26; m++) {
      var mx = CX - 175 + ((hash1(m * 31.1) * 350 + rs.t * (8 + (m % 5) * 3) * (1 - 0.55 * rs.ballastAmt)) % 350);
      var my = CY + 175 - ((hash1(m * 13.7) * 350 + rs.t * (10 + (m % 4) * 4)) % 350);
      var mr = 1.1 + (m % 3) * 0.7;
      ctx.fillStyle = rs.lampAmt > 0.4 && Math.abs(mx - CX) < 120
        ? "rgba(255, 232, 168, 0.48)"
        : "rgba(182, 228, 220, 0.28)";
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // Volumetric Searchlight Beam when Lamp Toggle is ON
    if (rs.lampAmt > 0.02) {
      ctx.save();
      var aimX = CX + Math.sin(rs.t * 1.1) * 14;
      var aimY = CY - 5 + sightShiftY * 0.3;
      var beamGrad = ctx.createRadialGradient(CX + 95, CY + 145, 12, aimX, aimY, 245);
      beamGrad.addColorStop(0, "rgba(255, 220, 128, " + (0.34 * rs.lampAmt).toFixed(3) + ")");
      beamGrad.addColorStop(0.55, "rgba(255, 198, 92, " + (0.16 * rs.lampAmt).toFixed(3) + ")");
      beamGrad.addColorStop(1, "rgba(255, 180, 70, 0)");

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(CX + 130, CY + 175);
      ctx.lineTo(aimX - 185, CY - 145);
      ctx.lineTo(aimX + 165, CY - 175);
      ctx.lineTo(CX + 175, CY + 120);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Pre-operation dusk murk veil (lifts when lamp OR ballast engages)
    var murk = clamp(1 - Math.max(rs.lampAmt * 0.92, rs.ballastAmt * 0.85), 0, 1) * (o.duskVeil !== undefined ? o.duskVeil : 0.46);
    if (murk > 0.01) {
      ctx.save();
      ctx.fillStyle = "rgba(9, 22, 26, " + murk.toFixed(3) + ")";
      ctx.fillRect(CX - 200, CY - 200, 400, 400);
      ctx.restore();
    }
  }

  // Articulated Spotted Appalachian Brook Trout Rig
  // dir = -1 faces left, +1 faces right
  function drawBrookTrout(ctx, x, y, scale, dir, t, opts) {
    var o = opts || {};
    var wagSpeed = o.wagSpeed || 5.2;
    var wagAmp = o.wagAmp !== undefined ? o.wagAmp : 1.0;
    var bodyPitch = o.pitch || 0;
    var jawOpen = o.jawOpen !== undefined ? o.jawOpen : (0.18 + 0.12 * Math.sin(t * 3.4));
    var finWarm = o.finRaise || 0; // lifts pectoral fins forward (e.g. warming by stove or gesturing)

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(bodyPitch);
    ctx.scale(dir * scale, scale);

    var w1 = Math.sin(t * wagSpeed) * 4.5 * wagAmp;
    var w2 = Math.sin(t * wagSpeed - 1.1) * 9.5 * wagAmp;
    var w3 = Math.sin(t * wagSpeed - 2.1) * 15.0 * wagAmp;

    // Dorsal fin (flexing)
    ctx.save();
    ctx.fillStyle = "#3f6e62";
    ctx.strokeStyle = "#12221f";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-8, -22 + w1 * 0.3);
    ctx.quadraticCurveTo(-24, -40 + w1 * 0.6, -38, -20 + w2 * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Dorsal fin rays
    for (var dr = 0; dr < 4; dr++) {
      var dx = -13 - dr * 6;
      ctx.beginPath();
      ctx.moveTo(dx, -20 + w1 * 0.3);
      ctx.lineTo(dx - 3, -31 + dr * 1.5 + w1 * 0.5);
      ctx.stroke();
    }
    ctx.restore();

    // Adipose fin
    ctx.fillStyle = "#527d6d";
    ctx.strokeStyle = "#12221f";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-58, -13 + w2 * 0.7);
    ctx.quadraticCurveTo(-65, -22 + w2 * 0.8, -70, -11 + w2 * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tail (Caudal) fin — square-forked Brook Trout tail undulating at w3
    ctx.save();
    ctx.fillStyle = "#c8643b";
    ctx.strokeStyle = "#12221f";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-78, -6 + w2 * 0.9);
    ctx.lineTo(-108, -26 + w3);
    ctx.quadraticCurveTo(-101, 0 + w3, -108, 25 + w3);
    ctx.lineTo(-78, 7 + w2 * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Tail rays
    ctx.lineWidth = 1.1;
    for (var tr = -2; tr <= 2; tr++) {
      ctx.beginPath();
      ctx.moveTo(-80, tr * 2 + w2 * 0.9);
      ctx.lineTo(-103, tr * 9 + w3);
      ctx.stroke();
    }
    ctx.restore();

    // Anal & Pelvic fins (coral-orange with crisp white + black leading edge!)
    var finSpecs = [
      { bx: -54, by: 13 + w2 * 0.6, lx: -68, ly: 29 + w2 * 0.8, tx: -44, ty: 16 + w2 * 0.5 },
      { bx: -22, by: 20 + w1 * 0.4, lx: -34, ly: 35 + w1 * 0.6, tx: -12, ty: 21 + w1 * 0.3 }
    ];
    for (var fi = 0; fi < finSpecs.length; fi++) {
      var fn = finSpecs[fi];
      ctx.fillStyle = "#d96b38";
      ctx.strokeStyle = "#12221f";
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(fn.bx, fn.by);
      ctx.lineTo(fn.lx, fn.ly);
      ctx.quadraticCurveTo((fn.lx + fn.tx) * 0.5, fn.ly - 2, fn.tx, fn.ty);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // White brook-trout edge stripe
      ctx.strokeStyle = "#faf6ea";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(fn.tx - 1, fn.ty);
      ctx.lineTo(fn.lx + 2, fn.ly - 1);
      ctx.stroke();
    }

    // Main articulated spine body
    var bodyGrad = ctx.createLinearGradient(0, -26, 0, 26);
    bodyGrad.addColorStop(0, "#244c44");
    bodyGrad.addColorStop(0.42, "#5c8c79");
    bodyGrad.addColorStop(0.72, "#d8b894");
    bodyGrad.addColorStop(1, "#e89a6b");

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = "#111f1d";
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    // Snout tip at (+48, 0)
    ctx.moveTo(48, -2);
    ctx.quadraticCurveTo(28, -23, -8, -23 + w1 * 0.35);
    ctx.quadraticCurveTo(-48, -21 + w2 * 0.65, -82, -6 + w2 * 0.9);
    ctx.lineTo(-82, 7 + w2 * 0.9);
    ctx.quadraticCurveTo(-46, 22 + w2 * 0.65, -6, 22 + w1 * 0.35);
    ctx.quadraticCurveTo(18, 22, 31, 13);
    // Mouth cleft
    ctx.lineTo(44, 5 + jawOpen * 9);
    ctx.lineTo(31, 4);
    ctx.lineTo(47, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hinged lower jaw detail
    ctx.fillStyle = "#c98b68";
    ctx.beginPath();
    ctx.moveTo(28, 6);
    ctx.lineTo(45, 6 + jawOpen * 10);
    ctx.quadraticCurveTo(36, 13 + jawOpen * 8, 25, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Lateral line + Brook Trout spots (pale yellow halos + crimson dots)
    ctx.strokeStyle = "rgba(22, 45, 40, 0.38)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(20, -1);
    ctx.quadraticCurveTo(-25, -2 + w1 * 0.4, -76, 0 + w2 * 0.85);
    ctx.stroke();

    var spots = [
      [10, -9], [2, -14], [-8, -11], [-18, -15], [-28, -9], [-39, -13], [-50, -8], [-62, -5],
      [6, 2], [-5, 5], [-16, 1], [-26, 6], [-37, 2], [-48, 5], [-59, 2], [-12, -3], [-33, -3]
    ];
    for (var si = 0; si < spots.length; si++) {
      var spx = spots[si][0];
      var spy = spots[si][1] + (spx < -35 ? w2 * 0.55 : w1 * 0.3);
      var isRed = si % 3 === 1;
      ctx.fillStyle = isRed ? "#f4df9e" : "rgba(235, 228, 182, 0.72)";
      ctx.beginPath();
      ctx.arc(spx, spy, isRed ? 2.5 : 1.9, 0, TAU);
      ctx.fill();
      if (isRed) {
        ctx.fillStyle = "#c93824";
        ctx.beginPath();
        ctx.arc(spx, spy, 1.35, 0, TAU);
        ctx.fill();
      }
    }

    // Breathing Gill Operculum
    var gillBreath = Math.sin(t * 3.2) * 1.4;
    ctx.strokeStyle = "#12221f";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(19 + gillBreath * 0.4, 0, 14, Math.PI * 0.68, Math.PI * 1.35, false);
    ctx.stroke();

    // Expressive Pectoral Fin (can gesture forward when finRaise > 0!)
    ctx.save();
    ctx.translate(12, 12);
    var pecAngle = lerp(0.35, -0.85, finWarm) + Math.sin(t * 4.6) * 0.14;
    ctx.rotate(pecAngle);
    ctx.fillStyle = "#e06d36";
    ctx.strokeStyle = "#12221f";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-12, 22, -24, 16);
    ctx.quadraticCurveTo(-18, 3, 0, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#faf6ea";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-1, 1);
    ctx.lineTo(-20, 15);
    ctx.stroke();
    ctx.restore();

    // Golden-ringed Brook Trout Eye
    ctx.fillStyle = "#f4d26b";
    ctx.strokeStyle = "#12221f";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(33, -5, 5.6, 0, TAU);
    ctx.fill();
    ctx.stroke();

    var lookX = o.lookX !== undefined ? o.lookX : 1.4;
    var lookY = o.lookY !== undefined ? o.lookY : 0.3;
    ctx.fillStyle = "#0d1414";
    ctx.beginPath();
    ctx.arc(33 + lookX, -5 + lookY, 3.1, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(34.5, -6.6, 1.2, 0, TAU);
    ctx.fill();

    // Optional hat/crest prop (e.g. parade leader crest in #28)
    if (o.paradeCrest) {
      ctx.save();
      ctx.translate(28, -19);
      ctx.rotate(-0.18);
      ctx.fillStyle = "#e3b34c";
      ctx.strokeStyle = "#14181a";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-9, 4);
      ctx.lineTo(10, 4);
      ctx.lineTo(7, -6);
      ctx.lineTo(-6, -5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Feather plume
      ctx.fillStyle = "#d94a2b";
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.quadraticCurveTo(-8, -18, -14, -14);
      ctx.quadraticCurveTo(-6, -7, 0, -5);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  // Turkey's subtle ghostly reflection on the inside lower-left porthole glass (homage to p26..p30 stills, animated!)
  function drawTurkeyGlassReflection(ctx, rs, sceneId) {
    var bob = Math.sin(rs.t * 2.3) * 3.5;
    var lean = rs.phase === "turkey" ? 12 : (rs.phase === "trout" ? 6 : 0);
    var rx = CX - 108 + lean;
    var ry = CY + 116 + bob;

    ctx.save();
    ctx.globalAlpha = 0.28 + 0.14 * rs.taskLightAmt;

    // Optional knitted scarf in #26 Act 3 ("cold tourist")
    if (sceneId === 26 && rs.phase === "trout") {
      var shiver = Math.sin(rs.t * 22) * 2.2;
      rx += shiver;
    }

    // Head & neck silhouette reflection
    ctx.fillStyle = "#d99f72";
    ctx.strokeStyle = "#5c311c";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(rx - 26, ry + 65);
    ctx.quadraticCurveTo(rx - 28, ry + 12, rx - 14, ry - 18);
    ctx.quadraticCurveTo(rx + 6, ry - 34, rx + 22, ry - 14);
    ctx.quadraticCurveTo(rx + 28, ry + 8, rx + 16, ry + 65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pointed curved beak (reaches closer in #30 Act 3 "bubble-popping beak")
    var beakReach = (sceneId === 30 && rs.phase === "trout") ? 10 * Math.sin(rs.t * 3.5) + 8 : 0;
    ctx.fillStyle = "#e8be66";
    ctx.beginPath();
    ctx.moveTo(rx + 18, ry - 14);
    ctx.lineTo(rx + 42 + beakReach, ry - 5);
    ctx.lineTo(rx + 19, ry + 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red-rust wattle swaying
    var wattleSwing = Math.sin(rs.t * 4.1) * 3;
    ctx.fillStyle = "#b83f28";
    ctx.beginPath();
    ctx.moveTo(rx + 21, ry + 1);
    ctx.quadraticCurveTo(rx + 28 + wattleSwing, ry + 18, rx + 19 + wattleSwing, ry + 23);
    ctx.quadraticCurveTo(rx + 12, ry + 16, rx + 16, ry + 1);
    ctx.closePath();
    ctx.fill();

    // Reflected eye
    ctx.fillStyle = "#f7ebd2";
    ctx.beginPath();
    ctx.arc(rx + 4, ry - 11, 6.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#181412";
    ctx.beginPath();
    ctx.arc(rx + 6, ry - 11, 3.2, 0, TAU);
    ctx.fill();

    if (sceneId === 26 && rs.phase === "trout") {
      // Cozy striped scarf wrapped around reflected neck
      ctx.fillStyle = "#c84628";
      ctx.fillRect(rx - 22, ry + 16, 42, 13);
      ctx.fillStyle = "#f2d272";
      ctx.fillRect(rx - 14, ry + 16, 8, 13);
      ctx.fillRect(rx + 4, ry + 16, 8, 13);
    }

    ctx.restore();
  }

  /* ==========================================================================
   * PORTHOLE #26 · BOILER — Glowing orange riverbed coal vent
   * Verne II.10 Coal Mine · Thermal Plume (SCION 51)
   * Turkey: "Boiling soup pot or Nautilus fuel?"
   * Trout:  "Sunken camp stove or cold tourist?"
   * ========================================================================== */
  function renderP26(ctx, rs) {
    var dy = rs.ballastAmt * 26 - 14; // Settling down into warm shelter behind stone lip!

    // Sky / deep water gradient warmed from below by coal bed
    var bg = ctx.createLinearGradient(CX, CY - 190, CX, CY + 190);
    bg.addColorStop(0, "#174f52");
    bg.addColorStop(0.55, "#236c68");
    bg.addColorStop(0.85, "#3a4f3f");
    bg.addColorStop(1, "#4d2814");
    ctx.fillStyle = bg;
    ctx.fillRect(CX - 200, CY - 200, 400, 400);

    // Far multiplane layer: Verne underwater coal-mine caldera ridges
    ctx.save();
    ctx.translate(0, dy * 0.45);
    ctx.fillStyle = "#164345";
    ctx.beginPath();
    ctx.moveTo(CX - 195, CY + 55);
    ctx.lineTo(CX - 135, CY - 15);
    ctx.lineTo(CX - 65, CY + 28);
    ctx.lineTo(CX + 55, CY + 22);
    ctx.lineTo(CX + 135, CY - 22);
    ctx.lineTo(CX + 195, CY + 45);
    ctx.lineTo(CX + 195, CY + 210);
    ctx.lineTo(CX - 195, CY + 210);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Thermal orange plume radial glow
    var pulse = 0.85 + 0.15 * Math.sin(rs.t * 4.5);
    var fireY = CY + 86 + dy;
    var fireGlow = ctx.createRadialGradient(CX, fireY, 8, CX, fireY - 55, 185);
    fireGlow.addColorStop(0, "rgba(255, 198, 72, " + (0.92 * pulse).toFixed(3) + ")");
    fireGlow.addColorStop(0.35, "rgba(255, 112, 24, " + (0.58 * pulse).toFixed(3) + ")");
    fireGlow.addColorStop(0.75, "rgba(210, 68, 18, 0.16)");
    fireGlow.addColorStop(1, "rgba(30, 90, 88, 0)");
    ctx.fillStyle = fireGlow;
    ctx.fillRect(CX - 200, CY - 200, 400, 400);

    // Harmonic S-curving Thermal Plume ribbons & rising golden steam/gas bubbles (SCION 51)
    ctx.save();
    for (var r = 0; r < 3; r++) {
      ctx.beginPath();
      for (var py = fireY; py >= CY - 175; py -= 10) {
        var prog = (fireY - py) / 260;
        var sway = Math.sin(prog * 6.5 - rs.t * 3.6 + r * 1.4) * (10 + prog * 22);
        var px = CX + (r - 1) * 9 + sway;
        if (py === fireY) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = r === 1 ? "rgba(255, 224, 130, 0.65)" : "rgba(255, 152, 58, 0.42)";
      ctx.lineWidth = r === 1 ? 8 : 4.5;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // Rising golden bubbles along the plume
    for (var b = 0; b < 18; b++) {
      var bLife = (rs.t * (0.42 + (b % 5) * 0.08) + hash1(b * 17.3)) % 1;
      var by = fireY - bLife * 255;
      var bx = CX + Math.sin(bLife * 7.2 - rs.t * 3.0 + b) * (8 + bLife * 24) + (hash1(b * 5.1) - 0.5) * 24;
      // In Act 2 (Turkey fork: Nautilus fuel), half the upper bubbles get sucked toward the right Nautilus intake pipe!
      if (rs.phase === "turkey" && b % 2 === 0 && bLife > 0.35) {
        var pull = smoothstep(0.35, 0.85, bLife) * smoothstep(2.1, 2.8, Math.max(rs.tl, 3.5));
        bx = lerp(bx, CX + 118, pull);
        by = lerp(by, CY - 42 + dy * 0.6, pull * 0.65);
      }
      var br = (3.2 + (b % 4) * 2.4) * (1 - bLife * 0.25);
      ctx.fillStyle = "rgba(255, 214, 122, 0.48)";
      ctx.strokeStyle = "#fff1be";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(bx - br * 0.32, by - br * 0.32, br * 0.28, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // Act 2 Visual Fork Props (Turkey Looks Out: "Boiling soup pot or Nautilus fuel?")
    if (rs.phase === "turkey") {
      var forkIn = rs.tl >= 2.0 ? smoothstep(2.0, 2.7, rs.tl) : 1;
      ctx.save();
      ctx.globalAlpha = forkIn;

      // Right side: Riveted brass "Nautilus" coal-gas intake funnel & spinning turbine wheel!
      var nx = CX + 124;
      var ny = CY - 44 + dy * 0.6;
      ctx.fillStyle = "#7a5b34";
      ctx.strokeStyle = "#151d1e";
      ctx.lineWidth = 2.2;
      // Pipe elbow from upper right
      ctx.beginPath();
      ctx.moveTo(CX + 195, ny - 26);
      ctx.lineTo(nx + 6, ny - 26);
      ctx.lineTo(nx - 14, ny + 12);
      ctx.lineTo(nx + 18, ny + 18);
      ctx.lineTo(nx + 24, ny - 4);
      ctx.lineTo(CX + 195, ny - 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Flared brass intake bell
      ctx.fillStyle = "#b8893e";
      ctx.beginPath();
      ctx.moveTo(nx - 24, ny + 26);
      ctx.lineTo(nx + 26, ny + 32);
      ctx.lineTo(nx + 16, ny + 12);
      ctx.lineTo(nx - 12, ny + 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Spinning pressure-turbine wheel on the pipe
      ctx.save();
      ctx.translate(nx + 18, ny - 15);
      ctx.rotate(rs.t * 4.8);
      ctx.strokeStyle = "#ffd97d";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, TAU);
      ctx.stroke();
      for (var sp = 0; sp < 4; sp++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(12, 0);
        ctx.stroke();
      }
      ctx.restore();

      // Left side of coal vent: Cast-iron cauldron pot-ear handles & bobbing soup-ladle kelp frond!
      var ladleBob = Math.sin(rs.t * 3.4) * 7;
      ctx.save();
      ctx.translate(CX - 32, fireY - 18 + ladleBob);
      ctx.rotate(-0.48 + Math.sin(rs.t * 2.4) * 0.12);
      ctx.strokeStyle = "#23170d";
      ctx.fillStyle = "#9c6334";
      ctx.lineWidth = 2.0;
      // Ladle handle + bowl
      roundRectPath(ctx, -46, -3, 48, 6, 3);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(4, 2, 11, 0, Math.PI, false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Expanding soup-steam aroma rings above cauldron
      for (var sr = 0; sr < 2; sr++) {
        var sProg = (rs.t * 0.55 + sr * 0.5) % 1;
        ctx.strokeStyle = "rgba(255, 236, 185, " + ((1 - sProg) * 0.55).toFixed(3) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(CX - 18, fireY - 40 - sProg * 75, 22 + sProg * 18, 6 + sProg * 4, 0, 0, TAU);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Midplane: Split Riverbed Chasm & Glowing Orange Coal Mound
    ctx.save();
    ctx.translate(0, dy);

    // Swaying river kelp fronds left & right
    var kelpClusters = [
      { x: CX - 138, y: CY + 82, n: 5, h: 95 },
      { x: CX + 128, y: CY + 96, n: 4, h: 82 }
    ];
    for (var kc = 0; kc < kelpClusters.length; kc++) {
      var kl = kelpClusters[kc];
      for (var kf = 0; kf < kl.n; kf++) {
        var kx = kl.x + (kf - 2) * 10;
        var kh = kl.h * (0.72 + (kf % 3) * 0.16);
        var bend = Math.sin(rs.t * 2.4 + kf * 0.9 + kc) * 12;
        ctx.strokeStyle = "#162d29";
        ctx.fillStyle = kf % 2 === 0 ? "#2f6454" : "#3f7a62";
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.moveTo(kx - 3, kl.y);
        ctx.quadraticCurveTo(kx + bend * 0.5 - 6, kl.y - kh * 0.5, kx + bend, kl.y - kh);
        ctx.quadraticCurveTo(kx + bend * 0.5 + 6, kl.y - kh * 0.45, kx + 4, kl.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // Left & Right split basalt ledges with deep central fissure (p26 homage)
    ctx.fillStyle = "#3c685e";
    ctx.strokeStyle = "#122120";
    ctx.lineWidth = 2.4;
    // Left cliff shelf
    ctx.beginPath();
    ctx.moveTo(CX - 195, CY + 58);
    ctx.lineTo(CX - 115, CY + 62);
    ctx.lineTo(CX - 48, CY + 86);
    ctx.lineTo(CX - 8, CY + 106);
    ctx.lineTo(CX - 14, CY + 195);
    ctx.lineTo(CX - 195, CY + 195);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right cliff shelf
    ctx.beginPath();
    ctx.moveTo(CX + 195, CY + 66);
    ctx.lineTo(CX + 110, CY + 74);
    ctx.lineTo(CX + 46, CY + 88);
    ctx.lineTo(CX + 10, CY + 106);
    ctx.lineTo(CX + 16, CY + 195);
    ctx.lineTo(CX + 195, CY + 195);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dark vertical canyon wall shadows flanking the glowing crack
    ctx.fillStyle = "#172d2e";
    ctx.beginPath();
    ctx.moveTo(CX - 48, CY + 86);
    ctx.lineTo(CX - 8, CY + 106);
    ctx.lineTo(CX - 14, CY + 195);
    ctx.lineTo(CX - 58, CY + 195);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(CX + 46, CY + 88);
    ctx.lineTo(CX + 10, CY + 106);
    ctx.lineTo(CX + 16, CY + 195);
    ctx.lineTo(CX + 58, CY + 195);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cauldron-ear iron rings on rim during Act 2 ("Boiling soup pot") or grate bars during Act 3 ("Sunken camp stove")
    if (rs.phase === "turkey") {
      ctx.strokeStyle = "#221a14";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(CX - 54, CY + 82, 9, Math.PI * 0.4, Math.PI * 1.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(CX + 54, CY + 82, 9, -Math.PI * 0.7, Math.PI * 0.6);
      ctx.stroke();
    } else if (rs.phase === "trout") {
      // Camp-stove wire grill grate across the coals!
      ctx.strokeStyle = "#2a1f18";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(CX - 48, CY + 68);
      ctx.lineTo(CX + 48, CY + 68);
      for (var gx = -36; gx <= 36; gx += 14) {
        ctx.moveTo(CX + gx, CY + 64);
        ctx.lineTo(CX + gx - 4, CY + 73);
      }
      ctx.stroke();
    }

    // Individual faceted glowing coals pulsing at different harmonic rates
    var coals = [
      [-36, 86, 12], [-22, 80, 13], [-6, 76, 14], [12, 78, 13], [28, 84, 12], [40, 90, 10],
      [-28, 92, 11], [-12, 89, 13], [5, 88, 13], [20, 92, 11], [-3, 99, 10], [3, 110, 8]
    ];
    for (var ci = 0; ci < coals.length; ci++) {
      var cc = coals[ci];
      var cGlow = 0.55 + 0.45 * Math.sin(rs.t * (3.8 + (ci % 4) * 0.7) + ci * 1.1);
      var rCoal = cc[2];
      var cg = ctx.createRadialGradient(CX + cc[0], CY + cc[1] - 2, 1, CX + cc[0], CY + cc[1], rCoal);
      cg.addColorStop(0, cGlow > 0.75 ? "#fff3a8" : "#ffc64c");
      cg.addColorStop(0.55, "#f26419");
      cg.addColorStop(1, "#4a2012");
      ctx.fillStyle = cg;
      ctx.strokeStyle = "#1f120b";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var v = 0; v < 6; v++) {
        var ang = (v / 6) * TAU + ci * 0.3;
        var rad = rCoal * (0.78 + 0.25 * hash1(ci * 11 + v));
        var vx = CX + cc[0] + Math.cos(ang) * rad;
        var vy = CY + cc[1] + Math.sin(ang) * rad * 0.72;
        if (v === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // Act 3: Articulated Spotted Brook Trout ("Sunken camp stove or cold tourist?")
    if (rs.troutPresence > 0.01) {
      var enter = easeOutBack(rs.troutPresence);
      // Between 6.8s and 9.2s, Brook Trout moves from warming fins above camp stove -> swimming close to inspect shivering Turkey!
      var inspectShift = rs.tl >= 5.6 ? smoothstep(7.2, 8.8, rs.tl) : 0;
      var tx = lerp(CX + 185, lerp(CX + 72, CX + 34, inspectShift), clamp(enter, 0, 1.05));
      var ty = lerp(CY - 15, lerp(CY + 8, CY + 24, inspectShift), clamp(enter, 0, 1)) + Math.sin(rs.t * 2.6) * 5;
      var tScale = lerp(0.88, 1.06, inspectShift);
      drawBrookTrout(ctx, tx, ty, tScale, -1, rs.t, {
        finRaise: 0.85, // warming pectoral fins right over the orange coals!
        pitch: lerp(0.08, 0.16, inspectShift),
        lookX: -1.6,
        lookY: 0.9
      });
    }

    drawWaterAtmosphere(ctx, rs, { baseCurrent: 0.85, duskVeil: 0.38, causticColor: "#ffd89c" });
    drawTurkeyGlassReflection(ctx, rs, 26);
  }

  /* ==========================================================================
   * PORTHOLE #27 · PORT M — Rabbit-ear CRT playing AlgaeWipe 3000
   * Flood Pulse #17 · Nam June Paik · Frame-in-Frame (SCION 27)
   * Turkey: "Surface distress signal or sponge ad?"
   * Trout:  "Rival TV channel or repairman’s van?"
   * ========================================================================== */
  function renderP27(ctx, rs) {
    var dy = rs.ballastAmt * 16;

    // Creek water gradient
    var bg = ctx.createLinearGradient(CX, CY - 190, CX, CY + 190);
    bg.addColorStop(0, "#1d6363");
    bg.addColorStop(0.62, "#267873");
    bg.addColorStop(1, "#1e4b48");
    ctx.fillStyle = bg;
    ctx.fillRect(CX - 200, CY - 200, 400, 400);

    // Nam June Paik background coaxial cables + creek pebbles & kelp
    ctx.save();
    ctx.translate(0, dy);
    ctx.strokeStyle = "#133534";
    ctx.lineWidth = 3.5;
    for (var cb = 0; cb < 3; cb++) {
      ctx.beginPath();
      ctx.moveTo(CX - 190, CY + 40 + cb * 22);
      ctx.bezierCurveTo(CX - 80, CY + 95 - cb * 15, CX + 60, CY + 20 + cb * 25, CX + 190, CY + 75);
      ctx.stroke();
    }

    // Riverbed shelf & flat stones
    ctx.fillStyle = "#3f7168";
    ctx.strokeStyle = "#122422";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(CX - 195, CY + 68);
    ctx.quadraticCurveTo(CX - 90, CY + 54, CX, CY + 72);
    ctx.quadraticCurveTo(CX + 100, CY + 82, CX + 195, CY + 62);
    ctx.lineTo(CX + 195, CY + 200);
    ctx.lineTo(CX - 195, CY + 200);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Left swaying reeds
    for (var rf = 0; rf < 5; rf++) {
      var rx = CX - 148 + rf * 11;
      var bend = Math.sin(rs.t * 2.2 + rf) * 9;
      ctx.fillStyle = "#2d6152";
      ctx.beginPath();
      ctx.moveTo(rx - 3, CY + 66);
      ctx.quadraticCurveTo(rx + bend - 5, CY + 15, rx + bend, CY - 32 + rf * 6);
      ctx.quadraticCurveTo(rx + bend + 4, CY + 18, rx + 3, CY + 66);
      ctx.fill();
      ctx.stroke();
    }

    // 3D-Projected Mid-Century Walnut CRT Television Set!
    var tvX = CX - 86;
    var tvY = CY - 68;
    var tvW = 166;
    var tvH = 122;

    // Peg legs
    ctx.fillStyle = "#593822";
    ctx.strokeStyle = "#14181a";
    ctx.lineWidth = 2;
    var legs = [[tvX + 14, tvY + tvH - 2, -6, 22], [tvX + tvW - 22, tvY + tvH - 4, 6, 20]];
    for (var li = 0; li < legs.length; li++) {
      ctx.beginPath();
      ctx.moveTo(legs[li][0], legs[li][1]);
      ctx.lineTo(legs[li][0] + legs[li][2], legs[li][1] + legs[li][3]);
      ctx.lineTo(legs[li][0] + legs[li][2] + 9, legs[li][1] + legs[li][3]);
      ctx.lineTo(legs[li][0] + 10, legs[li][1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 3D Woodgrain Side & Top Planes
    ctx.fillStyle = "#6e462a";
    ctx.beginPath();
    ctx.moveTo(tvX, tvY);
    ctx.lineTo(tvX - 22, tvY - 12);
    ctx.lineTo(tvX + tvW - 24, tvY - 18);
    ctx.lineTo(tvX + tvW, tvY - 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#54331d";
    ctx.beginPath();
    ctx.moveTo(tvX, tvY);
    ctx.lineTo(tvX - 22, tvY - 12);
    ctx.lineTo(tvX - 18, tvY + tvH - 12);
    ctx.lineTo(tvX, tvY + tvH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Front Walnut Cabinet Face
    ctx.fillStyle = "#8a5a36";
    roundRectPath(ctx, tvX, tvY - 4, tvW, tvH + 4, 6);
    ctx.fill();
    ctx.stroke();

    // Right Control Panel Strip (VHF / UHF rotary knobs + speaker grille)
    var cpX = tvX + tvW - 36;
    ctx.fillStyle = "#8f9894";
    roundRectPath(ctx, cpX, tvY + 5, 29, tvH - 14, 3);
    ctx.fill();
    ctx.stroke();

    var knobAngle = Math.floor(rs.t * 1.4) * 0.55 + Math.sin(rs.t * 6) * 0.04;
    for (var ki = 0; ki < 2; ki++) {
      var ky = tvY + 22 + ki * 26;
      ctx.fillStyle = "#cfd6d2";
      ctx.beginPath();
      ctx.arc(cpX + 14.5, ky, 9.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.save();
      ctx.translate(cpX + 14.5, ky);
      ctx.rotate(knobAngle * (ki === 0 ? 1 : -0.7));
      ctx.fillStyle = "#2b3230";
      ctx.fillRect(-2, -8.5, 4, 17);
      ctx.restore();
    }
    for (var sl = 0; sl < 6; sl++) {
      ctx.beginPath();
      ctx.moveTo(cpX + 5, tvY + 72 + sl * 6);
      ctx.lineTo(cpX + 24, tvY + 72 + sl * 6);
      ctx.stroke();
    }

    // Articulated Chrome Rabbit-Ear Antennas on top of CRT!
    var antBaseX = tvX + 68;
    var antBaseY = tvY - 11;
    var twitchL = rs.lampOn ? Math.sin(rs.t * 5.2) * 0.11 : -0.22;
    var twitchR = rs.lampOn ? Math.cos(rs.t * 4.7) * 0.11 : 0.22;

    ctx.strokeStyle = "#d9e4e2";
    ctx.lineWidth = 3.0;
    var tipLX = antBaseX - 48 + Math.sin(twitchL) * 18;
    var tipLY = antBaseY - 52;
    var tipRX = antBaseX + 44 + Math.sin(twitchR) * 18;
    var tipRY = antBaseY - 58;

    ctx.beginPath();
    ctx.moveTo(antBaseX - 4, antBaseY);
    ctx.lineTo(tipLX, tipLY);
    ctx.moveTo(antBaseX + 4, antBaseY);
    ctx.lineTo(tipRX, tipRY);
    ctx.stroke();

    ctx.strokeStyle = "#14181a";
    ctx.lineWidth = 1.2;
    ctx.fillStyle = "#eaf2f0";
    ctx.beginPath();
    ctx.arc(tipLX, tipLY, 3.6, 0, TAU);
    ctx.arc(tipRX, tipRY, 3.6, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Antenna hemisphere base
    ctx.fillStyle = "#9aa8a6";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(antBaseX, antBaseY + 2, 16, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Distress Radar Signal Rings from Rabbit Ears during Act 2 ("Surface distress signal or sponge ad?")
    if (rs.lampOn && (rs.phase === "turkey" || rs.phase === "trout")) {
      var sigAlpha = rs.phase === "turkey" ? 0.72 : 0.28;
      for (var rr = 0; rr < 3; rr++) {
        var rProg = (rs.t * 0.9 + rr * 0.33) % 1;
        var rad = 6 + rProg * 36;
        ctx.strokeStyle = "rgba(255, 224, 118, " + ((1 - rProg) * sigAlpha).toFixed(3) + ")";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(tipRX, tipRY, rad, -Math.PI * 0.85, -Math.PI * 0.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(tipLX, tipLY, rad * 0.85, -Math.PI * 0.85, -Math.PI * 0.15);
        ctx.stroke();
      }
    }

    // Curved CRT Glass Screen — Frame-in-Frame (SCION 27)!
    var scrX = tvX + 10;
    var scrY = tvY + 7;
    var scrW = tvW - 52;
    var scrH = tvH - 18;

    ctx.save();
    roundRectPath(ctx, scrX, scrY, scrW, scrH, 12);
    ctx.clip();

    if (!rs.lampOn) {
      // Unpowered / murky static snow before Lamp Toggle at t=1.0s!
      ctx.fillStyle = "#203332";
      ctx.fillRect(scrX, scrY, scrW, scrH);
      for (var sn = 0; sn < 55; sn++) {
        var sx = scrX + hash1(sn * 13.1 + Math.floor(rs.t * 12)) * scrW;
        var sy = scrY + hash1(sn * 29.7 + Math.floor(rs.t * 12)) * scrH;
        ctx.fillStyle = sn % 2 === 0 ? "rgba(210,235,230,0.45)" : "rgba(20,40,40,0.55)";
        ctx.fillRect(sx, sy, 6, 2.5);
      }
    } else {
      // Bright phosphor CRT glow!
      var scrGrad = ctx.createRadialGradient(scrX + scrW * 0.5, scrY + scrH * 0.5, 6, scrX + scrW * 0.5, scrY + scrH * 0.5, 80);
      scrGrad.addColorStop(0, "#f5fceb");
      scrGrad.addColorStop(0.75, "#c5e6d2");
      scrGrad.addColorStop(1, "#7cb098");
      ctx.fillStyle = scrGrad;
      ctx.fillRect(scrX, scrY, scrW, scrH);

      // Green algae patches on edges of CRT screen being wiped clean!
      var wipeSwing = Math.sin(rs.t * 4.2);
      var wipeClean = 0.5 + 0.35 * Math.sin(rs.t * 1.6);
      ctx.fillStyle = "#5f9341";
      // Lower-left & upper-right algae drips
      ctx.beginPath();
      ctx.moveTo(scrX, scrY + scrH);
      ctx.lineTo(scrX, scrY + scrH - 42 * (1 - wipeClean * 0.4));
      ctx.quadraticCurveTo(scrX + 24, scrY + scrH - 28, scrX + 38, scrY + scrH);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(scrX + scrW, scrY);
      ctx.lineTo(scrX + scrW - 36, scrY);
      ctx.quadraticCurveTo(scrX + scrW - 22, scrY + 28, scrX + scrW, scrY + 46 * (1 - wipeClean * 0.3));
      ctx.closePath();
      ctx.fill();

      // Dancing Yellow Porous Sponge Mascot ("AlgaeWipe 3000"!)
      var spBow = rs.phase === "trout" && rs.tl > 8.2 ? 0.25 : 0;
      var spX = scrX + scrW * 0.52 + wipeSwing * 8;
      var spY = scrY + scrH * 0.52 + Math.abs(wipeSwing) * -5;

      ctx.save();
      ctx.translate(spX, spY);
      ctx.rotate(wipeSwing * 0.16 + spBow);

      // Stick legs dancing
      ctx.strokeStyle = "#1c1f1a";
      ctx.lineWidth = 2.0;
      var legKick = Math.sin(rs.t * 8.4) * 6;
      ctx.beginPath();
      ctx.moveTo(-7, 20);
      ctx.lineTo(-10 - legKick * 0.4, 34);
      ctx.moveTo(8, 20);
      ctx.lineTo(11 + legKick * 0.4, 33);
      ctx.stroke();

      // Right arm & Left wiping arm with sparkling blue cloth!
      ctx.beginPath();
      ctx.moveTo(16, -2);
      ctx.lineTo(27, 5 + wipeSwing * 6);
      ctx.moveTo(-16, -2);
      ctx.lineTo(-29, -8 + wipeSwing * 11);
      ctx.stroke();

      // Blue wiping cloth in left hand
      ctx.fillStyle = "#6ac7e6";
      ctx.beginPath();
      ctx.arc(-31, -8 + wipeSwing * 11, 7.5, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // 3D Yellow Sponge Block
      ctx.fillStyle = "#d9ad2b";
      roundRectPath(ctx, -19, -22, 34, 42, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fce055";
      roundRectPath(ctx, -14, -20, 31, 40, 5);
      ctx.fill();
      ctx.stroke();

      // Sponge pores
      ctx.fillStyle = "#c9981e";
      var pores = [[-8, -13, 2.2], [6, -14, 2.6], [10, -4, 1.8], [-9, 9, 2.5], [7, 12, 2.2], [0, 15, 1.7]];
      for (var pi = 0; pi < pores.length; pi++) {
        ctx.beginPath();
        ctx.arc(pores[pi][0], pores[pi][1], pores[pi][2], 0, TAU);
        ctx.fill();
      }

      // Cheerful face
      ctx.fillStyle = "#1c1f1a";
      ctx.beginPath();
      ctx.arc(-4, -3, 2.1, 0, TAU);
      ctx.arc(7, -3, 2.1, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(1.5, 1, 4.2, 0.1, Math.PI - 0.1);
      ctx.stroke();

      // Sparkle star where cloth wipes!
      var stSpark = 0.5 + 0.5 * Math.sin(rs.t * 10);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.6;
      var sxp = -36;
      var syp = -16 + wipeSwing * 8;
      ctx.beginPath();
      ctx.moveTo(sxp - 5 * stSpark, syp);
      ctx.lineTo(sxp + 5 * stSpark, syp);
      ctx.moveTo(sxp, syp - 5 * stSpark);
      ctx.lineTo(sxp, syp + 5 * stSpark);
      ctx.stroke();

      ctx.restore();

      // Distress SOS corner beacon flash during Act 2 ("Surface distress signal or sponge ad?")
      if (rs.phase === "turkey" && Math.sin(rs.t * 7.5) > 0.15) {
        ctx.fillStyle = "rgba(217, 68, 38, 0.85)";
        ctx.beginPath();
        ctx.arc(scrX + 14, scrY + 13, 5.5, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(scrX + 14, scrY + 13, 9.5, 0, TAU);
        ctx.stroke();
      }

      // Subtle CRT horizontal scanlines
      ctx.fillStyle = "rgba(18, 36, 32, 0.10)";
      for (var yLine = scrY; yLine < scrY + scrH; yLine += 4) {
        ctx.fillRect(scrX, yLine, scrW, 1.4);
      }
    }
    ctx.restore();

    // Bezel stroke around CRT screen
    ctx.strokeStyle = "#14181a";
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, scrX, scrY, scrW, scrH, 12);
    ctx.stroke();

    // Two Foreground Creek Trout viewers!
    // In Act 1 & Act 2 they watch the CRT; in Act 3 ("Rival TV channel or repairman's van?") they swivel toward OUR porthole!
    var troutTurn = rs.troutPresence; // 0 = watching TV, 1 = looking right into our porthole!
    // Smaller companion trout on right stone
    drawBrookTrout(ctx, CX + 98, CY + 62 - troutTurn * 16, 0.62, -1, rs.t + 1.2, {
      pitch: lerp(-0.55, 0.08, troutTurn),
      finRaise: troutTurn * 0.7,
      lookX: -1.5
    });
    // Lead spotted Brook Trout rising right up to our porthole glass in Act 3!
    var leadX = lerp(CX + 38, rs.tl > 8.0 ? CX + 18 : CX + 44, troutTurn);
    var leadY = lerp(CY + 84, rs.tl > 8.0 ? CY + 28 : CY + 42, troutTurn) + Math.sin(rs.t * 2.8) * 4;
    var leadScale = lerp(0.68, 1.02, troutTurn);
    drawBrookTrout(ctx, leadX, leadY, leadScale, -1, rs.t, {
      pitch: lerp(-0.48, 0.12, troutTurn),
      finRaise: troutTurn * 0.9,
      lookX: -1.7,
      lookY: 0.4
    });

    ctx.restore();

    drawWaterAtmosphere(ctx, rs, { baseCurrent: 0.35, duskVeil: 0.52, causticColor: "#a8f5dc" });
    drawTurkeyGlassReflection(ctx, rs, 27);

    // In Act 3 late ("repairman's van?"), Turkey holds up a brass TV spanner wrench silhouette inside the glass!
    if (rs.phase === "trout" && (rs.tl > 7.4 || rs.t > 7.4)) {
      var wrIn = smoothstep(7.4, 8.2, Math.max(rs.tl, 8.3));
      ctx.save();
      ctx.globalAlpha = 0.55 * wrIn;
      ctx.translate(CX - 54, CY + 128 + Math.sin(rs.t * 3.5) * 4);
      ctx.rotate(0.32 + Math.sin(rs.t * 4) * 0.1);
      ctx.fillStyle = "#d9a84e";
      ctx.strokeStyle = "#2b1a0e";
      ctx.lineWidth = 2;
      ctx.fillRect(-5, -28, 10, 44);
      ctx.strokeRect(-5, -28, 10, 44);
      ctx.beginPath();
      ctx.arc(0, -32, 12, 0.3, Math.PI * 1.7);
      ctx.lineTo(0, -28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ==========================================================================
   * PORTHOLE #28 · STBD M — Silver minnows streaming in S-curve weave
   * Verne II.4 Tunnel · Flock Ribbon (SCION 06 — John Whitney Harmonic Motion)
   * Turkey: "Living lasso or highway exit arrow?"
   * Trout:  "Parade float leader or shiny tin minnow?"
   * ========================================================================== */
  function renderP28(ctx, rs) {
    var dy = rs.ballastAmt * 24 - 12;

    // Deep emerald-cyan tunnel water
    var bg = ctx.createRadialGradient(CX + 10, CY - 30 + dy, 20, CX, CY + 20, 220);
    bg.addColorStop(0, "#196d73");
    bg.addColorStop(0.65, "#0d4a50");
    bg.addColorStop(1, "#07282c");
    ctx.fillStyle = bg;
    ctx.fillRect(CX - 200, CY - 200, 400, 400);

    // Submerged Mossy Limestone Bridge Tunnel Arch (Verne II.4 & p28 homage)
    ctx.save();
    ctx.translate(0, dy);

    // Stone masonry wall above arch
    ctx.fillStyle = "#3f6a52";
    ctx.strokeStyle = "#11241c";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.rect(CX - 195, CY - 195, 390, 185);
    ctx.moveTo(CX - 132, CY - 10);
    ctx.arc(CX, CY - 10, 132, Math.PI, TAU, false);
    ctx.closePath();
    ctx.fill("evenodd");

    // Voussoir arch stones around the tunnel ring
    var numStones = 15;
    for (var stIdx = 0; stIdx < numStones; stIdx++) {
      var a0 = Math.PI + (stIdx / numStones) * Math.PI;
      var a1 = Math.PI + ((stIdx + 1) / numStones) * Math.PI;
      ctx.fillStyle = stIdx % 2 === 0 ? "#5a8662" : "#4b7655";
      ctx.strokeStyle = "#13261d";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(CX, CY - 10, 158, a0, a1);
      ctx.arc(CX, CY - 10, 130, a1, a0, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Left & right bridge abutment boulders
    ctx.fillStyle = "#2b5242";
    ctx.beginPath();
    ctx.moveTo(CX - 195, CY - 12);
    ctx.lineTo(CX - 122, CY - 12);
    ctx.lineTo(CX - 112, CY + 12);
    ctx.lineTo(CX - 195, CY + 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(CX + 195, CY - 12);
    ctx.lineTo(CX + 122, CY - 12);
    ctx.lineTo(CX + 114, CY + 12);
    ctx.lineTo(CX + 195, CY + 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dark riverbed ripple bands
    for (var rb = 0; rb < 5; rb++) {
      var ry = CY + 25 + rb * 32;
      ctx.fillStyle = "rgba(8, 34, 38, 0.35)";
      ctx.beginPath();
      ctx.ellipse(CX + Math.sin(rs.t + rb) * 16, ry, 145 - rb * 8, 9, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // SCION 06 Harmonic Silver Minnow Flock (85 individually articulated silver minnows!)
    // Mode morphs smoothly:
    // - Unballasted Act 1 (0.8s): loose swirling scatter
    // - Ballasted (1.8s) & Act 2 (2.0-5.6s): crisp S-curve highway exit arrow (with subtle lasso loop modulation!)
    // - Act 3 (5.6-10.0s): parade loop around porthole (6.8s) -> sleek parallel school welcoming tin minnow (9.2s)!
    var coherence = Math.max(rs.ballastAmt, rs.phase !== "act1" ? 1 : 0);
    var lassoMorph = rs.phase === "turkey" ? Math.max(0, Math.sin((rs.tl - 2.0) * 1.15)) * 0.45 : 0;
    var schoolParallel = rs.phase === "trout" ? smoothstep(7.3, 8.8, Math.max(rs.tl, rs.t > 8 ? 9 : rs.tl)) : 0;

    function sCurvePoint(u) {
      // u in [0, 1] from bottom-left entrance to upper-center tunnel exit arrow tip
      var xArrow = CX + Math.sin(u * Math.PI * 2.05 - 2.35) * (105 * (1 - u * 0.52)) + (u > 0.78 ? (u - 0.78) * 160 : 0);
      var yArrow = (CY + 148) - u * 238 + dy * 0.65;

      if (lassoMorph > 0.01 && u < 0.65) {
        var lu = u / 0.65;
        var lx = CX + Math.cos(lu * TAU + rs.t * 1.6) * 86;
        var ly = CY + 45 + Math.sin(lu * TAU + rs.t * 1.6) * 58;
        xArrow = lerp(xArrow, lx, lassoMorph);
        yArrow = lerp(yArrow, ly, lassoMorph);
      }

      if (rs.troutPresence > 0.01) {
        // Parade ribbon circling porthole -> aligning parallel left-to-right!
        var ang = u * Math.PI * 1.75 - rs.t * 1.35;
        var pxParade = CX + Math.cos(ang) * 126;
        var pyParade = CY + 12 + Math.sin(ang) * 104;

        var pxSchool = CX + 155 - u * 310;
        var pySchool = CY + 32 + Math.sin(u * 5.0 - rs.t * 3.2) * 22;

        var tx = lerp(pxParade, pxSchool, schoolParallel);
        var ty = lerp(pyParade, pySchool, schoolParallel);
        xArrow = lerp(xArrow, tx, rs.troutPresence);
        yArrow = lerp(yArrow, ty, rs.troutPresence);
      }
      return { x: xArrow, y: yArrow };
    }

    var N_MINNOWS = 84;
    for (var mi = 0; mi < N_MINNOWS; mi++) {
      // Continuous streaming u along ribbon!
      var streamU = ((mi / N_MINNOWS) + rs.t * 0.14) % 1;
      var lane = ((mi % 5) - 2); // 5 parallel lanes across ribbon width

      var p0 = sCurvePoint(streamU);
      var p1 = sCurvePoint(Math.min(1, streamU + 0.025));
      var heading = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      var nx = -Math.sin(heading);
      var ny = Math.cos(heading);

      // Form crisp arrowhead at u in [0.80, 0.98] during Act 2 ("highway exit arrow?")!
      var ribbonHalfW = 24 * (1 - streamU * 0.45);
      if (rs.phase === "turkey" && streamU > 0.80) {
        var tipFrac = (streamU - 0.80) / 0.20; // 0 at barb base -> 1 at sharp tip!
        ribbonHalfW = 42 * (1 - tipFrac);
      }

      var fx = p0.x + nx * (lane * 0.45) * ribbonHalfW;
      var fy = p0.y + ny * (lane * 0.45) * ribbonHalfW;

      // Unballasted scatter offset at t=0.8s
      if (coherence < 0.99) {
        var sx = CX + Math.cos(mi * 2.3 + rs.t * 1.9) * (50 + (mi % 7) * 18);
        var sy = CY + Math.sin(mi * 1.7 - rs.t * 1.5) * (45 + (mi % 6) * 18);
        fx = lerp(sx, fx, coherence);
        fy = lerp(sy, fy, coherence);
        heading = lerp(mi * 0.8 + rs.t, heading, coherence);
      }

      // Harmonic specular flash wave racing up the minnow ribbon!
      var glint = 0.5 + 0.5 * Math.sin(streamU * 18 - rs.t * 9.5 + lane * 0.5);
      var wag = Math.sin(rs.t * 14 + mi * 0.9) * 2.6;

      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(heading);

      ctx.fillStyle = glint > 0.7 ? "#ffffff" : (glint > 0.35 ? "#d8ecee" : "#96bcc2");
      ctx.strokeStyle = "#10282c";
      ctx.lineWidth = 1.1;

      ctx.beginPath();
      ctx.moveTo(9, 0);
      ctx.quadraticCurveTo(2, -3.6, -6, wag * 0.4);
      ctx.lineTo(-12, -4 + wag);
      ctx.lineTo(-9.5, wag * 0.6);
      ctx.lineTo(-12, 4 + wag);
      ctx.lineTo(-6, wag * 0.4);
      ctx.quadraticCurveTo(2, 3.6, 9, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tiny minnow eye
      ctx.fillStyle = "#0e1d20";
      ctx.beginPath();
      ctx.arc(5.2, -0.8, 0.9, 0, TAU);
      ctx.fill();

      ctx.restore();
    }

    // Act 3: Spotted Brook Trout Parade Float Leader ("Parade float leader or shiny tin minnow?")
    if (rs.troutPresence > 0.01) {
      var enter = easeOutBack(rs.troutPresence);
      var tx = lerp(CX + 180, lerp(CX + 32, CX - 8, schoolParallel), clamp(enter, 0, 1.04));
      var ty = lerp(CY - 30, lerp(CY - 12, CY - 24, schoolParallel), clamp(enter, 0, 1)) + Math.sin(rs.t * 3.0) * 5;
      drawBrookTrout(ctx, tx, ty, 0.96, -1, rs.t, {
        paradeCrest: true,
        finRaise: 1 - schoolParallel * 0.5,
        pitch: lerp(0.12, 0.0, schoolParallel),
        lookX: -1.4
      });
    }

    drawWaterAtmosphere(ctx, rs, { baseCurrent: 0.9, duskVeil: 0.36, causticColor: "#a6f0ea" });
    drawTurkeyGlassReflection(ctx, rs, 28);
  }

  /* ==========================================================================
   * PORTHOLE #29 · DECK — Open photo album shedding sepia snapshots
   * Perec & Bober: Ellis Island (1980) · Drift Archive (SCION 39)
   * Turkey: "Sunken mailbag or town scrapbook?"
   * Trout:  "Paparazzi camera or lost picture frame?"
   * ========================================================================== */
  function drawSepiaSnapshot(ctx, w, h, kind, hasPostmark) {
    // Deckle-edged cream-sepia snapshot card
    ctx.fillStyle = "#efe0be";
    ctx.strokeStyle = "#2b1f14";
    ctx.lineWidth = 1.6;
    roundRectPath(ctx, -w * 0.5, -h * 0.5, w, h, 2);
    ctx.fill();
    ctx.stroke();

    // Inner sepia image border
    var iw = w - 10;
    var ih = h - 10;
    ctx.fillStyle = "#cbb082";
    ctx.strokeStyle = "#4d3822";
    ctx.lineWidth = 1.1;
    ctx.fillRect(-iw * 0.5, -ih * 0.5, iw, ih);
    ctx.strokeRect(-iw * 0.5, -ih * 0.5, iw, ih);

    // Hand-inked miniature town memory inside snapshot!
    ctx.fillStyle = "#6e5030";
    ctx.strokeStyle = "#322212";
    ctx.lineWidth = 1.2;
    if (kind === 0) {
      // Old Log Cabin
      ctx.fillRect(-12, -2, 24, 13);
      ctx.strokeRect(-12, -2, 24, 13);
      ctx.beginPath();
      ctx.moveTo(-16, -2);
      ctx.lineTo(0, -13);
      ctx.lineTo(16, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (kind === 1) {
      // Covered Wooden Bridge over creek
      ctx.beginPath();
      ctx.moveTo(-18, 6);
      ctx.lineTo(-14, -7);
      ctx.lineTo(14, -9);
      ctx.lineTo(18, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#2a1b0e";
      ctx.fillRect(-15, -3, 7, 8);
    } else {
      // River Bell Post & Steeple
      ctx.beginPath();
      ctx.moveTo(-9, 11);
      ctx.lineTo(-7, -4);
      ctx.lineTo(0, -15);
      ctx.lineTo(7, -4);
      ctx.lineTo(9, 11);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Postal wave cancellation / stamp corner ("Sunken mailbag" cue!)
    if (hasPostmark) {
      ctx.strokeStyle = "rgba(158, 52, 28, 0.85)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(w * 0.26, -h * 0.24, 5.5, 0, TAU);
      ctx.stroke();
      for (var wl = -1; wl <= 1; wl++) {
        ctx.beginPath();
        ctx.moveTo(w * 0.02, -h * 0.24 + wl * 3);
        ctx.lineTo(w * 0.22, -h * 0.24 + wl * 3);
        ctx.stroke();
      }
    }
  }

  function renderP29(ctx, rs) {
    var dy = rs.ballastAmt * 16;

    var bg = ctx.createLinearGradient(CX, CY - 190, CX, CY + 190);
    bg.addColorStop(0, "#246e6d");
    bg.addColorStop(0.65, "#2b7e78");
    bg.addColorStop(1, "#1e4b47");
    ctx.fillStyle = bg;
    ctx.fillRect(CX - 200, CY - 200, 400, 400);

    ctx.save();
    ctx.translate(0, dy);

    // Mossy cobble creek bed
    ctx.fillStyle = "#35645c";
    ctx.strokeStyle = "#122422";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(CX - 195, CY + 58);
    ctx.quadraticCurveTo(CX - 60, CY + 48, CX + 195, CY + 66);
    ctx.lineTo(CX + 195, CY + 200);
    ctx.lineTo(CX - 195, CY + 200);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // River cobbles & left/right vallisneria reeds
    var cobbles = [[-125, 115, 28, 13], [-68, 138, 22, 10], [28, 132, 32, 13], [98, 118, 26, 12]];
    for (var ci = 0; ci < cobbles.length; ci++) {
      var cb = cobbles[ci];
      ctx.fillStyle = ci % 2 === 0 ? "#4c7d6b" : "#3d6b5e";
      ctx.beginPath();
      ctx.ellipse(CX + cb[0], CY + cb[1], cb[2], cb[3], 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    for (var side = -1; side <= 1; side += 2) {
      for (var rf = 0; rf < 5; rf++) {
        var rx = CX + side * (135 + rf * 8) - rf * 4;
        var bend = Math.sin(rs.t * 2.1 + rf + side) * 10;
        ctx.fillStyle = "#2b6251";
        ctx.beginPath();
        ctx.moveTo(rx - 3, CY + 78);
        ctx.quadraticCurveTo(rx + bend - 4, CY + 24, rx + bend, CY - 26 + rf * 9);
        ctx.quadraticCurveTo(rx + bend + 4, CY + 26, rx + 3, CY + 78);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Open Embossed Leather Photo Album on Riverbed!
    var albX = CX - 10;
    var albY = CY + 82;
    var openAmt = smoothstep(0.4, 1.6, Math.max(rs.tl, rs.lampOn ? 1.8 : rs.tl));

    // Maroon leather covers + spine
    ctx.fillStyle = "#6e3322";
    ctx.strokeStyle = "#18120e";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(albX, albY + 16);
    ctx.lineTo(albX - 118, albY + 24);
    ctx.lineTo(albX - 88, albY - 34);
    ctx.lineTo(albX, albY - 18);
    ctx.lineTo(albX + 88, albY - 36);
    ctx.lineTo(albX + 122, albY + 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Stacked parchment pages left & right
    ctx.fillStyle = "#dfd0ae";
    ctx.beginPath();
    ctx.moveTo(albX, albY + 8);
    ctx.quadraticCurveTo(albX - 55, albY - 4, albX - 106, albY + 14);
    ctx.lineTo(albX - 82, albY - 34);
    ctx.quadraticCurveTo(albX - 38, albY - 42, albX, albY - 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e8dac0";
    ctx.beginPath();
    ctx.moveTo(albX, albY + 8);
    ctx.quadraticCurveTo(albX + 52, albY - 10, albX + 110, albY + 6);
    ctx.lineTo(albX + 82, albY - 38);
    ctx.quadraticCurveTo(albX + 38, albY - 46, albX, albY - 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Black scrapbook photo-corner mounts on pages ("town scrapbook?" cue!)
    ctx.fillStyle = "#221c16";
    var mounts = [[-68, -14], [-34, -18], [32, -20], [66, -16]];
    for (var mi = 0; mi < mounts.length; mi++) {
      ctx.fillRect(albX + mounts[mi][0], albY + mounts[mi][1], 18, 12);
    }

    // Actively turning middle parchment page fluttering in the current!
    var pageWave = (rs.t * 0.48) % 1;
    var pAngle = lerp(-0.25, -2.65, smoothstep(0.05, 0.92, pageWave)) * openAmt - (1 - openAmt) * 0.3;
    ctx.save();
    ctx.translate(albX, albY - 6);
    ctx.fillStyle = "#f2e5c7";
    ctx.strokeStyle = "#2b1f14";
    ctx.lineWidth = 1.8;
    var tipX = Math.cos(pAngle) * 88;
    var tipY = Math.sin(pAngle) * 44 - 12;
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.quadraticCurveTo(tipX * 0.55, tipY + 14, tipX, tipY + 18);
    ctx.lineTo(tipX * 0.85, tipY - 22);
    ctx.quadraticCurveTo(tipX * 0.45, -26, 0, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 6 Helically Drifting Sepia Snapshots shedding upward into the creek!
    var numPhotos = rs.lampOn ? 6 : 2;
    for (var pi = 0; pi < numPhotos; pi++) {
      var pCycle = ((rs.t * 0.19) + pi * 0.165) % 1;
      var lift = smoothstep(0.0, 0.95, pCycle);
      var px = albX + Math.sin(lift * 4.8 + pi * 1.4) * (24 + lift * 58) + (pi % 2 === 0 ? 18 : -16) * lift;
      var py = (albY - 24) - lift * 215;
      var prot = Math.sin(rs.t * 1.6 + pi * 2.1) * 0.32 + (pi - 2.5) * 0.08;
      var tiltScaleX = 0.72 + 0.28 * Math.cos(rs.t * 1.9 + pi);

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(prot);
      ctx.scale(tiltScaleX, 1);
      drawSepiaSnapshot(ctx, 54, 40, pi % 3, pi % 2 === 0);
      ctx.restore();
    }

    // Act 3: Spotted Brook Trout + Camera Flash ("Paparazzi camera") -> Drifting Picture Frame Mat ("lost picture frame?")
    if (rs.troutPresence > 0.01) {
      var enter = easeOutBack(rs.troutPresence);
      var frameBeat = rs.tl >= 5.6 ? smoothstep(7.5, 8.8, rs.tl) : 0;
      var tx = lerp(CX + 188, lerp(CX + 62, CX + 78, frameBeat), clamp(enter, 0, 1.04));
      var ty = lerp(CY - 6, lerp(CY + 4, CY + 14, frameBeat), clamp(enter, 0, 1)) + Math.sin(rs.t * 2.7) * 4;

      drawBrookTrout(ctx, tx, ty, 0.92, -1, rs.t, {
        finRaise: 0.75,
        pitch: -0.06,
        lookX: -1.6
      });

      // Paparazzi camera shutter flash pulse around t = 6.6..7.1s!
      var flashPulse = rs.tl >= 6.5 && rs.tl <= 7.2 ? Math.sin(((rs.tl - 6.5) / 0.7) * Math.PI) : 0;
      if (flashPulse > 0.02) {
        ctx.save();
        var fg = ctx.createRadialGradient(CX, CY, 15, CX, CY, 185);
        fg.addColorStop(0, "rgba(255, 250, 224, " + (0.68 * flashPulse).toFixed(3) + ")");
        fg.addColorStop(1, "rgba(255, 232, 165, 0)");
        ctx.fillStyle = fg;
        ctx.fillRect(CX - 195, CY - 195, 390, 390);
        ctx.restore();
      }

      // By t = 9.2s, an ornate open Sepia Picture-Frame Mat drifts against the lower-left/center glass, framing Turkey!
      if (frameBeat > 0.02) {
        ctx.save();
        ctx.globalAlpha = 0.92 * frameBeat;
        var fx = lerp(CX + 10, CX - 86, frameBeat);
        var fy = lerp(CY - 40, CY + 95, frameBeat) + Math.sin(rs.t * 2.2) * 3;
        ctx.translate(fx, fy);
        ctx.rotate(-0.08 + Math.sin(rs.t * 1.5) * 0.04);
        ctx.fillStyle = "#e8d2a6";
        ctx.strokeStyle = "#3a2614";
        ctx.lineWidth = 2.2;
        // Outer mat minus inner window cutout!
        ctx.beginPath();
        ctx.rect(-56, -46, 112, 92);
        ctx.rect(-38, -30, 76, 60);
        ctx.fill("evenodd");
        ctx.strokeRect(-56, -46, 112, 92);
        ctx.strokeRect(-38, -30, 76, 60);
        ctx.restore();
      }
    }

    ctx.restore();

    drawWaterAtmosphere(ctx, rs, { baseCurrent: 0.35, duskVeil: 0.48, causticColor: "#bfece0" });
    drawTurkeyGlassReflection(ctx, rs, 29);
  }

  /* ==========================================================================
   * PORTHOLE #30 · TOP — Six glowing vowel bubbles under bridge
   * Juster: Phantom Tollbooth (1961) · Lipogram Password (Oulipo)
   * Turkey: "Floating mines or Surface Lock code?"
   * Trout:  "Bubble-popping beak or spelling-bee buzzer?"
   * ========================================================================== */
  function renderP30(ctx, rs) {
    var dy = rs.ballastAmt * 18;

    // Luminous underwater archway backdrop
    var bg = ctx.createRadialGradient(CX, CY + 10 + dy, 18, CX, CY, 210);
    bg.addColorStop(0, "#46a89e");
    bg.addColorStop(0.52, "#1f6866");
    bg.addColorStop(1, "#0f3234");
    ctx.fillStyle = bg;
    ctx.fillRect(CX - 200, CY - 200, 400, 400);

    ctx.save();
    ctx.translate(0, dy);

    // Receding Vaulted Stone Bridge Tunnel (p30 homage — 3 barrel-vault rings!)
    var rings = [
      { r: 178, col: "#3c6154" },
      { r: 146, col: "#2b4b42" },
      { r: 112, col: "#1e3833" }
    ];
    for (var ri = 0; ri < rings.length; ri++) {
      var rg = rings[ri];
      ctx.fillStyle = rg.col;
      ctx.strokeStyle = "#0e1d1a";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.rect(CX - 195, CY - 195, 390, 222);
      ctx.moveTo(CX - rg.r, CY + 27);
      ctx.arc(CX, CY + 27, rg.r, Math.PI, TAU, false);
      ctx.closePath();
      ctx.fill("evenodd");

      // Radial masonry joints on each vault ring
      var nJoints = 13;
      for (var ji = 1; ji < nJoints; ji++) {
        var ang = Math.PI + (ji / nJoints) * Math.PI;
        var rIn = ri < 2 ? rings[ri + 1].r : 84;
        ctx.beginPath();
        ctx.moveTo(CX + Math.cos(ang) * rIn, CY + 27 + Math.sin(ang) * rIn);
        ctx.lineTo(CX + Math.cos(ang) * rg.r, CY + 27 + Math.sin(ang) * rg.r);
        ctx.stroke();
      }
    }

    // Keystone Surface-Lock Brass Gear at crown of bridge arch!
    var lockTurn = rs.phase === "turkey" ? smoothstep(3.0, 4.8, Math.max(rs.tl, 4.0)) * 1.4 : (rs.phase === "trout" ? 1.4 + rs.t * 0.25 : 0);
    ctx.save();
    ctx.translate(CX, CY - 118);
    ctx.fillStyle = "#4c6c5d";
    ctx.strokeStyle = "#0e1d1a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-22, -18);
    ctx.lineTo(22, -18);
    ctx.lineTo(17, 18);
    ctx.lineTo(-17, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.rotate(lockTurn);
    ctx.fillStyle = rs.lampOn ? "#e0b24c" : "#6c6448";
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#182421";
    ctx.fillRect(-2.5, -7, 5, 14);
    ctx.restore();

    // Hanging bridge ivy / watercress vines
    var vines = [-145, -118, 118, 148];
    for (var vi = 0; vi < vines.length; vi++) {
      var vx = CX + vines[vi];
      ctx.strokeStyle = "#173328";
      ctx.fillStyle = "#3f7652";
      ctx.lineWidth = 1.6;
      for (var lf = 0; lf < 5; lf++) {
        var ly = CY - 135 + lf * 16;
        var sway = Math.sin(rs.t * 2 + vi + lf) * 4;
        ctx.beginPath();
        ctx.ellipse(vx + sway, ly, 6, 3.5, lf * 0.5, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Creek floor under the bridge
    ctx.fillStyle = "#224c48";
    ctx.strokeStyle = "#0e2220";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CX - 195, CY + 27);
    ctx.lineTo(CX + 195, CY + 27);
    ctx.lineTo(CX + 195, CY + 200);
    ctx.lineTo(CX - 195, CY + 200);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Act 3: Spotted Brook Trout guarding & ringing the vowel bubbles!
    var buzzerChord = rs.phase === "trout" ? smoothstep(8.0, 8.9, Math.max(rs.tl, rs.t > 8.5 ? 9.2 : rs.tl)) : 0;
    if (rs.troutPresence > 0.01) {
      var enter = easeOutBack(rs.troutPresence);
      var tx = lerp(CX + 185, lerp(CX + 68, CX + 92, buzzerChord), clamp(enter, 0, 1.04));
      var ty = lerp(CY + 52, lerp(CY + 44, CY + 54, buzzerChord), clamp(enter, 0, 1)) + Math.sin(rs.t * 3.1) * 4;
      drawBrookTrout(ctx, tx, ty, 0.94, -1, rs.t, {
        finRaise: 0.8,
        pitch: -0.14 + buzzerChord * 0.18,
        lookX: -1.6,
        lookY: -0.7
      });
    }

    // SIX GLOWING VOWEL BUBBLES: A · E · I · O · U · Y
    var vowels = ["A", "E", "I", "O", "U", "Y"];
    var mineFear = rs.phase === "turkey" && rs.tl < 3.35 ? smoothstep(2.0, 2.5, rs.tl) * (1 - smoothstep(3.05, 3.45, rs.tl)) : 0;
    var lipogramCode = rs.phase === "turkey" ? smoothstep(3.2, 3.7, Math.max(rs.tl, rs.tl >= 2 ? rs.tl : 4.0)) : 0;

    for (var i = 0; i < 6; i++) {
      var bx = CX - 135 + i * 54;
      var bob = Math.sin(rs.t * 2.7 + i * 0.95) * 6.5;
      var by = CY + 2 + bob - buzzerChord * Math.sin((i / 5) * Math.PI) * 18;

      // In Act 3 ~6.8s, Brook Trout nudges bubble 'A'/'E' slightly up/right away from Turkey's beak!
      if (rs.phase === "trout" && i <= 1 && buzzerChord < 0.5) {
        bx += 7 * rs.troutPresence;
        by -= 8 * rs.troutPresence;
      }

      var rBub = 22.5;
      // Ignition sequence at t = 1.0..1.75s when Lamp switches ON!
      var litAmt = rs.lampAmt * smoothstep(0.95 + i * 0.08, 1.25 + i * 0.08, Math.max(rs.tl, rs.lampOn ? 2.0 : 0));

      // Oulipo Lipogram Password rule on 'E' (i === 1) during Act 2!
      var isLipogramE = (i === 1) && lipogramCode > 0.35;

      // Golden code-beam thread up to bridge keystone lock during Act 2!
      if (lipogramCode > 0.25 && !isLipogramE && litAmt > 0.5) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 224, 122, " + (0.42 * lipogramCode).toFixed(3) + ")";
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(bx, by - rBub);
        ctx.lineTo(CX, CY - 106);
        ctx.stroke();
        ctx.restore();
      }

      // Tethered mine chain & tiny contact prongs when Turkey briefly fears "Floating mines?"
      if (mineFear > 0.05) {
        ctx.save();
        ctx.globalAlpha = mineFear;
        ctx.strokeStyle = "#182826";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx, by + rBub);
        ctx.lineTo(bx, CY + 70);
        ctx.stroke();
        for (var mp = 0; mp < 6; mp++) {
          var ma = (mp / 6) * TAU + rs.t;
          ctx.beginPath();
          ctx.moveTo(bx + Math.cos(ma) * rBub, by + Math.sin(ma) * rBub);
          ctx.lineTo(bx + Math.cos(ma) * (rBub + 6), by + Math.sin(ma) * (rBub + 6));
          ctx.stroke();
        }
        ctx.restore();
      }

      // Spelling-bee buzzer acoustic chime rings at t ~ 9.2s!
      if (buzzerChord > 0.1) {
        var ringP = (rs.t * 1.6 + i * 0.15) % 1;
        ctx.strokeStyle = "rgba(255, 236, 152, " + ((1 - ringP) * 0.65 * buzzerChord).toFixed(3) + ")";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(bx, by, rBub + ringP * 18, 0, TAU);
        ctx.stroke();
      }

      // Outer golden halo
      if (litAmt > 0.05 && !isLipogramE) {
        var hg = ctx.createRadialGradient(bx, by, 4, bx, by, rBub * 1.65);
        hg.addColorStop(0, "rgba(255, 232, 138, " + (0.62 * litAmt).toFixed(3) + ")");
        hg.addColorStop(1, "rgba(255, 198, 72, 0)");
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(bx, by, rBub * 1.65, 0, TAU);
        ctx.fill();
      }

      // Bubble sphere body
      ctx.save();
      if (isLipogramE) {
        // Oulipo Lipogram 'E' blinks into a ghostly dashed ring!
        ctx.fillStyle = "rgba(38, 92, 88, 0.38)";
        ctx.strokeStyle = "#ffd97d";
        ctx.lineWidth = 2.2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.arc(bx, by, rBub, 0, TAU);
        ctx.fill();
        ctx.stroke();
      } else {
        var bGrad = ctx.createRadialGradient(bx - 6, by - 6, 3, bx, by, rBub);
        if (litAmt > 0.3) {
          bGrad.addColorStop(0, "#fff8d4");
          bGrad.addColorStop(0.58, "rgba(238, 194, 92, 0.82)");
          bGrad.addColorStop(1, "rgba(138, 102, 34, 0.88)");
        } else {
          bGrad.addColorStop(0, "rgba(155, 212, 206, 0.45)");
          bGrad.addColorStop(1, "rgba(28, 68, 66, 0.72)");
        }
        ctx.fillStyle = bGrad;
        ctx.strokeStyle = "#142422";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(bx, by, rBub, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }

      // Specular soap-bubble crescent
      ctx.strokeStyle = "rgba(255, 255, 255, 0.78)";
      ctx.lineWidth = 2.2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(bx, by, rBub - 4, -Math.PI * 0.82, -Math.PI * 0.42);
      ctx.stroke();

      // Glowing filament Vowel inside the bubble (diegetic world object!)
      ctx.font = "700 22px ui-sans-serif, -apple-system, Helvetica, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (isLipogramE) {
        ctx.strokeStyle = "rgba(255, 232, 152, 0.52)";
        ctx.lineWidth = 1.4;
        ctx.strokeText(vowels[i], bx, by + 1);
      } else {
        ctx.fillStyle = litAmt > 0.3 ? "#fffdf0" : "rgba(195, 232, 226, 0.52)";
        ctx.strokeStyle = litAmt > 0.3 ? "#7a4e12" : "#132c2a";
        ctx.lineWidth = 2.6;
        ctx.strokeText(vowels[i], bx, by + 1);
        ctx.fillText(vowels[i], bx, by + 1);
      }
      ctx.restore();
    }

    ctx.restore();

    drawWaterAtmosphere(ctx, rs, { baseCurrent: 0.3, duskVeil: 0.45, causticColor: "#fff0b5" });
    drawTurkeyGlassReflection(ctx, rs, 30);
  }

  /* ==========================================================================
   * SETUP A BREAD-TIN COCKPIT & EDITORIAL STORY STRIP
   * ========================================================================== */
  function drawPortholeBezelAndGlassGlint(ctx, rs) {
    // Inner glass rim shadow + subtle curved reflection arc
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS, 0, TAU);
    ctx.clip();

    var rimShade = ctx.createRadialGradient(CX, CY, R_GLASS - 26, CX, CY, R_GLASS + 2);
    rimShade.addColorStop(0, "rgba(0,0,0,0)");
    rimShade.addColorStop(0.75, "rgba(8, 20, 22, 0.18)");
    rimShade.addColorStop(1, "rgba(6, 14, 16, 0.62)");
    ctx.fillStyle = rimShade;
    ctx.fillRect(CX - R_GLASS, CY - R_GLASS, R_GLASS * 2, R_GLASS * 2);

    // Classic curved glass specular highlight upper-left
    ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS - 14, -Math.PI * 0.86, -Math.PI * 0.56);
    ctx.stroke();
    ctx.restore();

    // Left heavy cast-iron barrel hinge (9 o'clock)
    ctx.save();
    ctx.fillStyle = "#3a3a38";
    ctx.strokeStyle = "#121516";
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, CX - R_OUTER_BRASS - 22, CY - 42, 30, 84, 5);
    ctx.fill();
    ctx.stroke();
    roundRectPath(ctx, CX - R_OUTER_BRASS - 28, CY - 46, 12, 92, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#6c6e6a";
    ctx.beginPath();
    ctx.arc(CX - R_OUTER_BRASS - 9, CY - 26, 4, 0, TAU);
    ctx.arc(CX - R_OUTER_BRASS - 9, CY + 26, 4, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Antique Brass Outer Ring (`r_glass = 185` -> `r_outer = 214`)
    var brassGrad = ctx.createLinearGradient(CX - 180, CY - 180, CX + 180, CY + 180);
    brassGrad.addColorStop(0, "#d8b46a");
    brassGrad.addColorStop(0.35, "#9c7838");
    brassGrad.addColorStop(0.7, "#bfa055");
    brassGrad.addColorStop(1, "#6e5122");

    ctx.save();
    ctx.fillStyle = brassGrad;
    ctx.strokeStyle = "#14181a";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(CX, CY, R_OUTER_BRASS, 0, TAU, false);
    ctx.arc(CX, CY, R_GLASS, 0, TAU, true);
    ctx.fill("evenodd");

    ctx.beginPath();
    ctx.arc(CX, CY, R_OUTER_BRASS, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CX, CY, R_INNER_BEVEL, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS, 0, TAU);
    ctx.stroke();

    // INVARIANT: Distinctive 2-o'clock Rim Chip on inner brass bevel! (-28 degrees)
    var chipAng = -0.49; // ~2 o'clock
    var cxChip = CX + Math.cos(chipAng) * (R_GLASS + 3);
    var cyChip = CY + Math.sin(chipAng) * (R_GLASS + 3);
    ctx.save();
    ctx.translate(cxChip, cyChip);
    ctx.rotate(chipAng);
    // Dark missing brass notch + bright raw fractured brass edge!
    ctx.fillStyle = "#111f21";
    ctx.beginPath();
    ctx.moveTo(-4, -12);
    ctx.lineTo(13, -6);
    ctx.lineTo(7, 2);
    ctx.lineTo(14, 9);
    ctx.lineTo(-4, 12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ffe082";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-2, -11);
    ctx.lineTo(12, -5);
    ctx.lineTo(6, 2);
    ctx.lineTo(13, 8);
    ctx.lineTo(-2, 11);
    ctx.stroke();
    ctx.restore();

    // Upper-right interior marker tab (from setup-a.webp at ~1:30)
    ctx.fillStyle = "#d9ab62";
    ctx.strokeStyle = "#14181a";
    ctx.lineWidth = 1.8;
    roundRectPath(ctx, CX + 98, CY - 144, 34, 15, 6);
    ctx.fill();
    ctx.stroke();

    // Right Offset Brass Dog-Ear Latch (~3:15 position)
    var lx = CX + R_OUTER_BRASS - 6;
    var ly = CY + 14;
    ctx.fillStyle = "#b89248";
    ctx.strokeStyle = "#14181a";
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, lx - 8, ly - 32, 18, 64, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#d8b468";
    ctx.beginPath();
    ctx.moveTo(lx - 18, ly - 7);
    ctx.lineTo(lx + 24, ly - 10);
    ctx.lineTo(lx + 24, ly + 10);
    ctx.lineTo(lx - 18, ly + 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 6 Riveted Hexagonal Brass Die-Bolts (#1..#6 clockwise from 12 o'clock)
    var boltAngles = [-Math.PI / 2, -Math.PI / 6 + 0.14, Math.PI / 6, Math.PI / 2, (5 * Math.PI) / 6, (-5 * Math.PI) / 6];
    var rBolt = 200;
    for (var bi = 0; bi < 6; bi++) {
      var faceNum = bi + 1;
      var ba = boltAngles[bi];
      var bx = CX + Math.cos(ba) * rBolt;
      var by = CY + Math.sin(ba) * rBolt;

      var isOddActive = rs.phase === "turkey" && (faceNum % 2 === 1);
      var isEvenActive = rs.phase === "trout" && (faceNum % 2 === 0);
      var isRolled = rs.roll === faceNum;

      if (isRolled || isOddActive || isEvenActive) {
        ctx.save();
        var haloCol = isRolled
          ? "rgba(255, 228, 108, 0.88)"
          : isOddActive
            ? "rgba(218, 104, 56, 0.55)"
            : "rgba(92, 214, 210, 0.55)";
        ctx.fillStyle = haloCol;
        ctx.beginPath();
        ctx.arc(bx, by, isRolled ? 16 : 12.5, 0, TAU);
        ctx.fill();
        ctx.restore();
      }

      // Hex head
      ctx.fillStyle = isRolled ? "#ffe588" : "#c8a356";
      ctx.strokeStyle = "#14181a";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var hv = 0; hv < 6; hv++) {
        var ha = (hv / 6) * TAU + Math.PI / 6;
        var hx = bx + Math.cos(ha) * 9.5;
        var hy = by + Math.sin(ha) * 9.5;
        if (hv === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glinting 4-point star flare on the rolled 1d6 bolt!
      if (isRolled) {
        var flare = 0.75 + 0.25 * Math.sin(rs.t * 8);
        ctx.save();
        ctx.translate(bx, by);
        ctx.strokeStyle = "#fffbe0";
        ctx.lineWidth = 2.2;
        var fl = 19 * flare;
        ctx.beginPath();
        ctx.moveTo(-fl, 0);
        ctx.lineTo(fl, 0);
        ctx.moveTo(0, -fl);
        ctx.lineTo(0, fl);
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  function drawCockpitInterior(ctx, meta, rs) {
    // 1. Exterior dark hull ground
    ctx.fillStyle = "#0b1517";
    ctx.fillRect(0, 0, 1280, STRIP_Y);

    // 2. Oval Bread-Roll Tin Cockpit Wall (`#132427`) with unmistakable RIGHT-SIDE DENT!
    var tinX = 76;
    var tinY = 12;
    var tinW = 1128; // right wall at x = 1204
    var tinH = 514;  // bottom wall at y = 526
    var rad = 88;

    function breadTinPath() {
      ctx.beginPath();
      ctx.moveTo(tinX + rad, tinY);
      ctx.lineTo(tinX + tinW - rad, tinY);
      ctx.quadraticCurveTo(tinX + tinW, tinY, tinX + tinW, tinY + rad);
      // Right wall goes down to y=205, then DENTS INWARD by 42px around y=262!
      ctx.lineTo(tinX + tinW, 202);
      ctx.bezierCurveTo(tinX + tinW - 6, 224, tinX + tinW - 44, 238, tinX + tinW - 42, 265);
      ctx.bezierCurveTo(tinX + tinW - 40, 292, tinX + tinW - 5, 306, tinX + tinW, 328);
      ctx.lineTo(tinX + tinW, tinY + tinH - rad);
      ctx.quadraticCurveTo(tinX + tinW, tinY + tinH, tinX + tinW - rad, tinY + tinH);
      ctx.lineTo(tinX + rad, tinY + tinH);
      ctx.quadraticCurveTo(tinX, tinY + tinH, tinX, tinY + tinH - rad);
      ctx.lineTo(tinX, tinY + rad);
      ctx.quadraticCurveTo(tinX, tinY, tinX + rad, tinY);
      ctx.closePath();
    }

    ctx.save();
    breadTinPath();
    ctx.fillStyle = "#132427";
    ctx.fill();

    // Warm overhead Amber Task-Light Wash inside the tin
    if (rs.taskLightAmt > 0.02) {
      ctx.save();
      ctx.clip();
      var taskWash = ctx.createRadialGradient(CX, 28, 16, CX, 240, 560);
      taskWash.addColorStop(0, "rgba(237, 180, 115, " + (0.28 * rs.taskLightAmt).toFixed(3) + ")");
      taskWash.addColorStop(0.55, "rgba(210, 145, 78, " + (0.09 * rs.taskLightAmt).toFixed(3) + ")");
      taskWash.addColorStop(1, "rgba(19, 36, 39, 0)");
      ctx.fillStyle = taskWash;
      ctx.fillRect(tinX, tinY, tinW, tinH);
      ctx.restore();
    }

    // Rolled bread-tin rim double bevel
    breadTinPath();
    ctx.strokeStyle = "#5c8884";
    ctx.lineWidth = 3.2;
    ctx.stroke();

    // Hammered crease marks emphasizing the Right-Side Dent!
    ctx.strokeStyle = "#7fb2ab";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(1182, 224);
    ctx.quadraticCurveTo(1148, 265, 1184, 305);
    ctx.stroke();
    ctx.strokeStyle = "#0a1416";
    ctx.beginPath();
    ctx.moveTo(1174, 236);
    ctx.quadraticCurveTo(1142, 265, 1175, 294);
    ctx.stroke();

    // Overhead Ceiling Ribs & Amber Task-Light Bar (matching setup-a.webp!)
    ctx.strokeStyle = "#8a6845";
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(132, 82);
    ctx.lineTo(222, 28);
    ctx.lineTo(1058, 28);
    ctx.lineTo(1148, 82);
    ctx.stroke();

    // Overhead Amber Task-Light Bar Fixture (`cx = 640, y = 21..35`)
    ctx.fillStyle = rs.taskLightAmt > 0.35 ? "#f5be6b" : "#785c3a";
    ctx.strokeStyle = "#14181a";
    ctx.lineWidth = 2.0;
    roundRectPath(ctx, CX - 56, 20, 112, 15, 7);
    ctx.fill();
    ctx.stroke();

    // Top-Left Pitch / Trim Clinometer Gauge (tilts physically when Ballast engages!)
    var clX = 198;
    var clY = 112;
    ctx.fillStyle = "#8f7139";
    ctx.strokeStyle = "#14181a";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(clX, clY, 32, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1a2f32";
    ctx.beginPath();
    ctx.arc(clX, clY, 25, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.translate(clX, clY);
    ctx.rotate(-0.16 + rs.ballastAmt * 0.16 + Math.sin(rs.t * 2.1) * 0.03 * (1 - rs.ballastAmt * 0.7));
    ctx.strokeStyle = "#a3dac8";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(18, 0);
    ctx.stroke();
    ctx.fillStyle = "#edb473";
    ctx.beginPath();
    ctx.arc(0, -3, 3.5, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Top-Right `1 Day of Air` Brass Dial (`cx = 1072, cy = 112`)
    var airX = 1072;
    var airY = 112;
    ctx.fillStyle = "#b59148";
    ctx.strokeStyle = "#14181a";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(airX, airY, 39, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f5ecd8";
    ctx.beginPath();
    ctx.arc(airX, airY, 31, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Colored gauge arc + ticks
    ctx.strokeStyle = "#2d6846";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(airX, airY, 24, -Math.PI * 0.8, Math.PI * 0.15);
    ctx.stroke();
    ctx.strokeStyle = "#9e3d1c";
    ctx.beginPath();
    ctx.arc(airX, airY, 24, -Math.PI * 1.15, -Math.PI * 0.8);
    ctx.stroke();
    for (var tk = 0; tk <= 6; tk++) {
      var ta = -Math.PI * 1.15 + (tk / 6) * (Math.PI * 1.3);
      ctx.strokeStyle = "#14181a";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(airX + Math.cos(ta) * 20, airY + Math.sin(ta) * 20);
      ctx.lineTo(airX + Math.cos(ta) * 27, airY + Math.sin(ta) * 27);
      ctx.stroke();
    }
    // Air needle slowly ticking slightly across 10s
    var airAng = 0.25 - (rs.tl / 10.0) * 0.18 + Math.sin(rs.t * 9) * 0.015;
    ctx.save();
    ctx.translate(airX, airY);
    ctx.rotate(airAng);
    ctx.strokeStyle = "#9e3d1c";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(22, 0);
    ctx.stroke();
    ctx.fillStyle = "#14181a";
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, TAU);
    ctx.fill();
    ctx.restore();

    if (rs.showCaptions) {
      ctx.fillStyle = "#b6c8c4";
      ctx.font = "600 10.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("1 DAY OF AIR", airX, airY + 53);
      ctx.fillText("TRIM", clX, clY + 46);
    }

    // 3. BOTTOM INSTRUMENT DECK:
    // (a) Bottom-Left: `Ballast / Single Slot` (`x = 200..418, y = 456..514`)
    var slX = 200;
    var slY = 456;
    var slW = 216;
    var slH = 56;
    ctx.fillStyle = "#192e31";
    ctx.strokeStyle = "#8cbcb4";
    ctx.lineWidth = 2.0;
    roundRectPath(ctx, slX, slY, slW, slH, 10);
    ctx.fill();
    ctx.stroke();

    // Recessed single socket rail
    ctx.fillStyle = "#0e1b1d";
    ctx.strokeStyle = "#5b8580";
    ctx.lineWidth = 1.6;
    ctx.fillRect(slX + 42, slY + 16, 132, 24);
    ctx.strokeRect(slX + 42, slY + 16, 132, 24);

    // Sliding Rectangular Ballast Module with handle!
    var balSlideX = lerp(slX - 28, slX + 46, rs.ballastAmt);
    var balSlideY = lerp(slY + 6, slY + 18, rs.ballastAmt);
    ctx.fillStyle = rs.ballastOn ? "#6d9d91" : "#5a6868";
    ctx.strokeStyle = "#14181a";
    ctx.lineWidth = 2.0;
    roundRectPath(ctx, balSlideX, balSlideY, 124, 20, 4);
    ctx.fill();
    ctx.stroke();
    // Brass grip handle on ballast tray
    ctx.strokeStyle = "#edb473";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(balSlideX + 42, balSlideY + 10);
    ctx.lineTo(balSlideX + 82, balSlideY + 10);
    ctx.stroke();
    // Lock indicator LED pin
    ctx.fillStyle = rs.ballastOn ? "#7cf0c5" : "#324646";
    ctx.beginPath();
    ctx.arc(slX + 194, slY + 28, 5, 0, TAU);
    ctx.fill();

    // (b) Bottom-Center: `Chalk Chart Under Glass` (`x = 476..804, y = 476..520`)
    var chX = 476;
    var chY = 475;
    var chW = 328;
    var chH = 44;
    ctx.fillStyle = "#182b2e";
    ctx.strokeStyle = "#9bc6be";
    ctx.lineWidth = 2.0;
    roundRectPath(ctx, chX, chY, chW, chH, 9);
    ctx.fill();
    ctx.stroke();

    // Faint river bend bank lines on slate
    ctx.strokeStyle = "rgba(163, 218, 200, 0.25)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(chX + 18, chY + 12);
    ctx.quadraticCurveTo(chX + 160, chY + 6, chX + 310, chY + 14);
    ctx.moveTo(chX + 18, chY + 35);
    ctx.quadraticCurveTo(chX + 165, chY + 39, chX + 310, chY + 32);
    ctx.stroke();

    // Progressively drawn Chalk Route Polyline (matching setup-a.webp!)
    var pts = [
      [chX + 28, chY + 32],
      [chX + 108, chY + 15],
      [chX + 182, chY + 29],
      [chX + 258, chY + 17],
      [chX + 296, chY + 21]
    ];
    if (rs.chartProgress > 0.01) {
      var totalSegs = pts.length - 1;
      var scaledP = rs.chartProgress * totalSegs;
      ctx.save();
      ctx.strokeStyle = "#f7efdc";
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var si = 0; si < totalSegs; si++) {
        var segAmt = clamp(scaledP - si, 0, 1);
        if (segAmt > 0) {
          ctx.lineTo(lerp(pts[si][0], pts[si + 1][0], segAmt), lerp(pts[si][1], pts[si + 1][1], segAmt));
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // Gold Landmark Dot on Chalk Chart at t >= 5.6s!
    if (rs.hasLandmarkDot) {
      var dotPop = rs.tl >= 5.6 ? smoothstep(5.6, 6.2, rs.tl) : 1;
      var gx = pts[3][0];
      var gy = pts[3][1];
      ctx.save();
      ctx.fillStyle = "rgba(255, 212, 82, " + (0.35 * dotPop).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(gx, gy, 10 * dotPop, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#ffd452";
      ctx.strokeStyle = "#14181a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(gx, gy, 5.2 * dotPop, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Glass glare diagonal across Chalk Chart
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(chX + 54, chY + 4);
    ctx.lineTo(chX + 34, chY + chH - 4);
    ctx.stroke();

    // (c) Bottom-Right: `Lamp Toggle` (`x = 875..985, y = 450..514`)
    var tgX = 878;
    var tgY = 452;
    var tgW = 104;
    var tgH = 60;
    ctx.fillStyle = "#2b2a26";
    ctx.strokeStyle = "#edb473";
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, tgX, tgY, tgW, tgH, 11);
    ctx.fill();
    ctx.stroke();

    // Toggle pivot + articulated bat lever!
    var pivX = tgX + 48;
    var pivY = tgY + 34;
    var leverAng = lerp(Math.PI * 0.72, -Math.PI * 0.34, rs.lampAmt); // DOWN-LEFT = OFF, UP-RIGHT = ON!
    ctx.strokeStyle = "#f2efe6";
    ctx.lineWidth = 6.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pivX, pivY);
    ctx.lineTo(pivX + Math.cos(leverAng) * 24, pivY + Math.sin(leverAng) * 24);
    ctx.stroke();

    ctx.fillStyle = "#edb473";
    ctx.strokeStyle = "#14181a";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(pivX, pivY, 8.5, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Amber indicator jewel beside toggle
    ctx.fillStyle = rs.lampOn ? "#ffbe45" : "#453624";
    ctx.beginPath();
    ctx.arc(tgX + 82, tgY + 20, 5.5, 0, TAU);
    ctx.fill();

    // 3D-Projected Brass/Ivory `1d6` Die on shelf right of Chalk Chart when rolled!
    if (rs.roll >= 1 && rs.roll <= 6) {
      var dieBounce = rs.tl >= 5.7 && rs.tl <= 6.45 ? Math.abs(Math.sin((rs.tl - 5.7) * 14)) * (1 - (rs.tl - 5.7) / 0.75) * 18 : 0;
      var dx = 834;
      var dyDie = 492 - dieBounce;
      ctx.save();
      ctx.translate(dx, dyDie);
      ctx.rotate(dieBounce * 0.06);
      ctx.fillStyle = "#faf3de";
      ctx.strokeStyle = "#14181a";
      ctx.lineWidth = 2.0;
      roundRectPath(ctx, -15, -15, 30, 30, 5);
      ctx.fill();
      ctx.stroke();

      // Pips for 1..6
      var pipCol = rs.roll <= 2 ? "#1d596e" : rs.roll <= 4 ? "#2d6846" : "#9e3d1c";
      ctx.fillStyle = pipCol;
      var pipMap = {
        1: [[0, 0]],
        2: [[-6, -6], [6, 6]],
        3: [[-7, -7], [0, 0], [7, 7]],
        4: [[-6, -6], [6, -6], [-6, 6], [6, 6]],
        5: [[-6, -6], [6, -6], [0, 0], [-6, 6], [6, 6]],
        6: [[-6, -7], [6, -7], [-6, 0], [6, 0], [-6, 7], [6, 7]]
      }[rs.roll];
      for (var pIdx = 0; pIdx < pipMap.length; pIdx++) {
        ctx.beginPath();
        ctx.arc(pipMap[pIdx][0], pipMap[pIdx][1], 2.5, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // Optional clean micro-labels on cockpit controls ONLY when showCaptions !== false!
    if (rs.showCaptions) {
      ctx.fillStyle = "#b6c8c4";
      ctx.font = "600 10.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("BALLAST / SINGLE SLOT", slX, slY - 7);
      ctx.textAlign = "center";
      ctx.fillText("CHALK CHART UNDER GLASS", CX, chY - 5);
      ctx.textAlign = "right";
      ctx.fillText("LAMP TOGGLE", tgX + tgW, tgY - 7);
    }

    ctx.restore();
  }

  // Articulated Foreground Turkey Pilot Wing reaching to operate control in Act 1 (`t = 0.45..1.65s`)!
  function drawTurkeyPilotWing(ctx, meta, rs) {
    // Reach curve: peaks at t = 0.72..1.12s (so at t = 0.8s in contact sheet, wing is visibly ON the target control!)
    var reachUp = smoothstep(0.35, 0.72, rs.tl);
    var reachDown = 1 - smoothstep(1.18, 1.72, rs.tl);
    var reachAmt = reachUp * reachDown;

    var baseShoulderX = meta.defaultTool === "lamp" ? 745 : 465;
    var baseShoulderY = 548;

    var restTipX = meta.defaultTool === "lamp" ? 785 : 445;
    var restTipY = 516;

    var targetX = meta.defaultTool === "lamp" ? 926 : 312;
    var targetY = meta.defaultTool === "lamp" ? 482 : 484;

    // Subtle push detent at t ~ 0.98..1.06s
    var pushSnap = rs.tl >= 0.94 && rs.tl <= 1.12 ? Math.sin(((rs.tl - 0.94) / 0.18) * Math.PI) * 8 : 0;

    var tipX = lerp(restTipX, targetX + (meta.defaultTool === "lamp" ? pushSnap : -pushSnap), reachAmt);
    var tipY = lerp(restTipY, targetY - pushSnap * 0.5, reachAmt);

    // During Act 2 ("Turkey Looks Out"), wing lifts slightly to rim with curiosity!
    if (rs.phase === "turkey" && reachAmt < 0.05) {
      var pointAmt = 0.5 + 0.5 * Math.sin((rs.tl - 2.0) * 1.6);
      baseShoulderX = 455;
      tipX = lerp(448, 488, pointAmt);
      tipY = lerp(512, 438, pointAmt);
    } else if (rs.phase === "trout" && reachAmt < 0.05) {
      baseShoulderX = 445;
      tipX = 458 + Math.sin(rs.t * 3.0) * 8;
      tipY = 488 + Math.cos(rs.t * 2.5) * 5;
    }

    var elbowX = (baseShoulderX + tipX) * 0.5 + (meta.defaultTool === "lamp" && reachAmt > 0.1 ? 26 : -24);
    var elbowY = Math.max(tipY + 28, (baseShoulderY + tipY) * 0.5 + 16);

    ctx.save();
    // Upper & forearm feathered wing silhouette with warm copper-bronze edging
    ctx.fillStyle = "#3d2216";
    ctx.strokeStyle = "#120b08";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(baseShoulderX - 24, baseShoulderY);
    ctx.quadraticCurveTo(elbowX - 20, elbowY, tipX - 14, tipY + 6);
    ctx.quadraticCurveTo(tipX, tipY - 10, tipX + 14, tipY + 4);
    ctx.quadraticCurveTo(elbowX + 20, elbowY + 12, baseShoulderX + 24, baseShoulderY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Individual primary wing feathers at the tip!
    var wingAng = Math.atan2(tipY - elbowY, tipX - elbowX);
    ctx.save();
    ctx.translate(tipX, tipY);
    ctx.rotate(wingAng);
    for (var pf = -2; pf <= 2; pf++) {
      ctx.save();
      ctx.rotate(pf * 0.2);
      ctx.fillStyle = pf % 2 === 0 ? "#6e3820" : "#8c4a28";
      ctx.strokeStyle = "#140d0a";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.quadraticCurveTo(10, -5, 22, 0);
      ctx.quadraticCurveTo(10, 5, -6, 0);
      ctx.fill();
      ctx.stroke();
      // Pale buff feather tip bar
      ctx.strokeStyle = "#dfc08e";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(16, -2.5);
      ctx.lineTo(16, 2.5);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    ctx.restore();
  }

  // Lower Editorial Story Strip (`y = 536..720` when `showCaptions !== false`; clean unlabeled wooden bench apron when `showCaptions === false`)
  function drawLowerStrip(ctx, meta, rs) {
    if (!rs.showCaptions) {
      // PAELEO Blind-Critic Invariant: ZERO text labels anywhere on canvas!
      // Render tactile dark-timber & riveted tin bench apron cleanly below y = 536.
      var benchGrad = ctx.createLinearGradient(0, STRIP_Y, 0, 720);
      benchGrad.addColorStop(0, "#162628");
      benchGrad.addColorStop(0.18, "#261c15");
      benchGrad.addColorStop(1, "#17110d");
      ctx.fillStyle = benchGrad;
      ctx.fillRect(0, STRIP_Y, 1280, 720 - STRIP_Y);

      ctx.strokeStyle = "#395252";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, STRIP_Y + 1);
      ctx.lineTo(1280, STRIP_Y + 1);
      ctx.stroke();

      // Subtle woodplank grain lines + coiled cable & spare tool cradle on the Works bench (purely visual!)
      ctx.strokeStyle = "rgba(255, 225, 185, 0.06)";
      ctx.lineWidth = 1.5;
      for (var py = STRIP_Y + 38; py < 720; py += 42) {
        ctx.beginPath();
        ctx.moveTo(60, py);
        ctx.lineTo(1220, py);
        ctx.stroke();
      }
      // Spare module resting in left bench cradle when unused
      ctx.fillStyle = "#1f2e30";
      ctx.strokeStyle = "#486462";
      ctx.lineWidth = 1.8;
      roundRectPath(ctx, 198, STRIP_Y + 24, 150, 34, 6);
      ctx.fill();
      ctx.stroke();
      return;
    }

    // Editorial Cream Paper Strip (`#faf8f3`, `y = 536..720`)
    ctx.fillStyle = "#faf8f3";
    ctx.fillRect(0, STRIP_Y, 1280, 720 - STRIP_Y);

    ctx.fillStyle = "#14181a";
    ctx.fillRect(0, STRIP_Y, 1280, 2.5);

    // Left Column (`x = 48..425`): Station, Rim Clue, SCION Rule
    ctx.fillStyle = "#14181a";
    ctx.font = "700 13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(meta.station.toUpperCase() + "  ·  " + meta.scionRule, 48, STRIP_Y + 34);

    ctx.fillStyle = "#394246";
    ctx.font = "400 16.5px Georgia, 'Iowan Old Style', serif";
    ctx.fillText("Rim Clue: " + meta.clue, 48, STRIP_Y + 62);

    // Active Control Status Pill
    var toolSummary =
      "LAMP: " + (rs.lampOn ? "ON" : "OFF") +
      "   ·   BALLAST: " + (rs.ballastOn ? "FITTED" : "OPEN") +
      (rs.roll > 0 ? "   ·   1D6 BOLT #" + rs.roll + (rs.roll <= 2 ? " (PROBABLE)" : rs.roll <= 4 ? " (PLAUSIBLE)" : " (PREPOSTEROUS)") : "");
    ctx.fillStyle = "#2d6846";
    ctx.font = "600 11.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText(toolSummary, 48, STRIP_Y + 92);

    // Subtle vertical divider
    ctx.strokeStyle = "#dfdad0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(476, STRIP_Y + 20);
    ctx.lineTo(476, 700);
    ctx.stroke();

    // Right Main Story Beat Column (`x = 504..1232`)
    var kicker = "";
    var kickerCol = "#2d6846";
    var headline = "";
    var subline = "";

    if (rs.phase === "act1") {
      kicker = "SETUP A · BREAD-TIN COCKPIT OPERATION (0.0–2.0S)";
      kickerCol = "#2d6846";
      headline = meta.defaultTool === "lamp"
        ? "Turkey reaches right and flips the Lamp Toggle to pierce the creek dusk."
        : "Turkey slides the Ballast Tray into the Single Slot to settle behind shelter.";
      subline = "2-o’clock chipped brass port · Chalk chart center · Two views waiting across the glass.";
    } else if (rs.phase === "turkey") {
      kicker = "FIRST PASS · TURKEY LOOKS OUT  (ODD FACES 1 · 3 · 5)";
      kickerCol = "#9e3d1c";
      headline = "“" + meta.turkeyFork + "”";
      subline = "Also across the cut — Trout Looking In: “" + meta.troutFork + "”";
    } else {
      kicker = "SECOND PASS · TROUT LOOKS IN  (EVEN FACES 2 · 4 · 6)";
      kickerCol = "#1d596e";
      headline = "“" + meta.troutFork + "”";
      subline = "Paired with Turkey’s Pass: “" + meta.turkeyFork + "”  ·  Chart landmark verified.";
    }

    ctx.fillStyle = kickerCol;
    ctx.font = "700 12.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText(kicker, 504, STRIP_Y + 36);

    ctx.fillStyle = "#14181a";
    ctx.font = rs.phase === "act1"
      ? "400 22px Georgia, 'Iowan Old Style', serif"
      : "400 29px Georgia, 'Iowan Old Style', serif";
    ctx.fillText(headline, 504, STRIP_Y + 76);

    ctx.fillStyle = "#6b767c";
    ctx.font = "400 14.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(subline, 504, STRIP_Y + 108);

    // Bottom timeline progress hairline (`y = 708`)
    var barX = 48;
    var barW = 1184;
    var barY = 706;
    ctx.fillStyle = "#e5e0d5";
    ctx.fillRect(barX, barY, barW, 4);
    ctx.fillStyle = kickerCol;
    ctx.fillRect(barX, barY, barW * clamp(rs.tl / 10.0, 0, 1), 4);
    // Cut markers at 2.0s and 5.6s
    ctx.fillStyle = "#14181a";
    ctx.fillRect(barX + barW * 0.2, barY - 2, 2, 8);
    ctx.fillRect(barX + barW * 0.56, barY - 2, 2, 8);
  }

  function makePortalScene(cfg, worldRenderer) {
    return {
      id: cfg.id,
      station: cfg.station,
      clue: cfg.clue,
      turkeyFork: cfg.turkeyFork,
      troutFork: cfg.troutFork,
      scionRule: cfg.scionRule,
      defaultTool: cfg.defaultTool,
      render: function (ctx, W, H, t, state) {
        var rs = resolveState(cfg, t, state);
        ctx.save();
        if (W !== 1280 || H !== 720) {
          ctx.scale(W / 1280, H / 720);
        }

        // 1. Setup A Bread-Tin Cockpit Shell & Controls
        drawCockpitInterior(ctx, cfg, rs);

        // 2. Clipped Circular Porthole World (`cx=640, cy=255, r_glass=185`)
        ctx.save();
        ctx.beginPath();
        ctx.arc(CX, CY, R_GLASS, 0, TAU);
        ctx.clip();
        worldRenderer(ctx, rs);
        ctx.restore();

        // 3. Riveted 6-Bolt Brass Bezel, 2-o'clock Rim Chip & Glinting Die Bolt
        drawPortholeBezelAndGlassGlint(ctx, rs);

        // 4. Articulated Turkey Pilot Wing operating the control / gesturing
        drawTurkeyPilotWing(ctx, cfg, rs);

        // 5. Lower Editorial Story Strip (or clean bench apron when showCaptions === false)
        drawLowerStrip(ctx, cfg, rs);

        ctx.restore();
      }
    };
  }

  window.PORTAL_SCENES[26] = makePortalScene(
    {
      id: 26,
      station: "#26 · Boiler",
      clue: "Glowing orange riverbed coal vent",
      turkeyFork: "Boiling soup pot or Nautilus fuel?",
      troutFork: "Sunken camp stove or cold tourist?",
      scionRule: "Thermal Plume (SCION 51)",
      defaultTool: "ballast"
    },
    renderP26
  );

  window.PORTAL_SCENES[27] = makePortalScene(
    {
      id: 27,
      station: "#27 · Port M",
      clue: "Rabbit-ear CRT playing AlgaeWipe 3000",
      turkeyFork: "Surface distress signal or sponge ad?",
      troutFork: "Rival TV channel or repairman’s van?",
      scionRule: "Frame-in-Frame (SCION 27)",
      defaultTool: "lamp"
    },
    renderP27
  );

  window.PORTAL_SCENES[28] = makePortalScene(
    {
      id: 28,
      station: "#28 · Stbd M",
      clue: "Silver minnows streaming in S-curve weave",
      turkeyFork: "Living lasso or highway exit arrow?",
      troutFork: "Parade float leader or shiny tin minnow?",
      scionRule: "Flock Ribbon (SCION 06)",
      defaultTool: "ballast"
    },
    renderP28
  );

  window.PORTAL_SCENES[29] = makePortalScene(
    {
      id: 29,
      station: "#29 · Deck",
      clue: "Open photo album shedding sepia snapshots",
      turkeyFork: "Sunken mailbag or town scrapbook?",
      troutFork: "Paparazzi camera or lost picture frame?",
      scionRule: "Drift Archive (SCION 39)",
      defaultTool: "lamp"
    },
    renderP29
  );

  window.PORTAL_SCENES[30] = makePortalScene(
    {
      id: 30,
      station: "#30 · Top",
      clue: "Six glowing vowel bubbles under bridge",
      turkeyFork: "Floating mines or Surface Lock code?",
      troutFork: "Bubble-popping beak or spelling-bee buzzer?",
      scionRule: "Lipogram Password (Oulipo)",
      defaultTool: "lamp"
    },
    renderP30
  );
})();
