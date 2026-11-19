/* ============================================================================
 * Turkey Sub · Multi-SCION V2 Rostrum Remake Crew 02 (#06–#10)
 * File: portals/remake-02.js  (window.PORTAL_REMAKE_SCENES[6..10])
 *
 * 16.0s (384 frames @ 24fps, 1280x720) 4-Variation BOLAS Oulipo Screening Room
 * Cutout & Split-Pin Cardboard Cinema:
 *   - #06 · Stern  ("daumier-litho"      · Oulipopo + S20 Harmony + S32/S46/S48)
 *   - #07 · Hatch  ("queneau-rostrum"    · Oumupo + S22 PerfCapture + S47/S41/S44)
 *   - #08 · Gauge  ("perec-stage"        · Monsieur Ripois + S05 Norstein + S45/S44/S35)
 *   - #09 · Port   ("cardboard-parallax" · Les Lieux d'une fugue + S53 Civic + S33/S41/S44)
 *   - #10 · PA     ("perec-stage"        · La Cite Raymond Queneau + S16 JibJab + S32/S47/S41)
 *
 * STRICT PAELEO INVARIANT:
 *   Contains ZERO direct ctx.fillText / ctx.strokeText calls anywhere in this
 *   file; all editorial slate & 4-box contact strip rendering is delegated to
 *   SCION_STAGE.drawRubricBar(ctx, W, H, t, state, id), which emits 0 text calls
 *   when state && state.showCaptions === false.
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var IDS = [6, 7, 8, 9, 10];

  root.PORTAL_REMAKE_SCENES = root.PORTAL_REMAKE_SCENES || {};

  function getStage() {
    return root.SCION_STAGE || null;
  }

  // Kick off asynchronous plate preloading immediately when loaded in browser
  if (root.SCION_STAGE && typeof root.SCION_STAGE.preloadPortalPlates === "function") {
    try {
      root.SCION_STAGE.preloadPortalPlates(IDS);
    } catch (e) {}
  }

  // ---------- Local Math & Handmade Cutout / Split-Pin Helpers (0 Text!) ----------
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, u) { return a + (b - a) * clamp(u, 0, 1); }
  function hash(n) {
    var s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  // Tapered cardboard limb segment between (x1, y1) and (x2, y2) with charcoal ribs
  function buildLimbPoly(x1, y1, x2, y2, r1, r2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len;
    var ny = dx / len;
    var ux = dx / len;
    var uy = dy / len;
    return [
      [x1 - ux * r1 * 0.45 + nx * r1, y1 - uy * r1 * 0.45 + ny * r1],
      [x2 + ux * r2 * 0.45 + nx * r2, y2 + uy * r2 * 0.45 + ny * r2],
      [x2 + ux * r2 * 0.45 - nx * r2, y2 + uy * r2 * 0.45 - ny * r2],
      [x1 - ux * r1 * 0.45 - nx * r1, y1 - uy * r1 * 0.45 - ny * r1]
    ];
  }

  function drawJointedIKLimb(S, ctx, ik, rUpper, rLower, toneUpper, toneLower, metal) {
    var upper = buildLimbPoly(ik.x0, ik.y0, ik.jx, ik.jy, rUpper, rUpper * 0.84);
    var lower = buildLimbPoly(ik.jx, ik.jy, ik.ex, ik.ey, rLower, rLower * 0.78);
    S.drawCardboardPuppetPiece(ctx, upper, { tone: toneUpper || "#7d7b76", ribs: 2 });
    S.drawCardboardPuppetPiece(ctx, lower, { tone: toneLower || "#92908a", ribs: 2 });
    S.drawSplitPin(ctx, ik.x0, ik.y0, 4.6, { metal: metal || "silver" });
    S.drawSplitPin(ctx, ik.jx, ik.jy, 4.4, { metal: metal || "silver" });
    S.drawSplitPin(ctx, ik.ex, ik.ey, 4.0, { metal: metal || "brass" });
  }

  // 6-point cut-tin / litho Sheriff Star with ball tips & split-pin center (0 text!)
  function drawSheriffStar(S, ctx, cx, cy, r, rot, tone, metal) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot || 0);
    var pts = [];
    for (var i = 0; i < 12; i++) {
      var a = -Math.PI * 0.5 + (i / 12) * TAU;
      var rad = (i % 2 === 0) ? r : r * 0.48;
      pts.push([Math.cos(a) * rad, Math.sin(a) * rad]);
    }
    S.drawCutoutPaperEdge(ctx, pts, tone || "#d8d5cc", "#14110d", { paperRim: 3.2 });
    for (var k = 0; k < 6; k++) {
      var ka = -Math.PI * 0.5 + (k / 6) * TAU;
      var bx = Math.cos(ka) * (r + 2.5);
      var by = Math.sin(ka) * (r + 2.5);
      ctx.fillStyle = "#fbfaf5";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(bx, by, 3.2, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    S.drawSplitPin(ctx, 0, 0, 5.2, { metal: metal || "brass" });
    ctx.restore();
  }

  // Cut-paper polygonal bubbles rising with optional ballast surge
  function drawPaperBubbles(S, ctx, seed, count, t, x0, x1, y0, y1, ballast, colFill) {
    var extra = ballast ? 6 : 0;
    var total = count + extra;
    var spanY = Math.max(60, y1 - y0);
    for (var i = 0; i < total; i++) {
      var h1 = hash(seed * 19.3 + i * 7.1);
      var h2 = hash(seed * 31.7 + i * 11.9);
      var speed = (28 + h2 * 36) * (ballast ? 1.45 : 1.0);
      var bx = lerp(x0, x1, h1) + Math.sin(t * 2.1 + i * 1.7) * 11;
      var by = y1 - (((t * speed) + h2 * spanY) % spanY);
      var br = 5.5 + (i % 3) * 3.2;
      var oct = [];
      for (var s = 0; s < 7; s++) {
        var ang = (s / 7) * TAU + i * 0.4;
        oct.push([bx + Math.cos(ang) * br, by + Math.sin(ang) * br]);
      }
      S.drawCutoutPaperEdge(ctx, oct, colFill || "#e6f0ec", "#14110d", {
        paperRim: 2.0,
        lineWidth: 1.4,
        shadow: false
      });
    }
  }

  // Standard 4-beat courier choreography + interactive state.snailActive override
  function drawCouriersForBeat(S, ctx, beat, t, state, opts) {
    var cfg = opts || {};
    var floorY = cfg.floorY != null ? cfg.floorY : 556;
    var badgeX = cfg.badgeX != null ? cfg.badgeX : 132;
    var badgeY = cfg.badgeY != null ? cfg.badgeY : 492;
    var climbX = cfg.climbX != null ? cfg.climbX : 1138;

    if (beat.index === 1) {
      // Variation II (B · Turkey + Snail Mail Out)
      var disp = clamp(1 - Math.abs(beat.u - 0.18) * 3.2, 0.25, 1.0);
      S.drawTurkeyCutawayBadge(ctx, badgeX, badgeY, 0.96, t, { dispatch: disp });
      var sx = lerp(235, 925, beat.u);
      var sy = floorY + Math.sin(t * 5.2) * 2.5;
      S.drawMailSnail(ctx, sx, sy, 1.24, t, { postcard: true, trail: true });
    } else if (beat.index === 2) {
      // Variation III (C · Trout + Snail Mail Reply Climb)
      var cy = lerp(512, 218, beat.u);
      S.drawMailSnail(ctx, climbX, cy, 1.18, t, {
        rot: -Math.PI * 0.47,
        hasReply: true,
        postcard: true,
        trail: true
      });
    } else if (beat.index === 3) {
      // Variation IV (D · Alien Listening Post + Stamped Snail Witness)
      S.drawMailSnail(ctx, climbX - 24, 188 + Math.sin(t * 2.4) * 3, 1.02, t, {
        rot: -0.18,
        hasReply: true,
        hasAlienStamp: true,
        postcard: true,
        trail: false
      });
    }

    // Interactive cockpit Snail Mail button override during Beat A (or manual snailT)
    if (state && (state.snailActive || typeof state.snailT === "number") && beat.index === 0) {
      var su = (typeof state.snailT === "number") ? clamp(state.snailT, 0, 1) : ((t % 3.0) / 3.0);
      S.drawMailSnail(ctx, lerp(210, 980, su), floorY, 1.22, t, {
        hasReply: su > 0.55,
        hasAlienStamp: su > 0.82,
        postcard: true
      });
    }
  }

  // ==========================================================================
  // #06 · Stern — "daumier-litho" (Oulipopo + S20 Harmony + S32/S46/S48)
  // Reference p06.jpg: Stern Sheriff Carp w/ handlebar mustache, star badge,
  // wooden ruler inspecting rainbow-feathered treble-hook lure by dock post.
  // Reference atlas-05.webp: Trout in knit garment at side cabin console.
  // ==========================================================================
  function renderP06(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(6);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, 1280, 720, t, { state: state });

    // 1. Stark Daumier/Verne Cream Paper + Wide Ink-Black Cinema Band (y = 108..582)
    S.drawBolasBackdrop(ctx, 1280, 720, "daumier-litho", 6, t, state, {
      bandTop: 108,
      bandBot: 582
    });

    // Subtle white litho chalk creek wave lines across the ink-black cinema band
    ctx.save();
    ctx.strokeStyle = "rgba(251, 250, 247, 0.16)";
    ctx.lineWidth = 1.4;
    for (var wr = 0; wr < 6; wr++) {
      var wy0 = 152 + wr * 72 + (beat.ballastOn ? -12 : 0);
      ctx.beginPath();
      for (var wx = 20; wx <= 1260; wx += 36) {
        var wy = wy0 + Math.sin(wx * 0.014 + t * 1.5 + wr) * 6;
        if (wx === 20) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
    }
    ctx.restore();

    S.drawLampBeam(ctx, 1280, 638, t, state, { x: 580, y: 590, aimX: 540, spread: 280, alpha: 0.14 });

    var pxFar = S.parallaxX(0.22, t, state);
    var pyFar = S.parallaxY(0.22, t, state);
    var pxMid = S.parallaxX(0.45, t, state);
    var pyMid = S.parallaxY(0.45, t, state);
    var pxHero = S.parallaxX(0.68, t, state);
    var pyHero = S.parallaxY(0.68, t, state);

    // 2. Far Plane: Scissor-cut Wooden Dock Post & Cattails from p06.jpg (left)
    S.drawScissorCutout(
      ctx, pImg,
      96, 128, 162, 345,
      86 + pxFar, 124 + pyFar, 236, 430,
      [[0.08, 0.03], [0.88, 0.02], [0.96, 0.28], [0.84, 0.62], [0.92, 0.96], [0.06, 0.97], [0.03, 0.48]],
      { filter: "litho", haloWidth: 5.0, haloColor: "#fbfaf7", stroke: "#14110d" }
    );

    // Far-Right Witness Console Plate from atlas-05.webp (fish in sweater at console)
    S.drawScissorCutout(
      ctx, aImg,
      14, 155, 354, 465,
      948 + pxMid * 0.7, 134 + pyMid * 0.7, 248, 412,
      [[0.12, 0.04], [0.90, 0.03], [0.96, 0.42], [0.93, 0.95], [0.06, 0.96], [0.04, 0.46]],
      {
        filter: beat.index === 2 ? "sepia" : "litho",
        haloWidth: 4.5,
        haloColor: "#fbfaf7",
        alpha: beat.index === 2 ? 0.98 : 0.82
      }
    );

    drawPaperBubbles(S, ctx, 6, 7, t, 280, 920, 128, 540, beat.ballastOn, "#fbfaf7");

    // 3. Hero Plane: Articulated Cross-Hatched Sheriff Carp Cutout + FK Tail + IK Fin
    var carpBob = Math.sin(t * 2.1) * 5 + pyHero;
    var carpX = 486 + pxHero;
    var carpY = 148 + carpBob;

    // S32 FK Articulated Cross-Hatched Caudal Tail Fin behind right side of carp
    ctx.save();
    ctx.translate(carpX + 356, carpY + 165);
    ctx.rotate(Math.sin(t * 4.6) * 0.18);
    S.drawCutoutPaperEdge(
      ctx,
      [[-12, -18], [68, -76], [52, 0], [72, 74], [-12, 18]],
      "#c8c5bc",
      "#0b0c0e",
      { paperRim: 4.5 }
    );
    S.drawEngravingCrosshatch(ctx, 76, 140, 0.32, 6, { x: -6, y: -70 });
    S.drawSplitPin(ctx, 0, 0, 5.0, { metal: "silver" });
    ctx.restore();

    // Scissor-cut Sheriff Carp body & head from p06.jpg (sx=256..532, sy=142..398)
    S.drawScissorCutout(
      ctx, pImg,
      256, 142, 276, 256,
      carpX, carpY, 386, 336,
      [
        [0.06, 0.56], [0.14, 0.28], [0.46, 0.04], [0.68, 0.03],
        [0.86, 0.24], [0.97, 0.44], [0.96, 0.72], [0.78, 0.94],
        [0.44, 0.96], [0.14, 0.84]
      ],
      { filter: "litho", haloWidth: 5.5, haloColor: "#fbfaf7", stroke: "#0b0c0e" }
    );

    // Handmade 6-point Sheriff Star Badge over shoulder (covers tiny bitmap word -> 100% 0-text!)
    var starTone = (beat.roll > 0) ? "#f3d184" : "#dfdcd2";
    drawSheriffStar(S, ctx, carpX + 228, carpY + 148, 31, Math.sin(t * 1.8) * 0.06, starTone, "brass");

    // S46 Landmark Registration: Expressive Tracking Detective Eye & Curling Handlebar Mustache
    var eyeX = carpX + 120;
    var eyeY = carpY + 131;
    var lookDX = beat.index === 0 ? -4.5 : (beat.index === 1 ? -5.0 : (beat.index === 2 ? 4.5 : -1.5));
    var lookDY = beat.index === 3 ? -4.5 : 2.5;
    ctx.save();
    ctx.fillStyle = "#fbfaf7";
    ctx.strokeStyle = "#0b0c0e";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 17, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0b0c0e";
    ctx.beginPath();
    ctx.arc(eyeX + lookDX, eyeY + lookDY, 7.2, 0, TAU);
    ctx.fill();
    // Stern brow crease
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(eyeX - 20, eyeY - 18);
    ctx.lineTo(eyeX + 18, eyeY - 10);
    ctx.stroke();
    ctx.restore();

    // Articulated Handlebar Mustache Barbels
    var mustWob = S.wobble(t, 4.2, 0.09, 0.5);
    ctx.save();
    ctx.translate(carpX + 64, carpY + 194);
    ctx.rotate(mustWob);
    S.drawCutoutPaperEdge(
      ctx,
      [[-42, 16], [-26, -4], [0, -8], [46, -2], [68, 22], [44, 24], [8, 6], [-24, 18]],
      "#181818",
      "#0b0c0e",
      { paperRim: 2.5, shadow: false }
    );
    ctx.restore();

    // 4. S48 Clue-Order State Machine Across Variations I..IV
    var shoulderX = carpX + 122;
    var shoulderY = carpY + 252;

    if (beat.index === 0) {
      // --- VARIATION I (A · Real Creek): Sheriff Carp inspecting a lure ---
      var lureSwing = Math.sin(t * 3.1) * 0.12 + S.springImpulse(beat.localT, 0.2, 12, 3.5) * 0.22;
      var rulerX = 368 + pxHero * 0.8;
      var rulerY = 258 + carpBob * 0.6;

      // Notched Lithograph Ruler Cutout (pure graduation tick lines, 0 numbers!)
      ctx.save();
      ctx.translate(rulerX, rulerY);
      ctx.rotate(-0.14);
      S.drawCutoutPaperEdge(ctx, [[-22, 0], [22, 0], [22, 255], [-22, 255]], "#efe6cf", "#0b0c0e", { paperRim: 4.0 });
      ctx.strokeStyle = "#0b0c0e";
      for (var tk = 12; tk < 245; tk += 12) {
        ctx.lineWidth = (tk % 36 === 0) ? 2.4 : 1.3;
        ctx.beginPath();
        ctx.moveTo(22, tk);
        ctx.lineTo(22 - ((tk % 36 === 0) ? 16 : 9), tk);
        ctx.stroke();
      }
      // Sliding stamp-red detective caliper pointer
      var slideY = 85 + Math.sin(t * 2.8) * 58;
      S.drawCutoutPaperEdge(ctx, [[16, slideY - 9], [38, slideY], [16, slideY + 9]], "#d42a1e", "#0b0c0e", { paperRim: 2, shadow: false });
      ctx.restore();

      // IK Fin gripping the ruler
      var ikA = S.solveIK2(shoulderX, shoulderY, 118, 112, rulerX + 18, rulerY + 115, 1);
      drawJointedIKLimb(S, ctx, ikA, 15, 12, "#8f8d86", "#a8a59d", "brass");

      // Scissor-cut Feathered Fishing Lure from p06.jpg swinging on taut line
      var lurePivotX = rulerX + 112;
      var lurePivotY = 112;
      ctx.strokeStyle = "#fbfaf7";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(lurePivotX, lurePivotY);
      ctx.lineTo(lurePivotX + Math.sin(lureSwing) * 260, 385);
      ctx.stroke();

      ctx.save();
      ctx.translate(lurePivotX + Math.sin(lureSwing) * 260, 412);
      ctx.rotate(lureSwing);
      S.drawScissorCutout(
        ctx, pImg,
        262, 360, 172, 124,
        -68, -46, 215, 152,
        [[0.02, 0.22], [0.45, 0.08], [0.95, 0.26], [0.98, 0.72], [0.62, 0.97], [0.18, 0.82]],
        { filter: "sepia", haloWidth: 4.5, haloColor: "#fbfaf7", stroke: "#0b0c0e" }
      );
      // Stamp-red feather accent & wire treble hook glints
      S.drawCutoutPaperEdge(ctx, [[56, -4], [126, -24], [112, 8], [132, 26], [56, 12]], "#d42a1e", "#0b0c0e", { paperRim: 2, shadow: false });
      ctx.restore();

    } else if (beat.index === 1) {
      // --- VARIATION II (B · Probable · Turkey): A cook measuring my roasting pan ---
      var popB = S.easeOutBack(clamp(beat.localT / 0.45, 0, 1));

      // Pleated White Cut-Paper Chef Toque on Carp's Head!
      ctx.save();
      ctx.translate(carpX + 152, carpY + 34);
      ctx.scale(popB, popB);
      ctx.rotate(-0.12 + Math.sin(t * 2.5) * 0.04);
      S.drawCutoutPaperEdge(
        ctx,
        [[-52, 18], [-64, -38], [-38, -74], [0, -86], [42, -72], [62, -34], [48, 18]],
        "#fbfaf7",
        "#0b0c0e",
        { paperRim: 3.5 }
      );
      S.drawEngravingCrosshatch(ctx, 90, 28, 0.22, 6, { x: -45, y: -10 });
      S.drawSplitPin(ctx, 0, 14, 4.4, { metal: "silver" });
      ctx.restore();

      // Giant Cross-Hatched Iron Turkey Roasting Pan with Lifting Lid & Steam Plumes
      var panX = 395 + pxHero * 0.6;
      var panY = 432;
      for (var st = 0; st < 3; st++) {
        var sy = panY - 68 - ((t * 42 + st * 34) % 95);
        var sx = panX - 45 + st * 48 + Math.sin(t * 3.4 + st) * 14;
        S.drawCutoutPaperEdge(
          ctx,
          [[sx - 10, sy + 16], [sx - 14, sy - 4], [sx + 2, sy - 18], [sx + 14, sy - 2], [sx + 6, sy + 16]],
          "#fbfaf7",
          "#0b0c0e",
          { paperRim: 2, shadow: false }
        );
      }

      // Hinged Domed Roasting Lid tilting open
      ctx.save();
      ctx.translate(panX + 125, panY - 14);
      ctx.rotate(0.28 + Math.sin(t * 2.6) * 0.12);
      S.drawCardboardPuppetPiece(
        ctx,
        [[-250, 0], [-210, -56], [-90, -76], [-35, -56], [0, 0]],
        { tone: "#67696d", ribs: 3, pin: { x: -6, y: -2, r: 4.5, metal: "brass" } }
      );
      ctx.restore();

      // Heavy Oval Roasting Pan Basin + Loop Handles
      S.drawCardboardPuppetPiece(
        ctx,
        [
          [panX - 155, panY - 12], [panX + 155, panY - 12],
          [panX + 132, panY + 72], [panX - 132, panY + 72]
        ],
        {
          tone: "#45474a",
          ribs: 3,
          pins: [[panX - 115, panY + 12], [panX, panY + 14], [panX + 115, panY + 12]]
        }
      );

      // Folding Kitchen Caliper / Tape-Measure stretched across pan width by Carp's IK fin
      var tapeEnd = panX - 145 + Math.sin(t * 3.0) * 18;
      S.drawCutoutPaperEdge(
        ctx,
        [[tapeEnd, panY - 26], [panX + 148, panY - 26], [panX + 148, panY - 8], [tapeEnd, panY - 8]],
        "#f7dd8c",
        "#0b0c0e",
        { paperRim: 3.0 }
      );
      var ikB = S.solveIK2(shoulderX, shoulderY, 122, 118, panX + 138, panY - 16, 1);
      drawJointedIKLimb(S, ctx, ikB, 15, 12, "#8f8d86", "#fbfaf7", "silver");

    } else if (beat.index === 2) {
      // --- VARIATION III (C · Plausible · Trout): An undercover fish police deputy ---
      // Rotating Crimson/Teal Siren Flash Rays behind Carp
      ctx.save();
      ctx.translate(carpX + 165, carpY + 18);
      for (var r = 0; r < 6; r++) {
        var ra = t * 2.8 + (r / 6) * TAU;
        ctx.fillStyle = (r % 2 === 0) ? "rgba(212, 42, 30, 0.34)" : "rgba(15, 143, 128, 0.34)";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ra - 0.14) * 240, Math.sin(ra - 0.14) * 140);
        ctx.lineTo(Math.cos(ra + 0.14) * 240, Math.sin(ra + 0.14) * 140);
        ctx.closePath();
        ctx.fill();
      }
      // Roof magnetic police beacon dome
      S.drawCutoutPaperEdge(ctx, [[-24, 8], [-18, -24], [18, -24], [24, 8]], "#d42a1e", "#0b0c0e", { paperRim: 3 });
      ctx.restore();

      // Flip-down Ink-Black Undercover Sunglasses & Upturned Trenchcoat Collar on Carp!
      S.drawCutoutPaperEdge(
        ctx,
        [[eyeX - 38, eyeY - 12], [eyeX + 26, eyeY - 10], [eyeX + 22, eyeY + 14], [eyeX - 30, eyeY + 12]],
        "#0b0c0e",
        "#fbfaf7",
        { paperRim: 3.0 }
      );
      S.drawCardboardPuppetPiece(
        ctx,
        [[carpX + 125, carpY + 215], [carpX + 255, carpY + 178], [carpX + 278, carpY + 286], [carpX + 118, carpY + 292]],
        { tone: "#5c5b57", ribs: 3, pin: { x: carpX + 195, y: carpY + 235, r: 4.6, metal: "brass" } }
      );

      // Hinged Undercover Leather Badge Wallet held out toward Brook Trout!
      var walX = 398 + Math.sin(t * 2.7) * 10;
      var walY = 368;
      var ikC = S.solveIK2(shoulderX, shoulderY, 118, 114, walX + 25, walY + 10, 1);
      drawJointedIKLimb(S, ctx, ikC, 15, 12, "#5c5b57", "#7d7b76", "brass");

      S.drawCardboardPuppetPiece(ctx, [[walX - 42, walY - 56], [walX + 42, walY - 56], [walX + 42, walY + 56], [walX - 42, walY + 56]], { tone: "#2b2623", ribs: 2 });
      drawSheriffStar(S, ctx, walX, walY, 26, 0, "#f3d184", "brass");

      // Brook the Trout witness swimming in on left-lower creek!
      S.drawBrookTrout(ctx, 252, 412 + Math.sin(t * 2.5) * 6, 1.16, t, true);

    } else {
      // --- VARIATION IV (D · Preposterous · Alien): A comet-hook space bounty hunter ---
      var cometX = 352 + Math.cos(t * 2.9) * 44;
      var cometY = 392 + Math.sin(t * 2.9) * 32;

      // Alien Listening Post Saucer hovering above the ink band
      S.drawAlienSaucer(ctx, 640, 106, 1.16, t, cometX, cometY);

      // Cut-paper stars in the black ink band
      for (var si = 0; si < 9; si++) {
        var sx = 120 + ((si * 137) % 1020);
        var sy = 148 + ((si * 83) % 360);
        drawSheriffStar(S, ctx, sx, sy, 8 + (si % 3) * 3, t * 0.6 + si, "#fbfaf7", "silver");
      }

      // Bounty-Hunter Brass Astrolabe Visor & Twin Rocket Jetpack on Carp
      S.drawCutoutPaperEdge(
        ctx,
        [[eyeX - 44, eyeY - 22], [eyeX + 34, eyeY - 18], [eyeX + 28, eyeY + 18], [eyeX - 38, eyeY + 14]],
        "#0f8f80",
        "#0b0c0e",
        { paperRim: 3.2 }
      );
      S.drawCardboardPuppetPiece(
        ctx,
        [[carpX + 245, carpY + 42], [carpX + 335, carpY + 58], [carpX + 322, carpY + 158], [carpX + 236, carpY + 138]],
        { tone: "#8c6d3f", ribs: 2, pins: [[carpX + 265, carpY + 75], [carpX + 305, carpY + 85]] }
      );

      // Grappling Chain & Blazing Comet-Hook Harpoon!
      var ikD = S.solveIK2(shoulderX, shoulderY, 120, 115, cometX + 88, cometY - 24, 1);
      drawJointedIKLimb(S, ctx, ikD, 16, 13, "#8c6d3f", "#b88a44", "brass");

      ctx.strokeStyle = "#fbfaf7";
      ctx.lineWidth = 3.2;
      ctx.setLineDash([9, 5]);
      ctx.beginPath();
      ctx.moveTo(ikD.ex, ikD.ey);
      ctx.lineTo(cometX, cometY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Layered Cut-Paper Comet Tail & Hooked Star Core
      S.drawCutoutPaperEdge(
        ctx,
        [[cometX, cometY - 26], [cometX - 155, cometY - 64], [cometX - 118, cometY - 6], [cometX - 168, cometY + 44], [cometX, cometY + 26]],
        "#d42a1e",
        "#0b0c0e",
        { paperRim: 3.5 }
      );
      S.drawCutoutPaperEdge(
        ctx,
        [[cometX, cometY - 14], [cometX - 98, cometY - 32], [cometX - 74, cometY], [cometX - 104, cometY + 24], [cometX, cometY + 14]],
        "#f7dd8c",
        "#0b0c0e",
        { paperRim: 2.0, shadow: false }
      );
      drawSheriffStar(S, ctx, cometX, cometY, 34, t * 2.4, "#f3d184", "brass");
      // Giant barbed cosmic comet-hook curve
      ctx.strokeStyle = "#fbfaf7";
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.arc(cometX + 18, cometY + 34, 28, -0.3, Math.PI * 1.15);
      ctx.stroke();
    }

    drawCouriersForBeat(S, ctx, beat, t, state, { floorY: 558, badgeX: 136, badgeY: 492, climbX: 1142 });
    S.drawCutShutter(ctx, 1280, 638, t, state);
    S.endCamera(ctx);
    S.drawRubricBar(ctx, 1280, 720, t, state, 6);
  }

  // ==========================================================================
  // #07 · Hatch — "queneau-rostrum" (Oumupo + S22 PerfCapture + S47/S41/S44)
  // Reference p07.jpg: 6 spotted trout singing around a soggy rainbow star
  // birthday pinata tied by knotted rope to a sunken riverbed boulder.
  // Reference atlas-19.webp: Sepia hand holding round paper aperture glass.
  // ==========================================================================
  function renderP07(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(7);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, 1280, 720, t, { state: state });

    // 1. Warm Buttercream/Ochre Queneau Rostrum Stock + Torn-Deckle Green Floor (exercices-de-style.webp!)
    S.drawBolasBackdrop(ctx, 1280, 720, "queneau-rostrum", 7, t, state);
    S.drawLampBeam(ctx, 1280, 638, t, state, { x: 640, y: 560, aimX: 640, spread: 320, alpha: 0.16 });

    var pxFar = S.parallaxX(0.20, t, state);
    var pyFar = S.parallaxY(0.20, t, state);
    var pxMid = S.parallaxX(0.48, t, state);
    var pyMid = S.parallaxY(0.48, t, state);
    var pxFore = S.parallaxX(0.75, t, state);

    // 2. Background Rostrum Collage Flats: Sepia Hand Aperture (atlas-19.webp) & Deckle Green Door
    S.drawScissorCutout(
      ctx, aImg,
      125, 8, 495, 400,
      68 + pxFar, 72 + pyFar, 365, 295,
      [[0.08, 0.06], [0.88, 0.03], [0.97, 0.38], [0.92, 0.94], [0.12, 0.96], [0.03, 0.52]],
      { filter: "sepia", haloWidth: 5.0, alpha: 0.85 }
    );

    // Torn-deckle green service door on right (visual homage to exercices-de-style.webp, 0 text!)
    S.drawTornPaperFlat(ctx, 1026 + pxFar * 0.7, 108 + pyFar * 0.5, 168, 436, {
      fill: "#263a19",
      paperColor: "#f6f0e2",
      deckle: 7.5
    });
    S.drawTornPaperFlat(ctx, 1062 + pxFar * 0.7, 168 + pyFar * 0.5, 96, 38, {
      fill: "#efe8d5",
      deckle: 2.5,
      shadow: false
    });
    S.drawSplitPin(ctx, 1048 + pxFar * 0.7, 326 + pyFar * 0.5, 6.0, { metal: "brass" });

    // 3. Anchor Boulder Scissor Cutout (p07.jpg) & Pendulum Rope (S41)
    var rockX = 538 + pxMid;
    var rockY = 472 + pyMid * 0.4;
    S.drawScissorCutout(
      ctx, pImg,
      258, 452, 168, 100,
      rockX, rockY, 204, 118,
      [[0.08, 0.45], [0.32, 0.12], [0.76, 0.08], [0.96, 0.48], [0.90, 0.92], [0.12, 0.94]],
      { haloWidth: 4.5, stroke: "#14110d" }
    );

    var swayAng = Math.sin(t * 2.1) * 0.11 + (beat.ballastOn ? 0.06 : 0);
    var hubX = 640 + Math.sin(swayAng) * 185 + pxFore * 0.5;
    var hubY = 278 + Math.cos(t * 4.2) * 7;

    // Braided kraft-paper anchor rope
    ctx.save();
    ctx.strokeStyle = "#fbfaf5";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(rockX + 96, rockY + 18);
    ctx.quadraticCurveTo(640 + pxMid, 395, hubX, hubY + 95);
    ctx.stroke();
    ctx.strokeStyle = "#6e4e24";
    ctx.lineWidth = 5.5;
    ctx.setLineDash([8, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 4. S22/S47 Singing 6-Trout Choir Cutouts from p07.jpg (3 left, 3 right)
    var choirPulse = Math.pow(Math.max(0, Math.sin(t * 7.2)), 2);
    var recoil = (beat.index === 1) ? 34 : 0;
    var floatUp = (beat.index === 3) ? -22 : 0;

    var choirCrops = [
      { sx: 170, sy: 120, sw: 118, sh: 82, dx: 248 - recoil, dy: 112 + floatUp, dw: 175, dh: 120, side: -1 },
      { sx: 114, sy: 192, sw: 132, sh: 82, dx: 186 - recoil, dy: 234 + floatUp, dw: 192, dh: 118, side: -1 },
      { sx: 108, sy: 278, sw: 128, sh: 78, dx: 214 - recoil, dy: 356 + floatUp, dw: 186, dh: 114, side: -1 },
      { sx: 374, sy: 128, sw: 122, sh: 82, dx: 832 + recoil, dy: 116 + floatUp, dw: 178, dh: 120, side: 1 },
      { sx: 416, sy: 198, sw: 120, sh: 78, dx: 882 + recoil, dy: 238 + floatUp, dw: 182, dh: 116, side: 1 },
      { sx: 416, sy: 272, sw: 122, sh: 82, dx: 850 + recoil, dy: 360 + floatUp, dw: 184, dh: 118, side: 1 }
    ];

    for (var ci = 0; ci < choirCrops.length; ci++) {
      var c = choirCrops[ci];
      var cbob = Math.sin(t * 3.1 + ci * 1.05) * 7;
      var cx = c.dx + pxMid * (0.8 + (ci % 2) * 0.25);
      var cy = c.dy + cbob + pyMid * 0.5;
      S.drawScissorCutout(
        ctx, pImg,
        c.sx, c.sy, c.sw, c.sh,
        cx, cy, c.dw, c.dh,
        null,
        {
          haloWidth: 4.2,
          rot: Math.sin(t * 2.4 + ci) * 0.05 * c.side,
          stroke: "#14110d"
        }
      );

      // S47 Sound-to-Action cut-paper acoustic note diamond popping from each trout mouth!
      var mouthX = c.side < 0 ? (cx + c.dw + 8) : (cx - 12);
      var mouthY = cy + c.dh * 0.55;
      var noteScale = 0.55 + choirPulse * 0.75;
      ctx.save();
      ctx.translate(mouthX + c.side * (-14 * choirPulse), mouthY - 8 * choirPulse);
      ctx.scale(noteScale, noteScale);
      S.drawCutoutPaperEdge(
        ctx,
        [[0, -10], [10, 0], [0, 10], [-10, 0]],
        ci % 2 === 0 ? "#0f8f80" : "#d42a1e",
        "#14110d",
        { paperRim: 2.0, shadow: false }
      );
      ctx.restore();
    }

    // 5. Central Oumupo Shuffled Centerpiece Across Variations I..IV
    if (beat.index === 0) {
      // --- VARIATION I (A · Real Creek): A soggy sunken birthday pinata ---
      ctx.save();
      ctx.translate(hubX, hubY);
      ctx.rotate(swayAng * 0.85);

      // Scissor-cut Rainbow Star Pinata from p07.jpg (sx=228..418, sy=198..408)
      S.drawScissorCutout(
        ctx, pImg,
        228, 198, 190, 210,
        -136, -138, 272, 290,
        [
          [0.50, 0.02], [0.68, 0.24], [0.97, 0.30], [0.80, 0.58],
          [0.86, 0.94], [0.50, 0.82], [0.14, 0.94], [0.20, 0.58],
          [0.03, 0.30], [0.32, 0.24]
        ],
        { haloWidth: 5.5, stroke: "#14110d" }
      );

      // Fluttering torn-paper fringe streamers on brass split-pins (S41 inertia)
      var ribCols = ["#d42a1e", "#0f8f80", "#d99e3b", "#2a3a63"];
      var tips = [[-116, -34], [116, -34], [-78, 112], [78, 112]];
      for (var ti = 0; ti < tips.length; ti++) {
        ctx.save();
        ctx.translate(tips[ti][0], tips[ti][1]);
        ctx.rotate(Math.sin(t * 4.5 + ti * 1.4) * 0.28 - swayAng * 1.2);
        S.drawCutoutPaperEdge(ctx, [[-7, 0], [7, 0], [11, 68], [-3, 72]], ribCols[ti], "#14110d", { paperRim: 2.0 });
        S.drawSplitPin(ctx, 0, 0, 3.8, { metal: "brass" });
        ctx.restore();
      }

      // Dripping cut-paper water teardrops beneath soggy pinata
      for (var di = 0; di < 4; di++) {
        var dropU = ((t * 1.3 + di * 0.25) % 1);
        var dx = -54 + di * 36;
        var dy = 115 + dropU * 95;
        S.drawCutoutPaperEdge(ctx, [[dx, dy - 10], [dx + 7, dy + 4], [dx, dy + 11], [dx - 7, dy + 4]], "#7ec4be", "#14110d", { paperRim: 1.8, shadow: false });
      }
      ctx.restore();

    } else if (beat.index === 1) {
      // --- VARIATION II (B · Probable · Turkey): A spiky underwater naval mine ---
      ctx.save();
      ctx.translate(hubX, hubY);
      ctx.rotate(swayAng * 0.5);

      // Pulsing stamp-red hazard shock rings
      var ringR = 132 + ((t * 48) % 52);
      ctx.strokeStyle = "rgba(212, 42, 30, 0.55)";
      ctx.lineWidth = 3.5;
      ctx.setLineDash([12, 7]);
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      // 8 Radially Jutting Cardboard & Brass Contact Horns on Split-Pins
      for (var hi = 0; hi < 8; hi++) {
        var ha = (hi / 8) * TAU + Math.sin(t * 1.5) * 0.04;
        ctx.save();
        ctx.rotate(ha);
        S.drawCardboardPuppetPiece(ctx, [[86, -13], [142, -7], [142, 7], [86, 13]], { tone: "#595b5e", ribs: 1 });
        S.drawCutoutPaperEdge(ctx, [[138, -9], [156, 0], [138, 9]], "#d42a1e", "#14110d", { paperRim: 2, shadow: false });
        S.drawSplitPin(ctx, 94, 0, 4.2, { metal: "brass" });
        ctx.restore();
      }

      // Riveted Dark-Grey Cardboard Naval Mine Sphere
      var minePoly = [];
      for (var mi = 0; mi < 14; mi++) {
        var ma = (mi / 14) * TAU;
        minePoly.push([Math.cos(ma) * 102, Math.sin(ma) * 102]);
      }
      S.drawCutoutPaperEdge(ctx, minePoly, "#3f4246", "#14110d", { paperRim: 5.0 });
      S.drawCardboardPuppetPiece(
        ctx,
        [[-96, -16], [96, -16], [96, 16], [-96, 16]],
        { tone: "#5c6066", ribs: 2, pins: [[-68, 0], [-24, 0], [24, 0], [68, 0]] }
      );
      ctx.restore();

    } else if (beat.index === 2) {
      // --- VARIATION III (C · Plausible · Trout): A noisy brass birthday kazoo ---
      var buzz = Math.sin(t * 28) * 2.5;
      ctx.save();
      ctx.translate(hubX + 36, hubY + buzz * 0.4);
      ctx.rotate(-0.10 + Math.sin(t * 2.8) * 0.05);

      // Subtle star-pinata backing halo peeking behind kazoo
      S.drawScissorCutout(ctx, pImg, 228, 198, 190, 210, -105, -110, 210, 220, null, { alpha: 0.48, haloWidth: 3.5 });

      // Giant Tapered Brass & Kraft-Paper Submarine Kazoo Body
      S.drawCutoutPaperEdge(
        ctx,
        [[-158, -22], [118, -48], [148, -62], [148, 62], [118, 48], [-158, 22]],
        "#d9a443",
        "#14110d",
        { paperRim: 4.8 }
      );
      // Vibrating Top Wax-Paper Kazoo Hummer Turret on Split-Pin!
      S.drawCardboardPuppetPiece(
        ctx,
        [[-28, -36], [-34, -78 + buzz], [34, -78 - buzz], [28, -36]],
        { tone: "#c98b2e", ribs: 2, pin: { x: 0, y: -56, r: 5.0, metal: "brass" } }
      );

      // Blasting Zigzag Party Confetti & Acoustic Chevrons out the Right Bell!
      var blastCols = ["#d42a1e", "#0f8f80", "#2a3a63"];
      for (var bi = 0; bi < 3; bi++) {
        var bx = 165 + ((t * 95 + bi * 42) % 125);
        var by = (bi - 1) * 44 + Math.sin(t * 8 + bi) * 8;
        S.drawCutoutPaperEdge(
          ctx,
          [[bx, by - 18], [bx + 26, by], [bx, by + 18], [bx + 9, by]],
          blastCols[bi],
          "#14110d",
          { paperRim: 2.2, shadow: false }
        );
      }
      ctx.restore();

      // Brook the Trout wearing a Striped Birthday Party Hat puffing into the Kazoo!
      var btX = hubX - 196;
      var btY = hubY + 26;
      S.drawBrookTrout(ctx, btX, btY, 1.16, t, true);
      S.drawCutoutPaperEdge(
        ctx,
        [[btX + 34, btY - 22], [btX + 56, btY - 76], [btX + 76, btY - 18]],
        "#d42a1e",
        "#14110d",
        { paperRim: 2.5 }
      );

    } else {
      // --- VARIATION IV (D · Preposterous · Alien): A candy-stuffed alien mothership ---
      S.drawAlienSaucer(ctx, 640, 102, 1.15, t, hubX, hubY);

      ctx.save();
      ctx.translate(hubX, hubY + 18);
      ctx.rotate(Math.sin(t * 1.8) * 0.08);

      // Upper & Lower Split Star-Mothership Hull with Glowing Porthole Ring!
      S.drawScissorCutout(ctx, pImg, 228, 198, 190, 105, -138, -148, 276, 132, null, { haloWidth: 4.5 });
      S.drawScissorCutout(ctx, pImg, 228, 303, 190, 105, -138, 24, 276, 132, null, { haloWidth: 4.5 });

      // Riveted Brass Equatorial Mothership Ring + Glowing Teal Cabin Windows
      S.drawCardboardPuppetPiece(
        ctx,
        [[-168, -22], [168, -22], [186, 0], [168, 22], [-168, 22], [-186, 0]],
        { tone: "#8f6d38", ribs: 1, pins: [[-130, 0], [-65, 0], [0, 0], [65, 0], [130, 0]] }
      );
      for (var wi = -2; wi <= 2; wi++) {
        S.drawCutoutPaperEdge(
          ctx,
          [[wi * 58 - 14, -10], [wi * 58 + 14, -10], [wi * 58 + 14, 10], [wi * 58 - 14, 10]],
          "#5ee6d4",
          "#14110d",
          { paperRim: 1.8, shadow: false }
        );
      }

      // Orbiting Cut-Paper Wrapped Candies & Peppermint Swirls!
      var candyCols = ["#d42a1e", "#0f8f80", "#d99e3b", "#8a3ab9", "#d42a1e", "#0f8f80"];
      for (var ki = 0; ki < 6; ki++) {
        var ka = t * 1.5 + (ki / 6) * TAU;
        var kx = Math.cos(ka) * 208;
        var ky = Math.sin(ka) * 112;
        ctx.save();
        ctx.translate(kx, ky);
        ctx.rotate(ka + 0.6);
        // Twisted wrapper ears
        S.drawCutoutPaperEdge(ctx, [[-28, -12], [-12, 0], [-28, 12]], "#fbfaf7", "#14110d", { paperRim: 1.5, shadow: false });
        S.drawCutoutPaperEdge(ctx, [[28, -12], [12, 0], [28, 12]], "#fbfaf7", "#14110d", { paperRim: 1.5, shadow: false });
        // Candy bonbon round
        var cPoly = [];
        for (var cp = 0; cp < 8; cp++) {
          var ca = (cp / 8) * TAU;
          cPoly.push([Math.cos(ca) * 15, Math.sin(ca) * 15]);
        }
        S.drawCutoutPaperEdge(ctx, cPoly, candyCols[ki], "#14110d", { paperRim: 2.2, shadow: false });
        ctx.restore();
      }
      ctx.restore();
    }

    drawCouriersForBeat(S, ctx, beat, t, state, { floorY: 560, badgeX: 132, badgeY: 488, climbX: 1128 });
    S.drawCutShutter(ctx, 1280, 638, t, state);
    S.endCamera(ctx);
    S.drawRubricBar(ctx, 1280, 720, t, state, 7);
  }

  // ==========================================================================
  // #08 · Gauge — "perec-stage" (Monsieur Ripois + S05 Norstein + S45/S44/S35)
  // Reference p08.jpg: Golden spiral snail crawling over soggy torn river-bend
  // treasure map w/ inked "X" mark, creek trout peeking upper-right.
  // Reference atlas-16.webp: Cool cyan control room w/ concentric target ring.
  // ==========================================================================
  function renderP08(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(8);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, 1280, 720, t, { state: state });

    // 1. Carved Perec Ochre Sandstone Proscenium Opening onto Tinted Archival Recess
    S.drawBolasBackdrop(ctx, 1280, 720, "perec-stage", 8, t, state, {
      openX: 175,
      openY: 82,
      openW: 930,
      openH: 506
    });

    var pxDeep = S.parallaxX(0.18, t, state);
    var pyDeep = S.parallaxY(0.18, t, state);
    var pxMap = S.parallaxX(0.46, t, state);
    var pyMap = S.parallaxY(0.46, t, state);
    var pxNear = S.parallaxX(0.86, t, state);
    var pyNear = S.parallaxY(0.86, t, state);

    // 2. Deep Norstein Plane: Cool Control-Room Target Recess (atlas-16.webp) + Mist
    S.drawScissorCutout(
      ctx, aImg,
      55, 32, 630, 480,
      250 + pxDeep, 98 + pyDeep, 780, 468,
      [[0.04, 0.04], [0.96, 0.03], [0.98, 0.95], [0.03, 0.96]],
      { filter: "cyan", haloWidth: 4.0, alpha: 0.88 }
    );
    S.drawNorsteinFog(ctx, 1280, 620, t, 0.24, "218, 232, 230");
    S.drawLampBeam(ctx, 1280, 638, t, state, { x: 640, y: 585, aimX: 620, spread: 290, alpha: 0.16 });

    // 3. Mid Plane: Scissor-Cut Torn Parchment River Map & Peeking Trout from p08.jpg
    var mapRot = -0.05 + Math.sin(t * 0.65) * 0.025;
    var mapX = 365 + pxMap;
    var mapY = 112 + pyMap;
    S.drawScissorCutout(
      ctx, pImg,
      118, 116, 408, 412,
      mapX, mapY, 495, 445,
      [
        [0.14, 0.04], [0.58, 0.02], [0.76, 0.22], [0.94, 0.62],
        [0.82, 0.95], [0.42, 0.97], [0.16, 0.78], [0.04, 0.36]
      ],
      { rot: mapRot, haloWidth: 5.0, stroke: "#14110d", alpha: beat.index === 3 ? 0.65 : 0.96 }
    );

    // Upper-right peeking creek trout cutout from p08.jpg
    S.drawScissorCutout(
      ctx, pImg,
      396, 154, 130, 102,
      836 + pxMap * 1.15, 132 + Math.sin(t * 2.2) * 5, 198, 152,
      null,
      { haloWidth: 4.2, stroke: "#14110d" }
    );

    drawPaperBubbles(S, ctx, 8, 6, t, 260, 980, 110, 540, beat.ballastOn, "#dceee9");

    // Brass Gauge Window Vernier Ticks along Left & Right Stone Jambs (0 text!)
    ctx.save();
    ctx.strokeStyle = "#d4a44c";
    ctx.lineWidth = 2.2;
    for (var gy = 120; gy <= 545; gy += 24) {
      var tickW = (gy % 72 === 0) ? 22 : 11;
      ctx.beginPath();
      ctx.moveTo(176, gy); ctx.lineTo(176 + tickW, gy);
      ctx.moveTo(1104, gy); ctx.lineTo(1104 - tickW, gy);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Foreground S45 Occlusion Plane Across Variations I..IV
    var snailBaseX = 528 + pxNear * 0.65;
    var snailBaseY = 236 + pyNear * 0.55;

    if (beat.index === 0) {
      // --- VARIATION I (A · Real Creek): A tiny snail crawling on glass ---
      var glideX = snailBaseX - beat.u * 54;
      var glideY = snailBaseY - beat.u * 26;

      // Diagonal porthole glass specular streaks & pearlescent slime ribbon
      ctx.save();
      ctx.strokeStyle = "rgba(251, 250, 247, 0.72)";
      ctx.lineWidth = 9;
      ctx.setLineDash([16, 8]);
      ctx.beginPath();
      ctx.moveTo(glideX + 255, glideY + 205);
      ctx.lineTo(glideX + 95, glideY + 115);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // S35 Rippling Cardboard Foot Wave under Scissor-Cut Golden Snail (p08.jpg)
      S.drawScissorCutout(
        ctx, pImg,
        248, 248, 200, 168,
        glideX, glideY, 296, 248,
        [
          [0.04, 0.24], [0.28, 0.05], [0.74, 0.14], [0.95, 0.42],
          [0.96, 0.88], [0.62, 0.94], [0.22, 0.68]
        ],
        { haloWidth: 5.5, stroke: "#14110d" }
      );
      S.drawSplitPin(ctx, glideX + 188, glideY + 132, 5.2, { metal: "brass" });

      // Foreground glass sheen diagonal bars
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(280, 540); ctx.lineTo(540, 110);
      ctx.moveTo(335, 540); ctx.lineTo(595, 110);
      ctx.stroke();
      ctx.restore();

    } else if (beat.index === 1) {
      // --- VARIATION II (B · Probable · Turkey): A bug eating our treasure map ---
      var bugX = snailBaseX - 18 + Math.sin(t * 6.5) * 4;
      var bugY = snailBaseY + 6;

      // Munched scalloped bite-holes chewed right out of the treasure map!
      var bites = [[bugX - 18, bugY + 95, 28], [bugX + 8, bugY + 118, 24], [bugX - 38, bugY + 72, 22]];
      for (var bi = 0; bi < bites.length; bi++) {
        ctx.fillStyle = "#35424a";
        ctx.strokeStyle = "#fbfaf5";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(bites[bi][0], bites[bi][1], bites[bi][2], 0, TAU);
        ctx.fill();
        ctx.stroke();
      }

      // 6 Scrabbling Two-Bone IK Cardboard Beetle Legs!
      for (var li = 0; li < 3; li++) {
        var hipX = bugX + 115 + li * 42;
        var hipY = bugY + 155 + li * 12;
        var stepX = hipX - 42 + Math.sin(t * 9.5 + li * 2.1) * 18;
        var stepY = hipY + 56 + Math.max(0, Math.cos(t * 9.5 + li * 2.1)) * -14;
        var legIK = S.solveIK2(hipX, hipY, 44, 42, stepX, stepY, -1);
        drawJointedIKLimb(S, ctx, legIK, 7.5, 6.0, "#4c433a", "#695c4f", "silver");
      }

      // Snail Shell Carapace + Snapping Hinged Cardboard Beetle Mandibles!
      S.drawScissorCutout(
        ctx, pImg,
        248, 248, 200, 168,
        bugX, bugY, 284, 238,
        null,
        { haloWidth: 5.0, stroke: "#14110d" }
      );

      var chomp = Math.abs(Math.sin(t * 9.0)) * 0.36;
      ctx.save();
      ctx.translate(bugX + 42, bugY + 76);
      ctx.rotate(-0.55 - chomp);
      S.drawCardboardPuppetPiece(ctx, [[0, -8], [-58, -24], [-42, 4], [0, 8]], { tone: "#2e2925", ribs: 1, pin: { x: 0, y: 0, r: 4.0, metal: "brass" } });
      ctx.restore();
      ctx.save();
      ctx.translate(bugX + 38, bugY + 94);
      ctx.rotate(-0.35 + chomp);
      S.drawCardboardPuppetPiece(ctx, [[0, -8], [-58, 22], [-40, -4], [0, 8]], { tone: "#2e2925", ribs: 1, pin: { x: 0, y: 0, r: 4.0, metal: "brass" } });
      ctx.restore();

      // Flying chewed parchment crumbs
      for (var ci = 0; ci < 5; ci++) {
        var cu = ((t * 2.4 + ci * 0.2) % 1);
        var cx = bugX - 18 - cu * 65;
        var cy = bugY + 82 + (cu * cu * 75) - cu * 24 + ci * 7;
        S.drawCutoutPaperEdge(ctx, [[cx, cy], [cx + 11, cy - 4], [cx + 8, cy + 9]], "#efe5cc", "#14110d", { paperRim: 1.5, shadow: false });
      }

    } else if (beat.index === 2) {
      // --- VARIATION III (C · Plausible · Trout): A giant eyeball behind the glass ---
      var eyeCX = 595 + pxNear * 0.4;
      var eyeCY = 336 + pyNear * 0.4;
      var blink = clamp(1 - Math.pow(Math.max(0, Math.sin(t * 1.9)), 14) * 0.92, 0.08, 1.0);

      // Faint snail spiral shell backing ring
      S.drawScissorCutout(ctx, pImg, 310, 272, 132, 128, eyeCX - 138, eyeCY - 138, 276, 276, null, { haloWidth: 5.0 });

      // Articulated Cardboard Eyelashes radiating top & bottom
      for (var ei = -3; ei <= 3; ei++) {
        var ea = -Math.PI * 0.5 + ei * 0.26;
        var lx = eyeCX + Math.cos(ea) * 128;
        var ly = eyeCY + Math.sin(ea) * 112 * blink;
        S.drawCardboardPuppetPiece(
          ctx,
          [[lx - 5, ly], [lx + Math.cos(ea) * 34, ly + Math.sin(ea) * 34], [lx + 5, ly]],
          { tone: "#1f1d1b", ribs: 1, shadow: false }
        );
      }

      // Giant Cut-Paper Sclera, Teal-Amber Iris Ring, & Roving Pupil!
      ctx.save();
      ctx.translate(eyeCX, eyeCY);
      ctx.scale(1, blink);
      var scleraPts = [];
      for (var sp = 0; sp < 16; sp++) {
        var sa = (sp / 16) * TAU;
        scleraPts.push([Math.cos(sa) * 126, Math.sin(sa) * 106]);
      }
      S.drawCutoutPaperEdge(ctx, scleraPts, "#fbfaf7", "#14110d", { paperRim: 5.0 });

      var gazeX = Math.sin(t * 2.1) * 28 + 14;
      var gazeY = Math.cos(t * 1.6) * 14;
      var irisPts = [];
      for (var ip = 0; ip < 14; ip++) {
        var ia = (ip / 14) * TAU;
        irisPts.push([gazeX + Math.cos(ia) * 58, gazeY + Math.sin(ia) * 58]);
      }
      S.drawCutoutPaperEdge(ctx, irisPts, "#0f8f80", "#14110d", { paperRim: 2.5, shadow: false });

      ctx.fillStyle = "#d99e3b";
      ctx.beginPath(); ctx.arc(gazeX, gazeY, 38, 0, TAU); ctx.fill();
      ctx.fillStyle = "#14110d";
      ctx.beginPath(); ctx.arc(gazeX, gazeY, 22, 0, TAU); ctx.fill();
      ctx.fillStyle = "#fbfaf7";
      ctx.beginPath(); ctx.arc(gazeX - 9, gazeY - 9, 7.5, 0, TAU); ctx.fill();
      ctx.restore();

      // Brook the Trout peering back at the giant eyeball!
      S.drawBrookTrout(ctx, 888, 412 + Math.sin(t * 2.4) * 6, 1.15, t, false);

    } else {
      // --- VARIATION IV (D · Preposterous · Alien): A glowing slime-trail wormhole ---
      var vortX = 620;
      var vortY = 352;
      S.drawAlienSaucer(ctx, 640, 102, 1.16, t, vortX, vortY);

      // 5 Counter-Rotating Cut-Paper Logarithmic Spiral Wormhole Rings!
      var wCols = ["#2a3a63", "#0f8f80", "#fbfaf7", "#d42a1e", "#f3d184"];
      for (var wi = 0; wi < 5; wi++) {
        var wr = 186 - wi * 30;
        var wRot = t * (wi % 2 === 0 ? 1.6 : -2.1) + wi * 0.7;
        ctx.save();
        ctx.translate(vortX, vortY);
        ctx.rotate(wRot);
        var deca = [];
        for (var dp = 0; dp < 10; dp++) {
          var da = (dp / 10) * TAU;
          var dr = wr * (dp % 2 === 0 ? 1.0 : 0.84);
          deca.push([Math.cos(da) * dr, Math.sin(da) * dr * 0.88]);
        }
        S.drawCutoutPaperEdge(ctx, deca, wCols[wi], "#14110d", { paperRim: 3.0, shadow: wi === 0 });
        ctx.restore();
      }

      // Spinning Golden Snail Shell Core at the center of the Wormhole!
      S.drawScissorCutout(
        ctx, pImg,
        308, 270, 134, 132,
        vortX - 66, vortY - 66, 132, 132,
        null,
        { rot: t * 2.8, haloWidth: 4.0, pin: { x: vortX, y: vortY, r: 5.0, metal: "brass" } }
      );
    }

    drawCouriersForBeat(S, ctx, beat, t, state, { floorY: 558, badgeX: 126, badgeY: 492, climbX: 1138 });
    S.drawCutShutter(ctx, 1280, 638, t, state);
    S.endCamera(ctx);
    S.drawRubricBar(ctx, 1280, 720, t, state, 8);
  }

  // ==========================================================================
  // #09 · Port — "cardboard-parallax" (Les Lieux d'une fugue + S53 Civic + S33/S41/S44)
  // Reference p09.jpg: Trout pushing tin-can-loaded wire shopping cart along
  // cracked sunken asphalt road w/ dashed lane stripes & billowing silt clouds.
  // Reference atlas-44.webp: Submerged timber posts, barn wall & plant bed.
  // ==========================================================================
  function renderP09(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(9);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, 1280, 720, t, { state: state });

    // 1. Silver-Gelatin Monochrome Parallax Stage + Academy Pillarbox Mattes (la-mort-en-ce-jardin.webp!)
    S.drawBolasBackdrop(ctx, 1280, 720, "cardboard-parallax", 9, t, state);
    S.drawLampBeam(ctx, 1280, 638, t, state, { x: 620, y: 580, aimX: 560, spread: 310, alpha: 0.15 });

    var px1 = S.parallaxX(0.18, t, state);
    var px2 = S.parallaxX(0.34, t, state);
    var px3 = S.parallaxX(0.54, t, state);
    var px4 = S.parallaxX(0.78, t, state);
    var py4 = S.parallaxY(0.78, t, state);

    // 2. Planes 1 & 2: Monochrome TVA Submerged Timber Posts, Barn, & Plant Bed (atlas-44.webp)
    S.drawScissorCutout(
      ctx, aImg,
      0, 0, 315, 395,
      96 + px1, 48, 375, 430,
      [[0.04, 0.04], [0.92, 0.03], [0.88, 0.95], [0.05, 0.96]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.84 }
    );
    S.drawScissorCutout(
      ctx, aImg,
      440, 0, 300, 380,
      815 + px2, 44, 365, 425,
      [[0.08, 0.04], [0.96, 0.03], [0.95, 0.96], [0.12, 0.94]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.84 }
    );
    S.drawScissorCutout(
      ctx, aImg,
      165, 240, 435, 176,
      345 + px2 * 1.15, 355, 590, 195,
      null,
      { filter: "mono", haloWidth: 3.5, alpha: 0.80 }
    );

    // 3. Plane 3: Sunken Cracked Roadbed & Silt Plume Cutouts (p09.jpg)
    S.drawScissorCutout(
      ctx, pImg,
      178, 404, 286, 140,
      275 + px3, 445, 720, 168,
      [[0.05, 0.14], [0.94, 0.10], [0.98, 0.92], [0.02, 0.94]],
      { filter: "mono", haloWidth: 4.5 }
    );
    S.drawScissorCutout(
      ctx, pImg,
      100, 120, 145, 385,
      94 + px3 * 1.1, 122, 196, 445,
      null,
      { filter: "mono", haloWidth: 4.0, alpha: 0.88 }
    );

    S.drawNorsteinFog(ctx, 1280, 620, t, 0.18, "224, 226, 224");
    drawPaperBubbles(S, ctx, 9, 6, t, 220, 1020, 100, 520, beat.ballastOn, "#e2e4e2");

    // 4. Plane 4: Scissor-Cut Wire Shopping Cart + Jointed Split-Pin Grey-Cardboard Trout Pusher (S33/S41)
    var ramThrust = (beat.index === 1) ? S.springImpulse(beat.localT % 1.3, 0.05, 15, 4.2) * -65 : 0;
    var cartX = 548 - Math.sin(t * 1.15) * 26 + ramThrust + px4 * 0.65;
    var bump = Math.abs(Math.sin(t * 7.6)) * 5.5;
    var cartY = 326 - bump + py4 * 0.45;

    // Variation III Background Add-on: Narrowing Torn-Paper Grocery Shelf Gondolas!
    if (beat.index === 2) {
      var shelfCols = ["#0f8f80", "#d99e3b", "#d42a1e"];
      var sXs = [156, 956];
      for (var si = 0; si < 2; si++) {
        var sx = sXs[si] + px3 * 0.5;
        S.drawTornPaperFlat(ctx, sx, 98, 162, 442, { fill: "#4a4b4d", paperColor: "#f3efe4", deckle: 6.0 });
        for (var row = 0; row < 4; row++) {
          var ry = 152 + row * 94;
          S.drawCardboardPuppetPiece(ctx, [[sx + 8, ry + 36], [sx + 154, ry + 36], [sx + 154, ry + 48], [sx + 8, ry + 48]], { tone: "#8f8d88", ribs: 1, shadow: false });
          for (var can = 0; can < 3; can++) {
            var cx = sx + 20 + can * 44;
            S.drawCutoutPaperEdge(ctx, [[cx, ry], [cx + 32, ry], [cx + 32, ry + 36], [cx, ry + 36]], shelfCols[(row + can) % 3], "#14110d", { paperRim: 2.0, shadow: false });
          }
        }
      }
    }

    // Variation IV Add-on: Jagged Cardboard Asteroid Crater Rocks & Alien Saucer!
    if (beat.index === 3) {
      S.drawAlienSaucer(ctx, 635, 102, 1.16, t, cartX - 45, cartY + 25);
      S.drawCardboardPuppetPiece(
        ctx,
        [[220, 565], [275, 468], [355, 488], [415, 565]],
        { tone: "#5c5e63", ribs: 3 }
      );
      // Glowing Teal Asteroid Crystal Ore Target
      S.drawCutoutPaperEdge(
        ctx,
        [[286, 482], [308, 422], [336, 448], [352, 418], [364, 486]],
        "#0f8f80",
        "#14110d",
        { paperRim: 3.5 }
      );
    }

    // Scissor-Cut Wire Shopping Cart & Tin Cans from p09.jpg (sx=206..414, sy=236..474)
    S.drawScissorCutout(
      ctx, pImg,
      206, 236, 208, 238,
      cartX - 155, cartY - 102, 292, 294,
      [
        [0.03, 0.22], [0.58, 0.03], [0.96, 0.05], [0.88, 0.64],
        [0.86, 0.94], [0.16, 0.96], [0.12, 0.68]
      ],
      {
        filter: "mono",
        haloWidth: 5.0,
        rot: beat.index === 2 ? 0.08 : 0,
        stroke: "#14110d"
      }
    );

    // Spinning Cardboard Caster Wheels (or 6 Rocker-Bogie Rover Wheels in Beat D!)
    var wheelOffsets = (beat.index === 3) ? [-118, -36, 48] : [-96, 46];
    for (var wi = 0; wi < wheelOffsets.length; wi++) {
      var wx = cartX + wheelOffsets[wi];
      var wy = cartY + 178;
      var wRad = (beat.index === 3) ? 28 : 20;
      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(-t * 5.2);
      var wPoly = [];
      for (var wp = 0; wp < 10; wp++) {
        var wa = (wp / 10) * TAU;
        var rr = wRad * (wp % 2 === 0 ? 1.0 : 0.86);
        wPoly.push([Math.cos(wa) * rr, Math.sin(wa) * rr]);
      }
      S.drawCardboardPuppetPiece(ctx, wPoly, { tone: "#3c3d3f", ribs: 1 });
      S.drawSplitPin(ctx, 0, 0, 4.8, { metal: "silver" });
      ctx.restore();
    }

    // Beat B Specific Prop: Heavy Riveted Cardboard Iron Ramming Cage bolted to Cart Prow!
    if (beat.index === 1) {
      var prowX = cartX - 158;
      var prowY = cartY - 22;
      S.drawCardboardPuppetPiece(
        ctx,
        [
          [prowX + 36, prowY - 68], [prowX - 58, prowY - 42],
          [prowX - 88, prowY + 88], [prowX + 44, prowY + 96]
        ],
        {
          tone: "#36383b",
          ribs: 4,
          pins: [[prowX + 18, prowY - 46], [prowX + 18, prowY + 12], [prowX + 18, prowY + 72]]
        }
      );
      // 4 Iron Battering-Ram Spikes
      for (var sp = 0; sp < 4; sp++) {
        var sy = prowY - 32 + sp * 34;
        var sx = prowX - 52 - sp * 7;
        S.drawCutoutPaperEdge(ctx, [[sx + 6, sy - 10], [sx - 38, sy], [sx + 6, sy + 10]], "#b8b4ac", "#14110d", { paperRim: 2.2 });
      }
    }

    // Beat D Specific Props: Rover Parabolic Telemetry Dish, Crystal Ore Load, & IK Laser Drill!
    if (beat.index === 3) {
      // Glowing emerald ore shards overflowing basket
      S.drawCutoutPaperEdge(ctx, [[cartX - 95, cartY - 48], [cartX - 72, cartY - 96], [cartX - 44, cartY - 52]], "#0f8f80", "#14110d", { paperRim: 2.5 });
      S.drawCutoutPaperEdge(ctx, [[cartX - 48, cartY - 54], [cartX - 18, cartY - 104], [cartX + 8, cartY - 50]], "#5ee6d4", "#14110d", { paperRim: 2.5 });

      // Spinning Cardboard Telemetry Dish atop handlebar
      ctx.save();
      ctx.translate(cartX + 88, cartY - 108);
      ctx.rotate(Math.sin(t * 2.5) * 0.35);
      S.drawCardboardPuppetPiece(ctx, [[-34, 0], [-18, -28], [18, -28], [34, 0]], { tone: "#b8b4ac", ribs: 2, pin: { x: 0, y: 0, r: 4.4, metal: "brass" } });
      ctx.restore();

      // IK Core-Drill Arm zapping the crater crystal
      var drillIK = S.solveIK2(cartX - 125, cartY + 18, 68, 66, 326, 442, -1);
      drawJointedIKLimb(S, ctx, drillIK, 10, 8, "#7d7b76", "#b88a44", "brass");
      ctx.strokeStyle = "#d42a1e";
      ctx.lineWidth = 3.2;
      ctx.setLineDash([7, 4]);
      ctx.beginPath();
      ctx.moveTo(drillIK.ex, drillIK.ey);
      ctx.lineTo(318, 452);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Handmade Jointed Grey-Cardboard Trout Pusher (la-mort-en-ce-jardin.webp homage + S33 IK!)
    var pusherX = cartX + 204;
    var pusherY = cartY - 42 + Math.sin(t * 3.8) * 4;
    var handleX = cartX + 104;
    var handleY = cartY - 72;

    // Back IK Pectoral Arm
    var ikBack = S.solveIK2(pusherX - 54, pusherY + 26, 66, 62, handleX + 12, handleY - 8, 1);
    drawJointedIKLimb(S, ctx, ikBack, 11, 9, "#6a6965", "#7f7e79", "silver");

    // Wagging Split-Pin Cardboard Caudal Tail
    ctx.save();
    ctx.translate(pusherX + 86, pusherY + 42);
    ctx.rotate(Math.sin(t * 5.8) * 0.22);
    S.drawCardboardPuppetPiece(ctx, [[-8, -10], [46, -34], [34, 4], [44, 38], [-8, 12]], { tone: "#6c6b67", ribs: 2, pin: { x: 0, y: 0, r: 4.0, metal: "silver" } });
    ctx.restore();

    // Mottled Grey-Cardboard Trout Torso & Scissor-Cut Head Accent
    S.drawCardboardPuppetPiece(
      ctx,
      [
        [pusherX - 96, pusherY - 12], [pusherX - 42, pusherY - 44],
        [pusherX + 42, pusherY - 22], [pusherX + 92, pusherY + 38],
        [pusherX + 48, pusherY + 58], [pusherX - 62, pusherY + 36]
      ],
      {
        tone: "#8e8d88",
        ribs: 4,
        pins: [[pusherX - 38, pusherY - 6], [pusherX + 34, pusherY + 18]]
      }
    );
    // Pencilled eye on cardboard trout pusher
    ctx.fillStyle = "#fbfaf5";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.0;
    ctx.beginPath(); ctx.arc(pusherX - 66, pusherY - 14, 7.5, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#14110d";
    ctx.beginPath(); ctx.arc(pusherX - 68, pusherY - 14, 3.4, 0, TAU); ctx.fill();

    // Front IK Pectoral Arm pinned directly onto Cart Handlebar!
    var ikFront = S.solveIK2(pusherX - 42, pusherY + 34, 70, 66, handleX, handleY, 1);
    drawJointedIKLimb(S, ctx, ikFront, 12, 10, "#85847f", "#9e9c96", "silver");

    // Beat C Impatient Shopper: Brook the Trout waiting behind the blocked aisle w/ hand-basket!
    if (beat.index === 2) {
      var btX = 858;
      var btY = 398 + Math.sin(t * 4.5) * 6;
      S.drawBrookTrout(ctx, btX, btY, 1.12, t, false);
      S.drawCutoutPaperEdge(
        ctx,
        [[btX - 64, btY + 22], [btX - 18, btY + 22], [btX - 24, btY + 52], [btX - 58, btY + 52]],
        "#d42a1e",
        "#14110d",
        { paperRim: 2.2 }
      );
    }

    drawCouriersForBeat(S, ctx, beat, t, state, { floorY: 558, badgeX: 148, badgeY: 492, climbX: 1126 });
    S.drawCutShutter(ctx, 1280, 638, t, state);
    S.endCamera(ctx);
    S.drawRubricBar(ctx, 1280, 720, t, state, 9);
  }

  // ==========================================================================
  // #10 · PA — "perec-stage" (La Cite Raymond Queneau + S16 JibJab + S32/S47/S41)
  // Reference p10.jpg: Fluted white clam-shell loudspeaker on brass bracket on
  // mossy red-brick wall projecting sound arcs to 4 attentive trout.
  // Reference atlas-34.webp: Water Fountain turquoise practical room & cords.
  // (Brick crop stops at sy+sh = 434 < 445 so ZERO textbook text ever enters!)
  // ==========================================================================
  function renderP10(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(10);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, 1280, 720, t, { state: state });

    // 1. Carved Proscenium Opening onto Turquoise Practical Set (atlas-34.webp)
    S.drawBolasBackdrop(ctx, 1280, 720, "perec-stage", 10, t, state, {
      openX: 168,
      openY: 84,
      openW: 944,
      openH: 508,
      doors: false
    });

    var pxBack = S.parallaxX(0.20, t, state);
    var pyBack = S.parallaxY(0.20, t, state);
    var pxWall = S.parallaxX(0.46, t, state);
    var pyWall = S.parallaxY(0.46, t, state);

    // 2. Practical Turquoise Room Recess from atlas-34.webp + Water Caustics
    S.drawScissorCutout(
      ctx, aImg,
      90, 4, 535, 398,
      368 + pxBack, 92 + pyBack, 728, 488,
      [[0.03, 0.03], [0.97, 0.02], [0.98, 0.96], [0.02, 0.97]],
      { haloWidth: 4.0, alpha: 0.92 }
    );
    S.drawWaterCaustics(ctx, 1280, 590, t, 0.18);
    S.drawLampBeam(ctx, 1280, 638, t, state, { x: 640, y: 585, aimX: 600, spread: 300, alpha: 0.16 });

    // 3. Mossy Red-Brick School Wall Cutout from p10.jpg (sx=102..362, sy=104..434 — 100% text-free!)
    var wallX = 168 + pxWall * 0.55;
    var wallY = 92 + pyWall * 0.4;
    S.drawScissorCutout(
      ctx, pImg,
      102, 104, 260, 330,
      wallX, wallY, 356, 492,
      [[0.02, 0.02], [0.94, 0.03], [0.97, 0.52], [0.92, 0.97], [0.03, 0.98]],
      { haloWidth: 4.8, stroke: "#14110d" }
    );

    // Attentive School of 4 Trout Cutout from p10.jpg (sx=376..538, sy=362..498)
    var floatY = (beat.index === 3) ? (-58 + Math.sin(t * 2.6) * 14) : (Math.sin(t * 2.2) * 7);
    S.drawScissorCutout(
      ctx, pImg,
      376, 362, 162, 136,
      782 + pxWall * 1.1, 368 + floatY, 294, 214,
      null,
      { haloWidth: 4.5, stroke: "#14110d" }
    );

    drawPaperBubbles(S, ctx, 10, 7, t, 540, 1040, 110, 520, beat.ballastOn, "#fbfaf7");

    // 4. S32/S47/S41 Hinged Split-Jaw Clam-Shell Cutout on Brass Wall Bracket!
    var talkEnv = Math.pow(Math.max(0, Math.sin(t * 6.8) * 0.65 + Math.sin(t * 11.4) * 0.35), 2);
    var jawAng = 0.07 + talkEnv * (beat.index === 1 ? 0.52 : 0.36) + S.springImpulse(beat.localT, 0.08, 13, 4.0) * 0.22;
    var recoilX = -talkEnv * 6;
    var hx = wallX + 206 + recoilX;
    var hy = wallY + 226;

    // --- Inner Throat / Cavity Props BEFORE Shell Halves ---
    if (beat.index === 0) {
      // Variation I (A · Real Creek): Brass PA Speaker Cone & Concentric Cut-Paper Acoustic Arcs!
      S.drawCutoutPaperEdge(ctx, [[hx + 12, hy - 28], [hx + 92, hy - 54], [hx + 92, hy + 54], [hx + 12, hy + 28]], "#c99842", "#14110d", { paperRim: 2.5 });
      for (var wa = 0; wa < 4; wa++) {
        var wu = ((t * 0.85 + wa * 0.25) % 1);
        var ar = 145 + wu * 285;
        ctx.save();
        ctx.strokeStyle = (wa % 2 === 0) ? "#fbfaf7" : "#0f8f80";
        ctx.lineWidth = 7.0 * (1 - wu * 0.65);
        ctx.beginPath();
        ctx.arc(hx + 85, hy, ar, -0.52, 0.52);
        ctx.stroke();
        ctx.restore();
      }
    } else if (beat.index === 1) {
      // Variation II (B · Probable · Turkey): Snapping Monster Tongue & Fangs!
      var whip = Math.sin(t * 9.5) * 22;
      S.drawCutoutPaperEdge(
        ctx,
        [[hx + 34, hy - 14], [hx + 195, hy - 26 + whip], [hx + 268, hy + whip * 1.4], [hx + 236, hy + 24 + whip], [hx + 34, hy + 18]],
        "#d42a1e",
        "#14110d",
        { paperRim: 3.0 }
      );
    } else if (beat.index === 2) {
      // Variation III (C · Plausible · Trout): Tumbling Cut-Paper School Lunch (Sandwich, Apple, Thermos)!
      var bobL = Math.sin(t * 3.4) * 8;
      // Triangle Sandwich Cutout
      S.drawCutoutPaperEdge(ctx, [[hx + 185, hy - 38 + bobL], [hx + 265, hy - 12 + bobL], [hx + 195, hy + 36 + bobL]], "#f2dc9b", "#14110d", { paperRim: 3.0 });
      // Red Apple Cutout w/ Green Leaf
      var apX = hx + 308;
      var apY = hy + 28 - bobL;
      var apPts = [];
      for (var ai = 0; ai < 10; ai++) {
        var aa = (ai / 10) * TAU;
        apPts.push([apX + Math.cos(aa) * 24, apY + Math.sin(aa) * 22]);
      }
      S.drawCutoutPaperEdge(ctx, apPts, "#d42a1e", "#14110d", { paperRim: 2.5 });
      S.drawCutoutPaperEdge(ctx, [[apX + 2, apY - 22], [apX + 18, apY - 36], [apX + 14, apY - 18]], "#2d6846", "#14110d", { paperRim: 1.5, shadow: false });
      // Brass Thermos Cylinder
      S.drawCardboardPuppetPiece(ctx, [[hx + 122, hy - 18], [hx + 168, hy - 34], [hx + 182, hy + 26], [hx + 136, hy + 42]], { tone: "#0f8f80", ribs: 2 });

      // Brook the Trout swimming up happily for lunch!
      S.drawBrookTrout(ctx, 848, 258 + Math.sin(t * 2.8) * 6, 1.15, t, false);

    } else {
      // Variation IV (D · Preposterous · Alien): Telescoping Space Megaphone & Mind-Wave Rings!
      S.drawAlienSaucer(ctx, 668, 102, 1.16, t, hx + 175, hy);
      S.drawCardboardPuppetPiece(
        ctx,
        [[hx + 30, hy - 22], [hx + 245, hy - 74], [hx + 245, hy + 74], [hx + 30, hy + 22]],
        { tone: "#b88a44", ribs: 3, pins: [[hx + 95, hy], [hx + 185, hy]] }
      );
      // Nested Rotating Geometric Telepathy Hexagons!
      for (var mi = 0; mi < 4; mi++) {
        var mu = ((t * 0.72 + mi * 0.25) % 1);
        var mx = lerp(hx + 255, 935, mu);
        var my = lerp(hy, 355, mu);
        var mr = lerp(34, 92, mu);
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(t * 2.1 + mi);
        var hex = [];
        for (var hp = 0; hp < 6; hp++) {
          var ha = (hp / 6) * TAU;
          hex.push([Math.cos(ha) * mr, Math.sin(ha) * mr * 0.65]);
        }
        ctx.strokeStyle = (mi % 2 === 0) ? "#d42a1e" : "#0f8f80";
        ctx.lineWidth = 4.0;
        ctx.beginPath();
        for (var hq = 0; hq < 6; hq++) {
          if (hq === 0) ctx.moveTo(hex[hq][0], hex[hq][1]);
          else ctx.lineTo(hex[hq][0], hex[hq][1]);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
    }

    // --- Upper Hinged Clam-Shell Valve Cutout (p10.jpg sx=192..416, sy=164..276) ---
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
    if (beat.index === 1) {
      // Upper jagged white cut-paper monster fangs protruding cleanly from upper lip + glaring eye!
      S.drawCutoutPaperEdge(
        ctx,
        [[68, -14], [92, 32], [118, -12], [146, 36], [174, -14], [202, 34], [230, -16], [256, 28], [276, -22]],
        "#fbfaf7",
        "#14110d",
        { paperRim: 2.2, shadow: false }
      );
      S.drawCutoutPaperEdge(ctx, [[135, -128], [176, -154], [212, -122], [174, -96]], "#f3d184", "#14110d", { paperRim: 3.0 });
      ctx.fillStyle = "#14110d";
      ctx.fillRect(171, -142, 7, 34);
    } else if (beat.index === 2) {
      // Lunchbox Red Plaid Strap & Top Folding Metal Handle!
      S.drawCardboardPuppetPiece(ctx, [[110, -146], [154, -146], [148, -24], [104, -24]], { tone: "#d42a1e", ribs: 2 });
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 6.0;
      ctx.beginPath();
      ctx.arc(165, -148, 34, Math.PI, 0);
      ctx.stroke();
    }
    ctx.restore();

    // --- Lower Hinged Clam-Shell Valve Cutout (p10.jpg sx=192..420, sy=276..388) ---
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
    if (beat.index === 1) {
      // Lower jagged white cut-paper monster fangs protruding cleanly from lower lip!
      S.drawCutoutPaperEdge(
        ctx,
        [[72, 14], [98, -30], [126, 14], [156, -34], [186, 14], [214, -30], [242, 16], [268, -26], [286, 20]],
        "#fbfaf7",
        "#14110d",
        { paperRim: 2.2, shadow: false }
      );
    }
    if (beat.index === 2) {
      S.drawCardboardPuppetPiece(ctx, [[110, 18], [154, 18], [148, 138], [104, 138]], { tone: "#d42a1e", ribs: 2 });
      S.drawSplitPin(ctx, 265, 32, 5.5, { metal: "silver" });
    }
    ctx.restore();

    // Brass Wall-Mount Bracket & Filigree Split-Pin Hinge
    S.drawCardboardPuppetPiece(
      ctx,
      [[hx - 54, hy - 28], [hx + 6, hy - 16], [hx + 6, hy + 16], [hx - 54, hy + 28]],
      { tone: "#c99842", ribs: 1 }
    );
    S.drawReinigerFiligreeHinge(ctx, hx - 4, hy, 18, { metal: "brass" });

    drawCouriersForBeat(S, ctx, beat, t, state, { floorY: 558, badgeX: 128, badgeY: 492, climbX: 1138 });
    S.drawCutShutter(ctx, 1280, 638, t, state);
    S.endCamera(ctx);
    S.drawRubricBar(ctx, 1280, 720, t, state, 10);
  }

  // ---------- Register Crew 02 Remake Scenes (#06–#10) ----------
  var SCENE_SPECS = [
    { id: 6, station: "#06 \u00b7 Stern", bolasStyle: "daumier-litho", fn: renderP06 },
    { id: 7, station: "#07 \u00b7 Hatch", bolasStyle: "queneau-rostrum", fn: renderP07 },
    { id: 8, station: "#08 \u00b7 Gauge", bolasStyle: "perec-stage", fn: renderP08 },
    { id: 9, station: "#09 \u00b7 Port", bolasStyle: "cardboard-parallax", fn: renderP09 },
    { id: 10, station: "#10 \u00b7 PA", bolasStyle: "perec-stage", fn: renderP10 }
  ];

  for (var i = 0; i < SCENE_SPECS.length; i++) {
    (function (spec) {
      root.PORTAL_REMAKE_SCENES[spec.id] = {
        id: spec.id,
        station: spec.station,
        duration: 16.0,
        bolasStyle: spec.bolasStyle,
        preload: function () {
          var S = getStage();
          return S ? S.preloadPortalPlates(spec.id) : Promise.resolve(null);
        },
        render: function (ctx, W, H, t, state) {
          var w = W || 1280;
          var h = H || 720;
          ctx.save();
          if (w !== 1280 || h !== 720) {
            ctx.scale(w / 1280, h / 720);
          }
          spec.fn(ctx, 1280, 720, t, state || {});
          ctx.restore();
        }
      };
    })(SCENE_SPECS[i]);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.PORTAL_REMAKE_SCENES;
  }
})(typeof window !== "undefined" ? window : globalThis);
