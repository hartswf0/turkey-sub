/* ============================================================================
 * Turkey Sub · V2 Multi-SCION & BOLAS Screening Room Remake — Crew 06 (#26–#30)
 * File: portals/remake-06.js
 *
 * 16.0s (384 frames @ 24fps, 1280×720) 4-Variation Cutaway Rostrum Cinema:
 *   - 0.0–4.0s   : Variation I   · (A) Real Creek
 *   - 4.0–8.0s   : Variation II  · (B) Probable · Turkey (+ Snail Mail Out)
 *   - 8.0–12.0s  : Variation III · (C) Plausible · Trout (+ Snail Mail Reply)
 *   - 12.0–16.0s : Variation IV  · (D) Preposterous · Alien Listening Post
 *
 * Assigned Slice & BOLAS Screening Room Lineages:
 *   #26 · Boiler : "cardboard-parallax" (Exercices de style × S05 Yuri Norstein)
 *                  Plates: ./portholes/p26.jpg + ./assets/atlas-stills/atlas-48.webp
 *   #27 · Port M : "duchamp-optic"      (Martino Variations × S28 Plate Foundry)
 *                  Plates: ./portholes/p27.jpg + ./assets/atlas-stills/atlas-17.webp
 *   #28 · Stbd M : "daumier-litho"      (Oucipo Fibonacci × S06 John Whitney)
 *                  Plates: ./portholes/p28.jpg + ./assets/atlas-stills/atlas-03.webp
 *   #29 · Deck   : "queneau-rostrum"    (Récits d’Ellis Island × S04 Frank Mouris)
 *                  Plates: ./portholes/p29.jpg + ./assets/atlas-stills/atlas-20.webp
 *   #30 · Top    : "queneau-rostrum"    (Oulipo Lipogram × S18 Cartoon Saloon)
 *                  Plates: ./portholes/p30.jpg + ./assets/atlas-stills/atlas-43.webp
 *
 * STRICT PAELEO BLIND-MODE INVARIANT:
 *   Zero direct fillText / strokeText calls anywhere in this module; all editorial
 *   typography is delegated exclusively to SCION_STAGE.drawBolasSlateAndStrip(...),
 *   which emits 0 text calls when state && state.showCaptions === false.
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  root.PORTAL_REMAKE_SCENES = root.PORTAL_REMAKE_SCENES || {};

  // Eagerly kick off plate preloading when loaded in browser / Puppeteer
  if (root.SCION_STAGE && typeof root.SCION_STAGE.preloadPortalPlates === "function") {
    root.SCION_STAGE.preloadPortalPlates([26, 27, 28, 29, 30]);
  }

  function getStage() {
    return root.SCION_STAGE;
  }

  // ---------- Shared Handmade Cutout & Kinematic Helpers (0 Text Calls!) ----------

  function drawJointedLimb(ctx, S, x0, y0, jx, jy, ex, ey, w1, w2, tone1, tone2, metal) {
    var a1 = Math.atan2(jy - y0, jx - x0);
    var l1 = Math.hypot(jx - x0, jy - y0);
    ctx.save();
    ctx.translate(x0, y0);
    ctx.rotate(a1);
    S.drawCardboardPuppetPiece(
      ctx,
      [[-6, -w1 * 0.5], [l1 + 6, -w1 * 0.42], [l1 + 6, w1 * 0.42], [-6, w1 * 0.5]],
      { tone: tone1 || "#8e8d88", ribs: 2 }
    );
    ctx.restore();

    var a2 = Math.atan2(ey - jy, ex - jx);
    var l2 = Math.hypot(ex - jx, ey - jy);
    ctx.save();
    ctx.translate(jx, jy);
    ctx.rotate(a2);
    S.drawCardboardPuppetPiece(
      ctx,
      [[-5, -w2 * 0.5], [l2 + 6, -w2 * 0.38], [l2 + 6, w2 * 0.38], [-5, w2 * 0.5]],
      { tone: tone2 || "#a3a099", ribs: 2 }
    );
    ctx.restore();

    S.drawSplitPin(ctx, x0, y0, 4.6, { metal: metal || "brass" });
    S.drawSplitPin(ctx, jx, jy, 4.4, { metal: "silver" });
  }

  function drawBallastBubbles(ctx, S, W, H, t, state, tintCol) {
    var count = (state && state.ballast) ? 22 : 8;
    ctx.save();
    for (var i = 0; i < count; i++) {
      var seed = i * 17.31 + 4.2;
      var bx = 90 + S.hash(seed) * (W - 180) + Math.sin(t * 1.8 + i) * 14;
      var sp = 36 + S.hash(seed + 3.1) * 48 + ((state && state.ballast) ? 35 : 0);
      var by = 620 - (((t * sp + S.hash(seed + 8.7) * 580) % 580));
      var br = 3.5 + S.hash(seed + 11.9) * 6.5;
      ctx.fillStyle = tintCol || "rgba(251, 250, 245, 0.34)";
      ctx.strokeStyle = "rgba(20, 17, 13, 0.42)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // Standard courier staging for Variations II (Turkey + Snail Out), III (Trout + Snail Climb), & interactive snailActive
  function drawCourierOverlay(ctx, S, W, H, t, beat, state, opts) {
    var cfg = opts || {};
    var u = beat.u;

    if (beat.index === 1) {
      // Variation II: Turkey Cutaway Badge + Mail Snail dispatched across lower stage
      var pop = S.easeOutBack(S.clamp(beat.localT / 0.45, 0, 1));
      S.drawTurkeyCutawayBadge(ctx, cfg.turkeyX || 128, cfg.turkeyY || 496, 1.04 * pop, t, {
        dispatch: S.smooth(0.05, 0.55, u)
      });
      var snailU = (beat.snailT !== null) ? beat.snailT : S.clamp((beat.localT - 0.18) / 3.55, 0, 1);
      var sx = S.lerp(225, 1060, snailU);
      var sy = (cfg.snailFloorY || 542) + Math.sin(t * 4.5) * 2.5;
      S.drawMailSnail(ctx, sx, sy, 1.24, t, { hasReply: false });
    } else if (beat.index === 2) {
      // Variation III: Mail Snail climbs up right architectural margin with stamped creek reply
      var climbU = (beat.snailT !== null) ? beat.snailT : S.clamp(beat.localT / 3.7, 0, 1);
      var rx = cfg.climbX || 1184;
      var ry = S.lerp(525, 148, climbU);
      S.drawMailSnail(ctx, rx, ry, 1.18, t, {
        rot: -Math.PI * 0.5,
        hasReply: true
      });
    } else if (beat.snailActive) {
      var su = (beat.snailT !== null) ? beat.snailT : ((t * 0.22) % 1);
      S.drawMailSnail(ctx, S.lerp(180, 1090, su), cfg.snailFloorY || 542, 1.2, t, {
        hasReply: beat.index >= 2,
        hasAlienStamp: beat.index === 3
      });
    }
  }

  // Pure geometric vector vowel glyph inside golden glass orb (#30 Beat A) — ZERO fillText/strokeText!
  function drawVectorVowelFilament(ctx, idx, r, glowCol, coreCol) {
    var s = r * 0.46;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (var pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass === 0 ? glowCol : coreCol;
      ctx.lineWidth = pass === 0 ? 7.5 : 3.4;
      ctx.beginPath();
      if (idx === 0) {
        // A
        ctx.moveTo(-s * 0.72, s * 0.85);
        ctx.lineTo(0, -s * 0.88);
        ctx.lineTo(s * 0.72, s * 0.85);
        ctx.moveTo(-s * 0.44, s * 0.22);
        ctx.lineTo(s * 0.44, s * 0.22);
      } else if (idx === 1) {
        // E
        ctx.moveTo(s * 0.58, -s * 0.82);
        ctx.lineTo(-s * 0.56, -s * 0.82);
        ctx.lineTo(-s * 0.56, s * 0.82);
        ctx.lineTo(s * 0.58, s * 0.82);
        ctx.moveTo(-s * 0.56, 0);
        ctx.lineTo(s * 0.38, 0);
      } else if (idx === 2) {
        // I
        ctx.moveTo(-s * 0.36, -s * 0.82);
        ctx.lineTo(s * 0.36, -s * 0.82);
        ctx.moveTo(0, -s * 0.82);
        ctx.lineTo(0, s * 0.82);
        ctx.moveTo(-s * 0.36, s * 0.82);
        ctx.lineTo(s * 0.36, s * 0.82);
      } else if (idx === 3) {
        // O
        ctx.ellipse(0, 0, s * 0.66, s * 0.84, 0, 0, TAU);
      } else if (idx === 4) {
        // U
        ctx.moveTo(-s * 0.62, -s * 0.84);
        ctx.lineTo(-s * 0.62, s * 0.22);
        ctx.arc(0, s * 0.22, s * 0.62, Math.PI, 0, true);
        ctx.lineTo(s * 0.62, -s * 0.84);
      } else {
        // Y
        ctx.moveTo(-s * 0.68, -s * 0.82);
        ctx.lineTo(0, 0.05 * s);
        ctx.lineTo(s * 0.68, -s * 0.82);
        ctx.moveTo(0, 0.05 * s);
        ctx.lineTo(0, s * 0.85);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // ============================================================================
  // PORTHOLE #26 · BOILER
  // bolasStyle: "cardboard-parallax" (la-mort-en-ce-jardin.webp × S05 Yuri Norstein)
  // Options:
  //   A: Glowing hot coals on the riverbed
  //   B: A giant pot of turkey soup
  //   C: A camper’s sunken cooking stove
  //   D: A fiery baby star hatchery
  // ============================================================================
  function renderP26(ctx, W, H, rawT, state) {
    var S = getStage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(26);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var lampBoost = beat.lampOn ? 1.0 : 0.38;

    // 1. Silver-Gelatin Monochrome Stage Backdrop (with Academy pillarbox delayed until after parallax)
    S.drawBolasBackdrop(ctx, W, H, "cardboard-parallax", 26, t, state, { pillarbox: false });

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.02 });

    var pxFar = S.parallaxX(0.22, t, state);
    var pyFar = S.parallaxY(0.22, t, state);
    var pxMid = S.parallaxX(0.52, t, state);
    var pyMid = S.parallaxY(0.52, t, state);
    var pxNear = S.parallaxX(0.88, t, state);
    var pyNear = S.parallaxY(0.88, t, state);

    // Plane 1 (Far): Monochrome pegboard supply wall & kernels from atlas-48.webp (cropped cleanly above nametag!)
    S.drawScissorCutout(
      ctx, aImg,
      24, 6, 210, 245,
      155 + pxFar, 34 + pyFar, 415, 295,
      [[0.03, 0.06], [0.52, 0.02], [0.97, 0.07], [0.94, 0.94], [0.46, 0.98], [0.05, 0.91]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.72, rot: -0.02 }
    );
    S.drawScissorCutout(
      ctx, aImg,
      24, 8, 210, 245,
      715 + pxFar, 42 + pyFar, 395, 285,
      [[0.05, 0.04], [0.64, 0.02], [0.96, 0.09], [0.95, 0.92], [0.35, 0.97], [0.03, 0.89]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.68, rot: 0.025 }
    );

    // Drifting Norstein silver mist layer 1
    S.drawNorsteinFog(ctx, W, H, t, 0.24 * lampBoost, "222, 226, 224");

    // Plane 2 (Mid-Back): Left & right rocky creek ledges scissor-cut from p26.jpg + jointed cardboard reeds
    S.drawScissorCutout(
      ctx, pImg,
      115, 220, 145, 165,
      96 + pxMid, 245 + pyMid, 330, 270,
      [[0.04, 0.12], [0.48, 0.03], [0.95, 0.22], [0.98, 0.92], [0.06, 0.96]],
      { filter: beat.index === 3 ? "cyan" : "mono", haloWidth: 4.5 }
    );
    S.drawScissorCutout(
      ctx, pImg,
      395, 320, 120, 165,
      855 + pxMid, 258 + pyMid, 325, 265,
      [[0.06, 0.20], [0.55, 0.04], [0.96, 0.14], [0.94, 0.96], [0.04, 0.92]],
      { filter: beat.index === 3 ? "cyan" : "mono", haloWidth: 4.5 }
    );

    // Jointed grey-cardboard creek reeds with split-pin hinges (Nora Willett secondary sway)
    var reedBases = [195, 248, 1015, 1068];
    for (var ri = 0; ri < reedBases.length; ri++) {
      var rx = reedBases[ri] + pxMid * 1.1;
      var ry = 490 + pyMid;
      var sway1 = S.wobble(t, 2.1, 0.14, ri * 1.3);
      var sway2 = S.wobble(t, 2.7, 0.22, ri * 1.3 - 0.7);
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(sway1);
      S.drawCardboardPuppetPiece(ctx, [[-9, 0], [-6, -95], [6, -95], [9, 0]], {
        tone: ri % 2 === 0 ? "#6c6d69" : "#848580",
        ribs: 2,
        pin: { x: 0, y: -4, r: 3.8, metal: "silver" }
      });
      ctx.translate(0, -90);
      ctx.rotate(sway2);
      S.drawCardboardPuppetPiece(ctx, [[-6, 4], [-2, -88], [3, -88], [6, 4]], {
        tone: "#9a9993",
        ribs: 2,
        pin: { x: 0, y: 0, r: 3.4, metal: "brass" }
      });
      ctx.restore();
    }

    // Warm volumetric ember glow rising from riverbed boiler cleft (reacts strongly to state.lamp!)
    var glowR = 340 * (0.65 + 0.35 * Math.sin(t * 3.4) * 0.15 + lampBoost * 0.35);
    var emberGrad = ctx.createRadialGradient(640 + pxMid * 0.6, 488 + pyMid, 18, 640 + pxMid * 0.6, 420 + pyMid, glowR);
    if (beat.index === 3) {
      emberGrad.addColorStop(0.0, "rgba(255, 244, 188, " + (0.88 * lampBoost).toFixed(3) + ")");
      emberGrad.addColorStop(0.45, "rgba(212, 42, 30, " + (0.42 * lampBoost).toFixed(3) + ")");
      emberGrad.addColorStop(0.78, "rgba(15, 143, 128, " + (0.24 * lampBoost).toFixed(3) + ")");
      emberGrad.addColorStop(1.0, "rgba(15, 143, 128, 0)");
    } else {
      emberGrad.addColorStop(0.0, "rgba(255, 222, 118, " + (0.92 * lampBoost).toFixed(3) + ")");
      emberGrad.addColorStop(0.45, "rgba(236, 108, 28, " + (0.52 * lampBoost).toFixed(3) + ")");
      emberGrad.addColorStop(1.0, "rgba(236, 108, 28, 0)");
    }
    ctx.fillStyle = emberGrad;
    ctx.fillRect(140, 40, 1000, 590);

    // Plane 3 (Hero Stage Center): 4 Variations of the Glowing Riverbed Boiler!
    var cx = 640 + pxMid * 0.7;
    var cy = 485 + pyMid * 0.8;

    // Base glowing coal pile cutout from p26.jpg (shared physical anchor across retellings!)
    if (beat.index !== 3 || beat.u < 0.35) {
      S.drawScissorCutout(
        ctx, pImg,
        242, 345, 158, 148,
        cx - 148, cy - 82, 296, 168,
        [[0.08, 0.25], [0.34, 0.05], [0.68, 0.04], [0.93, 0.26], [0.96, 0.86], [0.52, 0.97], [0.05, 0.85]],
        { filter: "none", haloWidth: 4.5 }
      );
    }

    if (beat.index === 0) {
      // --- VARIATION I (A): Glowing hot coals on the riverbed ---
      // Scissor-cut rising flame/bubble plume from p26.jpg + breathing hand-cut ember nuggets
      S.drawScissorCutout(
        ctx, pImg,
        262, 118, 118, 232,
        cx - 92 + Math.sin(t * 2.2) * 8, 96 + pyMid * 0.5, 184, 315,
        [[0.22, 0.03], [0.76, 0.04], [0.92, 0.48], [0.84, 0.96], [0.16, 0.96], [0.08, 0.46]],
        { filter: "none", haloWidth: 4.0, alpha: 0.92 }
      );

      // Pulsing handmade cut-paper ember coals along the fissure
      for (var ci = 0; ci < 7; ci++) {
        var ang = (ci / 6) * Math.PI - Math.PI;
        var ex = cx + Math.cos(ang) * 92 + (ci - 3) * 8;
        var ey = cy - 6 + Math.sin(ci * 2.1) * 16;
        var pulse = 0.86 + 0.18 * Math.sin(t * 5.2 + ci * 1.4);
        ctx.save();
        ctx.translate(ex, ey);
        ctx.scale(pulse, pulse);
        S.drawCutoutPaperEdge(
          ctx,
          [[-22, -8], [-6, -18], [18, -12], [24, 6], [6, 16], [-18, 12]],
          ci % 2 === 0 ? "#f5821f" : "#fbd14b",
          "#1b140e",
          { paperRim: 2.5 }
        );
        ctx.restore();
      }

      // Monochrome/tinted Brook Trout hovering upper-right inspecting the rising heat plume (like p26.jpg!)
      S.drawBrookTrout(
        ctx,
        890 + pxMid + Math.sin(t * 1.7) * 16,
        248 + pyMid + Math.cos(t * 2.3) * 10,
        1.22,
        t,
        false
      );
      S.drawTurkeyInCorner(ctx, 168 + pxNear, 515 + pyNear, 0.98, t, { dispatch: 0 });
    } else if (beat.index === 1) {
      // --- VARIATION II (B): A giant pot of turkey soup (+ Snail Mail Out) ---
      var drop = S.spring(beat.localT, 0.02, 12.5, 4.8);
      var potY = S.lerp(180, cy - 128, S.clamp(drop, 0, 1.08));

      // Giant dark-cardboard & riveted iron soup cauldron straddling the glowing coals
      ctx.save();
      ctx.translate(cx, potY);

      // Side loop handles with brass split-pins
      S.drawCardboardPuppetPiece(ctx, [[-195, -52], [-152, -68], [-152, -18], [-195, -26]], {
        tone: "#4a4a48", pin: { x: -160, y: -44, r: 4.5, metal: "brass" }
      });
      S.drawCardboardPuppetPiece(ctx, [[195, -52], [152, -68], [152, -18], [195, -26]], {
        tone: "#4a4a48", pin: { x: 160, y: -44, r: 4.5, metal: "brass" }
      });

      // Cauldron belly with mottled iron-cardboard & vertical rivet seam
      S.drawCardboardPuppetPiece(
        ctx,
        [[-164, -84], [164, -84], [148, 86], [92, 114], [-92, 114], [-148, 86]],
        {
          tone: "#3c3d3b",
          ribs: 4,
          pins: [[-130, -64], [-65, -64], [0, -64], [65, -64], [130, -64], [0, -18], [0, 34], [0, 82]]
        }
      );

      // Bubbling golden broth ellipse at rim + floating cut-paper carrots, celery & turkey drumstick bone!
      S.drawCutoutPaperEdge(
        ctx,
        [[-156, -84], [-95, -104], [0, -108], [95, -104], [156, -84], [95, -66], [0, -62], [-95, -66]],
        "#e8a838",
        "#14110d",
        { paperRim: 3.5 }
      );

      // Bobbing soup ingredients (carrot wheels, green herb stalks, cartoon bone — zero text!)
      var bob1 = Math.sin(t * 4.2) * 7;
      var bob2 = Math.cos(t * 3.7 + 1.2) * 7;
      S.drawCutoutPaperEdge(ctx, [[-92, -88 + bob1], [-68, -96 + bob1], [-58, -80 + bob1], [-84, -72 + bob1]], "#d95326", "#14110d", { paperRim: 2 });
      S.drawCutoutPaperEdge(ctx, [[56, -92 + bob2], [86, -98 + bob2], [92, -80 + bob2], [62, -74 + bob2]], "#5e8c42", "#14110d", { paperRim: 2 });
      // Cutout drumstick silhouette sticking out of soup!
      ctx.save();
      ctx.translate(-18, -96 + Math.sin(t * 3.1) * 5);
      ctx.rotate(-0.28 + Math.sin(t * 2.4) * 0.08);
      S.drawCutoutPaperEdge(ctx, [[-26, -16], [10, -20], [22, -4], [8, 14], [-24, 8]], "#b86b35", "#14110d", { paperRim: 2.5 });
      S.drawCutoutPaperEdge(ctx, [[18, -6], [48, -12], [54, -4], [48, 4], [18, 2]], "#f6f1e3", "#14110d", { paperRim: 2 });
      ctx.restore();

      // Rising curly paper steam ribbons
      for (var si = -1; si <= 1; si++) {
        var sx = si * 68 + Math.sin(t * 2.5 + si) * 12;
        S.drawCutoutPaperEdge(
          ctx,
          [[sx - 10, -118], [sx + 8, -162], [sx - 12, -208], [sx + 10, -242], [sx + 22, -204], [sx + 4, -158], [sx + 16, -118]],
          "#eceae2",
          "#2b2927",
          { paperRim: 2.0 }
        );
      }
      ctx.restore();

      // Two-bone IK cardboard chef arm stirring a giant ladle from upper-right!
      var stirX = cx + 34 + Math.cos(t * 2.8) * 54;
      var stirY = potY - 92 + Math.sin(t * 2.8) * 14;
      var ikChef = S.solveIK2(965, 118, 175, 165, stirX, stirY - 78, -1);
      drawJointedLimb(ctx, S, ikChef.x0, ikChef.y0, ikChef.jx, ikChef.jy, ikChef.ex, ikChef.ey, 28, 22, "#7c7b77", "#9e9c96", "brass");
      // Giant cardboard soup ladle attached to hand with split-pin
      ctx.save();
      ctx.translate(ikChef.ex, ikChef.ey);
      ctx.rotate(Math.sin(t * 2.8) * 0.16);
      S.drawCardboardPuppetPiece(ctx, [[-5, -6], [5, -6], [7, 86], [-7, 86]], { tone: "#b8b5ad", ribs: 1 });
      S.drawCutoutPaperEdge(ctx, [[-32, 78], [32, 78], [24, 104], [-24, 104]], "#d4d0c7", "#14110d", { paperRim: 2 });
      S.drawSplitPin(ctx, 0, 0, 4.4, { metal: "brass" });
      ctx.restore();
    } else if (beat.index === 2) {
      // --- VARIATION III (C): A camper's sunken cooking stove (+ Brook Trout & Snail Climb) ---
      var unfold = S.easeOutBack(S.clamp(beat.localT / 0.55, 0, 1));
      var stoveY = cy - 78;

      ctx.save();
      ctx.translate(cx - 35, stoveY);
      ctx.scale(unfold, unfold);

      // Folding forest-slate sheet-metal camp stove case + hinged windscreen wings
      S.drawCardboardPuppetPiece(
        ctx,
        [[-210, -28], [-165, -142], [-152, -142], [-165, -28]],
        { tone: "#4c5950", ribs: 2, pin: { x: -165, y: -32, r: 4.2, metal: "silver" } }
      );
      S.drawCardboardPuppetPiece(
        ctx,
        [[210, -28], [165, -142], [152, -142], [165, -28]],
        { tone: "#4c5950", ribs: 2, pin: { x: 165, y: -32, r: 4.2, metal: "silver" } }
      );
      S.drawCardboardPuppetPiece(
        ctx,
        [[-168, -145], [168, -145], [168, -26], [-168, -26]],
        { tone: "#3b473f", ribs: 3 }
      );

      // Stove body box with grate bars, red control dials & cylindrical brass camp-fuel tank!
      S.drawCardboardPuppetPiece(
        ctx,
        [[-182, -28], [182, -28], [174, 48], [-174, 48]],
        { tone: "#59685d", ribs: 2, pins: [[-158, 10], [158, 10]] }
      );
      // Folded camp-stove scissor legs
      S.drawCardboardPuppetPiece(ctx, [[-150, 46], [-132, 46], [-164, 112], [-180, 112]], { tone: "#888782", pin: { x: -142, y: 48, r: 4 } });
      S.drawCardboardPuppetPiece(ctx, [[150, 46], [132, 46], [164, 112], [180, 112]], { tone: "#888782", pin: { x: 142, y: 48, r: 4 } });

      // Two blue-amber camp-stove burner rings + speckled camp kettle & skillet!
      for (var bi = -1; bi <= 1; bi += 2) {
        var bx = bi * 82;
        S.drawCutoutPaperEdge(ctx, [[bx - 48, -36], [bx + 48, -36], [bx + 40, -24], [bx - 40, -24]], "#2a9d8f", "#14110d", { paperRim: 2 });
        // Rotating red valve dial
        ctx.save();
        ctx.translate(bx, 10);
        ctx.rotate(t * 2.2 * bi);
        S.drawCutoutPaperEdge(ctx, [[-14, -14], [14, -14], [14, 14], [-14, 14]], "#d42a1e", "#14110d", { paperRim: 2 });
        S.drawSplitPin(ctx, 0, 0, 3.6, { metal: "brass" });
        ctx.restore();
      }

      // Brass cylindrical camp propane bottle mounted on right side
      S.drawCutoutPaperEdge(ctx, [[178, -16], [248, -16], [254, 28], [178, 28]], "#d4a44c", "#14110d", { paperRim: 3 });

      // Speckled blue-enamel camp coffee kettle whistling on left burner
      var rattle = Math.sin(t * 14.0) * 0.035;
      ctx.save();
      ctx.translate(-82, -38);
      ctx.rotate(rattle);
      S.drawCutoutPaperEdge(
        ctx,
        [[-46, 0], [-36, -68], [34, -68], [46, 0]],
        "#3b6e8c",
        "#14110d",
        { paperRim: 3 }
      );
      // Spout + arched bail handle
      S.drawCutoutPaperEdge(ctx, [[36, -48], [68, -74], [72, -60], [42, -30]], "#3b6e8c", "#14110d", { paperRim: 2 });
      S.drawCutoutPaperEdge(ctx, [[-16, -68], [16, -68], [12, -82], [-12, -82]], "#d42a1e", "#14110d", { paperRim: 2 });
      ctx.restore();

      // Cast-iron camp skillet flipping a golden pancake/egg on right burner!
      var flipY = -52 - Math.abs(Math.sin(t * 3.6)) * 56;
      S.drawCardboardPuppetPiece(ctx, [[36, -38], [132, -38], [124, -18], [44, -18]], { tone: "#2d2e2c", ribs: 1 });
      S.drawCutoutPaperEdge(ctx, [[56, flipY - 10], [112, flipY - 12], [116, flipY + 6], [52, flipY + 8]], "#f7dd8c", "#14110d", { paperRim: 2.5 });
      ctx.restore();

      // Brook Trout camper on right adjusting fuel tank with IK fin!
      var troutX = 955 + pxMid * 0.5;
      var troutY = 395 + pyMid * 0.5 + Math.sin(t * 2.2) * 8;
      var ikFin = S.solveIK2(troutX - 42, troutY + 12, 68, 64, cx + 195, stoveY + 4, 1);
      drawJointedLimb(ctx, S, ikFin.x0, ikFin.y0, ikFin.jx, ikFin.jy, ikFin.ex, ikFin.ey, 14, 11, "#8f9c8a", "#b87458", "brass");
      S.drawBrookTrout(ctx, troutX, troutY, 1.26, t, false);
    } else {
      // --- VARIATION IV (D): A fiery baby star hatchery (+ Alien Listening Post) ---
      S.drawAlienSaucer(ctx, 640 + pxMid * 0.4, 124 + pyMid * 0.3, 1.24, t, cx, cy - 80, { beamSpread: 185 });

      // Hatching cardboard cosmic egg-shells along riverbed opening on brass split-pins!
      for (var ei = -2; ei <= 2; ei++) {
        var hx = cx + ei * 112;
        var hy = cy - 10 + Math.abs(ei) * 8;
        var openA = 0.38 + 0.25 * Math.sin(t * 2.6 + ei);
        ctx.save();
        ctx.translate(hx, hy);
        // Left & right hinged egg-shell halves
        ctx.save();
        ctx.rotate(-openA);
        S.drawCardboardPuppetPiece(ctx, [[-36, 0], [-28, -42], [0, -24], [0, 12]], { tone: "#6e6b66", ribs: 2 });
        ctx.restore();
        ctx.save();
        ctx.rotate(openA);
        S.drawCardboardPuppetPiece(ctx, [[36, 0], [28, -42], [0, -24], [0, 12]], { tone: "#85827c", ribs: 2 });
        ctx.restore();
        S.drawSplitPin(ctx, 0, 8, 4.2, { metal: "brass" });

        // Rising spinning 6-pointed golden-crimson baby protostar + orbital ring!
        var riseU = ((t * 0.36 + (ei + 2) * 0.19) % 1);
        var starY = -36 - riseU * 235;
        var starX = Math.sin(t * 2.1 + ei * 1.7) * 22;
        var starSc = 0.65 + Math.sin(riseU * Math.PI) * 0.55;
        ctx.save();
        ctx.translate(starX, starY);
        ctx.scale(starSc, starSc);
        ctx.strokeStyle = "rgba(255, 232, 162, 0.78)";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 44, 13, Math.sin(t + ei) * 0.4, 0, TAU);
        ctx.stroke();

        ctx.rotate(t * (1.8 + ei * 0.3));
        var starPts = [];
        for (var sp = 0; sp < 12; sp++) {
          var sr = sp % 2 === 0 ? 30 : 12;
          var sa = (sp / 12) * TAU;
          starPts.push([Math.cos(sa) * sr, Math.sin(sa) * sr]);
        }
        S.drawCutoutPaperEdge(ctx, starPts, ei % 2 === 0 ? "#ffe066" : "#ff7b3b", "#14110d", { paperRim: 2.5 });
        S.drawSplitPin(ctx, 0, 0, 3.6, { metal: "brass" });
        ctx.restore();

        ctx.restore();
      }
    }

    // Plane 5 (Foreground): Dark stony riverbed rim + kernel sack crop from atlas-48.webp
    S.drawScissorCutout(
      ctx, aImg,
      88, 390, 180, 175,
      108 + pxNear, 468 + pyNear, 205, 155,
      [[0.08, 0.14], [0.58, 0.04], [0.94, 0.22], [0.92, 0.94], [0.06, 0.92]],
      { filter: "mono", haloWidth: 4.0 }
    );
    drawBallastBubbles(ctx, S, W, H, t, state, "rgba(255, 226, 158, 0.35)");
    drawCourierOverlay(ctx, S, W, H, t, beat, state, { turkeyX: 162, turkeyY: 492, snailFloorY: 546, climbX: 1138 });

    S.endCamera(ctx);

    // Academy 4:3 dark pillarbox bars matching la-mort-en-ce-jardin.webp
    ctx.fillStyle = "#17181a";
    ctx.fillRect(0, 0, 82, H);
    ctx.fillRect(W - 82, 0, 82, H);

    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 26);
  }

  // ============================================================================
  // PORTHOLE #27 · PORT M
  // bolasStyle: "duchamp-optic" (Martino Variations × S28 Plate Foundry)
  // Options:
  //   A: An old sunken rabbit-ear TV
  //   B: An urgent rescue radio signal
  //   C: The creek cable repairman’s van
  //   D: An alien brainwashing ray-tube
  // ============================================================================
  function renderP27(ctx, W, H, rawT, state) {
    var S = getStage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(27);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    // 1. Dark Workshop Slate Backdrop ("duchamp-optic")
    S.drawBolasBackdrop(ctx, W, H, "duchamp-optic", 27, t, state);
    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    var pxFar = S.parallaxX(0.25, t, state);
    var pyFar = S.parallaxY(0.25, t, state);
    var pxMid = S.parallaxX(0.55, t, state);
    var pyMid = S.parallaxY(0.55, t, state);
    var pxNear = S.parallaxX(0.88, t, state);
    var pyNear = S.parallaxY(0.88, t, state);

    // Plane 1 (Far): Luminous emerald-cyan stage aura from atlas-17.webp + rotating Duchamp eccentric optic rotor!
    S.drawScissorCutout(
      ctx, aImg,
      18, 18, 420, 510,
      115 + pxFar, 38 + pyFar, 460, 470,
      [[0.06, 0.08], [0.54, 0.02], [0.95, 0.12], [0.92, 0.92], [0.44, 0.98], [0.04, 0.88]],
      { filter: beat.index === 1 ? "sepia" : "none", haloWidth: 4.0, alpha: 0.62 }
    );

    // Engraved Duchamp Anémic-Cinéma eccentric counter-rotating optical disc on dark slate!
    ctx.save();
    ctx.translate(640 + pxFar * 0.8, 286 + pyFar * 0.8);
    ctx.rotate(t * (beat.index === 3 ? 2.4 : 0.65));
    for (var ri = 6; ri >= 1; ri--) {
      var rOuter = ri * 42;
      var eccX = (6 - ri) * 6.5;
      ctx.strokeStyle = ri % 2 === 0 ? "rgba(251, 250, 245, 0.22)" : "rgba(15, 143, 128, 0.28)";
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.arc(eccX, 0, rOuter, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    if (beat.lampOn) {
      S.drawLampBeam(ctx, W, H, t, state, { x: 240, y: 610, aimX: 560, spread: 290, alpha: 0.15 });
    }

    // Plane 2: Torn-paper slate river floor & kelp plate from p27.jpg
    S.drawTornPaperFlat(ctx, 40, 492 + pyMid, W - 80, 130, {
      fill: "#1f2e30",
      paperColor: "#ebe5d5",
      deckle: 6.5,
      seed: 27.4
    });
    S.drawScissorCutout(
      ctx, pImg,
      112, 222, 92, 165,
      88 + pxMid, 265 + pyMid, 175, 250,
      [[0.08, 0.06], [0.85, 0.04], [0.94, 0.92], [0.06, 0.96]],
      { filter: "none", haloWidth: 4.0 }
    );

    // Core Stage Prop Anchor: Sunken Rabbit-Ear TV / Radio Tower / Cable Van / Ray-Tube
    var tvX = 515 + pxMid * 0.8;
    var tvY = 335 + pyMid * 0.8;

    if (beat.index === 0) {
      // --- VARIATION I (A): An old sunken rabbit-ear TV ---
      // Scissor-cut wooden CRT cabinet from p27.jpg + articulated rabbit-ears & scrubbing sponge puppet!
      ctx.save();
      ctx.translate(tvX, tvY);
      ctx.rotate(-0.04 + Math.sin(t * 1.4) * 0.012);

      // Jointed rabbit-ear V-dipole antennas with spring-wobble tips & split-pin base
      var antL = -0.68 + S.wobble(t, 3.2, 0.09, 0.4);
      var antR = 0.62 + S.wobble(t, 3.6, 0.09, 1.9);
      ctx.strokeStyle = "#d9dce0";
      ctx.lineWidth = 5.0;
      ctx.beginPath();
      ctx.moveTo(-6, -126);
      ctx.lineTo(-6 + Math.sin(antL) * 145, -126 - Math.cos(antL) * 145);
      ctx.moveTo(10, -126);
      ctx.lineTo(10 + Math.sin(antR) * 155, -126 - Math.cos(antR) * 155);
      ctx.stroke();
      S.drawCutoutPaperEdge(ctx, [[-38, -114], [-22, -134], [26, -134], [42, -114]], "#8d9499", "#14110d", { paperRim: 2.5 });
      S.drawSplitPin(ctx, 2, -124, 4.4, { metal: "silver" });

      // Real wooden TV cabinet plate from p27.jpg!
      S.drawScissorCutout(
        ctx, pImg,
        168, 185, 278, 228,
        -205, -118, 410, 286,
        [[0.03, 0.06], [0.88, 0.02], [0.98, 0.09], [0.97, 0.92], [0.12, 0.98], [0.02, 0.88]],
        { filter: "none", haloWidth: 5.0 }
      );

      // Animated jointed yellow sponge character + IK wiping cloth arm over the CRT glass!
      ctx.save();
      ctx.beginPath();
      ctx.rect(-132, -74, 218, 184);
      ctx.clip();
      var spX = -18 + Math.sin(t * 2.8) * 26;
      var spY = 16 + Math.cos(t * 5.6) * 8;
      // Glowing aqua screen wash + animated wiping cloth arc
      ctx.fillStyle = "rgba(218, 248, 238, 0.34)";
      ctx.fillRect(-132, -74, 218, 184);
      ctx.save();
      ctx.translate(spX, spY);
      ctx.rotate(Math.sin(t * 2.8) * 0.16);
      S.drawCutoutPaperEdge(ctx, [[-34, -44], [30, -48], [36, 36], [-28, 42]], "#f8d43c", "#14110d", { paperRim: 2.5 });
      // Sponge pores & cheerful eyes (0 text!)
      var pores = [[-16, -26, 4], [12, -28, 3.5], [-18, 18, 4.5], [14, 20, 3.5], [0, 26, 3]];
      for (var pi = 0; pi < pores.length; pi++) {
        ctx.fillStyle = "#c99b18";
        ctx.beginPath(); ctx.arc(pores[pi][0], pores[pi][1], pores[pi][2], 0, TAU); ctx.fill();
      }
      ctx.fillStyle = "#14110d";
      ctx.beginPath(); ctx.arc(-8, -6, 3.5, 0, TAU); ctx.arc(10, -7, 3.5, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(1, -1, 7, 0.15, Math.PI - 0.15); ctx.stroke();

      // IK wiping rag arm scrubbing algae!
      var wipeX = -52 + Math.sin(t * 6.5) * 18;
      var wipeY = -12 + Math.cos(t * 6.5) * 24;
      S.drawCutoutPaperEdge(ctx, [[wipeX - 18, wipeY - 16], [wipeX + 14, wipeY - 20], [wipeX + 18, wipeY + 14], [wipeX - 14, wipeY + 18]], "#72c4e8", "#14110d", { paperRim: 2 });
      ctx.restore();
      ctx.restore();

      // Rotating cardboard tuner dials with brass split-pins on right bezel
      for (var di = 0; di < 2; di++) {
        ctx.save();
        ctx.translate(142, -46 + di * 54);
        ctx.rotate(t * (1.2 - di * 1.9));
        S.drawCardboardPuppetPiece(ctx, [[-18, -18], [18, -18], [18, 18], [-18, 18]], { tone: "#b8b6af", ribs: 1 });
        S.drawSplitPin(ctx, 0, 0, 4.0, { metal: "brass" });
        ctx.restore();
      }
      ctx.restore();

      // Two couch-potato trout cutout from p27.jpg + live articulated Brook Trout companion!
      S.drawScissorCutout(
        ctx, pImg,
        296, 355, 214, 145,
        690 + pxNear * 0.7, 356 + pyNear * 0.7, 315, 205,
        [[0.05, 0.24], [0.58, 0.04], [0.96, 0.14], [0.95, 0.94], [0.06, 0.95]],
        { filter: "none", haloWidth: 4.5 }
      );
      S.drawTurkeyInCorner(ctx, 132 + pxNear, 512 + pyNear, 1.0, t, { dispatch: 0 });
    } else if (beat.index === 1) {
      // --- VARIATION II (B): An urgent rescue radio signal (+ Snail Mail Out) ---
      // Tall cross-braced cardboard & brass radio transmission tower rising from the TV console!
      var towerX = 610 + pxMid * 0.7;
      var towerTipY = 86 + pyMid * 0.4;

      // Expanding concentric Morse rescue pulse rings (dot-dot-dot-dash geometry — 0 text!)
      for (var wi = 0; wi < 4; wi++) {
        var wu = ((t * 0.75 + wi * 0.25) % 1);
        var wr = 28 + wu * 340;
        var wa = (1 - wu) * 0.85;
        ctx.save();
        ctx.translate(towerX, towerTipY + 18);
        ctx.strokeStyle = wi % 2 === 0
          ? "rgba(212, 42, 30, " + wa.toFixed(3) + ")"
          : "rgba(247, 221, 140, " + wa.toFixed(3) + ")";
        ctx.lineWidth = 4.2;
        ctx.setLineDash(wi % 2 === 0 ? [12, 10, 12, 10, 12, 18] : [36, 14, 36, 14, 36, 20]);
        ctx.beginPath();
        ctx.arc(0, 0, wr, -Math.PI * 0.92, -Math.PI * 0.08);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, wr * 0.75, Math.PI * 0.08, Math.PI * 0.92);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Lattice radio mast + TV console turned into oscillating green rescue oscilloscope!
      S.drawCardboardPuppetPiece(
        ctx,
        [[towerX - 68, 345], [towerX - 14, towerTipY], [towerX + 14, towerTipY], [towerX + 68, 345]],
        {
          tone: "#8f8d86",
          ribs: 5,
          pins: [[towerX, towerTipY + 14], [towerX - 34, 225], [towerX + 34, 225]]
        }
      );
      // Flashing crimson beacon bulb at mast peak
      var flash = 0.65 + 0.35 * Math.sin(t * 11.0);
      S.drawCutoutPaperEdge(
        ctx,
        [[towerX - 18, towerTipY + 8], [towerX, towerTipY - 22], [towerX + 18, towerTipY + 8]],
        flash > 0.8 ? "#ff4d3d" : "#b8251a",
        "#14110d",
        { paperRim: 2.5 }
      );

      // Radio receiver cabinet at base with glowing green sine/spike waveform & telegraph key!
      S.drawCardboardPuppetPiece(
        ctx,
        [[towerX - 195, 332], [towerX + 195, 332], [towerX + 185, 505], [towerX - 185, 505]],
        { tone: "#474a4f", ribs: 3, pins: [[towerX - 165, 358], [towerX + 165, 358]] }
      );
      ctx.fillStyle = "#0e2923";
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 3;
      ctx.fillRect(towerX - 145, 358, 210, 118);
      ctx.strokeRect(towerX - 145, 358, 210, 118);

      // Live green rescue oscilloscope trace
      ctx.strokeStyle = "#3bf5b5";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      for (var ox = 0; ox <= 194; ox += 6) {
        var oy = 417 + Math.sin(ox * 0.11 - t * 14.0) * 28 * Math.sin((ox / 194) * Math.PI);
        if (ox === 0) ctx.moveTo(towerX - 137 + ox, oy);
        else ctx.lineTo(towerX - 137 + ox, oy);
      }
      ctx.stroke();

      // Compass / RDF dial on right of receiver
      ctx.save();
      ctx.translate(towerX + 122, 417);
      S.drawCutoutPaperEdge(ctx, [[-38, -38], [38, -38], [38, 38], [-38, 38]], "#fbfaf5", "#14110d", { paperRim: 2 });
      ctx.rotate(Math.sin(t * 3.8) * 0.9);
      S.drawCutoutPaperEdge(ctx, [[-6, 22], [0, -30], [6, 22]], "#d42a1e", "#14110d", { paperRim: 1.5, shadow: false });
      S.drawSplitPin(ctx, 0, 0, 4.0, { metal: "brass" });
      ctx.restore();
    } else if (beat.index === 2) {
      // --- VARIATION III (C): The creek cable repairman’s van (+ Brook Trout & Snail Climb) ---
      var vanBounce = Math.sin(t * 6.2) * 3.5;
      var vx = 525 + pxMid * 0.7;
      var vy = 358 + pyMid * 0.6 + vanBounce;

      ctx.save();
      ctx.translate(vx, vy);

      // Roof utility rack, striped wooden extension ladder & spinning amber beacon dome!
      S.drawCardboardPuppetPiece(ctx, [[-195, -146], [175, -146], [175, -130], [-195, -130]], {
        tone: "#d99e3b", ribs: 1, pins: [[-145, -138], [125, -138]]
      });
      S.drawCutoutPaperEdge(ctx, [[45, -174], [85, -174], [92, -146], [38, -146]], "#ff9f1c", "#14110d", { paperRim: 2.5 });

      // Boxy cardboard utility repair van chassis (with p27 TV screen cropped inside the cab window!)
      S.drawCardboardPuppetPiece(
        ctx,
        [[-225, -130], [135, -130], [215, -36], [222, 74], [-225, 74]],
        {
          tone: "#d8cbb0",
          ribs: 3,
          pins: [[-195, -102], [8, -102], [8, 48], [-195, 48]]
        }
      );
      // Teal repair-service stripe + giant coiled coax cable reel mounted on side panel (0 text!)
      S.drawCutoutPaperEdge(ctx, [[-218, -18], [214, -18], [214, 16], [-218, 16]], "#0f8f80", "#14110d", { paperRim: 2, shadow: false });
      S.drawScissorCutout(
        ctx, pImg,
        222, 228, 162, 148,
        36, -112, 132, 92,
        [[0.04, 0.05], [0.78, 0.05], [0.98, 0.94], [0.04, 0.94]],
        { filter: "none", haloWidth: 3.0 }
      );

      // Coaxial cable spool on van side
      ctx.save();
      ctx.translate(-108, -42);
      ctx.rotate(t * 1.9);
      S.drawCardboardPuppetPiece(ctx, [[-44, -44], [44, -44], [44, 44], [-44, 44]], { tone: "#52555a", ribs: 2 });
      S.drawSplitPin(ctx, 0, 0, 5.2, { metal: "brass" });
      ctx.restore();

      // Rotating cardboard split-pin van tires!
      var wheelXs = [-132, 134];
      for (var wi2 = 0; wi2 < 2; wi2++) {
        ctx.save();
        ctx.translate(wheelXs[wi2], 78 - vanBounce * 0.6);
        ctx.rotate(t * 4.2);
        S.drawCutoutPaperEdge(
          ctx,
          [[-42, -16], [-16, -42], [16, -42], [42, -16], [42, 16], [16, 42], [-16, 42], [-42, 16]],
          "#232528",
          "#14110d",
          { paperRim: 3.0 }
        );
        S.drawSplitPin(ctx, 0, 0, 6.2, { metal: "silver" });
        ctx.restore();
      }
      ctx.restore();

      // Brook Trout cable technician in yellow hard-hat splicing heavy underwater coax cable with IK wrench!
      var techX = 948 + pxMid * 0.5;
      var techY = 392 + pyMid * 0.5;
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(vx + 210, vy + 36);
      ctx.bezierCurveTo(790, 495, 830, 345, techX - 68, techY + 8);
      ctx.stroke();
      ctx.strokeStyle = "#0f8f80";
      ctx.lineWidth = 4;
      ctx.stroke();

      var ikWrench = S.solveIK2(techX - 36, techY + 12, 66, 62, techX - 118, techY + 4 + Math.sin(t * 7.0) * 18, 1);
      drawJointedLimb(ctx, S, ikWrench.x0, ikWrench.y0, ikWrench.jx, ikWrench.jy, ikWrench.ex, ikWrench.ey, 14, 11, "#8f9c8a", "#d99e3b", "brass");
      S.drawBrookTrout(ctx, techX, techY, 1.24, t, false);
      // Tiny cut-paper yellow repairman hard-hat perched on Trout's head!
      S.drawCutoutPaperEdge(
        ctx,
        [[techX - 82, techY - 22], [techX - 66, techY - 48], [techX - 30, techY - 46], [techX - 18, techY - 20]],
        "#f7c948",
        "#14110d",
        { paperRim: 2.0 }
      );
    } else {
      // --- VARIATION IV (D): An alien brainwashing ray-tube (+ Alien Listening Post) ---
      // Scissor-cut blue cosmic operator from atlas-17.webp conducting upper-left!
      S.drawScissorCutout(
        ctx, aImg,
        425, 95, 345, 405,
        92 + pxMid * 0.6, 138 + pyMid * 0.5, 255, 305,
        [[0.12, 0.04], [0.84, 0.04], [0.96, 0.52], [0.88, 0.96], [0.08, 0.94]],
        { filter: "none", haloWidth: 4.5 }
      );

      S.drawAlienSaucer(ctx, 560 + pxMid * 0.4, 112 + pyMid * 0.3, 1.2, t, 510, 320, { beamSpread: 155 });

      // CRT cabinet extends accordion cardboard bellows into a giant hypnosis ray-cannon!
      S.drawScissorCutout(
        ctx, pImg,
        168, 185, 278, 228,
        325 + pxMid * 0.7, 245 + pyMid * 0.7, 295, 225,
        [[0.04, 0.06], [0.92, 0.03], [0.97, 0.94], [0.05, 0.95]],
        { filter: "cyan", haloWidth: 4.5 }
      );

      // Telescoping bellows + projecting Duchamp hypnotic spiral cone hitting the two trout!
      var ext = 52 + Math.sin(t * 4.2) * 18;
      S.drawCardboardPuppetPiece(
        ctx,
        [[565, 305], [565 + ext, 278], [565 + ext, 418], [565, 392]],
        { tone: "#696d75", ribs: 4, pin: { x: 568, y: 348, r: 4.5, metal: "brass" } }
      );

      // Hypnotic ray-beam + nested counter-rotating black/cream/crimson hypnosis rings!
      var muzzleX = 565 + ext;
      var muzzleY = 348;
      var rayG = ctx.createLinearGradient(muzzleX, muzzleY, 1080, 420);
      rayG.addColorStop(0.0, "rgba(212, 42, 30, 0.52)");
      rayG.addColorStop(0.55, "rgba(15, 143, 128, 0.38)");
      rayG.addColorStop(1.0, "rgba(247, 221, 140, 0.05)");
      ctx.fillStyle = rayG;
      ctx.beginPath();
      ctx.moveTo(muzzleX, muzzleY - 46);
      ctx.lineTo(1110, 215);
      ctx.lineTo(1110, 545);
      ctx.lineTo(muzzleX, muzzleY + 46);
      ctx.closePath();
      ctx.fill();

      for (var hi = 0; hi < 5; hi++) {
        var hu = ((t * 0.68 + hi / 5) % 1);
        var hx = S.lerp(muzzleX + 24, 985, hu);
        var hy = S.lerp(muzzleY, 418, hu);
        var hr = S.lerp(32, 105, hu);
        ctx.save();
        ctx.translate(hx, hy);
        ctx.scale(0.52, 1.0);
        ctx.rotate(t * (hi % 2 === 0 ? 5.0 : -5.0));
        ctx.strokeStyle = hi % 2 === 0 ? "#fbfaf5" : "#d42a1e";
        ctx.lineWidth = 4.0;
        ctx.setLineDash([14, 10]);
        ctx.beginPath();
        ctx.arc(0, 0, hr, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Two mesmerized Brook Trout floating in zero-gravity trance on right!
      S.drawBrookTrout(ctx, 940, 365 + Math.sin(t * 3.0) * 16, 1.08, t, false, { tilt: -0.18 });
      S.drawBrookTrout(ctx, 1045, 455 + Math.cos(t * 3.0) * 16, 0.98, t, false, { tilt: -0.22 });
    }

    drawBallastBubbles(ctx, S, W, H, t, state, "rgba(216, 243, 238, 0.30)");
    drawCourierOverlay(ctx, S, W, H, t, beat, state, { turkeyX: 128, turkeyY: 492, snailFloorY: 544, climbX: 1184 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 27);
  }

  // ============================================================================
  // PORTHOLE #28 · STBD M
  // bolasStyle: "daumier-litho" (boucle-la.webp Ink-Band × S06 John Whitney × Oucipo)
  // Options:
  //   A: Silver minnows swimming in a wave
  //   B: A glowing highway exit arrow
  //   C: A flashy holiday parade leader
  //   D: A swarm of liquid-metal nanobots
  // ============================================================================
  function renderP28(ctx, W, H, rawT, state) {
    var S = getStage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(28);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    // 1. Stark Cream-White Paper + Wide Ink-Black Cinema Band (132..568, exact boucle-la.webp!)
    S.drawBolasBackdrop(ctx, W, H, "daumier-litho", 28, t, state, { bandTop: 128, bandBot: 572 });
    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.0 });

    var pxFar = S.parallaxX(0.24, t, state);
    var pyFar = S.parallaxY(0.24, t, state);
    var pxMid = S.parallaxX(0.56, t, state);
    var pyMid = S.parallaxY(0.56, t, state);

    // Plane 1: Lithograph-filtered Méliès compartment & etched sea-waves (atlas-03.webp) + mossy stone bridge arch (p28.jpg)!
    S.drawScissorCutout(
      ctx, aImg,
      24, 602, 970, 168,
      78 + pxFar, 468 + pyFar, 1120, 98,
      [[0.02, 0.14], [0.50, 0.04], [0.98, 0.12], [0.99, 0.92], [0.50, 0.97], [0.01, 0.90]],
      { filter: "litho", haloWidth: 3.5, alpha: 0.78 }
    );
    S.drawScissorCutout(
      ctx, pImg,
      118, 105, 404, 182,
      245 + pxMid * 0.6, 106 + pyMid * 0.5, 790, 215,
      [[0.02, 0.88], [0.08, 0.34], [0.28, 0.05], [0.50, 0.02], [0.72, 0.05], [0.92, 0.34], [0.98, 0.88], [0.84, 0.94], [0.74, 0.48], [0.50, 0.34], [0.26, 0.48], [0.16, 0.94]],
      { filter: "litho", haloWidth: 5.0 }
    );

    if (beat.lampOn) {
      S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 575, aimX: 680, spread: 320, alpha: 0.13 });
    }

    // John Whitney Harmonic S-Curve Spine Generator (shared across Fibonacci minnow swarm!)
    function sampleSWave(u, time) {
      // Sweeps from lower-left (310, 535) -> right belly (825, 415) -> left waist (485, 295) -> arrow tip (795, 205)
      var y = S.lerp(536, 198, u);
      var sCurve = Math.sin(u * Math.PI * 1.85 - 0.35) * 215 * (1 - u * 0.35);
      var breathe = Math.sin(time * 2.4 - u * 4.2) * 18;
      var x = 615 + sCurve + breathe + (u > 0.72 ? (u - 0.72) * 420 : 0);
      return { x: x + pxMid * 0.8, y: y + pyMid * 0.7 };
    }

    if (beat.index === 0) {
      // --- VARIATION I (A): Silver minnows swimming in a wave ---
      // 34 high-contrast litho white-halo cut-paper minnows schooling in S-wave + arrowhead tip (matching p28.jpg!)
      var totalFish = 34;
      for (var i = 0; i < totalFish; i++) {
        var u = i / (totalFish - 1);
        var lane = ((i % 5) - 2) * (1 - u * 0.72) * 17;
        var p0 = sampleSWave(u, t);
        var p1 = sampleSWave(Math.min(1, u + 0.03), t);
        var ang = Math.atan2(p1.y - p0.y, p1.x - p0.x);
        var nx = -Math.sin(ang) * lane;
        var ny = Math.cos(ang) * lane;
        var sc = 0.78 + (1 - Math.abs((i % 5) - 2) * 0.12) * 0.32;

        ctx.save();
        ctx.translate(p0.x + nx, p0.y + ny);
        ctx.rotate(ang);
        ctx.scale(sc, sc);
        var wag = Math.sin(t * 9.5 - i * 0.55) * 5.5;
        S.drawCutoutPaperEdge(
          ctx,
          [[19, 0], [5, -7], [-11, -5], [-21, -10 + wag], [-16, wag * 0.5], [-21, 10 + wag], [-11, 5], [5, 7]],
          "#fbfaf7",
          "#0b0c0e",
          { paperRim: 2.2, lineWidth: 1.8 }
        );
        // Cross-hatch dorsal stroke + eye dot
        ctx.fillStyle = "#0b0c0e";
        ctx.beginPath(); ctx.arc(11, -1.5, 1.8, 0, TAU); ctx.fill();
        ctx.restore();
      }
      S.drawTurkeyInCorner(ctx, 134, 495, 0.98, t, { dispatch: 0 });
    } else if (beat.index === 1) {
      // --- VARIATION II (B): A glowing highway exit arrow (+ Snail Mail Out) ---
      // Overhead steel-truss highway gantry sign + sweeping asphalt lane curve & blinking emerald/amber exit arrow!
      ctx.save();
      // Dashed curving highway exit ramp ribbons across the ink band
      ctx.strokeStyle = "#fbfaf7";
      ctx.lineWidth = 6.0;
      ctx.setLineDash([28, 18]);
      ctx.beginPath();
      for (var s = 0; s <= 24; s++) {
        var pt = sampleSWave(s / 24, t * 0.25);
        if (s === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Steel gantry posts & reflective emerald highway exit sign board (pure geometric icons — 0 text!)
      var gx = 655 + pxMid * 0.6;
      var gy = 262 + pyMid * 0.5;
      S.drawCardboardPuppetPiece(ctx, [[gx - 285, gy - 18], [gx - 265, gy - 18], [gx - 265, 558], [gx - 285, 558]], {
        tone: "#9a9d9e", ribs: 4, pin: { x: gx - 275, y: gy, r: 4.5 }
      });
      S.drawCardboardPuppetPiece(ctx, [[gx + 265, gy - 18], [gx + 285, gy - 18], [gx + 285, 558], [gx + 265, 558]], {
        tone: "#9a9d9e", ribs: 4, pin: { x: gx + 275, y: gy, r: 4.5 }
      });

      // Reflective highway green board with crisp white border & chasing amber chevron arrow!
      S.drawCutoutPaperEdge(
        ctx,
        [[gx - 245, gy - 88], [gx + 245, gy - 88], [gx + 245, gy + 76], [gx - 245, gy + 76]],
        "#0f8f80",
        "#14110d",
        { paperRim: 5.5, lineWidth: 2.6 }
      );
      // Bold geometric highway shield + sweeping right-upward exit arrow!
      S.drawCutoutPaperEdge(
        ctx,
        [[gx - 195, gy - 42], [gx - 125, gy - 42], [gx - 115, gy + 24], [gx - 160, gy + 44], [gx - 205, gy + 24]],
        "#fbfaf7",
        "#14110d",
        { paperRim: 2, shadow: false }
      );
      S.drawCutoutPaperEdge(
        ctx,
        [[gx - 195, gy - 42], [gx - 125, gy - 42], [gx - 125, gy - 22], [gx - 195, gy - 22]],
        "#d42a1e",
        "#14110d",
        { paperRim: 0, shadow: false }
      );

      // Giant glowing exit arrow with sequential chasing amber bulbs!
      S.drawCutoutPaperEdge(
        ctx,
        [[gx - 72, gy + 36], [gx + 68, gy - 22], [gx + 52, gy - 54], [gx + 188, gy - 38], [gx + 112, gy + 58], [gx + 92, gy + 22], [gx - 52, gy + 64]],
        "#fae194",
        "#14110d",
        { paperRim: 3.0 }
      );
      var activeBulb = Math.floor(t * 8) % 6;
      for (var bi = 0; bi < 6; bi++) {
        var bx = S.lerp(gx - 48, gx + 145, bi / 5);
        var by = S.lerp(gy + 42, gy - 24, bi / 5);
        ctx.fillStyle = bi === activeBulb ? "#ff3b28" : "#fff9e6";
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(bx, by, bi === activeBulb ? 8.5 : 5.5, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    } else if (beat.index === 2) {
      // --- VARIATION III (C): A flashy holiday parade leader (+ Brook Trout & Snail Climb) ---
      // Méliès submarine crew cutout cheering in background + Brook Trout Drum Major tossing baton!
      S.drawScissorCutout(
        ctx, aImg,
        318, 198, 555, 378,
        152 + pxFar, 224 + pyFar, 355, 252,
        [[0.05, 0.08], [0.92, 0.04], [0.96, 0.94], [0.04, 0.95]],
        { filter: "litho", haloWidth: 4.5 }
      );

      // 18 marching minnows in synchronized Fibonacci ranks wearing crimson shako plumes!
      for (var mi = 0; mi < 18; mi++) {
        var col = mi % 6;
        var row = Math.floor(mi / 6);
        var mx = 365 + col * 68 + Math.sin(t * 4.0 + row) * 10;
        var my = 398 + row * 48 + Math.abs(Math.sin(t * 7.5 + col * 0.6)) * -14;
        ctx.save();
        ctx.translate(mx, my);
        S.drawCutoutPaperEdge(
          ctx,
          [[20, 0], [4, -8], [-16, -6], [-24, -12], [-20, 0], [-24, 12], [-16, 6], [4, 8]],
          "#fbfaf7",
          "#0b0c0e",
          { paperRim: 2.0 }
        );
        // Tiny red holiday plume hat on each marching minnow!
        S.drawCutoutPaperEdge(ctx, [[2, -8], [8, -22], [16, -8]], "#d42a1e", "#0b0c0e", { paperRim: 1.2, shadow: false });
        ctx.restore();
      }

      // Brook Trout Parade Leader at front right in tall shako hat + IK arm twirling brass baton!
      var dmX = 875 + pxMid * 0.5;
      var dmY = 365 + Math.abs(Math.sin(t * 7.5)) * -16;
      S.drawBrookTrout(ctx, dmX, dmY, 1.32, t, true); // facing right, leading the parade!

      // Tall red-and-gold Drum Major shako hat + feather plume on Trout's head
      S.drawCutoutPaperEdge(
        ctx,
        [[dmX + 38, dmY - 22], [dmX + 44, dmY - 68], [dmX + 82, dmY - 64], [dmX + 78, dmY - 18]],
        "#d42a1e",
        "#0b0c0e",
        { paperRim: 2.5 }
      );
      S.drawCutoutPaperEdge(
        ctx,
        [[dmX + 62, dmY - 66], [dmX + 74, dmY - 98], [dmX + 90, dmY - 76]],
        "#fae194",
        "#0b0c0e",
        { paperRim: 2.0 }
      );

      // Spinning tossed brass drum-major baton overhead!
      var batonY = dmY - 108 - Math.abs(Math.sin(t * 3.8)) * 58;
      ctx.save();
      ctx.translate(dmX + 108, batonY);
      ctx.rotate(t * 11.5);
      S.drawCutoutPaperEdge(ctx, [[-48, -4], [48, -4], [48, 4], [-48, 4]], "#f3d184", "#0b0c0e", { paperRim: 2.0 });
      ctx.fillStyle = "#fbfaf7";
      ctx.strokeStyle = "#0b0c0e";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(-50, 0, 8, 0, TAU); ctx.arc(50, 0, 8, 0, TAU); ctx.fill(); ctx.stroke();
      S.drawSplitPin(ctx, 0, 0, 3.8, { metal: "brass" });
      ctx.restore();
    } else {
      // --- VARIATION IV (D): A swarm of liquid-metal nanobots (+ Alien Listening Post) ---
      S.drawAlienSaucer(ctx, 640 + pxMid * 0.4, 114 + pyMid * 0.3, 1.22, t, 640, 365, { beamSpread: 210 });

      // John Whitney polar-rose harmonic lattice of 28 chrome-faceted hexagonal nanobots!
      var cxNano = 640 + pxMid * 0.6;
      var cyNano = 368 + pyMid * 0.5;
      var morph = 0.5 + 0.5 * Math.sin(t * 2.2);

      // Magnetic laser web connecting adjacent nanobots
      var nodes = [];
      for (var ni = 0; ni < 28; ni++) {
        var a = (ni / 28) * TAU + t * 0.85;
        var rRose = S.lerp(135, 78 + 95 * Math.cos(3 * a - t * 2.1), morph);
        nodes.push({
          x: cxNano + Math.cos(a) * rRose * 1.45,
          y: cyNano + Math.sin(a) * rRose * 0.88
        });
      }

      ctx.strokeStyle = "rgba(15, 143, 128, 0.58)";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      for (var li = 0; li < nodes.length; li++) {
        var nA = nodes[li];
        var nB = nodes[(li + 1) % nodes.length];
        var nC = nodes[(li + 4) % nodes.length];
        ctx.moveTo(nA.x, nA.y); ctx.lineTo(nB.x, nB.y);
        ctx.moveTo(nA.x, nA.y); ctx.lineTo(nC.x, nC.y);
      }
      ctx.stroke();

      for (var k = 0; k < nodes.length; k++) {
        ctx.save();
        ctx.translate(nodes[k].x, nodes[k].y);
        ctx.rotate(t * 3.0 + k * 0.4);
        S.drawCardboardPuppetPiece(
          ctx,
          [[-14, 0], [-7, -12], [7, -12], [14, 0], [7, 12], [-7, 12]],
          { tone: k % 2 === 0 ? "#d6dade" : "#9aa2aa", ribs: 1, shadow: false }
        );
        ctx.fillStyle = k % 3 === 0 ? "#d42a1e" : "#0f8f80";
        ctx.beginPath(); ctx.arc(0, 0, 3.6, 0, TAU); ctx.fill();
        ctx.restore();
      }
    }

    drawBallastBubbles(ctx, S, W, H, t, state, "rgba(251, 250, 247, 0.45)");
    drawCourierOverlay(ctx, S, W, H, t, beat, state, { turkeyX: 128, turkeyY: 492, snailFloorY: 560, climbX: 1188 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 28);
  }

  // ============================================================================
  // PORTHOLE #29 · DECK
  // bolasStyle: "queneau-rostrum" (exercices-de-style.webp × S04 Frank Mouris × Ellis Island)
  // Options:
  //   A: An open sunken family photo album
  //   B: A spilled bag of soggy letters
  //   C: A nosy celebrity camera flash
  //   D: A lost time-traveler’s scrapbook
  // ============================================================================
  function renderP29(ctx, W, H, rawT, state) {
    var S = getStage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(29);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    // 1. Buttercream Queneau Rostrum Paper + Torn-Deckle Forest Floor (exact exercices-de-style.webp!)
    S.drawBolasBackdrop(ctx, W, H, "queneau-rostrum", 29, t, state);
    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    var pxFar = S.parallaxX(0.24, t, state);
    var pyFar = S.parallaxY(0.24, t, state);
    var pxMid = S.parallaxX(0.55, t, state);
    var pyMid = S.parallaxY(0.55, t, state);
    var pxNear = S.parallaxX(0.86, t, state);
    var pyNear = S.parallaxY(0.86, t, state);

    // Plane 1: Torn-deckle archive casement windows & traced sepia face from atlas-20.webp!
    S.drawScissorCutout(
      ctx, aImg,
      12, 18, 270, 540,
      78 + pxFar, 56 + pyFar, 215, 425,
      [[0.04, 0.03], [0.95, 0.04], [0.96, 0.96], [0.05, 0.95]],
      { filter: "sepia", haloWidth: 4.5, alpha: 0.85 }
    );
    S.drawTornPaperFlat(ctx, 995 + pxFar, 72 + pyFar, 195, 435, {
      fill: "#3a4f28",
      paperColor: "#f3ede0",
      deckle: 7.5,
      seed: 29.1
    });

    if (beat.lampOn) {
      S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 590, aimX: 610, spread: 310, alpha: 0.16 });
    }

    var albumX = 585 + pxMid * 0.75;
    var albumY = 445 + pyMid * 0.7;

    if (beat.index === 0) {
      // --- VARIATION I (A): An open sunken family photo album ---
      // Scissor-cut open leather family album from p29.jpg + hinged turning page + rising cabin/bridge photos!
      S.drawScissorCutout(
        ctx, pImg,
        182, 285, 270, 198,
        albumX - 215, albumY - 108, 430, 235,
        [[0.08, 0.34], [0.38, 0.06], [0.68, 0.06], [0.95, 0.36], [0.98, 0.78], [0.52, 0.96], [0.04, 0.82]],
        { filter: "none", haloWidth: 5.0 }
      );

      // Hinged cardboard page flipping smoothly across the spine on a brass split-pin!
      var flipU = (t * 0.65) % 1;
      var pageScaleX = Math.cos(flipU * Math.PI);
      ctx.save();
      ctx.translate(albumX, albumY + 6);
      ctx.scale(pageScaleX, 1);
      S.drawCutoutPaperEdge(
        ctx,
        [[0, -82], [138, -104], [152, -12], [0, 14]],
        "#efe4c6",
        "#2a2117",
        { paperRim: 2.5 }
      );
      ctx.restore();
      S.drawSplitPin(ctx, albumX, albumY + 8, 4.8, { metal: "brass" });

      // Floating sepia cabin, covered-bridge & ancestral portrait snapshots rising upward!
      var photoCrops = [
        { img: pImg, sx: 238, sy: 224, sw: 86, sh: 76, bx: albumX - 115, by: 265, w: 138, h: 112, ph: 0.2 },
        { img: pImg, sx: 344, sy: 174, sw: 112, sh: 96, bx: albumX + 55, by: 215, w: 156, h: 124, ph: 1.7 },
        { img: pImg, sx: 304, sy: 106, sw: 132, sh: 108, bx: albumX - 22, by: 112, w: 148, h: 118, ph: 3.1 },
        { img: aImg, sx: 330, sy: 40, sw: 720, sh: 660, bx: albumX + 205, by: 145, w: 136, h: 118, ph: 4.5 }
      ];
      for (var pi = 0; pi < photoCrops.length; pi++) {
        var pc = photoCrops[pi];
        var fy = pc.by + Math.sin(t * 1.8 + pc.ph) * 14 - ((t * 14 + pi * 22) % 36);
        var fx = pc.bx + Math.cos(t * 1.4 + pc.ph) * 12;
        var frot = Math.sin(t * 1.5 + pc.ph) * 0.14 + (pi % 2 === 0 ? -0.09 : 0.11);
        S.drawScissorCutout(
          ctx, pc.img,
          pc.sx, pc.sy, pc.sw, pc.sh,
          fx, fy, pc.w, pc.h,
          [[0.03, 0.04], [0.97, 0.03], [0.96, 0.96], [0.04, 0.97]],
          { filter: "sepia", haloWidth: 5.5, rot: frot }
        );
      }

      S.drawBrookTrout(ctx, 945 + pxMid * 0.6, 338 + pyMid * 0.6, 1.18, t, false);
      S.drawTurkeyInCorner(ctx, 148 + pxNear, 502 + pyNear, 0.98, t, { dispatch: 0 });
    } else if (beat.index === 1) {
      // --- VARIATION II (B): A spilled bag of soggy letters (+ Snail Mail Out) ---
      // Tipped canvas-cardboard mail sack with brass grommets & IK strap + Frank Mouris torrent of wax-sealed letters!
      var bagX = 335 + pxMid * 0.6;
      var bagY = 365 + pyMid * 0.6;
      ctx.save();
      ctx.translate(bagX, bagY);
      ctx.rotate(0.32 + Math.sin(t * 2.1) * 0.04);
      S.drawCardboardPuppetPiece(
        ctx,
        [[-135, -78], [75, -92], [118, -32], [112, 68], [-128, 84], [-152, 6]],
        {
          tone: "#9e8866",
          ribs: 4,
          pins: [[88, -68], [94, -22], [90, 26], [84, 62]]
        }
      );
      ctx.restore();

      // 11 soggy wavy-edged envelopes with crimson/teal wax seals & inked postage stamps (0 text!)
      for (var li = 0; li < 11; li++) {
        var lu = ((beat.localT * 0.42 + li * 0.09) % 1);
        var lx = S.lerp(bagX + 95, 985, lu) + Math.sin(t * 2.4 + li * 1.9) * 18;
        var ly = S.lerp(bagY - 12, 165 + (li % 4) * 86, Math.sin(lu * Math.PI * 0.85)) + Math.cos(t * 3.1 + li) * 12;
        var lrot = Math.sin(t * 2.6 + li * 1.3) * 0.32;
        var scL = 0.82 + (li % 3) * 0.16;

        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(lrot);
        ctx.scale(scL, scL);
        // Soggy rippled paper envelope
        S.drawCutoutPaperEdge(
          ctx,
          [[-48, -30], [0, -34], [48, -28], [52, 28], [0, 34], [-50, 29]],
          li % 2 === 0 ? "#fbf7ea" : "#ede2c8",
          "#14110d",
          { paperRim: 2.5 }
        );
        // Envelope triangular flap + wax seal circle + water droplet
        ctx.strokeStyle = "#2b241b";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-46, -28); ctx.lineTo(0, 6); ctx.lineTo(46, -26);
        ctx.stroke();
        ctx.fillStyle = li % 3 === 0 ? "#0f8f80" : "#d42a1e";
        ctx.beginPath(); ctx.arc(0, 6, 7.5, 0, TAU); ctx.fill();
        ctx.restore();
      }
    } else if (beat.index === 2) {
      // --- VARIATION III (C): A nosy celebrity camera flash (+ Brook Trout & Snail Climb) ---
      // Vintage accordion-bellows press camera on jointed brass split-pin tripod + dazzling flashbursts!
      var camX = 760 + pxMid * 0.6;
      var camY = 328 + pyMid * 0.5;
      var flashCycle = (beat.localT * 1.15) % 1;
      var flashPop = Math.max(0, 1 - flashCycle * 4.2);

      // Tripod legs with brass split-pins
      S.drawCardboardPuppetPiece(ctx, [[camX - 18, camY + 34], [camX - 4, camY + 34], [camX - 88, 556], [camX - 104, 556]], {
        tone: "#8a6838", pin: { x: camX - 12, y: camY + 38, r: 4.2, metal: "brass" }
      });
      S.drawCardboardPuppetPiece(ctx, [[camX + 4, camY + 34], [camX + 18, camY + 34], [camX + 94, 556], [camX + 78, 556]], {
        tone: "#8a6838", pin: { x: camX + 12, y: camY + 38, r: 4.2, metal: "brass" }
      });

      // Accordion bellows + mahogany box + silver flash reflector dish!
      S.drawCardboardPuppetPiece(ctx, [[camX - 96, camY - 32], [camX - 18, camY - 48], [camX - 18, camY + 36], [camX - 96, camY + 22]], {
        tone: "#3c3b39", ribs: 4
      });
      S.drawCardboardPuppetEdge ? null : null;
      S.drawCardboardPuppetPiece(ctx, [[camX - 22, camY - 58], [camX + 64, camY - 58], [camX + 64, camY + 42], [camX - 22, camY + 42]], {
        tone: "#6e472b", ribs: 2, pins: [[camX + 48, camY - 42], [camX + 48, camY + 26]]
      });
      // Brass lens barrel
      S.drawCutoutPaperEdge(ctx, [[camX - 124, camY - 26], [camX - 92, camY - 26], [camX - 92, camY + 18], [camX - 124, camY + 18]], "#d4a44c", "#14110d", { paperRim: 2.5 });
      // Scalloped silver flash reflector dish on top
      ctx.save();
      ctx.translate(camX + 18, camY - 104);
      S.drawCutoutPaperEdge(
        ctx,
        [[-46, 0], [-34, -34], [0, -48], [34, -34], [46, 0], [34, 34], [0, 48], [-34, 34]],
        "#e6e8eb",
        "#14110d",
        { paperRim: 3.0 }
      );
      S.drawSplitPin(ctx, 0, 0, 5.5, { metal: "silver" });

      // Star-shaped cut-paper paparazzi flash burst!
      if (flashPop > 0.04) {
        ctx.save();
        var fSc = 0.8 + flashPop * 1.45;
        ctx.scale(fSc, fSc);
        var burst = [];
        for (var bi2 = 0; bi2 < 16; bi2++) {
          var br = bi2 % 2 === 0 ? 78 : 26;
          var ba = (bi2 / 16) * TAU + t;
          burst.push([Math.cos(ba) * br, Math.sin(ba) * br]);
        }
        S.drawCutoutPaperEdge(ctx, burst, "#fffbe0", "#d42a1e", { paperRim: 2.5 });
        ctx.restore();
      }
      ctx.restore();

      // Brook Trout paparazzo squeezing pneumatic shutter bulb with IK fin!
      var pTroutX = 958 + pxMid * 0.4;
      var pTroutY = 366 + pyMid * 0.4;
      var ikBulb = S.solveIK2(pTroutX - 42, pTroutY + 12, 68, 64, camX + 86, camY + 18, 1);
      drawJointedLimb(ctx, S, ikBulb.x0, ikBulb.y0, ikBulb.jx, ikBulb.jy, ikBulb.ex, ikBulb.ey, 14, 11, "#8f9c8a", "#b87458", "brass");
      S.drawBrookTrout(ctx, pTroutX, pTroutY, 1.22, t, false);

      // Ejected Polaroid snapshots of startled Turkey fluttering left!
      S.drawTurkeyCutawayBadge(ctx, 255, 345, 1.25, t, { dispatch: 0.2 });
      for (var sn = 0; sn < 3; sn++) {
        var sx2 = 435 - sn * 62 + Math.sin(t * 2.5 + sn) * 10;
        var sy2 = 225 + sn * 92 + Math.cos(t * 2.2 + sn) * 8;
        ctx.save();
        ctx.translate(sx2, sy2);
        ctx.rotate(-0.18 + sn * 0.16);
        S.drawCutoutPaperEdge(ctx, [[-44, -52], [44, -52], [44, 56], [-44, 56]], "#fbfaf7", "#14110d", { paperRim: 2.5 });
        ctx.fillStyle = "#2c383a";
        ctx.fillRect(-34, -42, 68, 68);
        S.drawTurkeyInCorner(ctx, -4, 6, 0.46, t + sn, { dispatch: 0.4 });
        ctx.restore();
      }
    } else {
      // --- VARIATION IV (D): A lost time-traveler’s scrapbook (+ Alien Listening Post) ---
      S.drawAlienSaucer(ctx, 640 + pxMid * 0.35, 112 + pyMid * 0.3, 1.2, t, albumX, 325, { beamSpread: 195 });

      // Open scrapbook at bottom with interlocking split-pin brass astrolabe clockwork gears!
      S.drawScissorCutout(
        ctx, pImg,
        182, 285, 270, 198,
        albumX - 205, 405 + pyMid * 0.6, 410, 195,
        [[0.08, 0.34], [0.38, 0.06], [0.68, 0.06], [0.95, 0.36], [0.98, 0.78], [0.52, 0.96], [0.04, 0.82]],
        { filter: "cyan", haloWidth: 4.5 }
      );

      // Spinning astrolabe chrono-wheel + 4 orbiting era snapshots (dino silhouette, p29 bridge, atlas-20 portrait, ringed Saturn!)
      var hubX = albumX;
      var hubY = 308 + pyMid * 0.5;
      ctx.save();
      ctx.translate(hubX, hubY);
      ctx.rotate(t * 0.85);
      ctx.strokeStyle = "#d42a1e";
      ctx.lineWidth = 3.5;
      ctx.setLineDash([14, 8]);
      ctx.beginPath(); ctx.arc(0, 0, 148, 0, TAU); ctx.stroke();
      ctx.strokeStyle = "#0f8f80";
      ctx.beginPath(); ctx.arc(0, 0, 98, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
      S.drawReinigerFiligreeHinge(ctx, 0, 0, 14, { metal: "brass" });
      ctx.restore();

      for (var ei = 0; ei < 4; ei++) {
        var ea = t * 0.78 + (ei / 4) * TAU;
        var ox = hubX + Math.cos(ea) * 195;
        var oy = hubY + Math.sin(ea) * 102;
        if (ei === 0) {
          S.drawScissorCutout(ctx, pImg, 344, 174, 112, 96, ox - 58, oy - 46, 116, 92, null, { filter: "sepia", haloWidth: 4.0 });
        } else if (ei === 1) {
          S.drawScissorCutout(ctx, aImg, 330, 40, 720, 660, ox - 56, oy - 46, 112, 92, null, { filter: "mono", haloWidth: 4.0 });
        } else if (ei === 2) {
          // Cutout prehistoric brontosaurus stamp card!
          ctx.save();
          ctx.translate(ox, oy);
          S.drawCutoutPaperEdge(ctx, [[-54, -42], [54, -42], [54, 42], [-54, 42]], "#dceee9", "#14110d", { paperRim: 3.5 });
          S.drawCardboardPuppetPiece(ctx, [[-34, 24], [-22, -4], [8, -4], [22, -30], [34, -28], [22, 6], [28, 24], [-34, 24]], { tone: "#3d5a45", ribs: 1, shadow: false });
          ctx.restore();
        } else {
          // Cutout ringed Saturn & starship stamp card!
          ctx.save();
          ctx.translate(ox, oy);
          S.drawCutoutPaperEdge(ctx, [[-54, -42], [54, -42], [54, 42], [-54, 42]], "#241e2c", "#14110d", { paperRim: 3.5 });
          ctx.fillStyle = "#fae194";
          ctx.beginPath(); ctx.arc(0, 0, 18, 0, TAU); ctx.fill();
          ctx.strokeStyle = "#d42a1e";
          ctx.lineWidth = 3.2;
          ctx.beginPath(); ctx.ellipse(0, 0, 38, 10, -0.3, 0, TAU); ctx.stroke();
          ctx.restore();
        }
      }
    }

    drawBallastBubbles(ctx, S, W, H, t, state, "rgba(255, 252, 240, 0.45)");
    drawCourierOverlay(ctx, S, W, H, t, beat, state, { turkeyX: 128, turkeyY: 492, snailFloorY: 544, climbX: 1184 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 29);
  }

  // ============================================================================
  // PORTHOLE #30 · TOP
  // bolasStyle: "queneau-rostrum" (Oulipo Lipogram × S18 Cartoon Saloon)
  // Options:
  //   A: Six glowing letter bubbles rising
  //   B: Floating underwater explosive mines
  //   C: A loud school spelling-bee buzzer
  //   D: Planet Earth’s self-destruct code
  // ============================================================================
  function renderP30(ctx, W, H, rawT, state) {
    var S = getStage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(30);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    // 1. Buttercream Queneau Rostrum Stock + Song of the Sea Geometric Shafts & Sacred Circles!
    S.drawBolasBackdrop(ctx, W, H, "queneau-rostrum", 30, t, state);
    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    var pxFar = S.parallaxX(0.24, t, state);
    var pyFar = S.parallaxY(0.24, t, state);
    var pxMid = S.parallaxX(0.54, t, state);
    var pyMid = S.parallaxY(0.54, t, state);
    var pxNear = S.parallaxX(0.86, t, state);
    var pyNear = S.parallaxY(0.86, t, state);

    // Plane 1: Cartoon Saloon layered sea ribbons from atlas-43.webp + mossy stone culvert arch from p30.jpg!
    S.drawScissorCutout(
      ctx, aImg,
      20, 20, 760, 585,
      68 + pxFar, 42 + pyFar, 495, 455,
      [[0.04, 0.06], [0.88, 0.02], [0.96, 0.92], [0.06, 0.96]],
      { filter: "none", haloWidth: 4.5, alpha: 0.84 }
    );
    S.drawScissorCutout(
      ctx, aImg,
      760, 20, 345, 585,
      915 + pxFar, 46 + pyFar, 295, 455,
      [[0.08, 0.04], [0.95, 0.06], [0.94, 0.96], [0.04, 0.92]],
      { filter: "none", haloWidth: 4.5, alpha: 0.82 }
    );

    // Mossy stone culvert tunnel arch scissor-cut from p30.jpg!
    S.drawScissorCutout(
      ctx, pImg,
      135, 105, 372, 212,
      295 + pxMid * 0.6, 54 + pyMid * 0.5, 690, 320,
      [[0.03, 0.94], [0.08, 0.36], [0.28, 0.05], [0.50, 0.02], [0.72, 0.05], [0.92, 0.36], [0.97, 0.94], [0.78, 0.95], [0.70, 0.54], [0.50, 0.42], [0.30, 0.54], [0.22, 0.95]],
      { filter: "none", haloWidth: 5.0 }
    );

    // Cartoon Saloon sacred decorative compass rings in golden ink
    ctx.save();
    ctx.translate(640 + pxMid * 0.4, 285 + pyMid * 0.4);
    ctx.strokeStyle = "rgba(20, 17, 13, 0.18)";
    ctx.lineWidth = 1.6;
    ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.arc(0, 0, 235, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 175, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    if (beat.lampOn) {
      S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 585, aimX: 640, spread: 340, alpha: 0.17 });
    }

    // 6 Sphere Horizontal Anchor Positions (matching the 6 spheres in p30.jpg!)
    function orbPos(idx) {
      var x = 235 + idx * 162 + pxMid * 0.75;
      var bob = Math.sin(t * 2.5 + idx * 0.95) * 14;
      var rise = beat.index === 0 ? -((t * 16 + idx * 11) % 34) + 14 : 0;
      return { x: x, y: 318 + pyMid * 0.65 + bob + rise };
    }

    if (beat.index === 0) {
      // --- VARIATION I (A): Six glowing letter bubbles rising ---
      // 6 luminous Cartoon-Saloon golden glass orbs containing pure vector filament glyphs (0 fillText calls!)
      for (var i = 0; i < 6; i++) {
        var op = orbPos(i);
        var r = 54;
        ctx.save();
        ctx.translate(op.x, op.y);

        // Warm golden halo + crisp cream cutout backing
        var og = ctx.createRadialGradient(0, 0, 10, 0, 0, r * 1.55);
        og.addColorStop(0.0, "rgba(255, 236, 145, 0.85)");
        og.addColorStop(0.65, "rgba(245, 192, 66, 0.35)");
        og.addColorStop(1.0, "rgba(245, 192, 66, 0)");
        ctx.fillStyle = og;
        ctx.beginPath(); ctx.arc(0, 0, r * 1.55, 0, TAU); ctx.fill();

        // Glass orb body
        ctx.fillStyle = "rgba(44, 62, 58, 0.78)";
        ctx.strokeStyle = "#f7dd8c";
        ctx.lineWidth = 4.5;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 2.0;
        ctx.beginPath(); ctx.arc(0, 0, r + 2.5, 0, TAU); ctx.stroke();

        // Pure vector glowing brass-filament vowel shape (A E I O U Y from p30.jpg — ZERO text API calls!)
        drawVectorVowelFilament(ctx, i, r, "rgba(255, 224, 112, 0.72)", "#fffbe6");

        // Specular glass crescent highlight
        ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(0, 0, r - 8, -Math.PI * 0.78, -Math.PI * 0.34);
        ctx.stroke();
        ctx.restore();
      }

      S.drawBrookTrout(ctx, 1015 + pxNear * 0.5, 438 + pyNear * 0.5, 1.18, t, false);
      S.drawTurkeyInCorner(ctx, 145 + pxNear, 502 + pyNear, 0.98, t, { dispatch: 0 });
    } else if (beat.index === 1) {
      // --- VARIATION II (B): Floating underwater explosive mines (+ Snail Mail Out) ---
      // All 6 spheres clamp into riveted iron naval mines with radial contact horns & swaying anchor chains!
      for (var mi = 0; mi < 6; mi++) {
        var mp = orbPos(mi);
        var mr = 50;

        // Swaying iron chain links anchoring each mine to the torn-paper floor!
        ctx.strokeStyle = "#232527";
        ctx.lineWidth = 5.0;
        ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.moveTo(mp.x, mp.y + mr);
        ctx.quadraticCurveTo(mp.x + Math.sin(t * 2.2 + mi) * 24, 465, mp.x - 6, 552);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.save();
        ctx.translate(mp.x, mp.y);
        ctx.rotate(Math.sin(t * 1.9 + mi) * 0.16);

        // 8 protruding cardboard contact-horn spikes around circumference
        for (var sp = 0; sp < 8; sp++) {
          var sa = (sp / 8) * TAU;
          ctx.save();
          ctx.rotate(sa);
          S.drawCutoutPaperEdge(
            ctx,
            [[-7, -mr + 4], [-4, -mr - 20], [4, -mr - 20], [7, -mr + 4]],
            "#525659",
            "#14110d",
            { paperRim: 1.8, shadow: false }
          );
          ctx.fillStyle = "#d42a1e";
          ctx.beginPath(); ctx.arc(0, -mr - 20, 3.2, 0, TAU); ctx.fill();
          ctx.restore();
        }

        // Riveted dark-iron cardboard mine sphere + brass equatorial seam & blinking red core!
        var minePoly = [];
        for (var k = 0; k < 12; k++) {
          var ka = (k / 12) * TAU;
          minePoly.push([Math.cos(ka) * mr, Math.sin(ka) * mr]);
        }
        S.drawCardboardPuppetPiece(ctx, minePoly, {
          tone: "#383b3e",
          ribs: 2,
          pins: [[-26, 0], [0, 0], [26, 0]]
        });
        var blink = Math.sin(t * 8.0 + mi * 1.1) > 0.15;
        ctx.fillStyle = blink ? "#ff3b28" : "#6b1912";
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, -18, 9.5, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
    } else if (beat.index === 2) {
      // --- VARIATION III (C): A loud school spelling-bee buzzer (+ Brook Trout & Snail Climb) ---
      // 6 orbs hang like stage lights overhead (with Oulipo Lipogram: 2nd orb shuttered in crimson X!)
      for (var bi = 0; bi < 6; bi++) {
        var bx = 250 + bi * 156;
        var by = 158 + Math.sin(t * 4.2 + bi) * 8;
        ctx.save();
        ctx.translate(bx, by);
        S.drawCutoutPaperEdge(
          ctx,
          [[-32, -22], [0, -34], [32, -22], [32, 22], [0, 34], [-32, 22]],
          bi === 1 ? "#d42a1e" : "#fae194",
          "#14110d",
          { paperRim: 2.5 }
        );
        if (bi === 1) {
          // Oulipo La Disparition forbidden-E crossbar shutter!
          ctx.strokeStyle = "#fbfaf7";
          ctx.lineWidth = 5.5;
          ctx.beginPath();
          ctx.moveTo(-18, -18); ctx.lineTo(18, 18);
          ctx.moveTo(18, -18); ctx.lineTo(-18, 18);
          ctx.stroke();
        } else {
          S.drawSplitPin(ctx, 0, 0, 4.5, { metal: "brass" });
        }
        ctx.restore();
      }

      // Giant wooden spelling-bee stage desk, spring-loaded crimson dome buzzer & vibrating brass bell!
      var deskX = 595 + pxMid * 0.5;
      var deskY = 425 + pyMid * 0.5;
      var slam = Math.abs(Math.sin(t * 5.2));
      var btnCompress = slam > 0.72 ? (slam - 0.72) * 58 : 0;

      // Zig-zag cut-paper acoustic buzzer shockwaves!
      if (btnCompress > 2) {
        for (var wi = -1; wi <= 1; wi += 2) {
          ctx.save();
          ctx.translate(deskX + wi * 155, deskY - 95);
          ctx.scale(wi, 1);
          S.drawCutoutPaperEdge(
            ctx,
            [[0, -12], [48, -42], [36, -6], [84, -26], [42, 16], [76, 36], [12, 18]],
            "#d42a1e",
            "#14110d",
            { paperRim: 2.5 }
          );
          ctx.restore();
        }
      }

      // Wooden lectern podium + brass alarm bell with vibrating clapper on side
      S.drawCardboardPuppetPiece(
        ctx,
        [[deskX - 145, deskY - 24], [deskX + 145, deskY - 24], [deskX + 124, 558], [deskX - 124, 558]],
        { tone: "#8c6239", ribs: 3, pins: [[deskX - 110, deskY + 4], [deskX + 110, deskY + 4]] }
      );
      // Giant red mushroom buzzer dome on lectern top!
      S.drawCardboardPuppetPiece(ctx, [[deskX - 88, deskY - 42], [deskX + 88, deskY - 42], [deskX + 96, deskY - 22], [deskX - 96, deskY - 22]], {
        tone: "#3c3d3f", ribs: 1
      });
      ctx.save();
      ctx.translate(deskX, deskY - 42 + btnCompress);
      S.drawCutoutPaperEdge(
        ctx,
        [[-68, 0], [-56, -46], [0, -62], [56, -46], [68, 0]],
        "#d42a1e",
        "#14110d",
        { paperRim: 3.5 }
      );
      ctx.restore();

      // Brass school bell dome rattling on left of podium
      ctx.save();
      ctx.translate(deskX - 148, deskY + 38);
      ctx.rotate(Math.sin(t * 32.0) * (btnCompress > 1 ? 0.22 : 0.03));
      S.drawCutoutPaperEdge(ctx, [[-34, -34], [34, -34], [38, 28], [-38, 28]], "#f3d184", "#14110d", { paperRim: 2.5 });
      S.drawSplitPin(ctx, 0, 0, 5.2, { metal: "brass" });
      ctx.restore();

      // Brook Trout spelling-bee judge slamming the red buzzer with an IK fin!
      var judgeX = 918 + pxMid * 0.4;
      var judgeY = 368 + pyMid * 0.4;
      var ikBuzz = S.solveIK2(judgeX - 42, judgeY + 12, 118, 112, deskX + 28, deskY - 88 + btnCompress, -1);
      drawJointedLimb(ctx, S, ikBuzz.x0, ikBuzz.y0, ikBuzz.jx, ikBuzz.jy, ikBuzz.ex, ikBuzz.ey, 16, 13, "#8f9c8a", "#b87458", "brass");
      S.drawBrookTrout(ctx, judgeX, judgeY, 1.26, t, false);
    } else {
      // --- VARIATION IV (D): Planet Earth’s self-destruct code (+ Alien Listening Post) ---
      S.drawAlienSaucer(ctx, 640 + pxMid * 0.35, 108 + pyMid * 0.3, 1.22, t, 640, 395, { beamSpread: 240 });

      // Wireframe hologram globe of Planet Earth at lower-center with crimson countdown wedges!
      var gx2 = 640 + pxMid * 0.5;
      var gy2 = 438 + pyMid * 0.5;
      ctx.save();
      ctx.translate(gx2, gy2);
      S.drawCutoutPaperEdge(
        ctx,
        [[-108, 0], [-76, -76], [0, -108], [76, -76], [108, 0], [76, 76], [0, 108], [-76, 76]],
        "#18242b",
        "#d42a1e",
        { paperRim: 4.0, lineWidth: 3.0 }
      );
      // Rotating latitude/longitude wireframe + cut-paper continent shapes
      ctx.strokeStyle = "#0f8f80";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(0, 0, 86, 0, TAU);
      ctx.ellipse(0, 0, 86 * Math.abs(Math.cos(t * 1.1)), 86, 0, 0, TAU);
      ctx.ellipse(0, 0, 86, 36, 0, 0, TAU);
      ctx.stroke();

      // Sequential arming wedges lighting around Earth's rim!
      var armedCount = Math.min(6, Math.floor(beat.u * 7));
      for (var wi2 = 0; wi2 < armedCount; wi2++) {
        var wa0 = -Math.PI * 0.5 + (wi2 / 6) * TAU + 0.06;
        var wa1 = wa0 + (TAU / 6) - 0.12;
        ctx.strokeStyle = "#ff3b28";
        ctx.lineWidth = 8.0;
        ctx.beginPath();
        ctx.arc(0, 0, 96, wa0, wa1);
        ctx.stroke();
      }
      S.drawSplitPin(ctx, 0, 0, 5.2, { metal: "brass" });
      ctx.restore();

      // The 6 orbs arrange in an armed arc above the globe as hexagonal alien key-tumblers!
      for (var ci = 0; ci < 6; ci++) {
        var ca = Math.PI * 1.12 + (ci / 5) * Math.PI * 0.76;
        var tx2 = gx2 + Math.cos(ca) * 265;
        var ty2 = gy2 + Math.sin(ca) * 185 - 24;
        var armed = ci < armedCount;

        // Laser targeting line to Earth core
        ctx.strokeStyle = armed ? "rgba(212, 42, 30, 0.75)" : "rgba(15, 143, 128, 0.40)";
        ctx.lineWidth = armed ? 2.8 : 1.6;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.moveTo(tx2, ty2);
        ctx.lineTo(gx2, gy2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.save();
        ctx.translate(tx2, ty2);
        ctx.rotate(armed ? 0 : t * 2.5 + ci);
        S.drawCardboardPuppetPiece(
          ctx,
          [[-38, 0], [-19, -33], [19, -33], [38, 0], [19, 33], [-19, 33]],
          { tone: armed ? "#b8251a" : "#32383e", ribs: 1, shadow: true }
        );
        // Alien geometric rune notches inside tumbler (pure polygons, 0 text!)
        ctx.strokeStyle = "#fbfaf7";
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        for (var ni = 0; ni <= ci + 1; ni++) {
          var na = (ni / (ci + 2)) * TAU;
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(na) * 20, Math.sin(na) * 20);
        }
        ctx.stroke();
        S.drawSplitPin(ctx, 0, 0, 4.0, { metal: armed ? "brass" : "silver" });
        ctx.restore();
      }
    }

    drawBallastBubbles(ctx, S, W, H, t, state, "rgba(255, 248, 214, 0.45)");
    drawCourierOverlay(ctx, S, W, H, t, beat, state, { turkeyX: 128, turkeyY: 492, snailFloorY: 544, climbX: 1184 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 30);
  }

  // ---------- Register Portals 26..30 on window.PORTAL_REMAKE_SCENES ----------
  var DEFINITIONS = [
    { id: 26, station: "#26 · Boiler", bolasStyle: "cardboard-parallax", fn: renderP26 },
    { id: 27, station: "#27 · Port M", bolasStyle: "duchamp-optic", fn: renderP27 },
    { id: 28, station: "#28 · Stbd M", bolasStyle: "daumier-litho", fn: renderP28 },
    { id: 29, station: "#29 · Deck", bolasStyle: "queneau-rostrum", fn: renderP29 },
    { id: 30, station: "#30 · Top", bolasStyle: "queneau-rostrum", fn: renderP30 }
  ];

  for (var idx = 0; idx < DEFINITIONS.length; idx++) {
    (function (def) {
      root.PORTAL_REMAKE_SCENES[def.id] = {
        id: def.id,
        station: def.station,
        duration: 16.0,
        bolasStyle: def.bolasStyle,
        preload: function () {
          var S = getStage();
          return S ? S.preloadPortalPlates(def.id) : Promise.resolve(null);
        },
        render: function (ctx, W, H, t, state) {
          def.fn(ctx, W || 1280, H || 720, t || 0, state);
        }
      };
    })(DEFINITIONS[idx]);
  }
})(typeof window !== "undefined" ? window : globalThis);
