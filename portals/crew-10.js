/* Crew 10 — SCION Portal Animation & Video-to-Game Module (#46–#50)
 * Handmade 2D Canvas multiplane & articulated cutout rigs (PAELEO / Oulipo + Video-to-Game)
 * Portholes:
 *   #46 · Steps   — Solid brass letters G-O-B-B-L-E as stairs (Verbal Slapstick · SCION 47)
 *   #47 · Armada  — 100 upside-down canning jars lashed together (Bricolage Armada · SCION 29)
 *   #48 · Belfry  — Flooded tin church steeple at waterline (Waterline Acoustic Split · SCION 44)
 *   #49 · Corner  — Submerged red-green stoplight & Trout Cop (Civic Law Clinamen · 40 PSI)
 *   #50 · Riffle  — Three-inch Snail Darter blocking DAM sign (Scale Reversal · SCION 33)
 */
(function () {
  "use strict";

  window.PORTAL_SCENES = window.PORTAL_SCENES || {};

  var TAU = Math.PI * 2;
  var CX = 640;
  var CY = 255;
  var R_GLASS = 185;
  var R_RIM = 232;

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
    var rr = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  // Derive deterministic or interactive state
  function resolveState(meta, rawT, state) {
    var interactive = !!state;
    var tSafe = Number.isFinite(rawT) ? Math.max(0, rawT) : 0;
    var tl = interactive ? (tSafe % 10.0) : Math.min(10.0, tSafe);
    var animT = tSafe;

    var viewMode = (state && state.view) || "auto";
    var act = 1;
    var pass = "setup";
    if (viewMode === "turkey") {
      act = 2;
      pass = "turkey";
    } else if (viewMode === "trout") {
      act = 3;
      pass = "trout";
    } else {
      if (tl < 2.0) {
        act = 1;
        pass = "setup";
      } else if (tl < 5.6) {
        act = 2;
        pass = "turkey";
      } else {
        act = 3;
        pass = "trout";
      }
    }

    var lampAmt = 0;
    if (state && typeof state.lamp === "boolean") {
      lampAmt = state.lamp ? 1 : 0;
    } else if (meta.defaultTool === "lamp") {
      lampAmt = viewMode === "turkey" || viewMode === "trout" ? 1 : smoothstep(0.94, 1.16, tl);
    }

    var ballastAmt = 0;
    if (state && typeof state.ballast === "boolean") {
      ballastAmt = state.ballast ? 1 : 0;
    } else if (meta.defaultTool === "ballast") {
      ballastAmt = viewMode === "turkey" || viewMode === "trout" ? 1 : smoothstep(0.92, 1.22, tl);
    }

    var rollVal = 0;
    var chaseBolt = 0;
    if (state && typeof state.roll === "number") {
      rollVal = Math.round(clamp(state.roll, 0, 6));
    } else if (act === 3) {
      var uRoll = viewMode === "trout" ? 1.0 : (tl - 5.95) / 0.6;
      if (uRoll >= 0 && uRoll < 1) {
        chaseBolt = (Math.floor(uRoll * 12) % 6) + 1;
      } else if (uRoll >= 1) {
        rollVal = meta.defaultRoll;
      }
    }

    var showCaptions = !(state && state.showCaptions === false);

    // Phase parameter inside active act
    var turkeyPhase = viewMode === "turkey"
      ? ((animT * 0.32) % 1.0)
      : clamp((tl - 2.0) / 3.6, 0, 1);
    var troutPhase = viewMode === "trout"
      ? ((animT * 0.28) % 1.0)
      : clamp((tl - 5.6) / 4.4, 0, 1);

    // Wing reach envelope in Act 1 (peaks around t = 0.8..1.15s so 0.8s frame shows hand on control!)
    var reachAmt = 0;
    if (!interactive || viewMode === "auto") {
      if (tl < 1.65) {
        var up = smoothstep(0.18, 0.72, tl);
        var down = 1 - smoothstep(1.18, 1.62, tl);
        reachAmt = up * down;
      }
    }

    var chartProgress = 0;
    if (viewMode === "trout") {
      chartProgress = 1;
    } else if (viewMode === "turkey") {
      chartProgress = 0.58;
    } else {
      chartProgress = clamp(tl / 7.2, 0.12, 1);
    }

    return {
      tl: tl,
      t: animT,
      act: act,
      pass: pass,
      viewMode: viewMode,
      lamp: lampAmt,
      ballast: ballastAmt,
      roll: rollVal,
      chaseBolt: chaseBolt,
      showCaptions: showCaptions,
      turkeyPhase: turkeyPhase,
      troutPhase: troutPhase,
      reachAmt: reachAmt,
      chartProgress: chartProgress,
      troutBlend: pass === "trout" ? (viewMode === "trout" ? 1 : smoothstep(5.55, 5.95, tl)) : 0
    };
  }

  // Shared 2-bone IK solver (SCION 33)
  function solveIK2(x0, y0, tx, ty, L1, L2, flip) {
    var dx = tx - x0;
    var dy = ty - y0;
    var d = Math.hypot(dx, dy) || 1e-4;
    var maxD = (L1 + L2) * 0.995;
    var minD = Math.abs(L1 - L2) + 0.5;
    var dc = clamp(d, minD, maxD);
    var cosA = clamp((L1 * L1 + dc * dc - L2 * L2) / (2 * L1 * dc), -1, 1);
    var baseAng = Math.atan2(dy, dx);
    var ang1 = baseAng + (flip ? -1 : 1) * Math.acos(cosA);
    var jx = x0 + Math.cos(ang1) * L1;
    var jy = y0 + Math.sin(ang1) * L1;
    var ex = x0 + (dx / d) * dc;
    var ey = y0 + (dy / d) * dc;
    return { jx: jx, jy: jy, ex: ex, ey: ey, ang1: ang1 };
  }

  // Reusable Articulated Spotted Brook Trout Rig
  function drawBrookTrout(ctx, opts) {
    var x = opts.x || 0;
    var y = opts.y || 0;
    var scale = opts.scale || 1;
    var dir = opts.dir === -1 ? -1 : 1; // +1 faces right, -1 faces left
    var rot = opts.rot || 0;
    var t = opts.t || 0;
    var wag = opts.wag !== undefined ? opts.wag : 1;
    var jawOpen = opts.jawOpen || 0;
    var finWave = opts.finWave || 0;
    var cop = !!opts.cop;
    var whistle = opts.whistle || 0;
    var alpha = opts.alpha !== undefined ? opts.alpha : 1;

    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(dir * scale, scale);

    var swim = Math.sin(t * 6.5) * 4.5 * wag;
    var tailFlick = Math.sin(t * 8.2 - 1.1) * 9.0 * wag;

    // Caudal (tail) fin — articulated at (-54, swim*0.6)
    ctx.save();
    ctx.translate(-52, swim * 0.5);
    ctx.rotate(tailFlick * 0.028);
    ctx.beginPath();
    ctx.moveTo(4, -5);
    ctx.quadraticCurveTo(-14, -18, -26, -20);
    ctx.quadraticCurveTo(-18, -3, -19, 0);
    ctx.quadraticCurveTo(-18, 3, -26, 20);
    ctx.quadraticCurveTo(-14, 18, 4, 5);
    ctx.closePath();
    var tailGrad = ctx.createLinearGradient(-26, 0, 4, 0);
    tailGrad.addColorStop(0, "#385b52");
    tailGrad.addColorStop(0.7, "#6c8f78");
    tailGrad.addColorStop(1, "#4e6d5b");
    ctx.fillStyle = tailGrad;
    ctx.fill();
    // White-and-black brook trout fin edge
    ctx.strokeStyle = "#f4f0e0";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-25, -19);
    ctx.lineTo(-4, -6);
    ctx.moveTo(-25, 19);
    ctx.lineTo(-4, 6);
    ctx.stroke();
    ctx.strokeStyle = "#182420";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    // Dorsal fin
    ctx.save();
    ctx.translate(-6, -18 + swim * 0.18);
    ctx.rotate(Math.sin(t * 5.2) * 0.08);
    ctx.beginPath();
    ctx.moveTo(14, 3);
    ctx.quadraticCurveTo(4, -15, -14, -12);
    ctx.quadraticCurveTo(-18, -3, -14, 4);
    ctx.closePath();
    ctx.fillStyle = "#567963";
    ctx.fill();
    ctx.strokeStyle = "#182420";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // Vermiculation ticks on dorsal
    ctx.fillStyle = "#223429";
    for (var d = -9; d <= 7; d += 5) {
      ctx.beginPath();
      ctx.arc(d, -5, 1.5, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // Pelvic & anal lower fins (white leading edge characteristic of Brook Trout)
    var drawLowerFin = function (fx, fy, fw, fh, ph) {
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(Math.sin(t * 6 + ph) * 0.14);
      ctx.beginPath();
      ctx.moveTo(6, -2);
      ctx.quadraticCurveTo(2, fh, -fw, fh * 0.85);
      ctx.quadraticCurveTo(-fw * 0.6, 0, -4, -2);
      ctx.closePath();
      ctx.fillStyle = "#c96d49";
      ctx.fill();
      ctx.strokeStyle = "#faf6e8";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(5, -1);
      ctx.quadraticCurveTo(1, fh * 0.9, -fw * 0.85, fh * 0.8);
      ctx.stroke();
      ctx.strokeStyle = "#182420";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();
    };
    drawLowerFin(-8, 16 + swim * 0.2, 14, 13, 0.5);
    drawLowerFin(-32, 11 + swim * 0.4, 12, 11, 1.4);

    // Main torpedo body
    ctx.beginPath();
    ctx.moveTo(54, 1);
    ctx.bezierCurveTo(38, -19, 2, -23 + swim * 0.2, -32, -13 + swim * 0.4);
    ctx.quadraticCurveTo(-48, -8 + swim * 0.5, -55, -4 + swim * 0.5);
    ctx.lineTo(-55, 4 + swim * 0.5);
    ctx.quadraticCurveTo(-46, 9 + swim * 0.5, -30, 14 + swim * 0.4);
    ctx.bezierCurveTo(0, 22 + swim * 0.2, 34, 19, 50, 6);
    ctx.closePath();

    var bodyGrad = ctx.createLinearGradient(0, -22, 0, 22);
    bodyGrad.addColorStop(0, "#2f5241");
    bodyGrad.addColorStop(0.42, "#5b8269");
    bodyGrad.addColorStop(0.62, "#d89a72");
    bodyGrad.addColorStop(0.84, "#e6be8a");
    bodyGrad.addColorStop(1, "#f2e6cf");
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Pinkish iridescent lateral band
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = "rgba(224, 122, 124, 0.42)";
    ctx.lineWidth = 6.5;
    ctx.beginPath();
    ctx.moveTo(35, 1);
    ctx.quadraticCurveTo(-5, 0 + swim * 0.25, -52, 0 + swim * 0.5);
    ctx.stroke();

    // Olive back vermiculations
    ctx.strokeStyle = "rgba(25, 45, 34, 0.55)";
    ctx.lineWidth = 1.6;
    for (var vx = -40; vx <= 26; vx += 8) {
      ctx.beginPath();
      ctx.moveTo(vx, -18);
      ctx.quadraticCurveTo(vx + 3, -12, vx - 2, -8);
      ctx.stroke();
    }

    // Gold & crimson spots with pale blue halos!
    var spots = [
      [-34, -2, 1], [-24, 2, 0], [-16, -4, 1], [-6, 1, 0],
      [4, -3, 1], [14, 2, 0], [22, -2, 1], [-28, -6, 0],
      [-10, 5, 1], [8, 6, 0], [-20, 4, 1]
    ];
    for (var si = 0; si < spots.length; si++) {
      var sp = spots[si];
      var sy = sp[1] + swim * 0.2 * (1 - (sp[0] + 40) / 80);
      if (sp[2] === 1) {
        ctx.fillStyle = "rgba(155, 212, 224, 0.65)";
        ctx.beginPath();
        ctx.arc(sp[0], sy, 3.1, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#c93b2b";
        ctx.beginPath();
        ctx.arc(sp[0], sy, 1.6, 0, TAU);
        ctx.fill();
      } else {
        ctx.fillStyle = "#f2cf63";
        ctx.beginPath();
        ctx.arc(sp[0], sy, 1.9, 0, TAU);
        ctx.fill();
      }
    }

    // Optional Officer Trout Cop high-visibility traffic vest (#49)
    if (cop) {
      ctx.fillStyle = "#e8c83a";
      ctx.strokeStyle = "#1d2624";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(20, -19);
      ctx.lineTo(4, -20);
      ctx.lineTo(-2, 19);
      ctx.lineTo(15, 19);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Reflective silver stripe + tiny gold shield badge
      ctx.fillStyle = "#dfe8e6";
      ctx.fillRect(3, -19, 4, 38);
      ctx.fillStyle = "#f3b938";
      ctx.beginPath();
      ctx.arc(12, -2, 4.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // Body ink outline
    ctx.strokeStyle = "#17231f";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(54, 1);
    ctx.bezierCurveTo(38, -19, 2, -23 + swim * 0.2, -32, -13 + swim * 0.4);
    ctx.quadraticCurveTo(-48, -8 + swim * 0.5, -55, -4 + swim * 0.5);
    ctx.lineTo(-55, 4 + swim * 0.5);
    ctx.quadraticCurveTo(-46, 9 + swim * 0.5, -30, 14 + swim * 0.4);
    ctx.bezierCurveTo(0, 22 + swim * 0.2, 34, 19, 50, 6);
    ctx.closePath();
    ctx.stroke();

    // Articulated Lower Jaw
    ctx.save();
    ctx.translate(36, 6);
    ctx.rotate(clamp(jawOpen, 0, 1) * 0.36);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(11, 3, 17, -1);
    ctx.quadraticCurveTo(10, 6, -1, 4);
    ctx.closePath();
    ctx.fillStyle = "#d9b48a";
    ctx.fill();
    ctx.strokeStyle = "#17231f";
    ctx.lineWidth = 1.7;
    ctx.stroke();
    ctx.restore();

    // Gill operculum arc (subtle breathing)
    var gillBreath = Math.sin(t * 4.2) * 1.2;
    ctx.strokeStyle = "#17231f";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(24 + gillBreath * 0.4, 0, 13, 0.55, -0.55, true);
    ctx.stroke();

    // Expressive Eye
    ctx.fillStyle = "#f7f2dc";
    ctx.beginPath();
    ctx.arc(38, -5, 5.2, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#17231f";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#111918";
    ctx.beginPath();
    ctx.arc(39.3, -5, 2.8, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(40.3, -6.2, 1.1, 0, TAU);
    ctx.fill();

    // Articulated Pectoral Fin (can wave / signal STOP in #49!)
    ctx.save();
    ctx.translate(21, 9);
    if (finWave > 0.01) {
      // Raised traffic-signal / wave fin!
      ctx.rotate(lerp(0.25, -1.35 + Math.sin(t * 10) * 0.18, finWave));
    } else {
      ctx.rotate(0.25 + Math.sin(t * 5.8) * 0.18);
    }
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.quadraticCurveTo(-4, 15, -17, 13);
    ctx.quadraticCurveTo(-13, 3, -3, -2);
    ctx.closePath();
    ctx.fillStyle = "#cf6e46";
    ctx.fill();
    ctx.strokeStyle = "#faf6e8";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(1, 1);
    ctx.quadraticCurveTo(-4, 14, -16, 12);
    ctx.stroke();
    ctx.strokeStyle = "#17231f";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Officer Trout Cop peaked cap + silver pea-whistle (#49)
    if (cop) {
      ctx.save();
      ctx.translate(31, -17);
      ctx.rotate(-0.12);
      // Visor
      ctx.fillStyle = "#111820";
      ctx.beginPath();
      ctx.moveTo(4, 2);
      ctx.quadraticCurveTo(18, 2, 21, 6);
      ctx.quadraticCurveTo(11, 7, 2, 4);
      ctx.closePath();
      ctx.fill();
      // Crown
      ctx.fillStyle = "#1e3256";
      ctx.strokeStyle = "#101824";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-12, 3);
      ctx.quadraticCurveTo(-14, -9, 2, -12);
      ctx.quadraticCurveTo(15, -10, 12, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Gold badge on cap
      ctx.fillStyle = "#f4c242";
      ctx.beginPath();
      ctx.arc(6, -5, 3.0, 0, TAU);
      ctx.fill();
      ctx.restore();

      // Silver pea-whistle at mouth
      ctx.save();
      ctx.translate(54, 4);
      ctx.rotate(0.15 - whistle * 0.2);
      ctx.fillStyle = "#d9e4e8";
      ctx.strokeStyle = "#182426";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.rect(-2, -2, 8, 4.5);
      ctx.arc(8, 1.5, 4.2, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // Subtle Turkey Pilot Reflection (Act 1 & 2 looking out) vs Full Lit Turkey Inside Port (Act 3 Trout looking in)
  function drawTurkeyAcrossGlass(ctx, st, curiosityTilt, startleAmt) {
    var t = st.t;
    var blink = Math.sin(t * 2.3 + 0.7) > 0.96 ? 1 : 0;

    if (st.troutBlend < 0.5) {
      // Act 1 & 2: Ghosted warm glass reflection of Turkey Pilot inside lower-left of porthole looking out
      ctx.save();
      ctx.globalAlpha = 0.34 * (1 - st.troutBlend * 2);
      ctx.translate(CX - 118, CY + 112);
      ctx.rotate(-0.08 + (curiosityTilt || 0) * 0.14 - (startleAmt || 0) * 0.16);
      ctx.translate(-(startleAmt || 0) * 10, (startleAmt || 0) * 6);

      // Feathered neck & head
      ctx.fillStyle = "#9b5536";
      ctx.beginPath();
      ctx.ellipse(-6, 26, 26, 36, -0.15, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#b86b47";
      ctx.beginPath();
      ctx.arc(0, -6, 24, 0, TAU);
      ctx.fill();

      // Red wattle & snood
      ctx.fillStyle = "#c93b2b";
      ctx.beginPath();
      ctx.ellipse(16, 10, 6, 13 + Math.sin(t * 6) * 1.5, 0.15, 0, TAU);
      ctx.fill();

      // Curved amber beak
      ctx.fillStyle = "#e6b35a";
      ctx.beginPath();
      ctx.moveTo(18, -10);
      ctx.quadraticCurveTo(38, -5, 36, 3);
      ctx.quadraticCurveTo(24, 4, 16, 1);
      ctx.closePath();
      ctx.fill();

      // Wide observant eye
      ctx.fillStyle = "#faf3dc";
      ctx.beginPath();
      ctx.arc(6, -9, 6.5, 0, TAU);
      ctx.fill();
      if (!blink) {
        ctx.fillStyle = "#1a1410";
        ctx.beginPath();
        ctx.arc(8, -9, 3.3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(9.2, -10.5, 1.3, 0, TAU);
        ctx.fill();
      } else {
        ctx.strokeStyle = "#2b1d14";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(12, -9);
        ctx.stroke();
      }
      ctx.restore();
    } else {
      // Act 3 (Trout Looks In): Warm amber-lit Turkey seen clearly behind the glass inside the bread-tin sub!
      var tb = clamp((st.troutBlend - 0.5) * 2, 0, 1);
      ctx.save();
      ctx.globalAlpha = 0.62 * tb;
      // Warm interior amber halo visible from Trout's side
      var inGlow = ctx.createRadialGradient(CX - 95, CY + 85, 8, CX - 95, CY + 85, 95);
      inGlow.addColorStop(0, "rgba(248, 186, 88, 0.55)");
      inGlow.addColorStop(1, "rgba(248, 186, 88, 0)");
      ctx.fillStyle = inGlow;
      ctx.beginPath();
      ctx.arc(CX - 95, CY + 85, 95, 0, TAU);
      ctx.fill();

      ctx.translate(CX - 104 + Math.sin(t * 1.9) * 4, CY + 98);
      ctx.rotate(0.06 + Math.sin(t * 2.5) * 0.05);

      // Feathered collar
      ctx.fillStyle = "#6d341c";
      ctx.strokeStyle = "#24120a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(-8, 30, 32, 36, -0.1, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // Head
      ctx.fillStyle = "#a6593a";
      ctx.beginPath();
      ctx.arc(0, -6, 25, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // Wattle
      ctx.fillStyle = "#cc3828";
      ctx.beginPath();
      ctx.ellipse(17, 11, 6.5, 14, 0.12, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // Beak
      ctx.fillStyle = "#eab95c";
      ctx.beginPath();
      ctx.moveTo(19, -11);
      ctx.quadraticCurveTo(41, -5, 39, 4);
      ctx.quadraticCurveTo(25, 5, 17, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Eye looking back at Trout!
      ctx.fillStyle = "#fff8e4";
      ctx.beginPath();
      ctx.arc(7, -9, 7, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#18120e";
      ctx.beginPath();
      ctx.arc(9.5, -9, 3.5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(10.8, -10.5, 1.4, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  // Volumetric Sub Headlight Beam inside Porthole
  function drawLampBeam(ctx, lampAmt, angleOffset) {
    if (lampAmt <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    var ang = -0.18 + (angleOffset || 0);
    ctx.translate(CX - 155, CY + 115);
    ctx.rotate(ang);
    var grad = ctx.createLinearGradient(0, 0, 380, -40);
    grad.addColorStop(0, "rgba(255, 222, 132, " + (0.42 * lampAmt) + ")");
    grad.addColorStop(0.55, "rgba(255, 208, 108, " + (0.22 * lampAmt) + ")");
    grad.addColorStop(1, "rgba(255, 198, 92, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(395, -145);
    ctx.lineTo(395, 95);
    ctx.lineTo(0, 18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Floating silt & caustic motes inside porthole
  function drawWaterAtmosphere(ctx, t, lampAmt, murkAmt, sightY) {
    // Top surface caustic shafts
    ctx.save();
    var cAlpha = lerp(0.10, 0.24, clamp(lampAmt * 0.5 + (1 - murkAmt) * 0.7, 0, 1));
    for (var i = 0; i < 5; i++) {
      var sx = CX - 130 + i * 64 + Math.sin(t * 0.9 + i * 1.4) * 14;
      var grad = ctx.createLinearGradient(sx, CY - 185, sx - 45, CY + 150);
      grad.addColorStop(0, "rgba(218, 248, 232, " + cAlpha + ")");
      grad.addColorStop(1, "rgba(218, 248, 232, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(sx - 18, CY - 188);
      ctx.lineTo(sx + 22, CY - 188);
      ctx.lineTo(sx - 28, CY + 160);
      ctx.lineTo(sx - 68, CY + 160);
      ctx.closePath();
      ctx.fill();
    }
    // Drifting silt motes
    for (var m = 0; m < 22; m++) {
      var mx = CX - 170 + ((hash(m * 3.1) * 340 + t * (12 + (m % 5) * 4)) % 340);
      var my = CY - 165 + ((hash(m * 7.7) * 330 + sightY * 0.5 + Math.sin(t * 1.5 + m) * 10 + 330) % 330);
      var mr = 1.1 + (m % 3) * 0.7;
      ctx.fillStyle = lampAmt > 0.3
        ? "rgba(255, 238, 182, 0.48)"
        : "rgba(195, 228, 220, 0.28)";
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, TAU);
      ctx.fill();
    }
    if (murkAmt > 0.02) {
      ctx.fillStyle = "rgba(11, 29, 31, " + (murkAmt * 0.46) + ")";
      ctx.fillRect(CX - R_GLASS - 4, CY - R_GLASS - 4, (R_GLASS + 4) * 2, (R_GLASS + 4) * 2);
    }
    ctx.restore();
  }

  // =========================================================================
  // SCENE #46 · STEPS — Solid brass letters G-O-B-B-L-E as stairs
  // =========================================================================
  function renderScene46(ctx, st) {
    var t = st.t;
    var sightY = lerp(-18, 8, st.ballast); // Ballast lowers sub into calm shelter!
    var murk = (1 - st.ballast) * (st.act === 1 ? 0.65 : 0.25) * (1 - st.lamp * 0.5);
    var turb = lerp(1.0, 0.22, st.ballast);

    // Water gradient (warmer emerald in Act 2, crystalline deep teal in Act 3)
    var wGrad = ctx.createLinearGradient(CX, CY - R_GLASS, CX, CY + R_GLASS);
    if (st.troutBlend > 0.5) {
      wGrad.addColorStop(0, "#7ad1c8");
      wGrad.addColorStop(0.35, "#2b7a78");
      wGrad.addColorStop(1, "#12383b");
    } else {
      wGrad.addColorStop(0, "#9be0c8");
      wGrad.addColorStop(0.32, "#357e75");
      wGrad.addColorStop(1, "#153d3a");
    }
    ctx.fillStyle = wGrad;
    ctx.fillRect(CX - R_GLASS - 5, CY - R_GLASS - 5, (R_GLASS + 5) * 2, (R_GLASS + 5) * 2);

    // Sunlit concentric surface ripples at top
    ctx.save();
    ctx.strokeStyle = "rgba(242, 250, 224, 0.45)";
    ctx.lineWidth = 2.2;
    for (var r = 0; r < 5; r++) {
      var rx = 38 + r * 26 + Math.sin(t * 2.2 + r) * 5;
      ctx.beginPath();
      ctx.ellipse(CX + 52, CY - 156 + sightY * 0.35, rx, 7 + r * 2.4, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    drawWaterAtmosphere(ctx, t, st.lamp, 0, sightY);

    // Far left rocky wall & right mossy limestone stair-bank (multiplane parallax)
    ctx.save();
    ctx.translate(0, sightY * 0.6);
    ctx.fillStyle = "#1b4a46";
    ctx.strokeStyle = "#0e2624";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CX - 190, CY + 20);
    ctx.lineTo(CX - 152, CY + 42);
    ctx.lineTo(CX - 120, CY + 115);
    ctx.lineTo(CX - 190, CY + 190);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Brass Letters G-O-B-B-L-E Staircase (Midplane)
    var letters = ["G", "O", "B", "B", "L", "E"];
    var stepBaseX = CX - 92;
    var stepBaseY = CY + 128 + sightY;

    // Act 2 choreography:
    // u in [0, 0.42]: G, O, B sink downward slightly like heavy lead weights with silt puffs!
    // u in [0.38, 1.0]: Two energetic creek minnows hop step-by-step up G->O->B->B->L->E ringing brass waveforms!
    var u2 = st.turkeyPhase;
    var u3 = st.troutPhase;

    for (var i = 0; i < 6; i++) {
      var lx = stepBaseX + i * 33 + Math.sin(t * 5 + i) * 1.2 * turb;
      var ly = stepBaseY - i * 39;

      // Sinking weight offset in early Act 2
      var sink = 0;
      if (st.pass === "turkey" && i < 3) {
        var sWindow = smoothstep(i * 0.08, i * 0.08 + 0.14, u2) * (1 - smoothstep(0.42, 0.58, u2));
        sink = sWindow * (14 - i * 2.5);
      }

      // Step-hop spring compression when minnow lands on step i in Act 2 (peaks right around t=4.0s -> u2=0.55 on B/B/L!)
      var hopTime = 0.34 + i * 0.10;
      var hopHit = st.pass === "turkey"
        ? Math.exp(-Math.pow((u2 - hopTime) / 0.055, 2))
        : 0;

      // Act 3 ("Free brass staircase or falling sign?"):
      // Top letter 'E' (i===5) tips forward on a brass hinge pin around u3 = 0.45..0.95 (visible at 9.2s -> u3=0.82!)
      var tipAngle = 0;
      if (st.pass === "trout") {
        if (i === 5) {
          var tipIn = smoothstep(0.38, 0.58, u3);
          var wobble = Math.sin((u3 - 0.58) * 18) * Math.exp(-Math.max(0, u3 - 0.58) * 3.5) * 0.16;
          tipAngle = tipIn * 0.58 + (u3 > 0.58 ? wobble : 0);
        } else if (i >= 2) {
          // Trout stepping down E->L->B->B early in Act 3 (6.8s -> u3=0.27)
          var troutStep = 0.08 + (5 - i) * 0.09;
          hopHit = Math.exp(-Math.pow((u3 - troutStep) / 0.06, 2)) * 0.85;
        }
      }

      var curY = ly + sink + hopHit * 6;

      // Solid brass step riser block beneath each letter
      ctx.save();
      ctx.fillStyle = "#8a6829";
      ctx.strokeStyle = "#231a08";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(lx - 22, curY, 56, 46);
      ctx.fill();
      ctx.stroke();
      // Top bevel plane of step
      ctx.fillStyle = "#d6ad52";
      ctx.beginPath();
      ctx.moveTo(lx - 22, curY);
      ctx.lineTo(lx - 8, curY - 10);
      ctx.lineTo(lx + 48, curY - 10);
      ctx.lineTo(lx + 34, curY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Silt puff ring when sinking as lead weight
      if (sink > 3) {
        ctx.fillStyle = "rgba(196, 182, 138, 0.48)";
        ctx.beginPath();
        ctx.ellipse(lx + 4, curY + 34, 24 + sink, 6, 0, 0, TAU);
        ctx.fill();
      }

      // 3D Extruded Solid Brass Letter
      ctx.translate(lx + 6, curY - 2);
      ctx.rotate(tipAngle);

      // Hinge bracket on 'E' when tipping like a falling sign
      if (i === 5 && tipAngle > 0.05) {
        ctx.strokeStyle = "#3a2a10";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-14, -42);
        ctx.lineTo(-22, -48);
        ctx.stroke();
      }

      ctx.font = "900 46px Georgia, 'Times New Roman', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      // 3D brass side extrusion
      ctx.fillStyle = "#6e4f19";
      for (var ex = 7; ex >= 1; ex--) {
        ctx.fillText(letters[i], ex, -ex * 0.45);
      }
      // Front polished brass face
      var bGrad = ctx.createLinearGradient(-16, -42, 16, 0);
      bGrad.addColorStop(0, hopHit > 0.25 ? "#fff4b8" : "#f5d77f");
      bGrad.addColorStop(0.5, "#d4a441");
      bGrad.addColorStop(1, "#9a7022");
      ctx.fillStyle = bGrad;
      ctx.fillText(letters[i], 0, 0);
      ctx.strokeStyle = "#241907";
      ctx.lineWidth = 2.0;
      ctx.strokeText(letters[i], 0, 0);

      // SCION 47 Sound-to-Action brass chime ring when struck!
      if (hopHit > 0.15) {
        ctx.strokeStyle = "rgba(255, 238, 148, " + (hopHit * 0.85) + ")";
        ctx.lineWidth = 2.4;
        var rr = 22 + (1 - hopHit) * 26;
        ctx.beginPath();
        ctx.arc(0, -20, rr, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Foreground right mossy limestone ledge overlapping stair base
    ctx.save();
    ctx.translate(0, sightY * 1.15);
    ctx.fillStyle = "#1f4d44";
    ctx.strokeStyle = "#0e2420";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(CX - 35, CY + 195);
    ctx.lineTo(CX + 45, CY + 108);
    ctx.lineTo(CX + 130, CY + 24);
    ctx.lineTo(CX + 195, CY - 55);
    ctx.lineTo(CX + 195, CY + 195);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Bright olive moss clumps along rock ledges
    ctx.fillStyle = "#5b8c42";
    var mossPts = [[18, 128], [62, 86], [108, 42], [148, -6], [85, 132]];
    for (var mp = 0; mp < mossPts.length; mp++) {
      ctx.beginPath();
      ctx.ellipse(CX + mossPts[mp][0], CY + mossPts[mp][1], 24, 9, -0.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // Act 2: Two energetic small trout climbing the G-O-B-B-L-E step-ladder!
    if (st.pass !== "trout") {
      var climbProgress = st.pass === "turkey" ? clamp((u2 - 0.26) / 0.62, 0, 1) : 0.05;
      for (var f = 0; f < 2; f++) {
        var fp = clamp(climbProgress * 5.2 - f * 1.35, 0, 5);
        var idx = Math.floor(fp);
        var frac = fp - idx;
        var arc = Math.sin(frac * Math.PI) * 24;
        var fx = stepBaseX + lerp(idx, Math.min(5, idx + 1), frac) * 33 - 18;
        var fy = stepBaseY - lerp(idx, Math.min(5, idx + 1), frac) * 39 - 34 - arc;
        drawBrookTrout(ctx, {
          x: fx, y: fy, scale: 0.56, dir: 1,
          rot: -0.42 + Math.cos(frac * Math.PI) * 0.22,
          t: t + f * 1.3, wag: 1.35
        });
      }
    } else {
      // Act 3: Hero Spotted Brook Trout glides down the brass staircase (6.8s) and greets Turkey at the glass (9.2s)!
      var tx, ty, trot, tdir, tscale;
      if (u3 < 0.52) {
        var du = u3 / 0.52;
        tx = lerp(CX + 78, CX - 10, du);
        ty = lerp(CY - 62, CY + 48, du) + Math.sin(du * Math.PI * 3) * 8 + sightY;
        trot = 0.28;
        tdir = -1;
        tscale = lerp(0.85, 1.12, du);
      } else {
        var hu = smoothstep(0.52, 0.85, u3);
        tx = lerp(CX - 10, CX - 22, hu) + Math.sin(t * 2.1) * 5;
        ty = lerp(CY + 48, CY + 62, hu) + Math.cos(t * 1.8) * 4 + sightY;
        trot = lerp(0.18, -0.06, hu);
        tdir = -1;
        tscale = 1.18;
      }
      drawBrookTrout(ctx, {
        x: tx, y: ty, scale: tscale, dir: tdir, rot: trot,
        t: t, wag: 1.0, jawOpen: 0.25 + Math.sin(t * 4) * 0.2
      });
    }

    drawLampBeam(ctx, st.lamp, -0.1);
    drawWaterAtmosphere(ctx, t, st.lamp, murk, sightY);
    drawTurkeyAcrossGlass(ctx, st, st.pass === "turkey" ? Math.sin(u2 * TAU) : 0, 0);
  }

  // =========================================================================
  // SCENE #47 · ARMADA — 100 upside-down canning jars lashed together
  // =========================================================================
  function drawCanningJar(ctx, jx, jy, jw, jh, rot, airFill, litAmt, pickleMode, bubblePhase, t) {
    ctx.save();
    ctx.translate(jx, jy);
    ctx.rotate(rot);

    // Inverted Mason Jar: rounded shoulder at top, threaded zinc collar at bottom!
    ctx.beginPath();
    ctx.moveTo(-jw * 0.36, jh * 0.5);
    ctx.lineTo(-jw * 0.48, jh * 0.32);
    ctx.lineTo(-jw * 0.48, -jh * 0.32);
    ctx.quadraticCurveTo(-jw * 0.48, -jh * 0.5, 0, -jh * 0.5);
    ctx.quadraticCurveTo(jw * 0.48, -jh * 0.5, jw * 0.48, -jh * 0.32);
    ctx.lineTo(jw * 0.48, jh * 0.32);
    ctx.lineTo(jw * 0.36, jh * 0.5);
    ctx.closePath();

    var gGrad = ctx.createLinearGradient(-jw * 0.5, 0, jw * 0.5, 0);
    var gl = clamp(0.35 + litAmt * 0.65, 0, 1);
    gGrad.addColorStop(0, "rgba(116, 198, 192, " + (0.55 * gl + 0.2) + ")");
    gGrad.addColorStop(0.5, "rgba(182, 238, 228, " + (0.42 * gl + 0.16) + ")");
    gGrad.addColorStop(1, "rgba(82, 162, 158, " + (0.62 * gl + 0.22) + ")");
    ctx.fillStyle = gGrad;
    ctx.fill();

    // Optional Pickling-Jar Factory contents (Act 2 first beat!)
    if (pickleMode > 0.05) {
      ctx.save();
      ctx.globalAlpha = pickleMode * 0.85;
      ctx.fillStyle = "#6a9e3b";
      ctx.strokeStyle = "#233b12";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(-jw * 0.1, jh * 0.04, jw * 0.15, jh * 0.24, 0.25 + Math.sin(t * 2.5) * 0.1, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#d95032";
      ctx.beginPath();
      ctx.arc(jw * 0.16, jh * 0.12, jw * 0.09, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // Trapped glowing silver-white Air-Pocket meniscus in upper dome of inverted jar!
    if (airFill > 0.05) {
      var ay = -jh * 0.42 + (1 - airFill) * jh * 0.14;
      var slosh = Math.sin(t * 3.4 + bubblePhase) * 2.5;
      var aGrad = ctx.createRadialGradient(0, ay, 2, 0, ay, jw * 0.45);
      aGrad.addColorStop(0, litAmt > 0.3 ? "#fffdf0" : "#d8f0ec");
      aGrad.addColorStop(1, "rgba(186, 236, 232, 0.65)");
      ctx.fillStyle = aGrad;
      ctx.beginPath();
      ctx.ellipse(0, ay, jw * 0.38, jh * 0.17 * airFill, slosh * 0.03, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }

    // Specular glass highlight streak
    ctx.strokeStyle = "rgba(255, 252, 236, " + (0.28 + litAmt * 0.5) + ")";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-jw * 0.34, -jh * 0.32);
    ctx.lineTo(-jw * 0.34, jh * 0.25);
    ctx.stroke();

    // Jar outline
    ctx.strokeStyle = "#153230";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-jw * 0.36, jh * 0.5);
    ctx.lineTo(-jw * 0.48, jh * 0.32);
    ctx.lineTo(-jw * 0.48, -jh * 0.32);
    ctx.quadraticCurveTo(-jw * 0.48, -jh * 0.5, 0, -jh * 0.5);
    ctx.quadraticCurveTo(jw * 0.48, -jh * 0.5, jw * 0.48, -jh * 0.32);
    ctx.lineTo(jw * 0.48, jh * 0.32);
    ctx.lineTo(jw * 0.36, jh * 0.5);
    ctx.closePath();
    ctx.stroke();

    // Threaded zinc mouth collar at bottom
    ctx.fillStyle = "#8a9e9a";
    ctx.strokeStyle = "#1c2b29";
    ctx.lineWidth = 1.6;
    ctx.fillRect(-jw * 0.37, jh * 0.36, jw * 0.74, jh * 0.15);
    ctx.strokeRect(-jw * 0.37, jh * 0.36, jw * 0.74, jh * 0.15);
    ctx.beginPath();
    ctx.moveTo(-jw * 0.36, jh * 0.43);
    ctx.lineTo(jw * 0.36, jh * 0.43);
    ctx.stroke();

    ctx.restore();
  }

  function renderScene47(ctx, st) {
    var t = st.t;
    var sightY = lerp(0, 20, st.ballast);
    var lit = st.lamp;
    var murk = (1 - lit) * (st.troutBlend > 0.5 ? 0.18 : 0.62);

    var wGrad = ctx.createLinearGradient(CX, CY - R_GLASS, CX, CY + R_GLASS);
    wGrad.addColorStop(0, lit > 0.4 ? "#8adbc8" : "#3a6e69");
    wGrad.addColorStop(0.45, lit > 0.4 ? "#236865" : "#183e3e");
    wGrad.addColorStop(1, "#0d2527");
    ctx.fillStyle = wGrad;
    ctx.fillRect(CX - R_GLASS - 5, CY - R_GLASS - 5, (R_GLASS + 5) * 2, (R_GLASS + 5) * 2);

    drawWaterAtmosphere(ctx, t, lit, 0, sightY);

    var u2 = st.turkeyPhase;
    var u3 = st.troutPhase;

    // Raft buoyancy lift when air-pocket bubbles surge in Act 2 (around t=4.0s -> u2=0.55!)
    var raftLift = 0;
    if (st.pass === "turkey") {
      raftLift = -smoothstep(0.36, 0.75, u2) * 16;
    } else if (st.pass === "trout") {
      raftLift = -10 + Math.sin(t * 1.9) * 5;
    }
    var armadaY = CY - 28 + Math.sin(t * 1.7) * 5 + raftLift + sightY * 0.85;

    // Overhead taut mooring ropes converging to surface raft anchor
    ctx.save();
    ctx.strokeStyle = "#8f6f40";
    ctx.lineWidth = 2.6;
    var ropeAnchors = [-115, -68, -22, 24, 72, 118];
    for (var ra = 0; ra < ropeAnchors.length; ra++) {
      ctx.beginPath();
      ctx.moveTo(CX + ropeAnchors[ra] * 0.28, CY - 195);
      ctx.lineTo(CX + ropeAnchors[ra], armadaY - 22);
      ctx.stroke();
    }
    ctx.restore();

    // Far-tier small silhouettes of "100 jars" (32 background jars for genuine armada scale!)
    for (var bj = 0; bj < 26; bj++) {
      var bx = CX - 148 + (bj % 13) * 24 + (Math.floor(bj / 13) * 11);
      var by = armadaY + 14 + Math.floor(bj / 13) * 24 + Math.sin(bj * 1.7 + t * 2) * 2.5;
      var distCenter = Math.abs(bx - CX) / 155;
      if (distCenter < 0.96) {
        drawCanningJar(ctx, bx, by, 20, 32, (bx - CX) * 0.0012, 0.7, lit * 0.65, 0, bj, t);
      }
    }

    // Mid-tier 11 jars
    for (var mj = 0; mj < 9; mj++) {
      var mx = CX - 136 + mj * 34;
      var arcY = Math.pow((mj - 4) / 4, 2) * 18;
      var my = armadaY - 4 + arcY + Math.sin(t * 2.3 + mj) * 3;
      drawCanningJar(ctx, mx, my, 30, 48, (mj - 4) * 0.055, 0.85, lit * 0.85, 0, mj * 2, t);
    }

    // Act 2 pickle-jar vs air-pocket raft states
    var pickleAmt = st.pass === "turkey"
      ? smoothstep(0.05, 0.22, u2) * (1 - smoothstep(0.55, 0.78, u2))
      : 0;
    var gulpAir = st.pass === "turkey" ? smoothstep(0.35, 0.68, u2) : 0;

    // Hero foreground 5 large upside-down Mason jars
    var heroJars = [
      { dx: -102, dy: 2, w: 40, h: 66, r: 0.22, p: 1 },
      { dx: -52, dy: -16, w: 46, h: 78, r: 0.10, p: 1 },
      { dx: 2, dy: -22, w: 50, h: 84, r: -0.02, p: 0 },
      { dx: 56, dy: -14, w: 46, h: 76, r: -0.12, p: 0 },
      { dx: 106, dy: 6, w: 38, h: 64, r: -0.24, p: 1 }
    ];
    for (var hj = 0; hj < heroJars.length; hj++) {
      var j = heroJars[hj];
      var airAmt = hj === 2 ? (1.0 - gulpAir * 0.35) : 0.92;
      drawCanningJar(
        ctx,
        CX + j.dx,
        armadaY + j.dy + Math.sin(t * 2.1 + hj) * 3,
        j.w, j.h, j.r + Math.sin(t * 1.6 + hj) * 0.03,
        airAmt, lit, j.p ? pickleAmt : 0, hj * 1.9, t
      );
    }

    // Lashed hemp rope cat's-cradle netting & knots over foreground jars!
    ctx.save();
    ctx.strokeStyle = "#a9834b";
    ctx.lineWidth = 3.2;
    for (var nr = 0; nr < 3; nr++) {
      var ny = armadaY - 6 + nr * 18;
      ctx.beginPath();
      ctx.moveTo(CX - 142, ny + 8);
      for (var nx = -110; nx <= 115; nx += 45) {
        ctx.quadraticCurveTo(CX + nx, ny + ((nx + nr * 45) % 90 === 0 ? 14 : -10), CX + nx + 22, ny + 2);
      }
      ctx.lineTo(CX + 142, ny + 8);
      ctx.stroke();
    }
    // Rope knots
    ctx.fillStyle = "#c79e5e";
    ctx.strokeStyle = "#2b1d0c";
    ctx.lineWidth = 1.6;
    for (var kx = -95; kx <= 100; kx += 48) {
      ctx.beginPath();
      ctx.arc(CX + kx, armadaY + 8 + Math.sin(kx) * 6, 4.8, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // Rising pearl-stream of air bubbles when air-pocket is tapped (t=4.0s in Act 2!)
    var bubbleIntensity = st.pass === "turkey" ? smoothstep(0.30, 0.45, u2) : 0.45;
    if (bubbleIntensity > 0.05) {
      ctx.save();
      for (var bb = 0; bb < 14; bb++) {
        var prog = ((t * 0.9 + bb * 0.13) % 1.0);
        var bbx = CX + 2 + Math.sin(prog * 12 + bb) * 14;
        var bby = lerp(armadaY + 28, CY - 185, prog);
        ctx.fillStyle = "rgba(235, 252, 248, " + (0.65 * (1 - prog) * bubbleIntensity) + ")";
        ctx.strokeStyle = "rgba(255, 255, 255, " + (0.8 * (1 - prog) * bubbleIntensity) + ")";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(bbx, bby, 2.5 + (bb % 3) * 1.6, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // Riverbed mossy rocks at bottom
    ctx.save();
    ctx.translate(0, sightY * 1.2);
    ctx.fillStyle = "#193d37";
    ctx.strokeStyle = "#0b1e1b";
    ctx.lineWidth = 2;
    var rocks = [[-130, 165, 58, 28], [-45, 178, 64, 24], [48, 170, 72, 30], [132, 156, 56, 32]];
    for (var rk = 0; rk < rocks.length; rk++) {
      ctx.beginPath();
      ctx.ellipse(CX + rocks[rk][0], CY + rocks[rk][1], rocks[rk][2], rocks[rk][3], 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // Characters:
    if (st.pass !== "trout") {
      // Act 2: Creek scout trout rising into the central air-pocket jar to breathe/test buoyancy!
      var sipU = st.pass === "turkey" ? smoothstep(0.28, 0.56, u2) * (1 - smoothstep(0.75, 0.95, u2)) : 0;
      drawBrookTrout(ctx, {
        x: CX - 38 + sipU * 34,
        y: CY + 82 - sipU * 76 + sightY,
        scale: 0.72, dir: 1,
        rot: lerp(-0.15, -0.62, sipU),
        t: t, wag: 1.15, jawOpen: sipU * 0.7
      });
    } else {
      // Act 3 ("Bottle-cap opener or trade skiff?"):
      // Spotted Brook Trout tows a mini lashed trade-jar skiff toward the right-hand brass latch (6.8s)
      // then moors taut center-right facing Turkey across the glass (9.2s)!
      var approachLatch = smoothstep(0.05, 0.36, u3) * (1 - smoothstep(0.54, 0.76, u3));
      var settleInspect = smoothstep(0.56, 0.85, u3);
      var tx = lerp(CX + 12, CX + 82, approachLatch) + settleInspect * 16;
      var ty = lerp(CY + 66, CY + 12, approachLatch) - settleInspect * 4 + sightY;

      // Towed mini trade-jar bundle on hemp bridle!
      var jx = settleInspect > 0.5 ? tx + 54 : tx - 68;
      var jy = ty - 34 + Math.sin(t * 3) * 4;
      ctx.strokeStyle = "#b89054";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(tx, ty - 6);
      ctx.quadraticCurveTo((tx + jx) * 0.5, ty - 16, jx, jy + 14);
      ctx.stroke();
      drawCanningJar(ctx, jx, jy, 28, 44, 0.22 - approachLatch * 0.35, 0.9, 0.9, 0, 5, t);

      // Metallic spark/tap ring when testing jar cap against right-side porthole latch around 6.8s!
      if (approachLatch > 0.65) {
        ctx.strokeStyle = "rgba(255, 224, 122, " + ((approachLatch - 0.65) * 2.5) + ")";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(CX + 148, CY + 2, 16 + Math.sin(t * 18) * 4, 0, TAU);
        ctx.stroke();
      }

      drawBrookTrout(ctx, {
        x: tx, y: ty, scale: lerp(0.95, 1.15, settleInspect),
        dir: settleInspect > 0.5 ? -1 : 1,
        rot: settleInspect > 0.5 ? -0.08 : -0.18 * approachLatch,
        t: t, wag: 1.05, jawOpen: 0.22
      });
    }

    drawLampBeam(ctx, lit, -0.22 + Math.sin(t * 0.9) * 0.08);
    drawWaterAtmosphere(ctx, t, lit, murk, sightY);
    drawTurkeyAcrossGlass(ctx, st, st.pass === "turkey" ? 0.4 : 0, pickleAmt * 0.5);
  }

  // =========================================================================
  // SCENE #48 · BELFRY — Flooded tin church steeple at waterline (SCION 44)
  // =========================================================================
  function renderScene48(ctx, st) {
    var t = st.t;
    var u2 = st.turkeyPhase;
    var u3 = st.troutPhase;

    // Ballast brings sub from high choppy trim down to balanced split-plane waterline!
    var waterY = CY - 4 + lerp(36, 0, st.ballast) + Math.sin(t * 2.1) * lerp(8, 2.5, st.ballast);

    // 1. UPPER AIR PLANE (Sky + Autumn TVA Old Butler Ridges + Tin Steeple Roof + Weathervane)
    var skyGrad = ctx.createLinearGradient(CX, CY - R_GLASS, CX, waterY);
    var stormFlash = (st.pass === "turkey" && u2 > 0.44 && u2 < 0.68)
      ? Math.exp(-Math.pow((u2 - 0.55) / 0.06, 2)) // Peaks right at t=4.0s!
      : 0;
    skyGrad.addColorStop(0, stormFlash > 0.2 ? "#dceeff" : "#8ec5e2");
    skyGrad.addColorStop(1, "#e8dec4");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(CX - R_GLASS - 5, CY - R_GLASS - 5, (R_GLASS + 5) * 2, waterY - (CY - R_GLASS - 5) + 12);

    // Multiplane autumn Appalachian tree-line ridges (SCION 44 parallax!)
    var pxShift = Math.sin(t * 0.65) * 10 + st.troutBlend * 14;
    ctx.save();
    ctx.fillStyle = "#d98234";
    ctx.strokeStyle = "#4a280d";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(CX - 200, waterY + 6);
    for (var tx = -195; tx <= 200; tx += 22) {
      var th = Math.abs(tx) > 52 ? (28 + Math.sin(tx * 0.11) * 16 + Math.abs(tx) * 0.22) : 8;
      ctx.arc(CX + tx + pxShift * 0.35, waterY - th, 18, Math.PI, 0, false);
    }
    ctx.lineTo(CX + 200, waterY + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. LOWER CREEK PLANE (Emerald Reservoir Water)
    var subGrad = ctx.createLinearGradient(CX, waterY, CX, CY + R_GLASS);
    subGrad.addColorStop(0, "#4eb6a6");
    subGrad.addColorStop(0.35, "#23736d");
    subGrad.addColorStop(1, "#0f3334");
    ctx.fillStyle = subGrad;
    ctx.fillRect(CX - R_GLASS - 5, waterY, (R_GLASS + 5) * 2, CY + R_GLASS - waterY + 10);

    // 3. FLOODED CHURCH STEEPLE & SUBMERGED BELFRY (spanning across waterline!)
    var steepleX = CX + pxShift * 0.6;
    var baseY = waterY + 136;

    // Underwater white-clapboard belfry housing & arch
    ctx.save();
    ctx.fillStyle = "#b8d9d2";
    ctx.strokeStyle = "#163330";
    ctx.lineWidth = 2.2;
    // Eave skirt just under waterline
    ctx.beginPath();
    ctx.moveTo(steepleX - 96, waterY + 26);
    ctx.lineTo(steepleX - 72, waterY - 2);
    ctx.lineTo(steepleX + 72, waterY - 2);
    ctx.lineTo(steepleX + 96, waterY + 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Belfry pillars & base sill
    ctx.fillStyle = "#cde6df";
    ctx.fillRect(steepleX - 72, waterY + 22, 144, 106);
    ctx.strokeRect(steepleX - 72, waterY + 22, 144, 106);
    // Clapboard siding lines
    ctx.strokeStyle = "rgba(22, 51, 48, 0.38)";
    ctx.lineWidth = 1.2;
    for (var cyLine = waterY + 32; cyLine < waterY + 124; cyLine += 9) {
      ctx.beginPath();
      ctx.moveTo(steepleX - 71, cyLine);
      ctx.lineTo(steepleX + 71, cyLine);
      ctx.stroke();
    }

    // Dark interior belfry arch cutout
    ctx.fillStyle = "#143c3a";
    ctx.strokeStyle = "#163330";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(steepleX - 46, waterY + 122);
    ctx.lineTo(steepleX - 46, waterY + 68);
    ctx.arc(steepleX, waterY + 68, 46, Math.PI, 0, false);
    ctx.lineTo(steepleX + 46, waterY + 122);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#9ec4bc";
    ctx.fillRect(steepleX - 80, baseY - 10, 160, 12);
    ctx.strokeRect(steepleX - 80, baseY - 10, 160, 12);

    // Swinging Cast-Bronze Bell + Articulated Clapper inside Belfry!
    var bellHit = st.pass === "trout" ? smoothstep(0.18, 0.26, u3) : 0;
    var bellSwing = bellHit > 0
      ? Math.sin((u3 - 0.20) * 15.0) * 0.42 * Math.exp(-Math.max(0, u3 - 0.24) * 1.4)
      : Math.sin(t * 1.8) * 0.06;
    ctx.save();
    ctx.translate(steepleX, waterY + 34);
    ctx.rotate(bellSwing);
    // Bell body
    var bellGrad = ctx.createLinearGradient(-24, 0, 24, 0);
    bellGrad.addColorStop(0, "#3b4f4a");
    bellGrad.addColorStop(0.45, "#8fa896");
    bellGrad.addColorStop(1, "#273835");
    ctx.fillStyle = bellGrad;
    ctx.strokeStyle = "#10211f";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.quadraticCurveTo(-18, 12, -20, 34);
    ctx.quadraticCurveTo(-24, 44, -29, 48);
    ctx.lineTo(29, 48);
    ctx.quadraticCurveTo(24, 44, 20, 34);
    ctx.quadraticCurveTo(18, 12, 8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Separate hinged clapper (lags behind bell swing!)
    ctx.save();
    ctx.translate(0, 42);
    ctx.rotate(bellSwing * 0.55 + Math.sin(t * 9) * 0.08 * bellHit);
    ctx.fillStyle = "#1b2826";
    ctx.beginPath();
    ctx.arc(0, 11, 5.5, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();

    // Underwater acoustic rings radiating from struck bell in Act 3 (visible at 6.8s & 9.2s!)
    if (bellHit > 0.1) {
      for (var ar = 0; ar < 3; ar++) {
        var ap = ((u3 * 2.4 + ar * 0.33) % 1.0);
        ctx.strokeStyle = "rgba(244, 226, 146, " + ((1 - ap) * 0.65) + ")";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(steepleX, waterY + 76, 18 + ap * 115, 0, TAU);
        ctx.stroke();
      }
    }

    // Above-water Galvanized Tin Steeple Roof
    var tinGrad = ctx.createLinearGradient(steepleX - 62, 0, steepleX + 62, 0);
    tinGrad.addColorStop(0, "#cbd6d8");
    tinGrad.addColorStop(0.45, "#f5f8f7");
    tinGrad.addColorStop(1, "#8ea1a5");
    ctx.fillStyle = tinGrad;
    ctx.strokeStyle = "#1d2c2e";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(steepleX - 66, waterY);
    ctx.lineTo(steepleX, waterY - 112);
    ctx.lineTo(steepleX + 66, waterY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Standing-seam tin ribs
    ctx.strokeStyle = "rgba(35, 55, 58, 0.55)";
    ctx.lineWidth = 1.4;
    for (var sr = -48; sr <= 48; sr += 16) {
      ctx.beginPath();
      ctx.moveTo(steepleX + sr, waterY);
      ctx.lineTo(steepleX + sr * 0.12, waterY - 106);
      ctx.stroke();
    }

    // Act 2 ("Dry roosting roof or lightning rod?"):
    // 1) Roosting feather resting on dry tin eave (2.1–4.5s)
    if (st.pass === "turkey" && u2 < 0.72) {
      ctx.save();
      ctx.translate(steepleX - 34, waterY - 38 - Math.max(0, stormFlash) * 14);
      ctx.rotate(-0.4 + stormFlash * 0.8);
      ctx.fillStyle = "#9e4d28";
      ctx.strokeStyle = "#2b1408";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 4.5, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Articulated Wrought-Iron Weathervane atop Steeple (spins in storm at 4.0s & bell resonance in Act 3!)
    var vaneY = waterY - 112;
    var vaneSpin = 1.0;
    if (st.pass === "turkey") {
      vaneSpin = Math.cos(u2 * 10.0);
    } else if (st.pass === "trout") {
      vaneSpin = Math.cos(u3 * 9.5 + 0.6); // Flips direction cleanly between 6.8s and 9.2s!
    }
    ctx.strokeStyle = "#182426";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(steepleX, vaneY);
    ctx.lineTo(steepleX, vaneY - 46);
    ctx.stroke();
    // N-S-E-W crossbars
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(steepleX - 16, vaneY - 20);
    ctx.lineTo(steepleX + 16, vaneY - 20);
    ctx.stroke();
    // Spinning iron arrow!
    var arrowSpan = 28 * vaneSpin;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(steepleX - arrowSpan, vaneY - 36);
    ctx.lineTo(steepleX + arrowSpan, vaneY - 36);
    ctx.stroke();
    ctx.fillStyle = "#182426";
    ctx.beginPath();
    ctx.moveTo(steepleX + arrowSpan, vaneY - 36);
    ctx.lineTo(steepleX + arrowSpan * 0.65, vaneY - 41);
    ctx.lineTo(steepleX + arrowSpan * 0.65, vaneY - 31);
    ctx.closePath();
    ctx.fill();

    // Lightning-rod crackle arc at t = 4.0s (u2 ~ 0.55)!
    if (stormFlash > 0.12) {
      ctx.save();
      ctx.strokeStyle = "rgba(235, 250, 255, " + clamp(stormFlash * 1.2, 0, 1) + ")";
      ctx.shadowColor = "#7ad8ff";
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(steepleX + 38, CY - 190);
      ctx.lineTo(steepleX + 14, vaneY - 62);
      ctx.lineTo(steepleX + 24, vaneY - 54);
      ctx.lineTo(steepleX, vaneY - 46);
      // Grounding spark running down copper lightning wire into water!
      ctx.lineTo(steepleX + 34, waterY - 54);
      ctx.lineTo(steepleX + 66, waterY);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // 4. LIVING REFRACTIVE WATERLINE MENISCUS RIBBON
    var rippleAmp = lerp(5.5, 2.8, st.ballast) + bellHit * 4.5;
    ctx.save();
    ctx.fillStyle = "rgba(224, 248, 242, 0.72)";
    ctx.strokeStyle = "#153b38";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    for (var wx = CX - 195; wx <= CX + 195; wx += 12) {
      var wy = waterY + Math.sin(wx * 0.045 + t * 3.8) * rippleAmp;
      if (wx === CX - 195) ctx.moveTo(wx, wy - 4);
      else ctx.lineTo(wx, wy - 4);
    }
    for (var wx2 = CX + 195; wx2 >= CX - 195; wx2 -= 12) {
      var wy2 = waterY + Math.sin(wx2 * 0.045 + t * 3.8 + 0.6) * rippleAmp;
      ctx.lineTo(wx2, wy2 + 5);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 5. CHARACTER ACTING (Brook Trout ringing the submerged bell in Act 3 & inspecting porthole!)
    if (st.pass === "trout") {
      var tx, ty, tdir, trot;
      if (u3 < 0.45) {
        // Swims through belfry arch & tail-strikes the bronze bell clapper (6.8s -> u3=0.27)!
        var bu = u3 / 0.45;
        tx = steepleX + lerp(-48, 56, bu);
        ty = waterY + 86 + Math.sin(bu * Math.PI) * -8;
        tdir = 1;
        trot = -0.05;
      } else {
        // Turns & swims forward to inspect the round brass porthole (9.2s -> u3=0.82)!
        var pu = smoothstep(0.45, 0.85, u3);
        tx = steepleX + lerp(56, -18, pu);
        ty = waterY + lerp(86, 108, pu) + Math.sin(t * 2.2) * 4;
        tdir = -1;
        trot = -0.12;
      }
      drawBrookTrout(ctx, {
        x: tx, y: ty, scale: u3 > 0.45 ? 1.14 : 0.96,
        dir: tdir, rot: trot, t: t, wag: 1.2, jawOpen: 0.25
      });
    } else {
      // Distant circling trout silhouette in deep belfry background
      drawBrookTrout(ctx, {
        x: steepleX + 78 + Math.sin(t * 1.1) * 24,
        y: waterY + 94, scale: 0.62, dir: 1, rot: 0, t: t, wag: 0.8, alpha: 0.72
      });
    }

    drawLampBeam(ctx, st.lamp, 0.05);
    var murk = (1 - st.ballast) * (st.act === 1 ? 0.48 : 0.12);
    drawWaterAtmosphere(ctx, t, st.lamp, murk, 0);
    drawTurkeyAcrossGlass(ctx, st, -0.25, stormFlash * 0.9);
  }

  // =========================================================================
  // SCENE #49 · CORNER — Submerged red-green stoplight & Trout Cop (40 PSI)
  // =========================================================================
  function renderScene49(ctx, st) {
    var t = st.t;
    var u2 = st.turkeyPhase;
    var u3 = st.troutPhase;
    var sightY = lerp(0, 18, st.ballast);
    var lit = st.lamp;
    var murk = (1 - lit) * (st.troutBlend > 0.5 ? 0.16 : 0.64);

    // Pressurized 40-PSI emerald Old Butler street canyon background
    var bgGrad = ctx.createLinearGradient(CX, CY - R_GLASS, CX, CY + R_GLASS);
    bgGrad.addColorStop(0, lit > 0.4 ? "#6bbdad" : "#32645d");
    bgGrad.addColorStop(0.55, lit > 0.4 ? "#35786f" : "#1d4440");
    bgGrad.addColorStop(1, "#122b29");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(CX - R_GLASS - 5, CY - R_GLASS - 5, (R_GLASS + 5) * 2, (R_GLASS + 5) * 2);

    // Flooded Old Butler 1940s Main Street Storefronts (left & right perspective planes)
    ctx.save();
    ctx.translate(0, sightY * 0.65);
    ctx.fillStyle = "rgba(28, 68, 63, 0.75)";
    ctx.strokeStyle = "rgba(14, 38, 35, 0.85)";
    ctx.lineWidth = 1.8;

    // Left block buildings
    ctx.beginPath();
    ctx.moveTo(CX - 190, CY - 95);
    ctx.lineTo(CX - 95, CY - 55);
    ctx.lineTo(CX - 95, CY + 115);
    ctx.lineTo(CX - 190, CY + 148);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Storefront awning on left
    ctx.fillStyle = "rgba(38, 86, 79, 0.85)";
    ctx.beginPath();
    ctx.moveTo(CX - 188, CY + 8);
    ctx.lineTo(CX - 95, CY + 28);
    ctx.lineTo(CX - 82, CY + 46);
    ctx.lineTo(CX - 188, CY + 32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Distant mid-block building
    ctx.fillStyle = "rgba(34, 78, 72, 0.52)";
    ctx.fillRect(CX - 94, CY - 28, 46, 128);
    ctx.strokeRect(CX - 94, CY - 28, 46, 128);

    // Right block storefront
    ctx.fillStyle = "rgba(26, 65, 60, 0.75)";
    ctx.beginPath();
    ctx.moveTo(CX + 190, CY - 82);
    ctx.lineTo(CX + 112, CY - 38);
    ctx.lineTo(CX + 112, CY + 118);
    ctx.lineTo(CX + 190, CY + 145);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Window rectangles
    ctx.fillStyle = "rgba(18, 44, 41, 0.65)";
    for (var wy = -45; wy <= 5; wy += 48) {
      ctx.fillRect(CX - 158, CY + wy, 18, 30);
      ctx.fillRect(CX - 126, CY + wy + 10, 16, 28);
      ctx.fillRect(CX + 132, CY + wy + 12, 18, 30);
    }

    // Silty submerged cobblestone/asphalt street intersection below
    ctx.fillStyle = "#163834";
    ctx.beginPath();
    ctx.moveTo(CX - 190, CY + 145);
    ctx.lineTo(CX - 48, CY + 96);
    ctx.lineTo(CX + 52, CY + 96);
    ctx.lineTo(CX + 190, CY + 145);
    ctx.lineTo(CX + 190, CY + 195);
    ctx.lineTo(CX - 190, CY + 195);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Stoplight Signal Logic across Acts!
    // Act 1: dim blinking amber/red
    // Act 2 early (u2 < 0.42): festive Christmas RED+GREEN alternating/both lit!
    // Act 2 peak (u2 >= 0.42, incl t=4.0s -> u2=0.55!): bright solid RED STOP!
    // Act 3 early (u3 < 0.52, incl t=6.8s -> u3=0.27!): RED (Trout Cop inspecting potential red-light runner!)
    // Act 3 late (u3 >= 0.52, incl t=9.2s -> u3=0.82!): bright GREEN GO ("yellow taxicab, wave on through!")
    var redOn = 0.25;
    var greenOn = 0.2;
    if (st.pass === "setup") {
      redOn = lit > 0.5 ? 0.85 : 0.3;
      greenOn = lit > 0.5 ? 0.5 : 0.15;
    } else if (st.pass === "turkey") {
      if (u2 < 0.40) {
        // Christmas lights blink!
        redOn = 0.65 + 0.35 * Math.sin(t * 14);
        greenOn = 0.65 + 0.35 * Math.cos(t * 14);
      } else {
        // Solid RED STOP!
        redOn = 1.0;
        greenOn = 0.12;
      }
    } else {
      if (u3 < 0.52) {
        redOn = 0.95;
        greenOn = 0.15;
      } else {
        redOn = 0.12;
        greenOn = 1.0;
      }
    }

    // Overhead catenary cables & Swaying Municipal Yellow-Ochre Stoplight
    var sway = Math.sin(t * 1.8) * 0.055;
    var slX = CX - 12;
    var slY = CY - 134 + sightY * 0.8;

    ctx.save();
    ctx.strokeStyle = "#1a2f2d";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(CX - 165, CY - 165 + sightY * 0.8);
    ctx.quadraticCurveTo(slX, slY + 8, CX + 158, CY - 158 + sightY * 0.8);
    ctx.stroke();

    ctx.translate(slX, slY);
    ctx.rotate(sway);

    // Hanger clamp
    ctx.fillStyle = "#8a7a52";
    ctx.strokeStyle = "#1b1810";
    ctx.lineWidth = 2;
    ctx.fillRect(-7, -6, 14, 18);
    ctx.strokeRect(-7, -6, 14, 18);

    // Yellow-ochre 3D traffic light box
    ctx.fillStyle = "#c99b3b";
    ctx.beginPath();
    ctx.moveTo(-28, 12);
    ctx.lineTo(14, 10);
    ctx.lineTo(14, 104);
    ctx.lineTo(-28, 108);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Side 3D face
    ctx.fillStyle = "#916d22";
    ctx.beginPath();
    ctx.moveTo(14, 10);
    ctx.lineTo(34, 18);
    ctx.lineTo(34, 102);
    ctx.lineTo(14, 104);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red Top Lens + Hood + Volumetric Glow
    if (redOn > 0.4) {
      var rg = ctx.createRadialGradient(-7, 36, 4, -7, 36, 62);
      rg.addColorStop(0, "rgba(255, 72, 56, " + (0.65 * redOn) + ")");
      rg.addColorStop(1, "rgba(255, 72, 56, 0)");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(-7, 36, 62, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = redOn > 0.5 ? "#ff4636" : "#4a1c18";
    ctx.beginPath();
    ctx.arc(-7, 36, 15, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Lens visor hood
    ctx.fillStyle = "#a67c28";
    ctx.beginPath();
    ctx.arc(-7, 36, 17, Math.PI * 1.08, Math.PI * 1.92, false);
    ctx.stroke();

    // Green Bottom Lens + Hood + Volumetric Glow
    if (greenOn > 0.4) {
      var gg = ctx.createRadialGradient(-7, 78, 4, -7, 78, 66);
      gg.addColorStop(0, "rgba(64, 245, 162, " + (0.68 * greenOn) + ")");
      gg.addColorStop(1, "rgba(64, 245, 162, 0)");
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(-7, 78, 66, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = greenOn > 0.5 ? "#42f59e" : "#163d2d";
    ctx.beginPath();
    ctx.arc(-7, 78, 15, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Officer Trout Cop Choreography!
    var copX = CX + 92;
    var copY = CY + 8 + sightY;
    var copScale = 0.98;
    var copWave = 0;
    var whistleAmt = 0;

    if (st.pass === "setup") {
      copX = CX + 132;
      copY = CY + 14 + sightY;
      copScale = 0.85;
    } else if (st.pass === "turkey") {
      // Darts out from right storefront at u2 = 0.35..0.55, raises STOP fin & blows whistle!
      var dart = smoothstep(0.30, 0.50, u2);
      copX = lerp(CX + 136, CX + 78, dart);
      copY = CY + 4 + Math.sin(t * 3) * 4 + sightY;
      copScale = lerp(0.88, 1.05, dart);
      copWave = dart;
      whistleAmt = dart;
    } else {
      // Act 3 ("Red-light runner or yellow taxicab?"):
      // At 6.8s (u3=0.27): right up close to porthole center-right squinting with raised ticket fin!
      // At 9.2s (u3=0.82): stoplight turns GREEN, Trout Cop waves sub cheerfully onward with double whistle bubbles!
      if (u3 < 0.52) {
        var inClose = smoothstep(0.0, 0.25, u3);
        copX = lerp(CX + 78, CX + 34, inClose);
        copY = CY + 24 + sightY;
        copScale = 1.22;
        copWave = 0.9;
        whistleAmt = 0.2;
      } else {
        var goWave = smoothstep(0.52, 0.78, u3);
        copX = lerp(CX + 34, CX + 58, goWave);
        copY = CY + lerp(24, -6, goWave) + Math.sin(t * 2.8) * 5 + sightY;
        copScale = 1.16;
        copWave = 0.65 + Math.sin(t * 9) * 0.35; // Energetic "go right ahead, yellow cab!" wave
        whistleAmt = 0.95;
      }
    }

    drawBrookTrout(ctx, {
      x: copX, y: copY, scale: copScale, dir: -1,
      rot: Math.sin(t * 2.4) * 0.04,
      t: t, wag: 1.0, cop: true,
      finWave: copWave, whistle: whistleAmt, jawOpen: whistleAmt * 0.35
    });

    // Spiral Pea-Whistle Bubble Stream when Trout Cop blows whistle!
    if (whistleAmt > 0.35) {
      ctx.save();
      var wx0 = copX - 56 * copScale;
      var wy0 = copY + 4 * copScale;
      for (var wb = 0; wb < 9; wb++) {
        var wp = ((t * 1.6 + wb * 0.11) % 1.0);
        var bx = wx0 - wp * 26 + Math.sin(wp * 14 + wb) * 8;
        var by = wy0 - wp * 58;
        ctx.fillStyle = "rgba(230, 252, 248, " + (0.75 * (1 - wp)) + ")";
        ctx.strokeStyle = "rgba(255, 255, 255, " + (0.9 * (1 - wp)) + ")";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(bx, by, 2.2 + wp * 3.8, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    drawLampBeam(ctx, lit, -0.05);
    drawWaterAtmosphere(ctx, t, lit, murk, sightY);
    drawTurkeyAcrossGlass(ctx, st, 0.2, (st.pass === "turkey" && u2 > 0.4) ? 0.5 : 0);
  }

  // =========================================================================
  // SCENE #50 · RIFFLE — Three-inch Snail Darter blocking DAM sign (SCION 33)
  // =========================================================================
  function drawSnailDarter(ctx, opts) {
    // Percina tanasi — 3-inch banded Snail Darter with 4 dark saddle bars, big rounded pectoral fins & IK brace!
    var x = opts.x;
    var y = opts.y;
    var scale = opts.scale || 1;
    var t = opts.t || 0;
    var braceAmt = opts.brace || 0; // 0 = gentle hover, 1 = fierce IK plant & dorsal flare!

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    var tailBeat = Math.sin(t * (braceAmt > 0.5 ? 14 : 7)) * (braceAmt > 0.5 ? 5.5 : 3.2);

    // Rounded barred caudal tail fin (facing left like p50.jpg!)
    ctx.save();
    ctx.translate(52, tailBeat * 0.35);
    ctx.rotate(tailBeat * 0.03);
    ctx.fillStyle = "#d9c286";
    ctx.strokeStyle = "#1d180e";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-4, -5);
    ctx.quadraticCurveTo(18, -14, 21, -8);
    ctx.quadraticCurveTo(23, 0, 21, 8);
    ctx.quadraticCurveTo(18, 14, -4, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Tail vertical bars
    ctx.strokeStyle = "#3a2d16";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(7, -9);
    ctx.lineTo(7, 9);
    ctx.moveTo(14, -10);
    ctx.lineTo(14, 10);
    ctx.stroke();
    ctx.restore();

    // Dual Dorsal Fins — Anterior spiny dorsal flares high when blocking DAM!
    var flare = lerp(0.55, 1.15, braceAmt);
    ctx.fillStyle = "#c9ae68";
    ctx.strokeStyle = "#1d180e";
    ctx.lineWidth = 1.8;
    // Spiny first dorsal
    ctx.beginPath();
    ctx.moveTo(-18, -12);
    ctx.quadraticCurveTo(-6, -12 - 17 * flare, 10, -11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    for (var sp = -13; sp <= 6; sp += 5) {
      ctx.beginPath();
      ctx.moveTo(sp, -12);
      ctx.lineTo(sp - 1, -12 - 12 * flare);
      ctx.stroke();
    }
    // Soft second dorsal
    ctx.beginPath();
    ctx.moveTo(12, -11);
    ctx.quadraticCurveTo(24, -24, 36, -9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Anal fin
    ctx.beginPath();
    ctx.moveTo(14, 11);
    ctx.quadraticCurveTo(24, 23, 34, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Elongated benthic darter body (facing left)
    ctx.beginPath();
    ctx.moveTo(-54, 2);
    ctx.quadraticCurveTo(-40, -15, -8, -15);
    ctx.quadraticCurveTo(26, -14, 52, -5 + tailBeat * 0.3);
    ctx.lineTo(52, 5 + tailBeat * 0.3);
    ctx.quadraticCurveTo(24, 14, -8, 15);
    ctx.quadraticCurveTo(-38, 15, -54, 4);
    ctx.closePath();
    var dGrad = ctx.createLinearGradient(0, -16, 0, 16);
    dGrad.addColorStop(0, "#75602d");
    dGrad.addColorStop(0.5, "#cdb574");
    dGrad.addColorStop(1, "#f2ead0");
    ctx.fillStyle = dGrad;
    ctx.fill();

    // 4 Signature Snail Darter Dark Saddle-Bars!
    ctx.save();
    ctx.clip();
    ctx.fillStyle = "#2f2411";
    var saddles = [-24, -4, 16, 35];
    for (var sd = 0; sd < saddles.length; sd++) {
      ctx.beginPath();
      ctx.moveTo(saddles[sd] - 6, -17);
      ctx.lineTo(saddles[sd] + 6, -17);
      ctx.lineTo(saddles[sd] + 4, 8);
      ctx.lineTo(saddles[sd] - 4, 8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = "#1d180e";
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Watchful benthic eye + sub-orbital dark teardrop bar
    ctx.fillStyle = "#fff8dc";
    ctx.beginPath();
    ctx.arc(-36, -4, 5.4, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#15120c";
    ctx.beginPath();
    ctx.arc(-37.2, -4, 2.9, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-38.2, -5.2, 1.1, 0, TAU);
    ctx.fill();

    // SCION 33 Two-Bone Inverse Kinematics Pectoral/Pelvic Prop-Fins!
    // When braceAmt > 0, the darter plants its large fan pectoral & pelvic fin tips onto fixed contact targets!
    var targetX = lerp(-12, -24, braceAmt);
    var targetY = lerp(18, 25, braceAmt);
    var ik = solveIK2(-20, 6, targetX, targetY, 12, 12, false);

    ctx.fillStyle = "rgba(222, 198, 132, 0.92)";
    ctx.strokeStyle = "#1d180e";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-22, 5);
    ctx.quadraticCurveTo(ik.jx + 14, ik.jy + 4, ik.ex + 10, ik.ey);
    ctx.quadraticCurveTo(ik.ex, ik.ey + 4, ik.ex - 6, ik.ey - 2);
    ctx.quadraticCurveTo(ik.jx - 4, ik.jy, -24, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Visible subtle golden IK brace contact glint when planted against the DAM sign!
    if (braceAmt > 0.5) {
      ctx.strokeStyle = "rgba(255, 224, 112, " + ((braceAmt - 0.5) * 1.6) + ")";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(ik.ex, ik.ey + 2, 5 + Math.sin(t * 12) * 1.5, 0, Math.PI);
      ctx.stroke();
    }

    ctx.restore();
  }

  function renderScene50(ctx, st) {
    var t = st.t;
    var u2 = st.turkeyPhase;
    var u3 = st.troutPhase;

    // Ballast lowers sub into calm Tellico gravel pocket (+22px sightline shift!)
    var sightY = lerp(-20, 4, st.ballast);
    var rush = lerp(1.0, 0.28, st.ballast);

    var wGrad = ctx.createLinearGradient(CX, CY - R_GLASS, CX, CY + R_GLASS);
    wGrad.addColorStop(0, "#9ae4d2");
    wGrad.addColorStop(0.45, "#2f7d75");
    wGrad.addColorStop(1, "#163d3a");
    ctx.fillStyle = wGrad;
    ctx.fillRect(CX - R_GLASS - 5, CY - R_GLASS - 5, (R_GLASS + 5) * 2, (R_GLASS + 5) * 2);

    // Fast Tellico River riffle stream lines across background
    ctx.save();
    ctx.strokeStyle = "rgba(222, 248, 240, " + lerp(0.52, 0.24, st.ballast) + ")";
    ctx.lineWidth = 2.0;
    for (var sl = 0; sl < 10; sl++) {
      var sx = CX - 180 + ((t * (110 + sl * 18) * (0.5 + rush * 0.5) + sl * 67) % 360);
      var sy = CY - 140 + sl * 28 + sightY * 0.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 38 + rush * 28, sy + Math.sin(t * 4 + sl) * 3);
      ctx.stroke();
    }
    ctx.restore();

    // Two flanking Brook Trout witnesses behind the giant DAM sign (like p50.jpg!)
    drawBrookTrout(ctx, {
      x: CX - 115 + Math.sin(t * 1.6) * 8,
      y: CY - 88 + sightY * 0.7,
      scale: 0.88, dir: 1, rot: 0.14, t: t, wag: 0.9
    });
    if (st.pass !== "trout") {
      drawBrookTrout(ctx, {
        x: CX + 118 + Math.cos(t * 1.5) * 8,
        y: CY - 84 + sightY * 0.7,
        scale: 0.88, dir: -1, rot: 0.14, t: t + 1.2, wag: 0.9
      });
    }

    // Scale Reversal Prop: Giant Weathered Yellow Diamond "DAM" Sign!
    // In Act 2 around t = 4.0s (u2 = 0.55), the 3-inch Snail Darter braces via IK and pushes the giant sign back 4.5 degrees!
    var braceAmt = 0;
    if (st.pass === "turkey") {
      braceAmt = smoothstep(0.28, 0.48, u2);
    } else if (st.pass === "trout") {
      braceAmt = 0.88;
    }
    var signTilt = braceAmt * 0.075 + Math.sin(t * 5) * 0.012 * rush;

    ctx.save();
    ctx.translate(CX, CY + 148 + sightY);
    ctx.rotate(signTilt);
    ctx.translate(0, -148);

    // Diamond yellow road sign (142px half-diagonal)
    var R_SIGN = 144;
    ctx.beginPath();
    ctx.moveTo(0, -R_SIGN);
    ctx.lineTo(R_SIGN + 8, 0);
    ctx.lineTo(0, R_SIGN);
    ctx.lineTo(-R_SIGN - 8, 0);
    ctx.closePath();
    var sGrad = ctx.createLinearGradient(-90, -90, 90, 90);
    sGrad.addColorStop(0, "#f5be49");
    sGrad.addColorStop(0.55, "#e69c2e");
    sGrad.addColorStop(1, "#c4741d");
    ctx.fillStyle = sGrad;
    ctx.fill();
    ctx.strokeStyle = "#1c1812";
    ctx.lineWidth = 3.2;
    ctx.stroke();

    // Inner black highway border
    ctx.beginPath();
    ctx.moveTo(0, -R_SIGN + 12);
    ctx.lineTo(R_SIGN - 5, 0);
    ctx.lineTo(0, R_SIGN - 12);
    ctx.lineTo(-R_SIGN + 5, 0);
    ctx.closePath();
    ctx.lineWidth = 3.6;
    ctx.stroke();

    // Top bolt hole & weathered rust speckles
    ctx.fillStyle = "#5f6e68";
    ctx.beginPath();
    ctx.arc(0, -R_SIGN + 26, 4.5, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(112, 48, 16, 0.52)";
    var rustDots = [[-36, -72, 9], [-44, -52, 6], [48, -58, 8], [76, 18, 10], [-62, 46, 7], [22, 86, 8]];
    for (var rd = 0; rd < rustDots.length; rd++) {
      ctx.beginPath();
      ctx.arc(rustDots[rd][0], rustDots[rd][1], rustDots[rd][2], 0, TAU);
      ctx.fill();
    }

    // Giant Bold Stenciled "DAM" Typography
    ctx.fillStyle = "#222422";
    ctx.strokeStyle = "#111210";
    ctx.lineWidth = 1.8;
    ctx.font = "900 84px 'Arial Black', Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("DAM", 0, 4);
    ctx.strokeText("DAM", 0, 4);
    ctx.restore();

    // Foreground Tellico River Rounded Cobble Gravel Bed & Swaying Eelgrass
    ctx.save();
    ctx.translate(0, sightY * 1.15);
    var pebbles = [
      [-110, 152, 26, 14, "#7b8d82"], [-68, 142, 24, 15, "#9fb09e"],
      [-28, 154, 28, 14, "#8a9989"], [18, 146, 26, 15, "#a9b8a4"],
      [62, 154, 28, 14, "#798c82"], [104, 140, 32, 16, "#8fa398"],
      [-48, 168, 25, 13, "#b8c2ac"], [0, 168, 30, 14, "#94a392"],
      [44, 170, 26, 13, "#acb8a2"]
    ];
    ctx.strokeStyle = "#182622";
    ctx.lineWidth = 1.8;
    for (var pb = 0; pb < pebbles.length; pb++) {
      var p = pebbles[pb];
      ctx.fillStyle = p[4];
      ctx.beginPath();
      ctx.ellipse(CX + p[0], CY + p[1], p[2], p[3], 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    // Swaying right-side river reeds
    ctx.strokeStyle = "#2d6b52";
    ctx.lineWidth = 4.2;
    for (var gr = 0; gr < 4; gr++) {
      var gx = CX + 96 + gr * 14;
      ctx.beginPath();
      ctx.moveTo(gx, CY + 165);
      ctx.quadraticCurveTo(
        gx - 12 + Math.sin(t * 3.5 + gr) * 10,
        CY + 108,
        gx + 6 + Math.sin(t * 3.5 + gr) * 16,
        CY + 56 + gr * 8
      );
      ctx.stroke();
    }
    ctx.restore();

    // HERO: Three-Inch Snail Darter blocking the giant DAM sign!
    var darterX = CX - 6 + (braceAmt > 0.4 ? -4 : Math.sin(t * 2.5) * 6);
    var darterY = CY + 36 + sightY + (1 - braceAmt) * Math.sin(t * 3.2) * 5;
    if (braceAmt > 0.45) {
      // Subtle force-standoff shockwave arcs showing tiny 3-inch darter holding back the giant DAM sign!
      ctx.save();
      ctx.strokeStyle = "rgba(255, 232, 136, " + ((braceAmt - 0.45) * 1.1) + ")";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(darterX - 54, darterY + 2, 16 + Math.sin(t * 10) * 3, Math.PI * 0.65, Math.PI * 1.35);
      ctx.stroke();
      ctx.restore();
    }
    drawSnailDarter(ctx, {
      x: darterX,
      y: darterY,
      scale: lerp(1.08, 1.24, braceAmt),
      t: t,
      brace: braceAmt
    });

    // Act 3 ("Mini bulldozer or illegal dredge?"):
    // Right-hand Brook Trout swims down in front of the cobbles to inspect the sub's low Ballast blade (6.8s),
    // then glides across to center-foreground facing Turkey's porthole in salute (9.2s)!
    if (st.pass === "trout") {
      var enterFg = smoothstep(0.04, 0.26, u3);
      var glideAcross = smoothstep(0.48, 0.82, u3);
      var btx = CX + lerp(112, 62, enterFg) - glideAcross * 42;
      var bty = CY + lerp(-75, 102, enterFg) - glideAcross * 22 + sightY;
      drawBrookTrout(ctx, {
        x: btx, y: bty, scale: lerp(0.92, 1.08, enterFg), dir: -1,
        rot: lerp(0.22, -0.08, glideAcross),
        t: t, wag: 1.15, jawOpen: 0.24
      });
    }

    drawLampBeam(ctx, st.lamp, 0.0);
    var murk = (1 - st.ballast) * (st.act === 1 ? 0.52 : 0.14);
    drawWaterAtmosphere(ctx, t, st.lamp, murk, sightY);
    drawTurkeyAcrossGlass(ctx, st, 0.32 * braceAmt, 0);
  }

  // =========================================================================
  // SETUP A BREAD-TIN COCKPIT & EDITORIAL STORY STRIP (y = 0..720)
  // =========================================================================
  function drawBreadTinCockpit(ctx, meta, st) {
    var t = st.t;

    // 1. Exterior frame around porthole (masking everything outside r_glass=185!)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 1280, 720);
    ctx.arc(CX, CY, R_GLASS, 0, TAU, true);
    ctx.fillStyle = "#112124";
    ctx.fill("evenodd");

    // Clip to upper cockpit panel (0..536 when captions on, 0..720 when captions off!)
    ctx.beginPath();
    ctx.rect(0, 0, 1280, st.showCaptions ? 536 : 720);
    ctx.arc(CX, CY, R_GLASS, 0, TAU, true);
    ctx.clip("evenodd");

    // Brushed dark bread-roll tin interior gradient (#132427)
    var hullGrad = ctx.createRadialGradient(CX, 90, 60, CX, 310, 720);
    hullGrad.addColorStop(0, "#1c3438");
    hullGrad.addColorStop(0.55, "#132427");
    hullGrad.addColorStop(1, "#0b1618");
    ctx.fillStyle = hullGrad;
    ctx.fillRect(0, 0, 1280, 720);

    // Subtle vertical hammered bread-tin seams
    ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
    ctx.lineWidth = 1.5;
    for (var rx = 140; rx <= 1140; rx += 125) {
      ctx.beginPath();
      ctx.moveTo(rx, 22);
      ctx.lineTo(rx, 516);
      ctx.stroke();
    }

    // Overhead practical amber task-light bar & warm ceiling wash
    var taskStrength = 0.55 + st.lamp * 0.35;
    var ambWash = ctx.createRadialGradient(CX, 28, 12, CX, 120, 480);
    ambWash.addColorStop(0, "rgba(244, 184, 92, " + (0.24 * taskStrength) + ")");
    ambWash.addColorStop(1, "rgba(244, 184, 92, 0)");
    ctx.fillStyle = ambWash;
    ctx.fillRect(120, 16, 1040, 380);

    // Oval Bread-Roll Tin Rim Border WITH Signature Right-Side Dent!
    ctx.strokeStyle = "#5f8082";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(118, 18);
    ctx.lineTo(1162, 18);
    ctx.quadraticCurveTo(1234, 18, 1234, 90);
    ctx.lineTo(1234, 198);
    // Right-side inward bread-tin dent!
    ctx.bezierCurveTo(1204, 228, 1204, 302, 1234, 332);
    ctx.lineTo(1234, 448);
    ctx.quadraticCurveTo(1234, 518, 1162, 518);
    ctx.lineTo(118, 518);
    ctx.quadraticCurveTo(46, 518, 46, 448);
    ctx.lineTo(46, 90);
    ctx.quadraticCurveTo(46, 18, 118, 18);
    ctx.closePath();
    ctx.stroke();

    // Inner dent crease highlight so the right-side dent is unmistakable
    ctx.strokeStyle = "#8eb2b4";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(1224, 212);
    ctx.quadraticCurveTo(1196, 265, 1224, 318);
    ctx.stroke();

    // Overhead amber task-light bar fixture
    ctx.strokeStyle = "#ca9a52";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(165, 34);
    ctx.quadraticCurveTo(CX, 14, 1115, 34);
    ctx.stroke();
    ctx.fillStyle = "#ffd27d";
    roundRectPath(ctx, CX - 68, 18, 136, 9, 4);
    ctx.fill();

    // 2. Top-Left Station Plaque (text when showCaptions===true, iconic module diagram when false!)
    roundRectPath(ctx, 74, 68, 294, 96, 10);
    ctx.fillStyle = "rgba(14, 29, 32, 0.85)";
    ctx.fill();
    ctx.strokeStyle = "#48686a";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    if (st.showCaptions) {
      ctx.fillStyle = "#e8be74";
      ctx.font = "600 15px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("STATION " + meta.station, 92, 95);
      ctx.fillStyle = "#b7d0ce";
      ctx.font = "500 13px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("FIT: " + (meta.defaultTool === "lamp" ? "LAMP MODULE" : "BALLAST MODULE"), 92, 118);
      ctx.fillStyle = "#8fb0ae";
      ctx.fillText(meta.scionRule, 92, 142);
    } else {
      // Blind-critic clean non-text hardware schematic icon on plaque
      ctx.strokeStyle = "#8fb0ae";
      ctx.lineWidth = 2;
      ctx.strokeRect(102, 96, 78, 36);
      ctx.fillStyle = meta.defaultTool === "ballast" ? "#d4a44e" : "#3a595c";
      ctx.fillRect(110, 104, 62, 20);
      ctx.beginPath();
      ctx.arc(258, 114, 20, 0, TAU);
      ctx.fillStyle = meta.defaultTool === "lamp" ? "#f4c45a" : "#3a595c";
      ctx.fill();
      ctx.stroke();
    }

    // 3. Top-Right "1 Day of Air" Brass Gauge (cx=1098, cy=130, r=58)
    var gx = 1098, gy = 130, gr = 58;
    ctx.beginPath();
    ctx.arc(gx, gy, gr + 6, 0, TAU);
    ctx.fillStyle = "#a87d39";
    ctx.fill();
    ctx.strokeStyle = "#261b09";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, TAU);
    ctx.fillStyle = "#faf3e0";
    ctx.fill();
    ctx.stroke();
    // Gauge ticks
    ctx.strokeStyle = "#263334";
    for (var tk = 0; tk <= 10; tk++) {
      var ta = Math.PI * 0.85 + (tk / 10) * Math.PI * 1.3;
      ctx.lineWidth = tk % 5 === 0 ? 2.4 : 1.4;
      ctx.beginPath();
      ctx.moveTo(gx + Math.cos(ta) * (gr - 11), gy + Math.sin(ta) * (gr - 11));
      ctx.lineTo(gx + Math.cos(ta) * (gr - 3), gy + Math.sin(ta) * (gr - 3));
      ctx.stroke();
    }
    // Breathing red pressure/air needle
    var needleAng = -0.95 - (st.tl / 10) * 0.14 + Math.sin(t * 3.2) * 0.03;
    ctx.strokeStyle = "#b5381f";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(gx, gy + 4);
    ctx.lineTo(gx + Math.cos(needleAng) * 42, gy + Math.sin(needleAng) * 42);
    ctx.stroke();
    ctx.fillStyle = "#2b2018";
    ctx.beginPath();
    ctx.arc(gx, gy + 4, 4.5, 0, TAU);
    ctx.fill();
    if (st.showCaptions) {
      ctx.fillStyle = "#1c2829";
      ctx.font = "700 14px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("1 DAY", gx, gy + 24);
      ctx.font = "500 12px ui-monospace, SFMono-Regular, monospace";
      ctx.fillText("OF AIR", gx, gy + 40);
    } else {
      // Clean air-bubble emblem instead of text
      ctx.strokeStyle = "#2c6b74";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(gx - 6, gy + 28, 5, 0, TAU);
      ctx.arc(gx + 6, gy + 24, 3.5, 0, TAU);
      ctx.stroke();
    }

    // 4. Bottom-Left: Ballast / Single Slot (x=92..332, y=428..506)
    roundRectPath(ctx, 92, 428, 240, 78, 12);
    ctx.fillStyle = "#102023";
    ctx.fill();
    ctx.strokeStyle = st.ballast > 0.5 ? "#e2b25c" : "#89b2b0";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    if (st.showCaptions) {
      ctx.fillStyle = "#c8dedc";
      ctx.font = "500 13px ui-monospace, SFMono-Regular, monospace";
      ctx.textAlign = "center";
      ctx.fillText("BALLAST / SINGLE SLOT", 212, 449);
    }
    // Recessed socket
    ctx.fillStyle = "#1f3c3f";
    ctx.strokeStyle = "#6e9492";
    ctx.lineWidth = 1.6;
    ctx.fillRect(130, 460, 164, 32);
    ctx.strokeRect(130, 460, 164, 32);

    // Sliding Rectangular Lead-and-Brass Ballast Tray Module!
    if (st.ballast > 0.02 || (meta.defaultTool === "ballast" && st.reachAmt > 0.1)) {
      var slide = clamp(st.ballast, 0, 1);
      var trayX = lerp(42, 134, easeOutBack(slide));
      var trayY = lerp(474, 463, slide);
      ctx.save();
      ctx.fillStyle = "#b88c3e";
      ctx.strokeStyle = "#221808";
      ctx.lineWidth = 2.0;
      roundRectPath(ctx, trayX, trayY, 156, 26, 4);
      ctx.fill();
      ctx.stroke();
      // Lead weight cores + brass pull handle
      ctx.fillStyle = "#48595c";
      ctx.fillRect(trayX + 12, trayY + 5, 42, 16);
      ctx.fillRect(trayX + 102, trayY + 5, 42, 16);
      ctx.strokeStyle = "#f5d782";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(trayX + 66, trayY + 13);
      ctx.lineTo(trayX + 90, trayY + 13);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Bottom-Center: Chalk Chart Under Glass (x=474..806, y=436..508)
    roundRectPath(ctx, 474, 436, 332, 72, 12);
    ctx.fillStyle = "#132326";
    ctx.fill();
    ctx.strokeStyle = "#7aa2a4";
    ctx.lineWidth = 2.0;
    ctx.stroke();
    if (st.showCaptions) {
      ctx.fillStyle = "#b5cfcf";
      ctx.font = "500 12.5px ui-monospace, SFMono-Regular, monospace";
      ctx.textAlign = "center";
      ctx.fillText("CHART UNDER GLASS", CX, 455);
    }
    // Chalk route polyline progressively drawn across Act 1 -> Act 3
    var routePts = [
      [502, 492], [548, 476], [596, 488], [648, 472], [704, 484], [748, 474], [778, 482]
    ];
    var totalSegs = (routePts.length - 1) * st.chartProgress;
    ctx.save();
    ctx.strokeStyle = "#f2f0e4";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(routePts[0][0], routePts[0][1]);
    for (var rp = 0; rp < routePts.length - 1; rp++) {
      var segU = clamp(totalSegs - rp, 0, 1);
      if (segU <= 0) break;
      ctx.lineTo(
        lerp(routePts[rp][0], routePts[rp + 1][0], segU),
        lerp(routePts[rp][1], routePts[rp + 1][1], segU)
      );
    }
    ctx.stroke();

    // Gold Landmark Dot & Chalk Verification Ring at t >= 5.6s!
    if (st.troutBlend > 0.25) {
      var gxDot = 736, gyDot = 476;
      ctx.fillStyle = "#f4b946";
      ctx.beginPath();
      ctx.arc(gxDot, gyDot, 5.8 * st.troutBlend, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 232, 152, " + (0.75 * st.troutBlend) + ")";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(gxDot, gyDot, 10.5 + Math.sin(t * 4) * 1.5, 0, TAU);
      ctx.stroke();
    }
    // Subtle diagonal glazing reflection over chart
    ctx.strokeStyle = "rgba(255, 255, 255, 0.10)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(518, 504);
    ctx.lineTo(558, 440);
    ctx.moveTo(710, 504);
    ctx.lineTo(750, 440);
    ctx.stroke();
    ctx.restore();

    // 6. Bottom-Right: Lamp Toggle Switch (x=984..1104, y=424..508)
    roundRectPath(ctx, 984, 424, 120, 84, 12);
    ctx.fillStyle = "#122124";
    ctx.fill();
    ctx.strokeStyle = st.lamp > 0.5 ? "#eab354" : "#6c8b8d";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    if (st.showCaptions) {
      ctx.fillStyle = "#d9c69c";
      ctx.font = "500 12.5px ui-monospace, SFMono-Regular, monospace";
      ctx.textAlign = "center";
      ctx.fillText("TOGGLE", 1044, 444);
    }
    // Brass toggle socket & bat-handle
    var swX = 1044, swY = 480;
    if (st.lamp > 0.4) {
      var jGlow = ctx.createRadialGradient(swX, swY, 2, swX, swY, 26);
      jGlow.addColorStop(0, "rgba(255, 206, 98, 0.65)");
      jGlow.addColorStop(1, "rgba(255, 206, 98, 0)");
      ctx.fillStyle = jGlow;
      ctx.beginPath();
      ctx.arc(swX, swY, 26, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "#d9a44b";
    ctx.beginPath();
    ctx.arc(swX, swY, 10, 0, TAU);
    ctx.fill();
    var swAng = lerp(-2.25, -1.05, st.lamp); // Flips from down-left/left to crisp up-right!
    ctx.strokeStyle = "#f7f4eb";
    ctx.lineWidth = 6.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(swX, swY);
    ctx.lineTo(swX + Math.cos(swAng) * 28, swY + Math.sin(swAng) * 28);
    ctx.stroke();

    // If showCaptions === false, render lower bread-tin workbench & spare Works module cradle (y=536..720)!
    if (!st.showCaptions) {
      ctx.fillStyle = "#0e1b1e";
      ctx.fillRect(0, 536, 1280, 184);
      ctx.strokeStyle = "#355052";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(46, 542);
      ctx.lineTo(1234, 542);
      ctx.stroke();
      // Spare module resting in Works cradle on bench (SCION episode-works invariant!)
      roundRectPath(ctx, CX - 110, 578, 220, 88, 10);
      ctx.fillStyle = "#15282b";
      ctx.fill();
      ctx.strokeStyle = "#4d6d6f";
      ctx.stroke();
      if (st.ballast > 0.5) {
        // Ballast is mounted -> spare round Lamp module rests in cradle
        ctx.fillStyle = "#c9963e";
        ctx.beginPath();
        ctx.arc(CX, 622, 26, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#9ad8e2";
        ctx.beginPath();
        ctx.arc(CX, 622, 16, 0, TAU);
        ctx.fill();
      } else {
        // Spare rectangular Ballast tray rests in cradle
        ctx.fillStyle = "#9e7834";
        roundRectPath(ctx, CX - 72, 608, 144, 28, 4);
        ctx.fill();
      }
    }

    ctx.restore(); // End exterior cockpit wall clip

    // 7. RIVETED ANTIQUE BRASS PORTHOLE BEZEL, HINGE, OFFSET LATCH & 2-O'CLOCK RIM CHIP!
    ctx.save();
    // Cast-iron left double hinge
    ctx.fillStyle = "#3f4645";
    ctx.strokeStyle = "#141818";
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, CX - R_RIM - 26, CY - 58, 36, 116, 5);
    ctx.fill();
    ctx.stroke();
    roundRectPath(ctx, CX - R_RIM - 34, CY - 62, 14, 124, 6);
    ctx.fillStyle = "#525a58";
    ctx.fill();
    ctx.stroke();
    // Hinge screws
    ctx.fillStyle = "#232827";
    ctx.beginPath();
    ctx.arc(CX - R_RIM - 4, CY - 38, 4.5, 0, TAU);
    ctx.arc(CX - R_RIM - 4, CY + 38, 4.5, 0, TAU);
    ctx.fill();

    // Brass Outer Bezel Ring (R_GLASS=185 to R_RIM=232)
    var rimGrad = ctx.createLinearGradient(CX - R_RIM, CY - R_RIM, CX + R_RIM, CY + R_RIM);
    rimGrad.addColorStop(0, "#e5bf6e");
    rimGrad.addColorStop(0.35, "#b7893b");
    rimGrad.addColorStop(0.7, "#855e22");
    rimGrad.addColorStop(1, "#c89b48");
    ctx.beginPath();
    ctx.arc(CX, CY, R_RIM, 0, TAU, false);
    ctx.arc(CX, CY, R_GLASS, 0, TAU, true);
    ctx.fillStyle = rimGrad;
    ctx.fill("evenodd");

    // Inner & outer dark ink bevel rings
    ctx.strokeStyle = "#1d1508";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(CX, CY, R_RIM, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS + 12, 0, TAU);
    ctx.strokeStyle = "rgba(42, 28, 8, 0.72)";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS, 0, TAU);
    ctx.strokeStyle = "#171106";
    ctx.lineWidth = 3.2;
    ctx.stroke();

    // SIGNATURE INVARIANT: 2-o'clock Rim Chip! (Angle = -30 deg = -PI/6 on inner brass bevel)
    var chipAng = -Math.PI / 5.4;
    var chipX = CX + Math.cos(chipAng) * (R_GLASS + 7);
    var chipY = CY + Math.sin(chipAng) * (R_GLASS + 7);
    ctx.save();
    ctx.translate(chipX, chipY);
    ctx.rotate(chipAng);
    ctx.fillStyle = "#1b2426";
    ctx.strokeStyle = "#f7df98";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-9, -13);
    ctx.lineTo(10, -4);
    ctx.lineTo(-4, 12);
    ctx.lineTo(-11, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Right Offset Brass Dog-Latch
    ctx.save();
    ctx.translate(CX + R_RIM - 8, CY + 6);
    ctx.fillStyle = "#c99a45";
    ctx.strokeStyle = "#1f1608";
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, -12, -32, 24, 64, 8);
    ctx.fill();
    ctx.stroke();
    // Latch dog handle
    ctx.fillStyle = "#e4ba66";
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.quadraticCurveTo(-8, -12, 28, -9);
    ctx.lineTo(28, 9);
    ctx.quadraticCurveTo(-8, 12, -24, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 6 Riveted Hex Bolts = 1d6 Die Ring! (12, 2, 4, 6, 8, 10 o'clock -> faces 1..6)
    var boltColors = ["#2898b2", "#2898b2", "#4e9e4c", "#4e9e4c", "#c84b28", "#c84b28"];
    for (var b = 0; b < 6; b++) {
      var faceNum = b + 1;
      var ba = -Math.PI / 2 + b * (Math.PI / 3);
      var bx = CX + Math.cos(ba) * 209;
      var by = CY + Math.sin(ba) * 209;
      var isRolled = st.roll === faceNum;
      var isChasing = st.chaseBolt === faceNum;

      if (isRolled || isChasing) {
        var bGlow = ctx.createRadialGradient(bx, by, 3, bx, by, isRolled ? 28 : 20);
        bGlow.addColorStop(0, isRolled ? "#fff5b8" : "rgba(255, 236, 152, 0.85)");
        bGlow.addColorStop(0.55, boltColors[b] + "aa");
        bGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = bGlow;
        ctx.beginPath();
        ctx.arc(bx, by, isRolled ? 28 : 20, 0, TAU);
        ctx.fill();
      }

      // Hex head
      ctx.fillStyle = isRolled ? "#ffea92" : isChasing ? "#f2cf6c" : "#c79944";
      ctx.strokeStyle = isRolled ? boltColors[b] : "#221808";
      ctx.lineWidth = isRolled ? 2.8 : 2.0;
      ctx.beginPath();
      for (var hx = 0; hx < 6; hx++) {
        var ha = hx * (Math.PI / 3) + 0.2;
        var px = bx + Math.cos(ha) * 12;
        var py = by + Math.sin(ha) * 12;
        if (hx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glint starburst on rolled 1d6 bolt!
      if (isRolled) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.0;
        var sLen = 15 + Math.sin(t * 7) * 3;
        ctx.beginPath();
        ctx.moveTo(bx - sLen, by);
        ctx.lineTo(bx + sLen, by);
        ctx.moveTo(bx, by - sLen);
        ctx.lineTo(bx, by + sLen);
        ctx.stroke();
      }
    }

    // Curved specular glass highlight arc over porthole upper-left
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(CX, CY, R_GLASS - 14, Math.PI * 1.08, Math.PI * 1.36, false);
    ctx.stroke();
    ctx.restore();

    // 8. ARTICULATED TURKEY PILOT FEATHERED WING OPERATING THE CONTROL (Act 1 Reach!)
    // Anchored cleanly to the bottom pilot seat edge in both captioned (y=536) and uncaptioned (y=720) modes!
    var bottomEdge = st.showCaptions ? 536 : 720;
    var isRight = meta.defaultTool === "lamp";
    var targetCtrlX = isRight ? 1040 : 218;
    var targetCtrlY = isRight ? 470 : 476;
    var restX = isRight ? 920 : 360;
    var restY = bottomEdge - 8;
    var shoulderX = isRight ? 830 : 450;
    var shoulderY = bottomEdge + 38;

    var handX = lerp(restX, targetCtrlX, st.reachAmt);
    var handY = lerp(restY, targetCtrlY, st.reachAmt);

    if (st.reachAmt > 0.015) {
      var LSeg = st.showCaptions ? 95 : 165;
      var wingIK = solveIK2(shoulderX, shoulderY, handX, handY, LSeg, LSeg, isRight);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, 1280, bottomEdge);
      ctx.clip();

      // Broad curved feathered forearm fan (coverts + primaries)
      ctx.fillStyle = "#6e3319";
      ctx.strokeStyle = "#220f07";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(shoulderX - (isRight ? 28 : -28), shoulderY);
      ctx.quadraticCurveTo(wingIK.jx, wingIK.jy - 18, wingIK.ex, wingIK.ey - 8);
      ctx.lineTo(wingIK.ex, wingIK.ey + 10);
      ctx.quadraticCurveTo(wingIK.jx + (isRight ? 16 : -16), wingIK.jy + 22, shoulderX + (isRight ? 26 : -26), shoulderY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Layered copper covert feathers along forearm
      var segAng = Math.atan2(wingIK.ey - wingIK.jy, wingIK.ex - wingIK.jx);
      for (var cf = 1; cf <= 4; cf++) {
        var cu = cf / 5;
        var cxF = lerp(wingIK.jx, wingIK.ex, cu);
        var cyF = lerp(wingIK.jy, wingIK.ey, cu);
        ctx.save();
        ctx.translate(cxF, cyF);
        ctx.rotate(segAng + (isRight ? 0.18 : -0.18));
        ctx.fillStyle = cf % 2 === 0 ? "#9c4b25" : "#7e3a1c";
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 9, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Fanned barred primary wing-tip feathers gripping the switch/module!
      ctx.translate(wingIK.ex, wingIK.ey);
      ctx.rotate(segAng);
      for (var pf = -3; pf <= 3; pf++) {
        ctx.save();
        ctx.rotate(pf * 0.17);
        ctx.fillStyle = pf % 2 === 0 ? "#b2582e" : "#803b1c";
        ctx.strokeStyle = "#221008";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(14, 0, 21, 5.8, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
        // Barred cream feather tip
        ctx.fillStyle = "#eed9b7";
        ctx.fillRect(22, -3, 6, 6);
        ctx.restore();
      }
      ctx.restore();
    }

    // 9. LOWER CREAM EDITORIAL STORY STRIP (y = 536..720 when showCaptions !== false)
    if (st.showCaptions) {
      ctx.save();
      ctx.fillStyle = "#faf8f3";
      ctx.fillRect(0, 536, 1280, 184);
      ctx.fillStyle = "#ded8ca";
      ctx.fillRect(0, 536, 1280, 2);

      // Subtle timeline progress bar along top edge of strip
      var barCol = st.pass === "trout" ? "#1d596e" : st.pass === "turkey" ? "#9e3d1c" : "#8b6d32";
      ctx.fillStyle = barCol;
      ctx.fillRect(0, 536, 1280 * clamp(st.tl / 10.0, 0, 1), 3);

      var padX = 74;
      ctx.textAlign = "left";

      if (st.pass === "setup") {
        ctx.fillStyle = "#6e5526";
        ctx.font = "600 14px ui-monospace, SFMono-Regular, Menlo, monospace";
        var actionLabel = meta.defaultTool === "lamp"
          ? (st.lamp > 0.5 ? "LAMP MODULE ENGAGED  ·  BEAM ON" : "OPERATING SINGLE CONTROL  ·  REACHING FOR LAMP TOGGLE")
          : (st.ballast > 0.5 ? "BALLAST MODULE SNAPPED IN  ·  SHELTER SIGHTLINE" : "OPERATING SINGLE CONTROL  ·  FITTING BALLAST INTO SLOT");
        ctx.fillText("SETUP A · " + actionLabel + "   (" + meta.station + ")", padX, 574);

        ctx.fillStyle = "#2b2823";
        ctx.font = "700 34px Georgia, 'Times New Roman', serif";
        ctx.fillText(meta.clue, padX, 626);

        ctx.fillStyle = "#5c574e";
        ctx.font = "italic 19px Georgia, serif";
        ctx.fillText("Point to the control, operate one part, and watch what changes outside the chipped porthole.", padX, 692);
      } else if (st.pass === "turkey") {
        ctx.fillStyle = "#9e3d1c";
        ctx.font = "600 14.5px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillText("FIRST PASS  ·  TURKEY LOOKS OUT   (" + meta.station + ")", padX, 574);

        ctx.fillStyle = "#9e3d1c";
        ctx.font = "700 38px Georgia, 'Times New Roman', serif";
        ctx.fillText("“" + meta.turkeyFork + "”", padX, 628);

        ctx.fillStyle = "#4d4942";
        ctx.font = "italic 20px Georgia, serif";
        ctx.fillText("Write odd faces (1 · 3 · 5)  ·  " + meta.scionRule + "  ·  " + meta.clue, padX, 694);
      } else {
        ctx.fillStyle = "#1d596e";
        ctx.font = "600 14.5px ui-monospace, SFMono-Regular, Menlo, monospace";
        var rollTag = "";
        if (st.roll > 0) {
          var reg = st.roll <= 2 ? "Probable" : st.roll <= 4 ? "Plausible" : "Preposterous";
          rollTag = "   [ROLLED 1d6: " + st.roll + " · " + reg.toUpperCase() + "]";
        }
        ctx.fillText("SECOND PASS  ·  TROUT LOOKS IN   (" + meta.station + ")" + rollTag, padX, 574);

        ctx.fillStyle = "#1d596e";
        ctx.font = "700 38px Georgia, 'Times New Roman', serif";
        ctx.fillText("“" + meta.troutFork + "”", padX, 628);

        ctx.fillStyle = "#4d4942";
        ctx.font = "italic 20px Georgia, serif";
        ctx.fillText("Write even faces (2 · 4 · 6)  ·  Roll 1d6 once  ·  Mark chart under glass for Brook", padX, 694);
      }
      ctx.restore();
    }
  }

  // =========================================================================
  // REGISTER PORTHOLES #46–#50 ON window.PORTAL_SCENES
  // =========================================================================
  var DEFINITIONS = [
    {
      id: 46,
      station: "#46 · Steps",
      clue: "Solid brass letters G-O-B-B-L-E as stairs",
      reference: "Malle & Queneau: Zazie dans le métro (1960)",
      turkeyFork: "Sinking lead weights or step-ladder?",
      troutFork: "Free brass staircase or falling sign?",
      scionRule: "Verbal Slapstick (SCION 47)",
      defaultTool: "ballast",
      defaultRoll: 2,
      drawWorld: renderScene46
    },
    {
      id: 47,
      station: "#47 · Armada",
      clue: "100 upside-down canning jars lashed together",
      reference: "China Miéville: The Scar (2002) · Flood #13",
      turkeyFork: "Pickling-jar factory or air-pocket raft?",
      troutFork: "Bottle-cap opener or trade skiff?",
      scionRule: "Bricolage Armada (SCION 29)",
      defaultTool: "lamp",
      defaultRoll: 4,
      drawWorld: renderScene47
    },
    {
      id: 48,
      station: "#48 · Belfry",
      clue: "Flooded tin church steeple at waterline",
      reference: "TVA Old Butler Archive · Tourkey #20",
      turkeyFork: "Dry roosting roof or lightning rod?",
      troutFork: "Clanging bell-clapper or weathervane?",
      scionRule: "Waterline Acoustic Split (SCION 44)",
      defaultTool: "ballast",
      defaultRoll: 6,
      drawWorld: renderScene48
    },
    {
      id: 49,
      station: "#49 · Corner",
      clue: "Submerged red-green stoplight & Trout Cop",
      reference: "TVA Old Butler Street Grid · Tourkey #11",
      turkeyFork: "Christmas lights already or stop sign?",
      troutFork: "Red-light runner or yellow taxicab?",
      scionRule: "Civic Law Clinamen (40 PSI)",
      defaultTool: "lamp",
      defaultRoll: 4,
      drawWorld: renderScene49
    },
    {
      id: 50,
      station: "#50 · Riffle",
      clue: "Three-inch Snail Darter blocking DAM sign",
      reference: "1973 Tellico River Archive · Tourkey #05",
      turkeyFork: "Harmless minnow or federal roadblock?",
      troutFork: "Mini bulldozer or illegal dredge?",
      scionRule: "Scale Reversal (SCION 33)",
      defaultTool: "ballast",
      defaultRoll: 2,
      drawWorld: renderScene50
    }
  ];

  for (var di = 0; di < DEFINITIONS.length; di++) {
    (function (def) {
      window.PORTAL_SCENES[def.id] = {
        id: def.id,
        station: def.station,
        clue: def.clue,
        reference: def.reference,
        turkeyFork: def.turkeyFork,
        troutFork: def.troutFork,
        scionRule: def.scionRule,
        defaultTool: def.defaultTool,
        render: function (ctx, W, H, t, state) {
          var w = W || 1280;
          var h = H || 720;
          var st = resolveState(def, t, state);

          ctx.save();
          if (w !== 1280 || h !== 720) {
            ctx.scale(w / 1280, h / 720);
          }

          // Clear base
          ctx.fillStyle = "#112124";
          ctx.fillRect(0, 0, 1280, 720);

          // Clip outside world to porthole aperture (cx=640, cy=255, r_glass=185)
          ctx.save();
          ctx.beginPath();
          ctx.arc(CX, CY, R_GLASS + 2, 0, TAU);
          ctx.clip();
          def.drawWorld(ctx, st);
          ctx.restore();

          // Draw Setup A Bread-Tin Cockpit, Brass Rim & Optional Caption Strip
          drawBreadTinCockpit(ctx, def, st);

          ctx.restore();
        }
      };
    })(DEFINITIONS[di]);
  }
})();
