/* ============================================================================
 * Turkey Sub · V2 Multi-SCION Rostrum Remake — Crew 05 (#21–#25)
 * File: portals/remake-05.js
 *
 * Authentic BOLAS Oulipo Screening Room & Multi-SCION Cutout Cinema
 * (1280×720, 24fps, 16.0s = 384 frames; 4.0s per variation: A · B · C · D):
 *   - #21 · Fwd     : perec-stage        · Renzo e Luciana × S19 MohoRig (S33/S43/S48)
 *   - #22 · Trim    : queneau-rostrum    · Exercices de style Animated × S14 Pose2Pose (S32/S33/S47)
 *   - #23 · Scope B : duchamp-optic      · Ouphopo × S07 Peter Foldès (S35/S41/S44)
 *   - #24 · Rudder  : cardboard-parallax · Outrapo × S23 SpineIK (S33/S34/S44)
 *   - #25 · Lock    : queneau-rostrum    · Quatre-vingt-quinze × S24 Live2D (S45/S46/S41)
 *
 * STRICT PAELEO BLIND INVARIANT:
 *   When state && state.showCaptions === false, emits ZERO fillText/strokeText
 *   calls anywhere on canvas and renders ZERO text glyphs on props.
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var DURATION = 16.0;

  function stage() {
    return (root && root.SCION_STAGE) || (typeof require === "function" ? require("./scion-stage.js") : null);
  }

  // Kick off async plate preloading for #21..#25 as soon as script loads in browser
  var _bootStage = stage();
  if (_bootStage && _bootStage.preloadPortalPlates) {
    _bootStage.preloadPortalPlates([21, 22, 23, 24, 25]);
  }

  // ---------- Shared Cutout & Cardboard Geometry Helpers (100% Vector / Plate, 0 Text) ----------

  // Normalized [0..1] crop wrapper around SCION_STAGE.drawScissorCutout so any source resolution maps cleanly
  function drawPlateFrac(ctx, S, img, fx, fy, fw, fh, dx, dy, dw, dh, polyPts, opts) {
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

  // Build tapered cardboard limb polygon between two joints (x0,y0) -> (x1,y1)
  function limbPolygon(x0, y0, x1, y1, w0, w1) {
    var dx = x1 - x0;
    var dy = y1 - y0;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len;
    var ny = dx / len;
    var ex = (dx / len) * (w0 * 0.35);
    var ey = (dy / len) * (w0 * 0.35);
    return [
      [x0 - ex + nx * w0, y0 - ey + ny * w0],
      [x1 + ex + nx * w1, y1 + ey + ny * w1],
      [x1 + ex - nx * w1, y1 + ey - ny * w1],
      [x0 - ex - nx * w0, y0 - ey - ny * w0]
    ];
  }

  // Draw a 2-bone IK split-pin cardboard limb using S.solveIK2 + S.drawCardboardPuppetPiece
  function drawIKCardboardLimb(ctx, S, x0, y0, l1, l2, tx, ty, bendDir, opts) {
    var cfg = opts || {};
    var ik = S.solveIK2(x0, y0, l1, l2, tx, ty, bendDir);
    var wHip = cfg.w0 || 11;
    var wKnee = cfg.w1 || 8.5;
    var wFoot = cfg.w2 || 6.5;

    S.drawCardboardPuppetPiece(
      ctx,
      limbPolygon(ik.x0, ik.y0, ik.jx, ik.jy, wHip, wKnee),
      { tone: cfg.upperTone || "#7f7e7a", ribs: 2, shadow: cfg.shadow !== false }
    );
    S.drawCardboardPuppetPiece(
      ctx,
      limbPolygon(ik.jx, ik.jy, ik.ex, ik.ey, wKnee, wFoot),
      {
        tone: cfg.lowerTone || "#9b9993",
        ribs: 2,
        shadow: cfg.shadow !== false,
        pins: [
          { x: ik.x0, y: ik.y0, r: cfg.pinR || 4.0, metal: cfg.metal || "brass" },
          { x: ik.jx, y: ik.jy, r: cfg.pinR || 3.8, metal: "silver" }
        ]
      }
    );
    return ik;
  }

  // Rising cut-paper creek bubbles (amplified when state.ballast is active)
  function drawPaperBubbles(ctx, S, t, state, anchors) {
    var extra = (state && state.ballast) ? 2 : 1;
    ctx.save();
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      var count = (a.n || 3) * extra;
      for (var k = 0; k < count; k++) {
        var u = ((t * (a.speed || 0.34) + k / count + i * 0.19) % 1);
        var bx = a.x + Math.sin(t * 2.1 + k * 1.7 + i) * (a.sway || 9);
        var by = S.lerp(a.y0, a.y1, u);
        var br = (a.r || 5.5) * (0.65 + 0.55 * (1 - u));
        var alpha = Math.sin(u * Math.PI) * 0.78;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#fbfaf5";
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(bx, by, br + 1.4, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(182, 234, 236, 0.72)";
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Canonical Beat B / Beat C / Interactive Snail Mail + Turkey + Trout Couriers
  function drawBeatCouriers(ctx, S, W, H, t, state, beat, cfg) {
    var c = cfg || {};
    if (beat.index === 1) {
      // Beat B: Turkey Cutaway Badge + Snail Mail Dispatch across rostrum sill
      var disp = S.smooth(0.02, 0.32, beat.u);
      S.drawTurkeyCutawayBadge(ctx, c.turkeyX || 116, c.turkeyY || 498, 0.96, t, { dispatch: disp });
      var snailU = (beat.snailT != null) ? beat.snailT : S.clamp((beat.u - 0.06) / 0.88, 0, 1);
      var sx = S.lerp(c.snailX0 || 205, c.snailX1 || 1035, snailU);
      var sy = (c.snailY || 534) - Math.sin(snailU * Math.PI) * 18;
      S.drawMailSnail(ctx, sx, sy, 1.22, t, { postcard: true, trail: true });
    } else if (beat.index === 2) {
      // Beat C: Brook Trout Witness + Mail Snail Climbing Right Frame with Emerald Reply Stamp
      var tx = (c.troutX || 995) + Math.sin(t * 1.7) * 14;
      var ty = (c.troutY || 365) + Math.cos(t * 2.1) * 8;
      S.drawBrookTrout(ctx, tx, ty, c.troutScale || 1.12, t, c.troutFlip !== false);

      var climbU = (beat.snailT != null) ? beat.snailT : S.clamp(beat.u * 0.95, 0, 1);
      var rx = c.climbX || 1172;
      var ry = S.lerp(c.climbY0 || 522, c.climbY1 || 205, climbU);
      S.drawMailSnail(ctx, rx, ry, 1.14, t, {
        rot: -Math.PI * 0.5,
        postcard: true,
        hasReply: true,
        trail: true
      });
    } else if (beat.snailActive) {
      // Live interactive Snail Mail scrub in Beat A or D
      var su = (beat.snailT != null) ? beat.snailT : ((t * 0.22) % 1);
      S.drawMailSnail(ctx, S.lerp(185, 1080, su), 532, 1.16, t, {
        postcard: true,
        hasReply: beat.index >= 2,
        hasAlienStamp: beat.index === 3
      });
    }
  }

  // Subtle art-house archival take stamp at top-left (strictly skipped in blind mode!)
  function drawArchivalTakeHeader(ctx, S, state, beat, codeStr, darkBg) {
    if (S.isBlind(state)) return;
    ctx.save();
    var pillTxt = codeStr + " · prise " + beat.roman + " · " + (
      beat.index === 0 ? "rivière" : (beat.index === 1 ? "dinde" : (beat.index === 2 ? "truite" : "écoute"))
    );
    ctx.font = '600 12px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = darkBg ? "rgba(20, 17, 13, 0.62)" : "rgba(251, 250, 247, 0.78)";
    ctx.fillRect(22, 16, 232, 24);
    ctx.strokeStyle = darkBg ? "rgba(251, 250, 247, 0.26)" : "rgba(20, 17, 13, 0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(22, 16, 232, 24);
    ctx.fillStyle = darkBg ? "#f3efe6" : "#14110d";
    S.safeText(ctx, pillTxt, 31, 28.5, state);
    ctx.restore();
  }

  // ============================================================================
  // PORTHOLE #21 · Fwd
  // Style: "perec-stage" (Carved Sandstone Masonry Proscenium & Hinged Shutters)
  // Stack: Renzo e Luciana (Calvino/Monicelli) × S19 MohoRig + S33 IK + S43 Graph + S48 FSM
  // Options:
  //   A: Five big trout tapping bus screens
  //   B: Enemy fish hacking our radar
  //   C: A late morning creek city bus
  //   D: Giant hive-mind telepathy Titans
  // ============================================================================
  function renderPortal21(ctx, W, H, rawT, state) {
    var S = stage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(21);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // Wide carved Perec sandstone doorway opening onto the flooded transit tunnel
    S.drawBolasBackdrop(ctx, W, H, "perec-stage", 21, t, state, {
      openX: 146,
      openY: 72,
      openW: 988,
      openH: 526,
      doors: true
    });

    var pxBack = S.parallaxX(0.22, t, state);
    var pyBack = S.parallaxY(0.22, t, state);
    var pxMid = S.parallaxX(0.55, t, state);
    var pyMid = S.parallaxY(0.55, t, state);
    var pxFore = S.parallaxX(0.95, t, state);
    var pyFore = S.parallaxY(0.95, t, state);

    // Plane 1 (Deep Recess): Scissor-cut upper bus ceiling & aqua windows from atlas-01.webp + water caustics
    ctx.save();
    ctx.beginPath();
    ctx.rect(146, 72, 988, 526);
    ctx.clip();

    drawPlateFrac(
      ctx, S, aImg,
      0.04, 0.04, 0.92, 0.42,
      205 + pxBack, 86 + pyBack, 380, 195,
      [[0.04, 0.06], [0.96, 0.03], [0.98, 0.92], [0.02, 0.96]],
      { filter: beat.index === 3 ? "cyan" : "sepia", haloWidth: 4, alpha: 0.85, rot: -0.02 }
    );
    drawPlateFrac(
      ctx, S, aImg,
      0.48, 0.06, 0.50, 0.50,
      680 + pxBack, 88 + pyBack, 395, 205,
      [[0.03, 0.05], [0.97, 0.04], [0.95, 0.95], [0.05, 0.93]],
      { filter: "cyan", haloWidth: 4, alpha: 0.82, rot: 0.018 }
    );
    S.drawWaterCaustics(ctx, W, 560, t, 0.16);

    // Plane 2 (Midplane): Sunken Yellow Creek Bus Coach (Torn-Paper Flat + Real p21.jpg Chassis Strip)
    var busJoltY = beat.index === 2
      ? Math.abs(Math.sin(t * 7.5)) * -10 + S.springImpulse(beat.localT, 0.2, 14, 3.5) * 8
      : (beat.index === 3 ? -26 + Math.sin(t * 1.8) * 10 : Math.sin(t * 1.4) * 2.5);
    var busX = 205 + pxMid;
    var busY = 196 + pyMid + busJoltY;
    var busW = 860;
    var busH = 278;

    ctx.save();
    ctx.translate(busX, busY);

    // Torn-deckle yellow transit coach body
    S.drawTornPaperFlat(ctx, 0, 0, busW, busH, {
      fill: beat.index === 1 ? "#b68834" : (beat.index === 3 ? "#4b4468" : "#dfaa3b"),
      paperColor: "#fbfaf5",
      deckle: 6.5,
      stroke: "#14110d",
      seed: 21.4
    });

    // Roof rib & lower rub-rails in mottled dark cardboard
    S.drawCardboardPuppetPiece(ctx, [[-6, -12], [busW + 6, -12], [busW - 14, 18], [14, 18]], {
      tone: beat.index === 3 ? "#6d5b8c" : "#c9922c",
      ribs: 1
    });
    S.drawCardboardPuppetPiece(ctx, [[8, 198], [busW - 8, 198], [busW - 8, 214], [8, 214]], {
      tone: "#2b2a27",
      ribs: 1,
      shadow: false
    });

    // Real scissor-cut lower yellow bus wheel-arch crop from portholes/p21.jpg
    drawPlateFrac(
      ctx, S, pImg,
      0.23, 0.50, 0.56, 0.18,
      36, 196, 680, 74,
      [[0.02, 0.08], [0.98, 0.05], [0.96, 0.94], [0.03, 0.92]],
      { haloWidth: 3.5, filter: beat.index === 3 ? "cyan" : "none", alpha: 0.92 }
    );

    // Beat C ("A late morning creek city bus"): Folding accordion paper doors + urgent schedule clock + rolling split-pin wheels!
    var wheelRot = beat.index === 2 ? t * 7.8 : t * 0.6;
    var wheelXs = [165, 625];
    for (var wi = 0; wi < 2; wi++) {
      var wx = wheelXs[wi];
      var wy = busH + 4;
      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(wheelRot);
      S.drawCutoutPaperEdge(
        ctx,
        [[-44, -14], [-18, -42], [18, -42], [44, -14], [44, 18], [18, 42], [-18, 42], [-44, 18]],
        "#2f3133",
        "#14110d",
        { paperRim: 3.5 }
      );
      S.drawCardboardPuppetPiece(ctx, [[-22, -8], [0, -24], [22, -8], [22, 12], [0, 24], [-22, 12]], {
        tone: "#8a8984",
        ribs: 1,
        pin: { x: 0, y: 0, r: 5.5, metal: "brass" }
      });
      ctx.restore();
    }

    if (beat.index === 2) {
      // Accordion folding transit door at right front of bus + urgent late-morning clock dial on roof!
      var doorOpen = 0.5 + 0.45 * Math.sin(t * 3.2);
      S.drawCardboardPuppetPiece(ctx, [[756, 36], [842, 36], [842, 252], [756, 252]], {
        tone: "#1e2729",
        ribs: 2
      });
      S.drawCardboardPuppetPiece(ctx, [[758, 40], [758 + 34 * (1 - doorOpen * 0.6), 40], [758 + 34 * (1 - doorOpen * 0.6), 248], [758, 248]], {
        tone: "#d49b35",
        pins: [[762, 52], [762, 236]]
      });
      // Roof transit clock (pure vector hands, 0 text!)
      ctx.save();
      ctx.translate(430, -26);
      S.drawCutoutPaperEdge(ctx, [[-28, -28], [28, -28], [28, 28], [-28, 28]], "#fbfaf5", "#d42a1e", { paperRim: 3 });
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, TAU);
      ctx.moveTo(0, 0); ctx.lineTo(10, -4);
      ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t * 9) * 15, Math.sin(t * 9) * 15);
      ctx.stroke();
      S.drawSplitPin(ctx, 0, 0, 3.2, { metal: "brass" });
      ctx.restore();
    }

    // 5 Carved Window Bays with 5 Articulated Trout Commuters + IK Screen-Tapping Fins
    for (var i = 0; i < 5; i++) {
      var winX = 34 + i * 142;
      var winY = 34;
      var winW = 126;
      var winH = 148;

      // Dark window recess
      ctx.fillStyle = beat.index === 1 ? "#0c1f24" : (beat.index === 3 ? "#19132b" : "#1c4a52");
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 3.2;
      ctx.fillRect(winX, winY, winW, winH);
      ctx.strokeRect(winX, winY, winW, winH);

      // Beat D: Titan levitation offset
      var titanLift = beat.index === 3 ? (-22 - Math.sin(t * 2.6 + i * 0.9) * 10) : 0;
      var titanScale = beat.index === 3 ? 1.16 : 1.0;

      ctx.save();
      ctx.translate(winX + winW * 0.5, winY + winH * 0.62 + titanLift);
      ctx.scale(titanScale, titanScale);

      // Scissor-cut real trout passenger crop from p21.jpg (windows 0..4) paired with atlas-01 detail
      var srcFx = 0.22 + i * 0.115;
      drawPlateFrac(
        ctx, S, (i % 2 === 1 && aImg) ? aImg : pImg,
        (i % 2 === 1 && aImg) ? 0.06 : srcFx,
        (i % 2 === 1 && aImg) ? 0.44 : 0.32,
        (i % 2 === 1 && aImg) ? 0.64 : 0.115,
        (i % 2 === 1 && aImg) ? 0.34 : 0.17,
        -52, -62, 78, 86,
        [[0.08, 0.08], [0.92, 0.05], [0.96, 0.92], [0.06, 0.95]],
        {
          haloWidth: 3.2,
          filter: beat.index === 3 ? "cyan" : "none",
          rot: Math.sin(t * 2.4 + i * 0.8) * 0.05
        }
      );

      // Cardboard commuter jacket shoulder
      S.drawCardboardPuppetPiece(ctx, [[-44, 14], [-8, 6], [6, 48], [-48, 48]], {
        tone: beat.index === 1 ? "#3c4b4e" : (beat.index === 3 ? "#6c558e" : "#4b6b78"),
        ribs: 1
      });

      // Screen / Device held on right side of each window (Collage Graph Rewriting S43 across A/B/C/D!)
      var scrX = 28;
      var scrY = -4 + Math.sin(t * 3.1 + i) * 2.5;
      ctx.save();
      ctx.translate(scrX, scrY);
      ctx.rotate(-0.18);

      if (beat.index === 1) {
        // Beat B: Enemy Radar Hacking Console (glowing emerald/crimson radar sweep disk, 0 text!)
        S.drawCutoutPaperEdge(ctx, [[-22, -26], [22, -26], [22, 26], [-22, 26]], "#10241e", "#d42a1e", { paperRim: 2.5 });
        ctx.strokeStyle = "#39ff9f";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, TAU);
        ctx.arc(0, 0, 8, 0, TAU);
        var swAng = t * 5.2 + i * 0.9;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(swAng) * 15, Math.sin(swAng) * 15);
        ctx.stroke();
        ctx.fillStyle = "#ff4238";
        ctx.beginPath();
        ctx.arc(5, -6, 2.6, 0, TAU);
        ctx.fill();
      } else if (beat.index === 2) {
        // Beat C: Punched yellow paper bus transfer ticket
        S.drawCutoutPaperEdge(ctx, [[-18, -24], [18, -24], [18, 24], [-18, 24]], "#fae194", "#14110d", { paperRim: 2.2 });
        ctx.fillStyle = "#d42a1e";
        ctx.fillRect(-12, -16, 24, 5);
        ctx.fillStyle = "#14110d";
        ctx.beginPath();
        ctx.arc(0, 4, 3.5, 0, TAU);
        ctx.arc(0, 14, 3.5, 0, TAU);
        ctx.fill();
      } else if (beat.index === 3) {
        // Beat D: Glowing Floating Telepathy Crystal Orb
        ctx.fillStyle = "rgba(124, 232, 255, 0.85)";
        ctx.strokeStyle = "#fbfaf5";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, -4, 16 + Math.sin(t * 6 + i) * 2.5, 0, TAU);
        ctx.fill();
        ctx.stroke();
      } else {
        // Beat A: Glowing Aqua Bus Screen Tablet (matching p21.jpg!)
        S.drawCutoutPaperEdge(ctx, [[-18, -24], [18, -24], [18, 24], [-18, 24]], "#6cf0ff", "#14110d", { paperRim: 2.5 });
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.fillRect(-11, -16, 22, 6);
        ctx.fillRect(-11, -5, 15, 5);
      }
      ctx.restore();

      // 2-Bone IK Split-Pin Fin tapping the screen rhythmically!
      var tapPulse = Math.max(0, Math.sin(t * 7.5 + i * 1.25));
      var targetX = scrX - 10 + tapPulse * 9;
      var targetY = scrY + 4 - tapPulse * 5;
      drawIKCardboardLimb(ctx, S, -22, 20, 26, 24, targetX, targetY, 1, {
        w0: 8.5,
        w1: 6.5,
        w2: 5.0,
        upperTone: "#8f9c8a",
        lowerTone: "#b87458",
        pinR: 3.4
      });

      // Beat B spy antenna / Beat D glowing third-eye crown
      if (beat.index === 1) {
        ctx.strokeStyle = "#fbfaf5";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-18, -54);
        ctx.lineTo(-10, -76);
        ctx.stroke();
        ctx.fillStyle = "#ff3b2f";
        ctx.beginPath();
        ctx.arc(-10, -76, 4 + Math.sin(t * 10 + i) * 1.5, 0, TAU);
        ctx.fill();
      } else if (beat.index === 3) {
        ctx.fillStyle = "#ff4e3a";
        ctx.strokeStyle = "#fbfaf5";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(-12, -52, 6.5, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    // Beat B: Giant Pulsing Submarine Radar Dish on Bus Roof
    if (beat.index === 1) {
      var dishX = 430;
      var dishY = -18;
      S.drawCardboardPuppetPiece(ctx, [[dishX - 18, 4], [dishX + 18, 4], [dishX + 8, -28], [dishX - 8, -28]], {
        tone: "#4e4d4b"
      });
      ctx.save();
      ctx.translate(dishX, -32);
      ctx.rotate(Math.sin(t * 3.6) * 0.45);
      S.drawCutoutPaperEdge(ctx, [[-42, -18], [0, 6], [42, -18], [28, 12], [-28, 12]], "#8e8d89", "#14110d", { paperRim: 3 });
      S.drawSplitPin(ctx, 0, 4, 4.5, { metal: "brass" });
      ctx.restore();
      for (var rw = 0; rw < 3; rw++) {
        var ru = ((t * 0.8 + rw / 3) % 1);
        ctx.strokeStyle = "rgba(255, 66, 56, " + ((1 - ru) * 0.7).toFixed(3) + ")";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(dishX, -38, 24 + ru * 130, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      }
    }

    // Beat D: Synchronized Hive-Mind Telepathy Arcs linking all 5 Trout Titans
    if (beat.index === 3) {
      ctx.save();
      for (var ti = 0; ti < 4; ti++) {
        var xA = 97 + ti * 142;
        var xB = 97 + (ti + 1) * 142;
        ctx.strokeStyle = (ti % 2 === 0) ? "rgba(124, 232, 255, 0.85)" : "rgba(212, 42, 30, 0.8)";
        ctx.lineWidth = 2.8;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.moveTo(xA, 48);
        ctx.quadraticCurveTo((xA + xB) * 0.5, -18 - Math.sin(t * 5 + ti) * 16, xB, 48);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    ctx.restore(); // end bus transform

    // Plane 3 (Foreground): Real Scissor-Cut Creek Rocks & Kelp from portholes/p21.jpg + Sub Spotlight
    drawPlateFrac(
      ctx, S, pImg,
      0.22, 0.42, 0.17, 0.22,
      148 + pxFore, 404 + pyFore, 225, 186,
      [[0.04, 0.12], [0.68, 0.04], [0.96, 0.54], [0.92, 0.96], [0.04, 0.96]],
      { haloWidth: 4.5 }
    );
    drawPlateFrac(
      ctx, S, pImg,
      0.58, 0.54, 0.25, 0.27,
      892 + pxFore, 412 + pyFore, 242, 182,
      [[0.18, 0.08], [0.94, 0.04], [0.96, 0.96], [0.04, 0.95]],
      { haloWidth: 4.5 }
    );

    drawPaperBubbles(ctx, S, t, state, [
      { x: 340, y0: 440, y1: 105, r: 5.5, speed: 0.31, n: 3 },
      { x: 640, y0: 450, y1: 95, r: 6.0, speed: 0.27, n: 3 },
      { x: 890, y0: 430, y1: 110, r: 5.0, speed: 0.35, n: 3 }
    ]);

    S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 615, spread: 290, alpha: 0.20 });

    if (beat.index === 3) {
      S.drawAlienSaucer(ctx, 640, 126, 1.22, t, 640, 340, { beamSpread: 220 });
    }

    ctx.restore(); // end Perec aperture clip

    // Couriers on top of proscenium sill
    drawBeatCouriers(ctx, S, W, H, t, state, beat, {
      turkeyX: 114,
      turkeyY: 500,
      snailX0: 205,
      snailX1: 1045,
      snailY: 558,
      troutX: 1005,
      troutY: 360,
      climbX: 1168
    });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    drawArchivalTakeHeader(ctx, S, state, beat, "P21", true);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 21);
  }

  // ============================================================================
  // PORTHOLE #22 · Trim
  // Style: "queneau-rostrum" (Buttercream Ochre Paper, Torn-Deckle Floor, Cutouts)
  // Stack: Exercices de style · Animated × S14 Pose2Pose + S32 FK + S33 IK + S47 Sound-to-Action
  // Options:
  //   A: A fish coach leading water squats
  //   B: Angry river guards marching closer
  //   C: A heavy iron gym kettlebell
  //   D: Mind-control zero-gravity aerobics
  // ============================================================================
  function renderPortal22(ctx, W, H, rawT, state) {
    var S = stage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(22);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // Buttercream Queneau Rostrum Stock (modeled on exercices-de-style.webp!)
    S.drawBolasBackdrop(ctx, W, H, "queneau-rostrum", 22, t, state, {
      floor: beat.index !== 3 // In Beat D zero-gravity, the floor detaches & floats!
    });

    var pxBack = S.parallaxX(0.25, t, state);
    var pyBack = S.parallaxY(0.25, t, state);
    var pxMid = S.parallaxX(0.55, t, state);
    var pyMid = S.parallaxY(0.55, t, state);
    var pxFore = S.parallaxX(0.9, t, state);

    // Beat D Zero-G floating torn-paper floor fragments
    if (beat.index === 3) {
      S.drawTornPaperFlat(ctx, 80, 520 + Math.sin(t * 2.1) * 18, 460, 48, {
        fill: "#273b19",
        rot: -0.05 + Math.sin(t * 1.4) * 0.03
      });
      S.drawTornPaperFlat(ctx, 640, 505 + Math.cos(t * 1.9) * 22, 520, 48, {
        fill: "#273b19",
        rot: 0.06 + Math.cos(t * 1.3) * 0.03
      });
    }

    // Plane 1: Flanking Scissor-Cut Botanical Trees from atlas-33.webp + Riverbed Stones from p22.jpg
    drawPlateFrac(
      ctx, S, aImg,
      0.0, 0.02, 0.23, 0.88,
      26 + pxBack, 72 + pyBack, 225, 455,
      [[0.04, 0.04], [0.92, 0.06], [0.88, 0.96], [0.06, 0.96]],
      { haloWidth: 4.5, filter: beat.index === 1 ? "sepia" : "none", alpha: 0.92 }
    );
    drawPlateFrac(
      ctx, S, aImg,
      0.75, 0.02, 0.25, 0.88,
      1025 + pxBack, 76 + pyBack, 225, 450,
      [[0.08, 0.06], [0.96, 0.04], [0.94, 0.96], [0.10, 0.95]],
      { haloWidth: 4.5, filter: beat.index === 1 ? "sepia" : "none", alpha: 0.92 }
    );
    drawPlateFrac(
      ctx, S, pImg,
      0.26, 0.62, 0.48, 0.20,
      360 + pxFore * 0.5, (beat.index === 3 ? 470 + Math.sin(t * 2.2) * 24 : 468), 520, 96,
      [[0.04, 0.22], [0.48, 0.06], [0.96, 0.18], [0.94, 0.94], [0.06, 0.92]],
      { haloWidth: 4.0 }
    );

    // Core Exercices-de-Style Invariant: IDENTICAL rhythmic squat oscillator across all 4 variations!
    var squatCycle = 0.5 - 0.5 * Math.cos(t * TAU * 0.85); // 0 = tall stand, 1 = deep water squat!
    var whistlePulse = Math.pow(Math.max(0, Math.sin(t * TAU * 0.85)), 4);

    // Left Actor: Scissor-Cut Fish Coach from portholes/p22.jpg + Swinging Split-Pin Whistle
    var coachX = 330 + pxMid + (beat.index === 1 ? beat.u * 48 : 0);
    var coachY = (beat.index === 3 ? 255 + Math.sin(t * 2.0) * 26 : 292) + pyMid + squatCycle * 18;
    ctx.save();
    ctx.translate(coachX, coachY);
    if (beat.index === 3) ctx.rotate(Math.sin(t * 1.6) * 0.14);

    drawPlateFrac(
      ctx, S, pImg,
      0.23, 0.34, 0.22, 0.24,
      -108, -94, 215, 195,
      [[0.08, 0.12], [0.56, 0.04], [0.96, 0.16], [0.92, 0.62], [0.62, 0.96], [0.16, 0.88]],
      { haloWidth: 4.5, rot: -0.05 + squatCycle * 0.08 }
    );

    // Swinging Red Lanyard & Articulated Silver Split-Pin Whistle (Sound-to-Action S47!)
    var wAng = 0.18 + Math.sin(t * 6.2) * 0.22 - whistlePulse * 0.35;
    ctx.save();
    ctx.translate(28, -14);
    ctx.rotate(wAng);
    ctx.strokeStyle = "#d42a1e";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-14, -22);
    ctx.quadraticCurveTo(6, 12, 16, 42);
    ctx.stroke();
    S.drawCardboardPuppetPiece(ctx, [[8, 38], [28, 36], [30, 54], [12, 56]], {
      tone: "#d4d7dc",
      ribs: 1,
      pin: { x: 16, y: 42, r: 3.4, metal: "silver" }
    });
    ctx.restore();

    // Acoustic whistle rings on beat in Beat A, barking guard orders in Beat B
    if (whistlePulse > 0.25 && beat.index <= 1) {
      ctx.strokeStyle = beat.index === 1 ? "#d42a1e" : "#0f8f80";
      ctx.lineWidth = 2.6;
      for (var wr = 1; wr <= 2; wr++) {
        ctx.beginPath();
        ctx.arc(105 + wr * 16, -24, 12 + wr * 14 * whistlePulse, -0.7, 0.7);
        ctx.stroke();
      }
    }
    if (beat.index === 1) {
      // Guard Captain Bicorne Paper Hat
      S.drawCutoutPaperEdge(ctx, [[-36, -78], [18, -112], [72, -74], [-24, -64]], "#1d2b3a", "#14110d", { paperRim: 3 });
      ctx.fillStyle = "#d42a1e";
      ctx.beginPath();
      ctx.arc(22, -88, 6, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // Beat C Centerpiece: Giant Cross-Hatched Cast-Iron Gym Kettlebell heaved by the squatters!
    if (beat.index === 2) {
      var kbX = 485 + pxMid;
      var kbY = 398 - (1 - squatCycle) * 62;
      ctx.save();
      ctx.translate(kbX, kbY);
      // Thick iron handle arch
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 22;
      ctx.beginPath();
      ctx.arc(0, -48, 38, Math.PI * 0.95, Math.PI * 0.05, false);
      ctx.stroke();
      ctx.strokeStyle = "#232528";
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.arc(0, -48, 38, Math.PI * 0.95, Math.PI * 0.05, false);
      ctx.stroke();

      // Cast-iron kettlebell sphere with charcoal crosshatch & brass weight-pip studs (0 text!)
      S.drawCutoutPaperEdge(
        ctx,
        [[-58, -28], [-38, -52], [38, -52], [58, -28], [64, 24], [42, 58], [-42, 58], [-64, 24]],
        "#383a3e",
        "#14110d",
        { paperRim: 4.5 }
      );
      S.drawEngravingCrosshatch(ctx, 96, 84, 0.25, 7, { x: -48, y: -38, color: "#fbfaf5" });
      S.drawSplitPin(ctx, -16, 6, 4.8, { metal: "brass" });
      S.drawSplitPin(ctx, 0, 6, 4.8, { metal: "brass" });
      S.drawSplitPin(ctx, 16, 6, 4.8, { metal: "brass" });
      ctx.restore();
    }

    // Right Trio: 3 Synchronized Pose2Pose Squatting Trout (Real p22.jpg Torso Cutouts + 2-Bone IK Split-Pin Squat Legs!)
    var marchShift = beat.index === 1 ? -beat.u * 78 : 0;
    for (var si = 0; si < 3; si++) {
      var baseX = 595 + si * 148 + pxMid + marchShift;
      var zeroGY = beat.index === 3 ? (-65 - Math.sin(t * 2.3 + si * 1.1) * 28) : 0;
      var footY = 472 + pyMid + zeroGY;
      var hipY = footY - 108 + squatCycle * 46;
      var hipX = baseX + (beat.index === 1 ? Math.sin(t * 5.4 + si) * 6 : 0);

      ctx.save();
      if (beat.index === 3) {
        ctx.translate(hipX, hipY);
        ctx.rotate(Math.sin(t * 1.7 + si * 0.9) * 0.18);
        ctx.translate(-hipX, -hipY);
      }

      // Back & Front 2-Bone IK Cardboard Squat Legs with Silver & Brass Split-Pin Knees!
      drawIKCardboardLimb(ctx, S, hipX - 8, hipY + 14, 52, 52, baseX - 24, footY, -1, {
        w0: 11, w1: 8.5, w2: 6.5, upperTone: "#6e7a68", lowerTone: "#8f9c8a"
      });
      drawIKCardboardLimb(ctx, S, hipX + 12, hipY + 14, 52, 52, baseX + 12, footY, -1, {
        w0: 11.5, w1: 9.0, w2: 7.0, upperTone: "#8f9c8a", lowerTone: "#aebaa6"
      });

      // Cardboard Tail Rudder
      S.drawCardboardPuppetPiece(ctx, [[hipX + 26, hipY + 8], [hipX + 54, hipY + 34], [hipX + 20, hipY + 38]], {
        tone: "#7a8775",
        ribs: 1
      });

      // Real Scissor-Cut Trout Upper Body from portholes/p22.jpg
      drawPlateFrac(
        ctx, S, pImg,
        0.47 + si * 0.11, 0.36, 0.12, 0.16,
        hipX - 48, hipY - 82, 98, 102,
        [[0.12, 0.06], [0.88, 0.08], [0.94, 0.90], [0.08, 0.92]],
        { haloWidth: 3.8 }
      );

      // Outstretched Articulated Pectoral Arm with Split-Pin Shoulder
      var armAng = -0.15 + squatCycle * 0.32;
      ctx.save();
      ctx.translate(hipX - 10, hipY - 18);
      ctx.rotate(armAng);
      S.drawCardboardPuppetPiece(ctx, [[6, -7], [-56, -10], [-62, 4], [6, 8]], {
        tone: "#9da896",
        ribs: 1,
        pin: { x: 0, y: 0, r: 4.0, metal: "brass" }
      });

      // Beat B: Marching Guard Cardboard Halberd Spear + Shako Helmet!
      if (beat.index === 1) {
        S.drawCardboardPuppetPiece(ctx, [[-56, -98], [-48, -98], [-48, 68], [-56, 68]], {
          tone: "#4b3b2a",
          ribs: 1
        });
        S.drawCutoutPaperEdge(ctx, [[-64, -96], [-52, -128], [-40, -96]], "#c5c7ca", "#14110d", { paperRim: 2.2 });
      }
      ctx.restore();

      if (beat.index === 1) {
        // Tall Red-and-Navy Guard Shako Hat
        S.drawCutoutPaperEdge(
          ctx,
          [[hipX - 32, hipY - 78], [hipX - 26, hipY - 114], [hipX + 12, hipY - 112], [hipX + 16, hipY - 76]],
          "#b8291e",
          "#14110d",
          { paperRim: 2.5 }
        );
      } else if (beat.index === 2 && si === 0) {
        // Rope linking lead squatter's hands to the heavy iron kettlebell!
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(hipX - 64, hipY - 16);
        ctx.lineTo(485 + pxMid, 338 - (1 - squatCycle) * 62);
        ctx.stroke();
      } else if (beat.index === 3) {
        // Beat D: Mind-Control Spiral Antenna Headband + Saucer Puppet Ray
        ctx.strokeStyle = "#d42a1e";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(hipX - 8, hipY - 80);
        ctx.lineTo(hipX - 8, hipY - 108);
        ctx.stroke();
        ctx.strokeStyle = "#0f8f80";
        ctx.beginPath();
        ctx.arc(hipX - 8, hipY - 114, 9, 0, TAU);
        ctx.stroke();
      }

      ctx.restore();
    }

    drawPaperBubbles(ctx, S, t, state, [
      { x: 330, y0: 240, y1: 75, r: 5.0, speed: 0.36, n: 3 },
      { x: 595, y0: 280, y1: 85, r: 4.8, speed: 0.33, n: 2 },
      { x: 743, y0: 280, y1: 85, r: 4.8, speed: 0.31, n: 2 },
      { x: 891, y0: 280, y1: 85, r: 4.8, speed: 0.35, n: 2 }
    ]);

    if (beat.index === 3) {
      S.drawAlienSaucer(ctx, 690, 118, 1.24, t, 735, 360, { beamSpread: 240 });
    }

    S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 620, spread: 320, alpha: 0.14 });

    drawBeatCouriers(ctx, S, W, H, t, state, beat, {
      turkeyX: 118,
      turkeyY: 492,
      snailX0: 215,
      snailX1: 1030,
      snailY: 544,
      troutX: 1035,
      troutY: 365,
      climbX: 1172
    });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    drawArchivalTakeHeader(ctx, S, state, beat, "P22", false);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 22);
  }

  // ============================================================================
  // PORTHOLE #23 · Scope B
  // Style: "duchamp-optic" (Dark Engraved Workshop Slate & Rotating Optical Discs)
  // Stack: Ouphopo × S07 Peter Foldès Drawn Metamorphosis (S35/S41/S44)
  // Options:
  //   A: A pink sea-anemone wall clock
  //   B: A hungry underwater monster plant
  //   C: The Principal’s gold pocketwatch
  //   D: A living time-machine dial
  // ============================================================================
  function renderPortal23(ctx, W, H, rawT, state) {
    var S = stage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(23);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    S.drawBolasBackdrop(ctx, W, H, "duchamp-optic", 23, t, state);

    var pxBack = S.parallaxX(0.25, t, state);
    var pyBack = S.parallaxY(0.25, t, state);
    var pxMid = S.parallaxX(0.55, t, state);
    var pyMid = S.parallaxY(0.55, t, state);
    var pxFore = S.parallaxX(0.88, t, state);

    // Plane 1: Flanking Patchwork Curtain Flats from atlas-42.webp
    drawPlateFrac(
      ctx, S, aImg,
      0.0, 0.02, 0.28, 0.80,
      24 + pxBack, 58 + pyBack, 265, 515,
      [[0.03, 0.03], [0.94, 0.05], [0.86, 0.96], [0.04, 0.95]],
      { haloWidth: 4.0, alpha: 0.88 }
    );
    drawPlateFrac(
      ctx, S, aImg,
      0.70, 0.02, 0.30, 0.80,
      988 + pxBack, 62 + pyBack, 268, 510,
      [[0.06, 0.05], [0.97, 0.03], [0.95, 0.96], [0.12, 0.95]],
      { haloWidth: 4.0, alpha: 0.88 }
    );

    var cx = 615 + pxMid;
    var cy = 336 + pyMid;

    // Plane 2: Scissor-Cut Barnacle Wooden Pier Piling Top & Bottom from portholes/p23.jpg
    if (beat.index !== 2) {
      drawPlateFrac(
        ctx, S, pImg,
        0.37, 0.15, 0.24, 0.16,
        cx - 95, 52, 190, 145,
        [[0.08, 0.04], [0.92, 0.04], [0.95, 0.96], [0.05, 0.96]],
        { haloWidth: 4.0 }
      );
    }
    drawPlateFrac(
      ctx, S, pImg,
      0.35, 0.60, 0.28, 0.26,
      cx - 108, 438, 216, 188,
      [[0.06, 0.05], [0.94, 0.05], [0.96, 0.96], [0.04, 0.96]],
      { haloWidth: 4.5 }
    );

    // Scissor-Cut Real Pink Sea-Anemone Tentacle Clusters from portholes/p23.jpg (Left & Right)
    drawPlateFrac(
      ctx, S, pImg,
      0.20, 0.21, 0.21, 0.44,
      cx - 255, cy - 165, 175, 325,
      [[0.12, 0.08], [0.92, 0.04], [0.88, 0.96], [0.08, 0.90]],
      { haloWidth: 4.0, rot: Math.sin(t * 1.9) * 0.05 }
    );
    drawPlateFrac(
      ctx, S, pImg,
      0.55, 0.20, 0.23, 0.44,
      cx + 80, cy - 165, 180, 325,
      [[0.08, 0.04], [0.90, 0.10], [0.92, 0.92], [0.10, 0.96]],
      { haloWidth: 4.0, rot: -Math.sin(t * 1.8) * 0.05 }
    );

    // 18 Articulated Cut-Paper Pink Sea-Anemone Tentacles radiating around the hub!
    ctx.save();
    ctx.translate(cx, cy);
    var pendSwing = beat.index === 2 ? Math.sin(t * 2.8) * 0.14 : 0;
    ctx.rotate(pendSwing);

    var nTent = 18;
    for (var ti = 0; ti < nTent; ti++) {
      var ang = (ti / nTent) * TAU + (beat.index === 3 ? t * 0.65 : 0);
      var lunge = beat.index === 1 ? (1.18 + 0.18 * Math.sin(t * 6.5 + ti)) : 1.0;
      var sway = S.wobble(t, 2.6, 0.16, ti * 0.7);
      ctx.save();
      ctx.rotate(ang + sway);
      var tLen = (158 + (ti % 3) * 22) * lunge;
      var tCol = beat.index === 1
        ? (ti % 2 === 0 ? "#d94f70" : "#b83253")
        : (beat.index === 2 ? "#d9a243" : "#e5899e");
      S.drawCutoutPaperEdge(
        ctx,
        [[-10, 96], [-14, 96 + tLen * 0.55], [4, 96 + tLen], [13, 96 + tLen * 0.5], [10, 96]],
        tCol,
        "#14110d",
        { paperRim: 2.2, shadow: false }
      );
      ctx.restore();
    }

    // Beat C: Ornate Principal's Gold Pocketwatch Crown, Bow Ring & Swinging Gold Chain at 12 o'clock!
    if (beat.index === 2) {
      ctx.strokeStyle = "#f3d184";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, -172, 26, 0, TAU);
      ctx.stroke();
      S.drawCardboardPuppetPiece(ctx, [[-22, -152], [22, -152], [16, -124], [-16, -124]], {
        tone: "#d4a44c",
        pin: { x: 0, y: -138, r: 4.5, metal: "brass" }
      });
      // Gold chain draping to upper right
      ctx.strokeStyle = "#edd089";
      ctx.lineWidth = 4.5;
      ctx.setLineDash([9, 5]);
      ctx.beginPath();
      ctx.moveTo(24, -172);
      ctx.quadraticCurveTo(160, -210, 290, -90);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Central Bezel & Dial (100% Vector / Plate Texture — ZERO text numerals in any mode!)
    var dialR = 128;
    // Outer scissor-cut halo + bezel
    S.drawCutoutPaperEdge(
      ctx,
      (function () {
        var pts = [];
        for (var k = 0; k < 24; k++) {
          var a = (k / 24) * TAU;
          pts.push([Math.cos(a) * (dialR + 18), Math.sin(a) * (dialR + 18)]);
        }
        return pts;
      })(),
      beat.index === 2 ? "#c9963b" : (beat.index === 1 ? "#3a222c" : "#22282c"),
      "#14110d",
      { paperRim: 5.0 }
    );

    // Inner Dial Surface
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, dialR, 0, TAU);
    ctx.clip();

    if (beat.index === 3 || beat.index === 2) {
      // Blend luminous rune-ring wood grain from atlas-42.webp inside dial!
      drawPlateFrac(
        ctx, S, aImg,
        0.31, 0.25, 0.38, 0.56,
        -dialR, -dialR, dialR * 2, dialR * 2,
        [[-0.1, -0.1], [1.1, -0.1], [1.1, 1.1], [-0.1, 1.1]],
        { haloWidth: 0, shadow: false, filter: beat.index === 2 ? "sepia" : "none", alpha: 0.92 }
      );
      if (beat.index === 2) {
        ctx.fillStyle = "rgba(250, 226, 152, 0.62)";
        ctx.fillRect(-dialR, -dialR, dialR * 2, dialR * 2);
      }
    } else {
      ctx.fillStyle = beat.index === 1 ? "#2b131b" : "#f7f1de";
      ctx.fillRect(-dialR, -dialR, dialR * 2, dialR * 2);
      S.drawEngravingCrosshatch(ctx, dialR * 2, dialR * 2, 0.08, 9, { x: -dialR, y: -dialR });
    }

    // Beat D: Counter-Rotating Duchamp "Anémic Cinéma" Eccentric Spiral Optical Discs!
    if (beat.index === 3) {
      for (var sp = 0; sp < 7; sp++) {
        var sa = t * (sp % 2 === 0 ? 2.8 : -2.2) + sp * 0.7;
        var offX = Math.cos(sa) * 14;
        var offY = Math.sin(sa) * 14;
        ctx.strokeStyle = sp % 2 === 0 ? "rgba(251, 250, 245, 0.82)" : "rgba(15, 143, 128, 0.85)";
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(offX, offY, 18 + sp * 15, 0, TAU);
        ctx.stroke();
      }
    }

    // Beat B: Hungry Underwater Monster Plant Serrated Cardboard JawsChomping inside the Clock!
    if (beat.index === 1) {
      var chomp = 0.25 + 0.75 * Math.abs(Math.sin(t * 5.2));
      var jawGap = 14 + chomp * 48;
      // Upper & lower crimson monster jaws + white paper-cut teeth
      ctx.fillStyle = "#8f2036";
      ctx.fillRect(-dialR, -dialR, dialR * 2, dialR - jawGap * 0.5);
      ctx.fillRect(-dialR, jawGap * 0.5, dialR * 2, dialR);

      for (var tooth = -5; tooth <= 5; tooth++) {
        var tx = tooth * 22;
        S.drawCutoutPaperEdge(
          ctx,
          [[tx - 9, -jawGap * 0.5], [tx + 9, -jawGap * 0.5], [tx, -jawGap * 0.5 + 26]],
          "#fbfaf5", "#14110d", { paperRim: 0, shadow: false }
        );
        S.drawCutoutPaperEdge(
          ctx,
          [[tx - 9, jawGap * 0.5], [tx + 9, jawGap * 0.5], [tx, jawGap * 0.5 - 26]],
          "#fbfaf5", "#14110d", { paperRim: 0, shadow: false }
        );
      }
    } else {
      // 12 Pure Geometric Hour Batons & 60 Minute Ticks (ZERO text!)
      for (var m = 0; m < 60; m++) {
        var ma = (m / 60) * TAU - Math.PI * 0.5;
        var isHour = (m % 5 === 0);
        var isQuarter = (m % 15 === 0);
        var r0 = isQuarter ? dialR - 28 : (isHour ? dialR - 20 : dialR - 10);
        var r1 = dialR - 5;
        ctx.strokeStyle = beat.index === 3 ? "#fbfaf5" : "#14110d";
        ctx.lineWidth = isQuarter ? 4.5 : (isHour ? 3.0 : 1.2);
        ctx.beginPath();
        ctx.moveTo(Math.cos(ma) * r0, Math.sin(ma) * r0);
        ctx.lineTo(Math.cos(ma) * r1, Math.sin(ma) * r1);
        ctx.stroke();
      }
    }
    ctx.restore(); // end inner dial clip

    // Articulated Cardboard Clock Hands + Central Brass Split-Pin Hub
    var minAng = beat.index === 3
      ? -t * 7.5
      : (-Math.PI * 0.5 + Math.floor(t * 2) * (TAU / 60) + S.springImpulse(t, Math.floor(t * 2) * 0.5, 18, 6) * 0.08);
    var hrAng = beat.index === 3 ? t * 2.6 : (0 + (t / 16) * 0.18); // Pointing right at 3 o'clock like p23.jpg!

    // Minute hand
    ctx.save();
    ctx.rotate(minAng);
    S.drawCardboardPuppetPiece(ctx, [[-6, 16], [-4, -98], [0, -110], [4, -98], [6, 16]], {
      tone: beat.index === 2 ? "#6a4914" : "#222426",
      ribs: 1
    });
    ctx.restore();

    // Hour hand
    ctx.save();
    ctx.rotate(hrAng);
    S.drawCardboardPuppetPiece(ctx, [[-8, 14], [-6, -68], [0, -80], [6, -68], [8, 14]], {
      tone: beat.index === 1 ? "#d42a1e" : (beat.index === 2 ? "#8f6420" : "#14110d"),
      ribs: 1
    });
    ctx.restore();

    S.drawReinigerFiligreeHinge(ctx, 0, 0, 11, { metal: "brass" });
    ctx.restore(); // end dial center

    // Plane 3: Scissor-Cut Spotted Trout from portholes/p23.jpg nosing the 3-o'clock rim!
    if (beat.index !== 2) {
      var fishX = cx + 195 + pxFore * 0.6 + (beat.index === 1 ? 38 : 0);
      var fishY = cy + 28 + Math.sin(t * 2.4) * 8;
      drawPlateFrac(
        ctx, S, pImg,
        0.54, 0.41, 0.29, 0.16,
        fishX - 115, fishY - 52, 240, 108,
        [[0.04, 0.36], [0.46, 0.06], [0.96, 0.14], [0.96, 0.88], [0.42, 0.94], [0.04, 0.68]],
        { haloWidth: 4.0, rot: Math.sin(t * 2.1) * 0.04 }
      );
    }

    drawPaperBubbles(ctx, S, t, state, [
      { x: 390, y0: 480, y1: 100, r: 5.0, speed: 0.29, n: 3 },
      { x: 850, y0: 470, y1: 105, r: 5.5, speed: 0.33, n: 3 }
    ]);

    if (beat.index === 3) {
      S.drawAlienSaucer(ctx, cx, 108, 1.20, t, cx, cy, { beamSpread: 175 });
    }

    S.drawLampBeam(ctx, W, H, t, state, { x: cx, y: 625, spread: 270, alpha: 0.15 });

    drawBeatCouriers(ctx, S, W, H, t, state, beat, {
      turkeyX: 118,
      turkeyY: 498,
      snailX0: 210,
      snailX1: 1030,
      snailY: 548,
      troutX: 985,
      troutY: 368,
      climbX: 1170
    });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    drawArchivalTakeHeader(ctx, S, state, beat, "P23", true);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 23);
  }

  // ============================================================================
  // PORTHOLE #24 · Rudder
  // Style: "cardboard-parallax" (Silver-Gelatin Monochrome River Parallax & Split-Pin Cardboard)
  // Stack: Outrapo × S23 SpineIK + S33 IK + S34 ARAP Net + S44 Multiplane Parallax
  // Options:
  //   A: A chewed-up green fishing net
  //   B: A sneaky hunter’s turkey trap
  //   C: Giant tin scissors cutting twine
  //   D: Tangled space-kraken dental floss
  // ============================================================================
  function renderPortal24(ctx, W, H, rawT, state) {
    var S = stage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(24);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // Silver-Gelatin Monochrome Parallax Stage (modeled on la-mort-en-ce-jardin.webp!)
    S.drawBolasBackdrop(ctx, W, H, "cardboard-parallax", 24, t, state, { pillarbox: true });

    var px1 = S.parallaxX(0.22, t, state);
    var px2 = S.parallaxX(0.50, t, state);
    var px3 = S.parallaxX(0.85, t, state);
    var py2 = S.parallaxY(0.50, t, state);

    // Plane 1 (Deep Monochrome Riverbed & Net Curtains from p24.jpg & atlas-51.webp)
    drawPlateFrac(
      ctx, S, pImg,
      0.18, 0.56, 0.62, 0.26,
      150 + px1, 415, 960, 195,
      [[0.02, 0.16], [0.50, 0.04], [0.98, 0.14], [0.98, 0.96], [0.02, 0.96]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.84 }
    );
    drawPlateFrac(
      ctx, S, aImg,
      0.02, 0.02, 0.36, 0.72,
      118 + px1, 68, 225, 395,
      [[0.04, 0.04], [0.92, 0.06], [0.84, 0.96], [0.06, 0.92]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.88 }
    );
    drawPlateFrac(
      ctx, S, aImg,
      0.60, 0.04, 0.38, 0.68,
      935 + px1, 74, 225, 385,
      [[0.08, 0.06], [0.96, 0.04], [0.94, 0.94], [0.14, 0.96]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.88 }
    );

    // Plane 2: Deformable Spring-Mesh Twine Fishing Net with Chewed Central Hole!
    // In Beat C, Giant Tin Scissors snip the net open wider; in Beat B, trap pulls it taut!
    var holeRadius = beat.index === 1
      ? 72 - beat.u * 18
      : (beat.index === 2 ? 98 + beat.u * 68 : 108);
    var holeCX = 640 + px2;
    var holeCY = 322 + py2;

    ctx.save();
    var cols = 15;
    var rows = 9;
    var netX0 = 155 + px2;
    var netY0 = 84 + py2;
    var stepX = 68;
    var stepY = 56;

    function netNode(c, r) {
      var bx = netX0 + c * stepX + ((r % 2) * 22);
      var by = netY0 + r * stepY - c * 8;
      var waveX = Math.sin(t * 2.0 + c * 0.5 + r * 0.4) * 6;
      var waveY = Math.cos(t * 1.7 + c * 0.4) * 5;
      var dx = bx - holeCX;
      var dy = by - holeCY;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (dist < holeRadius) {
        return { x: bx + waveX, y: by + waveY, cut: true };
      }
      // Push frayed strands slightly outward around chewed hole
      var push = dist < holeRadius + 55 ? (1 - (dist - holeRadius) / 55) * 18 : 0;
      return {
        x: bx + waveX + (dx / dist) * push,
        y: by + waveY + (dy / dist) * push,
        cut: false
      };
    }

    ctx.lineCap = "round";
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var p0 = netNode(c, r);
        if (p0.cut) continue;
        var neighbors = [[c + 1, r], [c, r + 1], [c + 1, r + 1]];
        for (var ni = 0; ni < neighbors.length; ni++) {
          var nc = neighbors[ni][0], nr = neighbors[ni][1];
          if (nc >= cols || nr >= rows) continue;
          var p1 = netNode(nc, nr);
          ctx.strokeStyle = beat.index === 3 ? "#5ef2d6" : "#4b7c68";
          ctx.lineWidth = p1.cut ? 2.2 : 3.4;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          if (p1.cut) {
            // Frayed chewed twine end dangling at edge of hole!
            var fx = S.lerp(p0.x, p1.x, 0.42) + Math.sin(t * 5 + c + r) * 4;
            var fy = S.lerp(p0.y, p1.y, 0.42) + 8;
            ctx.lineTo(fx, fy);
          } else {
            ctx.lineTo(p1.x, p1.y);
          }
          ctx.stroke();
        }
        // Twine knot bead
        ctx.fillStyle = "#fbfaf5";
        ctx.beginPath();
        ctx.arc(p0.x, p0.y, 2.3, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();

    // Spine-Rigged Trout Swimming Right Through the Chewed Hole (p24.jpg / atlas-51.webp cutout + Cardboard Spine!)
    if (beat.index !== 3) {
      var swimX = holeCX - 18 + Math.sin(t * 1.9) * 28;
      var swimY = holeCY + Math.cos(t * 2.4) * 10;
      ctx.save();
      ctx.translate(swimX, swimY);
      ctx.rotate(Math.sin(t * 2.2) * 0.06);

      // 3 Hinged Grey-Cardboard Tail Spine Segments + Silver Split-Pins (S23 SpineIK!)
      var wag1 = Math.sin(t * 6.0) * 10;
      var wag2 = Math.sin(t * 6.0 - 0.8) * 18;
      S.drawCardboardPuppetPiece(ctx, [[-118, -12 + wag2], [-72, -18 + wag1], [-72, 18 + wag1], [-118, 12 + wag2]], {
        tone: "#7d857d",
        ribs: 2,
        pin: { x: -74, y: wag1, r: 3.8, metal: "silver" }
      });
      S.drawCardboardPuppetPiece(ctx, [[-152, -32 + wag2 * 1.3], [-114, -8 + wag2], [-114, 8 + wag2], [-152, 32 + wag2 * 1.3]], {
        tone: "#626962",
        ribs: 2,
        pin: { x: -116, y: wag2, r: 3.6, metal: "brass" }
      });

      // Real Scissor-Cut Trout Head & Spotted Body from p24.jpg
      drawPlateFrac(
        ctx, S, pImg,
        0.41, 0.39, 0.34, 0.18,
        -82, -52, 228, 106,
        [[0.04, 0.24], [0.48, 0.04], [0.96, 0.18], [0.94, 0.84], [0.46, 0.95], [0.04, 0.76]],
        { haloWidth: 4.2, filter: "none" }
      );
      ctx.restore();
    }

    // Beat B ("A sneaky hunter's turkey trap"): Cardboard Spring-Jaw Snare Frame & Dangling Corn-Cob Bait!
    if (beat.index === 1) {
      var dropY = S.lerp(75, 165, S.spring(beat.localT, 0.15, 11, 4.2));
      // Heavy wooden/cardboard snare crossbar + trigger rope
      S.drawCardboardPuppetPiece(ctx, [[375, dropY], [905, dropY], [890, dropY + 32], [390, dropY + 32]], {
        tone: "#6b5842",
        ribs: 4,
        pins: [[415, dropY + 16], [640, dropY + 16], [865, dropY + 16]]
      });
      // Dangling golden corn-cob lure on tripwire hook!
      var cobX = holeCX + 96;
      var cobY = dropY + 128 + Math.sin(t * 4.5) * 8;
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cobX, dropY + 28);
      ctx.lineTo(cobX, cobY - 26);
      ctx.stroke();
      S.drawCutoutPaperEdge(ctx, [[cobX - 16, cobY - 26], [cobX + 16, cobY - 26], [cobX + 12, cobY + 28], [cobX - 12, cobY + 28]], "#eab941", "#14110d", { paperRim: 3 });
    }

    // Beat C ("Giant tin scissors cutting twine"): 2-Bone IK Mottled Tin Scissor Blades Snipping the Net!
    if (beat.index === 2) {
      var scX = 475 + beat.u * 210;
      var scY = 335 - beat.u * 35;
      var snipAng = 0.12 + 0.36 * Math.abs(Math.sin(t * 7.2));

      ctx.save();
      ctx.translate(scX, scY);
      ctx.rotate(-0.18);

      // Upper Tin Scissor Blade + Finger Loop
      ctx.save();
      ctx.rotate(-snipAng);
      S.drawCardboardPuppetPiece(ctx, [[-26, -12], [185, -4], [155, 14], [-26, 10]], {
        tone: "#c2c5c8",
        ribs: 2
      });
      S.drawCutoutPaperEdge(ctx, [[-98, -42], [-28, -28], [-24, 2], [-92, 6]], "#7c7f82", "#14110d", { paperRim: 3 });
      ctx.fillStyle = "#292b2d";
      ctx.beginPath();
      ctx.ellipse(-62, -16, 22, 13, 0.1, 0, TAU);
      ctx.fill();
      ctx.restore();

      // Lower Tin Scissor Blade + Finger Loop + Central Brass Split-Pin!
      ctx.save();
      ctx.rotate(snipAng);
      S.drawCardboardPuppetPiece(ctx, [[-26, -10], [155, -14], [185, 4], [-26, 12]], {
        tone: "#a7aaae",
        ribs: 2
      });
      S.drawCutoutPaperEdge(ctx, [[-92, -6], [-24, -2], [-28, 28], [-98, 42]], "#7c7f82", "#14110d", { paperRim: 3 });
      ctx.fillStyle = "#292b2d";
      ctx.beginPath();
      ctx.ellipse(-62, 16, 22, 13, -0.1, 0, TAU);
      ctx.fill();
      ctx.restore();

      S.drawSplitPin(ctx, 0, 0, 7.5, { metal: "brass" });
      ctx.restore();
    }

    // Beat D ("Tangled space-kraken dental floss"): Giant Cardboard Kraken Tentacles Flossing Cosmic Teeth!
    if (beat.index === 3) {
      var flossShift = Math.sin(t * 5.2) * 58;
      // Giant serrated Cosmic Kraken Tooth Arch at bottom-center
      for (var kt = -3; kt <= 3; kt++) {
        var tx = 640 + kt * 68;
        S.drawCutoutPaperEdge(
          ctx,
          [[tx - 26, 540], [tx - 18, 415], [tx + 18, 415], [tx + 26, 540]],
          "#f2efe6",
          "#14110d",
          { paperRim: 3.5 }
        );
      }

      // Glowing Mint Space-Floss Ribbon sawing between teeth!
      ctx.strokeStyle = "#6cffdf";
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.moveTo(285 + flossShift * 0.6, 365);
      ctx.lineTo(640 + flossShift, 438);
      ctx.lineTo(995 + flossShift * 0.6, 365);
      ctx.stroke();

      // Left & Right Articulated Cardboard Space-Kraken Tentacles + Mint Floss Spool
      drawIKCardboardLimb(ctx, S, 185, 560, 145, 130, 285 + flossShift * 0.6, 365, -1, {
        w0: 26, w1: 18, w2: 12, upperTone: "#6c4b78", lowerTone: "#8e639c", pinR: 5.5
      });
      drawIKCardboardLimb(ctx, S, 1095, 560, 145, 130, 995 + flossShift * 0.6, 365, 1, {
        w0: 26, w1: 18, w2: 12, upperTone: "#6c4b78", lowerTone: "#8e639c", pinR: 5.5
      });
      // Floss dispenser spool held by left tentacle
      S.drawCutoutPaperEdge(
        ctx,
        [[250 + flossShift * 0.6, 330], [312 + flossShift * 0.6, 330], [312 + flossShift * 0.6, 398], [250 + flossShift * 0.6, 398]],
        "#fbfaf5",
        "#0f8f80",
        { paperRim: 3 }
      );
      S.drawSplitPin(ctx, 281 + flossShift * 0.6, 364, 5.0, { metal: "silver" });

      S.drawAlienSaucer(ctx, 640, 118, 1.22, t, 640 + flossShift * 0.4, 420, { beamSpread: 210 });
    }

    drawPaperBubbles(ctx, S, t, state, [
      { x: 465, y0: 460, y1: 90, r: 5.5, speed: 0.32, n: 3 },
      { x: 785, y0: 450, y1: 95, r: 5.0, speed: 0.28, n: 3 }
    ]);

    S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 620, spread: 280, alpha: 0.16 });

    drawBeatCouriers(ctx, S, W, H, t, state, beat, {
      turkeyX: 158,
      turkeyY: 498,
      snailX0: 245,
      snailX1: 1005,
      snailY: 545,
      troutX: 965,
      troutY: 360,
      climbX: 1135
    });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    drawArchivalTakeHeader(ctx, S, state, beat, "P24", true);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 24);
  }

  // ============================================================================
  // PORTHOLE #25 · Lock
  // Style: "queneau-rostrum" (Buttercream Ochre Paper, Torn-Deckle Airlock Door & Floor)
  // Stack: Quatre-vingt-quinze (Oubapo Visual Inversion) × S24 Live2D + S45 Occlusion + S46 Gaze + S41 Spring
  // Options:
  //   A: A trout wearing a glass fishbowl
  //   B: A deep-sea diver’s glass helmet
  //   C: A wild bird in a bottle
  //   D: A gill-breathing alien spacesuit
  // ============================================================================
  function renderPortal25(ctx, W, H, rawT, state) {
    var S = stage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(25);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // Buttercream Queneau Rostrum Stock (modeled on exercices-de-style.webp!)
    S.drawBolasBackdrop(ctx, W, H, "queneau-rostrum", 25, t, state, {
      paperTop: beat.index === 3 ? "#23293a" : "#fae194",
      paperBot: beat.index === 3 ? "#151926" : "#eed07c",
      floorColor: beat.index === 3 ? "#2b3248" : "#273b19"
    });

    var pxBack = S.parallaxX(0.25, t, state);
    var pxMid = S.parallaxX(0.55, t, state);
    var pyMid = S.parallaxY(0.55, t, state);

    // Beat D Starry Rostrum Cutout Dots
    if (beat.index === 3) {
      for (var st = 0; st < 28; st++) {
        var sx = S.hash(st * 13.7) * W;
        var sy = S.hash(st * 29.1) * 480;
        ctx.fillStyle = st % 4 === 0 ? "#fae194" : "#fbfaf5";
        ctx.beginPath();
        ctx.arc(sx, sy, 1.8 + (st % 3), 0, TAU);
        ctx.fill();
      }
    }

    // Plane 1: Torn-Deckle Airlock Door on Right (modeled directly on SERVICE door in exercices-de-style.webp!)
    // Uses Verne #verne-13 child-safe Air + Sight icon plaque (ZERO text!)
    var doorX = 965 + pxBack;
    var doorY = 82;
    S.drawTornPaperFlat(ctx, doorX, doorY, 210, 462, {
      fill: "#223618",
      paperColor: "#f3eee2",
      deckle: 8,
      stroke: "#14110d",
      seed: 25.8
    });
    // Verne-13 Sight (lamp) + Air (bubble) capacity icon plaque on door (0 text!)
    S.drawCutoutPaperEdge(
      ctx,
      [[doorX + 36, doorY + 58], [doorX + 174, doorY + 58], [doorX + 174, doorY + 106], [doorX + 36, doorY + 106]],
      "#f3eee2",
      "#14110d",
      { paperRim: 0, shadow: false }
    );
    // Air icon (blue bubble) + Sight icon (amber lamp cone)
    ctx.fillStyle = "#0f8f80";
    ctx.beginPath();
    ctx.arc(doorX + 76, doorY + 82, 12, 0, TAU);
    ctx.fill();
    ctx.fillStyle = (state && state.lamp === false) ? "#8a8984" : "#e89f2c";
    ctx.beginPath();
    ctx.moveTo(doorX + 122, doorY + 82);
    ctx.lineTo(doorX + 148, doorY + 69);
    ctx.lineTo(doorX + 148, doorY + 95);
    ctx.closePath();
    ctx.fill();
    // Torn cream door handle
    S.drawTornPaperFlat(ctx, doorX + 18, doorY + 235, 18, 42, { fill: "#f3eee2", deckle: 2, shadow: false });

    // Left Cavern Stalactite Cutout from p25.jpg + Warm Hanging Amber Diner Lamp from atlas-45.webp (clean non-text crop!)
    drawPlateFrac(
      ctx, S, pImg,
      0.21, 0.19, 0.17, 0.44,
      38 + pxBack, 78, 200, 448,
      [[0.04, 0.04], [0.94, 0.06], [0.68, 0.94], [0.06, 0.96]],
      { haloWidth: 4.5 }
    );
    drawPlateFrac(
      ctx, S, aImg,
      0.36, 0.0, 0.16, 0.30,
      465 + pxBack * 0.7, 36, 155, 138,
      [[0.18, 0.02], [0.82, 0.02], [0.96, 0.92], [0.04, 0.92]],
      { haloWidth: 3.8 }
    );
    // Stone Ledge Cutout from p25.jpg
    drawPlateFrac(
      ctx, S, pImg,
      0.30, 0.67, 0.44, 0.16,
      340 + pxMid * 0.6, 482, 465, 92,
      [[0.04, 0.18], [0.96, 0.12], [0.94, 0.94], [0.06, 0.92]],
      { haloWidth: 4.0 }
    );

    // Plane 2: Centerpiece Oubapo Inside/Outside Vessel Actor!
    var walkPhase = t * 4.2;
    var bounceY = beat.index === 3 ? (-28 + Math.sin(t * 2.2) * 18) : Math.abs(Math.sin(walkPhase)) * -8;
    var actorX = 565 + pxMid + Math.sin(t * 0.9) * 26;
    var actorY = 345 + pyMid + bounceY;

    if (beat.index === 2) {
      // Beat C ("A wild bird in a bottle"): Tall Corked Antique Glass Bottle holding a Flapping Scarlet-Ochre Wild Bird!
      ctx.save();
      ctx.translate(actorX, 335 + pyMid);
      ctx.rotate(Math.sin(t * 1.8) * 0.04);

      // Bottle Scissor-Cut Paper Halo & Back Green-Tinted Glass Wall
      S.drawCutoutPaperEdge(
        ctx,
        [[-42, -195], [42, -195], [38, -135], [108, -75], [112, 148], [-112, 148], [-108, -75], [-38, -135]],
        "#d8efe8",
        "#14110d",
        { paperRim: 5.0 }
      );
      // Giant Bark Cork Plugged in Bottle Neck!
      S.drawCardboardPuppetPiece(ctx, [[-36, -238], [36, -238], [30, -186], [-30, -186]], {
        tone: "#9e7344",
        ribs: 3
      });

      // Perched Cut-Paper Wild Bird Flapping Wings inside Dry Air of the Bottle!
      S.drawCardboardPuppetPiece(ctx, [[-76, 68], [78, 52], [74, 66], [-74, 80]], {
        tone: "#694830",
        ribs: 1
      });
      var flap = Math.sin(t * 11.5) * 0.55;
      ctx.save();
      ctx.translate(-4, 18 + Math.sin(t * 5) * 4);
      // Tail feathers
      S.drawCutoutPaperEdge(ctx, [[-34, 18], [-78, 42], [-68, 8], [-28, 4]], "#2a3a63", "#14110d", { paperRim: 2 });
      // Bird body
      S.drawCardboardPuppetPiece(ctx, [[-36, 12], [-12, -26], [34, -18], [42, 18], [8, 36]], {
        tone: "#d42a1e",
        ribs: 2
      });
      // Articulated Split-Pin Wing
      ctx.save();
      ctx.translate(-2, -6);
      ctx.rotate(flap);
      S.drawCardboardPuppetPiece(ctx, [[-8, -6], [-56, -48], [-12, -52], [18, -8]], {
        tone: "#e89f38",
        ribs: 2,
        pin: { x: 0, y: 0, r: 4.0, metal: "brass" }
      });
      ctx.restore();
      // Beak & Eye
      S.drawCutoutPaperEdge(ctx, [[36, -14], [62, -6], [36, 2]], "#f3d184", "#14110d", { paperRim: 1.5 });
      ctx.fillStyle = "#fbfaf5";
      ctx.beginPath(); ctx.arc(24, -10, 5.5, 0, TAU); ctx.fill();
      ctx.fillStyle = "#14110d";
      ctx.beginPath(); ctx.arc(25.5, -10, 2.6, 0, TAU); ctx.fill();
      ctx.restore();

      // Front Specular Glass Bottle Highlights (Occlusion Compositing S45!)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.78)";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-82, -55);
      ctx.lineTo(-86, 118);
      ctx.stroke();

      ctx.restore();
    } else {
      // Beats A, B, D: Bipedal Trout in Inverted Fishbowl / Mark-V Diver Helmet / Alien Gill-Spacesuit!
      var footGroundY = 502 + pyMid + (beat.index === 3 ? -18 : 0);
      var stride1X = actorX - 18 + Math.sin(walkPhase) * 38;
      var stride1Y = footGroundY - Math.max(0, Math.cos(walkPhase)) * 18;
      var stride2X = actorX + 22 + Math.sin(walkPhase + Math.PI) * 38;
      var stride2Y = footGroundY - Math.max(0, Math.cos(walkPhase + Math.PI)) * 18;

      // 2-Bone IK Striding Fin-Legs / Weighted Lead Boots / Space Boots with Brass Split-Pins!
      var legToneU = beat.index === 3 ? "#bfc6d4" : (beat.index === 1 ? "#5e5b52" : "#8f9c8a");
      var legToneL = beat.index === 3 ? "#dce2ee" : (beat.index === 1 ? "#8a6834" : "#b8b48c");
      drawIKCardboardLimb(ctx, S, actorX - 10, actorY + 58, 52, 50, stride1X, stride1Y, 1, {
        w0: 13, w1: 10, w2: 9, upperTone: legToneU, lowerTone: legToneL
      });
      drawIKCardboardLimb(ctx, S, actorX + 16, actorY + 58, 52, 50, stride2X, stride2Y, 1, {
        w0: 13, w1: 10, w2: 9, upperTone: legToneU, lowerTone: legToneL
      });

      // Flippered Feet / Heavy Lead Diver Boots / Anti-Grav Moon Boots
      var feet = [[stride1X, stride1Y], [stride2X, stride2Y]];
      for (var fi = 0; fi < 2; fi++) {
        var fx = feet[fi][0], fy = feet[fi][1];
        S.drawCardboardPuppetPiece(
          ctx,
          [[fx - 38, fy + 4], [fx + 14, fy - 8], [fx + 18, fy + 10], [fx - 32, fy + 12]],
          {
            tone: beat.index === 1 ? "#4a4843" : (beat.index === 3 ? "#0f8f80" : "#b8a86c"),
            pin: { x: fx, y: fy, r: 3.8, metal: "brass" }
          }
        );
      }

      ctx.save();
      ctx.translate(actorX, actorY);

      // Spotted Tail Counterbalance
      S.drawCardboardPuppetPiece(ctx, [[34, 42], [98, 12], [88, 72], [28, 62]], {
        tone: beat.index === 3 ? "#8fa8b8" : "#8f9c8a",
        ribs: 2,
        pin: { x: 36, y: 50, r: 4.2, metal: "silver" }
      });

      // Beat D: Dual Glowing Gill-Breathing Bio-Tanks on Back!
      if (beat.index === 3) {
        S.drawCutoutPaperEdge(ctx, [[28, -42], [68, -42], [68, 38], [28, 38]], "#0f8f80", "#fbfaf5", { paperRim: 3 });
        ctx.fillStyle = "#7cf6e4";
        ctx.fillRect(36, -28, 22, 52);
      }

      // Riveted Brass Diving Cuirass / Alien Exo-Torso (Real crop from p25.jpg in Beat A/B!)
      if (beat.index === 3) {
        S.drawCardboardPuppetPiece(ctx, [[-48, -36], [48, -36], [42, 62], [-38, 62]], {
          tone: "#d2d8e4",
          ribs: 3,
          pins: [[-28, -22], [0, -22], [28, -22], [0, 18]]
        });
      } else {
        drawPlateFrac(
          ctx, S, pImg,
          0.40, 0.41, 0.23, 0.17,
          -58, -44, 122, 108,
          [[0.08, 0.06], [0.92, 0.06], [0.90, 0.94], [0.10, 0.94]],
          { haloWidth: 3.5 }
        );
      }

      // S45 Occlusion Layer 1: Back Rim of Inverted Glass Fishbowl + Bubbly Water Fill
      var bowlR = 88;
      var bowlY = -112 + S.springImpulse(t, Math.floor(t), 10, 4.5) * 4;
      S.drawCutoutPaperEdge(
        ctx,
        (function () {
          var pts = [];
          for (var b = 0; b < 20; b++) {
            var a = (b / 20) * TAU;
            pts.push([Math.cos(a) * (bowlR + 4), bowlY + Math.sin(a) * (bowlR + 4)]);
          }
          return pts;
        })(),
        beat.index === 3 ? "#1b4d5c" : "#3bb6c8",
        "#14110d",
        { paperRim: 4.5 }
      );

      // S45 Occlusion Layer 2: Real Scissor-Cut Trout Head inside the Water-Filled Fishbowl!
      drawPlateFrac(
        ctx, S, pImg,
        0.39, 0.28, 0.22, 0.16,
        -64, bowlY - 46, 132, 98,
        [[0.06, 0.14], [0.58, 0.04], [0.96, 0.22], [0.92, 0.92], [0.08, 0.90]],
        { haloWidth: 0, shadow: false, rot: Math.sin(t * 2.3) * 0.05 }
      );

      // S45 Occlusion Layer 3: Translucent Front Water Slosh & Specular Glass Rim!
      ctx.fillStyle = beat.index === 3 ? "rgba(110, 248, 224, 0.26)" : "rgba(155, 238, 248, 0.28)";
      ctx.beginPath();
      ctx.arc(0, bowlY, bowlR - 3, 0, TAU);
      ctx.fill();

      // Open fishbowl lip at top (Beat A) OR Heavy Copper Mark-V Diver Lattice (Beat B) OR Orbital Spacesuit Ring (Beat D)!
      if (beat.index === 0) {
        ctx.fillStyle = "#d8f6fa";
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.ellipse(0, bowlY - 72, 54, 12, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
      } else if (beat.index === 1) {
        // Beat B ("A deep-sea diver's glass helmet"): Clamped Copper Mark-V Helmet Lattice & Pressurized Air Hose!
        var clampU = S.spring(beat.localT, 0.08, 12, 4.5);
        ctx.save();
        ctx.translate(0, (1 - clampU) * -45);
        ctx.strokeStyle = "#b8792e";
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.arc(0, bowlY, bowlR, 0, TAU);
        ctx.moveTo(-bowlR, bowlY); ctx.lineTo(bowlR, bowlY);
        ctx.moveTo(0, bowlY - bowlR); ctx.lineTo(0, bowlY + bowlR);
        ctx.stroke();
        S.drawSplitPin(ctx, 0, bowlY, 6.5, { metal: "brass" });
        ctx.restore();

        // Twin braided air hoses leading back to the airlock door!
        ctx.strokeStyle = "#2b2a27";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(64, bowlY + 42);
        ctx.quadraticCurveTo(210, bowlY + 135, doorX - actorX + 20, -25);
        ctx.stroke();
      } else if (beat.index === 3) {
        // Beat D: Glowing Gill-Slit Collar & Telemetry Halo Ring!
        ctx.strokeStyle = "#6cffdf";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, bowlY + 68, 78, 18, 0.08, 0, TAU);
        ctx.stroke();
      }

      // Specular curved glass highlight arc
      ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, bowlY, bowlR - 14, Math.PI * 1.08, Math.PI * 1.48);
      ctx.stroke();

      // Articulated Pectoral Arm with Brass Split-Pin
      ctx.save();
      ctx.translate(-26, -4);
      ctx.rotate(0.25 + Math.sin(walkPhase + Math.PI) * 0.28);
      S.drawCardboardPuppetPiece(ctx, [[6, -8], [-48, 16], [-42, 32], [8, 10]], {
        tone: beat.index === 3 ? "#dce2ee" : "#b8a86c",
        pin: { x: 0, y: 0, r: 4.0, metal: "brass" }
      });
      ctx.restore();

      ctx.restore(); // end actor body
    }

    drawPaperBubbles(ctx, S, t, state, [
      { x: actorX, y0: 250, y1: 95, r: 4.5, speed: 0.38, n: 3 }
    ]);

    if (beat.index === 3) {
      S.drawAlienSaucer(ctx, 320, 118, 1.20, t, actorX, actorY - 60, { beamSpread: 185 });
    }

    S.drawLampBeam(ctx, W, H, t, state, { x: 540, y: 615, spread: 280, alpha: 0.14 });

    drawBeatCouriers(ctx, S, W, H, t, state, beat, {
      turkeyX: 118,
      turkeyY: 492,
      snailX0: 215,
      snailX1: 945,
      snailY: 544,
      troutX: 855,
      troutY: 325,
      climbX: 1178
    });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    drawArchivalTakeHeader(ctx, S, state, beat, "P25", beat.index === 3);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 25);
  }

  // ---------- Register #21–#25 on window.PORTAL_REMAKE_SCENES ----------
  var SCENES = {
    21: {
      id: 21,
      station: "#21 · Fwd",
      duration: DURATION,
      bolasStyle: "perec-stage",
      preload: function () { return stage().preloadPortalPlates(21); },
      render: renderPortal21
    },
    22: {
      id: 22,
      station: "#22 · Trim",
      duration: DURATION,
      bolasStyle: "queneau-rostrum",
      preload: function () { return stage().preloadPortalPlates(22); },
      render: renderPortal22
    },
    23: {
      id: 23,
      station: "#23 · Scope B",
      duration: DURATION,
      bolasStyle: "duchamp-optic",
      preload: function () { return stage().preloadPortalPlates(23); },
      render: renderPortal23
    },
    24: {
      id: 24,
      station: "#24 · Rudder",
      duration: DURATION,
      bolasStyle: "cardboard-parallax",
      preload: function () { return stage().preloadPortalPlates(24); },
      render: renderPortal24
    },
    25: {
      id: 25,
      station: "#25 · Lock",
      duration: DURATION,
      bolasStyle: "queneau-rostrum",
      preload: function () { return stage().preloadPortalPlates(25); },
      render: renderPortal25
    }
  };

  if (root) {
    root.PORTAL_REMAKE_SCENES = root.PORTAL_REMAKE_SCENES || {};
    for (var k in SCENES) {
      if (Object.prototype.hasOwnProperty.call(SCENES, k)) {
        root.PORTAL_REMAKE_SCENES[k] = SCENES[k];
      }
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = SCENES;
  }
})(typeof window !== "undefined" ? window : globalThis);
