/* ============================================================================
 * Turkey Sub · Multi-SCION Animation Remake Module — Crew 10 (#46–#50)
 * File: portals/remake-10.js  (window.PORTAL_REMAKE_SCENES[46..50])
 *
 * 16.0s (384 frames @ 24fps, 1280×720) 4-Variation BOLAS Oulipo Screening Room Cinema:
 *   - 0.0–4.0s   : Variation I   · (A) Real Creek
 *   - 4.0–8.0s   : Variation II  · (B) Probable · Turkey (+ Snail Mail Dispatch)
 *   - 8.0–12.0s  : Variation III · (C) Plausible · Trout (+ Snail Mail Reply)
 *   - 12.0–16.0s : Variation IV  · (D) Preposterous · Alien Listening Post
 *
 * Assigned Slice (#46–#50):
 *   #46 · Steps  — queneau-rostrum    · Zazie dans le métro + S01 Gilliam
 *   #47 · Armada — perec-stage        · ALAMO + S18 Cartoon Saloon
 *   #48 · Belfry — cardboard-parallax · Récits d’Ellis Island + S50 LOC-Archive
 *   #49 · Corner — cardboard-parallax · Renzo e Luciana + S53 CivicFootage
 *   #50 · Riffle — daumier-litho      · Ouhispo + S50 LOC-Archive
 *
 * PAELEO Blind Invariant: Emits ZERO fillText/strokeText calls when
 * state && state.showCaptions === false; all scene forms are foraged bitmap
 * scissor-cutouts + handmade cardboard/lithograph polygon rigs.
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var DURATION = 16.0;
  var IDS = [46, 47, 48, 49, 50];

  root.PORTAL_REMAKE_SCENES = root.PORTAL_REMAKE_SCENES || {};

  function stage() {
    return root.SCION_STAGE;
  }

  // Kick off async plate preloading immediately when loaded in browser/Puppeteer
  if (root.SCION_STAGE && typeof root.SCION_STAGE.preloadPortalPlates === "function") {
    root.SCION_STAGE.preloadPortalPlates(IDS);
  }

  // ---------- Shared Tactile & Kinematic Helpers (Zero Text Calls!) ----------

  function drawLimbSegment(ctx, S, x0, y0, x1, y1, w0, w1, tone, pinStart, pinEnd) {
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
    var pins = [];
    if (pinStart) pins.push({ x: x0, y: y0, r: 4.0, metal: pinStart });
    if (pinEnd) pins.push({ x: x1, y: y1, r: 3.8, metal: pinEnd });
    S.drawCardboardPuppetPiece(ctx, pts, { tone: tone || "#86847f", ribs: 2, pins: pins });
  }

  // Fractional [0..1] source crop wrapper so plates of any pixel resolution crop cleanly!
  function drawFracCutout(ctx, S, img, u0, v0, uw, vh, dx, dy, dw, dh, poly, opts) {
    var iw = (img && img.naturalWidth) ? img.naturalWidth : 640;
    var ih = (img && img.naturalHeight) ? img.naturalHeight : 640;
    S.drawScissorCutout(
      ctx, img,
      Math.round(u0 * iw), Math.round(v0 * ih),
      Math.round(uw * iw), Math.round(vh * ih),
      dx, dy, dw, dh, poly, opts
    );
  }

  function drawCutoutBubble(ctx, S, x, y, r, fill) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.arc(0, 0, r + 2.4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = fill || "rgba(198, 236, 232, 0.78)";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-r * 0.32, -r * 0.32, Math.max(1.4, r * 0.26), 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawBallastStream(ctx, S, W, H, t, beat, tint) {
    var count = beat.ballastOn ? 14 : 4;
    for (var i = 0; i < count; i++) {
      var seed = i * 13.7 + 2.3;
      var bx = 150 + S.hash(seed) * (W - 300) + Math.sin(t * 2.1 + i) * 14;
      var speed = beat.ballastOn ? 92 : 38;
      var by = 590 - (((t * speed + S.hash(seed + 5.1) * 520) % 520));
      var br = (beat.ballastOn ? 5.5 : 3.6) + S.hash(seed + 9.4) * 4.5;
      drawCutoutBubble(ctx, S, bx, by, br, tint);
    }
  }

  function drawCourierOverlay(ctx, S, W, H, t, beat, state, cfg) {
    var opts = cfg || {};
    var floorY = opts.floorY != null ? opts.floorY : 542;
    var climbX = opts.climbX != null ? opts.climbX : (W - 106);

    if (beat.index === 1) {
      // Variation II (B): Cardboard Turkey cutaway + Mail Snail outbound dispatch
      var disp = S.clamp(beat.u * 1.6, 0, 1);
      S.drawTurkeyCutawayBadge(ctx, opts.turkeyX || 128, opts.turkeyY || 494, 1.04, t, { dispatch: disp });
      var sx = S.lerp(225, W - 210, S.easeInOutCubic(beat.u));
      var sy = floorY + Math.sin(t * 5.2) * 3.0;
      S.drawMailSnail(ctx, sx, sy, 1.24, t, { hasReply: false });
    } else if (beat.index === 2) {
      // Variation III (C): Mail Snail climbs right frame with green Trout reply stamp
      var cy = S.lerp(525, 195, S.easeInOutCubic(beat.u));
      S.drawMailSnail(ctx, climbX, cy, 1.16, t, { rot: -Math.PI * 0.48, hasReply: true });
    } else if (state && state.snailActive) {
      var su = state.snailT != null ? state.snailT : ((t * 0.25) % 1);
      S.drawMailSnail(ctx, S.lerp(180, W - 180, su), floorY, 1.18, t, {
        hasReply: beat.index >= 2,
        hasAlienStamp: beat.index === 3
      });
    }
  }

  // Sculpted pure-vector glyph relief on brass blocks (G-O-B-B-L-E) — ZERO text calls!
  function drawBrassGlyphRelief(ctx, idx, size, blindMode) {
    var s = size * 0.34;
    ctx.save();
    ctx.strokeStyle = "#4b310a";
    ctx.fillStyle = "#fff1ba";
    ctx.lineWidth = Math.max(3.0, size * 0.11);
    ctx.lineCap = "square";
    ctx.lineJoin = "miter";

    if (blindMode) {
      // Pure architectural stepped brass coffer & rivet relief in blind mode!
      ctx.strokeRect(-s, -s, s * 2, s * 2);
      ctx.fillStyle = "#d99b34";
      ctx.fillRect(-s * 0.55, -s * 0.55, s * 1.1, s * 1.1);
      ctx.strokeRect(-s * 0.55, -s * 0.55, s * 1.1, s * 1.1);
      ctx.restore();
      return;
    }

    // Vector-sculpted architectural slab forms (still 0 fillText/strokeText!)
    ctx.beginPath();
    if (idx === 0) {
      // Sculpted 'G' arch (counter-clockwise 290° C-loop + inward horizontal bar)
      ctx.arc(0, 0, s, -Math.PI * 0.22, Math.PI * 0.18, true);
      ctx.lineTo(s, 0);
      ctx.lineTo(0, 0);
    } else if (idx === 1) {
      // Sculpted 'O' ring
      ctx.arc(0, 0, s, 0, TAU);
    } else if (idx === 2 || idx === 3) {
      // Sculpted 'B' double-loop
      ctx.moveTo(-s * 0.85, -s);
      ctx.lineTo(-s * 0.85, s);
      ctx.moveTo(-s * 0.85, -s);
      ctx.arc(-s * 0.1, -s * 0.5, s * 0.5, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.lineTo(-s * 0.85, 0);
      ctx.moveTo(-s * 0.85, 0);
      ctx.arc(-s * 0.05, s * 0.5, s * 0.52, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.lineTo(-s * 0.85, s);
    } else if (idx === 4) {
      // Sculpted 'L' angle
      ctx.moveTo(-s * 0.65, -s);
      ctx.lineTo(-s * 0.65, s);
      ctx.lineTo(s * 0.75, s);
    } else {
      // Sculpted 'E' trident
      ctx.moveTo(s * 0.7, -s);
      ctx.lineTo(-s * 0.7, -s);
      ctx.lineTo(-s * 0.7, s);
      ctx.lineTo(s * 0.7, s);
      ctx.moveTo(-s * 0.7, 0);
      ctx.lineTo(s * 0.45, 0);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawIsometricBrassBlock(ctx, S, x, y, w, h, depth3d, rot, idx, opts) {
    var cfg = opts || {};
    var hw = w * 0.5;
    var hh = h * 0.5;
    var dx = depth3d * 0.72;
    var dy = -depth3d * 0.54;

    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);

    // Outer white scissor-cutout paper halo around entire 3D block
    var haloPoly = [
      [-hw - 5, -hh - 5],
      [-hw + dx, -hh + dy - 5],
      [hw + dx + 5, -hh + dy - 5],
      [hw + dx + 5, hh + dy],
      [hw + 5, hh + 5],
      [-hw - 5, hh + 5]
    ];
    S.drawCutoutPaperEdge(ctx, haloPoly, "#c9922e", "#14110d", {
      paperRim: 4.2,
      shadowX: 5,
      shadowY: 7
    });

    // Top 3D bevel face
    ctx.fillStyle = cfg.glow ? "#ffe999" : "#f4d27a";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-hw, -hh);
    ctx.lineTo(-hw + dx, -hh + dy);
    ctx.lineTo(hw + dx, -hh + dy);
    ctx.lineTo(hw, -hh);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right 3D shadow face
    ctx.fillStyle = "#8c5f16";
    ctx.beginPath();
    ctx.moveTo(hw, -hh);
    ctx.lineTo(hw + dx, -hh + dy);
    ctx.lineTo(hw + dx, hh + dy);
    ctx.lineTo(hw, hh);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Front brass face with subtle metallic gradient
    var fg = ctx.createLinearGradient(-hw, -hh, hw, hh);
    fg.addColorStop(0.0, cfg.glow ? "#fff0b3" : "#ecc160");
    fg.addColorStop(0.55, "#cf9630");
    fg.addColorStop(1.0, "#9e6c1a");
    ctx.fillStyle = fg;
    ctx.fillRect(-hw, -hh, w, h);
    ctx.strokeRect(-hw, -hh, w, h);

    // Sculpted brass face detail + corner split-pins
    drawBrassGlyphRelief(ctx, idx, Math.min(w, h), !!cfg.blind);
    S.drawSplitPin(ctx, -hw + 9, -hh + 9, 3.1, { metal: "brass" });
    S.drawSplitPin(ctx, hw - 9, hh - 9, 3.1, { metal: "brass" });

    ctx.restore();
  }

  // ==========================================================================
  // #46 · STEPS — Queneau Rostrum Cutout (Zazie dans le métro + S01 Gilliam)
  // ==========================================================================
  function render46(ctx, W, H, rawT, state) {
    var S = stage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(46);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg; // atlas-50.webp (442x786 School of Fish)

    var pxFar = S.parallaxX(0.22, t, state);
    var pxMid = S.parallaxX(0.52, t, state);
    var pxFg = S.parallaxX(0.88, t, state);
    var pyMid = S.parallaxY(0.45, t, state);

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // 1. Authentic Buttercream Queneau Rostrum Stock + Torn Green Track Strip
    S.drawBolasBackdrop(ctx, W, H, "queneau-rostrum", 46, t, state, {
      paperTop: beat.index === 3 ? "#2b2940" : "#fae090",
      paperBot: beat.index === 3 ? "#191829" : "#ecd078",
      floorColor: beat.index === 3 ? "#1d3038" : "#273b19"
    });

    if (beat.lampOn) {
      S.drawLampBeam(ctx, W, H, t, state, { x: 620, y: 610, aimX: 640, spread: 360, alpha: 0.22 });
    }

    // 2. Foraged Scissor-Cut Multiplane Plates (p46.jpg + atlas-50.webp)
    // Upper water-ripple sky ribbon scissored from p46.jpg
    S.drawScissorCutout(
      ctx, pImg, 195, 108, 245, 86,
      190 + pxFar, 34, 430, 108,
      [[0.03, 0.14], [0.35, 0.04], [0.72, 0.06], [0.97, 0.18], [0.94, 0.88], [0.58, 0.94], [0.18, 0.90], [0.02, 0.72]],
      { haloWidth: 4.5, filter: beat.index === 3 ? "cyan" : "sepia", alpha: 0.92 }
    );

    // Classroom Fish Instructor & Pupil Cutouts from atlas-50.webp (382x680)
    if (beat.index !== 1) {
      drawFracCutout(
        ctx, S, aImg, 0.40, 0.18, 0.34, 0.46,
        118 + pxMid * 0.7, 206 + pyMid, 152, 290,
        [[0.16, 0.04], [0.78, 0.03], [0.94, 0.32], [0.88, 0.95], [0.14, 0.96], [0.05, 0.48]],
        { haloWidth: 4.5, filter: "sepia", rot: Math.sin(t * 1.7) * 0.03 }
      );
    }
    drawFracCutout(
      ctx, S, aImg, 0.02, 0.48, 0.44, 0.28,
      930 + pxMid * 0.8, 355 + pyMid, 196, 184,
      [[0.06, 0.12], [0.68, 0.04], [0.96, 0.36], [0.92, 0.92], [0.12, 0.95], [0.03, 0.56]],
      { haloWidth: 4.5, filter: beat.index === 3 ? "cyan" : "none", rot: -Math.sin(t * 2.0) * 0.03 }
    );

    // Mossy emerald creek canyon bank scissored from right side of p46.jpg
    S.drawScissorCutout(
      ctx, pImg, 368, 202, 152, 286,
      968 + pxFg * 0.55, 190 + pyMid * 0.6, 236, 365,
      [[0.22, 0.04], [0.92, 0.03], [0.97, 0.48], [0.94, 0.96], [0.06, 0.96], [0.08, 0.56]],
      { haloWidth: 5.0, filter: beat.index === 3 ? "cyan" : "none" }
    );

    // Left submerged rock ledge scissored from p46.jpg
    S.drawScissorCutout(
      ctx, pImg, 118, 252, 102, 188,
      46 + pxFg * 0.5, 318 + pyMid * 0.6, 168, 236,
      [[0.06, 0.06], [0.76, 0.12], [0.95, 0.62], [0.88, 0.96], [0.05, 0.95]],
      { haloWidth: 4.5 }
    );

    // 3. Variation-Specific Choreography of the 6 Monumental Brass Stair-Blocks (S47 + S32 + S41)
    var i, bx, by, brot;
    if (beat.index === 0) {
      // VARIATION I (A · Real Creek): Giant brass letters spelling GOBBLE as sunken creek stairs!
      // Torn kraft stepped plinth backing
      for (i = 0; i < 6; i++) {
        var dropT = S.spring(beat.localT, 0.08 + i * 0.16, 13.5, 4.8);
        var sx = 338 + i * 88 + pxMid;
        var sy = 486 - i * 56 + pyMid - (1 - dropT) * 210;
        // Stepped masonry plinth block underneath
        S.drawCardboardPuppetPiece(
          ctx,
          [[sx - 46, sy + 32], [sx + 52, sy + 32], [sx + 52, 552], [sx - 46, 552]],
          { tone: "#9d8350", ribs: 2, shadow: true }
        );
        drawIsometricBrassBlock(ctx, S, sx, sy, 76, 74, 24, (1 - dropT) * 0.22, i, {
          blind: beat.blind,
          glow: beat.roll > 0 && (i + 1 === beat.roll)
        });
      }
      // Two spotted creek trout swimming diagonally up the brass steps (matching p46.jpg!)
      S.drawBrookTrout(ctx, 430 + Math.sin(t * 1.6) * 28 + pxFg, 286 + Math.cos(t * 2.1) * 10, 0.86, t, true, { tilt: -0.32 });
      S.drawBrookTrout(ctx, 735 + Math.cos(t * 1.4) * 24 + pxFg, 432 + Math.sin(t * 1.9) * 9, 0.82, t + 1.2, true, { tilt: -0.25 });
    } else if (beat.index === 1) {
      // VARIATION II (B · Probable · Turkey): An emergency escape step-ladder!
      // Torn-deckle green escape hatch door at top of rostrum (homage to SERVICE door in exercices-de-style.webp!)
      var hatchX = 566 + pxMid * 0.5;
      S.drawTornPaperFlat(ctx, hatchX - 78, 36, 156, 118, {
        fill: "#263a19",
        paperColor: "#f6f1e4",
        deckle: 7.5
      });
      // Pure geometric escape upward arrow plaque on door (0 text!)
      S.drawCutoutPaperEdge(
        ctx,
        [[hatchX - 38, 66], [hatchX + 38, 66], [hatchX + 38, 112], [hatchX - 38, 112]],
        "#fbfaf5", "#14110d", { paperRim: 2, shadow: false }
      );
      ctx.fillStyle = "#d42a1e";
      ctx.beginPath();
      ctx.moveTo(hatchX, 72);
      ctx.lineTo(hatchX + 18, 90);
      ctx.lineTo(hatchX + 7, 90);
      ctx.lineTo(hatchX + 7, 106);
      ctx.lineTo(hatchX - 7, 106);
      ctx.lineTo(hatchX - 7, 90);
      ctx.lineTo(hatchX - 18, 90);
      ctx.closePath();
      ctx.fill();

      // Twin grey-cardboard iron ladder side rails with split-pin hinges (S32 FK unfold)
      var fold = S.clamp(S.spring(beat.localT, 0.05, 11.0, 4.6), 0, 1);
      var railTopX = hatchX;
      var railBotX = 515 + pxMid;
      drawLimbSegment(ctx, S, railBotX - 58, 548, railTopX - 52, 146, 8, 7, "#56585b", "brass", "silver");
      drawLimbSegment(ctx, S, railBotX + 58, 548, railTopX + 52, 146, 8, 7, "#56585b", "brass", "silver");

      for (i = 0; i < 6; i++) {
        var ru = (i + 0.5) / 6;
        bx = S.lerp(railBotX, railTopX, ru) + (1 - fold) * (i - 2.5) * 35;
        by = S.lerp(516, 178, ru);
        brot = (1 - fold) * 0.45;
        drawIsometricBrassBlock(ctx, S, bx, by, 92, 42, 16, brot, i, { blind: beat.blind });
        S.drawSplitPin(ctx, bx - 52, by, 4.2, { metal: "silver" });
        S.drawSplitPin(ctx, bx + 52, by, 4.2, { metal: "silver" });
      }

      // Articulated IK Cardboard Turkey climbing bottom rungs!
      var climbBob = Math.sin(t * 5.0) * 14;
      var hipX = railBotX - 118;
      var hipY = 445 + climbBob * 0.4;
      var footTargetX = railBotX - 42;
      var footTargetY = 468 - Math.abs(climbBob);
      var legIK = S.solveIK2(hipX, hipY, 54, 52, footTargetX, footTargetY, 1);
      drawLimbSegment(ctx, S, hipX, hipY, legIK.jx, legIK.jy, 9, 7, "#9c7442", "brass", "silver");
      drawLimbSegment(ctx, S, legIK.jx, legIK.jy, legIK.ex, legIK.ey, 7, 5, "#c99642", null, "brass");
      S.drawTurkeyInCorner(ctx, hipX - 12, hipY - 26, 1.05, t, { dispatch: 0.85 });
    } else if (beat.index === 2) {
      // VARIATION III (C · Plausible · Trout): A falling store-front metal sign!
      var corniceX = 270 + pxMid * 0.5;
      S.drawTornPaperFlat(ctx, corniceX, 34, 650, 74, {
        fill: "#8f3224",
        paperColor: "#f6efe2",
        deckle: 8.0
      });
      // Scalloped striped paper shop awning
      for (var aw = 0; aw < 10; aw++) {
        S.drawCutoutPaperEdge(
          ctx,
          [
            [corniceX + aw * 65, 102],
            [corniceX + (aw + 1) * 65, 102],
            [corniceX + (aw + 0.85) * 65, 138],
            [corniceX + (aw + 0.15) * 65, 138]
          ],
          aw % 2 === 0 ? "#d42a1e" : "#fbfaf5",
          "#14110d",
          { paperRim: 1.5, shadow: false }
        );
      }

      // Right chain holds at (820, 118); left chain SNAPS at localT = 0.55s!
      var snapU = S.clamp(S.spring(beat.localT, 0.45, 9.5, 3.2), 0, 1.25);
      var pivotX = 835 + pxMid * 0.5;
      var pivotY = 148;
      var swingAng = -0.62 * snapU + Math.sin(t * 4.4) * 0.06 * snapU;

      // Right intact iron chain + snapped left chain stub
      drawLimbSegment(ctx, S, pivotX, 110, pivotX, pivotY + 26, 5, 5, "#424548", "silver", "brass");
      drawLimbSegment(ctx, S, corniceX + 95, 110, corniceX + 82 - snapU * 22, 165 + snapU * 18, 5, 4, "#424548", "silver", null);

      ctx.save();
      ctx.translate(pivotX, pivotY + 28);
      ctx.rotate(swingAng);
      // Heavy iron sign backing beam
      S.drawCardboardPuppetPiece(
        ctx,
        [[-520, -44], [36, -44], [36, 44], [-520, 44]],
        { tone: "#3d4043", ribs: 4, pins: [[0, 0], [-490, 0]] }
      );
      for (i = 0; i < 6; i++) {
        drawIsometricBrassBlock(ctx, S, -460 + i * 88, 0, 74, 70, 18, 0, i, { blind: beat.blind });
      }
      ctx.restore();

      // Brook the Trout dodging & inspecting the swinging storefront sign!
      S.drawBrookTrout(ctx, 790 + Math.sin(t * 2.4) * 26, 452 + Math.cos(t * 3.1) * 12, 1.18, t, true, { tilt: 0.08 });
    } else {
      // VARIATION IV (D · Preposterous · Alien): Floating anti-gravity space stairs!
      S.drawAlienSaucer(ctx, 645 + pxMid * 0.4, 114, 1.22, t, 640, 460, { beamSpread: 210 });

      // Spiral zero-gravity Escher staircase ascending into the saucer beam!
      for (i = 0; i < 6; i++) {
        var orbitPhase = t * 1.15 + i * 0.72;
        bx = 410 + i * 88 + Math.sin(orbitPhase) * 28;
        by = 485 - i * 54 + Math.cos(orbitPhase * 1.3) * 18;
        brot = Math.sin(orbitPhase * 0.9) * 0.18;

        // Cyan-crimson anti-gravity levitation ring under each floating brass step
        ctx.save();
        ctx.strokeStyle = i % 2 === 0 ? "rgba(15, 143, 128, 0.75)" : "rgba(212, 42, 30, 0.72)";
        ctx.lineWidth = 2.4;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.ellipse(bx, by + 48, 46, 11, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();

        drawIsometricBrassBlock(ctx, S, bx, by, 76, 66, 22, brot, i, {
          blind: beat.blind,
          glow: true
        });
      }
      S.drawBrookTrout(ctx, 290 + Math.sin(t * 1.7) * 20, 290 + Math.cos(t * 2.2) * 18, 0.92, t, false, { tilt: -0.38 });
    }

    drawBallastStream(ctx, S, W, H, t, beat);
    drawCourierOverlay(ctx, S, W, H, t, beat, state, { floorY: 562 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 46);
  }

  // ==========================================================================
  // #47 · ARMADA — Carved Paper Proscenium (ALAMO + S18 Cartoon Saloon)
  // ==========================================================================
  function drawCanningJar(ctx, S, x, y, w, h, rot, mode, t, seed) {
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);

    var hw = w * 0.5;
    var hh = h * 0.5;

    // White scissor-cutout paper halo around upside-down canning jar
    var jarPoly = [
      [-hw * 0.78, -hh],
      [hw * 0.78, -hh],
      [hw, -hh * 0.72],
      [hw * 0.96, hh * 0.76],
      [hw * 0.82, hh],
      [-hw * 0.82, hh],
      [-hw * 0.96, hh * 0.76],
      [-hw, -hh * 0.72]
    ];
    var tintFill = mode === "pickle"
      ? "#5f8c49"
      : (mode === "mars" ? "#c96a4b" : "#8ab8b4");

    S.drawCutoutPaperEdge(ctx, jarPoly, tintFill, "#14110d", { paperRim: 3.8 });

    // Trapped dome air-pocket / glowing Mars dome / pickle brine inside jar
    ctx.fillStyle = mode === "mars"
      ? "rgba(255, 224, 166, 0.86)"
      : (mode === "pickle" ? "rgba(186, 224, 118, 0.72)" : "rgba(244, 252, 250, 0.82)");
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, -hh * 0.36 + Math.sin(t * 2.8 + seed) * 3, hw * 0.68, hh * 0.24, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (mode === "pickle") {
      // Bumpy green pickled cucumber floating inside brine!
      ctx.save();
      ctx.rotate(0.28 + Math.sin(t * 2.4 + seed) * 0.14);
      S.drawCutoutPaperEdge(
        ctx,
        [[-10, -22], [8, -20], [12, 16], [-6, 22], [-13, 0]],
        "#2f5c24", "#14110d", { paperRim: 1.5, shadow: false }
      );
      ctx.restore();
    } else if (mode === "mars") {
      // Geodesic Mars habitat lattice ribs + warm window lights
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-hw * 0.7, 0); ctx.lineTo(hw * 0.7, 0);
      ctx.moveTo(0, -hh * 0.8); ctx.lineTo(0, hh * 0.6);
      ctx.stroke();
      ctx.fillStyle = "#ffdf78";
      ctx.fillRect(-10, 6, 7, 9);
      ctx.fillRect(4, 6, 7, 9);
    }

    // Upside-down threaded zinc mason-jar lid at bottom + split-pin knot
    S.drawCardboardPuppetPiece(
      ctx,
      [[-hw * 0.84, hh * 0.72], [hw * 0.84, hh * 0.72], [hw * 0.80, hh], [-hw * 0.80, hh]],
      { tone: "#8d9296", ribs: 2, shadow: false }
    );
    S.drawSplitPin(ctx, 0, hh * 0.22, 3.6, { metal: "brass" });

    ctx.restore();
  }

  function render47(ctx, W, H, rawT, state) {
    var S = stage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(47);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg; // atlas-12.webp (1036x786 Méliès cutaway)

    var pxFar = S.parallaxX(0.24, t, state);
    var pxMid = S.parallaxX(0.55, t, state);
    var pxFg = S.parallaxX(0.90, t, state);

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // 1. Wide Carved Sandstone/Timber Perec Proscenium Stage (les-lieux-dune-fugue.webp!)
    S.drawBolasBackdrop(ctx, W, H, "perec-stage", 47, t, state, {
      openX: 150,
      openY: 74,
      openW: 980,
      openH: 546,
      doors: true
    });

    // Clip interior multiplane action cleanly inside the wide proscenium aperture
    ctx.save();
    ctx.beginPath();
    ctx.rect(150, 74, 980, 546);
    ctx.clip();

    // Cartoon Saloon jewel-sea gradient & diagonal cathedral sunbeams (S18)
    var seaG = ctx.createLinearGradient(0, 74, 0, 620);
    if (beat.index === 3) {
      seaG.addColorStop(0.0, "#2c1929");
      seaG.addColorStop(0.55, "#6b2d28");
      seaG.addColorStop(1.0, "#2b1618");
    } else if (beat.index === 1) {
      seaG.addColorStop(0.0, "#1f3329");
      seaG.addColorStop(0.6, "#2c4d38");
      seaG.addColorStop(1.0, "#15261c");
    } else {
      seaG.addColorStop(0.0, "#245963");
      seaG.addColorStop(0.55, "#19434d");
      seaG.addColorStop(1.0, "#0e2830");
    }
    ctx.fillStyle = seaG;
    ctx.fillRect(150, 74, 980, 546);

    if (beat.lampOn) {
      for (var sb = 0; sb < 3; sb++) {
        S.drawLampBeam(ctx, W, H, t + sb, state, {
          x: 340 + sb * 280,
          y: 620,
          aimX: 300 + sb * 290,
          spread: 145,
          alpha: 0.14
        });
      }
    }
    S.drawWaterCaustics(ctx, W, H, t, 0.18);

    // 2. Foraged Scissor-Cut Multiplane Plates (atlas-12.webp + p47.jpg)
    // Mossy riverbed boulders cropped from bottom of p47.jpg
    S.drawScissorCutout(
      ctx, pImg, 182, 418, 276, 108,
      250 + pxFar, 488, 760, 128,
      [[0.04, 0.25], [0.34, 0.06], [0.68, 0.08], [0.96, 0.24], [0.98, 0.94], [0.02, 0.95]],
      { haloWidth: 4.0, filter: beat.index === 3 ? "sepia" : "none" }
    );

    // Central rocking Armada rig
    var raftPitch = Math.sin(t * 1.85) * 0.045 + (beat.ballastOn ? 0.03 : 0);
    var raftBob = Math.cos(t * 2.2) * 9 + (beat.index === 3 ? -28 : 0);

    if (beat.index === 1) {
      // VARIATION II (B · Probable · Turkey): Spooky pickle-jar factory!
      // Méliès brass boiler & piping compartment scissored from left of atlas-12.webp!
      drawFracCutout(
        ctx, S, aImg, 0.02, 0.26, 0.26, 0.48,
        182 + pxMid * 0.5, 162, 236, 316,
        [[0.05, 0.06], [0.88, 0.04], [0.96, 0.48], [0.94, 0.96], [0.04, 0.95]],
        { haloWidth: 4.5, filter: "sepia" }
      );
      // Articulated IK iron factory claw dipping pickle jars from overhead rail
      var clawTargetX = 650 + Math.sin(t * 2.6) * 95;
      var clawTargetY = 235 + Math.cos(t * 5.2) * 28;
      var armIK = S.solveIK2(640, 88, 105, 96, clawTargetX, clawTargetY, 1);
      drawLimbSegment(ctx, S, 640, 88, armIK.jx, armIK.jy, 10, 8, "#4c524e", "brass", "silver");
      drawLimbSegment(ctx, S, armIK.jx, armIK.jy, armIK.ex, armIK.ey, 8, 6, "#666e68", null, "brass");
    }

    if (beat.index === 2) {
      // VARIATION III (C · Plausible · Trout): Floating creek trading boat!
      // Méliès lively cabin crew cutout from atlas-12.webp riding atop the jar-raft deck!
      drawFracCutout(
        ctx, S, aImg, 0.31, 0.29, 0.54, 0.42,
        455 + pxMid * 0.7, 118 + raftBob, 355, 192,
        [[0.06, 0.08], [0.92, 0.05], [0.97, 0.92], [0.04, 0.94]],
        { haloWidth: 4.5, rot: raftPitch }
      );
      // Patchwork bamboo mast & triangular trade sail + pennant flags
      var sailOpen = S.clamp(S.spring(beat.localT, 0.05, 10.0, 4.2), 0, 1);
      drawLimbSegment(ctx, S, 640, 310 + raftBob, 640, 96 + raftBob, 7, 5, "#a67c46", "brass", "brass");
      S.drawCutoutPaperEdge(
        ctx,
        [
          [646, 104 + raftBob],
          [646 + 175 * sailOpen, 175 + raftBob],
          [646, 245 + raftBob]
        ],
        "#f3d27a", "#14110d", { paperRim: 3.5 }
      );
    }

    if (beat.index === 3) {
      // VARIATION IV (D · Preposterous · Alien): Hundred-dome Mars colony fleet!
      S.drawAlienSaucer(ctx, 640, 134, 1.16, t, 640, 370, { beamSpread: 240 });
    }

    // 3. Multi-Piece Scissored Jar-Armada Plates (from p47.jpg) + Handmade Lashed Glass Jars
    ctx.save();
    ctx.translate(640 + pxMid, 315 + raftBob);
    ctx.rotate(raftPitch);

    // Two overlapping scissored canning-jar cluster plates from p47.jpg for authentic painted glass depth
    S.drawScissorCutout(
      ctx, pImg, 152, 148, 200, 195,
      -285, -108, 265, 195,
      [[0.08, 0.14], [0.55, 0.04], [0.94, 0.16], [0.96, 0.86], [0.46, 0.96], [0.04, 0.78]],
      { haloWidth: 4.2, filter: beat.index === 3 ? "sepia" : "none" }
    );
    S.drawScissorCutout(
      ctx, pImg, 290, 148, 196, 195,
      18, -106, 268, 195,
      [[0.06, 0.12], [0.52, 0.04], [0.94, 0.18], [0.96, 0.84], [0.48, 0.96], [0.05, 0.82]],
      { haloWidth: 4.2, filter: beat.index === 3 ? "sepia" : "none" }
    );

    // Foreground row of 7 articulated lashed jars with distinct per-beat contents!
    var jarMode = beat.index === 1 ? "pickle" : (beat.index === 3 ? "mars" : "creek");
    var jarOffsets = [
      [-255, 12, 64, 96, -0.14],
      [-172, -6, 70, 108, -0.07],
      [-86, 8, 74, 114, -0.02],
      [2, -12, 80, 122, 0.01],
      [90, 6, 74, 112, 0.05],
      [176, -4, 68, 104, 0.09],
      [256, 14, 62, 94, 0.15]
    ];
    for (var ji = 0; ji < jarOffsets.length; ji++) {
      var jo = jarOffsets[ji];
      var jBob = Math.sin(t * 3.1 + ji * 0.9) * (beat.index === 3 ? 10 : 4.5);
      drawCanningJar(ctx, S, jo[0], jo[1] + jBob, jo[2], jo[3], jo[4], jarMode, t, ji * 1.7);
    }

    // Criss-crossed knotted hemp lashing ropes (or Mars sky-tubes in D!)
    ctx.strokeStyle = beat.index === 3 ? "#7ce8dc" : "#c89d5c";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-285, 22);
    ctx.bezierCurveTo(-120, 48, 120, 48, 285, 22);
    ctx.moveTo(-270, -4);
    ctx.bezierCurveTo(-90, 26, 90, 26, 270, -4);
    ctx.stroke();

    ctx.restore();

    // Swimming creek trout below the jar raft (and Brook Trout trader in Beat C!)
    if (beat.index === 2) {
      S.drawBrookTrout(ctx, 835 + Math.sin(t * 2.2) * 24 + pxFg, 472, 1.18, t, true, { tilt: -0.08 });
    } else {
      S.drawBrookTrout(ctx, 455 + Math.sin(t * 1.7) * 30 + pxFg, 480, 0.88, t, false, { tilt: -0.12 });
    }

    drawBallastStream(ctx, S, W, H, t, beat);
    ctx.restore(); // end proscenium aperture clip

    drawCourierOverlay(ctx, S, W, H, t, beat, state, { floorY: 560, climbX: 1148 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 47);
  }

  // ==========================================================================
  // #48 · BELFRY — Cardboard & Silver-Gelatin Parallax (Ellis Island + S50 LOC)
  // ==========================================================================
  function drawRoosterWeathervane(ctx, S, x, y, scale, spinAng, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Vertical iron spire rod + cardinal crossbar (pure arrow geometry, 0 text!)
    ctx.strokeStyle = "#121212";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(0, 42); ctx.lineTo(0, -46);
    ctx.moveTo(-38, 10); ctx.lineTo(38, 10);
    ctx.stroke();

    var hScale = Math.cos(spinAng);
    ctx.save();
    ctx.translate(0, -18);
    ctx.scale(Math.abs(hScale) < 0.18 ? (hScale < 0 ? -0.18 : 0.18) : hScale, 1);

    // Cut-cardboard rooster silhouette + crimson comb + brass split-pin hub
    S.drawCardboardPuppetPiece(
      ctx,
      [[-34, 6], [-22, -18], [-4, -12], [12, -26], [26, -16], [22, 6], [4, 14], [-18, 12]],
      { tone: "#9d9b95", ribs: 2, shadow: true }
    );
    S.drawCutoutPaperEdge(ctx, [[10, -26], [18, -36], [26, -26]], "#d42a1e", "#14110d", { paperRim: 1.5, shadow: false });
    ctx.restore();

    S.drawSplitPin(ctx, 0, -14, 4.4, { metal: "brass" });
    ctx.restore();
  }

  function render48(ctx, W, H, rawT, state) {
    var S = stage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(48);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg; // atlas-22.webp (1398x786 Pyramid Song submerged uprights)

    var px1 = S.parallaxX(0.18, t, state);
    var px2 = S.parallaxX(0.42, t, state);
    var px3 = S.parallaxX(0.75, t, state);
    var waterY = (beat.index === 1 ? 336 : 284) + (beat.ballastOn ? -24 : 0) + Math.sin(t * 1.5) * 4;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // 1. Authentic la-mort-en-ce-jardin Silver-Gelatin Monochrome Stage
    S.drawBolasBackdrop(ctx, W, H, "cardboard-parallax", 48, t, state, { pillarbox: true });

    // Upper pale archival sky band above the waterline
    var skyG = ctx.createLinearGradient(90, 0, 90, waterY);
    skyG.addColorStop(0.0, beat.index === 3 ? "#1f2433" : "#d8d6ce");
    skyG.addColorStop(1.0, beat.index === 3 ? "#2e364a" : "#b5b2a8");
    ctx.fillStyle = skyG;
    ctx.fillRect(86, 0, W - 172, waterY);

    // 2. Five Monochrome Parallax Planes (atlas-22.webp + p48.jpg shoreline banks)
    // Plane 1 & 2: Submerged TVA valley uprights from atlas-22.webp (740x416) below water
    drawFracCutout(
      ctx, S, aImg, 0.03, 0.16, 0.45, 0.68,
      108 + px1, waterY + 8, 510, 310,
      [[0.02, 0.04], [0.96, 0.06], [0.98, 0.96], [0.03, 0.95]],
      { haloWidth: 3.5, filter: "mono", alpha: 0.78 }
    );
    drawFracCutout(
      ctx, S, aImg, 0.48, 0.16, 0.48, 0.68,
      650 + px1 * 1.2, waterY + 6, 520, 314,
      [[0.03, 0.05], [0.97, 0.04], [0.96, 0.96], [0.04, 0.95]],
      { haloWidth: 3.5, filter: "mono", alpha: 0.78 }
    );

    // Plane 3: Left & right shoreline autumn tree banks scissored from p48.jpg along waterline
    S.drawScissorCutout(
      ctx, pImg, 116, 186, 156, 118,
      102 + px2, waterY - 106, 330, 122,
      [[0.03, 0.24], [0.35, 0.05], [0.78, 0.16], [0.98, 0.68], [0.96, 0.96], [0.02, 0.96]],
      { haloWidth: 4.2, filter: beat.index === 1 ? "sepia" : "mono" }
    );
    S.drawScissorCutout(
      ctx, pImg, 372, 186, 152, 118,
      845 + px2, waterY - 108, 332, 124,
      [[0.04, 0.65], [0.28, 0.14], [0.72, 0.04], [0.97, 0.22], [0.98, 0.96], [0.02, 0.96]],
      { haloWidth: 4.2, filter: beat.index === 1 ? "sepia" : "mono" }
    );

    if (beat.lampOn) {
      S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 615, aimX: 640, spread: 290, alpha: 0.16 });
    }

    // 3. Central Flooded Tin Church Steeple + 4-Variation Transformations
    var steepleX = 640 + px2 * 0.85;
    var rocketLift = beat.index === 3 ? S.easeInOutCubic(S.clamp((beat.localT - 0.5) / 3.0, 0, 1)) * 42 : 0;
    var baseTopY = 148 - rocketLift;

    if (beat.index === 3) {
      // VARIATION IV (D · Preposterous · Alien): Sunken silver rocket nose-cone!
      S.drawAlienSaucer(ctx, 640, 86, 1.08, t, steepleX, baseTopY + 120, { beamSpread: 185 });

      // Unfolding IK silver booster fins left & right of steeple
      var finOpen = S.clamp(S.spring(beat.localT, 0.15, 9.5, 4.0), 0, 1);
      S.drawCardboardPuppetPiece(
        ctx,
        [
          [steepleX - 118, baseTopY + 250],
          [steepleX - 118 - 88 * finOpen, baseTopY + 380],
          [steepleX - 102, baseTopY + 372]
        ],
        { tone: "#b8bec4", ribs: 2, pin: { x: steepleX - 112, y: baseTopY + 260, metal: "silver" } }
      );
      S.drawCardboardPuppetPiece(
        ctx,
        [
          [steepleX + 118, baseTopY + 250],
          [steepleX + 118 + 88 * finOpen, baseTopY + 380],
          [steepleX + 102, baseTopY + 372]
        ],
        { tone: "#b8bec4", ribs: 2, pin: { x: steepleX + 112, y: baseTopY + 260, metal: "silver" } }
      );

      // Bubbling turquoise-amber underwater rocket thruster plume under arch!
      for (var rp = 0; rp < 9; rp++) {
        var py = baseTopY + 390 + ((t * 140 + rp * 24) % 145);
        var px = steepleX + Math.sin(t * 9 + rp * 1.9) * (16 + (py - baseTopY - 380) * 0.22);
        drawCutoutBubble(ctx, S, px, py, 8 + (rp % 3) * 5, rp % 2 === 0 ? "rgba(255,196,92,0.85)" : "rgba(110,235,220,0.82)");
      }
    }

    // Scissored white-halo flooded clapboard belfry & tin roof from p48.jpg (avoiding upper text letters on vane!)
    S.drawScissorCutout(
      ctx, pImg, 214, 168, 212, 336,
      steepleX - 148, baseTopY, 296, 392,
      [[0.46, 0.01], [0.54, 0.01], [0.88, 0.42], [0.96, 0.50], [0.88, 0.54], [0.88, 0.98], [0.12, 0.98], [0.12, 0.54], [0.04, 0.50], [0.12, 0.42]],
      { haloWidth: 4.8, filter: beat.index === 3 ? "mono" : "sepia" }
    );

    if (beat.index === 3) {
      // Riveted silver nose-cone plating & porthole window over steeple roof
      S.drawCardboardPuppetPiece(
        ctx,
        [[steepleX, baseTopY - 12], [steepleX + 112, baseTopY + 168], [steepleX - 112, baseTopY + 168]],
        { tone: "#c7cdd2", ribs: 3, pins: [[steepleX, baseTopY + 24], [steepleX - 68, baseTopY + 148], [steepleX + 68, baseTopY + 148]] }
      );
    }

    // Swinging bronze split-pin belfry bell inside underwater arch + acoustic rings!
    var bellSwing = Math.sin(t * (beat.index === 2 ? 6.2 : 3.2)) * (beat.index === 2 ? 0.36 : 0.20);
    var bellPivotY = baseTopY + 238;
    ctx.save();
    ctx.translate(steepleX, bellPivotY);
    ctx.rotate(bellSwing);
    S.drawCardboardPuppetPiece(
      ctx,
      [[-18, 4], [18, 4], [34, 58], [-34, 58]],
      { tone: "#6f6a58", ribs: 2, pin: { x: 0, y: 6, r: 4.4, metal: "brass" } }
    );
    ctx.fillStyle = "#d8a242";
    ctx.beginPath();
    ctx.arc(0, 62, 7.5, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Concentric underwater acoustic bell rings below waterline
    for (var ar = 0; ar < 3; ar++) {
      var ru = ((t * 0.55 + ar / 3) % 1);
      ctx.strokeStyle = "rgba(235, 240, 236, " + ((1 - ru) * 0.42).toFixed(3) + ")";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(steepleX, bellPivotY + 42, 28 + ru * 155, 0, TAU);
      ctx.stroke();
    }

    // Weathervane atop spire (huge & spinning fast in Beat C!)
    var vaneScale = beat.index === 2 ? 1.55 : 0.95;
    var vaneSpin = beat.index === 2 ? t * 7.5 : t * 1.4;
    drawRoosterWeathervane(ctx, S, steepleX, baseTopY - 18, vaneScale, vaneSpin, t);

    if (beat.index === 1) {
      // VARIATION II (B · Probable · Turkey): A dry roof to roost on!
      // Twig nest + jointed cardboard Turkey perched dry & cozy on the tin gable above water!
      S.drawCutoutPaperEdge(
        ctx,
        [[steepleX - 118, baseTopY + 138], [steepleX - 24, baseTopY + 128], [steepleX - 18, baseTopY + 154], [steepleX - 124, baseTopY + 154]],
        "#7d5c34", "#14110d", { paperRim: 2.5 }
      );
      S.drawTurkeyInCorner(ctx, steepleX - 72, baseTopY + 98, 0.98, t, { dispatch: 0.75, flip: false });
    }

    if (beat.index === 2) {
      // Brook Trout leaping & ringing the belfry bell in Beat C!
      S.drawBrookTrout(ctx, steepleX + 148 + Math.sin(t * 2.4) * 26 + px3, bellPivotY + 56, 1.12, t, true, { tilt: -0.15 });
    } else {
      S.drawBrookTrout(ctx, steepleX + 165 + Math.cos(t * 1.6) * 22 + px3, 448, 0.92, t, true, { tilt: 0.04 });
    }

    // Shimmering bisected air/waterline ribbon across the entire frame!
    ctx.save();
    ctx.fillStyle = "rgba(210, 226, 222, 0.16)";
    ctx.fillRect(86, waterY, W - 172, 638 - waterY);
    ctx.strokeStyle = "#fbfaf5";
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    for (var wx = 86; wx <= W - 86; wx += 24) {
      var wy = waterY + Math.sin(wx * 0.022 + t * 2.8) * 5.5;
      if (wx === 86) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.stroke();
    ctx.restore();

    drawBallastStream(ctx, S, W, H, t, beat, "rgba(230,235,232,0.75)");
    drawCourierOverlay(ctx, S, W, H, t, beat, state, { floorY: 556, climbX: 1126 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 48);
  }

  // ==========================================================================
  // #49 · CORNER — Cardboard Civic Parallax (Renzo e Luciana + S53 CivicFootage)
  // ==========================================================================
  function drawYellowCreekCab(ctx, S, x, y, scale, t) {
    var bounce = Math.sin(t * 14.0) * 2.8;
    ctx.save();
    ctx.translate(x, y + bounce);
    ctx.scale(scale, scale);

    // Scissor-cut yellow cab body with black-and-white checker band (0 text!)
    var cabPoly = [
      [-132, 18], [-126, -16], [-72, -22], [-44, -58],
      [52, -58], [84, -20], [134, -12], [136, 22], [-132, 22]
    ];
    S.drawCutoutPaperEdge(ctx, cabPoly, "#f2bf38", "#14110d", { paperRim: 4.2 });

    // Windows
    S.drawCutoutPaperEdge(ctx, [[-38, -50], [2, -50], [2, -20], [-58, -20]], "#cfe6e2", "#14110d", { paperRim: 1.5, shadow: false });
    S.drawCutoutPaperEdge(ctx, [[10, -50], [46, -50], [70, -20], [10, -20]], "#cfe6e2", "#14110d", { paperRim: 1.5, shadow: false });

    // Glowing roof taxi dome light
    S.drawCutoutPaperEdge(ctx, [[-16, -72], [18, -72], [22, -58], [-20, -58]], "#fff3b0", "#14110d", { paperRim: 2.0, shadow: false });

    // Checkerboard stripe along door (pure rectangles!)
    for (var ck = 0; ck < 10; ck++) {
      ctx.fillStyle = ck % 2 === 0 ? "#14110d" : "#fbfaf5";
      ctx.fillRect(-95 + ck * 19, -8, 19, 9);
      ctx.fillStyle = ck % 2 === 1 ? "#14110d" : "#fbfaf5";
      ctx.fillRect(-95 + ck * 19, 1, 19, 9);
    }

    // Headlight cone
    ctx.fillStyle = "rgba(255, 240, 165, 0.36)";
    ctx.beginPath();
    ctx.moveTo(134, -4);
    ctx.lineTo(295, -52);
    ctx.lineTo(295, 44);
    ctx.closePath();
    ctx.fill();

    // Jointed grey-cardboard wheels with silver split-pin hubs!
    var wheels = [-80, 82];
    for (var wi = 0; wi < 2; wi++) {
      ctx.save();
      ctx.translate(wheels[wi], 24);
      ctx.rotate(t * 9.5);
      S.drawCardboardPuppetPiece(
        ctx,
        [[-24, -10], [-10, -24], [10, -24], [24, -10], [24, 10], [10, 24], [-10, 24], [-24, 10]],
        { tone: "#3a3c3e", ribs: 1, shadow: false }
      );
      S.drawSplitPin(ctx, 0, 0, 5.2, { metal: "silver" });
      ctx.restore();
    }

    ctx.restore();
  }

  function render49(ctx, W, H, rawT, state) {
    var S = stage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(49);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg; // atlas-18.webp (842x631 distant city colored light pools)

    var pxFar = S.parallaxX(0.22, t, state);
    var pxMid = S.parallaxX(0.54, t, state);
    var pxFg = S.parallaxX(0.88, t, state);

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // 1. Monochrome Civic Archive Stage (la-mort-en-ce-jardin.webp!)
    S.drawBolasBackdrop(ctx, W, H, "cardboard-parallax", 49, t, state, { pillarbox: true });

    // Distant glowing city signal dome scissored from atlas-18.webp (740x555) in deep intersection
    drawFracCutout(
      ctx, S, aImg, 0.20, 0.25, 0.68, 0.64,
      365 + pxFar, 186, 540, 336,
      [[0.08, 0.18], [0.50, 0.04], [0.92, 0.18], [0.96, 0.94], [0.04, 0.94]],
      { haloWidth: 3.8, filter: beat.index === 0 ? "mono" : "none", alpha: beat.index === 0 ? 0.65 : 0.88 }
    );

    // Left & right 1940s Old Butler drowned Main Street building facades scissored from p49.jpg!
    S.drawScissorCutout(
      ctx, pImg, 114, 188, 152, 278,
      96 + pxMid * 0.75, 126, 268, 430,
      [[0.04, 0.03], [0.88, 0.12], [0.96, 0.52], [0.94, 0.97], [0.03, 0.97]],
      { haloWidth: 4.5, filter: "mono" }
    );
    S.drawScissorCutout(
      ctx, pImg, 418, 212, 110, 256,
      925 + pxMid * 0.75, 142, 252, 414,
      [[0.14, 0.12], [0.96, 0.04], [0.97, 0.97], [0.05, 0.97]],
      { haloWidth: 4.5, filter: "mono" }
    );

    // Drowned cobblestone street floor flat
    S.drawTornPaperFlat(ctx, 88, 528, W - 176, 108, {
      fill: "#262a2c",
      paperColor: "#e6e2d8",
      deckle: 5.5,
      shadow: false
    });

    // Overhead catenary street cables spanning between buildings
    ctx.strokeStyle = "#111214";
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(110, 88);
    ctx.quadraticCurveTo(640 + pxMid * 0.5, 148, 1170, 84);
    ctx.stroke();

    if (beat.index === 1) {
      // VARIATION II (B · Probable · Turkey): Early twinkling Christmas lights!
      var bulbCols = ["#d42a1e", "#ffd24c", "#17b890", "#ff6b4a", "#78c6ff"];
      for (var strand = 0; strand < 2; strand++) {
        var sy0 = 112 + strand * 78;
        ctx.strokeStyle = "#224029";
        ctx.lineWidth = 6.5;
        ctx.beginPath();
        ctx.moveTo(155, sy0);
        ctx.quadraticCurveTo(640, sy0 + 82, 1125, sy0 - 6);
        ctx.stroke();

        for (var bi = 0; bi < 15; bi++) {
          var bu = (bi + 0.5) / 15;
          var bx = S.lerp(165, 1115, bu);
          var by = sy0 + Math.sin(bu * Math.PI) * 42 + 8;
          var pulse = 0.65 + 0.35 * Math.sin(t * 7.5 + bi * 1.7 + strand * 2.1);
          var bCol = bulbCols[(bi + strand * 2) % bulbCols.length];

          ctx.fillStyle = bCol;
          ctx.globalAlpha = 0.28 * pulse;
          ctx.beginPath();
          ctx.arc(bx, by, 20, 0, TAU);
          ctx.fill();
          ctx.globalAlpha = 1;

          S.drawCutoutPaperEdge(
            ctx,
            [[bx - 6, by - 7], [bx + 6, by - 7], [bx + 8, by + 6], [bx, by + 13], [bx - 8, by + 6]],
            bCol, "#14110d", { paperRim: 2.0, shadow: false }
          );
        }
      }
    }

    // 2. Central Hanging Municipal Stoplight Cutout (p49.jpg crop + active glowing lenses!)
    var lightSway = Math.sin(t * 1.9) * 0.055;
    var stoplightX = 590 + pxMid * 0.6;
    var stoplightY = 128;

    ctx.save();
    ctx.translate(stoplightX, stoplightY);
    ctx.rotate(lightSway);

    S.drawScissorCutout(
      ctx, pImg, 254, 142, 132, 202,
      -82, -6, 164, 242,
      [[0.38, 0.02], [0.62, 0.02], [0.94, 0.22], [0.95, 0.92], [0.52, 0.98], [0.06, 0.92], [0.05, 0.22]],
      { haloWidth: 4.5 }
    );

    // Dynamic volumetric Red / Green / Checkpoint optical signal beams!
    var redActive = (beat.index === 0 && Math.sin(t * 2.2) > 0) || beat.index === 3;
    var greenActive = (beat.index === 0 && Math.sin(t * 2.2) <= 0) || beat.index === 2 || beat.index === 1;

    if (redActive && beat.lampOn) {
      ctx.fillStyle = "rgba(228, 52, 40, 0.30)";
      ctx.beginPath();
      ctx.arc(-12, 86, 22, 0, TAU);
      ctx.moveTo(-12, 86); ctx.lineTo(-195, 195); ctx.lineTo(-195, 25);
      ctx.closePath();
      ctx.fill();
    }
    if (greenActive && beat.lampOn) {
      ctx.fillStyle = "rgba(32, 214, 152, 0.30)";
      ctx.beginPath();
      ctx.arc(-12, 162, 22, 0, TAU);
      ctx.moveTo(-12, 162); ctx.lineTo(-205, 290); ctx.lineTo(-205, 118);
      ctx.closePath();
      ctx.fill();
    }

    if (beat.index === 1) {
      // Glowing gold paper star topper on stoplight for Christmas beat!
      S.drawCutoutPaperEdge(
        ctx,
        [[0, -44], [10, -18], [36, -18], [15, -2], [24, 22], [0, 8], [-24, 22], [-15, -2], [-36, -18], [-10, -18]],
        "#ffe066", "#14110d", { paperRim: 2.5 }
      );
    }
    ctx.restore();

    // 3. Variation Actors: Trout Cop (A/B/D), Speeding Yellow Creek Taxicab (C), Space Checkpoint (D)
    if (beat.index === 2) {
      // VARIATION III (C · Plausible · Trout): Speeding yellow creek taxicab!
      var cabX = S.lerp(235, 865, (beat.u * 1.25) % 1);
      drawYellowCreekCab(ctx, S, cabX, 466, 1.12, t);
      S.drawBrookTrout(ctx, cabX + 18, 434, 0.56, t, false);
    }

    if (beat.index === 3) {
      // VARIATION IV (D · Preposterous · Alien): Intergalactic space checkpoint!
      S.drawAlienSaucer(ctx, 645, 92, 1.14, t, stoplightX, 440, { beamSpread: 215 });

      // Horizontal laser toll-barrier beams + rotating orbital customs gate rings
      var gateOpen = 0.5 + 0.5 * Math.sin(t * 2.6);
      ctx.save();
      ctx.strokeStyle = "#ff4238";
      ctx.lineWidth = 4.5;
      ctx.setLineDash([16, 8]);
      ctx.beginPath();
      ctx.moveTo(185, 392);
      ctx.lineTo(545, 392 - gateOpen * 55);
      ctx.moveTo(645, 392 - gateOpen * 55);
      ctx.lineTo(1085, 392);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "#19d4be";
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.ellipse(370, 345, 58, 92, Math.sin(t * 1.5) * 0.2, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // Uniformed Trout Traffic Cop scissored from p49.jpg + articulated split-pin whistle fin!
    var copX = (beat.index === 2 ? 895 : 830) + pxFg * 0.6;
    var copY = (beat.index === 2 ? 278 : 326) + Math.sin(t * 2.4) * 7;
    S.drawScissorCutout(
      ctx, pImg, 358, 246, 168, 134,
      copX - 110, copY - 68, 232, 174,
      [[0.16, 0.05], [0.58, 0.04], [0.96, 0.34], [0.95, 0.86], [0.46, 0.96], [0.04, 0.68]],
      { haloWidth: 4.5, rot: Math.sin(t * 2.1) * 0.04, pin: { x: copX - 12, y: copY + 24, metal: "brass" } }
    );
    // Whistle bubble stream from Trout Cop
    for (var wb = 0; wb < 4; wb++) {
      var wbu = ((t * 1.1 + wb * 0.25) % 1);
      drawCutoutBubble(ctx, S, copX - 118 - wbu * 26 + Math.sin(t * 6 + wb) * 6, copY + 6 - wbu * 88, 4 + wbu * 5);
    }

    drawBallastStream(ctx, S, W, H, t, beat);
    drawCourierOverlay(ctx, S, W, H, t, beat, state, { floorY: 554, climbX: 1126 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 49);
  }

  // ==========================================================================
  // #50 · RIFFLE — Daumier/Verne Ink-Band Lithograph (Ouhispo + S50 LOC-Archive)
  // ==========================================================================
  function drawLithoSnailDarter(ctx, S, x, y, scale, t, resolute) {
    var wag = Math.sin(t * (resolute ? 9.5 : 6.0)) * 0.22;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Crisp 4.5px white scissor-cutout paper halo on stark ink-black band!
    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.ellipse(2, 0, 68, 26, 0, 0, TAU);
    ctx.fill();

    // Articulated caudal tail fin + split-pin
    ctx.save();
    ctx.translate(44, 0);
    ctx.rotate(wag);
    S.drawCardboardPuppetPiece(
      ctx,
      [[-4, -6], [24, -18], [20, 0], [24, 18], [-4, 6]],
      { tone: "#d8d4ca", ribs: 2, shadow: false }
    );
    ctx.restore();

    // Spiny dorsal fins
    S.drawCutoutPaperEdge(ctx, [[-18, -14], [-4, -28], [10, -14]], "#e8e4da", "#0b0c0e", { paperRim: 1.5, shadow: false });
    S.drawCutoutPaperEdge(ctx, [[12, -13], [24, -25], [34, -12]], "#e8e4da", "#0b0c0e", { paperRim: 1.5, shadow: false });

    // Cross-hatched lithograph body with 4 bold dark Snail Darter saddle bands!
    S.drawCardboardPuppetPiece(
      ctx,
      [[-52, 2], [-34, -16], [16, -16], [46, -6], [46, 6], [16, 15], [-34, 15]],
      { tone: "#f0ece2", ribs: 2, pin: { x: 44, y: 0, r: 3.2, metal: "silver" } }
    );
    var saddles = [-24, -7, 10, 26];
    ctx.fillStyle = "#14110d";
    for (var si = 0; si < saddles.length; si++) {
      ctx.fillRect(saddles[si], -14, 8, 27);
    }

    // Fanned pectoral fin with brass split-pin
    ctx.save();
    ctx.translate(-20, 8);
    ctx.rotate(0.25 + Math.sin(t * 8.5) * 0.2);
    S.drawCardboardPuppetPiece(ctx, [[-4, -4], [15, 6], [10, 16], [-6, 8]], {
      tone: "#dcd8ce",
      ribs: 1,
      shadow: false,
      pin: { x: 0, y: 0, r: 2.8, metal: "brass" }
    });
    ctx.restore();

    // Resolute lithograph eye
    ctx.fillStyle = "#fbfaf5";
    ctx.strokeStyle = "#0b0c0e";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(-36, -3, 5.0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0b0c0e";
    ctx.beginPath();
    ctx.arc(-37.5, -3, 2.4, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  function drawMiniCreekBulldozer(ctx, S, x, y, scale, t) {
    var chug = Math.sin(t * 18.0) * 2.2;
    ctx.save();
    ctx.translate(x, y + chug);
    ctx.scale(scale, scale);

    // Exhaust stack + puffing white paper smoke rings
    S.drawCardboardPuppetPiece(ctx, [[12, -78], [26, -78], [26, -36], [12, -36]], { tone: "#3d3f42", ribs: 1 });
    for (var sm = 0; sm < 3; sm++) {
      var su = ((t * 1.4 + sm / 3) % 1);
      drawCutoutBubble(ctx, S, 19 - su * 36, -86 - su * 44, 6 + su * 9, "#fbfaf5");
    }

    // Lithograph cab & engine block with white scissor halo
    S.drawCutoutPaperEdge(
      ctx,
      [[-68, 8], [-68, -42], [-20, -42], [-14, -72], [48, -72], [62, -32], [68, 8]],
      "#e2b842", "#0b0c0e", { paperRim: 4.2 }
    );
    S.drawEngravingCrosshatch(ctx, 120, 44, 0.22, 6, { x: -60, y: -38 });

    // Articulated IK hydraulic arm pushing heavy front iron scoop blade!
    var bladeBob = Math.sin(t * 5.0) * 8;
    var arm = S.solveIK2(34, -14, 48, 46, 98, 4 + bladeBob, -1);
    drawLimbSegment(ctx, S, 34, -14, arm.jx, arm.jy, 7, 6, "#8e9094", "brass", "silver");
    drawLimbSegment(ctx, S, arm.jx, arm.jy, arm.ex, arm.ey, 6, 6, "#b4b6ba", null, "brass");

    // Curved steel bulldozer blade
    S.drawCutoutPaperEdge(
      ctx,
      [[94, -32 + bladeBob], [116, -24 + bladeBob], [122, 28 + bladeBob], [96, 32 + bladeBob]],
      "#d8d4ca", "#0b0c0e", { paperRim: 3.5 }
    );

    // Caterpillar tread housing with 4 silver split-pin rollers!
    S.drawCardboardPuppetPiece(
      ctx,
      [[-76, 6], [76, 6], [84, 34], [-84, 34]],
      {
        tone: "#2b2d30",
        ribs: 2,
        pins: [[-56, 20], [-18, 20], [18, 20], [56, 20]]
      }
    );

    ctx.restore();
  }

  function render50(ctx, W, H, rawT, state) {
    var S = stage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(50);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg; // atlas-31.webp (1398x786 This Land Is Mine scale landscape)

    var pxFar = S.parallaxX(0.20, t, state);
    var pxMid = S.parallaxX(0.50, t, state);
    var pxFg = S.parallaxX(0.85, t, state);

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.01 });

    // 1. Stark Cream-White Paper + Wide Ink-Black Cinema Band (exact boucle-la.webp register!)
    S.drawBolasBackdrop(ctx, W, H, "daumier-litho", 50, t, state, {
      bandTop: 118,
      bandBot: 572
    });

    // 2. Foraged High-Contrast Lithograph Cutouts inside the Ink-Black Band
    // Wide mountain & tree-row scale horizon scissored from atlas-31.webp (740x416) along upper ink band
    drawFracCutout(
      ctx, S, aImg, 0.06, 0.14, 0.88, 0.44,
      90 + pxFar, 130, 1100, 152,
      [[0.02, 0.16], [0.24, 0.04], [0.52, 0.12], [0.78, 0.05], [0.98, 0.18], [0.99, 0.92], [0.01, 0.92]],
      { haloWidth: 4.0, filter: "litho", alpha: 0.86 }
    );

    // Flanking giant curious creek trout heads scissored from top-left & top-right of p50.jpg!
    S.drawScissorCutout(
      ctx, pImg, 118, 168, 138, 112,
      86 + pxMid * 0.7, 232, 224, 156,
      [[0.04, 0.12], [0.76, 0.06], [0.96, 0.48], [0.84, 0.94], [0.05, 0.88]],
      { haloWidth: 4.5, filter: "litho", rot: Math.sin(t * 1.8) * 0.04 }
    );
    S.drawScissorCutout(
      ctx, pImg, 386, 164, 138, 112,
      968 + pxMid * 0.7, 230, 224, 156,
      [[0.24, 0.06], [0.96, 0.12], [0.95, 0.88], [0.16, 0.94], [0.04, 0.48]],
      { haloWidth: 4.5, filter: "litho", rot: -Math.sin(t * 1.9) * 0.04 }
    );

    // Riverbed riffle pebble & reed cutouts scissored from bottom of p50.jpg
    S.drawScissorCutout(
      ctx, pImg, 182, 434, 276, 94,
      280 + pxFg * 0.5, 468, 720, 96,
      [[0.03, 0.26], [0.32, 0.08], [0.68, 0.08], [0.97, 0.24], [0.98, 0.95], [0.02, 0.95]],
      { haloWidth: 4.2, filter: "litho" }
    );

    // 3. Towering Weathered Diamond Monolith Sign (rust plate from p50.jpg + pure vector dam/hazard relief!)
    var signX = 640 + pxMid * 0.6;
    var signY = 334;
    ctx.save();
    ctx.translate(signX, signY);

    // White scissor-cutout diamond monolith with weathered orange-amber fill & cross-hatching
    var diaR = 166;
    S.drawCutoutPaperEdge(
      ctx,
      [[0, -diaR], [diaR, 0], [0, diaR], [-diaR, 0]],
      "#e09b36", "#0b0c0e", { paperRim: 5.5 }
    );
    // Scissored upper rust patina triangle from p50.jpg (sx=235, sy=148, sw=170, sh=96 — pure rust, zero text!)
    S.drawScissorCutout(
      ctx, pImg, 235, 148, 170, 96,
      -88, -124, 176, 94,
      [[0.50, 0.02], [0.98, 0.92], [0.02, 0.92]],
      { haloWidth: 0, shadow: false, alpha: 0.78 }
    );
    // Bold inner black lithograph diamond border + spillway barrier chevrons (0 text calls!)
    ctx.strokeStyle = "#0b0c0e";
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(0, -diaR + 16);
    ctx.lineTo(diaR - 16, 0);
    ctx.lineTo(0, diaR - 16);
    ctx.lineTo(-diaR + 16, 0);
    ctx.closePath();
    ctx.stroke();

    // Graphic dam-wall crenellation silhouette across center of sign
    ctx.fillStyle = "#14110d";
    ctx.fillRect(-92, -26, 184, 18);
    for (var pil = -78; pil <= 66; pil += 36) {
      ctx.fillRect(pil, -46, 20, 56);
    }
    S.drawEngravingCrosshatch(ctx, 210, 120, 0.16, 7, { x: -105, y: -60 });
    S.drawSplitPin(ctx, 0, -diaR + 30, 4.5, { metal: "brass" });
    ctx.restore();

    // 4. Four-Variation Confrontations around the Resolute 3-Inch Snail Darter!
    var darterX = signX - 18 + Math.sin(t * 3.2) * 8;
    var darterY = signY + 30 + Math.cos(t * 2.7) * 5;

    if (beat.index === 1) {
      // VARIATION II (B · Probable · Turkey): Strict government river roadblock!
      var dropAng = (1 - S.clamp(S.spring(beat.localT, 0.08, 10.5, 4.2), 0, 1)) * 0.95;

      // Left & right striped drop-barriers slamming shut across the ink band
      for (var side = -1; side <= 1; side += 2) {
        ctx.save();
        ctx.translate(signX + side * 168, 362);
        ctx.rotate(-side * dropAng);
        S.drawCutoutPaperEdge(
          ctx,
          [[0, -16], [side * 340, -16], [side * 340, 16], [0, 16]],
          "#fbfaf5", "#0b0c0e", { paperRim: 3.2 }
        );
        ctx.fillStyle = "#d42a1e";
        for (var st = 1; st < 7; st += 2) {
          ctx.fillRect(side > 0 ? st * 46 : -(st + 1) * 46, -13, 36, 26);
        }
        S.drawSplitPin(ctx, 0, 0, 5.5, { metal: "brass" });
        // Flashing red roadblock beacon dome on post
        var flash = 0.55 + 0.45 * Math.sin(t * 10 + side);
        ctx.fillStyle = "rgba(212, 42, 30, " + (0.4 * flash).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(0, -34, 24, 0, TAU); ctx.fill();
        S.drawCutoutPaperEdge(ctx, [[-10, -42], [10, -42], [12, -22], [-12, -22]], "#d42a1e", "#0b0c0e", { paperRim: 2, shadow: false });
        ctx.restore();
      }
    } else if (beat.index === 2) {
      // VARIATION III (C · Plausible · Trout): Noisy mini creek bulldozer!
      var dozerX = S.lerp(250, 445, S.easeInOutCubic(beat.u));
      drawMiniCreekBulldozer(ctx, S, dozerX, 428, 1.08, t);
      S.drawBrookTrout(ctx, signX + 245 + Math.sin(t * 2.2) * 18, 412, 1.08, t, true, { tilt: -0.06 });
    } else if (beat.index === 3) {
      // VARIATION IV (D · Preposterous · Alien): Earth's supreme force-field guardian!
      S.drawAlienSaucer(ctx, 640, 102, 1.15, t, darterX, darterY - 95, { beamSpread: 175 });

      // Expanding concentric hexagonal/circular planetary shield dome centered on the tiny Snail Darter!
      var shieldU = S.clamp(S.spring(beat.localT, 0.12, 8.5, 3.8), 0, 1);
      for (var ring = 0; ring < 3; ring++) {
        var sr = (98 + ring * 48) * shieldU + Math.sin(t * 4.5 + ring) * 5;
        ctx.save();
        ctx.strokeStyle = ring === 0 ? "#fbfaf5" : (ring === 1 ? "#0f8f80" : "#d42a1e");
        ctx.lineWidth = 4.0 - ring * 0.8;
        ctx.setLineDash(ring === 1 ? [12, 6] : []);
        ctx.beginPath();
        for (var hx = 0; hx <= 6; hx++) {
          var ha = (hx / 6) * TAU + t * 0.45 * (ring % 2 === 0 ? 1 : -1);
          var px = darterX + Math.cos(ha) * sr * 1.15;
          var py = darterY + Math.sin(ha) * sr * 0.88;
          if (hx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    // Heroic tiny 3-inch cross-hatched Snail Darter standing its ground in front of the monolith!
    drawLithoSnailDarter(ctx, S, darterX, darterY, beat.index === 3 ? 1.18 : 1.05, t, beat.index >= 1);

    drawBallastStream(ctx, S, W, H, t, beat, "#fbfaf5");
    drawCourierOverlay(ctx, S, W, H, t, beat, state, { floorY: 548, climbX: 1152 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 50);
  }

  // ---------- Register Porthole Remake Scenes #46–#50 ----------
  var SCENE_DEFS = [
    { id: 46, station: "#46 · Steps",  bolasStyle: "queneau-rostrum",    fn: render46 },
    { id: 47, station: "#47 · Armada", bolasStyle: "perec-stage",        fn: render47 },
    { id: 48, station: "#48 · Belfry", bolasStyle: "cardboard-parallax", fn: render48 },
    { id: 49, station: "#49 · Corner", bolasStyle: "cardboard-parallax", fn: render49 },
    { id: 50, station: "#50 · Riffle", bolasStyle: "daumier-litho",      fn: render50 }
  ];

  for (var s = 0; s < SCENE_DEFS.length; s++) {
    (function (def) {
      root.PORTAL_REMAKE_SCENES[def.id] = {
        id: def.id,
        station: def.station,
        duration: DURATION,
        bolasStyle: def.bolasStyle,
        preload: function () {
          var S = stage();
          return S && S.preloadPortalPlates ? S.preloadPortalPlates(def.id) : Promise.resolve();
        },
        render: def.fn
      };
    })(SCENE_DEFS[s]);
  }
})(typeof window !== "undefined" ? window : globalThis);
