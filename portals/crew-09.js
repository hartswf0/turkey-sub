/*
 * Trout Sub · SCION Portal Animation Crew 09 (#41–#45)
 * Handmade 2D Canvas Multiplane & Articulated Cutout Rigs (PAELEO / Oulipo + Video-to-Game)
 * Portholes:
 *   #41 · Catwalk  — Sea bream in sunglasses walking on stick legs (Masaaki Yuasa: Mind Game)
 *   #42 · Ferry    — Two pin-jointed elders between twin trees (Nina Paley: This Land Is Mine)
 *   #43 · Snout    — Crayon-spotted yellow shark nose on glass (Wes Anderson: The Life Aquatic)
 *   #44 · Rotor    — Spinning black-and-white spiral word disc (Marcel Duchamp: Anémic cinéma)
 *   #45 · Extruder — Plastic funnel sucking baster into pellets (Resnais & Queneau: Chant du styrène)
 */
(function () {
  "use strict";

  window.PORTAL_SCENES = window.PORTAL_SCENES || {};

  var TAU = Math.PI * 2;
  var CX = 640;
  var CY = 255;
  var R_GLASS = 185;
  var R_OUTER = 226;

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

  function hash(n) {
    var s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    if (w < 0) { x += w; w = -w; }
    if (h < 0) { y += h; h = -h; }
    var rr = Math.max(0, Math.min(r, w * 0.5, h * 0.5));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  // Derive normalized deterministic state from `t` and optional interactive `state`
  function resolveSceneState(meta, rawT, state) {
    var st = state || {};
    var tCont = Math.max(0, Number(rawT) || 0);
    var t = tCont > 10.0001 ? (tCont % 10.0) : tCont;

    var showCaptions = st.showCaptions !== false;
    var viewMode = st.view || "auto";
    var act = t < 2.0 ? 1 : (t < 5.6 ? 2 : 3);
    if (viewMode === "turkey") act = 2;
    else if (viewMode === "trout") act = 3;

    var autoSwitchAmt = smoothstep(0.92, 1.16, t);
    var lampOn, lampAmt;
    if (typeof st.lamp === "boolean") {
      lampOn = st.lamp;
      lampAmt = st.lamp ? 1 : 0;
    } else if (meta.defaultTool === "lamp") {
      lampOn = t >= 1.0 || viewMode === "turkey" || viewMode === "trout";
      lampAmt = (viewMode === "turkey" || viewMode === "trout") ? 1 : autoSwitchAmt;
    } else {
      lampOn = false;
      lampAmt = 0;
    }

    var ballastOn, ballastAmt;
    if (typeof st.ballast === "boolean") {
      ballastOn = st.ballast;
      ballastAmt = st.ballast ? 1 : 0;
    } else if (meta.defaultTool === "ballast") {
      ballastOn = t >= 1.0 || viewMode === "turkey" || viewMode === "trout";
      ballastAmt = (viewMode === "turkey" || viewMode === "trout") ? 1 : autoSwitchAmt;
    } else {
      ballastOn = false;
      ballastAmt = 0;
    }

    // Ambient clarity improves once the pilot operates either lamp or ballast at t=1.0s
    var toolOperatedAmt = Math.max(lampAmt, ballastAmt, (viewMode !== "auto") ? 1 : autoSwitchAmt);
    var murkAmt = (1 - toolOperatedAmt) * 0.62 + (lampOn ? 0.0 : 0.08);

    var defaultRoll = ((meta.id * 2 + 1) % 6) + 1;
    var roll = 0;
    if (typeof st.roll === "number") {
      roll = clamp(Math.round(st.roll), 0, 6);
    } else if (act === 3 && t >= 5.75) {
      roll = defaultRoll;
    } else if (viewMode === "trout") {
      roll = defaultRoll;
    }

    var cutFlash = (st.view && st.view !== "auto") ? 0 : Math.exp(-Math.pow((t - 5.6) / 0.14, 2));

    var chartProgress;
    if (viewMode === "trout") {
      chartProgress = 1.0;
    } else if (viewMode === "turkey") {
      chartProgress = 0.42;
    } else if (t < 1.0) {
      chartProgress = 0.15;
    } else if (t < 5.6) {
      chartProgress = lerp(0.15, 0.45, smoothstep(1.0, 5.2, t));
    } else {
      chartProgress = lerp(0.45, 1.0, smoothstep(5.65, 7.4, t));
    }

    return {
      t: t,
      tCont: tCont,
      act: act,
      isTrout: act === 3,
      isTurkey: act === 2,
      showCaptions: showCaptions,
      lamp: lampOn,
      lampAmt: lampAmt,
      ballast: ballastOn,
      ballastAmt: ballastAmt,
      murkAmt: clamp(murkAmt, 0, 0.75),
      roll: roll,
      cutFlash: cutFlash,
      chartProgress: chartProgress,
      viewMode: viewMode
    };
  }

  // Shared underwater river background + multiplane caustics inside the clipped porthole
  function drawUnderwaterBackdrop(ctx, s, palette) {
    var topCol = s.isTrout ? (palette.troutTop || "#1a6c74") : (palette.turkeyTop || "#184f58");
    var midCol = s.isTrout ? (palette.troutMid || "#298b88") : (palette.turkeyMid || "#216d70");
    var botCol = s.isTrout ? (palette.troutBot || "#174247") : (palette.turkeyBot || "#13373b");

    var grad = ctx.createLinearGradient(CX, CY - R_GLASS, CX, CY + R_GLASS);
    grad.addColorStop(0, topCol);
    grad.addColorStop(0.56, midCol);
    grad.addColorStop(1, botCol);
    ctx.fillStyle = grad;
    ctx.fillRect(CX - R_GLASS - 10, CY - R_GLASS - 10, R_GLASS * 2 + 20, R_GLASS * 2 + 20);

    // Multiplane painted gouache current bands (subtle parallax & calm when ballast is fitted)
    var speed = lerp(1.0, 0.36, s.ballastAmt);
    var yShift = -16 * s.ballastAmt;
    ctx.save();
    ctx.translate(0, yShift);
    for (var b = 0; b < 6; b++) {
      var by = CY - 155 + b * 42;
      ctx.fillStyle = b % 2 === 0
        ? "rgba(175, 238, 224, " + (s.isTrout ? 0.14 : 0.09) + ")"
        : "rgba(14, 48, 54, 0.12)";
      ctx.beginPath();
      ctx.moveTo(CX - 210, by + 26);
      for (var x = -210; x <= 210; x += 28) {
        var wy = by + Math.sin((x * 0.024) + s.tCont * (1.5 + b * 0.22) * speed + b * 1.3) * (6 + (b % 3) * 2.5);
        ctx.lineTo(CX + x, wy);
      }
      ctx.lineTo(CX + 210, by + 32);
      ctx.closePath();
      ctx.fill();
    }

    // Fast surface current streaks in Act 1 before ballast settles (visualizes river shear)
    if (s.ballastAmt < 0.85 && !palette.noStreaks) {
      var streakAlpha = (1 - s.ballastAmt) * 0.22;
      ctx.strokeStyle = "rgba(210, 245, 238, " + streakAlpha.toFixed(3) + ")";
      ctx.lineWidth = 1.6;
      for (var k = 0; k < 9; k++) {
        var sx = ((hash(k * 7.1) * 420 + s.tCont * 150 * (0.8 + (k % 3) * 0.3)) % 440) - 220;
        var sy = CY - 140 + k * 28;
        ctx.beginPath();
        ctx.moveTo(CX + sx, sy);
        ctx.lineTo(CX + sx + 38, sy + Math.sin(s.tCont * 4 + k) * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Swaying hand-inked creek ribbon weeds
  function drawCreekReeds(ctx, xBase, yBase, count, heightScale, t, flip, tint) {
    ctx.save();
    ctx.translate(xBase, yBase);
    if (flip) ctx.scale(-1, 1);
    for (var i = 0; i < count; i++) {
      var ox = (i - (count - 1) * 0.5) * 11;
      var h = (52 + (i % 3) * 22) * heightScale;
      var sway = Math.sin(t * 1.9 + i * 1.1 + xBase * 0.03) * (7 + i * 1.8);
      ctx.beginPath();
      ctx.moveTo(ox - 3.5, 0);
      ctx.quadraticCurveTo(ox + sway * 0.45 - 3, -h * 0.52, ox + sway, -h);
      ctx.quadraticCurveTo(ox + sway * 0.55 + 4, -h * 0.48, ox + 3.5, 0);
      ctx.closePath();
      ctx.fillStyle = tint || (i % 2 === 0 ? "#2d6d5e" : "#3f8770");
      ctx.fill();
      ctx.strokeStyle = "#122b29";
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Sheltered low stone lip that rises into lower porthole foreground when Ballast is fitted
  function drawBallastShelterLip(ctx, s) {
    if (s.ballastAmt <= 0.01) return;
    var rise = easeOutBack(s.ballastAmt) * 32;
    ctx.save();
    ctx.translate(0, 34 - rise);
    ctx.beginPath();
    ctx.moveTo(CX - 195, CY + 195);
    ctx.lineTo(CX - 195, CY + 148);
    ctx.quadraticCurveTo(CX - 115, CY + 132, CX - 42, CY + 146);
    ctx.quadraticCurveTo(CX + 38, CY + 156, CX + 118, CY + 136);
    ctx.lineTo(CX + 195, CY + 148);
    ctx.lineTo(CX + 195, CY + 195);
    ctx.closePath();
    var rg = ctx.createLinearGradient(CX, CY + 132, CX, CY + 190);
    rg.addColorStop(0, "#5e6f64");
    rg.addColorStop(0.45, "#3f4f48");
    rg.addColorStop(1, "#232f2c");
    ctx.fillStyle = rg;
    ctx.fill();
    ctx.strokeStyle = "#14201e";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Carved shelter notch mark on the stone lip
    ctx.strokeStyle = "rgba(216, 232, 214, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(CX - 95, CY + 148);
    ctx.lineTo(CX - 62, CY + 145);
    ctx.moveTo(CX + 70, CY + 148);
    ctx.lineTo(CX + 108, CY + 144);
    ctx.stroke();
    ctx.restore();
  }

  // Volumetric submarine searchlight cone from bottom porthole lamp when `lamp` is active
  function drawVolumetricLampBeam(ctx, s, targetX, targetY) {
    if (s.lampAmt <= 0.01) return;
    var tx = targetX !== undefined ? targetX : CX;
    var ty = targetY !== undefined ? targetY : CY - 45;
    var lx = CX;
    var ly = CY + 178;

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    var beamGrad = ctx.createRadialGradient(lx, ly, 8, tx, ty, 275);
    beamGrad.addColorStop(0, "rgba(255, 224, 140, " + (0.52 * s.lampAmt).toFixed(3) + ")");
    beamGrad.addColorStop(0.45, "rgba(255, 205, 110, " + (0.24 * s.lampAmt).toFixed(3) + ")");
    beamGrad.addColorStop(1, "rgba(255, 195, 95, 0)");

    var dx = tx - lx;
    var dy = ty - ly;
    var ang = Math.atan2(dy, dx);
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(lx - 18, ly);
    ctx.lineTo(lx + Math.cos(ang - 0.56) * 370, ly + Math.sin(ang - 0.56) * 370);
    ctx.arc(lx, ly, 370, ang - 0.56, ang + 0.56);
    ctx.lineTo(lx + 18, ly);
    ctx.closePath();
    ctx.fill();

    // Floating illuminated plankton/silt motes inside the beam
    for (var m = 0; m < 14; m++) {
      var mu = ((hash(m * 13.7) + s.tCont * 0.07 * (0.6 + (m % 3) * 0.3)) % 1);
      var spread = (hash(m * 5.3) - 0.5) * 180 * mu;
      var mx = lerp(lx, tx, mu) + spread;
      var my = lerp(ly, ty - 60, mu) + Math.sin(s.tCont * 2.3 + m) * 6;
      ctx.fillStyle = "rgba(255, 243, 196, " + ((1 - mu) * 0.55 * s.lampAmt).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(mx, my, 1.4 + (m % 3) * 0.7, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // Articulated Spotted Brook Trout (Salvelinus fontinalis) for Act 3 ("Trout Looks In")
  function drawArticulatedBrookTrout(ctx, opts) {
    var x = opts.x || CX + 70;
    var y = opts.y || CY + 20;
    var scale = opts.scale || 1.0;
    var flipX = opts.flipX ? -1 : 1; // default faces LEFT (flipX=false faces left!)
    var pitch = opts.pitch || 0;
    var t = opts.t || 0;
    var mouthOpen = clamp(opts.mouthOpen || 0, 0, 1);
    var finWave = Math.sin(t * 7.5 + (opts.phase || 0));
    var tailWag = Math.sin(t * 6.8 + (opts.phase || 0)) * (opts.swimAmp !== undefined ? opts.swimAmp : 1.0);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(pitch);
    ctx.scale(flipX * scale, scale);

    // Articulated caudal peduncle + forked square brook-trout tail (right side since facing left)
    ctx.save();
    ctx.translate(52, tailWag * 2.5);
    ctx.rotate(tailWag * 0.22);
    ctx.beginPath();
    ctx.moveTo(-4, -7);
    ctx.lineTo(26, -21);
    ctx.quadraticCurveTo(21, 0, 26, 21);
    ctx.lineTo(-4, 7);
    ctx.closePath();
    var tailG = ctx.createLinearGradient(0, -20, 24, 20);
    tailG.addColorStop(0, "#4a6b53");
    tailG.addColorStop(0.6, "#8c6d46");
    tailG.addColorStop(1, "#c86448");
    ctx.fillStyle = tailG;
    ctx.fill();
    // Tail rays
    ctx.strokeStyle = "#17261f";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.lineWidth = 0.9;
    for (var r = -3; r <= 3; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * 1.8);
      ctx.lineTo(22, r * 5.2);
      ctx.stroke();
    }
    ctx.restore();

    // Dorsal fin (articulated tilt)
    ctx.save();
    ctx.translate(4, -20);
    ctx.rotate(finWave * 0.08);
    ctx.beginPath();
    ctx.moveTo(-16, 4);
    ctx.quadraticCurveTo(-6, -18, 12, -13);
    ctx.lineTo(18, 5);
    ctx.closePath();
    ctx.fillStyle = "#5b7d5e";
    ctx.fill();
    ctx.strokeStyle = "#17261f";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Adipose fin
    ctx.beginPath();
    ctx.ellipse(37, -12 + tailWag * 1.1, 6, 4, -0.35, 0, TAU);
    ctx.fillStyle = "#6e8a67";
    ctx.fill();
    ctx.strokeStyle = "#17261f";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Pelvic & Anal fins (brook trout signature white + black leading edge!)
    var lowFins = [
      { x: 6, y: 18, w: 14, h: 13, rot: 0.25 + finWave * 0.14 },
      { x: 30, y: 14 + tailWag * 1.0, w: 13, h: 12, rot: 0.32 - finWave * 0.1 }
    ];
    for (var lf = 0; lf < lowFins.length; lf++) {
      var f = lowFins[lf];
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.beginPath();
      ctx.moveTo(-6, -2);
      ctx.lineTo(0, f.h);
      ctx.lineTo(f.w, f.h * 0.55);
      ctx.lineTo(6, -2);
      ctx.closePath();
      ctx.fillStyle = "#d97554";
      ctx.fill();
      ctx.strokeStyle = "#17261f";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      // Crisp white leading stripe
      ctx.strokeStyle = "#faf6eb";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-5, -1);
      ctx.lineTo(0, f.h - 1);
      ctx.stroke();
      ctx.restore();
    }

    // Streamlined Brook Trout torso
    ctx.beginPath();
    ctx.moveTo(-56, 1);
    ctx.bezierCurveTo(-40, -22, 6, -26, 54, -7 + tailWag * 2.2);
    ctx.lineTo(54, 7 + tailWag * 2.2);
    ctx.bezierCurveTo(10, 25, -32, 24, -52, 8 + mouthOpen * 4);
    // Mouth notch
    ctx.lineTo(-40, 5 + mouthOpen * 3);
    ctx.lineTo(-56, 1);
    ctx.closePath();

    var bodyG = ctx.createLinearGradient(0, -24, 0, 24);
    bodyG.addColorStop(0, "#355947");
    bodyG.addColorStop(0.45, "#6e8f6b");
    bodyG.addColorStop(0.75, "#dfab78");
    bodyG.addColorStop(1, "#f2dec0");
    ctx.fillStyle = bodyG;
    ctx.fill();
    ctx.strokeStyle = "#15231d";
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Brook trout spots (dark olive dorsal dots + pale yellow & crimson-haloed lateral spots)
    var spots = [
      [-22, -9, 2.0, "#1f362b"], [-10, -12, 2.2, "#1f362b"], [4, -11, 2.1, "#1f362b"],
      [18, -9, 2.0, "#1f362b"], [31, -6, 1.8, "#1f362b"], [-16, -2, 2.3, "#f3e39c"],
      [-3, -3, 2.5, "#d94e3b"], [11, -1, 2.3, "#f3e39c"], [24, 0, 2.4, "#d94e3b"],
      [-8, 5, 2.2, "#d94e3b"], [7, 6, 2.1, "#f3e39c"], [20, 5, 2.0, "#d94e3b"], [36, 2, 1.8, "#f3e39c"]
    ];
    for (var sp = 0; sp < spots.length; sp++) {
      var pt = spots[sp];
      var syOff = pt[0] > 15 ? tailWag * 1.1 : 0;
      if (pt[3] === "#d94e3b") {
        ctx.fillStyle = "rgba(155, 212, 214, 0.55)";
        ctx.beginPath();
        ctx.arc(pt[0], pt[1] + syOff, pt[2] + 1.5, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = pt[3];
      ctx.beginPath();
      ctx.arc(pt[0], pt[1] + syOff, pt[2], 0, TAU);
      ctx.fill();
    }

    // Gill operculum curve
    ctx.strokeStyle = "#1c2e26";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(-27, 0, 13, -0.85, 0.95);
    ctx.stroke();

    // Articulated Pectoral Fin (waves expressively!)
    ctx.save();
    ctx.translate(-20, 10);
    ctx.rotate(0.35 + finWave * 0.28 + (opts.waveFin ? Math.sin(t * 14) * 0.45 : 0));
    ctx.beginPath();
    ctx.moveTo(-3, -2);
    ctx.quadraticCurveTo(8, 15, 19, 10);
    ctx.quadraticCurveTo(13, 0, 3, -3);
    ctx.closePath();
    ctx.fillStyle = "#e0815b";
    ctx.fill();
    ctx.strokeStyle = "#15231d";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.strokeStyle = "#faf6eb";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-2, -1);
    ctx.lineTo(14, 11);
    ctx.stroke();
    ctx.restore();

    // Expressive Eye
    ctx.fillStyle = "#f9f3dc";
    ctx.beginPath();
    ctx.arc(-41, -4, 5.4, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#15231d";
    ctx.lineWidth = 1.3;
    ctx.stroke();

    var lookX = clamp(opts.lookX || -1.4, -2.2, 2.2);
    var lookY = clamp(opts.lookY || 0, -2.0, 2.0);
    ctx.fillStyle = "#111816";
    ctx.beginPath();
    ctx.arc(-41 + lookX, -4 + lookY, 3.0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-42.2 + lookX * 0.5, -5.4, 1.2, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  // Subtle semi-transparent reflection of Turkey Pilot looking out inside lower-left porthole glass
  // OR exterior tin bread-roll hull reflection when Trout looks in!
  function drawGlassObserverReflection(ctx, s, turkeyMood) {
    if (!s.isTrout) {
      // Turkey reflection inside lower-left glass (matching p41..p45 reference placement!)
      var alpha = s.act === 1 ? 0.28 : 0.42;
      var bob = Math.sin(s.tCont * 2.4) * 3;
      var tilt = (turkeyMood && turkeyMood.tilt) || Math.sin(s.tCont * 1.7) * 0.08;
      var blink = (Math.sin(s.tCont * 2.9 + 1.1) > 0.96) ? 0.15 : 1.0;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(CX - 114, CY + 126 + bob);
      ctx.rotate(tilt);

      // Feathered neck & head
      ctx.fillStyle = "#8d583c";
      ctx.beginPath();
      ctx.moveTo(-24, 52);
      ctx.quadraticCurveTo(-22, 6, -10, -18);
      ctx.arc(0, -18, 22, Math.PI, -0.15);
      ctx.quadraticCurveTo(18, 8, 14, 52);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#2b1a12";
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Red crimson wattle & snood
      ctx.fillStyle = "#b83b2b";
      ctx.beginPath();
      ctx.ellipse(14, 2, 5.5, 13, 0.15, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // Curved amber beak
      ctx.fillStyle = "#dfb05b";
      ctx.beginPath();
      ctx.moveTo(16, -20);
      ctx.quadraticCurveTo(35, -16, 37, -7);
      ctx.quadraticCurveTo(24, -6, 15, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Turkey eye (supports spiral hypnosis pupil for #44!)
      ctx.fillStyle = "#f7eed7";
      ctx.beginPath();
      ctx.ellipse(2, -20, 7.5, 7.5 * blink, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      if (blink > 0.4) {
        if (turkeyMood && turkeyMood.spiralEye) {
          ctx.strokeStyle = "#181210";
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          for (var a = 0; a < 11; a += 0.35) {
            var rr = a * 0.58;
            var ex = 3 + Math.cos(a - s.tCont * 10) * rr;
            var ey = -20 + Math.sin(a - s.tCont * 10) * rr;
            if (a === 0) ctx.moveTo(ex, ey);
            else ctx.lineTo(ex, ey);
          }
          ctx.stroke();
        } else {
          ctx.fillStyle = "#1b1410";
          ctx.beginPath();
          ctx.arc(4, -20, 3.6, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(5.5, -22, 1.3, 0, TAU);
          ctx.fill();
        }
      }
      ctx.restore();
    } else {
      // Act 3 ("Trout Looks In"): subtle warm amber interior glow + Turkey silhouette glimpsed from outside
      ctx.save();
      var inGlow = ctx.createRadialGradient(CX - 95, CY + 95, 8, CX - 95, CY + 95, 95);
      inGlow.addColorStop(0, "rgba(255, 200, 112, 0.24)");
      inGlow.addColorStop(1, "rgba(255, 200, 112, 0)");
      ctx.fillStyle = inGlow;
      ctx.beginPath();
      ctx.arc(CX - 95, CY + 95, 95, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  // ============================================================================
  // PORTHOLE #41 · CATWALK ("Sea bream in sunglasses walking on stick legs")
  // Masaaki Yuasa: Mind Game (Studio 4°C, 2004) · Substrate Collision (SCION 22)
  // ============================================================================
  function renderPortal41(ctx, s) {
    drawUnderwaterBackdrop(ctx, s, {
      turkeyTop: "#1a5b60", turkeyMid: "#2d8d84", turkeyBot: "#1c4a47",
      troutTop: "#1f757c", troutMid: "#3da89c", troutBot: "#1f5350"
    });

    var yShift = -16 * s.ballastAmt;
    ctx.save();
    ctx.translate(0, yShift);

    // Sandy gravel catwalk floor & stepping stones
    var bedG = ctx.createLinearGradient(CX, CY + 62, CX, CY + 195);
    bedG.addColorStop(0, "#a8b487");
    bedG.addColorStop(0.45, "#778c6c");
    bedG.addColorStop(1, "#35544d");
    ctx.fillStyle = bedG;
    ctx.beginPath();
    ctx.moveTo(CX - 200, CY + 78);
    ctx.quadraticCurveTo(CX - 60, CY + 66, CX + 40, CY + 74);
    ctx.quadraticCurveTo(CX + 130, CY + 80, CX + 200, CY + 68);
    ctx.lineTo(CX + 200, CY + 205);
    ctx.lineTo(CX - 200, CY + 205);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#172d28";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Stepping-stone catwalk slabs along y = CY + 96
    var slabs = [-135, -68, 0, 68, 135];
    for (var si = 0; si < slabs.length; si++) {
      var sx = CX + slabs[si];
      var sy = CY + 98 + (si % 2) * 3;
      ctx.fillStyle = si % 2 === 0 ? "#c8bd94" : "#b3a882";
      ctx.beginPath();
      ctx.ellipse(sx, sy, 29, 8.5, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#22342c";
      ctx.lineWidth = 1.7;
      ctx.stroke();
    }

    // Left & right Studio 4°C expressive boulders & reeds
    drawCreekReeds(ctx, CX - 135, CY + 82, 5, 1.05, s.tCont, false, "#367862");
    drawCreekReeds(ctx, CX + 132, CY + 86, 5, 1.1, s.tCont + 0.8, true, "#3b836b");

    // Walk cycle kinematics with planted stick-tips (PAELEO zero-slip stance!)
    var strideLen = 48;
    var walkSpeed = 1.35; // cycles per second
    var phase = s.tCont * walkSpeed;
    // Pause proudly at t=3.8..4.5s during Turkey's inspection to tip sunglasses!
    var poseHold = (!s.isTrout && s.t >= 3.55 && s.t <= 4.55)
      ? smoothstep(3.55, 3.8, s.t) * (1 - smoothstep(4.3, 4.55, s.t))
      : 0;

    var walkX = s.isTrout
      ? lerp(-48, 54, smoothstep(5.6, 9.5, s.t))
      : lerp(-52, 24, smoothstep(0.4, 5.5, s.t));
    var hipX = CX + walkX;
    var groundY = CY + 97;

    // Stick leg helper: planted stance vs swing arc
    function computeStickFoot(legIndex) {
      var u = (phase + legIndex * 0.5) % 1;
      var stanceFootX, footY;
      if (poseHold > 0.5) {
        stanceFootX = hipX + (legIndex === 0 ? -24 : 28);
        footY = groundY;
      } else if (u < 0.55) {
        // Stance phase: foot planted wrt catwalk!
        var su = u / 0.55;
        stanceFootX = hipX + lerp(strideLen * 0.5, -strideLen * 0.5, su);
        footY = groundY;
      } else {
        // Swing phase: lifts cleanly over gravel
        var wu = (u - 0.55) / 0.45;
        stanceFootX = hipX + lerp(-strideLen * 0.5, strideLen * 0.5, wu);
        footY = groundY - Math.sin(wu * Math.PI) * 22;
      }
      return { x: stanceFootX, y: footY, planted: u < 0.55 };
    }

    var footBack = computeStickFoot(0);
    var footFront = computeStickFoot(1);
    var bodyBob = (1 - poseHold) * Math.abs(Math.sin(phase * TAU)) * -7;
    var bodyY = CY - 2 + bodyBob;

    // Mirage shimmer double during Act 2 ("Evolved land-fish or mirage?") around t=2.8..4.3s
    var mirageAmt = (!s.isTrout)
      ? smoothstep(2.6, 3.2, s.t) * (1 - smoothstep(4.35, 4.9, s.t))
      : 0;

    function drawSeaBreamRig(offsetX, offsetY, alpha, ghostTint) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(offsetX, offsetY);

      // Heat-wave mirage ripples below feet when mirageAmt > 0
      if (ghostTint) {
        ctx.strokeStyle = "rgba(255, 220, 150, 0.55)";
        ctx.lineWidth = 1.6;
        for (var mr = 0; mr < 3; mr++) {
          ctx.beginPath();
          ctx.ellipse(hipX, groundY - 4 - mr * 10, 56 - mr * 8, 5, 0, 0, TAU);
          ctx.stroke();
        }
      }

      // Draw 2 hinged wooden stick-legs with knee pins & sand puffs
      var legs = [
        { ax: hipX - 8, ay: bodyY + 20, fx: footBack.x, fy: footBack.y, shade: "#9e7346" },
        { ax: hipX + 10, ay: bodyY + 20, fx: footFront.x, fy: footFront.y, shade: "#be8d58" }
      ];
      for (var li = 0; li < 2; li++) {
        var lg = legs[li];
        var mx = (lg.ax + lg.fx) * 0.5 + 4;
        var my = (lg.ay + lg.fy) * 0.5 - 3;
        // Stick upper + lower segment
        ctx.strokeStyle = "#181d1b";
        ctx.lineWidth = 7.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(lg.ax, lg.ay);
        ctx.lineTo(mx, my);
        ctx.lineTo(lg.fx, lg.fy);
        ctx.stroke();

        ctx.strokeStyle = ghostTint || lg.shade;
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(lg.ax, lg.ay);
        ctx.lineTo(mx, my);
        ctx.lineTo(lg.fx, lg.fy);
        ctx.stroke();

        // Brass knee pin joint
        ctx.fillStyle = "#e0b864";
        ctx.beginPath();
        ctx.arc(mx, my, 3.2, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#181d1b";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Sea Bream body (rose-silver iridescent Mind Game ink contour!)
      ctx.save();
      ctx.translate(hipX, bodyY);
      var swagger = Math.sin(phase * Math.PI) * 0.05 * (1 - poseHold) - poseHold * 0.08;
      ctx.rotate(swagger);

      // Spiky dorsal fin
      ctx.fillStyle = ghostTint || "#d99b96";
      ctx.strokeStyle = "#171c1c";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-26, -18);
      ctx.lineTo(-10, -44);
      ctx.lineTo(2, -34);
      ctx.lineTo(14, -36);
      ctx.lineTo(26, -24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Forked tail fin (left)
      var tailFlick = Math.sin(s.tCont * 6.2) * 0.12;
      ctx.save();
      ctx.translate(-68, 2);
      ctx.rotate(tailFlick);
      ctx.fillStyle = ghostTint || "#d5958f";
      ctx.beginPath();
      ctx.moveTo(6, -6);
      ctx.lineTo(-26, -28);
      ctx.quadraticCurveTo(-14, 0, -24, 26);
      ctx.lineTo(6, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Plump Sea Bream oval body
      ctx.beginPath();
      ctx.moveTo(68, -4);
      ctx.bezierCurveTo(56, -34, -18, -36, -68, -5);
      ctx.lineTo(-68, 8);
      ctx.bezierCurveTo(-18, 36, 48, 34, 66, 8);
      ctx.closePath();
      var breamG = ctx.createLinearGradient(0, -34, 0, 32);
      breamG.addColorStop(0, ghostTint || "#6e857e");
      breamG.addColorStop(0.38, ghostTint || "#e8c4be");
      breamG.addColorStop(0.75, ghostTint || "#f7e7e2");
      breamG.addColorStop(1, ghostTint || "#cf9c96");
      ctx.fillStyle = breamG;
      ctx.fill();
      ctx.lineWidth = 2.3;
      ctx.stroke();

      // Hand-inked scale arcs
      ctx.strokeStyle = "rgba(35, 48, 46, 0.42)";
      ctx.lineWidth = 1.2;
      for (var sr = 0; sr < 3; sr++) {
        for (var sc = -3; sc <= 2; sc++) {
          ctx.beginPath();
          ctx.arc(sc * 14 + (sr % 2) * 7, -14 + sr * 8, 4.5, -0.8, 0.8);
          ctx.stroke();
        }
      }

      // Gill curve & cool deadpan mouth
      ctx.strokeStyle = "#1a2020";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(30, 2, 18, 1.9, 4.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(66, 4);
      ctx.quadraticCurveTo(53, 2, 47, 9);
      ctx.stroke();

      // Articulated Pectoral Fin (reaches up to tip sunglasses during poseHold!)
      ctx.save();
      ctx.translate(10, 10);
      ctx.rotate(poseHold > 0.2 ? lerp(0.15, -0.85, poseHold) : Math.sin(phase * TAU) * 0.28);
      ctx.fillStyle = ghostTint || "#e2a7a0";
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.quadraticCurveTo(-22, 2, -26, 12);
      ctx.quadraticCurveTo(-8, 14, 4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Wayfarer Sunglasses (tilts down slightly at t~4.0s to reveal winking eye!)
      var glassesDip = poseHold * 6;
      if (poseHold > 0.25) {
        ctx.fillStyle = "#fff9e6";
        ctx.beginPath();
        ctx.arc(44, -13, 5, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(45.5, -13, 2.3, 0, TAU);
        ctx.fill();
      }
      ctx.save();
      ctx.translate(48, -11 + glassesDip);
      ctx.rotate(poseHold * 0.16);
      // Temple arm
      ctx.strokeStyle = "#111517";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(-26, 2);
      ctx.lineTo(-2, -2);
      ctx.stroke();
      // Left & right dark lenses
      ctx.fillStyle = "#171d22";
      roundRectPath(ctx, -4, -7, 17, 13, 3);
      ctx.fill();
      ctx.stroke();
      roundRectPath(ctx, 16, -8, 14, 12, 3);
      ctx.fill();
      ctx.stroke();
      // Glint slash on sunglasses
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(6, 3);
      ctx.moveTo(19, -5);
      ctx.lineTo(24, 1);
      ctx.stroke();
      ctx.restore();

      ctx.restore();
      ctx.restore();
    }

    if (mirageAmt > 0.02) {
      drawSeaBreamRig(Math.sin(s.tCont * 16) * 14 + 12, -8, mirageAmt * 0.46, "rgba(130, 245, 232, 0.85)");
    }
    drawSeaBreamRig(0, 0, 1.0, null);

    // Act 3 ("Trout Looks In": "Legless bird wheelchair or soup can?")
    if (s.isTrout) {
      var u3 = smoothstep(5.6, 6.6, s.t);
      var soupPhase = smoothstep(7.6, 8.4, s.t);
      if (s.viewMode === "trout" && s.t < 5.6) { u3 = 1.0; soupPhase = 0.5; }

      ctx.save();
      if (soupPhase < 0.85) {
        // 5.6-8.0s (inc. 6.8s strip!): Two large bright spoked wheelchair wheels around legless Turkey's window!
        ctx.globalAlpha = 0.88 * u3 * (1 - soupPhase * 0.85);
        var wheelSpin = s.tCont * 3.8;
        for (var wi = 0; wi < 2; wi++) {
          var wx = CX - 122 + wi * 56;
          var wy = CY + 122;
          ctx.save();
          ctx.translate(wx, wy);
          ctx.rotate(wheelSpin);
          ctx.strokeStyle = "#ffe28a";
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.arc(0, 0, 20, 0, TAU);
          ctx.stroke();
          ctx.lineWidth = 1.8;
          for (var spk2 = 0; spk2 < 4; spk2++) {
            var sa2 = spk2 * (Math.PI / 4);
            ctx.beginPath();
            ctx.moveTo(Math.cos(sa2) * -18, Math.sin(sa2) * -18);
            ctx.lineTo(Math.cos(sa2) * 18, Math.sin(sa2) * 18);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
      if (soupPhase > 0.12) {
        // 7.8-10.0s (inc. 9.2s strip!): Ribbed diner red-and-cream Soup-Can rim & curled pull-tab lid!
        ctx.globalAlpha = 0.9 * soupPhase;
        ctx.save();
        ctx.translate(CX - 106, CY + 108);
        ctx.fillStyle = "#d64535";
        ctx.strokeStyle = "#19201e";
        ctx.lineWidth = 2.2;
        roundRectPath(ctx, -38, -22, 76, 30, 6);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#f7efe0";
        roundRectPath(ctx, -38, 6, 76, 26, 6);
        ctx.fill(); ctx.stroke();
        // Curled tin pull-tab lid on top!
        ctx.strokeStyle = "#dce6e6";
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(-36, -23);
        ctx.quadraticCurveTo(-8, -42, 16, -32);
        ctx.arc(22, -32, 6, Math.PI, TAU + 0.6);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      // Brook Trout swims across from right (6.8s at CX+86) to left-center (9.2s at CX-16) inspecting soup can!
      var troutX = lerp(CX + 92, CX - 16, soupPhase) + Math.sin(s.tCont * 1.8) * 10;
      var troutY = lerp(CY + 38, CY + 56, soupPhase) + Math.cos(s.tCont * 2.1) * 8;
      drawArticulatedBrookTrout(ctx, {
        x: troutX,
        y: troutY,
        scale: 0.95,
        flipX: false,
        pitch: Math.sin(s.tCont * 2.0) * 0.08 + 0.06,
        t: s.tCont,
        mouthOpen: 0.35 + 0.25 * Math.sin(s.tCont * 5),
        waveFin: true,
        lookX: -1.8,
        lookY: 0.9
      });
    }

    ctx.restore();
    drawBallastShelterLip(ctx, s);
    drawVolumetricLampBeam(ctx, s, hipX, CY - 5);
    drawGlassObserverReflection(ctx, s, { tilt: mirageAmt * 0.18 });
  }

  // ============================================================================
  // PORTHOLE #42 · FERRY ("Two pin-jointed elders between twin trees")
  // Nina Paley: This Land Is Mine (2012) · Fixed Bank, New Mark (SCION 16)
  // ============================================================================
  function renderPortal42(ctx, s) {
    drawUnderwaterBackdrop(ctx, s, {
      turkeyTop: "#22656a", turkeyMid: "#3c9a92", turkeyBot: "#1c4d49",
      troutTop: "#267b80", troutMid: "#4eb0a4", troutBot: "#205954"
    });

    // Ballast drops sub sightline into calm water between the fixed twin trunks
    var yShift = lerp(18, -6, s.ballastAmt);
    ctx.save();
    ctx.translate(0, yShift);

    // Distant river bank & mossy green flat between the twin trees
    ctx.fillStyle = "#5f8c6e";
    ctx.beginPath();
    ctx.moveTo(CX - 205, CY + 92);
    ctx.quadraticCurveTo(CX, CY + 78, CX + 205, CY + 92);
    ctx.lineTo(CX + 205, CY + 210);
    ctx.lineTo(CX - 205, CY + 210);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#1b3028";
    ctx.lineWidth = 2;
    ctx.stroke();

    // SCION 16 Invariant: Twin mottled sycamore trunks hold fixed bank X-coordinates!
    function drawSycamoreTrunk(side) {
      ctx.save();
      ctx.translate(CX + side * 126, CY);
      ctx.scale(side, 1);
      ctx.fillStyle = "#d9d1bc";
      ctx.strokeStyle = "#1e2722";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-48, 145);
      ctx.quadraticCurveTo(-24, 30, -34, -185);
      ctx.lineTo(8, -185);
      ctx.quadraticCurveTo(-4, -95, 28, -152);
      ctx.lineTo(36, -138);
      ctx.quadraticCurveTo(-2, -74, 2, 35);
      ctx.quadraticCurveTo(8, 92, 42, 128);
      ctx.lineTo(-48, 145);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sycamore bark camouflage patches
      var patches = [
        [-18, -110, 9, 18], [-12, -55, 11, 22], [-14, 8, 12, 24],
        [-18, 65, 14, 20], [4, 96, 10, 14]
      ];
      ctx.fillStyle = "#7a6d52";
      for (var pi = 0; pi < patches.length; pi++) {
        var p = patches[pi];
        ctx.beginPath();
        ctx.ellipse(p[0], p[1], p[2], p[3], 0.2, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
    drawSycamoreTrunk(-1);
    drawSycamoreTrunk(1);

    // Act 2 Choreography ("Tollbooth ushers or paper cutouts?"):
    // 2.0-3.5s: Elders raise arms like mechanical tollbooth gates holding ticket/coin dish.
    // 3.6-4.7s: Current catches them -> 3D Y-axis paper-cutout turn (cos foreshortening + kraft paper back!).
    var cutoutSpin = 0;
    if (!s.isTrout && s.t >= 3.45 && s.t <= 4.85) {
      cutoutSpin = smoothstep(3.45, 4.05, s.t) * Math.PI * (1 - 0.5 * smoothstep(4.35, 4.85, s.t));
      // Right around t=4.0s (strip sample!), cutoutSpin ~ 0.82*PI so one shows wafer-thin edge/kraft back!
    }
    var tollArmRaise = (!s.isTrout)
      ? Math.sin(s.tCont * 2.6) * 0.35 + 0.55
      : (0.25 + 0.35 * Math.sin(s.tCont * 3.0));
    var ferryBow = s.isTrout ? smoothstep(7.4, 8.6, s.t) * 0.22 : 0;

    function drawPinJointedElder(ex, ey, cfg, spinPhase) {
      var cosW = Math.cos(spinPhase);
      var isBack = cosW < 0;
      var absW = Math.max(0.14, Math.abs(cosW));

      ctx.save();
      ctx.translate(ex, ey);

      // Visible paper-cutout thickness edge & wooden popsicle-stick backing when turned!
      if (absW < 0.82) {
        ctx.fillStyle = "#f2ead4";
        ctx.fillRect(-18 * absW - 4, -84, 5, 168);
        // Popsicle stick spine glued on back
        ctx.fillStyle = "#c99b5e";
        ctx.strokeStyle = "#2b2116";
        ctx.lineWidth = 1.4;
        roundRectPath(ctx, -4, -68, 8, 162, 3);
        ctx.fill();
        ctx.stroke();
      }

      ctx.scale(cosW >= 0 ? absW : -absW, 1);

      // Pin joint rivet helper
      function pinRivet(px, py) {
        ctx.fillStyle = "#dcb360";
        ctx.beginPath();
        ctx.arc(px, py, 4.2, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#1d221e";
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.fillStyle = "#3a2e18";
        ctx.beginPath();
        ctx.arc(px, py, 1.3, 0, TAU);
        ctx.fill();
      }

      var vestCol = isBack ? "#b89f74" : cfg.vest;
      var shirtCol = isBack ? "#cbb58c" : cfg.shirt;
      var pantsCol = isBack ? "#9e8862" : cfg.pants;

      // Legs with hip & knee brass pin-joints
      var legXs = [-11, 11];
      for (var lx = 0; lx < 2; lx++) {
        var hipX = legXs[lx];
        var kneeSwing = Math.sin(s.tCont * 2.2 + lx * Math.PI + cfg.seed) * 0.06;
        ctx.save();
        ctx.translate(hipX, 8);
        ctx.rotate(kneeSwing);
        // Thigh
        ctx.fillStyle = pantsCol;
        ctx.strokeStyle = "#1b211d";
        ctx.lineWidth = 1.8;
        roundRectPath(ctx, -8, -2, 16, 40, 6);
        ctx.fill(); ctx.stroke();
        pinRivet(0, 4);
        // Lower leg
        ctx.translate(0, 36);
        ctx.rotate(-kneeSwing * 0.7);
        roundRectPath(ctx, -7.5, -2, 15, 38, 5);
        ctx.fill(); ctx.stroke();
        pinRivet(0, 2);
        // Shoe
        ctx.fillStyle = isBack ? "#6b5a42" : "#2f3530";
        ctx.beginPath();
        ctx.ellipse(lx === 0 ? -3 : 3, 38, 11, 5.5, 0, 0, TAU);
        ctx.fill(); ctx.stroke();
        ctx.restore();
      }

      // Upper body (bends at waist pin during Act 3 ferry bow!)
      ctx.save();
      ctx.rotate(ferryBow * cfg.bowDir);

      // Torso waistcoat / jacket
      ctx.fillStyle = vestCol;
      ctx.strokeStyle = "#1b211d";
      ctx.lineWidth = 2.0;
      roundRectPath(ctx, -22, -48, 44, 58, 8);
      ctx.fill(); ctx.stroke();

      if (!isBack) {
        // Shirt V-collar
        ctx.fillStyle = shirtCol;
        ctx.beginPath();
        ctx.moveTo(-9, -48);
        ctx.lineTo(9, -48);
        ctx.lineTo(0, -18);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      } else {
        // Stamped kraft-paper cutout lines on back
        ctx.strokeStyle = "rgba(65, 48, 28, 0.45)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(-14, -36); ctx.lineTo(14, -36);
        ctx.moveTo(-14, -12); ctx.lineTo(14, -12);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Articulated Pin-Jointed Arms (Outer arm + Inner tollbooth arm!)
      for (var side = -1; side <= 1; side += 2) {
        var isInner = (side === cfg.innerSide);
        var shAngle = isInner
          ? (-side * (0.25 + tollArmRaise * 0.95))
          : (side * (0.14 + Math.sin(s.tCont * 2 + side) * 0.08));
        var elAngle = isInner ? (-side * 0.35) : (side * 0.12);

        ctx.save();
        ctx.translate(side * 24, -40);
        ctx.rotate(shAngle);
        ctx.fillStyle = shirtCol;
        ctx.strokeStyle = "#1b211d";
        ctx.lineWidth = 1.8;
        roundRectPath(ctx, -6, -4, 12, 28, 5);
        ctx.fill(); ctx.stroke();
        pinRivet(0, 2);

        ctx.translate(0, 24);
        ctx.rotate(elAngle);
        roundRectPath(ctx, -5.5, -3, 11, 26, 5);
        ctx.fill(); ctx.stroke();
        pinRivet(0, 1);

        // Hand + Tollbooth Striped Paddle / Ferry Ticket
        ctx.fillStyle = isBack ? "#cbb58c" : "#ebd0b3";
        ctx.beginPath();
        ctx.arc(0, 25, 5, 0, TAU);
        ctx.fill(); ctx.stroke();

        if (isInner && !isBack && (!s.isTrout || s.t > 7.4)) {
          ctx.save();
          ctx.translate(0, 28);
          ctx.fillStyle = s.isTrout ? "#ffd466" : "#d95338";
          roundRectPath(ctx, -4, 0, 26 * side, 9, 3);
          ctx.fill(); ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      }

      // Elder Head
      ctx.fillStyle = isBack ? "#cbb58c" : "#edd3b8";
      ctx.strokeStyle = "#1b211d";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(0, -68, 15, 18, 0, 0, TAU);
      ctx.fill(); ctx.stroke();

      if (!isBack) {
        // White side-hair / fringe & wise elder brow wrinkles
        ctx.fillStyle = "#e8e6df";
        if (cfg.baldTop) {
          ctx.beginPath();
          ctx.arc(-14, -70, 5, 0, TAU);
          ctx.arc(14, -70, 5, 0, TAU);
          ctx.fill(); ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(0, -73, 15, Math.PI, 0);
          ctx.fill(); ctx.stroke();
        }
        // Eyes & calm expression
        ctx.fillStyle = "#1b211d";
        ctx.beginPath();
        ctx.arc(-5.5, -69, 1.8, 0, TAU);
        ctx.arc(5.5, -69, 1.8, 0, TAU);
        ctx.fill();
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(-5, -59);
        ctx.quadraticCurveTo(0, -57, 5, -59);
        ctx.stroke();
      }
      ctx.restore();
      ctx.restore();
    }

    drawPinJointedElder(CX - 38, CY + 8, {
      vest: "#5c755e", shirt: "#efeadd", pants: "#7a7d66",
      innerSide: 1, bowDir: 1, baldTop: true, seed: 0
    }, cutoutSpin * 0.62);

    drawPinJointedElder(CX + 42, CY + 8, {
      vest: "#7b8064", shirt: "#e6e0ce", pants: "#5e6b62",
      innerSide: -1, bowDir: -1, baldTop: false, seed: 1.7
    }, cutoutSpin);

    // Carved Mossy Boundary Stone in lower-right foreground (SCION 16 benchmark!)
    var stoneWobble = (s.isTrout && s.t >= 5.8 && s.t <= 7.2) ? Math.sin(s.tCont * 18) * 1.8 : 0;
    ctx.save();
    ctx.translate(CX + 62 + stoneWobble, CY + 118);
    ctx.fillStyle = "#8e9d87";
    ctx.strokeStyle = "#192821";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-26, 45);
    ctx.lineTo(-20, -24);
    ctx.arc(2, -22, 22, Math.PI, 0.1);
    ctx.lineTo(28, 45);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Carved heart + benchmark arrow glyph (from p42 reference!)
    ctx.strokeStyle = "#2b3e33";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, -18); ctx.lineTo(-6, -24); ctx.lineTo(0, -21); ctx.lineTo(6, -24); ctx.closePath();
    ctx.moveTo(0, -11); ctx.lineTo(0, 6);
    ctx.moveTo(-8, -2); ctx.lineTo(0, 6); ctx.lineTo(8, -2);
    ctx.stroke();
    ctx.restore();

    drawCreekReeds(ctx, CX + 108, CY + 126, 4, 0.95, s.tCont + 1.2, true, "#2f6e59");

    // Act 3 ("Trout Looks In": "Boundary-stone thief or new ferryboat?")
    if (s.isTrout) {
      var u3 = (s.viewMode === "trout" && s.t < 5.6) ? 0.8 : clamp((s.t - 5.6) / 4.2, 0, 1);
      // 5.6-7.4s (inc. 6.8s strip!): Brook Trout hovers right across the elders & boundary stone guarding it!
      // 7.5-10.0s (inc. 9.2s strip!): Brook Trout glides left toward sub bow with golden ferry pennant!
      var tx = u3 < 0.45
        ? lerp(CX + 135, CX + 28, smoothstep(0, 0.35, u3))
        : lerp(CX + 28, CX - 42, smoothstep(0.45, 0.92, u3));
      var ty = u3 < 0.45 ? CY + 22 : CY + 48 + Math.sin(s.tCont * 2.5) * 6;

      drawArticulatedBrookTrout(ctx, {
        x: tx,
        y: ty,
        scale: 1.05,
        flipX: false,
        pitch: Math.sin(s.tCont * 2.2) * 0.06,
        t: s.tCont,
        mouthOpen: 0.25,
        waveFin: u3 > 0.45
      });

      // After t=7.5s ("or new ferryboat?"), a cheerful brass ferry lantern/flag rises on the lower rim!
      if (u3 > 0.46) {
        var flagPop = smoothstep(0.46, 0.65, u3);
        ctx.save();
        ctx.translate(CX - 102, CY + 138 - flagPop * 28);
        ctx.strokeStyle = "#e6be68";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 32); ctx.lineTo(0, -18);
        ctx.stroke();
        ctx.fillStyle = "#ffd466";
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(28, -10 + Math.sin(s.tCont * 6) * 3);
        ctx.lineTo(0, -2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#1b2622";
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.restore();
    drawBallastShelterLip(ctx, s);
    drawVolumetricLampBeam(ctx, s, CX, CY - 5);
    drawGlassObserverReflection(ctx, s, { tilt: cutoutSpin * 0.06 });
  }

  // ============================================================================
  // PORTHOLE #43 · SNOUT ("Crayon-spotted yellow shark nose on glass")
  // Wes Anderson: The Life Aquatic (2004) · Dollhouse Cutaway (SCION 31)
  // ============================================================================
  function renderPortal43(ctx, s) {
    drawUnderwaterBackdrop(ctx, s, {
      turkeyTop: "#136570", turkeyMid: "#1e9196", turkeyBot: "#14484d",
      troutTop: "#177782", troutMid: "#29a6a6", troutBot: "#185357"
    });

    var yShift = -15 * s.ballastAmt;
    ctx.save();
    ctx.translate(0, yShift);

    // Zissou bioluminescent deep-sea snow motes
    for (var bi = 0; bi < 18; bi++) {
      var bx = CX + ((hash(bi * 9.3) - 0.5) * 340 + Math.sin(s.tCont * 0.7 + bi) * 14);
      var by = CY + ((hash(bi * 3.7) - 0.5) * 310 - (s.tCont * 12) % 60);
      ctx.fillStyle = bi % 3 === 0 ? "rgba(182, 255, 238, 0.5)" : "rgba(255, 240, 178, 0.42)";
      ctx.beginPath();
      ctx.arc(bx, by, 1.6 + (bi % 3) * 0.8, 0, TAU);
      ctx.fill();
    }

    // Stop-motion sculpted sandy seabed & kelp
    ctx.fillStyle = "#6c917c";
    ctx.beginPath();
    ctx.moveTo(CX - 200, CY + 128);
    ctx.quadraticCurveTo(CX - 40, CY + 106, CX + 200, CY + 122);
    ctx.lineTo(CX + 200, CY + 205);
    ctx.lineTo(CX - 200, CY + 205);
    ctx.closePath();
    ctx.fill();
    drawCreekReeds(ctx, CX + 108, CY + 145, 5, 1.25, s.tCont, true, "#2b6c5c");

    // Jaguar Shark choreography:
    // Act 1: Glides in from deep left-back.
    // Act 2a (2.0-3.4s): Presses yellow snout on glass ("Lemon-pepper predator?").
    // Act 2b (3.5-5.5s, inc. 4.0s strip!): Side hatch opens in Wes Anderson SCION 31 Dollhouse Cutaway ("or rescue sub?")!
    // Act 3 (5.6-10.0s): Spotted Brook Trout swims alongside above right; snack crumbs vs synchronized yellow-fish salute!
    var approach = smoothstep(0.2, 2.3, s.t);
    if (s.viewMode !== "auto") approach = 1.0;

    var boopSquash = (!s.isTrout && s.t >= 2.15 && s.t <= 3.35)
      ? Math.sin(clamp((s.t - 2.15) / 1.2, 0, 1) * Math.PI)
      : 0;
    var cutawayAmt = (!s.isTrout)
      ? smoothstep(3.35, 3.75, s.t) * (1 - smoothstep(5.2, 5.55, s.t))
      : 0;

    var sharkX = CX - 18 + (1 - approach) * -55 + (s.isTrout ? -14 : 0) + Math.sin(s.tCont * 1.6) * 6;
    var sharkY = CY + 4 + Math.cos(s.tCont * 1.9) * 7;
    var sharkScale = lerp(0.74, 1.0, approach) * (s.isTrout ? 0.92 : 1.0);
    var tailSwing = Math.sin(s.tCont * 4.2) * 14;

    ctx.save();
    ctx.translate(sharkX, sharkY);
    ctx.scale(sharkScale, sharkScale);

    // Tail & posterior peduncle (left side, curving gracefully in stop-motion perspective)
    ctx.save();
    ctx.translate(-125, -18 + tailSwing * 0.4);
    ctx.rotate(tailSwing * 0.018);
    ctx.fillStyle = "#eca82e";
    ctx.strokeStyle = "#1b1d18";
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(18, -8);
    ctx.lineTo(-42, -52);
    ctx.quadraticCurveTo(-24, -4, -36, 36);
    ctx.lineTo(18, 12);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Tail crayon spots
    ctx.fillStyle = "#563814";
    ctx.beginPath();
    ctx.arc(-16, -24, 4, 0, TAU);
    ctx.arc(-8, -8, 3.5, 0, TAU);
    ctx.arc(-18, 12, 3.8, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Tall Dorsal Fin
    ctx.save();
    ctx.translate(-32, -54);
    ctx.rotate(Math.sin(s.tCont * 3.2) * 0.05);
    ctx.fillStyle = "#f2b233";
    ctx.strokeStyle = "#1b1d18";
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(-26, 12);
    ctx.quadraticCurveTo(-30, -48, -22, -58);
    ctx.quadraticCurveTo(2, -26, 18, 12);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#563814";
    ctx.beginPath();
    ctx.arc(-14, -26, 4.2, 0, TAU);
    ctx.arc(-6, -8, 4.5, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Far (right) pectoral fin
    ctx.fillStyle = "#dfa02c";
    ctx.strokeStyle = "#1b1d18";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(62, 36);
    ctx.lineTo(106, 62 + Math.sin(s.tCont * 3.8) * 6);
    ctx.lineTo(42, 46);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Main Plump Jaguar Shark Body + Yellow Snout!
    var snoutFlat = boopSquash * 10;
    ctx.beginPath();
    ctx.moveTo(-132, -16 + tailSwing * 0.35);
    ctx.bezierCurveTo(-72, -68, 36, -64, 108 - snoutFlat, -4);
    ctx.quadraticCurveTo(118 - snoutFlat * 1.3, 18, 98 - snoutFlat, 38);
    ctx.bezierCurveTo(44, 68, -46, 56, -130, -2 + tailSwing * 0.35);
    ctx.closePath();

    var sharkG = ctx.createLinearGradient(0, -62, 12, 58);
    sharkG.addColorStop(0, "#eb9e24");
    sharkG.addColorStop(0.52, "#f8c84c");
    sharkG.addColorStop(0.76, "#fae8a8");
    sharkG.addColorStop(1, "#f2e5bd");
    ctx.fillStyle = sharkG;
    ctx.fill();
    ctx.strokeStyle = "#1b1d18";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Handmade Wax-Crayon Jaguar Rosettes!
    var rosettes = [
      [-92, -14, 6], [-68, -28, 8], [-42, -40, 8.5], [-12, -42, 9], [18, -36, 8],
      [-74, -6, 7.5], [-46, -14, 9], [-16, -16, 9.5], [14, -14, 8.5], [44, -20, 6.5],
      [-55, 10, 7], [-28, 8, 8]
    ];
    for (var ri = 0; ri < rosettes.length; ri++) {
      var ro = rosettes[ri];
      ctx.strokeStyle = "#4d3110";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.ellipse(ro[0], ro[1], ro[2], ro[2] * 0.72, 0.25, 0.2, TAU - 0.15);
      ctx.stroke();
      ctx.fillStyle = "#c97418";
      ctx.beginPath();
      ctx.arc(ro[0], ro[1], ro[2] * 0.38, 0, TAU);
      ctx.fill();
    }
    // Fine pepper freckles near snout ("Lemon-pepper predator")
    ctx.fillStyle = "#4d3110";
    for (var fp = 0; fp < 10; fp++) {
      ctx.beginPath();
      ctx.arc(46 + (fp % 5) * 10, -24 + Math.floor(fp / 5) * 9, 2.2, 0, TAU);
      ctx.fill();
    }

    // 5 Gill slits
    ctx.strokeStyle = "#3a260e";
    ctx.lineWidth = 2.0;
    for (var gi = 0; gi < 4; gi++) {
      ctx.beginPath();
      ctx.arc(-28 + gi * 6, 12, 16, -0.65, 0.65);
      ctx.stroke();
    }

    // SCION 31: Wes Anderson Dollhouse Cutaway Hatch on the shark's side!
    if (cutawayAmt > 0.02) {
      ctx.save();
      ctx.translate(-34, -8);
      var cw = 64 * cutawayAmt;
      var ch = 36;
      // Warm cross-section rescue-sub cabin interior!
      roundRectPath(ctx, -cw * 0.5, -ch * 0.5, cw, ch, 6);
      ctx.fillStyle = "#2b1c14";
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = "#f4b95b";
      ctx.fillRect(-34, -18, 68, 36);
      // Bulkhead ribs
      ctx.strokeStyle = "#8e4d24";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-12, -18); ctx.lineTo(-12, 18);
      ctx.moveTo(12, -18); ctx.lineTo(12, 18);
      ctx.stroke();
      // Tiny red-and-white Rescue Life Preserver Ring + Cross + Periscope!
      ctx.strokeStyle = "#faf6ec";
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.arc(0, 1, 9, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = "#d43f2b";
      ctx.lineWidth = 4.5;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.arc(0, 1, 9, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      // Tiny brass dials on left compartment
      ctx.fillStyle = "#faf4df";
      ctx.beginPath();
      ctx.arc(-22, -4, 5, 0, TAU);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = "#1b1d18";
      ctx.lineWidth = 2.2;
      roundRectPath(ctx, -cw * 0.5, -ch * 0.5, cw, ch, 6);
      ctx.stroke();
      ctx.restore();
    }

    // Near (left) spotted pectoral fin (waves friendly salute in Act 3!)
    var salute = (s.isTrout && s.t > 7.5) ? Math.sin(s.tCont * 9) * 0.35 - 0.3 : Math.sin(s.tCont * 3.1) * 0.12;
    ctx.save();
    ctx.translate(-32, 32);
    ctx.rotate(salute);
    ctx.fillStyle = "#f4b938";
    ctx.strokeStyle = "#1b1d18";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(12, -4);
    ctx.lineTo(-56, 36);
    ctx.quadraticCurveTo(-18, 38, 22, 10);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#4d3110";
    ctx.beginPath();
    ctx.arc(-14, 16, 4, 0, TAU);
    ctx.arc(-30, 25, 3.5, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Big Expressive Stop-Motion Eye + Nostrils + Smile/Teeth!
    ctx.fillStyle = "#faf4e1";
    ctx.strokeStyle = "#1b1d18";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(8, 2, 11, 13, -0.1, 0, TAU);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#141819";
    ctx.beginPath();
    ctx.arc(10, 2, 7, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(12.5, -2, 2.8, 0, TAU);
    ctx.fill();

    // Nostrils & Mouth
    ctx.fillStyle = "#2d2010";
    ctx.beginPath();
    ctx.arc(54 - snoutFlat * 0.5, 11, 2.6, 0, TAU);
    ctx.arc(98 - snoutFlat, 13, 2.2, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = "#1b1d18";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(30, 24);
    ctx.quadraticCurveTo(64, 42 - boopSquash * 4, 92 - snoutFlat, 28);
    ctx.stroke();

    // Brief predator teeth flash at t=2.2..3.3s vs warm Zissou smile after!
    if (boopSquash > 0.25) {
      ctx.fillStyle = "#fffdf5";
      for (var ti = 0; ti < 4; ti++) {
        var txp = 44 + ti * 11;
        ctx.beginPath();
        ctx.moveTo(txp, 31);
        ctx.lineTo(txp + 4, 38);
        ctx.lineTo(txp + 8, 32);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      }
    }

    // Concentric glass-boop ring when nose presses on porthole glass!
    if (boopSquash > 0.1) {
      ctx.strokeStyle = "rgba(255, 250, 220, " + (boopSquash * 0.65).toFixed(3) + ")";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(98 - snoutFlat, 18, 14 + boopSquash * 16, 22 + boopSquash * 18, 0, 0, TAU);
      ctx.stroke();
    }

    ctx.restore();

    // Act 3 ("Trout Looks In": "Canned snack dispenser or fellow yellow fish?")
    if (s.isTrout) {
      var u3 = (s.viewMode === "trout" && s.t < 5.6) ? 0.7 : clamp((s.t - 5.6) / 4.2, 0, 1);

      // 5.8-7.4s (inc. 6.8s strip!): Golden snack pellets/crumbs bubble up from tin seam while Brook Trout nibbles!
      if (u3 < 0.55) {
        for (var ci = 0; ci < 5; ci++) {
          var cu = ((s.tCont * 0.9 + ci * 0.21) % 1);
          var cxp = lerp(CX - 70, CX + 65, cu);
          var cyp = lerp(CY + 135, CY - 45, cu) + Math.sin(cu * 9 + ci) * 8;
          ctx.fillStyle = "#ffd66b";
          ctx.strokeStyle = "#3a2910";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(cxp, cyp, 4.8, 0, TAU);
          ctx.fill(); ctx.stroke();
        }
      } else {
        // 7.5-10.0s (inc. 9.2s strip!): Warm yellow hull reflection halo ("or fellow yellow fish?")
        ctx.strokeStyle = "rgba(255, 218, 92, 0.55)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(CX, CY, 168 + Math.sin(s.tCont * 5) * 4, 0, TAU);
        ctx.stroke();
      }

      // Spotted Brook Trout swimming in upper-right companion formation (matching p43!)
      var btx = CX + 92 + Math.sin(s.tCont * 2.1) * 16 - (u3 > 0.55 ? 18 : 0);
      var bty = CY - 56 + Math.cos(s.tCont * 2.5) * 10 + (u3 < 0.5 ? 18 : -4);
      drawArticulatedBrookTrout(ctx, {
        x: btx,
        y: bty,
        scale: 0.78,
        flipX: false,
        pitch: u3 > 0.55 ? Math.sin(s.tCont * 5) * 0.14 : 0.18,
        t: s.tCont,
        mouthOpen: u3 < 0.55 ? 0.55 : 0.15,
        waveFin: u3 > 0.55
      });
    }

    ctx.restore();
    drawBallastShelterLip(ctx, s);
    drawVolumetricLampBeam(ctx, s, sharkX + 25, sharkY);
    drawGlassObserverReflection(ctx, s, { tilt: -boopSquash * 0.22 });
  }

  // ============================================================================
  // PORTHOLE #44 · ROTOR ("Spinning black-and-white spiral word disc")
  // Marcel Duchamp: Anémic cinéma (1926) · Rotating Type & Depth (Oucipo)
  // ============================================================================
  function renderPortal44(ctx, s) {
    drawUnderwaterBackdrop(ctx, s, {
      turkeyTop: "#164f56", turkeyMid: "#247478", turkeyBot: "#12383c",
      troutTop: "#1b626b", troutMid: "#2f8c8f", troutBot: "#164247"
    });

    var yShift = -14 * s.ballastAmt;
    ctx.save();
    ctx.translate(0, yShift);

    drawCreekReeds(ctx, CX - 146, CY + 112, 4, 1.0, s.tCont, false, "#285f52");
    drawCreekReeds(ctx, CX + 144, CY + 118, 4, 1.05, s.tCont + 1.0, true, "#2c6859");

    // Duchamp Rotorelief rotation angle:
    // Accelerates when Lamp turns on at t=1.0s; clicks like a diner prize wheel in Act 3!
    var baseSpeed = lerp(0.8, 3.1, s.lampAmt);
    var wheelAngle = s.tCont * baseSpeed;
    if (s.isTrout && s.t >= 5.8 && s.t <= 7.8) {
      // Decelerating carnival/diner prize-wheel ratchet steps!
      var uWheel = clamp((s.t - 5.8) / 2.0, 0, 1);
      wheelAngle = 14.0 + (1 - Math.pow(1 - uWheel, 2.4)) * 9.5;
    }

    var discR = 136;
    var discY = CY - 4;

    // Act 2a (2.0-3.7s): Whirlpool turbine vortex streams pulling into disc
    if (!s.isTrout && s.t >= 1.8) {
      ctx.save();
      ctx.strokeStyle = "rgba(186, 246, 238, 0.42)";
      ctx.lineWidth = 2.0;
      for (var va = 0; va < 5; va++) {
        ctx.beginPath();
        for (var vr = 165; vr >= 28; vr -= 12) {
          var vang = va * (TAU / 5) - s.tCont * 3.4 + (165 - vr) * 0.018;
          var vx = CX + Math.cos(vang) * vr;
          var vy = discY + Math.sin(vang) * vr;
          if (vr === 165) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // Duchamp Eccentric Rotorelief Disc (true 3D cone depth illusion from nested eccentric circles!)
    ctx.save();
    ctx.translate(CX, discY);
    ctx.rotate(wheelAngle);

    // Outer bone-white card disc
    ctx.fillStyle = "#f4efe0";
    ctx.strokeStyle = "#141819";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(0, 0, discR, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, discR - 3, 0, TAU);
    ctx.clip();

    // 14 nested eccentric alternating black & ivory circles (Duchamp 1926 geometry!)
    var rings = 14;
    for (var ri = 0; ri < rings; ri++) {
      var uRing = ri / rings;
      var rr = lerp(discR - 5, 16, uRing);
      var ecc = Math.sin(uRing * Math.PI) * 20;
      var eAng = ri * 0.52;
      var ecx = Math.cos(eAng) * ecc;
      var ecy = Math.sin(eAng) * ecc;
      ctx.fillStyle = ri % 2 === 0 ? "#15191b" : "#f5f0e1";
      ctx.beginPath();
      ctx.arc(ecx, ecy, rr, 0, TAU);
      ctx.fill();
    }

    // Oucipo Spiral Word Ring ("Anémic cinéma" radial typographic ticks / letterforms)
    var spiralText = s.showCaptions
      ? "BASSIN · BATEAU · BOUÉE · TRUITE · TOURBILLON · "
      : "▪ ▫ ▪ ▫ ▪ ▫ ▪ ▫ ▪ ▫ ▪ ▫ ▪ ▫ ▪ ▫ ▪ ▫ ▪ ▫ ▪ ▫ ";
    ctx.fillStyle = "#d94f30";
    ctx.font = "700 10.5px Georgia, serif";
    for (var ci = 0; ci < spiralText.length; ci++) {
      var cAng = (ci / spiralText.length) * TAU;
      var cRad = 96 - (ci / spiralText.length) * 14;
      ctx.save();
      ctx.rotate(cAng);
      ctx.translate(0, -cRad);
      ctx.fillText(spiralText.charAt(ci), -3, 0);
      ctx.restore();
    }

    // Act 3a (5.7-7.8s, inc. 6.8s strip!): Diner Pie-Prize Wheel colored wedge overlay!
    if (s.isTrout && s.t < 7.9) {
      var pieCols = ["rgba(217,75,56,0.34)", "rgba(242,193,78,0.34)", "rgba(58,166,155,0.34)"];
      for (var pw = 0; pw < 6; pw++) {
        ctx.fillStyle = pieCols[pw % 3];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, discR - 4, pw * (TAU / 6), (pw + 0.5) * (TAU / 6));
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore(); // end disc clip

    // Rim pegs for prize-wheel clapper
    for (var pg = 0; pg < 12; pg++) {
      var pa = pg * (TAU / 12);
      ctx.fillStyle = "#d6ad58";
      ctx.beginPath();
      ctx.arc(Math.cos(pa) * (discR - 4), Math.sin(pa) * (discR - 4), 2.8, 0, TAU);
      ctx.fill();
    }
    ctx.restore(); // end rotating disc

    // Act 2b (3.6-5.5s, inc. 4.0s strip!): Hypnosis Trap pulsing concentric violet/amber rings!
    var hypnoAmt = (!s.isTrout) ? smoothstep(3.4, 3.85, s.t) * (1 - smoothstep(5.15, 5.55, s.t)) : 0;
    if (hypnoAmt > 0.02) {
      ctx.save();
      for (var hr = 0; hr < 3; hr++) {
        var hp = ((s.tCont * 1.1 + hr * 0.33) % 1);
        var hRad = lerp(24, 155, hp);
        ctx.strokeStyle = "rgba(255, 198, 105, " + ((1 - hp) * 0.65 * hypnoAmt).toFixed(3) + ")";
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.arc(CX, discY, hRad, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Rusted Iron & Weathered Timber A-Frame Axle Stand (faithful to p44 reference!)
    ctx.save();
    ctx.translate(CX, discY);
    // Timber legs
    ctx.fillStyle = "#917048";
    ctx.strokeStyle = "#171c1c";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-16, 4); ctx.lineTo(-76, 188); ctx.lineTo(-44, 188); ctx.lineTo(-2, 22);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(16, 4); ctx.lineTo(76, 188); ctx.lineTo(44, 188); ctx.lineTo(2, 22);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Rusted iron crossbar & central bearing cap
    ctx.fillStyle = "#5f6865";
    roundRectPath(ctx, -56, 68, 112, 22, 4);
    ctx.fill(); ctx.stroke();
    // Rust patches & rivets
    ctx.fillStyle = "#9c5333";
    ctx.beginPath();
    ctx.arc(-22, 79, 6, 0, TAU);
    ctx.arc(26, 76, 5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#333b39";
    ctx.beginPath();
    ctx.arc(-38, 79, 4.2, 0, TAU);
    ctx.arc(38, 79, 4.2, 0, TAU);
    ctx.fill(); ctx.stroke();

    // Central axle hub
    ctx.fillStyle = "#525b58";
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, TAU);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#8a9490";
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, TAU);
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // Act 3 ("Trout Looks In": "Diner pie-prize wheel or washing machine?")
    if (s.isTrout) {
      // Clicking brass prize-wheel pointer clapper at 12-o'clock top of disc!
      var flapperKick = Math.abs(Math.sin(wheelAngle * 6)) * (s.t < 7.8 ? -0.35 : 0);
      ctx.save();
      ctx.translate(CX, discY - discR - 10);
      ctx.rotate(flapperKick);
      ctx.fillStyle = "#e8b856";
      ctx.strokeStyle = "#181d1c";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-9, -8); ctx.lineTo(9, -8); ctx.lineTo(0, 18);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();

      // At t >= 7.8s (inc. 9.2s strip!): Washing-machine soap suds & tumbling red gingham cloth inside porthole!
      if (s.t >= 7.75) {
        var sudAmt = smoothstep(7.75, 8.25, s.t);
        ctx.save();
        ctx.globalAlpha = sudAmt * 0.85;
        // Tumbling red sock / gingham napkin in wash cycle
        ctx.save();
        ctx.translate(CX - 72, CY + 58);
        ctx.rotate(s.tCont * 3.8);
        ctx.fillStyle = "#d64937";
        ctx.strokeStyle = "#1d1a18";
        ctx.lineWidth = 1.8;
        roundRectPath(ctx, -18, -10, 36, 20, 6);
        ctx.fill(); ctx.stroke();
        ctx.restore();

        // Frothy soap sud bubbles along bottom-left curve of glass
        for (var sb = 0; sb < 16; sb++) {
          var sba = lerp(0.55, 2.55, sb / 15) + Math.sin(s.tCont * 2 + sb) * 0.04;
          var sbr = 152 - (sb % 3) * 14;
          var sbx = CX + Math.cos(sba) * sbr;
          var sby = CY + Math.sin(sba) * sbr;
          ctx.fillStyle = "rgba(244, 252, 255, 0.72)";
          ctx.strokeStyle = "rgba(130, 210, 225, 0.85)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(sbx, sby, 8 + (sb % 4) * 3.5, 0, TAU);
          ctx.fill(); ctx.stroke();
        }
        ctx.restore();
      }

      // Brook Trout at right rim of the wheel (matching p44!)
      var btx = CX + 132 + Math.sin(s.tCont * 2.2) * 10;
      var bty = CY - 8 + (s.t >= 7.75 ? 28 : -4) + Math.cos(s.tCont * 2.6) * 8;
      drawArticulatedBrookTrout(ctx, {
        x: btx,
        y: bty,
        scale: 0.86,
        flipX: false,
        pitch: s.t >= 7.75 ? 0.16 : -0.05,
        t: s.tCont,
        mouthOpen: 0.3,
        waveFin: s.t < 7.75
      });
    }

    ctx.restore();
    drawBallastShelterLip(ctx, s);
    drawVolumetricLampBeam(ctx, s, CX, discY);
    drawGlassObserverReflection(ctx, s, { spiralEye: hypnoAmt > 0.35, tilt: hypnoAmt * 0.14 });
  }

  // ============================================================================
  // PORTHOLE #45 · EXTRUDER ("Plastic funnel sucking baster into pellets")
  // Resnais & Queneau: Chant du styrène (1958) · Reverse Manufacture (Outrapo)
  // ============================================================================
  function renderPortal45(ctx, s) {
    drawUnderwaterBackdrop(ctx, s, {
      turkeyTop: "#1c5e63", turkeyMid: "#338f8c", turkeyBot: "#1a4847",
      troutTop: "#207177", troutMid: "#43a5a0", troutBot: "#1e5351"
    });

    // Ballast aligns sub eye-level with the suspended plastic funnel
    var yShift = lerp(24, -4, s.ballastAmt);
    ctx.save();
    ctx.translate(0, yShift);

    // Creek floor & rocks
    ctx.fillStyle = "#3f746a";
    ctx.beginPath();
    ctx.moveTo(CX - 200, CY + 88);
    ctx.quadraticCurveTo(CX - 30, CY + 76, CX + 200, CY + 92);
    ctx.lineTo(CX + 200, CY + 210);
    ctx.lineTo(CX - 200, CY + 210);
    ctx.closePath();
    ctx.fill();
    drawCreekReeds(ctx, CX - 140, CY + 95, 4, 1.0, s.tCont, false, "#2c6658");
    drawCreekReeds(ctx, CX + 130, CY + 128, 5, 1.15, s.tCont + 0.7, true, "#2f6e5c");

    // Rhythmic extruder chug pulse!
    var reverseFlow = (s.isTrout && s.t >= 7.75); // At t>=7.75s ("or gravel vacuum?"), sucks pellets backward!
    var chugPhase = s.tCont * 2.8;
    var chug = Math.sin(chugPhase * TAU);
    var funnelX = CX - 18;
    var funnelY = CY - 8 + chug * 3.5;
    var funnelTilt = (!s.isTrout && s.t >= 4.4 && s.t <= 5.4) ? 0.14 : -0.06;

    // Two taut vertical suspension wires from top of porthole to funnel eye-hooks!
    ctx.strokeStyle = "#141d1c";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(funnelX - 38, CY - 210);
    ctx.lineTo(funnelX - 38, funnelY - 64);
    ctx.moveTo(funnelX + 48, CY - 210);
    ctx.lineTo(funnelX + 48, funnelY - 18);
    ctx.stroke();

    // Turkey Baster feeding into the wide left mouth of the funnel (Outrapo Reverse Manufacture!)
    // Cycles smoothly so at t=4.0s strip the baster bulb & glass tube are half-drawn into the mouth with suction streamlines!
    var feedU = reverseFlow
      ? (1 - ((s.tCont * 0.45) % 1))
      : ((s.tCont * 0.42 + 0.15) % 1);
    var basterDist = lerp(95, 22, feedU);

    ctx.save();
    ctx.translate(funnelX - 42, funnelY - 4);
    ctx.rotate(-0.42);

    // Suction streamlines into funnel mouth
    ctx.strokeStyle = "rgba(218, 250, 246, 0.55)";
    ctx.lineWidth = 2.0;
    for (var sl = -1; sl <= 1; sl++) {
      ctx.beginPath();
      ctx.moveTo(-basterDist - 52, sl * 18 + Math.sin(s.tCont * 7 + sl) * 4);
      ctx.quadraticCurveTo(-basterDist * 0.5, sl * 8, 6, sl * 4);
      ctx.stroke();
    }

    // Clear glass baster tube with measurement ticks
    ctx.save();
    ctx.translate(-basterDist, 0);
    ctx.fillStyle = "rgba(225, 244, 244, 0.72)";
    ctx.strokeStyle = "#182221";
    ctx.lineWidth = 2.0;
    roundRectPath(ctx, -28, -9, 78, 18, 5);
    ctx.fill(); ctx.stroke();
    // Measurement ticks
    ctx.lineWidth = 1.2;
    for (var mt = 0; mt < 5; mt++) {
      ctx.beginPath();
      ctx.moveTo(-16 + mt * 11, -7);
      ctx.lineTo(-16 + mt * 11, -1);
      ctx.stroke();
    }
    // Red rubber squeeze bulb (squashes with chug!)
    var bulbSquash = 1 + chug * 0.08;
    ctx.save();
    ctx.translate(-48, 0);
    ctx.scale(bulbSquash, 1 / bulbSquash);
    var bulbG = ctx.createRadialGradient(-8, -8, 4, 0, 0, 32);
    bulbG.addColorStop(0, "#f0856e");
    bulbG.addColorStop(0.6, "#cf533e");
    bulbG.addColorStop(1, "#8e3122");
    ctx.fillStyle = bulbG;
    ctx.beginPath();
    ctx.ellipse(-6, 0, 28, 24, 0, 0, TAU);
    ctx.fill(); ctx.stroke();
    // Collar ring
    ctx.fillStyle = "#bc4936";
    roundRectPath(ctx, 14, -13, 10, 26, 4);
    ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.restore();
    ctx.restore();

    // Coral-Orange Plastic Funnel + Brass Extruder Nozzle (squashes & stretches on chug!)
    ctx.save();
    ctx.translate(funnelX, funnelY);
    ctx.rotate(funnelTilt);

    // Dark interior mouth opening
    ctx.fillStyle = "#8a3628";
    ctx.strokeStyle = "#181d1c";
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.ellipse(-38, 0, 17, 58 + chug * 3, 0, 0, TAU);
    ctx.fill(); ctx.stroke();

    // Glossy Coral-Orange Funnel Cone
    var coneSwell = chug * 4;
    var funG = ctx.createLinearGradient(0, -58, 0, 58);
    funG.addColorStop(0, "#f59b7c");
    funG.addColorStop(0.45, "#ea6f52");
    funG.addColorStop(1, "#b4452e");
    ctx.fillStyle = funG;
    ctx.beginPath();
    ctx.moveTo(-34, -58 - coneSwell * 0.5);
    ctx.quadraticCurveTo(8, -32 - coneSwell, 44, -14);
    ctx.lineTo(44, 14);
    ctx.quadraticCurveTo(8, 32 + coneSwell, -34, 58 + coneSwell * 0.5);
    ctx.ellipse(-34, 0, 11, 58 + coneSwell * 0.5, 0, Math.PI * 0.5, -Math.PI * 0.5, true);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    //Rolled Funnel Lip Rim + Suspension Eyelets
    ctx.fillStyle = "#f27f63";
    ctx.beginPath();
    ctx.ellipse(-38, 0, 17, 60 + coneSwell * 0.5, 0, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.ellipse(-33, 0, 12, 54 + coneSwell * 0.5, 0, Math.PI * 0.5, -Math.PI * 0.5, true);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Brass Nozzle Collar & Extruder Tip
    ctx.fillStyle = "#d9af57";
    roundRectPath(ctx, 42, -17, 15, 34, 4);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(57, -11);
    ctx.lineTo(84, -5);
    ctx.lineTo(84, 5);
    ctx.lineTo(57, 11);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Wire eye rings
    ctx.strokeStyle = "#181d1c";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(-38, -64, 4.5, 0, TAU);
    ctx.arc(48, -21, 4.5, 0, TAU);
    ctx.stroke();
    ctx.restore();

    // Stream of Glossy Multi-Colored Styrene Pellets (Chant du styrène palette!)
    var pelletColors = ["#e24c3b", "#f3c846", "#3da89c", "#f5efe0"];
    var numPellets = 11;
    for (var pi = 0; pi < numPellets; pi++) {
      var pu = reverseFlow
        ? (1 - ((s.tCont * 0.55 + pi / numPellets) % 1))
        : ((s.tCont * 0.55 + pi / numPellets) % 1);
      var px = funnelX + 90 + Math.sin(pu * Math.PI * 1.15) * 86;
      var py = funnelY - pu * 112 + Math.cos(pu * 9 + pi) * 7;
      var pr = (8.5 + (pi % 3) * 1.5) * smoothstep(0, 0.08, pu);

      ctx.fillStyle = pelletColors[pi % pelletColors.length];
      ctx.strokeStyle = "#18201f";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, TAU);
      ctx.fill(); ctx.stroke();
      // Specular bead highlight
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath();
      ctx.arc(px - pr * 0.32, py - pr * 0.32, pr * 0.28, 0, TAU);
      ctx.fill();
    }

    // Act 2b (4.4-5.4s): Hull-recycler foil curl tugged from sub rim!
    if (!s.isTrout && s.t >= 4.35 && s.t <= 5.45) {
      ctx.strokeStyle = "#c8d6d8";
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(CX - 140, CY + 115);
      ctx.quadraticCurveTo(CX - 95, CY + 62, funnelX - 46, funnelY + 24);
      ctx.stroke();
    }

    // Act 3 ("Trout Looks In": "Bubble-blowing toy or gravel vacuum?")
    if (s.isTrout) {
      var btx = reverseFlow
        ? CX + 48 + Math.sin(s.tCont * 2.4) * 10
        : CX + 64 + Math.sin(s.tCont * 2.2) * 14;
      var bty = reverseFlow
        ? CY + 78
        : CY + 54 + Math.cos(s.tCont * 2.8) * 12;

      // When reverseFlow ("gravel vacuum" at t>=7.75s, inc. 9.2s strip!), gravel pebbles lift toward nozzle & ballast intake!
      if (reverseFlow) {
        ctx.strokeStyle = "rgba(210, 248, 240, 0.6)";
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(CX + 95, CY + 108);
        ctx.quadraticCurveTo(CX + 85, CY + 35, funnelX + 86, funnelY);
        ctx.moveTo(CX - 40, CY + 125);
        ctx.lineTo(CX, CY + 162);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      drawArticulatedBrookTrout(ctx, {
        x: btx,
        y: bty,
        scale: 0.96,
        flipX: false,
        pitch: reverseFlow ? -0.06 : -0.22,
        t: s.tCont,
        mouthOpen: 0.4,
        waveFin: !reverseFlow
      });
    }

    ctx.restore();
    drawBallastShelterLip(ctx, s);
    drawVolumetricLampBeam(ctx, s, funnelX + 20, funnelY);
    drawGlassObserverReflection(ctx, s, { tilt: chug * 0.06 });
  }

  // ============================================================================
  // SETUP A BREAD-TIN COCKPIT & EDITORIAL STORY STRIP
  // ============================================================================
  function drawSetupACockpitAndStrip(ctx, meta, s) {
    var H_COCKPIT = s.showCaptions ? 536 : 720;

    // 1. Porthole Glass Dusk Murk, Cut Flash & Specular Glaze (inside glass circle)
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS, 0, TAU);
    ctx.clip();

    // Lower internal submarine lamp hood inside bottom of glass
    ctx.fillStyle = "#5c4827";
    ctx.strokeStyle = "#18140d";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(CX, CY + 188, 32, Math.PI, 0);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = s.lampAmt > 0.1 ? "#ffe08a" : "#303e3f";
    ctx.beginPath();
    ctx.ellipse(CX, CY + 182, 22, 8, 0, 0, TAU);
    ctx.fill(); ctx.stroke();

    // Act 1 pre-operation dusk murk
    if (s.murkAmt > 0.01) {
      ctx.fillStyle = "rgba(9, 24, 28, " + s.murkAmt.toFixed(3) + ")";
      ctx.fillRect(CX - R_GLASS, CY - R_GLASS, R_GLASS * 2, R_GLASS * 2);
    }

    // Concave glass inner shadow & crisp curved 10-o'clock glass reflection arc
    var vig = ctx.createRadialGradient(CX, CY, R_GLASS * 0.65, CX, CY, R_GLASS);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(6, 18, 20, 0.42)");
    ctx.fillStyle = vig;
    ctx.fillRect(CX - R_GLASS, CY - R_GLASS, R_GLASS * 2, R_GLASS * 2);

    ctx.strokeStyle = "rgba(245, 252, 250, 0.34)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS - 15, -2.55, -1.82);
    ctx.stroke();

    if (s.cutFlash > 0.02) {
      ctx.fillStyle = "rgba(225, 252, 246, " + (s.cutFlash * 0.45).toFixed(3) + ")";
      ctx.fillRect(CX - R_GLASS, CY - R_GLASS, R_GLASS * 2, R_GLASS * 2);
    }
    ctx.restore();

    // 2. Bread-Roll Tin Hull Mask AROUND the Porthole (y = 0..H_COCKPIT)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 1280, H_COCKPIT);
    ctx.arc(CX, CY, R_GLASS, 0, TAU, true);
    ctx.clip("evenodd");

    // Deep baked bread-tin interior wall (#132427) + warm amber ceiling wash
    var wallG = ctx.createRadialGradient(CX, 40, 40, CX, 290, 720);
    wallG.addColorStop(0, "#1f373b");
    wallG.addColorStop(0.55, "#132427");
    wallG.addColorStop(1, "#0b1618");
    ctx.fillStyle = wallG;
    ctx.fillRect(0, 0, 1280, H_COCKPIT);

    // Subtle vertical stamped bread-tin fluting ribs
    ctx.strokeStyle = "rgba(255, 255, 255, 0.026)";
    ctx.lineWidth = 2;
    for (var rx = 90; rx < 1200; rx += 64) {
      ctx.beginPath();
      ctx.moveTo(rx, 24);
      ctx.lineTo(rx, 514);
      ctx.stroke();
    }

    // If showCaptions === false (Blind PAELEO Critic Mode), draw pure diegetic lower tin bench (y=536..720) with ZERO text!
    if (!s.showCaptions) {
      var benchG = ctx.createLinearGradient(0, 530, 0, 720);
      benchG.addColorStop(0, "#0e1c1f");
      benchG.addColorStop(0.25, "#231b14");
      benchG.addColorStop(1, "#15100c");
      ctx.fillStyle = benchG;
      ctx.fillRect(0, 530, 1280, 190);
      ctx.strokeStyle = "#3a4f52";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 532); ctx.lineTo(1280, 532);
      ctx.stroke();
      // Wooden River-Works bench grain lines & brass rivets (pure non-textual craft!)
      ctx.strokeStyle = "rgba(237, 180, 115, 0.08)";
      for (var wg = 560; wg < 710; wg += 26) {
        ctx.beginPath();
        ctx.moveTo(40, wg);
        ctx.bezierCurveTo(420, wg - 5, 860, wg + 5, 1240, wg);
        ctx.stroke();
      }
    }

    // Oval Bread-Roll Tin Rolled Seam Outline + Right-Side Dent (Setup A Invariant!)
    ctx.strokeStyle = "#5f8c8b";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(104, 16);
    ctx.lineTo(1176, 16);
    ctx.quadraticCurveTo(1240, 16, 1240, 80);
    ctx.lineTo(1240, 192);
    // Prominent Right-Side Inward Dent!
    ctx.quadraticCurveTo(1210, 256, 1240, 320);
    ctx.lineTo(1240, 460);
    ctx.quadraticCurveTo(1240, 520, 1176, 520);
    ctx.lineTo(104, 520);
    ctx.quadraticCurveTo(40, 520, 40, 460);
    ctx.lineTo(40, 80);
    ctx.quadraticCurveTo(40, 16, 104, 16);
    ctx.stroke();

    // Specular highlight crease on the Right-Side Dent
    ctx.strokeStyle = "#a3dac8";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(1235, 198);
    ctx.quadraticCurveTo(1214, 256, 1235, 314);
    ctx.stroke();

    // Overhead Amber Task-Light Bar (Setup A Invariant)
    ctx.strokeStyle = "#9c7040";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(120, 29);
    ctx.lineTo(590, 18);
    ctx.moveTo(690, 18);
    ctx.lineTo(1160, 29);
    ctx.stroke();

    var taskGlow = ctx.createRadialGradient(CX, 22, 6, CX, 22, 160);
    taskGlow.addColorStop(0, "rgba(255, 202, 118, 0.38)");
    taskGlow.addColorStop(1, "rgba(255, 202, 118, 0)");
    ctx.fillStyle = taskGlow;
    ctx.fillRect(CX - 170, 0, 340, 170);

    ctx.fillStyle = "#edb473";
    ctx.strokeStyle = "#2b1c0e";
    ctx.lineWidth = 1.8;
    roundRectPath(ctx, 590, 11, 100, 16, 8);
    ctx.fill(); ctx.stroke();

    // Top-Right "1 Day of Air" Pressure Dial Gauge (Setup A Invariant)
    var gx = 1126, gy = 92, gr = 32;
    ctx.fillStyle = "#9d7b3e";
    ctx.strokeStyle = "#121c1d";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(gx, gy, gr + 5, 0, TAU);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#f5eed9";
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, TAU);
    ctx.fill(); ctx.stroke();

    // Gauge colored arc & ticks
    ctx.strokeStyle = "#3a8f7a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(gx, gy, gr - 6, Math.PI * 0.8, Math.PI * 1.95);
    ctx.stroke();
    ctx.strokeStyle = "#c94e34";
    ctx.beginPath();
    ctx.arc(gx, gy, gr - 6, Math.PI * 1.95, Math.PI * 2.2);
    ctx.stroke();

    var airNeedleAng = lerp(Math.PI * 1.78, Math.PI * 1.56, s.t / 10) + Math.sin(s.tCont * 4) * 0.02;
    ctx.strokeStyle = "#b83224";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + Math.cos(airNeedleAng) * (gr - 8), gy + Math.sin(airNeedleAng) * (gr - 8));
    ctx.stroke();
    ctx.fillStyle = "#232928";
    ctx.beginPath();
    ctx.arc(gx, gy, 3.8, 0, TAU);
    ctx.fill();

    ctx.restore(); // end hull wall clip

    // 3. Riveted 6-Bolt Antique Brass Porthole Ring + Hinge + Offset Latch + 2-O'Clock Rim Chip!
    ctx.save();
    // Outer brass bezel donut
    var brassG = ctx.createLinearGradient(CX - R_OUTER, CY - R_OUTER, CX + R_OUTER, CY + R_OUTER);
    brassG.addColorStop(0, "#d8b469");
    brassG.addColorStop(0.35, "#a6823e");
    brassG.addColorStop(0.7, "#cfa85b");
    brassG.addColorStop(1, "#6f5322");

    ctx.beginPath();
    ctx.arc(CX, CY, R_OUTER, 0, TAU);
    ctx.arc(CX, CY, R_GLASS, 0, TAU, true);
    ctx.fillStyle = brassG;
    ctx.fill("evenodd");

    ctx.strokeStyle = "#111819";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(CX, CY, R_OUTER, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 240, 190, 0.35)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS + 7, 0, TAU);
    ctx.stroke();

    // Left Cast-Iron Hinge (9 o'clock)
    ctx.fillStyle = "#3b3e3d";
    ctx.strokeStyle = "#101414";
    ctx.lineWidth = 2.4;
    roundRectPath(ctx, CX - R_OUTER - 16, CY - 46, 30, 92, 5);
    ctx.fill(); ctx.stroke();
    roundRectPath(ctx, CX - R_OUTER - 22, CY - 50, 12, 100, 5);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#686d6b";
    ctx.beginPath();
    ctx.arc(CX - R_OUTER + 2, CY - 28, 4.5, 0, TAU);
    ctx.arc(CX - R_OUTER + 2, CY + 28, 4.5, 0, TAU);
    ctx.fill(); ctx.stroke();

    // Right Offset Brass Dog-Latch (3 o'clock)
    ctx.fillStyle = "#b89046";
    ctx.strokeStyle = "#141818";
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, CX + R_OUTER - 18, CY - 34, 22, 68, 8);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#d4ad60";
    ctx.beginPath();
    ctx.moveTo(CX + R_OUTER - 26, CY);
    ctx.lineTo(CX + R_OUTER + 18, CY - 11);
    ctx.lineTo(CX + R_OUTER + 18, CY + 11);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // 2-O'CLOCK RIM CHIP (CRITICAL SETUP A INVARIANT at ~ -22 deg / 2 o'clock!)
    var chipAng = -0.42; // right around 2 o'clock on the rim!
    ctx.save();
    ctx.translate(CX + Math.cos(chipAng) * (R_OUTER - 4), CY + Math.sin(chipAng) * (R_OUTER - 4));
    ctx.rotate(chipAng);
    ctx.fillStyle = "#132427";
    ctx.beginPath();
    ctx.moveTo(8, -14);
    ctx.lineTo(-16, -2);
    ctx.lineTo(-9, 6);
    ctx.lineTo(-18, 12);
    ctx.lineTo(8, 15);
    ctx.closePath();
    ctx.fill();
    // Raw chipped brass fracture facet
    ctx.strokeStyle = "#ffe39c";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(5, -13);
    ctx.lineTo(-15, -2);
    ctx.lineTo(-8, 6);
    ctx.lineTo(-16, 11);
    ctx.stroke();
    ctx.restore();

    // 6 Hexagonal Brass Bolts (faces 1..6) + Glinting Rolled 1d6 Bolt!
    var boltAngles = [-Math.PI / 2, -Math.PI / 6, Math.PI / 6, Math.PI / 2, 5 * Math.PI / 6, -5 * Math.PI / 6];
    for (var bi = 0; bi < 6; bi++) {
      var faceNum = bi + 1;
      var ba = boltAngles[bi];
      var bx = CX + Math.cos(ba) * 205;
      var by = CY + Math.sin(ba) * 205;
      var isRolled = (s.roll === faceNum);

      if (isRolled) {
        var regCol = faceNum <= 2 ? "#42c6b8" : (faceNum <= 4 ? "#8ad879" : "#f0784a");
        ctx.save();
        ctx.translate(bx, by);
        ctx.fillStyle = regCol;
        ctx.globalAlpha = 0.35 + 0.2 * Math.sin(s.tCont * 8);
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#ffe896";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, 17, 0, TAU);
        ctx.stroke();
        // Rotating 4-point specular glint star
        ctx.rotate(s.tCont * 2.5);
        ctx.fillStyle = "#fff8d6";
        ctx.beginPath();
        for (var sp = 0; sp < 8; sp++) {
          var sr = sp % 2 === 0 ? 21 : 4;
          var sa = sp * (Math.PI / 4);
          if (sp === 0) ctx.moveTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
          else ctx.lineTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Dark recessed washer behind hex bolt head so all 6 bolts pop crisply!
      ctx.fillStyle = "rgba(12, 18, 19, 0.65)";
      ctx.beginPath();
      ctx.arc(bx, by + 1.5, 13.5, 0, TAU);
      ctx.fill();

      // Hex bolt head
      ctx.fillStyle = isRolled ? "#fff099" : "#dfc078";
      ctx.strokeStyle = "#111617";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (var hx = 0; hx < 6; hx++) {
        var ha = hx * (TAU / 6) + 0.2;
        var px = bx + Math.cos(ha) * 11.5;
        var py = by + Math.sin(ha) * 11.5;
        if (hx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Inner bolt chamfer circle
      ctx.strokeStyle = isRolled ? "#c98a18" : "#6e5220";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(bx, by, 5.5, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Three Setup A Controls along bottom of cockpit (y = 444..508)
    // (A) Left: Ballast / Single Slot (x = 92..340, y = 446..506)
    ctx.save();
    roundRectPath(ctx, 92, 446, 248, 60, 10);
    ctx.fillStyle = "#0e1d20";
    ctx.fill();
    ctx.strokeStyle = s.ballast ? "#7fd8be" : "#5a8683";
    ctx.lineWidth = s.ballast ? 2.6 : 1.6;
    ctx.stroke();

    // Mechanical slot track + sliding brass ballast weight block
    roundRectPath(ctx, 114, 478, 136, 14, 7);
    ctx.fillStyle = "#091214";
    ctx.fill();
    ctx.strokeStyle = "#355454";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    var balKnobX = lerp(128, 224, s.ballastAmt);
    roundRectPath(ctx, balKnobX - 18, 470, 36, 28, 6);
    ctx.fillStyle = s.ballast ? "#e2b45c" : "#6d8280";
    ctx.fill();
    ctx.strokeStyle = "#101819";
    ctx.lineWidth = 2.0;
    ctx.stroke();
    // Indicator jewel
    ctx.fillStyle = s.ballast ? "#68e8c8" : "#263b3c";
    ctx.beginPath();
    ctx.arc(312, 476, 6.5, 0, TAU);
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // (B) Center: Chalk Chart Under Glass (x = 466..814, y = 448..506)
    ctx.save();
    roundRectPath(ctx, 466, 448, 348, 58, 10);
    ctx.fillStyle = "#102023";
    ctx.fill();
    ctx.strokeStyle = "#6c9c97";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Chalk river banks + progressive chalk route curve + gold verified landmark dot!
    var chartPts = [
      [492, 492], [548, 480], [608, 488], [662, 474], [724, 484], [786, 472]
    ];
    // Faint dashed baseline
    ctx.strokeStyle = "rgba(195, 220, 215, 0.28)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(chartPts[0][0], chartPts[0][1]);
    for (var cp = 1; cp < chartPts.length; cp++) ctx.lineTo(chartPts[cp][0], chartPts[cp][1]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Active drawn chalk line up to s.chartProgress
    var totalSegs = chartPts.length - 1;
    var progSeg = s.chartProgress * totalSegs;
    ctx.strokeStyle = "#f4f1e6";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(chartPts[0][0], chartPts[0][1]);
    var tipX = chartPts[0][0], tipY = chartPts[0][1];
    for (var si2 = 0; si2 < totalSegs; si2++) {
      var segU = clamp(progSeg - si2, 0, 1);
      if (segU > 0) {
        tipX = lerp(chartPts[si2][0], chartPts[si2 + 1][0], segU);
        tipY = lerp(chartPts[si2][1], chartPts[si2 + 1][1], segU);
        ctx.lineTo(tipX, tipY);
      }
    }
    ctx.stroke();

    // Gold landmark dot at t >= 5.6s (Act 3 Trout confirmation!)
    if (s.isTrout || s.chartProgress > 0.55) {
      var dotPop = smoothstep(0.5, 0.85, s.chartProgress);
      ctx.fillStyle = "rgba(255, 212, 102, 0.28)";
      ctx.beginPath();
      ctx.arc(tipX, tipY, 11 * dotPop, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#ffd466";
      ctx.strokeStyle = "#182222";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 5.2 * dotPop, 0, TAU);
      ctx.fill(); ctx.stroke();
    }

    // Glazing diagonal sheen
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(482, 452); ctx.lineTo(512, 502);
    ctx.moveTo(760, 452); ctx.lineTo(790, 502);
    ctx.stroke();
    ctx.restore();

    // (C) Right: Lamp Toggle (x = 940..1188, y = 446..506)
    ctx.save();
    roundRectPath(ctx, 940, 446, 248, 60, 10);
    ctx.fillStyle = "#0e1d20";
    ctx.fill();
    ctx.strokeStyle = s.lamp ? "#f2b866" : "#6c8c88";
    ctx.lineWidth = s.lamp ? 2.6 : 1.6;
    ctx.stroke();

    var swX = 1052, swY = 482;
    ctx.fillStyle = "#be8a46";
    ctx.strokeStyle = "#101819";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(swX, swY, 10, 0, TAU);
    ctx.fill(); ctx.stroke();

    // Toggle bat-handle angle flips from -0.68 rad (OFF left) to +0.68 rad (ON right) at t=1.0s!
    var batAng = lerp(-0.68, 0.68, s.lampAmt);
    ctx.save();
    ctx.translate(swX, swY);
    ctx.rotate(batAng);
    ctx.strokeStyle = "#101819";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, -22);
    ctx.stroke();
    ctx.strokeStyle = "#f7f5ee";
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, -22);
    ctx.stroke();
    ctx.restore();

    // Pilot indicator jewel & contact spark at t=1.0s
    ctx.fillStyle = s.lamp ? "#ffcf70" : "#28393a";
    ctx.beginPath();
    ctx.arc(1154, 476, 6.5, 0, TAU);
    ctx.fill(); ctx.stroke();

    if (meta.defaultTool === "lamp" && Math.abs(s.t - 1.04) < 0.14 && s.viewMode === "auto") {
      ctx.strokeStyle = "#ffe699";
      ctx.lineWidth = 2.0;
      for (var spk = 0; spk < 5; spk++) {
        var ska = -2.4 + spk * 0.45;
        ctx.beginPath();
        ctx.moveTo(swX + Math.cos(ska) * 14, swY - 12 + Math.sin(ska) * 14);
        ctx.lineTo(swX + Math.cos(ska) * 24, swY - 12 + Math.sin(ska) * 24);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 5. Articulated Feathered Turkey Pilot Wing Reaching & Operating the Active Control (Act 1 ~0.4..1.7s)!
    var reachAmt = 0;
    if (s.viewMode === "auto" && s.t < 1.95) {
      reachAmt = smoothstep(0.32, 0.82, s.t) * (1 - smoothstep(1.32, 1.85, s.t));
    }
    var targetCtrlX = meta.defaultTool === "lamp" ? (1046 + s.lampAmt * 14) : (128 + s.ballastAmt * 96);
    var targetCtrlY = meta.defaultTool === "lamp" ? 468 : 482;
    var restWingX = meta.defaultTool === "lamp" ? 1218 : 62;
    var restWingY = 532;

    var wingTipX = lerp(restWingX, targetCtrlX, reachAmt);
    var wingTipY = lerp(restWingY, targetCtrlY, reachAmt);
    var shoulderX = meta.defaultTool === "lamp" ? 1265 : 15;
    var shoulderY = 548;

    if (reachAmt > 0.02) {
      ctx.save();
      var sideSign = meta.defaultTool === "lamp" ? -1 : 1;
      var elbowX = lerp(shoulderX, wingTipX, 0.52) + sideSign * -18;
      var elbowY = lerp(shoulderY, wingTipY, 0.52) + 26;

      // Upper & forearm feathered wing limb
      ctx.strokeStyle = "#1d120c";
      ctx.lineWidth = 26;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(shoulderX, shoulderY);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(wingTipX, wingTipY);
      ctx.stroke();

      ctx.strokeStyle = "#7d492d";
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(shoulderX, shoulderY);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(wingTipX, wingTipY);
      ctx.stroke();

      // Lush fan of 6 barred bronze-and-cream primary wing feathers along wrist & tip!
      var wAng = Math.atan2(wingTipY - elbowY, wingTipX - elbowX);
      ctx.save();
      ctx.translate(wingTipX, wingTipY);
      ctx.rotate(wAng);
      for (var pf = -2; pf <= 3; pf++) {
        ctx.save();
        ctx.rotate((pf - 0.5) * 0.21);
        ctx.fillStyle = pf % 2 === 0 ? "#a8643c" : "#754126";
        ctx.strokeStyle = "#1d120c";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.ellipse(4, 0, 30, 8.2, 0, 0, TAU);
        ctx.fill(); ctx.stroke();
        // Double cream wild-turkey feather barring!
        ctx.strokeStyle = "#f2e4c6";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(12, -6.5); ctx.lineTo(12, 6.5);
        ctx.moveTo(21, -5.0); ctx.lineTo(21, 5.0);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      ctx.restore();
    }

    // 6. Cockpit Callout Labels & Lower Cream Editorial Story Strip (ONLY when showCaptions !== false!)
    if (s.showCaptions) {
      ctx.save();
      // Top-left cockpit stamp
      ctx.font = "600 13px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#edb473";
      ctx.fillText("OVAL BREAD-ROLL TIN · " + meta.station.toUpperCase(), 88, 108);
      ctx.font = "400 12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#9cb8b5";
      ctx.fillText("Setup A · 1 Pilot · 2 River Witnesses", 88, 128);

      // 2-o'clock rim chip pointer line & label
      ctx.strokeStyle = "#8bc2bc";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(CX + 214, CY - 92);
      ctx.lineTo(892, 126);
      ctx.lineTo(1062, 126);
      ctx.stroke();
      ctx.fillStyle = "#a3dac8";
      ctx.font = "500 11.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("2 O'CLOCK RIM CHIP", 896, 118);

      // 1 Day of Air label
      ctx.fillStyle = "#d9c8a9";
      ctx.font = "600 10.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("1 DAY OF AIR", 1126, 142);

      // Control box labels
      ctx.textAlign = "left";
      ctx.fillStyle = s.ballast ? "#a3dac8" : "#8fb0ad";
      ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("BALLAST / SINGLE SLOT", 112, 464);

      ctx.textAlign = "center";
      ctx.fillStyle = "#a9c7c3";
      ctx.fillText("CHALK CHART UNDER GLASS", 640, 465);

      ctx.fillStyle = s.lamp ? "#ffd084" : "#9db5b2";
      ctx.fillText("LAMP TOGGLE", 1064, 464);
      ctx.textAlign = "left";

      // Lower Cream Editorial Story Strip (y = 536..720, #faf8f3)
      ctx.fillStyle = "#faf8f3";
      ctx.fillRect(0, 536, 1280, 184);
      ctx.strokeStyle = "#243538";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 536.75);
      ctx.lineTo(1280, 536.75);
      ctx.stroke();

      var kickerCol, kickerText, mainLine, subLine;
      if (s.act === 1) {
        kickerCol = "#4c5b5e";
        kickerText = meta.station.toUpperCase() + "  ·  ACT I · PILOT OPERATES " + (meta.defaultTool === "lamp" ? "LAMP TOGGLE" : "BALLAST SLOT");
        mainLine = "Rim clue: “" + meta.clue + "”";
        subLine = "Lineage: " + meta.refWork + "  ·  Rule: " + meta.scionRule;
      } else if (s.act === 2) {
        kickerCol = "#9e3d1c"; // Rust for Turkey Looks Out
        kickerText = "FIRST PASS · TURKEY LOOKS OUT (1·3·5)  —  " + meta.station.toUpperCase();
        mainLine = meta.turkeyFork;
        subLine = "Clue: " + meta.clue + "  ·  " + meta.scionRule + " (" + meta.refWork + ")";
      } else {
        kickerCol = "#1d596e"; // Teal for Trout Looks In
        var rollTag = s.roll > 0
          ? ("  ·  ROLLED FACE #" + s.roll + " (" + (s.roll <= 2 ? "PROBABLE" : s.roll <= 4 ? "PLAUSIBLE" : "PREPOSTEROUS") + ")")
          : "";
        kickerText = "SECOND PASS · TROUT LOOKS IN (2·4·6)  —  " + meta.station.toUpperCase() + rollTag;
        mainLine = meta.troutFork;
        subLine = "Verified on Chalk Chart  ·  " + meta.scionRule + " (" + meta.refWork + ")";
      }

      ctx.font = "700 12.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = kickerCol;
      ctx.fillText(kickerText, 64, 570);

      ctx.font = "400 30px Georgia, 'Times New Roman', serif";
      ctx.fillStyle = "#14181a";
      ctx.fillText(mainLine, 64, 614);

      ctx.font = "italic 15.5px Georgia, 'Times New Roman', serif";
      ctx.fillStyle = "#566164";
      ctx.fillText(subLine, 64, 648);

      // Subtle 3-act timeline bar at bottom of cream strip
      var barX = 64, barY = 678, barW = 1152;
      ctx.fillStyle = "#e6e1d5";
      roundRectPath(ctx, barX, barY, barW, 5, 2.5);
      ctx.fill();

      var progW = clamp(s.t / 10.0, 0, 1) * barW;
      ctx.fillStyle = kickerCol;
      roundRectPath(ctx, barX, barY, Math.max(6, progW), 5, 2.5);
      ctx.fill();

      // Act tick dividers at 2.0s (20%) and 5.6s (56%)
      ctx.fillStyle = "#faf8f3";
      ctx.fillRect(barX + barW * 0.20 - 1.5, barY - 1, 3, 7);
      ctx.fillRect(barX + barW * 0.56 - 1.5, barY - 1, 3, 7);

      ctx.restore();
    }
  }

  function buildPortal(meta, drawFn) {
    return {
      id: meta.id,
      station: meta.station,
      clue: meta.clue,
      turkeyFork: meta.turkeyFork,
      troutFork: meta.troutFork,
      scionRule: meta.scionRule,
      defaultTool: meta.defaultTool,
      render: function (ctx, W, H, t, state) {
        var s = resolveSceneState(meta, t, state);
        ctx.save();
        if (W !== 1280 || H !== 720) {
          ctx.scale((W || 1280) / 1280, (H || 720) / 720);
        }

        // Clear base
        ctx.fillStyle = "#132427";
        ctx.fillRect(0, 0, 1280, 720);

        // Clip and render handmade multiplane scene inside the porthole glass
        ctx.save();
        ctx.beginPath();
        ctx.arc(CX, CY, R_GLASS + 2, 0, TAU);
        ctx.clip();
        drawFn(ctx, s);
        ctx.restore();

        // Render Setup A Bread-Tin Cockpit + Controls + Wing + Editorial Strip
        drawSetupACockpitAndStrip(ctx, meta, s);

        ctx.restore();
      }
    };
  }

  window.PORTAL_SCENES[41] = buildPortal({
    id: 41,
    station: "#41 · Catwalk",
    clue: "Sea bream in sunglasses walking on stick legs",
    refWork: "Masaaki Yuasa: Mind Game (Studio 4°C, 2004)",
    turkeyFork: "Evolved land-fish or mirage?",
    troutFork: "Legless bird wheelchair or soup can?",
    scionRule: "Substrate Collision (SCION 22)",
    defaultTool: "lamp"
  }, renderPortal41);

  window.PORTAL_SCENES[42] = buildPortal({
    id: 42,
    station: "#42 · Ferry",
    clue: "Two pin-jointed elders between twin trees",
    refWork: "Nina Paley: This Land Is Mine (2012)",
    turkeyFork: "Tollbooth ushers or paper cutouts?",
    troutFork: "Boundary-stone thief or new ferryboat?",
    scionRule: "Fixed Bank, New Mark (SCION 16)",
    defaultTool: "ballast"
  }, renderPortal42);

  window.PORTAL_SCENES[43] = buildPortal({
    id: 43,
    station: "#43 · Snout",
    clue: "Crayon-spotted yellow shark nose on glass",
    refWork: "Wes Anderson: The Life Aquatic (2004)",
    turkeyFork: "Lemon-pepper predator or rescue sub?",
    troutFork: "Canned snack dispenser or fellow yellow fish?",
    scionRule: "Dollhouse Cutaway (SCION 31)",
    defaultTool: "lamp"
  }, renderPortal43);

  window.PORTAL_SCENES[44] = buildPortal({
    id: 44,
    station: "#44 · Rotor",
    clue: "Spinning black-and-white spiral word disc",
    refWork: "Marcel Duchamp: Anémic cinéma (1926)",
    turkeyFork: "Whirlpool turbine or hypnosis trap?",
    troutFork: "Diner pie-prize wheel or washing machine?",
    scionRule: "Rotating Type & Depth (Oucipo)",
    defaultTool: "lamp"
  }, renderPortal44);

  window.PORTAL_SCENES[45] = buildPortal({
    id: 45,
    station: "#45 · Extruder",
    clue: "Plastic funnel sucking baster into pellets",
    refWork: "Resnais & Queneau: Chant du styrène (1958)",
    turkeyFork: "Utensil un-maker or hull recycler?",
    troutFork: "Bubble-blowing toy or gravel vacuum?",
    scionRule: "Reverse Manufacture (Outrapo)",
    defaultTool: "ballast"
  }, renderPortal45);
})();
