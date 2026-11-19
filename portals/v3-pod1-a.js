/* ============================================================================
 * Turkey Sub · V3 Branching Interactive Porthole Scenes — Pod 1A (#01–#06)
 * File: portals/v3-pod1-a.js
 *
 * Registers window.PORTAL_V3_GAMES[1..6] (1280×720, 18.0s showcase + 60fps live)
 * via window.BRANCH_GAME.definePortalGame(id, spec):
 *   #01 · Bow    — cardboard-parallax · Giant Size 11 Rubber Boot (p01 + atlas-21)
 *   #02 · Galley — queneau-rostrum    · Trout Cook & Silver Baster (p02 + atlas-47)
 *   #03 · Starbd — perec-stage        · Sunken Room 4 Chalkboard   (p03 + atlas-49)
 *   #04 · Belly  — daumier-litho      · Snapping Turtle on Brass Key (p04 + atlas-39)
 *   #05 · Scope  — duchamp-optic      · Raccoon Washing Tin Plate  (p05 + atlas-53)
 *   #06 · Stern  — daumier-litho      · Sheriff Carp & Feather Lure (p06 + atlas-05)
 *
 * Every porthole implements 17 bespoke visual nodes (1 Root + 4 Physical Stems
 * + 12 Playable Branches) fusing PAELEO Oulipo real-plate scissor cutouts and
 * split-pin IK puppets with Video-to-Game volumetric shaders and particle pools.
 *
 * STRICT BLIND-MODE INVARIANT: Zero canvas text calls anywhere in this module;
 * all stage documents, gauges, stamps, posters, and chalkboards use pure vector
 * iconography and mask out any painted words on source plates.
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var PORTAL_IDS = [1, 2, 3, 4, 5, 6];

  function getB() {
    return root && root.BRANCH_GAME ? root.BRANCH_GAME : null;
  }

  function getS() {
    return root && root.SCION_STAGE ? root.SCION_STAGE : null;
  }

  if (root && root.SCION_STAGE && typeof root.SCION_STAGE.preloadPortalPlates === "function") {
    try {
      root.SCION_STAGE.preloadPortalPlates(PORTAL_IDS);
    } catch (e) {}
  }

  // ---------- Pure Math & Deterministic Craft Helpers (Zero Text) ----------

  function clamp(v, a, b) {
    return v < a ? a : (v > b ? b : v);
  }

  function lerp(a, b, u) {
    return a + (b - a) * clamp(u, 0, 1);
  }

  function smooth(a, b, x) {
    var u = clamp((x - a) / ((b - a) || 1e-6), 0, 1);
    return u * u * (3 - 2 * u);
  }

  function easeOutBack(u) {
    var x = clamp(u, 0, 1);
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  function hash(n) {
    var s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  function pxShift(depth, t, amp) {
    return Math.sin(t * 0.62 + depth * 1.3) * (amp || 14) * depth;
  }

  function pyShift(depth, t, ballastOn) {
    return Math.cos(t * 0.48 + depth * 0.9) * 5 * depth + (ballastOn ? -9 * depth : 0);
  }

  function circlePoly(n, rx, ry, cx, cy, jitter, seed) {
    var pts = [];
    var count = n || 16;
    var radX = rx == null ? 0.48 : rx;
    var radY = ry == null ? 0.48 : ry;
    var ox = cx == null ? 0.5 : cx;
    var oy = cy == null ? 0.5 : cy;
    var jit = jitter == null ? 0.014 : jitter;
    for (var i = 0; i < count; i++) {
      var a = (i / count) * TAU;
      var h = (hash((seed || 7.1) + i * 3.7) - 0.5) * jit;
      pts.push([ox + Math.cos(a) * (radX + h), oy + Math.sin(a) * (radY + h)]);
    }
    return pts;
  }

  function drawCardboardLimb(ctx, S, x0, y0, x1, y1, w0, w1, tone, pinMetal) {
    var dx = x1 - x0;
    var dy = y1 - y0;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len;
    var ny = dx / len;
    var pts = [
      [x0 + nx * w0, y0 + ny * w0],
      [x1 + nx * w1, y1 + ny * w1],
      [x1 - nx * w1, y1 - ny * w1],
      [x0 - nx * w0, y0 - ny * w0]
    ];
    S.drawCardboardPuppetPiece(ctx, pts, {
      tone: tone || "#84827d",
      ribs: len > 55 ? 2 : 1,
      pin: pinMetal ? { x: x0, y: y0, r: 4.4, metal: pinMetal } : null
    });
  }

  function drawJointedIKLimb(ctx, S, ik, rUpper, rLower, toneUpper, toneLower, metal) {
    drawCardboardLimb(ctx, S, ik.x0, ik.y0, ik.jx, ik.jy, rUpper, rUpper * 0.84, toneUpper || "#7d7b76", metal || "silver");
    drawCardboardLimb(ctx, S, ik.jx, ik.jy, ik.ex, ik.ey, rLower, rLower * 0.78, toneLower || "#92908a", metal || "silver");
    S.drawSplitPin(ctx, ik.ex, ik.ey, 4.0, { metal: metal || "brass" });
  }

  function drawCutBubbleCluster(ctx, cx, cy, count, spreadX, spreadY, t, seed, tint) {
    ctx.save();
    for (var i = 0; i < count; i++) {
      var u = ((t * (0.38 + hash(seed + i * 2.1) * 0.35) + i / count) % 1 + 1) % 1;
      var bx = cx + (hash(seed + i * 5.3) - 0.5) * spreadX + Math.sin(t * 2.6 + i) * 9;
      var by = cy - u * spreadY;
      var r = 4.5 + hash(seed + i * 9.7) * 9.5;
      var alpha = Math.sin(u * Math.PI) * 0.86;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#fbfaf5";
      ctx.beginPath();
      ctx.arc(bx, by, r + 2.0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = tint || "rgba(182, 226, 222, 0.85)";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(bx - r * 0.32, by - r * 0.32, r * 0.26, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // Subtle brass porthole bezel corners & hex bolts framing stage without blocking center
  function drawPortholeBezelCorners(ctx, W, H, resolved, S) {
    var stageH = resolved.blind ? H : 640;
    var cx = W * 0.5;
    var cy = stageH * 0.5;
    var rInner = 690;
    var rOuter = 742;
    ctx.save();
    var bGrad = ctx.createLinearGradient(0, 0, W, stageH);
    bGrad.addColorStop(0.0, "#e6c77c");
    bGrad.addColorStop(0.5, "#b88632");
    bGrad.addColorStop(1.0, "#5c3d10");
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

    var bolts = [
      [54, 48], [W - 54, 48],
      [54, stageH - 46], [W - 54, stageH - 46]
    ];
    for (var i = 0; i < bolts.length; i++) {
      S.drawSplitPin(ctx, bolts[i][0], bolts[i][1], 6.5, { metal: "brass" });
    }
    ctx.restore();
  }

  // Subtle diegetic stage landmarks at the 4 controller anchors during Root
  function drawRootAnchorLandmarks(ctx, resolved, S, B) {
    var btns = resolved.tree && resolved.tree.buttons;
    if (!btns) return;
    var t = resolved.t || 0;
    var keys = ["x", "o", "triangle", "square"];
    var cols = { x: "#60a5fa", o: "#f87171", triangle: "#34d399", square: "#fbbf24" };

    ctx.save();
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var anc = btns[k] && btns[k].anchor;
      if (!anc) continue;
      var pulse = 0.5 + 0.5 * Math.sin(t * 3.6 + i * 1.5);
      var r = 13 + pulse * 4;
      ctx.globalAlpha = 0.42 + pulse * 0.24;
      ctx.strokeStyle = "#fbfaf7";
      ctx.lineWidth = 2.6;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(anc.x, anc.y, r + 4, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.globalAlpha = 0.78;
      ctx.fillStyle = "rgba(20, 17, 13, 0.55)";
      ctx.strokeStyle = cols[k];
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(anc.x, anc.y, 11, 0, TAU);
      ctx.fill();
      ctx.stroke();
      B.drawGeometricSymbol(ctx, k, anc.x, anc.y, 8.5, cols[k], 2.0);
    }
    ctx.restore();
  }

  // Articulated 2-bone IK brass scissor-tongs extending from submarine rim
  function drawBrassScissorTongs(ctx, S, fromX, fromY, tipX, tipY, openRad, opts) {
    var cfg = opts || {};
    var bend = cfg.bendDir || -1;
    var ik = S.solveIK2(fromX, fromY, cfg.l1 || 185, cfg.l2 || 175, tipX, tipY, bend);

    // Pantograph cross-bars
    drawCardboardLimb(ctx, S, ik.x0, ik.y0 - 12, ik.jx, ik.jy + 8, 10, 8, "#b88a44", "brass");
    drawCardboardLimb(ctx, S, ik.x0, ik.y0 + 12, ik.jx, ik.jy - 8, 10, 8, "#9c6f2b", "brass");
    drawCardboardLimb(ctx, S, ik.jx, ik.jy - 7, ik.ex, ik.ey + 5, 8.5, 6.5, "#d4a44c", "brass");
    drawCardboardLimb(ctx, S, ik.jx, ik.jy + 7, ik.ex, ik.ey - 5, 8.5, 6.5, "#a6782a", "silver");

    // Scissor pincer jaws at end
    var ang = ik.a2 + (cfg.bentTip || 0);
    var jaw = openRad == null ? 0.28 : openRad;
    ctx.save();
    ctx.translate(ik.ex, ik.ey);
    ctx.rotate(ang);
    ctx.save();
    ctx.rotate(-jaw);
    S.drawCardboardPuppetPiece(ctx, [[0, -5], [38, -16], [48, -4], [28, 2], [0, 3]], { tone: "#e2b85c", ribs: 1, shadow: false });
    ctx.restore();
    ctx.save();
    ctx.rotate(jaw);
    S.drawCardboardPuppetPiece(ctx, [[0, -3], [28, -2], [48, 4], [38, 16], [0, 5]], { tone: "#c29238", ribs: 1, shadow: false, pin: { x: 0, y: 0, r: 4.5, metal: "brass" } });
    ctx.restore();
    ctx.restore();
  }

  // Round scalloped wax seal or postmark stamp with pure vector emblem (Zero Text)
  function drawWaxSeal(ctx, S, cx, cy, r, color, glyph, rot) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot || 0);
    var pts = [];
    for (var i = 0; i < 14; i++) {
      var a = (i / 14) * TAU;
      var rad = i % 2 === 0 ? r : r * 0.84;
      pts.push([Math.cos(a) * rad, Math.sin(a) * rad]);
    }
    S.drawCutoutPaperEdge(ctx, pts, color || "#d42a1e", "#14110d", { paperRim: 2.2, shadow: false });
    ctx.strokeStyle = "#fbfaf5";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.58, 0, TAU);
    ctx.stroke();

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (glyph === "check") {
      ctx.beginPath();
      ctx.moveTo(-r * 0.28, 0);
      ctx.lineTo(-r * 0.05, r * 0.24);
      ctx.lineTo(r * 0.30, -r * 0.22);
      ctx.stroke();
    } else if (glyph === "return") {
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.30, -Math.PI * 0.8, Math.PI * 0.45);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-r * 0.32, -r * 0.08);
      ctx.lineTo(-r * 0.16, -r * 0.28);
      ctx.lineTo(-r * 0.06, -r * 0.04);
      ctx.stroke();
    } else if (glyph === "star") {
      for (var s = 0; s < 5; s++) {
        var sa = -Math.PI * 0.5 + (s / 5) * TAU;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(sa) * r * 0.34, Math.sin(sa) * r * 0.34);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = "#fbfaf5";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.22, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // Vector paper slip / newspaper / permit / citation (Zero Text!)
  function drawVectorSlip(ctx, S, cx, cy, w, h, rot, opts) {
    var cfg = opts || {};
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot || 0);
    S.drawCutoutPaperEdge(
      ctx,
      [[-w * 0.5, -h * 0.5], [w * 0.5, -h * 0.5], [w * 0.5, h * 0.5], [-w * 0.5, h * 0.5]],
      cfg.paper || "#fbfaf5",
      "#14110d",
      { paperRim: cfg.rim != null ? cfg.rim : 2.5 }
    );
    // Header color band
    if (cfg.bandColor) {
      ctx.fillStyle = cfg.bandColor;
      ctx.fillRect(-w * 0.44, -h * 0.42, w * 0.88, h * 0.20);
    }
    // Simulated ruled ink lines
    ctx.strokeStyle = "rgba(20, 17, 13, 0.55)";
    ctx.lineWidth = 2.0;
    var rows = cfg.rows || 3;
    for (var i = 0; i < rows; i++) {
      var ly = -h * 0.08 + i * (h * 0.16);
      var lw = (i === rows - 1 ? 0.55 : 0.82) * w;
      ctx.beginPath();
      ctx.moveTo(-w * 0.41, ly);
      ctx.lineTo(-w * 0.41 + lw, ly);
      ctx.stroke();
    }
    if (cfg.sealColor) {
      drawWaxSeal(ctx, S, w * 0.24, h * 0.22, Math.min(w, h) * 0.18, cfg.sealColor, cfg.glyph || "check", 0.2);
    }
    ctx.restore();
  }

  // 6-point Sheriff Star Badge with ball tips & split-pin center (Zero Text!)
  function drawSheriffStar(ctx, S, cx, cy, r, rot, tone, metal) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot || 0);
    var pts = [];
    for (var i = 0; i < 12; i++) {
      var a = -Math.PI * 0.5 + (i / 12) * TAU;
      var rad = i % 2 === 0 ? r : r * 0.48;
      pts.push([Math.cos(a) * rad, Math.sin(a) * rad]);
    }
    S.drawCutoutPaperEdge(ctx, pts, tone || "#d8d5cc", "#14110d", { paperRim: 3.0 });
    for (var k = 0; k < 6; k++) {
      var ka = -Math.PI * 0.5 + (k / 6) * TAU;
      var bx = Math.cos(ka) * (r + 2.5);
      var by = Math.sin(ka) * (r + 2.5);
      ctx.fillStyle = "#fbfaf5";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(bx, by, 3.0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    S.drawSplitPin(ctx, 0, 0, 5.0, { metal: metal || "brass" });
    ctx.restore();
  }

  // Canonical witness choreography for Probable (Turkey), Plausible (Trout + Snail), Preposterous (Saucer)
  function drawOutcomeWitnesses(ctx, resolved, S, B, cfg) {
    var o = cfg || {};
    var t = resolved.t || 0;
    var u = clamp(resolved.outcomeU || 0, 0, 1);
    var tier = resolved.selectedTier;

    if (tier === "probable") {
      var tx = o.turkeyX != null ? o.turkeyX : 142;
      var ty = o.turkeyY != null ? o.turkeyY : 504;
      B.drawLanternHalo(ctx, tx, ty, 115, { color: "#38bdf8", intensity: 0.42, t: t });
      S.drawTurkeyCutawayBadge(ctx, tx, ty, o.turkeyScale || 1.02, t, {
        dispatch: o.dispatch != null ? o.dispatch : (0.35 + 0.45 * Math.sin(t * 3.2))
      });
      if (o.binoculars) {
        // Cardboard binoculars held up to Turkey's eye
        S.drawCardboardPuppetPiece(ctx, [[tx + 12, ty - 22], [tx + 54, ty - 28], [tx + 54, ty - 6], [tx + 12, ty - 10]], {
          tone: "#2d3136", ribs: 1, pin: { x: tx + 16, y: ty - 16, r: 3.4, metal: "brass" }
        });
      }
    } else if (tier === "plausible") {
      var trx = o.troutX != null ? o.troutX : 996;
      var tryY = (o.troutY != null ? o.troutY : 388) + Math.sin(t * 2.9) * 9;
      var sx0 = o.snailX0 != null ? o.snailX0 : 220;
      var sy0 = o.snailY0 != null ? o.snailY0 : 548;
      var sx1 = o.snailX1 != null ? o.snailX1 : 865;
      var sy1 = o.snailY1 != null ? o.snailY1 : 526;
      var su = smooth(0.0, 0.82, u);
      if (o.skipDefaultSnail !== true) {
        B.drawSnailSilverTrail(ctx, sx0, sy0, sx1, sy1, su, t, { arc: o.snailArc || 22 });
        S.drawMailSnail(ctx, lerp(sx0, sx1, su), lerp(sy0, sy1, su) - Math.sin(su * Math.PI) * (o.snailArc || 22) * 0.5, o.snailScale || 1.18, t, {
          rot: o.snailRot || 0,
          postcard: true,
          hasReply: true
        });
      }
      if (o.skipDefaultTrout !== true) {
        S.drawBrookTrout(ctx, trx, tryY, o.troutScale || 1.16, t, o.troutFlip !== false, {
          tilt: o.troutTilt || Math.sin(t * 2.4) * 0.06
        });
      }
    } else if (tier === "preposterous") {
      var ux = o.saucerX != null ? o.saucerX : 640;
      var uy = o.saucerY != null ? o.saucerY : 106;
      var bx = o.beamX != null ? o.beamX : 640;
      var by = o.beamY != null ? o.beamY : 420;
      B.drawTractorRings(ctx, ux, uy + 18, bx, by, t, {
        spread: o.beamSpread || 165,
        rings: 6
      });
      S.drawAlienSaucer(ctx, ux, uy, o.saucerScale || 1.18, t, bx, by, {
        beamSpread: o.beamSpread || 155
      });
    }
  }

  /* ==========================================================================
   * PORTHOLE #01 · BOW — "cardboard-parallax"
   * Plates: ./portholes/p01.jpg + ./assets/atlas-stills/atlas-21.webp
   * ========================================================================== */
  var BOOT_POLY = [
    [0.29, 0.02], [0.58, 0.03], [0.90, 0.07],
    [0.77, 0.34], [0.66, 0.57], [0.76, 0.73],
    [0.96, 0.83], [0.97, 0.96], [0.68, 0.97],
    [0.42, 0.90], [0.35, 0.85], [0.22, 0.83],
    [0.03, 0.74], [0.09, 0.56], [0.18, 0.32]
  ];

  function drawP01StageEnv(ctx, W, H, resolved, plates, S, B, opts) {
    var cfg = opts || {};
    var t = resolved.t || 0;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var pxFar = pxShift(0.25, t, 14);
    var pyFar = pyShift(0.22, t, resolved.ballastOn);
    var pxMid = pxShift(0.55, t, 14);
    var pyMid = pyShift(0.45, t, resolved.ballastOn);

    // Far Plane: Reiniger submarine searchlight silhouettes from atlas-21.webp
    var aw = aImg ? aImg.naturalWidth : 740;
    var ah = aImg ? aImg.naturalHeight : 416;
    S.drawScissorCutout(
      ctx, aImg,
      aw * 0.04, ah * 0.11, aw * 0.90, ah * 0.34,
      122 + pxFar, 30 + pyFar, 748, 174,
      [[0.02, 0.08], [0.54, 0.03], [0.98, 0.10], [0.96, 0.90], [0.45, 0.95], [0.03, 0.86]],
      { filter: "mono", haloWidth: 3.5, alpha: 0.82, seed: 11.2 }
    );
    S.drawScissorCutout(
      ctx, aImg,
      aw * 0.48, ah * 0.38, aw * 0.44, ah * 0.52,
      792 + pxFar * 1.2, 114 + pyFar, 352, 232,
      [[0.06, 0.05], [0.92, 0.04], [0.96, 0.92], [0.08, 0.95]],
      { filter: "mono", haloWidth: 3.5, alpha: 0.78, seed: 19.4 }
    );

    B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.18, color: "#93c5fd" });
    B.drawDepthFog(ctx, W, H, t, { density: 0.14, color: "#cbd5e1" });

    // Riverbed torn-paper terrace (5 grey-cardboard planes feel)
    S.drawTornPaperFlat(ctx, 84 + pxMid * 0.4, 492 + pyMid, 1112, 152, {
      fill: cfg.lunar ? "#555860" : "#34393b",
      paperColor: "#e8e4da",
      deckle: 6.5,
      seed: 104.7
    });

    if (!cfg.hideReeds) {
      S.drawScissorCutout(
        ctx, pImg,
        108, 214, 114, 194,
        106 + pxMid, 286 + pyMid, 196, 274,
        [[0.06, 0.08], [0.55, 0.02], [0.94, 0.24], [0.96, 0.94], [0.05, 0.96]],
        { filter: cfg.monoReeds ? "mono" : "sepia", haloWidth: 4.5, rot: Math.sin(t * 1.5) * 0.03, seed: 13.1 }
      );
      S.drawScissorCutout(
        ctx, pImg,
        432, 336, 96, 152,
        974 + pxMid * 1.1, 338 + pyMid, 176, 234,
        [[0.12, 0.05], [0.88, 0.04], [0.95, 0.94], [0.06, 0.96]],
        { filter: cfg.monoReeds ? "mono" : "sepia", haloWidth: 4.5, rot: -Math.sin(t * 1.7 + 1) * 0.035, seed: 17.8 }
      );
    }

    // Bottom brass bow lamp housing
    S.drawCardboardPuppetPiece(ctx, [[576, 638], [588, 592], [652, 592], [664, 638]], {
      tone: "#b88a44", ribs: 1, pins: [[598, 610], [642, 610]]
    });
  }

  function drawP01BootWithLeg(ctx, pImg, S, bootX, bootY, bootRot, filterOpt, alphaOpt) {
    var ankleX = bootX + 148;
    var ankleY = bootY + 42;
    var hipX = bootX + 108;
    var hipY = -28;
    var legIK = S.solveIK2(hipX, hipY, 126, 118, ankleX, ankleY, 1);
    drawCardboardLimb(ctx, S, hipX, hipY, legIK.jx, legIK.jy, 44, 38, "#6a6965", "silver");
    drawCardboardLimb(ctx, S, legIK.jx, legIK.jy, ankleX, ankleY, 38, 34, "#54534f", "silver");

    S.drawScissorCutout(
      ctx, pImg,
      198, 106, 244, 308,
      bootX, bootY, 336, 408,
      BOOT_POLY,
      {
        filter: filterOpt || "none",
        alpha: alphaOpt == null ? 1 : alphaOpt,
        haloWidth: 5.0,
        rot: bootRot || 0,
        pin: { x: bootX + 185, y: bootY + 46, r: 5.5, metal: "brass" },
        seed: 1.01
      }
    );
  }

  function registerPorthole01(B) {
    B.definePortalGame(1, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        S.drawBolasBackdrop(
          ctx, W, H, resolved.bolasStyle, 1, resolved.t,
          { showCaptions: !resolved.blind, lamp: resolved.lampOn, ballast: resolved.ballastOn },
          { pillarbox: true }
        );
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var pImg = plates.portholeImg;
        drawP01StageEnv(ctx, W, H, resolved, plates, S, B);
        B.drawVolumetricBeam(ctx, 620, 602, 615 + Math.sin(t * 0.9) * 28, 220, {
          color: "#fde68a", spread: 215, intensity: 0.85, t: t
        });

        var step = 0.5 + 0.5 * Math.sin(t * 1.9);
        drawP01BootWithLeg(ctx, pImg, S, 456, 122 + step * 24, -0.04 + step * 0.05);

        // Creek trout witness crop + Turkey in corner
        S.drawScissorCutout(
          ctx, pImg,
          432, 264, 98, 74,
          882, 316 + Math.sin(t * 2.4) * 8, 168, 124,
          [[0.03, 0.36], [0.42, 0.08], [0.95, 0.05], [0.97, 0.92], [0.36, 0.88], [0.04, 0.65]],
          { haloWidth: 4.0, seed: 1.22 }
        );
        S.drawTurkeyInCorner(ctx, 168, 514, 1.04, t, { dispatch: 0.1 });
        drawRootAnchorLandmarks(ctx, resolved, S, B);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = easeOutBack(resolved.stemU);
          drawP01StageEnv(ctx, W, H, resolved, plates, S, B);
          B.drawVolumetricBeam(ctx, 620, 602, 585, 250, {
            color: "#60a5fa", coreColor: "#fffbeb", spread: 235, intensity: 0.55 + 0.85 * clamp(u, 0, 1), t: t
          });
          drawP01BootWithLeg(ctx, plates.portholeImg, S, 456, 134, -0.02, "cyan", 1 - 0.32 * clamp(u, 0, 1));
          B.drawXRayOverlay(ctx, 616, 366, 220, 195, resolved.stemU, function (g, cx, cy) {
            // Glowing rubber boot wall ribs & sole tread silhouette
            g.strokeStyle = "#93c5fd";
            g.lineWidth = 3;
            for (var i = -3; i <= 3; i++) {
              g.beginPath();
              g.arc(cx - 10, cy + i * 20, 56, -0.5, 0.8);
              g.stroke();
            }
          }, { t: t });
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = easeOutBack(resolved.stemU);
          drawP01StageEnv(ctx, W, H, resolved, plates, S, B);
          // Twin crimson ballast vents blasting bubbles under heel
          S.drawCardboardPuppetPiece(ctx, [[470, 560], [492, 505], [526, 505], [538, 560]], { tone: "#9e3d1c", ribs: 1 });
          S.drawCardboardPuppetPiece(ctx, [[680, 560], [696, 505], [732, 505], [748, 560]], { tone: "#9e3d1c", ribs: 1 });
          drawCutBubbleCluster(ctx, 610, 540, 18, 280, 390, t * 1.6, 102, "rgba(215, 248, 245, 0.92)");
          B.drawDeterministicParticles(ctx, "bubbles", 520, 495, t, { count: 18, loop: true, spreadX: 160 });

          var tipRot = -0.78 * clamp(u, 0, 1.1) + Math.sin(t * 3.8) * 0.05;
          S.drawScissorCutout(
            ctx, plates.portholeImg,
            198, 106, 244, 308,
            468 + 38 * clamp(u, 0, 1), 130 - 24 * clamp(u, 0, 1), 336, 408,
            BOOT_POLY,
            { haloWidth: 5.0, rot: tipRot, pivotX: 636, pivotY: 380, seed: 1.12 }
          );
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = smooth(0, 1, resolved.stemU);
          drawP01StageEnv(ctx, W, H, resolved, plates, S, B);
          B.drawVolumetricBeam(ctx, 620, 602, 600, 260, { color: "#34d399", spread: 195, intensity: 0.55, t: t });
          drawP01BootWithLeg(ctx, plates.portholeImg, S, 456, 136, -0.02);

          var sx0 = 260, sy0 = 532;
          var sx1 = 552, sy1 = 258;
          B.drawSnailSilverTrail(ctx, sx0, sy0, sx1, sy1, u, t, { arc: 28, width: 6.5 });
          S.drawMailSnail(ctx, lerp(sx0, sx1, u), lerp(sy0, sy1, u), 1.28, t, {
            rot: -0.72 * u,
            postcard: true
          });
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = clamp(resolved.stemU, 0, 1);
          var hit = smooth(0.15, 0.52, u);
          var recoil = Math.sin(clamp((u - 0.45) * 6, 0, Math.PI)) * 12;
          drawP01StageEnv(ctx, W, H, resolved, plates, S, B);
          drawP01BootWithLeg(ctx, plates.portholeImg, S, 452 - recoil, 136, -0.03 - recoil * 0.004);

          var tipX = lerp(990, 742, hit) + recoil * 0.5;
          var tipY = lerp(520, 466, hit);
          drawBrassScissorTongs(ctx, S, 1110, 560, tipX, tipY, 0.34 - hit * 0.22);
          if (u > 0.42) {
            B.drawDeterministicParticles(ctx, "brass_sparks", 738, 466, (t % 0.9), { count: 14, seed: 14.4 });
            for (var r = 0; r < 3; r++) {
              var rad = 22 + ((t * 95 + r * 36) % 110);
              ctx.strokeStyle = "rgba(251, 191, 36, 0.55)";
              ctx.lineWidth = 2.2;
              ctx.beginPath();
              ctx.ellipse(732, 498, rad, rad * 0.32, 0, 0, TAU);
              ctx.stroke();
            }
          }
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP01StageEnv(ctx, W, H, resolved, plates, S, B);
            B.drawVolumetricBeam(ctx, 620, 602, 605, 250, { color: "#f59e0b", spread: 245, intensity: 1.05, t: t });
            drawP01BootWithLeg(ctx, plates.portholeImg, S, 456, 130, -0.02, "sepia", 0.72);

            // Amber X-ray revealing carved wooden peg-leg & miniature shipwreck ribs inside boot!
            B.drawXRayOverlay(ctx, 618, 344, 248, 286, clamp(resolved.outcomeU * 2.2, 0.2, 1), function (g, cx, cy) {
              // Hull plank ribs
              for (var r = -2; r <= 2; r++) {
                S.drawCardboardPuppetPiece(g, [
                  [cx - 86, cy + 54 + r * 22], [cx + 86, cy + 46 + r * 22],
                  [cx + 80, cy + 60 + r * 22], [cx - 90, cy + 68 + r * 22]
                ], { tone: "#8c653b", ribs: 1, shadow: false });
              }
              // Jointed wooden pirate peg-leg + split-pin knee!
              drawCardboardLimb(g, S, cx - 8, cy - 118, cx - 2, cy - 12, 22, 16, "#b47c44", "brass");
              drawCardboardLimb(g, S, cx - 2, cy - 12, cx + 6, cy + 106, 15, 8, "#d49b57", "brass");
              S.drawSplitPin(g, cx + 6, cy + 106, 5.5, { metal: "brass" });
            }, { bg: "rgba(42, 24, 8, 0.88)", borderColor: "#f59e0b", t: t });

            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 162, turkeyY: 504 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP01StageEnv(ctx, W, H, resolved, plates, S, B);
            B.drawVolumetricBeam(ctx, 620, 602, 640, 390, { color: "#fde68a", spread: 230, intensity: 0.95, t: t });
            drawP01BootWithLeg(ctx, plates.portholeImg, S, 442, 126, -0.02, "cyan", 0.58);
            B.drawLanternHalo(ctx, 648, 434, 130, { color: "#fbbf24", intensity: 0.95, t: t });

            // Cutout hermit crab with wire spectacles reading a tiny vector newspaper inside boot toe!
            var cx = 636, cy = 442 + Math.sin(t * 3.4) * 3;
            S.drawCardboardPuppetPiece(ctx, [[cx - 46, cy + 18], [cx - 34, cy - 26], [cx + 34, cy - 26], [cx + 46, cy + 18]], {
              tone: "#c25943", ribs: 2, pins: [[cx - 24, cy], [cx + 24, cy]]
            });
            // Wire spectacles
            ctx.strokeStyle = "#f3d184";
            ctx.lineWidth = 2.6;
            ctx.fillStyle = "#fbfaf5";
            ctx.beginPath(); ctx.arc(cx - 14, cy - 24, 10, 0, TAU); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(cx + 14, cy - 24, 10, 0, TAU); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx - 4, cy - 24); ctx.lineTo(cx + 4, cy - 24); ctx.stroke();
            // Tiny open newspaper flipped by crab claw
            drawVectorSlip(ctx, S, cx + 44, cy - 4 + Math.sin(t * 4.5) * 4, 66, 48, 0.16 + Math.sin(t * 4.5) * 0.08, {
              bandColor: "#1d596e", rows: 3, sealColor: "#0f8f80", glyph: "check"
            });

            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 985, troutY: 360, snailX0: 230, snailX1: 495, snailY1: 525 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP01StageEnv(ctx, W, H, resolved, plates, S, B, { lunar: true, monoReeds: true });
            var floatX = 636 + Math.sin(t * 1.8) * 20;
            var floatY = 304 + Math.cos(t * 2.3) * 16;
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 640, saucerY: 98, beamX: floatX, beamY: floatY + 95, beamSpread: 185 });

            // Zero-G crowned lunar thruster boot firing cyan ion plumes!
            ctx.save();
            ctx.translate(floatX, floatY);
            ctx.rotate(-0.18 + Math.sin(t * 1.7) * 0.12);
            S.drawScissorCutout(ctx, plates.portholeImg, 198, 106, 244, 308, -136, -158, 272, 326, BOOT_POLY, {
              filter: "cyan", haloWidth: 5.0, shadow: false, seed: 1.88
            });
            // Gold Imperial Crown strapped to cuff
            S.drawCutoutPaperEdge(ctx, [[-52, -148], [-44, -198], [-12, -168], [18, -208], [48, -168], [82, -196], [88, -138], [-48, -126]], "#e2b246", "#14110d", { paperRim: 3.0 });
            // Cyan ion thruster plumes
            var plume = 42 + Math.sin(t * 24) * 14;
            S.drawCutoutPaperEdge(ctx, [[-90, 118], [-54, 126], [-74, 126 + plume]], "#38bdf8", "#fbfaf5", { paperRim: 2.0, shadow: false });
            S.drawCutoutPaperEdge(ctx, [[42, 148], [82, 156], [60, 156 + plume * 1.15]], "#a855f7", "#fbfaf5", { paperRim: 2.0, shadow: false });
            ctx.restore();
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP01StageEnv(ctx, W, H, resolved, plates, S, B);
            var wx = 648, wy = 392 + Math.sin(t * 1.8) * 9;

            // Twig mast & tattered paper sails unfurling from bootlaces
            ctx.save();
            ctx.translate(wx - 42, wy - 56);
            ctx.rotate(-0.08 + Math.sin(t * 2.1) * 0.06);
            drawCardboardLimb(ctx, S, 0, 24, 0, -210, 10, 6, "#6b5c4c", "brass");
            drawCardboardLimb(ctx, S, -88, -142, 94, -128, 7, 7, "#7f6e5b", "silver");
            S.drawCutoutPaperEdge(ctx, [[-80, -138], [84, -124], [66, -38], [14, -64], [-26, -34], [-72, -58]], "#dfd8c8", "#14110d", { paperRim: 3.0 });
            ctx.restore();

            // Boot rolled 90 deg onto side bobbing like a capsized rowboat hull!
            S.drawScissorCutout(ctx, plates.portholeImg, 198, 106, 244, 308, wx - 175, wy - 170, 330, 390, BOOT_POLY, {
              filter: "sepia", haloWidth: 4.8, rot: -1.34 + Math.sin(t * 1.8) * 0.05, pivotX: wx, pivotY: wy, seed: 1.35
            });
            drawCutBubbleCluster(ctx, wx, 530, 12, 320, 220, t, 135, "rgba(210,235,235,0.8)");
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 162, turkeyY: 504, binoculars: true });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP01StageEnv(ctx, W, H, resolved, plates, S, B);
            // Boot upright as bubbling hot-tub Jacuzzi!
            S.drawScissorCutout(ctx, plates.portholeImg, 198, 106, 244, 308, 456, 178, 328, 376, BOOT_POLY, {
              haloWidth: 5.0, rot: 0.04, seed: 1.44
            });
            // Frothy hot-tub bubble rim + 5 happy creek minnows in tiny shower caps!
            for (var m = 0; m < 5; m++) {
              var mx = 524 + m * 36 + Math.sin(t * 3.8 + m) * 5;
              var my = 186 + Math.sin(t * 5.2 + m * 1.4) * 10;
              S.drawCardboardPuppetPiece(ctx, [[mx - 14, my + 18], [mx - 12, my - 10], [mx + 12, my - 10], [mx + 14, my + 18]], {
                tone: "#8f9c8a", ribs: 1, shadow: false
              });
              // Puff shower cap
              S.drawCutoutPaperEdge(ctx, circlePoly(10, 15, 11, mx, my - 16, 1.5, m + 4), m % 2 === 0 ? "#f472b6" : "#60a5fa", "#14110d", { paperRim: 2.0, shadow: false });
              ctx.fillStyle = "#14110d";
              ctx.beginPath(); ctx.arc(mx + 4, my - 3, 2.2, 0, TAU); ctx.fill();
            }
            drawCutBubbleCluster(ctx, 595, 225, 18, 180, 165, t * 1.5, 149, "rgba(235, 252, 250, 0.94)");
            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 965, troutY: 345, snailX0: 215, snailX1: 420, snailY1: 530 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP01StageEnv(ctx, W, H, resolved, plates, S, B, { lunar: true, hideReeds: true });
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 640, saucerY: 94, beamX: 640, beamY: 510, beamSpread: 225 });

            // Inverted 180-deg boot at top pulling pebbles, reeds & bubbles SKYWARD!
            S.drawScissorCutout(ctx, plates.portholeImg, 198, 106, 244, 308, 488, 118 + Math.sin(t * 2.4) * 10, 290, 336, BOOT_POLY, {
              filter: "cyan", haloWidth: 5.0, rot: Math.PI * 0.96 + Math.sin(t * 1.9) * 0.06, pivotX: 633, pivotY: 286, seed: 1.49
            });
            for (var p = 0; p < 9; p++) {
              var pu = ((t * 0.55 + p / 9) % 1);
              var pxP = 460 + (p * 47) % 360 + Math.sin(t * 3 + p) * 14;
              var pyP = lerp(548, 155, pu);
              S.drawCardboardPuppetPiece(ctx, [[pxP - 14, pyP], [pxP, pyP - 13], [pxP + 15, pyP - 2], [pxP + 6, pyP + 11]], {
                tone: p % 2 === 0 ? "#a855f7" : "#94a3b8", ribs: 1, shadow: false
              });
            }
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = clamp(resolved.outcomeU, 0, 1);
            drawP01StageEnv(ctx, W, H, resolved, plates, S, B);
            drawP01BootWithLeg(ctx, plates.portholeImg, S, 456, 132, -0.02);

            // 4 crimson 'RETURN' wax postmark seals stamped up the boot shaft!
            var stamps = [[598, 448], [584, 376], [576, 304], [592, 228]];
            var count = Math.min(4, Math.floor(u * 5.2) + 1);
            for (var i = 0; i < count; i++) {
              drawWaxSeal(ctx, S, stamps[i][0], stamps[i][1], 24, "#d42a1e", "return", -0.15 + i * 0.12);
            }
            var cur = stamps[count - 1];
            S.drawMailSnail(ctx, cur[0] - 46, cur[1] + 8, 1.24, t, { rot: -Math.PI * 0.45, postcard: true });
            // Lost-luggage ticket next to Turkey
            drawVectorSlip(ctx, S, 268, 496, 74, 48, -0.12, { bandColor: "#d42a1e", sealColor: "#1d596e", glyph: "return" });
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 158, turkeyY: 504 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP01StageEnv(ctx, W, H, resolved, plates, S, B);
            S.drawScissorCutout(ctx, plates.portholeImg, 198, 106, 244, 308, 456, 198, 326, 358, BOOT_POLY, {
              haloWidth: 5.0, rot: 0.02, seed: 1.62
            });

            // Polite crab in crimson bellhop pillbox cap popping from boot top & signing Snail's clipboard!
            var cx = 594, cy = 192 + Math.sin(t * 3.2) * 5;
            S.drawCardboardPuppetPiece(ctx, [[cx - 48, cy + 28], [cx - 38, cy - 22], [cx + 38, cy - 22], [cx + 48, cy + 28]], {
              tone: "#c8523b", ribs: 2, pins: [[cx - 22, cy + 4], [cx + 22, cy + 4]]
            });
            // Bellhop pillbox cap with gold button
            S.drawCutoutPaperEdge(ctx, [[-28 + cx, cy - 22], [-24 + cx, cy - 48], [24 + cx, cy - 46], [28 + cx, cy - 22]], "#d42a1e", "#14110d", { paperRim: 2.2 });
            S.drawSplitPin(ctx, cx, cy - 35, 3.8, { metal: "brass" });

            // Clipboard + feather quill scribbling
            drawVectorSlip(ctx, S, cx + 92, cy + 16, 62, 76, 0.14, { bandColor: "#b45309", sealColor: "#0f8f80", glyph: "check" });
            var qx = cx + 82 + Math.sin(t * 11) * 10;
            var qy = cy + 18 + Math.cos(t * 9) * 6;
            S.drawCutoutPaperEdge(ctx, [[qx, qy], [qx + 28, qy - 42], [qx + 42, qy - 34], [qx + 8, qy + 2]], "#fbfaf5", "#14110d", { paperRim: 1.8, shadow: false });

            S.drawMailSnail(ctx, cx + 152, cy + 48, 1.18, t, { flip: true, postcard: true, hasReply: true });
            drawOutcomeWitnesses(ctx, resolved, S, B, { skipDefaultSnail: true, troutX: 980, troutY: 360 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP01StageEnv(ctx, W, H, resolved, plates, S, B, { lunar: true });
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 640, saucerY: 96, beamX: 615, beamY: 420, beamSpread: 195 });
            drawP01BootWithLeg(ctx, plates.portholeImg, S, 438, 146, -0.03, "mono", 0.84);

            // Mail Snail beaming emerald laser wireframe boot scan up to Alien Saucer!
            var sx = 352, sy = 486;
            S.drawMailSnail(ctx, sx, sy, 1.32, t, { postcard: true, hasAlienStamp: true });
            B.drawVolumetricBeam(ctx, sx + 26, sy - 18, 608, 355, { color: "#10b981", coreColor: "#d1fae5", spread: 145, intensity: 1.1, t: t });

            // Rising holographic green wireframe boot blueprint
            var holoY = lerp(350, 175, (t * 0.42) % 1);
            ctx.save();
            ctx.translate(640, holoY);
            ctx.strokeStyle = "#34d399";
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            for (var i = 0; i < BOOT_POLY.length; i++) {
              var px = (BOOT_POLY[i][0] - 0.5) * 150;
              var py = (BOOT_POLY[i][1] - 0.5) * 175;
              if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP01StageEnv(ctx, W, H, resolved, plates, S, B);
            drawP01BootWithLeg(ctx, plates.portholeImg, S, 452, 132, -0.02, "mono");

            // Heavy riveted cast-iron diving toe cap bolted onto boot!
            S.drawCardboardPuppetPiece(ctx, [[620, 418], [768, 444], [774, 514], [608, 502]], {
              tone: "#475569", ribs: 2, pins: [[640, 442], [692, 452], [744, 462], [640, 488], [744, 498]]
            });
            var strike = Math.abs(Math.sin(t * 5.2));
            drawBrassScissorTongs(ctx, S, 1110, 555, 764 + strike * 18, 474, 0.16 + strike * 0.12);
            B.drawDeterministicParticles(ctx, "brass_sparks", 764, 474, (t * 1.4) % 0.8, { count: 16, seed: 18.1 });

            // Concentric teal sonar rings booming outward
            for (var sr = 0; sr < 4; sr++) {
              var rad = 28 + ((t * 130 + sr * 52) % 210);
              ctx.strokeStyle = "rgba(56, 189, 248, " + (1 - rad / 240).toFixed(2) + ")";
              ctx.lineWidth = 3.0;
              ctx.beginPath(); ctx.arc(755, 474, rad, 0, TAU); ctx.stroke();
            }
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 158, turkeyY: 514 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP01StageEnv(ctx, W, H, resolved, plates, S, B);
            drawP01BootWithLeg(ctx, plates.portholeImg, S, 440, 130, -0.03);

            var shakeX = Math.sin(t * 22) * 5;
            drawBrassScissorTongs(ctx, S, 1110, 555, 818 + shakeX, 458, 0.08);

            // Giant oversized split-pin red crab pincer bursting from boot toe to pinch tongs!
            var ik = S.solveIK2(685, 456, 78, 74, 816 + shakeX, 458, -1);
            drawJointedIKLimb(ctx, S, ik, 16, 14, "#b84a39", "#d45a45", "brass");
            var snap = 0.08 + Math.abs(Math.sin(t * 12)) * 0.16;
            ctx.save();
            ctx.translate(816 + shakeX, 458);
            ctx.rotate(0.05);
            ctx.save(); ctx.rotate(-snap);
            S.drawCardboardPuppetPiece(ctx, [[-10, -8], [66, -32], [82, -8], [0, 4]], { tone: "#d42a1e", ribs: 1 });
            ctx.restore();
            ctx.save(); ctx.rotate(snap);
            S.drawCardboardPuppetPiece(ctx, [[-10, -4], [82, 8], [66, 32], [0, 8]], { tone: "#9e3d1c", ribs: 1, pin: { x: 0, y: 0, r: 5.2, metal: "brass" } });
            ctx.restore();
            ctx.restore();

            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 985, troutY: 325, snailX0: 215, snailX1: 430, snailY1: 530 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = clamp(resolved.outcomeU, 0, 1);
            drawP01StageEnv(ctx, W, H, resolved, plates, S, B, { lunar: true });
            var lift = smooth(0.12, 0.85, u) * 145 + Math.sin(t * 8) * 6;
            var bx = 468, by = 185 - lift;

            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 640, saucerY: 94, beamX: 635, beamY: by + 220, beamSpread: 190 });
            drawBrassScissorTongs(ctx, S, 1110, 560, 520, 470, 0.22);

            // Corrugated cardboard rocket nozzles & roaring orange-violet plasma flames under boot sole!
            S.drawScissorCutout(ctx, plates.portholeImg, 198, 106, 244, 308, bx, by, 318, 372, BOOT_POLY, {
              haloWidth: 5.0, rot: -0.08, seed: 1.95
            });
            // Glowing red heel switch
            ctx.fillStyle = "#ef4444";
            ctx.beginPath(); ctx.arc(bx + 68, by + 292, 11, 0, TAU); ctx.fill();

            var nozzles = [bx + 92, bx + 188, bx + 262];
            for (var n = 0; n < 3; n++) {
              var nx = nozzles[n];
              var ny = by + 322 + n * 16;
              S.drawCardboardPuppetPiece(ctx, [[nx - 20, ny - 10], [nx + 20, ny - 10], [nx + 28, ny + 22], [nx - 28, ny + 22]], {
                tone: "#64748b", ribs: 2, shadow: false
              });
              var fh = 78 + Math.sin(t * 26 + n * 2) * 24;
              S.drawCutoutPaperEdge(ctx, [[nx - 22, ny + 22], [nx + 22, ny + 22], [nx, ny + 22 + fh]], n === 1 ? "#a855f7" : "#f97316", "#fbfaf5", { paperRim: 2.0, shadow: false });
            }
          }
        }
      },

      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawPortholeBezelCorners(ctx, W, H, resolved, S);
      }
    });
  }

  /* ==========================================================================
   * PORTHOLE #02 · GALLEY — "queneau-rostrum"
   * Plates: ./portholes/p02.jpg + ./assets/atlas-stills/atlas-47.webp
   * ========================================================================== */
  var BASTER_POLY = [
    [0.04, 0.76], [0.18, 0.56], [0.36, 0.46],
    [0.92, 0.04], [0.98, 0.14], [0.50, 0.66],
    [0.32, 0.88], [0.12, 0.96]
  ];

  function drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B, opts) {
    var cfg = opts || {};
    var t = resolved.t || 0;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var pxFar = pxShift(0.25, t, 12);
    var pxMid = pxShift(0.5, t, 12);

    // Right corridor doorway + officer from atlas-47.webp
    var aw = aImg ? aImg.naturalWidth : 382;
    var ah = aImg ? aImg.naturalHeight : 680;
    S.drawTornPaperFlat(ctx, 944 + pxFar, 86, 218, 452, {
      fill: "#263a19", paperColor: "#f5efe1", deckle: 8.0, seed: 22.4
    });
    S.drawScissorCutout(
      ctx, aImg,
      aw * 0.03, ah * 0.01, aw * 0.62, ah * 0.86,
      968 + pxFar * 1.1, 116, 170, 408,
      [[0.12, 0.03], [0.88, 0.04], [0.94, 0.42], [0.88, 0.96], [0.14, 0.96], [0.06, 0.45]],
      { filter: cfg.space ? "cyan" : "sepia", haloWidth: 4.0, seed: 2.11 }
    );

    if (cfg.flyingHatch) return { winX: 204, winY: 112 };

    var winX = 192 + pxMid * 0.5;
    var winY = 108;
    S.drawTornPaperFlat(ctx, winX, winY, 548, 368, {
      fill: "#6c4c2b", paperColor: "#fbfaf5", deckle: 7.5, seed: 202.9
    });
    S.drawTornPaperFlat(ctx, winX + 26, winY + 24, 496, 314, {
      fill: cfg.space ? "#1e1b4b" : "#f5be62", paperColor: "#e6dcc8", deckle: 3.0, shadow: false, seed: 205.1
    });

    // Background dining fish on barstools from p02.jpg
    if (!cfg.hideDiners) {
      S.drawScissorCutout(
        ctx, pImg,
        348, 294, 104, 80,
        winX + 312, winY + 186, 176, 136,
        [[0.04, 0.10], [0.95, 0.08], [0.96, 0.95], [0.04, 0.95]],
        { haloWidth: 3.8, seed: 2.31 }
      );
    }

    if (!cfg.hideCook) {
      var cookBob = Math.sin(t * 2.8) * 5;
      S.drawScissorCutout(
        ctx, pImg,
        188, 198, 156, 178,
        winX + 30, winY + 52 + cookBob, 264, 288,
        [[0.16, 0.22], [0.36, 0.02], [0.76, 0.04], [0.96, 0.34], [0.92, 0.72], [0.65, 0.96], [0.06, 0.96], [0.04, 0.56]],
        { haloWidth: 5.0, seed: 2.34 }
      );
    }

    return { winX: winX, winY: winY };
  }

  function registerPorthole02(B) {
    B.definePortalGame(2, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        S.drawBolasBackdrop(
          ctx, W, H, resolved.bolasStyle, 2, resolved.t,
          { showCaptions: !resolved.blind, lamp: resolved.lampOn, ballast: resolved.ballastOn },
          { paperTop: "#fae090", paperBot: "#edd078", floorColor: "#273b19" }
        );
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var pImg = plates.portholeImg;
        var g = drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B);
        var sq = 0.5 + 0.5 * Math.sin(t * 4.8);
        var hx = g.winX + 278 + sq * 16;
        var hy = g.winY + 242 - sq * 10;
        var ik = S.solveIK2(g.winX + 165, g.winY + 238, 76, 72, hx, hy, 1);
        drawCardboardLimb(ctx, S, g.winX + 165, g.winY + 238, ik.jx, ik.jy, 14, 11, "#8f9c8a", "brass");

        S.drawScissorCutout(ctx, pImg, 242, 276, 138, 98, g.winX + 214, g.winY + 148 - sq * 8, 256, 184, BASTER_POLY, {
          haloWidth: 5.0, rot: -0.08 - sq * 0.07, pin: { x: hx, y: hy, r: 4.8, metal: "silver" }, seed: 2.40
        });
        drawCardboardLimb(ctx, S, ik.jx, ik.jy, hx, hy, 11, 9, "#a58362", "silver");
        drawCutBubbleCluster(ctx, g.winX + 520, g.winY + 175, 10, 130, 145, t, 21, "rgba(150, 224, 228, 0.9)");
        S.drawTurkeyInCorner(ctx, 118, 504, 1.0, t, { dispatch: 0.08 });
        drawRootAnchorLandmarks(ctx, resolved, S, B);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = clamp(resolved.stemU, 0, 1);
          var g = drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B);
          B.drawVolumetricBeam(ctx, 120, 560, g.winX + 340, g.winY + 215, {
            color: "#fde68a", coreColor: "#ffffff", spread: 165, intensity: 0.5 + 0.9 * u, t: t
          });
          S.drawScissorCutout(ctx, plates.portholeImg, 242, 276, 138, 98, g.winX + 218, g.winY + 144, 268, 192, BASTER_POLY, {
            haloWidth: 5.2, rot: -0.10, seed: 2.41
          });
          B.drawLanternHalo(ctx, g.winX + 356, g.winY + 216, 98 * u + 24, { color: "#fbbf24", intensity: 0.95, t: t });
          // Magnifier lens ring revealing bubbling amber liquid inside bulb
          ctx.save();
          ctx.translate(g.winX + 334, g.winY + 226);
          ctx.fillStyle = "rgba(254, 243, 199, 0.85)";
          ctx.strokeStyle = "#b45309";
          ctx.lineWidth = 4.5;
          ctx.beginPath(); ctx.arc(0, 0, 44 * easeOutBack(u), 0, TAU); ctx.fill(); ctx.stroke();
          drawCutBubbleCluster(ctx, 0, 18, 6, 42, 42, t * 2.2, 29, "rgba(245, 158, 11, 0.9)");
          ctx.restore();
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = easeOutBack(resolved.stemU);
          var g = drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B);
          // Spinning diner order ticket wheel above hatch!
          ctx.save();
          ctx.translate(g.winX + 412, g.winY + 66);
          ctx.rotate(t * 7.5 * clamp(u, 0.2, 1));
          ctx.strokeStyle = "#14110d";
          ctx.fillStyle = "#d4a44c";
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(0, 0, 44, 0, TAU); ctx.fill(); ctx.stroke();
          for (var sp = 0; sp < 6; sp++) {
            var a = (sp / 6) * TAU;
            drawVectorSlip(ctx, S, Math.cos(a) * 48, Math.sin(a) * 48, 24, 32, a + 0.4, { rows: 2 });
          }
          S.drawSplitPin(ctx, 0, 0, 5.5, { metal: "silver" });
          ctx.restore();

          // Puffed-up giant rubber baster bulb!
          S.drawScissorCutout(ctx, plates.portholeImg, 242, 276, 138, 98, g.winX + 214, g.winY + 148, 256, 184, BASTER_POLY, {
            haloWidth: 5.0, rot: -0.14, seed: 2.42
          });
          var bulbR = 26 + 34 * clamp(u, 0, 1.2) + Math.sin(t * 8) * 4;
          S.drawCutoutPaperEdge(ctx, circlePoly(14, bulbR, bulbR * 0.88, g.winX + 246, g.winY + 292, 1.5, 22), "#d42a1e", "#14110d", { paperRim: 3.0 });
          drawCutBubbleCluster(ctx, g.winX + 465, g.winY + 280, 16, 220, 240, t * 1.6, 202, "rgba(215, 248, 245, 0.9)");
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = smooth(0, 1, resolved.stemU);
          var g = drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B);
          S.drawScissorCutout(ctx, plates.portholeImg, 242, 276, 138, 98, g.winX + 218, g.winY + 152, 248, 178, BASTER_POLY, {
            haloWidth: 4.8, rot: -0.06, seed: 2.43
          });
          var sx0 = g.winX + 40, sy0 = g.winY + 348;
          var sx1 = g.winX + 398, sy1 = g.winY + 348;
          B.drawSnailSilverTrail(ctx, sx0, sy0, sx1, sy1, u, t, { arc: 6 });
          S.drawMailSnail(ctx, lerp(sx0, sx1, u), sy0, 1.24, t, { postcard: true });
          if (u > 0.45) {
            drawVectorSlip(ctx, S, g.winX + 398, g.winY + 84, 58, 72, Math.sin(t * 4) * 0.08, {
              bandColor: "#0f8f80", sealColor: "#d42a1e", glyph: "star"
            });
          }
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = clamp(resolved.stemU, 0, 1);
          var g = drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B);
          S.drawScissorCutout(ctx, plates.portholeImg, 242, 276, 138, 98, g.winX + 214, g.winY + 148, 256, 184, BASTER_POLY, {
            haloWidth: 5.0, rot: -0.12, seed: 2.44
          });
          var pinch = smooth(0.1, 0.55, u);
          drawBrassScissorTongs(ctx, S, 1080, 560, lerp(920, g.winX + 258, pinch), lerp(510, g.winY + 292, pinch), 0.36 - pinch * 0.28);
          // Looping parabolic arc of glossy gravy droplets!
          if (u > 0.35) {
            for (var d = 0; d < 9; d++) {
              var du = ((t * 0.9 + d / 9) % 1);
              var dx = lerp(g.winX + 448, 930, du);
              var dy = lerp(g.winY + 158, 495, du) - Math.sin(du * Math.PI) * 145;
              S.drawCutoutPaperEdge(ctx, circlePoly(8, 9, 7, dx, dy, 1, d), "#92400e", "#14110d", { paperRim: 2.0, shadow: false });
            }
          }
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var g = drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B, { hideCook: true });
            B.drawVolumetricBeam(ctx, 130, 550, g.winX + 280, g.winY + 210, { color: "#fde68a", spread: 195, intensity: 0.9, t: t });

            // Calibrated brass submarine pressure gauge + upright baster air-pump!
            var pump = 0.5 + 0.5 * Math.sin(t * 4.6);
            S.drawCardboardPuppetPiece(ctx, [[g.winX + 66, g.winY + 322], [g.winX + 76, g.winY + 114], [g.winX + 240, g.winY + 114], [g.winX + 250, g.winY + 322]], {
              tone: "#787c7e", ribs: 3, pins: [[g.winX + 94, g.winY + 138], [g.winX + 222, g.winY + 138]]
            });
            ctx.save();
            ctx.translate(g.winX + 158, g.winY + 198);
            ctx.fillStyle = "#fbfaf5"; ctx.strokeStyle = "#14110d"; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(0, 0, 44, 0, TAU); ctx.fill(); ctx.stroke();
            for (var tk = 0; tk < 9; tk++) {
              var ta = -Math.PI * 0.8 + (tk / 8) * Math.PI * 1.6;
              ctx.beginPath(); ctx.moveTo(Math.cos(ta) * 31, Math.sin(ta) * 31); ctx.lineTo(Math.cos(ta) * 39, Math.sin(ta) * 39); ctx.stroke();
            }
            var na = -0.85 + pump * 1.75;
            ctx.strokeStyle = "#d42a1e"; ctx.lineWidth = 3.6;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(na) * 33, Math.sin(na) * 33); ctx.stroke();
            S.drawSplitPin(ctx, 0, 0, 4.5, { metal: "brass" });
            ctx.restore();

            S.drawScissorCutout(ctx, plates.portholeImg, 242, 276, 138, 98, g.winX + 258, g.winY + 96 + pump * 48, 240, 174, BASTER_POLY, {
              filter: "sepia", haloWidth: 5.0, rot: -0.78, seed: 2.55
            });
            drawCutBubbleCluster(ctx, 320, 480, 14, 240, 260, t * 1.4, 251, "rgba(186, 230, 253, 0.92)");
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 136, turkeyY: 506 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var g = drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B);
            // Volumetric golden heat-lamp beam melting butter onto 3 floating creek biscuits!
            B.drawVolumetricBeam(ctx, g.winX + 260, 42, g.winX + 460, 425, {
              color: "#fbbf24", coreColor: "#fef3c7", spread: 185, intensity: 1.1, t: t
            });
            S.drawCardboardPuppetPiece(ctx, [[490, 434], [835, 434], [812, 462], [512, 462]], { tone: "#94a3b8", ribs: 1 });
            for (var b = 0; b < 3; b++) {
              var bx = 556 + b * 104;
              var by = 412 + Math.sin(t * 3.1 + b) * 5;
              S.drawCutoutPaperEdge(ctx, circlePoly(12, 38, 24, bx, by, 2, b + 8), "#d99b4e", "#14110d", { paperRim: 2.5 });
              // Melting golden butter pat
              S.drawCutoutPaperEdge(ctx, [[bx - 14, by - 22], [bx + 14, by - 20], [bx + 18, by - 6], [bx - 16, by - 8]], "#fde047", "#14110d", { paperRim: 1.5, shadow: false });
            }
            // Brook Trout with tiny fork + Mail Snail!
            drawCardboardLimb(ctx, S, 910, 415, 862, 380, 5, 4, "#cbd5e1", "silver");
            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 980, troutY: 396, snailX0: 240, snailX1: 810, snailY1: 536 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var g = drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B, { space: true });
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 670, saucerY: 98, beamX: 670, beamY: 360, beamSpread: 185 });

            // Supercharged cyan/magenta warp syringe firing plasma orbs upward into Saucer!
            S.drawScissorCutout(ctx, plates.portholeImg, 242, 276, 138, 98, g.winX + 268, 248, 272, 196, BASTER_POLY, {
              filter: "cyan", haloWidth: 5.2, rot: -0.62, seed: 2.88
            });
            for (var p = 0; p < 7; p++) {
              var pu = ((t * 1.4 + p / 7) % 1);
              var px = lerp(612, 670, pu) + Math.sin(pu * TAU * 2 + p) * 18;
              var py = lerp(265, 118, pu);
              B.drawLanternHalo(ctx, px, py, 34, { color: p % 2 === 0 ? "#ec4899" : "#22d3ee", intensity: 0.9, t: t });
              ctx.fillStyle = "#ffffff";
              ctx.beginPath(); ctx.arc(px, py, 7.5, 0, TAU); ctx.fill();
            }
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var g = drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B);
            S.drawScissorCutout(ctx, plates.portholeImg, 242, 276, 138, 98, g.winX + 224, g.winY + 158, 250, 180, BASTER_POLY, {
              haloWidth: 5.0, rot: 0.18, seed: 2.61
            });
            // Segmented green vinyl oxygen hose clamped from baster tip down to Turkey's air tank!
            ctx.strokeStyle = "#14110d"; ctx.lineWidth = 18; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(g.winX + 448, g.winY + 212); ctx.bezierCurveTo(760, 250, 520, 520, 224, 512); ctx.stroke();
            ctx.strokeStyle = "#10b981"; ctx.lineWidth = 12;
            ctx.beginPath(); ctx.moveTo(g.winX + 448, g.winY + 212); ctx.bezierCurveTo(760, 250, 520, 520, 224, 512); ctx.stroke();
            S.drawSplitPin(ctx, g.winX + 448, g.winY + 212, 6.0, { metal: "brass" });
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 146, turkeyY: 506, dispatch: 0.9 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var g = drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B);
            // 3 overflowing frosted root-beer float mugs with erupting creamy foam cutouts!
            for (var m = 0; m < 3; m++) {
              var mx = 528 + m * 124;
              var my = 446 + Math.sin(t * 2.8 + m) * 4;
              S.drawCutoutPaperEdge(ctx, [[mx - 34, my - 46], [mx + 34, my - 46], [mx + 30, my + 46], [mx - 30, my + 46]], "#5c2d16", "#14110d", { paperRim: 3.0 });
              // Striped bendy straw on rightmost mug toward Brook Trout
              if (m === 2) {
                ctx.strokeStyle = "#d42a1e"; ctx.lineWidth = 6;
                ctx.beginPath(); ctx.moveTo(mx + 12, my - 52); ctx.lineTo(mx + 42, my - 104); ctx.lineTo(902, 392); ctx.stroke();
              }
              // Creamy ice-cream & soda foam domes
              var fh = Math.sin(t * 4.5 + m) * 8;
              S.drawCutoutPaperEdge(ctx, circlePoly(12, 42, 32, mx, my - 56 - fh, 2, m + 31), "#fef9ee", "#14110d", { paperRim: 2.5 });
            }
            drawCutBubbleCluster(ctx, 650, 390, 16, 260, 210, t * 1.4, 262, "rgba(254, 243, 199, 0.92)");
            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 982, troutY: 394, snailX0: 220, snailX1: 455, snailY1: 536 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var g = drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B, { space: true });
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 640, saucerY: 96, beamX: 520, beamY: 340, beamSpread: 215 });

            // Orbiting glossy brown-and-gold spherical gravy planets with Saturn rings!
            for (var gp = 0; gp < 7; gp++) {
              var oa = t * 1.15 + (gp / 7) * TAU;
              var gx = 520 + Math.cos(oa) * 235;
              var gy = 305 + Math.sin(oa) * 92;
              var gr = 16 + (gp % 3) * 8;
              S.drawCutoutPaperEdge(ctx, circlePoly(12, gr, gr, gx, gy, 1, gp + 40), gp % 2 === 0 ? "#78350f" : "#d97706", "#fbfaf5", { paperRim: 2.2, shadow: false });
              if (gp % 2 === 0) {
                ctx.strokeStyle = "#fde68a"; ctx.lineWidth = 3.2;
                ctx.beginPath(); ctx.ellipse(gx, gy, gr * 1.9, gr * 0.48, -0.28, 0, TAU); ctx.stroke();
              }
            }
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = clamp(resolved.outcomeU, 0, 1);
            var g = drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B);
            // Flipping wooden menu sign: crossed-out drumstick -> green Kelp Leaf emblem!
            var flipW = Math.abs(Math.cos(clamp(u * 1.8, 0, 1) * Math.PI));
            var isKelp = u > 0.28;
            ctx.save();
            ctx.translate(g.winX + 382, g.winY + 178);
            ctx.scale(Math.max(0.15, flipW), 1);
            S.drawCutoutPaperEdge(ctx, [[-72, -92], [72, -92], [72, 92], [-72, 92]], isKelp ? "#ecfdf5" : "#fef2f2", "#14110d", { paperRim: 3.5 });
            if (isKelp) {
              // Bright emerald kelp frond icon
              S.drawCutoutPaperEdge(ctx, [[0, 64], [-28, 18], [-12, -16], [-26, -54], [0, -72], [26, -46], [14, -8], [30, 26]], "#10b981", "#14110d", { paperRim: 2.0, shadow: false });
            } else {
              ctx.fillStyle = "#b45309";
              ctx.beginPath(); ctx.ellipse(-8, 0, 28, 18, -0.2, 0, TAU); ctx.fill();
            }
            ctx.restore();
            S.drawMailSnail(ctx, g.winX + 286, g.winY + 346, 1.18, t, { postcard: true });
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 138, turkeyY: 506 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var g = drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B, { hideDiners: true });
            // Sloped cardboard roller chute + 3 tin roast-dinner cans rolling to Brook Trout!
            S.drawCardboardPuppetPiece(ctx, [[g.winX + 236, g.winY + 288], [g.winX + 716, g.winY + 378], [g.winX + 706, g.winY + 408], [g.winX + 228, g.winY + 318]], {
              tone: "#7f7b73", ribs: 3, pins: [[g.winX + 258, g.winY + 304], [g.winX + 480, g.winY + 346], [g.winX + 690, g.winY + 388]]
            });
            for (var c = 0; c < 3; c++) {
              var cu = ((t * 0.42 + c / 3) % 1);
              var cx = lerp(g.winX + 280, g.winX + 675, cu);
              var cy = lerp(g.winY + 244, g.winY + 332, cu) - Math.abs(Math.sin(cu * Math.PI * 4)) * 8;
              ctx.save();
              ctx.translate(cx, cy);
              ctx.rotate(cu * 0.4);
              S.drawCutoutPaperEdge(ctx, [[-30, -38], [30, -38], [30, 38], [-30, 38]], "#cbd5e1", "#14110d", { paperRim: 3.0 });
              ctx.fillStyle = "#d42a1e"; ctx.fillRect(-28, -16, 56, 32);
              drawWaxSeal(ctx, S, 0, 0, 12, "#0f8f80", "check", 0);
              ctx.restore();
            }
            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 995, troutY: 438, snailX0: 220, snailX1: 825, snailY1: 540 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = clamp(resolved.outcomeU, 0, 1);
            drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B, { space: true });
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 650, saucerY: 98, beamX: 650, beamY: 440, beamSpread: 175 });

            // Foil takeout sack with striped antenna straws clipped to Mail Snail levitating into UFO!
            var liftY = lerp(430, 178, smooth(0.08, 0.88, u)) + Math.sin(t * 4.2) * 8;
            var lx = 650 + Math.sin(t * 2.6) * 14;
            S.drawCutoutPaperEdge(ctx, [[lx - 34, liftY - 68], [lx + 34, liftY - 68], [lx + 42, liftY - 12], [lx - 42, liftY - 12]], "#e2e8f0", "#14110d", { paperRim: 3.0 });
            // Antenna straws
            ctx.strokeStyle = "#ec4899"; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(lx - 12, liftY - 68); ctx.lineTo(lx - 26, liftY - 102); ctx.moveTo(lx + 12, liftY - 68); ctx.lineTo(lx + 26, liftY - 102); ctx.stroke();
            S.drawMailSnail(ctx, lx, liftY + 12, 1.24, t, { postcard: true, hasAlienStamp: true });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var g = drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B);
            var honk = Math.abs(Math.sin(t * 6.5));
            S.drawScissorCutout(ctx, plates.portholeImg, 242, 276, 138, 98, g.winX + 214, g.winY + 148, 256, 184, BASTER_POLY, {
              haloWidth: 5.0, rot: -0.1, seed: 2.71
            });
            // Oversized red clown-horn bulb pumped by brass tongs + concentric brass sound-rings!
            S.drawCutoutPaperEdge(ctx, circlePoly(12, 38 - honk * 12, 34 + honk * 8, g.winX + 244, g.winY + 292, 1, 71), "#ef4444", "#14110d", { paperRim: 3.0 });
            drawBrassScissorTongs(ctx, S, 1080, 560, g.winX + 254, g.winY + 292, 0.12 + honk * 0.22);
            for (var r = 0; r < 4; r++) {
              var rad = 36 + ((t * 150 + r * 58) % 240);
              ctx.strokeStyle = "rgba(212, 164, 76, " + (1 - rad / 275).toFixed(2) + ")";
              ctx.lineWidth = 3.2;
              ctx.beginPath(); ctx.arc(g.winX + 448, g.winY + 168, rad, -0.7, 0.7); ctx.stroke();
            }
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 136, turkeyY: 506 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var g = drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B);
            var tug = Math.sin(t * 7.2) * 34;
            // 2-bone IK chef fins yanking left vs brass tongs yanking right — stretchy taffy bulb!
            var ikChef = S.solveIK2(g.winX + 160, g.winY + 240, 82, 78, 520 + tug * 0.5, 315, 1);
            drawJointedIKLimb(ctx, S, ikChef, 14, 11, "#8f9c8a", "#a58362", "brass");

            // Stretched rubber taffy band + baster
            S.drawCutoutPaperEdge(ctx, [[510 + tug * 0.4, 300], [745 + tug, 312], [745 + tug, 336], [510 + tug * 0.4, 326]], "#ef4444", "#14110d", { paperRim: 2.5 });
            S.drawScissorCutout(ctx, plates.portholeImg, 242, 276, 138, 98, 465 + tug * 0.6, 224, 245, 168, BASTER_POLY, {
              haloWidth: 4.8, rot: 0.24, seed: 2.75
            });
            drawBrassScissorTongs(ctx, S, 1100, 555, 745 + tug, 324, 0.10);
            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 985, troutY: 365, snailX0: 225, snailX1: 580, snailY1: 538 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = clamp(resolved.outcomeU, 0, 1);
            drawP02GalleyHatch(ctx, W, H, resolved, plates, S, B, { flyingHatch: true, space: true });
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 835, saucerY: 112, beamX: 835, beamY: 420, beamSpread: 160 });

            // Entire diner booth detached on split-pin saucer struts & flying into space!
            var lift = smooth(0.05, 0.8, u) * 86;
            var bx = 380 + Math.sin(t * 2.4) * 18;
            var by = 230 - lift + Math.cos(t * 3.1) * 10;
            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(Math.sin(t * 2.2) * 0.06);
            // Chrome saucer skirt under diner booth
            S.drawCardboardPuppetPiece(ctx, [[-210, 145], [210, 145], [255, 182], [-255, 182]], {
              tone: "#94a3b8", ribs: 2, pins: [[-160, 164], [-80, 164], [0, 164], [80, 164], [160, 164]]
            });
            S.drawTornPaperFlat(ctx, -185, -110, 370, 255, { fill: "#6c4c2b", paperColor: "#fbfaf5", deckle: 6.0, seed: 299 });
            S.drawScissorCutout(ctx, plates.portholeImg, 188, 198, 156, 178, -135, -82, 196, 212,
              [[0.16, 0.22], [0.36, 0.02], [0.76, 0.04], [0.96, 0.34], [0.92, 0.72], [0.65, 0.96], [0.06, 0.96], [0.04, 0.56]],
              { haloWidth: 4.0, shadow: false, seed: 2.91 }
            );
            ctx.restore();
            drawBrassScissorTongs(ctx, S, 1100, 560, 620, 465, 0.24);
          }
        }
      },

      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawPortholeBezelCorners(ctx, W, H, resolved, S);
      }
    });
  }

  /* ==========================================================================
   * PORTHOLE #03 · STARBD — "perec-stage"
   * Plates: ./portholes/p03.jpg + ./assets/atlas-stills/atlas-49.webp
   * BLIND-MODE LAW: Tight contour cutouts ONLY; painted words on p03/atlas-49
   * are 100% excluded and replaced by clean vector slate geometry!
   * ========================================================================== */
  var EAGLE_HOOK_POLY = [
    [0.44, 0.02], [0.62, 0.02], [0.76, 0.24],
    [0.97, 0.56], [0.92, 0.86], [0.68, 0.98],
    [0.24, 0.96], [0.16, 0.72], [0.34, 0.56],
    [0.46, 0.44], [0.04, 0.34], [0.18, 0.16]
  ];

  var TEACHER_FISH_POLY = [
    [0.36, 0.02], [0.68, 0.06], [0.82, 0.24],
    [0.96, 0.42], [0.82, 0.58], [0.76, 0.82],
    [0.72, 0.98], [0.34, 0.95], [0.28, 0.76],
    [0.08, 0.52], [0.12, 0.22], [0.22, 0.08]
  ];

  function drawCleanChalkboardStage(ctx, S, x, y, w, h, rot, slateFill) {
    ctx.save();
    ctx.translate(x + w * 0.5, y + h * 0.5);
    ctx.rotate(rot || -0.04);
    ctx.translate(-w * 0.5, -h * 0.5);

    S.drawTornPaperFlat(ctx, 0, 0, w, h, {
      fill: "#6f6848", paperColor: "#fbfaf5", deckle: 5.5, seed: 303.1
    });
    S.drawTornPaperFlat(ctx, 24, 22, w - 48, h - 44, {
      fill: slateFill || "#1f3e35", paperColor: "#39594e", deckle: 2.0, shadow: false, seed: 307.4
    });
    ctx.fillStyle = "#5c5539"; ctx.strokeStyle = "#14110d"; ctx.lineWidth = 2;
    ctx.fillRect(14, h - 18, w - 28, 14);
    ctx.strokeRect(14, h - 18, w - 28, 14);
    ctx.fillStyle = "#fbfaf5";
    ctx.fillRect(w - 118, h - 25, 42, 8);
    ctx.strokeRect(w - 118, h - 25, 42, 8);

    S.drawSplitPin(ctx, 14, 14, 4.5, { metal: "brass" });
    S.drawSplitPin(ctx, w - 14, 14, 4.5, { metal: "brass" });
    S.drawSplitPin(ctx, 14, h - 12, 4.5, { metal: "brass" });
    S.drawSplitPin(ctx, w - 14, h - 12, 4.5, { metal: "brass" });
    ctx.restore();
  }

  function drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B, opts) {
    var cfg = opts || {};
    var t = resolved.t || 0;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.14, color: "#99f6e4" });

    // Mossy creek rocks from p03.jpg (bottom-left, clean of any text)
    S.drawScissorCutout(
      ctx, pImg,
      108, 308, 178, 126,
      184, 430, 282, 172,
      [[0.04, 0.18], [0.56, 0.05], [0.95, 0.48], [0.96, 0.95], [0.05, 0.96]],
      { haloWidth: 4.5, seed: 3.11 }
    );

    var bx = 332, by = 126, bw = 516, bh = 308;
    if (!cfg.skipBoard) {
      drawCleanChalkboardStage(ctx, S, bx, by, bw, bh, cfg.boardRot != null ? cfg.boardRot : -0.04, cfg.slateFill);
    }

    if (!cfg.skipTeacher) {
      var aw = aImg ? aImg.naturalWidth : 382;
      var ah = aImg ? aImg.naturalHeight : 680;
      var floatLift = cfg.zeroG ? -78 + Math.sin(t * 2.1) * 18 : Math.sin(t * 2.2) * 4;
      S.drawScissorCutout(
        ctx, aImg,
        aw * 0.48, ah * 0.12, aw * 0.46, ah * 0.74,
        838, 172 + floatLift, 164, 388,
        TEACHER_FISH_POLY,
        { haloWidth: 4.8, rot: cfg.zeroG ? 0.24 : 0, seed: 3.21 }
      );
    }

    if (!cfg.skipPupils) {
      S.drawScissorCutout(
        ctx, pImg,
        328, 368, 182, 132,
        548, 416 + Math.sin(t * 3.1) * 6, 258, 180,
        [[0.02, 0.56], [0.46, 0.04], [0.96, 0.14], [0.95, 0.68], [0.76, 0.96], [0.24, 0.96]],
        { haloWidth: 4.6, rot: cfg.pupilSpin || 0, seed: 3.25 }
      );
    }

    return { bx: bx, by: by, bw: bw, bh: bh };
  }

  function registerPorthole03(B) {
    B.definePortalGame(3, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        S.drawBolasBackdrop(
          ctx, W, H, resolved.bolasStyle, 3, resolved.t,
          { showCaptions: !resolved.blind, lamp: resolved.lampOn, ballast: resolved.ballastOn },
          { openX: 146, openY: 74, openW: 988, openH: 548, doors: true }
        );
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var st = drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B);
        // Clean geometric Room-4 domino & wave diagrams on slate (Zero Text!)
        ctx.save();
        ctx.translate(st.bx + st.bw * 0.5, st.by + st.bh * 0.5);
        ctx.rotate(-0.04);
        ctx.strokeStyle = "rgba(246, 245, 238, 0.86)";
        ctx.fillStyle = "rgba(246, 245, 238, 0.86)";
        ctx.lineWidth = 3.0;
        ctx.strokeRect(-204, -102, 68, 68);
        var d4 = [[-186, -84], [-154, -84], [-186, -52], [-154, -52]];
        for (var i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(d4[i][0], d4[i][1], 6, 0, TAU); ctx.fill(); }
        ctx.beginPath(); ctx.moveTo(-88, -24); ctx.lineTo(28, -94); ctx.lineTo(28, -24); ctx.closePath(); ctx.stroke();
        ctx.beginPath();
        for (var wx = -200; wx <= 185; wx += 14) {
          var wy = 56 + Math.sin(wx * 0.045 + t * 2.2) * 18;
          if (wx === -200) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
        ctx.restore();

        // Teacher IK wooden pointer
        var ik = S.solveIK2(874, 326, 78, 92, st.bx + 372 + Math.sin(t * 3.6) * 28, st.by + 136, -1);
        drawCardboardLimb(ctx, S, 874, 326, ik.jx, ik.jy, 9, 7, "#9c8265", "brass");
        drawCardboardLimb(ctx, S, ik.jx, ik.jy, ik.ex, ik.ey, 5, 2.5, "#e6d8b8", "silver");
        drawRootAnchorLandmarks(ctx, resolved, S, B);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = clamp(resolved.stemU, 0, 1);
          var st = drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B);
          B.drawVolumetricBeam(ctx, 165, 310, st.bx + st.bw * 0.5, st.by + st.bh * 0.5, {
            color: "#93c5fd", coreColor: "#ffffff", spread: 175, intensity: 0.45 + 0.85 * u, t: t
          });
          // Projected glowing slide frame & grid lines over slate
          ctx.save();
          ctx.globalAlpha = u;
          ctx.strokeStyle = "#e0f2fe";
          ctx.lineWidth = 2.4;
          ctx.strokeRect(st.bx + 48, st.by + 42, st.bw - 96, st.bh - 84);
          for (var gx = st.bx + 96; gx < st.bx + st.bw - 50; gx += 54) {
            ctx.beginPath(); ctx.moveTo(gx, st.by + 42); ctx.lineTo(gx, st.by + st.bh - 42); ctx.stroke();
          }
          for (var gy = st.by + 88; gy < st.by + st.bh - 44; gy += 52) {
            ctx.beginPath(); ctx.moveTo(st.bx + 48, gy); ctx.lineTo(st.bx + st.bw - 48, gy); ctx.stroke();
          }
          ctx.restore();
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = clamp(resolved.stemU, 0, 1);
          var st = drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B);
          // Swirling felt eraser whipping across slate in billowing white chalk clouds!
          var ex = lerp(st.bx + 70, st.bx + st.bw - 90, 0.5 + 0.45 * Math.sin(t * 5.2));
          var ey = st.by + 150 + Math.cos(t * 3.8) * 52;
          S.drawCardboardPuppetPiece(ctx, [[ex - 36, ey - 16], [ex + 36, ey - 16], [ex + 36, ey + 16], [ex - 36, ey + 16]], {
            tone: "#475569", ribs: 2, pin: { x: ex, y: ey, r: 4.0, metal: "silver" }
          });
          B.drawDeterministicParticles(ctx, "ink_puffs", ex, ey, t, {
            count: 22, loop: true, color: "rgba(251, 250, 245, 0.72)"
          });
          drawCutBubbleCluster(ctx, st.bx + 260, st.by + 250, Math.round(8 + 8 * u), 360, 210, t * 1.4, 302, "rgba(248, 250, 252, 0.85)");
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = smooth(0, 1, resolved.stemU);
          var st = drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B);
          var sx0 = st.bx + 36, sy0 = st.by + st.bh - 22;
          var sx1 = st.bx + st.bw - 56, sy1 = st.by + st.bh - 42;
          B.drawSnailSilverTrail(ctx, sx0, sy0, sx1, sy1, u, t, { arc: 8 });
          var curX = lerp(sx0, sx1, u);
          var curY = lerp(sy0, sy1, u);
          S.drawMailSnail(ctx, curX, curY, 1.22, t, { rot: -0.04, postcard: true });
          drawVectorSlip(ctx, S, curX + 26, curY - 28, 44, 32, -0.15, { bandColor: "#0f8f80", sealColor: "#d42a1e", glyph: "check" });
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = clamp(resolved.stemU, 0, 1);
          var hit = smooth(0.1, 0.5, u);
          var st = drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B, {
            pupilSpin: hit * Math.sin(t * 9) * 0.14
          });
          var tx = lerp(990, st.bx + st.bw - 38, hit);
          var ty = lerp(520, st.by + 74, hit);
          drawBrassScissorTongs(ctx, S, 1110, 560, tx, ty, 0.14);
          if (u > 0.38) {
            B.drawDeterministicParticles(ctx, "brass_sparks", tx, ty, (t % 0.8), { count: 14, seed: 34.4 });
          }
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var st = drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B, { skipTeacher: true });
            B.drawVolumetricBeam(ctx, 155, 300, st.bx + 258, st.by + 154, { color: "#fde68a", spread: 185, intensity: 0.95, t: t });

            // Torn-edge Western Outlaw Bandit Poster of disguised Turkey (Zero Text!)
            var px = st.bx + 114, py = st.by + 12, pw = 288, ph = 282;
            S.drawTornPaperFlat(ctx, px, py, pw, ph, { fill: "#e8cfa0", paperColor: "#fbfaf5", deckle: 6.5, seed: 318.2 });
            S.drawSplitPin(ctx, px + 18, py + 18, 5.0, { metal: "brass" });
            S.drawSplitPin(ctx, px + pw - 18, py + 18, 5.0, { metal: "brass" });

            ctx.save();
            ctx.translate(px + pw * 0.5, py + 144);
            ctx.strokeStyle = "#14110d"; ctx.lineWidth = 3;
            ctx.strokeRect(-96, -94, 192, 144);
            // Disguised Turkey silhouette with outlaw hat & red kerchief mask!
            S.drawCardboardPuppetPiece(ctx, [[-52, 46], [-40, -26], [40, -26], [52, 46]], { tone: "#694830", ribs: 2, shadow: false });
            S.drawCutoutPaperEdge(ctx, [[-46, -10], [46, -10], [4, 36]], "#d42a1e", "#14110d", { paperRim: 2.0, shadow: false });
            S.drawCutoutPaperEdge(ctx, [[-80, -26], [-36, -34], [-22, -72], [24, -70], [38, -34], [80, -26], [54, -16], [-54, -16]], "#1c1915", "#14110d", { paperRim: 2.2, shadow: false });
            for (var s = -2; s <= 2; s++) {
              drawSheriffStar(ctx, S, s * 34, 78, 10, 0, "#eab308", "brass");
            }
            ctx.restore();
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 196, turkeyY: 512 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var st = drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B, { slateFill: "#eef2e6", skipPupils: true });
            B.drawVolumetricBeam(ctx, 180, 295, st.bx + 260, st.by + 160, { color: "#fef08a", spread: 195, intensity: 1.05, t: t });

            // Looming dark shadow cast onto bright projector screen + real Eagle-Hook dangling in foreground!
            var hx = 528 + Math.sin(t * 3.1) * 32;
            var hy = 264 + Math.cos(t * 4.2) * 18;
            ctx.save();
            ctx.globalAlpha = 0.48;
            S.drawCutoutPaperEdge(ctx, [[hx + 45, hy - 115], [hx + 165, hy - 55], [hx + 140, hy + 95], [hx + 35, hy + 80], [hx + 10, hy - 20]], "#0f172a", "#0f172a", { paperRim: 0, shadow: false });
            ctx.restore();

            ctx.strokeStyle = "#fbfaf5"; ctx.lineWidth = 2.8;
            ctx.beginPath(); ctx.moveTo(540, 74); ctx.lineTo(hx, hy - 96); ctx.stroke();
            S.drawScissorCutout(ctx, plates.portholeImg, 352, 196, 104, 162, hx - 74, hy - 108, 154, 224, EAGLE_HOOK_POLY, {
              haloWidth: 4.8, rot: Math.sin(t * 3.6) * 0.1, seed: 3.55
            });
            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 985, troutY: 425, snailX0: 250, snailX1: 720, snailY1: 536 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 640, saucerY: 98, beamX: 610, beamY: 345, beamSpread: 220 });

            // 3-target holographic Galactic Bounty Board!
            S.drawCardboardPuppetPiece(ctx, [[268, 186], [952, 186], [972, 474], [248, 474]], {
              tone: "#111827", stroke: "#0f8f80", lineWidth: 3.2, ribs: 2, pins: [[288, 206], [932, 206], [268, 454], [952, 454]]
            });
            var cards = [
              { x: 396, col: "#f43f5e", kind: "turkey" },
              { x: 610, col: "#34d399", kind: "trout" },
              { x: 824, col: "#fbbf24", kind: "snail" }
            ];
            for (var c = 0; c < 3; c++) {
              var cd = cards[c];
              ctx.save();
              ctx.translate(cd.x, 330);
              ctx.strokeStyle = cd.col; ctx.lineWidth = 2.6;
              ctx.strokeRect(-84, -104, 168, 208);
              if (cd.kind === "turkey") S.drawTurkeyInCorner(ctx, 0, 8, 0.72, t, {});
              else if (cd.kind === "trout") S.drawBrookTrout(ctx, 0, -8, 0.68, t, false);
              else S.drawMailSnail(ctx, 0, 6, 0.95, t, { postcard: false });

              ctx.rotate(t * (c % 2 ? -1.1 : 1.1));
              ctx.setLineDash([7, 5]);
              ctx.beginPath(); ctx.arc(0, -6, 58, 0, TAU); ctx.stroke();
              ctx.setLineDash([]);
              ctx.restore();
            }
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var st = drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B, { skipTeacher: true });
            // Washed-away chalk uncovering dashed teal submarine escape tunnel map!
            ctx.save();
            ctx.translate(st.bx + 54, st.by + 56);
            ctx.strokeStyle = "#2dd4bf"; ctx.lineWidth = 5; ctx.setLineDash([14, 9]);
            ctx.beginPath();
            ctx.moveTo(20, 175); ctx.bezierCurveTo(130, 30, 250, 210, 385, 48);
            ctx.stroke(); ctx.setLineDash([]);
            // Escape arrow head
            ctx.fillStyle = "#2dd4bf";
            ctx.beginPath(); ctx.moveTo(398, 40); ctx.lineTo(364, 38); ctx.lineTo(382, 68); ctx.closePath(); ctx.fill();
            ctx.restore();
            B.drawDeterministicParticles(ctx, "ink_puffs", st.bx + 420, st.by + 95, t, { count: 14, loop: true, color: "rgba(255,255,255,0.5)" });
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 196, turkeyY: 510 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var st = drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B, { skipPupils: true });
            // Swirling snowy chalk-dust tornado recess + pupil fish riding paper snowflakes!
            for (var s = 0; s < 10; s++) {
              var a = t * 2.2 + (s / 10) * TAU;
              var rx = st.bx + 260 + Math.cos(a) * (90 + (s % 3) * 48);
              var ry = st.by + 165 + Math.sin(a) * (55 + (s % 2) * 38);
              drawSheriffStar(ctx, S, rx, ry, 10 + (s % 3) * 3, t * 2 + s, "#ffffff", "silver");
            }
            S.drawScissorCutout(ctx, plates.portholeImg, 328, 368, 182, 132, 465 + Math.cos(t * 2.6) * 55, 225 + Math.sin(t * 2.6) * 35, 215, 152,
              [[0.02, 0.56], [0.46, 0.04], [0.96, 0.14], [0.95, 0.68], [0.76, 0.96], [0.24, 0.96]],
              { haloWidth: 4.0, rot: Math.sin(t * 3) * 0.18, seed: 3.62 }
            );
            // Brass recess hand-bell next to Brook Trout
            S.drawCutoutPaperEdge(ctx, [[908, 355], [932, 355], [946, 392], [894, 392]], "#eab308", "#14110d", { paperRim: 2.2 });
            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 988, troutY: 410, snailX0: 250, snailX1: 760, snailY1: 540 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B, { zeroG: true, skipPupils: true });
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 640, saucerY: 96, beamX: 600, beamY: 420, beamSpread: 225 });

            // Floating wooden school desks & red apples drifting weightlessly upward!
            for (var d = 0; d < 3; d++) {
              var dx = 340 + d * 195 + Math.sin(t * 1.9 + d) * 18;
              var dy = 270 - d * 24 + Math.cos(t * 2.3 + d * 1.5) * 26;
              S.drawCardboardPuppetPiece(ctx, [[dx - 48, dy - 18], [dx + 48, dy - 18], [dx + 40, dy + 24], [dx - 40, dy + 24]], {
                tone: "#855e3b", ribs: 2, pins: [[dx - 30, dy], [dx + 30, dy]]
              });
              // Floating red apple
              S.drawCutoutPaperEdge(ctx, circlePoly(10, 14, 14, dx + 12, dy - 42 + Math.sin(t * 4 + d) * 8, 1, d + 60), "#dc2626", "#14110d", { paperRim: 2.0, shadow: false });
            }
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var st = drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B);
            // Teacher Trout wearing wire spectacles, stamping red wax seal on Mail Snail's scroll!
            ctx.strokeStyle = "#f3d184"; ctx.lineWidth = 2.8;
            ctx.beginPath(); ctx.arc(888, 224, 14, 0, TAU); ctx.stroke();
            drawVectorSlip(ctx, S, 695, 318, 128, 156, -0.06, { bandColor: "#1d596e", rows: 4, sealColor: "#d42a1e", glyph: "check" });
            S.drawMailSnail(ctx, 765, 428, 1.24, t, { flip: true, postcard: true });
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 196, turkeyY: 512 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var st = drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B);
            // Mail Snail crowned Room 4 class pet with gold star & crisp green lettuce leaf!
            var sx = 595, sy = 398;
            S.drawCutoutPaperEdge(ctx, [[sx + 28, sy + 6], [sx + 68, sy - 16], [sx + 76, sy + 14], [sx + 34, sy + 20]], "#22c55e", "#14110d", { paperRim: 2.2 });
            S.drawMailSnail(ctx, sx, sy, 1.48, t, { postcard: true, hasReply: true });
            drawSheriffStar(ctx, S, sx - 8, sy - 38, 18, Math.sin(t * 3) * 0.12, "#facc15", "brass");
            drawOutcomeWitnesses(ctx, resolved, S, B, { skipDefaultSnail: true, troutX: 985, troutY: 420 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var st = drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B, { slateFill: "#0f172a", skipPupils: true });
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 640, saucerY: 96, beamX: 590, beamY: 290, beamSpread: 200 });

            // 6 glowing geometric alien lipogram glyphs + Mail Snail grading red checkmarks!
            for (var g = 0; g < 6; g++) {
              var gx = st.bx + 92 + (g % 3) * 155;
              var gy = st.by + 96 + Math.floor(g / 3) * 110;
              ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 3.0;
              ctx.beginPath();
              ctx.arc(gx, gy, 22, 0, Math.PI * (1.2 + (g % 3) * 0.3));
              ctx.moveTo(gx - 14, gy); ctx.lineTo(gx + 14, gy - 14);
              ctx.stroke();
              drawWaxSeal(ctx, S, gx + 38, gy + 12, 13, "#d42a1e", "check", 0);
            }
            S.drawMailSnail(ctx, st.bx + 420, st.by + 258, 1.24, t, { flip: true, postcard: true, hasAlienStamp: true });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = clamp(resolved.outcomeU, 0, 1);
            var st = drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B);
            var dropH = 268 * easeOutBack(clamp(u * 1.8, 0.15, 1));

            // Pull-down canvas roller map showing cross-section blueprint of Turkey Sub!
            S.drawCutoutPaperEdge(ctx, [
              [st.bx + 44, st.by + 18], [st.bx + st.bw - 44, st.by + 18],
              [st.bx + st.bw - 44, st.by + 18 + dropH], [st.bx + 44, st.by + 18 + dropH]
            ], "#f5efe1", "#14110d", { paperRim: 3.0 });

            if (dropH > 120) {
              var cx = st.bx + st.bw * 0.5, cy = st.by + 152;
              ctx.strokeStyle = "#1d596e"; ctx.lineWidth = 3.2;
              ctx.beginPath(); ctx.ellipse(cx, cy, 135, 58, 0, 0, TAU); ctx.stroke();
              ctx.strokeRect(cx - 24, cy - 92, 48, 34);
              // Mini portholes & screw propeller on chart
              for (var p = -1; p <= 1; p++) {
                ctx.beginPath(); ctx.arc(cx + p * 48, cy, 14, 0, TAU); ctx.stroke();
              }
            }
            drawBrassScissorTongs(ctx, S, 1100, 560, st.bx + st.bw * 0.5, st.by + 24 + dropH, 0.14);
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 196, turkeyY: 512 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B);
            var hx = 685 + Math.sin(t * 4.8) * 24;
            var hy = 318 + Math.cos(t * 3.8) * 18;
            ctx.strokeStyle = "#fbfaf5"; ctx.lineWidth = 3.2;
            ctx.beginPath(); ctx.moveTo(680, 74); ctx.lineTo(hx, hy - 95); ctx.stroke();

            // Giant Eagle-Hook lure hooked right onto the brass pointer tongs!
            drawBrassScissorTongs(ctx, S, 1100, 560, hx + 18, hy + 52, 0.12);
            S.drawScissorCutout(ctx, plates.portholeImg, 352, 196, 104, 162, hx - 78, hy - 110, 168, 240, EAGLE_HOOK_POLY, {
              haloWidth: 5.0, rot: 0.16 + Math.sin(t * 5) * 0.08, seed: 3.74
            });
            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 988, troutY: 420, snailX0: 250, snailX1: 560, snailY1: 540 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = clamp(resolved.outcomeU, 0, 1);
            drawP03ClassroomBase(ctx, W, H, resolved, plates, S, B, { skipBoard: true });
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 640, saucerY: 96, beamX: 590, beamY: 290, beamSpread: 205 });

            // Revolving 180-deg secret saucer control panel flipping on brass split-pins!
            var spinScale = Math.cos(clamp(u * 1.6, 0, 1) * Math.PI);
            ctx.save();
            ctx.translate(590, 280);
            ctx.scale(Math.max(0.16, Math.abs(spinScale)), 1);
            S.drawCardboardPuppetPiece(ctx, [[-255, -150], [255, -150], [255, 150], [-255, 150]], {
              tone: "#1e1b4b", stroke: "#38bdf8", lineWidth: 3.5, ribs: 2, pins: [[-240, 0], [240, 0]]
            });
            // Blinking fiber-optic saucer console lights
            for (var r = 0; r < 3; r++) {
              for (var c = 0; c < 6; c++) {
                var on = Math.sin(t * 7 + r * 2.1 + c * 1.3) > 0;
                ctx.fillStyle = on ? (c % 2 === 0 ? "#34d399" : "#f43f5e") : "#312e81";
                ctx.beginPath(); ctx.arc(-175 + c * 70, -75 + r * 75, 14, 0, TAU); ctx.fill();
              }
            }
            ctx.restore();
            drawBrassScissorTongs(ctx, S, 1100, 560, 845, 280, 0.2);
          }
        }
      },

      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawPortholeBezelCorners(ctx, W, H, resolved, S);
      }
    });
  }

  /* ==========================================================================
   * PORTHOLE #04 · BELLY — "daumier-litho"
   * Plates: ./portholes/p04.jpg + ./assets/atlas-stills/atlas-39.webp
   * ========================================================================== */
  var TURTLE_POLY = [
    [0.04, 0.62], [0.22, 0.22], [0.50, 0.04],
    [0.78, 0.18], [0.97, 0.48], [0.96, 0.86],
    [0.64, 0.97], [0.32, 0.96], [0.08, 0.84]
  ];

  var KEY_POLY = [
    [0.02, 0.56], [0.68, 0.14], [0.84, 0.04],
    [0.98, 0.28], [0.96, 0.68], [0.76, 0.78],
    [0.66, 0.56], [0.38, 0.74], [0.42, 0.94],
    [0.16, 0.98], [0.12, 0.78], [0.03, 0.74]
  ];

  function drawP04CulvertStage(ctx, W, H, resolved, plates, S, B, opts) {
    var cfg = opts || {};
    var t = resolved.t || 0;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var pxFar = pxShift(0.26, t, 12);
    var pxMid = pxShift(0.5, t, 12);

    // Shadow-rabbit star-stage cutout from atlas-39.webp tucked inside ink band
    var aw = aImg ? aImg.naturalWidth : 740;
    var ah = aImg ? aImg.naturalHeight : 416;
    S.drawScissorCutout(
      ctx, aImg,
      aw * 0.14, ah * 0.04, aw * 0.72, ah * 0.90,
      192 + pxFar, 136, 405, 258,
      [[0.04, 0.06], [0.96, 0.04], [0.95, 0.94], [0.05, 0.95]],
      { filter: "mono", haloWidth: 3.5, alpha: 0.76, seed: 4.05 }
    );

    // Lithograph Stone Culvert Arch cutout from p04.jpg
    S.drawScissorCutout(
      ctx, pImg,
      122, 156, 384, 196,
      308 + pxMid * 0.4, 130, 654, 254,
      [
        [0.02, 0.95], [0.08, 0.44], [0.28, 0.10], [0.50, 0.03],
        [0.72, 0.10], [0.90, 0.42], [0.93, 0.86], [0.78, 0.86],
        [0.70, 0.54], [0.50, 0.44], [0.30, 0.54], [0.20, 0.95]
      ],
      { filter: "litho", haloWidth: 4.8, seed: 4.12 }
    );

    if (!cfg.hideKey) {
      S.drawScissorCutout(
        ctx, pImg,
        226, 395, 232, 98,
        (cfg.keyX != null ? cfg.keyX : 420) + pxMid * 0.5,
        cfg.keyY != null ? cfg.keyY : 420,
        408, 144,
        KEY_POLY,
        { filter: "sepia", haloWidth: 5.0, rot: cfg.keyRot || 0, seed: 4.21 }
      );
    }

    if (!cfg.hideTurtle) {
      var tx = (cfg.turtX != null ? cfg.turtX : 398) + pxMid * 0.45;
      var ty = (cfg.turtY != null ? cfg.turtY : 238) + Math.sin(t * 2.2) * 4;
      S.drawScissorCutout(
        ctx, pImg,
        182, 282, 268, 168,
        tx, ty, 424, 244,
        TURTLE_POLY,
        { filter: "litho", haloWidth: 5.0, rot: cfg.turtRot || 0, seed: 4.25 }
      );
      if (!cfg.hideLeg) {
        var legIK = S.solveIK2(tx + 225, ty + 156, 56, 52, tx + 195, ty + 216, 1);
        drawCardboardLimb(ctx, S, tx + 225, ty + 156, legIK.jx, legIK.jy, 15, 13, "#2a2b2d", null);
        drawCardboardLimb(ctx, S, legIK.jx, legIK.jy, legIK.ex, legIK.ey, 13, 10, "#1d1e20", null);
        S.drawReinigerFiligreeHinge(ctx, tx + 225, ty + 156, 7.0, { metal: "brass" });
        S.drawReinigerFiligreeHinge(ctx, legIK.jx, legIK.jy, 5.6, { metal: "brass" });
      }
    }
  }

  function registerPorthole04(B) {
    B.definePortalGame(4, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        S.drawBolasBackdrop(
          ctx, W, H, resolved.bolasStyle, 4, resolved.t,
          { showCaptions: !resolved.blind, lamp: resolved.lampOn, ballast: resolved.ballastOn },
          { bandTop: 118, bandBot: 572 }
        );
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawP04CulvertStage(ctx, W, H, resolved, plates, S, B, { keyRot: Math.sin(t * 2.4) * 0.03 });
        // Lithograph brook trout peering from right arch
        S.drawScissorCutout(
          ctx, plates.portholeImg,
          434, 262, 98, 76,
          894, 284 + Math.sin(t * 2.8) * 7, 176, 130,
          [[0.03, 0.42], [0.45, 0.06], [0.96, 0.06], [0.96, 0.92], [0.35, 0.90]],
          { filter: "litho", haloWidth: 4.2, seed: 4.29 }
        );
        S.drawTurkeyInCorner(ctx, 148, 504, 0.98, t, { dispatch: 0.08 });
        drawRootAnchorLandmarks(ctx, resolved, S, B);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = clamp(resolved.stemU, 0, 1);
          drawP04CulvertStage(ctx, W, H, resolved, plates, S, B);
          B.drawVolumetricBeam(ctx, 160, 520, 488, 492, {
            color: "#fef08a", coreColor: "#ffffff", spread: 135, intensity: 0.55 + 0.95 * u, t: t
          });
          B.drawLanternHalo(ctx, 488, 492, 95 * u + 20, { color: "#fde047", intensity: 1.1, t: t });
          // Dramatic Reiniger shadow lace arches cast behind turtle!
          ctx.save();
          ctx.globalAlpha = 0.65 * u;
          for (var i = 0; i < 7; i++) {
            var a = -Math.PI + (i / 6) * Math.PI;
            S.drawReinigerFiligreeHinge(ctx, 610 + Math.cos(a) * 195, 345 + Math.sin(a) * 145, 9.5, { metal: "brass" });
          }
          ctx.restore();
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = clamp(resolved.stemU, 0, 1);
          var rock = Math.sin(t * 5.2) * 0.16 * u;
          drawP04CulvertStage(ctx, W, H, resolved, plates, S, B, {
            turtY: 222 - 22 * u + Math.sin(t * 4.5) * 10,
            turtRot: rock
          });
          drawCutBubbleCluster(ctx, 610, 540, 18, 340, 320, t * 1.5, 402, "rgba(251, 250, 247, 0.92)");
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = smooth(0, 1, resolved.stemU);
          drawP04CulvertStage(ctx, W, H, resolved, plates, S, B);
          var sx0 = 960, sy0 = 515;
          var sx1 = 835, sy1 = 398;
          B.drawSnailSilverTrail(ctx, sx0, sy0, sx1, sy1, u, t, { arc: 16 });
          var cx = lerp(sx0, sx1, u), cy = lerp(sy0, sy1, u);
          S.drawMailSnail(ctx, cx, cy, 1.24, t, { flip: true, postcard: true });
          // Crisp scalloped green lettuce postal seal held out to turtle beak!
          drawWaxSeal(ctx, S, cx - 42, cy - 18, 18, "#16a34a", "star", t * 0.8);
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = clamp(resolved.stemU, 0, 1);
          var pull = smooth(0.15, 0.7, u) * 28;
          drawP04CulvertStage(ctx, W, H, resolved, plates, S, B, { keyX: 420 + pull });
          drawBrassScissorTongs(ctx, S, 1110, 555, 818 + pull, 456, 0.12);
          if (u > 0.4) {
            B.drawDeterministicParticles(ctx, "brass_sparks", 815 + pull, 456, (t % 0.85), { count: 12, seed: 44.4 });
          }
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP04CulvertStage(ctx, W, H, resolved, plates, S, B, { hideKey: true, hideTurtle: true });
            var subX = 636 + Math.sin(t * 1.6) * 26;
            var subY = 352 + Math.cos(t * 2.1) * 7;

            // Key spinning at stern as screw propeller!
            S.drawScissorCutout(ctx, plates.portholeImg, 226, 395, 232, 98, subX - 315, subY - 18, 210, 82, KEY_POLY, {
              filter: "sepia", haloWidth: 4.0, rot: 0.25 + Math.sin(t * 18) * 0.28, seed: 4.41
            });
            // Hinged Reiniger periscope & riveted ironclad portholes on turtle carapace!
            S.drawCutoutPaperEdge(ctx, [[subX - 24, subY - 82], [subX - 18, subY - 168], [subX + 46, subY - 168], [subX + 46, subY - 144], [subX + 8, subY - 144], [subX + 14, subY - 82]], "#26282b", "#fbfaf5", { paperRim: 3.5 });
            S.drawScissorCutout(ctx, plates.portholeImg, 182, 282, 268, 168, subX - 196, subY - 108, 416, 236, TURTLE_POLY, {
              filter: "litho", haloWidth: 5.0, seed: 4.45
            });
            for (var w = -1; w <= 1; w++) {
              ctx.fillStyle = "#fae090"; ctx.strokeStyle = "#14110d"; ctx.lineWidth = 3.5;
              ctx.beginPath(); ctx.arc(subX - 20 + w * 62, subY - 8, 16, 0, TAU); ctx.fill(); ctx.stroke();
            }
            B.drawVolumetricBeam(ctx, subX + 205, subY - 4, 1180, subY, { color: "#fde68a", spread: 105, intensity: 0.85, t: t });
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 148, turkeyY: 504 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP04CulvertStage(ctx, W, H, resolved, plates, S, B, { keyRot: -0.22 });
            // Beam bouncing off brass key straight onto a glowing arched keyhole on the masonry pier!
            B.drawVolumetricBeam(ctx, 160, 520, 625, 468, { color: "#fde68a", spread: 68, intensity: 0.95, t: t });
            B.drawVolumetricBeam(ctx, 625, 468, 912, 248, { color: "#fbbf24", coreColor: "#ffffff", spread: 92, intensity: 1.15, t: t });

            // Glowing golden bridge lock keyhole plate on stone pier
            ctx.save();
            ctx.translate(912, 248);
            B.drawLanternHalo(ctx, 0, 0, 88, { color: "#facc15", intensity: 1.0, t: t });
            S.drawCutoutPaperEdge(ctx, [[-34, -48], [34, -48], [34, 48], [-34, 48]], "#d4a44c", "#14110d", { paperRim: 3.0 });
            ctx.fillStyle = "#0b0c0e";
            ctx.beginPath(); ctx.arc(0, -12, 13, 0, TAU); ctx.fill();
            ctx.fillRect(-7, -12, 14, 34);
            ctx.restore();

            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 1020, troutY: 365, snailX0: 250, snailX1: 830, snailY1: 528 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP04CulvertStage(ctx, W, H, resolved, plates, S, B, { hideKey: true, hideTurtle: true });
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 640, saucerY: 94, beamX: 640, beamY: 345, beamSpread: 200 });

            // Concentric celestial gold filigree astrolabe lock-rings spinning around vertical ignition key!
            ctx.save();
            ctx.translate(640, 345);
            ctx.rotate(t * 0.75);
            S.drawCutoutPaperEdge(ctx, circlePoly(16, 128, 128, 0, 0, 2, 44), "#1b242c", "#fbfaf5", { paperRim: 4.5 });
            ctx.strokeStyle = "#facc15"; ctx.lineWidth = 3.5; ctx.setLineDash([12, 8]);
            ctx.beginPath(); ctx.arc(0, 0, 96, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
            for (var g = 0; g < 8; g++) {
              var ga = (g / 8) * TAU;
              S.drawReinigerFiligreeHinge(ctx, Math.cos(ga) * 96, Math.sin(ga) * 96, 6.4, { metal: "brass" });
            }
            ctx.restore();

            B.drawVolumetricBeam(ctx, 640, 345, 640, 96, { color: "#38bdf8", coreColor: "#ffffff", spread: 85, intensity: 1.2, t: t });
            S.drawScissorCutout(ctx, plates.portholeImg, 226, 395, 232, 98, 460, 282, 360, 128, KEY_POLY, {
              filter: "sepia", haloWidth: 5.0, rot: -Math.PI * 0.5 + Math.sin(t * 2.5) * 0.14, pivotX: 640, pivotY: 345, seed: 4.88
            });
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = clamp(resolved.outcomeU, 0, 1);
            drawP04CulvertStage(ctx, W, H, resolved, plates, S, B, { hideTurtle: true });
            // Shell-tucked armored boulder rolling across the ink band!
            var rx = lerp(480, 880, (u * 1.1) % 1);
            var ry = 382 - Math.abs(Math.sin(t * 6.5)) * 18;
            ctx.save();
            ctx.translate(rx, ry);
            ctx.rotate(t * 4.8);
            S.drawCutoutPaperEdge(ctx, circlePoly(14, 118, 98, 0, 0, 4, 45), "#374151", "#fbfaf5", { paperRim: 4.5 });
            S.drawEngravingCrosshatch(ctx, 160, 130, 0.35, 7, { x: -80, y: -65, color: "#fbfaf5" });
            ctx.restore();
            drawCutBubbleCluster(ctx, rx - 90, 480, 12, 180, 210, t * 1.5, 451, "rgba(251,250,247,0.88)");
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 152, turkeyY: 504 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP04CulvertStage(ctx, W, H, resolved, plates, S, B, { hideKey: true, turtX: 430, turtY: 288 });
            // 2-bone IK turtle hind leg flipping antique key onto shell ridges for a blissful back-scratch!
            var shift = Math.sin(t * 8.4) * 34;
            var gx = 450 + shift * 0.5, gy = 296;
            var ik = S.solveIK2(465, 435, 92, 88, gx, gy, -1);
            drawJointedIKLimb(ctx, S, ik, 14, 11, "#2a2b2d", "#3f4145", "brass");
            S.drawScissorCutout(ctx, plates.portholeImg, 226, 395, 232, 98, gx - 20, gy - 84, 336, 124, KEY_POLY, {
              filter: "sepia", haloWidth: 4.5, rot: -0.16 + Math.sin(t * 8.4) * 0.06, pivotX: gx, pivotY: gy, seed: 4.66
            });
            // White litho comfort-sparks above shell
            ctx.strokeStyle = "#fbfaf5"; ctx.lineWidth = 3.0;
            for (var s = 0; s < 4; s++) {
              var sx = 590 + shift + (s - 1.5) * 30;
              ctx.beginPath(); ctx.moveTo(sx, 255); ctx.lineTo(sx + (s - 1.5) * 10, 232); ctx.stroke();
            }
            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 990, troutY: 365, snailX0: 225, snailX1: 815, snailY1: 536 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP04CulvertStage(ctx, W, H, resolved, plates, S, B, { hideTurtle: true });
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 780, saucerY: 112, beamX: 780, beamY: 420, beamSpread: 165 });

            // Hovering saucer-shell space turtle with glowing emerald rim-lights ascending beside UFO!
            var hx = 475 + Math.sin(t * 2.5) * 20;
            var hy = 225 + Math.cos(t * 3.1) * 14;
            S.drawScissorCutout(ctx, plates.portholeImg, 182, 282, 268, 168, hx - 165, hy - 92, 330, 188, TURTLE_POLY, {
              filter: "cyan", haloWidth: 4.8, rot: Math.sin(t * 4) * 0.08, seed: 4.69
            });
            for (var l = -3; l <= 3; l++) {
              ctx.fillStyle = l % 2 === 0 ? "#34d399" : "#facc15";
              ctx.beginPath(); ctx.arc(hx + l * 38, hy + 28, 8, 0, TAU); ctx.fill();
            }
            B.drawTractorRings(ctx, hx, hy + 42, hx, 520, t, { spread: 110, rings: 4 });
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = clamp(resolved.outcomeU, 0, 1);
            drawP04CulvertStage(ctx, W, H, resolved, plates, S, B, {
              keyX: lerp(420, 320, u), keyY: lerp(420, 472, u)
            });
            // Lock-keeper peaked cap on turtle + signed wax receipt tucked under shell!
            S.drawCutoutPaperEdge(ctx, [[685, 305], [755, 292], [768, 318], [680, 324]], "#1d596e", "#fbfaf5", { paperRim: 2.5 });
            drawVectorSlip(ctx, S, 760, 428, 68, 52, 0.12, { bandColor: "#0f8f80", sealColor: "#d42a1e", glyph: "check" });
            S.drawMailSnail(ctx, 858, 466, 1.22, t, { flip: true, postcard: false });
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 152, turkeyY: 504 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = clamp(resolved.outcomeU, 0, 1);
            var creep = u * 36;
            drawP04CulvertStage(ctx, W, H, resolved, plates, S, B, { turtX: 340 + creep, keyX: 360 });
            // Checkered start line + Brook Trout dropping checkered handkerchief for slowest creek race!
            for (var sq = 0; sq < 8; sq++) {
              ctx.fillStyle = sq % 2 === 0 ? "#fbfaf5" : "#14110d";
              ctx.fillRect(795, 380 + sq * 20, 18, 20);
            }
            S.drawMailSnail(ctx, 725 + creep, 512, 1.32, t, { postcard: true, hasReply: true });
            // Checkered flag held by Brook Trout
            drawVectorSlip(ctx, S, 912, 342 + Math.sin(t * 6) * 12, 46, 36, -0.25, { bandColor: "#14110d", rows: 2 });
            drawOutcomeWitnesses(ctx, resolved, S, B, { skipDefaultSnail: true, troutX: 995, troutY: 365 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP04CulvertStage(ctx, W, H, resolved, plates, S, B, { hideKey: true, turtX: 330 });
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 640, saucerY: 96, beamX: 735, beamY: 430, beamSpread: 185 });

            // Brass key inserted upright into Mail Snail's spiral shell — frozen bubbles in cyan stasis rings!
            var sx = 735, sy = 455;
            S.drawScissorCutout(ctx, plates.portholeImg, 226, 395, 232, 98, sx - 125, sy - 155, 240, 90, KEY_POLY, {
              filter: "sepia", haloWidth: 4.2, rot: -Math.PI * 0.5, pivotX: sx - 5, pivotY: sy - 110, seed: 4.79
            });
            S.drawMailSnail(ctx, sx, sy, 1.42, 0, { postcard: true, hasAlienStamp: true });

            var frozen = [[380, 220], [510, 195], [860, 235], [935, 320], [565, 310]];
            for (var f = 0; f < frozen.length; f++) {
              ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 2.4;
              ctx.beginPath(); ctx.arc(frozen[f][0], frozen[f][1], 24, 0, TAU); ctx.stroke();
              ctx.fillStyle = "#e0f2fe";
              ctx.beginPath(); ctx.arc(frozen[f][0], frozen[f][1], 11, 0, TAU); ctx.fill();
            }
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var rattle = Math.sin(t * 26) * 4;
            drawP04CulvertStage(ctx, W, H, resolved, plates, S, B, { turtX: 412 + rattle });
            // Snapping turtle jaw chomps & bends the brass tongs with bright white sparks!
            drawBrassScissorTongs(ctx, S, 1110, 555, 782 + rattle, 368, 0.04, { bentTip: 0.42 });
            B.drawDeterministicParticles(ctx, "brass_sparks", 782, 368, (t * 1.5) % 0.75, { count: 18, seed: 48.1 });
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 150, turkeyY: 504 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var scoot = (t * 65) % 180;
            var tx = 360 + scoot;
            drawP04CulvertStage(ctx, W, H, resolved, plates, S, B, { hideKey: true, hideLeg: true, turtX: tx, turtY: 256 });

            // Brass key slotted upright on top of turtle shell as a wind-up toy key!
            S.drawScissorCutout(ctx, plates.portholeImg, 226, 395, 232, 98, tx + 65, 168, 225, 86, KEY_POLY, {
              filter: "sepia", haloWidth: 4.2, rot: -Math.PI * 0.5 + Math.sin(t * 9) * 0.22, pivotX: tx + 178, pivotY: 210, seed: 4.84
            });
            drawBrassScissorTongs(ctx, S, 1100, 540, tx + 185, 165, 0.16);
            // Rapidly paddling split-pin clockwork feet!
            for (var l = 0; l < 3; l++) {
              var pad = Math.sin(t * 16 + l * 2.1) * 26;
              drawCardboardLimb(ctx, S, tx + 95 + l * 95, 435, tx + 95 + l * 95 + pad, 498, 13, 10, "#2a2b2d", "brass");
            }
            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 995, troutY: 365, snailX0: 215, snailX1: 420, snailY1: 538 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = clamp(resolved.outcomeU, 0, 1);
            drawP04CulvertStage(ctx, W, H, resolved, plates, S, B, { turtX: 250, hideKey: true });
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 680, saucerY: 96, beamX: 680, beamY: 485, beamSpread: 195 });

            // Hinged lithograph riverbed vault trapdoor swinging open to reveal deep starfield!
            var openW = 340 * smooth(0.05, 0.65, u);
            ctx.save();
            ctx.fillStyle = "#090d1f";
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 3.5;
            ctx.fillRect(680 - openW * 0.5, 435, openW, 128);
            ctx.strokeRect(680 - openW * 0.5, 435, openW, 128);
            for (var st = 0; st < 12; st++) {
              var sx = 680 - openW * 0.44 + ((st * 53) % Math.max(20, openW * 0.88));
              var sy = 450 + ((st * 29) % 98);
              ctx.fillStyle = st % 2 === 0 ? "#fde047" : "#ffffff";
              ctx.beginPath(); ctx.arc(sx, sy, 2.8, 0, TAU); ctx.fill();
            }
            ctx.restore();

            S.drawScissorCutout(ctx, plates.portholeImg, 226, 395, 232, 98, 560, 365, 235, 88, KEY_POLY, {
              filter: "sepia", haloWidth: 4.2, rot: Math.PI * 0.5, pivotX: 678, pivotY: 410, seed: 4.92
            });
            drawBrassScissorTongs(ctx, S, 1100, 555, 680, 380, 0.14);
          }
        }
      },

      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawPortholeBezelCorners(ctx, W, H, resolved, S);
      }
    });
  }

  /* ==========================================================================
   * PORTHOLE #05 · SCOPE — "duchamp-optic"
   * Plates: ./portholes/p05.jpg + ./assets/atlas-stills/atlas-53.webp
   * ========================================================================== */
  var TIN_POLY = circlePoly(18, 0.46, 0.46, 0.5, 0.5, 0.012, 5.5);

  function drawDuchampRotorRings(ctx, cx, cy, rad, rot, accentCol) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    for (var i = 0; i < 6; i++) {
      var r = rad * (1 - i * 0.13);
      var ecc = i * 4.2;
      ctx.strokeStyle = i % 2 === 0 ? "rgba(251,250,245,0.24)" : accentCol;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(ecc, 0, Math.max(8, r), 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B, opts) {
    var cfg = opts || {};
    var t = resolved.t || 0;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var waterY = (cfg.waterY != null ? cfg.waterY : 342) + Math.sin(t * 1.5) * 5;

    drawDuchampRotorRings(ctx, 640, 304, 248, t * (cfg.rotorSpeed || 0.55), cfg.rotorColor || "rgba(15, 143, 128, 0.24)");

    // Autumn maple leaves (top-left) + atlas-53 canoe reflection (top-right)
    S.drawScissorCutout(
      ctx, pImg,
      136, 108, 196, 148,
      128, 52, 292, 202,
      [[0.05, 0.22], [0.44, 0.03], [0.95, 0.08], [0.92, 0.78], [0.46, 0.96], [0.06, 0.84]],
      { haloWidth: 4.5, rot: Math.sin(t * 2.2) * 0.05, seed: 5.08 }
    );
    var aw = aImg ? aImg.naturalWidth : 382;
    var ah = aImg ? aImg.naturalHeight : 680;
    S.drawScissorCutout(
      ctx, aImg,
      aw * 0.04, ah * 0.20, aw * 0.92, ah * 0.72,
      872, 72, 252, 268,
      [[0.05, 0.05], [0.95, 0.05], [0.95, 0.95], [0.05, 0.95]],
      { filter: "cyan", haloWidth: 3.8, alpha: 0.78, seed: 5.12 }
    );

    if (!cfg.noWater) {
      ctx.save();
      ctx.fillStyle = "rgba(15, 96, 92, 0.44)";
      ctx.fillRect(-20, waterY, W + 40, 648 - waterY);
      ctx.restore();
      B.drawWaterCaustics(ctx, W, H, t, { topY: waterY + 12, intensity: 0.22, color: "#5eead4" });
    }

    if (!cfg.hidePaws) {
      var scrub = Math.sin(t * 6.8) * (cfg.scrubAmp != null ? cfg.scrubAmp : 16);
      S.drawScissorCutout(
        ctx, pImg,
        290, 108, 118, 136,
        494 + scrub * 0.4, 52, 184, 206,
        [[0.28, 0.03], [0.94, 0.05], [0.86, 0.62], [0.46, 0.97], [0.05, 0.88], [0.16, 0.45]],
        { haloWidth: 4.5, rot: Math.sin(t * 5.2) * 0.07, pin: { x: 585, y: 82, r: 4.8, metal: "brass" }, seed: 5.24 }
      );
      S.drawScissorCutout(
        ctx, pImg,
        368, 142, 134, 164,
        668 - scrub * 0.5, 86, 206, 236,
        [[0.36, 0.03], [0.96, 0.22], [0.74, 0.68], [0.28, 0.97], [0.03, 0.82], [0.18, 0.42]],
        { haloWidth: 4.5, rot: -Math.sin(t * 5.2) * 0.08, pin: { x: 785, y: 122, r: 4.8, metal: "brass" }, seed: 5.26 }
      );
    }

    return waterY;
  }

  function drawWaterlineRibbon(ctx, W, waterY, t) {
    ctx.save();
    ctx.strokeStyle = "#fbfaf5";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    for (var x = -10; x <= W + 10; x += 24) {
      var y = waterY + Math.sin(x * 0.018 + t * 3.2) * 6;
      if (x === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function registerPorthole05(B) {
    B.definePortalGame(5, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        S.drawBolasBackdrop(
          ctx, W, H, resolved.bolasStyle, 5, resolved.t,
          { showCaptions: !resolved.blind, lamp: resolved.lampOn, ballast: resolved.ballastOn },
          {}
        );
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var pImg = plates.portholeImg;
        var waterY = drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B);
        S.drawScissorCutout(ctx, pImg, 225, 209, 198, 198, 508, waterY - 128 + Math.sin(t * 2.8) * 8, 268, 268, TIN_POLY, {
          haloWidth: 5.2, rot: Math.sin(t * 3.8) * 0.38, seed: 5.21
        });
        S.drawScissorCutout(ctx, pImg, 290, 395, 200, 112, 544 + Math.sin(t * 2.2) * 18, 442, 294, 160,
          [[0.03, 0.48], [0.34, 0.08], [0.68, 0.05], [0.97, 0.14], [0.96, 0.86], [0.32, 0.95]],
          { haloWidth: 4.5, seed: 5.29 }
        );
        drawWaterlineRibbon(ctx, W, waterY, t);
        S.drawTurkeyInCorner(ctx, 148, 510, 0.98, t, { dispatch: 0.06 });
        drawRootAnchorLandmarks(ctx, resolved, S, B);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = clamp(resolved.stemU, 0, 1);
          var waterY = drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B);
          S.drawScissorCutout(ctx, plates.portholeImg, 225, 209, 198, 198, 508, waterY - 128, 268, 268, TIN_POLY, {
            haloWidth: 5.2, rot: -0.25, seed: 5.22
          });
          // Incoming submarine beam + dazzling bounced silver sun-dog reflection!
          B.drawVolumetricBeam(ctx, 180, 560, 642, waterY, { color: "#93c5fd", spread: 95, intensity: 0.9, t: t });
          B.drawVolumetricBeam(ctx, 642, waterY, 980, 120, { color: "#fef08a", coreColor: "#ffffff", spread: 165 * u + 20, intensity: 1.2 * u, t: t });
          B.drawLanternHalo(ctx, 642, waterY, 110 * u + 20, { color: "#ffffff", intensity: 1.0, t: t });
          drawWaterlineRibbon(ctx, W, waterY, t);
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = easeOutBack(resolved.stemU);
          var waterY = drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B);
          S.drawScissorCutout(ctx, plates.portholeImg, 225, 209, 198, 198, 508, waterY - 128, 268, 268, TIN_POLY, {
            haloWidth: 5.2, rot: t * 2.2, seed: 5.23
          });
          // Towering white cut-paper soap suds domes frothing around raccoon wrists!
          for (var m = -3; m <= 3; m++) {
            var r = (28 + (3 - Math.abs(m)) * 14) * clamp(u, 0.2, 1.15);
            S.drawCutoutPaperEdge(ctx, circlePoly(12, r, r * 0.85, 642 + m * 56, waterY - 18 - Math.abs(Math.sin(t * 4 + m)) * 16, 2, m + 50), "#fbfaf5", "#14110d", { paperRim: 2.0 });
          }
          drawCutBubbleCluster(ctx, 642, waterY + 90, 20, 380, 260, t * 1.6, 502, "rgba(240, 253, 250, 0.94)");
          drawWaterlineRibbon(ctx, W, waterY, t);
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = smooth(0, 1, resolved.stemU);
          var waterY = drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B);
          S.drawScissorCutout(ctx, plates.portholeImg, 225, 209, 198, 198, 548, waterY - 128, 252, 252, TIN_POLY, {
            haloWidth: 5.0, rot: 0.15, seed: 5.25
          });
          // Mail Snail breaching split waterline on a bobbing cork float!
          var sy = lerp(520, waterY - 14, u) + Math.sin(t * 4.2) * 6;
          var sx = 412;
          B.drawSnailSilverTrail(ctx, 260, 540, sx, sy, u, t, { arc: 20 });
          S.drawCardboardPuppetPiece(ctx, [[sx - 44, sy + 12], [sx + 44, sy + 12], [sx + 34, sy + 36], [sx - 34, sy + 36]], {
            tone: "#c2935b", ribs: 2
          });
          S.drawMailSnail(ctx, sx, sy, 1.24, t, { postcard: true });
          drawWaterlineRibbon(ctx, W, waterY, t);
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = clamp(resolved.stemU, 0, 1);
          var waterY = drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B);
          var wob = u > 0.3 ? Math.sin(t * 24) * 0.14 : 0;
          S.drawScissorCutout(ctx, plates.portholeImg, 225, 209, 198, 198, 508, waterY - 128, 268, 268, TIN_POLY, {
            haloWidth: 5.2, rot: wob, seed: 5.27
          });
          drawBrassScissorTongs(ctx, S, 1100, 555, lerp(960, 772, smooth(0.1, 0.5, u)), lerp(510, waterY + 12, smooth(0.1, 0.5, u)), 0.16);
          if (u > 0.35) {
            for (var g = 0; g < 3; g++) {
              var rad = 135 + ((t * 140 + g * 45) % 140);
              ctx.strokeStyle = "rgba(226, 232, 240, 0.55)"; ctx.lineWidth = 2.4;
              ctx.beginPath(); ctx.arc(642, waterY + 6, rad, 0, TAU); ctx.stroke();
            }
          }
          drawWaterlineRibbon(ctx, W, waterY, t);
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var waterY = drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B, { hidePaws: true, waterY: 430 });
            B.drawVolumetricBeam(ctx, 180, 560, 495, 265, { color: "#fde68a", spread: 210, intensity: 0.95, t: t });

            // Parked red jalopy fender missing hubcap + masked Raccoon Bandit running off with spinning hubcap!
            S.drawCutoutPaperEdge(ctx, [[650, 315], [680, 195], [945, 188], [975, 315]], "#7d3228", "#fbfaf5", { paperRim: 4.0 });
            S.drawCutoutPaperEdge(ctx, circlePoly(16, 86, 86, 805, 312, 1, 51), "#1b1c1e", "#fbfaf5", { paperRim: 3.5 });

            var rx = 465 + Math.sin(t * 3.2) * 28, ry = 292 - Math.abs(Math.sin(t * 8)) * 12;
            // 3-segment striped Willett tail
            for (var ts = 0; ts < 3; ts++) {
              var tw = Math.sin(t * 6 + ts) * 12;
              S.drawCardboardPuppetPiece(ctx, [[rx + 42 + ts * 26, ry + 26 + tw], [rx + 70 + ts * 26, ry + 22 + tw], [rx + 70 + ts * 26, ry + 46 + tw], [rx + 42 + ts * 26, ry + 48 + tw]], {
                tone: ts % 2 === 0 ? "#363533" : "#cbd5e1", ribs: 1
              });
            }
            S.drawCardboardPuppetPiece(ctx, [[rx - 40, ry + 60], [rx - 34, ry - 34], [rx + 34, ry - 30], [rx + 42, ry + 60]], { tone: "#7d7972", ribs: 2 });
            S.drawCardboardPuppetPiece(ctx, [[rx - 34, ry - 32], [rx - 28, ry - 80], [rx + 28, ry - 78], [rx + 32, ry - 30]], { tone: "#9e9990", ribs: 1 });
            ctx.fillStyle = "#14110d"; ctx.fillRect(rx - 32, ry - 64, 54, 16);
            S.drawScissorCutout(ctx, plates.portholeImg, 225, 209, 198, 198, rx - 142, ry - 52, 140, 140, TIN_POLY, {
              haloWidth: 4.2, rot: -t * 5.8, seed: 5.42
            });
            drawWaterlineRibbon(ctx, W, waterY, t);
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 152, turkeyY: 512 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var waterY = drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B);
            var tilt = -0.35 + Math.sin(t * 6.5) * 0.22;
            S.drawScissorCutout(ctx, plates.portholeImg, 225, 209, 198, 198, 508, waterY - 134, 264, 264, TIN_POLY, {
              haloWidth: 5.2, rot: tilt, seed: 5.45
            });
            // Pulsed Morse-code heliograph golden shafts down to Brook Trout!
            var pulse = 0.45 + 0.55 * Math.abs(Math.sin(t * 7.5));
            B.drawVolumetricBeam(ctx, 640, waterY - 10, 885, 468, {
              color: "#fde047", coreColor: "#ffffff", spread: 135, intensity: 1.25 * pulse, t: t
            });
            drawWaterlineRibbon(ctx, W, waterY, t);
            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 925, troutY: 468, snailX0: 225, snailX1: 680, snailY1: 545 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B, { hidePaws: true, noWater: true, rotorSpeed: -2.2, rotorColor: "rgba(212, 42, 30, 0.5)" });
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 640, saucerY: 94, beamX: 648, beamY: 344, beamSpread: 205 });

            // Masked Raccoon in glass space-bubble helmet buffing spinning chrome UFO hull!
            var ufoX = 648, ufoY = 348 + Math.sin(t * 2.6) * 8;
            S.drawScissorCutout(ctx, plates.portholeImg, 225, 209, 198, 198, ufoX - 134, ufoY - 134, 268, 268, TIN_POLY, {
              filter: "cyan", haloWidth: 5.2, rot: t * 4.2, seed: 5.88
            });
            ctx.fillStyle = "rgba(212, 246, 240, 0.72)"; ctx.strokeStyle = "#14110d"; ctx.lineWidth = 2.8;
            ctx.beginPath(); ctx.arc(ufoX, ufoY, 52, 0, TAU); ctx.fill(); ctx.stroke();

            var px = 304, py = 336;
            S.drawCardboardPuppetPiece(ctx, [[px - 44, py + 92], [px - 38, py - 28], [px + 38, py - 28], [px + 48, py + 92]], { tone: "#807c76", ribs: 2 });
            S.drawCardboardPuppetPiece(ctx, [[px - 34, py - 28], [px - 28, py - 82], [px + 28, py - 82], [px + 34, py - 28]], { tone: "#a29d94", ribs: 1 });
            ctx.fillStyle = "#14110d"; ctx.fillRect(px - 28, py - 66, 56, 16);
            ctx.fillStyle = "rgba(205, 242, 240, 0.34)"; ctx.strokeStyle = "#fbfaf5"; ctx.lineWidth = 3.2;
            ctx.beginPath(); ctx.arc(px, py - 56, 54, 0, TAU); ctx.fill(); ctx.stroke();

            var bx = ufoX - 118, by = ufoY + Math.sin(t * 12) * 58;
            var ik = S.solveIK2(px + 36, py, 98, 96, bx, by, -1);
            drawJointedIKLimb(ctx, S, ik, 12, 10, "#6e6a64", "#4c4945", "silver");
            S.drawCutoutPaperEdge(ctx, [[bx - 22, by - 16], [bx + 22, by - 18], [bx + 24, by + 18], [bx - 20, by + 20]], "#fae090", "#14110d", { paperRim: 2.2, shadow: false });
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var waterY = drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B);
            // Mountains of white torn-paper dishwasher foam + tumbling plates & forks!
            for (var layer = 0; layer < 3; layer++) {
              for (var c = 0; c < 6; c++) {
                var fx = 240 + c * 155 + (layer % 2) * 45;
                var fy = waterY - 65 + layer * 48 + Math.sin(t * 3.5 + c + layer) * 10;
                S.drawCutoutPaperEdge(ctx, circlePoly(12, 68, 48, fx, fy, 3, layer * 10 + c), "#fbfaf5", "#14110d", { paperRim: 2.0 });
              }
            }
            for (var d = 0; d < 4; d++) {
              var dy = waterY + 35 + ((t * 85 + d * 65) % 190);
              var dx = 380 + d * 165 + Math.sin(t * 3 + d) * 20;
              S.drawCutoutPaperEdge(ctx, circlePoly(12, 32, 14, dx, dy, 1, d + 80), "#e2e8f0", "#14110d", { paperRim: 2.2 });
            }
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 152, turkeyY: 512 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var waterY = drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B, { hidePaws: true });
            // Floating crimped pie-tin coracle boat steered underneath by Brook Trout & Mail Snail!
            var bobY = waterY - 34 + Math.sin(t * 3.2) * 10;
            ctx.save();
            ctx.translate(618, bobY);
            ctx.rotate(Math.sin(t * 2.4) * 0.07);
            S.drawScissorCutout(ctx, plates.portholeImg, 225, 209, 198, 198, -152, -42, 304, 102, TIN_POLY, { haloWidth: 4.5, shadow: false, seed: 5.61 });
            S.drawCutoutPaperEdge(ctx, [[-162, 4], [162, 4], [122, 54], [-122, 54]], "#aeb6bc", "#14110d", { paperRim: 3.2 });
            S.drawMailSnail(ctx, 0, -14, 1.24, t, { postcard: true, hasReply: true });
            ctx.restore();
            drawWaterlineRibbon(ctx, W, waterY, t);
            drawOutcomeWitnesses(ctx, resolved, S, B, { skipDefaultSnail: true, troutX: 628 + Math.sin(t * 2.2) * 28, troutY: bobY + 132 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B, { hidePaws: true, noWater: true, rotorSpeed: 3.6, rotorColor: "rgba(168, 85, 247, 0.55)" });
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 640, saucerY: 94, beamX: 640, beamY: 356, beamSpread: 215 });

            // Centrifugal spiral Milky Way of white suds whirling around gleaming tin core!
            var cx = 640, cy = 356;
            for (var arm = 0; arm < 28; arm++) {
              var u = arm / 28;
              var ang = t * 2.8 + u * TAU * 2.2;
              var rad = 45 + u * 215;
              var sx = cx + Math.cos(ang) * rad;
              var sy = cy + Math.sin(ang) * rad * 0.56;
              ctx.fillStyle = arm % 3 === 0 ? "#c084fc" : "#fbfaf5";
              ctx.beginPath(); ctx.arc(sx, sy, 6 + (1 - u) * 10, 0, TAU); ctx.fill();
            }
            S.drawScissorCutout(ctx, plates.portholeImg, 225, 209, 198, 198, cx - 84, cy - 84, 168, 168, TIN_POLY, {
              filter: "cyan", haloWidth: 4.5, rot: t * 5.0, seed: 5.68
            });
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var waterY = drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B, { scrubAmp: 26 });
            // Twig clothesline above water with scrubbed-blank wet envelope clipped up to dry!
            ctx.strokeStyle = "#d6d3d1"; ctx.lineWidth = 3.0;
            ctx.beginPath(); ctx.moveTo(290, 165); ctx.quadraticCurveTo(455, 195, 610, 155); ctx.stroke();
            drawVectorSlip(ctx, S, 448, 212 + Math.sin(t * 3.5) * 4, 88, 62, 0.08 * Math.sin(t * 3), { paper: "#f8fafc", rows: 2 });
            // Dripping water droplets under washed postcard
            drawCutBubbleCluster(ctx, 448, 285, 6, 60, 45, -t * 1.2, 571, "rgba(186, 230, 253, 0.9)");
            S.drawMailSnail(ctx, 355, waterY - 12, 1.18, t, { postcard: false });
            drawWaterlineRibbon(ctx, W, waterY, t);
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 152, turkeyY: 510 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var waterY = drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B, { scrubAmp: 4 });
            var py = waterY - 18 + Math.sin(t * 2.8) * 7;
            S.drawScissorCutout(ctx, plates.portholeImg, 225, 209, 198, 198, 505, py - 46, 276, 110, TIN_POLY, { haloWidth: 4.8, seed: 5.75 });
            // Purple cross-hatched lattice berry pie slice on the floating tin pan!
            S.drawCutoutPaperEdge(ctx, [[585, py - 8], [695, py - 48], [718, py + 4]], "#7e22ce", "#14110d", { paperRim: 2.5 });
            S.drawCutoutPaperEdge(ctx, [[688, py - 52], [726, py + 6], [708, py + 14], [674, py - 44]], "#eab308", "#14110d", { paperRim: 2.0, shadow: false });
            drawWaterlineRibbon(ctx, W, waterY, t);
            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 935, troutY: 458, snailX0: 240, snailX1: 525, snailY1: waterY + 26 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var waterY = drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B, { hidePaws: true });
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 640, saucerY: 94, beamX: 640, beamY: 465, beamSpread: 185 });

            // Stack of 4 gleaming tin hubcaps levitating off Mail Snail's shell into UFO beam!
            for (var h = 0; h < 4; h++) {
              var hy = 365 - h * 54 - ((t * 48) % 54);
              var hx = 640 + Math.sin(t * 3.4 + h) * 16;
              S.drawScissorCutout(ctx, plates.portholeImg, 225, 209, 198, 198, hx - 68, hy - 26, 136, 52, TIN_POLY, {
                filter: "cyan", haloWidth: 3.5, shadow: false, seed: 5.79 + h
              });
            }
            S.drawMailSnail(ctx, 640, 478, 1.32, t, { postcard: true, hasAlienStamp: true });
            drawWaterlineRibbon(ctx, W, waterY, t);
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var waterY = drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B, { scrubAmp: 22 });
            // Raccoon paws hammering porthole bezel rim with brass probe wrench + bright sparks!
            var tap = Math.abs(Math.sin(t * 9.5));
            drawBrassScissorTongs(ctx, S, 765, 225, 1085 + tap * 18, 185, 0.22);
            B.drawDeterministicParticles(ctx, "brass_sparks", 1098, 185, (t * 1.8) % 0.7, { count: 16, seed: 58.1 });
            drawWaterlineRibbon(ctx, W, waterY, t);
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 152, turkeyY: 512 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var waterY = drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B, { hidePaws: true });
            drawBrassScissorTongs(ctx, S, 1110, 540, 920, waterY + 28, 0.26);

            // Tin pie plate skipping across waterline in 3 arcs + Brook Trout breaching in pursuit!
            var su = (t * 0.55) % 1;
            var fx = lerp(880, 260, su);
            var fy = waterY - Math.abs(Math.sin(su * Math.PI * 3)) * 115;
            S.drawScissorCutout(ctx, plates.portholeImg, 225, 209, 198, 198, fx - 78, fy - 28, 156, 56, TIN_POLY, {
              haloWidth: 4.2, rot: -t * 8.0, seed: 5.84
            });
            drawWaterlineRibbon(ctx, W, waterY, t);
            S.drawBrookTrout(ctx, fx + 155, fy + 44, 1.22, t, true, { tilt: -0.35 });
            drawOutcomeWitnesses(ctx, resolved, S, B, { skipDefaultTrout: true, snailX0: 215, snailX1: 520, snailY1: 545 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var waterY = drawP05WaterlineEnv(ctx, W, H, resolved, plates, S, B);
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 640, saucerY: 112, beamX: 640, beamY: waterY, beamSpread: 215 });

            // Vibrating tin gong radiating giant concentric silver-and-crimson Duchamp rings!
            S.drawScissorCutout(ctx, plates.portholeImg, 225, 209, 198, 198, 508 + Math.sin(t * 30) * 5, waterY - 134, 268, 268, TIN_POLY, {
              filter: "cyan", haloWidth: 5.2, seed: 5.91
            });
            for (var r = 0; r < 5; r++) {
              var rad = 95 + ((t * 155 + r * 62) % 310);
              ctx.strokeStyle = r % 2 === 0 ? "rgba(56, 189, 248, 0.65)" : "rgba(244, 63, 94, 0.65)";
              ctx.lineWidth = 3.2;
              ctx.beginPath(); ctx.arc(642, waterY, rad, 0, TAU); ctx.stroke();
            }
            drawBrassScissorTongs(ctx, S, 1100, 555, 780, waterY + 10, 0.18);
          }
        }
      },

      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawPortholeBezelCorners(ctx, W, H, resolved, S);
      }
    });
  }

  /* ==========================================================================
   * PORTHOLE #06 · STERN — "daumier-litho"
   * Plates: ./portholes/p06.jpg + ./assets/atlas-stills/atlas-05.webp
   * BLIND-MODE LAW: Covers painted badge text on p06.jpg with vector Sheriff Star
   * and uses pure tick marks on wooden ruler (0 numbers/text!).
   * ========================================================================== */
  function drawP06SternStage(ctx, W, H, resolved, plates, S, B, opts) {
    var cfg = opts || {};
    var t = resolved.t || 0;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    // White litho chalk wave lines across the ink-black cinema band
    ctx.save();
    ctx.strokeStyle = "rgba(251, 250, 247, 0.16)";
    ctx.lineWidth = 1.4;
    for (var wr = 0; wr < 6; wr++) {
      var wy0 = 148 + wr * 70;
      ctx.beginPath();
      for (var wx = 20; wx <= 1260; wx += 36) {
        var wy = wy0 + Math.sin(wx * 0.014 + t * 1.5 + wr) * 6;
        if (wx === 20) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Left wooden dock pilings from p06.jpg + right cabin console fish from atlas-05.webp
    S.drawScissorCutout(
      ctx, pImg,
      96, 128, 162, 345,
      82, 124, 232, 426,
      [[0.08, 0.03], [0.88, 0.02], [0.96, 0.28], [0.84, 0.62], [0.92, 0.96], [0.06, 0.97], [0.03, 0.48]],
      { filter: "litho", haloWidth: 5.0, haloColor: "#fbfaf7", stroke: "#14110d", seed: 6.01 }
    );
    S.drawScissorCutout(
      ctx, aImg,
      14, 155, 354, 465,
      952, 134, 244, 408,
      [[0.12, 0.04], [0.90, 0.03], [0.96, 0.42], [0.93, 0.95], [0.06, 0.96], [0.04, 0.46]],
      { filter: "litho", haloWidth: 4.5, haloColor: "#fbfaf7", alpha: 0.82, seed: 6.05 }
    );

    var carpX = (cfg.carpX != null ? cfg.carpX : 486);
    var carpY = (cfg.carpY != null ? cfg.carpY : 148) + Math.sin(t * 2.1) * 5;

    // Articulated FK caudal tail fin
    ctx.save();
    ctx.translate(carpX + 356, carpY + 165);
    ctx.rotate(Math.sin(t * 4.6) * 0.18);
    S.drawCutoutPaperEdge(ctx, [[-12, -18], [68, -76], [52, 0], [72, 74], [-12, 18]], "#c8c5bc", "#0b0c0e", { paperRim: 4.5 });
    S.drawSplitPin(ctx, 0, 0, 5.0, { metal: "silver" });
    ctx.restore();

    // Sheriff Carp body from p06.jpg
    S.drawScissorCutout(
      ctx, pImg,
      256, 142, 276, 256,
      carpX, carpY, 386, 336,
      [
        [0.06, 0.56], [0.14, 0.28], [0.46, 0.04], [0.68, 0.03],
        [0.86, 0.24], [0.97, 0.44], [0.96, 0.72], [0.78, 0.94],
        [0.44, 0.96], [0.14, 0.84]
      ],
      { filter: "litho", haloWidth: 5.5, haloColor: "#fbfaf7", stroke: "#0b0c0e", seed: 6.11 }
    );

    // ALWAYS mask shoulder badge word with pure vector 6-point Sheriff Star!
    drawSheriffStar(ctx, S, carpX + 228, carpY + 148, 32, Math.sin(t * 1.8) * 0.06, cfg.starColor || "#f3d184", "brass");

    // Expressive tracking detective eye & curling handlebar mustache
    var eyeX = carpX + 120, eyeY = carpY + 131;
    ctx.save();
    ctx.fillStyle = "#fbfaf7"; ctx.strokeStyle = "#0b0c0e"; ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.arc(eyeX, eyeY, 17, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#0b0c0e";
    ctx.beginPath(); ctx.arc(eyeX - 4, eyeY + 2, 7.2, 0, TAU); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(carpX + 64, carpY + 194);
    ctx.rotate(Math.sin(t * 4.2) * 0.08);
    S.drawCutoutPaperEdge(ctx, [[-42, 16], [-26, -4], [0, -8], [46, -2], [68, 22], [44, 24], [8, 6], [-24, 18]], "#181818", "#0b0c0e", { paperRim: 2.5, shadow: false });
    ctx.restore();

    return { carpX: carpX, carpY: carpY, eyeX: eyeX, eyeY: eyeY, shX: carpX + 122, shY: carpY + 252 };
  }

  function drawP06RulerAndLure(ctx, pImg, S, cp, t, opts) {
    var cfg = opts || {};
    if (!cfg.hideRuler) {
      var rx = cfg.rulerX != null ? cfg.rulerX : 368;
      var ry = cfg.rulerY != null ? cfg.rulerY : 258;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(cfg.rulerRot != null ? cfg.rulerRot : -0.14);
      S.drawCutoutPaperEdge(ctx, [[-22, 0], [22, 0], [22, 248], [-22, 248]], "#efe6cf", "#0b0c0e", { paperRim: 3.8 });
      ctx.strokeStyle = "#0b0c0e";
      for (var tk = 14; tk < 238; tk += 14) {
        ctx.lineWidth = tk % 42 === 0 ? 2.4 : 1.3;
        ctx.beginPath(); ctx.moveTo(22, tk); ctx.lineTo(22 - (tk % 42 === 0 ? 15 : 9), tk); ctx.stroke();
      }
      ctx.restore();
      var ik = S.solveIK2(cp.shX, cp.shY, 118, 112, rx + 18, ry + 112, 1);
      drawJointedIKLimb(ctx, S, ik, 15, 12, "#8f8d86", "#a8a59d", "brass");
    }

    if (!cfg.hideLure) {
      var swing = cfg.lureSwing != null ? cfg.lureSwing : Math.sin(t * 3.1) * 0.12;
      var lx = (cfg.lureX != null ? cfg.lureX : 480) + Math.sin(swing) * 180;
      var ly = cfg.lureY != null ? cfg.lureY : 416;
      if (!cfg.cutLine) {
        ctx.strokeStyle = "#fbfaf7"; ctx.lineWidth = 2.0;
        ctx.beginPath(); ctx.moveTo(480, 112); ctx.lineTo(lx, ly - 24); ctx.stroke();
      }
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(swing);
      S.drawScissorCutout(
        ctx, pImg,
        262, 360, 172, 124,
        -68, -46, 212, 148,
        [[0.02, 0.22], [0.45, 0.08], [0.95, 0.26], [0.98, 0.72], [0.62, 0.97], [0.18, 0.82]],
        { filter: cfg.lureFilter || "sepia", haloWidth: 4.5, haloColor: "#fbfaf7", stroke: "#0b0c0e", seed: 6.21 }
      );
      S.drawCutoutPaperEdge(ctx, [[54, -4], [122, -24], [108, 8], [128, 24], [54, 12]], "#d42a1e", "#0b0c0e", { paperRim: 2.0, shadow: false });
      ctx.restore();
    }
  }

  function registerPorthole06(B) {
    B.definePortalGame(6, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        S.drawBolasBackdrop(
          ctx, W, H, resolved.bolasStyle, 6, resolved.t,
          { showCaptions: !resolved.blind, lamp: resolved.lampOn, ballast: resolved.ballastOn },
          { bandTop: 108, bandBot: 582 }
        );
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        B.drawVolumetricBeam(ctx, 560, 580, 520, 260, { color: "#fde68a", spread: 210, intensity: 0.45, t: t });
        var cp = drawP06SternStage(ctx, W, H, resolved, plates, S, B);
        drawP06RulerAndLure(ctx, plates.portholeImg, S, cp, t, {});
        S.drawTurkeyInCorner(ctx, 148, 508, 0.98, t, { dispatch: 0.08 });
        drawRootAnchorLandmarks(ctx, resolved, S, B);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = clamp(resolved.stemU, 0, 1);
          var cp = drawP06SternStage(ctx, W, H, resolved, plates, S, B, { starColor: "#ffffff" });
          drawP06RulerAndLure(ctx, plates.portholeImg, S, cp, t, { lureFilter: "none" });
          // Stark noir detective spotlight glinting off badge & rainbow feather lure!
          B.drawVolumetricBeam(ctx, 180, 560, cp.carpX + 228, cp.carpY + 148, {
            color: "#fef08a", coreColor: "#ffffff", spread: 155, intensity: 0.6 + 0.9 * u, t: t
          });
          B.drawLanternHalo(ctx, cp.carpX + 228, cp.carpY + 148, 95 * u + 20, { color: "#ffffff", intensity: 1.1, t: t });
          B.drawLanternHalo(ctx, 495, 416, 110 * u, { color: "#fde047", intensity: 0.85, t: t });
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = clamp(resolved.stemU, 0, 1);
          var cp = drawP06SternStage(ctx, W, H, resolved, plates, S, B);
          drawP06RulerAndLure(ctx, plates.portholeImg, S, cp, t, {
            lureSwing: Math.sin(t * 11.5) * 0.42 * clamp(u, 0.25, 1),
            lureY: 392 + Math.cos(t * 9) * 24
          });
          drawCutBubbleCluster(ctx, 485, 520, 18, 280, 320, t * 1.6, 602, "rgba(251, 250, 247, 0.92)");
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = smooth(0, 1, resolved.stemU);
          var cp = drawP06SternStage(ctx, W, H, resolved, plates, S, B);
          drawP06RulerAndLure(ctx, plates.portholeImg, S, cp, t, {});
          var sx0 = 180, sy0 = 540, sx1 = 310, sy1 = 448;
          B.drawSnailSilverTrail(ctx, sx0, sy0, sx1, sy1, u, t, { arc: 16 });
          var cx = lerp(sx0, sx1, u), cy = lerp(sy0, sy1, u);
          S.drawMailSnail(ctx, cx, cy, 1.24, t, { postcard: false });
          drawVectorSlip(ctx, S, cx + 38, cy - 36, 64, 78, -0.12, { bandColor: "#0f8f80", sealColor: "#eab308", glyph: "star" });
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = clamp(resolved.stemU, 0, 1);
          var cp = drawP06SternStage(ctx, W, H, resolved, plates, S, B);
          drawP06RulerAndLure(ctx, plates.portholeImg, S, cp, t, { rulerRot: -0.28 + Math.sin(t * 8) * 0.08 });
          // Fencing duel of brass scissor-caliper against Carp's ruler!
          var hit = smooth(0.1, 0.55, u);
          drawBrassScissorTongs(ctx, S, 1100, 555, lerp(920, 415, hit), lerp(510, 365, hit), 0.24 + Math.sin(t * 10) * 0.1);
          if (u > 0.4) {
            B.drawDeterministicParticles(ctx, "brass_sparks", 412, 365, (t % 0.8), { count: 14, seed: 64.4 });
          }
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var cp = drawP06SternStage(ctx, W, H, resolved, plates, S, B);
            // Pleated white chef toque on Carp + lidded cast-iron Turkey Roasting Pan measured by yellow tape!
            ctx.save();
            ctx.translate(cp.carpX + 152, cp.carpY + 32);
            ctx.rotate(-0.12);
            S.drawCutoutPaperEdge(ctx, [[-52, 18], [-64, -38], [-38, -74], [0, -86], [42, -72], [62, -34], [48, 18]], "#fbfaf7", "#0b0c0e", { paperRim: 3.5 });
            ctx.restore();

            var px = 395, py = 442;
            S.drawCardboardPuppetPiece(ctx, [[px - 150, py - 12], [px + 150, py - 12], [px + 128, py + 68], [px - 128, py + 68]], {
              tone: "#45474a", ribs: 3, pins: [[px - 110, py + 12], [px, py + 14], [px + 110, py + 12]]
            });
            S.drawCutoutPaperEdge(ctx, [[px - 145, py - 30], [px + 145, py - 30], [px + 145, py - 12], [px - 145, py - 12]], "#facc15", "#0b0c0e", { paperRim: 2.5 });
            var ik = S.solveIK2(cp.shX, cp.shY, 120, 115, px + 135, py - 20, 1);
            drawJointedIKLimb(ctx, S, ik, 15, 12, "#8f8d86", "#fbfaf7", "silver");
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 146, turkeyY: 506 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var cp = drawP06SternStage(ctx, W, H, resolved, plates, S, B);
            // Rotating crimson/teal police siren flash rays + dark sunglasses & open deputy wallet!
            ctx.save();
            ctx.translate(cp.carpX + 165, cp.carpY + 18);
            for (var r = 0; r < 6; r++) {
              var ra = t * 3.0 + (r / 6) * TAU;
              ctx.fillStyle = r % 2 === 0 ? "rgba(212, 42, 30, 0.38)" : "rgba(15, 143, 128, 0.38)";
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ra - 0.15) * 235, Math.sin(ra - 0.15) * 135); ctx.lineTo(Math.cos(ra + 0.15) * 235, Math.sin(ra + 0.15) * 135); ctx.closePath(); ctx.fill();
            }
            ctx.restore();
            S.drawCutoutPaperEdge(ctx, [[cp.eyeX - 38, cp.eyeY - 12], [cp.eyeX + 26, cp.eyeY - 10], [cp.eyeX + 22, cp.eyeY + 14], [cp.eyeX - 30, cp.eyeY + 12]], "#0b0c0e", "#fbfaf7", { paperRim: 3.0 });

            var wx = 398, wy = 372;
            S.drawCardboardPuppetPiece(ctx, [[wx - 40, wy - 54], [wx + 40, wy - 54], [wx + 40, wy + 54], [wx - 40, wy + 54]], { tone: "#2b2623", ribs: 2 });
            drawSheriffStar(ctx, S, wx, wy, 25, 0, "#facc15", "brass");
            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 256, troutY: 416, troutFlip: false, snailX0: 195, snailX1: 350, snailY1: 540 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 480, saucerY: 96, beamX: 430, beamY: 420, beamSpread: 185 });
            var cp = drawP06SternStage(ctx, W, H, resolved, plates, S, B, { carpX: 545 });
            drawP06RulerAndLure(ctx, plates.portholeImg, S, cp, t, { hideRuler: true, lureX: 420, lureY: 425 });

            // Red biometric cyber-visor sweeping laser grid & DNA double-helix up to Saucer!
            S.drawCutoutPaperEdge(ctx, [[cp.eyeX - 42, cp.eyeY - 16], [cp.eyeX + 30, cp.eyeY - 14], [cp.eyeX + 26, cp.eyeY + 16], [cp.eyeX - 36, cp.eyeY + 14]], "#ef4444", "#fbfaf7", { paperRim: 2.8 });
            B.drawVolumetricBeam(ctx, cp.eyeX - 18, cp.eyeY + 2, 420, 425, { color: "#f43f5e", spread: 95, intensity: 1.15, t: t });

            // Rising glowing double-helix DNA rungs
            for (var d = 0; d < 10; d++) {
              var dy = 395 - d * 28;
              var dxOff = Math.sin(t * 4.5 + d * 0.7) * 26;
              ctx.strokeStyle = "#34d399"; ctx.lineWidth = 2.5;
              ctx.beginPath(); ctx.moveTo(430 - dxOff, dy); ctx.lineTo(430 + dxOff, dy); ctx.stroke();
              ctx.fillStyle = "#f43f5e";
              ctx.beginPath(); ctx.arc(430 - dxOff, dy, 4.5, 0, TAU); ctx.arc(430 + dxOff, dy, 4.5, 0, TAU); ctx.fill();
            }
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var cp = drawP06SternStage(ctx, W, H, resolved, plates, S, B);
            drawP06RulerAndLure(ctx, plates.portholeImg, S, cp, t, { hideRuler: true });
            // 3 loose turkey tail-feathers drifting off lure + Carp scribbling on ticket pad!
            for (var f = 0; f < 3; f++) {
              var fx = 345 + f * 65 + Math.sin(t * 2.5 + f) * 22;
              var fy = 265 + f * 42 + Math.cos(t * 2.1 + f) * 14;
              S.drawCutoutPaperEdge(ctx, [[fx - 28, fy], [fx + 18, fy - 14], [fx + 34, fy], [fx + 16, fy + 14]], "#9a3412", "#fbfaf5", { paperRim: 2.2 });
            }
            drawVectorSlip(ctx, S, 412, 348, 62, 78, 0.14, { paper: "#fce7f3", bandColor: "#d42a1e", rows: 3 });
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 146, turkeyY: 512 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var lunge = Math.sin(t * 3.4) * 32;
            var cp = drawP06SternStage(ctx, W, H, resolved, plates, S, B, { carpX: 462 - Math.max(0, lunge) });
            drawP06RulerAndLure(ctx, plates.portholeImg, S, cp, t, { hideRuler: true, lureX: 365, lureSwing: Math.sin(t * 8) * 0.22 });
            // Rosy embarrassed blush circle on Sheriff Carp's cheek!
            ctx.fillStyle = "rgba(244, 63, 94, 0.55)";
            ctx.beginPath(); ctx.arc(cp.eyeX + 26, cp.eyeY + 38, 22, 0, TAU); ctx.fill();
            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 250, troutY: 430, troutFlip: false, snailX0: 210, snailX1: 640, snailY1: 540 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 380, saucerY: 102, beamX: 355, beamY: 365, beamSpread: 175 });
            var cp = drawP06SternStage(ctx, W, H, resolved, plates, S, B, { carpX: 548, carpY: 128 });
            // Blazing cyan comet-hook towing visored Bounty-Carp toward Alien Saucer!
            var cx = 355 + Math.cos(t * 3.2) * 28, cy = 345 + Math.sin(t * 3.2) * 22;
            S.drawCutoutPaperEdge(ctx, [[cx + 25, cy - 18], [cx + 185, cy - 48], [cx + 150, cy], [cx + 190, cy + 44], [cx + 25, cy + 18]], "#38bdf8", "#fbfaf7", { paperRim: 2.5, shadow: false });
            drawP06RulerAndLure(ctx, plates.portholeImg, S, cp, t, { hideRuler: true, cutLine: true, lureX: cx, lureY: cy, lureFilter: "cyan" });
            ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 3.5;
            ctx.beginPath(); ctx.moveTo(cp.shX, cp.shY); ctx.lineTo(cx + 20, cy); ctx.stroke();
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var cp = drawP06SternStage(ctx, W, H, resolved, plates, S, B);
            // Brass traffic whistle at Carp's mouth + pink parking citation tucked onto Mail Snail!
            S.drawCutoutPaperEdge(ctx, [[cp.carpX + 12, cp.carpY + 204], [cp.carpX + 48, cp.carpY + 198], [cp.carpX + 48, cp.carpY + 216], [cp.carpX + 12, cp.carpY + 216]], "#eab308", "#0b0c0e", { paperRim: 2.0 });
            S.drawMailSnail(ctx, 368, 468, 1.32, t, { postcard: false });
            drawVectorSlip(ctx, S, 362, 434, 58, 42, -0.18, { paper: "#fbcfe8", bandColor: "#e11d48", sealColor: "#d42a1e", glyph: "return" });
            var ik = S.solveIK2(cp.shX, cp.shY, 118, 115, 388, 438, 1);
            drawJointedIKLimb(ctx, S, ik, 15, 12, "#8f8d86", "#a8a59d", "brass");
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 146, turkeyY: 508 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var cp = drawP06SternStage(ctx, W, H, resolved, plates, S, B);
            // Sheriff Carp pinning glinting Junior Deputy gold star onto Mail Snail!
            var sx = 415, sy = 456;
            S.drawMailSnail(ctx, sx, sy, 1.44, t, { postcard: true, hasReply: true });
            drawSheriffStar(ctx, S, sx + 8, sy - 10, 19, Math.sin(t * 3) * 0.1, "#facc15", "brass");
            var ik = S.solveIK2(cp.shX, cp.shY, 118, 114, sx + 14, sy - 14, 1);
            drawJointedIKLimb(ctx, S, ik, 15, 12, "#8f8d86", "#a8a59d", "brass");
            drawOutcomeWitnesses(ctx, resolved, S, B, { skipDefaultSnail: true, troutX: 248, troutY: 416, troutFlip: false });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = clamp(resolved.outcomeU, 0, 1);
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 430, saucerY: 112, beamX: 430, beamY: 460, beamSpread: 165 });
            drawP06SternStage(ctx, W, H, resolved, plates, S, B, { carpX: 555 });

            // Mail Snail rocketing skyward on silver slime ribbon to slap subpoena onto Saucer dome!
            var sy = lerp(465, 152, smooth(0.05, 0.78, u));
            B.drawSnailSilverTrail(ctx, 380, 510, 430, sy, 1, t, { width: 7.0, arc: 15 });
            S.drawMailSnail(ctx, 430, sy + 24, 1.24, t, { rot: -Math.PI * 0.48, postcard: false });
            drawVectorSlip(ctx, S, 430, sy - 22, 64, 52, 0.08, { bandColor: "#d42a1e", sealColor: "#0f8f80", glyph: "star" });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var cp = drawP06SternStage(ctx, W, H, resolved, plates, S, B);
            // Brass caliper stretched WIDER than Carp's small roasting pan cutout -> relieved release!
            S.drawCardboardPuppetPiece(ctx, [[320, 430], [500, 430], [484, 488], [336, 488]], { tone: "#45474a", ribs: 2 });
            drawBrassScissorTongs(ctx, S, 1100, 555, 525, 420, 0.68);
            // Wide brass caliper span bar exceeding pan width
            ctx.strokeStyle = "#facc15"; ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(275, 408); ctx.lineTo(545, 408); ctx.moveTo(275, 392); ctx.lineTo(275, 426); ctx.moveTo(545, 392); ctx.lineTo(545, 426); ctx.stroke();
            drawOutcomeWitnesses(ctx, resolved, S, B, { turkeyX: 146, turkeyY: 506 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = clamp(resolved.outcomeU, 0, 1);
            var cp = drawP06SternStage(ctx, W, H, resolved, plates, S, B);
            // Scissor-probe snips fishing line; lure drops into padlocked tin evidence box!
            drawBrassScissorTongs(ctx, S, 1100, 540, 482, 265, 0.06 + Math.abs(Math.sin(t * 8)) * 0.18);
            ctx.strokeStyle = "#fbfaf7"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(480, 112); ctx.lineTo(480, 255); ctx.stroke();

            var dropY = lerp(330, 456, smooth(0.1, 0.65, u));
            drawP06RulerAndLure(ctx, plates.portholeImg, S, cp, t, { hideRuler: true, cutLine: true, lureX: 430, lureY: dropY, lureSwing: 0 });
            S.drawCardboardPuppetPiece(ctx, [[340, 452], [530, 452], [520, 536], [350, 536]], {
              tone: "#64748b", ribs: 2, pins: [[365, 470], [505, 470]]
            });
            // Brass padlock on box front
            S.drawCutoutPaperEdge(ctx, [[420, 482], [450, 482], [450, 512], [420, 512]], "#eab308", "#14110d", { paperRim: 2.0 });
            drawOutcomeWitnesses(ctx, resolved, S, B, { troutX: 235, troutY: 425, troutFlip: false, snailX0: 195, snailX1: 635, snailY1: 545 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var yank = 48 + Math.sin(t * 9) * 14;
            drawOutcomeWitnesses(ctx, resolved, S, B, { saucerX: 455 + Math.sin(t * 14) * 8, saucerY: 96 + yank, beamX: 455, beamY: 390, beamSpread: 175 });
            var cp = drawP06SternStage(ctx, W, H, resolved, plates, S, B, { carpX: 555 });

            // Tongs tangled with glowing space-lure yanking Alien Saucer downward in gold sparks!
            drawP06RulerAndLure(ctx, plates.portholeImg, S, cp, t, { hideRuler: true, lureX: 455, lureY: 365, lureFilter: "cyan", lureSwing: 0.25 });
            drawBrassScissorTongs(ctx, S, 1100, 555, 468, 372, 0.08);
            B.drawDeterministicParticles(ctx, "brass_sparks", 460, 368, (t * 1.6) % 0.75, { count: 18, seed: 68.8 });
          }
        }
      },

      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawPortholeBezelCorners(ctx, W, H, resolved, S);
      }
    });
  }

  // ---------- Bootstrap & Register All 6 Pod 1A Games (#01–#06) ----------

  function initPod1A() {
    var B = getB();
    var S = getS();
    if (!B || typeof B.definePortalGame !== "function") return false;
    if (S && typeof S.preloadPortalPlates === "function") {
      S.preloadPortalPlates(PORTAL_IDS);
    }
    registerPorthole01(B);
    registerPorthole02(B);
    registerPorthole03(B);
    registerPorthole04(B);
    registerPorthole05(B);
    registerPorthole06(B);
    return true;
  }

  initPod1A();
})(typeof window !== "undefined" ? window : globalThis);
