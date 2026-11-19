/* ============================================================================
 * Turkey Sub · V2 Multi-SCION & BOLAS Rostrum Remake — Crew 01 (#01–#05)
 * File: portals/remake-01.js
 *
 * Registers window.PORTAL_REMAKE_SCENES[1..5] (1280×720, 24fps, 16.0s = 384f):
 *   #01 · Bow    — cardboard-parallax · Monsieur Ripois × S01 Terry Gilliam
 *   #02 · Galley — queneau-rostrum    · Oubapo × S11 Video Puppetry Tabletop
 *   #03 · Starbd — perec-stage        · Outypopo × S17 South Park Cutout Stage
 *   #04 · Belly  — daumier-litho      · La Mort en ce jardin × S02 Lotte Reiniger
 *   #05 · Scope  — duchamp-optic      · 99 Ways / Anémic × S13 Nora Willett
 *
 * Every porthole combines real foraged plate scissor-cutouts (./portholes/p01..05.jpg
 * + ./assets/atlas-stills/atlas-21,47,49,39,53.webp) with handmade split-pin
 * mottled grey-cardboard & deckle-paper puppets, IK2 limbs, spring follow-through,
 * and 4-variation 16.0s Ouxpo storytelling (A: 0–4s, B: 4–8s, C: 8–12s, D: 12–16s).
 *
 * STRICT PAELEO BLIND INVARIANT:
 *   When state && state.showCaptions === false, emits ZERO fillText/strokeText
 *   calls and masks out any painted plate words so blind evaluation is 100% pure!
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var SCENES = (root.PORTAL_REMAKE_SCENES = root.PORTAL_REMAKE_SCENES || {});

  function getStage() {
    return root.SCION_STAGE;
  }

  // Kick off asynchronous plate preloading immediately when script loads in browser
  if (root.SCION_STAGE && typeof root.SCION_STAGE.preloadPortalPlates === "function") {
    root.SCION_STAGE.preloadPortalPlates([1, 2, 3, 4, 5]);
  }

  // ---------- Shared Handmade Craft Helpers (Zero Text!) ----------

  function circlePoly(n, rx, ry, cx, cy, jitter, seed) {
    var pts = [];
    var count = n || 16;
    var radX = rx == null ? 0.48 : rx;
    var radY = ry == null ? 0.48 : ry;
    var ox = cx == null ? 0.5 : cx;
    var oy = cy == null ? 0.5 : cy;
    var jit = jitter == null ? 0.014 : jitter;
    var S = getStage();
    for (var i = 0; i < count; i++) {
      var a = (i / count) * TAU;
      var h = S ? (S.hash((seed || 7.1) + i * 3.7) - 0.5) * jit : 0;
      pts.push([
        ox + Math.cos(a) * (radX + h),
        oy + Math.sin(a) * (radY + h)
      ]);
    }
    return pts;
  }

  function drawCardboardLimb(ctx, x0, y0, x1, y1, w0, w1, tone, pinMetal) {
    var S = getStage();
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

  function drawCutBubbleCluster(ctx, cx, cy, count, spreadX, spreadY, t, seed, tint) {
    var S = getStage();
    ctx.save();
    for (var i = 0; i < count; i++) {
      var u = ((t * (0.38 + S.hash(seed + i * 2.1) * 0.35) + i / count) % 1);
      var bx = cx + (S.hash(seed + i * 5.3) - 0.5) * spreadX + Math.sin(t * 2.6 + i) * 9;
      var by = cy - u * spreadY;
      var r = 4.5 + S.hash(seed + i * 9.7) * 9.5;
      var alpha = Math.sin(u * Math.PI) * 0.85;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#fbfaf5";
      ctx.beginPath();
      ctx.arc(bx, by, r + 2.2, 0, TAU);
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

  // Interactive + Story Mail Snail Courier Layer
  function drawStoryAndInteractiveSnail(ctx, W, H, beat, t, state, opts) {
    var S = getStage();
    var cfg = opts || {};
    var floorY = cfg.floorY != null ? cfg.floorY : 566;

    // 1. Variation II (Beat B): Turkey Cutaway Badge + Mail Snail Crossing Outbound
    if (beat.index === 1) {
      var uB = beat.u;
      var badgeScale = 0.96 + 0.08 * S.spring(beat.localT, 0.08, 12, 4.5);
      S.drawTurkeyCutawayBadge(ctx, cfg.badgeX || 126, cfg.badgeY || 492, badgeScale, t, {
        dispatch: S.smooth(0.05, 0.55, uB)
      });
      var snailU = S.smooth(0.10, 0.92, uB);
      var sx = S.lerp(215, 930, snailU);
      var sy = floorY - Math.sin(snailU * Math.PI) * 34;
      var sRot = -Math.cos(snailU * Math.PI) * 0.08;
      S.drawMailSnail(ctx, sx, sy, 1.22, t, {
        rot: sRot,
        postcard: true,
        hasReply: false
      });
    }

    // 2. Variation III (Beat C): Mail Snail Climbing Right Edge with Stamped Trout Reply
    if (beat.index === 2) {
      var uC = beat.u;
      var climbU = S.smooth(0.06, 0.94, uC);
      var rx = cfg.rightX || 1166;
      var ry = S.lerp(528, 224, climbU);
      S.drawMailSnail(ctx, rx, ry, 1.16, t, {
        rot: -Math.PI * 0.48,
        postcard: true,
        hasReply: uC > 0.24
      });
    }

    // 3. Live Interactive Override when player.js dispatches Snail Mail!
    if (state && state.snailActive && typeof state.snailT === "number") {
      var stU = S.clamp(state.snailT, 0, 1);
      var ix = S.lerp(180, 1110, stU);
      var iy = 540 - Math.sin(stU * Math.PI) * 120;
      S.drawMailSnail(ctx, ix, iy, 1.32, t, {
        rot: -Math.cos(stU * Math.PI) * 0.22,
        postcard: true,
        hasReply: stU > 0.5,
        hasAlienStamp: stU > 0.82
      });
    }
  }

  /* ==========================================================================
   * PORTHOLE #01 · BOW — "cardboard-parallax"
   * Workshop: Monsieur Ripois · Director: S01 Terry Gilliam
   * Plates: ./portholes/p01.jpg + ./assets/atlas-stills/atlas-21.webp
   *   (A) A giant Size 11 rubber boot
   *   (B) A sunken wooden shipwreck
   *   (C) A pinching crab's dark cave
   *   (D) The Emperor's lost moon-boot
   * ========================================================================== */
  var BOOT_POLY = [
    [0.29, 0.02], [0.58, 0.03], [0.90, 0.07],
    [0.77, 0.34], [0.66, 0.57], [0.76, 0.73],
    [0.96, 0.83], [0.97, 0.96], [0.68, 0.97],
    [0.42, 0.90], [0.35, 0.85], [0.22, 0.83],
    [0.03, 0.74], [0.09, 0.56], [0.18, 0.32]
  ];

  function renderP01(ctx, W, H, rawT, state) {
    var S = getStage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(1);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // Plane 0: Silver-gelatin monochrome backdrop (la-mort-en-ce-jardin register)
    S.drawBolasBackdrop(ctx, W, H, "cardboard-parallax", 1, t, state, { pillarbox: true });

    var pxFar = S.parallaxX(0.24, t, state);
    var pyFar = S.parallaxY(0.20, t, state);
    var pxMid = S.parallaxX(0.58, t, state);
    var pyMid = S.parallaxY(0.45, t, state);
    var pxNear = S.parallaxX(1.05, t, state);

    // Plane 1 (Far): Scissor-cut Submarine Search-Cone strips from atlas-21.webp
    var aw1 = aImg ? aImg.naturalWidth : 740;
    var ah1 = aImg ? aImg.naturalHeight : 416;
    S.drawScissorCutout(
      ctx, aImg,
      aw1 * 0.04, ah1 * 0.11, aw1 * 0.90, ah1 * 0.34,
      128 + pxFar, 34 + pyFar, 760, 178,
      [[0.02, 0.08], [0.54, 0.03], [0.98, 0.10], [0.96, 0.90], [0.45, 0.95], [0.03, 0.86]],
      { filter: "mono", haloWidth: 3.5, alpha: 0.82, seed: 11.2 }
    );
    S.drawScissorCutout(
      ctx, aImg,
      aw1 * 0.48, ah1 * 0.38, aw1 * 0.44, ah1 * 0.52,
      790 + pxFar * 1.2, 118 + pyFar, 356, 236,
      [[0.06, 0.05], [0.92, 0.04], [0.96, 0.92], [0.08, 0.95]],
      { filter: "mono", haloWidth: 3.5, alpha: 0.80, seed: 19.4 }
    );

    // Subtle water caustics & ballast bubbles
    S.drawWaterCaustics(ctx, W, STAGE_H_SAFE(S), t, 0.11);
    if (beat.ballastOn) {
      drawCutBubbleCluster(ctx, 640, 560, 12, 760, 420, t, 101, "rgba(210,225,225,0.75)");
    }

    // Plane 2 (Mid-Back): Creek riverbed torn-paper terrace & monochrome botanical plates from p01.jpg
    S.drawTornPaperFlat(ctx, 84 + pxMid * 0.4, 492 + pyMid, 1112, 150, {
      fill: beat.index === 3 ? "#5a5c60" : "#34393b",
      paperColor: "#e8e4da",
      deckle: 6.5,
      seed: 104.7
    });

    // Left & right creek reed cutouts from p01.jpg
    S.drawScissorCutout(
      ctx, pImg,
      108, 214, 114, 194,
      110 + pxMid, 286 + pyMid, 198, 276,
      [[0.06, 0.08], [0.55, 0.02], [0.94, 0.24], [0.96, 0.94], [0.05, 0.96]],
      { filter: beat.index === 0 ? "sepia" : "mono", haloWidth: 4.5, rot: Math.sin(t * 1.5) * 0.03, seed: 13.1 }
    );
    S.drawScissorCutout(
      ctx, pImg,
      432, 336, 96, 152,
      972 + pxMid * 1.1, 338 + pyMid, 178, 236,
      [[0.12, 0.05], [0.88, 0.04], [0.95, 0.94], [0.06, 0.96]],
      { filter: beat.index === 0 ? "sepia" : "mono", haloWidth: 4.5, rot: -Math.sin(t * 1.7 + 1) * 0.035, seed: 17.8 }
    );

    // Bottom cockpit brass searchlight cone when lamp is ON
    S.drawLampBeam(ctx, W, 638, t, state, {
      x: 620, y: 615,
      aimX: 610 + Math.sin(t * 0.9) * 35,
      spread: 265,
      alpha: beat.index === 3 ? 0.09 : 0.22
    });

    // Plane 3 (Hero Stage): 4 Monsieur Ripois × Gilliam Cutout Variations!
    if (beat.index === 0) {
      // --- VARIATION I (A): "A giant Size 11 rubber boot" ---
      var stompCycle = (beat.localT * 0.85) % 1;
      var stompDown = S.smooth(0.0, 0.32, stompCycle) * (1 - 0.32 * S.smooth(0.55, 0.95, stompCycle));
      var impact = S.springImpulse(stompCycle, 0.30, 18, 5.5);

      // IK-articulated cardboard trouser leg above the rubber boot
      var hipX = 560 + pxMid * 0.5;
      var hipY = -28;
      var ankleX = 602 + pxMid * 0.6;
      var ankleY = 148 + stompDown * 58 + impact * 9;
      var legIK = S.solveIK2(hipX, hipY, 118, 112, ankleX, ankleY, 1);
      drawCardboardLimb(ctx, hipX, hipY, legIK.jx, legIK.jy, 44, 38, "#6a6965", "silver");
      drawCardboardLimb(ctx, legIK.jx, legIK.jy, ankleX, ankleY, 38, 34, "#54534f", "silver");

      // Scissor-cut Size 11 Rubber Boot from p01.jpg!
      var bootX = 456 + pxMid * 0.6;
      var bootY = 112 + stompDown * 62 + impact * 10;
      var bootRot = -0.05 + stompDown * 0.08;
      S.drawScissorCutout(
        ctx, pImg,
        198, 106, 244, 308,
        bootX, bootY, 336, 408,
        BOOT_POLY,
        {
          haloWidth: 5.0,
          rot: bootRot,
          pin: { x: bootX + 185, y: bootY + 46, r: 5.5, metal: "brass" },
          seed: 1.01
        }
      );

      // Gilliam cut-paper silt puffs & jumping pebble cutouts on boot impact!
      var puffAmt = S.clamp(stompDown * 1.15, 0, 1);
      for (var pi = 0; pi < 6; pi++) {
        var dir = pi < 3 ? -1 : 1;
        var idx = pi % 3;
        var pxP = 626 + dir * (95 + idx * 54 * puffAmt);
        var pyP = 524 - Math.sin(puffAmt * Math.PI) * (18 + idx * 14) - idx * 6;
        S.drawCardboardPuppetPiece(
          ctx,
          [[pxP - 14, pyP + 6], [pxP - 6, pyP - 9], [pxP + 11, pyP - 7], [pxP + 15, pyP + 8]],
          { tone: idx % 2 ? "#9c988e" : "#706d66", ribs: 1 }
        );
      }

      // Witness actors: Brook Trout crop on right + split-pin Turkey in lower-left corner
      S.drawScissorCutout(
        ctx, pImg,
        432, 264, 98, 74,
        884 + pxMid * 0.8, 316 + Math.sin(t * 2.4) * 8, 168, 124,
        [[0.03, 0.36], [0.42, 0.08], [0.95, 0.05], [0.97, 0.92], [0.36, 0.88], [0.04, 0.65]],
        { haloWidth: 4.0, seed: 1.22 }
      );
      S.drawTurkeyInCorner(ctx, 170 + pxNear * 0.3, 514, 1.06, t, { dispatch: 0.1 });

    } else if (beat.index === 1) {
      // --- VARIATION II (B): "A sunken wooden shipwreck" (+ Snail Mail Out) ---
      var settle = S.spring(beat.localT, 0.04, 10, 4.2);
      var wreckX = 636 + pxMid * 0.6;
      var wreckY = 392 + Math.sin(t * 1.3) * 5;

      // Broken split-pin cardboard masts & tattered paper sails rising from the sunken boot-hull!
      var mastSway = S.wobble(t, 1.8, 0.055, 0.4);
      ctx.save();
      ctx.translate(wreckX - 58, wreckY - 62);
      ctx.rotate(-0.12 + mastSway);
      drawCardboardLimb(ctx, 0, 20, 0, -225 * settle, 11, 7, "#6b5c4c", "brass");
      drawCardboardLimb(ctx, -92, -148 * settle, 98, -132 * settle, 7, 7, "#7f6e5b", "silver");
      // Tattered deckle sail scrap
      S.drawCutoutPaperEdge(
        ctx,
        [[-82, -142], [86, -128], [68, -42], [18, -68], [-24, -36], [-74, -64]],
        "#cfc8b8", "#14110d", { paperRim: 3.0 }
      );
      ctx.restore();

      // Aft broken mizzen mast + crow's nest bucket
      ctx.save();
      ctx.translate(wreckX + 118, wreckY - 46);
      ctx.rotate(0.18 - mastSway * 0.8);
      drawCardboardLimb(ctx, 0, 18, 0, -168 * settle, 9, 6, "#5e5042", "brass");
      S.drawCardboardPuppetPiece(ctx, [[-22, -168], [22, -168], [16, -138], [-16, -138]], {
        tone: "#857665", ribs: 2, pin: { x: 0, y: -152, r: 4.0, metal: "silver" }
      });
      ctx.restore();

      // Curved grey-cardboard shipwreck hull ribs with glinting split-pin brads!
      for (var ri = 0; ri < 4; ri++) {
        var rx = wreckX - 118 + ri * 66;
        var ry = wreckY - 8 + Math.sin(ri + t * 2) * 2;
        S.drawCardboardPuppetPiece(
          ctx,
          [[rx - 12, ry + 54], [rx - 22, ry - 48], [rx - 4, ry - 72], [rx + 8, ry - 46], [rx + 4, ry + 54]],
          { tone: ri % 2 ? "#8c8982" : "#6f6d67", ribs: 2, pin: { x: rx - 4, y: ry + 38, r: 4.4, metal: "silver" } }
        );
      }

      // The giant boot cutout tilted horizontally on its side AS the sunken shipwreck hull!
      S.drawScissorCutout(
        ctx, pImg,
        198, 106, 244, 308,
        wreckX - 175, wreckY - 170, 330, 390,
        BOOT_POLY,
        {
          filter: "sepia",
          haloWidth: 4.8,
          rot: -1.26,
          pivotX: wreckX,
          pivotY: wreckY,
          pin: { x: wreckX - 80, y: wreckY + 10, r: 5, metal: "brass" },
          seed: 1.35
        }
      );

      // Broken ship's spoked cardboard helm wheel in foreground silt
      ctx.save();
      ctx.translate(876, 488);
      ctx.rotate(t * 0.35);
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 10;
      ctx.beginPath(); ctx.arc(0, 0, 38, 0, TAU); ctx.stroke();
      ctx.strokeStyle = "#2b231b";
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(0, 0, 38, 0, TAU); ctx.stroke();
      for (var sp = 0; sp < 6; sp++) {
        var sa = (sp / 6) * TAU;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(sa) * 48, Math.sin(sa) * 48);
        ctx.stroke();
      }
      S.drawSplitPin(ctx, 0, 0, 5.5, { metal: "brass" });
      ctx.restore();

    } else if (beat.index === 2) {
      // --- VARIATION III (C): "A pinching crab's dark cave" (+ Trout Reply) ---
      var caveX = 548 + pxMid * 0.5;
      var caveY = 340;

      // Stacked grey-cardboard cave boulder slabs forming a dark grotto arch
      S.drawCardboardPuppetPiece(
        ctx,
        [[290, 540], [312, 250], [490, 176], [735, 198], [812, 330], [826, 540], [692, 540], [665, 355], [445, 345], [412, 540]],
        { tone: "#5e605d", ribs: 4, pins: [[360, 310], [740, 285]] }
      );
      // Deep ink cavern mouth
      ctx.fillStyle = "#0e1011";
      ctx.beginPath();
      ctx.ellipse(555, 455, 152, 118, 0, Math.PI, 0);
      ctx.closePath();
      ctx.fill();

      // Boot cutout arched overhead as the overhanging cave roof!
      S.drawScissorCutout(
        ctx, pImg,
        198, 106, 244, 308,
        caveX - 165, caveY - 220, 320, 360,
        BOOT_POLY,
        { filter: "mono", haloWidth: 4.5, rot: 1.18, pivotX: caveX, pivotY: caveY - 50, seed: 1.55 }
      );

      // Giant Split-Pin Cardboard Creek Crab lunging from the dark boot-cave!
      var lunge = Math.sin(beat.localT * 2.6) * 28 + 18;
      var crabX = 548 + lunge;
      var crabY = 472 + Math.sin(t * 5.2) * 4;

      // 6 jointed walking legs
      for (var li = -1; li <= 1; li++) {
        for (var side = -1; side <= 1; side += 2) {
          var lx0 = crabX + side * 56;
          var ly0 = crabY + 12 + li * 10;
          var step = Math.sin(t * 7.5 + li * 1.4 + side) * 12;
          drawCardboardLimb(ctx, lx0, ly0, lx0 + side * 48, ly0 - 18 + step * 0.4, 7, 5, "#6e6b66", "silver");
          drawCardboardLimb(ctx, lx0 + side * 48, ly0 - 18 + step * 0.4, lx0 + side * 78, ly0 + 36 + step, 5, 3, "#52504c", null);
        }
      }

      // Carapace with charcoal ribs & stalk eyes
      S.drawCardboardPuppetPiece(
        ctx,
        [[crabX - 78, crabY + 6], [crabX - 58, crabY - 38], [crabX + 58, crabY - 38], [crabX + 78, crabY + 6], [crabX + 46, crabY + 34], [crabX - 46, crabY + 34]],
        { tone: "#8f6d5c", ribs: 3, pins: [[crabX - 42, crabY], [crabX + 42, crabY]] }
      );
      for (var ei = -1; ei <= 1; ei += 2) {
        var ex = crabX + ei * 24;
        var ey = crabY - 56 + Math.sin(t * 6 + ei) * 3;
        drawCardboardLimb(ctx, crabX + ei * 18, crabY - 34, ex, ey, 4, 3, "#75584a", null);
        ctx.fillStyle = "#fbfaf5";
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(ex, ey, 8.5, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#14110d";
        ctx.beginPath(); ctx.arc(ex + 2, ey, 3.8, 0, TAU); ctx.fill();
      }

      // IK Snapping Pincers reaching toward Brook Trout!
      var targetX = 768 + Math.sin(t * 4.4) * 26;
      var targetY = 398 + Math.cos(t * 3.7) * 22;
      var clawIK = S.solveIK2(crabX + 58, crabY - 12, 74, 68, targetX, targetY, -1);
      drawCardboardLimb(ctx, crabX + 58, crabY - 12, clawIK.jx, clawIK.jy, 12, 10, "#9c6e58", "brass");
      drawCardboardLimb(ctx, clawIK.jx, clawIK.jy, clawIK.ex, clawIK.ey, 11, 9, "#ab755c", "brass");

      var snap = 0.28 + Math.abs(Math.sin(t * 8.5)) * 0.42;
      ctx.save();
      ctx.translate(clawIK.ex, clawIK.ey);
      ctx.rotate(clawIK.a2);
      ctx.save();
      ctx.rotate(-snap);
      S.drawCardboardPuppetPiece(ctx, [[0, -6], [56, -24], [68, -6], [42, 2], [0, 4]], { tone: "#ba624a", ribs: 1 });
      ctx.restore();
      ctx.save();
      ctx.rotate(snap);
      S.drawCardboardPuppetPiece(ctx, [[0, -4], [42, -2], [66, 8], [52, 24], [0, 6]], { tone: "#9e4f3a", ribs: 1, pin: { x: 0, y: 0, r: 4.8, metal: "brass" } });
      ctx.restore();
      ctx.restore();

      // Brook the Trout darting & observing on the right!
      S.drawBrookTrout(ctx, 946 + Math.sin(t * 3.1) * 18, 362 + Math.cos(t * 2.4) * 10, 1.16, t, false);

    } else {
      // --- VARIATION IV (D): "The Emperor's lost moon-boot" (+ Alien Listening Post) ---
      // Cratered silver-grey lunar surface cutouts along riverbed
      for (var ci = 0; ci < 4; ci++) {
        var cxM = 230 + ci * 245 + pxMid * 0.5;
        S.drawCardboardPuppetPiece(
          ctx,
          [[cxM - 85, 560], [cxM - 56, 504], [cxM - 18, 520], [cxM + 22, 520], [cxM + 58, 502], [cxM + 88, 560]],
          { tone: ci % 2 ? "#9a9b9e" : "#787a7e", ribs: 1 }
        );
      }

      // Alien Listening Post hovering overhead
      var floatX = 636 + Math.sin(t * 1.7) * 22;
      var floatY = 278 + Math.cos(t * 2.1) * 18;
      S.drawAlienSaucer(ctx, 640, 108, 1.18, t, floatX, floatY + 130, { beamSpread: 175 });

      // Zero-gravity floating Emperor's Moon-Boot with Gold Imperial Crown Cuff & Brass Rocket Thrusters!
      var moonRot = -0.18 + Math.sin(t * 1.5) * 0.14;
      ctx.save();
      ctx.translate(floatX, floatY);
      ctx.rotate(moonRot);

      //Scissor-cut boot in high-contrast lunar silver-cyan filter
      S.drawScissorCutout(
        ctx, pImg,
        198, 106, 244, 308,
        -136, -158, 272, 326,
        BOOT_POLY,
        { filter: "cyan", haloWidth: 5.0, shadow: false, seed: 1.88 }
      );

      // Cut-paper Gold Imperial Crown & Royal Crest strapped to the boot's cuff (0 text!)
      S.drawCutoutPaperEdge(
        ctx,
        [[-52, -148], [-44, -196], [-12, -168], [18, -206], [48, -168], [82, -194], [88, -138], [-48, -126]],
        "#e2b246", "#14110d", { paperRim: 3.0 }
      );
      var jewels = [[-16, -152, "#d42a1e"], [18, -158, "#0f8f80"], [54, -150, "#d42a1e"]];
      for (var ji = 0; ji < jewels.length; ji++) {
        ctx.fillStyle = jewels[ji][2];
        ctx.beginPath(); ctx.arc(jewels[ji][0], jewels[ji][1], 6.0, 0, TAU); ctx.fill();
      }

      // Split-pin brass lunar sole clamp + flickering cut-paper thruster flames!
      S.drawCardboardPuppetPiece(
        ctx,
        [[-118, 92], [118, 146], [112, 168], [-124, 114]],
        { tone: "#c79a44", ribs: 1, pins: [[-72, 112], [0, 129], [76, 146]] }
      );
      var flameH = 34 + Math.sin(t * 22) * 12;
      S.drawCutoutPaperEdge(
        ctx,
        [[-88, 118], [-58, 125], [-76, 125 + flameH]],
        "#d42a1e", "#14110d", { paperRim: 2.0, shadow: false }
      );
      S.drawCutoutPaperEdge(
        ctx,
        [[46, 148], [80, 156], [58, 156 + flameH * 1.1]],
        "#f2c957", "#14110d", { paperRim: 2.0, shadow: false }
      );
      ctx.restore();

      // Orbiting zero-G lunar pebbles & floating star medallions
      for (var oi = 0; oi < 5; oi++) {
        var oa = t * 0.9 + (oi / 5) * TAU;
        var ox = floatX + Math.cos(oa) * 235;
        var oy = floatY + Math.sin(oa) * 86;
        S.drawCardboardPuppetPiece(
          ctx,
          [[ox - 12, oy], [ox - 3, oy - 11], [ox + 12, oy - 4], [ox + 8, oy + 10]],
          { tone: "#b8bbc0", ribs: 1 }
        );
      }
    }

    drawStoryAndInteractiveSnail(ctx, W, H, beat, t, state, { floorY: 562 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 1);
  }

  /* ==========================================================================
   * PORTHOLE #02 · GALLEY — "queneau-rostrum"
   * Workshop: Oubapo · Director: S11 Connelly Barnes Video Puppetry Tabletop
   * Plates: ./portholes/p02.jpg + ./assets/atlas-stills/atlas-47.webp
   *   (A) Trout Cook holding a silver baster
   *   (B) A friendly submarine air pump
   *   (C) A canned roast dinner delivery
   *   (D) A warp-core fuel syringe
   * ========================================================================== */
  var BASTER_POLY = [
    [0.04, 0.76], [0.18, 0.56], [0.36, 0.46],
    [0.92, 0.04], [0.98, 0.14], [0.50, 0.66],
    [0.32, 0.88], [0.12, 0.96]
  ];

  function renderP02(ctx, W, H, rawT, state) {
    var S = getStage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(2);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // Plane 0: Warm buttercream Queneau Rostrum stock + torn-deckle dark green floor (exercices-de-style!)
    S.drawBolasBackdrop(ctx, W, H, "queneau-rostrum", 2, t, state, {
      paperTop: "#fae090",
      paperBot: "#edd078",
      floorColor: "#273b19"
    });

    var pxFar = S.parallaxX(0.25, t, state);
    var pxMid = S.parallaxX(0.58, t, state);
    var pyMid = S.parallaxY(0.42, t, state);

    // Plane 1: Torn-deckle right corridor door inspired by exercices-de-style.webp + atlas-47.webp kitchen worker!
    var aw2 = aImg ? aImg.naturalWidth : 382;
    var ah2 = aImg ? aImg.naturalHeight : 680;
    S.drawTornPaperFlat(ctx, 938 + pxFar, 88 + pyMid * 0.5, 224, 452, {
      fill: "#263a19",
      paperColor: "#f5efe1",
      deckle: 8.5,
      seed: 22.4
    });
    S.drawScissorCutout(
      ctx, aImg,
      aw2 * 0.03, ah2 * 0.01, aw2 * 0.62, ah2 * 0.86,
      964 + pxFar * 1.2, 118 + pyMid * 0.6, 174, 412,
      [[0.12, 0.03], [0.88, 0.04], [0.94, 0.42], [0.88, 0.96], [0.14, 0.96], [0.06, 0.45]],
      { filter: beat.index === 3 ? "cyan" : "sepia", haloWidth: 4.0, seed: 2.11 }
    );

    // Plane 2: Torn-deckle Galley Service Window Frame on left-center of rostrum
    var winX = 186 + pxMid * 0.6;
    var winY = 108 + pyMid * 0.5;
    S.drawTornPaperFlat(ctx, winX, winY, 548, 368, {
      fill: "#6c4c2b",
      paperColor: "#fbfaf5",
      deckle: 7.5,
      seed: 202.9
    });
    // Warm amber galley interior paper flat + fluorescent ceiling corridor slice from atlas-47.webp
    S.drawTornPaperFlat(ctx, winX + 26, winY + 24, 496, 314, {
      fill: beat.lampOn ? "#f5be62" : "#8b7245",
      paperColor: "#e6dcc8",
      deckle: 3.0,
      shadow: false,
      seed: 205.1
    });
    S.drawScissorCutout(
      ctx, aImg,
      aw2 * 0.54, ah2 * 0.11, aw2 * 0.44, ah2 * 0.64,
      winX + 318, winY + 34, 188, 288,
      [[0.05, 0.04], [0.95, 0.04], [0.96, 0.95], [0.04, 0.95]],
      { filter: "sepia", haloWidth: 3.0, alpha: 0.56, shadow: false, seed: 2.19 }
    );

    if (beat.index === 0) {
      // --- VARIATION I (A): "Trout Cook holding a silver baster" ---
      // Scissor-cut background dining trout on stools from p02.jpg
      S.drawScissorCutout(
        ctx, pImg,
        348, 294, 104, 80,
        winX + 308, winY + 186, 178, 138,
        [[0.04, 0.10], [0.95, 0.08], [0.96, 0.95], [0.04, 0.95]],
        { haloWidth: 3.8, seed: 2.31 }
      );

      // Scissor-cut Trout Cook in white chef toque from p02.jpg!
      var cookBob = Math.sin(t * 2.8) * 5;
      S.drawScissorCutout(
        ctx, pImg,
        188, 198, 156, 178,
        winX + 32, winY + 54 + cookBob, 268, 292,
        [[0.16, 0.22], [0.36, 0.02], [0.76, 0.04], [0.96, 0.34], [0.92, 0.72], [0.65, 0.96], [0.06, 0.96], [0.04, 0.56]],
        { haloWidth: 5.0, seed: 2.34 }
      );

      // IK-articulated cardboard pectoral arm squeezing the giant Silver Baster cutout!
      var squeeze = 0.5 + 0.5 * Math.sin(t * 5.2);
      var handX = winX + 278 + squeeze * 18;
      var handY = winY + 242 - squeeze * 12;
      var armIK = S.solveIK2(winX + 165, winY + 238 + cookBob, 76, 72, handX, handY, 1);
      drawCardboardLimb(ctx, winX + 165, winY + 238 + cookBob, armIK.jx, armIK.jy, 14, 11, "#8f9c8a", "brass");

      // Constant Oubapo Prop: Scissor-cut Silver Baster from p02.jpg!
      S.drawScissorCutout(
        ctx, pImg,
        242, 276, 138, 98,
        winX + 214, winY + 148 - squeeze * 8, 256, 184,
        BASTER_POLY,
        {
          haloWidth: 5.0,
          rot: -0.08 - squeeze * 0.07,
          pin: { x: handX, y: handY, r: 4.8, metal: "silver" },
          seed: 2.40
        }
      );
      drawCardboardLimb(ctx, armIK.jx, armIK.jy, handX, handY, 11, 9, "#a58362", "silver");

      // Scissor-cut sparkling bubble spray crop + lively cut-paper bubble stream!
      S.drawScissorCutout(
        ctx, pImg,
        376, 156, 112, 132,
        winX + 448, winY + 24 - squeeze * 10, 188, 212,
        circlePoly(12, 0.45, 0.45, 0.5, 0.5, 0.04, 2.44),
        { haloWidth: 4.0, rot: 0.06 * Math.sin(t * 4), seed: 2.45 }
      );
      drawCutBubbleCluster(ctx, winX + 545, winY + 165, 10, 140, 155, t, 21, "rgba(150, 224, 228, 0.9)");
      S.drawTurkeyInCorner(ctx, 118, 504, 1.0, t, { dispatch: 0.05 });

    } else if (beat.index === 1) {
      // --- VARIATION II (B): "A friendly submarine air pump" (+ Snail Mail Out) ---
      var pumpCycle = 0.5 + 0.5 * Math.sin(t * 4.6);

      // Riveted grey-cardboard Submarine Air Manifold & Brass Pressure Gauge inside the hatch
      S.drawCardboardPuppetPiece(
        ctx,
        [[winX + 64, winY + 320], [winX + 74, winY + 118], [winX + 236, winY + 118], [winX + 248, winY + 320]],
        { tone: "#787c7e", ribs: 3, pins: [[winX + 92, winY + 142], [winX + 220, winY + 142], [winX + 92, winY + 296], [winX + 220, winY + 296]] }
      );
      // Pure geometric dial gauge (zero text!)
      ctx.save();
      ctx.translate(winX + 156, winY + 196);
      ctx.fillStyle = "#fbfaf5";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 42, 0, TAU); ctx.fill(); ctx.stroke();
      for (var ti = 0; ti < 9; ti++) {
        var ta = -Math.PI * 0.8 + (ti / 8) * Math.PI * 1.6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ta) * 30, Math.sin(ta) * 30);
        ctx.lineTo(Math.cos(ta) * 38, Math.sin(ta) * 38);
        ctx.stroke();
      }
      var needleAng = -0.9 + pumpCycle * 1.85;
      ctx.strokeStyle = "#d42a1e";
      ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(needleAng) * 32, Math.sin(needleAng) * 32); ctx.stroke();
      S.drawSplitPin(ctx, 0, 0, 4.5, { metal: "brass" });
      ctx.restore();

      // Articulated cardboard pump-lever & connecting rod driving the upright Silver Baster Air Pump!
      var pistonY = winY + 96 + pumpCycle * 56;
      drawCardboardLimb(ctx, winX + 224, winY + 178, winX + 356, pistonY - 12, 12, 10, "#b88a44", "brass");

      // Silver baster rotated upright as the submarine air-compressor cylinder!
      S.drawScissorCutout(
        ctx, pImg,
        242, 276, 138, 98,
        winX + 258, pistonY, 240, 174,
        BASTER_POLY,
        { haloWidth: 5.0, rot: -0.78, pivotX: winX + 378, pivotY: pistonY + 86, seed: 2.55 }
      );

      // Segmented cardboard air hose feeding buoyant oxygen bubbles across the stage
      S.drawCardboardPuppetPiece(
        ctx,
        [[winX + 432, winY + 148], [winX + 610, winY + 172], [winX + 610, winY + 198], [winX + 432, winY + 174]],
        { tone: "#4e5c58", ribs: 2, pins: [[winX + 444, winY + 161], [winX + 596, winY + 185]] }
      );
      drawCutBubbleCluster(ctx, winX + 650, winY + 260, 14, 150, 220, t * 1.3, 222, "rgba(215, 248, 245, 0.92)");

    } else if (beat.index === 2) {
      // --- VARIATION III (C): "A canned roast dinner delivery" (+ Trout Reply) ---
      // Trout Cook cutout inside hatch dispatching canned roast dinners down a cardboard chute!
      S.drawScissorCutout(
        ctx, pImg,
        188, 198, 156, 178,
        winX + 28, winY + 56, 236, 258,
        [[0.16, 0.22], [0.36, 0.02], [0.76, 0.04], [0.96, 0.34], [0.92, 0.72], [0.65, 0.96], [0.06, 0.96], [0.04, 0.56]],
        { haloWidth: 4.5, seed: 2.61 }
      );

      // Sloped grey-cardboard roller chute extending from galley window sill
      S.drawCardboardPuppetPiece(
        ctx,
        [[winX + 240, winY + 292], [winX + 716, winY + 374], [winX + 708, winY + 404], [winX + 232, winY + 322]],
        { tone: "#7f7b73", ribs: 3, pins: [[winX + 260, winY + 308], [winX + 480, winY + 346], [winX + 690, winY + 384]] }
      );

      // Silver baster angled downward as an overhead gravy-glaze dispenser!
      var squirt = Math.abs(Math.sin(t * 4.2));
      S.drawScissorCutout(
        ctx, pImg,
        242, 276, 138, 98,
        winX + 236, winY + 62 + squirt * 14, 224, 160,
        BASTER_POLY,
        { haloWidth: 4.5, rot: 0.92, seed: 2.65 }
      );

      // 3 Scissor-cut Tin Roast-Dinner Cans rolling down the chute (pure geometric drumstick emblem, 0 text!)
      for (var ci = 0; ci < 3; ci++) {
        var cu = ((beat.u * 1.15 + ci / 3) % 1);
        var canX = S.lerp(winX + 285, winX + 668, cu);
        var canY = S.lerp(winY + 246, winY + 328, cu) - Math.abs(Math.sin(cu * Math.PI * 4)) * 8;
        ctx.save();
        ctx.translate(canX, canY);
        ctx.rotate(Math.sin(cu * TAU * 2) * 0.08);
        // White paper halo + tin cylinder + red label band
        S.drawCutoutPaperEdge(ctx, [[-32, -40], [32, -40], [32, 40], [-32, 40]], "#b8bcc0", "#14110d", { paperRim: 3.5 });
        ctx.fillStyle = "#d42a1e";
        ctx.fillRect(-30, -18, 60, 36);
        // Tiny golden roast drumstick silhouette icon (zero text!)
        ctx.fillStyle = "#fae090";
        ctx.beginPath();
        ctx.ellipse(-4, 0, 13, 9, -0.2, 0, TAU);
        ctx.fill();
        ctx.fillRect(6, -3, 12, 5);
        ctx.restore();
      }

      // Brook the Trout eagerly receiving the canned dinner at the end of the chute!
      S.drawBrookTrout(ctx, 978, 434 + Math.sin(t * 3.4) * 8, 1.14, t, false);

    } else {
      // --- VARIATION IV (D): "A warp-core fuel syringe" (+ Alien Listening Post) ---
      S.drawAlienSaucer(ctx, 648, 102, 1.16, t, 610, 356, { beamSpread: 185 });

      // Pulsing Multi-Ring Cut-Paper Dilithium Warp-Core Reactor Chamber!
      var coreX = 656;
      var coreY = 356;
      var pulse = 1 + 0.08 * Math.sin(t * 9.5);
      ctx.save();
      ctx.translate(coreX, coreY);
      S.drawCardboardPuppetPiece(
        ctx,
        [[-96, -124], [96, -124], [116, 0], [96, 124], [-96, 124], [-116, 0]],
        { tone: "#26323a", ribs: 3, pins: [[-78, -104], [78, -104], [-78, 104], [78, 104]] }
      );
      var ringCols = ["#0f8f80", "#d42a1e", "#fae090"];
      for (var ri2 = 0; ri2 < 3; ri2++) {
        ctx.strokeStyle = ringCols[ri2];
        ctx.lineWidth = 5 - ri2;
        ctx.beginPath();
        ctx.arc(0, 0, (76 - ri2 * 20) * pulse, 0, TAU);
        ctx.stroke();
      }
      ctx.fillStyle = "#fbfaf5";
      ctx.beginPath(); ctx.arc(0, 0, 18 * pulse, 0, TAU); ctx.fill();
      ctx.restore();

      // Robotic IK Split-Pin Manipulator Arm plunging the Giant Silver Baster Syringe into the Warp Core!
      var inject = 0.5 + 0.5 * Math.sin(t * 4.8);
      var syrX = 330 + inject * 46;
      var syrY = 236 + inject * 18;
      var robIK = S.solveIK2(215, 142, 118, 110, syrX + 55, syrY + 55, -1);
      drawCardboardLimb(ctx, 215, 142, robIK.jx, robIK.jy, 15, 12, "#8e9196", "silver");
      drawCardboardLimb(ctx, robIK.jx, robIK.jy, robIK.ex, robIK.ey, 12, 10, "#b88a44", "brass");

      S.drawScissorCutout(
        ctx, pImg,
        242, 276, 138, 98,
        syrX, syrY, 268, 192,
        BASTER_POLY,
        { filter: "cyan", haloWidth: 5.0, rot: 0.48, seed: 2.88 }
      );

      // Glowing crimson-teal plasma droplets shooting from syringe tip into warp core
      for (var di = 0; di < 6; di++) {
        var du = ((t * 1.6 + di / 6) % 1);
        var dxP = S.lerp(syrX + 236, coreX, du);
        var dyP = S.lerp(syrY + 62, coreY, du) + Math.sin(du * TAU * 2) * 10;
        ctx.fillStyle = di % 2 === 0 ? "#d42a1e" : "#0f8f80";
        ctx.strokeStyle = "#fbfaf5";
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(dxP, dyP, 7.5, 0, TAU); ctx.fill(); ctx.stroke();
      }
    }

    drawStoryAndInteractiveSnail(ctx, W, H, beat, t, state, { floorY: 568 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 2);
  }

  /* ==========================================================================
   * PORTHOLE #03 · STARBD — "perec-stage"
   * Workshop: Outypopo · Director: S17 South Park Repeatable Cutout Stage
   * Plates: ./portholes/p03.jpg + ./assets/atlas-stills/atlas-49.webp
   *   (A) A sunken Room 4 chalkboard
   *   (B) A Most Wanted bandit poster
   *   (C) The dreaded creek Hook Monster
   *   (D) A galactic bounty-hunter board
   *
   * BLIND SAFETY: Never exposes the painted "HOOK MONSTER" letters on p03.jpg
   * or background chalk letters on atlas-49.webp! Uses tight contour polygons
   * around the chalk Eagle-Hook creature, backpack student fish, mossy rocks,
   * and upright striped fish instructor.
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

  function drawCleanChalkboardStage(ctx, S, x, y, w, h, rot) {
    ctx.save();
    ctx.translate(x + w * 0.5, y + h * 0.5);
    ctx.rotate(rot || -0.04);
    ctx.translate(-w * 0.5, -h * 0.5);

    // Outer wooden schoolroom slate frame with split-pin corner brackets
    S.drawTornPaperFlat(ctx, 0, 0, w, h, {
      fill: "#6f6848",
      paperColor: "#fbfaf5",
      deckle: 5.5,
      seed: 303.1
    });
    // Clean dark green slate surface (100% free of any English words!)
    S.drawTornPaperFlat(ctx, 24, 22, w - 48, h - 44, {
      fill: "#1f3e35",
      paperColor: "#39594e",
      deckle: 2.0,
      shadow: false,
      seed: 307.4
    });
    // Chalk tray + white chalk stick piece
    ctx.fillStyle = "#5c5539";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2;
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

  function renderP03(ctx, W, H, rawT, state) {
    var S = getStage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(3);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // Plane 0: Carved Perec sandstone masonry proscenium opening wide onto sunken schoolroom!
    S.drawBolasBackdrop(ctx, W, H, "perec-stage", 3, t, state, {
      openX: 146,
      openY: 74,
      openW: 988,
      openH: 548,
      doors: true
    });

    var pxMid = S.parallaxX(0.55, t, state);
    var pyMid = S.parallaxY(0.40, t, state);

    // Subtle underwater schoolroom caustics & mossy creek rocks from p03.jpg
    S.drawWaterCaustics(ctx, W, 620, t, 0.12);
    S.drawScissorCutout(
      ctx, pImg,
      108, 308, 178, 126,
      188 + pxMid * 0.7, 428 + pyMid, 286, 174,
      [[0.04, 0.18], [0.56, 0.05], [0.95, 0.48], [0.96, 0.95], [0.05, 0.96]],
      { haloWidth: 4.5, seed: 3.11 }
    );

    var boardX = 336 + pxMid * 0.45;
    var boardY = 128 + pyMid * 0.4;
    var boardW = 524;
    var boardH = 312;

    if (beat.index === 0) {
      // --- VARIATION I (A): "A sunken Room 4 chalkboard" ---
      drawCleanChalkboardStage(ctx, S, boardX, boardY, boardW, boardH, -0.045);

      // Pure geometric Room-4 chalk diagrams on the slate (4-dot Room 4 tally domino, compass triangle, creek wave — 0 text!)
      ctx.save();
      ctx.translate(boardX + boardW * 0.5, boardY + boardH * 0.5);
      ctx.rotate(-0.045);
      ctx.strokeStyle = "rgba(246, 245, 238, 0.86)";
      ctx.fillStyle = "rgba(246, 245, 238, 0.86)";
      ctx.lineWidth = 3.2;
      ctx.lineCap = "round";

      // 4-dot classroom badge box on top-left
      ctx.strokeRect(-208, -104, 72, 72);
      var dots4 = [[-190, -86], [-154, -86], [-190, -50], [-154, -50]];
      for (var d4 = 0; d4 < 4; d4++) {
        ctx.beginPath(); ctx.arc(dots4[d4][0], dots4[d4][1], 6.5, 0, TAU); ctx.fill();
      }
      // Geometric right-triangle, protractor arc & sine wave lesson
      ctx.beginPath();
      ctx.moveTo(-92, -26); ctx.lineTo(28, -98); ctx.lineTo(28, -26); ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(124, -62, 42, 0, Math.PI * 1.45);
      ctx.stroke();
      ctx.beginPath();
      for (var wx = -205; wx <= 185; wx += 14) {
        var wy = 56 + Math.sin(wx * 0.045 + t * 2.2) * 20;
        if (wx === -205) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
      ctx.restore();

      // Scissor-cut upright Striped Fish Instructor from atlas-49.webp tapping board with IK pointer!
      var aw3 = aImg ? aImg.naturalWidth : 382;
      var ah3 = aImg ? aImg.naturalHeight : 680;
      S.drawScissorCutout(
        ctx, aImg,
        aw3 * 0.48, ah3 * 0.12, aw3 * 0.46, ah3 * 0.74,
        832 + pxMid * 0.6, 172 + Math.sin(t * 2.2) * 4, 168, 394,
        TEACHER_FISH_POLY,
        { haloWidth: 4.8, seed: 3.21 }
      );
      var tapX = boardX + 382 + Math.sin(t * 3.8) * 34;
      var tapY = boardY + 132 + Math.cos(t * 2.9) * 26;
      var ptrIK = S.solveIK2(874 + pxMid * 0.6, 326, 78, 92, tapX, tapY, -1);
      drawCardboardLimb(ctx, 874 + pxMid * 0.6, 326, ptrIK.jx, ptrIK.jy, 9, 7, "#9c8265", "brass");
      drawCardboardLimb(ctx, ptrIK.jx, ptrIK.jy, tapX, tapY, 5, 2.5, "#e6d8b8", "silver");

      // Scissor-cut Backpack Pupil Fish from p03.jpg!
      S.drawScissorCutout(
        ctx, pImg,
        328, 368, 182, 132,
        548 + pxMid * 0.9, 412 + Math.sin(t * 3.1) * 7, 268, 188,
        [[0.02, 0.56], [0.46, 0.04], [0.96, 0.14], [0.95, 0.68], [0.76, 0.96], [0.24, 0.96]],
        { haloWidth: 4.8, seed: 3.25 }
      );

    } else if (beat.index === 1) {
      // --- VARIATION II (B): "A Most Wanted bandit poster" (+ Snail Mail Out) ---
      drawCleanChalkboardStage(ctx, S, boardX, boardY, boardW, boardH, -0.02);

      // Torn-deckle Kraft Bandit Poster unrolling over the board with 4 glinting brass brads!
      var unroll = S.clamp(S.spring(beat.localT, 0.05, 11, 4.6), 0.15, 1);
      var postX = boardX + 118;
      var postY = boardY + 14;
      var postW = 288;
      var postH = 284 * unroll;
      S.drawTornPaperFlat(ctx, postX, postY, postW, postH, {
        fill: "#e8cfa0",
        paperColor: "#fbfaf5",
        deckle: 6.5,
        seed: 318.2
      });
      S.drawSplitPin(ctx, postX + 18, postY + 18, 5.2, { metal: "brass" });
      S.drawSplitPin(ctx, postX + postW - 18, postY + 18, 5.2, { metal: "brass" });

      if (unroll > 0.45) {
        ctx.save();
        ctx.translate(postX + postW * 0.5, postY + 146);
        // Inner mugshot frame
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 3;
        ctx.strokeRect(-98, -96, 196, 148);

        // Cut-paper Outlaw Bandit Portrait (cocked outlaw hat, red bandana mask, shifty eyes, crossed hooks — 0 text!)
        S.drawCardboardPuppetPiece(ctx, [[-56, 48], [-44, -28], [44, -28], [56, 48]], { tone: "#423d38", ribs: 2 });
        // Red bandit kerchief mask
        S.drawCutoutPaperEdge(ctx, [[-48, -12], [48, -12], [6, 36]], "#d42a1e", "#14110d", { paperRim: 2.0, shadow: false });
        // Wide-brimmed outlaw hat
        S.drawCutoutPaperEdge(ctx, [[-82, -28], [-38, -36], [-24, -76], [26, -74], [40, -36], [82, -28], [56, -18], [-56, -18]], "#1c1915", "#14110d", { paperRim: 2.2 });
        // Glinting outlaw eyes shifting left-right
        var lookX = Math.sin(t * 3.5) * 4;
        for (var be = -1; be <= 1; be += 2) {
          ctx.fillStyle = "#fbfaf5";
          ctx.beginPath(); ctx.ellipse(be * 20, -20, 11, 6, 0, 0, TAU); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#14110d";
          ctx.beginPath(); ctx.arc(be * 20 + lookX, -20, 3.5, 0, TAU); ctx.fill();
        }
        // 5 Gold Bounty Stars along bottom of poster (zero text!)
        for (var st = -2; st <= 2; st++) {
          ctx.fillStyle = "#c98a2c";
          ctx.beginPath();
          ctx.arc(st * 34, 78, 8.5, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }

      // Pupil fish peering nervously at the bandit poster
      S.drawScissorCutout(
        ctx, pImg,
        328, 368, 182, 132,
        724 + pxMid * 0.8, 396 + Math.sin(t * 4) * 5, 236, 166,
        [[0.02, 0.56], [0.46, 0.04], [0.96, 0.14], [0.95, 0.68], [0.76, 0.96], [0.24, 0.96]],
        { haloWidth: 4.2, seed: 3.39 }
      );

    } else if (beat.index === 2) {
      // --- VARIATION III (C): "The dreaded creek Hook Monster" (+ Trout Reply) ---
      drawCleanChalkboardStage(ctx, S, boardX - 30, boardY + 18, 430, 268, -0.07);

      // Taut fishing line dropping from above the proscenium arch!
      var swoopX = 638 + Math.sin(t * 2.9) * 68;
      var swoopY = 278 + Math.sin(t * 4.4) * 34;
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(620, 74);
      ctx.quadraticCurveTo(640, 160, swoopX + 10, swoopY - 122);
      ctx.stroke();

      // Articulated Split-Pin Chalk Wings flapping on either side of the Hook Monster!
      var flap = Math.sin(t * 9.2) * 0.46;
      for (var ws = -1; ws <= 1; ws += 2) {
        ctx.save();
        ctx.translate(swoopX + ws * 36, swoopY - 36);
        ctx.scale(ws, 1);
        ctx.rotate(flap - 0.2);
        S.drawCardboardPuppetPiece(
          ctx,
          [[0, -14], [116, -58], [148, -12], [108, 22], [68, 14], [38, 32], [0, 14]],
          { tone: "#36564b", stroke: "#fbfaf5", lineWidth: 2.6, ribs: 2, pin: { x: 0, y: 0, r: 4.6, metal: "silver" } }
        );
        ctx.restore();
      }

      // The REAL Eagle-Hook Monster scissor-cut from p03.jpg springing out of the chalkboard!
      S.drawScissorCutout(
        ctx, pImg,
        352, 196, 104, 162,
        swoopX - 92, swoopY - 134, 196, 286,
        EAGLE_HOOK_POLY,
        {
          haloWidth: 5.2,
          rot: Math.sin(t * 3.8) * 0.11,
          pin: { x: swoopX + 8, y: swoopY - 116, r: 5.0, metal: "silver" },
          seed: 3.55
        }
      );

      // Brook the Trout & Backpack Pupil Fish recoiling on left & right!
      S.drawScissorCutout(
        ctx, pImg,
        328, 368, 182, 132,
        242, 418 + Math.sin(t * 5) * 6, 224, 158,
        [[0.02, 0.56], [0.46, 0.04], [0.96, 0.14], [0.95, 0.68], [0.76, 0.96], [0.24, 0.96]],
        { haloWidth: 4.0, seed: 3.61 }
      );
      S.drawBrookTrout(ctx, 948, 392 + Math.cos(t * 3.6) * 10, 1.15, t, false);

    } else {
      // --- VARIATION IV (D): "A galactic bounty-hunter board" (+ Alien Listening Post) ---
      S.drawAlienSaucer(ctx, 640, 106, 1.14, t, 600, 348, { beamSpread: 220 });

      // Dark slate Holographic Cut-Paper Galactic Bounty Board with 3 Target Medallions (0 text!)
      S.drawCardboardPuppetPiece(
        ctx,
        [[278, 188], [948, 188], [968, 476], [258, 476]],
        { tone: "#1a2530", stroke: "#0f8f80", lineWidth: 3.2, ribs: 2, pins: [[296, 206], [930, 206], [278, 458], [948, 458]] }
      );

      var targets = [
        { cx: 408, cy: 332, col: "#d42a1e", kind: "hook" },
        { cx: 614, cy: 332, col: "#0f8f80", kind: "fish" },
        { cx: 820, cy: 332, col: "#fae090", kind: "saturn" }
      ];
      for (var bi = 0; bi < 3; bi++) {
        var tg = targets[bi];
        ctx.save();
        ctx.translate(tg.cx, tg.cy);
        ctx.strokeStyle = tg.col;
        ctx.lineWidth = 2.6;
        ctx.strokeRect(-82, -104, 164, 208);

        // Rotating crosshair reticle
        ctx.save();
        ctx.rotate(t * (bi % 2 ? -0.9 : 0.9) + bi);
        ctx.setLineDash([7, 5]);
        ctx.beginPath(); ctx.arc(0, -12, 58, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(-68, -12); ctx.lineTo(-46, -12);
        ctx.moveTo(46, -12);  ctx.lineTo(68, -12);
        ctx.moveTo(0, -80);   ctx.lineTo(0, -58);
        ctx.moveTo(0, 34);    ctx.lineTo(0, 56);
        ctx.stroke();
        ctx.restore();

        if (tg.kind === "hook") {
          S.drawScissorCutout(ctx, pImg, 352, 196, 104, 162, -46, -78, 92, 134, EAGLE_HOOK_POLY, { filter: "cyan", haloWidth: 2.8, shadow: false, seed: 3.81 });
        } else if (tg.kind === "fish") {
          var aw3b = aImg ? aImg.naturalWidth : 382;
          var ah3b = aImg ? aImg.naturalHeight : 680;
          S.drawScissorCutout(ctx, aImg, aw3b * 0.48, ah3b * 0.12, aw3b * 0.46, ah3b * 0.74, -42, -82, 84, 144, TEACHER_FISH_POLY, { filter: "cyan", haloWidth: 2.8, shadow: false, seed: 3.82 });
        } else {
          // Cut-paper ringed planet bounty icon
          S.drawCutoutPaperEdge(ctx, circlePoly(12, 28, 28, 0, -12, 0.5, 9), "#d42a1e", "#fbfaf5", { paperRim: 2.0, shadow: false });
          ctx.strokeStyle = "#fae090";
          ctx.lineWidth = 4;
          ctx.beginPath(); ctx.ellipse(0, -12, 54, 14, -0.32, 0, TAU); ctx.stroke();
        }

        // Pure geometric bounty bar meter at bottom of card (zero text!)
        for (var mb = 0; mb < 4; mb++) {
          ctx.fillStyle = mb <= bi + 1 ? tg.col : "rgba(251,250,245,0.2)";
          ctx.fillRect(-64 + mb * 34, 72, 26, 12);
        }
        ctx.restore();
      }
    }

    drawStoryAndInteractiveSnail(ctx, W, H, beat, t, state, { floorY: 566, badgeX: 218, rightX: 1088 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 3);
  }

  /* ==========================================================================
   * PORTHOLE #04 · BELLY — "daumier-litho"
   * Workshop: La Mort en ce jardin · Director: S02 Lotte Reiniger
   * Plates: ./portholes/p04.jpg + ./assets/atlas-stills/atlas-39.webp
   *   (A) A snapping turtle on a key
   *   (B) A rival iron mini-submarine
   *   (C) A grumpy thief's back-scratcher
   *   (D) An ancient starship ignition key
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

  function renderP04(ctx, W, H, rawT, state) {
    var S = getStage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(4);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // Plane 0: Stark cream paper margins + wide ink-black cinema band (boucle-la.webp register!)
    S.drawBolasBackdrop(ctx, W, H, "daumier-litho", 4, t, state, {
      bandTop: 126,
      bandBot: 566
    });

    var pxFar = S.parallaxX(0.28, t, state);
    var pxMid = S.parallaxX(0.62, t, state);

    // Plane 1: Miniature star-stage silhouette plate from atlas-39.webp tucked inside the ink band
    var aw4 = aImg ? aImg.naturalWidth : 740;
    var ah4 = aImg ? aImg.naturalHeight : 416;
    S.drawScissorCutout(
      ctx, aImg,
      aw4 * 0.14, ah4 * 0.04, aw4 * 0.72, ah4 * 0.90,
      196 + pxFar, 144, 420, 268,
      [[0.04, 0.06], [0.96, 0.04], [0.95, 0.94], [0.05, 0.95]],
      { filter: "mono", haloWidth: 3.5, alpha: 0.78, seed: 4.05 }
    );

    // Plane 2: Lithograph-filtered Stone Culvert Arch cutout from p04.jpg with crisp 4.5px white paper halo!
    S.drawScissorCutout(
      ctx, pImg,
      122, 156, 384, 196,
      308 + pxMid * 0.45, 136, 654, 256,
      [
        [0.02, 0.95], [0.08, 0.44], [0.28, 0.10], [0.50, 0.03],
        [0.72, 0.10], [0.90, 0.42], [0.93, 0.86], [0.78, 0.86],
        [0.70, 0.54], [0.50, 0.44], [0.30, 0.54], [0.20, 0.95]
      ],
      { filter: "litho", haloWidth: 4.8, seed: 4.12 }
    );

    if (beat.index === 0) {
      // --- VARIATION I (A): "A snapping turtle on a key" ---
      var press = Math.sin(t * 2.6) * 0.04;

      // Giant Antique Skeleton Key cutout from p04.jpg resting on the ink-band floor
      S.drawScissorCutout(
        ctx, pImg,
        226, 395, 232, 98,
        420 + pxMid * 0.7, 418, 412, 146,
        KEY_POLY,
        { filter: "sepia", haloWidth: 5.0, rot: press, seed: 4.21 }
      );

      // Cross-hatched Lithograph Snapping Turtle cutout from p04.jpg + Lotte Reiniger Filigree Hinges!
      var turtX = 398 + pxMid * 0.65;
      var turtY = 236 + Math.sin(t * 2.1) * 4;
      S.drawScissorCutout(
        ctx, pImg,
        182, 282, 268, 168,
        turtX, turtY, 428, 248,
        TURTLE_POLY,
        { filter: "litho", haloWidth: 5.0, seed: 4.25 }
      );

      // Articulated Reiniger silhouette foreleg + filigree brass hinge pressing the key!
      var footTargetX = 594 + pxMid * 0.7;
      var footTargetY = 456 + Math.sin(t * 2.6) * 6;
      var legIK = S.solveIK2(turtX + 225, turtY + 158, 56, 52, footTargetX, footTargetY, 1);
      drawCardboardLimb(ctx, turtX + 225, turtY + 158, legIK.jx, legIK.jy, 15, 13, "#2a2b2d", null);
      drawCardboardLimb(ctx, legIK.jx, legIK.jy, footTargetX, footTargetY, 13, 10, "#1d1e20", null);
      S.drawReinigerFiligreeHinge(ctx, turtX + 225, turtY + 158, 7.2, { metal: "brass" });
      S.drawReinigerFiligreeHinge(ctx, legIK.jx, legIK.jy, 5.8, { metal: "brass" });

      // Brook Trout lithograph cutout peering from right arch
      S.drawScissorCutout(
        ctx, pImg,
        434, 262, 98, 76,
        894 + pxMid * 0.8, 284 + Math.sin(t * 2.8) * 7, 178, 132,
        [[0.03, 0.42], [0.45, 0.06], [0.96, 0.06], [0.96, 0.92], [0.35, 0.90]],
        { filter: "litho", haloWidth: 4.2, seed: 4.29 }
      );

    } else if (beat.index === 1) {
      // --- VARIATION II (B): "A rival iron mini-submarine" (+ Snail Mail Out) ---
      var subX = 636 + Math.sin(t * 1.4) * 32;
      var subY = 352 + Math.cos(t * 2.0) * 8;

      // Brass Skeleton Key mounted at the stern spinning as a mechanical screw propeller!
      ctx.save();
      ctx.translate(subX - 210, subY + 26);
      S.drawScissorCutout(
        ctx, pImg,
        226, 395, 232, 98,
        -118, -42, 212, 84,
        KEY_POLY,
        { filter: "sepia", haloWidth: 4.0, rot: 0.28 + Math.sin(t * 18) * 0.26, seed: 4.41 }
      );
      S.drawReinigerFiligreeHinge(ctx, 72, 0, 7.0, { metal: "brass" });
      ctx.restore();

      // Hinged Lotte Reiniger Periscope & Conning Tower emerging from the turtle carapace!
      var scopeUp = 44 + Math.sin(t * 2.4) * 10;
      S.drawCutoutPaperEdge(
        ctx,
        [[subX - 24, subY - 82], [subX - 18, subY - 122 - scopeUp], [subX + 46, subY - 122 - scopeUp], [subX + 46, subY - 98 - scopeUp], [subX + 8, subY - 98 - scopeUp], [subX + 14, subY - 82]],
        "#26282b", "#fbfaf5", { paperRim: 3.5 }
      );
      S.drawReinigerFiligreeHinge(ctx, subX - 4, subY - 86, 6.5, { metal: "brass" });

      // Turtle cutout converted into an ironclad mini-sub with riveted brass porthole windows!
      S.drawScissorCutout(
        ctx, pImg,
        182, 282, 268, 168,
        subX - 196, subY - 108, 416, 236,
        TURTLE_POLY,
        { filter: "litho", haloWidth: 5.0, seed: 4.45 }
      );
      for (var wi = -1; wi <= 1; wi++) {
        var wxP = subX - 24 + wi * 62;
        var wyP = subY - 8;
        ctx.fillStyle = "#fae090";
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.arc(wxP, wyP, 16, 0, TAU); ctx.fill(); ctx.stroke();
        S.drawSplitPin(ctx, wxP, wyP - 20, 3.2, { metal: "brass" });
      }
      // Searchlight beam from turtle's snout
      if (beat.lampOn) {
        ctx.fillStyle = "rgba(250, 224, 144, 0.26)";
        ctx.beginPath();
        ctx.moveTo(subX + 206, subY - 4);
        ctx.lineTo(1180, subY - 115);
        ctx.lineTo(1180, subY + 115);
        ctx.closePath();
        ctx.fill();
      }

    } else if (beat.index === 2) {
      // --- VARIATION III (C): "A grumpy thief's back-scratcher" (+ Trout Reply) ---
      var turtX2 = 468;
      var turtY2 = 304 + Math.sin(t * 7.2) * 3.5;

      // Grumpy Snapping Turtle getting its mossy shell scratched!
      S.drawScissorCutout(
        ctx, pImg,
        182, 282, 268, 168,
        turtX2, turtY2, 396, 228,
        TURTLE_POLY,
        { filter: "litho", haloWidth: 4.8, seed: 4.61 }
      );

      // Sneaky Reiniger Silhouette Creek Thief standing on left, wielding the giant Brass Key as a Back-Scratcher!
      var thiefX = 242;
      var thiefY = 398;
      // Bandit silhouette body + striped sack + mask
      S.drawCutoutPaperEdge(
        ctx,
        [[thiefX - 48, 558], [thiefX - 38, thiefY - 46], [thiefX + 28, thiefY - 52], [thiefX + 42, 558]],
        "#151618", "#fbfaf5", { paperRim: 4.0 }
      );
      S.drawCutoutPaperEdge(
        ctx,
        [[thiefX - 28, thiefY - 52], [thiefX - 24, thiefY - 104], [thiefX + 26, thiefY - 98], [thiefX + 30, thiefY - 48]],
        "#232528", "#fbfaf5", { paperRim: 3.5 }
      );
      // White thief eye-mask slit
      ctx.fillStyle = "#fbfaf5";
      ctx.fillRect(thiefX - 6, thiefY - 86, 30, 11);
      ctx.fillStyle = "#14110d";
      ctx.beginPath(); ctx.arc(thiefX + 14, thiefY - 80, 3.2, 0, TAU); ctx.fill();

      // IK Scratching Arm scrubbing the Brass Key teeth back-and-forth across the turtle's carapace!
      var scratchShift = Math.sin(t * 8.4) * 38;
      var gripX = 382 + scratchShift * 0.5;
      var gripY = 318 - Math.abs(scratchShift) * 0.18;
      var thIK = S.solveIK2(thiefX + 18, thiefY - 32, 86, 84, gripX, gripY, -1);
      drawCardboardLimb(ctx, thiefX + 18, thiefY - 32, thIK.jx, thIK.jy, 11, 9, "#2d2f33", null);
      drawCardboardLimb(ctx, thIK.jx, thIK.jy, gripX, gripY, 9, 8, "#2d2f33", null);
      S.drawReinigerFiligreeHinge(ctx, thiefX + 18, thiefY - 32, 5.8, { metal: "brass" });
      S.drawReinigerFiligreeHinge(ctx, thIK.jx, thIK.jy, 5.2, { metal: "brass" });

      // Giant Skeleton Key flipped teeth-down scratching the turtle's shell!
      S.drawScissorCutout(
        ctx, pImg,
        226, 395, 232, 98,
        gripX - 30, gripY - 86, 344, 128,
        KEY_POLY,
        { filter: "sepia", haloWidth: 4.5, rot: -0.18 + Math.sin(t * 8.4) * 0.06, pivotX: gripX, pivotY: gripY, seed: 4.66 }
      );

      // Little white lithograph comfort-sparks & zigzags above scratched shell!
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 3.0;
      for (var si = 0; si < 4; si++) {
        var sxP = 580 + scratchShift + (si - 1.5) * 32;
        var syP = 266 - Math.abs(Math.sin(t * 8.4 + si)) * 26;
        ctx.beginPath();
        ctx.moveTo(sxP, syP);
        ctx.lineTo(sxP + (si - 1.5) * 10, syP - 18);
        ctx.stroke();
      }

      S.drawBrookTrout(ctx, 976, 356 + Math.sin(t * 3.2) * 8, 1.12, t, false);

    } else {
      // --- VARIATION IV (D): "An ancient starship ignition key" (+ Alien Listening Post) ---
      S.drawAlienSaucer(ctx, 640, 96, 1.12, t, 640, 356, { beamSpread: 195 });

      // Ornate Lotte Reiniger Filigree Celestial Ignition Lock-Ring in center of ink band!
      var lockX = 640;
      var lockY = 336;
      var turnProgress = S.smooth(0.18, 0.68, beat.u);
      var keyTurn = -Math.PI * 0.5 + turnProgress * (Math.PI * 0.5);

      ctx.save();
      ctx.translate(lockX, lockY);
      ctx.rotate(turnProgress * 0.65);
      // Outer white-halo celestial gear ring
      S.drawCutoutPaperEdge(ctx, circlePoly(16, 122, 122, 0, 0, 2, 44), "#1b242c", "#fbfaf5", { paperRim: 4.5 });
      ctx.strokeStyle = "#0f8f80";
      ctx.lineWidth = 3.2;
      ctx.setLineDash([12, 8]);
      ctx.beginPath(); ctx.arc(0, 0, 94, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
      for (var gi = 0; gi < 8; gi++) {
        var ga = (gi / 8) * TAU;
        S.drawReinigerFiligreeHinge(ctx, Math.cos(ga) * 94, Math.sin(ga) * 94, 6.2, { metal: "brass" });
      }
      // Keyhole slot at center
      ctx.fillStyle = "#d42a1e";
      ctx.beginPath(); ctx.arc(0, -10, 20, 0, TAU); ctx.fill();
      ctx.fillRect(-10, -10, 20, 42);
      ctx.restore();

      // The Brass Skeleton Key cutout slotting vertically & turning to ignite the starship lock!
      S.drawScissorCutout(
        ctx, pImg,
        226, 395, 232, 98,
        lockX - 180, lockY - 62, 360, 128,
        KEY_POLY,
        { filter: "sepia", haloWidth: 5.0, rot: keyTurn, pivotX: lockX, pivotY: lockY, seed: 4.88 }
      );
    }

    drawStoryAndInteractiveSnail(ctx, W, H, beat, t, state, { floorY: 556 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 4);
  }

  /* ==========================================================================
   * PORTHOLE #05 · SCOPE — "duchamp-optic"
   * Workshop: 99 Ways / Anémic Cinéma · Director: S13 Nora Willett Secondary Motion
   * Plates: ./portholes/p05.jpg + ./assets/atlas-stills/atlas-53.webp
   *   (A) A raccoon washing a tin plate
   *   (B) A sneaky creek hubcap thief
   *   (C) A bubbly floating pie tin
   *   (D) A masked UFO saucer polisher
   * ========================================================================== */
  function drawDuchampRotorRings(ctx, cx, cy, rad, rot, accentCol) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    for (var i = 0; i < 6; i++) {
      var r = rad * (1 - i * 0.13);
      var ecc = i * 4.2;
      ctx.strokeStyle = i % 2 === 0 ? "rgba(251,250,245,0.22)" : accentCol;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(ecc, 0, Math.max(8, r), 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  function renderP05(ctx, W, H, rawT, state) {
    var S = getStage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(5);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // Plane 0: Dark engraved workshop slate (duchamp-optic register!)
    S.drawBolasBackdrop(ctx, W, H, "duchamp-optic", 5, t, state);
    drawDuchampRotorRings(ctx, 640, 304, 248, t * 0.55, "rgba(15, 143, 128, 0.20)");

    var pxFar = S.parallaxX(0.28, t, state);
    var pxMid = S.parallaxX(0.62, t, state);
    var waterY = 344 + (beat.ballastOn ? -24 : 0) + Math.sin(t * 1.4) * 5;

    // Plane 1: Autumn maple leaf cutouts with Nora Willett secondary sway above waterline + atlas-53 reflective river below!
    S.drawScissorCutout(
      ctx, pImg,
      136, 108, 196, 148,
      132 + pxFar, 54, 296, 206,
      [[0.05, 0.22], [0.44, 0.03], [0.95, 0.08], [0.92, 0.78], [0.46, 0.96], [0.06, 0.84]],
      { haloWidth: 4.5, rot: S.wobble(t, 2.2, 0.06, 0.3), seed: 5.08 }
    );
    var aw5 = aImg ? aImg.naturalWidth : 382;
    var ah5 = aImg ? aImg.naturalHeight : 680;
    S.drawScissorCutout(
      ctx, aImg,
      aw5 * 0.04, ah5 * 0.20, aw5 * 0.92, ah5 * 0.72,
      868 + pxFar * 1.1, 74, 256, 272,
      [[0.05, 0.05], [0.95, 0.05], [0.95, 0.95], [0.05, 0.95]],
      { filter: "cyan", haloWidth: 3.8, alpha: 0.80, seed: 5.12 }
    );

    // Lower creek water multiplane sheet below waterY
    ctx.save();
    ctx.fillStyle = "rgba(15, 96, 92, 0.44)";
    ctx.fillRect(-20, waterY, W + 40, 648 - waterY);
    ctx.restore();

    var tinPoly = circlePoly(18, 0.46, 0.46, 0.5, 0.5, 0.012, 5.5);

    if (beat.index === 0) {
      // --- VARIATION I (A): "A raccoon washing a tin plate" ---
      var washRot = Math.sin(t * 3.8) * 0.42;
      var plateX = 508 + pxMid * 0.4;
      var plateY = waterY - 128 + Math.sin(t * 2.8) * 8;

      // Gleaming concentric Tin Pie-Plate scissor cutout half-submerged across the waterline!
      S.drawScissorCutout(
        ctx, pImg,
        225, 209, 198, 198,
        plateX, plateY, 268, 268,
        tinPoly,
        { haloWidth: 5.2, rot: washRot, seed: 5.21 }
      );

      // Two furry Raccoon Arm cutouts from p05.jpg + IK secondary wrist scrubbing!
      var scrub = Math.sin(t * 7.2) * 18;
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

      // Brook Trout cutout below waterline watching the gleaming tin disc!
      S.drawScissorCutout(
        ctx, pImg,
        290, 395, 200, 112,
        544 + Math.sin(t * 2.2) * 20, 438, 298, 164,
        [[0.03, 0.48], [0.34, 0.08], [0.68, 0.05], [0.97, 0.14], [0.96, 0.86], [0.32, 0.95]],
        { haloWidth: 4.5, seed: 5.29 }
      );

    } else if (beat.index === 1) {
      // --- VARIATION II (B): "A sneaky creek hubcap thief" (+ Snail Mail Out) ---
      // Cut-paper riverside jalopy fender & black rubber tire parked on the upper bank!
      var carX = 768;
      var carY = 258;
      S.drawCutoutPaperEdge(
        ctx,
        [[carX - 155, carY + 34], [carX - 126, carY - 86], [carX + 168, carY - 94], [carX + 195, carY + 34]],
        "#7d3228", "#fbfaf5", { paperRim: 4.0 }
      );
      // Black rubber tire missing its chrome hubcap!
      ctx.save();
      ctx.translate(carX, carY + 24);
      S.drawCutoutPaperEdge(ctx, circlePoly(16, 98, 98, 0, 0, 1, 51), "#1b1c1e", "#fbfaf5", { paperRim: 4.0 });
      ctx.fillStyle = "#484a4d";
      ctx.beginPath(); ctx.arc(0, 0, 52, 0, TAU); ctx.fill();
      for (var lug = 0; lug < 5; lug++) {
        var la = (lug / 5) * TAU;
        S.drawSplitPin(ctx, Math.cos(la) * 28, Math.sin(la) * 28, 4.2, { metal: "silver" });
      }
      ctx.restore();

      // Sneaky Masked Cardboard Raccoon Thief with multi-segment Willett striped tail running off with the Spinning Hubcap!
      var heistU = S.smooth(0.08, 0.88, beat.u);
      var racX = S.lerp(596, 376, heistU);
      var racY = 308 - Math.abs(Math.sin(t * 8.2)) * 16;

      // Striped secondary-motion tail (3 hinged segments!)
      var tailBaseX = racX + 46;
      var tailBaseY = racY + 38;
      for (var ts = 0; ts < 3; ts++) {
        var tw = S.wobble(t, 5.6, 16, ts * 0.9);
        S.drawCardboardPuppetPiece(
          ctx,
          [[tailBaseX + ts * 28, tailBaseY - 12 + tw * 0.4], [tailBaseX + (ts + 1) * 32, tailBaseY - 16 + tw], [tailBaseX + (ts + 1) * 32, tailBaseY + 12 + tw], [tailBaseX + ts * 28, tailBaseY + 12 + tw * 0.4]],
          { tone: ts % 2 === 0 ? "#363533" : "#a8a39a", ribs: 1, pin: ts === 0 ? { x: tailBaseX, y: tailBaseY, r: 4.0, metal: "brass" } : null }
        );
      }

      // Raccoon cardboard torso, bandit mask head & crowbar
      S.drawCardboardPuppetPiece(
        ctx,
        [[racX - 42, racY + 62], [racX - 36, racY - 34], [racX + 36, racY - 28], [racX + 46, racY + 62]],
        { tone: "#7d7972", ribs: 2, pins: [[racX - 18, racY + 52], [racX + 20, racY + 52]] }
      );
      S.drawCardboardPuppetPiece(
        ctx,
        [[racX - 38, racY - 32], [racX - 32, racY - 82], [racX + 28, racY - 78], [racX + 32, racY - 30]],
        { tone: "#9e9990", ribs: 1, pin: { x: racX - 2, y: racY - 32, r: 4.2, metal: "silver" } }
      );
      // Black raccoon bandit mask
      ctx.fillStyle = "#14110d";
      ctx.fillRect(racX - 36, racY - 66, 56, 18);
      ctx.fillStyle = "#fbfaf5";
      ctx.beginPath(); ctx.arc(racX - 20, racY - 57, 4.5, 0, TAU); ctx.arc(racX + 4, racY - 57, 4.5, 0, TAU); ctx.fill();

      // Stolen Tin-Plate Hubcap spinning like a Duchamp rotorelief in Raccoon's paws!
      S.drawScissorCutout(
        ctx, pImg,
        225, 209, 198, 198,
        racX - 154, racY - 64, 152, 152,
        tinPoly,
        { haloWidth: 4.5, rot: -t * 5.4, seed: 5.42 }
      );

    } else if (beat.index === 2) {
      // --- VARIATION III (C): "A bubbly floating pie tin" (+ Trout Reply) ---
      var bobY = waterY - 46 + Math.sin(t * 3.4) * 11;
      var tilt = Math.sin(t * 2.5) * 0.08;

      // Floating crimped pie-tin boat cutout bobbing on the waterline piled with cut-paper soap foam!
      ctx.save();
      ctx.translate(612, bobY);
      ctx.rotate(tilt);
      // Crimped pie-tin profile + real tin-plate top reflection
      S.drawScissorCutout(
        ctx, pImg,
        225, 209, 198, 198,
        -158, -44, 316, 108,
        tinPoly,
        { haloWidth: 4.8, shadow: false, seed: 5.61 }
      );
      S.drawCutoutPaperEdge(
        ctx,
        [[-168, 4], [168, 4], [128, 56], [-128, 56]],
        "#aeb6bc", "#14110d", { paperRim: 3.5 }
      );
      // Mound of pearlescent soap-bubble domes sitting inside the floating pie tin!
      var mounds = [[-86, -12, 30], [-36, -28, 38], [22, -24, 36], [78, -10, 28], [-6, -52, 28]];
      for (var mi = 0; mi < mounds.length; mi++) {
        ctx.fillStyle = "#fbfaf5";
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(mounds[mi][0], mounds[mi][1], mounds[mi][2], 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      drawCutBubbleCluster(ctx, 612, bobY - 40, 14, 260, 175, t, 55, "rgba(218, 246, 244, 0.9)");

      // Brook the Trout nudging the floating pie tin from below!
      S.drawBrookTrout(ctx, 628 + Math.sin(t * 2.2) * 32, bobY + 138, 1.24, t, true, {
        tilt: -0.22 + Math.sin(t * 3.4) * 0.08
      });

    } else {
      // --- VARIATION IV (D): "A masked UFO saucer polisher" (+ Alien Listening Post) ---
      S.drawAlienSaucer(ctx, 640, 94, 1.12, t, 636, 336, { beamSpread: 210 });

      // Giant Duchamp Optical Rotor + Spinning Tin-Plate UFO Saucer in center stage!
      var ufoX = 636;
      var ufoY = 344 + Math.sin(t * 2.6) * 8;
      drawDuchampRotorRings(ctx, ufoX, ufoY, 178, -t * 2.4, "rgba(212, 42, 30, 0.55)");

      S.drawScissorCutout(
        ctx, pImg,
        225, 209, 198, 198,
        ufoX - 134, ufoY - 134, 268, 268,
        tinPoly,
        { filter: "cyan", haloWidth: 5.2, rot: t * 3.8, seed: 5.88 }
      );
      // Translucent UFO dome bolted to the center of the spinning tin plate!
      ctx.save();
      ctx.translate(ufoX, ufoY);
      ctx.fillStyle = "rgba(212, 246, 240, 0.72)";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2.8;
      ctx.beginPath(); ctx.arc(0, 0, 52, 0, TAU); ctx.fill(); ctx.stroke();
      S.drawSplitPin(ctx, 0, 0, 6.2, { metal: "brass" });
      ctx.restore();

      // Masked Raccoon wearing a Space Bubble Helmet buffing the spinning UFO with two IK chamois cloths!
      var polX = 294;
      var polY = 328 + Math.sin(t * 3.1) * 6;
      S.drawCardboardPuppetPiece(
        ctx,
        [[polX - 48, polY + 96], [polX - 42, polY - 28], [polX + 42, polY - 28], [polX + 52, polY + 96]],
        { tone: "#807c76", ribs: 2, pins: [[polX - 18, polY + 80], [polX + 22, polY + 80]] }
      );
      // Raccoon head + black mask inside translucent space-helmet bubble!
      S.drawCardboardPuppetPiece(
        ctx,
        [[polX - 36, polY - 28], [polX - 30, polY - 84], [polX + 30, polY - 84], [polX + 36, polY - 28]],
        { tone: "#a29d94", ribs: 1 }
      );
      ctx.fillStyle = "#14110d";
      ctx.fillRect(polX - 30, polY - 66, 60, 18);
      ctx.fillStyle = "#fbfaf5";
      ctx.beginPath(); ctx.arc(polX - 12, polY - 57, 4.5, 0, TAU); ctx.arc(polX + 14, polY - 57, 4.5, 0, TAU); ctx.fill();
      ctx.fillStyle = "rgba(205, 242, 240, 0.34)";
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.arc(polX, polY - 56, 56, 0, TAU); ctx.fill(); ctx.stroke();

      // Two rapid IK polishing arms + yellow chamois cloths buffing the UFO rim!
      for (var ai = 0; ai < 2; ai++) {
        var buffAng = (ai === 0 ? -0.45 : 0.45) + Math.sin(t * 11.5 + ai * 2.2) * 0.34;
        var buffX = ufoX - Math.cos(buffAng) * 124;
        var buffY = ufoY + Math.sin(buffAng) * 96;
        var polIK = S.solveIK2(polX + 36, polY - 8 + ai * 34, 98, 96, buffX, buffY, ai === 0 ? -1 : 1);
        drawCardboardLimb(ctx, polX + 36, polY - 8 + ai * 34, polIK.jx, polIK.jy, 12, 10, "#6e6a64", "silver");
        drawCardboardLimb(ctx, polIK.jx, polIK.jy, buffX, buffY, 10, 8, "#4c4945", "brass");
        S.drawCutoutPaperEdge(
          ctx,
          [[buffX - 24, buffY - 16], [buffX + 22, buffY - 20], [buffX + 26, buffY + 18], [buffX - 20, buffY + 22]],
          "#fae090", "#14110d", { paperRim: 2.5, shadow: false }
        );
      }
    }

    // Crisp cut-paper waterline ribbon across stage in Beats A, B, C
    if (beat.index < 3) {
      ctx.save();
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      for (var rxW = -10; rxW <= W + 10; rxW += 24) {
        var ryW = waterY + Math.sin(rxW * 0.018 + t * 3.2) * 6;
        if (rxW === -10) ctx.moveTo(rxW, ryW); else ctx.lineTo(rxW, ryW);
      }
      ctx.stroke();
      ctx.restore();
    }

    drawStoryAndInteractiveSnail(ctx, W, H, beat, t, state, { floorY: 564 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 5);
  }

  function STAGE_H_SAFE(S) {
    return (S && S.STAGE_H) ? S.STAGE_H : 638;
  }

  // ---------- Register Crew 01 Remake Scenes (#01–#05) ----------
  var DEFS = [
    { id: 1, station: "#01 \u00b7 Bow", fn: renderP01 },
    { id: 2, station: "#02 \u00b7 Galley", fn: renderP02 },
    { id: 3, station: "#03 \u00b7 Starbd", fn: renderP03 },
    { id: 4, station: "#04 \u00b7 Belly", fn: renderP04 },
    { id: 5, station: "#05 \u00b7 Scope", fn: renderP05 }
  ];

  for (var i = 0; i < DEFS.length; i++) {
    (function (d) {
      SCENES[d.id] = {
        id: d.id,
        station: d.station,
        duration: 16.0,
        preload: function () {
          var S = getStage();
          return S && S.preloadPortalPlates ? S.preloadPortalPlates(d.id) : Promise.resolve();
        },
        render: function (ctx, W, H, t, state) {
          d.fn(ctx, W || 1280, H || 720, t || 0, state || {});
        }
      };
    })(DEFS[i]);
  }
})(typeof window !== "undefined" ? window : globalThis);
