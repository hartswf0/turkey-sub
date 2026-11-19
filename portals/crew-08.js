/* Crew 08 — Handmade PAELEO / Oulipo + Video-to-Game Canvas Scenes (#36–#40)
 * Portholes:
 *   #36 · Bench    — Hound figure clutching wax-sealed envelope (Iconic Iteration · Oubapo)
 *   #37 · Bulkhead — Folded silt map where claw meets fin (Folded Seam · Oubapo / V04)
 *   #38 · Visor    — 1978 posterboard UFO chart with fin notes (Annotated Schematic · SCION 25)
 *   #39 · Parlor   — Wallpapered sunken living room with lamp (Drowned Domesticity · SCION 20)
 *   #40 · Reef     — Reel-to-reel tape reef & sugar-cube towers (Reverse Tape Score · Outrapo)
 */
(function () {
  "use strict";

  window.PORTAL_SCENES = window.PORTAL_SCENES || {};

  // ── Deterministic Math & Easing Helpers ──────────────────────────────────
  var TAU = Math.PI * 2;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function invLerp(a, b, v) { return a === b ? 0 : clamp((v - a) / (b - a), 0, 1); }
  function smooth(a, b, v) {
    var u = invLerp(a, b, v);
    return u * u * (3 - 2 * u);
  }
  function band(a0, a1, b0, b1, t) {
    return smooth(a0, a1, t) * (1 - smooth(b0, b1, t));
  }
  function hash(n) {
    var x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return x - Math.floor(x);
  }

  // Cached subtle procedural paper/parchment grain pattern (no external image tainting!)
  var _grainPattern = null;
  function getGrainPattern(ctx) {
    if (_grainPattern) return _grainPattern;
    try {
      var c = document.createElement("canvas");
      c.width = 96;
      c.height = 96;
      var g = c.getContext("2d");
      for (var y = 0; y < 96; y += 2) {
        for (var x = 0; x < 96; x += 2) {
          var v = hash(x * 19 + y * 73);
          if (v > 0.55) {
            g.fillStyle = v > 0.8 ? "rgba(35,28,18,0.045)" : "rgba(255,248,230,0.04)";
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

  // ── Shared State Resolution (Film Timeline + Live Video-to-Game Play) ────
  var CX = 640, CY = 255, R_GLASS = 185;

  function resolveState(meta, rawT, state) {
    var hasInteractive = !!(state && (
      typeof state.lamp === "boolean" ||
      typeof state.ballast === "boolean" ||
      (state.view && state.view !== "auto") ||
      (typeof state.roll === "number" && state.roll > 0)
    ));
    var t = typeof rawT === "number" && isFinite(rawT) ? Math.max(0, rawT) : 0;
    // Film render sits in [0, 10.0]; live interactive loop wraps smoothly past 10s
    var tl = (t > 10.001) ? (t % 10.0) : t;

    var viewMode = (state && state.view && state.view !== "auto") ? state.view : "auto";
    var pass = "act1";
    if (viewMode === "turkey") pass = "turkey";
    else if (viewMode === "trout") pass = "trout";
    else if (tl >= 5.6) pass = "trout";
    else if (tl >= 2.0) pass = "turkey";

    var defaultLamp = meta.defaultTool === "lamp";
    var defaultBallast = meta.defaultTool === "ballast";

    var lampAmt;
    if (state && typeof state.lamp === "boolean") {
      lampAmt = state.lamp ? 1 : 0;
    } else if (defaultLamp) {
      lampAmt = smooth(0.88, 1.12, tl);
    } else {
      lampAmt = 0;
    }

    var ballastAmt;
    if (state && typeof state.ballast === "boolean") {
      ballastAmt = state.ballast ? 1 : 0;
    } else if (defaultBallast) {
      ballastAmt = smooth(0.88, 1.45, tl);
    } else {
      ballastAmt = 0;
    }

    var showCaptions = !(state && state.showCaptions === false);
    var defaultRoll = ((meta.id - 1) % 6) + 1; // #36->6? Wait: 35%6+1=6, 36->1, 37->2, 38->3, 39->4
    var activeRoll = 0;
    if (state && typeof state.roll === "number" && state.roll >= 1 && state.roll <= 6) {
      activeRoll = Math.round(state.roll);
    } else if (pass === "trout" && tl >= 6.0) {
      activeRoll = defaultRoll;
    }

    var chartProgress;
    if (viewMode === "trout") chartProgress = 1;
    else if (viewMode === "turkey") chartProgress = 0.55;
    else chartProgress = clamp(smooth(0.6, 8.4, tl), 0.12, 1);

    var chartDotAmt = (pass === "trout") ? (viewMode === "trout" ? 1 : smooth(6.2, 7.2, tl)) : 0;

    return {
      meta: meta,
      t: t,
      tl: tl,
      hasInteractive: hasInteractive,
      viewMode: viewMode,
      pass: pass,
      lampAmt: lampAmt,
      ballastAmt: ballastAmt,
      showCaptions: showCaptions,
      activeRoll: activeRoll,
      chartProgress: chartProgress,
      chartDotAmt: chartDotAmt
    };
  }

  // ── Setup A Bread-Tin Cockpit Shell (y = 0..536) ─────────────────────────
  function drawCockpitShell(ctx, st) {
    // Outer dark hull margin
    ctx.fillStyle = "#0e1b1e";
    ctx.fillRect(0, 0, 1280, 536);

    // Oval bread-roll tin interior (#132427)
    ctx.save();
    roundedRectPath(ctx, 46, 18, 1188, 500, 68);
    var tinGrad = ctx.createRadialGradient(640, 120, 40, 640, 290, 720);
    var warmBoost = 0.12 + 0.16 * st.lampAmt;
    tinGrad.addColorStop(0, "rgba(43, 68, 66, " + (0.65 + warmBoost * 0.4) + ")");
    tinGrad.addColorStop(0.35, "#15282b");
    tinGrad.addColorStop(1, "#101e21");
    ctx.fillStyle = tinGrad;
    ctx.fill();

    // Subtle stamped bread-tin vertical ribs
    ctx.clip();
    ctx.strokeStyle = "rgba(163, 218, 200, 0.035)";
    ctx.lineWidth = 2;
    for (var rx = 120; rx <= 1160; rx += 104) {
      if (Math.abs(rx - 640) < 220) continue;
      ctx.beginPath();
      ctx.moveTo(rx, 28);
      ctx.lineTo(rx, 508);
      ctx.stroke();
    }

    // Overhead amber task-light wash inside tin
    var ambWash = ctx.createRadialGradient(640, 28, 12, 640, 45, 410);
    ambWash.addColorStop(0, "rgba(237, 180, 115, 0.24)");
    ambWash.addColorStop(0.5, "rgba(237, 180, 115, 0.06)");
    ambWash.addColorStop(1, "rgba(237, 180, 115, 0)");
    ctx.fillStyle = ambWash;
    ctx.fillRect(46, 18, 1188, 320);
    ctx.restore();

    // Double-rolled bread-tin rim with right-side dent invariant!
    ctx.save();
    ctx.strokeStyle = "#567977";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(114, 18);
    ctx.lineTo(1166, 18);
    ctx.quadraticCurveTo(1234, 18, 1234, 86);
    ctx.lineTo(1234, 212);
    // Right-side inward dent (Setup A invariant)
    ctx.bezierCurveTo(1212, 232, 1210, 298, 1234, 320);
    ctx.lineTo(1234, 450);
    ctx.quadraticCurveTo(1234, 518, 1166, 518);
    ctx.lineTo(114, 518);
    ctx.quadraticCurveTo(46, 518, 46, 450);
    ctx.lineTo(46, 86);
    ctx.quadraticCurveTo(46, 18, 114, 18);
    ctx.stroke();

    // Right-side dent inner crease highlight
    ctx.strokeStyle = "rgba(182, 208, 202, 0.42)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(1224, 222);
    ctx.quadraticCurveTo(1204, 266, 1224, 312);
    ctx.stroke();
    ctx.strokeStyle = "rgba(6, 12, 14, 0.65)";
    ctx.beginPath();
    ctx.moveTo(1217, 228);
    ctx.quadraticCurveTo(1199, 266, 1217, 306);
    ctx.stroke();

    // Overhead amber task-light bar & angled tin ceiling brow (Setup A diagram)
    ctx.strokeStyle = "#8d6d48";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(132, 64);
    ctx.lineTo(220, 34);
    ctx.lineTo(1060, 34);
    ctx.lineTo(1148, 64);
    ctx.stroke();

    roundedRectPath(ctx, 594, 26, 92, 14, 7);
    ctx.fillStyle = "#edb473";
    ctx.fill();
    ctx.strokeStyle = "#ffdca8";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  // ── Articulated Spotted Brook Trout Rig (8-segment undulating spine) ─────
  function drawBrookTrout(ctx, opts) {
    var x = opts.x || 700;
    var y = opts.y || 250;
    var scale = opts.scale || 1.0;
    var flipX = opts.flipX ? -1 : 1; // default (+1) faces LEFT toward porthole center!
    var pitch = opts.pitch || 0;
    var t = opts.t || 0;
    var speed = opts.speed === undefined ? 1.0 : opts.speed;
    var mouthOpen = opts.mouthOpen || 0;
    var finReach = opts.finReach || 0;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(pitch);
    ctx.scale(flipX * scale, scale);

    // Nose at (-66, 0), tail fork at (+78, 0)
    var phase = t * 5.2 * speed;
    function waveY(u) {
      // u = 0 at nose, 1 at tail base
      return Math.sin(phase - u * 4.1) * (1.2 + u * u * 9.5);
    }

    var halfH = [4, 13, 20, 22, 19, 14, 8.5, 6.5];
    var xs = [-64, -46, -24, 0, 24, 46, 64, 76];
    var topPts = [], botPts = [];
    for (var i = 0; i < xs.length; i++) {
      var u = i / (xs.length - 1);
      var wy = waveY(u);
      topPts.push([xs[i], wy - halfH[i]]);
      botPts.push([xs[i], wy + halfH[i] * (i === 2 ? 1.08 : 1.0)]);
    }

    var tailTipY = waveY(1.18);

    // Dorsal fin (speckled olive)
    var dWy = waveY(0.45);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-6, dWy - 21);
    ctx.quadraticCurveTo(8, dWy - 38, 22, dWy - 34);
    ctx.lineTo(26, dWy - 17);
    ctx.closePath();
    ctx.fillStyle = "#5f7a58";
    ctx.fill();
    ctx.strokeStyle = "#1c2822";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    // Fin rays
    ctx.strokeStyle = "rgba(28,40,34,0.55)";
    ctx.lineWidth = 1;
    for (var dr = 0; dr < 4; dr++) {
      ctx.beginPath();
      ctx.moveTo(-1 + dr * 6, dWy - 20);
      ctx.lineTo(4 + dr * 5, dWy - 33 + dr * 1.5);
      ctx.stroke();
    }
    ctx.restore();

    // Adipose fin near tail
    var aWy = waveY(0.76);
    ctx.beginPath();
    ctx.moveTo(46, aWy - 12);
    ctx.quadraticCurveTo(54, aWy - 20, 59, aWy - 13);
    ctx.lineTo(56, aWy - 9);
    ctx.closePath();
    ctx.fillStyle = "#6b825e";
    ctx.fill();
    ctx.strokeStyle = "#1c2822";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pelvic & anal fins (brook trout signature white + black leading edge + peach-red!)
    var pWy = waveY(0.52);
    ctx.beginPath();
    ctx.moveTo(4, pWy + 18);
    ctx.lineTo(12, pWy + 31);
    ctx.lineTo(24, pWy + 26);
    ctx.lineTo(18, pWy + 16);
    ctx.closePath();
    ctx.fillStyle = "#d97a54";
    ctx.fill();
    ctx.strokeStyle = "#f7f4e8";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(4, pWy + 18);
    ctx.lineTo(12, pWy + 31);
    ctx.stroke();
    ctx.strokeStyle = "#1c2822";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, 0, 0);
    ctx.beginPath();
    ctx.moveTo(4, pWy + 18);
    ctx.lineTo(12, pWy + 31);
    ctx.lineTo(24, pWy + 26);
    ctx.lineTo(18, pWy + 16);
    ctx.stroke();

    // Caudal tail fin (square-forked brook trout tail)
    var tBaseY = waveY(0.96);
    ctx.beginPath();
    ctx.moveTo(72, tBaseY - 7);
    ctx.quadraticCurveTo(90, tailTipY - 22, 102, tailTipY - 20);
    ctx.lineTo(94, tailTipY - 1);
    ctx.lineTo(103, tailTipY + 19);
    ctx.quadraticCurveTo(89, tailTipY + 21, 72, tBaseY + 7);
    ctx.closePath();
    ctx.fillStyle = "#687f60";
    ctx.fill();
    ctx.strokeStyle = "#1c2822";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    for (var tr = -3; tr <= 3; tr++) {
      ctx.strokeStyle = "rgba(28,40,34,0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(74, tBaseY + tr * 1.8);
      ctx.lineTo(96, tailTipY + tr * 5.2);
      ctx.stroke();
    }

    // Main articulated body contour
    ctx.beginPath();
    ctx.moveTo(-68, waveY(0) - 1);
    for (var ti = 0; ti < topPts.length; ti++) {
      ctx.lineTo(topPts[ti][0], topPts[ti][1]);
    }
    for (var bi = botPts.length - 1; bi >= 1; bi--) {
      ctx.lineTo(botPts[bi][0], botPts[bi][1]);
    }
    // Hinged lower jaw
    var jawDrop = 2.5 + mouthOpen * 7.5;
    ctx.lineTo(-50, waveY(0.08) + 9 + jawDrop * 0.5);
    ctx.lineTo(-65, waveY(0) + 3 + jawDrop);
    ctx.lineTo(-53, waveY(0.05) + 2);
    ctx.closePath();

    var bodyGrad = ctx.createLinearGradient(0, -22, 0, 22);
    bodyGrad.addColorStop(0, "#3b5642");
    bodyGrad.addColorStop(0.42, "#7f9973");
    bodyGrad.addColorStop(0.7, "#c9b57c");
    bodyGrad.addColorStop(0.88, "#df9c72");
    bodyGrad.addColorStop(1, "#ede3cd");
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Subtle lateral pink-gold sheen stripe
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = "rgba(226, 128, 108, 0.36)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (var li = 0; li < xs.length; li++) {
      var ly = waveY(li / (xs.length - 1)) + 1;
      if (li === 0) ctx.moveTo(xs[li], ly);
      else ctx.lineTo(xs[li], ly);
    }
    ctx.stroke();

    // Brook trout dark olive back vermiculations & crimson/gold spots!
    var spots = [
      [-32, -8, 2.1, "#253629"], [-22, -12, 2.3, "#253629"], [-10, -9, 2.2, "#253629"],
      [4, -12, 2.4, "#253629"], [18, -9, 2.0, "#253629"], [34, -8, 2.1, "#253629"],
      [-26, -1, 2.2, "#e8c85a"], [-14, 3, 2.4, "#d1493b"], [-2, -2, 2.3, "#e8c85a"],
      [10, 4, 2.5, "#d1493b"], [22, -1, 2.1, "#e8c85a"], [36, 2, 2.2, "#d1493b"],
      [48, -1, 1.9, "#e8c85a"], [-6, 8, 2.0, "#e8c85a"], [16, 9, 1.9, "#e8c85a"]
    ];
    for (var si = 0; si < spots.length; si++) {
      var sp = spots[si];
      var sy = sp[1] + waveY((sp[0] + 64) / 140);
      if (sp[3] === "#d1493b") {
        ctx.fillStyle = "rgba(135, 198, 210, 0.55)";
        ctx.beginPath();
        ctx.arc(sp[0], sy, sp[2] + 1.4, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = sp[3];
      ctx.beginPath();
      ctx.arc(sp[0], sy, sp[2], 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // Crisp hand-inked outline
    ctx.strokeStyle = "#18241e";
    ctx.lineWidth = 2.1;
    ctx.stroke();

    // Gill operculum (breathing subtly)
    var gillOpen = Math.sin(t * 3.6) * 1.2;
    ctx.strokeStyle = "#1e2d26";
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.arc(-39 + gillOpen * 0.4, waveY(0.14) + 1, 12.5, -1.05, 1.15);
    ctx.stroke();

    // Articulated Pectoral Fin (can gesture / reach forward when finReach > 0!)
    var pecWy = waveY(0.2);
    ctx.save();
    ctx.translate(-33, pecWy + 10);
    var pecAngle = 0.45 + Math.sin(t * 4.8) * 0.16 - finReach * 1.35;
    ctx.rotate(pecAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(10, 16, 22, 13);
    ctx.quadraticCurveTo(18, 3, 4, -2);
    ctx.closePath();
    ctx.fillStyle = "#df8258";
    ctx.fill();
    ctx.strokeStyle = "#faf6ea";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(10, 16, 22, 13);
    ctx.stroke();
    ctx.strokeStyle = "#18241e";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Expressive Eye (tracks toward sub / target)
    var eyeX = -51, eyeY = waveY(0.08) - 4;
    ctx.fillStyle = "#f4ebd0";
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 5.2, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#18241e";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#111916";
    ctx.beginPath();
    ctx.arc(eyeX - 1.3, eyeY + 0.3, 2.8, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(eyeX - 2.2, eyeY - 1.1, 1.1, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  // ── Turkey Inside-Glass Reflection (Lower-Left or Lower-Right) ───────────
  function drawTurkeyGlassReflection(ctx, st, opts) {
    opts = opts || {};
    var side = opts.side || "left"; // "left" default, "right" on #40
    var rx = side === "right" ? CX + 104 : CX - 106;
    var ry = CY + 116 + (opts.bobY || 0);
    var alpha = st.pass === "trout" ? (opts.prominentInTrout ? 0.62 : 0.30) : (0.34 + 0.24 * st.lampAmt);
    var surprised = opts.surprised || 0;
    var peck = opts.peck || 0;
    var dir = side === "right" ? -1 : 1;

    ctx.save();
    ctx.translate(rx + peck * 14 * dir, ry - surprised * 6);
    ctx.scale(dir, 1);
    ctx.globalAlpha = alpha;

    // Warm reflection dome glow
    var rGlow = ctx.createRadialGradient(4, -6, 6, 4, 4, 58);
    rGlow.addColorStop(0, "rgba(238, 192, 138, 0.42)");
    rGlow.addColorStop(1, "rgba(238, 192, 138, 0)");
    ctx.fillStyle = rGlow;
    ctx.beginPath();
    ctx.arc(4, 0, 56, 0, TAU);
    ctx.fill();

    // Feathered neck & head silhouette
    ctx.fillStyle = "#9b6447";
    ctx.strokeStyle = "#3a2218";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-28, 48);
    ctx.quadraticCurveTo(-24, 6, -14, -16);
    ctx.bezierCurveTo(-10, -34, 16, -34, 22, -14);
    ctx.quadraticCurveTo(25, 8, 14, 48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red-coral wattle & snood
    ctx.fillStyle = "#b84a39";
    ctx.beginPath();
    ctx.moveTo(20, -6);
    ctx.quadraticCurveTo(28, 8, 21, 18);
    ctx.quadraticCurveTo(15, 12, 16, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Articulated amber beak
    ctx.fillStyle = "#d9a45b";
    ctx.beginPath();
    ctx.moveTo(19, -14);
    ctx.lineTo(38 + peck * 5, -9 - surprised * 2);
    ctx.lineTo(20, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (surprised > 0.2 || peck > 0.2) {
      ctx.beginPath();
      ctx.moveTo(19, -4);
      ctx.lineTo(34, 1 + surprised * 3);
      ctx.lineTo(18, 1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Blinking expressive eye
    var blink = (Math.sin(st.tl * 2.7 + 1.1) > 0.96) ? 0.15 : 1;
    ctx.fillStyle = "#f7eed8";
    ctx.beginPath();
    ctx.ellipse(6, -14, 6.5, (5.8 + surprised * 1.6) * blink, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    if (blink > 0.3) {
      ctx.fillStyle = "#1d1612";
      ctx.beginPath();
      ctx.arc(8, -14, 3.0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(9, -15.2, 1.1, 0, TAU);
      ctx.fill();
    }

    // Curved glass highlight streak over reflection
    ctx.strokeStyle = "rgba(255,250,235,0.28)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -4, 42, -2.3, -1.1);
    ctx.stroke();

    ctx.restore();
  }

  // ── Porthole Bezel (6 Bolts, Hinge, Offset Latch, 2-o'clock Rim Chip) ────
  function drawPortholeBezel(ctx, st) {
    ctx.save();

    // Outer drop shadow on tin bulkhead
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY + 6, R_GLASS + 50, 0, TAU);
    ctx.fillStyle = "rgba(4, 10, 12, 0.52)";
    ctx.fill();
    ctx.restore();

    // Left heavy cast-iron barrel hinge (Setup A / p36-40 reference)
    ctx.save();
    roundedRectPath(ctx, 384, 198, 42, 114, 5);
    var hingeGrad = ctx.createLinearGradient(384, 198, 426, 198);
    hingeGrad.addColorStop(0, "#25292a");
    hingeGrad.addColorStop(0.35, "#555a58");
    hingeGrad.addColorStop(1, "#2f3333");
    ctx.fillStyle = hingeGrad;
    ctx.fill();
    ctx.strokeStyle = "#141819";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    // Hinge barrel knuckles
    for (var hk = 0; hk < 3; hk++) {
      roundedRectPath(ctx, 378, 202 + hk * 37, 16, 32, 6);
      ctx.fillStyle = hk === 1 ? "#4b504e" : "#383d3c";
      ctx.fill();
      ctx.stroke();
    }
    // Slotted hinge screws
    var hScrews = [[411, 216], [411, 294]];
    for (var hs = 0; hs < hScrews.length; hs++) {
      ctx.fillStyle = "#676c6a";
      ctx.beginPath();
      ctx.arc(hScrews[hs][0], hScrews[hs][1], 5.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hScrews[hs][0] - 3.5, hScrews[hs][1] - 2);
      ctx.lineTo(hScrews[hs][0] + 3.5, hScrews[hs][1] + 2);
      ctx.stroke();
    }
    ctx.restore();

    // Main antique brass ring (annulus r = 185 .. 232)
    ctx.beginPath();
    ctx.arc(CX, CY, 232, 0, TAU);
    ctx.arc(CX, CY, R_GLASS, 0, TAU, true);
    var brassGrad = ctx.createLinearGradient(CX - 200, CY - 210, CX + 200, CY + 210);
    brassGrad.addColorStop(0, "#d2af6e");
    brassGrad.addColorStop(0.28, "#b28b4a");
    brassGrad.addColorStop(0.55, "#876530");
    brassGrad.addColorStop(0.82, "#b89250");
    brassGrad.addColorStop(1, "#6c4f24");
    ctx.fillStyle = brassGrad;
    ctx.fill("evenodd");

    ctx.strokeStyle = "#231a0d";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(CX, CY, 232, 0, TAU);
    ctx.stroke();

    // Inner brass bevel ring (r = 185 .. 198)
    ctx.beginPath();
    ctx.arc(CX, CY, 198, 0, TAU);
    ctx.arc(CX, CY, R_GLASS, 0, TAU, true);
    var bevelGrad = ctx.createLinearGradient(CX, CY - 198, CX, CY + 198);
    bevelGrad.addColorStop(0, "#755526");
    bevelGrad.addColorStop(0.5, "#caa665");
    bevelGrad.addColorStop(1, "#5c421c");
    ctx.fillStyle = bevelGrad;
    ctx.fill("evenodd");

    ctx.strokeStyle = "#1d160b";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(CX, CY, 198, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS, 0, TAU);
    ctx.stroke();

    // ── INVARIANT: 2-o'clock Chipped Rim Notch! ──
    var chipAngle = -Math.PI / 6 + 0.04; // ~2 o'clock
    var chipX = CX + Math.cos(chipAngle) * (R_GLASS + 4);
    var chipY = CY + Math.sin(chipAngle) * (R_GLASS + 4);
    ctx.save();
    ctx.translate(chipX, chipY);
    ctx.rotate(chipAngle);
    ctx.beginPath();
    ctx.moveTo(-6, -11);
    ctx.lineTo(9, -5);
    ctx.lineTo(3, 0);
    ctx.lineTo(10, 7);
    ctx.lineTo(-6, 11);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.fillStyle = "#2b2113";
    ctx.fill();
    ctx.strokeStyle = "#f2cd83";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-6, -11);
    ctx.lineTo(9, -5);
    ctx.lineTo(3, 0);
    ctx.lineTo(10, 7);
    ctx.stroke();
    ctx.restore();

    // ── Right Offset Brass Dog-Latch (Setup A invariant) ──
    ctx.save();
    var lx = CX + 212, ly = CY + 14;
    roundedRectPath(ctx, lx - 10, ly - 32, 24, 64, 9);
    ctx.fillStyle = "#b89352";
    ctx.fill();
    ctx.strokeStyle = "#231a0d";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Horizontal latch tongue & dog handle
    ctx.beginPath();
    ctx.moveTo(lx - 26, ly - 6);
    ctx.lineTo(lx + 38, ly - 11);
    ctx.lineTo(lx + 40, ly + 11);
    ctx.lineTo(lx - 26, ly + 6);
    ctx.closePath();
    var latchGrad = ctx.createLinearGradient(lx - 26, ly - 12, lx + 40, ly + 12);
    latchGrad.addColorStop(0, "#dfc07d");
    latchGrad.addColorStop(0.6, "#a68040");
    latchGrad.addColorStop(1, "#7b5c29");
    ctx.fillStyle = latchGrad;
    ctx.fill();
    ctx.stroke();

    // Latch screws
    var lScrews = [[lx + 2, ly - 21], [lx + 2, ly + 21]];
    for (var ls = 0; ls < lScrews.length; ls++) {
      ctx.fillStyle = "#8a6832";
      ctx.beginPath();
      ctx.arc(lScrews[ls][0], lScrews[ls][1], 4, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // ── 6 Hexagonal Brass Bolts (12, 2, 4, 6, 8, 10 o'clock = 1d6 faces 1..6) ──
    var boltAngles = [-Math.PI / 2, -Math.PI / 6, Math.PI / 6, Math.PI / 2, 5 * Math.PI / 6, -5 * Math.PI / 6];
    for (var bi = 0; bi < 6; bi++) {
      var faceNum = bi + 1;
      var ba = boltAngles[bi];
      var bx = CX + Math.cos(ba) * 215;
      var by = CY + Math.sin(ba) * 215;
      var isRolled = (st.activeRoll === faceNum);

      if (isRolled) {
        var tierCol = faceNum <= 2 ? "#3fb3c8" : (faceNum <= 4 ? "#64c79a" : "#e57a4e");
        var pulseR = 20 + Math.sin(st.tl * 6.5) * 3;
        var bGlow = ctx.createRadialGradient(bx, by, 4, bx, by, pulseR);
        bGlow.addColorStop(0, "rgba(255, 226, 130, 0.95)");
        bGlow.addColorStop(0.55, tierCol);
        bGlow.addColorStop(1, "rgba(255, 226, 130, 0)");
        ctx.fillStyle = bGlow;
        ctx.beginPath();
        ctx.arc(bx, by, pulseR, 0, TAU);
        ctx.fill();
      }

      // Hex bolt head
      ctx.beginPath();
      for (var k = 0; k < 6; k++) {
        var ha = k * Math.PI / 3 + 0.2;
        var hx = bx + Math.cos(ha) * 10.5;
        var hy = by + Math.sin(ha) * 10.5;
        if (k === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fillStyle = isRolled ? "#ffe08a" : "#b89350";
      ctx.fill();
      ctx.strokeStyle = "#231a0d";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = isRolled ? "#fff5cf" : "#cfa964";
      ctx.beginPath();
      ctx.arc(bx, by, 5.8, 0, TAU);
      ctx.fill();

      // Engraved 1d6 pips on the rolled bolt!
      if (isRolled) {
        drawDiePips(ctx, bx, by, faceNum, 3.6, "#2c1d0b");
      }
    }

    // Subtle specular glass sheen arc on top-left
    ctx.strokeStyle = "rgba(255, 253, 244, 0.22)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS - 10, -2.38, -1.55);
    ctx.stroke();

    ctx.restore();
  }

  function drawDiePips(ctx, cx, cy, n, spread, color) {
    var map = {
      1: [[0, 0]],
      2: [[-1, -1], [1, 1]],
      3: [[-1, -1], [0, 0], [1, 1]],
      4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
      5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
      6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]
    }[n] || [[0, 0]];
    ctx.fillStyle = color;
    for (var i = 0; i < map.length; i++) {
      ctx.beginPath();
      ctx.arc(cx + map[i][0] * spread, cy + map[i][1] * spread, 1.35, 0, TAU);
      ctx.fill();
    }
  }

  // ── Setup A Cockpit Controls, Chalk Chart, Air Dial & Pilot Wing ─────────
  function drawCockpitControls(ctx, st) {
    var cap = st.showCaptions;

    // 1. Top-Left Station Placard (hidden when showCaptions === false!)
    if (cap) {
      ctx.save();
      roundedRectPath(ctx, 74, 68, 286, 86, 9);
      ctx.fillStyle = "rgba(14, 28, 31, 0.72)";
      ctx.fill();
      ctx.strokeStyle = "#3f5d5c";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.fillStyle = "#edb473";
      ctx.font = "600 14px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("STATION " + st.meta.station, 90, 94);
      ctx.fillStyle = "#a3dac8";
      ctx.font = "12.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      var toolLabel = st.meta.defaultTool === "ballast" ? "BALLAST MODULE" : "LAMP MODULE";
      if (st.lampAmt > 0.5 && st.ballastAmt > 0.5) toolLabel = "LAMP + BALLAST";
      else if (st.ballastAmt > 0.5) toolLabel = "BALLAST MODULE";
      else if (st.lampAmt > 0.5) toolLabel = "LAMP MODULE";
      ctx.fillText("FIT: " + toolLabel, 90, 116);
      ctx.fillStyle = "#c5d6d2";
      ctx.fillText(st.meta.scionRule, 90, 138);
      ctx.restore();
    }

    // 2. Top-Right "1 Day of Air" Enamel Brass Dial
    ctx.save();
    var dx = 1098, dy = 122, dr = 64;
    ctx.beginPath();
    ctx.arc(dx, dy, dr + 6, 0, TAU);
    ctx.fillStyle = "#b58f4d";
    ctx.fill();
    ctx.strokeStyle = "#1f180c";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(dx, dy, dr, 0, TAU);
    ctx.fillStyle = "#faf5e6";
    ctx.fill();
    ctx.stroke();

    // Calibration ticks along upper arc
    for (var ti = 0; ti <= 10; ti++) {
      var ta = lerp(-Math.PI * 0.85, -Math.PI * 0.15, ti / 10);
      var rIn = (ti % 2 === 0) ? dr - 12 : dr - 7;
      ctx.strokeStyle = ti <= 2 ? "#9e3d1c" : "#223130";
      ctx.lineWidth = (ti % 2 === 0) ? 2.0 : 1.2;
      ctx.beginPath();
      ctx.moveTo(dx + Math.cos(ta) * rIn, dy + Math.sin(ta) * rIn);
      ctx.lineTo(dx + Math.cos(ta) * (dr - 2), dy + Math.sin(ta) * (dr - 2));
      ctx.stroke();
    }

    // Trembling crimson air needle
    var airFrac = 0.74 - 0.05 * (st.tl / 10) + Math.sin(st.tl * 9.5) * 0.008;
    var needleAng = lerp(-Math.PI * 0.85, -Math.PI * 0.15, airFrac);
    ctx.strokeStyle = "#a6361f";
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(dx, dy + 4);
    ctx.lineTo(dx + Math.cos(needleAng) * (dr - 15), dy + Math.sin(needleAng) * (dr - 15));
    ctx.stroke();
    ctx.fillStyle = "#2b2218";
    ctx.beginPath();
    ctx.arc(dx, dy + 4, 4.5, 0, TAU);
    ctx.fill();

    if (cap) {
      ctx.fillStyle = "#1d2b2a";
      ctx.textAlign = "center";
      ctx.font = "700 14px Georgia, serif";
      ctx.fillText("1 DAY", dx, dy + 25);
      ctx.font = "11.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("OF AIR", dx, dy + 41);
      ctx.textAlign = "left";
    }
    ctx.restore();

    // 3. Bottom-Left: BALLAST / SINGLE SLOT (x = 92..334, y = 428..498)
    ctx.save();
    roundedRectPath(ctx, 92, 428, 242, 70, 10);
    ctx.fillStyle = "#102023";
    ctx.fill();
    ctx.strokeStyle = st.ballastAmt > 0.5 ? "#a3dac8" : "#66837f";
    ctx.lineWidth = st.ballastAmt > 0.5 ? 2.2 : 1.6;
    ctx.stroke();

    // Recessed single-slot socket
    roundedRectPath(ctx, 130, 460, 166, 26, 4);
    ctx.fillStyle = "#0b1618";
    ctx.fill();
    ctx.strokeStyle = "#486461";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Sliding physical Ballast Tray with brass grab handle!
    var trayY = lerp(448, 461, st.ballastAmt);
    roundedRectPath(ctx, 136, trayY, 154, 22, 3);
    ctx.fillStyle = st.ballastAmt > 0.5 ? "#395d57" : "#253c3d";
    ctx.fill();
    ctx.strokeStyle = st.ballastAmt > 0.5 ? "#edb473" : "#6c8985";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // Tray handle bar
    roundedRectPath(ctx, 190, trayY + 6, 46, 8, 3);
    ctx.fillStyle = st.ballastAmt > 0.5 ? "#edb473" : "#8ba39e";
    ctx.fill();
    // Lock indicator LEDs on rails
    ctx.fillStyle = st.ballastAmt > 0.5 ? "#a3dac8" : "#2b4242";
    ctx.beginPath();
    ctx.arc(116, 473, 4.2, 0, TAU);
    ctx.arc(310, 473, 4.2, 0, TAU);
    ctx.fill();

    if (cap) {
      ctx.fillStyle = "#8aa7a2";
      ctx.textAlign = "center";
      ctx.font = "11.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("BALLAST / SINGLE SLOT", 213, 444);
      ctx.textAlign = "left";
    }
    ctx.restore();

    // 4. Bottom-Center: CHALK CHART UNDER GLASS (x = 475..805, y = 442..502)
    ctx.save();
    roundedRectPath(ctx, 475, 442, 330, 60, 10);
    ctx.fillStyle = "#142629";
    ctx.fill();
    ctx.strokeStyle = "#7b9b96";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Chalk route polyline progressively drawn across [0..1]
    var routePts = [
      [502, 487], [558, 470], [612, 483], [672, 466], [734, 472], [778, 478]
    ];
    var totalSegs = routePts.length - 1;
    var prog = st.chartProgress * totalSegs;
    ctx.strokeStyle = "#f2ede0";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(routePts[0][0], routePts[0][1]);
    for (var ri = 0; ri < totalSegs; ri++) {
      var segFrac = clamp(prog - ri, 0, 1);
      if (segFrac <= 0) break;
      var nx = lerp(routePts[ri][0], routePts[ri + 1][0], segFrac);
      var ny = lerp(routePts[ri][1], routePts[ri + 1][1], segFrac);
      ctx.lineTo(nx, ny);
    }
    ctx.stroke();

    // Stone Steps & Rock Notch tiny chalk marks
    ctx.strokeStyle = "rgba(163, 218, 200, 0.55)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(555, 464); ctx.lineTo(561, 464);
    ctx.moveTo(669, 459); ctx.lineTo(672, 463); ctx.lineTo(675, 459);
    ctx.stroke();

    // Gold verified landmark dot (Act 3 / Trout Looks In)
    if (st.chartDotAmt > 0.01) {
      var gx = 734, gy = 472;
      ctx.fillStyle = "rgba(237, 180, 115, " + (0.35 * st.chartDotAmt) + ")";
      ctx.beginPath();
      ctx.arc(gx, gy, 11 * st.chartDotAmt, 0, TAU);
      ctx.fill();

      ctx.fillStyle = "#edb473";
      ctx.beginPath();
      ctx.arc(gx, gy, 5.2 * st.chartDotAmt, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#fff5d6";
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }

    // Diagonal glass reflection streak over chart
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(495, 496);
    ctx.lineTo(540, 448);
    ctx.stroke();

    if (cap) {
      ctx.fillStyle = "#9ab5b0";
      ctx.textAlign = "center";
      ctx.font = "11.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("CHART UNDER GLASS", 640, 457);
      ctx.textAlign = "left";
    }
    ctx.restore();

    // 5. Bottom-Right: LAMP TOGGLE (x = 984..1102, y = 426..498)
    ctx.save();
    roundedRectPath(ctx, 984, 426, 118, 72, 10);
    ctx.fillStyle = "#1c2625";
    ctx.fill();
    ctx.strokeStyle = "#edb473";
    ctx.lineWidth = 2.0;
    ctx.stroke();

    var tx = 1043, ty = 472;
    // Glow jewel when lamp is ON
    if (st.lampAmt > 0.05) {
      var jGlow = ctx.createRadialGradient(tx, ty, 2, tx, ty, 28);
      jGlow.addColorStop(0, "rgba(255, 206, 120, " + (0.55 * st.lampAmt) + ")");
      jGlow.addColorStop(1, "rgba(255, 206, 120, 0)");
      ctx.fillStyle = jGlow;
      ctx.beginPath();
      ctx.arc(tx, ty, 28, 0, TAU);
      ctx.fill();
    }

    ctx.fillStyle = "#d49b57";
    ctx.beginPath();
    ctx.arc(tx, ty, 9.5, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#231a0d";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Articulated toggle bat-handle: OFF leans down-left (-0.65 rad), ON throws up-right (+0.48 rad)
    var togAng = lerp(-0.72, 0.46, st.lampAmt);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(togAng);
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(-5, -28);
    ctx.lineTo(5, -28);
    ctx.lineTo(3, 0);
    ctx.closePath();
    ctx.fillStyle = "#f7f3e8";
    ctx.fill();
    ctx.strokeStyle = "#231a0d";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    if (cap) {
      ctx.fillStyle = "#edb473";
      ctx.textAlign = "center";
      ctx.font = "11.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("TOGGLE", 1043, 442);
      ctx.textAlign = "left";
    }
    ctx.restore();

    // 6. Articulated Feathered Turkey Pilot Wing Operating the Control (Act 1: 0.2..1.85s)
    drawTurkeyPilotWing(ctx, st);
  }

  function drawTurkeyPilotWing(ctx, st) {
    // Wing reaches from pilot seat up to the active defaultTool in Act 1!
    var reachAmt = 0;
    if (!st.hasInteractive && st.tl < 2.05) {
      reachAmt = band(0.22, 0.72, 1.32, 1.88, st.tl);
    }
    // Subtle resting pilot wing silhouette at bottom-right/left edge + active reach
    var isBallast = st.meta.defaultTool === "ballast";
    var restX = isBallast ? 265 : 980;
    var restY = 562;
    var targetX = isBallast ? (212) : (1040 + (st.lampAmt - 0.5) * 16);
    var targetY = isBallast ? (458 + st.ballastAmt * 12) : (452);

    // Subtle press dip right around t = 1.0s
    var pressDip = (!st.hasInteractive) ? band(0.88, 1.0, 1.08, 1.25, st.tl) : 0;
    var tipX = lerp(restX, targetX, reachAmt);
    var tipY = lerp(restY, targetY + pressDip * 7, reachAmt);

    if (reachAmt < 0.02) return;

    ctx.save();
    var rootX = isBallast ? 320 : 920;
    var rootY = 555;
    var ang = Math.atan2(tipY - rootY, tipX - rootX);

    ctx.translate(tipX, tipY);
    ctx.rotate(ang + Math.PI * 0.5);

    // Drop shadow on panel
    ctx.fillStyle = "rgba(5, 10, 12, 0.38)";
    ctx.beginPath();
    ctx.ellipse(6, 38, 28, 56, 0, 0, TAU);
    ctx.fill();

    // Layered bronze & cinnamon primary wing feathers
    for (var fi = -2; fi <= 2; fi++) {
      ctx.save();
      ctx.rotate(fi * 0.13);
      ctx.beginPath();
      ctx.moveTo(-9, 95);
      ctx.quadraticCurveTo(-13, 35, -5, 0);
      ctx.quadraticCurveTo(0, -10, 5, 0);
      ctx.quadraticCurveTo(13, 35, 9, 95);
      ctx.closePath();
      ctx.fillStyle = (fi % 2 === 0) ? "#7d492d" : "#965b38";
      ctx.fill();
      ctx.strokeStyle = "#26150c";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Cream barred turkey-feather tip
      ctx.fillStyle = "#e8d2ab";
      ctx.beginPath();
      ctx.ellipse(0, 4, 4.5, 6, 0, 0, TAU);
      ctx.fill();

      // Feather rachis quill
      ctx.strokeStyle = "#d8b482";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(0, 82);
      ctx.stroke();
      ctx.restore();
    }

    // Contact spark / tactile ring right at t = 1.0s!
    if (pressDip > 0.25) {
      ctx.strokeStyle = "rgba(255, 224, 140, " + (pressDip * 0.85) + ")";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, -6, 12 + (1 - pressDip) * 10, 0, TAU);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ── Lower Cream Editorial Story Strip (y = 536..720) ─────────────────────
  function drawStoryStrip(ctx, st) {
    ctx.save();
    ctx.fillStyle = "#faf8f3";
    ctx.fillRect(0, 536, 1280, 184);

    // Subtle paper grain
    var gp = getGrainPattern(ctx);
    if (gp) {
      ctx.fillStyle = gp;
      ctx.fillRect(0, 536, 1280, 184);
    }

    ctx.strokeStyle = "#cbc3b3";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 536.75);
    ctx.lineTo(1280, 536.75);
    ctx.stroke();

    // PAELEO Blind-Critic Invariant: zero text labels when showCaptions === false!
    if (!st.showCaptions) {
      ctx.restore();
      return;
    }

    var m = st.meta;
    if (st.pass === "act1") {
      ctx.fillStyle = "#6c6456";
      ctx.font = "600 15px ui-monospace, SFMono-Regular, Menlo, monospace";
      var opTxt = m.defaultTool === "ballast" ? "SLIDE BALLAST MODULE" : "FLIP LAMP TOGGLE";
      ctx.fillText("SETUP A · " + opTxt + "   (" + m.station + ")", 72, 574);

      ctx.fillStyle = "#24201a";
      ctx.font = "700 33px Georgia, serif";
      ctx.fillText(m.clue, 72, 622);

      ctx.fillStyle = "#5c5549";
      ctx.font = "italic 20px Georgia, serif";
      ctx.fillText("Operate one cockpit control at 1.0s and watch what changes outside the 2-o’clock chipped port.", 72, 696);
    } else if (st.pass === "turkey") {
      ctx.fillStyle = "#9e3d1c";
      ctx.font = "600 15px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("FIRST PASS  ·  TURKEY LOOKS OUT   (" + m.station + ")", 72, 574);

      ctx.fillStyle = "#9e3d1c";
      ctx.font = "700 37px Georgia, serif";
      ctx.fillText("“" + m.turkeyFork + "”", 72, 624);

      ctx.fillStyle = "#575046";
      ctx.font = "italic 21px Georgia, serif";
      ctx.fillText("Write odd faces (1 · 3 · 5)  ·  " + m.scionRule, 72, 696);
    } else {
      ctx.fillStyle = "#1d596e";
      ctx.font = "600 15px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("SECOND PASS  ·  TROUT LOOKS IN   (" + m.station + ")", 72, 574);

      ctx.fillStyle = "#1d596e";
      ctx.font = "700 37px Georgia, serif";
      ctx.fillText("“" + m.troutFork + "”", 72, 624);

      ctx.fillStyle = "#3c545a";
      ctx.font = "italic 21px Georgia, serif";
      var rollNote = st.activeRoll > 0 ? ("  ·  Rolled 1d6: " + st.activeRoll) : "";
      ctx.fillText("Write even faces (2 · 4 · 6)  ·  Roll 1d6 once  ·  Mark chart for Brook" + rollNote, 72, 696);
    }

    ctx.restore();
  }

  // ── Shared Underwater Atmosphere Helpers ─────────────────────────────────
  function drawLampBeam(ctx, st, aimX, aimY, radius) {
    if (st.lampAmt <= 0.01) return;
    ctx.save();
    var a = st.lampAmt;
    // Volumetric cone from lower-right lamp mount across porthole
    var coneGrad = ctx.createRadialGradient(aimX, aimY, 16, aimX, aimY, radius || 180);
    coneGrad.addColorStop(0, "rgba(255, 224, 152, " + (0.34 * a) + ")");
    coneGrad.addColorStop(0.55, "rgba(237, 180, 115, " + (0.14 * a) + ")");
    coneGrad.addColorStop(1, "rgba(237, 180, 115, 0)");
    ctx.fillStyle = coneGrad;
    ctx.fillRect(CX - R_GLASS, CY - R_GLASS, R_GLASS * 2, R_GLASS * 2);

    // Floating sunlit dust/silt motes illuminated by lamp
    for (var i = 0; i < 18; i++) {
      var mx = CX + (hash(i * 17 + 3) - 0.5) * 300 + Math.sin(st.tl * 0.9 + i) * 14;
      var my = CY + (hash(i * 31 + 7) - 0.5) * 300 - ((st.tl * (8 + (i % 5) * 3) + i * 29) % 260) + 130;
      var dist = Math.hypot(mx - aimX, my - aimY);
      if (dist < (radius || 180)) {
        ctx.fillStyle = "rgba(255, 240, 195, " + (0.45 * a * (1 - dist / (radius || 180))) + ")";
        ctx.beginPath();
        ctx.arc(mx, my, 1.4 + (i % 3) * 0.6, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function applyMurkyDuskVeil(ctx, darkness) {
    if (darkness <= 0.01) return;
    ctx.fillStyle = "rgba(9, 25, 31, " + clamp(darkness, 0, 0.78) + ")";
    ctx.fillRect(CX - R_GLASS - 4, CY - R_GLASS - 4, R_GLASS * 2 + 8, R_GLASS * 2 + 8);
  }

  function drawRisingBubbles(ctx, count, seedBase, t, x0, x1, speedScale) {
    ctx.save();
    for (var i = 0; i < count; i++) {
      var bx = lerp(x0, x1, hash(seedBase + i * 13)) + Math.sin(t * 2.4 + i) * 5;
      var cycle = ((t * (22 + (i % 4) * 9) * (speedScale || 1) + hash(seedBase + i * 29) * 320) % 340);
      var by = CY + 175 - cycle;
      var br = 2.0 + (i % 4) * 1.1;
      ctx.strokeStyle = "rgba(225, 250, 248, 0.58)";
      ctx.fillStyle = "rgba(195, 240, 238, 0.18)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // =========================================================================
  // PORTHOLE #36 · BENCH — Hound figure clutching wax-sealed envelope
  // Reference: Menu & Trondheim: One Plate, Two Strips / The Shins: Rifle's Spiral
  // Turkey: "Governor's pardon or overdue bill?" | Trout: "Getaway vehicle or brass mailbox?"
  // Rule: Iconic Iteration (Oubapo) | Default Tool: lamp
  // =========================================================================
  function renderP36(ctx, st) {
    var tl = st.tl;
    var camY = st.ballastAmt * 22; // interactive ballast sightline drop

    // 0. Deep Prussian-teal creek water & surface caustics
    var wGrad = ctx.createLinearGradient(CX, CY - R_GLASS, CX, CY + R_GLASS);
    wGrad.addColorStop(0, st.pass === "trout" ? "#3c8889" : "#24585c");
    wGrad.addColorStop(0.62, st.pass === "trout" ? "#276366" : "#194044");
    wGrad.addColorStop(1, "#132e30");
    ctx.fillStyle = wGrad;
    ctx.fillRect(CX - R_GLASS, CY - R_GLASS, R_GLASS * 2, R_GLASS * 2);

    // Undulating surface wave bands
    ctx.strokeStyle = "rgba(168, 228, 220, 0.16)";
    ctx.lineWidth = 3;
    for (var wi = 0; wi < 4; wi++) {
      var wy = CY - 142 + wi * 24 + camY * 0.3;
      ctx.beginPath();
      for (var wx = CX - 180; wx <= CX + 180; wx += 24) {
        var dy = Math.sin(wx * 0.03 + tl * 1.8 + wi) * 4;
        if (wx === CX - 180) ctx.moveTo(wx, wy + dy);
        else ctx.lineTo(wx, wy + dy);
      }
      ctx.stroke();
    }

    // Creek floor silt & mossy river stones
    ctx.save();
    ctx.translate(0, camY);
    ctx.fillStyle = "#264844";
    ctx.beginPath();
    ctx.ellipse(CX, CY + 148, 210, 68, 0, 0, TAU);
    ctx.fill();

    // Left mossy boulder
    ctx.fillStyle = "#3f6963";
    ctx.strokeStyle = "#162927";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(CX - 188, CY + 72);
    ctx.quadraticCurveTo(CX - 135, CY + 62, CX - 114, CY + 92);
    ctx.lineTo(CX - 118, CY + 116);
    ctx.lineTo(CX - 190, CY + 116);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Background swaying Vallisneria reeds
    var reedClusters = [[-148, 68, 5], [116, 128, 5]];
    for (var rc = 0; rc < reedClusters.length; rc++) {
      var rx0 = CX + reedClusters[rc][0], ry0 = CY + reedClusters[rc][1];
      for (var ri = 0; ri < reedClusters[rc][2]; ri++) {
        var sway = Math.sin(tl * 2.1 + ri * 0.8 + rc) * 9;
        ctx.beginPath();
        ctx.moveTo(rx0 + ri * 7, ry0);
        ctx.bezierCurveTo(rx0 + ri * 5 - 8, ry0 - 38, rx0 + ri * 6 + sway, ry0 - 72, rx0 + ri * 7 + sway * 1.4, ry0 - 102 + (ri % 2) * 14);
        ctx.quadraticCurveTo(rx0 + ri * 7 + sway * 0.8 + 5, ry0 - 54, rx0 + ri * 7 + 4, ry0);
        ctx.closePath();
        ctx.fillStyle = rc === 0 ? "#355e55" : "#2f574e";
        ctx.fill();
        ctx.strokeStyle = "#142622";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }

    // 1. Submerged Slatted Wooden Park Bench
    ctx.save();
    // Bench legs
    ctx.fillStyle = "#3a4d47";
    ctx.strokeStyle = "#15211e";
    ctx.lineWidth = 2.0;
    var legs = [[-124, 34, 14, 58], [-98, 30, 12, 50], [92, 34, 14, 56], [68, 30, 11, 48]];
    for (var li = 0; li < legs.length; li++) {
      ctx.fillRect(CX + legs[li][0], CY + legs[li][1], legs[li][2], legs[li][3]);
      ctx.strokeRect(CX + legs[li][0], CY + legs[li][1], legs[li][2], legs[li][3]);
    }
    // 4 backrest slats in warm weathered sage-teak
    for (var si = 0; si < 4; si++) {
      var sy = CY - 46 + si * 17;
      ctx.beginPath();
      ctx.moveTo(CX - 146 + si * 2, sy);
      ctx.lineTo(CX + 114 - si, sy + 4);
      ctx.lineTo(CX + 113 - si, sy + 15);
      ctx.lineTo(CX - 144 + si * 2, sy + 12);
      ctx.closePath();
      ctx.fillStyle = si % 2 === 0 ? "#4f7268" : "#46675e";
      ctx.fill();
      ctx.stroke();
    }
    // Seat plank
    ctx.beginPath();
    ctx.moveTo(CX - 136, CY + 24);
    ctx.lineTo(CX + 120, CY + 27);
    ctx.lineTo(CX + 108, CY + 39);
    ctx.lineTo(CX - 122, CY + 36);
    ctx.closePath();
    ctx.fillStyle = "#597c71";
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. Acting Beats for Hound, Envelope, and Trout
    var isTurkey = st.pass === "turkey";
    var isTrout = st.pass === "trout";

    // Beat 2A (2.0..3.5s): Noble Governor's pardon | Beat 2B (3.5..5.6s, covers t=4.0s!): Urgent Overdue bill + Dual Iteration!
    var pardonBeat = isTurkey ? (st.viewMode === "turkey" ? 0.5 + 0.5 * Math.sin(tl * 1.8) : band(2.0, 2.35, 3.45, 4.3, tl)) : 0;
    var billBeat = isTurkey ? (st.viewMode === "turkey" ? 0.5 - 0.5 * Math.sin(tl * 1.8) : smooth(3.45, 3.85, tl)) : 0;

    // Beat 3A (5.6..7.5s, covers t=6.8s!): Getaway vehicle | Beat 3B (7.5..10.0s, covers t=9.2s!): Brass mailbox!
    var getawayBeat = isTrout ? (st.viewMode === "trout" ? band(0, 0.4, 4.6, 5.2, tl % 10) : band(5.6, 6.0, 7.4, 7.9, tl)) : 0;
    var mailboxBeat = isTrout ? (st.viewMode === "trout" ? smooth(4.8, 5.4, tl % 10) : smooth(7.55, 8.35, tl)) : 0;

    // Getaway slipstream bubbles streaming horizontally across behind glass in Beat 3A!
    if (getawayBeat > 0.05) {
      ctx.save();
      ctx.globalAlpha = getawayBeat * 0.78;
      for (var gb = 0; gb < 16; gb++) {
        var gx = CX + 175 - ((tl * 155 + gb * 43) % 350);
        var gy = CY - 90 + (gb * 17) % 210;
        ctx.strokeStyle = "#d9f7f4";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(gx + 16, gy);
        ctx.lineTo(gx + 4, gy);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(gx, gy, 2.5 + (gb % 3), 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Articulated Cut-Paper & Felt Hound Rig
    var houndShiftX = mailboxBeat * 68 - getawayBeat * 8 + billBeat * 10;
    var houndShiftY = -mailboxBeat * 14 - billBeat * 4;
    var headTilt = -0.06 * pardonBeat + 0.12 * billBeat - 0.16 * mailboxBeat + 0.08 * getawayBeat;
    var pawLift = billBeat * (12 + Math.abs(Math.sin(tl * 7.5)) * 14); // taps stone impatiently for overdue bill!
    var tailWag = pardonBeat * Math.sin(tl * 11) * 0.42 - billBeat * 0.18 + mailboxBeat * 0.25;

    ctx.save();
    ctx.translate(CX - 8 + houndShiftX, CY + 42 + houndShiftY);

    // Subtle ground contact shadow
    ctx.fillStyle = "rgba(8, 20, 20, 0.42)";
    ctx.beginPath();
    ctx.ellipse(-8, 66, 64, 14, 0, 0, TAU);
    ctx.fill();

    // Articulated Tail
    ctx.save();
    ctx.translate(-56, 36);
    ctx.rotate(-0.35 + tailWag);
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.quadraticCurveTo(-28, -18, -16, -54);
    ctx.quadraticCurveTo(-8, -22, 10, 2);
    ctx.closePath();
    ctx.fillStyle = "#9b6f45";
    ctx.fill();
    ctx.strokeStyle = "#1d140c";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.restore();

    // Hind haunch & seated paw
    ctx.fillStyle = "#8a603a";
    ctx.strokeStyle = "#1d140c";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-54, 42);
    ctx.bezierCurveTo(-68, 12, -32, 6, -24, 34);
    ctx.lineTo(-14, 58);
    ctx.lineTo(-46, 62);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Torso & breathing chest
    var breath = Math.sin(tl * 3.0) * 1.6;
    var torsoGrad = ctx.createLinearGradient(-44, -40, 34, 50);
    torsoGrad.addColorStop(0, "#b98a5b");
    torsoGrad.addColorStop(0.6, "#966a41");
    torsoGrad.addColorStop(1, "#6f4c2c");
    ctx.fillStyle = torsoGrad;
    ctx.beginPath();
    ctx.moveTo(-52, 46);
    ctx.quadraticCurveTo(-36, -12, -12, -52);
    ctx.lineTo(26 + breath, -46);
    ctx.quadraticCurveTo(38 + breath, -4, 24, 52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Chest fur V-tufts
    ctx.strokeStyle = "rgba(45, 28, 15, 0.55)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-2, -16); ctx.lineTo(6, -6); ctx.lineTo(15, -16);
    ctx.moveTo(2, -4); ctx.lineTo(9, 5); ctx.lineTo(18, -4);
    ctx.stroke();

    // Left planted foreleg
    ctx.fillStyle = "#a87b4e";
    ctx.strokeStyle = "#1d140c";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-14, 4);
    ctx.lineTo(-8, 62);
    ctx.quadraticCurveTo(2, 67, 8, 62);
    ctx.lineTo(6, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right articulated foreleg (taps stone on overdue-bill beat, lifts when slotting mailbox!)
    ctx.save();
    ctx.translate(20, 6);
    ctx.rotate(-pawLift * 0.018 - mailboxBeat * 0.25);
    ctx.fillStyle = "#986c42";
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(-2, 54 - pawLift * 0.35);
    ctx.quadraticCurveTo(9, 59 - pawLift * 0.35, 14, 53 - pawLift * 0.35);
    ctx.lineTo(8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Articulated Head, Floppy Pinned Ears & Wax-Sealed Envelope
    ctx.save();
    ctx.translate(4, -58);
    ctx.rotate(headTilt);

    // Noble golden pardon halo behind Hound's head during Beat 2A / Oubapo dual beat!
    if (pardonBeat > 0.05 || billBeat > 0.15) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 218, 128, " + (0.48 * Math.max(pardonBeat, billBeat * 0.7)) + ")";
      ctx.lineWidth = 2.4;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(4, -18, 44, -Math.PI * 0.92, -Math.PI * 0.08);
      ctx.stroke();
      ctx.restore();
    }

    // Back ear
    var earTwitch = Math.sin(tl * 12.9) * 0.06 * st.lampAmt; // 124 BPM staccato Vox organ twitch!
    ctx.fillStyle = "#7a5330";
    ctx.beginPath();
    ctx.ellipse(24, -14, 11, 22, -0.25 - earTwitch, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Hound head & brow
    ctx.fillStyle = "#b8895a";
    ctx.beginPath();
    ctx.moveTo(-22, 4);
    ctx.bezierCurveTo(-26, -34, 14, -42, 26, -18);
    ctx.lineTo(42, -6);
    ctx.quadraticCurveTo(44, 8, 26, 10);
    ctx.lineTo(-14, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dark leather nose
    ctx.fillStyle = "#241912";
    ctx.beginPath();
    ctx.ellipse(39, -4, 6.5, 5, 0.1, 0, TAU);
    ctx.fill();

    // Hound eye (looks back nervously on getawayBeat, stern brow on billBeat!)
    var pupilShift = getawayBeat > 0.2 ? -2.2 : 1.6;
    ctx.fillStyle = "#1d140d";
    ctx.beginPath();
    ctx.arc(8 + pupilShift * 0.5, -18, 4.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#fff5dc";
    ctx.beginPath();
    ctx.arc(7 + pupilShift * 0.5, -19.5, 1.4, 0, TAU);
    ctx.fill();
    if (billBeat > 0.25) {
      ctx.strokeStyle = "#2b1b10";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(16, -22);
      ctx.stroke();
    }

    // Front floppy pinned ear (with brass Oubapo split-pin!)
    ctx.save();
    ctx.translate(-14, -22);
    ctx.rotate(0.18 - pardonBeat * 0.22 - billBeat * 0.28 + earTwitch);
    ctx.fillStyle = "#9d7045";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-22, 8, -22, 38, -4, 42);
    ctx.bezierCurveTo(10, 40, 12, 14, 4, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Brass pin brad
    ctx.fillStyle = "#dfc07a";
    ctx.beginPath();
    ctx.arc(0, 2, 3.0, 0, TAU);
    ctx.fill();
    ctx.restore();

    // ── Oversized Cream Cotton-Rag Envelope with Glossy Crimson Wax Seal ──
    ctx.save();
    var envSlideX = mailboxBeat * 36; // slides forward into brass porthole latch slot!
    ctx.translate(22 + envSlideX, 16 - mailboxBeat * 8);
    ctx.rotate(-0.11 + billBeat * 0.08 + mailboxBeat * 0.11);

    // Drop shadow
    ctx.fillStyle = "rgba(10, 18, 18, 0.35)";
    ctx.fillRect(-38, -20, 88, 56);

    // Cream rag envelope body
    ctx.fillStyle = "#f4efe2";
    ctx.strokeStyle = "#241d15";
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.rect(-42, -24, 88, 56);
    ctx.fill();
    ctx.stroke();

    // Iconic Iteration (Oubapo) Visual Split on the Envelope!
    // Left half: satin gold Governor's Pardon ribbons; Right half (on billBeat): crimson Past-Due tally bars & hourglass!
    if (pardonBeat > 0.1 || billBeat > 0.1) {
      // Gold pardon ribbons hanging beneath seal
      var ribAlpha = clamp(pardonBeat + billBeat * 0.75, 0, 1);
      ctx.save();
      ctx.globalAlpha = ribAlpha;
      ctx.fillStyle = "#e2b24a";
      ctx.strokeStyle = "#5c4112";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-4, 8); ctx.lineTo(-16, 38); ctx.lineTo(-9, 35); ctx.lineTo(-5, 40); ctx.lineTo(1, 10);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    if (billBeat > 0.15) {
      // Urgent crimson ledger stripes + exclamation warning showing on right side of wet rag envelope!
      ctx.save();
      ctx.globalAlpha = billBeat * 0.88;
      ctx.strokeStyle = "#b83227";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(14, -14); ctx.lineTo(38, -14);
      ctx.moveTo(18, -6);  ctx.lineTo(38, -6);
      ctx.moveTo(16, 18);  ctx.lineTo(38, 18);
      ctx.stroke();
      // Bold red due-stamp circle + exclamation icon (no text letters!)
      ctx.strokeStyle = "#b83227";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(28, 6, 8, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "#b83227";
      ctx.fillRect(27, 0.5, 2.2, 6.5);
      ctx.fillRect(27, 9, 2.2, 2.2);
      ctx.restore();
    }

    // Envelope bottom & top V-flaps
    ctx.strokeStyle = "#5c5346";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-42, 32); ctx.lineTo(2, 4); ctx.lineTo(46, 32);
    ctx.stroke();

    ctx.fillStyle = "#fbf7ec";
    ctx.strokeStyle = "#241d15";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-42, -24);
    ctx.lineTo(2, 8);
    ctx.lineTo(46, -24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glossy Crimson Wax Seal
    ctx.fillStyle = "#982124";
    ctx.beginPath();
    for (var wa = 0; wa < 12; wa++) {
      var ang = (wa / 12) * TAU;
      var wr = 12.5 + Math.sin(wa * 3.1) * 1.4;
      var wxp = 2 + Math.cos(ang) * wr;
      var wyp = 5 + Math.sin(ang) * wr;
      if (wa === 0) ctx.moveTo(wxp, wyp);
      else ctx.lineTo(wxp, wyp);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#4a0d0f";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Inner embossed wax ring & specular highlight
    ctx.strokeStyle = "#d95b5e";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(2, 5, 7.8, 0, TAU);
    ctx.stroke();
    // Tiny embossed crown/olive crest inside wax
    ctx.strokeStyle = "#f2b89b";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-3, 7); ctx.lineTo(-2, 2); ctx.lineTo(2, 5); ctx.lineTo(6, 2); ctx.lineTo(7, 7);
    ctx.stroke();

    ctx.restore(); // end envelope
    ctx.restore(); // end head
    ctx.restore(); // end hound

    // Oubapo Twin-Iteration Frame Corner Brackets in Act 2!
    if (isTurkey && (pardonBeat + billBeat) > 0.2) {
      ctx.save();
      ctx.strokeStyle = "rgba(247, 232, 196, 0.45)";
      ctx.lineWidth = 2;
      var bCorners = [[-116, -110, 1, 1], [116, -110, -1, 1], [-116, 108, 1, -1], [116, 108, -1, -1]];
      for (var bc = 0; bc < bCorners.length; bc++) {
        var c = bCorners[bc];
        ctx.beginPath();
        ctx.moveTo(CX + c[0], CY + c[1] + c[3] * 18);
        ctx.lineTo(CX + c[0], CY + c[1]);
        ctx.lineTo(CX + c[0] + c[2] * 18, CY + c[1]);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Brass Mailbox Slot Guide Glow on Right Porthole Edge in Beat 3B (t=9.2s)!
    if (mailboxBeat > 0.1) {
      ctx.save();
      ctx.globalAlpha = mailboxBeat;
      // Glowing mail-slot bracket aligned with the brass dog-latch!
      ctx.strokeStyle = "#ffd980";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(CX + 168, CY - 16);
      ctx.lineTo(CX + 180, CY - 16);
      ctx.lineTo(CX + 180, CY + 32);
      ctx.lineTo(CX + 168, CY + 32);
      ctx.stroke();
      // Animated mail-insertion arrow pointing into the brass rim!
      var arrowBob = Math.sin(tl * 7) * 4;
      ctx.fillStyle = "#ffd980";
      ctx.beginPath();
      ctx.moveTo(CX + 162 + arrowBob, CY + 8);
      ctx.lineTo(CX + 146 + arrowBob, CY);
      ctx.lineTo(CX + 146 + arrowBob, CY + 16);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 4. Articulated Spotted Brook Trout in Act 3 (or background cameo)
    if (isTrout) {
      var enterU = st.viewMode === "trout" ? 1 : smooth(5.6, 6.35, tl);
      var tx = lerp(CX + 235, CX + 114 - mailboxBeat * 18, enterU);
      var ty = CY + 6 - mailboxBeat * 42 + Math.sin(tl * 2.6) * 5;
      drawBrookTrout(ctx, {
        x: tx,
        y: ty,
        scale: 0.92,
        pitch: mailboxBeat * 0.22 - 0.04,
        t: tl,
        speed: getawayBeat > 0.3 ? 1.5 : 0.9,
        mouthOpen: mailboxBeat * 0.45,
        finReach: mailboxBeat * 0.75
      });
    }

    // Foreground reeds on lower-right
    ctx.save();
    for (var fri = 0; fri < 4; fri++) {
      var fsway = Math.sin(tl * 2.4 + fri) * 7;
      var fx = CX + 95 + fri * 11, fy = CY + 168;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(fx - 8 + fsway, fy - 48, fx + fsway * 1.4, fy - 92 + fri * 8);
      ctx.quadraticCurveTo(fx + 6 + fsway * 0.7, fy - 44, fx + 5, fy);
      ctx.closePath();
      ctx.fillStyle = "#294d44";
      ctx.fill();
      ctx.strokeStyle = "#11221e";
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore(); // end camY

    // Volumetric Lamp Cone + Dusk Veil + Bubbles + Turkey Reflection
    drawLampBeam(ctx, st, CX + 4, CY + 8, 195);
    drawRisingBubbles(ctx, 9, 360, tl, CX - 130, CX + 145, 0.9);
    applyMurkyDuskVeil(ctx, (1 - st.lampAmt) * 0.68);
    drawTurkeyGlassReflection(ctx, st, { surprised: billBeat * 0.85 });
  }

  // =========================================================================
  // PORTHOLE #37 · BULKHEAD — Folded silt map where claw meets fin
  // Reference: Lécroart & Wilhelm Busch: Folded Dialogue / This Land Is Mine
  // Turkey: "Peaceful olive twig or hidden trap?" | Trout: "Friendly handshake or two-sided decoy?"
  // Rule: Folded Seam (Oubapo / V04) | Default Tool: ballast
  // =========================================================================
  function renderP37(ctx, st) {
    var tl = st.tl;
    var bal = st.ballastAmt; // 0 at t=0.8s (high fast water!), 1 at t=1.8s (calm low shelter!)
    var liftY = (1 - bal) * -58; // before ballast locks, sub rides too high and map is buffeted!

    // 0. Submerged creek & limestone bulkhead wall
    var wGrad = ctx.createLinearGradient(CX, CY - R_GLASS, CX, CY + R_GLASS);
    wGrad.addColorStop(0, "#2f6b6c");
    wGrad.addColorStop(0.55, "#1f4d50");
    wGrad.addColorStop(1, "#143336");
    ctx.fillStyle = wGrad;
    ctx.fillRect(CX - R_GLASS, CY - R_GLASS, R_GLASS * 2, R_GLASS * 2);

    // Fast current silt ribbons BEFORE ballast settles (slackens smoothly when bal -> 1!)
    var currentStrength = 1 - bal * 0.82;
    ctx.save();
    ctx.strokeStyle = "rgba(216, 224, 196, " + (0.14 + 0.34 * (1 - bal)) + ")";
    ctx.lineWidth = 2.4;
    for (var ci = 0; ci < 8; ci++) {
      var cyLine = CY - 140 + ci * 38;
      var speed = 40 + (1 - bal) * 190;
      var cxStart = CX + 190 - ((tl * speed + ci * 67) % 380);
      ctx.beginPath();
      ctx.moveTo(cxStart, cyLine);
      ctx.quadraticCurveTo(cxStart - 28, cyLine + Math.sin(tl * 5 + ci) * 6 * currentStrength, cxStart - (26 + (1 - bal) * 48), cyLine);
      ctx.stroke();
    }
    ctx.restore();

    // Shelter limestone lip rising into lower foreground as ballast lowers sightline!
    ctx.save();
    var lipY = CY + 192 - bal * 34;
    ctx.fillStyle = "#2b4644";
    ctx.strokeStyle = "#122120";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(CX - 190, lipY + 40);
    ctx.lineTo(CX - 180, lipY + 4);
    ctx.lineTo(CX - 70, lipY - 6);
    ctx.lineTo(CX + 90, lipY - 2);
    ctx.lineTo(CX + 185, lipY + 8);
    ctx.lineTo(CX + 190, lipY + 40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Acting Beats
    var isTurkey = st.pass === "turkey";
    var isTrout = st.pass === "trout";

    // Beat 2A (2.0..3.45s): Open map + peaceful olive twig | Beat 2B (3.45..5.6s, covers t=4.0s!): Folded Seam Trap!
    var foldAmt = 0.14;
    var oliveAmt = 0;
    if (isTurkey) {
      if (st.viewMode === "turkey") {
        var cyc = 0.5 - 0.5 * Math.cos(tl * 1.6);
        foldAmt = lerp(0.12, 0.78, cyc);
        oliveAmt = 1 - cyc * 0.4;
      } else {
        foldAmt = lerp(0.12, 0.80, smooth(3.35, 3.85, tl));
        oliveAmt = smooth(2.05, 2.4, tl);
      }
    }

    // Beat 3A (5.6..7.5s, covers t=6.8s!): Friendly handshake | Beat 3B (7.5..10.0s, covers t=9.2s!): Two-sided decoy!
    var shakeBeat = isTrout ? (st.viewMode === "trout" ? band(0, 0.4, 4.6, 5.2, tl % 10) : band(5.6, 6.0, 7.45, 7.9, tl)) : 0;
    var decoyFlip = isTrout ? (st.viewMode === "trout" ? smooth(4.8, 5.5, tl % 10) : smooth(7.55, 8.45, tl)) : 0;

    // 1. Articulated Brook Trout above/beside map in Act 3
    if (isTrout) {
      var enterT = st.viewMode === "trout" ? 1 : smooth(5.6, 6.25, tl);
      var troutX = lerp(CX + 195, lerp(CX + 12, CX + 98, decoyFlip), enterT);
      var troutY = lerp(CY - 122, CY - 62, decoyFlip) + Math.sin(tl * 2.8) * 4;
      drawBrookTrout(ctx, {
        x: troutX,
        y: troutY,
        scale: 0.90,
        flipX: decoyFlip < 0.4 ? true : false,
        pitch: decoyFlip > 0.4 ? 0.24 : 0.10,
        t: tl,
        speed: 1.0,
        mouthOpen: decoyFlip * 0.4
      });
    }

    // 2. 4-Panel Accordion-Folded Cotton-Rag Silt Map (Lécroart Oubapo Pliage!)
    var buffetRot = (1 - bal) * Math.sin(tl * 6.2) * 0.08;
    ctx.save();
    ctx.translate(CX, CY + 12 + liftY);
    ctx.rotate(buffetRot - decoyFlip * 0.06);

    var mapH = 196;
    var outerW = lerp(66, 54, foldAmt);
    var innerW = lerp(58, 13, foldAmt); // inner panels fold deep into V-crease!
    var valleyY = 8 + foldAmt * 22;     // 3D perspective drop at central seam

    // X-coordinates of the 5 vertical crease lines (-2, -1, 0, +1, +2)
    var xM2 = -(outerW + innerW);
    var xM1 = -innerW;
    var x0 = 0;
    var xP1 = innerW;
    var xP2 = (outerW + innerW) * lerp(1, 0.18, decoyFlip); // right side peels back on decoyFlip!

    var yM2 = -4, yM1 = -12 - foldAmt * 8, y0 = valleyY, yP1 = -12 - foldAmt * 8, yP2 = -4 - decoyFlip * 24;

    // Map drop shadow
    ctx.fillStyle = "rgba(6, 16, 18, 0.44)";
    ctx.beginPath();
    ctx.moveTo(xM2 + 6, -mapH * 0.5 + 10);
    ctx.lineTo(xP2 + 12, -mapH * 0.5 + 10);
    ctx.lineTo(xP2 + 12, mapH * 0.5 + 14);
    ctx.lineTo(xM2 + 6, mapH * 0.5 + 14);
    ctx.closePath();
    ctx.fill();

    // Helper to draw each accordion panel quad
    var panels = [
      { xA: xM2, yA: yM2, xB: xM1, yB: yM1, col: "#efe3c3" },
      { xA: xM1, yA: yM1, xB: x0,  yB: y0,  col: foldAmt > 0.4 ? "#cbb993" : "#e3d5b2" },
      { xA: x0,  yA: y0,  xB: xP1, yB: yP1, col: foldAmt > 0.4 ? "#c2af89" : "#dfd1ae" },
      { xA: xP1, yA: yP1, xB: xP2, yB: yP2, col: "#ece0bf" }
    ];

    for (var pi = 0; pi < 4; pi++) {
      var p = panels[pi];
      ctx.beginPath();
      ctx.moveTo(p.xA, -mapH * 0.5 + p.yA);
      ctx.lineTo(p.xB, -mapH * 0.5 + p.yB);
      ctx.lineTo(p.xB, mapH * 0.5 + p.yB);
      ctx.lineTo(p.xA, mapH * 0.5 + p.yA);
      ctx.closePath();
      ctx.fillStyle = p.col;
      ctx.fill();
      ctx.strokeStyle = "#3a2e1e";
      ctx.lineWidth = 1.9;
      ctx.stroke();

      // Topographic river lines & red survey contours inside each panel (no text letters!)
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = "rgba(92, 72, 44, 0.65)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(p.xA - 8, -58 + pi * 14);
      ctx.bezierCurveTo((p.xA + p.xB) * 0.5, -18, (p.xA + p.xB) * 0.5 - 8, 34, p.xB + 8, 68 - pi * 10);
      ctx.stroke();

      ctx.strokeStyle = "rgba(168, 64, 45, 0.48)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(p.xA, 28 - pi * 8);
      ctx.lineTo(p.xB, -24 + pi * 9);
      ctx.stroke();
      ctx.restore();
    }

    // ── Lécroart Folded-Seam Hidden Bear-Trap Jaws (emerges across seam when foldAmt > 0.45!) ──
    if (foldAmt > 0.42) {
      var trapAlpha = smooth(0.42, 0.72, foldAmt);
      ctx.save();
      ctx.globalAlpha = trapAlpha;
      var ty0 = 4;
      // Coiled steel trap spring & serrated jaws formed where outer panels meet!
      ctx.fillStyle = "#3e484a";
      ctx.strokeStyle = "#1a1f20";
      ctx.lineWidth = 2.0;
      // Upper & lower serrated jaw arcs snapping around center seam
      for (var sideJ = -1; sideJ <= 1; sideJ += 2) {
        ctx.beginPath();
        ctx.arc(0, ty0 + sideJ * 4, 34, sideJ < 0 ? Math.PI * 1.12 : Math.PI * 0.12, sideJ < 0 ? Math.PI * 1.88 : Math.PI * 0.88);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#3c4648";
        ctx.stroke();
        // Steel trap teeth
        ctx.fillStyle = "#dfe6e5";
        for (var ti = -3; ti <= 3; ti++) {
          var txp = ti * 8.5;
          var typ = ty0 + sideJ * (24 - Math.abs(ti) * 1.8);
          ctx.beginPath();
          ctx.moveTo(txp - 3.5, typ);
          ctx.lineTo(txp, typ - sideJ * 9);
          ctx.lineTo(txp + 3.5, typ);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#1a1f20";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
      // Red danger warning ring in survey ink
      ctx.strokeStyle = "rgba(186, 44, 34, 0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(0, ty0, 42, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Articulated Brass-Pinned Turkey Claw (Left) & Speckled Trout Fin-Hand (Right)
    var shakePump = shakeBeat * Math.sin(tl * 9.5) * 9;
    var recoilX = foldAmt > 0.6 ? Math.sin(tl * 22) * 1.5 + 8 : 0;

    // Left: Scaly Turkey Claw + Olive Twig
    ctx.save();
    ctx.translate(-98 - recoilX, -6 + shakePump);
    ctx.rotate(0.08 + shakePump * 0.008);

    // Feathered cuff
    ctx.fillStyle = "#6d452c";
    ctx.strokeStyle = "#1c130c";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-26, -24);
    ctx.lineTo(6, -12);
    ctx.lineTo(2, 12);
    ctx.lineTo(-28, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Scaly tarsus & clasping toes
    ctx.fillStyle = "#bfa074";
    ctx.beginPath();
    ctx.moveTo(2, -9);
    ctx.lineTo(74, -2);
    ctx.lineTo(98, 8);
    ctx.lineTo(94, 15);
    ctx.lineTo(72, 9);
    ctx.lineTo(88, 22);
    ctx.lineTo(82, 28);
    ctx.lineTo(64, 14);
    ctx.lineTo(54, 24);
    ctx.lineTo(48, 18);
    ctx.lineTo(0, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Curved black talons
    ctx.fillStyle = "#1f1b18";
    var talons = [[98, 11], [86, 25], [51, 22]];
    for (var tli = 0; tli < talons.length; tli++) {
      ctx.beginPath();
      ctx.arc(talons[tli][0], talons[tli][1], 4.2, 0, Math.PI * 1.2);
      ctx.fill();
    }
    // Brass split-pin joint at wrist
    ctx.fillStyle = "#e0be72";
    ctx.beginPath();
    ctx.arc(8, -1, 4.2, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Green Olive Twig offered by Turkey Claw in Act 2!
    if (oliveAmt > 0.05) {
      ctx.save();
      ctx.globalAlpha = oliveAmt;
      ctx.translate(82, 2);
      ctx.rotate(-0.35 + foldAmt * 0.2);
      ctx.strokeStyle = "#355c2d";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-12, 12);
      ctx.quadraticCurveTo(10, -8, 34, -24);
      ctx.stroke();
      var leaves = [[4, -2, -0.5], [14, -10, 0.6], [24, -18, -0.4], [30, -22, 0.5]];
      ctx.fillStyle = "#6ea352";
      for (var lvi = 0; lvi < leaves.length; lvi++) {
        ctx.save();
        ctx.translate(leaves[lvi][0], leaves[lvi][1]);
        ctx.rotate(leaves[lvi][2]);
        ctx.beginPath();
        ctx.ellipse(0, 0, 7.5, 3.4, 0, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#223b1d";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }
    ctx.restore();

    // Right: Speckled Trout Fin-Hand (folds back with the decoy board on decoyFlip!)
    if (decoyFlip < 0.75) {
      ctx.save();
      ctx.globalAlpha = 1 - smooth(0.45, 0.75, decoyFlip);
      ctx.translate(98 + recoilX - decoyFlip * 42, -4 + shakePump);
      ctx.rotate(-0.06 - shakePump * 0.008);

      // Dorsal/ventral fin crests on forearm
      ctx.fillStyle = "#7b9670";
      ctx.strokeStyle = "#1b261f";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-18, -12); ctx.quadraticCurveTo(4, -38, 22, -32); ctx.lineTo(18, -10);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-14, 12); ctx.quadraticCurveTo(6, 34, 20, 30); ctx.lineTo(14, 10);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Speckled fin-hand clasping center
      ctx.fillStyle = "#9ab28c";
      ctx.beginPath();
      ctx.moveTo(28, -16);
      ctx.lineTo(-68, -6);
      ctx.quadraticCurveTo(-96, -8, -98, 4);
      ctx.quadraticCurveTo(-94, 18, -68, 16);
      ctx.lineTo(28, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Spots & brass split-pin
      for (var fsi = 0; fsi < 7; fsi++) {
        ctx.fillStyle = "#2b3b2e";
        ctx.beginPath();
        ctx.arc(-28 + fsi * 8, -3 + (fsi % 2) * 6, 1.8, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = "#e0be72";
      ctx.beginPath();
      ctx.arc(12, -2, 4.2, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // ── Beat 3B (t=9.2s): Revealed Two-Sided Wooden Decoy Backside! ──
    if (decoyFlip > 0.12) {
      ctx.save();
      var da = smooth(0.12, 0.55, decoyFlip);
      ctx.globalAlpha = da;
      // Exposed backside of folded right half: wooden cross-battens, lead sinker & flat painted decoy cutout!
      var bx0 = xP2, bx1 = 122;
      ctx.beginPath();
      ctx.moveTo(bx0, -mapH * 0.5 + yP2);
      ctx.lineTo(bx1, -mapH * 0.5 + 10);
      ctx.lineTo(bx1, mapH * 0.5 + 10);
      ctx.lineTo(bx0, mapH * 0.5 + yP2);
      ctx.closePath();
      ctx.fillStyle = "#7a5b3b";
      ctx.fill();
      ctx.strokeStyle = "#23190f";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Pine cross-battens nailed to reverse
      ctx.fillStyle = "#9e784e";
      ctx.fillRect(bx0 + 8, -56, bx1 - bx0 - 16, 16);
      ctx.strokeRect(bx0 + 8, -56, bx1 - bx0 - 16, 16);
      ctx.fillRect(bx0 + 8, 42, bx1 - bx0 - 16, 16);
      ctx.strokeRect(bx0 + 8, 42, bx1 - bx0 - 16, 16);

      // Cardboard decoy turkey-head puppet mounted on spring wire on back of board!
      var dcx = (bx0 + bx1) * 0.5 + 6, dcy = -4 + Math.sin(tl * 8) * 3;
      ctx.strokeStyle = "#c8cfd0";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(dcx - 14, 42);
      ctx.quadraticCurveTo(dcx - 24, 18, dcx - 4, 8);
      ctx.stroke();

      ctx.fillStyle = "#c47a47";
      ctx.strokeStyle = "#23190f";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(dcx, dcy - 8, 19, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // Decoy beak & painted target X eye
      ctx.fillStyle = "#e5b45b";
      ctx.beginPath();
      ctx.moveTo(dcx + 16, dcy - 12);
      ctx.lineTo(dcx + 31, dcy - 7);
      ctx.lineTo(dcx + 16, dcy - 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#23190f";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(dcx + 2, dcy - 14); ctx.lineTo(dcx + 10, dcy - 6);
      ctx.moveTo(dcx + 10, dcy - 14); ctx.lineTo(dcx + 2, dcy - 6);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore(); // end map group

    // Optional interactive lamp cone + bubbles + Turkey glass reflection
    drawLampBeam(ctx, st, CX, CY, 190);
    drawRisingBubbles(ctx, 8, 370, tl, CX - 150, CX + 150, 0.6 + 0.8 * (1 - bal));
    applyMurkyDuskVeil(ctx, (1 - bal) * 0.25);
    drawTurkeyGlassReflection(ctx, st, { surprised: foldAmt > 0.55 ? 0.7 : 0 });
  }

  // =========================================================================
  // PORTHOLE #38 · VISOR — 1978 posterboard UFO chart with fin notes
  // Reference: Royal Robertson / Sufjan Stevens: Vesuvius
  // Turkey: "My sub's blueprint or butcher's diagram?" | Trout: "Prophesied wish-machine or overdue rental?"
  // Rule: Annotated Schematic (SCION 25) | Default Tool: lamp
  // =========================================================================
  function renderP38(ctx, st) {
    var tl = st.tl;
    var camY = st.ballastAmt * 20;

    // 0. Deep turquoise creek water
    var wGrad = ctx.createLinearGradient(CX, CY - R_GLASS, CX, CY + R_GLASS);
    wGrad.addColorStop(0, "#388488");
    wGrad.addColorStop(0.55, "#1f595e");
    wGrad.addColorStop(1, "#123438");
    ctx.fillStyle = wGrad;
    ctx.fillRect(CX - R_GLASS, CY - R_GLASS, R_GLASS * 2, R_GLASS * 2);

    // Acting Beats
    var isTurkey = st.pass === "turkey";
    var isTrout = st.pass === "trout";

    // Beat 2A: Sub blueprint (cyan dorsal-fin & propeller callouts) | Beat 2B (covers t=4.0s!): Butcher's diagram!
    var blueprintAmt = isTurkey ? smooth(2.0, 2.45, tl) : (isTrout ? 0.25 : 0);
    var butcherAmt = isTurkey ? (st.viewMode === "turkey" ? 0.5 + 0.5 * Math.sin(tl * 1.9) : smooth(3.4, 3.88, tl)) : 0;

    // Beat 3A (covers t=6.8s!): Prophesied wish-machine | Beat 3B (covers t=9.2s!): Overdue rental meter!
    var wishBeat = isTrout ? (st.viewMode === "trout" ? band(0, 0.4, 4.6, 5.2, tl % 10) : band(5.6, 6.05, 7.45, 7.95, tl)) : 0;
    var rentalBeat = isTrout ? (st.viewMode === "trout" ? smooth(4.8, 5.5, tl % 10) : smooth(7.55, 8.35, tl)) : 0;

    ctx.save();
    ctx.translate(0, camY);

    // 1. Submerged Wooden Frame with Verdigris Copper Corner Brackets
    var fw = 228, fh = 228;
    var fx = CX - fw * 0.5 - 10, fy = CY - fh * 0.5 + 2;

    // Easel stilts below frame
    ctx.fillStyle = "#5c4934";
    ctx.strokeStyle = "#1c150e";
    ctx.lineWidth = 2;
    ctx.fillRect(fx + 14, fy + fh - 4, 18, 60);
    ctx.strokeRect(fx + 14, fy + fh - 4, 18, 60);
    ctx.fillRect(fx + fw - 32, fy + fh - 4, 18, 60);
    ctx.strokeRect(fx + fw - 32, fy + fh - 4, 18, 60);

    // Oak frame
    ctx.fillStyle = "#7c6346";
    ctx.fillRect(fx, fy, fw, fh);
    ctx.strokeRect(fx, fy, fw, fh);

    // Verdigris copper L-brackets on all 4 corners
    var corners = [[fx, fy, 1, 1], [fx + fw, fy, -1, 1], [fx, fy + fh, 1, -1], [fx + fw, fy + fh, -1, -1]];
    ctx.fillStyle = "#5f9c8e";
    for (var ci = 0; ci < 4; ci++) {
      var c = corners[ci];
      ctx.beginPath();
      ctx.moveTo(c[0], c[1]);
      ctx.lineTo(c[0] + c[2] * 42, c[1]);
      ctx.lineTo(c[0] + c[2] * 42, c[1] + c[3] * 16);
      ctx.lineTo(c[0] + c[2] * 16, c[1] + c[3] * 16);
      ctx.lineTo(c[0] + c[2] * 16, c[1] + c[3] * 42);
      ctx.lineTo(c[0], c[1] + c[3] * 42);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 2. 1978 Cream Posterboard Chart
    var px = fx + 18, py = fy + 18, pw = fw - 36, ph = fh - 36;
    var pGrad = ctx.createRadialGradient(px + pw * 0.5, py + ph * 0.5, 10, px + pw * 0.5, py + ph * 0.5, 130);
    pGrad.addColorStop(0, "#f8f3e3");
    pGrad.addColorStop(1, "#e5dcc5");
    ctx.fillStyle = pGrad;
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = "#2b251c";
    ctx.lineWidth = 1.8;
    ctx.strokeRect(px, py, pw, ph);

    var scx = px + pw * 0.5, scy = py + ph * 0.5;

    // Compass-drawn dashed circles & Royal Robertson marker rays
    ctx.save();
    ctx.strokeStyle = "rgba(42, 48, 56, 0.55)";
    ctx.lineWidth = 1.3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(scx, scy, 68, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(scx, scy, 82, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);

    // Radiating Royal Robertson colored ballpoint/marker arrows (12 rays)
    var rayCols = ["#2c7bb6", "#d73027", "#2b8cbe", "#4daf4a", "#d73027", "#2c7bb6"];
    for (var ri = 0; ri < 12; ri++) {
      var ra = (ri / 12) * TAU - Math.PI * 0.5 + Math.sin(tl * 1.4 + ri) * 0.015;
      var rLen = 78 + (ri % 2) * 8;
      ctx.strokeStyle = rayCols[ri % rayCols.length];
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(scx + Math.cos(ra) * 32, scy + Math.sin(ra) * 20);
      ctx.lineTo(scx + Math.cos(ra) * rLen, scy + Math.sin(ra) * rLen);
      ctx.stroke();
      // Arrowhead
      var ax = scx + Math.cos(ra) * rLen, ay = scy + Math.sin(ra) * rLen;
      ctx.beginPath();
      ctx.moveTo(ax + Math.cos(ra - 2.6) * 6, ay + Math.sin(ra - 2.6) * 6);
      ctx.lineTo(ax, ay);
      ctx.lineTo(ax + Math.cos(ra + 2.6) * 6, ay + Math.sin(ra + 2.6) * 6);
      ctx.stroke();
    }

    // 4 Corner astrolabe/crosshair glyphs
    var gOffs = [[-68, -68], [68, -68], [-68, 68], [68, 68]];
    ctx.strokeStyle = "#26231e";
    ctx.lineWidth = 1.4;
    for (var gi = 0; gi < 4; gi++) {
      var gx = scx + gOffs[gi][0], gy = scy + gOffs[gi][1];
      ctx.beginPath();
      ctx.arc(gx, gy, 11, 0, TAU);
      ctx.moveTo(gx - 15, gy); ctx.lineTo(gx + 15, gy);
      ctx.moveTo(gx, gy - 15); ctx.lineTo(gx, gy + 15);
      ctx.stroke();
    }
    ctx.restore();

    // ── Beat 3A (t=6.8s): Prophesied Wish-Machine Celestial Halos! ──
    if (wishBeat > 0.05) {
      ctx.save();
      ctx.globalAlpha = wishBeat;
      for (var hi = 0; hi < 3; hi++) {
        var hr = 46 + hi * 22 + ((tl * 26) % 22);
        ctx.strokeStyle = hi % 2 === 0 ? "rgba(255, 206, 86, 0.85)" : "rgba(218, 72, 146, 0.72)";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(scx, scy - 4, hr, 0, TAU);
        ctx.stroke();
      }
      // 8-pointed golden prophecy stars orbiting saucer
      for (var stI = 0; stI < 5; stI++) {
        var sa = tl * 1.4 + stI * (TAU / 5);
        var sx = scx + Math.cos(sa) * 74, sy = scy + Math.sin(sa) * 58;
        ctx.fillStyle = "#ffe074";
        ctx.beginPath();
        ctx.moveTo(sx, sy - 8); ctx.lineTo(sx + 2.2, sy - 2.2);
        ctx.lineTo(sx + 8, sy); ctx.lineTo(sx + 2.2, sy + 2.2);
        ctx.lineTo(sx, sy + 8); ctx.lineTo(sx - 2.2, sy + 2.2);
        ctx.lineTo(sx - 8, sy); ctx.lineTo(sx - 2.2, sy - 2.2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 3. Central Articulated Brass UFO / Sub Saucer Rig
    ctx.save();
    ctx.translate(scx, scy + Math.sin(tl * 2.5) * 2.5);

    // Blueprint dorsal fin & tail propeller extensions (emerge on blueprintAmt!)
    if (blueprintAmt > 0.05) {
      ctx.save();
      ctx.globalAlpha = blueprintAmt;
      // Cobalt blueprint dorsal fin & aft propeller schematic attached to left half!
      ctx.fillStyle = "rgba(43, 140, 190, 0.25)";
      ctx.strokeStyle = "#19679c";
      ctx.lineWidth = 2.2;
      // Dorsal fin
      ctx.beginPath();
      ctx.moveTo(-24, -18);
      ctx.quadraticCurveTo(-18, -46, -2, -42);
      ctx.lineTo(4, -20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Spinning tail propeller on left tip
      var propSpin = Math.sin(tl * 16) * 14;
      ctx.beginPath();
      ctx.ellipse(-74, 2, 4, Math.abs(propSpin) + 3, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // Miniature sub-porthole circle matching our sub!
      ctx.beginPath();
      ctx.arc(-28, 2, 9, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // Main lenticular brass saucer body
    var sGrad = ctx.createLinearGradient(-68, -16, 68, 20);
    sGrad.addColorStop(0, "#9e7b3e");
    sGrad.addColorStop(0.45, "#ecd28b");
    sGrad.addColorStop(1, "#7c5c28");
    ctx.fillStyle = sGrad;
    ctx.strokeStyle = "#231a0d";
    ctx.lineWidth = 2.2;

    // Lower dish
    ctx.beginPath();
    ctx.ellipse(0, 8, 52, 14, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    // Wide saucer rim
    ctx.beginPath();
    ctx.moveTo(-68, 2);
    ctx.quadraticCurveTo(0, -18, 68, 2);
    ctx.quadraticCurveTo(0, 22, -68, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rivet panel seams
    ctx.strokeStyle = "rgba(42, 30, 12, 0.65)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-22, -8); ctx.lineTo(-32, 10);
    ctx.moveTo(0, -10);  ctx.lineTo(0, 12);
    ctx.moveTo(22, -8);  ctx.lineTo(32, 10);
    ctx.stroke();

    // Domed cupola & blinking antenna spire
    ctx.fillStyle = "#dfc076";
    ctx.strokeStyle = "#231a0d";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, -8, 24, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(0, -45);
    ctx.stroke();
    ctx.fillStyle = (wishBeat > 0.2 || Math.sin(tl * 8) > 0) ? "#ffdf6e" : "#b88f44";
    ctx.beginPath();
    ctx.arc(0, -47, 3.8, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // ── Beat 2B (covers t=4.0s!): Crimson Butcher's Carving Diagram + Roast Thermometer! ──
    if (butcherAmt > 0.08) {
      ctx.save();
      ctx.globalAlpha = butcherAmt;
      // Dashed crimson butcher primal-cut seams across right side + drumstick silhouette & thermometer!
      ctx.strokeStyle = "#c92a2a";
      ctx.lineWidth = 2.6;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(4, -30); ctx.lineTo(4, 24);
      ctx.moveTo(4, 0);   ctx.lineTo(64, -4);
      ctx.moveTo(26, -12); ctx.quadraticCurveTo(38, 4, 24, 18);
      ctx.stroke();
      ctx.setLineDash([]);

      // Drawn drumstick / roast leg icon + carving fork & red mercury thermometer on right side!
      ctx.fillStyle = "rgba(217, 72, 48, 0.24)";
      ctx.strokeStyle = "#b82520";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(42, -38, 13, 8, -0.35, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // White bone end of drumstick!
      ctx.fillStyle = "#faf6ea";
      ctx.beginPath();
      ctx.moveTo(52, -42); ctx.lineTo(63, -47);
      ctx.strokeStyle = "#b82520";
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(64, -49, 2.8, 0, TAU);
      ctx.arc(66, -45, 2.8, 0, TAU);
      ctx.fill(); ctx.stroke();

      // Pop-up meat thermometer gauge on right lower quadrant
      ctx.fillStyle = "#fff8eb";
      ctx.strokeStyle = "#b82520";
      ctx.lineWidth = 1.8;
      roundedRectPath(ctx, 48, 22, 10, 34, 5);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#d92b2b";
      ctx.beginPath();
      ctx.arc(53, 52, 6.5, 0, TAU);
      ctx.fill(); ctx.stroke();
      var mercH = 12 + 12 * butcherAmt;
      ctx.fillRect(51, 50 - mercH, 4, mercH);
      ctx.restore();
    }

    ctx.restore(); // end saucer

    // ── Beat 3B (t=9.2s): Hinged Overdue Rental Stopwatch / Parking Meter Tag! ──
    if (rentalBeat > 0.08) {
      ctx.save();
      var tagSwing = lerp(-1.2, 0.06 + Math.sin(tl * 9) * 0.04, rentalBeat);
      ctx.translate(px + pw - 8, py + ph * 0.56);
      ctx.rotate(tagSwing);

      // Brass chain link
      ctx.strokeStyle = "#d4af64";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(-12, 16);
      ctx.stroke();

      // Red-and-cream Overdue Parking/Rental Meter Dial (pure visual icon—no text letters!)
      ctx.fillStyle = "#f7eed8";
      ctx.strokeStyle = "#231912";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(-18, 38, 25, Math.PI, 0);
      ctx.lineTo(7, 68);
      ctx.lineTo(-43, 68);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Red EXPIRED half-sector inside meter window
      ctx.fillStyle = "#d6332c";
      ctx.beginPath();
      ctx.moveTo(-18, 42);
      ctx.arc(-18, 42, 18, Math.PI, 0);
      ctx.closePath();
      ctx.fill();

      // Ticking meter needle slamming into red!
      var mNeedle = -0.35 + Math.sin(tl * 18) * 0.08;
      ctx.strokeStyle = "#fff8eb";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-18, 42);
      ctx.lineTo(-18 + Math.cos(mNeedle) * 15, 42 + Math.sin(mNeedle) * 15);
      ctx.stroke();

      // Coin slot & hourglass icon on meter base
      ctx.fillStyle = "#231912";
      ctx.fillRect(-29, 50, 4, 12);
      ctx.strokeStyle = "#b82520";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-12, 49); ctx.lineTo(-4, 49); ctx.lineTo(-12, 61); ctx.lineTo(-4, 61); ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // 4. Articulated Spotted Brook Trout in Act 3
    if (isTrout) {
      var enter38 = st.viewMode === "trout" ? 1 : smooth(5.6, 6.3, tl);
      var tx38 = lerp(CX + 235, CX + 132 - wishBeat * 14 + rentalBeat * 6, enter38);
      var ty38 = CY - 8 + rentalBeat * 44 + Math.sin(tl * 2.7) * 4;
      drawBrookTrout(ctx, {
        x: tx38,
        y: ty38,
        scale: 0.88,
        pitch: rentalBeat * 0.16 - wishBeat * 0.08,
        t: tl,
        speed: 1.0,
        mouthOpen: rentalBeat * 0.35,
        finReach: wishBeat * 0.85
      });
    }

    ctx.restore(); // end camY

    drawLampBeam(ctx, st, CX - 8, CY + 4, 200);
    drawRisingBubbles(ctx, 10, 380, tl, CX + 95, CX + 168, 1.0);
    applyMurkyDuskVeil(ctx, (1 - st.lampAmt) * 0.70);
    drawTurkeyGlassReflection(ctx, st, { surprised: butcherAmt * 0.9 });
  }

  // =========================================================================
  // PORTHOLE #39 · PARLOR — Wallpapered sunken living room with lamp
  // Reference: Radiohead: Pyramid Song (Shynola, 2001)
  // Turkey: "Grandma's dry parlor or mirage?" | Trout: "Goldfish bowl on the rug or vacuum cleaner?"
  // Rule: Drowned Domesticity (SCION 20) | Default Tool: ballast
  // =========================================================================
  function renderP39(ctx, st) {
    var tl = st.tl;
    var bal = st.ballastAmt; // 0 at t=0.8s (high near ceiling molding!), 1 at t=1.8s (settled at parlor rug/chair!)
    var roomShiftY = (1 - bal) * 92; // camera starts high near ceiling -> sinks down as ballast engages!

    var isTurkey = st.pass === "turkey";
    var isTrout = st.pass === "trout";

    // Beat 2A (2.0..3.6s): Cozy dry parlor lamp ON | Beat 2B (3.6..5.6s, covers t=4.0s!): Underwater Mirage wave!
    var parlorLampOn = (tl >= 2.05 || st.lampAmt > 0.5 || st.viewMode === "turkey" || st.viewMode === "trout") ? smooth(2.0, 2.35, Math.max(tl, st.viewMode !== "auto" ? 3 : 0)) : 0;
    var mirageAmt = isTurkey ? (st.viewMode === "turkey" ? 0.5 + 0.5 * Math.sin(tl * 1.7) : smooth(3.45, 3.9, tl)) : 0;

    // Beat 3A (covers t=6.8s!): Goldfish bowl on rug | Beat 3B (covers t=9.2s!): Vacuum cleaner sucking rug!
    var bowlBeat = isTrout ? (st.viewMode === "trout" ? band(0, 0.4, 4.6, 5.2, tl % 10) : band(5.6, 6.05, 7.5, 7.95, tl)) : 0;
    var vacuumBeat = isTrout ? (st.viewMode === "trout" ? smooth(4.8, 5.5, tl % 10) : smooth(7.65, 8.45, tl)) : 0;

    ctx.save();
    ctx.translate(0, roomShiftY);

    // 0. Sunken Floral Damask Wallpaper Back Wall
    var wallGrad = ctx.createLinearGradient(CX, CY - 260, CX, CY + 110);
    wallGrad.addColorStop(0, "#3a898b");
    wallGrad.addColorStop(0.65, "#2b6f72");
    wallGrad.addColorStop(1, "#1e5154");
    ctx.fillStyle = wallGrad;
    ctx.fillRect(CX - R_GLASS - 10, CY - 280, R_GLASS * 2 + 20, 380);

    // Handmade vertical floral damask vine & blossom columns (warping gently on mirageAmt!)
    for (var vx = CX - 148; vx <= CX + 156; vx += 60) {
      ctx.strokeStyle = "rgba(26, 72, 74, 0.52)";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      for (var vy = CY - 250; vy <= CY + 85; vy += 18) {
        var warp = Math.sin(vy * 0.05 + tl * 3.0) * (2 + mirageAmt * 8);
        if (vy === CY - 250) ctx.moveTo(vx + warp, vy);
        else ctx.lineTo(vx + warp, vy);
      }
      ctx.stroke();

      // Muted rose blossoms along vine
      for (var by = CY - 210; by <= CY + 60; by += 68) {
        var bwarp = Math.sin(by * 0.05 + tl * 3.0) * (2 + mirageAmt * 8);
        ctx.fillStyle = "rgba(182, 138, 128, 0.42)";
        ctx.beginPath();
        ctx.arc(vx + bwarp, by, 7.5, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(222, 186, 152, 0.45)";
        ctx.beginPath();
        ctx.arc(vx + bwarp, by, 3.2, 0, TAU);
        ctx.fill();
      }
    }

    // Peeling wet ceiling wallpaper curl (prominent at t=0.8s when sub is high, plus peels further on mirage!)
    ctx.fillStyle = "#d9d0b8";
    ctx.strokeStyle = "#1c383a";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(CX - 90, CY - 220);
    ctx.lineTo(CX - 18, CY - 220);
    ctx.quadraticCurveTo(CX - 34, CY - 182 + mirageAmt * 18, CX - 68, CY - 176 + mirageAmt * 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Baseboard & Perspective Timber Floorboards
    var floorY = CY + 86;
    ctx.fillStyle = "#2d5554";
    ctx.fillRect(CX - 200, floorY - 12, 400, 12);
    ctx.strokeStyle = "#152b2b";
    ctx.lineWidth = 1.8;
    ctx.strokeRect(CX - 200, floorY - 12, 400, 12);

    ctx.fillStyle = "#48594e";
    ctx.fillRect(CX - 200, floorY, 400, 140);
    ctx.strokeStyle = "rgba(20, 34, 30, 0.65)";
    for (var pi = -6; pi <= 6; pi++) {
      ctx.beginPath();
      ctx.moveTo(CX + pi * 26, floorY);
      ctx.lineTo(CX + pi * 42, floorY + 130);
      ctx.stroke();
    }

    // 1. Warm Parlor Floor Lamp Light Pool (when parlorLampOn > 0)
    var lx = CX + 64, lyBase = floorY + 8;
    if (parlorLampOn > 0.05) {
      ctx.save();
      var cone = ctx.createRadialGradient(lx, CY - 78, 12, lx - 10, CY + 24, 155);
      cone.addColorStop(0, "rgba(255, 224, 148, " + (0.68 * parlorLampOn) + ")");
      cone.addColorStop(0.5, "rgba(238, 186, 108, " + (0.28 * parlorLampOn) + ")");
      cone.addColorStop(1, "rgba(238, 186, 108, 0)");
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(lx - 34, CY - 84);
      ctx.lineTo(lx + 34, CY - 84);
      ctx.lineTo(lx + 108, floorY + 48);
      ctx.lineTo(lx - 135, floorY + 48);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 2. Deformable Patterned Persian Rug (undulates on mirageAmt; right corner SUCKED UP on vacuumBeat!)
    ctx.save();
    var rugWave = mirageAmt * Math.sin(tl * 4.5) * 9;
    var vacLiftX = -vacuumBeat * 38;
    var vacLiftY = -vacuumBeat * 72; // corner lifts sharply toward sub intake!
    ctx.beginPath();
    ctx.moveTo(CX - 118, floorY + 16);
    ctx.quadraticCurveTo(CX, floorY + 14 + rugWave, CX + 96 + vacLiftX * 0.4, floorY + 16 + vacLiftY * 0.45);
    ctx.lineTo(CX + 128 + vacLiftX, floorY + 58 + vacLiftY);
    ctx.quadraticCurveTo(CX, floorY + 60 - rugWave, CX - 144, floorY + 58);
    ctx.closePath();
    ctx.fillStyle = "#ccb584";
    ctx.fill();
    ctx.strokeStyle = "#2b2318";
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Inner Persian medallion border
    ctx.strokeStyle = "#8a4233";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(CX - 8 + vacLiftX * 0.25, floorY + 37 + vacLiftY * 0.25 + rugWave * 0.5, 74, 13, -vacuumBeat * 0.18, 0, TAU);
    ctx.stroke();

    // Rug fringe tassels along right edge (streaming toward intake on vacuumBeat!)
    ctx.strokeStyle = "#e8dcc0";
    ctx.lineWidth = 1.6;
    for (var fi = 0; fi < 7; fi++) {
      var fu = fi / 6;
      var rfx = lerp(CX + 96 + vacLiftX * 0.4, CX + 128 + vacLiftX, fu);
      var rfy = lerp(floorY + 16 + vacLiftY * 0.45, floorY + 58 + vacLiftY, fu);
      ctx.beginPath();
      ctx.moveTo(rfx, rfy);
      ctx.lineTo(rfx + 11 - vacuumBeat * 18, rfy - vacuumBeat * 12);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Tall Brass Parchment Floor Lamp with Beaded Fringe & Pull-Chain
    ctx.save();
    // Base & turned brass pole
    ctx.fillStyle = "#8a7c58";
    ctx.strokeStyle = "#1e1c14";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(lx, lyBase, 24, 6.5, 0, 0, TAU);
    ctx.fill(); ctx.stroke();

    ctx.fillRect(lx - 3, CY - 84, 6, lyBase - (CY - 84));
    ctx.strokeRect(lx - 3, CY - 84, 6, lyBase - (CY - 84));

    // Swaying pull-chain
    var chainSway = Math.sin(tl * 3.8) * 4;
    ctx.strokeStyle = "#e2c378";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(lx - 10, CY - 78);
    ctx.quadraticCurveTo(lx - 12 + chainSway, CY - 58, lx - 10 + chainSway * 1.4, CY - 44);
    ctx.stroke();
    ctx.fillStyle = "#ffd980";
    ctx.beginPath();
    ctx.arc(lx - 10 + chainSway * 1.4, CY - 42, 2.8, 0, TAU);
    ctx.fill();

    // Scalloped parchment lampshade + swaying fringe
    var shadeGrad = ctx.createLinearGradient(lx, CY - 148, lx, CY - 78);
    shadeGrad.addColorStop(0, parlorLampOn > 0.3 ? "#ffe7a8" : "#9c947c");
    shadeGrad.addColorStop(0.6, parlorLampOn > 0.3 ? "#ffd078" : "#857d66");
    shadeGrad.addColorStop(1, parlorLampOn > 0.3 ? "#e0a558" : "#6c6552");
    ctx.fillStyle = shadeGrad;
    ctx.strokeStyle = "#261f14";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(lx - 24, CY - 146);
    ctx.lineTo(lx + 24, CY - 146);
    ctx.quadraticCurveTo(lx + 30, CY - 108, lx + 42, CY - 82);
    ctx.lineTo(lx - 42, CY - 82);
    ctx.quadraticCurveTo(lx - 30, CY - 108, lx - 24, CY - 146);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Beaded fringe along shade rim
    ctx.strokeStyle = parlorLampOn > 0.3 ? "#c98b44" : "#595241";
    ctx.lineWidth = 1.4;
    for (var sfi = -40; sfi <= 40; sfi += 5) {
      var fWave = Math.sin(tl * 3.4 + sfi * 0.2) * (1.5 + mirageAmt * 2.5);
      ctx.beginPath();
      ctx.moveTo(lx + sfi, CY - 82);
      ctx.lineTo(lx + sfi + fWave, CY - 71);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Diamond-Tufted Emerald Wingback Armchair + Hovering Porcelain Teacup!
    ctx.save();
    var chX = CX - 56, chY = CY + 24;
    // Cabriole legs
    ctx.fillStyle = "#3a291c";
    ctx.strokeStyle = "#17110c";
    ctx.lineWidth = 2;
    ctx.fillRect(chX - 48, chY + 56, 9, 22);
    ctx.fillRect(chX + 42, chY + 52, 9, 20);
    ctx.fillRect(chX - 18, chY + 62, 10, 22);

    // Backrest & wings
    ctx.fillStyle = "#3c7c66";
    ctx.strokeStyle = "#162d25";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(chX - 66, chY - 58);
    ctx.quadraticCurveTo(chX - 12, chY - 72, chX + 42, chY - 56);
    ctx.lineTo(chX + 46, chY + 16);
    ctx.lineTo(chX - 52, chY + 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tufted cushion buttons (+ rising cushion bubbles during mirageAmt!)
    var tufts = [[-32, -36], [-8, -38], [16, -34], [-22, -14], [4, -15]];
    for (var tfi = 0; tfi < tufts.length; tfi++) {
      var bx = chX + tufts[tfi][0], by = chY + tufts[tfi][1];
      ctx.fillStyle = "#1e4437";
      ctx.beginPath();
      ctx.arc(bx, by, 2.8, 0, TAU);
      ctx.fill();
      if (mirageAmt > 0.15) {
        var bubUp = ((tl * 38 + tfi * 19) % 72);
        ctx.strokeStyle = "rgba(220, 250, 246, " + (mirageAmt * (1 - bubUp / 72)) + ")";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(bx + Math.sin(tl * 4 + tfi) * 4, by - bubUp, 2.6, 0, TAU);
        ctx.stroke();
      }
    }

    // Seat cushion & rolled armrests
    ctx.fillStyle = "#488f76";
    roundedRectPath(ctx, chX - 38, chY + 12, 86, 26, 6);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#336d59";
    roundedRectPath(ctx, chX - 60, chY + 2, 34, 54, 12);
    ctx.fill(); ctx.stroke();
    roundedRectPath(ctx, chX + 32, chY + 2, 30, 50, 11);
    ctx.fill(); ctx.stroke();

    // Porcelain Teacup & Saucer (rests calmly in Beat 2A, floats & tilts upward in Mirage Beat 2B!)
    var cupFloatY = mirageAmt * (26 + Math.sin(tl * 3.2) * 8);
    var cupTilt = mirageAmt * 0.28;
    ctx.save();
    ctx.translate(chX + 47, chY - 3 - cupFloatY);
    ctx.rotate(cupTilt);
    // Saucer
    ctx.fillStyle = "#f7f2e4";
    ctx.strokeStyle = "#262018";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 4, 13, 3.6, 0, 0, TAU);
    ctx.fill(); ctx.stroke();
    // Cup
    ctx.beginPath();
    ctx.moveTo(-8, -6); ctx.lineTo(8, -6);
    ctx.quadraticCurveTo(7, 4, 0, 4);
    ctx.quadraticCurveTo(-7, 4, -8, -6);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.arc(8.5, -1.5, 3.4, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();
    ctx.restore();
    ctx.restore(); // end chair

    // Mirage Ondes-Martenot Sine Caustic Wave Bands across Parlor (t=4.0s!)
    if (mirageAmt > 0.1) {
      ctx.save();
      ctx.globalAlpha = mirageAmt * 0.55;
      ctx.strokeStyle = "#b8f2ea";
      ctx.lineWidth = 2.4;
      for (var mw = -2; mw <= 2; mw++) {
        ctx.beginPath();
        for (var mx = CX - 180; mx <= CX + 180; mx += 16) {
          var my = CY + mw * 36 + Math.sin(mx * 0.045 - tl * 4.2 + mw) * 11;
          if (mx === CX - 180) ctx.moveTo(mx, my);
          else ctx.lineTo(mx, my);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. Articulated Spotted Brook Trout in Act 3
    if (isTrout) {
      var enter39 = st.viewMode === "trout" ? 1 : smooth(5.6, 6.35, tl);
      var tapNudge = bowlBeat * Math.max(0, Math.sin(tl * 6.4)) * 10;
      var tx39 = lerp(CX + 230, CX + 116 - tapNudge + vacuumBeat * 14, enter39);
      var ty39 = CY - 2 - vacuumBeat * 22 + Math.sin(tl * 2.5) * 4;
      drawBrookTrout(ctx, {
        x: tx39,
        y: ty39,
        scale: 0.90,
        pitch: vacuumBeat * -0.22,
        t: tl,
        speed: vacuumBeat > 0.3 ? 1.6 : 0.95,
        mouthOpen: bowlBeat * 0.3 + vacuumBeat * 0.35
      });

      // Beat 3A (t=6.8s): Goldfish-bowl glass tap ripples + golden pet fish-flakes drifting!
      if (bowlBeat > 0.1) {
        ctx.save();
        ctx.globalAlpha = bowlBeat;
        var tapR = 8 + ((tl * 38) % 34);
        ctx.strokeStyle = "rgba(255, 244, 200, " + (1 - tapR / 42) + ")";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(CX + 46, CY + 2, tapR, 0, TAU);
        ctx.stroke();
        // Curved goldfish-bowl water-meniscus arc & falling golden flakes!
        ctx.strokeStyle = "rgba(255, 224, 150, 0.52)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(CX - 158, CY - 78);
        ctx.quadraticCurveTo(CX, CY - 66 + Math.sin(tl * 3) * 4, CX + 158, CY - 78);
        ctx.stroke();
        for (var fli = 0; fli < 8; fli++) {
          var flx = CX - 60 + fli * 18 + Math.sin(tl * 2 + fli) * 5;
          var fly = CY - 70 + ((tl * 22 + fli * 17) % 120);
          ctx.fillStyle = fli % 2 === 0 ? "#f2b84b" : "#df6e46";
          ctx.fillRect(flx, fly, 4.5, 3);
        }
        ctx.restore();
      }

      // Beat 3B (t=9.2s): Vacuum-cleaner suction streamlines pulling rug & dust bunnies into lower rim!
      if (vacuumBeat > 0.1) {
        ctx.save();
        ctx.globalAlpha = vacuumBeat * 0.85;
        var vx0 = CX + 12, vy0 = CY + 168;
        for (var vs = 0; vs < 7; vs++) {
          var uVac = ((tl * 2.2 + vs * 0.14) % 1);
          var sx0 = CX + 115 - vs * 22, sy0 = floorY + 28;
          var pxV = lerp(sx0, vx0, uVac);
          var pyV = lerp(sy0, vy0, uVac * uVac);
          ctx.strokeStyle = "rgba(235, 248, 244, 0.65)";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(pxV, pyV);
          ctx.lineTo(lerp(sx0, vx0, Math.min(1, uVac + 0.16)), lerp(sy0, vy0, Math.pow(Math.min(1, uVac + 0.16), 2)));
          ctx.stroke();
          ctx.fillStyle = "rgba(220, 212, 192, 0.78)";
          ctx.beginPath();
          ctx.arc(pxV, pyV, 2.8, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    ctx.restore(); // end roomShiftY

    drawLampBeam(ctx, st, CX + 20, CY + 10, 195);
    drawRisingBubbles(ctx, 8, 390, tl, CX - 145, CX + 135, 0.8);
    applyMurkyDuskVeil(ctx, (1 - bal) * 0.34);
    drawTurkeyGlassReflection(ctx, st, {
      prominentInTrout: bowlBeat > 0.2,
      bobY: bowlBeat * Math.sin(tl * 4) * 6,
      surprised: mirageAmt * 0.5 + vacuumBeat * 0.4
    });
  }

  // =========================================================================
  // PORTHOLE #40 · REEF — Reel-to-reel tape reef & sugar-cube towers
  // Reference: Modest Mouse: Dashboard (2007)
  // Turkey: "Cranberry ribbon or propeller snare?" | Trout: "Rolling jukebox speaker or wire-chewer?"
  // Rule: Reverse Tape Score (Outrapo) | Default Tool: lamp
  // =========================================================================
  function renderP40(ctx, st) {
    var tl = st.tl;
    var camY = st.ballastAmt * 20;

    var isTurkey = st.pass === "turkey";
    var isTrout = st.pass === "trout";

    // Beat 2A (2.0..3.5s): Forward Cranberry Ribbon | Beat 2B (3.5..5.6s, covers t=4.0s!): Outrapo REVERSE Propeller Snare!
    var cranberryBeat = isTurkey ? band(2.0, 2.35, 3.45, 3.9, tl) : 0;
    var reverseSnare = isTurkey ? (st.viewMode === "turkey" ? 0.5 - 0.5 * Math.cos(tl * 1.9) : smooth(3.45, 3.85, tl)) : 0;

    // Beat 3A (covers t=6.8s!): Rolling jukebox speaker | Beat 3B (covers t=9.2s!): Wire-chewer!
    var jukeboxBeat = isTrout ? (st.viewMode === "trout" ? band(0, 0.4, 4.6, 5.2, tl % 10) : band(5.6, 6.05, 7.5, 7.95, tl)) : 0;
    var chewerBeat = isTrout ? (st.viewMode === "trout" ? smooth(4.8, 5.5, tl % 10) : smooth(7.65, 8.35, tl)) : 0;

    // 0. Turquoise Reef Water + Emerald Dashboard Glow
    var wGrad = ctx.createLinearGradient(CX, CY - R_GLASS, CX, CY + R_GLASS);
    wGrad.addColorStop(0, "#469896");
    wGrad.addColorStop(0.58, "#26686b");
    wGrad.addColorStop(1, "#163b3e");
    ctx.fillStyle = wGrad;
    ctx.fillRect(CX - R_GLASS, CY - R_GLASS, R_GLASS * 2, R_GLASS * 2);

    ctx.save();
    ctx.translate(0, camY);

    // Background swaying dark kelp-tape ribbons
    for (var ki = 0; ki < 6; ki++) {
      var kx = CX - 145 + ki * 56;
      var kSway = Math.sin(tl * (reverseSnare > 0.4 ? -4.2 : 2.2) + ki) * 14;
      ctx.strokeStyle = "rgba(42, 34, 28, 0.42)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(kx, CY + 140);
      ctx.bezierCurveTo(kx - 16, CY + 40, kx + kSway, CY - 50, kx - kSway * 0.8, CY - 165);
      ctx.stroke();
    }

    // 1. Multiplane Crystalline Sugar-Cube Towers (5 towers, backlit warm white when lamp is ON!)
    function drawSugarTower(tx, baseY, cubes) {
      for (var ci = 0; ci < cubes.length; ci++) {
        var c = cubes[ci]; // [dx, w, h]
        var cx0 = tx + c[0] - c[1] * 0.5;
        var cy0 = baseY - c[2];
        baseY = cy0 + 2;

        // 3D cube front & right bevel
        ctx.fillStyle = st.lampAmt > 0.3 ? "#f6f7f2" : "#b9cfcc";
        ctx.strokeStyle = "#223636";
        ctx.lineWidth = 1.8;
        roundedRectPath(ctx, cx0, cy0, c[1] * 0.74, c[2], 3);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = st.lampAmt > 0.3 ? "#d7e6e1" : "#90afac";
        roundedRectPath(ctx, cx0 + c[1] * 0.70, cy0 + 2, c[1] * 0.30, c[2] - 2, 2);
        ctx.fill();
        ctx.stroke();

        // Dissolving sugar crystal pitting dots
        ctx.fillStyle = "rgba(46, 78, 76, 0.45)";
        for (var pi = 0; pi < 4; pi++) {
          ctx.fillRect(cx0 + 5 + ((ci * 11 + pi * 9) % Math.max(8, Math.floor(c[1] * 0.6))), cy0 + 5 + pi * 5, 2, 2);
        }
      }
    }

    // Far sugar towers
    drawSugarTower(CX - 68, CY + 105, [[0, 34, 32], [2, 28, 28], [-2, 24, 24], [1, 20, 20], [0, 16, 16]]);
    drawSugarTower(CX + 56, CY + 108, [[0, 32, 30], [-2, 26, 26], [2, 22, 22], [0, 18, 18]]);
    // Mid-ground hero sugar-cube skyscrapers
    drawSugarTower(CX - 118, CY + 124, [[0, 56, 42], [-4, 48, 36], [-3, 38, 32], [-4, 30, 26], [-2, 22, 20]]);
    drawSugarTower(CX + 114, CY + 122, [[0, 62, 44], [4, 48, 34], [-2, 38, 30], [2, 28, 24]]);
    drawSugarTower(CX - 16, CY + 132, [[0, 74, 52], [-2, 60, 44], [3, 46, 38], [-3, 38, 34], [2, 34, 30], [3, 30, 28]]);

    // Sparkling sugar granules (rise normally, REVERSE-DRIFT DOWNWARD during Outrapo reverseSnare!)
    var granDir = reverseSnare > 0.4 ? -1 : 1;
    for (var gi = 0; gi < 20; gi++) {
      var gx = CX - 135 + hash(gi * 23) * 270;
      var gTravel = ((tl * 26 * granDir + gi * 19) % 220 + 220) % 220;
      var gy = CY + 95 - gTravel;
      ctx.fillStyle = st.lampAmt > 0.3 ? "rgba(255, 252, 235, 0.82)" : "rgba(190, 225, 222, 0.45)";
      ctx.fillRect(gx, gy, 2.8, 2.8);
    }

    // Creek-bed pebble reef floor
    var pebbles = [[-96, 138, 13, 6], [-64, 146, 15, 7], [-32, 142, 12, 6], [-4, 150, 16, 7], [28, 144, 14, 6], [62, 148, 15, 6], [-48, 160, 14, 6], [-14, 164, 17, 7], [22, 162, 13, 6]];
    for (var pbi = 0; pbi < pebbles.length; pbi++) {
      var pb = pebbles[pbi];
      ctx.fillStyle = pbi % 2 === 0 ? "#8e9478" : "#a9ab89";
      ctx.strokeStyle = "#222820";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(CX + pb[0], CY + pb[1], pb[2], pb[3], 0.1, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // 2. Dynamic Quarter-Inch Magnetic Tape Ribbons (Cranberry Festoons vs Taut Propeller Snare!)
    var tapeCol = cranberryBeat > 0.25 ? "#9c2f2d" : "#6c422a";
    var tapeHi = cranberryBeat > 0.25 ? "#e06055" : "#ad764e";

    ctx.save();
    ctx.lineCap = "round";
    var swayT = Math.sin(tl * 2.8) * (1 - reverseSnare * 0.85) * 18;

    // Left ribbon loop (pulls razor-taut diagonally on reverseSnare!)
    ctx.strokeStyle = "#22160e";
    ctx.lineWidth = 8.5;
    ctx.beginPath();
    ctx.moveTo(CX - 92, CY + 96);
    ctx.bezierCurveTo(
      lerp(CX - 142 + swayT, CX - 60, reverseSnare),
      lerp(CY + 14, CY + 20, reverseSnare),
      lerp(CX - 72 - swayT, CX + 45, reverseSnare),
      lerp(CY - 96, CY - 55, reverseSnare),
      lerp(CX - 34, CX + 132, reverseSnare),
      CY - 168
    );
    ctx.stroke();
    ctx.strokeStyle = tapeCol;
    ctx.lineWidth = 5.5;
    ctx.stroke();

    // Right figure-8 loop (snags 2-o'clock rim on chewerBeat; pulls across propeller on reverseSnare!)
    var rightTargetX = lerp(CX + 98, CX + 152, chewerBeat);
    ctx.strokeStyle = "#22160e";
    ctx.lineWidth = 8.5;
    ctx.beginPath();
    ctx.moveTo(CX + 22, CY + 124);
    ctx.bezierCurveTo(
      lerp(CX - 38 - swayT, CX - 110, reverseSnare),
      lerp(CY + 22, CY - 10, reverseSnare),
      lerp(CX + 86 + swayT, CX + 95, reverseSnare),
      lerp(CY - 135, CY - 85, reverseSnare),
      rightTargetX,
      lerp(CY - 48, CY - 82, chewerBeat)
    );
    ctx.bezierCurveTo(
      rightTargetX + 26,
      CY + 18,
      CX + 92,
      CY + 78,
      CX + 46,
      CY + 126
    );
    ctx.stroke();
    ctx.strokeStyle = tapeHi;
    ctx.lineWidth = 5.0;
    ctx.stroke();

    // Beat 2B (t=4.0s!): Taut Snared Brass Propeller Spinner + Reverse Rotation Arrows!
    if (reverseSnare > 0.15) {
      ctx.save();
      ctx.globalAlpha = reverseSnare;
      // Snared small brass thruster propeller at lower-left caught in criss-crossed tape!
      var px0 = CX - 64, py0 = CY + 36;
      var jammedJitter = Math.sin(tl * 38) * 0.14;
      ctx.translate(px0, py0);
      ctx.rotate(jammedJitter);
      ctx.fillStyle = "#d9af62";
      ctx.strokeStyle = "#23190d";
      ctx.lineWidth = 2.0;
      for (var bi = 0; bi < 3; bi++) {
        ctx.save();
        ctx.rotate(bi * (TAU / 3));
        ctx.beginPath();
        ctx.ellipse(0, -18, 7, 16, 0.2, 0, TAU);
        ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = "#8c6428";
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, TAU);
      ctx.fill(); ctx.stroke();

      // Criss-crossing taut tape bindings snaring the propeller!
      ctx.strokeStyle = "#7a3b22";
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.moveTo(-28, -14); ctx.lineTo(28, 14);
      ctx.moveTo(-24, 18);  ctx.lineTo(26, -16);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // 3. Articulated Dual 10.5-inch 3-Slot Brushed Aluminum NAB Tape Reels!
    // Forward spin normally, rapid COUNTER-CLOCKWISE spin on reverseSnare!
    var reelSpin = reverseSnare > 0.35 ? (-tl * 7.5) : (tl * 2.8);
    function drawTapeReel(rx, ry, tiltX, tiltY, rScale, spin) {
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(tiltX);
      ctx.scale(1, tiltY);

      var R = 48 * rScale;
      // Dark magnetic tape pack inside reel
      ctx.fillStyle = "#4d3121";
      ctx.beginPath();
      ctx.arc(0, 4, R * 0.82, 0, TAU);
      ctx.fill();

      // Brushed aluminum flange
      var alGrad = ctx.createLinearGradient(-R, -R, R, R);
      alGrad.addColorStop(0, "#dce5e3");
      alGrad.addColorStop(0.5, "#9cb0ae");
      alGrad.addColorStop(1, "#6f8382");
      ctx.fillStyle = alGrad;
      ctx.strokeStyle = "#1c2828";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // 3 Rotating NAB Trapezoid Cutout Windows!
      ctx.save();
      ctx.rotate(spin);
      for (var s = 0; s < 3; s++) {
        ctx.save();
        ctx.rotate(s * (TAU / 3));
        ctx.fillStyle = "#4a3020";
        ctx.beginPath();
        ctx.arc(0, 0, R * 0.78, -0.38, 0.38);
        ctx.arc(0, 0, R * 0.34, 0.38, -0.38, true);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#1c2828";
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();
      }
      // 3-pin center NAB hub
      ctx.fillStyle = "#eef4f2";
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.22, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Reverse-spin directional speed arc when reverseSnare > 0.35!
      if (reverseSnare > 0.35) {
        ctx.strokeStyle = "rgba(255, 224, 150, 0.8)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, R + 7, spin, spin + 1.4);
        ctx.stroke();
      }

      ctx.restore();
    }

    drawTapeReel(CX - 82, CY + 106, 0.42, 0.72, 1.0, reelSpin);
    drawTapeReel(CX + 38, CY + 132, -0.18, 0.48, 0.92, -reelSpin * 1.1);

    // Beat 3A (t=6.8s!): Concentric Jukebox Woofer Sound-Wave Rings Pulsing from Porthole!
    if (jukeboxBeat > 0.1) {
      ctx.save();
      ctx.globalAlpha = jukeboxBeat * 0.75;
      for (var jw = 0; jw < 3; jw++) {
        var jr = 52 + ((tl * 65 + jw * 42) % 126);
        ctx.strokeStyle = jw % 2 === 0 ? "#ffd97d" : "#7bf0c8";
        ctx.lineWidth = 2.6 * (1 - jr / 185);
        ctx.beginPath();
        ctx.arc(CX, CY, jr, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Articulated Spotted Brook Trout Weaving Through Tape Reef in Act 3
    if (isTrout) {
      var enter40 = st.viewMode === "trout" ? 1 : smooth(5.6, 6.3, tl);
      var jukeBob = jukeboxBeat * Math.sin(tl * 14.3) * 6; // 137 BPM Dashboard beat bob!
      var tx40 = lerp(CX + 225, CX + 64 + chewerBeat * 18, enter40);
      var ty40 = CY - 14 + jukeBob - chewerBeat * 22;
      drawBrookTrout(ctx, {
        x: tx40,
        y: ty40,
        scale: 0.92,
        pitch: chewerBeat * 0.18 + jukeBob * 0.012,
        t: tl,
        speed: 1.25,
        mouthOpen: chewerBeat * 0.45
      });
    }

    ctx.restore(); // end camY

    drawLampBeam(ctx, st, CX - 6, CY - 10, 200);
    drawRisingBubbles(ctx, 9, 400, tl, CX - 140, CX + 140, 1.0);
    applyMurkyDuskVeil(ctx, (1 - st.lampAmt) * 0.68);
    // In #40, Turkey's reflection sits on lower-right (matching p40.jpg!) and pecks at the snagged wire on chewerBeat!
    drawTurkeyGlassReflection(ctx, st, {
      side: "right",
      surprised: reverseSnare * 0.75,
      peck: chewerBeat * (0.55 + 0.45 * Math.abs(Math.sin(tl * 9)))
    });
  }

  // ── Register Portholes #36..#40 on window.PORTAL_SCENES ──────────────────
  var DEFINITIONS = [
    {
      id: 36,
      station: "#36 · Bench",
      clue: "Hound figure clutching wax-sealed envelope",
      turkeyFork: "Governor’s pardon or overdue bill?",
      troutFork: "Getaway vehicle or brass mailbox?",
      scionRule: "Iconic Iteration (Oubapo)",
      defaultTool: "lamp",
      drawWorld: renderP36
    },
    {
      id: 37,
      station: "#37 · Bulkhead",
      clue: "Folded silt map where claw meets fin",
      turkeyFork: "Peaceful olive twig or hidden trap?",
      troutFork: "Friendly handshake or two-sided decoy?",
      scionRule: "Folded Seam (Oubapo / V04)",
      defaultTool: "ballast",
      drawWorld: renderP37
    },
    {
      id: 38,
      station: "#38 · Visor",
      clue: "1978 posterboard UFO chart with fin notes",
      turkeyFork: "My sub’s blueprint or butcher’s diagram?",
      troutFork: "Prophesied wish-machine or overdue rental?",
      scionRule: "Annotated Schematic (SCION 25)",
      defaultTool: "lamp",
      drawWorld: renderP38
    },
    {
      id: 39,
      station: "#39 · Parlor",
      clue: "Wallpapered sunken living room with lamp",
      turkeyFork: "Grandma’s dry parlor or mirage?",
      troutFork: "Goldfish bowl on the rug or vacuum cleaner?",
      scionRule: "Drowned Domesticity (SCION 20)",
      defaultTool: "ballast",
      drawWorld: renderP39
    },
    {
      id: 40,
      station: "#40 · Reef",
      clue: "Reel-to-reel tape reef & sugar-cube towers",
      turkeyFork: "Cranberry ribbon or propeller snare?",
      troutFork: "Rolling jukebox speaker or wire-chewer?",
      scionRule: "Reverse Tape Score (Outrapo)",
      defaultTool: "lamp",
      drawWorld: renderP40
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
          var st = resolveState(def, t, state);
          ctx.save();
          if (W !== 1280 || H !== 720) {
            ctx.scale(W / 1280, H / 720);
          }

          // 1. Setup A Bread-Tin Cockpit Shell
          drawCockpitShell(ctx, st);

          // 2. Clipped Handmade Multiplane Porthole World
          ctx.save();
          ctx.beginPath();
          ctx.arc(CX, CY, R_GLASS, 0, TAU);
          ctx.clip();
          def.drawWorld(ctx, st);
          ctx.restore();

          // 3. Antique Brass 6-Bolt Porthole Bezel (with 2-o'clock chip & latch)
          drawPortholeBezel(ctx, st);

          // 4. Setup A Cockpit Controls, Chalk Chart, Air Dial & Pilot Wing
          drawCockpitControls(ctx, st);

          // 5. Lower Cream Editorial Story Strip (cleanly hides text when showCaptions === false)
          drawStoryStrip(ctx, st);

          ctx.restore();
        }
      };
    })(DEFINITIONS[di]);
  }
})();
