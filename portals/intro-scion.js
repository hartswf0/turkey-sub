/* ==========================================================================
 * TROUT SUB · SCION ACTIVITY INTRODUCTION FILM & INTERACTIVE COCKPIT MODULE
 * File: portals/intro-scion.js
 * Format: 1280x720 · 24fps · 52.0s (1248 frames) · PAELEO Handmade 2D Canvas
 * Core Trout Town 3-Pass Snail Mail Canon:
 *   "The Trout, Turkey, and Alien Listening Post communicate through Snail Mail."
 *   - First Pass  = PROBABLE (Faces 1–2, Teal #1d596e) · Turkey Looks Out
 *   - Second Pass = PLAUSIBLE (Faces 3–4, Green #2d6846) · Trout Looks In (via Snail Mail)
 *   - Third Pass  = PREPOSTEROUS / OUT OF BOUNDS (Faces 5–6, Rust #9e3d1c) · Alien Listening Post (Dear Alien)
 * Covers all 6 core Episode SCIONs + 3-Pass Snail Mail Chain:
 *   Act 1 (0.0–8.0s):   episode-town + episode-cockpit (Sealed Glass Barrier -> Why Snail Mail!)
 *   Act 2 (8.0–15.6s):  episode-works (Single Slot LEGO-snap: Lamp Module vs Ballast Tray)
 *   Act 3 (15.6–31.6s): 3-Pass Snail Mail Chain (Turkey 1–2 -> Trout 3–4 -> Alien 5–6!)
 *   Act 4 (31.6–41.2s): episode-die (All 6 Bolts Armed + 3D 1d6 Roll + Snail Mail Ending Stamp)
 *   Act 5 (41.2–52.0s): episode-crossing + episode-memory (Chalk Chart, Snail Mail Clue & Bell)
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
  // Deterministic hash for particles/caustics/grain/stars (no Math.random!)
  function hash1(n) {
    var s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  function quadBezierPt(p0, p1, p2, u) {
    var inv = 1 - u;
    return [
      inv * inv * p0[0] + 2 * inv * u * p1[0] + u * u * p2[0],
      inv * inv * p0[1] + 2 * inv * u * p1[1] + u * u * p2[1]
    ];
  }

  function quadBezierAngle(p0, p1, p2, u) {
    var dx = 2 * (1 - u) * (p1[0] - p0[0]) + 2 * u * (p2[0] - p1[0]);
    var dy = 2 * (1 - u) * (p1[1] - p0[1]) + 2 * u * (p2[1] - p1[1]);
    return Math.atan2(dy, dx);
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
    var rDot = Math.max(1.8, rad * 0.19);
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
    var dir = opts.dir === -1 ? -1 : 1;
    var t = opts.t || 0;
    var swimAmp = opts.swimAmp !== undefined ? opts.swimAmp : 1;
    var pitch = opts.pitch || 0;
    var lookX = opts.lookX !== undefined ? opts.lookX : 0.35;
    var lookY = opts.lookY !== undefined ? opts.lookY : 0;
    var finReach = opts.finReach || 0;
    var mouthOpen = opts.mouthOpen || 0;
    var holdingRibbon = !!opts.holdingRibbon;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(pitch);
    ctx.scale(dir * scale, scale);

    var wag = Math.sin(t * 7.2) * 8 * swimAmp;
    var wag2 = Math.sin(t * 7.2 - 1.1) * 13 * swimAmp;

    // Forked caudal (tail) fin
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

    // Streamlined trout body
    var bodyGrad = ctx.createLinearGradient(0, -24, 0, 24);
    bodyGrad.addColorStop(0, "#1f4e4a");
    bodyGrad.addColorStop(0.48, "#3e7d75");
    bodyGrad.addColorStop(0.62, "#d78471");
    bodyGrad.addColorStop(1, "#dfece4");

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = "#0e2220";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(52, 1);
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

    if (mouthOpen <= 0.04) {
      ctx.beginPath();
      ctx.moveTo(51, 2);
      ctx.quadraticCurveTo(42, 5, 35, 3.5);
      ctx.strokeStyle = "#0e2220";
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

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

    var gillOpen = Math.sin(t * 4.2) * 1.2;
    ctx.strokeStyle = "#102826";
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.arc(22 + gillOpen * 0.4, 1, 13.5, Math.PI * 0.68, Math.PI * 1.34);
    ctx.stroke();

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

    // Articulated pectoral fin
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

    ctx.strokeStyle = "rgba(237, 180, 115, 0.36)";
    ctx.lineWidth = 1.6;
    for (var row = 0; row < 3; row++) {
      for (var col = -1; col <= 1; col++) {
        ctx.beginPath();
        ctx.arc(-8 + col * 18, 32 + row * 16, 9, -0.5, 0.9);
        ctx.stroke();
      }
    }

    ctx.save();
    ctx.rotate(neckLean);

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

    ctx.translate(8, -50);
    ctx.rotate(headTilt);

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

    ctx.fillStyle = "#d99b43";
    ctx.strokeStyle = "#241608";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(-2, -17, 17, 6.5, -0.18, 0, TAU);
    ctx.fill();
    ctx.stroke();

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

    ctx.beginPath();
    ctx.moveTo(19, 3);
    ctx.lineTo(34, 6 + beakOpen * 6);
    ctx.quadraticCurveTo(25, 11 + beakOpen * 5, 17, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#d63229";
    ctx.beginPath();
    ctx.moveTo(22, -8);
    ctx.quadraticCurveTo(29, -12, 28, 3);
    ctx.quadraticCurveTo(26, 9, 22, 5);
    ctx.closePath();
    ctx.fill();

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

    ctx.restore();
    ctx.restore();
  }

  function drawTurkeyWingArm(ctx, sx, sy, tx, ty, bendDir, spread, propFn) {
    var dx = tx - sx;
    var dy = ty - sy;
    var dist = Math.max(20, Math.hypot(dx, dy));
    var limb = clamp(dist * 0.66, 68, 135);
    var L1 = limb;
    var L2 = limb;
    var clamped = Math.min(dist, L1 + L2 - 4);
    var baseAng = Math.atan2(dy, dx);
    var cosA = clamp((L1 * L1 + clamped * clamped - L2 * L2) / (2 * L1 * clamped), -1, 1);
    var elbowAng = baseAng + (bendDir >= 0 ? 1 : -1) * Math.acos(cosA);
    var ex = sx + Math.cos(elbowAng) * L1;
    var ey = sy + Math.sin(elbowAng) * L1;
    var handAng = Math.atan2(ty - ey, tx - ex);

    ctx.save();
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

    ctx.strokeStyle = "#edb473";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 7);
    ctx.lineTo(ex, ey - 7);
    ctx.lineTo(tx, ty - 5);
    ctx.stroke();

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
  // ARTICULATED RIG 3: TROUT TOWN MAIL SNAIL (MATCHES Porthole_Post_Worksheet.png)
  // =========================================================================
  function drawSnailSilverTrail(ctx, p0, p1, p2, uEnd, t, width) {
    if (uEnd <= 0.01) return;
    var steps = 26;
    var w = width || 9;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle = "rgba(202, 240, 248, 0.34)";
    ctx.lineWidth = w;
    ctx.beginPath();
    for (var i = 0; i <= steps; i++) {
      var u = (i / steps) * clamp(uEnd, 0, 1);
      var pt = quadBezierPt(p0, p1, p2, u);
      if (i === 0) ctx.moveTo(pt[0], pt[1]);
      else ctx.lineTo(pt[0], pt[1]);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgba(250, 255, 255, 0.78)";
    ctx.lineWidth = Math.max(2.0, w * 0.34);
    ctx.setLineDash([10, 7]);
    ctx.lineDashOffset = -t * 16;
    ctx.beginPath();
    for (var j = 0; j <= steps; j++) {
      var uj = (j / steps) * clamp(uEnd, 0, 1);
      var pj = quadBezierPt(p0, p1, p2, uj);
      if (j === 0) ctx.moveTo(pj[0], pj[1]);
      else ctx.lineTo(pj[0], pj[1]);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    for (var k = 1; k <= 5; k++) {
      var uk = (k / 6) * clamp(uEnd, 0, 1);
      if (uk > 0.03) {
        var pk = quadBezierPt(p0, p1, p2, uk);
        var pulse = 1.2 + Math.sin(t * 6 + k * 1.9) * 0.8;
        ctx.beginPath();
        ctx.arc(pk[0], pk[1] - 1, Math.max(0.8, pulse), 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawStampedEnvelope(ctx, cx, cy, w, h, opts) {
    var o = opts || {};
    var replyPostmark = !!o.replyPostmark;
    var alienPostmark = !!o.alienPostmark;
    var pips = o.pips || 0;
    var showPortSketch = !!o.showPortSketch;
    var glint = o.glint || 0;

    ctx.save();
    ctx.translate(cx - w * 0.5, cy - h * 0.5);

    ctx.fillStyle = "#fffdf7";
    ctx.strokeStyle = "#1c140d";
    ctx.lineWidth = 2.0;
    roundRectPath(ctx, 0, 0, w, h, 2.5);
    ctx.fill();
    ctx.stroke();

    // Envelope V-flap lines
    ctx.strokeStyle = "rgba(38, 28, 18, 0.78)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(1.5, 1.5);
    ctx.lineTo(w * 0.5, h * 0.56);
    ctx.lineTo(w - 1.5, 1.5);
    ctx.stroke();

    ctx.strokeStyle = "rgba(38, 28, 18, 0.35)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(2, h - 2);
    ctx.lineTo(w * 0.36, h * 0.46);
    ctx.moveTo(w - 2, h - 2);
    ctx.lineTo(w * 0.64, h * 0.46);
    ctx.stroke();

    // Pass 1: Bright Red Corner Stamp (top-right)
    var stW = Math.max(5.5, w * 0.23);
    var stH = Math.max(5.5, h * 0.31);
    var stX = w - stW - 2.6;
    var stY = 2.4;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(stX - 0.9, stY - 0.9, stW + 1.8, stH + 1.8);
    ctx.fillStyle = "#d92e22";
    ctx.strokeStyle = "#7a140d";
    ctx.lineWidth = 0.9;
    ctx.fillRect(stX, stY, stW, stH);
    ctx.strokeRect(stX, stY, stW, stH);

    // Pass 2: Brook's Plausible Green creek postmark ring
    if (showPortSketch) {
      var pr = h * 0.25;
      ctx.fillStyle = "#2a7b8c";
      ctx.strokeStyle = "#b58231";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(w * 0.25, h * 0.64, pr, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#f7e39c";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(w * 0.19, h * 0.59);
      ctx.lineTo(w * 0.25, h * 0.70);
      ctx.lineTo(w * 0.31, h * 0.59);
      ctx.stroke();
    } else if (replyPostmark) {
      ctx.strokeStyle = "#2d7d52";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(w * 0.24, h * 0.68, h * 0.19, 0, TAU);
      ctx.stroke();
    }

    // Pass 3: Alien Listening Post Cosmic Triangle Postmark (Rust/Violet!)
    if (alienPostmark) {
      ctx.fillStyle = "rgba(198, 70, 32, 0.22)";
      ctx.strokeStyle = "#b8431e";
      ctx.lineWidth = 1.5;
      var tx = w * 0.50, ty = h * 0.70, tr = h * 0.21;
      ctx.beginPath();
      ctx.moveTo(tx, ty - tr);
      ctx.lineTo(tx + tr * 0.95, ty + tr * 0.78);
      ctx.lineTo(tx - tr * 0.95, ty + tr * 0.78);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Rolled 1..6 die-pips stamped cleanly on envelope (zero text!)
    if (pips >= 1 && pips <= 6) {
      drawPips2D(ctx, w * 0.77, h * 0.70, h * 0.20, pips, registerColorForFace(pips));
    }

    if (glint > 0.02) {
      ctx.save();
      ctx.translate(w * 0.5, h * 0.45);
      ctx.fillStyle = "rgba(255, 244, 176," + clamp(glint, 0, 1).toFixed(3) + ")";
      var gr = 10 + glint * 13;
      ctx.beginPath();
      ctx.moveTo(0, -gr);
      ctx.lineTo(gr * 0.22, -gr * 0.22);
      ctx.lineTo(gr, 0);
      ctx.lineTo(gr * 0.22, gr * 0.22);
      ctx.lineTo(0, gr);
      ctx.lineTo(-gr * 0.22, gr * 0.22);
      ctx.lineTo(-gr, 0);
      ctx.lineTo(-gr * 0.22, -gr * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  function drawMailSnail(ctx, opts) {
    var x = opts.x || 0;
    var y = opts.y || 0;
    var scale = opts.scale || 1;
    var dir = opts.dir === -1 ? -1 : 1;
    var tilt = opts.tilt || 0;
    var t = opts.t || 0;
    var hasEnvelope = opts.hasEnvelope !== false;
    var salute = opts.salute || 0;
    var replyPostmark = !!opts.replyPostmark;
    var alienPostmark = !!opts.alienPostmark;
    var pips = opts.pips || 0;
    var showPortSketch = !!opts.showPortSketch;
    var glint = opts.glint || 0;
    var lookX = opts.lookX !== undefined ? opts.lookX : 0.6;
    var lookY = opts.lookY !== undefined ? opts.lookY : -0.15;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(dir * scale, scale);

    ctx.fillStyle = "rgba(10, 20, 22, 0.34)";
    ctx.beginPath();
    ctx.ellipse(2, 16, 40, 5.5, 0, 0, TAU);
    ctx.fill();

    // 1. Warm yellow-ochre gliding foot & upright neck/head
    var footGrad = ctx.createLinearGradient(0, -8, 0, 17);
    footGrad.addColorStop(0, "#f5d57a");
    footGrad.addColorStop(0.55, "#e0a63b");
    footGrad.addColorStop(1, "#b0781e");
    ctx.fillStyle = footGrad;
    ctx.strokeStyle = "#19120a";
    ctx.lineWidth = 2.4;
    ctx.lineJoin = "round";

    var headBob = Math.sin(t * 5.2) * 1.4;
    ctx.beginPath();
    ctx.moveTo(-40, 13);
    ctx.quadraticCurveTo(-28, 3, 10, 2);
    ctx.quadraticCurveTo(22, 0, 27, -7 + headBob);
    ctx.quadraticCurveTo(38, -9 + headBob, 42, 1 + headBob);
    ctx.quadraticCurveTo(43, 11 + headBob * 0.5, 30, 14);
    for (var w = 3; w >= -4; w--) {
      var wx = w * 8.5;
      var wy = 15 + Math.sin(t * 8.5 + w * 1.25) * 1.6;
      ctx.lineTo(wx, wy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#24180b";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(34, 2 + headBob, 4.5, 0.25, Math.PI * 0.78);
    ctx.stroke();

    // 2. Two articulated bobbing eyestalks
    var stalkDefs = [
      { bx: 27, by: -6 + headBob, ang: -1.18 + Math.sin(t * 4.6) * 0.11 - salute * 0.32, len: 16.5 },
      { bx: 34, by: -5 + headBob, ang: -0.88 + Math.cos(t * 4.2) * 0.11 - salute * 0.15, len: 15.0 }
    ];
    for (var i = 0; i < 2; i++) {
      var st = stalkDefs[i];
      var ex = st.bx + Math.cos(st.ang) * st.len;
      var ey = st.by + Math.sin(st.ang) * st.len;
      ctx.strokeStyle = "#19120a";
      ctx.lineWidth = 4.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(st.bx, st.by);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      ctx.strokeStyle = "#e5ae44";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(st.bx, st.by);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      ctx.fillStyle = "#fffdf5";
      ctx.strokeStyle = "#19120a";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(ex, ey, 4.3, 0, TAU);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#121718";
      ctx.beginPath();
      ctx.arc(ex + clamp(lookX, -1, 1) * 1.3, ey + clamp(lookY, -1, 1) * 1.2, 1.9, 0, TAU);
      ctx.fill();
    }

    // 3. Golden-amber spiral shell
    var shellGrad = ctx.createRadialGradient(-8, -14, 3, -5, -10, 26);
    shellGrad.addColorStop(0, "#fce6a6");
    shellGrad.addColorStop(0.52, "#d99236");
    shellGrad.addColorStop(1, "#7d4514");
    ctx.fillStyle = shellGrad;
    ctx.strokeStyle = "#19120a";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-5, -10, 22, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#241407";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (var a = 0; a < Math.PI * 4.6; a += 0.18) {
      var sr = 1.32 * a;
      var px = -5 + Math.cos(a + 0.4) * sr;
      var py = -10 + Math.sin(a + 0.4) * sr;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // 4. White envelope with red corner stamp (+ Trout green + Alien cosmic triangle!)
    if (hasEnvelope) {
      ctx.save();
      ctx.translate(-18, 2);
      ctx.rotate(-0.13 + Math.sin(t * 4.5) * 0.02);
      drawStampedEnvelope(ctx, 0, 0, 30, 20, {
        replyPostmark: replyPostmark,
        alienPostmark: alienPostmark,
        pips: pips,
        showPortSketch: showPortSketch,
        glint: glint
      });
      ctx.restore();
    }

    // 5. Tiny dark postal cap perched atop shell
    ctx.save();
    ctx.translate(-4, -31 - salute * 3.5);
    ctx.rotate(0.08 - salute * 0.24);

    var capGrad = ctx.createLinearGradient(0, -9, 0, 4);
    capGrad.addColorStop(0, "#2c3945");
    capGrad.addColorStop(1, "#12181d");
    ctx.fillStyle = capGrad;
    ctx.strokeStyle = "#0a0e12";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-13, 2);
    ctx.quadraticCurveTo(-14, -9, 0, -9.5);
    ctx.quadraticCurveTo(13, -9, 13, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#edc058";
    ctx.fillRect(-12.5, -1, 25, 3.2);
    ctx.fillStyle = "#fff1b8";
    ctx.beginPath();
    ctx.arc(2, -4.5, 2.0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#11171c";
    ctx.strokeStyle = "#0a0e12";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(5, 1.5);
    ctx.quadraticCurveTo(19, 0.5, 21, 4.5);
    ctx.quadraticCurveTo(12, 6.0, 3, 3.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  function drawPostcardMini(ctx, cx, cy, w, h, pips) {
    drawStampedEnvelope(ctx, cx, cy, w, h, {
      showPortSketch: true,
      replyPostmark: true,
      alienPostmark: true,
      pips: pips || 4
    });
  }

  // =========================================================================
  // ARTICULATED RIG 4: TROUT TOWN ALIEN LISTENING POST & SAUCER POD!
  // Three blinking emerald eyes + twin spring-antennae (violet/amber bulbs) +
  // listening-post headphones + riveted brass-and-glass saucer pod +
  // violet-emerald telemetry beam & holographic saucer measurement rings!
  // =========================================================================
  function drawAlienSaucerPod(ctx, opts) {
    var x = opts.x || 640;
    var y = opts.y || 105;
    var scale = opts.scale || 1;
    var t = opts.t || 0;
    var tilt = opts.tilt !== undefined ? opts.tilt : Math.sin(t * 2.6) * 0.05;
    var beamOn = opts.beamOn !== undefined ? opts.beamOn : 1;
    var targetX = opts.targetX !== undefined ? opts.targetX : x;
    var targetY = opts.targetY !== undefined ? opts.targetY : y + 215;
    var stampReach = opts.stampReach || 0; // 0..1 little cosmic stamper arm reaching to Mail Snail!
    var lookX = opts.lookX !== undefined ? opts.lookX : 0;
    var lookY = opts.lookY !== undefined ? opts.lookY : 0.65;

    ctx.save();

    // 1. SHIMMERING VIOLET-EMERALD TRACTOR / TELEMETRY BEAM & HOLOGRAPHIC RINGS
    if (beamOn > 0.02) {
      ctx.save();
      ctx.globalAlpha = clamp(beamOn, 0, 1);
      ctx.globalCompositeOperation = "screen";

      var bGrad = ctx.createLinearGradient(x, y + 24, targetX, targetY + 40);
      bGrad.addColorStop(0, "rgba(182, 128, 255, 0.55)");
      bGrad.addColorStop(0.48, "rgba(104, 240, 198, 0.32)");
      bGrad.addColorStop(1, "rgba(217, 94, 48, 0.05)");
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.moveTo(x - 32 * scale, y + 22 * scale);
      ctx.lineTo(targetX - 116, targetY + 55);
      ctx.lineTo(targetX + 116, targetY + 55);
      ctx.lineTo(x + 32 * scale, y + 22 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Rotating holographic saucer measurement rings scanning down the beam!
      ctx.save();
      ctx.globalAlpha = clamp(beamOn, 0, 1);
      for (var r = 0; r < 3; r++) {
        var uRing = ((t * 0.55 + r * 0.33) % 1);
        var rx = lerp(x, targetX, uRing);
        var ry = lerp(y + 34 * scale, targetY + 24, uRing);
        var rw = lerp(38 * scale, 108, uRing);
        var rh = rw * 0.24;
        var rAlpha = Math.sin(uRing * Math.PI) * 0.85;
        ctx.strokeStyle = r % 2 === 0
          ? "rgba(125, 250, 212," + rAlpha.toFixed(3) + ")"
          : "rgba(208, 152, 255," + rAlpha.toFixed(3) + ")";
        ctx.lineWidth = 2.2;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -t * 28 * (r % 2 === 0 ? 1 : -1);
        ctx.beginPath();
        ctx.ellipse(rx, ry, rw, rh, Math.sin(t * 1.8 + r) * 0.06, 0, TAU);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 2. SAUCER POD & ARTICULATED 3-EYED ALIEN LISTENER
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(scale, scale);

    // Underside glowing propulsion/telemetry lens
    var uGlow = ctx.createRadialGradient(0, 24, 4, 0, 24, 48);
    uGlow.addColorStop(0, "rgba(130, 255, 214, 0.85)");
    uGlow.addColorStop(0.55, "rgba(168, 114, 255, 0.35)");
    uGlow.addColorStop(1, "rgba(168, 114, 255, 0)");
    ctx.fillStyle = uGlow;
    ctx.beginPath();
    ctx.ellipse(0, 26, 48, 18, 0, 0, TAU);
    ctx.fill();

    // Back half of glass listening dome
    var domeBack = ctx.createRadialGradient(-10, -28, 6, 0, -10, 56);
    domeBack.addColorStop(0, "rgba(210, 252, 246, 0.38)");
    domeBack.addColorStop(0.7, "rgba(86, 178, 188, 0.26)");
    domeBack.addColorStop(1, "rgba(26, 68, 78, 0.55)");
    ctx.fillStyle = domeBack;
    ctx.strokeStyle = "#98e6de";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, -2, 50, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // --- ALIEN LISTENER INSIDE THE DOME ---
    var headSway = Math.sin(t * 3.2) * 0.06;
    ctx.save();
    ctx.translate(0, -4);
    ctx.rotate(headSway);

    // Little sage-green shoulders & brass cosmic collar
    ctx.fillStyle = "#5f3d7a";
    ctx.strokeStyle = "#161021";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(0, 8, 26, 14, 0, Math.PI, TAU);
    ctx.fill();
    ctx.stroke();

    // Twin coiled spring-antennae with glowing violet & amber telemetry bulbs!
    var antDefs = [
      { bx: -12, by: -31, side: -1, col: "#c77dff", core: "#f3deff" },
      { bx:  12, by: -31, side:  1, col: "#ffbe4f", core: "#fff4cc" }
    ];
    for (var a = 0; a < 2; a++) {
      var ad = antDefs[a];
      var sway = Math.sin(t * 6.4 + a * 1.8) * 4.5;
      var tipX = ad.bx + ad.side * 10 + sway;
      var tipY = ad.by - 17 + Math.cos(t * 5.5 + a) * 2;
      ctx.strokeStyle = "#222b26";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(ad.bx, ad.by);
      ctx.quadraticCurveTo(ad.bx + ad.side * 12, ad.by - 6, ad.bx + ad.side * 3 + sway * 0.5, ad.by - 11);
      ctx.quadraticCurveTo(ad.bx - ad.side * 4 + sway * 0.8, ad.by - 15, tipX, tipY);
      ctx.stroke();

      // Glowing bulb halo
      var bHalo = ctx.createRadialGradient(tipX, tipY, 1, tipX, tipY, 11);
      bHalo.addColorStop(0, ad.col);
      bHalo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bHalo;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 11, 0, TAU);
      ctx.fill();

      ctx.fillStyle = ad.col;
      ctx.strokeStyle = "#17121f";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 4.6, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = ad.core;
      ctx.beginPath();
      ctx.arc(tipX - 1, tipY - 1, 1.6, 0, TAU);
      ctx.fill();
    }

    // Listening-Post Headphones headband (arching over crown)
    ctx.strokeStyle = "#d9a648";
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.arc(0, -14, 26, Math.PI * 1.06, Math.PI * 1.94);
    ctx.stroke();

    // Alien head (warm celadon-chartreuse pear/heart silhouette)
    var alGrad = ctx.createRadialGradient(-4, -20, 4, 0, -14, 28);
    alGrad.addColorStop(0, "#b8f2be");
    alGrad.addColorStop(0.65, "#6ec488");
    alGrad.addColorStop(1, "#397a54");
    ctx.fillStyle = alGrad;
    ctx.strokeStyle = "#12291d";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, -16, 23, 19, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Left & Right Brass/Bakelite Listening-Post Earcups!
    var earXs = [-24, 24];
    for (var ec = 0; ec < 2; ec++) {
      ctx.fillStyle = "#2b2118";
      ctx.strokeStyle = "#e5b655";
      ctx.lineWidth = 2.0;
      roundRectPath(ctx, earXs[ec] - 4.5, -23, 9, 16, 4);
      ctx.fill();
      ctx.stroke();
    }

    // THREE EXPRESSIVE BLINKING EMERALD-GOLD EYES!
    var alBlink = ((t * 11) % 41 < 1.3) ? 0.92 : 0;
    var eyes = [
      { ex: -10.5, ey: -15, r: 5.4 },
      { ex:  10.5, ey: -15, r: 5.4 },
      { ex:   0.0, ey: -24.5, r: 4.9 } // 3rd crown eye!
    ];
    for (var e = 0; e < 3; e++) {
      var ey = eyes[e];
      ctx.fillStyle = "#10241e";
      ctx.strokeStyle = "#f4fae8";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(ey.ex, ey.ey, ey.r, ey.r * (1 - alBlink), 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      if (alBlink < 0.8) {
        ctx.fillStyle = "#7affc6";
        ctx.beginPath();
        ctx.arc(ey.ex + clamp(lookX, -1, 1) * 1.6, ey.ey + clamp(lookY, -1, 1) * 1.5, ey.r * 0.44, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(ey.ex - 1.2, ey.ey - 1.4, 1.2, 0, TAU);
        ctx.fill();
      }
    }

    // Delighted curious alien smile
    ctx.strokeStyle = "#12291d";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -8, 5.5, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.restore(); // end alien head

    // Front specular highlight on glass dome
    ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, -2, 45, Math.PI * 1.16, Math.PI * 1.46);
    ctx.stroke();

    // RIVETED BRASS & COPPER SAUCER RIM (Trout Town craft kinship with the bread-roll tin!)
    var rimGrad = ctx.createLinearGradient(-78, 0, 78, 22);
    rimGrad.addColorStop(0, "#e5bc6a");
    rimGrad.addColorStop(0.35, "#b87f31");
    rimGrad.addColorStop(0.7, "#754b18");
    rimGrad.addColorStop(1, "#d9a84e");
    ctx.fillStyle = rimGrad;
    ctx.strokeStyle = "#211406";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(0, 8, 76, 16, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Glowing indicator lights around saucer flange (alternating rust-orange & emerald-violet)
    for (var lt = -3; lt <= 3; lt++) {
      var lx = lt * 18;
      var ly = 8 + Math.cos(lt * 0.42) * 3.5;
      var pulseOn = ((Math.floor(t * 8) + lt + 6) % 3) === 0;
      ctx.fillStyle = pulseOn ? "#ff8247" : "#74f2ce";
      ctx.strokeStyle = "#1e1307";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(lx, ly, 3.6, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Articulated little brass cosmic-stamper arm reaching out to stamp Mail Snail's envelope!
    if (stampReach > 0.02) {
      ctx.save();
      var armX = lerp(-34, -52, stampReach);
      var armY = lerp(16, 46, stampReach);
      ctx.strokeStyle = "#d9a648";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-28, 14);
      ctx.quadraticCurveTo(-48, 24, armX, armY);
      ctx.stroke();
      // Cosmic triangle stamp pad glowing rust-gold at tip!
      ctx.fillStyle = "#ff7838";
      ctx.strokeStyle = "#fff2c2";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(armX, armY - 7);
      ctx.lineTo(armX + 7, armY + 6);
      ctx.lineTo(armX - 7, armY + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // =========================================================================
  // VISUAL MUFFLED SOUND-BARRIER WAVES (ACT 1B: WHY THEY NEED SNAIL MAIL!)
  // =========================================================================
  function drawMuffledGlassBarrier(ctx, pCX, pCY, pRGlass, t, alpha) {
    if (alpha <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = clamp(alpha, 0, 1);

    var glassLeftX = pCX - pRGlass - 6;
    for (var i = 0; i < 4; i++) {
      var cyc = ((t * 1.35 + i * 0.25) % 1);
      var hit = smoothstep(0.62, 0.90, cyc);
      var wx = lerp(262, glassLeftX - 6, Math.min(1, cyc / 0.72)) - hit * 22;
      var wy = lerp(264, pCY + 8, Math.min(1, cyc / 0.72));
      var arcR = 16 + cyc * 32;
      var aFade = Math.sin(cyc * Math.PI) * 0.95;

      ctx.strokeStyle = hit > 0.12
        ? "rgba(244, 132, 76," + aFade.toFixed(3) + ")"
        : "rgba(255, 214, 122," + aFade.toFixed(3) + ")";
      ctx.lineWidth = 3.4 - hit * 0.9;
      if (hit > 0.18) ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.ellipse(wx, wy, arcR * (1 - hit * 0.72), arcR * (1 + hit * 0.28), 0, -0.72, 0.72);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    var brookMouthX = pCX + 26;
    var brookMouthY = pCY + 10;
    for (var j = 0; j < 3; j++) {
      var bcyc = ((t * 1.45 + j * 0.33 + 0.15) % 1);
      var bhit = smoothstep(0.55, 0.88, bcyc);
      var bx = lerp(brookMouthX, pCX - 54, Math.min(1, bcyc / 0.7)) + bhit * 14;
      var by = brookMouthY;
      var br = 10 + bcyc * 24;
      var bFade = Math.sin(bcyc * Math.PI) * 0.85;

      ctx.strokeStyle = "rgba(130, 236, 245," + bFade.toFixed(3) + ")";
      ctx.lineWidth = 2.5 - bhit * 0.7;
      if (bhit > 0.2) ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.ellipse(bx, by, br * (1 - bhit * 0.65), br * (1 + bhit * 0.22), 0, Math.PI - 0.65, Math.PI + 0.65);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    var barrierPulse = 0.22 + 0.12 * Math.sin(t * 5.0);
    ctx.strokeStyle = "rgba(220, 248, 255," + barrierPulse.toFixed(3) + ")";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(pCX, pCY, pRGlass - 5, Math.PI * 0.68, Math.PI * 1.32);
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // HANDMADE 3D-PROJECTED 1D6 DIE (ACT 4: EPISODE-DIE)
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

  function targetEulerForFace(faceNum) {
    if (faceNum === 4) return [0.22, -0.18, 0.06];
    if (faceNum === 3) return [0.22, Math.PI - 0.18, 0.06];
    if (faceNum === 2) return [Math.PI * 0.5 + 0.18, 0.12, -0.08];
    if (faceNum === 5) return [-Math.PI * 0.5 + 0.18, -0.12, 0.08];
    if (faceNum === 6) return [0.18, -Math.PI * 0.5 - 0.15, 0.05];
    return [0.18, Math.PI * 0.5 - 0.15, -0.05];
  }

  function registerColorForFace(faceNum) {
    if (faceNum <= 2) return "#1d596e"; // Pass 1: Probable (Teal)
    if (faceNum <= 4) return "#2d6846"; // Pass 2: Plausible (Green)
    return "#9e3d1c"; // Pass 3: Preposterous / Out of Bounds (Rust)
  }

  function registerBrightForFace(faceNum) {
    if (faceNum <= 2) return "#2ea6c4"; // Probable bright glow
    if (faceNum <= 4) return "#39a86b"; // Plausible bright glow
    return "#de562a"; // Preposterous bright glow
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
      ctx.strokeStyle = isWin ? registerBrightForFace(item.fc.pips) : "#3d2b16";
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
    var lampAimX = opts.lampAimX || 0;
    var fastFlow = opts.fastFlow || 0;
    var ballastDepth = opts.ballastDepth || 0;
    var ribbonTied = !!opts.ribbonTied;
    var lanternLit = !!opts.lanternLit;
    var bellSwing = opts.bellSwing || 0;
    var bellRings = opts.bellRings || 0;
    var showDuckRabbit = opts.duckRabbit || 0;
    var alienScanGlow = opts.alienScanGlow || 0;

    var camRise = ballastDepth * 52;

    ctx.save();
    var wGrad = ctx.createLinearGradient(cx, cy - rad, cx, cy + rad);
    wGrad.addColorStop(0, "#1d5866");
    wGrad.addColorStop(0.45, "#16434e");
    wGrad.addColorStop(1, "#0d262d");
    ctx.fillStyle = wGrad;
    ctx.fillRect(cx - rad - 20, cy - rad - 20, rad * 2 + 40, rad * 2 + 40);

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

    var horizonY = cy - 42 - camRise * 0.45;
    ctx.fillStyle = "#122e33";
    ctx.beginPath();
    ctx.moveTo(cx - rad - 10, horizonY + 30);
    ctx.quadraticCurveTo(cx - 80, horizonY - 10, cx - 22, horizonY + 12);
    ctx.lineTo(cx, horizonY + 34);
    ctx.lineTo(cx + 22, horizonY + 10);
    ctx.quadraticCurveTo(cx + 95, horizonY - 14, cx + rad + 10, horizonY + 26);
    ctx.lineTo(cx + rad + 10, cy + rad + 20);
    ctx.lineTo(cx - rad - 10, cy + rad + 20);
    ctx.closePath();
    ctx.fill();

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

    var notchVis = clamp(1 - siltAmt * 0.85 + (lampOn ? 0.95 : 0), 0.15, 1);
    ctx.save();
    ctx.globalAlpha = notchVis;
    ctx.fillStyle = lampOn ? "#d6b97b" : "#4a7378";
    ctx.strokeStyle = "#0d1e21";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - 34, horizonY + 28);
    ctx.lineTo(cx - 18, horizonY - 4);
    ctx.lineTo(cx, horizonY + 24);
    ctx.lineTo(cx + 18, horizonY - 6);
    ctx.lineTo(cx + 36, horizonY + 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

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

    var postX = cx + 74;
    var postY = horizonY - 28;
    ctx.strokeStyle = "#1a2f30";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(postX, horizonY + 18);
    ctx.lineTo(postX, postY);
    ctx.lineTo(postX - 24, postY);
    ctx.stroke();

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

    // SHARED SILHOUETTE: Giant Size-11 Boot + Brass Key at sole!
    if (showDuckRabbit > 0.01) {
      ctx.save();
      ctx.globalAlpha = showDuckRabbit;
      var bx = cx - 8 + Math.sin(t * 1.8) * 4;
      var by = cy + 8 + Math.cos(t * 1.5) * 4 - alienScanGlow * 8;
      ctx.translate(bx, by);
      ctx.rotate(-0.08 + Math.sin(t * 1.4) * 0.04);

      var bHalo = ctx.createRadialGradient(0, 0, 12, 0, 0, 115);
      bHalo.addColorStop(0, alienScanGlow > 0.1 ? "rgba(176, 134, 255, 0.55)" : "rgba(182, 238, 226, 0.42)");
      bHalo.addColorStop(1, "rgba(20, 60, 68, 0)");
      ctx.fillStyle = bHalo;
      ctx.beginPath();
      ctx.arc(0, 0, 115, 0, TAU);
      ctx.fill();

      ctx.fillStyle = "#142628";
      ctx.strokeStyle = alienScanGlow > 0.1 ? "#7effce" : "#edb473";
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

      ctx.fillStyle = "rgba(255, 238, 184, 0.72)";
      for (var dm = 0; dm < 14; dm++) {
        var mx = cx + lampAimX * 0.5 + (hash1(dm * 7.1) - 0.5) * 110 + Math.sin(t * 2 + dm) * 8;
        var my = cy - 60 + hash1(dm * 13.3) * 180;
        ctx.beginPath();
        ctx.arc(mx, my, 1.8 + (dm % 2), 0, TAU);
        ctx.fill();
      }
    }

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

    if (ballastDepth > 0.35) {
      var shX = cx - 26;
      var shY = lipY + 8;
      ctx.strokeStyle = "#7be0ad";
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(shX, shY);
      ctx.quadraticCurveTo(shX + 6 + Math.sin(t * 2.2) * 2, shY + 18, shX + 3, shY + 32);
      ctx.stroke();
    }

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
  // SETUP A ANTIQUE BRASS PORTHOLE BEZEL
  // =========================================================================
  function drawSetupAPortholeFrame(ctx, cx, cy, rGlass, rOuter, opts) {
    var boltGlow = opts.boltGlow || {};
    var lampMounted = !!opts.lampMounted;
    var lampOn = !!opts.lampOn;
    var mailSlotOpen = opts.mailSlotOpen || 0;

    ctx.save();

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

    var brassGrad = ctx.createLinearGradient(cx - rOuter, cy - rOuter, cx + rOuter, cy + rOuter);
    brassGrad.addColorStop(0, "#e5be6d");
    brassGrad.addColorStop(0.35, "#b38437");
    brassGrad.addColorStop(0.7, "#80591e");
    brassGrad.addColorStop(1, "#cfa252");

    ctx.fillStyle = brassGrad;
    ctx.strokeStyle = "#241908";
    ctx.lineWidth = 3;

    var chipAng = -Math.PI / 6;
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, chipAng + 0.085, chipAng + TAU - 0.085);
    var chipInX = cx + Math.cos(chipAng) * (rOuter - 16);
    var chipInY = cy + Math.sin(chipAng) * (rOuter - 16);
    ctx.lineTo(chipInX, chipInY);
    ctx.closePath();
    ctx.moveTo(cx + rGlass, cy);
    ctx.arc(cx, cy, rGlass, 0, TAU, true);
    ctx.fill("evenodd");

    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, chipAng + 0.085, chipAng + TAU - 0.085);
    ctx.lineTo(chipInX, chipInY);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = "#fff1ba";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(chipAng - 0.085) * rOuter, cy + Math.sin(chipAng - 0.085) * rOuter);
    ctx.lineTo(chipInX, chipInY);
    ctx.lineTo(cx + Math.cos(chipAng + 0.085) * rOuter, cy + Math.sin(chipAng + 0.085) * rOuter);
    ctx.stroke();

    ctx.strokeStyle = "#2b1d09";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, rGlass, 0, TAU);
    ctx.stroke();

    ctx.save();
    ctx.translate(cx + rOuter - 4, cy + 14);
    ctx.fillStyle = "#d9ac59";
    ctx.strokeStyle = "#241908";
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, -12, -13, 30, 26, 6);
    ctx.fill();
    ctx.stroke();
    roundRectPath(ctx, 8, -7, 16, 14, 4);
    ctx.fillStyle = "#f0c978";
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 7:30 Brass Rotary Snail-Mail Slot
    var mailAng = Math.PI * 0.68;
    var mailR = (rGlass + rOuter) * 0.52;
    var mailX = cx + Math.cos(mailAng) * mailR;
    var mailY = cy + Math.sin(mailAng) * mailR;
    ctx.save();
    ctx.translate(mailX, mailY);
    ctx.rotate(mailAng - Math.PI * 0.5);
    ctx.fillStyle = mailSlotOpen > 0.1 ? "#f6cf78" : "#c89844";
    ctx.strokeStyle = "#231707";
    ctx.lineWidth = 2.0;
    roundRectPath(ctx, -22, -11, 44, 22, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = mailSlotOpen > 0.1 ? "#ffe9a6" : "#1f1508";
    roundRectPath(ctx, -15, -3.5, 30, 7, 2.5);
    ctx.fill();
    ctx.strokeStyle = "#593b12";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.lineTo(0, -4);
    ctx.lineTo(10, -8);
    ctx.stroke();
    ctx.restore();

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

    var rBolt = (rGlass + rOuter) * 0.5;
    var boltAngles = [
      -Math.PI * 0.5,        // #1 (12 o'clock)
      -Math.PI * 0.14,       // #2 (~2:30, below 2 o'clock chip)
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

      if (glowCol) {
        var badgeOff = opts.badgeInside ? -26 : 31;
        var badgeX = bx + Math.cos(ba) * badgeOff;
        var badgeY = by + Math.sin(ba) * badgeOff;
        ctx.fillStyle = "#fcf8ed";
        ctx.strokeStyle = glowCol;
        ctx.lineWidth = 2.2;
        roundRectPath(ctx, badgeX - 12, badgeY - 12, 24, 24, 5.5);
        ctx.fill();
        ctx.stroke();
        drawPips2D(ctx, badgeX, badgeY, 9.8, faceNum, registerColorForFace(faceNum));
      }
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
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
    var activeModule = opts.activeModule || "lamp";
    var lampToggleOn = !!opts.lampToggleOn;
    var ballastLever = opts.ballastLever || 0;
    var chartProgress = opts.chartProgress || 0;
    var chartStar = opts.chartStar || 0;

    ctx.save();
    if (Math.abs(yaw) > 0.0005) {
      ctx.translate(W * 0.5, stageH * 0.5);
      ctx.rotate(yaw);
      ctx.translate(-W * 0.5, -stageH * 0.5);
    }

    ctx.fillStyle = "#0b1517";
    ctx.fillRect(-30, -30, W + 60, stageH + 60);

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

    ctx.strokeStyle = "#edb473";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(tinRight - 3, 215);
    ctx.bezierCurveTo(tinRight - 31, 238, tinRight - 33, 292, tinRight - 3, 315);
    ctx.stroke();

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

    // 1 DAY OF AIR DIAL
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

    var airAng = lerp(Math.PI * 1.15, Math.PI * 1.38, t / 52) + Math.sin(t * 9) * 0.025;
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

    // CONTROL 1: SINGLE SLOT
    var slotBoxX = 86, slotBoxY = 418, slotBoxW = 266, slotBoxH = 88;
    ctx.fillStyle = "#0e1c1f";
    ctx.strokeStyle = "#6e9992";
    ctx.lineWidth = 2;
    roundRectPath(ctx, slotBoxX, slotBoxY, slotBoxW, slotBoxH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#23383b";
    ctx.strokeStyle = "#cfa252";
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, slotBoxX + 14, slotBoxY + 34, 108, 42, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#2a2118";
    ctx.strokeStyle = "#7d6445";
    ctx.lineWidth = 1.8;
    roundRectPath(ctx, slotBoxX + 146, slotBoxY + 40, 106, 36, 5);
    ctx.fill();
    ctx.stroke();

    if (activeModule === "lamp") {
      drawLampModuleProp(ctx, slotBoxX + 68, slotBoxY + 46, 0.92, lampToggleOn);
      drawBallastModuleProp(ctx, slotBoxX + 199, slotBoxY + 52, 0.78, 0);
    } else if (activeModule === "ballast") {
      drawBallastModuleProp(ctx, slotBoxX + 68, slotBoxY + 48, 0.95, ballastLever);
      drawLampModuleProp(ctx, slotBoxX + 199, slotBoxY + 50, 0.76, false);
    } else {
      drawLampModuleProp(ctx, slotBoxX + 178, slotBoxY + 50, 0.72, false);
      drawBallastModuleProp(ctx, slotBoxX + 224, slotBoxY + 54, 0.68, 0);
    }

    if (activeModule === "lamp") {
      ctx.strokeStyle = lampToggleOn ? "#f5be58" : "#6e552b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(slotBoxX + 122, slotBoxY + 52);
      ctx.quadraticCurveTo(450, 412, 616, 420);
      ctx.stroke();
    }

    // CONTROL 2: CHALK CHART UNDER GLASS
    drawChalkChartBox(ctx, 422, 418, 436, 88, chartProgress, chartStar, false, showCaptions);

    // CONTROL 3: LAMP TOGGLE
    var togBoxX = 934, togBoxY = 418, togBoxW = 248, togBoxH = 88;
    ctx.fillStyle = "#0e1c1f";
    ctx.strokeStyle = lampToggleOn ? "#f2b65d" : "#8c6d3b";
    ctx.lineWidth = 2.4;
    roundRectPath(ctx, togBoxX, togBoxY, togBoxW, togBoxH, 10);
    ctx.fill();
    ctx.stroke();

    var swX = togBoxX + togBoxW * 0.5 + 14;
    var swY = togBoxY + 64;
    ctx.fillStyle = lampToggleOn ? "#ffd666" : "#2b3b3d";
    ctx.strokeStyle = "#1a140b";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(swX - 54, swY - 4, 7, 0, TAU);
    ctx.fill();
    ctx.stroke();

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

    // Hardware labels ONLY when showCaptions !== false!
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

      ctx.strokeStyle = "rgba(163, 218, 200, 0.55)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(812, 134);
      ctx.lineTo(886, 118);
      ctx.lineTo(1004, 118);
      ctx.stroke();
      ctx.fillStyle = "#b6d8d2";
      ctx.fillText("2 O'CLOCK CHIP", 890, 112);

      ctx.strokeStyle = "rgba(237, 180, 115, 0.55)";
      ctx.beginPath();
      ctx.moveTo(526, 360);
      ctx.lineTo(448, 386);
      ctx.lineTo(366, 386);
      ctx.stroke();
      ctx.fillStyle = "#f2cf7a";
      ctx.fillText("SNAIL MAIL SLOT", 368, 380);
      ctx.restore();
    }

    ctx.restore();
  }

  function drawLampModuleProp(ctx, cx, cy, scale, lit) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
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
    ctx.fillStyle = "#48595c";
    ctx.strokeStyle = "#141d1f";
    ctx.lineWidth = 2;
    roundRectPath(ctx, -36, -6, 72, 26, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#758c90";
    for (var i = -1; i <= 1; i++) {
      ctx.fillRect(i * 20 - 7, -1, 14, 16);
    }
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
    ctx.fillStyle = "#132224";
    ctx.strokeStyle = "#91bdb5";
    ctx.lineWidth = 2;
    roundRectPath(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();

    var sc = [[x + 11, y + 11], [x + w - 11, y + 11], [x + 11, y + h - 11], [x + w - 11, y + h - 11]];
    ctx.fillStyle = "#d4a656";
    for (var i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(sc[i][0], sc[i][1], 3.2, 0, TAU);
      ctx.fill();
    }

    ctx.strokeStyle = "rgba(182, 208, 202, 0.35)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x + 28, y + h - 20);
    ctx.quadraticCurveTo(x + w * 0.36, y + 26, x + w * 0.54, y + h - 24);
    ctx.quadraticCurveTo(x + w * 0.74, y + 26, x + w - 34, y + 34);
    ctx.stroke();

    ctx.strokeStyle = "#cbe3dc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 44, y + h - 18);
    ctx.lineTo(x + 44, y + h - 38);
    ctx.moveTo(x + 52, y + h - 18);
    ctx.lineTo(x + 52, y + h - 40);
    ctx.stroke();

    var nx = x + w * 0.52, ny = y + h * 0.55;
    ctx.beginPath();
    ctx.moveTo(nx - 10, ny - 8);
    ctx.lineTo(nx, ny + 6);
    ctx.lineTo(nx + 10, ny - 8);
    ctx.stroke();

    var lx = x + w - 48, ly = y + 34;
    ctx.strokeStyle = starAmt > 0.1 ? "#ffd563" : "#9cb8b3";
    ctx.beginPath();
    ctx.arc(lx, ly, 6, Math.PI, TAU);
    ctx.lineTo(lx + 8, ly + 7);
    ctx.lineTo(lx - 8, ly + 7);
    ctx.closePath();
    ctx.stroke();

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

    var skyGrad = ctx.createLinearGradient(0, 0, 0, stageH);
    skyGrad.addColorStop(0, "#132930");
    skyGrad.addColorStop(0.42, "#1f4954");
    skyGrad.addColorStop(0.43, "#18424d");
    skyGrad.addColorStop(1, "#0d2228");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, stageH);

    ctx.fillStyle = "#102327";
    ctx.beginPath();
    ctx.moveTo(430, 228);
    ctx.quadraticCurveTo(640, 175, 810, 214);
    ctx.lineTo(845, 238);
    ctx.lineTo(880, 210);
    ctx.quadraticCurveTo(1060, 172, 1280, 206);
    ctx.lineTo(1280, 250);
    ctx.lineTo(430, 250);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#193330";
    ctx.fillRect(738, 86, 18, 148);
    ctx.fillRect(768, 72, 20, 162);

    ctx.fillStyle = "#3c6363";
    ctx.strokeStyle = "#102224";
    ctx.lineWidth = 2;
    for (var s = 0; s < 5; s++) {
      ctx.fillRect(1035 + s * 22, 215 + s * 18, 38, 18);
      ctx.strokeRect(1035 + s * 22, 215 + s * 18, 38, 18);
    }

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
    ctx.fillStyle = "rgba(122, 98, 62, 0.72)";
    ctx.beginPath();
    ctx.arc(4, -14, 15, 0, TAU);
    ctx.fill();
    ctx.restore();

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

    ctx.fillStyle = "#1b1612";
    ctx.fillRect(0, 0, 488, stageH);
    ctx.strokeStyle = "#2b221a";
    ctx.lineWidth = 2;
    for (var p = 1; p < 8; p++) {
      ctx.beginPath();
      ctx.moveTo(p * 62, 0);
      ctx.lineTo(p * 62, stageH);
      ctx.stroke();
    }
    ctx.strokeStyle = "#4d3a28";
    ctx.lineWidth = 12;
    ctx.strokeRect(482, 6, W - 488, stageH - 12);

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

    ctx.fillStyle = "#5c3d24";
    ctx.strokeStyle = "#1f130a";
    ctx.lineWidth = 3;
    ctx.fillRect(0, 386, 520, 150);
    ctx.strokeRect(0, 386, 520, 24);

    drawLampModuleProp(ctx, 74, 370, 0.86, false);
    drawBallastModuleProp(ctx, 152, 372, 0.84, 0);
    drawMailSnail(ctx, {
      x: 236 + t * 6,
      y: 371,
      scale: 0.72,
      dir: 1,
      t: t,
      hasEnvelope: true,
      salute: smoothstep(1.8, 2.6, t) * 0.7
    });

    var launchU = easeInOutCubic(invLerp(3.0, 4.0, t));
    var subX = lerp(372, 575, launchU);
    var subY = lerp(346, 368, launchU);

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

    ctx.save();
    ctx.translate(subX, subY);
    ctx.rotate(launchU * 0.05);
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
    ctx.quadraticCurveTo(80, 10, 90, 24);
    ctx.lineTo(84, 38);
    ctx.lineTo(-86, 38);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    roundRectPath(ctx, -104, -42, 212, 9, 4);
    ctx.fillStyle = "#95adaf";
    ctx.fill();
    ctx.stroke();

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
  // ACT 3 PASS 2 (21.8 – 26.0s): PLAUSIBLE (FACES 3–4 GREEN) · TROUT LOOKS IN
  // Brook receives Snail Mail & sends the Mail Snail UP the bezel to Dear Alien!
  // =========================================================================
  function drawTroutLookingInScene(ctx, W, stageH, t, showForkBubbles, st) {
    ctx.save();
    var rGrad = ctx.createLinearGradient(0, 0, 0, stageH);
    rGrad.addColorStop(0, "#174f4c");
    rGrad.addColorStop(0.6, "#10383a");
    rGrad.addColorStop(1, "#0a2226");
    ctx.fillStyle = rGrad;
    ctx.fillRect(0, 0, W, stageH);

    for (var i = -3; i <= 3; i++) {
      ctx.fillStyle = "rgba(163, 232, 206, 0.06)";
      var rx = 640 + i * 165 + Math.sin(t * 1.3 + i) * 24;
      ctx.beginPath();
      ctx.moveTo(rx - 30, 0);
      ctx.lineTo(rx + 30, 0);
      ctx.lineTo(rx + 80, stageH);
      ctx.lineTo(rx - 60, stageH);
      ctx.closePath();
      ctx.fill();
    }

    var bobY = Math.sin(t * 2.2) * 5;
    var subCX = 560, subCY = 272 + bobY;

    ctx.save();
    ctx.translate(subCX, subCY);
    var extGrad = ctx.createRadialGradient(-30, -50, 30, 0, 0, 290);
    extGrad.addColorStop(0, "#688588");
    extGrad.addColorStop(0.65, "#384e52");
    extGrad.addColorStop(1, "#1e2d30");
    ctx.fillStyle = extGrad;
    ctx.strokeStyle = "#0e1a1c";
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.moveTo(-225, -162);
    ctx.lineTo(225, -162);
    ctx.quadraticCurveTo(268, -162, 260, -110);
    ctx.lineTo(248, -24);
    ctx.bezierCurveTo(220, 0, 222, 46, 244, 68);
    ctx.lineTo(232, 138);
    ctx.quadraticCurveTo(224, 174, 182, 174);
    ctx.lineTo(-182, 174);
    ctx.quadraticCurveTo(-224, 174, -232, 138);
    ctx.lineTo(-258, -110);
    ctx.quadraticCurveTo(-268, -162, -225, -162);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    roundRectPath(ctx, -274, -176, 548, 22, 10);
    ctx.fillStyle = "#8aa5a8";
    ctx.fill();
    ctx.stroke();

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

    drawTurkeyPilot(ctx, {
      x: -18,
      y: 54,
      scale: 1.02,
      dir: 1,
      t: t,
      headTilt: 0.06 * Math.sin(t * 3),
      lookX: 0.9,
      lookY: t >= 24.0 ? -0.45 : 0.1
    });
    ctx.restore();

    // PASS 2 PLAUSIBLE BOLTS (#3 & #4) glowing emerald green!
    var manualRoll = st && st.roll >= 1 && st.roll <= 6 ? Math.round(st.roll) : 0;
    var bg = { 3: "#39a86b", 4: "#39a86b" };
    if (manualRoll > 0) bg[manualRoll] = registerBrightForFace(manualRoll);
    drawSetupAPortholeFrame(ctx, 0, 4, pR, pR + 30, {
      lampMounted: true,
      lampOn: true,
      mailSlotOpen: 0.8,
      boltGlow: bg
    });

    // SNAIL MAIL HANDOFF TO BROOK -> THEN CLIMBING UP THE RIGHT BRASS BEZEL TO 12:00 (DEAR ALIEN!)
    var showSnail = !(st && st.snailMail === false);
    if (showSnail) {
      var s0 = [-92, 86];
      var s1 = [24, 52];
      var s2 = [166, 18]; // Brook handoff at right latch!
      var climb1 = [174, -84];
      var climb2 = [12, -158]; // 12:00 top rim toward Alien Listening Post!

      var isTimed = t >= 21.7 && t < 26.05 && !(st && typeof st.snailMail === "number");
      var uDeliver = isTimed ? clamp(0.65 + smoothstep(21.8, 22.9, t) * 0.35, 0, 1) : 1.0;
      var uClimb = isTimed ? easeInOutCubic(invLerp(23.85, 25.95, t)) : 0.45;
      var hasReply = !isTimed || t >= 23.3;
      var stampGlint = isTimed ? Math.sin(invLerp(23.1, 23.85, t) * Math.PI) : 0;

      drawSnailSilverTrail(ctx, s0, s1, s2, uDeliver, t, 10);
      if (uClimb > 0.01) {
        drawSnailSilverTrail(ctx, s2, climb1, climb2, uClimb, t, 10.5);
      }

      var sPt, sAng, faceDir;
      if (uClimb > 0.02) {
        sPt = quadBezierPt(s2, climb1, climb2, uClimb);
        sAng = quadBezierAngle(s2, climb1, climb2, uClimb);
        faceDir = -1; // climbing up-left along upper-right bezel!
      } else {
        sPt = quadBezierPt(s0, s1, s2, uDeliver);
        sAng = quadBezierAngle(s0, s1, s2, uDeliver);
        faceDir = 1;
      }

      drawMailSnail(ctx, {
        x: sPt[0],
        y: sPt[1],
        scale: 1.22,
        dir: faceDir,
        tilt: faceDir === -1 ? (sAng + Math.PI) * 0.65 : sAng * 0.45,
        t: t,
        hasEnvelope: true,
        replyPostmark: hasReply,
        pips: manualRoll,
        glint: stampGlint,
        salute: uClimb > 0.1 ? 0.3 : 0.45,
        lookX: faceDir === -1 ? -0.6 : 0.85,
        lookY: uClimb > 0.1 ? -0.65 : -0.1
      });
    }
    ctx.restore();

    // Brook the Trout receiving Turkey's letter, stamping Plausible reply, & looking UP as Snail climbs to Alien!
    var reachMail = (t >= 22.4 && t < 24.0) ? smoothstep(22.4, 23.1, t) * (1 - smoothstep(23.6, 24.1, t)) : 0.35;
    var lookUpToAlien = smoothstep(24.0, 25.4, t);
    drawBrookTrout(ctx, {
      x: lerp(940, 858, reachMail) + Math.sin(t * 2.4) * 8,
      y: 286 - lookUpToAlien * 24 + Math.cos(t * 2.0) * 6,
      scale: 1.50,
      dir: -1,
      t: t,
      swimAmp: 0.85,
      pitch: lookUpToAlien * 0.16,
      lookX: -0.85,
      lookY: lerp(0.08, -0.85, lookUpToAlien),
      finReach: 0.55 + reachMail * 0.42
    });

    // Plausible Green Thought Medallions (Faces 3–4: Bread-Tin Lure vs Friendly Survey Sub)
    if (showForkBubbles > 0.02) {
      ctx.save();
      ctx.globalAlpha = showForkBubbles;
      drawThoughtMedallion(ctx, 175, 162, 64, "#39a86b", function (c) {
        c.strokeStyle = "#e4faee";
        c.lineWidth = 2.4;
        roundRectPath(c, -34, 2, 68, 24, 5);
        c.stroke();
        c.beginPath();
        c.moveTo(0, -34);
        c.lineTo(0, -8);
        c.arc(8, -8, 8, Math.PI, 0, true);
        c.stroke();
      });

      drawThoughtMedallion(ctx, 1078, 132, 64, "#39a86b", function (c) {
        c.fillStyle = "rgba(255, 220, 120, 0.55)";
        c.beginPath();
        c.moveTo(10, 0);
        c.lineTo(46, -22);
        c.lineTo(46, 22);
        c.closePath();
        c.fill();
        c.strokeStyle = "#e4faee";
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

  // =========================================================================
  // ACT 3 PASS 3 (26.0 – 31.6s): PREPOSTEROUS / OUT OF BOUNDS (FACES 5–6 RUST)
  // ALIEN LISTENING POST ("DEAR ALIEN") VIA SNAIL MAIL!
  // =========================================================================
  function drawAlienListeningPostScene(ctx, W, stageH, t, st) {
    ctx.save();

    // Cosmic night-sky above creek surface (y = 0..172) + glowing emerald-indigo creek below (y = 172..536)!
    var surfY = 172 + Math.sin(t * 1.8) * 3;
    var nightGrad = ctx.createLinearGradient(0, 0, 0, surfY);
    nightGrad.addColorStop(0, "#0b0d1f");
    nightGrad.addColorStop(0.65, "#191c3b");
    nightGrad.addColorStop(1, "#223b4d");
    ctx.fillStyle = nightGrad;
    ctx.fillRect(0, 0, W, surfY + 10);

    // Deterministic twinkling Trout Town night stars & distant ringed planet!
    for (var s = 0; s < 36; s++) {
      var sx = hash1(s * 19.3) * W;
      var sy = hash1(s * 31.7) * (surfY - 22);
      var tw = 0.45 + 0.55 * Math.sin(t * 4.5 + s * 2.1);
      ctx.fillStyle = "rgba(245, 244, 255," + (tw * 0.85).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(sx, sy, 1.0 + (s % 2) * 0.9, 0, TAU);
      ctx.fill();
    }
    // Tiny ringed planet top-left
    ctx.save();
    ctx.translate(292, 62);
    ctx.rotate(-0.26);
    ctx.fillStyle = "#d97a48";
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(247, 224, 172, 0.8)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 5.5, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();

    // Underwater river section (y = surfY..stageH)
    var waterGrad = ctx.createLinearGradient(0, surfY, 0, stageH);
    waterGrad.addColorStop(0, "#1c5460");
    waterGrad.addColorStop(0.5, "#123842");
    waterGrad.addColorStop(1, "#091d24");
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, surfY, W, stageH - surfY);

    // Shimmering creek surface waterline ripples
    ctx.strokeStyle = "rgba(176, 244, 236, 0.55)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (var wx = 0; wx <= W; wx += 32) {
      var wy = surfY + Math.sin(wx * 0.025 + t * 3.2) * 3.5;
      if (wx === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.stroke();

    // Submerged Bread-Roll Tin Submarine centered below surface (subCX=640, subCY=346)
    var subCX = 640, subCY = 350 + Math.sin(t * 2.0) * 4;
    var pR = 118;

    ctx.save();
    ctx.translate(subCX, subCY);
    var extGrad = ctx.createRadialGradient(-24, -40, 20, 0, 0, 245);
    extGrad.addColorStop(0, "#688588");
    extGrad.addColorStop(0.65, "#384e52");
    extGrad.addColorStop(1, "#1e2d30");
    ctx.fillStyle = extGrad;
    ctx.strokeStyle = "#0e1a1c";
    ctx.lineWidth = 3.2;

    ctx.beginPath();
    ctx.moveTo(-200, -142);
    ctx.lineTo(200, -142);
    ctx.quadraticCurveTo(238, -142, 230, -96);
    ctx.lineTo(220, -20);
    ctx.bezierCurveTo(196, 0, 198, 40, 216, 60);
    ctx.lineTo(206, 122);
    ctx.quadraticCurveTo(198, 152, 162, 152);
    ctx.lineTo(-162, 152);
    ctx.quadraticCurveTo(-198, 152, -206, 122);
    ctx.lineTo(-228, -96);
    ctx.quadraticCurveTo(-238, -142, -200, -142);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    roundRectPath(ctx, -242, -154, 484, 20, 9);
    ctx.fillStyle = "#8aa5a8";
    ctx.fill();
    ctx.stroke();

    // Inside porthole: Turkey looking UP in amazement at the Alien Saucer Pod + Boot reflection!
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 4, pR, 0, TAU);
    ctx.clip();
    var inGlow = ctx.createRadialGradient(0, -30, 12, 0, 10, pR);
    inGlow.addColorStop(0, "#593b22");
    inGlow.addColorStop(0.6, "#2c2219");
    inGlow.addColorStop(1, "#161918");
    ctx.fillStyle = inGlow;
    ctx.fillRect(-pR, -pR, pR * 2, pR * 2);

    drawTurkeyPilot(ctx, {
      x: -24,
      y: 52,
      scale: 0.92,
      dir: 1,
      t: t,
      headTilt: -0.22,
      lookX: 0.35,
      lookY: -0.95,
      beakOpen: 0.32
    });
    ctx.restore();

    // PASS 3 PREPOSTEROUS BOLTS (#5 & #6) pulsing bright cosmic Rust!
    var manualRoll = st && st.roll >= 1 && st.roll <= 6 ? Math.round(st.roll) : 0;
    var bg = { 5: "#ee5c2b", 6: "#ee5c2b" };
    if (manualRoll > 0) bg[manualRoll] = registerBrightForFace(manualRoll);
    drawSetupAPortholeFrame(ctx, 0, 4, pR, pR + 26, {
      lampMounted: true,
      lampOn: true,
      mailSlotOpen: 0.5,
      boltGlow: bg
    });

    // Silver Snail Mail trail climbing up right bezel to 12:00 top rim (-44, -146)!
    var showSnail = !(st && st.snailMail === false);
    if (showSnail) {
      var tr0 = [146, 12];
      var tr1 = [142, -112];
      var tr2 = [-44, -148];
      drawSnailSilverTrail(ctx, tr0, tr1, tr2, 1.0, t, 9.5);

      var isTimed = t >= 26.0 && t < 31.65;
      var stampedAlien = !isTimed || t >= 28.45;
      var alienGlint = isTimed ? Math.sin(invLerp(28.25, 29.15, t) * Math.PI) : 0.5;

      drawMailSnail(ctx, {
        x: -44,
        y: -152,
        scale: 1.15,
        dir: 1,
        tilt: -0.06,
        t: t,
        hasEnvelope: true,
        replyPostmark: true,
        alienPostmark: stampedAlien,
        pips: manualRoll,
        glint: alienGlint,
        salute: 0.55,
        lookX: 0.65,
        lookY: -0.85
      });
    }
    ctx.restore();

    // Brook the Trout hovering right beside the sub looking UP at the Alien Saucer Pod!
    drawBrookTrout(ctx, {
      x: 968 + Math.sin(t * 2.4) * 8,
      y: 320 + Math.cos(t * 2.0) * 6,
      scale: 1.32,
      dir: -1,
      t: t,
      pitch: 0.22,
      lookX: -0.85,
      lookY: -0.9,
      finReach: 0.65
    });

    // HERO ALIEN SAUCER LISTENING POD HOVERING ABOVE THE WATERLINE (cx=640, y=94)!
    var podArrive = (t >= 26.0 && t < 31.65) ? easeOutBack(invLerp(26.0, 26.85, t)) : 1.0;
    var podX = 640 + Math.sin(t * 2.1) * 14;
    var podY = lerp(-60, 96, podArrive) + Math.cos(t * 2.9) * 4;
    var stampReach = (t >= 28.0 && t < 29.2)
      ? Math.sin(invLerp(28.0, 29.2, t) * Math.PI)
      : 0;

    drawAlienSaucerPod(ctx, {
      x: podX,
      y: podY,
      scale: 1.12,
      t: t,
      beamOn: smoothstep(26.3, 27.1, t < 26.0 ? 28.0 : t),
      targetX: subCX,
      targetY: subCY - 6,
      stampReach: stampReach,
      lookX: stampReach > 0.2 ? -0.55 : 0,
      lookY: 0.78
    });

    // PREPOSTEROUS / OUT OF BOUNDS THOUGHT MEDALLIONS (Faces 5–6 Rust #ee5c2b — ZERO text!)
    var medShow = (t >= 26.0 && t < 31.65) ? smoothstep(26.7, 27.4, t) : 0.95;
    if (medShow > 0.02) {
      ctx.save();
      ctx.globalAlpha = medShow;

      // Left Medallion: Emperor's Lost Rocket Moon-Boot + Ringed Planet!
      drawThoughtMedallion(ctx, 178, 232, 68, "#ee5c2b", function (c) {
        // Rocket flames under boot sole
        c.fillStyle = "#ff9f38";
        c.beginPath();
        c.moveTo(-14, 22);
        c.lineTo(-6, 42);
        c.lineTo(4, 22);
        c.lineTo(14, 39);
        c.lineTo(22, 22);
        c.closePath();
        c.fill();
        // Cosmic Space-Boot silhouette
        c.strokeStyle = "#ffe6d9";
        c.lineWidth = 2.4;
        c.beginPath();
        c.moveTo(-16, -30);
        c.lineTo(8, -28);
        c.lineTo(8, 2);
        c.lineTo(28, 12);
        c.lineTo(26, 22);
        c.lineTo(-18, 22);
        c.closePath();
        c.stroke();
        // Tiny ringed moon beside boot
        c.beginPath();
        c.arc(-26, -16, 6, 0, TAU);
        c.stroke();
        c.beginPath();
        c.ellipse(-26, -16, 13, 3, -0.35, 0, TAU);
        c.stroke();
      });

      // Right Medallion: Saucer Gravity-Well / Time-Vortex Abduction!
      drawThoughtMedallion(ctx, 1102, 232, 68, "#ee5c2b", function (c) {
        // Mini saucer at top of medallion
        c.strokeStyle = "#ffe6d9";
        c.lineWidth = 2.3;
        c.beginPath();
        c.arc(0, -22, 12, Math.PI, TAU);
        c.stroke();
        c.beginPath();
        c.ellipse(0, -20, 24, 6, 0, 0, TAU);
        c.stroke();
        // Tractor rings & spiral gravity vortex below
        c.strokeStyle = "#7effce";
        c.lineWidth = 2.0;
        c.beginPath();
        c.ellipse(0, 2, 16, 4.5, 0, 0, TAU);
        c.stroke();
        c.beginPath();
        c.ellipse(0, 18, 26, 6.5, 0, 0, TAU);
        c.stroke();
      });

      ctx.restore();
    }

    ctx.restore();
  }

  function drawThoughtMedallion(ctx, cx, cy, r, ringCol, iconFn) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = "rgba(14, 28, 34, 0.88)";
    ctx.strokeStyle = ringCol;
    ctx.lineWidth = 3.0;
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
  function getEditorialCaption(t, manualView, snailForced) {
    if (manualView === "turkey") {
      return {
        act: 3,
        badge: "PASS 1 · PROBABLE (1–2)",
        color: "#1d596e",
        kicker: "FIRST PASS · PROBABLE (FACES 1–2) · TURKEY LOOKS OUT · SNAIL MAIL",
        headline: "Turkey peers out from the bread-tin cabin and dispatches Probable (1–2) guesses by Snail Mail.",
        sub: "Tier 1 Rubric (“I’d expect it here”): Mail Snail carries Turkey’s red-stamped note across the glass"
      };
    }
    if (manualView === "trout") {
      return {
        act: 3,
        badge: "PASS 2 · PLAUSIBLE (3–4)",
        color: "#2d6846",
        kicker: "SECOND PASS · PLAUSIBLE (FACES 3–4) · TROUT LOOKS IN · SNAIL MAIL",
        headline: "Brook reads Turkey’s note in the creek, adds Plausible (3–4) options, and mails up to Dear Alien!",
        sub: "Tier 2 Rubric (“I can see how it could happen”): Mail Snail climbs the bezel to the Alien Listening Post"
      };
    }
    if (manualView === "alien") {
      return {
        act: 3,
        badge: "PASS 3 · ALIEN (5–6)",
        color: "#9e3d1c",
        kicker: "THIRD PASS · PREPOSTEROUS / OUT OF BOUNDS (FACES 5–6) · ALIEN LISTENING POST",
        headline: "Dear Alien: the Saucer Listener scans the port and stamps wild Preposterous (5–6) swerves!",
        sub: "Tier 3 Rubric (“Wild, even for Trout Town!”): cosmic triangle postmark completes all six die faces"
      };
    }
    if (snailForced && t < 15.6) {
      return {
        act: 3,
        badge: "SNAIL MAIL BRIDGE",
        color: "#9e3d1c",
        kicker: "TROUT TOWN CANON · 3-PASS SNAIL MAIL CHAIN ACROSS THE GLASS",
        headline: "Snail Mail links Turkey (1–2 Probable), Trout (3–4 Plausible), and Alien (5–6 Preposterous)!",
        sub: "Porthole Post: spiral shell · dark postal cap · silver glass trail · triple-stamped envelope"
      };
    }
    if (t < 4.0) {
      return {
        act: 1,
        badge: "",
        color: "#1d596e",
        kicker: "ACT I · SCION EPISODE-TOWN · FLOODED BEND & THE BREAD-ROLL TIN (0:00–0:04)",
        headline: "Flood silt hid the crossing; Turkey seals into the dry bread-tin sub while Brook waits in the creek.",
        sub: "Primitives: River Works bench · Twin Tree Trunks · Culvert Rock Notch · Stone Steps · Mail Snail"
      };
    }
    if (t < 8.0) {
      return {
        act: 1,
        badge: "SNAIL MAIL CANON",
        color: "#9e3d1c",
        kicker: "ACT I · WHY SNAIL MAIL? · SEALED GLASS SEPARATES AIR FROM CREEK WATER (0:04–0:08)",
        headline: "Voices muffle against the thick porthole glass—Trout Town communicates through Snail Mail!",
        sub: "Canon Rule: one dry day of air inside, rushing river outside; only the Mail Snail bridges the glass"
      };
    }
    if (t < 11.6) {
      return {
        act: 2,
        badge: "",
        color: "#9e3d1c",
        kicker: "ACT II · SCION EPISODE-WORKS · SINGLE-SLOT SNAP: LAMP MODULE (0:08–0:12)",
        headline: "Snap in the Lamp Module and flip the toggle: aimed 2900K light cuts silt to reveal the rock notch.",
        sub: "Constraint: one attachment fits the Single Slot at a time; Mail Snail perches ready at the brass mail-slot"
      };
    }
    if (t < 15.6) {
      return {
        act: 2,
        badge: "",
        color: "#1d596e",
        kicker: "ACT II · SCION EPISODE-WORKS · SINGLE-SLOT SWAP: BALLAST TRAY (0:12–0:16)",
        headline: "Fast current stretches the ribbon—swap to Ballast to ride low in calm shelter behind the stone lip.",
        sub: "Recovery: Stone Steps stay open along the bank whenever a pilot returns to swap parts"
      };
    }
    if (t < 20.8) {
      return {
        act: 3,
        badge: "PASS 1 · PROBABLE (1–2)",
        color: "#1d596e",
        kicker: "FIRST PASS · PROBABLE (FACES 1–2) · TURKEY LOOKS OUT · SNAIL MAIL (0:16–0:21)",
        headline: "Timber snag or wader boot? Turkey writes Probable (1–2) guesses and sends Snail Mail across!",
        sub: "Pass 1 (Teal #1d596e · “I’d expect it here”): Mail Snail crawls out the brass slot trailing silver"
      };
    }
    if (t < 26.0) {
      return {
        act: 3,
        badge: "PASS 2 · PLAUSIBLE (3–4)",
        color: "#2d6846",
        kicker: "SECOND PASS · PLAUSIBLE (FACES 3–4) · TROUT LOOKS IN · DEAR ALIEN (0:21–0:26)",
        headline: "Brook stamps Plausible (3–4) creek replies—then Mail Snail climbs up to the Alien Listening Post!",
        sub: "Pass 2 (Green #2d6846 · “I can see how it could happen”): Snail carries the letter up to 12 o’clock"
      };
    }
    if (t < 31.6) {
      return {
        act: 3,
        badge: "PASS 3 · ALIEN (5–6)",
        color: "#9e3d1c",
        kicker: "THIRD PASS · PREPOSTEROUS / OUT OF BOUNDS (FACES 5–6) · ALIEN LISTENING POST (0:26–0:32)",
        headline: "Emperor’s moon-boot or saucer tractor-beam? The Alien Listener stamps Preposterous (5–6)!",
        sub: "Pass 3 (Rust #9e3d1c · “Wild, even for Trout Town!”): cosmic triangle postmark completes all 6 bolts"
      };
    }
    if (t < 34.8) {
      return {
        act: 4,
        badge: "ALL 6 FACES ARMED",
        color: "#2d6846",
        kicker: "ACT IV · SCION EPISODE-DIE · THREE SNAIL-MAIL PASSES FILL THE PORT (0:32–0:35)",
        headline: "Snail Mail returns all six faces: 1–2 Probable (Teal), 3–4 Plausible (Green), 5–6 Preposterous (Rust).",
        sub: "Three-Writer Chain: Turkey -> Trout -> Alien Listener — now Pilot A rolls 1d6 once!"
      };
    }
    if (t < 41.2) {
      return {
        act: 4,
        badge: "ROLLED 1D6 · FACE #4",
        color: "#2d6846",
        kicker: "ACT IV · SCION EPISODE-DIE · PILOT ROLLS 1D6 ONCE & STAGES FACE #4 (0:35–0:41)",
        headline: "Pilot rolls once—Face 4 Plausible lands! Brook ties the red ribbon while Snail Mail stamps 4 pips.",
        sub: "Rule: Snail Mail keeps the ending you rolled so the next pilot inherits a real change"
      };
    }
    if (t < 46.8) {
      return {
        act: 5,
        badge: "SNAIL MAIL MEMORY",
        color: "#9e3d1c",
        kicker: "ACT V · SCION EPISODE-MEMORY · CHALK CHART & SNAIL MAIL TO NEXT PILOT (0:41–0:47)",
        headline: "Chalk the verified route under glass—then Snail Mail carries your triple-stamped clue forward!",
        sub: "Worksheet Footer: “Snail Mail keeps the ending you rolled. Give the next pilot your clue.”"
      };
    }
    return {
      act: 5,
      badge: "CROSSING VERIFIED",
      color: "#1d596e",
      kicker: "ACT V · SCION EPISODE-CROSSING · THREE BELL RINGS AT THE BEND (0:47–0:52)",
      headline: "Lantern lit: Brook rings the landing bell three times—now play all 55 Three-Pass Portholes!",
      sub: "Watch each 3-Pass film (Turkey · Trout · Alien) or take live cockpit & Snail Mail controls below"
    };
  }

  function drawLowerStrip(ctx, W, H, stageH, t, showCaptions, manualView, snailForced) {
    var stripH = H - stageH;
    ctx.save();
    ctx.fillStyle = "#faf8f3";
    ctx.fillRect(0, stageH, W, stripH);

    ctx.fillStyle = "#14181a";
    ctx.fillRect(0, stageH, W, 3);

    var info = getEditorialCaption(t, manualView, snailForced);

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

    ctx.fillStyle = info.color;
    ctx.font = "700 12.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText(info.kicker, 52, stageH + 34);

    if (info.badge) {
      roundRectPath(ctx, W - 456, stageH + 14, 182, 22, 5);
      ctx.fillStyle = "#f4ead4";
      ctx.fill();
      ctx.strokeStyle = info.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = info.color;
      ctx.font = "700 11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText(info.badge, W - 442, stageH + 29);
    }

    for (var k = 1; k <= 5; k++) {
      var px = W - 252 + (k - 1) * 40;
      var py = stageH + 25;
      ctx.fillStyle = k === info.act ? info.color : "#e6e1d6";
      roundRectPath(ctx, px, py - 8, 30, 10, 4);
      ctx.fill();
    }

    ctx.fillStyle = "#14181a";
    ctx.font = "400 26px Georgia, 'Iowan Old Style', 'Times New Roman', serif";
    ctx.fillText(info.headline, 52, stageH + 86);

    ctx.fillStyle = "#546066";
    ctx.font = "italic 16px Georgia, 'Iowan Old Style', serif";
    ctx.fillText(info.sub, 52, stageH + 134);

    ctx.restore();
  }

  // =========================================================================
  // MASTER RENDERER: window.TROUT_SUB_INTRO.render(ctx, W, H, t, state)
  // Supports state = { lamp, ballast, view: "auto"|"turkey"|"trout"|"alien", roll, snailMail, showCaptions }
  // =========================================================================
  function renderIntro(ctx, W, H, rawT, state) {
    var st = state || {};
    var t = clamp(rawT || 0, 0, 52.0);
    var showCaptions = st.showCaptions !== false;
    var stageH = 536;
    var pCX = 640, pCY = 220, pRGlass = 156, pROuter = 188;

    var hasManualLamp = typeof st.lamp === "boolean";
    var hasManualBallast = typeof st.ballast === "boolean";
    var manualView = st.view && st.view !== "auto" ? st.view : null;
    var manualRoll = st.roll && st.roll >= 1 && st.roll <= 6 ? Math.round(st.roll) : 0;
    var snailForced = st.snailMail === true || st.snailActive === true ||
      typeof st.snailMail === "number" || typeof st.snailT === "number";

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, stageH);
    ctx.clip();

    if (manualView === "alien" || (!manualView && !snailForced && t >= 26.0 && t < 31.6)) {
      // PASS 3: PREPOSTEROUS / OUT OF BOUNDS (5–6 RUST) · ALIEN LISTENING POST!
      drawAlienListeningPostScene(ctx, W, stageH, t, st);
    } else if (manualView === "trout" || (!manualView && !snailForced && t >= 21.8 && t < 26.0)) {
      // PASS 2: PLAUSIBLE (3–4 GREEN) · TROUT LOOKS IN & MAILS UP TO ALIEN!
      drawTroutLookingInScene(ctx, W, stageH, t, t < 26.0 ? smoothstep(21.9, 22.6, t) : 0.9, st);
    } else if (!manualView && !snailForced && t >= 20.8 && t < 21.8) {
      // BEVELED GLASS CUT BETWEEN PASS 1 (TURKEY 1–2) & PASS 2 (TROUT 3–4) WITH SNAIL CROSSING!
      var splitU = easeInOutCubic(invLerp(20.8, 21.5, t));
      var splitX = lerp(W * 0.72, W * 0.52, splitU);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(splitX + 42, 0);
      ctx.lineTo(splitX - 42, stageH);
      ctx.lineTo(0, stageH);
      ctx.closePath();
      ctx.clip();
      drawCockpitComposite(ctx, W, stageH, t, { showCaptions: showCaptions, snailMail: false }, pCX, pCY, pRGlass, pROuter);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(splitX + 42, 0);
      ctx.lineTo(W, 0);
      ctx.lineTo(W, stageH);
      ctx.lineTo(splitX - 42, stageH);
      ctx.closePath();
      ctx.clip();
      drawTroutLookingInScene(ctx, W, stageH, t, 0.92, { showCaptions: showCaptions, snailMail: false });
      ctx.restore();

      ctx.strokeStyle = "#faf8f3";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(splitX + 42, 0);
      ctx.lineTo(splitX - 42, stageH);
      ctx.stroke();

      var seamS0 = [pCX - 128, pCY + 94];
      var seamS1 = [splitX - 18, pCY + 38];
      var seamS2 = [splitX + 148, pCY + 44];
      var uBridge = lerp(0.48, 0.78, invLerp(20.8, 21.8, t));
      drawSnailSilverTrail(ctx, seamS0, seamS1, seamS2, uBridge, t, 11);
      var bPt = quadBezierPt(seamS0, seamS1, seamS2, uBridge);
      var bAng = quadBezierAngle(seamS0, seamS1, seamS2, uBridge);
      drawMailSnail(ctx, {
        x: bPt[0],
        y: bPt[1],
        scale: 1.26,
        dir: 1,
        tilt: bAng * 0.45,
        t: t,
        hasEnvelope: true,
        glint: 0.85,
        salute: 0.35,
        lookX: 0.9,
        lookY: -0.05
      });
    } else if (t < 4.4 && !manualView && !hasManualLamp && !hasManualBallast && !snailForced && !manualRoll) {
      // ACT 1A: River Works & Flooded Bend -> Iris into Setup A Cockpit!
      drawAct1RiverWorksAndBend(ctx, W, stageH, t);
      if (t >= 3.7) {
        var irisU = easeInOutCubic(invLerp(3.7, 4.4, t));
        ctx.save();
        ctx.globalAlpha = irisU;
        drawCockpitComposite(ctx, W, stageH, t, st, pCX, pCY, pRGlass, pROuter);
        ctx.restore();
      }
    } else {
      // Setup A Cockpit Composite (Acts 1B, 2, Pass 1 Probable, Act 4, Act 5 + interactive overrides!)
      drawCockpitComposite(ctx, W, stageH, t, st, pCX, pCY, pRGlass, pROuter);
    }

    // Subtle handmade paper/film grain lines
    ctx.fillStyle = "rgba(255, 248, 230, 0.022)";
    for (var g = 0; g < 18; g++) {
      var gy = ((g * 31 + Math.floor(t * 24) * 17) % stageH);
      ctx.fillRect(0, gy, W, 1);
    }

    ctx.restore(); // end upper stage clip

    drawLowerStrip(ctx, W, H, stageH, t, showCaptions, manualView, snailForced);

    ctx.restore();
  }

  // =========================================================================
  // SETUP A COCKPIT COMPOSITE ACROSS ACTS 1B, 2, PASS 1 (PROBABLE), 4, 5
  // =========================================================================
  function drawCockpitComposite(ctx, W, stageH, t, st, pCX, pCY, pRGlass, pROuter) {
    var showCaptions = st.showCaptions !== false;
    var hasManualLamp = typeof st.lamp === "boolean";
    var hasManualBallast = typeof st.ballast === "boolean";
    var manualRoll = st.roll && st.roll >= 1 && st.roll <= 6 ? Math.round(st.roll) : 0;
    var snailDisabled = st.snailMail === false;
    var snailForced = st.snailMail === true || st.snailActive === true ||
      typeof st.snailMail === "number" || typeof st.snailT === "number";
    var manualSnailU = typeof st.snailMail === "number"
      ? clamp(st.snailMail, 0, 1)
      : (typeof st.snailT === "number" ? clamp(st.snailT, 0, 1) : null);

    var activeModule = "none";
    if (t >= 9.1 && t < 12.7) activeModule = "lamp";
    else if (t >= 13.6 && t < 15.8) activeModule = "ballast";
    else if (t >= 15.8) activeModule = "lamp";

    if (hasManualBallast && st.ballast) activeModule = "ballast";
    else if (hasManualLamp && st.lamp) activeModule = "lamp";

    var lampToggleOn = (t >= 9.95 && t < 12.35) || (t >= 16.0);
    if (hasManualLamp) lampToggleOn = !!st.lamp;
    var lampBeamOn = lampToggleOn && activeModule === "lamp";

    var fastFlow = (t >= 11.6 && t < 15.6) ? smoothstep(11.6, 12.2, t) : 0;
    var ballastDepth = activeModule === "ballast"
      ? (hasManualBallast ? 1.0 : smoothstep(13.9, 14.9, t))
      : 0;
    var bubblesAmt = (t >= 13.8 && t < 15.0) ? Math.sin(invLerp(13.8, 15.0, t) * Math.PI) : 0;

    var yaw = (t >= 11.7 && t < 14.1)
      ? Math.sin(t * 11) * 0.028 * (1 - ballastDepth)
      : Math.sin(t * 1.4) * 0.003;

    var siltAmt = 0.34;
    if (t >= 8.0 && t < 15.6) siltAmt = 0.78;
    else if (t >= 15.6 && t < 31.6) siltAmt = 0.22;
    else if (t >= 31.6 && t < 41.8) siltAmt = 0.30;
    else if (t >= 41.8) siltAmt = lerp(0.30, 0.0, smoothstep(41.8, 44.6, t));

    var lampAimX = (t >= 9.95 && t < 11.6)
      ? Math.sin(invLerp(9.95, 11.3, t) * Math.PI * 1.5) * -32 * (1 - smoothstep(10.9, 11.5, t))
      : 0;

    var rolledFace = manualRoll || 4;
    var ribbonTied = t >= 39.2 || (manualRoll > 0 && t >= 37.5);
    var chartProgress = smoothstep(41.6, 43.8, t);
    var chartStar = smoothstep(43.8, 44.4, t);
    var lanternLit = t >= 46.8;

    // Bell swing & acoustic rings at 47.8s, 48.6s, 49.4s!
    var bellSwing = 0;
    var bellRings = 0;
    if (t >= 47.7) {
      var bt = t - 47.8;
      bellSwing = Math.sin(bt * 8.2) * 0.42 * Math.exp(-Math.max(0, bt - 2.0) * 1.4);
      bellRings = clamp(1 - ((t - 47.8) / 3.2), 0, 1);
    }

    // 3-PASS TIERED BOLT GLOW MAP:
    // - Pass 1 Probable (Faces 1–2 Teal): t in 16.0..21.8 or view="turkey"
    // - Act 4A All 6 Faces Armed (1–2 Teal, 3–4 Green, 5–6 Rust): t in 31.6..35.0
    // - Act 4B Rolled Face #4 Plausible Green: t in 37.3..41.2
    var boltGlow = {};
    var badgeInside = false;
    if (st.view === "turkey" || (t >= 16.0 && t < 21.8)) {
      boltGlow[1] = "#2ea6c4";
      boltGlow[2] = "#2ea6c4";
      badgeInside = true; // keeps 12:00 badge cleanly inside rim without touching top edge!
    } else if (t >= 31.6 && t < 35.2) {
      boltGlow[1] = "#2ea6c4";
      boltGlow[2] = "#2ea6c4";
      boltGlow[3] = "#39a86b";
      boltGlow[4] = "#39a86b";
      boltGlow[5] = "#ee5c2b";
      boltGlow[6] = "#ee5c2b";
      badgeInside = true;
    } else if (t >= 37.25 && t < 41.2) {
      boltGlow[rolledFace] = registerBrightForFace(rolledFace);
    }
    if (manualRoll > 0) {
      boltGlow[manualRoll] = registerBrightForFace(manualRoll);
    }

    var toggleAngle = lampToggleOn ? -0.68 : 0.68;
    if (!hasManualLamp && t >= 9.7 && t < 10.1) {
      toggleAngle = lerp(0.68, -0.68, easeOutBack(invLerp(9.8, 10.02, t)));
    }

    var mailSlotOpen = (snailForced || (t >= 16.8 && t < 22.0) || (t >= 44.3 && t < 46.5)) ? 1 : 0;

    // 1. Setup A Cockpit Shell
    drawSetupACockpit(ctx, W, stageH, {
      t: t,
      showCaptions: showCaptions,
      yaw: yaw,
      activeModule: activeModule,
      lampToggleOn: lampToggleOn,
      toggleAngle: toggleAngle,
      ballastLever: smoothstep(13.8, 14.3, t),
      chartProgress: chartProgress,
      chartStar: chartStar
    });

    // 2. Porthole River Exterior
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

    var duckRabbitSil = (st.view === "turkey" || (t >= 15.6 && t < 21.8)) ? smoothstep(15.6, 16.3, st.view === "turkey" ? 18.0 : t) : 0;

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
      duckRabbit: duckRabbitSil
    });

    // Brook acting outside inside the porthole
    if (snailForced && (t < 18.8 || (t >= 31.6 && t < 37.8))) {
      drawBrookTrout(ctx, {
        x: pCX + 98 + Math.sin(t * 2.5) * 6,
        y: pCY + 28,
        scale: 0.84,
        dir: -1,
        t: t,
        lookX: -0.9,
        finReach: 0.65
      });
    } else if (t >= 4.3 && t < 8.0) {
      var tapGlass = 0.5 + 0.45 * Math.sin(t * 5.2);
      drawBrookTrout(ctx, {
        x: pCX + 72 + Math.sin(t * 2.0) * 6,
        y: pCY + 14 + Math.cos(t * 1.8) * 5,
        scale: 0.92,
        dir: -1,
        t: t,
        swimAmp: 0.95,
        mouthOpen: 0.35 + 0.3 * Math.max(0, Math.sin(t * 6.5)),
        finReach: tapGlass,
        lookX: -0.95,
        lookY: 0.05
      });
    } else if (t >= 18.8 && t < 21.8) {
      var peekIn = smoothstep(18.8, 19.9, t);
      drawBrookTrout(ctx, {
        x: lerp(pCX + 185, pCX + 108, peekIn),
        y: pCY + 24 + Math.sin(t * 2.6) * 5,
        scale: 0.86,
        dir: -1,
        t: t,
        lookX: -0.95,
        lookY: 0.25,
        finReach: 0.65
      });
    } else if (t >= 37.6 && t < 41.2) {
      var swimU = easeInOutCubic(invLerp(37.7, 39.2, t));
      drawBrookTrout(ctx, {
        x: lerp(pCX + 135, pCX + 58, swimU),
        y: lerp(pCY + 58, pCY - 22, swimU) + Math.sin(t * 4) * 4,
        scale: 0.82,
        dir: -1,
        t: t,
        swimAmp: t < 39.2 ? 1.4 : 0.8,
        holdingRibbon: t < 39.2,
        finReach: smoothstep(38.8, 39.3, t)
      });
    } else if (t >= 44.4) {
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

      if (t >= 46.8) {
        var arriveU = easeInOutCubic(invLerp(46.8, 47.6, t));
        var tugY = t >= 47.7 ? Math.abs(Math.sin((t - 47.8) * 4.1)) * 8 : 0;
        drawBrookTrout(ctx, {
          x: lerp(pCX - 40, pCX + 22, arriveU),
          y: lerp(pCY + 34, pCY - 28, arriveU) + tugY,
          scale: 0.84,
          dir: 1,
          t: t,
          pitch: -0.22 * arriveU,
          finReach: smoothstep(47.4, 47.8, t) * 0.95,
          lookX: 0.7,
          lookY: -0.5
        });
      }
    }

    ctx.restore(); // end glass clip

    // 3. Porthole Brass Bezel
    drawSetupAPortholeFrame(ctx, pCX, pCY, pRGlass, pROuter, {
      boltGlow: boltGlow,
      badgeInside: badgeInside,
      lampMounted: activeModule === "lamp",
      lampOn: lampBeamOn,
      mailSlotOpen: mailSlotOpen
    });

    // Act 1B Muffled Glass Barrier Waves
    if (t >= 4.6 && t < 7.8 && !snailForced && !st.view) {
      var mufAlpha = Math.min(smoothstep(4.6, 5.1, t), 1 - smoothstep(7.3, 7.8, t));
      drawMuffledGlassBarrier(ctx, pCX, pCY, pRGlass, t, mufAlpha);
    }

    // Snap shockwave on Single Slot
    if ((t >= 9.08 && t < 9.6) || (t >= 13.58 && t < 14.1)) {
      var snapP = t < 11 ? invLerp(9.08, 9.6, t) : invLerp(13.58, 14.1, t);
      ctx.strokeStyle = "rgba(255, 222, 128," + (1 - snapP).toFixed(3) + ")";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(154, 468, 16 + snapP * 48, 0, TAU);
      ctx.stroke();
    }

    // 4. PASS 1 PROBABLE THOUGHT MEDALLIONS (Teal #2ea6c4: Sunken Log Snag vs Wader Boot!)
    if ((st.view === "turkey" || (t >= 16.3 && t < 21.7)) && !snailForced) {
      var medAlpha = st.view === "turkey" ? 0.95 : smoothstep(16.3, 17.0, t);
      ctx.save();
      ctx.globalAlpha = medAlpha;
      // Left: Sunken branching creek snag
      drawThoughtMedallion(ctx, 352, 188, 56, "#2ea6c4", function (c) {
        c.strokeStyle = "#dff7fc";
        c.lineWidth = 2.4;
        c.beginPath();
        c.moveTo(-26, 20);
        c.lineTo(24, -10);
        c.moveTo(-4, 6);
        c.lineTo(-14, -18);
        c.moveTo(8, 0);
        c.lineTo(24, 14);
        c.stroke();
      });
      // Right: Fisherman's Rubber Wader Boot
      drawThoughtMedallion(ctx, 928, 188, 56, "#2ea6c4", function (c) {
        c.strokeStyle = "#dff7fc";
        c.lineWidth = 2.4;
        c.beginPath();
        c.moveTo(-12, -24);
        c.lineTo(6, -24);
        c.lineTo(6, 6);
        c.lineTo(22, 14);
        c.lineTo(20, 22);
        c.lineTo(-14, 22);
        c.closePath();
        c.stroke();
      });
      ctx.restore();
    }

    // 5. ACT 5A MAGNIFIED CHALK CHART INSET (41.2 – 44.5s) + ACT 5B POSTCARD SLIDE (44.5 – 45.8s)
    if (t >= 41.2 && t < 44.5) {
      var zoomU = Math.min(smoothstep(41.2, 41.6, t), 1 - smoothstep(44.1, 44.5, t));
      ctx.save();
      ctx.globalAlpha = zoomU;
      drawChalkChartBox(ctx, 392, 316, 496, 118, chartProgress, chartStar, t < 44.15, showCaptions);
      if (t >= 41.6 && t < 43.9) {
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

    if (t >= 44.5 && t < 45.75) {
      var cardSlide = easeInOutCubic(invLerp(44.65, 45.65, t));
      var cardX = lerp(465, pCX - 102, cardSlide);
      var cardY = lerp(372, pCY + 112, cardSlide);
      var cardSc = lerp(2.1, 0.95, cardSlide);
      ctx.save();
      ctx.translate(cardX, cardY);
      ctx.scale(cardSc, cardSc);
      drawPostcardMini(ctx, 0, 0, 42, 28, rolledFace);
      ctx.restore();
    }

    // =====================================================================
    // 6. ARTICULATED MAIL SNAIL CHOREOGRAPHY ACROSS ALL COCKPIT ACTS!
    // =====================================================================
    if (!snailDisabled) {
      var arcP0 = [pCX - 128, pCY + 104];
      var arcP1 = [pCX - 6,   pCY + 38];
      var arcP2 = [pCX + 126, pCY + 44];

      if (snailForced || st.view === "turkey") {
        var uMan = manualSnailU !== null ? manualSnailU : 0.54;
        drawSnailSilverTrail(ctx, arcP0, arcP1, arcP2, uMan, t, 10);
        var mPt = quadBezierPt(arcP0, arcP1, arcP2, uMan);
        var mAng = quadBezierAngle(arcP0, arcP1, arcP2, uMan);
        drawMailSnail(ctx, {
          x: mPt[0],
          y: mPt[1],
          scale: 1.15,
          dir: 1,
          tilt: mAng * 0.45,
          t: t,
          hasEnvelope: true,
          replyPostmark: uMan > 0.65 || manualRoll > 0,
          alienPostmark: uMan > 0.85 || manualRoll > 0,
          pips: manualRoll,
          glint: 0.65,
          salute: 0.3
        });
      } else if (t < 17.65) {
        var slotSalute = (t >= 6.2 && t < 7.9)
          ? Math.sin(invLerp(6.2, 7.9, t) * Math.PI)
          : ((t >= 16.9 && t < 17.65) ? 0.6 : 0);
        var slotGlint = (t >= 6.5 && t < 7.6) || (t >= 17.2 && t < 17.65) ? 0.85 : 0;
        drawMailSnail(ctx, {
          x: pCX - 138,
          y: pCY + 118,
          scale: 0.86,
          dir: 1,
          tilt: -0.14,
          t: t,
          hasEnvelope: t < 8.0 || t >= 17.25,
          glint: slotGlint,
          salute: slotSalute,
          lookX: t < 8.0 ? -0.6 : 0.8,
          lookY: -0.2
        });
      } else if (t >= 17.65 && t < 21.8) {
        // PASS 1 SNAIL MAIL CROSSING: Turkey -> Brook across chipped glass!
        var uAct3 = easeInOutCubic(invLerp(17.65, 20.75, t));
        drawSnailSilverTrail(ctx, arcP0, arcP1, arcP2, uAct3, t, 10.5);
        var p3 = quadBezierPt(arcP0, arcP1, arcP2, uAct3);
        var a3 = quadBezierAngle(arcP0, arcP1, arcP2, uAct3);
        drawMailSnail(ctx, {
          x: p3[0],
          y: p3[1],
          scale: 1.16,
          dir: 1,
          tilt: a3 * 0.45,
          t: t,
          hasEnvelope: true,
          glint: uAct3 > 0.82 ? 0.8 : 0.25,
          salute: uAct3 > 0.85 ? 0.45 : 0.15,
          lookX: 0.9,
          lookY: -0.05
        });
      } else if (t >= 31.6 && t < 41.2) {
        // ACT 4 RETURN FROM ALIEN LISTENING POST (12:00 -> 5:00) WITH TRIPLE-STAMPED ENVELOPE!
        var retP0 = [pCX + 18,  pCY - 132]; // top rim return from Alien Pod!
        var retP1 = [pCX + 126, pCY + 24];
        var retP2 = [pCX + 58,  pCY + 114];
        var uRet = easeInOutCubic(invLerp(31.6, 34.4, t));
        drawSnailSilverTrail(ctx, retP0, retP1, retP2, uRet, t, 9.5);
        var p4 = quadBezierPt(retP0, retP1, retP2, uRet);
        var gotRoll = t >= 37.25 || manualRoll > 0;
        var rollFlash = (t >= 37.25 && t < 38.4) ? Math.sin(invLerp(37.25, 38.4, t) * Math.PI) : 0;
        drawMailSnail(ctx, {
          x: p4[0],
          y: p4[1],
          scale: 1.05,
          dir: t < 37.8 ? -1 : 1,
          tilt: 0.05,
          t: t,
          hasEnvelope: true,
          replyPostmark: true,
          alienPostmark: true,
          pips: gotRoll ? rolledFace : 0,
          glint: rollFlash,
          salute: (t >= 37.3 && t < 38.5) || (t >= 39.2 && t < 40.6) ? 0.65 : 0.15,
          lookX: t < 37.8 ? -0.7 : 0.7,
          lookY: -0.25
        });
      } else if (t >= 41.2 && t < 44.5) {
        drawMailSnail(ctx, {
          x: 856,
          y: 306,
          scale: 0.92,
          dir: -1,
          tilt: 0,
          t: t,
          hasEnvelope: true,
          replyPostmark: true,
          alienPostmark: true,
          pips: rolledFace,
          salute: chartStar > 0.2 ? 0.55 : 0.1,
          lookX: -0.8,
          lookY: 0.35
        });
      } else if (t >= 44.5) {
        var memP0 = [pCX - 98, pCY + 104];
        var memP1 = [pCX + 4,  pCY + 88];
        var memP2 = [pCX + 98, pCY + 86];
        var uMem = easeInOutCubic(invLerp(45.65, 51.4, t));
        drawSnailSilverTrail(ctx, memP0, memP1, memP2, uMem, t, 9.5);
        var p5 = quadBezierPt(memP0, memP1, memP2, uMem);
        var a5 = quadBezierAngle(memP0, memP1, memP2, uMem);
        var salute5 = (t >= 45.8 && t < 47.0) ? Math.sin(invLerp(45.8, 47.0, t) * Math.PI) : (t >= 47.8 ? 0.35 : 0);
        drawMailSnail(ctx, {
          x: p5[0],
          y: p5[1],
          scale: 1.06,
          dir: 1,
          tilt: a5 * 0.35,
          t: t,
          hasEnvelope: t >= 45.6,
          showPortSketch: true,
          replyPostmark: true,
          alienPostmark: true,
          pips: rolledFace,
          glint: (t >= 45.6 && t < 46.5) ? 0.9 : 0,
          salute: salute5,
          lookX: 0.85,
          lookY: -0.2
        });
      }
    }

    // =====================================================================
    // 7. TURKEY PILOT IN FOREGROUND SEAT + ARTICULATED WING CHOREOGRAPHY
    // =====================================================================
    var lookX = 0.65, lookY = -0.1, headTilt = 0, beakOpen = 0;
    if (t >= 4.7 && t < 6.4) {
      lookX = 0.92; lookY = -0.15;
      beakOpen = 0.38 + 0.34 * Math.max(0, Math.sin(t * 7.2));
      headTilt = -0.08;
    } else if (t >= 6.4 && t < 8.0) {
      lookX = 0.88; lookY = 0.32; headTilt = 0.1;
    } else if (t >= 8.2 && t < 9.4) {
      lookX = -0.35; lookY = 0.55; headTilt = 0.14;
    } else if (t >= 9.4 && t < 10.3) {
      lookX = 0.95; lookY = 0.45;
    } else if (t >= 11.6 && t < 12.4) {
      beakOpen = 0.45; headTilt = -0.12;
    } else if (t >= 16.5 && t < 20.8) {
      lookX = 0.9;
      lookY = t >= 17.6 ? 0.18 : -0.05;
      headTilt = 0.12 * Math.sin(t * 2.2);
    } else if (t >= 34.8 && t < 37.8) {
      lookX = 0.75; lookY = 0.35; headTilt = 0.1;
    } else if (t >= 47.8) {
      headTilt = -0.08; beakOpen = 0.25;
    }

    var blink = ((t * 10) % 37 < 1.2) ? 0.92 : 0;

    var scootRight = 0;
    if (t >= 9.3 && t < 10.9) {
      scootRight = Math.min(smoothstep(9.3, 9.75, t), 1 - smoothstep(10.45, 10.9, t)) * 590;
    } else if (t >= 16.65 && t < 17.85) {
      scootRight = Math.min(smoothstep(16.65, 17.05, t), 1 - smoothstep(17.45, 17.85, t)) * 135;
    } else if (t >= 41.2 && t < 44.45) {
      scootRight = Math.min(smoothstep(41.2, 41.65, t), 1 - smoothstep(44.0, 44.45, t)) * 340;
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

    if (t >= 6.35 && t < 7.85) {
      var uPt = smoothstep(6.35, 6.85, t);
      drawTurkeyWingArm(ctx, turkX + 18, turkY + 48, lerp(turkX + 70, 442, uPt), lerp(360, 344, uPt), 1, 0.18);
    } else if (t >= 8.15 && t < 9.3) {
      var uSnap = invLerp(8.25, 9.1, t);
      var wx = lerp(285, 154, easeInOutCubic(uSnap));
      var wy = lerp(455, 456, uSnap) - Math.sin(uSnap * Math.PI) * 58;
      drawTurkeyWingArm(ctx, turkX + 10, turkY + 48, wx, wy, 1, 0.14, function (c) {
        if (t < 9.1) drawLampModuleProp(c, 22, 0, 0.85, false);
      });
    } else if (t >= 9.3 && t < 10.5) {
      var uTog = Math.min(easeInOutCubic(invLerp(9.45, 9.95, t)), 1 - smoothstep(10.18, 10.48, t));
      drawTurkeyWingArm(ctx, turkX + 26, turkY + 46, lerp(turkX + 95, 1054, uTog), lerp(416, 454, uTog), 1, 0.16);
    } else if (t >= 12.4 && t < 14.2) {
      var uBal = invLerp(12.85, 13.6, t);
      var bx = lerp(285, 154, easeInOutCubic(uBal));
      var by = 456 - Math.sin(clamp(uBal, 0, 1) * Math.PI) * 52;
      drawTurkeyWingArm(ctx, turkX + 10, turkY + 48, bx, by, 1, 0.14, function (c) {
        if (t >= 12.85 && t < 13.6) drawBallastModuleProp(c, 24, 0, 0.85, 0);
      });
    } else if (t >= 16.65 && t < 17.75) {
      // Pass 1 Snail Mail Handoff
      var uFeed = easeInOutCubic(invLerp(16.7, 17.45, t));
      var fx = lerp(turkX + 68, pCX - 156, uFeed);
      var fy = lerp(338, pCY + 118, uFeed);
      drawTurkeyWingArm(ctx, turkX + 18, turkY + 48, fx, fy, 1, 0.16, function (c) {
        if (t < 17.35) {
          drawStampedEnvelope(c, 26, 0, 30, 20, { glint: 0.4 });
        }
      });
    } else if (t >= 17.75 && t < 20.8) {
      drawTurkeyWingArm(ctx, turkX + 18, turkY + 52, turkX + 54, 286 + Math.sin(t * 3) * 4, 1, 0.22);
    } else if (t >= 34.7 && t < 35.45) {
      var shakeY = Math.sin(t * 28) * 14;
      drawTurkeyWingArm(ctx, turkX + 24, turkY + 48, 412, 326 + shakeY, 1, 0.24);
    } else if (t >= 41.4 && t < 44.2) {
      var cxTip = t < 43.8 ? lerp(450, 830, chartProgress) : 832;
      var cyTip = t < 43.8 ? (382 + Math.sin(chartProgress * Math.PI * 2.1) * -16) : 356;
      drawTurkeyWingArm(ctx, turkX + 24, turkY + 48, cxTip - 18, cyTip + 6, 1, 0.12, function (c) {
        c.fillStyle = "#fffdf5";
        c.strokeStyle = "#2b2822";
        c.lineWidth = 1.5;
        roundRectPath(c, 16, -4, 24, 8, 2);
        c.fill();
        c.stroke();
      });
    } else if (t >= 44.5 && t < 45.5) {
      var uPost = easeInOutCubic(invLerp(44.55, 45.35, t));
      drawTurkeyWingArm(ctx, turkX + 24, turkY + 48, lerp(418, 468, uPost), lerp(374, 344, uPost), 1, 0.18);
    } else if (t >= 47.8) {
      var salU = smoothstep(47.8, 48.3, t);
      drawTurkeyWingArm(ctx, turkX + 18, turkY + 54, lerp(turkX + 76, turkX + 68, salU), lerp(388, 272, salU), 1, 0.22);
    }

    // 8. ACT 4 TUMBLING 3D-PROJECTED 1D6 DIE (34.8 – 41.0s or manualRoll > 0!)
    if ((t >= 34.8 && t < 41.0) || manualRoll > 0) {
      var dieGoal = targetEulerForFace(rolledFace);
      var dieX = 640, dieY = 338, dieScale = 44;
      var rx = dieGoal[0], ry = dieGoal[1], rz = dieGoal[2];
      var settled = true;

      if (t >= 34.8 && t < 37.35 && !manualRoll) {
        settled = false;
        var dt = invLerp(35.0, 37.3, t);
        dieX = lerp(485, 640, easeInOutCubic(dt));
        var bounce = Math.abs(Math.sin(dt * Math.PI * 3.5)) * Math.pow(1 - dt, 1.55) * 125;
        dieY = 344 - bounce;
        var spinFade = Math.pow(1 - dt, 1.85);
        rx = dieGoal[0] + spinFade * 14.5;
        ry = dieGoal[1] + spinFade * 18.2;
        rz = dieGoal[2] + spinFade * 9.4;
      } else if (t >= 38.4 || manualRoll > 0) {
        var parkU = manualRoll > 0 ? 1 : smoothstep(38.4, 39.0, t);
        dieX = lerp(640, 468, parkU);
        dieY = lerp(344, 366, parkU);
        dieScale = lerp(44, 30, parkU);
      }

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
    title: "Turkey Sub · SCION Setup A Three-Pass Snail Mail Introduction",
    canonRule: "The Trout, Turkey, and Alien Listening Post communicate through Snail Mail.",
    duration: 52.0,
    fps: 24,
    frames: 1248,
    defaultTool: "lamp",
    passes: [
      { pass: 1, tier: "Probable", faces: [1, 2], color: "#1d596e", author: "Turkey Looks Out" },
      { pass: 2, tier: "Plausible", faces: [3, 4], color: "#2d6846", author: "Trout Looks In (via Snail Mail)" },
      { pass: 3, tier: "Preposterous / Out of Bounds", faces: [5, 6], color: "#9e3d1c", author: "Alien Listening Post (Dear Alien, via Snail Mail)" }
    ],
    acts: [
      { act: 1, start: 0, end: 8, scions: ["episode-town", "episode-cockpit"], title: "Sealed Bread-Tin Glass & Why They Need Snail Mail" },
      { act: 2, start: 8, end: 15.6, scions: ["episode-works"], title: "The Works Construction Kit: Lamp vs. Ballast" },
      { act: 3, start: 15.6, end: 31.6, scions: ["duck-rabbit", "snail-mail", "alien-listening-post"], title: "Three-Pass Snail Mail Chain: Turkey (1–2) -> Trout (3–4) -> Alien (5–6)" },
      { act: 4, start: 31.6, end: 41.2, scions: ["episode-die", "snail-mail"], title: "All Six Faces Armed & Pilot Rolls 1d6 Once" },
      { act: 5, start: 41.2, end: 52, scions: ["episode-crossing", "episode-memory", "snail-mail"], title: "Chalk Chart, Snail Mail Clue to Next Pilot & Landing Bell" }
    ],
    render: renderIntro
  };
})();
