/* Crew 01 — Handmade PAELEO / Oulipo + Video-to-Game Portal Scenes (#01–#05)
 * Portholes:
 *   #01 · Bow    — Giant Size 11 Rubber Boot blocking beam (Silhouette · SCION 02)
 *   #02 · Galley — Diner window: Trout Cook with silver baster (Double Take · Oubapo)
 *   #03 · Starbd — Room 4 chalkboard listing HOOK MONSTER (Lipogram · Outypopo)
 *   #04 · Belly  — Old Bridge: Snapping Turtle on brass key (Threshold · SCION 48)
 *   #05 · Scope  — Waterline: Raccoon hands washing tin plate (Split Plane · SCION 44)
 */
(function () {
  "use strict";

  window.PORTAL_SCENES = window.PORTAL_SCENES || {};

  // ---------- Pure deterministic math & easing ----------
  var TAU = Math.PI * 2;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function smooth(a, b, x) {
    var u = clamp((x - a) / (b - a || 1e-6), 0, 1);
    return u * u * (3 - 2 * u);
  }
  function easeOutBack(x) {
    var u = clamp(x, 0, 1);
    var c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
  }
  function hash(n) {
    var s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  // Cached subtle procedural paper & metal grain patterns (deterministic)
  var _grainPat = null;
  function getGrainPattern(ctx) {
    if (_grainPat) return _grainPat;
    try {
      var c = (typeof document !== "undefined") ? document.createElement("canvas") : null;
      if (!c) return null;
      c.width = 64; c.height = 64;
      var g = c.getContext("2d");
      var img = g.createImageData(64, 64);
      for (var i = 0; i < 64 * 64; i++) {
        var v = Math.floor(hash(i * 1.37) * 255);
        img.data[i * 4 + 0] = v;
        img.data[i * 4 + 1] = v;
        img.data[i * 4 + 2] = v - 10;
        img.data[i * 4 + 3] = 11;
      }
      g.putImageData(img, 0, 0);
      _grainPat = ctx.createPattern(c, "repeat");
    } catch (e) { _grainPat = null; }
    return _grainPat;
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

  // ---------- Resolve deterministic film / interactive state ----------
  function resolvePortalState(meta, rawT, state) {
    var t = (typeof rawT === "number" && isFinite(rawT)) ? rawT : 0;
    if (t < 0) t = 0;
    if (t > 10.001) t = t % 10.0;

    var st = state || {};
    var showCaptions = (st.showCaptions !== false);
    var viewMode = (st.view === "turkey" || st.view === "trout") ? st.view : "auto";

    var act = 1;
    if (viewMode === "turkey") act = 2;
    else if (viewMode === "trout") act = 3;
    else if (t < 2.0) act = 1;
    else if (t < 5.6) act = 2;
    else act = 3;

    var autoSwitchOn = smooth(0.95, 1.12, t);
    var lampOn, ballastOn, lampAmt, ballastAmt;

    if (typeof st.lamp === "boolean") {
      lampOn = st.lamp;
      lampAmt = st.lamp ? 1.0 : 0.0;
    } else if (meta.defaultTool === "lamp") {
      lampOn = (viewMode !== "auto") ? true : (t >= 1.0);
      lampAmt = (viewMode !== "auto") ? 1.0 : autoSwitchOn;
    } else {
      lampOn = false;
      lampAmt = 0.0;
    }

    if (typeof st.ballast === "boolean") {
      ballastOn = st.ballast;
      ballastAmt = st.ballast ? 1.0 : 0.0;
    } else if (meta.defaultTool === "ballast") {
      ballastOn = (viewMode !== "auto") ? true : (t >= 1.0);
      ballastAmt = (viewMode !== "auto") ? 1.0 : smooth(0.95, 1.55, t);
    } else {
      ballastOn = false;
      ballastAmt = 0.0;
    }

    var activeRoll = 0;
    if (typeof st.roll === "number" && st.roll >= 1 && st.roll <= 6) {
      activeRoll = Math.round(st.roll);
    } else if (act === 3 && (viewMode === "trout" || t >= 7.8)) {
      activeRoll = meta.defaultRoll;
    }

    var chartProgress = 0.15;
    if (viewMode === "turkey") chartProgress = 0.55;
    else if (viewMode === "trout") chartProgress = 1.0;
    else if (t < 2.0) chartProgress = lerp(0.08, 0.22, smooth(0.0, 2.0, t));
    else if (t < 5.6) chartProgress = lerp(0.22, 0.58, smooth(2.0, 5.4, t));
    else chartProgress = lerp(0.58, 1.0, smooth(5.6, 8.2, t));

    return {
      t: t,
      act: act,
      viewMode: viewMode,
      showCaptions: showCaptions,
      lampOn: lampOn,
      lampAmt: lampAmt,
      ballastOn: ballastOn,
      ballastAmt: ballastAmt,
      activeRoll: activeRoll,
      chartProgress: chartProgress
    };
  }

  // ---------- Shared Handmade Character Rigs ----------

  // Articulated Spotted Brook Trout (Salvelinus fontinalis)
  function drawBrookTrout(ctx, opts) {
    var x = opts.x || 0, y = opts.y || 0;
    var sc = opts.scale || 1;
    var flipX = opts.flipX ? -1 : 1; // default +1 faces LEFT toward porthole center!
    var tilt = opts.tilt || 0;
    var phase = opts.phase || 0;
    var jaw = clamp(opts.jaw || 0, 0, 1);
    var startle = clamp(opts.startle || 0, 0, 1);
    var chefHat = !!opts.chefHat;
    var backpack = !!opts.backpack;
    var pointing = clamp(opts.pointing || 0, 0, 1);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(sc * flipX, sc);

    var wag = Math.sin(phase * 5.2) * (6 + startle * 5);
    var finFlutter = Math.sin(phase * 7.5) * 0.18;

    // Caudal (tail) fin — articulated at peduncle (+72, 0)
    ctx.save();
    ctx.translate(68, 0);
    ctx.rotate(wag * 0.025);
    var tailG = ctx.createLinearGradient(0, -24, 34, 24);
    tailG.addColorStop(0, "#4a6b53");
    tailG.addColorStop(0.6, "#7e8c69");
    tailG.addColorStop(1, "#b86b4b");
    ctx.fillStyle = tailG;
    ctx.strokeStyle = "#172019";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.quadraticCurveTo(18, -26 - startle * 4, 34, -22);
    ctx.quadraticCurveTo(25, 0, 34, 22);
    ctx.quadraticCurveTo(18, 26 + startle * 4, -4, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Fin rays
    ctx.strokeStyle = "rgba(23,32,25,0.45)";
    ctx.lineWidth = 1.1;
    for (var r = -3; r <= 3; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * 1.4);
      ctx.lineTo(29, r * 6.2);
      ctx.stroke();
    }
    ctx.restore();

    // Dorsal fin (with brook trout dark spots & white tip)
    ctx.save();
    ctx.translate(8, -22);
    ctx.rotate(finFlutter * 0.4 + startle * 0.18);
    ctx.fillStyle = "#5b7c5c";
    ctx.strokeStyle = "#172019";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-18, 3);
    ctx.quadraticCurveTo(-8, -19 - startle * 4, 14, -14);
    ctx.quadraticCurveTo(22, -4, 18, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#f4efe0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, 1);
    ctx.quadraticCurveTo(-8, -16, 0, -16);
    ctx.stroke();
    ctx.restore();

    // Pelvic & anal fins (crimson-apricot with white/black brook-trout leading edge)
    var lowerFins = [{ x: 12, y: 20, s: 1.0 }, { x: 42, y: 15, s: 0.82 }];
    for (var lf = 0; lf < lowerFins.length; lf++) {
      var fd = lowerFins[lf];
      ctx.save();
      ctx.translate(fd.x, fd.y);
      ctx.rotate(-finFlutter * 0.6);
      ctx.scale(fd.s, fd.s);
      ctx.fillStyle = "#c96d49";
      ctx.strokeStyle = "#172019";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-8, -2);
      ctx.quadraticCurveTo(-2, 16, 14, 13);
      ctx.quadraticCurveTo(10, 2, 6, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#f7f3e6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-7, -1);
      ctx.quadraticCurveTo(-2, 13, 4, 14);
      ctx.stroke();
      ctx.restore();
    }

    // Main Torso Body (facing left: nose at -72, tail peduncle at +70)
    var bodyG = ctx.createLinearGradient(0, -26, 0, 26);
    bodyG.addColorStop(0.0, "#35533f");
    bodyG.addColorStop(0.38, "#6f8d6b");
    bodyG.addColorStop(0.68, "#d4c394");
    bodyG.addColorStop(1.0, "#df966c");
    ctx.fillStyle = bodyG;
    ctx.strokeStyle = "#172019";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-72, -2);
    ctx.quadraticCurveTo(-42, -26, 4, -24);
    ctx.quadraticCurveTo(46, -21, 70, -7);
    ctx.lineTo(70, 7);
    ctx.quadraticCurveTo(44, 21, 2, 24);
    ctx.quadraticCurveTo(-36, 25, -56, 12);
    ctx.quadraticCurveTo(-68, 6, -72, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Olive dorsal vermiculations + lateral line + haloed crimson/gold spots
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = "rgba(26,45,33,0.45)";
    ctx.lineWidth = 2.1;
    for (var v = -46; v <= 54; v += 11) {
      ctx.beginPath();
      ctx.moveTo(v, -25);
      ctx.bezierCurveTo(v - 4, -18, v + 5, -13, v - 2, -8);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(95,70,50,0.32)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-40, 0);
    ctx.quadraticCurveTo(10, -2, 68, 0);
    ctx.stroke();
    ctx.restore();

    // Brook trout signature spots (butter yellow + haloed crimson)
    var spots = [
      [-28, -6, 0], [-14, -10, 1], [0, -5, 0], [15, -9, 1], [30, -4, 0], [45, -6, 1],
      [-22, 3, 1], [-7, 5, 0], [9, 3, 1], [24, 5, 0], [39, 3, 1], [54, 1, 0],
      [-34, -1, 0], [5, -12, 0], [20, -1, 1]
    ];
    for (var si = 0; si < spots.length; si++) {
      var sp = spots[si];
      if (sp[2] === 1) {
        ctx.fillStyle = "rgba(182,216,214,0.65)";
        ctx.beginPath(); ctx.arc(sp[0], sp[1], 3.1, 0, TAU); ctx.fill();
        ctx.fillStyle = "#c93b2b";
        ctx.beginPath(); ctx.arc(sp[0], sp[1], 1.7, 0, TAU); ctx.fill();
      } else {
        ctx.fillStyle = "#ebd27a";
        ctx.beginPath(); ctx.arc(sp[0], sp[1], 1.9, 0, TAU); ctx.fill();
      }
    }

    // Hinged lower jaw
    ctx.save();
    ctx.translate(-46, 8);
    ctx.rotate(-jaw * 0.42 - startle * 0.22);
    ctx.fillStyle = "#cfa87c";
    ctx.strokeStyle = "#172019";
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(2, -2);
    ctx.quadraticCurveTo(-16, 5, -25, -4);
    ctx.quadraticCurveTo(-14, -7, 2, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Mouth crease & breathing gill operculum
    var gillBreath = Math.sin(phase * 3.6) * 1.4;
    ctx.strokeStyle = "#172019";
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(-71, -1);
    ctx.quadraticCurveTo(-58, 4, -47, 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-34 + gillBreath * 0.4, 0, 15, -1.1, 1.15);
    ctx.stroke();
    ctx.strokeStyle = "rgba(205,92,72,0.5)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(-32 + gillBreath * 0.6, 1, 14, -0.85, 0.95);
    ctx.stroke();

    // Expressive Eye
    var eyeR = 6.2 + startle * 1.4;
    ctx.fillStyle = "#f7f2df";
    ctx.strokeStyle = "#172019";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-52, -6, eyeR, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#d9a648";
    ctx.beginPath();
    ctx.arc(-52.5, -6, eyeR * 0.72, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#111615";
    ctx.beginPath();
    ctx.arc(-53.5 + (opts.lookX || 0) * 1.6, -6 + (opts.lookY || 0) * 1.4, eyeR * 0.45, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-55, -8, 1.7, 0, TAU);
    ctx.fill();

    // Optional Room 4 Leather School Satchel Backpack (#03)
    if (backpack) {
      ctx.save();
      ctx.translate(-4, -2);
      // Straps
      ctx.strokeStyle = "#5c3d22";
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-12, -19); ctx.quadraticCurveTo(-16, 2, -10, 19);
      ctx.moveTo(8, -18); ctx.quadraticCurveTo(4, 2, 8, 18);
      ctx.stroke();
      // Satchel box
      ctx.fillStyle = "#9c6f3e";
      ctx.strokeStyle = "#1f160d";
      ctx.lineWidth = 2;
      roundedRectPath(ctx, -11, -15, 24, 26, 4);
      ctx.fill(); ctx.stroke();
      // Flap & brass buckle
      ctx.fillStyle = "#b5844d";
      roundedRectPath(ctx, -12, -16, 26, 11, 3);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#ecc365";
      ctx.fillRect(-3, -8, 6, 5);
      ctx.strokeRect(-3, -8, 6, 5);
      ctx.restore();
    }

    // Articulated Pectoral Fin (can point forward when `pointing > 0`!)
    ctx.save();
    ctx.translate(-26, 11);
    if (pointing > 0.05) {
      ctx.rotate(lerp(0.25, -2.55, pointing) + Math.sin(phase * 6) * 0.06);
    } else {
      ctx.rotate(0.22 + finFlutter);
    }
    ctx.fillStyle = "#cf7750";
    ctx.strokeStyle = "#172019";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-3, -2);
    ctx.quadraticCurveTo(8, 17, 25, 11);
    ctx.quadraticCurveTo(19, -1, 4, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#f7f2e4";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-2, -1);
    ctx.quadraticCurveTo(7, 14, 16, 13);
    ctx.stroke();
    ctx.restore();

    // Optional Pleated White Diner Chef's Toque (#02)
    if (chefHat) {
      ctx.save();
      ctx.translate(-36, -23);
      ctx.rotate(-0.18 + Math.sin(phase * 2.5) * 0.05);
      ctx.fillStyle = "#fbf9f2";
      ctx.strokeStyle = "#1c2221";
      ctx.lineWidth = 2.1;
      // Hat band
      ctx.beginPath();
      ctx.moveTo(-16, 2);
      ctx.lineTo(-14, -9);
      ctx.quadraticCurveTo(0, -12, 14, -9);
      ctx.lineTo(16, 2);
      ctx.quadraticCurveTo(0, 5, -16, 2);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Puffy crown
      ctx.beginPath();
      ctx.moveTo(-14, -9);
      ctx.bezierCurveTo(-26, -18, -22, -34, -8, -31);
      ctx.bezierCurveTo(-4, -40, 10, -40, 12, -30);
      ctx.bezierCurveTo(24, -31, 25, -16, 14, -9);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Pleat lines
      ctx.strokeStyle = "rgba(35,45,48,0.35)";
      ctx.lineWidth = 1.3;
      for (var pl = -7; pl <= 7; pl += 7) {
        ctx.beginPath();
        ctx.moveTo(pl, -10);
        ctx.lineTo(pl * 1.2, -25);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // Turkey Pilot Reflection peeking out through the porthole glass (Act 1 & Act 2)
  function drawTurkeyGlassReflection(ctx, opts) {
    var x = opts.x, y = opts.y;
    var flip = opts.flip ? -1 : 1; // +1 on left looking up-right, -1 on right looking up-left
    var alpha = clamp(opts.alpha == null ? 0.52 : opts.alpha, 0, 1);
    if (alpha <= 0.01) return;
    var tilt = opts.tilt || 0;
    var t = opts.t || 0;
    var gasp = clamp(opts.gasp || 0, 0, 1);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(flip, 1);
    ctx.rotate(tilt);

    // Feathered bronze neck & shoulder reflection
    var neckG = ctx.createRadialGradient(-8, 12, 6, -6, 18, 58);
    neckG.addColorStop(0, "rgba(218,158,108,0.85)");
    neckG.addColorStop(0.65, "rgba(138,84,56,0.72)");
    neckG.addColorStop(1, "rgba(62,42,34,0.0)");
    ctx.fillStyle = neckG;
    ctx.beginPath();
    ctx.moveTo(-44, 54);
    ctx.quadraticCurveTo(-40, 6, -18, -18);
    ctx.quadraticCurveTo(4, -34, 22, -16);
    ctx.quadraticCurveTo(26, 8, 18, 52);
    ctx.closePath();
    ctx.fill();

    // Scalloped bronze breast feathers
    ctx.strokeStyle = "rgba(45,26,18,0.55)";
    ctx.lineWidth = 1.6;
    for (var fr = 0; fr < 3; fr++) {
      for (var fc = -2; fc <= 0; fc++) {
        ctx.beginPath();
        ctx.arc(fc * 13 - 2, 18 + fr * 11, 7, 0.15, Math.PI - 0.15);
        ctx.stroke();
      }
    }

    // Turkey head dome (bluish-slate & warm caruncle tint)
    ctx.fillStyle = "rgba(196,138,108,0.84)";
    ctx.strokeStyle = "rgba(42,24,18,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-4, -10, 24, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Swinging crimson wattle under chin + snood over beak
    var wattleSwing = Math.sin(t * 4.2) * 0.12;
    ctx.save();
    ctx.translate(15, 2);
    ctx.rotate(wattleSwing);
    ctx.fillStyle = "rgba(206,68,52,0.85)";
    ctx.beginPath();
    ctx.moveTo(-3, -2);
    ctx.quadraticCurveTo(-9, 18, -2, 24);
    ctx.quadraticCurveTo(6, 22, 4, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Curved amber-horn Beak (upper & hinged lower mandible)
    ctx.fillStyle = "rgba(232,186,104,0.92)";
    ctx.beginPath();
    ctx.moveTo(16, -15);
    ctx.quadraticCurveTo(34, -13, 41, -3);
    ctx.quadraticCurveTo(26, -3, 15, -5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(16, -4);
    ctx.rotate(gasp * 0.32);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(14, 4, 21, 0);
    ctx.quadraticCurveTo(12, 8, -1, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Snood
    ctx.fillStyle = "rgba(212,72,56,0.86)";
    ctx.beginPath();
    ctx.moveTo(15, -17);
    ctx.quadraticCurveTo(24, -22, 23, -8);
    ctx.quadraticCurveTo(18, -8, 15, -14);
    ctx.closePath();
    ctx.fill();

    // Expressive round Turkey Eye (with periodic blink)
    var blink = (Math.sin(t * 1.9 + 0.7) > 0.96) ? 0.15 : 1.0;
    ctx.save();
    ctx.translate(2, -12);
    ctx.scale(1, blink);
    ctx.fillStyle = "rgba(248,238,214,0.92)";
    ctx.beginPath(); ctx.arc(0, 0, 7.5, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(156,88,36,0.95)";
    ctx.beginPath(); ctx.arc(1.2, -0.5, 5.0, 0, TAU); ctx.fill();
    ctx.fillStyle = "#18120e";
    ctx.beginPath(); ctx.arc(1.8, -0.8, 2.8, 0, TAU); ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(-0.5, -2.5, 1.5, 0, TAU); ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // Interior Warm Sub Reflection when Trout Looks In (Act 3)
  function drawSubInteriorGlimpseForTrout(ctx, cx, cy, t) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    // Warm amber cabin glow seen from outside
    var g = ctx.createRadialGradient(cx - 56, cy + 52, 8, cx - 56, cy + 52, 95);
    g.addColorStop(0, "rgba(255,198,108,0.85)");
    g.addColorStop(0.6, "rgba(214,132,58,0.32)");
    g.addColorStop(1, "rgba(214,132,58,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx - 56, cy + 52, 95, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Turkey pilot inside waving wing slightly as Trout inspects the sub!
    drawTurkeyGlassReflection(ctx, {
      x: cx - 108,
      y: cy + 108 + Math.sin(t * 3.1) * 3,
      flip: false,
      alpha: 0.34,
      tilt: -0.08 + Math.sin(t * 2.4) * 0.08,
      t: t,
      gasp: (t > 7.6 && t < 9.5) ? 0.45 : 0.1
    });
  }

  // Articulated Turkey Pilot Feathered Wing operating cockpit controls (Act 1)
  function drawTurkeyPilotWing(ctx, meta, ps) {
    var t = ps.t;
    if (ps.viewMode !== "auto" || t > 2.25) return;

    // Wing reaches from pilot seat (590, 560) -> target control -> snaps at t=1.0s -> withdraws!
    var reachIn = smooth(0.18, 0.72, t);
    var reachOut = 1.0 - smooth(1.42, 2.18, t);
    var presence = reachIn * reachOut;
    if (presence <= 0.01) return;

    var isLamp = (meta.defaultTool === "lamp");
    var restX = isLamp ? 770 : 470, restY = 595;
    var preX = isLamp ? 1028 : 196, preY = isLamp ? 474 : 472;
    var postX = isLamp ? 1054 : 242, postY = isLamp ? 450 : 478;

    var snap = smooth(0.94, 1.08, t);
    var tipBaseX = lerp(preX, postX, snap);
    var tipBaseY = lerp(preY, postY, snap);
    // Subtle anticipation dip right at 0.80–0.93s
    var antic = Math.sin(smooth(0.72, 0.94, t) * Math.PI) * (isLamp ? -10 : -8);

    var tipX = lerp(restX, tipBaseX + antic, presence);
    var tipY = lerp(restY, tipBaseY - Math.abs(antic) * 0.4, presence);

    var shoulderX = isLamp ? 820 : 430;
    var shoulderY = 585;
    var elbowX = lerp(shoulderX, tipX, 0.52) + (isLamp ? -28 : 28) * presence;
    var elbowY = lerp(shoulderY, tipY, 0.56) + 26 * presence;

    ctx.save();
    // Soft cockpit shadow under wing
    ctx.strokeStyle = "rgba(5,12,14,0.48)";
    ctx.lineWidth = 36;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY + 10);
    ctx.quadraticCurveTo(elbowX, elbowY + 10, tipX, tipY + 8);
    ctx.stroke();

    // Upper & forearm feathered wing limb
    var wingG = ctx.createLinearGradient(shoulderX, shoulderY, tipX, tipY);
    wingG.addColorStop(0, "#4e2f1e");
    wingG.addColorStop(0.55, "#7d4b2d");
    wingG.addColorStop(1, "#a5693f");
    ctx.strokeStyle = wingG;
    ctx.lineWidth = 28;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.quadraticCurveTo(elbowX, elbowY, tipX, tipY);
    ctx.stroke();

    // Ink contour on arm
    ctx.strokeStyle = "#1a110b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(shoulderX - 12, shoulderY);
    ctx.quadraticCurveTo(elbowX - 10, elbowY - 8, tipX - 8, tipY - 6);
    ctx.stroke();

    // Articulated Primary Pinion Feathers fanning at wing-hand tip!
    var ang = Math.atan2(tipY - elbowY, tipX - elbowX);
    ctx.translate(tipX, tipY);
    ctx.rotate(ang);
    for (var f = -2; f <= 2; f++) {
      ctx.save();
      ctx.rotate(f * 0.19 + snap * (isLamp ? -0.14 : 0.14));
      ctx.fillStyle = (f % 2 === 0) ? "#8f5634" : "#ad7046";
      ctx.strokeStyle = "#1a110b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -5);
      ctx.quadraticCurveTo(14, -8, 28 - Math.abs(f) * 3, 0);
      ctx.quadraticCurveTo(14, 7, -8, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Cream barred turkey-feather band
      ctx.strokeStyle = "#ead6b3";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(15 - Math.abs(f) * 2, -4);
      ctx.lineTo(15 - Math.abs(f) * 2, 4);
      ctx.stroke();
      ctx.restore();
    }

    // Crisp visual click spark at t = 0.98..1.20s!
    if (t >= 0.96 && t <= 1.28) {
      var spA = 1 - Math.abs(t - 1.10) / 0.18;
      ctx.strokeStyle = "rgba(255,218,118," + clamp(spA, 0, 1).toFixed(3) + ")";
      ctx.lineWidth = 2.5;
      for (var k = 0; k < 5; k++) {
        var ka = -0.9 + k * 0.45;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ka) * 22, Math.sin(ka) * 22);
        ctx.lineTo(Math.cos(ka) * 34, Math.sin(ka) * 34);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ---------- Common Underwater Multiplane Helpers ----------
  function drawWaterBackdrop(ctx, cx, cy, r, topCol, botCol, t, lampAmt, waveSeed) {
    var wg = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
    wg.addColorStop(0, topCol);
    wg.addColorStop(1, botCol);
    ctx.fillStyle = wg;
    ctx.fillRect(cx - r - 4, cy - r - 4, r * 2 + 8, r * 2 + 8);

    // Layered gouache horizontal current bands & caustics
    ctx.save();
    for (var b = 0; b < 6; b++) {
      var by = cy - r + 32 + b * 56 + Math.sin(t * 1.1 + b + waveSeed) * 5;
      ctx.fillStyle = (b % 2 === 0)
        ? "rgba(145,220,208," + (0.045 + lampAmt * 0.04).toFixed(3) + ")"
        : "rgba(12,35,38,0.08)";
      ctx.beginPath();
      ctx.moveTo(cx - r - 10, by);
      for (var x = cx - r; x <= cx + r + 20; x += 40) {
        var wy = by + Math.sin(x * 0.025 + t * (1.4 + b * 0.15) + b) * 6;
        ctx.lineTo(x, wy);
      }
      ctx.lineTo(cx + r + 10, by + 26);
      ctx.lineTo(cx - r - 10, by + 26);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSwayingKelpCluster(ctx, baseX, baseY, count, height, t, seed, darkTint) {
    ctx.save();
    for (var i = 0; i < count; i++) {
      var ox = (i - (count - 1) * 0.5) * 11;
      var h = height * (0.72 + hash(seed + i * 7.1) * 0.42);
      var sway = Math.sin(t * 1.8 + seed + i * 0.8) * 12;
      ctx.fillStyle = darkTint ? "#1f4a45" : (i % 2 === 0 ? "#386f60" : "#4b856f");
      ctx.strokeStyle = "#132623";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(baseX + ox - 4, baseY);
      ctx.bezierCurveTo(
        baseX + ox - 10 + sway * 0.4, baseY - h * 0.45,
        baseX + ox + sway * 0.8, baseY - h * 0.75,
        baseX + ox + sway, baseY - h
      );
      ctx.bezierCurveTo(
        baseX + ox + 9 + sway * 0.7, baseY - h * 0.7,
        baseX + ox + 8 + sway * 0.3, baseY - h * 0.4,
        baseX + ox + 4, baseY
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBowLampBeam(ctx, cx, cy, r, lampAmt, blockedPolygonFn) {
    if (lampAmt <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = lampAmt;
    var beamG = ctx.createLinearGradient(cx, cy + r - 8, cx, cy - r + 10);
    beamG.addColorStop(0.0, "rgba(255,204,106,0.62)");
    beamG.addColorStop(0.35, "rgba(245,178,78,0.30)");
    beamG.addColorStop(0.85, "rgba(240,174,80,0.08)");
    beamG.addColorStop(1.0, "rgba(240,174,80,0.0)");

    ctx.fillStyle = beamG;
    ctx.beginPath();
    ctx.moveTo(cx - 34, cy + r + 4);
    ctx.lineTo(cx - 148, cy - r - 8);
    ctx.lineTo(cx + 148, cy - r - 8);
    ctx.lineTo(cx + 34, cy + r + 4);
    ctx.closePath();
    ctx.fill();

    if (blockedPolygonFn) blockedPolygonFn(ctx);
    ctx.restore();
  }

  function drawDriftingMotes(ctx, cx, cy, r, t, count, seed, warm) {
    ctx.save();
    for (var i = 0; i < count; i++) {
      var rx = (hash(seed + i * 3.1) - 0.5) * r * 1.75;
      var ry = ((hash(seed + i * 5.7) - 0.5) * r * 1.75 - t * (10 + (i % 5) * 4)) % (r * 1.8);
      if (ry < -r * 0.9) ry += r * 1.8;
      var mx = cx + rx + Math.sin(t * 1.5 + i) * 6;
      var my = cy + ry;
      var rad = 1.4 + (i % 3) * 0.9;
      ctx.fillStyle = warm ? "rgba(255,232,175,0.42)" : "rgba(195,238,232,0.34)";
      ctx.beginPath();
      ctx.arc(mx, my, rad, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // =========================================================================
  // PORTHOLE #01 · BOW — Giant Size 11 Rubber Boot blocking beam
  // SCION 02: Silhouette (backlit shadow) | Ref: Monty Python (Gilliam, 1969)
  // =========================================================================
  function renderScene01(ctx, cx, cy, r, ps) {
    var t = ps.t, lamp = ps.lampAmt;
    var trimY = ps.ballastAmt * -28; // interactive ballast lowers sightline

    ctx.save();
    ctx.translate(0, trimY);

    var topCol = lamp > 0.5 ? "#2e7b74" : "#11292c";
    var botCol = lamp > 0.5 ? "#1b4543" : "#0a171a";
    drawWaterBackdrop(ctx, cx, cy, r + 40, topCol, botCol, t, lamp, 1.1);

    // Creek gravel floor & side rocks
    ctx.fillStyle = lamp > 0.5 ? "#4c6a5c" : "#1d3130";
    ctx.strokeStyle = "#132120";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - r - 10, cy + 95);
    ctx.quadraticCurveTo(cx - 40, cy + 80, cx + r + 10, cy + 98);
    ctx.lineTo(cx + r + 10, cy + r + 50);
    ctx.lineTo(cx - r - 10, cy + r + 50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Left & right creek shale ledges + swaying eelgrass
    drawSwayingKelpCluster(ctx, cx - 128, cy + 98, 5, 115, t, 11, lamp < 0.5);
    drawSwayingKelpCluster(ctx, cx + 118, cy + 112, 4, 92, t, 23, lamp < 0.5);

    ctx.fillStyle = lamp > 0.5 ? "#577b6f" : "#223836";
    ctx.beginPath();
    ctx.moveTo(cx - 195, cy + 62);
    ctx.quadraticCurveTo(cx - 135, cy + 54, cx - 108, cy + 88);
    ctx.lineTo(cx - 102, cy + 108);
    ctx.lineTo(cx - 195, cy + 112);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Boot kinematics across Act 1, Act 2 (Shipwreck -> Giant's foot -> Tunnel), Act 3 (Flashlight -> Crab bite!)
    var bootSink = smooth(0.2, 3.2, t);
    var stompHit = smooth(3.15, 3.45, t) - smooth(4.35, 4.85, t) * 0.42;
    var crabPinchJump = (ps.act === 3) ? smooth(7.85, 8.25, t) * (1 - smooth(9.5, 10.0, t) * 0.25) : 0;
    if (ps.viewMode === "turkey") {
      bootSink = 1;
      stompHit = 0.5 + 0.5 * Math.sin(t * 2.1);
      crabPinchJump = 0;
    } else if (ps.viewMode === "trout" && t < 5.6) {
      bootSink = 1;
      crabPinchJump = (t % 4.4 > 2.2) ? smooth(2.2, 2.6, t % 4.4) : 0;
    }

    var bootX = cx - 8 + Math.sin(t * 1.2) * 3;
    var bootY = cy + lerp(-12, 46, bootSink) + stompHit * 22 - crabPinchJump * 36;
    var bootRot = -0.18 + stompHit * 0.16 - crabPinchJump * 0.22;
    var ankleFlex = stompHit * 0.12 - crabPinchJump * 0.14;

    // Volumetric Bow Lamp Cone + SCION 02 Backlit Shadow Occlusion behind the Boot!
    if (lamp > 0.02) {
      drawBowLampBeam(ctx, cx, cy - trimY, r, lamp, function (c) {
        // Dark shadow wedge cast UPWARD from the boot blocking the beam!
        c.fillStyle = "rgba(14,38,39,0.74)";
        c.beginPath();
        c.moveTo(bootX - 66, bootY + 8);
        c.lineTo(bootX - 115, cy - r - 30);
        c.lineTo(bootX + 95, cy - r - 30);
        c.lineTo(bootX + 74, bootY + 38);
        c.closePath();
        c.fill();
      });
    }

    // Tunnel current & bubbles streaming under the boot arch (4.3–5.6s "or tunnel?")
    var tunnelFlow = clamp(1 - stompHit, 0.2, 1) * lamp;
    if (tunnelFlow > 0.2) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,224,148," + (tunnelFlow * 0.48).toFixed(3) + ")";
      ctx.lineWidth = 2.2;
      for (var tf = 0; tf < 3; tf++) {
        var ty = bootY + 46 + tf * 8;
        var txOff = ((t * 75 + tf * 32) % 130) - 65;
        ctx.beginPath();
        ctx.moveTo(bootX + txOff - 28, ty);
        ctx.quadraticCurveTo(bootX + txOff, ty - 5, bootX + txOff + 28, ty + 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Silt puff when Giant's Foot stomps at t ≈ 3.3–4.3s!
    var siltAlpha = clamp(1 - Math.abs(t - 3.75) / 0.75, 0, 1);
    if (ps.act === 2 && siltAlpha > 0.02) {
      ctx.save();
      ctx.fillStyle = "rgba(218,188,126," + (siltAlpha * 0.45).toFixed(3) + ")";
      for (var sp = 0; sp < 7; sp++) {
        var dir = (sp % 2 === 0 ? -1 : 1);
        var dist = 28 + (1 - siltAlpha) * 62 + sp * 9;
        ctx.beginPath();
        ctx.arc(bootX + dir * dist, cy + 92 - sp * 3, 10 + sp * 2.2, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // Articulated Red Creek Crab under boot toe (hidden in Act 1/2; scuttles out to snap pincers at toe in Act 3!)
    var crabOut = (ps.act === 3) ? smooth(6.9, 7.8, (ps.viewMode === "trout" && t < 5.6) ? (5.6 + (t % 4.4)) : t) : 0.0;
    var crabX = lerp(bootX - 8, bootX + 46, crabOut);
    var crabY = cy + 90;
    if (crabOut > 0.05) {
      ctx.save();
      ctx.translate(crabX, crabY);
      // Legs
      ctx.strokeStyle = "#8a291a";
      ctx.lineWidth = 2.4;
      for (var cl = -1; cl <= 1; cl += 2) {
        for (var li = 0; li < 3; li++) {
          var lw = Math.sin(t * 14 + li) * 3 * crabOut;
          ctx.beginPath();
          ctx.moveTo(cl * 8, 2);
          ctx.lineTo(cl * (16 + li * 4), -4 + lw);
          ctx.lineTo(cl * (21 + li * 4), 7);
          ctx.stroke();
        }
      }
      // Carapace
      ctx.fillStyle = "#cc3f28";
      ctx.strokeStyle = "#1d100c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 10, 0, 0, TAU);
      ctx.fill(); ctx.stroke();
      // Stalked eyes
      ctx.beginPath();
      ctx.moveTo(-5, -9); ctx.lineTo(-7, -16);
      ctx.moveTo(5, -9); ctx.lineTo(7, -16);
      ctx.stroke();
      ctx.fillStyle = "#fff8dc";
      ctx.beginPath(); ctx.arc(-7, -17, 3, 0, TAU); ctx.arc(7, -17, 3, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.arc(-7, -17, 1.3, 0, TAU); ctx.arc(7, -17, 1.3, 0, TAU); ctx.fill();

      // Articulated snapping pincer claws reaching up to pinch the boot toe!
      var snapJaw = Math.abs(Math.sin(t * 11.5)) * 0.55 * crabOut;
      for (var side = -1; side <= 1; side += 2) {
        ctx.save();
        ctx.translate(side * 12, -5);
        ctx.rotate(side * -0.45 - crabPinchJump * 0.35 * side);
        ctx.fillStyle = "#e04b31";
        ctx.beginPath();
        ctx.ellipse(0, -11, 6, 10, 0, 0, TAU);
        ctx.fill(); ctx.stroke();
        // Hinged dactyl pincer
        ctx.save();
        ctx.translate(0, -16);
        ctx.rotate(side * snapJaw);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(side * 9, -8, 0, -13);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();
        ctx.restore();
      }
      ctx.restore();
    }

    // GIANT SIZE-11 RUBBER WELLINGTON BOOT (Gilliam cutout rig: shaft + flexing foot/sole)
    ctx.save();
    ctx.translate(bootX, bootY);
    ctx.rotate(bootRot);

    // Golden backlit rim halo when lamp is on!
    if (lamp > 0.2) {
      ctx.save();
      ctx.shadowColor = "rgba(255,196,92,0.92)";
      ctx.shadowBlur = 22 * lamp;
      ctx.strokeStyle = "rgba(255,208,116," + (0.78 * lamp).toFixed(3) + ")";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-42, -210);
      ctx.lineTo(-56, -8);
      ctx.lineTo(-68, 22);
      ctx.lineTo(84, 52);
      ctx.quadraticCurveTo(92, 26, 62, 16);
      ctx.quadraticCurveTo(22, 6, 18, -28);
      ctx.lineTo(48, -210);
      ctx.stroke();
      ctx.restore();
    }

    // Upper boot shaft
    var shaftG = ctx.createLinearGradient(-56, -120, 48, -100);
    shaftG.addColorStop(0, lamp > 0.5 ? "#2e4642" : "#152322");
    shaftG.addColorStop(0.5, lamp > 0.5 ? "#1b2d2b" : "#0e1919");
    shaftG.addColorStop(1, lamp > 0.5 ? "#39564d" : "#182827");
    ctx.fillStyle = shaftG;
    ctx.strokeStyle = "#101817";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(-38, -220);
    ctx.lineTo(-56, -12);
    ctx.quadraticCurveTo(-8, 12, 20, -16);
    ctx.lineTo(50, -220);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top boot cuff band
    ctx.strokeStyle = "#0e1615";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-41, -172);
    ctx.lineTo(44, -156);
    ctx.stroke();

    // Articulated Foot & Lugged Size-11 Sole (rotates at ankleFlex)
    ctx.save();
    ctx.rotate(ankleFlex);
    var footG = ctx.createLinearGradient(-65, -10, 88, 48);
    footG.addColorStop(0, lamp > 0.5 ? "#283e3b" : "#132020");
    footG.addColorStop(0.7, lamp > 0.5 ? "#1c2e2c" : "#0f1919");
    footG.addColorStop(1, lamp > 0.5 ? "#435c50" : "#1c2a28");
    ctx.fillStyle = footG;
    ctx.strokeStyle = "#101817";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(-55, -14);
    ctx.quadraticCurveTo(-66, 8, -68, 22);
    ctx.lineTo(84, 48);
    ctx.quadraticCurveTo(92, 24, 66, 15);
    ctx.quadraticCurveTo(22, 6, 18, -24);
    ctx.quadraticCurveTo(-6, -38, -55, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ankle vamp seam & toe cap reinforcement (Gilliam crosshatch detail)
    ctx.strokeStyle = "rgba(210,225,212,0.22)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-52, 8);
    ctx.quadraticCurveTo(-12, 22, 14, -18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(46, 42);
    ctx.quadraticCurveTo(50, 20, 68, 17);
    ctx.stroke();

    // Heavy rubber lugged sole + heel block + arch gap ("SIZE 11")
    ctx.fillStyle = "#15201e";
    ctx.strokeStyle = "#0c1312";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-70, 20);
    ctx.lineTo(-72, 33);
    ctx.lineTo(-34, 40);
    ctx.lineTo(-31, 31); // arch tunnel notch!
    ctx.lineTo(2, 37);
    ctx.lineTo(4, 46);
    // Toe tread lugs
    ctx.lineTo(20, 49); ctx.lineTo(22, 44); ctx.lineTo(32, 46); ctx.lineTo(33, 51);
    ctx.lineTo(50, 54); ctx.lineTo(52, 49); ctx.lineTo(62, 51); ctx.lineTo(63, 56);
    ctx.lineTo(84, 58);
    ctx.lineTo(86, 46);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Stamped "11" circle medallion on side of heel
    if (lamp > 0.35) {
      ctx.strokeStyle = "rgba(218,196,142,0.45)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(-48, 12, 7.5, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore(); // end boot

    // Act 3: Spotted Brook Trout swimming in on right, inspecting boot-sole beam & crab!
    if (ps.act === 3) {
      var troutEnter = (ps.viewMode === "trout" && t < 5.6) ? 1.0 : smooth(5.65, 6.55, t);
      var troutBack = crabPinchJump * 22;
      var tx = lerp(cx + 235, cx + 118, troutEnter) + troutBack;
      var ty = cy + 16 - crabPinchJump * 10 + Math.sin(t * 2.6) * 5;
      drawBrookTrout(ctx, {
        x: tx,
        y: ty,
        scale: 0.78,
        flipX: false,
        tilt: 0.08 - crabPinchJump * 0.15,
        phase: t,
        jaw: 0.25 + crabPinchJump * 0.55,
        startle: crabPinchJump * 0.85,
        lookX: -1,
        lookY: 0.4
      });
    }

    drawDriftingMotes(ctx, cx, cy, r, t, 18, 101, lamp > 0.5);
    ctx.restore(); // end trimY

    // Foreground glass reflections: Turkey in Act 1/2, Sub interior in Act 3
    if (ps.act <= 2) {
      drawTurkeyGlassReflection(ctx, {
        x: cx - 108,
        y: cy + 114,
        flip: false,
        alpha: ps.act === 1 ? 0.28 : 0.56,
        tilt: Math.sin(t * 2.0) * 0.11 - 0.06,
        t: t,
        gasp: clamp(1 - Math.abs(t - 3.5) / 0.5, 0, 1) * 0.7
      });
    } else {
      drawSubInteriorGlimpseForTrout(ctx, cx, cy, t);
    }
  }

  // =========================================================================
  // PORTHOLE #02 · GALLEY — Diner window: Trout Cook with silver baster
  // Double Take (Oubapo): dual prop | Ref: TROUTOWN Ep. 5 (Something in the Kitchen)
  // =========================================================================
  function renderScene02(ctx, cx, cy, r, ps) {
    var t = ps.t, lamp = ps.lampAmt;
    var trimY = ps.ballastAmt * -22;

    ctx.save();
    ctx.translate(0, trimY);

    // Exterior sunken diner clapboard wall in deep creek teal
    var wallTop = lamp > 0.5 ? "#1c5a5c" : "#0e2b2d";
    var wallBot = lamp > 0.5 ? "#123c3f" : "#081b1d";
    drawWaterBackdrop(ctx, cx, cy, r + 30, wallTop, wallBot, t, lamp, 2.3);

    // Horizontal sunken diner siding planks
    ctx.strokeStyle = "rgba(8,22,24,0.42)";
    ctx.lineWidth = 1.6;
    for (var py = cy - 165; py <= cy + 165; py += 26) {
      ctx.beginPath();
      ctx.moveTo(cx - r, py);
      ctx.lineTo(cx + r, py);
      ctx.stroke();
    }

    // Wooden Pass-Through Diner Window Frame (cx=636, y=150..320)
    var wx = cx - 128, wy = cy - 102, ww = 252, wh = 166;

    // Warm Golden Diner Kitchen Interior inside window!
    ctx.save();
    ctx.beginPath();
    ctx.rect(wx + 12, wy + 12, ww - 24, wh - 20);
    ctx.clip();

    var kitG = ctx.createRadialGradient(cx + 10, wy + 58, 12, cx, wy + 80, 165);
    kitG.addColorStop(0, lamp > 0.5 ? "#ffe39a" : "#a8793e");
    kitG.addColorStop(0.6, lamp > 0.5 ? "#f5ab52" : "#6e4b25");
    kitG.addColorStop(1, lamp > 0.5 ? "#c4712c" : "#3f2915");
    ctx.fillStyle = kitG;
    ctx.fillRect(wx, wy, ww, wh);

    // Hanging copper pan & roast thermometer on left wall ("Cooking me?")
    ctx.strokeStyle = "#5c3416";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(wx + 34, wy + 14); ctx.lineTo(wx + 34, wy + 36);
    ctx.stroke();
    ctx.fillStyle = "#b8632e";
    ctx.beginPath(); ctx.arc(wx + 34, wy + 48, 14, 0, TAU); ctx.fill(); ctx.stroke();

    // Back diner counter & TWO small customer trout chatting on stools!
    ctx.fillStyle = "#8a5a32";
    ctx.fillRect(cx + 6, wy + 114, 120, 42);
    ctx.strokeStyle = "#3a2210";
    ctx.strokeRect(cx + 6, wy + 114, 120, 42);

    var custX = [cx + 42, cx + 96];
    for (var ci = 0; ci < 2; ci++) {
      var cFlip = (ci === 0) ? 1 : -1;
      var cX = custX[ci];
      var cBob = Math.sin(t * 3.4 + ci * 2.1) * 1.8;
      // Teal diner stool
      ctx.fillStyle = "#3f7a78";
      ctx.strokeStyle = "#1d2c2b";
      ctx.lineWidth = 1.5;
      roundedRectPath(ctx, cX - 11, wy + 132, 22, 8, 3);
      ctx.fill(); ctx.stroke();
      ctx.fillRect(cX - 2, wy + 140, 4, 16);
      // Tiny customer trout curved on stool
      ctx.save();
      ctx.translate(cX, wy + 112 + cBob);
      ctx.scale(cFlip * 0.34, 0.34);
      drawBrookTrout(ctx, { x: 0, y: 0, scale: 1, flipX: true, tilt: -0.35, phase: t + ci, jaw: Math.abs(Math.sin(t * 4.5 + ci)) * 0.6 });
      ctx.restore();
      // Tiny water glass on counter
      ctx.fillStyle = "rgba(220,248,245,0.75)";
      ctx.fillRect(cX + cFlip * 14 - 3, wy + 104, 6, 10);
      ctx.strokeRect(cX + cFlip * 14 - 3, wy + 104, 6, 10);
    }

    // ARTICULATED TROUT COOK inside diner window!
    var cookRise = smooth(0.4, 1.6, t);
    if (ps.viewMode !== "auto") cookRise = 1;
    var cookX = cx - 64 + Math.sin(t * 1.9) * 4;
    var cookY = wy + lerp(142, 108, cookRise);
    var cookTilt = -0.22 + (ps.act === 2 ? Math.sin(t * 2.4) * 0.08 : 0.06);

    drawBrookTrout(ctx, {
      x: cookX,
      y: cookY,
      scale: 0.94,
      flipX: true, // faces RIGHT toward center of window!
      tilt: cookTilt,
      phase: t * 0.9,
      jaw: 0.3 + Math.abs(Math.sin(t * 3.8)) * 0.45,
      chefHat: true,
      lookX: 1,
      lookY: 0.2
    });
    ctx.restore(); // end interior clip

    // Wooden Window Moulding & Recessed Sill
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "#1c130a";
    var woodG = ctx.createLinearGradient(wx, wy, wx, wy + wh);
    woodG.addColorStop(0, "#7d5533");
    woodG.addColorStop(1, "#593b21");
    ctx.fillStyle = woodG;
    // Top, Left, Right stiles
    ctx.fillRect(wx, wy, ww, 14); ctx.strokeRect(wx, wy, ww, 14);
    ctx.fillRect(wx, wy + 14, 14, wh - 24); ctx.strokeRect(wx, wy + 14, 14, wh - 24);
    ctx.fillRect(wx + ww - 14, wy + 14, 14, wh - 24); ctx.strokeRect(wx + ww - 14, wy + 14, 14, wh - 24);
    // Projecting wooden window sill
    ctx.fillStyle = "#8c613b";
    ctx.fillRect(wx - 10, wy + wh - 12, ww + 20, 15);
    ctx.strokeRect(wx - 10, wy + wh - 12, ww + 20, 15);

    // OUBAPO DUAL PROP: Giant Polished Silver Baster protruding OVER the window sill!
    // Act 2a (2.0–3.6s): Aims toward Turkey like roasting baster; Act 2b (3.6–5.6s): Air-refueling bubble blast!
    // Act 3a (5.6–7.6s): Holds menu/fork card ("Canned roast dinner?"); Act 3b (7.6–10.0s): Hydro-plumber vortex!
    var squeeze = 0;
    var basterAngle = -0.42;
    if (ps.act === 1) {
      basterAngle = lerp(-0.12, -0.34, smooth(1.0, 1.9, t));
      squeeze = smooth(1.6, 1.95, t) * 0.25;
    } else if (ps.act === 2) {
      var refuelPhase = (ps.viewMode === "turkey" && (t < 2 || t > 5.6)) ? smooth(0.4, 0.7, (t % 3.6) / 3.6) : smooth(3.45, 3.85, t);
      basterAngle = lerp(-0.18, -0.54, refuelPhase) + Math.sin(t * 4) * 0.04;
      squeeze = lerp(0.18, 0.88, refuelPhase) * (0.65 + 0.35 * Math.sin(t * 7.5));
    } else {
      var ufoPhase = (ps.viewMode === "trout" && t < 5.6) ? smooth(0.45, 0.75, (t % 4.4) / 4.4) : smooth(7.55, 8.05, t);
      basterAngle = lerp(-0.28, -0.62, ufoPhase);
      squeeze = ufoPhase * (0.6 + 0.4 * Math.sin(t * 9.0));
    }

    var bx = cx - 44, by = wy + wh - 22;
    var nozzleTipX = bx + Math.cos(basterAngle) * 98;
    var nozzleTipY = by + Math.sin(basterAngle) * 98;

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(basterAngle);

    // Squeezable rubber baster bulb (squashes with `squeeze`!)
    ctx.save();
    ctx.translate(-18, 0);
    ctx.scale(1 + squeeze * 0.22, 1 - squeeze * 0.34);
    var bulbG = ctx.createRadialGradient(-4, -5, 3, 0, 0, 22);
    bulbG.addColorStop(0, "#6d848a");
    bulbG.addColorStop(0.6, "#2c3d42");
    bulbG.addColorStop(1, "#141e21");
    ctx.fillStyle = bulbG;
    ctx.strokeStyle = "#10181a";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(-6, 0, 21, 15, 0, 0, TAU);
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // Polished silver baster barrel + measurement ticks + Oubapo brass pressure collar
    var silG = ctx.createLinearGradient(0, -10, 0, 10);
    silG.addColorStop(0, "#eef7f8");
    silG.addColorStop(0.45, "#a7bec4");
    silG.addColorStop(0.8, "#5d747a");
    silG.addColorStop(1, "#d2e4e8");
    ctx.fillStyle = silG;
    ctx.strokeStyle = "#142024";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-2, -10);
    ctx.lineTo(68, -6);
    ctx.lineTo(98, -2.5);
    ctx.lineTo(98, 2.5);
    ctx.lineTo(68, 6);
    ctx.lineTo(-2, 10);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Collar ring
    ctx.fillStyle = "#e0b35a";
    ctx.fillRect(-3, -11.5, 8, 23);
    ctx.strokeRect(-3, -11.5, 8, 23);

    // Cook's clasping fin over barrel
    ctx.fillStyle = "#cf7750";
    ctx.beginPath();
    ctx.ellipse(28, 7, 13, 6, -0.3, 0, TAU);
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // Sparkling jet & bubbles shooting from silver baster nozzle!
    var jetStrength = clamp(squeeze * 1.25, 0, 1);
    if (jetStrength > 0.08) {
      ctx.save();
      // Cyan-white water/air jet cone
      var jetG = ctx.createLinearGradient(nozzleTipX, nozzleTipY, nozzleTipX + 95, nozzleTipY - 75);
      jetG.addColorStop(0, "rgba(195,248,255," + (0.75 * jetStrength).toFixed(3) + ")");
      jetG.addColorStop(1, "rgba(195,248,255,0)");
      ctx.fillStyle = jetG;
      ctx.beginPath();
      ctx.moveTo(nozzleTipX, nozzleTipY);
      ctx.lineTo(nozzleTipX + 92, nozzleTipY - 82);
      ctx.lineTo(nozzleTipX + 112, nozzleTipY - 38);
      ctx.closePath();
      ctx.fill();

      // 24 animated silver oxygen bubbles!
      for (var bi = 0; bi < 24; bi++) {
        var prog = ((t * 1.65 + bi * 0.13) % 1.0);
        var angB = basterAngle - 0.18 + (hash(bi * 9.3) - 0.5) * 0.52;
        var distB = 8 + prog * 128;
        var bbx = nozzleTipX + Math.cos(angB) * distB + Math.sin(t * 5 + bi) * 4;
        var bby = nozzleTipY + Math.sin(angB) * distB - prog * prog * 28;
        var br = (2.5 + (bi % 4) * 2.1) * (1 - prog * 0.25) * jetStrength;
        if (br > 0.8) {
          ctx.fillStyle = "rgba(195,245,252,0.52)";
          ctx.strokeStyle = "rgba(255,255,255,0.82)";
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.arc(bbx, bby, br, 0, TAU);
          ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(bbx - br * 0.32, bby - br * 0.32, br * 0.28, 0, TAU);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Foreground framing kelp on left & right of diner window
    drawSwayingKelpCluster(ctx, cx - 142, cy + 158, 5, 168, t, 31, lamp < 0.5);
    drawSwayingKelpCluster(ctx, cx + 138, cy + 158, 4, 145, t, 47, lamp < 0.5);

    if (lamp > 0.02) {
      drawBowLampBeam(ctx, cx, cy - trimY, r, lamp * 0.55, null);
    }

    // Act 3: Exterior Spotted Brook Trout looking IN at the "Canned roast dinner or UFO plumber?"
    if (ps.act === 3) {
      var trIn = (ps.viewMode === "trout" && t < 5.6) ? 1.0 : smooth(5.65, 6.55, t);
      var ufoPulse = (ps.viewMode === "trout" && t < 5.6) ? smooth(0.45, 0.75, (t % 4.4) / 4.4) : smooth(7.6, 8.3, t);

      // Futuristic amber saucer-rings pulsing from the sub's porthole when Turkey acts like a UFO plumber!
      if (ufoPulse > 0.05) {
        ctx.save();
        for (var ur = 0; ur < 3; ur++) {
          var rp = ((t * 1.2 + ur * 0.33) % 1.0);
          ctx.strokeStyle = "rgba(255,214,112," + ((1 - rp) * 0.55 * ufoPulse).toFixed(3) + ")";
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(cx - 88, cy + 92, 22 + rp * 88, -1.3, 0.5);
          ctx.stroke();
        }
        ctx.restore();
      }

      var btx = lerp(cx + 225, cx + 68, trIn);
      var bty = cy + 98 + Math.sin(t * 2.7) * 5;
      drawBrookTrout(ctx, {
        x: btx,
        y: bty,
        scale: 0.78,
        flipX: false,
        tilt: -0.14 + ufoPulse * 0.22,
        phase: t * 1.1,
        jaw: 0.2 + ufoPulse * 0.45,
        startle: ufoPulse * 0.5,
        lookX: -1,
        lookY: -0.2
      });
    }

    ctx.restore(); // end trimY

    // Turkey peeking at lower-right in Act 1/2 (matching p02.jpg composition!)
    if (ps.act <= 2) {
      drawTurkeyGlassReflection(ctx, {
        x: cx + 102,
        y: cy + 112,
        flip: true,
        alpha: ps.act === 1 ? 0.28 : 0.58,
        tilt: Math.sin(t * 2.2) * 0.1,
        t: t,
        gasp: (t > 2.2 && t < 3.5) ? 0.65 : 0.12
      });
    } else {
      drawSubInteriorGlimpseForTrout(ctx, cx, cy, t);
    }
  }

  // =========================================================================
  // PORTHOLE #03 · STARBD — Room 4 chalkboard listing HOOK MONSTER
  // Lipogram (Outypopo): washed chalk | Ref: TROUTOWN Ep. 2 (The School of Fish)
  // =========================================================================
  function renderScene03(ctx, cx, cy, r, ps) {
    var t = ps.t, lamp = ps.lampAmt;
    var trimY = ps.ballastAmt * -24;

    ctx.save();
    ctx.translate(0, trimY);

    var topCol = lamp > 0.5 ? "#227372" : "#0f2c2e";
    var botCol = lamp > 0.5 ? "#154646" : "#091b1d";
    drawWaterBackdrop(ctx, cx, cy, r + 35, topCol, botCol, t, lamp, 3.7);

    // Creek classroom floor & mossy rocks
    ctx.fillStyle = lamp > 0.5 ? "#2e5c57" : "#162d2c";
    ctx.strokeStyle = "#102120";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - r - 10, cy + 72);
    ctx.quadraticCurveTo(cx, cy + 62, cx + r + 10, cy + 76);
    ctx.lineTo(cx + r + 10, cy + r + 50);
    ctx.lineTo(cx - r - 10, cy + r + 50);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    drawSwayingKelpCluster(ctx, cx - 140, cy + 78, 5, 138, t, 53, lamp < 0.5);
    drawSwayingKelpCluster(ctx, cx + 142, cy + 82, 4, 128, t, 61, lamp < 0.5);

    // Lipogram wash progress: washes away the 3 round 'O's into floating chalk-ring bubbles!
    var washWave = 0;
    if (ps.act === 2) {
      washWave = (ps.viewMode === "turkey" && (t < 2 || t > 5.6))
        ? smooth(0.2, 0.65, (t % 3.6) / 3.6)
        : smooth(2.65, 3.85, t);
    } else if (ps.act === 3) {
      washWave = 0.85;
    }

    // Tilted Green Slate Chalkboard propped on mossy rocks
    ctx.save();
    ctx.translate(cx - 2, cy - 22);
    ctx.rotate(-0.085);

    var bw = 248, bh = 158;
    // Wooden frame
    ctx.fillStyle = lamp > 0.5 ? "#5d7d66" : "#2b3d33";
    ctx.strokeStyle = "#14211b";
    ctx.lineWidth = 2.6;
    roundedRectPath(ctx, -bw * 0.5 - 11, -bh * 0.5 - 11, bw + 22, bh + 22, 5);
    ctx.fill(); ctx.stroke();

    // Slate interior
    var slateG = ctx.createLinearGradient(-bw * 0.5, -bh * 0.5, bw * 0.5, bh * 0.5);
    slateG.addColorStop(0, lamp > 0.5 ? "#1f4940" : "#112824");
    slateG.addColorStop(1, lamp > 0.5 ? "#163831" : "#0c1d1a");
    ctx.fillStyle = slateG;
    ctx.fillRect(-bw * 0.5, -bh * 0.5, bw, bh);
    ctx.strokeRect(-bw * 0.5, -bh * 0.5, bw, bh);

    // Dusty chalk eraser smudges
    ctx.fillStyle = "rgba(225,242,235," + (0.06 + washWave * 0.08).toFixed(3) + ")";
    ctx.beginPath();
    ctx.ellipse(-36, -6, 68, 38, -0.2, 0, TAU);
    ctx.fill();

    // Stick of white chalk on lower ledge
    ctx.fillStyle = "#f2f5f0";
    ctx.strokeStyle = "#1c2b26";
    ctx.lineWidth = 1.5;
    ctx.fillRect(58, bh * 0.5 - 3, 28, 6);
    ctx.strokeRect(58, bh * 0.5 - 3, 28, 6);

    // HAND-DRAWN CHALK GRAPHICS ON SLATE (Hand-stroked vector paths — NOT HUD text!)
    var chalkAlpha = lerp(0.32, 0.94, lamp);
    ctx.strokeStyle = "rgba(236,246,240," + chalkAlpha.toFixed(3) + ")";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3.4;

    // Row 1 strokes: H  [O]  [O]  K
    var oFade = clamp(1 - washWave * 0.92, 0.08, 1);
    // 'H'
    ctx.beginPath();
    ctx.moveTo(-102, -34); ctx.lineTo(-102, -6);
    ctx.moveTo(-86, -34); ctx.lineTo(-86, -6);
    ctx.moveTo(-102, -20); ctx.lineTo(-86, -20);
    // 'K'
    ctx.moveTo(-22, -34); ctx.lineTo(-22, -6);
    ctx.moveTo(-7, -34); ctx.lineTo(-21, -20); ctx.lineTo(-6, -6);
    ctx.stroke();

    // Row 2 strokes: M  [O]  N  S  T  E  R
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    // 'M'
    ctx.moveTo(-108, 34); ctx.lineTo(-106, 8); ctx.lineTo(-97, 23); ctx.lineTo(-88, 8); ctx.lineTo(-86, 34);
    // 'N'
    ctx.moveTo(-54, 34); ctx.lineTo(-54, 9); ctx.lineTo(-39, 34); ctx.lineTo(-39, 9);
    // 'S'
    ctx.moveTo(-20, 12); ctx.quadraticCurveTo(-32, 6, -31, 18); ctx.quadraticCurveTo(-18, 22, -20, 31); ctx.quadraticCurveTo(-28, 36, -33, 30);
    // 'T'
    ctx.moveTo(-13, 10); ctx.lineTo(3, 10); ctx.moveTo(-5, 10); ctx.lineTo(-5, 34);
    // 'E'
    ctx.moveTo(21, 10); ctx.lineTo(9, 10); ctx.lineTo(9, 34); ctx.lineTo(21, 34); ctx.moveTo(9, 22); ctx.lineTo(18, 22);
    // 'R'
    ctx.moveTo(28, 34); ctx.lineTo(28, 10); ctx.quadraticCurveTo(42, 10, 40, 20); ctx.lineTo(28, 22); ctx.moveTo(34, 22); ctx.lineTo(42, 34);
    ctx.stroke();

    // The 3 Lipogram 'O's (on slate before wash, then lifting off as rising chalk-ring bubbles!)
    var oCoords = [[-68, -20, 0.0], [-44, -20, 0.14], [-71, 21, 0.26]];
    for (var oi = 0; oi < 3; oi++) {
      var oc = oCoords[oi];
      var lift = clamp((washWave - oc[2]) / 0.72, 0, 1);
      // Faint wet chalk ghost remaining on slate
      ctx.strokeStyle = "rgba(220,242,235," + (chalkAlpha * (1 - lift * 0.85)).toFixed(3) + ")";
      ctx.lineWidth = 3.1;
      ctx.beginPath();
      ctx.ellipse(oc[0], oc[1], 8.5, 12, 0, 0, TAU);
      ctx.stroke();

      // Floating chalk 'O' bubble rising off the chalkboard!
      if (lift > 0.04) {
        var bx = oc[0] + Math.sin(t * 3.5 + oi * 2) * 12 * lift;
        var by = oc[1] - lift * 96;
        ctx.strokeStyle = "rgba(242,252,248," + (0.85 * (1 - lift * 0.25)).toFixed(3) + ")";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(bx, by, 9 + lift * 3, 0, TAU);
        ctx.stroke();
      }
    }

    // Chalk Hook-Bird Monster / Guest-Speaker Portrait on right side of board!
    ctx.strokeStyle = "rgba(238,248,242," + chalkAlpha.toFixed(3) + ")";
    ctx.lineWidth = 2.4;
    // Fishing line & eyelet from top
    ctx.beginPath();
    ctx.moveTo(78, -bh * 0.5 + 4); ctx.lineTo(78, -46);
    ctx.arc(78, -41, 4.5, 0, TAU);
    ctx.stroke();
    // Feathered chalk bird head + wings + giant barbed J-hook tail!
    ctx.beginPath();
    ctx.moveTo(74, -36);
    ctx.quadraticCurveTo(56, -42, 48, -28); // fierce brow
    ctx.lineTo(39, -22); ctx.lineTo(49, -20); // hooked beak!
    ctx.quadraticCurveTo(58, -12, 66, 2);
    // Barbed J-Hook curve
    ctx.bezierCurveTo(72, 34, 62, 58, 46, 54);
    ctx.quadraticCurveTo(32, 49, 38, 25);
    ctx.lineTo(44, 34); // barb!
    ctx.stroke();
    // Chalk feather plumes
    ctx.beginPath();
    ctx.moveTo(78, -34);
    ctx.quadraticCurveTo(98, -16, 105, 8);
    ctx.lineTo(92, 0); ctx.lineTo(102, 24); ctx.lineTo(86, 14); ctx.lineTo(90, 36);
    ctx.quadraticCurveTo(78, 20, 72, 2);
    ctx.stroke();

    // Subtle washed-chalk wave ribbon sweeping across board in Act 2
    if (washWave > 0.05 && washWave < 0.96) {
      ctx.strokeStyle = "rgba(175,240,235," + (Math.sin(washWave * Math.PI) * 0.55).toFixed(3) + ")";
      ctx.lineWidth = 4;
      ctx.beginPath();
      var wySweep = lerp(45, -55, washWave);
      ctx.moveTo(-bw * 0.48, wySweep);
      ctx.bezierCurveTo(-40, wySweep - 18, 40, wySweep + 18, bw * 0.48, wySweep - 8);
      ctx.stroke();
    }
    ctx.restore(); // end chalkboard

    // Mossy foreground rocks supporting left bottom of chalkboard
    ctx.fillStyle = lamp > 0.5 ? "#4a7866" : "#213831";
    ctx.strokeStyle = "#11201c";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(cx - 125, cy + 62, 46, 22, 0.1, 0, TAU);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx - 68, cy + 72, 32, 16, -0.08, 0, TAU);
    ctx.fill(); ctx.stroke();

    if (lamp > 0.02) {
      drawBowLampBeam(ctx, cx, cy - trimY, r, lamp * 0.52, null);
    }

    // TWO SATCHEL-BACKPACK STUDENT FISH (Act 1/2: pointing at chalkboard vs Turkey; Act 3: peering in + Hook-Monster startle!)
    var monsterShock = (ps.act === 3)
      ? ((ps.viewMode === "trout" && t < 5.6) ? smooth(0.48, 0.72, (t % 4.4) / 4.4) : smooth(7.65, 8.25, t))
      : 0;

    var s1X = cx + 92 - (ps.act === 3 ? 18 : 0) + monsterShock * 24;
    var s1Y = cy + 64 + Math.sin(t * 2.8) * 4 - monsterShock * 8;
    var s2X = cx + 44 - (ps.act === 3 ? 22 : 0) + monsterShock * 28;
    var s2Y = cy + 104 + Math.sin(t * 3.1 + 1.2) * 4;

    drawBrookTrout(ctx, {
      x: s1X,
      y: s1Y,
      scale: ps.act === 3 ? 0.62 : 0.54,
      flipX: false,
      tilt: (ps.act === 2 && t < 3.6) ? 0.24 : (0.06 - monsterShock * 0.24),
      phase: t * 1.2,
      jaw: 0.35 + monsterShock * 0.55,
      startle: monsterShock,
      backpack: true,
      pointing: (ps.act >= 2) ? 0.92 : 0.2
    });

    drawBrookTrout(ctx, {
      x: s2X,
      y: s2Y,
      scale: ps.act === 3 ? 0.58 : 0.50,
      flipX: false,
      tilt: 0.14 - monsterShock * 0.20,
      phase: t * 1.3 + 1.5,
      jaw: 0.30 + monsterShock * 0.60,
      startle: monsterShock,
      backpack: true,
      pointing: (ps.act >= 2) ? 0.88 : 0.15
    });

    // Act 3a (5.8–7.6s "New class pet?"): floating pinch of golden class-pet crumbs near glass!
    if (ps.act === 3 && monsterShock < 0.7) {
      ctx.fillStyle = "#f2c864";
      for (var cr = 0; cr < 6; cr++) {
        var crx = s2X - 52 - cr * 6 + Math.sin(t * 3 + cr) * 2;
        var cry = s2Y - 8 + cr * 4 + ((t * 12 + cr * 5) % 18);
        ctx.beginPath(); ctx.arc(crx, cry, 2.1, 0, TAU); ctx.fill();
      }
    }

    drawDriftingMotes(ctx, cx, cy, r, t, 16, 303, false);
    ctx.restore(); // end trimY

    if (ps.act <= 2) {
      drawTurkeyGlassReflection(ctx, {
        x: cx - 108,
        y: cy + 112,
        flip: false,
        alpha: ps.act === 1 ? 0.28 : 0.58,
        tilt: (t > 3.7) ? -0.14 : 0.08,
        t: t,
        gasp: (t > 3.7 && t < 5.2) ? 0.6 : 0.05
      });
    } else {
      drawSubInteriorGlimpseForTrout(ctx, cx, cy, t);
    }
  }

  // =========================================================================
  // PORTHOLE #04 · BELLY — Old Bridge: Snapping Turtle on brass key
  // Threshold (SCION 48): shell retreat | Default Tool: BALLAST
  // =========================================================================
  function renderScene04(ctx, cx, cy, r, ps) {
    var t = ps.t, bal = ps.ballastAmt, lamp = ps.lampAmt;

    // Physical sightline consequence of BALLAST:
    // Unballasted (bal=0, t<1s): sub floats high (+64px shift -> seeing upper stonework & fast current, turtle barely glimpsed at bottom!)
    // Ballasted (bal=1, t>=1.5s): sub settles down into calm low-lip shelter beneath the Old Bridge arch!
    var sightShiftY = lerp(64, 0, bal);

    ctx.save();
    ctx.translate(0, sightShiftY);

    drawWaterBackdrop(ctx, cx, cy - 30, r + 80, "#2c8a86", "#164443", t, lamp, 4.4);

    // Sunlit surface ripples above the Old Bridge parapet (prominent when unballasted at t=0.8s!)
    ctx.fillStyle = "#76d4ca";
    ctx.fillRect(cx - r - 10, cy - 210, r * 2 + 20, 42);
    ctx.fillStyle = "rgba(235,255,250,0.65)";
    for (var sr = 0; sr < 5; sr++) {
      var sx = cx - 120 + sr * 60 + Math.sin(t * 2 + sr) * 12;
      ctx.beginPath();
      ctx.ellipse(sx, cy - 186 + (sr % 2) * 8, 28, 3.5, 0, 0, TAU);
      ctx.fill();
    }

    // Fast surface current streaks when unballasted (calms down when ballast seats into shelter!)
    if (bal < 0.85) {
      ctx.strokeStyle = "rgba(195,248,242," + ((1 - bal) * 0.55).toFixed(3) + ")";
      ctx.lineWidth = 2.4;
      for (var cs = 0; cs < 6; cs++) {
        var csy = cy - 140 + cs * 24;
        var csx = cx - 180 + ((t * 210 + cs * 67) % 320);
        ctx.beginPath();
        ctx.moveTo(csx, csy);
        ctx.lineTo(csx + 56, csy + Math.sin(t * 6 + cs) * 4);
        ctx.stroke();
      }
    }

    // Submerged Old Limestone Bridge Spandrel Wall & Voussoir Arch (Verne I.14)
    ctx.save();
    // Deep glowing turquoise culvert passage INSIDE the stone arch
    var archGlow = ctx.createRadialGradient(cx, cy + 10, 12, cx, cy + 20, 155);
    archGlow.addColorStop(0, lamp > 0.5 ? "#5ed4c6" : "#3bb3a8");
    archGlow.addColorStop(1, "#185250");
    ctx.fillStyle = archGlow;
    ctx.beginPath();
    ctx.arc(cx, cy + 48, 132, Math.PI, TAU);
    ctx.lineTo(cx + 132, cy + 90);
    ctx.lineTo(cx - 132, cy + 90);
    ctx.closePath();
    ctx.fill();

    // Diagonal sunbeams inside the bridge arch
    ctx.fillStyle = "rgba(182,248,236,0.16)";
    ctx.beginPath();
    ctx.moveTo(cx - 42, cy - 82); ctx.lineTo(cx - 88, cy + 70); ctx.lineTo(cx - 24, cy + 70); ctx.lineTo(cx + 8, cy - 82);
    ctx.moveTo(cx + 22, cy - 80); ctx.lineTo(cx - 4, cy + 70); ctx.lineTo(cx + 48, cy + 70); ctx.lineTo(cx + 62, cy - 75);
    ctx.fill();

    // Outer bridge masonry wall with circular arch cutout
    ctx.fillStyle = "#486b64";
    ctx.strokeStyle = "#162623";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.rect(cx - 210, cy - 168, 420, 256);
    ctx.arc(cx, cy + 48, 128, TAU, Math.PI, true);
    ctx.closePath();
    ctx.fill("evenodd");
    ctx.stroke();

    // Masonry courses + stone voussoir arch blocks + mossy patches
    ctx.strokeStyle = "rgba(18,34,31,0.65)";
    ctx.lineWidth = 1.6;
    for (var my = cy - 144; my <= cy + 60; my += 28) {
      ctx.beginPath();
      ctx.moveTo(cx - 205, my); ctx.lineTo(cx - 132, my);
      ctx.moveTo(cx + 132, my); ctx.lineTo(cx + 205, my);
      ctx.stroke();
    }
    // Voussoir arch ring stones
    for (var va = 0; va <= 9; va++) {
      var a1 = Math.PI + (va / 9) * Math.PI;
      var a2 = Math.PI + ((va + 1) / 9) * Math.PI;
      ctx.fillStyle = (va % 2 === 0) ? "#557c72" : "#496d64";
      ctx.beginPath();
      ctx.arc(cx, cy + 48, 156, a1, a2);
      ctx.arc(cx, cy + 48, 128, a2, a1, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // Green moss drapes on arch keystone
    ctx.fillStyle = "#4f7c46";
    ctx.beginPath();
    ctx.ellipse(cx - 12, cy - 106, 26, 7, 0.1, 0, TAU);
    ctx.ellipse(cx + 58, cy - 84, 18, 6, 0.4, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Creek silt floor under bridge
    ctx.fillStyle = "#355953";
    ctx.strokeStyle = "#142422";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - 210, cy + 78);
    ctx.quadraticCurveTo(cx, cy + 68, cx + 210, cy + 80);
    ctx.lineTo(cx + 210, cy + 220);
    ctx.lineTo(cx - 210, cy + 220);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // GIANT ENGRAVED VICTORIAN BRASS SKELETON KEY lying on threshold gravel!
    ctx.save();
    var keyNudge = (ps.act === 3) ? Math.sin(t * 4) * 1.5 : 0;
    ctx.translate(cx + 6 + keyNudge, cy + 108);
    ctx.rotate(-0.22);
    var brassG = ctx.createLinearGradient(-85, -8, 85, 8);
    brassG.addColorStop(0, "#d8b159");
    brassG.addColorStop(0.5, "#f7dc88");
    brassG.addColorStop(1, "#9c752b");
    ctx.fillStyle = brassG;
    ctx.strokeStyle = "#1d1508";
    ctx.lineWidth = 2.4;
    // Key bit teeth on left
    ctx.beginPath();
    ctx.moveTo(-76, 4); ctx.lineTo(-76, 22); ctx.lineTo(-56, 22); ctx.lineTo(-56, 12);
    ctx.lineTo(-48, 12); ctx.lineTo(-48, 22); ctx.lineTo(-34, 22); ctx.lineTo(-34, 4);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Key shaft & collar rings
    roundedRectPath(ctx, -84, -5, 134, 10, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillRect(36, -8, 8, 16); ctx.strokeRect(36, -8, 8, 16);
    // Ornate bow ring on right (hollow)
    ctx.beginPath();
    ctx.ellipse(68, 0, 24, 15, 0, 0, TAU);
    ctx.ellipse(68, 0, 13, 7, 0, TAU, 0, true);
    ctx.fill("evenodd");
    ctx.stroke();
    ctx.restore();

    // ARTICULATED MOSSY SNAPPING TURTLE (SCION 48: shell retreat -> submarine deploy -> key guard -> blissful back-scratch!)
    var emerge = 0; // 0 = tucked boulder (shell retreat), 1 = legs & head deployed!
    var scratchBliss = 0;
    if (ps.act === 1) {
      emerge = 0.0; // boulder in Act 1 & early Act 2 (1.8s shows boulder!)
    } else if (ps.act === 2) {
      emerge = (ps.viewMode === "turkey" && (t < 2 || t > 5.6))
        ? smooth(0.25, 0.55, (t % 3.6) / 3.6)
        : smooth(3.15, 3.75, t) * (1 - smooth(5.05, 5.50, t) * 0.65);
    } else {
      emerge = 1.0;
      scratchBliss = (ps.viewMode === "trout" && t < 5.6)
        ? smooth(0.48, 0.72, (t % 4.4) / 4.4)
        : smooth(7.70, 8.30, t);
    }

    var scratchSway = scratchBliss * Math.sin(t * 7.2) * 9;
    var turtX = cx - 10 + emerge * 10 + scratchSway;
    var turtY = cy + 66 - emerge * 13 + scratchBliss * 6;

    ctx.save();
    ctx.translate(turtX, turtY);

    // Spiked dinosaur tail (extends left on emerge)
    if (emerge > 0.05) {
      ctx.fillStyle = "#4d6844";
      ctx.strokeStyle = "#162114";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-72, 12);
      ctx.lineTo(-72 - 36 * emerge, 18 + Math.sin(t * 5) * 4);
      ctx.lineTo(-68, 22);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    }

    // Back legs
    if (emerge > 0.05) {
      ctx.fillStyle = "#4a6541";
      ctx.strokeStyle = "#162114";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(-56, 20 + emerge * 8, 16, 11, -0.3, 0, TAU);
      ctx.fill(); ctx.stroke();
    }

    // Telescoping Armored Neck & Hooked Snapping-Turtle Head!
    if (emerge > 0.04) {
      ctx.save();
      var headX = lerp(28, 72, emerge) + scratchBliss * 8;
      var headY = lerp(8, 2, emerge) - scratchBliss * 12;
      ctx.translate(headX, headY);
      ctx.rotate(-0.12 - scratchBliss * 0.25);

      // Scaly neck folds
      ctx.fillStyle = "#5b794d";
      ctx.strokeStyle = "#162114";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-36, -12);
      ctx.quadraticCurveTo(-12, -16, 6, -14);
      ctx.lineTo(6, 14);
      ctx.quadraticCurveTo(-12, 18, -36, 14);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Snapping head + hooked beak
      ctx.fillStyle = "#688956";
      ctx.beginPath();
      ctx.moveTo(-8, -15);
      ctx.quadraticCurveTo(18, -18, 29, -4);
      ctx.lineTo(32, 3); // sharp hooked beak tip
      ctx.quadraticCurveTo(16, 15, -8, 14);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Smile / jaw line
      ctx.beginPath();
      if (scratchBliss > 0.4) {
        // Blissful upturned smile during back-scratch!
        ctx.moveTo(30, 2);
        ctx.quadraticCurveTo(16, 7, 4, -1);
      } else {
        ctx.moveTo(31, 2);
        ctx.lineTo(18, 5);
        ctx.lineTo(6, 2);
      }
      ctx.stroke();

      // Eye (intense reptile eye vs happy closed arc during back-scratch!)
      if (scratchBliss > 0.45) {
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(14, -6, 5.5, Math.PI + 0.3, TAU - 0.3);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#e8cf62";
        ctx.beginPath(); ctx.arc(14, -6, 5.2, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#141a12";
        ctx.beginPath(); ctx.arc(15, -6, 2.5, 0, TAU); ctx.fill();
      }

      // Rival-submarine nostril bubble puffs in Act 2!
      if (ps.act === 2 && emerge > 0.6) {
        ctx.fillStyle = "rgba(210,252,245,0.75)";
        for (var nb = 0; nb < 3; nb++) {
          var nprog = ((t * 2.2 + nb * 0.33) % 1.0);
          ctx.beginPath();
          ctx.arc(30 + nprog * 14, -8 - nprog * 26, 2.2 + nprog * 2.5, 0, TAU);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Ridged Mossy Carapace (Shell — reads as mossy boulder when emerge === 0!)
    var shellG = ctx.createRadialGradient(-12, -22, 10, 0, -4, 92);
    shellG.addColorStop(0, "#63864b");
    shellG.addColorStop(0.65, "#426136");
    shellG.addColorStop(1, "#273c22");
    ctx.fillStyle = shellG;
    ctx.strokeStyle = "#142012";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(-84, 14);
    // Jagged snapping-turtle rear scutes
    ctx.lineTo(-74, -4); ctx.lineTo(-64, -18);
    ctx.quadraticCurveTo(-36, -46, 2, -45);
    ctx.quadraticCurveTo(44, -42, 68, -8);
    ctx.quadraticCurveTo(50, 14, 16, 16);
    ctx.quadraticCurveTo(-34, 20, -84, 14);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Scute polygon plates & green algae moss tufts
    ctx.strokeStyle = "rgba(20,34,18,0.65)";
    ctx.lineWidth = 1.9;
    var scutes = [[-44, -12], [-14, -18], [18, -15], [-28, 2], [4, 4]];
    for (var scI = 0; scI < scutes.length; scI++) {
      ctx.beginPath();
      ctx.ellipse(scutes[scI][0], scutes[scI][1], 16, 10, -0.08, 0, TAU);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(116,162,76,0.55)";
    ctx.beginPath();
    ctx.ellipse(-18, -32, 26, 8, -0.1, 0, TAU);
    ctx.ellipse(16, -26, 20, 7, 0.2, 0, TAU);
    ctx.fill();

    // Scaly Front Legs & Claws gripping the Brass Key!
    if (emerge > 0.05) {
      var legPositions = [[6, 22, 0.15], [58, 16, -0.25]];
      for (var lp = 0; lp < 2; lp++) {
        ctx.save();
        ctx.translate(legPositions[lp][0], legPositions[lp][1] * emerge);
        ctx.rotate(legPositions[lp][2]);
        ctx.fillStyle = "#5c7a4d";
        ctx.strokeStyle = "#162114";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(0, 6, 14, 16, 0, 0, TAU);
        ctx.fill(); ctx.stroke();
        // Sharp curved claws
        ctx.fillStyle = "#dfd0a0";
        for (var cw = -1; cw <= 1; cw++) {
          ctx.beginPath();
          ctx.moveTo(cw * 6 - 2, 18);
          ctx.lineTo(cw * 7, 27);
          ctx.lineTo(cw * 6 + 3, 18);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
        }
        ctx.restore();
      }
    }

    // Back-scratch glee lines above shell at t ≈ 9.2s!
    if (scratchBliss > 0.45) {
      ctx.strokeStyle = "rgba(255,228,136," + (scratchBliss * 0.85).toFixed(3) + ")";
      ctx.lineWidth = 2.4;
      for (var gl = -1; gl <= 1; gl++) {
        ctx.beginPath();
        ctx.moveTo(gl * 22, -54);
        ctx.lineTo(gl * 28 + Math.sin(t * 12) * 3, -68);
        ctx.stroke();
      }
    }
    ctx.restore(); // end turtle

    if (lamp > 0.05) {
      drawBowLampBeam(ctx, cx, cy - sightShiftY, r, lamp * 0.45, null);
    }

    // Act 3: Spotted Brook Trout swimming out under right arch looking IN!
    if (ps.act === 3) {
      var trEnter = (ps.viewMode === "trout" && t < 5.6) ? 1.0 : smooth(5.65, 6.55, t);
      var tx4 = lerp(cx + 230, cx + 116, trEnter);
      var ty4 = cy - 6 + Math.sin(t * 2.5) * 5;
      drawBrookTrout(ctx, {
        x: tx4,
        y: ty4,
        scale: 0.76,
        flipX: false,
        tilt: 0.12 - scratchBliss * 0.1,
        phase: t,
        jaw: 0.25 + scratchBliss * 0.45,
        lookX: -1,
        lookY: 0.5
      });
    }

    ctx.restore(); // end sightShiftY

    if (ps.act <= 2) {
      drawTurkeyGlassReflection(ctx, {
        x: cx - 108,
        y: cy + 112,
        flip: false,
        alpha: ps.act === 1 ? 0.28 : 0.56,
        tilt: emerge * -0.14,
        t: t,
        gasp: emerge * 0.45
      });
    } else {
      drawSubInteriorGlimpseForTrout(ctx, cx, cy, t);
    }
  }

  // =========================================================================
  // PORTHOLE #05 · SCOPE — Waterline: Raccoon hands washing tin plate
  // Split Plane (SCION 44): air / creek | Default Tool: BALLAST
  // =========================================================================
  function renderScene05(ctx, cx, cy, r, ps) {
    var t = ps.t, bal = ps.ballastAmt, lamp = ps.lampAmt;

    // Physical consequence of BALLAST at Scope station:
    // Unballasted (bal=0, t<1s): sub sits untrimmed deep underwater (waterline high at cy - 138!)
    // Ballasted (bal=1, t>=1.5s): sub trims onto the exact meniscus split plane (waterline dead-center at cy - 4!)
    var waterY = cy + lerp(-136, -4, bal) + Math.sin(t * 2.1) * 3;

    // Helper for oscillating meniscus curve y(x)
    function meniscusAt(x) {
      return waterY + Math.sin((x - cx) * 0.032 + t * 3.1) * 4.2 + Math.cos((x - cx) * 0.055 - t * 2.2) * 2.2;
    }

    // Plate & Raccoon choreography:
    // Act 2a (2.0–3.6s): Scrubbing & spinning tin plate ("Rescue mechanic?")
    // Act 2b (3.6–5.6s): Hoisting round tin plate upward like pried hubcap ("or hubcap thief?")
    // Act 3a (5.6–7.6s): Dipping plate into rising bubble-wash ("Bubbling dish-dryer?")
    // Act 3b (7.6–10.0s): Raccoon shakes paws in air while tin plate floats flat on meniscus ("or floating pie tin?")
    var hubcapLift = 0, floatRelease = 0;
    if (ps.act === 2) {
      hubcapLift = (ps.viewMode === "turkey" && (t < 2 || t > 5.6))
        ? smooth(0.4, 0.72, (t % 3.6) / 3.6)
        : smooth(3.55, 4.15, t) * (1 - smooth(5.1, 5.55, t) * 0.6);
    } else if (ps.act === 3) {
      floatRelease = (ps.viewMode === "trout" && t < 5.6)
        ? smooth(0.48, 0.72, (t % 4.4) / 4.4)
        : smooth(7.70, 8.35, t);
    }

    var plateX = cx + 4 + Math.sin(t * 2.4) * 5 - hubcapLift * 8;
    var plateY = waterY + 6 - hubcapLift * 36 + (ps.act === 3 && floatRelease < 0.4 ? 14 : 0) - floatRelease * 4;
    var plateRot = t * 1.35 * (1 - floatRelease * 0.85);
    var plateTiltY = lerp(1.0, 0.34, floatRelease); // tilts flatter on surface when floating like a pie tin!

    // Shared Tin Pie Plate renderer (called separately in Air half & Refracted Water half!)
    function drawTinPiePlate(refractX, tintWater) {
      ctx.save();
      ctx.translate(plateX + refractX, plateY);
      ctx.scale(1, plateTiltY);
      ctx.rotate(plateRot);

      var pr = 78;
      var tinG = ctx.createLinearGradient(-pr, -pr, pr, pr);
      if (tintWater) {
        tinG.addColorStop(0.0, "#7abec2");
        tinG.addColorStop(0.35, "#d4f3f2");
        tinG.addColorStop(0.55, "#5c9ea3");
        tinG.addColorStop(0.82, "#bce6e6");
        tinG.addColorStop(1.0, "#498085");
      } else {
        tinG.addColorStop(0.0, "#a8b9be");
        tinG.addColorStop(0.32, "#fff9ea");
        tinG.addColorStop(0.52, "#7e9199");
        tinG.addColorStop(0.78, "#f0f5f7");
        tinG.addColorStop(1.0, "#687b82");
      }
      ctx.fillStyle = tinG;
      ctx.strokeStyle = "#1a2628";
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, 0, pr, 0, TAU); ctx.fill(); ctx.stroke();

      // Concentric crimped pie-tin bevel rings
      ctx.lineWidth = 1.9;
      ctx.beginPath(); ctx.arc(0, 0, pr * 0.78, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, pr * 0.34, 0, TAU); ctx.stroke();

      // Rotating metallic sun-flash spokes
      ctx.strokeStyle = tintWater ? "rgba(220,255,252,0.55)" : "rgba(255,250,224,0.75)";
      ctx.lineWidth = 3;
      for (var sp = 0; sp < 4; sp++) {
        var sa = sp * Math.PI * 0.5 + 0.4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sa) * 14, Math.sin(sa) * 14);
        ctx.lineTo(Math.cos(sa) * 68, Math.sin(sa) * 68);
        ctx.stroke();
      }
      ctx.restore();
    }

    // ==================== 1. UPPER AIR PLANE (above meniscus) ====================
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - r - 10, cy - r - 10);
    ctx.lineTo(cx + r + 10, cy - r - 10);
    ctx.lineTo(cx + r + 10, meniscusAt(cx + r + 10));
    for (var mx1 = cx + r; mx1 >= cx - r - 10; mx1 -= 16) {
      ctx.lineTo(mx1, meniscusAt(mx1));
    }
    ctx.closePath();
    ctx.clip();

    // Warm Appalachian Autumn Forest Sky & Birch Trunks
    var skyG = ctx.createLinearGradient(cx, cy - r, cx, waterY);
    skyG.addColorStop(0, "#ffe8ad");
    skyG.addColorStop(0.65, "#f5cb78");
    skyG.addColorStop(1, "#d9a95b");
    ctx.fillStyle = skyG;
    ctx.fillRect(cx - r - 10, cy - r - 10, r * 2 + 20, r * 2 + 20);

    // Distant golden tree trunks
    ctx.fillStyle = "rgba(186,132,68,0.42)";
    ctx.fillRect(cx - 88, cy - r, 18, 180);
    ctx.fillRect(cx - 24, cy - r, 24, 180);
    ctx.fillRect(cx + 52, cy - r, 16, 180);

    // Creek bank stones & autumn grass along waterline
    ctx.fillStyle = "#8c8f58";
    ctx.strokeStyle = "#242818";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - r - 10, waterY - 26);
    ctx.quadraticCurveTo(cx - 70, waterY - 34, cx + r + 10, waterY - 22);
    ctx.lineTo(cx + r + 10, waterY + 20);
    ctx.lineTo(cx - r - 10, waterY + 20);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Swaying Burnt-Orange Autumn Maple Leaves (left canopy)
    var leaves = [
      { x: cx - 122, y: cy - 92, s: 0.95, r: 0.3 },
      { x: cx - 64, y: cy - 114, s: 1.15, r: -0.2 },
      { x: cx - 14, y: cy - 146, s: 0.85, r: 0.5 },
      { x: cx + 148, y: cy - 42, s: 0.82, r: -0.4 }
    ];
    for (var li = 0; li < leaves.length; li++) {
      var lf = leaves[li];
      ctx.save();
      ctx.translate(lf.x, lf.y);
      ctx.rotate(lf.r + Math.sin(t * 1.9 + li) * 0.12);
      ctx.scale(lf.s, lf.s);
      ctx.fillStyle = (li % 2 === 0) ? "#e87a2e" : "#d95b26";
      ctx.strokeStyle = "#2b160b";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(7, -11); ctx.lineTo(22, -14); ctx.lineTo(14, -1);
      ctx.lineTo(24, 9); ctx.lineTo(8, 11); ctx.lineTo(3, 22);
      ctx.lineTo(0, 14); ctx.lineTo(-4, 22); ctx.lineTo(-8, 11);
      ctx.lineTo(-24, 9); ctx.lineTo(-14, -1); ctx.lineTo(-22, -14); ctx.lineTo(-7, -11);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // Upper (in-air) half of the Tin Pie Plate!
    drawTinPiePlate(0, false);

    // ARTICULATED RINGED RACCOON ARMS & 5-FINGERED PAWS reaching from upper-right!
    var pawLift = floatRelease * 34;
    var scrubOsc = (1 - floatRelease) * Math.sin(t * 6.5) * 9;
    var arms = [
      { sx: cx + 74, sy: cy - 188, px: plateX - 18 + scrubOsc, py: plateY - 58 * plateTiltY - pawLift * 0.8, rot: 0.35 },
      { sx: cx + 168, sy: cy - 118, px: plateX + 44 - scrubOsc, py: plateY - 12 * plateTiltY - pawLift, rot: 0.58 }
    ];
    for (var ai = 0; ai < 2; ai++) {
      var ar = arms[ai];
      var elbX = lerp(ar.sx, ar.px, 0.52) + 18;
      var elbY = lerp(ar.sy, ar.py, 0.48) - 8;

      // Furry raccoon sleeve (banded grizzled grey-brown & black cuff)
      ctx.strokeStyle = "#201b16";
      ctx.lineWidth = 30;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(ar.sx, ar.sy);
      ctx.quadraticCurveTo(elbX, elbY, ar.px, ar.py);
      ctx.stroke();

      ctx.strokeStyle = "#7c7060";
      ctx.lineWidth = 25;
      ctx.beginPath();
      ctx.moveTo(ar.sx, ar.sy);
      ctx.quadraticCurveTo(elbX, elbY, lerp(elbX, ar.px, 0.65), lerp(elbY, ar.py, 0.65));
      ctx.stroke();

      // Dark black wrist band
      ctx.strokeStyle = "#26211c";
      ctx.lineWidth = 21;
      ctx.beginPath();
      ctx.moveTo(lerp(elbX, ar.px, 0.55), lerp(elbY, ar.py, 0.55));
      ctx.lineTo(ar.px, ar.py);
      ctx.stroke();

      // Nimble 5-fingered dark brown-grey Raccoon Hand & Claws!
      ctx.save();
      ctx.translate(ar.px, ar.py);
      ctx.rotate(ar.rot + (floatRelease > 0.3 ? Math.sin(t * 14 + ai) * 0.22 : 0));
      ctx.fillStyle = "#5c5146";
      ctx.strokeStyle = "#1c1713";
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.ellipse(0, 4, 13, 10, 0, 0, TAU);
      ctx.fill(); ctx.stroke();
      for (var fi = -2; fi <= 2; fi++) {
        ctx.save();
        ctx.rotate(fi * 0.22);
        ctx.beginPath();
        ctx.moveTo(fi * 2.5 - 2.5, 9);
        ctx.lineTo(fi * 3 - 1.5, 24 - Math.abs(fi) * 2);
        ctx.lineTo(fi * 3 + 2.0, 24 - Math.abs(fi) * 2);
        ctx.lineTo(fi * 2.5 + 2.5, 9);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    // Sparkling water droplets flicking off raccoon paws when released at t ≈ 8–9.5s!
    if (floatRelease > 0.35) {
      ctx.fillStyle = "rgba(255,252,232,0.88)";
      for (var dr = 0; dr < 8; dr++) {
        var dp = ((t * 2.4 + dr * 0.17) % 1.0);
        var dx = arms[1].px - 18 + (dr - 3.5) * 9 + dp * (dr - 3.5) * 6;
        var dy = arms[1].py + 16 + dp * dp * 38;
        ctx.beginPath(); ctx.arc(dx, dy, 2.2, 0, TAU); ctx.fill();
      }
    }
    ctx.restore(); // end upper air clip

    // ==================== 2. LOWER CREEK PLANE (below meniscus) ====================
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - r - 10, meniscusAt(cx - r - 10));
    for (var mx2 = cx - r; mx2 <= cx + r + 10; mx2 += 16) {
      ctx.lineTo(mx2, meniscusAt(mx2));
    }
    ctx.lineTo(cx + r + 10, cy + r + 10);
    ctx.lineTo(cx - r - 10, cy + r + 10);
    ctx.closePath();
    ctx.clip();

    var creekTop = bal > 0.5 ? "#33968e" : "#164648";
    var creekBot = bal > 0.5 ? "#174544" : "#0b2224";
    drawWaterBackdrop(ctx, cx, cy + 40, r + 40, creekTop, creekBot, t, lamp + bal * 0.5, 5.5);

    // Refracted diagonal sunbeams slicing into the emerald creek!
    if (bal > 0.3) {
      ctx.fillStyle = "rgba(182,248,225," + (0.17 * bal).toFixed(3) + ")";
      ctx.beginPath();
      ctx.moveTo(cx - 65, waterY); ctx.lineTo(cx - 128, cy + r); ctx.lineTo(cx - 64, cy + r); ctx.lineTo(cx - 18, waterY);
      ctx.moveTo(cx + 22, waterY); ctx.lineTo(cx + 58, cy + r); ctx.lineTo(cx + 116, cy + r); ctx.lineTo(cx + 68, waterY);
      ctx.fill();
    }

    // SCION 44 SPLIT-PLANE OPTICAL REFRACTION: submerged half of tin plate is horizontally displaced (+9px) & tinted cool aqua!
    drawTinPiePlate(9, true);

    // Act 3a ("Bubbling dish-dryer?"): rising curtain of warm wash bubbles scrubbing across the submerged tin plate!
    var dishBubbles = (ps.act === 3 && floatRelease < 0.75) ? 1.0 : 0.25;
    if (dishBubbles > 0.3 || lamp > 0.3) {
      ctx.fillStyle = "rgba(210,252,248,0.68)";
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 1.2;
      for (var wb = 0; wb < 16; wb++) {
        var wprog = ((t * 1.4 + wb * 0.11) % 1.0);
        var wbx = plateX - 54 + (wb % 8) * 15 + Math.sin(t * 5 + wb) * 4;
        var wby = lerp(cy + 145, waterY + 6, wprog);
        var wbr = 2.2 + (wb % 3) * 1.8;
        ctx.beginPath(); ctx.arc(wbx, wby, wbr, 0, TAU); ctx.fill(); ctx.stroke();
      }
    }

    if (lamp > 0.05) {
      drawBowLampBeam(ctx, cx, cy, r, lamp * 0.45, null);
    }

    // Act 3: Spotted Brook Trout in the emerald creek half looking IN across the glass!
    if (ps.act === 3) {
      var tr5 = (ps.viewMode === "trout" && t < 5.6) ? 1.0 : smooth(5.65, 6.55, t);
      var tx5 = lerp(cx + 220, cx + 48, tr5) - floatRelease * 12;
      var ty5 = cy + 92 + Math.sin(t * 2.6) * 5;
      drawBrookTrout(ctx, {
        x: tx5,
        y: ty5,
        scale: 0.84,
        flipX: false,
        tilt: -0.06 - floatRelease * 0.10,
        phase: t * 1.15,
        jaw: 0.28 + floatRelease * 0.32,
        lookX: -1,
        lookY: -0.35
      });
    }

    drawDriftingMotes(ctx, cx, cy + 50, r, t, 14, 505, false);
    ctx.restore(); // end lower creek clip

    // ==================== 3. CRISP MENISCUS WAVE RIBBON & RIPPLE RINGS ====================
    ctx.save();
    // Concentric surface ripples around the tin plate
    for (var rp = 0; rp < 3; rp++) {
      var rProg = ((t * 0.85 + rp * 0.33) % 1.0);
      ctx.strokeStyle = "rgba(238,252,248," + ((1 - rProg) * 0.65).toFixed(3) + ")";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(plateX, waterY + 2, 58 + rProg * 86, 6 + rProg * 5, 0, 0, TAU);
      ctx.stroke();
    }

    // Meniscus foam & specular wave band
    ctx.fillStyle = "rgba(218,248,242,0.78)";
    ctx.strokeStyle = "#173534";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(cx - r - 6, meniscusAt(cx - r - 6) - 3.5);
    for (var mx3 = cx - r; mx3 <= cx + r + 8; mx3 += 14) {
      ctx.lineTo(mx3, meniscusAt(mx3) - 3.5);
    }
    for (var mx4 = cx + r + 8; mx4 >= cx - r - 6; mx4 -= 14) {
      ctx.lineTo(mx4, meniscusAt(mx4) + 4.2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Foreground glass reflections
    if (ps.act <= 2) {
      drawTurkeyGlassReflection(ctx, {
        x: cx - 108,
        y: cy + 112,
        flip: false,
        alpha: ps.act === 1 ? 0.28 : 0.56,
        tilt: hubcapLift * -0.16,
        t: t,
        gasp: hubcapLift * 0.6
      });
    } else {
      drawSubInteriorGlimpseForTrout(ctx, cx, cy, t);
    }
  }

  // ---------- Setup A Bread-Tin Cockpit & Story Strip Renderer ----------
  function renderFullPortal(ctx, W, H, rawT, state, meta, sceneFn) {
    var ps = resolvePortalState(meta, rawT, state);
    var t = ps.t;

    ctx.save();
    if (W !== 1280 || H !== 720) {
      ctx.scale(W / 1280, H / 720);
    }

    // 1. Cockpit Hull Outer Frame (y = 0..536)
    ctx.fillStyle = "#0b1618";
    ctx.fillRect(0, 0, 1280, 536);

    // Oval Bread-Roll Tin Interior (#132427) with subtle Right-Side Dent!
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(126, 18);
    ctx.lineTo(1154, 18);
    ctx.quadraticCurveTo(1234, 18, 1234, 98);
    ctx.lineTo(1234, 212);
    // Setup A Right-Side Dent!
    ctx.bezierCurveTo(1206, 245, 1206, 305, 1234, 338);
    ctx.lineTo(1234, 438);
    ctx.quadraticCurveTo(1234, 518, 1154, 518);
    ctx.lineTo(126, 518);
    ctx.quadraticCurveTo(46, 518, 46, 438);
    ctx.lineTo(46, 98);
    ctx.quadraticCurveTo(46, 18, 126, 18);
    ctx.closePath();

    var tinWallG = ctx.createRadialGradient(640, 90, 40, 640, 270, 680);
    tinWallG.addColorStop(0, ps.lampOn ? "#1b3337" : "#162a2e");
    tinWallG.addColorStop(0.55, "#132427");
    tinWallG.addColorStop(1, "#0e1b1e");
    ctx.fillStyle = tinWallG;
    ctx.fill();

    ctx.strokeStyle = "#4d716e";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Extra metallic crease highlight inside the right-side dent
    ctx.strokeStyle = "#79a39e";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(1224, 224);
    ctx.quadraticCurveTo(1201, 275, 1224, 326);
    ctx.stroke();
    ctx.restore();

    // Overhead Amber Task-Light Bar & Ceiling Ribs
    ctx.strokeStyle = "#8a6843";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(124, 62);
    ctx.lineTo(208, 34);
    ctx.lineTo(1072, 34);
    ctx.lineTo(1156, 62);
    ctx.stroke();

    // Warm Amber Task-Light Capsule + soft downward glow cone
    var taskAlpha = 0.22 + ps.lampAmt * 0.16;
    var taskGlow = ctx.createRadialGradient(640, 34, 8, 640, 120, 260);
    taskGlow.addColorStop(0, "rgba(237,180,115," + taskAlpha.toFixed(3) + ")");
    taskGlow.addColorStop(1, "rgba(237,180,115,0)");
    ctx.fillStyle = taskGlow;
    ctx.fillRect(360, 20, 560, 260);

    ctx.fillStyle = ps.lampOn ? "#ffca7a" : "#d99e5b";
    ctx.strokeStyle = "#2b1c0e";
    ctx.lineWidth = 1.8;
    roundedRectPath(ctx, 586, 26, 108, 15, 7);
    ctx.fill(); ctx.stroke();

    // 2. Centered Porthole Glass Scene (cx = 640, cy = 255, r_glass = 185)
    var cx = 640, cy = 255, rGlass = 185, rOuter = 230;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rGlass, 0, TAU);
    ctx.clip();

    sceneFn(ctx, cx, cy, rGlass, ps);

    // Porthole Bow Spotlight Hood inside bottom of glass when lamp is fitted/active
    if (meta.defaultTool === "lamp" || ps.lampOn) {
      ctx.save();
      var hoodY = cy + rGlass - 2;
      var hoodG = ctx.createLinearGradient(cx - 38, hoodY - 26, cx + 38, hoodY);
      hoodG.addColorStop(0, "#7c5b2b");
      hoodG.addColorStop(0.5, ps.lampOn ? "#ffd27d" : "#b38b48");
      hoodG.addColorStop(1, "#5c421d");
      ctx.fillStyle = hoodG;
      ctx.strokeStyle = "#1b1308";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(cx, hoodY + 6, 36, Math.PI, TAU);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      if (ps.lampOn) {
        ctx.fillStyle = "rgba(255,238,182,0.85)";
        ctx.beginPath();
        ctx.ellipse(cx, hoodY - 18, 22, 6, 0, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // Curved Glass Inner Vignette & Specular Arc
    var glassVig = ctx.createRadialGradient(cx, cy, rGlass - 22, cx, cy, rGlass + 2);
    glassVig.addColorStop(0, "rgba(8,18,20,0)");
    glassVig.addColorStop(0.75, "rgba(8,18,20,0.16)");
    glassVig.addColorStop(1, "rgba(6,12,14,0.58)");
    ctx.fillStyle = glassVig;
    ctx.beginPath(); ctx.arc(cx, cy, rGlass, 0, TAU); ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.20)";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, rGlass - 16, -2.62, -1.96);
    ctx.stroke();
    ctx.restore(); // end glass clip

    // 3. Riveted 6-Bolt Antique Brass Porthole Bezel + Left Hinge + Right Offset Latch + 2-O'CLOCK RIM CHIP!
    // Left heavy iron barrel hinge
    ctx.save();
    ctx.fillStyle = "#3f3b36";
    ctx.strokeStyle = "#141210";
    ctx.lineWidth = 2.2;
    roundedRectPath(ctx, cx - rOuter - 20, cy - 52, 30, 104, 5);
    ctx.fill(); ctx.stroke();
    roundedRectPath(ctx, cx - rOuter - 27, cy - 56, 13, 112, 6);
    ctx.fill(); ctx.stroke();
    // Hinge screws
    ctx.fillStyle = "#262320";
    ctx.beginPath();
    ctx.arc(cx - rOuter - 2, cy - 32, 4.5, 0, TAU);
    ctx.arc(cx - rOuter - 2, cy + 32, 4.5, 0, TAU);
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // Right offset brass dog-latch
    ctx.save();
    ctx.fillStyle = "#a88344";
    ctx.strokeStyle = "#1b1409";
    ctx.lineWidth = 2.2;
    roundedRectPath(ctx, cx + rOuter - 16, cy - 34, 24, 68, 8);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#caa25a";
    ctx.beginPath();
    ctx.moveTo(cx + rOuter - 22, cy - 8);
    ctx.lineTo(cx + rOuter + 24, cy - 11);
    ctx.lineTo(cx + rOuter + 24, cy + 11);
    ctx.lineTo(cx + rOuter - 22, cy + 8);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // Main Brass Bezel Ring
    ctx.save();
    var bezelG = ctx.createLinearGradient(cx - rOuter, cy - rOuter, cx + rOuter, cy + rOuter);
    bezelG.addColorStop(0.0, "#d4b068");
    bezelG.addColorStop(0.32, "#9a763b");
    bezelG.addColorStop(0.68, "#bd9752");
    bezelG.addColorStop(1.0, "#6d5024");
    ctx.fillStyle = bezelG;
    ctx.strokeStyle = "#181208";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, TAU);
    ctx.arc(cx, cy, rGlass, TAU, 0, true);
    ctx.closePath();
    ctx.fill("evenodd");
    ctx.stroke();

    // Inner brass step ring
    ctx.strokeStyle = "#4d3616";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(cx, cy, rGlass + 6, 0, TAU);
    ctx.stroke();

    // *** SETUP A INVARIANT: 2-O'CLOCK RIM CHIP (sharp V-notch gouged on inner brass rim at ~ -24 deg) ***
    var chipAng = -0.40; // ~2 o'clock (just below the 2-o'clock bolt so both are crystal clear!)
    var chX = cx + Math.cos(chipAng) * (rGlass + 3);
    var chY = cy + Math.sin(chipAng) * (rGlass + 3);
    ctx.save();
    ctx.translate(chX, chY);
    ctx.rotate(chipAng);
    // Dark chipped cavity
    ctx.fillStyle = "#171109";
    ctx.beginPath();
    ctx.moveTo(-4, -9);
    ctx.lineTo(14, -3);
    ctx.lineTo(-4, 9);
    ctx.closePath();
    ctx.fill();
    // Bright raw nicked brass facet highlight
    ctx.strokeStyle = "#ffe39c";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-3, -8);
    ctx.lineTo(13, -3);
    ctx.lineTo(-3, 8);
    ctx.stroke();
    ctx.restore();

    // 6 Riveted Hexagonal 1d6 Bolts around the Brass Ring!
    var boltAngles = [-Math.PI / 2, -Math.PI / 6, Math.PI / 6, Math.PI / 2, 5 * Math.PI / 6, 7 * Math.PI / 6];
    for (var bi = 0; bi < 6; bi++) {
      var faceNum = bi + 1;
      var ba = boltAngles[bi];
      var bx = cx + Math.cos(ba) * 208;
      var by = cy + Math.sin(ba) * 208;
      var isRolled = (ps.activeRoll === faceNum);

      ctx.save();
      ctx.translate(bx, by);

      if (isRolled) {
        var regCol = (faceNum <= 2) ? "#3ec2cf" : (faceNum <= 4) ? "#5ad48b" : "#f58352";
        var pulse = 0.75 + 0.25 * Math.sin(t * 7.0);
        ctx.strokeStyle = regCol;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(0, 0, 17 + pulse * 3, 0, TAU);
        ctx.stroke();
      }

      ctx.fillStyle = isRolled ? "#ffe184" : "#b8914b";
      ctx.strokeStyle = "#1a1308";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (var hi = 0; hi < 6; hi++) {
        var ha = hi * Math.PI / 3;
        var hx = Math.cos(ha) * 12, hy = Math.sin(ha) * 12;
        if (hi === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = isRolled ? "#fff3bd" : "#9c7838";
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill();

      // Star glint on rolled 1d6 bolt!
      if (isRolled) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-18, 0); ctx.lineTo(18, 0);
        ctx.moveTo(0, -18); ctx.lineTo(0, 18);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();

    // 4. Cockpit Instruments & Controls
    // Top-Left Station Plaque
    ctx.save();
    ctx.fillStyle = "#102023";
    ctx.strokeStyle = "#486b68";
    ctx.lineWidth = 1.6;
    roundedRectPath(ctx, 72, 58, 276, 88, 10);
    ctx.fill(); ctx.stroke();
    if (ps.showCaptions) {
      ctx.font = "600 13px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#edb473";
      ctx.fillText("STATION " + meta.station, 90, 84);
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#a3dac8";
      ctx.fillText("FIT: " + (meta.defaultTool === "ballast" ? "BALLAST TRAY" : "LAMP MODULE"), 90, 106);
      ctx.fillStyle = "#b6c8c4";
      ctx.fillText(meta.scionRule, 90, 128);
    } else {
      // Purely graphical non-text bread-tin schematic icon when showCaptions === false!
      ctx.strokeStyle = "#6c9690";
      ctx.lineWidth = 2;
      roundedRectPath(ctx, 118, 82, 184, 40, 20);
      ctx.stroke();
      ctx.fillStyle = "#edb473";
      var dotPos = 140 + ((meta.id - 1) / 4) * 140;
      ctx.beginPath(); ctx.arc(dotPos, 102, 6, 0, TAU); ctx.fill();
    }
    ctx.restore();

    // Top-Right "1 Day of Air" Pressure Gauge (cx = 1098, cy = 120, r = 54)
    ctx.save();
    ctx.translate(1098, 120);
    ctx.fillStyle = "#b8924d";
    ctx.strokeStyle = "#181208";
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, 0, 56, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f7efdc";
    ctx.beginPath(); ctx.arc(0, 0, 48, 0, TAU); ctx.fill(); ctx.stroke();
    // Dial ticks
    ctx.strokeStyle = "#222a28";
    ctx.lineWidth = 1.8;
    for (var ti = 0; ti <= 8; ti++) {
      var ta = -Math.PI * 0.85 + (ti / 8) * Math.PI * 0.95;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ta) * 38, Math.sin(ta) * 38);
      ctx.lineTo(Math.cos(ta) * 46, Math.sin(ta) * 46);
      ctx.stroke();
    }
    // Needle (boosts slightly in #02 when baster pumps air!)
    var airBoost = (meta.id === 2 && ps.act === 2 && t > 3.6) ? 0.16 : 0;
    var needleAng = -0.95 - (t / 10) * 0.08 + airBoost + Math.sin(t * 5.0) * 0.025;
    ctx.strokeStyle = "#b53622";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(Math.cos(needleAng) * 38, Math.sin(needleAng) * 38);
    ctx.stroke();
    ctx.fillStyle = "#222";
    ctx.beginPath(); ctx.arc(0, 4, 4, 0, TAU); ctx.fill();

    if (ps.showCaptions) {
      ctx.textAlign = "center";
      ctx.font = "bold 13px Georgia, serif";
      ctx.fillStyle = "#1b2625";
      ctx.fillText("1 DAY", 0, 22);
      ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("OF AIR", 0, 35);
    }
    ctx.restore();

    // Bottom-Left: BALLAST / SINGLE SLOT (x = 84, y = 426, w = 250, h = 76)
    ctx.save();
    ctx.fillStyle = "#102023";
    ctx.strokeStyle = ps.ballastOn ? "#7fe0ce" : "#618580";
    ctx.lineWidth = 2;
    roundedRectPath(ctx, 84, 426, 250, 76, 12);
    ctx.fill(); ctx.stroke();

    if (ps.showCaptions) {
      ctx.font = "11.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#9ec0ba";
      ctx.fillText("BALLAST / SINGLE SLOT", 104, 446);
    }

    // Socket recess
    ctx.fillStyle = "#0b1618";
    ctx.strokeStyle = "#4d6e6a";
    ctx.lineWidth = 1.6;
    ctx.fillRect(114, 456, 178, 32);
    ctx.strokeRect(114, 456, 178, 32);

    // Physical slide-in Ballast Tray vs spare slot!
    var traySlide = ps.ballastAmt;
    var trayX = lerp(122, 146, traySlide);
    ctx.fillStyle = ps.ballastOn ? "#4e7c76" : "#253b3d";
    ctx.strokeStyle = ps.ballastOn ? "#b5f2e5" : "#567572";
    ctx.lineWidth = 2;
    roundedRectPath(ctx, trayX, 460, 124, 24, 4);
    ctx.fill(); ctx.stroke();
    // Brass pull handle on ballast module
    ctx.fillStyle = ps.ballastOn ? "#ffd275" : "#9c7a40";
    roundedRectPath(ctx, trayX + 98, 464, 18, 16, 3);
    ctx.fill();
    ctx.restore();

    // Bottom-Center: CHALK CHART UNDER GLASS (x = 462, y = 440, w = 356, h = 64)
    ctx.save();
    ctx.fillStyle = "#122427";
    ctx.strokeStyle = "#7ea39e";
    ctx.lineWidth = 2;
    roundedRectPath(ctx, 462, 440, 356, 64, 12);
    ctx.fill(); ctx.stroke();

    if (ps.showCaptions) {
      ctx.textAlign = "center";
      ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#a8c7c2";
      ctx.fillText("CHART UNDER GLASS", 640, 456);
    }

    // Progressive white chalk polyline across the bend!
    var pts = [[496, 488], [568, 468], [642, 486], [724, 470], [784, 476]];
    // Faint baseline
    ctx.strokeStyle = "rgba(180,210,205,0.22)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var pi = 1; pi < pts.length; pi++) ctx.lineTo(pts[pi][0], pts[pi][1]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Active drawn chalk line up to ps.chartProgress
    var totalSegs = pts.length - 1;
    var scaledU = ps.chartProgress * totalSegs;
    ctx.strokeStyle = "#f4f1e6";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var si = 0; si < totalSegs; si++) {
      var segU = clamp(scaledU - si, 0, 1);
      if (segU > 0) {
        ctx.lineTo(lerp(pts[si][0], pts[si + 1][0], segU), lerp(pts[si][1], pts[si + 1][1], segU));
      }
    }
    ctx.stroke();

    // Gold Landmark Dot at t >= 5.6s (Act 3)!
    if (ps.act === 3 || ps.chartProgress > 0.72) {
      var dotScale = (ps.viewMode === "trout") ? 1 : easeOutBack(smooth(5.7, 6.6, t));
      var lx = pts[3][0], ly = pts[3][1];
      ctx.fillStyle = "rgba(255,212,92,0.32)";
      ctx.beginPath(); ctx.arc(lx, ly, 12 * dotScale, 0, TAU); ctx.fill();
      ctx.fillStyle = "#ffd45e";
      ctx.strokeStyle = "#1b1408";
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(lx, ly, 5.5 * dotScale, 0, TAU); ctx.fill(); ctx.stroke();
    }

    // Glazing diagonal reflection sheen
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(510, 498); ctx.lineTo(542, 446);
    ctx.moveTo(735, 498); ctx.lineTo(765, 446);
    ctx.stroke();
    ctx.restore();

    // Bottom-Right: LAMP TOGGLE (x = 976, y = 420, w = 132, h = 82)
    ctx.save();
    ctx.fillStyle = "#1a2524";
    ctx.strokeStyle = ps.lampOn ? "#ffbe6b" : "#b88952";
    ctx.lineWidth = 2.2;
    roundedRectPath(ctx, 976, 420, 132, 82, 12);
    ctx.fill(); ctx.stroke();

    if (ps.showCaptions) {
      ctx.font = "11.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#e6c396";
      ctx.fillText("TOGGLE", 1002, 439);
    }

    // Indicator jewel
    ctx.fillStyle = ps.lampOn ? "#ffcf70" : "#3a3126";
    ctx.beginPath(); ctx.arc(1084, 435, 5, 0, TAU); ctx.fill();

    // Brass pivot nut & animated toggle bat-handle!
    var tcx = 1042, tcy = 474;
    ctx.fillStyle = "#d49b54";
    ctx.strokeStyle = "#1a1208";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(tcx, tcy, 10, 0, TAU); ctx.fill(); ctx.stroke();

    var leverAng = lerp(-2.25, -0.95, ps.lampAmt); // flips from LEFT-UP (OFF) to RIGHT-UP (ON)!
    ctx.strokeStyle = "#f4f2eb";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tcx, tcy);
    ctx.lineTo(tcx + Math.cos(leverAng) * 28, tcy + Math.sin(leverAng) * 28);
    ctx.stroke();
    ctx.restore();

    // 5. Articulated Turkey Pilot Wing reaching & operating the control in Act 1!
    drawTurkeyPilotWing(ctx, meta, ps);

    // 6. Lower Editorial Cream Strip (y = 536..720)
    ctx.fillStyle = "#faf8f3";
    ctx.fillRect(0, 536, 1280, 184);

    // Subtle paper grain over cream strip & cockpit
    var pat = getGrainPattern(ctx);
    if (pat) {
      ctx.save();
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, 1280, 720);
      ctx.restore();
    }

    // Top rule dividing cockpit & paper strip
    ctx.strokeStyle = "#d4cec0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 536.75);
    ctx.lineTo(1280, 536.75);
    ctx.stroke();

    if (ps.showCaptions) {
      // Rich Editorial Story Strip (Act 1 Setup -> Act 2 Turkey Rust -> Act 3 Trout Teal)
      var kickerCol, headlineCol, kickerTxt, mainTxt, subTxt;
      if (ps.act === 1) {
        kickerCol = "#6b5a45";
        headlineCol = "#1f282a";
        kickerTxt = "SETUP A · BREAD-TIN COCKPIT   (" + meta.station + ")   ·   OPERATE " + (meta.defaultTool === "ballast" ? "BALLAST SLOT" : "LAMP TOGGLE");
        mainTxt = meta.clue;
        subTxt = "Point to the control, operate it at 1.0s, and watch what changes outside · " + meta.scionRule;
      } else if (ps.act === 2) {
        kickerCol = "#9e3d1c";
        headlineCol = "#9e3d1c";
        kickerTxt = "FIRST PASS · TURKEY LOOKS OUT   (" + meta.station + ")";
        mainTxt = "“" + meta.turkeyFork + "”";
        subTxt = "Write odd faces (1 · 3 · 5)  ·  " + meta.scionRule + "  ·  Clue: " + meta.clue;
      } else {
        kickerCol = "#1d596e";
        headlineCol = "#1d596e";
        kickerTxt = "SECOND PASS · TROUT LOOKS IN   (" + meta.station + ")";
        mainTxt = "“" + meta.troutFork + "”";
        subTxt = "Write even faces (2 · 4 · 6)  ·  Rolled 1d6 Bolt #" + (ps.activeRoll || meta.defaultRoll) + "  ·  Ref: " + meta.refWork;
      }

      ctx.save();
      ctx.textAlign = "left";
      ctx.font = "600 13.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = kickerCol;
      ctx.fillText(kickerTxt, 72, 574);

      ctx.font = "bold 36px Georgia, serif";
      ctx.fillStyle = headlineCol;
      ctx.fillText(mainTxt, 72, 628);

      ctx.font = "italic 17px Georgia, serif";
      ctx.fillStyle = "#565148";
      ctx.fillText(subTxt, 72, 688);

      // Minimal timeline & 1d6 bolt badge at right margin
      var badgeX = 1090, badgeY = 568;
      ctx.strokeStyle = "#cfc8b8";
      ctx.fillStyle = "#f2eee4";
      ctx.lineWidth = 1.5;
      roundedRectPath(ctx, badgeX, badgeY, 122, 66, 8);
      ctx.fill(); ctx.stroke();
      ctx.textAlign = "center";
      ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = kickerCol;
      ctx.fillText(ps.act === 2 ? "ODD · 1 3 5" : ps.act === 3 ? "EVEN · 2 4 6" : "1D6 PORT", badgeX + 61, badgeY + 24);
      ctx.font = "bold 18px Georgia, serif";
      ctx.fillStyle = "#22282a";
      ctx.fillText(ps.activeRoll ? ("Bolt #" + ps.activeRoll) : meta.station.split(" ")[0], badgeX + 61, badgeY + 50);
      ctx.restore();
    } else {
      // PAELEO Blind-Critic Mode (showCaptions === false): ZERO text labels!
      // Only a mute non-text progress rule + act color dot on the cream strip.
      var barX = 72, barW = 1136, barY = 628;
      ctx.strokeStyle = "#e2ddd0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(barX, barY);
      ctx.lineTo(barX + barW, barY);
      ctx.stroke();

      var actCol = (ps.act === 1) ? "#c88d44" : (ps.act === 2) ? "#9e3d1c" : "#1d596e";
      var progU = clamp(t / 10.0, 0, 1);
      ctx.strokeStyle = actCol;
      ctx.beginPath();
      ctx.moveTo(barX, barY);
      ctx.lineTo(barX + barW * progU, barY);
      ctx.stroke();

      ctx.fillStyle = actCol;
      ctx.beginPath();
      ctx.arc(barX + barW * progU, barY, 5.5, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  // ---------- Register Portals #01–#05 on window.PORTAL_SCENES ----------
  var DEFS = [
    {
      id: 1,
      station: "#01 · Bow",
      clue: "Giant Size 11 Rubber Boot blocking beam",
      refWork: "Monty Python (Gilliam, 1969)",
      turkeyFork: "Shipwreck, giant’s foot, or tunnel?",
      troutFork: "Boot-sole flashlight or toe-biting crab?",
      scionRule: "Silhouette (SCION 02): backlit shadow",
      defaultTool: "lamp",
      defaultRoll: 2,
      fn: renderScene01
    },
    {
      id: 2,
      station: "#02 · Galley",
      clue: "Diner window: Trout Cook with silver baster",
      refWork: "TROUTOWN Ep. 5 (Something in the Kitchen)",
      turkeyFork: "Cooking me or refueling my air?",
      troutFork: "Canned roast dinner or UFO plumber?",
      scionRule: "Double Take (Oubapo): dual prop",
      defaultTool: "lamp",
      defaultRoll: 4,
      fn: renderScene02
    },
    {
      id: 3,
      station: "#03 · Starbd",
      clue: "Room 4 chalkboard listing HOOK MONSTER",
      refWork: "TROUTOWN Ep. 2 (The School of Fish)",
      turkeyFork: "Famous guest speaker or Most Wanted?",
      troutFork: "New class pet or the Hook Monster?",
      scionRule: "Lipogram (Outypopo): washed chalk",
      defaultTool: "lamp",
      defaultRoll: 5,
      fn: renderScene03
    },
    {
      id: 4,
      station: "#04 · Belly",
      clue: "Old Bridge: Snapping Turtle on brass key",
      refWork: "Verne I.14 · Flood Pulse #11",
      turkeyFork: "Mossy boulder or rival submarine?",
      troutFork: "Key-stealing thief or brass back-scratcher?",
      scionRule: "Threshold (SCION 48): shell retreat",
      defaultTool: "ballast",
      defaultRoll: 3,
      fn: renderScene04
    },
    {
      id: 5,
      station: "#05 · Scope",
      clue: "Waterline: Raccoon hands washing tin plate",
      refWork: "Twelve Deeds #04 · Flood Pulse",
      turkeyFork: "Rescue mechanic or hubcap thief?",
      troutFork: "Bubbling dish-dryer or floating pie tin?",
      scionRule: "Split Plane (SCION 44): air / creek",
      defaultTool: "ballast",
      defaultRoll: 6,
      fn: renderScene05
    }
  ];

  for (var di = 0; di < DEFS.length; di++) {
    (function (def) {
      window.PORTAL_SCENES[def.id] = {
        id: def.id,
        station: def.station,
        clue: def.clue,
        refWork: def.refWork,
        turkeyFork: def.turkeyFork,
        troutFork: def.troutFork,
        scionRule: def.scionRule,
        defaultTool: def.defaultTool,
        render: function (ctx, W, H, t, state) {
          renderFullPortal(ctx, W, H, t, state, def, def.fn);
        }
      };
    })(DEFS[di]);
  }
})();
