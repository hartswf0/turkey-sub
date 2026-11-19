/* ============================================================================
 * TROUT SUB · SCION PORTAL ANIMATION CREW 03 (Portholes #11–#15)
 * PAELEO Handmade 2D Canvas Multiplane & Articulated Cutout Rigs + Video-to-Game
 *
 * Portholes:
 *   #11 · Tank  — Igloo Water Cooler trailing vinyl tubing (Bricolage SCION 29)
 *   #12 · Keel  — Cardboard stage with green Floor Porthole (Cutout Stage SCION 31)
 *   #13 · Arch  — Bell Boulder arch with brass twig-bell (Clockwise Etiquette SCION 48)
 *   #14 · Tower — Sinking crimson autumn maple leaf (Seasonal Timer SCION 11)
 *   #15 · Lens  — Cyan bathroom-tile glass block wall (Grid Phase Shift SCION 22)
 * ============================================================================ */
(function () {
  "use strict";

  window.PORTAL_SCENES = window.PORTAL_SCENES || {};

  // --------------------------------------------------------------------------
  // Math & Deterministic Easing Helpers
  // --------------------------------------------------------------------------
  var TAU = Math.PI * 2;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function span(t, a, b) { return clamp((t - a) / (b - a || 1e-6), 0, 1); }
  function smooth(u) { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); }
  function easeAt(t, a, b) { return smooth(span(t, a, b)); }
  function easeOutBack(u) {
    u = clamp(u, 0, 1);
    var c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
  }
  function rng32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
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

  // --------------------------------------------------------------------------
  // Cached Procedural Grain / Stipple Textures (100% synchronous & deterministic)
  // --------------------------------------------------------------------------
  var _grainCanvas = null;
  function getGrain() {
    if (_grainCanvas || typeof document === "undefined") return _grainCanvas;
    var c = document.createElement("canvas");
    c.width = 160; c.height = 160;
    var g = c.getContext("2d");
    var img = g.createImageData(160, 160);
    var d = img.data, r = rng32(27001115);
    for (var i = 0; i < d.length; i += 4) {
      var v = (r() * 255) | 0;
      d[i] = v; d[i + 1] = (v * 0.96) | 0; d[i + 2] = (v * 0.88) | 0;
      d[i + 3] = (r() < 0.45) ? 18 : 6;
    }
    g.putImageData(img, 0, 0);
    _grainCanvas = c;
    return _grainCanvas;
  }

  // --------------------------------------------------------------------------
  // State Resolution for Film (t in 0..10s) AND Live Video-to-Game Play
  // --------------------------------------------------------------------------
  var DEFAULT_ROLL = { 11: 2, 12: 6, 13: 4, 14: 2, 15: 6 };

  function resolveState(meta, rawT, state) {
    var st = state || {};
    var hasInteractive = !!state;
    // Allow continuous looping in live browser play past 10s while keeping 0..10s exact for film render
    var t = (hasInteractive && rawT > 10.001) ? (rawT % 10.0) : clamp(rawT, 0, 10.0);

    var showCaptions = st.showCaptions !== false;
    var viewMode = st.view || "auto";
    var pass = "setup"; // "setup" | "turkey" | "trout"
    if (viewMode === "turkey") {
      pass = "turkey";
    } else if (viewMode === "trout") {
      pass = "trout";
    } else {
      if (t < 2.0) pass = "setup";
      else if (t < 5.6) pass = "turkey";
      else pass = "trout";
    }

    // Effective animation clock inside active pass when view is overridden interactively
    var actT = t;
    if (viewMode === "turkey" && (t < 2.0 || t >= 5.6)) {
      actT = 2.0 + ((rawT * 0.85) % 3.5);
    } else if (viewMode === "trout" && t < 5.6) {
      actT = 5.7 + ((rawT * 0.85) % 4.2);
    }

    var defLamp = meta.defaultTool === "lamp";
    var lampOn = (typeof st.lamp === "boolean") ? st.lamp : (defLamp ? (t >= 1.0) : (t >= 1.0 ? true : false));
    // Note: for ballast-default portals, lamp starts dim/ambient and ballast snaps at t=1.0s;
    // if user hasn't overridden lamp on a ballast portal, keep auxiliary beam modest unless defaultTool==="lamp"
    var mainBeam = (typeof st.lamp === "boolean") ? st.lamp : (defLamp ? (t >= 1.0) : false);
    var auxWarm = (typeof st.lamp === "boolean") ? st.lamp : (t >= 1.0);

    var ballastOn = (typeof st.ballast === "boolean") ? st.ballast : (!defLamp ? (t >= 1.0) : false);

    // Smooth mechanical transitions around t = 1.0s
    var lampAnim = (typeof st.lamp === "boolean") ? (st.lamp ? 1 : 0) : (defLamp ? easeAt(t, 0.95, 1.32) : 0);
    var ballastAnim = (typeof st.ballast === "boolean") ? (st.ballast ? 1 : 0) : (!defLamp ? easeAt(t, 0.95, 1.42) : 0);
    var reveal = (typeof st.lamp === "boolean" || typeof st.ballast === "boolean")
      ? Math.max(lampAnim, ballastAnim, (mainBeam || ballastOn) ? 1 : 0.18)
      : easeAt(t, 0.96, 1.48);

    // Rolled 1d6 bolt (1..6)
    var rolledBolt = 0;
    var boltSpin = 0;
    if (typeof st.roll === "number" && st.roll >= 1 && st.roll <= 6) {
      rolledBolt = Math.round(st.roll);
      boltSpin = 1;
    } else if (pass === "trout" || t >= 5.6) {
      var bt = (viewMode === "trout" && t < 5.6) ? actT : t;
      if (bt >= 6.0 && bt < 6.55) {
        rolledBolt = (Math.floor((bt - 6.0) * 18) % 6) + 1;
        boltSpin = 0.65;
      } else if (bt >= 6.55) {
        rolledBolt = DEFAULT_ROLL[meta.id] || 2;
        boltSpin = easeAt(bt, 6.55, 6.95);
      }
    }

    // Chalk chart completion progress (0..1)
    var chartProg = 0.36;
    if (pass === "turkey") chartProg = lerp(0.36, 0.54, easeAt(actT, 2.0, 5.4));
    else if (pass === "trout") chartProg = lerp(0.54, 1.0, easeAt(actT, 5.8, 8.3));
    else chartProg = lerp(0.18, 0.36, easeAt(t, 0.0, 2.0));

    return {
      t: t,
      rawT: rawT,
      actT: actT,
      pass: pass,
      viewMode: viewMode,
      showCaptions: showCaptions,
      lampOn: mainBeam,
      auxWarm: auxWarm,
      ballastOn: ballastOn,
      lampAnim: lampAnim,
      ballastAnim: ballastAnim,
      reveal: reveal,
      rolledBolt: rolledBolt,
      boltSpin: boltSpin,
      chartProg: chartProg,
      cutFlash: (!st.view || st.view === "auto") ? (1 - Math.abs(t - 5.65) / 0.24) : 0
    };
  }

  // --------------------------------------------------------------------------
  // Shared Underwater Multiplane Helpers (inside Porthole cx=640, cy=255, r=185)
  // --------------------------------------------------------------------------
  var PORT = { cx: 640, cy: 255, r: 185, rOuter: 221 };

  function drawWaterBackdrop(ctx, rs, topCol, midCol, botCol, turbidity) {
    var cx = PORT.cx, cy = PORT.cy, r = PORT.r;
    var grd = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
    grd.addColorStop(0, topCol);
    grd.addColorStop(0.55, midCol);
    grd.addColorStop(1, botCol);
    ctx.fillStyle = grd;
    ctx.fillRect(cx - r - 4, cy - r - 4, r * 2 + 8, r * 2 + 8);

    // Subtle underwater caustic wave bands
    ctx.save();
    var waveAmp = rs.ballastOn ? 4 : 9;
    var speed = rs.ballastOn ? 0.9 : 2.2;
    for (var i = 0; i < 6; i++) {
      var yy = cy - r + 32 + i * 52 + Math.sin(rs.rawT * speed + i * 1.3) * waveAmp;
      ctx.strokeStyle = rs.pass === "trout"
        ? "rgba(170, 240, 235, 0.11)"
        : "rgba(145, 218, 210, 0.08)";
      ctx.lineWidth = 10 + (i % 3) * 5;
      ctx.beginPath();
      for (var x = cx - r - 10; x <= cx + r + 10; x += 24) {
        var wy = yy + Math.sin(x * 0.025 + rs.rawT * speed + i) * (waveAmp * 0.7);
        if (x === cx - r - 10) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }

    // Silty dusk veil before control operation (clears when lamp or ballast operates!)
    var murk = clamp((1 - rs.reveal) * (turbidity || 0.62), 0, 0.78);
    if (murk > 0.01) {
      ctx.fillStyle = "rgba(11, 24, 28, " + murk.toFixed(3) + ")";
      ctx.fillRect(cx - r - 4, cy - r - 4, r * 2 + 8, r * 2 + 8);
      // Fast silt streaks when unballasted / unlit
      var sr = rng32(901);
      ctx.strokeStyle = "rgba(155, 178, 172, " + (murk * 0.45).toFixed(3) + ")";
      ctx.lineWidth = 2;
      for (var s = 0; s < 18; s++) {
        var sx = cx - r + ((sr() * 380 + rs.rawT * (110 + s * 7)) % 390);
        var sy = cy - r + 25 + sr() * 320;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - 26, sy + 4);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawSearchlightCone(ctx, rs, aimX, aimY, spread, strength) {
    var power = rs.lampOn ? Math.max(0.85, rs.lampAnim) : (rs.auxWarm ? 0.34 : 0.06);
    power *= (strength === undefined ? 1 : strength);
    if (power <= 0.02) return;
    var bx = PORT.cx, by = PORT.cy + PORT.r - 8;
    var tx = aimX !== undefined ? aimX : PORT.cx;
    var ty = aimY !== undefined ? aimY : PORT.cy - 95;
    var wTop = spread || 150;

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    var g = ctx.createRadialGradient(bx, by, 8, tx, ty + 40, 290);
    g.addColorStop(0, "rgba(255, 222, 132, " + (0.62 * power).toFixed(3) + ")");
    g.addColorStop(0.45, "rgba(246, 184, 86, " + (0.28 * power).toFixed(3) + ")");
    g.addColorStop(1, "rgba(246, 184, 86, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(bx - 28, by + 6);
    ctx.lineTo(tx - wTop, ty - 60);
    ctx.lineTo(tx + wTop, ty - 60);
    ctx.lineTo(bx + 28, by + 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawSwayingWeed(ctx, baseX, baseY, height, blades, swayTime, calm, colDark, colMid) {
    ctx.save();
    var amp = calm ? 5 : 13;
    for (var i = 0; i < blades; i++) {
      var bx = baseX + (i - (blades - 1) * 0.5) * 8;
      var h = height * (0.72 + (i % 3) * 0.16);
      var tipX = bx + Math.sin(swayTime * 1.9 + i * 0.9) * amp;
      var midX = bx + Math.sin(swayTime * 1.9 + i * 0.9 - 0.6) * (amp * 0.55);
      ctx.beginPath();
      ctx.moveTo(bx - 3.5, baseY);
      ctx.quadraticCurveTo(midX - 4, baseY - h * 0.52, tipX, baseY - h);
      ctx.quadraticCurveTo(midX + 4, baseY - h * 0.52, bx + 3.5, baseY);
      ctx.closePath();
      ctx.fillStyle = (i % 2 === 0) ? (colDark || "#194844") : (colMid || "#29665c");
      ctx.fill();
      ctx.strokeStyle = "#0d2424";
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCobbleCluster(ctx, stones, tintWarm) {
    for (var i = 0; i < stones.length; i++) {
      var s = stones[i];
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot || 0);
      ctx.beginPath();
      ctx.ellipse(0, 0, s.rx, s.ry, 0, 0, TAU);
      var g = ctx.createLinearGradient(0, -s.ry, 0, s.ry);
      g.addColorStop(0, tintWarm ? "#7b8a64" : "#4b6963");
      g.addColorStop(0.6, "#2e4643");
      g.addColorStop(1, "#182828");
      ctx.fillStyle = g;
      ctx.fill();
      // Moss cap
      if (s.moss) {
        ctx.beginPath();
        ctx.ellipse(0, -s.ry * 0.34, s.rx * 0.82, s.ry * 0.45, 0, Math.PI, TAU);
        ctx.fillStyle = tintWarm ? "rgba(130, 162, 74, 0.62)" : "rgba(74, 128, 86, 0.5)";
        ctx.fill();
      }
      ctx.strokeStyle = "#101c1d";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }

  // --------------------------------------------------------------------------
  // Articulated Spotted Brook Trout Rig (Salvelinus fontinalis)
  // --------------------------------------------------------------------------
  function drawBrookTrout(ctx, opts) {
    var x = opts.x || 640;
    var y = opts.y || 255;
    var scale = opts.scale || 1;
    var dir = opts.dir || -1; // -1 faces LEFT (toward center/turkey), +1 faces RIGHT
    var pitch = opts.pitch || 0;
    var t = opts.t || 0;
    var jaw = clamp(opts.jaw || 0, 0, 1);
    var finWave = Math.sin(t * 7.5 + (opts.phase || 0));
    var tailWag = Math.sin(t * 6.2 + (opts.phase || 0)) * (opts.swimAmp === undefined ? 1 : opts.swimAmp);
    var lookX = opts.lookX || 0;
    var lookY = opts.lookY || 0;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(pitch);
    ctx.scale(dir === -1 ? -scale : scale, scale); // Canonical drawing faces RIGHT (+X)

    var tailY = tailWag * 9;
    var midY = Math.sin(t * 6.2 - 0.8) * 3.5;

    // Dorsal fin (articulated rays)
    ctx.save();
    ctx.translate(-12, -23 + midY * 0.5);
    ctx.rotate(-0.08 + finWave * 0.06);
    ctx.beginPath();
    ctx.moveTo(-18, 4);
    ctx.quadraticCurveTo(-10, -20, 8, -16);
    ctx.quadraticCurveTo(16, -6, 16, 5);
    ctx.closePath();
    ctx.fillStyle = "#567553";
    ctx.fill();
    ctx.strokeStyle = "#17241c";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    // Fin spots
    ctx.fillStyle = "#1f2e22";
    for (var df = -10; df <= 8; df += 6) {
      ctx.beginPath(); ctx.arc(df, -6, 1.7, 0, TAU); ctx.fill();
    }
    ctx.restore();

    // Adipose fin
    ctx.beginPath();
    ctx.ellipse(-54, -14 + tailY * 0.4, 7, 4.5, -0.35, 0, TAU);
    ctx.fillStyle = "#6c855b";
    ctx.fill();
    ctx.strokeStyle = "#17241c";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Forked Caudal Tail (hinged on peduncle)
    ctx.save();
    ctx.translate(-74, tailY * 0.7);
    ctx.rotate(tailWag * 0.22);
    ctx.beginPath();
    ctx.moveTo(4, -7);
    ctx.quadraticCurveTo(-22, -26, -34, -23);
    ctx.quadraticCurveTo(-22, -3, -20, 0);
    ctx.quadraticCurveTo(-22, 4, -33, 24);
    ctx.quadraticCurveTo(-18, 25, 4, 8);
    ctx.closePath();
    var tg = ctx.createLinearGradient(-32, 0, 4, 0);
    tg.addColorStop(0, "#b86b4b");
    tg.addColorStop(1, "#5c7656");
    ctx.fillStyle = tg;
    ctx.fill();
    ctx.strokeStyle = "#17241c";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Tail rays
    ctx.strokeStyle = "rgba(23,36,28,0.45)";
    ctx.lineWidth = 1;
    for (var tr = -16; tr <= 16; tr += 6) {
      ctx.beginPath(); ctx.moveTo(0, tr * 0.25); ctx.lineTo(-26, tr); ctx.stroke();
    }
    ctx.restore();

    // Pelvic & Anal fins (white-and-black Brook Trout leading edge!)
    ctx.save();
    ctx.translate(-22, 20 + midY * 0.5);
    ctx.rotate(0.2 + finWave * 0.12);
    ctx.beginPath();
    ctx.moveTo(6, -2); ctx.lineTo(-8, 15); ctx.lineTo(-18, 11); ctx.lineTo(-6, -2);
    ctx.closePath();
    ctx.fillStyle = "#d97a48";
    ctx.fill();
    ctx.strokeStyle = "#f5f2e6";
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(5, -1); ctx.lineTo(-8, 14); ctx.stroke();
    ctx.strokeStyle = "#17241c";
    ctx.lineWidth = 1.6;
    ctx.strokeRect(-0.1, -0.1, 0.1, 0.1);
    ctx.restore();

    // Torso (streamlined spotted body)
    ctx.beginPath();
    ctx.moveTo(68, -2); // snout tip
    ctx.quadraticCurveTo(44, -24, 4, -25 + midY * 0.4);
    ctx.quadraticCurveTo(-40, -23 + midY * 0.5, -76, -8 + tailY * 0.7);
    ctx.lineTo(-76, 9 + tailY * 0.7);
    ctx.quadraticCurveTo(-38, 24 + midY * 0.5, 6, 24 + midY * 0.3);
    ctx.quadraticCurveTo(36, 23, 50, 12); // throat
    // Upper jaw mouth cleft
    ctx.lineTo(64, 5);
    ctx.closePath();

    var bg = ctx.createLinearGradient(0, -26, 0, 26);
    bg.addColorStop(0, "#35533e");       // dark olive back
    bg.addColorStop(0.45, "#7e9a76");    // silvery-olive flank
    bg.addColorStop(0.72, "#e0a978");    // warm rosy-gold belly band
    bg.addColorStop(1, "#f2ead7");       // cream belly
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = "#14201b";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Articulated Lower Jaw
    ctx.save();
    ctx.translate(45, 9);
    ctx.rotate(0.08 + jaw * 0.42);
    ctx.beginPath();
    ctx.moveTo(-2, -2);
    ctx.quadraticCurveTo(12, 2, 21, -2);
    ctx.quadraticCurveTo(14, 7, -1, 5);
    ctx.closePath();
    ctx.fillStyle = "#d9be9b";
    ctx.fill();
    ctx.strokeStyle = "#14201b";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Brook Trout Vermiculations & Haloed Crimson Spots
    ctx.fillStyle = "rgba(32, 52, 38, 0.55)";
    var sp = [[-56, -4], [-44, 2], [-34, -8], [-24, 3], [-14, -5], [-4, 4], [8, -7], [18, 2], [28, -5], [-48, -11], [-18, -13], [4, -14]];
    for (var i = 0; i < sp.length; i++) {
      var sx = sp[i][0], sy = sp[i][1] + midY * 0.3;
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3 === 0) ? 3.2 : 2.1, 0, TAU);
      ctx.fillStyle = (i % 3 === 0) ? "rgba(185, 214, 216, 0.65)" : "#233829";
      ctx.fill();
      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, TAU);
        ctx.fillStyle = "#c93b2b";
        ctx.fill();
      }
    }

    // Gill Operculum curve
    ctx.beginPath();
    ctx.arc(34, 1, 14, 0.55 * Math.PI, 1.42 * Math.PI);
    ctx.strokeStyle = "#1a2a24";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pectoral Fin (articulated foreground paddle with white Brook-Trout edge!)
    ctx.save();
    ctx.translate(22, 13);
    ctx.rotate(0.35 + finWave * 0.26 + (opts.finPoint || 0));
    ctx.beginPath();
    ctx.moveTo(4, -3);
    ctx.quadraticCurveTo(-8, 20, -22, 16);
    ctx.quadraticCurveTo(-18, 4, -4, -3);
    ctx.closePath();
    ctx.fillStyle = "#d97845";
    ctx.fill();
    ctx.strokeStyle = "#faf6ea";
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(3, -2); ctx.quadraticCurveTo(-8, 19, -21, 15); ctx.stroke();
    ctx.strokeStyle = "#17241c";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    // Expressive Eye
    ctx.beginPath();
    ctx.arc(49, -6, 6.2, 0, TAU);
    ctx.fillStyle = "#f5e6b8";
    ctx.fill();
    ctx.strokeStyle = "#14201b";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(50.2 + lookX * 1.6, -5.8 + lookY * 1.4, 3.3, 0, TAU);
    ctx.fillStyle = "#101617";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(51.4 + lookX * 0.8, -7.2, 1.3, 0, TAU);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Optional Ferry Cap (for #13 Clockwise Etiquette!)
    if (opts.cap) {
      ctx.save();
      ctx.translate(44, -18);
      ctx.rotate(-0.12);
      ctx.fillStyle = "#1d4b5c";
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 5, 0, Math.PI, TAU);
      ctx.fill();
      ctx.strokeStyle = "#101a1d";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      // Brass visor & badge
      ctx.fillStyle = "#d9a74a";
      ctx.fillRect(-10, -2, 22, 3);
      ctx.restore();
    }

    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // Turkey Reflection Inside Glass (for Act 2 outward squint & Act 3 Trout's view in!)
  // --------------------------------------------------------------------------
  function drawTurkeyGlassReflection(ctx, rs, opts) {
    var o = opts || {};
    var isTroutView = rs.pass === "trout";
    var alpha = o.alpha !== undefined ? o.alpha : (isTroutView ? 0.56 : 0.34);
    var baseX = o.x !== undefined ? o.x : (isTroutView ? 542 : 512);
    var baseY = o.y !== undefined ? o.y : (isTroutView ? 335 : 368);
    var sc = o.scale || (isTroutView ? 1.08 : 0.92);
    var nod = Math.sin(rs.rawT * 3.1) * 0.06 + (o.nod || 0);
    var beakOpen = o.beakOpen || (Math.sin(rs.rawT * 4.5) > 0.65 ? 0.25 : 0.04);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(baseX, baseY);
    ctx.scale(sc, sc);
    ctx.rotate(nod);

    // Feathered copper-bronze neck & fanned shoulder
    ctx.beginPath();
    ctx.moveTo(-36, 65);
    ctx.quadraticCurveTo(-30, 12, -14, -14);
    ctx.arc(0, -18, 24, Math.PI * 0.85, Math.PI * 0.08);
    ctx.quadraticCurveTo(18, 18, 16, 65);
    ctx.closePath();
    var tg = ctx.createLinearGradient(-20, -40, 20, 60);
    tg.addColorStop(0, "#b86b43");
    tg.addColorStop(0.5, "#8c4427");
    tg.addColorStop(1, "#4a2416");
    ctx.fillStyle = tg;
    ctx.fill();
    ctx.strokeStyle = "#24110b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Scalloped neck feathers
    ctx.strokeStyle = "rgba(250, 210, 155, 0.35)";
    ctx.lineWidth = 1.4;
    for (var r = 0; r < 3; r++) {
      for (var c = -1; c <= 1; c++) {
        ctx.beginPath();
        ctx.arc(c * 11, 14 + r * 14, 7, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      }
    }

    // Curved Amber Beak (upper & articulated lower)
    ctx.fillStyle = "#e3a84b";
    ctx.strokeStyle = "#24110b";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(19, -22);
    ctx.quadraticCurveTo(40, -20, 44, -9);
    ctx.lineTo(19, -11);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.save();
    ctx.translate(19, -11);
    ctx.rotate(beakOpen * 0.5);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(20, 1);
    ctx.quadraticCurveTo(10, 7, 0, 5);
    ctx.closePath();
    ctx.fillStyle = "#c98b32";
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // Swinging Crimson Wattle & Snood!
    var wattleSwing = Math.sin(rs.rawT * 4.2) * 0.14;
    ctx.save();
    ctx.translate(22, -8);
    ctx.rotate(wattleSwing);
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.quadraticCurveTo(-8, 18, -1, 24);
    ctx.quadraticCurveTo(7, 20, 4, 2);
    ctx.closePath();
    ctx.fillStyle = "#c9382b";
    ctx.fill();
    ctx.strokeStyle = "#2b0d0a";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Snood over beak
    ctx.beginPath();
    ctx.moveTo(22, -24);
    ctx.quadraticCurveTo(31, -28, 30, -14);
    ctx.quadraticCurveTo(25, -14, 21, -20);
    ctx.fillStyle = "#d64535";
    ctx.fill();

    // Wide Expressive Bird Eye + Blink
    var blink = (Math.sin(rs.rawT * 1.7 + 0.9) > 0.97) ? 0.15 : 1;
    ctx.save();
    ctx.translate(4, -21);
    ctx.scale(1, blink);
    ctx.beginPath();
    ctx.arc(0, 0, 8.5, 0, TAU);
    ctx.fillStyle = "#f7ebd2";
    ctx.fill();
    ctx.strokeStyle = "#24110b";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(2.2, -0.5, 4.3, 0, TAU);
    ctx.fillStyle = "#171311";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3.6, -2.2, 1.6, 0, TAU);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // Setup A Bread-Tin Cockpit Renderer (y = 0..536) + Story Strip (y = 536..720)
  // --------------------------------------------------------------------------
  function drawSetupACockpit(ctx, W, H, meta, rs) {
    var topH = 536;

    // 1. Outer Dark Hull & Oval Bread-Roll Tin Cutout Mask (leaving circular porthole open!)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, topH);
    ctx.arc(PORT.cx, PORT.cy, PORT.r, 0, TAU, true);
    ctx.fillStyle = "#0b1517";
    ctx.fill("evenodd");

    // Oval bread-roll tin interior wall (#132427) with subtle warm overhead gradient
    ctx.save();
    ctx.beginPath();
    roundRectPath(ctx, 48, 14, W - 96, topH - 26, 108);
    ctx.arc(PORT.cx, PORT.cy, PORT.r, 0, TAU, true);
    ctx.clip("evenodd");

    var tinGrd = ctx.createRadialGradient(PORT.cx, 50, 30, PORT.cx, 280, 660);
    var warmBoost = rs.lampOn ? 0.22 : (rs.auxWarm ? 0.12 : 0.05);
    tinGrd.addColorStop(0, "rgba(72, 68, 48, " + (0.45 + warmBoost).toFixed(2) + ")");
    tinGrd.addColorStop(0.35, "#172c30");
    tinGrd.addColorStop(1, "#101f22");
    ctx.fillStyle = "#132427";
    ctx.fillRect(48, 14, W - 96, topH - 26);
    ctx.fillStyle = tinGrd;
    ctx.fillRect(48, 14, W - 96, topH - 26);

    // Subtle vertical stamped bread-tin ribs
    ctx.strokeStyle = "rgba(155, 196, 194, 0.05)";
    ctx.lineWidth = 3;
    for (var rx = 140; rx <= W - 140; rx += 92) {
      ctx.beginPath();
      ctx.moveTo(rx, 24);
      ctx.lineTo(rx, topH - 20);
      ctx.stroke();
    }

    // INVARIANT: Right-side hammered dent in the bread-roll tin!
    ctx.save();
    ctx.translate(1182, 222);
    ctx.beginPath();
    ctx.moveTo(46, -68);
    ctx.bezierCurveTo(-26, -42, -34, 28, 44, 68);
    ctx.lineTo(60, 68);
    ctx.lineTo(60, -68);
    ctx.closePath();
    var dentG = ctx.createLinearGradient(-32, -20, 42, 24);
    dentG.addColorStop(0, "#0a1416");
    dentG.addColorStop(0.55, "#233f44");
    dentG.addColorStop(1, "#0d191b");
    ctx.fillStyle = dentG;
    ctx.fill();
    ctx.strokeStyle = "#5f8586";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(42, -64);
    ctx.bezierCurveTo(-24, -40, -30, 26, 40, 64);
    ctx.stroke();
    // Crease lines inside the dent
    ctx.strokeStyle = "rgba(218, 236, 232, 0.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(24, -26); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-16, 12); ctx.lineTo(26, 22); ctx.stroke();
    ctx.restore();

    // Overhead Amber Task-Light Bar (exact Setup A geometry!)
    ctx.strokeStyle = "#8a6741";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(118, 86);
    ctx.lineTo(205, 32);
    ctx.lineTo(1075, 32);
    ctx.lineTo(1162, 86);
    ctx.stroke();

    // Center Overhead Amber Task Lamp capsule
    roundRectPath(ctx, 582, 23, 116, 18, 9);
    ctx.fillStyle = rs.auxWarm ? "#f2ad52" : "#9c6d36";
    ctx.fill();
    ctx.strokeStyle = "#2b1c0e";
    ctx.lineWidth = 2;
    ctx.stroke();
    if (rs.auxWarm) {
      var ohGlow = ctx.createRadialGradient(640, 34, 6, 640, 70, 180);
      ohGlow.addColorStop(0, "rgba(255, 198, 104, 0.26)");
      ohGlow.addColorStop(1, "rgba(255, 198, 104, 0)");
      ctx.fillStyle = ohGlow;
      ctx.fillRect(440, 20, 400, 180);
    }

    // 2. Top-Right: `1 Day of Air` Pressure Dial (cx=1035, cy=112, r=42)
    drawAirDial(ctx, 1035, 112, 42, rs);

    // 3. Bottom-Left: `Ballast / Single Slot` (x=128, y=420, w=234, h=82)
    drawBallastSlot(ctx, 128, 420, 234, 82, rs);

    // 4. Bottom-Center: `Chalk Chart Under Glass` (x=454, y=482, w=372, h=38)
    drawChalkChart(ctx, 454, 482, 372, 38, meta, rs);

    // 5. Bottom-Right: `Lamp Toggle` (x=922, y=416, w=138, h=86)
    drawLampToggle(ctx, 922, 416, 138, 86, rs);

    ctx.restore(); // end tin interior clip

    // Rolled Bread-Tin Outer Rim Highlight (with right-side dent inward pinch!)
    ctx.beginPath();
    ctx.moveTo(156, 14);
    ctx.lineTo(1124, 14);
    ctx.quadraticCurveTo(1232, 14, 1232, 122);
    ctx.lineTo(1232, 154);
    ctx.bezierCurveTo(1160, 182, 1156, 252, 1232, 290); // right-side dent pinch!
    ctx.lineTo(1232, 404);
    ctx.quadraticCurveTo(1232, 512, 1124, 512);
    ctx.lineTo(156, 512);
    ctx.quadraticCurveTo(48, 512, 48, 404);
    ctx.lineTo(48, 122);
    ctx.quadraticCurveTo(48, 14, 156, 14);
    ctx.strokeStyle = "#597d7e";
    ctx.lineWidth = 3.2;
    ctx.stroke();

    // 6. Centered 6-Bolt Riveted Antique Brass Porthole Bezel + Hinge + Latch + 2-o'clock Rim Chip
    drawBrassPortholeFrame(ctx, meta, rs);

    // 7. Articulated Foreground Turkey Wing Operating the Active Control!
    drawTurkeyPilotWing(ctx, meta, rs);

    ctx.restore();

    // 8. Lower Cream Editorial Story Strip (y = 536..720)
    drawEditorialStrip(ctx, W, H, topH, meta, rs);
  }

  function drawAirDial(ctx, cx, cy, r, rs) {
    ctx.save();
    // Brass bezel
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, TAU);
    ctx.fillStyle = "#8d6c38";
    ctx.fill();
    ctx.strokeStyle = "#20170b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cream dial face
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fillStyle = "#efe8d5";
    ctx.fill();
    ctx.strokeStyle = "#3a2e1e";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Colored reserve zones (green -> amber -> rust)
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(cx, cy, r - 7, Math.PI * 0.8, Math.PI * 1.45); ctx.strokeStyle = "#2d6846"; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r - 7, Math.PI * 1.45, Math.PI * 1.9); ctx.strokeStyle = "#d9922b"; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r - 7, Math.PI * 1.9, Math.PI * 2.2); ctx.strokeStyle = "#9e3d1c"; ctx.stroke();

    // Tick marks
    ctx.strokeStyle = "#221d17";
    ctx.lineWidth = 1.4;
    for (var i = 0; i <= 8; i++) {
      var a = Math.PI * (0.8 + i * 0.175);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (r - 13), cy + Math.sin(a) * (r - 13));
      ctx.lineTo(cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3));
      ctx.stroke();
    }

    // Gently breathing needle (slowly using air across 0..10s)
    var airFrac = 0.86 - 0.10 * (rs.t / 10) + Math.sin(rs.rawT * 9) * 0.008;
    var na = Math.PI * (0.8 + airFrac * 1.4);
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(na) * 7, cy - Math.sin(na) * 7);
    ctx.lineTo(cx + Math.cos(na) * (r - 9), cy + Math.sin(na) * (r - 9));
    ctx.strokeStyle = "#9e3d1c";
    ctx.lineWidth = 2.4;
    ctx.stroke();

    ctx.beginPath(); ctx.arc(cx, cy, 4.5, 0, TAU); ctx.fillStyle = "#3a2c18"; ctx.fill();

    // Glass highlight
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 8, r * 0.65, Math.PI * 1.05, Math.PI * 1.65);
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    if (rs.showCaptions) {
      ctx.fillStyle = "#b8cbc7";
      ctx.font = "600 10.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("1 DAY OF AIR", cx, cy + r + 20);
    }
    ctx.restore();
  }

  function drawBallastSlot(ctx, x, y, w, h, rs) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, 12);
    ctx.fillStyle = "#0e1b1d";
    ctx.fill();
    ctx.strokeStyle = "#7ba39e";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner LEGO-keyed single-slot socket rails
    var sx = x + 36, sy = y + 26, sw = w - 72, sh = 32;
    ctx.fillStyle = "#081012";
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = "#486866";
    ctx.lineWidth = 1.6;
    ctx.strokeRect(sx, sy, sw, sh);

    // Keyed alignment teeth
    ctx.fillStyle = "#486866";
    ctx.fillRect(sx + 18, sy - 4, 14, 5);
    ctx.fillRect(sx + sw - 32, sy - 4, 14, 5);

    // Sliding Lead-and-Brass Ballast Tray!
    var slide = rs.ballastAnim; // 0 = unmounted/high on left rail, 1 = snapped low into socket!
    var trayX = lerp(x - 18, sx + 4, slide);
    var trayY = lerp(sy - 16, sy + 3, slide);
    roundRectPath(ctx, trayX, trayY, sw - 8, sh - 6, 5);
    var bg = ctx.createLinearGradient(trayX, trayY, trayX, trayY + sh);
    bg.addColorStop(0, slide > 0.7 ? "#d4a44c" : "#6c7b7c");
    bg.addColorStop(1, slide > 0.7 ? "#7c5b24" : "#3c494a");
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = "#182022";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Usable handle bar on the ballast module
    roundRectPath(ctx, trayX + 42, trayY + 6, sw - 92, 12, 4);
    ctx.strokeStyle = "#f2dca0";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Seated lock indicator LED/jewel
    ctx.beginPath();
    ctx.arc(x + w - 18, y + 20, 5.5, 0, TAU);
    ctx.fillStyle = rs.ballastOn ? "#5ce0a8" : "#25383a";
    ctx.fill();
    ctx.strokeStyle = "#101b1d";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    if (rs.showCaptions) {
      ctx.fillStyle = "#b8cbc7";
      ctx.font = "600 10.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("BALLAST / SINGLE SLOT", x + 12, y - 7);
    }
    ctx.restore();
  }

  function drawChalkChart(ctx, x, y, w, h, meta, rs) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, 9);
    ctx.fillStyle = "#132325";
    ctx.fill();
    ctx.strokeStyle = "#89b0a9";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // River-bend chalk survey polyline progressively drawn!
    var pts = [
      [x + 24, y + 27],
      [x + 95, y + 12],
      [x + 168, y + 26],
      [x + 248, y + 13],
      [x + 338, y + 21]
    ];
    // Station landmark index along the route for #11..#15
    var markIdx = clamp((meta.id - 11), 0, 4);
    var totalSegs = pts.length - 1;
    var prog = rs.chartProg * totalSegs;

    ctx.strokeStyle = "rgba(246, 241, 226, 0.92)";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 0; i < totalSegs; i++) {
      var segU = clamp(prog - i, 0, 1);
      if (segU <= 0) break;
      ctx.lineTo(lerp(pts[i][0], pts[i + 1][0], segU), lerp(pts[i][1], pts[i + 1][1], segU));
    }
    ctx.stroke();

    // Gold verified landmark dot when t >= 5.6s (Act 3 Trout verification)!
    if (rs.pass === "trout" || rs.chartProg > 0.62) {
      var pop = easeOutBack(span(rs.chartProg, 0.60, 0.88));
      var gx = lerp(pts[1][0], pts[3][0], markIdx / 4);
      var gy = lerp(pts[1][1], pts[2][1], (markIdx % 2) * 0.7 + 0.15);
      ctx.beginPath();
      ctx.arc(gx, gy, 5.2 * pop, 0, TAU);
      ctx.fillStyle = "#ffd454";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(gx, gy, 9.5 * pop, 0, TAU);
      ctx.strokeStyle = "rgba(255, 212, 84, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Glazing reflection streak
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 6);
    ctx.lineTo(x + 92, y + 6);
    ctx.stroke();

    if (rs.showCaptions) {
      ctx.fillStyle = "#b8cbc7";
      ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("CHALK CHART UNDER GLASS", x + w * 0.5, y + h + 12);
    }
    ctx.restore();
  }

  function drawLampToggle(ctx, x, y, w, h, rs) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, 12);
    ctx.fillStyle = "#19201e";
    ctx.fill();
    ctx.strokeStyle = "#dca055";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    var cx = x + w * 0.5, cy = y + h * 0.56;
    // Brass collar nut
    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, TAU);
    ctx.fillStyle = "#9d7638";
    ctx.fill();
    ctx.strokeStyle = "#1b140a";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Articulated Bat-Handle Lever (flips from DOWN-LEFT to UP-RIGHT!)
    var ang = lerp(2.35, -0.52, rs.lampOn ? Math.max(rs.lampAnim, 0.95) : rs.lampAnim);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(28, -7);
    ctx.arc(28, 0, 7, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.lineTo(0, 4);
    ctx.closePath();
    ctx.fillStyle = "#efe6d2";
    ctx.fill();
    ctx.strokeStyle = "#221a10";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    // Amber Pilot Jewel
    ctx.beginPath();
    ctx.arc(x + 24, y + 22, 6.5, 0, TAU);
    ctx.fillStyle = rs.lampOn ? "#ffbe44" : "#3a2c1a";
    ctx.fill();
    ctx.strokeStyle = "#14100a";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (rs.lampOn) {
      var jg = ctx.createRadialGradient(x + 24, y + 22, 2, x + 24, y + 22, 22);
      jg.addColorStop(0, "rgba(255, 196, 76, 0.65)");
      jg.addColorStop(1, "rgba(255, 196, 76, 0)");
      ctx.fillStyle = jg;
      ctx.beginPath(); ctx.arc(x + 24, y + 22, 22, 0, TAU); ctx.fill();
    }

    if (rs.showCaptions) {
      ctx.fillStyle = "#e8be7b";
      ctx.font = "600 10.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("LAMP TOGGLE", x + 10, y - 7);
    }
    ctx.restore();
  }

  function drawBrassPortholeFrame(ctx, meta, rs) {
    var cx = PORT.cx, cy = PORT.cy, rIn = PORT.r, rOut = PORT.rOuter;
    ctx.save();

    // Bottom interior brass searchlight hood sitting on lower inner rim (like p11..p15.jpg)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rIn, 0, TAU);
    ctx.clip();
    // Specular curved glass highlight arc (top-left)
    ctx.strokeStyle = "rgba(235, 250, 248, 0.28)";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, rIn - 13, Math.PI * 1.12, Math.PI * 1.44);
    ctx.stroke();

    // Cross-glass wipe flash at t = 5.6s cut
    if (rs.cutFlash > 0) {
      ctx.fillStyle = "rgba(220, 250, 248, " + (rs.cutFlash * 0.28).toFixed(3) + ")";
      ctx.fillRect(cx - rIn, cy - rIn, rIn * 2, rIn * 2);
    }

    // Brass headlamp housing at bottom of porthole
    var hoodY = cy + rIn - 6;
    var hg = ctx.createLinearGradient(cx - 38, hoodY - 26, cx + 38, hoodY + 14);
    hg.addColorStop(0, "#7b5a2b");
    hg.addColorStop(0.5, rs.lampOn ? "#f0be63" : "#b58b47");
    hg.addColorStop(1, "#593e1a");
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(cx, hoodY + 6, 36, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#1d1408";
    ctx.lineWidth = 2.4;
    ctx.stroke();
    // glowing filament rim
    ctx.beginPath();
    ctx.ellipse(cx, hoodY - 14, 24, 6, 0, 0, TAU);
    ctx.fillStyle = rs.lampOn ? "#ffe699" : (rs.auxWarm ? "#cfa054" : "#4a3b24");
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Heavy Left Cast-Iron Hinge (9 o'clock)
    roundRectPath(ctx, cx - rOut - 18, cy - 48, 28, 96, 5);
    ctx.fillStyle = "#3f3b36";
    ctx.fill();
    ctx.strokeStyle = "#151311";
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.fillStyle = "#262320";
    ctx.fillRect(cx - rOut - 15, cy - 28, 10, 56);

    // Antique Brass Ring Bezel (annulus)
    ctx.beginPath();
    ctx.arc(cx, cy, rOut, 0, TAU);
    ctx.arc(cx, cy, rIn, 0, TAU, true);
    var brG = ctx.createLinearGradient(cx - rOut, cy - rOut, cx + rOut, cy + rOut);
    brG.addColorStop(0, "#cfa558");
    brG.addColorStop(0.35, "#9c7636");
    brG.addColorStop(0.7, "#bfa05a");
    brG.addColorStop(1, "#6c4f21");
    ctx.fillStyle = brG;
    ctx.fill("evenodd");

    // Outer & inner bevel strokes
    ctx.beginPath(); ctx.arc(cx, cy, rOut, 0, TAU);
    ctx.strokeStyle = "#181208"; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, rIn + 7, 0, TAU);
    ctx.strokeStyle = "#5b4119"; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, rIn, 0, TAU);
    ctx.strokeStyle = "#1a1409"; ctx.lineWidth = 3; ctx.stroke();

    // INVARIANT: 2-o'clock Chipped Rim Notch! (angle = -30 deg = -PI/6, matching setup-a.webp!)
    var chipA = -Math.PI / 6;
    var chipX = cx + Math.cos(chipA) * (rIn + 3);
    var chipY = cy + Math.sin(chipA) * (rIn + 3);
    ctx.save();
    ctx.translate(chipX, chipY);
    ctx.rotate(chipA);
    ctx.beginPath();
    ctx.moveTo(-7, -11);
    ctx.lineTo(9, -5);
    ctx.lineTo(5, 0);
    ctx.lineTo(10, 7);
    ctx.lineTo(-7, 11);
    ctx.closePath();
    ctx.fillStyle = "#16292c";
    ctx.fill();
    ctx.strokeStyle = "#ffd37a"; // bright raw nicked brass edge!
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.restore();

    // Offset Brass Dog-Latch at 3 o'clock (cx + rOut - 6, cy + 4)
    ctx.save();
    ctx.translate(cx + rOut - 10, cy + 4);
    roundRectPath(ctx, -8, -32, 20, 64, 6);
    ctx.fillStyle = "#ab833e";
    ctx.fill();
    ctx.strokeStyle = "#1a1308";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    // Latch tongue
    ctx.beginPath();
    ctx.moveTo(-16, -6);
    ctx.lineTo(24, -10);
    ctx.lineTo(24, 10);
    ctx.lineTo(-16, 6);
    ctx.closePath();
    ctx.fillStyle = "#cfa558";
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 6 Hexagonal Brass Die-Bolts (12, 2, 4, 6, 8, 10 o'clock = bolts 1..6)
    var rBolt = (rIn + rOut) * 0.5;
    for (var b = 1; b <= 6; b++) {
      var ba = -Math.PI * 0.5 + (b - 1) * (TAU / 6);
      var bx = cx + Math.cos(ba) * rBolt;
      var by = cy + Math.sin(ba) * rBolt;
      var isLit = (rs.rolledBolt === b);
      var boltCol = b <= 2 ? "#2894b0" : (b <= 4 ? "#3ca365" : "#d95b30");

      if (isLit) {
        var gg = ctx.createRadialGradient(bx, by, 2, bx, by, 26);
        gg.addColorStop(0, "rgba(255, 232, 130, 0.95)");
        gg.addColorStop(0.5, boltCol);
        gg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gg;
        ctx.beginPath(); ctx.arc(bx, by, 26, 0, TAU); ctx.fill();
      }

      // Hex bolt head
      ctx.beginPath();
      for (var k = 0; k < 6; k++) {
        var ka = k * (TAU / 6) + 0.2;
        var hx = bx + Math.cos(ka) * (isLit ? 12.5 : 10.5);
        var hy = by + Math.sin(ka) * (isLit ? 12.5 : 10.5);
        if (k === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fillStyle = isLit ? "#ffe17d" : "#b88f46";
      ctx.fill();
      ctx.strokeStyle = isLit ? boltCol : "#1d1509";
      ctx.lineWidth = isLit ? 2.6 : 2;
      ctx.stroke();

      // Glint star-cross on rolled bolt
      if (isLit && rs.boltSpin > 0.7) {
        var sp = 14 + Math.sin(rs.rawT * 10) * 4;
        ctx.strokeStyle = "#fff9d6";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx - sp, by); ctx.lineTo(bx + sp, by);
        ctx.moveTo(bx, by - sp); ctx.lineTo(bx, by + sp);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function drawTurkeyPilotWing(ctx, meta, rs) {
    // Articulated feathered copper wing reaching from foreground pilot seat (x=330, y=542)
    // At t in [0.35..1.65], reaches straight to Lamp Toggle (990, 458) or Ballast Slot (245, 458)!
    var reachU = 0;
    if (rs.t < 2.0 && rs.viewMode === "auto") {
      if (rs.t < 1.05) reachU = easeAt(rs.t, 0.25, 0.98);
      else reachU = 1 - easeAt(rs.t, 1.18, 1.78);
    }

    var useLamp = (meta.defaultTool === "lamp");
    var restTipX = useLamp ? 430 : 385;
    var restTipY = 508;
    var actTipX = useLamp ? 982 : 248;
    var actTipY = useLamp ? 454 : 462;

    // In Act 3 (Trout Looks In), Turkey raises wing in a polite wave / salute near lower-left rim!
    if (rs.pass === "trout") {
      var wave = Math.sin(rs.rawT * 5.2) * 14;
      restTipX = 438 + wave;
      restTipY = 446 - Math.abs(wave) * 0.4;
    }

    var tipX = lerp(restTipX, actTipX, reachU);
    var tipY = lerp(restTipY, actTipY, reachU);
    var shX = useLamp ? 360 : 350;
    var shY = 548;
    var elbX = lerp(shX, tipX, 0.52) + (useLamp ? -18 : -28);
    var elbY = lerp(shY, tipY, 0.52) + 28;

    ctx.save();
    // Upper wing + forearm silhouette
    ctx.beginPath();
    ctx.moveTo(shX - 34, shY + 10);
    ctx.quadraticCurveTo(elbX - 24, elbY, tipX - 18, tipY - 8);
    ctx.arc(tipX, tipY, 18, Math.PI * 1.1, Math.PI * 0.25);
    ctx.quadraticCurveTo(elbX + 22, elbY + 24, shX + 36, shY + 10);
    ctx.closePath();
    var wg = ctx.createLinearGradient(shX, shY, tipX, tipY);
    wg.addColorStop(0, "#3b1c11");
    wg.addColorStop(0.6, "#7c3c21");
    wg.addColorStop(1, "#b8683c");
    ctx.fillStyle = wg;
    ctx.fill();
    ctx.strokeStyle = "#1a0c07";
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Fanned Primary Wing-Tip Feathers (5 articulated quills!)
    var ang = Math.atan2(tipY - elbY, tipX - elbX);
    ctx.translate(tipX, tipY);
    ctx.rotate(ang);
    for (var f = -2; f <= 2; f++) {
      ctx.save();
      ctx.rotate(f * 0.19);
      ctx.beginPath();
      ctx.ellipse(12, 0, 18, 5.2, 0, 0, TAU);
      ctx.fillStyle = (f % 2 === 0) ? "#a85830" : "#803d1f";
      ctx.fill();
      // Cream barred turkey-feather tip!
      ctx.beginPath();
      ctx.ellipse(23, 0, 5, 4.2, 0, 0, TAU);
      ctx.fillStyle = "#ecd7b0";
      ctx.fill();
      ctx.strokeStyle = "#1a0c07";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawEditorialStrip(ctx, W, H, topH, meta, rs) {
    ctx.save();
    // Cream VOIDBASTARD-TAO strip (#faf8f3)
    ctx.fillStyle = "#faf8f3";
    ctx.fillRect(0, topH, W, H - topH);
    ctx.fillStyle = "#14181a";
    ctx.fillRect(0, topH, W, 2.5);

    // PAELEO Blind-Critic Invariant: when showCaptions === false, draw ZERO text!
    if (!rs.showCaptions) {
      ctx.strokeStyle = "#dfdad0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(48, topH + 26);
      ctx.lineTo(W - 48, topH + 26);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Left Column: Station + Clue + SCION Rule
    ctx.fillStyle = "#2d6846";
    ctx.font = "700 12px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(meta.station.toUpperCase() + "  ·  " + meta.scionRule.toUpperCase(), 48, topH + 34);

    ctx.fillStyle = "#14181a";
    ctx.font = "400 20px Georgia, 'Times New Roman', serif";
    ctx.fillText("Rim Clue: " + meta.clue, 48, topH + 66);

    // Hardware status pills
    ctx.font = "600 11.5px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillStyle = "#6b767c";
    var toolStr = "[L] Lamp: " + (rs.lampOn ? "ON" : "OFF") +
                  "   [B] Ballast: " + (rs.ballastOn ? "LOW SHELTER" : "STANDARD") +
                  (rs.rolledBolt ? ("   [R] 1d6 Bolt #" + rs.rolledBolt) : "");
    ctx.fillText(toolStr, 48, topH + 98);

    // Vertical divider
    ctx.strokeStyle = "#dfdad0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(548, topH + 18);
    ctx.lineTo(548, H - 18);
    ctx.stroke();

    // Right Column: Active Pass Kicker + Duck/Rabbit Fork Question
    var rx = 568;
    if (rs.pass === "setup") {
      ctx.fillStyle = "#7a5320";
      ctx.font = "700 12.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("ACT I · SETUP A COCKPIT  ·  OPERATE ONE PART", rx, topH + 36);
      ctx.fillStyle = "#394246";
      ctx.font = "italic 19.5px Georgia, 'Times New Roman', serif";
      var opMsg = (meta.defaultTool === "lamp")
        ? "Turkey reaches right to flip the Lamp Toggle against the creek dusk…"
        : "Turkey slides the Ballast Tray into the Single Slot for low shelter…";
      ctx.fillText(opMsg, rx, topH + 72);
    } else if (rs.pass === "turkey") {
      ctx.fillStyle = "#9e3d1c";
      ctx.font = "700 13px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("FIRST PASS · TURKEY LOOKS OUT  (ODD FACES 1 · 3 · 5)", rx, topH + 36);
      ctx.fillStyle = "#14181a";
      ctx.font = "400 28px Georgia, 'Times New Roman', serif";
      ctx.fillText("“" + meta.turkeyFork + "”", rx, topH + 76);
      ctx.fillStyle = "#9e3d1c";
      ctx.font = "600 12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("Two readings from inside the bread-roll tin", rx, topH + 106);
    } else {
      ctx.fillStyle = "#1d596e";
      ctx.font = "700 13px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("SECOND PASS · TROUT LOOKS IN  (EVEN FACES 2 · 4 · 6)", rx, topH + 36);
      ctx.fillStyle = "#14181a";
      ctx.font = "400 28px Georgia, 'Times New Roman', serif";
      ctx.fillText("“" + meta.troutFork + "”", rx, topH + 76);
      var tier = rs.rolledBolt <= 2 ? "Probable (1–2)" : (rs.rolledBolt <= 4 ? "Plausible (3–4)" : "Preposterous (5–6)");
      ctx.fillStyle = "#1d596e";
      ctx.font = "600 12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("Brook verifies across the glass  ·  Rolled Bolt #" + (rs.rolledBolt || 2) + " (" + tier + ")  ·  Chart Marked", rx, topH + 106);
    }

    // Subtle progress bar along bottom edge
    ctx.fillStyle = "#e6e1d6";
    ctx.fillRect(48, H - 14, W - 96, 4);
    ctx.fillStyle = rs.pass === "trout" ? "#1d596e" : (rs.pass === "turkey" ? "#9e3d1c" : "#9c7636");
    ctx.fillRect(48, H - 14, (W - 96) * (rs.t / 10), 4);

    ctx.restore();
  }

  function applyGrainOverlay(ctx, W, H) {
    var g = getGrain();
    if (!g) return;
    ctx.save();
    var pat = ctx.createPattern(g, "repeat");
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  // ==========================================================================
  // SCENE #11 · TANK — Igloo Water Cooler trailing vinyl tubing
  // Bricolage (SCION 29): hose splice
  // Turkey: "Picnic litter or gill life-support?"
  // Trout:  "Juice-box straw thief or soda dispenser?"
  // ==========================================================================
  var SCENE_11 = {
    id: 11,
    station: "#11 · Tank",
    clue: "Igloo Water Cooler trailing vinyl tubing",
    turkeyFork: "Picnic litter or gill life-support?",
    troutFork: "Juice-box straw thief or soda dispenser?",
    scionRule: "Bricolage (SCION 29): hose splice",
    defaultTool: "ballast",
    render: function (ctx, W, H, t, state) {
      var rs = resolveState(SCENE_11, t, state);
      ctx.clearRect(0, 0, W, H);

      ctx.save();
      ctx.beginPath();
      ctx.arc(PORT.cx, PORT.cy, PORT.r, 0, TAU);
      ctx.clip();

      // Ballast lowers sub into sheltered eddy -> sightline shifts +22px up!
      var trimY = lerp(-18, 12, rs.ballastAnim);
      drawWaterBackdrop(ctx, rs, "#27767b", "#184f56", "#0d292e", 0.65);

      ctx.save();
      ctx.translate(0, trimY);

      // Far river weeds & sunken picnic-bench silhouette
      drawSwayingWeed(ctx, 495, 345, 118, 5, rs.rawT, rs.ballastOn, "#17433f", "#26635c");
      drawSwayingWeed(ctx, 772, 365, 96, 4, rs.rawT + 1.4, rs.ballastOn, "#17433f", "#26635c");

      // Act 2A (2.0..4.8s): Floating soggy paper picnic cup ("Picnic litter...")
      if (rs.pass === "turkey") {
        var cupU = span(rs.actT, 2.0, 5.2);
        if (cupU < 1) {
          ctx.save();
          ctx.translate(lerp(495, 655, cupU), 136 + Math.sin(rs.rawT * 3) * 8);
          ctx.rotate(0.4 + cupU * 1.1);
          ctx.globalAlpha = 1 - span(cupU, 0.85, 1.0);
          ctx.beginPath();
          ctx.moveTo(-14, -16); ctx.lineTo(14, -16); ctx.lineTo(10, 16); ctx.lineTo(-10, 16);
          ctx.closePath();
          ctx.fillStyle = "#ebe4d4"; ctx.fill();
          ctx.strokeStyle = "#c9422f"; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(-12, -4); ctx.lineTo(12, -4); ctx.stroke();
          ctx.strokeStyle = "#172426"; ctx.lineWidth = 1.6; ctx.stroke();
          ctx.restore();
        }
      }

      // Back cobbles
      drawCobbleCluster(ctx, [
        { x: 505, y: 332, rx: 52, ry: 26, rot: -0.1, moss: true },
        { x: 755, y: 356, rx: 56, ry: 24, rot: 0.14, moss: true }
      ], rs.auxWarm);

      // HERO PROP: Wedge-tilted Orange Igloo 5-Gallon Water Cooler!
      var lifePulse = (rs.pass === "turkey" && rs.actT >= 3.6) ? Math.sin(rs.rawT * 8) * 0.03 : 0;
      var fizzPush = (rs.pass === "trout") ? easeAt(rs.actT, 7.0, 7.6) : 0;

      ctx.save();
      ctx.translate(585, 242);
      ctx.rotate(-0.42 + Math.sin(rs.rawT * (rs.ballastOn ? 1.5 : 3.8)) * (rs.ballastOn ? 0.015 : 0.045));
      ctx.scale(1 + lifePulse, 1 - lifePulse * 0.6);

      // Barrel body
      roundRectPath(ctx, -62, -74, 124, 154, 12);
      var cg = ctx.createLinearGradient(-62, 0, 62, 0);
      cg.addColorStop(0, "#b53f12");
      cg.addColorStop(0.38, "#ec6525");
      cg.addColorStop(0.75, "#d8521a");
      cg.addColorStop(1, "#8c2e0c");
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.strokeStyle = "#1c120d";
      ctx.lineWidth = 2.6;
      ctx.stroke();

      // Ribbed horizontal grip bands & vertical flutes
      ctx.fillStyle = "rgba(95, 28, 6, 0.25)";
      ctx.fillRect(-61, -24, 122, 46);
      ctx.strokeStyle = "#2b160c";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-61, -24); ctx.lineTo(61, -24);
      ctx.moveTo(-61, 22); ctx.lineTo(61, 22);
      for (var fl = -52; fl <= 52; fl += 9) {
        ctx.moveTo(fl, -24); ctx.lineTo(fl, 22);
      }
      ctx.stroke();

      // Nameplate plaque (text hidden in blind-critic mode!)
      roundRectPath(ctx, -34, -10, 68, 19, 3);
      ctx.fillStyle = "#f4efe2";
      ctx.fill();
      ctx.strokeStyle = "#2b160c";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (rs.showCaptions) {
        ctx.fillStyle = "#1a3548";
        ctx.font = "800 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("IGLOO", 0, 4);
      } else {
        ctx.fillStyle = "#1a3548";
        ctx.fillRect(-22, -3, 44, 5);
      }

      // White Carry Handles (left & right hinged)
      roundRectPath(ctx, -76, -34, 16, 36, 5);
      ctx.fillStyle = "#e8e4d8"; ctx.fill(); ctx.stroke();
      roundRectPath(ctx, 60, -34, 16, 36, 5);
      ctx.fillStyle = "#e8e4d8"; ctx.fill(); ctx.stroke();

      // White Screw-Top Lid (burping slightly in water!)
      var lidTilt = Math.sin(rs.rawT * 3.4) * 0.04;
      ctx.save();
      ctx.translate(0, -76);
      ctx.rotate(lidTilt);
      roundRectPath(ctx, -65, -14, 130, 22, 8);
      ctx.fillStyle = "#f2eee2";
      ctx.fill();
      ctx.strokeStyle = "#1c120d";
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.restore();

      // Recessed Spigot Alcove + Push-Button Brass Bricolage Manifold!
      roundRectPath(ctx, 10, 38, 34, 34, 9);
      ctx.fillStyle = "#7a2609";
      ctx.fill();
      ctx.stroke();
      // Spigot valve + red push-button (depressed when Trout pushes it in Act 3!)
      ctx.fillStyle = "#ebe6d8";
      ctx.fillRect(19, 49, 16, 12);
      ctx.strokeRect(19, 49, 16, 12);
      ctx.fillStyle = "#d93829";
      ctx.fillRect(22, 44 + fizzPush * 4, 10, 6);
      ctx.restore(); // end cooler body

      // SCION 29 BRICOLAGE HOSE-SPLICE RIG (3 Translucent Vinyl Tubes + Brass T-Splice + Moving Bubbles!)
      var spX = 636, spY = 278;
      // Brass T-Fitting & Duct-Tape Splice
      var spliceTurn = (rs.pass === "turkey" && rs.actT > 3.5) ? easeAt(rs.actT, 3.5, 4.1) : (rs.pass === "trout" ? 1 : 0);
      var hoseSway = Math.sin(rs.rawT * (rs.ballastOn ? 2.2 : 5.5)) * (rs.ballastOn ? 7 : 18);

      var hoses = [
        // Hose A: snakes over cooler shoulder toward surface / upper-right
        { p0: [534, 248], p1: [625, 198 + hoseSway * 0.4], p2: [692, 148 - hoseSway], p3: [722, 82], orange: false },
        // Hose B: from spigot brass T-splice up toward Trout's straw mouth!
        { p0: [spX, spY], p1: [684, 294], p2: [708, 206 + hoseSway * 0.5], p3: rs.pass === "trout" ? [706, 232] : [748, 102], orange: fizzPush > 0.2 },
        // Hose C: gill life-support branch curving along cobbles!
        { p0: [spX, spY], p1: [664, 342], p2: [724, 366], p3: [792, 344 + hoseSway * 0.4], orange: false }
      ];

      for (var h = 0; h < hoses.length; h++) {
        var hs = hoses[h];
        // Outer vinyl wall
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(hs.p0[0], hs.p0[1]);
        ctx.bezierCurveTo(hs.p1[0], hs.p1[1], hs.p2[0], hs.p2[1], hs.p3[0], hs.p3[1]);
        ctx.strokeStyle = "#132628";
        ctx.lineWidth = 11;
        ctx.stroke();

        ctx.strokeStyle = hs.orange ? "rgba(255, 168, 72, 0.82)" : "rgba(205, 242, 238, 0.72)";
        ctx.lineWidth = 7.2;
        ctx.stroke();

        // Inner lumen highlight
        ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Animated Bubble Packets traveling inside the clear vinyl tubing!
        var bSpeed = (spliceTurn > 0.3 || fizzPush > 0.2) ? 0.95 : 0.35;
        var bCount = hs.orange ? 8 : 5;
        for (var k = 0; k < bCount; k++) {
          var bu = ((rs.rawT * bSpeed + k / bCount + h * 0.27) % 1);
          var omt = 1 - bu;
          var bx = omt * omt * omt * hs.p0[0] + 3 * omt * omt * bu * hs.p1[0] + 3 * omt * bu * bu * hs.p2[0] + bu * bu * bu * hs.p3[0];
          var by = omt * omt * omt * hs.p0[1] + 3 * omt * omt * bu * hs.p1[1] + 3 * omt * bu * bu * hs.p2[1] + bu * bu * bu * hs.p3[1];
          ctx.beginPath();
          ctx.arc(bx, by, hs.orange ? 3.2 : 2.5, 0, TAU);
          ctx.fillStyle = hs.orange ? "#ffe28a" : "#ffffff";
          ctx.fill();
        }
      }

      // Silver Duct-Tape & Brass T-Valve Splice at spigot!
      ctx.save();
      ctx.translate(spX + 6, spY + 4);
      ctx.fillStyle = "#aeb8b8"; // duct tape collar
      ctx.fillRect(-9, -8, 18, 16);
      ctx.strokeStyle = "#172224"; ctx.lineWidth = 1.8; ctx.strokeRect(-9, -8, 18, 16);
      // Rotating brass T-lever
      ctx.rotate(-0.6 + spliceTurn * 1.15);
      ctx.fillStyle = "#e3b34c";
      ctx.fillRect(-3, -13, 6, 22);
      ctx.strokeRect(-3, -13, 6, 22);
      ctx.restore();

      // Act 2B (3.2..5.6s): Two small creek chubs breathing metered oxygen at Hose B/C ("...or gill life-support?")
      if (rs.pass === "turkey" && rs.actT >= 3.1) {
        var chubIn = easeAt(rs.actT, 3.1, 3.85);
        var cx1 = lerp(835, 742, chubIn);
        drawBrookTrout(ctx, { x: cx1, y: 292, scale: 0.44, dir: -1, t: rs.rawT * 1.5, jaw: 0.65 + Math.sin(rs.rawT * 9) * 0.25 });
        drawBrookTrout(ctx, { x: cx1 + 26, y: 326, scale: 0.36, dir: -1, t: rs.rawT * 1.5 + 1, jaw: 0.55 });
      }

      // Rising Bubble Plume from Cooler Lid & Hose Tips (big orange soda fizz fountain when spigot pushed!)
      var br = rng32(1103);
      var plumeAmt = fizzPush > 0.2 ? 36 : 14;
      for (var p = 0; p < plumeAmt; p++) {
        var pu = ((rs.rawT * (0.48 + (p % 4) * 0.14) + br()) % 1);
        var px = 640 + (br() - 0.35) * (fizzPush > 0.2 ? 125 : 85) + Math.sin(rs.rawT * 3 + p) * 8;
        var py = lerp(248, 72, pu);
        var pr = (fizzPush > 0.2 ? 3.5 : 2.5) + br() * 5.8;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, TAU);
        ctx.fillStyle = (fizzPush > 0.2 && p % 3 !== 0) ? "rgba(255, 174, 56, 0.88)" : "rgba(225, 250, 248, 0.65)";
        ctx.fill();
        ctx.strokeStyle = "rgba(20, 50, 54, 0.55)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Foreground Mossy Creek Cobbles
      drawCobbleCluster(ctx, [
        { x: 545, y: 358, rx: 56, ry: 30, rot: 0.12, moss: true },
        { x: 625, y: 382, rx: 54, ry: 28, rot: -0.08, moss: true },
        { x: 482, y: 392, rx: 48, ry: 26, rot: 0.2, moss: false },
        { x: 725, y: 396, rx: 52, ry: 25, rot: -0.15, moss: true }
      ], rs.auxWarm);
      drawSwayingWeed(ctx, 745, 420, 92, 4, rs.rawT + 0.7, rs.ballastOn, "#133a36", "#235c54");

      // ACT 3: SECOND PASS · TROUT LOOKS IN ("Juice-box straw thief or soda dispenser?")
      if (rs.pass === "trout") {
        var enter = easeOutBack(span(rs.actT, 5.6, 6.45));
        var swoop = easeAt(rs.actT, 7.3, 8.6);
        var tx = lerp(860, lerp(772, 718, swoop), clamp(enter, 0, 1.08));
        var ty = lerp(214, 266, swoop) + Math.sin(rs.rawT * 3.2) * 5;
        // Trout swoops down at t=7.3..9.2s to press spigot & sip fizzy orange soda stream!
        drawBrookTrout(ctx, {
          x: tx, y: ty, scale: 0.96, dir: -1, pitch: swoop * 0.16, t: rs.rawT,
          jaw: fizzPush > 0.1 ? 0.72 : 0.28,
          finPoint: fizzPush * 0.65,
          lookX: -0.6, lookY: 0.35
        });

        // Visual Duck/Rabbit cross-glass reflection: Turkey's beak + tin hull seen by Trout as a foil Juice-Box / Soda Nozzle!
        var boxAlpha = easeAt(rs.actT, 6.3, 7.2) * 0.42;
        if (boxAlpha > 0.02) {
          ctx.save();
          ctx.globalAlpha = boxAlpha;
          roundRectPath(ctx, 492, 294, 78, 98, 8);
          ctx.strokeStyle = "#ffd166";
          ctx.lineWidth = 2.5;
          ctx.setLineDash([5, 4]);
          ctx.stroke();
          // Bendy straw silhouette rising out of Turkey's beak reflection!
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(552, 344);
          ctx.lineTo(576, 314);
          ctx.lineTo(602, 318);
          ctx.strokeStyle = "#fff1b8";
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.restore(); // end ballast trim offset

      // Volumetric lamp cone & Turkey interior reflection on glass
      drawSearchlightCone(ctx, rs, 605, 225, 135, rs.lampOn ? 1.0 : 0.55);
      drawTurkeyGlassReflection(ctx, rs, { nod: rs.pass === "turkey" ? Math.sin(rs.rawT * 4) * 0.1 : 0.05 });

      ctx.restore(); // end porthole clip

      drawSetupACockpit(ctx, W, H, SCENE_11, rs);
      applyGrainOverlay(ctx, W, H);
    }
  };

  // ==========================================================================
  // SCENE #12 · KEEL — Cardboard stage with green Floor Porthole
  // Cutout Stage (SCION 31): rib zoom
  // Turkey: "Whirlpool drain or tourist trap?"
  // Trout:  "1-dollar sideshow freak or stage spotlight?"
  // ==========================================================================
  var SCENE_12 = {
    id: 12,
    station: "#12 · Keel",
    clue: "Cardboard stage with green Floor Porthole",
    turkeyFork: "Whirlpool drain or tourist trap?",
    troutFork: "1-dollar sideshow freak or stage spotlight?",
    scionRule: "Cutout Stage (SCION 31): rib zoom",
    defaultTool: "lamp",
    render: function (ctx, W, H, t, state) {
      var rs = resolveState(SCENE_12, t, state);
      ctx.clearRect(0, 0, W, H);

      ctx.save();
      ctx.beginPath();
      ctx.arc(PORT.cx, PORT.cy, PORT.r, 0, TAU);
      ctx.clip();

      var trimY = rs.ballastOn ? 16 : 0;
      drawWaterBackdrop(ctx, rs, "#1d5758", "#0e3336", "#081c1e", 0.72);

      // SCION 31 RIB ZOOM: Multiplane zoom & wing-parting across Act 2!
      var ribZoom = (rs.pass === "turkey")
        ? lerp(1.0, 1.13, easeAt(rs.actT, 2.0, 5.2))
        : (rs.pass === "trout" ? 1.06 : 1.0);
      var wingOpen = (rs.pass === "turkey")
        ? easeAt(rs.actT, 2.0, 4.4)
        : (rs.pass === "trout" ? 0.85 : easeAt(rs.t, 1.0, 2.0) * 0.35);

      ctx.save();
      ctx.translate(PORT.cx, PORT.cy + 18 + trimY);
      ctx.scale(ribZoom, ribZoom);
      ctx.translate(-PORT.cx, -(PORT.cy + 18));

      // Emerald Sea-of-Holes Vertical Light Column rising from the Floor Porthole!
      var holeX = 640, holeY = 326;
      var emGrd = ctx.createLinearGradient(holeX, holeY + 10, holeX, 95);
      emGrd.addColorStop(0, "rgba(0, 255, 152, 0.88)");
      emGrd.addColorStop(0.55, "rgba(12, 214, 134, 0.44)");
      emGrd.addColorStop(1, "rgba(12, 214, 134, 0)");
      ctx.fillStyle = emGrd;
      ctx.beginPath();
      ctx.moveTo(holeX - 56, holeY);
      ctx.lineTo(holeX - 96, 105);
      ctx.lineTo(holeX + 96, 105);
      ctx.lineTo(holeX + 56, holeY);
      ctx.closePath();
      ctx.fill();

      // Cardboard Stage Planked Deck (trapezoid perspective with corrugated front edge!)
      ctx.beginPath();
      ctx.moveTo(506, 294);
      ctx.lineTo(774, 294);
      ctx.lineTo(816, 366);
      ctx.lineTo(464, 366);
      ctx.closePath();
      var deckG = ctx.createLinearGradient(640, 294, 640, 366);
      deckG.addColorStop(0, rs.lampOn ? "#b69862" : "#566357");
      deckG.addColorStop(1, rs.lampOn ? "#8d6d3d" : "#34423b");
      ctx.fillStyle = deckG;
      ctx.fill();
      ctx.strokeStyle = "#191c18";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Perspective stage floorboards
      ctx.strokeStyle = "rgba(25, 28, 24, 0.42)";
      ctx.lineWidth = 1.3;
      for (var p = -3; p <= 3; p++) {
        ctx.beginPath();
        ctx.moveTo(640 + p * 36, 294);
        ctx.lineTo(640 + p * 50, 366);
        ctx.stroke();
      }
      // Corrugated cardboard flute zig-zag along stage apron!
      ctx.fillStyle = rs.lampOn ? "#8c693a" : "#3a453d";
      ctx.fillRect(468, 366, 344, 13);
      ctx.strokeStyle = "#191c18";
      ctx.strokeRect(468, 366, 344, 13);
      ctx.beginPath();
      for (var zx = 472; zx < 808; zx += 10) {
        ctx.moveTo(zx, 378); ctx.lineTo(zx + 5, 367); ctx.lineTo(zx + 10, 378);
      }
      ctx.stroke();

      // GREEN FLOOR PORTHOLE + Whirlpool Spiral Vortex!
      ctx.save();
      ctx.translate(holeX, holeY);
      ctx.scale(1, 0.34);
      ctx.beginPath();
      ctx.arc(0, 0, 56, 0, TAU);
      ctx.fillStyle = "#043d2a";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 5, 50, 0, TAU);
      ctx.fillStyle = "#08f29a";
      ctx.fill();

      // Animated Whirlpool Drain Spiral (fast in Act 2A: "Whirlpool drain...")
      var spinRate = (rs.pass === "turkey" && rs.actT < 3.9) ? 8.5 : 3.2;
      ctx.rotate(rs.rawT * spinRate);
      ctx.strokeStyle = "#056b46";
      ctx.lineWidth = 4.5;
      for (var arm = 0; arm < 3; arm++) {
        ctx.save();
        ctx.rotate(arm * (TAU / 3));
        ctx.beginPath();
        for (var sr = 4; sr < 46; sr += 4) {
          var sa = sr * 0.13;
          if (sr === 4) ctx.moveTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
          else ctx.lineTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      // Floor hole rim
      ctx.beginPath();
      ctx.ellipse(holeX, holeY, 56, 19, 0, 0, TAU);
      ctx.strokeStyle = "#12241d";
      ctx.lineWidth = 2.6;
      ctx.stroke();

      // Act 2A (2.0..3.8s): Tiny paper scraps spiraling down into the drain!
      if (rs.pass === "turkey" && rs.actT < 4.1) {
        for (var d = 0; d < 5; d++) {
          var du = ((rs.rawT * 0.85 + d * 0.2) % 1);
          var rad = (1 - du) * 58;
          var da = rs.rawT * 6 + d * 1.25;
          var sx = holeX + Math.cos(da) * rad;
          var sy = holeY - (1 - du) * 95 + Math.sin(da) * rad * 0.25;
          ctx.fillStyle = "#f2ead4";
          ctx.fillRect(sx - 3, sy - 2, 6, 4);
        }
      }

      // 3 Multiplane Pairs of Corrugated Cardboard Theatre Wings + Scalloped Valance!
      for (var layer = 2; layer >= 0; layer--) {
        var inset = layer * 24;
        var slide = wingOpen * (18 - layer * 5);
        var shade = rs.lampOn
          ? (layer === 0 ? "#c8a974" : layer === 1 ? "#ab8b58" : "#896c40")
          : (layer === 0 ? "#5a7268" : layer === 1 ? "#455b53" : "#31443e");

        // Left & Right Cardboard Curtain Wings
        var lx = 486 + inset - slide;
        var rx = 794 - inset + slide;
        var topY = 128 + layer * 10;
        var botY = 318 - layer * 8;

        for (var side = -1; side <= 1; side += 2) {
          var wx = side < 0 ? lx : rx - 42;
          ctx.fillStyle = shade;
          ctx.strokeStyle = "#181d1a";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.rect(wx, topY, 42, botY - topY);
          ctx.fill(); ctx.stroke();

          // Curtain fold lines + brass paper-brad fastener!
          ctx.beginPath();
          ctx.moveTo(wx + 14, topY); ctx.lineTo(wx + 11, botY);
          ctx.moveTo(wx + 28, topY); ctx.lineTo(wx + 31, botY);
          ctx.strokeStyle = "rgba(20,24,20,0.35)";
          ctx.lineWidth = 1.4;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(wx + 21, topY + 14, 4, 0, TAU);
          ctx.fillStyle = "#e0b24c";
          ctx.fill();
        }

        // Top Scalloped Cardboard Valance Arch
        ctx.fillStyle = shade;
        ctx.strokeStyle = "#181d1a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(476 + inset, topY - 8);
        ctx.lineTo(804 - inset, topY - 8);
        ctx.lineTo(804 - inset, topY + 18);
        for (var sc = 4; sc >= 0; sc--) {
          var sw = (328 - inset * 2) / 5;
          var cxS = 476 + inset + sc * sw + sw * 0.5;
          ctx.arc(cxS, topY + 18, sw * 0.5, 0, Math.PI, false);
        }
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      }

      // Act 2B (3.7..5.6s): Hinged Cardboard "TOURIST TRAP / TICKET" Arrow Sign pops out on spring!
      if (rs.pass === "turkey" && rs.actT >= 3.65) {
        var pop = easeOutBack(span(rs.actT, 3.65, 4.25));
        ctx.save();
        ctx.translate(766, 268);
        ctx.rotate(lerp(1.3, -0.08 + Math.sin(rs.rawT * 9) * 0.04, pop));
        // Spring arm
        ctx.strokeStyle = "#d9a74a"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-42, -8); ctx.stroke();
        // Painted arrow placard pointing at the hole!
        ctx.beginPath();
        ctx.moveTo(-98, -10);
        ctx.lineTo(-74, -26);
        ctx.lineTo(-74, -18);
        ctx.lineTo(-32, -18);
        ctx.lineTo(-32, -2);
        ctx.lineTo(-74, -2);
        ctx.lineTo(-74, 6);
        ctx.closePath();
        ctx.fillStyle = "#e85d35";
        ctx.fill();
        ctx.strokeStyle = "#181816";
        ctx.lineWidth = 2;
        ctx.stroke();
        // Starburst / $1 coin icon (wordless when showCaptions===false!)
        ctx.beginPath();
        ctx.arc(-52, -10, 6.5, 0, TAU);
        ctx.fillStyle = "#ffe066";
        ctx.fill(); ctx.stroke();
        if (rs.showCaptions) {
          ctx.fillStyle = "#181816";
          ctx.font = "700 9px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("$1", -52, -7);
        }
        ctx.restore();
      }

      // ACT 3: SECOND PASS · TROUT LOOKS IN ("1-dollar sideshow freak or stage spotlight?")
      if (rs.pass === "trout") {
        var tIn = easeOutBack(span(rs.actT, 5.6, 6.45));
        var centerMove = easeAt(rs.actT, 7.3, 8.7);
        var bow = centerMove * 0.32;
        var troutX = lerp(845, lerp(732, 652, centerMove), clamp(tIn, 0, 1.05));
        var troutY = lerp(268, 246, centerMove) + Math.sin(rs.rawT * 3.0) * 5;

        // Overhead + Footlight Golden Stage Spotlight Cone & Paper Star Confetti in second beat (7.3..9.8s)!
        if (rs.actT >= 7.2) {
          var spotA = easeAt(rs.actT, 7.2, 8.0);
          ctx.save();
          var sg = ctx.createLinearGradient(troutX - 10, 125, troutX - 10, 325);
          sg.addColorStop(0, "rgba(255, 232, 130, " + (spotA * 0.42).toFixed(3) + ")");
          sg.addColorStop(1, "rgba(255, 210, 95, " + (spotA * 0.52).toFixed(3) + ")");
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.moveTo(troutX - 30, 125);
          ctx.lineTo(troutX + 18, 125);
          ctx.lineTo(troutX + 58, 320);
          ctx.lineTo(troutX - 72, 320);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(troutX - 8, 318, 64, 15, 0, 0, TAU);
          ctx.fill();
          // Falling paper star confetti
          for (var cf = 0; cf < 8; cf++) {
            var cfx = troutX - 48 + cf * 14 + Math.sin(rs.rawT * 4 + cf) * 6;
            var cfy = 148 + ((rs.rawT * 52 + cf * 23) % 155);
            ctx.fillStyle = (cf % 2 === 0) ? "#ffe066" : "#ff8566";
            ctx.fillRect(cfx, cfy, 5, 5);
          }
          ctx.restore();
        }

        drawBrookTrout(ctx, {
          x: troutX, y: troutY, scale: 0.92, dir: -1,
          pitch: bow, t: rs.rawT, jaw: 0.26 + centerMove * 0.2, lookX: -0.7, lookY: 0.3
        });

        // Shiny Brass Admission Coin/Token held up by Trout's fin toward the glass!
        var coinX = troutX - 46, coinY = troutY + 18;
        ctx.save();
        ctx.translate(coinX, coinY);
        ctx.scale(Math.cos(rs.rawT * 4.5) * 0.7 + 0.3, 1);
        ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU);
        ctx.fillStyle = "#ffd659"; ctx.fill();
        ctx.strokeStyle = "#5c3f0d"; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.stroke();
        ctx.restore();

        // Carnival Frame Reflection around Turkey ("1-dollar sideshow freak...")
        var carnivalA = easeAt(rs.actT, 6.1, 7.0) * 0.48;
        if (carnivalA > 0.02) {
          ctx.save();
          ctx.globalAlpha = carnivalA;
          ctx.strokeStyle = "#e85d35";
          ctx.lineWidth = 3;
          ctx.strokeRect(474, 304, 88, 92);
          for (var bulb = 0; bulb < 5; bulb++) {
            ctx.beginPath();
            ctx.arc(482 + bulb * 18, 304, 3.5, 0, TAU);
            ctx.fillStyle = ((bulb + Math.floor(rs.rawT * 6)) % 2 === 0) ? "#ffe680" : "#ff7a59";
            ctx.fill();
          }
          ctx.restore();
        }
      }

      ctx.restore(); // end ribZoom

      // Framing creek rocks & weeds at bottom edges
      drawCobbleCluster(ctx, [
        { x: 486, y: 342, rx: 48, ry: 22, rot: 0.1, moss: false },
        { x: 786, y: 368, rx: 46, ry: 20, rot: -0.15, moss: true }
      ], rs.lampOn);
      drawSwayingWeed(ctx, 760, 424, 94, 4, rs.rawT, rs.ballastOn, "#173d38", "#275e56");

      var spotAimX = (rs.pass === "trout" && rs.actT > 7.1) ? lerp(640, 706, easeAt(rs.actT, 7.1, 7.9)) : 640;
      drawSearchlightCone(ctx, rs, spotAimX, 235, 145, 1.0);
      drawTurkeyGlassReflection(ctx, rs, { beakOpen: rs.pass === "trout" ? 0.32 : 0.08 });

      ctx.restore(); // end porthole clip

      drawSetupACockpit(ctx, W, H, SCENE_12, rs);
      applyGrainOverlay(ctx, W, H);
    }
  };

  // ==========================================================================
  // SCENE #13 · ARCH — Bell Boulder arch with brass twig-bell
  // Clockwise Etiquette (SCION 48)
  // Turkey: "Tripwire alarm or dinner bell?"
  // Trout:  "Polite ferry customer or bell-ringer prank?"
  // ==========================================================================
  var SCENE_13 = {
    id: 13,
    station: "#13 · Arch",
    clue: "Bell Boulder arch with brass twig-bell",
    turkeyFork: "Tripwire alarm or dinner bell?",
    troutFork: "Polite ferry customer or bell-ringer prank?",
    scionRule: "Clockwise Etiquette (SCION 48)",
    defaultTool: "ballast",
    render: function (ctx, W, H, t, state) {
      var rs = resolveState(SCENE_13, t, state);
      ctx.clearRect(0, 0, W, H);

      ctx.save();
      ctx.beginPath();
      ctx.arc(PORT.cx, PORT.cy, PORT.r, 0, TAU);
      ctx.clip();

      var trimY = lerp(-20, 10, rs.ballastAnim);
      drawWaterBackdrop(ctx, rs, "#69b7b0", "#2f7778", "#133a3d", 0.58);

      ctx.save();
      ctx.translate(0, trimY);

      // Distant sunlit river bend boulders through the arch opening
      drawCobbleCluster(ctx, [
        { x: 565, y: 278, rx: 46, ry: 22, rot: -0.06, moss: true },
        { x: 718, y: 292, rx: 42, ry: 18, rot: 0.08, moss: true }
      ], true);

      // SCION 48: Clockwise Swirling Current Motes inside the Arch!
      var cwSpeed = rs.ballastOn ? 1.15 : 2.4;
      ctx.save();
      for (var m = 0; m < 12; m++) {
        var ma = rs.rawT * cwSpeed + m * (TAU / 12); // +angle = CLOCKWISE in screen coords (+X right, +Y down)!
        var mx = 640 + Math.cos(ma) * (92 + (m % 3) * 16);
        var my = 248 + Math.sin(ma) * (68 + (m % 2) * 14);
        ctx.strokeStyle = "rgba(218, 250, 240, 0.36)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(640, 248, 92 + (m % 3) * 16, ma - 0.22, ma);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 236, 165, 0.55)";
        ctx.beginPath(); ctx.arc(mx, my, 2.3, 0, TAU); ctx.fill();
      }
      ctx.restore();

      // GRAND MOSSY STONE BOULDER ARCH (segmented keystone masonry + lush moss!)
      var archSegs = 9;
      for (var i = 0; i < archSegs; i++) {
        var a0 = Math.PI + (i / archSegs) * Math.PI;
        var a1 = Math.PI + ((i + 1) / archSegs) * Math.PI;
        var rInner = 122, rOuter = 172;
        ctx.beginPath();
        ctx.arc(640, 272, rOuter, a0, a1);
        ctx.arc(640, 272, rInner, a1, a0, true);
        ctx.closePath();
        ctx.fillStyle = (i % 2 === 0) ? "#5a685b" : "#4b594e";
        ctx.fill();
        ctx.strokeStyle = "#1a2420";
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Lush emerald moss tufts along top of arch stones
        var am = (a0 + a1) * 0.5;
        var mxA = 640 + Math.cos(am) * (rOuter - 12);
        var myA = 272 + Math.sin(am) * (rOuter - 12);
        ctx.beginPath();
        ctx.ellipse(mxA, myA, 22, 11, am + Math.PI * 0.5, 0, TAU);
        ctx.fillStyle = "#5c8c42";
        ctx.fill();
      }

      // Carved Clockwise Arrow Emblem on Keystone (wordless SCION 48 cue!)
      ctx.save();
      ctx.translate(640, 126);
      ctx.strokeStyle = "#d9c99e";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 9, -Math.PI * 0.8, Math.PI * 0.55); // clockwise arc
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4, 9); ctx.lineTo(10, 8); ctx.lineTo(7, 3);
      ctx.stroke();
      ctx.restore();

      // Forked Alder Twig wedged at top of arch
      ctx.strokeStyle = "#5c3e24";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(618, 108);
      ctx.quadraticCurveTo(645, 128, 692, 122);
      ctx.moveTo(656, 124);
      ctx.lineTo(676, 105);
      ctx.stroke();
      ctx.strokeStyle = "#1c1208";
      ctx.lineWidth = 2;
      ctx.stroke();

      // BELL & ROPE PHYSICS across Acts 1, 2, 3!
      var bellAng = 0;
      var ropeBlow = (1 - rs.ballastAnim) * 0.48; // blown sideways before ballast settles!
      var ringWave = 0;

      if (rs.pass === "turkey") {
        if (rs.actT < 3.45) {
          // Act 2A: Tripwire tremble!
          bellAng = Math.sin(rs.rawT * 26) * 0.05;
        } else {
          // Act 2B: Dinner Bell Toll starting at t=3.45s (swings wide at t=4.0s!)
          var dt2 = rs.actT - 3.45;
          bellAng = Math.cos(dt2 * 5.7) * Math.exp(-dt2 * 0.55) * -0.36;
          ringWave = dt2;
        }
      } else if (rs.pass === "trout") {
        // Act 3: Trout tugs rope at t=6.35s (-24 deg at 6.8s) & rebounds (+20 deg at 9.2s)!
        var dt3 = rs.actT - 6.35;
        if (dt3 > 0) {
          bellAng = Math.sin(dt3 * 3.8) * Math.exp(-dt3 * 0.28) * -0.38;
          ringWave = dt3 % 1.45;
        }
      } else {
        bellAng = ropeBlow * 0.35 + Math.sin(rs.rawT * 4) * 0.05;
      }

      // Act 2A (2.0..4.3s): Taut Red Tripwire Line across the arch with warning tin tags!
      if (rs.pass === "turkey" && rs.actT < 4.35) {
        var twAlpha = 1 - span(rs.actT, 4.05, 4.35);
        ctx.save();
        ctx.globalAlpha = twAlpha;
        ctx.strokeStyle = "#d93b2b";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(506, 268);
        ctx.lineTo(640, 286);
        ctx.lineTo(774, 268);
        ctx.stroke();
        // Little red triangular tripwire flags
        for (var tf = -1; tf <= 1; tf += 2) {
          var fx = 640 + tf * 72;
          ctx.fillStyle = "#e04836";
          ctx.beginPath();
          ctx.moveTo(fx - 7, 276); ctx.lineTo(fx + 7, 276); ctx.lineTo(fx, 292);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Expanding Golden Acoustic Bell Ripples when ringing!
      if (ringWave > 0.02 && ringWave < 1.5) {
        for (var rw = 0; rw < 3; rw++) {
          var rr = (ringWave * 95 + rw * 28) % 145;
          var ra = clamp(1 - rr / 145, 0, 1) * 0.62;
          ctx.beginPath();
          ctx.arc(640, 206, 26 + rr, 0, TAU);
          ctx.strokeStyle = "rgba(255, 224, 122, " + ra.toFixed(3) + ")";
          ctx.lineWidth = 2.6;
          ctx.stroke();
        }
      }

      // Articulated Brass Twig-Bell + Clapper + Braided Hemp Rope!
      ctx.save();
      ctx.translate(640, 122);
      // Iron suspension ring
      ctx.strokeStyle = "#3a3530"; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.ellipse(0, 8, 5, 11, 0, 0, TAU); ctx.stroke();

      ctx.translate(0, 18);
      ctx.rotate(bellAng);

      // Braided Hemp Pull-Rope + Clapper (lags bell swing slightly!)
      var clapAng = -bellAng * 0.45 + ropeBlow;
      ctx.save();
      ctx.translate(0, 68);
      ctx.rotate(clapAng);
      // Brass clapper ball
      ctx.beginPath(); ctx.arc(0, 8, 7.5, 0, TAU);
      ctx.fillStyle = "#cfa046"; ctx.fill();
      ctx.strokeStyle = "#1c1408"; ctx.lineWidth = 2; ctx.stroke();

      // Braided rope down to knot
      var tugY = (rs.pass === "trout" && rs.actT > 6.4 && rs.actT < 6.8) ? 10 : 0;
      ctx.strokeStyle = "#c8ab74";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 15);
      ctx.quadraticCurveTo(Math.sin(rs.rawT * 4) * 5, 52, 0, 86 + tugY);
      ctx.stroke();
      ctx.strokeStyle = "#2b1f0e";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      // Knotted tassel
      ctx.beginPath(); ctx.arc(0, 88 + tugY, 5.5, 0, TAU);
      ctx.fillStyle = "#bfa065"; ctx.fill(); ctx.stroke();
      ctx.restore();

      // Cast Brass Bell Body
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.quadraticCurveTo(-28, 4, -32, 36);
      ctx.quadraticCurveTo(-36, 56, -50, 66);
      ctx.ellipse(0, 68, 50, 8, 0, Math.PI, 0, true);
      ctx.quadraticCurveTo(36, 56, 32, 36);
      ctx.quadraticCurveTo(28, 4, 10, 0);
      ctx.closePath();
      var blG = ctx.createLinearGradient(-46, 0, 46, 0);
      blG.addColorStop(0, "#7c5820");
      blG.addColorStop(0.32, "#f5cf76");
      blG.addColorStop(0.62, "#c8983c");
      blG.addColorStop(1, "#664616");
      ctx.fillStyle = blG;
      ctx.fill();
      ctx.strokeStyle = "#1c1408";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // Decorative bell lip bands
      ctx.beginPath();
      ctx.moveTo(-42, 58); ctx.quadraticCurveTo(0, 63, 42, 58);
      ctx.stroke();
      ctx.restore(); // end bell

      // Act 2B (3.5..5.6s): Eager little fry darting in for "dinner bell"!
      if (rs.pass === "turkey" && rs.actT >= 3.5) {
        var fryU = easeAt(rs.actT, 3.5, 4.2);
        drawBrookTrout(ctx, { x: lerp(810, 706, fryU), y: 270, scale: 0.38, dir: -1, t: rs.rawT * 1.6 });
        drawBrookTrout(ctx, { x: lerp(470, 574, fryU), y: 290, scale: 0.35, dir: 1, t: rs.rawT * 1.6 + 1 });
      }

      // ACT 3: SECOND PASS · TROUT LOOKS IN ("Polite ferry customer or bell-ringer prank?")
      // Brook Trout enters CLOCKWISE around the arch (rope tug at 6.8s -> cheeky prank getaway high-right at 9.2s!)
      if (rs.pass === "trout") {
        var cwProg = span(rs.actT, 5.6, 9.5);
        var tx, ty, pitch = 0, capOn = true;
        if (cwProg < 0.25) {
          var u1 = smooth(cwProg / 0.25);
          tx = lerp(775, 702, u1);
          ty = lerp(215, 286, u1);
          pitch = lerp(0.3, 0.02, u1);
        } else if (cwProg < 0.56) {
          // Tugging the hemp bell-rope & waiting politely like a ferry passenger!
          tx = 702 + Math.sin(rs.rawT * 3) * 5;
          ty = 286 + Math.sin(rs.rawT * 2.5) * 4;
        } else {
          // Prankster dart-and-peek getaway up toward the arch top-right!
          var u3 = smooth((cwProg - 0.56) / 0.44);
          tx = lerp(702, 756, u3);
          ty = lerp(286, 218, u3);
          pitch = -0.24 * u3;
        }
        drawBrookTrout(ctx, {
          x: tx, y: ty, scale: 0.94, dir: -1, pitch: pitch,
          t: rs.rawT, jaw: (cwProg > 0.20 && cwProg < 0.45) ? 0.62 : 0.22,
          cap: capOn, lookX: -0.7, lookY: 0.2
        });
      }

      // Foreground reeds & base boulders
      drawSwayingWeed(ctx, 492, 348, 108, 5, rs.rawT, rs.ballastOn, "#1c4a3c", "#2e6e58");
      drawSwayingWeed(ctx, 766, 412, 104, 4, rs.rawT + 1.1, rs.ballastOn, "#1c4a3c", "#2e6e58");
      drawCobbleCluster(ctx, [
        { x: 502, y: 356, rx: 48, ry: 22, rot: 0.08, moss: true },
        { x: 752, y: 382, rx: 48, ry: 20, rot: -0.1, moss: true }
      ], rs.auxWarm);

      ctx.restore(); // end ballast trim

      drawSearchlightCone(ctx, rs, 640, 210, 140, rs.lampOn ? 1.0 : 0.62);
      drawTurkeyGlassReflection(ctx, rs, { nod: (rs.pass === "turkey" && rs.actT < 3.8) ? -0.12 : 0.06 });

      ctx.restore(); // end porthole clip

      drawSetupACockpit(ctx, W, H, SCENE_13, rs);
      applyGrainOverlay(ctx, W, H);
    }
  };

  // ==========================================================================
  // SCENE #14 · TOWER — Sinking crimson autumn maple leaf
  // Seasonal Timer (SCION 11) · Yuri Norstein multiplane homage
  // Turkey: "Underwater spark or Thanksgiving calendar?"
  // Trout:  "Falling sky-feather or distress flare?"
  // ==========================================================================
  function drawSugarMapleLeaf(ctx, size, curl, glowAmt) {
    ctx.save();
    ctx.scale(size, size * curl);

    // Warm backlit ember halo when lamp transilluminates leaf!
    if (glowAmt > 0.05) {
      var hg = ctx.createRadialGradient(0, 4, 4, 0, 0, 78);
      hg.addColorStop(0, "rgba(255, 176, 68, " + (0.58 * glowAmt).toFixed(3) + ")");
      hg.addColorStop(1, "rgba(255, 90, 30, 0)");
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.arc(0, 0, 78, 0, TAU); ctx.fill();
    }

    // Classic 5-lobed serrated Sugar Maple polygon path
    var pts = [
      [0, 34], [-14, 38], [-28, 34], [-22, 24], [-48, 16], [-38, 6], [-58, -4],
      [-36, -12], [-44, -26], [-24, -22], [-18, -42], [-8, -32], [0, -56],
      [8, -32], [18, -42], [24, -22], [44, -26], [36, -12], [58, -4],
      [38, 6], [48, 16], [22, 24], [28, 34], [14, 38]
    ];
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();

    var lg = ctx.createRadialGradient(0, 10, 4, 0, -10, 56);
    if (glowAmt > 0.25) {
      lg.addColorStop(0, "#ffb838");   // golden transilluminated center!
      lg.addColorStop(0.48, "#d93b22"); // glowing scarlet
      lg.addColorStop(1, "#821414");    // deep crimson tips
    } else {
      lg.addColorStop(0, "#7a2c24");
      lg.addColorStop(1, "#3d1416");
    }
    ctx.fillStyle = lg;
    ctx.fill();
    ctx.strokeStyle = "#240a08";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Curved petiole stem
    ctx.beginPath();
    ctx.moveTo(0, 32);
    ctx.quadraticCurveTo(-8, 50, -20, 62);
    ctx.strokeStyle = glowAmt > 0.25 ? "#c94c24" : "#4a1c16";
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    ctx.stroke();

    // Luminous branching leaf veins
    ctx.strokeStyle = glowAmt > 0.25 ? "rgba(255, 226, 132, 0.85)" : "rgba(180, 95, 75, 0.4)";
    ctx.lineWidth = 1.6;
    var veins = [[0, -48], [-36, -20], [36, -20], [-42, 12], [42, 12]];
    for (var v = 0; v < veins.length; v++) {
      ctx.beginPath();
      ctx.moveTo(0, 28);
      ctx.lineTo(veins[v][0], veins[v][1]);
      ctx.stroke();
    }

    ctx.restore();
  }

  var SCENE_14 = {
    id: 14,
    station: "#14 · Tower",
    clue: "Sinking crimson autumn maple leaf",
    turkeyFork: "Underwater spark or Thanksgiving calendar?",
    troutFork: "Falling sky-feather or distress flare?",
    scionRule: "Seasonal Timer (SCION 11)",
    defaultTool: "lamp",
    render: function (ctx, W, H, t, state) {
      var rs = resolveState(SCENE_14, t, state);
      ctx.clearRect(0, 0, W, H);

      ctx.save();
      ctx.beginPath();
      ctx.arc(PORT.cx, PORT.cy, PORT.r, 0, TAU);
      ctx.clip();

      var trimY = rs.ballastOn ? 15 : 0;
      drawWaterBackdrop(ctx, rs, "#236b6e", "#134247", "#092125", 0.68);

      ctx.save();
      ctx.translate(0, trimY);

      // Norstein Multiplane Mist Layer 1: Distant ghostly seasonal leaves (SCION 11 Seasonal Timer!)
      if (rs.pass === "turkey" && rs.actT >= 3.2) {
        var calA = easeAt(rs.actT, 3.2, 3.95) * 0.68;
        ctx.save();
        ctx.globalAlpha = calA;
        // Clockwork Seasonal Timer dial ring + tick marks + three ghostly calendar leaves!
        ctx.strokeStyle = "rgba(255, 228, 162, 0.62)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 8]);
        ctx.beginPath();
        ctx.arc(640, 245, 118, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        for (var tk = 0; tk < 12; tk++) {
          var ta = tk * (TAU / 12);
          ctx.beginPath();
          ctx.moveTo(640 + Math.cos(ta) * 110, 245 + Math.sin(ta) * 110);
          ctx.lineTo(640 + Math.cos(ta) * 122, 245 + Math.sin(ta) * 122);
          ctx.stroke();
        }

        for (var g = 0; g < 3; g++) {
          ctx.save();
          var gx = 548 + g * 92 + Math.sin(rs.rawT * 1.6 + g) * 12;
          var gy = 165 + g * 34 + ((rs.rawT * 14 + g * 20) % 55);
          ctx.translate(gx, gy);
          ctx.rotate(Math.sin(rs.rawT * 2 + g) * 0.35);
          drawSugarMapleLeaf(ctx, 0.46, 0.85, 0.55);
          ctx.restore();
        }
        ctx.restore();
      }

      // Volumetric Amber Searchlight Cone from bottom lamp (illuminates the leaf from below!)
      drawSearchlightCone(ctx, rs, 640, 215, 145, 1.05);

      // HERO PROP: Sinking Crimson Autumn Maple Leaf (pendulum flutter descent across 0..10s!)
      var sinkU = rs.t / 10.0;
      if (rs.viewMode === "turkey") sinkU = lerp(0.24, 0.56, (rs.actT - 2.0) / 3.6);
      else if (rs.viewMode === "trout") sinkU = lerp(0.58, 0.90, (rs.actT - 5.6) / 4.4);

      var swayPhase = rs.rawT * 2.35;
      var leafX = 640 + Math.sin(swayPhase) * 34 * (1 - sinkU * 0.35);
      var leafY = lerp(132, 344, sinkU) - Math.abs(Math.cos(swayPhase)) * 8;
      var leafRot = Math.cos(swayPhase) * 0.38 - 0.12;
      var leafCurl = 0.78 + 0.22 * Math.sin(swayPhase * 2);
      var glow = rs.lampOn ? Math.max(0.88, rs.lampAnim) : 0.12;

      // Trailing silver micro-bubbles rising from the sinking leaf's serrated lobes!
      for (var b = 0; b < 11; b++) {
        var bu = ((rs.rawT * 0.55 + b * 0.09) % 1);
        var bx = leafX + Math.sin(b * 2.1 + rs.rawT * 2) * 26;
        var by = leafY - 22 - bu * 96;
        ctx.beginPath();
        ctx.arc(bx, by, 1.6 + (b % 3) * 1.1, 0, TAU);
        ctx.fillStyle = "rgba(225, 250, 248, " + ((1 - bu) * 0.72).toFixed(3) + ")";
        ctx.fill();
      }

      // Act 2 (2.0..4.5s): Fiery underwater ember sparks shedding off backlit leaf!
      if (rs.pass === "turkey" && rs.actT < 4.5 && rs.lampOn) {
        for (var sp = 0; sp < 10; sp++) {
          var su = ((rs.rawT * 1.3 + sp * 0.11) % 1);
          var sx = leafX + Math.cos(sp * 1.7 + rs.rawT * 3) * (18 + su * 42);
          var sy = leafY + Math.sin(sp * 2.3) * 16 - su * 48;
          ctx.beginPath();
          ctx.arc(sx, sy, (1 - su) * 3.8, 0, TAU);
          ctx.fillStyle = "#ffd15c";
          ctx.fill();
        }
      }

      // Act 3B (7.8..9.8s): Crimson Distress-Flare Signal Rings pulsing around landed leaf!
      if (rs.pass === "trout" && rs.actT >= 7.8) {
        var flA = easeAt(rs.actT, 7.8, 8.6);
        for (var fr = 0; fr < 2; fr++) {
          var radF = 24 + (((rs.rawT * 48) + fr * 32) % 64);
          ctx.beginPath();
          ctx.arc(leafX, leafY, radF, 0, TAU);
          ctx.strokeStyle = "rgba(255, 108, 64, " + ((1 - radF / 88) * flA * 0.72).toFixed(3) + ")";
          ctx.lineWidth = 2.6;
          ctx.stroke();
        }
      }

      // Draw Hero Crimson Maple Leaf
      ctx.save();
      ctx.translate(leafX, leafY);
      ctx.rotate(leafRot);
      drawSugarMapleLeaf(ctx, 1.05, leafCurl, glow);
      ctx.restore();

      // ACT 3: SECOND PASS · TROUT LOOKS IN ("Falling sky-feather or distress flare?")
      if (rs.pass === "trout") {
        var enter = easeOutBack(span(rs.actT, 5.6, 6.5));
        var glide = easeAt(rs.actT, 7.4, 9.0);
        var tx = lerp(852, lerp(762, 696, glide), clamp(enter, 0, 1.05));
        var ty = lerp(256, 224, glide) + Math.sin(rs.rawT * 2.8) * 5;
        drawBrookTrout(ctx, {
          x: tx, y: ty, scale: 0.94, dir: -1,
          pitch: glide * 0.16,
          t: rs.rawT, jaw: 0.25 + glide * 0.2,
          lookX: -0.75, lookY: (leafY - ty) * 0.01
        });

        // Visual comparison: Ghostly glowing Turkey tail-feather contour echoing the leaf ("Falling sky-feather...")
        var fthA = easeAt(rs.actT, 6.3, 7.3) * 0.42;
        if (fthA > 0.02) {
          ctx.save();
          ctx.globalAlpha = fthA;
          ctx.translate(556, 298);
          ctx.rotate(-0.35 + Math.sin(rs.rawT * 2.5) * 0.08);
          ctx.beginPath();
          ctx.ellipse(0, 0, 9, 34, 0, 0, TAU);
          ctx.fillStyle = "#c9532b";
          ctx.fill();
          ctx.strokeStyle = "#ffe099";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(0, 36); ctx.stroke();
          ctx.restore();
        }
      }

      // Riverbed slate rocks & reeds
      drawSwayingWeed(ctx, 496, 336, 112, 5, rs.rawT, rs.ballastOn, "#143d3b", "#235c56");
      drawSwayingWeed(ctx, 758, 418, 98, 4, rs.rawT + 1.2, rs.ballastOn, "#143d3b", "#235c56");
      drawCobbleCluster(ctx, [
        { x: 492, y: 348, rx: 52, ry: 22, rot: 0.08, moss: false },
        { x: 745, y: 386, rx: 46, ry: 18, rot: -0.12, moss: true }
      ], rs.lampOn);

      ctx.restore(); // end trim

      drawTurkeyGlassReflection(ctx, rs, { nod: Math.sin(rs.rawT * 2.4) * 0.09 });

      ctx.restore(); // end porthole clip

      drawSetupACockpit(ctx, W, H, SCENE_14, rs);
      applyGrainOverlay(ctx, W, H);
    }
  };

  // ==========================================================================
  // SCENE #15 · LENS — Cyan bathroom-tile glass block wall (3x3 Grid)
  // Grid Phase Shift (SCION 22) · Yellow Submarine (1968 · 00:19 Grid)
  // Turkey: "Cracked glass or scrambled Sub?"
  // Trout:  "Nine tiny chickens or broken TV screen?"
  // ==========================================================================
  var SCENE_15 = {
    id: 15,
    station: "#15 · Lens",
    clue: "Cyan bathroom-tile glass block wall",
    turkeyFork: "Cracked glass or scrambled Sub?",
    troutFork: "Nine tiny chickens or broken TV screen?",
    scionRule: "Grid Phase Shift (SCION 22)",
    defaultTool: "lamp",
    render: function (ctx, W, H, t, state) {
      var rs = resolveState(SCENE_15, t, state);
      ctx.clearRect(0, 0, W, H);

      ctx.save();
      ctx.beginPath();
      ctx.arc(PORT.cx, PORT.cy, PORT.r, 0, TAU);
      ctx.clip();

      var trimY = rs.ballastOn ? 10 : 0;

      // Cement Mortar Grout Wall Background filling the porthole
      ctx.fillStyle = rs.lampOn ? "#d5d1c3" : "#6c7c7b";
      ctx.fillRect(PORT.cx - PORT.r - 4, PORT.cy - PORT.r - 4, PORT.r * 2 + 8, PORT.r * 2 + 8);

      // 3x3 Glass Block Geometry (centered at PORT.cx=640, PORT.cy=255)
      var cellSize = 114;
      var mortar = 9;
      var step = cellSize + mortar;
      var startX = PORT.cx - 1.5 * cellSize - mortar;
      var startY = PORT.cy - 1.5 * cellSize - mortar;

      // SCION 22: Render each of the 9 cyan glass blocks with its OWN independent optical phase shift!
      for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 3; col++) {
          var idx = row * 3 + col; // 0..8
          var bx = startX + col * step;
          var by = startY + row * step;
          var bcx = bx + cellSize * 0.5;
          var bcy = by + cellSize * 0.5;

          ctx.save();
          roundRectPath(ctx, bx, by, cellSize, cellSize, 10);
          ctx.clip();

          // Base Wavy Cyan Glass Tile Gradient
          var isBottomLampCell = (row === 2 && col === 1);
          var tileLit = rs.lampOn ? (isBottomLampCell ? 1.0 : (row === 1 ? 0.82 : 0.68)) : 0.25;
          var cg = ctx.createLinearGradient(bx, by, bx + cellSize, by + cellSize);
          if (isBottomLampCell && rs.lampOn) {
            cg.addColorStop(0, "#5bc4be");
            cg.addColorStop(0.55, "#e6a84c");
            cg.addColorStop(1, "#f5be58");
          } else {
            cg.addColorStop(0, tileLit > 0.5 ? "#7ce0d8" : "#24585c");
            cg.addColorStop(0.5, tileLit > 0.5 ? "#43aea9" : "#184044");
            cg.addColorStop(1, tileLit > 0.5 ? "#227876" : "#0f2b2e");
          }
          ctx.fillStyle = cg;
          ctx.fillRect(bx, by, cellSize, cellSize);

          // Per-cell phase shift offset!
          var phaseShiftX = Math.sin(rs.rawT * 2.6 + idx * 1.15) * 14;
          var phaseShiftY = Math.cos(rs.rawT * 2.1 + idx * 0.85) * 9 + trimY;

          // --- CONTENT REFRACTED THROUGH THIS SPECIFIC GLASS BLOCK ---
          ctx.save();
          ctx.translate(phaseShiftX, phaseShiftY);

          // Act 2B (3.5..5.6s): "Scrambled Sub" — phase-shifted miniature bread-tin sub & reeds scrambled across the 9 blocks!
          if (rs.pass === "turkey" && rs.actT >= 3.4) {
            var scramA = easeAt(rs.actT, 3.4, 4.1);
            ctx.save();
            ctx.globalAlpha = scramA * 0.82;
            // Displace each block's slice of the submarine reflection into a scrambled 9-tile puzzle!
            var sxOff = ((idx * 47) % 90) - 45 + Math.sin(rs.rawT * 3 + idx) * 16;
            var syOff = ((idx * 31) % 60) - 30;
            ctx.translate(PORT.cx + sxOff, PORT.cy + syOff);
            roundRectPath(ctx, -95, -46, 190, 92, 42);
            ctx.fillStyle = "#b87438";
            ctx.fill();
            ctx.strokeStyle = "#142628";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, 26, 0, TAU);
            ctx.fillStyle = "#ffe28a"; ctx.fill(); ctx.stroke();
            ctx.restore();
          }

          // Act 3 (5.6..10.0s):
          // 1) Giant Brook Trout swimming right across the 3x3 grid (sliced & refracted per block like p15.jpg!)
          // 2) "Nine tiny chickens or broken TV screen?" — at 7.3..9.8s, each of the 9 blocks refracts its OWN bobbing mini-Turkey head + CRT horizontal sync bars!
          if (rs.pass === "trout") {
            var troutSwim = easeAt(rs.actT, 5.6, 7.0);
            var troutAside = easeAt(rs.actT, 7.5, 8.6);
            var troutWorldX = lerp(495, lerp(642, 748, troutAside), troutSwim) + (col - 1) * 10 * Math.sin(rs.rawT * 3 + row);
            var troutWorldY = lerp(252, 232, troutAside) + (row - 1) * 7 * Math.cos(rs.rawT * 2.5 + col);
            drawBrookTrout(ctx, {
              x: troutWorldX, y: troutWorldY, scale: lerp(1.55, 1.15, troutAside), dir: troutAside > 0.5 ? -1 : 1,
              t: rs.rawT + idx * 0.28, // phase-shifted tail/fin per tile!
              jaw: 0.28, lookX: -0.5, lookY: 0.1
            });

            // "Nine tiny chickens or broken TV screen?" (7.35..9.9s)
            if (rs.actT >= 7.35) {
              var nineA = easeAt(rs.actT, 7.35, 8.05);
              // 9 autonomous bobbing mini-Turkeys (one inside every single cyan glass block, phase-shifted!)
              var peck = Math.sin(rs.rawT * 6.5 + idx * 0.82);
              ctx.save();
              ctx.globalAlpha = nineA * 0.92;
              ctx.translate(bcx - phaseShiftX * 0.75, bcy + 4 - phaseShiftY * 0.75 + peck * 7);
              ctx.scale(0.64, 0.64);
              ctx.rotate(peck * 0.24);
              // Mini chicken/turkey head
              ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU);
              ctx.fillStyle = (idx % 2 === 0) ? "#e06d36" : "#eba038";
              ctx.fill();
              ctx.strokeStyle = "#1c120b"; ctx.lineWidth = 3; ctx.stroke();
              // Red comb & wattle
              ctx.fillStyle = "#d63229";
              ctx.beginPath(); ctx.arc(-4, -23, 8.5, 0, TAU); ctx.fill();
              ctx.beginPath(); ctx.arc(4, -24, 6.5, 0, TAU); ctx.fill();
              ctx.beginPath(); ctx.arc(16, 12, 6.5, 0, TAU); ctx.fill();
              // Beak
              ctx.fillStyle = "#ffd254";
              ctx.beginPath(); ctx.moveTo(18, -6); ctx.lineTo(38, 1); ctx.lineTo(18, 8); ctx.closePath();
              ctx.fill(); ctx.stroke();
              // Eye
              ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(6, -5, 6.5, 0, TAU); ctx.fill();
              ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(8, -5, 3.2, 0, TAU); ctx.fill();
              ctx.restore();

              // Broken TV CRT horizontal roll bar sweeping through the tiles!
              var tvBarY = by + ((rs.rawT * 95 + idx * 19) % cellSize);
              ctx.fillStyle = "rgba(235, 255, 252, " + (nineA * 0.30).toFixed(3) + ")";
              ctx.fillRect(bx - 20, tvBarY, cellSize + 40, 9);
            }
          }

          ctx.restore(); // end phaseShift

          // Internal Wavy Glass Caustic Ribbons (diagonal undulating highlights like real glass bricks!)
          ctx.strokeStyle = "rgba(225, 255, 250, " + (0.22 + tileLit * 0.18).toFixed(3) + ")";
          ctx.lineWidth = 5;
          for (var w = -1; w <= 2; w++) {
            ctx.beginPath();
            for (var u = 0; u <= cellSize; u += 16) {
              var wx = bx + u;
              var wy = by + cellSize - u + w * 32 + Math.sin(u * 0.08 + rs.rawT * 2.4 + idx) * 6;
              if (u === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
            }
            ctx.stroke();
          }

          // Act 2A (2.0..3.5s): Sharp Specular Stress-Glint Flashes ("Cracked glass...?")
          if (rs.pass === "turkey" && rs.actT < 3.65) {
            var glintA = Math.sin(span(rs.actT, 2.0, 3.65) * Math.PI) * 0.65;
            ctx.strokeStyle = "rgba(255, 252, 220, " + glintA.toFixed(3) + ")";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(bx + 12, by + 16);
            ctx.lineTo(bcx + 6, bcy - 4);
            ctx.lineTo(bx + cellSize - 14, by + cellSize - 18);
            ctx.stroke();
          }

          // Thick Inner Glass-Brick Bevel Frame
          roundRectPath(ctx, bx + 4, by + 4, cellSize - 8, cellSize - 8, 7);
          ctx.strokeStyle = "rgba(235, 255, 252, 0.45)";
          ctx.lineWidth = 3;
          ctx.stroke();

          roundRectPath(ctx, bx, by, cellSize, cellSize, 10);
          ctx.strokeStyle = "#173638";
          ctx.lineWidth = 2.4;
          ctx.stroke();

          ctx.restore(); // end single glass block clip
        }
      }

      // Murk veil when unlit in Act 1 before t=1.0s
      if (!rs.lampOn) {
        ctx.fillStyle = "rgba(9, 20, 24, 0.56)";
        ctx.fillRect(PORT.cx - PORT.r, PORT.cy - PORT.r, PORT.r * 2, PORT.r * 2);
      }

      drawSearchlightCone(ctx, rs, 640, 230, 155, 0.72);
      drawTurkeyGlassReflection(ctx, rs, { x: 520, y: 365, scale: 0.88 });

      ctx.restore(); // end porthole clip

      drawSetupACockpit(ctx, W, H, SCENE_15, rs);
      applyGrainOverlay(ctx, W, H);
    }
  };

  // Register Portholes #11–#15
  window.PORTAL_SCENES[11] = SCENE_11;
  window.PORTAL_SCENES[12] = SCENE_12;
  window.PORTAL_SCENES[13] = SCENE_13;
  window.PORTAL_SCENES[14] = SCENE_14;
  window.PORTAL_SCENES[15] = SCENE_15;
})();
