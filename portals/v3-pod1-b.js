/* ============================================================================
 * Turkey Sub · Pod 1B V3 Branching Video-to-Game Portals (#07–#11)
 * File: portals/v3-pod1-b.js  (window.PORTAL_V3_GAMES[7..11])
 *
 * 18.0s (432 frames @ 24fps, 1280×720) + 60fps Interactive 12-Branch Gameplay
 * Dual Standard: PAELEO Oulipo Cutout/Cardboard Cinema × Video-to-Game Runtime
 *   - #07 · Hatch  ("queneau-rostrum"    · p07.jpg + atlas-19.webp · 17 nodes)
 *   - #08 · Gauge  ("perec-stage"        · p08.jpg + atlas-16.webp · 17 nodes)
 *   - #09 · Port   ("cardboard-parallax" · p09.jpg + atlas-44.webp · 17 nodes)
 *   - #10 · PA     ("perec-stage"        · p10.jpg + atlas-34.webp · 17 nodes)
 *   - #11 · Tank   ("queneau-rostrum"    · p11.jpg + atlas-07.webp · 17 nodes)
 *
 * STRICT ZERO-TEXT BLIND-MODE LAW:
 *   Contains ZERO ctx.fillText or ctx.strokeText calls anywhere in this file.
 *   All diegetic controller prompts, breadcrumbs, and BOLAS slates are drawn
 *   exclusively by BRANCH_GAME.drawControllerHUD when showCaptions !== false.
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var PORTAL_IDS = [7, 8, 9, 10, 11];

  function getBG() {
    return (root && root.BRANCH_GAME) ? root.BRANCH_GAME : null;
  }

  function getStage() {
    return (root && root.SCION_STAGE) ? root.SCION_STAGE : null;
  }

  // Preload all 5 pairs of real photographic & atlas plates immediately
  if (root && root.SCION_STAGE && typeof root.SCION_STAGE.preloadPortalPlates === "function") {
    try {
      root.SCION_STAGE.preloadPortalPlates(PORTAL_IDS);
    } catch (e) {}
  }

  // ---------- Pure Math & Stateless Easing Helpers (Zero Hidden State) ----------

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

  function hash(n) {
    var s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  function enterAmt(resolved, dur) {
    var d = dur || 0.48;
    if (resolved.phase === "outcome") {
      return easeOutCubic(clamp(resolved.outcomeT / d, 0, 1));
    }
    if (resolved.phase === "tier_select") {
      return 1.0;
    }
    return easeOutCubic(clamp(resolved.stemT / d, 0, 1));
  }

  function popAmt(resolved, dur) {
    var d = dur || 0.46;
    if (resolved.phase === "outcome") {
      return easeOutBack(clamp(resolved.outcomeT / d, 0, 1));
    }
    if (resolved.phase === "tier_select") {
      return 1.0;
    }
    return easeOutBack(clamp(resolved.stemT / d, 0, 1));
  }

  function px(S, depth, resolved) {
    if (!S || typeof S.parallaxX !== "function") return Math.sin(resolved.t * 0.55) * 10 * depth;
    return S.parallaxX(depth, resolved.t, { ballast: resolved.ballastOn, view: "a" });
  }

  function py(S, depth, resolved) {
    if (!S || typeof S.parallaxY !== "function") return Math.cos(resolved.t * 0.45) * 5 * depth;
    return S.parallaxY(depth, resolved.t, { ballast: resolved.ballastOn, view: "a" });
  }

  // ---------- Shared PAELEO × Video-to-Game Craft Primitives (0 Text!) ----------

  function buildLimbPoly(x1, y1, x2, y2, r1, r2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len;
    var ny = dx / len;
    var ux = dx / len;
    var uy = dy / len;
    return [
      [x1 - ux * r1 * 0.42 + nx * r1, y1 - uy * r1 * 0.42 + ny * r1],
      [x2 + ux * r2 * 0.42 + nx * r2, y2 + uy * r2 * 0.42 + ny * r2],
      [x2 + ux * r2 * 0.42 - nx * r2, y2 + uy * r2 * 0.42 - ny * r2],
      [x1 - ux * r1 * 0.42 - nx * r1, y1 - uy * r1 * 0.42 - ny * r1]
    ];
  }

  function drawIKLimb(S, ctx, x0, y0, l1, l2, tx, ty, bendDir, opts) {
    var cfg = opts || {};
    var ik = S.solveIK2(x0, y0, l1, l2, tx, ty, bendDir);
    var r1 = cfg.r1 || 13;
    var r2 = cfg.r2 || 10;
    var upper = buildLimbPoly(ik.x0, ik.y0, ik.jx, ik.jy, r1, r1 * 0.84);
    var lower = buildLimbPoly(ik.jx, ik.jy, ik.ex, ik.ey, r2, r2 * 0.78);
    S.drawCardboardPuppetPiece(ctx, upper, { tone: cfg.tone1 || "#82807a", ribs: 2 });
    S.drawCardboardPuppetPiece(ctx, lower, { tone: cfg.tone2 || "#9c9991", ribs: 2 });
    S.drawSplitPin(ctx, ik.x0, ik.y0, 4.6, { metal: cfg.metal || "silver" });
    S.drawSplitPin(ctx, ik.jx, ik.jy, 4.4, { metal: cfg.metal || "silver" });
    S.drawSplitPin(ctx, ik.ex, ik.ey, 4.0, { metal: cfg.tipMetal || "brass" });
    return ik;
  }

  // Submarine's articulated brass scissor-tongs / probe arm for [□] Square stems & outcomes
  function drawBrassScissorTongs(S, B, ctx, baseX, baseY, tipX, tipY, pinch, t, opts) {
    var cfg = opts || {};
    var ik = drawIKLimb(S, ctx, baseX, baseY, cfg.l1 || 190, cfg.l2 || 175, tipX, tipY, cfg.bend || -1, {
      r1: 14,
      r2: 11,
      tone1: "#a6782a",
      tone2: "#d4a44c",
      metal: "brass",
      tipMetal: "brass"
    });
    var ang = Math.atan2(tipY - ik.jy, tipX - ik.jx);
    var jawOpen = clamp(0.42 - (pinch || 0) * 0.34, 0.04, 0.52);

    ctx.save();
    ctx.translate(ik.ex, ik.ey);
    ctx.rotate(ang);
    // Upper & lower curved brass tongs jaws
    ctx.save();
    ctx.rotate(-jawOpen);
    S.drawCardboardPuppetPiece(ctx, [[-4, -6], [36, -16], [48, -4], [32, -2], [-4, 2]], {
      tone: "#e2b85c",
      ribs: 1,
      shadow: false
    });
    ctx.restore();

    ctx.save();
    ctx.rotate(jawOpen);
    S.drawCardboardPuppetPiece(ctx, [[-4, -2], [32, 2], [48, 4], [36, 16], [-4, 6]], {
      tone: "#c99535",
      ribs: 1,
      shadow: false
    });
    ctx.restore();

    if (typeof S.drawReinigerFiligreeHinge === "function") {
      S.drawReinigerFiligreeHinge(ctx, 0, 0, 9.5, { metal: "brass" });
    } else {
      S.drawSplitPin(ctx, 0, 0, 5.2, { metal: "brass" });
    }
    ctx.restore();

    if (cfg.sparks && B) {
      B.drawDeterministicParticles(ctx, "brass_sparks", tipX + 12, tipY, t, {
        count: 10,
        loop: true,
        seed: (cfg.seed || 41.7)
      });
    }
    return ik;
  }

  // Cut-paper polygonal creek bubbles (0 text)
  function drawCutPaperBubbles(S, ctx, seed, count, t, x0, x1, y0, y1, surge, fillCol) {
    var total = count + (surge ? 8 : 0);
    var spanY = Math.max(60, y1 - y0);
    for (var i = 0; i < total; i++) {
      var h1 = hash(seed * 19.3 + i * 7.1);
      var h2 = hash(seed * 31.7 + i * 11.9);
      var spd = (30 + h2 * 38) * (surge ? 1.55 : 1.0);
      var bx = lerp(x0, x1, h1) + Math.sin(t * 2.3 + i * 1.7) * 12;
      var by = y1 - (((t * spd) + h2 * spanY) % spanY);
      var br = 5.0 + (i % 3) * 3.4;
      var pts = [];
      for (var s = 0; s < 7; s++) {
        var ang = (s / 7) * TAU + i * 0.4;
        pts.push([bx + Math.cos(ang) * br, by + Math.sin(ang) * br]);
      }
      S.drawCutoutPaperEdge(ctx, pts, fillCol || "#e4f2ee", "#14110d", {
        paperRim: 1.9,
        lineWidth: 1.4,
        shadow: false
      });
    }
  }

  // Cut-paper star / badge / sparkle (0 text)
  function drawCutPaperStar(S, ctx, cx, cy, rOuter, rInner, points, rot, fillCol, pinMetal) {
    var n = Math.max(4, points || 5);
    var pts = [];
    for (var i = 0; i < n * 2; i++) {
      var a = -Math.PI * 0.5 + (i / (n * 2)) * TAU + (rot || 0);
      var rad = (i % 2 === 0) ? rOuter : rInner;
      pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
    }
    S.drawCutoutPaperEdge(ctx, pts, fillCol || "#f3d184", "#14110d", { paperRim: 2.4, shadow: false });
    if (pinMetal) {
      S.drawSplitPin(ctx, cx, cy, Math.max(3.0, rInner * 0.34), { metal: pinMetal });
    }
  }

  // Subtle physical submarine/creek landmarks at the 4 Stage-1 button anchors in Root
  function drawRootHotspotLandmarks(S, B, ctx, resolved) {
    if (resolved.phase !== "root") return;
    var tree = resolved.tree;
    if (!tree || !tree.buttons) return;
    var t = resolved.t;

    // [✕] Lamp glint prism at buttons.x.anchor
    var ax = tree.buttons.x.anchor;
    if (B) {
      B.drawLanternHalo(ctx, ax.x, ax.y, 44, { color: "#60a5fa", intensity: 0.42, t: t });
    }
    drawCutPaperStar(S, ctx, ax.x, ax.y, 11 + Math.sin(t * 4.2) * 2, 4.5, 4, t * 0.8, "#dbeafe", null);

    // [○] Rising micro-bubbles at buttons.o.anchor
    var ao = tree.buttons.o.anchor;
    drawCutPaperBubbles(S, ctx, resolved.portalId + 77, 3, t, ao.x - 18, ao.x + 18, ao.y - 34, ao.y + 22, false, "#fee2e2");

    // [△] Brass postal wax-seal token bobbing at buttons.triangle.anchor
    var at = tree.buttons.triangle.anchor;
    var tyBob = at.y + Math.sin(t * 3.1) * 4;
    S.drawCutoutPaperEdge(
      ctx,
      [[at.x - 13, tyBob - 9], [at.x + 13, tyBob - 9], [at.x + 13, tyBob + 9], [at.x - 13, tyBob + 9]],
      "#fbfaf5",
      "#14110d",
      { paperRim: 2.0, shadow: false }
    );
    ctx.fillStyle = "#0f8f80";
    ctx.beginPath();
    ctx.arc(at.x, tyBob, 3.6, 0, TAU);
    ctx.fill();

    // [□] Brass caliper corner bracket glinting at buttons.square.anchor
    var asq = tree.buttons.square.anchor;
    S.drawSplitPin(ctx, asq.x, asq.y + Math.cos(t * 3.4) * 3, 5.2, { metal: "brass" });
  }

  // Subtle corner brass porthole bezel & rivets framing the 1280×640 stage
  function drawCornerBrassPortholeFrame(S, ctx, W, H, resolved) {
    var stageH = resolved.blind ? H : 640;
    var cx = W * 0.5;
    var cy = stageH * 0.5;
    var rInner = 696;
    var rOuter = 748;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, TAU, false);
    ctx.arc(cx, cy, rInner, 0, TAU, true);
    var bg = ctx.createLinearGradient(0, 0, W, stageH);
    bg.addColorStop(0, "#edd089");
    bg.addColorStop(0.5, "#b8842f");
    bg.addColorStop(1, "#5c3e12");
    ctx.fillStyle = bg;
    ctx.fill("evenodd");

    ctx.strokeStyle = "#171410";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(cx, cy, rInner, 0, TAU);
    ctx.stroke();

    var angles = [-Math.PI * 0.78, -Math.PI * 0.22, Math.PI * 0.22, Math.PI * 0.78];
    for (var i = 0; i < angles.length; i++) {
      var bx = cx + Math.cos(angles[i]) * 716;
      var by = cy + Math.sin(angles[i]) * 716;
      if (bx > -16 && bx < W + 16 && by > -16 && by < stageH + 16) {
        S.drawSplitPin(ctx, bx, by, 6.8, { metal: "brass" });
      }
    }
    ctx.restore();
  }

  function makeBackdropFn(portalId, backdropOpts) {
    return function (ctx, W, H, resolved, plates, S) {
      if (!S || typeof S.drawBolasBackdrop !== "function") return;
      S.drawBolasBackdrop(
        ctx,
        W,
        H,
        resolved.bolasStyle,
        portalId,
        resolved.t,
        {
          showCaptions: !resolved.blind,
          lamp: resolved.lampOn,
          ballast: resolved.ballastOn
        },
        backdropOpts || {}
      );
    };
  }

  // Wrapped foil bonbon / candy helper for #07 (0 text)
  function drawCandyBonbon(S, ctx, x, y, scale, rot, col, striped) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.scale(scale || 1, scale || 1);
    S.drawCutoutPaperEdge(ctx, [[-26, -11], [-11, 0], [-26, 11]], "#fbfaf7", "#14110d", { paperRim: 1.4, shadow: false });
    S.drawCutoutPaperEdge(ctx, [[26, -11], [11, 0], [26, 11]], "#fbfaf7", "#14110d", { paperRim: 1.4, shadow: false });
    var body = [];
    for (var i = 0; i < 10; i++) {
      var a = (i / 10) * TAU;
      body.push([Math.cos(a) * 14, Math.sin(a) * 14]);
    }
    S.drawCutoutPaperEdge(ctx, body, col || "#d42a1e", "#14110d", { paperRim: 2.0, shadow: false });
    if (striped) {
      ctx.strokeStyle = "#fbfaf7";
      ctx.lineWidth = 2.8;
      for (var k = 0; k < 3; k++) {
        var ka = (k / 3) * Math.PI + 0.3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ka) * -10, Math.sin(ka) * -10);
        ctx.lineTo(Math.cos(ka) * 10, Math.sin(ka) * 10);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Tapered brass & kraft-paper submarine kazoo for #07 (0 text)
  function drawBrassKazoo(S, ctx, x, y, scale, rot, t, seed) {
    var buzz = Math.sin(t * 28 + (seed || 0)) * 2.2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.scale(scale || 1, scale || 1);
    S.drawCutoutPaperEdge(
      ctx,
      [[-46, -8], [34, -15], [46, -22], [46, 22], [34, 15], [-46, 8]],
      "#d9a443",
      "#14110d",
      { paperRim: 2.6, shadow: false }
    );
    S.drawCardboardPuppetPiece(
      ctx,
      [[-10, -12], [-13, -28 + buzz], [13, -28 - buzz], [10, -12]],
      { tone: "#b87b22", ribs: 1, shadow: false, pin: { x: 0, y: -20, r: 3.2, metal: "brass" } }
    );
    var cols = ["#d42a1e", "#0f8f80", "#2563eb"];
    for (var b = 0; b < 2; b++) {
      var bx = 54 + (((t * 72) + b * 24) % 48);
      var by = (b === 0 ? -10 : 10) + Math.sin(t * 9 + b) * 4;
      S.drawCutoutPaperEdge(
        ctx,
        [[bx, by - 7], [bx + 12, by], [bx, by + 7], [bx + 4, by]],
        cols[(b + Math.floor(seed || 0)) % 3],
        "#14110d",
        { paperRim: 1.4, shadow: false }
      );
    }
    ctx.restore();
  }

  /* ==========================================================================
   * PORTHOLE #07 · HATCH ("queneau-rostrum" · p07.jpg + atlas-19.webp)
   * Root: Six choir trout singing around a soggy rainbow star birthday piñata
   * ========================================================================== */

  function drawP07Base(ctx, W, H, resolved, plates, S, B, cfg) {
    var opts = cfg || {};
    var t = resolved.t;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    var pFarX = px(S, 0.20, resolved);
    var pFarY = py(S, 0.20, resolved);
    var pMidX = px(S, 0.46, resolved);
    var pMidY = py(S, 0.46, resolved);

    // 1. Far Collage Flats: Sepia hand holding submarine-in-glass (atlas-19.webp) + Queneau green door
    S.drawScissorCutout(
      ctx, aImg,
      125, 8, 495, 400,
      64 + pFarX, 66 + pFarY, 352, 286,
      [[0.08, 0.06], [0.88, 0.03], [0.97, 0.38], [0.92, 0.94], [0.12, 0.96], [0.03, 0.52]],
      { filter: opts.atlasFilter || "sepia", haloWidth: 5.0, alpha: 0.86 }
    );

    S.drawTornPaperFlat(ctx, 1024 + pFarX * 0.7, 104 + pFarY * 0.5, 168, 438, {
      fill: opts.doorFill || "#263a19",
      paperColor: "#f6f0e2",
      deckle: 7.5
    });
    S.drawTornPaperFlat(ctx, 1060 + pFarX * 0.7, 164 + pFarY * 0.5, 96, 36, {
      fill: "#efe8d5",
      deckle: 2.5,
      shadow: false
    });
    S.drawSplitPin(ctx, 1046 + pFarX * 0.7, 322 + pFarY * 0.5, 5.8, { metal: "brass" });

    if (B) {
      B.drawWaterCaustics(ctx, W, H, t, { intensity: opts.causticIntensity || 0.20, color: "#7dd3fc" });
      B.drawDepthFog(ctx, W, H, t, { density: 0.12, color: "#e5dec9" });
    }

    // 2. Anchor Boulder Cutout from p07.jpg & Braided Rope
    var rockX = 536 + pMidX;
    var rockY = 474 + pMidY * 0.4;
    S.drawScissorCutout(
      ctx, pImg,
      258, 452, 168, 100,
      rockX, rockY, 204, 116,
      [[0.08, 0.45], [0.32, 0.12], [0.76, 0.08], [0.96, 0.48], [0.90, 0.92], [0.12, 0.94]],
      { haloWidth: 4.5, stroke: "#14110d" }
    );

    var sway = opts.sway != null ? opts.sway : (Math.sin(t * 2.1) * 0.10);
    var hubX = opts.hubX != null ? opts.hubX : (640 + Math.sin(sway) * 165 + px(S, 0.65, resolved) * 0.4);
    var hubY = opts.hubY != null ? opts.hubY : (276 + Math.cos(t * 4.2) * 6);

    if (opts.rope !== false) {
      ctx.save();
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = opts.chain ? 12 : 10;
      ctx.beginPath();
      ctx.moveTo(rockX + 98, rockY + 18);
      ctx.quadraticCurveTo(640 + pMidX, 396, hubX, hubY + (opts.ropeOffsetY || 86));
      ctx.stroke();
      ctx.strokeStyle = opts.chain ? "#33373b" : "#6e4e24";
      ctx.lineWidth = opts.chain ? 6.5 : 5.2;
      ctx.setLineDash(opts.chain ? [10, 6] : [8, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 3. Six Singing Choir Trout Scissor-Cutouts from p07.jpg
    var recoil = opts.choirSpread || 0;
    var floatY = opts.choirFloatY || 0;
    var choirPulse = Math.pow(Math.max(0, Math.sin(t * (opts.choirTempo || 7.0))), 2);
    var choirCrops = [
      { sx: 170, sy: 120, sw: 118, sh: 82, dx: 236 - recoil, dy: 110 + floatY, dw: 172, dh: 118, side: -1 },
      { sx: 114, sy: 192, sw: 132, sh: 82, dx: 176 - recoil, dy: 232 + floatY, dw: 188, dh: 116, side: -1 },
      { sx: 108, sy: 278, sw: 128, sh: 78, dx: 206 - recoil, dy: 354 + floatY, dw: 182, dh: 112, side: -1 },
      { sx: 374, sy: 128, sw: 122, sh: 82, dx: 844 + recoil, dy: 114 + floatY, dw: 176, dh: 118, side: 1 },
      { sx: 416, sy: 198, sw: 120, sh: 78, dx: 892 + recoil, dy: 236 + floatY, dw: 180, dh: 114, side: 1 },
      { sx: 416, sy: 272, sw: 122, sh: 82, dx: 858 + recoil, dy: 358 + floatY, dw: 182, dh: 116, side: 1 }
    ];

    for (var ci = 0; ci < choirCrops.length; ci++) {
      var c = choirCrops[ci];
      var cbob = Math.sin(t * 3.1 + ci * 1.05) * 7;
      var cx = c.dx + pMidX * 0.85;
      var cy = c.dy + cbob + pMidY * 0.45;
      S.drawScissorCutout(ctx, pImg, c.sx, c.sy, c.sw, c.sh, cx, cy, c.dw, c.dh, null, {
        haloWidth: 4.0,
        rot: Math.sin(t * 2.4 + ci) * 0.05 * c.side,
        stroke: "#14110d"
      });

      if (opts.notes !== false) {
        var mouthX = c.side < 0 ? (cx + c.dw + 8) : (cx - 10);
        var mouthY = cy + c.dh * 0.55;
        var nScale = (0.55 + choirPulse * 0.78) * (opts.noteBoost || 1.0);
        ctx.save();
        ctx.translate(mouthX + c.side * (-15 * choirPulse), mouthY - 8 * choirPulse);
        ctx.scale(nScale, nScale);
        var noteCol = opts.rainbowNotes
          ? ["#f59e0b", "#ec4899", "#06b6d4", "#10b981", "#8b5cf6", "#ef4444"][ci]
          : (ci % 2 === 0 ? "#0f8f80" : "#d42a1e");
        S.drawCutoutPaperEdge(ctx, [[0, -10], [10, 0], [0, 10], [-10, 0]], noteCol, "#14110d", {
          paperRim: 2.0,
          shadow: false
        });
        ctx.restore();
      }
    }

    return { hubX: hubX, hubY: hubY, rockX: rockX, rockY: rockY, sway: sway };
  }

  function drawP07StarPinata(S, ctx, pImg, hubX, hubY, rot, scale, t, opts) {
    var cfg = opts || {};
    var sc = scale || 1.0;
    ctx.save();
    ctx.translate(hubX, hubY);
    ctx.rotate(rot || 0);
    ctx.scale(sc, sc);

    S.drawScissorCutout(
      ctx, pImg,
      228, 198, 190, 210,
      -134, -138, 268, 286,
      [
        [0.50, 0.02], [0.68, 0.24], [0.97, 0.30], [0.80, 0.58],
        [0.86, 0.94], [0.50, 0.82], [0.14, 0.94], [0.20, 0.58],
        [0.03, 0.30], [0.32, 0.24]
      ],
      { haloWidth: 5.2, stroke: "#14110d", filter: cfg.filter || "none" }
    );

    if (cfg.streamers !== false) {
      var ribCols = ["#d42a1e", "#0f8f80", "#d99e3b", "#2563eb"];
      var tips = [[-114, -34], [114, -34], [-76, 110], [76, 110]];
      for (var i = 0; i < tips.length; i++) {
        ctx.save();
        ctx.translate(tips[i][0], tips[i][1]);
        ctx.rotate(Math.sin(t * 4.6 + i * 1.4) * 0.30 - (rot || 0) * 1.1);
        S.drawCutoutPaperEdge(ctx, [[-7, 0], [7, 0], [11, 66], [-3, 70]], ribCols[i], "#14110d", { paperRim: 2.0 });
        S.drawSplitPin(ctx, 0, 0, 3.8, { metal: "brass" });
        ctx.restore();
      }
    }

    if (cfg.drips) {
      for (var d = 0; d < 4; d++) {
        var du = ((t * 1.3 + d * 0.25) % 1);
        var dx = -52 + d * 35;
        var dy = 112 + du * 92;
        S.drawCutoutPaperEdge(ctx, [[dx, dy - 9], [dx + 6, dy + 4], [dx, dy + 10], [dx - 6, dy + 4]], "#7ec4be", "#14110d", {
          paperRim: 1.6,
          shadow: false
        });
      }
    }
    ctx.restore();
  }

  function registerPortal07(B, S) {
    B.definePortalGame(7, {
      drawBackdrop: makeBackdropFn(7),
      drawForeground: function (ctx, W, H, resolved, plates, S2) {
        drawCornerBrassPortholeFrame(S2, ctx, W, H, resolved);
      },

      drawRoot: function (ctx, W, H, resolved, plates, S2) {
        var t = resolved.t;
        var st = drawP07Base(ctx, W, H, resolved, plates, S2, B, {});
        drawCutPaperBubbles(S2, ctx, 7, 7, t, 310, 960, 110, 540, false, "#e5f2ee");
        drawP07StarPinata(S2, ctx, plates.portholeImg, st.hubX, st.hubY, st.sway * 0.85, 1.0, t, { drips: true });
        drawRootHotspotLandmarks(S2, B, ctx, resolved);
      },

      stems: {
        // [✕] Strobe Disco Lamp: Golden searchlight beams turn wet foil piñata into spinning mirror-ball
        x: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.45);
          var st = drawP07Base(ctx, W, H, resolved, plates, S2, B, { causticIntensity: 0.30, rainbowNotes: true });

          B.drawVolumetricBeam(ctx, 210, 595, st.hubX, st.hubY, {
            color: "#fde047",
            coreColor: "#fffbeb",
            spread: 155 * u,
            intensity: 1.25 * u,
            t: t
          });
          B.drawVolumetricBeam(ctx, 1060, 595, st.hubX, st.hubY, {
            color: "#60a5fa",
            coreColor: "#eff6ff",
            spread: 135 * u,
            intensity: 1.05 * u,
            t: t + 1.7
          });

          // Radiating disco foil rays from mirror-ball piñata
          for (var r = 0; r < 8; r++) {
            var ra = t * 1.4 + (r / 8) * TAU;
            B.drawVolumetricBeam(ctx, st.hubX, st.hubY, st.hubX + Math.cos(ra) * 340, st.hubY + Math.sin(ra) * 240, {
              sourceRadius: 12,
              spread: 34,
              color: r % 2 === 0 ? "#fde68a" : "#93c5fd",
              intensity: 0.65 * u,
              motes: 4,
              rimPool: false,
              t: t + r
            });
          }

          drawP07StarPinata(S2, ctx, plates.portholeImg, st.hubX, st.hubY, Math.sin(t * 3.2) * 0.16, 1.04, t, { drips: false });

          // Faceted silver-and-gold mirror tiles glinting across piñata core
          for (var fy = -2; fy <= 2; fy++) {
            for (var fx = -2; fx <= 2; fx++) {
              if (Math.abs(fx) + Math.abs(fy) > 3) continue;
              var gx = st.hubX + fx * 24 + Math.sin(t * 4.5 + fy) * 4;
              var gy = st.hubY + fy * 24;
              var glint = 0.5 + 0.5 * Math.sin(t * 9.0 + fx * 2.1 + fy * 1.7);
              S2.drawCutoutPaperEdge(
                ctx,
                [[gx - 9, gy - 9], [gx + 9, gy - 9], [gx + 9, gy + 9], [gx - 9, gy + 9]],
                glint > 0.55 ? "#fffbeb" : "#cbd5e1",
                "#14110d",
                { paperRim: 1.2, shadow: false }
              );
            }
          }
          B.drawLanternHalo(ctx, st.hubX, st.hubY, 130 * u, { color: "#fbbf24", intensity: 0.85, t: t });
        },

        // [○] Swing With Bubbles: Rising column of bubbles swings star piñata wide like a pendulum
        o: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.40);
          var bigSway = Math.sin(t * 4.2) * 0.52 * u + 0.18 * u;
          var hubX = 640 + Math.sin(bigSway) * 235;
          var hubY = 264 - Math.abs(Math.sin(bigSway)) * 38;
          drawP07Base(ctx, W, H, resolved, plates, S2, B, {
            sway: bigSway,
            hubX: hubX,
            hubY: hubY,
            choirSpread: 26 * u
          });

          // Intense ballast bubble column erupting from bottom-right & center
          drawCutPaperBubbles(S2, ctx, 702, 16, t, 460, 880, 90, 580, true, "#ffffff");
          B.drawDeterministicParticles(ctx, "bubbles", 660, 565, t, { count: 26, loop: true, seed: 71.3 });
          B.drawDeterministicParticles(ctx, "bubbles", 845, 420, t, { count: 18, loop: true, seed: 79.1 });

          // Curved motion-arc trail lines behind swinging piñata
          ctx.save();
          ctx.strokeStyle = "rgba(251, 250, 247, 0.72)";
          ctx.lineWidth = 4.0;
          ctx.setLineDash([12, 7]);
          ctx.beginPath();
          ctx.arc(640, 490, 245, -Math.PI * 0.76, -Math.PI * 0.24);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();

          drawP07StarPinata(S2, ctx, plates.portholeImg, hubX, hubY, bigSway * 1.15, 1.05, t, { drips: false });
        },

        // [△] Send Party RSVP: Mail Snail rappels down braided hatch string wearing birthday hat
        triangle: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.55);
          var st = drawP07Base(ctx, W, H, resolved, plates, S2, B, {});
          drawP07StarPinata(S2, ctx, plates.portholeImg, st.hubX, st.hubY + 26, st.sway * 0.5, 0.96, t, { drips: false });

          // Top hatch rappel cord + silver slime trail
          var cordX = st.hubX - 42;
          var snailY = lerp(58, st.hubY - 46, u);
          ctx.save();
          ctx.strokeStyle = "#fbfaf5";
          ctx.lineWidth = 6.5;
          ctx.beginPath();
          ctx.moveTo(cordX, 0);
          ctx.lineTo(cordX, st.hubY - 12);
          ctx.stroke();
          ctx.strokeStyle = "#0f8f80";
          ctx.lineWidth = 3.0;
          ctx.stroke();
          ctx.restore();

          B.drawSnailSilverTrail(ctx, cordX, 24, cordX, snailY, u, t, { arc: 0 });
          S2.drawMailSnail(ctx, cordX, snailY, 1.28, t, { rot: Math.PI * 0.46, postcard: true, hasReply: true });

          // Pointed striped birthday party hat on Mail Snail!
          ctx.save();
          ctx.translate(cordX + 18, snailY - 8);
          ctx.rotate(0.35);
          S2.drawCutoutPaperEdge(ctx, [[-12, 8], [0, -28], [12, 8]], "#d42a1e", "#14110d", { paperRim: 2.0, shadow: false });
          drawCutPaperStar(S2, ctx, 0, -30, 8, 3.5, 5, t * 2, "#fde047", null);
          ctx.restore();
        },

        // [□] Poke Piñata Cone: Brass scissor-tongs poke mushy star point, fluttering crepe fringe
        square: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.42);
          var pokeJolt = Math.sin(t * 8.5) * 8 * u;
          var st = drawP07Base(ctx, W, H, resolved, plates, S2, B, { hubX: 618 - 18 * u + pokeJolt * 0.4 });
          drawP07StarPinata(S2, ctx, plates.portholeImg, st.hubX, st.hubY, -0.12 * u + pokeJolt * 0.01, 1.0, t, { drips: false });

          var coneTipX = st.hubX + 104;
          var coneTipY = st.hubY + 42;
          drawBrassScissorTongs(S2, B, ctx, 1020, 590, coneTipX + pokeJolt, coneTipY, 0.75 * u, t, {
            sparks: true,
            seed: 74.2
          });

          // Fluttering loose crepe-paper fringe strips knocked off the poked star cone
          var cols = ["#d42a1e", "#0f8f80", "#f59e0b", "#ec4899", "#2563eb"];
          for (var f = 0; f < 6; f++) {
            var fu = (((t * 0.9) + f * 0.17) % 1);
            var fx = coneTipX + (f - 2.5) * 18 + Math.sin(t * 5 + f) * 14;
            var fy = coneTipY + fu * 135;
            S2.drawCutoutPaperEdge(
              ctx,
              [[fx - 6, fy - 14], [fx + 6, fy - 12], [fx + 9, fy + 14], [fx - 5, fy + 12]],
              cols[f % cols.length],
              "#14110d",
              { paperRim: 1.6, shadow: false }
            );
          }
        }
      },

      outcomes: {
        x: {
          // 1. x.probable: Spiky underwater naval contact mine + Turkey throwing helm hard-over
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var pop = popAmt(resolved, 0.45);
            var st = drawP07Base(ctx, W, H, resolved, plates, S2, B, {
              choirSpread: 44 * pop,
              chain: true,
              notes: false
            });

            B.drawVolumetricBeam(ctx, 195, 595, st.hubX, st.hubY, {
              color: "#f87171",
              coreColor: "#fef2f2",
              spread: 165,
              intensity: 1.15,
              t: t
            });

            ctx.save();
            ctx.translate(st.hubX, st.hubY);
            ctx.scale(pop, pop);
            ctx.rotate(Math.sin(t * 1.8) * 0.06);

            // Pulsing stamp-red naval mine danger rings
            for (var rr = 0; rr < 2; rr++) {
              var rad = 128 + (((t * 54) + rr * 32) % 64);
              ctx.strokeStyle = "rgba(212, 42, 30, 0.62)";
              ctx.lineWidth = 3.4;
              ctx.setLineDash([12, 7]);
              ctx.beginPath();
              ctx.arc(0, 0, rad, 0, TAU);
              ctx.stroke();
            }
            ctx.setLineDash([]);

            // 8 bolted grey-cardboard iron contact horns on split-pins
            for (var hi = 0; hi < 8; hi++) {
              ctx.save();
              ctx.rotate((hi / 8) * TAU);
              S2.drawCardboardPuppetPiece(ctx, [[84, -14], [146, -7], [146, 7], [84, 14]], { tone: "#52565b", ribs: 1 });
              S2.drawCutoutPaperEdge(ctx, [[142, -9], [162, 0], [142, 9]], "#d42a1e", "#14110d", { paperRim: 2, shadow: false });
              S2.drawSplitPin(ctx, 94, 0, 4.2, { metal: "brass" });
              ctx.restore();
            }

            // Riveted iron naval mine sphere
            var poly = [];
            for (var m = 0; m < 14; m++) {
              var ma = (m / 14) * TAU;
              poly.push([Math.cos(ma) * 102, Math.sin(ma) * 102]);
            }
            S2.drawCutoutPaperEdge(ctx, poly, "#3a3e44", "#14110d", { paperRim: 5.0 });
            S2.drawCardboardPuppetPiece(ctx, [[-96, -17], [96, -17], [96, 17], [-96, 17]], {
              tone: "#5c6066",
              ribs: 2,
              pins: [[-68, 0], [-24, 0], [24, 0], [68, 0]]
            });
            ctx.restore();

            // Turkey throwing brass ship's helm wheel hard-over in lower-left!
            S2.drawTurkeyCutawayBadge(ctx, 136, 496, 1.04, t, { dispatch: 0.85 });
            ctx.save();
            ctx.translate(226, 514);
            ctx.rotate(t * -3.6);
            ctx.strokeStyle = "#d4a44c";
            ctx.lineWidth = 6.5;
            ctx.beginPath();
            ctx.arc(0, 0, 34, 0, TAU);
            ctx.stroke();
            for (var sp = 0; sp < 6; sp++) {
              var sa = (sp / 6) * TAU;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(Math.cos(sa) * 44, Math.sin(sa) * 44);
              ctx.stroke();
            }
            S2.drawSplitPin(ctx, 0, 0, 5.0, { metal: "brass" });
            ctx.restore();
          },

          // 2. x.plausible: Rainbow disco choir spotlight show + Brook Trout & Mail Snail
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var st = drawP07Base(ctx, W, H, resolved, plates, S2, B, {
              rainbowNotes: true,
              noteBoost: 1.38,
              choirTempo: 9.5,
              doorFill: "#1e3a5f"
            });

            var beamCols = ["#f59e0b", "#ec4899", "#06b6d4", "#10b981", "#8b5cf6", "#f43f5e"];
            for (var b = 0; b < 6; b++) {
              var ba = t * 1.65 + (b / 6) * TAU;
              B.drawVolumetricBeam(
                ctx,
                st.hubX,
                st.hubY,
                st.hubX + Math.cos(ba) * 480,
                st.hubY + Math.sin(ba) * 320,
                { sourceRadius: 16, spread: 74, color: beamCols[b], intensity: 0.95, t: t + b }
              );
            }

            drawP07StarPinata(S2, ctx, plates.portholeImg, st.hubX, st.hubY, t * 0.85, 1.02, t, { drips: false });
            B.drawDeterministicParticles(ctx, "confetti", st.hubX, st.hubY, t, { count: 28, loop: true, seed: 702.5 });

            // Brook Trout & Mail Snail harmonizing below with disco shades
            var btX = 428;
            var btY = 502 + Math.sin(t * 5.2) * 8;
            S2.drawBrookTrout(ctx, btX, btY, 1.16, t, false);
            S2.drawCutoutPaperEdge(ctx, [[btX - 72, btY - 14], [btX - 42, btY - 14], [btX - 46, btY - 1], [btX - 68, btY - 1]], "#ec4899", "#14110d", { paperRim: 1.8, shadow: false });
            S2.drawMailSnail(ctx, 818, 536 + Math.cos(t * 5.2) * 5, 1.24, t, { flip: true, hasReply: true });
          },

          // 3. x.preposterous: Glowing paper-mâché supernova core under 3-eyed Alien Saucer
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var pop = popAmt(resolved, 0.45);
            var st = drawP07Base(ctx, W, H, resolved, plates, S2, B, {
              choirFloatY: -18,
              rainbowNotes: true,
              doorFill: "#2a1b3d"
            });

            S2.drawAlienSaucer(ctx, 640, 102, 1.18, t, st.hubX, st.hubY + 20);
            B.drawTractorRings(ctx, 640, 122, st.hubX, st.hubY + 20, t, { spread: 145, rings: 5 });

            var coreY = st.hubY + 22;
            B.drawLanternHalo(ctx, st.hubX, coreY, 225 * pop, { color: "#f43f5e", coreColor: "#fef08a", intensity: 1.45, t: t });

            // Blazing cut-paper solar prominence flares radiating from piñata seams
            for (var fl = 0; fl < 10; fl++) {
              var fa = t * -1.3 + (fl / 10) * TAU;
              var rIn = 78;
              var rOut = (158 + (fl % 2) * 34) * pop;
              S2.drawCutoutPaperEdge(
                ctx,
                [
                  [st.hubX + Math.cos(fa - 0.16) * rIn, coreY + Math.sin(fa - 0.16) * rIn],
                  [st.hubX + Math.cos(fa) * rOut, coreY + Math.sin(fa) * rOut],
                  [st.hubX + Math.cos(fa + 0.16) * rIn, coreY + Math.sin(fa + 0.16) * rIn]
                ],
                fl % 2 === 0 ? "#fde047" : "#ec4899",
                "#14110d",
                { paperRim: 2.2, shadow: false }
              );
            }

            drawP07StarPinata(S2, ctx, plates.portholeImg, st.hubX, coreY, t * 1.1, 0.92, t, { drips: false });
            drawCutPaperStar(S2, ctx, st.hubX, coreY, 54, 24, 6, -t * 2.2, "#fffbeb", "brass");
            B.drawDeterministicParticles(ctx, "confetti", st.hubX, coreY, t, { count: 26, loop: true, seed: 703.9 });
          }
        },

        o: {
          // 4. o.probable: Swinging pendulum wrecking-ball boops foreground porthole glass!
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var boop = 0.85 + Math.abs(Math.sin(t * 4.4)) * 0.34;
            var st = drawP07Base(ctx, W, H, resolved, plates, S2, B, {
              hubX: 640 + Math.sin(t * 2.2) * 32,
              hubY: 300,
              choirSpread: 38
            });
            drawCutPaperBubbles(S2, ctx, 704, 14, t, 380, 900, 100, 560, true, "#ffffff");

            // Squishy radially-splayed crepe-paper impact splat on outer porthole glass!
            var splatPts = [];
            for (var s = 0; s < 16; s++) {
              var sa = (s / 16) * TAU;
              var sr = (s % 2 === 0 ? 195 : 138) * clamp(boop, 0.8, 1.15);
              splatPts.push([st.hubX + Math.cos(sa) * sr, st.hubY + Math.sin(sa) * sr * 0.88]);
            }
            S2.drawCutoutPaperEdge(ctx, splatPts, "rgba(253, 224, 71, 0.55)", "#d42a1e", { paperRim: 3.5, shadow: false });

            drawP07StarPinata(S2, ctx, plates.portholeImg, st.hubX, st.hubY, Math.sin(t * 5.0) * 0.08, 1.34 * clamp(boop, 0.88, 1.12), t, {
              drips: true
            });

            // Concentric glass boop ripple rings
            ctx.save();
            ctx.strokeStyle = "rgba(255,255,255,0.75)";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(st.hubX, st.hubY, 205, 0, TAU);
            ctx.stroke();
            ctx.restore();

            // Startled Turkey with rattling brass periscope in lower-left
            S2.drawTurkeyCutawayBadge(ctx, 136, 498 + Math.sin(t * 16) * 4, 1.04, t, { dispatch: 0.7 });
            S2.drawCardboardPuppetPiece(ctx, [[126, 376], [148, 376], [148, 438], [182, 438], [182, 456], [126, 456]], {
              tone: "#c99535",
              ribs: 1,
              pin: { x: 137, y: 438, r: 4.0, metal: "brass" }
            });
          },

          // 5. o.plausible: Noisy brass birthday kazoo band (FEATURED IN SHOWCASE @ 11.8s!)
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var pop = popAmt(resolved, 0.42);
            var st = drawP07Base(ctx, W, H, resolved, plates, S2, B, {
              hubX: 648,
              hubY: 274,
              rainbowNotes: true,
              noteBoost: 1.3
            });

            drawCutPaperBubbles(S2, ctx, 705, 16, t, 470, 830, 110, 565, true, "#ffffff");
            B.drawDeterministicParticles(ctx, "bubbles", 648, 470, t, { count: 22, loop: true, seed: 705.2 });
            B.drawDeterministicParticles(ctx, "confetti", 648, 260, t, { count: 20, loop: true, seed: 705.8 });

            drawP07StarPinata(S2, ctx, plates.portholeImg, st.hubX, st.hubY, Math.sin(t * 3.8) * 0.08, 0.95, t, {
              streamers: false,
              drips: false
            });

            // 5 buzzing brass-and-kraft kazoos sticking out of all 5 star points!
            var starAngles = [-Math.PI * 0.5, -0.28, 0.88, Math.PI - 0.88, Math.PI + 0.28];
            for (var k = 0; k < 5; k++) {
              var ka = starAngles[k] + Math.sin(t * 3.8) * 0.08;
              var kx = st.hubX + Math.cos(ka) * 116 * pop;
              var ky = st.hubY + Math.sin(ka) * 116 * pop;
              drawBrassKazoo(S2, ctx, kx, ky, 0.92 * pop, ka, t, k);
            }

            // Party-hatted Brook Trout conducting with brass baton + Mail Snail courier!
            var btX = 398;
            var btY = 486 + Math.sin(t * 4.6) * 7;
            S2.drawBrookTrout(ctx, btX, btY, 1.18, t, true);
            S2.drawCutoutPaperEdge(ctx, [[btX + 36, btY - 22], [btX + 58, btY - 76], [btX + 78, btY - 18]], "#d42a1e", "#14110d", { paperRim: 2.4 });
            // Conductor baton waving
            ctx.save();
            ctx.translate(btX + 86, btY + 4);
            ctx.rotate(-0.4 + Math.sin(t * 8.0) * 0.55);
            ctx.strokeStyle = "#fbfaf7";
            ctx.lineWidth = 5.0;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(58, -28);
            ctx.stroke();
            ctx.restore();

            S2.drawMailSnail(ctx, 842, 534 + Math.sin(t * 4.2) * 4, 1.24, t, { flip: true, hasReply: true, postcard: true });
          },

          // 6. o.preposterous: Spinning pinwheel space-station docking ring locking onto Alien Saucer
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var pop = enterAmt(resolved, 0.50);
            var dockY = lerp(285, 224, pop);
            drawP07Base(ctx, W, H, resolved, plates, S2, B, {
              hubX: 640,
              hubY: dockY,
              choirFloatY: -20,
              rope: false
            });

            B.drawTractorRings(ctx, 640, 142, 640, dockY + 40, t, { spread: 165, rings: 5 });

            // Horizontal perspective-flattened spinning rainbow pinwheel docking station!
            ctx.save();
            ctx.translate(640, dockY);
            ctx.scale(1.28, 0.46);
            drawP07StarPinata(S2, ctx, plates.portholeImg, 0, 0, t * 2.8, 1.15, t, { streamers: false, drips: false });
            for (var cl = 0; cl < 5; cl++) {
              var ca = t * 2.8 + (cl / 5) * TAU;
              drawCutPaperStar(S2, ctx, Math.cos(ca) * 142, Math.sin(ca) * 142, 18, 9, 4, ca, "#34d399", "brass");
            }
            ctx.restore();

            // Descending 3-eyed Alien Saucer locking directly onto upper docking ring
            S2.drawAlienSaucer(ctx, 640, lerp(96, 152, pop), 1.24, t, false, false);
            B.drawDeterministicParticles(ctx, "bubbles", 640, 480, t, { count: 18, loop: true, seed: 706.4 });
          }
        },

        triangle: {
          // 7. triangle.probable: Safety inspector Mail Snail ties giant emerald check-tag onto horn
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var pop = popAmt(resolved, 0.45);
            var st = drawP07Base(ctx, W, H, resolved, plates, S2, B, { hubX: 640, hubY: 256 });
            drawP07StarPinata(S2, ctx, plates.portholeImg, st.hubX, st.hubY, st.sway * 0.4, 0.98, t, { drips: false });

            // Giant swinging emerald safety-inspection luggage tag with crisp vector checkmark (0 text!)
            var tagX = st.hubX + 26;
            var tagY = st.hubY + 148;
            ctx.save();
            ctx.translate(tagX, tagY - 42);
            ctx.rotate(Math.sin(t * 3.0) * 0.12);
            ctx.scale(pop, pop);
            S2.drawCutoutPaperEdge(
              ctx,
              [[-44, 18], [-22, 0], [22, 0], [44, 18], [44, 118], [-44, 118]],
              "#10b981",
              "#14110d",
              { paperRim: 4.0 }
            );
            S2.drawSplitPin(ctx, 0, 16, 4.8, { metal: "brass" });
            // Bold white vector checkmark circle on tag
            ctx.fillStyle = "#fbfaf7";
            ctx.strokeStyle = "#14110d";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(0, 68, 26, 0, TAU);
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = "#065f46";
            ctx.lineWidth = 6.0;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(-13, 68);
            ctx.lineTo(-3, 79);
            ctx.lineTo(15, 56);
            ctx.stroke();
            ctx.restore();

            S2.drawMailSnail(ctx, st.hubX - 68, st.hubY + 108, 1.24, t, { postcard: true });
            // Relieved Turkey puffing white sigh clouds
            S2.drawTurkeyCutawayBadge(ctx, 136, 496, 1.04, t, { dispatch: 0.4 });
            for (var pc = 0; pc < 3; pc++) {
              var pu = (((t * 0.8) + pc * 0.33) % 1);
              drawCutPaperStar(S2, ctx, 206 + pu * 72, 466 - pu * 38, 14 * (1 - pu * 0.4), 9 * (1 - pu * 0.4), 6, t + pc, "#fbfaf7", null);
            }
          },

          // 8. triangle.plausible: Trapdoor opens in piñata so Mail Snail hands Brook Trout birthday card
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var pop = popAmt(resolved, 0.45);
            var st = drawP07Base(ctx, W, H, resolved, plates, S2, B, { hubX: 640, hubY: 244, rainbowNotes: true });
            drawP07StarPinata(S2, ctx, plates.portholeImg, st.hubX, st.hubY, 0, 0.96, t, { drips: false });

            // Hinged belly trapdoor swung open on split-pins
            ctx.save();
            ctx.translate(st.hubX - 58, st.hubY + 86);
            ctx.rotate(0.75 * clamp(pop, 0, 1.1));
            S2.drawCardboardPuppetPiece(ctx, [[0, -10], [116, -10], [110, 26], [6, 26]], {
              tone: "#d99e3b",
              ribs: 2,
              pin: { x: 4, y: 4, r: 4.5, metal: "brass" }
            });
            ctx.restore();

            // Showering gold paper stars from trapdoor
            for (var si = 0; si < 7; si++) {
              var su = (((t * 0.75) + si * 0.14) % 1);
              drawCutPaperStar(
                S2,
                ctx,
                st.hubX - 75 + si * 26 + Math.sin(t * 4 + si) * 10,
                st.hubY + 95 + su * 175,
                13,
                5.5,
                5,
                t * 2 + si,
                si % 2 === 0 ? "#fde047" : "#34d399",
                null
              );
            }

            // Unfolded waterproof pop-up birthday card (crimson heart/star emblem, 0 text!) between Mail Snail & Brook Trout
            var cardX = 636;
            var cardY = 446 + Math.sin(t * 3.6) * 5;
            S2.drawCutoutPaperEdge(ctx, [[cardX - 46, cardY - 34], [cardX, cardY - 42], [cardX + 46, cardY - 34], [cardX + 46, cardY + 34], [cardX, cardY + 26], [cardX - 46, cardY + 34]], "#fbfaf7", "#14110d", { paperRim: 3.0 });
            drawCutPaperStar(S2, ctx, cardX - 22, cardY - 2, 14, 6, 5, 0.2, "#d42a1e", null);
            drawCutPaperStar(S2, ctx, cardX + 22, cardY - 2, 14, 6, 5, -0.2, "#0f8f80", null);

            S2.drawMailSnail(ctx, 536, 462, 1.26, t, { hasReply: true, postcard: false });
            S2.drawBrookTrout(ctx, 812, 452 + Math.sin(t * 3.2) * 6, 1.20, t, false);
          },

          // 9. triangle.preposterous: Alien diplomats trade space taffy along Snail's silver trail (SHOWCASE FINALE @ 16.0s!)
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var u = enterAmt(resolved, 0.45);
            var st = drawP07Base(ctx, W, H, resolved, plates, S2, B, {
              hubX: 640,
              hubY: 318,
              choirFloatY: -16,
              rainbowNotes: true,
              doorFill: "#1d2d44"
            });

            S2.drawAlienSaucer(ctx, 640, 104, 1.22, t, 640, 320);
            B.drawTractorRings(ctx, 640, 126, 640, 340, t, { spread: 155, rings: 5 });

            drawP07StarPinata(S2, ctx, plates.portholeImg, st.hubX, st.hubY, Math.sin(t * 2.0) * 0.12, 0.88, t, { drips: false });

            // Glowing dual S-curve silver slime trails linking Choir Trout <-> Saucer!
            B.drawSnailSilverTrail(ctx, 355, 390, 615, 134, u, t, { arc: 65, width: 6.5 });
            B.drawSnailSilverTrail(ctx, 925, 390, 665, 134, u, t + 1.2, { arc: -65, width: 6.5 });

            // 8 Wrapped iridescent foil space-taffy bonbons spiraling up & down between fish & Saucer!
            var taffyCols = ["#ec4899", "#06b6d4", "#f59e0b", "#a855f7", "#10b981", "#f43f5e", "#38bdf8", "#fde047"];
            for (var b = 0; b < 8; b++) {
              var bu = (((t * 0.36) + b / 8) % 1);
              var bx = 640 + Math.sin(bu * TAU * 1.5 + b) * 195 * (1 - bu * 0.55);
              var by = lerp(455, 136, bu);
              drawCandyBonbon(S2, ctx, bx, by, 0.96, t * 2.1 + b, taffyCols[b], true);
            }

            // Mail Snail diplomat ascending mid-beam wearing brass antenna halo
            var snY = lerp(380, 198, 0.5 + 0.38 * Math.sin(t * 1.9));
            S2.drawMailSnail(ctx, 640 + Math.cos(t * 2.1) * 38, snY, 1.28, t, {
              rot: -Math.PI * 0.38,
              hasReply: true,
              hasAlienStamp: true
            });
          }
        },

        square: {
          // 10. square.probable: Brass tongs squish mushy soggy newspaper dud horn + grinning Turkey
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var u = enterAmt(resolved, 0.42);
            var st = drawP07Base(ctx, W, H, resolved, plates, S2, B, { hubX: 610, hubY: 278 });
            drawP07StarPinata(S2, ctx, plates.portholeImg, st.hubX, st.hubY, -0.08, 0.96, t, { drips: true });

            // Accordion-crumpled soggy grey newspaper dud horn on right side of piñata
            var hx = st.hubX + 86;
            var hy = st.hubY + 26;
            for (var p = 0; p < 4; p++) {
              var px0 = hx + p * 14 * (1 - 0.35 * u);
              S2.drawCardboardPuppetPiece(
                ctx,
                [[px0, hy - 26 + p * 3], [px0 + 16, hy - 18 + p * 3], [px0 + 14, hy + 24 - p * 3], [px0 - 2, hy + 28 - p * 3]],
                { tone: p % 2 === 0 ? "#9ca3af" : "#cbd5e1", ribs: 1, shadow: false }
              );
            }
            drawBrassScissorTongs(S2, B, ctx, 1020, 588, hx + 44, hy + 4, 0.92, t, { sparks: false });
            B.drawDeterministicParticles(ctx, "ink_puffs", hx + 32, hy, t, { count: 14, loop: true, seed: 710.3, color: "#94a3b8" });
            S2.drawTurkeyCutawayBadge(ctx, 136, 496, 1.04, t, { dispatch: 0.5 });
          },

          // 11. square.plausible: Piñata splits into two hinged halves raining striped peppermints to Brook Trout!
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var split = 0.44 * enterAmt(resolved, 0.40);
            var st = drawP07Base(ctx, W, H, resolved, plates, S2, B, { hubX: 640, hubY: 238, rainbowNotes: true });
            var pImg = plates.portholeImg;

            // Left & right hinged star halves swung open!
            ctx.save();
            ctx.translate(st.hubX, st.hubY - 82);
            ctx.save();
            ctx.rotate(split);
            S2.drawScissorCutout(ctx, pImg, 228, 198, 95, 210, -138, 0, 138, 250, null, { haloWidth: 4.5, stroke: "#14110d" });
            ctx.restore();
            ctx.save();
            ctx.rotate(-split);
            S2.drawScissorCutout(ctx, pImg, 323, 198, 95, 210, 0, 0, 138, 250, null, { haloWidth: 4.5, stroke: "#14110d" });
            ctx.restore();
            S2.drawSplitPin(ctx, 0, 8, 5.8, { metal: "brass" });
            ctx.restore();

            drawBrassScissorTongs(S2, B, ctx, 1030, 588, st.hubX + 118, st.hubY + 34, 0.35, t, { sparks: true, seed: 711.4 });

            // Jackpot cascade of 12 red-and-white striped peppermints!
            for (var c = 0; c < 12; c++) {
              var cu = (((t * 0.68) + c / 12) % 1);
              var cx = st.hubX + (hash(c * 13.7) - 0.5) * 320;
              var cy = st.hubY + 40 + cu * 285;
              drawCandyBonbon(S2, ctx, cx, cy, 0.95, t * 3 + c, c % 2 === 0 ? "#d42a1e" : "#0f8f80", true);
            }

            S2.drawBrookTrout(ctx, 476, 496 + Math.sin(t * 4.5) * 7, 1.20, t, true);
            S2.drawMailSnail(ctx, 796, 534, 1.24, t, { flip: true, hasReply: true });
          },

          // 12. square.preposterous: Candy-stuffed miniature 3-eyed Alien Mothership hatches from peeled star petals!
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var pop = popAmt(resolved, 0.48);
            var st = drawP07Base(ctx, W, H, resolved, plates, S2, B, {
              hubX: 640,
              hubY: 326,
              choirFloatY: -18,
              doorFill: "#231942"
            });

            // Parent Alien Saucer above + tractor beam
            S2.drawAlienSaucer(ctx, 640, 96, 1.12, t, 640, 290);
            B.drawTractorRings(ctx, 640, 118, 640, 290, t, { spread: 135, rings: 4 });

            // 5 symmetrically peeled rainbow star petals on brass split-pins
            var pCols = ["#d42a1e", "#f59e0b", "#10b981", "#2563eb", "#a855f7"];
            for (var pt = 0; pt < 5; pt++) {
              var pa = -Math.PI * 0.5 + (pt / 5) * TAU + 0.62;
              ctx.save();
              ctx.translate(st.hubX + Math.cos(pa) * 58, st.hubY + Math.sin(pa) * 58);
              ctx.rotate(pa + 0.55 * clamp(pop, 0, 1.2));
              S2.drawCutoutPaperEdge(ctx, [[0, -28], [112, 0], [0, 28]], pCols[pt], "#14110d", { paperRim: 3.0 });
              S2.drawSplitPin(ctx, 6, 0, 4.4, { metal: "brass" });
              ctx.restore();
            }

            // Newly hatched glowing baby 3-eyed chrome saucer rising out of the center + orbiting bonbons!
            var babyY = st.hubY - 46 * clamp(pop, 0, 1.1) + Math.sin(t * 3.5) * 8;
            B.drawLanternHalo(ctx, st.hubX, babyY, 125, { color: "#34d399", intensity: 1.1, t: t });
            S2.drawAlienSaucer(ctx, st.hubX, babyY, 0.86 * clamp(pop, 0.2, 1.1), t * 1.4, false, false);

            for (var ob = 0; ob < 6; ob++) {
              var oa = t * 2.2 + (ob / 6) * TAU;
              drawCandyBonbon(S2, ctx, st.hubX + Math.cos(oa) * 156, babyY + Math.sin(oa) * 64, 0.88, oa, pCols[ob % 5], true);
            }
            drawBrassScissorTongs(S2, B, ctx, 1045, 590, st.hubX + 142, st.hubY + 72, 0.25, t, { sparks: false });
          }
        }
      }
    });
  }

  /* ==========================================================================
   * PORTHOLE #08 · GAUGE ("perec-stage" · p08.jpg + atlas-16.webp)
   * Root: Golden spiral snail crawling on glass over a submerged creek map
   * ========================================================================== */

  function drawP08Base(ctx, W, H, resolved, plates, S, B, cfg) {
    var opts = cfg || {};
    var t = resolved.t;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    var pDeepX = px(S, 0.18, resolved);
    var pDeepY = py(S, 0.18, resolved);
    var pMapX = px(S, 0.44, resolved);
    var pMapY = py(S, 0.44, resolved);

    // 1. Deep Norstein Recess: Cyan command-bridge target screen (atlas-16.webp)
    S.drawScissorCutout(
      ctx, aImg,
      55, 32, 630, 480,
      246 + pDeepX, 96 + pDeepY, 788, 470,
      [[0.04, 0.04], [0.96, 0.03], [0.98, 0.95], [0.03, 0.96]],
      { filter: opts.atlasFilter || "cyan", haloWidth: 4.0, alpha: 0.88 }
    );
    S.drawNorsteinFog(ctx, W, 620, t, opts.fogAlpha != null ? opts.fogAlpha : 0.22, "218, 232, 230");
    if (B) {
      B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.16, color: "#99f6e4" });
    }

    // 2. Mid Plane: Scissor-Cut Torn Parchment River Map & Peeking Creek Trout from p08.jpg
    var mapX = 365 + pMapX;
    var mapY = 112 + pMapY;
    if (opts.showMap !== false) {
      S.drawScissorCutout(
        ctx, pImg,
        118, 116, 408, 412,
        mapX, mapY, 495, 445,
        [
          [0.14, 0.04], [0.58, 0.02], [0.76, 0.22], [0.94, 0.62],
          [0.82, 0.95], [0.42, 0.97], [0.16, 0.78], [0.04, 0.36]
        ],
        {
          rot: -0.05 + Math.sin(t * 0.65) * 0.02,
          haloWidth: 5.0,
          stroke: "#14110d",
          alpha: opts.mapAlpha != null ? opts.mapAlpha : 0.96
        }
      );
    }

    if (opts.peekingTrout !== false) {
      S.drawScissorCutout(
        ctx, pImg,
        396, 154, 130, 102,
        836 + pMapX * 1.15, 132 + Math.sin(t * 2.2) * 5, 198, 152,
        null,
        { haloWidth: 4.2, stroke: "#14110d" }
      );
    }

    // Brass Gauge Window Vernier Ticks along Left & Right Sandstone Jambs (0 text!)
    ctx.save();
    ctx.strokeStyle = "#d4a44c";
    ctx.lineWidth = 2.2;
    for (var gy = 120; gy <= 545; gy += 24) {
      var tw = (gy % 72 === 0) ? 22 : 11;
      ctx.beginPath();
      ctx.moveTo(176, gy); ctx.lineTo(176 + tw, gy);
      ctx.moveTo(1104, gy); ctx.lineTo(1104 - tw, gy);
      ctx.stroke();
    }
    ctx.restore();

    return { mapX: mapX, mapY: mapY, snailX: 505 + px(S, 0.78, resolved) * 0.5, snailY: 226 + py(S, 0.78, resolved) * 0.4 };
  }

  function drawP08WildGlassSnail(S, ctx, pImg, x, y, w, h, rot, opts) {
    var cfg = opts || {};
    S.drawScissorCutout(
      ctx, pImg,
      248, 248, 200, 168,
      x, y, w || 288, h || 242,
      [
        [0.04, 0.24], [0.28, 0.05], [0.74, 0.14], [0.95, 0.42],
        [0.96, 0.88], [0.62, 0.94], [0.22, 0.68]
      ],
      {
        rot: rot || 0,
        haloWidth: cfg.haloWidth != null ? cfg.haloWidth : 5.2,
        stroke: "#14110d",
        filter: cfg.filter || "none",
        alpha: cfg.alpha != null ? cfg.alpha : 1.0
      }
    );
    S.drawSplitPin(ctx, x + (w || 288) * 0.64, y + (h || 242) * 0.54, 5.0, { metal: "brass" });
  }

  function drawGlassSpecularBars(ctx) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.20)";
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(275, 545); ctx.lineTo(535, 108);
    ctx.moveTo(330, 545); ctx.lineTo(590, 108);
    ctx.stroke();
    ctx.restore();
  }

  function registerPortal08(B, S) {
    B.definePortalGame(8, {
      drawBackdrop: makeBackdropFn(8, { openX: 175, openY: 82, openW: 930, openH: 506 }),
      drawForeground: function (ctx, W, H, resolved, plates, S2) {
        drawCornerBrassPortholeFrame(S2, ctx, W, H, resolved);
      },

      drawRoot: function (ctx, W, H, resolved, plates, S2) {
        var t = resolved.t;
        var st = drawP08Base(ctx, W, H, resolved, plates, S2, B, {});
        drawCutPaperBubbles(S2, ctx, 8, 6, t, 260, 980, 110, 540, false, "#dceee9");
        var gx = st.snailX - Math.sin(t * 0.9) * 18;
        var gy = st.snailY - Math.cos(t * 0.9) * 10;
        B.drawSnailSilverTrail(ctx, gx + 255, gy + 205, gx + 90, gy + 112, 1.0, t, { width: 8, arc: -10 });
        drawP08WildGlassSnail(S2, ctx, plates.portholeImg, gx, gy, 292, 244, 0, {});
        drawGlassSpecularBars(ctx);
        drawRootHotspotLandmarks(S2, B, ctx, resolved);
      },

      stems: {
        // [✕] Backlight Glass Map: Interior lamp casts enormous macro shadow of snail across parchment map
        x: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.45);
          var st = drawP08Base(ctx, W, H, resolved, plates, S2, B, {});

          B.drawVolumetricBeam(ctx, 190, 585, 620, 310, {
            color: "#fde68a",
            coreColor: "#fffbeb",
            spread: 235 * u,
            intensity: 1.3 * u,
            t: t
          });

          // Enormous dark-sepia macro silhouette shadow cast onto the parchment map!
          ctx.save();
          ctx.translate(455 - 22 * u, 165 - 12 * u);
          ctx.scale(1.42 * (0.6 + 0.4 * u), 1.42 * (0.6 + 0.4 * u));
          ctx.globalAlpha = 0.46 * u;
          S2.drawCardboardPuppetPiece(
            ctx,
            [[10, 70], [65, 18], [185, 32], [255, 115], [235, 195], [125, 205], [40, 138]],
            { tone: "#1c1917", ribs: 3, shadow: false }
          );
          ctx.restore();

          drawP08WildGlassSnail(S2, ctx, plates.portholeImg, st.snailX + 18, st.snailY + 12, 276, 232, 0, {});
          B.drawLanternHalo(ctx, st.snailX + 165, st.snailY + 125, 140 * u, { color: "#fbbf24", intensity: 0.75, t: t });
          drawGlassSpecularBars(ctx);
        },

        // [○] Wipe With Current: Exterior water jet ripples fog, snail hunkers tightly onto glass
        o: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.40);
          var st = drawP08Base(ctx, W, H, resolved, plates, S2, B, { fogAlpha: 0.36 });

          // Sweeping exterior water jet ribbons from right jamb across outer glass
          for (var j = 0; j < 5; j++) {
            var jy = 210 + j * 56 + Math.sin(t * 6.0 + j) * 14;
            ctx.save();
            ctx.strokeStyle = j % 2 === 0 ? "rgba(224, 242, 254, 0.82)" : "rgba(56, 189, 248, 0.65)";
            ctx.lineWidth = 6.5 - j * 0.7;
            ctx.beginPath();
            ctx.moveTo(1090, jy);
            ctx.quadraticCurveTo(760, jy - 28 * Math.sin(t * 4 + j), 310, jy + 18);
            ctx.stroke();
            ctx.restore();
          }
          B.drawDeterministicParticles(ctx, "bubbles", 845, 295, t, { count: 24, loop: true, seed: 802.1 });

          // Suction-foot ring + hunkered compressed golden shell
          ctx.save();
          ctx.strokeStyle = "#fef08a";
          ctx.lineWidth = 4.0;
          ctx.setLineDash([9, 5]);
          ctx.beginPath();
          ctx.ellipse(st.snailX + 148, st.snailY + 142, 128 * u, 68 * u, -0.25, 0, TAU);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();

          drawP08WildGlassSnail(S2, ctx, plates.portholeImg, st.snailX + 12, st.snailY + 26, 286, 212, -0.06 * u, {});
        },

        // [△] Call Cousin Snail: Official Mail Snail slides up inside rim & taps antennas nose-to-nose!
        triangle: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.50);
          var st = drawP08Base(ctx, W, H, resolved, plates, S2, B, {});

          drawP08WildGlassSnail(S2, ctx, plates.portholeImg, 548, 228, 282, 236, 0, {});

          var mailX = lerp(235, 488, u);
          var mailY = lerp(520, 308, u);
          B.drawSnailSilverTrail(ctx, 225, 530, mailX - 20, mailY + 12, u, t, { arc: 24 });
          S2.drawMailSnail(ctx, mailX, mailY, 1.48, t, { rot: -0.22, postcard: true, hasReply: true });

          // Antenna boop spark ring right where their eyestalks touch across the glass!
          if (u > 0.65) {
            drawCutPaperStar(S2, ctx, 542, 286, 20 + Math.sin(t * 10) * 4, 8, 6, t * 3, "#34d399", null);
          }
          drawGlassSpecularBars(ctx);
        },

        // [□] Tap Glass Gently: Brass probe taps pane, making snail's two eyestalks swivel like radar
        square: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.42);
          var st = drawP08Base(ctx, W, H, resolved, plates, S2, B, {});

          drawP08WildGlassSnail(S2, ctx, plates.portholeImg, st.snailX, st.snailY, 286, 240, 0, {});

          // Oversized swiveling radar eyestalks popping tall from snail head!
          var headX = st.snailX + 68;
          var headY = st.snailY + 72;
          for (var e = -1; e <= 1; e += 2) {
            var swiv = Math.sin(t * 7.5 + e * 1.4) * 22 * u;
            var ex = headX + e * 18 + swiv;
            var ey = headY - 58 * u;
            ctx.strokeStyle = "#14110d";
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.moveTo(headX + e * 8, headY);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            drawCutPaperStar(S2, ctx, ex, ey, 14, 7, 8, t * 2, "#fef08a", "brass");
          }

          // Brass probe tapping glass + crystal acoustic ripple rings
          var tapX = 812;
          var tapY = 428;
          drawBrassScissorTongs(S2, B, ctx, 1060, 590, tapX + Math.sin(t * 9) * 8, tapY, 0.85, t, { sparks: true, seed: 804.4 });
          for (var r = 0; r < 3; r++) {
            var rr = 22 + (((t * 78) + r * 28) % 84);
            ctx.strokeStyle = "rgba(251, 191, 36, 0.68)";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(tapX, tapY, rr, 0, TAU);
            ctx.stroke();
          }
        }
      },

      outcomes: {
        x: {
          // 1. x.probable: 6-legged split-pin cardboard beetle chomping holes in our treasure map! (SHOWCASE @ 6.0s!)
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var st = drawP08Base(ctx, W, H, resolved, plates, S2, B, {});
            B.drawVolumetricBeam(ctx, 190, 585, 595, 325, { color: "#fbbf24", spread: 210, intensity: 1.15, t: t });

            var bugX = st.snailX - 16 + Math.sin(t * 6.5) * 4;
            var bugY = st.snailY + 8;

            // Munched scalloped bite-holes chewed right out of the parchment treasure map!
            var bites = [[bugX - 22, bugY + 95, 32], [bugX + 8, bugY + 122, 27], [bugX - 44, bugY + 68, 25], [bugX - 8, bugY + 46, 20]];
            for (var bi = 0; bi < bites.length; bi++) {
              ctx.fillStyle = "#1e3a4c";
              ctx.strokeStyle = "#fbfaf5";
              ctx.lineWidth = 4.0;
              ctx.beginPath();
              ctx.arc(bites[bi][0], bites[bi][1], bites[bi][2], 0, TAU);
              ctx.fill();
              ctx.stroke();
            }

            // 6 Scrabbling Two-Bone IK Cardboard Beetle Legs!
            for (var li = 0; li < 6; li++) {
              var side = li < 3 ? 1 : -1;
              var idx = li % 3;
              var hipX = bugX + 108 + idx * 44;
              var hipY = bugY + (side > 0 ? 152 : 68) + idx * 10;
              var stepX = hipX - 36 + Math.sin(t * 9.5 + li * 1.6) * 20;
              var stepY = hipY + side * (58 + Math.cos(t * 9.5 + li * 1.6) * 14);
              drawIKLimb(S2, ctx, hipX, hipY, 46, 44, stepX, stepY, side, {
                r1: 7.5,
                r2: 6.0,
                tone1: "#4a4036",
                tone2: "#6b5b4d",
                metal: "silver"
              });
            }

            drawP08WildGlassSnail(S2, ctx, plates.portholeImg, bugX, bugY, 284, 238, 0, {});

            // Snapping hinged cardboard beetle mandibles on brass split-pins!
            var chomp = Math.abs(Math.sin(t * 9.5)) * 0.40;
            for (var m = 0; m < 2; m++) {
              ctx.save();
              ctx.translate(bugX + 40, bugY + 76 + m * 20);
              ctx.rotate((m === 0 ? -0.55 - chomp : -0.32 + chomp));
              S2.drawCardboardPuppetPiece(ctx, [[0, -8], [-64, m === 0 ? -24 : 24], [-44, 0], [0, 8]], {
                tone: "#292524",
                ribs: 1,
                pin: { x: 0, y: 0, r: 4.2, metal: "brass" }
              });
              ctx.restore();
            }

            // Flying chewed parchment crumbs + yelping Turkey!
            for (var ci = 0; ci < 6; ci++) {
              var cu = (((t * 2.3) + ci * 0.17) % 1);
              var cx = bugX - 24 - cu * 75;
              var cy = bugY + 78 + cu * cu * 82 - cu * 24 + ci * 7;
              S2.drawCutoutPaperEdge(ctx, [[cx, cy], [cx + 12, cy - 5], [cx + 9, cy + 9]], "#efe5cc", "#14110d", { paperRim: 1.5, shadow: false });
            }
            S2.drawTurkeyCutawayBadge(ctx, 132, 496, 1.04, t, { dispatch: 0.9 });
          },

          // 2. x.plausible: Giant blinking eyeball behind the glass + Brook Trout & Mail Snail
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            drawP08Base(ctx, W, H, resolved, plates, S2, B, { mapAlpha: 0.82 });

            var eyeCX = 588;
            var eyeCY = 332;
            var blink = clamp(1 - Math.pow(Math.max(0, Math.sin(t * 2.0)), 14) * 0.90, 0.10, 1.0);

            S2.drawScissorCutout(ctx, plates.portholeImg, 310, 272, 132, 128, eyeCX - 142, eyeCY - 142, 284, 284, null, { haloWidth: 5.0 });

            // Hinged cardboard eyelashes top & bottom
            for (var ei = -3; ei <= 3; ei++) {
              var ea = -Math.PI * 0.5 + ei * 0.25;
              var lx = eyeCX + Math.cos(ea) * 130;
              var ly = eyeCY + Math.sin(ea) * 112 * blink;
              S2.drawCardboardPuppetPiece(
                ctx,
                [[lx - 6, ly], [lx + Math.cos(ea) * 38, ly + Math.sin(ea) * 38], [lx + 6, ly]],
                { tone: "#1f1d1b", ribs: 1, shadow: false }
              );
            }

            ctx.save();
            ctx.translate(eyeCX, eyeCY);
            ctx.scale(1, blink);
            var sclera = [];
            for (var s = 0; s < 16; s++) {
              var sa = (s / 16) * TAU;
              sclera.push([Math.cos(sa) * 128, Math.sin(sa) * 106]);
            }
            S2.drawCutoutPaperEdge(ctx, sclera, "#fbfaf7", "#14110d", { paperRim: 5.0 });

            var gx = Math.sin(t * 2.2) * 28 + 18;
            var gy = Math.cos(t * 1.7) * 14;
            var iris = [];
            for (var ip = 0; ip < 14; ip++) {
              var ia = (ip / 14) * TAU;
              iris.push([gx + Math.cos(ia) * 58, gy + Math.sin(ia) * 58]);
            }
            S2.drawCutoutPaperEdge(ctx, iris, "#0f8f80", "#14110d", { paperRim: 2.5, shadow: false });
            ctx.fillStyle = "#d99e3b";
            ctx.beginPath(); ctx.arc(gx, gy, 38, 0, TAU); ctx.fill();
            ctx.fillStyle = "#14110d";
            ctx.beginPath(); ctx.arc(gx, gy, 22, 0, TAU); ctx.fill();
            ctx.fillStyle = "#fbfaf7";
            ctx.beginPath(); ctx.arc(gx - 9, gy - 9, 8, 0, TAU); ctx.fill();
            ctx.restore();

            S2.drawBrookTrout(ctx, 886, 412 + Math.sin(t * 2.6) * 6, 1.18, t, false);
            S2.drawMailSnail(ctx, 326, 532, 1.22, t, { hasReply: true });
          },

          // 3. x.preposterous: Fibonacci star-chart navigator titan projection to Alien Saucer
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var u = enterAmt(resolved, 0.45);
            drawP08Base(ctx, W, H, resolved, plates, S2, B, { mapAlpha: 0.45, fogAlpha: 0.16 });

            S2.drawAlienSaucer(ctx, 640, 98, 1.18, t, 615, 345);
            B.drawTractorRings(ctx, 640, 120, 615, 345, t, { spread: 155, rings: 5 });

            var cx = 615;
            var cy = 356;
            B.drawLanternHalo(ctx, cx, cy, 195 * u, { color: "#fde047", coreColor: "#fffbeb", intensity: 1.1, t: t });

            // Expanding Golden-Ratio Fibonacci spiral & constellation star nodes!
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(t * 0.45);
            ctx.strokeStyle = "#fde047";
            ctx.lineWidth = 3.6;
            ctx.beginPath();
            for (var sp = 0; sp <= 80; sp++) {
              var ang = sp * 0.22;
              var rad = 8 * Math.exp(0.115 * ang) * u;
              if (rad > 250) break;
              var sx = Math.cos(ang) * rad;
              var sy = Math.sin(ang) * rad * 0.82;
              if (sp === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
              if (sp % 14 === 0 && sp > 0) {
                drawCutPaperStar(S2, ctx, sx, sy, 11, 4.5, 4, -ang, "#38bdf8", null);
              }
            }
            ctx.stroke();
            ctx.restore();

            S2.drawScissorCutout(ctx, plates.portholeImg, 308, 270, 134, 132, cx - 68, cy - 68, 136, 136, null, {
              rot: t * 1.2,
              haloWidth: 4.5,
              pin: { x: cx, y: cy, r: 5.0, metal: "brass" }
            });
          }
        },

        o: {
          // 4. o.probable: Snail circles secret treasure X leaving safe passage ring for Turkey
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var st = drawP08Base(ctx, W, H, resolved, plates, S2, B, {});

            var xMarkX = st.mapX + 195;
            var xMarkY = st.mapY + 252;

            // Bold cut-paper treasure X + glistening silver snail loop & dashed teal safe channel!
            ctx.save();
            ctx.strokeStyle = "#0f8f80";
            ctx.lineWidth = 6.5;
            ctx.setLineDash([12, 8]);
            ctx.beginPath();
            ctx.moveTo(295, 495);
            ctx.quadraticCurveTo(xMarkX - 60, xMarkY + 40, xMarkX, xMarkY);
            ctx.quadraticCurveTo(xMarkX + 110, xMarkY - 95, 935, 195);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.strokeStyle = "#fef08a";
            ctx.lineWidth = 7.5;
            ctx.beginPath();
            ctx.arc(xMarkX, xMarkY, 76, 0, TAU);
            ctx.stroke();
            ctx.restore();

            var orbitAng = t * 2.2;
            var sx = xMarkX + Math.cos(orbitAng) * 76 - 95;
            var sy = xMarkY + Math.sin(orbitAng) * 76 - 80;
            drawP08WildGlassSnail(S2, ctx, plates.portholeImg, sx, sy, 190, 160, orbitAng + Math.PI * 0.5, {});

            S2.drawTurkeyCutawayBadge(ctx, 134, 496, 1.04, t, { dispatch: 0.75 });
          },

          // 5. o.plausible: Surfing snail rides curved bubble wave past cheering Brook Trout (SHOWCASE @ 11.8s!)
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            drawP08Base(ctx, W, H, resolved, plates, S2, B, {});

            // Curved ribbon of cut-paper surf wave crests across stage!
            ctx.save();
            for (var wv = 0; wv < 3; wv++) {
              ctx.strokeStyle = wv === 0 ? "#fbfaf7" : (wv === 1 ? "#38bdf8" : "#0f8f80");
              ctx.lineWidth = 14 - wv * 3;
              ctx.beginPath();
              for (var wx = 210; wx <= 1040; wx += 28) {
                var wy = 408 + Math.sin(wx * 0.011 - t * 4.2 + wv * 0.5) * 46 + wv * 14;
                if (wx === 210) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
              }
              ctx.stroke();
            }
            ctx.restore();

            B.drawDeterministicParticles(ctx, "bubbles", 620, 420, t, { count: 24, loop: true, seed: 805.7 });

            // Surfing golden snail riding red-striped surfboard with triangular spinnaker sail!
            var surfX = 560 + Math.sin(t * 2.2) * 115;
            var surfY = 338 + Math.sin(surfX * 0.011 - t * 4.2) * 42;
            ctx.save();
            ctx.translate(surfX, surfY);
            ctx.rotate(Math.cos(surfX * 0.011 - t * 4.2) * 0.24);
            // Cut-paper surfboard
            S2.drawCutoutPaperEdge(ctx, [[-110, 48], [0, 34], [118, 48], [0, 66]], "#d42a1e", "#14110d", { paperRim: 3.0 });
            // Sail mast
            S2.drawCutoutPaperEdge(ctx, [[12, -118], [86, -18], [12, 22]], "#fde047", "#14110d", { paperRim: 2.4 });
            drawP08WildGlassSnail(S2, ctx, plates.portholeImg, -88, -68, 186, 154, 0.08, {});
            ctx.restore();

            S2.drawBrookTrout(ctx, 888, 304 + Math.sin(t * 3.8) * 9, 1.18, t, false);
            S2.drawMailSnail(ctx, 312, 524, 1.20, t, { hasReply: true, postcard: true });
          },

          // 6. o.preposterous: Five-ring counter-rotating slime-trail wormhole vortex under Alien Saucer
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var pop = popAmt(resolved, 0.45);
            drawP08Base(ctx, W, H, resolved, plates, S2, B, { mapAlpha: 0.40 });

            var vx = 632;
            var vy = 356;
            S2.drawAlienSaucer(ctx, 640, 98, 1.18, t, vx, vy);
            B.drawTractorRings(ctx, 640, 120, vx, vy, t, { spread: 165, rings: 5 });

            var wCols = ["#2563eb", "#0f8f80", "#fbfaf7", "#a855f7", "#d42a1e"];
            for (var wi = 0; wi < 5; wi++) {
              var wr = (188 - wi * 30) * clamp(pop, 0.2, 1.1);
              ctx.save();
              ctx.translate(vx, vy);
              ctx.rotate(t * (wi % 2 === 0 ? 1.8 : -2.3) + wi * 0.7);
              var deca = [];
              for (var dp = 0; dp < 10; dp++) {
                var da = (dp / 10) * TAU;
                var dr = wr * (dp % 2 === 0 ? 1.0 : 0.84);
                deca.push([Math.cos(da) * dr, Math.sin(da) * dr * 0.86]);
              }
              S2.drawCutoutPaperEdge(ctx, deca, wCols[wi], "#14110d", { paperRim: 2.8, shadow: wi === 0 });
              ctx.restore();
            }

            S2.drawScissorCutout(ctx, plates.portholeImg, 308, 270, 134, 132, vx - 64, vy - 64, 128, 128, null, {
              rot: t * 3.2,
              haloWidth: 4.0,
              pin: { x: vx, y: vy, r: 5.0, metal: "brass" }
            });
          }
        },

        triangle: {
          // 7. triangle.probable: Wild Snail & Mail Snail plot dotted red creek detour for Turkey
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var u = enterAmt(resolved, 0.50);
            drawP08Base(ctx, W, H, resolved, plates, S2, B, {});

            // Dotted stamp-red detour bypass line drawn across map!
            ctx.save();
            ctx.strokeStyle = "#d42a1e";
            ctx.lineWidth = 6.5;
            ctx.setLineDash([12, 8]);
            ctx.beginPath();
            ctx.moveTo(415, 488);
            ctx.quadraticCurveTo(510, 340, 685, 298);
            ctx.quadraticCurveTo(790, 272, 855 * u + 415 * (1 - u), 195);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            drawCutPaperStar(S2, ctx, 835, 205, 18, 8, 4, 0.3, "#10b981", null);
            drawP08WildGlassSnail(S2, ctx, plates.portholeImg, 578, 232, 232, 196, 0, {});
            S2.drawMailSnail(ctx, 492, 314, 1.44, t, { postcard: true, hasReply: true });
            S2.drawTurkeyCutawayBadge(ctx, 132, 496, 1.04, t, { dispatch: 0.65 });
          },

          // 8. triangle.plausible: Synchronized twin snail figure-eight mirror ballet + Brook Trout
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            drawP08Base(ctx, W, H, resolved, plates, S2, B, { mapAlpha: 0.85 });

            // Mirrored figure-eight silver slime path on glass!
            ctx.save();
            ctx.strokeStyle = "rgba(251, 250, 247, 0.78)";
            ctx.lineWidth = 5.5;
            ctx.setLineDash([10, 6]);
            ctx.beginPath();
            for (var k = 0; k <= 64; k++) {
              var ka = (k / 64) * TAU;
              var lx = 605 + Math.sin(ka) * 165;
              var ly = 338 + Math.sin(ka * 2) * 78;
              if (k === 0) ctx.moveTo(lx, ly); else ctx.lineTo(lx, ly);
            }
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            var ang = t * 1.9;
            var x1 = 605 + Math.sin(ang) * 165;
            var y1 = 338 + Math.sin(ang * 2) * 78;
            var x2 = 605 - Math.sin(ang) * 165;
            var y2 = 338 - Math.sin(ang * 2) * 78;

            drawP08WildGlassSnail(S2, ctx, plates.portholeImg, x1 - 92, y1 - 76, 184, 152, Math.cos(ang) * 0.25, {});
            S2.drawMailSnail(ctx, x2, y2, 1.46, t, { rot: -Math.cos(ang) * 0.25, hasReply: true });
            S2.drawBrookTrout(ctx, 902, 434 + Math.sin(t * 4.2) * 7, 1.16, t, false);
          },

          // 9. triangle.preposterous: Telepathic gastropod saucer relay (SHOWCASE FINALE @ 16.0s!)
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            drawP08Base(ctx, W, H, resolved, plates, S2, B, { mapAlpha: 0.62, fogAlpha: 0.16 });

            var dishX = 626;
            var dishY = 342;
            S2.drawAlienSaucer(ctx, 640, 100, 1.22, t, dishX, dishY);
            B.drawTractorRings(ctx, 640, 124, dishX, dishY, t, { spread: 148, rings: 5 });

            // Wild snail & Official Mail Snail nose-to-nose forming psychic 4-antenna dish!
            drawP08WildGlassSnail(S2, ctx, plates.portholeImg, dishX + 6, dishY - 42, 238, 198, 0, {});
            S2.drawMailSnail(ctx, dishX - 64, dishY + 34, 1.52, t, { rot: -0.18, hasReply: true, hasAlienStamp: true });

            // Pulsing emerald-and-gold hexagon mind-waves rising from crossed antennas to Saucer!
            for (var hw = 0; hw < 5; hw++) {
              var hu = (((t * 0.72) + hw * 0.2) % 1);
              var hx = lerp(dishX, 640, hu);
              var hy = lerp(dishY - 12, 128, hu);
              var hr = lerp(24, 96, Math.sin(hu * Math.PI));
              ctx.save();
              ctx.translate(hx, hy);
              ctx.rotate(t * 1.8 + hw);
              ctx.strokeStyle = hw % 2 === 0 ? "#34d399" : "#fde047";
              ctx.lineWidth = 3.8;
              ctx.beginPath();
              for (var p = 0; p < 6; p++) {
                var pa = (p / 6) * TAU;
                var px0 = Math.cos(pa) * hr;
                var py0 = Math.sin(pa) * hr * 0.55;
                if (p === 0) ctx.moveTo(px0, py0); else ctx.lineTo(px0, py0);
              }
              ctx.closePath();
              ctx.stroke();
              ctx.restore();
            }
          }
        },

        square: {
          // 10. square.probable: Snail retracts into smooth striped creek pebble + calm Turkey
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            drawP08Base(ctx, W, H, resolved, plates, S2, B, {});

            var px0 = 626;
            var py0 = 344;
            // Retracted smooth banded golden shell pebble!
            S2.drawScissorCutout(ctx, plates.portholeImg, 308, 270, 134, 132, px0 - 92, py0 - 92, 184, 184, null, {
              haloWidth: 5.0,
              stroke: "#14110d",
              rot: Math.sin(t * 2.5) * 0.04
            });
            drawBrassScissorTongs(S2, B, ctx, 1055, 588, px0 + 96, py0 + 28, 0.85, t, { sparks: false });

            // Single calm acoustic ring
            ctx.strokeStyle = "rgba(251,250,247,0.7)";
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.arc(px0, py0, 118 + Math.sin(t * 3) * 8, 0, TAU);
            ctx.stroke();

            S2.drawTurkeyCutawayBadge(ctx, 134, 496, 1.04, t, { dispatch: 0.45 });
          },

          // 11. square.plausible: Snail taps 3-ring Morse greeting back to brass probe + grinning Brook Trout
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            drawP08Base(ctx, W, H, resolved, plates, S2, B, {});

            var rockAng = Math.sin(t * 8.5) * 0.14;
            var sx = 520;
            var sy = 236;
            drawP08WildGlassSnail(S2, ctx, plates.portholeImg, sx, sy, 268, 224, rockAng, {});

            var probeX = 815;
            var probeY = 396;
            drawBrassScissorTongs(S2, B, ctx, 1060, 588, probeX - Math.sin(t * 8.5) * 10, probeY, 0.78, t, { sparks: true, seed: 811.2 });

            // Call-and-response concentric glass tap rings (3 teal rings from snail, 2 amber rings from probe!)
            for (var r = 0; r < 3; r++) {
              var sr = 28 + (((t * 85) + r * 30) % 92);
              ctx.strokeStyle = "rgba(15, 143, 128, 0.78)";
              ctx.lineWidth = 3.2;
              ctx.beginPath();
              ctx.arc(sx + 165, sy + 125, sr, 0, TAU);
              ctx.stroke();
            }
            for (var p = 0; p < 2; p++) {
              var pr = 24 + (((t * 85) + 45 + p * 36) % 82);
              ctx.strokeStyle = "rgba(245, 158, 11, 0.78)";
              ctx.lineWidth = 3.0;
              ctx.beginPath();
              ctx.arc(probeX, probeY, pr, 0, TAU);
              ctx.stroke();
            }

            S2.drawBrookTrout(ctx, 902, 262 + Math.sin(t * 3.6) * 6, 1.15, t, false);
            S2.drawMailSnail(ctx, 326, 528, 1.22, t, { hasReply: true });
          },

          // 12. square.preposterous: Micro-saucer shell ignites thruster vents & lifts off glass to UFO!
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var u = enterAmt(resolved, 0.55);
            drawP08Base(ctx, W, H, resolved, plates, S2, B, { mapAlpha: 0.70 });

            S2.drawAlienSaucer(ctx, 640, 102, 1.20, t, 640, 290);
            B.drawTractorRings(ctx, 640, 124, 640, 320, t, { spread: 135, rings: 4 });

            var liftX = 640 + Math.sin(t * 3.4) * 18;
            var liftY = lerp(348, 214, 0.55 + 0.35 * Math.sin(t * 1.8)) * u + 348 * (1 - u);

            // 6 pinpoint amber-and-cyan micro-thruster flame plumes under rising spiral shell!
            for (var th = 0; th < 6; th++) {
              var tx = liftX - 62 + th * 25;
              var ty = liftY + 62;
              S2.drawCutoutPaperEdge(
                ctx,
                [[tx - 7, ty], [tx, ty + 28 + Math.sin(t * 18 + th) * 10], [tx + 7, ty]],
                th % 2 === 0 ? "#fde047" : "#38bdf8",
                "#14110d",
                { paperRim: 1.5, shadow: false }
              );
            }
            B.drawLanternHalo(ctx, liftX, liftY + 38, 110, { color: "#fbbf24", intensity: 0.95, t: t });

            // Brass saucer skirt + spinning golden snail shell dome!
            S2.drawCardboardPuppetPiece(
              ctx,
              [[liftX - 88, liftY + 46], [liftX - 58, liftY + 30], [liftX + 58, liftY + 30], [liftX + 88, liftY + 46], [liftX + 64, liftY + 62], [liftX - 64, liftY + 62]],
              { tone: "#c99535", ribs: 1, pins: [[liftX - 48, liftY + 46], [liftX, liftY + 46], [liftX + 48, liftY + 46]] }
            );
            S2.drawScissorCutout(ctx, plates.portholeImg, 308, 270, 134, 132, liftX - 58, liftY - 56, 116, 112, null, {
              haloWidth: 4.0,
              stroke: "#14110d"
            });

            drawBrassScissorTongs(S2, B, ctx, 1055, 590, 775, 438, 0.4, t, { sparks: false });
          }
        }
      }
    });
  }

  /* ==========================================================================
   * PORTHOLE #09 · PORT ("cardboard-parallax" · p09.jpg + atlas-44.webp)
   * Root: Split-pin grey-cardboard trout pushing wire shopping cart on roadbed
   * ========================================================================== */

  function drawP09Base(ctx, W, H, resolved, plates, S, B, cfg) {
    var opts = cfg || {};
    var t = resolved.t;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    var px1 = px(S, 0.18, resolved);
    var px2 = px(S, 0.34, resolved);
    var px3 = px(S, 0.54, resolved);

    // 1. Monochrome TVA Submerged Timber Posts, Barn Wall & Crop Bed (atlas-44.webp)
    S.drawScissorCutout(ctx, aImg, 0, 0, 315, 395, 96 + px1, 48, 372, 428,
      [[0.04, 0.04], [0.92, 0.03], [0.88, 0.95], [0.05, 0.96]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.84 }
    );
    S.drawScissorCutout(ctx, aImg, 440, 0, 300, 380, 815 + px2, 44, 362, 422,
      [[0.08, 0.04], [0.96, 0.03], [0.95, 0.96], [0.12, 0.94]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.84 }
    );
    S.drawScissorCutout(ctx, aImg, 165, 240, 435, 176, 345 + px2 * 1.15, 355, 590, 195, null, {
      filter: "mono",
      haloWidth: 3.5,
      alpha: 0.80
    });

    // 2. Sunken Cracked Asphalt Roadbed & Silt Plume Cutouts from p09.jpg
    ctx.save();
    if (opts.roadTilt) {
      ctx.translate(640, 505);
      ctx.rotate(opts.roadTilt);
      ctx.translate(-640, -505);
    }
    S.drawScissorCutout(ctx, pImg, 178, 404, 286, 140, 272 + px3, 445, 725, 168,
      [[0.05, 0.14], [0.94, 0.10], [0.98, 0.92], [0.02, 0.94]],
      { filter: "mono", haloWidth: 4.5 }
    );
    ctx.restore();

    S.drawScissorCutout(ctx, pImg, 100, 120, 145, 385, 94 + px3 * 1.1, 122, 194, 442, null, {
      filter: "mono",
      haloWidth: 4.0,
      alpha: 0.88
    });

    S.drawNorsteinFog(ctx, W, 620, t, 0.16, "224, 226, 224");
    if (B) {
      B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.14, color: "#e2e8f0" });
    }
  }

  function drawP09CartAndPusher(S, ctx, pImg, cartX, cartY, t, opts) {
    var cfg = opts || {};
    var cartRot = cfg.rot || 0;

    ctx.save();
    ctx.translate(cartX, cartY);
    ctx.rotate(cartRot);

    // Scissor-Cut Wire Shopping Cart & Tin Cans from p09.jpg (sx=206..414, sy=236..474 — 0 text!)
    S.drawScissorCutout(
      ctx, pImg,
      206, 236, 208, 238,
      -155, -102, 292, 294,
      [
        [0.03, 0.22], [0.58, 0.03], [0.96, 0.05], [0.88, 0.64],
        [0.86, 0.94], [0.16, 0.96], [0.12, 0.68]
      ],
      { filter: cfg.colorCart ? "none" : "mono", haloWidth: 5.0, stroke: "#14110d" }
    );

    // Caster Wheels (normal, frantic spin, 6-wheel rover, or 90-deg hover thrusters!)
    if (cfg.hoverWheels) {
      var hOffs = [-102, 44];
      for (var hw = 0; hw < hOffs.length; hw++) {
        var hx = hOffs[hw];
        S.drawCardboardPuppetPiece(ctx, [[hx - 24, 168], [hx + 24, 168], [hx + 20, 186], [hx - 20, 186]], {
          tone: "#3c3d3f",
          ribs: 1,
          pin: { x: hx, y: 176, r: 4.2, metal: "brass" }
        });
        // Blue hover-ring thruster plumes beneath folded wheel!
        for (var hr = 0; hr < 2; hr++) {
          var hu = (((t * 2.2) + hr * 0.5) % 1);
          ctx.strokeStyle = "rgba(56, 189, 248, " + (1 - hu).toFixed(2) + ")";
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.ellipse(hx, 196 + hu * 44, 22 + hu * 14, 6 + hu * 4, 0, 0, TAU);
          ctx.stroke();
        }
      }
    } else {
      var wOffs = cfg.roverWheels ? [-122, -38, 48] : [-96, 46];
      var wRad = cfg.roverWheels ? 27 : 20;
      for (var wi = 0; wi < wOffs.length; wi++) {
        ctx.save();
        ctx.translate(wOffs[wi], 178);
        var spinSpd = (wi === 0 && cfg.wobbleFront) ? (t * 22.0) : (-t * (cfg.wheelSpeed != null ? cfg.wheelSpeed : 5.2));
        if (wi === 0 && cfg.wobbleFront) {
          ctx.translate(Math.sin(t * 26) * 5, Math.cos(t * 26) * 3);
        }
        ctx.rotate(spinSpd);
        var wPoly = [];
        for (var wp = 0; wp < 10; wp++) {
          var wa = (wp / 10) * TAU;
          var rr = wRad * (wp % 2 === 0 ? 1.0 : 0.84);
          wPoly.push([Math.cos(wa) * rr, Math.sin(wa) * rr]);
        }
        S.drawCardboardPuppetPiece(ctx, wPoly, { tone: "#3c3d3f", ribs: 1 });
        S.drawSplitPin(ctx, 0, 0, 4.8, { metal: (wi === 0 && cfg.goldAxle) ? "brass" : "silver" });
        ctx.restore();
      }
    }

    ctx.restore();

    // Handmade Jointed Grey-Cardboard Shopper Trout Pusher (2-bone IK arms + split-pins!)
    if (cfg.pusher !== false) {
      var flyMode = !!cfg.flyingPusher;
      var pusherX = cartX + (flyMode ? 248 : 204);
      var pusherY = cartY + (flyMode ? -96 : (-42 + Math.sin(t * 3.8) * 4));
      var handleX = cartX + 104;
      var handleY = cartY - 72;

      drawIKLimb(S, ctx, pusherX - 54, pusherY + 26, 74, 70, handleX + 12, handleY - 8, 1, {
        r1: 11, r2: 9, tone1: "#6a6965", tone2: "#7f7e79", metal: "silver"
      });

      ctx.save();
      ctx.translate(pusherX, pusherY);
      if (flyMode) ctx.rotate(-0.34 + Math.sin(t * 9) * 0.08);

      // Wagging Split-Pin Caudal Tail
      ctx.save();
      ctx.translate(86, 42);
      ctx.rotate(Math.sin(t * 6.2) * 0.24);
      S.drawCardboardPuppetPiece(ctx, [[-8, -10], [46, -34], [34, 4], [44, 38], [-8, 12]], {
        tone: "#6c6b67",
        ribs: 2,
        pin: { x: 0, y: 0, r: 4.0, metal: "silver" }
      });
      ctx.restore();

      S.drawCardboardPuppetPiece(
        ctx,
        [[-96, -12], [-42, -44], [42, -22], [92, 38], [48, 58], [-62, 36]],
        { tone: "#8e8d88", ribs: 4, pins: [[-38, -6], [34, 18]] }
      );
      ctx.fillStyle = "#fbfaf5";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2.0;
      ctx.beginPath(); ctx.arc(-66, -14, 7.5, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#14110d";
      ctx.beginPath(); ctx.arc(-68, -14, 3.4, 0, TAU); ctx.fill();
      ctx.restore();

      drawIKLimb(S, ctx, pusherX - 42, pusherY + 34, 76, 72, handleX, handleY, 1, {
        r1: 12, r2: 10, tone1: "#85847f", tone2: "#9e9c96", metal: "silver"
      });
    }
  }

  function registerPortal09(B, S) {
    B.definePortalGame(9, {
      drawBackdrop: makeBackdropFn(9),
      drawForeground: function (ctx, W, H, resolved, plates, S2) {
        drawCornerBrassPortholeFrame(S2, ctx, W, H, resolved);
      },

      drawRoot: function (ctx, W, H, resolved, plates, S2) {
        var t = resolved.t;
        drawP09Base(ctx, W, H, resolved, plates, S2, B, {});
        drawCutPaperBubbles(S2, ctx, 9, 6, t, 220, 1020, 100, 520, false, "#e2e4e2");
        var cartX = 548 - Math.sin(t * 1.15) * 24 + px(S2, 0.72, resolved) * 0.5;
        var cartY = 326 - Math.abs(Math.sin(t * 7.4)) * 5;
        drawP09CartAndPusher(S2, ctx, plates.portholeImg, cartX, cartY, t, {});
        drawRootHotspotLandmarks(S2, B, ctx, resolved);
      },

      stems: {
        // [✕] High-Beam Headlights: Twin beams glint off chrome basket & cast prison-bar grid shadows!
        x: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.42);
          drawP09Base(ctx, W, H, resolved, plates, S2, B, {});
          var cartX = 545;
          var cartY = 326 - Math.abs(Math.sin(t * 7.0)) * 4;

          B.drawVolumetricBeam(ctx, 130, 445, cartX - 30, cartY - 10, {
            color: "#dbeafe",
            coreColor: "#ffffff",
            spread: 145 * u,
            intensity: 1.3 * u,
            t: t
          });
          B.drawVolumetricBeam(ctx, 130, 545, cartX - 10, cartY + 45, {
            color: "#fde68a",
            coreColor: "#fffbeb",
            spread: 135 * u,
            intensity: 1.1 * u,
            t: t + 1.1
          });

          // Dramatic elongated prison-bar wire-grid shadow across gravel roadbed!
          ctx.save();
          ctx.strokeStyle = "rgba(15, 15, 15, " + (0.48 * u).toFixed(2) + ")";
          ctx.lineWidth = 5.5;
          for (var g = 0; g < 9; g++) {
            var gx = cartX - 95 + g * 34;
            ctx.beginPath();
            ctx.moveTo(gx, cartY + 155);
            ctx.lineTo(gx + 195, 595);
            ctx.stroke();
          }
          ctx.restore();

          drawP09CartAndPusher(S2, ctx, plates.portholeImg, cartX, cartY, t, {});
          for (var sp = 0; sp < 4; sp++) {
            drawCutPaperStar(S2, ctx, cartX - 115 + sp * 58, cartY - 52 + (sp % 2) * 38, 13 * u, 4.5 * u, 4, t * 2 + sp, "#ffffff", null);
          }
        },

        // [○] Honk Ballast Horn: Courtesy bubble blast spins squeaky front caster wheel in frantic circles!
        o: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.40);
          drawP09Base(ctx, W, H, resolved, plates, S2, B, {});
          var cartX = 532 - 18 * u;
          var cartY = 324 - Math.abs(Math.sin(t * 14)) * 6;

          // Two-tone acoustic horn rings + ballast bubble jet from right!
          for (var hr = 0; hr < 4; hr++) {
            var hu = (((t * 1.4) + hr * 0.25) % 1);
            ctx.strokeStyle = hr % 2 === 0 ? "#d42a1e" : "#fbfaf7";
            ctx.lineWidth = 4.5 * (1 - hu * 0.6);
            ctx.beginPath();
            ctx.arc(885, 315, 45 + hu * 260, Math.PI * 0.68, Math.PI * 1.32);
            ctx.stroke();
          }
          B.drawDeterministicParticles(ctx, "bubbles", cartX - 96, cartY + 178, t, { count: 24, loop: true, seed: 902.4 });
          drawP09CartAndPusher(S2, ctx, plates.portholeImg, cartX, cartY, t, { wobbleFront: true });
        },

        // [△] Clip Coupon Mail: Mail Snail glides onto red handlebar with perforated sheet of creek coupons
        triangle: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.48);
          drawP09Base(ctx, W, H, resolved, plates, S2, B, {});
          var cartX = 548;
          var cartY = 326;
          drawP09CartAndPusher(S2, ctx, plates.portholeImg, cartX, cartY, t, {});

          var hx = cartX + 96;
          var hy = cartY - 88;
          B.drawSnailSilverTrail(ctx, 320, 490, hx - 12, hy + 8, u, t, { arc: 36 });
          S2.drawMailSnail(ctx, lerp(320, hx, u), lerp(490, hy, u), 1.24, t, { postcard: false });

          // Perforated fluttering sheet of 3 colorful creek coupons (0 text — pure vector icons & dashed cuts!)
          if (u > 0.35) {
            ctx.save();
            ctx.translate(hx - 34, hy + 18);
            ctx.rotate(Math.sin(t * 3.8) * 0.14);
            for (var cp = 0; cp < 3; cp++) {
              var cy = cp * 38;
              S2.drawCutoutPaperEdge(ctx, [[-28, cy], [28, cy], [28, cy + 34], [-28, cy + 34]], "#fbfaf5", "#14110d", { paperRim: 1.8, shadow: false });
              ctx.fillStyle = ["#0f8f80", "#d42a1e", "#f59e0b"][cp];
              ctx.beginPath();
              ctx.arc(0, cy + 17, 9, 0, TAU);
              ctx.fill();
            }
            ctx.restore();
          }
        },

        // [□] Hook Cart Bumper: Brass tongs rattle hinged red child-seat flap on wire cart
        square: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var rattle = Math.sin(t * 16.0) * 6;
          drawP09Base(ctx, W, H, resolved, plates, S2, B, {});
          var cartX = 536 + rattle * 0.5;
          var cartY = 326;
          drawP09CartAndPusher(S2, ctx, plates.portholeImg, cartX, cartY, t, {});

          // Rattling hinged red child-seat flap near handlebar!
          var seatX = cartX + 66;
          var seatY = cartY - 46;
          ctx.save();
          ctx.translate(seatX, seatY);
          ctx.rotate(-0.35 + Math.sin(t * 18.0) * 0.32);
          S2.drawCutoutPaperEdge(ctx, [[-28, -8], [16, -8], [12, 42], [-24, 42]], "#d42a1e", "#14110d", { paperRim: 2.2 });
          S2.drawSplitPin(ctx, 0, 0, 4.0, { metal: "silver" });
          ctx.restore();

          drawBrassScissorTongs(S2, B, ctx, 1045, 590, seatX + 18, seatY + 14, 0.72, t, { sparks: true, seed: 904.6 });
        }
      },

      outcomes: {
        x: {
          // 1. x.probable: Heavy iron medieval ramming cage + bracing Turkey (SHOWCASE @ 6.0s!)
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var lunge = Math.abs(Math.sin(t * 3.4)) * -42;
            drawP09Base(ctx, W, H, resolved, plates, S2, B, {});
            var cartX = 562 + lunge;
            var cartY = 326;

            B.drawVolumetricBeam(ctx, 995, 560, cartX - 110, cartY + 10, {
              color: "#f59e0b",
              spread: 185,
              intensity: 1.15,
              t: t
            });

            drawP09CartAndPusher(S2, ctx, plates.portholeImg, cartX, cartY, t, { wheelSpeed: 8.5 });

            // Riveted charcoal-iron siege battering ram & 4 jagged spikes bolted to cart prow!
            var prowX = cartX - 158;
            var prowY = cartY - 22;
            S2.drawCardboardPuppetPiece(
              ctx,
              [[prowX + 38, prowY - 70], [prowX - 60, prowY - 42], [prowX - 90, prowY + 88], [prowX + 44, prowY + 96]],
              { tone: "#323539", ribs: 4, pins: [[prowX + 18, prowY - 46], [prowX + 18, prowY + 12], [prowX + 18, prowY + 72]] }
            );
            for (var sp = 0; sp < 4; sp++) {
              var sy = prowY - 32 + sp * 34;
              var sx = prowX - 54 - sp * 7;
              S2.drawCutoutPaperEdge(ctx, [[sx + 6, sy - 11], [sx - 42, sy], [sx + 6, sy + 11]], "#d1d5db", "#14110d", { paperRim: 2.2 });
            }

            S2.drawTurkeyCutawayBadge(ctx, 146, 496, 1.04, t, { dispatch: 0.85 });
          },

          // 2. x.plausible: Midnight bargain aisle treasure haul of shiny tins & returnable bottles
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            drawP09Base(ctx, W, H, resolved, plates, S2, B, {});
            var cartX = 548;
            var cartY = 326;

            B.drawVolumetricBeam(ctx, 145, 535, cartX - 20, cartY - 25, {
              color: "#fde047",
              coreColor: "#fffbeb",
              spread: 175,
              intensity: 1.25,
              t: t
            });

            drawP09CartAndPusher(S2, ctx, plates.portholeImg, cartX, cartY, t, { colorCart: true });

            // Gleaming golden corn tins & emerald returnable soda bottles heaped atop wire basket!
            var lootCols = ["#10b981", "#f59e0b", "#d42a1e", "#10b981", "#f59e0b"];
            for (var li = 0; li < 5; li++) {
              var lx = cartX - 118 + li * 42;
              var ly = cartY - 92 - (li % 2) * 18;
              S2.drawCutoutPaperEdge(ctx, [[lx - 14, ly - 24], [lx + 14, ly - 24], [lx + 14, ly + 22], [lx - 14, ly + 22]], lootCols[li], "#14110d", { paperRim: 2.0 });
            }
            B.drawDeterministicParticles(ctx, "kintsugi", cartX - 30, cartY - 85, t, { count: 16, loop: true, seed: 906.2 });

            S2.drawBrookTrout(ctx, 312, 378 + Math.sin(t * 3.4) * 6, 1.16, t, true);
            S2.drawMailSnail(ctx, 338, 536, 1.20, t, { hasReply: true });
          },

          // 3. x.preposterous: 6-wheeled laser-drilling asteroid mining rover beneath Alien Saucer
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            drawP09Base(ctx, W, H, resolved, plates, S2, B, {});
            var cartX = 595;
            var cartY = 322;

            S2.drawAlienSaucer(ctx, 635, 98, 1.18, t, cartX - 40, cartY + 10);
            B.drawTractorRings(ctx, 635, 120, cartX - 40, cartY + 10, t, { spread: 150, rings: 5 });

            // Jagged asteroid crater boulder & glowing emerald space-ore crystals on left!
            S2.drawCardboardPuppetPiece(ctx, [[205, 575], [268, 462], [358, 482], [420, 575]], { tone: "#4b5563", ribs: 3 });
            S2.drawCutoutPaperEdge(ctx, [[278, 482], [302, 412], [332, 444], [352, 408], [368, 484]], "#10b981", "#14110d", { paperRim: 3.2 });

            drawP09CartAndPusher(S2, ctx, plates.portholeImg, cartX, cartY, t, { roverWheels: true });

            // Spinning brass telemetry dish + IK laser core-drill arm zapping emerald ore!
            ctx.save();
            ctx.translate(cartX + 88, cartY - 108);
            ctx.rotate(Math.sin(t * 2.8) * 0.4);
            S2.drawCardboardPuppetPiece(ctx, [[-34, 0], [-18, -28], [18, -28], [34, 0]], {
              tone: "#d4a44c",
              ribs: 2,
              pin: { x: 0, y: 0, r: 4.4, metal: "brass" }
            });
            ctx.restore();

            var drill = drawIKLimb(S2, ctx, cartX - 125, cartY + 18, 72, 70, 332, 436, -1, {
              r1: 10, r2: 8, tone1: "#78716c", tone2: "#d4a44c", metal: "brass"
            });
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 4.0;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.moveTo(drill.ex, drill.ey);
            ctx.lineTo(324, 446);
            ctx.stroke();
            ctx.setLineDash([]);
            B.drawDeterministicParticles(ctx, "kintsugi", 324, 446, t, { count: 16, loop: true, seed: 907.8, color: "#34d399" });
          }
        },

        o: {
          // 4. o.probable: Runaway downhill supply convoy with Shopper Trout flying horizontally off handle!
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            drawP09Base(ctx, W, H, resolved, plates, S2, B, { roadTilt: 0.12 });
            var slide = ((t * 135) % 240) - 120;
            var cartX = 520 + slide;
            var cartY = 312 + slide * 0.12;

            // Speed lines behind coasting runaway cart
            ctx.save();
            ctx.strokeStyle = "rgba(251,250,247,0.72)";
            ctx.lineWidth = 3.2;
            for (var sl = 0; sl < 5; sl++) {
              var sy = 240 + sl * 48;
              ctx.beginPath();
              ctx.moveTo(220, sy);
              ctx.lineTo(360, sy + 18);
              ctx.stroke();
            }
            ctx.restore();

            drawP09CartAndPusher(S2, ctx, plates.portholeImg, cartX, cartY, t, {
              rot: 0.12,
              flyingPusher: true,
              wheelSpeed: -14.0
            });
            S2.drawTurkeyCutawayBadge(ctx, 146, 496, 1.04, t, { dispatch: 0.8 });
          },

          // 5. o.plausible: Grocery shelf gondolas + Shopper pulls aside so Brook Trout zooms past! (SHOWCASE @ 11.8s!)
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var u = enterAmt(resolved, 0.45);
            drawP09Base(ctx, W, H, resolved, plates, S2, B, {});

            // Left & right torn-paper grocery shelf gondolas stocked with colorful tin cans!
            var shelfCols = ["#0f8f80", "#d99e3b", "#d42a1e"];
            var sXs = [148, 962];
            for (var si = 0; si < 2; si++) {
              var sx = sXs[si];
              S2.drawTornPaperFlat(ctx, sx, 96, 162, 444, { fill: "#4a4b4d", paperColor: "#f3efe4", deckle: 6.0 });
              for (var row = 0; row < 4; row++) {
                var ry = 148 + row * 94;
                S2.drawCardboardPuppetPiece(ctx, [[sx + 8, ry + 36], [sx + 154, ry + 36], [sx + 154, ry + 48], [sx + 8, ry + 48]], { tone: "#8f8d88", ribs: 1, shadow: false });
                for (var can = 0; can < 3; can++) {
                  var cx = sx + 20 + can * 44;
                  S2.drawCutoutPaperEdge(ctx, [[cx, ry], [cx + 32, ry], [cx + 32, ry + 36], [cx, ry + 36]], shelfCols[(row + can) % 3], "#14110d", { paperRim: 2.0, shadow: false });
                }
              }
            }

            // Shopper Trout sheepishly tucks cart up-right out of the center lane
            drawP09CartAndPusher(S2, ctx, plates.portholeImg, 628, 268, t, { rot: -0.06 });

            // Impatient Brook Trout zooming cleanly through the foreground aisle with red hand-basket + Mail Snail!
            var zoomX = lerp(890, 405, ((t * 0.42) % 1) * u + 0.35 * (1 - u));
            var zoomY = 468 + Math.sin(t * 5.2) * 6;
            S2.drawBrookTrout(ctx, zoomX, zoomY, 1.22, t, false);
            S2.drawCutoutPaperEdge(ctx, [[zoomX - 66, zoomY + 20], [zoomX - 20, zoomY + 20], [zoomX - 26, zoomY + 50], [zoomX - 60, zoomY + 50]], "#d42a1e", "#14110d", { paperRim: 2.2 });
            S2.drawMailSnail(ctx, 842, 536, 1.22, t, { flip: true, hasReply: true, postcard: true });
          },

          // 6. o.preposterous: Hover-cart folds caster wheels flat & levitates into Alien Saucer tractor beam!
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var u = enterAmt(resolved, 0.50);
            drawP09Base(ctx, W, H, resolved, plates, S2, B, {});

            S2.drawAlienSaucer(ctx, 620, 98, 1.20, t, 555, 265);
            B.drawTractorRings(ctx, 620, 122, 555, 310, t, { spread: 165, rings: 5 });

            var hoverY = lerp(326, 224, u) + Math.sin(t * 2.8) * 10;
            drawP09CartAndPusher(S2, ctx, plates.portholeImg, 545, hoverY, t, {
              rot: -0.08,
              hoverWheels: true
            });
          }
        },

        triangle: {
          // 7. triangle.probable: 6-foot curling paper receipt covered in benign green kelp icons + relieved Turkey
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var u = enterAmt(resolved, 0.50);
            drawP09Base(ctx, W, H, resolved, plates, S2, B, {});
            drawP09CartAndPusher(S2, ctx, plates.portholeImg, 608, 328, t, {});

            // Giant unrolling cream receipt ribbon curling across stage (0 text — pure green kelp icons!)
            var rx0 = 695;
            var rx1 = lerp(695, 265, u);
            var rPtsTop = [];
            var rPtsBot = [];
            for (var s = 0; s <= 12; s++) {
              var su = s / 12;
              var rx = lerp(rx0, rx1, su);
              var ry = 248 + Math.sin(su * Math.PI * 2 + t * 2.4) * 34 + su * 140;
              rPtsTop.push([rx, ry - 26]);
              rPtsBot.unshift([rx, ry + 26]);
            }
            S2.drawCutoutPaperEdge(ctx, rPtsTop.concat(rPtsBot), "#fbfaf5", "#14110d", { paperRim: 2.5 });
            for (var ki = 1; ki <= 6; ki++) {
              var ku = ki / 7;
              var kx = lerp(rx0, rx1, ku);
              var ky = 248 + Math.sin(ku * Math.PI * 2 + t * 2.4) * 34 + ku * 140;
              drawCutPaperStar(S2, ctx, kx, ky, 11, 5, 5, ku * 2, "#10b981", null);
            }

            S2.drawMailSnail(ctx, 704, 236, 1.24, t, { flip: true, postcard: false });
            S2.drawTurkeyCutawayBadge(ctx, 146, 496, 1.04, t, { dispatch: 0.45 });
          },

          // 8. triangle.plausible: Five-cent bottle deposit refund — Brook Trout & shiny copper token!
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            drawP09Base(ctx, W, H, resolved, plates, S2, B, {});
            var cartX = 578;
            var cartY = 328;
            drawP09CartAndPusher(S2, ctx, plates.portholeImg, cartX, cartY, t, {});

            // Two emerald glass bottles inside wire basket
            for (var b = 0; b < 2; b++) {
              var bx = cartX - 98 + b * 44;
              var by = cartY - 94;
              S2.drawCutoutPaperEdge(
                ctx,
                [[bx - 12, by + 32], [bx - 12, by - 4], [bx - 5, by - 26], [bx + 5, by - 26], [bx + 12, by - 4], [bx + 12, by + 32]],
                "#10b981",
                "#14110d",
                { paperRim: 2.0 }
              );
            }

            // Gleaming embossed copper refund token held between Mail Snail & Brook Trout (0 text!)
            var coinX = 392;
            var coinY = 412 + Math.sin(t * 3.5) * 5;
            B.drawLanternHalo(ctx, coinX, coinY, 68, { color: "#f59e0b", intensity: 0.85, t: t });
            var coinPts = [];
            for (var c = 0; c < 12; c++) {
              var ca = (c / 12) * TAU;
              coinPts.push([coinX + Math.cos(ca) * 28, coinY + Math.sin(ca) * 28]);
            }
            S2.drawCutoutPaperEdge(ctx, coinPts, "#d97706", "#14110d", { paperRim: 2.8 });
            drawCutPaperStar(S2, ctx, coinX, coinY, 15, 6.5, 5, t, "#fef08a", "brass");

            S2.drawMailSnail(ctx, 456, 434, 1.24, t, { flip: true, hasReply: true });
            S2.drawBrookTrout(ctx, 276, 418 + Math.sin(t * 3.0) * 6, 1.16, t, true);
          },

          // 9. triangle.preposterous: Bargain-planet loot cage red laser barcode checkout under Alien Saucer (SHOWCASE FINALE @ 16.0s!)
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            drawP09Base(ctx, W, H, resolved, plates, S2, B, {});
            var cartX = 568;
            var cartY = 332;

            S2.drawAlienSaucer(ctx, 560, 102, 1.22, t, cartX - 35, cartY);

            // Pile of river junk (rubber boot cutout + rock + cans) inside wire cart
            S2.drawCutoutPaperEdge(ctx, [[cartX - 115, cartY - 62], [cartX - 78, cartY - 118], [cartX - 48, cartY - 112], [cartX - 52, cartY - 68], [cartX - 24, cartY - 62], [cartX - 28, cartY - 42], [cartX - 115, cartY - 42]], "#1f2937", "#14110d", { paperRim: 2.4 });
            drawP09CartAndPusher(S2, ctx, plates.portholeImg, cartX, cartY, t, { colorCart: true });

            // Wide crimson supermarket laser-scanner fan & sweeping red scanbar from Alien Saucer!
            var scanSweep = cartX - 145 + (((t * 145) % 240));
            B.drawVolumetricBeam(ctx, 560, 126, cartX - 35, cartY + 35, {
              color: "#ef4444",
              coreColor: "#fecaca",
              spread: 165,
              intensity: 1.25,
              t: t
            });
            ctx.save();
            ctx.strokeStyle = "#ff2a2a";
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.moveTo(560, 126);
            ctx.lineTo(scanSweep, cartY + 95);
            ctx.stroke();

            // Floating geometric barcode stripe card above cart (0 text — pure vertical black/white bars!)
            S2.drawCutoutPaperEdge(ctx, [[cartX - 88, 188], [cartX + 12, 188], [cartX + 12, 236], [cartX - 88, 236]], "#fbfaf7", "#14110d", { paperRim: 2.4 });
            ctx.fillStyle = "#14110d";
            var barWidths = [4, 2, 6, 2, 3, 5, 2, 4, 6, 2];
            var bx = cartX - 78;
            for (var bw = 0; bw < barWidths.length; bw++) {
              ctx.fillRect(bx, 196, barWidths[bw], 32);
              bx += barWidths[bw] + 4;
            }
            ctx.restore();

            S2.drawMailSnail(ctx, cartX + 94, cartY - 92, 1.26, t, { flip: true, hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          // 10. square.probable: Locked quarter-chain cart defense anchored to sunken timber post + Turkey
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            drawP09Base(ctx, W, H, resolved, plates, S2, B, {});

            // Sturdy sunken timber bollard post on right
            S2.drawCardboardPuppetPiece(ctx, [[885, 310], [932, 310], [938, 535], [880, 535]], {
              tone: "#574838",
              ribs: 3,
              pin: { x: 908, y: 348, r: 5.0, metal: "brass" }
            });

            var cartX = 562 + Math.sin(t * 9) * 2;
            var cartY = 326;
            drawP09CartAndPusher(S2, ctx, plates.portholeImg, cartX, cartY, t, { wheelSpeed: 0 });

            // Taut silver coin-lock chain linking handlebar to bollard post!
            ctx.save();
            ctx.strokeStyle = "#fbfaf7";
            ctx.lineWidth = 7.0;
            ctx.setLineDash([11, 6]);
            ctx.beginPath();
            ctx.moveTo(cartX + 104, cartY - 68);
            ctx.lineTo(908, 348);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            drawBrassScissorTongs(S2, B, ctx, 1055, 590, 908, 348, 0.9, t, { sparks: true, seed: 910.1 });
            S2.drawTurkeyCutawayBadge(ctx, 146, 496, 1.04, t, { dispatch: 0.5 });
          },

          // 11. square.plausible: Fixed wobbly fourth wheel glides buttery-smooth + applauding Brook Trout
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            drawP09Base(ctx, W, H, resolved, plates, S2, B, {});
            var cartX = 548 - Math.sin(t * 1.4) * 34;
            var cartY = 324;

            drawP09CartAndPusher(S2, ctx, plates.portholeImg, cartX, cartY, t, { goldAxle: true });
            var axleX = cartX - 96;
            var axleY = cartY + 178;

            B.drawLanternHalo(ctx, axleX, axleY, 76, { color: "#fde047", intensity: 0.95, t: t });
            drawCutPaperStar(S2, ctx, axleX, axleY, 20, 7, 4, t * 2.5, "#fef08a", "brass");
            drawBrassScissorTongs(S2, B, ctx, 1040, 590, axleX + 26, axleY + 8, 0.85, t, { sparks: true, seed: 911.5 });

            S2.drawBrookTrout(ctx, 292, 412 + Math.sin(t * 4.0) * 6, 1.18, t, true);
            S2.drawMailSnail(ctx, 336, 536, 1.22, t, { hasReply: true });
          },

          // 12. square.preposterous: Twelve nested wire carts telescope diagonally skyward into Alien Saucer!
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var u = enterAmt(resolved, 0.55);
            drawP09Base(ctx, W, H, resolved, plates, S2, B, {});

            S2.drawAlienSaucer(ctx, 685, 98, 1.20, t, 610, 290);
            B.drawTractorRings(ctx, 685, 120, 560, 360, t, { spread: 155, rings: 5 });

            // Accordion chain of 8 telescoping nested wire shopping carts reaching from roadbed to Saucer bay!
            for (var n = 7; n >= 0; n--) {
              var nu = (n / 7) * u;
              var nx = lerp(420, 668, nu);
              var ny = lerp(418, 148, nu);
              var nsc = lerp(0.85, 0.44, nu);
              ctx.save();
              ctx.translate(nx, ny);
              ctx.rotate(-0.48);
              ctx.scale(nsc, nsc);
              S2.drawScissorCutout(ctx, plates.portholeImg, 206, 236, 208, 185, -110, -85, 220, 175, null, {
                filter: n % 2 === 0 ? "cyan" : "mono",
                haloWidth: 3.5,
                stroke: "#14110d"
              });
              ctx.restore();
            }

            drawBrassScissorTongs(S2, B, ctx, 1045, 590, 488, 392, 0.88, t, { sparks: true, seed: 912.9 });
          }
        }
      }
    });
  }

  /* ==========================================================================
   * PORTHOLE #10 · PA ("perec-stage" · p10.jpg + atlas-34.webp)
   * Root: Fluted white clam-shell loudspeaker on text-free mossy brick wall
   * ========================================================================== */

  function drawP10Base(ctx, W, H, resolved, plates, S, B, cfg) {
    var opts = cfg || {};
    var t = resolved.t;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    var pBackX = px(S, 0.20, resolved);
    var pBackY = py(S, 0.20, resolved);
    var pWallX = px(S, 0.44, resolved);
    var pWallY = py(S, 0.44, resolved);

    // 1. Turquoise Perec Practical Set Recess from atlas-34.webp
    S.drawScissorCutout(
      ctx, aImg,
      90, 4, 535, 398,
      368 + pBackX, 92 + pBackY, 728, 488,
      [[0.03, 0.03], [0.97, 0.02], [0.98, 0.96], [0.02, 0.97]],
      { haloWidth: 4.0, alpha: 0.92 }
    );
    if (B) {
      B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.18, color: "#99f6e4" });
    }

    // 2. Mossy Red-Brick School Wall Cutout from p10.jpg (sx=102..362, sy=104..434 — strictly < 445, 100% text-free!)
    var wallX = 168 + pWallX * 0.55;
    var wallY = 92 + pWallY * 0.4;
    S.drawScissorCutout(
      ctx, pImg,
      102, 104, 260, 330,
      wallX, wallY, 356, 492,
      [[0.02, 0.02], [0.94, 0.03], [0.97, 0.52], [0.92, 0.97], [0.03, 0.98]],
      { haloWidth: 4.8, stroke: "#14110d" }
    );

    // 3. Attentive School of 4 Trout Cutout from p10.jpg (sx=376..538, sy=362..498)
    var troutY = 368 + (opts.troutFloatY != null ? opts.troutFloatY : (Math.sin(t * 2.2) * 7));
    S.drawScissorCutout(ctx, pImg, 376, 362, 162, 136, 782 + pWallX * 1.1, troutY, 294, 214, null, {
      haloWidth: 4.5,
      stroke: "#14110d"
    });

    return { wallX: wallX, wallY: wallY, hx: wallX + 206, hy: wallY + 226 };
  }

  function drawP10ClamValves(S, ctx, pImg, hx, hy, jawAng, insideFn, opts) {
    var cfg = opts || {};

    if (typeof insideFn === "function") {
      insideFn(ctx, hx, hy);
    }

    // Upper Hinged Clam-Shell Valve Cutout (p10.jpg sx=192..416, sy=164..276)
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(-jawAng);
    S.drawScissorCutout(
      ctx, pImg,
      192, 164, 224, 112,
      -8, -162, 332, 168,
      [[0.02, 0.92], [0.18, 0.34], [0.58, 0.04], [0.97, 0.18], [0.88, 0.68], [0.46, 0.95]],
      { haloWidth: 5.0, stroke: "#14110d" }
    );
    if (typeof cfg.upperDecor === "function") cfg.upperDecor(ctx);
    ctx.restore();

    // Lower Hinged Clam-Shell Valve Cutout (p10.jpg sx=192..420, sy=276..388)
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(jawAng);
    S.drawScissorCutout(
      ctx, pImg,
      192, 276, 228, 112,
      -8, -6, 336, 168,
      [[0.02, 0.08], [0.48, 0.06], [0.96, 0.36], [0.92, 0.84], [0.52, 0.97], [0.16, 0.66]],
      { haloWidth: 5.0, stroke: "#14110d" }
    );
    if (typeof cfg.lowerDecor === "function") cfg.lowerDecor(ctx);
    ctx.restore();

    if (cfg.bracket !== false) {
      S.drawCardboardPuppetPiece(
        ctx,
        [[hx - 54, hy - 28], [hx + 6, hy - 16], [hx + 6, hy + 16], [hx - 54, hy + 28]],
        { tone: "#c99842", ribs: 1 }
      );
      S.drawReinigerFiligreeHinge(ctx, hx - 4, hy, 18, { metal: "brass" });
    }
  }

  function drawSoundArcs(ctx, ox, oy, count, t, r0, r1, colA, colB, widthScale) {
    for (var i = 0; i < count; i++) {
      var u = (((t * 0.85) + i / count) % 1);
      var ar = lerp(r0, r1, u);
      ctx.save();
      ctx.strokeStyle = i % 2 === 0 ? colA : colB;
      ctx.lineWidth = (widthScale || 6.5) * (1 - u * 0.6);
      ctx.beginPath();
      ctx.arc(ox, oy, ar, -0.52, 0.52);
      ctx.stroke();
      ctx.restore();
    }
  }

  function registerPortal10(B, S) {
    B.definePortalGame(10, {
      drawBackdrop: makeBackdropFn(10, { openX: 168, openY: 84, openW: 944, openH: 508, doors: false }),
      drawForeground: function (ctx, W, H, resolved, plates, S2) {
        drawCornerBrassPortholeFrame(S2, ctx, W, H, resolved);
      },

      drawRoot: function (ctx, W, H, resolved, plates, S2) {
        var t = resolved.t;
        var st = drawP10Base(ctx, W, H, resolved, plates, S2, B, {});
        drawCutPaperBubbles(S2, ctx, 10, 7, t, 540, 1040, 110, 520, false, "#fbfaf7");
        var talk = Math.pow(Math.max(0, Math.sin(t * 6.5) * 0.65 + Math.sin(t * 11.2) * 0.35), 2);
        var jawAng = 0.08 + talk * 0.34;

        drawP10ClamValves(S2, ctx, plates.portholeImg, st.hx - talk * 5, st.hy, jawAng, function (c, hx, hy) {
          S2.drawCutoutPaperEdge(c, [[hx + 12, hy - 26], [hx + 92, hy - 54], [hx + 92, hy + 54], [hx + 12, hy + 26]], "#c99842", "#14110d", { paperRim: 2.4 });
          drawSoundArcs(c, hx + 88, hy, 4, t, 135, 420, "#fbfaf7", "#0f8f80", 6.5);
        });
        drawRootHotspotLandmarks(S2, B, ctx, resolved);
      },

      stems: {
        // [✕] Shine Inside Shell: Beam catches shiny brass speaker cone & iridescent pearl microphone inside!
        x: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.45);
          var st = drawP10Base(ctx, W, H, resolved, plates, S2, B, {});

          B.drawVolumetricBeam(ctx, 985, 315, st.hx + 115, st.hy, {
            color: "#fde68a",
            coreColor: "#fffbeb",
            spread: 145 * u,
            intensity: 1.3 * u,
            t: t
          });

          drawP10ClamValves(S2, ctx, plates.portholeImg, st.hx, st.hy, 0.40 * u + 0.08, function (c, hx, hy) {
            S2.drawCutoutPaperEdge(c, [[hx + 16, hy - 34], [hx + 118, hy - 68], [hx + 118, hy + 68], [hx + 16, hy + 34]], "#eab308", "#14110d", { paperRim: 2.8 });
            // Iridescent pearl microphone on brass gooseneck!
            B.drawLanternHalo(c, hx + 162, hy, 88 * u, { color: "#fef08a", coreColor: "#ffffff", intensity: 1.15, t: t });
            c.strokeStyle = "#d4a44c";
            c.lineWidth = 6.0;
            c.beginPath();
            c.moveTo(hx + 70, hy + 36);
            c.quadraticCurveTo(hx + 125, hy + 38, hx + 162, hy + 8);
            c.stroke();
            c.fillStyle = "#fbfaf7";
            c.strokeStyle = "#14110d";
            c.lineWidth = 2.6;
            c.beginPath();
            c.arc(hx + 162, hy - 4, 24, 0, TAU);
            c.fill();
            c.stroke();
          });
        },

        // [○] Gargle Bubble Feedback: Bubbles rush into clam horn making upper shell chatter rapidly!
        o: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var st = drawP10Base(ctx, W, H, resolved, plates, S2, B, {});
          var chatter = 0.06 + Math.abs(Math.sin(t * 24.0)) * 0.36;

          B.drawDeterministicParticles(ctx, "bubbles", st.hx + 240, st.hy, t, { count: 28, loop: true, seed: 1002.3 });
          drawCutPaperBubbles(S2, ctx, 1002, 15, t, st.hx + 110, 940, 130, 520, true, "#ffffff");

          drawP10ClamValves(S2, ctx, plates.portholeImg, st.hx - Math.sin(t * 24) * 4, st.hy, chatter, function (c, hx, hy) {
            drawSoundArcs(c, hx + 90, hy, 5, t * 1.8, 120, 390, "#f87171", "#fbfaf7", 5.5);
          });
        },

        // [△] Read Morning Notice: Mail Snail climbs brass gooseneck bracket right beside clam hinge!
        triangle: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.50);
          var st = drawP10Base(ctx, W, H, resolved, plates, S2, B, {});

          drawP10ClamValves(S2, ctx, plates.portholeImg, st.hx, st.hy, 0.24, function (c, hx, hy) {
            drawSoundArcs(c, hx + 88, hy, 4, t, 135, 385, "#34d399", "#fbfaf7", 5.5);
          });

          var snX = lerp(240, st.hx - 12, u);
          var snY = lerp(520, st.hy - 34, u);
          B.drawSnailSilverTrail(ctx, 240, 525, snX, snY + 10, u, t, { arc: 22 });
          S2.drawMailSnail(ctx, snX, snY, 1.32, t, { rot: -0.25 * (1 - u), postcard: true });
        },

        // [□] Prop Jaw Open: Brass scissor-tongs wedge vertically between upper & lower clam valves!
        square: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.42);
          var st = drawP10Base(ctx, W, H, resolved, plates, S2, B, {});

          drawP10ClamValves(S2, ctx, plates.portholeImg, st.hx, st.hy, 0.46 * u + 0.08, function (c, hx, hy) {
            // Vertical brass dental prop strut wedged between valves!
            S2.drawCardboardPuppetPiece(c, [[hx + 178, hy - 86 * u], [hx + 202, hy - 86 * u], [hx + 202, hy + 86 * u], [hx + 178, hy + 86 * u]], {
              tone: "#eab308",
              ribs: 2,
              pins: [[hx + 190, hy - 62 * u], [hx + 190, hy + 62 * u]]
            });
          });
          drawBrassScissorTongs(S2, B, ctx, 1045, 590, st.hx + 205, st.hy + 12, 0.45, t, { sparks: true, seed: 1004.7 });
        }
      },

      outcomes: {
        x: {
          // 1. x.probable: Giant snapping creek monster jaw with fangs & lashing red tongue + cowering Turkey (SHOWCASE @ 6.0s!)
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var st = drawP10Base(ctx, W, H, resolved, plates, S2, B, {});
            var snap = 0.14 + Math.abs(Math.sin(t * 7.2)) * 0.44;

            B.drawVolumetricBeam(ctx, 560, 595, st.hx + 145, st.hy - 20, {
              color: "#ef4444",
              coreColor: "#fde68a",
              spread: 195,
              intensity: 1.2,
              t: t
            });

            drawP10ClamValves(
              S2,
              ctx,
              plates.portholeImg,
              st.hx,
              st.hy,
              snap,
              function (c, hx, hy) {
                var whip = Math.sin(t * 10.0) * 24;
                S2.drawCutoutPaperEdge(
                  c,
                  [[hx + 34, hy - 14], [hx + 195, hy - 26 + whip], [hx + 275, hy + whip * 1.4], [hx + 238, hy + 24 + whip], [hx + 34, hy + 18]],
                  "#d42a1e",
                  "#14110d",
                  { paperRim: 3.0 }
                );
              },
              {
                upperDecor: function (c) {
                  S2.drawCutoutPaperEdge(c, [[68, -14], [92, 34], [118, -12], [146, 38], [174, -14], [202, 36], [230, -16], [256, 30], [276, -22]], "#fbfaf7", "#14110d", { paperRim: 2.2, shadow: false });
                  S2.drawCutoutPaperEdge(c, [[135, -128], [176, -154], [212, -122], [174, -96]], "#fde047", "#14110d", { paperRim: 3.0 });
                  c.fillStyle = "#14110d";
                  c.fillRect(171, -142, 7, 34);
                },
                lowerDecor: function (c) {
                  S2.drawCutoutPaperEdge(c, [[72, 14], [98, -32], [126, 14], [156, -36], [186, 14], [214, -32], [242, 16], [268, -28], [286, 20]], "#fbfaf7", "#14110d", { paperRim: 2.2, shadow: false });
                }
              }
            );
            S2.drawTurkeyCutawayBadge(ctx, 132, 498, 1.04, t, { dispatch: 0.9 });
          },

          // 2. x.plausible: Friendly school intercom broadcasting cafeteria icons + Brook Trout & Mail Snail
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var st = drawP10Base(ctx, W, H, resolved, plates, S2, B, {});

            B.drawVolumetricBeam(ctx, 980, 260, st.hx + 120, st.hy, {
              color: "#fde68a",
              spread: 165,
              intensity: 1.0,
              t: t
            });

            drawP10ClamValves(S2, ctx, plates.portholeImg, st.hx, st.hy, 0.28 + Math.sin(t * 6.0) * 0.12, function (c, hx, hy) {
              S2.drawCutoutPaperEdge(c, [[hx + 18, hy - 30], [hx + 108, hy - 58], [hx + 108, hy + 58], [hx + 18, hy + 30]], "#eab308", "#14110d", { paperRim: 2.4 });
              drawSoundArcs(c, hx + 105, hy, 5, t, 130, 440, "#34d399", "#fde047", 6.5);
            });

            // Floating cut-paper cafeteria icons (apple, sandwich, carton — 0 text!)
            for (var ic = 0; ic < 3; ic++) {
              var iu = (((t * 0.45) + ic / 3) % 1);
              var ix = lerp(st.hx + 260, 860, iu);
              var iy = st.hy - 30 + Math.sin(iu * TAU + ic) * 42;
              drawCutPaperStar(S2, ctx, ix, iy, 18, 9, 5 + ic, t + ic, ["#d42a1e", "#fde047", "#0f8f80"][ic], null);
            }

            S2.drawBrookTrout(ctx, 856, 254 + Math.sin(t * 3.0) * 6, 1.18, t, false);
            S2.drawMailSnail(ctx, 648, 536, 1.22, t, { hasReply: true });
          },

          // 3. x.preposterous: Telescoping copper space megaphone firing neon hexagons to Alien Saucer
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var u = enterAmt(resolved, 0.45);
            var st = drawP10Base(ctx, W, H, resolved, plates, S2, B, { troutFloatY: -48 + Math.sin(t * 2.6) * 12 });

            S2.drawAlienSaucer(ctx, 720, 100, 1.20, t, st.hx + 220, st.hy);
            B.drawTractorRings(ctx, 720, 122, st.hx + 220, st.hy, t, { spread: 145, rings: 5 });

            drawP10ClamValves(S2, ctx, plates.portholeImg, st.hx, st.hy, 0.42, function (c, hx, hy) {
              S2.drawCardboardPuppetPiece(
                c,
                [[hx + 28, hy - 22], [hx + 255 * u, hy - 76], [hx + 255 * u, hy + 76], [hx + 28, hy + 22]],
                { tone: "#c27832", ribs: 3, pins: [[hx + 96 * u, hy], [hx + 188 * u, hy]] }
              );
              for (var mi = 0; mi < 4; mi++) {
                var mu = (((t * 0.72) + mi * 0.25) % 1);
                var mx = lerp(hx + 260, 720, mu);
                var my = lerp(hy, 126, mu);
                var mr = lerp(34, 88, Math.sin(mu * Math.PI));
                c.save();
                c.translate(mx, my);
                c.rotate(t * 2.2 + mi);
                c.strokeStyle = mi % 2 === 0 ? "#a855f7" : "#34d399";
                c.lineWidth = 4.0;
                c.beginPath();
                for (var hq = 0; hq < 6; hq++) {
                  var ha = (hq / 6) * TAU;
                  var px0 = Math.cos(ha) * mr;
                  var py0 = Math.sin(ha) * mr * 0.62;
                  if (hq === 0) c.moveTo(px0, py0); else c.lineTo(px0, py0);
                }
                c.closePath();
                c.stroke();
                c.restore();
              }
            });
          }
        },

        o: {
          // 4. o.probable: Muffled underwater brass tuba foghorn shaking mortar dust + Turkey covering ears
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var shake = Math.sin(t * 22) * 4;
            var st = drawP10Base(ctx, W, H, resolved, plates, S2, B, {});

            drawP10ClamValves(S2, ctx, plates.portholeImg, st.hx + shake, st.hy, 0.44, function (c, hx, hy) {
              // Giant flaring brass foghorn bell inside clam!
              S2.drawCardboardPuppetPiece(c, [[hx + 24, hy - 28], [hx + 225, hy - 98], [hx + 225, hy + 98], [hx + 24, hy + 28]], {
                tone: "#d4a44c",
                ribs: 2,
                pin: { x: hx + 120, y: hy, r: 5.0, metal: "brass" }
              });
              // Wobbly booming foghorn rings!
              for (var w = 0; w < 4; w++) {
                var wu = (((t * 1.1) + w * 0.25) % 1);
                var wr = 130 + wu * 340;
                c.strokeStyle = w % 2 === 0 ? "#fde047" : "#fbfaf7";
                c.lineWidth = 8.0 * (1 - wu * 0.65);
                c.beginPath();
                c.arc(hx + 185, hy, wr, -0.58, 0.58);
                c.stroke();
              }
            });

            B.drawDeterministicParticles(ctx, "bubbles", st.hx + 240, st.hy, t, { count: 22, loop: true, seed: 1005.1 });
            B.drawDeterministicParticles(ctx, "ink_puffs", st.wallX + 180, st.wallY + 140, t, { count: 14, loop: true, seed: 1005.9, color: "#d6d3d1" });
            S2.drawTurkeyCutawayBadge(ctx, 132, 496 + shake * 0.6, 1.04, t, { dispatch: 0.85 });
          },

          // 5. o.plausible: Beatboxing clam recess dance party + dancing Brook Trout & Mail Snail (SHOWCASE @ 11.8s!)
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var beat = Math.pow(Math.max(0, Math.sin(t * 9.6)), 3);
            var st = drawP10Base(ctx, W, H, resolved, plates, S2, B, { troutFloatY: Math.sin(t * 9.6) * -18 });

            drawP10ClamValves(
              S2,
              ctx,
              plates.portholeImg,
              st.hx,
              st.hy,
              0.08 + beat * 0.44,
              function (c, hx, hy) {
                drawSoundArcs(c, hx + 96, hy, 5, t * 1.5, 130, 420, "#ec4899", "#06b6d4", 7.0);
              },
              {
                upperDecor: function (c) {
                  // Cool backwards red cap & shades on beatboxing upper clam valve!
                  S2.drawCutoutPaperEdge(c, [[95, -148], [215, -148], [205, -188], [115, -188]], "#d42a1e", "#14110d", { paperRim: 2.5 });
                  S2.drawCutoutPaperEdge(c, [[52, -148], [105, -148], [105, -134], [52, -134]], "#d42a1e", "#14110d", { paperRim: 2.0 });
                  S2.drawCutoutPaperEdge(c, [[165, -92], [255, -82], [246, -54], [162, -64]], "#14110d", "#fbfaf7", { paperRim: 2.2 });
                }
              }
            );

            // Popping neon rhythm triangles & diamonds!
            var cols = ["#ec4899", "#fde047", "#06b6d4", "#10b981"];
            for (var rt = 0; rt < 8; rt++) {
              var ru = (((t * 0.85) + rt / 8) % 1);
              var rx = lerp(st.hx + 230, 920, ru);
              var ry = st.hy + Math.sin(ru * TAU * 1.5 + rt) * 115;
              drawCutPaperStar(S2, ctx, rx, ry, 16, 7, 3 + (rt % 2), t * 3 + rt, cols[rt % 4], null);
            }
            B.drawDeterministicParticles(ctx, "bubbles", st.hx + 225, st.hy, t, { count: 18, loop: true, seed: 1006.4 });

            // Brook Trout dancing a jig + Mail Snail!
            S2.drawBrookTrout(ctx, 848, 258 + Math.sin(t * 9.6) * 18, 1.22, t, false, { tilt: Math.sin(t * 9.6) * 0.22 });
            S2.drawMailSnail(ctx, 648, 534 + Math.abs(Math.sin(t * 9.6)) * -14, 1.26, t, { hasReply: true, postcard: true });
          },

          // 6. o.preposterous: Floating Valkyrie opera diva clam jaw belting aria shards under Alien Saucer
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            drawP10Base(ctx, W, H, resolved, plates, S2, B, { troutFloatY: -45 });

            var divaX = 545;
            var divaY = 308 + Math.sin(t * 2.8) * 14;
            S2.drawAlienSaucer(ctx, 640, 98, 1.20, t, divaX + 80, divaY);
            B.drawTractorRings(ctx, 640, 120, divaX + 80, divaY, t, { spread: 165, rings: 5 });

            drawP10ClamValves(
              S2,
              ctx,
              plates.portholeImg,
              divaX,
              divaY,
              0.38 + Math.sin(t * 8.0) * 0.14,
              function (c, hx, hy) {
                B.drawLanternHalo(c, hx + 120, hy, 130, { color: "#f43f5e", intensity: 0.9, t: t });
              },
              {
                bracket: false,
                upperDecor: function (c) {
                  // Winged brass Valkyrie opera helmet + golden braids!
                  S2.drawCardboardPuppetPiece(c, [[95, -138], [155, -196], [215, -138]], { tone: "#eab308", ribs: 2, pin: { x: 155, y: -152, r: 4.5, metal: "brass" } });
                  S2.drawCutoutPaperEdge(c, [[95, -152], [38, -215], [62, -162], [28, -178], [88, -138]], "#fbfaf7", "#14110d", { paperRim: 2.2 });
                  S2.drawCutoutPaperEdge(c, [[215, -152], [272, -215], [248, -162], [282, -178], [222, -138]], "#fbfaf7", "#14110d", { paperRim: 2.2 });
                }
              }
            );

            // Orbiting crystalline glass-note shards!
            for (var sh = 0; sh < 8; sh++) {
              var sa = t * 1.9 + (sh / 8) * TAU;
              drawCutPaperStar(S2, ctx, divaX + 120 + Math.cos(sa) * 210, divaY + Math.sin(sa) * 105, 18, 6, 4, sa, sh % 2 === 0 ? "#a5f3fc" : "#fda4af", null);
            }
          }
        },

        triangle: {
          // 7. triangle.probable: Mail Snail reads holiday all-clear scroll + dancing Turkey
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var st = drawP10Base(ctx, W, H, resolved, plates, S2, B, {});

            drawP10ClamValves(S2, ctx, plates.portholeImg, st.hx, st.hy, 0.30, function (c, hx, hy) {
              drawSoundArcs(c, hx + 95, hy, 5, t, 130, 440, "#10b981", "#fde047", 7.0);
            });

            // Mail Snail perched on bracket holding unrolled wax-sealed green-ribbon scroll (0 text!)
            S2.drawMailSnail(ctx, st.hx - 8, st.hy - 38, 1.34, t, { postcard: false });
            S2.drawCutoutPaperEdge(ctx, [[st.hx + 22, st.hy - 62], [st.hx + 76, st.hy - 62], [st.hx + 76, st.hy - 12], [st.hx + 22, st.hy - 12]], "#fbfaf5", "#14110d", { paperRim: 2.2 });
            ctx.fillStyle = "#10b981";
            ctx.beginPath();
            ctx.arc(st.hx + 49, st.hy - 37, 9, 0, TAU);
            ctx.fill();

            B.drawDeterministicParticles(ctx, "confetti", 680, 280, t, { count: 20, loop: true, seed: 1007.3 });
            S2.drawTurkeyCutawayBadge(ctx, 132, 492 + Math.sin(t * 7.5) * 6, 1.06, t, { dispatch: 0.95 });
          },

          // 8. triangle.plausible: Red-plaid metal lunchbox slides out spilling apple, sandwich & thermos to Brook Trout!
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var u = enterAmt(resolved, 0.45);
            var st = drawP10Base(ctx, W, H, resolved, plates, S2, B, {});

            drawP10ClamValves(
              S2,
              ctx,
              plates.portholeImg,
              st.hx,
              st.hy,
              0.44,
              function (c, hx, hy) {
                var lbX = hx + 90 + 85 * u;
                var lbY = hy;
                // Red-plaid metal lunchbox with folding black handle!
                S2.drawCardboardPuppetPiece(c, [[lbX - 58, lbY - 44], [lbX + 58, lbY - 44], [lbX + 58, lbY + 44], [lbX - 58, lbY + 44]], {
                  tone: "#d42a1e",
                  ribs: 2,
                  pins: [[lbX - 36, lbY - 22], [lbX + 36, lbY - 22]]
                });
                c.strokeStyle = "#14110d";
                c.lineWidth = 5.5;
                c.beginPath();
                c.arc(lbX, lbY - 44, 24, Math.PI, 0);
                c.stroke();

                // Spilling triangle sandwich, red apple & teal thermos!
                var bob = Math.sin(t * 3.8) * 8;
                S2.drawCutoutPaperEdge(c, [[lbX + 74, lbY - 36 + bob], [lbX + 144, lbY - 10 + bob], [lbX + 82, lbY + 34 + bob]], "#fde68a", "#14110d", { paperRim: 2.5 });
                var apX = lbX + 188;
                var apY = lbY + 18 - bob;
                var apPts = [];
                for (var ai = 0; ai < 10; ai++) {
                  var aa = (ai / 10) * TAU;
                  apPts.push([apX + Math.cos(aa) * 22, apY + Math.sin(aa) * 20]);
                }
                S2.drawCutoutPaperEdge(c, apPts, "#ef4444", "#14110d", { paperRim: 2.2 });
              }
            );

            S2.drawBrookTrout(ctx, 846, 258 + Math.sin(t * 3.2) * 6, 1.18, t, false);
            S2.drawMailSnail(ctx, st.hx - 8, st.hy - 38, 1.28, t, { hasReply: true });
          },

          // 9. triangle.preposterous: Universal translator greets Alien Saucer with interlocking rings (SHOWCASE FINALE @ 16.0s!)
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var st = drawP10Base(ctx, W, H, resolved, plates, S2, B, { troutFloatY: -36 + Math.sin(t * 2.6) * 10 });

            S2.drawAlienSaucer(ctx, 735, 102, 1.24, t, st.hx + 180, st.hy);
            B.drawLanternHalo(ctx, 735, 92, 84, { color: "#34d399", intensity: 0.95, t: t });

            drawP10ClamValves(S2, ctx, plates.portholeImg, st.hx, st.hy, 0.36 + Math.sin(t * 5.5) * 0.08, function (c, hx, hy) {
              // Dual interlocking teal (creek) & rust-red (Saucer) sound rings meeting mid-water!
              for (var r = 0; r < 5; r++) {
                var ru = (((t * 0.65) + r / 5) % 1);
                var upX = lerp(hx + 165, 735, ru);
                var upY = lerp(hy, 125, ru);
                c.strokeStyle = "#0f8f80";
                c.lineWidth = 4.2;
                c.beginPath();
                c.arc(upX, upY, 26 + ru * 42, 0, TAU);
                c.stroke();

                var dnX = lerp(735, hx + 165, ru);
                var dnY = lerp(125, hy, ru);
                c.strokeStyle = "#d42a1e";
                c.lineWidth = 4.2;
                c.beginPath();
                c.arc(dnX, dnY, 26 + ru * 42, 0, TAU);
                c.stroke();
              }
            });

            // 5-bar Close Encounters glowing color-organ board floating mid-stage (0 text!)
            var barCols = ["#ef4444", "#f59e0b", "#fde047", "#10b981", "#3b82f6"];
            for (var bi = 0; bi < 5; bi++) {
              var pulse = 0.5 + 0.5 * Math.sin(t * 7.5 - bi * 0.9);
              S2.drawCutoutPaperEdge(
                ctx,
                [[555 + bi * 34, 212 - pulse * 18], [583 + bi * 34, 212 - pulse * 18], [583 + bi * 34, 248], [555 + bi * 34, 248]],
                barCols[bi],
                "#14110d",
                { paperRim: 1.8, shadow: false }
              );
            }

            S2.drawMailSnail(ctx, st.hx - 4, st.hy - 36, 1.32, t, { hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          // 10. square.probable: Brass tongs gently click clam valves shut & latch brass clasp + relaxed Turkey
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var st = drawP10Base(ctx, W, H, resolved, plates, S2, B, {});

            drawP10ClamValves(S2, ctx, plates.portholeImg, st.hx, st.hy, 0.012, null);

            // Neat brass hook clasp locking the front lips shut!
            var lipX = st.hx + 298;
            var lipY = st.hy;
            S2.drawCardboardPuppetPiece(ctx, [[lipX - 16, lipY - 38], [lipX + 16, lipY - 38], [lipX + 16, lipY + 38], [lipX - 16, lipY + 38]], {
              tone: "#eab308",
              ribs: 1,
              pins: [[lipX, lipY - 22], [lipX, lipY + 22]]
            });
            drawBrassScissorTongs(S2, B, ctx, 1045, 590, lipX + 12, lipY + 8, 0.92, t, { sparks: false });
            S2.drawTurkeyCutawayBadge(ctx, 132, 496, 1.04, t, { dispatch: 0.4 });
          },

          // 11. square.plausible: Wedged-open clam reveals dry wax-paper sandwich & juice box for Brook Trout!
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var st = drawP10Base(ctx, W, H, resolved, plates, S2, B, {});

            drawP10ClamValves(S2, ctx, plates.portholeImg, st.hx, st.hy, 0.46, function (c, hx, hy) {
              // Brass prop strut + hidden wax-paper sandwich & striped-straw juice box on paper doily!
              S2.drawCardboardPuppetPiece(c, [[hx + 84, hy - 84], [hx + 104, hy - 84], [hx + 104, hy + 84], [hx + 84, hy + 84]], {
                tone: "#d4a44c",
                ribs: 2
              });
              S2.drawCutoutPaperEdge(c, [[hx + 132, hy + 28], [hx + 198, hy - 34], [hx + 236, hy + 28]], "#fef3c7", "#14110d", { paperRim: 2.8 });
              S2.drawCutoutPaperEdge(c, [[hx + 248, hy - 28], [hx + 288, hy - 28], [hx + 288, hy + 30], [hx + 248, hy + 30]], "#10b981", "#14110d", { paperRim: 2.2 });
              c.strokeStyle = "#ef4444";
              c.lineWidth = 4.0;
              c.beginPath();
              c.moveTo(hx + 268, hy - 28);
              c.lineTo(hx + 276, hy - 50);
              c.lineTo(hx + 290, hy - 52);
              c.stroke();
            });

            drawBrassScissorTongs(S2, B, ctx, 1045, 590, st.hx + 104, st.hy + 55, 0.5, t, { sparks: false });
            S2.drawBrookTrout(ctx, 845, 256 + Math.sin(t * 3.5) * 6, 1.20, t, false);
            S2.drawMailSnail(ctx, 648, 536, 1.22, t, { hasReply: true });
          },

          // 12. square.preposterous: Tuning-fork feedback levitates 9 cut-paper red bricks into Saucer orbit!
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var st = drawP10Base(ctx, W, H, resolved, plates, S2, B, { troutFloatY: -45 });

            S2.drawAlienSaucer(ctx, 685, 98, 1.20, t, 640, 290);
            B.drawTractorRings(ctx, 685, 120, 640, 310, t, { spread: 165, rings: 5 });

            drawP10ClamValves(S2, ctx, plates.portholeImg, st.hx, st.hy, 0.42, function (c, hx, hy) {
              B.drawLanternHalo(c, hx + 150, hy, 120, { color: "#fde047", intensity: 1.2, t: t });
            });

            drawBrassScissorTongs(S2, B, ctx, 1045, 590, st.hx + 152, st.hy, 0.7, t, { sparks: true, seed: 1012.8 });

            // Shimmering golden standing-wave sine ribbon + 9 levitating red bricks orbiting under UFO!
            ctx.save();
            ctx.strokeStyle = "#fde047";
            ctx.lineWidth = 4.0;
            ctx.beginPath();
            for (var sx = st.hx + 150; sx <= 920; sx += 18) {
              var sy = st.hy + Math.sin(sx * 0.045 - t * 12) * 32;
              if (sx === st.hx + 150) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
            ctx.restore();

            for (var br = 0; br < 9; br++) {
              var ba = t * 1.5 + (br / 9) * TAU;
              var bx = 685 + Math.cos(ba) * 215;
              var by = 235 + Math.sin(ba) * 76;
              ctx.save();
              ctx.translate(bx, by);
              ctx.rotate(ba * 0.6);
              S2.drawCardboardPuppetPiece(ctx, [[-30, -14], [30, -14], [30, 14], [-30, 14]], {
                tone: br % 2 === 0 ? "#9a3412" : "#b45309",
                ribs: 1
              });
              ctx.restore();
            }
          }
        }
      }
    });
  }

  /* ==========================================================================
   * PORTHOLE #11 · TANK ("queneau-rostrum" · p11.jpg + atlas-07.webp)
   * Root: Orange-and-white Igloo picnic water cooler trailing clear vinyl hoses
   * ========================================================================== */

  function drawP11Base(ctx, W, H, resolved, plates, S, B, cfg) {
    var opts = cfg || {};
    var t = resolved.t;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    var pFarX = px(S, 0.22, resolved);
    var pFarY = py(S, 0.22, resolved);
    var pMidX = px(S, 0.52, resolved);
    var pMidY = py(S, 0.52, resolved);

    // 1. Far Plane: Sutherland Sketchpad geometric construction lines + atlas-07 grating cutouts + green workshop door
    ctx.save();
    ctx.translate(pFarX, pFarY);
    ctx.strokeStyle = "rgba(20, 17, 13, 0.16)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.arc(548, 304, 212, 0, TAU);
    ctx.moveTo(240, 304); ctx.lineTo(890, 304);
    ctx.moveTo(548, 68);  ctx.lineTo(548, 540);
    ctx.stroke();
    ctx.setLineDash([]);

    S.drawScissorCutout(ctx, aImg, 8, 215, 200, 185, 92, 168, 236, 216,
      [[0.04, 0.08], [0.92, 0.03], [0.97, 0.88], [0.10, 0.96]],
      { filter: opts.cyanAtlas ? "cyan" : "sepia", haloWidth: 4.5, rot: -0.05 }
    );
    S.drawScissorCutout(ctx, aImg, 255, 175, 415, 205, 575, 150, 390, 210,
      [[0.05, 0.06], [0.95, 0.04], [0.97, 0.92], [0.03, 0.95]],
      { filter: opts.cyanAtlas ? "cyan" : "mono", haloWidth: 4.5, rot: 0.04 }
    );

    S.drawTornPaperFlat(ctx, 1024, 86, 178, 456, {
      fill: opts.cyanAtlas ? "#1b3340" : "#253b1b",
      paperColor: "#f6f0e2",
      deckle: 8,
      stroke: "#14110d"
    });
    // Blank ruled geometric plaque on door (0 text!)
    S.drawCutoutPaperEdge(ctx, [[1056, 152], [1170, 152], [1170, 192], [1056, 192]], "#f4efe2", "#14110d", { paperRim: 2, shadow: false });
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(1074, 168); ctx.lineTo(1152, 168);
    ctx.moveTo(1086, 178); ctx.lineTo(1140, 178);
    ctx.stroke();
    S.drawSplitPin(ctx, 1046, 314, 5.2, { metal: "brass" });
    ctx.restore();

    if (B) {
      B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.18, color: "#7dd3fc" });
    }

    // 2. Mid Plane: Creek Kelp & Boulder Bed Cutouts from p11.jpg
    S.drawScissorCutout(ctx, pImg, 104, 218, 102, 168, 224 + pMidX, 248 + pMidY, 146, 232,
      [[0.15, 0.04], [0.85, 0.06], [0.95, 0.94], [0.08, 0.96]],
      { haloWidth: 4.5, rot: Math.sin(t * 1.6) * 0.04 - 0.06 }
    );
    S.drawScissorCutout(ctx, pImg, 145, 368, 350, 150, 290 + pMidX, 392 + pMidY, 470, 176,
      [[0.04, 0.22], [0.28, 0.04], [0.74, 0.08], [0.97, 0.28], [0.94, 0.95], [0.06, 0.95]],
      { haloWidth: 5.0 }
    );

    return { pMidX: pMidX, pMidY: pMidY };
  }

  // Draws the orange Igloo cooler with its text-masking kraft-and-brass collar + hinged white lid + spigot
  function drawP11Cooler(S, ctx, pImg, cx, cy, tilt, t, opts) {
    var cfg = opts || {};

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);

    // Real orange Igloo cooler cutout from p11.jpg (178, 182, 218, 226)
    S.drawScissorCutout(ctx, pImg, 178, 182, 218, 226, -124, -142, 248, 268,
      [[0.08, 0.10], [0.48, 0.02], [0.90, 0.08], [0.96, 0.88], [0.82, 0.98], [0.16, 0.97], [0.04, 0.84]],
      { haloWidth: 5.0, filter: cfg.filter || "none" }
    );

    // Handmade kraft-and-brass mechanical collar over cooler midband (100% covers any painted letters on p11.jpg!)
    S.drawCardboardPuppetPiece(
      ctx,
      [[-110, -16], [110, -16], [114, 26], [-114, 26]],
      {
        tone: cfg.collarTone || "#e8dfce",
        ribs: 1,
        pins: [
          { x: -88, y: 5, r: 4.2, metal: "brass" },
          { x: 0, y: 5, r: 4.2, metal: "silver" },
          { x: 88, y: 5, r: 4.2, metal: "brass" }
        ]
      }
    );

    if (typeof cfg.bodyOverlay === "function") {
      cfg.bodyOverlay(ctx);
    }

    // Articulated Hinged White Cardboard Cooler Lid
    if (cfg.lidPopY) {
      // Tethered pop-off lid launched high above barrel!
      ctx.strokeStyle = "#fbfaf7";
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(-92, -124);
      ctx.quadraticCurveTo(-135, -124 - cfg.lidPopY * 0.5, -88, -124 - cfg.lidPopY);
      ctx.stroke();

      ctx.save();
      ctx.translate(-88, -124 - cfg.lidPopY);
      ctx.rotate(-0.28 + Math.sin(t * 9) * 0.14);
      S.drawCardboardPuppetPiece(ctx, [[-8, -24], [198, -24], [204, 8], [-4, 10]], {
        tone: "#f4f1e8",
        ribs: 1,
        pin: { x: 4, y: -4, r: 4.8, metal: "brass" }
      });
      ctx.restore();
    } else {
      var lidAng = cfg.lidOpen != null ? cfg.lidOpen : (-0.12 - Math.abs(Math.sin(t * 2.1)) * 0.12);
      ctx.save();
      ctx.translate(-96, -124);
      ctx.rotate(lidAng);
      S.drawCardboardPuppetPiece(ctx, [[-8, -22], [198, -22], [204, 8], [-4, 10]], {
        tone: "#f4f1e8",
        ribs: 1,
        pin: { x: 4, y: -4, r: 4.8, metal: "brass" }
      });
      ctx.restore();
    }

    // Recessed white push-button spigot at bottom-right of cooler
    var spigPress = cfg.spigotPress != null ? cfg.spigotPress : (Math.max(0, Math.sin(t * 4.4)) * 5);
    S.drawCardboardPuppetPiece(ctx, [[32, 74 + spigPress], [68, 74 + spigPress], [68, 108], [32, 108]], {
      tone: "#f5f2e9",
      ribs: 1,
      pin: { x: 50, y: 92, r: 4.0, metal: "silver" }
    });

    ctx.restore();

    var spigLocalX = 52;
    var spigLocalY = 96;
    return {
      spigX: cx + spigLocalX * Math.cos(tilt) - spigLocalY * Math.sin(tilt),
      spigY: cy + spigLocalX * Math.sin(tilt) + spigLocalY * Math.cos(tilt)
    };
  }

  function drawP11VinylHoses(ctx, spigX, spigY, ends, t, tubeCol, reverseFlow) {
    for (var hi = 0; hi < ends.length; hi++) {
      var hx1 = ends[hi][0];
      var hy1 = ends[hi][1];
      var sag = 68 + hi * 22 + Math.sin(t * 2.5 + hi) * 14;
      var midX = lerp(spigX, hx1, 0.52) + Math.sin(t * 2.2 + hi) * 15;
      var midY = Math.max(spigY, hy1) + sag;

      ctx.save();
      ctx.lineCap = "round";
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(spigX, spigY);
      ctx.quadraticCurveTo(midX, midY, hx1, hy1);
      ctx.stroke();

      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 9.5;
      ctx.stroke();

      ctx.strokeStyle = tubeCol || "#bde6de";
      ctx.lineWidth = 5.5;
      ctx.stroke();

      // Traveling bolus beads along clear vinyl hose!
      for (var b = 0; b < 2; b++) {
        var rawU = ((t * (0.58 + hi * 0.12) + hi * 0.33 + b * 0.5) % 1);
        var bu = reverseFlow ? (1 - rawU) : rawU;
        var omt = 1 - bu;
        var bx = omt * omt * spigX + 2 * omt * bu * midX + bu * bu * hx1;
        var by = omt * omt * spigY + 2 * omt * bu * midY + bu * bu * hy1;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(bx, by, 3.6, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawP11ForegroundKelp(S, ctx, pImg, resolved) {
    S.drawScissorCutout(
      ctx, pImg,
      434, 345, 92, 152,
      934 + px(S, 0.85, resolved) * 0.4, 398, 126, 196,
      [[0.18, 0.04], [0.86, 0.06], [0.94, 0.96], [0.08, 0.96]],
      { haloWidth: 4.0, rot: Math.sin(resolved.t * 1.9 + 1) * 0.04 }
    );
  }

  function registerPortal11(B, S) {
    B.definePortalGame(11, {
      drawBackdrop: makeBackdropFn(11),
      drawForeground: function (ctx, W, H, resolved, plates, S2) {
        drawCornerBrassPortholeFrame(S2, ctx, W, H, resolved);
      },

      drawRoot: function (ctx, W, H, resolved, plates, S2) {
        var t = resolved.t;
        var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, {});
        var cx = 505 + base.pMidX;
        var cy = 315 + base.pMidY;
        var tilt = -0.34 + Math.sin(t * 1.5) * 0.02;

        B.drawLanternHalo(ctx, 520, 540, 145, { color: "#fbbf24", intensity: 0.72, t: t });
        var sp = drawP11Cooler(S2, ctx, plates.portholeImg, cx, cy, tilt, t, {});
        drawIKLimb(S2, ctx, 276 + base.pMidX, 444 + base.pMidY, 168, 148, sp.spigX - 22, sp.spigY - 8, -1, {
          tone1: "#7f8285", tone2: "#a8aaac", metal: "brass"
        });
        drawP11VinylHoses(ctx, sp.spigX, sp.spigY, [[795, 198], [865, 290], [835, 448]], t, "#bde6de", false);
        drawCutPaperBubbles(S2, ctx, 11, 10, t, 540, 740, 95, 390, false, "#e2f5f0");
        S2.drawBrookTrout(ctx, 905, 326 + Math.sin(t * 2.0) * 6, 1.06, t, false);
        drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
        drawRootHotspotLandmarks(S2, B, ctx, resolved);
      },

      stems: {
        // [✕] Candling Beam: X-ray candling lamp shows floating ice cubes & coiled hoses inside barrel!
        x: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.45);
          var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, {});
          var cx = 505 + base.pMidX;
          var cy = 315 + base.pMidY;
          var tilt = -0.30;

          B.drawVolumetricBeam(ctx, 210, 585, cx, cy, {
            color: "#fde68a",
            coreColor: "#fffbeb",
            spread: 175 * u,
            intensity: 1.35 * u,
            t: t
          });

          var sp = drawP11Cooler(S2, ctx, plates.portholeImg, cx, cy, tilt, t, {});
          drawP11VinylHoses(ctx, sp.spigX, sp.spigY, [[795, 198], [865, 290], [835, 448]], t, "#fef08a", false);

          // Candling X-Ray window over cooler barrel showing floating ice cubes & coiled inner siphon!
          B.drawXRayOverlay(ctx, cx + 4, cy - 8, 175, 195, u, function (c, x0, y0) {
            c.strokeStyle = "#38bdf8";
            c.lineWidth = 4.5;
            c.beginPath();
            for (var s = 0; s < 4; s++) {
              c.ellipse(x0, y0 + 28 + s * 12, 48, 12, 0, 0, TAU);
            }
            c.stroke();
            // 5 bobbing translucent cut-paper ice cubes!
            for (var ic = 0; ic < 5; ic++) {
              var ix = x0 - 48 + ic * 24;
              var iy = y0 - 46 + Math.sin(t * 3.5 + ic) * 10 + (ic % 2) * 18;
              S2.drawCutoutPaperEdge(c, [[ix - 12, iy - 12], [ix + 12, iy - 10], [ix + 10, iy + 12], [ix - 11, iy + 10]], "#bae6fd", "#e0f2fe", { paperRim: 1.2, shadow: false });
            }
          }, { t: t, borderColor: "#fde047", bg: "rgba(28, 25, 23, 0.82)" });

          drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
        },

        // [○] Back-Flush Hose: Ballast air zips backward through clear vinyl hoses, popping spigot bubbles!
        o: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, {});
          var cx = 502 + base.pMidX + Math.sin(t * 16) * 3;
          var cy = 315 + base.pMidY;
          var tilt = -0.32 + Math.sin(t * 8) * 0.04;

          var sp = drawP11Cooler(S2, ctx, plates.portholeImg, cx, cy, tilt, t, {
            lidOpen: -0.26 - Math.abs(Math.sin(t * 9.0)) * 0.22
          });
          drawP11VinylHoses(ctx, sp.spigX, sp.spigY, [[855, 240], [895, 315], [860, 425]], t * 2.2, "#7dd3fc", true);

          drawCutPaperBubbles(S2, ctx, 1102, 18, t, sp.spigX - 65, sp.spigX + 95, 85, sp.spigY, true, "#ffffff");
          B.drawDeterministicParticles(ctx, "bubbles", sp.spigX, sp.spigY - 12, t, { count: 28, loop: true, seed: 1102.5 });
          drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
        },

        // [△] Check Inspection Tag: Mail Snail crawls onto ridged white cooler lid inspecting duct-taped joint!
        triangle: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.50);
          var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, {});
          var cx = 505 + base.pMidX;
          var cy = 315 + base.pMidY;
          var sp = drawP11Cooler(S2, ctx, plates.portholeImg, cx, cy, -0.26, t, { lidOpen: -0.02 });
          drawP11VinylHoses(ctx, sp.spigX, sp.spigY, [[795, 198], [865, 290], [835, 448]], t, "#bde6de", false);

          // Silver duct-tape wrap patch on hose splice + Mail Snail perched on white cooler lid!
          S2.drawCardboardPuppetPiece(ctx, [[sp.spigX + 18, sp.spigY + 6], [sp.spigX + 58, sp.spigY + 14], [sp.spigX + 52, sp.spigY + 42], [sp.spigX + 12, sp.spigY + 34]], {
            tone: "#cbd5e1",
            ribs: 2
          });

          var lidX = lerp(295, cx - 22, u);
          var lidY = lerp(485, cy - 148, u);
          B.drawSnailSilverTrail(ctx, 295, 490, lidX, lidY + 10, u, t, { arc: 38 });
          S2.drawMailSnail(ctx, lidX, lidY, 1.32, t, { rot: -0.24, postcard: true });
          drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
        },

        // [□] Press Push-Spigot: Brass scissor-tongs thumb recessed white spigot unleashing fizzy stream!
        square: function (ctx, W, H, resolved, plates, S2) {
          var t = resolved.t;
          var u = enterAmt(resolved, 0.40);
          var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, {});
          var cx = 505 + base.pMidX;
          var cy = 315 + base.pMidY;
          var sp = drawP11Cooler(S2, ctx, plates.portholeImg, cx, cy, -0.32, t, { spigotPress: 9 * u });

          // Pressurized sparkling turquoise-and-white fizzy stream jetting out of pressed spigot!
          ctx.save();
          for (var j = 0; j < 3; j++) {
            ctx.strokeStyle = j === 0 ? "#ffffff" : (j === 1 ? "#38bdf8" : "#2dd4bf");
            ctx.lineWidth = 10 - j * 2.5;
            ctx.beginPath();
            ctx.moveTo(sp.spigX, sp.spigY);
            ctx.quadraticCurveTo(sp.spigX + 145, sp.spigY - 35 + Math.sin(t * 12 + j) * 14, sp.spigX + 310 * u, sp.spigY + 95);
            ctx.stroke();
          }
          ctx.restore();

          B.drawDeterministicParticles(ctx, "bubbles", sp.spigX + 180, sp.spigY + 25, t, { count: 22, loop: true, seed: 1104.8 });
          drawBrassScissorTongs(S2, B, ctx, 1020, 590, sp.spigX + 10, sp.spigY - 6, 0.88, t, { sparks: true, seed: 1104.2 });
          drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
        }
      },

      outcomes: {
        x: {
          // 1. x.probable: Emergency Apollo-13 air-supply scrubber & brass PSI dial feeding Turkey! (SHOWCASE @ 6.0s!)
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var pop = popAmt(resolved, 0.42);
            var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, {});
            var cx = 515 + base.pMidX;
            var cy = 315 + base.pMidY;

            B.drawVolumetricBeam(ctx, 220, 585, cx + 20, cy - 20, {
              color: "#fde68a",
              spread: 185,
              intensity: 1.15,
              t: t
            });

            // Atlas-07 multi-cable air manifold receiving hoses on upper-right!
            S2.drawScissorCutout(ctx, plates.atlasImg, 250, 18, 360, 125, 785, 145, 240, 120,
              [[0.04, 0.08], [0.96, 0.05], [0.94, 0.92], [0.08, 0.95]],
              { filter: "sepia", haloWidth: 4.0, rot: -0.08 }
            );

            var sp = drawP11Cooler(S2, ctx, plates.portholeImg, cx, cy, -0.28, t, {
              lidOpen: 0,
              bodyOverlay: function (c) {
                // Apollo-13 cardboard square-cartridge scrubber & sweeping brass PSI dial on cooler!
                c.save();
                c.scale(pop, pop);
                S2.drawCardboardPuppetPiece(c, [[-68, -112], [18, -112], [18, -36], [-68, -36]], { tone: "#cbd5e1", ribs: 2 });
                S2.drawCutoutPaperEdge(c, [[30, -196], [108, -196], [108, -122], [30, -122]], "#f6f0df", "#14110d", { paperRim: 3 });
                c.fillStyle = "#fbfaf5";
                c.strokeStyle = "#14110d";
                c.lineWidth = 2.6;
                c.beginPath(); c.arc(69, -159, 28, 0, TAU); c.fill(); c.stroke();
                c.fillStyle = "#d42a1e";
                c.beginPath(); c.moveTo(69, -159); c.arc(69, -159, 23, -0.4, 0.45); c.closePath(); c.fill();
                var na = -1.8 + Math.sin(t * 5.2) * 0.95;
                c.strokeStyle = "#14110d";
                c.lineWidth = 2.8;
                c.beginPath(); c.moveTo(69, -159); c.lineTo(69 + Math.cos(na) * 21, -159 + Math.sin(na) * 21); c.stroke();
                S2.drawSplitPin(c, 69, -159, 3.8, { metal: "brass" });
                c.restore();
              }
            });

            drawP11VinylHoses(ctx, sp.spigX, sp.spigY, [[868, 226], [928, 312], [198, 492]], t, "#7dd3fc", false);

            // Sutherland crimson dashed constraint lines (0 text!)
            ctx.strokeStyle = "rgba(212, 42, 30, 0.72)";
            ctx.lineWidth = 1.8;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(sp.spigX, sp.spigY);
            ctx.lineTo(868, 226);
            ctx.stroke();
            ctx.setLineDash([]);

            S2.drawTurkeyCutawayBadge(ctx, 134, 498, 1.06, t, { dispatch: 0.85 });
            drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
          },

          // 2. x.plausible: Glowing neon lemon-lime sports drink lantern + Brook Trout & paper cone cups!
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, {});
            var cx = 498 + base.pMidX;
            var cy = 315 + base.pMidY;

            B.drawLanternHalo(ctx, cx, cy, 235, { color: "#84cc16", coreColor: "#ecfccb", intensity: 1.35, t: t });
            var sp = drawP11Cooler(S2, ctx, plates.portholeImg, cx, cy, -0.30, t, {});

            B.drawVolumetricBeam(ctx, sp.spigX, sp.spigY, 845, 435, {
              sourceRadius: 14,
              spread: 95,
              color: "#a3e635",
              coreColor: "#f7fee7",
              intensity: 1.2,
              t: t
            });

            // 4 glowing lime-filled pleated paper cone cups lined up for Brook Trout & Mail Snail!
            for (var c = 0; c < 4; c++) {
              var cupX = 685 + c * 54;
              var cupY = 468 + Math.sin(t * 3.8 + c) * 4;
              S2.drawCutoutPaperEdge(ctx, [[cupX - 18, cupY - 24], [cupX + 18, cupY - 24], [cupX, cupY + 24]], "#fbfaf7", "#14110d", { paperRim: 2.0 });
              S2.drawCutoutPaperEdge(ctx, [[cupX - 14, cupY - 20], [cupX + 14, cupY - 20], [cupX, cupY + 8]], "#84cc16", "#14110d", { paperRim: 1.0, shadow: false });
            }

            S2.drawBrookTrout(ctx, 886, 336 + Math.sin(t * 3.2) * 7, 1.18, t, false);
            S2.drawMailSnail(ctx, 635, 534, 1.22, t, { hasReply: true });
            drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
          },

          // 3. x.preposterous: Frozen alien cryo-sleep pod with miniature 3-eyed astronaut inside under UFO!
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var pop = enterAmt(resolved, 0.45);
            var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, { cyanAtlas: true });
            var cx = 525 + base.pMidX;
            var cy = 332 + base.pMidY;

            S2.drawAlienSaucer(ctx, 560, 104, 1.20, t, cx, cy);
            B.drawTractorRings(ctx, 560, 126, cx, cy, t, { spread: 160, rings: 5 });

            var sp = drawP11Cooler(S2, ctx, plates.portholeImg, cx, cy, -0.14, t, {
              filter: "cyan",
              collarTone: "#93c5fd",
              lidOpen: 0,
              bodyOverlay: function (c) {
                c.save();
                c.globalAlpha = pop;
                // Frosted hexagonal cryo-window revealing waking 3-eyed green astronaut!
                S2.drawCutoutPaperEdge(c, [[-52, -92], [52, -92], [64, -18], [46, 56], [-46, 56], [-64, -18]], "#cffafe", "#14110d", { paperRim: 3.5 });
                S2.drawCardboardPuppetPiece(c, [[-22, 42], [-26, -8], [0, -58], [26, -8], [22, 42]], { tone: "#34d399", ribs: 2, shadow: false });
                for (var ce = -1; ce <= 1; ce++) {
                  c.fillStyle = "#fef08a";
                  c.strokeStyle = "#14110d";
                  c.lineWidth = 1.5;
                  c.beginPath(); c.arc(ce * 11, -26, 4.4, 0, TAU); c.fill(); c.stroke();
                }
                var icicles = [[-116, -110, -152, -80], [112, -104, 154, -74], [-104, 86, -146, 120], [98, 92, 142, 126]];
                for (var ic = 0; ic < icicles.length; ic++) {
                  var q = icicles[ic];
                  S2.drawCutoutPaperEdge(c, [[q[0], q[1] - 12], [q[2], q[3]], [q[0] + 14, q[1] + 12]], "#ecfeff", "#14110d", { paperRim: 2 });
                }
                c.restore();
              }
            });
            drawP11VinylHoses(ctx, sp.spigX, sp.spigY, [[795, 198], [865, 290]], t, "#67e8f9", false);
            drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
          }
        },

        o: {
          // 4. o.probable: Pop-off white lid geyser eruption on keeper strap + ducking Turkey!
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var u = enterAmt(resolved, 0.40);
            var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, {});
            var cx = 515 + base.pMidX;
            var cy = 335 + base.pMidY;

            // Roaring vertical foam geyser column erupting out of open cooler top!
            S2.drawCutoutPaperEdge(
              ctx,
              [[cx - 88, cy - 110], [cx - 125, 68], [cx + 45, 68], [cx + 62, cy - 110]],
              "rgba(240, 253, 250, 0.88)",
              "#14110d",
              { paperRim: 3.5 }
            );
            drawCutPaperBubbles(S2, ctx, 1105, 22, t, cx - 115, cx + 55, 55, cy - 90, true, "#ffffff");
            B.drawDeterministicParticles(ctx, "bubbles", cx - 35, cy - 125, t, { count: 28, loop: true, seed: 1105.4 });

            var sp = drawP11Cooler(S2, ctx, plates.portholeImg, cx, cy, -0.18, t, {
              lidPopY: 145 * u + Math.sin(t * 7.5) * 14
            });
            drawP11VinylHoses(ctx, sp.spigX, sp.spigY, [[845, 260], [875, 385]], t * 2, "#7dd3fc", true);
            S2.drawTurkeyCutawayBadge(ctx, 134, 512, 1.04, t, { dispatch: 0.8 });
            drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
          },

          // 5. o.plausible: Fizzy creek soda fountain bar with striped awning & 3 soda cups! (SHOWCASE @ 11.8s!)
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var pop = popAmt(resolved, 0.42);
            var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, {});
            var cx = 495 + base.pMidX;
            var cy = 318 + base.pMidY;

            var sp = drawP11Cooler(S2, ctx, plates.portholeImg, cx, cy, -0.28, t, {
              lidOpen: -0.05,
              bodyOverlay: function (c) {
                // Red-and-white striped soda-fountain awning atop cooler!
                c.save();
                c.translate(0, -156);
                c.scale(pop, pop);
                for (var stIdx = -3; stIdx <= 2; stIdx++) {
                  var sx0 = stIdx * 38;
                  S2.drawCutoutPaperEdge(
                    c,
                    [[sx0, -36], [sx0 + 38, -36], [sx0 + 36, 12], [sx0 + 2, 12]],
                    stIdx % 2 === 0 ? "#d42a1e" : "#fbfaf5",
                    "#14110d",
                    { paperRim: 1.5, shadow: false }
                  );
                }
                c.restore();
              }
            });

            var cupEnds = [[748, 412], [838, 426], [928, 410]];
            drawP11VinylHoses(ctx, sp.spigX, sp.spigY, cupEnds, t, "#fb923c", false);

            var cupCols = ["#f59e0b", "#ef4444", "#10b981"];
            for (var ci = 0; ci < 3; ci++) {
              var cupX = cupEnds[ci][0];
              var cupY = cupEnds[ci][1] + 24 + Math.sin(t * 4.2 + ci) * 4;
              S2.drawCutoutPaperEdge(ctx, [[cupX - 20, cupY - 26], [cupX + 20, cupY - 26], [cupX + 15, cupY + 24], [cupX - 15, cupY + 24]], cupCols[ci], "#14110d", { paperRim: 2.8 });
              ctx.strokeStyle = "#fbfaf5";
              ctx.lineWidth = 4.5;
              ctx.beginPath();
              ctx.moveTo(cupX + 4, cupY - 24);
              ctx.lineTo(cupX + 10, cupY - 48);
              ctx.lineTo(cupX + 24, cupY - 50);
              ctx.stroke();
            }

            drawCutPaperBubbles(S2, ctx, 1106, 16, t, 720, 950, 120, 410, true, "#ffffff");
            S2.drawBrookTrout(ctx, 908, 294 + Math.sin(t * 2.8) * 7, 1.18, t, false);
            S2.drawMailSnail(ctx, 668, 534, 1.24, t, { hasReply: true, postcard: true });
            drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
          },

          // 6. o.preposterous: Foil-wrapped spacewalk umbilical tether hose snaking up into Alien Saucer!
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var u = enterAmt(resolved, 0.50);
            var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, { cyanAtlas: true });
            var cx = 495 + base.pMidX;
            var cy = 335 + base.pMidY;

            S2.drawAlienSaucer(ctx, 735, 106, 1.24, t, cx + 90, cy - 20);
            B.drawTractorRings(ctx, 735, 128, cx + 90, cy - 20, t, { spread: 150, rings: 5 });

            var sp = drawP11Cooler(S2, ctx, plates.portholeImg, cx, cy, -0.24, t, { collarTone: "#cbd5e1" });

            // Giant silver-wrapped S-curve spacewalk umbilical hose plugging into Saucer airlock!
            var endX = lerp(sp.spigX, 735, u);
            var endY = lerp(sp.spigY, 122, u);
            ctx.save();
            ctx.lineCap = "round";
            ctx.strokeStyle = "#fbfaf7";
            ctx.lineWidth = 22;
            ctx.beginPath();
            ctx.moveTo(sp.spigX, sp.spigY);
            ctx.bezierCurveTo(sp.spigX + 260, sp.spigY + 40, 520, 210, endX, endY);
            ctx.stroke();
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 15;
            ctx.setLineDash([12, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            // Traveling glowing magenta-and-cyan plasma fuel pulses along umbilical!
            for (var p = 0; p < 5; p++) {
              var pu = (((t * 0.65) + p / 5) % 1) * u;
              var px0 = lerp(sp.spigX, 735, pu) + Math.sin(pu * TAU) * 58;
              var py0 = lerp(sp.spigY, 122, pu);
              B.drawLanternHalo(ctx, px0, py0, 42, { color: p % 2 === 0 ? "#ec4899" : "#22d3ee", intensity: 1.0, t: t });
            }
            drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
          }
        },

        triangle: {
          // 7. triangle.probable: Mail Snail floats waterproof red-stamped litter citation card upward + approving Turkey
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, {});
            var cx = 505 + base.pMidX;
            var cy = 320 + base.pMidY;
            var sp = drawP11Cooler(S2, ctx, plates.portholeImg, cx, cy, -0.28, t, { lidOpen: 0 });
            drawP11VinylHoses(ctx, sp.spigX, sp.spigY, [[815, 290], [845, 435]], t, "#bde6de", false);

            // Waterproof citation card tied to a rising cork bobber (0 text — bold red circle-slash emblem!)
            var cardY = 235 - ((t * 36) % 95);
            var cardX = 768 + Math.sin(t * 2.5) * 14;
            S2.drawCutoutPaperEdge(ctx, [[cardX - 48, cardY - 34], [cardX + 48, cardY - 34], [cardX + 48, cardY + 34], [cardX - 48, cardY + 34]], "#fbfaf5", "#14110d", { paperRim: 3.0 });
            ctx.strokeStyle = "#d42a1e";
            ctx.lineWidth = 5.0;
            ctx.beginPath();
            ctx.arc(cardX, cardY, 20, 0, TAU);
            ctx.moveTo(cardX - 14, cardY - 14);
            ctx.lineTo(cardX + 14, cardY + 14);
            ctx.stroke();

            // Red-and-white cork bobber pulling card surface-ward
            S2.drawCutoutPaperEdge(ctx, [[cardX - 14, cardY - 68], [cardX + 14, cardY - 68], [cardX + 14, cardY - 46], [cardX - 14, cardY - 46]], "#d42a1e", "#14110d", { paperRim: 1.8 });

            S2.drawMailSnail(ctx, cx - 18, cy - 148, 1.30, t, { rot: -0.24, postcard: true });
            S2.drawTurkeyCutawayBadge(ctx, 134, 498, 1.04, t, { dispatch: 0.65 });
            drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
          },

          // 8. triangle.plausible: Mail Snail's marathon hydration water-stop table + sweatband Brook Trout!
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, {});
            var cx = 478 + base.pMidX;
            var cy = 320 + base.pMidY;
            var sp = drawP11Cooler(S2, ctx, plates.portholeImg, cx, cy, -0.26, t, {});

            // Flat rock marathon hydration table with 4 miniature pleated paper water cups!
            S2.drawCardboardPuppetPiece(ctx, [[655, 438], [915, 438], [928, 466], [642, 466]], {
              tone: "#78716c",
              ribs: 2
            });
            drawP11VinylHoses(ctx, sp.spigX, sp.spigY, [[705, 408]], t, "#38bdf8", false);

            for (var mc = 0; mc < 4; mc++) {
              var mx = 688 + mc * 56;
              var my = 418;
              S2.drawCutoutPaperEdge(ctx, [[mx - 14, my - 20], [mx + 14, my - 20], [mx + 10, my + 18], [mx - 10, my + 18]], "#e0f2fe", "#14110d", { paperRim: 2.0 });
            }

            // Brook Trout swimmer wearing crimson athletic headband grabbing hydration cup + Mail Snail!
            var btX = 835;
            var btY = 328 + Math.sin(t * 3.8) * 7;
            S2.drawBrookTrout(ctx, btX, btY, 1.20, t, false);
            S2.drawCutoutPaperEdge(ctx, [[btX - 58, btY - 24], [btX - 28, btY - 26], [btX - 26, btY - 14], [btX - 56, btY - 12]], "#d42a1e", "#14110d", { paperRim: 1.5, shadow: false });
            S2.drawMailSnail(ctx, 682, 396, 1.24, t, { hasReply: true });
            drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
          },

          // 9. triangle.preposterous: Overheated Alien Saucer dips low to refill radiator coolant from Igloo! (SHOWCASE FINALE @ 16.0s!)
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var coolCycle = 0.5 + 0.5 * Math.sin(t * 1.8);
            var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, { cyanAtlas: true });
            var cx = 488 + base.pMidX;
            var cy = 338 + base.pMidY;

            var saucerX = 785;
            var saucerY = 164 + Math.sin(t * 2.2) * 8;

            // Radiator steam puffs rising off Saucer dome as it cools from red -> frosty cyan!
            for (var st = 0; st < 5; st++) {
              var su = (((t * 0.85) + st * 0.2) % 1);
              drawCutPaperStar(S2, ctx, saucerX - 45 + st * 24, saucerY - 28 - su * 75, 15 * (1 - su * 0.4), 10 * (1 - su * 0.4), 6, t + st, "#fbfaf7", null);
            }
            B.drawLanternHalo(ctx, saucerX, saucerY, 155, {
              color: coolCycle > 0.5 ? "#22d3ee" : "#ef4444",
              intensity: 1.15,
              t: t
            });
            S2.drawAlienSaucer(ctx, saucerX, saucerY, 1.28, t, cx + 40, cy);

            var sp = drawP11Cooler(S2, ctx, plates.portholeImg, cx, cy, -0.24, t, { lidOpen: 0 });
            // Clear Igloo hose hooked straight onto Saucer's radiator grill!
            drawP11VinylHoses(ctx, sp.spigX, sp.spigY, [[saucerX - 24, saucerY + 18]], t * 1.8, "#38bdf8", false);

            // Mail Snail perched on cooler lid directing coolant refill with signal paddle!
            S2.drawMailSnail(ctx, cx - 12, cy - 150, 1.34, t, {
              rot: -0.20,
              hasReply: true,
              hasAlienStamp: true
            });
            drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
          }
        },

        square: {
          // 10. square.probable: Snapped vinyl hose thrashes figure-eight loops like a wild creek eel + gasping Turkey!
          probable: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, {});
            var cx = 488 + base.pMidX;
            var cy = 322 + base.pMidY;
            var sp = drawP11Cooler(S2, ctx, plates.portholeImg, cx, cy, -0.32, t, { spigotPress: 10 });

            // Wildly whipping 6-segment vinyl eel-hose jetting bubble spray!
            ctx.save();
            ctx.lineCap = "round";
            ctx.strokeStyle = "#fbfaf7";
            ctx.lineWidth = 18;
            ctx.beginPath();
            var tipX = sp.spigX;
            var tipY = sp.spigY;
            ctx.moveTo(tipX, tipY);
            for (var seg = 1; seg <= 6; seg++) {
              tipX = sp.spigX + seg * 66;
              tipY = sp.spigY - 40 + Math.sin(t * 11.5 - seg * 0.9) * (24 + seg * 12);
              ctx.lineTo(tipX, tipY);
            }
            ctx.stroke();
            ctx.strokeStyle = "#14110d";
            ctx.lineWidth = 12;
            ctx.stroke();
            ctx.strokeStyle = "#2dd4bf";
            ctx.lineWidth = 7;
            ctx.stroke();
            ctx.restore();

            B.drawDeterministicParticles(ctx, "bubbles", tipX, tipY, t, { count: 24, loop: true, seed: 1110.6 });
            drawBrassScissorTongs(S2, B, ctx, 1035, 590, sp.spigX + 8, sp.spigY + 12, 0.9, t, { sparks: false });
            S2.drawTurkeyCutawayBadge(ctx, 134, 498, 1.04, t, { dispatch: 0.85 });
            drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
          },

          // 11. square.plausible: Push-button cold creek shower for Brook Trout scrubbing with yellow sponge!
          plausible: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, {});
            var cx = 485 + base.pMidX;
            var cy = 322 + base.pMidY;
            var sp = drawP11Cooler(S2, ctx, plates.portholeImg, cx, cy, -0.30, t, { spigotPress: 10 });

            // Curved overhead shower pipe & brass showerhead spraying sparkling blue droplet fan!
            drawP11VinylHoses(ctx, sp.spigX, sp.spigY, [[835, 155]], t, "#38bdf8", false);
            S2.drawCardboardPuppetPiece(ctx, [[805, 155], [865, 155], [882, 182], [788, 182]], {
              tone: "#eab308",
              ribs: 1,
              pin: { x: 835, y: 166, r: 4.0, metal: "brass" }
            });

            // Fan of sparkling shower droplets!
            for (var ray = -3; ray <= 3; ray++) {
              for (var d = 0; d < 4; d++) {
                var du = (((t * 1.8) + d * 0.25 + Math.abs(ray) * 0.08) % 1);
                var dx = 835 + ray * 26 * (0.4 + du);
                var dy = 188 + du * 235;
                S2.drawCutoutPaperEdge(ctx, [[dx, dy - 8], [dx + 5, dy + 4], [dx - 5, dy + 4]], "#38bdf8", "#14110d", { paperRim: 1.2, shadow: false });
              }
            }

            drawBrassScissorTongs(S2, B, ctx, 1035, 590, sp.spigX + 8, sp.spigY + 8, 0.9, t, { sparks: false });

            // Brook Trout in pink shower cap scrubbing behind gills with yellow sponge + Mail Snail!
            var btX = 838;
            var btY = 384 + Math.sin(t * 4.5) * 6;
            S2.drawBrookTrout(ctx, btX, btY, 1.18, t, false);
            S2.drawCutoutPaperEdge(ctx, [[btX - 66, btY - 18], [btX - 44, btY - 42], [btX - 18, btY - 38], [btX - 14, btY - 16]], "#f472b6", "#14110d", { paperRim: 2.0 });
            S2.drawCutoutPaperEdge(ctx, [[btX - 38, btY + 12 + Math.sin(t * 10) * 8], [btX - 10, btY + 12 + Math.sin(t * 10) * 8], [btX - 10, btY + 32 + Math.sin(t * 10) * 8], [btX - 38, btY + 32 + Math.sin(t * 10) * 8]], "#fde047", "#14110d", { paperRim: 1.8 });
            S2.drawMailSnail(ctx, 668, 534, 1.22, t, { hasReply: true });
            drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
          },

          // 12. square.preposterous: Twin-nozzle water-rocket jetpack launches orange Igloo cooler into orbit beside UFO!
          preposterous: function (ctx, W, H, resolved, plates, S2) {
            var t = resolved.t;
            var u = enterAmt(resolved, 0.50);
            var base = drawP11Base(ctx, W, H, resolved, plates, S2, B, { cyanAtlas: true });

            S2.drawAlienSaucer(ctx, 765, 118, 1.22, t, 515, 225);
            B.drawTractorRings(ctx, 765, 140, 515, 235, t, { spread: 140, rings: 4 });

            var rocketX = 515 + Math.sin(t * 6.0) * 6;
            var rocketY = lerp(320, 208, u) + Math.cos(t * 4.5) * 8;

            // Twin high-pressure white-and-cyan water rocket plumes blasting downward from side handles!
            for (var nz = -1; nz <= 1; nz += 2) {
              var nx = rocketX + nz * 96;
              var ny = rocketY + 75;
              S2.drawCutoutPaperEdge(
                ctx,
                [[nx - 18, ny], [nx - 42, 575], [nx + 42, 575], [nx + 18, ny]],
                "#e0f2fe",
                "#0284c7",
                { paperRim: 3.0 }
              );
              B.drawDeterministicParticles(ctx, "bubbles", nx, 520, t, { count: 18, loop: true, seed: 1112 + nz });
            }

            drawP11Cooler(S2, ctx, plates.portholeImg, rocketX, rocketY, -0.04, t, {
              lidOpen: 0,
              spigotPress: 12
            });
            drawBrassScissorTongs(S2, B, ctx, 1045, 590, 625, 455, 0.4, t, { sparks: true, seed: 1112.9 });
            drawP11ForegroundKelp(S2, ctx, plates.portholeImg, resolved);
          }
        }
      }
    });
  }

  // ---------- Register All 5 Pod 1B V3 Games (#07..#11) ----------

  function initPod1B() {
    var B = getBG();
    var S = getStage();
    if (!B || typeof B.definePortalGame !== "function") return false;
    registerPortal07(B, S);
    registerPortal08(B, S);
    registerPortal09(B, S);
    registerPortal10(B, S);
    registerPortal11(B, S);
    return true;
  }

  initPod1B();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { initPod1B: initPod1B, ids: PORTAL_IDS };
  }
})(typeof window !== "undefined" ? window : globalThis);
