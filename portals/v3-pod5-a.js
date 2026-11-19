/* ============================================================================
 * Turkey Sub · PAELEO Oulipo + Video-to-Game Interactive Branching Cinema V3
 * Pod 5 Slice A — Portholes #45 through #50 (window.PORTAL_V3_GAMES[45..50])
 * File: portals/v3-pod5-a.js
 *
 * 17 Bespoke Animated Nodes per Porthole (102 Total Scenes):
 *   - 1 Root + 4 Physical Stems (x, o, triangle, square)
 *   - 12 Outcomes (x/o/triangle/square x probable/plausible/preposterous)
 *
 * Assigned Slice (#45..#50):
 *   #45 · Extruder — duchamp-optic      (p45.jpg + atlas-36.webp)
 *   #46 · Steps    — queneau-rostrum    (p46.jpg + atlas-50.webp)
 *   #47 · Armada   — perec-stage        (p47.jpg + atlas-12.webp)
 *   #48 · Belfry   — cardboard-parallax (p48.jpg + atlas-22.webp)
 *   #49 · Corner   — cardboard-parallax (p49.jpg + atlas-18.webp)
 *   #50 · Riffle   — daumier-litho      (p50.jpg + atlas-31.webp)
 *
 * STRICT PAELEO BLIND-MODE INVARIANT:
 *   100% pure vector geometry, real scissored bitmap cutouts, and split-pin
 *   cardboard/litho IK puppets — ZERO canvas typography calls in any mode.
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var POD5A_IDS = [45, 46, 47, 48, 49, 50];

  root.PORTAL_V3_GAMES = root.PORTAL_V3_GAMES || {};

  function getEngine() {
    return root.BRANCH_GAME;
  }

  function getStage() {
    return root.SCION_STAGE;
  }

  if (root.SCION_STAGE && typeof root.SCION_STAGE.preloadPortalPlates === "function") {
    root.SCION_STAGE.preloadPortalPlates(POD5A_IDS);
  }

  // ---------- Shared Kinematic, Cutout, Shader & Prop Primitives ----------

  function clamp(v, lo, hi) {
    return v < lo ? lo : (v > hi ? hi : v);
  }

  function lerp(a, b, u) {
    return a + (b - a) * u;
  }

  function easeOut(u) {
    var x = clamp(u, 0, 1);
    var inv = 1 - x;
    return 1 - inv * inv * inv;
  }

  function easeInOut(u) {
    var x = clamp(u, 0, 1);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function easeBack(u) {
    var x = clamp(u, 0, 1);
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  function stemRamp(resolved, speed) {
    if (resolved.phase === "tier_select" || resolved.phase === "outcome") return 1;
    return easeOut(clamp((resolved.stemU || 0) * (speed || 1.55), 0, 1));
  }

  function outRamp(resolved, speed) {
    return easeOut(clamp((resolved.outcomeU || 0) * (speed || 2.1), 0, 1));
  }

  function parallaxX(resolved, depth) {
    var t = resolved.t || 0;
    return Math.sin(t * 0.62 + depth * 1.3) * 14 * depth;
  }

  function parallaxY(resolved, depth) {
    var t = resolved.t || 0;
    return Math.cos(t * 0.48 + depth * 0.9) * 6 * depth;
  }

  function drawFracCutout(ctx, S, img, u0, v0, uw, vh, dx, dy, dw, dh, poly, opts) {
    var iw = (img && img.naturalWidth) ? img.naturalWidth : 640;
    var ih = (img && img.naturalHeight) ? img.naturalHeight : 640;
    S.drawScissorCutout(
      ctx,
      img,
      Math.round(u0 * iw),
      Math.round(v0 * ih),
      Math.round(uw * iw),
      Math.round(vh * ih),
      dx,
      dy,
      dw,
      dh,
      poly,
      opts
    );
  }

  function drawLimb(ctx, S, x0, y0, x1, y1, w0, w1, tone, pinStart, pinEnd) {
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
    if (pinStart) pins.push({ x: x0, y: y0, r: 4.2, metal: pinStart });
    if (pinEnd) pins.push({ x: x1, y: y1, r: 4.0, metal: pinEnd });
    S.drawCardboardPuppetPiece(ctx, pts, { tone: tone || "#8a8882", ribs: 2, pins: pins });
  }

  function drawCutoutBubble(ctx, x, y, r, fill) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.arc(0, 0, r + 2.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = fill || "rgba(196, 238, 234, 0.80)";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.beginPath();
    ctx.arc(-r * 0.32, -r * 0.32, Math.max(1.3, r * 0.26), 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawConcentricRipples(ctx, cx, cy, count, maxR, t, color, squashY) {
    var sy = squashY || 1.0;
    ctx.save();
    for (var i = 0; i < count; i++) {
      var u = (((t * 0.72 + i / count) % 1) + 1) % 1;
      var rad = lerp(12, maxR, u);
      ctx.strokeStyle = color || "#fbfaf5";
      ctx.globalAlpha = (1 - u) * 0.65;
      ctx.lineWidth = 2.6 * (1 - u * 0.5);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rad, rad * sy, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Articulated IK Brass Scissor-Tongs / Caliper Probe for [square] actions
  function drawBrassScissorTongs(ctx, S, B, baseX, baseY, targetX, targetY, pinchRad, t, opts) {
    var cfg = opts || {};
    var l1 = cfg.l1 || 205;
    var l2 = cfg.l2 || 195;
    var bend = cfg.bendDir != null ? cfg.bendDir : -1;
    var ik = S.solveIK2(baseX, baseY, l1, l2, targetX, targetY, bend);

    // Pantograph upper & lower brass linkage bars
    drawLimb(ctx, S, baseX, baseY, ik.jx, ik.jy, 12, 9, "#9d7634", "brass", "silver");
    drawLimb(ctx, S, baseX + 16, baseY + 14, ik.jx + 10, ik.jy + 10, 8, 7, "#6e5120", "silver", null);
    drawLimb(ctx, S, ik.jx, ik.jy, ik.ex, ik.ey, 10, 8, "#c8963e", null, null);
    S.drawReinigerFiligreeHinge(ctx, ik.jx, ik.jy, 9.5, { metal: "brass" });

    // Articulated scissor-pincer jaws at end effector
    var aimAng = Math.atan2(ik.ey - ik.jy, ik.ex - ik.jx);
    var jawOpen = pinchRad != null ? pinchRad : (0.24 + Math.sin(t * 7.0) * 0.08);
    ctx.save();
    ctx.translate(ik.ex, ik.ey);
    ctx.rotate(aimAng);

    for (var s = -1; s <= 1; s += 2) {
      ctx.save();
      ctx.rotate(s * jawOpen);
      S.drawCutoutPaperEdge(
        ctx,
        [[-6, -5 * s], [26, -15 * s], [48, -6 * s], [42, 3 * s], [18, -5 * s], [-6, 4 * s]],
        "#e0ae48",
        "#14110d",
        { paperRim: 2.2, shadow: false }
      );
      ctx.restore();
    }
    S.drawReinigerFiligreeHinge(ctx, 0, 0, 7.2, { metal: "silver" });
    ctx.restore();

    if (cfg.sparks !== false && B) {
      B.drawDeterministicParticles(ctx, "brass_sparks", ik.ex, ik.ey, t, {
        loop: true,
        count: cfg.sparkCount || 10,
        seed: cfg.seed || 41.7
      });
    }
    return ik;
  }

  // Riveted Submarine Nose Spotlight Lamp + Volumetric Beam for [x] actions
  function drawSubSpotlightRig(ctx, S, B, srcX, srcY, aimX, aimY, t, opts) {
    var cfg = opts || {};
    var intensity = cfg.intensity != null ? cfg.intensity : 1.05;
    var col = cfg.color || "#60a5fa";
    var coreCol = cfg.coreColor || "#fffbeb";

    B.drawVolumetricBeam(ctx, srcX, srcY, aimX, aimY, {
      intensity: intensity,
      spread: cfg.spread || 145,
      sourceRadius: cfg.sourceRadius || 20,
      color: col,
      coreColor: coreCol,
      t: t,
      motes: cfg.motes != null ? cfg.motes : 20
    });
    B.drawLanternHalo(ctx, aimX, aimY, cfg.haloRadius || 110, {
      t: t,
      color: col,
      coreColor: coreCol,
      intensity: intensity * 0.82
    });

    // Brass spotlight bezel housing at source
    var ang = Math.atan2(aimY - srcY, aimX - srcX);
    ctx.save();
    ctx.translate(srcX, srcY);
    ctx.rotate(ang);
    S.drawCardboardPuppetPiece(
      ctx,
      [[-24, -18], [16, -24], [22, 24], [-24, 18]],
      { tone: "#b88a3c", ribs: 2, pin: { x: -8, y: 0, r: 4.5, metal: "brass" } }
    );
    ctx.fillStyle = coreCol;
    ctx.beginPath();
    ctx.ellipse(19, 0, 6, 20, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // Crimson Ballast Surge Nozzle + Bubble Stream for [o] actions
  function drawCrimsonBallastPlume(ctx, S, B, srcX, srcY, aimX, aimY, u, t, opts) {
    var cfg = opts || {};
    var dx = aimX - srcX;
    var dy = aimY - srcY;
    var ang = Math.atan2(dy, dx);
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;

    ctx.save();
    // Translucent crimson surge jet cone
    var g = ctx.createLinearGradient(srcX, srcY, aimX, aimY);
    g.addColorStop(0.0, "rgba(212, 42, 30, " + (0.48 * u).toFixed(3) + ")");
    g.addColorStop(0.55, "rgba(248, 113, 113, " + (0.28 * u).toFixed(3) + ")");
    g.addColorStop(1.0, "rgba(248, 113, 113, 0)");
    var nx = -dy / dist;
    var ny = dx / dist;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(srcX + nx * 16, srcY + ny * 16);
    ctx.lineTo(aimX + nx * 84, aimY + ny * 84);
    ctx.lineTo(aimX - nx * 84, aimY - ny * 84);
    ctx.lineTo(srcX - nx * 16, srcY - ny * 16);
    ctx.closePath();
    ctx.fill();

    // Rolling crimson current ribbons
    for (var r = -1; r <= 1; r++) {
      ctx.strokeStyle = r === 0 ? "rgba(254, 202, 202, 0.78)" : "rgba(212, 42, 30, 0.72)";
      ctx.lineWidth = r === 0 ? 3.4 : 2.4;
      ctx.setLineDash([12, 7]);
      ctx.lineDashOffset = -t * 95;
      ctx.beginPath();
      for (var s = 0; s <= 12; s++) {
        var su = (s / 12) * u;
        var wob = Math.sin(su * 9 - t * 8 + r * 1.7) * (14 * su);
        var px = lerp(srcX, aimX, su) + nx * (r * 28 * su + wob);
        var py = lerp(srcY, aimY, su) + ny * (r * 28 * su + wob);
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();

    // Brass-crimson ballast vent nozzle
    ctx.save();
    ctx.translate(srcX, srcY);
    ctx.rotate(ang);
    S.drawCardboardPuppetPiece(
      ctx,
      [[-22, -15], [14, -20], [18, 20], [-22, 15]],
      { tone: "#992820", ribs: 1, pin: { x: -6, y: 0, r: 4.2, metal: "brass" } }
    );
    ctx.restore();

    if (B) {
      B.drawDeterministicParticles(ctx, "bubbles", lerp(srcX, aimX, 0.45), lerp(srcY, aimY, 0.45), t, {
        loop: true,
        count: cfg.bubbles || 18,
        color: "#fca5a5",
        seed: cfg.seed || 73.1
      });
    }
  }

  // Pure-Vector Emblem Card / Plaque / Scroll / Tag (ZERO typography!)
  function drawEmblemPlaque(ctx, S, x, y, w, h, rot, emblem, opts) {
    var cfg = opts || {};
    var hw = w * 0.5;
    var hh = h * 0.5;
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);

    S.drawCutoutPaperEdge(
      ctx,
      [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]],
      cfg.bg || "#fbfaf5",
      cfg.border || "#14110d",
      { paperRim: cfg.rim != null ? cfg.rim : 3.0 }
    );

    var r = Math.min(hw, hh) * 0.58;
    var col = cfg.accent || "#0f8f80";
    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (emblem === "check") {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-r * 0.48, 0);
      ctx.lineTo(-r * 0.10, r * 0.42);
      ctx.lineTo(r * 0.54, -r * 0.38);
      ctx.stroke();
    } else if (emblem === "star") {
      ctx.beginPath();
      for (var i = 0; i < 10; i++) {
        var a = -Math.PI * 0.5 + (i / 10) * TAU;
        var sr = (i % 2 === 0) ? r : r * 0.44;
        var sx = Math.cos(a) * sr;
        var sy = Math.sin(a) * sr;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
    } else if (emblem === "saucer_ok") {
      ctx.fillStyle = "#14110d";
      ctx.beginPath();
      ctx.ellipse(-hw * 0.28, 0, r * 0.72, r * 0.32, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-hw * 0.28, -r * 0.16, r * 0.38, Math.PI, 0);
      ctx.stroke();
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(hw * 0.05, r * 0.05);
      ctx.lineTo(hw * 0.24, r * 0.42);
      ctx.lineTo(hw * 0.56, -r * 0.38);
      ctx.stroke();
    } else if (emblem === "no_dozer") {
      // Miniature sub approved + crossed circle
      ctx.fillStyle = "#eab308";
      ctx.beginPath();
      ctx.ellipse(-hw * 0.32, 2, r * 0.62, r * 0.38, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#d42a1e";
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(hw * 0.30, 0, r * 0.56, 0, TAU);
      ctx.moveTo(hw * 0.30 - r * 0.4, -r * 0.4);
      ctx.lineTo(hw * 0.30 + r * 0.4, r * 0.4);
      ctx.stroke();
    } else if (emblem === "gingham") {
      for (var gx = -hw + 6; gx < hw - 6; gx += 12) {
        ctx.fillStyle = ((Math.round(gx / 12)) % 2 === 0) ? "#d42a1e" : "#fca5a5";
        ctx.fillRect(gx, -hh + 5, 10, 9);
      }
      ctx.fillStyle = "#0f8f80";
      ctx.beginPath();
      ctx.arc(0, 5, r * 0.42, 0, TAU);
      ctx.fill();
    } else if (emblem === "heart") {
      ctx.fillStyle = "#ec4899";
      ctx.beginPath();
      ctx.moveTo(0, r * 0.65);
      ctx.bezierCurveTo(-r * 1.1, -r * 0.1, -r * 0.55, -r * 0.95, 0, -r * 0.25);
      ctx.bezierCurveTo(r * 0.55, -r * 0.95, r * 1.1, -r * 0.1, 0, r * 0.65);
      ctx.fill();
    }

    ctx.restore();
  }

  // Shared Foreground: Subtle Porthole Corner Rivets + Tape-Reel Rostrum Rewind Shutter
  function drawSharedForeground(ctx, W, H, resolved, S) {
    var stageH = resolved.blind ? H : 640;

    // Subtle corner brass porthole bezel brackets (pure geometry)
    ctx.save();
    var corners = [[34, 34], [W - 34, 34], [34, stageH - 34], [W - 34, stageH - 34]];
    for (var i = 0; i < corners.length; i++) {
      S.drawSplitPin(ctx, corners[i][0], corners[i][1], 5.6, { metal: "brass" });
    }
    ctx.restore();

    // Rostrum tape-reel rewind flash during showcase transitions
    if (resolved.rewindFlash && resolved.rewindFlash > 0.01) {
      var rf = clamp(resolved.rewindFlash, 0, 1);
      ctx.save();
      ctx.fillStyle = "rgba(251, 250, 245, " + (rf * 0.34).toFixed(3) + ")";
      ctx.fillRect(0, 0, W, stageH);

      // Pure-vector double rewind chevrons at center
      ctx.translate(W * 0.5, stageH * 0.48);
      ctx.globalAlpha = rf * 0.85;
      ctx.fillStyle = "#d42a1e";
      for (var c = -1; c <= 1; c += 2) {
        var ox = c * 24;
        ctx.beginPath();
        ctx.moveTo(ox - 24, 0);
        ctx.lineTo(ox + 14, -26);
        ctx.lineTo(ox + 14, 26);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /* ==========================================================================
   * PORTHOLE #45 · EXTRUDER (duchamp-optic · Le Chant du styrene)
   * Plates: portholes/p45.jpg (640x640) + assets/atlas-stills/atlas-36.webp (740x416)
   * ========================================================================== */

  var BEAD_COLS_45 = ["#d42a1e", "#f2c14e", "#0f8f80", "#fbfaf5", "#8b5cf6"];

  var FUNNEL_POLY_45 = [
    [0.06, 0.06], [0.24, 0.02], [0.82, 0.34], [0.99, 0.42],
    [0.99, 0.58], [0.82, 0.66], [0.24, 0.98], [0.06, 0.94],
    [0.01, 0.50]
  ];

  var BASTER_POLY_45 = [
    [0.04, 0.16], [0.32, 0.02], [0.58, 0.22], [0.98, 0.68],
    [0.90, 0.94], [0.44, 0.58], [0.16, 0.68], [0.02, 0.44]
  ];

  function drawPaperBead45(ctx, S, x, y, r, color, seed) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var a = (i / 10) * TAU;
      var jr = r * (0.94 + S.hash(i * 5.3 + (seed || 1)) * 0.12);
      pts.push([x + Math.cos(a) * jr, y + Math.sin(a) * jr]);
    }
    S.drawCutoutPaperEdge(ctx, pts, color, "#14110d", { paperRim: 2.6, shadow: false });
    ctx.fillStyle = "rgba(255,255,255,0.62)";
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.26, 0, TAU);
    ctx.fill();
  }

  function drawMiniYellowSub45(ctx, S, x, y, scale, t) {
    ctx.save();
    ctx.translate(x, y + Math.sin(t * 5.0 + x * 0.03) * 4);
    ctx.scale(scale, scale);

    // Periscope & conning tower
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(0, -30);
    ctx.lineTo(10, -30);
    ctx.stroke();

    // Scissor-cut yellow sub hull
    S.drawCutoutPaperEdge(
      ctx,
      [[-30, 0], [-22, -16], [18, -16], [32, 0], [18, 15], [-22, 15]],
      "#facc15",
      "#14110d",
      { paperRim: 2.4, shadow: false }
    );
    // Spinning tail propeller + brass porthole
    S.drawSplitPin(ctx, 6, 0, 5.2, { metal: "brass" });
    ctx.fillStyle = "#e11d48";
    ctx.fillRect(-36, -9 * Math.abs(Math.sin(t * 14)), 6, 18 * Math.abs(Math.sin(t * 14)) + 3);
    ctx.restore();
  }

  function drawSuspendedFunnel45(ctx, S, plates, fx, fy, fw, fh, opts) {
    var cfg = opts || {};
    var rot = cfg.rot || 0;

    if (cfg.wires !== false) {
      ctx.save();
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(fx + 48, -12);
      ctx.lineTo(fx + 48, fy + 20);
      ctx.moveTo(fx + 216, -12);
      ctx.lineTo(fx + 216, fy + 76);
      ctx.stroke();
      ctx.restore();
    }

    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      240, 225, 178, 155,
      fx, fy, fw, fh,
      FUNNEL_POLY_45,
      {
        haloWidth: 4.8,
        rot: rot,
        tint: cfg.tint || null,
        pins: cfg.wires !== false ? [
          { x: fx + 48, y: fy + 20, r: 4.5, metal: "brass" },
          { x: fx + 216, y: fy + 76, r: 4.5, metal: "brass" }
        ] : null
      }
    );
  }

  function drawBasterCutout45(ctx, S, plates, cx, cy, w, h, rot, scaleX, scaleY) {
    ctx.save();
    ctx.translate(cx, cy);
    if (rot) ctx.rotate(rot);
    ctx.scale(scaleX || 1, scaleY || 1);
    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      128, 205, 155, 118,
      -w * 0.5, -h * 0.5, w, h,
      BASTER_POLY_45,
      { haloWidth: 4.4 }
    );
    ctx.restore();
  }

  function registerPorthole45() {
    var B = getEngine();

    B.definePortalGame(45, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var pxFar = parallaxX(resolved, 0.22);
        var pyMid = parallaxY(resolved, 0.38);

        S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 45, t, resolved);

        // Multiplane Chant-du-Styrene yellow metered columns & mirrored operators from atlas-36.webp (740x416)
        S.drawScissorCutout(ctx, plates.atlasImg, 4, 6, 172, 404, 28 + pxFar * 0.6, 48, 165, 505, null, {
          haloWidth: 3.2,
          alpha: 0.78
        });
        S.drawScissorCutout(ctx, plates.atlasImg, 554, 6, 182, 404, 1085 + pxFar * 0.6, 48, 165, 505, null, {
          haloWidth: 3.2,
          alpha: 0.78
        });
        S.drawScissorCutout(
          ctx,
          plates.atlasImg,
          182, 112, 360, 290,
          405 + pxFar, 150 + pyMid * 0.4, 470, 350,
          [[0.04, 0.08], [0.48, 0.02], [0.96, 0.08], [0.94, 0.96], [0.06, 0.96]],
          { filter: "mono", haloWidth: 3.8, alpha: 0.30 }
        );

        B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.20, color: "#67e8f9" });
        B.drawDepthFog(ctx, W, H, t, { density: 0.14, color: "#94a3b8" });

        // Left creek rock ledge scissored from p45.jpg + riverbed torn paper flat
        S.drawScissorCutout(
          ctx,
          plates.portholeImg,
          112, 265, 118, 140,
          155 + pxFar * 0.8, 390, 185, 165,
          [[0.05, 0.08], [0.76, 0.16], [0.96, 0.68], [0.90, 0.96], [0.04, 0.96]],
          { haloWidth: 4.0, alpha: 0.90 }
        );
        S.drawTornPaperFlat(ctx, 165, 536, 950, 88, {
          fill: "#24403e",
          paperColor: "#fbfaf5",
          deckle: 6,
          seed: 45.7
        });
      },

      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawSharedForeground(ctx, W, H, resolved, S);
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var fx = 468 + parallaxX(resolved, 0.45);
        var fy = 205 + Math.sin(t * 2.8) * 6;
        var fw = 285;
        var fh = 232;

        // Suction flow ribbons into wide funnel mouth
        ctx.save();
        ctx.strokeStyle = "rgba(224, 242, 254, 0.55)";
        ctx.lineWidth = 2.4;
        ctx.setLineDash([14, 8]);
        ctx.lineDashOffset = -t * 70;
        for (var r = -1; r <= 1; r++) {
          ctx.beginPath();
          ctx.moveTo(265, fy + 115 + r * 42);
          ctx.quadraticCurveTo(375, fy + 110 + r * 20, fx + 35, fy + 115 + r * 12);
          ctx.stroke();
        }
        ctx.restore();

        // Bobbing red-bulbed turkey baster sucked tail-first into funnel
        var squeeze = 1 - Math.abs(Math.sin(t * 4.2)) * 0.12;
        drawBasterCutout45(ctx, S, plates, fx - 52, fy + 84, 244, 174, 0.06, 1, squeeze);

        drawSuspendedFunnel45(ctx, S, plates, fx, fy, fw, fh);

        // Rainbow styrene pellets popping in an S-curve from right brass spout
        var nozX = fx + fw - 4;
        var nozY = fy + fh * 0.50;
        for (var b = 0; b < 15; b++) {
          var bu = ((t * 0.44 + b / 15) % 1);
          var bx = nozX + bu * 285;
          var by = nozY - Math.sin(bu * Math.PI * 1.65) * 118 - bu * 42 + (b % 2 === 0 ? -11 : 11);
          drawPaperBead45(ctx, S, bx, by, 14 + (b % 3) * 2.5, BEAD_COLS_45[b % 5], b + 3);
        }

        // Scissored creek trout from p45.jpg watching below
        S.drawScissorCutout(ctx, plates.portholeImg, 310, 382, 202, 88, 665, 434 + Math.sin(t * 3.1) * 5, 285, 118, null, {
          haloWidth: 4.2
        });
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.5);
          var fx = 468;
          var fy = 205 + Math.sin(t * 2.8) * 5;

          // Backlight sub spotlight lighting clear/coral funnel like stained glass
          drawSubSpotlightRig(ctx, S, B, 215, 520, fx + 135, fy + 116, t, {
            intensity: 1.35 * u,
            spread: 170,
            color: "#38bdf8",
            coreColor: "#e0f2fe"
          });

          drawBasterCutout45(ctx, S, plates, fx - 54, fy + 84, 236, 168, 0.04, 1, 1);
          drawSuspendedFunnel45(ctx, S, plates, fx, fy, 285, 232, { tint: "rgba(125, 211, 252, 0.25)" });

          // Stained-glass backlit cutaway window showing 20 dancing beads inside funnel throat!
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(fx + 52, fy + 40);
          ctx.lineTo(fx + 236, fy + 98);
          ctx.lineTo(fx + 236, fy + 138);
          ctx.lineTo(fx + 52, fy + 194);
          ctx.closePath();
          ctx.fillStyle = "rgba(224, 242, 254, " + (0.68 * u).toFixed(3) + ")";
          ctx.fill();
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 3.0;
          ctx.stroke();

          for (var i = 0; i < 18; i++) {
            var iu = (i + 0.5) / 18;
            var dx = lerp(fx + 66, fx + 224, iu);
            var span = lerp(62, 14, iu);
            var dy = fy + 116 + Math.sin(t * 9.5 + i * 1.9) * span * u;
            drawPaperBead45(ctx, S, dx, dy, 10.5, BEAD_COLS_45[i % 5], i + 11);
          }
          ctx.restore();
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.6);
          var fx = 468 - u * 18;
          var fy = 205 + Math.sin(t * 5.0) * 6;

          // Crimson ballast puff blasting up the right nozzle to reverse flow!
          drawCrimsonBallastPlume(ctx, S, B, 965, 420, fx + 275, fy + 116, u, t, { bubbles: 22 });

          // Baster popping halfway free out the wide left mouth!
          drawBasterCutout45(ctx, S, plates, fx - 54 - u * 92, fy + 76 - u * 26, 244, 174, -0.18 * u, 1, 1);
          drawSuspendedFunnel45(ctx, S, plates, fx, fy, 285, 232, { rot: -0.06 * u });

          // Rainbow pellets shooting UPWARD out of both ends in fountain arcs
          for (var b = 0; b < 16; b++) {
            var bu = ((t * 0.85 + b / 16) % 1);
            var bx = (fx + 40) - bu * 140 + Math.sin(b * 2.3) * 35;
            var by = (fy + 100) - Math.sin(bu * Math.PI) * 165 * u;
            drawPaperBead45(ctx, S, bx, by, 13, BEAD_COLS_45[b % 5], b + 31);
          }
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.45);
          var fx = 435;
          var fy = 195 + Math.sin(t * 2.6) * 5;
          var nozX = fx + 282;
          var nozY = fy + 116;

          drawBasterCutout45(ctx, S, plates, fx - 50, fy + 82, 234, 168, 0.05, 1, 1);
          drawSuspendedFunnel45(ctx, S, plates, fx, fy, 285, 232);

          // Mail Snail gliding in with open canvas sorting mailbag under spout
          var snailX = lerp(290, nozX - 42, u);
          B.drawSnailSilverTrail(ctx, 250, 524, snailX, 518, u, t);
          S.drawMailSnail(ctx, snailX, 514, 1.24, t, { hasReply: false });

          // Open stitched canvas mailbag hooked beneath pellet tip with sorted bead rows
          var bagX = nozX + 12;
          var bagY = 436;
          S.drawCutoutPaperEdge(
            ctx,
            [[bagX - 66, bagY - 52], [bagX + 66, bagY - 52], [bagX + 78, bagY + 64], [bagX - 78, bagY + 64]],
            "#d6c3a5",
            "#14110d",
            { paperRim: 3.5 }
          );
          for (var row = 0; row < 3; row++) {
            for (var col = 0; col < 5; col++) {
              drawPaperBead45(ctx, S, bagX - 46 + col * 23, bagY + 42 - row * 24, 9.5, BEAD_COLS_45[row], row * 7 + col);
            }
          }
          // Falling stream of beads from tip into pouch
          for (var fb = 0; fb < 5; fb++) {
            var fu = ((t * 1.3 + fb / 5) % 1);
            drawPaperBead45(ctx, S, nozX + 8, lerp(nozY, bagY - 40, fu), 11, BEAD_COLS_45[fb % 5], fb + 60);
          }
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.6);
          var fx = 505;
          var fy = 208 + Math.sin(t * 6.5) * 4;

          // Stretched elastic red rubber bulb pulled left by brass scissor-tongs!
          var stretch = 1 + u * (0.46 + Math.sin(t * 9.0) * 0.12);
          drawBasterCutout45(ctx, S, plates, fx - 72 - u * 36, fy + 82, 248, 174, -0.05, stretch, 1 / Math.sqrt(stretch));
          drawSuspendedFunnel45(ctx, S, plates, fx, fy, 285, 232);

          var bulbX = fx - 178 - u * 64;
          var bulbY = fy + 46;
          drawBrassScissorTongs(ctx, S, B, 845, 595, bulbX, bulbY, 0.10, t, { bendDir: 1, seed: 45.4 });

          // Acoustic rubber-squeak zig-zag chevrons around stretched bulb
          ctx.save();
          ctx.strokeStyle = "#fde047";
          ctx.lineWidth = 3.2;
          for (var z = 0; z < 3; z++) {
            var za = -2.4 + z * 0.65;
            var zx = bulbX + Math.cos(za) * 52;
            var zy = bulbY + Math.sin(za) * 52;
            ctx.beginPath();
            ctx.moveTo(zx, zy);
            ctx.lineTo(zx - 16, zy - 8);
            ctx.lineTo(zx - 8, zy - 22);
            ctx.lineTo(zx - 26, zy - 30);
            ctx.stroke();
          }
          ctx.restore();
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = outRamp(resolved, 2.0);
            var fx = 555;
            var fy = 215 + Math.sin(t * 2.5) * 5;

            drawSubSpotlightRig(ctx, S, B, 260, 560, fx + 95, fy + 110, t, {
              intensity: 1.25,
              spread: 195,
              color: "#fbbf24",
              coreColor: "#fef9c3"
            });

            // Harmless funnel draped with purple/gold/green Mardi Gras bead necklaces
            drawSuspendedFunnel45(ctx, S, plates, fx, fy, 275, 224);
            var mgCols = ["#9333ea", "#eab308", "#16a34a"];
            for (var n = 0; n < 3; n++) {
              for (var k = 0; k < 9; k++) {
                var ku = k / 8;
                var kx = lerp(fx + 24, fx + 215, ku);
                var ky = fy + 75 + n * 28 + Math.sin(ku * Math.PI) * 54;
                drawPaperBead45(ctx, S, kx, ky, 9.5, mgCols[(n + k) % 3], n * 10 + k);
              }
            }

            // Rescued unscathed turkey baster floating upright with gold victory ribbon!
            var bx = lerp(fx - 40, 375, u);
            var by = 290 + Math.sin(t * 3.4) * 9;
            drawBasterCutout45(ctx, S, plates, bx, by, 235, 168, -0.68, 1, 1);
            drawEmblemPlaque(ctx, S, bx + 48, by - 58, 48, 48, 0.12, "star", { accent: "#eab308" });

            // Turkey saluting the saved kitchen utensil!
            S.drawTurkeyInCorner(ctx, 215, 476, 1.12, t, { dispatch: 0.9 });
            S.drawTurkeyCutawayBadge(ctx, 118, 492, 0.96, t, { dispatch: 0.85 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var fx = 485;
            var fy = 185 + Math.sin(t * 3.2) * 5;

            drawSubSpotlightRig(ctx, S, B, 220, 490, fx + 140, fy + 115, t, {
              intensity: 1.3,
              spread: 165,
              color: "#38bdf8"
            });
            drawSuspendedFunnel45(ctx, S, plates, fx, fy, 265, 216);

            // Spinning refracted red, yellow, and teal disco polka-dots across stage & pebbles!
            ctx.save();
            for (var d = 0; d < 18; d++) {
              var da = t * 1.4 + (d / 18) * TAU;
              var dr = 135 + (d % 3) * 82;
              var px = 665 + Math.cos(da) * dr * 1.25;
              var py = 355 + Math.sin(da * 1.5) * dr * 0.62;
              ctx.fillStyle = BEAD_COLS_45[d % 3];
              ctx.globalAlpha = 0.46;
              ctx.beginPath();
              ctx.arc(px, py, 16 + (d % 3) * 5, 0, TAU);
              ctx.fill();
            }
            ctx.restore();

            // 3 Glowing iridescent bubble rings + Brook Trout swimming figure-eights!
            var rings = [[585, 420], [745, 385], [905, 420]];
            for (var r = 0; r < 3; r++) {
              ctx.strokeStyle = r === 1 ? "#facc15" : "#2dd4bf";
              ctx.lineWidth = 4.2;
              ctx.beginPath();
              ctx.ellipse(rings[r][0], rings[r][1], 28, 56, 0, 0, TAU);
              ctx.stroke();
            }
            var f8x = 745 + Math.sin(t * 2.2) * 155;
            var f8y = 405 + Math.sin(t * 4.4) * 38;
            S.drawBrookTrout(ctx, f8x, f8y, 1.06, t, Math.cos(t * 2.2) < 0);

            // Mail Snail tapping shell-percussion maracas on riverbed
            B.drawSnailSilverTrail(ctx, 240, 528, 395, 524, 1, t);
            S.drawMailSnail(ctx, 395, 520, 1.22, t, { hasReply: true });
            drawPaperBead45(ctx, S, 422, 482 + Math.sin(t * 12) * 8, 9, "#d42a1e", 91);
            drawPaperBead45(ctx, S, 372, 482 - Math.sin(t * 12) * 8, 9, "#f2c14e", 92);
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var fx = 395;
            var fy = 225 + Math.sin(t * 2.6) * 5;

            S.drawAlienSaucer(ctx, 565, 92, 1.18, t, fx + 145, fy + 110);
            B.drawTractorRings(ctx, 565, 114, fx + 145, fy + 110, t, { spread: 115 });
            drawSubSpotlightRig(ctx, S, B, 195, 520, fx + 125, fy + 110, t, {
              intensity: 1.1,
              color: "#c084fc",
              coreColor: "#fae8ff"
            });

            drawSuspendedFunnel45(ctx, S, plates, fx, fy, 265, 218, { tint: "rgba(192, 132, 252, 0.24)" });

            // Each falling styrene pellet transforms into a thumb-sized yellow submarine parading past!
            var nozX = fx + 265;
            var nozY = fy + 109;
            for (var s = 0; s < 6; s++) {
              var su = ((t * 0.36 + s / 6) % 1);
              var sx = lerp(nozX + 12, 1155, su);
              var sy = nozY + Math.sin(su * Math.PI * 2 + s) * 34 + su * 55;
              if (su < 0.18) {
                drawPaperBead45(ctx, S, sx, sy, 14, BEAD_COLS_45[s % 5], s + 5);
              } else {
                B.drawLanternHalo(ctx, sx, sy, 48, { t: t, color: "#fde047", intensity: 0.65 });
                drawMiniYellowSub45(ctx, S, sx, sy, 0.88, t + s);
              }
            }
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = outRamp(resolved, 1.8);
            var fx = 610;
            var fy = 220 + Math.sin(t * 4.5) * 6;

            drawCrimsonBallastPlume(ctx, S, B, 1020, 380, fx + 265, fy + 112, 1, t);
            drawSuspendedFunnel45(ctx, S, plates, fx, fy, 270, 220, { rot: -0.08 });

            // Baster rocketing out wide funnel mouth spinning end-over-end like a boomerang!
            var arcU = (t * 0.52) % 1;
            var bx = fx - 40 - Math.sin(arcU * Math.PI) * 340;
            var by = fy + 95 - Math.sin(arcU * Math.PI * 2) * 115;
            drawBasterCutout45(ctx, S, plates, bx, by, 228, 162, t * 8.5, 1, 1);

            for (var b = 0; b < 16; b++) {
              var bu = ((t * 0.75 + b / 16) % 1);
              drawPaperBead45(ctx, S, fx - bu * 360, fy + 60 + Math.sin(bu * 9 + b) * 95, 12, BEAD_COLS_45[b % 5], b);
            }

            // Brass submarine periscope at bottom-left + Turkey ducking behind it!
            drawLimb(ctx, S, 245, 595, 245, 395, 13, 11, "#b88a3c", "brass", "brass");
            drawLimb(ctx, S, 245, 395, 295, 395, 11, 11, "#d8a242", null, "silver");
            S.drawTurkeyInCorner(ctx, 195, 505 + Math.abs(Math.sin(t * 5)) * 18 * u, 1.0, t, { dispatch: 0.3 });
            S.drawTurkeyCutawayBadge(ctx, 108, 495, 0.94, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            // Funnel rotated upright acting as cheerful creek fountain geyser!
            var fx = 505;
            var fy = 225;
            drawCrimsonBallastPlume(ctx, S, B, 640, 565, 640, 395, 1, t, { bubbles: 20 });
            drawSuspendedFunnel45(ctx, S, plates, fx, fy, 265, 215, { rot: -Math.PI * 0.5, wires: false });

            // Geyser water arcs + tumbling stones landing in 3 neat color-sorted piles!
            for (var g = 0; g < 14; g++) {
              var gu = ((t * 0.7 + g / 14) % 1);
              var side = (g % 2 === 0) ? -1 : 1;
              var gx = 640 + side * gu * 220;
              var gy = 215 - Math.sin(gu * Math.PI) * 135 + gu * 305;
              drawPaperBead45(ctx, S, gx, gy, 12, BEAD_COLS_45[g % 4], g + 19);
            }
            // Neat sorted riverbed bead/stone pyramids
            var piles = [395, 640, 885];
            for (var p = 0; p < 3; p++) {
              for (var k = 0; k < 6; k++) {
                var row = k < 3 ? 0 : (k < 5 ? 1 : 2);
                var col = k < 3 ? k - 1 : (k < 5 ? k - 3.5 : 0);
                drawPaperBead45(ctx, S, piles[p] + col * 24, 526 - row * 20, 12, BEAD_COLS_45[p], p * 9 + k);
              }
            }

            S.drawBrookTrout(ctx, 975, 438 + Math.sin(t * 2.8) * 6, 1.08, t, true);
            B.drawSnailSilverTrail(ctx, 210, 528, 315, 524, 1, t);
            S.drawMailSnail(ctx, 315, 520, 1.18, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            // Funnel burping upward into saucer's green ray, turning saucer's landing fin into Lego beads!
            var saucerX = 640;
            var saucerY = 128;
            B.drawTractorRings(ctx, saucerX, saucerY + 20, 640, 320, t, { spread: 130 });
            drawCrimsonBallastPlume(ctx, S, B, 640, 555, 640, 300, 1, t);
            drawSuspendedFunnel45(ctx, S, plates, 508, 285, 265, 215, { rot: -Math.PI * 0.5, wires: false });

            S.drawAlienSaucer(ctx, saucerX, saucerY, 1.32, t, false);
            // Blinking shocked 3 saucer eyes + right chrome fin dissolving into floating neon Lego beads!
            var blink = Math.sin(t * 14) > 0.2 ? 1 : 0.15;
            for (var ei = -1; ei <= 1; ei++) {
              ctx.fillStyle = "#fef08a";
              ctx.beginPath();
              ctx.ellipse(saucerX + ei * 14, saucerY - 22, 6, 7 * blink, 0, 0, TAU);
              ctx.fill();
            }
            for (var lb = 0; lb < 14; lb++) {
              var lu = ((t * 0.55 + lb / 14) % 1);
              var lx = saucerX + 52 + lu * 220 + Math.sin(t * 4 + lb) * 16;
              var ly = saucerY + 18 + lu * 195;
              var lCol = lb % 2 === 0 ? "#4ade80" : "#f472b6";
              S.drawCutoutPaperEdge(ctx, [[lx - 14, ly - 10], [lx + 14, ly - 10], [lx + 14, ly + 10], [lx - 14, ly + 10]], lCol, "#14110d", { paperRim: 2, shadow: false });
              ctx.fillStyle = lCol;
              ctx.fillRect(lx - 9, ly - 15, 6, 5);
              ctx.fillRect(lx + 3, ly - 15, 6, 5);
            }
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            // Empty funnel bobbing gently + cinched bulging canvas pouch stamped NON-HAZARDOUS
            drawSuspendedFunnel45(ctx, S, plates, 485, 185 + Math.sin(t * 2.2) * 10, 265, 215);

            var bagX = 765;
            var bagY = 458;
            S.drawCutoutPaperEdge(
              ctx,
              [[bagX - 42, bagY - 72], [bagX + 42, bagY - 72], [bagX + 86, bagY + 18], [bagX + 72, bagY + 68], [bagX - 72, bagY + 68], [bagX - 86, bagY + 18]],
              "#d6c3a5",
              "#14110d",
              { paperRim: 4.0 }
            );
            // Drawstring bow + green check safety tag
            ctx.strokeStyle = "#991b1b";
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.moveTo(bagX - 46, bagY - 52);
            ctx.lineTo(bagX + 46, bagY - 52);
            ctx.stroke();
            drawEmblemPlaque(ctx, S, bagX + 12, bagY + 10, 66, 58, -0.08, "check", { accent: "#16a34a" });

            B.drawSnailSilverTrail(ctx, 520, 528, 645, 524, 1, t);
            S.drawMailSnail(ctx, 645, 520, 1.22, t, { hasReply: false });

            // Turkey breathing huge foggy relief sigh clouds!
            S.drawTurkeyInCorner(ctx, 215, 482, 1.10, t, { dispatch: 0.6 });
            S.drawTurkeyCutawayBadge(ctx, 112, 495, 0.94, t);
            for (var sg = 0; sg < 5; sg++) {
              var su = ((t * 0.65 + sg / 5) % 1);
              drawCutoutBubble(ctx, 275 + su * 155, 455 - su * 65 + Math.sin(t * 3 + sg) * 8, 12 + su * 18, "rgba(241, 245, 249, 0.85)");
            }
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var fx = 495;
            var fy = 205 + Math.sin(t * 2.4) * 5;
            drawSuspendedFunnel45(ctx, S, plates, fx, fy, 280, 228);

            // 3 Festive floating bead pearl-necklace garlands woven on silvery snail-slime threads!
            var spans = [
              [285, 265, fx + 70, fy + 65, 65],
              [fx + 65, fy + 165, 965, 285, 85],
              [340, 395, 920, 410, 72]
            ];
            for (var s = 0; s < spans.length; s++) {
              var sp = spans[s];
              ctx.strokeStyle = "rgba(248, 250, 252, 0.85)";
              ctx.lineWidth = 3.0;
              ctx.beginPath();
              ctx.moveTo(sp[0], sp[1]);
              ctx.quadraticCurveTo((sp[0] + sp[2]) * 0.5, (sp[1] + sp[3]) * 0.5 + sp[4], sp[2], sp[3]);
              ctx.stroke();

              for (var b = 1; b < 10; b++) {
                var bu = b / 10;
                var omt = 1 - bu;
                var mx = (sp[0] + sp[2]) * 0.5;
                var my = (sp[1] + sp[3]) * 0.5 + sp[4] + Math.sin(t * 3 + s) * 8;
                var bx = omt * omt * sp[0] + 2 * omt * bu * mx + bu * bu * sp[2];
                var by = omt * omt * sp[1] + 2 * omt * bu * my + bu * bu * sp[3];
                drawPaperBead45(ctx, S, bx, by, 10.5, BEAD_COLS_45[(s + b) % 5], s * 13 + b);
              }
            }

            S.drawBrookTrout(ctx, 945, 315 + Math.sin(t * 2.9) * 8, 1.08, t, true, { tilt: 0.12 });
            B.drawSnailSilverTrail(ctx, 220, 526, 365, 415, 1, t);
            S.drawMailSnail(ctx, 365, 412, 1.20, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = outRamp(resolved, 1.7);
            S.drawAlienSaucer(ctx, 660, 96, 1.24, t, 660, 465);
            B.drawTractorRings(ctx, 660, 120, 660, 480, t, { spread: 140 });

            drawSuspendedFunnel45(ctx, S, plates, 315, 235, 245, 200);

            // Stamped canvas bead pouch levitating UP into saucer hatch!
            var liftU = 0.25 + ((t * 0.35) % 0.65);
            var py = lerp(475, 195, liftU);
            S.drawCutoutPaperEdge(
              ctx,
              [[615, py - 42], [705, py - 42], [718, py + 42], [602, py + 42]],
              "#d6c3a5",
              "#14110d",
              { paperRim: 3.5 }
            );
            drawEmblemPlaque(ctx, S, 660, py + 4, 46, 42, 0.08, "star", { accent: "#8b5cf6" });

            // Glowing golden space-coin beaming DOWN to Mail Snail + postal confetti!
            var coinY = lerp(165, 465, ((t * 0.42 + 0.5) % 1));
            B.drawLanternHalo(ctx, 565, coinY, 55, { t: t, color: "#facc15", intensity: 0.9 });
            ctx.save();
            ctx.translate(565, coinY);
            ctx.scale(Math.cos(t * 5.5), 1);
            drawEmblemPlaque(ctx, S, 0, 0, 54, 54, Math.PI * 0.25, "star", { bg: "#fde047", accent: "#b45309" });
            ctx.restore();

            B.drawDeterministicParticles(ctx, "confetti", 660, 320, t, { loop: true, count: 24, seed: 45.9 });
            S.drawMailSnail(ctx, 520, 520, 1.22, t, { hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var fx = 445;
            var fy = 215 + Math.sin(t * 4.5) * 6;
            drawSuspendedFunnel45(ctx, S, plates, fx, fy, 265, 215, { rot: 0.09 });

            // Snapped-out red rubber baster gripped in recoiled brass scissor-tongs honking sound rings!
            var recoilX = 835 + Math.sin(t * 7.0) * 14;
            var recoilY = 345;
            drawBasterCutout45(ctx, S, plates, recoilX - 35, recoilY - 12, 240, 168, 0.35, 1, 1);
            drawBrassScissorTongs(ctx, S, B, 1085, 585, recoilX, recoilY, 0.08, t, { bendDir: -1 });
            drawConcentricRipples(ctx, recoilX - 95, recoilY - 25, 4, 130, t, "#facc15", 1);

            B.drawDeterministicParticles(ctx, "confetti", 650, 310, t, { loop: true, count: 26, seed: 88.2 });
            for (var b = 0; b < 14; b++) {
              var ba = (b / 14) * TAU + t * 0.9;
              var br = 95 + (b % 3) * 55;
              drawPaperBead45(ctx, S, 610 + Math.cos(ba) * br, 320 + Math.sin(ba) * br * 0.7, 12, BEAD_COLS_45[b % 5], b);
            }

            S.drawTurkeyInCorner(ctx, 215, 476, 1.12, t, { dispatch: 1.0 });
            S.drawTurkeyCutawayBadge(ctx, 112, 495, 0.95, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var fx = 420;
            var fy = 225;
            var pump = 1 - Math.abs(Math.sin(t * 4.8)) * 0.24;

            drawBasterCutout45(ctx, S, plates, fx - 52, fy + 82, 238, 168, 0.04, pump, 2 - pump);
            drawBrassScissorTongs(ctx, S, B, 250, 585, fx - 128, fy + 52, 0.06 + (1 - pump) * 0.4, t, { bendDir: -1, sparks: false });
            drawSuspendedFunnel45(ctx, S, plates, fx, fy, 270, 220);

            // Pearly iridescent soap-film bubbles pumped out funnel tip lifting Mail Snail!
            var nozX = fx + 270;
            var nozY = fy + 110;
            for (var sb = 0; sb < 8; sb++) {
              var su = ((t * 0.42 + sb / 8) % 1);
              var bx = lerp(nozX + 18, 980, su);
              var by = nozY - su * 135 + Math.sin(t * 3.5 + sb) * 18;
              drawCutoutBubble(ctx, bx, by, 18 + su * 22, "rgba(224, 242, 254, 0.65)");
            }

            // Giant soap bubble floating Mail Snail beside grinning Brook Trout!
            var floatY = 285 + Math.sin(t * 2.4) * 22;
            drawCutoutBubble(ctx, 835, floatY, 64, "rgba(186, 230, 253, 0.48)");
            S.drawMailSnail(ctx, 835, floatY + 14, 1.05, t, { hasReply: true, trail: false });
            S.drawBrookTrout(ctx, 995, 365 + Math.cos(t * 2.6) * 12, 1.12, t, true, { tilt: -0.10 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 84, 1.16, t, 690, 340);
            B.drawTractorRings(ctx, 640, 108, 690, 360, t, { spread: 195 });

            drawSuspendedFunnel45(ctx, S, plates, 265, 335, 225, 185, { rot: -0.45 });
            drawBrassScissorTongs(ctx, S, B, 175, 590, 235, 445, 0.34, t, { bendDir: -1 });

            // 26 Rainbow pellets frozen in mid-water forming a glowing Cosmic Turkey Constellation!
            var cx = 735;
            var cy = 345;
            var turkeyPts = [];
            // Fan tail arc (14 beads)
            for (var f = 0; f < 14; f++) {
              var fa = Math.PI * 0.82 + (f / 13) * Math.PI * 1.12;
              turkeyPts.push([cx - 25 + Math.cos(fa) * 145, cy + 15 + Math.sin(fa) * 135]);
            }
            // Body, breast, neck, head, beak (10 beads)
            var bodyPts = [
              [cx - 35, cy + 55], [cx + 15, cy + 62], [cx + 58, cy + 38], [cx + 72, cy - 4],
              [cx + 68, cy - 48], [cx + 78, cy - 88], [cx + 108, cy - 82], [cx + 84, cy - 62],
              [cx - 8, cy + 12], [cx + 28, cy + 16]
            ];
            for (var bp = 0; bp < bodyPts.length; bp++) turkeyPts.push(bodyPts[bp]);

            // Glowing constellation lines
            ctx.save();
            ctx.strokeStyle = "rgba(253, 224, 71, 0.65)";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            for (var p = 0; p < turkeyPts.length; p++) {
              if (p === 0) ctx.moveTo(turkeyPts[p][0], turkeyPts[p][1]);
              else ctx.lineTo(turkeyPts[p][0], turkeyPts[p][1]);
            }
            ctx.stroke();
            ctx.restore();

            for (var tp = 0; tp < turkeyPts.length; tp++) {
              var tw = Math.sin(t * 4.5 + tp) * 3;
              B.drawLanternHalo(ctx, turkeyPts[tp][0], turkeyPts[tp][1], 28, { t: t, color: BEAD_COLS_45[tp % 5], intensity: 0.55 });
              drawPaperBead45(ctx, S, turkeyPts[tp][0], turkeyPts[tp][1] + tw, 11.5, BEAD_COLS_45[tp % 5], tp + 77);
            }
          }
        }
      }
    });
  }

  /* ==========================================================================
   * PORTHOLE #46 · STEPS (queneau-rostrum · Zazie dans le metro)
   * Plates: portholes/p46.jpg (640x640) + assets/atlas-stills/atlas-50.webp (382x680)
   * Pure-Vector Sculpted Slab Reliefs on G-O-B-B-L-E (0 canvas text calls!)
   * ========================================================================== */

  // idx: 0=G, 1=O, 2=B, 3=B, 4=L, 5=E, 6=C, 7=R
  function drawBrassGlyphRelief46(ctx, idx, size, blindMode) {
    var s = size * 0.34;
    ctx.save();
    ctx.strokeStyle = "#4b310a";
    ctx.fillStyle = "#fff1ba";
    ctx.lineWidth = Math.max(3.2, size * 0.11);
    ctx.lineCap = "square";
    ctx.lineJoin = "miter";

    if (blindMode) {
      // Pure stepped architectural brass coffer & diagonals in blind mode
      ctx.strokeRect(-s, -s, s * 2, s * 2);
      ctx.fillStyle = "#d99b34";
      ctx.fillRect(-s * 0.52, -s * 0.52, s * 1.04, s * 1.04);
      ctx.strokeRect(-s * 0.52, -s * 0.52, s * 1.04, s * 1.04);
      ctx.restore();
      return;
    }

    ctx.beginPath();
    if (idx === 0) {
      ctx.arc(0, 0, s, -Math.PI * 0.22, Math.PI * 0.18, true);
      ctx.lineTo(s, 0);
      ctx.lineTo(0, 0);
    } else if (idx === 1) {
      ctx.arc(0, 0, s, 0, TAU);
    } else if (idx === 2 || idx === 3) {
      ctx.moveTo(-s * 0.85, -s);
      ctx.lineTo(-s * 0.85, s);
      ctx.moveTo(-s * 0.85, -s);
      ctx.arc(-s * 0.1, -s * 0.5, s * 0.5, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.lineTo(-s * 0.85, 0);
      ctx.moveTo(-s * 0.85, 0);
      ctx.arc(-s * 0.05, s * 0.5, s * 0.52, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.lineTo(-s * 0.85, s);
    } else if (idx === 4) {
      ctx.moveTo(-s * 0.65, -s);
      ctx.lineTo(-s * 0.65, s);
      ctx.lineTo(s * 0.75, s);
    } else if (idx === 5) {
      ctx.moveTo(s * 0.7, -s);
      ctx.lineTo(-s * 0.7, -s);
      ctx.lineTo(-s * 0.7, s);
      ctx.lineTo(s * 0.7, s);
      ctx.moveTo(-s * 0.7, 0);
      ctx.lineTo(s * 0.45, 0);
    } else if (idx === 6) {
      // Sculpted 'C' arc
      ctx.arc(0, 0, s, -Math.PI * 0.28, Math.PI * 0.28, true);
    } else {
      // Sculpted 'R' loop + leg
      ctx.moveTo(-s * 0.8, s);
      ctx.lineTo(-s * 0.8, -s);
      ctx.arc(-s * 0.05, -s * 0.45, s * 0.52, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.lineTo(-s * 0.8, 0.08 * s);
      ctx.moveTo(-s * 0.1, 0.08 * s);
      ctx.lineTo(s * 0.8, s);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawBrassBlock46(ctx, S, x, y, w, h, depth3d, rot, idx, opts) {
    var cfg = opts || {};
    var hw = w * 0.5;
    var hh = h * 0.5;
    var dx = depth3d * 0.72;
    var dy = -depth3d * 0.54;

    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);

    var haloPoly = [
      [-hw - 5, -hh - 5],
      [-hw + dx, -hh + dy - 5],
      [hw + dx + 5, -hh + dy - 5],
      [hw + dx + 5, hh + dy],
      [hw + 5, hh + 5],
      [-hw - 5, hh + 5]
    ];
    S.drawCutoutPaperEdge(ctx, haloPoly, cfg.rusty ? "#8a6d4b" : "#c9922e", "#14110d", {
      paperRim: 4.0,
      shadowX: 5,
      shadowY: 7
    });

    ctx.fillStyle = cfg.glow ? "#ffe999" : (cfg.rusty ? "#b08f6a" : "#f4d27a");
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

    ctx.fillStyle = cfg.rusty ? "#5c4730" : "#8c5f16";
    ctx.beginPath();
    ctx.moveTo(hw, -hh);
    ctx.lineTo(hw + dx, -hh + dy);
    ctx.lineTo(hw + dx, hh + dy);
    ctx.lineTo(hw, hh);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    var fg = ctx.createLinearGradient(-hw, -hh, hw, hh);
    fg.addColorStop(0.0, cfg.glow ? "#fff4c2" : (cfg.rusty ? "#a6855e" : "#ecc160"));
    fg.addColorStop(0.55, cfg.rusty ? "#7d603e" : "#cf9630");
    fg.addColorStop(1.0, cfg.rusty ? "#543e26" : "#9e6c1a");
    ctx.fillStyle = fg;
    ctx.fillRect(-hw, -hh, w, h);
    ctx.strokeRect(-hw, -hh, w, h);

    drawBrassGlyphRelief46(ctx, idx, Math.min(w, h), !!cfg.blind);
    S.drawSplitPin(ctx, -hw + 9, -hh + 9, 3.0, { metal: "brass" });
    S.drawSplitPin(ctx, hw - 9, hh - 9, 3.0, { metal: "brass" });

    ctx.restore();
  }

  function drawStaircaseBlocks46(ctx, S, resolved, opts) {
    var cfg = opts || {};
    var liftY = cfg.liftY || 0;
    var order = cfg.order || [0, 1, 2, 3, 4, 5]; // 0=G at top-right or bottom-left? Wait: p46.jpg has G bottom-left (345,485) ascending to E top-right (810,205)!
    for (var i = 0; i < 6; i++) {
      var sx = 355 + i * 92 + (cfg.dx ? cfg.dx(i) : 0);
      var sy = 482 - i * 54 + liftY + (cfg.dy ? cfg.dy(i) : 0);
      var rot = cfg.rot ? cfg.rot(i) : 0;
      if (cfg.plinths !== false) {
        S.drawCardboardPuppetPiece(
          ctx,
          [[sx - 44, sy + 32], [sx + 50, sy + 32], [sx + 50, 548], [sx - 44, 548]],
          { tone: "#9d8350", ribs: 2, shadow: true }
        );
      }
      drawBrassBlock46(ctx, S, sx, sy, 76, 74, 22, rot, order[i], {
        blind: resolved.blind,
        glow: !!(cfg.glow && cfg.glow(i))
      });
    }
  }

  function registerPorthole46() {
    var B = getEngine();

    B.definePortalGame(46, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var isCosmic = resolved.selectedTier === "preposterous";
        var pxFar = parallaxX(resolved, 0.22);
        var pxMid = parallaxX(resolved, 0.50);

        S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 46, t, resolved, {
          paperTop: isCosmic ? "#292640" : "#fae090",
          paperBot: isCosmic ? "#181728" : "#ecd078",
          floorColor: isCosmic ? "#1c3038" : "#273b19"
        });

        // Upper water-ripple sky ribbon from p46.jpg
        S.drawScissorCutout(
          ctx,
          plates.portholeImg,
          195, 108, 245, 86,
          195 + pxFar, 28, 440, 105,
          [[0.03, 0.14], [0.35, 0.04], [0.72, 0.06], [0.97, 0.18], [0.94, 0.88], [0.58, 0.94], [0.18, 0.90], [0.02, 0.72]],
          { haloWidth: 4.2, filter: isCosmic ? "cyan" : "sepia", alpha: 0.90 }
        );

        // Bespectacled Fish Instructor & colorful fish pupils from atlas-50.webp (382x680, avoiding right chalkboard)
        S.drawScissorCutout(
          ctx,
          plates.atlasImg,
          148, 125, 122, 310,
          104 + pxMid * 0.6, 196, 142, 282,
          [[0.16, 0.04], [0.82, 0.03], [0.94, 0.36], [0.88, 0.95], [0.14, 0.96], [0.05, 0.48]],
          { haloWidth: 4.2, filter: "sepia", alpha: 0.85, rot: Math.sin(t * 1.6) * 0.03 }
        );
        S.drawScissorCutout(
          ctx,
          plates.atlasImg,
          8, 326, 165, 195,
          938 + pxMid * 0.7, 360, 188, 178,
          [[0.06, 0.12], [0.68, 0.04], [0.96, 0.36], [0.92, 0.92], [0.12, 0.95], [0.03, 0.56]],
          { haloWidth: 4.2, alpha: 0.88 }
        );

        // Mossy right bank & left rock ledge from p46.jpg
        S.drawScissorCutout(
          ctx,
          plates.portholeImg,
          368, 202, 152, 286,
          982 + pxMid * 0.5, 190, 228, 360,
          [[0.22, 0.04], [0.92, 0.03], [0.97, 0.48], [0.94, 0.96], [0.06, 0.96], [0.08, 0.56]],
          { haloWidth: 4.8, filter: isCosmic ? "cyan" : "none" }
        );
        S.drawScissorCutout(
          ctx,
          plates.portholeImg,
          118, 252, 102, 188,
          42 + pxMid * 0.5, 320, 158, 228,
          [[0.06, 0.06], [0.76, 0.12], [0.95, 0.62], [0.88, 0.96], [0.05, 0.95]],
          { haloWidth: 4.4 }
        );

        B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.18, color: "#fef08a" });
        B.drawDepthFog(ctx, W, H, t, { density: 0.12, color: "#f5f5dc" });
      },

      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawSharedForeground(ctx, W, H, resolved, S);
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        // Loose hanging iron sign chain on top-right E & bottom-left G
        drawLimb(ctx, S, 815, 25, 815, 178, 5, 5, "#4a4d50", "silver", "brass");
        drawLimb(ctx, S, 355, 185, 342 + Math.sin(t * 2.2) * 14, 330, 5, 4, "#4a4d50", "silver", null);

        drawStaircaseBlocks46(ctx, S, resolved, {});

        // Two spotted creek trout swimming diagonally up the brass steps
        S.drawBrookTrout(ctx, 435 + Math.sin(t * 1.7) * 24, 285 + Math.cos(t * 2.1) * 9, 0.86, t, false, { tilt: -0.32 });
        S.drawBrookTrout(ctx, 735 + Math.cos(t * 1.5) * 22, 436 + Math.sin(t * 1.9) * 8, 0.82, t + 1.1, false, { tilt: -0.26 });
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.5);

          // Towering dark-amber elongated shadows cast onto creek silt behind & below steps!
          ctx.save();
          for (var i = 0; i < 6; i++) {
            var sx = 355 + i * 92;
            var sy = 482 - i * 54;
            ctx.fillStyle = "rgba(28, 22, 12, " + (0.42 * u).toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(sx - 38, sy + 36);
            ctx.lineTo(sx + 38, sy + 36);
            ctx.lineTo(sx + 135 * u, sy + 115 * u);
            ctx.lineTo(sx + 45 * u, sy + 115 * u);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();

          drawSubSpotlightRig(ctx, S, B, 210, 210, 585 + Math.sin(t * 2.5) * 85, 345, t, {
            intensity: 1.35 * u,
            spread: 195,
            color: "#38bdf8",
            coreColor: "#fef9c3"
          });

          drawStaircaseBlocks46(ctx, S, resolved, {
            glow: function () { return u > 0.3; }
          });
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.55);

          drawCrimsonBallastPlume(ctx, S, B, 640, 585, 600, 290, u, t, { bubbles: 26 });

          // Brass letters lifted off plinths clinking together like wind chimes!
          drawStaircaseBlocks46(ctx, S, resolved, {
            plinths: false,
            dy: function (i) { return -28 * u + Math.sin(t * 6.0 + i * 1.3) * 14 * u; },
            rot: function (i) { return Math.sin(t * 5.2 + i * 1.8) * 0.14 * u; },
            glow: function (i) { return (Math.floor(t * 5) % 6) === i; }
          });

          // Wind-chime clink sparkles between adjacent blocks
          for (var c = 0; c < 5; c++) {
            drawConcentricRipples(ctx, 400 + c * 92, 445 - c * 54 - 26 * u, 2, 34, t + c * 0.3, "#fffbeb", 1);
          }
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.45);
          drawStaircaseBlocks46(ctx, S, resolved, {
            glow: function (i) { return i === 2 || i === 3; }
          });

          // Mail Snail slithering briskly up the twin rounded bellies of the brass B's!
          var sx = lerp(355, 631, u);
          var sy = lerp(445, 282, u) - Math.abs(Math.sin(u * Math.PI * 3)) * 18;
          B.drawSnailSilverTrail(ctx, 330, 465, sx, sy, u, t, { arc: 24 });
          S.drawMailSnail(ctx, sx, sy, 1.22, t, { rot: -0.52, hasReply: false });
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.65);
          var gongVib = Math.sin(t * 26) * 0.10 * u;

          drawStaircaseBlocks46(ctx, S, resolved, {
            dx: function (i) { return i === 0 ? Math.sin(t * 30) * 6 * u : 0; },
            rot: function (i) { return i === 0 ? gongVib : Math.sin(t * 14 - i) * 0.04 * u; },
            glow: function (i) { return i === 0; }
          });

          // Brass caliper probe striking giant curved G block + shimmering sound ripples!
          var strikeOff = Math.abs(Math.sin(t * 6.5)) * 22;
          drawBrassScissorTongs(ctx, S, B, 845, 585, 392 + strikeOff, 482, 0.06, t, { bendDir: 1, seed: 46.4 });
          drawConcentricRipples(ctx, 355, 482, 5, 220 * u, t, "#facc15", 0.85);
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = outRamp(resolved, 1.8);

            // Beam swings left to illuminate dusty unlit C & R blocks + stitched Cobbler's Boot sign in weeds!
            drawSubSpotlightRig(ctx, S, B, 640, 580, 315, 465, t, {
              intensity: 1.3,
              spread: 175,
              color: "#fbbf24"
            });

            drawStaircaseBlocks46(ctx, S, resolved, {
              dx: function () { return 110; }
            });

            // Dusty tarnished C (idx 6) and R (idx 7) lying in mossy weeds proving OLD MAN COBBLER'S SHOE SIGN!
            drawBrassBlock46(ctx, S, 265, 492, 68, 68, 18, -0.24, 6, { blind: resolved.blind, rusty: true, glow: u > 0.3 });
            drawBrassBlock46(ctx, S, 355, 504, 68, 68, 18, 0.18, 7, { blind: resolved.blind, rusty: true, glow: u > 0.3 });

            // Cut-paper hanging leather Cobbler's Boot trade emblem!
            S.drawCutoutPaperEdge(
              ctx,
              [[278, 345], [322, 345], [324, 405], [368, 416], [368, 438], [274, 438]],
              "#7c2d12",
              "#14110d",
              { paperRim: 3.4 }
            );
            S.drawSplitPin(ctx, 300, 362, 3.8, { metal: "brass" });

            S.drawTurkeyInCorner(ctx, 185, 486, 1.08, t, { dispatch: 0.7 });
            S.drawTurkeyCutawayBadge(ctx, 108, 498, 0.94, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSubSpotlightRig(ctx, S, B, 230, 560, 610, 330, t, { intensity: 1.15, color: "#fde047" });
            drawStaircaseBlocks46(ctx, S, resolved, { glow: function () { return true; } });

            // Broadway marquee footlight halos along every brass step
            for (var m = 0; m < 6; m++) {
              B.drawLanternHalo(ctx, 355 + m * 92, 442 - m * 54, 52, { t: t + m, color: "#facc15", intensity: 0.85 });
            }

            // Brook Trout in dapper cut-paper top-hat leaping up the golden marquee steps!
            var hopIdx = (t * 1.8) % 5;
            var hx = 375 + hopIdx * 92;
            var hy = 415 - hopIdx * 54 - Math.abs(Math.sin(hopIdx * Math.PI)) * 52;
            S.drawBrookTrout(ctx, hx, hy, 0.98, t, false, { tilt: -0.35 });
            S.drawCutoutPaperEdge(ctx, [[hx - 62, hy - 22], [hx - 36, hy - 22], [hx - 38, hy - 44], [hx - 60, hy - 44]], "#18181b", "#fbfaf5", { paperRim: 1.8, shadow: false });

            // Mail Snail tearing perforated gold paper admission tickets at bottom step!
            B.drawSnailSilverTrail(ctx, 210, 542, 305, 536, 1, t);
            S.drawMailSnail(ctx, 305, 532, 1.18, t, { hasReply: true });
            for (var tk = 0; tk < 3; tk++) {
              drawEmblemPlaque(ctx, S, 345 + tk * 26, 534 - tk * 6, 22, 14, 0.15 * tk, "star", { bg: "#fef08a", accent: "#d42a1e", rim: 1.6 });
            }
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 92, 1.20, t, 595, 355);
            B.drawTractorRings(ctx, 640, 118, 595, 365, t, { spread: 210 });

            drawStaircaseBlocks46(ctx, S, resolved, { glow: function () { return true; } });

            // Holographic Rosetta cipher blueprint overlay projecting alien geometric glyphs!
            B.drawXRayOverlay(ctx, 595, 225, 420, 118, 1, function (c, cx, cy) {
              for (var g = 0; g < 6; g++) {
                var gx = cx - 165 + g * 66;
                c.strokeStyle = g % 2 === 0 ? "#34d399" : "#facc15";
                c.lineWidth = 2.6;
                c.beginPath();
                c.arc(gx, cy, 18, 0, TAU);
                c.moveTo(gx - 12, cy);
                c.lineTo(gx + 12, cy);
                c.moveTo(gx, cy - 18);
                c.lineTo(gx, cy + 18);
                c.stroke();
              }
            }, { t: t, borderColor: "#facc15" });

            S.drawTurkeyInCorner(ctx, 215, 488, 1.10, t, { dispatch: 0.8 });
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = outRamp(resolved, 1.8);
            var ladderX = 620;

            drawCrimsonBallastPlume(ctx, S, B, ladderX, 585, ladderX, 165, 1, t, { bubbles: 24 });

            // Twin iron ladder side rails + 6 brass blocks clicked into level sunlit escape rungs!
            drawLimb(ctx, S, ladderX - 64, 548, ladderX - 56, 125, 8, 7, "#52525b", "brass", "silver");
            drawLimb(ctx, S, ladderX + 64, 548, ladderX + 56, 125, 8, 7, "#52525b", "brass", "silver");
            for (var i = 0; i < 6; i++) {
              var ry = 505 - i * 68;
              var rx = lerp(355 + i * 92, ladderX, u);
              drawBrassBlock46(ctx, S, rx, ry, 96, 44, 15, Math.sin(t * 3 + i) * 0.03, i, {
                blind: resolved.blind,
                glow: true
              });
            }

            S.drawTurkeyInCorner(ctx, 395, 485, 1.14, t, { dispatch: 1.0 });
            S.drawTurkeyCutawayBadge(ctx, 118, 495, 0.96, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawCrimsonBallastPlume(ctx, S, B, 640, 585, 640, 260, 0.85, t, { bubbles: 20 });

            // Scrambled anagram order [2, 1, 0, 4, 5, 3] (B-O-G-L-E-B) bobbing in bubble surge!
            var anag = [2, 1, 0, 4, 5, 3];
            for (var i = 0; i < 6; i++) {
              var bx = 335 + i * 112;
              var by = 335 + Math.sin(t * 2.8 + i * 1.4) * 42;
              if (i === 1) {
                // Hollow giant brass 'O' water-polo hoop!
                ctx.strokeStyle = "#facc15";
                ctx.lineWidth = 14;
                ctx.beginPath();
                ctx.ellipse(bx, by, 32, 54, 0, 0, TAU);
                ctx.stroke();
              } else {
                drawBrassBlock46(ctx, S, bx, by, 72, 70, 20, Math.sin(t * 2 + i) * 0.16, anag[i], {
                  blind: resolved.blind,
                  glow: true
                });
              }
            }

            // Brook Trout nosing right through the O hoop + Mail Snail keeping score!
            S.drawBrookTrout(ctx, 447 + Math.sin(t * 3.2) * 48, 335, 1.02, t, false);
            S.drawMailSnail(ctx, 310, 528, 1.20, t, { hasReply: true });
            S.drawDieBadge(ctx, 365, 495, 4, t, "#0f8f80");
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 94, 1.24, t, 640, 480);
            B.drawTractorRings(ctx, 640, 120, 640, 495, t, { spread: 215 });

            // Bubble-wrapped brass letters spiraling upward in anti-gravity helix!
            for (var i = 0; i < 6; i++) {
              var ang = t * 1.5 + i * 1.04;
              var bx = 640 + Math.cos(ang) * 155;
              var by = 505 - i * 62 + Math.sin(ang * 2) * 14;
              drawCutoutBubble(ctx, bx, by, 54, "rgba(192, 132, 252, 0.28)");
              drawBrassBlock46(ctx, S, bx, by, 68, 64, 18, Math.sin(ang) * 0.22, i, {
                blind: resolved.blind,
                glow: true
              });
            }
            B.drawDeterministicParticles(ctx, "kintsugi", 640, 320, t, { loop: true, count: 24, seed: 46.8 });
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawStaircaseBlocks46(ctx, S, resolved, {});

            // Flipped rusty mounting bracket with green check plaque atop G (355, 482)
            drawEmblemPlaque(ctx, S, 355, 418, 62, 48, -0.10, "check", { accent: "#16a34a" });

            // Angled playground slide ramp down from L (723, 266) -> bottom & Mail Snail sliding!
            drawLimb(ctx, S, 723, 285, 545, 525, 10, 10, "#eab308", "brass", "brass");
            var slideU = (t * 0.65) % 1;
            var sx = lerp(723, 555, slideU);
            var sy = lerp(275, 515, slideU);
            B.drawSnailSilverTrail(ctx, 723, 275, sx, sy, 1, t);
            S.drawMailSnail(ctx, sx, sy, 1.18, t, { rot: 0.72, flip: true, hasReply: false });

            S.drawTurkeyInCorner(ctx, 215, 485, 1.10, t, { dispatch: 0.75 });
            S.drawTurkeyCutawayBadge(ctx, 112, 495, 0.94, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawStaircaseBlocks46(ctx, S, resolved, { glow: function (i) { return i === 1; } });

            // Tiny round apartment porthole windows & mailboxes tucked inside each hollow brass letter!
            for (var i = 0; i < 6; i++) {
              var wx = 355 + i * 92;
              var wy = 482 - i * 54;
              ctx.fillStyle = "#fef3c7";
              ctx.strokeStyle = "#14110d";
              ctx.lineWidth = 2.4;
              ctx.beginPath();
              ctx.arc(wx, wy, 18, 0, TAU);
              ctx.fill();
              ctx.stroke();
            }

            // Brook Trout waving fin from sunny O penthouse + Mail Snail delivering envelopes on B!
            S.drawBrookTrout(ctx, 447, 428 + Math.sin(t * 3.5) * 4, 0.68, t, false, { tilt: -0.25 });
            B.drawSnailSilverTrail(ctx, 490, 410, 585, 345, 1, t);
            S.drawMailSnail(ctx, 585, 340, 1.16, t, { rot: -0.45, hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            // Saucer hovering right above top step (815, 212) lowering shimmering gangplank!
            S.drawAlienSaucer(ctx, 855, 86, 1.20, t, 815, 215);
            B.drawTractorRings(ctx, 855, 110, 815, 225, t, { spread: 95 });
            drawStaircaseBlocks46(ctx, S, resolved, { glow: function () { return true; } });

            // Shimmering golden gangplank from top block up to saucer hatch
            drawLimb(ctx, S, 815, 185, 855, 112, 14, 10, "#fde047", "brass", "silver");
            var climbU = 0.25 + ((t * 0.38) % 0.70);
            var sx = lerp(735, 848, climbU);
            var sy = lerp(245, 122, climbU);
            B.drawSnailSilverTrail(ctx, 535, 360, sx, sy, 1, t);
            S.drawMailSnail(ctx, sx, sy, 1.14, t, { rot: -0.65, hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            // Timber gong frame + giant vibrating G dinner gong + harmless silt puffs!
            drawLimb(ctx, S, 480, 545, 495, 175, 12, 10, "#78350f", "brass", "brass");
            drawLimb(ctx, S, 680, 545, 665, 175, 12, 10, "#78350f", "brass", "brass");
            drawLimb(ctx, S, 465, 178, 695, 178, 13, 13, "#92400e", null, null);

            var gx = 580 + Math.sin(t * 28) * 8;
            var gy = 335;
            drawBrassBlock46(ctx, S, gx, gy, 156, 152, 28, Math.sin(t * 24) * 0.08, 0, {
              blind: resolved.blind,
              glow: true
            });
            drawBrassScissorTongs(ctx, S, B, 925, 565, gx + 84, gy + 12, 0.05, t, { bendDir: -1 });
            drawConcentricRipples(ctx, gx, gy, 5, 240, t, "#fde047", 1);
            B.drawDeterministicParticles(ctx, "ink_puffs", 580, 525, t, { loop: true, count: 14, color: "rgba(120, 95, 60, 0.45)", seed: 46.1 });

            // Turkey popping up wearing shiny upturned silver kitchen colander helmet!
            S.drawTurkeyInCorner(ctx, 255, 482, 1.12, t, { dispatch: 0.6 });
            ctx.save();
            ctx.translate(255, 442 + Math.sin(t * 2.5) * 2);
            S.drawCutoutPaperEdge(ctx, [[-34, 8], [-26, -22], [26, -22], [34, 8]], "#d4d4d8", "#14110d", { paperRim: 2.2, shadow: false });
            for (var h = -16; h <= 16; h += 8) {
              ctx.fillStyle = "#18181b";
              ctx.beginPath();
              ctx.arc(h, -8, 2.3, 0, TAU);
              ctx.fill();
            }
            ctx.restore();
            S.drawTurkeyCutawayBadge(ctx, 112, 498, 0.94, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var activeIdx = Math.floor(t * 5.0) % 6;

            // 6-Note creek brass xylophone rack!
            drawLimb(ctx, S, 315, 445, 865, 365, 11, 11, "#78350f", "brass", "brass");
            for (var i = 0; i < 6; i++) {
              var xx = 355 + i * 92;
              var xy = 425 - i * 14 + (i === activeIdx ? 10 : 0);
              drawBrassBlock46(ctx, S, xx, xy, 74, 112 - i * 8, 18, 0, i, {
                blind: resolved.blind,
                glow: i === activeIdx
              });
            }

            var targetX = 355 + activeIdx * 92;
            var targetY = 365 - activeIdx * 14;
            drawBrassScissorTongs(ctx, S, B, 640, 595, targetX, targetY, 0.04, t, { bendDir: 1 });

            // Geometric eighth-note shapes floating up + flipping Trout + conducting Mail Snail!
            for (var n = 0; n < 6; n++) {
              var nu = ((t * 0.55 + n / 6) % 1);
              var nx = 365 + n * 88;
              var ny = 330 - nu * 165;
              ctx.fillStyle = BEAD_COLS_45[n % 4];
              ctx.beginPath();
              ctx.ellipse(nx, ny, 9, 7, -0.3, 0, TAU);
              ctx.fill();
              ctx.strokeStyle = BEAD_COLS_45[n % 4];
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(nx + 7, ny);
              ctx.lineTo(nx + 7, ny - 26);
              ctx.lineTo(nx + 19, ny - 20);
              ctx.stroke();
            }

            S.drawBrookTrout(ctx, 885, 255 + Math.sin(t * 5) * 24, 0.98, t, true, { tilt: t * 4.5 });
            S.drawMailSnail(ctx, 235, 520, 1.20, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 112, 1.32, t, 640, 420);
            B.drawTractorRings(ctx, 640, 140, 450, 450, t, { spread: 145 });

            // Flashing 5-panel Close-Encounters disco light board on saucer skirt + giant brass Space-Tuba horn!
            var pCols = ["#ef4444", "#facc15", "#22c55e", "#3b82f6", "#a855f7"];
            for (var p = 0; p < 5; p++) {
              var on = ((Math.floor(t * 7) + p) % 2) === 0;
              ctx.fillStyle = on ? pCols[p] : "#1e293b";
              ctx.fillRect(580 + p * 24, 112, 20, 14);
            }
            // Giant curled brass Space-Tuba bell extending from saucer!
            S.drawCutoutPaperEdge(
              ctx,
              [[715, 118], [785, 132], [835, 92], [855, 178], [785, 152], [715, 134]],
              "#eab308",
              "#14110d",
              { paperRim: 3.0 }
            );
            drawConcentricRipples(ctx, 845, 135, 4, 165, t, "#34d399", 1);

            drawStaircaseBlocks46(ctx, S, resolved, { glow: function () { return true; } });
            drawBrassScissorTongs(ctx, S, B, 210, 585, 355, 482, 0.08, t, { bendDir: -1 });
            drawConcentricRipples(ctx, 355, 482, 4, 180, t, "#facc15", 1);
          }
        }
      }
    });
  }

  /* ==========================================================================
   * PORTHOLE #47 · ARMADA (perec-stage · ALAMO + Cartoon Saloon)
   * Plates: portholes/p47.jpg (640x640) + assets/atlas-stills/atlas-12.webp (740x561)
   * ========================================================================== */

  function drawCanningJar47(ctx, S, x, y, w, h, rot, mode, t, seed) {
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);

    var hw = w * 0.5;
    var hh = h * 0.5;
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

    var tintFill = mode === "lantern"
      ? "#eab308"
      : (mode === "mars" ? "#c2593f" : (mode === "cloud" ? "#60a5fa" : "#8ab8b4"));

    S.drawCutoutPaperEdge(ctx, jarPoly, tintFill, "#14110d", { paperRim: 3.6, shadow: false });

    // Trapped dome air-pocket / sloshing bubble inside upside-down Mason jar
    var sloshX = (mode === "slosh") ? Math.sin(t * 5.8 + seed) * (hw * 0.24) : 0;
    var airH = (mode === "organ") ? (hh * (0.16 + ((seed * 17) % 5) * 0.08)) : (hh * 0.26);
    ctx.fillStyle = mode === "lantern"
      ? "rgba(254, 249, 195, 0.92)"
      : (mode === "mars" ? "rgba(167, 243, 208, 0.85)" : "rgba(244, 252, 250, 0.86)");
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(sloshX, -hh * 0.36 + Math.sin(t * 2.8 + seed) * 3, hw * 0.68, airH, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (mode === "mars") {
      // Miniature holographic biodome tree + monorail arc inside jar!
      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.arc(0, 2, hw * 0.34, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#78350f";
      ctx.fillRect(-3, 6, 6, 14);
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(0, 8, hw * 0.58, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    } else if (mode === "cloud") {
      // Bottled white cumulus cloud inside jar
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(-8, 2, 11, 0, TAU);
      ctx.arc(5, -2, 13, 0, TAU);
      ctx.arc(14, 4, 9, 0, TAU);
      ctx.fill();
    } else if (mode === "gingham") {
      drawEmblemPlaque(ctx, S, 0, -4, w * 0.62, h * 0.38, 0, "gingham", { rim: 1.8 });
    }

    // Upside-down threaded zinc mason-jar lid ring at bottom
    if (mode !== "popped") {
      S.drawCardboardPuppetPiece(
        ctx,
        [[-hw * 0.84, hh * 0.72], [hw * 0.84, hh * 0.72], [hw * 0.80, hh], [-hw * 0.80, hh]],
        { tone: "#8d9296", ribs: 2, shadow: false }
      );
    }
    S.drawSplitPin(ctx, 0, hh * 0.24, 3.4, { metal: "brass" });
    ctx.restore();
  }

  function drawJarArmadaRig47(ctx, S, plates, cx, cy, pitch, jarMode, t, opts) {
    var cfg = opts || {};
    ctx.save();
    ctx.translate(cx, cy);
    if (pitch) ctx.rotate(pitch);

    // Overhead mooring ropes into creek canopy
    if (cfg.mooring !== false) {
      ctx.strokeStyle = "#c89d5c";
      ctx.lineWidth = 3.2;
      for (var m = -2; m <= 2; m++) {
        ctx.beginPath();
        ctx.moveTo(m * 95, -95);
        ctx.lineTo(m * 35, -265);
        ctx.stroke();
      }
    }

    // Two overlapping scissored canning-jar cluster plates from p47.jpg
    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      152, 148, 200, 195,
      -285, -108, 265, 195,
      [[0.08, 0.14], [0.55, 0.04], [0.94, 0.16], [0.96, 0.86], [0.46, 0.96], [0.04, 0.78]],
      { haloWidth: 4.0 }
    );
    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      290, 148, 196, 195,
      18, -106, 268, 195,
      [[0.06, 0.12], [0.52, 0.04], [0.94, 0.18], [0.96, 0.84], [0.48, 0.96], [0.05, 0.82]],
      { haloWidth: 4.0 }
    );

    // Foreground row of 7 articulated lashed jars
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
      var jBob = Math.sin(t * 3.1 + ji * 0.9) * 5;
      var thisMode = (cfg.popCenter && ji === 3) ? "popped" : jarMode;
      drawCanningJar47(ctx, S, jo[0], jo[1] + jBob, jo[2], jo[3], jo[4], thisMode, t, ji + 1);
    }

    // Criss-crossed knotted hemp twine lashing
    ctx.strokeStyle = cfg.laserTwine ? "#38bdf8" : "#c89d5c";
    ctx.lineWidth = 4.6;
    ctx.beginPath();
    ctx.moveTo(-285, 22);
    ctx.bezierCurveTo(-120, 48, 120, 48, 285, 22);
    ctx.moveTo(-270, -4);
    ctx.bezierCurveTo(-90, 26, 90, 26, 270, -4);
    ctx.stroke();

    ctx.restore();
  }

  function registerPorthole47() {
    var B = getEngine();

    B.definePortalGame(47, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var isCosmic = resolved.selectedTier === "preposterous";
        var pxFar = parallaxX(resolved, 0.24);
        var pxMid = parallaxX(resolved, 0.50);

        S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 47, t, resolved, {
          openX: 146,
          openY: 68,
          openW: 988,
          openH: 552,
          doors: true
        });

        ctx.save();
        ctx.beginPath();
        ctx.rect(146, 68, 988, 552);
        ctx.clip();

        var seaG = ctx.createLinearGradient(0, 68, 0, 620);
        if (isCosmic) {
          seaG.addColorStop(0.0, "#2d1832");
          seaG.addColorStop(0.55, "#5c272c");
          seaG.addColorStop(1.0, "#221218");
        } else {
          seaG.addColorStop(0.0, "#245b66");
          seaG.addColorStop(0.55, "#19434d");
          seaG.addColorStop(1.0, "#0f2830");
        }
        ctx.fillStyle = seaG;
        ctx.fillRect(146, 68, 988, 552);

        // Melies cutaway submarine boiler & cabin plates from atlas-12.webp (740x561, y>=162 avoids plaque)
        S.drawScissorCutout(
          ctx,
          plates.atlasImg,
          14, 162, 185, 255,
          168 + pxFar * 0.7, 205, 195, 275,
          [[0.05, 0.06], [0.88, 0.04], [0.96, 0.48], [0.94, 0.96], [0.04, 0.95]],
          { haloWidth: 3.8, filter: "sepia", alpha: 0.55 }
        );
        S.drawScissorCutout(
          ctx,
          plates.atlasImg,
          240, 168, 385, 225,
          755 + pxMid * 0.4, 235, 345, 215,
          [[0.06, 0.08], [0.92, 0.05], [0.97, 0.92], [0.04, 0.94]],
          { haloWidth: 3.8, filter: isCosmic ? "cyan" : "sepia", alpha: 0.46 }
        );

        B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.22, color: "#99f6e4" });
        B.drawDepthFog(ctx, W, H, t, { density: 0.14, color: "#bae6fd" });

        // Mossy riverbed boulders cropped from bottom of p47.jpg
        S.drawScissorCutout(
          ctx,
          plates.portholeImg,
          182, 418, 276, 108,
          255 + pxFar, 492, 770, 126,
          [[0.04, 0.25], [0.34, 0.06], [0.68, 0.08], [0.96, 0.24], [0.98, 0.94], [0.02, 0.95]],
          { haloWidth: 4.0 }
        );
        ctx.restore();
      },

      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawSharedForeground(ctx, W, H, resolved, S);
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var pitch = Math.sin(t * 1.8) * 0.04;
        var bob = Math.cos(t * 2.2) * 8;

        drawJarArmadaRig47(ctx, S, plates, 640, 305 + bob, pitch, "creek", t, {});

        // Dangling paper trade tags along the twine
        drawEmblemPlaque(ctx, S, 465, 378 + bob, 32, 40, 0.12, "star", { accent: "#d42a1e", rim: 2 });
        drawEmblemPlaque(ctx, S, 815, 376 + bob, 32, 40, -0.14, "check", { accent: "#0f8f80", rim: 2 });

        S.drawBrookTrout(ctx, 485 + Math.sin(t * 1.7) * 28, 465, 0.92, t, false, { tilt: -0.10 });
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.5);
          var bob = Math.cos(t * 2.2) * 6;

          drawSubSpotlightRig(ctx, S, B, 215, 495, 640, 295 + bob, t, {
            intensity: 1.35 * u,
            spread: 185,
            color: "#38bdf8"
          });

          // Rainbow prism checkerboard rays splitting through curved Mason domes!
          var prismCols = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#8b5cf6"];
          for (var p = 0; p < 6; p++) {
            B.drawVolumetricBeam(ctx, 520 + p * 48, 315 + bob, 410 + p * 95 + Math.sin(t * 2 + p) * 28, 560, {
              intensity: 0.72 * u,
              spread: 54,
              sourceRadius: 12,
              color: prismCols[p],
              t: t
            });
          }

          drawJarArmadaRig47(ctx, S, plates, 640, 305 + bob, Math.sin(t * 2) * 0.03, "lantern", t, {});
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.55);

          // Rolling crimson wake heaving beneath the lashed jars!
          drawCrimsonBallastPlume(ctx, S, B, 285, 525, 985, 445, u, t, { bubbles: 26 });

          var heavyPitch = Math.sin(t * 5.2) * 0.14 * u;
          var heavyHeave = Math.cos(t * 5.2) * 24 * u;
          drawJarArmadaRig47(ctx, S, plates, 640, 295 + heavyHeave, heavyPitch, "slosh", t, {});
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.45);
          var bob = Math.cos(t * 2.0) * 6;

          drawJarArmadaRig47(ctx, S, plates, 640, 315 + bob, 0.02, "gingham", t, {});

          // Mail Snail scooting across the top glass grid slapping pantry labels!
          var sx = lerp(395, 865, u);
          var sy = 228 + bob - Math.abs(Math.sin(u * Math.PI * 5)) * 12;
          B.drawSnailSilverTrail(ctx, 380, 232 + bob, sx, sy, u, t);
          S.drawMailSnail(ctx, sx, sy, 1.18, t, { hasReply: false });
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.6);

          drawJarArmadaRig47(ctx, S, plates, 640, 310, -0.03 * u, "creek", t, { popCenter: u > 0.35 });

          // Brass scissor-tongs nudging loose zinc canning ring on center jar!
          drawBrassScissorTongs(ctx, S, B, 895, 585, 642, 368, 0.14, t, { bendDir: 1, seed: 47.4 });

          // Plump wobbling silver air globe burping upward toward surface!
          var bY = lerp(340, 125, u);
          drawCutoutBubble(ctx, 642 + Math.sin(t * 6) * 10, bY, 16 + u * 34, "rgba(226, 232, 240, 0.88)");
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSubSpotlightRig(ctx, S, B, 235, 515, 650, 295, t, { intensity: 1.3, color: "#fef08a" });
            drawJarArmadaRig47(ctx, S, plates, 665, 295, 0.02, "creek", t, {});

            // Crystal-clear inspection magnifier showing 100% empty clean air jar (zero pickles!)
            B.drawXRayOverlay(ctx, 665, 295, 185, 155, 1, function (c, cx, cy) {
              c.strokeStyle = "#67e8f9";
              c.lineWidth = 3;
              c.strokeRect(cx - 42, cy - 52, 84, 104);
              drawCutoutBubble(c, cx, cy - 18, 26, "rgba(240, 253, 250, 0.88)");
            }, { t: t });

            // Turkey happily setting aside dual-canister brass beak gas-mask in relief!
            S.drawTurkeyInCorner(ctx, 255, 480, 1.12, t, { dispatch: 0.8 });
            S.drawCardboardPuppetPiece(ctx, [[335, 485], [385, 475], [392, 515], [332, 515]], { tone: "#52525b", pin: { x: 360, y: 495, metal: "brass" } });
            S.drawTurkeyCutawayBadge(ctx, 115, 495, 0.95, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var drift = Math.sin(t * 1.4) * 28;
            var cx = 640 + drift;

            // Patchwork trade sail & festive triangular bunting banners above glowing lantern skiff!
            drawLimb(ctx, S, cx, 305, cx, 105, 8, 6, "#92400e", "brass", "brass");
            S.drawCutoutPaperEdge(ctx, [[cx + 6, 112], [cx + 165, 175], [cx + 6, 238]], "#fef08a", "#14110d", { paperRim: 3.2 });

            drawJarArmadaRig47(ctx, S, plates, cx, 325, Math.sin(t * 2.1) * 0.04, "lantern", t, { mooring: false });
            for (var j = -3; j <= 3; j++) {
              B.drawLanternHalo(ctx, cx + j * 82, 325, 68, { t: t + j, color: "#fbbf24", intensity: 0.9 });
            }

            // Brook Trout nudging skiff + Mail Snail perched at bow!
            S.drawBrookTrout(ctx, cx - 340, 365 + Math.sin(t * 3) * 8, 1.12, t, false);
            S.drawMailSnail(ctx, cx + 245, 245, 1.14, t, { hasReply: true, trail: false });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 102, 1.20, t, 640, 335);
            B.drawTractorRings(ctx, 640, 128, 640, 345, t, { spread: 235 });

            // Hundred-Dome Mars Colony with biodome trees & glowing orbital monorail loop!
            drawJarArmadaRig47(ctx, S, plates, 640, 345, Math.sin(t * 1.5) * 0.03, "mars", t, { mooring: false, laserTwine: true });

            ctx.save();
            ctx.strokeStyle = "#fde047";
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.ellipse(640, 345, 320, 58, 0, 0, TAU);
            ctx.stroke();
            var monoA = t * 2.4;
            var mx = 640 + Math.cos(monoA) * 320;
            var my = 345 + Math.sin(monoA) * 58;
            S.drawCutoutPaperEdge(ctx, [[mx - 22, my - 9], [mx + 22, my - 9], [mx + 26, my + 9], [mx - 26, my + 9]], "#38bdf8", "#14110d", { paperRim: 2, shadow: false });
            ctx.restore();
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawCrimsonBallastPlume(ctx, S, B, 235, 535, 985, 425, 1, t, { bubbles: 24 });

            // Unsinkable air-pocket lifeboat riding high and level atop rolling wave!
            var bob = Math.sin(t * 3.4) * 14;
            drawJarArmadaRig47(ctx, S, plates, 665, 285 + bob, Math.sin(t * 3.4) * 0.03, "creek", t, { mooring: false });

            // Turkey holding DIY JAR PONTOON blueprint drawing board!
            S.drawCutoutPaperEdge(ctx, [[235, 355], [385, 355], [385, 465], [235, 465]], "#1e3a8a", "#fbfaf5", { paperRim: 3.5 });
            ctx.strokeStyle = "#93c5fd";
            ctx.lineWidth = 2.2;
            for (var d = 0; d < 4; d++) {
              ctx.strokeRect(255 + d * 30, 385, 22, 42);
            }
            S.drawTurkeyInCorner(ctx, 215, 488, 1.08, t, { dispatch: 0.85 });
            S.drawTurkeyCutawayBadge(ctx, 115, 498, 0.94, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawCrimsonBallastPlume(ctx, S, B, 260, 520, 960, 460, 0.75, t);
            drawJarArmadaRig47(ctx, S, plates, 640, 330, Math.sin(t * 2.5) * 0.04, "organ", t, {});

            // Shimmering musical pan-pipe wave columns rising from graduated jars!
            for (var k = 0; k < 7; k++) {
              var kx = 385 + k * 85;
              var barH = 35 + Math.abs(Math.sin(t * 6 + k * 0.9)) * 75;
              ctx.fillStyle = "rgba(103, 232, 249, 0.45)";
              ctx.fillRect(kx - 14, 245 - barH, 28, barH);
            }

            // Brook Trout leaping in arc over glass domes + Mail Snail drumming zinc lid!
            var leapU = (t * 0.65) % 1;
            var tx = lerp(380, 900, leapU);
            var ty = 250 - Math.sin(leapU * Math.PI) * 115;
            S.drawBrookTrout(ctx, tx, ty, 0.96, t, false, { tilt: (leapU - 0.5) * 0.9 });
            S.drawMailSnail(ctx, 355, 425, 1.18, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 96, 1.22, t, 640, 445);
            B.drawTractorRings(ctx, 640, 122, 640, 460, t, { spread: 235 });

            // 9 Lashed jars ascending in crisp V-formation like gleaming crystal star-barges!
            for (var v = -4; v <= 4; v++) {
              var vx = 640 + v * 72;
              var vy = 225 + Math.abs(v) * 44 + Math.sin(t * 3.5 + v) * 8;
              drawCanningJar47(ctx, S, vx, vy, 66, 98, v * 0.04, "lantern", t, v + 5);
              // Starlight contrail beneath each barge
              ctx.strokeStyle = "rgba(103, 232, 249, 0.72)";
              ctx.lineWidth = 3.5;
              ctx.beginPath();
              ctx.moveTo(vx, vy + 52);
              ctx.lineTo(vx, vy + 118);
              ctx.stroke();
            }
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawJarArmadaRig47(ctx, S, plates, 665, 305, 0.01, "gingham", t, {});

            // Mail Snail with inventory clipboard + Turkey nodding at tidy cellar surplus!
            B.drawSnailSilverTrail(ctx, 415, 225, 795, 225, 1, t);
            S.drawMailSnail(ctx, 795, 222, 1.18, t, { hasReply: false, trail: false });
            drawEmblemPlaque(ctx, S, 855, 215, 44, 54, 0.12, "check", { accent: "#16a34a" });

            S.drawTurkeyInCorner(ctx, 235, 482, 1.12, t, { dispatch: 0.85 });
            S.drawTurkeyCutawayBadge(ctx, 115, 496, 0.95, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawJarArmadaRig47(ctx, S, plates, 640, 275, 0, "creek", t, {});

            // Pip-numbered air-refill station plaques (die pips 1, 2, 3 — zero text!)
            S.drawDieBadge(ctx, 468, 205, 1, t, "#0f8f80");
            S.drawDieBadge(ctx, 640, 195, 2, t, "#0f8f80");
            S.drawDieBadge(ctx, 812, 205, 3, t, "#0f8f80");

            // Diving water-beetles & Brook Trout visiting underneath Mason domes for fresh air sips!
            for (var wb = 0; wb < 3; wb++) {
              var bx = 468 + wb * 172;
              var by = 375 + Math.sin(t * 4.2 + wb * 2) * 18;
              S.drawCutoutPaperEdge(ctx, [[bx - 18, by], [bx, by - 22], [bx + 18, by], [bx + 12, by + 20], [bx - 12, by + 20]], "#1e293b", "#fbfaf5", { paperRim: 2, shadow: false });
            }
            S.drawBrookTrout(ctx, 640, 425 + Math.sin(t * 2.8) * 10, 1.06, t, false, { tilt: -0.42 });
            S.drawMailSnail(ctx, 295, 485, 1.20, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 104, 1.28, t, 640, 325);
            B.drawTractorRings(ctx, 640, 132, 640, 335, t, { spread: 225 });

            // Delighted pink heart-shapes above saucer cockpit as bottled-cloud jars shimmer!
            drawEmblemPlaque(ctx, S, 555, 82 + Math.sin(t * 4) * 6, 38, 38, -0.15, "heart", { bg: "#fdf2f8", rim: 2 });
            drawEmblemPlaque(ctx, S, 725, 82 + Math.cos(t * 4) * 6, 38, 38, 0.15, "heart", { bg: "#fdf2f8", rim: 2 });

            drawJarArmadaRig47(ctx, S, plates, 640, 335, Math.sin(t * 1.6) * 0.03, "cloud", t, { mooring: false });
            S.drawMailSnail(ctx, 275, 505, 1.18, t, { hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawJarArmadaRig47(ctx, S, plates, 665, 345, 0.02, "creek", t, { popCenter: true });
            drawBrassScissorTongs(ctx, S, B, 965, 575, 715, 415, 0.28, t, { bendDir: -1 });

            // Giant popped bubble bursting into painted paper strawberries, pine sprigs & sunshine sparkles!
            B.drawLanternHalo(ctx, 640, 175, 125, { t: t, color: "#fde047", intensity: 0.95 });
            B.drawDeterministicParticles(ctx, "kintsugi", 640, 175, t, { loop: true, count: 22, seed: 47.2 });
            for (var sb = 0; sb < 7; sb++) {
              var a = (sb / 7) * TAU + t * 0.8;
              var sx = 640 + Math.cos(a) * 88;
              var sy = 175 + Math.sin(a) * 48;
              S.drawCutoutPaperEdge(ctx, [[sx, sy + 14], [sx - 12, sy - 6], [sx + 12, sy - 6]], "#e11d48", "#14110d", { paperRim: 2, shadow: false });
              ctx.fillStyle = "#16a34a";
              ctx.fillRect(sx - 6, sy - 12, 12, 6);
            }

            S.drawTurkeyInCorner(ctx, 245, 480, 1.14, t, { dispatch: 0.75 });
            S.drawTurkeyCutawayBadge(ctx, 115, 496, 0.95, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawJarArmadaRig47(ctx, S, plates, 640, 265, 0, "creek", t, { popCenter: true });

            // Popped zinc canning ring caught & spinning like a silver hoop on Brook Trout's nose!
            var tx = 685 + Math.sin(t * 2.2) * 20;
            var ty = 445;
            S.drawBrookTrout(ctx, tx, ty, 1.16, t, true, { tilt: 0.06 });
            ctx.save();
            ctx.translate(tx - 78, ty - 4);
            ctx.rotate(t * 7.5);
            ctx.strokeStyle = "#e2e8f0";
            ctx.lineWidth = 7.0;
            ctx.beginPath();
            ctx.ellipse(0, 0, 24, 11, 0, 0, TAU);
            ctx.stroke();
            ctx.restore();

            B.drawSnailSilverTrail(ctx, 250, 512, 415, 505, 1, t);
            S.drawMailSnail(ctx, 415, 502, 1.20, t, { hasReply: true });
            drawEmblemPlaque(ctx, S, 475, 485, 48, 42, -0.1, "check", { accent: "#0f8f80" });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 92, 1.18, t, 640, 255);
            B.drawTractorRings(ctx, 640, 118, 640, 265, t, { spread: 135 });

            drawJarArmadaRig47(ctx, S, plates, 640, 445, 0, "creek", t, { popCenter: true, mooring: false });

            // Escaped giant silver air bubble trapped in golden Saturn stasis ring with swirling clouds!
            var px = 640;
            var py = 255 + Math.sin(t * 2.4) * 8;
            drawCutoutBubble(ctx, px, py, 64, "rgba(226, 232, 240, 0.85)");
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(-0.22);
            ctx.strokeStyle = "#facc15";
            ctx.lineWidth = 6.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, 118, 26, 0, 0, TAU);
            ctx.stroke();
            // Tiny paper clouds along bubble equator
            for (var c = 0; c < 4; c++) {
              var cx = Math.sin(t * 2.2 + c * 1.57) * 44;
              ctx.fillStyle = "#ffffff";
              ctx.beginPath();
              ctx.arc(cx, -4 + (c % 2) * 10, 9, 0, TAU);
              ctx.fill();
            }
            ctx.restore();
          }
        }
      }
    });
  }

  /* ==========================================================================
   * PORTHOLE #48 · BELFRY (cardboard-parallax · Recits d'Ellis Island)
   * Plates: portholes/p48.jpg (640x640) + assets/atlas-stills/atlas-22.webp (740x416)
   * ========================================================================== */

  function drawRoosterVane48(ctx, S, x, y, scale, spinAng, bowAng) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Pure arrow cardinal crossbar (zero letters!)
    ctx.strokeStyle = "#121212";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(0, 42);
    ctx.lineTo(0, -48);
    ctx.moveTo(-40, 10);
    ctx.lineTo(40, 10);
    ctx.stroke();

    var hScale = Math.cos(spinAng || 0);
    if (Math.abs(hScale) < 0.2) hScale = hScale < 0 ? -0.2 : 0.2;
    ctx.save();
    ctx.translate(0, -18);
    if (bowAng) ctx.rotate(bowAng);
    ctx.scale(hScale, 1);

    S.drawCardboardPuppetPiece(
      ctx,
      [[-34, 6], [-22, -18], [-4, -12], [12, -26], [26, -16], [22, 6], [4, 14], [-18, 12]],
      { tone: "#a3a19a", ribs: 2, shadow: true }
    );
    S.drawCutoutPaperEdge(ctx, [[10, -26], [18, -38], [26, -26]], "#d42a1e", "#14110d", { paperRim: 1.6, shadow: false });
    ctx.restore();

    S.drawSplitPin(ctx, 0, -14, 4.4, { metal: "brass" });
    ctx.restore();
  }

  function drawSteepleAndBell48(ctx, S, plates, steepleX, baseTopY, bellSwing, t, opts) {
    var cfg = opts || {};

    // Flooded clapboard belfry & tin roof scissored from p48.jpg (starts y=168 below vane text!)
    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      214, 168, 212, 336,
      steepleX - 148, baseTopY, 296, 392,
      [[0.46, 0.01], [0.54, 0.01], [0.88, 0.42], [0.96, 0.50], [0.88, 0.54], [0.88, 0.98], [0.12, 0.98], [0.12, 0.54], [0.04, 0.50], [0.12, 0.42]],
      { haloWidth: 4.6, filter: cfg.chrome ? "mono" : "sepia" }
    );

    if (cfg.chrome) {
      // Riveted silver rocket nose-cone plating over tin roof
      S.drawCardboardPuppetPiece(
        ctx,
        [[steepleX, baseTopY - 12], [steepleX + 114, baseTopY + 170], [steepleX - 114, baseTopY + 170]],
        { tone: "#cbd5e1", ribs: 3, pins: [[steepleX, baseTopY + 24], [steepleX - 68, baseTopY + 148], [steepleX + 68, baseTopY + 148]] }
      );
    }

    // Jointed bronze bell inside underwater belfry arch
    var bellPivotY = baseTopY + 238;
    ctx.save();
    ctx.translate(steepleX, bellPivotY);
    ctx.rotate(bellSwing || 0);
    S.drawCardboardPuppetPiece(
      ctx,
      [[-18, 4], [18, 4], [36, 60], [-36, 60]],
      { tone: "#787158", ribs: 2, pin: { x: 0, y: 6, r: 4.5, metal: "brass" } }
    );
    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.arc(0, 64, 8, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawWaterlineRibbon48(ctx, W, waterY, t) {
    ctx.save();
    ctx.fillStyle = "rgba(186, 230, 222, 0.16)";
    ctx.fillRect(86, waterY, W - 172, 640 - waterY);
    ctx.strokeStyle = "#fbfaf5";
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    for (var wx = 86; wx <= W - 86; wx += 24) {
      var wy = waterY + Math.sin(wx * 0.022 + t * 2.8) * 5.5;
      if (wx === 86) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.stroke();
    ctx.restore();
  }

  function registerPorthole48() {
    var B = getEngine();

    B.definePortalGame(48, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var isCosmic = resolved.selectedTier === "preposterous";
        var px1 = parallaxX(resolved, 0.20);
        var px2 = parallaxX(resolved, 0.45);
        var waterY = 286 + Math.sin(t * 1.5) * 4;

        S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 48, t, resolved, { pillarbox: true });

        // Pale archival sky band above waterline
        var skyG = ctx.createLinearGradient(90, 0, 90, waterY);
        skyG.addColorStop(0.0, isCosmic ? "#1e1b4b" : "#dcdad2");
        skyG.addColorStop(1.0, isCosmic ? "#312e81" : "#b8b5ab");
        ctx.fillStyle = skyG;
        ctx.fillRect(86, 0, W - 172, waterY);

        // Submerged TVA valley uprights from atlas-22.webp (740x416) below waterline
        S.drawScissorCutout(
          ctx,
          plates.atlasImg,
          22, 66, 332, 282,
          106 + px1, waterY + 6, 510, 312,
          [[0.02, 0.04], [0.96, 0.06], [0.98, 0.96], [0.03, 0.95]],
          { haloWidth: 3.4, filter: "mono", alpha: 0.76 }
        );
        S.drawScissorCutout(
          ctx,
          plates.atlasImg,
          355, 66, 355, 282,
          652 + px1 * 1.1, waterY + 6, 520, 312,
          [[0.03, 0.05], [0.97, 0.04], [0.96, 0.96], [0.04, 0.95]],
          { haloWidth: 3.4, filter: "mono", alpha: 0.76 }
        );

        // Left & right autumn shoreline tree banks scissored from p48.jpg along waterline
        S.drawScissorCutout(
          ctx,
          plates.portholeImg,
          116, 186, 156, 118,
          102 + px2, waterY - 106, 328, 122,
          [[0.03, 0.24], [0.35, 0.05], [0.78, 0.16], [0.98, 0.68], [0.96, 0.96], [0.02, 0.96]],
          { haloWidth: 4.0, filter: "sepia" }
        );
        S.drawScissorCutout(
          ctx,
          plates.portholeImg,
          372, 186, 152, 118,
          846 + px2, waterY - 108, 330, 124,
          [[0.04, 0.65], [0.28, 0.14], [0.72, 0.04], [0.97, 0.22], [0.98, 0.96], [0.02, 0.96]],
          { haloWidth: 4.0, filter: "sepia" }
        );

        B.drawWaterCaustics(ctx, W, H, t, { topY: waterY + 12, intensity: 0.20, color: "#99f6e4" });
        B.drawDepthFog(ctx, W, H, t, { density: 0.14, color: "#cbd5e1" });
      },

      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawSharedForeground(ctx, W, H, resolved, S);
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var waterY = 286 + Math.sin(t * 1.5) * 4;
        var steepleX = 640;

        drawSteepleAndBell48(ctx, S, plates, steepleX, 150, Math.sin(t * 2.2) * 0.08, t, {});
        drawRoosterVane48(ctx, S, steepleX, 132, 0.96, t * 1.1, 0);
        S.drawBrookTrout(ctx, 795 + Math.cos(t * 1.7) * 24, 442, 0.94, t, true);
        drawWaterlineRibbon48(ctx, W, waterY, t);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.5);
          var waterY = 286;

          drawSteepleAndBell48(ctx, S, plates, 640, 150, Math.sin(t * 2.2) * 0.08, t, {});
          drawRoosterVane48(ctx, S, 640, 132, 0.96, t * 1.2, 0);

          // Split Waterline Beam: refracts at y=286 into warm gold above & emerald-cyan below!
          drawSubSpotlightRig(ctx, S, B, 215, 286, 640, 195, t, {
            intensity: 1.3 * u,
            spread: 110,
            color: "#fde047",
            coreColor: "#ffffff"
          });
          B.drawVolumetricBeam(ctx, 215, 286, 640, 445, {
            intensity: 1.25 * u,
            spread: 145,
            color: "#10b981",
            coreColor: "#a7f3d0",
            t: t
          });

          drawWaterlineRibbon48(ctx, W, waterY, t);
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.55);
          var waterY = 286 + Math.sin(t * 4.5) * 16 * u;

          drawCrimsonBallastPlume(ctx, S, B, 985, 435, 640, 415, u, t, { bubbles: 24 });
          var swing = Math.sin(t * 5.2) * 0.52 * u;
          drawSteepleAndBell48(ctx, S, plates, 640, 150, swing, t, {});
          drawRoosterVane48(ctx, S, 640, 132, 0.96, t * 2.4, 0);
          drawConcentricRipples(ctx, 640, 425, 4, 175 * u, t, "#fef08a", 1);
          drawWaterlineRibbon48(ctx, W, waterY, t);
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.45);
          var waterY = 286;

          drawSteepleAndBell48(ctx, S, plates, 640, 150, 0.05, t, {});
          drawRoosterVane48(ctx, S, 640, 132, 0.96, t * 1.1, 0);

          // Mail Snail climbing straight out of water onto dry tin roof & planting red postal flag!
          var sx = lerp(520, 588, u);
          var sy = lerp(395, 218, u);
          B.drawSnailSilverTrail(ctx, 515, 415, sx, sy, u, t);
          S.drawMailSnail(ctx, sx, sy, 1.14, t, { rot: -0.95, hasReply: false });

          if (u > 0.45) {
            drawLimb(ctx, S, 565, 245, 565, 165, 4, 4, "#f8fafc", "brass", null);
            S.drawCutoutPaperEdge(ctx, [[567, 166], [625, 184], [567, 204]], "#dc2626", "#14110d", { paperRim: 2.2, shadow: false });
          }
          drawWaterlineRibbon48(ctx, W, waterY, t);
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.6);
          var waterY = 286;

          drawSteepleAndBell48(ctx, S, plates, 640, 150, 0.06, t, {});
          // Brass scissor-probe reaching up through surface film flicking tin rooster into fast spin!
          drawRoosterVane48(ctx, S, 640, 132, 1.18, t * 14.0 * u, 0);
          drawBrassScissorTongs(ctx, S, B, 925, 555, 668, 128, 0.12, t, { l1: 265, l2: 245, bendDir: 1, seed: 48.4 });
          drawConcentricRipples(ctx, 790, waterY, 3, 85, t, "#ffffff", 0.32);
          drawWaterlineRibbon48(ctx, W, waterY, t);
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            // Warm golden sunshine rays above dry diamond-stamped tin shingles!
            B.drawLanternHalo(ctx, 410, 92, 135, { t: t, color: "#facc15", intensity: 1.1 });
            S.drawCutoutPaperEdge(ctx, [[375, 92], [410, 57], [445, 92], [410, 127]], "#fde047", "#14110d", { paperRim: 3 });

            drawSteepleAndBell48(ctx, S, plates, 640, 150, 0.04, t, {});
            drawRoosterVane48(ctx, S, 640, 132, 0.96, 0.3, 0);
            drawWaterlineRibbon48(ctx, W, 290, t);

            // Turkey gazing upward wistfully holding folded striped camp towel!
            S.drawTurkeyInCorner(ctx, 255, 482, 1.12, t, { dispatch: 0.7 });
            S.drawCutoutPaperEdge(ctx, [[295, 472], [352, 466], [356, 498], [292, 502]], "#ef4444", "#14110d", { paperRim: 2 });
            ctx.fillStyle = "#fbfaf5";
            ctx.fillRect(306, 470, 12, 30);
            ctx.fillRect(330, 468, 12, 30);
            S.drawTurkeyCutawayBadge(ctx, 118, 496, 0.94, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSubSpotlightRig(ctx, S, B, 215, 286, 640, 195, t, { intensity: 1.0, color: "#fde047" });
            B.drawVolumetricBeam(ctx, 215, 286, 640, 445, { intensity: 1.0, color: "#2dd4bf", t: t });

            drawSteepleAndBell48(ctx, S, plates, 640, 150, Math.sin(t * 2) * 0.08, t, {});
            drawRoosterVane48(ctx, S, 640, 132, 0.92, 0.5, 0);

            // Mail Snail on sunlit tin peak with brass spyglass + Brook Trout circling rafters below!
            S.drawMailSnail(ctx, 595, 192, 1.08, t, { hasReply: true, trail: false });
            drawLimb(ctx, S, 622, 184, 675, 172, 6, 9, "#eab308", "brass", null);

            S.drawBrookTrout(ctx, 640 + Math.sin(t * 2.4) * 95, 455 + Math.cos(t * 2.4) * 18, 1.04, t, Math.cos(t * 2.4) > 0);
            drawWaterlineRibbon48(ctx, W, 286, t);
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var lift = 28 + Math.sin(t * 3.0) * 10;
            var topY = 148 - lift;

            S.drawAlienSaucer(ctx, 640, 76, 1.12, t, 640, topY + 140);
            B.drawTractorRings(ctx, 640, 98, 640, topY + 150, t, { spread: 165 });

            // Unfolded silver rocket booster fins + thruster bubble plume!
            S.drawCardboardPuppetPiece(ctx, [[522, topY + 250], [435, topY + 382], [538, topY + 372]], { tone: "#cbd5e1", pin: { x: 528, y: topY + 260, metal: "silver" } });
            S.drawCardboardPuppetPiece(ctx, [[758, topY + 250], [845, topY + 382], [742, topY + 372]], { tone: "#cbd5e1", pin: { x: 752, y: topY + 260, metal: "silver" } });

            drawSteepleAndBell48(ctx, S, plates, 640, topY, 0, t, { chrome: true });
            S.drawDieBadge(ctx, 640, topY + 195, (Math.floor(t * 2) % 3) + 1, t, "#ef4444");

            for (var rp = 0; rp < 10; rp++) {
              var py = topY + 385 + ((t * 150 + rp * 20) % 150);
              drawCutoutBubble(ctx, 640 + Math.sin(t * 9 + rp) * 26, py, 9 + (rp % 3) * 5, "rgba(251, 191, 36, 0.85)");
            }
            drawWaterlineRibbon48(ctx, W, 286, t);
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            // Trough drops so swinging brass bell breaches surface mid-swing with bright air chimes + underwater bubbles!
            var waterY = 395 + Math.sin(t * 3.5) * 18;
            var swing = Math.sin(t * 5.6) * 0.58;

            drawCrimsonBallastPlume(ctx, S, B, 995, 485, 640, 425, 1, t, { bubbles: 26 });
            drawSteepleAndBell48(ctx, S, plates, 640, 142, swing, t, {});
            drawRoosterVane48(ctx, S, 640, 124, 0.96, t * 2, 0);
            drawConcentricRipples(ctx, 640 + Math.sin(swing) * 55, 385, 4, 155, t, "#fde047", 1);
            drawWaterlineRibbon48(ctx, W, waterY, t);

            // Turkey clamping wings over both ears!
            S.drawTurkeyInCorner(ctx, 235, 486, 1.12, t, { dispatch: 1.0 });
            S.drawTurkeyCutawayBadge(ctx, 118, 496, 0.94, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSteepleAndBell48(ctx, S, plates, 640, 148, Math.sin(t * 3.2) * 0.24, t, {});
            drawRoosterVane48(ctx, S, 640, 130, 0.96, t * 1.2, 0);

            // Brook Trout + 4 dapper choir minnows singing round bubble-notes inside belfry arch!
            S.drawBrookTrout(ctx, 545, 475, 0.94, t, false);
            for (var m = 0; m < 4; m++) {
              var mx = 635 + m * 46;
              var my = 478 + Math.sin(t * 4 + m) * 6;
              S.drawBrookTrout(ctx, mx, my, 0.42, t + m, true);
              drawCutoutBubble(ctx, mx - 24, my - 25 - ((t * 55 + m * 22) % 90), 7, "rgba(254, 240, 138, 0.85)");
            }

            // Mail Snail holding open folded waterproof hymnal booklet!
            S.drawMailSnail(ctx, 415, 515, 1.20, t, { hasReply: true });
            S.drawCutoutPaperEdge(ctx, [[452, 485], [488, 476], [488, 512], [452, 518]], "#fbfaf5", "#14110d", { paperRim: 2, shadow: false });
            drawWaterlineRibbon48(ctx, W, 286, t);
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 82, 1.22, t, false);

            // Stained-glass multicolor beams flashing down from saucer dish antennas!
            var sgCols = ["#ef4444", "#facc15", "#10b981", "#8b5cf6"];
            for (var k = 0; k < 4; k++) {
              B.drawVolumetricBeam(ctx, 640, 96, 445 + k * 130, 560, {
                intensity: 0.85,
                spread: 68,
                color: sgCols[k],
                t: t
              });
            }

            drawSteepleAndBell48(ctx, S, plates, 640, 158, Math.sin(t * 5.0) * 0.42, t, {});
            drawConcentricRipples(ctx, 640, 158, 5, 190, t, "#fde047", 0.55);
            drawWaterlineRibbon48(ctx, W, 286, t);
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSteepleAndBell48(ctx, S, plates, 640, 150, 0.05, t, {});
            drawRoosterVane48(ctx, S, 640, 132, 0.96, 0.4, 0);

            // Red postal flag + gleaming brass TVA Heritage Star Plaque on dry tin cone!
            drawLimb(ctx, S, 568, 240, 568, 158, 4, 4, "#f8fafc", "brass", null);
            S.drawCutoutPaperEdge(ctx, [[570, 160], [628, 178], [570, 198]], "#dc2626", "#14110d", { paperRim: 2.2, shadow: false });
            drawEmblemPlaque(ctx, S, 640, 238, 66, 52, 0, "star", { bg: "#eab308", accent: "#78350f" });
            S.drawMailSnail(ctx, 545, 246, 1.08, t, { hasReply: false, trail: false });

            drawWaterlineRibbon48(ctx, W, 286, t);

            // Turkey marking gold star on navigation chart!
            S.drawCutoutPaperEdge(ctx, [[245, 385], [375, 385], [375, 468], [245, 468]], "#fef3c7", "#14110d", { paperRim: 3 });
            drawEmblemPlaque(ctx, S, 310, 426, 36, 36, 0.1, "star", { bg: "#fde047", accent: "#dc2626", rim: 1.5 });
            S.drawTurkeyInCorner(ctx, 210, 488, 1.08, t, { dispatch: 0.85 });
            S.drawTurkeyCutawayBadge(ctx, 115, 496, 0.94, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSteepleAndBell48(ctx, S, plates, 640, 152, 0.06, t, {});
            drawRoosterVane48(ctx, S, 640, 134, 0.92, 0.6, 0);

            // Paper dragonfly couriers above water + shingled mail chute into Brook Trout's pouch below!
            for (var df = 0; df < 2; df++) {
              var dx = 455 + df * 365 + Math.sin(t * 3.8 + df) * 32;
              var dy = 148 + Math.cos(t * 4.6 + df) * 16;
              ctx.fillStyle = "rgba(224, 242, 254, 0.82)";
              ctx.beginPath();
              ctx.ellipse(dx, dy - 8, 28, 8, Math.sin(t * 22) * 0.3, 0, TAU);
              ctx.fill();
              drawLimb(ctx, S, dx - 22, dy, dx + 22, dy, 4, 3, "#0f8f80", null, null);
            }

            // Shingled chute & sliding airmail envelopes crossing waterline!
            drawLimb(ctx, S, 695, 225, 815, 425, 9, 9, "#cbd5e1", "brass", "silver");
            var envU = (t * 0.75) % 1;
            drawEmblemPlaque(ctx, S, lerp(695, 815, envU), lerp(225, 425, envU), 32, 22, 0.9, "check", { rim: 1.8 });

            S.drawMailSnail(ctx, 675, 222, 1.08, t, { hasReply: true, trail: false });
            S.drawBrookTrout(ctx, 855, 448, 1.12, t, true);
            drawWaterlineRibbon48(ctx, W, 286, t);
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 74, 1.16, t, 640, 260);
            B.drawTractorRings(ctx, 640, 98, 640, 280, t, { spread: 195 });

            drawSteepleAndBell48(ctx, S, plates, 640, 156, 0, t, { chrome: true });
            drawLimb(ctx, S, 585, 238, 585, 162, 4, 4, "#f8fafc", "brass", null);
            S.drawCutoutPaperEdge(ctx, [[587, 164], [642, 182], [587, 200]], "#dc2626", "#14110d", { paperRim: 2, shadow: false });
            S.drawMailSnail(ctx, 565, 242, 1.04, t, { hasReply: true, hasAlienStamp: true, trail: false });

            // Glowing holographic lunar customs dome around the spire!
            ctx.save();
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 3.2;
            ctx.setLineDash([10, 6]);
            ctx.beginPath();
            ctx.arc(640, 286, 178, Math.PI, 0);
            ctx.stroke();
            ctx.restore();

            drawWaterlineRibbon48(ctx, W, 286, t);
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSteepleAndBell48(ctx, S, plates, 640, 168, 0.04, t, {});
            // Cousin Tin Rooster smoothly tipping scalloped comb toward porthole!
            drawRoosterVane48(ctx, S, 640, 142, 1.55, 0.15, Math.sin(t * 3.6) * 0.25);
            drawWaterlineRibbon48(ctx, W, 294, t);

            S.drawTurkeyInCorner(ctx, 245, 482, 1.14, t, { dispatch: 0.95 });
            S.drawTurkeyCutawayBadge(ctx, 118, 496, 0.94, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var spin = t * 1.8;
            drawSteepleAndBell48(ctx, S, plates, 640, 152, 0, t, {});
            drawRoosterVane48(ctx, S, 640, 134, 1.25, spin, 0);

            // Linked brass compass arrow inside underwater belfry arch pointing Trout & Snail!
            drawLimb(ctx, S, 640, 140, 640, 425, 4, 4, "#eab308", null, "brass");
            ctx.save();
            ctx.translate(640, 425);
            ctx.rotate(Math.sin(t * 1.4) * 0.35);
            S.drawCutoutPaperEdge(ctx, [[-65, -8], [45, -8], [45, -22], [82, 0], [45, 22], [45, 8], [-65, 8]], "#facc15", "#14110d", { paperRim: 2.5 });
            ctx.restore();

            S.drawBrookTrout(ctx, 845, 432 + Math.sin(t * 2.5) * 8, 1.08, t, false);
            S.drawMailSnail(ctx, 455, 515, 1.18, t, { hasReply: true });
            drawWaterlineRibbon48(ctx, W, 286, t);
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            // Wobbling tickled Alien Saucer dropping golden stardust!
            ctx.save();
            ctx.translate(640, 96);
            ctx.rotate(Math.sin(t * 14) * 0.14);
            S.drawAlienSaucer(ctx, 0, 0, 1.20, t, false);
            ctx.restore();

            drawSteepleAndBell48(ctx, S, plates, 640, 178, 0.08, t, {});
            drawRoosterVane48(ctx, S, 640, 158, 1.32, t * 16.0, 0);
            drawBrassScissorTongs(ctx, S, B, 945, 560, 675, 158, 0.14, t, { l1: 255, l2: 245, bendDir: 1 });

            // Cartoon cyan radio zig-zags tickling saucer belly + kintsugi stardust!
            ctx.strokeStyle = "#22d3ee";
            ctx.lineWidth = 3.2;
            for (var z = -1; z <= 1; z++) {
              ctx.beginPath();
              ctx.moveTo(640 + z * 24, 145);
              ctx.lineTo(625 + z * 34, 125);
              ctx.lineTo(655 + z * 34, 112);
              ctx.lineTo(640 + z * 40, 98);
              ctx.stroke();
            }
            B.drawDeterministicParticles(ctx, "kintsugi", 640, 120, t, { loop: true, count: 24, seed: 48.9 });
            drawWaterlineRibbon48(ctx, W, 296, t);
          }
        }
      }
    });
  }

  /* ==========================================================================
   * PORTHOLE #49 · CORNER (cardboard-parallax · Renzo e Luciana + CivicFootage)
   * Plates: portholes/p49.jpg (640x640) + assets/atlas-stills/atlas-18.webp (740x555)
   * Note: Featured showcase strip porthole — 100% pure geometry (0 text calls!)
   * ========================================================================== */

  function drawStoplight49(ctx, S, B, plates, x, y, sway, mode, t) {
    ctx.save();
    ctx.translate(x, y);
    if (sway) ctx.rotate(sway);

    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      254, 142, 132, 202,
      -82, -6, 164, 242,
      [[0.38, 0.02], [0.62, 0.02], [0.94, 0.22], [0.95, 0.92], [0.52, 0.98], [0.06, 0.92], [0.05, 0.22]],
      { haloWidth: 4.5 }
    );

    var redOn = mode === "red" || mode === "both" || (mode === "disco" && Math.floor(t * 6) % 3 === 0);
    var ambOn = mode === "amber" || (mode === "disco" && Math.floor(t * 6) % 3 === 1);
    var grnOn = mode === "green" || mode === "both" || (mode === "disco" && Math.floor(t * 6) % 3 === 2);

    if (redOn) {
      B.drawLanternHalo(ctx, -12, 86, 62, { t: t, color: "#ef4444", intensity: 1.0 });
      ctx.fillStyle = "rgba(239, 68, 68, 0.32)";
      ctx.beginPath();
      ctx.moveTo(-12, 86);
      ctx.lineTo(-195, 185);
      ctx.lineTo(-195, 22);
      ctx.closePath();
      ctx.fill();
    }
    if (ambOn) {
      B.drawLanternHalo(ctx, -12, 124, 56, { t: t, color: "#facc15", intensity: 0.95 });
    }
    if (grnOn) {
      B.drawLanternHalo(ctx, -12, 162, 66, { t: t, color: "#10b981", intensity: 1.05 });
      ctx.fillStyle = "rgba(16, 185, 129, 0.34)";
      ctx.beginPath();
      ctx.moveTo(-12, 162);
      ctx.lineTo(-205, 285);
      ctx.lineTo(-205, 118);
      ctx.closePath();
      ctx.fill();
    }

    if (mode === "glitter") {
      // Sparkling 8-point lens glints under sub high-beams!
      var lensY = [86, 162];
      for (var li = 0; li < 2; li++) {
        B.drawLanternHalo(ctx, -12, lensY[li], 58, { t: t, color: li === 0 ? "#fca5a5" : "#6ee7b7", intensity: 1.1 });
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.6;
        for (var r = 0; r < 4; r++) {
          var ra = (r / 4) * Math.PI + t * 2.5;
          ctx.beginPath();
          ctx.moveTo(-12 - Math.cos(ra) * 26, lensY[li] - Math.sin(ra) * 26);
          ctx.lineTo(-12 + Math.cos(ra) * 26, lensY[li] + Math.sin(ra) * 26);
          ctx.stroke();
        }
      }
    }

    if (mode === "vip") {
      // Glowing teal VIP postal right-of-way arrow lens!
      B.drawLanternHalo(ctx, -12, 162, 68, { t: t, color: "#2dd4bf", intensity: 1.15 });
      ctx.fillStyle = "#ccfbf1";
      ctx.beginPath();
      ctx.moveTo(-26, 162);
      ctx.lineTo(-4, 146);
      ctx.lineTo(-4, 156);
      ctx.lineTo(12, 156);
      ctx.lineTo(12, 168);
      ctx.lineTo(-4, 168);
      ctx.lineTo(-4, 178);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function drawTroutCop49(ctx, S, plates, x, y, scale, rot, t, opts) {
    var cfg = opts || {};
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.scale(scale || 1, scale || 1);

    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      358, 246, 168, 134,
      -116, -86, 232, 174,
      [[0.16, 0.05], [0.58, 0.04], [0.96, 0.34], [0.95, 0.86], [0.46, 0.96], [0.04, 0.68]],
      { haloWidth: 4.5, pin: { x: -12, y: 24, r: 4.2, metal: "brass" } }
    );

    if (cfg.spinBadge) {
      // Spinning oversize gold officer star badge on vest!
      ctx.save();
      ctx.translate(-10, -2);
      ctx.rotate(t * 11.0);
      drawEmblemPlaque(ctx, S, 0, 0, 38, 38, 0, "star", { bg: "#fde047", accent: "#b45309", rim: 1.8 });
      ctx.restore();
    }

    if (cfg.baton) {
      // Twirling silver parade baton!
      ctx.save();
      ctx.translate(-95, -18);
      ctx.rotate(t * 9.0);
      drawLimb(ctx, S, -42, 0, 42, 0, 4.5, 4.5, "#f8fafc", "silver", "silver");
      ctx.restore();
    }

    ctx.restore();

    if (cfg.whistle !== false) {
      for (var wb = 0; wb < 4; wb++) {
        var wbu = ((t * 1.15 + wb * 0.25) % 1);
        drawCutoutBubble(ctx, x - 118 * (scale || 1) - wbu * 24 + Math.sin(t * 6 + wb) * 5, y - wbu * 84, 4 + wbu * 5);
      }
    }
  }

  function drawYellowCab49(ctx, S, x, y, scale, t) {
    var bounce = Math.sin(t * 14.0) * 2.6;
    ctx.save();
    ctx.translate(x, y + bounce);
    ctx.scale(scale, scale);

    var cabPoly = [
      [-132, 18], [-126, -16], [-72, -22], [-44, -58],
      [52, -58], [84, -20], [134, -12], [136, 22], [-132, 22]
    ];
    S.drawCutoutPaperEdge(ctx, cabPoly, "#facc15", "#14110d", { paperRim: 4.0 });
    S.drawCutoutPaperEdge(ctx, [[-38, -50], [2, -50], [2, -20], [-58, -20]], "#bae6fd", "#14110d", { paperRim: 1.5, shadow: false });
    S.drawCutoutPaperEdge(ctx, [[10, -50], [46, -50], [70, -20], [10, -20]], "#bae6fd", "#14110d", { paperRim: 1.5, shadow: false });
    S.drawCutoutPaperEdge(ctx, [[-16, -72], [18, -72], [22, -58], [-20, -58]], "#fef9c3", "#14110d", { paperRim: 2.0, shadow: false });

    // Pure geometric black-and-white checker stripe
    for (var ck = 0; ck < 10; ck++) {
      ctx.fillStyle = ck % 2 === 0 ? "#14110d" : "#fbfaf5";
      ctx.fillRect(-95 + ck * 19, -8, 19, 9);
      ctx.fillStyle = ck % 2 === 1 ? "#14110d" : "#fbfaf5";
      ctx.fillRect(-95 + ck * 19, 1, 19, 9);
    }

    var wheels = [-80, 82];
    for (var wi = 0; wi < 2; wi++) {
      ctx.save();
      ctx.translate(wheels[wi], 24);
      ctx.rotate(t * 9.5);
      S.drawCardboardPuppetPiece(ctx, [[-22, -9], [-9, -22], [9, -22], [22, -9], [22, 9], [9, 22], [-9, 22], [-22, 9]], { tone: "#3f3f46", shadow: false });
      S.drawSplitPin(ctx, 0, 0, 5.0, { metal: "silver" });
      ctx.restore();
    }
    ctx.restore();
  }

  function drawCrosswalkAndPole49(ctx, S, W, polePlungerIn) {
    // 6 Painted white perspective crosswalk stripes across sunken asphalt street!
    for (var s = 0; s < 6; s++) {
      var sx = 310 + s * 112;
      S.drawCutoutPaperEdge(
        ctx,
        [[sx - 28, 542], [sx + 28, 542], [sx + 40, 592], [sx - 40, 592]],
        "#f8fafc",
        "#1e293b",
        { paperRim: 0, shadow: false }
      );
    }

    // Striped municipal crosswalk pole & brass plunger box at right (around anchor 845,465)
    var px = 948;
    drawLimb(ctx, S, px, 535, px, 295, 9, 8, "#eab308", "brass", "silver");
    S.drawCardboardPuppetPiece(ctx, [[px - 24, 435], [px + 18, 435], [px + 18, 492], [px - 24, 492]], {
      tone: "#52525b",
      pin: { x: px - 4, y: 464, metal: "brass" }
    });
    // Plunger button sticking out left toward (912, 464)
    var push = polePlungerIn ? 12 : 0;
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(px - 38 + push, 456, 16 - push * 0.5, 16);
  }

  function registerPorthole49() {
    var B = getEngine();

    B.definePortalGame(49, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var isCosmic = resolved.selectedTier === "preposterous";
        var pxFar = parallaxX(resolved, 0.22);
        var pxMid = parallaxX(resolved, 0.50);

        S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 49, t, resolved, { pillarbox: true });

        // Distant glowing city signal dome scissored from atlas-18.webp (740x555)
        S.drawScissorCutout(
          ctx,
          plates.atlasImg,
          148, 138, 500, 355,
          365 + pxFar, 178, 545, 342,
          [[0.08, 0.18], [0.50, 0.04], [0.92, 0.18], [0.96, 0.94], [0.04, 0.94]],
          { haloWidth: 3.8, filter: resolved.phase === "root" ? "mono" : "none", alpha: isCosmic ? 0.92 : 0.72 }
        );

        // Left & right 1940s Old Butler drowned Main Street building facades from p49.jpg (clean architectural crops, avoiding cop!)
        S.drawScissorCutout(
          ctx,
          plates.portholeImg,
          114, 188, 152, 278,
          94 + pxMid * 0.7, 124, 268, 428,
          [[0.04, 0.03], [0.88, 0.12], [0.96, 0.52], [0.94, 0.97], [0.03, 0.97]],
          { haloWidth: 4.4, filter: "mono" }
        );
        ctx.save();
        ctx.translate(1182 + pxMid * 0.7, 142);
        ctx.scale(-1, 1);
        S.drawScissorCutout(
          ctx,
          plates.portholeImg,
          118, 204, 144, 262,
          0, 0, 246, 408,
          [[0.04, 0.04], [0.86, 0.14], [0.96, 0.54], [0.94, 0.97], [0.03, 0.97]],
          { haloWidth: 4.4, filter: "mono" }
        );
        ctx.restore();
        // Right foreground drowned curb stone scissored from bottom-right of p49.jpg (below cop)
        S.drawScissorCutout(
          ctx,
          plates.portholeImg,
          388, 392, 116, 84,
          895 + pxMid * 0.85, 446, 185, 96,
          [[0.08, 0.42], [0.58, 0.06], [0.95, 0.24], [0.96, 0.95], [0.04, 0.95]],
          { haloWidth: 3.8, filter: "mono" }
        );

        B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.18, color: "#67e8f9" });
        B.drawDepthFog(ctx, W, H, t, { density: 0.13, color: "#cbd5e1" });

        // Drowned asphalt street floor + overhead catenary cable
        S.drawTornPaperFlat(ctx, 88, 524, W - 176, 112, {
          fill: "#23272a",
          paperColor: "#e4e4e7",
          deckle: 5.5,
          shadow: false
        });
        ctx.strokeStyle = "#111214";
        ctx.lineWidth = 3.6;
        ctx.beginPath();
        ctx.moveTo(105, 84);
        ctx.quadraticCurveTo(600, 145, 1175, 80);
        ctx.stroke();
      },

      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawSharedForeground(ctx, W, H, resolved, S);
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawCrosswalkAndPole49(ctx, S, W, false);
        var mode = Math.sin(t * 2.2) > 0 ? "red" : "amber";
        drawStoplight49(ctx, S, B, plates, 588, 122, Math.sin(t * 1.8) * 0.05, mode, t);
        drawTroutCop49(ctx, S, plates, 815, 336 + Math.sin(t * 2.4) * 7, 1.0, Math.sin(t * 2.0) * 0.04, t, {});
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.55);
          var blink = 0.65 + 0.35 * Math.sin(t * 11.0);

          drawCrosswalkAndPole49(ctx, S, W, false);

          // Twin blue submarine nose lamps blinking polite high-beams across intersection!
          drawSubSpotlightRig(ctx, S, B, 225, 575, 578, 225, t, {
            intensity: 1.35 * u * blink,
            spread: 145,
            color: "#38bdf8",
            coreColor: "#e0f2fe"
          });
          drawSubSpotlightRig(ctx, S, B, 1055, 575, 598, 225, t, {
            intensity: 1.25 * u * blink,
            spread: 145,
            color: "#38bdf8",
            coreColor: "#e0f2fe"
          });

          drawStoplight49(ctx, S, B, plates, 588, 122, Math.sin(t * 2) * 0.04, "glitter", t);
          drawTroutCop49(ctx, S, plates, 815, 336 + Math.sin(t * 3) * 6, 1.0, -0.05, t, {});
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.6);

          drawCrosswalkAndPole49(ctx, S, W, false);

          // Two brassy ballast-horn blasts rattling yellow stoplight & spinning Trout Cop's badge!
          drawCrimsonBallastPlume(ctx, S, B, 1035, 495, 588, 255, u, t, { bubbles: 22 });
          drawConcentricRipples(ctx, 985, 475, 4, 240 * u, t, "#facc15", 1);

          var rattle = Math.sin(t * 28.0) * 0.14 * u;
          drawStoplight49(ctx, S, B, plates, 588, 122, rattle, "both", t);
          drawTroutCop49(ctx, S, plates, 805, 332 + Math.sin(t * 8) * 9, 1.04, 0.08 * u, t, { spinBadge: true });
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.45);

          drawCrosswalkAndPole49(ctx, S, W, false);
          drawStoplight49(ctx, S, B, plates, 588, 122, 0.03, "red", t);
          drawTroutCop49(ctx, S, plates, 805, 345, 1.0, 0.08, t, {});

          // Mail Snail gliding forward holding up laminated Gold Star Postal Priority badge!
          var sx = lerp(315, 575, u);
          B.drawSnailSilverTrail(ctx, 285, 520, sx, 514, u, t);
          S.drawMailSnail(ctx, sx, 510, 1.25, t, { hasReply: false });
          drawEmblemPlaque(ctx, S, sx + 48, 462 + Math.sin(t * 4) * 4, 58, 46, -0.10, "star", { bg: "#fef08a", accent: "#0f8f80" });
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.65);

          // Brass scissor-probe pressing sunken pole plunger with heavy mechanical clunk!
          drawCrosswalkAndPole49(ctx, S, W, u > 0.35);
          drawBrassScissorTongs(ctx, S, B, 745, 595, 912, 464, 0.05, t, { bendDir: 1, seed: 49.4 });
          drawConcentricRipples(ctx, 924, 464, 3, 95 * u, t, "#fde047", 1);

          drawStoplight49(ctx, S, B, plates, 588, 122, u * 0.22, "green", t);
          drawTroutCop49(ctx, S, plates, 795, 326, 0.98, 0, t, {});
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawCrosswalkAndPole49(ctx, S, W, false);

            // Moss tinsel garlands & twinkling red/gold/green bulbs spanning across Main Street!
            var bCols = ["#ef4444", "#fde047", "#10b981", "#38bdf8"];
            for (var st = 0; st < 2; st++) {
              var y0 = 108 + st * 68;
              ctx.strokeStyle = "#166534";
              ctx.lineWidth = 7.5;
              ctx.beginPath();
              ctx.moveTo(155, y0);
              ctx.quadraticCurveTo(640, y0 + 76, 1125, y0);
              ctx.stroke();
              for (var b = 0; b < 13; b++) {
                var bu = (b + 0.5) / 13;
                var bx = lerp(175, 1105, bu);
                var by = y0 + Math.sin(bu * Math.PI) * 38 + 10;
                B.drawLanternHalo(ctx, bx, by, 26, { t: t + b, color: bCols[(b + st) % 4], intensity: 0.85 });
                S.drawCutoutPaperEdge(ctx, [[bx - 6, by - 6], [bx + 6, by - 6], [bx, by + 11]], bCols[(b + st) % 4], "#14110d", { paperRim: 1.5, shadow: false });
              }
            }

            drawStoplight49(ctx, S, B, plates, 588, 124, Math.sin(t * 2) * 0.04, "both", t);
            drawTroutCop49(ctx, S, plates, 845, 345, 0.96, 0, t, {});

            // Pure-Vector Wall Calendar (summer sun header + 7x4 grid + red crayon circle on July 4th — 0 text!)
            var calX = 315;
            var calY = 345;
            S.drawCutoutPaperEdge(ctx, [[calX - 68, calY - 78], [calX + 68, calY - 78], [calX + 68, calY + 78], [calX - 68, calY + 78]], "#fbfaf5", "#14110d", { paperRim: 3.6 });
            ctx.fillStyle = "#f97316";
            ctx.fillRect(calX - 64, calY - 74, 128, 36);
            // Bright summer sun emblem in header
            ctx.fillStyle = "#fef08a";
            ctx.beginPath();
            ctx.arc(calX, calY - 56, 12, 0, TAU);
            ctx.fill();
            // 5x4 calendar day grid + bold red crayon circle!
            ctx.strokeStyle = "#94a3b8";
            ctx.lineWidth = 1.6;
            for (var r = 0; r < 4; r++) {
              for (var c = 0; c < 5; c++) {
                ctx.strokeRect(calX - 55 + c * 22, calY - 28 + r * 23, 20, 20);
              }
            }
            ctx.strokeStyle = "#dc2626";
            ctx.lineWidth = 4.2;
            ctx.beginPath();
            ctx.arc(calX - 55 + 3 * 22 + 10, calY - 28 + 10, 15, 0, TAU);
            ctx.stroke();

            S.drawTurkeyInCorner(ctx, 215, 488, 1.08, t, { dispatch: 0.9 });
            S.drawTurkeyCutawayBadge(ctx, 115, 496, 0.94, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawCrosswalkAndPole49(ctx, S, W, false);
            drawStoplight49(ctx, S, B, plates, 588, 118, 0.03, "green", t);

            // Speeding yellow creek taxicab cruising down Main Street + Mail Snail on roof!
            var cabX = lerp(285, 765, (t * 0.34) % 1);
            drawYellowCab49(ctx, S, cabX, 478, 1.08, t);
            S.drawMailSnail(ctx, cabX + 4, 396, 1.04, t, { hasReply: true, trail: false });

            // Courteous Brook Trout Cop blowing pea-whistle & waving cab right through!
            drawTroutCop49(ctx, S, plates, 885, 295 + Math.sin(t * 3) * 6, 1.02, -0.08, t, {});
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawCrosswalkAndPole49(ctx, S, W, false);
            drawStoplight49(ctx, S, B, plates, 545, 132, 0, "green", t);

            // Towering neon-cyan upward traffic lane chevrons projected above stoplight!
            for (var ch = 0; ch < 4; ch++) {
              var cy = 115 - ((t * 55 + ch * 26) % 104);
              ctx.strokeStyle = "#22d3ee";
              ctx.lineWidth = 4.2;
              ctx.beginPath();
              ctx.moveTo(515, cy + 16);
              ctx.lineTo(545, cy);
              ctx.lineTo(575, cy + 16);
              ctx.stroke();
            }

            // Alien Saucer patiently using blinking amber turn-signal blinker to merge behind Trout Cop!
            S.drawAlienSaucer(ctx, 795, 165, 1.18, t, 795, 380);
            B.drawTractorRings(ctx, 795, 188, 795, 395, t, { spread: 115 });
            if (Math.floor(t * 5) % 2 === 0) {
              B.drawLanternHalo(ctx, 722, 168, 44, { t: t, color: "#f59e0b", intensity: 1.3 });
              ctx.fillStyle = "#fde047";
              ctx.beginPath();
              ctx.moveTo(702, 168);
              ctx.lineTo(722, 154);
              ctx.lineTo(722, 182);
              ctx.closePath();
              ctx.fill();
            }

            drawTroutCop49(ctx, S, plates, 685, 355, 0.98, 0, t, {});
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawCrosswalkAndPole49(ctx, S, W, false);
            drawStoplight49(ctx, S, B, plates, 588, 122, 0.04, "amber", t);
            drawTroutCop49(ctx, S, plates, 795, 336, 1.04, 0.06, t, {});

            // Soggy pink parking-ticket pad melting mid-water into harmless confetti!
            var padX = 615;
            var padY = 355;
            S.drawCutoutPaperEdge(ctx, [[padX - 36, padY - 46], [padX + 36, padY - 46], [padX + 32, padY + 12], [padX - 32, padY + 18]], "#fda4af", "#14110d", { paperRim: 2.5 });
            B.drawDeterministicParticles(ctx, "confetti", padX, padY + 24, t, { loop: true, count: 26, seed: 49.2 });

            // Turkey sheepishly shrinking behind spoked brass submarine steering wheel!
            S.drawTurkeyInCorner(ctx, 245, 502, 0.96, t, { dispatch: 0.3 });
            ctx.save();
            ctx.translate(295, 512);
            ctx.rotate(Math.sin(t * 2.5) * 0.25);
            ctx.strokeStyle = "#d97706";
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.arc(0, 0, 44, 0, TAU);
            for (var sp = 0; sp < 6; sp++) {
              var sa = (sp / 6) * TAU;
              ctx.moveTo(0, 0);
              ctx.lineTo(Math.cos(sa) * 54, Math.sin(sa) * 54);
            }
            ctx.stroke();
            ctx.restore();
            S.drawTurkeyCutawayBadge(ctx, 115, 496, 0.94, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawCrosswalkAndPole49(ctx, S, W, false);
            drawStoplight49(ctx, S, B, plates, 588, 118, Math.sin(t * 3) * 0.04, "green", t);

            // Brook Trout Cop twirling silver baton as minnow school + Mail Snail march across crosswalk!
            drawTroutCop49(ctx, S, plates, 815, 285 + Math.sin(t * 4) * 6, 1.04, -0.05, t, { baton: true });

            for (var m = 0; m < 7; m++) {
              var mu = ((t * 0.22 + m / 7) % 1);
              var mx = lerp(255, 920, mu);
              var my = 548 + (m % 2) * 22 - Math.abs(Math.sin(t * 8 + m)) * 10;
              S.drawBrookTrout(ctx, mx, my, 0.42, t + m, false);
            }
            var snailX = lerp(310, 780, (t * 0.18 + 0.35) % 1);
            B.drawSnailSilverTrail(ctx, 250, 566, snailX, 566, 1, t);
            S.drawMailSnail(ctx, snailX, 562, 1.24, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawCrosswalkAndPole49(ctx, S, W, false);
            drawStoplight49(ctx, S, B, plates, 515, 128, 0, "red", t);

            // Fearless Brook Trout Cop blowing mighty bubble-whistle & pointing fin at pulled-over saucer!
            drawTroutCop49(ctx, S, plates, 645, 325, 1.08, -0.18, t, {});
            drawConcentricRipples(ctx, 515, 305, 3, 75, t, "#bae6fd", 1);

            // Speeding Flying Saucer guiltily parked low beside right curb with dimmed glow!
            S.drawAlienSaucer(ctx, 885, 425 + Math.sin(t * 2) * 3, 1.18, t, false);
            B.drawLanternHalo(ctx, 645, 255, 58, { t: t, color: Math.floor(t * 8) % 2 === 0 ? "#ef4444" : "#3b82f6", intensity: 0.95 });
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawCrosswalkAndPole49(ctx, S, W, false);
            drawStoplight49(ctx, S, B, plates, 588, 122, 0, "vip", t);
            drawTroutCop49(ctx, S, plates, 835, 325, 0.98, 0, t, {});

            // Mail Snail gliding with VIP right-of-way + Turkey wearing cool dark aviator sunglasses!
            B.drawSnailSilverTrail(ctx, 320, 548, 665, 548, 1, t);
            S.drawMailSnail(ctx, 665, 544, 1.26, t, { hasReply: false });

            S.drawTurkeyInCorner(ctx, 225, 484, 1.14, t, { dispatch: 0.85 });
            ctx.fillStyle = "#09090b";
            ctx.fillRect(222, 464, 24, 11);
            ctx.strokeStyle = "#facc15";
            ctx.lineWidth = 2;
            ctx.strokeRect(222, 464, 24, 11);
            S.drawTurkeyCutawayBadge(ctx, 115, 496, 0.94, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawCrosswalkAndPole49(ctx, S, W, false);
            drawStoplight49(ctx, S, B, plates, 588, 122, 0, "red", t);
            drawTroutCop49(ctx, S, plates, 835, 325, 1.0, 0, t, {});

            // Mail Snail holding crimson octagon crossing-guard paddle (pure white bar icon — 0 text!)
            S.drawMailSnail(ctx, 435, 515, 1.24, t, { hasReply: true });
            drawLimb(ctx, S, 455, 505, 455, 425, 4, 4, "#f8fafc", "brass", null);
            var oct = [];
            for (var k = 0; k < 8; k++) {
              var oa = (k / 8) * TAU + Math.PI / 8;
              oct.push([455 + Math.cos(oa) * 28, 405 + Math.sin(oa) * 28]);
            }
            S.drawCutoutPaperEdge(ctx, oct, "#dc2626", "#fbfaf5", { paperRim: 2.4, shadow: false });
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(441, 400, 28, 10);

            // Hopping line of 6 cute wiggly cardboard tadpoles crossing white stripes!
            for (var tp = 0; tp < 6; tp++) {
              var tx = 495 + tp * 68;
              var ty = 556 - Math.abs(Math.sin(t * 7 + tp)) * 18;
              S.drawCardboardPuppetPiece(ctx, [[tx - 14, ty], [tx, ty - 10], [tx + 14, ty], [tx, ty + 10]], { tone: "#3f6212", shadow: false });
              ctx.strokeStyle = "#3f6212";
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(tx - 14, ty);
              ctx.lineTo(tx - 28, ty + Math.sin(t * 15 + tp) * 7);
              ctx.stroke();
            }
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawCrosswalkAndPole49(ctx, S, W, false);
            drawStoplight49(ctx, S, B, plates, 435, 138, 0.02, "green", t);
            drawTroutCop49(ctx, S, plates, 885, 345, 0.96, 0, t, {});

            // Polite tractor beam from Alien Saucer + Mail Snail floating up Stamped Saucer Learner's Permit!
            var saucerX = 655;
            var saucerY = 98;
            B.drawTractorRings(ctx, saucerX, saucerY + 22, 655, 515, t, { spread: 135 });
            S.drawAlienSaucer(ctx, saucerX, saucerY, 1.28, t, 655, 515);

            // All three alien eyes flashing happy bright emerald green!
            for (var ei = -1; ei <= 1; ei++) {
              B.drawLanternHalo(ctx, saucerX + ei * 11, saucerY - 18, 22, { t: t, color: "#10b981", intensity: 1.2 });
              ctx.fillStyle = "#34d399";
              ctx.beginPath();
              ctx.arc(saucerX + ei * 11, saucerY - 18, 4.5, 0, TAU);
              ctx.fill();
            }

            // Glowing approved hover license card floating upward into cockpit!
            var cardY = lerp(455, 205, 0.35 + ((t * 0.32) % 0.55));
            B.drawLanternHalo(ctx, 655, cardY, 76, { t: t, color: "#34d399", intensity: 0.95 });
            drawEmblemPlaque(ctx, S, 655, cardY, 96, 64, Math.sin(t * 2.5) * 0.08, "saucer_ok", {
              bg: "#ecfdf5",
              border: "#059669",
              rim: 3.5
            });

            B.drawSnailSilverTrail(ctx, 480, 542, 635, 536, 1, t);
            S.drawMailSnail(ctx, 635, 532, 1.24, t, { hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawCrosswalkAndPole49(ctx, S, W, true);
            drawStoplight49(ctx, S, B, plates, 588, 122, 0, "green", t);
            drawBrassScissorTongs(ctx, S, B, 1085, 585, 924, 464, 0.06, t, { bendDir: -1 });

            // Lower WALK signal box projecting glowing white Strutting Turkey Silhouette!
            var wx = 755;
            var wy = 355;
            S.drawCardboardPuppetPiece(ctx, [[wx - 68, wy - 64], [wx + 68, wy - 64], [wx + 68, wy + 64], [wx - 68, wy + 64]], { tone: "#18181b" });
            B.drawLanternHalo(ctx, wx, wy, 92, { t: t, color: "#10b981", intensity: 1.1 });
            S.drawCutoutPaperEdge(
              ctx,
              [[wx - 34, wy + 28], [wx - 38, wy - 18], [wx - 8, wy - 28], [wx + 18, wy - 8], [wx + 26, wy - 32], [wx + 40, wy - 26], [wx + 28, wy + 28]],
              "#ffffff",
              "#10b981",
              { paperRim: 0, shadow: false }
            );

            S.drawTurkeyInCorner(ctx, 235, 480, 1.16, t, { dispatch: 1.0 });
            S.drawTurkeyCutawayBadge(ctx, 115, 496, 0.95, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawCrosswalkAndPole49(ctx, S, W, true);
            drawStoplight49(ctx, S, B, plates, 588, 118, Math.sin(t * 7) * 0.12, "disco", t);

            // Disco floor beams + Brook Trout Cop breakdancing on tail-fins + Mail Snail mirrorball!
            var dCols = ["#ef4444", "#fde047", "#10b981"];
            for (var d = 0; d < 3; d++) {
              B.drawVolumetricBeam(ctx, 588, 225, 385 + d * 210 + Math.sin(t * 5 + d) * 55, 565, {
                intensity: 0.85,
                spread: 82,
                color: dCols[d],
                t: t
              });
            }

            drawTroutCop49(ctx, S, plates, 775, 415, 1.02, Math.PI * 0.48 + Math.sin(t * 9) * 0.35, t, { whistle: false });

            // Faceted silver mirrorball shell on spinning Mail Snail!
            var sx = 465;
            var sy = 515;
            S.drawMailSnail(ctx, sx, sy, 1.24, t, { hasReply: true });
            B.drawLanternHalo(ctx, sx - 6, sy - 12, 58, { t: t, color: "#e2e8f0", intensity: 1.0 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawCrosswalkAndPole49(ctx, S, W, true);
            S.drawAlienSaucer(ctx, 640, 88, 1.22, t, 640, 560);
            B.drawTractorRings(ctx, 640, 114, 640, 565, t, { spread: 265 });

            // Golden transporter curtain over crosswalk floating 3 red crawdads curb-to-curb!
            B.drawDeterministicParticles(ctx, "kintsugi", 640, 485, t, { loop: true, count: 24, seed: 49.9 });
            for (var cr = 0; cr < 3; cr++) {
              var cu = ((t * 0.28 + cr / 3) % 1);
              var cx = lerp(335, 885, cu);
              var cy = 505 + Math.sin(t * 4 + cr) * 12;
              B.drawLanternHalo(ctx, cx, cy, 42, { t: t, color: "#fde047", intensity: 0.75 });
              S.drawCutoutPaperEdge(ctx, [[cx - 22, cy], [cx + 12, cy - 10], [cx + 28, cy - 16], [cx + 22, cy], [cx + 28, cy + 16], [cx + 12, cy + 10]], "#dc2626", "#14110d", { paperRim: 2, shadow: false });
            }
          }
        }
      }
    });
  }

  /* ==========================================================================
   * PORTHOLE #50 · RIFFLE (daumier-litho · Ouhispo + LOC-Archive)
   * Plates: portholes/p50.jpg (640x640) + assets/atlas-stills/atlas-31.webp (740x416)
   * Pure-Vector Monolith Sign & Scroll Emblems (0 canvas text calls!)
   * ========================================================================== */

  function drawLithoSnailDarter50(ctx, S, x, y, scale, t, opts) {
    var cfg = opts || {};
    var wag = Math.sin(t * (cfg.resolute ? 9.5 : 6.0)) * 0.22;
    ctx.save();
    ctx.translate(x, y);
    if (cfg.rot) ctx.rotate(cfg.rot);
    ctx.scale(scale || 1, scale || 1);

    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.ellipse(2, 0, 68, 26, 0, 0, TAU);
    ctx.fill();

    // Articulated caudal tail fin
    ctx.save();
    ctx.translate(44, 0);
    ctx.rotate(wag);
    S.drawCardboardPuppetPiece(ctx, [[-4, -6], [24, -18], [20, 0], [24, 18], [-4, 6]], { tone: "#d8d4ca", shadow: false });
    ctx.restore();

    S.drawCutoutPaperEdge(ctx, [[-18, -14], [-4, -28], [10, -14]], "#e8e4da", "#0b0c0e", { paperRim: 1.5, shadow: false });
    S.drawCutoutPaperEdge(ctx, [[12, -13], [24, -25], [34, -12]], "#e8e4da", "#0b0c0e", { paperRim: 1.5, shadow: false });

    // Cross-hatched lithograph body + 4 bold dark Snail Darter saddle stripes
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
    S.drawCardboardPuppetPiece(ctx, [[-4, -4], [15, 6], [10, 16], [-6, 8]], { tone: "#dcd8ce", shadow: false, pin: { x: 0, y: 0, r: 2.8, metal: "brass" } });
    ctx.restore();

    if (cfg.puffedCheeks) {
      ctx.fillStyle = "#fca5a5";
      ctx.beginPath();
      ctx.arc(-32, 6, 8, 0, TAU);
      ctx.fill();
    }

    // Eye + grumpy or happy brow
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

    if (!cfg.happy) {
      ctx.beginPath();
      ctx.moveTo(-42, -10);
      ctx.lineTo(-30, -7);
      ctx.stroke();
    }

    if (cfg.glasses) {
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(-39, -3, 7.5, 0, TAU);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawDamSign50(ctx, S, plates, x, y, rot, scaleY, mode) {
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.scale(1, scaleY || 1);

    // Wooden signpost below diamond
    if (mode !== "toppled") {
      drawLimb(ctx, S, 0, 110, 0, 205, 11, 11, "#78350f", "brass", null);
    }

    var diaR = 148;
    var fillCol = mode === "detour" ? "#2dd4bf" : "#e09b36";
    S.drawCutoutPaperEdge(ctx, [[0, -diaR], [diaR, 0], [0, diaR], [-diaR, 0]], fillCol, "#0b0c0e", { paperRim: 5.0 });

    if (mode !== "detour") {
      // Scissored upper rust patina triangle from p50.jpg (sx=235,sy=148,sw=170,sh=96 — 0 letters!)
      S.drawScissorCutout(
        ctx,
        plates.portholeImg,
        235, 148, 170, 96,
        -82, -116, 164, 88,
        [[0.50, 0.02], [0.98, 0.92], [0.02, 0.92]],
        { haloWidth: 0, shadow: false, alpha: 0.78 }
      );
    }

    ctx.strokeStyle = "#0b0c0e";
    ctx.lineWidth = 5.0;
    ctx.beginPath();
    ctx.moveTo(0, -diaR + 14);
    ctx.lineTo(diaR - 14, 0);
    ctx.lineTo(0, diaR - 14);
    ctx.lineTo(-diaR + 14, 0);
    ctx.closePath();
    ctx.stroke();

    if (mode === "detour") {
      // Cheerful curved creek Detour arrow + wave smile (zero text!)
      ctx.fillStyle = "#0b0c0e";
      ctx.beginPath();
      ctx.moveTo(-55, 20);
      ctx.quadraticCurveTo(-55, -45, 25, -45);
      ctx.lineTo(25, -68);
      ctx.lineTo(72, -32);
      ctx.lineTo(25, 4);
      ctx.lineTo(25, -20);
      ctx.quadraticCurveTo(-25, -20, -25, 20);
      ctx.closePath();
      ctx.fill();
    } else {
      // Pure-vector dam-wall crenellation silhouette across center of sign
      ctx.fillStyle = "#14110d";
      ctx.fillRect(-84, -22, 168, 16);
      for (var pil = -72; pil <= 60; pil += 33) {
        ctx.fillRect(pil, -42, 18, 52);
      }
    }

    if (mode === "cancelled") {
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(0, -14, 78, 0, TAU);
      ctx.moveTo(-55, -69);
      ctx.lineTo(55, 41);
      ctx.stroke();
    }

    S.drawEngravingCrosshatch(ctx, 180, 100, 0.15, 7, { x: -90, y: -50 });
    S.drawSplitPin(ctx, 0, -diaR + 26, 4.5, { metal: "brass" });
    ctx.restore();
  }

  function registerPorthole50() {
    var B = getEngine();

    B.definePortalGame(50, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var pxFar = parallaxX(resolved, 0.20);
        var pxMid = parallaxX(resolved, 0.48);

        S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 50, t, resolved, {
          bandTop: 112,
          bandBot: 576
        });

        // Wide mountain & olive-tree scale horizon from atlas-31.webp (740x416) along upper ink band
        S.drawScissorCutout(
          ctx,
          plates.atlasImg,
          44, 58, 650, 182,
          92 + pxFar, 122, 1096, 148,
          [[0.02, 0.16], [0.24, 0.04], [0.52, 0.12], [0.78, 0.05], [0.98, 0.18], [0.99, 0.92], [0.01, 0.92]],
          { haloWidth: 3.8, filter: "litho", alpha: 0.86 }
        );

        // Flanking giant curious creek trout heads scissored from top-left & top-right of p50.jpg
        S.drawScissorCutout(
          ctx,
          plates.portholeImg,
          118, 168, 138, 112,
          84 + pxMid * 0.7, 228, 220, 152,
          [[0.04, 0.12], [0.76, 0.06], [0.96, 0.48], [0.84, 0.94], [0.05, 0.88]],
          { haloWidth: 4.4, filter: "litho", rot: Math.sin(t * 1.8) * 0.04 }
        );
        S.drawScissorCutout(
          ctx,
          plates.portholeImg,
          386, 164, 138, 112,
          974 + pxMid * 0.7, 226, 220, 152,
          [[0.24, 0.06], [0.96, 0.12], [0.95, 0.88], [0.16, 0.94], [0.04, 0.48]],
          { haloWidth: 4.4, filter: "litho", rot: -Math.sin(t * 1.9) * 0.04 }
        );

        B.drawWaterCaustics(ctx, W, H, t, { topY: 120, intensity: 0.14, color: "#f8fafc" });
        B.drawDepthFog(ctx, W, H, t, { density: 0.10, color: "#e2e8f0" });

        // Riverbed riffle pebble & reed cutouts scissored from bottom of p50.jpg
        S.drawScissorCutout(
          ctx,
          plates.portholeImg,
          182, 434, 276, 94,
          275 + pxMid * 0.5, 474, 730, 96,
          [[0.03, 0.26], [0.32, 0.08], [0.68, 0.08], [0.97, 0.24], [0.98, 0.95], [0.02, 0.95]],
          { haloWidth: 4.0, filter: "litho" }
        );
      },

      drawForeground: function (ctx, W, H, resolved, plates, S) {
        drawSharedForeground(ctx, W, H, resolved, S);
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawDamSign50(ctx, S, plates, 640, 332, 0, 1, "normal");
        drawLithoSnailDarter50(ctx, S, 622 + Math.sin(t * 3.0) * 7, 368 + Math.cos(t * 2.5) * 4, 1.08, t, { resolute: true });
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.55);

          drawDamSign50(ctx, S, plates, 680, 332, 0, 1, "normal");

          // Giant 10-foot monster-fish shadow projected across rocks & sign!
          ctx.save();
          ctx.translate(695, 325);
          ctx.scale(2.85 * u, 2.65 * u);
          ctx.fillStyle = "rgba(11, 12, 14, 0.78)";
          ctx.beginPath();
          ctx.ellipse(0, 0, 66, 26, 0, 0, TAU);
          ctx.moveTo(52, 0);
          ctx.lineTo(84, -28);
          ctx.lineTo(84, 28);
          ctx.fill();
          ctx.restore();

          // Magnifying glass lens sliding in front of spotlight!
          drawSubSpotlightRig(ctx, S, B, 215, 465, 520, 375, t, {
            intensity: 1.35 * u,
            spread: 165,
            color: "#fde047"
          });
          ctx.strokeStyle = "#d97706";
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.arc(435, 395, 58, 0, TAU);
          ctx.stroke();

          drawLithoSnailDarter50(ctx, S, 515, 375, 1.02, t, { resolute: true });
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.6);

          drawCrimsonBallastPlume(ctx, S, B, 995, 465, 485, 465, u, t, { bubbles: 22 });
          drawDamSign50(ctx, S, plates, 640, 332, Math.sin(t * 7) * 0.06 * u, 1, "normal");

          // Loose riffle gravel tumbling past while tiny fish locks fins stubbornly in place!
          for (var g = 0; g < 12; g++) {
            var gu = ((t * 0.95 + g / 12) % 1);
            var gx = lerp(940, 280, gu);
            var gy = 495 - Math.abs(Math.sin(gu * Math.PI * 4)) * 34 * u;
            S.drawCardboardPuppetPiece(ctx, [[gx - 11, gy - 8], [gx + 11, gy - 8], [gx + 9, gy + 9], [gx - 9, gy + 9]], { tone: "#d6d3d1", shadow: false });
          }

          drawLithoSnailDarter50(ctx, S, 622, 382, 1.12, t, { resolute: true });
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.45);

          drawDamSign50(ctx, S, plates, 685, 332, 0, 1, "normal");
          drawLithoSnailDarter50(ctx, S, 645, 375, 1.08, t, { resolute: true });

          // Mail Snail sliding onto flat river stone & unrolling wax-sealed creek passage scroll!
          var sx = lerp(295, 435, u);
          B.drawSnailSilverTrail(ctx, 275, 498, sx, 492, u, t);
          S.drawMailSnail(ctx, sx, 488, 1.22, t, { hasReply: false });
          drawEmblemPlaque(ctx, S, sx + 78, 452, 74 * u + 14, 52, -0.06, "no_dozer", { bg: "#fef3c7" });
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemRamp(resolved, 1.65);

          // Brass caliper tip tapping tin DAM sign so it tilts crookedly while tiny fish puffs cheeks!
          drawDamSign50(ctx, S, plates, 640, 332, -0.34 * u + Math.sin(t * 8) * 0.04 * u, 1, "normal");
          drawBrassScissorTongs(ctx, S, B, 965, 565, 765, 315, 0.08, t, { bendDir: 1, seed: 50.4 });
          drawLithoSnailDarter50(ctx, S, 595, 385, 1.14, t, { resolute: true, puffedCheeks: true });
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var u = outRamp(resolved, 1.6);

            drawDamSign50(ctx, S, plates, 695, 332, 0, 1, "normal");

            // Monster shadow shrinking back as lens zooms out to adorable thumb-sized Snail Darter flexing!
            var shadowScale = lerp(2.6, 0.9, u);
            ctx.save();
            ctx.translate(695, 345);
            ctx.scale(shadowScale, shadowScale);
            ctx.fillStyle = "rgba(11, 12, 14, " + (0.55 * (1 - u * 0.7)).toFixed(3) + ")";
            ctx.beginPath();
            ctx.ellipse(0, 0, 58, 22, 0, 0, TAU);
            ctx.fill();
            ctx.restore();

            B.drawLanternHalo(ctx, 565, 395, 86, { t: t, color: "#fde047", intensity: 0.95 });
            drawLithoSnailDarter50(ctx, S, 565, 395, 0.88, t, { resolute: false, happy: true });

            // Turkey tipping a respectful cloth cap!
            S.drawTurkeyInCorner(ctx, 245, 478, 1.12, t, { dispatch: 0.9 });
            S.drawCutoutPaperEdge(ctx, [[225, 438], [268, 432], [282, 444], [222, 448]], "#1d4ed8", "#14110d", { paperRim: 1.8, shadow: false });
            S.drawTurkeyCutawayBadge(ctx, 115, 496, 0.94, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawDamSign50(ctx, S, plates, 640, 325, 0, 1, "cancelled");
            drawSubSpotlightRig(ctx, S, B, 640, 125, 640, 415, t, {
              intensity: 1.25,
              spread: 135,
              color: "#facc15"
            });

            // Proud 3-inch guardian taking a stage bow as Trout applauds & Mail Snail snaps flash photo!
            drawLithoSnailDarter50(ctx, S, 640, 415, 1.16, t, { happy: true, rot: Math.sin(t * 3.5) * 0.22 });
            S.drawBrookTrout(ctx, 895, 425 + Math.sin(t * 5) * 8, 1.06, t, true);

            // Mail Snail with bellows camera + bright camera flash halo!
            S.drawMailSnail(ctx, 375, 492, 1.20, t, { hasReply: true });
            S.drawCardboardPuppetPiece(ctx, [[415, 456], [448, 456], [448, 482], [415, 482]], { tone: "#18181b" });
            if (Math.sin(t * 6.0) > 0.5) {
              B.drawLanternHalo(ctx, 454, 468, 95, { t: t, color: "#ffffff", intensity: 1.4 });
            }
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 96, 1.18, t, 620, 305);
            drawDamSign50(ctx, S, plates, 675, 338, 0, 1, "normal");
            drawLithoSnailDarter50(ctx, S, 615, 375, 1.18, t, { resolute: true });

            // Shimmering 3-ring hexagonal planetary shield springing from Snail Darter's nose!
            for (var r = 0; r < 3; r++) {
              var sr = 86 + r * 42 + Math.sin(t * 5 + r) * 5;
              ctx.strokeStyle = r === 0 ? "#fbfaf5" : (r === 1 ? "#2dd4bf" : "#f43f5e");
              ctx.lineWidth = 3.8 - r * 0.8;
              ctx.beginPath();
              for (var h = 0; h <= 6; h++) {
                var ha = (h / 6) * TAU + t * 0.5 * (r % 2 === 0 ? 1 : -1);
                var hx = 615 + Math.cos(ha) * sr * 1.15;
                var hy = 375 + Math.sin(ha) * sr * 0.85;
                if (h === 0) ctx.moveTo(hx, hy);
                else ctx.lineTo(hx, hy);
              }
              ctx.stroke();
            }

            // Saucer beam bouncing off hexagonal shield into 4 harmless rainbow prism rays!
            var rCols = ["#ef4444", "#eab308", "#10b981", "#8b5cf6"];
            for (var b = 0; b < 4; b++) {
              B.drawVolumetricBeam(ctx, 615, 295, 285 + b * 240, 145, {
                intensity: 0.85,
                spread: 48,
                color: rCols[b],
                t: t
              });
            }
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawCrimsonBallastPlume(ctx, S, B, 1020, 445, 420, 445, 1, t, { bubbles: 26 });
            // Sign wobbling in heavy current while 3-inch Snail Darter grips flat boulder like Velcro!
            drawDamSign50(ctx, S, plates, 695, 332, 0.24 + Math.sin(t * 9) * 0.06, 1, "normal");

            S.drawCardboardPuppetPiece(ctx, [[505, 438], [635, 438], [652, 488], [488, 488]], { tone: "#a8a29e", ribs: 2 });
            drawLithoSnailDarter50(ctx, S, 570, 418, 1.14, t, { resolute: true });

            S.drawTurkeyInCorner(ctx, 235, 478, 1.12, t, { dispatch: 0.95 });
            S.drawTurkeyCutawayBadge(ctx, 115, 496, 0.94, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            // Sparkling clean riffle gravel bed + joyful creek dance!
            B.drawDeterministicParticles(ctx, "kintsugi", 640, 495, t, { loop: true, count: 24, seed: 50.5 });

            var danceX = 620 + Math.sin(t * 2.8) * 55;
            var danceY = 365 + Math.cos(t * 5.6) * 18;
            drawLithoSnailDarter50(ctx, S, danceX, danceY, 1.16, t, { happy: true });
            S.drawBrookTrout(ctx, 845 + Math.cos(t * 2.4) * 28, 385, 1.08, t, true, { tilt: -0.08 });
            B.drawSnailSilverTrail(ctx, 295, 502, 455, 496, 1, t);
            S.drawMailSnail(ctx, 455, 492, 1.22, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            // One brisk prism tail-flick redirects wake into vertical geyser spinning saucer like a hubcap!
            drawLithoSnailDarter50(ctx, S, 555, 435, 1.22, t * 2.2, { happy: true });
            B.drawVolumetricBeam(ctx, 635, 435, 640, 115, {
              intensity: 1.35,
              spread: 95,
              color: "#22d3ee",
              coreColor: "#ffffff",
              t: t
            });
            B.drawDeterministicParticles(ctx, "bubbles", 640, 295, t, { loop: true, count: 26, color: "#67e8f9", seed: 50.7 });

            ctx.save();
            ctx.translate(640, 128);
            ctx.rotate(t * 8.5);
            S.drawAlienSaucer(ctx, 0, 0, 1.18, t, false);
            ctx.restore();
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawDamSign50(ctx, S, plates, 745, 332, 0, 1, "normal");

            // Snail Darter wearing tiny reading glasses inspecting scroll (no-dozer sub emblem) & waving aside!
            S.drawMailSnail(ctx, 395, 488, 1.22, t, { hasReply: false });
            drawEmblemPlaque(ctx, S, 495, 435, 96, 68, -0.05, "no_dozer", { bg: "#fef3c7" });
            drawLithoSnailDarter50(ctx, S, 645, 415 + Math.sin(t * 3) * 6, 1.12, t, { happy: true, glasses: true });

            S.drawTurkeyInCorner(ctx, 225, 478, 1.10, t, { dispatch: 0.85 });
            S.drawTurkeyCutawayBadge(ctx, 115, 496, 0.94, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawDamSign50(ctx, S, plates, 640, 332, 0, 1, "normal");

            // Waterproof Conservation Charter hung right over old DAM sign with 3 neighbor ink-prints!
            S.drawCutoutPaperEdge(ctx, [[515, 225], [765, 225], [765, 425], [515, 425]], "#fefce8", "#0b0c0e", { paperRim: 4.0 });
            // Pine tree + river wave emblem + 3 distinct colorful stamp seals (0 text!)
            ctx.fillStyle = "#15803d";
            ctx.beginPath();
            ctx.moveTo(640, 248);
            ctx.lineTo(685, 325);
            ctx.lineTo(595, 325);
            ctx.closePath();
            ctx.fill();
            var seals = [[565, 375, "#d42a1e"], [640, 375, "#0f8f80"], [715, 375, "#eab308"]];
            for (var s = 0; s < 3; s++) {
              ctx.fillStyle = seals[s][2];
              ctx.beginPath();
              ctx.arc(seals[s][0], seals[s][1], 18, 0, TAU);
              ctx.fill();
            }

            drawLithoSnailDarter50(ctx, S, 640, 465, 1.08, t, { happy: true });
            S.drawBrookTrout(ctx, 885, 415, 1.04, t, true);
            S.drawMailSnail(ctx, 415, 488, 1.20, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 102, 1.24, t, 640, 455);
            B.drawTractorRings(ctx, 640, 128, 640, 465, t, { spread: 165 });

            // Glowing PROTECTED STAR RIFFLE emblem projected overhead!
            B.drawLanternHalo(ctx, 640, 245, 115, { t: t, color: "#34d399", intensity: 1.05 });
            drawEmblemPlaque(ctx, S, 640, 245, 108, 108, t * 0.4, "star", {
              bg: "rgba(16, 185, 129, 0.25)",
              border: "#34d399",
              accent: "#fde047",
              rim: 0
            });

            // Flat river treaty scroll + laser quill beam signing beside Snail Darter!
            S.drawCutoutPaperEdge(ctx, [[525, 435], [755, 435], [770, 505], [510, 505]], "#fef3c7", "#0b0c0e", { paperRim: 3.5 });
            var qx = 640 + Math.sin(t * 6.5) * 48;
            ctx.strokeStyle = "#f43f5e";
            ctx.lineWidth = 4.0;
            ctx.beginPath();
            ctx.moveTo(640, 122);
            ctx.lineTo(qx, 470);
            ctx.stroke();
            B.drawDeterministicParticles(ctx, "brass_sparks", qx, 470, t, { loop: true, count: 14, seed: 50.9 });

            drawLithoSnailDarter50(ctx, S, 445, 445, 1.12, t, { happy: true });
            S.drawMailSnail(ctx, 835, 488, 1.18, t, { hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            // Tin DAM sign flopped flat face-down on gravel + pint-sized champion Snail Darter perched on top!
            drawDamSign50(ctx, S, plates, 650, 478, 0, 0.26, "toppled");
            drawBrassScissorTongs(ctx, S, B, 995, 565, 810, 472, 0.16, t, { bendDir: -1 });
            drawLithoSnailDarter50(ctx, S, 650, 422 + Math.sin(t * 4) * 5, 1.22, t, { happy: true });

            S.drawTurkeyInCorner(ctx, 245, 478, 1.14, t, { dispatch: 1.0 });
            S.drawTurkeyCutawayBadge(ctx, 115, 496, 0.95, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            // Flipped teal creek Detour arrow sign + pebble-skipping water rings!
            drawDamSign50(ctx, S, plates, 640, 295, Math.sin(t * 2) * 0.06, 1, "detour");

            for (var sk = 0; sk < 4; sk++) {
              var sx = 445 + sk * 125;
              drawConcentricRipples(ctx, sx, 495, 2, 48, t + sk * 0.25, "#fbfaf5", 0.35);
            }
            var pu = (t * 0.85) % 1;
            var px = lerp(420, 845, pu);
            var py = 492 - Math.abs(Math.sin(pu * Math.PI * 4)) * 46;
            S.drawCardboardPuppetPiece(ctx, [[px - 12, py - 5], [px + 12, py - 5], [px + 10, py + 5], [px - 10, py + 5]], { tone: "#fde047", shadow: false });

            drawLithoSnailDarter50(ctx, S, 640, 435, 1.06, t, { happy: true });
            S.drawBrookTrout(ctx, 895, 425, 1.06, t, true);
            S.drawMailSnail(ctx, 355, 492, 1.20, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 88, 1.20, t, 640, 295);
            B.drawTractorRings(ctx, 640, 114, 640, 315, t, { spread: 155 });

            // Unwanted tin DAM sign plucked upward into green saucer beam!
            var liftY = lerp(345, 205, 0.35 + ((t * 0.36) % 0.60));
            ctx.save();
            ctx.translate(640, liftY);
            ctx.scale(0.68, 0.68);
            drawDamSign50(ctx, S, plates, 0, 0, Math.sin(t * 4) * 0.18, 1, "normal");
            ctx.restore();

            // Tiny Snail Darter flashing giant victory bubble below!
            drawLithoSnailDarter50(ctx, S, 585, 455, 1.18, t, { happy: true });
            drawCutoutBubble(ctx, 515, 395 + Math.sin(t * 3) * 8, 28, "rgba(167, 243, 208, 0.88)");
          }
        }
      }
    });
  }

  // ---------- Register All 6 Pod 5 Slice A Portholes (#45..#50) ----------
  function initPod5A() {
    var B = getEngine();
    if (!B || typeof B.definePortalGame !== "function") return;
    registerPorthole45();
    registerPorthole46();
    registerPorthole47();
    registerPorthole48();
    registerPorthole49();
    registerPorthole50();
  }

  initPod5A();
})(typeof window !== "undefined" ? window : globalThis);
