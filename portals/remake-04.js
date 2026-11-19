/* ============================================================================
 * Turkey Sub · V2 Multi-SCION Rostrum Remake — Crew 04 (Portholes #16–#20)
 * File: portals/remake-04.js
 *
 * Authentic BOLAS Oulipo Screening Room Materiality (1280×720, 24fps, 16.0s):
 *   - #16 · Aft    : "daumier-litho" · Cercle vicieux × S27 Remotion × atlas-08.webp
 *   - #17 · Dorsal : "daumier-litho" · Oupolpot × S25 RiveState × atlas-55.webp
 *   - #18 · Vent   : "perec-stage"   · 99 Ways Subjective × S02 Reiniger × atlas-38.webp
 *   - #19 · Bilge  : "duchamp-optic" · Bang Bang × S09 Igarashi ARAP × atlas-35.webp
 *   - #20 · Dome   : "perec-stage"   · La Belle Hortense × S18 Cartoon Saloon × atlas-41.webp
 *
 * 4-Variation Timeline (16.0s = 384 frames @ 24fps):
 *   - 0.0–4.0s   : Variation I   · (A) Real Creek
 *   - 4.0–8.0s   : Variation II  · (B) Probable · Turkey (+ Snail Mail Dispatch)
 *   - 8.0–12.0s  : Variation III · (C) Plausible · Trout (+ Snail Mail Reply)
 *   - 12.0–16.0s : Variation IV  · (D) Preposterous · Alien Listening Post
 *
 * PAELEO BLIND-MODE INVARIANT:
 *   When state && state.showCaptions === false, emits ZERO fillText/strokeText!
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;

  function getStage() {
    return (root && root.SCION_STAGE) || (typeof SCION_STAGE !== "undefined" ? SCION_STAGE : null);
  }

  // Kick off plate preloading immediately in browser environments
  var _bootS = getStage();
  if (_bootS && _bootS.preloadPortalPlates) {
    _bootS.preloadPortalPlates([16, 17, 18, 19, 20]);
  }

  // ---------- Shared Pure-Vector & Cardboard Rostrum Helpers (0 Text!) ----------

  function limbQuad(x0, y0, x1, y1, w0, w1) {
    var dx = x1 - x0;
    var dy = y1 - y0;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len;
    var ny = dx / len;
    return [
      [x0 + nx * w0, y0 + ny * w0],
      [x1 + nx * w1, y1 + ny * w1],
      [x1 - nx * w1, y1 - ny * w1],
      [x0 - nx * w0, y0 - ny * w0]
    ];
  }

  function starPolygon(cx, cy, rOuter, rInner, points, rot) {
    var pts = [];
    var n = points || 5;
    var a0 = rot || -Math.PI / 2;
    for (var i = 0; i < n * 2; i++) {
      var r = (i % 2 === 0) ? rOuter : rInner;
      var a = a0 + (i * Math.PI) / n;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return pts;
  }

  function drawBallastAndLampMood(ctx, S, W, H, t, state, opts) {
    var cfg = opts || {};
    var stageH = S.STAGE_H || 638;

    // Interactive Ballast bubbles & surface waterline tilt
    if (state && state.ballast) {
      ctx.save();
      ctx.strokeStyle = cfg.darkStage ? "rgba(210, 236, 232, 0.34)" : "rgba(25, 58, 68, 0.30)";
      ctx.lineWidth = 2.0;
      ctx.setLineDash([12, 7]);
      ctx.beginPath();
      for (var x = 0; x <= W; x += 32) {
        var wy = 84 + Math.sin(x * 0.014 + t * 2.4) * 7;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      for (var bi = 0; bi < 14; bi++) {
        var bx = 110 + S.hash(bi * 19.3 + 4.1) * (W - 220) + Math.sin(t * 2.2 + bi) * 14;
        var by = stageH - (((t * (48 + (bi % 5) * 14)) + bi * 53) % (stageH - 70));
        var br = 3.2 + (bi % 4) * 1.9;
        ctx.fillStyle = "rgba(251, 250, 247, 0.62)";
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // Interactive Lamp-off theatrical nocturnal veil
    if (state && state.lamp === false) {
      ctx.save();
      ctx.fillStyle = "rgba(10, 14, 22, 0.34)";
      ctx.fillRect(-20, -20, W + 40, stageH + 40);
      ctx.restore();
    }
  }

  function drawCourierChoreography(ctx, S, W, H, t, beat, state, opts) {
    var cfg = opts || {};
    var u = beat.u;

    // Variation II (B): Turkey Cutaway Badge + Mail Snail Dispatch
    if (beat.index === 1) {
      var disp = S.smooth(0.02, 0.34, u);
      S.drawTurkeyCutawayBadge(ctx, cfg.turkeyX || 126, cfg.turkeyY || 496, 1.02, t, { dispatch: disp });
      var sx = S.lerp(218, 910, S.easeInOutCubic(S.clamp((u - 0.08) / 0.86, 0, 1)));
      var sy = (cfg.snailFloorY || 542) + Math.sin(u * Math.PI * 3) * 5;
      S.drawMailSnail(ctx, sx, sy, 1.18, t, {
        postcard: true,
        hasReply: false,
        trail: true
      });
    }

    // Variation III (C): Brook Trout Witness + Mail Snail Climbing with Emerald Reply
    if (beat.index === 2) {
      if (cfg.customTrout !== true) {
        S.drawBrookTrout(
          ctx,
          cfg.troutX || 1008,
          (cfg.troutY || 408) + Math.sin(t * 2.2) * 8,
          cfg.troutScale || 1.08,
          t,
          true
        );
      }
      var climbU = S.easeInOutCubic(u);
      var cx = S.lerp(1095, 1138, climbU);
      var cy = S.lerp(525, 258, climbU);
      S.drawMailSnail(ctx, cx, cy, 1.12, t, {
        rot: -Math.PI * 0.44,
        postcard: true,
        hasReply: u > 0.22,
        trail: true
      });
    }

    // Variation IV (D): Alien Listening Post Saucer + 3-Stamped Snail Arrival
    if (beat.index === 3) {
      S.drawAlienSaucer(
        ctx,
        cfg.saucerX || 640,
        cfg.saucerY || 106,
        cfg.saucerScale || 1.18,
        t,
        cfg.beamX != null ? cfg.beamX : 640,
        cfg.beamY != null ? cfg.beamY : 420,
        { beamSpread: cfg.beamSpread || 165 }
      );
      var dU = S.easeInOutCubic(u);
      S.drawMailSnail(
        ctx,
        S.lerp(1030, (cfg.saucerX || 640) + 125, dU),
        S.lerp(245, (cfg.saucerY || 106) + 34, dU),
        0.96,
        t,
        {
          rot: -0.32,
          flip: true,
          postcard: true,
          hasReply: true,
          hasAlienStamp: u > 0.35,
          trail: true
        }
      );
    }

    // Interactive manual Snail Mail override from player.js (when user clicks Snail Mail in Beat A!)
    if (state && state.snailActive && beat.index === 0) {
      var st = state.snailT != null ? S.clamp(state.snailT, 0, 1) : ((t * 0.38) % 1);
      var ix = st < 0.5
        ? S.lerp(185, 960, st * 2)
        : S.lerp(960, 680, (st - 0.5) * 2);
      var iy = st < 0.5
        ? S.lerp(530, 440, st * 2)
        : S.lerp(440, 160, (st - 0.5) * 2);
      S.drawMailSnail(ctx, ix, iy, 1.15, t, {
        rot: st < 0.5 ? -0.08 : -0.55,
        flip: st >= 0.5,
        postcard: true,
        hasReply: st > 0.45,
        hasAlienStamp: st > 0.82
      });
    }
  }

  // Optional BOLAS Screening Room upper-left archival cue (100% skipped in blind mode!)
  function drawArchivalCueHeader(ctx, S, state, codeStr, folioTitle, inkColor) {
    if (S.isBlind(state)) return;
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = inkColor || "#14110d";
    ctx.font = '600 12px "JetBrains Mono", ui-monospace, Menlo, monospace';
    S.safeText(ctx, codeStr, 92, 42, state);
    ctx.font = 'italic 18px "Literata", Georgia, serif';
    S.safeText(ctx, folioTitle, 92, 66, state);
    ctx.restore();
  }

  // ==========================================================================
  // PORTHOLE #16 · #16 · Aft ("daumier-litho")
  // Cercle vicieux × S27 Remotion × atlas-08.webp (On Melancholy Hill)
  //   A: "A twin Turkey Sub waving back"
  //   B: "A shiny sunken pond mirror"
  //   C: "A two-headed tin creek monster"
  //   D: "A parallel-universe turkey clone"
  // ==========================================================================

  var POLY_SUB_16 = [
    [0.36, 0.03], [0.58, 0.03], [0.64, 0.20], [0.80, 0.25], [0.87, 0.52],
    [0.97, 0.72], [0.92, 0.85], [0.85, 0.96], [0.15, 0.97], [0.05, 0.86],
    [0.06, 0.56], [0.15, 0.26], [0.27, 0.19]
  ];

  function drawOurBreadTinProw16(ctx, S, x, y, t, lampBlink, mirrorMode) {
    ctx.save();
    ctx.translate(x, y);
    if (mirrorMode) ctx.scale(-1, 1);

    // White scissor-cutout paper halo around our tin sub prow
    S.drawCutoutPaperEdge(
      ctx,
      [[-130, -135], [48, -110], [92, -32], [96, 68], [46, 126], [-130, 140]],
      "#c8ccd0",
      "#0b0d10",
      { paperRim: 5.0 }
    );

    // Cross-hatched riveted tin hull plates
    S.drawCardboardPuppetPiece(
      ctx,
      [[-122, -124], [42, -102], [84, -28], [88, 62], [40, 118], [-122, 130]],
      {
        tone: "#9da2a8",
        ribs: 4,
        pins: [[26, -82], [64, -18], [66, 48], [24, 98], [-35, -94], [-35, 106]]
      }
    );
    S.drawEngravingCrosshatch(ctx, 190, 230, 0.22, 7, { x: -115, y: -115, color: "#0b0d10" });

    // Verne I.11 Electric Signal Lamp on dorsal nose
    var sigGlow = 0.45 + 0.55 * Math.max(0, Math.sin(t * 7.5 + (lampBlink || 0)));
    S.drawCardboardPuppetPiece(ctx, [[12, -134], [38, -134], [44, -104], [6, -104]], {
      tone: "#5c6066",
      ribs: 1,
      pin: { x: 25, y: -118, r: 3.8, metal: "brass" }
    });
    ctx.fillStyle = "rgba(255, 240, 168, " + (0.35 + sigGlow * 0.55).toFixed(3) + ")";
    ctx.beginPath();
    ctx.arc(25, -144, 18 + sigGlow * 10, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#fff8d4";
    ctx.strokeStyle = "#0b0d10";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(25, -144, 9, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Brass porthole with our waving split-pin Turkey wing inside
    ctx.fillStyle = "#d4a44c";
    ctx.strokeStyle = "#0b0d10";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(16, -4, 46, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f9e7b2";
    ctx.beginPath();
    ctx.arc(16, -4, 36, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Mini silhouette turkey + IK waving wing
    ctx.fillStyle = "#241911";
    ctx.beginPath();
    ctx.arc(8, 8, 16, 0, TAU);
    ctx.arc(18, -10, 9, 0, TAU);
    ctx.fill();
    var ik = S.solveIK2(12, 4, 16, 15, 32 + Math.sin(t * 6.4) * 6, -14 + Math.cos(t * 6.4) * 9, -1);
    S.drawCardboardPuppetPiece(ctx, limbQuad(12, 4, ik.jx, ik.jy, 5, 4), { tone: "#5c3d28", shadow: false });
    S.drawCardboardPuppetPiece(ctx, limbQuad(ik.jx, ik.jy, ik.ex, ik.ey, 4, 3), {
      tone: "#785036",
      shadow: false,
      pin: { x: ik.jx, y: ik.jy, r: 2.8, metal: "brass" }
    });

    ctx.restore();
  }

  function renderPortal16(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var u = beat.u;
    var plates = S.getPortalPlates(16);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.0 });

    // 1. Daumier Ink-Band Lithograph Backdrop (cream paper + stark ink band y=118..568)
    S.drawBolasBackdrop(ctx, W, H, "daumier-litho", 16, t, state, {
      bandTop: 118,
      bandBot: 568
    });

    var pxFar = S.parallaxX(0.22, t, state);
    var pyFar = S.parallaxY(0.22, t, state);
    var pxMid = S.parallaxX(0.55, t, state);
    var pyMid = S.parallaxY(0.55, t, state);
    var pxFg = S.parallaxX(0.88, t, state);

    // 2. Plane 1 (Far): Scissored fleet silhouettes from atlas-08.webp (On Melancholy Hill)
    S.drawScissorCutout(
      ctx, aImg,
      330, 18, 390, 355,
      430 + pxFar, 134 + pyFar, 420, 260,
      [[0.06, 0.08], [0.52, 0.03], [0.94, 0.09], [0.96, 0.58], [0.84, 0.94], [0.18, 0.92], [0.03, 0.55]],
      { filter: "litho", haloWidth: 3.5, alpha: 0.46, tint: "rgba(24, 42, 62, 0.25)" }
    );

    // Subtle horizontal lithograph water-etch lines across ink band
    S.drawEngravingCrosshatch(ctx, W, 430, 0.14, 11, { x: 0, y: 126, color: "#d8d3c6" });
    S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 568, aimX: 670, spread: 270, alpha: 0.15 });

    // 3. Plane 2 (Mid): 4-Variation Cercle Vicieux Staging
    if (beat.index === 0) {
      // --- VARIATION I (A): "A twin Turkey Sub waving back" ---
      // Left: Our bread-tin prow signaling with Verne lamp
      drawOurBreadTinProw16(ctx, S, 245 + pxMid * 0.5, 348 + pyMid, t, 0, false);

      // Right: Foraged p16.jpg Twin Turkey Sub cutout bobbing & waving back!
      var bobA = Math.sin(t * 2.6) * 8;
      var twinX = 635 + pxMid;
      var twinY = 166 + pyMid + bobA;
      S.drawScissorCutout(
        ctx, pImg,
        196, 108, 252, 296,
        twinX, twinY, 340, 365,
        POLY_SUB_16,
        { filter: "litho", haloWidth: 5.5, rot: Math.sin(t * 1.8) * 0.025 }
      );

      // Articulated split-pin waving wing overlay + answering Verne signal lamp on Twin Sub!
      var ansGlow = 0.45 + 0.55 * Math.max(0, Math.sin(t * 7.5 - 1.4));
      ctx.save();
      ctx.fillStyle = "rgba(255, 240, 168, " + (0.35 + ansGlow * 0.55).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(twinX + 198, twinY + 72, 18 + ansGlow * 10, 0, TAU);
      ctx.fill();

      // Split-pin wing waving energetically inside the twin sub's porthole
      var wx0 = twinX + 172;
      var wy0 = twinY + 250;
      var wik = S.solveIK2(wx0, wy0, 22, 20, wx0 + 26 + Math.sin(t * 7.2) * 11, wy0 - 20 + Math.cos(t * 7.2) * 10, -1);
      S.drawCardboardPuppetPiece(ctx, limbQuad(wx0, wy0, wik.jx, wik.jy, 6, 5), { tone: "#4f3826" });
      S.drawCardboardPuppetPiece(ctx, limbQuad(wik.jx, wik.jy, wik.ex, wik.ey, 5, 4), {
        tone: "#78553a",
        pin: { x: wik.jx, y: wik.jy, r: 3.5, metal: "brass" }
      });
      ctx.restore();

      // Foreground litho trout cutout from p16.jpg swimming past
      S.drawScissorCutout(
        ctx, pImg,
        298, 354, 194, 100,
        740 + pxFg - ((t * 36) % 160), 445 + Math.sin(t * 3.1) * 6, 235, 118,
        [[0.04, 0.48], [0.28, 0.14], [0.64, 0.06], [0.96, 0.18], [0.94, 0.84], [0.58, 0.94], [0.22, 0.82]],
        { filter: "sepia", haloWidth: 4.5 }
      );
    } else if (beat.index === 1) {
      // --- VARIATION II (B): "A shiny sunken pond mirror" ---
      var dropU = S.spring(u, 0.0, 11.0, 4.8);
      var mirX = 640 + pxMid * 0.4;
      var mirY = S.lerp(210, 342, S.clamp(dropU, 0, 1.08));

      // Palindromic mirrored pair of lithograph subs facing nose-to-nose across the mirror!
      var syncBob = Math.sin(t * 3.0) * 7;
      drawOurBreadTinProw16(ctx, S, mirX - 245, 344 + syncBob, t, 0, false);

      // Reflected twin sub on the right in exact synchronous palindrome
      ctx.save();
      ctx.globalAlpha = 0.88;
      drawOurBreadTinProw16(ctx, S, mirX + 245, 344 + syncBob, t, 0, true);
      ctx.restore();

      // Tall Ornate Sunken Pond Mirror Frame suspended on brass chains at center!
      ctx.save();
      ctx.strokeStyle = "#d4a44c";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(mirX - 22, 118); ctx.lineTo(mirX - 22, mirY - 196);
      ctx.moveTo(mirX + 22, 118); ctx.lineTo(mirX + 22, mirY - 196);
      ctx.stroke();

      // Outer white scissor-cutout mirror frame + silvered reflective glass
      S.drawCutoutPaperEdge(
        ctx,
        [[mirX - 44, mirY - 202], [mirX + 44, mirY - 202], [mirX + 50, mirY + 196], [mirX - 50, mirY + 196]],
        "#d4a44c",
        "#0b0d10",
        { paperRim: 5.5 }
      );
      var mg = ctx.createLinearGradient(mirX - 36, mirY - 185, mirX + 36, mirY + 185);
      mg.addColorStop(0.0, "#eef6f8");
      mg.addColorStop(0.45, "#a9c5ce");
      mg.addColorStop(0.55, "#ffffff");
      mg.addColorStop(1.0, "#7f9aa6");
      ctx.fillStyle = mg;
      ctx.strokeStyle = "#0b0d10";
      ctx.lineWidth = 2.2;
      ctx.fillRect(mirX - 30, mirY - 186, 60, 366);
      ctx.strokeRect(mirX - 30, mirY - 186, 60, 366);

      // Shimmering diagonal specular glints sweeping across mirror glass
      var glintY = mirY - 140 + ((t * 95) % 280);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 5.0;
      ctx.beginPath();
      ctx.moveTo(mirX - 24, glintY - 22);
      ctx.lineTo(mirX + 24, glintY + 22);
      ctx.moveTo(mirX - 24, glintY + 4);
      ctx.lineTo(mirX + 18, glintY + 42);
      ctx.stroke();

      S.drawReinigerFiligreeHinge(ctx, mirX, mirY - 196, 8.5, { metal: "brass" });
      S.drawReinigerFiligreeHinge(ctx, mirX, mirY + 190, 8.5, { metal: "brass" });
      ctx.restore();
    } else if (beat.index === 2) {
      // --- VARIATION III (C): "A two-headed tin creek monster" ---
      var monX = 545 + pxMid * 0.6;
      var monY = 392 + pyMid;

      // Fused Riveted Tin Hull Belly (scissored from p16.jpg + articulated copper monster necks!)
      S.drawScissorCutout(
        ctx, pImg,
        208, 206, 232, 194,
        monX - 185, monY - 105, 370, 215,
        [[0.08, 0.18], [0.50, 0.06], [0.92, 0.18], [0.98, 0.84], [0.50, 0.96], [0.02, 0.84]],
        { filter: "litho", haloWidth: 5.5 }
      );

      // Giant split-pin iron seam strapping the two hulls into one creek monster
      S.drawCardboardPuppetPiece(
        ctx,
        [[monX - 22, monY - 96], [monX + 22, monY - 96], [monX + 26, monY + 96], [monX - 26, monY + 96]],
        {
          tone: "#5c6166",
          ribs: 4,
          pins: [[monX, monY - 72], [monX, monY - 24], [monX, monY + 24], [monX, monY + 72]]
        }
      );

      // Left & Right Two-Bone IK Articulated Tin Monster Necks + Snapping Periscope Jaws!
      for (var side = -1; side <= 1; side += 2) {
        var baseX = monX + side * 78;
        var baseY = monY - 82;
        var headX = monX + side * (168 + Math.sin(t * 3.8 + side) * 26);
        var headY = monY - 195 + Math.cos(t * 4.4 + side * 1.7) * 22;
        var neckIK = S.solveIK2(baseX, baseY, 84, 78, headX, headY, side);

        S.drawCardboardPuppetPiece(ctx, limbQuad(baseX, baseY, neckIK.jx, neckIK.jy, 18, 15), {
          tone: "#9a7653",
          pin: { x: baseX, y: baseY, r: 5.2, metal: "brass" }
        });
        S.drawCardboardPuppetPiece(ctx, limbQuad(neckIK.jx, neckIK.jy, neckIK.ex, neckIK.ey, 15, 13), {
          tone: "#b58b63",
          pin: { x: neckIK.jx, y: neckIK.jy, r: 4.8, metal: "silver" }
        });

        // Snapping Tin Monster Head with serrated teeth & glowing yellow porthole eye
        var chomp = Math.abs(Math.sin(t * 7.5 + (side > 0 ? 0.9 : 0))) * 0.42;
        ctx.save();
        ctx.translate(neckIK.ex, neckIK.ey);
        ctx.scale(side, 1);

        // Upper tin jaw
        ctx.save();
        ctx.rotate(-chomp);
        S.drawCardboardPuppetPiece(ctx, [[-18, -24], [56, -20], [64, 2], [-14, 2]], { tone: "#80858c", ribs: 2 });
        // Sawtooth tin fangs
        ctx.fillStyle = "#fbfaf7";
        ctx.strokeStyle = "#0b0d10";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(8, 2); ctx.lineTo(16, 13); ctx.lineTo(24, 2);
        ctx.lineTo(34, 14); ctx.lineTo(42, 2); ctx.lineTo(52, 13); ctx.lineTo(58, 2);
        ctx.fill(); ctx.stroke();
        // Glowing monster eye
        ctx.fillStyle = "#f7dd8c";
        ctx.beginPath(); ctx.arc(14, -10, 8, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#d42a1e";
        ctx.beginPath(); ctx.arc(16, -10, 3.5, 0, TAU); ctx.fill();
        ctx.restore();

        // Lower hinged tin jaw + split-pin
        ctx.save();
        ctx.rotate(chomp * 0.9);
        S.drawCardboardPuppetPiece(ctx, [[-14, 0], [54, 2], [46, 18], [-16, 15]], {
          tone: "#666b72",
          ribs: 1,
          pin: { x: -8, y: 2, r: 4.2, metal: "brass" }
        });
        ctx.restore();

        ctx.restore();
      }
    } else {
      // --- VARIATION IV (D): "A parallel-universe turkey clone" ---
      // Vertical jagged dimensional rift splitting the ink band into 3 parallel-universe clones!
      ctx.save();
      var riftX = 640 + Math.sin(t * 3.2) * 8;
      var rg = ctx.createRadialGradient(riftX, 345, 18, riftX, 345, 250);
      rg.addColorStop(0.0, "rgba(15, 143, 128, 0.48)");
      rg.addColorStop(0.55, "rgba(212, 42, 30, 0.22)");
      rg.addColorStop(1.0, "rgba(15, 143, 128, 0)");
      ctx.fillStyle = rg;
      ctx.fillRect(riftX - 260, 120, 520, 446);

      // Jagged white-paper dimensional portal tear
      S.drawCutoutPaperEdge(
        ctx,
        [
          [riftX, 134], [riftX + 36, 205], [riftX + 18, 282], [riftX + 46, 350],
          [riftX + 16, 434], [riftX + 32, 502], [riftX, 556],
          [riftX - 32, 496], [riftX - 16, 426], [riftX - 46, 348],
          [riftX - 18, 276], [riftX - 34, 202]
        ],
        "#1b2e3b",
        "#0f8f80",
        { paperRim: 4.0 }
      );
      ctx.restore();

      // 3 Parallel-Universe Turkey Sub Clones (Left cyan-negative, Center sepia-brass, Right litho-inverted)
      var cloneSpecs = [
        { x: 205, y: 225, w: 250, h: 270, flt: "cyan", ph: 0.0, sc: 0.92 },
        { x: 515, y: 215, w: 255, h: 278, flt: "sepia", ph: 1.4, sc: 1.0 },
        { x: 825, y: 225, w: 250, h: 270, flt: "litho", ph: 2.8, sc: 0.92 }
      ];
      for (var ci = 0; ci < cloneSpecs.length; ci++) {
        var cs = cloneSpecs[ci];
        var cy = cs.y + Math.sin(t * 3.0 + cs.ph) * 11;
        S.drawScissorCutout(
          ctx, pImg,
          196, 108, 252, 296,
          cs.x, cy, cs.w, cs.h,
          POLY_SUB_16,
          { filter: cs.flt, haloWidth: 4.5, rot: Math.sin(t * 2.1 + cs.ph) * 0.04 }
        );
        // Synchronized clone turkey wings waving across universes!
        var cwx = cs.x + cs.w * 0.52;
        var cwy = cy + cs.h * 0.68;
        var cik = S.solveIK2(cwx, cwy, 18, 16, cwx + 22 + Math.sin(t * 7.5 + cs.ph) * 9, cwy - 18, -1);
        S.drawCardboardPuppetPiece(ctx, limbQuad(cwx, cwy, cik.jx, cik.jy, 5, 4), { tone: "#d42a1e", shadow: false });
        S.drawCardboardPuppetPiece(ctx, limbQuad(cik.jx, cik.jy, cik.ex, cik.ey, 4, 3), {
          tone: "#fbfaf7",
          shadow: false,
          pin: { x: cik.jx, y: cik.jy, r: 3.0, metal: "brass" }
        });
      }
    }

    // 4. Plane 3 (Foreground): Left & right scissored creek stone/kelp cards from p16.jpg
    S.drawScissorCutout(
      ctx, pImg,
      112, 246, 98, 168,
      26 + pxFg, 386, 132, 178,
      [[0.08, 0.12], [0.58, 0.04], [0.92, 0.34], [0.95, 0.94], [0.06, 0.96]],
      { filter: "litho", haloWidth: 4.0 }
    );

    // Couriers + Mood + Archival Cue
    drawCourierChoreography(ctx, S, W, H, t, beat, state, {
      turkeyX: 128, turkeyY: 494, snailFloorY: 544, saucerX: 640, saucerY: 102, beamY: 440
    });
    drawBallastAndLampMood(ctx, S, W, H, t, state, { darkStage: false });
    drawArchivalCueHeader(ctx, S, state, "P16 · CERCLE VICIEUX · PALINDROME AFT", "— deux coques d’étain face à face", "#14110d");

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 16);
  }

  // ==========================================================================
  // PORTHOLE #17 · #17 · Dorsal ("daumier-litho")
  // Oupolpot × S25 RiveState × atlas-55.webp (Trading on the Current)
  //   A: "Fish arguing around a stone table"
  //   B: "A stern underwater courtroom jury"
  //   C: "A shiny new creek parking meter"
  //   D: "The high Galactic Senate tribunal"
  // ==========================================================================

  var COUNCIL_CROPS_17 = [
    { sx: 112, sy: 280, sw: 114, sh: 138, dx: 235, dy: 245, dw: 158, dh: 185, side: 1 },
    { sx: 194, sy: 244, sw: 98,  sh: 114, dx: 382, dy: 198, dw: 145, dh: 162, side: 1 },
    { sx: 288, sy: 230, sw: 84,  sh: 108, dx: 562, dy: 182, dw: 142, dh: 162, side: 1 },
    { sx: 366, sy: 244, sw: 100, sh: 114, dx: 735, dy: 198, dw: 146, dh: 162, side: -1 },
    { sx: 428, sy: 280, sw: 116, sh: 138, dx: 874, dy: 245, dw: 158, dh: 185, side: -1 }
  ];

  function drawPowderedWig17(ctx, S, cx, cy, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale || 1, scale || 1);
    S.drawCutoutPaperEdge(
      ctx,
      [
        [-38, 22], [-44, -2], [-34, -22], [-14, -30], [14, -30],
        [34, -22], [44, -2], [38, 22], [24, 24], [22, -4], [-22, -4], [-24, 24]
      ],
      "#f3efe4",
      "#0b0d10",
      { paperRim: 2.5 }
    );
    // Engraved Daumier wig curls
    ctx.strokeStyle = "#5a554c";
    ctx.lineWidth = 1.6;
    for (var row = -1; row <= 1; row++) {
      ctx.beginPath();
      ctx.arc(-32, 4 + row * 8, 6, 0, Math.PI);
      ctx.moveTo(38, 4 + row * 8);
      ctx.arc(32, 4 + row * 8, 6, 0, Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }

  function renderPortal17(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var u = beat.u;
    var plates = S.getPortalPlates(17);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.0 });

    // 1. Daumier Parliamentary Lithograph Band
    S.drawBolasBackdrop(ctx, W, H, "daumier-litho", 17, t, state, {
      bandTop: 116,
      bandBot: 570
    });

    var pxFar = S.parallaxX(0.20, t, state);
    var pxMid = S.parallaxX(0.50, t, state);
    var pyMid = S.parallaxY(0.50, t, state);

    // Plane 1: Distant trading-hall spectators cropped from atlas-55.webp (Trading on the Current)
    S.drawScissorCutout(
      ctx, aImg,
      14, 65, 354, 245,
      430 + pxFar, 124, 420, 220,
      [[0.04, 0.08], [0.50, 0.03], [0.96, 0.08], [0.94, 0.92], [0.06, 0.92]],
      { filter: "litho", haloWidth: 3.0, alpha: 0.38 }
    );
    S.drawEngravingCrosshatch(ctx, W, 440, 0.14, 10, { x: 0, y: 120, color: "#dcd6c8" });
    S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 570, aimX: 640, spread: 320, alpha: 0.18 });

    // Active Oupolpot speaker index rotating rapidly through the 5 council chairs!
    var activeSpeaker = Math.floor((t * 2.4) % 5);

    if (beat.index === 0 || beat.index === 1) {
      // --- VARIATION I (A) Council Argument & VARIATION II (B) Courtroom Jury ---
      var isJury = (beat.index === 1);

      // 5 Bespectacled Council Trout Cutouts from p17.jpg with IK fin-slapping arms!
      for (var i = 0; i < 5; i++) {
        var c = COUNCIL_CROPS_17[i];
        var speaking = (i === activeSpeaker);
        var leanY = speaking ? -12 - Math.abs(Math.sin(t * 11)) * 8 : Math.sin(t * 2.3 + i) * 3;
        var fx = c.dx + pxMid * 0.7;
        var fy = c.dy + pyMid + leanY;

        S.drawScissorCutout(
          ctx, pImg,
          c.sx, c.sy, c.sw, c.sh,
          fx, fy, c.dw, c.dh,
          [[0.08, 0.08], [0.52, 0.03], [0.92, 0.10], [0.95, 0.90], [0.50, 0.97], [0.05, 0.90]],
          {
            filter: "litho",
            haloWidth: speaking ? 5.5 : 4.2,
            rot: speaking ? Math.sin(t * 12) * 0.04 : 0
          }
        );

        // Glinting wire-rim spectacles overlay so glasses pop crisply in litho!
        var gx = fx + c.dw * 0.50;
        var gy = fy + c.dh * 0.28;
        ctx.strokeStyle = "#d4a44c";
        ctx.lineWidth = 2.2;
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath();
        ctx.arc(gx - 13, gy, 8.5, 0, TAU);
        ctx.arc(gx + 11, gy, 8.5, 0, TAU);
        ctx.fill();
        ctx.stroke();

        if (isJury) {
          drawPowderedWig17(ctx, S, fx + c.dw * 0.50, fy + 18, i === 2 ? 1.18 : 1.0);
        }
      }

      // Central Mossy Stone Table + Stacked Pebble Cairns + Slate Pads cropped from p17.jpg!
      var tabX = 305 + pxMid;
      var tabY = 352 + pyMid;
      S.drawScissorCutout(
        ctx, pImg,
        166, 324, 310, 152,
        tabX, tabY, 670, 200,
        [[0.05, 0.14], [0.30, 0.03], [0.70, 0.03], [0.95, 0.14], [0.92, 0.62], [0.68, 0.96], [0.32, 0.96], [0.08, 0.62]],
        { filter: isJury ? "litho" : "sepia", haloWidth: 5.5 }
      );

      // Articulated split-pin pectoral fins slapping the stone table (or Chief Judge slamming Gavel in B!)
      for (var fi = 0; fi < 5; fi++) {
        var cf = COUNCIL_CROPS_17[fi];
        var shX = cf.dx + pxMid * 0.7 + cf.dw * 0.5;
        var shY = cf.dy + pyMid + cf.dh * 0.68;
        var slap = (fi === activeSpeaker) ? Math.abs(Math.sin(t * 11)) : 0.15;
        var targX = shX + (2 - fi) * -14;
        var targY = tabY + 42 - slap * 34;
        var fik = S.solveIK2(shX, shY, 44, 42, targX, targY, cf.side);

        S.drawCardboardPuppetPiece(ctx, limbQuad(shX, shY, fik.jx, fik.jy, 8, 6), {
          tone: "#7b8278",
          pin: { x: shX, y: shY, r: 3.8, metal: "brass" }
        });
        S.drawCardboardPuppetPiece(ctx, limbQuad(fik.jx, fik.jy, fik.ex, fik.ey, 6, 5), {
          tone: "#9aa296",
          pin: { x: fik.jx, y: fik.jy, r: 3.5, metal: "silver" }
        });

        // In Beat B, Chief Justice (#3, fi===2) swings a wooden courtroom gavel!
        if (isJury && fi === 2) {
          var gavAng = -0.55 + Math.sin(t * 9.5) * 0.52;
          ctx.save();
          ctx.translate(fik.ex, fik.ey);
          ctx.rotate(gavAng);
          S.drawCardboardPuppetPiece(ctx, [[-4, -3], [48, -3], [48, 3], [-4, 3]], { tone: "#6b4829", shadow: false });
          S.drawCutoutPaperEdge(ctx, [[38, -16], [58, -16], [58, 16], [38, 16]], "#4a3019", "#0b0d10", { paperRim: 2.5 });
          ctx.restore();
        }
      }

      // In Beat B, add carved wooden Courtroom Jury Bench Rail across front of stone table
      if (isJury) {
        S.drawTornPaperFlat(ctx, tabX + 35, tabY + 112, 600, 68, {
          fill: "#3d2b1c",
          paperColor: "#fbfaf5",
          deckle: 4.5,
          stroke: "#0b0d10"
        });
        for (var bal = 0; bal < 9; bal++) {
          var bx = tabX + 70 + bal * 66;
          S.drawCardboardPuppetPiece(ctx, [[bx - 7, tabY + 120], [bx + 7, tabY + 120], [bx + 7, tabY + 172], [bx - 7, tabY + 172]], {
            tone: "#78583c",
            ribs: 1,
            shadow: false,
            pin: { x: bx, y: tabY + 146, r: 3.0, metal: "brass" }
          });
        }
      }
    } else if (beat.index === 2) {
      // --- VARIATION III (C): "A shiny new creek parking meter" ---
      var mx = 560 + pxMid * 0.5;
      var my = 345;

      // Two puzzled council fish cropped on left watching Brook Trout feed the meter
      for (var pi = 0; pi < 2; pi++) {
        var pc = COUNCIL_CROPS_17[pi];
        S.drawScissorCutout(
          ctx, pImg,
          pc.sx, pc.sy, pc.sw, pc.sh,
          170 + pi * 145 + pxMid * 0.5, 295 + Math.sin(t * 2.5 + pi) * 5, 142, 168,
          null,
          { filter: "litho", haloWidth: 4.5 }
        );
      }

      // Mossy stone base cropped from p17.jpg anchoring the shiny iron parking-meter post!
      S.drawScissorCutout(
        ctx, pImg,
        195, 340, 250, 130,
        mx - 155, 458, 310, 108,
        [[0.08, 0.18], [0.92, 0.18], [0.85, 0.94], [0.15, 0.94]],
        { filter: "sepia", haloWidth: 4.5 }
      );

      // Riveted Chrome Post
      S.drawCardboardPuppetPiece(
        ctx,
        [[mx - 18, 345], [mx + 18, 345], [mx + 22, 480], [mx - 22, 480]],
        { tone: "#adb4bc", ribs: 3, pins: [[mx, 375], [mx, 435]] }
      );

      // Shiny Domed Creek Parking Meter Housing (0 text — pure red/teal dial + ticking needle + coin slot!)
      S.drawCutoutPaperEdge(
        ctx,
        [
          [mx - 92, 348], [mx - 96, 218], [mx - 68, 152], [mx, 132],
          [mx + 68, 152], [mx + 96, 218], [mx + 92, 348]
        ],
        "#ced5dc",
        "#0b0d10",
        { paperRim: 6.0 }
      );

      // Glass arched dial window
      ctx.fillStyle = "#fbfaf7";
      ctx.strokeStyle = "#0b0d10";
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(mx, 232, 68, Math.PI, 0);
      ctx.lineTo(mx + 68, 252);
      ctx.lineTo(mx - 68, 252);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Red expired wedge + Teal paid wedge + pure tick marks (ZERO text!)
      ctx.fillStyle = "#d42a1e";
      ctx.beginPath();
      ctx.moveTo(mx, 240);
      ctx.arc(mx, 240, 54, Math.PI, Math.PI * 1.38);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#0f8f80";
      ctx.beginPath();
      ctx.moveTo(mx, 240);
      ctx.arc(mx, 240, 54, Math.PI * 1.38, TAU);
      ctx.closePath();
      ctx.fill();

      // Spring-loaded meter needle swinging from red expired to green paid as pebble coin drops!
      var paidU = S.spring(u, 0.32, 12.0, 4.2);
      var needleAng = S.lerp(-Math.PI * 0.82, -Math.PI * 0.22, S.clamp(paidU, 0, 1.1));
      ctx.strokeStyle = "#0b0d10";
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.moveTo(mx, 240);
      ctx.lineTo(mx + Math.cos(needleAng) * 48, 240 + Math.sin(needleAng) * 48);
      ctx.stroke();
      S.drawSplitPin(ctx, mx, 240, 5.5, { metal: "brass" });

      // Coin slot + flat river-pebble coin dropping from Brook Trout's fin!
      ctx.fillStyle = "#0b0d10";
      ctx.fillRect(mx + 34, 286, 8, 32);
      var coinU = S.clamp((u - 0.12) / 0.26, 0, 1);
      if (coinU < 0.98) {
        var cx = S.lerp(815, mx + 38, S.easeInOutCubic(coinU));
        var cy = S.lerp(335, 298, S.easeInOutCubic(coinU)) - Math.sin(coinU * Math.PI) * 42;
        S.drawCutoutPaperEdge(
          ctx,
          [[cx - 16, cy - 12], [cx + 16, cy - 12], [cx + 18, cy + 12], [cx - 18, cy + 12]],
          "#d4a44c",
          "#0b0d10",
          { paperRim: 2.5 }
        );
      }

      // Custom Brook Trout right next to the meter inserting the pebble!
      S.drawBrookTrout(ctx, 885, 348 + Math.sin(t * 2.4) * 6, 1.12, t, true);
    } else {
      // --- VARIATION IV (D): "The high Galactic Senate tribunal" ---
      // 5 Floating Repulsor Senate Pods arranged in a cosmic amphitheater around the Alien Saucer!
      var podCoords = [
        { x: 205, y: 392, sc: 0.92 },
        { x: 395, y: 448, sc: 0.96 },
        { x: 640, y: 472, sc: 1.05 },
        { x: 885, y: 448, sc: 0.96 },
        { x: 1075, y: 392, sc: 0.92 }
      ];

      // Holographic star-map rings in the center of the Senate chamber
      ctx.save();
      for (var hr = 0; hr < 3; hr++) {
        ctx.strokeStyle = hr % 2 === 0 ? "rgba(15, 143, 128, 0.55)" : "rgba(212, 42, 30, 0.48)";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.ellipse(640, 320, 160 + hr * 75, 36 + hr * 16, Math.sin(t + hr) * 0.06, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();

      for (var si = 0; si < 5; si++) {
        var pod = podCoords[si];
        var cc = COUNCIL_CROPS_17[si];
        var hoverY = pod.y + Math.sin(t * 2.8 + si * 1.3) * 12;

        // Senator fish cutout riding inside each hovering pod
        S.drawScissorCutout(
          ctx, pImg,
          cc.sx, cc.sy, cc.sw, cc.sh,
          pod.x - 62 * pod.sc, hoverY - 128 * pod.sc, 124 * pod.sc, 138 * pod.sc,
          null,
          { filter: "cyan", haloWidth: 4.0 }
        );

        // Riveted Brass & Cardboard Hovering Senate Pod Dish + Glowing Repulsor Ring
        S.drawCardboardPuppetPiece(
          ctx,
          [
            [pod.x - 86 * pod.sc, hoverY - 12],
            [pod.x + 86 * pod.sc, hoverY - 12],
            [pod.x + 62 * pod.sc, hoverY + 26],
            [pod.x - 62 * pod.sc, hoverY + 26]
          ],
          {
            tone: "#6e7682",
            ribs: 2,
            pins: [[pod.x - 42 * pod.sc, hoverY + 6], [pod.x, hoverY + 8], [pod.x + 42 * pod.sc, hoverY + 6]]
          }
        );

        ctx.strokeStyle = "#0f8f80";
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.ellipse(pod.x, hoverY + 34, 48 * pod.sc, 8 * pod.sc, 0, 0, TAU);
        ctx.stroke();
      }
    }

    drawCourierChoreography(ctx, S, W, H, t, beat, state, {
      turkeyX: 124,
      turkeyY: 496,
      snailFloorY: 546,
      customTrout: beat.index === 2,
      saucerX: 640,
      saucerY: 104,
      beamY: 455
    });
    drawBallastAndLampMood(ctx, S, W, H, t, state, { darkStage: false });
    drawArchivalCueHeader(ctx, S, state, "P17 · OUPOLPOT · ROTATED AGENDA", "— cinq truites à lunettes autour de la pierre", "#14110d");

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 17);
  }

  // ==========================================================================
  // PORTHOLE #18 · #18 · Vent ("perec-stage")
  // 99 Ways Subjective × S02 Lotte Reiniger × atlas-38.webp (The Rifle's Spiral)
  //   A: "A star-carved old steamer trunk"
  //   B: "A sunken pirate treasure chest"
  //   C: "A stage magician’s trick box"
  //   D: "A trapped pocket constellation"
  // ==========================================================================

  function renderPortal18(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var u = beat.u;
    var plates = S.getPortalPlates(18);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.0 });

    // 1. Carved Perec Ochre Sandstone Proscenium opening onto deep nocturnal stage!
    S.drawBolasBackdrop(ctx, W, H, "perec-stage", 18, t, state, {
      openX: 205,
      openY: 78,
      openW: 870,
      openH: 542,
      doors: true
    });

    var pxFar = S.parallaxX(0.24, t, state);
    var pyFar = S.parallaxY(0.24, t, state);
    var pxMid = S.parallaxX(0.55, t, state);
    var pyMid = S.parallaxY(0.55, t, state);
    var pxFg = S.parallaxX(0.85, t, state);

    // 2. Plane 1 (Far): Star-pierced miniature stage backdrop from atlas-38.webp (The Rifle's Spiral)
    S.drawScissorCutout(
      ctx, aImg,
      90, 0, 560, 230,
      330 + pxFar, 94 + pyFar, 620, 245,
      [[0.04, 0.05], [0.96, 0.05], [0.94, 0.94], [0.06, 0.94]],
      { filter: "sepia", haloWidth: 3.5, alpha: 0.72 }
    );

    S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 615, aimX: 640, spread: 260, alpha: 0.22 });

    var cx = 640 + pxMid * 0.6;
    var cy = 385 + pyMid;

    if (beat.index === 0) {
      // --- VARIATION I (A): "A star-carved old steamer trunk" ---
      // Golden cathedral starlight shaft rising out of the trunk's star cutout
      ctx.save();
      var sg = ctx.createLinearGradient(cx + 28, cy - 40, cx + 10, 90);
      sg.addColorStop(0.0, "rgba(255, 232, 152, 0.52)");
      sg.addColorStop(1.0, "rgba(255, 232, 152, 0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy - 30);
      ctx.lineTo(cx - 95, 92);
      ctx.lineTo(cx + 125, 92);
      ctx.lineTo(cx + 68, cy - 30);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Real scissored Steamer Trunk cutout from p18.jpg with Lotte Reiniger filigree brass hinges!
      S.drawScissorCutout(
        ctx, pImg,
        194, 196, 304, 228,
        cx - 215, cy - 145, 430, 315,
        [[0.04, 0.24], [0.18, 0.08], [0.82, 0.04], [0.97, 0.22], [0.95, 0.92], [0.46, 0.98], [0.04, 0.88]],
        { haloWidth: 5.5 }
      );
      S.drawReinigerFiligreeHinge(ctx, cx - 102, cy + 4, 8.5, { metal: "brass" });
      S.drawReinigerFiligreeHinge(ctx, cx + 124, cy - 6, 8.5, { metal: "brass" });

      // Animated Reiniger backlit star halo pulsing around the peeking trout in the star window
      var pulse = 1 + Math.sin(t * 4.2) * 0.06;
      ctx.save();
      ctx.strokeStyle = "#f7dd8c";
      ctx.lineWidth = 2.8;
      var sPts = starPolygon(cx + 42, cy - 40, 56 * pulse, 24 * pulse, 5, -Math.PI / 2 + 0.06);
      ctx.beginPath();
      for (var si = 0; si < sPts.length; si++) {
        if (si === 0) ctx.moveTo(sPts[si][0], sPts[si][1]);
        else ctx.lineTo(sPts[si][0], sPts[si][1]);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    } else if (beat.index === 1) {
      // --- VARIATION II (B): "A sunken pirate treasure chest" ---
      var lidOpen = S.clamp(S.spring(u, 0.02, 10.5, 4.5), 0, 1.12);

      // Lower wooden chest box (cropped from p18.jpg lower half)
      S.drawScissorCutout(
        ctx, pImg,
        196, 298, 300, 126,
        cx - 210, cy - 10, 420, 185,
        [[0.03, 0.06], [0.97, 0.06], [0.95, 0.94], [0.05, 0.94]],
        { haloWidth: 5.0 }
      );

      // Hinged Upper Lid swinging open via FK around left brass filigree hinge!
      ctx.save();
      ctx.translate(cx - 195, cy - 8);
      ctx.rotate(-0.92 * lidOpen);
      S.drawScissorCutout(
        ctx, pImg,
        196, 198, 300, 112,
        0, -118, 410, 122,
        [[0.02, 0.88], [0.14, 0.14], [0.86, 0.08], [0.98, 0.88]],
        { haloWidth: 4.5 }
      );
      ctx.restore();
      S.drawReinigerFiligreeHinge(ctx, cx - 195, cy - 8, 9.5, { metal: "brass" });

      // Overflowing Cut-Paper Gold Doubloons, Ruby Goblet, Pearl Strand & Reiniger Pirate Cutlass!
      ctx.save();
      for (var gi = 0; gi < 18; gi++) {
        var gx = cx - 145 + gi * 17;
        var gy = cy - 14 - Math.sin((gi / 17) * Math.PI) * 34 * lidOpen + (gi % 3) * 5;
        ctx.fillStyle = gi % 4 === 0 ? "#d42a1e" : "#f3c74b";
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(gx, gy, 11, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }

      // Articulated Lotte Reiniger Silhouette Skeleton-Pirate Cutlass & Skull rising on IK spring arm!
      var jackX = cx + 36 + Math.sin(t * 4.2) * 14;
      var jackY = cy - 135 * lidOpen;
      var jik = S.solveIK2(cx + 10, cy - 12, 74, 72, jackX, jackY, 1);
      S.drawCardboardPuppetPiece(ctx, limbQuad(cx + 10, cy - 12, jik.jx, jik.jy, 7, 6), { tone: "#181818" });
      S.drawCardboardPuppetPiece(ctx, limbQuad(jik.jx, jik.jy, jik.ex, jik.ey, 6, 5), {
        tone: "#181818",
        pin: { x: jik.jx, y: jik.jy, r: 4.0, metal: "brass" }
      });

      // Cut-paper Pirate Bicorne Hat + Skull + Curved Brass Cutlass (0 text!)
      S.drawCutoutPaperEdge(
        ctx,
        [[jackX - 44, jackY - 12], [jackX, jackY - 42], [jackX + 44, jackY - 12], [jackX + 28, jackY - 4], [jackX - 28, jackY - 4]],
        "#14110d",
        "#d4a44c",
        { paperRim: 3.0 }
      );
      S.drawCutoutPaperEdge(
        ctx,
        [[jackX - 18, jackY - 6], [jackX + 18, jackY - 6], [jackX + 14, jackY + 22], [jackX - 14, jackY + 22]],
        "#fbfaf5",
        "#14110d",
        { paperRim: 2.0 }
      );
      ctx.fillStyle = "#14110d";
      ctx.beginPath();
      ctx.arc(jackX - 6, jackY + 4, 4.2, 0, TAU);
      ctx.arc(jackX + 6, jackY + 4, 4.2, 0, TAU);
      ctx.fill();

      // Curved Pirate Cutlass waving
      ctx.save();
      ctx.translate(jackX + 22, jackY + 6);
      ctx.rotate(-0.4 + Math.sin(t * 6.5) * 0.28);
      S.drawCutoutPaperEdge(ctx, [[0, -4], [74, -18], [86, -6], [66, 2], [0, 5]], "#e6eaee", "#14110d", { paperRim: 2.0 });
      S.drawReinigerFiligreeHinge(ctx, 2, 0, 5.5, { metal: "brass" });
      ctx.restore();
      ctx.restore();
    } else if (beat.index === 2) {
      // --- VARIATION III (C): "A stage magician’s trick box" ---
      // Crimson velvet theater swags across the Perec lintel
      S.drawTornPaperFlat(ctx, 215, 80, 850, 48, { fill: "#7e1d18", paperColor: "#fbfaf5", deckle: 5.0 });

      // Trick Box combining atlas-38.webp crescent-moon & star cutouts!
      S.drawScissorCutout(
        ctx, aImg,
        42, 224, 636, 190,
        cx - 240, cy - 35, 390, 195,
        [[0.03, 0.05], [0.97, 0.05], [0.95, 0.96], [0.05, 0.96]],
        { haloWidth: 5.5 }
      );
      // Gold star & moon appliqués on trick box
      var mStar = starPolygon(cx - 145, cy + 55, 28, 12, 5, t * 0.8);
      S.drawCutoutPaperEdge(ctx, mStar, "#f3c74b", "#14110d", { paperRim: 2.0 });

      // Pop-open trick lid + origami white paper dove & colorful silk kerchief cascade!
      var popU = S.clamp(S.spring(u, 0.18, 12.0, 4.2), 0, 1.15);
      var doveY = cy - 45 - popU * 145 + Math.sin(t * 6.0) * 8;
      var doveX = cx - 45 + Math.cos(t * 3.2) * 18;

      // Colorful paper silk streamer ribbons springing out of the box
      var ribCols = ["#d42a1e", "#f3c74b", "#0f8f80", "#2a3a63"];
      for (var ri = 0; ri < 4; ri++) {
        ctx.strokeStyle = ribCols[ri];
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(cx - 50 + ri * 14, cy - 30);
        ctx.quadraticCurveTo(
          cx - 90 + ri * 42 + Math.sin(t * 5 + ri) * 20,
          cy - 95 * popU,
          cx - 70 + ri * 36,
          cy - 155 * popU
        );
        ctx.stroke();
      }

      // Articulated Split-Pin White Origami Dove flapping its wings!
      if (popU > 0.05) {
        var wingFlap = Math.sin(t * 14.0) * 0.55;
        ctx.save();
        ctx.translate(doveX, doveY);
        ctx.save();
        ctx.rotate(-0.4 + wingFlap);
        S.drawCutoutPaperEdge(ctx, [[0, 0], [-42, -32], [-12, -8]], "#fbfaf7", "#14110d", { paperRim: 2.0 });
        ctx.restore();
        ctx.save();
        ctx.rotate(0.4 - wingFlap);
        S.drawCutoutPaperEdge(ctx, [[0, 0], [42, -32], [12, -8]], "#fbfaf7", "#14110d", { paperRim: 2.0 });
        ctx.restore();
        S.drawCutoutPaperEdge(ctx, [[-24, 4], [0, -10], [26, -2], [8, 12], [-20, 14]], "#fbfaf7", "#14110d", { paperRim: 2.5 });
        S.drawSplitPin(ctx, 0, 0, 3.2, { metal: "silver" });
        ctx.restore();
      }

      // Magician Brook Trout wearing a silk Top Hat & waving a Magic Wand!
      var magX = 915;
      var magY = 392 + Math.sin(t * 2.4) * 6;
      S.drawBrookTrout(ctx, magX, magY, 1.12, t, true);
      // Silk Magician Top Hat perched on Brook Trout's head
      S.drawCutoutPaperEdge(
        ctx,
        [[magX - 88, magY - 24], [magX - 24, magY - 24], [magX - 34, magY - 30], [magX - 30, magY - 72], [magX - 78, magY - 72], [magX - 74, magY - 30]],
        "#14110d",
        "#d4a44c",
        { paperRim: 2.5 }
      );
      // Magic Wand held in fin
      ctx.save();
      ctx.translate(magX - 58, magY + 14);
      ctx.rotate(-0.55 + Math.sin(t * 7.5) * 0.35);
      S.drawCutoutPaperEdge(ctx, [[0, -3], [-92, -3], [-92, 3], [0, 3]], "#14110d", "#14110d", { paperRim: 1.5 });
      ctx.fillStyle = "#fbfaf7";
      ctx.fillRect(-92, -3, 18, 6);
      ctx.restore();
    } else {
      // --- VARIATION IV (D): "A trapped pocket constellation" ---
      // Unfolded steamer trunk panels floating slightly apart to reveal a glowing 3D Pocket Constellation!
      S.drawScissorCutout(
        ctx, pImg,
        194, 286, 304, 138,
        cx - 225, cy + 28, 450, 155,
        [[0.02, 0.12], [0.98, 0.12], [0.92, 0.95], [0.08, 0.95]],
        { filter: "cyan", haloWidth: 4.5 }
      );

      // Rotating brass Reiniger astrolabe armillary rings + glowing pocket constellation nodes!
      ctx.save();
      var conY = cy - 42;
      ctx.strokeStyle = "rgba(212, 164, 76, 0.78)";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(cx, conY, 165, 95, Math.sin(t * 0.9) * 0.25, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, conY, 125, 115, -Math.cos(t * 0.8) * 0.35, 0, TAU);
      ctx.stroke();

      var starNodes = [
        [-115, -48], [-52, -78], [18, -54], [98, -72],
        [124, -4], [48, 36], [-38, 28], [-92, 16]
      ];
      var rotC = t * 0.35;
      var worldStars = [];
      for (var ni = 0; ni < starNodes.length; ni++) {
        var sx = cx + starNodes[ni][0] * Math.cos(rotC * 0.4) - starNodes[ni][1] * 0.18;
        var sy = conY + starNodes[ni][1] + Math.sin(t * 2.6 + ni) * 7;
        worldStars.push([sx, sy]);
      }

      // Silver constellation filaments linking the trapped stars
      ctx.strokeStyle = "rgba(215, 248, 242, 0.85)";
      ctx.lineWidth = 2.0;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      for (var li = 0; li < worldStars.length; li++) {
        var nxt = worldStars[(li + 1) % worldStars.length];
        ctx.moveTo(worldStars[li][0], worldStars[li][1]);
        ctx.lineTo(nxt[0], nxt[1]);
      }
      ctx.moveTo(worldStars[0][0], worldStars[0][1]);
      ctx.lineTo(worldStars[5][0], worldStars[5][1]);
      ctx.stroke();
      ctx.setLineDash([]);

      for (var ki = 0; ki < worldStars.length; ki++) {
        var sp = starPolygon(worldStars[ki][0], worldStars[ki][1], 14 + (ki % 3) * 4, 6, 5, t + ki);
        S.drawCutoutPaperEdge(ctx, sp, ki % 2 === 0 ? "#fff6c8" : "#8cf2e4", "#14110d", { paperRim: 1.8, shadow: false });
      }
      ctx.restore();
    }

    // Foreground scissored stone/kelp corners from p18.jpg inside proscenium
    S.drawScissorCutout(
      ctx, pImg,
      108, 250, 102, 185,
      208 + pxFg * 0.5, 425, 130, 188,
      [[0.08, 0.12], [0.66, 0.08], [0.94, 0.46], [0.94, 0.96], [0.06, 0.96]],
      { haloWidth: 4.0 }
    );

    drawCourierChoreography(ctx, S, W, H, t, beat, state, {
      turkeyX: 118,
      turkeyY: 498,
      snailFloorY: 552,
      customTrout: beat.index === 2,
      saucerX: 640,
      saucerY: 108,
      beamY: 410
    });
    drawBallastAndLampMood(ctx, S, W, H, t, state, { darkStage: true });
    drawArchivalCueHeader(ctx, S, state, "P18 · 99 WAYS · LOTTE REINIGER STAGE", "— la malle étoilée sous la voûte", "#fbfaf7");

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 18);
  }

  // ==========================================================================
  // PORTHOLE #19 · #19 · Bilge ("duchamp-optic")
  // Bang Bang × S09 Takeo Igarashi ARAP × atlas-35.webp (Water Fountain)
  //   A: "A potato poked with bendy straws"
  //   B: "A giant spiky sea urchin"
  //   C: "A sneaky potato-eating creek bug"
  //   D: "A ten-antennaed potato satellite"
  // ==========================================================================

  var STRAW_COLORS_19 = [
    "#e85d4a", "#65b867", "#f2c94c", "#58a6d8", "#eb8a3e",
    "#e85d4a", "#65b867", "#f2c94c", "#58a6d8", "#eb8a3e"
  ];

  var POLY_POTATO_19 = [
    [0.24, 0.06], [0.56, 0.03], [0.84, 0.14], [0.95, 0.42],
    [0.92, 0.74], [0.76, 0.95], [0.42, 0.97], [0.15, 0.82],
    [0.05, 0.50], [0.10, 0.22]
  ];

  function drawArticulatedBendyStraw19(ctx, S, x0, y0, xElbow, yElbow, xTip, yTip, col, width, hasBubble, t, idx) {
    var q1 = limbQuad(x0, y0, xElbow, yElbow, width, width * 0.92);
    var q2 = limbQuad(xElbow, yElbow, xTip, yTip, width * 0.92, width * 0.82);

    S.drawCutoutPaperEdge(ctx, q1, "#fbfaf5", "#14110d", { paperRim: 2.0, shadow: true });
    S.drawCardboardPuppetPiece(ctx, q1, { tone: col, ribs: 2, shadow: false, pin: { x: x0, y: y0, r: 3.4, metal: "brass" } });

    S.drawCutoutPaperEdge(ctx, q2, "#fbfaf5", "#14110d", { paperRim: 2.0, shadow: true });
    S.drawCardboardPuppetPiece(ctx, q2, { tone: col, ribs: 2, shadow: false, pin: { x: xElbow, y: yElbow, r: 3.6, metal: "silver" } });

    if (hasBubble) {
      var bOff = ((t * 26 + idx * 17) % 36);
      ctx.fillStyle = "rgba(235, 250, 255, 0.85)";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(xTip + Math.sin(t * 4 + idx) * 4, yTip - bOff * 0.65, 4.8, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
  }

  function renderPortal19(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var u = beat.u;
    var plates = S.getPortalPlates(19);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.0 });

    // 1. Duchamp Engraved Optical Workshop Slate
    S.drawBolasBackdrop(ctx, W, H, "duchamp-optic", 19, t, state, {});

    var pxFar = S.parallaxX(0.25, t, state);
    var pxMid = S.parallaxX(0.55, t, state);
    var pyMid = S.parallaxY(0.55, t, state);

    // Rotating engraved Duchamp rotor dial rings on slate background
    ctx.save();
    ctx.translate(640 + pxFar, 330);
    ctx.rotate(t * 0.22);
    ctx.strokeStyle = "rgba(247, 221, 140, 0.15)";
    ctx.lineWidth = 2.0;
    ctx.setLineDash([16, 10]);
    ctx.beginPath();
    ctx.arc(0, 0, 238, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 178, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Plane 1: Foraged wire-harness & metal conduit apparatus crops from atlas-35.webp (Water Fountain)!
    S.drawScissorCutout(
      ctx, aImg,
      58, 48, 220, 360,
      36 + pxFar, 132, 195, 340,
      [[0.08, 0.05], [0.92, 0.04], [0.85, 0.48], [0.72, 0.96], [0.06, 0.94]],
      { haloWidth: 4.0, alpha: 0.85 }
    );
    S.drawScissorCutout(
      ctx, aImg,
      542, 168, 196, 126,
      1038 - pxFar, 224, 210, 132,
      [[0.04, 0.08], [0.96, 0.22], [0.96, 0.88], [0.04, 0.92]],
      { haloWidth: 4.0, alpha: 0.85 }
    );

    S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 625, aimX: 640, spread: 245, alpha: 0.17 });

    var cx = 640 + pxMid * 0.6;
    var cy = 334 + pyMid + S.wobble(t, 2.2, 6, 0.4);

    if (beat.index === 0) {
      // --- VARIATION I (A): "A potato poked with bendy straws" ---
      // Subtle wider straw-halo ghost behind, then 10 articulated split-pin bendy straws + crisp p19.jpg potato!
      for (var i = 0; i < 10; i++) {
        var ang = (i / 10) * TAU - Math.PI * 0.5;
        var rBase = 74;
        var sx0 = cx + Math.cos(ang) * (rBase * 0.78);
        var sy0 = cy + Math.sin(ang) * (rBase * 1.05);
        var bend = 0.52 * (i % 2 === 0 ? 1 : -1) + Math.sin(t * 3.2 + i) * 0.18;
        var ex = sx0 + Math.cos(ang) * 76;
        var ey = sy0 + Math.sin(ang) * 76;
        var tx = ex + Math.cos(ang + bend) * 62;
        var ty = ey + Math.sin(ang + bend) * 62;
        drawArticulatedBendyStraw19(ctx, S, sx0, sy0, ex, ey, tx, ty, STRAW_COLORS_19[i], 6.5, true, t, i);
      }

      S.drawScissorCutout(
        ctx, pImg,
        244, 212, 142, 202,
        cx - 95, cy - 128, 190, 256,
        POLY_POTATO_19,
        { haloWidth: 5.5, rot: Math.sin(t * 1.7) * 0.05 }
      );

      // Curious trout cutout from p19.jpg nosing the right straw
      S.drawScissorCutout(
        ctx, pImg,
        430, 265, 112, 74,
        895 + Math.sin(t * 2.5) * 10, 285, 165, 108,
        [[0.04, 0.52], [0.46, 0.12], [0.95, 0.06], [0.95, 0.94], [0.42, 0.88]],
        { haloWidth: 4.0 }
      );
    } else if (beat.index === 1) {
      // --- VARIATION II (B): "A giant spiky sea urchin" ---
      var jab = 1 + 0.18 * Math.abs(Math.sin(t * 7.5));

      // 16 Bristling Articulated Black & Crimson Sea-Urchin Spines!
      for (var ui = 0; ui < 16; ui++) {
        var uAng = (ui / 16) * TAU + Math.sin(t * 1.8) * 0.06;
        var ux0 = cx + Math.cos(uAng) * 66;
        var uy0 = cy + Math.sin(uAng) * 66;
        var len = (ui % 2 === 0 ? 158 : 118) * jab;
        var ux1 = cx + Math.cos(uAng) * (66 + len);
        var uy1 = cy + Math.sin(uAng) * (66 + len);
        var spinePts = limbQuad(ux0, uy0, ux1, uy1, 9.0, 1.2);
        S.drawCardboardPuppetPiece(ctx, spinePts, {
          tone: ui % 3 === 0 ? "#9e241b" : "#221d28",
          ribs: 2,
          pin: { x: ux0, y: uy0, r: 3.2, metal: "brass" }
        });
      }

      // Dark Violet-Tinted Potato/Urchin Core + Fierce Cut-Paper Glaring Eyes!
      S.drawScissorCutout(
        ctx, pImg,
        244, 212, 142, 202,
        cx - 98, cy - 102, 196, 204,
        POLY_POTATO_19,
        { filter: "litho", tint: "rgba(58, 22, 68, 0.52)", haloWidth: 5.0 }
      );
      S.drawCutoutPaperEdge(ctx, [[cx - 46, cy - 22], [cx - 10, cy - 8], [cx - 42, cy + 8]], "#f7dd8c", "#14110d", { paperRim: 2.0 });
      S.drawCutoutPaperEdge(ctx, [[cx + 46, cy - 22], [cx + 10, cy - 8], [cx + 42, cy + 8]], "#f7dd8c", "#14110d", { paperRim: 2.0 });
    } else if (beat.index === 2) {
      // --- VARIATION III (C): "A sneaky potato-eating creek bug" ---
      // Torn-paper mossy creek boulder ledge for the bug to scuttle across!
      S.drawTornPaperFlat(ctx, 250, 468, 660, 74, { fill: "#3c4f44", paperColor: "#fbfaf5", deckle: 6.0 });

      var bugX = 535 + Math.sin(t * 2.8) * 38;
      var bugY = 382 + Math.abs(Math.sin(t * 9.0)) * -6;

      // 6 Jointed Bendy-Straw Insect Legs solved with 2-bone IK walking on the rock!
      for (var leg = 0; leg < 6; leg++) {
        var sideL = leg < 3 ? -1 : 1;
        var slot = (leg % 3) - 1;
        var hipX = bugX + slot * 52;
        var hipY = bugY + 36;
        var stepPhase = t * 9.0 + leg * 1.1;
        var footX = hipX + sideL * 42 + slot * 28 + Math.sin(stepPhase) * 18;
        var footY = 472 - Math.max(0, Math.cos(stepPhase)) * 18;
        var lik = S.solveIK2(hipX, hipY, 58, 62, footX, footY, -1);
        drawArticulatedBendyStraw19(ctx, S, hipX, hipY, lik.jx, lik.jy, lik.ex, lik.ey, STRAW_COLORS_19[leg], 6.0, false, t, leg);
      }

      // Horizontal Potato Thorax Cutout + 2 Twitching Bendy-Straw Antennae + Chewing Mandibles!
      S.drawScissorCutout(
        ctx, pImg,
        244, 212, 142, 202,
        bugX - 92, bugY - 115, 184, 230,
        POLY_POTATO_19,
        { haloWidth: 5.5, rot: Math.PI * 0.48 }
      );

      // Antennae + Bug Eyes + Chewing Mandibles on right snout of bug
      for (var ai = -1; ai <= 1; ai += 2) {
        drawArticulatedBendyStraw19(
          ctx, S,
          bugX + 95, bugY - 18 + ai * 14,
          bugX + 145, bugY - 58 + ai * 18,
          bugX + 185 + Math.sin(t * 8 + ai) * 10, bugY - 42 + ai * 26,
          ai < 0 ? "#f2c94c" : "#e85d4a", 5.2, false, t, 8 + ai
        );
      }
      var chew = Math.abs(Math.sin(t * 11)) * 0.35;
      S.drawCardboardPuppetPiece(
        ctx,
        [[bugX + 98, bugY + 4], [bugX + 138, bugY - 8 - chew * 18], [bugX + 126, bugY + 14]],
        { tone: "#2e241b", pin: { x: bugX + 102, y: bugY + 6, r: 3.4, metal: "brass" } }
      );
      S.drawCardboardPuppetPiece(
        ctx,
        [[bugX + 98, bugY + 18], [bugX + 138, bugY + 30 + chew * 18], [bugX + 126, bugY + 12]],
        { tone: "#2e241b", pin: { x: bugX + 102, y: bugY + 16, r: 3.4, metal: "brass" } }
      );
      // Nibbled golden potato slice beside its jaws
      S.drawCutoutPaperEdge(
        ctx,
        [[bugX + 142, bugY - 4], [bugX + 178, bugY - 12], [bugX + 184, bugY + 24], [bugX + 144, bugY + 28], [bugX + 154, bugY + 10]],
        "#f3d184",
        "#14110d",
        { paperRim: 2.0 }
      );
    } else {
      // --- VARIATION IV (D): "A ten-antennaed potato satellite" ---
      var satX = 640;
      var satY = 392 + Math.sin(t * 2.4) * 9;
      var spin = t * 0.55;

      // EXACTLY 10 Straight Dipole Bendy-Straw Satellite Antennas with Blinking Beacons & Radio Arcs!
      for (var sa = 0; sa < 10; sa++) {
        var sAng = spin + (sa / 10) * TAU;
        var ax0 = satX + Math.cos(sAng) * 68;
        var ay0 = satY + Math.sin(sAng) * 68;
        var axMid = satX + Math.cos(sAng) * 124;
        var ayMid = satY + Math.sin(sAng) * 124;
        var axTip = satX + Math.cos(sAng) * 178;
        var ayTip = satY + Math.sin(sAng) * 178;
        drawArticulatedBendyStraw19(ctx, S, ax0, ay0, axMid, ayMid, axTip, ayTip, STRAW_COLORS_19[sa], 5.5, false, t, sa);

        // Blinking telemetry beacon sphere at antenna tip
        var blink = 0.35 + 0.65 * Math.max(0, Math.sin(t * 8.5 + sa * 1.2));
        ctx.fillStyle = sa % 2 === 0 ? "#d42a1e" : "#0f8f80";
        ctx.strokeStyle = "#fbfaf7";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(axTip, ayTip, 5.5 + blink * 2.5, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }

      // Sputnik Potato Satellite Body + Silver Foil Equator Collar with Brass Split-Pins!
      S.drawScissorCutout(
        ctx, pImg,
        244, 212, 142, 202,
        satX - 86, satY - 105, 172, 210,
        POLY_POTATO_19,
        { haloWidth: 5.0, rot: spin * 0.4 }
      );
      S.drawCardboardPuppetPiece(
        ctx,
        [[satX - 88, satY - 14], [satX + 88, satY - 14], [satX + 82, satY + 14], [satX - 82, satY + 14]],
        {
          tone: "#c6ccd2",
          ribs: 1,
          pins: [[satX - 58, satY], [satX - 20, satY], [satX + 20, satY], [satX + 58, satY]]
        }
      );

      // Expanding concentric radio ping arcs rising toward Alien Saucer
      for (var rp = 0; rp < 3; rp++) {
        var ru = ((t * 0.85 + rp / 3) % 1);
        ctx.strokeStyle = "rgba(15, 143, 128, " + ((1 - ru) * 0.75).toFixed(3) + ")";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(satX, satY - 75 - ru * 130, 26 + ru * 70, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
    }

    drawCourierChoreography(ctx, S, W, H, t, beat, state, {
      turkeyX: 126,
      turkeyY: 498,
      snailFloorY: 552,
      troutX: 1020,
      troutY: 392,
      saucerX: 640,
      saucerY: 102,
      beamY: 392
    });
    drawBallastAndLampMood(ctx, S, W, H, t, state, { darkStage: true });
    drawArchivalCueHeader(ctx, S, state, "P19 · BANG BANG · ARAP SLATE RIG", "— dix pailles articulées dans un tubercule", "#fbfaf7");

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 19);
  }

  // ==========================================================================
  // PORTHOLE #20 · #20 · Dome ("perec-stage")
  // La Belle Hortense × S18 Cartoon Saloon × atlas-41.webp (Song of the Sea)
  //   A: "A colorful pebble glass window"
  //   B: "A grand sunken royal palace"
  //   C: "A glowing angel in a jar"
  //   D: "A crystal mothership warp beam"
  // ==========================================================================

  var SEXTINE_JEWELS_20 = [
    "#d42a1e", "#f3c74b", "#0f8f80", "#2a5ca8", "#9b4dca", "#7ed6c5"
  ];
  var SEXTINE_PERMS_20 = [
    [0, 1, 2, 3, 4, 5],
    [5, 0, 4, 1, 3, 2],
    [2, 5, 3, 0, 1, 4],
    [4, 2, 1, 5, 0, 3]
  ];

  var POLY_ARCH_20 = [
    [0.50, 0.02], [0.78, 0.14], [0.94, 0.38], [0.95, 0.96],
    [0.05, 0.96], [0.06, 0.38], [0.22, 0.14]
  ];

  function drawCathedralShafts20(ctx, cx, topY, count, spread, t, colA, colB) {
    ctx.save();
    for (var i = 0; i < count; i++) {
      var off = (i - (count - 1) * 0.5) * spread;
      var sway = Math.sin(t * 0.9 + i * 1.1) * 24;
      var g = ctx.createLinearGradient(cx, topY, cx + off + sway, 620);
      g.addColorStop(0.0, i % 2 === 0 ? colA : colB);
      g.addColorStop(1.0, "rgba(15, 143, 128, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx + off * 0.22 - 18, topY);
      ctx.lineTo(cx + off * 0.22 + 18, topY);
      ctx.lineTo(cx + off + sway + 54, 620);
      ctx.lineTo(cx + off + sway - 54, 620);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function renderPortal20(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var u = beat.u;
    var plates = S.getPortalPlates(20);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.0 });

    // 1. Carved Perec Sandstone Lancet Proscenium opening onto Song of the Sea blue chamber!
    S.drawBolasBackdrop(ctx, W, H, "perec-stage", 20, t, state, {
      openX: 215,
      openY: 68,
      openW: 850,
      openH: 552,
      doors: true
    });

    var pxFar = S.parallaxX(0.24, t, state);
    var pyFar = S.parallaxY(0.24, t, state);
    var pxMid = S.parallaxX(0.54, t, state);
    var pyMid = S.parallaxY(0.54, t, state);

    // Plane 1: Luminous blue spiral-stair lighthouse plate from atlas-41.webp (Song of the Sea)
    S.drawScissorCutout(
      ctx, aImg,
      210, 8, 520, 400,
      295 + pxFar, 80 + pyFar, 690, 445,
      [[0.03, 0.04], [0.97, 0.04], [0.95, 0.96], [0.05, 0.96]],
      { haloWidth: 4.0, alpha: 0.82 }
    );

    var cx = 640 + pxMid * 0.5;
    var perm = SEXTINE_PERMS_20[beat.index] || SEXTINE_PERMS_20[0];

    if (beat.index === 0) {
      // --- VARIATION I (A): "A colorful pebble glass window" ---
      drawCathedralShafts20(ctx, cx, 145, 5, 95, t, "rgba(126, 238, 218, 0.28)", "rgba(247, 221, 140, 0.24)");

      // Real Gothic Pebble-Mosaic Stained-Glass Arch cropped from p20.jpg!
      S.drawScissorCutout(
        ctx, pImg,
        208, 106, 226, 294,
        cx - 175, 98 + pyMid, 350, 425,
        POLY_ARCH_20,
        { haloWidth: 6.0 }
      );

      // 6 Belle Hortense Sextine Jewel Pebbles orbiting the Gothic rose window
      for (var ji = 0; ji < 6; ji++) {
        var ja = (ji / 6) * TAU + t * 0.4;
        var jx = cx + Math.cos(ja) * 52;
        var jy = 212 + pyMid + Math.sin(ja) * 52;
        S.drawCutoutPaperEdge(
          ctx,
          [[jx - 10, jy - 7], [jx + 10, jy - 7], [jx + 12, jy + 7], [jx - 12, jy + 7]],
          SEXTINE_JEWELS_20[perm[ji]],
          "#14110d",
          { paperRim: 2.0, shadow: false }
        );
      }

      // Foreground Trout Choir cutout cropped from p20.jpg!
      S.drawScissorCutout(
        ctx, pImg,
        166, 316, 308, 112,
        cx - 245 + S.parallaxX(0.82, t, state), 432 + Math.sin(t * 2.2) * 5, 490, 158,
        [[0.03, 0.22], [0.50, 0.06], [0.97, 0.22], [0.95, 0.92], [0.50, 0.96], [0.05, 0.92]],
        { haloWidth: 4.5 }
      );
    } else if (beat.index === 1) {
      // --- VARIATION II (B): "A grand sunken royal palace" ---
      drawCathedralShafts20(ctx, cx, 130, 5, 110, t, "rgba(247, 221, 140, 0.30)", "rgba(212, 42, 30, 0.20)");

      // Twin Crenellated Royal Palace Towers + Swaying Crimson-Gold Silk Banners!
      for (var ts = -1; ts <= 1; ts += 2) {
        var tx = cx + ts * 238;
        S.drawCardboardPuppetPiece(
          ctx,
          [[tx - 58, 138], [tx + 58, 138], [tx + 66, 522], [tx - 66, 522]],
          { tone: "#8f7e68", ribs: 5, pins: [[tx, 210], [tx, 390]] }
        );
        // Battlement merlons
        for (var m = -1; m <= 1; m++) {
          S.drawCutoutPaperEdge(
            ctx,
            [[tx + m * 36 - 13, 110], [tx + m * 36 + 13, 110], [tx + m * 36 + 13, 142], [tx + m * 36 - 13, 142]],
            "#a8967c",
            "#14110d",
            { paperRim: 2.0 }
          );
        }
        // Swaying Royal Silk Banner with Sextine Jewel Emblem
        var swayB = Math.sin(t * 3.2 + ts) * 14;
        S.drawCutoutPaperEdge(
          ctx,
          [[tx - 24, 185], [tx + 24, 185], [tx + 26 + swayB, 345], [tx + swayB, 378], [tx - 26 + swayB, 345]],
          "#9e241b",
          "#f3c74b",
          { paperRim: 2.5 }
        );
      }

      // Central Stained-Glass Palace Throne Arch + Cut-Paper Golden Royal Crown on Cushion!
      S.drawScissorCutout(
        ctx, pImg,
        208, 106, 226, 294,
        cx - 148, 118 + pyMid, 296, 375,
        POLY_ARCH_20,
        { haloWidth: 5.5 }
      );

      // Velvet Throne Cushion + 5-Pointed Jeweled Royal Crown
      var crY = 468 + Math.sin(t * 2.8) * 4;
      S.drawCutoutPaperEdge(ctx, [[cx - 72, crY], [cx + 72, crY], [cx + 82, crY + 34], [cx - 82, crY + 34]], "#7e1d18", "#14110d", { paperRim: 3.0 });
      S.drawCutoutPaperEdge(
        ctx,
        [
          [cx - 56, crY + 2], [cx - 64, crY - 48], [cx - 30, crY - 22],
          [cx, crY - 62], [cx + 30, crY - 22], [cx + 64, crY - 48], [cx + 56, crY + 2]
        ],
        "#f3c74b",
        "#14110d",
        { paperRim: 3.0 }
      );
      for (var cj = 0; cj < 3; cj++) {
        ctx.fillStyle = SEXTINE_JEWELS_20[perm[cj]];
        ctx.beginPath();
        ctx.arc(cx + (cj - 1) * 32, crY - 14, 6.5, 0, TAU);
        ctx.fill();
      }
    } else if (beat.index === 2) {
      // --- VARIATION III (C): "A glowing angel in a jar" ---
      var jarX = 565 + pxMid * 0.4;
      var jarY = 348 + Math.sin(t * 2.1) * 6;

      // Warm celestial halo behind Mason Jar
      ctx.save();
      var ag = ctx.createRadialGradient(jarX, jarY, 22, jarX, jarY, 210);
      ag.addColorStop(0.0, "rgba(255, 244, 185, 0.62)");
      ag.addColorStop(0.55, "rgba(126, 238, 218, 0.28)");
      ag.addColorStop(1.0, "rgba(15, 143, 128, 0)");
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.arc(jarX, jarY, 210, 0, TAU);
      ctx.fill();
      ctx.restore();

      // Translucent Glass Mason Jar Contour + Ribbed Brass Screw Lid!
      S.drawCutoutPaperEdge(
        ctx,
        [
          [jarX - 88, jarY - 178], [jarX + 88, jarY - 178],
          [jarX + 128, jarY - 132], [jarX + 126, jarY + 158],
          [jarX + 98, jarY + 186], [jarX - 98, jarY + 186],
          [jarX - 126, jarY + 158], [jarX - 128, jarY - 132]
        ],
        "rgba(210, 244, 240, 0.34)",
        "#14110d",
        { paperRim: 5.5 }
      );
      S.drawCardboardPuppetPiece(
        ctx,
        [[jarX - 96, jarY - 214], [jarX + 96, jarY - 214], [jarX + 96, jarY - 172], [jarX - 96, jarY - 172]],
        { tone: "#c99842", ribs: 3, pins: [[jarX - 62, jarY - 193], [jarX + 62, jarY - 193]] }
      );

      // Radiant Stained-Glass Angel hovering inside the Jar with Articulated Split-Pin Wings!
      var wingBeat = Math.sin(t * 5.2) * 0.28;
      for (var ws = -1; ws <= 1; ws += 2) {
        ctx.save();
        ctx.translate(jarX + ws * 16, jarY - 26);
        ctx.scale(ws, 1);
        ctx.rotate(-0.18 + wingBeat);
        S.drawCutoutPaperEdge(
          ctx,
          [[0, 0], [88, -58], [98, -12], [78, 34], [42, 54], [6, 26]],
          "#a8f0e4",
          "#14110d",
          { paperRim: 2.5 }
        );
        S.drawSplitPin(ctx, 4, 4, 4.0, { metal: "brass" });
        ctx.restore();
      }

      // Rose-Window Halo + Stained-Glass Robe cropped from p20.jpg!
      S.drawScissorCutout(
        ctx, pImg,
        268, 152, 106, 212,
        jarX - 48, jarY - 96, 96, 206,
        [[0.50, 0.02], [0.88, 0.24], [0.96, 0.96], [0.04, 0.96], [0.12, 0.24]],
        { haloWidth: 3.5 }
      );
      ctx.strokeStyle = "#f3c74b";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(jarX, jarY - 82, 26, 0, TAU);
      ctx.stroke();

      // Glass specular highlight arcs on front of jar
      ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(jarX - 96, jarY - 118);
      ctx.lineTo(jarX - 96, jarY + 124);
      ctx.stroke();
    } else {
      // --- VARIATION IV (D): "A crystal mothership warp beam" ---
      // Dazzling Cartoon Saloon sacred-geometry Crystal Warp Column connecting Alien Saucer through Gothic Arch!
      ctx.save();
      var wg = ctx.createLinearGradient(640 - 115, 110, 640 + 115, 110);
      wg.addColorStop(0.0, "rgba(15, 143, 128, 0)");
      wg.addColorStop(0.25, "rgba(15, 143, 128, 0.52)");
      wg.addColorStop(0.50, "rgba(255, 248, 220, 0.85)");
      wg.addColorStop(0.75, "rgba(212, 42, 30, 0.48)");
      wg.addColorStop(1.0, "rgba(212, 42, 30, 0)");
      ctx.fillStyle = wg;
      ctx.fillRect(640 - 125, 110, 250, 508);
      ctx.restore();

      // Pebble Gothic Arch framing the blazing crystal warp column
      S.drawScissorCutout(
        ctx, pImg,
        208, 106, 226, 294,
        640 - 178, 145, 356, 405,
        POLY_ARCH_20,
        { filter: "cyan", haloWidth: 5.5, alpha: 0.88 }
      );

      // 6 Levitating Sextine Crystal Shards spinning in harmonic hexagon rings up the warp beam!
      for (var ci = 0; ci < 6; ci++) {
        var ca = t * 2.2 + (ci / 6) * TAU;
        var shardX = 640 + Math.cos(ca) * 108;
        var shardY = 345 + Math.sin(ca) * 34 + ((ci % 2 === 0 ? -1 : 1) * 48);
        S.drawCutoutPaperEdge(
          ctx,
          [[shardX, shardY - 26], [shardX + 16, shardY], [shardX, shardY + 26], [shardX - 16, shardY]],
          SEXTINE_JEWELS_20[perm[ci]],
          "#fbfaf7",
          { paperRim: 2.5 }
        );
      }
    }

    drawCourierChoreography(ctx, S, W, H, t, beat, state, {
      turkeyX: 118,
      turkeyY: 498,
      snailFloorY: 552,
      troutX: 985,
      troutY: 398,
      saucerX: 640,
      saucerY: 98,
      beamY: 480,
      beamSpread: 180
    });
    drawBallastAndLampMood(ctx, S, W, H, t, state, { darkStage: true });
    drawArchivalCueHeader(ctx, S, state, "P20 · LA BELLE HORTENSE · SEXTINE LANCET", "— six galets de verre sous l’ogive", "#fbfaf7");

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 20);
  }

  // ---------- Scene Registry Export ----------
  var SCENES = {
    16: {
      id: 16,
      station: "#16 · Aft",
      duration: 16.0,
      bolasStyle: "daumier-litho",
      preload: function () { var S = getStage(); return S ? S.preloadPortalPlates(16) : Promise.resolve(); },
      render: renderPortal16
    },
    17: {
      id: 17,
      station: "#17 · Dorsal",
      duration: 16.0,
      bolasStyle: "daumier-litho",
      preload: function () { var S = getStage(); return S ? S.preloadPortalPlates(17) : Promise.resolve(); },
      render: renderPortal17
    },
    18: {
      id: 18,
      station: "#18 · Vent",
      duration: 16.0,
      bolasStyle: "perec-stage",
      preload: function () { var S = getStage(); return S ? S.preloadPortalPlates(18) : Promise.resolve(); },
      render: renderPortal18
    },
    19: {
      id: 19,
      station: "#19 · Bilge",
      duration: 16.0,
      bolasStyle: "duchamp-optic",
      preload: function () { var S = getStage(); return S ? S.preloadPortalPlates(19) : Promise.resolve(); },
      render: renderPortal19
    },
    20: {
      id: 20,
      station: "#20 · Dome",
      duration: 16.0,
      bolasStyle: "perec-stage",
      preload: function () { var S = getStage(); return S ? S.preloadPortalPlates(20) : Promise.resolve(); },
      render: renderPortal20
    }
  };

  if (root) {
    root.PORTAL_REMAKE_SCENES = root.PORTAL_REMAKE_SCENES || {};
    Object.keys(SCENES).forEach(function (k) {
      root.PORTAL_REMAKE_SCENES[k] = SCENES[k];
    });
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = SCENES;
  }
})(typeof window !== "undefined" ? window : globalThis);
