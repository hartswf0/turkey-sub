/* ============================================================================
 * Turkey Sub · PAELEO Oulipo + Video-to-Game Two-Stage Controller Branching Engine
 * File: portals/v3-pod5-b.js  (window.PORTAL_V3_GAMES[51..55])
 *
 * Pod 5 · Slice B:
 *   - #51 · Grotto  (daumier-litho      | p51.jpg + atlas-14.webp | Giant Pearl in Stone Clam)
 *   - #52 · Bridge  (cardboard-parallax | p52.jpg + atlas-23.webp | Taut Red Rope in Boulders)
 *   - #53 · Flume   (cardboard-parallax | p53.jpg + atlas-27.webp | Iron Mingus Mill Wheel)
 *   - #54 · Ledge   (cardboard-parallax | p54.jpg + atlas-46.webp | Giant Wrinkled Hellbender)
 *   - #55 · Eddy    (queneau-rostrum    | p55.jpg + atlas-06.webp | GRAND 54-POSTCARD FINALE!)
 *
 * 17 Bespoke Animated Nodes per Porthole (1 Root + 4 Stems + 12 Outcomes = 85 Nodes).
 * STRICT PAELEO BLIND-MODE LAW: Zero canvas text calls anywhere on stage; all emblems,
 * flip-cards, ribbons, stamps, and 54 miniature postcards use pure vector geometry.
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var PORTAL_IDS = [51, 52, 53, 54, 55];

  if (root) {
    root.PORTAL_V3_GAMES = root.PORTAL_V3_GAMES || {};
  }
  if (typeof window !== "undefined" && window !== root) {
    window.PORTAL_V3_GAMES = window.PORTAL_V3_GAMES || {};
  }

  function getStage() {
    return (root && root.SCION_STAGE) || (typeof window !== "undefined" && window.SCION_STAGE) || null;
  }

  function getEngine() {
    return (root && root.BRANCH_GAME) || (typeof window !== "undefined" && window.BRANCH_GAME) || null;
  }

  var _bootStage = getStage();
  if (_bootStage && typeof _bootStage.preloadPortalPlates === "function") {
    _bootStage.preloadPortalPlates(PORTAL_IDS);
  }

  // ============================================================================
  // Shared Tactile Puppet, Scissor-Probe, Volumetric & Postcard Primitives (0 Text!)
  // ============================================================================

  function makeCirclePoly(n, radX, radY, cx, cy) {
    var pts = [];
    var ox = cx == null ? 0 : cx;
    var oy = cy == null ? 0 : cy;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * TAU;
      pts.push([ox + Math.cos(a) * radX, oy + Math.sin(a) * (radY == null ? radX : radY)]);
    }
    return pts;
  }

  function makeNormCirclePoly(n, r) {
    var pts = [];
    var rad = r || 0.48;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * TAU;
      pts.push([0.5 + Math.cos(a) * rad, 0.5 + Math.sin(a) * rad]);
    }
    return pts;
  }

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
    if (pinStart) pins.push({ x: x0, y: y0, r: 4.4, metal: pinStart === true ? "brass" : pinStart });
    if (pinEnd) pins.push({ x: x1, y: y1, r: 4.1, metal: pinEnd === true ? "silver" : pinEnd });
    S.drawCardboardPuppetPiece(ctx, pts, { tone: tone || "#b88a44", ribs: 2, pins: pins });
  }

  // Articulated 2-Bone IK Submarine Brass Scissor-Tongs / Probe
  function drawBrassScissorTongs(ctx, S, B, baseX, baseY, tipX, tipY, jawOpen, t, opts) {
    var cfg = opts || {};
    var l1 = cfg.l1 || 150;
    var l2 = cfg.l2 || 145;
    var bend = cfg.bend == null ? -1 : cfg.bend;
    var ik = S.solveIK2(baseX, baseY, l1, l2, tipX, tipY, bend);

    // Parallel pantograph brass rods
    drawLimbSegment(ctx, S, baseX, baseY, ik.jx, ik.jy, 11, 9, "#c9963e", "brass", "silver");
    drawLimbSegment(ctx, S, ik.jx, ik.jy, ik.ex, ik.ey, 9, 7, "#dfb25b", "silver", "brass");

    // Crossed scissor-jaw pincers at end effector
    var ang = ik.a2;
    var spread = B.clamp(jawOpen == null ? 0.32 : jawOpen, 0.04, 0.95);
    ctx.save();
    ctx.translate(ik.ex, ik.ey);
    ctx.rotate(ang);

    for (var side = -1; side <= 1; side += 2) {
      ctx.save();
      ctx.rotate(side * spread);
      S.drawCutoutPaperEdge(
        ctx,
        [[-6, -5 * side], [30, -14 * side], [46, -4 * side], [38, 4 * side], [-4, 4 * side]],
        "#e6be6a",
        "#14110d",
        { paperRim: 2.0, shadow: false }
      );
      // Soft amber rubber tip pad
      ctx.fillStyle = cfg.tipColor || "#b45309";
      ctx.beginPath();
      ctx.arc(41, -1 * side, 5.2, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    S.drawReinigerFiligreeHinge(ctx, 0, 0, 6.2, { metal: "brass" });
    ctx.restore();

    if (cfg.sparks) {
      B.drawDeterministicParticles(ctx, "brass_sparks", ik.ex, ik.ey, (t % 0.85) + 0.08, {
        count: cfg.sparkCount || 12,
        seed: cfg.seed || 51.7
      });
    }
    return ik;
  }

  // Submarine Nose Spotlight Housing + Volumetric Beam + Lantern Halo
  function drawSubSpotlight(ctx, S, B, srcX, srcY, aimX, aimY, opts) {
    var cfg = opts || {};
    var t = cfg.t || 0;
    var col = cfg.color || "#60a5fa";
    var core = cfg.coreColor || "#eff6ff";
    var intensity = cfg.intensity == null ? 1.05 : cfg.intensity;
    var spread = cfg.spread || 128;

    B.drawVolumetricBeam(ctx, srcX, srcY, aimX, aimY, {
      color: col,
      coreColor: core,
      sourceRadius: cfg.sourceRadius || 20,
      spread: spread,
      intensity: intensity,
      motes: cfg.motes == null ? 20 : cfg.motes,
      t: t,
      seed: cfg.seed || 17.3
    });
    B.drawLanternHalo(ctx, aimX, aimY, spread * 0.75, {
      color: col,
      coreColor: core,
      intensity: intensity * 0.65,
      t: t
    });

    if (cfg.mount !== false) {
      var ang = Math.atan2(aimY - srcY, aimX - srcX);
      ctx.save();
      ctx.translate(srcX, srcY);
      ctx.rotate(ang);
      S.drawCardboardPuppetPiece(
        ctx,
        [[-28, -22], [18, -26], [26, 26], [-28, 22]],
        { tone: "#8f6826", ribs: 2, pin: { x: -8, y: 0, r: 4.8, metal: "brass" } }
      );
      ctx.fillStyle = core;
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(21, 0, 8, 22, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  // Pressurized Crimson Ballast Thruster Jet + Turbulent Current Ribbons + Bubbles
  function drawCrimsonBallastJet(ctx, S, B, srcX, srcY, aimX, aimY, power, t, seed) {
    var p = B.clamp(power == null ? 1 : power, 0, 1.4);
    if (p <= 0.02) return;
    var dx = aimX - srcX;
    var dy = aimY - srcY;
    var ang = Math.atan2(dy, dx);
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;

    ctx.save();
    ctx.translate(srcX, srcY);
    ctx.rotate(ang);

    // Translucent crimson current cone
    var g = ctx.createLinearGradient(0, 0, dist, 0);
    g.addColorStop(0, "rgba(212, 42, 30, " + (0.48 * p).toFixed(3) + ")");
    g.addColorStop(0.6, "rgba(248, 113, 113, " + (0.25 * p).toFixed(3) + ")");
    g.addColorStop(1, "rgba(251, 250, 245, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(dist, -58 * p);
    ctx.lineTo(dist, 58 * p);
    ctx.lineTo(0, 14);
    ctx.closePath();
    ctx.fill();

    // 3 undulating cut-paper current ribbons
    for (var r = -1; r <= 1; r++) {
      ctx.strokeStyle = r === 0 ? "#fbfaf5" : "#ef4444";
      ctx.lineWidth = r === 0 ? 3.4 : 2.5;
      ctx.setLineDash([14, 8]);
      ctx.lineDashOffset = -t * 95;
      ctx.beginPath();
      for (var s = 0; s <= 12; s++) {
        var u = s / 12;
        var rx = u * dist;
        var ry = r * 20 * u * p + Math.sin(u * 8 - t * 9 + r) * 9 * p;
        if (s === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Brass ballast nozzle
    S.drawCardboardPuppetPiece(
      ctx,
      [[-26, -18], [12, -14], [12, 14], [-26, 18]],
      { tone: "#99261e", ribs: 1, pin: { x: -8, y: 0, r: 4.2, metal: "brass" } }
    );
    ctx.restore();

    B.drawDeterministicParticles(ctx, "bubbles", (srcX + aimX) * 0.55, (srcY + aimY) * 0.55, t, {
      count: 16,
      spreadX: 95,
      spreadY: 45,
      loop: true,
      seed: seed || 33.1,
      color: "rgba(254, 226, 226, 0.88)"
    });
  }

  // Ambient Creek Bubbles + Rewind Tape Flash
  function drawAmbientCreekPolish(ctx, S, B, W, H, resolved, seedBase) {
    var t = resolved.t;
    var count = resolved.ballastOn ? 14 : 6;
    ctx.save();
    for (var i = 0; i < count; i++) {
      var s = seedBase * 13.7 + i * 7.31;
      var spd = resolved.ballastOn ? (56 + (i % 4) * 16) : (22 + (i % 4) * 8);
      var bx = 135 + S.hash(s) * (W - 270) + Math.sin(t * 2.0 + i) * 12;
      var by = 585 - (((t * spd) + S.hash(s + 4.2) * 510) % 525);
      var rad = 2.8 + (i % 4) * 1.8;
      ctx.fillStyle = "rgba(251, 250, 245, 0.65)";
      ctx.strokeStyle = "rgba(20, 17, 13, 0.72)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(bx, by, rad, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Rostrum paper-reel rewind flash bars (pure geometry, 0 text!)
    if (resolved.rewindFlash > 0.02) {
      var rf = resolved.rewindFlash;
      ctx.fillStyle = "rgba(251, 250, 245, " + (rf * 0.28).toFixed(3) + ")";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(212, 42, 30, " + (rf * 0.55).toFixed(3) + ")";
      ctx.lineWidth = 3;
      for (var k = 0; k < 4; k++) {
        var ry = 120 + k * 125 + ((t * 240) % 60);
        ctx.beginPath();
        ctx.moveTo(90, ry);
        ctx.lineTo(W - 90, ry);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Canonical Witness & Courier Framing Helpers for Probable / Plausible / Preposterous
  function drawProbableWitness(ctx, S, t, u, opts) {
    var cfg = opts || {};
    var bx = cfg.badgeX != null ? cfg.badgeX : 138;
    var by = cfg.badgeY != null ? cfg.badgeY : 512;
    S.drawTurkeyCutawayBadge(ctx, bx, by, cfg.scale || 0.96, t, {
      dispatch: BClamp(cfg.dispatch != null ? cfg.dispatch : u * 1.4, 0, 1)
    });
    if (cfg.actorX != null) {
      S.drawTurkeyInCorner(ctx, cfg.actorX, cfg.actorY || 505, cfg.actorScale || 1.02, t, {
        flip: !!cfg.flip,
        dispatch: cfg.dispatch != null ? cfg.dispatch : 0.5
      });
    }
  }

  function BClamp(v, lo, hi) {
    return v < lo ? lo : (v > hi ? hi : v);
  }

  // Rich Miniature Stamped Porthole Postcard Cutout (54 distinct procedural creek icons, ZERO text!)
  function drawMiniaturePostcard(ctx, S, x, y, w, h, rot, cardIndex, opts) {
    var cfg = opts || {};
    var palette = ["#d42a1e", "#1d596e", "#0f8f80", "#b45309", "#2563eb", "#7c3aed"];
    var idx = Math.abs(Math.round(cardIndex || 0));
    var col = cfg.color || palette[idx % palette.length];

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);

    S.drawCutoutPaperEdge(
      ctx,
      [[-w * 0.5, -h * 0.5], [w * 0.5, -h * 0.5], [w * 0.5, h * 0.5], [-w * 0.5, h * 0.5]],
      cfg.paper || "#fbfaf5",
      "#14110d",
      { paperRim: cfg.rim != null ? cfg.rim : 2.0, shadow: cfg.shadow !== false, lineWidth: 1.4 }
    );

    // Left miniature painted creek vignette inside tiny brass porthole ring
    var pr = Math.min(w, h) * 0.28;
    var px = -w * 0.21;
    ctx.fillStyle = idx % 2 === 0 ? "#dbeafe" : "#d1fae5";
    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(px, 0, pr, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // 6 distinct iconic silhouettes cycling across the 54 creek stations (0 text!)
    var motif = idx % 6;
    ctx.fillStyle = col;
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 1.1;
    if (motif === 0) {
      // Pearl / Orb
      ctx.beginPath();
      ctx.arc(px, 1, pr * 0.52, 0, TAU);
      ctx.fill();
    } else if (motif === 1) {
      // Diagonal Rope / Bridge
      ctx.beginPath();
      ctx.moveTo(px - pr * 0.7, pr * 0.5);
      ctx.lineTo(px + pr * 0.7, -pr * 0.5);
      ctx.stroke();
    } else if (motif === 2) {
      // Millwheel Spokes
      for (var s = 0; s < 4; s++) {
        var sa = (s / 4) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(px + Math.cos(sa) * pr * 0.7, Math.sin(sa) * pr * 0.7);
        ctx.lineTo(px - Math.cos(sa) * pr * 0.7, -Math.sin(sa) * pr * 0.7);
        ctx.stroke();
      }
    } else if (motif === 3) {
      // Wavy Salamander / Trout
      ctx.beginPath();
      ctx.ellipse(px, 0, pr * 0.65, pr * 0.28, -0.2, 0, TAU);
      ctx.fill();
    } else if (motif === 4) {
      // Shark Fin / Brass Stairs
      ctx.beginPath();
      ctx.moveTo(px - pr * 0.5, pr * 0.45);
      ctx.lineTo(px + pr * 0.1, -pr * 0.55);
      ctx.lineTo(px + pr * 0.55, pr * 0.45);
      ctx.closePath();
      ctx.fill();
    } else {
      // Star / Saucer
      ctx.beginPath();
      ctx.ellipse(px, -pr * 0.1, pr * 0.68, pr * 0.24, 0, 0, TAU);
      ctx.fill();
    }

    // Right-side postage stamp + wavy cancellation lines (pure stroke geometry, 0 text!)
    ctx.fillStyle = col;
    ctx.fillRect(w * 0.18, -h * 0.36, w * 0.20, h * 0.26);
    ctx.strokeStyle = "rgba(20, 17, 13, 0.55)";
    ctx.lineWidth = 1.1;
    for (var ln = 0; ln < 3; ln++) {
      var ly = h * (-0.02 + ln * 0.16);
      ctx.beginPath();
      ctx.moveTo(w * 0.04, ly);
      ctx.lineTo(w * 0.38, ly);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Pure Vector Gold/Crimson Postmark #55 Wax Seal (5+5 Star Pips + Porthole Emblem — 0 Text!)
  function drawRoyalWaxSeal55(ctx, S, x, y, r, goldBlend, t) {
    var gb = BClamp(goldBlend == null ? 1 : goldBlend, 0, 1);
    ctx.save();
    ctx.translate(x, y);
    var lobePts = [];
    for (var i = 0; i < 16; i++) {
      var a = (i / 16) * TAU;
      var rr = r * (1 + 0.08 * Math.sin(i * 5 + 0.7));
      lobePts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    S.drawCutoutPaperEdge(
      ctx,
      lobePts,
      gb > 0.5 ? "#eab308" : "#d42a1e",
      "#14110d",
      { paperRim: 2.2, lineWidth: 1.8 }
    );

    ctx.strokeStyle = gb > 0.5 ? "#fef08a" : "#fca5a5";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, TAU);
    ctx.stroke();

    // 10 tiny perimeter pips (5 left + 5 right = 55 motif, pure dots!)
    ctx.fillStyle = "#14110d";
    for (var p = 0; p < 10; p++) {
      var pa = (p / 10) * TAU + (t || 0) * 0.4;
      ctx.beginPath();
      ctx.arc(Math.cos(pa) * r * 0.84, Math.sin(pa) * r * 0.84, 1.8, 0, TAU);
      ctx.fill();
    }

    // Center miniature envelope + star seal
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 1.6;
    ctx.strokeRect(-r * 0.36, -r * 0.24, r * 0.72, r * 0.48);
    ctx.beginPath();
    ctx.moveTo(-r * 0.36, -r * 0.24);
    ctx.lineTo(0, r * 0.05);
    ctx.lineTo(r * 0.36, -r * 0.24);
    ctx.stroke();
    ctx.restore();
  }

  // ============================================================================
  // PORTHOLE #51 · GROTTO  ("daumier-litho" · p51.jpg + atlas-14.webp)
  // Giant basketball-sized pearl wedged inside fluted stone creek clam
  // ============================================================================
  (function definePortal51() {
    var B = getEngine();
    var S0 = getStage();
    if (!B || !S0) return;

    var PEARL_POLY = makeNormCirclePoly(22, 0.47);

    function drawGrottoClamRig(ctx, S, plates, opts) {
      var cfg = opts || {};
      var hx = cfg.hingeX != null ? cfg.hingeX : 458;
      var hy = cfg.hingeY != null ? cfg.hingeY : 426;
      var openAng = cfg.openAng != null ? cfg.openAng : -0.54;
      var jawChatter = cfg.chatter || 0;
      var drawSphereFn = cfg.drawSphere;
      var t = cfg.t || 0;

      // 1. Back inner shadow cavity of stone clam
      ctx.save();
      ctx.translate(hx, hy);
      S.drawCutoutPaperEdge(
        ctx,
        [[0, 0], [82, -92], [248, -76], [332, -6], [262, 42], [65, 38]],
        "#1b1d21",
        "#0b0c0e",
        { paperRim: 4.2 }
      );
      if (cfg.mantleRuffle) {
        // Ruffled coral-crimson mantle lip when tickled!
        var mPts = [[36, -12]];
        for (var mi = 0; mi <= 12; mi++) {
          var mx = 42 + mi * 22;
          var my = -16 + Math.sin(t * 16 + mi * 1.5) * 9;
          mPts.push([mx, my]);
        }
        mPts.push([306, 12], [42, 14]);
        S.drawCutoutPaperEdge(ctx, mPts, "#e15b64", "#14110d", { paperRim: 1.8, shadow: false });
      }
      ctx.restore();

      // 2. Sandwiched Sphere / Pearl / Egg / Bowling Ball / Moon-Core
      if (typeof drawSphereFn === "function") {
        drawSphereFn(hx + 178, hy - 48);
      }

      // 3. Upper Hinged Scalloped Stone Clam Valve
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(openAng + jawChatter);
      S.drawCardboardPuppetPiece(
        ctx,
        [[0, 0], [34, -84], [118, -126], [220, -118], [308, -72], [338, -18], [272, 6], [192, -12], [108, 2]],
        { tone: "#b4b2aa", ribs: 4 }
      );
      S.drawEngravingCrosshatch(ctx, 275, 92, 0.22, 6, { x: 35, y: -112 });
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2.0;
      for (var sr = 0; sr < 5; sr++) {
        ctx.beginPath();
        ctx.moveTo(8, -4);
        ctx.quadraticCurveTo(120 + sr * 34, -92 + sr * 8, 145 + sr * 44, -18 - (4 - sr) * 14);
        ctx.stroke();
      }
      ctx.restore();

      // 4. Lower Front Occluding Scalloped Stone Clam Lip + Brass Filigree Hinge
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(-jawChatter * 0.45);
      S.drawCardboardPuppetPiece(
        ctx,
        [[-8, -6], [66, 8], [142, -4], [224, 10], [318, -12], [342, 22], [268, 72], [148, 82], [42, 62]],
        { tone: "#94928a", ribs: 3 }
      );
      S.drawEngravingCrosshatch(ctx, 285, 65, 0.24, 6, { x: 28, y: 8 });
      S.drawReinigerFiligreeHinge(ctx, 0, 0, 9.5, { metal: "brass" });
      ctx.restore();
    }

    function drawRealPearlOrb(ctx, S, pImg, cx, cy, r, t, opts) {
      var cfg = opts || {};
      var rot = cfg.rot || 0;
      if (cfg.halo !== false) {
        B.drawLanternHalo(ctx, cx, cy, r * 1.85, {
          color: cfg.haloColor || "#fde68a",
          coreColor: "#fffbeb",
          intensity: cfg.haloIntensity != null ? cfg.haloIntensity : 0.85,
          t: t
        });
      }
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      S.drawScissorCutout(
        ctx, pImg,
        232, 246, 176, 178,
        -r, -r, r * 2, r * 2,
        PEARL_POLY,
        { haloWidth: 5.0, stroke: "#14110d", lineWidth: 2.2 }
      );
      ctx.strokeStyle = "rgba(20, 17, 13, 0.32)";
      ctx.lineWidth = 1.3;
      for (var hi = 0; hi < 6; hi++) {
        ctx.beginPath();
        ctx.arc(4, 6, r - 9 - hi * 4.5, 0.35, 2.35);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.beginPath();
      ctx.ellipse(-r * 0.32, -r * 0.34, r * 0.22, r * 0.13, -0.5, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    B.definePortalGame(51, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var aImg = plates.atlasImg;
        var pImg = plates.portholeImg;
        var swX = Math.sin(t * 0.55) * 8;
        var swY = Math.cos(t * 0.42) * 4;

        // Explicit BOLAS Daumier-Litho Cream & Ink-Band Stage
        S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 51, t, resolved, {
          bandTop: 102,
          bandBot: 574
        });

        // Plane 1: Karel Zeman "Invention for Destruction" (atlas-14.webp) vault & crane cutouts
        S.drawScissorCutout(
          ctx, aImg,
          105, 8, 370, 390,
          92 + swX * 0.4, 114 + swY * 0.4, 430, 368,
          [[0.04, 0.10], [0.46, 0.02], [0.95, 0.06], [0.98, 0.88], [0.62, 0.96], [0.06, 0.94]],
          { filter: "litho", haloWidth: 4.5, tint: "rgba(12,14,18,0.12)" }
        );
        S.drawScissorCutout(
          ctx, aImg,
          430, 12, 295, 385,
          782 + swX * 0.4, 112 + swY * 0.4, 392, 370,
          [[0.06, 0.05], [0.94, 0.03], [0.97, 0.92], [0.42, 0.97], [0.03, 0.88]],
          { filter: "litho", haloWidth: 4.5, tint: "rgba(12,14,18,0.10)" }
        );

        B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.20, color: "#bae6fd", topY: 106 });
        B.drawDepthFog(ctx, W, H, t, { density: 0.13, color: "#cbd5e1" });

        // Plane 2: Stalactite cave root walls + pebble floor from p51.jpg
        S.drawScissorCutout(
          ctx, pImg,
          96, 108, 175, 355,
          56 + swX * 0.8, 94 + swY * 0.8, 232, 430,
          [[0.08, 0.03], [0.92, 0.06], [0.74, 0.44], [0.88, 0.92], [0.10, 0.97], [0.02, 0.52]],
          { filter: "litho", haloWidth: 4.6 }
        );
        S.drawScissorCutout(
          ctx, pImg,
          382, 114, 156, 355,
          988 + swX * 0.8, 98 + swY * 0.8, 224, 426,
          [[0.12, 0.05], [0.94, 0.04], [0.97, 0.56], [0.88, 0.96], [0.14, 0.93], [0.24, 0.48]],
          { filter: "litho", haloWidth: 4.6 }
        );
        S.drawScissorCutout(
          ctx, pImg,
          175, 422, 290, 112,
          372 + swX, 474 + swY, 520, 112,
          [[0.03, 0.22], [0.32, 0.06], [0.72, 0.08], [0.97, 0.24], [0.95, 0.94], [0.05, 0.95]],
          { filter: "litho", haloWidth: 4.0 }
        );

        // Articulated Zeman Grotto Crane Arm upper-right
        var cIK = S.solveIK2(955, 148, 134, 124, 745 + Math.sin(t * 1.3) * 22, 245 + Math.cos(t * 1.6) * 14, -1);
        drawLimbSegment(ctx, S, 955, 148, cIK.jx, cIK.jy, 10, 8.5, "#dcd8ce", "brass", "silver");
        drawLimbSegment(ctx, S, cIK.jx, cIK.jy, cIK.ex, cIK.ey, 8, 6, "#b8b4aa", "silver", "brass");

        drawAmbientCreekPolish(ctx, S, B, W, H, resolved, 51);
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawGrottoClamRig(ctx, S, plates, {
          t: t,
          openAng: -0.56 + Math.sin(t * 1.8) * 0.04,
          drawSphere: function (sx, sy) {
            drawRealPearlOrb(ctx, S, plates.portholeImg, sx, sy, 76, t);
          }
        });
        S.drawBrookTrout(ctx, 1020 + Math.sin(t * 1.9) * 14, 330 + Math.cos(t * 2.3) * 6, 0.92, t, false);
      },

      stems: {
        // [✕] Candling Beam Scan: concentrated blue beam turns creamy pearl warm & translucent
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = B.easeOutCubic(resolved.stemU);
          var sx = 636, sy = 378;
          drawGrottoClamRig(ctx, S, plates, {
            t: t,
            openAng: -0.62,
            drawSphere: function (px, py) {
              sx = px; sy = py;
              drawRealPearlOrb(ctx, S, plates.portholeImg, px, py, 76, t, {
                haloColor: "#60a5fa",
                haloIntensity: 0.7 + su * 0.8
              });
              // Translucent warm amber candling core building inside sphere
              ctx.save();
              ctx.globalAlpha = 0.25 + su * 0.58;
              var cg = ctx.createRadialGradient(px - 10, py - 6, 6, px, py, 74);
              cg.addColorStop(0, "#fffbeb");
              cg.addColorStop(0.45, "#fbbf24");
              cg.addColorStop(0.85, "#3b82f6");
              cg.addColorStop(1, "rgba(37,99,235,0)");
              ctx.fillStyle = cg;
              ctx.beginPath();
              ctx.arc(px, py, 74, 0, TAU);
              ctx.fill();
              // Concentric mother-of-pearl rings
              ctx.strokeStyle = "#fef3c7";
              ctx.lineWidth = 2.0;
              for (var r = 1; r <= 3; r++) {
                ctx.beginPath();
                ctx.arc(px, py, r * 19 * su, 0, TAU);
                ctx.stroke();
              }
              ctx.restore();
            }
          });
          drawSubSpotlight(ctx, S, B, 210, 295, sx, sy, {
            t: t,
            color: "#2563eb",
            coreColor: "#dbeafe",
            spread: 98,
            intensity: 0.55 + su * 0.75,
            seed: 51.1
          });
        },

        // [○] Tickle Clam Hinge: bubbly crimson jet tickles mantle edge until stone jaws chatter
        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = resolved.stemU;
          var chatter = Math.sin(t * 24) * 0.11 * B.clamp(su * 1.4, 0.2, 1);
          drawGrottoClamRig(ctx, S, plates, {
            t: t,
            openAng: -0.58,
            chatter: chatter,
            mantleRuffle: true,
            drawSphere: function (px, py) {
              drawRealPearlOrb(ctx, S, plates.portholeImg, px, py - Math.abs(Math.sin(t * 12)) * 12 * su, 75, t);
            }
          });
          drawCrimsonBallastJet(ctx, S, B, 995, 315, 725, 392, 0.45 + su * 0.65, t, 51.2);
        },

        // [△] Measure Giant Pearl: Mail Snail crawls around equator unrolling yellow tailor's tape
        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = B.clamp(resolved.stemU, 0, 1);
          var px = 636, py = 378;
          drawGrottoClamRig(ctx, S, plates, {
            t: t,
            openAng: -0.60,
            drawSphere: function (ox, oy) {
              px = ox; py = oy;
              drawRealPearlOrb(ctx, S, plates.portholeImg, ox, oy, 76, t);
              // Yellow cloth tailor's measuring tape wrapping equator!
              var spanW = B.lerp(18, 152, su);
              ctx.save();
              S.drawCutoutPaperEdge(
                ctx,
                [[ox - 76, oy - 9], [ox - 76 + spanW, oy - 9], [ox - 76 + spanW, oy + 9], [ox - 76, oy + 9]],
                "#facc15",
                "#14110d",
                { paperRim: 1.8, shadow: false }
              );
              ctx.strokeStyle = "#14110d";
              ctx.lineWidth = 1.6;
              for (var tk = 6; tk < spanW - 4; tk += 10) {
                ctx.beginPath();
                ctx.moveTo(ox - 76 + tk, oy - 9);
                ctx.lineTo(ox - 76 + tk, oy - (tk % 20 === 0 ? 1 : 4));
                ctx.stroke();
              }
              ctx.restore();
            }
          });
          B.drawSnailSilverTrail(ctx, 355, 488, px - 68 + su * 136, py - 14, su, t, { arc: 22 });
          S.drawMailSnail(ctx, px - 68 + su * 136, py - 18, 1.08, t, { postcard: false });
        },

        // [□] Wedge Brass Tongs: scissor-tongs slip beside sphere and rotate it a quarter-turn
        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = B.easeInOutCubic(resolved.stemU);
          var px = 636, py = 378;
          drawGrottoClamRig(ctx, S, plates, {
            t: t,
            openAng: -0.66 - su * 0.08,
            drawSphere: function (ox, oy) {
              px = ox; py = oy;
              drawRealPearlOrb(ctx, S, plates.portholeImg, ox, oy, 76, t, {
                rot: su * Math.PI * 0.52
              });
            }
          });
          drawBrassScissorTongs(ctx, S, B, 995, 505, px + 56, py + 4, 0.42 - su * 0.16, t, {
            sparks: true,
            seed: 51.4
          });
        }
      },

      outcomes: {
        x: {
          // Not A Giant Boiled Egg: candling shows mother-of-pearl spirals (zero yolk!), salt-shaker tucked away
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            var sx = 636, sy = 378;
            drawGrottoClamRig(ctx, S, plates, {
              t: t,
              openAng: -0.68,
              drawSphere: function (ox, oy) {
                sx = ox; sy = oy;
                drawRealPearlOrb(ctx, S, plates.portholeImg, ox, oy, 78, t, {
                  haloColor: "#fef08a",
                  haloIntensity: 1.25
                });
                // Candled iridescent mother-of-pearl spiral inside (0 yolk!)
                ctx.save();
                ctx.strokeStyle = "#38bdf8";
                ctx.lineWidth = 2.6;
                ctx.beginPath();
                for (var i = 0; i <= 42; i++) {
                  var a = (i / 42) * TAU * 2.5 + t * 2.2;
                  var r = (i / 42) * 58;
                  var xx = ox + Math.cos(a) * r, yy = oy + Math.sin(a) * r;
                  if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
                }
                ctx.stroke();
                ctx.restore();
              }
            });
            drawSubSpotlight(ctx, S, B, 195, 285, sx, sy, {
              t: t, color: "#3b82f6", coreColor: "#fef9c3", spread: 112, intensity: 1.15
            });
            // X-ray verification window upper-right confirming NO boiled egg yolk (crossed-out egg icon)
            B.drawXRayOverlay(ctx, 925, 235, 170, 125, B.clamp(u * 1.8, 0, 1), function (c, cx, cy) {
              c.fillStyle = "#fde047";
              c.beginPath(); c.arc(cx, cy, 24, 0, TAU); c.fill();
              c.strokeStyle = "#ef4444"; c.lineWidth = 5;
              c.beginPath();
              c.moveTo(cx - 34, cy - 34); c.lineTo(cx + 34, cy + 34);
              c.moveTo(cx + 34, cy - 34); c.lineTo(cx - 34, cy + 34);
              c.stroke();
            }, { t: t });
            // Nervous cardboard diner salt-shaker being lowered/put away
            ctx.save();
            ctx.translate(295, B.lerp(425, 535, B.clamp(u * 1.4, 0, 1)));
            ctx.rotate(-0.45);
            S.drawCutoutPaperEdge(ctx, [[-16, -24], [16, -24], [20, 22], [-20, 22]], "#e6e3da", "#14110d", { paperRim: 2.4 });
            S.drawCardboardPuppetPiece(ctx, [[-15, -34], [15, -34], [17, -23], [-17, -23]], { tone: "#9ca3af", ribs: 1 });
            ctx.restore();
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508 });
          },

          // Glowing Grotto Moon-Lamp: pearl radiates moonbeams while Brook Trout & Mail Snail read postcards
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            var sx = 636, sy = 374;
            // 8 soft pearlescent moonbeam rays radiating across grotto
            for (var r = 0; r < 8; r++) {
              var ra = (r / 8) * TAU + t * 0.28;
              B.drawVolumetricBeam(ctx, sx, sy, sx + Math.cos(ra) * 340, sy + Math.sin(ra) * 220, {
                color: "#bae6fd", coreColor: "#fffbeb", sourceRadius: 28, spread: 64, intensity: 0.42, motes: 6, t: t, seed: r * 5.1
              });
            }
            drawGrottoClamRig(ctx, S, plates, {
              t: t,
              openAng: -0.72,
              drawSphere: function (ox, oy) {
                drawRealPearlOrb(ctx, S, plates.portholeImg, ox, oy, 80, t, {
                  haloColor: "#e0f2fe", haloIntensity: 1.55
                });
              }
            });
            // Cozy reading nook on right reef: open postcard album + Brook Trout + Mail Snail
            for (var pc = 0; pc < 3; pc++) {
              drawMiniaturePostcard(ctx, S, 855 + pc * 48, 468 - (pc % 2) * 14, 54, 38, -0.15 + pc * 0.14, pc + 2);
            }
            B.drawSnailSilverTrail(ctx, 740, 505, 865, 492, B.clamp(u * 1.5, 0.3, 1), t, { arc: 12 });
            S.drawMailSnail(ctx, 868, 492, 1.15, t, { hasReply: true });
            S.drawBrookTrout(ctx, 975, 392 + Math.sin(t * 2.2) * 8, 1.06, t, false);
          },

          // Incubating Baby Saucer Core: translucent moon-egg silhouettes a wiggling teacup 3-eyed saucer inside!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var sx = 636, sy = 360;
            S.drawAlienSaucer(ctx, 636, 102, 1.22, t, sx, sy, { beamSpread: 150 });
            B.drawTractorRings(ctx, 636, 125, sx, sy, t, { spread: 135, rings: 5 });
            drawSubSpotlight(ctx, S, B, 195, 315, sx, sy, {
              t: t, color: "#2563eb", coreColor: "#fde68a", spread: 95, intensity: 0.95
            });
            drawGrottoClamRig(ctx, S, plates, {
              t: t,
              openAng: -0.78,
              drawSphere: function (ox, oy) {
                // Translucent cosmic moon-egg shell
                B.drawLanternHalo(ctx, ox, oy, 145, { color: "#34d399", coreColor: "#fef08a", intensity: 1.35, t: t });
                S.drawCutoutPaperEdge(ctx, makeCirclePoly(22, 80, 84, ox, oy), "#ecfdf5", "#0b0c0e", { paperRim: 4.8 });
                // Adorable teacup-sized baby 3-eyed saucer wiggling landing legs inside!
                ctx.save();
                ctx.translate(ox, oy + Math.sin(t * 5.2) * 5);
                ctx.rotate(Math.sin(t * 4.4) * 0.16);
                ctx.strokeStyle = "#14110d";
                ctx.lineWidth = 2.4;
                for (var lg = -1; lg <= 1; lg++) {
                  var wig = Math.sin(t * 9 + lg) * 5;
                  ctx.beginPath();
                  ctx.moveTo(lg * 18, 8);
                  ctx.lineTo(lg * 24 + wig, 26);
                  ctx.stroke();
                }
                S.drawCutoutPaperEdge(ctx, [[-38, 4], [-24, -6], [24, -6], [38, 4], [26, 13], [-26, 13]], "#f59e0b", "#14110d", { paperRim: 1.8, shadow: false });
                ctx.fillStyle = "#86efac";
                ctx.beginPath(); ctx.arc(0, -5, 20, Math.PI, 0); ctx.fill(); ctx.stroke();
                for (var e = -1; e <= 1; e++) {
                  ctx.fillStyle = "#ffffff";
                  ctx.beginPath(); ctx.arc(e * 6.5, -12, 3.2, 0, TAU); ctx.fill();
                  ctx.fillStyle = "#14110d";
                  ctx.beginPath(); ctx.arc(e * 6.5, -12, 1.4, 0, TAU); ctx.fill();
                }
                ctx.restore();
              }
            });
            S.drawMailSnail(ctx, 885, 138, 1.05, t, { flip: true, hasReply: true, hasAlienStamp: true });
          }
        },

        o: {
          // Giggling Stone Clam Sneeze: clam sneezes orb onto soft green moss cushion while Turkey ducks!
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.35, 0, 1);
            var rollU = B.easeOutBack(B.clamp((u - 0.12) / 0.75, 0, 1));
            var orbX = B.lerp(636, 875, rollU);
            var orbY = B.lerp(378, 442, rollU) - Math.sin(rollU * Math.PI) * 95;

            // Clam flung wide open in comic AH-CHOO spray!
            drawGrottoClamRig(ctx, S, plates, {
              t: t,
              openAng: -0.92 + Math.sin(t * 10) * 0.05,
              mantleRuffle: true,
              drawSphere: null
            });
            B.drawVolumetricBeam(ctx, 560, 395, 895, 345, {
              color: "#bae6fd", coreColor: "#ffffff", spread: 115, intensity: 0.9, t: t, seed: 51.5
            });
            B.drawDeterministicParticles(ctx, "bubbles", 720, 385, t, { count: 22, loop: true, spreadX: 120, seed: 51.6 });

            // Velvety emerald moss cushion catching the harmless white sphere
            S.drawCutoutPaperEdge(
              ctx,
              [[785, 515], [805, 468], [875, 456], [948, 468], [968, 515]],
              "#3f6212",
              "#14110d",
              { paperRim: 3.5 }
            );
            drawRealPearlOrb(ctx, S, plates.portholeImg, orbX, orbY, 72, t, { rot: rollU * 3.8 });
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508, actorX: 255, actorY: 512, actorScale: 0.94 });
          },

          // Clam Castanet Pearl Polka: clam bounces pearl like beach ball while Trout twirls & Snail plays harmonica
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            var beatBounce = Math.abs(Math.sin(t * 5.6));
            drawGrottoClamRig(ctx, S, plates, {
              t: t,
              openAng: -0.52 - beatBounce * 0.28,
              mantleRuffle: true,
              drawSphere: function (ox, oy) {
                // Rosy clam tongue bouncing glossy pearl like a beach ball!
                S.drawCutoutPaperEdge(
                  ctx,
                  [[ox - 54, oy + 42], [ox, oy + 12 - beatBounce * 18], [ox + 62, oy + 38], [ox, oy + 56]],
                  "#f43f5e",
                  "#14110d",
                  { paperRim: 2.0, shadow: false }
                );
                drawRealPearlOrb(ctx, S, plates.portholeImg, ox + 8, oy - 22 - beatBounce * 68, 68, t, {
                  rot: t * 2.4, haloColor: "#fda4af"
                });
              }
            });
            // Twirling Brook Trout + Harmonica Mail Snail + floating vector music eighth-note bubbles
            S.drawBrookTrout(ctx, 945 + Math.cos(t * 3.6) * 34, 325 + Math.sin(t * 3.6) * 28, 1.08, t, false, {
              tilt: Math.sin(t * 5.6) * 0.32
            });
            B.drawSnailSilverTrail(ctx, 310, 512, 435, 505, B.clamp(u * 1.5, 0.4, 1), t, { arc: 10 });
            S.drawMailSnail(ctx, 435, 504, 1.18, t, { hasReply: true });
            // Brass harmonica at Snail's mouth + rising geometric ring-notes
            S.drawCutoutPaperEdge(ctx, [[458, 492], [488, 492], [488, 502], [458, 502]], "#eab308", "#14110d", { paperRim: 1.4, shadow: false });
            B.drawDeterministicParticles(ctx, "confetti", 645, 290, t, { count: 14, loop: true, seed: 51.7 });
          },

          // Clam Fusion Bubble Reactor: prism ray + clam claps puff 9 levitating rainbow mini-pearls in orbit!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var sx = 636, sy = 368;
            S.drawAlienSaucer(ctx, 636, 102, 1.24, t, sx, sy, { beamSpread: 165 });
            B.drawTractorRings(ctx, 636, 126, sx, sy, t, { spread: 148, rings: 6 });

            var orbCols = ["#f472b6", "#34d399", "#60a5fa", "#fbbf24", "#c084fc"];
            // Back pass of orbiting mini-pearls
            for (var b = 0; b < 9; b++) {
              var ba = t * 2.1 + (b / 9) * TAU;
              if (Math.sin(ba) < 0) {
                var bx = sx + Math.cos(ba) * (165 + (b % 2) * 36);
                var by = sy - 24 + Math.sin(ba) * 54;
                S.drawCutoutPaperEdge(ctx, makeCirclePoly(14, 16, 16, bx, by), orbCols[b % 5], "#14110d", { paperRim: 2.2, shadow: false });
              }
            }
            drawGrottoClamRig(ctx, S, plates, {
              t: t,
              openAng: -0.62 - Math.abs(Math.sin(t * 7)) * 0.22,
              mantleRuffle: true,
              drawSphere: function (ox, oy) {
                drawRealPearlOrb(ctx, S, plates.portholeImg, ox, oy, 74, t, {
                  haloColor: "#a855f7", haloIntensity: 1.5
                });
              }
            });
            // Front pass of orbiting iridescent mini-pearls
            for (var f = 0; f < 9; f++) {
              var fa = t * 2.1 + (f / 9) * TAU;
              if (Math.sin(fa) >= 0) {
                var fx = sx + Math.cos(fa) * (165 + (f % 2) * 36);
                var fy = sy - 24 + Math.sin(fa) * 54;
                B.drawLanternHalo(ctx, fx, fy, 36, { color: orbCols[f % 5], intensity: 0.75, t: t });
                S.drawCutoutPaperEdge(ctx, makeCirclePoly(14, 19, 19, fx, fy), orbCols[f % 5], "#14110d", { paperRim: 2.5 });
              }
            }
          }
        },

        triangle: {
          // Oversized Parcel Weight Check: yellow tape + bent postal scale + heavy anvil warning sticker (0 text!)
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            drawGrottoClamRig(ctx, S, plates, {
              t: t,
              openAng: -0.64,
              drawSphere: function (ox, oy) {
                drawRealPearlOrb(ctx, S, plates.portholeImg, ox, oy, 78, t);
                // Snug yellow cloth measuring tape around equator
                S.drawCutoutPaperEdge(ctx, [[ox - 78, oy - 8], [ox + 78, oy - 8], [ox + 78, oy + 8], [ox - 78, oy + 8]], "#facc15", "#14110d", { paperRim: 1.8 });
                // Oversized parcel crimson-and-cream diamond emblem sticker (iron weight icon, 0 text!)
                S.drawCutoutPaperEdge(ctx, [[ox, oy - 48], [ox + 36, oy - 12], [ox, oy + 24], [ox - 36, oy - 12]], "#fbfaf5", "#d42a1e", { paperRim: 2.0, lineWidth: 3.0 });
                ctx.fillStyle = "#14110d";
                ctx.beginPath();
                ctx.moveTo(ox - 16, oy + 4); ctx.lineTo(ox - 10, oy - 16); ctx.lineTo(ox + 10, oy - 16); ctx.lineTo(ox + 16, oy + 4);
                ctx.closePath(); ctx.fill();
                ctx.strokeStyle = "#14110d"; ctx.lineWidth = 2.4;
                ctx.beginPath(); ctx.arc(ox, oy - 18, 6, Math.PI, 0); ctx.stroke();
              }
            });
            // Straining brass postal dial scale on right pegged to red zone!
            ctx.save();
            ctx.translate(865, 425);
            S.drawCardboardPuppetPiece(ctx, [[-42, 45], [-34, -36], [34, -36], [42, 45]], { tone: "#b88a44", ribs: 2 });
            ctx.fillStyle = "#fbfaf5"; ctx.strokeStyle = "#14110d"; ctx.lineWidth = 2.2;
            ctx.beginPath(); ctx.arc(0, -4, 28, 0, TAU); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = "#d42a1e"; ctx.lineWidth = 3.2;
            var needleAng = 2.1 + Math.sin(t * 18) * 0.08;
            ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(Math.cos(needleAng) * 22, -4 + Math.sin(needleAng) * 22); ctx.stroke();
            ctx.restore();

            S.drawMailSnail(ctx, 455, 495, 1.16, t, { hasReply: false });
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508 });
          },

          // World-Record Creek Pearl Ribbon: giant pleated blue county-fair rosette pinned to proud clam!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            drawGrottoClamRig(ctx, S, plates, {
              t: t,
              openAng: -0.66,
              drawSphere: function (ox, oy) {
                drawRealPearlOrb(ctx, S, plates.portholeImg, ox, oy, 78, t, { haloColor: "#93c5fd", haloIntensity: 1.2 });
              }
            });
            // Giant County-Fair Blue First-Prize Rosette Ribbon pinned to upper clam shell!
            var rx = 555, ry = 315;
            ctx.save();
            ctx.translate(rx, ry);
            ctx.rotate(Math.sin(t * 2.8) * 0.06);
            // Fluttering twin blue ribbon tails
            S.drawCutoutPaperEdge(ctx, [[-22, 18], [-42, 92], [-20, 78], [-6, 96], [0, 22]], "#1d4ed8", "#14110d", { paperRim: 2.0 });
            S.drawCutoutPaperEdge(ctx, [[0, 22], [12, 96], [26, 78], [46, 90], [22, 18]], "#2563eb", "#14110d", { paperRim: 2.0 });
            // Pleated 16-point rosette star
            var rosPts = [];
            for (var i = 0; i < 24; i++) {
              var a = (i / 24) * TAU;
              var rr = i % 2 === 0 ? 44 : 33;
              rosPts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
            }
            S.drawCutoutPaperEdge(ctx, rosPts, "#2563eb", "#14110d", { paperRim: 2.6 });
            S.drawCutoutPaperEdge(ctx, makeCirclePoly(16, 22, 22, 0, 0), "#facc15", "#14110d", { paperRim: 1.5, shadow: false });
            S.drawSplitPin(ctx, 0, 0, 5.5, { metal: "brass" });
            ctx.restore();

            B.drawDeterministicParticles(ctx, "confetti", 640, 260, t, { count: 18, loop: true, seed: 51.8 });
            S.drawBrookTrout(ctx, 965, 345 + Math.sin(t * 2.5) * 10, 1.08, t, false);
            S.drawMailSnail(ctx, 435, 496, 1.18, t, { hasReply: true });
          },

          // Measured Planetoid Map Globe: yellow equator tape + projected emerald continents & grid on pearl!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var sx = 636, sy = 366;
            S.drawAlienSaucer(ctx, 636, 102, 1.24, t, sx, sy, { beamSpread: 158 });
            B.drawTractorRings(ctx, 636, 126, sx, sy, t, { spread: 142, rings: 5 });

            drawGrottoClamRig(ctx, S, plates, {
              t: t,
              openAng: -0.74,
              drawSphere: function (ox, oy) {
                B.drawLanternHalo(ctx, ox, oy, 148, { color: "#10b981", coreColor: "#fef08a", intensity: 1.3, t: t });
                // Pearl transformed into glowing turquoise-and-cream Planet Clam globe!
                S.drawCutoutPaperEdge(ctx, makeCirclePoly(24, 80, 80, ox, oy), "#e0f2fe", "#0b0c0e", { paperRim: 4.8 });
                ctx.save();
                ctx.beginPath(); ctx.arc(ox, oy, 78, 0, TAU); ctx.clip();
                var drift = ((t * 28) % 160) - 80;
                // Glowing emerald continents drifting across globe
                S.drawCutoutPaperEdge(ctx, [[ox - 55 + drift, oy - 45], [ox - 12 + drift, oy - 52], [ox + 6 + drift, oy - 8], [ox - 24 + drift, oy + 42], [ox - 52 + drift, oy + 14]], "#10b981", "#14110d", { paperRim: 1.6, shadow: false });
                S.drawCutoutPaperEdge(ctx, [[ox + 22 + drift, oy - 36], [ox + 68 + drift, oy - 18], [ox + 54 + drift, oy + 38], [ox + 18 + drift, oy + 18]], "#059669", "#14110d", { paperRim: 1.6, shadow: false });
                // Latitude / longitude cartography grid
                ctx.strokeStyle = "rgba(37, 99, 235, 0.45)";
                ctx.lineWidth = 1.5;
                for (var lat = -48; lat <= 48; lat += 24) {
                  ctx.beginPath(); ctx.moveTo(ox - 80, oy + lat); ctx.lineTo(ox + 80, oy + lat); ctx.stroke();
                }
                for (var lon = -2; lon <= 2; lon++) {
                  ctx.beginPath(); ctx.ellipse(ox, oy, Math.abs(lon) * 28 + 8, 78, 0, 0, TAU); ctx.stroke();
                }
                ctx.restore();
                // Yellow cloth Prime Meridian Equator Tape
                S.drawCutoutPaperEdge(ctx, [[ox - 82, oy - 6], [ox + 82, oy - 6], [ox + 82, oy + 6], [ox - 82, oy + 6]], "#facc15", "#14110d", { paperRim: 1.6 });
              }
            });
            S.drawMailSnail(ctx, 845, 488, 1.16, t, { flip: true, hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          // Three Finger-Holes Bowling Ball: brass tongs rotate sphere revealing 3 black finger holes!
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            var rotU = B.easeOutBack(B.clamp(u * 1.6, 0, 1));
            var sx = 636, sy = 378;
            drawGrottoClamRig(ctx, S, plates, {
              t: t,
              openAng: -0.66,
              drawSphere: function (ox, oy) {
                sx = ox; sy = oy;
                S.drawCutoutPaperEdge(ctx, makeCirclePoly(24, 78, 78, ox, oy), "#f5f3ec", "#14110d", { paperRim: 5.0, lineWidth: 2.5 });
                S.drawEngravingCrosshatch(ctx, 110, 52, 0.16, 5, { x: ox - 55, y: oy + 18 });
                // 3 iconic black drilled bowling finger-holes + red crown emblem (0 text!)
                var hxOff = B.lerp(48, 0, rotU) + Math.sin(t * 3) * 4;
                var holes = [[-15, -18, 10.5], [15, -16, 10.5], [1, 12, 12.0]];
                for (var i = 0; i < 3; i++) {
                  ctx.fillStyle = "#0b0c0e";
                  ctx.strokeStyle = "#6e675f";
                  ctx.lineWidth = 2.2;
                  ctx.beginPath();
                  ctx.ellipse(ox + hxOff + holes[i][0], oy + holes[i][1], holes[i][2], holes[i][2] * 0.86, -0.1, 0, TAU);
                  ctx.fill();
                  ctx.stroke();
                }
                // Red bowling crown icon below holes
                S.drawCutoutPaperEdge(
                  ctx,
                  [[ox + hxOff - 18, oy + 42], [ox + hxOff - 22, oy + 28], [ox + hxOff - 8, oy + 35], [ox + hxOff, oy + 25], [ox + hxOff + 8, oy + 35], [ox + hxOff + 22, oy + 28], [ox + hxOff + 18, oy + 42]],
                  "#d42a1e", "#14110d", { paperRim: 1.4, shadow: false }
                );
              }
            });
            drawBrassScissorTongs(ctx, S, B, 995, 505, sx + 64, sy + 6, 0.28, t, { sparks: true, seed: 51.9 });
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508 });
          },

          // Creek Alley Ten-Pin Strike: white bowling ball rolls down limestone lane scattering pinecones!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.25, 0, 1);
            var rollX = B.lerp(620, 935, u);
            var rollY = B.lerp(405, 452, u);
            var hit = u > 0.48 ? (u - 0.48) / 0.52 : 0;

            // Empty open clam on left + flat limestone bowling alley lane on right
            drawGrottoClamRig(ctx, S, plates, { t: t, openAng: -0.72, drawSphere: null });
            S.drawCardboardPuppetPiece(
              ctx,
              [[580, 482], [1085, 462], [1120, 522], [560, 528]],
              { tone: "#c7c2b4", ribs: 2 }
            );

            // Scattering sunken pinecone bowling pins!
            for (var p = 0; p < 6; p++) {
              var basePX = 905 + (p % 3) * 38 + Math.floor(p / 3) * 18;
              var basePY = 458 - Math.floor(p / 3) * 22;
              var flyX = basePX + hit * (p - 2.2) * 58;
              var flyY = basePY - Math.sin(hit * Math.PI) * (65 + p * 18);
              var flyRot = hit * (p % 2 === 0 ? 2.4 : -2.1);
              ctx.save();
              ctx.translate(flyX, flyY);
              ctx.rotate(flyRot);
              S.drawCardboardPuppetPiece(
                ctx,
                [[-14, 0], [-18, -28], [-10, -56], [0, -68], [10, -56], [18, -28], [14, 0]],
                { tone: "#784c2a", ribs: 3, shadow: false }
              );
              ctx.fillStyle = "#d42a1e";
              ctx.fillRect(-12, -46, 24, 5);
              ctx.restore();
            }

            // Rolling 3-hole white bowling ball
            ctx.save();
            ctx.translate(rollX, rollY);
            ctx.rotate(u * 8.5);
            S.drawCutoutPaperEdge(ctx, makeCirclePoly(20, 56, 56, 0, 0), "#f8f6ee", "#14110d", { paperRim: 4.0 });
            ctx.fillStyle = "#0b0c0e";
            ctx.beginPath(); ctx.arc(-10, -14, 7.5, 0, TAU); ctx.arc(10, -12, 7.5, 0, TAU); ctx.arc(0, 8, 8.5, 0, TAU); ctx.fill();
            ctx.restore();

            if (hit > 0.05) {
              B.drawDeterministicParticles(ctx, "kintsugi", 945, 430, hit * 0.9, { count: 18, seed: 51.95 });
            }
            // Brook Trout bowler + Mail Snail holding crossed-X strike card (pure vector X!)
            S.drawBrookTrout(ctx, 515, 355, 1.05, t, true);
            S.drawMailSnail(ctx, 415, 502, 1.16, t, { hasReply: true });
            S.drawCutoutPaperEdge(ctx, [[395, 435], [445, 435], [445, 475], [395, 475]], "#fbfaf5", "#14110d", { paperRim: 2.0 });
            B.drawGeometricSymbol(ctx, "x", 420, 455, 18, "#d42a1e", 3.6);
          },

          // Cosmic Billiards Trick Shot: neon emerald pool-table grid + tractor cue-stick banking cue-ball into star-pocket!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.2, 0, 1);
            S.drawAlienSaucer(ctx, 540, 98, 1.22, t, 636, 390, { beamSpread: 180 });

            // Glowing neon emerald pool-table felt grid across grotto floor
            ctx.save();
            S.drawCutoutPaperEdge(
              ctx,
              [[245, 495], [345, 345], [965, 345], [1055, 495]],
              "rgba(6, 78, 59, 0.82)",
              "#34d399",
              { paperRim: 3.0, lineWidth: 3.0 }
            );
            ctx.strokeStyle = "rgba(52, 211, 153, 0.38)";
            ctx.lineWidth = 1.6;
            for (var gx = 365; gx <= 945; gx += 95) {
              ctx.beginPath(); ctx.moveTo(gx, 350); ctx.lineTo(gx + (gx - 655) * 0.25, 490); ctx.stroke();
            }
            // Sparkling golden star-pocket at upper-right corner!
            B.drawLanternHalo(ctx, 945, 355, 68, { color: "#facc15", coreColor: "#ffffff", intensity: 1.4, t: t });
            ctx.fillStyle = "#0b0c0e";
            ctx.strokeStyle = "#facc15";
            ctx.lineWidth = 3.5;
            ctx.beginPath(); ctx.ellipse(945, 358, 34, 20, 0, 0, TAU); ctx.fill(); ctx.stroke();
            ctx.restore();

            // Bank-shot dashed trajectory + cue ball banking off cushion into star-pocket!
            var cueX = u < 0.5 ? B.lerp(560, 665, u * 2) : B.lerp(665, 938, (u - 0.5) * 2);
            var cueY = u < 0.5 ? B.lerp(425, 352, u * 2) : B.lerp(352, 358, (u - 0.5) * 2);
            ctx.save();
            ctx.strokeStyle = "#fef08a";
            ctx.lineWidth = 2.5;
            ctx.setLineDash([8, 6]);
            ctx.beginPath(); ctx.moveTo(360, 465); ctx.lineTo(665, 352); ctx.lineTo(945, 358); ctx.stroke();
            ctx.restore();

            // Laser tractor cue-stick from saucer
            drawLimbSegment(ctx, S, 355, 470, 520, 434, 8, 4.5, "#f59e0b", "brass", false);
            drawRealPearlOrb(ctx, S, plates.portholeImg, cueX, cueY, 44 * (1 - B.clamp((u - 0.85) * 3, 0, 0.45)), t);
            B.drawDeterministicParticles(ctx, "kintsugi", 945, 358, t, { count: 16, loop: true, seed: 51.99 });
          }
        }
      }
    });
  })();

  // ============================================================================
  // PORTHOLE #52 · BRIDGE  ("cardboard-parallax" · p52.jpg + atlas-23.webp)
  // Taut braided crimson rope stretched into shadowy boulder pile
  // ============================================================================
  (function definePortal52() {
    var B = getEngine();
    var S0 = getStage();
    if (!B || !S0) return;

    function drawBraidedCrimsonRope(ctx, S, x0, y0, x1, y1, opts) {
      var cfg = opts || {};
      var segs = cfg.segs || 16;
      var sag = cfg.sag || 0;
      var waveAmp = cfg.waveAmp || 0;
      var waveFreq = cfg.waveFreq || 3;
      var t = cfg.t || 0;
      var wScale = cfg.widthScale || 1.0;

      for (var rs = 0; rs < segs; rs++) {
        var u0 = rs / segs;
        var u1 = (rs + 1) / segs;
        var wave0 = Math.sin(u0 * Math.PI * waveFreq - t * 9) * waveAmp * Math.sin(u0 * Math.PI);
        var wave1 = Math.sin(u1 * Math.PI * waveFreq - t * 9) * waveAmp * Math.sin(u1 * Math.PI);
        var px0 = B.lerp(x0, x1, u0);
        var py0 = B.lerp(y0, y1, u0) + Math.sin(u0 * Math.PI) * sag + wave0;
        var px1 = B.lerp(x0, x1, u1);
        var py1 = B.lerp(y0, y1, u1) + Math.sin(u1 * Math.PI) * sag + wave1;
        var mx = (px0 + px1) * 0.5;
        var my = (py0 + py1) * 0.5;
        var ang = Math.atan2(py1 - py0, px1 - px0);
        var segLen = Math.sqrt((px1 - px0) * (px1 - px0) + (py1 - py0) * (py1 - py0)) * 0.66;
        var hw = 12 * wScale;
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(ang + 0.17);
        S.drawCutoutPaperEdge(
          ctx,
          [[-segLen, -hw], [segLen, -hw], [segLen * 0.85, hw], [-segLen * 0.85, hw]],
          rs % 2 === 0 ? "#b5262c" : "#cf3939",
          "#14110d",
          { paperRim: 3.0, shadow: true, lineWidth: 2.0 }
        );
        ctx.restore();
      }
    }

    function drawBridgePierAndBoulders(ctx, S, plates, t, rumble) {
      var rmbX = rumble ? Math.sin(t * 28) * rumble * 7 : 0;
      var rmbY = rumble ? Math.cos(t * 31) * rumble * 5 : 0;
      var pImg = plates.portholeImg;

      // Submerged stone bridge pier & dark boulder crevice on right (p52.jpg)
      S.drawScissorCutout(
        ctx, pImg,
        305, 114, 186, 292,
        782 + rmbX, 68 + rmbY, 345, 425,
        [[0.08, 0.03], [0.94, 0.05], [0.97, 0.94], [0.16, 0.96], [0.03, 0.54]],
        { filter: "mono", haloWidth: 4.5 }
      );
      // Diagonal creek boulder & silt bed lower-left (p52.jpg)
      S.drawScissorCutout(
        ctx, pImg,
        138, 204, 232, 278,
        102, 218, 415, 355,
        [[0.05, 0.22], [0.58, 0.04], [0.96, 0.34], [0.92, 0.95], [0.04, 0.96]],
        { filter: "sepia", haloWidth: 4.5 }
      );

      // Shadowy boulder crevice cave mouth + Iron mooring ring on right pier
      ctx.save();
      ctx.translate(888 + rmbX, 224 + rmbY);
      S.drawCutoutPaperEdge(
        ctx,
        [[-72, 48], [-58, -42], [18, -56], [78, -22], [86, 52]],
        "#141619",
        "#0b0c0e",
        { paperRim: 3.5 }
      );
      ctx.restore();

      var ringX = 956 + rmbX, ringY = 198 + rmbY;
      ctx.save();
      ctx.translate(ringX, ringY);
      S.drawCardboardPuppetPiece(ctx, [[-18, -24], [20, -24], [24, 4], [-20, 4]], { tone: "#4f5255", ribs: 1 });
      ctx.strokeStyle = "#fbfaf5"; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.arc(0, 16, 26, 0, TAU); ctx.stroke();
      ctx.strokeStyle = "#2b2d2f"; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(0, 16, 26, 0, TAU); ctx.stroke();
      S.drawSplitPin(ctx, 0, -12, 5.0, { metal: "brass" });
      ctx.restore();
    }

    function drawForegroundBridgeRocks(ctx, S) {
      S.drawCardboardPuppetPiece(
        ctx,
        [[86, 595], [86, 444], [198, 418], [295, 496], [335, 595]],
        { tone: "#3d3f42", ribs: 3, pin: { x: 185, y: 472, r: 5.0, metal: "silver" } }
      );
      S.drawCardboardPuppetPiece(
        ctx,
        [[965, 595], [1005, 476], [1118, 436], [1194, 468], [1194, 595]],
        { tone: "#36383b", ribs: 2, pin: { x: 1085, y: 486, r: 5.0, metal: "brass" } }
      );
    }

    B.definePortalGame(52, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 52, t, resolved, {
          pillarbox: true
        });
        S.drawScissorCutout(
          ctx, plates.atlasImg,
          18, 56, 704, 304,
          118 + Math.sin(t * 0.45) * 6, 54, 1020, 410,
          [[0.02, 0.06], [0.52, 0.02], [0.98, 0.05], [0.96, 0.92], [0.48, 0.97], [0.03, 0.94]],
          { filter: "mono", haloWidth: 4.2, alpha: 0.92 }
        );
        B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.22, color: "#99f6e4", topY: 54 });
        B.drawDepthFog(ctx, W, H, t, { density: 0.16, color: "#cbd5e1" });
        drawAmbientCreekPolish(ctx, S, B, W, H, resolved, 52);
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawBridgePierAndBoulders(ctx, S, plates, t, 0);
        // Silt clouds along taut rope
        for (var sc = 0; sc < 7; sc++) {
          var su = (sc + 0.5) / 7;
          ctx.fillStyle = "rgba(222, 214, 196, 0.30)";
          ctx.beginPath();
          ctx.arc(B.lerp(235, 920, su), B.lerp(485, 224, su) + 18 + Math.sin(t * 2 + sc) * 5, 16 + (sc % 3) * 6, 0, TAU);
          ctx.fill();
        }
        drawBraidedCrimsonRope(ctx, S, 235, 485, 932, 218, {
          sag: 6, waveAmp: 2.5, waveFreq: 2, t: t
        });
        S.drawBrookTrout(ctx, 995 + Math.sin(t * 2.0) * 12, 345, 0.92, t, false);
        drawForegroundBridgeRocks(ctx, S);
      },

      stems: {
        // [✕] Trace Rope Beam: focused blue beam follows braid into boulder gap, glinting off two round glass eyes!
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = B.easeOutCubic(resolved.stemU);
          drawBridgePierAndBoulders(ctx, S, plates, t, 0);
          drawBraidedCrimsonRope(ctx, S, 235, 485, 895, 228, { sag: 4, t: t });

          var aimX = B.lerp(480, 885, su);
          var aimY = B.lerp(390, 226, su);
          drawSubSpotlight(ctx, S, B, 215, 515, aimX, aimY, {
            t: t, color: "#2563eb", coreColor: "#dbeafe", spread: 88, intensity: 1.25, seed: 52.1
          });

          // Two mysterious glinting round glass eyes blinking inside the dark boulder gap!
          if (su > 0.35) {
            var blink = Math.abs(Math.sin(t * 3.8)) < 0.12 ? 0.18 : 1.0;
            ctx.save();
            ctx.globalAlpha = B.clamp((su - 0.35) / 0.45, 0, 1);
            for (var e = -1; e <= 1; e += 2) {
              var ex = 882 + e * 18, ey = 224;
              ctx.fillStyle = "#fef08a";
              ctx.strokeStyle = "#14110d";
              ctx.lineWidth = 2.0;
              ctx.beginPath();
              ctx.ellipse(ex, ey, 11, 11 * blink, 0, 0, TAU);
              ctx.fill();
              ctx.stroke();
              ctx.fillStyle = "#0b0c0e";
              ctx.beginPath();
              ctx.ellipse(ex - 2, ey, 4.5, 4.5 * blink, 0, 0, TAU);
              ctx.fill();
            }
            ctx.restore();
          }
          drawForegroundBridgeRocks(ctx, S);
        },

        // [○] Surge Tow Thruster: crimson water surge tugs rope, making entire boulder pile rumble & shift!
        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = B.clamp(resolved.stemU, 0, 1);
          drawBridgePierAndBoulders(ctx, S, plates, t, 0.4 + su * 0.7);
          drawCrimsonBallastJet(ctx, S, B, 765, 465, 520, 345, 0.5 + su * 0.65, t, 52.2);
          drawBraidedCrimsonRope(ctx, S, 235, 485, 932, 218, {
            sag: -26 * su, waveAmp: 6, waveFreq: 3, t: t
          });
          B.drawDeterministicParticles(ctx, "ink_puffs", 875, 255, t, {
            count: 14, loop: true, seed: 52.25, color: "rgba(214, 211, 209, 0.55)"
          });
          drawForegroundBridgeRocks(ctx, S);
        },

        // [△] Hang Rope Tag: Mail Snail balances upside-down like an acrobat & clips shiny brass bell-tag!
        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = B.clamp(resolved.stemU, 0, 1);
          drawBridgePierAndBoulders(ctx, S, plates, t, 0);
          drawBraidedCrimsonRope(ctx, S, 235, 485, 932, 218, { sag: 12, t: t });

          var ropeU = B.lerp(0.18, 0.56, su);
          var sx = B.lerp(235, 932, ropeU);
          var sy = B.lerp(485, 218, ropeU) + Math.sin(ropeU * Math.PI) * 12;
          var ropeAng = Math.atan2(218 - 485, 932 - 235);

          B.drawSnailSilverTrail(ctx, 265, 474, sx, sy, su, t, { arc: -6 });
          // Upside-down acrobat Mail Snail along underside of rope!
          ctx.save();
          ctx.translate(sx, sy + 18);
          ctx.rotate(ropeAng);
          ctx.scale(1, -1);
          S.drawMailSnail(ctx, 0, 0, 1.12, t, { postcard: false });
          ctx.restore();

          // Swinging shiny brass bell-tag clipped to center span
          if (su > 0.45) {
            ctx.save();
            ctx.translate(sx - 24, sy + 10);
            ctx.rotate(Math.sin(t * 7.5) * 0.28);
            S.drawCutoutPaperEdge(ctx, [[-8, 0], [8, 0], [18, 28], [-18, 28]], "#eab308", "#14110d", { paperRim: 2.0 });
            ctx.fillStyle = "#14110d";
            ctx.beginPath(); ctx.arc(0, 30, 5.5, 0, TAU); ctx.fill();
            ctx.restore();
          }
          drawForegroundBridgeRocks(ctx, S);
        },

        // [□] Pluck Taut Line: brass tongs pluck red rope like upright bass string sending standing wave!
        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var su = B.clamp(resolved.stemU, 0, 1);
          drawBridgePierAndBoulders(ctx, S, plates, t, 0);
          var pluckSag = su < 0.35 ? (su / 0.35) * 34 : 6;
          var wave = su >= 0.35 ? 28 * Math.exp(-(su - 0.35) * 1.1) : 3;
          drawBraidedCrimsonRope(ctx, S, 235, 485, 932, 218, {
            sag: pluckSag,
            waveAmp: wave,
            waveFreq: 4,
            t: t * 1.6
          });
          drawBrassScissorTongs(ctx, S, B, 945, 525, 625, 345 + (su < 0.35 ? su * 28 : 18), su >= 0.35 ? 0.55 : 0.15, t, {
            sparks: true, seed: 52.4
          });
          drawForegroundBridgeRocks(ctx, S);
        }
      },

      outcomes: {
        x: {
          // Twin Porthole Mirror Surprise: second brass porthole + friendly tin-can periscope blinking back!
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            drawBridgePierAndBoulders(ctx, S, plates, t, 0);
            drawBraidedCrimsonRope(ctx, S, 235, 485, 845, 252, { sag: 8, t: t });

            // Second brass porthole wedged inside the dark boulder pile!
            var px = 875, py = 232;
            drawSubSpotlight(ctx, S, B, 215, 515, px, py, {
              t: t, color: "#3b82f6", coreColor: "#fef9c3", spread: 112, intensity: 1.2
            });
            ctx.save();
            ctx.translate(px, py);
            S.drawCutoutPaperEdge(ctx, makeCirclePoly(20, 72, 72, 0, 0), "#ca8a04", "#14110d", { paperRim: 3.5 });
            ctx.fillStyle = "#1e3a5f";
            ctx.beginPath(); ctx.arc(0, 0, 54, 0, TAU); ctx.fill();
            for (var b = 0; b < 6; b++) {
              var ba = (b / 6) * TAU;
              S.drawSplitPin(ctx, Math.cos(ba) * 63, Math.sin(ba) * 63, 3.6, { metal: "brass" });
            }
            // Friendly tin-can periscope puppet blinking & waving inside twin porthole!
            ctx.save();
            ctx.rotate(Math.sin(t * 3.2) * 0.14);
            S.drawCardboardPuppetPiece(ctx, [[-20, 46], [-20, -14], [20, -14], [20, 46]], { tone: "#9ca3af", ribs: 2, shadow: false });
            for (var e = -1; e <= 1; e += 2) {
              ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#14110d"; ctx.lineWidth = 2;
              ctx.beginPath(); ctx.arc(e * 11, -6, 9, 0, TAU); ctx.fill(); ctx.stroke();
              ctx.fillStyle = "#14110d";
              ctx.beginPath(); ctx.arc(e * 11 - 2, -6, 4, 0, TAU); ctx.fill();
            }
            ctx.restore();
            ctx.restore();

            drawForegroundBridgeRocks(ctx, S);
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508, actorX: 275, actorY: 505, actorScale: 0.96 });
          },

          // Lit Creek Ferry Guide-Line: illuminated red cable guides leaf-raft piloted by Trout + lantern Snail!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.15, 0, 1);
            drawBridgePierAndBoulders(ctx, S, plates, t, 0);
            drawSubSpotlight(ctx, S, B, 205, 520, 885, 225, {
              t: t, color: "#38bdf8", coreColor: "#fef08a", spread: 135, intensity: 0.95
            });
            drawBraidedCrimsonRope(ctx, S, 235, 485, 932, 218, { sag: 6, t: t });

            // Oak-leaf ferry raft gliding smoothly down illuminated crimson guide-rope
            var ferryU = B.lerp(0.82, 0.34, u);
            var fx = B.lerp(235, 932, ferryU);
            var fy = B.lerp(485, 218, ferryU) + 46;
            ctx.save();
            ctx.translate(fx, fy);
            // Pulley hanger up to crimson cable
            drawLimbSegment(ctx, S, 0, -4, 0, -46, 5, 5, "#b88a44", "brass", "brass");
            // Stitched green oak-leaf raft hull
            S.drawCutoutPaperEdge(
              ctx,
              [[-118, 8], [-82, -16], [-32, -8], [0, -22], [44, -10], [96, -18], [122, 8], [76, 28], [-78, 28]],
              "#3f6212",
              "#14110d",
              { paperRim: 3.2 }
            );
            ctx.restore();

            S.drawBrookTrout(ctx, fx + 28, fy - 18, 0.96, t, false);
            S.drawMailSnail(ctx, fx - 54, fy - 16, 1.05, t, { flip: true, hasReply: true });
            B.drawLanternHalo(ctx, fx - 88, fy - 28, 72, { color: "#fbbf24", coreColor: "#ffffff", intensity: 1.25, t: t });
            drawForegroundBridgeRocks(ctx, S);
          },

          // Glowing Space-Elevator Tether: pulsing fiber-optic data packets + glass gondola car descending from saucer!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.15, 0, 1);
            drawBridgePierAndBoulders(ctx, S, plates, t, 0);

            var topX = 640, topY = 108, botX = 565, botY = 545;
            S.drawAlienSaucer(ctx, topX, topY - 8, 1.24, t, botX, botY, { beamSpread: 145 });
            drawBraidedCrimsonRope(ctx, S, botX, botY, topX, topY, { sag: 0, widthScale: 1.05, t: t });

            // Glowing fiber-optic data packets zipping along vertical crimson cable
            for (var dp = 0; dp < 8; dp++) {
              var du = ((t * 0.85 + dp / 8) % 1);
              var dx = B.lerp(botX, topX, du), dy = B.lerp(botY, topY, du);
              B.drawLanternHalo(ctx, dx, dy, 28, { color: dp % 2 === 0 ? "#38bdf8" : "#facc15", intensity: 1.1, t: t });
            }

            // Descending glass-dome Space-Elevator Gondola Car!
            var carU = B.lerp(0.84, 0.34, u);
            var cx = B.lerp(botX, topX, carU), cy = B.lerp(botY, topY, carU);
            ctx.save();
            ctx.translate(cx, cy);
            S.drawCutoutPaperEdge(ctx, [[-88, -12], [-38, -16], [-38, 16], [-88, 12]], "#0f8f80", "#14110d", { paperRim: 2.2 });
            S.drawCutoutPaperEdge(ctx, [[38, -16], [88, -12], [88, 12], [38, 16]], "#0f8f80", "#14110d", { paperRim: 2.2 });
            S.drawCardboardPuppetPiece(ctx, [[-38, -34], [38, -34], [44, 28], [-44, 28]], {
              tone: "#cbd5e1", ribs: 2, pins: [[-28, -22], [28, -22], [-28, 18], [28, 18]]
            });
            ctx.fillStyle = "#fef08a"; ctx.strokeStyle = "#14110d"; ctx.lineWidth = 2.2;
            ctx.beginPath(); ctx.arc(0, -2, 16, 0, TAU); ctx.fill(); ctx.stroke();
            ctx.restore();

            drawForegroundBridgeRocks(ctx, S);
          }
        },

        o: {
          // Unstuck Toy Anchor Pop: thruster surge pops out harmless red rubber dinghy anchor instead of squid!
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.3, 0, 1);
            drawBridgePierAndBoulders(ctx, S, plates, t, 0);
            drawCrimsonBallastJet(ctx, S, B, 845, 455, 595, 355, 0.85, t, 52.5);

            var popU = B.easeOutBack(u);
            var ancX = B.lerp(885, 595, popU);
            var ancY = B.lerp(228, 345, popU) - Math.sin(u * Math.PI) * 110;
            drawBraidedCrimsonRope(ctx, S, 235, 485, ancX, ancY, { sag: 38, t: t });

            // Bright red bouncy toy dinghy anchor (with fluke arms & brass ring, 0 text!)
            ctx.save();
            ctx.translate(ancX, ancY);
            ctx.rotate(-0.4 + popU * 1.2 + Math.sin(t * 5) * 0.12);
            S.drawCutoutPaperEdge(
              ctx,
              [[-10, -42], [10, -42], [10, 16], [42, -2], [48, 14], [0, 42], [-48, 14], [-42, -2], [-10, 16]],
              "#ef4444",
              "#14110d",
              { paperRim: 3.2 }
            );
            ctx.strokeStyle = "#eab308"; ctx.lineWidth = 5;
            ctx.beginPath(); ctx.arc(0, -48, 12, 0, TAU); ctx.stroke();
            ctx.restore();

            B.drawDeterministicParticles(ctx, "bubbles", ancX, ancY, t, { count: 18, loop: true, seed: 52.55 });
            drawForegroundBridgeRocks(ctx, S);
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508 });
          },

          // Helpful Creek Tow-Truck Pull: tow-line + creek tow-truck rolls wedged cedar drift-log aside opening sunny channel!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.2, 0, 1);
            drawBridgePierAndBoulders(ctx, S, plates, t, 0);

            // Sunny golden shortcut channel beam opening through boulders!
            B.drawVolumetricBeam(ctx, 680, 62, 540, 495, {
              color: "#fde047", coreColor: "#fffbeb", spread: 165, intensity: 0.45 + u * 0.75, t: t, seed: 52.6
            });

            // Cardboard Creek Tow-Truck winching on right pier
            var truckX = 925, truckY = 246;
            var logX = B.lerp(485, 735, u), logY = B.lerp(415, 315, u);
            drawBraidedCrimsonRope(ctx, S, logX + 35, logY - 10, truckX - 75, truckY - 12, { sag: 4, segs: 10, t: t });

            // Wedged cedar drift-log rolling neatly aside!
            ctx.save();
            ctx.translate(logX, logY);
            ctx.rotate(-0.28 + u * 0.55);
            S.drawCardboardPuppetPiece(
              ctx,
              [[-118, -24], [105, -26], [118, 0], [105, 26], [-118, 24]],
              { tone: "#6b4c35", ribs: 4, pins: [[-65, 0], [52, 0]] }
            );
            S.drawCutoutPaperEdge(ctx, [[96, -22], [118, -14], [118, 14], [96, 22]], "#e7d3ad", "#14110d", { paperRim: 1.8, shadow: false });
            ctx.restore();

            // Riveted Grey-Cardboard Tow-Truck
            ctx.save();
            ctx.translate(truckX, truckY);
            drawLimbSegment(ctx, S, -10, 6, -82, -16, 10, 7, "#636669", "brass", "silver");
            S.drawCardboardPuppetPiece(ctx, [[-46, 26], [-46, -6], [4, -8], [16, -42], [74, -42], [90, -8], [96, 26]], { tone: "#9a9b98", ribs: 3 });
            S.drawCutoutPaperEdge(ctx, [[24, -34], [66, -34], [76, -10], [20, -10]], "#dfe6e8", "#14110d", { paperRim: 1.6, shadow: false });
            for (var wi = 0; wi < 2; wi++) {
              ctx.save();
              ctx.translate(wi === 0 ? -20 : 60, 28);
              ctx.rotate(-t * 4.2);
              S.drawCutoutPaperEdge(ctx, makeCirclePoly(10, 20, 20, 0, 0), "#353739", "#14110d", { paperRim: 2.2 });
              S.drawSplitPin(ctx, 0, 0, 5.0, { metal: "silver" });
              ctx.restore();
            }
            ctx.restore();

            S.drawBrookTrout(ctx, 555, 365 + Math.sin(t * 2.5) * 8, 1.04, t, true);
            S.drawMailSnail(ctx, 435, 504, 1.18, t, { hasReply: true });
            drawForegroundBridgeRocks(ctx, S);
          },

          // Tethered Asteroid Tug-Of-War: crimson rope loops through warp-portal and tugs surprised Alien Saucer down like balloon!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.2, 0, 1);
            drawBridgePierAndBoulders(ctx, S, plates, t, 0);
            drawCrimsonBallastJet(ctx, S, B, 495, 515, 295, 445, 0.9, t, 52.65);

            // Swirling purple-emerald warp-portal ring in boulders
            var portX = 875, portY = 235;
            B.drawLanternHalo(ctx, portX, portY, 92, { color: "#a855f7", coreColor: "#34d399", intensity: 1.35, t: t });
            ctx.save();
            ctx.translate(portX, portY);
            ctx.rotate(t * 2.8);
            ctx.strokeStyle = "#c084fc"; ctx.lineWidth = 6;
            ctx.setLineDash([14, 8]);
            ctx.beginPath(); ctx.arc(0, 0, 48, 0, TAU); ctx.stroke();
            ctx.restore();

            // Surprised 3-eyed Alien Saucer bobbing low on crimson tether like a helium balloon!
            var saucerX = 565 + Math.sin(t * 3.4) * 22;
            var saucerY = B.lerp(105, 238, u) + Math.sin(t * 5.2) * 14;
            drawBraidedCrimsonRope(ctx, S, 235, 485, portX, portY, { sag: -8, segs: 12, t: t });
            drawBraidedCrimsonRope(ctx, S, portX, portY - 12, saucerX, saucerY + 24, { sag: -18, segs: 9, widthScale: 0.85, t: t });
            S.drawAlienSaucer(ctx, saucerX, saucerY, 1.26, t, 565, 440, { beamSpread: 120 });

            drawForegroundBridgeRocks(ctx, S);
          }
        },

        triangle: {
          // High-Wire Acrobat Snail Show: Mail Snail glides upright with striped paper parasol (0 suckers!)
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.15, 0, 1);
            drawBridgePierAndBoulders(ctx, S, plates, t, 0);
            drawBraidedCrimsonRope(ctx, S, 235, 485, 932, 218, { sag: 10, t: t });

            var ru = B.lerp(0.24, 0.72, u);
            var sx = B.lerp(235, 932, ru);
            var sy = B.lerp(485, 218, ru) + Math.sin(ru * Math.PI) * 10;
            B.drawSnailSilverTrail(ctx, 285, 468, sx, sy - 8, u, t, { arc: 8 });
            S.drawMailSnail(ctx, sx, sy - 16, 1.22, t, { rot: -0.36, hasReply: false });

            // Dainty striped cut-paper circus parasol twirling above Snail!
            ctx.save();
            ctx.translate(sx + 8, sy - 58);
            ctx.rotate(0.22 + Math.sin(t * 4.5) * 0.18);
            ctx.strokeStyle = "#14110d"; ctx.lineWidth = 2.6;
            ctx.beginPath(); ctx.moveTo(0, 38); ctx.lineTo(0, -18); ctx.stroke();
            S.drawCutoutPaperEdge(ctx, [[-44, 0], [-22, -24], [22, -24], [44, 0]], "#f43f5e", "#14110d", { paperRim: 2.2 });
            S.drawCutoutPaperEdge(ctx, [[-16, 0], [-8, -24], [8, -24], [16, 0]], "#fef08a", "#14110d", { paperRim: 1.2, shadow: false });
            ctx.restore();

            drawForegroundBridgeRocks(ctx, S);
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508 });
          },

          // Zip-Line Creek Mail Express: Snail zips under brass trolley wheel to Trout with catcher's mitt!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.25, 0, 1);
            drawBridgePierAndBoulders(ctx, S, plates, t, 0);
            drawBraidedCrimsonRope(ctx, S, 235, 485, 932, 218, { sag: 6, t: t });

            var zu = B.lerp(0.20, 0.74, u);
            var zx = B.lerp(235, 932, zu), zy = B.lerp(485, 218, zu) + 6;
            // Spinning brass zip-line trolley pulley + Mail Snail hanging below!
            ctx.save();
            ctx.translate(zx, zy);
            S.drawCutoutPaperEdge(ctx, makeCirclePoly(12, 16, 16, 0, -4), "#eab308", "#14110d", { paperRim: 2.0 });
            S.drawSplitPin(ctx, 0, -4, 4.2, { metal: "brass" });
            drawLimbSegment(ctx, S, 0, 0, 0, 42, 4, 4, "#b88a44", false, "brass");
            ctx.restore();
            S.drawMailSnail(ctx, zx, zy + 48, 1.18, t, { hasReply: true });
            B.drawDeterministicParticles(ctx, "brass_sparks", zx, zy - 4, t, { count: 10, loop: true, seed: 52.7 });

            // Flying postcards + Brook Trout with stitched leather catcher's mitt fin!
            drawMiniaturePostcard(ctx, S, B.lerp(zx + 35, 865, B.clamp(u * 1.4, 0, 1)), B.lerp(zy + 32, 295, B.clamp(u * 1.4, 0, 1)), 46, 32, t * 3, 5);
            S.drawBrookTrout(ctx, 925, 305, 1.06, t, false);
            S.drawCardboardPuppetPiece(ctx, [[838, 292], [862, 274], [882, 294], [868, 322], [842, 316]], { tone: "#92400e", ribs: 2 });
            drawForegroundBridgeRocks(ctx, S);
          },

          // Cosmic Clothesline Postcard Dry: Alien Saucer & Snail hang glowing galaxy + creek postcards with clothespins!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawBridgePierAndBoulders(ctx, S, plates, t, 0);
            S.drawAlienSaucer(ctx, 595, 98, 1.24, t, 595, 345, { beamSpread: 185 });
            B.drawTractorRings(ctx, 595, 122, 595, 345, t, { spread: 165, rings: 5 });

            drawBraidedCrimsonRope(ctx, S, 235, 465, 932, 228, { sag: 22, t: t });

            // 7 shimmering holographic galaxy & creek postcards hung with tiny brass clothespins!
            for (var c = 0; c < 7; c++) {
              var cu = 0.14 + c * 0.115;
              var cx = B.lerp(235, 932, cu);
              var cy = B.lerp(465, 228, cu) + Math.sin(cu * Math.PI) * 22;
              var sway = Math.sin(t * 3.4 + c * 0.9) * 0.18;
              B.drawLanternHalo(ctx, cx, cy + 32, 46, {
                color: c % 2 === 0 ? "#34d399" : "#c084fc", intensity: 0.85, t: t
              });
              drawMiniaturePostcard(ctx, S, cx, cy + 34, 62, 44, sway, c * 7 + 1, {
                paper: c % 2 === 0 ? "#ecfeff" : "#faf5ff"
              });
              // Tiny brass clothespin gripping the red rope
              S.drawCardboardPuppetPiece(ctx, [[cx - 5, cy - 12], [cx + 5, cy - 12], [cx + 4, cy + 14], [cx - 4, cy + 14]], {
                tone: "#eab308", ribs: 1, shadow: false
              });
            }
            S.drawMailSnail(ctx, 845, 242, 1.12, t, { flip: true, hasReply: true, hasAlienStamp: true });
            drawForegroundBridgeRocks(ctx, S);
          }
        },

        square: {
          // Twanging Bass-String Tentacle Fakeout: musical sine-wave harmonics + yarn fuzz (no squid!)
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            drawBridgePierAndBoulders(ctx, S, plates, t, 0);

            // Multi-exposure musical bass-string harmonic ghosts!
            ctx.save();
            var harmCols = ["rgba(96,165,250,0.45)", "rgba(250,204,21,0.45)"];
            for (var h = 0; h < 2; h++) {
              ctx.strokeStyle = harmCols[h];
              ctx.lineWidth = 6;
              ctx.beginPath();
              for (var s = 0; s <= 24; s++) {
                var su = s / 24;
                var hx = B.lerp(235, 932, su);
                var hy = B.lerp(485, 218, su) + Math.sin(su * Math.PI * (h + 2) + t * 14) * (34 - h * 10);
                if (s === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
              }
              ctx.stroke();
            }
            ctx.restore();

            drawBraidedCrimsonRope(ctx, S, 235, 485, 932, 218, {
              sag: 0, waveAmp: 28, waveFreq: 3, t: t * 1.8
            });
            B.drawDeterministicParticles(ctx, "confetti", 585, 355, t, {
              count: 16, loop: true, seed: 52.8, color: "#ef4444"
            });
            drawBrassScissorTongs(ctx, S, B, 945, 525, 655, 365, 0.45, t, { sparks: false });
            drawForegroundBridgeRocks(ctx, S);
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508 });
          },

          // Tin-Can Telephone Creek Call: Brook Trout & Mail Snail chatting via soup-can receivers on red cord!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            drawBridgePierAndBoulders(ctx, S, plates, t, 0);
            drawBraidedCrimsonRope(ctx, S, 365, 472, 855, 258, {
              sag: 4, waveAmp: 9, waveFreq: 5, t: t * 1.4
            });

            // Left & Right red-and-white striped soup-can telephone receivers + acoustic wave rings!
            var cans = [[365, 472, 0.35], [855, 258, -2.75]];
            for (var c = 0; c < 2; c++) {
              ctx.save();
              ctx.translate(cans[c][0], cans[c][1]);
              ctx.rotate(cans[c][2]);
              S.drawCutoutPaperEdge(ctx, [[-26, -18], [26, -18], [26, 18], [-26, 18]], "#fbfaf5", "#14110d", { paperRim: 2.2 });
              ctx.fillStyle = "#dc2626";
              ctx.fillRect(-25, -17, 25, 34);
              // Concentric sound wave arcs
              ctx.strokeStyle = "#fef08a"; ctx.lineWidth = 2.4;
              for (var w = 1; w <= 3; w++) {
                ctx.beginPath();
                ctx.arc(32, 0, w * 11 + ((t * 24) % 11), -0.65, 0.65);
                ctx.stroke();
              }
              ctx.restore();
            }
            S.drawMailSnail(ctx, 315, 492, 1.18, t, { hasReply: true });
            S.drawBrookTrout(ctx, 948, 268, 1.04, t, false);
            drawForegroundBridgeRocks(ctx, S);
          },

          // Laser Harp Cosmic Solo: Alien Saucer fans 7 rainbow laser-harp strings beside red rope!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawBridgePierAndBoulders(ctx, S, plates, t, 0);
            S.drawAlienSaucer(ctx, 585, 98, 1.25, t, 585, 365, { beamSpread: 175 });

            // 7 dazzling rainbow laser-harp strings fanned across creek!
            var harpCols = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7"];
            for (var hs = 0; hs < 7; hs++) {
              var bx = 335 + hs * 86;
              var vibrate = Math.sin(t * (10 + hs * 2)) * 9;
              B.drawVolumetricBeam(ctx, 585, 118, bx, 535, {
                color: harpCols[hs], coreColor: "#ffffff", sourceRadius: 6, spread: 16, intensity: 0.95, motes: 4, t: t, seed: hs * 3.3
              });
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 2.6;
              ctx.beginPath();
              ctx.moveTo(585, 118);
              ctx.quadraticCurveTo((585 + bx) * 0.5 + vibrate, 325, bx, 535);
              ctx.stroke();
            }
            drawBraidedCrimsonRope(ctx, S, 235, 485, 932, 218, {
              sag: 0, waveAmp: 16, waveFreq: 4, t: t * 1.5
            });
            drawBrassScissorTongs(ctx, S, B, 955, 525, 685, 345, 0.35, t, { sparks: true, seed: 52.95 });
            drawForegroundBridgeRocks(ctx, S);
          }
        }
      }
    });
  })();

  // ============================================================================
  // PORTHOLE #53 · FLUME  ("cardboard-parallax" · p53.jpg + atlas-27.webp)
  // Antique iron Mingus Mill waterwheel clicking forged cellar latch
  // ============================================================================
  (function definePortal53() {
    var B = getEngine();
    var S0 = getStage();
    if (!B || !S0) return;

    function drawMillWheelRig(ctx, S, opts) {
      var cfg = opts || {};
      var wx = cfg.x != null ? cfg.x : 532;
      var wy = cfg.y != null ? cfg.y : 284;
      var wr = cfg.r != null ? cfg.r : 148;
      var ang = cfg.ang || 0;
      var t = cfg.t || 0;

      // Overhead wooden flume trough + water cascade
      if (cfg.flume !== false) {
        S.drawTornPaperFlat(ctx, 285, 72, 265, 34, { fill: "#595752", paperColor: "#f2eee4", deckle: 4.5 });
        S.drawCutoutPaperEdge(
          ctx,
          [[530, 88], [572, 92], [685 + Math.sin(t * 6) * 7, 252], [640, 264]],
          "#e6ebe8",
          "#14110d",
          { paperRim: 2.8 }
        );
      }

      // 12-paddle iron waterwheel
      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(ang);
      for (var pd = 0; pd < 12; pd++) {
        ctx.save();
        ctx.rotate((pd / 12) * TAU);
        S.drawCardboardPuppetPiece(
          ctx,
          [[wr - 26, -11], [wr + 18, -15], [wr + 18, 15], [wr - 26, 11]],
          { tone: cfg.crimper ? "#d4a44c" : (pd % 2 === 0 ? "#686966" : "#7e7f7b"), ribs: 1, shadow: false }
        );
        if (cfg.ferrisFlags) {
          S.drawCutoutPaperEdge(ctx, [[wr + 18, 0], [wr + 42, -10], [wr + 42, 10]], pd % 2 === 0 ? "#ef4444" : "#eab308", "#14110d", { paperRim: 1.4, shadow: false });
        }
        ctx.restore();
      }
      for (var spk = 0; spk < 6; spk++) {
        ctx.save();
        ctx.rotate((spk / 6) * TAU);
        S.drawCardboardPuppetPiece(ctx, [[-10, -wr + 16], [10, -wr + 16], [10, wr - 16], [-10, wr - 16]], {
          tone: "#888782", ribs: 3, shadow: false
        });
        ctx.restore();
      }
      ctx.strokeStyle = "#fbfaf5"; ctx.lineWidth = 20;
      ctx.beginPath(); ctx.arc(0, 0, wr - 18, 0, TAU); ctx.stroke();
      ctx.strokeStyle = cfg.crimper ? "#b45309" : "#545552"; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.arc(0, 0, wr - 18, 0, TAU); ctx.stroke();
      for (var rv = 0; rv < 12; rv++) {
        var ra = (rv / 12) * TAU;
        S.drawSplitPin(ctx, Math.cos(ra) * (wr - 18), Math.sin(ra) * (wr - 18), 3.6, { metal: "silver" });
      }
      S.drawReinigerFiligreeHinge(ctx, 0, 0, 14, { metal: "brass" });
      ctx.restore();

      // Mossy stone axle pedestal
      if (cfg.pedestal !== false) {
        S.drawCardboardPuppetPiece(
          ctx,
          [[368, 535], [385, 302], [512, 302], [532, 535]],
          { tone: "#6c7068", ribs: 4, pins: [[415, 320], [485, 320]] }
        );
        S.drawCardboardPuppetPiece(
          ctx,
          [[wx - 64, wy - 18], [wx + 18, wy - 18], [wx + 18, wy + 22], [wx - 64, wy + 22]],
          { tone: "#484a4c", ribs: 1, pin: { x: wx, y: wy, r: 6.2, metal: "brass" } }
        );
      }

      // Cellar hatch & hooked forged iron pawl at 6-o'clock
      if (cfg.hatch !== false) {
        var hx = 585, hy = 492;
        var latchAng = cfg.latchAng != null ? cfg.latchAng : (-0.18 - Math.pow(Math.max(0, Math.sin(ang * 12)), 4) * 0.34);
        S.drawCardboardPuppetPiece(
          ctx,
          [[hx - 115, hy + 18], [hx - 35, hy - 22], [hx + 135, hy + 8], [hx + 55, hy + 58]],
          { tone: "#786b56", ribs: 3 }
        );
        ctx.save();
        ctx.translate(hx + 22, hy + 12);
        ctx.rotate(latchAng);
        S.drawCutoutPaperEdge(ctx, [[-52, -9], [16, -9], [24, 9], [-52, 9]], cfg.slimeLatch ? "#cbd5e1" : "#e8c060", "#14110d", { paperRim: 2.2 });
        S.drawSplitPin(ctx, 8, 0, 4.5, { metal: "brass" });
        ctx.restore();
      }
    }

    B.definePortalGame(53, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 53, t, resolved, { pillarbox: true });

        // Crop atlas-27.webp strictly avoiding upper-left painted calligraphy!
        S.drawScissorCutout(
          ctx, plates.atlasImg,
          335, 22, 392, 515,
          645 + Math.sin(t * 0.4) * 6, 52, 505, 455,
          [[0.05, 0.04], [0.95, 0.03], [0.97, 0.94], [0.06, 0.96]],
          { filter: "mono", haloWidth: 4.2, alpha: 0.88 }
        );
        S.drawScissorCutout(
          ctx, plates.atlasImg,
          40, 392, 660, 155,
          112, 415, 980, 168,
          [[0.02, 0.14], [0.48, 0.04], [0.98, 0.12], [0.96, 0.94], [0.03, 0.95]],
          { filter: "sepia", haloWidth: 4.0, alpha: 0.92 }
        );

        B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.20, color: "#bae6fd", topY: 64 });
        B.drawDepthFog(ctx, W, H, t, { density: 0.14, color: "#cbd5e1" });

        // Mossy stone mill wall & swirling flume chute from p53.jpg
        S.drawScissorCutout(
          ctx, plates.portholeImg,
          142, 126, 214, 316,
          108, 58, 345, 435,
          [[0.06, 0.04], [0.92, 0.03], [0.88, 0.95], [0.05, 0.96]],
          { filter: "mono", haloWidth: 4.5 }
        );
        S.drawScissorCutout(
          ctx, plates.portholeImg,
          348, 142, 156, 292,
          705, 95, 310, 395,
          [[0.08, 0.05], [0.90, 0.08], [0.95, 0.90], [0.12, 0.94]],
          { filter: "mono", haloWidth: 4.2, alpha: 0.85 }
        );
        drawAmbientCreekPolish(ctx, S, B, W, H, resolved, 53);
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawMillWheelRig(ctx, S, { t: t, ang: t * 0.95 });
        // Wedged pine branch near lower right of wheel
        S.drawCardboardPuppetPiece(ctx, [[640, 445], [765, 418], [775, 438], [648, 464]], { tone: "#5c4d3c", ribs: 2 });
        S.drawBrookTrout(ctx, 945, 338 + Math.sin(t * 2.2) * 8, 0.95, t, false, { tilt: -0.18 });
      },

      stems: {
        // [✕] Strobe Iron Buckets: timed blue lamp pulses catch iron paddles mid-drip & light hub ring
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t, su = resolved.stemU;
          var strobe = 0.45 + 0.55 * (Math.sin(t * 22) > 0 ? 1 : 0.25);
          var steppedAng = Math.floor(t * 6) * (TAU / 24);
          drawMillWheelRig(ctx, S, { t: t, ang: steppedAng });
          drawSubSpotlight(ctx, S, B, 205, 295, 532, 284, {
            t: t, color: "#2563eb", coreColor: "#eff6ff", spread: 145, intensity: strobe * (0.6 + su * 0.7), seed: 53.1
          });
          // Engraved brass hub ring lit by strobe (pure ticks, 0 text!)
          ctx.save();
          ctx.strokeStyle = "#fef08a"; ctx.lineWidth = 3.2;
          ctx.beginPath(); ctx.arc(532, 284, 42, 0, TAU); ctx.stroke();
          ctx.restore();
        },

        // [○] Jet Flume Buckets: pressurized crimson stream fills top buckets & cranks wheel forward
        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t, su = B.easeOutBack(resolved.stemU);
          drawMillWheelRig(ctx, S, { t: t, ang: 0.4 + su * 1.15 });
          drawCrimsonBallastJet(ctx, S, B, 925, 195, 575, 148, 0.55 + resolved.stemU * 0.65, t, 53.2);
          B.drawDeterministicParticles(ctx, "bubbles", 625, 185, t, { count: 18, loop: true, seed: 53.25 });
        },

        // [△] Grease Gear Tooth: Mail Snail coats squeaky iron pawl in gleaming silver slime!
        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t, su = B.clamp(resolved.stemU, 0, 1);
          drawMillWheelRig(ctx, S, { t: t, ang: t * 1.15, slimeLatch: su > 0.4 });
          var sx = B.lerp(420, 615, su);
          B.drawSnailSilverTrail(ctx, 415, 502, sx, 496, su, t, { arc: 8, width: 7.5 });
          S.drawMailSnail(ctx, sx, 492, 1.18, t, { postcard: false });
          B.drawDeterministicParticles(ctx, "snail_trail", 595, 498, t, { count: 14, loop: true, seed: 53.3 });
        },

        // [□] Flip Iron Latch: brass scissor-tongs hook under heavy cellar pawl & flip it into reverse!
        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t, su = B.easeOutBack(resolved.stemU);
          drawMillWheelRig(ctx, S, { t: t, ang: 0.8 - su * 0.45, latchAng: -0.18 + su * 1.15 });
          drawBrassScissorTongs(ctx, S, B, 965, 515, 608, 498, 0.25, t, { sparks: true, seed: 53.4 });
        }
      },

      outcomes: {
        x: {
          // Harmless Cornmeal Mill Wheel: golden corn-ear emblem + swirling golden cornmeal fireflies!
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            drawMillWheelRig(ctx, S, { t: t, ang: t * 1.05 });
            drawSubSpotlight(ctx, S, B, 205, 295, 532, 284, {
              t: t, color: "#3b82f6", coreColor: "#fef08a", spread: 150, intensity: 1.1
            });
            // Golden Corn-Ear Emblem Medallion on Mill Hub (pure geometry, 0 text!)
            ctx.save();
            ctx.translate(532, 284);
            S.drawCutoutPaperEdge(ctx, makeCirclePoly(16, 44, 44, 0, 0), "#fef3c7", "#14110d", { paperRim: 2.5 });
            S.drawCutoutPaperEdge(ctx, [[-14, 18], [-22, -6], [-8, 10], [8, 10], [22, -6], [14, 18]], "#16a34a", "#14110d", { paperRim: 1.2, shadow: false });
            S.drawCutoutPaperEdge(ctx, [[-10, 14], [-11, -18], [0, -26], [11, -18], [10, 14]], "#eab308", "#14110d", { paperRim: 1.4, shadow: false });
            ctx.restore();
            // Swirling golden cornmeal dust fireflies
            B.drawDeterministicParticles(ctx, "kintsugi", 585, 325, t, { count: 24, loop: true, seed: 53.5 });
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508 });
          },

          // Secret Cellar Pantry Elevator: wooden pulley dumbwaiter lifts acorn jars & mail sacks behind wheel!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.15, 0, 1);
            drawSubSpotlight(ctx, S, B, 205, 315, 765, 325, {
              t: t, color: "#38bdf8", coreColor: "#fef9c3", spread: 145, intensity: 1.05
            });
            drawMillWheelRig(ctx, S, { t: t, ang: t * 0.9 });

            // Rising wooden dumbwaiter shelf on twin ropes at right of wheel
            var shelfY = B.lerp(475, 255, u);
            ctx.save();
            ctx.strokeStyle = "#e7d3ad"; ctx.lineWidth = 3.5;
            ctx.beginPath(); ctx.moveTo(735, 95); ctx.lineTo(735, shelfY + 55); ctx.moveTo(855, 95); ctx.lineTo(855, shelfY + 55); ctx.stroke();
            S.drawCardboardPuppetPiece(ctx, [[720, shelfY + 48], [870, shelfY + 48], [870, shelfY + 64], [720, shelfY + 64]], { tone: "#8b5a2b", ribs: 1 });
            // Corked acorn jar + stamped mail sack on shelf
            S.drawCutoutPaperEdge(ctx, [[742, shelfY + 48], [742, shelfY + 8], [782, shelfY + 8], [782, shelfY + 48]], "#fde68a", "#14110d", { paperRim: 2.0 });
            S.drawCutoutPaperEdge(ctx, [[802, shelfY + 48], [810, shelfY + 4], [848, shelfY + 4], [856, shelfY + 48]], "#d6d3d1", "#14110d", { paperRim: 2.0 });
            ctx.restore();

            S.drawBrookTrout(ctx, 975, 295 + Math.sin(t * 2.4) * 8, 1.05, t, false);
            S.drawMailSnail(ctx, 825, 508, 1.16, t, { hasReply: true });
          },

          // Planetary Rotation Clockwork Dial: glowing brass astronomical rings + interlocked Earth gearwheel!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 825, 98, 1.24, t, 685, 305, { beamSpread: 175 });
            B.drawTractorRings(ctx, 825, 122, 685, 305, t, { spread: 155, rings: 5 });

            // Interlocked Planet Earth Gearwheel meshing on right of millwheel!
            var earthX = 795, earthY = 316, earthR = 104, wAng = t * 0.85;
            ctx.save();
            ctx.translate(earthX, earthY);
            ctx.rotate(-wAng * (148 / earthR) + 0.14);
            for (var gt = 0; gt < 10; gt++) {
              ctx.save();
              ctx.rotate((gt / 10) * TAU);
              S.drawCardboardPuppetPiece(ctx, [[earthR - 6, -12], [earthR + 22, -9], [earthR + 22, 9], [earthR - 6, 12]], { tone: "#eab308", ribs: 1, shadow: false });
              ctx.restore();
            }
            S.drawCutoutPaperEdge(ctx, makeCirclePoly(20, earthR, earthR, 0, 0), "#1e3a5f", "#14110d", { paperRim: 4.2 });
            S.drawCutoutPaperEdge(ctx, [[-58, -44], [-16, -52], [-6, -12], [-24, 44], [-52, 12]], "#34d399", "#14110d", { paperRim: 1.8, shadow: false });
            S.drawCutoutPaperEdge(ctx, [[16, -48], [62, -28], [56, 22], [22, 40], [10, 6]], "#34d399", "#14110d", { paperRim: 1.8, shadow: false });
            S.drawReinigerFiligreeHinge(ctx, 0, 0, 10, { metal: "brass" });
            ctx.restore();

            drawMillWheelRig(ctx, S, { t: t, ang: wAng, flume: false });
            // Glowing golden astronomical clockwork rings overlaid on wheel
            ctx.save();
            ctx.strokeStyle = "rgba(250, 204, 21, 0.72)";
            ctx.lineWidth = 2.6;
            ctx.setLineDash([10, 6]);
            ctx.beginPath(); ctx.arc(532, 284, 178, 0, TAU); ctx.stroke();
            ctx.restore();
          }
        },

        o: {
          // Giant Pie-Crimper Dough Escape: wheel rolls zig-zag pie-crust waves across soft river clay!
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.15, 0, 1);
            var rollX = B.lerp(465, 685, u);
            drawCrimsonBallastJet(ctx, S, B, 265, 255, rollX - 45, 225, 0.85, t, 53.6);
            drawMillWheelRig(ctx, S, {
              x: rollX, y: 312, r: 138, ang: u * 3.6, t: t, crimper: true, pedestal: false, hatch: false, flume: false
            });
            // Zig-zag crimped pie-crust clay bank across creek floor!
            var clayPts = [[275, 545], [275, 468]];
            for (var cp = 0; cp <= 24; cp++) {
              var cx = B.lerp(285, 895, cp / 24);
              var amp = cx <= rollX + 55 ? 16 : 3;
              clayPts.push([cx, 458 + (cp % 2 === 0 ? -amp : amp)]);
            }
            clayPts.push([905, 545]);
            S.drawCutoutPaperEdge(ctx, clayPts, "#eab308", "#14110d", { paperRim: 3.5 });
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508 });
          },

          // Flume Ferris Wheel Ride: Mail Snail rides top iron bucket waving pennant while Brook Trout swims beside!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var wAng = t * 0.85;
            drawMillWheelRig(ctx, S, { t: t, ang: wAng, ferrisFlags: true });
            // Mail Snail riding top gondola bucket with fluttering emerald pennant!
            var riderX = 532 + Math.cos(-Math.PI * 0.5 + Math.sin(t * 1.4) * 0.35) * 155;
            var riderY = 284 + Math.sin(-Math.PI * 0.5 + Math.sin(t * 1.4) * 0.35) * 155;
            S.drawMailSnail(ctx, riderX, riderY - 12, 1.15, t, { hasReply: true });
            S.drawCutoutPaperEdge(ctx, [[riderX + 18, riderY - 48], [riderX + 66, riderY - 36], [riderX + 18, riderY - 24]], "#10b981", "#14110d", { paperRim: 1.6 });
            ctx.strokeStyle = "#14110d"; ctx.lineWidth = 2.4;
            ctx.beginPath(); ctx.moveTo(riderX + 18, riderY - 12); ctx.lineTo(riderX + 18, riderY - 50); ctx.stroke();

            S.drawBrookTrout(ctx, 885 + Math.sin(t * 2.6) * 24, 315 + Math.cos(t * 2.6) * 18, 1.1, t, false);
            B.drawDeterministicParticles(ctx, "bubbles", 665, 255, t, { count: 16, loop: true, seed: 53.7 });
          },

          // Hydro-Powered Saucer Jumpstart: dynamo lightning arcs from spinning hub recharge stalled saucer!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.25, 0, 1);
            drawCrimsonBallastJet(ctx, S, B, 245, 225, 485, 165, 0.95, t, 53.75);
            drawMillWheelRig(ctx, S, { t: t, ang: t * 3.4 });

            var saucerX = 835, saucerY = 112;
            S.drawAlienSaucer(ctx, saucerX, saucerY, 1.25, t, 532, 284, { beamSpread: 135 });

            // Harmless blue-gold dynamo jumper-cable lightning arcs from hub to saucer!
            ctx.save();
            for (var bolt = 0; bolt < 2; bolt++) {
              ctx.strokeStyle = bolt === 0 ? "#38bdf8" : "#fef08a";
              ctx.lineWidth = bolt === 0 ? 5 : 2.5;
              ctx.beginPath();
              ctx.moveTo(532, 284);
              for (var s = 1; s <= 7; s++) {
                var su = s / 7;
                var jx = B.lerp(532, saucerX, su) + (s < 7 ? Math.sin(t * 28 + s * 3 + bolt) * 22 : 0);
                var jy = B.lerp(284, saucerY + 14, su) + (s < 7 ? Math.cos(t * 24 + s * 2) * 16 : 0);
                ctx.lineTo(jx, jy);
              }
              ctx.stroke();
            }
            // Saucer battery meter bar charging up to bright neon green!
            S.drawCutoutPaperEdge(ctx, [[saucerX + 68, saucerY - 22], [saucerX + 128, saucerY - 22], [saucerX + 128, saucerY + 8], [saucerX + 68, saucerY + 8]], "#18181b", "#fbfaf5", { paperRim: 1.8 });
            ctx.fillStyle = u > 0.45 ? "#22c55e" : "#eab308";
            ctx.fillRect(saucerX + 73, saucerY - 17, 50 * u, 20);
            ctx.restore();
            B.drawDeterministicParticles(ctx, "brass_sparks", 532, 284, t, { count: 18, loop: true, seed: 53.78 });
          }
        },

        triangle: {
          // Silenced Squeaky Cellar Door: slime-oiled latch opens hatch revealing cozy apple-butter jar!
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.3, 0, 1);
            drawMillWheelRig(ctx, S, { t: t, ang: t * 1.1, hatch: false });

            // Hinged cellar hatch swung smoothly open + glowing cozy cellar jar with red apple icon (0 text!)
            var hx = 595, hy = 488;
            B.drawLanternHalo(ctx, hx + 25, hy - 10, 95, { color: "#fbbf24", intensity: 1.15, t: t });
            S.drawCardboardPuppetPiece(ctx, [[hx - 95, hy + 28], [hx + 95, hy + 28], [hx + 75, hy + 68], [hx - 75, hy + 68]], { tone: "#292524", ribs: 1 });
            // Corked pantry jar with crimson apple emblem popping up from cellar!
            var jarY = B.lerp(hy + 20, hy - 34, B.easeOutBack(u));
            S.drawCutoutPaperEdge(ctx, [[hx - 6, jarY - 32], [hx + 46, jarY - 32], [hx + 52, jarY + 26], [hx - 12, jarY + 26]], "#fef3c7", "#14110d", { paperRim: 2.4 });
            ctx.fillStyle = "#dc2626";
            ctx.beginPath(); ctx.arc(hx + 20, jarY, 13, 0, TAU); ctx.fill();
            ctx.fillStyle = "#16a34a";
            ctx.beginPath(); ctx.ellipse(hx + 25, jarY - 15, 7, 4, -0.5, 0, TAU); ctx.fill();

            B.drawSnailSilverTrail(ctx, 415, 512, 545, 508, 1, t, { arc: 8 });
            S.drawMailSnail(ctx, 545, 505, 1.16, t, { hasReply: false });
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508 });
          },

          // Smooth-Spinning Mill Stamp Press: slime-oiled pawl stamps wavy postmarks onto bark postcards!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var pressClick = Math.abs(Math.sin(t * 5.2));
            drawMillWheelRig(ctx, S, { t: t, ang: t * 1.35, slimeLatch: true, latchAng: -0.55 + pressClick * 0.52 });

            // Conveyor flume chute feeding bark postcards under the stamping pawl!
            S.drawCardboardPuppetPiece(ctx, [[465, 522], [935, 522], [945, 548], [455, 548]], { tone: "#78716c", ribs: 2 });
            for (var c = 0; c < 4; c++) {
              var cu = ((t * 0.38 + c * 0.25) % 1);
              var cx = B.lerp(495, 905, cu);
              drawMiniaturePostcard(ctx, S, cx, 506, 56, 38, 0, c + 12, { paper: "#f5ebe0" });
            }
            S.drawMailSnail(ctx, 435, 506, 1.18, t, { hasReply: true });
            S.drawBrookTrout(ctx, 955, 425 + Math.sin(t * 2.6) * 8, 1.06, t, false);
          },

          // Zero-Friction Perpetual Gear: iridescent snail-slime levitates wheel + golden oil-can badge for Snail!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 645, 98, 1.24, t, 532, 284, { beamSpread: 175 });
            B.drawTractorRings(ctx, 645, 122, 532, 284, t, { spread: 155, rings: 5 });

            B.drawLanternHalo(ctx, 532, 284, 195, { color: "#a855f7", coreColor: "#34d399", intensity: 1.25, t: t });
            drawMillWheelRig(ctx, S, {
              x: 532, y: 270 + Math.sin(t * 3.0) * 10, t: t, ang: t * 3.8, slimeLatch: true
            });
            B.drawDeterministicParticles(ctx, "snail_trail", 532, 415, t, { count: 24, loop: true, seed: 53.85 });

            // Golden Oil-Can Badge awarded beside Mail Snail!
            S.drawMailSnail(ctx, 835, 492, 1.22, t, { flip: true, hasReply: true, hasAlienStamp: true });
            ctx.save();
            ctx.translate(755, 468 + Math.sin(t * 3.5) * 5);
            S.drawCutoutPaperEdge(ctx, [[-24, 16], [-18, -14], [18, -14], [24, 16]], "#eab308", "#14110d", { paperRim: 2.2 });
            S.drawCutoutPaperEdge(ctx, [[18, -4], [52, -22], [54, -15], [20, 6]], "#facc15", "#14110d", { paperRim: 1.5, shadow: false });
            ctx.restore();
          }
        },

        square: {
          // Unjammed Reversible Gear Click: tongs lift pawl, wheel rocks back & drops jammed log in warm sunlight!
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.25, 0, 1);
            B.drawVolumetricBeam(ctx, 685, 58, 625, 495, {
              color: "#fde047", coreColor: "#fffbeb", spread: 185, intensity: 0.5 + u * 0.65, t: t, seed: 53.9
            });
            drawMillWheelRig(ctx, S, { t: t, ang: -u * 1.4, latchAng: 0.92 });
            drawBrassScissorTongs(ctx, S, B, 965, 515, 612, 482, 0.28, t, { sparks: false });

            // Stuck pine log dropping free & splashing aside!
            var lx = B.lerp(665, 835, u), ly = B.lerp(405, 515, u);
            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(-0.2 + u * 0.85);
            S.drawCardboardPuppetPiece(ctx, [[-95, -18], [95, -18], [95, 18], [-95, 18]], { tone: "#5c4d3c", ribs: 3 });
            ctx.restore();
            B.drawDeterministicParticles(ctx, "bubbles", lx, ly, t, { count: 16, loop: true, seed: 53.92 });
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508 });
          },

          // Wind-Up Creek Canal Lock: mossy wooden sluice gate rises on chains opening sparkling canal!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.2, 0, 1);
            // Sunlit crystal turquoise canal behind rising wooden sluice gate!
            var gateLift = B.lerp(0, 185, B.easeInOutCubic(u));
            S.drawCutoutPaperEdge(ctx, [[715, 135], [985, 135], [985, 485], [715, 485]], "#38bdf8", "#14110d", { paperRim: 3.5 });
            B.drawLanternHalo(ctx, 850, 320, 155, { color: "#7dd3fc", coreColor: "#ffffff", intensity: 1.15, t: t });
            // Wooden sluice gate rising on chains
            S.drawCardboardPuppetPiece(
              ctx,
              [[710, 130], [990, 130], [990, 485 - gateLift], [710, 485 - gateLift]],
              { tone: "#57534e", ribs: 4, pins: [[740, 155], [960, 155]] }
            );

            drawMillWheelRig(ctx, S, { x: 475, y: 284, r: 142, t: t, ang: t * 1.1, latchAng: 0.85 });
            S.drawBrookTrout(ctx, 855, 395 + Math.sin(t * 2.5) * 8, 1.06, t, false);
            S.drawMailSnail(ctx, 765, 502, 1.16, t, { hasReply: true });
          },

          // Vault Airlock Opens Star-Cave: mossy stones slide open like circular iris revealing twinkling star-cave!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.2, 0, 1);
            S.drawAlienSaucer(ctx, 815, 98, 1.22, t, 815, 315, { beamSpread: 165 });

            // Circular stone vault iris behind wheel opening to deep cosmos!
            var vx = 825, vy = 315, vr = 142 * B.easeOutBack(u);
            ctx.save();
            S.drawCutoutPaperEdge(ctx, makeCirclePoly(24, 150, 150, vx, vy), "#0f172a", "#38bdf8", { paperRim: 4.5, lineWidth: 3.2 });
            ctx.beginPath(); ctx.arc(vx, vy, Math.max(8, vr), 0, TAU); ctx.clip();
            // Sparkling quartz constellations inside star-cave
            ctx.strokeStyle = "rgba(125, 211, 252, 0.55)"; ctx.lineWidth = 1.8;
            var stars = [[-75, -55], [-25, -75], [35, -45], [75, 10], [15, 65], [-55, 45], [-10, -5]];
            ctx.beginPath();
            for (var st = 0; st < stars.length; st++) {
              var sx = vx + stars[st][0], sy = vy + stars[st][1];
              if (st === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
            for (var st2 = 0; st2 < stars.length; st2++) {
              B.drawLanternHalo(ctx, vx + stars[st2][0], vy + stars[st2][1], 24, { color: "#fef08a", intensity: 1.2, t: t + st2 });
            }
            ctx.restore();

            drawMillWheelRig(ctx, S, { x: 455, y: 284, r: 138, t: t, ang: t * 0.9, latchAng: 0.95 });
            drawBrassScissorTongs(ctx, S, B, 995, 525, 610, 492, 0.3, t, { sparks: true, seed: 53.99 });
          }
        }
      }
    });
  })();

  // ============================================================================
  // PORTHOLE #54 · LEDGE  ("cardboard-parallax" · p54.jpg + atlas-46.webp)
  // Giant wrinkled Appalachian Hellbender salamander swaying ruffled skin-folds
  // ============================================================================
  (function definePortal54() {
    var B = getEngine();
    var S0 = getStage();
    if (!B || !S0) return;

    function drawHellbenderRig(ctx, S, opts) {
      var cfg = opts || {};
      var t = cfg.t || 0;
      var ox = cfg.offsetX || 0;
      var oy = cfg.offsetY || 0;
      var frillScale = cfg.frillScale || 1.0;
      var frillCol = cfg.frillColor || "#b8874e";
      var bodyCol = cfg.bodyColor || "#9c784c";

      var spineBase = [
        { x: 505, y: 416 },
        { x: 618, y: 402 },
        { x: 735, y: 364 },
        { x: 792, y: 292 },
        { x: 655, y: 250 },
        { x: 505, y: 234 }
      ];
      var spine = [];
      for (var si = 0; si < spineBase.length; si++) {
        var ph = t * (cfg.danceSpeed || 2.8) - si * 0.65;
        var amp = (4.5 + si * 2.4) * (cfg.swayScale || 1.0);
        spine.push({
          x: spineBase[si].x + ox + Math.cos(ph) * amp * 0.5,
          y: spineBase[si].y + oy + Math.sin(ph) * amp
        });
      }

      if (cfg.cape) {
        S.drawCutoutPaperEdge(
          ctx,
          [[spine[0].x + 36, spine[0].y - 18], [spine[1].x + 78, spine[1].y - 58], [spine[2].x + 96 + Math.sin(t * 3.5) * 14, spine[2].y - 34], [spine[3].x + 68, spine[3].y + 48], [spine[1].x + 30, spine[1].y + 38]],
          "#9e2428", "#14110d", { paperRim: 3.8 }
        );
      }

      for (var seg = 4; seg >= 1; seg--) {
        drawLimbSegment(ctx, S, spine[seg].x, spine[seg].y, spine[seg + 1].x, spine[seg + 1].y, 34 - seg * 4.2, Math.max(8, 30 - (seg + 1) * 4.5), bodyCol, "brass", false);
      }

      // 14 phase-lagged undulating lateral skin-fold lobes!
      var frillPts = [];
      for (var fi = 0; fi <= 14; fi++) {
        var fu = fi / 14;
        var idxF = Math.min(4, Math.floor(fu * 4));
        var subU = (fu * 4) - idxF;
        var fx = B.lerp(spine[idxF].x, spine[idxF + 1].x, subU);
        var fy = B.lerp(spine[idxF].y, spine[idxF + 1].y, subU);
        var lobeWave = (Math.sin(t * 5.4 - fi * 0.85) * 14 + (fi % 2 === 0 ? -15 : 7)) * frillScale;
        frillPts.push([fx + 14, fy + lobeWave - 8]);
      }
      for (var bi = 4; bi >= 0; bi--) {
        frillPts.push([spine[bi].x - 6, spine[bi].y + 12]);
      }
      S.drawCutoutPaperEdge(ctx, frillPts, frillCol, "#14110d", { paperRim: 2.8 });

      drawLimbSegment(ctx, S, spine[1].x, spine[1].y, spine[0].x, spine[0].y, 36, 32, "#a47d4e", "brass", "brass");

      // Articulated 2-Bone IK 4-Toed Front Foot
      var footX = cfg.footX != null ? cfg.footX : (634 + ox + Math.sin(t * 2) * 6);
      var footY = cfg.footY != null ? cfg.footY : (468 + oy);
      var legIK = S.solveIK2(spine[1].x + 14, spine[1].y + 16, 46, 44, footX, footY, 1);
      drawLimbSegment(ctx, S, spine[1].x + 14, spine[1].y + 16, legIK.jx, legIK.jy, 11, 9, "#8c683e", "brass", "silver");
      drawLimbSegment(ctx, S, legIK.jx, legIK.jy, legIK.ex, legIK.ey, 8.5, 7, "#9e784a", "silver", false);
      for (var toe = -1.5; toe <= 1.5; toe += 1) {
        ctx.strokeStyle = "#14110d"; ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(legIK.ex, legIK.ey);
        ctx.lineTo(legIK.ex - 8 + toe * 6.5, legIK.ey + (cfg.highFour ? -12 : 11));
        ctx.stroke();
      }

      // Broad Flat Hellbender Head
      ctx.save();
      ctx.translate(spine[0].x, spine[0].y);
      ctx.rotate(Math.sin(t * 2.1) * 0.05 + (cfg.headTilt || 0));
      S.drawCardboardPuppetPiece(
        ctx,
        [[-78, 6], [-66, -24], [-12, -34], [52, -26], [58, 18], [4, 28], [-58, 22]],
        { tone: "#b28956", ribs: 2, pin: { x: 34, y: 0, r: 4.8, metal: "brass" } }
      );
      if (cfg.yawn) {
        S.drawCutoutPaperEdge(ctx, [[-74, 4], [-22, -2], [-18, 20], [-68, 20]], "#f43f5e", "#14110d", { paperRim: 1.4, shadow: false });
      } else {
        ctx.strokeStyle = "#14110d"; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(-74, 10); ctx.quadraticCurveTo(-24, 22, 22, 12); ctx.stroke();
      }

      if (cfg.happyEyes) {
        ctx.strokeStyle = "#14110d"; ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.arc(-18, -4, 7.5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      } else {
        ctx.fillStyle = "#fbfaf5"; ctx.strokeStyle = "#14110d"; ctx.lineWidth = 2.0;
        ctx.beginPath(); ctx.arc(-18, -6, 7.5, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#14110d";
        ctx.beginPath(); ctx.arc(-19, -6, 3.8, 0, TAU); ctx.fill();
      }

      if (cfg.crown) {
        S.drawCutoutPaperEdge(ctx, [[-32, -28], [-38, -64], [-18, -46], [0, -72], [18, -46], [38, -64], [32, -28]], "#facc15", "#14110d", { paperRim: 2.4 });
        S.drawSplitPin(ctx, 0, -44, 4.0, { metal: "brass" });
      }
      ctx.restore();

      return { spine: spine, foot: legIK };
    }

    function drawSubBottomDome(ctx, S, lampOn) {
      ctx.save();
      ctx.translate(618, 578);
      S.drawCutoutPaperEdge(ctx, [[-72, 18], [-60, -20], [-26, -38], [26, -38], [60, -20], [72, 18]], "#a6782a", "#14110d", { paperRim: 3.2 });
      ctx.fillStyle = lampOn ? "#ffe494" : "#4a463d";
      ctx.strokeStyle = "#14110d"; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.ellipse(0, -16, 42, 14, 0, Math.PI, TAU); ctx.fill(); ctx.stroke();
      S.drawSplitPin(ctx, -46, 0, 4.2, { metal: "brass" });
      S.drawSplitPin(ctx, 46, 0, 4.2, { metal: "brass" });
      ctx.restore();
    }

    B.definePortalGame(54, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 54, t, resolved, { pillarbox: true });

        // Crop atlas-46.webp ("Welcome to Trout Town") excluding corner mark at x>690
        S.drawScissorCutout(
          ctx, plates.atlasImg,
          36, 12, 645, 375,
          115 + Math.sin(t * 0.45) * 6, 54, 960, 415,
          [[0.03, 0.05], [0.54, 0.02], [0.97, 0.06], [0.95, 0.94], [0.04, 0.96]],
          { filter: "mono", haloWidth: 4.2, alpha: 0.88 }
        );

        B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.21, color: "#99f6e4", topY: 56 });
        B.drawDepthFog(ctx, W, H, t, { density: 0.14, color: "#cbd5e1" });

        // Overhanging shale ledge + creek floor boulders from p54.jpg
        S.drawScissorCutout(
          ctx, plates.portholeImg,
          182, 114, 318, 152,
          395, 46, 720, 232,
          [[0.02, 0.34], [0.36, 0.06], [0.96, 0.04], [0.98, 0.92], [0.54, 0.78], [0.08, 0.74]],
          { filter: "sepia", haloWidth: 4.8 }
        );
        S.drawScissorCutout(
          ctx, plates.portholeImg,
          138, 252, 148, 178,
          108, 335, 245, 225,
          [[0.06, 0.08], [0.88, 0.14], [0.95, 0.92], [0.05, 0.95]],
          { filter: "mono", haloWidth: 4.0 }
        );
        S.drawScissorCutout(
          ctx, plates.portholeImg,
          418, 312, 92, 172,
          955, 308, 205, 265,
          [[0.18, 0.04], [0.88, 0.08], [0.94, 0.95], [0.08, 0.94]],
          { filter: "mono", haloWidth: 4.0 }
        );
        // Flat slate creek porch ledge
        S.drawCardboardPuppetPiece(ctx, [[365, 472], [935, 464], [965, 518], [345, 518]], { tone: "#475569", ribs: 2 });
        drawAmbientCreekPolish(ctx, S, B, W, H, resolved, 54);
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        B.drawVolumetricBeam(ctx, 618, 558, 625, 295, {
          color: "#fde68a", coreColor: "#fffbeb", spread: 195, intensity: 0.55, t: t, seed: 54.0
        });
        drawHellbenderRig(ctx, S, { t: t });
        S.drawBrookTrout(ctx, 255, 308 + Math.sin(t * 2.1) * 7, 0.94, t, true);
        drawSubBottomDome(ctx, S, true);
      },

      stems: {
        // [✕] Side-Light Skin Folds: low-angle blue light turns skin-folds into glowing velvet ribbons
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t, su = B.easeOutCubic(resolved.stemU);
          drawSubSpotlight(ctx, S, B, 215, 425, 655, 345, {
            t: t, color: "#2563eb", coreColor: "#93c5fd", spread: 135, intensity: 0.65 + su * 0.75, seed: 54.1
          });
          drawHellbenderRig(ctx, S, {
            t: t, frillColor: "#3b82f6", frillScale: 1.28, swayScale: 1.3
          });
          drawSubBottomDome(ctx, S, true);
        },

        // [○] Ripple Ledge Current: crimson wake fans side-ruffles wide like a flamenco skirt!
        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t, su = B.clamp(resolved.stemU, 0, 1);
          drawCrimsonBallastJet(ctx, S, B, 965, 385, 615, 385, 0.55 + su * 0.6, t, 54.2);
          drawHellbenderRig(ctx, S, {
            t: t, frillColor: "#e11d48", frillScale: 1.75 + su * 0.4, danceSpeed: 4.5
          });
          drawSubBottomDome(ctx, S, false);
        },

        // [△] Check Family Chart: Mail Snail props illustrated Oubapo anatomy flip-card beside chin!
        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t, su = B.clamp(resolved.stemU, 0, 1);
          drawHellbenderRig(ctx, S, { t: t });
          // Hinged Oubapo anatomy flip-chart easel beside chin (pure frill drawings, 0 text!)
          var cx = 365, cy = 435;
          S.drawCutoutPaperEdge(ctx, [[cx - 46, cy - 42], [cx + 46, cy - 42], [cx + 52, cy + 38], [cx - 52, cy + 38]], "#fbfaf5", "#14110d", { paperRim: 2.5 });
          ctx.strokeStyle = "#b45309"; ctx.lineWidth = 3.0;
          ctx.beginPath();
          for (var w = 0; w <= 10; w++) {
            var wx = cx - 34 + w * 6.8, wy = cy + Math.sin(w * 1.4 + t * 4) * 12;
            if (w === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
          }
          ctx.stroke();
          S.drawSplitPin(ctx, cx - 26, cy - 42, 3.6, { metal: "brass" });
          S.drawSplitPin(ctx, cx + 26, cy - 42, 3.6, { metal: "brass" });

          B.drawSnailSilverTrail(ctx, 255, 495, cx - 8, 492, su, t, { arc: 10 });
          S.drawMailSnail(ctx, cx - 6, 490, 1.15, t, { postcard: false });
          drawSubBottomDome(ctx, S, true);
        },

        // [□] Tap Slate Ledge: brass probe taps twice on flat stone, lifting polite 4-toed foot!
        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t, su = B.clamp(resolved.stemU, 0, 1);
          var tapWave = Math.abs(Math.sin(t * 7.5));
          drawHellbenderRig(ctx, S, {
            t: t, footX: 585, footY: B.lerp(468, 422, su), highFour: su > 0.35
          });
          drawBrassScissorTongs(ctx, S, B, 965, 515, 725, 466 - tapWave * 16, 0.22, t, {
            sparks: true, seed: 54.4
          });
          drawSubBottomDome(ctx, S, true);
        }
      },

      outcomes: {
        x: {
          // Not Grandma's Gravy Boat: sleepy Hellbender yawns wide while X-ray crosses out porcelain gravy boat!
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            drawSubSpotlight(ctx, S, B, 215, 425, 625, 365, {
              t: t, color: "#3b82f6", coreColor: "#fef08a", spread: 145, intensity: 1.15
            });
            drawHellbenderRig(ctx, S, { t: t, yawn: true, frillScale: 1.2 });
            B.drawDeterministicParticles(ctx, "bubbles", 435, 412, t, { count: 12, loop: true, seed: 54.5 });

            // X-ray bubble upper-left crossing out floral porcelain gravy boat!
            B.drawXRayOverlay(ctx, 285, 215, 185, 128, B.clamp(u * 1.8, 0, 1), function (c, cx, cy) {
              S.drawCutoutPaperEdge(c, [[cx - 58, cy - 12], [cx + 52, cy - 16], [cx + 42, cy + 22], [cx - 46, cy + 22]], "#fbfaf5", "#1d596e", { paperRim: 1.5, shadow: false });
              c.strokeStyle = "#ef4444"; c.lineWidth = 5;
              c.beginPath(); c.moveTo(cx - 52, cy - 34); c.lineTo(cx + 52, cy + 34); c.moveTo(cx + 52, cy - 34); c.lineTo(cx - 52, cy + 34); c.stroke();
            }, { t: t });

            drawSubBottomDome(ctx, S, true);
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508 });
          },

          // Velvet Ribbon Creek Dancer: glowing bronze-amber ribbon waltz with looping Brook Trout & Snail!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSubSpotlight(ctx, S, B, 215, 415, 645, 345, {
              t: t, color: "#f59e0b", coreColor: "#fffbeb", spread: 165, intensity: 1.15
            });
            drawHellbenderRig(ctx, S, {
              t: t, offsetY: -22 + Math.sin(t * 2.8) * 14, frillColor: "#f59e0b", frillScale: 1.65, danceSpeed: 4.2, happyEyes: true
            });
            S.drawBrookTrout(ctx, 645 + Math.cos(t * 2.4) * 135, 225 + Math.sin(t * 2.4) * 32, 1.05, t, Math.sin(t * 2.4) > 0);
            S.drawMailSnail(ctx, 405, 488, 1.18, t, { hasReply: true });
            B.drawDeterministicParticles(ctx, "confetti", 635, 335, t, { count: 18, loop: true, seed: 54.6 });
            drawSubBottomDome(ctx, S, true);
          },

          // Crowned Ruffled Star-Emperor: royal cape + floating holographic crown + galaxy ripples along folds!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 615, 98, 1.24, t, 525, 385, { beamSpread: 175 });
            B.drawTractorRings(ctx, 615, 122, 525, 385, t, { spread: 155, rings: 5 });

            var rig = drawHellbenderRig(ctx, S, {
              t: t, offsetY: -26, cape: true, crown: true, frillColor: "#0f8f80", bodyColor: "#7c3aed", frillScale: 1.55, headTilt: -0.12
            });
            // Miniature spiral galaxies twinkling along lit skin-folds!
            for (var g = 1; g <= 4; g++) {
              B.drawLanternHalo(ctx, rig.spine[g].x, rig.spine[g].y - 12, 34, {
                color: g % 2 === 0 ? "#fde047" : "#38bdf8", intensity: 1.15, t: t + g
              });
            }
            drawSubBottomDome(ctx, S, true);
          }
        },

        o: {
          // Fresh Oxygen Belly Tickle: happy spa-bliss eyes + clinging sparkling micro-bubbles (no dragon fire!)
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            drawCrimsonBallastJet(ctx, S, B, 965, 415, 635, 405, 0.78, t, 54.65);
            var rig = drawHellbenderRig(ctx, S, {
              t: t, happyEyes: true, frillScale: 1.45, frillColor: "#fb7185"
            });
            for (var mb = 0; mb < 14; mb++) {
              var si = mb % 5;
              ctx.fillStyle = "rgba(224, 242, 254, 0.9)";
              ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 1.4;
              ctx.beginPath();
              ctx.arc(rig.spine[si].x + (mb % 3 - 1) * 24, rig.spine[si].y - 8 + Math.sin(t * 5 + mb) * 8, 5 + (mb % 3) * 2.5, 0, TAU);
              ctx.fill(); ctx.stroke();
            }
            drawSubBottomDome(ctx, S, true);
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508 });
          },

          // Clean Slate Ledge Sweep: silt swept off mosaic river-porch shared by Hellbender, Trout & Snail!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            // Clean colorful mosaic river stones revealed along swept slate porch!
            var stoneCols = ["#94a3b8", "#fbbf24", "#5eead4", "#fda4af"];
            for (var st = 0; st < 11; st++) {
              S.drawCutoutPaperEdge(ctx, makeCirclePoly(10, 22, 11, 405 + st * 46, 488), stoneCols[st % 4], "#14110d", { paperRim: 1.5, shadow: false });
            }
            B.drawLanternHalo(ctx, 435, 315, 95, { color: "#fbbf24", coreColor: "#ffffff", intensity: 1.15, t: t });
            drawHellbenderRig(ctx, S, { t: t, offsetX: 55, happyEyes: true });
            S.drawBrookTrout(ctx, 355, 365 + Math.sin(t * 2.3) * 7, 1.06, t, true);
            S.drawMailSnail(ctx, 445, 464, 1.16, t, { hasReply: true });
            drawSubBottomDome(ctx, S, true);
          },

          // Levitated Frilly Hover-Dragon: buoyed in cyan anti-gravity saucer ray flying with wide wing-ruffles!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 635, 96, 1.24, t, 635, 315, { beamSpread: 185 });
            B.drawTractorRings(ctx, 635, 120, 635, 315, t, { spread: 165, rings: 6 });

            drawHellbenderRig(ctx, S, {
              t: t,
              offsetX: Math.cos(t * 2.2) * 45,
              offsetY: -125 + Math.sin(t * 2.8) * 24,
              frillColor: "#22d3ee",
              frillScale: 2.15,
              danceSpeed: 5.0,
              happyEyes: true
            });
            B.drawDeterministicParticles(ctx, "tractor_rings", 635, 295, t, { count: 12, loop: true, seed: 54.75 });
            drawSubBottomDome(ctx, S, true);
          }
        },

        triangle: {
          // Long-Lost Wrinkled Cousin Match: split-page Oubapo flip-chart matching Turkey wattle & Hellbender frill!
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            drawHellbenderRig(ctx, S, { t: t, offsetX: 65, happyEyes: true });

            // Side-by-side Oubapo comparison flip-book (left: crimson wattle drawing, right: russet frill drawing + heart!)
            var bx = 375, by = 335;
            S.drawCutoutPaperEdge(ctx, [[bx - 105, by - 58], [bx - 4, by - 58], [bx - 4, by + 58], [bx - 105, by + 58]], "#fbfaf5", "#14110d", { paperRim: 2.5 });
            S.drawCutoutPaperEdge(ctx, [[bx + 4, by - 58], [bx + 105, by - 58], [bx + 105, by + 58], [bx + 4, by + 58]], "#fbfaf5", "#14110d", { paperRim: 2.5 });
            // Left drawing: ruffled crimson Turkey wattle
            S.drawCutoutPaperEdge(ctx, [[bx - 65, by - 28], [bx - 42, by - 12], [bx - 50, by + 12], [bx - 38, by + 32], [bx - 68, by + 26]], "#dc2626", "#14110d", { paperRim: 1.4, shadow: false });
            // Right drawing: ruffled russet Hellbender fold
            S.drawCutoutPaperEdge(ctx, [[bx + 26, by + 18], [bx + 38, by - 18], [bx + 56, by + 8], [bx + 74, by - 18], [bx + 88, by + 18]], "#b8874e", "#14110d", { paperRim: 1.4, shadow: false });
            // Emerald match circle between pages
            S.drawCutoutPaperEdge(ctx, makeCirclePoly(14, 16, 16, bx, by), "#10b981", "#14110d", { paperRim: 1.8 });

            S.drawMailSnail(ctx, 375, 464, 1.16, t, { hasReply: false });
            drawSubBottomDome(ctx, S, true);
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508, actorX: 245, actorY: 505, actorScale: 0.96 });
          },

          // Clean-Water Creek Ambassador Badge: gold-and-turquoise pure-water drop medallion hung beside ledge!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawHellbenderRig(ctx, S, { t: t, offsetX: 35, happyEyes: true });

            // Gold & Turquoise Water-Drop Medallion hanging on ribbon from shale overhang (0 text!)
            var mx = 425, my = 295 + Math.sin(t * 3) * 4;
            ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 6;
            ctx.beginPath(); ctx.moveTo(mx, 175); ctx.lineTo(mx, my); ctx.stroke();
            B.drawLanternHalo(ctx, mx, my, 68, { color: "#fde047", intensity: 1.15, t: t });
            S.drawCutoutPaperEdge(ctx, makeCirclePoly(18, 38, 38, mx, my), "#eab308", "#14110d", { paperRim: 2.8 });
            S.drawCutoutPaperEdge(ctx, [[mx, my - 22], [mx + 16, my + 6], [mx, my + 20], [mx - 16, my + 6]], "#06b6d4", "#14110d", { paperRim: 1.5, shadow: false });

            S.drawBrookTrout(ctx, 275, 345 + Math.sin(t * 2.4) * 8, 1.06, t, true);
            S.drawMailSnail(ctx, 445, 464, 1.18, t, { hasReply: true });
            drawSubBottomDome(ctx, S, true);
          },

          // Paleozoic Diplomat Passport Stamp: glowing crystal tablet with 4-toed print + spiral fossil stamped by Snail!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 515, 98, 1.24, t, 415, 355, { beamSpread: 165 });
            B.drawTractorRings(ctx, 515, 122, 415, 355, t, { spread: 145, rings: 5 });

            drawHellbenderRig(ctx, S, { t: t, offsetX: 85, headTilt: -0.08 });

            // Glowing translucent crystal VIP passport scroll floating in saucer beam (0 text!)
            var px = 395, py = 345 + Math.sin(t * 3.2) * 6;
            B.drawLanternHalo(ctx, px, py, 95, { color: "#34d399", coreColor: "#fef08a", intensity: 1.25, t: t });
            S.drawCutoutPaperEdge(ctx, [[px - 62, py - 76], [px + 62, py - 76], [px + 62, py + 76], [px - 62, py + 76]], "rgba(209, 250, 229, 0.92)", "#059669", { paperRim: 3.0, lineWidth: 2.8 });
            // 4-toed footprint + golden star seal on crystal passport
            ctx.fillStyle = "#065f46";
            ctx.beginPath(); ctx.arc(px, py - 14, 16, 0, TAU); ctx.fill();
            for (var toe = -1.5; toe <= 1.5; toe += 1) {
              ctx.beginPath(); ctx.arc(px + toe * 13, py - 38, 5.5, 0, TAU); ctx.fill();
            }
            drawRoyalWaxSeal55(ctx, S, px + 22, py + 36, 20, 1, t);

            S.drawMailSnail(ctx, 325, 458, 1.2, t, { hasReply: true, hasAlienStamp: true });
            drawSubBottomDome(ctx, S, true);
          }
        },

        square: {
          // Shy Salamander Rock Peekaboo: giant salamander tucks politely under rock overhang peeking one eye out!
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.35, 0, 1);
            // Scooted shyly up & right into dark overhang shadow, peeking cute head out!
            drawHellbenderRig(ctx, S, {
              t: t, offsetX: B.lerp(0, 148, u), offsetY: B.lerp(0, -68, u), frillScale: 0.75
            });
            drawBrassScissorTongs(ctx, S, B, 965, 515, 655, 466, 0.25, t, { sparks: false });
            drawSubBottomDome(ctx, S, true);
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508, actorX: 255, actorY: 505, actorScale: 0.96 });
          },

          // High-Four Creek Neighbor Handshake: 4 tiny salamander toes gently boop rubber-tipped brass tongs!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.3, 0, 1);
            var boopX = 685, boopY = 408;
            drawHellbenderRig(ctx, S, {
              t: t, footX: boopX - 8, footY: boopY, highFour: true, happyEyes: true
            });
            drawBrassScissorTongs(ctx, S, B, 975, 505, boopX + 18, boopY - 4, 0.18, t, {
              tipColor: "#f59e0b", sparks: false
            });
            // Warm golden contact boop halo!
            B.drawLanternHalo(ctx, boopX, boopY, 58, { color: "#facc15", coreColor: "#ffffff", intensity: 1.2, t: t });
            B.drawDeterministicParticles(ctx, "kintsugi", boopX, boopY, t, { count: 14, loop: true, seed: 54.9 });
            S.drawBrookTrout(ctx, 285, 335, 1.05, t, true);
            S.drawMailSnail(ctx, 415, 466, 1.16, t, { hasReply: true });
            drawSubBottomDome(ctx, S, true);
          },

          // Ancient Slate Monolith Chime: resonant creek slate glows & rings rainbow harmonic chords to saucer!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 635, 98, 1.24, t, 635, 468, { beamSpread: 185 });

            // Glowing resonant slate monolith + expanding multi-colored harmonic chord rings!
            S.drawCutoutPaperEdge(ctx, [[365, 468], [935, 462], [965, 518], [345, 518]], "#1e40af", "#60a5fa", { paperRim: 3.2, lineWidth: 3.2 });
            var ringCols = ["#34d399", "#facc15", "#f472b6", "#60a5fa"];
            ctx.save();
            for (var r = 0; r < 4; r++) {
              var ru = ((t * 0.65 + r * 0.25) % 1);
              ctx.strokeStyle = B.rgba(ringCols[r], 1 - ru);
              ctx.lineWidth = 3.5;
              ctx.beginPath();
              ctx.ellipse(645, B.lerp(475, 135, ru), B.lerp(245, 85, ru), B.lerp(42, 18, ru), 0, 0, TAU);
              ctx.stroke();
            }
            ctx.restore();

            drawHellbenderRig(ctx, S, { t: t, frillColor: "#38bdf8", danceSpeed: 4.0, happyEyes: true });
            drawBrassScissorTongs(ctx, S, B, 985, 520, 795, 468, 0.22, t, { sparks: true, seed: 54.99 });
            drawSubBottomDome(ctx, S, true);
          }
        }
      }
    });
  })();

  // ============================================================================
  // PORTHOLE #55 · EDDY  ("queneau-rostrum" · p55.jpg + atlas-06.webp)
  // GRAND 55-PORTHOLE RECURSIVE FINALE!
  // Corked brass Verne capsule stuffed with 54 painted creek postcards
  // ============================================================================
  (function definePortal55() {
    var B = getEngine();
    var S0 = getStage();
    if (!B || !S0) return;

    function drawBrassVerneCapsule(ctx, S, pImg, opts) {
      var cfg = opts || {};
      var tx = cfg.x != null ? cfg.x : 512;
      var ty = cfg.y != null ? cfg.y : 306;
      var ang = cfg.ang != null ? cfg.ang : -0.56;
      var sc = cfg.scale || 1.0;
      var corkPop = cfg.corkPop || 0;
      var t = cfg.t || 0;

      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(ang);
      ctx.scale(sc, sc);

      // Fluttering crimson & emerald tail ribbons tied at bottom collar
      if (cfg.ribbons !== false) {
        for (var rb = -1; rb <= 1; rb += 2) {
          var wave = Math.sin(t * 5.2 + rb) * 14;
          S.drawCutoutPaperEdge(
            ctx,
            [[rb * 18, 128], [rb * 42 + wave, 188], [rb * 22 + wave, 178], [rb * 8 + wave, 198], [rb * 4, 128]],
            rb < 0 ? "#d42a1e" : "#0f8f80",
            "#14110d",
            { paperRim: 1.8, shadow: false }
          );
        }
      }

      // Real scissored glass window containing tied colorful rolled scrolls from p55.jpg!
      S.drawScissorCutout(
        ctx, pImg,
        222, 212, 196, 228,
        -74, -106, 148, 212,
        [[0.04, 0.04], [0.96, 0.04], [0.96, 0.96], [0.04, 0.96]],
        { haloWidth: 5.0, stroke: "#14110d", lineWidth: 2.2 }
      );
      if (cfg.innerGlow) {
        ctx.fillStyle = cfg.innerGlow;
        ctx.fillRect(-68, -98, 136, 196);
      }
      ctx.fillStyle = "rgba(255, 255, 255, 0.38)";
      ctx.fillRect(-52, -96, 15, 192);
      ctx.fillRect(34, -96, 7, 192);

      // Embossed upper & lower riveted brass collars
      S.drawCutoutPaperEdge(ctx, [[-84, -132], [84, -132], [88, -94], [-88, -94]], "#d4a44c", "#14110d", { paperRim: 3.0 });
      S.drawCutoutPaperEdge(ctx, [[-88, 94], [88, 94], [82, 134], [-82, 134]], "#b88632", "#14110d", { paperRim: 3.0 });
      S.drawSplitPin(ctx, -56, -113, 4.2, { metal: "brass" });
      S.drawSplitPin(ctx, 56, -113, 4.2, { metal: "brass" });
      S.drawSplitPin(ctx, -56, 113, 4.2, { metal: "brass" });
      S.drawSplitPin(ctx, 56, 113, 4.2, { metal: "brass" });

      // Red-wax & cork stopper (seated or popped!)
      ctx.save();
      ctx.translate(-corkPop * 42, -148 - corkPop * 68);
      ctx.rotate(-corkPop * 0.55);
      S.drawCardboardPuppetPiece(ctx, [[-54, -26], [54, -26], [46, 20], [-46, 20]], {
        tone: "#b88752", ribs: 2, pin: { x: 0, y: 8, r: 4.2, metal: "brass" }
      });
      // Dripping crimson wax crown on cork
      S.drawCutoutPaperEdge(ctx, [[-56, -28], [56, -28], [52, -8], [26, -2], [8, -12], [-18, 0], [-52, -10]], "#dc2626", "#14110d", { paperRim: 1.8, shadow: false });
      if (cfg.goldStamp) {
        drawRoyalWaxSeal55(ctx, S, 0, -24, 24, 1.0, t);
      }
      ctx.restore();

      ctx.restore();
    }

    function drawGoldenEddySwirl(ctx, cx, cy, rx, ry, t, goldBoost) {
      ctx.save();
      for (var i = 0; i < 4; i++) {
        var rScale = 0.45 + i * 0.22;
        ctx.strokeStyle = i % 2 === 0
          ? (goldBoost ? "rgba(234, 179, 8, 0.62)" : "rgba(15, 143, 128, 0.45)")
          : "rgba(251, 250, 245, 0.68)";
        ctx.lineWidth = 3.2 - i * 0.4;
        ctx.setLineDash([22, 12]);
        ctx.lineDashOffset = -t * (55 - i * 8);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx * rScale, ry * rScale, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    B.definePortalGame(55, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        // 1. Authentic Buttercream Queneau Rostrum Paper + Torn-Deckle Green Floor (exercices-de-style.webp!)
        S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 55, t, resolved, {
          floor: true
        });

        // 2. Right Torn-Deckle Dispatch Door framing atlas-06.webp ("The Fish Don't Negotiate" bus trout!)
        var doorX = 962 + Math.sin(t * 0.4) * 5;
        var doorY = 62;
        S.drawTornPaperFlat(ctx, doorX, doorY, 240, 452, {
          fill: "#263a19", paperColor: "#f2ece0", deckle: 7.5
        });
        S.drawScissorCutout(
          ctx, plates.atlasImg,
          14, 168, 354, 415,
          doorX + 22, doorY + 84, 196, 265,
          [[0.04, 0.04], [0.96, 0.03], [0.95, 0.96], [0.05, 0.95]],
          { filter: "sepia", haloWidth: 4.0 }
        );
        // Pure vector envelope plaque above dispatch door (0 text!)
        S.drawTornPaperFlat(ctx, doorX + 50, doorY + 22, 140, 38, { fill: "#eae3d2", deckle: 3.0, shadow: false });
        ctx.strokeStyle = "#14110d"; ctx.lineWidth = 1.8;
        ctx.strokeRect(doorX + 94, doorY + 30, 52, 22);
        ctx.beginPath(); ctx.moveTo(doorX + 94, doorY + 30); ctx.lineTo(doorX + 120, doorY + 43); ctx.lineTo(doorX + 146, doorY + 30); ctx.stroke();

        // 3. Swirling Teal Eddy Cutouts from p55.jpg on left & right multiplane cards
        S.drawScissorCutout(
          ctx, plates.portholeImg,
          138, 152, 148, 305,
          78, 88, 240, 405,
          [[0.12, 0.04], [0.88, 0.08], [0.76, 0.52], [0.92, 0.92], [0.14, 0.95], [0.04, 0.48]],
          { haloWidth: 4.6 }
        );
        S.drawScissorCutout(
          ctx, plates.portholeImg,
          362, 148, 142, 302,
          692, 96, 232, 382,
          [[0.08, 0.06], [0.90, 0.04], [0.95, 0.52], [0.84, 0.94], [0.12, 0.90]],
          { haloWidth: 4.6 }
        );

        B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.16, color: "#fef9c3", topY: 64 });
        B.drawDepthFog(ctx, W, H, t, { density: 0.10, color: "#fef3c7" });
        drawAmbientCreekPolish(ctx, S, B, W, H, resolved, 55);
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawGoldenEddySwirl(ctx, 512, 330, 290, 125, t, false);
        B.drawLanternHalo(ctx, 512, 306, 165, { color: "#fde047", coreColor: "#fffbeb", intensity: 0.95, t: t });
        drawBrassVerneCapsule(ctx, S, plates.portholeImg, {
          x: 512, y: 306 + Math.sin(t * 2.2) * 6, ang: -0.56 + Math.sin(t * 1.5) * 0.04, t: t
        });
        S.drawBrookTrout(ctx, 885 + Math.sin(t * 2.0) * 12, 315, 0.96, t, false);
      },

      stems: {
        // [✕] Project Brass Capsule: spotlight blazes through spy-window projecting glowing frames #1..#54!
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t, su = B.easeOutCubic(resolved.stemU);
          drawSubSpotlight(ctx, S, B, 175, 365, 485, 306, {
            t: t, color: "#2563eb", coreColor: "#fef08a", spread: 95, intensity: 1.25, seed: 55.1
          });
          // Magic-lantern golden fan beam emerging out the right side of the glass tube!
          B.drawVolumetricBeam(ctx, 525, 295, 885, 275, {
            color: "#f59e0b", coreColor: "#fffbeb", sourceRadius: 36, spread: 165 * su + 25, intensity: 0.55 + su * 0.85, t: t, seed: 55.12
          });
          drawBrassVerneCapsule(ctx, S, plates.portholeImg, {
            x: 495, y: 306, ang: -0.35, innerGlow: "rgba(254, 240, 138, 0.42)", t: t
          });
          // Arc of projected glowing miniature porthole frames floating in the golden lantern beam!
          var frameCount = Math.max(3, Math.round(su * 9));
          for (var f = 0; f < frameCount; f++) {
            var fa = -0.65 + (f / 8) * 1.3;
            var fx = 635 + Math.cos(fa) * (135 + (f % 2) * 58);
            var fy = 285 + Math.sin(fa) * 145;
            drawMiniaturePostcard(ctx, S, fx, fy, 52, 36, Math.sin(t * 2.5 + f) * 0.12, f * 6, { paper: "#fefce8" });
          }
        },

        // [○] Spin Golden Eddy: joyous crimson-and-gold swirl stands corked brass capsule upright like carousel spindle!
        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t, su = B.easeOutBack(resolved.stemU);
          drawCrimsonBallastJet(ctx, S, B, 235, 435, 515, 385, 0.65 + resolved.stemU * 0.55, t, 55.2);
          drawGoldenEddySwirl(ctx, 525, 365, 325, 118, t * 2.2, true);
          drawBrassVerneCapsule(ctx, S, plates.portholeImg, {
            x: 525,
            y: 298 + Math.sin(t * 5) * 4,
            ang: B.lerp(-0.56, 0.0, B.clamp(su, 0, 1.08)),
            t: t * 1.8
          });
          B.drawDeterministicParticles(ctx, "kintsugi", 525, 325, t, { count: 18, loop: true, seed: 55.25 });
        },

        // [△] Stamp Final Cork: Mail Snail climbs to top of red wax cork & presses gleaming gold Postmark #55!
        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t, su = B.clamp(resolved.stemU, 0, 1);
          drawGoldenEddySwirl(ctx, 515, 340, 275, 115, t, false);
          drawBrassVerneCapsule(ctx, S, plates.portholeImg, {
            x: 515, y: 326, ang: 0.0, goldStamp: su > 0.55, t: t
          });
          var sx = B.lerp(355, 515, su);
          var sy = B.lerp(485, 138, B.easeInOutCubic(su));
          B.drawSnailSilverTrail(ctx, 355, 485, sx, sy, su, t, { arc: 36 });
          S.drawMailSnail(ctx, sx, sy, 1.18, t, { postcard: false });
          if (su > 0.55) {
            B.drawLanternHalo(ctx, 515, 152, 85, { color: "#facc15", coreColor: "#ffffff", intensity: 1.35, t: t });
            B.drawDeterministicParticles(ctx, "brass_sparks", 515, 152, t, { count: 16, loop: true, seed: 55.3 });
          }
        },

        // [□] Uncork Brass Tube: brass scissor-tongs grip swollen cork & pop it loose in fizzy burst!
        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t, su = B.clamp(resolved.stemU, 0, 1);
          var pop = su > 0.38 ? B.easeOutBack((su - 0.38) / 0.62) : 0;
          drawBrassVerneCapsule(ctx, S, plates.portholeImg, {
            x: 515, y: 325, ang: -0.32, corkPop: pop * 1.15, t: t
          });
          drawBrassScissorTongs(ctx, S, B, 885, 495, 465 - pop * 28, 185 - pop * 34, pop > 0.1 ? 0.55 : 0.18, t, {
            sparks: true, seed: 55.4
          });
          if (pop > 0.05) {
            B.drawDeterministicParticles(ctx, "bubbles", 455, 185, t, { count: 24, loop: true, seed: 55.42 });
            B.drawDeterministicParticles(ctx, "confetti", 455, 185, pop * 0.9, { count: 20, seed: 55.45 });
          }
        }
      },

      outcomes: {
        x: {
          // Turkey's Own Feathery Logbook (6.0s strip shot!): giant View-Master reel of postcards + feathery Captain's Log!
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            drawSubSpotlight(ctx, S, B, 165, 355, 415, 315, {
              t: t, color: "#2563eb", coreColor: "#fef08a", spread: 88, intensity: 1.15
            });
            B.drawVolumetricBeam(ctx, 445, 305, 765, 295, {
              color: "#f59e0b", coreColor: "#fffbeb", sourceRadius: 32, spread: 215, intensity: 1.05, t: t, seed: 55.5
            });
            drawBrassVerneCapsule(ctx, S, plates.portholeImg, {
              x: 415, y: 315, ang: -0.28, scale: 0.88, innerGlow: "rgba(254, 240, 138, 0.45)", t: t
            });

            // Giant Rotating Cream View-Master Stereopticon Reel displaying 12 miniature creek postcards!
            var vx = 735, vy = 292, vr = 158;
            ctx.save();
            ctx.translate(vx, vy);
            ctx.rotate(t * 0.48);
            var reelNotchPts = [];
            for (var n = 0; n < 24; n++) {
              var na = (n / 24) * TAU;
              var nr = n % 2 === 0 ? vr : vr - 10;
              reelNotchPts.push([Math.cos(na) * nr, Math.sin(na) * nr]);
            }
            S.drawCutoutPaperEdge(ctx, reelNotchPts, "#fefce8", "#14110d", { paperRim: 3.5 });
            for (var s = 0; s < 12; s++) {
              var sa = (s / 12) * TAU;
              drawMiniaturePostcard(ctx, S, Math.cos(sa) * 112, Math.sin(sa) * 112, 46, 32, sa + Math.PI * 0.5, s * 4 + 1, { shadow: false });
            }
            S.drawCutoutPaperEdge(ctx, makeCirclePoly(16, 42, 42, 0, 0), "#d42a1e", "#14110d", { paperRim: 2.2 });
            S.drawReinigerFiligreeHinge(ctx, 0, 0, 11, { metal: "brass" });
            ctx.restore();

            // Feathery Captain's Logbook + Quill Feather beside joyous Turkey!
            ctx.save();
            ctx.translate(295, 492);
            S.drawCutoutPaperEdge(ctx, [[-52, -32], [52, -32], [58, 32], [-58, 32]], "#7c2d12", "#14110d", { paperRim: 2.5 });
            S.drawCutoutPaperEdge(ctx, [[-44, -26], [-2, -26], [-2, 24], [-44, 24]], "#fbfaf5", "#14110d", { paperRim: 1.2, shadow: false });
            S.drawCutoutPaperEdge(ctx, [[2, -26], [44, -26], [44, 24], [2, 24]], "#fbfaf5", "#14110d", { paperRim: 1.2, shadow: false });
            // Brown-and-gold Turkey quill feather resting on logbook!
            S.drawCutoutPaperEdge(ctx, [[12, 18], [48, -42], [62, -34], [22, 22]], "#d97706", "#14110d", { paperRim: 1.6 });
            ctx.restore();

            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508, dispatch: 0.9 });
          },

          // Fifty-Four Porthole Lantern Cinema: 6x9 (54-frame!) curved cinema screen applauded by entire creek cast!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawBrassVerneCapsule(ctx, S, plates.portholeImg, {
              x: 245, y: 315, ang: 0.25, scale: 0.82, innerGlow: "rgba(254, 240, 138, 0.5)", t: t
            });
            B.drawVolumetricBeam(ctx, 295, 295, 675, 265, {
              color: "#fbbf24", coreColor: "#fffbeb", sourceRadius: 28, spread: 215, intensity: 0.95, t: t, seed: 55.55
            });

            // Grand 9x6 = 54-Postcard Curved Underwater Cinema Matrix!
            S.drawCutoutPaperEdge(ctx, [[395, 92], [935, 92], [945, 412], [385, 412]], "#1c1917", "#eab308", { paperRim: 4.0, lineWidth: 3.0 });
            var idx = 0;
            for (var row = 0; row < 6; row++) {
              for (var col = 0; col < 9; col++) {
                var cx = 428 + col * 58.5;
                var cy = 122 + row * 48 + Math.sin(col * 0.4 + t * 2) * 2.5;
                drawMiniaturePostcard(ctx, S, cx, cy, 50, 36, 0, idx, { shadow: false, rim: 1.2 });
                idx++;
              }
            }

            // Cheering creek audience in front row: Brook Trout, Mail Snail, peaked-cap Trout Cop & golden Snail Darter!
            S.drawMailSnail(ctx, 455, 504, 1.18, t, { hasReply: true });
            S.drawBrookTrout(ctx, 645, 492 + Math.sin(t * 4) * 6, 0.98, t, true);
            // Trout Cop in blue peaked cap
            S.drawBrookTrout(ctx, 845, 488 + Math.cos(t * 4) * 6, 0.96, t, false);
            S.drawCutoutPaperEdge(ctx, [[782, 466], [818, 462], [812, 476], [776, 476]], "#1e3a8a", "#14110d", { paperRim: 1.4, shadow: false });
            // Tiny golden Snail Darter minnow
            S.drawBrookTrout(ctx, 545, 518, 0.48, t * 1.6, true);
          },

          // Fifty-Four Galaxy Hologram Archive: 3 tilted planetarium rings of 54 glowing cards orbiting crew & saucer!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 545, 94, 1.24, t, 545, 325, { beamSpread: 210 });
            B.drawTractorRings(ctx, 545, 118, 545, 325, t, { spread: 185, rings: 6 });
            drawBrassVerneCapsule(ctx, S, plates.portholeImg, {
              x: 545, y: 325, ang: 0.0, scale: 0.78, goldStamp: true, t: t
            });

            // 14 + 18 + 22 = 54 shimmering holographic porthole cards in 3 harmonic rings!
            var counts = [14, 18, 22];
            var radii = [145, 225, 305];
            var cardId = 0;
            for (var rg = 0; rg < 3; rg++) {
              var n = counts[rg], rx = radii[rg], ry = rx * 0.42;
              var dir = rg % 2 === 0 ? 1 : -1;
              for (var c = 0; c < n; c++) {
                var a = (c / n) * TAU + t * 0.52 * dir + rg * 0.4;
                drawMiniaturePostcard(
                  ctx, S,
                  545 + Math.cos(a) * rx,
                  325 + Math.sin(a) * ry,
                  34, 24,
                  Math.sin(a) * 0.22,
                  cardId++,
                  { paper: "#ecfeff", shadow: false, rim: 1.2 }
                );
              }
            }
            S.drawBrookTrout(ctx, 905, 455, 0.96, t, false);
            S.drawMailSnail(ctx, 235, 495, 1.15, t, { hasReply: true, hasAlienStamp: true });
          }
        },

        o: {
          // Zero Eviction Notice Whirlpool: upright brass bottle flashes polished Eternal Creek Pass shield + confetti!
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            drawGoldenEddySwirl(ctx, 545, 365, 335, 125, t * 2.2, true);
            drawBrassVerneCapsule(ctx, S, plates.portholeImg, {
              x: 545, y: 298, ang: 0.0, t: t
            });

            // Gleaming Brass Eternal Creek Pass Shield Plaque with Emerald Checkmark & Ship's Wheel (0 text!)
            var sx = 545, sy = 305;
            B.drawLanternHalo(ctx, sx, sy, 125, { color: "#facc15", coreColor: "#ffffff", intensity: 1.25, t: t });
            S.drawCutoutPaperEdge(ctx, [[sx - 58, sy - 64], [sx + 58, sy - 64], [sx + 62, sy + 12], [sx, sy + 72], [sx - 62, sy + 12]], "#fef08a", "#b45309", { paperRim: 3.0, lineWidth: 3.0 });
            S.drawCutoutPaperEdge(ctx, makeCirclePoly(16, 34, 34, sx, sy - 6), "#10b981", "#14110d", { paperRim: 1.8, shadow: false });
            ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 6.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
            ctx.beginPath(); ctx.moveTo(sx - 15, sy - 6); ctx.lineTo(sx - 3, sy + 8); ctx.lineTo(sx + 18, sy - 16); ctx.stroke();

            B.drawDeterministicParticles(ctx, "confetti", 545, 235, t, { count: 26, loop: true, seed: 55.6 });
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508, actorX: 275, actorY: 495 + Math.abs(Math.sin(t * 7)) * -18, actorScale: 1.02 });
          },

          // Grand Eddy Postcard Carousel (11.8s strip shot!): striped carousel canopy + 54 fluttering maypole ribbons!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var cx = 535, cy = 320;
            drawGoldenEddySwirl(ctx, cx, 445, 360, 95, t * 2.4, true);

            // 54 colorful fluttering maypole ribbon streamers radiating from carousel top!
            var ribCols = ["#ef4444", "#eab308", "#10b981", "#3b82f6", "#ec4899", "#f97316"];
            ctx.save();
            for (var r = 0; r < 54; r++) {
              var ra = (r / 54) * TAU + t * 0.9;
              var endX = cx + Math.cos(ra) * 295;
              var endY = 395 + Math.sin(ra) * 86;
              ctx.strokeStyle = ribCols[r % 6];
              ctx.lineWidth = 2.4;
              ctx.beginPath();
              ctx.moveTo(cx, 152);
              ctx.quadraticCurveTo(cx + Math.cos(ra) * 155, 235 + Math.sin(t * 5 + r) * 12, endX, endY);
              ctx.stroke();
              if (r % 6 === 0) {
                drawMiniaturePostcard(ctx, S, endX, endY, 38, 26, Math.sin(ra) * 0.25, r, { shadow: false, rim: 1.4 });
              }
            }
            ctx.restore();

            // Upright Brass Carousel Spindle + Scalloped Red-and-Gold Striped Tent Canopy!
            drawBrassVerneCapsule(ctx, S, plates.portholeImg, { x: cx, y: cy, ang: 0.0, scale: 0.92, t: t });
            S.drawCutoutPaperEdge(ctx, [[cx - 145, 168], [cx, 88], [cx + 145, 168]], "#dc2626", "#14110d", { paperRim: 3.5 });
            for (var st = -2; st <= 2; st++) {
              if (st % 2 === 0) {
                S.drawCutoutPaperEdge(ctx, [[cx, 88], [cx + st * 38 - 18, 168], [cx + st * 38 + 18, 168]], "#facc15", "#14110d", { paperRim: 1.0, shadow: false });
              }
            }
            S.drawSplitPin(ctx, cx, 88, 6.0, { metal: "brass" });

            // Leaping Brook Trout + Bell-ringing Mail Snail riding the carousel!
            S.drawBrookTrout(ctx, cx + 235, 335 - Math.abs(Math.sin(t * 3.8)) * 45, 1.08, t, false, { tilt: -0.32 });
            S.drawMailSnail(ctx, cx - 215, 425 + Math.sin(t * 3.8) * 12, 1.22, t, { hasReply: true });
            // Tiny brass bell above Snail
            S.drawCutoutPaperEdge(ctx, [[cx - 185, 385], [cx - 165, 385], [cx - 158, 406], [cx - 192, 406]], "#eab308", "#14110d", { paperRim: 1.6 });
          },

          // Time-Loop Whirlpool Launch Finale: brass capsule becomes golden time-compass rose with fireworks & bubbles!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 535, 92, 1.24, t, 535, 335, { beamSpread: 195 });
            B.drawTractorRings(ctx, 535, 116, 535, 335, t, { spread: 175, rings: 6 });
            drawGoldenEddySwirl(ctx, 535, 355, 335, 135, -t * 2.6, true);

            // Ornate 8-Point Golden Astronomical Time-Compass Rose!
            var cx = 535, cy = 335;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(t * 0.75);
            var starPts = [];
            for (var p = 0; p < 16; p++) {
              var pa = (p / 16) * TAU;
              var pr = p % 2 === 0 ? 158 : 68;
              starPts.push([Math.cos(pa) * pr, Math.sin(pa) * pr]);
            }
            S.drawCutoutPaperEdge(ctx, starPts, "#eab308", "#14110d", { paperRim: 3.5 });
            ctx.restore();

            drawBrassVerneCapsule(ctx, S, plates.portholeImg, {
              x: cx, y: cy, ang: Math.sin(t * 3.2) * 0.45, scale: 0.78, goldStamp: true, t: t
            });
            B.drawDeterministicParticles(ctx, "kintsugi", 315, 185, t, { count: 22, loop: true, seed: 55.65 });
            B.drawDeterministicParticles(ctx, "confetti", 765, 195, t, { count: 22, loop: true, seed: 55.68 });
          }
        },

        triangle: {
          // Stamped Round-Trip Home Delivery: gold Postmark #55 + Snail emerald pennant + Turkey Sub-Postmaster medal!
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            drawGoldenEddySwirl(ctx, 535, 345, 295, 118, t, true);
            B.drawLanternHalo(ctx, 535, 165, 115, { color: "#facc15", coreColor: "#ffffff", intensity: 1.35, t: t });
            drawBrassVerneCapsule(ctx, S, plates.portholeImg, {
              x: 535, y: 332, ang: 0.0, goldStamp: true, t: t
            });

            // Mail Snail unfurling emerald ALL-CLEAR swallowtail pennant (star + checkmark emblem, 0 text!)
            S.drawMailSnail(ctx, 685, 475, 1.24, t, { flip: true, hasReply: true });
            ctx.save();
            ctx.translate(695, 455);
            ctx.strokeStyle = "#14110d"; ctx.lineWidth = 3.0;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -115); ctx.stroke();
            S.drawCutoutPaperEdge(ctx, [[0, -112], [118, -104], [96, -82], [118, -60], [0, -54]], "#10b981", "#14110d", { paperRim: 2.2 });
            ctx.strokeStyle = "#fef08a"; ctx.lineWidth = 4.2;
            ctx.beginPath(); ctx.moveTo(32, -84); ctx.lineTo(46, -70); ctx.lineTo(74, -96); ctx.stroke();
            ctx.restore();

            // Proud Turkey wearing shiny gold Sub-Postmaster Star Medal!
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508, actorX: 295, actorY: 498, actorScale: 1.06 });
            drawRoyalWaxSeal55(ctx, S, 305, 518, 18, 1.0, t);
          },

          // Dead-Letter Dropbox Grand Finale: riveted creek postal dropbox glowing amber + saluting Snail & confetti Trout!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            // Riveted Olive-and-Brass Creek Postal Dropbox glowing warm amber!
            var bx = 665, by = 355;
            S.drawCardboardPuppetPiece(ctx, [[bx - 22, by + 95], [bx + 22, by + 95], [bx + 26, 558], [bx - 26, 558]], { tone: "#5c5f58", ribs: 2 });
            S.drawCardboardPuppetPiece(
              ctx,
              [[bx - 84, by + 98], [bx - 84, by - 68], [bx - 46, by - 116], [bx + 46, by - 116], [bx + 84, by - 68], [bx + 84, by + 98]],
              { tone: "#2d5a46", ribs: 3, pins: [[bx - 62, by + 78], [bx + 62, by + 78]] }
            );
            B.drawLanternHalo(ctx, bx, by - 35, 115, { color: "#fbbf24", coreColor: "#ffffff", intensity: 1.25, t: t });
            S.drawCutoutPaperEdge(ctx, [[bx - 56, by - 58], [bx + 56, by - 58], [bx + 60, by - 22], [bx - 60, by - 22]], "#fef08a", "#14110d", { paperRim: 2.2 });

            drawBrassVerneCapsule(ctx, S, plates.portholeImg, {
              x: 415, y: 325, ang: 0.14, goldStamp: true, innerGlow: "rgba(254, 240, 138, 0.48)", t: t
            });
            S.drawMailSnail(ctx, 415, 145, 1.22, t, { hasReply: true });
            S.drawBrookTrout(ctx, 865, 325 + Math.sin(t * 2.8) * 10, 1.08, t, false);
            B.drawDeterministicParticles(ctx, "confetti", 635, 225, t, { count: 28, loop: true, seed: 55.75 });
          },

          // Dear Alien Pen-Pal Reply (16.0s GRAND FINALE on p55-v3-strip.jpg!):
          // 3-eyed Alien Saucer cradles gold-stamped brass tube in rainbow tractor ribbon + cosmic stamp album!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = B.clamp(resolved.outcomeU * 1.2, 0, 1);
            var saucerX = 535, saucerY = 98;
            var podX = 535 + Math.sin(t * 2.2) * 12;
            var podY = B.lerp(305, 245, u) + Math.cos(t * 2.6) * 8;

            // Shimmering 5-band Rainbow Tractor Ribbon cradling the brass capsule!
            var rbCols = ["#ef4444", "#facc15", "#10b981", "#3b82f6", "#a855f7"];
            ctx.save();
            for (var r = 0; r < 5; r++) {
              var off = (r - 2) * 26;
              B.drawVolumetricBeam(ctx, saucerX + off * 0.3, saucerY + 18, podX + off, podY + 35, {
                color: rbCols[r], coreColor: "#ffffff", sourceRadius: 8, spread: 24, intensity: 0.92, motes: 5, t: t, seed: r * 4.1
              });
            }
            ctx.restore();
            B.drawTractorRings(ctx, saucerX, saucerY + 22, podX, podY + 20, t, { spread: 165, rings: 6 });
            S.drawAlienSaucer(ctx, saucerX, saucerY, 1.30, t, podX, podY, { beam: false });

            // Gold-stamped Brass Verne Capsule gently cradled horizontal in rainbow tractor hammock!
            B.drawLanternHalo(ctx, podX, podY, 155, { color: "#fde047", coreColor: "#ffffff", intensity: 1.3, t: t });
            drawBrassVerneCapsule(ctx, S, plates.portholeImg, {
              x: podX, y: podY, ang: Math.PI * 0.44 + Math.sin(t * 2.0) * 0.06, scale: 0.92, goldStamp: true, t: t
            });

            // Glittering Open Cosmic Stamp Album beamed down beside our brass sub & Mail Snail (0 text!)
            var ax = 305, ay = 472 + Math.sin(t * 3) * 4;
            B.drawLanternHalo(ctx, ax, ay, 98, { color: "#34d399", coreColor: "#fef08a", intensity: 1.15, t: t });
            S.drawCutoutPaperEdge(ctx, [[ax - 98, ay - 52], [ax - 2, ay - 56], [ax - 2, ay + 52], [ax - 98, ay + 56]], "#faf5ff", "#6d28d9", { paperRim: 2.8, lineWidth: 2.5 });
            S.drawCutoutPaperEdge(ctx, [[ax + 2, ay - 56], [ax + 98, ay - 52], [ax + 98, ay + 56], [ax + 2, ay + 52]], "#faf5ff", "#6d28d9", { paperRim: 2.8, lineWidth: 2.5 });
            for (var pg = -1; pg <= 1; pg += 2) {
              for (var sr = 0; sr < 2; sr++) {
                for (var sc = 0; sc < 2; sc++) {
                  drawMiniaturePostcard(ctx, S, ax + pg * 48 + (sc - 0.5) * 38, ay + (sr - 0.5) * 42, 30, 22, 0, (pg + 2) * 5 + sr * 2 + sc, { shadow: false, rim: 1.0 });
                }
              }
            }

            S.drawMailSnail(ctx, 785, 488, 1.22, t, { flip: true, hasReply: true, hasAlienStamp: true });
            S.drawBrookTrout(ctx, 855, 355 + Math.sin(t * 2.5) * 8, 1.04, t, false);
            B.drawDeterministicParticles(ctx, "kintsugi", podX, podY, t, { count: 24, loop: true, seed: 55.85 });
          }
        },

        square: {
          // Confetti Fountain Of Memories: uncorked brass tube erupts spiral fountain of 54 BOLAS cutout postcards!
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t, u = resolved.outcomeU;
            drawBrassVerneCapsule(ctx, S, plates.portholeImg, {
              x: 535, y: 395, ang: 0.0, scale: 0.85, corkPop: 1.4, t: t
            });
            // Double-spiral fountain of all 54 laminated creek postcards!
            for (var c = 0; c < 54; c++) {
              var prog = ((c / 54) + t * 0.14) % 1;
              var ang = prog * TAU * 2.5 + (c % 2) * Math.PI;
              var radX = 45 + prog * 365;
              var px = 535 + Math.cos(ang) * radX;
              var py = 305 - Math.sin(prog * Math.PI) * 215 + Math.sin(ang) * 55;
              drawMiniaturePostcard(ctx, S, px, py, 42, 30, Math.sin(t * 2 + c) * 0.28, c, { shadow: false, rim: 1.5 });
            }
            B.drawDeterministicParticles(ctx, "confetti", 535, 255, t, { count: 28, loop: true, seed: 55.9 });
            drawProbableWitness(ctx, S, t, u, { badgeX: 142, badgeY: 508, dispatch: 1.0 });
          },

          // Uncorked Creek Scrapbook Parade: Brook Trout & Mail Snail hang 54 postcards along 3 sunlit bunting ribbons!
          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            // 3 sunlit bunting festoon ribbons draped across the stage holding 18x3 = 54 creek postcards!
            var cardIdx = 0;
            for (var row = 0; row < 3; row++) {
              var y0 = 128 + row * 108;
              ctx.strokeStyle = "#b45309";
              ctx.lineWidth = 2.6;
              ctx.beginPath();
              for (var x = 145; x <= 935; x += 32) {
                var sag = Math.sin(((x - 145) / 790) * Math.PI) * 34;
                if (x === 145) ctx.moveTo(x, y0 + sag); else ctx.lineTo(x, y0 + sag);
              }
              ctx.stroke();

              for (var k = 0; k < 18; k++) {
                var ku = (k + 0.5) / 18;
                var kx = B.lerp(155, 925, ku);
                var ky = y0 + Math.sin(ku * Math.PI) * 34 + 16;
                drawMiniaturePostcard(ctx, S, kx, ky, 38, 28, Math.sin(t * 3 + k + row) * 0.14, cardIdx++, { shadow: false, rim: 1.3 });
              }
            }

            drawBrassVerneCapsule(ctx, S, plates.portholeImg, {
              x: 535, y: 488, ang: -0.45, scale: 0.68, corkPop: 1.2, t: t
            });
            B.drawDeterministicParticles(ctx, "bubbles", 515, 435, t, { count: 18, loop: true, seed: 55.94 });
            S.drawBrookTrout(ctx, 865, 475 + Math.sin(t * 2.5) * 8, 1.06, t, false);
            S.drawMailSnail(ctx, 265, 504, 1.2, t, { hasReply: true });
          },

          // Fifty-Four Constellation Sky Show: all 54 postcards rise into luminous stained-glass star constellations!
          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            // Deep starry planetarium canopy gradient across upper stage
            ctx.save();
            var skyG = ctx.createLinearGradient(0, 40, 0, 520);
            skyG.addColorStop(0, "rgba(15, 23, 42, 0.86)");
            skyG.addColorStop(1, "rgba(15, 23, 42, 0.18)");
            ctx.fillStyle = skyG;
            ctx.fillRect(70, 45, 880, 495);
            ctx.restore();

            S.drawAlienSaucer(ctx, 515, 92, 1.24, t, 515, 425, { beamSpread: 240 });

            // Golden constellation lines connecting 54 glowing postcard-stars in 6 zodiac clusters!
            var cIdx = 0;
            ctx.save();
            for (var cl = 0; cl < 6; cl++) {
              var baseX = 195 + (cl % 3) * 315;
              var baseY = 175 + Math.floor(cl / 3) * 165;
              var pts = [];
              for (var st = 0; st < 9; st++) {
                var a = (st / 9) * TAU + cl * 0.8 + t * 0.25;
                var r = 42 + (st % 3) * 34;
                pts.push([baseX + Math.cos(a) * r, baseY + Math.sin(a) * (r * 0.62)]);
              }
              ctx.strokeStyle = "rgba(250, 204, 21, 0.55)";
              ctx.lineWidth = 1.8;
              ctx.beginPath();
              for (var p = 0; p < pts.length; p++) {
                if (p === 0) ctx.moveTo(pts[p][0], pts[p][1]);
                else ctx.lineTo(pts[p][0], pts[p][1]);
              }
              ctx.closePath();
              ctx.stroke();

              for (var p2 = 0; p2 < pts.length; p2++) {
                drawMiniaturePostcard(ctx, S, pts[p2][0], pts[p2][1], 32, 22, Math.sin(t * 2 + cIdx) * 0.18, cIdx++, {
                  paper: "#fef9c3", shadow: false, rim: 1.1
                });
              }
            }
            ctx.restore();

            // Miniature Brass Turkey Sub + Uncorked Capsule Curtain Call at bottom center!
            drawBrassVerneCapsule(ctx, S, plates.portholeImg, {
              x: 415, y: 495, ang: -0.35, scale: 0.62, corkPop: 1.3, goldStamp: true, t: t
            });
            S.drawCutoutPaperEdge(ctx, [[545, 495], [585, 468], [675, 468], [705, 495], [675, 522], [585, 522]], "#d97706", "#14110d", { paperRim: 2.8 });
            ctx.fillStyle = "#fef08a"; ctx.strokeStyle = "#14110d"; ctx.lineWidth = 2.0;
            ctx.beginPath(); ctx.arc(635, 495, 14, 0, TAU); ctx.fill(); ctx.stroke();
            B.drawDeterministicParticles(ctx, "kintsugi", 515, 295, t, { count: 24, loop: true, seed: 55.99 });
          }
        }
      }
    });
  })();
})(typeof window !== "undefined" ? window : globalThis);
