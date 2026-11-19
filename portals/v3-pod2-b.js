/* ============================================================================
 * Turkey Sub · V3 Branching Video-to-Game + PAELEO Oulipo Pod 2B (#18–#22)
 * File: portals/v3-pod2-b.js
 *
 * Registers window.PORTAL_V3_GAMES[18..22] (18.0s = 432 frames @ 24fps showcase
 * + 60fps interactive 2-stage PlayStation ✕ · ○ · △ · □ -> Probable · Plausible
 * · Preposterous 17-node state machine):
 *   - #18 · Vent  : perec-stage     · 99 Ways Subjective × S02 Lotte Reiniger
 *   - #19 · Bilge : duchamp-optic   · Bang Bang × S09 Takeo Igarashi ARAP
 *   - #20 · Dome  : perec-stage     · La Belle Hortense × S18 Cartoon Saloon
 *   - #21 · Fwd   : perec-stage     · Renzo e Luciana × S19 MohoRig
 *   - #22 · Trim  : queneau-rostrum · Exercices de style Animated × S14 Pose2Pose
 *
 * STRICT PAELEO BLIND-MODE LAW:
 *   Emits ZERO ctx.fillText / ctx.strokeText calls anywhere in scene art; all
 *   diegetic prop markings (12:00 clock, 14.7 PSI, 10·10·10 scorecards, 50-LB
 *   stamp, bus destination rollers, stop-signs, barcodes) are 100% pure vector!
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;

  function getStage() {
    return (root && root.SCION_STAGE) || (typeof require === "function" ? require("./scion-stage.js") : null);
  }

  function getBG() {
    return (root && root.BRANCH_GAME) || (typeof require === "function" ? require("./branch-game-engine.js") : null);
  }

  // Kick off async real-plate preloading for #18..#22 immediately on load
  var _bootS = getStage();
  if (_bootS && typeof _bootS.preloadPortalPlates === "function") {
    _bootS.preloadPortalPlates([18, 19, 20, 21, 22]);
  }

  // ---------- Pure Math, Cutout, Puppet & Pure-Vector Prop Helpers ----------

  function clamp(v, a, b) {
    return v < a ? a : (v > b ? b : v);
  }

  function lerp(a, b, u) {
    return a + (b - a) * u;
  }

  function easeOutCubic(u) {
    var x = clamp(u, 0, 1);
    return 1 - Math.pow(1 - x, 3);
  }

  function easeOutBack(u) {
    var x = clamp(u, 0, 1);
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  function stemEnter(resolved, dur) {
    return easeOutCubic(clamp((resolved.stemT || 0) / (dur || 0.75), 0, 1));
  }

  function outEnter(resolved, dur) {
    return easeOutBack(clamp((resolved.outcomeT || 0) / (dur || 0.82), 0, 1));
  }

  function outSmooth(resolved, dur) {
    return easeOutCubic(clamp((resolved.outcomeT || 0) / (dur || 0.75), 0, 1));
  }

  // Normalized [0..1] source crop wrapper around S.drawScissorCutout
  function drawPlateFrac(ctx, S, img, fx, fy, fw, fh, dx, dy, dw, dh, polyPts, opts) {
    if (!S) return;
    var iw = (img && img.complete && img.naturalWidth > 0) ? img.naturalWidth : 640;
    var ih = (img && img.complete && img.naturalHeight > 0) ? img.naturalHeight : 640;
    S.drawScissorCutout(
      ctx,
      img,
      fx * iw,
      fy * ih,
      fw * iw,
      fh * ih,
      dx,
      dy,
      dw,
      dh,
      polyPts,
      opts
    );
  }

  function limbQuad(x0, y0, x1, y1, w0, w1) {
    var dx = x1 - x0;
    var dy = y1 - y0;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len;
    var ny = dx / len;
    var ex = (dx / len) * (w0 * 0.32);
    var ey = (dy / len) * (w0 * 0.32);
    return [
      [x0 - ex + nx * w0, y0 - ey + ny * w0],
      [x1 + ex + nx * w1, y1 + ey + ny * w1],
      [x1 + ex - nx * w1, y1 + ey - ny * w1],
      [x0 - ex - nx * w0, y0 - ey - ny * w0]
    ];
  }

  function drawIKLimb(ctx, S, x0, y0, l1, l2, tx, ty, bendDir, opts) {
    var cfg = opts || {};
    var ik = S.solveIK2(x0, y0, l1, l2, tx, ty, bendDir);
    var w0 = cfg.w0 || 10.5;
    var w1 = cfg.w1 || 8.0;
    var w2 = cfg.w2 || 6.0;
    S.drawCardboardPuppetPiece(ctx, limbQuad(ik.x0, ik.y0, ik.jx, ik.jy, w0, w1), {
      tone: cfg.upperTone || "#7e7d78",
      ribs: cfg.ribs != null ? cfg.ribs : 2,
      shadow: cfg.shadow !== false
    });
    S.drawCardboardPuppetPiece(ctx, limbQuad(ik.jx, ik.jy, ik.ex, ik.ey, w1, w2), {
      tone: cfg.lowerTone || "#9d9a92",
      ribs: cfg.ribs != null ? cfg.ribs : 2,
      shadow: cfg.shadow !== false,
      pins: [
        { x: ik.x0, y: ik.y0, r: cfg.pinR || 4.0, metal: cfg.metal || "brass" },
        { x: ik.jx, y: ik.jy, r: cfg.pinR || 3.8, metal: "silver" }
      ]
    });
    return ik;
  }

  function starPolygon(cx, cy, rOuter, rInner, points, rot) {
    var pts = [];
    var n = (points || 5) * 2;
    var a0 = rot || -Math.PI * 0.5;
    for (var i = 0; i < n; i++) {
      var r = (i % 2 === 0) ? rOuter : rInner;
      var a = a0 + (i / n) * TAU;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return pts;
  }

  // Pure-vector 7-segment numeric display (ZERO fillText / strokeText!)
  var SEG7 = {
    "0": [1, 1, 1, 1, 1, 1, 0],
    "1": [0, 1, 1, 0, 0, 0, 0],
    "2": [1, 1, 0, 1, 1, 0, 1],
    "3": [1, 1, 1, 1, 0, 0, 1],
    "4": [0, 1, 1, 0, 0, 1, 1],
    "5": [1, 0, 1, 1, 0, 1, 1],
    "6": [1, 0, 1, 1, 1, 1, 1],
    "7": [1, 1, 1, 0, 0, 0, 0],
    "8": [1, 1, 1, 1, 1, 1, 1],
    "9": [1, 1, 1, 1, 0, 1, 1]
  };

  function drawVectorDigit(ctx, ch, x, y, w, h, col, lw) {
    var mask = SEG7[String(ch)];
    ctx.save();
    ctx.strokeStyle = col || "#34d399";
    ctx.fillStyle = col || "#34d399";
    ctx.lineWidth = lw || 3.0;
    ctx.lineCap = "round";
    if (ch === ":") {
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y + h * 0.30, (lw || 3) * 0.65, 0, TAU);
      ctx.arc(x + w * 0.5, y + h * 0.70, (lw || 3) * 0.65, 0, TAU);
      ctx.fill();
      ctx.restore();
      return;
    }
    if (ch === ".") {
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y + h * 0.92, (lw || 3) * 0.7, 0, TAU);
      ctx.fill();
      ctx.restore();
      return;
    }
    if (String(ch) === "1") {
      ctx.beginPath();
      ctx.moveTo(x + w * 0.55, y + 2);
      ctx.lineTo(x + w * 0.55, y + h - 2);
      ctx.moveTo(x + w * 0.22, y + h * 0.22);
      ctx.lineTo(x + w * 0.55, y + 2);
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (!mask) {
      ctx.restore();
      return;
    }
    var m = 2;
    var hm = h * 0.5;
    var segs = [
      [x + m, y, x + w - m, y],
      [x + w, y + m, x + w, y + hm - m],
      [x + w, y + hm + m, x + w, y + h - m],
      [x + m, y + h, x + w - m, y + h],
      [x, y + hm + m, x, y + h - m],
      [x, y + m, x, y + hm - m],
      [x + m, y + hm, x + w - m, y + hm]
    ];
    ctx.beginPath();
    for (var i = 0; i < 7; i++) {
      if (mask[i]) {
        ctx.moveTo(segs[i][0], segs[i][1]);
        ctx.lineTo(segs[i][2], segs[i][3]);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawVectorReadout(ctx, str, cx, cy, digitW, digitH, col, lw) {
    var chars = String(str || "");
    var widths = [];
    var totalW = 0;
    for (var j = 0; j < chars.length; j++) {
      var cj = chars.charAt(j);
      var wj = (cj === ":" || cj === ".") ? digitW * 0.42 : (cj === "1" ? digitW * 0.56 : digitW);
      widths.push(wj);
      totalW += wj + (j < chars.length - 1 ? 6 : 0);
    }
    var sx = cx - totalW * 0.5;
    var sy = cy - digitH * 0.5;
    for (var i = 0; i < chars.length; i++) {
      var c = chars.charAt(i);
      var w = widths[i];
      drawVectorDigit(ctx, c, sx, sy, w, digitH, col, lw);
      sx += w + 6;
    }
  }

  function drawMusicNote(ctx, x, y, scale, col) {
    var s = scale || 1.0;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = col || "#fbfaf5";
    ctx.strokeStyle = col || "#fbfaf5";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(-6, 8, 6.5, 4.8, -0.35, 0, TAU);
    ctx.ellipse(10, 4, 6.5, 4.8, -0.35, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-1, 6);
    ctx.lineTo(-1, -14);
    ctx.lineTo(15, -18);
    ctx.lineTo(15, 2);
    ctx.stroke();
    ctx.restore();
  }

  // Articulated 2-bone IK Submarine Brass Scissor-Probe Tongs ([□] Square tool!)
  function drawBrassScissorProbe(ctx, S, BG, baseX, baseY, tipX, tipY, pinchAmt, t, opts) {
    var cfg = opts || {};
    var ik = S.solveIK2(baseX, baseY, cfg.l1 || 165, cfg.l2 || 165, tipX, tipY, cfg.bend || -1);
    S.drawCardboardPuppetPiece(ctx, limbQuad(baseX, baseY, ik.jx, ik.jy, 13, 10), {
      tone: "#a8792c",
      ribs: 3
    });
    S.drawCardboardPuppetPiece(ctx, limbQuad(ik.jx, ik.jy, ik.ex, ik.ey, 10, 8), {
      tone: "#d4a44c",
      ribs: 3
    });
    S.drawReinigerFiligreeHinge(ctx, baseX, baseY, 7.5, { metal: "brass" });
    S.drawReinigerFiligreeHinge(ctx, ik.jx, ik.jy, 6.8, { metal: "brass" });

    var ang = Math.atan2(ik.ey - ik.jy, ik.ex - ik.jx);
    var jawOpen = lerp(0.48, 0.08, clamp(pinchAmt == null ? 0.7 : pinchAmt, 0, 1));
    ctx.save();
    ctx.translate(ik.ex, ik.ey);
    ctx.rotate(ang);
    for (var side = -1; side <= 1; side += 2) {
      ctx.save();
      ctx.rotate(side * jawOpen);
      S.drawCardboardPuppetPiece(ctx, [[-4, -4 * side], [34, -12 * side], [44, -3 * side], [28, 2 * side], [-4, 2 * side]], {
        tone: "#e6be6a",
        ribs: 1,
        shadow: false
      });
      ctx.restore();
    }
    S.drawSplitPin(ctx, 0, 0, 4.6, { metal: "silver" });
    ctx.restore();

    if (BG && cfg.sparks !== false) {
      BG.drawDeterministicParticles(ctx, "brass_sparks", ik.ex, ik.ey, (t % 0.9), {
        count: 10,
        seed: tipX * 0.17 + tipY * 0.31,
        loop: true
      });
    }
    return ik;
  }

  // Crimson Ballast Valve Nozzle & Bubble Jet ([○] Circle tool!)
  function drawBallastJet(ctx, S, BG, x0, y0, x1, y1, strength, t, opts) {
    var cfg = opts || {};
    var str = clamp(strength == null ? 1 : strength, 0, 1.5);
    if (str <= 0.02) return;
    ctx.save();
    var g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0.0, "rgba(212, 42, 30, " + (0.44 * str).toFixed(3) + ")");
    g.addColorStop(0.55, "rgba(248, 113, 113, " + (0.24 * str).toFixed(3) + ")");
    g.addColorStop(1.0, "rgba(186, 238, 240, 0)");
    ctx.fillStyle = g;
    var dx = x1 - x0;
    var dy = y1 - y0;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len;
    var ny = dx / len;
    ctx.beginPath();
    ctx.moveTo(x0 + nx * 14, y0 + ny * 14);
    ctx.lineTo(x1 + nx * (cfg.spread || 58), y1 + ny * (cfg.spread || 58));
    ctx.lineTo(x1 - nx * (cfg.spread || 58), y1 - ny * (cfg.spread || 58));
    ctx.lineTo(x0 - nx * 14, y0 - ny * 14);
    ctx.closePath();
    ctx.fill();

    var nBub = cfg.count || 14;
    for (var i = 0; i < nBub; i++) {
      var u = ((t * (cfg.speed || 0.85) + i / nBub) % 1 + 1) % 1;
      var lat = Math.sin(t * 4.5 + i * 2.1) * lerp(8, cfg.spread || 48, u);
      var bx = lerp(x0, x1, u) + nx * lat;
      var by = lerp(y0, y1, u) + ny * lat;
      var br = (4.5 + (i % 4) * 2.2) * (0.65 + 0.5 * (1 - u)) * str;
      ctx.globalAlpha = Math.sin(u * Math.PI) * 0.86;
      ctx.fillStyle = "#fbfaf5";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(bx, by, br + 1.4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = (i % 3 === 0) ? "rgba(252, 165, 165, 0.82)" : "rgba(182, 238, 240, 0.80)";
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // Expressive Corner Turkey Witness with Bespoke Props
  function drawExpressiveTurkey(ctx, S, x, y, scale, t, propKind) {
    var tx = x || 124;
    var ty = y || 498;
    var sc = scale || 1.0;
    ctx.save();
    if (propKind === "jump") {
      ty -= 36 + Math.abs(Math.sin(t * 7.5)) * 22;
    } else if (propKind === "sink") {
      ty += 34;
    } else if (propKind === "bow") {
      ctx.translate(tx, ty);
      ctx.rotate(0.24 + Math.sin(t * 2.8) * 0.06);
      ctx.translate(-tx, -ty);
    }
    S.drawTurkeyCutawayBadge(ctx, tx, ty, sc, t, { dispatch: propKind === "no_wings" ? 0.9 : 0.45 });

    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(sc, sc);

    if (propKind === "eyepatch") {
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(-28, -14);
      ctx.lineTo(18, -2);
      ctx.stroke();
      ctx.fillStyle = "#14110d";
      ctx.beginPath();
      ctx.arc(-2, -6, 8.5, 0, TAU);
      ctx.fill();
    } else if (propKind === "jump") {
      ctx.strokeStyle = "#d42a1e";
      ctx.lineWidth = 3.0;
      for (var k = -1; k <= 1; k++) {
        ctx.beginPath();
        ctx.moveTo(k * 16, -68);
        ctx.lineTo(k * 22, -88);
        ctx.stroke();
      }
    } else if (propKind === "map") {
      S.drawCutoutPaperEdge(ctx, [[22, -8], [76, -18], [82, 28], [26, 36]], "#f5e8c7", "#14110d", { paperRim: 2.2 });
      ctx.strokeStyle = "#d42a1e";
      ctx.lineWidth = 2.0;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(32, 22);
      ctx.quadraticCurveTo(52, -2, 68, 8);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (propKind === "lever") {
      var lAng = -0.35 + Math.sin(t * 8.0) * 0.28;
      ctx.save();
      ctx.translate(46, 32);
      ctx.rotate(lAng);
      S.drawCardboardPuppetPiece(ctx, [[-4, 0], [4, 0], [4, -56], [-4, -56]], { tone: "#b88a44", shadow: false });
      ctx.fillStyle = "#d42a1e";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -60, 10, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (propKind === "shield") {
      S.drawCutoutPaperEdge(
        ctx,
        [[26, -38], [52, -44], [64, -12], [60, 28], [34, 38], [22, 6]],
        "#cbd5e1",
        "#14110d",
        { paperRim: 2.5 }
      );
      S.drawSplitPin(ctx, 44, -2, 4.5, { metal: "silver" });
    } else if (propKind === "valve") {
      ctx.save();
      ctx.translate(54, 6);
      ctx.rotate(t * 7.5);
      ctx.strokeStyle = "#d42a1e";
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, TAU);
      ctx.moveTo(-24, 0); ctx.lineTo(24, 0);
      ctx.moveTo(0, -24); ctx.lineTo(0, 24);
      ctx.stroke();
      S.drawSplitPin(ctx, 0, 0, 4.2, { metal: "brass" });
      ctx.restore();
    } else if (propKind === "no_wings") {
      var wag = Math.sin(t * 12.0) * 0.28;
      for (var ws = -1; ws <= 1; ws += 2) {
        ctx.save();
        ctx.rotate(ws * (0.55 + wag));
        S.drawCardboardPuppetPiece(ctx, [[-6, -24], [6, -24], [8, 28], [-8, 28]], { tone: "#7d583c", shadow: false });
        ctx.restore();
      }
    } else if (propKind === "crosseyed") {
      ctx.fillStyle = "#fbfaf5";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-8, -8, 9, 0, TAU);
      ctx.arc(10, -8, 9, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#14110d";
      ctx.beginPath();
      ctx.arc(-3, -8, 3.5, 0, TAU);
      ctx.arc(5, -8, 3.5, 0, TAU);
      ctx.fill();
    } else if (propKind === "crown") {
      S.drawCutoutPaperEdge(
        ctx,
        [[-22, -46], [-26, -72], [-10, -58], [0, -78], [10, -58], [26, -72], [22, -46]],
        "#f3c74b",
        "#14110d",
        { paperRim: 2.0 }
      );
    } else if (propKind === "cap_heart") {
      S.drawCutoutPaperEdge(ctx, [[18, -4], [52, -12], [56, 8], [16, 12]], "#1d3557", "#d4a44c", { paperRim: 2.0 });
    } else if (propKind === "shutter") {
      for (var sl = 0; sl < 5; sl++) {
        ctx.fillStyle = "#d4b982";
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 1.5;
        ctx.fillRect(-52, -56 + sl * 14, 104, 10);
        ctx.strokeRect(-52, -56 + sl * 14, 104, 10);
      }
    } else if (propKind === "salute") {
      S.drawCardboardPuppetPiece(ctx, [[58, -95], [68, -95], [68, 55], [58, 55]], { tone: "#b88a44", ribs: 2 });
      S.drawCardboardPuppetPiece(ctx, [[4, 4], [28, -24], [18, -32], [-4, -4]], { tone: "#7d583c", shadow: false });
    } else if (propKind === "straps") {
      for (var st = -1; st <= 1; st += 2) {
        ctx.strokeStyle = "#4a3019";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(st * 22, -110);
        ctx.lineTo(st * 22, -44);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(st * 22, -34, 10, 0, TAU);
        ctx.stroke();
      }
    } else if (propKind === "armchair") {
      S.drawCutoutPaperEdge(ctx, [[-62, 18], [62, 18], [56, 62], [-56, 62]], "#8f1d1d", "#14110d", { paperRim: 2.5 });
    } else if (propKind === "teacup") {
      ctx.save();
      ctx.translate(58, 12);
      ctx.rotate(0.55 + Math.sin(t * 9) * 0.18);
      S.drawCutoutPaperEdge(ctx, [[-22, 10], [22, 10], [16, 16], [-16, 16]], "#fbfaf5", "#1d596e", { paperRim: 1.5 });
      S.drawCutoutPaperEdge(ctx, [[-14, -10], [14, -10], [10, 10], [-10, 10]], "#fbfaf5", "#1d596e", { paperRim: 1.5 });
      ctx.fillStyle = "#b45309";
      ctx.beginPath();
      ctx.ellipse(18, -4, 10, 5, 0.4, 0, TAU);
      ctx.fill();
      ctx.restore();
    } else if (propKind === "disco") {
      var dj = Math.sin(t * 9.5) * 0.65;
      for (var dw = -1; dw <= 1; dw += 2) {
        ctx.save();
        ctx.translate(dw * 28, 4);
        ctx.rotate(dw * (-0.7 + dj));
        S.drawCardboardPuppetPiece(ctx, [[-5, 0], [5, 0], [8, -44], [-8, -44]], { tone: "#7d583c", shadow: false });
        ctx.restore();
      }
    }
    ctx.restore();
    ctx.restore();
  }

  // Subtle pushed-through antique brass porthole corner arcs & rivets
  function drawCornerPortholeRim(ctx, W, H, S) {
    if (!S) return;
    var cx = W * 0.5;
    var cy = 320;
    var rInner = 696;
    var rOuter = 752;
    ctx.save();
    var bGrad = ctx.createLinearGradient(0, 0, W, H);
    bGrad.addColorStop(0.0, "#edd089");
    bGrad.addColorStop(0.5, "#b88632");
    bGrad.addColorStop(1.0, "#593c10");
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, TAU, false);
    ctx.arc(cx, cy, rInner, 0, TAU, true);
    ctx.fillStyle = bGrad;
    ctx.fill("evenodd");
    ctx.strokeStyle = "#171410";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(cx, cy, rInner, 0, TAU);
    ctx.stroke();

    var angles = [-Math.PI * 0.78, -Math.PI * 0.22, Math.PI * 0.22, Math.PI * 0.78];
    for (var i = 0; i < angles.length; i++) {
      var bx = cx + Math.cos(angles[i]) * 720;
      var by = cy + Math.sin(angles[i]) * 720;
      S.drawSplitPin(ctx, bx, by, 6.8, { metal: "brass" });
    }
    ctx.restore();
  }

  // ============================================================================
  // PORTHOLE #18 · Vent ("perec-stage")
  // 99 Ways Subjective × S02 Lotte Reiniger × p18.jpg + atlas-38.webp
  // ============================================================================

  function drawSceneBase18(ctx, W, H, resolved, plates, S, BG, opts) {
    var cfg = opts || {};
    var t = resolved.t;
    var aImg = plates.atlasImg;
    var pImg = plates.portholeImg;

    // Deep Plane: Star-and-crescent miniature stage crop from atlas-38.webp
    drawPlateFrac(
      ctx, S, aImg,
      0.08, 0.0, 0.82, 0.46,
      290 + Math.sin(t * 0.45) * 8, 86, 700, 255,
      [[0.04, 0.05], [0.96, 0.05], [0.94, 0.94], [0.06, 0.94]],
      { filter: cfg.atlasFilter || "sepia", haloWidth: 3.5, alpha: cfg.atlasAlpha != null ? cfg.atlasAlpha : 0.74 }
    );

    if (BG) {
      BG.drawWaterCaustics(ctx, W, H, t, { intensity: 0.16, topY: 82 });
    }

    // Foreground left & right creek rock/kelp cutouts from p18.jpg
    if (cfg.fgRocks !== false) {
      drawPlateFrac(
        ctx, S, pImg,
        0.16, 0.42, 0.16, 0.30,
        192, 428, 138, 182,
        [[0.08, 0.12], [0.66, 0.08], [0.94, 0.46], [0.94, 0.96], [0.06, 0.96]],
        { haloWidth: 4.0 }
      );
      drawPlateFrac(
        ctx, S, pImg,
        0.68, 0.45, 0.16, 0.28,
        952, 434, 138, 176,
        [[0.22, 0.08], [0.92, 0.12], [0.94, 0.96], [0.06, 0.96]],
        { haloWidth: 4.0 }
      );
    }
  }

  function drawClosedTrunk18(ctx, S, BG, pImg, cx, cy, t, opts) {
    var cfg = opts || {};
    drawPlateFrac(
      ctx, S, pImg,
      0.30, 0.30, 0.47, 0.36,
      cx - 215, cy - 145, 430, 310,
      [[0.04, 0.24], [0.18, 0.08], [0.82, 0.04], [0.97, 0.22], [0.95, 0.92], [0.46, 0.98], [0.04, 0.88]],
      { haloWidth: 5.5, filter: cfg.filter || "none", rot: cfg.rot || 0 }
    );
    S.drawReinigerFiligreeHinge(ctx, cx - 102, cy + 4, 8.2, { metal: "brass" });
    S.drawReinigerFiligreeHinge(ctx, cx + 124, cy - 6, 8.2, { metal: "brass" });

    // Peeling geometric vintage travel stickers on left flank (0 text!)
    S.drawCutoutPaperEdge(
      ctx,
      [[cx - 178, cy - 28], [cx - 134, cy - 36], [cx - 128, cy - 2], [cx - 172, cy + 6]],
      "#f3c74b",
      "#d42a1e",
      { paperRim: 1.8, shadow: false }
    );
    S.drawCutoutPaperEdge(
      ctx,
      [[cx - 166, cy + 48], [cx - 126, cy + 42], [cx - 132, cy + 76]],
      "#0f8f80",
      "#14110d",
      { paperRim: 1.8, shadow: false }
    );

    if (cfg.starGlow !== false && BG) {
      BG.drawLanternHalo(ctx, cx + 42, cy - 40, cfg.starRadius || 78, {
        t: t,
        color: cfg.starColor || "#fbbf24",
        intensity: cfg.starIntensity != null ? cfg.starIntensity : 0.72
      });
    }
  }

  function drawHingedTrunk18(ctx, S, pImg, cx, cy, lidAngle, opts) {
    var cfg = opts || {};
    var splitDx = cfg.upperDx || 0;
    var splitDy = cfg.upperDy || 0;

    // Dark interior cavity
    ctx.fillStyle = cfg.cavityColor || "#12131a";
    ctx.fillRect(cx - 196, cy - 18, 392, 56);

    // Lower trunk box
    drawPlateFrac(
      ctx, S, pImg,
      0.30, 0.46, 0.47, 0.20,
      cx - 210, cy - 10, 420, 180,
      [[0.03, 0.06], [0.97, 0.06], [0.95, 0.94], [0.05, 0.94]],
      { haloWidth: 5.0, filter: cfg.filter || "none" }
    );

    if (cfg.drawInside) {
      cfg.drawInside(ctx);
    }

    // Hinged upper lid
    ctx.save();
    ctx.translate(cx - 195 + splitDx, cy - 8 + splitDy);
    ctx.rotate(lidAngle || 0);
    drawPlateFrac(
      ctx, S, pImg,
      0.30, 0.30, 0.47, 0.175,
      0, -118, 412, 122,
      [[0.02, 0.88], [0.14, 0.14], [0.86, 0.08], [0.98, 0.88]],
      { haloWidth: 4.5, filter: cfg.filter || "none" }
    );
    ctx.restore();
    S.drawReinigerFiligreeHinge(ctx, cx - 195 + splitDx, cy - 8 + splitDy, 9.0, { metal: "brass" });
  }

  function registerPortal18(BG) {
    BG.definePortalGame(18, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        S.drawBolasBackdrop(
          ctx, W, H,
          resolved.bolasStyle,
          18,
          resolved.t,
          { showCaptions: resolved.showCaptions, lamp: resolved.lampOn, ballast: resolved.ballastOn },
          { openX: 185, openY: 72, openW: 910, openH: 542, doors: true }
        );
      },
      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawCornerPortholeRim(ctx, W, H, S);
      },
      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawSceneBase18(ctx, W, H, resolved, plates, S, BG);
        BG.drawVolumetricBeam(ctx, 640, 622, 640, 355, { color: "#fde68a", spread: 165, intensity: 0.55, t: t });
        var cx = 640, cy = 386 + Math.sin(t * 1.6) * 3;
        drawClosedTrunk18(ctx, S, BG, plates.portholeImg, cx, cy, t, { starIntensity: 0.75 });
        var pulse = 1 + Math.sin(t * 4.0) * 0.06;
        var sPts = starPolygon(cx + 42, cy - 40, 54 * pulse, 23 * pulse, 5, -Math.PI * 0.5 + 0.06);
        ctx.strokeStyle = "#f7dd8c";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        for (var i = 0; i < sPts.length; i++) {
          if (i === 0) ctx.moveTo(sPts[i][0], sPts[i][1]);
          else ctx.lineTo(sPts[i][0], sPts[i][1]);
        }
        ctx.closePath();
        ctx.stroke();
      },
      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.7);
          drawSceneBase18(ctx, W, H, resolved, plates, S, BG);
          var cx = 640, cy = 386;
          drawClosedTrunk18(ctx, S, BG, plates.portholeImg, cx, cy, t, {
            starColor: "#60a5fa",
            starRadius: 135 * su,
            starIntensity: 1.25 * su
          });
          // Intense blue searchlight threading right through the 5-pointed star peephole!
          BG.drawVolumetricBeam(ctx, 640, 626, cx + 42, cy - 40, {
            color: "#3b82f6",
            coreColor: "#dbeafe",
            sourceRadius: 24,
            spread: 58,
            intensity: 1.35 * su,
            t: t
          });
          // Projected star-shaped shaft rising inside/above star peephole
          BG.drawVolumetricBeam(ctx, cx + 42, cy - 40, cx + 10, 108, {
            color: "#93c5fd",
            coreColor: "#ffffff",
            sourceRadius: 28,
            spread: 130 * su,
            intensity: 1.15 * su,
            t: t
          });
          var sPts = starPolygon(cx + 42, cy - 40, 62, 26, 5, -Math.PI * 0.5 + Math.sin(t * 5) * 0.05);
          S.drawCutoutPaperEdge(ctx, sPts, "rgba(191, 219, 254, 0.55)", "#2563eb", { paperRim: 2.5, shadow: false });
          BG.drawDeterministicParticles(ctx, "kintsugi", cx + 42, cy - 40, t, { count: 16, loop: true, color: "#93c5fd" });
        },
        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.75);
          drawSceneBase18(ctx, W, H, resolved, plates, S, BG);
          var cx = 640, cy = 388;
          var rattle = -0.22 * su - Math.abs(Math.sin(t * 14.0)) * 0.08 * su;
          drawBallastJet(ctx, S, BG, 855, 585, cx + 145, cy - 18, su, t, { spread: 54, count: 16 });
          drawHingedTrunk18(ctx, S, plates.portholeImg, cx, cy, rattle, {
            drawInside: function () {
              BG.drawDeterministicParticles(ctx, "bubbles", cx + 80, cy - 16, t, { count: 14, loop: true });
            }
          });
        },
        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.85);
          drawSceneBase18(ctx, W, H, resolved, plates, S, BG);
          var cx = 640, cy = 386;
          drawClosedTrunk18(ctx, S, BG, plates.portholeImg, cx, cy, t, {});
          var sx = lerp(250, cx - 168, su);
          var sy = lerp(548, cy + 16, su);
          BG.drawSnailSilverTrail(ctx, 250, 548, cx - 168, cy + 16, su, t, { arc: 28 });
          // Fresh cream & emerald forwarding baggage tag flapping on leather handle
          if (su > 0.45) {
            ctx.save();
            ctx.translate(cx - 185, cy + 28);
            ctx.rotate(0.22 + Math.sin(t * 7.5) * 0.14);
            S.drawCutoutPaperEdge(ctx, [[-26, 0], [26, 0], [32, 58], [-22, 58]], "#fbfaf5", "#0f8f80", { paperRim: 2.5 });
            ctx.fillStyle = "#0f8f80";
            ctx.beginPath();
            ctx.arc(4, 34, 10, 0, TAU);
            ctx.fill();
            S.drawSplitPin(ctx, 0, 8, 3.6, { metal: "brass" });
            ctx.restore();
          }
          S.drawMailSnail(ctx, sx, sy, 1.24, t, { postcard: true, trail: false });
        },
        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.72);
          drawSceneBase18(ctx, W, H, resolved, plates, S, BG);
          var cx = 640, cy = 386;
          drawClosedTrunk18(ctx, S, BG, plates.portholeImg, cx, cy, t, {});
          // Both front brass latches flipped upward 180 deg!
          var flipAng = -Math.PI * 0.92 * su;
          var latchXs = [cx - 48, cx + 104];
          for (var li = 0; li < 2; li++) {
            ctx.save();
            ctx.translate(latchXs[li], cy + 8);
            ctx.rotate(flipAng);
            S.drawCardboardPuppetPiece(ctx, [[-11, 0], [11, 0], [9, 36], [-9, 36]], {
              tone: "#e2b254",
              pin: { x: 0, y: 0, r: 4.2, metal: "brass" }
            });
            ctx.restore();
          }
          var targetX = lerp(980, cx + 104, su);
          var targetY = lerp(560, cy + 12, su);
          drawBrassScissorProbe(ctx, S, BG, 1070, 608, targetX, targetY, su, t, { bend: -1 });
        }
      },
      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Sunken Pirate Gold Doubloon Chest + Skeleton Parrot + Eyepatch Turkey!
            var t = resolved.t;
            var u = outEnter(resolved, 0.8);
            drawSceneBase18(ctx, W, H, resolved, plates, S, BG);
            var cx = 655, cy = 392;
            BG.drawVolumetricBeam(ctx, 640, 626, cx + 20, cy - 35, { color: "#2563eb", spread: 90, intensity: 1.1, t: t });
            // Golden reflected doubloon shafts bouncing back out!
            BG.drawVolumetricBeam(ctx, cx + 20, cy - 35, 390, 120, { color: "#fbbf24", spread: 95, intensity: 1.2 * u, t: t });
            BG.drawVolumetricBeam(ctx, cx + 20, cy - 35, 890, 125, { color: "#f59e0b", spread: 95, intensity: 1.15 * u, t: t });

            drawHingedTrunk18(ctx, S, plates.portholeImg, cx, cy, -0.78 * clamp(u, 0, 1.1), {
              drawInside: function () {
                for (var gi = 0; gi < 20; gi++) {
                  var gx = cx - 155 + gi * 16;
                  var gy = cy - 16 - Math.sin((gi / 19) * Math.PI) * 34 + (gi % 3) * 4;
                  ctx.fillStyle = (gi % 5 === 0) ? "#d42a1e" : "#fbbf24";
                  ctx.strokeStyle = "#14110d";
                  ctx.lineWidth = 1.8;
                  ctx.beginPath();
                  ctx.arc(gx, gy, 11.5, 0, TAU);
                  ctx.fill();
                  ctx.stroke();
                }
              }
            });

            // Jointed Cardboard Skeleton Parrot perched on open trunk rim!
            var px = cx + 92;
            var py = cy - 118 * clamp(u, 0, 1);
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(Math.sin(t * 5.2) * 0.10);
            // Parrot tail & ribcage body
            S.drawCutoutPaperEdge(ctx, [[-10, 26], [8, 26], [22, 68], [-4, 64]], "#d42a1e", "#14110d", { paperRim: 2 });
            S.drawCardboardPuppetPiece(ctx, [[-22, -16], [20, -16], [24, 30], [-18, 30]], { tone: "#e5e2d9", ribs: 4 });
            // Flapping split-pin skeleton wing
            ctx.save();
            ctx.rotate(-0.4 + Math.sin(t * 9.5) * 0.45);
            S.drawCardboardPuppetPiece(ctx, [[0, -6], [48, -28], [40, 8], [0, 10]], {
              tone: "#cbd5e1",
              ribs: 3,
              pin: { x: 0, y: 0, r: 3.8, metal: "brass" }
            });
            ctx.restore();
            // Parrot skull + hooked golden beak + tiny bicorne hat
            S.drawCutoutPaperEdge(ctx, [[-18, -42], [16, -42], [16, -14], [-18, -14]], "#fbfaf5", "#14110d", { paperRim: 2 });
            S.drawCutoutPaperEdge(ctx, [[-16, -36], [-42, -24], [-16, -16]], "#f59e0b", "#14110d", { paperRim: 2 });
            ctx.fillStyle = "#14110d";
            ctx.beginPath(); ctx.arc(-6, -28, 4.5, 0, TAU); ctx.fill();
            S.drawCutoutPaperEdge(ctx, [[-28, -42], [0, -64], [28, -42]], "#14110d", "#d4a44c", { paperRim: 2 });
            ctx.restore();

            drawExpressiveTurkey(ctx, S, 134, 498, 1.04, t, "eyepatch");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Shadow Puppet Show Inside Trunk: backlit star theater + fin-rabbit + Snail cranking music box!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.75);
            drawSceneBase18(ctx, W, H, resolved, plates, S, BG);
            var cx = 560, cy = 388;
            BG.drawVolumetricBeam(ctx, 640, 626, cx + 36, cy - 38, { color: "#60a5fa", spread: 135, intensity: 1.1, t: t });
            drawClosedTrunk18(ctx, S, BG, plates.portholeImg, cx, cy, t, {
              starColor: "#fef08a",
              starRadius: 165,
              starIntensity: 1.4
            });

            // Enlarged warm parchment shadow-theater screen framed over star window!
            var sx = cx + 38, sy = cy - 42;
            var bigStar = starPolygon(sx, sy, 98 * u, 48 * u, 5, -Math.PI * 0.5);
            S.drawCutoutPaperEdge(ctx, bigStar, "#fef3c7", "#14110d", { paperRim: 4.0 });

            // Silhouette Lotte Reiniger shadow-rabbit wiggling ears inside the star screen!
            ctx.save();
            ctx.translate(sx, sy + 12);
            ctx.fillStyle = "#14110d";
            ctx.beginPath();
            ctx.ellipse(0, 8, 22, 16, 0, 0, TAU);
            ctx.arc(-6, -10, 13, 0, TAU);
            ctx.fill();
            for (var ear = -1; ear <= 1; ear += 2) {
              ctx.save();
              ctx.translate(-6 + ear * 4, -18);
              ctx.rotate(ear * 0.25 + Math.sin(t * 8.5 + ear) * 0.28);
              ctx.beginPath();
              ctx.ellipse(0, -18, 5.5, 19, 0, 0, TAU);
              ctx.fill();
              ctx.restore();
            }
            ctx.restore();

            // Brook Trout on right making shadow-puppet fin gestures!
            S.drawBrookTrout(ctx, 945, 365 + Math.sin(t * 2.5) * 6, 1.16, t, true);
            drawIKLimb(ctx, S, 895, 378, 42, 38, 825, 342 + Math.sin(t * 8.5) * 14, -1, {
              upperTone: "#6c7b67", lowerTone: "#b87458", w0: 8, w1: 6, w2: 5
            });

            // Mail Snail cranking a brass-pinned wooden music box + floating notes!
            var mbX = 335, mbY = 515;
            S.drawCardboardPuppetPiece(ctx, [[mbX - 34, mbY - 26], [mbX + 34, mbY - 26], [mbX + 34, mbY + 24], [mbX - 34, mbY + 24]], {
              tone: "#8c5a32",
              ribs: 2,
              pin: { x: mbX, y: mbY, r: 4.5, metal: "brass" }
            });
            ctx.strokeStyle = "#f3d184";
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.moveTo(mbX + 34, mbY);
            ctx.lineTo(mbX + 52, mbY + Math.sin(t * 7) * 14);
            ctx.stroke();
            S.drawMailSnail(ctx, 255, 526, 1.18, t, { postcard: false, trail: true });
            drawMusicNote(ctx, mbX - 10, mbY - 58 - ((t * 28) % 45), 0.9, "#fef08a");
            drawMusicNote(ctx, mbX + 26, mbY - 42 - (((t + 0.8) * 28) % 45), 0.85, "#6ee7b7");
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Trapped Pocket Constellation Escapes Trunk (7-star Big Dipper + Alien Saucer prism)
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase18(ctx, W, H, resolved, plates, S, BG, { atlasFilter: "cyan" });
            var cx = 640, cy = 435;
            BG.drawTractorRings(ctx, 640, 122, cx + 20, cy - 35, t, { spread: 165, rings: 6 });
            drawClosedTrunk18(ctx, S, BG, plates.portholeImg, cx, cy, t, { filter: "cyan", starColor: "#38bdf8", starRadius: 130 });

            // 7 Connected Glowing Stars in Big Dipper Constellation floating out of star peephole!
            var dipper = [
              [-145, -135], [-85, -155], [-28, -132], [28, -112],
              [42, -58], [118, -52], [136, -118]
            ];
            var pts = [];
            for (var i = 0; i < dipper.length; i++) {
              var sx = cx + dipper[i][0] * u + Math.sin(t * 2.4 + i) * 6;
              var sy = lerp(cy - 40, 325 + dipper[i][1], u) + Math.cos(t * 2.8 + i) * 5;
              pts.push([sx, sy]);
            }
            ctx.save();
            ctx.strokeStyle = "rgba(186, 230, 253, 0.92)";
            ctx.lineWidth = 2.8;
            ctx.setLineDash([7, 5]);
            ctx.beginPath();
            for (var k = 0; k < pts.length - 1; k++) {
              ctx.moveTo(pts[k][0], pts[k][1]);
              ctx.lineTo(pts[k + 1][0], pts[k + 1][1]);
            }
            ctx.moveTo(pts[3][0], pts[3][1]);
            ctx.lineTo(pts[6][0], pts[6][1]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            for (var si = 0; si < pts.length; si++) {
              BG.drawLanternHalo(ctx, pts[si][0], pts[si][1], 36, { t: t + si, color: "#38bdf8", intensity: 0.9 });
              var sp = starPolygon(pts[si][0], pts[si][1], 17, 7, 5, t * 1.4 + si);
              S.drawCutoutPaperEdge(ctx, sp, si % 2 === 0 ? "#fef08a" : "#7dd3fc", "#14110d", { paperRim: 2.0, shadow: false });
            }

            S.drawAlienSaucer(ctx, 640, 108, 1.22, t, cx, 310, { beam: false });
          }
        },
        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Booby-Trapped Corsair Spring Snakes + Jumping Startled Turkey!
            var t = resolved.t;
            var u = outEnter(resolved, 0.72);
            drawSceneBase18(ctx, W, H, resolved, plates, S, BG);
            var cx = 665, cy = 415;
            drawBallastJet(ctx, S, BG, 860, 590, cx + 90, cy - 10, 0.9, t, { spread: 64 });
            drawHingedTrunk18(ctx, S, plates.portholeImg, cx, cy, -0.68 * clamp(u, 0, 1.15), {});

            // 3 Polka-Dot Accordion-Paper Spring Snakes boinging out toward the glass!
            var snakeSpecs = [
              { x0: cx - 85, x1: 430, y1: 185, col: "#d42a1e", dot: "#fef08a", ph: 0 },
              { x0: cx,      x1: 645, y1: 145, col: "#0f8f80", dot: "#fbfaf5", ph: 1.2 },
              { x0: cx + 85, x1: 875, y1: 190, col: "#eab308", dot: "#d42a1e", ph: 2.4 }
            ];
            for (var s = 0; s < 3; s++) {
              var sn = snakeSpecs[s];
              var hx = lerp(sn.x0, sn.x1, clamp(u, 0, 1.08)) + Math.sin(t * 8.5 + sn.ph) * 18;
              var hy = lerp(cy - 18, sn.y1, clamp(u, 0, 1.08)) + Math.cos(t * 9.5 + sn.ph) * 14;
              var segs = 9;
              ctx.save();
              for (var j = 0; j < segs; j++) {
                var u0 = j / segs;
                var u1 = (j + 1) / segs;
                var zig0 = (j % 2 === 0 ? -1 : 1) * 18;
                var zig1 = ((j + 1) % 2 === 0 ? -1 : 1) * 18;
                var px0 = lerp(sn.x0, hx, u0) + (j === 0 ? 0 : zig0);
                var py0 = lerp(cy - 16, hy, u0);
                var px1 = lerp(sn.x0, hx, u1) + (j + 1 === segs ? 0 : zig1);
                var py1 = lerp(cy - 16, hy, u1);
                S.drawCardboardPuppetPiece(ctx, limbQuad(px0, py0, px1, py1, 13, 12), {
                  tone: sn.col,
                  ribs: 1,
                  shadow: false
                });
                ctx.fillStyle = sn.dot;
                ctx.beginPath();
                ctx.arc((px0 + px1) * 0.5, (py0 + py1) * 0.5, 4.2, 0, TAU);
                ctx.fill();
              }
              // Googly snake head + forked red ribbon tongue!
              S.drawCutoutPaperEdge(
                ctx,
                [[hx - 28, hy - 18], [hx + 28, hy - 22], [hx + 34, hy + 14], [hx - 24, hy + 18]],
                sn.col,
                "#14110d",
                { paperRim: 2.8 }
              );
              ctx.fillStyle = "#fbfaf5";
              ctx.strokeStyle = "#14110d";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(hx - 8, hy - 6, 8, 0, TAU);
              ctx.arc(hx + 10, hy - 6, 8, 0, TAU);
              ctx.fill();
              ctx.stroke();
              ctx.fillStyle = "#14110d";
              ctx.beginPath();
              ctx.arc(hx - 7, hy - 5, 3.5, 0, TAU);
              ctx.arc(hx + 11, hy - 5, 3.5, 0, TAU);
              ctx.fill();
              ctx.restore();
            }

            drawExpressiveTurkey(ctx, S, 136, 510, 1.05, t, "jump");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Magician Trout Sawed In Half! Upper & lower trunk halves slide apart!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase18(ctx, W, H, resolved, plates, S, BG);
            // Velvet stage curtain valance
            S.drawTornPaperFlat(ctx, 195, 76, 890, 48, { fill: "#7f1d1d", paperColor: "#fbfaf5", deckle: 5 });

            var lowX = lerp(640, 465, u);
            var lowY = 425;
            var topX = lerp(640, 775, u);
            var topY = lerp(315, 255, u) + Math.sin(t * 3.2) * 8;

            // Bubbles lifting top box
            drawBallastJet(ctx, S, BG, topX, 550, topX, topY + 40, 0.75, t, { spread: 65, count: 12 });

            // Lower trunk half + wiggling colorful trout tail-fins sticking out the right side!
            drawPlateFrac(
              ctx, S, plates.portholeImg,
              0.30, 0.45, 0.47, 0.21,
              lowX - 185, lowY - 68, 370, 155,
              [[0.03, 0.06], [0.97, 0.06], [0.95, 0.94], [0.05, 0.94]],
              { haloWidth: 5.0 }
            );
            ctx.save();
            ctx.translate(lowX + 188, lowY - 6);
            ctx.rotate(Math.sin(t * 9.5) * 0.28);
            S.drawCutoutPaperEdge(ctx, [[0, -14], [68, -46], [52, 0], [68, 46], [0, 14]], "#0f8f80", "#14110d", { paperRim: 3.0 });
            S.drawSplitPin(ctx, 6, 0, 4.2, { metal: "brass" });
            ctx.restore();

            // Upper trunk half floating sideways + Brook Trout in Silk Top Hat waving out the left!
            S.drawBrookTrout(ctx, topX - 145, topY + 12, 1.12, t, true);
            S.drawCutoutPaperEdge(
              ctx,
              [[topX - 232, topY - 12], [topX - 168, topY - 12], [topX - 176, topY - 58], [topX - 224, topY - 58]],
              "#14110d",
              "#f3c74b",
              { paperRim: 2.5 }
            );
            drawPlateFrac(
              ctx, S, plates.portholeImg,
              0.30, 0.30, 0.47, 0.18,
              topX - 165, topY - 64, 365, 132,
              [[0.03, 0.88], [0.15, 0.10], [0.85, 0.08], [0.97, 0.88]],
              { haloWidth: 5.0 }
            );

            // Mail Snail at bottom-right with shiny brass vaudeville cymbal!
            S.drawMailSnail(ctx, 965, 534, 1.22, t, { postcard: true, hasReply: true });
            S.drawCutoutPaperEdge(ctx, [[915, 495], [955, 482], [948, 502], [912, 512]], "#fbbf24", "#14110d", { paperRim: 2.0 });
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Bigger-On-The-Inside Nebula Cargo Hold + Figure-8 Flying Saucer!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase18(ctx, W, H, resolved, plates, S, BG, { atlasFilter: "cyan", atlasAlpha: 0.45 });
            var cx = 640, cy = 428;

            // Giant swirling purple-magenta spiral galaxy vortex yawning out of the open trunk!
            ctx.save();
            var gx = cx + 25, gy = 305;
            var ng = ctx.createRadialGradient(gx, gy, 12, gx, gy, 245 * u);
            ng.addColorStop(0.0, "rgba(253, 224, 71, 0.92)");
            ng.addColorStop(0.28, "rgba(192, 38, 211, 0.72)");
            ng.addColorStop(0.65, "rgba(76, 29, 149, 0.52)");
            ng.addColorStop(1.0, "rgba(15, 23, 42, 0)");
            ctx.fillStyle = ng;
            ctx.beginPath();
            ctx.ellipse(gx, gy, 265 * u, 165 * u, -0.12, 0, TAU);
            ctx.fill();

            for (var arm = 0; arm < 3; arm++) {
              ctx.strokeStyle = arm % 2 === 0 ? "rgba(232, 121, 249, 0.78)" : "rgba(56, 189, 248, 0.78)";
              ctx.lineWidth = 3.5;
              ctx.beginPath();
              for (var st = 0; st <= 28; st++) {
                var su2 = st / 28;
                var a = t * 1.8 + arm * (TAU / 3) + su2 * 4.6;
                var rx = su2 * 215 * u;
                var ry = su2 * 120 * u;
                var px = gx + Math.cos(a) * rx;
                var py = gy + Math.sin(a) * ry;
                if (st === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.stroke();
            }
            ctx.restore();

            drawHingedTrunk18(ctx, S, plates.portholeImg, cx, cy, -1.12 * u, { filter: "cyan", cavityColor: "#3b0764" });

            // Miniature 3-Eyed Alien Saucer flying a figure-eight right out of the trunk!
            var f8x = gx + Math.sin(t * 2.2) * 165 * u;
            var f8y = 235 + Math.sin(t * 4.4) * 58 * u;
            BG.drawSnailSilverTrail(ctx, gx, cy - 10, f8x, f8y, u, t, { color: "rgba(232, 121, 249, 0.75)", arc: 45 });
            S.drawAlienSaucer(ctx, f8x, f8y, 1.15, t, gx, cy, { beamSpread: 95 });
          }
        },
        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Overweight Lost Pirate Sea-Baggage: barnacles + skull port stamps + Turkey reading sub chart!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.75);
            drawSceneBase18(ctx, W, H, resolved, plates, S, BG);
            var cx = 665, cy = 390;
            drawClosedTrunk18(ctx, S, BG, plates.portholeImg, cx, cy, t, {});

            // Barnacle clusters encrusted along trunk base & rim
            var barnX = [-175, -135, -95, 65, 130, 168];
            for (var bi = 0; bi < barnX.length; bi++) {
              var bx = cx + barnX[bi];
              var by = cy + (bi % 2 === 0 ? 132 : -118);
              S.drawCutoutPaperEdge(ctx, [[bx - 16, by + 12], [bx - 8, by - 10], [bx + 8, by - 10], [bx + 16, by + 12]], "#cbd5c0", "#14110d", { paperRim: 1.8 });
            }

            // 3 Oversized Peeling Port-Stamp Cards showing Vector Skull-and-Crossbones (0 text!)
            var tagPositions = [
              { x: cx - 125, y: cy + 28, rot: -0.14, col: "#fef3c7" },
              { x: cx + 8,   y: cy + 56, rot: 0.11,  col: "#fee2e2" },
              { x: cx + 138, y: cy + 18, rot: -0.08, col: "#e0f2fe" }
            ];
            for (var ti = 0; ti < 3; ti++) {
              var tp = tagPositions[ti];
              ctx.save();
              ctx.translate(tp.x, tp.y);
              ctx.rotate(tp.rot + Math.sin(t * 2.5 + ti) * 0.04);
              ctx.scale(u, u);
              S.drawCutoutPaperEdge(ctx, [[-42, -32], [42, -32], [42, 32], [-42, 32]], tp.col, "#14110d", { paperRim: 2.5 });
              // Vector skull & crossed bones icon
              ctx.strokeStyle = "#14110d";
              ctx.lineWidth = 3.0;
              ctx.beginPath();
              ctx.moveTo(-22, 18); ctx.lineTo(22, -16);
              ctx.moveTo(-22, -16); ctx.lineTo(22, 18);
              ctx.stroke();
              ctx.fillStyle = "#fbfaf5";
              ctx.beginPath(); ctx.arc(0, -4, 13, 0, TAU); ctx.fill(); ctx.stroke();
              ctx.fillStyle = "#d42a1e";
              ctx.beginPath();
              ctx.arc(-5, -5, 3.0, 0, TAU);
              ctx.arc(5, -5, 3.0, 0, TAU);
              ctx.fill();
              ctx.restore();
            }

            S.drawMailSnail(ctx, cx - 180, cy - 88, 1.18, t, { postcard: true });
            drawExpressiveTurkey(ctx, S, 134, 498, 1.04, t, "map");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Traveling Vaudeville Wardrobe Delivery: boas, vests, mustache, Trout in gold cape, Snail in bow tie!
            var t = resolved.t;
            var u = outEnter(resolved, 0.8);
            drawSceneBase18(ctx, W, H, resolved, plates, S, BG);
            var cx = 560, cy = 418;
            drawHingedTrunk18(ctx, S, plates.portholeImg, cx, cy, -0.88 * clamp(u, 0, 1.1), {});

            // Floating pink feather boa + sequined diamond vest + curly mustache rising from trunk!
            ctx.save();
            ctx.strokeStyle = "#f472b6";
            ctx.lineWidth = 18;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(cx - 95, cy - 30);
            ctx.bezierCurveTo(cx - 140, cy - 150 * u, cx + 20, cy - 190 * u, cx + 85, cy - 125 * u);
            ctx.stroke();

            // Harlequin sequined vest cutout
            var vx = cx - 35, vy = cy - 145 * clamp(u, 0, 1) + Math.sin(t * 3.0) * 8;
            S.drawCutoutPaperEdge(
              ctx,
              [[vx - 38, vy - 34], [vx - 14, vy - 38], [vx, vy - 18], [vx + 14, vy - 38], [vx + 38, vy - 34], [vx + 32, vy + 34], [vx - 32, vy + 34]],
              "#9333ea",
              "#fbbf24",
              { paperRim: 2.5 }
            );
            // Handlebar mustache prop
            var mx = cx + 82, my = cy - 165 * clamp(u, 0, 1) + Math.cos(t * 3.4) * 7;
            S.drawCutoutPaperEdge(
              ctx,
              [[mx, my - 6], [mx + 28, my - 18], [mx + 44, my - 2], [mx + 22, my + 8], [mx, my + 2], [mx - 22, my + 8], [mx - 44, my - 2], [mx - 28, my - 18]],
              "#292524",
              "#14110d",
              { paperRim: 2.0 }
            );
            ctx.restore();

            // Brook Trout modeling a flowing Golden Cape!
            var tx = 925, ty = 355 + Math.sin(t * 2.6) * 8;
            S.drawCutoutPaperEdge(
              ctx,
              [[tx - 32, ty - 14], [tx + 96, ty - 42 + Math.sin(t * 5) * 12], [tx + 112, ty + 48], [tx - 18, ty + 18]],
              "#eab308",
              "#b45309",
              { paperRim: 3.0 }
            );
            S.drawBrookTrout(ctx, tx, ty, 1.18, t, true);

            // Mail Snail wearing an oversized crimson bow-tie!
            var snX = 835, snY = 528;
            S.drawMailSnail(ctx, snX, snY, 1.25, t, { postcard: false });
            S.drawCutoutPaperEdge(
              ctx,
              [[snX + 18, snY], [snX + 38, snY - 14], [snX + 38, snY + 14], [snX + 18, snY], [snX - 2, snY - 14], [snX - 2, snY + 14]],
              "#d42a1e",
              "#fbfaf5",
              { paperRim: 2.0 }
            );
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Dead-Letter Drop From Andromeda Sector: barcode scan + 3D star-map hologram + levitating trunk!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase18(ctx, W, H, resolved, plates, S, BG, { atlasFilter: "cyan" });

            var liftY = lerp(395, 315, u) + Math.sin(t * 2.8) * 11;
            var cx = 640;

            BG.drawTractorRings(ctx, 640, 108, cx, liftY + 60, t, { spread: 215, rings: 7 });
            BG.drawDeterministicParticles(ctx, "kintsugi", cx, liftY, t, { count: 22, loop: true, color: "#fb923c" });

            drawClosedTrunk18(ctx, S, BG, plates.portholeImg, cx, liftY, t, {
              rot: Math.sin(t * 1.9) * 0.06,
              starColor: "#fb923c",
              starRadius: 110
            });

            // Glowing Alien Barcode under left handle + Mail Snail scanning it!
            S.drawCutoutPaperEdge(ctx, [[cx - 205, liftY - 18], [cx - 145, liftY - 18], [cx - 145, liftY + 26], [cx - 205, liftY + 26]], "#0f172a", "#34d399", { paperRim: 2 });
            ctx.fillStyle = "#34d399";
            for (var b = 0; b < 7; b++) {
              ctx.fillRect(cx - 198 + b * 7, liftY - 12, (b % 2 === 0 ? 4 : 2), 32);
            }
            S.drawMailSnail(ctx, cx - 225, liftY + 42, 1.12, t, { postcard: true, hasAlienStamp: true });

            // 3D Wireframe Star-Map Hologram projected between trunk and Alien Saucer!
            BG.drawXRayOverlay(ctx, cx, 202, 230, 96, u, function (g, hx, hy, hw, hh) {
              g.strokeStyle = "#34d399";
              g.lineWidth = 1.8;
              g.beginPath();
              g.ellipse(hx, hy, hw * 0.38, hh * 0.34, Math.sin(t * 1.5) * 0.3, 0, TAU);
              g.moveTo(hx - hw * 0.35, hy); g.lineTo(hx + hw * 0.35, hy);
              g.stroke();
              for (var p = 0; p < 5; p++) {
                var a = t * 1.7 + p * 1.25;
                g.fillStyle = p === 2 ? "#fb923c" : "#fef08a";
                g.beginPath();
                g.arc(hx + Math.cos(a) * 58, hy + Math.sin(a) * 24, 4.5, 0, TAU);
                g.fill();
              }
            }, { t: t, borderColor: "#34d399" });

            S.drawAlienSaucer(ctx, 640, 94, 1.22, t, cx, liftY, { beam: false });
          }
        },
        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Rusty Padlock Snaps On Tongs + Turkey tugging lever!
            var t = resolved.t;
            var u = outEnter(resolved, 0.72);
            drawSceneBase18(ctx, W, H, resolved, plates, S, BG);
            var cx = 640, cy = 388;
            drawClosedTrunk18(ctx, S, BG, plates.portholeImg, cx, cy, t, {});

            var lockX = cx + 26 + Math.sin(t * 22.0) * 5;
            var lockY = cy + 24 + Math.cos(t * 19.0) * 4;
            drawBrassScissorProbe(ctx, S, BG, 1075, 610, lockX + 34, lockY + 8, 0.25, t, { bend: -1 });

            // Giant Grumpy Cast-Iron Skull Padlock chomping the tongs!
            ctx.save();
            ctx.translate(lockX, lockY);
            ctx.scale(clamp(u, 0.2, 1.15), clamp(u, 0.2, 1.15));
            // Thick iron shackle loop
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 14;
            ctx.beginPath();
            ctx.arc(0, -42, 32, Math.PI, 0);
            ctx.stroke();
            // Padlock upper skull plate
            S.drawCardboardPuppetPiece(ctx, [[-48, -42], [48, -42], [52, 8], [-52, 8]], {
              tone: "#64748b",
              ribs: 2
            });
            // Angry glowing eyes
            S.drawCutoutPaperEdge(ctx, [[-32, -26], [-8, -16], [-30, -6]], "#fbbf24", "#14110d", { paperRim: 1.5, shadow: false });
            S.drawCutoutPaperEdge(ctx, [[32, -26], [8, -16], [30, -6]], "#fbbf24", "#14110d", { paperRim: 1.5, shadow: false });
            // Chomping hinged lower iron jaw with jagged teeth!
            var chomp = Math.abs(Math.sin(t * 14.0)) * 0.28;
            ctx.save();
            ctx.translate(-36, 8);
            ctx.rotate(chomp);
            S.drawCardboardPuppetPiece(ctx, [[0, 0], [88, 0], [82, 32], [4, 32]], {
              tone: "#475569",
              pin: { x: 4, y: 4, r: 4.5, metal: "brass" }
            });
            ctx.fillStyle = "#fbfaf5";
            for (var th = 0; th < 4; th++) {
              ctx.beginPath();
              ctx.moveTo(16 + th * 18, 0);
              ctx.lineTo(25 + th * 18, -12);
              ctx.lineTo(34 + th * 18, 0);
              ctx.fill();
            }
            ctx.restore();
            ctx.restore();

            drawExpressiveTurkey(ctx, S, 134, 498, 1.04, t, "lever");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Pop-Up Bunny Ears Trick Box: bunny ears + spring daisies + kerchiefs + Trout wand + clapping Snail!
            var t = resolved.t;
            var u = outEnter(resolved, 0.78);
            drawSceneBase18(ctx, W, H, resolved, plates, S, BG);
            var cx = 560, cy = 420;
            drawHingedTrunk18(ctx, S, plates.portholeImg, cx, cy, -0.95 * clamp(u, 0, 1.12), {});

            // Giant Pop-Up White & Pink Paper Bunny Ears springing from center of trunk!
            var earY = cy - 30 - 95 * clamp(u, 0, 1.1);
            for (var es = -1; es <= 1; es += 2) {
              ctx.save();
              ctx.translate(cx + es * 26, earY);
              ctx.rotate(es * 0.22 + Math.sin(t * 6.5 + es) * 0.14);
              S.drawCutoutPaperEdge(ctx, [[-18, 35], [-22, -68], [0, -92], [22, -68], [18, 35]], "#fbfaf7", "#14110d", { paperRim: 3.0 });
              S.drawCutoutPaperEdge(ctx, [[-9, 25], [-11, -55], [0, -72], [11, -55], [9, 25]], "#f9a8d4", "#d42a1e", { paperRim: 1.2, shadow: false });
              S.drawSplitPin(ctx, 0, 26, 4.0, { metal: "silver" });
              ctx.restore();
            }

            // Spring-loaded paper daisies & silk kerchiefs!
            var flX = [cx - 115, cx - 65, cx + 72, cx + 122];
            var flCol = ["#fbbf24", "#f87171", "#34d399", "#60a5fa"];
            for (var fi = 0; fi < 4; fi++) {
              var fx = flX[fi] + Math.sin(t * 4.5 + fi) * 10;
              var fy = cy - 95 * clamp(u, 0, 1) - (fi % 2) * 32;
              ctx.strokeStyle = "#15803d";
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(cx + (fi - 1.5) * 35, cy - 16);
              ctx.quadraticCurveTo(fx - 15, (cy + fy) * 0.5, fx, fy);
              ctx.stroke();
              var flPts = starPolygon(fx, fy, 24, 11, 7, t * 2 + fi);
              S.drawCutoutPaperEdge(ctx, flPts, flCol[fi], "#14110d", { paperRim: 2.0 });
              ctx.fillStyle = "#fbfaf5";
              ctx.beginPath(); ctx.arc(fx, fy, 7, 0, TAU); ctx.fill();
            }

            // Magician Brook Trout waving black-and-white wand + clapping Mail Snail!
            S.drawBrookTrout(ctx, 935, 368, 1.15, t, true);
            ctx.save();
            ctx.translate(868, 378);
            ctx.rotate(-0.6 + Math.sin(t * 8.0) * 0.35);
            S.drawCutoutPaperEdge(ctx, [[0, -4], [-96, -4], [-96, 4], [0, 4]], "#14110d", "#fbfaf5", { paperRim: 1.5 });
            ctx.fillStyle = "#fbfaf5";
            ctx.fillRect(-96, -4, 18, 8);
            ctx.restore();

            S.drawMailSnail(ctx, 885, 532, 1.2, t, { postcard: false });
            BG.drawDeterministicParticles(ctx, "confetti", cx, earY - 20, t, { count: 18, loop: true });
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Unlatched Starlight Singularity Escape: Saturn rings, comets & moons swirling around Alien Saucer!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase18(ctx, W, H, resolved, plates, S, BG, { atlasFilter: "cyan" });
            var cx = 640, cy = 445;

            drawHingedTrunk18(ctx, S, plates.portholeImg, cx, cy, -1.08 * u, { filter: "cyan" });
            BG.drawLanternHalo(ctx, cx, cy - 28, 185 * u, { t: t, color: "#f59e0b", coreColor: "#ffffff", intensity: 1.3 });

            // Swirling zero-G Saturn planets & tail-comets orbiting upward around Alien Saucer!
            for (var ci = 0; ci < 6; ci++) {
              var ang = t * 1.65 + (ci / 6) * TAU;
              var ox = 640 + Math.cos(ang) * (195 + (ci % 2) * 55) * u;
              var oy = lerp(cy - 30, 235 + Math.sin(ang) * 78, u);
              ctx.save();
              ctx.translate(ox, oy);
              if (ci % 2 === 0) {
                // Cut-paper ringed Saturn planet!
                ctx.rotate(-0.28);
                ctx.fillStyle = ci === 0 ? "#fb923c" : "#38bdf8";
                ctx.strokeStyle = "#14110d";
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(0, 0, 17, 0, TAU); ctx.fill(); ctx.stroke();
                ctx.strokeStyle = "#fef08a";
                ctx.lineWidth = 5;
                ctx.beginPath(); ctx.ellipse(0, 0, 34, 9, 0, 0, TAU); ctx.stroke();
              } else {
                // Blazing tail-comet!
                ctx.rotate(ang + Math.PI * 0.5);
                S.drawCutoutPaperEdge(ctx, [[16, 0], [-36, -12], [-24, 0], [-36, 12]], "#fef08a", "#f97316", { paperRim: 2.0, shadow: false });
              }
              ctx.restore();
            }

            S.drawAlienSaucer(ctx, 640, 118, 1.24, t, cx, cy - 20, { beamSpread: 185 });
          }
        }
      }
    });
  }

  // ============================================================================
  // PORTHOLE #19 · Bilge ("duchamp-optic")
  // Bang Bang × S09 Takeo Igarashi ARAP × p19.jpg + atlas-35.webp
  // ============================================================================

  var STRAW_COLS_19 = [
    "#ef4444", "#22c55e", "#eab308", "#38bdf8", "#f97316",
    "#ef4444", "#22c55e", "#eab308", "#38bdf8", "#f97316"
  ];

  var POLY_POTATO_19 = [
    [0.24, 0.06], [0.56, 0.03], [0.84, 0.14], [0.95, 0.42],
    [0.92, 0.74], [0.76, 0.95], [0.42, 0.97], [0.15, 0.82],
    [0.05, 0.50], [0.10, 0.22]
  ];

  function drawBendyStraw19(ctx, S, x0, y0, xe, ye, xt, yt, col, w, glow, t, idx) {
    var q1 = limbQuad(x0, y0, xe, ye, w, w * 0.92);
    var q2 = limbQuad(xe, ye, xt, yt, w * 0.92, w * 0.84);
    S.drawCutoutPaperEdge(ctx, q1, "#fbfaf5", "#14110d", { paperRim: 2.0, shadow: true });
    S.drawCardboardPuppetPiece(ctx, q1, { tone: col, ribs: 2, shadow: false, pin: { x: x0, y: y0, r: 3.2, metal: "brass" } });
    S.drawCutoutPaperEdge(ctx, q2, "#fbfaf5", "#14110d", { paperRim: 2.0, shadow: true });
    S.drawCardboardPuppetPiece(ctx, q2, { tone: col, ribs: 2, shadow: false, pin: { x: xe, y: ye, r: 3.4, metal: "silver" } });
    if (glow) {
      ctx.save();
      ctx.strokeStyle = "rgba(254, 249, 195, 0.82)";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(xe, ye);
      ctx.lineTo(xt, yt);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawSceneBase19(ctx, W, H, resolved, plates, S, BG, opts) {
    var cfg = opts || {};
    var t = resolved.t;
    var aImg = plates.atlasImg;

    // Rotating Duchamp optical rotor rings
    ctx.save();
    ctx.translate(640, 326);
    ctx.rotate(t * 0.24);
    ctx.strokeStyle = "rgba(247, 221, 140, 0.16)";
    ctx.lineWidth = 2.0;
    ctx.setLineDash([16, 10]);
    ctx.beginPath(); ctx.arc(0, 0, 238, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 174, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Flanking external wires & conduit apparatus cutouts from atlas-35.webp
    drawPlateFrac(
      ctx, S, aImg,
      0.04, 0.06, 0.20, 0.72,
      28, 118, 195, 365,
      [[0.08, 0.05], [0.92, 0.04], [0.85, 0.48], [0.72, 0.96], [0.06, 0.94]],
      { haloWidth: 4.0, alpha: cfg.wireAlpha != null ? cfg.wireAlpha : 0.86 }
    );
    drawPlateFrac(
      ctx, S, aImg,
      0.72, 0.36, 0.28, 0.32,
      1038, 218, 215, 145,
      [[0.04, 0.08], [0.96, 0.22], [0.96, 0.88], [0.04, 0.92]],
      { haloWidth: 4.0, alpha: cfg.wireAlpha != null ? cfg.wireAlpha : 0.86 }
    );
  }

  function drawPotatoWithStraws19(ctx, S, pImg, cx, cy, t, opts) {
    var cfg = opts || {};
    var tips = [];
    for (var i = 0; i < 10; i++) {
      var ang = (i / 10) * TAU - Math.PI * 0.5 + (cfg.spin || 0);
      var sx0 = cx + Math.cos(ang) * 58;
      var sy0 = cy + Math.sin(ang) * 78;
      var stretch = (cfg.pluckIdx === i) ? (cfg.pluckAmt || 0) : 0;
      var bend = (cfg.straight ? 0 : (0.50 * (i % 2 === 0 ? 1 : -1) + (cfg.flexAdd || 0) * (i % 2 === 0 ? 1 : -1)))
        + Math.sin(t * 3.4 + i) * 0.14;
      var ex = sx0 + Math.cos(ang) * (76 + stretch * 0.45);
      var ey = sy0 + Math.sin(ang) * (76 + stretch * 0.45);
      var tx = ex + Math.cos(ang + bend) * (62 + stretch * 0.65);
      var ty = ey + Math.sin(ang + bend) * (62 + stretch * 0.65);
      drawBendyStraw19(ctx, S, sx0, sy0, ex, ey, tx, ty, STRAW_COLS_19[i], 6.4, !!cfg.glowStraws, t, i);
      tips.push({ x0: sx0, y0: sy0, xe: ex, ye: ey, xt: tx, yt: ty, ang: ang });
    }
    drawPlateFrac(
      ctx, S, pImg,
      0.38, 0.33, 0.22, 0.32,
      cx - 94, cy - 124, 188, 248,
      POLY_POTATO_19,
      {
        haloWidth: 5.5,
        rot: (cfg.rot != null ? cfg.rot : Math.sin(t * 1.7) * 0.05),
        filter: cfg.filter || "none",
        tint: cfg.tint || null
      }
    );
    return tips;
  }

  function registerPortal19(BG) {
    BG.definePortalGame(19, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        S.drawBolasBackdrop(
          ctx, W, H,
          resolved.bolasStyle,
          19,
          resolved.t,
          { showCaptions: resolved.showCaptions, lamp: resolved.lampOn, ballast: resolved.ballastOn },
          {}
        );
      },
      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawCornerPortholeRim(ctx, W, H, S);
      },
      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawSceneBase19(ctx, W, H, resolved, plates, S, BG);
        BG.drawVolumetricBeam(ctx, 640, 625, 640, 336, { color: "#fde68a", spread: 185, intensity: 0.48, t: t });
        var cx = 640, cy = 336 + Math.sin(t * 2.0) * 6;
        var tips = drawPotatoWithStraws19(ctx, S, plates.portholeImg, cx, cy, t, {});
        for (var i = 0; i < tips.length; i++) {
          ctx.fillStyle = "rgba(224, 242, 254, 0.85)";
          ctx.beginPath();
          ctx.arc(tips[i].xt, tips[i].yt - ((t * 22 + i * 9) % 24), 4.2, 0, TAU);
          ctx.fill();
        }
        // Curious trout snout from p19.jpg nosing right side
        drawPlateFrac(
          ctx, S, plates.portholeImg,
          0.67, 0.41, 0.18, 0.12,
          915 + Math.sin(t * 2.4) * 10, 286, 165, 108,
          [[0.04, 0.52], [0.46, 0.12], [0.95, 0.06], [0.95, 0.94], [0.42, 0.88]],
          { haloWidth: 4.0 }
        );
      },
      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.7);
          drawSceneBase19(ctx, W, H, resolved, plates, S, BG);
          var cx = 640, cy = 336 + Math.sin(t * 2.0) * 5;
          BG.drawVolumetricBeam(ctx, 640, 626, cx, cy, {
            color: "#3b82f6",
            coreColor: "#fef08a",
            spread: 190,
            intensity: 1.3 * su,
            t: t
          });
          BG.drawLanternHalo(ctx, cx, cy, 210 * su, { t: t, color: "#f59e0b", coreColor: "#fef9c3", intensity: 1.35 * su });
          var tips = drawPotatoWithStraws19(ctx, S, plates.portholeImg, cx, cy, t, {
            glowStraws: true,
            tint: "rgba(251, 191, 36, 0.36)"
          });
          for (var i = 0; i < tips.length; i++) {
            BG.drawLanternHalo(ctx, tips[i].xt, tips[i].yt, 28 * su, { t: t + i, color: STRAW_COLS_19[i], intensity: 0.95 });
          }
        },
        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.72);
          drawSceneBase19(ctx, W, H, resolved, plates, S, BG);
          var cx = 640, cy = 334 + Math.sin(t * 5.0) * 6;
          drawBallastJet(ctx, S, BG, 640, 620, cx, cy + 85, su, t, { spread: 85, count: 14 });
          var tips = drawPotatoWithStraws19(ctx, S, plates.portholeImg, cx, cy, t, {
            flexAdd: 0.58 * su + Math.sin(t * 9.0) * 0.16
          });
          for (var i = 0; i < tips.length; i++) {
            BG.drawDeterministicParticles(ctx, "bubbles", tips[i].xt, tips[i].yt, t + i * 0.15, { count: 5, loop: true });
          }
        },
        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.82);
          drawSceneBase19(ctx, W, H, resolved, plates, S, BG);
          var cx = 640, cy = 336;
          drawPotatoWithStraws19(ctx, S, plates.portholeImg, cx, cy, t, {});
          var sx = lerp(245, cx - 28, su);
          var sy = lerp(545, cy + 22, su);
          BG.drawSnailSilverTrail(ctx, 245, 545, cx - 28, cy + 22, su, t, { arc: 32 });
          if (su > 0.45) {
            // Shiny Blue & Gold Science-Fair Ribbon Rosette pinned onto potato!
            var rx = cx + 24, ry = cy - 12;
            S.drawCutoutPaperEdge(ctx, [[rx - 18, ry + 10], [rx - 28, ry + 58], [rx - 12, ry + 48], [rx - 4, ry + 58], [rx, ry + 10]], "#2563eb", "#14110d", { paperRim: 1.8 });
            S.drawCutoutPaperEdge(ctx, [[rx + 18, ry + 10], [rx + 28, ry + 58], [rx + 12, ry + 48], [rx + 4, ry + 58], [rx, ry + 10]], "#d42a1e", "#14110d", { paperRim: 1.8 });
            var ros = starPolygon(rx, ry, 26, 19, 10, t * 0.6);
            S.drawCutoutPaperEdge(ctx, ros, "#fbbf24", "#14110d", { paperRim: 2.0 });
            S.drawSplitPin(ctx, rx, ry, 5.0, { metal: "brass" });
          }
          S.drawMailSnail(ctx, sx, sy, 1.18, t, { postcard: true, trail: false });
        },
        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.7);
          drawSceneBase19(ctx, W, H, resolved, plates, S, BG);
          var cx = 640, cy = 336;
          var twang = su * (82 + Math.sin(t * 22.0) * 18);
          var tips = drawPotatoWithStraws19(ctx, S, plates.portholeImg, cx, cy, t, {
            pluckIdx: 3,
            pluckAmt: twang
          });
          drawBrassScissorProbe(ctx, S, BG, 1080, 608, tips[3].xt, tips[3].yt, su, t, { bend: -1 });
        }
      },
      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Glowing Deep-Sea Urchin Mine: giant monster-quill shadows + Turkey tin pie-pan shield!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.75);
            drawSceneBase19(ctx, W, H, resolved, plates, S, BG, { wireAlpha: 0.45 });
            var cx = 660, cy = 338;

            // Giant looming monster-quill shadows cast radially across workshop wall!
            ctx.save();
            ctx.fillStyle = "rgba(5, 6, 8, 0.72)";
            for (var q = 0; q < 16; q++) {
              var qa = (q / 16) * TAU + Math.sin(t * 1.5) * 0.05;
              var qLen = (320 + (q % 2) * 95) * u;
              ctx.beginPath();
              ctx.moveTo(cx + Math.cos(qa - 0.08) * 65, cy + Math.sin(qa - 0.08) * 65);
              ctx.lineTo(cx + Math.cos(qa) * qLen, cy + Math.sin(qa) * qLen);
              ctx.lineTo(cx + Math.cos(qa + 0.08) * 65, cy + Math.sin(qa + 0.08) * 65);
              ctx.closePath();
              ctx.fill();
            }
            ctx.restore();

            BG.drawVolumetricBeam(ctx, 640, 626, cx, cy, { color: "#2563eb", coreColor: "#fbbf24", spread: 210, intensity: 1.25, t: t });

            // Bristling naval-mine sea-urchin quills + glaring yellow eyes!
            for (var ui = 0; ui < 14; ui++) {
              var ua = (ui / 14) * TAU;
              var jab = 1 + 0.16 * Math.abs(Math.sin(t * 7.0 + ui));
              var x0 = cx + Math.cos(ua) * 68, y0 = cy + Math.sin(ua) * 68;
              var x1 = cx + Math.cos(ua) * (68 + 145 * jab), y1 = cy + Math.sin(ua) * (68 + 145 * jab);
              S.drawCardboardPuppetPiece(ctx, limbQuad(x0, y0, x1, y1, 9.5, 1.5), {
                tone: ui % 2 === 0 ? "#991b1b" : "#1e1b4b",
                pin: { x: x0, y: y0, r: 3.4, metal: "brass" }
              });
              BG.drawLanternHalo(ctx, x1, y1, 22, { t: t, color: "#ef4444", intensity: 0.85 });
            }
            drawPlateFrac(ctx, S, plates.portholeImg, 0.38, 0.33, 0.22, 0.32, cx - 96, cy - 106, 192, 212, POLY_POTATO_19, {
              filter: "litho", tint: "rgba(88, 28, 135, 0.52)", haloWidth: 5.0
            });
            S.drawCutoutPaperEdge(ctx, [[cx - 48, cy - 22], [cx - 10, cy - 6], [cx - 42, cy + 10]], "#fef08a", "#14110d", { paperRim: 2 });
            S.drawCutoutPaperEdge(ctx, [[cx + 48, cy - 22], [cx + 10, cy - 6], [cx + 42, cy + 10]], "#fef08a", "#14110d", { paperRim: 2 });

            drawExpressiveTurkey(ctx, S, 138, 504, 1.05, t, "shield");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // First-Place Creek Science Fair Battery: copper/zinc wires + pure-vector 12:00 clock + Lab-Goggle Trout!
            var t = resolved.t;
            var u = outEnter(resolved, 0.8);
            drawSceneBase19(ctx, W, H, resolved, plates, S, BG);
            var cx = 545, cy = 378;
            BG.drawLanternHalo(ctx, cx, cy, 175, { t: t, color: "#fbbf24", intensity: 0.95 });
            var tips = drawPotatoWithStraws19(ctx, S, plates.portholeImg, cx, cy, t, { glowStraws: true });

            // Mounted Science-Fair Digital Clock Box showing pure-vector 7-segment "12:00"!
            var clkX = 545, clkY = 128;
            // Copper & Zinc Alligator-Clip Wires arcing from glowing straws to clock!
            ctx.save();
            ctx.lineWidth = 4.5;
            ctx.strokeStyle = "#d97706";
            ctx.beginPath();
            ctx.moveTo(tips[9].xt, tips[9].yt);
            ctx.bezierCurveTo(370, 175, 420, 128, clkX - 96, clkY);
            ctx.stroke();
            ctx.strokeStyle = "#94a3b8";
            ctx.beginPath();
            ctx.moveTo(tips[1].xt, tips[1].yt);
            ctx.bezierCurveTo(720, 175, 670, 128, clkX + 96, clkY);
            ctx.stroke();
            ctx.restore();

            S.drawCardboardPuppetPiece(ctx, [[clkX - 98, clkY - 38], [clkX + 98, clkY - 38], [clkX + 98, clkY + 38], [clkX - 98, clkY + 38]], {
              tone: "#1e293b",
              pins: [[clkX - 84, clkY - 24], [clkX + 84, clkY - 24]]
            });
            var blinkColon = Math.sin(t * 6.0) > -0.2 ? "12:00" : "12 00";
            drawVectorReadout(ctx, blinkColon, clkX, clkY, 22, 42, "#34d399", 3.6);

            // Brook Trout wearing big round white Science Lab Goggles + Mail Snail!
            var tx = 935, ty = 372 + Math.sin(t * 2.4) * 6;
            S.drawBrookTrout(ctx, tx, ty, 1.22, t, true);
            ctx.fillStyle = "rgba(224, 242, 254, 0.82)";
            ctx.strokeStyle = "#fbfaf5";
            ctx.lineWidth = 4.0;
            ctx.beginPath();
            ctx.arc(tx - 68, ty - 8, 17, 0, TAU);
            ctx.arc(tx - 38, ty - 8, 15, 0, TAU);
            ctx.fill();
            ctx.stroke();

            S.drawMailSnail(ctx, 855, 534, 1.18, t, { postcard: true, hasReply: true });
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Blinking Potato Sputnik Relay Satellite
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase19(ctx, W, H, resolved, plates, S, BG, { wireAlpha: 0.5 });
            var cx = 640, cy = 398 + Math.sin(t * 2.3) * 10;
            var spin = t * 0.62;

            BG.drawTractorRings(ctx, 640, 108, cx, cy, t, { spread: 170, rings: 5 });

            var tips = drawPotatoWithStraws19(ctx, S, plates.portholeImg, cx, cy, t, {
              straight: true,
              spin: spin,
              rot: spin * 0.5,
              glowStraws: true
            });

            // Riveted silver Sputnik equator collar
            S.drawCardboardPuppetPiece(ctx, [[cx - 92, cy - 14], [cx + 92, cy - 14], [cx + 86, cy + 14], [cx - 86, cy + 14]], {
              tone: "#cbd5e1",
              ribs: 1,
              pins: [[cx - 60, cy], [cx - 20, cy], [cx + 20, cy], [cx + 60, cy]]
            });

            for (var i = 0; i < tips.length; i++) {
              var blink = 0.4 + 0.6 * Math.max(0, Math.sin(t * 9.0 + i * 1.1));
              ctx.fillStyle = "#ef4444";
              ctx.strokeStyle = "#fbfaf5";
              ctx.lineWidth = 1.8;
              ctx.beginPath();
              ctx.arc(tips[i].xt, tips[i].yt, 6 + blink * 3.5, 0, TAU);
              ctx.fill();
              ctx.stroke();
            }

            // Concentric radio ping arcs rising to Saucer
            for (var r = 0; r < 3; r++) {
              var ru = ((t * 0.9 + r / 3) % 1);
              ctx.strokeStyle = "rgba(52, 211, 153, " + ((1 - ru) * 0.85 * u).toFixed(3) + ")";
              ctx.lineWidth = 2.8;
              ctx.beginPath();
              ctx.arc(cx, cy - 65 - ru * 135, 28 + ru * 76, Math.PI * 1.15, Math.PI * 1.85);
              ctx.stroke();
            }

            S.drawAlienSaucer(ctx, 640, 96, 1.22, t, cx, cy, { beam: false });
          }
        },
        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Over-Pressurized Depth Gauge Explosion: red mercury straws + 14.7 vector gauge + Valve Turkey!
            var t = resolved.t;
            var u = outEnter(resolved, 0.75);
            drawSceneBase19(ctx, W, H, resolved, plates, S, BG);
            var cx = 660, cy = 352 + Math.sin(t * 16.0) * 4;
            var tips = drawPotatoWithStraws19(ctx, S, plates.portholeImg, cx, cy, t, { flexAdd: 0.42 });

            // Red mercury thermometer bars & water geysers spouting from all 10 straws!
            for (var i = 0; i < tips.length; i++) {
              ctx.strokeStyle = "#dc2626";
              ctx.lineWidth = 5.5;
              ctx.beginPath();
              ctx.moveTo(tips[i].x0, tips[i].y0);
              ctx.lineTo(tips[i].xe, tips[i].ye);
              ctx.lineTo(tips[i].xt, tips[i].yt);
              ctx.stroke();
              BG.drawDeterministicParticles(ctx, "bubbles", tips[i].xt, tips[i].yt, t + i * 0.1, {
                count: 6, loop: true, color: "rgba(248, 113, 113, 0.85)"
              });
            }

            // Brass Hydrostatic Depth Gauge Dial pegged in red + 7-segment "14.7" (0 text!)
            var gx = 335, gy = 195;
            S.drawCutoutPaperEdge(ctx, starPolygon(gx, gy, 74, 70, 12, 0), "#d4a44c", "#14110d", { paperRim: 3.5 });
            ctx.fillStyle = "#fbfaf5";
            ctx.beginPath(); ctx.arc(gx, gy, 58, 0, TAU); ctx.fill();
            ctx.strokeStyle = "#dc2626";
            ctx.lineWidth = 10;
            ctx.beginPath(); ctx.arc(gx, gy, 44, -0.4, 0.8); ctx.stroke();
            drawVectorReadout(ctx, "14.7", gx, gy + 22, 13, 22, "#dc2626", 2.6);
            var needleAng = 0.45 + Math.sin(t * 24.0) * 0.12;
            ctx.strokeStyle = "#14110d";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(gx, gy);
            ctx.lineTo(gx + Math.cos(needleAng) * 46, gy + Math.sin(needleAng) * 46);
            ctx.stroke();
            S.drawSplitPin(ctx, gx, gy, 5.0, { metal: "brass" });

            drawExpressiveTurkey(ctx, S, 138, 500, 1.05, t, "valve");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Ten-Straw Creek Root-Beer Float Share: 10 fish in a circle sipping straws + foam scoop + Mail Snail!
            var t = resolved.t;
            var u = outEnter(resolved, 0.82);
            drawSceneBase19(ctx, W, H, resolved, plates, S, BG);
            var cx = 640, cy = 348;

            var tips = drawPotatoWithStraws19(ctx, S, plates.portholeImg, cx, cy, t, { straight: false, flexAdd: 0.25 });

            // Fluffy white paper scoop of vanilla root-beer float foam on top of potato!
            S.drawCutoutPaperEdge(
              ctx,
              [[cx - 68, cy - 92], [cx - 46, cy - 138], [cx, cy - 152], [cx + 46, cy - 138], [cx + 68, cy - 92]],
              "#fffbeb",
              "#14110d",
              { paperRim: 3.0 }
            );

            // Brook Trout + 9 Minnow Pals arranged in a 10-fish circle sipping every straw!
            for (var i = 0; i < 10; i++) {
              var tp = tips[i];
              var ang = tp.ang;
              var fx = tp.xt + Math.cos(ang) * 48 * clamp(u, 0, 1);
              var fy = tp.yt + Math.sin(ang) * 42 * clamp(u, 0, 1);
              if (i === 2) {
                S.drawBrookTrout(ctx, fx + 35, fy, 0.88, t, true);
              } else {
                ctx.save();
                ctx.translate(fx, fy);
                ctx.rotate(ang + Math.PI);
                var puff = 1 + 0.18 * Math.sin(t * 8.0 + i);
                S.drawCardboardPuppetPiece(ctx, [[-26, 0], [-8, -14 * puff], [22, -10], [34, -18], [28, 0], [34, 18], [22, 10], [-8, 14 * puff]], {
                  tone: i % 2 === 0 ? "#6ea89e" : "#8fb384",
                  ribs: 1,
                  shadow: false
                });
                ctx.fillStyle = "#14110d";
                ctx.beginPath(); ctx.arc(-14, -3, 2.5, 0, TAU); ctx.fill();
                ctx.restore();
              }
            }

            S.drawMailSnail(ctx, cx, cy - 166, 1.05, t, { postcard: false });
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Jet-Propelled Ten-Thruster Tuber Rocket spinning upward to Alien Saucer!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase19(ctx, W, H, resolved, plates, S, BG, { wireAlpha: 0.45 });
            var cx = 640;
            var cy = lerp(420, 295, u) + Math.sin(t * 4.5) * 12;
            var fastSpin = t * 4.2;

            var tips = drawPotatoWithStraws19(ctx, S, plates.portholeImg, cx, cy, t, {
              spin: fastSpin,
              rot: fastSpin,
              flexAdd: 0.45
            });

            // 10 Blue-White Plasma Thruster Flames blasting from every angled straw tip!
            for (var i = 0; i < 10; i++) {
              var tp = tips[i];
              var jetAng = tp.ang + 1.15;
              var jx = tp.xt + Math.cos(jetAng) * 95;
              var jy = tp.yt + Math.sin(jetAng) * 95;
              BG.drawVolumetricBeam(ctx, tp.xt, tp.yt, jx, jy, {
                color: "#38bdf8",
                coreColor: "#ffffff",
                sourceRadius: 8,
                spread: 26,
                intensity: 1.1,
                motes: 4,
                t: t
              });
            }

            S.drawAlienSaucer(ctx, 640, 92, 1.20, t, cx, cy, { beamSpread: 135 });
          }
        },
        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Mashed-Potato Thanksgiving Menu Warning: porcelain gravy boat + NO-wings Turkey!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.78);
            drawSceneBase19(ctx, W, H, resolved, plates, S, BG);

            // Drifting White Porcelain Gravy Boat + Ladle behind the stamped potato!
            var gx = lerp(980, 395, (u * 0.65 + (t * 0.04) % 0.35));
            var gy = 215 + Math.sin(t * 2.2) * 10;
            ctx.save();
            ctx.translate(gx, gy);
            // Ladle handle
            S.drawCardboardPuppetPiece(ctx, [[18, -18], [58, -56], [66, -50], [26, -12]], { tone: "#cbd5e1", shadow: false });
            // Porcelain gravy boat body + brown gravy rim
            S.drawCutoutPaperEdge(
              ctx,
              [[-92, -16], [-48, -8], [48, -10], [88, -26], [62, 28], [32, 42], [-36, 42], [-64, 24]],
              "#fbfaf7",
              "#1d596e",
              { paperRim: 3.5 }
            );
            ctx.fillStyle = "#78350f";
            ctx.beginPath();
            ctx.ellipse(0, -10, 56, 9, 0, 0, TAU);
            ctx.fill();
            ctx.restore();

            var cx = 685, cy = 358;
            drawPotatoWithStraws19(ctx, S, plates.portholeImg, cx, cy, t, {});
            // Red rectangular menu tag stamped on potato
            S.drawCutoutPaperEdge(ctx, [[cx - 46, cy - 26], [cx + 46, cy - 26], [cx + 46, cy + 26], [cx - 46, cy + 26]], "#fef2f2", "#d42a1e", { paperRim: 2.5 });
            BG.drawGeometricSymbol(ctx, "triangle", cx, cy, 22, "#d42a1e", 3.5);

            S.drawMailSnail(ctx, cx + 85, cy + 95, 1.16, t, { postcard: true });
            drawExpressiveTurkey(ctx, S, 142, 498, 1.08, t, "no_wings");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Sneaky Potato-Bug Eviction Notice: striped potato beetle in napkin bib + Snail form + scolding Trout!
            var t = resolved.t;
            var u = outEnter(resolved, 0.8);
            drawSceneBase19(ctx, W, H, resolved, plates, S, BG);
            var cx = 560, cy = 392;
            var tips = drawPotatoWithStraws19(ctx, S, plates.portholeImg, cx, cy, t, {});

            // Cute Striped Colorado Potato Beetle popping out of Top Straw #0 wearing a red-checkered bib!
            var bx = tips[0].xt;
            var by = tips[0].yt - 24 * clamp(u, 0, 1.1);
            ctx.save();
            ctx.translate(bx, by);
            // Striped yellow-and-brown beetle shell
            S.drawCutoutPaperEdge(ctx, [[-34, 18], [-38, -22], [0, -38], [38, -22], [34, 18]], "#facc15", "#14110d", { paperRim: 2.8 });
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(-14, -32); ctx.lineTo(-14, 16);
            ctx.moveTo(0, -36);   ctx.lineTo(0, 16);
            ctx.moveTo(14, -32);  ctx.lineTo(14, 16);
            ctx.stroke();
            // Red napkin bib under chin
            S.drawCutoutPaperEdge(ctx, [[-20, 12], [20, 12], [0, 42]], "#ef4444", "#fbfaf5", { paperRim: 1.8 });
            // Cute bug eyes & antennae
            ctx.fillStyle = "#fbfaf5";
            ctx.beginPath(); ctx.arc(-12, -16, 7, 0, TAU); ctx.arc(12, -16, 7, 0, TAU); ctx.fill();
            ctx.fillStyle = "#14110d";
            ctx.beginPath(); ctx.arc(-11, -16, 3, 0, TAU); ctx.arc(13, -16, 3, 0, TAU); ctx.fill();
            ctx.restore();

            // Mail Snail holding up official notice + Brook Trout wagging scolding fin!
            S.drawMailSnail(ctx, bx - 115, by + 18, 1.18, t, { postcard: true, hasReply: true });
            S.drawBrookTrout(ctx, 945, 365, 1.18, t, true);
            drawIKLimb(ctx, S, 895, 378, 38, 36, 838, 325 + Math.sin(t * 11.0) * 16, -1, {
              upperTone: "#6c7b67", lowerTone: "#b87458", w0: 8, w1: 6, w2: 5
            });
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Ten-Antennaed Telepathic Starch Brain: slime neural web + floating pebbles & paperclips!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase19(ctx, W, H, resolved, plates, S, BG, { wireAlpha: 0.4 });
            var cx = 640, cy = 392;

            BG.drawLanternHalo(ctx, cx, cy, 220 * u, { t: t, color: "#10b981", coreColor: "#d9f99d", intensity: 1.25 });
            var tips = drawPotatoWithStraws19(ctx, S, plates.portholeImg, cx, cy, t, {
              glowStraws: true,
              tint: "rgba(16, 185, 129, 0.35)"
            });

            // Glowing emerald slime neural web linking all 10 straw tips!
            ctx.save();
            ctx.strokeStyle = "rgba(52, 211, 153, 0.88)";
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            for (var i = 0; i < 10; i++) {
              var nxt = tips[(i + 1) % 10];
              var opp = tips[(i + 3) % 10];
              ctx.moveTo(tips[i].xt, tips[i].yt);
              ctx.lineTo(nxt.xt, nxt.yt);
              ctx.moveTo(tips[i].xt, tips[i].yt);
              ctx.lineTo(opp.xt, opp.yt);
            }
            ctx.stroke();

            // Psychic wave rings rising to Saucer + orbiting river pebbles & bent wire paperclips!
            for (var pw = 0; pw < 4; pw++) {
              var pu = ((t * 0.75 + pw / 4) % 1);
              ctx.strokeStyle = "rgba(168, 85, 247, " + ((1 - pu) * 0.85).toFixed(3) + ")";
              ctx.lineWidth = 2.8;
              ctx.beginPath();
              ctx.ellipse(cx, lerp(cy - 60, 125, pu), lerp(95, 36, pu), lerp(24, 10, pu), 0, 0, TAU);
              ctx.stroke();
            }

            for (var ob = 0; ob < 6; ob++) {
              var oa = t * 1.6 + (ob / 6) * TAU;
              var ox = cx + Math.cos(oa) * 265 * u;
              var oy = cy + Math.sin(oa) * 92 * u;
              ctx.save();
              ctx.translate(ox, oy);
              ctx.rotate(oa);
              if (ob % 2 === 0) {
                // Bent silver wire paperclip!
                ctx.strokeStyle = "#e2e8f0";
                ctx.lineWidth = 3.2;
                ctx.beginPath();
                ctx.arc(-10, 0, 8, Math.PI * 0.5, Math.PI * 1.5);
                ctx.lineTo(14, -8);
                ctx.arc(14, 2, 10, -Math.PI * 0.5, Math.PI * 0.5);
                ctx.lineTo(-14, 12);
                ctx.stroke();
              } else {
                S.drawCutoutPaperEdge(ctx, [[-14, -8], [12, -12], [18, 8], [-10, 12]], "#94a3b8", "#14110d", { paperRim: 1.8, shadow: false });
              }
              ctx.restore();
            }
            ctx.restore();

            S.drawMailSnail(ctx, cx - 25, cy - 12, 1.0, t, { postcard: false });
            S.drawAlienSaucer(ctx, 640, 96, 1.22, t, cx, cy, { beam: false });
          }
        },
        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Poked Sea-Urchin Shoots Suction Straws stuck right onto our porthole lens + Cross-Eyed Turkey!
            var t = resolved.t;
            var u = outEnter(resolved, 0.72);
            drawSceneBase19(ctx, W, H, resolved, plates, S, BG);
            var cx = 690, cy = 345;
            drawPotatoWithStraws19(ctx, S, plates.portholeImg, cx, cy, t, {});

            // 3 Large Suction-Cup Striped Straws stuck directly onto the foreground porthole glass!
            var darts = [
              { x: 435, y: 265, col: "#ef4444", ph: 0 },
              { x: 615, y: 410, col: "#eab308", ph: 1.4 },
              { x: 835, y: 275, col: "#38bdf8", ph: 2.8 }
            ];
            for (var d = 0; d < 3; d++) {
              var dt = darts[d];
              var wigX = Math.sin(t * 14.0 + dt.ph) * 22;
              var wigY = Math.cos(t * 11.0 + dt.ph) * 12;
              ctx.save();
              ctx.translate(dt.x, dt.y);
              ctx.scale(clamp(u, 0.2, 1.15), clamp(u, 0.2, 1.15));
              // Translucent suction-cup disc pressed flat against glass
              ctx.fillStyle = "rgba(186, 230, 253, 0.55)";
              ctx.strokeStyle = "#fbfaf5";
              ctx.lineWidth = 3.5;
              ctx.beginPath(); ctx.arc(0, 0, 38, 0, TAU); ctx.fill(); ctx.stroke();
              ctx.beginPath(); ctx.arc(0, 0, 18, 0, TAU); ctx.stroke();
              // Wiggling foreground striped straw shaft sticking out at an angle
              drawBendyStraw19(ctx, S, 0, 0, 24 + wigX * 0.5, -62, 58 + wigX, -118 + wigY, dt.col, 10.5, false, t, d);
              ctx.restore();
            }

            drawExpressiveTurkey(ctx, S, 148, 498, 1.08, t, "crosseyed");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Tuned Bendy-Straw Bagpipe Solo: Trout squeezing tartan potato bagpipes + Kilt Mail Snail!
            var t = resolved.t;
            var u = outEnter(resolved, 0.8);
            drawSceneBase19(ctx, W, H, resolved, plates, S, BG);
            S.drawTornPaperFlat(ctx, 210, 508, 860, 58, { fill: "#365314", paperColor: "#fbfaf5", deckle: 5.5 });

            // Brook Trout squeezing the Tartan Potato Bagpipes under its fin!
            var bx = 560, by = 355 + Math.sin(t * 6.0) * 5;
            // 3 Upright Striped Bagpipe Drone Straws + Chanter
            for (var dr = 0; dr < 3; dr++) {
              var dx0 = bx - 35 + dr * 32;
              drawBendyStraw19(ctx, S, dx0, by - 45, dx0 - 12 + dr * 8, by - 128, dx0 - 18 + dr * 12 + Math.sin(t * 8 + dr) * 8, by - 195, STRAW_COLS_19[dr], 7.5, false, t, dr);
            }
            // Tartan-dressed Potato Bag
            var sqz = 1 + 0.08 * Math.sin(t * 8.0);
            drawPlateFrac(ctx, S, plates.portholeImg, 0.38, 0.33, 0.22, 0.32, bx - 95 * sqz, by - 68, 190 * sqz, 136, POLY_POTATO_19, {
              tint: "rgba(185, 28, 28, 0.58)", haloWidth: 4.5
            });
            S.drawEngravingCrosshatch(ctx, 130, 86, 0.45, 12, { x: bx - 65, y: by - 42, color: "#fef08a", lineWidth: 2.2 });

            S.drawBrookTrout(ctx, 725, 332, 1.28, t, true);
            // Mouthpiece straw from Trout's mouth to potato bag!
            drawBendyStraw19(ctx, S, 645, 336, 610, 345, bx + 45, by - 15, "#eab308", 6.5, false, t, 4);

            // Mail Snail marching in a tiny Red Tartan Kilt & Tam-o'-Shanter Hat!
            var sx = 365 + Math.sin(t * 2.2) * 45;
            var sy = 496;
            S.drawMailSnail(ctx, sx, sy, 1.28, t, { postcard: false });
            S.drawCutoutPaperEdge(ctx, [[sx - 26, sy - 2], [sx + 16, sy - 2], [sx + 24, sy + 18], [sx - 32, sy + 18]], "#dc2626", "#facc15", { paperRim: 1.8 });
            S.drawCutoutPaperEdge(ctx, [[sx - 18, sy - 26], [sx + 14, sy - 30], [sx + 8, sy - 18], [sx - 14, sy - 18]], "#dc2626", "#14110d", { paperRim: 1.5 });

            drawMusicNote(ctx, bx - 90, 155 - ((t * 32) % 45), 1.05, "#fef08a");
            drawMusicNote(ctx, bx + 75, 145 - (((t + 0.6) * 32) % 45), 1.0, "#34d399");
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Unfolded Origami Deep-Space Probe Dish: twin gold-foil honeycomb solar wings + violet beam!
            var t = resolved.t;
            var u = outEnter(resolved, 0.85);
            drawSceneBase19(ctx, W, H, resolved, plates, S, BG, { wireAlpha: 0.45 });
            var cx = 640, cy = 392 + Math.sin(t * 2.2) * 8;

            BG.drawVolumetricBeam(ctx, 640, 108, cx, cy, {
              color: "#a855f7",
              coreColor: "#f3e8ff",
              sourceRadius: 24,
              spread: 155,
              intensity: 1.2,
              t: t
            });

            // Twin Unfolding Gold-Foil Origami Solar Array Wings on Scissor Hinges!
            var wingSpan = clamp(u, 0, 1.05);
            for (var side = -1; side <= 1; side += 2) {
              for (var seg = 0; seg < 3; seg++) {
                var wx = cx + side * (105 + seg * 78 * wingSpan);
                var wy = cy + Math.sin(t * 2.5 + seg) * 5;
                var hexPts = starPolygon(wx, wy, 44 * wingSpan, 38 * wingSpan, 3, side * 0.5);
                S.drawCutoutPaperEdge(ctx, hexPts, seg % 2 === 0 ? "#f59e0b" : "#fbbf24", "#78350f", { paperRim: 2.5 });
                S.drawReinigerFiligreeHinge(ctx, wx - side * 38 * wingSpan, wy, 4.8, { metal: "silver" });
              }
            }

            drawPotatoWithStraws19(ctx, S, plates.portholeImg, cx, cy, t, { straight: true, glowStraws: true });
            S.drawAlienSaucer(ctx, 640, 96, 1.22, t, cx, cy, { beam: false });
          }
        }
      }
    });
  }

  // ============================================================================
  // PORTHOLE #20 · Dome ("perec-stage")
  // La Belle Hortense × S18 Cartoon Saloon × p20.jpg + atlas-41.webp
  // ============================================================================

  var SEXTINE_COLS_20 = ["#d42a1e", "#f59e0b", "#0f8f80", "#2563eb", "#9333ea", "#34d399"];
  var POLY_ARCH_20 = [
    [0.50, 0.02], [0.78, 0.14], [0.94, 0.38], [0.95, 0.96],
    [0.05, 0.96], [0.06, 0.38], [0.22, 0.14]
  ];

  function drawSceneBase20(ctx, W, H, resolved, plates, S, BG, opts) {
    var cfg = opts || {};
    var t = resolved.t;
    var aImg = plates.atlasImg;

    // Luminous blue spiral-stair lighthouse plate from atlas-41.webp (Song of the Sea)
    drawPlateFrac(
      ctx, S, aImg,
      0.18, 0.02, 0.68, 0.72,
      275 + Math.sin(t * 0.4) * 8, 76, 730, 465,
      [[0.03, 0.04], [0.97, 0.04], [0.95, 0.96], [0.05, 0.96]],
      { haloWidth: 4.0, alpha: cfg.atlasAlpha != null ? cfg.atlasAlpha : 0.80, filter: cfg.atlasFilter || "none" }
    );
    if (BG && cfg.caustics !== false) {
      BG.drawWaterCaustics(ctx, W, H, t, { intensity: 0.18, topY: 78 });
    }
  }

  function drawGothicArch20(ctx, S, pImg, cx, topY, w, h, t, opts) {
    var cfg = opts || {};
    drawPlateFrac(
      ctx, S, pImg,
      0.32, 0.16, 0.36, 0.46,
      cx - w * 0.5, topY, w, h,
      POLY_ARCH_20,
      { haloWidth: 5.8, filter: cfg.filter || "none", rot: cfg.rot || 0, alpha: cfg.alpha != null ? cfg.alpha : 1 }
    );
    if (cfg.jewels !== false) {
      var roseY = topY + h * 0.27;
      for (var j = 0; j < 6; j++) {
        var ja = (j / 6) * TAU + t * 0.45;
        var jx = cx + Math.cos(ja) * 48;
        var jy = roseY + Math.sin(ja) * 48;
        S.drawCutoutPaperEdge(
          ctx,
          [[jx - 10, jy - 7], [jx + 10, jy - 7], [jx + 12, jy + 7], [jx - 12, jy + 7]],
          SEXTINE_COLS_20[j],
          "#14110d",
          { paperRim: 1.8, shadow: false }
        );
      }
    }
  }

  function registerPortal20(BG) {
    BG.definePortalGame(20, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        S.drawBolasBackdrop(
          ctx, W, H,
          resolved.bolasStyle,
          20,
          resolved.t,
          { showCaptions: resolved.showCaptions, lamp: resolved.lampOn, ballast: resolved.ballastOn },
          { openX: 195, openY: 66, openW: 890, openH: 548, doors: true }
        );
      },
      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawCornerPortholeRim(ctx, W, H, S);
      },
      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawSceneBase20(ctx, W, H, resolved, plates, S, BG);
        BG.drawVolumetricBeam(ctx, 640, 120, 560, 595, { color: "#6ee7b7", spread: 145, intensity: 0.45, t: t });
        BG.drawVolumetricBeam(ctx, 640, 120, 720, 595, { color: "#fde68a", spread: 145, intensity: 0.42, t: t });
        drawGothicArch20(ctx, S, plates.portholeImg, 640, 96, 355, 425, t, {});
        // Foreground Trout Choir cutout from p20.jpg
        drawPlateFrac(
          ctx, S, plates.portholeImg,
          0.26, 0.49, 0.48, 0.18,
          395, 442 + Math.sin(t * 2.1) * 5, 490, 152,
          [[0.03, 0.22], [0.50, 0.06], [0.97, 0.22], [0.95, 0.92], [0.50, 0.96], [0.05, 0.92]],
          { haloWidth: 4.5 }
        );
      },
      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.72);
          drawSceneBase20(ctx, W, H, resolved, plates, S, BG);
          BG.drawVolumetricBeam(ctx, 640, 626, 640, 215, { color: "#3b82f6", spread: 120, intensity: 1.2 * su, t: t });
          drawGothicArch20(ctx, S, plates.portholeImg, 640, 96, 355, 425, t, {});
          // 6 Kaleidoscopic ruby, gold, teal & sapphire beams fanned across the silt!
          for (var i = 0; i < 6; i++) {
            var tx = 290 + i * 140 + Math.sin(t * 1.8 + i) * 18;
            BG.drawVolumetricBeam(ctx, 640, 215, tx, 608, {
              color: SEXTINE_COLS_20[i],
              coreColor: "#fffbeb",
              sourceRadius: 22,
              spread: 68 * su,
              intensity: 1.15 * su,
              t: t + i
            });
          }
          BG.drawLanternHalo(ctx, 640, 215, 135 * su, { t: t, color: "#fbbf24", intensity: 1.2 * su });
        },
        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.75);
          drawSceneBase20(ctx, W, H, resolved, plates, S, BG);
          var sway = Math.sin(t * 4.5) * 0.045 * su;
          drawBallastJet(ctx, S, BG, 880, 580, 640, 310, su, t, { spread: 95, count: 16 });
          drawGothicArch20(ctx, S, plates.portholeImg, 640, 96, 355, 425, t, { rot: sway });
          // Resonant velvet crimson wave ribbons humming through the arch panes!
          ctx.save();
          for (var w = 0; w < 4; w++) {
            ctx.strokeStyle = w % 2 === 0 ? "rgba(248, 113, 113, 0.78)" : "rgba(110, 231, 183, 0.75)";
            ctx.lineWidth = 4.0;
            ctx.beginPath();
            for (var x = 360; x <= 920; x += 24) {
              var wy = 285 + w * 46 + Math.sin(x * 0.03 - t * 6.5 + w) * 18 * su;
              if (x === 360) ctx.moveTo(x, wy);
              else ctx.lineTo(x, wy);
            }
            ctx.stroke();
          }
          ctx.restore();
        },
        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.85);
          drawSceneBase20(ctx, W, H, resolved, plates, S, BG);
          drawGothicArch20(ctx, S, plates.portholeImg, 640, 96, 355, 425, t, {});
          var sx = lerp(425, 628, su);
          var sy = lerp(490, 212, su);
          BG.drawSnailSilverTrail(ctx, 425, 490, 628, 212, su, t, { arc: -36 });
          if (su > 0.5) {
            // Buffed sparkling center amber pebble!
            BG.drawLanternHalo(ctx, 640, 212, 95 * su, { t: t, color: "#fbbf24", coreColor: "#ffffff", intensity: 1.3 });
            var glint = starPolygon(640, 212, 34, 8, 4, t * 2.4);
            S.drawCutoutPaperEdge(ctx, glint, "#fef08a", "#b45309", { paperRim: 1.5, shadow: false });
          }
          S.drawMailSnail(ctx, sx, sy, 1.16, t, { rot: -0.75, postcard: false, trail: false });
        },
        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.7);
          drawSceneBase20(ctx, W, H, resolved, plates, S, BG);
          drawGothicArch20(ctx, S, plates.portholeImg, 640, 96, 355, 425, t, {});
          // Concentric crystal-bell chime rings radiating from center ruby shard!
          for (var c = 0; c < 4; c++) {
            var cu = ((t * 0.95 + c / 4) % 1);
            ctx.strokeStyle = "rgba(251, 113, 133, " + ((1 - cu) * 0.85 * su).toFixed(3) + ")";
            ctx.lineWidth = 3.0;
            ctx.beginPath();
            ctx.arc(640, 215, 22 + cu * 175, 0, TAU);
            ctx.stroke();
          }
          drawBrassScissorProbe(ctx, S, BG, 1065, 598, lerp(940, 658, su), lerp(510, 222, su), su, t, {
            l1: 245, l2: 245, bend: -1
          });
        }
      },
      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Grand Sunken Royal Palace Hall: twin crenellated towers + royal carpet beams + bowing Crown Turkey!
            var t = resolved.t;
            var u = outEnter(resolved, 0.8);
            drawSceneBase20(ctx, W, H, resolved, plates, S, BG);
            var cx = 650;

            // Twin Crenellated Royal Palace Stone Towers + Crimson-Gold Banners!
            for (var ts = -1; ts <= 1; ts += 2) {
              var tx = cx + ts * 245;
              S.drawCardboardPuppetPiece(ctx, [[tx - 58, 128], [tx + 58, 128], [tx + 66, 535], [tx - 66, 535]], {
                tone: "#8f7e68",
                ribs: 5,
                pins: [[tx, 210], [tx, 395]]
              });
              for (var m = -1; m <= 1; m++) {
                S.drawCutoutPaperEdge(ctx, [[tx + m * 36 - 13, 102], [tx + m * 36 + 13, 102], [tx + m * 36 + 13, 132], [tx + m * 36 - 13, 132]], "#a8967c", "#14110d", { paperRim: 2 });
              }
              var swB = Math.sin(t * 3.0 + ts) * 14;
              S.drawCutoutPaperEdge(ctx, [[tx - 24, 178], [tx + 24, 178], [tx + 26 + swB, 345], [tx + swB, 382], [tx - 26 + swB, 345]], "#991b1b", "#fbbf24", { paperRim: 2.5 });
            }

            drawGothicArch20(ctx, S, plates.portholeImg, cx, 110, 310, 395, t, {});

            // Volumetric ruby, gold & sapphire carpet shafts aimed right onto bowing Turkey!
            BG.drawVolumetricBeam(ctx, cx, 220, 165, 535, { color: "#d42a1e", spread: 95, intensity: 1.2, t: t });
            BG.drawVolumetricBeam(ctx, cx, 220, 260, 560, { color: "#fbbf24", spread: 95, intensity: 1.2, t: t });
            BG.drawVolumetricBeam(ctx, cx, 220, 420, 585, { color: "#2563eb", spread: 95, intensity: 1.0, t: t });

            // Velvet cushion + 5-pointed golden throne crown at foot of arch
            var crY = 486;
            S.drawCutoutPaperEdge(ctx, [[cx - 68, crY], [cx + 68, crY], [cx + 78, crY + 32], [cx - 78, crY + 32]], "#7f1d1d", "#14110d", { paperRim: 2.8 });
            S.drawCutoutPaperEdge(ctx, [[cx - 52, crY + 2], [cx - 60, crY - 46 * clamp(u, 0, 1)], [cx - 28, crY - 20], [cx, crY - 62 * clamp(u, 0, 1)], [cx + 28, crY - 20], [cx + 60, crY - 46 * clamp(u, 0, 1)], [cx + 52, crY + 2]], "#fbbf24", "#14110d", { paperRim: 2.8 });

            drawExpressiveTurkey(ctx, S, 152, 498, 1.08, t, "crown");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Glowing Firefly Angel In Jar: Brook Trout tilting Mason jar of 3 haloed fireflies blinking Morse code!
            var t = resolved.t;
            var u = outEnter(resolved, 0.8);
            drawSceneBase20(ctx, W, H, resolved, plates, S, BG);
            drawGothicArch20(ctx, S, plates.portholeImg, 475, 108, 295, 395, t, { alpha: 0.88 });

            // Brook Trout tilting a large translucent Mason Jar on the right!
            S.drawBrookTrout(ctx, 945, 365 + Math.sin(t * 2.2) * 6, 1.24, t, true);

            var jx = 715, jy = 345 + Math.sin(t * 2.5) * 6;
            ctx.save();
            ctx.translate(jx, jy);
            ctx.rotate(-0.10 + Math.sin(t * 2.0) * 0.05);
            BG.drawLanternHalo(ctx, 0, 0, 185 * clamp(u, 0, 1), { t: t, color: "#fde047", intensity: 1.15 });
            S.drawCutoutPaperEdge(
              ctx,
              [[-76, -148], [76, -148], [108, -108], [106, 136], [82, 162], [-82, 162], [-106, 136], [-108, -108]],
              "rgba(204, 251, 241, 0.36)",
              "#14110d",
              { paperRim: 5.0 }
            );
            S.drawCardboardPuppetPiece(ctx, [[-84, -180], [84, -180], [84, -144], [-84, -144]], {
              tone: "#d4a44c",
              ribs: 3,
              pins: [[-54, -162], [54, -162]]
            });

            // 3 Winged Paper-Cutout Firefly Angels in Tiny Golden Halos blinking Morse code!
            for (var f = 0; f < 3; f++) {
              var fx = (f - 1) * 52 + Math.sin(t * 3.8 + f * 2) * 14;
              var fy = -35 + (f % 2) * 58 + Math.cos(t * 4.2 + f) * 12;
              var morse = 0.3 + 0.7 * Math.max(0, Math.sin(t * (7.5 + f * 2.3) + f));
              BG.drawLanternHalo(ctx, fx, fy, 48 * morse, { t: t, color: "#fef08a", coreColor: "#ffffff", intensity: 1.3 });
              S.drawCutoutPaperEdge(ctx, [[fx, fy], [fx - 26, fy - 18], [fx - 18, fy + 8]], "#fbfaf7", "#14110d", { paperRim: 1.5, shadow: false });
              S.drawCutoutPaperEdge(ctx, [[fx, fy], [fx + 26, fy - 18], [fx + 18, fy + 8]], "#fbfaf7", "#14110d", { paperRim: 1.5, shadow: false });
              ctx.fillStyle = "#facc15";
              ctx.beginPath(); ctx.arc(fx, fy + 4, 8, 0, TAU); ctx.fill();
              ctx.strokeStyle = "#fde047";
              ctx.lineWidth = 2.2;
              ctx.beginPath(); ctx.ellipse(fx, fy - 14, 11, 4, 0, 0, TAU); ctx.stroke();
            }
            ctx.restore();

            S.drawMailSnail(ctx, 435, 536, 1.20, t, { postcard: true, hasReply: true });
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Crystal Mothership Rainbow Warp Beam: 7 sharp rainbow bands + diamond-faceted Alien Saucer!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase20(ctx, W, H, resolved, plates, S, BG, { atlasFilter: "cyan" });

            var rainbow = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7"];
            for (var r = 0; r < 7; r++) {
              var xOff = (r - 3) * 34;
              BG.drawVolumetricBeam(ctx, 640 + xOff * 0.75, 235, 640 + xOff * 0.45, 108, {
                color: rainbow[r],
                coreColor: "#ffffff",
                sourceRadius: 18,
                spread: 26 * u,
                intensity: 1.35 * u,
                motes: 4,
                t: t + r
              });
            }

            drawGothicArch20(ctx, S, plates.portholeImg, 640, 175, 345, 385, t, { filter: "cyan" });
            S.drawAlienSaucer(ctx, 640, 104, 1.28, t, 640, 260, { beam: false });

            // Cut-diamond crystal facets glittering across the Alien Saucer hull!
            var sx = 640 + Math.sin(t * 2.0) * 7;
            var sy = 104 + Math.cos(t * 2.7) * 4;
            for (var d = -2; d <= 2; d++) {
              var dx = sx + d * 24;
              S.drawCutoutPaperEdge(ctx, [[dx, sy - 6], [dx + 12, sy + 6], [dx, sy + 18], [dx - 12, sy + 6]], "#e0f2fe", "#38bdf8", {
                paperRim: 1.5, shadow: false
              });
            }
          }
        },
        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Drowned River Choir Loft Singing: silver bubble pipe-organ ranks + singing choir + Cap-over-heart Turkey!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase20(ctx, W, H, resolved, plates, S, BG);

            // Silver Pipe-Organ Bubble Columns rising symmetrically behind Gothic Arch!
            for (var p = 0; p < 9; p++) {
              var px = 440 + p * 50;
              var topPipe = 95 + Math.abs(p - 4) * 24;
              ctx.fillStyle = "rgba(226, 232, 240, 0.42)";
              ctx.strokeStyle = "#cbd5e1";
              ctx.lineWidth = 2;
              ctx.fillRect(px - 14, topPipe, 28, 390 - topPipe);
              ctx.strokeRect(px - 14, topPipe, 28, 390 - topPipe);
              BG.drawDeterministicParticles(ctx, "bubbles", px, 380, t + p * 0.25, { count: 5, loop: true });
            }

            drawGothicArch20(ctx, S, plates.portholeImg, 650, 118, 335, 395, t, {});
            drawPlateFrac(
              ctx, S, plates.portholeImg,
              0.26, 0.49, 0.48, 0.18,
              415, 445 + Math.sin(t * 3.5) * 6, 470, 148,
              [[0.03, 0.22], [0.50, 0.06], [0.97, 0.22], [0.95, 0.92], [0.50, 0.96], [0.05, 0.92]],
              { haloWidth: 4.5 }
            );
            drawMusicNote(ctx, 485, 225 - ((t * 25) % 55) * u, 1.0, "#bae6fd");
            drawMusicNote(ctx, 815, 215 - (((t + 0.7) * 25) % 55) * u, 1.0, "#fde68a");

            drawExpressiveTurkey(ctx, S, 142, 498, 1.06, t, "cap_heart");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Brook Trout's Brass Tuba Solo: sousaphone wrapped around Trout + giant OOM-PAH bubble spinning Snail's cap!
            var t = resolved.t;
            var u = outEnter(resolved, 0.8);
            drawSceneBase20(ctx, W, H, resolved, plates, S, BG);
            drawGothicArch20(ctx, S, plates.portholeImg, 455, 108, 305, 405, t, { rot: -0.06 });

            var tx = 790, ty = 378 + Math.sin(t * 3.2) * 6;
            // Coiled Brass Sousaphone Tubing + Flared Bell around Brook Trout!
            ctx.save();
            ctx.translate(tx, ty);
            ctx.strokeStyle = "#d97706";
            ctx.lineWidth = 24;
            ctx.beginPath(); ctx.arc(6, 4, 68, -0.4, Math.PI * 1.35); ctx.stroke();
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 16;
            ctx.beginPath(); ctx.arc(6, 4, 68, -0.4, Math.PI * 1.35); ctx.stroke();

            // Giant Flared Brass Tuba Bell facing left!
            var bellPuff = 1 + 0.08 * Math.sin(t * 7.0);
            S.drawCutoutPaperEdge(
              ctx,
              [[-18, -56], [-95, -125 * bellPuff], [-95, -25], [-18, -32]],
              "#f59e0b",
              "#14110d",
              { paperRim: 3.5 }
            );
            ctx.fillStyle = "#78350f";
            ctx.beginPath(); ctx.ellipse(-95, -75, 16, 48 * bellPuff, 0, 0, TAU); ctx.fill();
            ctx.restore();

            S.drawBrookTrout(ctx, tx, ty, 1.15, t, true);

            // Giant Cheerful OOM-PAH Mega-Bubble blasting across to spin Mail Snail's postal cap!
            var bubX = lerp(tx - 115, 435, clamp(u, 0, 1)) + Math.sin(t * 5.0) * 14;
            var bubY = 292 + Math.cos(t * 4.2) * 10;
            var bubR = (54 + Math.sin(t * 7.0) * 8) * clamp(u, 0.2, 1.1);
            ctx.fillStyle = "rgba(186, 230, 253, 0.58)";
            ctx.strokeStyle = "#fbfaf5";
            ctx.lineWidth = 4.0;
            ctx.beginPath(); ctx.arc(bubX, bubY, bubR, 0, TAU); ctx.fill(); ctx.stroke();
            drawMusicNote(ctx, bubX, bubY, 1.15, "#14110d");

            // Mail Snail + spinning postal cap above its head!
            var snX = 355, snY = 518;
            S.drawMailSnail(ctx, snX, snY, 1.20, t, { postcard: true });
            ctx.save();
            ctx.translate(snX - 4, snY - 58 - Math.abs(Math.sin(t * 8.0)) * 22);
            ctx.rotate(t * 9.5);
            S.drawCutoutPaperEdge(ctx, [[-18, -8], [18, -8], [14, 10], [-14, 10]], "#1e293b", "#fbbf24", { paperRim: 2.0 });
            ctx.restore();
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Harmonic Stargate Portal Ripples Open: liquid rainbow wormhole + Alien Saucer nosing halfway out!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase20(ctx, W, H, resolved, plates, S, BG, { atlasFilter: "cyan" });
            var cx = 640, cy = 325;

            drawGothicArch20(ctx, S, plates.portholeImg, cx, 98, 365, 430, t, { jewels: false });

            // Liquid Stained-Glass Stargate Wormhole Ripples inside the Gothic Arch!
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(cx, cy + 25, 132, 175, 0, 0, TAU);
            ctx.clip();
            var ringCols = ["#9333ea", "#2563eb", "#0f8f80", "#eab308", "#ef4444", "#ec4899"];
            for (var ri = 5; ri >= 0; ri--) {
              var pulse = 1 + 0.12 * Math.sin(t * 5.0 - ri * 0.9);
              ctx.fillStyle = ringCols[(ri + Math.floor(t * 3)) % ringCols.length];
              ctx.beginPath();
              ctx.ellipse(cx, cy + 25, (28 + ri * 24) * pulse, (38 + ri * 32) * pulse, Math.sin(t + ri) * 0.15, 0, TAU);
              ctx.fill();
            }
            ctx.restore();

            // 3-Eyed Alien Saucer nosing halfway out through the glowing liquid arch!
            var emergeX = lerp(cx - 40, cx + 68, u);
            S.drawAlienSaucer(ctx, emergeX, cy + 18, 1.38 * clamp(u, 0.3, 1), t, emergeX + 180, 480, { beamSpread: 110 });
          }
        },
        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Stained-Glass Portrait Of Saint Gobble + Heroically Puffed Turkey!
            var t = resolved.t;
            var u = outEnter(resolved, 0.82);
            drawSceneBase20(ctx, W, H, resolved, plates, S, BG);
            var cx = 655, cy = 325;
            drawGothicArch20(ctx, S, plates.portholeImg, cx, 96, 360, 430, t, { jewels: false });

            // Radiant Stained-Glass Mosaic of "Saint Gobble" inside the Gothic Lancet!
            ctx.save();
            ctx.translate(cx, cy + 28);
            ctx.scale(clamp(u, 0.2, 1.04), clamp(u, 0.2, 1.04));
            // Fan of 7 Jewel-Glass Tail Feathers!
            for (var f = 0; f < 7; f++) {
              var fa = -Math.PI + 0.32 + (f / 6) * (Math.PI - 0.64);
              var fx1 = Math.cos(fa) * 118, fy1 = Math.sin(fa) * 118;
              S.drawCutoutPaperEdge(
                ctx,
                [[0, 10], [fx1 - 18, fy1], [fx1 + 18, fy1]],
                SEXTINE_COLS_20[f % SEXTINE_COLS_20.length],
                "#14110d",
                { paperRim: 2.0, shadow: false }
              );
            }
            // Golden Saint Halo Ring
            S.drawCutoutPaperEdge(ctx, starPolygon(0, -34, 46, 40, 12, t * 0.5), "#fbbf24", "#14110d", { paperRim: 2.0, shadow: false });
            // Stained-Glass Turkey Bust + Ruby Wattle + Amber Beak!
            S.drawCutoutPaperEdge(ctx, [[-34, 65], [-26, -24], [0, -48], [26, -24], [34, 65]], "#92400e", "#14110d", { paperRim: 2.5, shadow: false });
            S.drawCutoutPaperEdge(ctx, [[4, -18], [26, -8], [6, 2]], "#f59e0b", "#14110d", { paperRim: 1.5, shadow: false });
            S.drawCutoutPaperEdge(ctx, [[4, -4], [18, 16], [4, 24]], "#dc2626", "#14110d", { paperRim: 1.5, shadow: false });
            ctx.restore();

            S.drawMailSnail(ctx, cx + 145, 225, 1.10, t, { rot: 0.4, postcard: false });
            drawExpressiveTurkey(ctx, S, 152, 492, 1.18, t, "crown");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Sunday Creek Bulletin Board Delivery: potluck flyer + Trout carrying watercress casserole + water-lilies!
            var t = resolved.t;
            var u = outEnter(resolved, 0.8);
            drawSceneBase20(ctx, W, H, resolved, plates, S, BG);
            drawGothicArch20(ctx, S, plates.portholeImg, 475, 104, 315, 408, t, {});

            // Wooden Chapel Bulletin Board with Freshly Pinned Potluck Flyer (pure vector pie/leaf icon!)
            var bx = 705, by = 295;
            S.drawCardboardPuppetPiece(ctx, [[bx - 78, by - 95], [bx + 78, by - 95], [bx + 78, by + 95], [bx - 78, by + 95]], {
              tone: "#785333",
              ribs: 3
            });
            S.drawCutoutPaperEdge(ctx, [[bx - 54, by - 68], [bx + 54, by - 68], [bx + 54, by + 68], [bx - 54, by + 68]], "#fbfaf7", "#0f8f80", { paperRim: 2.5 });
            S.drawSplitPin(ctx, bx, by - 56, 4.5, { metal: "brass" });
            // Vector potluck pie & ruled lines on flyer
            ctx.fillStyle = "#d97706";
            ctx.beginPath(); ctx.arc(bx, by - 12, 22, 0, Math.PI); ctx.fill();
            ctx.strokeStyle = "#15803d";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(bx - 34, by + 24); ctx.lineTo(bx + 34, by + 24);
            ctx.moveTo(bx - 26, by + 40); ctx.lineTo(bx + 26, by + 40);
            ctx.stroke();

            // Brook Trout carrying a covered dish of green watercress salad!
            var tx = 955, ty = 375 + Math.sin(t * 2.4) * 6;
            S.drawBrookTrout(ctx, tx, ty, 1.18, t, true);
            var dishX = 835, dishY = 392 + Math.sin(t * 2.4) * 6;
            S.drawCutoutPaperEdge(ctx, [[dishX - 46, dishY], [dishX + 46, dishY], [dishX + 36, dishY + 22], [dishX - 36, dishY + 22]], "#cbd5e1", "#14110d", { paperRim: 2.2 });
            S.drawCutoutPaperEdge(ctx, [[dishX - 38, dishY], [dishX, dishY - 26], [dishX + 38, dishY]], "rgba(226, 232, 240, 0.72)", "#14110d", { paperRim: 2.0 });
            ctx.fillStyle = "#16a34a";
            ctx.beginPath(); ctx.arc(dishX - 10, dishY - 6, 9, 0, TAU); ctx.arc(dishX + 10, dishY - 6, 9, 0, TAU); ctx.fill();

            // Blooming pink paper water-lilies along bottom sill + Mail Snail!
            var lilies = [330, 560, 890];
            for (var li = 0; li < 3; li++) {
              var lx = lilies[li], ly = 548;
              S.drawCutoutPaperEdge(ctx, [[lx - 34, ly + 8], [lx + 34, ly + 8], [lx + 24, ly + 18], [lx - 24, ly + 18]], "#15803d", "#14110d", { paperRim: 1.8 });
              S.drawCutoutPaperEdge(ctx, [[lx - 22, ly + 6], [lx - 14, ly - 18 * clamp(u, 0, 1)], [lx, ly - 26 * clamp(u, 0, 1)], [lx + 14, ly - 18 * clamp(u, 0, 1)], [lx + 22, ly + 6]], "#f472b6", "#14110d", { paperRim: 2.0 });
            }
            S.drawMailSnail(ctx, bx - 15, by + 118, 1.18, t, { postcard: true, hasReply: true });
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Decoded Rosetta Pebble Star Map: emerald slime constellation lines + Alien Saucer!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase20(ctx, W, H, resolved, plates, S, BG, { atlasFilter: "cyan" });
            var cx = 640;
            drawGothicArch20(ctx, S, plates.portholeImg, cx, 152, 355, 410, t, { filter: "cyan" });

            var mapNodes = [
              [cx - 95, 435], [cx - 115, 335], [cx - 55, 255], [cx, 205],
              [cx + 62, 260], [cx + 112, 345], [cx + 88, 440], [cx, 355]
            ];
            BG.drawTractorRings(ctx, 640, 102, cx, 265, t, { spread: 160, rings: 5 });

            // Glowing emerald slime star-chart lines connecting colored pebbles!
            ctx.save();
            ctx.strokeStyle = "#34d399";
            ctx.lineWidth = 3.8;
            ctx.beginPath();
            for (var i = 0; i < mapNodes.length; i++) {
              var nxt = mapNodes[(i + 1) % mapNodes.length];
              ctx.moveTo(mapNodes[i][0], mapNodes[i][1]);
              ctx.lineTo(nxt[0], nxt[1]);
            }
            ctx.moveTo(mapNodes[3][0], mapNodes[3][1]);
            ctx.lineTo(mapNodes[7][0], mapNodes[7][1]);
            ctx.stroke();

            for (var k = 0; k < mapNodes.length; k++) {
              BG.drawLanternHalo(ctx, mapNodes[k][0], mapNodes[k][1], 32 * u, { t: t + k, color: "#34d399", intensity: 1.0 });
              var sp = starPolygon(mapNodes[k][0], mapNodes[k][1], 13, 6, 4, t + k);
              S.drawCutoutPaperEdge(ctx, sp, SEXTINE_COLS_20[k % 6], "#fbfaf7", { paperRim: 1.6, shadow: false });
            }
            ctx.restore();

            S.drawMailSnail(ctx, cx - 95, 445, 1.10, t, { postcard: true, hasAlienStamp: true });
            S.drawAlienSaucer(ctx, 640, 92, 1.24, t, cx, 235, { beam: false });
          }
        },
        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Loose Pebble Shard Trickles Bubbles + Wincing Turkey!
            var t = resolved.t;
            var u = outEnter(resolved, 0.75);
            drawSceneBase20(ctx, W, H, resolved, plates, S, BG);
            var cx = 655;
            drawGothicArch20(ctx, S, plates.portholeImg, cx, 102, 355, 425, t, { jewels: false });

            // Tilted loose central ruby vent window on lead split-pin hinge!
            var rx = cx, ry = 235;
            ctx.fillStyle = "#090d16";
            ctx.beginPath();
            ctx.moveTo(rx, ry - 48); ctx.lineTo(rx + 42, ry); ctx.lineTo(rx, ry + 48); ctx.lineTo(rx - 42, ry);
            ctx.closePath(); ctx.fill();

            ctx.save();
            ctx.translate(rx - 42, ry);
            ctx.rotate(0.62 * clamp(u, 0, 1.1) + Math.sin(t * 7.0) * 0.08);
            S.drawCutoutPaperEdge(ctx, [[42, -48], [84, 0], [42, 48], [0, 0]], "#dc2626", "#14110d", { paperRim: 3.0 });
            S.drawSplitPin(ctx, 0, 0, 4.5, { metal: "silver" });
            ctx.restore();

            // Stream of lustrous silver pearl bubbles trickling out of the loose ruby window!
            for (var pb = 0; pb < 12; pb++) {
              var pu = ((t * 0.55 + pb / 12) % 1);
              var bx = rx + 12 + Math.sin(t * 4.5 + pb) * 18;
              var by = lerp(ry, 78, pu);
              ctx.fillStyle = "#f8fafc";
              ctx.strokeStyle = "#14110d";
              ctx.lineWidth = 1.6;
              ctx.beginPath(); ctx.arc(bx, by, 7.5 * (1 - pu * 0.35), 0, TAU); ctx.fill(); ctx.stroke();
            }

            drawExpressiveTurkey(ctx, S, 142, 502, 1.05, t, "sink");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Flip-Open Pickle Jar Snack Window: hinged stained-glass awning + Brook Trout handing brown lunch sack to Snail!
            var t = resolved.t;
            var u = outEnter(resolved, 0.8);
            drawSceneBase20(ctx, W, H, resolved, plates, S, BG);
            var cx = 610, topY = 115;

            // Warm diner counter interior behind propped-open stained-glass window!
            S.drawCardboardPuppetPiece(ctx, [[cx - 148, topY + 75], [cx + 148, topY + 75], [cx + 155, 515], [cx - 155, 515]], {
              tone: "#1e293b",
              ribs: 2
            });
            BG.drawLanternHalo(ctx, cx, 325, 165, { t: t, color: "#fde047", intensity: 0.95 });

            // Brook Trout inside diner window wearing white paper soda-jerk cap!
            S.drawBrookTrout(ctx, cx + 38, 345, 1.15, t, true);
            S.drawCutoutPaperEdge(ctx, [[cx - 32, 312], [cx + 16, 304], [cx + 12, 286], [cx - 28, 294]], "#fbfaf7", "#d42a1e", { paperRim: 2.0 });

            // Brown Kraft Paper Lunch Sack handed out across the counter sill!
            var bagX = cx - 68 + Math.sin(t * 3.5) * 6;
            var bagY = 382;
            S.drawCutoutPaperEdge(ctx, [[bagX - 28, bagY - 38], [bagX + 28, bagY - 34], [bagX + 32, bagY + 38], [bagX - 32, bagY + 38]], "#d4a373", "#14110d", { paperRim: 2.5 });

            // Hinged stained-glass panel swung upward at top & propped on wooden stick!
            var propAng = -0.78 * clamp(u, 0, 1.06);
            ctx.save();
            ctx.translate(cx, topY + 25);
            ctx.rotate(propAng);
            drawPlateFrac(ctx, S, plates.portholeImg, 0.32, 0.16, 0.36, 0.42, -165, 0, 330, 340, POLY_ARCH_20, { haloWidth: 5.0 });
            ctx.restore();
            // Wooden prop stick
            S.drawCardboardPuppetPiece(ctx, [[cx + 128, 420], [cx + 136, 420], [cx + 195, 245], [cx + 187, 245]], { tone: "#92400e", shadow: false });

            // Wooden counter ledge + Mail Snail receiving lunch sack!
            S.drawTornPaperFlat(ctx, cx - 185, 422, 370, 34, { fill: "#78350f", paperColor: "#fbfaf5", deckle: 4 });
            S.drawMailSnail(ctx, cx - 135, 412, 1.18, t, { postcard: false });
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Shatterless Anti-Gravity Gem Kaleidoscope: 30 floating river-glass gems spinning in 3 mandala rings!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.85);
            drawSceneBase20(ctx, W, H, resolved, plates, S, BG, { atlasFilter: "cyan", atlasAlpha: 0.48 });
            var cx = 640, cy = 355;

            // Empty dark lead skeleton frame below
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 9;
            ctx.beginPath();
            ctx.moveTo(cx - 140, 540);
            ctx.quadraticCurveTo(cx - 140, 250, cx, 175);
            ctx.quadraticCurveTo(cx + 140, 250, cx + 140, 540);
            ctx.stroke();

            BG.drawTractorRings(ctx, 640, 102, cx, cy, t, { spread: 230, rings: 6 });

            // 30 Glowing River-Glass Gems orbiting in 3 counter-rotating Rose-Window Mandala Rings!
            var rings = [
              { n: 6,  r: 58,  spd: 1.5 },
              { n: 10, r: 118, spd: -1.1 },
              { n: 14, r: 182, spd: 0.8 }
            ];
            for (var ri = 0; ri < rings.length; ri++) {
              var rg = rings[ri];
              for (var gi = 0; gi < rg.n; gi++) {
                var a = t * rg.spd + (gi / rg.n) * TAU;
                var gx = cx + Math.cos(a) * rg.r * u;
                var gy = cy + Math.sin(a) * rg.r * 0.82 * u;
                var col = SEXTINE_COLS_20[(ri * 3 + gi) % 6];
                ctx.save();
                ctx.translate(gx, gy);
                ctx.rotate(a + Math.PI * 0.25);
                S.drawCutoutPaperEdge(ctx, [[-16, 0], [0, -22], [16, 0], [0, 22]], col, "#fbfaf7", { paperRim: 2.0, shadow: false });
                ctx.restore();
              }
            }

            S.drawAlienSaucer(ctx, 640, 92, 1.24, t, cx, cy, { beam: false });
          }
        }
      }
    });
  }

  // ============================================================================
  // PORTHOLE #21 · Fwd ("perec-stage")
  // Renzo e Luciana × S19 MohoRig × p21.jpg + atlas-01.webp
  // ============================================================================

  function drawSceneBase21(ctx, W, H, resolved, plates, S, BG, opts) {
    var cfg = opts || {};
    var t = resolved.t;
    var aImg = plates.atlasImg;
    var pImg = plates.portholeImg;

    drawPlateFrac(
      ctx, S, aImg,
      0.04, 0.04, 0.92, 0.42,
      195, 82, 415, 195,
      [[0.04, 0.06], [0.96, 0.03], [0.98, 0.92], [0.02, 0.96]],
      { filter: cfg.atlasFilter || "sepia", haloWidth: 3.8, alpha: 0.82 }
    );
    drawPlateFrac(
      ctx, S, aImg,
      0.46, 0.06, 0.50, 0.50,
      675, 84, 415, 200,
      [[0.03, 0.05], [0.97, 0.04], [0.95, 0.95], [0.05, 0.93]],
      { filter: "cyan", haloWidth: 3.8, alpha: 0.80 }
    );
    if (BG && cfg.caustics !== false) {
      BG.drawWaterCaustics(ctx, W, H, t, { intensity: 0.15, topY: 78 });
    }
    if (cfg.fgRocks !== false) {
      drawPlateFrac(ctx, S, pImg, 0.22, 0.42, 0.17, 0.22, 148, 418, 215, 178, [[0.04, 0.12], [0.68, 0.04], [0.96, 0.54], [0.92, 0.96], [0.04, 0.96]], { haloWidth: 4.2 });
      drawPlateFrac(ctx, S, pImg, 0.58, 0.54, 0.25, 0.27, 912, 424, 225, 174, [[0.18, 0.08], [0.94, 0.04], [0.96, 0.96], [0.04, 0.95]], { haloWidth: 4.2 });
    }
  }

  function drawYellowBus21(ctx, S, plates, busX, busY, t, opts) {
    var cfg = opts || {};
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var busW = 860, busH = 272;

    ctx.save();
    ctx.translate(busX, busY);
    if (cfg.rot) {
      ctx.translate(busW * 0.5, busH * 0.5);
      ctx.rotate(cfg.rot);
      ctx.translate(-busW * 0.5, -busH * 0.5);
    }

    S.drawTornPaperFlat(ctx, 0, 0, busW, busH, {
      fill: cfg.busColor || "#dfaa3b",
      paperColor: "#fbfaf5",
      deckle: 6.0,
      stroke: "#14110d",
      seed: 21.4
    });
    S.drawCardboardPuppetPiece(ctx, [[-6, -12], [busW + 6, -12], [busW - 14, 18], [14, 18]], {
      tone: cfg.roofColor || "#c9922c",
      ribs: 1
    });
    drawPlateFrac(ctx, S, pImg, 0.23, 0.50, 0.56, 0.18, 36, 192, 680, 74, [[0.02, 0.08], [0.98, 0.05], [0.96, 0.94], [0.03, 0.92]], {
      haloWidth: 3.5, alpha: 0.92
    });

    // Wheels (or hover-folded wheels in zero-G abduction!)
    var wheelXs = [165, 625];
    for (var wi = 0; wi < 2; wi++) {
      ctx.save();
      ctx.translate(wheelXs[wi], busH + 4);
      if (cfg.hoverWheels) {
        ctx.scale(1.18, 0.36);
        S.drawCutoutPaperEdge(ctx, starPolygon(0, 0, 46, 42, 8, 0), "#334155", "#38bdf8", { paperRim: 3.0 });
      } else {
        ctx.rotate(t * (cfg.wheelSpeed != null ? cfg.wheelSpeed : 0.8));
        S.drawCutoutPaperEdge(ctx, [[-42, -14], [-18, -42], [18, -42], [42, -14], [42, 18], [18, 42], [-18, 42], [-42, 18]], "#2f3133", "#14110d", { paperRim: 3.5 });
        S.drawSplitPin(ctx, 0, 0, 5.5, { metal: "brass" });
      }
      ctx.restore();
    }

    // 5 Window Bays + 5 Giant Trout Commuters!
    for (var i = 0; i < 5; i++) {
      var winX = 34 + i * 144;
      var winY = 34;
      var winW = 128;
      var winH = 148;
      ctx.fillStyle = cfg.winBg || "#1c4a52";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 3.2;
      ctx.fillRect(winX, winY, winW, winH);
      ctx.strokeRect(winX, winY, winW, winH);

      ctx.save();
      var liftY = cfg.zeroG ? (-14 - Math.sin(t * 3.0 + i) * 8) : (cfg.bobAmp ? Math.sin(t * 9.0 + i) * cfg.bobAmp : 0);
      ctx.translate(winX + winW * 0.5, winY + winH * 0.62 + liftY);

      if (cfg.stareFront) {
        // Deadpan front-facing giant fish head staring straight at camera!
        S.drawCutoutPaperEdge(ctx, [[-44, 38], [-48, -22], [0, -56], [48, -22], [44, 38]], "#7c9082", "#14110d", { paperRim: 3.2 });
        ctx.fillStyle = "#fbfaf5";
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(-18, -14, 12, 0, TAU);
        ctx.arc(18, -14, 12, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#14110d";
        ctx.beginPath();
        ctx.arc(-18, -12, 5.0, 0, TAU);
        ctx.arc(18, -12, 5.0, 0, TAU);
        ctx.fill();
        // Flat unamused frown + tiny steaming coffee mug on window sill!
        ctx.beginPath(); ctx.moveTo(-16, 12); ctx.lineTo(16, 12); ctx.stroke();
        S.drawCutoutPaperEdge(ctx, [[16, 20], [42, 20], [38, 48], [20, 48]], "#fbfaf7", "#d42a1e", { paperRim: 1.8 });
      } else {
        var useA = (i % 2 === 1 && aImg);
        drawPlateFrac(
          ctx, S, useA ? aImg : pImg,
          useA ? 0.06 : (0.22 + i * 0.115),
          useA ? 0.44 : 0.32,
          useA ? 0.64 : 0.115,
          useA ? 0.34 : 0.17,
          -52, -62, 78, 86,
          [[0.08, 0.08], [0.92, 0.05], [0.96, 0.92], [0.06, 0.95]],
          { haloWidth: 3.2, rot: Math.sin(t * 2.4 + i * 0.8) * 0.04 }
        );
        S.drawCardboardPuppetPiece(ctx, [[-44, 14], [-8, 6], [6, 48], [-48, 48]], { tone: "#4b6b78", ribs: 1 });

        if (cfg.squint) {
          ctx.strokeStyle = "#14110d";
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.moveTo(-18, -32); ctx.lineTo(-2, -26); ctx.lineTo(-18, -20);
          ctx.stroke();
        }

        // Custom per-window prop / tablet callback
        if (cfg.drawWindowProp) {
          cfg.drawWindowProp(ctx, i, t);
        } else {
          // Default glowing aqua tablet + tapping IK fin
          var sx = 28, sy = -4 + Math.sin(t * 3.1 + i) * 2.5;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(-0.18);
          S.drawCutoutPaperEdge(ctx, [[-18, -24], [18, -24], [18, 24], [-18, 24]], cfg.screenCol || "#67e8f9", "#14110d", { paperRim: 2.5 });
          ctx.restore();
          var tap = Math.max(0, Math.sin(t * 7.5 + i * 1.25));
          drawIKLimb(ctx, S, -22, 20, 26, 24, sx - 10 + tap * 9, sy + 4 - tap * 5, 1, {
            w0: 8.5, w1: 6.5, w2: 5.0, upperTone: "#8f9c8a", lowerTone: "#b87458", pinR: 3.2
          });
        }
      }
      ctx.restore();
    }

    if (cfg.drawOnBus) {
      cfg.drawOnBus(ctx, busW, busH);
    }
    ctx.restore();
  }

  function registerPortal21(BG) {
    BG.definePortalGame(21, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        S.drawBolasBackdrop(
          ctx, W, H,
          resolved.bolasStyle,
          21,
          resolved.t,
          { showCaptions: resolved.showCaptions, lamp: resolved.lampOn, ballast: resolved.ballastOn },
          { openX: 146, openY: 68, openW: 988, openH: 540, doors: true }
        );
      },
      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawCornerPortholeRim(ctx, W, H, S);
      },
      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawSceneBase21(ctx, W, H, resolved, plates, S, BG);
        drawYellowBus21(ctx, S, plates, 210, 198 + Math.sin(t * 1.5) * 3, t, {});
        BG.drawVolumetricBeam(ctx, 640, 624, 640, 320, { color: "#fde68a", spread: 240, intensity: 0.36, t: t });
      },
      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.7);
          drawSceneBase21(ctx, W, H, resolved, plates, S, BG);
          drawYellowBus21(ctx, S, plates, 210, 198, t, {
            squint: true,
            screenCol: "#ffffff"
          });
          // Glaring blue-white searchlight sweep across all 5 bus windows!
          var sweepX = 320 + ((Math.sin(t * 3.2) * 0.5 + 0.5) * 610);
          BG.drawVolumetricBeam(ctx, 640, 626, sweepX, 290, {
            color: "#3b82f6",
            coreColor: "#ffffff",
            spread: 265,
            intensity: 1.45 * su,
            t: t
          });
          for (var i = 0; i < 5; i++) {
            BG.drawLanternHalo(ctx, 308 + i * 144, 305, 68 * su, { t: t + i, color: "#93c5fd", coreColor: "#ffffff", intensity: 1.2 * su });
          }
        },
        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.72);
          drawSceneBase21(ctx, W, H, resolved, plates, S, BG);
          var rockRot = (0.045 + Math.sin(t * 9.5) * 0.065) * su;
          var bounceY = (-16 + Math.sin(t * 9.5) * 14) * su;
          drawBallastJet(ctx, S, BG, 1085, 555, 680, 320, 1.25 * su, t, { spread: 105, count: 20 });
          drawYellowBus21(ctx, S, plates, 210, 198 + bounceY, t, { rot: rockRot, wheelSpeed: 4.2 });
          // Bold brass sub-horn trumpet mouth + expanding crimson horn soundwave arcs!
          S.drawCutoutPaperEdge(ctx, [[1055, 545], [975, 495], [995, 455], [1075, 520]], "#d97706", "#14110d", { paperRim: 3.0 });
          for (var h = 0; h < 4; h++) {
            var hu = ((t * 1.35 + h / 4) % 1);
            ctx.strokeStyle = "rgba(220, 38, 38, " + ((1 - hu) * 0.92 * su).toFixed(3) + ")";
            ctx.lineWidth = 5.5;
            ctx.beginPath();
            ctx.arc(985, 478, 36 + hu * 320, Math.PI * 0.82, Math.PI * 1.48);
            ctx.stroke();
          }
        },
        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.85);
          drawSceneBase21(ctx, W, H, resolved, plates, S, BG);
          drawYellowBus21(ctx, S, plates, 210, 198, t, {
            drawOnBus: function (g) {
              // 5 Yellow Paper Bus Transfer Tickets clipped along the window sill with green Snail punches!
              for (var k = 0; k < 5; k++) {
                var tx = 96 + k * 144;
                S.drawCutoutPaperEdge(g, [[tx - 16, 174], [tx + 16, 174], [tx + 16, 214], [tx - 16, 214]], "#fef08a", "#14110d", { paperRim: 2.0 });
                if (su > k * 0.16) {
                  g.fillStyle = "#0f8f80";
                  g.beginPath(); g.arc(tx, 196, 5.5, 0, TAU); g.fill();
                }
              }
            }
          });
          var sx = lerp(245, 895, su);
          BG.drawSnailSilverTrail(ctx, 245, 386, sx, 386, 1.0, t, { arc: 6 });
          S.drawMailSnail(ctx, sx, 382, 1.18, t, { postcard: false, trail: false });
        },
        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.7);
          drawSceneBase21(ctx, W, H, resolved, plates, S, BG);
          var pullY = 48 * su + Math.sin(t * 14.0) * 5 * su;
          drawYellowBus21(ctx, S, plates, 210, 198, t, {
            drawOnBus: function (g) {
              // Sagging yellow STOP REQUESTED wire pulled down across all 5 windows + red bell beacon!
              g.strokeStyle = "#facc15";
              g.lineWidth = 4.5;
              g.beginPath();
              g.moveTo(34, 48);
              g.quadraticCurveTo(595, 48 + pullY * 1.7, 755, 48);
              g.stroke();
              // Glowing red stop-bell lamp at front cab
              BG.drawLanternHalo(g, 800, 62, 48 * su, { t: t, color: "#ef4444", intensity: 1.2 * su });
              S.drawCutoutPaperEdge(g, [[782, 44], [818, 44], [818, 80], [782, 80]], "#dc2626", "#fbfaf5", { paperRim: 2.0 });
            }
          });
          drawBrassScissorProbe(ctx, S, BG, 1060, 598, 210 + 595, 198 + 48 + pullY, su, t, { l1: 195, l2: 195, bend: -1 });
        }
      },
      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Enemy Fish Hacking Our Sonar: 5 green radar crosshairs + spy headsets + roof dish + Shutter Turkey!
            var t = resolved.t;
            var u = outEnter(resolved, 0.8);
            drawSceneBase21(ctx, W, H, resolved, plates, S, BG);

            drawYellowBus21(ctx, S, plates, 215, 202, t, {
              busColor: "#b68834",
              winBg: "#081c15",
              drawWindowProp: function (g, i) {
                // Spy headset + blinking red mic boom!
                g.strokeStyle = "#14110d";
                g.lineWidth = 3.5;
                g.beginPath(); g.arc(-14, -26, 26, -Math.PI * 0.85, 0.2); g.stroke();
                g.fillStyle = "#ef4444";
                g.beginPath(); g.arc(8, -6, 4.5, 0, TAU); g.fill();
                // Green Radar Screen with submarine crosshairs!
                S.drawCutoutPaperEdge(g, [[8, -28], [52, -28], [52, 22], [8, 22]], "#052e16", "#22c55e", { paperRim: 2.2 });
                g.strokeStyle = "#4ade80";
                g.lineWidth = 1.6;
                g.beginPath();
                g.arc(30, -3, 16, 0, TAU);
                g.moveTo(14, -3); g.lineTo(46, -3);
                g.moveTo(30, -19); g.lineTo(30, 13);
                g.stroke();
                drawIKLimb(g, S, -20, 20, 24, 22, 14, 2, 1, { w0: 8, w1: 6, w2: 5 });
              },
              drawOnBus: function (g) {
                // Spinning Radar Dish on Bus Roof!
                g.save();
                g.translate(430, -24 * clamp(u, 0, 1));
                g.rotate(Math.sin(t * 4.0) * 0.45);
                S.drawCutoutPaperEdge(g, [[-44, -18], [0, 8], [44, -18], [28, 12], [-28, 12]], "#64748b", "#14110d", { paperRim: 2.5 });
                S.drawSplitPin(g, 0, 4, 4.5, { metal: "brass" });
                g.restore();
              }
            });

            drawExpressiveTurkey(ctx, S, 138, 498, 1.05, t, "shutter");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Five Commuters Playing Minnow Solitaire: giant tilted Solitaire cards & crosswords + Driver Brook Trout!
            var t = resolved.t;
            var u = outEnter(resolved, 0.8);
            drawSceneBase21(ctx, W, H, resolved, plates, S, BG);

            drawYellowBus21(ctx, S, plates, 185, 202, t, {
              drawWindowProp: function (g, i) {
                // Oversized Tablet tilted toward us showing Solitaire Cards or Crossword Grid!
                g.save();
                g.translate(24, -4);
                g.scale(clamp(u, 0.3, 1.05), clamp(u, 0.3, 1.05));
                S.drawCutoutPaperEdge(g, [[-26, -34], [26, -34], [26, 34], [-26, 34]], "#15803d", "#14110d", { paperRim: 2.5 });
                if (i % 2 === 0) {
                  // Solitaire cascading playing cards with red diamond!
                  for (var c = 0; c < 3; c++) {
                    g.fillStyle = "#fbfaf7";
                    g.strokeStyle = "#14110d";
                    g.lineWidth = 1.2;
                    g.fillRect(-18 + c * 9, -24 + c * 10, 18, 26);
                    g.strokeRect(-18 + c * 9, -24 + c * 10, 18, 26);
                  }
                  g.fillStyle = "#dc2626";
                  g.beginPath();
                  g.moveTo(9, -4); g.lineTo(14, 3); g.lineTo(9, 10); g.lineTo(4, 3);
                  g.closePath(); g.fill();
                } else {
                  // Black-and-white crossword puzzle grid!
                  g.fillStyle = "#fbfaf7";
                  g.fillRect(-18, -24, 36, 48);
                  g.fillStyle = "#14110d";
                  for (var r = 0; r < 4; r++) {
                    for (var cl = 0; cl < 3; cl++) {
                      if ((r + cl + i) % 2 === 0) g.fillRect(-16 + cl * 11, -22 + r * 11, 9, 9);
                    }
                  }
                }
                g.restore();
              },
              drawOnBus: function (g) {
                // Driver Brook Trout in peaked blue bus-driver cap shrugging at front right cab!
                S.drawBrookTrout(g, 835, 118, 0.95, t, false);
                S.drawCutoutPaperEdge(g, [[842, 86], [888, 86], [896, 98], [838, 98]], "#1e3a8a", "#fbbf24", { paperRim: 1.8 });
              }
            });

            S.drawMailSnail(ctx, 1045, 526, 1.20, t, { postcard: true, hasReply: true });
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Giant Hive-Mind Telepathy Titans Sync: 5 forehead third-eyes firing cyan mind-lasers to Alien Saucer!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase21(ctx, W, H, resolved, plates, S, BG, { atlasFilter: "cyan" });

            drawYellowBus21(ctx, S, plates, 210, 224, t, {
              busColor: "#4c1d95",
              roofColor: "#6d28d9",
              winBg: "#1e1b4b",
              zeroG: true,
              screenCol: "#38bdf8"
            });

            // 5 Forehead Third-Eyes firing synchronized Cyan Laser Beams into Alien Saucer!
            for (var i = 0; i < 5; i++) {
              var fx = 210 + 98 + i * 144;
              var fy = 224 + 78 - Math.sin(t * 3.0 + i) * 8;
              BG.drawVolumetricBeam(ctx, fx, fy, 640, 118, {
                color: "#06b6d4",
                coreColor: "#ffffff",
                sourceRadius: 10,
                spread: 24 * u,
                intensity: 1.25 * u,
                motes: 3,
                t: t + i
              });
              ctx.fillStyle = "#f43f5e";
              ctx.strokeStyle = "#fbfaf7";
              ctx.lineWidth = 2;
              ctx.beginPath(); ctx.arc(fx, fy, 8.5, 0, TAU); ctx.fill(); ctx.stroke();
            }

            S.drawAlienSaucer(ctx, 640, 98, 1.26, t, 640, 224, { beam: false });
          }
        },
        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Road-Rage Commuter Carpool Staredown: 5 deadpan front-facing trout over coffee mugs + Sinking Turkey!
            var t = resolved.t;
            drawSceneBase21(ctx, W, H, resolved, plates, S, BG);
            drawYellowBus21(ctx, S, plates, 215, 202, t, { stareFront: true });
            drawExpressiveTurkey(ctx, S, 138, 508, 1.04, t, "sink");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Delayed Creek Crosstown Bus Pullover: blinking amber turn-signals + Driver Brook Trout waving us past + Snail timetable!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.78);
            drawSceneBase21(ctx, W, H, resolved, plates, S, BG);
            var blinkOn = Math.sin(t * 9.0) > 0;

            drawYellowBus21(ctx, S, plates, 180, 212, t, {
              wheelSpeed: 0.2,
              drawOnBus: function (g, bw) {
                // Glowing emerald/gold EXPRESS header band above cab (pure vector chevrons, 0 text!)
                S.drawCutoutPaperEdge(g, [[bw - 155, -28], [bw - 18, -28], [bw - 18, 12], [bw - 155, 12]], "#064e3b", "#fbbf24", { paperRim: 2.2 });
                g.strokeStyle = "#34d399";
                g.lineWidth = 3.5;
                for (var ch = 0; ch < 4; ch++) {
                  var cx0 = bw - 135 + ch * 28;
                  g.beginPath();
                  g.moveTo(cx0, -16); g.lineTo(cx0 + 12, -8); g.lineTo(cx0, 0);
                  g.stroke();
                }

                // Blinking amber turn-signal lamps on front & rear bumper!
                if (blinkOn) {
                  BG.drawLanternHalo(g, bw + 4, 225, 62, { t: t, color: "#f59e0b", intensity: 1.4 });
                  BG.drawLanternHalo(g, 8, 225, 52, { t: t, color: "#f59e0b", intensity: 1.2 });
                }
                g.fillStyle = blinkOn ? "#facc15" : "#78350f";
                g.beginPath(); g.arc(bw + 2, 225, 12, 0, TAU); g.arc(8, 225, 11, 0, TAU); g.fill();

                // Driver Brook Trout leaning IK arm out cab window waving us ahead!
                S.drawBrookTrout(g, bw - 35, 112, 1.02, t, false);
                drawIKLimb(g, S, bw - 10, 128, 36, 36, bw + 48, 72 + Math.sin(t * 10.0) * 24, -1, {
                  upperTone: "#6c7b67", lowerTone: "#b87458", w0: 8.5, w1: 6.5, w2: 5.5
                });
              }
            });

            // Mail Snail inspecting unfolded pocket timetable!
            S.drawMailSnail(ctx, 995, 535, 1.18 * clamp(u, 0.4, 1), t, { postcard: true, hasReply: true });
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Orbital Space-Bus Abduction Express Lift: folded hover-wheels + tractor rings hoisting entire bus!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.85);
            drawSceneBase21(ctx, W, H, resolved, plates, S, BG, { atlasFilter: "cyan", fgRocks: false });

            var busY = lerp(245, 152, u) + Math.sin(t * 2.5) * 10;
            BG.drawTractorRings(ctx, 640, 88, 640, busY + 220, t, { spread: 340, rings: 7 });

            drawYellowBus21(ctx, S, plates, 210, busY, t, {
              rot: -0.05 + Math.sin(t * 2.0) * 0.03,
              hoverWheels: true,
              zeroG: true
            });

            S.drawAlienSaucer(ctx, 640, 84, 1.28, t, 640, busY + 60, { beam: false });
          }
        },
        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Undercover Fare-Inspector Spy Passports: 5 open leather badge wallets + Turkey searching feathers!
            var t = resolved.t;
            var u = outEnter(resolved, 0.78);
            drawSceneBase21(ctx, W, H, resolved, plates, S, BG);

            drawYellowBus21(ctx, S, plates, 215, 202, t, {
              winBg: "#1e293b",
              drawWindowProp: function (g, i) {
                // Flipped-open black leather Spy Wallet with Gold Star Shield Badge!
                g.save();
                g.translate(22, 6);
                g.scale(clamp(u, 0.2, 1.05), clamp(u, 0.2, 1.05));
                S.drawCardboardPuppetPiece(g, [[-24, -32], [24, -32], [24, 32], [-24, 32]], { tone: "#1c1917", shadow: false });
                var star = starPolygon(0, -10, 14, 6, 5, t + i);
                S.drawCutoutPaperEdge(g, star, "#fbbf24", "#14110d", { paperRim: 1.2, shadow: false });
                g.fillStyle = "#fbfaf7";
                g.fillRect(-14, 8, 28, 16);
                g.restore();
              }
            });

            S.drawMailSnail(ctx, 640, 392, 1.16, t, { postcard: true });
            // Scattered loose feathers around frantically rummaging Turkey!
            for (var f = 0; f < 4; f++) {
              var fx = 95 + f * 32 + Math.sin(t * 6 + f) * 8;
              var fy = 435 + (f % 2) * 22;
              S.drawCutoutPaperEdge(ctx, [[fx, fy], [fx + 18, fy - 10], [fx + 26, fy + 4], [fx + 6, fy + 8]], "#92400e", "#14110d", { paperRim: 1.5, shadow: false });
            }
            drawExpressiveTurkey(ctx, S, 140, 502, 1.05, t, "map");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Exact-Change Bus Token Scramble: Seat #3 Trout trading shiny pebble with Mail Snail + Brook Trout thumbs-up!
            var t = resolved.t;
            var u = outEnter(resolved, 0.8);
            drawSceneBase21(ctx, W, H, resolved, plates, S, BG);

            drawYellowBus21(ctx, S, plates, 190, 200, t, {
              drawOnBus: function (g) {
                // Seat #3 (middle window idx=2) upturned white pocket flaps + shiny silver pebble exchange!
                var midX = 34 + 2 * 144 + 64;
                S.drawCutoutPaperEdge(g, [[midX - 36, 182], [midX - 10, 182], [midX - 22, 212]], "#fbfaf7", "#14110d", { paperRim: 1.8 });
                S.drawCutoutPaperEdge(g, [[midX + 10, 182], [midX + 36, 182], [midX + 22, 212]], "#fbfaf7", "#14110d", { paperRim: 1.8 });
                // Shiny teal river pebble token gleaming between Trout fin and Mail Snail!
                BG.drawLanternHalo(g, midX, 224, 42 * clamp(u, 0, 1), { t: t, color: "#34d399", intensity: 1.1 });
                S.drawCutoutPaperEdge(g, starPolygon(midX, 224, 16, 13, 6, t), "#5eead4", "#14110d", { paperRim: 2.0 });
              }
            });

            S.drawMailSnail(ctx, 565, 438, 1.24, t, { postcard: true, hasReply: true });
            S.drawBrookTrout(ctx, 1025, 372, 1.14, t, true);
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Interstellar Commuter Pass To Sirius: cosmic destination roller + neon warp star-lane + Alien Saucer!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase21(ctx, W, H, resolved, plates, S, BG, { atlasFilter: "cyan", caustics: false, fgRocks: false });

            // Neon Hyperspace Star-Lane Speed Lines streaking horizontally behind bus!
            ctx.save();
            for (var sl = 0; sl < 22; sl++) {
              var sy = 95 + (sl * 23) % 480;
              var sx = 1140 - (((t * (420 + (sl % 5) * 90) + sl * 130) % 1080));
              var len = (85 + (sl % 4) * 45) * u;
              ctx.strokeStyle = sl % 2 === 0 ? "#38bdf8" : "#f472b6";
              ctx.lineWidth = 3.0;
              ctx.beginPath();
              ctx.moveTo(sx, sy);
              ctx.lineTo(sx - len, sy);
              ctx.stroke();
            }
            ctx.restore();

            drawYellowBus21(ctx, S, plates, 195, 222 + Math.sin(t * 4.0) * 6, t, {
              rot: -0.03,
              hoverWheels: true,
              screenCol: "#a855f7",
              drawOnBus: function (g, bw) {
                // Cosmic Destination Roller Box above cab showing Star & Ringed-Planet Vector Icons (0 text!)
                S.drawCutoutPaperEdge(g, [[bw - 210, -38], [bw - 24, -38], [bw - 24, 10], [bw - 210, 10]], "#0f172a", "#38bdf8", { paperRim: 2.5 });
                var stPts = starPolygon(bw - 165, -14, 15, 6, 5, t * 3);
                S.drawCutoutPaperEdge(g, stPts, "#fef08a", "#f59e0b", { paperRim: 1.2, shadow: false });
                g.strokeStyle = "#34d399";
                g.lineWidth = 2.5;
                g.beginPath();
                g.arc(bw - 78, -14, 10, 0, TAU);
                g.ellipse(bw - 78, -14, 22, 6, -0.25, 0, TAU);
                g.stroke();
              }
            });

            S.drawAlienSaucer(ctx, 985, 128, 1.22, t, 850, 235, { beamSpread: 110 });
          }
        },
        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Emergency Exit Alarm Spooks Crew: spinning crimson roof siren + 5 accusing fins + retreating tongs!
            var t = resolved.t;
            drawSceneBase21(ctx, W, H, resolved, plates, S, BG);

            drawYellowBus21(ctx, S, plates, 210, 202, t, {
              winBg: "#450a0a",
              drawWindowProp: function (g, i) {
                // Red warning screen + Accusing IK Fin pointing down-right at our tongs!
                S.drawCutoutPaperEdge(g, [[12, -26], [48, -26], [48, 18], [12, 18]], "#dc2626", "#fef08a", { paperRim: 2.0 });
                BG.drawGeometricSymbol(g, "x", 30, -4, 14, "#fef08a", 3.0);
                drawIKLimb(g, S, -18, 22, 32, 32, 42, 42 + Math.sin(t * 8 + i) * 5, -1, {
                  w0: 9, w1: 7, w2: 5.5, upperTone: "#8f9c8a", lowerTone: "#d42a1e"
                });
              },
              drawOnBus: function (g) {
                // Spinning Crimson Emergency Siren Beacon on Bus Roof!
                var beamAng = t * 7.5;
                BG.drawVolumetricBeam(g, 430, -24, 430 + Math.cos(beamAng) * 260, -24 + Math.sin(beamAng) * 90, {
                  color: "#ef4444", coreColor: "#fecaca", spread: 75, intensity: 1.4, t: t
                });
                S.drawCutoutPaperEdge(g, [[406, -4], [412, -38], [448, -38], [454, -4]], "#dc2626", "#14110d", { paperRim: 2.5 });
              }
            });

            drawBrassScissorProbe(ctx, S, BG, 1110, 620, 965, 515, 0.85, t, { sparks: false });
            drawExpressiveTurkey(ctx, S, 138, 508, 1.04, t, "sink");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Next Stop Room Four Porthole: folding doors open + briefcase trout tipping hats + Bus Stop lollipop sign!
            var t = resolved.t;
            var u = outEnter(resolved, 0.8);
            drawSceneBase21(ctx, W, H, resolved, plates, S, BG);

            drawYellowBus21(ctx, S, plates, 165, 202, t, {
              drawWindowProp: function (g, i) {
                // Miniature bowler hat tipped politely + brown leather briefcase!
                var tip = Math.sin(t * 4.5 + i) * 0.22;
                g.save();
                g.translate(-12, -62);
                g.rotate(-0.2 + tip);
                S.drawCutoutPaperEdge(g, [[-26, 4], [26, 4], [18, -14], [-18, -14]], "#1e293b", "#14110d", { paperRim: 1.8 });
                g.restore();
                S.drawCardboardPuppetPiece(g, [[8, 12], [44, 12], [44, 42], [8, 42]], { tone: "#78350f", shadow: false });
              },
              drawOnBus: function (g, bw) {
                // Wide Bi-Fold Accordion Bus Doors open at right front!
                S.drawCardboardPuppetPiece(g, [[bw - 102, 28], [bw - 12, 28], [bw - 12, 256], [bw - 102, 256]], { tone: "#0f172a" });
                var foldW = 24 * (1 - 0.5 * clamp(u, 0, 1));
                S.drawCardboardPuppetPiece(g, [[bw - 102, 30], [bw - 102 + foldW, 30], [bw - 102 + foldW, 254], [bw - 102, 254]], { tone: "#d97706" });
                S.drawBrookTrout(g, bw - 48, 165, 0.88, t, false);
              }
            });

            // Geometric Red-and-White Bus-Stop Lollipop Sign Post (0 text!) + Mail Snail waiting!
            var postX = 1075;
            S.drawCardboardPuppetPiece(ctx, [[postX - 5, 255], [postX + 5, 255], [postX + 5, 545], [postX - 5, 545]], { tone: "#cbd5e1" });
            S.drawCutoutPaperEdge(ctx, starPolygon(postX, 245, 36, 34, 8, 0), "#dc2626", "#fbfaf7", { paperRim: 3.0 });
            ctx.fillStyle = "#fbfaf7";
            ctx.fillRect(postX - 20, 238, 40, 14);
            S.drawMailSnail(ctx, 1020, 535, 1.22, t, { flip: true, postcard: true, hasReply: true });
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Wind-Up Tin Bath-Toy Giant Key spinning on bus roof under Alien Saucer magnet ray!
            var t = resolved.t;
            var u = outEnter(resolved, 0.82);
            drawSceneBase21(ctx, W, H, resolved, plates, S, BG, { atlasFilter: "cyan" });

            // Colossal Spinning Brass Clockwork Key rising from Bus Roof!
            var keyX = 640, keyY = 235;
            BG.drawTractorRings(ctx, 640, 92, keyX, keyY, t, { spread: 135, rings: 5 });

            ctx.save();
            ctx.translate(keyX, keyY);
            ctx.scale(Math.cos(t * 4.5) * clamp(u, 0.2, 1.05), clamp(u, 0.2, 1.05));
            // Key shaft
            S.drawCardboardPuppetPiece(ctx, [[-12, 0], [12, 0], [12, -98], [-12, -98]], { tone: "#d97706", ribs: 2 });
            // Double-loop bow handle of giant wind-up key!
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 16;
            ctx.beginPath();
            ctx.arc(-42, -108, 34, 0, TAU);
            ctx.arc(42, -108, 34, 0, TAU);
            ctx.stroke();
            ctx.strokeStyle = "#14110d";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(-42, -108, 42, 0, TAU);
            ctx.arc(42, -108, 42, 0, TAU);
            ctx.stroke();
            ctx.restore();

            drawYellowBus21(ctx, S, plates, 210, 232, t, {
              bobAmp: 12,
              wheelSpeed: 5.5
            });

            S.drawAlienSaucer(ctx, 640, 82, 1.20, t, keyX, keyY - 60, { beam: false });
          }
        }
      }
    });
  }

  // ============================================================================
  // PORTHOLE #22 · Trim ("queneau-rostrum")
  // Exercices de style Animated × S14 Pose2Pose × p22.jpg + atlas-33.webp
  // ============================================================================

  function drawSceneBase22(ctx, W, H, resolved, plates, S, BG, opts) {
    var cfg = opts || {};
    var t = resolved.t;
    var aImg = plates.atlasImg;
    var pImg = plates.portholeImg;

    if (cfg.zeroGFloor) {
      S.drawTornPaperFlat(ctx, 80, 518 + Math.sin(t * 2.1) * 18, 460, 46, {
        fill: "#273b19",
        rot: -0.05 + Math.sin(t * 1.4) * 0.03
      });
      S.drawTornPaperFlat(ctx, 640, 504 + Math.cos(t * 1.9) * 22, 520, 46, {
        fill: "#273b19",
        rot: 0.06 + Math.cos(t * 1.3) * 0.03
      });
    }

    if (cfg.trees !== false) {
      drawPlateFrac(ctx, S, aImg, 0.0, 0.02, 0.23, 0.88, 22, 68, 220, 460, [[0.04, 0.04], [0.92, 0.06], [0.88, 0.96], [0.06, 0.96]], {
        haloWidth: 4.5, filter: cfg.treeFilter || "none", alpha: 0.92
      });
      drawPlateFrac(ctx, S, aImg, 0.75, 0.02, 0.25, 0.88, 1035, 72, 220, 455, [[0.08, 0.06], [0.96, 0.04], [0.94, 0.96], [0.10, 0.95]], {
        haloWidth: 4.5, filter: cfg.treeFilter || "none", alpha: 0.92
      });
    }
    if (cfg.stones !== false) {
      var stoneY = cfg.zeroGFloor ? (475 + Math.sin(t * 2.3) * 22) : 478;
      drawPlateFrac(ctx, S, pImg, 0.26, 0.62, 0.48, 0.20, 355, stoneY, 530, 92, [[0.04, 0.22], [0.48, 0.06], [0.96, 0.18], [0.94, 0.94], [0.06, 0.92]], {
        haloWidth: 4.0
      });
    }
  }

  function drawIronKettlebell22(ctx, S, cx, cy, scale, opts) {
    var cfg = opts || {};
    var sc = scale || 1.0;
    ctx.save();
    ctx.translate(cx, cy);
    if (cfg.rot) ctx.rotate(cfg.rot);
    ctx.scale(sc, sc);

    // Cast-iron handle arch
    ctx.strokeStyle = "#fbfaf5";
    ctx.lineWidth = 20;
    ctx.beginPath(); ctx.arc(0, -44, 34, Math.PI * 0.95, Math.PI * 0.05, false); ctx.stroke();
    ctx.strokeStyle = "#232528";
    ctx.lineWidth = 14;
    ctx.beginPath(); ctx.arc(0, -44, 34, Math.PI * 0.95, Math.PI * 0.05, false); ctx.stroke();

    // Cross-hatched iron sphere + pure-vector "50" weight bars (0 text!)
    S.drawCutoutPaperEdge(
      ctx,
      [[-52, -24], [-34, -46], [34, -46], [52, -24], [58, 22], [38, 52], [-38, 52], [-58, 22]],
      cfg.color || "#383a3e",
      "#14110d",
      { paperRim: 4.0 }
    );
    S.drawEngravingCrosshatch(ctx, 84, 72, 0.24, 7, { x: -42, y: -32, color: "#fbfaf5" });
    drawVectorReadout(ctx, "50", 0, 4, 15, 26, "#f3d184", 2.8);
    ctx.restore();
  }

  function drawFinFlexCoach22(ctx, S, pImg, x, y, t, squat, opts) {
    var cfg = opts || {};
    ctx.save();
    ctx.translate(x, y + squat * 16);
    if (cfg.rot) ctx.rotate(cfg.rot);

    drawPlateFrac(
      ctx, S, pImg,
      0.23, 0.34, 0.22, 0.24,
      -102, -90, 204, 185,
      [[0.08, 0.12], [0.56, 0.04], [0.96, 0.16], [0.92, 0.62], [0.62, 0.96], [0.16, 0.88]],
      { haloWidth: 4.5, rot: -0.05 + squat * 0.08 }
    );

    // Striped red-and-white terrycloth sweatband on Coach forehead!
    S.drawCutoutPaperEdge(ctx, [[12, -62], [72, -52], [68, -38], [8, -48]], "#ef4444", "#14110d", { paperRim: 1.8, shadow: false });
    ctx.strokeStyle = "#fbfaf5";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(14, -55); ctx.lineTo(68, -45); ctx.stroke();

    // Swinging red lanyard & split-pin silver whistle!
    ctx.save();
    ctx.translate(28, -12);
    ctx.rotate(0.18 + Math.sin(t * 6.5) * 0.24);
    ctx.strokeStyle = "#d42a1e";
    ctx.lineWidth = 3.0;
    ctx.beginPath(); ctx.moveTo(-12, -20); ctx.quadraticCurveTo(6, 10, 16, 38); ctx.stroke();
    S.drawCardboardPuppetPiece(ctx, [[8, 34], [28, 32], [30, 50], [12, 52]], {
      tone: "#e2e8f0",
      pin: { x: 16, y: 38, r: 3.2, metal: "silver" }
    });
    ctx.restore();
    ctx.restore();
  }

  function drawSquatSquad22(ctx, S, pImg, count, startX, stepX, footY, squat, t, opts) {
    var cfg = opts || {};
    var n = count || 4;
    for (var i = 0; i < n; i++) {
      var bx = startX + i * stepX + (cfg.marchShift || 0);
      var fy = footY + (cfg.zeroG ? (-65 - Math.sin(t * 2.5 + i) * 24) : 0);
      var hy = fy - 104 + squat * 44;
      var hx = bx + (cfg.leanX || 0);

      ctx.save();
      if (cfg.upsideDown) {
        ctx.translate(hx, hy - 35);
        ctx.rotate(Math.PI + Math.sin(t * 3.0 + i) * 0.14);
        ctx.translate(-hx, -(hy - 35));
      } else if (cfg.leanRot) {
        ctx.translate(bx, fy);
        ctx.rotate(cfg.leanRot);
        ctx.translate(-bx, -fy);
      }

      var starSpread = cfg.starJump ? Math.sin(t * 8.0) * 28 : 0;
      drawIKLimb(ctx, S, hx - 8, hy + 14, 50, 50, bx - 22 - starSpread, fy, -1, {
        w0: 10.5, w1: 8.0, w2: 6.0, upperTone: "#6e7a68", lowerTone: "#8f9c8a"
      });
      drawIKLimb(ctx, S, hx + 12, hy + 14, 50, 50, bx + 12 + starSpread, fy, -1, {
        w0: 11.0, w1: 8.5, w2: 6.5, upperTone: "#8f9c8a", lowerTone: "#aebaa6"
      });

      drawPlateFrac(
        ctx, S, pImg,
        0.47 + (i % 3) * 0.11, 0.36, 0.12, 0.16,
        hx - 44, hy - 78, 92, 96,
        [[0.12, 0.06], [0.88, 0.08], [0.94, 0.90], [0.08, 0.92]],
        { haloWidth: 3.6 }
      );

      // Outstretched pectoral arm
      ctx.save();
      ctx.translate(hx - 10, hy - 18);
      ctx.rotate(-0.15 + squat * 0.35 + (cfg.starJump ? Math.sin(t * 8.0) * 0.65 : 0));
      S.drawCardboardPuppetPiece(ctx, [[6, -6], [-52, -9], [-58, 4], [6, 7]], {
        tone: "#9da896",
        pin: { x: 0, y: 0, r: 3.8, metal: "brass" }
      });
      if (cfg.guardSpears) {
        S.drawCardboardPuppetPiece(ctx, [[-52, -98], [-44, -98], [-44, 64], [-52, 64]], { tone: "#4b3b2a", shadow: false });
        S.drawCutoutPaperEdge(ctx, [[-60, -96], [-48, -128], [-36, -96]], "#cbd5e1", "#14110d", { paperRim: 2.0 });
      }
      ctx.restore();

      if (cfg.guardSpears) {
        S.drawCutoutPaperEdge(ctx, [[hx - 30, hy - 74], [hx - 24, hy - 110], [hx + 12, hy - 108], [hx + 16, hy - 72]], "#b91c1c", "#14110d", { paperRim: 2.2 });
      }
      ctx.restore();
    }
  }

  function registerPortal22(BG) {
    BG.definePortalGame(22, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var isZeroG = (resolved.phase === "outcome" && resolved.selectedTier === "preposterous");
        S.drawBolasBackdrop(
          ctx, W, H,
          resolved.bolasStyle,
          22,
          resolved.t,
          { showCaptions: resolved.showCaptions, lamp: resolved.lampOn, ballast: resolved.ballastOn },
          { floor: !isZeroG }
        );
      },
      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawCornerPortholeRim(ctx, W, H, S);
      },
      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawSceneBase22(ctx, W, H, resolved, plates, S, BG, {});
        var squat = 0.5 - 0.5 * Math.cos(t * TAU * 0.9);
        drawFinFlexCoach22(ctx, S, plates.portholeImg, 315, 295, t, squat, {});
        drawSquatSquad22(ctx, S, plates.portholeImg, 4, 520, 118, 478, squat, t, {});
        drawIronKettlebell22(ctx, S, 435, 505, 0.82, {});
        BG.drawDeterministicParticles(ctx, "bubbles", 355, 255, t, { count: 8, loop: true });
      },
      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.65);
          drawSceneBase22(ctx, W, H, resolved, plates, S, BG, {});
          var squat = 0.5 - 0.5 * Math.cos(t * TAU * 1.4);
          var beatIdx = Math.floor(t * 5.6) % 4;
          var discoCols = ["#2563eb", "#06b6d4", "#eab308", "#a855f7"];

          // 4 Rhythmic Disco Strobe Beams pulsing to squat count (source-over so cobalt/violet pop on buttercream!)
          for (var d = 0; d < 4; d++) {
            var active = (d === beatIdx) ? 1.25 : 0.55;
            BG.drawVolumetricBeam(ctx, 640, 626, 330 + d * 195, 145, {
              color: discoCols[d],
              coreColor: "#dbeafe",
              blend: "source-over",
              spread: 98,
              intensity: active * su,
              t: t + d
            });
          }
          // Cut-paper disco mirror-ball suspended at top center!
          S.drawCutoutPaperEdge(ctx, starPolygon(640, 118, 34 * su, 32 * su, 10, t * 1.8), "#e2e8f0", "#2563eb", { paperRim: 2.8 });
          S.drawEngravingCrosshatch(ctx, 48, 48, 0.4, 8, { x: 616, y: 94, color: "#1e3a8a" });
          drawFinFlexCoach22(ctx, S, plates.portholeImg, 315, 295, t, squat, {});
          drawSquatSquad22(ctx, S, plates.portholeImg, 4, 520, 118, 478, squat, t, {});
          BG.drawDeterministicParticles(ctx, "kintsugi", 640, 210, t, { count: 18, loop: true });
        },
        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.7);
          drawSceneBase22(ctx, W, H, resolved, plates, S, BG, {});
          var fastSquat = 0.5 - 0.5 * Math.cos(t * TAU * 2.1);
          drawBallastJet(ctx, S, BG, 1120, 345, 250, 345, su, t, { spread: 115, count: 20, speed: 1.4 });
          drawFinFlexCoach22(ctx, S, plates.portholeImg, 315, 295, t * 1.8, fastSquat, { rot: 0.16 * su });
          drawSquatSquad22(ctx, S, plates.portholeImg, 4, 520, 118, 478, fastSquat, t * 1.8, {
            leanRot: -0.26 * su
          });
        },
        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.8);
          drawSceneBase22(ctx, W, H, resolved, plates, S, BG, {});
          var squat = 0.5 - 0.5 * Math.cos(t * TAU * 0.9);
          drawFinFlexCoach22(ctx, S, plates.portholeImg, 305, 295, t, squat, {});
          drawSquatSquad22(ctx, S, plates.portholeImg, 4, 545, 115, 478, squat, t, {});

          // Kettlebell + Fitness Rep Clipboard with 3 Gold Star Checkmarks!
          drawIronKettlebell22(ctx, S, 435, 505, 0.85, {});
          var cbX = 435, cbY = 398;
          S.drawCutoutPaperEdge(ctx, [[cbX - 42, cbY - 52], [cbX + 42, cbY - 52], [cbX + 42, cbY + 52], [cbX - 42, cbY + 52]], "#fbfaf7", "#0f8f80", { paperRim: 2.5 });
          S.drawCardboardPuppetPiece(ctx, [[cbX - 20, cbY - 58], [cbX + 20, cbY - 58], [cbX + 20, cbY - 44], [cbX - 20, cbY - 44]], { tone: "#94a3b8", shadow: false });
          for (var st = 0; st < 3; st++) {
            if (su > 0.25 + st * 0.22) {
              var sPts = starPolygon(cbX - 16, cbY - 22 + st * 26, 11, 5, 5, 0);
              S.drawCutoutPaperEdge(ctx, sPts, "#fbbf24", "#14110d", { paperRim: 1.0, shadow: false });
              ctx.strokeStyle = "#0f8f80";
              ctx.lineWidth = 3;
              ctx.beginPath(); ctx.moveTo(cbX + 2, cbY - 22 + st * 26); ctx.lineTo(cbX + 28, cbY - 22 + st * 26); ctx.stroke();
            }
          }
          BG.drawSnailSilverTrail(ctx, 235, 540, cbX - 18, 455, su, t, { arc: 18 });
          S.drawMailSnail(ctx, lerp(235, cbX - 18, su), lerp(540, 455, su), 1.16, t, { postcard: false, trail: false });
        },
        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = stemEnter(resolved, 0.72);
          drawSceneBase22(ctx, W, H, resolved, plates, S, BG, {});
          var squat = 0.5 - 0.5 * Math.cos(t * TAU * 0.9);
          drawFinFlexCoach22(ctx, S, plates.portholeImg, 295, 295, t, squat, {});
          drawSquatSquad22(ctx, S, plates.portholeImg, 3, 475, 108, 478, squat, t, {});

          // Brass Scissor-Probe hoisting the heavy cast-iron kettlebell 2 inches off gravel!
          var kbX = 838;
          var kbY = lerp(502, 434, su) + Math.sin(t * 14.0) * 3 * su;
          drawIronKettlebell22(ctx, S, kbX, kbY, 0.96, { rot: Math.sin(t * 8.0) * 0.06 * su });
          drawBrassScissorProbe(ctx, S, BG, 1085, 608, kbX, kbY - 58, su, t, { bend: -1 });
        }
      },
      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Marching River Guards Closing In: towering blue-backlit bayonet shadows + Saluting Periscope Turkey!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase22(ctx, W, H, resolved, plates, S, BG, { treeFilter: "sepia" });

            // Towering Dark Bayonet-Fin & Shako Shadows looming across the buttercream wall!
            ctx.save();
            ctx.fillStyle = "rgba(18, 22, 34, 0.36)";
            for (var sh = 0; sh < 4; sh++) {
              var sx = 460 + sh * 135 - u * 45;
              ctx.beginPath();
              ctx.moveTo(sx - 45, 535);
              ctx.lineTo(sx - 35, 125);
              ctx.lineTo(sx + 35, 125);
              ctx.lineTo(sx + 48, 535);
              ctx.closePath();
              ctx.fill();
              // Towering bayonet spear shadow tip!
              ctx.beginPath();
              ctx.moveTo(sx - 56, 535);
              ctx.lineTo(sx - 56, 48);
              ctx.lineTo(sx - 42, 85);
              ctx.lineTo(sx - 46, 535);
              ctx.fill();
            }
            ctx.restore();

            BG.drawVolumetricBeam(ctx, 1050, 560, 480, 260, { color: "#2563eb", spread: 240, intensity: 1.0, t: t });

            var marchSquat = 0.5 - 0.5 * Math.cos(t * TAU * 1.1);
            drawFinFlexCoach22(ctx, S, plates.portholeImg, 355, 295, t, marchSquat, {});
            drawSquatSquad22(ctx, S, plates.portholeImg, 4, 560, 118, 478, marchSquat, t, {
              guardSpears: true,
              marchShift: -52 * u
            });

            drawExpressiveTurkey(ctx, S, 138, 498, 1.06, t, "salute");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Busby Berkeley Kaleidoscope Fin Ballet: overhead 8-petal spinning trout flower + Snail confetti!
            var t = resolved.t;
            var u = outEnter(resolved, 0.85);
            drawSceneBase22(ctx, W, H, resolved, plates, S, BG, { stones: false });

            var cx = 640, cy = 315;
            // Overhead Shimmering Blue Pool Circle & Radial Spotlight Beams!
            ctx.save();
            ctx.fillStyle = "rgba(14, 116, 144, 0.82)";
            ctx.strokeStyle = "#fbfaf5";
            ctx.lineWidth = 6.0;
            ctx.beginPath(); ctx.arc(cx, cy, 235 * clamp(u, 0.3, 1.02), 0, TAU); ctx.fill(); ctx.stroke();

            for (var b = 0; b < 8; b++) {
              var ba = t * 0.5 + (b / 8) * TAU;
              BG.drawVolumetricBeam(ctx, cx, cy, cx + Math.cos(ba) * 230, cy + Math.sin(ba) * 230, {
                color: b % 2 === 0 ? "#38bdf8" : "#fde047",
                sourceRadius: 16,
                spread: 42,
                intensity: 0.75,
                motes: 3,
                t: t
              });
            }

            // 8 Synchronized Trout arranged in a Spinning Busby-Berkeley Flower Mandala!
            var openPetal = 118 + Math.sin(t * 3.2) * 22;
            for (var p = 0; p < 8; p++) {
              var pa = t * 0.95 + (p / 8) * TAU;
              var px = cx + Math.cos(pa) * openPetal * clamp(u, 0.2, 1);
              var py = cy + Math.sin(pa) * openPetal * clamp(u, 0.2, 1);
              ctx.save();
              ctx.translate(px, py);
              ctx.rotate(pa);
              S.drawBrookTrout(ctx, 0, 0, 0.86, t + p * 0.3, false);
              ctx.restore();
            }
            ctx.restore();

            // Mail Snail on central lily-pad pedestal tossing confetti!
            S.drawCutoutPaperEdge(ctx, starPolygon(cx, cy, 48, 42, 10, -t * 0.6), "#10b981", "#fbfaf5", { paperRim: 2.5 });
            S.drawMailSnail(ctx, cx, cy + 4, 1.08, t, { postcard: false, trail: false });
            BG.drawDeterministicParticles(ctx, "confetti", cx, cy, t, { count: 24, loop: true });
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Mind-Control Zero-Gravity Aerobics Ray: magenta strobe rings + upside-down star-jumping fish + disco Turkey!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase22(ctx, W, H, resolved, plates, S, BG, { zeroGFloor: true });

            // Neon Magenta Disco Tractor Rings from Alien Saucer!
            BG.drawVolumetricBeam(ctx, 680, 105, 680, 495, {
              color: "#ec4899",
              coreColor: "#fbcfe8",
              spread: 295,
              intensity: 1.15 * u,
              t: t
            });
            BG.drawTractorRings(ctx, 680, 105, 680, 455, t, { spread: 240, rings: 6 });

            var squat = 0.5 - 0.5 * Math.cos(t * TAU * 1.3);
            drawFinFlexCoach22(ctx, S, plates.portholeImg, 345, 255, t, squat, { rot: Math.PI });
            drawSquatSquad22(ctx, S, plates.portholeImg, 4, 530, 120, 415, squat, t, {
              upsideDown: true,
              starJump: true,
              zeroG: true
            });

            S.drawAlienSaucer(ctx, 680, 92, 1.24, t, 680, 380, { beam: false });
            // Mini magenta mind-ray hitting involuntary disco wing-jack Turkey!
            BG.drawVolumetricBeam(ctx, 680, 105, 145, 495, { color: "#f43f5e", spread: 68, intensity: 0.9, t: t });
            drawExpressiveTurkey(ctx, S, 145, 498, 1.06, t, "disco");
          }
        },
        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Submarine Caught In Riptide Treadmill: sloshing waves + bobbing porthole ring + Hand-Strap Turkey!
            var t = resolved.t;
            var squat = 0.5 - 0.5 * Math.cos(t * TAU * 1.25);
            var bobY = (squat - 0.5) * 48;

            ctx.save();
            ctx.translate(0, bobY);
            drawSceneBase22(ctx, W, H, resolved, plates, S, BG, {});
            drawFinFlexCoach22(ctx, S, plates.portholeImg, 335, 295, t, squat, {});
            drawSquatSquad22(ctx, S, plates.portholeImg, 4, 545, 118, 478, squat, t, { guardSpears: true });
            ctx.restore();

            // Sloshing Rebounding Riptide Sine-Wave Ribbons across stage!
            for (var w = 0; w < 3; w++) {
              ctx.strokeStyle = w === 0 ? "rgba(212, 42, 30, 0.72)" : "rgba(15, 143, 128, 0.72)";
              ctx.lineWidth = 6.5;
              ctx.beginPath();
              for (var x = 0; x <= W; x += 28) {
                var wy = 445 + w * 38 + Math.sin(x * 0.02 + t * 7.5 + w) * 20;
                if (x === 0) ctx.moveTo(x, wy);
                else ctx.lineTo(x, wy);
              }
              ctx.stroke();
            }

            drawExpressiveTurkey(ctx, S, 148, 488 - bobY * 0.5, 1.06, t, "straps");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Endless Creek Swim-Spa Resistance Lap: 5 neon-headband swimmers + turbo jet + Snail with Dixie cups!
            var t = resolved.t;
            var u = outEnter(resolved, 0.8);
            drawSceneBase22(ctx, W, H, resolved, plates, S, BG, { stones: false });

            // Chrome Swim-Spa Turbo Jet Nozzle on right blasting foamy horizontal resistance stream!
            S.drawCardboardPuppetPiece(ctx, [[1050, 265], [1185, 245], [1185, 415], [1050, 395]], {
              tone: "#64748b",
              ribs: 3,
              pins: [[1075, 290], [1075, 370]]
            });
            drawBallastJet(ctx, S, BG, 1050, 330, 220, 330, 1.25, t, { spread: 130, count: 24, speed: 1.7 });

            // 5 Horizontal Swimmers (Coach Brook Trout + 4 fish) wearing 80s Neon Headbands!
            var neonBands = ["#ec4899", "#a3e635", "#22d3ee", "#facc15", "#f97316"];
            for (var s = 0; s < 5; s++) {
              var sx = 365 + (s % 3) * 195 + Math.sin(t * 9.5 + s) * 14;
              var sy = 225 + Math.floor(s / 3) * 155 + (s % 2) * 32;
              S.drawBrookTrout(ctx, sx, sy, s === 0 ? 1.15 : 0.96, t * 2.2 + s, false);
              // Neon 80s sweatband on each fish forehead!
              S.drawCutoutPaperEdge(ctx, [[sx + 34, sy - 22], [sx + 54, sy - 18], [sx + 52, sy - 6], [sx + 32, sy - 10]], neonBands[s], "#14110d", { paperRim: 1.5, shadow: false });
            }

            // Mail Snail on foreground deck carrying a tray of 3 tiny white paper Dixie cups!
            var snX = 485 + Math.sin(t * 2.0) * 35, snY = 534;
            S.drawMailSnail(ctx, snX, snY, 1.24 * clamp(u, 0.3, 1), t, { postcard: false });
            S.drawCardboardPuppetPiece(ctx, [[snX - 48, snY - 34], [snX + 36, snY - 34], [snX + 32, snY - 28], [snX - 44, snY - 28]], { tone: "#cbd5e1", shadow: false });
            for (var c = 0; c < 3; c++) {
              var cx0 = snX - 34 + c * 24;
              S.drawCutoutPaperEdge(ctx, [[cx0 - 8, snY - 54], [cx0 + 8, snY - 54], [cx0 + 6, snY - 34], [cx0 - 6, snY - 34]], "#fbfaf7", "#0284c7", { paperRim: 1.2, shadow: false });
            }
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Astronaut Centrifuge G-Force Boot Camp: silver NASA centrifuge loop + 4 helmeted trout!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.8);
            drawSceneBase22(ctx, W, H, resolved, plates, S, BG, { zeroGFloor: true, stones: false });

            var cx = 640, cy = 348;
            BG.drawTractorRings(ctx, 640, 96, cx, cy, t, { spread: 215, rings: 5 });

            // Giant Spinning Silver Centrifuge Ring & Radial Hub Arms!
            var spin = t * 3.4;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(1.0, 0.72);
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 18;
            ctx.beginPath(); ctx.arc(0, 0, 210 * u, 0, TAU); ctx.stroke();
            ctx.strokeStyle = "#14110d";
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(0, 0, 219 * u, 0, TAU); ctx.arc(0, 0, 201 * u, 0, TAU); ctx.stroke();

            for (var a = 0; a < 4; a++) {
              var ang = spin + (a / 4) * TAU;
              var px = Math.cos(ang) * 210 * u;
              var py = Math.sin(ang) * 210 * u;
              S.drawCardboardPuppetPiece(ctx, limbQuad(0, 0, px, py, 8, 6), { tone: "#94a3b8", shadow: false });
            }
            S.drawReinigerFiligreeHinge(ctx, 0, 0, 14, { metal: "silver" });
            ctx.restore();

            // 4 Bubble-Helmeted Astronaut Trout zooming around the centrifuge!
            for (var k = 0; k < 4; k++) {
              var ka = spin + (k / 4) * TAU;
              var tx = cx + Math.cos(ka) * 210 * u;
              var ty = cy + Math.sin(ka) * 151 * u;
              ctx.save();
              ctx.translate(tx, ty);
              ctx.rotate(ka + Math.PI * 0.5);
              S.drawBrookTrout(ctx, 0, 0, 0.82, t, true);
              // Clear NASA Bubble Helmet with gold visor reflection!
              ctx.fillStyle = "rgba(186, 230, 253, 0.52)";
              ctx.strokeStyle = "#fbfaf7";
              ctx.lineWidth = 3.0;
              ctx.beginPath(); ctx.arc(-38, -2, 26, 0, TAU); ctx.fill(); ctx.stroke();
              ctx.restore();
            }

            S.drawAlienSaucer(ctx, 640, 86, 1.20, t, cx, cy, { beam: false });
          }
        },
        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Failed Submarine Physical Fitness Test: Coach holding giant "0" scorecard + penalty whistle + Armchair Turkey!
            var t = resolved.t;
            var u = outEnter(resolved, 0.78);
            drawSceneBase22(ctx, W, H, resolved, plates, S, BG, {});

            drawFinFlexCoach22(ctx, S, plates.portholeImg, 455, 298, t, 0.2, {});
            drawSquatSquad22(ctx, S, plates.portholeImg, 3, 735, 115, 478, 0.15, t, {});

            // Giant Referee Penalty Clipboard held up by Coach showing pure-vector "0" & Red X!
            var scX = 595, scY = 235;
            ctx.save();
            ctx.translate(scX, scY);
            ctx.scale(clamp(u, 0.2, 1.08), clamp(u, 0.2, 1.08));
            S.drawCutoutPaperEdge(ctx, [[-62, -78], [62, -78], [62, 78], [-62, 78]], "#fbfaf7", "#d42a1e", { paperRim: 3.5 });
            drawVectorReadout(ctx, "0", 0, -16, 36, 58, "#dc2626", 5.5);
            BG.drawGeometricSymbol(ctx, "x", 0, 44, 22, "#dc2626", 4.5);
            ctx.restore();

            // Crimson penalty whistle blast shockwave aimed left at Turkey!
            for (var w = 0; w < 3; w++) {
              var wu = ((t * 1.6 + w / 3) % 1);
              ctx.strokeStyle = "rgba(220, 38, 38, " + ((1 - wu) * 0.85).toFixed(3) + ")";
              ctx.lineWidth = 3.5;
              ctx.beginPath();
              ctx.arc(385 - wu * 145, 325 + wu * 80, 18 + wu * 52, Math.PI * 0.65, Math.PI * 1.25);
              ctx.stroke();
            }

            S.drawMailSnail(ctx, 595, 526, 1.16, t, { postcard: true });
            drawExpressiveTurkey(ctx, S, 152, 496, 1.08, t, "armchair");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Slowest Marathon Ribbon For Snail: finish-line tape + Giant Gold Medal on Snail hoisted on Trout fins!
            var t = resolved.t;
            var u = outEnter(resolved, 0.82);
            drawSceneBase22(ctx, W, H, resolved, plates, S, BG, {});

            // Two Wooden Finish-Line Posts + Burst Red Torn-Paper Finish Tape!
            S.drawCardboardPuppetPiece(ctx, [[345, 225], [362, 225], [362, 545], [345, 545]], { tone: "#78350f" });
            S.drawCardboardPuppetPiece(ctx, [[918, 225], [935, 225], [935, 545], [918, 545]], { tone: "#78350f" });

            var flutter = Math.sin(t * 7.5) * 18;
            S.drawTornPaperFlat(ctx, 358, 315, 225, 26, { fill: "#dc2626", paperColor: "#fbfaf5", rot: 0.14 + flutter * 0.004 });
            S.drawTornPaperFlat(ctx, 695, 315, 225, 26, { fill: "#dc2626", paperColor: "#fbfaf5", rot: -0.14 - flutter * 0.004 });

            // Cheering Brook Trout & Squad hoisting Champion Mail Snail high at center!
            var liftY = 305 + Math.sin(t * 5.0) * 10;
            S.drawBrookTrout(ctx, 515, 398, 1.16, t, false);
            S.drawBrookTrout(ctx, 765, 398, 1.16, t, true);

            S.drawMailSnail(ctx, 640, liftY, 1.55 * clamp(u, 0.3, 1.05), t, { postcard: false, trail: false });

            // Giant Gleaming Gold Foil First-Prize Medal draped around Mail Snail!
            ctx.strokeStyle = "#2563eb";
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(625, liftY - 10); ctx.lineTo(640, liftY + 46); ctx.lineTo(655, liftY - 10);
            ctx.stroke();
            var medalPts = starPolygon(640, liftY + 56, 32, 26, 12, t);
            S.drawCutoutPaperEdge(ctx, medalPts, "#fbbf24", "#14110d", { paperRim: 2.5 });
            var innerStar = starPolygon(640, liftY + 56, 16, 7, 5, -Math.PI * 0.5);
            S.drawCutoutPaperEdge(ctx, innerStar, "#fef9c3", "#b45309", { paperRim: 1.0, shadow: false });

            BG.drawDeterministicParticles(ctx, "confetti", 640, 240, t, { count: 22, loop: true });
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Galactic Olympics Perfect Ten Scorecards: 3 neon "10 · 10 · 10" scoreboards + zero-G laurel wreaths!
            var t = resolved.t;
            var u = outEnter(resolved, 0.85);
            drawSceneBase22(ctx, W, H, resolved, plates, S, BG, { zeroGFloor: true });

            S.drawAlienSaucer(ctx, 640, 92, 1.30, t, 640, 390, { beamSpread: 220 });

            // Three Neon Judge Scoreboards extended beneath the 3-Eyed Alien Saucer showing pure-vector 10 · 10 · 10!
            var boardCols = ["#34d399", "#fbbf24", "#f472b6"];
            for (var j = 0; j < 3; j++) {
              var bx = 450 + j * 190;
              var by = 205 + Math.sin(t * 3.4 + j) * 7;
              ctx.save();
              ctx.translate(bx, by);
              ctx.scale(clamp(u, 0.2, 1.05), clamp(u, 0.2, 1.05));
              // Telescoping strut from saucer
              ctx.strokeStyle = "#94a3b8";
              ctx.lineWidth = 3.5;
              ctx.beginPath(); ctx.moveTo((640 - bx) * 0.65, -92); ctx.lineTo(0, -38); ctx.stroke();

              S.drawCardboardPuppetPiece(ctx, [[-66, -42], [66, -42], [66, 42], [-66, 42]], {
                tone: "#0f172a",
                pins: [[-52, -28], [52, -28]]
              });
              ctx.strokeStyle = boardCols[j];
              ctx.lineWidth = 3.0;
              ctx.strokeRect(-62, -38, 124, 76);
              drawVectorReadout(ctx, "10.0", 0, 0, 20, 42, boardCols[j], 4.0);
              ctx.restore();
            }

            // Floating Zero-G Golden Cut-Paper Laurel Wreaths & Gymnastic Trout Squad!
            var wreathXs = [305, 975];
            for (var w = 0; w < 2; w++) {
              var wx = wreathXs[w], wy = 285 + Math.cos(t * 2.4 + w) * 14;
              ctx.strokeStyle = "#eab308";
              ctx.lineWidth = 7;
              ctx.beginPath(); ctx.arc(wx, wy, 42, 0.3, Math.PI * 2 - 0.3); ctx.stroke();
            }

            drawSquatSquad22(ctx, S, plates.portholeImg, 4, 460, 120, 485, 0.25, t, { zeroG: true, starJump: true });
            S.drawMailSnail(ctx, 640, 495, 1.15, t, { postcard: true, hasAlienStamp: true });
          }
        },
        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Dropped Kettlebell Anchors Our Nose: cratered 50-LB kettlebell + billowing silt + Tilted Teacup Turkey!
            var t = resolved.t;
            var u = outEnter(resolved, 0.65);

            ctx.save();
            ctx.translate(640, 340);
            ctx.rotate(0.055 * clamp(u, 0, 1.2));
            ctx.translate(-640, -340);

            drawSceneBase22(ctx, W, H, resolved, plates, S, BG, {});
            drawFinFlexCoach22(ctx, S, plates.portholeImg, 340, 295, t, 0.4, {});
            drawSquatSquad22(ctx, S, plates.portholeImg, 3, 520, 112, 478, 0.4, t, {});

            // Dropped Heavy 50-LB Kettlebell buried deep in gravel crater + Billowing Silt Cloud!
            var kx = 845, ky = 528;
            BG.drawDeterministicParticles(ctx, "ink_puffs", kx, ky + 15, t, {
              count: 18, loop: true, color: "rgba(120, 113, 108, 0.62)"
            });
            drawIronKettlebell22(ctx, S, kx, ky, 1.22, { rot: 0.24 });
            // Empty sprung brass tongs recoiling above!
            drawBrassScissorProbe(ctx, S, BG, 1090, 608, 910, 345 + Math.sin(t * 10) * 10, 0.1, t, { sparks: false });
            ctx.restore();

            drawExpressiveTurkey(ctx, S, 148, 502, 1.08, t, "teacup");
          },
          plausible: function (ctx, W, H, resolved, plates, S) {
            // Strongman Trout One-Fin Lift Record: leopard-spot singlet + lifting kettlebell & tongs + Flashbulb Snail!
            var t = resolved.t;
            var u = outEnter(resolved, 0.82);
            drawSceneBase22(ctx, W, H, resolved, plates, S, BG, {});

            var tx = 640, ty = 408;
            // Overhead Hoisted 50-LB Iron Kettlebell + Our Dangling Brass Tongs balanced on One Fin Tip!
            var hoistY = lerp(340, 215, clamp(u, 0, 1.06)) + Math.sin(t * 4.5) * 6;
            drawIronKettlebell22(ctx, S, tx - 10, hoistY, 1.15, { rot: Math.sin(t * 3.5) * 0.08 });
            drawBrassScissorProbe(ctx, S, BG, 1085, 605, tx + 38, hoistY - 40, 0.9, t, { l1: 235, l2: 235, sparks: false });

            // Giant Muscle Bicep Arm holding the kettlebell overhead!
            drawIKLimb(ctx, S, tx - 12, ty - 10, 82, 82, tx - 10, hoistY + 52, -1, {
              w0: 20, w1: 18, w2: 10, upperTone: "#8f9c8a", lowerTone: "#b87458"
            });

            S.drawBrookTrout(ctx, tx, ty, 1.42, t, true);

            // Vintage Yellow-and-Black Leopard-Spot Strongman Singlet + Curly Mustache on Brook Trout!
            S.drawCutoutPaperEdge(ctx, [[tx - 32, ty - 34], [tx + 46, ty - 32], [tx + 42, ty + 32], [tx - 28, ty + 30]], "#facc15", "#14110d", { paperRim: 2.0, shadow: false });
            var spots = [[-14, -14], [8, -18], [24, -4], [-8, 12], [18, 16]];
            ctx.fillStyle = "#14110d";
            for (var sp = 0; sp < spots.length; sp++) {
              ctx.beginPath(); ctx.arc(tx + spots[sp][0], ty + spots[sp][1], 4.8, 0, TAU); ctx.fill();
            }
            // Handlebar strongman mustache!
            S.drawCutoutPaperEdge(ctx, [[tx - 82, ty + 2], [tx - 106, ty - 8], [tx - 96, ty + 10], [tx - 62, ty + 10]], "#1c1917", "#14110d", { paperRim: 1.4, shadow: false });

            // Mail Snail operating a vintage Tripod Press Camera with Popping Flashbulbs!
            var camX = 335, camY = 465;
            ctx.strokeStyle = "#14110d";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(camX, camY); ctx.lineTo(camX - 24, 548);
            ctx.moveTo(camX, camY); ctx.lineTo(camX + 24, 548);
            ctx.stroke();
            S.drawCardboardPuppetPiece(ctx, [[camX - 22, camY - 24], [camX + 22, camY - 24], [camX + 22, camY + 12], [camX - 22, camY + 12]], { tone: "#334155" });
            var flash = Math.pow(Math.max(0, Math.sin(t * 7.5)), 6);
            if (flash > 0.1) {
              BG.drawLanternHalo(ctx, camX + 28, camY - 28, 165 * flash, { t: t, color: "#fef08a", coreColor: "#ffffff", intensity: 1.6 });
            }
            S.drawMailSnail(ctx, camX - 58, 532, 1.20, t, { postcard: false });
          },
          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Weightless Pinky-Lift In Anti-Gravity: upside-down balloon kettlebell on a string held by Mail Snail!
            var t = resolved.t;
            var u = outSmooth(resolved, 0.82);
            drawSceneBase22(ctx, W, H, resolved, plates, S, BG, { zeroGFloor: true });

            var snX = 565, snY = 485 + Math.sin(t * 2.2) * 10;
            var kbX = 640 + Math.sin(t * 2.4) * 26;
            var kbY = lerp(390, 228, u) + Math.cos(t * 2.8) * 14;

            BG.drawTractorRings(ctx, 640, 92, kbX, kbY, t, { spread: 165, rings: 5 });
            BG.drawLanternHalo(ctx, kbX, kbY, 115, { t: t, color: "#34d399", intensity: 1.15 });
            BG.drawDeterministicParticles(ctx, "snail_trail", kbX, kbY, t, { count: 16, loop: true });

            // Thin wavy balloon string linking Mail Snail's eyestalk effortlessly to the floating 50-LB kettlebell!
            ctx.strokeStyle = "#fbfaf7";
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.moveTo(snX + 28, snY - 16);
            ctx.bezierCurveTo(snX + 65, (snY + kbY) * 0.5, kbX - 45, (snY + kbY) * 0.5, kbX, kbY + 52);
            ctx.stroke();

            drawIronKettlebell22(ctx, S, kbX, kbY, 1.14, {
              rot: Math.PI + Math.sin(t * 2.0) * 0.14,
              color: "#065f46"
            });

            S.drawMailSnail(ctx, snX, snY, 1.28, t, { postcard: true, hasAlienStamp: true });
            drawSquatSquad22(ctx, S, plates.portholeImg, 3, 760, 108, 465, 0.2, t, { zeroG: true });
            S.drawAlienSaucer(ctx, 640, 84, 1.22, t, kbX, kbY, { beam: false });
          }
        }
      }
    });
  }

  // ---------- Register All 5 Pod-2B Porthole Games (#18..#22) ----------
  function initPod2B() {
    var BG = getBG();
    if (!BG || typeof BG.definePortalGame !== "function") return false;
    registerPortal18(BG);
    registerPortal19(BG);
    registerPortal20(BG);
    registerPortal21(BG);
    registerPortal22(BG);
    return true;
  }

  initPod2B();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      ids: [18, 19, 20, 21, 22],
      init: initPod2B,
      games: (root && root.PORTAL_V3_GAMES) ? root.PORTAL_V3_GAMES : {}
    };
  }
})(typeof window !== "undefined" ? window : globalThis);
