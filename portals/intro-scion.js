/* ==========================================================================
 * TROUT SUB · SCION ACTIVITY INTRODUCTION FILM & INTERACTIVE COCKPIT MODULE
 * File: portals/intro-scion.js
 * Format: 1280x720 · 24fps · 48.0s (1152 frames) · PAELEO Handmade 2D Canvas
 * Covers all 6 core Episode SCIONs:
 *   Act 1 (0–8s):   episode-town + episode-cockpit (River Works & Flooded Bend -> Setup A)
 *   Act 2 (8–16s):  episode-works (Single Slot LEGO-snap: Lamp Module vs Ballast Tray)
 *   Act 3 (16–26s): Two Views Across Glass — Duck/Rabbit (Turkey 1·3·5 vs Trout 2·4·6)
 *   Act 4 (26–37s): episode-die (6-Bolt Probable/Plausible/Preposterous + 3D 1d6 Roll)
 *   Act 5 (37–48s): episode-crossing + episode-memory (Chalk Chart, Snail Mail & Bell)
 * ========================================================================== */
(function () {
  "use strict";

  var TAU = Math.PI * 2;

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }
  function lerp(a, b, u) {
    return a + (b - a) * clamp(u, 0, 1);
  }
  function invLerp(a, b, v) {
    return Math.abs(b - a) < 1e-6 ? 0 : clamp((v - a) / (b - a), 0, 1);
  }
  function smoothstep(a, b, v) {
    var x = invLerp(a, b, v);
    return x * x * (3 - 2 * x);
  }
  function easeOutBack(x) {
    x = clamp(x, 0, 1);
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }
  function easeInOutCubic(x) {
    x = clamp(x, 0, 1);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }
  // Deterministic hash for particles/caustics/grain (no Math.random!)
  function hash1(n) {
    var s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  // Draw standard 1..6 pip layouts inside a square centered at (cx, cy) of radius rad
  function drawPips2D(ctx, cx, cy, rad, count, color) {
    var d = rad * 0.52;
    var rDot = Math.max(2.1, rad * 0.17);
    var pts = [];
    if (count === 1) pts = [[0, 0]];
    else if (count === 2) pts = [[-d, -d], [d, d]];
    else if (count === 3) pts = [[-d, -d], [0, 0], [d, d]];
    else if (count === 4) pts = [[-d, -d], [d, -d], [-d, d], [d, d]];
    else if (count === 5) pts = [[-d, -d], [d, -d], [0, 0], [-d, d], [d, d]];
    else if (count === 6) pts = [[-d, -d], [d, -d], [-d, 0], [d, 0], [-d, d], [d, d]];

    ctx.save();
    ctx.fillStyle = color || "#1b140d";
    for (var i = 0; i < pts.length; i++) {
      ctx.beginPath();
      ctx.arc(cx + pts[i][0], cy + pts[i][1], rDot, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // =========================================================================
  // ARTICULATED RIG 1: BROOK THE SPOTTED TROUT
  // =========================================================================
  function drawBrookTrout(ctx, opts) {
    var x = opts.x || 0;
    var y = opts.y || 0;
    var scale = opts.scale || 1;
    var dir = opts.dir === -1 ? -1 : 1; // +1 faces right, -1 faces left
    var t = opts.t || 0;
    var swimAmp = opts.swimAmp !== undefined ? opts.swimAmp : 1;
    var pitch = opts.pitch || 0;
    var lookX = opts.lookX !== undefined ? opts.lookX : 0.35;
    var lookY = opts.lookY !== undefined ? opts.lookY : 0;
    var finReach = opts.finReach || 0; // 0..1 forward reach of pectoral fin
    var mouthOpen = opts.mouthOpen || 0; // 0..1
    var holdingRibbon = !!opts.holdingRibbon;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(pitch);
    ctx.scale(dir * scale, scale);

    var wag = Math.sin(t * 7.2) * 8 * swimAmp;
    var wag2 = Math.sin(t * 7.2 - 1.1) * 13 * swimAmp;

    // Forked caudal (tail) fin with spine follow-through
    ctx.save();
    ctx.translate(-58, wag * 0.45);
    ctx.rotate((wag2 - wag) * 0.018);
    ctx.fillStyle = "#2b625d";
    ctx.strokeStyle = "#102624";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(4, -7);
    ctx.quadraticCurveTo(-18, -24 + wag2 * 0.3, -30, -22 + wag2 * 0.45);
    ctx.quadraticCurveTo(-19, 0 + wag2 * 0.2, -29, 22 + wag2 * 0.45);
    ctx.quadraticCurveTo(-16, 22 + wag2 * 0.3, 4, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Tail rays
    ctx.strokeStyle = "rgba(218, 240, 232, 0.35)";
    ctx.lineWidth = 1.1;
    for (var r = -3; r <= 3; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * 1.5);
      ctx.lineTo(-22, r * 5.5 + wag2 * 0.35);
      ctx.stroke();
    }
    ctx.restore();

    // Dorsal fin
    ctx.fillStyle = "#295d57";
    ctx.strokeStyle = "#102624";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, -18 + wag * 0.15);
    ctx.quadraticCurveTo(-6, -34 + wag * 0.25, 8, -30 + wag * 0.15);
    ctx.quadraticCurveTo(2, -19, 6, -17);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Streamlined trout body with sinusoidal spine bend
    var bodyGrad = ctx.createLinearGradient(0, -24, 0, 24);
    bodyGrad.addColorStop(0, "#1f4e4a");
    bodyGrad.addColorStop(0.48, "#3e7d75");
    bodyGrad.addColorStop(0.62, "#d78471"); // rose-brook lateral band
    bodyGrad.addColorStop(1, "#dfece4");

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = "#0e2220";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(52, 1); // snout
    ctx.quadraticCurveTo(32, -22, -4, -20 + wag * 0.2);
    ctx.quadraticCurveTo(-38, -16 + wag * 0.35, -60, -7 + wag * 0.48);
    ctx.lineTo(-60, 7 + wag * 0.48);
    ctx.quadraticCurveTo(-36, 17 + wag * 0.35, -2, 20 + wag * 0.2);
    ctx.quadraticCurveTo(28, 21, 47, 8 + mouthOpen * 5);
    if (mouthOpen > 0.04) {
      ctx.lineTo(36, 4 + mouthOpen * 2);
      ctx.lineTo(52, 1);
    } else {
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();

    // Mouth line when closed
    if (mouthOpen <= 0.04) {
      ctx.beginPath();
      ctx.moveTo(51, 2);
      ctx.quadraticCurveTo(42, 5, 35, 3.5);
      ctx.strokeStyle = "#0e2220";
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    // Brook trout speckles (crimson & dark olive halo spots)
    var spots = [
      [-36, -6, "#163835"], [-26, -9, "#d94f3d"], [-18, -3, "#f0d27d"],
      [-10, -11, "#163835"], [-2, -4, "#d94f3d"], [8, -9, "#f0d27d"],
      [16, -3, "#163835"], [-30, 3, "#d94f3d"], [-14, 5, "#163835"],
      [3, 4, "#d94f3d"], [-43, -1, "#f0d27d"]
    ];
    for (var s = 0; s < spots.length; s++) {
      var sp = spots[s];
      ctx.fillStyle = sp[2];
      ctx.beginPath();
      ctx.arc(sp[0], sp[1] + wag * 0.16 * (-sp[0] / 40), 2.1, 0, TAU);
      ctx.fill();
    }

    // Gill operculum (breathing pulse)
    var gillOpen = Math.sin(t * 4.2) * 1.2;
    ctx.strokeStyle = "#102826";
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.arc(22 + gillOpen * 0.4, 1, 13.5, Math.PI * 0.68, Math.PI * 1.34);
    ctx.stroke();

    // Expressive eye
    ctx.fillStyle = "#fbf8ee";
    ctx.strokeStyle = "#0e2220";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(33, -5, 6.2, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#0d1718";
    ctx.beginPath();
    ctx.arc(33 + clamp(lookX, -1, 1) * 2.1, -5 + clamp(lookY, -1, 1) * 1.8, 3.3, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(34.5, -6.8, 1.3, 0, TAU);
    ctx.fill();

    // Articulated pectoral fin (can gesture/point/pull bell rope!)
    ctx.save();
    var finAngle = lerp(0.45 + Math.sin(t * 6.5) * 0.18, -0.85, finReach);
    ctx.translate(16, 10);
    ctx.rotate(finAngle);
    ctx.fillStyle = "#d47962";
    ctx.strokeStyle = "#102624";
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(14 + finReach * 8, 5, 18 + finReach * 10, 14);
    ctx.quadraticCurveTo(4, 16, -3, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Optional red crossing ribbon held in mouth/fin
    if (holdingRibbon) {
      ctx.save();
      ctx.strokeStyle = "#d93b2b";
      ctx.lineWidth = 4.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(49, 4);
      ctx.bezierCurveTo(64, 12 + Math.sin(t * 9) * 6, 78, -4 + Math.cos(t * 8) * 6, 94, 10);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // =========================================================================
  // ARTICULATED RIG 2: TURKEY PILOT (HEAD, WATTLE, EYE & FEATHERED WING)
  // =========================================================================
  function drawTurkeyPilot(ctx, opts) {
    var x = opts.x || 220;
    var y = opts.y || 320;
    var scale = opts.scale || 1;
    var dir = opts.dir === -1 ? -1 : 1;
    var t = opts.t || 0;
    var headTilt = opts.headTilt || 0;
    var neckLean = opts.neckLean || 0;
    var lookX = opts.lookX !== undefined ? opts.lookX : 0.6;
    var lookY = opts.lookY !== undefined ? opts.lookY : -0.1;
    var blink = opts.blink || 0;
    var beakOpen = opts.beakOpen || 0;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir * scale, scale);

    // Layered bronze-copper body/shoulder plumage
    var bodyGrad = ctx.createRadialGradient(-18, 35, 10, -20, 45, 95);
    bodyGrad.addColorStop(0, "#a85228");
    bodyGrad.addColorStop(0.55, "#6c2f17");
    bodyGrad.addColorStop(1, "#33160c");

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = "#170b06";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(-22, 56, 68, 54, -0.18, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Scalloped copper breast feather arcs
    ctx.strokeStyle = "rgba(237, 180, 115, 0.36)";
    ctx.lineWidth = 1.6;
    for (var row = 0; row < 3; row++) {
      for (var col = -1; col <= 1; col++) {
        ctx.beginPath();
        ctx.arc(-8 + col * 18, 32 + row * 16, 9, -0.5, 0.9);
        ctx.stroke();
      }
    }

    // Articulated neck + head
    ctx.save();
    ctx.rotate(neckLean);

    // Neck column
    ctx.fillStyle = "#8d3e22";
    ctx.strokeStyle = "#1c0c07";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-18, 22);
    ctx.quadraticCurveTo(-12, -16, -2, -46);
    ctx.lineTo(20, -42);
    ctx.quadraticCurveTo(18, -8, 16, 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head pivot
    ctx.translate(8, -50);
    ctx.rotate(headTilt);

    // Crimson wattle (with secondary pendulum swing)
    var wattleSwing = Math.sin(t * 5.2 - neckLean * 4) * 0.14;
    ctx.save();
    ctx.translate(16, 8);
    ctx.rotate(wattleSwing);
    ctx.fillStyle = "#c92a22";
    ctx.strokeStyle = "#2b0907";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(11, 10, 9, 30, 1, 32);
    ctx.bezierCurveTo(-7, 32, -8, 14, -2, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Head skull (slate-blue & warm russet crown)
    var headGrad = ctx.createRadialGradient(2, -6, 3, 2, -2, 26);
    headGrad.addColorStop(0, "#5c7d89");
    headGrad.addColorStop(0.7, "#3c5560");
    headGrad.addColorStop(1, "#26363d");
    ctx.fillStyle = headGrad;
    ctx.strokeStyle = "#170b06";
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.ellipse(2, -2, 22, 19, -0.08, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Small Brass Pilot Cap / Headband Visor
    ctx.fillStyle = "#d99b43";
    ctx.strokeStyle = "#241608";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(-2, -17, 17, 6.5, -0.18, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Hooked horn beak (upper & lower mandible)
    ctx.fillStyle = "#e3b869";
    ctx.strokeStyle = "#241608";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(19, -7);
    ctx.quadraticCurveTo(37, -5, 39, 4 - beakOpen * 2);
    ctx.lineTo(20, 3 - beakOpen * 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Lower beak
    ctx.beginPath();
    ctx.moveTo(19, 3);
    ctx.lineTo(34, 6 + beakOpen * 6);
    ctx.quadraticCurveTo(25, 11 + beakOpen * 5, 17, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crimson snood draping beside beak
    ctx.fillStyle = "#d63229";
    ctx.beginPath();
    ctx.moveTo(22, -8);
    ctx.quadraticCurveTo(29, -12, 28, 3);
    ctx.quadraticCurveTo(26, 9, 22, 5);
    ctx.closePath();
    ctx.fill();

    // Expressive pilot eye
    ctx.fillStyle = "#fffaf0";
    ctx.strokeStyle = "#170b06";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(8, -4, 6.8, 6.8 * (1 - clamp(blink, 0, 0.92)), 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (blink < 0.8) {
      ctx.fillStyle = "#14100d";
      ctx.beginPath();
      ctx.arc(8 + clamp(lookX, -1, 1) * 2.4, -4 + clamp(lookY, -1, 1) * 2.0, 3.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(9.4, -5.6, 1.3, 0, TAU);
      ctx.fill();
    }

    ctx.restore(); // end neck/head
    ctx.restore(); // end turkey
  }

  // Articulated Feathered Wing/Arm reaching from (sx, sy) to target (tx, ty)
  function drawTurkeyWingArm(ctx, sx, sy, tx, ty, bendDir, spread, propFn) {
    var dx = tx - sx;
    var dy = ty - sy;
    var dist = Math.max(20, Math.hypot(dx, dy));
    var L1 = 135;
    var L2 = 135;
    var clamped = Math.min(dist, L1 + L2 - 4);
    var baseAng = Math.atan2(dy, dx);
    var cosA = clamp((L1 * L1 + clamped * clamped - L2 * L2) / (2 * L1 * clamped), -1, 1);
    var elbowAng = baseAng + (bendDir >= 0 ? 1 : -1) * Math.acos(cosA);
    var ex = sx + Math.cos(elbowAng) * L1;
    var ey = sy + Math.sin(elbowAng) * L1;
    var handAng = Math.atan2(ty - ey, tx - ex);

    ctx.save();
    // Upper wing limb
    ctx.strokeStyle = "#1a0c07";
    ctx.lineWidth = 26;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    ctx.strokeStyle = "#8a3d1f";
    ctx.lineWidth = 21;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // Amber rim-light along upper wing edge
    ctx.strokeStyle = "#edb473";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 7);
    ctx.lineTo(ex, ey - 7);
    ctx.lineTo(tx, ty - 5);
    ctx.stroke();

    // Fanned primary wing feathers at wrist/hand (tx, ty)
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(handAng);
    var fan = spread !== undefined ? spread : 0.22;
    for (var f = -2; f <= 2; f++) {
      ctx.save();
      ctx.rotate(f * fan);
      ctx.fillStyle = f % 2 === 0 ? "#a64c27" : "#7d3519";
      ctx.strokeStyle = "#1a0c07";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.quadraticCurveTo(18, -7, 34 - Math.abs(f) * 3, 0);
      ctx.quadraticCurveTo(18, 7, -6, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Cream feather barring
      ctx.strokeStyle = "rgba(247, 232, 200, 0.5)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(16, -4);
      ctx.lineTo(16, 4);
      ctx.moveTo(23, -3);
      ctx.lineTo(23, 3);
      ctx.stroke();
      ctx.restore();
    }
    if (propFn) propFn(ctx);
    ctx.restore();

    ctx.restore();
  }

  // =========================================================================
  // ARTICULATED RIG 3: RIVER MAIL SNAIL (EPISODE-MEMORY)
  // =========================================================================
  function drawMailSnail(ctx, x, y, scale, t, hasPostcard, salute) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Rippling snail foot
    ctx.fillStyle = "#7a9c78";
    ctx.strokeStyle = "#162619";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-36, 14);
    ctx.quadraticCurveTo(-24, 2, 12, 2);
    ctx.quadraticCurveTo(34, 1, 42, 9 + Math.sin(t * 6) * 1.5);
    ctx.quadraticCurveTo(38, 16, 22, 15);
    for (var w = 3; w >= -3; w--) {
      ctx.lineTo(w * 9, 15 + Math.sin(t * 8 + w * 1.3) * 1.8);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Two articulated eyestalks
    var stalk1 = -0.35 + Math.sin(t * 4.5) * 0.1 - salute * 0.35;
    var stalk2 = -0.15 + Math.cos(t * 4.1) * 0.1;
    var stalks = [[31, 4, stalk1, 18], [36, 6, stalk2, 15]];
    for (var i = 0; i < 2; i++) {
      var st = stalks[i];
      var ex = st[0] + Math.cos(st[2] - 0.8) * st[3];
      var ey = st[1] + Math.sin(st[2] - 0.8) * st[3];
      ctx.strokeStyle = "#203624";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(st[0], st[1]);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.fillStyle = "#fbf7ea";
      ctx.strokeStyle = "#162619";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(ex, ey, 3.8, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#111815";
      ctx.beginPath();
      ctx.arc(ex + 1, ey - 0.5, 1.7, 0, TAU);
      ctx.fill();
    }

    // Golden-amber spiral snail shell
    var shellGrad = ctx.createRadialGradient(-6, -12, 3, -6, -10, 26);
    shellGrad.addColorStop(0, "#f2cb79");
    shellGrad.addColorStop(0.55, "#c47d31");
    shellGrad.addColorStop(1, "#6e3d14");
    ctx.fillStyle = shellGrad;
    ctx.strokeStyle = "#241407";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(-5, -10, 22, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Fibonacci spiral line inside shell
    ctx.strokeStyle = "#3b2009";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var a = 0; a < Math.PI * 4.4; a += 0.2) {
      var sr = 1.35 * a;
      var px = -5 + Math.cos(a) * sr;
      var py = -10 + Math.sin(a) * sr;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Tiny Canvas Snail-Mail Pouch + Porthole Postcard sticking out!
    ctx.fillStyle = "#d9c59a";
    ctx.strokeStyle = "#261d11";
    ctx.lineWidth = 1.8;
    roundRectPath(ctx, -20, -6, 22, 16, 3);
    ctx.fill();
    ctx.stroke();
    // Brass buckle
    ctx.fillStyle = "#eab64d";
    ctx.fillRect(-11, -1, 5, 5);

    if (hasPostcard) {
      ctx.save();
      ctx.translate(-9, -12);
      ctx.rotate(-0.18);
      drawPostcardMini(ctx, 0, 0, 26, 18);
      ctx.restore();
    }

    ctx.restore();
  }

  function drawPostcardMini(ctx, cx, cy, w, h) {
    ctx.save();
    ctx.translate(cx - w * 0.5, cy - h * 0.5);
    ctx.fillStyle = "#fcf8ed";
    ctx.strokeStyle = "#221a12";
    ctx.lineWidth = 1.6;
    roundRectPath(ctx, 0, 0, w, h, 2.5);
    ctx.fill();
    ctx.stroke();

    // Miniature porthole sketch on left of postcard
    var r = h * 0.31;
    ctx.fillStyle = "#2a7b8c";
    ctx.strokeStyle = "#b58231";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(w * 0.32, h * 0.5, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Tiny V-notch inside postcard porthole
    ctx.strokeStyle = "#f7e39c";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(w * 0.24, h * 0.44);
    ctx.lineTo(w * 0.32, h * 0.58);
    ctx.lineTo(w * 0.40, h * 0.44);
    ctx.stroke();

    // Red wax seal on right
    ctx.fillStyle = "#bf2c21";
    ctx.beginPath();
    ctx.arc(w * 0.76, h * 0.64, h * 0.18, 0, TAU);
    ctx.fill();

    // 4 small emerald dots (rolled 4!)
    drawPips2D(ctx, w * 0.75, h * 0.28, h * 0.16, 4, "#2d6846");
    ctx.restore();
  }

  // =========================================================================
  // HANDMADE 3D-PROJECTED 1D6 DIE (ACT 4: EPISODE-DIE)
  // Opposite faces sum to 7: +Z=4, -Z=3, +Y=2, -Y=5, +X=6, -X=1
  // =========================================================================
  function rotX(v, a) {
    var c = Math.cos(a), s = Math.sin(a);
    return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
  }
  function rotY(v, a) {
    var c = Math.cos(a), s = Math.sin(a);
    return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
  }
  function rotZ(v, a) {
    var c = Math.cos(a), s = Math.sin(a);
    return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]];
  }

  // Target Euler angles so desired face `faceNum` faces straight toward camera (+Z)
  function targetEulerForFace(faceNum) {
    if (faceNum === 4) return [0.22, -0.18, 0.06];
    if (faceNum === 3) return [0.22, Math.PI - 0.18, 0.06];
    if (faceNum === 2) return [Math.PI * 0.5 + 0.18, 0.12, -0.08];
    if (faceNum === 5) return [-Math.PI * 0.5 + 0.18, -0.12, 0.08];
    if (faceNum === 6) return [0.18, -Math.PI * 0.5 - 0.15, 0.05];
    return [0.18, Math.PI * 0.5 - 0.15, -0.05]; // face 1
  }

  function registerColorForFace(faceNum) {
    if (faceNum <= 2) return "#278ba8"; // Probable (Teal)
    if (faceNum <= 4) return "#2d7d52"; // Plausible (Green)
    return "#b8431e"; // Preposterous (Rust)
  }

  function drawDie3D(ctx, cx, cy, size, rx, ry, rz, highlightFace) {
    var verts = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1]
    ];
    var xformed = [];
    var proj = [];
    var fov = 5.4;
    for (var i = 0; i < 8; i++) {
      var v = rotZ(rotY(rotX(verts[i], rx), ry), rz);
      xformed.push(v);
      var persp = fov / (fov - v[2]);
      proj.push([cx + v[0] * size * persp, cy + v[1] * size * persp, v[2]]);
    }

    var faces = [
      { idx: [4, 5, 6, 7], pips: 4, n: [0, 0, 1] },
      { idx: [1, 0, 3, 2], pips: 3, n: [0, 0, -1] },
      { idx: [0, 1, 5, 4], pips: 2, n: [0, -1, 0] },
      { idx: [3, 7, 6, 2], pips: 5, n: [0, 1, 0] },
      { idx: [5, 1, 2, 6], pips: 6, n: [1, 0, 0] },
      { idx: [0, 4, 7, 3], pips: 1, n: [-1, 0, 0] }
    ];

    // Sort back-to-front by average Z
    var visible = [];
    for (var f = 0; f < faces.length; f++) {
      var fc = faces[f];
      var rn = rotZ(rotY(rotX(fc.n, rx), ry), rz);
      if (rn[2] > -0.08) {
        var zAvg = (xformed[fc.idx[0]][2] + xformed[fc.idx[1]][2] + xformed[fc.idx[2]][2] + xformed[fc.idx[3]][2]) * 0.25;
        visible.push({ fc: fc, rn: rn, z: zAvg });
      }
    }
    visible.sort(function (a, b) { return a.z - b.z; });

    for (var k = 0; k < visible.length; k++) {
      var item = visible[k];
      var q = item.fc.idx;
      var p0 = proj[q[0]], p1 = proj[q[1]], p2 = proj[q[2]], p3 = proj[q[3]];
      var light = clamp(0.55 + item.rn[0] * -0.22 + item.rn[1] * -0.3 + item.rn[2] * 0.42, 0.32, 1.0);
      var isWin = highlightFace === item.fc.pips;

      var rC = Math.round((isWin ? 253 : 244) * light);
      var gC = Math.round((isWin ? 245 : 233) * light);
      var bC = Math.round((isWin ? 212 : 205) * light);

      ctx.save();
      ctx.fillStyle = "rgb(" + rC + "," + gC + "," + bC + ")";
      ctx.strokeStyle = isWin ? registerColorForFace(item.fc.pips) : "#3d2b16";
      ctx.lineWidth = isWin ? 3.2 : 2.2;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Project 3D pips directly onto the quadrilateral via bilinear interpolation!
      var pipUV = [];
      var d = 0.27;
      var c = item.fc.pips;
      if (c === 1) pipUV = [[0.5, 0.5]];
      else if (c === 2) pipUV = [[0.5 - d, 0.5 - d], [0.5 + d, 0.5 + d]];
      else if (c === 3) pipUV = [[0.5 - d, 0.5 - d], [0.5, 0.5], [0.5 + d, 0.5 + d]];
      else if (c === 4) pipUV = [[0.5 - d, 0.5 - d], [0.5 + d, 0.5 - d], [0.5 - d, 0.5 + d], [0.5 + d, 0.5 + d]];
      else if (c === 5) pipUV = [[0.5 - d, 0.5 - d], [0.5 + d, 0.5 - d], [0.5, 0.5], [0.5 - d, 0.5 + d], [0.5 + d, 0.5 + d]];
      else if (c === 6) pipUV = [[0.5 - d, 0.5 - d], [0.5 + d, 0.5 - d], [0.5 - d, 0.5], [0.5 + d, 0.5], [0.5 - d, 0.5 + d], [0.5 + d, 0.5 + d]];

      var pipCol = registerColorForFace(c);
      var rPip = Math.max(2.4, size * 0.145 * clamp(item.rn[2] + 0.45, 0.45, 1));
      ctx.fillStyle = pipCol;
      for (var m = 0; m < pipUV.length; m++) {
        var u = pipUV[m][0], v2 = pipUV[m][1];
        var topX = lerp(p0[0], p1[0], u), topY = lerp(p0[1], p1[1], u);
        var botX = lerp(p3[0], p2[0], u), botY = lerp(p3[1], p2[1], u);
        var px = lerp(topX, botX, v2);
        var py = lerp(topY, botY, v2);
        ctx.beginPath();
        ctx.arc(px, py, rPip, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // =========================================================================
  // RIVER EXTERIOR MULTIPLANE WORLD (VISIBLE IN PORTHOLE & ACT 1A)
  // =========================================================================
  function drawRiverBendWorld(ctx, cx, cy, rad, opts) {
    var t = opts.t || 0;
    var siltAmt = opts.siltAmt !== undefined ? opts.siltAmt : 0.5;
    var lampOn = !!opts.lampOn;
    var lampAimX = opts.lampAimX || 0; // -40..+40
    var fastFlow = opts.fastFlow || 0; // 0..1
    var ballastDepth = opts.ballastDepth || 0; // 0 (surface/mid) -> 1 (low behind stone lip)
    var ribbonTied = !!opts.ribbonTied;
    var lanternLit = !!opts.lanternLit;
    var bellSwing = opts.bellSwing || 0;
    var bellRings = opts.bellRings || 0; // 0..1 wave pulse
    var showDuckRabbit = opts.duckRabbit || 0; // 0..1 boot/key silhouette in Act 3
    var preposterousBeat = opts.preposterousBeat || 0; // 0..1 whimsical tuba-crab bubble in Act 4

    // Vertical camera shift when ballast lowers boat behind stone lip!
    var camRise = ballastDepth * 52;

    ctx.save();
    // Deep river dusk water gradient
    var wGrad = ctx.createLinearGradient(cx, cy - rad, cx, cy + rad);
    wGrad.addColorStop(0, "#1d5866");
    wGrad.addColorStop(0.45, "#16434e");
    wGrad.addColorStop(1, "#0d262d");
    ctx.fillStyle = wGrad;
    ctx.fillRect(cx - rad - 20, cy - rad - 20, rad * 2 + 40, rad * 2 + 40);

    // Animated underwater caustic rays from surface
    ctx.save();
    for (var c = -3; c <= 3; c++) {
      var rayX = cx + c * 46 + Math.sin(t * 1.4 + c) * 12;
      ctx.fillStyle = "rgba(163, 224, 216, 0.07)";
      ctx.beginPath();
      ctx.moveTo(rayX - 14, cy - rad - 10);
      ctx.lineTo(rayX + 18, cy - rad - 10);
      ctx.lineTo(rayX + 42, cy + rad + 10);
      ctx.lineTo(rayX - 28, cy + rad + 10);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Far bank Twin Tree Trunks (Setup A geographic anchor!)
    var horizonY = cy - 42 - camRise * 0.45;
    ctx.fillStyle = "#122e33";
    ctx.beginPath();
    ctx.moveTo(cx - rad - 10, horizonY + 30);
    ctx.quadraticCurveTo(cx - 80, horizonY - 10, cx - 22, horizonY + 12);
    ctx.lineTo(cx, horizonY + 34); // V-SHAPED CULVERT ROCK NOTCH!
    ctx.lineTo(cx + 22, horizonY + 10);
    ctx.quadraticCurveTo(cx + 95, horizonY - 14, cx + rad + 10, horizonY + 26);
    ctx.lineTo(cx + rad + 10, cy + rad + 20);
    ctx.lineTo(cx - rad - 10, cy + rad + 20);
    ctx.closePath();
    ctx.fill();

    // Twin Tree Trunks framing the Culvert Notch
    var trunks = [cx - 72, cx - 48];
    for (var tr = 0; tr < 2; tr++) {
      ctx.fillStyle = tr === 0 ? "#1b332f" : "#233f3a";
      ctx.strokeStyle = "#0b1918";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(trunks[tr] - 9, horizonY + 18);
      ctx.lineTo(trunks[tr] - 6, cy - rad - 10);
      ctx.lineTo(trunks[tr] + 7, cy - rad - 10);
      ctx.lineTo(trunks[tr] + 10, horizonY + 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Culvert Rock Notch highlight (sharp V cleft + iron ring!)
    var notchVis = clamp(1 - siltAmt * 0.85 + (lampOn ? 0.95 : 0), 0.15, 1);
    ctx.save();
    ctx.globalAlpha = notchVis;
    ctx.fillStyle = lampOn ? "#d6b97b" : "#4a7378";
    ctx.strokeStyle = "#0d1e21";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - 34, horizonY + 28);
    ctx.lineTo(cx - 18, horizonY - 4);
    ctx.lineTo(cx, horizonY + 24); // crisp V notch!
    ctx.lineTo(cx + 18, horizonY - 6);
    ctx.lineTo(cx + 36, horizonY + 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Iron mooring ring at Notch + Red Crossing Ribbon when verified!
    ctx.strokeStyle = "#e0b35a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx + 18, horizonY + 12, 4.5, 0, TAU);
    ctx.stroke();
    if (ribbonTied) {
      ctx.strokeStyle = "#e63e2e";
      ctx.lineWidth = 3.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx + 18, horizonY + 12);
      ctx.quadraticCurveTo(
        cx + 34,
        horizonY + 8 + Math.sin(t * 7.5) * 5,
        cx + 48,
        horizonY + 16 + Math.cos(t * 7.5) * 4
      );
      ctx.stroke();
    }
    ctx.restore();

    // Right Bank STONE STEPS (Setup A invariant: always open!)
    var stepsX = cx + 82;
    var stepsY = horizonY + 12;
    ctx.fillStyle = "#3c6363";
    ctx.strokeStyle = "#102426";
    ctx.lineWidth = 1.9;
    for (var st = 0; st < 4; st++) {
      ctx.beginPath();
      ctx.rect(stepsX + st * 14, stepsY + st * 13, 28, 13);
      ctx.fill();
      ctx.stroke();
    }

    // Lower Landing Lantern Post + Hanging Brass Bell (top of Stone Steps)
    var postX = cx + 74;
    var postY = horizonY - 28;
    ctx.strokeStyle = "#1a2f30";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(postX, horizonY + 18);
    ctx.lineTo(postX, postY);
    ctx.lineTo(postX - 24, postY);
    ctx.stroke();

    // Lantern glow when verified in Act 5
    if (lanternLit) {
      var lGlow = ctx.createRadialGradient(postX, postY - 6, 2, postX, postY - 6, 36);
      lGlow.addColorStop(0, "rgba(255, 224, 130, 0.95)");
      lGlow.addColorStop(1, "rgba(255, 180, 70, 0)");
      ctx.fillStyle = lGlow;
      ctx.beginPath();
      ctx.arc(postX, postY - 6, 36, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = lanternLit ? "#ffd66b" : "#4b696b";
    ctx.strokeStyle = "#142224";
    ctx.lineWidth = 1.6;
    roundRectPath(ctx, postX - 5, postY - 12, 10, 12, 2);
    ctx.fill();
    ctx.stroke();

    // Hanging Brass Landing Bell
    var bellX = postX - 24;
    var bellY = postY + 2;
    ctx.save();
    ctx.translate(bellX, bellY);
    ctx.rotate(bellSwing);
    ctx.fillStyle = "#ebb64e";
    ctx.strokeStyle = "#2b1c08";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.quadraticCurveTo(-9, 12, -13, 17);
    ctx.lineTo(13, 17);
    ctx.quadraticCurveTo(9, 12, 5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Clapper + bell rope
    ctx.fillStyle = "#7a5219";
    ctx.beginPath();
    ctx.arc(Math.sin(-bellSwing * 1.6) * 4, 19, 3.2, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#d9c396";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 19);
    ctx.quadraticCurveTo(Math.sin(t * 5) * 3, 30, 1, 40);
    ctx.stroke();
    ctx.restore();

    // Concentric acoustic golden bell rings when rung!
    if (bellRings > 0.01) {
      for (var br = 0; br < 3; br++) {
        var prog = (bellRings * 1.4 + br * 0.33) % 1;
        ctx.strokeStyle = "rgba(255, 220, 120," + ((1 - prog) * 0.8).toFixed(3) + ")";
        ctx.lineWidth = 2.6 - prog * 1.5;
        ctx.beginPath();
        ctx.arc(bellX, bellY + 10, 12 + prog * 95, 0, TAU);
        ctx.stroke();
      }
    }

    // Dock Ribbon on mid-water post (stretches taut in fastFlow!)
    var postMidX = cx - 96;
    var postMidY = cy + 16 - camRise * 0.6;
    ctx.fillStyle = "#2d2218";
    ctx.fillRect(postMidX - 4, postMidY - 22, 8, 56);
    ctx.strokeStyle = "#e04836";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(postMidX + 3, postMidY - 14);
    if (fastFlow > 0.25) {
      // Stretched horizontally by fierce fast current!
      ctx.quadraticCurveTo(
        postMidX + 36 * fastFlow,
        postMidY - 14 + Math.sin(t * 22) * 3,
        postMidX + 68 * fastFlow,
        postMidY - 12 + Math.cos(t * 24) * 3
      );
    } else {
      ctx.quadraticCurveTo(postMidX + 12, postMidY + 2, postMidX + 8 + Math.sin(t * 3) * 4, postMidY + 18);
    }
    ctx.stroke();

    // Fast-water white streaks across upper layer
    if (fastFlow > 0.05) {
      ctx.save();
      ctx.strokeStyle = "rgba(225, 248, 250," + (0.48 * fastFlow).toFixed(3) + ")";
      ctx.lineWidth = 2.4;
      for (var fw = 0; fw < 14; fw++) {
        var fy = cy - rad + 24 + (fw * 19) % 150 - camRise * 0.35;
        var fx = cx - rad + ((t * 360 + fw * 83) % (rad * 2 + 60)) - 30;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + 38 + (fw % 3) * 14, fy);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Swirling river silt cloud (soft painterly radial puffs, cleared where aimed lamp shines!)
    if (siltAmt > 0.02) {
      ctx.save();
      for (var sp = 0; sp < 14; sp++) {
        var sx = cx - 115 + ((sp * 41 + t * 20 * (1 + sp % 2)) % 230);
        var sy = cy - 72 + Math.sin(t * 1.3 + sp) * 26 + (sp % 4) * 19 - camRise * 0.3;
        var sRad = 44 + (sp % 3) * 18;
        var distBeam = lampOn ? Math.hypot(sx - (cx + lampAimX), sy - (horizonY + 14)) : 999;
        var localAlpha = siltAmt * 0.42 * clamp((distBeam - 24) / 95, 0.06, 1);
        var sGrad = ctx.createRadialGradient(sx, sy, 2, sx, sy, sRad);
        sGrad.addColorStop(0, "rgba(148, 120, 76," + localAlpha.toFixed(3) + ")");
        sGrad.addColorStop(0.6, "rgba(132, 106, 66," + (localAlpha * 0.45).toFixed(3) + ")");
        sGrad.addColorStop(1, "rgba(132, 106, 66, 0)");
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, sRad, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // ACT 3 SHARED SILHOUETTE: Giant Size-11 Boot + Brass Key at sole!
    if (showDuckRabbit > 0.01) {
      ctx.save();
      ctx.globalAlpha = showDuckRabbit;
      var bx = cx - 8 + Math.sin(t * 1.8) * 4;
      var by = cy + 8 + Math.cos(t * 1.5) * 4;
      ctx.translate(bx, by);
      ctx.rotate(-0.08 + Math.sin(t * 1.4) * 0.04);

      // Backlit cyan-amber halo behind the mystery silhouette
      var bHalo = ctx.createRadialGradient(0, 0, 12, 0, 0, 115);
      bHalo.addColorStop(0, "rgba(182, 238, 226, 0.42)");
      bHalo.addColorStop(1, "rgba(20, 60, 68, 0)");
      ctx.fillStyle = bHalo;
      ctx.beginPath();
      ctx.arc(0, 0, 115, 0, TAU);
      ctx.fill();

      // Rubber Wader Boot / Smokestack Silhouette
      ctx.fillStyle = "#142628";
      ctx.strokeStyle = "#edb473";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-26, -135);
      ctx.lineTo(24, -128);
      ctx.quadraticCurveTo(20, -45, 16, -8);
      ctx.quadraticCurveTo(46, 8, 62, 18);
      ctx.quadraticCurveTo(68, 34, 52, 42);
      ctx.lineTo(-34, 34);
      ctx.quadraticCurveTo(-40, 12, -32, -12);
      ctx.quadraticCurveTo(-28, -68, -26, -135);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tread notches under sole + glinting Brass Skeleton Key / Crab Claw!
      ctx.save();
      ctx.translate(42, 48);
      ctx.rotate(Math.sin(t * 3.5) * 0.16);
      ctx.fillStyle = "#ebb44c";
      ctx.strokeStyle = "#261806";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(-16, 0, 7, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(-9, -2.5, 24, 5);
      ctx.fillRect(8, 2.5, 4, 6);
      ctx.fillRect(13, 2.5, 4, 4);
      ctx.restore();

      ctx.restore();
    }

    // ACT 4 PREPOSTEROUS VIGNETTE (5-6 Rust): Whimsical Tuba-Crab & Reed Hat drifting past!
    if (preposterousBeat > 0.01) {
      ctx.save();
      ctx.globalAlpha = preposterousBeat;
      var px = cx + lerp(110, -90, preposterousBeat * 0.7 + ((t * 0.25) % 0.3));
      var py = cy + 12 + Math.sin(t * 5) * 10;
      ctx.translate(px, py);
      // Brass tuba bell
      ctx.fillStyle = "#e8ad43";
      ctx.strokeStyle = "#291805";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-12, 16);
      ctx.quadraticCurveTo(-18, -14, -34, -26);
      ctx.lineTo(8, -26);
      ctx.quadraticCurveTo(-4, -10, 4, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Little red crab holding tuba!
      ctx.fillStyle = "#d44627";
      ctx.beginPath();
      ctx.ellipse(6, 18, 16, 11, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Volumetric 2900K Amber Lamp Beam from bottom of porthole!
    if (lampOn) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      var beamGrad = ctx.createRadialGradient(cx, cy + rad - 10, 8, cx + lampAimX, cy - 30, rad * 1.45);
      beamGrad.addColorStop(0, "rgba(255, 214, 122, 0.72)");
      beamGrad.addColorStop(0.55, "rgba(237, 175, 88, 0.30)");
      beamGrad.addColorStop(1, "rgba(237, 175, 88, 0)");
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy + rad - 2);
      ctx.lineTo(cx - 118 + lampAimX, cy - rad - 10);
      ctx.lineTo(cx + 118 + lampAimX, cy - rad - 10);
      ctx.lineTo(cx + 24, cy + rad - 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Tyndall dust motes dancing inside lamp beam
      ctx.fillStyle = "rgba(255, 238, 184, 0.72)";
      for (var dm = 0; dm < 14; dm++) {
        var mx = cx + lampAimX * 0.5 + (hash1(dm * 7.1) - 0.5) * 110 + Math.sin(t * 2 + dm) * 8;
        var my = cy - 60 + hash1(dm * 13.3) * 180;
        ctx.beginPath();
        ctx.arc(mx, my, 1.8 + (dm % 2), 0, TAU);
        ctx.fill();
      }
    }

    // FOREGROUND LOW STONE SHELTER LIP (rises into lower porthole when ballastDepth > 0!)
    var lipY = cy + rad + 26 - ballastDepth * 94;
    ctx.fillStyle = "#183336";
    ctx.strokeStyle = "#0a1719";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - rad - 20, cy + rad + 30);
    ctx.lineTo(cx - rad - 20, lipY + 14);
    ctx.quadraticCurveTo(cx - 50, lipY - 18, cx + 35, lipY - 6);
    ctx.quadraticCurveTo(cx + 115, lipY + 4, cx + rad + 20, lipY - 10);
    ctx.lineTo(cx + rad + 20, cy + rad + 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Slack green shelter ribbon behind the low stone lip when ballastDepth > 0.45!
    if (ballastDepth > 0.35) {
      var shX = cx - 26;
      var shY = lipY + 8;
      ctx.strokeStyle = "#7be0ad";
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(shX, shY);
      // Droops peacefully slack in calm shelter!
      ctx.quadraticCurveTo(shX + 6 + Math.sin(t * 2.2) * 2, shY + 18, shX + 3, shY + 32);
      ctx.stroke();
    }

    // Rising ballast air bubbles when sub submerges
    if (opts.bubblesAmt > 0.02) {
      ctx.strokeStyle = "rgba(215, 248, 255, 0.78)";
      ctx.lineWidth = 1.6;
      for (var bb = 0; bb < 12; bb++) {
        var bx2 = cx - 90 + (bb * 17) % 180 + Math.sin(t * 6 + bb) * 6;
        var by2 = cy + rad - ((t * 150 + bb * 33) % (rad * 2));
        ctx.beginPath();
        ctx.arc(bx2, by2, 3 + (bb % 3) * 2, 0, TAU);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // =========================================================================
  // SETUP A ANTIQUE BRASS PORTHOLE BEZEL (6 BOLTS + HINGE + LATCH + 2 O'CLOCK CHIP)
  // =========================================================================
  function drawSetupAPortholeFrame(ctx, cx, cy, rGlass, rOuter, opts) {
    var boltGlow = opts.boltGlow || {}; // map { 1: colorString, ... }
    var lampMounted = !!opts.lampMounted;
    var lampOn = !!opts.lampOn;

    ctx.save();

    // Left twin-barrel cast iron hinge
    ctx.fillStyle = "#3c4240";
    ctx.strokeStyle = "#121616";
    ctx.lineWidth = 2.4;
    roundRectPath(ctx, cx - rOuter - 16, cy - 36, 22, 72, 5);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - rOuter - 16, cy - 12);
    ctx.lineTo(cx - rOuter + 6, cy - 12);
    ctx.moveTo(cx - rOuter - 16, cy + 12);
    ctx.lineTo(cx - rOuter + 6, cy + 12);
    ctx.stroke();

    // Outer brass bezel ring with 2-O'CLOCK RIM CHIP!
    var brassGrad = ctx.createLinearGradient(cx - rOuter, cy - rOuter, cx + rOuter, cy + rOuter);
    brassGrad.addColorStop(0, "#e5be6d");
    brassGrad.addColorStop(0.35, "#b38437");
    brassGrad.addColorStop(0.7, "#80591e");
    brassGrad.addColorStop(1, "#cfa252");

    ctx.fillStyle = brassGrad;
    ctx.strokeStyle = "#241908";
    ctx.lineWidth = 3;

    // 2 o'clock angle is -30 deg (-Math.PI / 6)
    var chipAng = -Math.PI / 6;
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, chipAng + 0.085, chipAng + TAU - 0.085);
    // Sharp V-chip gouged into outer rim at 2 o'clock!
    var chipInX = cx + Math.cos(chipAng) * (rOuter - 16);
    var chipInY = cy + Math.sin(chipAng) * (rOuter - 16);
    ctx.lineTo(chipInX, chipInY);
    ctx.closePath();
    // Cut out inner glass circle via counter-clockwise arc
    ctx.moveTo(cx + rGlass, cy);
    ctx.arc(cx, cy, rGlass, 0, TAU, true);
    ctx.fill("evenodd");

    // Stroke outer chipped rim & inner bezel
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, chipAng + 0.085, chipAng + TAU - 0.085);
    ctx.lineTo(chipInX, chipInY);
    ctx.closePath();
    ctx.stroke();

    // Bright raw nicked brass glint inside the 2-o'clock chip so it ALWAYS reads clearly!
    ctx.strokeStyle = "#fff1ba";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(chipAng - 0.085) * rOuter, cy + Math.sin(chipAng - 0.085) * rOuter);
    ctx.lineTo(chipInX, chipInY);
    ctx.lineTo(cx + Math.cos(chipAng + 0.085) * rOuter, cy + Math.sin(chipAng + 0.085) * rOuter);
    ctx.stroke();

    // Inner recessed dark brass lip
    ctx.strokeStyle = "#2b1d09";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, rGlass, 0, TAU);
    ctx.stroke();

    // Right offset brass dog-latch (Setup A invariant)
    ctx.save();
    ctx.translate(cx + rOuter - 4, cy + 14);
    ctx.fillStyle = "#d9ac59";
    ctx.strokeStyle = "#241908";
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, -12, -13, 30, 26, 6);
    ctx.fill();
    ctx.stroke();
    // Latch handle tongue
    roundRectPath(ctx, 8, -7, 16, 14, 4);
    ctx.fillStyle = "#f0c978";
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Mounted Gimbal Searchlight Housing at bottom of porthole (when Lamp Module fitted)
    if (lampMounted) {
      ctx.save();
      ctx.translate(cx, cy + rGlass - 4);
      ctx.fillStyle = lampOn ? "#ffd875" : "#785a28";
      ctx.strokeStyle = "#241908";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 22, Math.PI, TAU);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#9c722c";
      roundRectPath(ctx, -25, -2, 50, 12, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 6 HEXAGONAL DIE-RING BOLTS (#1..#6 clockwise starting from 12 o'clock / -60 deg)
    var rBolt = (rGlass + rOuter) * 0.5;
    var boltAngles = [
      -Math.PI * 0.5,        // #1 (12 o'clock)
      -Math.PI * 0.14,       // #2 (~2:30, just below the 2 o'clock chip)
      Math.PI * 0.18,        // #3 (~4 o'clock)
      Math.PI * 0.5,         // #4 (6 o'clock)
      Math.PI * 0.82,        // #5 (~8 o'clock)
      -Math.PI * 0.82        // #6 (~10 o'clock)
    ];

    for (var b = 0; b < 6; b++) {
      var faceNum = b + 1;
      var ba = boltAngles[b];
      var bx = cx + Math.cos(ba) * rBolt;
      var by = cy + Math.sin(ba) * rBolt;
      var glowCol = boltGlow[faceNum];

      if (glowCol) {
        var hGrad = ctx.createRadialGradient(bx, by, 4, bx, by, 28);
        hGrad.addColorStop(0, glowCol);
        hGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.arc(bx, by, 28, 0, TAU);
        ctx.fill();
      }

      // Hexagonal bolt head
      ctx.fillStyle = glowCol ? glowCol : "#d8ae5e";
      ctx.strokeStyle = glowCol ? "#fff6d6" : "#2e200a";
      ctx.lineWidth = glowCol ? 2.4 : 1.8;
      ctx.beginPath();
      for (var h = 0; h < 6; h++) {
        var ha = (h * TAU) / 6;
        var hx = bx + Math.cos(ha) * 10.5;
        var hy = by + Math.sin(ha) * 10.5;
        if (h === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Non-text visual pips right on/beside highlighted bolts so 1..6 reads blind!
      if (glowCol) {
        var badgeX = bx + Math.cos(ba) * 31;
        var badgeY = by + Math.sin(ba) * 31;
        ctx.fillStyle = "#fcf8ed";
        ctx.strokeStyle = glowCol;
        ctx.lineWidth = 2.2;
        roundRectPath(ctx, badgeX - 13, badgeY - 13, 26, 26, 6);
        ctx.fill();
        ctx.stroke();
        drawPips2D(ctx, badgeX, badgeY, 10.5, faceNum, glowCol);
      }
    }

    // Subtle curved porthole glass specular reflection
    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, rGlass - 14, -Math.PI * 0.78, -Math.PI * 0.46);
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // SETUP A BREAD-ROLL TIN COCKPIT SHELL & THREE CONSOLE CONTROLS
  // =========================================================================
  function drawSetupACockpit(ctx, W, stageH, opts) {
    var t = opts.t || 0;
    var showCaptions = opts.showCaptions !== false;
    var yaw = opts.yaw || 0;
    var activeModule = opts.activeModule || "lamp"; // "none" | "lamp" | "ballast"
    var lampToggleOn = !!opts.lampToggleOn;
    var ballastLever = opts.ballastLever || 0; // 0..1
    var chartProgress = opts.chartProgress || 0; // 0..1 route chalked
    var chartStar = opts.chartStar || 0; // 0..1 gold landmark dot

    ctx.save();
    if (Math.abs(yaw) > 0.0005) {
      ctx.translate(W * 0.5, stageH * 0.5);
      ctx.rotate(yaw);
      ctx.translate(-W * 0.5, -stageH * 0.5);
    }

    // Dark surrounding margin outside bread-tin rim
    ctx.fillStyle = "#0b1517";
    ctx.fillRect(-30, -30, W + 60, stageH + 60);

    // OVAL BREAD-ROLL TIN INTERIOR SHELL (#132427) WITH RIGHT-SIDE DENT!
    var tinLeft = 42, tinRight = W - 42, tinTop = 18, tinBot = stageH - 16;
    var tinGrad = ctx.createRadialGradient(W * 0.5, 90, 40, W * 0.5, 280, 660);
    tinGrad.addColorStop(0, "#1d3539");
    tinGrad.addColorStop(0.55, "#132427");
    tinGrad.addColorStop(1, "#0d191b");

    ctx.fillStyle = tinGrad;
    ctx.strokeStyle = "#567978";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tinLeft + 64, tinTop);
    ctx.lineTo(tinRight - 64, tinTop);
    ctx.quadraticCurveTo(tinRight, tinTop, tinRight, tinTop + 64);
    // Right wall with unmistakable INWARD HAMMERED DENT at y ~ 230..315!
    ctx.lineTo(tinRight, 212);
    ctx.bezierCurveTo(tinRight - 34, 236, tinRight - 36, 294, tinRight, 318);
    ctx.lineTo(tinRight, tinBot - 58);
    ctx.quadraticCurveTo(tinRight, tinBot, tinRight - 64, tinBot);
    ctx.lineTo(tinLeft + 64, tinBot);
    ctx.quadraticCurveTo(tinLeft, tinBot, tinLeft, tinBot - 58);
    ctx.lineTo(tinLeft, tinTop + 64);
    ctx.quadraticCurveTo(tinLeft, tinTop, tinLeft + 64, tinTop);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Specular amber highlight accentuating the right-side bread-tin dent!
    ctx.strokeStyle = "#edb473";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(tinRight - 3, 215);
    ctx.bezierCurveTo(tinRight - 31, 238, tinRight - 33, 292, tinRight - 3, 315);
    ctx.stroke();

    // Curved structural bread-tin ribs
    ctx.strokeStyle = "rgba(163, 218, 200, 0.08)";
    ctx.lineWidth = 2;
    var ribXs = [190, 340, 940, 1090];
    for (var rb = 0; rb < ribXs.length; rb++) {
      var rx = ribXs[rb];
      var bend = rx < 640 ? -22 : 22;
      ctx.beginPath();
      ctx.moveTo(rx, tinTop + 8);
      ctx.quadraticCurveTo(rx + bend, stageH * 0.5, rx, tinBot - 8);
      ctx.stroke();
    }

    // Overhead 2900K Amber Task-Light Bar (top-center invariant)
    var ambGlow = ctx.createRadialGradient(640, 34, 8, 640, 80, 340);
    ambGlow.addColorStop(0, "rgba(237, 180, 115, 0.34)");
    ambGlow.addColorStop(1, "rgba(237, 180, 115, 0)");
    ctx.fillStyle = ambGlow;
    ctx.fillRect(240, 18, 800, 260);

    ctx.strokeStyle = "#b07d43";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(130, 36);
    ctx.quadraticCurveTo(640, 20, 1150, 36);
    ctx.stroke();

    ctx.fillStyle = "#f2b86b";
    ctx.strokeStyle = "#2b1b08";
    ctx.lineWidth = 2;
    roundRectPath(ctx, 586, 20, 108, 18, 8);
    ctx.fill();
    ctx.stroke();

    // TOP-RIGHT: 1 DAY OF AIR HYDROSTATIC DIAL
    var dialX = 1072, dialY = 108, dialR = 40;
    ctx.save();
    ctx.fillStyle = "#b88a3e";
    ctx.strokeStyle = "#211607";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(dialX, dialY, dialR + 6, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f6eed9";
    ctx.beginPath();
    ctx.arc(dialX, dialY, dialR, 0, TAU);
    ctx.fill();

    // Green -> Amber -> Rust air reserve arc
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#2d7d52";
    ctx.beginPath();
    ctx.arc(dialX, dialY, dialR - 9, Math.PI * 0.8, Math.PI * 1.55);
    ctx.stroke();
    ctx.strokeStyle = "#e09f3e";
    ctx.beginPath();
    ctx.arc(dialX, dialY, dialR - 9, Math.PI * 1.55, Math.PI * 1.95);
    ctx.stroke();
    ctx.strokeStyle = "#c44527";
    ctx.beginPath();
    ctx.arc(dialX, dialY, dialR - 9, Math.PI * 1.95, Math.PI * 2.2);
    ctx.stroke();

    // Trembling air pressure needle
    var airAng = lerp(Math.PI * 1.15, Math.PI * 1.38, t / 48) + Math.sin(t * 9) * 0.025;
    ctx.strokeStyle = "#172629";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(dialX, dialY);
    ctx.lineTo(dialX + Math.cos(airAng) * (dialR - 11), dialY + Math.sin(airAng) * (dialR - 11));
    ctx.stroke();
    ctx.fillStyle = "#9e3d1c";
    ctx.beginPath();
    ctx.arc(dialX, dialY, 4.5, 0, TAU);
    ctx.fill();

    // Glass sight-tube beside air dial with rising tiny air bubble!
    roundRectPath(ctx, dialX + dialR + 12, dialY - 28, 12, 56, 5);
    ctx.fillStyle = "#205866";
    ctx.fill();
    ctx.strokeStyle = "#b88a3e";
    ctx.lineWidth = 2;
    ctx.stroke();
    var bubY = dialY + 20 - ((t * 18) % 42);
    ctx.fillStyle = "#d9f7ff";
    ctx.beginPath();
    ctx.arc(dialX + dialR + 18, bubY, 3.2, 0, TAU);
    ctx.fill();
    ctx.restore();

    // =====================================================================
    // CONTROL 1 (BOTTOM-LEFT): SINGLE SLOT / BALLAST SOCKET + SPARE CRADLE
    // =====================================================================
    var slotBoxX = 86, slotBoxY = 418, slotBoxW = 266, slotBoxH = 88;
    ctx.fillStyle = "#0e1c1f";
    ctx.strokeStyle = "#6e9992";
    ctx.lineWidth = 2;
    roundRectPath(ctx, slotBoxX, slotBoxY, slotBoxW, slotBoxH, 10);
    ctx.fill();
    ctx.stroke();

    // Left: Active Brass Dovetail Socket (x = 104..210)
    ctx.fillStyle = "#23383b";
    ctx.strokeStyle = "#cfa252";
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, slotBoxX + 14, slotBoxY + 34, 108, 42, 6);
    ctx.fill();
    ctx.stroke();

    // Right: Wooden Spare Cradle (x = 234..338)
    ctx.fillStyle = "#2a2118";
    ctx.strokeStyle = "#7d6445";
    ctx.lineWidth = 1.8;
    roundRectPath(ctx, slotBoxX + 146, slotBoxY + 40, 106, 36, 5);
    ctx.fill();
    ctx.stroke();

    // Draw mounted module in Single Slot + spare module in Cradle!
    if (activeModule === "lamp") {
      drawLampModuleProp(ctx, slotBoxX + 68, slotBoxY + 46, 0.92, lampToggleOn);
      drawBallastModuleProp(ctx, slotBoxX + 199, slotBoxY + 52, 0.78, 0);
    } else if (activeModule === "ballast") {
      drawBallastModuleProp(ctx, slotBoxX + 68, slotBoxY + 48, 0.95, ballastLever);
      drawLampModuleProp(ctx, slotBoxX + 199, slotBoxY + 50, 0.76, false);
    } else {
      // Empty socket! Both modules sit waiting in/beside spare cradle
      drawLampModuleProp(ctx, slotBoxX + 178, slotBoxY + 50, 0.72, false);
      drawBallastModuleProp(ctx, slotBoxX + 224, slotBoxY + 54, 0.68, 0);
    }

    // Copper power conduit from Single Slot to Porthole Lamp when Lamp Module mounted
    if (activeModule === "lamp") {
      ctx.strokeStyle = lampToggleOn ? "#f5be58" : "#6e552b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(slotBoxX + 122, slotBoxY + 52);
      ctx.quadraticCurveTo(450, 412, 616, 420);
      ctx.stroke();
    }

    // =====================================================================
    // CONTROL 2 (BOTTOM-CENTER): CHALK CHART UNDER GLASS
    // =====================================================================
    drawChalkChartBox(ctx, 422, 418, 436, 88, chartProgress, chartStar, false, showCaptions);

    // =====================================================================
    // CONTROL 3 (BOTTOM-RIGHT): BRASS LAMP TOGGLE SWITCH
    // =====================================================================
    var togBoxX = 934, togBoxY = 418, togBoxW = 248, togBoxH = 88;
    ctx.fillStyle = "#0e1c1f";
    ctx.strokeStyle = lampToggleOn ? "#f2b65d" : "#8c6d3b";
    ctx.lineWidth = 2.4;
    roundRectPath(ctx, togBoxX, togBoxY, togBoxW, togBoxH, 10);
    ctx.fill();
    ctx.stroke();

    var swX = togBoxX + togBoxW * 0.5 + 14;
    var swY = togBoxY + 64;
    // Indicator jewel
    ctx.fillStyle = lampToggleOn ? "#ffd666" : "#2b3b3d";
    ctx.strokeStyle = "#1a140b";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(swX - 54, swY - 4, 7, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Brass toggle collar & articulated bat-handle
    ctx.fillStyle = "#c99947";
    ctx.strokeStyle = "#241807";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(swX, swY, 12, 0, TAU);
    ctx.fill();
    ctx.stroke();

    var swAng = opts.toggleAngle !== undefined
      ? opts.toggleAngle
      : (lampToggleOn ? -0.68 : 0.68);
    ctx.save();
    ctx.translate(swX, swY);
    ctx.rotate(swAng);
    ctx.fillStyle = "#f5e6c8";
    ctx.strokeStyle = "#241807";
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, -4.2, -30, 8.4, 30, 4);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -29, 5.8, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Optional clean hardware labels ONLY when showCaptions !== false!
    if (showCaptions) {
      ctx.save();
      ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#edb473";
      ctx.fillText("OVAL BREAD-ROLL TIN · SETUP A", 88, 76);
      ctx.fillStyle = "#9ec0ba";
      ctx.fillText("1 DAY OF AIR", dialX - 40, dialY + dialR + 22);
      ctx.fillText("SINGLE SLOT · SNAP KIT", slotBoxX + 14, slotBoxY + 20);
      ctx.fillStyle = "#edb473";
      ctx.fillText("LAMP TOGGLE", togBoxX + 80, togBoxY + 19);

      // 2 o'clock rim chip leader line
      ctx.strokeStyle = "rgba(163, 218, 200, 0.55)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(812, 134);
      ctx.lineTo(886, 118);
      ctx.lineTo(1004, 118);
      ctx.stroke();
      ctx.fillStyle = "#b6d8d2";
      ctx.fillText("2 O'CLOCK CHIP", 890, 112);
      ctx.restore();
    }

    ctx.restore();
  }

  function drawLampModuleProp(ctx, cx, cy, scale, lit) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    // Brass dovetail key foot
    ctx.fillStyle = "#c99742";
    ctx.strokeStyle = "#211607";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-26, 8);
    ctx.lineTo(26, 8);
    ctx.lineTo(32, 20);
    ctx.lineTo(-32, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Round searchlight barrel + amber lens
    ctx.fillStyle = "#8c6527";
    roundRectPath(ctx, -22, -18, 44, 28, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = lit ? "#ffe07d" : "#406b73";
    ctx.beginPath();
    ctx.arc(0, -4, 11, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawBallastModuleProp(ctx, cx, cy, scale, leverPull) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    // Heavy low rectangular cast-iron ballast tray
    ctx.fillStyle = "#48595c";
    ctx.strokeStyle = "#141d1f";
    ctx.lineWidth = 2;
    roundRectPath(ctx, -36, -6, 72, 26, 4);
    ctx.fill();
    ctx.stroke();
    // Three lead weight bars
    ctx.fillStyle = "#758c90";
    for (var i = -1; i <= 1; i++) {
      ctx.fillRect(i * 20 - 7, -1, 14, 16);
    }
    // Brass grab handle / trim lever
    ctx.strokeStyle = "#e0ad52";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-16, -6);
    ctx.lineTo(-16 + leverPull * 10, -18);
    ctx.lineTo(16 + leverPull * 10, -18);
    ctx.lineTo(16, -6);
    ctx.stroke();
    ctx.restore();
  }

  function drawChalkChartBox(ctx, x, y, w, h, progress, starAmt, glassOpen, showCaptions) {
    ctx.save();
    // Slate frame
    ctx.fillStyle = "#132224";
    ctx.strokeStyle = "#91bdb5";
    ctx.lineWidth = 2;
    roundRectPath(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();

    // 4 corner brass screws
    var sc = [[x + 11, y + 11], [x + w - 11, y + 11], [x + 11, y + h - 11], [x + w - 11, y + h - 11]];
    ctx.fillStyle = "#d4a656";
    for (var i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(sc[i][0], sc[i][1], 3.2, 0, TAU);
      ctx.fill();
    }

    // Sketched creek banks on slate
    ctx.strokeStyle = "rgba(182, 208, 202, 0.35)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x + 28, y + h - 20);
    ctx.quadraticCurveTo(x + w * 0.36, y + 26, x + w * 0.54, y + h - 24);
    ctx.quadraticCurveTo(x + w * 0.74, y + 26, x + w - 34, y + 34);
    ctx.stroke();

    // Left bank: two tiny chalk tree trunks
    ctx.strokeStyle = "#cbe3dc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 44, y + h - 18);
    ctx.lineTo(x + 44, y + h - 38);
    ctx.moveTo(x + 52, y + h - 18);
    ctx.lineTo(x + 52, y + h - 40);
    ctx.stroke();

    // Midpoint: chalk V rock notch
    var nx = x + w * 0.52, ny = y + h * 0.55;
    ctx.beginPath();
    ctx.moveTo(nx - 10, ny - 8);
    ctx.lineTo(nx, ny + 6);
    ctx.lineTo(nx + 10, ny - 8);
    ctx.stroke();

    // Right landing: tiny chalk bell icon
    var lx = x + w - 48, ly = y + 34;
    ctx.strokeStyle = starAmt > 0.1 ? "#ffd563" : "#9cb8b3";
    ctx.beginPath();
    ctx.arc(lx, ly, 6, Math.PI, TAU);
    ctx.lineTo(lx + 8, ly + 7);
    ctx.lineTo(lx - 8, ly + 7);
    ctx.closePath();
    ctx.stroke();

    // Faint provisional path (first 35%) vs bright verified chalk route!
    ctx.save();
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = "rgba(255, 252, 240, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 58, y + h - 26);
    ctx.lineTo(x + w * 0.36, y + h * 0.48);
    ctx.stroke();

    if (progress > 0.01) {
      ctx.strokeStyle = "#fffdf5";
      ctx.lineWidth = 3.2;
      var totalSegs = 24;
      var maxSeg = Math.floor(progress * totalSegs);
      ctx.beginPath();
      for (var s = 0; s <= maxSeg; s++) {
        var u = s / totalSegs;
        var rx = lerp(x + 58, lx - 10, u);
        var ry = y + h * 0.56 + Math.sin(u * Math.PI * 2.1) * -16;
        if (s === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Gold verified landmark star/circle at landing!
    if (starAmt > 0.02) {
      ctx.save();
      var sr = 8 * easeOutBack(starAmt);
      ctx.fillStyle = "#ffd24c";
      ctx.strokeStyle = "#fff7d6";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(lx - 12, ly + 6, sr, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Glass glare strip (tilted up when glassOpen!)
    if (!glassOpen) {
      ctx.fillStyle = "rgba(210, 242, 245, 0.07)";
      ctx.beginPath();
      ctx.moveTo(x + 24, y + 6);
      ctx.lineTo(x + 86, y + 6);
      ctx.lineTo(x + 52, y + h - 6);
      ctx.lineTo(x + 8, y + h - 6);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.strokeStyle = "rgba(195, 238, 242, 0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 4);
      ctx.lineTo(x + w - 12, y - 22);
      ctx.stroke();
    }

    if (showCaptions) {
      ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#9ec0ba";
      ctx.fillText("CHALK CHART UNDER GLASS", x + 138, y + 20);
    }
    ctx.restore();
  }

  // =========================================================================
  // ACT 1A (0.0 – 4.0s): RIVER WORKS BENCH & FLOODED BEND WIDE MULTIPLANE
  // =========================================================================
  function drawAct1RiverWorksAndBend(ctx, W, stageH, t) {
    ctx.save();

    // Dusk river & sky backdrop on right two-thirds
    var skyGrad = ctx.createLinearGradient(0, 0, 0, stageH);
    skyGrad.addColorStop(0, "#132930");
    skyGrad.addColorStop(0.42, "#1f4954");
    skyGrad.addColorStop(0.43, "#18424d");
    skyGrad.addColorStop(1, "#0d2228");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, stageH);

    // Far wooded ridge + Twin Tree Trunks + Stone Steps + Landing Bell across the Flooded Bend!
    ctx.fillStyle = "#102327";
    ctx.beginPath();
    ctx.moveTo(430, 228);
    ctx.quadraticCurveTo(640, 175, 810, 214);
    ctx.lineTo(845, 238); // Culvert Rock Notch!
    ctx.lineTo(880, 210);
    ctx.quadraticCurveTo(1060, 172, 1280, 206);
    ctx.lineTo(1280, 250);
    ctx.lineTo(430, 250);
    ctx.closePath();
    ctx.fill();

    // Twin Tree Trunks at Bend
    ctx.fillStyle = "#193330";
    ctx.fillRect(738, 86, 18, 148);
    ctx.fillRect(768, 72, 20, 162);

    // Stone Steps on right bank
    ctx.fillStyle = "#3c6363";
    ctx.strokeStyle = "#102224";
    ctx.lineWidth = 2;
    for (var s = 0; s < 5; s++) {
      ctx.fillRect(1035 + s * 22, 215 + s * 18, 38, 18);
      ctx.strokeRect(1035 + s * 22, 215 + s * 18, 38, 18);
    }

    // Unlit Lantern Post & Brass Landing Bell waiting at right bank
    ctx.strokeStyle = "#182d2f";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(1020, 224);
    ctx.lineTo(1020, 148);
    ctx.lineTo(988, 148);
    ctx.stroke();
    ctx.fillStyle = "#e0ab48";
    ctx.beginPath();
    ctx.arc(988, 162, 11, Math.PI, TAU);
    ctx.lineTo(1002, 176);
    ctx.lineTo(974, 176);
    ctx.closePath();
    ctx.fill();

    // Swirling flood current lines + silt covering old crossing sign
    ctx.strokeStyle = "rgba(180, 226, 228, 0.28)";
    ctx.lineWidth = 2.2;
    for (var w = 0; w < 12; w++) {
      var wy = 264 + w * 21;
      var wx = 470 + ((t * 95 + w * 67) % 760);
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.quadraticCurveTo(wx + 32, wy - 5, wx + 64, wy);
      ctx.stroke();
    }

    // Half-submerged flooded crossing sign ("?") tilted in silt!
    ctx.save();
    ctx.translate(705, 310 + Math.sin(t * 3) * 3);
    ctx.rotate(0.28);
    ctx.fillStyle = "#7a5e3a";
    ctx.strokeStyle = "#1a140c";
    ctx.lineWidth = 2;
    ctx.fillRect(-4, -8, 8, 42);
    roundRectPath(ctx, -22, -32, 44, 28, 4);
    ctx.fillStyle = "#d9c89e";
    ctx.fill();
    ctx.stroke();
    // Silt splash across sign
    ctx.fillStyle = "rgba(122, 98, 62, 0.72)";
    ctx.beginPath();
    ctx.arc(4, -14, 15, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Brook the Spotted Trout waiting anxiously by the Landing Bell (attention at t=0.8s!)
    var brookRise = smoothstep(0.4, 1.3, t);
    drawBrookTrout(ctx, {
      x: 965 - Math.sin(t * 1.8) * 10,
      y: lerp(335, 292, brookRise),
      scale: 0.92,
      dir: -1,
      t: t,
      swimAmp: 1.15,
      pitch: 0.08 * brookRise,
      lookX: -0.8,
      lookY: -0.2,
      finReach: smoothstep(0.9, 1.8, t) * 0.85
    });

    // LEFT FOREGROUND: THE RIVER WORKS TIMBER BOATHOUSE & REPAIR BENCH
    ctx.fillStyle = "#1b1612";
    ctx.fillRect(0, 0, 488, stageH);
    // Warm vertical timber planks
    ctx.strokeStyle = "#2b221a";
    ctx.lineWidth = 2;
    for (var p = 1; p < 8; p++) {
      ctx.beginPath();
      ctx.moveTo(p * 62, 0);
      ctx.lineTo(p * 62, stageH);
      ctx.stroke();
    }
    // Framed window cutout looking out from Works to the Flooded Bend
    ctx.strokeStyle = "#4d3a28";
    ctx.lineWidth = 12;
    ctx.strokeRect(482, 6, W - 488, stageH - 12);

    // Chalk cross-section blueprint pinned on Works wall
    ctx.fillStyle = "#182d30";
    ctx.strokeStyle = "#91b5ad";
    ctx.lineWidth = 2;
    roundRectPath(ctx, 44, 88, 178, 108, 4);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(244, 240, 225, 0.75)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(133, 142, 62, 28, 0, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(133, 142, 13, 0, TAU);
    ctx.stroke();

    // Swinging Overhead 2900K Enamel Workshop Lamp
    var lampSway = Math.sin(t * 2.1) * 0.05;
    ctx.save();
    ctx.translate(290, 0);
    ctx.rotate(lampSway);
    ctx.strokeStyle = "#110d09";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 62);
    ctx.stroke();
    // Warm volumetric workshop cone
    var wkCone = ctx.createRadialGradient(0, 74, 10, 0, 260, 310);
    wkCone.addColorStop(0, "rgba(255, 206, 128, 0.42)");
    wkCone.addColorStop(1, "rgba(255, 180, 90, 0)");
    ctx.fillStyle = wkCone;
    ctx.beginPath();
    ctx.moveTo(-26, 72);
    ctx.lineTo(-240, stageH);
    ctx.lineTo(260, stageH);
    ctx.lineTo(26, 72);
    ctx.closePath();
    ctx.fill();
    // Enamel shade
    ctx.fillStyle = "#2d5c46";
    ctx.strokeStyle = "#121f18";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-36, 74);
    ctx.quadraticCurveTo(0, 46, 36, 74);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Wooden Repair Counter / Bench
    ctx.fillStyle = "#5c3d24";
    ctx.strokeStyle = "#1f130a";
    ctx.lineWidth = 3;
    ctx.fillRect(0, 386, 520, 150);
    ctx.strokeRect(0, 386, 520, 24);

    // Spare Kit Modules on the Works Counter (Lamp + Ballast)
    drawLampModuleProp(ctx, 92, 370, 0.9, false);
    drawBallastModuleProp(ctx, 178, 372, 0.9, 0);

    // CHILD-SCALE DENTED OVAL BREAD-ROLL TIN SUB ON SLIPWAY / BENCH!
    var launchU = easeInOutCubic(invLerp(3.0, 4.0, t));
    var subX = lerp(372, 575, launchU);
    var subY = lerp(346, 368, launchU);

    // Turkey Pilot acting: notices Brook (1.2s) -> points wing (2.0s) -> hops into tin hatch (2.9-3.6s)!
    var hopIn = smoothstep(2.75, 3.45, t);
    drawTurkeyPilot(ctx, {
      x: lerp(296, subX - 8, hopIn),
      y: lerp(322, subY - 6 + hopIn * 34, hopIn) - Math.sin(hopIn * Math.PI) * 38,
      scale: 0.78,
      dir: 1,
      t: t,
      neckLean: smoothstep(1.0, 1.8, t) * 0.16,
      headTilt: -0.08,
      lookX: 0.9,
      lookY: -0.1
    });

    if (t < 2.85) {
      var pointU = smoothstep(1.5, 2.2, t);
      drawTurkeyWingArm(
        ctx,
        292,
        344,
        lerp(318, 415, pointU),
        lerp(362, 304, pointU),
        1,
        0.18
      );
    }

    // Dented Bread-Roll Tin Exterior Hull
    ctx.save();
    ctx.translate(subX, subY);
    ctx.rotate(launchU * 0.05);
    // Hinged top hatch lid closing as Turkey climbs in!
    var lidClose = smoothstep(3.15, 3.7, t);
    ctx.save();
    ctx.translate(-38, -42);
    ctx.rotate(lerp(-0.95, 0, lidClose));
    ctx.fillStyle = "#5b7175";
    ctx.strokeStyle = "#172224";
    ctx.lineWidth = 2.4;
    roundRectPath(ctx, 0, -8, 78, 10, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Tin loaf body (trapezoid/oval tin with rolled rim & right-side dent!)
    var hullGrad = ctx.createLinearGradient(0, -42, 0, 44);
    hullGrad.addColorStop(0, "#758e91");
    hullGrad.addColorStop(0.5, "#496063");
    hullGrad.addColorStop(1, "#2a393b");
    ctx.fillStyle = hullGrad;
    ctx.strokeStyle = "#141f21";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(-98, -36);
    ctx.lineTo(102, -36);
    ctx.lineTo(94, -4);
    // Visible dent on starboard/front flank
    ctx.quadraticCurveTo(80, 10, 90, 24);
    ctx.lineTo(84, 38);
    ctx.lineTo(-86, 38);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rolled bread-tin lip
    roundRectPath(ctx, -104, -42, 212, 9, 4);
    ctx.fillStyle = "#95adaf";
    ctx.fill();
    ctx.stroke();

    // Front brass porthole on tin nose
    ctx.fillStyle = "#297482";
    ctx.strokeStyle = "#d9a94e";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(46, 2, 21, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // =========================================================================
  // ACT 3 REVERSE-ANGLE: TROUT LOOKING IN AT THE BREAD-ROLL TIN SUB!
  // =========================================================================
  function drawTroutLookingInScene(ctx, W, stageH, t, showForkBubbles) {
    ctx.save();
    // Cool deep emerald-teal creek water filling the stage
    var rGrad = ctx.createLinearGradient(0, 0, 0, stageH);
    rGrad.addColorStop(0, "#19525e");
    rGrad.addColorStop(0.6, "#113842");
    rGrad.addColorStop(1, "#0b2229");
    ctx.fillStyle = rGrad;
    ctx.fillRect(0, 0, W, stageH);

    // Drifting caustic ribbons
    for (var i = -3; i <= 3; i++) {
      ctx.fillStyle = "rgba(163, 228, 220, 0.06)";
      var rx = 640 + i * 165 + Math.sin(t * 1.3 + i) * 24;
      ctx.beginPath();
      ctx.moveTo(rx - 30, 0);
      ctx.lineTo(rx + 30, 0);
      ctx.lineTo(rx + 80, stageH);
      ctx.lineTo(rx - 60, stageH);
      ctx.closePath();
      ctx.fill();
    }

    // Exterior of the Oval Bread-Roll Tin Submarine floating mid-river (facing viewer!)
    var bobY = Math.sin(t * 2.2) * 5;
    var subCX = 590, subCY = 258 + bobY;

    ctx.save();
    ctx.translate(subCX, subCY);
    var extGrad = ctx.createRadialGradient(-30, -50, 30, 0, 0, 290);
    extGrad.addColorStop(0, "#688588");
    extGrad.addColorStop(0.65, "#384e52");
    extGrad.addColorStop(1, "#1e2d30");
    ctx.fillStyle = extGrad;
    ctx.strokeStyle = "#0e1a1c";
    ctx.lineWidth = 3.5;

    // Bread-tin front-three-quarter silhouette WITH side dent!
    ctx.beginPath();
    ctx.moveTo(-225, -162);
    ctx.lineTo(225, -162);
    ctx.quadraticCurveTo(268, -162, 260, -110);
    ctx.lineTo(248, -24);
    ctx.bezierCurveTo(220, 0, 222, 46, 244, 68); // tin dent!
    ctx.lineTo(232, 138);
    ctx.quadraticCurveTo(224, 174, 182, 174);
    ctx.lineTo(-182, 174);
    ctx.quadraticCurveTo(-224, 174, -232, 138);
    ctx.lineTo(-258, -110);
    ctx.quadraticCurveTo(-268, -162, -225, -162);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rolled upper bread-tin rim
    roundRectPath(ctx, -274, -176, 548, 22, 10);
    ctx.fillStyle = "#8aa5a8";
    ctx.fill();
    ctx.stroke();

    // Warm 2900K amber glow shining OUT through the porthole glass, with Turkey inside!
    var pR = 136;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 4, pR, 0, TAU);
    ctx.clip();
    var inGlow = ctx.createRadialGradient(0, -30, 12, 0, 10, pR);
    inGlow.addColorStop(0, "#4f361e");
    inGlow.addColorStop(0.6, "#2c2219");
    inGlow.addColorStop(1, "#161918");
    ctx.fillStyle = inGlow;
    ctx.fillRect(-pR, -pR, pR * 2, pR * 2);

    // Turkey inside peering out at Brook!
    drawTurkeyPilot(ctx, {
      x: -16,
      y: 54,
      scale: 1.02,
      dir: 1,
      t: t,
      headTilt: 0.06 * Math.sin(t * 3),
      lookX: 0.85,
      lookY: 0.05
    });
    ctx.restore();

    // Chipped Brass Porthole Frame with EVEN BOLTS (#2, #4, #6) glowing River Teal!
    drawSetupAPortholeFrame(ctx, 0, 4, pR, pR + 30, {
      lampMounted: true,
      lampOn: true,
      boltGlow: { 2: "#32b5cc", 4: "#32b5cc", 6: "#32b5cc" }
    });
    ctx.restore();

    // BROOK THE TROUT hovering outside right, peering IN across the glass!
    drawBrookTrout(ctx, {
      x: 965 + Math.sin(t * 2.4) * 10,
      y: 268 + Math.cos(t * 2.0) * 8,
      scale: 1.55,
      dir: -1,
      t: t,
      swimAmp: 0.9,
      lookX: -0.9,
      lookY: -0.05,
      finReach: 0.55 + Math.sin(t * 3) * 0.15
    });

    // Visual Duck/Rabbit Thought-Ripple Icons for Trout's This-or-That Fork (ZERO text needed!)
    if (showForkBubbles > 0.02) {
      ctx.save();
      ctx.globalAlpha = showForkBubbles;
      // Bubble A (top-left): Floating Roast Pan / Feathered Lure?
      drawThoughtMedallion(ctx, 185, 165, 68, "#32b5cc", function (c) {
        // Roasting tin + treble hook icon
        c.strokeStyle = "#e8f8fa";
        c.lineWidth = 2.4;
        roundRectPath(c, -34, 2, 68, 24, 5);
        c.stroke();
        // Steam curls / hook above
        c.beginPath();
        c.moveTo(0, -34);
        c.lineTo(0, -8);
        c.arc(8, -8, 8, Math.PI, 0, true);
        c.stroke();
      });

      // Bubble B (top-right above Brook): Friendly Survey Boat / Flashlight Helper?
      drawThoughtMedallion(ctx, 1065, 128, 68, "#32b5cc", function (c) {
        // Friendly sub + warm light beam icon
        c.fillStyle = "rgba(255, 220, 120, 0.55)";
        c.beginPath();
        c.moveTo(10, 0);
        c.lineTo(46, -22);
        c.lineTo(46, 22);
        c.closePath();
        c.fill();
        c.strokeStyle = "#e8f8fa";
        c.lineWidth = 2.4;
        c.beginPath();
        c.ellipse(-10, 0, 24, 15, 0, 0, TAU);
        c.stroke();
        c.beginPath();
        c.arc(-4, 0, 6, 0, TAU);
        c.stroke();
      });
      ctx.restore();
    }

    ctx.restore();
  }

  function drawThoughtMedallion(ctx, cx, cy, r, ringCol, iconFn) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = "rgba(14, 32, 36, 0.86)";
    ctx.strokeStyle = ringCol;
    ctx.lineWidth = 2.8;
    ctx.setLineDash([7, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    if (iconFn) iconFn(ctx);
    ctx.restore();
  }

  // =========================================================================
  // LOWER CREAM EDITORIAL STORY STRIP (y = 536..720, #faf8f3)
  // =========================================================================
  function getEditorialCaption(t) {
    if (t < 4.0) {
      return {
        act: 1,
        color: "#1d596e",
        kicker: "ACT I · SCION EPISODE-TOWN · RIVER WORKS & THE FLOODED BEND (0:00–0:08)",
        headline: "Flood silt hid the crossing; Brook waits by the bell while Turkey boards the bread-roll tin.",
        sub: "Primitives: River Works bench · Twin Tree Trunks · Culvert Rock Notch · Stone Steps · Brass Landing Bell"
      };
    }
    if (t < 8.0) {
      return {
        act: 1,
        color: "#9e3d1c",
        kicker: "ACT I · SCION EPISODE-COCKPIT · TURKEY'S SEAT IN SETUP A (0:04–0:08)",
        headline: "Start inside Turkey’s bread-tin boat: one chipped port, three controls, one day of air.",
        sub: "Invariants: right-side dent · 2-o’clock rim chip · Single Slot left · Chalk Chart center · Lamp Toggle right"
      };
    }
    if (t < 11.8) {
      return {
        act: 2,
        color: "#9e3d1c",
        kicker: "ACT II · SCION EPISODE-WORKS · SINGLE-SLOT SNAP: LAMP MODULE (0:08–0:16)",
        headline: "Snap in the Lamp Module and flip the toggle: aimed 2900K light cuts silt to reveal the rock notch.",
        sub: "Constraint: one attachment fits the Single Slot at a time; spare Ballast Tray rests in the bench cradle"
      };
    }
    if (t < 16.0) {
      return {
        act: 2,
        color: "#1d596e",
        kicker: "ACT II · SCION EPISODE-WORKS · SINGLE-SLOT SWAP: BALLAST TRAY (0:12–0:16)",
        headline: "Fast current stretches the ribbon—swap to Ballast to ride low in calm shelter behind the stone lip.",
        sub: "Recovery: Stone Steps stay open along the bank whenever a pilot returns to swap parts"
      };
    }
    if (t < 21.6) {
      return {
        act: 3,
        color: "#9e3d1c",
        kicker: "ACT III · FIRST PASS · TURKEY LOOKING OUT · ODD BOLTS 1 · 3 · 5 (0:16–0:26)",
        headline: "One shared silhouette across the glass: is it a sunken shipwreck trap or a giant’s wader boot?",
        sub: "Duck / Rabbit Cut (Side A): Turkey writes odd consequences (1 · 3 · 5) looking out from the amber cabin"
      };
    }
    if (t < 26.0) {
      return {
        act: 3,
        color: "#1d596e",
        kicker: "ACT III · SECOND PASS · TROUT LOOKING IN · EVEN BOLTS 2 · 4 · 6 (0:21–0:26)",
        headline: "Flip across the chipped glass: Brook sees either a floating roast pan or a friendly survey sub.",
        sub: "Duck / Rabbit Cut (Side B): Trout writes even consequences (2 · 4 · 6) looking in from the cool creek"
      };
    }
    if (t < 30.0) {
      return {
        act: 4,
        color: "#2d6846",
        kicker: "ACT IV · SCION EPISODE-DIE · SIX PEER CONSEQUENCES AROUND THE PORT (0:26–0:37)",
        headline: "Author six faces before rolling: 1–2 Probable (Teal), 3–4 Plausible (Green), 5–6 Preposterous (Rust).",
        sub: "Students’ LEGOS Beat: Location · Entity · Goal · Obstacle · Solution — peers supply all six outcomes"
      };
    }
    if (t < 37.0) {
      return {
        act: 4,
        color: "#2d6846",
        kicker: "ACT IV · SCION EPISODE-DIE · ROLL 1D6 & STAGE FACE #4 PLAUSIBLE (0:30–0:37)",
        headline: "Roll 1d6 after the pilot’s action—Face 4 lands, and Brook ties the red crossing ribbon at the notch!",
        sub: "Rule: stage only the rolled consequence so the next pilot inherits a visible change in the world"
      };
    }
    if (t < 44.0) {
      return {
        act: 5,
        color: "#9e3d1c",
        kicker: "ACT V · SCION EPISODE-MEMORY · CHALK CHART & SNAIL-MAIL POSTCARD (0:37–0:48)",
        headline: "Chalk the verified route under glass and dispatch the Porthole Postcard via River Snail Mail.",
        sub: "World Memory: river silt fades, but the chart mark and stamped postcard pass to the next author"
      };
    }
    return {
      act: 5,
      color: "#1d596e",
      kicker: "ACT V · SCION EPISODE-CROSSING · BROOK RINGS THE LANDING BELL (0:44–0:48)",
      headline: "Lantern lit at the bend: Brook completes the crossing and rings the brass landing bell three times!",
      sub: "Now pick any of the 55 Portholes below—watch the film or take the live controls yourself"
    };
  }

  function drawLowerStrip(ctx, W, H, stageH, t, showCaptions) {
    var stripH = H - stageH;
    ctx.save();
    ctx.fillStyle = "#faf8f3";
    ctx.fillRect(0, stageH, W, stripH);

    // Crisp dark editorial rule separating cockpit stage and cream paper
    ctx.fillStyle = "#14181a";
    ctx.fillRect(0, stageH, W, 3);

    var info = getEditorialCaption(t);

    if (!showCaptions) {
      // BLIND-CRITIC INVARIANT: ZERO text strings! Pure non-text 5-act visual progress dots!
      var barY = stageH + stripH * 0.5;
      ctx.strokeStyle = "#dfdad0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(460, barY);
      ctx.lineTo(820, barY);
      ctx.stroke();

      for (var a = 1; a <= 5; a++) {
        var ax = 460 + (a - 1) * 90;
        var active = a === info.act;
        ctx.fillStyle = active ? info.color : (a < info.act ? "#8fa6a0" : "#e5e0d5");
        ctx.beginPath();
        ctx.arc(ax, barY, active ? 8 : 5, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    // Editorial typography (matches 55-portholes.html VOIDBASTARD-TAO cream sheet)
    ctx.fillStyle = info.color;
    ctx.font = "700 13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText(info.kicker, 64, stageH + 34);

    // 5-Act progress pills top-right of strip
    for (var k = 1; k <= 5; k++) {
      var px = W - 260 + (k - 1) * 40;
      var py = stageH + 25;
      ctx.fillStyle = k === info.act ? info.color : "#e6e1d6";
      roundRectPath(ctx, px, py - 8, 30, 10, 4);
      ctx.fill();
    }

    ctx.fillStyle = "#14181a";
    ctx.font = "400 28px Georgia, 'Iowan Old Style', 'Times New Roman', serif";
    ctx.fillText(info.headline, 64, stageH + 86);

    ctx.fillStyle = "#546066";
    ctx.font = "italic 16px Georgia, 'Iowan Old Style', serif";
    ctx.fillText(info.sub, 64, stageH + 134);

    ctx.restore();
  }

  // =========================================================================
  // MASTER RENDERER: window.TROUT_SUB_INTRO.render(ctx, W, H, t, state)
  // =========================================================================
  function renderIntro(ctx, W, H, rawT, state) {
    var st = state || {};
    var t = clamp(rawT || 0, 0, 48.0);
    var showCaptions = st.showCaptions !== false;
    var stageH = 536; // Matches crew Setup A viewport (y=0..536, strip y=536..720)
    var pCX = 640, pCY = 220, pRGlass = 156, pROuter = 188;

    // Interactive state overrides (for Video-to-Game live play!)
    var hasManualLamp = typeof st.lamp === "boolean";
    var hasManualBallast = typeof st.ballast === "boolean";
    var manualView = st.view && st.view !== "auto" ? st.view : null;
    var manualRoll = st.roll && st.roll >= 1 && st.roll <= 6 ? Math.round(st.roll) : 0;

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    // Clip upper stage (0..536)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, stageH);
    ctx.clip();

    // ---------------------------------------------------------------------
    // ACT 1A (0.0 – 4.0s): River Works & Flooded Bend -> Iris into Setup A!
    // ---------------------------------------------------------------------
    if (t < 4.4 && !manualView && !hasManualLamp && !hasManualBallast) {
      drawAct1RiverWorksAndBend(ctx, W, stageH, t);
      if (t >= 3.7) {
        var irisU = easeInOutCubic(invLerp(3.7, 4.4, t));
        ctx.save();
        ctx.globalAlpha = irisU;
        drawCockpitComposite(ctx, W, stageH, t, st, pCX, pCY, pRGlass, pROuter);
        ctx.restore();
      }
    } else if (manualView === "trout" || (!manualView && t >= 22.9 && t < 26.0)) {
      // Pure Trout Looking In view (Act 3 second half or manual view="trout")
      drawTroutLookingInScene(ctx, W, stageH, t, t < 26.0 ? smoothstep(23.1, 23.8, t) : 0.85);
    } else if (!manualView && t >= 21.4 && t < 22.9) {
      // ACT 3 GLASS REFRACTION SPLIT: Half Turkey Looking Out | Half Trout Looking In!
      var splitU = easeInOutCubic(invLerp(21.4, 22.4, t));
      var splitX = lerp(W + 80, W * 0.5, splitU);

      // Left side of prism: Turkey inside Setup A looking out
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(splitX + 45, 0);
      ctx.lineTo(splitX - 45, stageH);
      ctx.lineTo(0, stageH);
      ctx.closePath();
      ctx.clip();
      drawCockpitComposite(ctx, W, stageH, t, st, pCX, pCY, pRGlass, pROuter);
      ctx.restore();

      // Right side of prism: Brook Trout outside in river looking in!
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(splitX + 45, 0);
      ctx.lineTo(W, 0);
      ctx.lineTo(W, stageH);
      ctx.lineTo(splitX - 45, stageH);
      ctx.closePath();
      ctx.clip();
      drawTroutLookingInScene(ctx, W, stageH, t, 0.9);
      ctx.restore();

      // Glowing beveled glass cut seam!
      ctx.strokeStyle = "#faf8f3";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(splitX + 45, 0);
      ctx.lineTo(splitX - 45, stageH);
      ctx.stroke();
    } else {
      // Standard Setup A Cockpit Composite (Acts 1B, 2, 3A, 4, 5 + interactive overrides!)
      drawCockpitComposite(ctx, W, stageH, t, st, pCX, pCY, pRGlass, pROuter);
    }

    // Subtle handmade paper/film grain lines across upper stage
    ctx.fillStyle = "rgba(255, 248, 230, 0.022)";
    for (var g = 0; g < 18; g++) {
      var gy = ((g * 31 + Math.floor(t * 24) * 17) % stageH);
      ctx.fillRect(0, gy, W, 1);
    }

    ctx.restore(); // end upper stage clip

    // Lower Cream Editorial Strip (hides all text when showCaptions === false!)
    drawLowerStrip(ctx, W, H, stageH, t, showCaptions);

    ctx.restore();
  }

  // =========================================================================
  // SETUP A COCKPIT COMPOSITE ACROSS ACTS 1B, 2, 3A, 4, 5
  // =========================================================================
  function drawCockpitComposite(ctx, W, stageH, t, st, pCX, pCY, pRGlass, pROuter) {
    var showCaptions = st.showCaptions !== false;
    var hasManualLamp = typeof st.lamp === "boolean";
    var hasManualBallast = typeof st.ballast === "boolean";
    var manualRoll = st.roll && st.roll >= 1 && st.roll <= 6 ? Math.round(st.roll) : 0;

    // Derive physical timeline states cleanly from `t` (with interactive overrides!)
    var activeModule = "none";
    if (t >= 9.15 && t < 13.0) activeModule = "lamp";
    else if (t >= 13.9 && t < 16.2) activeModule = "ballast";
    else if (t >= 16.2) activeModule = "lamp";

    if (hasManualBallast && st.ballast) activeModule = "ballast";
    else if (hasManualLamp && st.lamp) activeModule = "lamp";

    var lampToggleOn = (t >= 10.0 && t < 12.55) || (t >= 16.4);
    if (hasManualLamp) lampToggleOn = !!st.lamp;
    var lampBeamOn = lampToggleOn && activeModule === "lamp";

    var fastFlow = (t >= 11.8 && t < 16.0) ? smoothstep(11.8, 12.4, t) : 0;
    var ballastDepth = activeModule === "ballast"
      ? (hasManualBallast ? 1.0 : smoothstep(14.2, 15.2, t))
      : 0;
    var bubblesAmt = (t >= 14.1 && t < 15.3) ? Math.sin(invLerp(14.1, 15.3, t) * Math.PI) : 0;

    // Yaw buffet when fast water hits BEFORE ballast shelters the boat!
    var yaw = (t >= 11.9 && t < 14.4)
      ? Math.sin(t * 11) * 0.028 * (1 - ballastDepth)
      : Math.sin(t * 1.4) * 0.003;

    // Silt density: thick in Act 1B & early Act 2, fades away permanently in Act 5!
    var siltAmt = 0.78;
    if (t >= 16.0 && t < 26.0) siltAmt = 0.25;
    else if (t >= 26.0 && t < 38.0) siltAmt = 0.35;
    else if (t >= 38.0) siltAmt = lerp(0.35, 0.0, smoothstep(38.0, 41.0, t));

    // Aiming lamp sweep in Act 2 (10.1 – 11.6s)
    var lampAimX = (t >= 10.0 && t < 11.8)
      ? Math.sin(invLerp(10.0, 11.4, t) * Math.PI * 1.5) * -32 * (1 - smoothstep(11.0, 11.6, t))
      : 0;

    var rolledFace = manualRoll || 4;
    var ribbonTied = t >= 35.2 || (manualRoll > 0 && t >= 33.5);
    var chartProgress = smoothstep(37.6, 39.6, t);
    var chartStar = smoothstep(39.6, 40.2, t);
    var lanternLit = t >= 44.0;

    // Bell swing & acoustic rings at 45.1s, 45.8s, 46.5s!
    var bellSwing = 0;
    var bellRings = 0;
    if (t >= 44.9) {
      var bt = t - 45.0;
      bellSwing = Math.sin(bt * 9.0) * 0.42 * Math.exp(-Math.max(0, bt - 1.8) * 1.5);
      bellRings = clamp(1 - ((t - 45.0) / 2.8), 0, 1);
    }

    // Bolt glow map for Acts 3 & 4 (+ manualRoll!)
    var boltGlow = {};
    if (st.view === "turkey" || (t >= 17.2 && t < 22.9)) {
      boltGlow[1] = "#d96538";
      boltGlow[3] = "#d96538";
      boltGlow[5] = "#d96538";
    } else if (t >= 26.2 && t < 27.4) {
      boltGlow[1] = "#2a9db8";
      boltGlow[2] = "#2a9db8";
    } else if (t >= 27.4 && t < 28.6) {
      boltGlow[3] = "#369c64";
      boltGlow[4] = "#369c64";
    } else if (t >= 28.6 && t < 29.9) {
      boltGlow[5] = "#d45328";
      boltGlow[6] = "#d45328";
    } else if (t >= 32.5 && t < 37.0) {
      boltGlow[rolledFace] = registerColorForFace(rolledFace);
    }
    if (manualRoll > 0) {
      boltGlow[manualRoll] = registerColorForFace(manualRoll);
    }

    // Toggle switch spring-resistance animation around t=10.0s & t=12.5s
    var toggleAngle = lampToggleOn ? -0.68 : 0.68;
    if (!hasManualLamp && t >= 9.75 && t < 10.12) {
      toggleAngle = lerp(0.68, -0.68, easeOutBack(invLerp(9.85, 10.06, t)));
    }

    // 1. Draw Setup A Bread-Tin Cockpit Shell & Console
    drawSetupACockpit(ctx, W, stageH, {
      t: t,
      showCaptions: showCaptions,
      yaw: yaw,
      activeModule: activeModule,
      lampToggleOn: lampToggleOn,
      toggleAngle: toggleAngle,
      ballastLever: smoothstep(14.1, 14.5, t),
      chartProgress: chartProgress,
      chartStar: chartStar
    });

    // 2. Clip & Draw Multiplane River Exterior Inside the Centered Porthole!
    ctx.save();
    if (Math.abs(yaw) > 0.0005) {
      ctx.translate(W * 0.5, stageH * 0.5);
      ctx.rotate(yaw);
      ctx.translate(-W * 0.5, -stageH * 0.5);
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(pCX, pCY, pRGlass, 0, TAU);
    ctx.clip();

    var duckRabbitSil = (t >= 16.0 && t < 22.9) ? smoothstep(16.0, 16.8, t) : 0;
    var prepostBeat = (t >= 28.6 && t < 29.9) ? Math.sin(invLerp(28.6, 29.9, t) * Math.PI) : 0;

    drawRiverBendWorld(ctx, pCX, pCY, pRGlass, {
      t: t,
      siltAmt: siltAmt,
      lampOn: lampBeamOn,
      lampAimX: lampAimX,
      fastFlow: fastFlow,
      ballastDepth: ballastDepth,
      bubblesAmt: bubblesAmt,
      ribbonTied: ribbonTied,
      lanternLit: lanternLit,
      bellSwing: bellSwing,
      bellRings: bellRings,
      duckRabbit: duckRabbitSil,
      preposterousBeat: prepostBeat
    });

    // Brook the Trout acting outside inside the porthole (Act 4 Plausible + Act 4 Consequence + Act 5 Bell!)
    if (t >= 27.4 && t < 28.6) {
      // Plausible preview: Brook swims past holding landmark photo
      drawBrookTrout(ctx, {
        x: pCX + 46,
        y: pCY + 24,
        scale: 0.78,
        dir: -1,
        t: t,
        lookX: -0.8
      });
    } else if (t >= 33.4 && t < 37.0) {
      // Act 4 Rolled Outcome: Brook swims to Culvert Notch & ties Red Ribbon!
      var swimU = easeInOutCubic(invLerp(33.5, 35.1, t));
      drawBrookTrout(ctx, {
        x: lerp(pCX + 135, pCX + 58, swimU),
        y: lerp(pCY + 58, pCY - 22, swimU) + Math.sin(t * 4) * 4,
        scale: 0.82,
        dir: -1,
        t: t,
        swimAmp: t < 35.2 ? 1.4 : 0.8,
        holdingRibbon: t < 35.2,
        finReach: smoothstep(34.7, 35.3, t)
      });
    } else if (t >= 40.6) {
      // Act 5B + 5C: River Mail Snail on mossy bank ledge + Brook ringing Brass Landing Bell!
      ctx.fillStyle = "#2c4a38";
      ctx.strokeStyle = "#102117";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(pCX - 180, pCY + 108);
      ctx.quadraticCurveTo(pCX, pCY + 90, pCX + 180, pCY + 106);
      ctx.lineTo(pCX + 180, pCY + 180);
      ctx.lineTo(pCX - 180, pCY + 180);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      var snailGlide = smoothstep(42.0, 47.6, t);
      var gotCard = t >= 41.9;
      var salute = (t >= 42.1 && t < 43.1) ? Math.sin(invLerp(42.1, 43.1, t) * Math.PI) : 0;
      drawMailSnail(ctx, lerp(pCX - 46, pCX + 86, snailGlide), pCY + 86, 0.96, t, gotCard, salute);

      if (t >= 44.0) {
        // Brook leaps/rises to the Brass Landing Bell & rings it 3 times!
        var arriveU = easeInOutCubic(invLerp(44.0, 44.8, t));
        var tugY = t >= 44.9 ? Math.abs(Math.sin((t - 45.0) * 4.5)) * 8 : 0;
        drawBrookTrout(ctx, {
          x: lerp(pCX - 40, pCX + 22, arriveU),
          y: lerp(pCY + 34, pCY - 28, arriveU) + tugY,
          scale: 0.84,
          dir: 1,
          t: t,
          pitch: -0.22 * arriveU,
          finReach: smoothstep(44.6, 45.0, t) * 0.95,
          lookX: 0.7,
          lookY: -0.5
        });
      }
    }

    ctx.restore(); // end glass clip

    // 3. Porthole Brass Bezel (on top of river clip, preserving 2-o'clock rim chip!)
    drawSetupAPortholeFrame(ctx, pCX, pCY, pRGlass, pROuter, {
      boltGlow: boltGlow,
      lampMounted: activeModule === "lamp",
      lampOn: lampBeamOn
    });

    // Snap click shockwave ring on Single Slot at t=9.15s & t=13.9s!
    if ((t >= 9.12 && t < 9.65) || (t >= 13.88 && t < 14.4)) {
      var snapP = t < 11 ? invLerp(9.12, 9.65, t) : invLerp(13.88, 14.4, t);
      ctx.strokeStyle = "rgba(255, 222, 128," + (1 - snapP).toFixed(3) + ")";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(154, 468, 16 + snapP * 48, 0, TAU);
      ctx.stroke();
    }

    // 4. Act 3A Thought Medallions for Turkey Looking Out (Shipwreck vs Giant Boot!)
    if (t >= 17.3 && t < 22.8) {
      var medAlpha = smoothstep(17.3, 18.0, t);
      ctx.save();
      ctx.globalAlpha = medAlpha;
      // Left medallion: Shipwreck funnel / monster trap
      drawThoughtMedallion(ctx, 355, 195, 58, "#d96538", function (c) {
        c.strokeStyle = "#ffe6c7";
        c.lineWidth = 2.2;
        // Sinking ship hull + funnel
        c.beginPath();
        c.moveTo(-30, 8);
        c.lineTo(28, 16);
        c.lineTo(18, 28);
        c.lineTo(-24, 22);
        c.closePath();
        c.stroke();
        c.strokeRect(-6, -20, 14, 28);
      });
      // Right medallion: Giant boot / safe arch tunnel
      drawThoughtMedallion(ctx, 925, 195, 58, "#d96538", function (c) {
        c.strokeStyle = "#ffe6c7";
        c.lineWidth = 2.2;
        // Stone tunnel arch + arrow through
        c.beginPath();
        c.arc(0, 6, 22, Math.PI, TAU);
        c.lineTo(22, 24);
        c.moveTo(-22, 6);
        c.lineTo(-22, 24);
        c.stroke();
        c.beginPath();
        c.moveTo(-14, 14);
        c.lineTo(14, 14);
        c.lineTo(7, 8);
        c.stroke();
      });
      ctx.restore();
    }

    // 5. ACT 5A MAGNIFIED CHALK CHART INSET (37.1 – 40.5s) + ACT 5B POSTCARD DISPATCH (40.6 – 42.1s)
    if (t >= 37.1 && t < 40.55) {
      var zoomU = Math.min(smoothstep(37.1, 37.5, t), 1 - smoothstep(40.15, 40.55, t));
      ctx.save();
      ctx.globalAlpha = zoomU;
      drawChalkChartBox(ctx, 392, 316, 496, 118, chartProgress, chartStar, t < 40.2, showCaptions);
      // Chalk dust motes puffing off moving chalk tip!
      if (t >= 37.6 && t < 39.8) {
        var tipX = lerp(450, 830, chartProgress);
        var tipY = 382 + Math.sin(chartProgress * Math.PI * 2.1) * -16;
        ctx.fillStyle = "rgba(255, 253, 242, 0.85)";
        for (var cd = 0; cd < 5; cd++) {
          ctx.beginPath();
          ctx.arc(tipX - cd * 5, tipY + ((cd * 7) % 11) - 4, 2, 0, TAU);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    if (t >= 40.55 && t < 42.1) {
      var cardSlide = easeInOutCubic(invLerp(41.0, 41.95, t));
      var cardX = lerp(470, pCX - 28, cardSlide);
      var cardY = lerp(370, pCY + 66, cardSlide);
      var cardSc = lerp(2.4, 1.0, cardSlide);
      ctx.save();
      ctx.translate(cardX, cardY);
      ctx.scale(cardSc, cardSc);
      drawPostcardMini(ctx, 0, 0, 42, 28);
      ctx.restore();
    }

    // 6. TURKEY PILOT IN FOREGROUND SEAT + ARTICULATED FEATHERED WING ACTING!
    var lookX = 0.65, lookY = -0.1, headTilt = 0, beakOpen = 0;
    if (t < 6.4) { lookX = 0.85; lookY = -0.25; }
    else if (t < 8.0) { lookX = Math.sin(t * 2.5) * 0.7; lookY = 0.45; }
    else if (t >= 8.2 && t < 9.5) { lookX = -0.35; lookY = 0.55; headTilt = 0.14; }
    else if (t >= 9.5 && t < 10.3) { lookX = 0.95; lookY = 0.45; }
    else if (t >= 11.8 && t < 12.6) { beakOpen = 0.45; headTilt = -0.12; }
    else if (t >= 17.2 && t < 21.4) { headTilt = 0.16 * Math.sin(t * 2.2); }
    else if (t >= 30.0 && t < 33.4) { lookX = 0.75; lookY = 0.35; headTilt = 0.1; }
    else if (t >= 45.0) { headTilt = -0.08; beakOpen = 0.25; }

    var blink = ((t * 10) % 37 < 1.2) ? 0.92 : 0;

    // Anatomical seat weight-shift when Turkey scoots right to flip Lamp Toggle or chalk the Chart!
    var scootRight = 0;
    if (t >= 9.35 && t < 10.8) {
      scootRight = Math.min(smoothstep(9.35, 9.8, t), 1 - smoothstep(10.3, 10.8, t)) * 590;
    } else if (t >= 37.1 && t < 40.5) {
      scootRight = Math.min(smoothstep(37.1, 37.55, t), 1 - smoothstep(40.05, 40.5, t)) * 340;
    }
    var turkX = 204 + scootRight;
    var turkY = 314;

    drawTurkeyPilot(ctx, {
      x: turkX,
      y: turkY,
      scale: 0.92,
      dir: 1,
      t: t,
      headTilt: headTilt,
      neckLean: 0.06 + Math.sin(t * 1.7) * 0.02 + (scootRight > 20 ? 0.12 : 0),
      lookX: lookX,
      lookY: lookY,
      blink: blink,
      beakOpen: beakOpen
    });

    // Articulated Wing Choreographies across all 5 Acts!
    if (t >= 8.2 && t < 9.35) {
      // Snapping Lamp Module from spare cradle into Single Slot!
      var uSnap = invLerp(8.3, 9.15, t);
      var wx = lerp(285, 154, easeInOutCubic(uSnap));
      var wy = lerp(455, 456, uSnap) - Math.sin(uSnap * Math.PI) * 58;
      drawTurkeyWingArm(ctx, turkX + 10, turkY + 48, wx, wy, 1, 0.14, function (c) {
        if (t < 9.15) drawLampModuleProp(c, 22, 0, 0.85, false);
      });
    } else if (t >= 9.35 && t < 10.75) {
      // Scooted across seat -> natural elbow bend flipping Lamp Toggle UP!
      var uTog = easeInOutCubic(invLerp(9.5, 9.98, t));
      drawTurkeyWingArm(ctx, turkX + 26, turkY + 46, lerp(turkX + 95, 1054, uTog), lerp(416, 454, uTog), 1, 0.16);
    } else if (t >= 12.6 && t < 14.5) {
      // Swapping Lamp out & Snapping Ballast Tray into Single Slot!
      var uBal = invLerp(13.1, 13.9, t);
      var bx = lerp(285, 154, easeInOutCubic(uBal));
      var by = 456 - Math.sin(clamp(uBal, 0, 1) * Math.PI) * 52;
      drawTurkeyWingArm(ctx, turkX + 10, turkY + 48, bx, by, 1, 0.14, function (c) {
        if (t >= 13.1 && t < 13.9) drawBallastModuleProp(c, 24, 0, 0.85, 0);
      });
    } else if (t >= 17.4 && t < 21.4) {
      // Thoughtful wing-to-beak suspicion pose in Act 3!
      drawTurkeyWingArm(ctx, turkX + 18, turkY + 52, turkX + 52, 286 + Math.sin(t * 3) * 4, 1, 0.22);
    } else if (t >= 29.8 && t < 30.55) {
      // Shaking & tossing the 1d6 die onto the chart!
      var shakeY = Math.sin(t * 28) * 14;
      drawTurkeyWingArm(ctx, turkX + 24, turkY + 48, 412, 326 + shakeY, 1, 0.24);
    } else if (t >= 37.3 && t < 40.25) {
      // Drawing the verified route on the Chalk Chart with white chalk stick (natural bent elbow)!
      var cxTip = t < 39.6 ? lerp(450, 830, chartProgress) : 832;
      var cyTip = t < 39.6 ? (382 + Math.sin(chartProgress * Math.PI * 2.1) * -16) : 356;
      drawTurkeyWingArm(ctx, turkX + 24, turkY + 48, cxTip - 18, cyTip + 6, 1, 0.12, function (c) {
        c.fillStyle = "#fffdf5";
        c.strokeStyle = "#2b2822";
        c.lineWidth = 1.5;
        roundRectPath(c, 16, -4, 24, 8, 2);
        c.fill();
        c.stroke();
      });
    } else if (t >= 40.6 && t < 41.5) {
      // Stamping & sliding Porthole Postcard!
      drawTurkeyWingArm(ctx, turkX + 24, turkY + 48, 422, 372, 1, 0.18);
    } else if (t >= 45.1) {
      // Warm feathered wing salute to Brook as the Brass Bell rings (elbow tucked naturally down)!
      var salU = smoothstep(45.1, 45.6, t);
      drawTurkeyWingArm(ctx, turkX + 18, turkY + 54, lerp(turkX + 76, turkX + 68, salU), lerp(388, 266, salU), 1, 0.22);
    }

    // 7. ACT 4 TUMBLING 3D-PROJECTED 1D6 DIE (29.9 – 36.8s or when manualRoll > 0!)
    if ((t >= 29.9 && t < 36.8) || manualRoll > 0) {
      var dieGoal = targetEulerForFace(rolledFace);
      var dieX = 640, dieY = 338, dieScale = 44;
      var rx = dieGoal[0], ry = dieGoal[1], rz = dieGoal[2];
      var settled = true;

      if (t >= 29.9 && t < 32.65 && !manualRoll) {
        settled = false;
        var dt = invLerp(30.15, 32.6, t);
        dieX = lerp(485, 640, easeInOutCubic(dt));
        // Multi-bounce gravity curve!
        var bounce = Math.abs(Math.sin(dt * Math.PI * 3.5)) * Math.pow(1 - dt, 1.55) * 125;
        dieY = 344 - bounce;
        var spinFade = Math.pow(1 - dt, 1.85);
        rx = dieGoal[0] + spinFade * 14.5;
        ry = dieGoal[1] + spinFade * 18.2;
        rz = dieGoal[2] + spinFade * 9.4;
      } else if (t >= 34.0 || manualRoll > 0) {
        // Park die neatly at upper-left of chart so Brook's ribbon tie is unobstructed!
        var parkU = manualRoll > 0 ? 1 : smoothstep(34.0, 34.6, t);
        dieX = lerp(640, 468, parkU);
        dieY = lerp(344, 366, parkU);
        dieScale = lerp(44, 30, parkU);
      }

      // Contact shadow beneath 3D die
      ctx.fillStyle = "rgba(8, 16, 18, 0.42)";
      ctx.beginPath();
      ctx.ellipse(dieX, 358 + (dieScale < 40 ? 22 : 0), dieScale * 0.95, dieScale * 0.38, 0, 0, TAU);
      ctx.fill();

      drawDie3D(ctx, dieX, dieY, dieScale, rx, ry, rz, settled ? rolledFace : 0);
    }

    ctx.restore(); // end yaw transform
  }

  window.TROUT_SUB_INTRO = {
    id: "intro",
    title: "Turkey Sub · SCION Setup A Activity Introduction",
    duration: 48.0,
    fps: 24,
    frames: 1152,
    defaultTool: "lamp",
    acts: [
      { act: 1, start: 0, end: 8, scions: ["episode-town", "episode-cockpit"], title: "River Works, Flooded Bend & Setup A Cockpit" },
      { act: 2, start: 8, end: 16, scions: ["episode-works"], title: "The Works Construction Kit: Lamp vs. Ballast" },
      { act: 3, start: 16, end: 26, scions: ["duck-rabbit"], title: "Two Views Across Glass: Turkey (1·3·5) vs. Trout (2·4·6)" },
      { act: 4, start: 26, end: 37, scions: ["episode-die"], title: "The Students' LEGOS Beat: 6-Bolt Ring & 1d6 Roll" },
      { act: 5, start: 37, end: 48, scions: ["episode-crossing", "episode-memory"], title: "Chalk Chart, Snail Mail Postcard & Landing Bell" }
    ],
    render: renderIntro
  };
})();
