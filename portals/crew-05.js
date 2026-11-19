/* ============================================================================
 * Trout Sub · PAELEO / Oulipo + Video-to-Game Portal Scenes — Crew 05 (#21–#25)
 * Handmade 2D Canvas multiplane & articulated cutout rigs (zero static JPG zoom).
 * Works deterministically in headless Puppeteer/Playwright (24fps, 0..10s) AND
 * interactively at 60fps in the browser via optional `state` overrides.
 * ============================================================================ */
(function () {
  "use strict";

  window.PORTAL_SCENES = window.PORTAL_SCENES || {};

  // ---------- Math & Easing Helpers ----------
  var TAU = Math.PI * 2;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function invLerp(a, b, v) { return a === b ? 0 : clamp((v - a) / (b - a), 0, 1); }
  function smoothstep(a, b, v) {
    var u = invLerp(a, b, v);
    return u * u * (3 - 2 * u);
  }
  function easeOutBack(u) {
    u = clamp(u, 0, 1);
    var c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
  }
  function hash01(n) {
    var s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  // ---------- Cached Procedural Grain Patterns ----------
  var _tinPat = null;
  var _paperPat = null;
  function ensurePatterns(ctx) {
    if (_tinPat && _paperPat) return;
    try {
      var c1 = document.createElement("canvas");
      c1.width = 96; c1.height = 96;
      var g1 = c1.getContext("2d");
      g1.fillStyle = "#132427";
      g1.fillRect(0, 0, 96, 96);
      for (var i = 0; i < 220; i++) {
        var x = Math.floor(hash01(i * 3.1) * 96);
        var y = Math.floor(hash01(i * 7.3) * 96);
        var w = 4 + Math.floor(hash01(i * 11.7) * 18);
        g1.fillStyle = (i % 2 === 0) ? "rgba(255,248,230,0.022)" : "rgba(0,0,0,0.045)";
        g1.fillRect(x, y, w, 1);
      }
      _tinPat = ctx.createPattern(c1, "repeat");

      var c2 = document.createElement("canvas");
      c2.width = 80; c2.height = 80;
      var g2 = c2.getContext("2d");
      g2.fillStyle = "#faf8f3";
      g2.fillRect(0, 0, 80, 80);
      for (var j = 0; j < 180; j++) {
        var px = Math.floor(hash01(j * 5.9 + 1) * 80);
        var py = Math.floor(hash01(j * 9.1 + 2) * 80);
        g2.fillStyle = (j % 2 === 0) ? "rgba(140,120,90,0.035)" : "rgba(255,255,255,0.35)";
        g2.fillRect(px, py, 2, 2);
      }
      _paperPat = ctx.createPattern(c2, "repeat");
    } catch (e) {
      _tinPat = null;
      _paperPat = null;
    }
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

  // ---------- Derive Deterministic + Interactive State ----------
  var DEFAULT_ROLLS = { 21: 2, 22: 4, 23: 6, 24: 3, 25: 5 };

  function resolveSceneState(meta, tRaw, state) {
    var t = (typeof tRaw === "number" && isFinite(tRaw)) ? Math.max(0, tRaw) : 0;
    // Keep exact [0, 10.0] for film render; wrap cleanly if browser play runs past 10s
    var tl = (t <= 10.0001) ? t : (t % 10.0);
    var st = state || {};

    var showCaptions = (typeof st.showCaptions === "boolean") ? st.showCaptions : true;

    // View mode: "setup" (Act 1), "turkey" (Act 2), "trout" (Act 3)
    var viewMode = "turkey";
    var act = 2;
    if (st.view === "turkey") {
      viewMode = "turkey";
      act = 2;
    } else if (st.view === "trout") {
      viewMode = "trout";
      act = 3;
    } else {
      if (tl < 2.0) { viewMode = "setup"; act = 1; }
      else if (tl < 5.6) { viewMode = "turkey"; act = 2; }
      else { viewMode = "trout"; act = 3; }
    }

    // Lamp & Ballast states
    var autoToolOn = smoothstep(0.92, 1.06, tl);
    var lampVal, ballastVal;
    if (typeof st.lamp === "boolean") {
      lampVal = st.lamp ? 1 : 0;
    } else {
      lampVal = (meta.defaultTool === "lamp") ? autoToolOn : 0;
    }
    if (typeof st.ballast === "boolean") {
      ballastVal = st.ballast ? 1 : 0;
    } else {
      ballastVal = (meta.defaultTool === "ballast") ? autoToolOn : 0;
    }

    // Active illumination/clarity boost when either default tool or lamp is engaged
    var clarity = clamp(0.22 + 0.78 * Math.max(lampVal, ballastVal * 0.92, (st.view === "turkey" || st.view === "trout") ? 0.85 : 0), 0, 1);

    // Rolled 1d6 bolt
    var roll = 0;
    if (typeof st.roll === "number" && st.roll >= 1 && st.roll <= 6) {
      roll = Math.round(st.roll);
    } else if (act === 3 && tl >= 6.15) {
      roll = DEFAULT_ROLLS[meta.id] || 2;
    } else if (st.view === "trout") {
      roll = DEFAULT_ROLLS[meta.id] || 2;
    }

    // Cut flash at t = 5.6s in auto mode
    var cutRipple = (!st.view || st.view === "auto") ? Math.exp(-Math.pow((tl - 5.6) / 0.22, 2)) : 0;

    return {
      t: t,
      tl: tl,
      act: act,
      viewMode: viewMode,
      lamp: lampVal,
      ballast: ballastVal,
      clarity: clarity,
      roll: roll,
      cutRipple: cutRipple,
      showCaptions: showCaptions
    };
  }

  // ---------- Shared Underwater Multiplane Helpers ----------
  function drawWaterBackdrop(ctx, cx, cy, r, s, opts) {
    opts = opts || {};
    var isTrout = (s.viewMode === "trout");
    var topCol = isTrout ? (opts.troutTop || "#288b92") : lerpColor("#0e2830", opts.top || "#247d7a", s.clarity);
    var botCol = isTrout ? (opts.troutBot || "#0e3c47") : lerpColor("#071519", opts.bot || "#103a40", s.clarity);

    var g = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
    g.addColorStop(0, topCol);
    g.addColorStop(0.58, isTrout ? "#1b6570" : lerpColor("#0b2026", opts.mid || "#1a5b5f", s.clarity));
    g.addColorStop(1, botCol);
    ctx.fillStyle = g;
    ctx.fillRect(cx - r - 10, cy - r - 10, r * 2 + 20, r * 2 + 20);

    // Heinz Edelmann / PAELEO caustic surface ribbons
    ctx.save();
    var waveShift = s.ballast * 18;
    for (var i = 0; i < 5; i++) {
      var wy = cy - r + 26 + i * 16 + waveShift * 0.4;
      var amp = 4 + (1 - s.ballast) * 3;
      ctx.beginPath();
      for (var x = cx - r; x <= cx + r; x += 16) {
        var ph = (x * 0.025) + s.t * (1.5 + i * 0.25) + i * 1.4;
        var y = wy + Math.sin(ph) * amp;
        if (x === cx - r) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(195, 248, 240, " + (0.08 + 0.14 * s.clarity - i * 0.018).toFixed(3) + ")";
      ctx.lineWidth = 3 - i * 0.35;
      ctx.stroke();
    }

    // Diagonal sunbeam / caustic shafts
    for (var k = 0; k < 3; k++) {
      var bx = cx - 95 + k * 92 + Math.sin(s.t * 0.7 + k * 2.1) * 14;
      var cg = ctx.createLinearGradient(bx, cy - r, bx + 40, cy + r);
      cg.addColorStop(0, "rgba(185, 250, 238, " + (0.14 * s.clarity).toFixed(3) + ")");
      cg.addColorStop(1, "rgba(185, 250, 238, 0)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.moveTo(bx - 18, cy - r);
      ctx.lineTo(bx + 22, cy - r);
      ctx.lineTo(bx + 68, cy + r);
      ctx.lineTo(bx + 4, cy + r);
      ctx.closePath();
      ctx.fill();
    }

    // Fast-water drift streaks when defaultTool==="ballast" and ballast is NOT yet engaged
    if (opts.currentStreaks) {
      var streakAlpha = clamp((1 - s.ballast) * 0.55, 0.04, 0.55);
      ctx.strokeStyle = "rgba(190, 235, 230, " + streakAlpha.toFixed(3) + ")";
      ctx.lineWidth = 2;
      var speed = lerp(260, 48, s.ballast);
      for (var m = 0; m < 12; m++) {
        var sx = ((hash01(m * 9.3) * 420 + s.t * speed) % 420) - 210 + cx;
        var sy = cy - 145 + m * 25 + Math.sin(s.t * 3 + m) * 4;
        var len = lerp(46, 12, s.ballast);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + len, sy);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function lerpColor(hex1, hex2, u) {
    u = clamp(u, 0, 1);
    var r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
    var r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
    var r = Math.round(lerp(r1, r2, u)), g = Math.round(lerp(g1, g2, u)), b = Math.round(lerp(b1, b2, u));
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function drawBubbles(ctx, cx, cy, t, seed, count, spreadX, baseR) {
    ctx.save();
    for (var i = 0; i < count; i++) {
      var h = hash01(seed * 31 + i * 7.7);
      var speed = 28 + h * 34;
      var ySpan = 310;
      var by = cy + 140 - ((t * speed + h * ySpan) % ySpan);
      var bx = cx + (hash01(seed * 13 + i * 4.3) - 0.5) * spreadX + Math.sin(t * 2.6 + i * 1.7) * 7;
      var br = (baseR || 3.2) + (i % 3) * 1.6;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.fillStyle = "rgba(220, 252, 250, 0.34)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bx - br * 0.32, by - br * 0.32, br * 0.26, 0, TAU);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCreekBedAndKelp(ctx, cx, cy, t, ballastShift, kelps) {
    ctx.save();
    ctx.translate(0, ballastShift);
    // Layered gravel/stone bed
    ctx.beginPath();
    ctx.moveTo(cx - 210, cy + 125);
    ctx.bezierCurveTo(cx - 120, cy + 104, cx - 20, cy + 122, cx + 60, cy + 112);
    ctx.bezierCurveTo(cx + 130, cy + 102, cx + 175, cy + 116, cx + 210, cy + 118);
    ctx.lineTo(cx + 210, cy + 220);
    ctx.lineTo(cx - 210, cy + 220);
    ctx.closePath();
    ctx.fillStyle = "#35665c";
    ctx.fill();
    ctx.strokeStyle = "#142423";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Left & right mossy boulders (foreground shelter lip rises into view when ballast is ON!)
    var rocks = [
      { x: cx - 155, y: cy + 118, rx: 58, ry: 28, c: "#437768" },
      { x: cx - 135, y: cy + 145, rx: 68, ry: 30, c: "#345e53" },
      { x: cx + 142, y: cy + 136, rx: 62, ry: 28, c: "#3b6b5e" }
    ];
    for (var r = 0; r < rocks.length; r++) {
      var rk = rocks[r];
      ctx.beginPath();
      ctx.ellipse(rk.x, rk.y, rk.rx, rk.ry, (r === 2 ? -0.12 : 0.1), 0, TAU);
      ctx.fillStyle = rk.c;
      ctx.fill();
      ctx.strokeStyle = "#132220";
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }

    // Scattered creek pebbles
    for (var p = 0; p < 14; p++) {
      var px = cx - 125 + p * 19 + (p % 2) * 5;
      var py = cy + 136 + (p % 3) * 12;
      ctx.beginPath();
      ctx.ellipse(px, py, 7 + (p % 3) * 3, 4 + (p % 2) * 2, 0.1, 0, TAU);
      ctx.fillStyle = (p % 2 === 0) ? "#5e8777" : "#446a5d";
      ctx.fill();
      ctx.strokeStyle = "#162624";
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // Swaying kelp fronds
    var kList = kelps || [-152, -138, 128, 145];
    for (var k = 0; k < kList.length; k++) {
      var kx = cx + kList[k];
      var ky = cy + 148;
      var h = 76 + (k % 2) * 24;
      var sway = Math.sin(t * 2.1 + k * 1.3) * 11;
      ctx.beginPath();
      ctx.moveTo(kx, ky);
      ctx.quadraticCurveTo(kx + sway * 0.5 - 8, ky - h * 0.5, kx + sway, ky - h);
      ctx.quadraticCurveTo(kx + sway * 0.5 + 9, ky - h * 0.48, kx + 6, ky);
      ctx.closePath();
      ctx.fillStyle = (k % 2 === 0) ? "#3f7d63" : "#519474";
      ctx.fill();
      ctx.strokeStyle = "#142620";
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---------- Handmade Articulated Spotted Brook Trout Rig ----------
  // Supports horizontal swimming OR upright standing/squatting/walking!
  function drawArticulatedTrout(ctx, opts) {
    var x = opts.x || 0, y = opts.y || 0;
    var scale = opts.scale || 1;
    var flipX = opts.flipX ? -1 : 1; // +1 faces right, -1 faces left
    var rot = opts.rot || 0;
    var jaw = clamp(opts.jaw || 0, 0, 0.65);
    var tailWag = opts.tailWag || 0;
    var bodyBend = opts.bodyBend || 0;
    var armAngle = (opts.armAngle !== undefined) ? opts.armAngle : 0.35;
    var upright = !!opts.upright;
    var squat = opts.squat || 0; // 0..1 knee bend for upright rigs
    var walk = opts.walk || 0;   // -1..1 stride phase for upright walking
    var headOnly = !!opts.headOnly;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(flipX * scale, scale);

    if (headOnly) {
      // Giant collage-scale trout bust/torso (for #21 bus seats!)
      ctx.beginPath();
      ctx.moveTo(-26, 46);
      ctx.bezierCurveTo(-30, 12, -22, -24, 4, -34);
      ctx.bezierCurveTo(22, -40, 38, -32, 44, -20);
      // Upper snout to mouth corner
      ctx.lineTo(24, -12);
      // Articulated lower jaw
      var jx = 24 + Math.cos(0.18 + jaw) * 19;
      var jy = -12 + Math.sin(0.18 + jaw) * 19;
      ctx.lineTo(jx, jy);
      ctx.bezierCurveTo(28, jy + 10, 16, 16, 16, 46);
      ctx.closePath();

      var hg = ctx.createLinearGradient(-24, -36, 26, 36);
      hg.addColorStop(0, "#567547");
      hg.addColorStop(0.48, "#94a86c");
      hg.addColorStop(0.72, "#e59a7e");
      hg.addColorStop(1, "#f2ebd8");
      ctx.fillStyle = hg;
      ctx.fill();
      ctx.strokeStyle = "#16201d";
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // Dorsal fin peek on back
      ctx.beginPath();
      ctx.moveTo(-24, -2);
      ctx.lineTo(-36, -12);
      ctx.lineTo(-27, 20);
      ctx.closePath();
      ctx.fillStyle = "#6c8758";
      ctx.fill();
      ctx.stroke();

      // Gill arch & rosy cheek
      ctx.beginPath();
      ctx.arc(8, -14, 11, 0.55 * Math.PI, 1.38 * Math.PI);
      ctx.strokeStyle = "#202e28";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Brook trout spots
      var spotsH = [[-14, -14], [-8, -4], [-16, 8], [-6, 18], [-15, 26], [0, -24], [-10, -24]];
      for (var sh = 0; sh < spotsH.length; sh++) {
        ctx.beginPath();
        ctx.arc(spotsH[sh][0], spotsH[sh][1], (sh % 3 === 0) ? 2.1 : 1.5, 0, TAU);
        ctx.fillStyle = (sh % 3 === 0) ? "#c84632" : "#223026";
        ctx.fill();
      }

      // Expressive eye
      ctx.beginPath();
      ctx.arc(21, -24, 5.2, 0, TAU);
      ctx.fillStyle = "#faf6e8";
      ctx.fill();
      ctx.strokeStyle = "#16201d";
      ctx.lineWidth = 1.7;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(22.5 + (opts.lookX || 0), -24 + (opts.lookY || 0), 2.6, 0, TAU);
      ctx.fillStyle = "#111817";
      ctx.fill();

      // Articulated pectoral fin-hand
      ctx.save();
      ctx.translate(-2, 12);
      ctx.rotate(armAngle);
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.bezierCurveTo(14, -8, 28, -4, 30, 3);
      ctx.bezierCurveTo(28, 9, 12, 10, 0, 5);
      ctx.closePath();
      ctx.fillStyle = "#c98b5b";
      ctx.fill();
      ctx.strokeStyle = "#16201d";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      ctx.restore();
      return;
    }

    if (upright) {
      // Upright character rig (for #22 squatters & #25 walking Diner Trout!)
      var hipY = 26 + squat * 16;
      // Two articulated fin-legs with planted/walking or squatting knees!
      for (var leg = 0; leg < 2; leg++) {
        var isBack = (leg === 0);
        var stride = isBack ? -walk : walk;
        var hipX = isBack ? -6 : 6;
        var kneeX = hipX + 18 + squat * 12 + stride * 12;
        var kneeY = hipY + 14 - squat * 4;
        var footX = hipX + 6 + stride * 20;
        var footY = 64;

        ctx.beginPath();
        ctx.moveTo(hipX - 5, hipY - 2);
        ctx.lineTo(kneeX + 5, kneeY);
        ctx.lineTo(footX + 14, footY);
        ctx.lineTo(footX - 8, footY + 3);
        ctx.lineTo(kneeX - 5, kneeY + 4);
        ctx.lineTo(hipX - 8, hipY + 6);
        ctx.closePath();
        ctx.fillStyle = isBack ? "#7c915d" : "#9eb376";
        ctx.fill();
        ctx.strokeStyle = "#16201d";
        ctx.lineWidth = 2.1;
        ctx.stroke();
      }

      // Tail balance behind hips
      ctx.save();
      ctx.translate(-12, hipY + 4);
      ctx.rotate(tailWag * 0.35);
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(-26, -18);
      ctx.lineTo(-20, 0);
      ctx.lineTo(-28, 16);
      ctx.lineTo(2, 8);
      ctx.closePath();
      ctx.fillStyle = "#839864";
      ctx.fill();
      ctx.strokeStyle = "#16201d";
      ctx.lineWidth = 2.1;
      ctx.stroke();
      ctx.restore();

      // Upright torso + head
      var headDip = squat * 10;
      ctx.beginPath();
      ctx.moveTo(-16, hipY + 4);
      ctx.bezierCurveTo(-24, 4 + headDip, -20, -28 + headDip, 2, -40 + headDip);
      ctx.bezierCurveTo(18, -48 + headDip, 34, -38 + headDip, 38, -26 + headDip);
      ctx.lineTo(19, -18 + headDip);
      var ujx = 19 + Math.cos(0.2 + jaw) * 17;
      var ujy = -18 + headDip + Math.sin(0.2 + jaw) * 17;
      ctx.lineTo(ujx, ujy);
      ctx.bezierCurveTo(22, 6 + headDip, 20, hipY - 4, 12, hipY + 6);
      ctx.closePath();

      var ug = ctx.createLinearGradient(-20, -40, 22, hipY);
      ug.addColorStop(0, "#5c7c4c");
      ug.addColorStop(0.5, "#9bb073");
      ug.addColorStop(0.76, "#e8a489");
      ug.addColorStop(1, "#f5efe0");
      ctx.fillStyle = ug;
      ctx.fill();
      ctx.strokeStyle = "#16201d";
      ctx.lineWidth = 2.3;
      ctx.stroke();

      // Dorsal ridge on back
      ctx.beginPath();
      ctx.moveTo(-20, -8 + headDip);
      ctx.lineTo(-32, 4 + headDip);
      ctx.lineTo(-19, 18 + headDip);
      ctx.closePath();
      ctx.fillStyle = "#6c8859";
      ctx.fill();
      ctx.stroke();

      // Spots
      var uSpots = [[-12, -20], [-6, -10], [-13, 0], [-8, 12], [0, -30], [-10, 20]];
      for (var us = 0; us < uSpots.length; us++) {
        ctx.beginPath();
        ctx.arc(uSpots[us][0], uSpots[us][1] + headDip, 1.8, 0, TAU);
        ctx.fillStyle = (us % 2 === 0) ? "#223026" : "#c94632";
        ctx.fill();
      }

      // Eye & gill
      ctx.beginPath();
      ctx.arc(6, -20 + headDip, 10, 0.58 * Math.PI, 1.35 * Math.PI);
      ctx.strokeStyle = "#1f2d27";
      ctx.lineWidth = 1.9;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(17, -30 + headDip, 4.8, 0, TAU);
      ctx.fillStyle = "#faf6e8";
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(18.5 + (opts.lookX || 0), -30 + headDip + (opts.lookY || 0), 2.4, 0, TAU);
      ctx.fillStyle = "#111817";
      ctx.fill();

      // Optional vest (for #25 Diner Trout!)
      if (opts.vest) {
        ctx.beginPath();
        ctx.moveTo(-18, -10 + headDip);
        ctx.lineTo(18, -8 + headDip);
        ctx.lineTo(15, 22 + headDip * 0.4);
        ctx.lineTo(-16, 20 + headDip * 0.4);
        ctx.closePath();
        ctx.fillStyle = "#b88946";
        ctx.fill();
        ctx.strokeStyle = "#1c1a14";
        ctx.lineWidth = 2.2;
        ctx.stroke();
        // Collar ring & rivets
        ctx.beginPath();
        ctx.ellipse(0, -10 + headDip, 20, 5.5, 0.05, 0, TAU);
        ctx.fillStyle = "#cfa054";
        ctx.fill();
        ctx.stroke();
        for (var rv = -12; rv <= 12; rv += 8) {
          ctx.beginPath();
          ctx.arc(rv, -10 + headDip, 1.8, 0, TAU);
          ctx.fillStyle = "#4d3818";
          ctx.fill();
        }
        // Ribbed scuba hose on back
        ctx.beginPath();
        ctx.arc(-16, 4 + headDip * 0.6, 13, 0.55 * Math.PI, 1.45 * Math.PI);
        ctx.strokeStyle = "#5c6968";
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.strokeStyle = "#1b2424";
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      // Articulated pectoral arm
      ctx.save();
      ctx.translate(2, 2 + headDip * 0.8);
      ctx.rotate(armAngle);
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.bezierCurveTo(15, -8, 30, -4, 33, 2);
      ctx.bezierCurveTo(29, 8, 13, 9, 0, 5);
      ctx.closePath();
      ctx.fillStyle = "#d19362";
      ctx.fill();
      ctx.strokeStyle = "#16201d";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      ctx.restore();
      return;
    }

    // Horizontal swimming Brook Trout rig (articulated tail + dorsal + jaw + pectoral!)
    var tx = -62, ty = bodyBend * 12;
    // Caudal tail fin (wagging around peduncle)
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(tailWag);
    ctx.beginPath();
    ctx.moveTo(4, -5);
    ctx.lineTo(-24, -20);
    ctx.quadraticCurveTo(-17, 0, -24, 20);
    ctx.lineTo(4, 6);
    ctx.closePath();
    ctx.fillStyle = "#7c9460";
    ctx.fill();
    ctx.strokeStyle = "#16201d";
    ctx.lineWidth = 2.1;
    ctx.stroke();
    ctx.restore();

    // Dorsal & pelvic/anal fins
    ctx.beginPath();
    ctx.moveTo(-18, -17 + bodyBend * 3);
    ctx.lineTo(-6, -32 + bodyBend * 2);
    ctx.lineTo(10, -18);
    ctx.closePath();
    ctx.fillStyle = "#6c8755";
    ctx.fill();
    ctx.strokeStyle = "#16201d";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-26, 13 + bodyBend * 5);
    ctx.lineTo(-36, 25 + bodyBend * 6);
    ctx.lineTo(-14, 15 + bodyBend * 3);
    ctx.closePath();
    ctx.fillStyle = "#d48d68";
    ctx.fill();
    ctx.stroke();

    // Streamlined body + articulated jaw
    ctx.beginPath();
    ctx.moveTo(tx, ty - 6);
    ctx.bezierCurveTo(-30, -22 + bodyBend * 4, 18, -24, 52, -8);
    ctx.lineTo(34, -1);
    var hjx = 34 + Math.cos(0.15 + jaw) * 17;
    var hjy = -1 + Math.sin(0.15 + jaw) * 17;
    ctx.lineTo(hjx, hjy);
    ctx.bezierCurveTo(18, 22, -28, 20 + bodyBend * 5, tx, ty + 6);
    ctx.closePath();

    var bg = ctx.createLinearGradient(0, -22, 0, 22);
    bg.addColorStop(0, "#4f6e44");
    bg.addColorStop(0.45, "#90a76a");
    bg.addColorStop(0.68, "#e69779");
    bg.addColorStop(1, "#f5efe0");
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = "#16201d";
    ctx.lineWidth = 2.3;
    ctx.stroke();

    // Spots along flank
    var spts = [[-42, -2], [-30, -7], [-20, -2], [-10, -9], [2, -5], [14, -9], [-24, 5], [-8, 3], [8, 2]];
    for (var sp = 0; sp < spts.length; sp++) {
      ctx.beginPath();
      ctx.arc(spts[sp][0], spts[sp][1] + bodyBend * (spts[sp][0] < -15 ? 4 : 1), (sp % 3 === 0) ? 2.1 : 1.5, 0, TAU);
      ctx.fillStyle = (sp % 3 === 0) ? "#cc4330" : "#213025";
      ctx.fill();
    }

    // Gill & eye
    ctx.beginPath();
    ctx.arc(21, -2, 11, 0.65 * Math.PI, 1.35 * Math.PI);
    ctx.strokeStyle = "#1f2e28";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(36, -8, 4.8, 0, TAU);
    ctx.fillStyle = "#faf6e8";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(37.4 + (opts.lookX || 0), -8 + (opts.lookY || 0), 2.4, 0, TAU);
    ctx.fillStyle = "#111817";
    ctx.fill();

    // Articulated pectoral fin/arm
    ctx.save();
    ctx.translate(14, 9);
    ctx.rotate(armAngle);
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.bezierCurveTo(12, -7, 25, -3, 27, 3);
    ctx.bezierCurveTo(22, 8, 10, 8, 0, 4);
    ctx.closePath();
    ctx.fillStyle = "#d99466";
    ctx.fill();
    ctx.strokeStyle = "#16201d";
    ctx.lineWidth = 1.9;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // Subtle reflection / inner-hull view of Turkey & Bread-Tin Sub across the glass!
  function drawSubGlassPresence(ctx, cx, cy, s, opts) {
    opts = opts || {};
    ctx.save();
    if (s.viewMode !== "trout") {
      // Act 1 & 2: Subtle translucent ghost reflection of Turkey pilot in lower-left glass
      ctx.globalAlpha = 0.30 + 0.08 * s.lamp;
      var gx = cx - 108 + Math.sin(s.t * 1.4) * 2;
      var gy = cy + 98 + (opts.startled ? -5 : 0);
      // Warm feathered head & wattle reflection
      ctx.beginPath();
      ctx.arc(gx, gy, 32, 0, TAU);
      ctx.fillStyle = "#b57654";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(gx + 22, gy - 4);
      ctx.lineTo(gx + 44, gy + 3);
      ctx.lineTo(gx + 22, gy + 10);
      ctx.closePath();
      ctx.fillStyle = "#deb068";
      ctx.fill();
      // Red wattle
      ctx.beginPath();
      ctx.ellipse(gx + 22, gy + 16, 5, 11, 0.15, 0, TAU);
      ctx.fillStyle = "#c94c38";
      ctx.fill();
      // Curious eye
      ctx.beginPath();
      ctx.arc(gx + 8, gy - 5, 6.5, 0, TAU);
      ctx.fillStyle = "#f5ebd6";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(gx + 10, gy - 5, 3.2, 0, TAU);
      ctx.fillStyle = "#1c1815";
      ctx.fill();
    } else {
      // Act 3 (Trout Looks In): Clear half-silvered reflection/silhouette of our
      // oval Bread-Tin Turkey Sub + wide-eyed Turkey inside, so Trout's inspection reads!
      var bobY = (opts.liftY || 0) + Math.sin(s.t * 2.2) * 3;
      var subX = cx + (opts.offsetX || -52);
      var subY = cy + (opts.offsetY || 22) + bobY;
      ctx.globalAlpha = 0.82;

      // Miniature bread-tin sub hull visible in/through the glass reflection
      ctx.save();
      ctx.translate(subX, subY);
      roundRectPath(ctx, -66, -38, 132, 76, 30);
      ctx.fillStyle = "rgba(180, 132, 68, 0.86)";
      ctx.fill();
      ctx.strokeStyle = "#1a2424";
      ctx.lineWidth = 2.6;
      ctx.stroke();

      // Bread-tin rolled lip & top hatch
      ctx.beginPath();
      ctx.moveTo(-58, -26);
      ctx.lineTo(58, -26);
      ctx.strokeStyle = "rgba(255,232,185,0.65)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Warm amber cabin glow window with startled/curious Turkey pilot inside!
      ctx.beginPath();
      ctx.arc(4, 2, 26, 0, TAU);
      ctx.fillStyle = "#fbe3a4";
      ctx.fill();
      ctx.strokeStyle = "#6e4c1e";
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Turkey pilot head inside the window
      ctx.beginPath();
      ctx.arc(0, 6, 15, 0, TAU);
      ctx.fillStyle = "#9e4a2b";
      ctx.fill();
      ctx.strokeStyle = "#1e1612";
      ctx.lineWidth = 1.8;
      ctx.stroke();
      // Beak & wattle
      ctx.beginPath();
      ctx.moveTo(11, 2);
      ctx.lineTo(23, 6);
      ctx.lineTo(11, 10);
      ctx.closePath();
      ctx.fillStyle = "#f0b94a";
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(11, 14, 3.2, 6.5, 0.1, 0, TAU);
      ctx.fillStyle = "#d93829";
      ctx.fill();
      // Big expressive Turkey eye looking back at Trout!
      ctx.beginPath();
      ctx.arc(4, 2, 4.6, 0, TAU);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(5.5, 2, 2.2, 0, TAU);
      ctx.fillStyle = "#111";
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  // ============================================================================
  // PORTHOLE #21 · Fwd — Five giant trout heads tapping bus tablets
  // Turkey: "Sonar hackers or commuter carpool?"
  // Trout:  "Wind-up bath toy or delayed city bus?"
  // Rule:   Collage Scale (SCION 33) | Default Tool: ballast
  // ============================================================================
  function renderP21(ctx, cx, cy, r, s) {
    var bShift = lerp(-18, 8, s.ballast); // Ballast lowers sub behind sheltered rock lip!
    drawWaterBackdrop(ctx, cx, cy, r, s, {
      top: "#2d9288", mid: "#1f6c6b", bot: "#113e42",
      troutTop: "#278996", troutBot: "#0f3a48",
      currentStreaks: true
    });

    // Far bridge pilings in parallax
    ctx.save();
    ctx.globalAlpha = 0.28 * s.clarity;
    ctx.fillStyle = "#0e3136";
    ctx.fillRect(cx - 125 - s.t * 2, cy - 170, 26, 290);
    ctx.fillRect(cx + 85 - s.t * 2, cy - 170, 26, 290);
    ctx.restore();

    if (s.viewMode !== "trout") {
      // --- ACT 1 & 2: TURKEY LOOKS OUT AT SUBMERGED SCHOOL/CITY BUS ---
      var busBounce = Math.sin(s.t * 5.2) * 2.4;
      var busX = cx - 4 + Math.sin(s.t * 0.8) * 6;
      var busY = cy + 6 + bShift + busBounce;

      ctx.save();
      ctx.translate(busX, busY);
      ctx.rotate(-0.035);

      // Spinning rubber wheels under yellow bus chassis
      var wheelXs = [-88, 78];
      for (var w = 0; w < 2; w++) {
        var wx = wheelXs[w], wy = 66;
        // Wheel well arch
        ctx.beginPath();
        ctx.arc(wx, wy, 33, Math.PI, TAU);
        ctx.fillStyle = "#182828";
        ctx.fill();
        // Tire
        ctx.save();
        ctx.translate(wx, wy + 2);
        ctx.rotate(s.t * 3.8);
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, TAU);
        ctx.fillStyle = "#253334";
        ctx.fill();
        ctx.strokeStyle = "#101818";
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, TAU);
        ctx.fillStyle = "#5c6f70";
        ctx.fill();
        ctx.stroke();
        for (var sp = 0; sp < 4; sp++) {
          var a = sp * Math.PI * 0.5;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * -11, Math.sin(a) * -11);
          ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11);
          ctx.strokeStyle = "#162020";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Yellow bus body
      roundRectPath(ctx, -182, -88, 364, 152, 18);
      var busGrad = ctx.createLinearGradient(0, -88, 0, 64);
      busGrad.addColorStop(0, "#efd06d");
      busGrad.addColorStop(0.55, "#d8a83b");
      busGrad.addColorStop(1, "#a87c24");
      ctx.fillStyle = busGrad;
      ctx.fill();
      ctx.strokeStyle = "#1a221e";
      ctx.lineWidth = 2.6;
      ctx.stroke();

      // Black rub-rails along bus flank
      ctx.fillStyle = "#262e2c";
      ctx.fillRect(-178, 12, 356, 6);
      ctx.fillRect(-178, 28, 356, 4);
      // Roof seam
      ctx.beginPath();
      ctx.moveTo(-175, -66);
      ctx.lineTo(175, -66);
      ctx.strokeStyle = "#7b5a18";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Determine Act 2 beat: Commuter Carpool vs Sonar Hackers (both simultaneously legible around t=4.0s!)
      var hackerPulse = (s.act === 2) ? smoothstep(3.1, 3.7, s.tl) : 0;

      // 5 rectangular bus windows with 5 GIANT COLLAGE-SCALE TROUT HEADS!
      for (var i = 0; i < 5; i++) {
        var wx0 = -164 + i * 66;
        var wy0 = -58, ww = 58, wh = 64;

        ctx.save();
        roundRectPath(ctx, wx0, wy0, ww, wh, 5);
        ctx.fillStyle = "#1c6b6c";
        ctx.fill();
        ctx.clip();

        // Seat back
        roundRectPath(ctx, wx0 + 4, wy0 + 18, 16, 48, 4);
        ctx.fillStyle = "#204446";
        ctx.fill();

        // Giant collage-scale trout head inside tiny window!
        var tapPhase = Math.sin(s.t * 9.5 + i * 1.45);
        var jawOpen = 0.08 + 0.16 * Math.max(0, Math.sin(s.t * 3.4 + i * 1.1));
        drawArticulatedTrout(ctx, {
          x: wx0 + 25,
          y: wy0 + 42 + Math.sin(s.t * 3 + i) * 1.5,
          scale: 0.78,
          headOnly: true,
          jaw: jawOpen,
          armAngle: -0.15 + tapPhase * 0.26,
          lookX: (hackerPulse > 0.4 && i % 2 === 1) ? 1.2 : 0.4
        });

        // If Sonar Hackers beat active: odd trout wear dark sonar visors/headsets;
        // even trout hold warm commuter carpool coffee mugs so BOTH forks read side-by-side!
        if (hackerPulse > 0.15 && (i === 1 || i === 3)) {
          ctx.save();
          ctx.globalAlpha = hackerPulse;
          // Hacker headset & green sonar visor over eye
          ctx.strokeStyle = "#111b1b";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(wx0 + 28, wy0 + 24, 14, Math.PI * 0.9, Math.PI * 1.9);
          ctx.stroke();
          ctx.fillStyle = "rgba(80, 255, 190, 0.82)";
          ctx.fillRect(wx0 + 34, wy0 + 18, 14, 7);
          ctx.strokeStyle = "#0e221e";
          ctx.lineWidth = 1.3;
          ctx.strokeRect(wx0 + 34, wy0 + 18, 14, 7);
          ctx.restore();
        } else if (s.act === 2 && (i === 0 || i === 2 || i === 4)) {
          // Commuter carpool travel mug steaming gently!
          ctx.fillStyle = "#d95b38";
          ctx.fillRect(wx0 + 12, wy0 + 47, 10, 13);
          ctx.fillStyle = "#faf6ec";
          ctx.fillRect(wx0 + 11, wy0 + 45, 12, 3);
        }

        // Glowing cyan bus tablet tapped by fin!
        ctx.save();
        ctx.translate(wx0 + 44, wy0 + 44);
        ctx.rotate(0.26);
        var glowBoost = 0.75 + 0.25 * tapPhase;
        roundRectPath(ctx, -8, -12, 16, 23, 2.5);
        ctx.fillStyle = "rgba(68, 248, 245, " + glowBoost.toFixed(2) + ")";
        ctx.fill();
        ctx.strokeStyle = "#0e3c42";
        ctx.lineWidth = 1.6;
        ctx.stroke();
        // Screen graphic: radar rings vs route line
        ctx.beginPath();
        if (hackerPulse > 0.3 && (i === 1 || i === 3)) {
          ctx.arc(0, 0, 5, 0, TAU);
          ctx.strokeStyle = "#083330";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else {
          ctx.moveTo(-4, 5); ctx.lineTo(0, -3); ctx.lineTo(4, -6);
          ctx.strokeStyle = "#084448";
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
        ctx.restore();

        ctx.restore();
        // Window frame border
        roundRectPath(ctx, wx0, wy0, ww, wh, 5);
        ctx.strokeStyle = "#1c2420";
        ctx.lineWidth = 2.4;
        ctx.stroke();
      }

      // Sonar hacker concentric ping waves shooting from tablets toward Turkey's porthole!
      if (hackerPulse > 0.05) {
        for (var p = 0; p < 3; p++) {
          var prog = ((s.t * 1.15 + p * 0.33) % 1);
          var pr = 14 + prog * 92;
          ctx.beginPath();
          ctx.arc(-18, -14, pr, 0.15 * Math.PI, 0.85 * Math.PI);
          ctx.strokeStyle = "rgba(95, 255, 235, " + ((1 - prog) * 0.72 * hackerPulse).toFixed(3) + ")";
          ctx.lineWidth = 2.4;
          ctx.stroke();
        }
      }

      ctx.restore();

      drawCreekBedAndKelp(ctx, cx, cy, s.t, bShift, [-152, -138, 118, 136]);
      drawBubbles(ctx, cx, cy, s.t, 21, 14, 240, 3.0);
      drawSubGlassPresence(ctx, cx, cy, s, { startled: hackerPulse > 0.5 });
    } else {
      // --- ACT 3: TROUT LOOKS IN — "Wind-up bath toy or delayed city bus?" ---
      var lateBeat = smoothstep(7.4, 8.0, s.tl); // 0 = Wind-up bath toy (t=6.8s), 1 = Delayed city bus (t=9.2s)

      // Keep distant yellow bus softly visible in background plane for spatial continuity!
      ctx.save();
      ctx.globalAlpha = 0.34;
      roundRectPath(ctx, cx - 175, cy - 98, 350, 128, 16);
      ctx.fillStyle = "#c99b38";
      ctx.fill();
      ctx.strokeStyle = "#182422";
      ctx.lineWidth = 2;
      ctx.stroke();
      for (var bw = 0; bw < 5; bw++) {
        ctx.fillStyle = "#1b5d63";
        ctx.fillRect(cx - 158 + bw * 64, cy - 76, 52, 46);
      }
      ctx.restore();

      drawCreekBedAndKelp(ctx, cx, cy, s.t, 6, [-155, 142]);

      // Our bread-tin sub visible across the glass!
      var toyWobble = (1 - lateBeat) * Math.sin(s.t * 9) * 3;
      drawSubGlassPresence(ctx, cx, cy, s, { offsetX: -54, offsetY: 16, liftY: toyWobble });

      // Beat A (t=6.8s): Giant brass CLOCKWORK WIND-UP KEY turning on top of our sub reflection!
      var keyAlpha = 1 - lateBeat * 0.65;
      ctx.save();
      ctx.translate(cx - 54, cy - 36 + toyWobble);
      ctx.globalAlpha = keyAlpha;
      // Brass stem
      ctx.fillStyle = "#e0b04f";
      ctx.strokeStyle = "#1c1812";
      ctx.lineWidth = 2.2;
      ctx.fillRect(-5, -18, 10, 26);
      ctx.strokeRect(-5, -18, 10, 26);
      // Spinning bow wings of wind-up key
      var spinW = Math.cos(s.t * 6.5);
      ctx.beginPath();
      ctx.ellipse(-18 * spinW, -28, Math.max(3, Math.abs(16 * spinW)), 13, 0, 0, TAU);
      ctx.ellipse(18 * spinW, -28, Math.max(3, Math.abs(16 * spinW)), 13, 0, 0, TAU);
      ctx.fillStyle = "#f2c665";
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Beat B (t=9.2s): Yellow Bus-Stop Post & Trout checking watch/paddle for "Delayed City Bus"!
      if (lateBeat > 0.05) {
        ctx.save();
        ctx.globalAlpha = lateBeat;
        var postX = cx + 12;
        ctx.strokeStyle = "#202b2c";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(postX, cy + 145);
        ctx.lineTo(postX, cy - 58);
        ctx.stroke();
        // Iconic yellow bus-stop sign (visual bus icon — zero text needed!)
        ctx.beginPath();
        ctx.arc(postX, cy - 72, 24, 0, TAU);
        ctx.fillStyle = "#f2c64b";
        ctx.fill();
        ctx.strokeStyle = "#1b2220";
        ctx.lineWidth = 2.4;
        ctx.stroke();
        // Tiny bus silhouette + clock hands on sign
        roundRectPath(ctx, postX - 13, cy - 80, 26, 14, 3);
        ctx.fillStyle = "#1b2220";
        ctx.fill();
        ctx.fillStyle = "#f2c64b";
        ctx.fillRect(postX - 9, cy - 77, 6, 5);
        ctx.fillRect(postX + 1, cy - 77, 8, 5);
        ctx.restore();
      }

      // Foreground articulated Brook Trout swimming right up to inspect us!
      var troutY = cy + 6 + Math.sin(s.t * 2.8) * 5;
      drawArticulatedTrout(ctx, {
        x: cx + 78,
        y: troutY,
        scale: 1.22,
        flipX: true, // faces left toward our sub!
        jaw: 0.14 + 0.12 * Math.sin(s.t * 4.5),
        tailWag: Math.sin(s.t * 6.2) * 0.25,
        bodyBend: Math.sin(s.t * 3.1) * 0.3,
        armAngle: lerp(-0.85, -0.25 + Math.sin(s.t * 8) * 0.35, lateBeat),
        lookX: -1.0
      });

      // When lateBeat > 0.5, Trout taps a tiny pocket-watch on its fin!
      if (lateBeat > 0.3) {
        ctx.save();
        ctx.globalAlpha = lateBeat;
        var wxp = cx + 44, wyp = troutY + 6;
        ctx.beginPath();
        ctx.arc(wxp, wyp, 11, 0, TAU);
        ctx.fillStyle = "#faf3dc";
        ctx.fill();
        ctx.strokeStyle = "#b8862d";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(wxp, wyp); ctx.lineTo(wxp, wyp - 7);
        ctx.moveTo(wxp, wyp); ctx.lineTo(wxp + 6, wyp + 2);
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();
      }

      drawBubbles(ctx, cx, cy, s.t, 121, 12, 220, 3.2);
    }
  }

  // ============================================================================
  // PORTHOLE #22 · Trim — FinFlex Coach leading mid-water squats
  // Turkey: "Hostile river guards or gym warm-up?"
  // Trout:  "Stopwatch whistle-coach or kettlebell?"
  // Rule:   Synchronized Loop (SCION 14) | Default Tool: lamp
  // ============================================================================
  function renderP22(ctx, cx, cy, r, s) {
    var bShift = s.ballast * 14;
    drawWaterBackdrop(ctx, cx, cy, r, s, {
      top: "#36b0a4", mid: "#218180", bot: "#144b4f",
      troutTop: "#2b949e", troutBot: "#103f4a"
    });

    // Synchronized 123-BPM squat cycle (2.05 Hz), phase-tuned so 1.8s = deep squat & 4.0s = tall guard/rep peak!
    var beat = s.t * 2.05 + 0.32;
    var squatVal = 0.5 - 0.5 * Math.cos(beat * TAU); // 0 = tall, 1 = deep squat!

    if (s.viewMode !== "trout") {
      // Busby Berkeley overhead synchronized water rings!
      ctx.save();
      for (var br = 0; br < 3; br++) {
        var rr = 34 + br * 36 + squatVal * 12;
        ctx.beginPath();
        ctx.ellipse(cx + 38, cy - 108 + bShift * 0.4, rr, rr * 0.24, 0, 0, TAU);
        ctx.strokeStyle = "rgba(195, 255, 245, " + (0.22 * s.clarity).toFixed(3) + ")";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();

      drawCreekBedAndKelp(ctx, cx, cy, s.t, bShift, [-156, -142, 134, 148]);

      // Act 2 dual-reading beat: around t=3.5..4.8s, on the UP-rep they flash crossed reed-spears
      // like "Hostile river guards", while squatting on pebble dumbbells for "Gym warm-up"!
      var guardPose = (s.act === 2) ? smoothstep(3.3, 3.85, s.tl) * (1 - smoothstep(4.85, 5.3, s.tl)) : 0;

      // FinFlex Coach Trout hovering on the left with red lanyard + chrome pea-whistle!
      var coachY = cy - 16 + bShift + Math.sin(beat * TAU) * 7;
      var whistleBlow = (Math.sin(beat * Math.PI) > 0.72) ? 1 : 0;
      drawArticulatedTrout(ctx, {
        x: cx - 92,
        y: coachY,
        scale: 1.08,
        flipX: false,
        rot: -0.14,
        jaw: whistleBlow ? 0.08 : 0.28,
        tailWag: Math.sin(s.t * 7) * 0.28,
        bodyBend: -0.35,
        armAngle: guardPose > 0.4 ? -0.35 : (0.25 + squatVal * 0.45),
        lookX: 1.1
      });

      // Coach sweatband + red lanyard + shiny chrome whistle!
      ctx.save();
      ctx.translate(cx - 92, coachY);
      ctx.rotate(-0.14);
      // Red/white athletic sweatband on Coach forehead
      ctx.strokeStyle = "#d93b2b";
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(22, -19); ctx.lineTo(36, -14);
      ctx.stroke();
      // Red lanyard cord hanging from neck to chrome whistle
      var wx = 26, wy = 32 + Math.sin(s.t * 8) * 3;
      ctx.strokeStyle = "#c93227";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(12, -14);
      ctx.quadraticCurveTo(14, 14, wx, wy);
      ctx.lineTo(22, -4);
      ctx.stroke();
      // Pea whistle body
      ctx.fillStyle = "#e6eef0";
      ctx.strokeStyle = "#182224";
      ctx.lineWidth = 1.8;
      roundRectPath(ctx, wx - 6, wy - 4, 13, 10, 4);
      ctx.fill(); ctx.stroke();
      ctx.fillRect(wx - 10, wy - 3, 6, 5);
      ctx.strokeRect(wx - 10, wy - 3, 6, 5);
      // Whistle sound-burst lines!
      if (whistleBlow || s.act === 2) {
        ctx.strokeStyle = "rgba(255, 248, 190, 0.85)";
        ctx.lineWidth = 2;
        for (var wl = 0; wl < 3; wl++) {
          var wa = -0.5 + wl * 0.45;
          ctx.beginPath();
          ctx.moveTo(48 + Math.cos(wa) * 6, -4 + Math.sin(wa) * 6);
          ctx.lineTo(48 + Math.cos(wa) * 16, -4 + Math.sin(wa) * 16);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Three synchronized upright squatting trout on the right!
      for (var q = 0; q < 3; q++) {
        var qx = cx + 10 + q * 54;
        var qy = cy + 16 + squatVal * 22 + bShift;
        drawArticulatedTrout(ctx, {
          x: qx,
          y: qy,
          scale: 0.86,
          flipX: true, // face Coach on left!
          upright: true,
          squat: squatVal,
          jaw: 0.22 + squatVal * 0.18,
          tailWag: Math.sin(beat * TAU + q * 0.2),
          armAngle: -0.08 + squatVal * 0.45,
          lookX: -0.8,
          lookY: -0.6
        });

        // Gym Warm-Up prop: stone mini-dumbbells held in outstretched pectoral hands!
        var handX = qx - 28;
        var handY = qy + 4 + squatVal * 8;
        ctx.save();
        ctx.fillStyle = "#3c4f52";
        ctx.strokeStyle = "#141d1e";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(handX - 5, handY, 4.5, 0, TAU);
        ctx.arc(handX + 5, handY, 4.5, 0, TAU);
        ctx.fill(); ctx.stroke();

        // Hostile River Guards prop (simultaneous fork cue around t=4.0s!):
        // upright reed-halberd / guard pike held vertically beside each squatter!
        if (guardPose > 0.08) {
          ctx.globalAlpha = guardPose;
          ctx.strokeStyle = "#2b4a34";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(handX + 2, qy + 62);
          ctx.lineTo(handX - 4, qy - 48);
          ctx.stroke();
          // Cattail/spearhead tip
          ctx.beginPath();
          ctx.moveTo(handX - 4, qy - 62);
          ctx.lineTo(handX - 10, qy - 45);
          ctx.lineTo(handX + 2, qy - 45);
          ctx.closePath();
          ctx.fillStyle = "#c95b36";
          ctx.fill();
          ctx.strokeStyle = "#18201d";
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
        ctx.restore();
      }

      drawBubbles(ctx, cx + 25, cy - 20, s.t, 22, 16, 210, 2.8);
      drawSubGlassPresence(ctx, cx, cy, s, { startled: guardPose > 0.5 });
    } else {
      // --- ACT 3: TROUT LOOKS IN — "Stopwatch whistle-coach or kettlebell?" ---
      var kbBeat = smoothstep(7.4, 8.0, s.tl); // 0 = Stopwatch whistle-coach (t=6.8s), 1 = Kettlebell (t=9.2s)
      drawCreekBedAndKelp(ctx, cx, cy, s.t, 6, [-152, 145]);

      var liftOffset = kbBeat * (-18 * squatVal);
      drawSubGlassPresence(ctx, cx, cy, s, { offsetX: -48, offsetY: 22, liftY: liftOffset });

      if (kbBeat < 0.85) {
        // Beat A (t=6.8s): Coach Trout holds a giant ticking BRASS STOPWATCH right beside our round sub!
        ctx.save();
        ctx.globalAlpha = 1 - kbBeat;
        var swX = cx + 22, swY = cy - 18;
        // Stopwatch crown & click button
        ctx.fillStyle = "#d9a94c";
        ctx.strokeStyle = "#1b1812";
        ctx.lineWidth = 2.2;
        ctx.fillRect(swX - 6, swY - 46, 12, 12);
        ctx.strokeRect(swX - 6, swY - 46, 12, 12);
        ctx.beginPath();
        ctx.arc(swX, swY - 52, 8, 0, TAU);
        ctx.stroke();
        // Dial face
        ctx.beginPath();
        ctx.arc(swX, swY, 34, 0, TAU);
        ctx.fillStyle = "#faf5e4";
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#c9963b";
        ctx.stroke();
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = "#1b1812";
        ctx.stroke();
        // Fast sweeping stopwatch hand
        var swAng = s.t * 4.5 - Math.PI * 0.5;
        ctx.beginPath();
        ctx.moveTo(swX, swY);
        ctx.lineTo(swX + Math.cos(swAng) * 26, swY + Math.sin(swAng) * 26);
        ctx.strokeStyle = "#c93524";
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.restore();
      }

      if (kbBeat > 0.15) {
        // Beat B (t=9.2s): Giant cast-iron KETTLEBELL U-HANDLE bolted over our round sub reflection
        // while two FinFlex Trout squat-lift our sub up and down!
        ctx.save();
        ctx.globalAlpha = kbBeat;
        var kx = cx - 48, ky = cy + 22 + liftOffset;
        ctx.beginPath();
        ctx.arc(kx, ky - 36, 34, Math.PI * 0.92, Math.PI * 2.08);
        ctx.strokeStyle = "#2b383a";
        ctx.lineWidth = 12;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.strokeStyle = "#6c8285";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      // Coach Brook Trout on the right peering IN and blowing whistle / coaching squats!
      drawArticulatedTrout(ctx, {
        x: cx + 92,
        y: cy + 28,
        scale: 1.05,
        flipX: true,
        upright: true,
        squat: kbBeat * squatVal,
        jaw: 0.2,
        tailWag: Math.sin(s.t * 6) * 0.25,
        armAngle: kbBeat > 0.5 ? -0.55 : -0.15,
        lookX: -1.1
      });

      drawBubbles(ctx, cx, cy, s.t, 122, 14, 220, 3.0);
    }
  }

  // ============================================================================
  // PORTHOLE #23 · Scope B — Pink anemone wall clock ticking at dusk
  // Turkey: "Hungry sea flower or 3:15 dismissal?"
  // Trout:  "Tardy school bus or Principal’s pocketwatch?"
  // Rule:   Organic Dial (SCION 18) | Default Tool: lamp
  // ============================================================================
  function renderP23(ctx, cx, cy, r, s) {
    var bShift = s.ballast * 12;
    drawWaterBackdrop(ctx, cx, cy, r, s, {
      top: "#22787d", mid: "#15575e", bot: "#0c353d",
      troutTop: "#25828c", troutBot: "#0d3844"
    });

    // Vertical barnacle-crusted wooden bridge piling behind clock (matching p23.jpg!)
    ctx.save();
    var postW = 98;
    var pg = ctx.createLinearGradient(cx - postW * 0.5, 0, cx + postW * 0.5, 0);
    pg.addColorStop(0, "#5e5440");
    pg.addColorStop(0.5, "#8a7d62");
    pg.addColorStop(1, "#4f4635");
    ctx.fillStyle = pg;
    ctx.fillRect(cx - postW * 0.5, cy - r - 10, postW, r * 2 + 20);
    ctx.strokeStyle = "#1a1812";
    ctx.lineWidth = 2.4;
    ctx.strokeRect(cx - postW * 0.5, cy - r - 10, postW, r * 2 + 20);

    // Wood grain lines & green moss patches + white barnacles
    ctx.strokeStyle = "rgba(30,24,16,0.45)";
    ctx.lineWidth = 1.5;
    for (var wg = -34; wg <= 34; wg += 17) {
      ctx.beginPath();
      ctx.moveTo(cx + wg, cy - r);
      ctx.bezierCurveTo(cx + wg + 5, cy - 40, cx + wg - 5, cy + 60, cx + wg + 2, cy + r);
      ctx.stroke();
    }
    var barns = [[-36, 95], [-22, 118], [-32, 142], [18, 125], [32, 150], [-10, 155]];
    for (var bn = 0; bn < barns.length; bn++) {
      var bx = cx + barns[bn][0], by = cy + barns[bn][1] + bShift * 0.4;
      ctx.beginPath();
      ctx.arc(bx, by, 8.5, 0, TAU);
      ctx.fillStyle = "#dfd9c8";
      ctx.fill();
      ctx.strokeStyle = "#1c1a15";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, TAU);
      ctx.fillStyle = "#3a3830";
      ctx.fill();
    }
    ctx.restore();

    var clkX = cx - 4, clkY = cy - 10 + bShift * 0.5;
    var dismissal = (s.act === 2) ? smoothstep(3.45, 3.7, s.tl) : (s.viewMode === "trout" ? 1 : 0);
    var hungryReach = (s.act === 2) ? (0.35 + 0.65 * Math.sin(s.t * 2.6) * 0.5 + 0.35) : 0.25;

    // 32 Articulated Electric-Pink Sea-Anemone Tentacles ringing the clock!
    ctx.save();
    var numT = 30;
    for (var ti = 0; ti < numT; ti++) {
      var baseA = (ti / numT) * TAU;
      // Leave small gap top & bottom so timber post peeks through like p23.jpg
      if (Math.abs(Math.sin(baseA)) > 0.95 && ti % 2 === 0) continue;
      var r0 = 76;
      var len = 54 + (ti % 3) * 18 + hungryReach * 14;
      var wriggle = Math.sin(s.t * 3.4 + ti * 0.85) * 0.24;
      var curlIn = (s.act === 2 && !dismissal) ? 0.25 : 0.08;
      var x0 = clkX + Math.cos(baseA) * r0;
      var y0 = clkY + Math.sin(baseA) * r0;
      var midA = baseA + wriggle * 0.6;
      var tipA = baseA - wriggle + (Math.cos(baseA) > 0 ? -curlIn : curlIn);
      var xm = clkX + Math.cos(midA) * (r0 + len * 0.55);
      var ym = clkY + Math.sin(midA) * (r0 + len * 0.55);
      var xt = clkX + Math.cos(tipA) * (r0 + len);
      var yt = clkY + Math.sin(tipA) * (r0 + len);

      var perpX = -Math.sin(baseA), perpY = Math.cos(baseA);
      ctx.beginPath();
      ctx.moveTo(x0 + perpX * 6, y0 + perpY * 6);
      ctx.quadraticCurveTo(xm + perpX * 4, ym + perpY * 4, xt, yt);
      ctx.quadraticCurveTo(xm - perpX * 4, ym - perpY * 4, x0 - perpX * 6, y0 - perpY * 6);
      ctx.closePath();
      ctx.fillStyle = (ti % 2 === 0) ? "#e88496" : "#d96c82";
      ctx.fill();
      ctx.strokeStyle = "#1c181b";
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
    ctx.restore();

    // Brass school dismissal bell mounted atop the clock when dismissal triggers!
    ctx.save();
    var bellShake = dismissal * Math.sin(s.t * 38) * 5;
    ctx.translate(clkX + bellShake, clkY - 94);
    ctx.beginPath();
    ctx.arc(0, 0, 18, Math.PI, TAU);
    ctx.closePath();
    ctx.fillStyle = "#e5b84b";
    ctx.fill();
    ctx.strokeStyle = "#1a1814";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    if (dismissal > 0.2) {
      for (var rw = 1; rw <= 2; rw++) {
        ctx.beginPath();
        ctx.arc(0, -6, 20 + rw * 9 + ((s.t * 18) % 8), Math.PI * 1.1, Math.PI * 1.9);
        ctx.strokeStyle = "rgba(255, 240, 165, " + (0.75 * dismissal / rw).toFixed(2) + ")";
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }
    }
    ctx.restore();

    // Classroom Wall Clock Case & Cream Dial
    ctx.save();
    ctx.beginPath();
    ctx.arc(clkX, clkY, 84, 0, TAU);
    ctx.fillStyle = "#253133";
    ctx.fill();
    ctx.strokeStyle = "#101617";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(clkX, clkY, 71, 0, TAU);
    ctx.fillStyle = lerpColor("#b8ccb8", "#fbf4df", s.clarity); // radium dusk glow -> warm cream!
    ctx.fill();
    ctx.strokeStyle = "#1d2424";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // 60 minute ticks + 12 bold numerals
    ctx.fillStyle = "#1c2221";
    ctx.font = "700 16px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (var m = 0; m < 60; m++) {
      var ma = (m / 60) * TAU - Math.PI * 0.5;
      var rIn = (m % 5 === 0) ? 59 : 64;
      ctx.beginPath();
      ctx.moveTo(clkX + Math.cos(ma) * rIn, clkY + Math.sin(ma) * rIn);
      ctx.lineTo(clkX + Math.cos(ma) * 68, clkY + Math.sin(ma) * 68);
      ctx.strokeStyle = "#1c2221";
      ctx.lineWidth = (m % 5 === 0) ? 2.2 : 1.1;
      ctx.stroke();
    }
    if (s.showCaptions) {
      for (var hr = 1; hr <= 12; hr++) {
        var ha = (hr / 12) * TAU - Math.PI * 0.5;
        ctx.fillText(String(hr), clkX + Math.cos(ha) * 49, clkY + Math.sin(ha) * 49 + 1);
      }
    } else {
      // Pure geometric baton hour markers when showCaptions === false!
      for (var hb = 1; hb <= 12; hb++) {
        var hba = (hb / 12) * TAU - Math.PI * 0.5;
        ctx.beginPath();
        ctx.arc(clkX + Math.cos(hba) * 49, clkY + Math.sin(hba) * 49, (hb % 3 === 0) ? 3.8 : 2.2, 0, TAU);
        ctx.fill();
      }
    }

    // Stepped ticking minute hand: ticks 3:12 -> 3:13 -> 3:14 -> snaps to 3:15 at t=3.6s!
    var steppedSec = Math.floor(s.t * 2) / 2;
    var minVal;
    if (s.viewMode === "trout" || s.tl >= 3.6) {
      minVal = 15 + (s.viewMode === "trout" ? Math.floor((s.t - 5.6) * 1.5) * 0.15 : 0);
    } else {
      minVal = lerp(11.5, 15.0, clamp(steppedSec / 3.6, 0, 1));
    }
    var minAng = (minVal / 60) * TAU - Math.PI * 0.5;
    var hrAng = ((3 + minVal / 60) / 12) * TAU - Math.PI * 0.5;

    // Hour hand (pointing at 3)
    ctx.save();
    ctx.translate(clkX, clkY);
    ctx.rotate(hrAng);
    ctx.beginPath();
    ctx.moveTo(-6, 0); ctx.lineTo(0, -5); ctx.lineTo(36, 0); ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fillStyle = "#222b2c";
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // Minute hand (ticking from 12 down to 3 for 3:15!)
    ctx.save();
    ctx.translate(clkX, clkY);
    ctx.rotate(minAng);
    ctx.beginPath();
    ctx.moveTo(-8, 0); ctx.lineTo(0, -4); ctx.lineTo(54, 0); ctx.lineTo(0, 4);
    ctx.closePath();
    ctx.fillStyle = "#222b2c";
    ctx.fill(); ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(clkX, clkY, 5.5, 0, TAU);
    ctx.fillStyle = "#c99b3b";
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    if (s.viewMode !== "trout") {
      // At 3:15 dismissal (t >= 3.6s), joyful little school-minnows with backpacks dart across!
      if (dismissal > 0.1) {
        for (var sm = 0; sm < 3; sm++) {
          var mx = cx + 165 - ((s.t - 3.5) * 115 + sm * 48) % 340;
          var my = cy + 56 + sm * 22 + Math.sin(s.t * 8 + sm) * 5;
          drawArticulatedTrout(ctx, {
            x: mx, y: my, scale: 0.36, flipX: true,
            tailWag: Math.sin(s.t * 14 + sm) * 0.35, jaw: 0.2
          });
          // Tiny red school backpack on minnow!
          ctx.fillStyle = "#d94532";
          ctx.fillRect(mx - 4, my - 13, 10, 8);
        }
      }
      // Classic p23 right-side trout swimming past the 3-o'clock mark!
      drawArticulatedTrout(ctx, {
        x: cx + 98 - Math.sin(s.t * 0.9) * 14,
        y: cy + 12 + Math.sin(s.t * 2.4) * 5,
        scale: 0.96,
        flipX: true,
        jaw: 0.16 + 0.1 * Math.sin(s.t * 4),
        tailWag: Math.sin(s.t * 5.5) * 0.24,
        armAngle: 0.35
      });
      drawSubGlassPresence(ctx, cx, cy, s, {});
    } else {
      // --- ACT 3: TROUT LOOKS IN — "Tardy school bus or Principal's pocketwatch?" ---
      var busWave = smoothstep(7.4, 8.0, s.tl); // 0 = Principal's pocketwatch (t=6.8s), 1 = Tardy school bus (t=9.2s)
      drawSubGlassPresence(ctx, cx, cy, s, { offsetX: -62, offsetY: 42 });

      if (busWave < 0.85) {
        // Beat A (t=6.8s): Gold pocketwatch chain + crown framing our sub window like the Principal's Pocketwatch!
        ctx.save();
        ctx.globalAlpha = 1 - busWave;
        ctx.strokeStyle = "#f0c254";
        ctx.lineWidth = 4;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.moveTo(cx - 62, cy + 4);
        ctx.bezierCurveTo(cx - 62, cy - 55, cx + 20, cy - 45, cx + 58, cy + 8);
        ctx.stroke();
        ctx.setLineDash([]);
        // Pocketwatch bow ring atop our sub reflection
        ctx.beginPath();
        ctx.arc(cx - 62, cy - 6, 12, 0, TAU);
        ctx.stroke();
        ctx.restore();
      } else {
        // Beat B (t=9.2s): Yellow flashing bus roof lights & fold-out stop paddle on our sub reflection!
        ctx.save();
        ctx.globalAlpha = busWave;
        var flash = (Math.floor(s.t * 6) % 2 === 0);
        ctx.beginPath();
        ctx.arc(cx - 88, cy + 2, 7, 0, TAU);
        ctx.fillStyle = flash ? "#ff422e" : "#ffb82e";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx - 36, cy + 2, 7, 0, TAU);
        ctx.fillStyle = flash ? "#ffb82e" : "#ff422e";
        ctx.fill();
        ctx.restore();
      }

      // School-satchel Brook Trout right at the glass waving frantically!
      var tx3 = cx + 78, ty3 = cy + 28 + Math.sin(s.t * 3.2) * 5;
      drawArticulatedTrout(ctx, {
        x: tx3, y: ty3, scale: 1.15, flipX: true,
        jaw: 0.25 + 0.12 * Math.sin(s.t * 7),
        tailWag: Math.sin(s.t * 8) * 0.3,
        armAngle: -0.55 + Math.sin(s.t * 11) * 0.45,
        lookX: -1.1
      });
      // Little yellow canvas school satchel strapped over Trout's back!
      ctx.save();
      ctx.translate(tx3 + 8, ty3 - 12);
      roundRectPath(ctx, -12, -10, 22, 18, 4);
      ctx.fillStyle = "#e09f3e";
      ctx.fill();
      ctx.strokeStyle = "#1c1812";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
    drawBubbles(ctx, cx, cy, s.t, 23, 10, 230, 2.8);
  }

  // ============================================================================
  // PORTHOLE #24 · Rudder — Chewed green twine net from Trap Pond
  // Turkey: "Hunter’s turkey snare or trout jailbreak?"
  // Trout:  "Net-cutting tin shears or fishing float?"
  // Rule:   Severed Tether (SCION 41) | Default Tool: ballast
  // ============================================================================
  function renderP24(ctx, cx, cy, r, s) {
    var bShift = lerp(-16, 10, s.ballast);
    drawWaterBackdrop(ctx, cx, cy, r, s, {
      top: "#368f84", mid: "#226661", bot: "#113b3a",
      troutTop: "#2b868e", troutBot: "#0e3842",
      currentStreaks: true
    });

    drawCreekBedAndKelp(ctx, cx, cy, s.t, bShift, [-158, -142, 125, 144]);

    // Net breach progress: snaps wide open at t = 3.65s in Act 2!
    var snapOpen = (s.viewMode === "trout") ? 1 : ((s.act === 2) ? easeOutBack(invLerp(3.35, 3.85, s.tl)) : 0.25);

    // Draw diagonal knotted green Trap Pond twine net with central chewed gap!
    ctx.save();
    ctx.translate(0, bShift * 0.5);
    var gapR = 46 + snapOpen * 42;
    var gapX = cx + 12, gapY = cy - 6;

    ctx.strokeStyle = "#3f7d60";
    ctx.lineWidth = 3.8;
    // Grid of diamond twine meshes clipped/interrupted around the chewed hole!
    for (var dir = 0; dir < 2; dir++) {
      for (var k = -9; k <= 9; k++) {
        var spacing = 28;
        ctx.beginPath();
        var penDown = false;
        for (var stp = -220; stp <= 220; stp += 12) {
          var nx = cx + (dir === 0 ? stp : -stp) * 0.72 + k * spacing;
          var ny = cy + stp * 0.70 + (dir === 0 ? -k * 12 : k * 12);
          var sway = Math.sin(s.t * 2.5 + stp * 0.03 + k) * 3.5;
          nx += sway;
          var dx = nx - gapX, dy = ny - gapY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < gapR) {
            if (penDown) {
              // Frayed chewed twine stub curling outward!
              var ang = Math.atan2(dy, dx);
              var recoil = Math.sin(s.t * 9 + k * 2) * 4 * snapOpen;
              ctx.lineTo(gapX + Math.cos(ang) * (gapR + 6 + recoil), gapY + Math.sin(ang) * (gapR + 6 + recoil));
              ctx.stroke();
              penDown = false;
              ctx.beginPath();
            }
          } else {
            if (!penDown) { ctx.moveTo(nx, ny); penDown = true; }
            else { ctx.lineTo(nx, ny); }
          }
        }
        if (penDown) ctx.stroke();
      }
    }
    ctx.restore();

    if (s.viewMode !== "trout") {
      // Act 2 Fork cue 1: "Hunter's turkey snare" — dangling wooden snare peg & slip-noose at top-left!
      if (s.act === 2 || s.clarity > 0.5) {
        ctx.save();
        var snX = cx - 88, snY = cy - 92 + Math.sin(s.t * 2.2) * 5;
        ctx.strokeStyle = "#3c5c45";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(snX, cy - 190);
        ctx.lineTo(snX, snY);
        ctx.stroke();
        // Wooden trigger toggle peg
        ctx.save();
        ctx.translate(snX, snY);
        ctx.rotate(0.25 + Math.sin(s.t * 3) * 0.1);
        ctx.fillStyle = "#9c7040";
        ctx.strokeStyle = "#1c1610";
        ctx.lineWidth = 1.8;
        ctx.fillRect(-14, -4, 28, 8);
        ctx.strokeRect(-14, -4, 28, 8);
        ctx.restore();
        // Slip-noose loop below peg
        ctx.beginPath();
        ctx.ellipse(snX + 4, snY + 26, 16, 22, -0.1, 0, TAU);
        ctx.strokeStyle = "#487056";
        ctx.lineWidth = 2.8;
        ctx.stroke();
        ctx.restore();
      }

      // Act 2 Fork cue 2: "Trout jailbreak" — Main spotted Trout chomping the twine & darting through!
      var dartX = (s.act === 2 && s.tl > 3.5) ? smoothstep(3.5, 5.2, s.tl) * 34 : 0;
      drawArticulatedTrout(ctx, {
        x: cx + 16 + dartX,
        y: cy - 8 + bShift * 0.4 + Math.sin(s.t * 4.2) * 5,
        scale: 1.12,
        flipX: false, // swimming forward-right through the chewed hole!
        rot: -0.12,
        jaw: (s.tl > 3.1 && s.tl < 3.8) ? (0.45 * Math.abs(Math.sin(s.t * 18))) : 0.22,
        tailWag: Math.sin(s.t * 9.5) * 0.34,
        bodyBend: Math.sin(s.t * 4.8) * 0.35,
        armAngle: 0.4
      });

      // Escaping jailbreak buddy minnows wearing tiny striped caps at t >= 3.6s!
      if (snapOpen > 0.5) {
        for (var jb = 0; jb < 2; jb++) {
          var jx = cx - 45 + ((s.t - 3.4) * 85 + jb * 44) % 190;
          var jy = cy + 36 - jb * 68 + Math.sin(s.t * 7 + jb) * 6;
          drawArticulatedTrout(ctx, {
            x: jx, y: jy, scale: 0.42, flipX: false,
            tailWag: Math.sin(s.t * 14 + jb) * 0.35, jaw: 0.18
          });
          // Tiny black-and-white jailbreak cap!
          ctx.fillStyle = "#f5f5f0";
          ctx.fillRect(jx + 8, jy - 11, 10, 6);
          ctx.fillStyle = "#181d1d";
          ctx.fillRect(jx + 8, jy - 9, 10, 2);
        }
      }

      drawBubbles(ctx, cx, cy, s.t, 24, 15, 220, 3.2);
      drawSubGlassPresence(ctx, cx, cy, s, {});
    } else {
      // --- ACT 3: TROUT LOOKS IN — "Net-cutting tin shears or fishing float?" ---
      var floatBeat = smoothstep(7.4, 8.0, s.tl); // 0 = Net-cutting tin shears (t=6.8s), 1 = Fishing float (t=9.2s)
      var bobberY = floatBeat * Math.sin(s.t * 4.5) * 9;
      drawSubGlassPresence(ctx, cx, cy, s, { offsetX: -54, offsetY: 18, liftY: bobberY });

      if (floatBeat < 0.85) {
        // Beat A (t=6.8s): Pivoted silver TIN SHEARS blades extending from our chipped tin hull snipping green twine!
        ctx.save();
        ctx.globalAlpha = 1 - floatBeat;
        var shX = cx + 8, shY = cy + 6;
        var snip = 0.12 + 0.28 * Math.abs(Math.sin(s.t * 7.5));
        for (var bl = -1; bl <= 1; bl += 2) {
          ctx.save();
          ctx.translate(shX - 18, shY);
          ctx.rotate(bl * snip);
          ctx.beginPath();
          ctx.moveTo(-12, -4 * bl);
          ctx.lineTo(44, -2 * bl);
          ctx.lineTo(36, 6 * bl);
          ctx.lineTo(-12, 4 * bl);
          ctx.closePath();
          ctx.fillStyle = "#cfd9da";
          ctx.fill();
          ctx.strokeStyle = "#1a2224";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
        // Brass pivot rivet + taut green twine being snipped!
        ctx.beginPath();
        ctx.arc(shX - 18, shY, 4.5, 0, TAU);
        ctx.fillStyle = "#d9a648";
        ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#3a7d5c";
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(shX + 14, shY - 45);
        ctx.lineTo(shX + 14, shY - 5);
        ctx.moveTo(shX + 16, shY + 8);
        ctx.lineTo(shX + 20, shY + 52);
        ctx.stroke();
        ctx.restore();
      }

      if (floatBeat > 0.15) {
        // Beat B (t=9.2s): Classic red-and-white FISHING BOBBER / FLOAT bobbing right beside our round sub!
        ctx.save();
        ctx.globalAlpha = floatBeat;
        var fx = cx + 10, fy = cy - 12 + Math.sin(s.t * 4.5 + 0.6) * 11;
        // Fishing line from surface
        ctx.strokeStyle = "rgba(230,250,250,0.75)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(fx, cy - r);
        ctx.lineTo(fx, fy - 28);
        ctx.stroke();
        // Red top half & white bottom half of bobber!
        ctx.beginPath();
        ctx.arc(fx, fy, 22, Math.PI, TAU);
        ctx.closePath();
        ctx.fillStyle = "#e03e2d";
        ctx.fill();
        ctx.strokeStyle = "#1a1e1e";
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(fx, fy, 22, 0, Math.PI);
        ctx.closePath();
        ctx.fillStyle = "#faf6ee";
        ctx.fill();
        ctx.stroke();
        // Top spring peg
        ctx.fillStyle = "#e03e2d";
        ctx.fillRect(fx - 3, fy - 29, 6, 8);
        ctx.strokeRect(fx - 3, fy - 29, 6, 8);
        ctx.restore();
      }

      // Inspecting Brook Trout on the right!
      drawArticulatedTrout(ctx, {
        x: cx + 92,
        y: cy + 20 + Math.sin(s.t * 3) * 4,
        scale: 1.14,
        flipX: true,
        jaw: 0.18,
        tailWag: Math.sin(s.t * 6.5) * 0.28,
        armAngle: -0.35,
        lookX: -1.0
      });
      drawBubbles(ctx, cx, cy, s.t, 124, 12, 220, 3.0);
    }
  }

  // ============================================================================
  // PORTHOLE #25 · Lock — Diner Trout wearing inverted fishbowl
  // Turkey: "Scuba helmet or dry-air bubble?"
  // Trout:  "Giant astronaut suit or bird in a bottle?"
  // Rule:   Inverted Helmet (Oubapo) | Default Tool: lamp
  // ============================================================================
  function renderP25(ctx, cx, cy, r, s) {
    var bShift = s.ballast * 12;
    drawWaterBackdrop(ctx, cx, cy, r, s, {
      top: "#3cb8bf", mid: "#268791", bot: "#144b54",
      troutTop: "#34a4b0", troutBot: "#12424d"
    });

    // Multiplane Lock Cavern rock archway & stalactites (honoring p25.jpg!)
    ctx.save();
    ctx.translate(0, bShift * 0.35);
    // Mid cavern arch
    ctx.beginPath();
    ctx.moveTo(cx - 210, cy + 190);
    ctx.lineTo(cx - 210, cy - 210);
    ctx.lineTo(cx + 210, cy - 210);
    ctx.lineTo(cx + 210, cy + 190);
    ctx.lineTo(cx + 122, cy + 190);
    ctx.lineTo(cx + 138, cy - 25);
    ctx.lineTo(cx + 102, cy - 118);
    ctx.lineTo(cx + 92, cy - 64); // right stalactite!
    ctx.lineTo(cx + 76, cy - 135);
    ctx.quadraticCurveTo(cx, cy - 172, cx - 72, cy - 132);
    ctx.lineTo(cx - 86, cy - 66); // left stalactite!
    ctx.lineTo(cx - 102, cy - 122);
    ctx.lineTo(cx - 136, cy - 30);
    ctx.lineTo(cx - 118, cy + 190);
    ctx.closePath();
    ctx.fillStyle = lerpColor("#0e1f24", "#365c5e", s.clarity);
    ctx.fill();
    ctx.strokeStyle = "#121e20";
    ctx.lineWidth = 2.6;
    ctx.stroke();

    // Foreground flat stone lock walkway ledge at bottom!
    ctx.beginPath();
    ctx.moveTo(cx - 120, cy + 126);
    ctx.lineTo(cx + 150, cy + 114);
    ctx.lineTo(cx + 195, cy + 195);
    ctx.lineTo(cx - 110, cy + 195);
    ctx.closePath();
    ctx.fillStyle = lerpColor("#1d3233", "#6a7b6e", s.clarity);
    ctx.fill();
    ctx.strokeStyle = "#141d1c";
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.restore();

    // Helper to draw the Inverted Glass Fishbowl over Diner Trout's head!
    function drawFishbowlHelmet(hx, hy, dryAirAmt) {
      ctx.save();
      ctx.translate(hx, hy);

      // Clip cleanly inside round glass fishbowl silhouette (truncated top rim & collar base)
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 2, 48, 0, TAU);
      ctx.clip();
      ctx.fillStyle = dryAirAmt > 0.4 ? "rgba(235, 252, 255, 0.28)" : "rgba(70, 205, 218, 0.36)";
      ctx.fillRect(-52, -43, 104, 84);

      // Water column vs dry-air pocket inside inverted fishbowl!
      var slosh = Math.sin(s.t * 3.6) * 3.5;
      var menY = lerp(-24, 20, dryAirAmt);
      ctx.fillStyle = "rgba(72, 210, 224, 0.38)";
      ctx.fillRect(-52, menY + slosh * 0.4, 104, 60);

      // Sloshing meniscus oval
      ctx.beginPath();
      ctx.ellipse(0, menY + slosh * 0.4, 43, 6, slosh * 0.015, 0, TAU);
      ctx.fillStyle = "rgba(185, 250, 255, 0.52)";
      ctx.fill();
      ctx.strokeStyle = "rgba(240, 255, 255, 0.90)";
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();

      // Crisp round outer bowl ink contour
      ctx.beginPath();
      ctx.arc(0, 2, 48, -Math.PI * 0.27, Math.PI * 1.27);
      ctx.strokeStyle = "#17282b";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Flat top rim of inverted fishbowl (matching p25.jpg!)
      ctx.beginPath();
      ctx.ellipse(0, -34, 34, 6.5, 0, 0, TAU);
      ctx.fillStyle = "rgba(215, 250, 252, 0.62)";
      ctx.fill();
      ctx.strokeStyle = "#192b2e";
      ctx.lineWidth = 2.3;
      ctx.stroke();

      // Curved glass specular highlight arc
      ctx.beginPath();
      ctx.arc(0, 2, 42, Math.PI * 0.84, Math.PI * 1.24);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
      ctx.lineWidth = 3.6;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();
    }

    if (s.viewMode !== "trout") {
      // --- ACT 1 & 2: TURKEY LOOKS OUT AT WALKING DINER TROUT ---
      var walkCycle = Math.sin(s.t * 3.8);
      var tx = cx + 8 + Math.sin(s.t * 0.85) * 18;
      var ty = cy + 60 + bShift * 0.35 - Math.abs(walkCycle) * 4;
      var dryAir = (s.act === 2) ? smoothstep(3.2, 3.85, s.tl) : 0;

      // Upright Diner Trout walking in brass scuba/astronaut vest!
      drawArticulatedTrout(ctx, {
        x: tx, y: ty, scale: 1.05,
        flipX: true, // faces left as in p25.jpg!
        upright: true,
        vest: true,
        walk: walkCycle * 0.85,
        jaw: 0.22 + 0.1 * Math.sin(s.t * 4.5),
        tailWag: walkCycle * 0.4,
        armAngle: dryAir > 0.4 ? -0.65 : (-0.15 + walkCycle * 0.25),
        lookX: -0.6, lookY: -0.5
      });

      // Diner bow-tie & dry paper order-pad inside/near dry-air bubble!
      ctx.save();
      ctx.translate(tx - 16, ty - 8);
      ctx.fillStyle = "#d93b2b";
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(-8, -5); ctx.lineTo(-8, 5); ctx.closePath();
      ctx.moveTo(0, 0); ctx.lineTo(8, -5); ctx.lineTo(8, 5); ctx.closePath();
      ctx.fill();
      ctx.restore();

      if (dryAir > 0.2) {
        // Dry diner coffee cup + paper check pad held dry inside/at the helmet rim!
        ctx.save();
        ctx.globalAlpha = dryAir;
        ctx.translate(tx - 32, ty - 28);
        ctx.fillStyle = "#fffdf5";
        ctx.strokeStyle = "#1c1c1a";
        ctx.lineWidth = 1.8;
        ctx.fillRect(-9, -12, 16, 20);
        ctx.strokeRect(-9, -12, 16, 20);
        ctx.strokeStyle = "#487ca8";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-6, -6); ctx.lineTo(4, -6);
        ctx.moveTo(-6, -1); ctx.lineTo(3, -1);
        ctx.moveTo(-6, 4); ctx.lineTo(4, 4);
        ctx.stroke();
        ctx.restore();
      }

      // Scuba valve bubbles hissing from brass collar!
      drawBubbles(ctx, tx + 22, ty - 45, s.t * 1.4, 255, 8, 30, 2.4);

      // Inverted glass fishbowl over Diner Trout's head!
      drawFishbowlHelmet(tx - 4, ty - 34, dryAir);

      drawSubGlassPresence(ctx, cx, cy, s, {});
    } else {
      // --- ACT 3: TROUT LOOKS IN (Oubapo Visual Inversion!) ---
      // "Giant astronaut suit or bird in a bottle?"
      var bottleBeat = smoothstep(7.4, 8.0, s.tl); // 0 = Giant astronaut suit (t=6.8s), 1 = Bird in a bottle (t=9.2s)
      drawSubGlassPresence(ctx, cx, cy, s, { offsetX: -56, offsetY: 16 });

      if (bottleBeat < 0.85) {
        // Beat A (t=6.8s): Planted Moon/Lock Flag + Astronaut bubble visor frame on our sub!
        ctx.save();
        ctx.globalAlpha = 1 - bottleBeat;
        var flX = cx - 4, flY = cy + 118;
        ctx.strokeStyle = "#e8edf0";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(flX, flY);
        ctx.lineTo(flX, flY - 96);
        ctx.stroke();
        // Checkered diner-astronaut flag!
        ctx.fillStyle = "#e04836";
        ctx.fillRect(flX, flY - 96, 34, 22);
        ctx.fillStyle = "#faf6ec";
        ctx.fillRect(flX, flY - 96, 11, 11);
        ctx.fillRect(flX + 22, flY - 96, 12, 11);
        ctx.fillRect(flX + 11, flY - 85, 11, 11);
        ctx.strokeStyle = "#182020";
        ctx.lineWidth = 1.8;
        ctx.strokeRect(flX, flY - 96, 34, 22);
        ctx.restore();
      }

      if (bottleBeat > 0.15) {
        // Beat B (t=9.2s): Corked GLASS BOTTLE NECK & CORK drawn around our Turkey Sub reflection
        // turning feathered Turkey inside into a literal "Bird in a bottle"!
        ctx.save();
        ctx.globalAlpha = bottleBeat;
        var bx0 = cx - 56, by0 = cy + 16;
        // Glass bottle silhouette enclosing Turkey's sub reflection!
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx0 - 74, by0 - 44, 126, 88, 28) : roundRectPath(ctx, bx0 - 74, by0 - 44, 126, 88, 28);
        ctx.fillStyle = "rgba(180, 248, 240, 0.22)";
        ctx.fill();
        ctx.strokeStyle = "rgba(230, 255, 252, 0.88)";
        ctx.lineWidth = 3.2;
        ctx.stroke();
        // Bottle neck + tan cork on the right!
        ctx.fillStyle = "rgba(195, 250, 245, 0.35)";
        ctx.fillRect(bx0 + 52, by0 - 16, 22, 32);
        ctx.strokeRect(bx0 + 52, by0 - 16, 22, 32);
        ctx.fillStyle = "#c9965b";
        ctx.strokeStyle = "#2b1e10";
        ctx.lineWidth = 2;
        ctx.fillRect(bx0 + 70, by0 - 13, 16, 26);
        ctx.strokeRect(bx0 + 70, by0 - 13, 16, 26);
        ctx.restore();
      }

      // Diner Trout standing on right lock sill leaning fishbowl-to-porthole!
      var dtx = cx + 76, dty = cy + 56;
      var tilt = bottleBeat * 0.16;
      drawArticulatedTrout(ctx, {
        x: dtx, y: dty, scale: 1.06,
        flipX: true, upright: true, vest: true,
        rot: -tilt,
        walk: 0,
        jaw: 0.2,
        armAngle: bottleBeat > 0.5 ? -0.35 : -0.95, // salutes astronaut suit, then points at bottle!
        lookX: -1.1
      });
      drawFishbowlHelmet(dtx - 6 - tilt * 24, dty - 34, 0.65);
    }
  }

  // ============================================================================
  // SETUP A BREAD-TIN COCKPIT & EDITORIAL STORY STRIP (W=1280, H=720)
  // ============================================================================
  function renderCockpitAndScene(ctx, W, H, meta, sceneFn, tRaw, state) {
    ensurePatterns(ctx);
    var s = resolveSceneState(meta, tRaw, state);

    ctx.save();
    ctx.scale(W / 1280, H / 720);

    var cx = 640, cy = 255, rGlass = 185, rOuter = 224;

    // 1. Cockpit Dark Outer Margin + Oval Bread-Roll Tin Hull (y = 0..536)
    ctx.fillStyle = "#0b1618";
    ctx.fillRect(0, 0, 1280, 536);

    // Oval bread-roll tin interior wall (#132427) with subtle brushed grain
    roundRectPath(ctx, 38, 16, 1204, 504, 72);
    ctx.fillStyle = _tinPat || "#132427";
    ctx.fill();

    // Warm overhead task-light wash inside cockpit
    var taskAlpha = 0.12 + 0.14 * s.lamp + (s.viewMode === "trout" ? -0.03 : 0);
    var taskGrad = ctx.createRadialGradient(cx, 28, 20, cx, 190, 520);
    taskGrad.addColorStop(0, "rgba(255, 198, 108, " + taskAlpha.toFixed(3) + ")");
    taskGrad.addColorStop(1, "rgba(19, 36, 39, 0)");
    ctx.fillStyle = taskGrad;
    roundRectPath(ctx, 38, 16, 1204, 504, 72);
    ctx.fill();

    // Rolled tin rim with invariant RIGHT-SIDE DENT (around x=1242 -> dented inward to x=1214, y=205..335!)
    ctx.beginPath();
    ctx.moveTo(110, 16);
    ctx.lineTo(1170, 16);
    ctx.arcTo(1242, 16, 1242, 88, 72);
    ctx.lineTo(1242, 198);
    // Invariant Setup-A right-side bread-tin dent!
    ctx.bezierCurveTo(1210, 228, 1208, 298, 1242, 332);
    ctx.lineTo(1242, 448);
    ctx.arcTo(1242, 520, 1170, 520, 72);
    ctx.lineTo(110, 520);
    ctx.arcTo(38, 520, 38, 448, 72);
    ctx.lineTo(38, 88);
    ctx.arcTo(38, 16, 110, 16, 72);
    ctx.closePath();
    ctx.strokeStyle = "#4d6b6e";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hammered crease highlights on the right-side dent so it reads unmistakably
    ctx.beginPath();
    ctx.moveTo(1226, 212);
    ctx.quadraticCurveTo(1198, 265, 1226, 320);
    ctx.strokeStyle = "rgba(175, 212, 210, 0.48)";
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1214, 232);
    ctx.quadraticCurveTo(1196, 265, 1214, 300);
    ctx.strokeStyle = "rgba(8, 16, 18, 0.65)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Overhead practical amber task-light bar
    ctx.save();
    roundRectPath(ctx, 455, 18, 370, 12, 5);
    ctx.fillStyle = "#3c3222";
    ctx.fill();
    ctx.strokeStyle = "#8a6d3b";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    var barGlow = ctx.createLinearGradient(470, 24, 810, 24);
    barGlow.addColorStop(0, "rgba(245,180,82,0.35)");
    barGlow.addColorStop(0.5, "rgba(255,216,130,0.92)");
    barGlow.addColorStop(1, "rgba(245,180,82,0.35)");
    ctx.fillStyle = barGlow;
    ctx.fillRect(475, 22, 330, 5);
    ctx.restore();

    // 2. Clipped Circular Porthole Interior (cx=640, cy=255, r=185)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rGlass, 0, TAU);
    ctx.clip();

    // Render custom handmade multiplane scene for #21..#25
    sceneFn(ctx, cx, cy, rGlass, s);

    // Volumetric Lamp Cone sweeping upward from mounted Lamp Hood when lamp is ON!
    if (s.lamp > 0.02) {
      ctx.save();
      var lg = ctx.createRadialGradient(cx, cy + 178, 12, cx, cy - 10, 290);
      lg.addColorStop(0, "rgba(255, 228, 145, " + (0.44 * s.lamp).toFixed(3) + ")");
      lg.addColorStop(0.55, "rgba(255, 220, 130, " + (0.16 * s.lamp).toFixed(3) + ")");
      lg.addColorStop(1, "rgba(255, 220, 130, 0)");
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(cx - 32, cy + 185);
      ctx.lineTo(cx - 175, cy - 185);
      ctx.lineTo(cx + 175, cy - 185);
      ctx.lineTo(cx + 32, cy + 185);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Murky dusk silt haze when NEITHER tool is active yet (Act 1 before 1.0s, or interactive off)
    if (s.clarity < 0.85 && s.viewMode !== "trout") {
      var murk = (1 - s.clarity) * 0.62;
      ctx.fillStyle = "rgba(8, 22, 26, " + murk.toFixed(3) + ")";
      ctx.fillRect(cx - rGlass, cy - rGlass, rGlass * 2, rGlass * 2);
    }

    // Optical ripple ring across glass at t = 5.6s cut!
    if (s.cutRipple > 0.02) {
      ctx.beginPath();
      ctx.arc(cx, cy, (1 - s.cutRipple * 0.5) * 165, 0, TAU);
      ctx.strokeStyle = "rgba(210, 255, 250, " + (0.65 * s.cutRipple).toFixed(3) + ")";
      ctx.lineWidth = 6;
      ctx.stroke();
    }

    // Bottom mounted brass lamp hood peeking at 6-o'clock inside glass when lamp fitted/on
    if (meta.defaultTool === "lamp" || s.lamp > 0.05) {
      ctx.beginPath();
      ctx.arc(cx, cy + 190, 34, Math.PI * 1.08, Math.PI * 1.92);
      ctx.fillStyle = s.lamp > 0.5 ? "#d99a3c" : "#6b532b";
      ctx.fill();
      ctx.strokeStyle = "#1c160d";
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }

    // Curved glass rim shadow & upper-left specular reflection highlight
    var rimShad = ctx.createRadialGradient(cx, cy, rGlass - 22, cx, cy, rGlass + 2);
    rimShad.addColorStop(0, "rgba(0,0,0,0)");
    rimShad.addColorStop(1, "rgba(5,14,16,0.48)");
    ctx.fillStyle = rimShad;
    ctx.fillRect(cx - rGlass, cy - rGlass, rGlass * 2, rGlass * 2);

    ctx.beginPath();
    ctx.arc(cx, cy, rGlass - 14, Math.PI * 1.08, Math.PI * 1.36);
    ctx.strokeStyle = "rgba(240, 255, 252, 0.36)";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    // 3. Heavy Riveted Antique Brass Porthole Bezel + Left Hinge + Right Latch + 2-o'clock Rim Chip!
    drawBrassPortholeFrame(ctx, cx, cy, rGlass, rOuter, s);

    // 4. Setup-A Cockpit Plaque & Instruments
    drawStationPlaque(ctx, meta, s);
    drawAirDial(ctx, 1102, 116, 54, s);
    drawBallastControl(ctx, 76, 416, 254, 88, s, meta);
    drawChalkChart(ctx, 446, 428, 388, 78, s, meta);
    drawLampToggle(ctx, 956, 412, 192, 92, s);

    // 5. Articulated Feathered Turkey Pilot Wing Operating Controls & Reacting!
    drawTurkeyPilotRig(ctx, meta, s);

    // 6. Lower Cream Editorial Story Strip (y = 536..720, #faf8f3)
    drawEditorialStrip(ctx, meta, s);

    ctx.restore();
  }

  function drawBrassPortholeFrame(ctx, cx, cy, rIn, rOut, s) {
    ctx.save();

    // Left cast-iron hinge block (matching p21..p25 reference art)
    roundRectPath(ctx, cx - rOut - 22, cy - 54, 34, 108, 5);
    ctx.fillStyle = "#3a3d3c";
    ctx.fill();
    ctx.strokeStyle = "#121515";
    ctx.lineWidth = 2.6;
    ctx.stroke();
    roundRectPath(ctx, cx - rOut - 26, cy - 58, 14, 116, 6);
    ctx.fillStyle = "#2b2e2e";
    ctx.fill();
    ctx.stroke();
    var hScrews = [cy - 36, cy + 36];
    for (var hs = 0; hs < 2; hs++) {
      ctx.beginPath();
      ctx.arc(cx - rOut + 1, hScrews[hs], 4.5, 0, TAU);
      ctx.fillStyle = "#5c605e";
      ctx.fill(); ctx.stroke();
    }

    // Outer antique brass ring
    ctx.beginPath();
    ctx.arc(cx, cy, rOut, 0, TAU);
    ctx.arc(cx, cy, rIn, 0, TAU, true);
    var brassG = ctx.createLinearGradient(cx - rOut, cy - rOut, cx + rOut, cy + rOut);
    brassG.addColorStop(0, "#c89f52");
    brassG.addColorStop(0.35, "#9c7534");
    brassG.addColorStop(0.7, "#b68c43");
    brassG.addColorStop(1, "#6f5120");
    ctx.fillStyle = brassG;
    ctx.fill("evenodd");

    ctx.beginPath();
    ctx.arc(cx, cy, rOut, 0, TAU);
    ctx.strokeStyle = "#18140d";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, rIn + 11, 0, TAU);
    ctx.strokeStyle = "#5b4118";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, rIn, 0, TAU);
    ctx.strokeStyle = "#1a150e";
    ctx.lineWidth = 3.2;
    ctx.stroke();

    // INVARIANT SETUP-A 2-O'CLOCK RIM CHIP! (Approx -28 deg on inner/mid brass bevel)
    var chipAng = -0.48; // ~2 o'clock!
    var chipX = cx + Math.cos(chipAng) * (rIn + 4);
    var chipY = cy + Math.sin(chipAng) * (rIn + 4);
    ctx.save();
    ctx.translate(chipX, chipY);
    ctx.rotate(chipAng);
    ctx.beginPath();
    ctx.moveTo(-7, -11);
    ctx.lineTo(13, -3);
    ctx.lineTo(9, 8);
    ctx.lineTo(-6, 10);
    ctx.closePath();
    ctx.fillStyle = "#1a2122";
    ctx.fill();
    ctx.strokeStyle = "#e6c37a";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    // Right-side offset brass dog-latch
    var lx = cx + rOut - 8, ly = cy + 6;
    roundRectPath(ctx, lx - 8, ly - 32, 22, 64, 8);
    ctx.fillStyle = "#a8803c";
    ctx.fill();
    ctx.strokeStyle = "#1a140c";
    ctx.lineWidth = 2.4;
    ctx.stroke();
    // Pivoted latch dog handle
    ctx.beginPath();
    ctx.moveTo(lx - 20, ly);
    ctx.lineTo(lx + 28, ly - 8);
    ctx.lineTo(lx + 28, ly + 8);
    ctx.closePath();
    ctx.fillStyle = "#c99f52";
    ctx.fill();
    ctx.stroke();

    // 6 Hexagonal Brass Die-Bolts (12, 2, 4, 6, 8, 10 o'clock -> faces 1..6!)
    var rBolt = (rIn + rOut) * 0.5 + 2;
    for (var b = 0; b < 6; b++) {
      var faceNum = b + 1;
      var ba = -Math.PI * 0.5 + b * (TAU / 6);
      var bx = cx + Math.cos(ba) * rBolt;
      var by = cy + Math.sin(ba) * rBolt;
      var isRolled = (s.roll === faceNum);

      if (isRolled) {
        var tierCol = (faceNum <= 2) ? "#29a8b8" : (faceNum <= 4 ? "#42b878" : "#e05a36");
        var pulse = 0.72 + 0.28 * Math.sin(s.t * 8);
        ctx.beginPath();
        ctx.arc(bx, by, 21, 0, TAU);
        ctx.fillStyle = tierCol;
        ctx.globalAlpha = 0.42 * pulse;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#fff5cc";
        ctx.lineWidth = 2.4;
        ctx.stroke();
      }

      // Hex bolt head
      ctx.beginPath();
      for (var h = 0; h < 6; h++) {
        var ha = h * (TAU / 6) + 0.2;
        var hx = bx + Math.cos(ha) * 11;
        var hy = by + Math.sin(ha) * 11;
        if (h === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fillStyle = isRolled ? "#ffe184" : "#b88e44";
      ctx.fill();
      ctx.strokeStyle = "#1c160d";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(bx, by, 5.5, 0, TAU);
      ctx.fillStyle = isRolled ? "#fff6cf" : "#9c7430";
      ctx.fill();

      // Glint star on rolled 1d6 bolt!
      if (isRolled) {
        ctx.save();
        ctx.translate(bx + 9, by - 9);
        ctx.rotate(s.t * 2.5);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        for (var st = 0; st < 8; st++) {
          var sr = (st % 2 === 0) ? 9 : 2.5;
          var sa = st * (TAU / 8);
          if (st === 0) ctx.moveTo(sr, 0); else ctx.lineTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  function drawStationPlaque(ctx, meta, s) {
    ctx.save();
    var px = 76, py = 58, pw = 252, ph = 92;
    roundRectPath(ctx, px, py, pw, ph, 10);
    ctx.fillStyle = "rgba(14, 28, 31, 0.78)";
    ctx.fill();
    ctx.strokeStyle = "#3f5d60";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Brass corner rivets
    var corners = [[px + 10, py + 10], [px + pw - 10, py + 10], [px + 10, py + ph - 10], [px + pw - 10, py + ph - 10]];
    for (var c = 0; c < 4; c++) {
      ctx.beginPath();
      ctx.arc(corners[c][0], corners[c][1], 2.5, 0, TAU);
      ctx.fillStyle = "#9c7838";
      ctx.fill();
    }

    if (s.showCaptions) {
      ctx.fillStyle = "#e8be74";
      ctx.font = "600 13px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("STATION " + meta.station, px + 18, py + 30);
      ctx.fillStyle = "#a8c5c2";
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("FIT: " + (meta.defaultTool === "lamp" ? "LAMP MODULE" : "BALLAST TRAY"), px + 18, py + 52);
      ctx.fillStyle = "#88a6a4";
      ctx.fillText(meta.scionRule, px + 18, py + 73);
    } else {
      // Blind-critic mode (showCaptions: false): pure non-text visual schematic of Lamp vs Ballast!
      var isLamp = (meta.defaultTool === "lamp");
      // Mini sub icon + beam or low-lip wave
      roundRectPath(ctx, px + 34, py + 30, 64, 32, 14);
      ctx.strokeStyle = "#9ab8b5";
      ctx.lineWidth = 2;
      ctx.stroke();
      if (isLamp) {
        ctx.beginPath();
        ctx.moveTo(px + 98, py + 46);
        ctx.lineTo(px + 165, py + 24);
        ctx.lineTo(px + 165, py + 68);
        ctx.closePath();
        ctx.fillStyle = s.lamp > 0.5 ? "rgba(245, 200, 95, 0.55)" : "rgba(140, 170, 168, 0.18)";
        ctx.fill();
      } else {
        ctx.fillStyle = s.ballast > 0.5 ? "#d9a448" : "#4b696b";
        ctx.fillRect(px + 48, py + 54, 36, 10);
        ctx.beginPath();
        ctx.moveTo(px + 118, py + 56);
        ctx.quadraticCurveTo(px + 150, py + 44, px + 186, py + 56);
        ctx.strokeStyle = "#76b8b2";
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawAirDial(ctx, cx, cy, r, s) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r + 5, 0, TAU);
    ctx.fillStyle = "#9c7838";
    ctx.fill();
    ctx.strokeStyle = "#151818";
    ctx.lineWidth = 2.4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fillStyle = "#f7f1de";
    ctx.fill();
    ctx.stroke();

    for (var i = 0; i <= 10; i++) {
      var a = Math.PI * 0.8 + (i / 10) * Math.PI * 1.4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (r - 9), cy + Math.sin(a) * (r - 9));
      ctx.lineTo(cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3));
      ctx.strokeStyle = "#222a2a";
      ctx.lineWidth = (i % 5 === 0) ? 2.2 : 1.2;
      ctx.stroke();
    }

    // Subtle breathing needle
    var needleAng = -Math.PI * 0.32 + (s.t / 10) * 0.08 + Math.sin(s.t * 5) * 0.025;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 4);
    ctx.lineTo(cx + Math.cos(needleAng) * (r - 12), cy + Math.sin(needleAng) * (r - 12));
    ctx.strokeStyle = "#b83c28";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + 4, 4.5, 0, TAU);
    ctx.fillStyle = "#2c3434";
    ctx.fill();

    if (s.showCaptions) {
      ctx.fillStyle = "#1e2626";
      ctx.font = "700 13px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("1 DAY", cx, cy + 23);
      ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("OF AIR", cx, cy + 37);
    }
    ctx.restore();
  }

  function drawBallastControl(ctx, x, y, w, h, s, meta) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, 12);
    ctx.fillStyle = "#102023";
    ctx.fill();
    ctx.strokeStyle = s.ballast > 0.5 ? "#d9a952" : "#6c8c8e";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (s.showCaptions) {
      ctx.fillStyle = "#c8dcd9";
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("BALLAST / SINGLE SLOT", x + 16, y + 22);
    }

    // Recessed Single Slot socket on the left, spare cradle on the right
    var slotX = x + 22, slotY = y + 36, slotW = 132, slotH = 34;
    ctx.fillStyle = "#0a1416";
    ctx.fillRect(slotX, slotY, slotW, slotH);
    ctx.strokeStyle = "#4d6b6d";
    ctx.lineWidth = 1.6;
    ctx.strokeRect(slotX, slotY, slotW, slotH);

    // Sliding rectangular Ballast Tray with one usable U-handle!
    // Slides horizontally from spare right position into seated left socket when s.ballast -> 1!
    var trayX = lerp(slotX + 78, slotX + 4, s.ballast);
    var trayY = slotY + 3;
    roundRectPath(ctx, trayX, trayY, 124, 28, 4);
    ctx.fillStyle = s.ballast > 0.5 ? "#c89844" : "#4b696b";
    ctx.fill();
    ctx.strokeStyle = "#141d1e";
    ctx.lineWidth = 2;
    ctx.stroke();

    // U-handle on Ballast Tray
    ctx.beginPath();
    ctx.moveTo(trayX + 42, trayY + 14);
    ctx.lineTo(trayX + 42, trayY + 6);
    ctx.lineTo(trayX + 82, trayY + 6);
    ctx.lineTo(trayX + 82, trayY + 14);
    ctx.strokeStyle = "#f2d48c";
    ctx.lineWidth = 2.6;
    ctx.stroke();

    // Snap-lock indicator LED pin
    ctx.beginPath();
    ctx.arc(x + w - 20, slotY + 17, 5, 0, TAU);
    ctx.fillStyle = s.ballast > 0.7 ? "#56e39f" : "#283a3c";
    ctx.fill();
    ctx.restore();
  }

  function drawChalkChart(ctx, x, y, w, h, s, meta) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, 12);
    ctx.fillStyle = "#132326";
    ctx.fill();
    ctx.strokeStyle = "#6c8c8e";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    if (s.showCaptions) {
      ctx.fillStyle = "#b8d0cd";
      ctx.font = "11.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("CHALK CHART UNDER GLASS", x + w * 0.5, y + 19);
    }

    // Geographic invariants: twin trunks on left, culvert rock notch mid, Stone Steps right
    ctx.strokeStyle = "rgba(180, 210, 206, 0.38)";
    ctx.lineWidth = 1.6;
    // Twin trunks
    ctx.beginPath();
    ctx.moveTo(x + 36, y + 64); ctx.lineTo(x + 36, y + 40);
    ctx.moveTo(x + 46, y + 64); ctx.lineTo(x + 46, y + 42);
    // Rock notch
    ctx.moveTo(x + 175, y + 34); ctx.lineTo(x + 186, y + 46); ctx.lineTo(x + 197, y + 34);
    // Stone Steps
    ctx.moveTo(x + 320, y + 64); ctx.lineTo(x + 332, y + 64); ctx.lineTo(x + 332, y + 54);
    ctx.lineTo(x + 344, y + 54); ctx.lineTo(x + 344, y + 44); ctx.lineTo(x + 356, y + 44);
    ctx.stroke();

    // Progressive white chalk survey route!
    var prog = (s.viewMode === "trout") ? 1 : clamp(s.tl / 5.6, 0.12, 1);
    var pts = [
      [x + 54, y + 58],
      [x + 124, y + 42],
      [x + 192, y + 55],
      [x + 262, y + 39],
      [x + 314, y + 50]
    ];
    var totalSegs = pts.length - 1;
    var segProg = prog * totalSegs;

    ctx.save();
    ctx.strokeStyle = "#f4f1e6";
    ctx.lineWidth = 2.4;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 0; i < totalSegs; i++) {
      var u = clamp(segProg - i, 0, 1);
      if (u <= 0) break;
      ctx.lineTo(lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u));
    }
    ctx.stroke();
    ctx.restore();

    // Gold verified landmark dot & bell circle at t >= 5.6s (Act 3 / Trout view)!
    if (s.viewMode === "trout" || s.tl >= 5.6) {
      var pop = (s.viewMode === "trout" && s.tl < 6.1) ? easeOutBack(invLerp(5.6, 6.0, s.tl)) : 1;
      var gx = pts[4][0], gy = pts[4][1];
      ctx.beginPath();
      ctx.arc(gx, gy, 9 * pop, 0, TAU);
      ctx.strokeStyle = "rgba(255, 212, 92, 0.55)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(gx, gy, 5 * pop, 0, TAU);
      ctx.fillStyle = "#ffd452";
      ctx.fill();
    }

    // Glazing diagonal sheen
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x + 90, y + h - 6);
    ctx.lineTo(x + 135, y + 8);
    ctx.stroke();
    ctx.restore();
  }

  function drawLampToggle(ctx, x, y, w, h, s) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, 12);
    ctx.fillStyle = "#122124";
    ctx.fill();
    ctx.strokeStyle = s.lamp > 0.5 ? "#ebb055" : "#6c8c8e";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (s.showCaptions) {
      ctx.fillStyle = "#e8c88c";
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("LAMP TOGGLE", x + 18, y + 23);
    }

    // Amber indicator jewel
    var jx = x + 46, jy = y + 56;
    ctx.beginPath();
    ctx.arc(jx, jy, 9, 0, TAU);
    ctx.fillStyle = s.lamp > 0.5 ? "#ffbe42" : "#3a2d18";
    ctx.fill();
    ctx.strokeStyle = "#8a6d38";
    ctx.lineWidth = 2;
    ctx.stroke();
    if (s.lamp > 0.5) {
      ctx.beginPath();
      ctx.arc(jx, jy, 16, 0, TAU);
      ctx.fillStyle = "rgba(255, 190, 66, 0.28)";
      ctx.fill();
    }

    // Brass toggle pivot & bat-handle lever flipping from LEFT (-0.52) to RIGHT (+0.52)
    var sx = x + 124, sy = y + 60;
    ctx.beginPath();
    ctx.arc(sx, sy, 12, 0, TAU);
    ctx.fillStyle = "#b88a3e";
    ctx.fill();
    ctx.strokeStyle = "#18140c";
    ctx.lineWidth = 2;
    ctx.stroke();

    var ang = lerp(-0.55, 0.52, s.lamp) - Math.PI * 0.5;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(34, -6);
    ctx.lineTo(34, 6);
    ctx.lineTo(0, 4);
    ctx.closePath();
    ctx.fillStyle = "#f2efe4";
    ctx.fill();
    ctx.strokeStyle = "#181816";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // Articulated Turkey Pilot Silhouette & Feathered Wing operating the control in Act 1!
  function drawTurkeyPilotRig(ctx, meta, s) {
    ctx.save();
    // Subtle shoulder silhouette in foreground bottom-left/mid-left
    var breath = Math.sin(s.t * 2.4) * 2.5;
    var baseShoulderX = 378, baseShoulderY = 532 + breath;

    // Determine reach envelope in Act 1 (0.32s -> 1.0s reach & snap -> 1.72s settle!)
    var reachAmt = 0;
    if (!s.viewMode || s.act === 1) {
      var up = smoothstep(0.32, 0.92, s.tl);
      var down = 1 - smoothstep(1.18, 1.78, s.tl);
      reachAmt = up * down;
    }

    var isRightTool = (meta.defaultTool === "lamp");
    // Target coordinates for Ballast Tray handle (left) vs Lamp Toggle bat-handle (right)
    var targetX = isRightTool ? 1068 : 268;
    var targetY = isRightTool ? 462 : 458;
    // Slight resistance quiver at t = 0.88..1.00s right before mechanical snap!
    if (s.tl > 0.86 && s.tl < 1.02) {
      targetX += Math.sin(s.tl * 90) * 3;
    }

    var restX = (isRightTool ? 884 : 396) + (s.act === 2 ? Math.sin(s.t * 2.1) * 5 : 0);
    var restY = 510 + breath;

    var tipX = lerp(restX, targetX, reachAmt);
    var tipY = lerp(restY, targetY, reachAmt);

    // Natural left or right pilot wing anchor below the cockpit rim (no thin stretching!)
    var shX = isRightTool ? lerp(856, 945, reachAmt) : lerp(366, 332, reachAmt);
    var shY = 542;
    var elbowX = (shX + tipX) * 0.5 + (isRightTool ? 22 : -26) * reachAmt;
    var elbowY = Math.min(shY, tipY) + 28 * (1 - reachAmt * 0.4);

    // Draw articulated 2-link feathered Turkey Wing!
    ctx.strokeStyle = "#150e0a";
    ctx.lineWidth = 2.4;

    // Upper wing & forearm mass
    ctx.beginPath();
    ctx.moveTo(shX - 24, shY + 10);
    ctx.quadraticCurveTo(elbowX - 18, elbowY - 14, tipX - 10, tipY - 8);
    ctx.lineTo(tipX + 12, tipY + 8);
    ctx.quadraticCurveTo(elbowX + 18, elbowY + 18, shX + 26, shY + 10);
    ctx.closePath();
    var wg = ctx.createLinearGradient(shX, shY, tipX, tipY);
    wg.addColorStop(0, "#4a2416");
    wg.addColorStop(0.65, "#7c3c22");
    wg.addColorStop(1, "#a65430");
    ctx.fillStyle = wg;
    ctx.fill();
    ctx.stroke();

    // 4 Fanned primary wing feathers at the wingtip!
    var wingAng = Math.atan2(tipY - elbowY, tipX - elbowX);
    ctx.save();
    ctx.translate(tipX, tipY);
    ctx.rotate(wingAng);
    var fanSpread = (s.tl > 0.94 && s.tl < 1.15) ? 0.24 : 0.15;
    for (var f = -1.5; f <= 1.5; f += 1) {
      ctx.save();
      ctx.rotate(f * fanSpread);
      ctx.beginPath();
      ctx.ellipse(12, 0, 18, 5.2, 0, 0, TAU);
      ctx.fillStyle = (f % 2 === 0) ? "#8f4526" : "#b56838";
      ctx.fill();
      ctx.stroke();
      // Barred turkey feather stripe!
      ctx.fillStyle = "#e6cfa8";
      ctx.fillRect(18, -3.5, 4, 7);
      ctx.restore();
    }
    ctx.restore();

    // Mechanical snap spark/lines at t = 1.0s!
    if (s.tl >= 0.97 && s.tl <= 1.14) {
      ctx.strokeStyle = "#ffe28a";
      ctx.lineWidth = 2.2;
      for (var sp = 0; sp < 4; sp++) {
        var sa = -Math.PI * 0.85 + sp * 0.55;
        ctx.beginPath();
        ctx.moveTo(tipX + Math.cos(sa) * 18, tipY + Math.sin(sa) * 18);
        ctx.lineTo(tipX + Math.cos(sa) * 30, tipY + Math.sin(sa) * 30);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function drawEditorialStrip(ctx, meta, s) {
    ctx.save();
    ctx.fillStyle = _paperPat || "#faf8f3";
    ctx.fillRect(0, 536, 1280, 184);

    // Crisp hairline divider
    ctx.strokeStyle = "#cfc8b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 536.75);
    ctx.lineTo(1280, 536.75);
    ctx.stroke();

    // PAELEO BLIND-CRITIC INVARIANT: when showCaptions === false, draw ZERO text!
    if (!s.showCaptions) {
      ctx.restore();
      return;
    }

    var kicker, headline, headCol, subline;
    if (s.viewMode === "setup") {
      kicker = "ACT 1 · SETUP A COCKPIT OPERATION   (" + meta.station + ")";
      headCol = "#263638";
      headline = meta.clue;
      subline = "Turkey operates " + (meta.defaultTool === "lamp" ? "Lamp Toggle [L]" : "Ballast Module [B]") + "  ·  " + meta.scionRule;
    } else if (s.viewMode === "turkey") {
      kicker = "FIRST PASS · TURKEY LOOKS OUT   (" + meta.station + ")";
      headCol = "#9e3d1c";
      headline = "“" + meta.turkeyFork + "”";
      subline = "Write odd faces (1 · 3 · 5)  ·  " + meta.scionRule + "  ·  Rim clue: " + meta.clue;
    } else {
      var tier = (s.roll <= 2) ? "Probable" : (s.roll <= 4 ? "Plausible" : "Preposterous");
      kicker = "SECOND PASS · TROUT LOOKS IN   (" + meta.station + ")";
      headCol = "#1d596e";
      headline = "“" + meta.troutFork + "”";
      subline = "Write even faces (2 · 4 · 6)  ·  " + (s.roll ? ("Rolled 1d6 Bolt #" + s.roll + " (" + tier + ")  ·  ") : "") + "Chalk Chart verified under glass";
    }

    ctx.fillStyle = headCol;
    ctx.font = "600 13px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(kicker, 74, 572);

    ctx.fillStyle = headCol;
    ctx.font = "700 32px Georgia, serif";
    ctx.fillText(headline, 74, 622);

    ctx.fillStyle = "#566163";
    ctx.font = "italic 16.5px Georgia, serif";
    ctx.fillText(subline, 74, 684);

    // Clean right-side 1d6 consequence key badge
    var rx = 980, ry = 564;
    var badges = [
      { lbl: "1·2 Probable", col: "#1d596e", active: s.roll === 1 || s.roll === 2 },
      { lbl: "3·4 Plausible", col: "#2d6a4f", active: s.roll === 3 || s.roll === 4 },
      { lbl: "5·6 Preposterous", col: "#9e3d1c", active: s.roll === 5 || s.roll === 6 }
    ];
    ctx.font = "600 11.5px ui-monospace, SFMono-Regular, Menlo, monospace";
    for (var i = 0; i < 3; i++) {
      var b = badges[i];
      var by = ry + i * 28;
      roundRectPath(ctx, rx, by, 224, 22, 5);
      ctx.fillStyle = b.active ? b.col : "#efeae0";
      ctx.fill();
      ctx.strokeStyle = b.active ? b.col : "#d5cec0";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = b.active ? "#ffffff" : b.col;
      ctx.fillText(b.lbl, rx + 12, by + 15);
    }

    ctx.restore();
  }

  // ---------- Register Portals #21–#25 on window.PORTAL_SCENES ----------
  var DEFINITIONS = [
    {
      id: 21,
      station: "#21 · Fwd",
      clue: "Five giant trout heads tapping bus tablets",
      turkeyFork: "Sonar hackers or commuter carpool?",
      troutFork: "Wind-up bath toy or delayed city bus?",
      scionRule: "Collage Scale (SCION 33)",
      defaultTool: "ballast",
      fn: renderP21
    },
    {
      id: 22,
      station: "#22 · Trim",
      clue: "FinFlex Coach leading mid-water squats",
      turkeyFork: "Hostile river guards or gym warm-up?",
      troutFork: "Stopwatch whistle-coach or kettlebell?",
      scionRule: "Synchronized Loop (SCION 14)",
      defaultTool: "lamp",
      fn: renderP22
    },
    {
      id: 23,
      station: "#23 · Scope B",
      clue: "Pink anemone wall clock ticking at dusk",
      turkeyFork: "Hungry sea flower or 3:15 dismissal?",
      troutFork: "Tardy school bus or Principal’s pocketwatch?",
      scionRule: "Organic Dial (SCION 18)",
      defaultTool: "lamp",
      fn: renderP23
    },
    {
      id: 24,
      station: "#24 · Rudder",
      clue: "Chewed green twine net from Trap Pond",
      turkeyFork: "Hunter’s turkey snare or trout jailbreak?",
      troutFork: "Net-cutting tin shears or fishing float?",
      scionRule: "Severed Tether (SCION 41)",
      defaultTool: "ballast",
      fn: renderP24
    },
    {
      id: 25,
      station: "#25 · Lock",
      clue: "Diner Trout wearing inverted fishbowl",
      turkeyFork: "Scuba helmet or dry-air bubble?",
      troutFork: "Giant astronaut suit or bird in a bottle?",
      scionRule: "Inverted Helmet (Oubapo)",
      defaultTool: "lamp",
      fn: renderP25
    }
  ];

  for (var d = 0; d < DEFINITIONS.length; d++) {
    (function (def) {
      window.PORTAL_SCENES[def.id] = {
        id: def.id,
        station: def.station,
        clue: def.clue,
        turkeyFork: def.turkeyFork,
        troutFork: def.troutFork,
        scionRule: def.scionRule,
        defaultTool: def.defaultTool,
        render: function (ctx, W, H, t, state) {
          renderCockpitAndScene(ctx, W || 1280, H || 720, def, def.fn, t, state);
        }
      };
    })(DEFINITIONS[d]);
  }
})();
