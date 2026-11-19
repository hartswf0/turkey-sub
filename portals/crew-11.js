/* ==========================================================================
 * SCION Portal Animation Crew 11 — Portholes #51–#55
 * PAELEO / Oulipo Handmade Multiplane 2D Canvas + Video-to-Game Cockpit Rigs
 * Owned slice: portals/crew-11.js (#51 Grotto, #52 Bridge, #53 Flume, #54 Ledge, #55 Eddy)
 * ========================================================================== */
(function () {
  "use strict";

  window.PORTAL_SCENES = window.PORTAL_SCENES || {};

  var TAU = Math.PI * 2;
  var CX = 640;
  var CY = 255;
  var R_GLASS = 185;
  var R_BEZEL = 226;
  var SPLIT_Y = 536;

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }
  function lerp(a, b, u) {
    return a + (b - a) * u;
  }
  function smoothstep(e0, e1, x) {
    var t = clamp((x - e0) / (e1 - e0 || 1e-6), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function easeOutBack(x) {
    var t = clamp(x, 0, 1);
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
  function hash01(n) {
    var s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  // Lazy offscreen paper/gouache grain pattern (deterministic, zero network I/O)
  var _grainPattern = null;
  function getGrainPattern(ctx) {
    if (_grainPattern) return _grainPattern;
    if (typeof document === "undefined") return null;
    try {
      var c = document.createElement("canvas");
      c.width = 96;
      c.height = 96;
      var g = c.getContext("2d");
      for (var y = 0; y < 96; y += 2) {
        for (var x = 0; x < 96; x += 2) {
          var v = hash01(x * 37 + y * 91);
          if (v > 0.62) {
            g.fillStyle = "rgba(255,248,230," + ((v - 0.62) * 0.09).toFixed(3) + ")";
            g.fillRect(x, y, 2, 2);
          } else if (v < 0.34) {
            g.fillStyle = "rgba(8,14,16," + ((0.34 - v) * 0.11).toFixed(3) + ")";
            g.fillRect(x, y, 2, 2);
          }
        }
      }
      _grainPattern = ctx.createPattern(c, "repeat");
    } catch (e) {
      _grainPattern = null;
    }
    return _grainPattern;
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

  // Resolve deterministic film timeline OR live Video-to-Game interactive overrides
  function resolveSceneState(meta, rawT, state) {
    var tVal = Number.isFinite(rawT) ? Math.max(0, rawT) : 0;
    var hasState = !!state && typeof state === "object";
    var viewOverride = hasState && (state.view === "turkey" || state.view === "trout") ? state.view : "auto";

    // Film render runs 0..10.0s; live interactive mode may run >10s continuously
    var tl = hasState && tVal > 10.001 ? (tVal % 10.0) : clamp(tVal, 0, 10.0);

    var phase;
    var actClock;
    if (viewOverride === "turkey") {
      phase = "turkey";
      actClock = 2.2 + (tVal % 3.2);
    } else if (viewOverride === "trout") {
      phase = "trout";
      actClock = 6.0 + (tVal % 3.8);
    } else {
      if (tl < 2.0) phase = "act1";
      else if (tl < 5.6) phase = "turkey";
      else phase = "trout";
      actClock = tl;
    }

    var lampBool, lampAmt;
    if (hasState && typeof state.lamp === "boolean") {
      lampBool = state.lamp;
      lampAmt = lampBool ? 1.0 : 0.0;
    } else {
      if (meta.defaultTool === "lamp") {
        lampBool = tl >= 1.0;
        lampAmt = smoothstep(0.95, 1.38, tl);
      } else {
        lampBool = false;
        lampAmt = 0.0;
      }
    }

    var ballastBool, ballastAmt;
    if (hasState && typeof state.ballast === "boolean") {
      ballastBool = state.ballast;
      ballastAmt = ballastBool ? 1.0 : 0.0;
    } else {
      if (meta.defaultTool === "ballast") {
        ballastBool = tl >= 1.0;
        ballastAmt = smoothstep(0.95, 1.48, tl);
      } else {
        ballastBool = false;
        ballastAmt = 0.0;
      }
    }

    var activeRoll = 0;
    var rollSpin = 0;
    if (hasState && typeof state.roll === "number" && state.roll >= 1 && state.roll <= 6) {
      activeRoll = Math.round(state.roll);
      rollSpin = 1.0;
    } else if (phase === "trout") {
      activeRoll = meta.defaultRoll;
      rollSpin = viewOverride === "trout" ? 1.0 : smoothstep(5.65, 6.35, actClock);
    }

    var showCaptions = !(hasState && state.showCaptions === false);

    // Wing reach progress during Act 1 (peaks right around 0.85..1.05s so 0.8s strip shows hand on control!)
    var reachAmt = 0;
    if (viewOverride === "auto" && tl < 1.95) {
      if (tl < 1.02) {
        reachAmt = smoothstep(0.22, 0.78, tl);
      } else {
        reachAmt = 1.0 - smoothstep(1.08, 1.72, tl);
      }
    }

    // Chalk chart progress
    var chartProg;
    if (viewOverride === "trout") {
      chartProg = 1.0;
    } else if (viewOverride === "turkey") {
      chartProg = 0.52;
    } else {
      chartProg = clamp(
        0.15 + 0.38 * smoothstep(1.2, 5.2, tl) + 0.47 * smoothstep(5.6, 8.8, tl),
        0,
        1
      );
    }

    return {
      t: tVal,
      tl: tl,
      actClock: actClock,
      phase: phase,
      viewOverride: viewOverride,
      lamp: lampBool,
      lampAmt: lampAmt,
      ballast: ballastBool,
      ballastAmt: ballastAmt,
      roll: activeRoll,
      rollSpin: rollSpin,
      showCaptions: showCaptions,
      reachAmt: reachAmt,
      chartProg: chartProg
    };
  }

  // ==========================================================================
  // SHARED ARTICULATED SPOTTED BROOK TROUT RIG (Act 3: Trout Looks In)
  // ==========================================================================
  function drawBrookTrout(ctx, opts) {
    // opts: x, y, scale, angle, flipX, t, jawOpen, finPoint, curiousTilt, carryCard
    var x = opts.x || 0;
    var y = opts.y || 0;
    var sc = opts.scale || 1;
    var ang = opts.angle || 0;
    var flipX = opts.flipX ? -1 : 1;
    var t = opts.t || 0;
    var jaw = clamp(opts.jawOpen || 0, 0, 1);
    var finPt = clamp(opts.finPoint || 0, 0, 1);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.scale(flipX * sc, sc);
    // Canonical orientation: snout pointing LEFT (-x), tail at RIGHT (+x)
    var wag = Math.sin(t * 7.2) * 0.16;
    var bodyBend = Math.sin(t * 7.2 - 0.8) * 4.5;

    // Articulated caudal peduncle + forked square-cut Brook Trout tail
    ctx.save();
    ctx.translate(64, bodyBend * 0.4);
    ctx.rotate(wag);
    var tailGrad = ctx.createLinearGradient(0, -24, 34, 24);
    tailGrad.addColorStop(0, "#486852");
    tailGrad.addColorStop(0.65, "#9c5238");
    tailGrad.addColorStop(1, "#2a3b33");
    ctx.fillStyle = tailGrad;
    ctx.strokeStyle = "#14201c";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-6, -9);
    ctx.quadraticCurveTo(16, -24, 34, -27);
    ctx.quadraticCurveTo(26, -4, 29, 0);
    ctx.quadraticCurveTo(26, 4, 34, 27);
    ctx.quadraticCurveTo(16, 24, -6, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Tail fin rays & white/black leading edge tricolour
    ctx.strokeStyle = "#f4efe2";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(31, -25);
    ctx.moveTo(0, 11);
    ctx.lineTo(31, 25);
    ctx.stroke();
    ctx.strokeStyle = "rgba(20,32,28,0.45)";
    ctx.lineWidth = 1.1;
    for (var r = -3; r <= 3; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * 2.2);
      ctx.lineTo(27, r * 7.2);
      ctx.stroke();
    }
    ctx.restore();

    // Dorsal fin & adipose fin
    ctx.save();
    ctx.translate(8, -21 + bodyBend * 0.2);
    ctx.rotate(Math.sin(t * 5.5) * 0.06);
    ctx.fillStyle = "#56785c";
    ctx.strokeStyle = "#14201c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-18, 4);
    ctx.quadraticCurveTo(-8, -19, 12, -16);
    ctx.quadraticCurveTo(18, -5, 16, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Vermiculate dark ticks on dorsal
    ctx.fillStyle = "#1c2c24";
    ctx.fillRect(-6, -9, 3, 5);
    ctx.fillRect(2, -11, 3, 6);
    ctx.fillRect(9, -7, 3, 5);
    ctx.restore();

    // Adipose fin
    ctx.fillStyle = "#6b8465";
    ctx.strokeStyle = "#14201c";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(42, -13 + bodyBend * 0.3);
    ctx.quadraticCurveTo(50, -21 + bodyBend * 0.3, 55, -11 + bodyBend * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pelvic & anal fins (characteristic Brook Trout crimson + crisp white leading edge!)
    ctx.save();
    ctx.translate(16, 19 + bodyBend * 0.2);
    ctx.rotate(0.2 + Math.sin(t * 6.1 + 1) * 0.12);
    ctx.fillStyle = "#c85b3c";
    ctx.strokeStyle = "#14201c";
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(-8, -2);
    ctx.lineTo(4, 15);
    ctx.lineTo(15, 11);
    ctx.lineTo(8, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#faf6ea";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-7, -1);
    ctx.lineTo(4, 14);
    ctx.stroke();
    ctx.restore();

    // Torso / streamlined fusiform body
    var bodyGrad = ctx.createLinearGradient(0, -26, 0, 26);
    bodyGrad.addColorStop(0, "#2f4d3b");
    bodyGrad.addColorStop(0.42, "#6e8e68");
    bodyGrad.addColorStop(0.72, "#d8a46f");
    bodyGrad.addColorStop(1, "#f2e5c9");
    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = "#13201b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-64, -2);
    ctx.bezierCurveTo(-44, -24, 6, -28 + bodyBend * 0.25, 68, -9 + bodyBend * 0.4);
    ctx.lineTo(68, 9 + bodyBend * 0.4);
    ctx.bezierCurveTo(14, 27 + bodyBend * 0.25, -28, 25, -54, 9);
    // Upper snout notch
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Articulated lower jaw (hinged at gill corner)
    ctx.save();
    ctx.translate(-40, 8);
    ctx.rotate(-jaw * 0.36);
    ctx.fillStyle = "#dfbe95";
    ctx.strokeStyle = "#13201b";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(4, -2);
    ctx.quadraticCurveTo(-14, 7, -24, 1);
    ctx.quadraticCurveTo(-16, -4, 2, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Optional rolled postcard #55 held in mouth (for Porthole #55!)
    if (opts.carryCard) {
      ctx.save();
      ctx.translate(-66, 3 + jaw * 3);
      ctx.rotate(-0.28 + Math.sin(t * 4) * 0.06);
      ctx.fillStyle = "#faf3df";
      ctx.strokeStyle = "#2b1d12";
      ctx.lineWidth = 1.8;
      roundedRectPath(ctx, -18, -5, 28, 10, 4);
      ctx.fill();
      ctx.stroke();
      // Tiny red ribbon & teal trout stamp
      ctx.strokeStyle = "#b53c25";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, -5);
      ctx.lineTo(-4, 5);
      ctx.stroke();
      ctx.fillStyle = "#1d6c7d";
      ctx.fillRect(-13, -2, 5, 4);
      ctx.restore();
    }

    // Lateral line & signature Brook Trout spots (pale yellow-cream + crimson with blue halos!)
    ctx.strokeStyle = "rgba(28,46,38,0.45)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-34, -1);
    ctx.quadraticCurveTo(12, -2 + bodyBend * 0.2, 62, 0 + bodyBend * 0.35);
    ctx.stroke();

    var spots = [
      [-22, -9, 2.2, 0], [-12, -4, 2.4, 1], [-4, -12, 2.1, 0],
      [6, -6, 2.5, 1], [15, -13, 2.0, 0], [24, -4, 2.3, 1],
      [33, -9, 2.0, 0], [44, -3, 2.2, 1], [-16, 4, 2.1, 1],
      [0, 3, 2.3, 0], [18, 5, 2.2, 1], [36, 4, 1.9, 0], [51, -2, 1.8, 0]
    ];
    for (var i = 0; i < spots.length; i++) {
      var sp = spots[i];
      var sy = sp[1] + bodyBend * 0.2 * ((sp[0] + 30) / 90);
      if (sp[3] === 1) {
        ctx.fillStyle = "rgba(116,188,205,0.65)";
        ctx.beginPath();
        ctx.arc(sp[0], sy, sp[2] + 1.5, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#d94832";
      } else {
        ctx.fillStyle = "#efe6b2";
      }
      ctx.beginPath();
      ctx.arc(sp[0], sy, sp[2], 0, TAU);
      ctx.fill();
    }

    // Operculum gill plate curve
    ctx.strokeStyle = "#1c2e26";
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.arc(-32, -1, 14, -1.05, 1.05);
    ctx.stroke();

    // Articulated Pectoral Fin (can gesture/point forward when finPoint > 0!)
    ctx.save();
    ctx.translate(-26, 11);
    var pecAng = lerp(0.35 + Math.sin(t * 6.5) * 0.18, 2.35 + Math.sin(t * 8.0) * 0.14, finPt);
    ctx.rotate(pecAng);
    ctx.fillStyle = "#cf5c3b";
    ctx.strokeStyle = "#14201c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(18, 5, 25, 14);
    ctx.quadraticCurveTo(12, 19, -2, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#fff9ec";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(16, 4, 24, 13);
    ctx.stroke();
    ctx.restore();

    // Expressive Eye (golden iris + alert pupil tracking inward)
    ctx.fillStyle = "#f5d77f";
    ctx.strokeStyle = "#13201b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-47, -5, 6.2, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0e1715";
    ctx.beginPath();
    ctx.arc(-48.4, -4.8, 3.3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-49.8, -6.5, 1.5, 0, TAU);
    ctx.fill();

    // Expressive brow ridge for acting
    if (opts.curiousTilt) {
      ctx.strokeStyle = "#13201b";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-54, -12);
      ctx.quadraticCurveTo(-47, -15 - opts.curiousTilt * 3, -40, -11);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================================================
  // SHARED UNDERWATER ATMOSPHERE HELPERS (Caustics, Searchlight, Silt, Reflection)
  // ==========================================================================
  function drawUnderwaterBackdrop(ctx, st, topCol, botCol, seed) {
    var shiftY = st.ballastAmt * 18;
    var grad = ctx.createLinearGradient(CX, CY - R_GLASS, CX, CY + R_GLASS);
    grad.addColorStop(0, topCol);
    grad.addColorStop(1, botCol);
    ctx.fillStyle = grad;
    ctx.fillRect(CX - R_GLASS - 10, CY - R_GLASS - 10, R_GLASS * 2 + 20, R_GLASS * 2 + 20);

    // Caustic sun-ribbons from surface (brighter in Act 3 or when lamp/clear)
    var caustAlpha = 0.08 + 0.10 * st.lampAmt + (st.phase === "trout" ? 0.10 : 0.0);
    ctx.save();
    for (var i = 0; i < 5; i++) {
      var bx = CX - 135 + i * 68 + Math.sin(st.t * 0.7 + i * 1.4 + seed) * 18;
      var bw = 26 + Math.sin(st.t * 1.1 + i) * 8;
      var cg = ctx.createLinearGradient(bx, CY - R_GLASS, bx - 25, CY + R_GLASS * 0.7);
      cg.addColorStop(0, "rgba(165,238,230," + caustAlpha.toFixed(3) + ")");
      cg.addColorStop(1, "rgba(165,238,230,0)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.moveTo(bx - bw * 0.5, CY - R_GLASS + shiftY * 0.2);
      ctx.lineTo(bx + bw * 0.5, CY - R_GLASS + shiftY * 0.2);
      ctx.lineTo(bx + bw * 1.2 - 26, CY + 130 + shiftY * 0.4);
      ctx.lineTo(bx - bw * 1.1 - 26, CY + 130 + shiftY * 0.4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawLampBeamAndDusk(ctx, st, mode) {
    // Volumetric searchlight cone when lampAmt > 0, and murky dusk veil when lampAmt == 0 & ballastAmt == 0
    var duskVeil = (1 - Math.max(st.lampAmt, st.ballastAmt * 0.75)) * (st.phase === "trout" ? 0.22 : 0.56);
    if (duskVeil > 0.01) {
      ctx.fillStyle = "rgba(8,22,26," + duskVeil.toFixed(3) + ")";
      ctx.fillRect(CX - R_GLASS - 6, CY - R_GLASS - 6, R_GLASS * 2 + 12, R_GLASS * 2 + 12);
    }

    if (st.lampAmt > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      if (mode === "bottomSpot") {
        // Upward brass spotlight cone from bottom rim (like p54.jpg!)
        var sg = ctx.createRadialGradient(CX, CY + 178, 12, CX, CY + 40, 250);
        sg.addColorStop(0, "rgba(255,214,122," + (0.58 * st.lampAmt).toFixed(3) + ")");
        sg.addColorStop(0.55, "rgba(244,186,92," + (0.24 * st.lampAmt).toFixed(3) + ")");
        sg.addColorStop(1, "rgba(244,186,92,0)");
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.moveTo(CX - 34, CY + 188);
        ctx.lineTo(CX + 34, CY + 188);
        ctx.lineTo(CX + 168, CY - 95);
        ctx.lineTo(CX - 168, CY - 95);
        ctx.closePath();
        ctx.fill();
      } else {
        // Twin collimated searchlight beams sweeping slightly
        var sway = Math.sin(st.t * 1.15) * 12;
        var bg1 = ctx.createLinearGradient(CX + 130, CY + 145, CX - 40 + sway, CY - 60);
        bg1.addColorStop(0, "rgba(255,220,138," + (0.40 * st.lampAmt).toFixed(3) + ")");
        bg1.addColorStop(0.65, "rgba(255,210,120," + (0.18 * st.lampAmt).toFixed(3) + ")");
        bg1.addColorStop(1, "rgba(255,210,120,0)");
        ctx.fillStyle = bg1;
        ctx.beginPath();
        ctx.moveTo(CX + 105, CY + 175);
        ctx.lineTo(CX + 155, CY + 140);
        ctx.lineTo(CX + 45 + sway, CY - 145);
        ctx.lineTo(CX - 135 + sway, CY - 85);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawDriftingParticles(ctx, st, seed, fastCurrent) {
    var count = 26;
    var speedX = fastCurrent ? lerp(68, 18, st.ballastAmt) : 9;
    for (var i = 0; i < count; i++) {
      var h1 = hash01(i * 19 + seed);
      var h2 = hash01(i * 43 + seed * 3);
      var px = CX - 175 + (((h1 * 350 - st.t * speedX * (0.6 + h2 * 0.7)) % 350) + 350) % 350;
      var py = CY - 165 + (((h2 * 330 - st.t * (10 + h1 * 12)) % 330) + 330) % 330;
      var r = 1.2 + (i % 3) * 0.9;
      if (i % 4 === 0) {
        // Creek micro-bubble
        ctx.strokeStyle = "rgba(220,250,248,0.55)";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(px, py, r + 1.1, 0, TAU);
        ctx.stroke();
      } else {
        ctx.fillStyle = st.lampAmt > 0.3 ? "rgba(255,234,178,0.45)" : "rgba(175,216,214,0.34)";
        ctx.beginPath();
        ctx.arc(px, py, r, 0, TAU);
        ctx.fill();
      }
    }
  }

  // Subtle ghostly reflection of Turkey inside the glass (stronger in Act 2; in Act 3 Trout sees Turkey inside!)
  function drawPortholeTurkeyReflection(ctx, st, mirrorWithHellbender) {
    var alpha = st.phase === "turkey" ? 0.34 : st.phase === "trout" ? 0.44 : 0.18;
    var tilt = st.phase === "turkey"
      ? Math.sin(st.t * 2.4) * 0.12
      : mirrorWithHellbender
      ? Math.sin(st.t * 3.2) * 0.18
      : -0.06;
    var rx = st.phase === "trout" ? CX - 108 : CX - 114;
    var ry = st.phase === "trout" ? CY + 96 : CY + 104;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(rx, ry);
    ctx.rotate(tilt);

    // Warm glass reflection halo (pilot dome/cap + neck + beak + crimson wattle)
    ctx.fillStyle = "#8c5c3e";
    ctx.strokeStyle = "#2b1910";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-6, 26, 22, 30, -0.15, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.fillStyle = "#b57a54";
    ctx.beginPath();
    ctx.arc(0, -2, 20, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Aviator / bread-tin survey cap
    ctx.fillStyle = "#5f7a78";
    ctx.beginPath();
    ctx.arc(-2, -6, 20.5, Math.PI * 0.95, Math.PI * 2.02);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hooked golden-ochre beak pointing right
    ctx.fillStyle = "#deb057";
    ctx.beginPath();
    ctx.moveTo(16, -5);
    ctx.quadraticCurveTo(33, -2, 34, 6);
    ctx.quadraticCurveTo(22, 7, 15, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crimson snood & wattles (swaying gently!)
    var wattleSway = Math.sin(st.t * 4.2) * 2.5;
    ctx.fillStyle = "#c93f32";
    ctx.beginPath();
    ctx.moveTo(18, 4);
    ctx.quadraticCurveTo(24 + wattleSway, 18, 17 + wattleSway, 22);
    ctx.quadraticCurveTo(11, 18, 13, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Round attentive eye
    ctx.fillStyle = "#faf3df";
    ctx.beginPath();
    ctx.arc(5, -4, 5.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#18120e";
    ctx.beginPath();
    ctx.arc(6.5, -4, 2.7, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================================================
  // SCENE #51 · GROTTO — "Basketball pearl wedged in giant stone clam"
  // Turkey: "Peeled boiled egg or valve stopper?"
  // Trout:  "Bowling-ball thief or giant brass marble?"
  // SCION:  "Repeated Observation (SCION 41)"
  // ==========================================================================
  function renderWorld51(ctx, st) {
    var shiftY = st.ballastAmt * 16;
    drawUnderwaterBackdrop(ctx, st, "#136872", "#09262c", 51);

    // Distant grotto cavern arch & hanging stalactites (multiplane layer 1)
    var parX = Math.sin(st.t * 0.55) * 5 + (st.phase === "trout" ? -8 : 4);
    ctx.save();
    ctx.translate(parX * 0.5, shiftY * 0.4);
    ctx.fillStyle = "#0b353c";
    ctx.strokeStyle = "#061b1f";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(CX - 195, CY + 195);
    ctx.lineTo(CX - 195, CY - 195);
    ctx.lineTo(CX + 195, CY - 195);
    ctx.lineTo(CX + 195, CY + 195);
    ctx.lineTo(CX + 135, CY + 195);
    ctx.lineTo(CX + 118, CY - 35);
    ctx.lineTo(CX + 82, CY - 115);
    ctx.lineTo(CX + 56, CY - 72); // stalactite 1
    ctx.lineTo(CX + 38, CY - 148);
    ctx.lineTo(CX + 8, CY - 165);
    ctx.lineTo(CX - 22, CY - 135);
    ctx.lineTo(CX - 38, CY - 82); // stalactite 2
    ctx.lineTo(CX - 58, CY - 138);
    ctx.lineTo(CX - 112, CY - 72);
    ctx.lineTo(CX - 136, CY + 85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Riverbed rocks + submerged stone valve-collar pipe directly beneath the clam!
    ctx.save();
    ctx.translate(parX, shiftY);
    ctx.fillStyle = "#17464b";
    ctx.strokeStyle = "#091e22";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(CX - 190, CY + 95);
    ctx.quadraticCurveTo(CX - 90, CY + 74, CX, CY + 82);
    ctx.quadraticCurveTo(CX + 95, CY + 74, CX + 190, CY + 98);
    ctx.lineTo(CX + 190, CY + 200);
    ctx.lineTo(CX - 190, CY + 200);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Stone valve pipe seat collar under clam (makes "valve stopper" unmistakable!)
    ctx.fillStyle = "#2b4f52";
    ctx.strokeStyle = "#0b1c1f";
    ctx.lineWidth = 2.4;
    roundedRectPath(ctx, CX - 42, CY + 76, 84, 34, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0b2024";
    ctx.beginPath();
    ctx.ellipse(CX, CY + 78, 34, 9, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Rivets on valve collar
    for (var rv = -28; rv <= 28; rv += 14) {
      ctx.fillStyle = "#7a9e9b";
      ctx.beginPath();
      ctx.arc(CX + rv, CY + 95, 2.5, 0, TAU);
      ctx.fill();
    }

    // Repeated Observation choreography:
    // In Act 2 (Turkey): 2.1..3.4s ovoid boiled-egg pulse; 3.5..5.2s valve-stopper lift + bubble geyser + slam!
    var valveLift = 0;
    var eggSquash = 0;
    var jawAngle = -0.52; // open ~30 deg
    var marbleRoll = 0;
    var showBowlingHoles = 0;
    var showBrassMirror = 0;

    if (st.phase === "act1") {
      jawAngle = lerp(-0.18, -0.52, st.lampAmt);
    } else if (st.phase === "turkey") {
      var u = st.actClock;
      // Egg wobble 2.1..3.4s, Valve lift 3.45..4.75s (wide open & spouting at 4.0s!), then clamp shut at 4.95s!
      eggSquash = Math.sin(u * 7.5) * 0.06 * (1 - smoothstep(4.7, 5.2, u));
      var liftUp = smoothstep(3.42, 3.88, u) * (1 - smoothstep(4.45, 4.88, u));
      valveLift = liftUp * 26;
      jawAngle = -0.48 - liftUp * 0.28 + smoothstep(4.78, 5.15, u) * 0.34;
    } else {
      // Act 3: Trout Looks In (6.8s bowling-ball dimples; 9.2s brass marble mirror glint!)
      var u3 = st.actClock;
      jawAngle = -0.56 + Math.sin(u3 * 2.2) * 0.05;
      showBowlingHoles = smoothstep(6.0, 6.5, u3) * (1 - smoothstep(7.5, 8.1, u3));
      showBrassMirror = smoothstep(7.7, 8.4, u3);
      marbleRoll = smoothstep(7.4, 8.8, u3) * 0.85;
    }

    // Vent bubble geyser whenever pearl lifts off the valve seat (strong at t=4.0s!)
    if (valveLift > 2) {
      var gRatio = valveLift / 26;
      for (var bi = 0; bi < 18; bi++) {
        var bProg = ((st.t * 2.6 + bi * 0.17) % 1.0);
        var bx = CX + (hash01(bi * 13) - 0.5) * (36 + bProg * 54);
        var by = CY + 74 - bProg * 145;
        var br = (2.5 + (bi % 4) * 1.8) * gRatio;
        ctx.fillStyle = "rgba(215,252,248," + (0.62 * (1 - bProg) * gRatio).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, TAU);
        ctx.fill();
      }
    }

    // Lower fluted stone clam valve (seated above the valve collar)
    ctx.fillStyle = "#5f8a78";
    ctx.strokeStyle = "#102521";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(CX - 94, CY + 36);
    ctx.quadraticCurveTo(CX - 84, CY + 84, CX, CY + 84);
    ctx.quadraticCurveTo(CX + 86, CY + 84, CX + 96, CY + 34);
    // Scalloped lip
    ctx.quadraticCurveTo(CX + 62, CY + 48, CX + 34, CY + 36);
    ctx.quadraticCurveTo(CX, CY + 48, CX - 34, CY + 36);
    ctx.quadraticCurveTo(CX - 64, CY + 48, CX - 94, CY + 36);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner nacre lip of lower valve
    ctx.fillStyle = "#b8d0be";
    ctx.beginPath();
    ctx.ellipse(CX, CY + 38, 76, 17, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // THE GIANT BASKETBALL PEARL (wedged between valves; lifts on valve-geyser, rolls as marble!)
    ctx.save();
    ctx.translate(CX + Math.sin(marbleRoll) * 6, CY + 6 - valveLift);
    ctx.scale(1 - eggSquash, 1 + eggSquash * 1.15);

    // Outer luminous nacre aura
    var auraAlpha = 0.22 + 0.26 * st.lampAmt + 0.15 * showBrassMirror;
    var aura = ctx.createRadialGradient(0, -4, 32, 0, 0, 76);
    aura.addColorStop(0, "rgba(255,238,192," + auraAlpha.toFixed(3) + ")");
    aura.addColorStop(1, "rgba(255,238,192,0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 76, 0, TAU);
    ctx.fill();

    // Main pearl sphere (egg-yolk warm center in Act 2; gleaming brass-marble reflection at 9.2s!)
    var pg = ctx.createRadialGradient(-14, -16, 6, 0, 4, 52);
    if (showBrassMirror > 0.3) {
      pg.addColorStop(0, "#fffdf2");
      pg.addColorStop(0.45, lerpColorHex("#f9e4be", "#f0c869", showBrassMirror));
      pg.addColorStop(0.82, lerpColorHex("#d7aa7b", "#b07c2e", showBrassMirror));
      pg.addColorStop(1, "#6f4c1d");
    } else {
      pg.addColorStop(0, "#ffffff");
      pg.addColorStop(0.38, "#fff2d2");
      pg.addColorStop(0.75, "#ebb985");
      pg.addColorStop(1, "#a67653");
    }
    ctx.fillStyle = pg;
    ctx.strokeStyle = "#1a2824";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Subtle basketball / boiled-egg seam ribs rotating with marbleRoll
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 47, 0, TAU);
    ctx.clip();
    ctx.strokeStyle = "rgba(138,88,48,0.22)";
    ctx.lineWidth = 1.6;
    var offR = (marbleRoll * 34) % 40;
    ctx.beginPath();
    ctx.ellipse(-6 + offR * 0.4, 0, 22, 48, 0.15, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 56, 62, Math.PI * 1.18, Math.PI * 1.82);
    ctx.stroke();

    // Act 2 warm translucent "boiled egg yolk" core glow
    if (st.phase === "turkey") {
      var yg = ctx.createRadialGradient(2, 6, 2, 2, 6, 24);
      yg.addColorStop(0, "rgba(255,182,56,0.42)");
      yg.addColorStop(1, "rgba(255,182,56,0)");
      ctx.fillStyle = yg;
      ctx.beginPath();
      ctx.arc(2, 6, 24, 0, TAU);
      ctx.fill();
    }

    // Act 3 @ 6.8s: 3 dark bowling-ball finger-hole dimples on flank!
    if (showBowlingHoles > 0.02) {
      ctx.globalAlpha = showBowlingHoles;
      var holes = [[16, -14, 5.2], [26, -4, 5.2], [17, 6, 5.8]];
      for (var hi = 0; hi < holes.length; hi++) {
        ctx.fillStyle = "#263638";
        ctx.strokeStyle = "#f7e3bd";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(holes[hi][0], holes[hi][1], holes[hi][2], 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Act 3 @ 9.2s: Miniature mirrored 6-bolt brass porthole glint on the "giant brass marble"!
    if (showBrassMirror > 0.05) {
      ctx.globalAlpha = showBrassMirror * 0.78;
      ctx.strokeStyle = "#fff6cf";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(-8, -6, 22, 0, TAU);
      ctx.stroke();
      for (var mb = 0; mb < 6; mb++) {
        var ma = (mb * TAU) / 6;
        ctx.fillStyle = "#fff6cf";
        ctx.beginPath();
        ctx.arc(-8 + Math.cos(ma) * 22, -6 + Math.sin(ma) * 22, 2.2, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Specular highlight
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.beginPath();
    ctx.ellipse(-16, -20, 11, 6.5, -0.5, 0, TAU);
    ctx.fill();
    ctx.restore(); // restore pearl clip
    ctx.restore(); // restore pearl translate/scale!

    // Articulated Upper Fluted Stone Clam Valve (hinged at rear left ligament CX-86, CY+18)
    ctx.save();
    ctx.translate(CX - 86, CY + 18);
    ctx.rotate(jawAngle);
    // Inner shell cavity
    ctx.fillStyle = "#9dc0ae";
    ctx.strokeStyle = "#102521";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(55, -72, 168, -42);
    ctx.quadraticCurveTo(155, 2, 118, 4);
    ctx.quadraticCurveTo(64, 14, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Thick mossy fluted limestone dorsal cap
    ctx.fillStyle = "#4d7c68";
    ctx.beginPath();
    ctx.moveTo(-6, 4);
    ctx.bezierCurveTo(22, -82, 115, -94, 174, -42);
    // Scalloped flutes
    ctx.quadraticCurveTo(142, -26, 122, -34);
    ctx.quadraticCurveTo(92, -16, 68, -26);
    ctx.quadraticCurveTo(36, -6, 0, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rib lines & moss tufts
    ctx.strokeStyle = "#204036";
    ctx.lineWidth = 1.7;
    for (var rf = 1; rf <= 4; rf++) {
      ctx.beginPath();
      ctx.moveTo(8, -2);
      ctx.quadraticCurveTo(34 * rf, -58, 36 * rf + 18, -30);
      ctx.stroke();
    }
    ctx.restore();

    // Foreground swaying creek kelp fronds
    drawKelpFrond(ctx, CX - 142, CY + 150, 95, st.t, 0.9);
    drawKelpFrond(ctx, CX + 132, CY + 155, 88, st.t + 1.7, -0.8);
    ctx.restore();

    // Act 3: Articulated Brook Trout outside looking in & testing the pearl!
    if (st.phase === "trout") {
      var enter = smoothstep(5.6, 6.35, st.actClock);
      var late = smoothstep(7.4, 8.7, st.actClock);
      var tx = lerp(CX + 215, CX + 106, enter) - late * 22;
      var ty = lerp(CY - 18, CY - 8, enter) + late * 18 + Math.sin(st.t * 2.6) * 5;
      var tang = lerp(0.08, -0.14, late);
      drawBrookTrout(ctx, {
        x: tx,
        y: ty,
        scale: 0.92,
        angle: tang,
        flipX: false,
        t: st.t,
        jawOpen: 0.25 + 0.35 * Math.sin(st.t * 4.2),
        finPoint: 1 - late * 0.4,
        curiousTilt: 0.8
      });
    }

    drawDriftingParticles(ctx, st, 51, false);
    drawLampBeamAndDusk(ctx, st, "beam");
    drawPortholeTurkeyReflection(ctx, st, false);
  }

  // ==========================================================================
  // SCENE #52 · BRIDGE — "Taut red rope into murky boulder pile"
  // Turkey: "Kraken tentacle or snagged anchor?"
  // Trout:  "Tow-truck helper or doorway blocker?"
  // SCION:  "Two Views Across Glass (SCION 17)"
  // ==========================================================================
  function renderWorld52(ctx, st) {
    var shiftY = st.ballastAmt * 22;
    drawUnderwaterBackdrop(ctx, st, "#1d757a", "#0d2b2e", 52);

    // Bridge masonry pier on right + murky stacked boulder pile on lower-left
    var troutView = st.phase === "trout" ? smoothstep(5.6, 6.2, st.actClock) : 0;

    ctx.save();
    ctx.translate(0, shiftY - 12);

    // Cut-granite bridge abutment wall (upper right, matching p52.jpg!)
    ctx.fillStyle = "#244d50";
    ctx.strokeStyle = "#0b1f21";
    ctx.lineWidth = 2.4;
    ctx.fillRect(CX + 6, CY - 205, 195, 210);
    ctx.strokeRect(CX + 6, CY - 205, 195, 210);
    // Masonry courses
    for (var row = 0; row < 6; row++) {
      var my = CY - 190 + row * 34;
      ctx.beginPath();
      ctx.moveTo(CX + 6, my);
      ctx.lineTo(CX + 200, my);
      ctx.stroke();
      var mOff = (row % 2) * 32;
      for (var col = 0; col < 3; col++) {
        ctx.beginPath();
        ctx.moveTo(CX + 38 + mOff + col * 64, my);
        ctx.lineTo(CX + 38 + mOff + col * 64, my + 34);
        ctx.stroke();
      }
    }

    // Forged Iron Mooring Ring bolted into the bridge pier (CX+92, CY-48)
    var ringX = CX + 92;
    var ringY = CY - 48;
    ctx.fillStyle = "#2b3838";
    ctx.strokeStyle = "#091214";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(ringX, ringY - 18, 10, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#566866";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(ringX, ringY + 4, 24, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "#091214";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(ringX, ringY + 4, 28.5, 0, TAU);
    ctx.arc(ringX, ringY + 4, 19.5, 0, TAU);
    ctx.stroke();

    // Murky Boulder Pile on lower-left -> reveals neat stone-lintel Burrow Doorway in Act 3!
    var bCol = troutView > 0.3 ? "#2b5556" : "#1c3c3e";
    var boulders = [
      [CX - 150, CY + 54, 48, 34],
      [CX - 98, CY + 28, 44, 30],
      [CX - 46, CY + 10, 40, 28],
      [CX + 18, CY + 22, 46, 32],
      [CX + 82, CY + 42, 56, 36],
      [CX - 155, CY + 135, 68, 44],
      [CX - 55, CY + 148, 72, 42]
    ];
    for (var bi = 0; bi < boulders.length; bi++) {
      var bd = boulders[bi];
      ctx.fillStyle = bCol;
      ctx.strokeStyle = "#09191b";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(bd[0], bd[1], bd[2], bd[3], (bi % 3 - 1) * 0.2, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Dark boulder crevice / Trout's stone-lintel doorway (CX - 112, CY + 96)
    ctx.fillStyle = "#071315";
    ctx.strokeStyle = "#0e2629";
    ctx.lineWidth = 2.6;
    roundedRectPath(ctx, CX - 152, CY + 56, 86, 78, 16);
    ctx.fill();
    ctx.stroke();
    if (troutView > 0.15) {
      // Stone lintel doorway arch + tiny brass house-number / reed welcome mat in Trout's view!
      ctx.save();
      ctx.globalAlpha = troutView;
      ctx.fillStyle = "#567d77";
      ctx.strokeStyle = "#0b1c1e";
      ctx.lineWidth = 2.4;
      roundedRectPath(ctx, CX - 160, CY + 46, 102, 16, 4);
      ctx.fill();
      ctx.stroke();
      // Warm cozy amber burrow glow inside doorway!
      var dg = ctx.createRadialGradient(CX - 108, CY + 95, 6, CX - 108, CY + 95, 44);
      dg.addColorStop(0, "rgba(255,198,108,0.48)");
      dg.addColorStop(1, "rgba(255,198,108,0)");
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.arc(CX - 108, CY + 95, 44, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // Act 2 ("Kraken tentacle or snagged anchor?"):
    // Both clues emerge from the dark boulder crevice around t = 4.0s!
    if (st.phase === "turkey") {
      var u2 = st.actClock;
      var tentAmt = smoothstep(2.1, 2.8, u2) * (1 - smoothstep(4.8, 5.4, u2));
      var anchAmt = smoothstep(3.35, 3.85, u2) * (1 - smoothstep(5.1, 5.55, u2));

      if (tentAmt > 0.02) {
        ctx.save();
        ctx.globalAlpha = tentAmt;
        // Eerie amber eyes deep inside boulder crevice
        ctx.fillStyle = "#f5b841";
        ctx.beginPath();
        ctx.ellipse(CX - 124, CY + 84, 5, 3, -0.2, 0, TAU);
        ctx.ellipse(CX - 102, CY + 82, 5, 3, 0.2, 0, TAU);
        ctx.fill();
        // Curling crimson tentacle tip with suction cups reaching out of crevice
        var curl = Math.sin(st.t * 4.5) * 8;
        ctx.fillStyle = "#962d32";
        ctx.strokeStyle = "#1d090b";
        ctx.lineWidth = 2.3;
        ctx.beginPath();
        ctx.moveTo(CX - 134, CY + 112);
        ctx.bezierCurveTo(CX - 105, CY + 70 + curl, CX - 68, CY + 62 - curl, CX - 56, CY + 38);
        ctx.bezierCurveTo(CX - 50, CY + 54, CX - 86, CY + 88 + curl, CX - 118, CY + 122);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Suction cups
        ctx.fillStyle = "#e6a89c";
        for (var sc = 0; sc < 4; sc++) {
          ctx.beginPath();
          ctx.arc(CX - 102 + sc * 12, CY + 88 - sc * 11 + curl * 0.4, 3.2, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }

      if (anchAmt > 0.02) {
        // Forged steel-iron anchor fluke snagged prominently on boulder horn!
        ctx.save();
        ctx.translate(CX - 62, CY + 82 - anchAmt * 22);
        ctx.rotate(-0.42 + Math.sin(st.t * 14) * 0.05 * anchAmt);
        ctx.fillStyle = "#8eaab0";
        ctx.strokeStyle = "#091315";
        ctx.lineWidth = 2.6;
        // Anchor ring + shank + cross-stock + barbed flukes
        ctx.beginPath();
        ctx.arc(0, -40, 7, 0, TAU);
        ctx.stroke();
        roundedRectPath(ctx, -18, -32, 36, 7, 3);
        ctx.fill();
        ctx.stroke();
        roundedRectPath(ctx, -6, -36, 12, 52, 3);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-36, 4);
        ctx.quadraticCurveTo(0, 28, 36, 4);
        ctx.lineTo(40, -12);
        ctx.lineTo(24, -3);
        ctx.quadraticCurveTo(0, 13, -24, -3);
        ctx.lineTo(-40, -12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // THE TAUT BRAIDED RED ROPE (stretching diagonally from crevice CX-138, CY+118 to mooring ring CX+80, CY-36)
    var x0 = CX - 142, y0 = CY + 122;
    var x1 = ringX - 10, y1 = ringY + 12;
    var dx = x1 - x0, dy = y1 - y0;
    var len = Math.hypot(dx, dy);
    var ux = dx / len, uy = dy / len;
    var nx = -uy, ny = ux;

    // Tension / wave displacement along the rope
    var ropeTension = st.phase === "turkey" && st.actClock > 3.5 ? 1.0 : 0.45;
    var segs = 22;

    // Silt cloud & strain lines around taut rope
    if (ropeTension > 0.7 || st.ballastAmt < 0.3) {
      ctx.strokeStyle = "rgba(244,218,170,0.45)";
      ctx.lineWidth = 1.6;
      for (var sl = 0; sl < 4; sl++) {
        var su = 0.2 + sl * 0.18;
        var sx = lerp(x0, x1, su) + nx * (sl % 2 === 0 ? 15 : -15);
        var sy = lerp(y0, y1, su) + ny * (sl % 2 === 0 ? 15 : -15);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + ux * 28, sy + uy * 28);
        ctx.stroke();
      }
    }

    // Braided 3-ply crimson hawser segments
    for (var s = 0; s < segs; s++) {
      var uA = s / segs;
      var env = Math.sin(uA * Math.PI);
      var wave =
        st.phase === "turkey" && st.actClock < 3.55
          ? Math.sin(uA * 9 - st.t * 6.5) * 10 * env
          : Math.sin(st.t * 26 + s) * 1.8 * env * ropeTension;
      // In Act 3 @ 6.8s Trout tugs rope downward slightly; @ 9.2s pushes up against it
      if (st.phase === "trout") {
        var tug = smoothstep(6.2, 7.0, st.actClock) * (1 - smoothstep(7.4, 8.0, st.actClock));
        var push = smoothstep(8.1, 8.9, st.actClock);
        wave += (tug * 14 - push * 11) * env;
      }
      var bx = lerp(x0, x1, uA) + nx * wave;
      var by = lerp(y0, y1, uA) + ny * wave;
      var angR = Math.atan2(dy, dx);

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(angR);
      var rGrad = ctx.createLinearGradient(0, -9, 0, 9);
      rGrad.addColorStop(0, "#e05a56");
      rGrad.addColorStop(0.5, "#a6282c");
      rGrad.addColorStop(1, "#4d0f13");
      ctx.fillStyle = rGrad;
      ctx.strokeStyle = "#1d0709";
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.ellipse(6, 0, 10.5, 8.2, -0.38, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Heavy bowline knot wrapped at the iron mooring ring!
    for (var k = 0; k < 3; k++) {
      ctx.fillStyle = "#b02d31";
      ctx.strokeStyle = "#1d0709";
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.ellipse(x1 - k * 8, y1 + k * 5, 11, 7, 0.55, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Act 3: Brook Trout emerging from doorway (6.8s Tow-truck tug; 9.2s Doorway blocker!)
    if (st.phase === "trout") {
      var u3 = st.actClock;
      var blockerBeat = smoothstep(7.7, 8.6, u3);
      // At 6.8s Trout is upper-right near rope knot tugging forward; at 9.2s Trout is down at its doorway blocked by the diagonal rope!
      var tx = lerp(CX + 62, CX - 54, blockerBeat);
      var ty = lerp(CY + 8, CY + 62, blockerBeat) + Math.sin(st.t * 3.0) * 4;
      var flip = blockerBeat > 0.5; // at 9.2s faces RIGHT out of its left-hand doorway against the rope & sub!
      drawBrookTrout(ctx, {
        x: tx,
        y: ty,
        scale: 0.88,
        angle: blockerBeat > 0.5 ? -0.18 : 0.12,
        flipX: flip,
        t: st.t,
        jawOpen: 0.22 + blockerBeat * 0.3,
        finPoint: 1.0,
        curiousTilt: 1.0
      });
    }

    // Fast horizontal stream lines when ballast is NOT yet dropped (makes t=0.8s vs t=1.8s super legible!)
    if (st.ballastAmt < 0.85) {
      var cAlpha = (1 - st.ballastAmt) * 0.45;
      ctx.strokeStyle = "rgba(195,242,238," + cAlpha.toFixed(3) + ")";
      ctx.lineWidth = 2.2;
      for (var cl = 0; cl < 7; cl++) {
        var cyLine = CY - 120 + cl * 38;
        var cxLine = CX - 160 + (((cl * 73 - st.t * 150) % 260) + 260) % 260;
        ctx.beginPath();
        ctx.moveTo(cxLine, cyLine);
        ctx.lineTo(cxLine + 58, cyLine);
        ctx.stroke();
      }
    }

    ctx.restore();

    drawDriftingParticles(ctx, st, 52, true);
    drawLampBeamAndDusk(ctx, st, "beam");
    drawPortholeTurkeyReflection(ctx, st, false);
  }

  // ==========================================================================
  // SCENE #53 · FLUME — "Iron gristmill wheel clicking cellar latch"
  // Turkey: "Pie-crust crimper or secret elevator?"
  // Trout:  "Wind-up key nose or jammed log?"
  // SCION:  "Reversible Gear Jam (SCION 43)"
  // ==========================================================================
  function renderWorld53(ctx, st) {
    var shiftY = st.ballastAmt * 20;
    drawUnderwaterBackdrop(ctx, st, "#23807c", "#0f3235", 53);

    // Wheel kinematics with Reversible Gear Jam (SCION 43)!
    var wheelAng = 0;
    var latchLift = 0;
    var doorOpen = 0;
    var jamAmt = 0;
    var logClear = 0;

    if (st.phase === "act1") {
      wheelAng = st.t * 1.45;
      latchLift = Math.max(0, Math.sin(wheelAng * 8)) * 0.35;
    } else if (st.phase === "turkey") {
      var u2 = st.actClock;
      wheelAng = u2 * 1.45;
      // Around t=4.0s (3.55..5.1s), a wheel lug hooks the cellar latch & lifts the secret elevator trapdoor open!
      var elev = smoothstep(3.45, 3.88, u2) * (1 - smoothstep(4.95, 5.4, u2));
      doorOpen = elev;
      latchLift = Math.max(elev * 0.85, Math.max(0, Math.sin(wheelAng * 8)) * 0.32);
    } else {
      // Act 3: Reversible Gear Jam!
      // 5.8..7.6s: Mossy log jams lower wheel -> wheel shudders & reverses slightly (captured at 6.8s!)
      // 7.7..9.8s: Trout levers log free -> wheel spins briskly again (captured at 9.2s!)
      var u3 = st.actClock;
      jamAmt = smoothstep(5.75, 6.15, u3) * (1 - smoothstep(7.65, 8.15, u3));
      logClear = smoothstep(7.65, 8.6, u3);
      if (u3 < 6.0) {
        wheelAng = u3 * 1.45;
      } else if (u3 < 7.8) {
        // Jammed shudder + slight counter-clockwise recoil!
        wheelAng = 6.0 * 1.45 - smoothstep(6.0, 7.2, u3) * 0.55 + Math.sin(st.t * 28) * 0.03 * jamAmt;
      } else {
        wheelAng = 6.0 * 1.45 - 0.55 + (u3 - 7.8) * 1.95;
      }
      latchLift = logClear * Math.max(0, Math.sin(wheelAng * 8)) * 0.45;
    }

    ctx.save();
    ctx.translate(0, shiftY - 14);

    // Mystimation crosshatched stone millhouse wall on left
    ctx.fillStyle = "#2b5452";
    ctx.strokeStyle = "#0b1a1b";
    ctx.lineWidth = 2.2;
    ctx.fillRect(CX - 195, CY - 195, 165, 320);
    ctx.strokeRect(CX - 195, CY - 195, 165, 320);
    // Karel Zeman burin crosshatching lines
    ctx.strokeStyle = "rgba(10,24,26,0.42)";
    ctx.lineWidth = 1.2;
    for (var h = -185; h < 120; h += 12) {
      ctx.beginPath();
      ctx.moveTo(CX - 190, CY + h);
      ctx.lineTo(CX - 34, CY + h + 16);
      ctx.stroke();
    }

    // Overhead wooden flume chute & foaming white-stippled water curtain
    ctx.fillStyle = "#5c4a35";
    ctx.strokeStyle = "#14100b";
    ctx.lineWidth = 2.3;
    ctx.fillRect(CX - 64, CY - 188, 92, 28);
    ctx.strokeRect(CX - 64, CY - 188, 92, 28);

    // Foaming flume stream curving around right side of wheel down to bottom
    ctx.fillStyle = "rgba(168,236,226,0.34)";
    ctx.beginPath();
    ctx.moveTo(CX - 18, CY - 162);
    ctx.bezierCurveTo(CX + 110, CY - 145, CX + 155, CY + 25, CX + 20, CY + 108);
    ctx.bezierCurveTo(CX - 80, CY + 120, CX - 150, CY + 55, CX - 190, CY + 32);
    ctx.lineTo(CX - 190, CY + 82);
    ctx.bezierCurveTo(CX - 120, CY + 128, CX - 30, CY + 142, CX + 60, CY + 115);
    ctx.bezierCurveTo(CX + 185, CY + 45, CX + 148, CY - 155, CX + 18, CY - 165);
    ctx.closePath();
    ctx.fill();

    // THE IRON GRISTMILL WHEEL (centered at CX - 24, CY - 18, r = 108)
    var wx = CX - 24;
    var wy = CY - 18;
    var wr = 106;

    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate(wheelAng);

    // Far-side drum wheel rim (2.5D depth offset +26px right)
    ctx.strokeStyle = "#3a4a44";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(24 * Math.cos(-wheelAng), 24 * Math.sin(-wheelAng), wr - 4, 0, TAU);
    ctx.stroke();

    // 16 wooden/iron water buckets + forged outer crimper/gear lugs!
    for (var b = 0; b < 16; b++) {
      var ba = (b * TAU) / 16;
      var bx1 = Math.cos(ba) * (wr - 14);
      var by1 = Math.sin(ba) * (wr - 14);
      var bx2 = Math.cos(ba) * (wr + 3);
      var by2 = Math.sin(ba) * (wr + 3);
      var dxOff = 22 * Math.cos(-wheelAng);
      var dyOff = 22 * Math.sin(-wheelAng);

      ctx.fillStyle = b % 2 === 0 ? "#5a5343" : "#454034";
      ctx.strokeStyle = "#121716";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(bx1, by1);
      ctx.lineTo(bx2, by2);
      ctx.lineTo(bx2 + dxOff, by2 + dyOff);
      ctx.lineTo(bx1 + dxOff, by1 + dyOff);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Forged outer lug tooth every 2nd bucket (clicks cellar latch & crimps pie-crust!)
      if (b % 2 === 0) {
        ctx.save();
        ctx.rotate(ba);
        ctx.fillStyle = "#8a7a56";
        ctx.strokeStyle = "#121716";
        ctx.lineWidth = 2;
        roundedRectPath(ctx, wr - 2, -5, 13, 10, 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // 8 cast-iron spokes
    for (var sp = 0; sp < 8; sp++) {
      var sa = (sp * TAU) / 8;
      ctx.save();
      ctx.rotate(sa);
      ctx.fillStyle = "#7c735c";
      ctx.strokeStyle = "#121716";
      ctx.lineWidth = 2.1;
      ctx.fillRect(16, -4.5, wr - 24, 9);
      ctx.strokeRect(16, -4.5, wr - 24, 9);
      ctx.restore();
    }

    // Outer riveted cast-iron shroud ring
    ctx.strokeStyle = "#888068";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(0, 0, wr - 6, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "#121716";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, wr, 0, TAU);
    ctx.arc(0, 0, wr - 12, 0, TAU);
    ctx.stroke();
    for (var rv2 = 0; rv2 < 16; rv2++) {
      var ra = (rv2 * TAU) / 16 + 0.19;
      ctx.fillStyle = "#2b2922";
      ctx.beginPath();
      ctx.arc(Math.cos(ra) * (wr - 6), Math.sin(ra) * (wr - 6), 2.1, 0, TAU);
      ctx.fill();
    }

    // Central axle hub
    ctx.fillStyle = "#565e5c";
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Mossy stone axle pedestal (foreground left of wheel center, matching p53.jpg!)
    ctx.fillStyle = "#4d6d5a";
    ctx.strokeStyle = "#0e1d18";
    ctx.lineWidth = 2.4;
    roundedRectPath(ctx, wx - 56, wy + 10, 68, 76, 6);
    ctx.fill();
    ctx.stroke();
    // Cast-iron pillow block bearing
    ctx.fillStyle = "#566362";
    roundedRectPath(ctx, wx - 42, wy - 12, 44, 24, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#2c3636";
    ctx.beginPath();
    ctx.arc(wx - 20, wy, 9, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Act 2 visual fork cue 1: Scalloped golden river-clay "pie-crust" ridge crimped by the wheel lugs!
    if (st.phase === "turkey") {
      ctx.fillStyle = "#d9ae6c";
      ctx.strokeStyle = "#362410";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(CX - 76, CY + 108);
      for (var cr = 0; cr < 6; cr++) {
        ctx.quadraticCurveTo(CX - 68 + cr * 14, CY + 96, CX - 61 + cr * 14, CY + 108);
      }
      ctx.lineTo(CX + 8, CY + 118);
      ctx.lineTo(CX - 76, CY + 118);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // SLANTED OAK CELLAR TRAPDOOR + ARTICULATED BRASS LATCH (CX + 22, CY + 118)
    var doorX = CX - 12;
    var doorY = CY + 114;

    // Secret elevator warm golden light shaft & vertical pulley cables when doorOpen > 0 (t=4.0s!)
    if (doorOpen > 0.02) {
      ctx.save();
      var eg = ctx.createLinearGradient(doorX + 40, doorY + 20, doorX + 40, doorY - 90);
      eg.addColorStop(0, "rgba(255,204,92," + (0.78 * doorOpen).toFixed(3) + ")");
      eg.addColorStop(1, "rgba(255,204,92,0)");
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.moveTo(doorX + 4, doorY + 18);
      ctx.lineTo(doorX + 104, doorY + 18);
      ctx.lineTo(doorX + 124, doorY - 75);
      ctx.lineTo(doorX - 12, doorY - 75);
      ctx.closePath();
      ctx.fill();

      // Rising elevator cage guide chains!
      ctx.strokeStyle = "#f7df9c";
      ctx.lineWidth = 2.2;
      ctx.setLineDash([5, 4]);
      ctx.lineDashOffset = -st.t * 28;
      ctx.beginPath();
      ctx.moveTo(doorX + 28, doorY + 16);
      ctx.lineTo(doorX + 28, doorY - 52 * doorOpen);
      ctx.moveTo(doorX + 74, doorY + 16);
      ctx.lineTo(doorX + 74, doorY - 52 * doorOpen);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Oak cellar trapdoor leaf (hinged at right edge doorX+112, doorY+14)
    ctx.save();
    ctx.translate(doorX + 112, doorY + 14);
    ctx.rotate(doorOpen * 0.44);
    ctx.fillStyle = "#7a6345";
    ctx.strokeStyle = "#17120b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-116, -12);
    ctx.lineTo(-92, 26);
    ctx.lineTo(18, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pivoted Brass Latch Bar on top of trapdoor!
    ctx.save();
    ctx.translate(-44, 6);
    ctx.rotate(latchLift * 0.52);
    ctx.fillStyle = "#e6be5c";
    ctx.strokeStyle = "#1c1508";
    ctx.lineWidth = 2.2;
    roundedRectPath(ctx, -46, -5, 54, 10, 4);
    ctx.fill();
    ctx.stroke();
    // Hooked nose of latch
    ctx.beginPath();
    ctx.arc(-44, -8, 7, Math.PI * 0.6, Math.PI * 2.1);
    ctx.fill();
    ctx.stroke();
    // Pivot pin
    ctx.fillStyle = "#fff1b8";
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();

    // Crisp white water/click sparks at latch contact!
    if (latchLift > 0.2 && jamAmt < 0.5) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      for (var spk = 0; spk < 5; spk++) {
        var sa2 = -Math.PI * 0.85 + spk * 0.36;
        ctx.beginPath();
        ctx.moveTo(wx + 12 + Math.cos(sa2) * 8, wy + wr + 4 + Math.sin(sa2) * 6);
        ctx.lineTo(wx + 12 + Math.cos(sa2) * 22, wy + wr + 4 + Math.sin(sa2) * 18);
        ctx.stroke();
      }
    }

    // Act 3: Mossy Jammed Log (wedged at 6.8s; levered clear & floating off at 9.2s!) + Brook Trout!
    if (st.phase === "trout") {
      var lx = lerp(wx + 42, wx - 118, logClear);
      var ly = lerp(wy + 78, wy + 128, logClear);
      var lAng = lerp(-0.38, 0.25, logClear) + Math.sin(st.t * 22) * 0.04 * jamAmt;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(lAng);
      ctx.fillStyle = "#5c3f28";
      ctx.strokeStyle = "#170f08";
      ctx.lineWidth = 2.4;
      roundedRectPath(ctx, -44, -9, 88, 18, 7);
      ctx.fill();
      ctx.stroke();
      // Moss patch & knot
      ctx.fillStyle = "#588a52";
      ctx.beginPath();
      ctx.ellipse(-8, -8, 16, 5, 0, 0, TAU);
      ctx.fill();
      ctx.restore();

      // Brook Trout: at 6.8s nudging the jammed log; at 9.2s hovering near the brass latch/key rim!
      var tx3 = lerp(CX + 108, CX + 92, logClear);
      var ty3 = lerp(CY + 34, CY - 8, logClear) + Math.sin(st.t * 3.1) * 5;
      drawBrookTrout(ctx, {
        x: tx3,
        y: ty3,
        scale: 0.9,
        angle: lerp(0.28, -0.15, logClear),
        flipX: false,
        t: st.t,
        jawOpen: 0.2 + jamAmt * 0.3,
        finPoint: logClear,
        curiousTilt: 0.9
      });
    }

    ctx.restore();

    drawDriftingParticles(ctx, st, 53, true);
    drawLampBeamAndDusk(ctx, st, "beam");
    drawPortholeTurkeyReflection(ctx, st, false);
  }

  // ==========================================================================
  // SCENE #54 · LEDGE — "Wrinkled Hellbender swaying frilly folds"
  // Turkey: "Ruffled gravy boat or river dragon?"
  // Trout:  "Long-lost wattled cousin or tin hermit crab?"
  // SCION:  "Anatomical Double Take (Oubapo)"
  // ==========================================================================
  function renderWorld54(ctx, st) {
    var shiftY = st.ballastAmt * 15;
    drawUnderwaterBackdrop(ctx, st, "#16686d", "#0b2428", 54);

    ctx.save();
    ctx.translate(0, shiftY);

    // Chert pebble creek floor
    ctx.fillStyle = "#1d4648";
    ctx.strokeStyle = "#08181a";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(CX - 195, CY + 62);
    ctx.quadraticCurveTo(CX, CY + 45, CX + 195, CY + 70);
    ctx.lineTo(CX + 195, CY + 200);
    ctx.lineTo(CX - 195, CY + 200);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    var pebbles = [
      [-95, 86, 28, 12], [-35, 76, 22, 10], [58, 98, 24, 11],
      [-55, 118, 20, 9], [18, 124, 26, 10], [105, 84, 30, 13]
    ];
    for (var pi = 0; pi < pebbles.length; pi++) {
      var pb = pebbles[pi];
      ctx.fillStyle = "#2b5b5c";
      ctx.strokeStyle = "#0b1f21";
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.ellipse(CX + pb[0], CY + pb[1], pb[2], pb[3], 0.08 * (pi % 3 - 1), 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Overhanging Appalachian Limestone Ledge (upper right -> center-left, matching p54.jpg!)
    // Dark crevice shadow under ledge
    ctx.fillStyle = "#081c20";
    ctx.beginPath();
    ctx.moveTo(CX - 98, CY - 92);
    ctx.lineTo(CX + 195, CY - 62);
    ctx.lineTo(CX + 195, CY + 68);
    ctx.quadraticCurveTo(CX + 40, CY + 36, CX - 52, CY + 46);
    ctx.closePath();
    ctx.fill();

    // Mossy limestone slab cap
    var rockGrad = ctx.createLinearGradient(CX, CY - 148, CX, CY - 58);
    rockGrad.addColorStop(0, "#468980");
    rockGrad.addColorStop(1, "#245250");
    ctx.fillStyle = rockGrad;
    ctx.strokeStyle = "#0a1e20";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(CX - 108, CY - 98);
    ctx.quadraticCurveTo(CX - 20, CY - 146, CX + 195, CY - 154);
    ctx.lineTo(CX + 195, CY - 52);
    ctx.quadraticCurveTo(CX + 38, CY - 66, CX - 96, CY - 82);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Choreography of the Giant Wrinkled Hellbender:
    // - Act 2 @ 2.2..3.3s: plump "ruffled gravy boat" posture with golden silt steam
    // - Act 2 @ 3.5..5.4s (captured at 4.0s!): dramatic "river dragon" rear-up, flared frills + bubble breath!
    // - Act 3 @ 6.8s: synchronized head-tilt + wattle/frill ripple with Turkey ("long-lost wattled cousin")
    // - Act 3 @ 9.2s: tucked shyly back under its stone shell ("tin hermit crab")!
    var dragonRear = 0;
    var cousinTilt = 0;
    var crabRetreat = 0;

    if (st.phase === "turkey") {
      dragonRear = smoothstep(3.4, 3.88, st.actClock) * (1 - smoothstep(5.15, 5.55, st.actClock));
    } else if (st.phase === "trout") {
      cousinTilt = smoothstep(5.9, 6.5, st.actClock) * (1 - smoothstep(7.5, 8.1, st.actClock));
      crabRetreat = smoothstep(7.8, 8.7, st.actClock);
    }

    drawHellbenderRig(ctx, {
      x: CX + 18 + crabRetreat * 56,
      y: CY + 34 - dragonRear * 16 - crabRetreat * 16,
      t: st.t,
      lampAmt: st.lampAmt,
      dragonRear: dragonRear,
      cousinTilt: cousinTilt,
      crabRetreat: crabRetreat
    });

    // River-dragon bubble vortex breath at t = 4.0s!
    if (dragonRear > 0.25) {
      for (var db = 0; db < 9; db++) {
        var dp = ((st.t * 1.9 + db * 0.13) % 1.0);
        var bx = CX - 56 - dp * 78;
        var by = CY + 12 - dp * 38 + Math.sin(dp * 9 + db) * 8;
        ctx.strokeStyle = "rgba(255,232,165," + ((1 - dp) * 0.75 * dragonRear).toFixed(3) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx, by, 3 + dp * 7, 0, TAU);
        ctx.stroke();
      }
    }

    // Foreground creek eelgrass
    drawKelpFrond(ctx, CX + 122, CY + 165, 96, st.t + 0.5, -0.7);
    drawKelpFrond(ctx, CX - 135, CY + 40, 62, st.t + 2.1, 0.6);

    // Act 3: Spotted Brook Trout entering from upper-left (facing RIGHT toward Hellbender & glass!)
    if (st.phase === "trout") {
      var enter4 = smoothstep(5.6, 6.35, st.actClock);
      var tx4 = lerp(CX - 215, CX - 114, enter4) + crabRetreat * 26;
      var ty4 = lerp(CY - 12, CY - 4, enter4) + crabRetreat * 28 + Math.sin(st.t * 2.8) * 4;
      drawBrookTrout(ctx, {
        x: tx4,
        y: ty4,
        scale: 0.86,
        angle: crabRetreat * 0.18,
        flipX: true, // Snout pointing RIGHT toward Hellbender!
        t: st.t,
        jawOpen: 0.28 + 0.25 * cousinTilt,
        finPoint: 1.0,
        curiousTilt: 1.0
      });
    }

    ctx.restore();

    drawDriftingParticles(ctx, st, 54, false);
    drawLampBeamAndDusk(ctx, st, "bottomSpot");

    // Bottom spotlight brass lamp bezel on lower porthole rim (matching p54.jpg!)
    ctx.save();
    ctx.fillStyle = st.lampAmt > 0.3 ? "#d89c42" : "#5e5038";
    ctx.strokeStyle = "#14100a";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(CX, CY + 178, 34, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (st.lampAmt > 0.2) {
      ctx.fillStyle = "rgba(255,235,168," + (0.85 * st.lampAmt).toFixed(3) + ")";
      ctx.beginPath();
      ctx.ellipse(CX, CY + 164, 22, 7, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    drawPortholeTurkeyReflection(ctx, st, st.phase === "trout");
  }

  function drawHellbenderRig(ctx, o) {
    // 11-node S-curve spine from broad shovel head (front-left) to keeled paddle tail (upper-center/right)
    var t = o.t;
    var rear = o.dragonRear;
    var tilt = o.cousinTilt;
    var retreat = o.crabRetreat;

    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(tilt * -0.12);
    var sc = 1 - retreat * 0.08;
    ctx.scale(sc, sc);

    // Spine control points in local coords: head at (-54, 18 - rear*22) curving right then looping left-up for keeled tail!
    var pts = [];
    var N = 12;
    for (var i = 0; i < N; i++) {
      var u = i / (N - 1); // 0 = head, 1 = tail tip
      var sx, sy;
      if (u < 0.55) {
        var k = u / 0.55;
        sx = lerp(-56, 76, k);
        sy = lerp(22 - rear * 26, -8, k) + Math.sin(k * Math.PI) * 12;
      } else {
        var k2 = (u - 0.55) / 0.45;
        sx = lerp(76, -58 - rear * 16, k2) + Math.sin(k2 * Math.PI) * 34;
        sy = lerp(-8, -56 - rear * 18, k2) - Math.sin(k2 * Math.PI) * 18;
      }
      var sway = Math.sin(t * 3.8 - u * 5.2) * (4 + u * 8);
      pts.push([sx, sy + sway]);
    }

    // Keeled paddle tail fin along upper spine (nodes 6..11)
    ctx.fillStyle = "#9c622c";
    ctx.strokeStyle = "#1e1208";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(pts[5][0], pts[5][1] - 12);
    for (var ti = 6; ti < N; ti++) {
      var crest = (18 + rear * 10) * Math.sin(((ti - 5) / (N - 5)) * Math.PI);
      ctx.lineTo(pts[ti][0], pts[ti][1] - crest - 6);
    }
    ctx.lineTo(pts[N - 1][0] - 12, pts[N - 1][1]);
    for (var ti2 = N - 1; ti2 >= 5; ti2--) {
      ctx.lineTo(pts[ti2][0], pts[ti2][1] + 10);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Main mottled amber-ochre salamander body tube
    for (var bi = N - 2; bi >= 0; bi--) {
      var uB = bi / (N - 1);
      var rad = uB < 0.5 ? lerp(25, 21, uB * 2) : lerp(21, 5, (uB - 0.5) * 2);
      ctx.fillStyle = o.lampAmt > 0.3 ? "#c27d38" : "#78532c";
      ctx.strokeStyle = "#1e1208";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(pts[bi][0], pts[bi][1], rad * 1.25, rad * 0.82, -0.18, 0, TAU);
      ctx.fill();
      if (bi % 2 === 0) ctx.stroke();
    }

    // LUSH WRINKLED FRILLY LATERAL SKIN FOLDS (continuous undulating ribbon along flank!)
    var frillAmp = 6 + rear * 5 + tilt * 4;
    ctx.fillStyle = o.lampAmt > 0.3 ? "#e29a49" : "#8f6436";
    ctx.strokeStyle = "#1e1208";
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(pts[0][0] + 10, pts[0][1] + 8);
    for (var fi = 0; fi <= 22; fi++) {
      var fu = (fi / 22) * 0.65;
      var idx = Math.min(N - 2, Math.floor(fu * (N - 1)));
      var frac = fu * (N - 1) - idx;
      var fx = lerp(pts[idx][0], pts[idx + 1][0], frac);
      var fy = lerp(pts[idx][1], pts[idx + 1][1], frac) + 12;
      var ruffle = Math.sin(fi * 2.1 - t * 6.2) * frillAmp;
      ctx.lineTo(fx + ruffle * 0.35, fy + 6 + Math.abs(ruffle));
    }
    ctx.lineTo(pts[7][0], pts[7][1] + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Yuasa electric cyan/gold rim highlight along the frilly folds when lit!
    if (o.lampAmt > 0.3) {
      ctx.strokeStyle = rear > 0.3 ? "#6ef2ea" : "#ffe184";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var fi2 = 0; fi2 <= 18; fi2++) {
        var fu2 = (fi2 / 18) * 0.58;
        var idx2 = Math.min(N - 2, Math.floor(fu2 * (N - 1)));
        var fx2 = pts[idx2][0];
        var fy2 = pts[idx2][1] + 15 + Math.abs(Math.sin(fi2 * 2.1 - t * 6.2) * frillAmp);
        if (fi2 === 0) ctx.moveTo(fx2, fy2);
        else ctx.lineTo(fx2, fy2);
      }
      ctx.stroke();
    }

    // Articulated 4-toed foreleg (planted on pebble or reared up like dragon!)
    ctx.save();
    ctx.translate(pts[2][0] + 4, pts[2][1] + 16);
    ctx.rotate(rear * -0.55 + Math.sin(t * 2.5) * 0.06);
    ctx.fillStyle = o.lampAmt > 0.3 ? "#c6803a" : "#78532c";
    ctx.strokeStyle = "#1e1208";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.quadraticCurveTo(14, 6, 8, 22);
    // 4 toes
    ctx.lineTo(14, 28);
    ctx.lineTo(6, 26);
    ctx.lineTo(4, 31);
    ctx.lineTo(0, 25);
    ctx.lineTo(-6, 29);
    ctx.lineTo(-7, 22);
    ctx.quadraticCurveTo(-2, 10, -10, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Broad flattened shovel-head (pts[0])
    ctx.save();
    ctx.translate(pts[0][0], pts[0][1]);
    ctx.rotate(-0.12 - rear * 0.28 + tilt * 0.22);
    var hg = ctx.createRadialGradient(-8, -6, 4, 0, 0, 42);
    hg.addColorStop(0, o.lampAmt > 0.3 ? "#e3a252" : "#8e6639");
    hg.addColorStop(1, o.lampAmt > 0.3 ? "#9c5e26" : "#563b1f");
    ctx.fillStyle = hg;
    ctx.strokeStyle = "#1e1208";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 38, 21, -0.08, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Wide smiling amphibian mouth crease
    ctx.beginPath();
    ctx.moveTo(-36, 4);
    ctx.quadraticCurveTo(-14, 13 + rear * 4, 14, 6);
    ctx.stroke();

    // Mottled spots on head & tiny bright bead-eye
    ctx.fillStyle = "#5c3614";
    ctx.beginPath();
    ctx.arc(6, -7, 2.5, 0, TAU);
    ctx.arc(14, -3, 2, 0, TAU);
    ctx.arc(-2, -10, 2, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#f7df94";
    ctx.beginPath();
    ctx.arc(-10, -2, 5.2, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#120c07";
    ctx.beginPath();
    ctx.arc(-11, -2, 2.6, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // ==========================================================================
  // SCENE #55 · EDDY — "Corked brass tube stuffed with 54 postcards"
  // Turkey: "My own handwriting or eviction notice?"
  // Trout:  "Dead-letter dropbox or alien bottle?"
  // SCION:  "Recursive Worldtext (PAELEO ↻)"
  // ==========================================================================
  function renderWorld55(ctx, st) {
    var shiftY = st.ballastAmt * 14;
    drawUnderwaterBackdrop(ctx, st, "#248f87", "#0b2e33", 55);

    ctx.save();
    ctx.translate(0, shiftY);

    // Swirling teal-emerald Eddy spiral ribbons (4 RPM logarithmic/concentric current lines!)
    ctx.save();
    ctx.translate(CX, CY);
    for (var sr = 0; sr < 7; sr++) {
      var radS = 44 + sr * 22;
      var startA = st.t * (0.65 - sr * 0.05) + sr * 1.1;
      ctx.strokeStyle = sr % 2 === 0 ? "rgba(182,246,232,0.28)" : "rgba(10,38,42,0.34)";
      ctx.lineWidth = 3.2 - sr * 0.25;
      ctx.beginPath();
      ctx.arc(0, 0, radS, startA, startA + 2.2);
      ctx.stroke();
    }
    ctx.restore();

    // Choreography of the Corked Brass & Glass Dispatch Tube:
    // - Act 2 @ 2.1..3.5s: shows recursive miniature porthole + quill curls ("My own handwriting")
    // - Act 2 @ 3.6..5.4s (captured at 4.0s!): rotates to show bold red wax eviction seal & recursive rings ("eviction notice?")
    // - Act 3 @ 6.8s: Brook Trout arrives carrying Postcard #55, nudging the cork ajar ("Dead-letter dropbox?")
    // - Act 3 @ 9.2s: Cork pops snug with bioluminescent Vesuvius synth-rings ("alien bottle" + 55th portal completion!)
    var evictRot = 0;
    var corkLift = 0;
    var alienGlow = 0;
    var cardInserted = 0;

    if (st.phase === "turkey") {
      evictRot = smoothstep(3.45, 3.92, st.actClock) * (1 - smoothstep(5.15, 5.55, st.actClock));
    } else if (st.phase === "trout") {
      corkLift = smoothstep(6.2, 6.7, st.actClock) * (1 - smoothstep(7.7, 8.15, st.actClock));
      cardInserted = smoothstep(7.5, 8.1, st.actClock);
      alienGlow = smoothstep(7.9, 8.7, st.actClock);
    }

    // Recursive PAELEO ↻ concentric golden/cyan echo rings around the tube!
    if (evictRot > 0.1 || alienGlow > 0.1) {
      var ringStrength = Math.max(evictRot * 0.55, alienGlow * 0.85);
      for (var rr = 0; rr < 3; rr++) {
        var rp = ((st.t * 0.55 + rr * 0.33) % 1.0);
        var rRad = 68 + rp * 98;
        ctx.strokeStyle = alienGlow > 0.2
          ? "rgba(128,255,232," + ((1 - rp) * 0.65 * ringStrength).toFixed(3) + ")"
          : "rgba(255,214,122," + ((1 - rp) * 0.55 * ringStrength).toFixed(3) + ")";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(CX - 8, CY + 4, rRad, 0, TAU);
        ctx.stroke();
      }
    }

    // THE CORKED BRASS & GLASS TUBE (tilted diagonally like p55.jpg, gently bobbing & rotating!)
    var tubeX = CX - 12 + Math.sin(st.t * 1.3) * 6;
    var tubeY = CY + 4 + Math.cos(st.t * 1.6) * 7;
    var tubeAng = -0.66 + Math.sin(st.t * 0.95) * 0.08 + alienGlow * 0.16;

    ctx.save();
    ctx.translate(tubeX, tubeY);
    ctx.rotate(tubeAng);

    // Alien bottle bioluminescent inner halo at 9.2s!
    if (alienGlow > 0.05) {
      var ag = ctx.createRadialGradient(0, 0, 12, 0, 0, 96);
      ag.addColorStop(0, "rgba(130,255,230," + (0.48 * alienGlow).toFixed(3) + ")");
      ag.addColorStop(0.6, "rgba(255,190,95," + (0.25 * alienGlow).toFixed(3) + ")");
      ag.addColorStop(1, "rgba(130,255,230,0)");
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.arc(0, 0, 96, 0, TAU);
      ctx.fill();
    }

    // Glass cylinder body (-38..38 x -72..72)
    var glassGrad = ctx.createLinearGradient(-38, 0, 38, 0);
    glassGrad.addColorStop(0, "rgba(175,232,226,0.42)");
    glassGrad.addColorStop(0.35, "rgba(235,255,250,0.22)");
    glassGrad.addColorStop(0.8, "rgba(32,96,98,0.38)");
    glassGrad.addColorStop(1, "rgba(165,228,220,0.48)");
    ctx.fillStyle = glassGrad;
    ctx.strokeStyle = "#102426";
    ctx.lineWidth = 2.4;
    ctx.fillRect(-37, -70, 74, 140);
    ctx.strokeRect(-37, -70, 74, 140);

    // 54 Rolled Porthole Postcards bundled inside the glass!
    var scrollColors = ["#a7d9b8", "#f3a88f", "#9bcce6", "#f5df9d", "#faf4e4", "#eab46c"];
    for (var scIdx = 0; scIdx < 6; scIdx++) {
      var sx = -25 + scIdx * 9.5;
      var sTop = -52 + ((scIdx * 7) % 15) - 5;
      ctx.fillStyle = scrollColors[scIdx];
      ctx.strokeStyle = "#221a12";
      ctx.lineWidth = 1.7;
      roundedRectPath(ctx, sx - 5.5, sTop, 11, 108 - (scIdx % 3) * 6, 4);
      ctx.fill();
      ctx.stroke();
      // Spiral rolled top end
      ctx.fillStyle = "#5c4a38";
      ctx.beginPath();
      ctx.ellipse(sx, sTop + 3, 4, 2, 0, 0, TAU);
      ctx.fill();
    }

    // Featured Front Scroll: Recursive Worldtext (miniature porthole medallion + quill lines OR crimson eviction stamp!)
    ctx.save();
    ctx.fillStyle = "#fcf7e8";
    ctx.strokeStyle = "#221a12";
    ctx.lineWidth = 1.9;
    roundedRectPath(ctx, -14, -46, 28, 94, 5);
    ctx.fill();
    ctx.stroke();

    // Miniature recursive brass porthole drawn on the postcard! (PAELEO ↻)
    ctx.strokeStyle = "#9c7028";
    ctx.fillStyle = "#267d82";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, -20, 9.5, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Tiny recursive tube inside the tiny porthole!
    ctx.strokeStyle = "#faf3dd";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-4, -24);
    ctx.lineTo(4, -16);
    ctx.stroke();

    // Cursive ink squiggles (zero English text so blind-critic invariant is 100% pure!)
    ctx.strokeStyle = "#2c241c";
    ctx.lineWidth = 1.3;
    for (var ln = 0; ln < 4; ln++) {
      var ly2 = -2 + ln * 8;
      ctx.beginPath();
      ctx.moveTo(-9, ly2);
      ctx.bezierCurveTo(-4, ly2 - 3, 4, ly2 + 3, 9, ly2 - 1);
      ctx.stroke();
    }

    // At t=4.0s (evictRot > 0): Bold crimson wax seal & diagonal red warning band!
    if (evictRot > 0.05) {
      ctx.globalAlpha = evictRot;
      ctx.fillStyle = "#c93528";
      ctx.fillRect(-13, 18, 26, 7);
      ctx.beginPath();
      ctx.arc(0, 34, 7.5, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#fff4df";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, 29.5);
      ctx.lineTo(0, 35);
      ctx.moveTo(0, 37.8);
      ctx.lineTo(0, 38.8);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Hemp twine bow tied around the 54-postcard bundle
    ctx.strokeStyle = "#8c6239";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-30, 4);
    ctx.lineTo(30, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-7, 0, 7, 4, -0.4, 0, TAU);
    ctx.ellipse(7, 0, 7, 4, 0.4, 0, TAU);
    ctx.stroke();
    ctx.restore();

    // Top & Bottom Tarnished Brass Collars
    drawBrassCollar(ctx, 0, -76, 46, 24);
    drawBrassCollar(ctx, 0, 76, 46, 24);

    // Porous speckled Cork Stopper (lifts ajar at t=6.8s for Trout's 55th card, snaps shut at 8.1s!)
    ctx.save();
    ctx.translate(0, -100 - corkLift * 18);
    ctx.rotate(corkLift * -0.18);
    var corkGrad = ctx.createLinearGradient(-28, 0, 28, 0);
    corkGrad.addColorStop(0, "#8f6237");
    corkGrad.addColorStop(0.45, "#d8a86e");
    corkGrad.addColorStop(1, "#6e4723");
    ctx.fillStyle = corkGrad;
    ctx.strokeStyle = "#1e1309";
    ctx.lineWidth = 2.3;
    roundedRectPath(ctx, -27, -14, 54, 28, 7);
    ctx.fill();
    ctx.stroke();
    // Cork pores + red wax drip
    ctx.fillStyle = "#543518";
    var pores = [[-16, -4], [-5, 5], [8, -6], [17, 3], [-2, -8]];
    for (var cp = 0; cp < pores.length; cp++) {
      ctx.beginPath();
      ctx.arc(pores[cp][0], pores[cp][1], 1.8, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "#b53428";
    ctx.beginPath();
    ctx.arc(-14, -12, 6, 0, Math.PI);
    ctx.fill();
    ctx.restore();

    // Specular glass highlight stripe along cylinder
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    roundedRectPath(ctx, -28, -62, 8, 124, 4);
    ctx.fill();

    ctx.restore();

    // Act 3: Brook Trout delivering the 55th Porthole Postcard (6.8s carries card to cork; 9.2s card is inside & Trout nods!)
    if (st.phase === "trout") {
      var enter5 = smoothstep(5.6, 6.4, st.actClock);
      var tx5 = lerp(CX + 215, CX + 96, enter5) + alienGlow * 14;
      var ty5 = lerp(CY - 30, CY - 24, enter5) + alienGlow * 28 + Math.sin(st.t * 2.7) * 5;
      drawBrookTrout(ctx, {
        x: tx5,
        y: ty5,
        scale: 0.9,
        angle: lerp(-0.12, 0.08, alienGlow),
        flipX: false,
        t: st.t,
        jawOpen: cardInserted < 0.5 ? 0.32 : 0.15,
        finPoint: alienGlow,
        curiousTilt: 0.85,
        carryCard: cardInserted < 0.65
      });
    }

    ctx.restore();

    drawDriftingParticles(ctx, st, 55, false);
    drawLampBeamAndDusk(ctx, st, "beam");
    drawPortholeTurkeyReflection(ctx, st, false);
  }

  function drawBrassCollar(ctx, cx, cy, rx, h) {
    var g = ctx.createLinearGradient(cx - rx, cy, cx + rx, cy);
    g.addColorStop(0, "#5e461d");
    g.addColorStop(0.32, "#e8c26b");
    g.addColorStop(0.55, "#fff0b5");
    g.addColorStop(0.85, "#9c7430");
    g.addColorStop(1, "#4a3615");
    ctx.fillStyle = g;
    ctx.strokeStyle = "#1a1307";
    ctx.lineWidth = 2.3;
    roundedRectPath(ctx, cx - rx, cy - h * 0.5, rx * 2, h, 6);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - rx + 3, cy);
    ctx.lineTo(cx + rx - 3, cy);
    ctx.stroke();
  }

  function drawKelpFrond(ctx, baseX, baseY, height, t, dir) {
    ctx.save();
    ctx.strokeStyle = "#1e5b52";
    ctx.fillStyle = "#2b7868";
    ctx.lineWidth = 2;
    for (var s = -1; s <= 1; s++) {
      var h = height * (1 - Math.abs(s) * 0.22);
      var tipX = baseX + s * 11 + Math.sin(t * 2.1 + s) * 12 * dir;
      ctx.beginPath();
      ctx.moveTo(baseX + s * 7, baseY);
      ctx.quadraticCurveTo(baseX + s * 14 + 10 * dir, baseY - h * 0.5, tipX, baseY - h);
      ctx.quadraticCurveTo(baseX + s * 4 - 6 * dir, baseY - h * 0.45, baseX + s * 7 + 5, baseY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function lerpColorHex(c1, c2, u) {
    var t = clamp(u, 0, 1);
    var r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
    var r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
    var r = Math.round(lerp(r1, r2, t));
    var g = Math.round(lerp(g1, g2, t));
    var b = Math.round(lerp(b1, b2, t));
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  // ==========================================================================
  // SETUP A BREAD-TIN COCKPIT & EDITORIAL STORY STRIP
  // ==========================================================================
  function drawSetupACockpit(ctx, meta, st, drawWorldFn) {
    // 1. Outer dark bulkhead surround
    ctx.fillStyle = "#0b1618";
    ctx.fillRect(0, 0, 1280, st.showCaptions ? SPLIT_Y : 720);

    // 2. Oval Bread-Roll Tin Interior (#132427) with Right-Side Dent!
    var tinTop = 14;
    var tinBot = 524;
    var tinLeft = 58;
    var tinRight = 1222;

    ctx.save();
    // Custom path with inward hammered right-side dent around y=185..295
    ctx.beginPath();
    ctx.moveTo(tinLeft + 108, tinTop);
    ctx.lineTo(tinRight - 108, tinTop);
    ctx.quadraticCurveTo(tinRight, tinTop, tinRight, tinTop + 108);
    ctx.lineTo(tinRight, 178);
    // THE RIGHT-SIDE DENT (Setup A invariant!)
    ctx.bezierCurveTo(tinRight - 42, 205, tinRight - 46, 265, tinRight, 296);
    ctx.lineTo(tinRight, tinBot - 108);
    ctx.quadraticCurveTo(tinRight, tinBot, tinRight - 108, tinBot);
    ctx.lineTo(tinLeft + 108, tinBot);
    ctx.quadraticCurveTo(tinLeft, tinBot, tinLeft, tinBot - 108);
    ctx.lineTo(tinLeft, tinTop + 108);
    ctx.quadraticCurveTo(tinLeft, tinTop, tinLeft + 108, tinTop);
    ctx.closePath();

    var tinGrad = ctx.createRadialGradient(CX, 160, 80, CX, 280, 650);
    tinGrad.addColorStop(0, "#1d3539");
    tinGrad.addColorStop(0.65, "#132427");
    tinGrad.addColorStop(1, "#0e1b1e");
    ctx.fillStyle = tinGrad;
    ctx.fill();

    // Subtle bread-tin vertical stamped ribs inside
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,0.035)";
    ctx.lineWidth = 6;
    for (var rx = 160; rx <= 1120; rx += 120) {
      if (Math.abs(rx - CX) < 220) continue;
      ctx.beginPath();
      ctx.moveTo(rx, tinTop + 20);
      ctx.lineTo(rx, tinBot - 20);
      ctx.stroke();
    }

    // Hammered dent metallic crease highlights on right wall
    ctx.strokeStyle = "rgba(163,218,200,0.34)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(tinRight - 8, 186);
    ctx.quadraticCurveTo(tinRight - 44, 236, tinRight - 10, 288);
    ctx.stroke();
    ctx.strokeStyle = "rgba(6,12,14,0.65)";
    ctx.beginPath();
    ctx.moveTo(tinRight - 18, 198);
    ctx.quadraticCurveTo(tinRight - 52, 236, tinRight - 20, 276);
    ctx.stroke();

    // Overhead Amber Task-Light Bar (matching setupA.webp!)
    var taskPulse = 0.88 + Math.sin(st.t * 3.1) * 0.05 + st.lampAmt * 0.12;
    var ambPool = ctx.createRadialGradient(CX, 44, 18, CX, 180, 390);
    ambPool.addColorStop(0, "rgba(237,180,115," + (0.28 * taskPulse).toFixed(3) + ")");
    ambPool.addColorStop(0.6, "rgba(237,180,115,0.06)");
    ambPool.addColorStop(1, "rgba(237,180,115,0)");
    ctx.fillStyle = ambPool;
    ctx.fillRect(120, 14, 1040, 420);

    // Brass conduit rail + center amber fixture
    ctx.strokeStyle = "#9c7547";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(132, 86);
    ctx.lineTo(212, 38);
    ctx.lineTo(1068, 38);
    ctx.lineTo(1148, 86);
    ctx.stroke();
    ctx.fillStyle = "#f2b66d";
    ctx.strokeStyle = "#3a2510";
    ctx.lineWidth = 2;
    roundedRectPath(ctx, CX - 56, 29, 112, 18, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Rolled bread-tin rim border
    ctx.strokeStyle = "#4d7472";
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.restore();

    // 3. Top-Left Trim / Clinometer Plumb Dial & Top-Right "1 Day of Air" Dial
    drawTrimDial(ctx, 218, 128, st);
    drawAirDial(ctx, 1062, 128, st);

    // 4. PORTHOLE GLASS WORLD (clipped cleanly inside r_glass = 185)
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS, 0, TAU);
    ctx.clip();
    drawWorldFn(ctx, st);

    // Curved crown-glass meniscus highlight + subtle inner shadow vignette
    var vig = ctx.createRadialGradient(CX, CY, R_GLASS - 28, CX, CY, R_GLASS + 2);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(0.75, "rgba(6,16,18,0.18)");
    vig.addColorStop(1, "rgba(4,10,12,0.58)");
    ctx.fillStyle = vig;
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS + 2, 0, TAU);
    ctx.fill();

    // Upper-left crown glass specular arc
    ctx.strokeStyle = "rgba(255,252,240,0.30)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS - 13, Math.PI * 1.12, Math.PI * 1.46);
    ctx.stroke();

    // Cut flash shimmer right at t=5.6s (Two Views Across Glass transition!)
    if (st.viewOverride === "auto" && st.tl > 5.52 && st.tl < 5.88) {
      var flash = Math.sin(((st.tl - 5.52) / 0.36) * Math.PI);
      ctx.fillStyle = "rgba(220,252,246," + (flash * 0.35).toFixed(3) + ")";
      ctx.fillRect(CX - R_GLASS, CY - R_GLASS, R_GLASS * 2, R_GLASS * 2);
    }
    ctx.restore();

    // 5. RIVETED 6-BOLT ANTIQUE BRASS PORTHOLE BEZEL + HINGE + LATCH + 2-O'CLOCK RIM CHIP!
    drawPortholeBrassFrame(ctx, st);

    // 6. BOTTOM COCKPIT CONTROLS ROW:
    //    Left: Ballast / Single Slot | Center: Chalk Chart Under Glass | Right: Lamp Toggle
    drawBallastSlotControl(ctx, st);
    drawChalkChartControl(ctx, meta, st);
    drawLampToggleControl(ctx, st);

    // 7. ARTICULATED TURKEY PILOT SILHOUETTE & FEATHERED WING OPERATING CONTROL!
    drawCockpitTurkeyPilot(ctx, meta, st);

    // 8. LOWER REGION (y = 536..720):
    //    Cream editorial story strip when showCaptions !== false;
    //    Clean unlabelled wooden workbench sill when showCaptions === false (100% zero-text blind test!).
    if (st.showCaptions) {
      drawEditorialStrip(ctx, meta, st);
    } else {
      drawBlindBenchApron(ctx);
    }

    // Subtle handmade paper/film grain overlay
    var gp = getGrainPattern(ctx);
    if (gp) {
      ctx.save();
      ctx.fillStyle = gp;
      ctx.fillRect(0, 0, 1280, 720);
      ctx.restore();
    }
  }

  function drawTrimDial(ctx, cx, cy, st) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = "#182d30";
    ctx.strokeStyle = "#6e8e88";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Horizon water level inside sight-glass rises slightly when ballast engaged!
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 31, 0, TAU);
    ctx.clip();
    var wy = lerp(8, -6, st.ballastAmt);
    ctx.fillStyle = "#246e73";
    ctx.fillRect(-34, wy, 68, 42);
    ctx.strokeStyle = "#a3dac8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-32, wy);
    ctx.quadraticCurveTo(0, wy + Math.sin(st.t * 3) * 2.5, 32, wy);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = "#a88344";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, TAU);
    ctx.stroke();

    if (st.showCaptions) {
      ctx.fillStyle = "#9ab5b0";
      ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("TRIM SIGHT", 0, 53);
    }
    ctx.restore();
  }

  function drawAirDial(ctx, cx, cy, st) {
    ctx.save();
    ctx.translate(cx, cy);
    // Brass bezel
    var bg = ctx.createRadialGradient(-8, -10, 6, 0, 0, 42);
    bg.addColorStop(0, "#e5be6b");
    bg.addColorStop(1, "#7b5a24");
    ctx.fillStyle = bg;
    ctx.strokeStyle = "#121a1b";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Cream dial face
    ctx.fillStyle = "#f5edd8";
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Colored gauge arc (Teal -> Amber -> Rust)
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#2b8a8e";
    ctx.beginPath();
    ctx.arc(0, 0, 24, Math.PI * 0.8, Math.PI * 1.45);
    ctx.stroke();
    ctx.strokeStyle = "#d9923b";
    ctx.beginPath();
    ctx.arc(0, 0, 24, Math.PI * 1.45, Math.PI * 1.85);
    ctx.stroke();
    ctx.strokeStyle = "#b53f2a";
    ctx.beginPath();
    ctx.arc(0, 0, 24, Math.PI * 1.85, Math.PI * 2.2);
    ctx.stroke();

    // Ticks
    ctx.strokeStyle = "#2a241c";
    ctx.lineWidth = 1.4;
    for (var tk = 0; tk <= 6; tk++) {
      var ta = Math.PI * 0.8 + (tk / 6) * Math.PI * 1.4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ta) * 19, Math.sin(ta) * 19);
      ctx.lineTo(Math.cos(ta) * 27, Math.sin(ta) * 27);
      ctx.stroke();
    }

    // Gently trembling needle slowly ticking across 10s
    var needleAng = Math.PI * 1.18 + (st.tl / 10) * 0.24 + Math.sin(st.t * 9.5) * 0.02;
    ctx.save();
    ctx.rotate(needleAng);
    ctx.strokeStyle = "#9e2e1c";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(23, 0);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#2a241c";
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, TAU);
    ctx.fill();

    if (st.showCaptions) {
      ctx.fillStyle = "#edb473";
      ctx.font = "700 10.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("1 DAY OF AIR", 0, 55);
    }
    ctx.restore();
  }

  function drawPortholeBrassFrame(ctx, st) {
    ctx.save();

    // Left heavy iron 3-knuckle barrel hinge (matching p51..p55.jpg!)
    ctx.fillStyle = "#3c4342";
    ctx.strokeStyle = "#101414";
    ctx.lineWidth = 2.4;
    roundedRectPath(ctx, CX - R_BEZEL - 18, CY - 44, 30, 88, 5);
    ctx.fill();
    ctx.stroke();
    roundedRectPath(ctx, CX - R_BEZEL - 24, CY - 48, 12, 96, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1e2424";
    ctx.beginPath();
    ctx.arc(CX - R_BEZEL - 1, CY - 28, 3.8, 0, TAU);
    ctx.arc(CX - R_BEZEL - 1, CY + 28, 3.8, 0, TAU);
    ctx.fill();

    // Main antique brass bezel ring (even-odd donut R_GLASS..R_BEZEL)
    var brassGrad = ctx.createLinearGradient(CX - R_BEZEL, CY - R_BEZEL, CX + R_BEZEL, CY + R_BEZEL);
    brassGrad.addColorStop(0, "#d7b062");
    brassGrad.addColorStop(0.28, "#b0883e");
    brassGrad.addColorStop(0.55, "#7e5e26");
    brassGrad.addColorStop(0.82, "#c89f50");
    brassGrad.addColorStop(1, "#5c4319");

    ctx.fillStyle = brassGrad;
    ctx.beginPath();
    ctx.arc(CX, CY, R_BEZEL, 0, TAU);
    ctx.arc(CX, CY, R_GLASS, 0, TAU, true);
    ctx.fill();

    // Outer & inner bevel strokes
    ctx.strokeStyle = "#141008";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(CX, CY, R_BEZEL, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "#e8c87b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS + 5, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "#141008";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS, 0, TAU);
    ctx.stroke();

    // THE 2-O'CLOCK RIM CHIP (Setup A critical invariant! Placed cleanly at ~1:45 / -38 deg on inner bezel!)
    var chipAng = -0.66; // ~1:45–2:00 o'clock (just above the 2-o'clock bolt, matching setupA.webp!)
    var chx = CX + Math.cos(chipAng) * (R_GLASS + 3);
    var chy = CY + Math.sin(chipAng) * (R_GLASS + 3);
    ctx.save();
    ctx.translate(chx, chy);
    ctx.rotate(chipAng);
    // Dark gouge notch + bright raw-brass fracture facet
    ctx.fillStyle = "#172022";
    ctx.strokeStyle = "#f6cf7d";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-4, -13);
    ctx.lineTo(13, -6);
    ctx.lineTo(8, 2);
    ctx.lineTo(15, 9);
    ctx.lineTo(-4, 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Right offset brass dog-latch handle (3 o'clock, matching p51..p55.jpg!)
    ctx.save();
    ctx.translate(CX + R_BEZEL - 14, CY);
    ctx.fillStyle = "#ba9246";
    ctx.strokeStyle = "#141008";
    ctx.lineWidth = 2.3;
    roundedRectPath(ctx, -8, -32, 20, 64, 8);
    ctx.fill();
    ctx.stroke();
    // Latch dog lever
    ctx.fillStyle = "#d9b362";
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(2, -11);
    ctx.lineTo(28, -8);
    ctx.lineTo(28, 8);
    ctx.lineTo(2, 11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 6 HEXAGONAL BRASS BOLTS (#1..#6 clockwise: 12, 2, 4, 6, 8, 10 o'clock)
    // When st.roll > 0 (Act 3 or [R] key), bolt #roll glints with register color & pip dots!
    var boltAngles = [-Math.PI / 2, -Math.PI / 6, Math.PI / 6, Math.PI / 2, (5 * Math.PI) / 6, (7 * Math.PI) / 6];
    var rBolt = (R_GLASS + R_BEZEL) * 0.5;

    for (var bi = 0; bi < 6; bi++) {
      var faceNum = bi + 1;
      var ba = boltAngles[bi];
      var bx = CX + Math.cos(ba) * rBolt;
      var by = CY + Math.sin(ba) * rBolt;

      var isRolled = st.roll === faceNum && st.rollSpin >= 0.95;
      var isSpinHit = st.roll > 0 && st.rollSpin < 0.95 && (Math.floor(st.rollSpin * 12) % 6) === bi;

      if (isRolled || isSpinHit) {
        var regCol = faceNum <= 2 ? "#4fd6e8" : faceNum <= 4 ? "#9ee37d" : "#ff945e";
        var glowR = isRolled ? 28 + Math.sin(st.t * 6) * 4 : 22;
        var gg = ctx.createRadialGradient(bx, by, 4, bx, by, glowR);
        gg.addColorStop(0, "#fff8d6");
        gg.addColorStop(0.45, regCol);
        gg.addColorStop(1, "rgba(255,248,214,0)");
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(bx, by, glowR, 0, TAU);
        ctx.fill();
      }

      // Hex bolt head
      ctx.fillStyle = isRolled ? "#fff0a8" : "#c79e4f";
      ctx.strokeStyle = "#171208";
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      for (var h = 0; h < 6; h++) {
        var ha = (h * TAU) / 6 + 0.52;
        var hx = bx + Math.cos(ha) * 11.5;
        var hy = by + Math.sin(ha) * 11.5;
        if (h === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glint star + tiny die pips on the rolled bolt!
      if (isRolled) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        var gr = 16 + Math.sin(st.t * 8) * 3;
        ctx.beginPath();
        ctx.moveTo(bx - gr, by);
        ctx.lineTo(bx + gr, by);
        ctx.moveTo(bx, by - gr);
        ctx.lineTo(bx, by + gr);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function drawBallastSlotControl(ctx, st) {
    // Bottom-Left Setup A control: x = 236..436, y = 452..514
    var x = 236, y = 452, w = 200, h = 62;
    ctx.save();
    ctx.fillStyle = "#162a2d";
    ctx.strokeStyle = st.ballast ? "#a3dac8" : "#5e7f7b";
    ctx.lineWidth = 2.4;
    roundedRectPath(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();

    // Recessed Single Slot socket
    ctx.fillStyle = "#0a1517";
    ctx.strokeStyle = "#3f5d5a";
    ctx.lineWidth = 2;
    roundedRectPath(ctx, x + 22, y + 18, 118, 28, 4);
    ctx.fill();
    ctx.stroke();

    // Articulated Rectangular Ballast Tray (slides from spare right cradle into socket as ballastAmt 0->1!)
    var trayX = lerp(x + 68, x + 25, st.ballastAmt);
    var trayY = lerp(y - 8, y + 20, st.ballastAmt);
    ctx.fillStyle = st.ballastAmt > 0.5 ? "#7a9e96" : "#536b68";
    ctx.strokeStyle = "#101b1c";
    ctx.lineWidth = 2.2;
    roundedRectPath(ctx, trayX, trayY, 112, 24, 4);
    ctx.fill();
    ctx.stroke();
    // Brass grab handle on tray
    ctx.strokeStyle = "#e3b868";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(trayX + 36, trayY + 12);
    ctx.lineTo(trayX + 76, trayY + 12);
    ctx.stroke();

    // Engaged lock indicator pin
    ctx.fillStyle = st.ballastAmt > 0.6 ? "#7ce0b8" : "#2c4240";
    ctx.beginPath();
    ctx.arc(x + 170, y + 32, 7, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#0d1718";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    if (st.showCaptions) {
      ctx.fillStyle = st.ballast ? "#a3dac8" : "#8ea8a4";
      ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("BALLAST · SINGLE SLOT", x + 12, y - 6);
    }
    ctx.restore();
  }

  function drawChalkChartControl(ctx, meta, st) {
    // Bottom-Center Setup A control: x = 486..794, y = 458..516
    var x = 486, y = 458, w = 308, h = 58;
    ctx.save();
    // Slate under brass frame
    ctx.fillStyle = "#142224";
    ctx.strokeStyle = "#8a9f9a";
    ctx.lineWidth = 2.4;
    roundedRectPath(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();

    // Faint river bend banks & two-trunks anchor
    ctx.strokeStyle = "rgba(163,218,200,0.25)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 18);
    ctx.quadraticCurveTo(x + 115, y + 8, x + 180, y + 24);
    ctx.quadraticCurveTo(x + 245, y + 38, x + 290, y + 16);
    ctx.stroke();

    // Progressively drawn chalk route polyline (matching setupA.webp!)
    var pts = [
      [x + 26, y + 44],
      [x + 98, y + 22],
      [x + 166, y + 39],
      [x + 236, y + 24],
      [x + 278, y + 29]
    ];
    ctx.strokeStyle = "#f4efe0";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    var totalSegs = pts.length - 1;
    var segFloat = st.chartProg * totalSegs;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 0; i < totalSegs; i++) {
      var u = clamp(segFloat - i, 0, 1);
      if (u <= 0) break;
      ctx.lineTo(lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u));
    }
    ctx.stroke();

    // Gold landmark dot + verified chalk circle at t >= 5.6s (phase === "trout")!
    if (st.phase === "trout") {
      var dotPop = st.viewOverride === "trout" ? 1 : easeOutBack(smoothstep(5.65, 6.45, st.actClock));
      var gx = pts[3][0] + ((meta.id - 51) * 7);
      var gy = pts[3][1];
      ctx.fillStyle = "rgba(255,212,92,0.28)";
      ctx.beginPath();
      ctx.arc(gx, gy, 13 * dotPop, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#ffd45c";
      ctx.strokeStyle = "#1b1406";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(gx, gy, 5.8 * dotPop, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // Chalk verification ring
      ctx.strokeStyle = "#a3dac8";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(gx, gy, 10.5 * dotPop, 0, TAU * clamp(dotPop, 0, 1));
      ctx.stroke();
    }

    // Glazing diagonal specular reflection
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + 48, y + 6);
    ctx.lineTo(x + 22, y + h - 6);
    ctx.moveTo(x + 225, y + 6);
    ctx.lineTo(x + 199, y + h - 6);
    ctx.stroke();

    if (st.showCaptions) {
      ctx.fillStyle = "#9ab5b0";
      ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("CHALK CHART UNDER GLASS", x + w * 0.5, y - 6);
    }
    ctx.restore();
  }

  function drawLampToggleControl(ctx, st) {
    // Bottom-Right Setup A control: x = 860..988, y = 448..516
    var x = 860, y = 448, w = 128, h = 68;
    ctx.save();
    ctx.fillStyle = "#24221d";
    ctx.strokeStyle = st.lamp ? "#f5be6b" : "#9c7648";
    ctx.lineWidth = 2.6;
    roundedRectPath(ctx, x, y, w, h, 12);
    ctx.fill();
    ctx.stroke();

    // Amber indicator jewel
    if (st.lampAmt > 0.1) {
      var jg = ctx.createRadialGradient(x + 96, y + 34, 2, x + 96, y + 34, 20);
      jg.addColorStop(0, "rgba(255,224,130," + (0.95 * st.lampAmt).toFixed(3) + ")");
      jg.addColorStop(1, "rgba(255,180,70,0)");
      ctx.fillStyle = jg;
      ctx.beginPath();
      ctx.arc(x + 96, y + 34, 20, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = st.lampAmt > 0.4 ? "#ffd369" : "#423322";
    ctx.strokeStyle = "#120e09";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(x + 96, y + 34, 6.5, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Toggle pivot collar + bat-handle lever (tilts down-left OFF -> up-right ON!)
    var px = x + 48, py = y + 40;
    ctx.fillStyle = "#d99d52";
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, TAU);
    ctx.fill();
    ctx.stroke();

    var leverAng = lerp(-0.68, 0.52, st.lampAmt);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(leverAng);
    ctx.fillStyle = "#f4efe4";
    ctx.strokeStyle = "#181410";
    ctx.lineWidth = 2.2;
    roundedRectPath(ctx, -4.5, -30, 9, 28, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    if (st.showCaptions) {
      ctx.fillStyle = st.lamp ? "#edb473" : "#9ab5b0";
      ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("LAMP TOGGLE", x + w * 0.5, y - 6);
    }
    ctx.restore();
  }

  function drawCockpitTurkeyPilot(ctx, meta, st) {
    // Articulated Turkey pilot silhouette in lower-left foreground + feathered wing operating control!
    ctx.save();

    // 1. Foreground Turkey Pilot Head/Shoulder on left (leaning in during Act 2; recoiling slightly in Act 3)
    var leanX = st.phase === "turkey" ? 18 + Math.sin(st.t * 1.9) * 5 : st.phase === "trout" ? -8 : 4;
    var leanY = st.phase === "turkey" ? -10 : 0;
    var headTilt = st.phase === "turkey" ? Math.sin(st.t * 2.5) * 0.09 : st.phase === "trout" ? -0.08 : 0.04;

    ctx.save();
    ctx.translate(138 + leanX, 468 + leanY);
    ctx.rotate(headTilt);

    // Feathered shoulder cape
    ctx.fillStyle = "#2a1b14";
    ctx.strokeStyle = "#0b0705";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(-18, 48, 58, 44, -0.2, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Neck + Head silhouette with warm rim light from porthole/task-light
    ctx.fillStyle = "#3c251c";
    ctx.beginPath();
    ctx.moveTo(-24, 24);
    ctx.quadraticCurveTo(-18, -28, 4, -44);
    ctx.arc(10, -34, 24, Math.PI * 1.1, Math.PI * 0.35);
    ctx.quadraticCurveTo(22, 6, 8, 32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Beak & crimson wattle
    ctx.fillStyle = "#c99642";
    ctx.beginPath();
    ctx.moveTo(31, -38);
    ctx.quadraticCurveTo(49, -35, 50, -26);
    ctx.quadraticCurveTo(38, -25, 30, -28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#a83328";
    ctx.beginPath();
    ctx.moveTo(33, -27);
    ctx.quadraticCurveTo(40 + Math.sin(st.t * 4) * 2, -11, 32, -7);
    ctx.quadraticCurveTo(26, -12, 28, -26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Amber rim-lit eye watching the porthole!
    ctx.fillStyle = "#f7df9c";
    ctx.beginPath();
    ctx.arc(18, -36, 4.8, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#120b08";
    ctx.beginPath();
    ctx.arc(19.6, -36, 2.3, 0, TAU);
    ctx.fill();
    ctx.restore();

    // 2. ARTICULATED FEATHERED WING:
    //    - Act 1 (t=0.8s): extends cleanly onto the target control (Lamp Toggle on right OR Ballast Slot on left)!
    //    - Act 2: rests attentively on lower cockpit sill
    //    - Act 3: reaches lightly to chalk-mark the Chart Under Glass!
    var restX = meta.defaultTool === "lamp" ? 812 : 210;
    var restY = 524;
    var targetX = meta.defaultTool === "lamp" ? 908 : 318;
    var targetY = meta.defaultTool === "lamp" ? 476 : 478;

    var wx, wy;
    if (st.reachAmt > 0.01) {
      wx = lerp(restX, targetX, st.reachAmt);
      wy = lerp(restY + 18, targetY, st.reachAmt);
    } else if (st.phase === "trout" && st.tl > 6.1 && st.tl < 8.4) {
      var markU = Math.sin(clamp((st.tl - 6.1) / 2.3, 0, 1) * Math.PI);
      wx = lerp(restX, 668, markU);
      wy = lerp(restY + 16, 488, markU);
    } else {
      wx = restX + Math.sin(st.t * 1.6) * 4;
      wy = restY + 14;
    }

    var fromRight = wx > 640;
    var shoulderX = fromRight ? 1085 : 175;
    var shoulderY = 548;

    ctx.save();
    ctx.fillStyle = "#4a2e20";
    ctx.strokeStyle = "#120a06";
    ctx.lineWidth = 2.4;

    // Forearm wing curve from shoulder to primary feather tips at (wx, wy)
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.quadraticCurveTo((shoulderX + wx) * 0.5, Math.min(shoulderY, wy) + 26, wx, wy);
    // 3 primary flight-feather "fingers"
    var fDir = fromRight ? -1 : 1;
    ctx.lineTo(wx + fDir * 18, wy - 6);
    ctx.lineTo(wx + fDir * 6, wy + 3);
    ctx.lineTo(wx + fDir * 21, wy + 5);
    ctx.lineTo(wx + fDir * 5, wy + 11);
    ctx.lineTo(wx + fDir * 16, wy + 16);
    ctx.quadraticCurveTo((shoulderX + wx) * 0.5, shoulderY + 18, shoulderX + (fromRight ? -38 : 38), shoulderY + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Warm amber rim highlight along upper wing edge
    ctx.strokeStyle = "rgba(237,180,115,0.48)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY - 1);
    ctx.quadraticCurveTo((shoulderX + wx) * 0.5, Math.min(shoulderY, wy) + 24, wx + fDir * 16, wy - 5);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  function drawBlindBenchApron(ctx) {
    // Pure zero-text wooden workshop bench / lower bread-tin apron when showCaptions === false
    var g = ctx.createLinearGradient(0, SPLIT_Y, 0, 720);
    g.addColorStop(0, "#172729");
    g.addColorStop(0.18, "#261d15");
    g.addColorStop(1, "#16110c");
    ctx.fillStyle = g;
    ctx.fillRect(0, SPLIT_Y, 1280, 720 - SPLIT_Y);

    ctx.strokeStyle = "#3e5858";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, SPLIT_Y + 1);
    ctx.lineTo(1280, SPLIT_Y + 1);
    ctx.stroke();

    // Subtle woodgrain planks & 4 brass bench rivets (zero text!)
    ctx.strokeStyle = "rgba(255,235,205,0.06)";
    ctx.lineWidth = 1.5;
    for (var py = SPLIT_Y + 38; py < 720; py += 42) {
      ctx.beginPath();
      ctx.moveTo(40, py);
      ctx.lineTo(1240, py);
      ctx.stroke();
    }
  }

  function drawEditorialStrip(ctx, meta, st) {
    // Lower cream paper strip (#faf8f3, y = 536..720) — VOIDBASTARD-TAO calm editorial aesthetic
    ctx.save();
    ctx.fillStyle = "#faf8f3";
    ctx.fillRect(0, SPLIT_Y, 1280, 720 - SPLIT_Y);

    ctx.strokeStyle = "#d5cec0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, SPLIT_Y + 1);
    ctx.lineTo(1280, SPLIT_Y + 1);
    ctx.stroke();

    var passLabel, passColor, headline, subline;
    if (st.phase === "act1") {
      passLabel = "ACT 1 · SETUP A COCKPIT OPERATION";
      passColor = "#7a5320";
      headline = meta.clue;
      subline =
        meta.defaultTool === "lamp"
          ? "Turkey reaches right to flip the Lamp Toggle — cutting dusk silt outside the 2-o’clock chipped port."
          : "Turkey slides the Ballast Tray into the Single Slot — settling into calm shelter behind the stone lip.";
    } else if (st.phase === "turkey") {
      passLabel = "FIRST PASS · TURKEY LOOKS OUT (FACES 1 · 3 · 5)";
      passColor = "#9e3d1c";
      headline = "“" + meta.turkeyFork + "”";
      subline = meta.clue + "  ·  Rule: " + meta.scionRule;
    } else {
      passLabel = "SECOND PASS · TROUT LOOKS IN (FACES 2 · 4 · 6)";
      passColor = "#1d596e";
      headline = "“" + meta.troutFork + "”";
      var regName = st.roll <= 2 ? "Probable" : st.roll <= 4 ? "Plausible" : "Preposterous";
      subline =
        "Brook Trout inspects across the glass  ·  Rolled Bolt #" +
        (st.roll || meta.defaultRoll) +
        " (" +
        regName +
        ")  ·  Chalk Chart marked.";
    }

    // Left accent rule bar
    ctx.fillStyle = passColor;
    roundedRectPath(ctx, 58, SPLIT_Y + 24, 5, 136, 2.5);
    ctx.fill();

    // Mono kicker row
    ctx.font = "700 13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillStyle = passColor;
    ctx.textAlign = "left";
    ctx.fillText(meta.station.toUpperCase() + "   ·   " + passLabel, 80, SPLIT_Y + 44);

    // Right-side SCION rule + active hardware pill
    ctx.textAlign = "right";
    ctx.fillStyle = "#5c574d";
    ctx.font = "600 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    var toolTxt =
      "LAMP: " + (st.lamp ? "ON" : "OFF") +
      "  ·  BALLAST: " + (st.ballast ? "IN" : "OUT") +
      (st.roll ? "  ·  1D6: #" + st.roll : "");
    ctx.fillText(toolTxt, 1220, SPLIT_Y + 44);

    // Main Georgia serif Duck/Rabbit fork headline
    ctx.textAlign = "left";
    ctx.fillStyle = "#191815";
    ctx.font = "400 35px Georgia, 'Times New Roman', serif";
    ctx.fillText(headline, 80, SPLIT_Y + 96);

    // Subline
    ctx.fillStyle = "#4d483f";
    ctx.font = "400 17px Georgia, 'Times New Roman', serif";
    ctx.fillText(subline, 80, SPLIT_Y + 134);

    // Bottom micro-progress bar across 10s
    ctx.fillStyle = "#e6e0d3";
    ctx.fillRect(80, SPLIT_Y + 154, 1140, 4);
    ctx.fillStyle = passColor;
    ctx.fillRect(80, SPLIT_Y + 154, 1140 * (st.tl / 10.0), 4);

    ctx.restore();
  }

  // ==========================================================================
  // REGISTER SCENES #51–#55 ON window.PORTAL_SCENES
  // ==========================================================================
  var DEFINITIONS = [
    {
      id: 51,
      station: "#51 · Grotto",
      clue: "Basketball pearl wedged in giant stone clam",
      turkeyFork: "Peeled boiled egg or valve stopper?",
      troutFork: "Bowling-ball thief or giant brass marble?",
      scionRule: "Repeated Observation (SCION 41)",
      defaultTool: "lamp",
      defaultRoll: 2,
      worldFn: renderWorld51
    },
    {
      id: 52,
      station: "#52 · Bridge",
      clue: "Taut red rope into murky boulder pile",
      turkeyFork: "Kraken tentacle or snagged anchor?",
      troutFork: "Tow-truck helper or doorway blocker?",
      scionRule: "Two Views Across Glass (SCION 17)",
      defaultTool: "ballast",
      defaultRoll: 4,
      worldFn: renderWorld52
    },
    {
      id: 53,
      station: "#53 · Flume",
      clue: "Iron gristmill wheel clicking cellar latch",
      turkeyFork: "Pie-crust crimper or secret elevator?",
      troutFork: "Wind-up key nose or jammed log?",
      scionRule: "Reversible Gear Jam (SCION 43)",
      defaultTool: "ballast",
      defaultRoll: 6,
      worldFn: renderWorld53
    },
    {
      id: 54,
      station: "#54 · Ledge",
      clue: "Wrinkled Hellbender swaying frilly folds",
      turkeyFork: "Ruffled gravy boat or river dragon?",
      troutFork: "Long-lost wattled cousin or tin hermit crab?",
      scionRule: "Anatomical Double Take (Oubapo)",
      defaultTool: "lamp",
      defaultRoll: 4,
      worldFn: renderWorld54
    },
    {
      id: 55,
      station: "#55 · Eddy",
      clue: "Corked brass tube stuffed with 54 postcards",
      turkeyFork: "My own handwriting or eviction notice?",
      troutFork: "Dead-letter dropbox or alien bottle?",
      scionRule: "Recursive Worldtext (PAELEO ↻)",
      defaultTool: "lamp",
      defaultRoll: 2,
      worldFn: renderWorld55
    }
  ];

  for (var di = 0; di < DEFINITIONS.length; di++) {
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
          var w = W || 1280;
          var h = H || 720;
          var st = resolveSceneState(def, t, state);
          ctx.save();
          if (w !== 1280 || h !== 720) {
            ctx.scale(w / 1280, h / 720);
          }
          drawSetupACockpit(ctx, def, st, def.worldFn);
          ctx.restore();
        }
      };
    })(DEFINITIONS[di]);
  }
})();
