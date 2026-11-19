/* ============================================================================
 * Turkey Sub · Multi-SCION Animation Remake Crew 03 (Portholes #11–#15)
 * File: portals/remake-03.js  (window.PORTAL_REMAKE_SCENES[11..15])
 *
 * 16.0s (384 frames @ 24fps, 1280×720) BOLAS Oulipo Screening Room Rostrum Cinema:
 *   - #11 · Tank  ("queneau-rostrum"    · Teuf-Teuf · S08 Sutherland · S29/S41/S33)
 *   - #12 · Keel  ("duchamp-optic"      · A Morning Stroll · S01 Gilliam · S31/S44/S43)
 *   - #13 · Arch  ("cardboard-parallax" · Boucle-là ! · S02 Reiniger · S48/S47/S41)
 *   - #14 · Tower ("perec-stage"        · Un homme qui dort · S05 Norstein · S44/S41/S31)
 *   - #15 · Lens  ("duchamp-optic"      · Oupeinpo · S06 Whitney · S35/S44/S45)
 *
 * PAELEO Blind-Critic Invariant:
 *   When state && state.showCaptions === false, emits ZERO fillText/strokeText calls!
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var DURATION = 16.0;

  root.PORTAL_REMAKE_SCENES = root.PORTAL_REMAKE_SCENES || {};

  function stage() {
    return root.SCION_STAGE;
  }

  function clamp(v, a, b) {
    return v < a ? a : (v > b ? b : v);
  }

  function lerp(a, b, u) {
    return a + (b - a) * u;
  }

  function smooth(a, b, x) {
    var u = clamp((x - a) / ((b - a) || 1e-6), 0, 1);
    return u * u * (3 - 2 * u);
  }

  // Kick off plate preloading immediately when loaded in browser
  if (root.SCION_STAGE && typeof root.SCION_STAGE.preloadPortalPlates === "function") {
    root.SCION_STAGE.preloadPortalPlates([11, 12, 13, 14, 15]);
  }

  // Shared helper: draw articulated 2-bone IK cardboard arm with glinting split-pin brads
  function drawIKCardboardArm(ctx, S, x0, y0, l1, l2, tx, ty, bendDir, opts) {
    var cfg = opts || {};
    var ik = S.solveIK2(x0, y0, l1, l2, tx, ty, bendDir);
    var w1 = cfg.w1 || 13;
    var w2 = cfg.w2 || 10;
    var tone1 = cfg.tone1 || "#8e8d89";
    var tone2 = cfg.tone2 || "#a6a29a";
    var metal = cfg.metal || "silver";

    function limbPoly(ax, ay, bx, by, wa, wb) {
      var ang = Math.atan2(by - ay, bx - ax);
      var nx = -Math.sin(ang);
      var ny = Math.cos(ang);
      return [
        [ax + nx * wa, ay + ny * wa],
        [bx + nx * wb, by + ny * wb],
        [bx - nx * wb, by - ny * wb],
        [ax - nx * wa, ay - ny * wa]
      ];
    }

    S.drawCardboardPuppetPiece(ctx, limbPoly(ik.x0, ik.y0, ik.jx, ik.jy, w1, w1 * 0.84), {
      tone: tone1,
      ribs: 2,
      pin: { x: ik.x0, y: ik.y0, r: 4.8, metal: metal }
    });
    S.drawCardboardPuppetPiece(ctx, limbPoly(ik.jx, ik.jy, ik.ex, ik.ey, w2, w2 * 0.78), {
      tone: tone2,
      ribs: 2,
      pins: [
        { x: ik.jx, y: ik.jy, r: 4.4, metal: metal },
        { x: ik.ex, y: ik.ey, r: 3.8, metal: "brass" }
      ]
    });
    return ik;
  }

  // Shared helper: interactive / beat-driven Snail Mail & Turkey Cutaway courier layer
  function drawSnailMailCourierArc(ctx, S, W, H, beat, state, opts) {
    var cfg = opts || {};
    var yBase = cfg.yBase != null ? cfg.yBase : 556;
    var climbX = cfg.climbX != null ? cfg.climbX : 1138;

    // Interactive override if player explicitly drags/activates snail
    if (beat.snailActive || beat.snailT !== null) {
      var su = beat.snailT !== null ? beat.snailT : ((beat.t % 6.0) / 6.0);
      var ix = lerp(210, climbX, clamp(su * 1.25, 0, 1));
      var iy = su < 0.75
        ? yBase - Math.sin((su / 0.75) * Math.PI) * 24
        : lerp(yBase, 290, (su - 0.75) / 0.25);
      var irot = su < 0.75 ? 0 : -Math.PI * 0.48;
      S.drawMailSnail(ctx, ix, iy, 1.22, beat.t, {
        rot: irot,
        hasReply: su > 0.65,
        hasAlienStamp: beat.index === 3
      });
      return;
    }

    if (beat.index === 1) {
      // Beat B: Turkey Cutaway Badge lower-left dispatches Mail Snail across rostrum floor
      var disp = clamp(1.0 - Math.abs(beat.u - 0.22) * 3.0, 0.15, 1.0);
      S.drawTurkeyCutawayBadge(ctx, cfg.turkeyX || 126, cfg.turkeyY || 506, 1.04, beat.t, { dispatch: disp });

      var sx = lerp(228, 980, smooth(0.04, 0.96, beat.u));
      var sy = yBase - Math.sin(beat.u * Math.PI) * 22 + Math.sin(beat.t * 5.0) * 2.5;
      S.drawMailSnail(ctx, sx, sy, 1.24, beat.t, {
        rot: -0.04 * Math.cos(beat.u * Math.PI),
        hasReply: false
      });
    } else if (beat.index === 2) {
      // Beat C: Mail Snail climbs up the right frame edge carrying Trout's green reply stamp
      var cy = lerp(528, 250, smooth(0.02, 0.96, beat.u));
      S.drawMailSnail(ctx, climbX, cy, 1.18, beat.t, {
        rot: -Math.PI * 0.48,
        hasReply: true
      });
    } else if (beat.index === 3) {
      // Beat D: Parked high on right frame with all 3 stamps witnessing the Alien Listening Post
      S.drawMailSnail(ctx, climbX + 8, 224 + Math.sin(beat.t * 2.4) * 3, 1.05, beat.t, {
        rot: -Math.PI * 0.46,
        trail: false,
        hasReply: true,
        hasAlienStamp: true
      });
    }
  }

  // Shared helper: rising cut-paper creek bubbles (amplified when ballast is active)
  function drawCutoutBubbles(ctx, S, count, xCenter, xSpread, yMin, yMax, t, seed, ballastOn) {
    var total = ballastOn ? Math.round(count * 1.7) : count;
    var speed = ballastOn ? 92 : 54;
    var spanY = Math.max(40, yMax - yMin);
    ctx.save();
    for (var i = 0; i < total; i++) {
      var h1 = S.hash(seed + i * 7.13);
      var h2 = S.hash(seed + i * 13.37);
      var r = 4.5 + S.hash(seed + i * 3.91) * 9.5;
      var travel = ((h2 * spanY + t * (speed + h1 * 28)) % spanY);
      var by = yMax - travel;
      var bx = xCenter + (h1 - 0.5) * xSpread + Math.sin(t * 2.8 + i * 1.7) * 11;

      ctx.fillStyle = "#fbfaf5";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(bx, by, r + 1.8, 0, TAU);
      ctx.fill();

      ctx.fillStyle = "rgba(182, 232, 226, 0.82)";
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, TAU);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(bx - r * 0.32, by - r * 0.32, r * 0.28, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // Shared helper: subtle night/deep-water veil when state.lamp === false
  function applyLampAtmosphere(ctx, W, H, beat, glowX, glowY, glowCol) {
    if (beat.lampOn) return;
    ctx.save();
    ctx.fillStyle = "rgba(10, 16, 22, 0.32)";
    ctx.fillRect(0, 0, W, H);
    var rg = ctx.createRadialGradient(glowX, glowY, 12, glowX, glowY, 260);
    rg.addColorStop(0.0, glowCol || "rgba(120, 235, 215, 0.26)");
    rg.addColorStop(1.0, "rgba(10, 16, 22, 0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* ==========================================================================
   * #11 · TANK — Queneau Rostrum Cutout (Teuf-Teuf + S08 Sutherland Sketchpad)
   *   (A) A sunken picnic water cooler
   *   (B) An emergency air-supply tank
   *   (C) A fizzy creek soda dispenser
   *   (D) A frozen alien cryo-sleep pod
   * ========================================================================== */
  function renderPortal11(ctx, W, H, rawT, state) {
    var S = stage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(11);
    var pImg = plates.portholeImg; // 640x640
    var aImg = plates.atlasImg;    // 740x416 (atlas-07: grating, pipes, diamond-plate)

    S.beginCamera(ctx, W, H, t, { state: state, pushDur: 0.65 });

    // 1. Queneau Buttercream Rostrum Paper + Torn-Deckle Green Track Floor
    S.drawBolasBackdrop(ctx, W, H, "queneau-rostrum", 11, t, state);

    var pxFar = S.parallaxX(0.24, t, state);
    var pyFar = S.parallaxY(0.24, t, state);
    var pxMid = S.parallaxX(0.56, t, state);
    var pyMid = S.parallaxY(0.56, t, state);
    var pxNear = S.parallaxX(0.92, t, state);

    // Optional Queneau / Teuf-Teuf editorial top header (ONLY in captioned mode; 0 text in blind mode!)
    if (!beat.blind) {
      ctx.save();
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#d42a1e";
      ctx.font = '800 30px "Big Shoulders Display", Georgia, serif';
      var hTitle = "TEUF-TEUF";
      S.safeText(ctx, hTitle, 76, 66, state);
      var hW = ctx.measureText(hTitle).width;
      ctx.fillStyle = "#14110d";
      ctx.font = 'italic 21px "Literata", Georgia, serif';
      S.safeText(ctx, "· mécanisme n° 11", 76 + hW + 12, 65, state);
      ctx.restore();
    }

    // 2. Plane 1 (Far): Ivan Sutherland Sketchpad Constraint Grid + Atlas-07 Grating Cutouts
    ctx.save();
    ctx.translate(pxFar, pyFar);

    // Drafted Sketchpad construction circles & T-square constraint ticks (100% geometric)
    ctx.strokeStyle = "rgba(20, 17, 13, 0.16)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.arc(548, 304, 212, 0, TAU);
    ctx.moveTo(240, 304); ctx.lineTo(890, 304);
    ctx.moveTo(548, 68);  ctx.lineTo(548, 540);
    ctx.stroke();
    ctx.setLineDash([]);

    // Scissor-cut industrial diamond-plate & roller-grating plates from atlas-07.webp (avoiding BR corner)
    S.drawScissorCutout(ctx, aImg, 8, 215, 200, 185, 92, 168, 236, 216,
      [[0.04, 0.08], [0.92, 0.03], [0.97, 0.88], [0.10, 0.96]],
      { filter: beat.index === 3 ? "cyan" : "sepia", haloWidth: 4.5, rot: -0.05 }
    );
    S.drawScissorCutout(ctx, aImg, 255, 175, 415, 205, 575, 150, 390, 210,
      [[0.05, 0.06], [0.95, 0.04], [0.97, 0.92], [0.03, 0.95]],
      { filter: beat.index === 3 ? "cyan" : "mono", haloWidth: 4.5, rot: 0.04 }
    );

    // Torn-deckle forest-green workshop door flat on right (direct homage to exercices-de-style.webp!)
    S.drawTornPaperFlat(ctx, 1024, 86, 178, 456, {
      fill: beat.index === 3 ? "#1b3340" : "#253b1b",
      paperColor: "#f6f0e2",
      deckle: 8,
      stroke: "#14110d"
    });
    // Brass split-pin latch & blank cream card plaque on the door (pure geometric lines in blind mode!)
    S.drawCutoutPaperEdge(ctx, [[1056, 152], [1170, 152], [1170, 192], [1056, 192]], "#f4efe2", "#14110d", { paperRim: 2, shadow: false });
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(1074, 168); ctx.lineTo(1152, 168);
    ctx.moveTo(1086, 178); ctx.lineTo(1140, 178);
    ctx.stroke();
    S.drawSplitPin(ctx, 1046, 314, 5.2, { metal: "brass" });
    ctx.restore();

    // 3. Plane 2 (Mid): Foraged Creek Boulders & Kelp Cutouts from p11.jpg
    ctx.save();
    ctx.translate(pxMid, pyMid);

    // Left kelp frond cutout from p11.jpg
    S.drawScissorCutout(ctx, pImg, 104, 218, 102, 168, 224, 248, 146, 232,
      [[0.15, 0.04], [0.85, 0.06], [0.95, 0.94], [0.08, 0.96]],
      { haloWidth: 4.5, rot: Math.sin(t * 1.6) * 0.04 - 0.06 }
    );

    // Mossy creek boulder bed cutout from p11.jpg
    S.drawScissorCutout(ctx, pImg, 145, 368, 350, 150, 290, 392, 470, 176,
      [[0.04, 0.22], [0.28, 0.04], [0.74, 0.08], [0.97, 0.28], [0.94, 0.95], [0.06, 0.95]],
      { haloWidth: 5.0 }
    );

    // Hero Centerpiece: Real Orange-and-White Cooler Cutout from p11.jpg!
    var coolerTilt = -0.34 + Math.sin(t * 1.5) * 0.022 + (beat.ballastOn ? 0.05 : 0);
    if (beat.index === 3) coolerTilt = lerp(coolerTilt, -0.16, smooth(0.0, 0.35, beat.u));
    var cx = 505, cy = 315;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(coolerTilt);

    // Crop the vibrant orange Igloo body from p11.jpg (178, 182, 218, 226)
    S.drawScissorCutout(ctx, pImg, 178, 182, 218, 226, -124, -142, 248, 268,
      [[0.08, 0.10], [0.48, 0.02], [0.90, 0.08], [0.96, 0.88], [0.82, 0.98], [0.16, 0.97], [0.04, 0.84]],
      {
        haloWidth: 5.0,
        filter: beat.index === 3 ? "cyan" : "none"
      }
    );

    // Handmade kraft-and-brass mechanical collar over cooler midband (100% hides any painted letters on p11.jpg!)
    S.drawCardboardPuppetPiece(
      ctx,
      [[-108, -14], [108, -14], [112, 24], [-112, 24]],
      {
        tone: beat.index === 3 ? "#8aaab4" : "#e8dfce",
        ribs: 1,
        pins: [
          { x: -88, y: 5, r: 4.2, metal: "brass" },
          { x: 0, y: 5, r: 4.2, metal: "silver" },
          { x: 88, y: 5, r: 4.2, metal: "brass" }
        ]
      }
    );

    // Articulated Hinged White Cardboard Cooler Lid (bobs open on Beat A, clamped on B, straw-topped on C, cryo-dome on D)
    var lidOpen = beat.index === 0
      ? -0.18 - Math.abs(Math.sin(t * 2.1)) * 0.16
      : (beat.index === 2 ? -0.08 : -0.02);
    ctx.save();
    ctx.translate(-96, -124);
    ctx.rotate(lidOpen);
    S.drawCardboardPuppetPiece(
      ctx,
      [[-8, -22], [198, -22], [204, 8], [-4, 10]],
      { tone: "#f4f1e8", ribs: 1, pin: { x: 4, y: -4, r: 4.8, metal: "brass" } }
    );
    ctx.restore();

    // Beat B Upgrade: Emergency Submarine Air-Supply Pressure Gauge & Accordion Bellows
    if (beat.index === 1) {
      var popB = S.easeOutBack(smooth(0.0, 0.25, beat.u));
      ctx.save();
      ctx.scale(popB, popB);
      // Brass pressure dial on top-right of cooler
      S.drawCutoutPaperEdge(ctx, [[32, -196], [108, -196], [108, -124], [32, -124]], "#f6f0df", "#14110d", { paperRim: 3 });
      ctx.fillStyle = "#fbfaf5";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(70, -160, 28, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // Red danger wedge on dial (pure geometry)
      ctx.fillStyle = "#d42a1e";
      ctx.beginPath();
      ctx.moveTo(70, -160);
      ctx.arc(70, -160, 23, -0.4, 0.45);
      ctx.closePath();
      ctx.fill();
      // Sweeping gauge needle
      var needleAng = -1.8 + Math.sin(t * 5.2) * 0.95;
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(70, -160);
      ctx.lineTo(70 + Math.cos(needleAng) * 21, -160 + Math.sin(needleAng) * 21);
      ctx.stroke();
      S.drawSplitPin(ctx, 70, -160, 3.8, { metal: "brass" });
      ctx.restore();
    }

    // Beat C Upgrade: Fizzy Creek Soda-Fountain Awning & Striped Dispenser Nozzle
    if (beat.index === 2) {
      var popC = S.easeOutBack(smooth(0.0, 0.25, beat.u));
      ctx.save();
      ctx.translate(0, -152);
      ctx.scale(popC, popC);
      for (var stIdx = -3; stIdx <= 2; stIdx++) {
        var sx0 = stIdx * 38;
        S.drawCutoutPaperEdge(
          ctx,
          [[sx0, -34], [sx0 + 38, -34], [sx0 + 36, 12], [sx0 + 2, 12]],
          (stIdx % 2 === 0) ? "#d42a1e" : "#fbfaf5",
          "#14110d",
          { paperRim: 1.5, shadow: false }
        );
      }
      ctx.restore();
    }

    // Beat D Upgrade: Crystalline Frost Shards & Alien Cryo-Sleeper Viewport!
    if (beat.index === 3) {
      var popD = smooth(0.0, 0.35, beat.u);
      ctx.save();
      ctx.globalAlpha = popD;
      // Frosted oval cryo-window cut into cooler front revealing a sleeping 3-eyed alien silhouette
      S.drawCutoutPaperEdge(
        ctx,
        [[-52, -92], [52, -92], [64, -18], [46, 56], [-46, 56], [-64, -18]],
        "#bfeef0",
        "#14110d",
        { paperRim: 3.5 }
      );
      // Sleeping green-cardboard alien silhouette inside cryo pod
      S.drawCardboardPuppetPiece(
        ctx,
        [[-22, 42], [-26, -8], [0, -58], [26, -8], [22, 42]],
        { tone: "#538d7d", ribs: 2, shadow: false }
      );
      for (var ce = -1; ce <= 1; ce++) {
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(ce * 11, -28, 4.2, 0.15, Math.PI - 0.15);
        ctx.stroke();
      }
      // Jagged cut-paper frost icicles around cooler rim
      var icicles = [[-116, -110, -148, -82], [112, -104, 150, -76], [-104, 86, -142, 118], [98, 92, 138, 124]];
      for (var ic = 0; ic < icicles.length; ic++) {
        var q = icicles[ic];
        S.drawCutoutPaperEdge(
          ctx,
          [[q[0], q[1] - 12], [q[2], q[3]], [q[0] + 14, q[1] + 12]],
          "#e6fbfc",
          "#14110d",
          { paperRim: 2 }
        );
      }
      ctx.restore();
    }

    // Push-button spigot cutout at bottom of cooler
    var spigPress = Math.max(0, Math.sin(t * 4.6)) * 6;
    S.drawCardboardPuppetPiece(
      ctx,
      [[32, 74 + spigPress], [68, 74 + spigPress], [68, 108], [32, 108]],
      { tone: "#f5f2e9", ribs: 1, pin: { x: 50, y: 92, r: 4.0, metal: "silver" } }
    );

    ctx.restore(); // end cooler local transform

    // World coordinates of spigot nozzle
    var spigLocalX = 52, spigLocalY = 96;
    var spigWorldX = cx + spigLocalX * Math.cos(coolerTilt) - spigLocalY * Math.sin(coolerTilt);
    var spigWorldY = cy + spigLocalX * Math.sin(coolerTilt) + spigLocalY * Math.cos(coolerTilt);

    // 4. S33 2-Bone IK Mechanical Valve-Tapper Arm mounted on left iron bracket!
    var tapTargetX = spigWorldX - 18 - Math.sin(t * 4.6) * 14;
    var tapTargetY = spigWorldY - 8 - Math.cos(t * 4.6) * 10;
    drawIKCardboardArm(ctx, S, 276, 444, 168, 148, tapTargetX, tapTargetY, -1, {
      tone1: "#7f8285",
      tone2: "#a8aaac",
      metal: "brass"
    });

    // 5. S41 Secondary Dynamics: 3 Braided Catenary Vinyl Hoses + Constraint Callout Lines!
    var hoseEnds = beat.index === 1
      ? [[872, 232], [935, 318], [898, 412]]   // Beat B: routed into high air manifold!
      : (beat.index === 2
        ? [[768, 398], [858, 414], [948, 396]] // Beat C: routed into 3 fizzy creek soda cups!
        : [[795, 198], [865, 290], [835, 448]]);

    if (beat.index === 1) {
      // Atlas-07 multi-cable air manifold scissor-cutout receiving the hoses
      S.drawScissorCutout(ctx, aImg, 250, 18, 360, 125, 790, 148, 235, 118,
        [[0.04, 0.08], [0.96, 0.05], [0.94, 0.92], [0.08, 0.95]],
        { filter: "sepia", haloWidth: 4.0, rot: -0.08 }
      );
    }

    for (var hi = 0; hi < 3; hi++) {
      var hx1 = hoseEnds[hi][0];
      var hy1 = hoseEnds[hi][1];
      var sag = 72 + hi * 24 + S.wobble(t, 2.6 + hi * 0.4, 18, hi * 1.4);
      var midX = lerp(spigWorldX, hx1, 0.52) + Math.sin(t * 2.2 + hi) * 16;
      var midY = Math.max(spigWorldY, hy1) + sag;

      // White paper halo + translucent aqua tube stroke
      ctx.lineCap = "round";
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(spigWorldX, spigWorldY);
      ctx.quadraticCurveTo(midX, midY, hx1, hy1);
      ctx.stroke();

      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 9.5;
      ctx.stroke();

      ctx.strokeStyle = beat.index === 2 ? "#f4a236" : (beat.index === 3 ? "#8be9f5" : "#bde6de");
      ctx.lineWidth = 5.5;
      ctx.stroke();

      // Traveling air/soda bolus bead along tube
      var bu = ((t * (0.48 + hi * 0.11) + hi * 0.33) % 1);
      var omt = 1 - bu;
      var bx = omt * omt * spigWorldX + 2 * omt * bu * midX + bu * bu * hx1;
      var by = omt * omt * spigWorldY + 2 * omt * bu * midY + bu * bu * hy1;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(bx, by, 3.2, 0, TAU);
      ctx.fill();
    }

    // Beat C: Three Fizzy Cut-Paper Creek Soda Cups + Brook Trout Customer!
    if (beat.index === 2) {
      var cupCols = ["#f29f38", "#e04f3e", "#199a8a"];
      for (var ci = 0; ci < 3; ci++) {
        var cupX = hoseEnds[ci][0];
        var cupY = hoseEnds[ci][1] + 24 + Math.sin(t * 4 + ci) * 3;
        S.drawCutoutPaperEdge(
          ctx,
          [[cupX - 20, cupY - 26], [cupX + 20, cupY - 26], [cupX + 15, cupY + 24], [cupX - 15, cupY + 24]],
          cupCols[ci],
          "#14110d",
          { paperRim: 2.8 }
        );
        // Bendy paper straw
        ctx.strokeStyle = "#fbfaf5";
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(cupX + 4, cupY - 24);
        ctx.lineTo(cupX + 10, cupY - 46);
        ctx.lineTo(cupX + 22, cupY - 48);
        ctx.stroke();
      }
      S.drawBrookTrout(ctx, 928, 304 + Math.sin(t * 2.4) * 8, 1.16, t, false);
    } else if (beat.index === 0) {
      // Beat A: Real creek Brook Trout observing from right reeds (matching p11.jpg!)
      S.drawBrookTrout(ctx, 905, 326 + Math.sin(t * 2.0) * 6, 1.05, t, false);
    }

    // Rising effervescent / creek bubbles above cooler & hoses
    drawCutoutBubbles(
      ctx, S,
      beat.index === 2 ? 18 : 11,
      beat.index === 2 ? 840 : 620,
      beat.index === 2 ? 210 : 150,
      90, 390, t, 1101, beat.ballastOn
    );

    // Sutherland Red Constraint Dimension Lines linking cooler pivot to valve & outlet (0 text!)
    ctx.strokeStyle = "rgba(212, 42, 30, 0.68)";
    ctx.lineWidth = 1.6;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(spigWorldX, spigWorldY);
    ctx.lineTo(hoseEnds[0][0], hoseEnds[0][1]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore(); // end Mid plane

    // 6. Plane 3 (Foreground): Right Creek Kelp Cutout from p11.jpg + Lamp Beam + Couriers
    ctx.save();
    ctx.translate(pxNear * 0.5, 0);
    S.drawScissorCutout(ctx, pImg, 434, 345, 92, 152, 928, 396, 128, 198,
      [[0.18, 0.04], [0.86, 0.06], [0.94, 0.96], [0.08, 0.96]],
      { haloWidth: 4.0, rot: Math.sin(t * 1.9 + 1) * 0.04 }
    );
    ctx.restore();

    S.drawLampBeam(ctx, W, H, t, state, { x: 548, y: 634, aimX: 520, spread: 240, alpha: 0.19 });
    applyLampAtmosphere(ctx, W, H, beat, 520, 320, "rgba(185, 242, 232, 0.25)");

    // Beat A: Turkey peering through lower-left glass (matching p11.jpg!)
    if (beat.index === 0) {
      S.drawTurkeyInCorner(ctx, W, H, t, { x: 124, y: 508, scale: 1.06 });
    }

    // Beat D: Alien Listening Post Saucer hovering above cryo-sleep pod!
    if (beat.index === 3) {
      S.drawAlienSaucer(ctx, 560, 114, 1.22, t, 515, 340, { beamSpread: 165 });
    }

    drawSnailMailCourierArc(ctx, S, W, H, beat, state, { yBase: 558, climbX: 1126 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 11);
  }

  /* ==========================================================================
   * #12 · KEEL — Duchamp Optic & Gilliam Cutout Stage (A Morning Stroll + S01)
   *   (A) A cardboard stage floor window
   *   (B) A spinning creek whirlpool drain
   *   (C) A one-dollar sideshow spotlight
   *   (D) A secret pocket-universe trapdoor
   * ========================================================================== */
  function renderPortal12(ctx, W, H, rawT, state) {
    var S = stage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(12);
    var pImg = plates.portholeImg; // 640x640 (proscenium curtains, wood deck, emerald floor window)
    var aImg = plates.atlasImg;    // 740x416 (atlas-09: curved hatch arch, sailor, captain)

    S.beginCamera(ctx, W, H, t, { state: state, pushDur: 0.65 });

    // 1. Dark Engraved Workshop Slate Ground (duchamp-optic)
    S.drawBolasBackdrop(ctx, W, H, "duchamp-optic", 12, t, state);

    var pxFar = S.parallaxX(0.28, t, state);
    var pxMid = S.parallaxX(0.58, t, state);
    var pyMid = S.parallaxY(0.55, t, state);

    // 2. Plane 1 (Far): Atlas-09 Curved Submarine Hatch Arch + Duchamp Eccentric Rotor Disc
    ctx.save();
    ctx.translate(pxFar, 0);
    S.drawScissorCutout(ctx, aImg, 55, 18, 630, 175, 220, 34, 840, 210,
      [[0.03, 0.32], [0.22, 0.04], [0.78, 0.04], [0.97, 0.32], [0.92, 0.92], [0.08, 0.92]],
      { filter: "cyan", haloWidth: 4.5, alpha: 0.86 }
    );

    // Engraved eccentric Anémic Cinéma optical disc turning behind the proscenium
    ctx.save();
    ctx.translate(640, 258);
    ctx.rotate(t * (beat.index === 1 ? 1.8 : 0.45));
    for (var dRing = 6; dRing >= 1; dRing--) {
      var ecc = (dRing % 2 === 0 ? 1 : -1) * 9;
      ctx.strokeStyle = dRing % 2 === 0 ? "rgba(246, 242, 232, 0.24)" : "rgba(15, 143, 128, 0.32)";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(ecc, -ecc * 0.5, dRing * 28, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();

    // 3. Plane 2 (Mid): Wooden Perspective Stage Deck & Luminous Emerald Floor Aperture!
    ctx.save();
    ctx.translate(pxMid, pyMid);

    // Perspective corrugated cardboard & plank stage apron
    S.drawCardboardPuppetPiece(
      ctx,
      [[170, 520], [308, 356], [972, 356], [1110, 520], [990, 566], [290, 566]],
      { tone: "#9d8358", ribs: 3 }
    );
    // Plank perspective lines
    ctx.strokeStyle = "rgba(20, 17, 13, 0.38)";
    ctx.lineWidth = 1.8;
    for (var pl = -4; pl <= 4; pl++) {
      ctx.beginPath();
      ctx.moveTo(640 + pl * 68, 358);
      ctx.lineTo(640 + pl * 112, 522);
      ctx.stroke();
    }

    // Scissor-cut crop of the real p12.jpg stage floor & emerald ring
    S.drawScissorCutout(ctx, pImg, 188, 344, 264, 108, 412, 366, 456, 152,
      [[0.08, 0.08], [0.92, 0.08], [0.98, 0.88], [0.02, 0.88]],
      { haloWidth: 4.0 }
    );

    // Central Floor Window / Whirlpool / Spotlight / Pocket-Universe Aperture at (640, 434)
    var apX = 640, apY = 434;
    var apRx = 148, apRy = 44;

    // Radiant upward emerald-cyan theater column (modulated by beat)
    var colGrad = ctx.createLinearGradient(apX, apY, apX, 86);
    if (beat.index === 3) {
      colGrad.addColorStop(0.0, "rgba(212, 42, 30, 0.55)");
      colGrad.addColorStop(0.45, "rgba(15, 220, 175, 0.38)");
      colGrad.addColorStop(1.0, "rgba(15, 143, 128, 0)");
    } else if (beat.index === 2) {
      colGrad.addColorStop(0.0, "rgba(255, 238, 150, 0.72)");
      colGrad.addColorStop(0.55, "rgba(40, 235, 165, 0.36)");
      colGrad.addColorStop(1.0, "rgba(40, 235, 165, 0)");
    } else {
      colGrad.addColorStop(0.0, "rgba(24, 245, 158, 0.68)");
      colGrad.addColorStop(0.55, "rgba(18, 198, 132, 0.30)");
      colGrad.addColorStop(1.0, "rgba(18, 198, 132, 0)");
    }
    ctx.fillStyle = colGrad;
    ctx.beginPath();
    ctx.moveTo(apX - apRx, apY);
    ctx.lineTo(apX - apRx * (beat.index === 2 ? 1.55 : 1.18), 88);
    ctx.lineTo(apX + apRx * (beat.index === 2 ? 1.55 : 1.18), 88);
    ctx.lineTo(apX + apRx, apY);
    ctx.closePath();
    ctx.fill();

    // Rim & Interior of Floor Aperture
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(apX, apY, apRx, apRy, 0, 0, TAU);
    ctx.fillStyle = beat.index === 3 ? "#0c0f18" : "#0e5c47";
    ctx.fill();
    ctx.clip();

    // Concentric S31 Optical Rings inside Floor Aperture
    for (var ir = 6; ir >= 1; ir--) {
      var uRing = ir / 6;
      var spinOff = Math.cos(t * (beat.index === 1 ? 5.5 : 2.0) + ir) * (beat.index === 1 ? 14 : 4);
      ctx.fillStyle = beat.index === 3
        ? (ir % 2 === 0 ? "#182438" : "#d42a1e")
        : (ir % 2 === 0 ? "#14b884" : "#6ff7c4");
      ctx.beginPath();
      ctx.ellipse(apX + spinOff, apY, apRx * uRing, apRy * uRing, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 4.0;
    ctx.beginPath();
    ctx.ellipse(apX, apY, apRx, apRy, 0, 0, TAU);
    ctx.stroke();

    // --- 4-Beat Stage Metamorphoses ---
    if (beat.index === 0) {
      // Beat A: Cardboard Stage Floor Window — hinged corrugated trapdoor frame & real emerald glow crop
      S.drawScissorCutout(ctx, pImg, 238, 218, 164, 136, 535, 196, 210, 178,
        [[0.08, 0.06], [0.92, 0.06], [0.96, 0.94], [0.04, 0.94]],
        { haloWidth: 3.5, alpha: 0.78 }
      );
      S.drawBrookTrout(ctx, 972, 318 + Math.sin(t * 2.2) * 7, 1.08, t, false);
    } else if (beat.index === 1) {
      // Beat B: Spinning Creek Whirlpool Drain — Monty-Python Giant Cardboard Hand pulls brass drain plug!
      var pullY = 236 - Math.sin(beat.u * Math.PI) * 58;
      drawIKCardboardArm(ctx, S, 918, 134, 156, 142, 668, pullY, 1, {
        w1: 20, w2: 16, tone1: "#c7b299", tone2: "#dcc8b0", metal: "brass"
      });
      // Beaded chain + rubber/brass bathtub drain plug dangling above swirling vortex
      ctx.strokeStyle = "#f3d184";
      ctx.lineWidth = 3.2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(668, pullY);
      ctx.lineTo(apX, apY - 26);
      ctx.stroke();
      ctx.setLineDash([]);

      S.drawCardboardPuppetPiece(
        ctx,
        [[apX - 32, apY - 42], [apX + 32, apY - 42], [apX + 26, apY - 16], [apX - 26, apY - 16]],
        { tone: "#3d3b38", ribs: 1, pin: { x: apX, y: apY - 42, r: 4.5, metal: "brass" } }
      );

      // Spiraling white-paper whirlpool foam ribbons sucked into the drain
      for (var wf = 0; wf < 5; wf++) {
        var wa = t * 4.4 + wf * (TAU / 5);
        var wr = 52 + ((1 - ((t * 0.65 + wf * 0.2) % 1)) * 95);
        var wx = apX + Math.cos(wa) * wr;
        var wy = apY + Math.sin(wa) * wr * 0.30 - 8;
        S.drawCutoutPaperEdge(
          ctx,
          [[wx - 14, wy - 5], [wx + 14, wy - 3], [wx + 8, wy + 6], [wx - 10, wy + 5]],
          "#e8fcf6",
          "#14110d",
          { paperRim: 2, shadow: false }
        );
      }
    } else if (beat.index === 2) {
      // Beat C: One-Dollar Sideshow Spotlight — Atlas-09 Sailor & Captain peek from wings while Top-Hat Trout dances!
      S.drawScissorCutout(ctx, aImg, 168, 108, 178, 268, 252, 168, 152, 224,
        [[0.12, 0.04], [0.88, 0.04], [0.94, 0.96], [0.08, 0.96]],
        { filter: "sepia", haloWidth: 4.0, rot: 0.06 }
      );
      S.drawScissorCutout(ctx, aImg, 396, 142, 218, 244, 872, 178, 168, 214,
        [[0.08, 0.05], [0.92, 0.05], [0.95, 0.96], [0.06, 0.96]],
        { filter: "sepia", haloWidth: 4.0, rot: -0.06 }
      );

      // Hinged cardboard carbon-arc footlight housings flanking the spotlight
      S.drawCardboardPuppetPiece(ctx, [[432, 424], [478, 396], [486, 444], [436, 456]], {
        tone: "#454648", pin: { x: 456, y: 440, r: 4.0, metal: "brass" }
      });
      S.drawCardboardPuppetPiece(ctx, [[848, 424], [802, 396], [794, 444], [844, 456]], {
        tone: "#454648", pin: { x: 824, y: 440, r: 4.0, metal: "brass" }
      });

      // Brook Trout in miniature cut-paper vaudeville top hat & cane dancing center-spotlight!
      var danceX = 640 + Math.sin(t * 4.8) * 34;
      var danceY = 304 - Math.abs(Math.cos(t * 4.8)) * 22;
      S.drawBrookTrout(ctx, danceX, danceY, 1.24, t, false, { tilt: Math.sin(t * 4.8) * 0.14 });
      // Cut-paper top hat perched above Trout's head
      ctx.save();
      ctx.translate(danceX - 52, danceY - 34);
      ctx.rotate(-0.18 + Math.sin(t * 4.8) * 0.12);
      S.drawCutoutPaperEdge(ctx, [[-22, 4], [22, 4], [22, 10], [-22, 10]], "#14110d", "#fbfaf5", { paperRim: 2, shadow: false });
      S.drawCutoutPaperEdge(ctx, [[-14, -22], [14, -22], [13, 5], [-13, 5]], "#14110d", "#fbfaf5", { paperRim: 2, shadow: false });
      ctx.fillStyle = "#d42a1e";
      ctx.fillRect(-13, -2, 26, 5);
      ctx.restore();
    } else {
      // Beat D: Secret Pocket-Universe Trapdoor — Hinged trapdoor leaves swing wide revealing miniature ringed planets!
      var flapAng = 0.95 + Math.sin(t * 2.2) * 0.08;
      ctx.save();
      ctx.translate(apX - apRx, apY);
      ctx.rotate(-flapAng);
      S.drawCardboardPuppetPiece(ctx, [[0, -10], [116, -14], [112, 14], [0, 12]], {
        tone: "#6e5536", ribs: 2, pin: { x: 0, y: 0, r: 5.0, metal: "brass" }
      });
      ctx.restore();

      ctx.save();
      ctx.translate(apX + apRx, apY);
      ctx.rotate(flapAng);
      S.drawCardboardPuppetPiece(ctx, [[0, -10], [-116, -14], [-112, 14], [0, 12]], {
        tone: "#6e5536", ribs: 2, pin: { x: 0, y: 0, r: 5.0, metal: "brass" }
      });
      ctx.restore();

      // Rising cut-paper pocket-universe planets, Escher stairs & stars floating up from the trapdoor!
      for (var pi = 0; pi < 4; pi++) {
        var pu = ((t * 0.28 + pi * 0.25) % 1);
        var py = lerp(apY - 10, 195, pu);
        var px = apX + Math.sin(pu * TAU + pi * 1.7) * 92;
        var pr = lerp(10, 22, Math.sin(pu * Math.PI));
        S.drawCutoutPaperEdge(
          ctx,
          [[px - pr, py - pr * 0.8], [px + pr, py - pr * 0.8], [px + pr, py + pr * 0.8], [px - pr, py + pr * 0.8]],
          pi % 2 === 0 ? "#d42a1e" : "#0f8f80",
          "#14110d",
          { paperRim: 2.5, shadow: false }
        );
        ctx.strokeStyle = "#fbfaf5";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(px, py, pr * 1.65, pr * 0.45, -0.28, 0, TAU);
        ctx.stroke();
      }
    }

    // 4. Scalloped Proscenium Curtain Cutouts sliced directly from p12.jpg with Split-Pin Pulleys!
    var curtainSway = Math.sin(t * 1.7) * 0.025;
    // Left curtain drape (p12.jpg: 155, 190, 78, 210)
    S.drawScissorCutout(ctx, pImg, 155, 190, 78, 210, 166, 92, 142, 396,
      [[0.08, 0.02], [0.92, 0.04], [0.86, 0.96], [0.12, 0.98]],
      { haloWidth: 4.5, rot: curtainSway, pin: { x: 236, y: 108, r: 5.2, metal: "brass" } }
    );
    // Right curtain drape (p12.jpg: 406, 190, 78, 210)
    S.drawScissorCutout(ctx, pImg, 406, 190, 78, 210, 972, 92, 142, 396,
      [[0.08, 0.04], [0.92, 0.02], [0.88, 0.98], [0.14, 0.96]],
      { haloWidth: 4.5, rot: -curtainSway, pin: { x: 1044, y: 108, r: 5.2, metal: "brass" } }
    );
    // Top scalloped valance (p12.jpg: 162, 152, 316, 78)
    S.drawScissorCutout(ctx, pImg, 162, 152, 316, 78, 232, 38, 816, 124,
      [[0.02, 0.08], [0.98, 0.08], [0.95, 0.92], [0.74, 0.98], [0.50, 0.90], [0.26, 0.98], [0.05, 0.92]],
      { haloWidth: 4.5 }
    );

    ctx.restore(); // end Mid plane

    if (beat.ballastOn) {
      drawCutoutBubbles(ctx, S, 10, 640, 520, 90, 520, t, 1202, true);
    }

    S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 636, aimX: 640, spread: 250, alpha: 0.18 });
    applyLampAtmosphere(ctx, W, H, beat, 640, 420, "rgba(38, 245, 165, 0.30)");

    if (beat.index === 0) {
      S.drawTurkeyInCorner(ctx, W, H, t, { x: 126, y: 508, scale: 1.06 });
    }
    if (beat.index === 3) {
      S.drawAlienSaucer(ctx, 640, 118, 1.20, t, 640, 434, { beamSpread: 155 });
    }

    drawSnailMailCourierArc(ctx, S, W, H, beat, state, { yBase: 554, climbX: 1126 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 12);
  }

  /* ==========================================================================
   * #13 · ARCH — Split-Pin Cardboard & Silver-Gelatin Parallax (Boucle-là ! + S02 Reiniger)
   *   (A) A brass twig-bell on a rock
   *   (B) A sneaky tripwire dinner bell
   *   (C) A polite creek ferry doorbell
   *   (D) A cosmic stargate toll chime
   * ========================================================================== */
  function renderPortal13(ctx, W, H, rawT, state) {
    var S = stage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(13);
    var pImg = plates.portholeImg; // 640x640 (mossy stone arch, twig, brass bell)
    var aImg = plates.atlasImg;    // 382x680 (atlas-54: river surface, bell boulder, bespectacled fish, gravel)

    S.beginCamera(ctx, W, H, t, { state: state, pushDur: 0.65 });

    // 1. Silver-Gelatin Monochrome Parallax Ground + Dark Side Mattes (exact la-mort-en-ce-jardin.webp!)
    S.drawBolasBackdrop(ctx, W, H, "cardboard-parallax", 13, t, state, { pillarbox: true });

    var px1 = S.parallaxX(0.20, t, state);
    var px2 = S.parallaxX(0.42, t, state);
    var px3 = S.parallaxX(0.68, t, state);
    var py3 = S.parallaxY(0.60, t, state);
    var px5 = S.parallaxX(1.08, t, state);

    // 2. Plane 1 (Far): Shimmering Silver-Gelatin River Ripples from atlas-54.webp + Backlit Reiniger Parchment Glow
    ctx.save();
    ctx.translate(px1, 0);
    S.drawScissorCutout(ctx, aImg, 0, 0, 382, 185, 118, 28, 1044, 240,
      [[0.02, 0.04], [0.98, 0.04], [0.97, 0.94], [0.03, 0.94]],
      { filter: "mono", haloWidth: 0, shadow: false, alpha: 0.72 }
    );

    // Warm backlit Lotte Reiniger shadow-theater parchment aperture glowing behind the stone arch!
    var archGlow = ctx.createRadialGradient(640, 325, 30, 640, 325, 310);
    archGlow.addColorStop(0.0, beat.index === 3 ? "rgba(175, 248, 236, 0.88)" : "rgba(248, 235, 200, 0.86)");
    archGlow.addColorStop(0.65, beat.index === 3 ? "rgba(24, 138, 128, 0.42)" : "rgba(186, 156, 102, 0.38)");
    archGlow.addColorStop(1.0, "rgba(25, 26, 28, 0)");
    ctx.fillStyle = archGlow;
    ctx.beginPath();
    ctx.arc(640, 325, 310, 0, TAU);
    ctx.fill();
    ctx.restore();

    // 3. Plane 2 (Mid-Far): Monochrome Creek Bell-Boulder & Gravel Banks from atlas-54.webp
    ctx.save();
    ctx.translate(px2, 0);
    S.drawScissorCutout(ctx, aImg, 195, 118, 184, 278, 146, 224, 240, 310,
      [[0.10, 0.05], [0.88, 0.04], [0.96, 0.94], [0.04, 0.96]],
      { filter: "mono", haloWidth: 4.0 }
    );
    S.drawScissorCutout(ctx, aImg, 0, 460, 382, 210, 180, 444, 920, 178,
      [[0.02, 0.14], [0.35, 0.04], [0.68, 0.06], [0.98, 0.16], [0.96, 0.96], [0.04, 0.96]],
      { filter: "mono", haloWidth: 3.5 }
    );
    ctx.restore();

    // 4. Plane 3 (Hero Stone Arch & Sound-Synced Brass Twig-Bell Rig!)
    ctx.save();
    ctx.translate(px3, py3);

    // Beat D Cosmic Stargate Filigree Astrolabe Rings inside the Stone Arch!
    if (beat.index === 3) {
      ctx.save();
      ctx.translate(640, 318);
      for (var sg = 0; sg < 3; sg++) {
        ctx.save();
        ctx.rotate((sg % 2 === 0 ? 1 : -1) * t * (0.6 + sg * 0.35));
        var sr = 198 - sg * 38;
        ctx.strokeStyle = sg === 1 ? "#d42a1e" : "#0f8f80";
        ctx.lineWidth = 4.0;
        ctx.setLineDash([16, 8]);
        ctx.beginPath();
        ctx.arc(0, 0, sr, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        for (var gn = 0; gn < 8; gn++) {
          var ga = (gn / 8) * TAU;
          S.drawReinigerFiligreeHinge(ctx, Math.cos(ga) * sr, Math.sin(ga) * sr, 5.5, { metal: "brass" });
        }
        ctx.restore();
      }
      ctx.restore();
    }

    // Left, Keystone, & Right Stone Arch Cutouts from p13.jpg (monochrome/sepia tinted to match silver-gelatin world, leaving brass bell warm gold!)
    S.drawScissorCutout(ctx, pImg, 114, 162, 174, 286, 226, 98, 256, 424,
      [[0.12, 0.06], [0.92, 0.02], [0.76, 0.96], [0.08, 0.96]],
      { filter: "sepia", haloWidth: 4.5 }
    );
    S.drawScissorCutout(ctx, pImg, 356, 162, 170, 286, 798, 98, 256, 424,
      [[0.08, 0.02], [0.88, 0.06], [0.92, 0.96], [0.24, 0.96]],
      { filter: "sepia", haloWidth: 4.5 }
    );
    S.drawScissorCutout(ctx, pImg, 200, 112, 244, 104, 424, 38, 432, 152,
      [[0.04, 0.28], [0.34, 0.04], [0.72, 0.04], [0.96, 0.28], [0.88, 0.92], [0.12, 0.92]],
      { filter: "sepia", haloWidth: 4.5 }
    );

    // Forked Grey-Cardboard Twig & Reiniger Brass Filigree Pivot Hinge at Arch Keystone (640, 154)
    S.drawCardboardPuppetPiece(
      ctx,
      [[548, 126], [642, 154], [748, 118], [754, 132], [644, 170], [542, 140]],
      { tone: "#5c5348", ribs: 2 }
    );
    var pivotX = 640, pivotY = 164;
    S.drawReinigerFiligreeHinge(ctx, pivotX, pivotY, 8.5, { metal: "brass" });

    // S47 Sound-to-Action Bell Strike Schedule (matches synthesized Murbach chime instants!)
    var strikeTimes = [1.1, 2.7, 5.2, 6.8, 9.3, 10.8, 13.4, 14.8];
    var bellSwing = Math.sin(t * 2.1) * 0.06;
    var ringPulse = 0;
    for (var si = 0; si < strikeTimes.length; si++) {
      var imp = S.springImpulse(t, strikeTimes[si], 15.0, 3.2);
      bellSwing += imp * 0.34;
      var dt = t - strikeTimes[si];
      if (dt >= 0 && dt < 1.35) {
        ringPulse = Math.max(ringPulse, 1 - dt / 1.35);
        // Expanding concentric acoustic chime rings!
        ctx.save();
        ctx.strokeStyle = beat.index === 3
          ? "rgba(212, 42, 30, " + ((1 - dt / 1.35) * 0.75).toFixed(3) + ")"
          : "rgba(243, 209, 132, " + ((1 - dt / 1.35) * 0.80).toFixed(3) + ")";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(pivotX, 256, 54 + dt * 155, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Swinging Foraged Brass Bell Cutout cropped cleanly from p13.jpg (264, 184, 112, 108)!
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(bellSwing);

    S.drawScissorCutout(ctx, pImg, 264, 184, 112, 108, -76, 8, 152, 146,
      [[0.34, 0.02], [0.66, 0.02], [0.78, 0.24], [0.98, 0.86], [0.84, 0.98], [0.16, 0.98], [0.02, 0.86], [0.22, 0.24]],
      { haloWidth: 4.5, shadowY: 6 }
    );
    // Articulated brass clapper + knotted pull-rope hanging below bell
    var clapAng = bellSwing * 0.65 + Math.sin(t * 6.2) * 0.08;
    ctx.rotate(clapAng * 0.35);
    S.drawSplitPin(ctx, 0, 146, 7.5, { metal: "brass" });

    var ropeEndX = Math.sin(t * 3.1) * 12;
    var ropeEndY = 278;
    ctx.strokeStyle = "#fbfaf5";
    ctx.lineWidth = 8.5;
    ctx.beginPath();
    ctx.moveTo(0, 152);
    ctx.quadraticCurveTo(ropeEndX * 0.6, 216, ropeEndX, ropeEndY);
    ctx.stroke();
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 5.0;
    ctx.stroke();
    ctx.strokeStyle = "#d4b982";
    ctx.lineWidth = 2.6;
    ctx.stroke();
    S.drawSplitPin(ctx, ropeEndX, ropeEndY, 5.2, { metal: "silver" });
    ctx.restore();

    var ropeWorldX = pivotX - Math.sin(bellSwing) * 265;
    var ropeWorldY = pivotY + Math.cos(bellSwing) * 265;

    // --- 4-Beat Split-Pin Cardboard & Reiniger Puppet Staging ---
    if (beat.index === 0) {
      // Beat A: Real Creek — Brook Trout glides toward the knotted bell rope (matching p13.jpg!)
      S.drawBrookTrout(ctx, 825 + Math.sin(t * 1.8) * 18, 392 + Math.cos(t * 2.2) * 6, 1.15, t, false);
    } else if (beat.index === 1) {
      // Beat B: Sneaky Tripwire Dinner Bell — Reiniger silhouette knife & fork clappers + taut red tripwires!
      S.drawReinigerFiligreeHinge(ctx, 356, 438, 7.0, { metal: "brass" });
      S.drawReinigerFiligreeHinge(ctx, 924, 438, 7.0, { metal: "brass" });
      ctx.strokeStyle = "#d42a1e";
      ctx.lineWidth = 2.6;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(356, 438);
      ctx.lineTo(ropeWorldX, ropeWorldY);
      ctx.lineTo(924, 438);
      ctx.stroke();
      ctx.setLineDash([]);

      // Articulated black-cardboard Lotte Reiniger dinner fork (left) & carving knife (right) swinging on brass hinges!
      var utensilSwing = 0.25 + ringPulse * 0.45;
      ctx.save();
      ctx.translate(454, 248);
      ctx.rotate(-utensilSwing);
      S.drawCardboardPuppetPiece(
        ctx,
        [[-8, 0], [8, 0], [10, 96], [22, 102], [22, 152], [12, 152], [12, 116], [4, 116], [4, 152], [-4, 152], [-4, 116], [-12, 116], [-12, 152], [-22, 152], [-22, 102], [-10, 96]],
        { tone: "#1f1e1d", charcoal: false, pin: { x: 0, y: 8, r: 5.0, metal: "brass" } }
      );
      ctx.restore();

      ctx.save();
      ctx.translate(826, 248);
      ctx.rotate(utensilSwing);
      S.drawCardboardPuppetPiece(
        ctx,
        [[-7, 0], [7, 0], [9, 86], [20, 98], [14, 162], [-6, 148], [-8, 86]],
        { tone: "#1f1e1d", charcoal: false, pin: { x: 0, y: 8, r: 5.0, metal: "brass" } }
      );
      ctx.restore();
    } else if (beat.index === 2) {
      // Beat C: Polite Creek Ferry Doorbell — Bespectacled Ferry-Fish on Cardboard Raft + Brook Trout IK Rope Tug!
      var ferryX = lerp(420, 545, smooth(0.0, 0.85, beat.u));
      var ferryY = 468 + Math.sin(t * 2.6) * 5;
      // Grey-cardboard ferry raft with split-pin logs
      S.drawCardboardPuppetPiece(
        ctx,
        [[ferryX - 118, ferryY], [ferryX + 118, ferryY], [ferryX + 102, ferryY + 28], [ferryX - 102, ferryY + 28]],
        {
          tone: "#7c776e",
          ribs: 2,
          pins: [
            { x: ferryX - 76, y: ferryY + 14, r: 4.2, metal: "silver" },
            { x: ferryX, y: ferryY + 14, r: 4.2, metal: "silver" },
            { x: ferryX + 76, y: ferryY + 14, r: 4.2, metal: "silver" }
          ]
        }
      );
      // Bespectacled creek ferrymaster cropped from atlas-54.webp!
      S.drawScissorCutout(ctx, aImg, 92, 156, 186, 275, ferryX - 66, ferryY - 148, 126, 162,
        [[0.16, 0.04], [0.84, 0.04], [0.95, 0.65], [0.80, 0.96], [0.20, 0.96], [0.05, 0.65]],
        { filter: "mono", haloWidth: 4.0 }
      );

      // Brook Trout passenger politely reaching 2-bone IK fin to ring the ferry doorbell!
      S.drawBrookTrout(ctx, 796, 416, 1.12, t, false);
      drawIKCardboardArm(ctx, S, 742, 418, 66, 62, ropeWorldX + 6, ropeWorldY - 4, -1, {
        w1: 9, w2: 7, tone1: "#9ea89a", tone2: "#b8c0b4", metal: "silver"
      });
    } else {
      // Beat D: Cosmic Stargate Toll Chime — Grey-cardboard space-ferry pod gliding into the glowing arch!
      S.drawBrookTrout(ctx, 790, 396 + Math.sin(t * 2.8) * 10, 1.04, t, false);
    }

    ctx.restore(); // end Plane 3

    // 5. Plane 5 (Near Foreground): Dark Root/Pebble Silhouettes at Lower Corners (exact la-mort-en-ce-jardin depth cue!)
    ctx.save();
    ctx.translate(px5, 0);
    S.drawCardboardPuppetPiece(
      ctx,
      [[86, 638], [94, 512], [168, 486], [244, 548], [296, 638]],
      { tone: "#2b2c2e", ribs: 2 }
    );
    S.drawCardboardPuppetPiece(
      ctx,
      [[984, 638], [1028, 536], [1118, 496], [1192, 524], [1196, 638]],
      { tone: "#2b2c2e", ribs: 2 }
    );
    ctx.restore();

    if (beat.ballastOn) {
      drawCutoutBubbles(ctx, S, 12, 640, 480, 90, 520, t, 1303, true);
    }

    S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 636, aimX: 640, spread: 235, alpha: 0.17 });
    applyLampAtmosphere(ctx, W, H, beat, 640, 290, "rgba(247, 224, 165, 0.28)");

    if (beat.index === 0) {
      S.drawTurkeyInCorner(ctx, W, H, t, { x: 146, y: 506, scale: 1.04 });
    }
    if (beat.index === 3) {
      S.drawAlienSaucer(ctx, 640, 96, 1.18, t, 640, 318, { beamSpread: 170 });
    }

    drawSnailMailCourierArc(ctx, S, W, H, beat, state, { turkeyX: 150, yBase: 556, climbX: 1098 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 13);
  }

  /* ==========================================================================
   * #14 · TOWER — Carved Paper Proscenium & Norstein Mist (Un homme qui dort + S05)
   *   (A) A sinking red autumn maple leaf
   *   (B) A scary Thanksgiving countdown sign
   *   (C) A bright scarlet bird feather
   *   (D) A tiny solar-sail landing craft
   * ========================================================================== */
  function renderPortal14(ctx, W, H, rawT, state) {
    var S = stage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(14);
    var pImg = plates.portholeImg; // 640x640 (scarlet maple leaf, teal water, bubbles, riverbed)
    var aImg = plates.atlasImg;    // 740x416 (atlas-02: curved submarine watchtower window)

    S.beginCamera(ctx, W, H, t, { state: state, pushDur: 0.65 });

    // 1. Perec Carved Ochre Sandstone Masonry Proscenium + Hinged Shutters (les-lieux-dune-fugue.webp!)
    S.drawBolasBackdrop(ctx, W, H, "perec-stage", 14, t, state, {
      openX: 236,
      openY: 66,
      openW: 808,
      openH: 546,
      doors: true
    });

    var pxFar = S.parallaxX(0.22, t, state);
    var pxMid = S.parallaxX(0.54, t, state);
    var pyMid = S.parallaxY(0.50, t, state);

    // Clip interior multiplane creek world cleanly inside the carved stone casement opening
    ctx.save();
    ctx.beginPath();
    ctx.rect(236, 66, 808, 546);
    ctx.clip();

    // 2. Plane 1 (Far): Cyanotype Watchtower Archival Plate (atlas-02.webp) + Yuri Norstein Mist Banks!
    ctx.save();
    ctx.translate(pxFar, 0);
    S.drawScissorCutout(ctx, aImg, 48, 18, 644, 344, 246, 72, 788, 396,
      [[0.02, 0.04], [0.98, 0.04], [0.98, 0.96], [0.02, 0.96]],
      { filter: "cyan", haloWidth: 0, shadow: false, alpha: 0.58 }
    );
    ctx.restore();

    S.drawNorsteinFog(ctx, W, H, t, 0.28, "216, 232, 234");
    S.drawWaterCaustics(ctx, W, H, t, 0.15);

    // 3. Plane 2 (Mid-Back): Creek Riverbed & Swaying Reed Cutouts from p14.jpg
    ctx.save();
    ctx.translate(pxMid * 0.7, 0);
    S.drawScissorCutout(ctx, pImg, 118, 360, 404, 162, 260, 444, 760, 172,
      [[0.02, 0.22], [0.28, 0.06], [0.74, 0.08], [0.98, 0.24], [0.98, 0.98], [0.02, 0.98]],
      { filter: "cyan", haloWidth: 4.0 }
    );
    ctx.restore();

    // 4. Plane 3 (Hero Pendulum Drift): Scissor-Cut Crimson Maple Leaf from p14.jpg!
    var leafX = 640 + Math.sin(t * 1.45) * 64 + pxMid * 0.4;
    var leafY = beat.index === 1
      ? 282 + Math.sin(t * 2.4) * 8
      : (beat.index === 3
        ? lerp(196, 366, smooth(0.05, 0.92, beat.u))
        : lerp(214, 356, (Math.sin(t * 0.85) + 1) * 0.5) + pyMid);
    var leafRot = beat.index === 1
      ? Math.sin(t * 3.0) * 0.08
      : Math.sin(t * 1.45 + 0.6) * 0.26;

    // Warm S31 backlit crimson-amber vein glow behind the leaf
    var veinGlow = ctx.createRadialGradient(leafX, leafY, 10, leafX, leafY, 138);
    veinGlow.addColorStop(0.0, beat.index === 3 ? "rgba(255, 224, 130, 0.62)" : "rgba(235, 92, 54, 0.46)");
    veinGlow.addColorStop(1.0, "rgba(235, 92, 54, 0)");
    ctx.fillStyle = veinGlow;
    ctx.beginPath();
    ctx.arc(leafX, leafY, 138, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.translate(leafX, leafY);
    ctx.rotate(leafRot);

    if (beat.index === 0) {
      // Beat A: Real Sinking Red Autumn Maple Leaf (exact maple-lobe scissor crop of p14.jpg: 242, 228, 158, 155!)
      S.drawScissorCutout(ctx, pImg, 242, 228, 158, 155, -108, -106, 216, 212,
        [
          [0.52, 0.02], [0.68, 0.22], [0.96, 0.18], [0.84, 0.48],
          [0.98, 0.66], [0.74, 0.80], [0.82, 0.94], [0.52, 0.86],
          [0.32, 0.98], [0.28, 0.82], [0.06, 0.72], [0.18, 0.52],
          [0.04, 0.24], [0.34, 0.26]
        ],
        { haloWidth: 4.5 }
      );
    } else if (beat.index === 1) {
      // Beat B: Scary Thanksgiving Countdown Sign — Hanging Wooden/Cardboard Placard + Leaf Crest + 4 Pure Tally Bars (0 text!)
      // Suspension chains up to top lintel
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 3.0;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(-76, -90); ctx.lineTo(-76, -220);
      ctx.moveTo(76, -90);  ctx.lineTo(76, -220);
      ctx.stroke();
      ctx.setLineDash([]);

      S.drawCardboardPuppetPiece(
        ctx,
        [[-126, -94], [126, -94], [132, 88], [-132, 88]],
        {
          tone: "#e8dcc4",
          ribs: 2,
          pins: [
            { x: -104, y: -74, r: 4.6, metal: "brass" },
            { x: 104, y: -74, r: 4.6, metal: "brass" }
          ]
        }
      );
      // Crimson leaf emblem pinned at left of placard
      S.drawScissorCutout(ctx, pImg, 242, 228, 158, 155, -112, -68, 118, 118,
        [[0.50, 0.04], [0.95, 0.22], [0.92, 0.82], [0.46, 0.96], [0.06, 0.74], [0.08, 0.24]],
        { haloWidth: 3.5, pin: { x: -52, y: -8, r: 4.0, metal: "brass" } }
      );
      // Pure geometric carved wooden tally pegs (4 vertical crimson bars + diagonal slash — ZERO font glyphs!)
      for (var ti = 0; ti < 4; ti++) {
        var bx = 18 + ti * 22;
        S.drawCutoutPaperEdge(
          ctx,
          [[bx, -46], [bx + 11, -46], [bx + 10, 38], [bx - 1, 38]],
          "#d42a1e",
          "#14110d",
          { paperRim: 1.5, shadow: false }
        );
      }
      if (beat.u > 0.35) {
        S.drawCutoutPaperEdge(
          ctx,
          [[8, 22], [108, -32], [112, -21], [12, 33]],
          "#14110d",
          "#fbfaf5",
          { paperRim: 1.5, shadow: false }
        );
      }
      // Ticking brass pendulum swinging underneath the sign!
      var pendAng = Math.sin(t * 5.6) * 0.42;
      ctx.save();
      ctx.translate(0, 88);
      ctx.rotate(pendAng);
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(0, 68);
      ctx.stroke();
      S.drawCutoutPaperEdge(ctx, [[-18, 58], [18, 58], [22, 86], [-22, 86]], "#d4a44c", "#14110d", { paperRim: 2 });
      S.drawSplitPin(ctx, 0, 0, 4.5, { metal: "brass" });
      ctx.restore();
    } else if (beat.index === 2) {
      // Beat C: Bright Scarlet Bird Feather — Elongated Scarlet Plume Barbs + Curved Ivory Quill!
      ctx.rotate(-0.32);
      // Curved ivory quill shaft
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 7.5;
      ctx.beginPath();
      ctx.moveTo(-132, 62);
      ctx.quadraticCurveTo(-10, -8, 128, -48);
      ctx.stroke();

      // Layered scarlet & vermilion cut-paper feather barbs around real p14 crimson core
      S.drawCutoutPaperEdge(
        ctx,
        [[-96, 44], [-42, -38], [46, -68], [134, -52], [96, 14], [18, 46], [-64, 58]],
        "#c92a22",
        "#14110d",
        { paperRim: 4.0 }
      );
      S.drawScissorCutout(ctx, pImg, 252, 236, 138, 132, -62, -52, 146, 92,
        [[0.08, 0.48], [0.38, 0.08], [0.92, 0.14], [0.96, 0.72], [0.44, 0.94]],
        { haloWidth: 2.5, shadow: false }
      );
      // Delicate feather barb notches
      ctx.strokeStyle = "rgba(20, 17, 13, 0.55)";
      ctx.lineWidth = 1.5;
      for (var fb = -4; fb <= 5; fb++) {
        var qx = fb * 20;
        ctx.beginPath();
        ctx.moveTo(qx, -8 - fb * 4);
        ctx.lineTo(qx + 12, -42 - fb * 3);
        ctx.moveTo(qx, -8 - fb * 4);
        ctx.lineTo(qx + 16, 26 - fb * 2);
        ctx.stroke();
      }
    } else {
      // Beat D: Tiny Solar-Sail Landing Craft — Origami Crimson/Gold Gossamer Sail + IK Micro-Lander Legs!
      // Gold foil diamond rigging frame behind crimson leaf solar sail
      S.drawCutoutPaperEdge(
        ctx,
        [[0, -134], [142, -16], [0, 74], [-142, -16]],
        "#e8b948",
        "#14110d",
        { paperRim: 3.5 }
      );
      S.drawScissorCutout(ctx, pImg, 242, 228, 158, 155, -86, -98, 172, 156,
        [[0.50, 0.02], [0.96, 0.34], [0.80, 0.92], [0.20, 0.92], [0.04, 0.34]],
        { haloWidth: 3.0 }
      );
      // Central brass telemetry capsule + 2 articulated IK landing legs!
      S.drawCardboardPuppetPiece(
        ctx,
        [[-26, 26], [26, 26], [34, 68], [-34, 68]],
        { tone: "#8a99a4", ribs: 1, pin: { x: 0, y: 46, r: 4.8, metal: "brass" } }
      );
      var legSpread = 58 + smooth(0.4, 0.9, beat.u) * 20;
      drawIKCardboardArm(ctx, S, -24, 62, 46, 44, -legSpread, 118, -1, { w1: 7, w2: 6, metal: "silver" });
      drawIKCardboardArm(ctx, S, 24, 62, 46, 44, legSpread, 118, 1, { w1: 7, w2: 6, metal: "silver" });
    }

    ctx.restore(); // end leaf transform

    // Brook Trout witness in Beat A & Beat C
    if (beat.index === 0) {
      S.drawBrookTrout(ctx, 888, 336 + Math.sin(t * 2.1) * 7, 1.04, t, false);
    } else if (beat.index === 2) {
      S.drawBrookTrout(ctx, leafX + 168, leafY + 26 + Math.sin(t * 2.8) * 8, 1.18, t, false, { tilt: -0.10 });
    }

    // Rising Norstein mist bubbles above leaf
    drawCutoutBubbles(ctx, S, 10, leafX, 95, 86, leafY - 40, t, 1404, beat.ballastOn);
    S.drawNorsteinFog(ctx, W, H, t + 4.2, 0.18, "235, 240, 238");

    ctx.restore(); // end Perec casement clip!

    S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 634, aimX: leafX, spread: 210, alpha: 0.17 });
    applyLampAtmosphere(ctx, W, H, beat, leafX, leafY, "rgba(240, 110, 68, 0.28)");

    if (beat.index === 0) {
      S.drawTurkeyInCorner(ctx, W, H, t, { x: 132, y: 508, scale: 1.04 });
    }
    if (beat.index === 3) {
      S.drawAlienSaucer(ctx, 640, 104, 1.16, t, leafX, leafY, { beamSpread: 150 });
    }

    drawSnailMailCourierArc(ctx, S, W, H, beat, state, { yBase: 558, climbX: 1094 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 14);
  }

  /* ==========================================================================
   * #15 · LENS — Oupeinpo 3×3 Glass-Block Permutation & Whitney Harmonic Slate
   *   (A) A wall of wavy glass blocks
   *   (B) A badly cracked submarine window
   *   (C) Nine tiny blurry baby chickens
   *   (D) A pixelated alien force-field grid
   * ========================================================================== */
  var P15_SRC_X = [142, 258, 388];
  var P15_SRC_W = [110, 124, 110];
  var P15_SRC_Y = [120, 250, 390];
  var P15_SRC_H = [122, 132, 115];

  function drawFuzzyChickCutout(ctx, S, cx, cy, scale, t, idx) {
    var bob = Math.sin(t * 5.6 + idx * 1.1) * 4.5;
    var flap = Math.sin(t * 9.2 + idx * 1.7) * 0.32;
    ctx.save();
    ctx.translate(cx, cy + bob);
    ctx.scale(scale, scale);

    // Soft blurry halo glow (capturing "blurry baby chickens" through wavy aqua glass!)
    ctx.fillStyle = "rgba(255, 232, 122, 0.38)";
    ctx.beginPath();
    ctx.arc(0, 2, 34, 0, TAU);
    ctx.fill();

    // Round ochre-yellow cut-paper chick body & head
    S.drawCutoutPaperEdge(
      ctx,
      [[-24, 16], [-26, -4], [-14, -24], [8, -26], [22, -12], [24, 14], [6, 24], [-14, 24]],
      "#f5cb4c",
      "#14110d",
      { paperRim: 2.5, shadow: false }
    );

    // Tiny split-pin winglet
    ctx.save();
    ctx.translate(-4, 4);
    ctx.rotate(flap);
    S.drawCardboardPuppetPiece(
      ctx,
      [[-12, -5], [8, -6], [12, 4], [-8, 8]],
      { tone: "#e0a92b", ribs: 1, shadow: false, pin: { x: -6, y: 0, r: 2.8, metal: "brass" } }
    );
    ctx.restore();

    // Orange triangle beak & pin-dot eye
    S.drawCutoutPaperEdge(ctx, [[18, -10], [32, -5], [18, 1]], "#e05a2b", "#14110d", { paperRim: 1.2, shadow: false });
    ctx.fillStyle = "#14110d";
    ctx.beginPath();
    ctx.arc(10, -11, 2.8, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  function renderPortal15(ctx, W, H, rawT, state) {
    var S = stage();
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var plates = S.getPortalPlates(15);
    var pImg = plates.portholeImg; // 640x640 (3x3 wavy cyan glass blocks + refracted trout)
    var aImg = plates.atlasImg;    // 740x359 (atlas-29: crop ONLY sx >= 290 so zero Japanese text ever appears!)

    S.beginCamera(ctx, W, H, t, { state: state, pushDur: 0.65 });

    // 1. Dark Engraved Workshop Slate + John Whitney Harmonic Polar Rings
    S.drawBolasBackdrop(ctx, W, H, "duchamp-optic", 15, t, state);

    var pxFar = S.parallaxX(0.25, t, state);
    var pxMid = S.parallaxX(0.52, t, state);
    var pyMid = S.parallaxY(0.48, t, state);

    // 2. Plane 1 (Far): John Whitney Lissajous Orbits + Atlas-29 Blue Graphic Motion Streaks (sx >= 485!)
    ctx.save();
    ctx.translate(pxFar, 0);
    S.drawScissorCutout(ctx, aImg, 488, 36, 240, 280, 96, 132, 265, 340,
      [[0.04, 0.08], [0.96, 0.04], [0.92, 0.94], [0.06, 0.96]],
      { filter: "cyan", haloWidth: 4.0, alpha: 0.72, rot: -0.04 }
    );
    S.drawScissorCutout(ctx, aImg, 488, 36, 240, 280, 918, 132, 265, 340,
      [[0.04, 0.04], [0.96, 0.08], [0.94, 0.96], [0.08, 0.94]],
      { filter: "cyan", haloWidth: 4.0, alpha: 0.72, rot: 0.04 }
    );

    // Whitney harmonic counter-rotating polar rose curves
    ctx.save();
    ctx.translate(640, 318);
    for (var wr = 0; wr < 2; wr++) {
      ctx.strokeStyle = wr === 0 ? "rgba(76, 201, 240, 0.24)" : "rgba(212, 42, 30, 0.20)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var deg = 0; deg <= 120; deg++) {
        var ang = (deg / 120) * TAU;
        var rad = 285 + Math.sin(ang * 4 + t * (wr === 0 ? 1.5 : -1.2)) * 28;
        var wx = Math.cos(ang) * rad;
        var wy = Math.sin(ang) * rad * 0.82;
        if (deg === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();

    // 3. Plane 2 (Hero 3×3 Oupeinpo Glass-Block Matrix): Nine Real Tile Cutouts from p15.jpg!
    ctx.save();
    ctx.translate(pxMid * 0.5, pyMid * 0.5);

    var gridX0 = 346, gridY0 = 76;
    var cellW = 182, cellH = 152, gap = 21;

    // Mortar / riveted steel frame backing behind the 3x3 matrix
    S.drawCardboardPuppetPiece(
      ctx,
      [[gridX0 - 22, gridY0 - 20], [gridX0 + cellW * 3 + gap * 2 + 22, gridY0 - 20],
       [gridX0 + cellW * 3 + gap * 2 + 22, gridY0 + cellH * 3 + gap * 2 + 20], [gridX0 - 22, gridY0 + cellH * 3 + gap * 2 + 20]],
      {
        tone: beat.index === 1 ? "#54585c" : (beat.index === 3 ? "#1c2530" : "#d8d3c4"),
        ribs: 2,
        pins: [
          { x: gridX0 - 8, y: gridY0 - 8, r: 5.0, metal: "brass" },
          { x: gridX0 + cellW * 3 + gap * 2 + 8, y: gridY0 - 8, r: 5.0, metal: "brass" },
          { x: gridX0 - 8, y: gridY0 + cellH * 3 + gap * 2 + 8, r: 5.0, metal: "brass" },
          { x: gridX0 + cellW * 3 + gap * 2 + 8, y: gridY0 + cellH * 3 + gap * 2 + 8, r: 5.0, metal: "brass" }
        ]
      }
    );

    // Oupeinpo permutation mapping for which source tile feeds each cell
    var permMap = beat.index === 2
      ? [4, 0, 2, 6, 1, 8, 3, 7, 5]
      : (beat.index === 3 ? [8, 1, 6, 3, 4, 5, 2, 7, 0] : [0, 1, 2, 3, 4, 5, 6, 7, 8]);

    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 3; c++) {
        var idx = r * 3 + c;
        var srcIdx = permMap[idx];
        var sr = Math.floor(srcIdx / 3);
        var sc = srcIdx % 3;

        // S06 Whitney harmonic phase-locked tile breathing & displacement!
        var phase = t * 2.2 + r * 0.9 + c * 1.1;
        var dxOff = Math.sin(phase) * (beat.index === 3 ? 9 : 4.5);
        var dyOff = Math.cos(phase * 1.15) * (beat.index === 3 ? 7 : 3.5);
        var tileRot = Math.sin(phase * 0.8) * (beat.index === 1 ? 0.035 : 0.018);

        var tx = gridX0 + c * (cellW + gap) + dxOff;
        var ty = gridY0 + r * (cellH + gap) + dyOff;

        // Real glass-block scissor cutout cropped from p15.jpg
        S.drawScissorCutout(
          ctx, pImg,
          P15_SRC_X[sc], P15_SRC_Y[sr], P15_SRC_W[sc], P15_SRC_H[sr],
          tx, ty, cellW, cellH,
          [[0.03, 0.04], [0.97, 0.03], [0.98, 0.96], [0.02, 0.97]],
          {
            haloWidth: 3.8,
            rot: tileRot,
            filter: beat.index === 3 ? "cyan" : "none",
            tint: beat.index === 2 ? "rgba(32, 165, 160, 0.22)" : (beat.index === 3 ? "rgba(15, 22, 36, 0.42)" : null)
          }
        );

        // Beat C: One blurry fuzzy yellow baby chick inside EVERY SINGLE ONE of the 9 wavy glass blocks!
        if (beat.index === 2) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(tx + 6, ty + 6, cellW - 12, cellH - 12);
          ctx.clip();
          drawFuzzyChickCutout(ctx, S, tx + cellW * 0.5, ty + cellH * 0.54, 0.98, t, idx);
          // Wavy aqua glass refraction streaks IN FRONT of the chick!
          ctx.strokeStyle = "rgba(195, 250, 245, 0.55)";
          ctx.lineWidth = 4.5;
          for (var wv = 0; wv < 3; wv++) {
            var wy0 = ty + 28 + wv * 44;
            ctx.beginPath();
            ctx.moveTo(tx + 12, wy0);
            ctx.bezierCurveTo(tx + 62, wy0 - 14, tx + 118, wy0 + 14, tx + cellW - 12, wy0 - 4);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Beat D: Pixelated Alien Force-Field Grid — stepped neon-cyan & stamp-red pixel glyphs (0 text!)
        if (beat.index === 3) {
          var pulse = 0.55 + 0.45 * Math.sin(t * 6.0 + idx * 0.9);
          var pCol = (idx % 2 === 0) ? "rgba(76, 240, 224, " + pulse.toFixed(3) + ")" : "rgba(212, 42, 30, " + pulse.toFixed(3) + ")";
          ctx.strokeStyle = pCol;
          ctx.lineWidth = 3.2;
          ctx.strokeRect(tx + 10, ty + 10, cellW - 20, cellH - 20);

          // Stepped 5x4 pixel-block force-field sprite inside each cell
          var pxSize = 14;
          var gx0 = tx + cellW * 0.5 - pxSize * 2.5;
          var gy0 = ty + cellH * 0.5 - pxSize * 2.0;
          ctx.fillStyle = pCol;
          for (var pyi = 0; pyi < 4; pyi++) {
            for (var pxi = 0; pxi < 5; pxi++) {
              var sym = Math.min(pxi, 4 - pxi);
              if (((sym + pyi + idx + Math.floor(t * 4)) % 3) === 0) {
                ctx.fillRect(gx0 + pxi * pxSize, gy0 + pyi * pxSize, pxSize - 2, pxSize - 2);
              }
            }
          }
        }
      }
    }

    // Beat B Overlay: Badly Cracked Submarine Window — Jagged Cut-Paper Fracture Web + Riveted Patch Clamps + Pressurized Leak Jets!
    if (beat.index === 1) {
      var impactX = 640, impactY = 318;
      var rays = [
        [-240, -185], [-85, -210], [115, -195], [265, -140],
        [275, 45], [215, 205], [-35, 215], [-255, 165], [-280, -15]
      ];
      ctx.save();
      for (var ri = 0; ri < rays.length; ri++) {
        var mx = impactX + rays[ri][0] * 0.48 + ((ri % 2 === 0 ? 1 : -1) * 18);
        var my = impactY + rays[ri][1] * 0.48 - ((ri % 2 === 0 ? 1 : -1) * 14);
        var ex = impactX + rays[ri][0];
        var ey = impactY + rays[ri][1];

        ctx.strokeStyle = "#fbfaf5";
        ctx.lineWidth = 6.5;
        ctx.beginPath();
        ctx.moveTo(impactX, impactY); ctx.lineTo(mx, my); ctx.lineTo(ex, ey);
        ctx.stroke();

        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 3.0;
        ctx.stroke();
      }

      // Emergency iron patch strap bolted across center crack with brass split-pins!
      S.drawCardboardPuppetPiece(
        ctx,
        [[556, 286], [728, 258], [736, 298], [564, 326]],
        {
          tone: "#787c80",
          ribs: 1,
          pins: [
            { x: 582, y: 304, r: 4.8, metal: "brass" },
            { x: 708, y: 280, r: 4.8, metal: "brass" }
          ]
        }
      );

      // Pressurized turquoise cut-paper water leak jets spurting from cracks!
      var leaks = [[512, 232, -1, -1], [768, 238, 1, -1], [636, 424, 0.4, 1]];
      for (var li = 0; li < leaks.length; li++) {
        var lk = leaks[li];
        var spurt = 26 + Math.abs(Math.sin(t * 7.5 + li * 1.3)) * 52;
        S.drawCutoutPaperEdge(
          ctx,
          [[lk[0], lk[1]], [lk[0] + lk[2] * spurt - 12, lk[1] + lk[3] * spurt], [lk[0] + lk[2] * spurt + 12, lk[1] + lk[3] * spurt - 8]],
          "#8ef4ec",
          "#14110d",
          { paperRim: 2, shadow: false }
        );
      }
      ctx.restore();
    }

    // Beat D Center Accent: Angular Blue Mind-Game Face Cutout (sx=295..545 — strictly right of all Japanese text!)
    if (beat.index === 3) {
      S.drawScissorCutout(ctx, aImg, 295, 26, 248, 308, 536, 198, 208, 246,
        [[0.18, 0.04], [0.88, 0.06], [0.94, 0.62], [0.76, 0.96], [0.14, 0.92], [0.06, 0.44]],
        { filter: "cyan", haloWidth: 4.0, alpha: 0.76 }
      );
    }

    // Brook Trout witness in Beat C inspecting the 9 blurry chicks!
    if (beat.index === 2) {
      S.drawBrookTrout(ctx, 1068, 336 + Math.sin(t * 2.5) * 8, 1.06, t, false);
    }

    ctx.restore(); // end Plane 2

    if (beat.ballastOn) {
      drawCutoutBubbles(ctx, S, 12, 640, 560, 84, 540, t, 1505, true);
    }

    S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 636, aimX: 640, spread: 240, alpha: 0.16 });
    applyLampAtmosphere(ctx, W, H, beat, 640, 320, "rgba(76, 215, 240, 0.26)");

    if (beat.index === 0) {
      S.drawTurkeyInCorner(ctx, W, H, t, { x: 132, y: 508, scale: 1.04 });
    }
    if (beat.index === 3) {
      S.drawAlienSaucer(ctx, 640, 96, 1.18, t, 640, 326, { beamSpread: 185 });
    }

    drawSnailMailCourierArc(ctx, S, W, H, beat, state, { yBase: 558, climbX: 1126 });

    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 15);
  }

  /* ==========================================================================
   * Register Portals #11–#15 on window.PORTAL_REMAKE_SCENES
   * ========================================================================== */
  var DEFINITIONS = [
    { id: 11, station: "#11 · Tank",  bolasStyle: "queneau-rostrum",    fn: renderPortal11 },
    { id: 12, station: "#12 · Keel",  bolasStyle: "duchamp-optic",      fn: renderPortal12 },
    { id: 13, station: "#13 · Arch",  bolasStyle: "cardboard-parallax", fn: renderPortal13 },
    { id: 14, station: "#14 · Tower", bolasStyle: "perec-stage",        fn: renderPortal14 },
    { id: 15, station: "#15 · Lens",  bolasStyle: "duchamp-optic",      fn: renderPortal15 }
  ];

  for (var i = 0; i < DEFINITIONS.length; i++) {
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
        render: function (ctx, W, H, t, state) {
          def.fn(ctx, W || 1280, H || 720, t || 0, state || {});
        }
      };
    })(DEFINITIONS[i]);
  }
})(typeof window !== "undefined" ? window : globalThis);
