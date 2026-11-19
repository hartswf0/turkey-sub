/**
 * SCION Portal Animation Crew 04 — Handmade PAELEO / Oulipo + Video-to-Game Portals (#16–#20)
 *
 * Portholes:
 *   #16 · Aft    — Identical twin Turkey Sub waving back (Temporal Double · SCION 36)
 *   #17 · Dorsal — Trout Council stone table arguing budgets (Committee Clinamen · Oulipo)
 *   #18 · Vent   — Steamer trunk with star cutout peephole (Reverse Peephole · SCION 17)
 *   #19 · Bilge  — Raw potato skewered with 10 bendy straws (Hydrostatic Gauge · SCION 09)
 *   #20 · Dome   — Stained-glass pebble chapel lancet window (Refracted Sunbeams · SCION 24)
 *
 * Pure deterministic 2D Canvas multiplane & articulated cutout rigs.
 * Works identically in headless Chrome/Puppeteer (24fps film export) and live 60fps browser play.
 */
(function () {
  "use strict";

  window.PORTAL_SCENES = window.PORTAL_SCENES || {};

  // ---------------------------------------------------------------------------
  // Math, Easing & Deterministic Noise Helpers
  // ---------------------------------------------------------------------------
  var TAU = Math.PI * 2;

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

  function easeOutBack(u) {
    u = clamp(u, 0, 1);
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
  }

  function easeInOutCubic(u) {
    u = clamp(u, 0, 1);
    return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  }

  function hash1(n) {
    var s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  function noise1(x) {
    var i = Math.floor(x);
    var f = x - i;
    var u = f * f * (3 - 2 * f);
    return lerp(hash1(i), hash1(i + 1), u);
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

  // Lazy cached procedural cold-press paper & brushed-tin grain pattern
  var _grainCanvas = null;
  function getGrainCanvas() {
    if (_grainCanvas) return _grainCanvas;
    if (typeof document === "undefined") return null;
    var c = document.createElement("canvas");
    c.width = 192;
    c.height = 192;
    var g = c.getContext("2d");
    var img = g.createImageData(192, 192);
    var d = img.data;
    for (var y = 0; y < 192; y++) {
      for (var x = 0; x < 192; x++) {
        var idx = (y * 192 + x) * 4;
        var v = hash1(x * 13.7 + y * 91.3);
        var fine = (v - 0.5) * 42;
        d[idx] = 128 + fine;
        d[idx + 1] = 126 + fine;
        d[idx + 2] = 120 + fine;
        d[idx + 3] = 22;
      }
    }
    g.putImageData(img, 0, 0);
    _grainCanvas = c;
    return c;
  }

  // ---------------------------------------------------------------------------
  // State Resolution (Film Timeline vs. Interactive Video-to-Game Overrides)
  // ---------------------------------------------------------------------------
  var PORT_CX = 640;
  var PORT_CY = 255;
  var PORT_R_GLASS = 185;
  var PORT_R_OUTER = 219;

  function resolveState(meta, rawT, state) {
    state = state || {};
    var tl = rawT > 10.05 ? rawT % 10.0 : Math.max(0, rawT || 0);
    var showCaptions = state.showCaptions !== undefined ? Boolean(state.showCaptions) : true;
    var viewMode = state.view || "auto";

    var act = 1;
    if (viewMode === "turkey") {
      act = 2;
    } else if (viewMode === "trout") {
      act = 3;
    } else {
      if (tl < 2.0) act = 1;
      else if (tl < 5.6) act = 2;
      else act = 3;
    }

    // Determine lamp and ballast progress (0..1)
    var lampProg = 0;
    var ballastProg = 0;

    if (state.lamp !== undefined) {
      lampProg = state.lamp ? 1 : 0;
    } else if (meta.defaultTool === "lamp") {
      lampProg = viewMode === "auto" ? smoothstep(0.88, 1.14, tl) : 1;
    }

    if (state.ballast !== undefined) {
      ballastProg = state.ballast ? 1 : 0;
    } else if (meta.defaultTool === "ballast") {
      ballastProg = viewMode === "auto" ? smoothstep(0.85, 1.18, tl) : 1;
    }

    // Rolled 1d6 bolt (0 = none yet, 1..6 = lit bolt)
    var rolledBolt = 0;
    var boltSpinPhase = 0;
    if (state.roll && state.roll >= 1 && state.roll <= 6) {
      rolledBolt = Math.round(state.roll);
    } else if (act === 3) {
      if (viewMode === "auto" && tl < 6.25) {
        boltSpinPhase = (tl - 5.6) / 0.65; // 0..1 spin across bolts
        rolledBolt = (Math.floor(boltSpinPhase * 12) % 6) + 1;
      } else {
        rolledBolt = meta.defaultRoll;
      }
    }

    // Chalk chart progress
    var chartLineProg = 0;
    var chartGoldDot = 0;
    if (viewMode === "turkey") {
      chartLineProg = 0.85;
      chartGoldDot = state.roll > 0 ? 1 : 0;
    } else if (viewMode === "trout") {
      chartLineProg = 1;
      chartGoldDot = 1;
    } else {
      chartLineProg = smoothstep(1.8, 5.3, tl);
      chartGoldDot = smoothstep(5.75, 6.35, tl);
      if (state.roll > 0) chartGoldDot = 1;
    }

    return {
      t: tl,
      rawT: rawT || 0,
      act: act,
      viewMode: viewMode,
      showCaptions: showCaptions,
      lampProg: lampProg,
      lampOn: lampProg > 0.5,
      ballastProg: ballastProg,
      ballastOn: ballastProg > 0.5,
      rolledBolt: rolledBolt,
      boltSpinPhase: boltSpinPhase,
      chartLineProg: chartLineProg,
      chartGoldDot: chartGoldDot
    };
  }

  // ---------------------------------------------------------------------------
  // Shared Articulated Brook Trout Rig (Spotted Appalachian Brook Trout)
  // ---------------------------------------------------------------------------
  function drawBrookTrout(ctx, opts) {
    // opts: x, y, scale, flipX (-1 faces right, +1 faces left by default),
    //       jaw (0..1), swimPhase, pitchRad, glasses, ribbon, collar, baton, coin, clipboard, whistle
    var x = opts.x || 0;
    var y = opts.y || 0;
    var sc = opts.scale || 1;
    var flipX = opts.flipX || 1; // +1 = nose points LEFT (-x), -1 = nose points RIGHT (+x)
    var jaw = clamp(opts.jaw || 0, 0, 1);
    var ph = opts.swimPhase || 0;
    var pitch = opts.pitchRad || 0;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(pitch);
    ctx.scale(flipX * sc, sc);

    var tailWag = Math.sin(ph) * 0.22;
    var finWave = Math.sin(ph * 1.3 + 0.8) * 0.26;

    // Subtle paper-cutout drop shadow
    ctx.save();
    ctx.translate(3, 4);
    ctx.fillStyle = "rgba(8, 18, 20, 0.34)";
    ctx.beginPath();
    ctx.ellipse(6, 0, 66, 23, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Caudal (tail) fin — hinged at +58
    ctx.save();
    ctx.translate(58, 0);
    ctx.rotate(tailWag);
    ctx.fillStyle = "#6e7f56";
    ctx.strokeStyle = "#17231f";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-4, -5);
    ctx.quadraticCurveTo(18, -22, 28, -20);
    ctx.quadraticCurveTo(21, 0, 28, 20);
    ctx.quadraticCurveTo(18, 22, -4, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Fin rays
    ctx.strokeStyle = "rgba(23,35,31,0.45)";
    ctx.lineWidth = 1;
    for (var r = -3; r <= 3; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * 1.2);
      ctx.lineTo(23, r * 5.2);
      ctx.stroke();
    }
    ctx.restore();

    // Dorsal fin + small adipose fin
    ctx.fillStyle = "#687e53";
    ctx.strokeStyle = "#17231f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -19);
    ctx.quadraticCurveTo(4, -36, 18, -33);
    ctx.lineTo(22, -17);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Adipose fin
    ctx.beginPath();
    ctx.moveTo(36, -13);
    ctx.quadraticCurveTo(43, -21, 47, -11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pelvic & anal fins (white/black leading edge characteristic of Brook Trout!)
    ctx.save();
    ctx.translate(10, 18);
    ctx.rotate(finWave * 0.6);
    ctx.fillStyle = "#c96e4b";
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(4, 15);
    ctx.lineTo(14, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#f4efe0";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(4, 15);
    ctx.stroke();
    ctx.restore();

    // Torpedo body with olive-gold dorsal & warm cream-rose belly
    var bodyGrad = ctx.createLinearGradient(0, -24, 0, 24);
    bodyGrad.addColorStop(0, "#4c6644");
    bodyGrad.addColorStop(0.45, "#839968");
    bodyGrad.addColorStop(0.68, "#d4a67a");
    bodyGrad.addColorStop(1, "#e8dcc4");

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = "#17231f";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-64, -2); // snout
    ctx.quadraticCurveTo(-34, -24, 4, -22);
    ctx.quadraticCurveTo(42, -18, 62, -6);
    ctx.lineTo(62, 6);
    ctx.quadraticCurveTo(38, 19, 2, 22);
    ctx.quadraticCurveTo(-28, 22, -44, 13);
    // Upper jaw notch
    ctx.lineTo(-62, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Articulated lower jaw (hinged at -40, +10)
    ctx.save();
    ctx.translate(-40, 9);
    ctx.rotate(-jaw * 0.42);
    ctx.fillStyle = "#d9c5a0";
    ctx.strokeStyle = "#17231f";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(2, -1);
    ctx.lineTo(-22, -4);
    ctx.quadraticCurveTo(-18, 5, 2, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Brook trout lateral rose stripe & spots
    ctx.fillStyle = "rgba(209, 92, 76, 0.28)";
    ctx.beginPath();
    ctx.ellipse(-2, 1, 50, 5.5, 0, 0, TAU);
    ctx.fill();

    // Olive dorsal spots & crimson lateral spots with pale blue halos
    var spots = [
      [-26, -9, 2.1, false], [-14, -12, 2.3, false], [0, -11, 2.2, false],
      [14, -10, 2.0, false], [28, -8, 2.1, false], [40, -5, 1.8, false],
      [-20, -1, 2.0, true], [-5, 2, 2.2, true], [11, 0, 2.1, true],
      [25, 3, 2.0, true], [38, 1, 1.8, true], [-10, 8, 1.7, false], [8, 9, 1.8, false]
    ];
    for (var i = 0; i < spots.length; i++) {
      var sp = spots[i];
      if (sp[3]) {
        ctx.fillStyle = "rgba(168, 218, 224, 0.75)";
        ctx.beginPath();
        ctx.arc(sp[0], sp[1], sp[2] + 1.4, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#c93b2b";
      } else {
        ctx.fillStyle = "#263624";
      }
      ctx.beginPath();
      ctx.arc(sp[0], sp[1], sp[2], 0, TAU);
      ctx.fill();
    }

    // Gill operculum curve + brass split-pin joint glint
    ctx.strokeStyle = "#17231f";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(-28, 0, 13, -0.95, 1.05);
    ctx.stroke();

    // Articulated Pectoral Fin (front gesturing limb!)
    ctx.save();
    ctx.translate(-22, 12);
    ctx.rotate((opts.pectoralAngle !== undefined ? opts.pectoralAngle : finWave));
    ctx.fillStyle = "#cf7753";
    ctx.strokeStyle = "#17231f";
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(8, 18, 22, 14);
    ctx.quadraticCurveTo(16, 3, 4, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#f7f1e1";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(8, 17, 19, 14);
    ctx.stroke();

    // Optional props held by pectoral fin!
    if (opts.baton) {
      ctx.strokeStyle = "#f3e3b2";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(14, 12);
      ctx.lineTo(-18, -14);
      ctx.stroke();
      ctx.fillStyle = "#d99b38";
      ctx.beginPath();
      ctx.arc(14, 12, 3.2, 0, TAU);
      ctx.fill();
    }
    if (opts.coin) {
      ctx.fillStyle = "#d9c27e";
      ctx.strokeStyle = "#2b2210";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(-10, 8, 7.5, 5.5, -0.3, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    if (opts.clipboard) {
      ctx.fillStyle = "#415458";
      ctx.strokeStyle = "#141e20";
      ctx.lineWidth = 1.6;
      ctx.fillRect(-16, 4, 16, 20);
      ctx.strokeRect(-16, 4, 16, 20);
      ctx.fillStyle = "#e8e2d0";
      ctx.fillRect(-14, 7, 12, 15);
    }
    ctx.restore();

    // Expressive Eye
    var eyeX = -44;
    var eyeY = -5;
    ctx.fillStyle = "#f7f1de";
    ctx.strokeStyle = "#17231f";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 6.2, 0, TAU);
    ctx.fill();
    ctx.stroke();

    var lookX = clamp(opts.lookX || -1.6, -2.5, 2.5);
    var lookY = clamp(opts.lookY || 0, -2.2, 2.2);
    ctx.fillStyle = "#111819";
    ctx.beginPath();
    ctx.arc(eyeX + lookX, eyeY + lookY, 3.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(eyeX + lookX - 1.1, eyeY + lookY - 1.2, 1.2, 0, TAU);
    ctx.fill();

    // Optional pince-nez spectacles (#17 Auditor)
    if (opts.glasses) {
      ctx.strokeStyle = "#d8b058";
      ctx.lineWidth = 1.8;
      ctx.fillStyle = "rgba(225, 248, 250, 0.28)";
      ctx.beginPath();
      ctx.arc(eyeX - 1, eyeY, 7.8, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(eyeX - 8.5, eyeY - 2);
      ctx.quadraticCurveTo(eyeX - 14, eyeY - 6, eyeX - 17, eyeY - 1);
      ctx.stroke();
    }

    // Optional 1st-Place Science Fair Ribbon (#19)
    if (opts.ribbon) {
      ctx.save();
      ctx.translate(-6, -15);
      ctx.fillStyle = "#2b6cb0";
      ctx.strokeStyle = "#10253e";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-4, 4);
      ctx.lineTo(-7, 16);
      ctx.lineTo(-2, 13);
      ctx.lineTo(1, 17);
      ctx.lineTo(4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ecc94b";
      ctx.beginPath();
      ctx.arc(0, 2, 6, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Optional Magician Star Collar (#18)
    if (opts.collar) {
      ctx.save();
      ctx.translate(-26, 4);
      ctx.fillStyle = "#9e2a2b";
      ctx.strokeStyle = "#f6d365";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(9, -6);
      ctx.lineTo(3, 4);
      ctx.lineTo(10, 12);
      ctx.lineTo(-3, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Optional Traffic Visor Cap (#16)
    if (opts.visor) {
      ctx.save();
      ctx.translate(-43, -15);
      ctx.fillStyle = "#e0a938";
      ctx.strokeStyle = "#1a201c";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-14, 4);
      ctx.quadraticCurveTo(0, -7, 13, 2);
      ctx.lineTo(-16, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Setup A Bread-Tin Cockpit — Background, Porthole Bezel, Controls & Turkey Wing
  // ---------------------------------------------------------------------------
  function drawCockpitHullAndControls(ctx, W, H, meta, st) {
    // Full dark frame above lower cream strip
    var splitY = 536;
    ctx.fillStyle = "#0b1618";
    ctx.fillRect(0, 0, W, H);

    // Oval Bread-Roll Tin Interior (#132427) with unmistakable Right-Side Dent!
    ctx.save();
    var tinX = 44, tinY = 16, tinW = 1192, tinH = 506, tinR = 68;
    ctx.beginPath();
    ctx.moveTo(tinX + tinR, tinY);
    ctx.lineTo(tinX + tinW - tinR, tinY);
    ctx.quadraticCurveTo(tinX + tinW, tinY, tinX + tinW, tinY + tinR);
    // Right wall goes down to y=195, then curves INWARD for the hammered bread-tin DENT (y=195..318)!
    ctx.lineTo(tinX + tinW, 195);
    ctx.bezierCurveTo(tinX + tinW - 28, 222, tinX + tinW - 30, 288, tinX + tinW, 318);
    ctx.lineTo(tinX + tinW, tinY + tinH - tinR);
    ctx.quadraticCurveTo(tinX + tinW, tinY + tinH, tinX + tinW - tinR, tinY + tinH);
    ctx.lineTo(tinX + tinR, tinY + tinH);
    ctx.quadraticCurveTo(tinX, tinY + tinH, tinX, tinY + tinH - tinR);
    ctx.lineTo(tinX, tinY + tinR);
    ctx.quadraticCurveTo(tinX, tinY, tinX + tinR, tinY);
    ctx.closePath();

    var hullGrad = ctx.createRadialGradient(PORT_CX, 160, 80, PORT_CX, 280, 690);
    var warmLift = st.lampProg * 0.14;
    hullGrad.addColorStop(0, st.lampOn ? "#1d3538" : "#162a2d");
    hullGrad.addColorStop(0.6, "#132427");
    hullGrad.addColorStop(1, "#0e1b1e");
    ctx.fillStyle = hullGrad;
    ctx.fill();

    // Warm overhead amber wash inside tin when task-light/lamp active
    var ambAlpha = 0.09 + warmLift;
    var ambGrad = ctx.createRadialGradient(PORT_CX, 42, 10, PORT_CX, 120, 420);
    ambGrad.addColorStop(0, "rgba(237, 180, 115, " + (ambAlpha * 1.9).toFixed(3) + ")");
    ambGrad.addColorStop(1, "rgba(237, 180, 115, 0)");
    ctx.fillStyle = ambGrad;
    ctx.fill();

    // Brushed baking-tin horizontal ribs & right-side dent crease lines
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = "rgba(163, 218, 200, 0.04)";
    ctx.lineWidth = 1;
    for (var ry = 40; ry < 510; ry += 18) {
      ctx.beginPath();
      ctx.moveTo(tinX + 12, ry);
      ctx.lineTo(tinX + tinW - 12, ry);
      ctx.stroke();
    }
    // Hammered dent metallic highlight & shadow creases on right wall
    ctx.strokeStyle = "rgba(182, 208, 204, 0.42)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(1222, 204);
    ctx.bezierCurveTo(1196, 232, 1196, 282, 1222, 310);
    ctx.stroke();
    ctx.strokeStyle = "rgba(8, 14, 16, 0.65)";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(1214, 214);
    ctx.bezierCurveTo(1190, 238, 1190, 276, 1214, 300);
    ctx.stroke();
    ctx.restore();

    // Rolled tin border stroke
    ctx.strokeStyle = "#4d7070";
    ctx.lineWidth = 3.0;
    ctx.stroke();
    ctx.restore();

    // Overhead Amber Task-Light Bar (Setup A invariant!)
    ctx.save();
    ctx.strokeStyle = "#967147";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(136, 72);
    ctx.lineTo(212, 40);
    ctx.lineTo(1068, 40);
    ctx.lineTo(1144, 72);
    ctx.stroke();

    // Central task-light capsule
    roundRectPath(ctx, 586, 33, 108, 14, 7);
    ctx.fillStyle = st.lampOn ? "#ffd285" : "#d99d58";
    ctx.fill();
    ctx.strokeStyle = "#473119";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    // Top-Left Station & Hardware Plaque
    ctx.save();
    roundRectPath(ctx, 78, 66, 276, 88, 10);
    ctx.fillStyle = "rgba(15, 29, 32, 0.85)";
    ctx.fill();
    ctx.strokeStyle = "#395657";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // Corner rivets
    var pRivs = [[88, 76], [344, 76], [88, 144], [344, 144]];
    ctx.fillStyle = "#6c8785";
    for (var pr = 0; pr < pRivs.length; pr++) {
      ctx.beginPath();
      ctx.arc(pRivs[pr][0], pRivs[pr][1], 2.3, 0, TAU);
      ctx.fill();
    }
    if (st.showCaptions) {
      ctx.font = "600 14px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#edb473";
      ctx.fillText("STATION " + meta.station, 96, 93);
      ctx.font = "500 12.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      var fitStr = st.ballastOn && st.lampOn ? "LAMP + BALLAST" :
                   st.ballastOn ? "BALLAST MODULE" :
                   st.lampOn ? "LAMP MODULE" : "STANDBY (" + meta.defaultTool.toUpperCase() + ")";
      ctx.fillStyle = "#a3dac8";
      ctx.fillText("FIT: " + fitStr, 96, 115);
      ctx.fillStyle = "#b6c8c4";
      ctx.fillText(meta.scionRule, 96, 137);
    } else {
      // Purely graphical station schematic (blind critic test — zero text!)
      ctx.strokeStyle = "#8ab8b0";
      ctx.lineWidth = 2;
      roundRectPath(ctx, 110, 88, 110, 42, 18);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(165, 109, 10, 0, TAU);
      ctx.stroke();
      // Station indicator dot on mini-sub diagram
      var dotPos = {
        16: [112, 109], // Aft
        17: [165, 88],  // Dorsal
        18: [195, 94],  // Vent
        19: [165, 130], // Bilge
        20: [145, 88]   // Dome
      }[meta.id] || [165, 109];
      ctx.fillStyle = "#ffd466";
      ctx.beginPath();
      ctx.arc(dotPos[0], dotPos[1], 5.5, 0, TAU);
      ctx.fill();
      // Active module icon on right half of plaque
      if (st.lampOn) {
        ctx.fillStyle = "rgba(255, 212, 102, 0.35)";
        ctx.beginPath();
        ctx.moveTo(260, 109);
        ctx.lineTo(318, 88);
        ctx.lineTo(318, 130);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = st.ballastOn ? "#a3dac8" : "#446060";
      ctx.fillRect(256, 122, 48, 12);
    }
    ctx.restore();

    // Top-Right "1 Day of Air" Dial (Setup A invariant!)
    ctx.save();
    var airX = 1094, airY = 128, airR = 54;
    // Outer brass bezel
    var airBrass = ctx.createLinearGradient(airX - airR, airY - airR, airX + airR, airY + airR);
    airBrass.addColorStop(0, "#d4ae64");
    airBrass.addColorStop(0.5, "#9c7838");
    airBrass.addColorStop(1, "#5c441b");
    ctx.fillStyle = airBrass;
    ctx.strokeStyle = "#1b1409";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(airX, airY, airR + 6, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Enamel dial face
    ctx.fillStyle = "#f7efdc";
    ctx.beginPath();
    ctx.arc(airX, airY, airR - 1, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#3a2e1c";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Tick marks around top arc
    for (var tk = 0; tk <= 10; tk++) {
      var ang = -Math.PI * 0.85 + (tk / 10) * (Math.PI * 1.15);
      var r0 = tk % 2 === 0 ? airR - 12 : airR - 8;
      ctx.strokeStyle = tk < 3 ? "#b83b24" : "#222a28";
      ctx.lineWidth = tk % 2 === 0 ? 2.0 : 1.2;
      ctx.beginPath();
      ctx.moveTo(airX + Math.cos(ang) * r0, airY + Math.sin(ang) * r0);
      ctx.lineTo(airX + Math.cos(ang) * (airR - 3), airY + Math.sin(ang) * (airR - 3));
      ctx.stroke();
    }

    // Animated needle slowly breathing / ticking down slightly over 10s
    var needleAng = -1.08 - st.t * 0.018 + Math.sin(st.t * 3.1) * 0.025;
    ctx.strokeStyle = "#b83b24";
    ctx.lineWidth = 3.0;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(airX, airY + 4);
    ctx.lineTo(airX + Math.cos(needleAng) * (airR - 14), airY + Math.sin(needleAng) * (airR - 14));
    ctx.stroke();
    ctx.fillStyle = "#3c2e19";
    ctx.beginPath();
    ctx.arc(airX, airY + 4, 4.5, 0, TAU);
    ctx.fill();

    if (st.showCaptions) {
      ctx.textAlign = "center";
      ctx.font = "700 14px Georgia, serif";
      ctx.fillStyle = "#1b2422";
      ctx.fillText("1 DAY", airX, airY + 24);
      ctx.font = "600 10.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#485450";
      ctx.fillText("OF AIR", airX, airY + 38);
      ctx.textAlign = "left";
    } else {
      // Graphical air-bubble trio when uncaptioned
      ctx.strokeStyle = "#2b6b78";
      ctx.lineWidth = 1.5;
      var bubs = [[-9, 25, 3.5], [1, 30, 2.8], [9, 23, 4.2]];
      for (var bi = 0; bi < bubs.length; bi++) {
        ctx.beginPath();
        ctx.arc(airX + bubs[bi][0], airY + bubs[bi][1], bubs[bi][2], 0, TAU);
        ctx.stroke();
      }
    }
    ctx.restore();

    // Bottom-Left: Ballast / Single Slot (LEGO-like slide-in socket!)
    ctx.save();
    var bx = 88, by = 432, bw = 248, bh = 74;
    roundRectPath(ctx, bx, by, bw, bh, 12);
    ctx.fillStyle = "#102023";
    ctx.fill();
    ctx.strokeStyle = st.ballastOn ? "#a3dac8" : "#7fa39f";
    ctx.lineWidth = 2.0;
    ctx.stroke();

    if (st.showCaptions) {
      ctx.textAlign = "center";
      ctx.font = "600 12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#c8dcd8";
      ctx.fillText("BALLAST / SINGLE SLOT", bx + bw * 0.5, by + 20);
      ctx.textAlign = "left";
    }

    // Recessed Single Slot socket
    var sx = bx + 36, sy = by + 31, sw = 176, sh = 28;
    ctx.fillStyle = "#1d383b";
    ctx.strokeStyle = "#5f8581";
    ctx.lineWidth = 1.6;
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeRect(sx, sy, sw, sh);
    // Keyed alignment notches on left & right of socket
    ctx.fillStyle = "#4c6e6b";
    ctx.fillRect(sx - 5, sy + 8, 5, 12);
    ctx.fillRect(sx + sw, sy + 8, 5, 12);

    // Sliding Ballast Tray Module (animates in when ballastProg > 0!)
    if (st.ballastProg > 0.01) {
      var slideOffset = (1 - easeOutBack(st.ballastProg)) * -64;
      ctx.save();
      ctx.translate(slideOffset, 0);
      var bGrad = ctx.createLinearGradient(sx, sy, sx, sy + sh);
      bGrad.addColorStop(0, "#8aa39f");
      bGrad.addColorStop(0.5, "#556e6d");
      bGrad.addColorStop(1, "#344747");
      ctx.fillStyle = bGrad;
      ctx.strokeStyle = "#142021";
      ctx.lineWidth = 2.0;
      roundRectPath(ctx, sx + 3, sy + 2, sw - 6, sh - 4, 4);
      ctx.fill();
      ctx.stroke();
      // Brass grip handle in center of ballast tray
      roundRectPath(ctx, sx + sw * 0.5 - 24, sy + 7, 48, 14, 4);
      ctx.fillStyle = "#d4a959";
      ctx.fill();
      ctx.stroke();
      // Green snap-lock indicator LED
      ctx.fillStyle = st.ballastProg > 0.85 ? "#6ee7b7" : "#edb473";
      ctx.beginPath();
      ctx.arc(sx + sw - 14, sy + sh * 0.5, 4, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Bottom-Center: Chalk Chart Under Glass (y = 476..520, cleanly below porthole!)
    ctx.save();
    var cxBox = 470, cyBox = 476, cwBox = 340, chBox = 42;
    roundRectPath(ctx, cxBox, cyBox, cwBox, chBox, 10);
    ctx.fillStyle = "#0e1d20";
    ctx.fill();
    ctx.strokeStyle = "#8ab0ab";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    if (st.showCaptions) {
      ctx.textAlign = "center";
      ctx.font = "600 10.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#b9d0cc";
      ctx.fillText("CHART UNDER GLASS", cxBox + cwBox * 0.5, cyBox + 13);
      ctx.textAlign = "left";
    }

    // Chalk polyline route (progressively drawn across Act 2, gold landmark at Act 3!)
    var pts = [
      [cxBox + 34, cyBox + 33],
      [cxBox + 98, cyBox + 21],
      [cxBox + 168, cyBox + 32],
      [cxBox + 238, cyBox + 20],
      [cxBox + 296, cyBox + 26]
    ];
    // Faint baseline dashed guide
    ctx.strokeStyle = "rgba(182, 200, 196, 0.22)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var pi = 1; pi < pts.length; pi++) ctx.lineTo(pts[pi][0], pts[pi][1]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Active chalk stroke
    if (st.chartLineProg > 0.01) {
      var totalSegs = pts.length - 1;
      var segFloat = st.chartLineProg * totalSegs;
      ctx.strokeStyle = "#f5efe0";
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var s = 0; s < totalSegs; s++) {
        if (segFloat >= s + 1) {
          ctx.lineTo(pts[s + 1][0], pts[s + 1][1]);
        } else if (segFloat > s) {
          var frac = segFloat - s;
          ctx.lineTo(lerp(pts[s][0], pts[s + 1][0], frac), lerp(pts[s][1], pts[s + 1][1], frac));
        }
      }
      ctx.stroke();
    }

    // Gold Landmark Verification Dot + Halo (t >= 5.6s / Trout pass!)
    if (st.chartGoldDot > 0.01) {
      var gx = pts[4][0], gy = pts[4][1];
      var gScale = easeOutBack(st.chartGoldDot);
      ctx.fillStyle = "rgba(255, 212, 102, 0.28)";
      ctx.beginPath();
      ctx.arc(gx, gy, 9.5 * gScale, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#ffd466";
      ctx.beginPath();
      ctx.arc(gx, gy, 5.2 * gScale, 0, TAU);
      ctx.fill();
    }

    // Subtle glass glare diagonal over chart
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cxBox + 22, cyBox + chBox - 4);
    ctx.lineTo(cxBox + 52, cyBox + 4);
    ctx.stroke();
    ctx.restore();

    // Bottom-Right: Lamp Toggle Switch (Setup A invariant!)
    ctx.save();
    var tx = 972, ty = 426, tw = 132, th = 80;
    roundRectPath(ctx, tx, ty, tw, th, 12);
    ctx.fillStyle = "#192524";
    ctx.fill();
    ctx.strokeStyle = st.lampOn ? "#ffd080" : "#d9a25f";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    if (st.showCaptions) {
      ctx.textAlign = "center";
      ctx.font = "600 12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#edb473";
      ctx.fillText("TOGGLE", tx + tw * 0.5, ty + 20);
      ctx.textAlign = "left";
    }

    // Pivot nut & toggle bat lever
    var pivX = tx + tw * 0.5, pivY = ty + 54;
    // Glowing amber jewel when lamp is ON
    if (st.lampProg > 0.1) {
      var jGrad = ctx.createRadialGradient(pivX + 36, ty + 24, 1, pivX + 36, ty + 24, 14);
      jGrad.addColorStop(0, "rgba(255, 220, 120, " + st.lampProg.toFixed(2) + ")");
      jGrad.addColorStop(1, "rgba(255, 180, 70, 0)");
      ctx.fillStyle = jGrad;
      ctx.beginPath();
      ctx.arc(pivX + 36, ty + 24, 14, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = st.lampOn ? "#ffda75" : "#443624";
    ctx.beginPath();
    ctx.arc(pivX + 36, ty + 24, 4.2, 0, TAU);
    ctx.fill();

    // Brass collar
    ctx.fillStyle = "#d99e4e";
    ctx.strokeStyle = "#2b1c0b";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(pivX, pivY, 9.5, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Lever arm: OFF = -0.48 rad (left), ON = +0.46 rad (right)
    var levAng = lerp(-0.48, 0.46, easeOutBack(st.lampProg));
    ctx.save();
    ctx.translate(pivX, pivY);
    ctx.rotate(levAng);
    ctx.fillStyle = "#f4efe4";
    ctx.strokeStyle = "#24201a";
    ctx.lineWidth = 2.0;
    roundRectPath(ctx, -4.5, -30, 9, 28, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Antique Brass Porthole Bezel, Hinge, Latch, 2-o'clock Rim Chip & 6 Die Bolts
  // ---------------------------------------------------------------------------
  function drawPortholeBezelAndHardware(ctx, meta, st) {
    var cx = PORT_CX, cy = PORT_CY;
    var rIn = PORT_R_GLASS;   // 185
    var rOut = PORT_R_OUTER;  // 219

    ctx.save();

    // Drop shadow onto bread-tin bulkhead
    ctx.save();
    ctx.strokeStyle = "rgba(4, 10, 12, 0.62)";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(cx + 3, cy + 6, rOut + 2, 0, TAU);
    ctx.stroke();
    ctx.restore();

    // Left Heavy Cast-Iron Barrel Hinge (9 o'clock)
    ctx.save();
    var hx = cx - rOut - 18, hy = cy - 52, hw = 30, hh = 104;
    var ironGrad = ctx.createLinearGradient(hx, hy, hx + hw, hy);
    ironGrad.addColorStop(0, "#272b2c");
    ironGrad.addColorStop(0.45, "#596061");
    ironGrad.addColorStop(1, "#232728");
    roundRectPath(ctx, hx, hy, hw, hh, 5);
    ctx.fillStyle = ironGrad;
    ctx.fill();
    ctx.strokeStyle = "#111516";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    // Barrel knuckles on left edge
    roundRectPath(ctx, hx - 8, hy + 6, 13, hh - 12, 6);
    ctx.fillStyle = "#3d4344";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hx - 8, hy + 34);
    ctx.lineTo(hx + 5, hy + 34);
    ctx.moveTo(hx - 8, hy + 70);
    ctx.lineTo(hx + 5, hy + 70);
    ctx.stroke();
    // Hinge screws
    ctx.fillStyle = "#1c2021";
    ctx.beginPath();
    ctx.arc(hx + 18, hy + 18, 4.2, 0, TAU);
    ctx.arc(hx + 18, hy + hh - 18, 4.2, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Antique Brass Ring (annulus rIn..rOut) WITH 2-o'clock Rim Chip!
    var brassGrad = ctx.createLinearGradient(cx - rOut, cy - rOut, cx + rOut, cy + rOut);
    brassGrad.addColorStop(0, "#dfc07c");
    brassGrad.addColorStop(0.28, "#b79047");
    brassGrad.addColorStop(0.62, "#8c692c");
    brassGrad.addColorStop(1, "#5c4319");

    ctx.beginPath();
    ctx.arc(cx, cy, rOut, 0, TAU, false);
    ctx.arc(cx, cy, rIn, 0, TAU, true);
    ctx.closePath();
    ctx.fillStyle = brassGrad;
    ctx.fill();

    // Inner bevel shadow & outer dark ink stroke
    ctx.strokeStyle = "#1f1709";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(cx, cy, rOut, 0, TAU);
    ctx.stroke();
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(cx, cy, rIn, 0, TAU);
    ctx.stroke();

    // Turned brass decorative middle groove
    ctx.strokeStyle = "rgba(255, 236, 185, 0.28)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, rIn + 10, 0, TAU);
    ctx.stroke();

    // UNMISTAKABLE 2-O'CLOCK RIM CHIP (Setup A invariant! Angle ~ -0.50 rad = 2 o'clock)
    ctx.save();
    var chipAng = -0.50; // right at 2 o'clock!
    ctx.translate(cx, cy);
    ctx.rotate(chipAng);
    // Dark bitten-out notch in the inner brass rim (rIn - 2 to rIn + 15)
    ctx.fillStyle = "#13292d";
    ctx.strokeStyle = "#1f1709";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(rIn - 2, -11);
    ctx.lineTo(rIn + 14, -4);
    ctx.lineTo(rIn + 9, 3);
    ctx.lineTo(rIn + 15, 9);
    ctx.lineTo(rIn - 2, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Bright raw nicked-brass facets catching task light!
    ctx.strokeStyle = "#ffe59e";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(rIn, -10);
    ctx.lineTo(rIn + 13, -4);
    ctx.lineTo(rIn + 8, 3);
    ctx.lineTo(rIn + 14, 9);
    ctx.stroke();
    ctx.restore();

    // Small rectangular brass witness plate just above 2-o'clock chip (from setup_a.webp!)
    ctx.save();
    roundRectPath(ctx, cx + 92, cy - 152, 34, 14, 4);
    ctx.fillStyle = "#dfb36b";
    ctx.strokeStyle = "#2b1e0c";
    ctx.lineWidth = 1.6;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Right Offset Brass Dog-Latch (3 o'clock, slightly below center at y+8)
    ctx.save();
    var lx = cx + rOut - 16, ly = cy + 6;
    roundRectPath(ctx, lx - 4, ly - 32, 24, 64, 9);
    ctx.fillStyle = "#b58d43";
    ctx.strokeStyle = "#1f1709";
    ctx.lineWidth = 2.2;
    ctx.fill();
    ctx.stroke();
    // Latch dog-ear lever pointing inward/outward
    ctx.fillStyle = "#d6b064";
    ctx.beginPath();
    ctx.moveTo(lx - 18, ly - 6);
    ctx.lineTo(lx + 34, ly - 11);
    ctx.lineTo(lx + 34, ly + 11);
    ctx.lineTo(lx - 18, ly + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Screws
    ctx.fillStyle = "#3a2b12";
    ctx.beginPath();
    ctx.arc(lx + 8, ly - 21, 3.2, 0, TAU);
    ctx.arc(lx + 8, ly + 21, 3.2, 0, TAU);
    ctx.fill();
    ctx.restore();

    // 6 Hexagonal Brass Bolts (1..6 = 1d6 consequence selector!)
    // Placed cleanly at 12, 1:40, 4, 6, 8, 10 o'clock so bolt #2 sits neatly above the 2-o'clock chip!
    var boltAngles = [-Math.PI / 2, -0.72, Math.PI / 6, Math.PI / 2, (5 * Math.PI) / 6, (-5 * Math.PI) / 6];
    var rBolt = (rIn + rOut) * 0.5 + 1;

    for (var b = 0; b < 6; b++) {
      var faceNum = b + 1;
      var ba = boltAngles[b];
      var bxPos = cx + Math.cos(ba) * rBolt;
      var byPos = cy + Math.sin(ba) * rBolt;

      var isRolled = st.rolledBolt === faceNum;
      var isOddPulse = st.act === 2 && (faceNum % 2 === 1);

      // Register color: 1-2 Probable (Teal), 3-4 Plausible (Emerald), 5-6 Preposterous (Rust-Gold)
      var regCol = faceNum <= 2 ? "#38b2ac" : faceNum <= 4 ? "#48bb78" : "#ed8936";

      if (isRolled) {
        var pulse = 0.78 + 0.22 * Math.sin(st.t * 7.5);
        var gl = ctx.createRadialGradient(bxPos, byPos, 2, bxPos, byPos, 24);
        gl.addColorStop(0, "rgba(255, 240, 165, " + (0.95 * pulse).toFixed(2) + ")");
        gl.addColorStop(0.5, regCol);
        gl.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gl;
        ctx.beginPath();
        ctx.arc(bxPos, byPos, 24, 0, TAU);
        ctx.fill();
      } else if (isOddPulse) {
        ctx.fillStyle = "rgba(237, 180, 115, " + (0.14 + 0.08 * Math.sin(st.t * 4 + b)).toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(bxPos, byPos, 15, 0, TAU);
        ctx.fill();
      }

      // Hex head
      ctx.fillStyle = isRolled ? "#fff0b3" : "#c79f52";
      ctx.strokeStyle = isRolled ? "#2b1c06" : "#241b0b";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      for (var k = 0; k < 6; k++) {
        var ha = (k * TAU) / 6 + 0.2;
        var hxPt = bxPos + Math.cos(ha) * 10.5;
        var hyPt = byPos + Math.sin(ha) * 10.5;
        if (k === 0) ctx.moveTo(hxPt, hyPt);
        else ctx.lineTo(hxPt, hyPt);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner bolt chamfer or 1d6 glint starburst when rolled!
      if (isRolled) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.8;
        var starRot = st.t * 1.8;
        for (var sr = 0; sr < 4; sr++) {
          var sa = starRot + (sr * Math.PI) / 2;
          ctx.beginPath();
          ctx.moveTo(bxPos - Math.cos(sa) * 15, byPos - Math.sin(sa) * 15);
          ctx.lineTo(bxPos + Math.cos(sa) * 15, byPos + Math.sin(sa) * 15);
          ctx.stroke();
        }
      } else {
        ctx.strokeStyle = "rgba(40, 28, 10, 0.55)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(bxPos, byPos, 5.2, 0, TAU);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Subtle Interior Glass Reflections + Turkey Pilot Ghost Reflection + Wing Rig
  // ---------------------------------------------------------------------------
  function drawGlassReflectionsAndTurkeyGhost(ctx, meta, st) {
    var cx = PORT_CX, cy = PORT_CY, r = PORT_R_GLASS;
    ctx.save();

    // Subtle convex glass reflection of Turkey peering out (lower-left of porthole, just like p16..p20!)
    var ghostAlpha = st.act === 3 ? 0.14 : 0.25;
    var leanX = st.act === 2 ? 7 * Math.sin((st.t - 2.0) * 1.4) : st.act === 3 ? -8 : 0;
    var leanY = st.act === 2 ? -5 : st.act === 3 ? 6 : 2;
    var headTilt = st.act === 2 ? Math.sin(st.t * 2.2) * 0.09 : -0.05;

    ctx.save();
    ctx.globalAlpha = ghostAlpha;
    ctx.translate(cx - 108 + leanX, cy + 114 + leanY);
    ctx.rotate(headTilt);

    // Feathered neck & head reflection
    ctx.fillStyle = "#b97349";
    ctx.strokeStyle = "#3a1e12";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-28, 48);
    ctx.quadraticCurveTo(-24, -6, -4, -22);
    ctx.arc(4, -14, 18, -2.1, 0.5);
    ctx.lineTo(14, 48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red wattle & snood
    ctx.fillStyle = "#c94236";
    ctx.beginPath();
    ctx.ellipse(21, -2, 4.5, 11, 0.2, 0, TAU);
    ctx.fill();

    // Curved amber beak
    ctx.fillStyle = "#e3b359";
    ctx.beginPath();
    ctx.moveTo(19, -15);
    ctx.quadraticCurveTo(36, -12, 34, -4);
    ctx.lineTo(18, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Blinking eye
    var blink = Math.abs(Math.sin(st.t * 1.7 + 0.9)) > 0.97 ? 0.15 : 1;
    ctx.fillStyle = "#f9f1dc";
    ctx.beginPath();
    ctx.ellipse(6, -15, 5.5, 5.5 * blink, 0, 0, TAU);
    ctx.fill();
    if (blink > 0.3) {
      ctx.fillStyle = "#191410";
      ctx.beginPath();
      ctx.arc(8, -15, 2.6, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // Curved upper-left convex porthole highlight arcs
    ctx.strokeStyle = "rgba(235, 252, 250, 0.22)";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, r - 15, -2.55, -1.75);
    ctx.stroke();

    ctx.strokeStyle = "rgba(235, 252, 250, 0.11)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 27, -2.48, -1.88);
    ctx.stroke();

    // Inner dark glass vignette
    var vig = ctx.createRadialGradient(cx, cy, r * 0.72, cx, cy, r);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(5, 14, 16, 0.44)");
    ctx.fillStyle = vig;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  // Foreground Articulated Turkey Pilot Wing (operates toggle or ballast in Act 1, reacts in Act 2/3!)
  function drawTurkeyForegroundWing(ctx, meta, st) {
    // Determine target hand coordinates based on timeline!
    var restX = 375, restY = 552; // resting down below cockpit lip
    var ctrlX = meta.defaultTool === "lamp" ? 1034 : 206;
    var ctrlY = meta.defaultTool === "lamp" ? 470 : 476;

    var wx = restX, wy = restY, wRot = -0.25, spread = 0.25;
    var drawSpark = 0;

    if (st.viewMode === "auto" && st.t < 2.0) {
      var t = st.t;
      if (t < 0.92) {
        // Reach smoothly from pilot seat to the control (poised right at control at t=0.8s!)
        var u1 = easeInOutCubic(smoothstep(0.18, 0.86, t));
        wx = lerp(restX, ctrlX - (meta.defaultTool === "lamp" ? 18 : 26), u1);
        wy = lerp(restY, ctrlY + 6, u1);
        wRot = lerp(-0.2, meta.defaultTool === "lamp" ? 0.35 : -0.45, u1);
        spread = lerp(0.2, 0.55, u1);
      } else if (t < 1.22) {
        // Snap/click operation at t=1.0s!
        var u2 = smoothstep(0.92, 1.08, t);
        wx = ctrlX + (meta.defaultTool === "lamp" ? lerp(-18, 12, u2) : lerp(-26, 16, u2));
        wy = ctrlY + lerp(6, -4, u2);
        wRot = (meta.defaultTool === "lamp" ? 0.35 : -0.45) + u2 * 0.24;
        spread = 0.65;
        drawSpark = Math.sin(clamp((t - 0.95) / 0.22, 0, 1) * Math.PI);
      } else {
        // Settle onto lower sill so at t=1.8s we see the rested wing tip + changed state!
        var u3 = easeInOutCubic(smoothstep(1.22, 1.88, t));
        wx = lerp(ctrlX + 12, 418, u3);
        wy = lerp(ctrlY - 4, 514, u3);
        wRot = lerp(meta.defaultTool === "lamp" ? 0.55 : -0.2, -0.12, u3);
        spread = lerp(0.6, 0.25, u3);
      }
    } else if (st.act === 2) {
      // In Porthole #16, Turkey waves up at the Twin Sub at t=2.2..3.3s!
      if (meta.id === 16 && st.t >= 2.1 && st.t <= 3.45) {
        var wu = Math.sin(clamp((st.t - 2.1) / 1.35, 0, 1) * Math.PI);
        wx = lerp(418, 488, wu);
        wy = lerp(514, 385, wu);
        wRot = -0.35 + Math.sin(st.t * 9.0) * 0.28 * wu;
        spread = 0.72;
      } else {
        // Resting inquisitively on cockpit sill, slight feather twitch at X/Y swerve (t~3.6s)
        var twitch = Math.exp(-Math.pow((st.t - 3.65) * 4, 2)) * 14;
        wx = 418;
        wy = 516 - twitch;
        wRot = -0.12 + twitch * 0.012;
        spread = 0.28 + twitch * 0.015;
      }
    } else if (st.act === 3) {
      // At t=5.9..7.3s Turkey's wing taps the Chalk Chart Under Glass to mark the gold dot!
      var markU = (st.t >= 5.85 && st.t <= 7.35)
        ? Math.sin(clamp((st.t - 5.85) / 1.5, 0, 1) * Math.PI)
        : 0;
      wx = lerp(405, 756, markU);
      wy = lerp(522, 504, markU);
      wRot = lerp(-0.18, 0.22, markU);
      spread = 0.32;
    }

    if (wy > 548) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 1280, 536);
    ctx.clip();

    // Mechanical click/snap radial lines right at t=1.0s!
    if (drawSpark > 0.05) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 226, 130, " + (drawSpark * 0.9).toFixed(2) + ")";
      ctx.lineWidth = 2.4;
      for (var si = 0; si < 6; si++) {
        var sa = (si * TAU) / 6 + 0.3;
        ctx.beginPath();
        ctx.moveTo(ctrlX + Math.cos(sa) * 16, ctrlY + Math.sin(sa) * 16);
        ctx.lineTo(ctrlX + Math.cos(sa) * 30, ctrlY + Math.sin(sa) * 30);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw articulated bronze-chestnut feathered wing reaching from bottom-left foreground
    ctx.translate(wx, wy);
    ctx.rotate(wRot);

    // Forearm / covert base
    ctx.fillStyle = "#6e3f24";
    ctx.strokeStyle = "#19100a";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-95, 130);
    ctx.quadraticCurveTo(-55, 42, -16, 4);
    ctx.quadraticCurveTo(12, -8, 18, 14);
    ctx.quadraticCurveTo(-8, 65, -36, 135);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 5 Fanned Primary Feathers with heritage cream/chocolate barring
    for (var f = 0; f < 5; f++) {
      var fang = -0.55 + (f - 2) * (0.16 + spread * 0.14);
      ctx.save();
      ctx.rotate(fang);
      var flen = 54 - Math.abs(f - 2) * 5;
      ctx.fillStyle = f % 2 === 0 ? "#8c4f2b" : "#753f20";
      ctx.strokeStyle = "#19100a";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.quadraticCurveTo(-8, -flen * 0.55, 2, -flen);
      ctx.quadraticCurveTo(12, -flen * 0.55, 8, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cream barring stripes near feather tip
      ctx.strokeStyle = "rgba(245, 230, 198, 0.72)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-3, -flen * 0.72);
      ctx.lineTo(6, -flen * 0.70);
      ctx.moveTo(-2, -flen * 0.52);
      ctx.lineTo(7, -flen * 0.50);
      ctx.stroke();

      // Central rachis quill
      ctx.strokeStyle = "#d9c29c";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(3, 4);
      ctx.lineTo(2, -flen + 3);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Lower Cream Editorial Story Strip (y = 536..720) — Hidden cleanly when showCaptions===false!
  // ---------------------------------------------------------------------------
  function drawEditorialStrip(ctx, W, H, meta, st) {
    var topY = 536;
    ctx.save();
    ctx.fillStyle = "#faf8f3";
    ctx.fillRect(0, topY, W, H - topY);

    // Crisp hairline divider
    ctx.fillStyle = "#d9d2c4";
    ctx.fillRect(0, topY, W, 2);

    if (!st.showCaptions) {
      ctx.restore();
      return;
    }

    var padX = 72;
    if (st.act === 1) {
      ctx.font = "600 13.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#5c574d";
      var toolLabel = meta.defaultTool === "lamp" ? "FLIP LAMP TOGGLE [L]" : "SLIDE BALLAST MODULE [B]";
      ctx.fillText("SETUP A · COCKPIT OPERATION   (" + meta.station + ")   ·   " + toolLabel, padX, topY + 38);

      ctx.font = "700 34px Georgia, 'Times New Roman', serif";
      ctx.fillStyle = "#1f2b2d";
      ctx.fillText("“" + meta.clue + "”", padX, topY + 92);

      ctx.font = "italic 18px Georgia, 'Times New Roman', serif";
      ctx.fillStyle = "#56605d";
      ctx.fillText("Rule: " + meta.scionRule + " · Operate one part & watch what changes outside the glass", padX, topY + 146);
    } else if (st.act === 2) {
      ctx.font = "600 13.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#9e3d1c";
      ctx.fillText("FIRST PASS · TURKEY LOOKS OUT   (" + meta.station + ")   ·   " + meta.scionRule.toUpperCase(), padX, topY + 38);

      ctx.font = "700 36px Georgia, 'Times New Roman', serif";
      ctx.fillStyle = "#9e3d1c";
      ctx.fillText("“" + meta.turkeyFork + "”", padX, topY + 94);

      ctx.font = "italic 18px Georgia, 'Times New Roman', serif";
      ctx.fillStyle = "#5a5248";
      ctx.fillText("Write odd faces (1 · 3 · 5) · Probable, Plausible & Preposterous", padX, topY + 146);
    } else {
      var boltStr = st.rolledBolt > 0 ? "   ·   1D6 BOLT #" + st.rolledBolt : "";
      ctx.font = "600 13.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#1d596e";
      ctx.fillText("SECOND PASS · TROUT LOOKS IN   (" + meta.station + ")" + boltStr, padX, topY + 38);

      ctx.font = "700 36px Georgia, 'Times New Roman', serif";
      ctx.fillStyle = "#1d596e";
      ctx.fillText("“" + meta.troutFork + "”", padX, topY + 94);

      ctx.font = "italic 18px Georgia, 'Times New Roman', serif";
      ctx.fillStyle = "#48595d";
      ctx.fillText("Write even faces (2 · 4 · 6) · Roll 1d6 once · Mark chart for Brook", padX, topY + 146);
    }

    ctx.restore();
  }

  // Common underwater caustic rays, lamp spotlight cone, foreground stone lip & swaying kelp
  function drawCommonRiverBackdrop(ctx, st, palette) {
    var cx = PORT_CX, cy = PORT_CY, r = PORT_R_GLASS;
    var duskLift = Math.max(st.lampProg * 0.85, st.ballastProg * 0.72, st.act >= 2 ? 0.65 : 0.08);
    var trimY = st.ballastProg * 18; // Ballast lowers hull -> background shifts UP in port!

    var g = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
    g.addColorStop(0, lerpColor(palette.duskTop, palette.litTop, duskLift));
    g.addColorStop(0.55, lerpColor(palette.duskMid, palette.litMid, duskLift));
    g.addColorStop(1, lerpColor(palette.duskBot, palette.litBot, duskLift));
    ctx.fillStyle = g;
    ctx.fillRect(cx - r - 4, cy - r - 4, r * 2 + 8, r * 2 + 8);

    // Drifting horizontal river current ribbons (slower when sheltered by ballast!)
    var flowSpeed = st.ballastOn ? 18 : 42;
    ctx.strokeStyle = "rgba(185, 238, 232, " + (0.08 + duskLift * 0.08).toFixed(3) + ")";
    ctx.lineWidth = 2.0;
    for (var wi = 0; wi < 6; wi++) {
      var wy = cy - 135 + wi * 44 + trimY * 0.45;
      var wxOff = ((st.t * flowSpeed + wi * 67) % 280) - 140;
      ctx.beginPath();
      ctx.moveTo(cx - 170 + wxOff, wy);
      ctx.bezierCurveTo(cx - 90 + wxOff, wy - 7, cx - 30 + wxOff, wy + 7, cx + 55 + wxOff, wy);
      ctx.stroke();
    }
  }

  function drawSubSearchlightBeam(ctx, st, aimX, aimY, spreadW) {
    if (st.lampProg <= 0.02) return;
    var cx = PORT_CX, cy = PORT_CY + PORT_R_GLASS - 6;
    var ax = aimX !== undefined ? aimX : PORT_CX;
    var ay = aimY !== undefined ? aimY : PORT_CY - 80;
    var sw = spreadW || 135;

    ctx.save();
    var beamGrad = ctx.createLinearGradient(cx, cy, ax, ay - 60);
    beamGrad.addColorStop(0, "rgba(255, 214, 122, " + (0.44 * st.lampProg).toFixed(3) + ")");
    beamGrad.addColorStop(0.55, "rgba(255, 204, 110, " + (0.20 * st.lampProg).toFixed(3) + ")");
    beamGrad.addColorStop(1, "rgba(255, 204, 110, 0)");
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 28, cy + 8);
    ctx.lineTo(ax - sw, ay - 75);
    ctx.lineTo(ax + sw, ay - 75);
    ctx.lineTo(cx + 28, cy + 8);
    ctx.closePath();
    ctx.fill();

    // Bottom brass headlamp hood peeking at 6-o'clock inside glass
    var hoodGrad = ctx.createLinearGradient(cx - 34, cy - 22, cx + 34, cy);
    hoodGrad.addColorStop(0, "#6d4e20");
    hoodGrad.addColorStop(0.5, "#d8ac5c");
    hoodGrad.addColorStop(1, "#5c4018");
    ctx.fillStyle = hoodGrad;
    ctx.strokeStyle = "#1d1509";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(cx, cy + 8, 34, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Floating illuminated silt motes in the beam
    ctx.fillStyle = "rgba(255, 238, 180, " + (0.55 * st.lampProg).toFixed(2) + ")";
    for (var m = 0; m < 12; m++) {
      var mx = ax + Math.sin(st.t * 1.1 + m * 2.3) * (sw * 0.65);
      var my = cy - ((st.t * 22 + m * 31) % 240);
      ctx.beginPath();
      ctx.arc(mx, my, 1.4 + (m % 3) * 0.6, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawForegroundKelpAndRocks(ctx, st) {
    var cx = PORT_CX, cy = PORT_CY, trimY = st.ballastProg * 14;
    ctx.save();
    // Left & right creek boulders
    ctx.fillStyle = "#244745";
    ctx.strokeStyle = "#112221";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - 195, cy + 55 - trimY * 0.3);
    ctx.quadraticCurveTo(cx - 140, cy + 38 - trimY * 0.3, cx - 108, cy + 82 - trimY * 0.3);
    ctx.lineTo(cx - 195, cy + 165);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 195, cy + 68 - trimY * 0.3);
    ctx.quadraticCurveTo(cx + 135, cy + 54 - trimY * 0.3, cx + 104, cy + 108 - trimY * 0.3);
    ctx.lineTo(cx + 195, cy + 165);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Swaying ribbon-grass / vallisneria blades
    var fronds = [
      [cx - 152, cy + 62, 78, -1],
      [cx - 135, cy + 72, 64, 1],
      [cx + 138, cy + 95, 84, -1],
      [cx + 154, cy + 88, 68, 1]
    ];
    for (var fi = 0; fi < fronds.length; fi++) {
      var fr = fronds[fi];
      var sway = Math.sin(st.t * 2.1 + fi * 1.4) * (st.ballastOn ? 6 : 13);
      ctx.fillStyle = fi % 2 === 0 ? "#2f6156" : "#3d7465";
      ctx.strokeStyle = "#112420";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(fr[0] - 4, fr[1]);
      ctx.quadraticCurveTo(fr[0] + sway * 0.5, fr[1] - fr[2] * 0.5, fr[0] + sway, fr[1] - fr[2]);
      ctx.quadraticCurveTo(fr[0] + 6 + sway * 0.5, fr[1] - fr[2] * 0.5, fr[0] + 4, fr[1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function lerpColor(hexA, hexB, u) {
    u = clamp(u, 0, 1);
    var a = parseInt(hexA.slice(1), 16);
    var b = parseInt(hexB.slice(1), 16);
    var r = Math.round(lerp((a >> 16) & 255, (b >> 16) & 255, u));
    var g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, u));
    var bl = Math.round(lerp(a & 255, b & 255, u));
    return "rgb(" + r + "," + g + "," + bl + ")";
  }

  // ===========================================================================
  // SCENE #16 · AFT — "Identical twin Turkey Sub waving back"
  // Turkey: "Pond mirror or yesterday’s crew?"
  // Trout:  "Two-headed tin monster or traffic jam?"
  // Rule:   Temporal Double (SCION 36) · Default tool: ballast
  // ===========================================================================
  function renderScene16(ctx, st) {
    var cx = PORT_CX, cy = PORT_CY;
    var trimY = st.ballastProg * 18;
    var vis = Math.max(st.ballastProg, st.lampProg, st.act >= 2 ? 0.85 : 0.18);

    // Heinz Edelmann Sea-of-Time flat horizontal color bands (ochre-teal & cerulean!)
    drawCommonRiverBackdrop(ctx, st, {
      duskTop: "#0e2429", duskMid: "#132e33", duskBot: "#0c1e22",
      litTop: "#276c74", litMid: "#398887", litBot: "#1f4e52"
    });

    // Horizontal Sea-of-Time strata bands
    var bands = [
      [-150, 34, "rgba(218, 178, 98, 0.16)"],
      [-86, 40, "rgba(86, 178, 176, 0.18)"],
      [-18, 36, "rgba(226, 166, 92, 0.13)"],
      [48, 44, "rgba(42, 112, 118, 0.22)"]
    ];
    for (var bi = 0; bi < bands.length; bi++) {
      ctx.fillStyle = bands[bi][2];
      ctx.fillRect(cx - 195, cy + bands[bi][0] + trimY * 0.5, 390, bands[bi][1]);
    }

    // Riverbed floor
    ctx.fillStyle = "#1b3d3d";
    ctx.fillRect(cx - 195, cy + 88 + trimY * 0.6, 390, 120);

    // Optional volumetric lamp beam
    drawSubSearchlightBeam(ctx, st, cx, cy - 20, 125);

    // Act 2a (2.0..3.55s): Vertical Pond-Mirror shimmer plane!
    // Act 2b (3.55..5.6s): Temporal Double breaks mirror symmetry — twin glides & spins clock!
    var mirrorAlpha = st.act === 2 ? (1 - smoothstep(3.45, 3.85, st.t)) * 0.55 : 0;
    if (mirrorAlpha > 0.02) {
      ctx.save();
      ctx.strokeStyle = "rgba(220, 255, 250, " + mirrorAlpha.toFixed(2) + ")";
      ctx.lineWidth = 2.0;
      ctx.setLineDash([7, 6]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - 175);
      ctx.lineTo(cx, cy + 175);
      ctx.stroke();
      ctx.restore();
    }

    // Twin Sub motion:
    // Act 1: settles down symmetrically when ballast snaps in!
    // Act 2a (2.0..3.5s): centered mirror reflection, waves 1 wing in sync with our Turkey!
    // Act 2b (3.55..5.6s): glides horizontally + spins copper periscope & backward pocket-clock!
    // Act 3 (5.6..10.0s): counter-glides nose-to-tail against a second tin nose ("two-headed tin monster" -> creek traffic jam!)
    var twinX = cx;
    var twinY = cy + 16 - st.ballastProg * 14 + Math.sin(st.t * 2.0) * 3.5;
    var periscopeTurn = 0;
    var twinWaveL = 0, twinWaveR = 0;
    var clockSpin = -st.t * 1.2;

    if (st.act === 2) {
      if (st.t < 3.55) {
        // Mirror phase: exact mirror of our Turkey's wave (2.1..3.45s)
        var wu = st.t >= 2.1 && st.t <= 3.45 ? Math.sin(((st.t - 2.1) / 1.35) * Math.PI) : 0;
        twinWaveR = wu * (0.65 + 0.35 * Math.sin(st.t * 9.0));
        periscopeTurn = 0;
      } else {
        // Temporal Double clinamen ("yesterday's crew!"): twin glides left/right independently & waves BOTH wings!
        var td = smoothstep(3.55, 5.4, st.t);
        twinX = cx + Math.sin((st.t - 3.55) * 2.4) * 34;
        periscopeTurn = Math.sin((st.t - 3.55) * 4.5) * 0.45;
        twinWaveL = 0.55 + 0.42 * Math.sin(st.t * 10.5);
        twinWaveR = 0.55 + 0.42 * Math.cos(st.t * 10.5);
        clockSpin = -(st.t - 3.55) * 9.5; // spinning backwards through Sea of Time!
      }
    } else if (st.act === 3) {
      twinX = cx - 26 + Math.sin((st.t - 5.6) * 1.8) * 14;
      twinY = cy + 4;
      periscopeTurn = 0.32;
      twinWaveR = 0.4 + 0.3 * Math.sin(st.t * 6);
    }

    // In Act 3 ("Two-headed tin monster or traffic jam?"), draw a second opposing tin snout & minnow commuter queue!
    if (st.act === 3) {
      var jamIn = smoothstep(5.7, 6.5, st.t);
      ctx.save();
      ctx.translate(cx + 88 + (1 - jamIn) * 65, twinY + 6);
      // Second tin commuter pod nose-to-tail creating a "two-headed tin monster / traffic jam" silhouette!
      ctx.fillStyle = "#7c9499";
      ctx.strokeStyle = "#162224";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-42, -36);
      ctx.lineTo(38, -28);
      ctx.lineTo(46, 26);
      ctx.lineTo(-48, 30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Opposing copper periscope pointing RIGHT
      ctx.fillStyle = "#b87a44";
      ctx.fillRect(-12, -58, 10, 22);
      ctx.strokeRect(-12, -58, 10, 22);
      ctx.fillRect(-12, -60, 22, 9);
      ctx.strokeRect(-12, -60, 22, 9);
      // Tiny commuter window with impatient minnow driver
      ctx.fillStyle = "#ffe6a3";
      ctx.beginPath();
      ctx.arc(-8, -2, 18, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#3f6354";
      ctx.beginPath();
      ctx.ellipse(-6, 0, 11, 5, 0, 0, TAU);
      ctx.fill();
      ctx.restore();

      // Tiny queued tin-can floats in background lane (traffic jam!)
      if (st.t > 7.0) {
        var qAlpha = smoothstep(7.0, 7.6, st.t);
        ctx.save();
        ctx.globalAlpha = qAlpha;
        for (var qi = 0; qi < 2; qi++) {
          var qx = cx - 138 + qi * 38;
          var qy = cy - 42 + qi * 16 + Math.sin(st.t * 4 + qi) * 2;
          roundRectPath(ctx, qx - 16, qy - 10, 32, 20, 6);
          ctx.fillStyle = qi === 0 ? "#c98b43" : "#6c989c";
          ctx.strokeStyle = "#162224";
          ctx.lineWidth = 1.6;
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // Draw the Identical Twin Bread-Roll-Tin Turkey Sub!
    ctx.save();
    ctx.globalAlpha = clamp(0.32 + vis * 0.68, 0, 1);
    ctx.translate(twinX, twinY);

    // Copper side pipes (matching p16.jpg!)
    ctx.strokeStyle = "#1b1610";
    ctx.lineWidth = 7.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-26, -66);
    ctx.lineTo(-68, -66);
    ctx.lineTo(-68, -32);
    ctx.moveTo(-64, 14);
    ctx.lineTo(-82, 14);
    ctx.lineTo(-82, 62);
    ctx.lineTo(-45, 62);
    ctx.stroke();

    ctx.strokeStyle = "#bf7d48";
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(-26, -66);
    ctx.lineTo(-68, -66);
    ctx.lineTo(-68, -32);
    ctx.moveTo(-64, 14);
    ctx.lineTo(-82, 14);
    ctx.lineTo(-82, 62);
    ctx.lineTo(-45, 62);
    ctx.stroke();

    // Articulated Copper Periscope on top turret (waves/turns!)
    ctx.save();
    ctx.translate(0, -82);
    ctx.rotate(periscopeTurn);
    ctx.fillStyle = "#bf7d48";
    ctx.strokeStyle = "#1c150e";
    ctx.lineWidth = 2.0;
    ctx.fillRect(-7, -34, 14, 34);
    ctx.strokeRect(-7, -34, 14, 34);
    ctx.fillRect(-18, -38, 25, 13);
    ctx.strokeRect(-18, -38, 25, 13);
    ctx.fillStyle = "#a8e6e2";
    ctx.beginPath();
    ctx.ellipse(-18, -31.5, 4, 6.5, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Conning turret collar
    ctx.fillStyle = "#95aeb3";
    ctx.strokeStyle = "#182326";
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, -26, -84, 52, 26, 6);
    ctx.fill();
    ctx.stroke();

    // Sea-of-Time Pocket Clock mounted on turret shoulder (shows yesterday's crew!)
    ctx.save();
    ctx.translate(34, -68);
    ctx.fillStyle = "#f5e8c8";
    ctx.strokeStyle = "#2b2010";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#9e3d1c";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(clockSpin) * 8, Math.sin(clockSpin) * 8);
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(clockSpin * 0.25) * 5.5, Math.sin(clockSpin * 0.25) * 5.5);
    ctx.stroke();
    ctx.restore();

    // Inverted Bread-Roll Tin Trapezoid Hull (with brushed steel sheen & rivets!)
    var tinG = ctx.createLinearGradient(-72, 0, 72, 0);
    tinG.addColorStop(0, "#688287");
    tinG.addColorStop(0.32, "#c6d6d8");
    tinG.addColorStop(0.68, "#94acb0");
    tinG.addColorStop(1, "#51686d");
    ctx.fillStyle = tinG;
    ctx.strokeStyle = "#172225";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-54, -58);
    ctx.lineTo(54, -58);
    ctx.lineTo(70, 52);
    ctx.lineTo(-70, 52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rolled bottom lip of baking tin
    roundRectPath(ctx, -78, 48, 156, 12, 6);
    ctx.fillStyle = "#adc1c4";
    ctx.fill();
    ctx.stroke();

    // Right-side brass thruster horn
    ctx.fillStyle = "#c99f50";
    ctx.beginPath();
    ctx.moveTo(66, 18);
    ctx.lineTo(88, 12);
    ctx.lineTo(84, 30);
    ctx.lineTo(67, 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Twin Sub's Glowing Brass Porthole + Articulated Twin Turkey Inside!
    ctx.fillStyle = "#b99145";
    ctx.beginPath();
    ctx.arc(0, 4, 41, 0, TAU);
    ctx.fill();
    ctx.stroke();

    var innerGlow = ctx.createRadialGradient(0, 4, 4, 0, 4, 33);
    innerGlow.addColorStop(0, "#fff4cc");
    innerGlow.addColorStop(1, "#ebd089");
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(0, 4, 33, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Miniature Articulated Twin Turkey inside the Twin Sub's window!
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 4, 32, 0, TAU);
    ctx.clip();
    ctx.translate(0, 14);

    // Fanned tail feathers
    ctx.fillStyle = "#7a4928";
    ctx.strokeStyle = "#22140b";
    ctx.lineWidth = 1.4;
    for (var tf = -4; tf <= 4; tf++) {
      ctx.save();
      ctx.rotate(tf * 0.22 - 0.15);
      ctx.beginPath();
      ctx.ellipse(-6, -14, 4.5, 13, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    // Left wing (waves during Temporal Double!)
    ctx.save();
    ctx.translate(-9, -4);
    ctx.rotate(-0.3 - twinWaveL * 1.15);
    ctx.fillStyle = "#61371d";
    ctx.beginPath();
    ctx.ellipse(-6, -4, 9, 4.5, -0.3, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Body & head
    ctx.fillStyle = "#5c341b";
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 10, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(5, -14, 5.5, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Red wattle & gold beak
    ctx.fillStyle = "#c93b2b";
    ctx.beginPath();
    ctx.arc(9, -11, 2.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#e6b44c";
    ctx.beginPath();
    ctx.moveTo(9, -15);
    ctx.lineTo(15, -13);
    ctx.lineTo(9, -12);
    ctx.closePath();
    ctx.fill();

    // Right Waving Wing!
    ctx.save();
    ctx.translate(8, -4);
    ctx.rotate(0.3 - twinWaveR * 1.25);
    ctx.fillStyle = "#7d4827";
    ctx.beginPath();
    ctx.ellipse(9, -5, 11, 5, -0.35, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore(); // end twin porthole clip
    ctx.restore(); // end twin sub

    // Rising bubbles from twin sub
    ctx.strokeStyle = "rgba(225, 252, 250, 0.62)";
    ctx.lineWidth = 1.5;
    for (var bb = 0; bb < 6; bb++) {
      var by = cy + 40 - ((st.t * 36 + bb * 34) % 195);
      var bx = twinX + 78 + Math.sin(st.t * 3 + bb) * 8;
      ctx.beginPath();
      ctx.arc(bx, by, 2.2 + (bb % 3), 0, TAU);
      ctx.stroke();
    }

    drawForegroundKelpAndRocks(ctx, st);

    // Act 3: Brook Trout with Traffic Visor swims into foreground channel directing traffic & peering IN!
    if (st.act === 3) {
      var trEnter = easeOutBack(smoothstep(5.6, 6.35, st.t));
      var trX = lerp(cx + 210, cx + 32, trEnter) + Math.sin(st.t * 2.1) * 10;
      var trY = cy + 68 + Math.cos(st.t * 1.7) * 5;
      var copWave = st.t > 7.2 ? Math.sin(st.t * 8.5) * 0.65 - 0.5 : 0.2;
      drawBrookTrout(ctx, {
        x: trX,
        y: trY,
        scale: 1.05,
        flipX: 1,
        jaw: 0.25 + 0.25 * Math.max(0, Math.sin(st.t * 6.2)),
        swimPhase: st.t * 5.2,
        pectoralAngle: copWave,
        visor: true,
        lookX: -1.8,
        lookY: -0.6
      });
    }
  }

  // ===========================================================================
  // SCENE #17 · DORSAL — "Trout Council stone table arguing budgets"
  // Turkey: "High-court jury or stalled board?"
  // Trout:  "Taxpayer witness or new parking meter?"
  // Rule:   Committee Clinamen (Oulipo) · Default tool: lamp
  // ===========================================================================
  function renderScene17(ctx, st) {
    var cx = PORT_CX, cy = PORT_CY;
    var trimY = st.ballastProg * 16;

    drawCommonRiverBackdrop(ctx, st, {
      duskTop: "#0c1f22", duskMid: "#122a2c", duskBot: "#0a191b",
      litTop: "#235a5c", litMid: "#367872", litBot: "#1c4342"
    });

    // Spotlight cone from our lamp toggle right up onto the stone table!
    drawSubSearchlightBeam(ctx, st, cx, cy + 10, 148);

    var lit = clamp(0.24 + st.lampProg * 0.76 + (st.act >= 2 ? 0.15 : 0), 0, 1);

    // 5 Cardstock Trout Councilors arrayed behind semicircular limestone table!
    // Act 2a (2.0..3.65s): Synchronized High-Court Jury — sternly facing forward, center raises gavel!
    // Act 2b (3.65..5.6s): Committee Clinamen! Councilor #4 swipes a pebble coin -> chaotic jaw-flapping budget argument!
    var clinamen = st.act === 2 ? smoothstep(3.6, 3.95, st.t) : st.act === 3 ? 0.6 : 0;
    var gavelRaise = st.act === 2 ? smoothstep(2.2, 3.3, st.t) * (1 - clinamen * 0.35) : 0;

    var council = [
      { dx: -116, dy: 20, tilt: 0.32, flip: -1 },
      { dx: -64,  dy: -16, tilt: 0.14, flip: -1 },
      { dx: 0,    dy: -28, tilt: 0.0,  flip: 1, chair: true },
      { dx: 64,   dy: -16, tilt: -0.14, flip: 1 },
      { dx: 116,  dy: 20, tilt: -0.32, flip: 1 }
    ];

    ctx.save();
    ctx.globalAlpha = lit;
    for (var ci = 0; ci < council.length; ci++) {
      var c = council[ci];
      var argBob = clinamen * Math.sin(st.t * (7.5 + ci * 1.9) + ci) * 6;
      var argTilt = clinamen * Math.sin(st.t * (5.2 + ci * 1.3)) * 0.14;
      var jawOpen = st.act === 1 ? 0.05 :
                    clinamen > 0.2 ? 0.35 + 0.55 * Math.abs(Math.sin(st.t * (8.0 + ci * 2.1) + ci)) :
                    (ci === 2 ? 0.35 * Math.sin(st.t * 4.5) : 0.08);

      ctx.save();
      ctx.translate(cx + c.dx, cy + c.dy + trimY * 0.5 + argBob);
      ctx.rotate(c.tilt + argTilt);

      // Upright bust of cardstock Trout Councilor with brass split-pin joints!
      var fDir = c.flip;
      ctx.scale(fDir, 1);

      // 2mm cutout drop-shadow
      ctx.fillStyle = "rgba(8, 16, 17, 0.38)";
      ctx.beginPath();
      ctx.ellipse(3, 12, 26, 42, 0, 0, TAU);
      ctx.fill();

      // Spotted olive-cream upright torso
      var cg = ctx.createLinearGradient(-22, -38, 22, 30);
      cg.addColorStop(0, "#4b6848");
      cg.addColorStop(0.55, "#8da371");
      cg.addColorStop(1, "#dfd1b0");
      ctx.fillStyle = cg;
      ctx.strokeStyle = "#17221d";
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(0, -40);
      ctx.quadraticCurveTo(28, -32, 26, 36);
      ctx.lineTo(-24, 36);
      ctx.quadraticCurveTo(-28, -22, 0, -40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Spots on back
      ctx.fillStyle = "#293b27";
      for (var sp = 0; sp < 5; sp++) {
        ctx.beginPath();
        ctx.arc(8 + (sp % 2) * 7, -18 + sp * 9, 2.0, 0, TAU);
        ctx.fill();
      }

      // Hinged frown/argument mouth + brass split-pin at jaw corner!
      ctx.fillStyle = "#6b2d28";
      ctx.beginPath();
      ctx.ellipse(-10, -14 + jawOpen * 4, 11, 2.2 + jawOpen * 5.5, 0.1, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // Tarnished brass split-pin joint on cheek!
      ctx.fillStyle = "#d4ad5a";
      ctx.beginPath();
      ctx.arc(3, -12, 3.0, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // Pince-nez spectacles!
      ctx.fillStyle = "rgba(230, 248, 250, 0.72)";
      ctx.strokeStyle = "#d9b25f";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(-14, -25, 6.2, 0, TAU);
      ctx.arc(-1, -25, 6.2, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#141a19";
      ctx.beginPath();
      ctx.arc(-14, -25, 2.3, 0, TAU);
      ctx.arc(-1, -25, 2.3, 0, TAU);
      ctx.fill();

      // Articulated gesturing pectoral fin (points at Turkey in Act 2a; slams budget / swipes coin in Act 2b!)
      var finRot = st.act === 2 && clinamen < 0.3 ? -0.75 : -0.2 + clinamen * Math.sin(st.t * 9 + ci * 2) * 0.65;
      ctx.save();
      ctx.translate(-14, 8);
      ctx.rotate(finRot);
      ctx.fillStyle = "#c9744f";
      ctx.strokeStyle = "#17221d";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-22, 6, -24, 18);
      ctx.quadraticCurveTo(-8, 16, 4, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Center chair trout holds tiny limestone gavel!
      if (c.chair) {
        ctx.save();
        ctx.translate(-20, 12);
        ctx.rotate(-gavelRaise * 1.15);
        ctx.strokeStyle = "#6e4c29";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-16, -14);
        ctx.stroke();
        ctx.fillStyle = "#9ca89e";
        ctx.fillRect(-23, -21, 12, 8);
        ctx.strokeRect(-23, -21, 12, 8);
        ctx.restore();
      }
      ctx.restore();

      ctx.restore();
    }

    // Pitted Mossy Limestone Round Council Table!
    var ty = cy + 44 + trimY * 0.5;
    // Pedestal
    ctx.fillStyle = "#5f7065";
    ctx.strokeStyle = "#17221e";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - 56, ty + 14);
    ctx.lineTo(cx - 38, ty + 88);
    ctx.lineTo(cx + 38, ty + 88);
    ctx.lineTo(cx + 56, ty + 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Stone slab rim & top
    ctx.fillStyle = "#6e8072";
    ctx.beginPath();
    ctx.ellipse(cx, ty + 10, 134, 34, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    var tabGrad = ctx.createRadialGradient(cx, ty, 12, cx, ty, 132);
    tabGrad.addColorStop(0, st.lampOn ? "#cbd4be" : "#8b9c8e");
    tabGrad.addColorStop(1, "#7b8f7e");
    ctx.fillStyle = tabGrad;
    ctx.beginPath();
    ctx.ellipse(cx, ty, 134, 33, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Moss patches on rim
    ctx.fillStyle = "#4d7347";
    var mossPts = [[-82, 22, 18, 6], [-24, 28, 22, 5], [58, 24, 20, 6]];
    for (var mp = 0; mp < mossPts.length; mp++) {
      ctx.beginPath();
      ctx.ellipse(cx + mossPts[mp][0], ty + mossPts[mp][1], mossPts[mp][2], mossPts[mp][3], 0, 0, TAU);
      ctx.fill();
    }

    // 4 Chiseled Slate Budget Tablets & Stacked River-Pebble Coin Columns!
    var slates = [-88, -32, 32, 88];
    for (var sl = 0; sl < slates.length; sl++) {
      var sx = cx + slates[sl];
      var sy = ty - 2 + Math.abs(slates[sl]) * 0.08;
      var tiltS = clinamen * Math.sin(st.t * 8 + sl) * 0.12;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(tiltS);
      ctx.fillStyle = "#3e5559";
      ctx.strokeStyle = "#162022";
      ctx.lineWidth = 1.6;
      ctx.fillRect(-16, -8, 32, 15);
      ctx.strokeRect(-16, -8, 32, 15);
      // Tiny chalk bar-chart lines
      ctx.strokeStyle = "#d9e6e2";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-11, 3); ctx.lineTo(-11, -3);
      ctx.moveTo(-4, 3);  ctx.lineTo(-4, -5);
      ctx.moveTo(3, 3);   ctx.lineTo(3, -2);
      ctx.moveTo(10, 3);  ctx.lineTo(10, -4);
      ctx.stroke();
      ctx.restore();
    }

    // Stacked pebble-coin piles (with 1 pebble sliding across the table at the clinamen swerve t=3.7s!)
    var stacks = [[-56, 8, 4], [-14, -8, 3], [18, -6, 4], [56, 8, 3]];
    for (var stIdx = 0; stIdx < stacks.length; stIdx++) {
      var px = cx + stacks[stIdx][0];
      var py = ty + stacks[stIdx][1];
      var cnt = stacks[stIdx][2];
      for (var pk = 0; pk < cnt; pk++) {
        ctx.fillStyle = pk % 2 === 0 ? "#a9a38c" : "#8e8872";
        ctx.strokeStyle = "#1e211b";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(px, py - pk * 4.5, 9 - pk * 1.1, 3.6, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
    }
    // Clinamen swiped pebble sliding from left stack to right stack!
    if (clinamen > 0.05) {
      var swipeX = lerp(cx - 52, cx + 52, clamp((st.t - 3.6) / 0.85, 0, 1));
      ctx.fillStyle = "#e2c46d";
      ctx.strokeStyle = "#1e211b";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(swipeX, ty + 12, 8.5, 3.8, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    drawForegroundKelpAndRocks(ctx, st);

    // Act 3: Bespectacled Auditor Brook Trout swims up to the glass with clipboard & pebble coin!
    // Tries to feed the pebble coin into our 2-o'clock rim chip ("Taxpayer witness or new parking meter?")!
    if (st.act === 3) {
      var enterU = easeOutBack(smoothstep(5.6, 6.4, st.t));
      var meterReach = smoothstep(7.3, 8.4, st.t);
      var ax = lerp(cx + 190, cx + 62, enterU) + meterReach * 28;
      var ay = lerp(cy + 85, cy + 42, enterU) - meterReach * 92; // rises toward 2-o'clock rim chip!
      drawBrookTrout(ctx, {
        x: ax,
        y: ay,
        scale: 1.02,
        flipX: 1,
        jaw: 0.2 + 0.25 * Math.max(0, Math.sin(st.t * 5.5)),
        swimPhase: st.t * 4.8,
        pitchRad: meterReach * 0.28,
        glasses: true,
        coin: true,
        pectoralAngle: meterReach > 0.2 ? -0.95 : 0.15,
        lookX: -2.0,
        lookY: -0.4
      });
    }
  }

  // ===========================================================================
  // SCENE #18 · VENT — "Steamer trunk with star cutout peephole"
  // Turkey: "Sunken pirate chest or magic box?"
  // Trout:  "Stage magician’s assistant or lost luggage?"
  // Rule:   Reverse Peephole (SCION 17) · Default tool: lamp
  // ===========================================================================
  function renderScene18(ctx, st) {
    var cx = PORT_CX, cy = PORT_CY;
    var trimY = st.ballastProg * 16;

    // Deep 6000K Prussian-blue creek water
    drawCommonRiverBackdrop(ctx, st, {
      duskTop: "#091b26", duskMid: "#0f2938", duskBot: "#081720",
      litTop: "#1a4e66", litMid: "#24687d", litBot: "#153d4d"
    });

    // Gravel riverbed
    ctx.fillStyle = "#22464b";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 125 + trimY * 0.5, 210, 82, 0, 0, TAU);
    ctx.fill();

    // Our searchlight hits the trunk at t >= 1.0s...
    drawSubSearchlightBeam(ctx, st, cx + 10, cy + 15, 130);

    // ...and triggers the Reverse Peephole 2700K stage footlight beaming OUT of the 5-pointed star!
    var reverseBeam = st.lampOn ? smoothstep(1.15, 1.65, st.viewMode === "auto" ? st.t : 2.0) : (st.act >= 2 ? 0.65 : 0);

    // Lid opening mechanics:
    // Act 2a (2.0..3.6s): Pirate chest creaks open 14px glinting gold doubloons!
    // Act 2b (3.65..5.6s): Magic box — red velvet stage curtains + magician wand & silk streamer!
    // Act 3  (5.6..10.0s): Brook Trout peers out of the star cutout (5.6..6.8s), then trunk hinges open & Brook swims up with baggage tag!
    var pirateOpen = st.act === 2 && st.t < 3.65 ? Math.sin(smoothstep(2.0, 2.8, st.t) * Math.PI * 0.85) * 14 : 0;
    var magicMode = st.act === 2 && st.t >= 3.65 ? smoothstep(3.65, 4.1, st.t) : 0;
    var troutEmerges = st.act === 3 ? smoothstep(6.9, 7.7, st.t) : 0;
    var lidLift = pirateOpen + troutEmerges * 22;

    var tx = cx + 8, ty = cy + 18 + trimY * 0.5;

    ctx.save();
    ctx.translate(tx, ty);

    // 3/4 Isometric Scuffed Leather Steamer Trunk Base!
    // Left side panel
    ctx.fillStyle = "#5c4128";
    ctx.strokeStyle = "#17110b";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-116, -24);
    ctx.lineTo(-42, 4);
    ctx.lineTo(-42, 74);
    ctx.lineTo(-116, 44);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Leather side carrying handle + Lost Luggage Manila Tag in Act 3!
    ctx.strokeStyle = "#3a2514";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-96, 10);
    ctx.quadraticCurveTo(-79, 24, -62, 22);
    ctx.stroke();

    // Front main panel
    var leatherG = ctx.createLinearGradient(-42, 0, 108, 74);
    leatherG.addColorStop(0, "#7d5836");
    leatherG.addColorStop(1, "#4f3721");
    ctx.fillStyle = leatherG;
    ctx.beginPath();
    ctx.moveTo(-42, 4);
    ctx.lineTo(108, -18);
    ctx.lineTo(108, 52);
    ctx.lineTo(-42, 74);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Interior cavity glow & pirate doubloons / magic silk streamer when lid lifts!
    if (lidLift > 1) {
      ctx.fillStyle = "#2b160c";
      ctx.beginPath();
      ctx.moveTo(-42, 4);
      ctx.lineTo(108, -18);
      ctx.lineTo(108, -18 - lidLift);
      ctx.lineTo(-42, 4 - lidLift);
      ctx.closePath();
      ctx.fill();

      if (pirateOpen > 2) {
        // Glinting pirate gold doubloons & pearl strand along open seam!
        for (var gd = 0; gd < 9; gd++) {
          ctx.fillStyle = gd % 2 === 0 ? "#ffd452" : "#f59e0b";
          ctx.beginPath();
          ctx.arc(-26 + gd * 15, -gd * 2.1 - 3, 5.2, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    // Arched Steamer Trunk Lid (lifts by lidLift!)
    ctx.save();
    ctx.translate(0, -lidLift);

    // Left arched end of lid
    ctx.fillStyle = "#6c4d30";
    ctx.beginPath();
    ctx.moveTo(-116, -24);
    ctx.quadraticCurveTo(-112, -78, -76, -74);
    ctx.quadraticCurveTo(-44, -66, -42, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Front arched vault of lid
    var lidG = ctx.createLinearGradient(0, -86, 0, 4);
    lidG.addColorStop(0, "#966c44");
    lidG.addColorStop(0.55, "#785434");
    lidG.addColorStop(1, "#5c3f26");
    ctx.fillStyle = lidG;
    ctx.beginPath();
    ctx.moveTo(-42, 4);
    ctx.quadraticCurveTo(-40, -64, -6, -68);
    ctx.lineTo(102, -84);
    ctx.quadraticCurveTo(114, -76, 108, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hammered Brass Trim Bands & Buckle Straps with rivets!
    var strapXs = [-14, 72];
    for (var sx = 0; sx < strapXs.length; sx++) {
      var bx0 = strapXs[sx];
      ctx.fillStyle = "#b58b42";
      ctx.beginPath();
      ctx.moveTo(bx0 - 7, 1 - (bx0 + 42) * 0.14);
      ctx.quadraticCurveTo(bx0 - 5, -62 - (bx0 + 42) * 0.11, bx0 + 16, -71 - (bx0 + 42) * 0.11);
      ctx.lineTo(bx0 + 25, -69 - (bx0 + 42) * 0.11);
      ctx.quadraticCurveTo(bx0 + 6, -58 - (bx0 + 42) * 0.11, bx0 + 4, -1 - (bx0 + 42) * 0.14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Beveled 5-Pointed Star Cutout Peephole on center of arched lid!
    var starX = 35, starY = -36;
    ctx.save();
    ctx.translate(starX, starY);

    ctx.beginPath();
    for (var sp = 0; sp < 10; sp++) {
      var rad = sp % 2 === 0 ? 31 : 13.5;
      var sang = -Math.PI / 2 + (sp * Math.PI) / 5;
      var px = Math.cos(sang) * rad;
      var py = Math.sin(sang) * rad;
      if (sp === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    // Warm 2700K interior tungsten backing inside star
    ctx.fillStyle = reverseBeam > 0.1 ? "#ffe296" : "#221810";
    ctx.fill();
    ctx.strokeStyle = "#f2c96b";
    ctx.lineWidth = 3.0;
    ctx.stroke();

    // Clip inside the 5-pointed star peephole for Reverse Peephole contents!
    ctx.save();
    ctx.clip();

    if (st.act === 1 || (st.act === 2 && magicMode < 0.35)) {
      // Sunken Pirate Chest eye blinking out through the star!
      var blinkE = Math.abs(Math.sin(st.t * 2.6)) > 0.94 ? 0.15 : 1;
      ctx.fillStyle = "#faf3e0";
      ctx.beginPath();
      ctx.ellipse(0, 2, 16, 11 * blinkE, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#1f150d";
      ctx.lineWidth = 1.8;
      ctx.stroke();
      if (blinkE > 0.25) {
        var lookShift = Math.sin(st.t * 2.2) * 4;
        ctx.fillStyle = "#2b4c3f";
        ctx.beginPath();
        ctx.arc(lookShift, 2, 6.5, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(lookShift, 2, 3.2, 0, TAU);
        ctx.fill();
      }
      // Tiny pirate eyepatch strap across corner during Act 2a!
      if (st.act === 2) {
        ctx.strokeStyle = "#1c1613";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(-24, -14);
        ctx.lineTo(24, -4);
        ctx.stroke();
      }
    } else if (st.act === 2) {
      // Magic Box parlor stage curtains parting inside the star!
      var part = magicMode * 11;
      ctx.fillStyle = "#9e2428";
      ctx.fillRect(-28, -28, 22 - part * 0.5, 56);
      ctx.fillRect(6 + part * 0.5, -28, 22, 56);
      // Swirling gold stage stars inside magic box
      ctx.fillStyle = "#fff8d6";
      ctx.beginPath();
      ctx.arc(Math.sin(st.t * 5) * 5, 2, 5, 0, TAU);
      ctx.fill();
    } else if (st.act === 3 && troutEmerges < 0.55) {
      // Act 3 opening (5.6..7.1s): Spotted Brook Trout face peering right out of the 5-pointed star (exact homage to p18.jpg!)
      drawBrookTrout(ctx, {
        x: 34,
        y: 5,
        scale: 0.68,
        flipX: 1,
        jaw: 0.25 + 0.2 * Math.sin(st.t * 6),
        swimPhase: st.t * 5,
        lookX: -2.0,
        lookY: 0
      });
    }
    ctx.restore(); // end star clip

    // Magician's black-and-white wand + silk ribbon poking OUT of the star cutout in Act 2b!
    if (magicMode > 0.25) {
      ctx.save();
      var wandRot = Math.sin(st.t * 7.5) * 0.35 - 0.3;
      ctx.rotate(wandRot);
      ctx.fillStyle = "#18181b";
      ctx.strokeStyle = "#faf8f3";
      ctx.lineWidth = 1.2;
      ctx.fillRect(-4, -2, 36, 5);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(25, -2, 8, 5);
      ctx.fillRect(-4, -2, 6, 5);
      // Colorful magic silk streamer waving out!
      ctx.strokeStyle = "#e53e3e";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(32, 0);
      ctx.quadraticCurveTo(44, -14 + Math.sin(st.t * 9) * 8, 54, -4);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore(); // end star translate
    ctx.restore(); // end lid lift

    // Brass Keyhole Escutcheon on front seam
    ctx.fillStyle = "#c99e4c";
    ctx.strokeStyle = "#1c140a";
    ctx.lineWidth = 1.8;
    roundRectPath(ctx, 26, -12, 18, 22, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1c140a";
    ctx.beginPath();
    ctx.arc(35, -3, 2.8, 0, TAU);
    ctx.fill();
    ctx.fillRect(33.5, -3, 3, 7);

    // Reverse Peephole 2700K Volumetric Tungsten Star-Shaft projecting OUT toward viewer!
    if (reverseBeam > 0.05) {
      ctx.save();
      var rGrad = ctx.createLinearGradient(35, -36 - lidLift, -40, 120);
      rGrad.addColorStop(0, "rgba(255, 224, 130, " + (0.42 * reverseBeam).toFixed(2) + ")");
      rGrad.addColorStop(1, "rgba(255, 200, 95, 0)");
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.moveTo(14, -36 - lidLift);
      ctx.lineTo(56, -36 - lidLift);
      ctx.lineTo(95, 130);
      ctx.lineTo(-85, 130);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore(); // end trunk translate

    drawForegroundKelpAndRocks(ctx, st);

    // Act 3b (7.0..10.0s): Brook Trout emerges as Magician's Assistant with starred collar AND Lost-Luggage string tag!
    if (st.act === 3 && troutEmerges > 0.05) {
      var bx = lerp(tx + 28, cx - 18, troutEmerges) + Math.sin(st.t * 2.4) * 8;
      var by = lerp(ty - 24, cy + 56, troutEmerges);
      // Fluttering Manila Baggage Claim Tag tethered by twine!
      ctx.save();
      ctx.strokeStyle = "#e6d8b5";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tx - 78, ty + 18);
      ctx.quadraticCurveTo(cx - 60, cy + 72, bx + 18, by + 12);
      ctx.stroke();

      ctx.translate(bx + 26, by + 18);
      ctx.rotate(Math.sin(st.t * 5.2) * 0.18 + 0.2);
      ctx.fillStyle = "#ebd49c";
      ctx.strokeStyle = "#2b2113";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-14, -8);
      ctx.lineTo(14, -8);
      ctx.lineTo(18, 0);
      ctx.lineTo(14, 8);
      ctx.lineTo(-14, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#9e2a2b";
      ctx.beginPath();
      ctx.arc(11, 0, 2.5, 0, TAU);
      ctx.fill();
      ctx.restore();

      drawBrookTrout(ctx, {
        x: bx,
        y: by,
        scale: 1.0,
        flipX: -1, // faces right/center toward glass
        jaw: 0.22 + 0.22 * Math.max(0, Math.sin(st.t * 6.5)),
        swimPhase: st.t * 5.0,
        collar: true,
        pectoralAngle: -0.55 + Math.sin(st.t * 6.0) * 0.35,
        lookX: 1.6,
        lookY: -0.5
      });
    }
  }

  // ===========================================================================
  // SCENE #19 · BILGE — "Raw potato skewered with 10 bendy straws"
  // Turkey: "Spiky sea urchin or 14.7 PSI meter?"
  // Trout:  "Science-fair judge or potato-eating pest?"
  // Rule:   Hydrostatic Gauge (SCION 09) · Default tool: ballast
  // ===========================================================================
  function renderScene19(ctx, st) {
    var cx = PORT_CX, cy = PORT_CY;
    var trimY = st.ballastProg * 18;
    var psiActive = Math.max(st.ballastProg, st.act >= 2 ? 0.85 : 0);

    // Hand-stenciled Méliès Prussian-blue water & grisaille seafloor sand!
    drawCommonRiverBackdrop(ctx, st, {
      duskTop: "#0b2228", duskMid: "#12343a", duskBot: "#0c2024",
      litTop: "#206470", litMid: "#348486", litBot: "#1c4a4e"
    });

    // Grisaille seafloor sand ripples
    ctx.fillStyle = "#264d4b";
    ctx.fillRect(cx - 195, cy + 92 + trimY * 0.5, 390, 115);

    drawSubSearchlightBeam(ctx, st, cx - 10, cy, 130);

    // Potato motion:
    // Act 1: resting low, bendy straws drooped/kinked inward until ballast snaps in at t=1.0s -> Hydrostatic Gauge erects straws!
    // Act 2a (2.0..3.65s): Spiky Sea Urchin — rocks & walks on lower straws, bristling radially!
    // Act 2b (3.65..5.6s): 14.7 PSI Meter — settles onto brass wire lab ring, graduated PSI ticks + 10 synchronized 120-BPM bubble streams!
    // Act 3  (5.6..10.0s): Brook Trout with 1st-Place Science Fair ribbon inspects gauge, then shoos our "potato-eating pest" sub back!
    var urchinMode = st.act === 2 && st.t < 3.65 ? 1 : 0;
    var gaugeMode = (st.act === 2 && st.t >= 3.65) ? smoothstep(3.65, 4.1, st.t) : (st.act === 3 ? 1 : 0);

    var potX = cx - 14 + (urchinMode ? Math.sin(st.t * 4.5) * 14 : 0);
    var potY = cy + 6 + trimY * 0.35 + (urchinMode ? Math.abs(Math.cos(st.t * 4.5)) * -8 : Math.sin(st.t * 2.2) * 3);
    var potRot = urchinMode ? Math.sin(st.t * 4.5) * 0.14 : -0.08;

    // Brass lab tripod stand appearing under potato during PSI Meter reading!
    if (gaugeMode > 0.05) {
      ctx.save();
      ctx.globalAlpha = gaugeMode;
      ctx.strokeStyle = "#cfa455";
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.ellipse(potX, potY + 58, 38, 9, 0, 0, TAU);
      ctx.moveTo(potX - 34, potY + 58); ctx.lineTo(potX - 46, potY + 98);
      ctx.moveTo(potX + 34, potY + 58); ctx.lineTo(potX + 46, potY + 98);
      ctx.moveTo(potX, potY + 67);      ctx.lineTo(potX, potY + 102);
      ctx.stroke();
      ctx.restore();
    }

    // Define EXACTLY 10 hand-stenciled striped bendy straws skewered radially!
    var straws = [
      { ang: -1.55, bend: 0.42,  col: "#74c67a", len1: 42, len2: 38 }, // 1: top green (manometer column!)
      { ang: -1.08, bend: 0.55,  col: "#f08c5b", len1: 44, len2: 36 }, // 2: top-right orange
      { ang: -0.62, bend: 0.48,  col: "#6eb5e5", len1: 46, len2: 38 }, // 3: upper-right blue
      { ang: -0.18, bend: 0.52,  col: "#f2d05e", len1: 46, len2: 36 }, // 4: mid-right yellow
      { ang:  0.32, bend: 0.58,  col: "#82cf86", len1: 42, len2: 36 }, // 5: lower-right green
      { ang:  0.88, bend: 0.45,  col: "#f08c5b", len1: 40, len2: 34 }, // 6: bottom-right coral
      { ang:  1.45, bend: -0.45, col: "#7bbde8", len1: 40, len2: 32 }, // 7: bottom blue
      { ang:  2.08, bend: -0.52, col: "#f08575", len1: 44, len2: 36 }, // 8: bottom-left rose
      { ang:  2.65, bend: -0.48, col: "#a5d977", len1: 46, len2: 36 }, // 9: mid-left lime
      { ang: -2.35, bend: -0.50, col: "#f2cf63", len1: 44, len2: 38 }  // 10: upper-left yellow
    ];

    ctx.save();
    ctx.translate(potX, potY);
    ctx.rotate(potRot);

    // Draw back-layer straws (even indices) -> Russet Potato -> front-layer straws (odd indices) for real 3D skewering!
    function drawStraw(idx) {
      var s = straws[idx];
      var baseRX = Math.cos(s.ang) * 32;
      var baseRY = Math.sin(s.ang) * 44;

      // Corrugated elbow flexes with hydrostatic ballast pressure + 120-BPM gauge pulse!
      var beat120 = Math.sin(st.t * TAU * 2.0 + idx * 0.55); // 120 BPM = 2 Hz!
      var droop = (1 - psiActive) * (s.ang < 0 ? 0.55 : -0.35);
      var urchinBristle = urchinMode ? Math.sin(st.t * 7.5 + idx) * 0.22 : 0;
      var elbowBend = s.bend + droop + urchinBristle + gaugeMode * beat120 * 0.12;

      var ex = baseRX + Math.cos(s.ang) * s.len1;
      var ey = baseRY + Math.sin(s.ang) * s.len1;
      var tipAng = s.ang + elbowBend;
      var txp = ex + Math.cos(tipAng) * s.len2;
      var typ = ey + Math.sin(tipAng) * s.len2;

      // Insertion dimple on potato skin
      ctx.fillStyle = "#4a331d";
      ctx.beginPath();
      ctx.arc(baseRX, baseRY, 4.8, 0, TAU);
      ctx.fill();

      // Outer ink stroke of bendy straw
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#18201e";
      ctx.lineWidth = 9.2;
      ctx.beginPath();
      ctx.moveTo(baseRX, baseRY);
      ctx.lineTo(ex, ey);
      ctx.lineTo(txp, typ);
      ctx.stroke();

      // Cream translucent straw body
      ctx.strokeStyle = "#f7f2e4";
      ctx.lineWidth = 5.8;
      ctx.stroke();

      // Colored candy stripe + rising Prussian-blue / aniline dye meniscus!
      ctx.strokeStyle = s.col;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(baseRX, baseRY);
      ctx.lineTo(ex, ey);
      ctx.lineTo(lerp(ex, txp, 0.35 + psiActive * 0.55), lerp(ey, typ, 0.35 + psiActive * 0.55));
      ctx.stroke();

      // Corrugated accordion rings at the elbow!
      ctx.fillStyle = s.col;
      ctx.strokeStyle = "#18201e";
      ctx.lineWidth = 1.3;
      for (var cr = -2; cr <= 2; cr++) {
        var cxr = ex + Math.cos(s.ang + elbowBend * 0.5) * (cr * 3.2);
        var cyr = ey + Math.sin(s.ang + elbowBend * 0.5) * (cr * 3.2);
        ctx.beginPath();
        ctx.arc(cxr, cyr, 4.2, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }

      // Graduated meniscus tick-marks along Straw #0 in PSI Gauge mode!
      if (idx === 0 && gaugeMode > 0.2) {
        ctx.strokeStyle = "rgba(255, 245, 190, " + gaugeMode.toFixed(2) + ")";
        ctx.lineWidth = 1.6;
        for (var gt = 1; gt <= 5; gt++) {
          var gx = lerp(baseRX, ex, gt / 5.5);
          var gy = lerp(baseRY, ey, gt / 5.5);
          ctx.beginPath();
          ctx.moveTo(gx + 6, gy);
          ctx.lineTo(gx + 13, gy);
          ctx.stroke();
        }
      }

      // Silver 14.7-PSI bubble stream rising from straw tip when pressurized!
      if (psiActive > 0.25) {
        for (var b = 0; b < 2; b++) {
          var bProg = (st.t * 2.0 + idx * 0.17 + b * 0.5) % 1;
          var bbx = txp + Math.sin(bProg * 8 + idx) * 4;
          var bby = typ - bProg * 36;
          ctx.fillStyle = "rgba(230, 252, 255, " + ((1 - bProg) * 0.85).toFixed(2) + ")";
          ctx.strokeStyle = "#152b2e";
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.arc(bbx, bby, 3.2 * (1 - bProg * 0.4), 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    for (var s0 = 0; s0 < 10; s0 += 2) drawStraw(s0);

    // Organic Lumpy Raw Russet Potato Body!
    var potGrad = ctx.createRadialGradient(-14, -18, 8, 4, 8, 68);
    potGrad.addColorStop(0, "#c89f68");
    potGrad.addColorStop(0.58, "#9c7343");
    potGrad.addColorStop(1, "#5c3f21");
    ctx.fillStyle = potGrad;
    ctx.strokeStyle = "#1c130a";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(-4, -62);
    ctx.bezierCurveTo(38, -64, 54, -26, 48, 8);
    ctx.bezierCurveTo(52, 44, 26, 66, -2, 64);
    ctx.bezierCurveTo(-36, 62, -52, 30, -48, -6);
    ctx.bezierCurveTo(-54, -40, -34, -60, -4, -62);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Potato skin speckles & eyes
    var eyes = [[-16, -24], [14, -12], [-8, 12], [16, 26], [-22, 32], [4, -38]];
    ctx.fillStyle = "#4d341a";
    for (var ei = 0; ei < eyes.length; ei++) {
      ctx.beginPath();
      ctx.ellipse(eyes[ei][0], eyes[ei][1], 3.4, 1.8, ei * 0.5, 0, TAU);
      ctx.fill();
    }

    for (var s1 = 1; s1 < 10; s1 += 2) drawStraw(s1);

    ctx.restore(); // end potato rig

    // Foreground minnows darting across the glass in Act 2a (testing the "sea urchin" spines!)
    if (st.act <= 2) {
      for (var mi = 0; mi < 2; mi++) {
        var mx = cx + Math.cos(st.t * 1.9 + mi * 3.1) * 125;
        var my = cy - 68 + mi * 118 + Math.sin(st.t * 3.2 + mi) * 10;
        ctx.save();
        ctx.translate(mx, my);
        if (Math.sin(st.t * 1.9 + mi * 3.1) > 0) ctx.scale(-1, 1);
        ctx.fillStyle = "#9ecbc4";
        ctx.strokeStyle = "#152829";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 4.5, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(11, 0);
        ctx.lineTo(17, -5);
        ctx.lineTo(17, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    drawForegroundKelpAndRocks(ctx, st);

    // Act 3: Brook Trout wearing 1st-Place Science Fair Ribbon swims in from right (matching p19.jpg!),
    // inspects the potato gauge, then shoos our "potato-eating pest" sub away!
    if (st.act === 3) {
      var uIn = easeOutBack(smoothstep(5.6, 6.4, st.t));
      var shooPhase = smoothstep(7.5, 8.1, st.t);
      var bx = lerp(cx + 205, cx + 98, uIn) - shooPhase * 42;
      var by = cy + 2 + shooPhase * 34 + Math.sin(st.t * 2.6) * 6;
      drawBrookTrout(ctx, {
        x: bx,
        y: by,
        scale: 0.96,
        flipX: 1,
        jaw: 0.18 + 0.28 * Math.max(0, Math.sin(st.t * 7.0)),
        swimPhase: st.t * 5.6,
        ribbon: true,
        pectoralAngle: shooPhase > 0.2 ? Math.sin(st.t * 11.0) * 0.7 - 0.3 : 0.2,
        lookX: -2.0,
        lookY: 0.3
      });
    }
  }

  // ===========================================================================
  // SCENE #20 · DOME — "Stained-glass pebble chapel lancet window"
  // Turkey: "Sunken palace or river choir loft?"
  // Trout:  "Brass church tuba or angel in a jar?"
  // Rule:   Refracted Sunbeams (SCION 24) · Default tool: lamp
  // ===========================================================================
  function renderScene20(ctx, st) {
    var cx = PORT_CX, cy = PORT_CY;
    var trimY = st.ballastProg * 15;

    // Cartoon Saloon Song-of-the-Sea deep sapphire & emerald tapestry backdrop!
    drawCommonRiverBackdrop(ctx, st, {
      duskTop: "#091d28", duskMid: "#0f2e3a", duskBot: "#081920",
      litTop: "#134e63", litMid: "#1e6e7a", litBot: "#12424a"
    });

    var refract = clamp(st.lampProg * 0.92 + (st.act >= 2 ? 0.22 : 0), 0, 1);

    // Song-of-the-Sea geometric concentric ripple halo rings behind the lancet arch!
    ctx.save();
    ctx.strokeStyle = "rgba(164, 236, 228, " + (0.07 + refract * 0.10).toFixed(3) + ")";
    ctx.lineWidth = 1.5;
    for (var cr = 1; cr <= 4; cr++) {
      ctx.beginPath();
      ctx.arc(cx, cy - 34 + trimY * 0.4, 52 + cr * 34 + Math.sin(st.t + cr) * 3, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    // Pointed Gothic Chapel Lancet Window Arch built from colorful river pebbles!
    var archX = cx, archY = cy + 62 + trimY * 0.45;
    var archW = 78, archH = 192;

    ctx.save();
    ctx.translate(archX, archY);

    // Interior stained-glass glow inside the lancet opening!
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-archW + 18, 0);
    ctx.lineTo(-archW + 18, -95);
    ctx.quadraticCurveTo(-archW + 18, -162, 0, -archH + 14);
    ctx.quadraticCurveTo(archW - 18, -162, archW - 18, -95);
    ctx.lineTo(archW - 18, 0);
    ctx.closePath();

    var paneGrad = ctx.createLinearGradient(-55, -180, 55, 0);
    if (refract > 0.25) {
      paneGrad.addColorStop(0, "#7ae8d8");
      paneGrad.addColorStop(0.45, "#a8f0b8");
      paneGrad.addColorStop(1, "#ffe599");
    } else {
      paneGrad.addColorStop(0, "#1c4854");
      paneGrad.addColorStop(1, "#153640");
    }
    ctx.fillStyle = paneGrad;
    ctx.fill();

    // Diagonal stained-glass color facets inside the twin lancet panes
    ctx.clip();
    var shardCols = ["rgba(255,196,110,0.42)", "rgba(92,224,198,0.42)", "rgba(182,130,235,0.34)", "rgba(255,135,162,0.34)"];
    for (var sh = 0; sh < 6; sh++) {
      ctx.fillStyle = shardCols[sh % shardCols.length];
      var shShift = Math.sin(st.t * 0.9 + sh) * 8;
      ctx.beginPath();
      ctx.moveTo(-80 + sh * 32 + shShift, 10);
      ctx.lineTo(10 + sh * 32 + shShift, -200);
      ctx.lineTo(32 + sh * 32 + shShift, -200);
      ctx.lineTo(-58 + sh * 32 + shShift, 10);
      ctx.closePath();
      ctx.fill();
    }

    // Leaded central mullion Y-tracery & 8-petal Rose Oculus at the apex!
    ctx.strokeStyle = "#221b29";
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -104);
    ctx.moveTo(0, -82);
    ctx.quadraticCurveTo(-28, -110, -56, -92);
    ctx.moveTo(0, -82);
    ctx.quadraticCurveTo(28, -110, 56, -92);
    ctx.stroke();

    // Rose Oculus (rotates gently when sunlit!)
    ctx.save();
    ctx.translate(0, -132);
    ctx.rotate(st.t * 0.22 * refract);
    var petalCols = ["#e85d75", "#f5b841", "#52c49c", "#5b9bd5", "#b76ec8", "#f28c52", "#6fd4c2", "#f5d565"];
    for (var pt = 0; pt < 8; pt++) {
      ctx.save();
      ctx.rotate((pt * TAU) / 8);
      ctx.fillStyle = petalCols[pt];
      ctx.strokeStyle = "#221b29";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, -14, 5.5, 11, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = "#ffe066";
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore(); // end lancet interior clip

    // Smooth Translucent Creek-Pebble Arch Masonry (44 individual jewel-toned river pebbles!)
    var pebblePalette = ["#d97a54", "#e6b85c", "#59b39c", "#5a8ec9", "#b86b82", "#8fc476", "#c9965b"];
    function drawArchPebble(px, py, rx, ry, rot, idx) {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rot);
      var col = pebblePalette[idx % pebblePalette.length];
      ctx.fillStyle = refract > 0.3 ? col : lerpColor("#334b52", col, 0.35);
      ctx.strokeStyle = "#191c21";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      if (refract > 0.35) {
        ctx.fillStyle = "rgba(255,255,255,0.32)";
        ctx.beginPath();
        ctx.ellipse(-rx * 0.28, -ry * 0.28, rx * 0.35, ry * 0.28, -0.3, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // Outer & inner pebble courses up left side, apex, and right side!
    for (var s = 0; s <= 11; s++) {
      var u = s / 11;
      var py = -u * 176;
      var curveIn = u < 0.5 ? 0 : Math.pow((u - 0.5) * 2, 1.55) * 66;
      var lxOut = -archW + curveIn;
      var rxOut = archW - curveIn;
      drawArchPebble(lxOut, py, 9.5, 6.8, 0.25 * u, s * 3);
      drawArchPebble(lxOut + 14, py - 4, 8.0, 5.8, -0.2, s * 3 + 1);
      drawArchPebble(rxOut, py, 9.5, 6.8, -0.25 * u, s * 3 + 2);
      drawArchPebble(rxOut - 14, py - 4, 8.0, 5.8, 0.2, s * 3 + 4);
    }
    // Keystone ruby/amber pebble at pointed apex!
    drawArchPebble(0, -archH + 6, 11, 13, 0, 0);

    ctx.restore(); // end lancet arch translate

    // Diagonal Refracted Sunbeams (SCION 24!) sweeping dynamically across the cathedral dome!
    if (refract > 0.12) {
      ctx.save();
      var raySway = Math.sin(st.t * 1.1) * 14;
      var rays = [
        [cx + 68, cy - 175, cx - 92 + raySway, cy + 165, "rgba(120, 245, 224, "],
        [cx + 108, cy - 145, cx - 28 + raySway, cy + 175, "rgba(255, 222, 130, "],
        [cx + 22, cy - 185, cx - 145 + raySway, cy + 135, "rgba(195, 155, 250, "]
      ];
      for (var ri = 0; ri < rays.length; ri++) {
        var rDef = rays[ri];
        var rg = ctx.createLinearGradient(rDef[0], rDef[1], rDef[2], rDef[3]);
        rg.addColorStop(0, rDef[4] + (0.30 * refract).toFixed(2) + ")");
        rg.addColorStop(0.65, rDef[4] + (0.16 * refract).toFixed(2) + ")");
        rg.addColorStop(1, rDef[4] + "0)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.moveTo(rDef[0] - 18, rDef[1]);
        ctx.lineTo(rDef[0] + 22, rDef[1]);
        ctx.lineTo(rDef[2] + 34, rDef[3]);
        ctx.lineTo(rDef[2] - 26, rDef[3]);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    drawSubSearchlightBeam(ctx, st, cx, cy - 40, 135);

    // Act 2b (3.5..5.6s) & Act 3: Four River Choir Trout arranged in two antiphonal rows (matching p20.jpg!)
    // singing 6/8 barcarolle chords with rising golden song-spore rings!
    var choirIn = st.act === 2 ? smoothstep(3.35, 4.05, st.t) : st.act === 3 ? 1 : 0;
    if (choirIn > 0.02) {
      var singJaw = 0.25 + 0.55 * Math.abs(Math.sin(st.t * 4.6));
      var bowPitch = st.act === 3 && st.t > 8.0 ? smoothstep(8.0, 8.8, st.t) * 0.22 : 0;
      var singers = [
        { x: lerp(cx - 210, cx - 84, choirIn), y: cy + 28, flip: -1, sc: 0.56 },
        { x: lerp(cx - 210, cx - 72, choirIn), y: cy + 68, flip: -1, sc: 0.54 },
        { x: lerp(cx + 210, cx + 68, choirIn), y: cy + 28, flip: 1,  sc: 0.56 },
        { x: lerp(cx + 210, cx + 76, choirIn), y: cy + 68, flip: 1,  sc: 0.54 }
      ];
      for (var si = 0; si < singers.length; si++) {
        var sg = singers[si];
        drawBrookTrout(ctx, {
          x: sg.x,
          y: sg.y + Math.sin(st.t * 3.0 + si) * 3,
          scale: sg.sc,
          flipX: sg.flip,
          jaw: singJaw,
          swimPhase: st.t * 4.5 + si,
          pitchRad: sg.flip * bowPitch
        });
      }

      // Luminous golden Song-of-the-Sea musical spore bubbles rising up the lancet!
      for (var spb = 0; spb < 10; spb++) {
        var sProg = (st.t * 0.42 + spb * 0.11) % 1;
        var spx = cx + Math.sin(sProg * 7 + spb * 1.9) * 48;
        var spy = cy + 48 - sProg * 195;
        ctx.fillStyle = "rgba(255, 232, 140, " + ((1 - sProg) * 0.85 * choirIn).toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(spx, spy, 2.5 + (spb % 3) * 1.2, 0, TAU);
        ctx.fill();
      }
    }

    drawForegroundKelpAndRocks(ctx, st);

    // Act 3: Choirmaster Brook Trout with reed baton conducts our "Brass Church Tuba" porthole rim (5.6..7.6s),
    // then clasps fins in awe at the glowing "Angel in a Jar" winged silhouette inside (7.6..10.0s)!
    if (st.act === 3) {
      var cmIn = easeOutBack(smoothstep(5.6, 6.35, st.t));
      var aweMode = smoothstep(7.6, 8.3, st.t);
      // Brass church tuba acoustic golden rings pulsing inward/outward at 5.8..7.6s!
      if (aweMode < 0.85) {
        var tubaPulse = (st.t * 1.5) % 1;
        ctx.strokeStyle = "rgba(255, 214, 112, " + ((1 - tubaPulse) * 0.45 * (1 - aweMode)).toFixed(2) + ")";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(cx, cy, 175 - tubaPulse * 55, 0, TAU);
        ctx.stroke();
      }

      drawBrookTrout(ctx, {
        x: lerp(cx + 215, cx + 118, cmIn) - aweMode * 24,
        y: cy - 10 + aweMode * 16 + Math.sin(st.t * 2.3) * 5,
        scale: 0.92,
        flipX: 1,
        jaw: aweMode > 0.5 ? 0.42 : 0.18 + 0.2 * Math.sin(st.t * 4.6),
        swimPhase: st.t * 4.2,
        baton: aweMode < 0.65,
        pectoralAngle: aweMode > 0.5 ? -0.85 : Math.sin(st.t * 4.6) * 0.55 - 0.35,
        lookX: -2.1,
        lookY: 0.4
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Master Portal Render Pipeline + Registration of #16..#20
  // ---------------------------------------------------------------------------
  function makePortal(meta, sceneFn) {
    return {
      id: meta.id,
      station: meta.station,
      clue: meta.clue,
      turkeyFork: meta.turkeyFork,
      troutFork: meta.troutFork,
      scionRule: meta.scionRule,
      defaultTool: meta.defaultTool,
      render: function (ctx, W, H, t, state) {
        W = W || 1280;
        H = H || 720;
        ctx.save();
        // Scale cleanly if canvas differs from 1280x720
        if (W !== 1280 || H !== 720) {
          ctx.scale(W / 1280, H / 720);
        }

        var st = resolveState(meta, t, state);

        // 1. Setup A Bread-Tin Cockpit Hull & Controls
        drawCockpitHullAndControls(ctx, 1280, 720, meta, st);

        // 2. Porthole Circular Glass Clip -> Bespoke Multiplane Scene + Interior Glass Reflections
        ctx.save();
        ctx.beginPath();
        ctx.arc(PORT_CX, PORT_CY, PORT_R_GLASS + 1, 0, TAU);
        ctx.clip();
        sceneFn(ctx, st);
        drawGlassReflectionsAndTurkeyGhost(ctx, meta, st);
        ctx.restore();

        // 3. Antique Brass Bezel, Hinge, Dog-Latch, 2-o'clock Rim Chip & 6 Die Bolts
        drawPortholeBezelAndHardware(ctx, meta, st);

        // 4. Foreground Articulated Turkey Pilot Wing
        drawTurkeyForegroundWing(ctx, meta, st);

        // 5. Lower Cream Editorial Story Strip (cleanly hidden when showCaptions === false!)
        drawEditorialStrip(ctx, 1280, 720, meta, st);

        // 6. Subtle tactile cold-press paper & film grain overlay
        var grain = getGrainCanvas();
        if (grain) {
          ctx.save();
          var pat = ctx.createPattern(grain, "repeat");
          if (pat) {
            ctx.fillStyle = pat;
            ctx.fillRect(0, 0, 1280, 720);
          }
          ctx.restore();
        }

        ctx.restore();
      }
    };
  }

  var DEFINITIONS = [
    {
      meta: {
        id: 16,
        station: "#16 · Aft",
        clue: "Identical twin Turkey Sub waving back",
        turkeyFork: "Pond mirror or yesterday’s crew?",
        troutFork: "Two-headed tin monster or traffic jam?",
        scionRule: "Temporal Double (SCION 36)",
        defaultTool: "ballast",
        defaultRoll: 4
      },
      fn: renderScene16
    },
    {
      meta: {
        id: 17,
        station: "#17 · Dorsal",
        clue: "Trout Council stone table arguing budgets",
        turkeyFork: "High-court jury or stalled board?",
        troutFork: "Taxpayer witness or new parking meter?",
        scionRule: "Committee Clinamen (Oulipo)",
        defaultTool: "lamp",
        defaultRoll: 6
      },
      fn: renderScene17
    },
    {
      meta: {
        id: 18,
        station: "#18 · Vent",
        clue: "Steamer trunk with star cutout peephole",
        turkeyFork: "Sunken pirate chest or magic box?",
        troutFork: "Stage magician’s assistant or lost luggage?",
        scionRule: "Reverse Peephole (SCION 17)",
        defaultTool: "lamp",
        defaultRoll: 2
      },
      fn: renderScene18
    },
    {
      meta: {
        id: 19,
        station: "#19 · Bilge",
        clue: "Raw potato skewered with 10 bendy straws",
        turkeyFork: "Spiky sea urchin or 14.7 PSI meter?",
        troutFork: "Science-fair judge or potato-eating pest?",
        scionRule: "Hydrostatic Gauge (SCION 09)",
        defaultTool: "ballast",
        defaultRoll: 4
      },
      fn: renderScene19
    },
    {
      meta: {
        id: 20,
        station: "#20 · Dome",
        clue: "Stained-glass pebble chapel lancet window",
        turkeyFork: "Sunken palace or river choir loft?",
        troutFork: "Brass church tuba or angel in a jar?",
        scionRule: "Refracted Sunbeams (SCION 24)",
        defaultTool: "lamp",
        defaultRoll: 2
      },
      fn: renderScene20
    }
  ];

  for (var i = 0; i < DEFINITIONS.length; i++) {
    var def = DEFINITIONS[i];
    window.PORTAL_SCENES[def.meta.id] = makePortal(def.meta, def.fn);
  }
})();
