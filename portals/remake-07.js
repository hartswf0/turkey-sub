/* ============================================================================
 * Turkey Sub · Multi-SCION BOLAS Rostrum Remake — Crew 7 (#31–#35)
 * File: portals/remake-07.js  (window.PORTAL_REMAKE_SCENES[31..35])
 *
 * 16.0s (384 frames @ 24fps, 1280×720) 4-Variation Cutout & Split-Pin Cinema:
 *   - #31 · Galley B  ("queneau-rostrum"    · Oucuipo × S52 Gilliam Ephemera)
 *   - #32 · Beak Arm  ("cardboard-parallax" · Teuf-Teuf × S01 Terry Gilliam IK)
 *   - #33 · Salon     ("daumier-litho"      · Monsieur Ripois × S03 Ernst/Zeman)
 *   - #34 · Organ     ("perec-stage"        · Ouarchpo × S26 Méliès Cutaway)
 *   - #35 · Post #44  ("cardboard-parallax" · Machine à tuer le temps × S50 LOC)
 *
 * Strict PAELEO Blind-Mode Invariant:
 *   When state && state.showCaptions === false -> ZERO fillText/strokeText calls
 *   AND tactile cardboard/brass patches cover any painted plate text ("375°F", "#44").
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var DURATION = 16.0;

  var SCENES = (root.PORTAL_REMAKE_SCENES = root.PORTAL_REMAKE_SCENES || {});

  if (root.SCION_STAGE && typeof root.SCION_STAGE.preloadPortalPlates === "function") {
    root.SCION_STAGE.preloadPortalPlates([31, 32, 33, 34, 35]);
  }

  // ---------- Shared Tactile Helpers (100% Text-Free in Blind Mode) ----------

  function drawLinkageBar(ctx, S, x1, y1, x2, y2, halfW, tone, opts) {
    var cfg = opts || {};
    var dx = x2 - x1;
    var dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / len;
    var uy = dy / len;
    var nx = -uy * halfW;
    var ny = ux * halfW;
    var ext = cfg.pad != null ? cfg.pad : halfW * 0.75;
    var sx = x1 - ux * ext;
    var sy = y1 - uy * ext;
    var ex = x2 + ux * ext;
    var ey = y2 + uy * ext;

    var pts = [
      [sx + nx, sy + ny],
      [ex + nx * 0.88, ey + ny * 0.88],
      [ex + ux * (halfW * 0.35), ey + uy * (halfW * 0.35)],
      [ex - nx * 0.88, ey - ny * 0.88],
      [sx - nx, sy - ny],
      [sx - ux * (halfW * 0.35), sy - uy * (halfW * 0.35)]
    ];
    S.drawCardboardPuppetPiece(ctx, pts, {
      tone: tone || "#8f8d87",
      ribs: cfg.ribs != null ? cfg.ribs : 2,
      stroke: cfg.stroke || "#181715",
      shadow: cfg.shadow !== false
    });
    if (cfg.pinStart) S.drawSplitPin(ctx, x1, y1, cfg.pinR || 4.8, { metal: cfg.metal || "brass" });
    if (cfg.pinEnd) S.drawSplitPin(ctx, x2, y2, cfg.pinR || 4.8, { metal: cfg.metal || "silver" });
  }

  function drawPaperBubble(ctx, x, y, r, tint) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.arc(0, 0, r + 2.2, 0, TAU);
    ctx.fill();

    ctx.fillStyle = tint || "rgba(198, 238, 232, 0.72)";
    ctx.strokeStyle = "#181613";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-r * 0.34, -r * 0.34, Math.max(1.4, r * 0.26), 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawBallastOverlay(ctx, S, W, H, t, state) {
    if (!state || !state.ballast) return;
    ctx.save();
    for (var i = 0; i < 12; i++) {
      var bx = 120 + S.hash(i * 19.7) * (W - 240) + Math.sin(t * 2.4 + i) * 14;
      var by = ((620 - ((t * (72 + (i % 4) * 18) + i * 53) % 580)) + 580) % 580 + 30;
      var br = 4 + (i % 4) * 2.2;
      drawPaperBubble(ctx, bx, by, br, "rgba(170, 228, 224, 0.65)");
    }
    ctx.restore();
  }

  function drawCourierChoreography(ctx, S, W, H, t, beat, state, opts) {
    var cfg = opts || {};
    var floorY = cfg.floorY != null ? cfg.floorY : 526;
    var troutX = cfg.troutX != null ? cfg.troutX : 995;
    var troutY = cfg.troutY != null ? cfg.troutY : 360;
    var saucerX = cfg.saucerX != null ? cfg.saucerX : 640;
    var saucerY = cfg.saucerY != null ? cfg.saucerY : 108;
    var beamX = cfg.beamX != null ? cfg.beamX : 640;
    var beamY = cfg.beamY != null ? cfg.beamY : 400;

    // Interactive override from player.js (Snail Mail button)
    if (state && state.snailActive && typeof state.snailT === "number") {
      var su = S.clamp(state.snailT, 0, 1);
      var ix = S.lerp(180, 1080, su);
      var iy = floorY - Math.sin(su * Math.PI) * 65;
      S.drawMailSnail(ctx, ix, iy, 1.24, t, {
        hasReply: su > 0.52,
        hasAlienStamp: su > 0.82
      });
    }

    if (beat.index === 1) {
      // Beat B: Turkey Probable + Snail Mail Dispatch
      var disp = S.smooth(0.05, 0.45, beat.u);
      S.drawTurkeyCutawayBadge(ctx, cfg.turkeyX || 124, cfg.turkeyY || 496, 1.04, t, { dispatch: disp });
      var sxB = S.lerp(225, 860, S.easeInOutCubic(S.clamp((beat.u - 0.08) / 0.86, 0, 1)));
      var syB = floorY + Math.sin(beat.localT * 3.4) * 3.5;
      S.drawMailSnail(ctx, sxB, syB, 1.22, t, { hasReply: false, hasAlienStamp: false });
    } else if (beat.index === 2) {
      // Beat C: Brook Trout Plausible + Snail Mail Climbing Right Edge
      if (cfg.customTrout !== true) {
        var enterC = S.easeOutBack(S.clamp(beat.localT / 0.65, 0, 1));
        var txC = S.lerp(W + 90, troutX, enterC) + Math.sin(t * 1.8) * 10;
        var tyC = troutY + Math.cos(t * 2.3) * 8;
        S.drawBrookTrout(ctx, txC, tyC, cfg.troutScale || 1.12, t, false);
      }
      var climbU = S.easeInOutCubic(beat.u);
      var sxC = cfg.snailClimbX || 1142;
      var syC = S.lerp(510, 225, climbU);
      S.drawMailSnail(ctx, sxC, syC, 1.14, t, {
        rot: -Math.PI * 0.46,
        hasReply: true,
        hasAlienStamp: false
      });
    } else if (beat.index === 3) {
      // Beat D: Alien Listening Post Saucer + Tri-Stamped Snail
      var enterD = S.easeOutBack(S.clamp(beat.localT / 0.6, 0, 1));
      var ayD = S.lerp(-60, saucerY, enterD);
      S.drawAlienSaucer(ctx, saucerX, ayD, cfg.saucerScale || 1.22, t, beamX, beamY, {
        beamSpread: cfg.beamSpread || 165
      });
      S.drawMailSnail(ctx, cfg.snailAlienX || 1090, floorY - 6, 1.06, t, {
        flip: true,
        hasReply: true,
        hasAlienStamp: true
      });
    }
  }

  function drawRansomHeader(ctx, S, items, x0, y0, state) {
    if (S.isBlind(state)) return;
    ctx.save();
    var cx = x0;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var rot = it.rot || 0;
      ctx.save();
      ctx.translate(cx, y0 + (it.dy || 0));
      ctx.rotate(rot);
      if (it.box) {
        ctx.fillStyle = it.box;
        ctx.fillRect(-4, -it.size + 4, it.w + 8, it.size + 6);
      }
      ctx.font = (it.weight || "800") + " " + it.size + "px " + (it.serif ? '"Literata", Georgia, serif' : '"Big Shoulders Display", Impact, sans-serif');
      ctx.fillStyle = it.col || "#14110d";
      S.safeText(ctx, it.ch, 0, 0, state);
      ctx.restore();
      cx += it.w;
    }
    ctx.restore();
  }

  function drawCutPaperMusicNote(ctx, S, x, y, scale, rot, col) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.scale(scale || 1, scale || 1);
    // White scissor-cut backing
    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-14, -22, 28, 36, 7) : ctx.rect(-14, -22, 28, 36);
    ctx.fill();

    ctx.fillStyle = col || "#d42a1e";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(-4, 6, 6.5, 4.8, -0.35, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillRect(0.5, -16, 3.2, 22);
    ctx.beginPath();
    ctx.moveTo(2, -16);
    ctx.quadraticCurveTo(12, -12, 9, -3);
    ctx.quadraticCurveTo(7, -8, 2, -10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ==========================================================================
  // #31 · GALLEY B ("queneau-rostrum" · Oucuipo × S52 Gilliam Ephemera)
  // A: A dented metal bread-roll baking tin
  // B: A terrifying Thanksgiving oven pan
  // C: A cozy heated minnow hot-tub
  // D: A scorched spaceship heat-shield
  // ==========================================================================
  function render31(ctx, W, H, rawT, state) {
    var S = root.SCION_STAGE;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(31);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg; // atlas-11.webp (740×569, Méliès Impossible Voyage)

    var pxFar = S.parallaxX(0.22, t, state);
    var pyFar = S.parallaxY(0.22, t, state);
    var pxMid = S.parallaxX(0.52, t, state);
    var pyMid = S.parallaxY(0.52, t, state);
    var pxFg = S.parallaxX(0.85, t, state);

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // 1. Queneau Buttercream Rostrum Stock + Green Torn-Deckle Floor (exercices-de-style.webp!)
    S.drawBolasBackdrop(ctx, W, H, "queneau-rostrum", 31, t, state, {
      paperTop: beat.index === 3 ? "#dfd0a6" : "#fae194",
      paperBot: beat.index === 3 ? "#bfa978" : "#eccd76",
      floorColor: beat.index === 1 ? "#3c1f16" : (beat.index === 3 ? "#1f2730" : "#273b19")
    });

    // Editorial Queneau Ransom Header & Literary Note (skipped 100% in blind mode!)
    if (!beat.blind) {
      drawRansomHeader(ctx, S, [
        { ch: "G", size: 40, w: 24, col: "#d42a1e", serif: true, dy: 2 },
        { ch: "a", size: 48, w: 25, col: "#d42a1e", serif: false },
        { ch: "l", size: 44, w: 14, col: "#14110d", serif: true },
        { ch: "l", size: 44, w: 14, col: "#14110d", serif: false },
        { ch: "e", size: 42, w: 24, col: "#d42a1e", serif: true, dy: -2 },
        { ch: "y", size: 46, w: 28, col: "#14110d", serif: false },
        { ch: "B", size: 50, w: 34, col: "#14110d", serif: false, rot: -0.05 }
      ], 66, 86, state);

      ctx.save();
      ctx.fillStyle = "#5c4a28";
      ctx.font = 'italic 20px "Literata", Georgia, serif';
      var queneauSub = [
        "On l’a cabossé dans le ruisseau.",
        "Un plat à rôtir de novembre !",
        "Quatre vairons dans un bain chaud.",
        "Bouclier thermique en rentrée."
      ][beat.index];
      S.safeText(ctx, queneauSub, 265, 78, state);
      ctx.restore();
    }

    // 2. Far Plane: Foraged Méliès Painted Sea & Galley Boiler Cutouts (atlas-11.webp, zero-text crops)
    S.drawScissorCutout(ctx, aImg, 12, 442, 716, 120, 74 + pxFar, 445 + pyFar, 680, 108, null, {
      filter: "sepia",
      haloWidth: 4.5,
      alpha: 0.88,
      seed: 311
    });
    S.drawScissorCutout(ctx, aImg, 6, 188, 194, 232, 82 + pxFar * 1.2, 168 + pyFar, 215, 252, [
      [0.06, 0.08], [0.55, 0.03], [0.95, 0.12], [0.97, 0.92], [0.05, 0.95]
    ], {
      filter: "mono",
      haloWidth: 4.5,
      seed: 312
    });

    // Right Torn-Deckle Pantry Door (exact exercices-de-style SERVICE door homage; 0 text in blind mode!)
    var doorX = 992 + pxFar * 0.9;
    var doorY = 76 + pyFar * 0.6;
    S.drawTornPaperFlat(ctx, doorX, doorY, 206, 456, {
      fill: "#223819",
      paperColor: "#f3ede0",
      deckle: 7.5,
      seed: 31.7
    });
    // Door inner panels + porcelain plaque + split-pin latch
    ctx.save();
    ctx.strokeStyle = "rgba(14, 24, 10, 0.55)";
    ctx.lineWidth = 3;
    ctx.strokeRect(doorX + 24, doorY + 28, 158, 178);
    ctx.strokeRect(doorX + 24, doorY + 232, 158, 192);
    S.drawCutoutPaperEdge(ctx, [
      [doorX + 44, doorY + 86], [doorX + 162, doorY + 86],
      [doorX + 162, doorY + 126], [doorX + 44, doorY + 126]
    ], "#ede7d8", "#2d3b24", { paperRim: 0, shadow: false });
    if (!beat.blind) {
      ctx.fillStyle = "#14110d";
      ctx.font = '700 15px "Big Shoulders Display", sans-serif';
      ctx.textAlign = "center";
      S.safeText(ctx, "GALLEY · 375", doorX + 103, doorY + 112, state);
    } else {
      // Pure geometric reed-stripe emblem in blind mode (#verne-09)
      ctx.strokeStyle = "#273b19";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(doorX + 64, doorY + 106);
      ctx.lineTo(doorX + 142, doorY + 106);
      ctx.stroke();
      S.drawSplitPin(ctx, doorX + 64, doorY + 106, 3.2, { metal: "brass" });
      S.drawSplitPin(ctx, doorX + 142, doorY + 106, 3.2, { metal: "brass" });
    }
    S.drawCutoutPaperEdge(ctx, [
      [doorX + 16, doorY + 236], [doorX + 34, doorY + 236],
      [doorX + 34, doorY + 278], [doorX + 16, doorY + 278]
    ], "#f2ede2", "#14110d", { paperRim: 0, shadow: false });
    ctx.restore();

    // 3. Variation-Specific Midground Stage Re-Dressing (S43 Collage Graph Rewriting)
    var tinCX = 595 + pxMid;
    var tinCY = 328 + pyMid + Math.sin(t * 1.9) * 4;
    var tinRot = beat.index === 3 ? 0.36 + Math.sin(t * 5.2) * 0.025 : (beat.index === 1 ? -0.05 : 0.0);

    if (beat.index === 1) {
      // Variation II (Turkey): Iron Oven Wire Rack + Flickering Torn-Paper Oven Flames!
      var rackSlide = S.spring(beat.localT, 0.05, 12, 5);
      var rackY = S.lerp(560, 468 + pyMid, rackSlide);
      for (var fi = 0; fi < 7; fi++) {
        var fx = 395 + fi * 62 + pxMid;
        var fh = 42 + Math.sin(t * 9.5 + fi * 1.7) * 18;
        S.drawCutoutPaperEdge(ctx, [
          [fx - 22, rackY + 24], [fx - 6, rackY - fh],
          [fx + 10, rackY - fh * 0.55], [fx + 22, rackY + 24]
        ], fi % 2 === 0 ? "#d42a1e" : "#ec8b26", "#14110d", { paperRim: 2.5 });
      }
      drawLinkageBar(ctx, S, 340 + pxMid, rackY, 855 + pxMid, rackY, 8, "#6b6d70", { pinStart: true, pinEnd: true });
      for (var ri = 0; ri < 6; ri++) {
        var rx = 385 + ri * 84 + pxMid;
        drawLinkageBar(ctx, S, rx, rackY - 12, rx + 24, rackY + 14, 4.5, "#9ea1a4", { shadow: false });
      }
    } else if (beat.index === 2) {
      // Variation III (Trout): Cozy Cedar Hot-Tub Decking + Rolled Spa Towels!
      var tubPop = S.spring(beat.localT, 0.04, 11, 5.2);
      S.drawTornPaperFlat(ctx, 355 + pxMid, 442 + pyMid, 470, 56 * tubPop + 10, {
        fill: "#8f5b34",
        paperColor: "#fbfaf5",
        deckle: 4.5,
        seed: 88.2
      });
      // Stacked folded pink/cream spa towels on left rim
      S.drawCutoutPaperEdge(ctx, [
        [362 + pxMid, 438 + pyMid], [442 + pxMid, 434 + pyMid],
        [446 + pxMid, 456 + pyMid], [360 + pxMid, 458 + pyMid]
      ], "#e48c8a", "#14110d", { paperRim: 3 });
      S.drawCutoutPaperEdge(ctx, [
        [368 + pxMid, 418 + pyMid], [438 + pxMid, 416 + pyMid],
        [440 + pxMid, 436 + pyMid], [366 + pxMid, 438 + pyMid]
      ], "#f7f1e3", "#14110d", { paperRim: 3 });
    } else if (beat.index === 3) {
      // Variation IV (Alien): Atmospheric Re-Entry Plasma Trail & Ablation Sparks!
      ctx.save();
      for (var si = 0; si < 6; si++) {
        var sx0 = tinCX - 140 - si * 34;
        var sy0 = tinCY - 90 - si * 24 + Math.sin(t * 8 + si) * 9;
        S.drawCutoutPaperEdge(ctx, [
          [sx0, sy0], [sx0 + 135, sy0 + 48], [sx0 + 115, sy0 + 74], [sx0 - 14, sy0 + 18]
        ], si % 2 === 0 ? "#d42a1e" : "#f29f38", "#14110d", { paperRim: 2.2, shadow: false });
      }
      ctx.restore();
    }

    // 4. Hero Scissor-Cut Dented Metal Bread-Roll Baking Tin (p31.jpg: 640×640)
    ctx.save();
    ctx.translate(tinCX, tinCY);
    ctx.rotate(tinRot);

    S.drawScissorCutout(ctx, pImg, 186, 156, 312, 276, -215, -182, 430, 368, [
      [0.34, 0.06], [0.64, 0.03], [0.88, 0.16], [0.97, 0.42],
      [0.92, 0.74], [0.82, 0.94], [0.52, 0.96], [0.16, 0.92],
      [0.04, 0.74], [0.06, 0.46], [0.18, 0.22]
    ], {
      haloWidth: 5.5,
      filter: beat.index === 3 ? "sepia" : "none",
      seed: 3101
    });

    // Warm Lamp Glow inside Baking Tin Mouth (responds directly to state.lamp!)
    if (beat.lampOn) {
      var glowGrad = ctx.createRadialGradient(-34, 34, 10, -28, 38, 148);
      var glowTint = beat.index === 1
        ? "rgba(255, 130, 40, 0.42)"
        : (beat.index === 2 ? "rgba(255, 224, 130, 0.44)" : (beat.index === 3 ? "rgba(212, 42, 30, 0.38)" : "rgba(255, 214, 125, 0.30)"));
      glowGrad.addColorStop(0, glowTint);
      glowGrad.addColorStop(1, "rgba(255, 210, 120, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(-28, 38, 148, 0, TAU);
      ctx.fill();
    } else {
      ctx.fillStyle = "rgba(18, 26, 34, 0.46)";
      ctx.beginPath();
      ctx.ellipse(-34, 42, 118, 86, 0.28, 0, TAU);
      ctx.fill();
    }

    // PAELEO Blind-Mode Guard: Cover painted "375°F" on tin cylinder with a riveted aluminum handle strap!
    if (beat.blind) {
      drawLinkageBar(ctx, S, 5, -74, 138, 2, 24, "#9da6ad", {
        pinStart: true,
        pinEnd: true,
        pinR: 5.2,
        metal: "silver"
      });
    }

    //Scorched ablation shield plates in Beat D
    if (beat.index === 3) {
      S.drawCardboardPuppetPiece(ctx, [
        [68, -118], [168, -32], [182, 92], [116, 152], [96, 48], [48, -68]
      ], {
        tone: "#3c322c",
        ribs: 4,
        pins: [[88, -76], [148, 10], [136, 108]]
      });
      // Fiery plasma bow-shock crescent
      ctx.strokeStyle = "#d42a1e";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(42, 18, 198, -0.82, 0.92);
      ctx.stroke();
      ctx.strokeStyle = "#ffd97d";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(48, 18, 206, -0.72, 0.82);
      ctx.stroke();
    }

    // Tiny pink paper drink-umbrella on rim in Beat C (Minnow Hot-Tub!)
    if (beat.index === 2) {
      ctx.save();
      ctx.translate(-128, -58);
      ctx.rotate(-0.35 + S.wobble(t, 2.6, 0.06, 1.1));
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 42);
      ctx.lineTo(0, -18);
      ctx.stroke();
      S.drawCutoutPaperEdge(ctx, [
        [-44, -6], [-22, -28], [0, -34], [22, -28], [44, -6]
      ], "#e85d75", "#14110d", { paperRim: 3 });
      ctx.restore();
    }

    // Buoyant Scissor-Cut Minnows Bobbing Inside the Tin Mouth (S41 Secondary Dynamics)
    var minnowScale = beat.index === 2 ? 1.14 : 1.0;
    var m1x = -86 + Math.sin(t * 2.8) * 14;
    var m1y = 52 + S.wobble(t, 3.4, 7, 0.4);
    var m2x = 18 + Math.cos(t * 2.5 + 1.2) * 14;
    var m2y = 66 + S.wobble(t, 3.1, 6, 2.0);
    S.drawScissorCutout(ctx, pImg, 232, 340, 96, 62, m1x - 54, m1y - 34, 108 * minnowScale, 68 * minnowScale, null, {
      haloWidth: 3.2,
      shadow: false,
      rot: Math.sin(t * 3.2) * 0.08,
      seed: 3104
    });
    S.drawScissorCutout(ctx, pImg, 330, 348, 92, 58, m2x - 50, m2y - 30, 102 * minnowScale, 64 * minnowScale, null, {
      haloWidth: 3.2,
      shadow: false,
      rot: -Math.sin(t * 2.9) * 0.08,
      seed: 3105
    });

    // Rising Bubbles / Hot-Tub Steam Curls
    for (var bi = 0; bi < 7; bi++) {
      var bu = ((t * 0.42 + bi * 0.17) % 1);
      var bx = -58 + (bi - 3) * 24 + Math.sin(t * 3 + bi) * 8;
      var by = S.lerp(48, -110, bu);
      drawPaperBubble(ctx, bx, by, 4.5 + (bi % 3) * 2.5, beat.index === 2 ? "rgba(255, 248, 225, 0.85)" : "rgba(255, 234, 178, 0.75)");
    }
    if (beat.index === 2) {
      // Torn-paper curly spa steam ribbons
      for (var st = 0; st < 3; st++) {
        var stX = -85 + st * 75 + Math.sin(t * 2.2 + st) * 12;
        ctx.strokeStyle = "#fbfaf5";
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(stX, -20);
        ctx.bezierCurveTo(stX - 24, -75, stX + 26, -125, stX - 8, -175);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 5. Beat B IK Kitchen Tongs + Baster Descending from Upper Left/Right (S33/S41)
    if (beat.index === 1) {
      var aimX = tinCX + 20 + Math.sin(t * 3.6) * 38;
      var aimY = tinCY - 78 + Math.cos(t * 4.4) * 18;
      var ik = S.solveIK2(930, 42, 195, 185, aimX, aimY, -1);
      drawLinkageBar(ctx, S, ik.x0, ik.y0, ik.jx, ik.jy, 13, "#7a7974", { pinStart: true, pinEnd: true });
      drawLinkageBar(ctx, S, ik.jx, ik.jy, ik.ex, ik.ey, 11, "#9a9892", { pinEnd: true });
      // Hinged cardboard oven-mitt pincer holding a turkey baster cutout
      ctx.save();
      ctx.translate(ik.ex, ik.ey);
      ctx.rotate(Math.sin(t * 5.0) * 0.16 - 0.35);
      S.drawCardboardPuppetPiece(ctx, [[-12, -16], [56, -24], [64, -8], [10, 4]], { tone: "#b83b2b", pin: { x: 0, y: 0, r: 4.5, metal: "brass" } });
      S.drawCardboardPuppetPiece(ctx, [[-10, 2], [52, 22], [44, 34], [-14, 14]], { tone: "#9e3123" });
      // Baster bulb & tube
      S.drawCutoutPaperEdge(ctx, [[-95, -6], [-18, -5], [-18, 5], [-95, 2]], "#d8dce0", "#14110d", { paperRim: 2.5 });
      S.drawCutoutPaperEdge(ctx, [[8, -18], [38, -24], [44, 0], [14, 6]], "#d42a1e", "#14110d", { paperRim: 2.5 });
      ctx.restore();
    }

    // 6. Foreground Creek Stone & Reed Cutouts from p31.jpg + Twisted Dock Ribbon (#verne-09)
    S.drawScissorCutout(ctx, pImg, 98, 228, 122, 245, 210 + pxFg, 290, 165, 275, [
      [0.12, 0.04], [0.68, 0.08], [0.95, 0.58], [0.92, 0.96], [0.06, 0.96], [0.04, 0.45]
    ], { haloWidth: 4.5, seed: 3108 });
    S.drawScissorCutout(ctx, pImg, 408, 330, 132, 200, 770 + pxFg, 338, 175, 232, [
      [0.24, 0.05], [0.88, 0.08], [0.96, 0.94], [0.06, 0.96], [0.08, 0.52]
    ], { haloWidth: 4.5, seed: 3109 });

    // Twisted reed ribbon (#verne-09 world anchor)
    ctx.save();
    ctx.translate(352 + pxFg * 0.8, 518);
    ctx.rotate(S.wobble(t, 2.1, 0.08, 0.5));
    S.drawCardboardPuppetPiece(ctx, [[-8, 0], [-14, -76], [4, -82], [10, 0]], {
      tone: "#8fa365",
      ribs: 3,
      pin: { x: 0, y: -6, r: 4, metal: "brass" }
    });
    ctx.restore();

    // 7. Couriers (Turkey + Mail Snail, Brook Trout, Alien Saucer) & Ballast
    drawCourierChoreography(ctx, S, W, H, t, beat, state, {
      floorY: 540,
      troutX: 985,
      troutY: 365,
      saucerX: 650,
      saucerY: 112,
      beamX: tinCX,
      beamY: tinCY + 20
    });
    drawBallastOverlay(ctx, S, W, H, t, state);

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 31);
  }

  // ==========================================================================
  // #32 · BEAK ARM ("cardboard-parallax" · Teuf-Teuf × S01 Gilliam IK)
  // A: Metal tongs pinching an old key
  // B: A giant snapping crab pincer
  // C: A scary mechanical fish dentist
  // D: A robotic UFO abduction claw
  // ==========================================================================
  function render32(ctx, W, H, rawT, state) {
    var S = root.SCION_STAGE;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(32);
    var pImg = plates.portholeImg; // p32.jpg (640×640)
    var aImg = plates.atlasImg;    // atlas-40.webp (740×416, Rifle's Spiral tactile clay/hand)

    var px1 = S.parallaxX(0.18, t, state);
    var px2 = S.parallaxX(0.38, t, state);
    var px3 = S.parallaxX(0.62, t, state);
    var py2 = S.parallaxY(0.38, t, state);
    var py3 = S.parallaxY(0.62, t, state);

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // 1. Mort-en-ce-jardin Silver-Gelatin Monochrome Stage + Academy Side Mattes
    S.drawBolasBackdrop(ctx, W, H, "cardboard-parallax", 32, t, state, { pillarbox: true });

    // 2. Five Monochrome Cutout Parallax Planes from atlas-40.webp & p32.jpg
    // Plane 1 (Far fluted shadow columns)
    S.drawScissorCutout(ctx, aImg, 0, 0, 320, 360, 88 + px1, 22, 430, 440, null, {
      filter: "mono",
      haloWidth: 3.5,
      alpha: 0.76,
      seed: 3201
    });
    // Plane 2 (Far right carved stone profile)
    S.drawScissorCutout(ctx, aImg, 255, 88, 430, 305, 640 + px1 * 1.3, 128 + py2 * 0.5, 520, 365, [
      [0.06, 0.42], [0.48, 0.08], [0.88, 0.05], [0.96, 0.54], [0.92, 0.96], [0.04, 0.96]
    ], {
      filter: "mono",
      haloWidth: 4.0,
      alpha: 0.82,
      seed: 3202
    });
    // Plane 3 (Tactile clay/riverbed ledge across bottom)
    S.drawScissorCutout(ctx, aImg, 0, 250, 740, 166, 82 + px2, 456 + py2, 1116, 186, null, {
      filter: "mono",
      haloWidth: 4.5,
      seed: 3203
    });

    // Lower hull spotlight cone (responds to state.lamp!)
    S.drawLampBeam(ctx, W, H, t, state, {
      x: 560 + px2,
      y: 618,
      aimX: 660 + Math.sin(t * 1.1) * 40,
      spread: 280,
      alpha: 0.22
    });

    // Plane 4: Left Riveted Submarine Beak-Slot Flange Cutout from p32.jpg + Background Trout
    S.drawScissorCutout(ctx, pImg, 96, 162, 92, 278, 92 + px2 * 0.7, 132 + py2, 152, 396, [
      [0.08, 0.04], [0.88, 0.02], [0.96, 0.35], [0.82, 0.96], [0.08, 0.94]
    ], {
      filter: beat.index === 1 ? "sepia" : "none",
      haloWidth: 4.5,
      seed: 3204
    });

    S.drawScissorCutout(ctx, pImg, 430, 254, 114, 88, 945 + px2 * 1.2 + Math.sin(t * 1.7) * 14, 242 + py2, 185, 138, null, {
      filter: "mono",
      haloWidth: 3.8,
      seed: 3205
    });

    // 3. Articulated 3-Diamond Grey-Cardboard Pantograph Scissor Arm + Split-Pin Brads (S33 IK + S32 FK)
    var baseX, baseY, tipX, tipY;
    if (beat.index === 3) {
      // Beat D: Claw descends vertically from the Alien Saucer pod!
      baseX = 650 + Math.sin(t * 2.0) * 7;
      baseY = 136;
      tipX = 650 + Math.sin(t * 2.3) * 52;
      tipY = 348 + Math.sin(t * 3.1) * 26;
    } else {
      baseX = 186 + px2 * 0.7;
      baseY = 286 + py2;
      var extAmt = 0.78 + Math.sin(t * 2.2) * 0.14 + (beat.index === 1 ? S.springImpulse(beat.localT, 0.35, 15, 3.2) * 0.18 : 0);
      tipX = S.lerp(420, 742, extAmt) + px3 * 0.4;
      tipY = (beat.index === 2 ? 328 : 244) + Math.sin(t * 2.7) * 22 + py3 * 0.5;
    }

    // Solve two-bone IK for primary reach envelope & build 3 scissor diamonds along axis
    var ikArm = S.solveIK2(baseX, baseY, 260, 260, tipX, tipY, -1);
    var axisDX = ikArm.ex - baseX;
    var axisDY = ikArm.ey - baseY;
    var axisLen = Math.sqrt(axisDX * axisDX + axisDY * axisDY) || 1;
    var ux = axisDX / axisLen;
    var uy = axisDY / axisLen;
    var nx = -uy;
    var ny = ux;

    var segs = 3;
    var segLen = axisLen / segs;
    var spread = S.clamp(Math.sqrt(Math.max(225, 118 * 118 - (segLen * 0.5) * (segLen * 0.5))), 26, 92);
    var armToneA = beat.index === 1 ? "#a84a38" : (beat.index === 3 ? "#75888e" : "#9c9991");
    var armToneB = beat.index === 1 ? "#7d3326" : (beat.index === 3 ? "#4f5f66" : "#6e6c67");

    for (var s = 0; s < segs; s++) {
      var sx0 = baseX + ux * (s * segLen);
      var sy0 = baseY + uy * (s * segLen);
      var mx = baseX + ux * ((s + 0.5) * segLen);
      var my = baseY + uy * ((s + 0.5) * segLen);
      var sx1 = baseX + ux * ((s + 1) * segLen);
      var sy1 = baseY + uy * ((s + 1) * segLen);

      var topJx = mx + nx * spread;
      var topJy = my + ny * spread;
      var botJx = mx - nx * spread;
      var botJy = my - ny * spread;

      // Under-bars
      drawLinkageBar(ctx, S, sx0, sy0, botJx, botJy, 10.5, armToneB);
      drawLinkageBar(ctx, S, topJx, topJy, sx1, sy1, 10.5, armToneB);
      // Over-bars + glinting brass & silver split-pins at every X-joint!
      drawLinkageBar(ctx, S, sx0, sy0, topJx, topJy, 10.5, armToneA, { pinStart: true, pinEnd: true, metal: "brass" });
      drawLinkageBar(ctx, S, botJx, botJy, sx1, sy1, 10.5, armToneA, { pinStart: true, pinEnd: true, metal: "silver" });
      S.drawSplitPin(ctx, mx, my, 4.6, { metal: "brass" });
    }

    // 4. End-Effector Head & Props per Variation (A: Tongs+Key, B: Crab Pincer, C: Dentist, D: UFO Claw)
    var headAng = Math.atan2(uy, ux);
    var pinchSnap = Math.abs(Math.sin(t * (beat.index === 1 ? 6.8 : 3.2))) * (beat.index === 1 ? 0.42 : 0.22);

    // Draw cutout Skeleton Key from p32.jpg (held in jaws in A & B, levitating in D!)
    if (beat.index !== 2) {
      var keyX = ikArm.ex + ux * 74;
      var keyY = ikArm.ey + uy * 74 + (beat.index === 3 ? 42 + Math.sin(t * 4) * 10 : 12);
      var keyRot = (beat.index === 3 ? Math.sin(t * 2.5) * 0.25 : 0.08 + Math.sin(t * 3.1) * 0.09);
      S.drawScissorCutout(ctx, pImg, 355, 126, 148, 188, keyX - 88, keyY - 112, 176, 224, [
        [0.06, 0.04], [0.58, 0.02], [0.66, 0.28], [0.96, 0.82],
        [0.82, 0.98], [0.56, 0.88], [0.22, 0.36], [0.04, 0.22]
      ], {
        haloWidth: 5.0,
        rot: keyRot,
        filter: beat.index === 0 ? "sepia" : "none",
        seed: 3209
      });
    }

    // Articulated Pincer / Crab / Dentist / UFO Claw Head
    ctx.save();
    ctx.translate(ikArm.ex, ikArm.ey);
    ctx.rotate(headAng);

    if (beat.index === 1) {
      // Variation II: Giant Snapping Spiny Crab Carapace + Jagged Crusher Claw!
      S.drawCardboardPuppetPiece(ctx, [
        [-64, -48], [-18, -72], [32, -52], [40, 0], [22, 46], [-42, 44]
      ], { tone: "#b84432", ribs: 3 });
      // Bobbing crab eyestalks
      for (var ce = -1; ce <= 1; ce += 2) {
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(18, ce * 18);
        ctx.lineTo(44, ce * 36 + Math.sin(t * 6 + ce) * 4);
        ctx.stroke();
        drawPaperBubble(ctx, 46, ce * 36 + Math.sin(t * 6 + ce) * 4, 6.5, "#fbfaf5");
      }
      ctx.save();
      ctx.rotate(-0.28 - pinchSnap);
      S.drawCardboardPuppetPiece(ctx, [[0, -14], [74, -46], [126, -16], [96, 4], [54, -8], [14, 4]], { tone: "#cf4e38", ribs: 2 });
      ctx.restore();
      ctx.save();
      ctx.rotate(0.28 + pinchSnap);
      S.drawCardboardPuppetPiece(ctx, [[0, 12], [68, 44], [118, 18], [90, -2], [50, 8], [12, -4]], { tone: "#a63828", ribs: 2 });
      ctx.restore();
      S.drawReinigerFiligreeHinge(ctx, 0, 0, 11, { metal: "brass" });
    } else if (beat.index === 2) {
      // Variation III: Scary Mechanical Fish Dentist (Headlamp Mirror + Angled Dental Mirror & Drill!)
      S.drawCutoutPaperEdge(ctx, [[-26, -42], [24, -42], [28, -14], [-24, -14]], "#fbfaf5", "#14110d", { paperRim: 2 });
      drawPaperBubble(ctx, 18, -32, 13, "rgba(220, 245, 255, 0.92)");
      ctx.save();
      ctx.rotate(-0.18 - pinchSnap * 0.4);
      drawLinkageBar(ctx, S, 0, -6, 98, -22, 6, "#c6cacd", { pinStart: true });
      drawPaperBubble(ctx, 112, -25, 16, "rgba(215, 244, 248, 0.9)");
      ctx.restore();
      ctx.save();
      ctx.rotate(0.22 + Math.sin(t * 18) * 0.04);
      drawLinkageBar(ctx, S, 0, 8, 92, 24, 6, "#aeb3b8", { pinStart: true });
      S.drawCutoutPaperEdge(ctx, [[90, 18], [122, 24], [90, 30]], "#e8ecef", "#14110d", { paperRim: 1.5 });
      ctx.restore();
      S.drawReinigerFiligreeHinge(ctx, 0, 0, 10, { metal: "silver" });
    } else {
      // Variation I & IV: Serrated Brass/Cardboard Beak Tongs (3-prong UFO claw in IV!)
      ctx.save();
      ctx.rotate(-0.22 - pinchSnap);
      S.drawCardboardPuppetPiece(ctx, [
        [-6, -12], [58, -34], [108, -12], [92, 2], [68, -6], [48, 2], [28, -6], [4, 4]
      ], { tone: beat.index === 3 ? "#8aa4ad" : "#b89650", ribs: 2 });
      ctx.restore();
      ctx.save();
      ctx.rotate(0.22 + pinchSnap);
      S.drawCardboardPuppetPiece(ctx, [
        [-6, 12], [54, 34], [102, 14], [86, -2], [64, 6], [44, -2], [24, 6], [4, -4]
      ], { tone: beat.index === 3 ? "#6d8790" : "#9c7b38", ribs: 2 });
      ctx.restore();
      S.drawReinigerFiligreeHinge(ctx, 0, 0, 11, { metal: "brass" });
    }
    ctx.restore();

    // 5. Foreground Gasping Trout Witness from p32.jpg (+ Reclining Dental Chair & Paper Bib in Beat C!)
    var fgTroutX = (beat.index === 2 ? 835 : 645) + px3 * 0.6;
    var fgTroutY = (beat.index === 3 ? 425 - Math.sin(t * 3) * 18 : 445) + py3 * 0.5;

    if (beat.index === 2) {
      // Split-pin cardboard dental recliner chair + white paper bib!
      drawLinkageBar(ctx, S, fgTroutX - 95, fgTroutY + 95, fgTroutX + 125, fgTroutY + 15, 14, "#5c6468", { pinStart: true, pinEnd: true });
      drawLinkageBar(ctx, S, fgTroutX + 15, fgTroutY + 55, fgTroutX + 15, fgTroutY + 128, 12, "#454b4e", { pinStart: true });
    }

    var shudder = beat.index === 2 ? Math.sin(t * 22) * 2.5 : 0;
    S.drawScissorCutout(ctx, pImg, 296, 320, 180, 198, fgTroutX - 115 + shudder, fgTroutY - 115, 242, 252, [
      [0.04, 0.12], [0.46, 0.04], [0.88, 0.16], [0.96, 0.62],
      [0.86, 0.96], [0.52, 0.94], [0.24, 0.62], [0.04, 0.34]
    ], {
      haloWidth: 5.0,
      rot: beat.index === 2 ? 0.22 : (beat.index === 3 ? -0.14 : 0),
      seed: 3212
    });

    if (beat.index === 2) {
      // Crisp white cut-paper dental bib with silver split-pin chain
      S.drawCutoutPaperEdge(ctx, [
        [fgTroutX - 58, fgTroutY - 8], [fgTroutX - 8, fgTroutY + 6],
        [fgTroutX - 18, fgTroutY + 58], [fgTroutX - 72, fgTroutY + 42]
      ], "#fbfaf5", "#14110d", { paperRim: 2 });
      S.drawSplitPin(ctx, fgTroutX - 12, fgTroutY + 4, 3.8, { metal: "silver" });
    }

    // 6. Couriers & Ballast
    drawCourierChoreography(ctx, S, W, H, t, beat, state, {
      floorY: 542,
      customTrout: false,
      troutX: 1035,
      troutY: 365,
      saucerX: 650,
      saucerY: 96,
      beamX: 650,
      beamY: 425,
      snailClimbX: 1128
    });
    drawBallastOverlay(ctx, S, W, H, t, state);

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 32);
  }

  // ==========================================================================
  // #33 · SALON ("daumier-litho" · Monsieur Ripois × S03 Ernst/Zeman)
  // A: Dark drainpipe bars in the shadows
  // B: A fancy red theater stage curtain
  // C: An old-timey creek movie projector
  // D: Hungry beasts from Shadow Space
  // ==========================================================================
  function render33(ctx, W, H, rawT, state) {
    var S = root.SCION_STAGE;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(33);
    var pImg = plates.portholeImg; // p33.jpg (640×640)
    var aImg = plates.atlasImg;    // atlas-13.webp (740×416, Karel Zeman Invention for Destruction)

    var pxFar = S.parallaxX(0.22, t, state);
    var pxMid = S.parallaxX(0.52, t, state);
    var pxFg = S.parallaxX(0.84, t, state);

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // 1. Boucle-là Stark Cream Paper + Wide Ink-Black Cinema Band (y = 104..572)
    S.drawBolasBackdrop(ctx, W, H, "daumier-litho", 33, t, state, {
      bandTop: 104,
      bandBot: 572
    });

    // Optional Oubapo/Daumier speech cartouche in top paper margin ONLY when captioned (0 text in blind!)
    if (!beat.blind) {
      ctx.save();
      S.drawCutoutPaperEdge(ctx, [
        [72, 22], [540, 22], [548, 84], [320, 84], [295, 108], [282, 84], [72, 84]
      ], "#fbfaf7", "#0b0c0e", { paperRim: 0, shadow: false, lineWidth: 2.4 });
      ctx.fillStyle = "#0b0c0e";
      ctx.font = '800 22px "Big Shoulders Display", sans-serif';
      var salonLine = [
        "« VARIATION I · LES BARREAUX DE L’ÉGOUT »",
        "« VARIATION II · LE RIDEAU CRAMOISI DU SALON »",
        "« VARIATION III · LE CINÉMATOGRAPHE DU RUISSEAU »",
        "« VARIATION IV · LES BÊTES DE L’OMBRE »"
      ][beat.index];
      S.safeText(ctx, salonLine, 92, 61, state);
      ctx.restore();
    }

    // 2. Deep Tunnel Glow & Karel Zeman Etched Cave + Submarine Cutouts (atlas-13.webp)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 104, W, 468);
    ctx.clip();

    if (beat.lampOn) {
      var cg = ctx.createRadialGradient(640 + pxFar, 336, 20, 640 + pxFar, 336, 360);
      if (beat.index === 1) {
        cg.addColorStop(0, "rgba(255, 220, 165, 0.55)");
        cg.addColorStop(0.6, "rgba(184, 42, 34, 0.25)");
      } else if (beat.index === 3) {
        cg.addColorStop(0, "rgba(212, 42, 30, 0.38)");
        cg.addColorStop(0.6, "rgba(15, 143, 128, 0.20)");
      } else {
        cg.addColorStop(0, "rgba(95, 232, 214, 0.46)");
        cg.addColorStop(0.65, "rgba(22, 92, 88, 0.18)");
      }
      cg.addColorStop(1, "rgba(11, 12, 14, 0)");
      ctx.fillStyle = cg;
      ctx.fillRect(140, 104, 1000, 468);
    }

    // Karel Zeman etched cigar hull gliding slowly in deep cave recess
    S.drawScissorCutout(ctx, aImg, 112, 108, 372, 192, 420 + pxFar * 1.4 + Math.sin(t * 0.8) * 26, 215, 420, 212, [
      [0.04, 0.44], [0.36, 0.08], [0.84, 0.12], [0.96, 0.52], [0.82, 0.92], [0.32, 0.92]
    ], {
      filter: "litho",
      haloWidth: 4.5,
      alpha: 0.86,
      seed: 3301
    });

    // Karel Zeman etched stalactite arch spanning upper ink band
    S.drawScissorCutout(ctx, aImg, 68, 0, 595, 148, 225 + pxFar * 0.7, 98, 830, 142, [
      [0.02, 0.02], [0.98, 0.02], [0.95, 0.88], [0.76, 0.58],
      [0.52, 0.92], [0.26, 0.56], [0.05, 0.88]
    ], {
      filter: "litho",
      haloWidth: 4.5,
      seed: 3302
    });

    // Water shimmer lines on cave floor
    S.drawWaterCaustics(ctx, W, 560, t, 0.16, { color: "rgba(240, 245, 242, 0.22)" });

    // 3. S45 Occlusion Layer A (BEHIND the 5 vertical bars): Swimming Trout from p33.jpg OR Shadow Beasts!
    if (beat.index === 3) {
      // Hungry Lithograph Beasts from Shadow Space peering with glowing crimson eyes!
      var beastPos = [[430, 340, 1], [645, 305, 1.18], [855, 345, -1]];
      for (var bi = 0; bi < beastPos.length; bi++) {
        var bx = beastPos[bi][0] + Math.sin(t * 3.1 + bi * 2) * 14;
        var by = beastPos[bi][1] + Math.cos(t * 2.7 + bi) * 10;
        var bsc = beastPos[bi][2];
        ctx.save();
        ctx.translate(bx, by);
        ctx.scale(bsc, 1);
        S.drawCutoutPaperEdge(ctx, [
          [-68, 48], [-74, -22], [-42, -58], [-18, -32], [18, -34], [46, -62], [72, -18], [64, 48]
        ], "#16181c", "#fbfaf7", { paperRim: 4.0 });
        S.drawEngravingCrosshatch(ctx, 130, 96, 0.26, 6, { x: -65, y: -48, color: "#fbfaf7" });
        // Glowing red eyes
        for (var ei = -1; ei <= 1; ei += 2) {
          ctx.fillStyle = "#d42a1e";
          ctx.beginPath();
          ctx.ellipse(ei * 22, -8, 11, 7, ei * 0.2, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#fff6dc";
          ctx.beginPath();
          ctx.arc(ei * 22, -8, 3.2, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }
    } else {
      // Scissor-cut swimming trout from p33.jpg gliding behind the iron drainpipe bars!
      var swimX = 625 + Math.sin(t * 1.45) * 145 + pxMid;
      var swimY = 338 + Math.sin(t * 2.9) * 12;
      S.drawScissorCutout(ctx, pImg, 246, 276, 188, 86, swimX - 135, swimY - 62, 270, 124, [
        [0.03, 0.48], [0.28, 0.14], [0.58, 0.06], [0.84, 0.28],
        [0.98, 0.12], [0.95, 0.88], [0.82, 0.72], [0.46, 0.94], [0.14, 0.78]
      ], {
        filter: beat.index === 2 ? "litho" : "none",
        haloWidth: 4.5,
        seed: 3305
      });
    }

    // 4. S45 Occlusion Layer B (IN FRONT): The 5 Vertical Bars / Curtain Rods / Monster Jaws!
    var barXs = [415, 528, 640, 752, 865];
    for (var k = 0; k < barXs.length; k++) {
      var slideOut = 0;
      if (beat.index === 1) {
        // Outer bars part like curtain draw-rods in Beat B!
        slideOut = (k - 2) * 58 * S.easeInOutCubic(S.clamp(beat.localT / 0.9, 0, 1));
      }
      var bxk = barXs[k] + slideOut + pxMid * 0.6;
      if (beat.index === 3) {
        // Beat D: Bars hinge into jagged snapping lithograph monster teeth!
        var chomp = Math.abs(Math.sin(t * 5.6 + k * 0.4)) * 68;
        S.drawCutoutPaperEdge(ctx, [
          [bxk - 18, 108], [bxk + 18, 108], [bxk + 4, 285 - chomp * 0.4], [bxk - 12, 245 - chomp * 0.4]
        ], "#26292e", "#0b0c0e", { paperRim: 3.8 });
        S.drawCutoutPaperEdge(ctx, [
          [bxk - 18, 568], [bxk + 18, 568], [bxk + 10, 395 + chomp * 0.4], [bxk - 6, 435 + chomp * 0.4]
        ], "#26292e", "#0b0c0e", { paperRim: 3.8 });
        S.drawSplitPin(ctx, bxk, 122, 4.8, { metal: "silver" });
        S.drawSplitPin(ctx, bxk, 554, 4.8, { metal: "silver" });
      } else {
        drawLinkageBar(ctx, S, bxk, 118, bxk, 560, 11, "#35393d", {
          pinStart: true,
          pinEnd: true,
          metal: "silver"
        });
        // Crisp white scissor paper rim highlight on Daumier litho bar
        ctx.strokeStyle = "#fbfaf7";
        ctx.lineWidth = 2.2;
        ctx.strokeRect(bxk - 13, 122, 26, 434);
      }
    }

    // 5. Left & Right Draped Curtain & Stone Arch Cutouts from p33.jpg (+ Crimson Velvet Pelmet in Beat B!)
    var curtainSway = Math.sin(t * 2.1) * 14;
    S.drawScissorCutout(ctx, pImg, 138, 152, 104, 298, 152 + pxFg * 0.7, 114, 196 + (beat.index === 1 ? 38 : 0), 446, [
      [0.04, 0.02], [0.94, 0.04], [0.76, 0.56], [0.88, 0.96], [0.06, 0.98]
    ], {
      filter: "litho",
      tint: beat.index === 1 ? "rgba(196, 36, 28, 0.62)" : null,
      haloWidth: 5.0,
      rot: curtainSway * 0.002,
      seed: 3308
    });
    S.drawScissorCutout(ctx, pImg, 398, 152, 104, 298, 932 - (beat.index === 1 ? 38 : 0) + pxFg * 0.7, 114, 196 + (beat.index === 1 ? 38 : 0), 446, [
      [0.06, 0.04], [0.96, 0.02], [0.94, 0.98], [0.12, 0.96], [0.24, 0.56]
    ], {
      filter: "litho",
      tint: beat.index === 1 ? "rgba(196, 36, 28, 0.62)" : null,
      haloWidth: 5.0,
      rot: -curtainSway * 0.002,
      seed: 3309
    });

    if (beat.index === 1) {
      // Fancy scalloped crimson theater valance + brass footlight shells!
      for (var sc = 0; sc < 7; sc++) {
        var vx = 235 + sc * 132;
        S.drawCutoutPaperEdge(ctx, [
          [vx - 68, 104], [vx + 68, 104], [vx + 52, 174], [vx, 192], [vx - 52, 174]
        ], "#b82921", "#0b0c0e", { paperRim: 3.5 });
      }
      for (var fl = 0; fl < 6; fl++) {
        var fx = 340 + fl * 120;
        S.drawCutoutPaperEdge(ctx, [[fx - 20, 568], [fx, 542], [fx + 20, 568]], "#d4a44c", "#0b0c0e", { paperRim: 2.5 });
      }
    }

    // Beat C: Hinged Daumier-Litho Silent Movie Projector + Flickering Light Cone & Screen!
    if (beat.index === 2) {
      var projX = 248 + pxFg * 0.4;
      var projY = 368;
      // Flickering silver projector beam across the bars
      var flick = 0.22 + (Math.sin(t * 28) > 0 ? 0.09 : 0.02);
      ctx.fillStyle = "rgba(251, 250, 245, " + flick.toFixed(3) + ")";
      ctx.beginPath();
      ctx.moveTo(projX + 62, projY - 12);
      ctx.lineTo(955, 175);
      ctx.lineTo(955, 515);
      ctx.lineTo(projX + 62, projY + 14);
      ctx.closePath();
      ctx.fill();

      // Hanging torn-paper projection screen on right
      S.drawTornPaperFlat(ctx, 855, 182, 185, 315, {
        fill: "#efece2",
        paperColor: "#ffffff",
        deckle: 5.5,
        seed: 33.9
      });
      S.drawEngravingCrosshatch(ctx, 165, 295, 0.14, 7, { x: 865, y: 192 });

      // Tripod + Projector Box + Dual Spinning Reels + FK Hand Crank
      drawLinkageBar(ctx, S, projX, projY + 26, projX - 48, 562, 7, "#4d4c48", { pinStart: true });
      drawLinkageBar(ctx, S, projX, projY + 26, projX + 46, 562, 7, "#4d4c48", { pinStart: true });
      S.drawCutoutPaperEdge(ctx, [
        [projX - 42, projY - 34], [projX + 44, projY - 34],
        [projX + 44, projY + 32], [projX - 42, projY + 32]
      ], "#2d2f33", "#0b0c0e", { paperRim: 4.0 });
      S.drawCutoutPaperEdge(ctx, [
        [projX + 44, projY - 16], [projX + 74, projY - 24],
        [projX + 74, projY + 20], [projX + 44, projY + 12]
      ], "#9a9d9f", "#0b0c0e", { paperRim: 3.0 });

      var reels = [[-28, -64, 32], [28, -56, 28]];
      for (var rl = 0; rl < 2; rl++) {
        ctx.save();
        ctx.translate(projX + reels[rl][0], projY + reels[rl][1]);
        ctx.rotate(t * 4.6 * (rl === 0 ? 1 : -1));
        drawPaperBubble(ctx, 0, 0, reels[rl][2], "#dad7ce");
        for (var sp = 0; sp < 4; sp++) {
          var sa = (sp / 4) * TAU;
          ctx.strokeStyle = "#0b0c0e";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(sa) * (reels[rl][2] - 4), Math.sin(sa) * (reels[rl][2] - 4));
          ctx.stroke();
        }
        S.drawSplitPin(ctx, 0, 0, 4.5, { metal: "brass" });
        ctx.restore();
      }
    }

    ctx.restore(); // end ink-band clip

    // 6. Couriers & Ballast
    drawCourierChoreography(ctx, S, W, H, t, beat, state, {
      floorY: 545,
      troutX: 948,
      troutY: 342,
      saucerX: 640,
      saucerY: 84,
      beamX: 640,
      beamY: 390,
      snailClimbX: 1148
    });
    drawBallastOverlay(ctx, S, W, H, t, state);

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 33);
  }

  // ==========================================================================
  // #34 · ORGAN ("perec-stage" · Ouarchpo × S26 Méliès Cutaway Stage)
  // A: An old boiler with brass pipes
  // B: A friendly steamboat rescue crew
  // C: A loud circus music riverboat
  // D: A giant planet-breathing space lung
  // ==========================================================================
  function render34(ctx, W, H, rawT, state) {
    var S = root.SCION_STAGE;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(34);
    var pImg = plates.portholeImg; // p34.jpg (640×640)
    var aImg = plates.atlasImg;    // atlas-10.webp (740×568, Méliès Impossible Voyage hull section)

    var pxFar = S.parallaxX(0.24, t, state);
    var pyFar = S.parallaxY(0.24, t, state);
    var pxMid = S.parallaxX(0.54, t, state);
    var pyMid = S.parallaxY(0.54, t, state);

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // 1. Carved Perec Ochre Sandstone Proscenium + Hinged Wooden Shutters (les-lieux-dune-fugue.webp!)
    S.drawBolasBackdrop(ctx, W, H, "perec-stage", 34, t, state, {
      openX: 165,
      openY: 74,
      openW: 950,
      openH: 536,
      doors: true
    });

    // Subtle Perec doorway number-plaque (pure brass emblem in blind mode, "34" when captioned!)
    ctx.save();
    S.drawCutoutPaperEdge(ctx, [[1040, 128], [1092, 128], [1092, 166], [1040, 166]], "#1c1815", "#0b0908", { paperRim: 0 });
    if (!beat.blind) {
      ctx.fillStyle = "#e8d5a7";
      ctx.font = '600 22px "Literata", Georgia, serif';
      ctx.textAlign = "center";
      S.safeText(ctx, "34", 1066, 154, state);
    } else {
      S.drawSplitPin(ctx, 1066, 147, 5.5, { metal: "brass" });
    }
    ctx.restore();

    // 2. Recessed Theatrical Stage Content Clipped Inside Carved Perec Proscenium
    ctx.save();
    ctx.beginPath();
    ctx.rect(165, 74, 950, 536);
    ctx.clip();

    // Méliès Painted Parlor Compartment & Sea Cutouts (atlas-10.webp, avoiding tiny copyright plaque)
    S.drawScissorCutout(ctx, aImg, 232, 136, 392, 286, 345 + pxFar, 96 + pyFar, 595, 365, null, {
      filter: beat.index === 3 ? "cyan" : "sepia",
      haloWidth: 4.5,
      alpha: 0.85,
      seed: 3401
    });
    S.drawScissorCutout(ctx, aImg, 10, 440, 720, 122, 160 + pxFar * 1.3, 476 + pyFar, 960, 138, null, {
      haloWidth: 4.0,
      seed: 3402
    });

    S.drawLampBeam(ctx, W, H, t, state, {
      x: 640,
      y: 605,
      aimX: 640 + Math.sin(t * 0.9) * 35,
      spread: 320,
      alpha: 0.20
    });

    // Variation B: Steamboat Pilothouse Wheel & Waving Rescue Crew Sailors!
    if (beat.index === 1) {
      var wheelX = 640 + pxMid * 0.6;
      var wheelY = 212;
      ctx.save();
      ctx.translate(wheelX, wheelY);
      ctx.rotate(Math.sin(t * 1.8) * 0.45);
      drawPaperBubble(ctx, 0, 0, 68, "rgba(247, 232, 200, 0.35)");
      for (var spk = 0; spk < 8; spk++) {
        var wa = (spk / 8) * TAU;
        drawLinkageBar(ctx, S, 0, 0, Math.cos(wa) * 82, Math.sin(wa) * 82, 4.5, "#8c5828", { shadow: false });
      }
      S.drawSplitPin(ctx, 0, 0, 6.5, { metal: "brass" });
      ctx.restore();

      // Two jointed cardboard steamboat rescue crew waving semaphore flags + lifebuoy!
      var crewXs = [368, 912];
      for (var ci = 0; ci < 2; ci++) {
        var cx = crewXs[ci] + pxMid * 0.7;
        var cy = 352;
        var waveA = -0.8 + Math.sin(t * 5.2 + ci * 2.1) * 0.48;
        S.drawCardboardPuppetPiece(ctx, [[cx - 24, cy + 62], [cx - 20, cy - 8], [cx + 20, cy - 8], [cx + 24, cy + 62]], { tone: "#dce2e6", ribs: 2 });
        drawPaperBubble(ctx, cx, cy - 24, 15, "#e6c9a8");
        S.drawCutoutPaperEdge(ctx, [[cx - 20, cy - 34], [cx + 20, cy - 34], [cx + 16, cy - 48], [cx - 16, cy - 48]], "#fbfaf5", "#14110d", { paperRim: 2 });
        drawLinkageBar(ctx, S, cx + (ci === 0 ? 16 : -16), cy + 2, cx + Math.cos(waveA) * 58 * (ci === 0 ? 1 : -1), cy + Math.sin(waveA) * 58, 6, "#dce2e6", { pinStart: true });
        // Red/gold semaphore rescue flag
        var fx = cx + Math.cos(waveA) * 58 * (ci === 0 ? 1 : -1);
        var fy = cy + Math.sin(waveA) * 58;
        S.drawCutoutPaperEdge(ctx, [[fx, fy], [fx + 32 * (ci === 0 ? 1 : -1), fy - 18], [fx + 28 * (ci === 0 ? 1 : -1), fy + 16]], "#d42a1e", "#14110d", { paperRim: 2 });
      }
    }

    // Variation C: Circus Calliope Striped Canopy Pennants + Spinning Red Stern Paddlewheel!
    if (beat.index === 2) {
      for (var pi = 0; pi < 9; pi++) {
        var ppx = 215 + pi * 106;
        S.drawCutoutPaperEdge(ctx, [
          [ppx - 52, 74], [ppx + 52, 74], [ppx, 138]
        ], pi % 2 === 0 ? "#d42a1e" : "#fae194", "#14110d", { paperRim: 2.5 });
      }
      // Churning red stern paddlewheel on left
      ctx.save();
      ctx.translate(295 + pxMid * 0.5, 415);
      ctx.rotate(t * 2.8);
      for (var pw = 0; pw < 8; pw++) {
        var pa = (pw / 8) * TAU;
        drawLinkageBar(ctx, S, 0, 0, Math.cos(pa) * 78, Math.sin(pa) * 78, 7, "#b82921", { shadow: false });
      }
      S.drawReinigerFiligreeHinge(ctx, 0, 0, 12, { metal: "brass" });
      ctx.restore();
    }

    // Variation D: Giant Planet-Breathing Bio-Mechanical Lung Lobes!
    var breath = Math.sin(t * 3.2);
    if (beat.index === 3) {
      for (var side = -1; side <= 1; side += 2) {
        ctx.save();
        ctx.translate(640 + side * (162 + breath * 18) + pxMid * 0.5, 342);
        ctx.scale(side * (1 + breath * 0.08), 1 + breath * 0.06);
        S.drawCardboardPuppetPiece(ctx, [
          [-48, -118], [46, -134], [108, -56], [116, 68], [52, 128], [-38, 102], [-56, 12]
        ], {
          tone: "#4d8e84",
          ribs: 5,
          pins: [[-22, -72], [44, -42], [52, 48]]
        });
        ctx.restore();
      }
    }

    // 3. Central Hero Organ Rig: p34.jpg Boiler Cutout + S47 Sound-to-Action Pipes + Accordion Bellows!
    var orgX = 640 + pxMid;
    var orgY = 398 + pyMid;

    // 8 Articulated Copper Organ-Pipe Pistons (bounce harmonically via S47 Sound-to-Action!)
    var pipeHeights = [108, 146, 198, 224, 182, 152, 118, 92];
    for (var op = 0; op < 8; op++) {
      var ox = orgX - 96 + op * 30;
      var bounce = Math.sin(t * 5.4 + op * 0.75) * 12;
      var ph = pipeHeights[op] + bounce;
      S.drawCardboardPuppetPiece(ctx, [
        [ox - 12, orgY - 36], [ox - 12, orgY - 36 - ph],
        [ox + 12, orgY - 36 - ph], [ox + 12, orgY - 36]
      ], { tone: op % 2 === 0 ? "#c47d46" : "#a86432", ribs: 2 });
      // Pipe whistle lip notch
      S.drawCutoutPaperEdge(ctx, [
        [ox - 8, orgY - 68], [ox + 8, orgY - 68], [ox, orgY - 84]
      ], "#241911", "#14110d", { paperRim: 0, shadow: false });

      // Rising Bubbles (A/B), Cut-Paper Music Notes (C), or Mini Ringed Planets (D)!
      var emitU = ((t * 0.55 + op * 0.13) % 1);
      var emitX = ox + Math.sin(t * 3.2 + op) * 14;
      var emitY = S.lerp(orgY - 46 - ph, 88, emitU);
      if (beat.index === 2) {
        drawCutPaperMusicNote(ctx, S, emitX, emitY, 0.92, Math.sin(t * 4 + op) * 0.25, op % 2 === 0 ? "#d42a1e" : "#0f8f80");
      } else if (beat.index === 3 && op % 2 === 0) {
        drawPaperBubble(ctx, emitX, emitY, 10, "#d4a44c");
        ctx.strokeStyle = "#fbfaf5";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(emitX, emitY, 18, 5, -0.28, 0, TAU);
        ctx.stroke();
      } else {
        drawPaperBubble(ctx, emitX, emitY, 6 + (op % 3) * 3, "rgba(195, 240, 234, 0.78)");
      }
    }

    // Scissor-Cut Brass Clockwork Boiler Pot from p34.jpg on Left of Bellows
    S.drawScissorCutout(ctx, pImg, 198, 266, 102, 196, orgX - 242, orgY - 126, 156, 258, [
      [0.24, 0.03], [0.74, 0.03], [0.94, 0.28], [0.96, 0.96], [0.06, 0.96], [0.08, 0.32]
    ], { haloWidth: 4.5, seed: 3405 });

    // Pumping Pleated Accordion Bellows + Meshing Clockwork Gears (S32 FK)
    var squeeze = Math.sin(t * 3.8) * 22;
    for (var pl = -3; pl <= 3; pl++) {
      var topPX = orgX + pl * (24 + squeeze * 0.22);
      var botPX = orgX + pl * 17;
      S.drawCardboardPuppetPiece(ctx, [
        [topPX - 13, orgY - 58], [topPX + 13, orgY - 58],
        [botPX + 10, orgY + 56], [botPX - 10, orgY + 56]
      ], { tone: pl % 2 === 0 ? "#b88d4a" : "#785728", ribs: 1, shadow: false });
    }
    drawLinkageBar(ctx, S, orgX - 105 - squeeze * 0.6, orgY - 62, orgX - 72, orgY + 62, 11, "#d4a44c", { pinStart: true, pinEnd: true });
    drawLinkageBar(ctx, S, orgX + 105 + squeeze * 0.6, orgY - 62, orgX + 72, orgY + 62, 11, "#d4a44c", { pinStart: true, pinEnd: true });

    // Counter-rotating brass gears at base
    var gears = [[orgX - 18, orgY + 76, 30, 1], [orgX + 38, orgY + 80, 22, -1.35]];
    for (var gi = 0; gi < gears.length; gi++) {
      ctx.save();
      ctx.translate(gears[gi][0], gears[gi][1]);
      ctx.rotate(t * 2.2 * gears[gi][3]);
      var gr = gears[gi][2];
      var gPts = [];
      for (var gt = 0; gt < 16; gt++) {
        var ga = (gt / 16) * TAU;
        var rr = (gt % 2 === 0) ? gr + 5 : gr - 3;
        gPts.push([Math.cos(ga) * rr, Math.sin(ga) * rr]);
      }
      S.drawCutoutPaperEdge(ctx, gPts, "#c9963e", "#14110d", { paperRim: 2.2 });
      S.drawSplitPin(ctx, 0, 0, 5.0, { metal: "brass" });
      ctx.restore();
    }

    // Listening Creek Trout Cutout from p34.jpg on Upper Left
    S.drawScissorCutout(ctx, pImg, 122, 196, 140, 76, 215 + pxMid * 0.8 + Math.sin(t * 1.9) * 14, 178 + Math.cos(t * 2.4) * 8, 210, 112, null, {
      haloWidth: 4.0,
      seed: 3408
    });

    ctx.restore(); // end Perec doorway clip

    // 4. Couriers & Ballast
    drawCourierChoreography(ctx, S, W, H, t, beat, state, {
      floorY: 548,
      turkeyX: 118,
      turkeyY: 504,
      troutX: 965,
      troutY: 332,
      saucerX: 640,
      saucerY: 114,
      beamX: 640,
      beamY: 395,
      snailClimbX: 1138
    });
    drawBallastOverlay(ctx, S, W, H, t, state);

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 34);
  }

  // ==========================================================================
  // #35 · POST #44 ("cardboard-parallax" · Machine à tuer le temps × S50 LOC)
  // A: An old canvas sack of letters
  // B: A bag of dirty crew laundry
  // C: A sneaky porch-pirate mail thief
  // D: A secret Sector 44 spy drop
  // ==========================================================================
  function render35(ctx, W, H, rawT, state) {
    var S = root.SCION_STAGE;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(35);
    var pImg = plates.portholeImg; // p35.jpg (640×640)
    var aImg = plates.atlasImg;    // atlas-04.webp (1200×440 — crop ONLY text-free center diagram!)

    var px1 = S.parallaxX(0.18, t, state);
    var px2 = S.parallaxX(0.44, t, state);
    var px3 = S.parallaxX(0.76, t, state);
    var py2 = S.parallaxY(0.44, t, state);

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // 1. Silver-Gelatin / Sepia LOC Archival Parallax Ground + Side Mattes
    S.drawBolasBackdrop(ctx, W, H, "cardboard-parallax", 35, t, state, { pillarbox: true });

    // 2. Five Sepia Old-Loyston Drowned Roadbed & Fencepost Parallax Planes + Text-Free Atlas Chart Crop!
    // strictly text-free center porthole/rock diagram of atlas-04.webp (sx: 472, sy: 88, sw: 256, sh: 256)
    S.drawScissorCutout(ctx, aImg, 472, 88, 256, 256, 775 + px1, 68, 285, 285, [
      [0.18, 0.06], [0.82, 0.06], [0.96, 0.50], [0.82, 0.94], [0.18, 0.94], [0.04, 0.50]
    ], {
      filter: "sepia",
      haloWidth: 4.0,
      alpha: 0.72,
      seed: 3501
    });

    // Drowned valley ridges & fenceposts (5 sepia torn-paper planes)
    S.drawTornPaperFlat(ctx, 86 + px1, 368, 1108, 130, { fill: "#433d35", paperColor: "#dfd8c8", deckle: 6, seed: 35.1 });
    for (var fp = 0; fp < 6; fp++) {
      var fpx = 180 + fp * 175 + px2 * 0.6;
      drawLinkageBar(ctx, S, fpx, 338, fpx - 8, 462, 6, "#5e5549", { shadow: false });
    }
    S.drawTornPaperFlat(ctx, 86 + px2, 462 + py2, 1108, 180, { fill: "#2e2a25", paperColor: "#e8e1d2", deckle: 6.5, seed: 35.4 });

    S.drawLampBeam(ctx, W, H, t, state, {
      x: 520,
      y: 615,
      aimX: 540 + Math.sin(t * 0.8) * 35,
      spread: 290,
      alpha: 0.19
    });

    // 3. Scissor-Cut Rural Mailbox #44 on Tilted Post + Canvas Mail Sack (p35.jpg: 640×640)
    var boxX = 248 + px2;
    var boxY = 126 + py2;
    S.drawScissorCutout(ctx, pImg, 174, 142, 224, 304, boxX, boxY, 345, 448, [
      [0.06, 0.44], [0.14, 0.08], [0.76, 0.04], [0.92, 0.24],
      [0.98, 0.68], [0.78, 0.84], [0.54, 0.58], [0.42, 0.98], [0.22, 0.96], [0.30, 0.52]
    ], {
      haloWidth: 5.5,
      seed: 3504
    });

    // PAELEO Blind-Mode Guard: Cover painted "#44" on mailbox side (x=boxX+28..148, y=boxY+68..164) in blind mode!
    if (beat.blind) {
      ctx.save();
      ctx.translate(boxX + 86, boxY + 118);
      ctx.rotate(0.14);
      S.drawCardboardPuppetPiece(ctx, [[-56, -36], [56, -36], [52, 36], [-58, 34]], {
        tone: "#5d7d8f",
        ribs: 2,
        pins: [[-42, -22], [40, -22], [-42, 22], [40, 22]]
      });
      // Four brass dot-pips (representing 4 + 4 without any text glyph!)
      for (var d4 = 0; d4 < 4; d4++) {
        S.drawSplitPin(ctx, -18 + d4 * 12, 0, 3.4, { metal: "brass" });
      }
      ctx.restore();
    }

    // Beat B: Woven Canvas Laundry Drawstring Bag Cinching Over Mailbox + Sagging Clothesline!
    if (beat.index === 1) {
      S.drawCardboardPuppetPiece(ctx, [
        [boxX + 165, boxY + 86], [boxX + 275, boxY + 98],
        [boxX + 298, boxY + 215], [boxX + 178, boxY + 228], [boxX + 148, boxY + 154]
      ], { tone: "#cbbda2", ribs: 4, pin: { x: boxX + 175, y: boxY + 148, r: 5, metal: "brass" } });
      // Sagging clothesline cord across scene
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(boxX + 245, boxY + 135);
      ctx.quadraticCurveTo(720, 295, 1085, 185);
      ctx.stroke();
    }

    // Beat D: Folding Spy Dipole Antenna + Silk Dead-Drop Parachute!
    if (beat.index === 3) {
      var antX = boxX + 195;
      var antY = boxY + 26;
      drawLinkageBar(ctx, S, antX, antY + 24, antX + 18, antY - 62, 4.5, "#c9963e", { pinStart: true, pinEnd: true });
      drawLinkageBar(ctx, S, antX - 38, antY - 46, antX + 74, antY - 76, 3.5, "#d8dce0", { shadow: false });
      // Expanding red/teal spy cipher rings
      for (var cr = 0; cr < 3; cr++) {
        var cu = ((t * 0.65 + cr / 3) % 1);
        ctx.strokeStyle = "rgba(212, 42, 30, " + ((1 - cu) * 0.7).toFixed(3) + ")";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(antX + 18, antY - 62, 12 + cu * 75, 0, TAU);
        ctx.stroke();
      }
    }

    // 4. La Machine à tuer le temps — Locked 5-Slot Parcel Pool Re-Slotted Across All 4 Variations!
    var slots = [
      [545, 265, -0.18],
      [655, 315, 0.14],
      [765, 272, -0.12],
      [695, 392, 0.22],
      [845, 356, -0.08]
    ];
    for (var si = 0; si < slots.length; si++) {
      var flipSpring = S.spring(beat.localT, 0.06 + si * 0.06, 13, 4.8);
      var sx = slots[si][0] + px3 * 0.5 + Math.sin(t * 2.1 + si * 1.4) * 14;
      var sy = slots[si][1] + Math.cos(t * 2.5 + si) * 10;
      var srot = slots[si][2] + Math.sin(t * 2.8 + si) * 0.08;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(srot);
      ctx.scale(Math.max(0.25, flipSpring), 1);

      if (beat.index === 1) {
        // Variation II: Crew Dirty Laundry (Cut-Paper Striped Socks & Undershirts + Clothespins + Soap Bubbles!)
        if (si % 2 === 0) {
          // Striped wool crew sock cutout
          S.drawCutoutPaperEdge(ctx, [
            [-18, -32], [12, -32], [12, 8], [34, 20], [26, 36], [-16, 22]
          ], "#d8d2c5", "#14110d", { paperRim: 3.2 });
          ctx.strokeStyle = "#d42a1e";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-15, -20); ctx.lineTo(10, -20);
          ctx.moveTo(-15, -10); ctx.lineTo(10, -10);
          ctx.stroke();
        } else {
          // Crew undershirt with muddy smudge & clothespin
          S.drawCutoutPaperEdge(ctx, [
            [-36, -24], [-16, -28], [16, -28], [36, -24], [28, -4], [20, -6], [22, 32], [-22, 32], [-20, -6], [-28, -4]
          ], "#e5dfd0", "#14110d", { paperRim: 3.2 });
          ctx.fillStyle = "rgba(92, 74, 52, 0.45)";
          ctx.beginPath();
          ctx.arc(4, 8, 9, 0, TAU);
          ctx.fill();
        }
        // Wooden clothespin at top
        S.drawCardboardPuppetPiece(ctx, [[-5, -44], [5, -44], [4, -22], [-4, -22]], { tone: "#c49a5b", shadow: false });
        drawPaperBubble(ctx, 26, -26, 6, "rgba(220, 245, 250, 0.8)");
      } else {
        // Variations I, III, IV: Locked Wax-Sealed Envelope / Sector 44 Microfilm Packet!
        var envFill = beat.index === 3 ? "#232a30" : "#fbfaf5";
        var envStroke = beat.index === 3 ? "#0f8f80" : "#14110d";
        S.drawCutoutPaperEdge(ctx, [[-36, -23], [36, -23], [36, 23], [-36, 23]], envFill, envStroke, { paperRim: 3.5 });
        ctx.strokeStyle = envStroke;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-34, -21); ctx.lineTo(0, 5); ctx.lineTo(34, -21);
        ctx.stroke();
        // Crimson wax seal / Sector 44 red-pencil mark
        ctx.fillStyle = "#d42a1e";
        ctx.beginPath();
        ctx.arc(0, 4, 6.5, 0, TAU);
        ctx.fill();
        if (beat.index === 3 && si === 2) {
          // Tiny silk spy parachute above center dead-drop!
          ctx.strokeStyle = "#fbfaf5";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(-26, -23); ctx.lineTo(-42, -74);
          ctx.moveTo(26, -23);  ctx.lineTo(42, -74);
          ctx.stroke();
          S.drawCutoutPaperEdge(ctx, [[-48, -72], [-24, -98], [24, -98], [48, -72]], "#d42a1e", "#14110d", { paperRim: 2.5 });
        }
      }
      ctx.restore();
    }

    // 5. Beat C: Sneaky Porch-Pirate Bandit Arm + Mask Snatching Parcels (S33 IK)!
    if (beat.index === 2) {
      var grabTargetX = 655 + Math.sin(t * 3.6) * 55;
      var grabTargetY = 308 + Math.cos(t * 3.2) * 28;
      var thiefIK = S.solveIK2(boxX + 85, boxY + 235, 195, 190, grabTargetX, grabTargetY, -1);

      // Masked bandit head peeking from behind wooden mailbox post!
      var headX = boxX + 72;
      var headY = boxY + 205;
      S.drawCardboardPuppetPiece(ctx, [[headX - 34, headY + 28], [headX - 38, headY - 28], [headX + 18, headY - 34], [headX + 26, headY + 24]], { tone: "#78756e", ribs: 2 });
      // Black domino burglar mask
      S.drawCutoutPaperEdge(ctx, [[headX - 32, headY - 16], [headX + 24, headY - 16], [headX + 20, headY + 2], [headX - 28, headY + 2]], "#14110d", "#fbfaf5", { paperRim: 1.5, shadow: false });
      drawPaperBubble(ctx, headX - 8, headY - 7, 4.2, "#fbfaf5");
      drawPaperBubble(ctx, headX + 10, headY - 7, 4.2, "#fbfaf5");

      // Striped burglar sleeve IK arm snatching envelopes
      drawLinkageBar(ctx, S, thiefIK.x0, thiefIK.y0, thiefIK.jx, thiefIK.jy, 11, "#383a3d", { pinStart: true, pinEnd: true });
      drawLinkageBar(ctx, S, thiefIK.jx, thiefIK.jy, thiefIK.ex, thiefIK.ey, 9.5, "#55585c", { pinEnd: true });
    }

    // Postal Trout Courier Cutout from p35.jpg in Variations A & D
    if (beat.index === 0 || beat.index === 3) {
      var ptX = 918 + px3 * 0.6 + Math.sin(t * 2.0) * 16;
      var ptY = 332 + Math.cos(t * 2.4) * 10;
      S.drawScissorCutout(ctx, pImg, 408, 252, 136, 98, ptX - 110, ptY - 78, 225, 162, [
        [0.02, 0.56], [0.34, 0.16], [0.62, 0.12], [0.96, 0.04],
        [0.98, 0.94], [0.68, 0.88], [0.28, 0.82]
      ], {
        haloWidth: 4.5,
        seed: 3509
      });
    }

    // 6. Couriers & Ballast
    drawCourierChoreography(ctx, S, W, H, t, beat, state, {
      floorY: 542,
      troutX: 985,
      troutY: 348,
      saucerX: 675,
      saucerY: 96,
      beamX: 695,
      beamY: 360,
      snailClimbX: 1128
    });
    drawBallastOverlay(ctx, S, W, H, t, state);

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 35);
  }

  // ---------- Register Crew 7 Remake Scenes (#31–#35) ----------
  SCENES[31] = { id: 31, station: "#31 · Galley B", duration: DURATION, bolasStyle: "queneau-rostrum", render: render31 };
  SCENES[32] = { id: 32, station: "#32 · Beak Arm", duration: DURATION, bolasStyle: "cardboard-parallax", render: render32 };
  SCENES[33] = { id: 33, station: "#33 · Salon", duration: DURATION, bolasStyle: "daumier-litho", render: render33 };
  SCENES[34] = { id: 34, station: "#34 · Organ", duration: DURATION, bolasStyle: "perec-stage", render: render34 };
  SCENES[35] = { id: 35, station: "#35 · Post #44", duration: DURATION, bolasStyle: "cardboard-parallax", render: render35 };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = SCENES;
  }
})(typeof window !== "undefined" ? window : globalThis);
