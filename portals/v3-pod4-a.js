/* ============================================================================
 * Turkey Sub · V3 Video-to-Game + PAELEO Oulipo 12-Branch Pod 4A (#34–#39)
 * File: portals/v3-pod4-a.js  (window.PORTAL_V3_GAMES[34..39])
 *
 * Assigned Portholes:
 *   - #34 · Organ    ("perec-stage"        · p34.jpg + atlas-10.webp) [Spot-Checked Showstopper]
 *   - #35 · Post #44 ("cardboard-parallax" · p35.jpg + atlas-04.webp)
 *   - #36 · Bench    ("daumier-litho"      · p36.jpg + atlas-15.webp)
 *   - #37 · Bulkhead ("queneau-rostrum"    · p37.jpg + atlas-26.webp)
 *   - #38 · Visor    ("queneau-rostrum"    · p38.jpg + atlas-37.webp)
 *   - #39 · Parlor   ("perec-stage"        · p39.jpg + atlas-24.webp)
 *
 * STRICT PAELEO BLIND-MODE LAW:
 *   1. ZERO ctx.fillText or ctx.strokeText calls anywhere in this file!
 *      All gauges, stamps, banners, scrolls, maps, abacuses, and plaques use
 *      100% pure geometric/pictographic cut-paper & brass craft.
 *   2. Tactile riveted brass/cardboard patches permanently mask any painted
 *      plate lettering (e.g. "#44" on p35.jpg, "Creek" script on p37.jpg) and
 *      atlas crops strictly exclude border typography (atlas-10, 04, 37).
 *   3. 100% stateless & deterministic from resolved.t / stemT / outcomeT.
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var PORTAL_IDS = [34, 35, 36, 37, 38, 39];

  function getBG() {
    return (root && root.BRANCH_GAME) || (typeof window !== "undefined" && window.BRANCH_GAME) || null;
  }

  function getSS() {
    return (root && root.SCION_STAGE) || (typeof window !== "undefined" && window.SCION_STAGE) || null;
  }

  var initSS = getSS();
  if (initSS && typeof initSS.preloadPortalPlates === "function") {
    initSS.preloadPortalPlates(PORTAL_IDS);
  }

  // ==========================================================================
  // SHARED TACTILE CUTOUT, IK PUPPET & PICTOGRAPHIC HELPERS (ZERO TEXT!)
  // ==========================================================================

  function makeBackdropState(resolved) {
    return {
      showCaptions: !resolved.blind,
      lamp: resolved.lampOn,
      ballast: resolved.ballastOn
    };
  }

  function stemProgress(resolved) {
    var B = getBG();
    if (resolved.phase === "outcome" || resolved.phase === "tier_select") return 1.0;
    return B ? B.easeOutCubic(B.clamp(resolved.stemU, 0, 1)) : 1.0;
  }

  function outcomeProgress(resolved) {
    var B = getBG();
    if (resolved.phase !== "outcome") return 0.0;
    return B ? B.easeOutBack(B.clamp((resolved.outcomeT || 0) / 0.62, 0, 1)) : 1.0;
  }

  function drawLinkageBar(ctx, S, x1, y1, x2, y2, halfW, tone, opts) {
    var cfg = opts || {};
    var dx = x2 - x1;
    var dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / len;
    var uy = dy / len;
    var nx = -uy * halfW;
    var ny = ux * halfW;
    var ext = cfg.pad != null ? cfg.pad : halfW * 0.72;
    var sx = x1 - ux * ext;
    var sy = y1 - uy * ext;
    var ex = x2 + ux * ext;
    var ey = y2 + uy * ext;

    S.drawCardboardPuppetPiece(ctx, [
      [sx + nx, sy + ny],
      [ex + nx * 0.88, ey + ny * 0.88],
      [ex + ux * (halfW * 0.35), ey + uy * (halfW * 0.35)],
      [ex - nx * 0.88, ey - ny * 0.88],
      [sx - nx, sy - ny],
      [sx - ux * (halfW * 0.35), sy - uy * (halfW * 0.35)]
    ], {
      tone: tone || "#8f8d87",
      ribs: cfg.ribs != null ? cfg.ribs : 2,
      stroke: cfg.stroke || "#181715",
      shadow: cfg.shadow !== false
    });
    if (cfg.pinStart) S.drawSplitPin(ctx, x1, y1, cfg.pinR || 4.8, { metal: cfg.metal || "brass" });
    if (cfg.pinEnd) S.drawSplitPin(ctx, x2, y2, cfg.pinR || 4.8, { metal: cfg.metalEnd || cfg.metal || "silver" });
  }

  function drawIKTongs(ctx, S, baseX, baseY, tipX, tipY, l1, l2, bendDir, pinchRad, opts) {
    var cfg = opts || {};
    var ik = S.solveIK2(baseX, baseY, l1 || 210, l2 || 205, tipX, tipY, bendDir == null ? -1 : bendDir);
    drawLinkageBar(ctx, S, ik.x0, ik.y0, ik.jx, ik.jy, cfg.w1 || 12, cfg.tone1 || "#8c7440", {
      pinStart: true,
      pinEnd: true,
      metal: "brass"
    });
    drawLinkageBar(ctx, S, ik.jx, ik.jy, ik.ex, ik.ey, cfg.w2 || 10, cfg.tone2 || "#cfa34e", {
      pinEnd: true,
      metal: "silver"
    });

    var ang = ik.a2;
    var openA = pinchRad != null ? pinchRad : 0.24;
    var jawLen = cfg.jawLen || 46;
    ctx.save();
    ctx.translate(ik.ex, ik.ey);
    ctx.rotate(ang);
    for (var side = -1; side <= 1; side += 2) {
      ctx.save();
      ctx.rotate(side * openA);
      S.drawCardboardPuppetPiece(ctx, [
        [-4, side * 3],
        [jawLen * 0.62, side * 16],
        [jawLen, side * 5],
        [jawLen * 0.72, side * 1],
        [4, -side * 2]
      ], {
        tone: side < 0 ? "#e2b85c" : "#b58934",
        ribs: 1,
        shadow: false
      });
      ctx.restore();
    }
    S.drawSplitPin(ctx, 0, 0, 5.0, { metal: "brass" });
    ctx.restore();
    return ik;
  }

  function drawPaperBubble(ctx, x, y, r, tint) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.arc(0, 0, r + 2.0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = tint || "rgba(196, 240, 234, 0.74)";
    ctx.strokeStyle = "#181613";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-r * 0.34, -r * 0.34, Math.max(1.3, r * 0.26), 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawBubbleRing(ctx, cx, cy, rx, ry, alpha, strokeCol) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha == null ? 0.85 : alpha));
    ctx.strokeStyle = "#fbfaf5";
    ctx.lineWidth = 5.2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
    ctx.stroke();

    ctx.strokeStyle = strokeCol || "#38bdf8";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function drawCutPaperMusicNote(ctx, x, y, scale, rot, col, doubleBeam) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.scale(scale || 1, scale || 1);

    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.arc(0, -2, doubleBeam ? 20 : 16, 0, TAU);
    ctx.fill();

    ctx.fillStyle = col || "#d42a1e";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 1.5;
    if (doubleBeam) {
      ctx.beginPath();
      ctx.ellipse(-8, 7, 5.5, 4.2, -0.35, 0, TAU);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(7, 5, 5.5, 4.2, -0.35, 0, TAU);
      ctx.fill(); ctx.stroke();
      ctx.fillRect(-4, -13, 3.0, 19);
      ctx.fillRect(11, -15, 3.0, 19);
      ctx.fillRect(-4, -15, 18, 4.5);
    } else {
      ctx.beginPath();
      ctx.ellipse(-3.5, 6, 6.2, 4.5, -0.35, 0, TAU);
      ctx.fill(); ctx.stroke();
      ctx.fillRect(1, -15, 3.2, 21);
      ctx.beginPath();
      ctx.moveTo(2.5, -15);
      ctx.quadraticCurveTo(13, -11, 9.5, -2);
      ctx.quadraticCurveTo(7.5, -7, 2.5, -9);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCutPaperHeart(ctx, S, x, y, scale, rot, col) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.scale(scale || 1, scale || 1);
    S.drawCutoutPaperEdge(ctx, [
      [0, 14], [-14, 1], [-15, -9], [-8, -14], [0, -7], [8, -14], [15, -9], [14, 1]
    ], col || "#f43f5e", "#14110d", { paperRim: 2.4, shadow: false });
    ctx.restore();
  }

  function drawCutPaperStar(ctx, S, x, y, rOuter, rInner, points, rot, col, rim) {
    var n = (points || 5) * 2;
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = (i / n) * TAU - Math.PI * 0.5 + (rot || 0);
      var r = (i % 2 === 0) ? rOuter : rInner;
      pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
    }
    S.drawCutoutPaperEdge(ctx, pts, col || "#f3d184", "#14110d", {
      paperRim: rim != null ? rim : 2.2,
      shadow: false
    });
  }

  function drawPerforatedStamp(ctx, x, y, w, h, rot, fillCol, iconKind) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);

    // Scalloped postage stamp backing (0 text!)
    ctx.fillStyle = "#fbfaf5";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 1.6;
    ctx.fillRect(-w * 0.5 - 4, -h * 0.5 - 4, w + 8, h + 8);
    ctx.strokeRect(-w * 0.5 - 4, -h * 0.5 - 4, w + 8, h + 8);

    // Perforation dots along border
    ctx.fillStyle = "#14110d";
    for (var px = -w * 0.5; px <= w * 0.5; px += 8) {
      ctx.beginPath();
      ctx.arc(px, -h * 0.5 - 4, 1.3, 0, TAU);
      ctx.arc(px, h * 0.5 + 4, 1.3, 0, TAU);
      ctx.fill();
    }

    ctx.fillStyle = fillCol || "#0f8f80";
    ctx.fillRect(-w * 0.5, -h * 0.5, w, h);

    ctx.strokeStyle = "#fbfaf5";
    ctx.fillStyle = "#fbfaf5";
    ctx.lineWidth = 2.0;
    if (iconKind === "check") {
      ctx.beginPath();
      ctx.moveTo(-w * 0.24, 1);
      ctx.lineTo(-w * 0.05, h * 0.24);
      ctx.lineTo(w * 0.28, -h * 0.22);
      ctx.stroke();
    } else if (iconKind === "gear") {
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) * 0.26, 0, TAU);
      ctx.stroke();
      for (var k = 0; k < 6; k++) {
        var ka = (k / 6) * TAU;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ka) * 4, Math.sin(ka) * 4);
        ctx.lineTo(Math.cos(ka) * (Math.min(w, h) * 0.36), Math.sin(ka) * (Math.min(w, h) * 0.36));
        ctx.stroke();
      }
    } else {
      // Classic 5-point postal star
      ctx.beginPath();
      for (var s = 0; s < 10; s++) {
        var sa = (s / 10) * TAU - Math.PI * 0.5;
        var sr = (s % 2 === 0) ? Math.min(w, h) * 0.30 : Math.min(w, h) * 0.13;
        if (s === 0) ctx.moveTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
        else ctx.lineTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawHotspotShimmer(ctx, B, t, anchors) {
    if (!anchors) return;
    var keys = ["x", "o", "triangle", "square"];
    var cols = ["#60a5fa", "#f87171", "#34d399", "#fbbf24"];
    ctx.save();
    for (var i = 0; i < keys.length; i++) {
      var a = anchors[keys[i]] && anchors[keys[i]].anchor ? anchors[keys[i]].anchor : anchors[keys[i]];
      if (!a) continue;
      var pulse = 0.5 + 0.5 * Math.sin(t * 3.8 + i * 1.5);
      var r = 10 + pulse * 8;
      ctx.strokeStyle = B.rgba(cols[i], 0.24 + pulse * 0.22);
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(a.x, a.y, r, 0, TAU);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawGearWheel(ctx, S, cx, cy, r, teeth, rot, col) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot || 0);
    var n = (teeth || 8) * 2;
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = (i / n) * TAU;
      var rr = (i % 2 === 0) ? r + 5 : r - 3;
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    S.drawCutoutPaperEdge(ctx, pts, col || "#c9963e", "#14110d", { paperRim: 2.0 });
    S.drawSplitPin(ctx, 0, 0, Math.max(4.0, r * 0.22), { metal: "brass" });
    ctx.restore();
  }

  function drawWaterJetStream(ctx, B, x0, y0, x1, y1, t, u, col) {
    if (u <= 0.01) return;
    ctx.save();
    var ex = B.lerp(x0, x1, u);
    var ey = B.lerp(y0, y1, u);
    for (var s = 0; s < 3; s++) {
      ctx.strokeStyle = s === 1 ? "rgba(255,255,255,0.78)" : B.rgba(col || "#ef4444", 0.55);
      ctx.lineWidth = s === 1 ? 3.2 : 6.0;
      ctx.lineCap = "round";
      ctx.setLineDash([14, 8]);
      ctx.lineDashOffset = -t * 95 - s * 7;
      ctx.beginPath();
      ctx.moveTo(x0, y0 + (s - 1) * 8);
      ctx.quadraticCurveTo((x0 + ex) * 0.5, (y0 + ey) * 0.5 + Math.sin(t * 9 + s) * 14, ex, ey + (s - 1) * 5);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  // ==========================================================================
  // PORTHOLE #34 · ORGAN ("perec-stage" · p34.jpg + atlas-10.webp)
  // Spot-checked by @v3-critic & @p4-verify — Total Méliès Cutaway Showstopper!
  // ==========================================================================
  (function buildPortal34() {
    var B = getBG();
    if (!B) return;

    var OPEN = { openX: 150, openY: 62, openW: 980, openH: 552, doors: true };

    function drawOrganBackdrop(ctx, W, H, resolved, plates, S) {
      var t = resolved.t;
      S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 34, t, makeBackdropState(resolved), OPEN);

      // Pure geometric brass organ-pipe crest on right sandstone jamb (0 text!)
      ctx.save();
      S.drawCutoutPaperEdge(ctx, [[1052, 118], [1114, 118], [1114, 168], [1052, 168]], "#1c1815", "#0b0908", { paperRim: 0 });
      for (var pi = 0; pi < 3; pi++) {
        ctx.fillStyle = "#d4a44c";
        ctx.fillRect(1065 + pi * 13, 134 - pi * 4, 8, 24 + pi * 4);
      }
      S.drawSplitPin(ctx, 1060, 126, 3.2, { metal: "brass" });
      S.drawSplitPin(ctx, 1106, 126, 3.2, { metal: "brass" });
      ctx.restore();

      // Recessed Méliès Cutaway Stage inside Perec Doorway
      ctx.save();
      ctx.beginPath();
      ctx.rect(OPEN.openX, OPEN.openY, OPEN.openW, OPEN.openH);
      ctx.clip();

      // Stage water tint per branch mood
      var tintTop = "#1b444c", tintBot = "#122b32";
      if (resolved.selectedButton === "x" && resolved.selectedTier === "plausible") {
        tintTop = "#3d2f24"; tintBot = "#241912";
      } else if (resolved.selectedTier === "preposterous") {
        tintTop = "#161f38"; tintBot = "#0d1224";
      } else if (resolved.selectedButton === "o" && resolved.selectedTier === "plausible") {
        tintTop = "#2a3e48"; tintBot = "#1a2830";
      }
      var sg = ctx.createLinearGradient(0, OPEN.openY, 0, OPEN.openY + OPEN.openH);
      sg.addColorStop(0, tintTop);
      sg.addColorStop(1, tintBot);
      ctx.fillStyle = sg;
      ctx.fillRect(OPEN.openX, OPEN.openY, OPEN.openW, OPEN.openH);

      var aImg = plates.atlasImg; // atlas-10.webp (740x568) — crop strictly right of x=232 copyright plaque!
      var driftX = Math.sin(t * 0.55) * 8;
      var driftY = Math.cos(t * 0.45) * 4;
      S.drawScissorCutout(ctx, aImg, 234, 136, 396, 284, 335 + driftX, 86 + driftY, 590, 355, null, {
        filter: resolved.selectedTier === "preposterous" ? "cyan" : "sepia",
        haloWidth: 4.5,
        alpha: 0.80,
        seed: 3401
      });
      // Left Méliès painted brass boiler crop (below plaque y=186..420, x=8..170)
      S.drawScissorCutout(ctx, aImg, 8, 186, 162, 232, 168 + driftX * 0.7, 178 + driftY, 178, 250, [
        [0.06, 0.08], [0.88, 0.04], [0.96, 0.94], [0.04, 0.96]
      ], {
        filter: "sepia",
        haloWidth: 4.0,
        alpha: 0.76,
        seed: 3402
      });
      // Méliès painted sea waves along stage floor
      S.drawScissorCutout(ctx, aImg, 10, 440, 720, 122, 148 + driftX * 1.2, 478, 984, 136, null, {
        haloWidth: 4.0,
        seed: 3403
      });

      B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.22, topY: 75, stageH: 610 });
      B.drawDepthFog(ctx, W, H, t, { density: 0.14, color: "#bae6fd", stageH: 610 });
      ctx.restore();
    }

    function drawOrganRig(ctx, S, plates, t, cfg) {
      var c = cfg || {};
      var pImg = plates.portholeImg;
      var orgX = 640 + (c.shiftX || 0);
      var orgY = 412 + (c.shiftY || 0);

      // Creek rocks & swaying kelp cutouts from p34.jpg (strictly above bottom-left reflection!)
      S.drawScissorCutout(ctx, pImg, 110, 290, 102, 102, 172, 428, 164, 152, [
        [0.08, 0.08], [0.85, 0.05], [0.96, 0.92], [0.04, 0.95]
      ], { haloWidth: 4.0, seed: 3410 });
      S.drawScissorCutout(ctx, pImg, 426, 352, 108, 132, 922, 412, 172, 176, [
        [0.12, 0.06], [0.92, 0.10], [0.96, 0.94], [0.06, 0.94]
      ], { haloWidth: 4.0, seed: 3411 });

      // Optional ambient creek trout from p34.jpg when not in custom trout outcome
      if (!c.hidePlateTrout) {
        S.drawScissorCutout(ctx, pImg, 122, 196, 140, 76, 205 + Math.sin(t * 1.8) * 12, 148 + Math.cos(t * 2.3) * 6, 192, 104, null, {
          haloWidth: 3.8,
          seed: 3412
        });
      }

      // Bio-mechanical lung lobes behind pipes if lungMode > 0
      if (c.lungMode) {
        var breath = Math.sin(t * 2.8);
        for (var ls = -1; ls <= 1; ls += 2) {
          ctx.save();
          ctx.translate(orgX + ls * (168 + breath * 18) * c.lungMode, 336);
          ctx.scale(ls * (1 + breath * 0.09), 1 + breath * 0.07);
          S.drawCardboardPuppetPiece(ctx, [
            [-46, -124], [48, -138], [114, -58], [120, 72], [54, 132], [-40, 104], [-58, 12]
          ], {
            tone: "#2b7a78",
            ribs: 5,
            pins: [[-20, -72], [44, -40], [52, 50]]
          });
          ctx.restore();
        }
      }

      // 5 Hero Graduated Brass Whistle Pipes + 2 Side Pipes
      var pipeSpecs = [
        { dx: -102, h: 128, w: 23, col: "#b87338" },
        { dx: -64,  h: 172, w: 25, col: "#d48c46" },
        { dx: -24,  h: 226, w: 28, col: "#e09f52" },
        { dx: 18,   h: 196, w: 26, col: "#c9823e" },
        { dx: 58,   h: 152, w: 24, col: "#b87338" },
        { dx: 96,   h: 116, w: 21, col: "#a86430" },
        { dx: 128,  h: 88,  w: 18, col: "#c9823e" }
      ];
      var pumpAmp = c.pumpAmp != null ? c.pumpAmp : 1.0;
      for (var p = 0; p < pipeSpecs.length; p++) {
        var ps = pipeSpecs[p];
        var px = orgX + ps.dx;
        var bounce = Math.sin(t * (c.fastPipes ? 7.2 : 4.2) + p * 0.85) * (8 * pumpAmp);
        var ph = ps.h + bounce;
        var hw = ps.w * 0.5;
        S.drawCardboardPuppetPiece(ctx, [
          [px - hw, orgY - 40], [px - hw, orgY - 40 - ph],
          [px + hw, orgY - 40 - ph], [px + hw, orgY - 40]
        ], {
          tone: c.spotlit ? (p % 2 === 0 ? "#f0be6e" : "#d99b43") : ps.col,
          ribs: 2
        });
        // Dark cutaway organ whistle mouth notch
        S.drawCutoutPaperEdge(ctx, [
          [px - hw * 0.65, orgY - 72], [px + hw * 0.65, orgY - 72], [px, orgY - 92]
        ], "#1f150e", "#14110d", { paperRim: 0, shadow: false });

        // Gleaming copper rivet star-glints when spotlit ([✕] stem & outcomes)
        if (c.spotlit && p < 5) {
          var glintA = 0.45 + 0.55 * Math.sin(t * 6.5 + p * 1.1);
          ctx.strokeStyle = "rgba(255, 250, 220, " + glintA.toFixed(2) + ")";
          ctx.lineWidth = 2.2;
          var gy = orgY - 40 - ph * 0.62;
          ctx.beginPath();
          ctx.moveTo(px - 10, gy); ctx.lineTo(px + 10, gy);
          ctx.moveTo(px, gy - 10); ctx.lineTo(px, gy + 10);
          ctx.stroke();
        }

        // Default gentle ambient pipe bubbles unless overridden
        if (!c.customPipeEmit && p < 5) {
          var bu = ((t * 0.45 + p * 0.19) % 1);
          drawPaperBubble(ctx, px + Math.sin(t * 3 + p) * 8, B.lerp(orgY - 46 - ph, 92, bu), 5 + (p % 3) * 2.2);
        }
      }

      // Right-hand Whistle Stack + Hinged Brass Whistle Cap & Hanging Pull-Chain (Anchor □: 845, 465!)
      var whX = 812;
      var whTopY = 278;
      S.drawCardboardPuppetPiece(ctx, [
        [whX - 18, orgY + 24], [whX - 16, whTopY], [whX + 16, whTopY], [whX + 18, orgY + 24]
      ], { tone: "#d49b42", ribs: 3, pins: [[whX, whTopY + 28], [whX, orgY - 12]] });

      var capOpen = c.whistleOpen || 0;
      ctx.save();
      ctx.translate(whX - 14, whTopY);
      ctx.rotate(-capOpen * 0.85);
      S.drawCutoutPaperEdge(ctx, [[-4, -14], [36, -14], [32, 0], [-4, 0]], "#f3d184", "#14110d", { paperRim: 2.0 });
      S.drawSplitPin(ctx, 0, -4, 4.2, { metal: "brass" });
      ctx.restore();

      // Brass lever & pull-chain dangling right through (845, 465)
      var tugY = (c.chainTug || 0) * 24;
      drawLinkageBar(ctx, S, whX + 8, whTopY + 14, 848, whTopY + 26 + tugY * 0.6, 5.5, "#e2b85c", {
        pinStart: true, pinEnd: true
      });
      ctx.strokeStyle = "#f3d184";
      ctx.lineWidth = 3.2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(845, whTopY + 28 + tugY * 0.6);
      ctx.lineTo(845, 468 + tugY);
      ctx.stroke();
      ctx.setLineDash([]);
      drawPaperBubble(ctx, 845, 472 + tugY, 8.5, "#d4a44c");

      // Scissor-Cut Brass Clockwork Boiler Pot from p34.jpg on Left (x ~ 415..460, Anchor ✕: 415, 270 & △: 430, 465!)
      S.drawScissorCutout(ctx, pImg, 198, 266, 102, 196, 368, 246, 172, 276, [
        [0.24, 0.03], [0.74, 0.03], [0.94, 0.28], [0.96, 0.96], [0.06, 0.96], [0.08, 0.32]
      ], {
        haloWidth: 4.5,
        tint: c.warmRadiator ? "rgba(255, 165, 55, 0.28)" : null,
        seed: 3415
      });

      // Cutaway Boiler Window at (435, 318) near [✕] anchor (415, 270)
      ctx.save();
      ctx.translate(442, 326);
      S.drawCutoutPaperEdge(ctx, [[-44, -36], [44, -36], [44, 36], [-44, 36]], c.spotlit ? "#1e3a5f" : "#2b2118", "#14110d", { paperRim: 2.5 });
      drawGearWheel(ctx, S, -14, 4, 16, 7, t * (c.fastGears ? 4.8 : 1.8), "#e0a94f");
      drawGearWheel(ctx, S, 16, -6, 12, 6, -t * (c.fastGears ? 6.0 : 2.3), "#c58932");
      ctx.restore();

      // Rattling Round Pressure Gauge Dial at Anchor △ (430, 465) — 100% geometric wedges, 0 text!
      var gShakeX = c.gaugePatched ? 0 : Math.sin(t * 26) * 2.2;
      var gShakeY = c.gaugePatched ? 0 : Math.cos(t * 22) * 1.8;
      ctx.save();
      ctx.translate(430 + gShakeX, 465 + gShakeY);
      drawPaperBubble(ctx, 0, 0, 32, "#fbfaf5");
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 4.5;
      ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.stroke();
      // Safe emerald sector vs red danger sector
      ctx.fillStyle = "rgba(16, 185, 129, 0.35)";
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 24, -Math.PI * 0.85, -Math.PI * 0.15); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(212, 42, 30, 0.38)";
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 24, -Math.PI * 0.15, Math.PI * 0.28); ctx.closePath(); ctx.fill();
      // Needle
      var needleAng = c.gaugePatched ? (-Math.PI * 0.52 + Math.sin(t * 2.0) * 0.05) : (0.05 + Math.sin(t * 19) * 0.28);
      ctx.strokeStyle = "#d42a1e";
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(needleAng) * 22, Math.sin(needleAng) * 22);
      ctx.stroke();
      S.drawSplitPin(ctx, 0, 0, 4.0, { metal: "brass" });

      if (!c.gaugePatched) {
        // Pinhole fizzy bubble leak on right rim of dial
        for (var lb = 0; lb < 3; lb++) {
          var lu = ((t * 1.8 + lb / 3) % 1);
          drawPaperBubble(ctx, 28 + lu * 22, -10 - lu * 26, 3.5 + (1 - lu) * 2.5);
        }
      } else {
        // Mail Snail's perforated emerald postage stamp sealing the leak!
        drawPerforatedStamp(ctx, 24, -12, 26, 22, 0.18, "#0f8f80", "star");
      }
      ctx.restore();

      // Pleated Leather Accordion Bellows at Center-Right (orgX..850)
      var sq = Math.sin(t * (c.bellowsFast ? 6.8 : 3.2)) * (16 * (c.bellowsAmp || 1.0));
      for (var pl = -3; pl <= 3; pl++) {
        var topPX = (orgX + 35) + pl * (24 + sq * 0.26);
        var botPX = (orgX + 35) + pl * 18;
        S.drawCardboardPuppetPiece(ctx, [
          [topPX - 13, orgY - 56], [topPX + 13, orgY - 56],
          [botPX + 10, orgY + 60], [botPX - 10, orgY + 60]
        ], { tone: pl % 2 === 0 ? "#c4944a" : "#7c5826", ribs: 1, shadow: false });
      }
      drawLinkageBar(ctx, S, orgX - 72 - sq * 0.6, orgY - 60, orgX - 38, orgY + 64, 11, "#d4a44c", { pinStart: true, pinEnd: true });
      drawLinkageBar(ctx, S, orgX + 142 + sq * 0.6, orgY - 60, orgX + 108, orgY + 64, 11, "#d4a44c", { pinStart: true, pinEnd: true });

      // Counter-rotating base clockwork gears
      drawGearWheel(ctx, S, orgX + 16, orgY + 78, 28, 8, t * 2.1, "#c9963e");
      drawGearWheel(ctx, S, orgX + 74, orgY + 82, 21, 7, -t * 2.8, "#e2b85c");
    }

    function drawShrimpEngineer(ctx, S, x, y, scale, t, phase) {
      ctx.save();
      ctx.translate(x, y + Math.sin(t * 5.2 + phase) * 4);
      ctx.scale(scale || 1, scale || 1);
      // Translucent coral-pink curved shrimp segments
      S.drawCutoutPaperEdge(ctx, [
        [-22, 16], [-26, -6], [-8, -20], [18, -14], [26, 2], [10, 10], [-6, 18]
      ], "#fb7185", "#14110d", { paperRim: 2.2 });
      // White steamboat engineer cap!
      S.drawCutoutPaperEdge(ctx, [[-12, -20], [14, -20], [10, -32], [-10, -32]], "#fbfaf5", "#14110d", { paperRim: 1.5, shadow: false });
      // Tiny lever being tugged
      var levA = Math.sin(t * 6.5 + phase) * 0.45;
      ctx.strokeStyle = "#f3d184";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(18, 16);
      ctx.lineTo(18 + Math.sin(levA) * 24, -10);
      ctx.stroke();
      // Antenna whiskers
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(22, -8); ctx.quadraticCurveTo(38, -22, 46, -12);
      ctx.stroke();
      ctx.restore();
    }

    B.definePortalGame(34, {
      drawBackdrop: drawOrganBackdrop,

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawOrganRig(ctx, S, plates, t, {});
        drawHotspotShimmer(ctx, B, t, resolved.tree.buttons);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          var sweepX = B.lerp(415, 690, 0.5 + 0.5 * Math.sin(t * 2.8));
          drawOrganRig(ctx, S, plates, t, { spotlit: true, fastGears: true });
          B.drawVolumetricBeam(ctx, 160, 585, sweepX, 275, {
            color: "#60a5fa",
            coreColor: "#fef08a",
            spread: 155 * u + 30,
            intensity: 1.25 * u,
            t: t
          });
          B.drawLanternHalo(ctx, 442, 326, 115 * u, { color: "#60a5fa", coreColor: "#fef9c3", t: t });
          B.drawDeterministicParticles(ctx, "kintsugi", 580, 270, resolved.stemT, { count: 20, loop: true, seed: 34.1 });
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawOrganRig(ctx, S, plates, t, { bellowsAmp: 2.3, bellowsFast: true, pumpAmp: 1.8, customPipeEmit: true });
          drawWaterJetStream(ctx, B, 1110, 325, 840, 365, t, u, "#ef4444");
          // Five fat concentric silver bubble rings puffing from all 5 main brass pipes!
          for (var p = 0; p < 5; p++) {
            var px = 640 - 102 + p * 40;
            for (var r = 0; r < 2; r++) {
              var ru = ((t * 0.85 + p * 0.14 + r * 0.5) % 1);
              var ry = B.lerp(220, 78, ru);
              drawBubbleRing(ctx, px + Math.sin(t * 3 + p) * 10, ry, 16 + ru * 22, 7 + ru * 8, (1 - ru * 0.65) * u, "#93c5fd");
            }
          }
          B.drawDeterministicParticles(ctx, "bubbles", 850, 280, resolved.stemT, { count: 24, loop: true, seed: 34.2 });
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          var patched = u > 0.55;
          drawOrganRig(ctx, S, plates, t, { gaugePatched: patched });
          B.drawSnailSilverTrail(ctx, 210, 560, 412, 472, u, t, { arc: 26 });
          var sx = B.lerp(210, 396, u);
          var sy = B.lerp(560, 474, u) - Math.sin(u * Math.PI) * 18;
          S.drawMailSnail(ctx, sx, sy, 1.24, t, { hasReply: false });
          B.drawDeterministicParticles(ctx, "snail_trail", 430, 465, resolved.stemT, { count: 16, loop: true, seed: 34.3 });
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          var tug = Math.max(0, Math.sin(t * 8.5)) * u;
          drawOrganRig(ctx, S, plates, t, { chainTug: tug, whistleOpen: tug });
          var gripX = B.lerp(1110, 848, u);
          var gripY = B.lerp(560, 465 + tug * 24, u);
          drawIKTongs(ctx, S, 1125, 565, gripX, gripY, 210, 195, -1, 0.12 + (1 - tug) * 0.18);
          if (tug > 0.25) {
            drawBubbleRing(ctx, 812, 235 - tug * 38, 24, 11, 0.9, "#fbbf24");
            drawBubbleRing(ctx, 826, 205 - tug * 48, 30, 13, 0.75, "#fde68a");
          }
          B.drawDeterministicParticles(ctx, "brass_sparks", 845, 465, resolved.stemT, { count: 18, loop: true, seed: 34.4 });
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Probable] Friendly Steamboat Rescue Engine Crew (6.0s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            // Steamboat pilothouse wheel spinning above boiler
            ctx.save();
            ctx.translate(640, 168 - (1 - e) * 60);
            ctx.rotate(t * 0.95);
            drawPaperBubble(ctx, 0, 0, 62, "rgba(247, 232, 200, 0.34)");
            for (var sp = 0; sp < 8; sp++) {
              var wa = (sp / 8) * TAU;
              drawLinkageBar(ctx, S, 0, 0, Math.cos(wa) * 78, Math.sin(wa) * 78, 4.5, "#8c5828", { shadow: false });
            }
            S.drawSplitPin(ctx, 0, 0, 6.5, { metal: "brass" });
            ctx.restore();

            drawOrganRig(ctx, S, plates, t, { spotlit: true, fastGears: true, hidePlateTrout: true });
            B.drawVolumetricBeam(ctx, 165, 550, 520, 310, { color: "#60a5fa", coreColor: "#fef08a", spread: 190, intensity: 1.2, t: t });

            // Enlarged illuminated cutaway engine bay with 3 uniformed creek shrimp tugging levers!
            ctx.save();
            ctx.translate(520, 326);
            S.drawCutoutPaperEdge(ctx, [[-135, -62], [135, -62], [135, 62], [-135, 62]], "rgba(22, 48, 78, 0.92)", "#f3d184", { paperRim: 3.5 });
            drawGearWheel(ctx, S, -88, -18, 22, 8, t * 4.2, "#d4a44c");
            drawGearWheel(ctx, S, 92, 16, 20, 7, -t * 5.0, "#e2b85c");
            drawShrimpEngineer(ctx, S, -64, 14, 0.95, t, 0.0);
            drawShrimpEngineer(ctx, S, 4, 18, 1.02, t, 1.8);
            drawShrimpEngineer(ctx, S, 72, 14, 0.95, t, 3.4);
            ctx.restore();

            // Turkey waving an articulated cardboard wrench joyfully!
            S.drawTurkeyCutawayBadge(ctx, 128, 504, 1.06, t, { dispatch: 0.2 });
            ctx.save();
            ctx.translate(188, 474);
            ctx.rotate(-0.55 + Math.sin(t * 7.2) * 0.38);
            S.drawCardboardPuppetPiece(ctx, [[-6, 12], [-6, -54], [8, -54], [8, 12]], { tone: "#9ca3af", ribs: 1, pin: { x: 0, y: 4, r: 4, metal: "brass" } });
            S.drawCutoutPaperEdge(ctx, [[-18, -52], [-18, -76], [-6, -76], [-6, -62], [8, -62], [8, -76], [20, -76], [20, -52]], "#cbd5e1", "#14110d", { paperRim: 2 });
            ctx.restore();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Plausible] Glowing Rattling Basement Radiator
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            B.drawLanternHalo(ctx, 560, 360, 290, { color: "#f59e0b", coreColor: "#fef08a", intensity: 1.35, t: t });
            drawOrganRig(ctx, S, plates, t, { spotlit: true, warmRadiator: true, hidePlateTrout: true });
            B.drawVolumetricBeam(ctx, 160, 565, 510, 355, { color: "#60a5fa", coreColor: "#fde68a", spread: 160, intensity: 0.95, t: t });

            // Wavy golden radiator heat lines rising off copper belly
            ctx.save();
            ctx.strokeStyle = "rgba(254, 240, 138, 0.72)";
            ctx.lineWidth = 3.0;
            for (var h = 0; h < 4; h++) {
              var hx = 430 + h * 58;
              ctx.beginPath();
              ctx.moveTo(hx, 240);
              ctx.bezierCurveTo(hx - 18, 195, hx + 18, 155, hx - 6, 112);
              ctx.stroke();
            }
            ctx.restore();

            // Brook Trout hovering close rubbing mittened pectoral fins together!
            var tx = B.lerp(1120, 935, e);
            var ty = 342 + Math.sin(t * 2.8) * 7;
            S.drawBrookTrout(ctx, tx, ty, 1.18, t, false);
            var rub = Math.sin(t * 9.5) * 8;
            drawCutPaperHeart(ctx, S, tx - 92, ty - 28, 0.65, -0.2, "#fbbf24");
            S.drawCutoutPaperEdge(ctx, [[tx - 84, ty + 8 + rub], [tx - 58, ty + 4 + rub], [tx - 60, ty + 22 + rub], [tx - 86, ty + 22 + rub]], "#dc2626", "#14110d", { paperRim: 2 });
            S.drawCutoutPaperEdge(ctx, [[tx - 82, ty + 16 - rub], [tx - 56, ty + 14 - rub], [tx - 58, ty + 30 - rub], [tx - 84, ty + 30 - rub]], "#b91c1c", "#14110d", { paperRim: 2 });

            // Mail Snail toasting a green kelp marshmallow on a wire stick!
            var sx = 285, sy = 486;
            S.drawMailSnail(ctx, sx, sy, 1.22, t, { hasReply: true });
            ctx.strokeStyle = "#e5e7eb";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(sx + 24, sy - 6);
            ctx.lineTo(sx + 98, sy - 58);
            ctx.stroke();
            S.drawCutoutPaperEdge(ctx, [[sx + 92, sy - 74], [sx + 116, sy - 70], [sx + 112, sy - 46], [sx + 88, sy - 50]], "#a7f3d0", "#14110d", { paperRim: 2.5 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Preposterous] Illuminated Planet Breathing Space Lung
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawOrganRig(ctx, S, plates, t, { spotlit: true, lungMode: e, hidePlateTrout: true });

            // Alien X-Ray Overlay showing glowing turquoise bronchial tubes over the brass organ pipes!
            B.drawXRayOverlay(ctx, 635, 315, 290, 220, e, function (g, cx, cy, rw, rh) {
              var pulse = 1 + Math.sin(t * 2.8) * 0.08;
              g.save();
              g.translate(cx, cy - 10);
              g.scale(pulse, pulse);
              g.strokeStyle = "#2dd4bf";
              g.lineWidth = 6.0;
              g.lineCap = "round";
              g.beginPath();
              g.moveTo(0, -82); g.lineTo(0, -14);
              g.moveTo(0, -14); g.quadraticCurveTo(-48, 8, -74, 58);
              g.moveTo(0, -14); g.quadraticCurveTo(48, 8, 74, 58);
              g.moveTo(-36, 12); g.lineTo(-42, 66);
              g.moveTo(36, 12); g.lineTo(42, 66);
              g.stroke();
              var nodes = [[-74, 58], [-42, 66], [42, 66], [74, 58], [-86, 28], [86, 28]];
              for (var ni = 0; ni < nodes.length; ni++) {
                g.fillStyle = "rgba(94, 234, 212, 0.72)";
                g.beginPath();
                g.arc(nodes[ni][0], nodes[ni][1], 14, 0, TAU);
                g.fill();
              }
              g.restore();
            }, { t: t, borderColor: "#2dd4bf" });

            var hoverBreath = Math.sin(t * 2.8) * 14;
            B.drawTractorRings(ctx, 640, 118 + hoverBreath, 635, 315, t, { spread: 155, rings: 5 });
            S.drawAlienSaucer(ctx, 640, B.lerp(-40, 112 + hoverBreath, e), 1.24, t, false, false);
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Probable] Full Steam Rescue Tugboat Salute
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            // Hand-tinted pastel Méliès cut-paper smoke clouds swirling harmlessly above pipes
            for (var sm = 0; sm < 5; sm++) {
              var su = ((t * 0.38 + sm * 0.2) % 1);
              var smX = 535 + sm * 54 + Math.sin(t * 2.4 + sm) * 18;
              var smY = B.lerp(225, 86, su);
              var sc = 0.7 + su * 0.65;
              ctx.save();
              ctx.translate(smX, smY);
              ctx.scale(sc, sc);
              S.drawCutoutPaperEdge(ctx, [
                [-34, 8], [-24, -16], [0, -24], [26, -14], [36, 8], [16, 20], [-18, 20]
              ], sm % 2 === 0 ? "#fde68a" : "#fbcfe8", "#14110d", { paperRim: 2.5, shadow: false });
              ctx.restore();
            }

            drawOrganRig(ctx, S, plates, t, { bellowsAmp: 2.2, bellowsFast: true, pumpAmp: 1.7, customPipeEmit: true });
            for (var br = 0; br < 4; br++) {
              var ru = ((t * 0.7 + br * 0.25) % 1);
              drawBubbleRing(ctx, 635, B.lerp(240, 80, ru), 35 + ru * 55, 12 + ru * 18, 0.9 - ru * 0.6, "#bae6fd");
            }

            // Turkey cranking toy steam-gauge to FULL CHUG (pure emerald/gold wedge dial, 0 text!) + crisp salute!
            S.drawTurkeyCutawayBadge(ctx, 130, 502, 1.06, t, { dispatch: 0.85 });
            ctx.save();
            ctx.translate(238, 492 - (1 - e) * 40);
            drawPaperBubble(ctx, 0, 0, 38, "#fbfaf5");
            ctx.fillStyle = "#f59e0b";
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 32, -Math.PI * 0.9, Math.PI * 0.2); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = "#14110d"; ctx.lineWidth = 3.2;
            var chugAng = 0.12 + Math.sin(t * 12) * 0.08;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(chugAng) * 28, Math.sin(chugAng) * 28); ctx.stroke();
            S.drawSplitPin(ctx, 0, 0, 4.5, { metal: "brass" });
            ctx.restore();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Plausible + Snail Mail] Loud Circus Calliope Polka Barge (11.8s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);

            // Circus Calliope striped crimson-and-buttercream canopy pennants across proscenium!
            for (var pi = 0; pi < 9; pi++) {
              var ppx = 205 + pi * 108;
              S.drawCutoutPaperEdge(ctx, [
                [ppx - 54, 62], [ppx + 54, 62], [ppx, 62 + 72 * e]
              ], pi % 2 === 0 ? "#d42a1e" : "#fae194", "#14110d", { paperRim: 2.5 });
            }

            // Churning red stern paddlewheel on left!
            ctx.save();
            ctx.translate(262, 418);
            ctx.rotate(t * 3.2);
            for (var pw = 0; pw < 8; pw++) {
              var pa = (pw / 8) * TAU;
              drawLinkageBar(ctx, S, 0, 0, Math.cos(pa) * 76, Math.sin(pa) * 76, 7, "#b82921", { shadow: false });
            }
            S.drawReinigerFiligreeHinge(ctx, 0, 0, 12, { metal: "brass" });
            ctx.restore();

            drawOrganRig(ctx, S, plates, t, {
              bellowsAmp: 2.4,
              bellowsFast: true,
              fastPipes: true,
              pumpAmp: 1.9,
              customPipeEmit: true,
              hidePlateTrout: true
            });

            // Eighth-notes & beamed music notes popping from all 5 brass pipes!
            for (var n = 0; n < 6; n++) {
              var nu = ((t * 0.62 + n * 0.17) % 1);
              var nx = 540 + n * 42 + Math.sin(t * 4.5 + n) * 16;
              var ny = B.lerp(235, 96, nu);
              drawCutPaperMusicNote(ctx, nx, ny, 0.95, Math.sin(t * 5 + n) * 0.28, n % 2 === 0 ? "#d42a1e" : "#0f8f80", n % 3 === 0);
            }

            // Brook Trout kicking up tail in a joyful tilted oom-pah polka spin!
            var polkaTilt = Math.sin(t * 6.4) * 0.36;
            var polkaBounce = Math.abs(Math.sin(t * 6.4)) * 26;
            S.drawBrookTrout(ctx, 975, 345 - polkaBounce, 1.20, t, false, { tilt: polkaTilt });

            // Mail Snail conducting with a crisp white baton from atop the brass boiler dome!
            S.drawMailSnail(ctx, 454, 236, 1.18, t, { hasReply: true });
            ctx.save();
            ctx.translate(486, 224);
            ctx.rotate(-0.6 + Math.sin(t * 6.4) * 0.55);
            ctx.strokeStyle = "#fbfaf5";
            ctx.lineWidth = 3.5;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(36, -24); ctx.stroke();
            ctx.restore();
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Preposterous] Steam Powered Nebula Cloud Maker
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawOrganRig(ctx, S, plates, t, { bellowsAmp: 2.0, customPipeEmit: true, hidePlateTrout: true });

            // Swirling pastel cotton-candy spiral nebulae inflated from the boiler's bubble rings!
            var nebSpecs = [
              { x: 430, y: 185, r: 54, c1: "#f472b6", c2: "#c084fc" },
              { x: 585, y: 150, r: 64, c1: "#38bdf8", c2: "#818cf8" },
              { x: 765, y: 168, r: 58, c1: "#34d399", c2: "#fde047" },
              { x: 915, y: 205, r: 50, c1: "#fb7185", c2: "#f9a8d4" }
            ];
            for (var ni = 0; ni < nebSpecs.length; ni++) {
              var nb = nebSpecs[ni];
              ctx.save();
              ctx.translate(nb.x + Math.sin(t * 1.5 + ni) * 10, nb.y + Math.cos(t * 1.8 + ni) * 8);
              ctx.scale(e, e * 0.68);
              ctx.rotate(t * (ni % 2 === 0 ? 0.8 : -0.7));
              var ng = ctx.createRadialGradient(0, 0, 4, 0, 0, nb.r);
              ng.addColorStop(0, "#ffffff");
              ng.addColorStop(0.45, nb.c1);
              ng.addColorStop(0.85, B.rgba(nb.c2, 0.55));
              ng.addColorStop(1, "rgba(0,0,0,0)");
              ctx.fillStyle = ng;
              ctx.beginPath(); ctx.arc(0, 0, nb.r, 0, TAU); ctx.fill();
              ctx.strokeStyle = "#fbfaf5";
              ctx.lineWidth = 2.2;
              ctx.setLineDash([8, 5]);
              ctx.beginPath(); ctx.arc(0, 0, nb.r * 0.78, 0, TAU); ctx.stroke();
              ctx.setLineDash([]);
              ctx.restore();
            }

            B.drawTractorRings(ctx, 640, 102, 585, 195, t, { spread: 175, rings: 5 });
            S.drawAlienSaucer(ctx, 640, B.lerp(-40, 96, e), 1.20, t, false, false);
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Probable] Patched Submarine Boiler Safety Seal
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawOrganRig(ctx, S, plates, t, { gaugePatched: true });
            S.drawMailSnail(ctx, 378, 488, 1.18, t, { hasReply: false });

            // Magnified calm green-zone safety gauge + emerald stamp highlight
            B.drawLanternHalo(ctx, 430, 465, 95, { color: "#10b981", coreColor: "#d1fae5", intensity: 0.95, t: t });

            // Turkey wiping brow + pinning homemade golden ribbon medal on glass (0 text!)
            S.drawTurkeyCutawayBadge(ctx, 128, 502, 1.06, t, { dispatch: 0.5 });
            ctx.save();
            ctx.translate(242, 452);
            ctx.scale(e, e);
            S.drawCutoutPaperEdge(ctx, [[-18, 10], [-28, 56], [-12, 46], [-2, 58], [4, 10]], "#2563eb", "#14110d", { paperRim: 2 });
            S.drawCutoutPaperEdge(ctx, [[0, 10], [8, 58], [18, 46], [30, 56], [18, 10]], "#d42a1e", "#14110d", { paperRim: 2 });
            drawCutPaperStar(ctx, S, 0, 0, 28, 14, 8, t * 0.4, "#f3d184", 2.8);
            drawCutPaperStar(ctx, S, 0, 0, 14, 6, 5, 0, "#d42a1e", 0);
            ctx.restore();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Plausible] Inspected Riverboat Calliope Permit
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawOrganRig(ctx, S, plates, t, { gaugePatched: true, hidePlateTrout: true });

            // Brass Inspection Certificate Plaque with curly golden spiral signature & emerald checkmark!
            ctx.save();
            ctx.translate(458, 355);
            ctx.scale(e, e);
            S.drawCutoutPaperEdge(ctx, [[-68, -42], [68, -42], [68, 42], [-68, 42]], "#f6e7c1", "#14110d", { paperRim: 3.0 });
            ctx.strokeStyle = "#b45309";
            ctx.lineWidth = 2.4;
            ctx.strokeRect(-58, -32, 116, 64);
            // Curly shell-flourish vector squiggle (0 text!)
            ctx.strokeStyle = "#1d596e";
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.moveTo(-46, 8);
            ctx.bezierCurveTo(-28, -18, -10, 24, 8, -8);
            ctx.bezierCurveTo(22, -24, 34, 16, 46, 2);
            ctx.stroke();
            drawPerforatedStamp(ctx, 38, -14, 24, 20, -0.12, "#0f8f80", "check");
            ctx.restore();

            S.drawMailSnail(ctx, 376, 402, 1.20, t, { hasReply: true });

            // Brook Trout blowing a shiny miniature brass bubble-trumpet alongside the organ pipes!
            var tx = B.lerp(1120, 955, e);
            var ty = 342 + Math.sin(t * 3.0) * 6;
            S.drawBrookTrout(ctx, tx, ty, 1.18, t, false);
            ctx.save();
            ctx.translate(tx - 78, ty - 2);
            ctx.rotate(-0.15 + Math.sin(t * 6.0) * 0.08);
            S.drawCutoutPaperEdge(ctx, [[0, -4], [-46, -18], [-46, 18], [0, 4]], "#f3d184", "#14110d", { paperRim: 2.2 });
            drawCutPaperMusicNote(ctx, -68 - ((t * 45) % 35), -14, 0.78, -0.2, "#0f8f80", false);
            ctx.restore();
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Preposterous Alien Finale] Regulated Terraforming Atmosphere Valve (16.0s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawOrganRig(ctx, S, plates, t, { gaugePatched: true, hidePlateTrout: true });

            // Emerald terraforming stabilizer halo around the stamped pressure gauge
            B.drawLanternHalo(ctx, 430, 465, 130, { color: "#10b981", coreColor: "#fef08a", intensity: 1.25, t: t });

            // Mail Snail proudly guarding the stamped valve
            S.drawMailSnail(ctx, 336, 512, 1.26, t, { hasReply: true, hasAlienStamp: true });

            // Gleaming Miniature Golden Wrench Trophy on Pedestal beamed down right beside Mail Snail!
            var trX = 522;
            var trY = B.lerp(160, 504, e);
            B.drawTractorRings(ctx, 522, 126, trX, trY - 24, t, { spread: 120, rings: 5 });
            ctx.save();
            ctx.translate(trX, trY);
            // Marble/brass trophy plinth
            S.drawCutoutPaperEdge(ctx, [[-34, 0], [34, 0], [40, 26], [-40, 26]], "#475569", "#14110d", { paperRim: 2.5 });
            // Golden wrench upright trophy
            S.drawCutoutPaperEdge(ctx, [[-9, 0], [-9, -58], [9, -58], [9, 0]], "#fbbf24", "#14110d", { paperRim: 2.2 });
            S.drawCutoutPaperEdge(ctx, [
              [-24, -54], [-24, -84], [-9, -84], [-9, -66],
              [9, -66], [9, -84], [24, -84], [24, -54]
            ], "#fde047", "#14110d", { paperRim: 2.5 });
            drawCutPaperStar(ctx, S, 0, -28, 12, 5, 5, t * 1.5, "#ffffff", 0);
            ctx.restore();

            // Astonished 3-eyed Alien Saucer hovering above!
            S.drawAlienSaucer(ctx, 522, B.lerp(-40, 112, e), 1.28, t, false, false);
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Probable] Double Toot Rescue Crew Signal
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            var pulse = Math.abs(Math.sin(t * 5.5));
            drawOrganRig(ctx, S, plates, t, { chainTug: pulse * 0.8, whistleOpen: pulse });
            drawIKTongs(ctx, S, 1120, 560, 845, 465 + pulse * 18, 210, 195, -1, 0.14);

            // Twin heart-shaped bubble puffs popping from the brass whistle cap!
            for (var hp = 0; hp < 3; hp++) {
              var hu = ((t * 0.65 + hp / 3) % 1);
              drawCutPaperHeart(ctx, S, 812 + Math.sin(t * 4 + hp) * 18, B.lerp(255, 95, hu), 0.75 + hu * 0.45, Math.sin(t * 3 + hp) * 0.2, "#fb7185");
            }

            // Festive nautical signal-flag bunting garland unfurled across top-left (0 text!)
            ctx.save();
            ctx.strokeStyle = "#fbfaf5";
            ctx.lineWidth = 3.0;
            ctx.beginPath();
            ctx.moveTo(155, 115);
            ctx.quadraticCurveTo(360, 168, 565 * e + 155 * (1 - e), 108);
            ctx.stroke();
            var flagCols = ["#2563eb", "#facc15", "#d42a1e", "#10b981", "#f97316", "#60a5fa"];
            for (var fi = 0; fi < 6; fi++) {
              var fx = 195 + fi * 58 * e;
              var fy = 124 + Math.sin((fi / 5) * Math.PI) * 24;
              S.drawCutoutPaperEdge(ctx, [[fx - 18, fy], [fx + 18, fy], [fx, fy + 38]], flagCols[fi], "#14110d", { paperRim: 2.0 });
            }
            ctx.restore();

            S.drawTurkeyCutawayBadge(ctx, 130, 502, 1.08, t, { dispatch: 0.9 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Plausible] Noisy Noon Lunchtime Creek Whistle
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            var pulse = Math.abs(Math.sin(t * 4.8));
            drawOrganRig(ctx, S, plates, t, { chainTug: pulse * 0.6, whistleOpen: pulse, hidePlateTrout: true });
            drawIKTongs(ctx, S, 1125, 575, 845, 495 + pulse * 12, 200, 190, -1, 0.16);

            // Hinged red-tin lunchpail flipped open with green clover triangle sandwiches!
            var lbX = 955, lbY = 472;
            ctx.save();
            ctx.translate(lbX, lbY);
            ctx.scale(e, e);
            S.drawCutoutPaperEdge(ctx, [[-48, -18], [48, -18], [44, 34], [-44, 34]], "#dc2626", "#14110d", { paperRim: 3.0 });
            // Open dome lid tilted left
            ctx.save();
            ctx.translate(-48, -18);
            ctx.rotate(-2.1);
            S.drawCutoutPaperEdge(ctx, [[0, 0], [56, -16], [92, 0]], "#b91c1c", "#14110d", { paperRim: 2.2 });
            ctx.restore();
            // Clover sandwiches popping out
            S.drawCutoutPaperEdge(ctx, [[-34, -18], [-4, -46], [22, -18]], "#fef3c7", "#14110d", { paperRim: 2.0 });
            ctx.fillStyle = "#16a34a";
            ctx.beginPath(); ctx.arc(-6, -24, 6, 0, TAU); ctx.arc(4, -24, 6, 0, TAU); ctx.fill();
            ctx.restore();

            // Brook Trout & Mail Snail perched on chain sharing golden lunch wafers!
            S.drawBrookTrout(ctx, 975, 348 + Math.sin(t * 3.2) * 6, 1.16, t, false);
            S.drawMailSnail(ctx, 840, 424, 1.12, t, { hasReply: true });
            drawCutPaperStar(ctx, S, 876, 395, 11, 6, 6, t, "#fde047", 1.8);
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Preposterous] Cosmic Pipe Organ Duet Finale
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawOrganRig(ctx, S, plates, t, {
              chainTug: 0.7,
              whistleOpen: 0.9,
              fastPipes: true,
              pumpAmp: 2.0,
              customPipeEmit: true,
              hidePlateTrout: true
            });
            drawIKTongs(ctx, S, 1120, 560, 845, 480, 210, 195, -1, 0.14);

            // Saucer drops 5 glowing neon rainbow light-pipes from its rim in duet!
            var sy = B.lerp(-40, 104, e);
            var rainbowCols = ["#f43f5e", "#fbbf24", "#34d399", "#38bdf8", "#a855f7"];
            for (var rp = 0; rp < 5; rp++) {
              var rpx = 560 + rp * 40;
              var rLen = (58 + (2 - Math.abs(rp - 2)) * 22 + Math.sin(t * 7 + rp) * 10) * e;
              S.drawCutoutPaperEdge(ctx, [
                [rpx - 10, sy + 14], [rpx + 10, sy + 14],
                [rpx + 10, sy + 14 + rLen], [rpx - 10, sy + 14 + rLen]
              ], rainbowCols[rp], "#fbfaf5", { paperRim: 1.5, shadow: false });

              // Rainbow duet harmonic arcs linking saucer pipes to sunken copper pipes
              ctx.strokeStyle = B.rgba(rainbowCols[rp], 0.65);
              ctx.lineWidth = 3.0;
              ctx.setLineDash([8, 6]);
              ctx.beginPath();
              ctx.moveTo(rpx, sy + 14 + rLen);
              ctx.quadraticCurveTo(rpx + Math.sin(t * 4 + rp) * 34, 225, 640 - 102 + rp * 40, 240);
              ctx.stroke();
              ctx.setLineDash([]);

              drawCutPaperMusicNote(ctx, rpx + Math.sin(t * 5 + rp) * 24, 210 + (rp % 2) * 28, 0.9, Math.sin(t * 4 + rp) * 0.3, rainbowCols[rp], rp % 2 === 0);
            }
            S.drawAlienSaucer(ctx, 640, sy, 1.24, t, false, false);
          }
        }
      }
    });
  })();

  // ==========================================================================
  // PORTHOLE #35 · POST #44 ("cardboard-parallax" · p35.jpg + atlas-04.webp)
  // ==========================================================================
  (function buildPortal35() {
    var B = getBG();
    if (!B) return;

    function drawPostBackdrop(ctx, W, H, resolved, plates, S) {
      var t = resolved.t;
      S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 35, t, makeBackdropState(resolved), { pillarbox: true });

      // Text-free center porthole/rock diagram of atlas-04.webp (1200x440 -> sx:474, sy:90, sw:252, sh:252)
      var aImg = plates.atlasImg;
      var px1 = Math.sin(t * 0.5) * 10;
      S.drawScissorCutout(ctx, aImg, 474, 90, 252, 252, 795 + px1, 62, 275, 275, [
        [0.18, 0.06], [0.82, 0.06], [0.96, 0.50], [0.82, 0.94], [0.18, 0.94], [0.04, 0.50]
      ], {
        filter: resolved.selectedTier === "preposterous" ? "cyan" : "sepia",
        haloWidth: 4.0,
        alpha: 0.72,
        seed: 3501
      });

      // Drowned Old Loyston roadbed & fencepost planes extending cleanly to y=730
      S.drawTornPaperFlat(ctx, 84 + px1 * 0.8, 368, 1112, 135, { fill: "#433d35", paperColor: "#dfd8c8", deckle: 6, seed: 35.1 });
      for (var fp = 0; fp < 6; fp++) {
        var fpx = 185 + fp * 172 + px1 * 1.1;
        drawLinkageBar(ctx, S, fpx, 336, fpx - 8, 466, 6, "#5e5549", { shadow: false });
      }
      S.drawTornPaperFlat(ctx, 84, 462, 1112, 268, { fill: "#2b2722", paperColor: "#e8e1d2", deckle: 6.5, seed: 35.4 });

      B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.18, topY: 50, stageH: 630 });
      B.drawDepthFog(ctx, W, H, t, { density: 0.15, color: "#cbd5e1", stageH: 630 });
    }

    function drawEnvelopeCard(ctx, S, x, y, rot, scale, opts) {
      var cfg = opts || {};
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot || 0);
      ctx.scale(scale || 1, scale || 1);
      S.drawCutoutPaperEdge(ctx, [[-38, -25], [38, -25], [38, 25], [-38, 25]], cfg.fill || "#fbfaf5", cfg.stroke || "#14110d", { paperRim: 3.0 });
      if (cfg.airmail) {
        // Classic red-and-blue airmail border chevrons (0 text!)
        for (var i = -30; i <= 26; i += 14) {
          ctx.fillStyle = ((i + 30) / 14) % 2 === 0 ? "#d42a1e" : "#2563eb";
          ctx.fillRect(i, -23, 8, 4.5);
          ctx.fillRect(i, 18.5, 8, 4.5);
        }
      }
      ctx.strokeStyle = cfg.stroke || "#14110d";
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(-36, -23); ctx.lineTo(0, 5); ctx.lineTo(36, -23);
      ctx.stroke();

      ctx.fillStyle = cfg.sealCol || "#d42a1e";
      ctx.beginPath(); ctx.arc(0, 4, 6.5, 0, TAU); ctx.fill();
      if (cfg.moonStamp) {
        ctx.fillStyle = "#fde047";
        ctx.beginPath(); ctx.arc(20, -8, 8, 0.4, Math.PI * 1.7); ctx.fill();
      }
      ctx.restore();
    }

    function drawPostRig(ctx, S, plates, t, cfg) {
      var c = cfg || {};
      var pImg = plates.portholeImg;
      var boxX = 248;
      var boxY = 122;

      // Scissor-Cut Rural Mailbox on Tilted Post + Spilling Sack from p35.jpg
      S.drawScissorCutout(ctx, pImg, 174, 142, 224, 304, boxX, boxY, 352, 456, [
        [0.06, 0.44], [0.14, 0.08], [0.76, 0.04], [0.92, 0.24],
        [0.98, 0.68], [0.78, 0.84], [0.54, 0.58], [0.42, 0.98], [0.22, 0.96], [0.30, 0.52]
      ], { haloWidth: 5.5, seed: 3504 });

      // PERMANENT BLIND-SAFE TACTILE RFD BADGE covering painted "#44" on mailbox side!
      ctx.save();
      ctx.translate(boxX + 92, boxY + 124);
      ctx.rotate(0.14);
      S.drawCardboardPuppetPiece(ctx, [[-64, -42], [64, -42], [60, 42], [-66, 40]], {
        tone: c.stencilLit ? "#254b6e" : "#567588",
        ribs: 2,
        pins: [[-48, -26], [46, -26], [-48, 26], [46, 26]]
      });
      // Geometric postal eagle-wing chevron + 4+4 brass pips (representing 44 with 0 text!)
      ctx.strokeStyle = c.stencilLit ? "#fde047" : "#f3d184";
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(-36, -12); ctx.lineTo(0, -2); ctx.lineTo(36, -12);
      ctx.stroke();
      for (var d = 0; d < 4; d++) {
        S.drawSplitPin(ctx, -32 + d * 10, 12, 3.2, { metal: "brass" });
        S.drawSplitPin(ctx, 10 + d * 10, 12, 3.2, { metal: "brass" });
      }
      ctx.restore();

      // Canvas 1943 Mail Sack Mouth & Brass Grommet + Hemp Rope Drawstring
      ctx.save();
      ctx.translate(boxX + 235, boxY + 165);
      S.drawCardboardPuppetPiece(ctx, [[-48, -56], [56, -42], [72, 48], [-38, 52]], {
        tone: c.stencilLit ? "#dfd1b4" : "#bfae8e",
        ribs: 3
      });
      if (c.stencilLit) {
        // High-contrast geometric postal chevron crest sharpened by blue beam (0 text!)
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 3.5;
        ctx.strokeRect(-26, -26, 56, 44);
        ctx.beginPath();
        ctx.moveTo(-18, -10); ctx.lineTo(2, 6); ctx.lineTo(22, -10);
        ctx.moveTo(-18, 6);  ctx.lineTo(22, 6);
        ctx.stroke();
      }
      // Heavy brass grommet & hemp rope loop (Anchor □ side)
      var ropeOpen = c.ropeOpen || 0;
      S.drawReinigerFiligreeHinge(ctx, 54, 4, 9.5, { metal: "brass" });
      ctx.strokeStyle = "#d6c299";
      ctx.lineWidth = 5.0;
      ctx.beginPath();
      ctx.moveTo(54, 4);
      ctx.quadraticCurveTo(95 + ropeOpen * 35, 32 - ropeOpen * 24, 145 + ropeOpen * 45, 76 + ropeOpen * 18);
      ctx.stroke();
      ctx.restore();

      // Hinged Crimson Tin Mailbox Signal Flag (Anchor △: flips from horizontal to vertical upright!)
      var flagUp = c.flagUp || 0; // 0 = horizontal down, 1 = 90° upright!
      var flagAng = B.lerp(1.48, 0.0, flagUp) + Math.sin(t * 3.6) * 0.03;
      ctx.save();
      ctx.translate(boxX + 186, boxY + 268);
      ctx.rotate(flagAng);
      S.drawCutoutPaperEdge(ctx, [
        [-7, 8], [-7, -124], [44, -124], [32, -98], [44, -74], [9, -74], [9, 8]
      ], "#d42a1e", "#14110d", { paperRim: 3.2 });
      S.drawSplitPin(ctx, 0, 0, 5.5, { metal: "brass" });
      ctx.restore();

      // Default floating letters unless overridden
      if (!c.customLetters) {
        var baseSlots = [
          [605, 275, -0.16],
          [715, 328, 0.14],
          [825, 282, -0.10],
          [765, 412, 0.18]
        ];
        for (var i = 0; i < baseSlots.length; i++) {
          var su = c.suctionAmt || 0;
          var lx = B.lerp(baseSlots[i][0] + Math.sin(t * 2 + i) * 12, 995, su);
          var ly = B.lerp(baseSlots[i][1] + Math.cos(t * 2.3 + i) * 9, 250 + i * 62, su);
          var lrot = B.lerp(baseSlots[i][2], 0.04 * (i - 1.5), su);
          drawEnvelopeCard(ctx, S, lx, ly, lrot, 1.0, { airmail: su > 0.2 });
        }
      }

      if (!c.hidePlateTrout) {
        S.drawScissorCutout(ctx, pImg, 408, 252, 136, 98, 910 + Math.sin(t * 1.9) * 14, 290 + Math.cos(t * 2.2) * 8, 210, 150, [
          [0.02, 0.56], [0.34, 0.16], [0.62, 0.12], [0.96, 0.04],
          [0.98, 0.94], [0.68, 0.88], [0.28, 0.82]
        ], { haloWidth: 4.2, seed: 3509 });
      }
    }

    B.definePortalGame(35, {
      drawBackdrop: drawPostBackdrop,

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawPostRig(ctx, S, plates, t, {});
        drawHotspotShimmer(ctx, B, t, resolved.tree.buttons);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawPostRig(ctx, S, plates, t, { stencilLit: true });
          B.drawVolumetricBeam(ctx, 145, 560, 455, 280, {
            color: "#3b82f6",
            coreColor: "#fef08a",
            spread: 145 * u + 25,
            intensity: 1.3 * u,
            t: t
          });
          B.drawLanternHalo(ctx, 480, 285, 110 * u, { color: "#60a5fa", coreColor: "#fef9c3", t: t });
          B.drawDeterministicParticles(ctx, "kintsugi", 420, 275, resolved.stemT, { count: 18, loop: true, seed: 35.1 });
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          // Sub intake brass screen grate on right
          S.drawCardboardPuppetPiece(ctx, [[1028, 195], [1092, 195], [1092, 455], [1028, 455]], {
            tone: "#64748b",
            ribs: 6,
            pins: [[1042, 212], [1042, 438]]
          });
          drawWaterJetStream(ctx, B, 680, 315, 1028, 320, t, u, "#f87171");
          drawPostRig(ctx, S, plates, t, { suctionAmt: u, hidePlateTrout: true });
          B.drawDeterministicParticles(ctx, "bubbles", 940, 310, resolved.stemT, { count: 22, loop: true, seed: 35.2 });
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawPostRig(ctx, S, plates, t, { flagUp: u });
          B.drawSnailSilverTrail(ctx, 220, 540, 428, 392, u, t, { arc: 24 });
          S.drawMailSnail(ctx, B.lerp(220, 412, u), B.lerp(540, 398, u), 1.24, t, { rot: -0.35 * u });
          if (u > 0.7) {
            drawCutPaperStar(ctx, S, 434, 258, 18, 8, 6, t * 2, "#fbbf24", 2.0);
          }
          B.drawDeterministicParticles(ctx, "snail_trail", 430, 390, resolved.stemT, { count: 16, loop: true, seed: 35.3 });
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawPostRig(ctx, S, plates, t, { ropeOpen: u, hidePlateTrout: true });
          drawIKTongs(ctx, S, 1110, 560, B.lerp(960, 565, u), B.lerp(490, 310, u), 290, 280, -1, 0.16 + u * 0.24);
          // Freed ribbon-tied packet emerging from loosened sack!
          if (u > 0.35) {
            var pu = (u - 0.35) / 0.65;
            var px = B.lerp(530, 725, pu);
            var py = B.lerp(295, 245, pu);
            drawEnvelopeCard(ctx, S, px, py, -0.12, 1.12, { fill: "#fef3c7", sealCol: "#d42a1e" });
            ctx.strokeStyle = "#d42a1e";
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.moveTo(px - 42, py); ctx.lineTo(px + 42, py);
            ctx.moveTo(px, py - 28); ctx.lineTo(px, py + 28);
            ctx.stroke();
          }
          B.drawDeterministicParticles(ctx, "brass_sparks", 565, 310, resolved.stemT, { count: 18, loop: true, seed: 35.4 });
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Probable] Bag Of Crew Dirty Laundry (6.0s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawPostRig(ctx, S, plates, t, { stencilLit: true, customLetters: true, hidePlateTrout: true });
            B.drawVolumetricBeam(ctx, 150, 540, 540, 290, { color: "#3b82f6", coreColor: "#fef08a", spread: 175, intensity: 1.1, t: t });

            // Sagging clothesline cord with striped crew socks, undershirts & wooden clothespins!
            ctx.strokeStyle = "#fbfaf5";
            ctx.lineWidth = 3.4;
            ctx.beginPath();
            ctx.moveTo(495, 255);
            ctx.quadraticCurveTo(770, 345, 1085, 225);
            ctx.stroke();

            var items = [
              { x: 595, y: 295, sock: true },
              { x: 715, y: 318, sock: false },
              { x: 845, y: 306, sock: true },
              { x: 965, y: 274, sock: false }
            ];
            for (var i = 0; i < items.length; i++) {
              var it = items[i];
              ctx.save();
              ctx.translate(it.x, it.y);
              ctx.rotate(Math.sin(t * 2.8 + i) * 0.14);
              ctx.scale(e, e);
              if (it.sock) {
                S.drawCutoutPaperEdge(ctx, [[-16, -24], [12, -24], [12, 12], [32, 24], [24, 38], [-14, 24]], "#e5dfd0", "#14110d", { paperRim: 2.8 });
                ctx.strokeStyle = "#d42a1e"; ctx.lineWidth = 4;
                ctx.beginPath(); ctx.moveTo(-14, -12); ctx.lineTo(10, -12); ctx.stroke();
              } else {
                S.drawCutoutPaperEdge(ctx, [[-34, -20], [-14, -24], [14, -24], [34, -20], [26, -2], [18, -4], [20, 32], [-20, 32], [-18, -4], [-26, -2]], "#fbfaf5", "#14110d", { paperRim: 2.8 });
              }
              S.drawCardboardPuppetPiece(ctx, [[-5, -38], [5, -38], [4, -16], [-4, -16]], { tone: "#c49a5b", shadow: false });
              drawPaperBubble(ctx, 22, -22 - ((t * 28 + i * 9) % 34), 6.5, "rgba(224, 242, 254, 0.85)");
              ctx.restore();
            }

            // Turkey holding its beak shut with an oversized wooden clothespin!
            S.drawTurkeyCutawayBadge(ctx, 136, 504, 1.08, t, { dispatch: 0.2 });
            ctx.save();
            ctx.translate(164, 492);
            ctx.rotate(0.25);
            S.drawCutoutPaperEdge(ctx, [[-8, -28], [8, -28], [6, 14], [1, 14], [0, 2], [-1, 14], [-6, 14]], "#d9a23d", "#14110d", { paperRim: 2.2 });
            S.drawSplitPin(ctx, 0, -4, 3.6, { metal: "silver" });
            ctx.restore();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Plausible] Caught Porch Pirate Mail Thief
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawPostRig(ctx, S, plates, t, { stencilLit: true, hidePlateTrout: true });

            // Bright blue police-style spotlight catching Brook Trout nose-deep by the sack!
            B.drawVolumetricBeam(ctx, 150, 560, 650, 320, { color: "#60a5fa", coreColor: "#ffffff", spread: 155, intensity: 1.45, t: t });

            var tx = B.lerp(920, 685, e);
            var ty = 324 + Math.sin(t * 8.0) * 2.5;
            S.drawBrookTrout(ctx, tx, ty, 1.18, t, false);
            // Both pectoral fins raised high in innocent "hands up!" pose + sweat drop!
            S.drawCardboardPuppetPiece(ctx, [[tx - 46, ty - 6], [tx - 58, ty - 48], [tx - 38, ty - 52], [tx - 30, ty - 8]], { tone: "#b87458", pin: { x: tx - 38, y: ty - 8, r: 3.5, metal: "brass" } });
            S.drawCardboardPuppetPiece(ctx, [[tx - 24, ty - 6], [tx - 28, ty - 46], [tx - 10, ty - 48], [tx - 10, ty - 8]], { tone: "#b87458", pin: { x: tx - 18, y: ty - 8, r: 3.5, metal: "brass" } });
            drawPaperBubble(ctx, tx - 64, ty - 34 + ((t * 32) % 18), 4.8, "#bae6fd");

            // Mail Snail narrowing suspicious slanted eyestalk brows!
            S.drawMailSnail(ctx, 488, 495, 1.28, t, { hasReply: true });
            ctx.strokeStyle = "#14110d";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(506, 470); ctx.lineTo(526, 476);
            ctx.restore && ctx.stroke();
            ctx.stroke();
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Preposterous] Classified Sector Forty Four Drop
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawPostRig(ctx, S, plates, t, { stencilLit: true, hidePlateTrout: true });

            // Origami radar dish antennas unfolding from top of Rural Box #44!
            var dishX = 418, dishY = 148;
            ctx.save();
            ctx.translate(dishX, dishY);
            ctx.scale(e, e);
            drawLinkageBar(ctx, S, 0, 22, 0, -48, 5, "#f3d184", { pinStart: true, pinEnd: true });
            S.drawCutoutPaperEdge(ctx, [[-56, -42], [-22, -74], [22, -74], [56, -42], [0, -34]], "#34d399", "#14110d", { paperRim: 2.5 });
            for (var r = 0; r < 3; r++) {
              var ru = ((t * 0.75 + r / 3) % 1);
              drawBubbleRing(ctx, 0, -68 - ru * 45, 22 + ru * 55, 8 + ru * 18, 1 - ru, "#f59e0b");
            }
            ctx.restore();

            // Emerald cipher grid around mailbox badge
            B.drawXRayOverlay(ctx, 345, 246, 165, 118, e, function (g, cx, cy) {
              g.strokeStyle = "#f59e0b";
              g.lineWidth = 2.6;
              g.strokeRect(cx - 54, cy - 34, 108, 68);
              for (var k = 0; k < 4; k++) {
                g.fillStyle = "#fde047";
                g.beginPath();
                g.arc(cx - 32 + k * 14, cy, 4, 0, TAU);
                g.arc(cx + 18 + k * 10, cy, 4, 0, TAU);
                g.fill();
              }
            }, { t: t, borderColor: "#10b981", bg: "rgba(6, 46, 36, 0.78)" });

            B.drawTractorRings(ctx, 760, 104, 418, 190, t, { spread: 145, rings: 5 });
            S.drawAlienSaucer(ctx, 760, B.lerp(-40, 96, e), 1.22, t, false, false);
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Probable] Rescued Secret Submarine Mission Orders
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            S.drawCardboardPuppetPiece(ctx, [[1020, 190], [1092, 190], [1092, 460], [1020, 460]], { tone: "#64748b", ribs: 6 });
            drawPostRig(ctx, S, plates, t, { suctionAmt: 1.0, hidePlateTrout: true });

            // Turkey snapping crisp wing salute + spinning a dual-ring cereal-box cipher wheel (0 text!)
            S.drawTurkeyCutawayBadge(ctx, 134, 502, 1.08, t, { dispatch: 0.92 });
            ctx.save();
            ctx.translate(274, 476);
            ctx.scale(e, e);
            drawGearWheel(ctx, S, 0, 0, 48, 12, t * 0.9, "#d9a23d");
            drawGearWheel(ctx, S, 0, 0, 30, 8, -t * 1.5, "#1d596e");
            drawCutPaperStar(ctx, S, 0, 0, 14, 6, 5, 0, "#fbfaf5", 0);
            ctx.restore();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Plausible + Snail Mail] Sneaky Vacuum Porch Pirate Sub (11.8s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            S.drawCardboardPuppetPiece(ctx, [[1035, 195], [1095, 195], [1095, 455], [1035, 455]], { tone: "#64748b", ribs: 6 });
            drawWaterJetStream(ctx, B, 740, 305, 1035, 305, t, 1.0, "#ef4444");
            drawPostRig(ctx, S, plates, t, { customLetters: true, hidePlateTrout: true });

            // Tug-of-war airmail envelope stretched between sub suction and Brook Trout!
            var tugOsc = Math.sin(t * 7.5) * 16;
            drawEnvelopeCard(ctx, S, 760 + tugOsc, 312, -0.08, 1.22, { airmail: true });
            drawEnvelopeCard(ctx, S, 985, 238, 0.08, 0.95, { airmail: true });

            // Brook Trout wearing black-and-white striped referee cap, blowing whistle & tugging mail back!
            var tx = 865 + tugOsc;
            var ty = 322;
            S.drawBrookTrout(ctx, tx, ty, 1.18, t, false);
            // Striped referee cap
            S.drawCutoutPaperEdge(ctx, [[tx - 62, ty - 22], [tx - 24, ty - 22], [tx - 28, ty - 38], [tx - 58, ty - 38]], "#fbfaf5", "#14110d", { paperRim: 1.8, shadow: false });
            ctx.fillStyle = "#14110d";
            ctx.fillRect(tx - 52, ty - 37, 6, 15);
            ctx.fillRect(tx - 38, ty - 37, 6, 15);
            // Silver pea-whistle + sound rings
            drawPaperBubble(ctx, tx - 78, ty - 4, 7.5, "#cbd5e1");
            drawBubbleRing(ctx, tx - 98, ty - 12, 12 + ((t * 24) % 18), 8 + ((t * 16) % 12), 0.75, "#fbbf24");

            // Mail Snail holding up an indignant slate with red prohibition symbol (⊘ over vacuum nozzle, 0 text!)
            S.drawMailSnail(ctx, 595, 508, 1.24, t, { hasReply: true });
            ctx.save();
            ctx.translate(662, 466);
            ctx.scale(e, e);
            S.drawCutoutPaperEdge(ctx, [[-42, -32], [42, -32], [42, 32], [-42, 32]], "#1e293b", "#d4a44c", { paperRim: 2.5 });
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, TAU);
            ctx.moveTo(-14, -14); ctx.lineTo(14, 14);
            ctx.stroke();
            ctx.restore();
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Preposterous] Time Warped Dead Letter Vortex
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawPostRig(ctx, S, plates, t, { customLetters: true, hidePlateTrout: true });

            var sy = B.lerp(-40, 98, e);
            B.drawTractorRings(ctx, 735, sy + 18, 735, 480, t, { spread: 185, rings: 6 });

            // Swirling sepia biplane postcards spiraling up & holographic moon-stamped cards fluttering down!
            for (var vc = 0; vc < 6; vc++) {
              var vu = ((t * 0.36 + vc / 6) % 1);
              var ang = vu * TAU * 2 + vc;
              var vx = 735 + Math.cos(ang) * (135 * Math.sin(vu * Math.PI) + 28);
              var vy = B.lerp(465, 145, vu);
              if (vc % 2 === 0) {
                // Vintage sepia biplane silhouette postcard (0 text!)
                ctx.save();
                ctx.translate(vx, vy);
                ctx.rotate(Math.sin(t * 3 + vc) * 0.25);
                S.drawCutoutPaperEdge(ctx, [[-34, -22], [34, -22], [34, 22], [-34, 22]], "#e7d8b9", "#14110d", { paperRim: 2.4 });
                ctx.fillStyle = "#5c4028";
                ctx.fillRect(-20, -8, 40, 4);
                ctx.fillRect(-16, 4, 32, 4);
                ctx.fillRect(-4, -10, 8, 20);
                ctx.restore();
              } else {
                drawEnvelopeCard(ctx, S, vx, vy, -Math.sin(t * 3 + vc) * 0.25, 0.95, { fill: "#ede9fe", stroke: "#6d28d9", sealCol: "#0f8f80", moonStamp: true });
              }
            }
            S.drawAlienSaucer(ctx, 735, sy, 1.24, t, false, false);
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Probable] All Clear Signal At Post
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawPostRig(ctx, S, plates, t, { flagUp: 1.0 });
            B.drawLanternHalo(ctx, 434, 275, 95, { color: "#10b981", coreColor: "#bbf7d0", intensity: 1.1, t: t });
            S.drawMailSnail(ctx, 412, 404, 1.18, t, { hasReply: false });

            // Turkey ringing brass engine-room telegraph (pure sector dial, 0 text!) + confetti!
            S.drawTurkeyCutawayBadge(ctx, 134, 502, 1.08, t, { dispatch: 0.8 });
            ctx.save();
            ctx.translate(258, 488);
            ctx.scale(e, e);
            drawLinkageBar(ctx, S, 0, 0, 0, 58, 8, "#b45309", { shadow: false });
            drawPaperBubble(ctx, 0, -14, 34, "#fbfaf5");
            ctx.fillStyle = "#10b981";
            ctx.beginPath(); ctx.moveTo(0, -14); ctx.arc(0, -14, 28, -Math.PI * 0.85, -Math.PI * 0.15); ctx.closePath(); ctx.fill();
            var telAng = -Math.PI * 0.45 + Math.sin(t * 6) * 0.14;
            drawLinkageBar(ctx, S, 0, -14, Math.cos(telAng) * 44, -14 + Math.sin(telAng) * 44, 4.5, "#d42a1e", { pinStart: true });
            ctx.restore();
            B.drawDeterministicParticles(ctx, "confetti", 434, 280, resolved.outcomeT, { count: 22, loop: true, seed: 35.7 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Plausible] Official Creek Mail Truck Pickup
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawPostRig(ctx, S, plates, t, { flagUp: 1.0, hidePlateTrout: true });

            // Brook Trout trotting proudly like a postal pony with canvas mailbag saddle & Mail Snail riding!
            var trotX = 795 + Math.sin(t * 2.2) * 38;
            var trotY = 368 - Math.abs(Math.sin(t * 6.8)) * 16;
            var trotTilt = Math.cos(t * 6.8) * 0.08;
            S.drawBrookTrout(ctx, trotX, trotY, 1.28 * e, t, false, { tilt: trotTilt });

            // Canvas mailbag saddle & kelp reins (0 text!)
            ctx.save();
            ctx.translate(trotX, trotY);
            ctx.rotate(trotTilt);
            S.drawCardboardPuppetPiece(ctx, [[-22, -24], [26, -24], [32, 18], [-26, 18]], {
              tone: "#c99a52",
              ribs: 2,
              pins: [[-12, 8], [16, 8]]
            });
            // Kelp reins from snout to rider Mail Snail
            ctx.strokeStyle = "#15803d";
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.moveTo(-68, -2);
            ctx.quadraticCurveTo(-38, -42, -8, -42);
            ctx.stroke();
            S.drawMailSnail(ctx, 4, -38, 1.08, t, { flip: true, hasReply: true, trail: false });
            ctx.restore();
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Preposterous Alien Finale] Activated Galactic Beacon Number 44 (16.0s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawPostRig(ctx, S, plates, t, { flagUp: 1.0, hidePlateTrout: true });

            // Vertical beacon pulse shooting from upright red tin flag!
            B.drawVolumetricBeam(ctx, 434, 268, 720, 108, { color: "#ef4444", coreColor: "#fef08a", spread: 90, intensity: 1.2, t: t });

            // Saucer flashing alternating red & blue postal carrier strobes!
            var sy = B.lerp(-40, 104, e);
            var strobeFlip = Math.sin(t * 14) > 0;
            B.drawLanternHalo(ctx, 665, sy, 95, { color: strobeFlip ? "#2563eb" : "#ef4444", intensity: 1.35, t: t });
            B.drawLanternHalo(ctx, 775, sy, 95, { color: strobeFlip ? "#ef4444" : "#2563eb", intensity: 1.35, t: t });
            B.drawTractorRings(ctx, 720, sy + 18, 720, 445, t, { spread: 135, rings: 5 });
            S.drawAlienSaucer(ctx, 720, sy, 1.26, t, false, false);

            // Waterproof Zip-Code Directory book (with colorful geometric index tabs, 0 text!) beamed down!
            var bkY = B.lerp(180, 438, e) + Math.sin(t * 3.2) * 6;
            ctx.save();
            ctx.translate(720, bkY);
            S.drawCutoutPaperEdge(ctx, [[-48, -34], [48, -34], [54, 34], [-42, 34]], "#1d4ed8", "#14110d", { paperRim: 3.0 });
            S.drawCutoutPaperEdge(ctx, [[-38, -26], [42, -26], [46, 26], [-34, 26]], "#fbfaf5", "#14110d", { paperRim: 0, shadow: false });
            var tabCols = ["#ef4444", "#fbbf24", "#10b981", "#8b5cf6"];
            for (var tb = 0; tb < 4; tb++) {
              ctx.fillStyle = tabCols[tb];
              ctx.fillRect(42, -22 + tb * 12, 12, 9);
            }
            drawCutPaperStar(ctx, S, 2, 0, 16, 7, 5, t * 0.8, "#fbbf24", 1.5);
            ctx.restore();

            // Fellow courier Mail Snail saluting on Box #44!
            S.drawMailSnail(ctx, 412, 398, 1.24, t, { hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Probable] Unsealed Bundle Of Victory Recipes
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawPostRig(ctx, S, plates, t, { ropeOpen: 1.0, hidePlateTrout: true });
            drawIKTongs(ctx, S, 1120, 560, 620, 350, 290, 270, -1, 0.25);

            // Ribbon-tied 1943 Recipe Card displaying a steaming lattice Apple Pie illustration (0 text!)
            ctx.save();
            ctx.translate(755, 278 + Math.sin(t * 2.5) * 6);
            ctx.scale(e, e);
            S.drawCutoutPaperEdge(ctx, [[-92, -68], [92, -68], [92, 68], [-92, 68]], "#fef9c3", "#14110d", { paperRim: 4.0 });
            // Golden lattice pie crust in tin pan
            S.drawCutoutPaperEdge(ctx, [[-56, 12], [56, 12], [42, 42], [-42, 42]], "#94a3b8", "#14110d", { paperRim: 1.5, shadow: false });
            S.drawCutoutPaperEdge(ctx, [[-58, 12], [-40, -14], [0, -22], [40, -14], [58, 12]], "#d97706", "#14110d", { paperRim: 1.5, shadow: false });
            ctx.strokeStyle = "#fef3c7"; ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.moveTo(-32, -8); ctx.lineTo(24, 10);
            ctx.moveTo(32, -8);  ctx.lineTo(-24, 10);
            ctx.stroke();
            // Red apple icon + green leaf in corner
            ctx.fillStyle = "#dc2626";
            ctx.beginPath(); ctx.arc(58, -36, 13, 0, TAU); ctx.fill();
            ctx.fillStyle = "#16a34a";
            ctx.beginPath(); ctx.ellipse(64, -50, 7, 4, -0.5, 0, TAU); ctx.fill();
            ctx.restore();

            // Starry-eyed Turkey wearing white French chef toque!
            S.drawTurkeyCutawayBadge(ctx, 136, 504, 1.08, t, { dispatch: 0.7 });
            S.drawCutoutPaperEdge(ctx, [[110, 444], [156, 444], [164, 412], [133, 402], [102, 412]], "#fbfaf5", "#14110d", { paperRim: 2.2 });
            drawCutPaperStar(ctx, S, 188, 466, 12, 5, 5, t * 2, "#fde047", 1.5);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Plausible] Returned Lost Old Loyston Postcards
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawPostRig(ctx, S, plates, t, { ropeOpen: 1.0, customLetters: true, hidePlateTrout: true });

            // Sepia postcards of Old Loyston's covered bridge floating toward Mail Snail's pouch!
            for (var pc = 0; pc < 3; pc++) {
              var px = 585 + pc * 108 + Math.sin(t * 2.2 + pc) * 10;
              var py = 265 + (pc % 2) * 58 + Math.cos(t * 2.6 + pc) * 8;
              ctx.save();
              ctx.translate(px, py);
              ctx.rotate((pc - 1) * 0.12);
              ctx.scale(e, e);
              S.drawCutoutPaperEdge(ctx, [[-44, -28], [44, -28], [44, 28], [-44, 28]], "#efe2c6", "#14110d", { paperRim: 2.8 });
              // Illustrated wooden covered bridge over blue creek (0 text!)
              ctx.fillStyle = "#38bdf8";
              ctx.fillRect(-38, 8, 76, 14);
              S.drawCutoutPaperEdge(ctx, [[-32, 8], [-32, -8], [0, -20], [32, -8], [32, 8]], "#92400e", "#14110d", { paperRim: 0, shadow: false });
              ctx.restore();
            }

            S.drawBrookTrout(ctx, 975, 322 + Math.sin(t * 2.8) * 7, 1.16, t, false);
            S.drawMailSnail(ctx, 845, 495, 1.28, t, { flip: true, hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Preposterous] Opened Time Capsule Spy Pouch
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawPostRig(ctx, S, plates, t, { ropeOpen: 1.0, customLetters: true, hidePlateTrout: true });

            var rx = 745, ry = 315 + Math.sin(t * 3.0) * 10;
            var sy = B.lerp(-40, 98, e);
            B.drawTractorRings(ctx, 745, sy + 18, rx, ry, t, { spread: 160, rings: 5 });

            // Giant glowing cyan wireframe hyperdrive blueprint rings around the dime-store tin rocket!
            ctx.save();
            ctx.translate(rx, ry);
            ctx.scale(e, e);
            ctx.strokeStyle = "rgba(56, 189, 248, 0.78)";
            ctx.lineWidth = 2.0;
            ctx.setLineDash([7, 5]);
            ctx.beginPath(); ctx.arc(0, 0, 108, 0, TAU); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(0, 0, 128, 46, t * 0.7, 0, TAU); ctx.stroke();
            ctx.setLineDash([]);

            // Retro red-and-silver Cracker Jack tin toy rocket!
            ctx.rotate(-0.35 + Math.sin(t * 2.4) * 0.08);
            S.drawCutoutPaperEdge(ctx, [[-28, 36], [-48, 56], [-18, 46]], "#dc2626", "#14110d", { paperRim: 2 });
            S.drawCutoutPaperEdge(ctx, [[28, 36], [48, 56], [18, 46]], "#dc2626", "#14110d", { paperRim: 2 });
            S.drawCutoutPaperEdge(ctx, [[-24, 42], [-22, -24], [0, -64], [22, -24], [24, 42]], "#cbd5e1", "#14110d", { paperRim: 3.2 });
            S.drawCutoutPaperEdge(ctx, [[-16, -24], [0, -64], [16, -24]], "#dc2626", "#14110d", { paperRim: 0, shadow: false });
            drawPaperBubble(ctx, 0, 4, 10, "#38bdf8");
            ctx.restore();

            S.drawAlienSaucer(ctx, 745, sy, 1.24, t, false, false);
          }
        }
      }
    });
  })();

  // ==========================================================================
  // PORTHOLE #36 · BENCH ("daumier-litho" · p36.jpg + atlas-15.webp)
  // ==========================================================================
  (function buildPortal36() {
    var B = getBG();
    if (!B) return;

    var BAND_TOP = 96;
    var BAND_BOT = 588;

    function drawBenchBackdrop(ctx, W, H, resolved, plates, S) {
      var t = resolved.t;
      S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 36, t, makeBackdropState(resolved), {
        bandTop: BAND_TOP,
        bandBot: BAND_BOT
      });

      // Zeman 19th-century engraved margin rules & crosshatch (dresses y=590..720 cleanly in blind mode!)
      ctx.save();
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2.2;
      ctx.strokeRect(36, 20, W - 72, 62);
      ctx.strokeRect(36, BAND_BOT + 14, W - 72, H - BAND_BOT - 30);
      S.drawEngravingCrosshatch(ctx, W - 84, 50, 0.12, 6, { x: 42, y: 26 });
      S.drawEngravingCrosshatch(ctx, W - 84, H - BAND_BOT - 42, 0.14, 6, { x: 42, y: BAND_BOT + 20 });
      var corners = [[56, 51], [W - 56, 51], [56, BAND_BOT + 54], [W - 56, BAND_BOT + 54]];
      for (var ci = 0; ci < corners.length; ci++) {
        S.drawReinigerFiligreeHinge(ctx, corners[ci][0], corners[ci][1], 7.2, { metal: "silver" });
      }
      ctx.restore();

      // Inside wide ink-black cinema band
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, BAND_TOP, W, BAND_BOT - BAND_TOP);
      ctx.clip();

      S.drawEngravingCrosshatch(ctx, W, 165, 0.12, 9, { x: 0, y: BAND_TOP + 8, color: "#fbfaf5" });

      var aImg = plates.atlasImg; // atlas-15.webp (740x416, Zeman bubble columns & Victorian witness)
      var px = Math.sin(t * 0.5) * 8;
      if (resolved.selectedTier === "preposterous") {
        S.drawScissorCutout(ctx, aImg, 88, 0, 210, 416, 86 + px, BAND_TOP + 12, 225, 465, null, { filter: "litho", haloWidth: 4.0 });
        S.drawScissorCutout(ctx, aImg, 88, 0, 210, 416, 968 - px, BAND_TOP + 12, 225, 465, null, { filter: "litho", haloWidth: 4.0 });
      } else {
        S.drawScissorCutout(ctx, aImg, 285, 0, 365, 225, 118 + px, BAND_TOP + 18, 390, 210, null, {
          filter: "litho", haloWidth: 3.8, alpha: 0.72
        });
      }
      B.drawWaterCaustics(ctx, W, BAND_BOT, t, { intensity: 0.16, topY: BAND_TOP + 12, stageH: BAND_BOT });
      ctx.restore();
    }

    function drawBenchHoundRig(ctx, S, plates, t, cfg) {
      var c = cfg || {};
      var pImg = plates.portholeImg;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, BAND_TOP, 1280, BAND_BOT - BAND_TOP);
      ctx.clip();

      // Slatted Park Bench Cutout from p36.jpg behind hound
      if (!c.hideBench) {
        S.drawScissorCutout(ctx, pImg, 146, 212, 315, 172, 305, 238, 620, 250, [
          [0.03, 0.08], [0.50, 0.04], [0.96, 0.10], [0.98, 0.94], [0.02, 0.95]
        ], { filter: "litho", haloWidth: 5.0 });
      }

      // Creek stones left & right (cropped strictly above bottom-left turkey reflection!)
      S.drawScissorCutout(ctx, pImg, 114, 248, 96, 118, 135, 398, 195, 168, null, { filter: "litho", haloWidth: 4.2 });
      S.drawScissorCutout(ctx, pImg, 402, 348, 112, 134, 925, 392, 198, 174, null, { filter: "litho", haloWidth: 4.2 });

      if (c.extraBehind) c.extraBehind(ctx);

      // Stone Plinth + Cast-Iron Hound Statue Cutout at Center
      var hx = 505, hy = 184, hw = 268, hh = 356;
      S.drawCutoutPaperEdge(ctx, [
        [hx - 28, hy + hh - 16], [hx + hw + 28, hy + hh - 16],
        [hx + hw + 44, hy + hh + 28], [hx - 44, hy + hh + 28]
      ], "#d9d5cb", "#0b0c0e", { paperRim: 4.5 });
      S.drawEngravingCrosshatch(ctx, hw + 50, 34, 0.35, 6, { x: hx - 25, y: hy + hh - 12 });

      // Articulated Split-Pin Iron Hound Tail
      var tailAng = c.tailUp ? (-0.75 + Math.sin(t * 7) * 0.1) : (Math.sin(t * (c.tailFast ? 9.5 : 3.2)) * 0.24);
      ctx.save();
      ctx.translate(hx + 38, hy + 245);
      ctx.rotate(tailAng);
      S.drawCardboardPuppetPiece(ctx, [
        [6, 10], [-36, -24], [-46, -88], [-26, -100], [-12, -44], [14, -4]
      ], { tone: "#b8b3a8", stroke: "#0b0c0e", ribs: 2, pin: { x: 2, y: 0, r: 4.6, metal: "brass" } });
      if (c.tailFlag) {
        S.drawCutoutPaperEdge(ctx, [[-38, -96], [-38, -124], [-8, -110]], "#d42a1e", "#0b0c0e", { paperRim: 2 });
      }
      ctx.restore();

      S.drawScissorCutout(ctx, pImg, 212, 166, 214, 298, hx, hy, hw, hh, [
        [0.34, 0.04], [0.64, 0.03], [0.78, 0.14], [0.79, 0.27],
        [0.98, 0.25], [0.99, 0.52], [0.74, 0.56], [0.76, 0.96],
        [0.20, 0.97], [0.06, 0.78], [0.14, 0.50], [0.24, 0.30], [0.22, 0.16]
      ], { filter: "litho", haloWidth: 5.5, haloColor: "#fbfaf5", stroke: "#0b0c0e", lineWidth: 2.0 });

      // Handmade Cut-Paper Envelope & Wax Seal Clamped in Hound's Jaws
      var envFlap = c.envFlap ? Math.sin(t * 16) * 0.32 : 0;
      var envTilt = (c.envDrop ? 0.38 : -0.09) + envFlap;
      ctx.save();
      ctx.translate(hx + 188, hy + 126 + (c.envDrop ? 22 : 0));
      ctx.rotate(envTilt);
      var envFill = c.goldEnvelope ? "#fbbf24" : "#fbfaf5";
      S.drawCutoutPaperEdge(ctx, [[-64, -38], [64, -38], [68, 38], [-60, 38]], envFill, "#0b0c0e", { paperRim: 3.0 });
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-62, -36); ctx.lineTo(2, 6); ctx.lineTo(62, -36);
      ctx.stroke();

      if (c.pardonRibbons) {
        S.drawCutoutPaperEdge(ctx, [[-8, 8], [-24, 58], [-10, 50], [0, 60], [6, 12]], "#d4a44c", "#0b0c0e", { paperRim: 1.5, shadow: false });
        S.drawCutoutPaperEdge(ctx, [[4, 8], [16, 60], [24, 50], [36, 56], [16, 8]], "#d42a1e", "#0b0c0e", { paperRim: 1.5, shadow: false });
      }

      // Crimson / Gold Wax Seal + Embossed Acorn-and-Feather Crest (0 text!)
      var sealR = c.sealWarm ? 22 : 16;
      ctx.fillStyle = c.goldEnvelope ? "#0f8f80" : "#b81d18";
      ctx.strokeStyle = "#0b0c0e";
      ctx.lineWidth = 2.0;
      ctx.beginPath(); ctx.arc(3, 5, sealR, 0, TAU); ctx.fill(); ctx.stroke();

      if (c.sealWarm) {
        // Golden embossed feather & acorn silhouette inside warm wax seal!
        ctx.strokeStyle = "#fde047";
        ctx.fillStyle = "#fde047";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-8, 12); ctx.quadraticCurveTo(2, -10, 12, -6);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(4, 9, 4.5, 0, TAU); ctx.fill();
      }
      ctx.restore();

      if (c.extraFront) c.extraFront(ctx, hx, hy);
      ctx.restore();
    }

    B.definePortalGame(36, {
      drawBackdrop: drawBenchBackdrop,

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawBenchHoundRig(ctx, S, plates, t, {});
        drawHotspotShimmer(ctx, B, t, resolved.tree.buttons);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawBenchHoundRig(ctx, S, plates, t, { sealWarm: true });
          B.drawVolumetricBeam(ctx, 180, 520, 693, 310, {
            color: "#fbbf24",
            coreColor: "#fef9c3",
            spread: 115 * u + 25,
            intensity: 1.35 * u,
            t: t
          });
          B.drawLanternHalo(ctx, 693, 310, 92 * u, { color: "#f59e0b", coreColor: "#ffffff", t: t });
          B.drawDeterministicParticles(ctx, "kintsugi", 693, 310, resolved.stemT, { count: 18, loop: true, seed: 36.1 });
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawBenchHoundRig(ctx, S, plates, t, {
            envFlap: true,
            extraFront: function (g) {
              // Brass bulb-horn honking on right (Anchor ○: 850, 280)
              g.save();
              g.translate(1065, 285);
              g.rotate(Math.sin(t * 20) * 0.06);
              S.drawCutoutPaperEdge(g, [[0, -14], [-96, -42], [-96, 42], [0, 14]], "#d4a44c", "#0b0c0e", { paperRim: 3.0 });
              drawPaperBubble(g, 24, 0, 26, "#dc2626");
              g.restore();
              for (var hr = 0; hr < 4; hr++) {
                var hu = ((t * 1.35 + hr / 4) % 1);
                drawBubbleRing(g, B.lerp(955, 680, hu), 285, 18 + hu * 32, 32 + hu * 55, (1 - hu) * u, "#ef4444");
              }
            }
          });
          B.drawDeterministicParticles(ctx, "bubbles", 850, 280, resolved.stemT, { count: 24, loop: true, seed: 36.2 });
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawBenchHoundRig(ctx, S, plates, t, {
            extraFront: function (g, hx, hy) {
              B.drawSnailSilverTrail(g, 260, 520, 468, 465, u, t, { arc: 22 });
              var sx = B.lerp(260, 456, u);
              var sy = B.lerp(520, 468, u);
              S.drawMailSnail(g, sx, sy, 1.24, t, { hasReply: false });
              // Delivery clipboard held politely beneath hound's front paw!
              g.save();
              g.translate(sx + 56, sy - 14);
              g.rotate(-0.18);
              S.drawCutoutPaperEdge(g, [[-26, -34], [26, -34], [26, 34], [-26, 34]], "#92400e", "#0b0c0e", { paperRim: 2.2 });
              S.drawCutoutPaperEdge(g, [[-20, -24], [20, -24], [20, 28], [-20, 28]], "#fbfaf5", "#0b0c0e", { paperRim: 0, shadow: false });
              g.restore();
            }
          });
          B.drawDeterministicParticles(ctx, "snail_trail", 468, 465, resolved.stemT, { count: 16, loop: true, seed: 36.3 });
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          var scritch = Math.sin(t * 14) * 10 * u;
          drawBenchHoundRig(ctx, S, plates, t, {
            tailFast: true,
            extraFront: function (g, hx, hy) {
              drawIKTongs(g, S, 1110, 515, B.lerp(960, hx + 165, u), B.lerp(465, hy + 72 + scritch, u), 265, 255, -1, 0.18);
              // Cheerful cast-iron bell chime rings!
              for (var cr = 0; cr < 3; cr++) {
                var cu = ((t * 1.1 + cr / 3) % 1);
                drawBubbleRing(g, hx + 148, hy + 68, 16 + cu * 54, 16 + cu * 54, (1 - cu) * u, "#fbbf24");
              }
            }
          });
          B.drawDeterministicParticles(ctx, "brass_sparks", 665, 255, resolved.stemT, { count: 18, loop: true, seed: 36.4 });
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Probable] Official Governor Thanksgiving Turkey Pardon (6.0s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawBenchHoundRig(ctx, S, plates, t, {
              sealWarm: true,
              pardonRibbons: true,
              extraBehind: function (g) {
                // Twin Capitol fluted columns + crimson state swag curtain!
                var colXs = [235, 1025];
                for (var p = 0; p < 2; p++) {
                  S.drawCutoutPaperEdge(g, [[colXs[p] - 40, BAND_TOP + 6], [colXs[p] + 40, BAND_TOP + 6], [colXs[p] + 36, 565], [colXs[p] - 36, 565]], "#e8e4da", "#0b0c0e", { paperRim: 4.0 });
                }
                S.drawCutoutPaperEdge(g, [
                  [175, BAND_TOP], [1095, BAND_TOP], [1065, BAND_TOP + 76 * e],
                  [845, BAND_TOP + 48 * e], [635, BAND_TOP + 84 * e], [425, BAND_TOP + 48 * e], [205, BAND_TOP + 76 * e]
                ], "#b8291e", "#0b0c0e", { paperRim: 4.0 });
              },
              extraFront: function (g) {
                B.drawLanternHalo(g, 693, 310, 115, { color: "#fbbf24", coreColor: "#ffffff", intensity: 1.3, t: t });
                // Reporter flashbulb starbursts + Turkey dabbing happy tear with lace kerchief!
                drawCutPaperStar(g, S, 885, 225, 26, 9, 8, t * 2.5, "#fef9c3", 2.0);
                S.drawTurkeyCutawayBadge(g, 134, 492, 1.04, t, { dispatch: 0.7 });
                // Scalloped white lace handkerchief & happy blue tear
                S.drawCutoutPaperEdge(g, [[178, 466], [216, 456], [208, 498], [174, 492]], "#fbfaf5", "#0b0c0e", { paperRim: 2.0 });
                drawPaperBubble(g, 152, 478, 5.0, "#60a5fa");
              }
            });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Plausible] Shiny Brass Creekside Dog Mailbox
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawBenchHoundRig(ctx, S, plates, t, {
              sealWarm: true,
              hideBench: true,
              extraBehind: function (g) {
                // Arched riveted brass creekside mailbox shell enclosing the hound!
                var mbX = 445, mbY = 142;
                S.drawCutoutPaperEdge(g, [
                  [mbX, mbY + 355], [mbX, mbY + 95], [mbX + 58, mbY + 22],
                  [mbX + 195, mbY], [mbX + 332, mbY + 22], [mbX + 390, mbY + 95], [mbX + 390, mbY + 355]
                ], "#d4a44c", "#0b0c0e", { paperRim: 5.0 });
                g.fillStyle = "#141210";
                g.beginPath();
                g.moveTo(mbX + 26, mbY + 345);
                g.lineTo(mbX + 26, mbY + 105);
                g.quadraticCurveTo(mbX + 195, mbY + 18, mbX + 364, mbY + 105);
                g.lineTo(mbX + 364, mbY + 345);
                g.closePath();
                g.fill();
              },
              extraFront: function (g) {
                // Brook Trout slipping a folded green lily-pad postcard into hound's jaws!
                var tx = B.lerp(1120, 935, e);
                S.drawBrookTrout(g, tx, 326 + Math.sin(t * 2.6) * 6, 1.16, t, false);
                S.drawCutoutPaperEdge(g, [[765, 308], [835, 296], [842, 336], [772, 344]], "#4ade80", "#0b0c0e", { paperRim: 2.4 });
                // Mail Snail pointing to round collection-hours clock icon (hands at 4:00, 0 text!)
                S.drawMailSnail(g, 335, 518, 1.22, t, { hasReply: true });
                drawPaperBubble(g, 396, 462, 24, "#fbfaf5");
                g.strokeStyle = "#14110d"; g.lineWidth = 2.6;
                g.beginPath(); g.moveTo(396, 462); g.lineTo(396, 444); g.moveTo(396, 462); g.lineTo(412, 472); g.stroke();
              }
            });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Preposterous] Sealed Treaty From Dog Star
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawBenchHoundRig(ctx, S, plates, t, {
              sealWarm: true,
              extraBehind: function (g) {
                // Shimmering Canis Major dot-to-dot constellation around hound!
                var nodes = [[365, 205], [448, 285], [636, 218], [815, 260], [895, 188], [838, 398]];
                g.strokeStyle = "rgba(253, 224, 71, 0.78)";
                g.lineWidth = 2.2;
                g.setLineDash([7, 5]);
                g.beginPath();
                for (var n = 0; n < nodes.length; n++) {
                  if (n === 0) g.moveTo(nodes[n][0], nodes[n][1]);
                  else g.lineTo(nodes[n][0], nodes[n][1]);
                }
                g.stroke();
                g.setLineDash([]);
                for (var d = 0; d < nodes.length; d++) {
                  drawCutPaperStar(g, S, nodes[d][0], nodes[d][1], 11, 4.5, 4, t + d, "#fef08a", 0);
                }
              },
              extraFront: function (g) {
                // Floating golden holographic Peace-Bone projected from the wax seal!
                var bx = 815, by = 258 + Math.sin(t * 3.4) * 8;
                B.drawLanternHalo(g, bx, by, 72, { color: "#2dd4bf", coreColor: "#fef08a", t: t });
                g.save();
                g.translate(bx, by);
                g.scale(e, e);
                g.rotate(-0.2 + Math.sin(t * 2.2) * 0.08);
                S.drawCutoutPaperEdge(g, [
                  [-38, -10], [-48, -20], [-56, -8], [-46, 0], [-56, 8], [-48, 20], [-38, 10],
                  [38, 10], [48, 20], [56, 8], [46, 0], [56, -8], [48, -20], [38, -10]
                ], "#fef08a", "#0f8f80", { paperRim: 2.5 });
                g.restore();

                S.drawAlienSaucer(g, 415, B.lerp(60, 152, e), 1.18, t, 693, 310, { beamSpread: 145 });
              }
            });
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Probable] Unflinching Guard Dog With Bill
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawBenchHoundRig(ctx, S, plates, t, {
              envFlap: true,
              extraFront: function (g) {
                // Red alert triangle icon above flapping envelope (0 text!)
                S.drawCutoutPaperEdge(g, [[735, 224], [762, 178], [789, 224]], "#ef4444", "#0b0c0e", { paperRim: 2.2 });
                g.fillStyle = "#ffffff";
                g.fillRect(759, 192, 6, 16);
                g.fillRect(759, 212, 6, 6);

                // Turkey dimming cabin light & holding up "NO TURKEYS HOME" crossed-out turkey placard (0 text!)
                S.drawTurkeyCutawayBadge(g, 134, 496, 1.02, t, { dispatch: 0.1 });
                g.fillStyle = "rgba(8, 10, 14, 0.45)";
                g.beginPath(); g.arc(134, 496, 62, 0, TAU); g.fill();

                g.save();
                g.translate(256, 456 - (1 - e) * 40);
                drawLinkageBar(g, S, 0, 28, 0, 88, 5, "#8c5828", { shadow: false });
                S.drawCutoutPaperEdge(g, [[-52, -40], [52, -40], [52, 40], [-52, 40]], "#e5dccb", "#0b0c0e", { paperRim: 3.0 });
                // Turkey head silhouette + red prohibition circle-slash (⊘)!
                g.fillStyle = "#57534e";
                g.beginPath(); g.arc(-4, 6, 16, 0, TAU); g.arc(6, -12, 10, 0, TAU); g.fill();
                g.strokeStyle = "#dc2626"; g.lineWidth = 5.0;
                g.beginPath(); g.arc(0, 0, 28, 0, TAU); g.moveTo(-20, -20); g.lineTo(20, 20); g.stroke();
                g.restore();
              }
            });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Plausible + Snail Mail] Honking Getaway Bench Park Ride (11.8s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawBenchHoundRig(ctx, S, plates, t, {
              envFlap: true,
              extraFront: function (g, hx, hy) {
                // Exhaust bubble stream roaring leftward behind bench!
                for (var eb = 0; eb < 9; eb++) {
                  var eu = ((t * 1.2 + eb / 9) % 1);
                  drawPaperBubble(g, B.lerp(340, 95, eu), 465 + Math.sin(t * 8 + eb) * 18, 6 + eu * 12, "rgba(224, 242, 254, 0.8)");
                }
                // Brook Trout riding on the iron hound's back wearing leaf aviator goggles & red scarf!
                var rx = hx + 78, ry = hy + 96 - Math.abs(Math.sin(t * 8)) * 8;
                S.drawBrookTrout(g, rx, ry, 1.08 * e, t, true, { tilt: -0.14 });
                // Green leaf goggles & streaming red cabbie scarf
                drawPaperBubble(g, rx + 52, ry - 8, 9, "#4ade80");
                S.drawCutoutPaperEdge(g, [[rx + 18, ry + 8], [rx - 44, ry - 6 + Math.sin(t * 12) * 8], [rx - 38, ry + 14]], "#dc2626", "#0b0c0e", { paperRim: 1.8 });

                // Laughing Mail Snail rocking on the bench armrest!
                S.drawMailSnail(g, 895, 388, 1.24, t, { flip: true, rot: Math.sin(t * 9) * 0.15, hasReply: true });
              }
            });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Preposterous] Sonic Bark From Sirius Courier
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawBenchHoundRig(ctx, S, plates, t, {
              tailFast: true,
              extraFront: function (g) {
                var sy = B.lerp(40, 148, e);
                // Sonic bark-rings bouncing off hound's snout upward into saucer!
                for (var sr = 0; sr < 4; sr++) {
                  var su = ((t * 0.95 + sr / 4) % 1);
                  drawBubbleRing(g, B.lerp(685, 865, su), B.lerp(280, sy + 24, su), 20 + su * 44, 12 + su * 24, 1 - su * 0.7, "#34d399");
                }
                // Excited saucer wagging landing struts + dropping glowing pink cratered rubber asteroid ball!
                S.drawAlienSaucer(g, 885, sy, 1.22, t, 885, 445, { beamSpread: 115 });
                var ballY = 468 - Math.abs(Math.sin(t * 5.2)) * 95;
                drawPaperBubble(g, 885, ballY, 26, "#f43f5e");
                drawPaperBubble(g, 876, ballY - 6, 5, "#fda4af");
                drawPaperBubble(g, 894, ballY + 8, 4, "#fda4af");
              }
            });
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Probable] Signed Receipt For Royal Pardon
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawBenchHoundRig(ctx, S, plates, t, {
              extraFront: function (g) {
                S.drawMailSnail(g, 438, 505, 1.20, t, { hasReply: false });
                // Unrolled waterproof scroll displaying a crisp 4-toe iron paw-print (0 text!)
                g.save();
                g.translate(825, 365);
                g.scale(e, e);
                S.drawCutoutPaperEdge(g, [[-56, -68], [56, -68], [56, 68], [-56, 68]], "#fef3c7", "#0b0c0e", { paperRim: 3.5 });
                g.fillStyle = "#1e3a8a";
                g.beginPath(); g.ellipse(0, 14, 18, 14, 0, 0, TAU); g.fill();
                var toes = [[-20, -8], [-7, -18], [7, -18], [20, -8]];
                for (var ti = 0; ti < 4; ti++) {
                  g.beginPath(); g.arc(toes[ti][0], toes[ti][1], 6.5, 0, TAU); g.fill();
                }
                g.restore();

                // Turkey snapping a pinhole bellows camera with bright flash poof!
                S.drawTurkeyCutawayBadge(g, 134, 492, 1.04, t, { dispatch: 0.4 });
                S.drawCutoutPaperEdge(g, [[186, 456], [242, 450], [242, 492], [186, 486]], "#334155", "#0b0c0e", { paperRim: 2.2 });
                drawCutPaperStar(g, S, 260, 444, 24 + Math.sin(t * 8) * 6, 8, 8, t * 2, "#ffffff", 0);
              }
            });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Plausible] Registered Hound Express Handoff
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawBenchHoundRig(ctx, S, plates, t, {
              extraFront: function (g, hx, hy) {
                // Jaunty navy postal cap with brass badge perched crookedly on the hound's iron ear!
                g.save();
                g.translate(hx + 96, hy + 18);
                g.rotate(-0.26);
                g.scale(e, e);
                S.drawCutoutPaperEdge(g, [[-38, 8], [-28, -22], [28, -22], [44, 8]], "#1e3a8a", "#0b0c0e", { paperRim: 2.5 });
                S.drawCutoutPaperEdge(g, [[-12, 8], [52, 8], [46, 18], [-12, 14]], "#0f172a", "#0b0c0e", { paperRim: 0, shadow: false });
                S.drawSplitPin(g, 8, -6, 4.5, { metal: "brass" });
                g.restore();

                S.drawMailSnail(g, 435, 498, 1.22, t, { hasReply: true });
                // Brook Trout snapping a crisp pectoral-fin salute!
                var tx = B.lerp(1120, 955, e);
                S.drawBrookTrout(g, tx, 345, 1.18, t, false);
                S.drawCardboardPuppetPiece(g, [[tx - 38, 348], [tx - 64, 318], [tx - 48, 312], [tx - 26, 342]], { tone: "#b87458" });
              }
            });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Preposterous Alien Finale] Notarized Interstellar Canine Peace Pact (16.0s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawBenchHoundRig(ctx, S, plates, t, {
              goldEnvelope: true,
              sealWarm: true,
              extraFront: function (g) {
                B.drawLanternHalo(g, 693, 310, 135, { color: "#fbbf24", coreColor: "#ffffff", intensity: 1.4, t: t });

                // Enlarged Notarized Treaty Clipboard displaying Alien Star-Sigil + Snail Spiral Seal (0 text!)
                var cx = 365, cy = 385;
                g.save();
                g.translate(cx, cy);
                g.scale(e, e);
                S.drawCutoutPaperEdge(g, [[-68, -82], [68, -82], [68, 82], [-68, 82]], "#78350f", "#0b0c0e", { paperRim: 3.5 });
                S.drawCutoutPaperEdge(g, [[-56, -64], [56, -64], [56, 70], [-56, 70]], "#fbfaf5", "#0b0c0e", { paperRim: 0, shadow: false });
                // Alien glowing cyan sigil on left + Snail emerald stamp on right
                drawCutPaperStar(g, S, -22, 18, 22, 9, 6, t * 1.4, "#2dd4bf", 1.5);
                drawPerforatedStamp(g, 24, 18, 34, 30, 0.1, "#0f8f80", "check");
                g.restore();

                S.drawMailSnail(g, 365, 512, 1.24, t, { hasReply: true, hasAlienStamp: true });
                var sy = B.lerp(40, 148, e);
                B.drawTractorRings(g, 415, sy + 18, cx, cy, t, { spread: 130, rings: 5 });
                S.drawAlienSaucer(g, 415, sy, 1.22, t, 693, 310, { beamSpread: 145 });
              }
            });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Probable] Good Boy Drops Pardon Letter
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawBenchHoundRig(ctx, S, plates, t, {
              envDrop: true,
              tailFast: true,
              extraFront: function (g, hx, hy) {
                drawIKTongs(g, S, 1110, 515, hx + 165, hy + 72, 265, 255, -1, 0.18);
                // Tilted autumn greeting card displaying a bright orange cut-paper Maple Leaf (0 text!)
                g.save();
                g.translate(hx + 235, hy + 205);
                g.rotate(0.18);
                g.scale(e, e);
                S.drawCutoutPaperEdge(g, [[-48, -36], [48, -36], [48, 36], [-48, 36]], "#fffbeb", "#0b0c0e", { paperRim: 3.0 });
                drawCutPaperStar(g, S, 0, 0, 24, 11, 7, 0, "#ea580c", 1.5);
                g.restore();

                // Turkey leaping up dancing an Irish jig!
                var jigY = 486 - Math.abs(Math.sin(t * 8.5)) * 28;
                S.drawTurkeyCutawayBadge(g, 136, jigY, 1.06, t, { dispatch: 0.95 });
              }
            });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Plausible] Wagging Iron Tail Mailbox Flag
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawBenchHoundRig(ctx, S, plates, t, {
              tailUp: true,
              tailFlag: true,
              extraFront: function (g, hx, hy) {
                // Visible brass counterweight gear at hound's hip
                drawGearWheel(g, S, hx + 42, hy + 252, 20, 8, t * 2.5, "#d4a44c");
                // Brook Trout giving iron pup an affectionate nose-boop + heart puff!
                var boopX = B.lerp(960, hx + 276, e) + Math.sin(t * 4) * 6;
                S.drawBrookTrout(g, boopX, hy + 96, 1.14, t, false);
                drawCutPaperHeart(g, S, hx + 212, hy + 42 - ((t * 24) % 28), 0.78, 0.15, "#fb7185");
                S.drawMailSnail(g, 395, 512, 1.20, t, { hasReply: true });
              }
            });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Preposterous] Awakened Robotic Star Hound Statue
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawBenchHoundRig(ctx, S, plates, t, {
              tailFast: true,
              extraFront: function (g, hx, hy) {
                var sy = B.lerp(40, 144, e);
                S.drawAlienSaucer(g, 636, sy, 1.22, t, hx + 130, hy + 120, { beamSpread: 175 });

                // Playful cyan hologram floppy ears & wagging starlight tail overlaying the iron hound!
                var earBob = Math.sin(t * 8.5) * 0.25;
                g.save();
                g.translate(hx + 102, hy + 38);
                g.rotate(earBob);
                S.drawCutoutPaperEdge(g, [[-18, 0], [-42, 48], [-12, 62], [8, 18]], "rgba(45, 212, 191, 0.78)", "#ffffff", { paperRim: 2, shadow: false });
                g.restore();

                g.save();
                g.translate(hx + 36, hy + 242);
                g.rotate(Math.sin(t * 11) * 0.45);
                S.drawCutoutPaperEdge(g, [[0, 0], [-56, -78], [-24, -96], [12, -18]], "rgba(45, 212, 191, 0.82)", "#ffffff", { paperRim: 2, shadow: false });
                g.restore();

                // Panting glowing pink heart-bubbles from snout!
                for (var hb = 0; hb < 3; hb++) {
                  var hu = ((t * 0.85 + hb / 3) % 1);
                  drawCutPaperHeart(g, S, hx + 245 + hu * 55, hy + 96 - hu * 52, 0.65 + hu * 0.35, 0.2, "#fb7185");
                }
              }
            });
          }
        }
      }
    });
  })();

  // ==========================================================================
  // PORTHOLE #37 · BULKHEAD ("queneau-rostrum" · p37.jpg + atlas-26.webp)
  // ==========================================================================
  (function buildPortal37() {
    var B = getBG();
    if (!B) return;

    function drawBulkheadBackdrop(ctx, W, H, resolved, plates, S) {
      var t = resolved.t;
      S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 37, t, makeBackdropState(resolved), {
        paperTop: resolved.selectedTier === "preposterous" ? "#cbd5e1" : "#fae194",
        paperBot: resolved.selectedTier === "preposterous" ? "#94a3b8" : "#eed07c",
        floor: false
      });
      // Extended torn-deckle floor down to y=734 so blind mode (H=720) is 100% dressed!
      S.drawTornPaperFlat(ctx, -20, 548, W + 40, 186, {
        fill: "#273b19", paperColor: "#f2ece0", deckle: 6.5, shadow: false, seed: 17.3
      });
      S.drawTornPaperFlat(ctx, -16, 578, W + 32, 8, { fill: "#d8d4c2", deckle: 0, shadow: false, seed: 31.1 });
      S.drawTornPaperFlat(ctx, -16, 612, W + 32, 8, { fill: "#d8d4c2", deckle: 0, shadow: false, seed: 47.9 });

      // Right torn-deckle wooden bulkhead door
      S.drawTornPaperFlat(ctx, 1032, 82, 178, 442, { fill: "#2b4222", paperColor: "#f2ecde", deckle: 8.0, seed: 91.4 });
      S.drawSplitPin(ctx, 1056, 304, 5.5, { metal: "brass" });

      // Modest Mouse "Dashboard" peering sailor with flashlight (atlas-26.webp: 740x555)
      var aImg = plates.atlasImg;
      S.drawScissorCutout(ctx, aImg, 88, 12, 468, 372, 92, 62, 295, 224, [
        [0.08, 0.14], [0.46, 0.03], [0.88, 0.08], [0.96, 0.58], [0.84, 0.95], [0.12, 0.92]
      ], { filter: "sepia", haloWidth: 4.5, alpha: 0.88, rot: -0.04 });

      B.drawWaterCaustics(ctx, W, 555, t, { intensity: 0.14, topY: 40, stageH: 550 });
    }

    function drawFoldedMapRig(ctx, S, plates, t, cfg) {
      var c = cfg || {};
      var pImg = plates.portholeImg;
      var fold = c.fold != null ? c.fold : (0.22 + Math.sin(t * 1.8) * 0.03);
      var mapCx = 625 + (c.shiftX || 0);
      var mapCy = 324 + (c.shiftY || 0);
      var panelW = c.panelW || 148;
      var panelH = 336;
      var cosInner = Math.cos(fold * 0.72);
      var cosOuter = Math.cos(fold * 1.08);
      var wInner = panelW * cosInner;
      var wOuter = panelW * cosOuter;
      var skewInner = Math.sin(fold * 0.72) * 26;
      var skewOuter = -Math.sin(fold * 1.08) * 34;

      if (c.backlit) {
        B.drawLanternHalo(ctx, mapCx, mapCy, 250, { color: "#3b82f6", coreColor: "#fef08a", intensity: 1.35, t: t });
      }

      // Contact shadow
      ctx.fillStyle = "rgba(20, 16, 10, 0.26)";
      ctx.beginPath();
      ctx.ellipse(mapCx + 6, mapCy + panelH * 0.48, (wInner + wOuter) * 1.02, 24, 0, 0, TAU);
      ctx.fill();

      function drawPanel(xLeft, wProj, yTL, yTR, sx, sw, shadeAlpha, maskIdx) {
        ctx.save();
        ctx.strokeStyle = "#fbfaf5";
        ctx.lineWidth = 8;
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(xLeft, yTL);
        ctx.lineTo(xLeft + wProj, yTR);
        ctx.lineTo(xLeft + wProj, yTR + panelH);
        ctx.lineTo(xLeft, yTL + panelH);
        ctx.closePath();
        ctx.stroke();
        ctx.clip();

        var dySkew = yTR - yTL;
        ctx.transform(wProj / panelW, dySkew / panelW, 0, 1, xLeft, yTL);
        if (pImg && pImg.complete && pImg.naturalWidth > 0) {
          ctx.drawImage(pImg, sx, 178, sw, 296, 0, 0, panelW, panelH);
        } else {
          ctx.fillStyle = "#e6d5b0";
          ctx.fillRect(0, 0, panelW, panelH);
        }

        // PERMANENT BLIND-SAFE CARTOGRAPHIC PATCHES masking painted "Creek" script on panels 1 & 2!
        if (maskIdx === 1) {
          // Panel 2 upper painted script covered by a brass-rimmed paper Compass Rose badge!
          ctx.fillStyle = "#f4e7c8";
          ctx.strokeStyle = "#14110d";
          ctx.lineWidth = 2;
          ctx.fillRect(8, 12, 126, 92);
          ctx.strokeRect(8, 12, 126, 92);
          drawCutPaperStar(ctx, S, 70, 58, 32, 11, 4, 0, "#d42a1e", 0);
          drawCutPaperStar(ctx, S, 70, 58, 20, 8, 4, Math.PI * 0.25, "#d4a44c", 0);
        } else if (maskIdx === 2) {
          // Panel 3 lower painted script covered by a green Pine-Island & Bridge emblem!
          ctx.fillStyle = "#f4e7c8";
          ctx.strokeStyle = "#14110d";
          ctx.lineWidth = 2;
          ctx.fillRect(4, 232, 92, 68);
          ctx.strokeRect(4, 232, 92, 68);
          ctx.fillStyle = "#15803d";
          ctx.beginPath();
          ctx.moveTo(28, 286); ctx.lineTo(48, 244); ctx.lineTo(68, 286);
          ctx.closePath(); ctx.fill();
        }

        if (c.tint) {
          ctx.fillStyle = c.tint;
          ctx.fillRect(0, 0, panelW, panelH);
        }
        if (c.backlit) {
          // Glowing dotted secret path lines inside backlit oiled paper!
          ctx.strokeStyle = "#fde047";
          ctx.lineWidth = 3.2;
          ctx.setLineDash([7, 6]);
          ctx.beginPath();
          ctx.moveTo(14, 72); ctx.lineTo(panelW - 14, 165); ctx.lineTo(24, 268);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        if (shadeAlpha > 0) {
          ctx.fillStyle = "rgba(18, 14, 10, " + shadeAlpha.toFixed(3) + ")";
          ctx.fillRect(0, 0, panelW, panelH);
        }
        ctx.restore();

        ctx.strokeStyle = "rgba(20, 17, 13, 0.55)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(xLeft, yTL);
        ctx.lineTo(xLeft + wProj, yTR);
        ctx.lineTo(xLeft + wProj, yTR + panelH);
        ctx.lineTo(xLeft, yTL + panelH);
        ctx.closePath();
        ctx.stroke();
      }

      var yC = mapCy - panelH * 0.5;
      var yL1 = yC - skewInner;
      var yL2 = yL1 - skewOuter;
      var yR1 = yC - skewInner;
      var yR2 = yR1 - skewOuter;

      drawPanel(mapCx - wInner - wOuter, wOuter, yL2, yL1, 140, 90, 0.05, 0);
      drawPanel(mapCx - wInner, wInner, yL1, yC, 230, 90, 0.18 + fold * 0.16, 1);
      drawPanel(mapCx, wInner, yC, yR1, 320, 90, 0.07, 2);
      drawPanel(mapCx + wInner, wOuter, yR1, yR2, 410, 90, 0.20 + fold * 0.16, 3);

      S.drawSplitPin(ctx, mapCx - wInner - wOuter + 12, yL2 + 14, 5.2, { metal: "brass" });
      S.drawSplitPin(ctx, mapCx + wInner + wOuter - 12, yR2 + 14, 5.2, { metal: "brass" });

      // Muddy silt patches in default state (blown off when c.siltCleared!)
      if (!c.siltCleared && !c.unfoldedPicnic) {
        var muds = [[-45, -18, 28], [28, 12, 24], [-12, 34, 22]];
        for (var m = 0; m < muds.length; m++) {
          ctx.save();
          ctx.translate(mapCx + muds[m][0], mapCy + muds[m][1]);
          S.drawCutoutPaperEdge(ctx, [
            [-muds[m][2], -4], [-6, -muds[m][2] * 0.8], [muds[m][2], -5],
            [muds[m][2] * 0.7, muds[m][2] * 0.8], [-9, muds[m][2] * 0.7]
          ], "rgba(92, 67, 40, 0.78)", "#14110d", { paperRim: 0, shadow: false });
          ctx.restore();
        }
      }

      // Glossy iridescent snail-tape seam down center crease!
      if (c.tapedProgress && c.tapedProgress > 0.02) {
        var th = panelH * c.tapedProgress;
        ctx.save();
        ctx.fillStyle = "rgba(167, 243, 208, 0.56)";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.0;
        ctx.fillRect(mapCx - 13, yC + panelH - th, 26, th);
        ctx.strokeRect(mapCx - 13, yC + panelH - th, 26, th);
        ctx.restore();
      }

      // Unfolded center Sunny Picnic Island panel when c.unfoldedPicnic!
      if (c.unfoldedPicnic) {
        var pw = 136 * c.unfoldedPicnic;
        ctx.save();
        S.drawCutoutPaperEdge(ctx, [
          [mapCx - pw * 0.5, yC + 16], [mapCx + pw * 0.5, yC + 16],
          [mapCx + pw * 0.5, yC + panelH - 16], [mapCx - pw * 0.5, yC + panelH - 16]
        ], "#bef264", "#14110d", { paperRim: 3.0 });
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath(); ctx.ellipse(mapCx, mapCy + 35, pw * 0.36, 48, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = "#fde047";
        ctx.beginPath(); ctx.ellipse(mapCx, mapCy + 35, pw * 0.24, 28, 0, 0, TAU); ctx.fill();
        drawCutPaperStar(ctx, S, mapCx, mapCy - 72, 22, 10, 8, t * 0.8, "#f59e0b", 1.5);
        ctx.restore();
      }
    }

    B.definePortalGame(37, {
      drawBackdrop: drawBulkheadBackdrop,

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawFoldedMapRig(ctx, S, plates, t, {});
        drawHotspotShimmer(ctx, B, t, resolved.tree.buttons);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawFoldedMapRig(ctx, S, plates, t, { backlit: true, siltCleared: true });
          B.drawVolumetricBeam(ctx, 235, 195, 625, 324, {
            color: "#3b82f6",
            coreColor: "#fef08a",
            spread: 185 * u + 25,
            intensity: 1.3 * u,
            t: t
          });
          B.drawDeterministicParticles(ctx, "kintsugi", 625, 320, resolved.stemT, { count: 20, loop: true, seed: 37.1 });
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawFoldedMapRig(ctx, S, plates, t, { siltCleared: u > 0.35, fold: 0.18 + Math.sin(t * 9) * 0.06 });
          drawWaterJetStream(ctx, B, 1085, 290, 625, 324, t, u, "#ef4444");
          // Vivid scissored claw-to-fin handshake popping bright in the cleared center!
          if (u > 0.3) {
            S.drawScissorCutout(ctx, plates.portholeImg, 212, 272, 224, 128, 495, 255, 260, 146, null, { haloWidth: 5.0 });
          }
          B.drawDeterministicParticles(ctx, "ink_puffs", 625, 324, resolved.stemT, { count: 22, loop: true, color: "rgba(110, 78, 46, 0.65)", seed: 37.2 });
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawFoldedMapRig(ctx, S, plates, t, { siltCleared: true, tapedProgress: u });
          var sy = B.lerp(492, 165, u);
          S.drawMailSnail(ctx, 625, sy, 1.22, t, { rot: -Math.PI * 0.5 });
          B.drawDeterministicParticles(ctx, "snail_trail", 625, sy, resolved.stemT, { count: 16, loop: true, seed: 37.3 });
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawFoldedMapRig(ctx, S, plates, t, {
            fold: B.lerp(0.38, 0.05, u),
            siltCleared: true,
            unfoldedPicnic: u
          });
          drawIKTongs(ctx, S, 1125, 520, B.lerp(825, 918, u), 445, 220, 210, -1, 0.14);
          B.drawDeterministicParticles(ctx, "brass_sparks", 885, 445, resolved.stemT, { count: 18, loop: true, seed: 37.4 });
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Probable] Backlit Hidden Creek Ambush Diagram (6.0s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawFoldedMapRig(ctx, S, plates, t, { backlit: true, fold: 0.56, siltCleared: true });

            // Serrated red pincer ambush jaws & glowing X-target along center fold!
            var jawGap = 14 + Math.abs(Math.sin(t * 5.5)) * 28;
            ctx.save();
            ctx.translate(625, 324);
            for (var s = -1; s <= 1; s += 2) {
              S.drawCutoutPaperEdge(ctx, [
                [s * (jawGap + 54), -96], [s * jawGap, -58], [s * (jawGap + 30), -20],
                [s * jawGap, 20], [s * (jawGap + 30), 58], [s * (jawGap + 54), 96]
              ], "#d42a1e", "#14110d", { paperRim: 2.8 });
            }
            ctx.restore();

            // Turkey in folded tin Admiral hat plotting 3 zig-zag evasive squiggle arrows on glass!
            S.drawTurkeyCutawayBadge(ctx, 134, 502, 1.06, t, { dispatch: 0.4 });
            S.drawCutoutPaperEdge(ctx, [[96, 448], [134, 412], [172, 448]], "#cbd5e1", "#14110d", { paperRim: 2.2 });
            ctx.strokeStyle = "rgba(186, 230, 253, 0.9)";
            ctx.lineWidth = 4.0;
            ctx.beginPath();
            ctx.moveTo(215, 515); ctx.lineTo(255, 475); ctx.lineTo(235, 445); ctx.lineTo(285 * e + 215 * (1 - e), 408);
            ctx.stroke();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Plausible] Glowing Fin To Claw Handshake
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawFoldedMapRig(ctx, S, plates, t, { backlit: true, siltCleared: true });
            S.drawScissorCutout(ctx, plates.portholeImg, 212, 272, 224, 128, 485, 248, 280, 156, null, { haloWidth: 5.5 });

            // Real jointed red cardboard crayfish shaking fin-to-claw with Brook Trout!
            var shakeY = 472 + Math.sin(t * 6.5) * 10;
            ctx.save();
            ctx.translate(535, shakeY);
            ctx.scale(e, e);
            S.drawCardboardPuppetPiece(ctx, [[-68, 28], [-42, -8], [12, -12], [28, 12], [-18, 32]], { tone: "#dc2626", ribs: 3 });
            S.drawCutoutPaperEdge(ctx, [[22, -8], [62, -26], [76, -8], [52, 4]], "#ef4444", "#14110d", { paperRim: 2.2 });
            ctx.restore();

            S.drawBrookTrout(ctx, 735, shakeY - 6, 1.16, t, false);
            S.drawMailSnail(ctx, 345, 518, 1.22, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Preposterous] Translucent Folded Wormhole Star Chart
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawFoldedMapRig(ctx, S, plates, t, {
              backlit: true,
              fold: 0.60,
              tint: "rgba(15, 23, 66, 0.62)",
              siltCleared: true
            });

            // Swirling Einstein-Rosen wormhole ring hopping between folded star nodes!
            var hopU = 0.5 + 0.5 * Math.sin(t * 2.8);
            var wx = B.lerp(515, 735, hopU);
            var wy = 324 - Math.sin(hopU * Math.PI) * 58;
            for (var wr = 4; wr >= 1; wr--) {
              drawBubbleRing(ctx, wx, wy, wr * 18, wr * 11, 0.85, wr % 2 === 0 ? "#2dd4bf" : "#fde047");
            }
            drawCutPaperStar(ctx, S, 515, 324, 18, 7, 5, t, "#fef08a", 1.5);
            drawCutPaperStar(ctx, S, 735, 324, 18, 7, 5, -t, "#fef08a", 1.5);

            var sy = B.lerp(-40, 102, e);
            B.drawTractorRings(ctx, 625, sy + 18, wx, wy, t, { spread: 165, rings: 5 });
            S.drawAlienSaucer(ctx, 625, sy, 1.22, t, false, false);
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Probable] Dusted Off Peaceful Olive Twig
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawFoldedMapRig(ctx, S, plates, t, { siltCleared: true });
            S.drawScissorCutout(ctx, plates.portholeImg, 212, 272, 224, 128, 495, 255, 260, 146, null, { haloWidth: 5.0 });

            // Bright green cut-paper olive branch held peacefully in center seam!
            ctx.save();
            ctx.translate(625, 285);
            ctx.scale(e, e);
            ctx.rotate(Math.sin(t * 2.5) * 0.08);
            ctx.strokeStyle = "#15803d"; ctx.lineWidth = 4.5;
            ctx.beginPath(); ctx.moveTo(-18, 36); ctx.quadraticCurveTo(0, -18, 22, -62); ctx.stroke();
            var leaves = [[-16, 10, -0.6], [14, 2, 0.6], [-12, -20, -0.5], [18, -28, 0.5], [4, -52, 0.1]];
            for (var li = 0; li < leaves.length; li++) {
              ctx.save();
              ctx.translate(leaves[li][0], leaves[li][1]);
              ctx.rotate(leaves[li][2]);
              S.drawCutoutPaperEdge(ctx, [[-14, 0], [0, -8], [14, 0], [0, 8]], "#22c55e", "#14110d", { paperRim: 1.5, shadow: false });
              ctx.restore();
            }
            ctx.restore();

            // Relieved Turkey hanging a white dove/olive peace pennant (0 text!)
            S.drawTurkeyCutawayBadge(ctx, 134, 502, 1.06, t, { dispatch: 0.75 });
            S.drawCutoutPaperEdge(ctx, [[212, 438], [322, 462], [212, 488]], "#fbfaf5", "#14110d", { paperRim: 2.5 });
            ctx.fillStyle = "#16a34a";
            ctx.beginPath(); ctx.arc(248, 463, 9, 0, TAU); ctx.fill();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Plausible + Snail Mail] Two Sided Creek Trail Decoy (11.8s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            var riffle = Math.sin(t * 7.2);
            drawFoldedMapRig(ctx, S, plates, t, { siltCleared: true, fold: 0.34 + riffle * 0.24 });

            // Lenticular alternating comic icons: Snack Pie Slice on left vs Blue Waterfall on right!
            ctx.save();
            ctx.translate(545, 315);
            S.drawCutoutPaperEdge(ctx, [[-42, 22], [0, -34], [42, 22]], "#f59e0b", "#14110d", { paperRim: 2.5 });
            ctx.restore();

            ctx.save();
            ctx.translate(715, 315);
            S.drawCutoutPaperEdge(ctx, [[-34, -36], [34, -36], [42, 36], [-42, 36]], "#38bdf8", "#14110d", { paperRim: 2.5 });
            ctx.restore();

            // Dizzy Brook Trout with spinning spiral eyes + Mail Snail steadying the bottom corner!
            var tx = 955, ty = 342;
            S.drawBrookTrout(ctx, tx, ty, 1.18 * e, t, false);
            ctx.save();
            ctx.translate(tx - 66, ty - 7);
            ctx.rotate(t * 10);
            ctx.strokeStyle = "#d42a1e"; ctx.lineWidth = 2.0;
            ctx.beginPath(); ctx.arc(2, 0, 5, 0, Math.PI * 1.5); ctx.stroke();
            ctx.restore();

            S.drawMailSnail(ctx, 412, 488, 1.24, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Preposterous] Uncovered First Contact Greeting Plaque
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawFoldedMapRig(ctx, S, plates, t, { siltCleared: true, tint: "rgba(234, 179, 8, 0.32)" });
            S.drawScissorCutout(ctx, plates.portholeImg, 212, 272, 224, 128, 485, 255, 280, 152, null, { haloWidth: 5.5 });

            // Glowing 3-fingered emerald holographic alien hand joining the claw-and-fin handshake!
            var sy = B.lerp(-40, 102, e);
            B.drawTractorRings(ctx, 625, sy + 18, 625, 325, t, { spread: 145, rings: 5 });
            ctx.save();
            ctx.translate(625, 252 + Math.sin(t * 3) * 6);
            ctx.scale(e, e);
            S.drawCutoutPaperEdge(ctx, [
              [-16, -56], [16, -56], [22, 4], [42, 34], [24, 42],
              [6, 18], [6, 52], [-6, 52], [-6, 18], [-24, 42], [-42, 34], [-22, 4]
            ], "rgba(52, 211, 153, 0.86)", "#ffffff", { paperRim: 2.2 });
            ctx.restore();

            S.drawAlienSaucer(ctx, 625, sy, 1.24, t, false, false);
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Probable] Sealed Safe Passage Creek Truce
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawFoldedMapRig(ctx, S, plates, t, { siltCleared: true, tapedProgress: 1.0 });

            // Rainbow refraction beam gleaming down the glossy center tape strip!
            var rCols = ["#f43f5e", "#fbbf24", "#34d399", "#38bdf8"];
            for (var rc = 0; rc < 4; rc++) {
              ctx.fillStyle = B.rgba(rCols[rc], 0.42);
              ctx.fillRect(613 + rc * 6, 156, 6, 336);
            }
            S.drawMailSnail(ctx, 625, 168, 1.16, t, { rot: -Math.PI * 0.5 });

            // Cheerful Turkey + open Captain's Diary book with green checkmark seal (0 text!)
            S.drawTurkeyCutawayBadge(ctx, 134, 502, 1.08, t, { dispatch: 0.9 });
            ctx.save();
            ctx.translate(268, 488);
            ctx.scale(e, e);
            S.drawCutoutPaperEdge(ctx, [[-48, -32], [48, -32], [54, 32], [-42, 32]], "#fbfaf5", "#14110d", { paperRim: 2.8 });
            drawPerforatedStamp(ctx, 0, 0, 32, 26, -0.08, "#10b981", "check");
            ctx.restore();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Plausible] Mended Park Ranger Trail Map
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawFoldedMapRig(ctx, S, plates, t, { siltCleared: true, tapedProgress: 1.0 });

            // Emerald pine-tree ranger seal stamped on map border + dashed red trail to sunny snack rock!
            drawPerforatedStamp(ctx, 435, 220, 38, 32, -0.1, "#15803d", "star");
            ctx.strokeStyle = "#dc2626";
            ctx.lineWidth = 4.0;
            ctx.setLineDash([9, 6]);
            ctx.beginPath();
            ctx.moveTo(465, 365);
            ctx.quadraticCurveTo(625, 425, 815, 335);
            ctx.stroke();
            ctx.setLineDash([]);

            S.drawBrookTrout(ctx, B.lerp(1080, 915, e), 338 + Math.sin(t * 3) * 6, 1.18, t, false);
            // Junior Librarian Mail Snail wearing tiny flat-brim Park Ranger hat!
            S.drawMailSnail(ctx, 415, 495, 1.24, t, { hasReply: true });
            S.drawCutoutPaperEdge(ctx, [[392, 466], [432, 466], [422, 452], [402, 452]], "#65a30d", "#14110d", { paperRim: 1.5, shadow: false });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Preposterous Alien Finale] Patched Space Time Tear Seam (16.0s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawFoldedMapRig(ctx, S, plates, t, {
              siltCleared: true,
              tapedProgress: 1.0,
              tint: "rgba(49, 46, 129, 0.38)"
            });

            // Harmless fading purple dimensional sparks along seam sealed under glowing tape!
            B.drawLanternHalo(ctx, 625, 324, 140, { color: "#a855f7", coreColor: "#6ee7b7", intensity: 1.25, t: t });
            S.drawMailSnail(ctx, 625, 212, 1.22, t, { rot: -Math.PI * 0.5, hasReply: true, hasAlienStamp: true });

            // 3-eyed Saucer flashing THREE glowing green checkmark/thumbs-up hologram discs!
            var sy = B.lerp(-40, 98, e);
            S.drawAlienSaucer(ctx, 625, sy, 1.26, t, 625, 324, { beamSpread: 150 });
            for (var gi = -1; gi <= 1; gi++) {
              drawPerforatedStamp(ctx, 625 + gi * 74, sy + 56 + Math.abs(gi) * 8, 28, 24, 0, "#10b981", "check");
            }
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Probable] Unfolded Secret Shortcut Around Trap
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawFoldedMapRig(ctx, S, plates, t, { fold: 0.04, siltCleared: true, unfoldedPicnic: e });
            drawIKTongs(ctx, S, 1125, 520, 922, 445, 220, 210, -1, 0.14);

            // Mad-Magazine fold-out transformation: Smiling Baker with Rolls on left & White Sailboat on right!
            ctx.save();
            ctx.translate(515, 325);
            ctx.scale(e, e);
            drawPaperBubble(ctx, 0, 0, 26, "#fde68a");
            S.drawCutoutPaperEdge(ctx, [[-22, -20], [22, -20], [26, -46], [0, -54], [-26, -46]], "#fbfaf5", "#14110d", { paperRim: 2 });
            drawPaperBubble(ctx, 28, 12, 10, "#d97706");
            ctx.restore();

            ctx.save();
            ctx.translate(735, 330);
            ctx.scale(e, e);
            S.drawCutoutPaperEdge(ctx, [[-34, 18], [34, 18], [22, 36], [-22, 36]], "#dc2626", "#14110d", { paperRim: 2 });
            S.drawCutoutPaperEdge(ctx, [[0, 14], [0, -48], [34, 14]], "#fbfaf5", "#14110d", { paperRim: 2 });
            ctx.restore();

            S.drawTurkeyCutawayBadge(ctx, 134, 502, 1.08, t, { dispatch: 0.9 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Plausible] Pop Up Creek Picnic Invitation
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawFoldedMapRig(ctx, S, plates, t, { fold: 0.06, siltCleared: true, unfoldedPicnic: e });
            drawIKTongs(ctx, S, 1125, 520, 918, 445, 220, 210, -1, 0.14);

            // 3D Paper Pop-Up Striped Beach Umbrella & Lemonade Pitcher springing from center crease!
            ctx.save();
            ctx.translate(625, 285);
            ctx.scale(e, e);
            ctx.rotate(Math.sin(t * 2.8) * 0.06);
            ctx.strokeStyle = "#14110d"; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(0, 56); ctx.lineTo(0, -42); ctx.stroke();
            S.drawCutoutPaperEdge(ctx, [[-64, -18], [-32, -52], [0, -60], [32, -52], [64, -18]], "#f43f5e", "#14110d", { paperRim: 3.0 });
            S.drawCutoutPaperEdge(ctx, [[18, 22], [44, 22], [48, 56], [14, 56]], "#fde047", "#14110d", { paperRim: 2.2 });
            ctx.restore();

            // Brook Trout & Mail Snail high-fiving!
            S.drawBrookTrout(ctx, 945, 338, 1.16, t, false);
            S.drawMailSnail(ctx, 815, 365, 1.22, t, { hasReply: true });
            drawCutPaperStar(ctx, S, 862, 344, 16, 6, 6, t * 2, "#fde047", 1.5);
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Preposterous] Expanded Twelve Sector Galaxy Atlas
            var t = resolved.t;
            var e = outcomeProgress(resolved);

            // Nine impossible cascading accordion star-panels unfolding clear across the stage!
            for (var sp = 0; sp < 9; sp++) {
              var sx = 175 + sp * 104 * e;
              var sy = 175 + (sp % 2) * 18;
              S.drawCutoutPaperEdge(ctx, [
                [sx, sy], [sx + 102, sy + (sp % 2 === 0 ? 14 : -14)],
                [sx + 102, sy + 295], [sx, sy + 295]
              ], sp % 2 === 0 ? "#1e1b4b" : "#0f172a", "#38bdf8", { paperRim: 2.2 });
              drawCutPaperStar(ctx, S, sx + 50, sy + 95 + (sp % 3) * 48, 13, 5, 5, t + sp, "#fde047", 0);
            }
            drawIKTongs(ctx, S, 1155, 520, 1095, 395, 195, 185, -1, 0.14);

            var saucerY = B.lerp(-40, 96, e);
            B.drawTractorRings(ctx, 640, saucerY + 18, 640, 325, t, { spread: 220, rings: 5 });
            S.drawAlienSaucer(ctx, 640, saucerY, 1.24, t, false, false);
          }
        }
      }
    });
  })();

  // ==========================================================================
  // PORTHOLE #38 · VISOR ("queneau-rostrum" · p38.jpg + atlas-37.webp)
  // Visually inspected by @p4-verify!
  // ==========================================================================
  (function buildPortal38() {
    var B = getBG();
    if (!B) return;

    function drawVisorBackdrop(ctx, W, H, resolved, plates, S) {
      var t = resolved.t;
      S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 38, t, makeBackdropState(resolved), {
        paperTop: resolved.selectedButton === "x" ? "#1e293b" : "#f4de9a",
        paperBot: resolved.selectedButton === "x" ? "#0f172a" : "#d9bc6e",
        floor: false
      });
      // Extended slate-green torn-deckle floor down to y=734!
      S.drawTornPaperFlat(ctx, -20, 548, W + 40, 186, {
        fill: "#233628", paperColor: "#f3ede0", deckle: 6.5, shadow: false, seed: 23.7
      });
      S.drawTornPaperFlat(ctx, -16, 578, W + 32, 8, { fill: "#dfd9c6", deckle: 0, shadow: false, seed: 41.2 });
      S.drawTornPaperFlat(ctx, -16, 612, W + 32, 8, { fill: "#dfd9c6", deckle: 0, shadow: false, seed: 53.8 });

      // Strictly text-free center Royal Robertson crown/visor crop from atlas-37.webp (631x631 -> 206,148,220,246)
      var aImg = plates.atlasImg;
      S.drawScissorCutout(ctx, aImg, 206, 148, 220, 246, 116, 78 + Math.sin(t * 1.6) * 5, 224, 244, [
        [0.22, 0.04], [0.78, 0.04], [0.94, 0.35], [0.85, 0.85], [0.50, 0.96], [0.15, 0.85], [0.06, 0.35]
      ], { haloWidth: 4.5, rot: -0.05, alpha: 0.92 });

      // Curved translucent polycarbonate scooter visor arch framing upper stage
      ctx.save();
      ctx.strokeStyle = "rgba(186, 230, 253, 0.42)";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(640, 560, 520, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
      ctx.restore();
    }

    function drawVisorPosterRig(ctx, S, plates, t, cfg) {
      var c = cfg || {};
      var pImg = plates.portholeImg;
      var bx = 420 + (c.shiftX || 0);
      var by = 112 + (c.shiftY || 0);
      var bw = 440, bh = 416;
      var cx = bx + bw * 0.5;
      var cy = by + bh * 0.5;

      // Wooden easel legs reaching into rostrum floor
      S.drawCardboardPuppetPiece(ctx, [[bx + 36, by + bh - 10], [bx + 68, by + bh - 10], [bx + 44, 620], [bx + 12, 620]], { tone: "#6e5233", ribs: 2 });
      S.drawCardboardPuppetPiece(ctx, [[bx + bw - 68, by + bh - 10], [bx + bw - 36, by + bh - 10], [bx + bw - 12, 620], [bx + bw - 44, 620]], { tone: "#6e5233", ribs: 2 });

      // Timber frame + oxidized copper corner brackets
      S.drawTornPaperFlat(ctx, bx - 18, by - 18, bw + 36, bh + 36, {
        fill: "#7c5e3c", paperColor: "#efe9da", deckle: 5.0, seed: 71.2
      });
      var brk = [[bx - 18, by - 18], [bx + bw - 46, by - 18], [bx - 18, by + bh - 46], [bx + bw - 46, by + bh - 46]];
      for (var bi = 0; bi < 4; bi++) {
        S.drawCutoutPaperEdge(ctx, [
          [brk[bi][0], brk[bi][1]], [brk[bi][0] + 64, brk[bi][1]],
          [brk[bi][0] + 64, brk[bi][1] + 64], [brk[bi][0], brk[bi][1] + 64]
        ], "#4a8c7f", "#14110d", { paperRim: 0, shadow: false });
        S.drawSplitPin(ctx, brk[bi][0] + 32, brk[bi][1] + 32, 4.5, { metal: "brass" });
      }

      // Rotatable Posterboard Diagram from p38.jpg (sx:192, sy:190, sw:256, sh:262 — pure arrows & saucer!)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(c.posterRot || 0);
      S.drawScissorCutout(ctx, pImg, 192, 190, 256, 262, -bw * 0.5 + 18, -bh * 0.5 + 18, bw - 36, bh - 36, [
        [0.02, 0.02], [0.98, 0.02], [0.97, 0.90], [0.90, 0.98], [0.02, 0.98]
      ], {
        haloWidth: 4.0,
        tint: c.blacklight ? "rgba(30, 27, 75, 0.68)" : null
      });

      // Central reed-pin tack
      S.drawSplitPin(ctx, 0, -bh * 0.5 + 32, 6.0, { metal: "brass" });

      if (c.blacklight) {
        // Fluorescing electric-orange & lime-green Magic Marker saucer dome & dotted fin-stabilizers!
        ctx.strokeStyle = "#f97316";
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.ellipse(0, 6, 138, 36, 0, 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = "#84cc16";
        ctx.lineWidth = 3.6;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, -10, 56, Math.PI, 0);
        ctx.moveTo(-148, 6); ctx.lineTo(-185, -36);
        ctx.moveTo(148, 6);  ctx.lineTo(185, -36);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (c.stamped) {
        // Neat emerald gear-and-star patent seal stamped beside dorsal fin (0 text!)
        drawPerforatedStamp(ctx, -118, 118, 48, 40, -0.14, "#0f8f80", "gear");
      }
      ctx.restore();
    }

    function drawBrassCalipers(ctx, S, cx, cy, spanHalf, t) {
      // Precision hinged brass calipers spanning from cx - spanHalf to cx + spanHalf!
      var pivotX = cx, pivotY = cy - 165;
      S.drawCardboardPuppetPiece(ctx, [
        [pivotX - 10, pivotY], [cx - spanHalf - 16, cy - 36], [cx - spanHalf, cy + 8], [cx - spanHalf + 12, cy - 28], [pivotX + 4, pivotY + 12]
      ], { tone: "#d4a44c", ribs: 2 });
      S.drawCardboardPuppetPiece(ctx, [
        [pivotX + 10, pivotY], [cx + spanHalf + 16, cy - 36], [cx + spanHalf, cy + 8], [cx + spanHalf - 12, cy - 28], [pivotX - 4, pivotY + 12]
      ], { tone: "#b88933", ribs: 2 });
      S.drawReinigerFiligreeHinge(ctx, pivotX, pivotY, 12, { metal: "brass" });
      // Vernier tick ruler bar between tips (pure tick marks, 0 text!)
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx - spanHalf, cy + 12);
      ctx.lineTo(cx + spanHalf, cy + 12);
      for (var x = cx - spanHalf; x <= cx + spanHalf; x += 22) {
        ctx.moveTo(x, cy + 5); ctx.lineTo(x, cy + 19);
      }
      ctx.stroke();
    }

    B.definePortalGame(38, {
      drawBackdrop: drawVisorBackdrop,

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawVisorPosterRig(ctx, S, plates, t, {});
        // Dripping soggy watercolor runs on root chart
        var drips = [[512, 232, "#1d596e"], [602, 260, "#d42a1e"], [736, 245, "#0f8f80"]];
        for (var d = 0; d < drips.length; d++) {
          var len = 45 + ((t * 32 + d * 19) % 55);
          ctx.strokeStyle = drips[d][2];
          ctx.lineWidth = 4.0;
          ctx.beginPath(); ctx.moveTo(drips[d][0], drips[d][1]); ctx.lineTo(drips[d][0], drips[d][1] + len); ctx.stroke();
        }
        drawHotspotShimmer(ctx, B, t, resolved.tree.buttons);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawVisorPosterRig(ctx, S, plates, t, { blacklight: true });
          B.drawVolumetricBeam(ctx, 155, 535, 640, 320, {
            color: "#6366f1",
            coreColor: "#a5b4fc",
            spread: 210 * u + 25,
            intensity: 1.35 * u,
            t: t
          });
          B.drawDeterministicParticles(ctx, "kintsugi", 640, 320, resolved.stemT, { count: 22, loop: true, color: "#84cc16", seed: 38.1 });
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          // Posterboard spins 180 degrees upside-down like a gravy boat!
          drawVisorPosterRig(ctx, S, plates, t, { posterRot: Math.PI * u });
          drawWaterJetStream(ctx, B, 1110, 225, 835, 165, t, u, "#ef4444");
          B.drawDeterministicParticles(ctx, "bubbles", 840, 260, resolved.stemT, { count: 24, loop: true, seed: 38.2 });
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawVisorPosterRig(ctx, S, plates, t, { stamped: u > 0.55 });
          B.drawSnailSilverTrail(ctx, 265, 540, 515, 442, u, t, { arc: 22 });
          S.drawMailSnail(ctx, B.lerp(265, 495, u), B.lerp(540, 448, u), 1.24, t, {});
          B.drawDeterministicParticles(ctx, "snail_trail", 522, 438, resolved.stemT, { count: 16, loop: true, seed: 38.3 });
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawVisorPosterRig(ctx, S, plates, t, {});
          drawBrassCalipers(ctx, S, 640, 326, B.lerp(35, 148, u), t);
          B.drawDeterministicParticles(ctx, "brass_sparks", 788, 326, resolved.stemT, { count: 18, loop: true, seed: 38.4 });
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Probable] Scary Glowing Butcher Meat Diagram (6.0s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawVisorPosterRig(ctx, S, plates, t, { blacklight: true });

            // Plump kraft roast-bird stencil + neon dashed kitchen-cut partition lines (0 text!)
            ctx.save();
            ctx.translate(640, 324);
            ctx.scale(e, e);
            S.drawCutoutPaperEdge(ctx, [
              [-118, 12], [-96, -58], [-18, -78], [76, -54], [116, -8],
              [136, -24], [142, 8], [108, 48], [32, 74], [-68, 68]
            ], "rgba(254, 215, 170, 0.88)", "#f97316", { paperRim: 3.2 });
            ctx.strokeStyle = "#dc2626";
            ctx.lineWidth = 3.5;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.moveTo(-24, -76); ctx.lineTo(-16, 70);
            ctx.moveTo(46, -62);  ctx.lineTo(34, 68);
            ctx.moveTo(-98, 4);   ctx.lineTo(106, 6);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            // Jointed cardboard cleaver chopping gently at top-right!
            ctx.save();
            ctx.translate(845, 175);
            ctx.rotate(-0.35 + Math.sin(t * 6.0) * 0.24);
            S.drawCardboardPuppetPiece(ctx, [[-82, -34], [12, -30], [14, 24], [-80, 20]], { tone: "#cbd5e1", ribs: 2 });
            S.drawCardboardPuppetPiece(ctx, [[12, -10], [66, -8], [66, 8], [12, 8]], { tone: "#78350f", pin: { x: 16, y: 0, r: 4, metal: "brass" } });
            ctx.restore();

            S.drawTurkeyCutawayBadge(ctx, 134, 502, 1.08, t, { dispatch: 0.2 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Plausible] Magical Neon Creek Wish Machine
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawVisorPosterRig(ctx, S, plates, t, { blacklight: true });

            // Orbiting neon Royal Robertson stars + golden mayfly wish silhouettes!
            for (var st = 0; st < 6; st++) {
              var sa = t * 1.5 + (st / 6) * TAU;
              drawCutPaperStar(ctx, S, 640 + Math.cos(sa) * 172, 320 + Math.sin(sa) * 145, 20, 8, 5, t * 2, st % 2 === 0 ? "#84cc16" : "#f97316", 2.0);
            }

            // Wishing Brook Trout + Mail Snail dropping a lucky silver pebble!
            S.drawBrookTrout(ctx, B.lerp(1120, 985, e), 328 + Math.sin(t * 2.6) * 7, 1.16, t, false);
            S.drawMailSnail(ctx, 915, 512, 1.22, t, { flip: true, hasReply: true });
            drawPaperBubble(ctx, 855, 365 + ((t * 55) % 115), 8.5, "#fde047");
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Preposterous] Leaked Roswell Saucer Blueprint Match
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawVisorPosterRig(ctx, S, plates, t, { shiftX: -115, blacklight: true });

            // Real 3-eyed Alien Saucer hovering low RIGHT BESIDE the 1978 posterboard to compare tailfins!
            var sy = 298 + Math.sin(t * 2.5) * 8;
            S.drawAlienSaucer(ctx, B.lerp(1180, 965, e), sy, 1.48, t, false, false);

            // Neon green double-headed comparison arrows matching dome & skirt!
            ctx.strokeStyle = "#4ade80";
            ctx.lineWidth = 3.5;
            ctx.setLineDash([8, 5]);
            ctx.beginPath();
            ctx.moveTo(615, 290); ctx.lineTo(875, 282);
            ctx.moveTo(635, 338); ctx.lineTo(875, 316);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Probable] Stolen Blueprint Of My Submarine
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawVisorPosterRig(ctx, S, plates, t, { posterRot: TAU });

            // Amazed Turkey holding up its own crayon Trout-Sub sketch matching the 1978 drawing!
            S.drawTurkeyCutawayBadge(ctx, 134, 502, 1.08, t, { dispatch: 0.85 });
            ctx.save();
            ctx.translate(285, 448);
            ctx.scale(e, e);
            ctx.rotate(-0.08);
            S.drawCutoutPaperEdge(ctx, [[-76, -54], [76, -54], [76, 54], [-76, 54]], "#fbfaf5", "#14110d", { paperRim: 3.2 });
            // Crayon finned Trout-Sub drawing (0 text!)
            S.drawCutoutPaperEdge(ctx, [[-48, 6], [-20, -18], [28, -16], [54, 4], [28, 22], [-22, 22]], "#0f8f80", "#14110d", { paperRim: 0, shadow: false });
            S.drawCutoutPaperEdge(ctx, [[46, 4], [66, -16], [66, 20]], "#d97706", "#14110d", { paperRim: 0, shadow: false });
            drawPaperBubble(ctx, -10, 2, 11, "#fde047");
            ctx.restore();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Plausible + Snail Mail] Overdue Rental Paddleboat Return Sign (11.8s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            // Posterboard stays UPSIDE DOWN (Math.PI) so dome hangs like a keel + cut-paper swan neck!
            drawVisorPosterRig(ctx, S, plates, t, { posterRot: Math.PI });
            ctx.save();
            ctx.translate(525, 295);
            ctx.scale(e, e);
            S.drawCutoutPaperEdge(ctx, [[0, 30], [-28, -28], [-12, -56], [14, -48], [6, -24], [22, 24]], "#fbfaf5", "#14110d", { paperRim: 2.5 });
            S.drawCutoutPaperEdge(ctx, [[12, -50], [30, -44], [12, -38]], "#f97316", "#14110d", { paperRim: 0, shadow: false });
            ctx.restore();

            // Brook Trout pointing upstream + Mail Snail sliding beads on a brass abacus!
            S.drawBrookTrout(ctx, 985, 312 + Math.sin(t * 2.8) * 6, 1.18, t, false);
            S.drawMailSnail(ctx, 925, 516, 1.22, t, { flip: true, hasReply: true });
            ctx.save();
            ctx.translate(1035, 488);
            ctx.scale(e, e);
            S.drawCutoutPaperEdge(ctx, [[-44, -34], [44, -34], [44, 34], [-44, 34]], "#78350f", "#14110d", { paperRim: 2.5 });
            for (var row = -18; row <= 18; row += 18) {
              ctx.strokeStyle = "#f3d184"; ctx.lineWidth = 2;
              ctx.beginPath(); ctx.moveTo(-36, row); ctx.lineTo(36, row); ctx.stroke();
              for (var b = 0; b < 3; b++) {
                drawPaperBubble(ctx, -22 + b * 16 + Math.sin(t * 6 + row + b) * 6, row, 5.5, b % 2 === 0 ? "#ef4444" : "#38bdf8");
              }
            }
            ctx.restore();
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Preposterous] Spinning Flying Saucer Flight Manual
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawVisorPosterRig(ctx, S, plates, t, { posterRot: t * 2.6 });

            // Saucer performing a joyful 360-degree loop-the-loop barrel roll overhead + rainbow bubbles!
            var loopA = t * 3.4;
            var lx = 640 + Math.cos(loopA) * 145;
            var ly = 148 + Math.sin(loopA) * 58;
            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(loopA);
            S.drawAlienSaucer(ctx, 0, 0, 1.18 * e, t, false, false);
            ctx.restore();

            var bCols = ["#f472b6", "#fde047", "#34d399", "#60a5fa", "#c084fc"];
            for (var rb = 0; rb < 10; rb++) {
              var ru = ((t * 0.55 + rb / 10) % 1);
              drawPaperBubble(ctx, 360 + rb * 62, B.lerp(160, 520, ru), 8 + (rb % 3) * 3, B.rgba(bCols[rb % 5], 0.78));
            }
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Probable] Approved Submarine Patent From 1978
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawVisorPosterRig(ctx, S, plates, t, { stamped: true });
            B.drawLanternHalo(ctx, 522, 438, 95, { color: "#10b981", coreColor: "#fef08a", intensity: 1.2, t: t });
            S.drawMailSnail(ctx, 455, 498, 1.20, t, { hasReply: false });

            // Proud Inventor Turkey wearing pocket-protector stuffed with 3 colorful pencils & T-square!
            S.drawTurkeyCutawayBadge(ctx, 136, 502, 1.10, t, { dispatch: 0.7 });
            ctx.save();
            ctx.translate(238, 496);
            ctx.scale(e, e);
            S.drawCutoutPaperEdge(ctx, [[-24, -12], [24, -12], [20, 36], [-20, 36]], "#fbfaf5", "#14110d", { paperRim: 2.2 });
            var pCols = ["#facc15", "#ef4444", "#3b82f6"];
            for (var p = 0; p < 3; p++) {
              S.drawCutoutPaperEdge(ctx, [[-14 + p * 11, -12], [-14 + p * 11, -44], [-6 + p * 11, -44], [-6 + p * 11, -12]], pCols[p], "#14110d", { paperRim: 0, shadow: false });
            }
            ctx.restore();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Plausible] Validated Creek Wish Machine Ticket
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawVisorPosterRig(ctx, S, plates, t, { stamped: true });

            // Three shiny iridescent water-beetles materializing in silver genie bubbles!
            for (var wb = 0; wb < 3; wb++) {
              var bx = 795 + wb * 48 + Math.sin(t * 4 + wb) * 12;
              var by = 245 + wb * 38 + Math.cos(t * 3.5 + wb) * 8;
              ctx.save();
              ctx.translate(bx, by);
              ctx.scale(e, e);
              S.drawCutoutPaperEdge(ctx, [[-16, 0], [-8, -12], [12, -10], [18, 0], [12, 10], [-8, 12]], "#0d9488", "#14110d", { paperRim: 2.0 });
              ctx.restore();
            }

            S.drawBrookTrout(ctx, 1025, 326, 1.18, t, false);
            // Mail Snail taking a modest bow in a starry blue wizard cone hat!
            S.drawMailSnail(ctx, 495, 502, 1.24, t, { hasReply: true });
            S.drawCutoutPaperEdge(ctx, [[474, 474], [512, 474], [493, 428]], "#3b82f6", "#14110d", { paperRim: 2.0 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Preposterous Alien Finale] Passed Galactic Saucer Safety Check (16.0s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawVisorPosterRig(ctx, S, plates, t, { stamped: true });
            S.drawMailSnail(ctx, 475, 508, 1.24, t, { hasReply: true, hasAlienStamp: true });

            // Tractor beam lifting a glowing emerald inspection sticker onto the saucer's windshield!
            var sy = B.lerp(-40, 108, e);
            B.drawTractorRings(ctx, 885, sy + 18, 522, 438, t, { spread: 135, rings: 5 });
            S.drawAlienSaucer(ctx, 885, sy, 1.32, t, false, false);
            drawPerforatedStamp(ctx, 916, sy + 4, 28, 22, -0.15, "#10b981", "check");

            // Happy pink hearts blinking above all 3 alien eyes!
            drawCutPaperHeart(ctx, S, 855, sy - 42 - Math.abs(Math.sin(t * 5)) * 8, 0.58, -0.2, "#fb7185");
            drawCutPaperHeart(ctx, S, 885, sy - 52 - Math.abs(Math.sin(t * 5 + 1)) * 8, 0.68, 0.0, "#f43f5e");
            drawCutPaperHeart(ctx, S, 915, sy - 42 - Math.abs(Math.sin(t * 5 + 2)) * 8, 0.58, 0.2, "#fb7185");
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Probable] Exact Caliper Match Sub Schematic
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawVisorPosterRig(ctx, S, plates, t, {});
            drawBrassCalipers(ctx, S, 640, 326, 148, t);

            // Toy tin Trout-Sub model inside window matching the exact caliper span!
            S.drawTurkeyCutawayBadge(ctx, 134, 502, 1.08, t, { dispatch: 0.9 });
            ctx.save();
            ctx.translate(295, 488);
            ctx.scale(e, e);
            S.drawCutoutPaperEdge(ctx, [[-68, 0], [-34, -24], [34, -24], [68, 0], [34, 24], [-34, 24]], "#94a3b8", "#14110d", { paperRim: 2.8 });
            drawPaperBubble(ctx, -12, 0, 12, "#fde047");
            ctx.restore();
            drawBrassCalipers(ctx, S, 295, 488, 68 * e, t);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Plausible] Measured Custom Trout Wish Pod
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawVisorPosterRig(ctx, S, plates, t, {});
            drawBrassCalipers(ctx, S, 640, 326, 148, t);

            // Brook Trout hovering right inside the open brass caliper jaws nose-to-tail!
            S.drawBrookTrout(ctx, 640, 322 + Math.sin(t * 4) * 4, 1.38 * e, t, false);
            S.drawMailSnail(ctx, 935, 508, 1.24, t, { flip: true, hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Preposterous] Calibrated Miniature Roswell Scout Plans
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawVisorPosterRig(ctx, S, plates, t, { blacklight: true });
            drawBrassCalipers(ctx, S, 640, 326, 148, t);

            // Shimmering 3D cyan wireframe saucer popping off the posterboard right between caliper tips!
            var liftY = 295 + Math.sin(t * 3.2) * 10;
            ctx.save();
            ctx.translate(640, liftY);
            ctx.scale(e, e);
            ctx.strokeStyle = "#2dd4bf";
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.ellipse(0, 0, 138, 34, 0, 0, TAU);
            ctx.ellipse(0, -8, 62, 24, 0, 0, TAU);
            for (var ribs = -3; ribs <= 3; ribs++) {
              ctx.moveTo(ribs * 18, -28);
              ctx.lineTo(ribs * 42, 24);
            }
            ctx.stroke();
            ctx.restore();

            var sy = B.lerp(-40, 104, e);
            B.drawTractorRings(ctx, 975, sy + 18, 640, liftY, t, { spread: 145, rings: 5 });
            S.drawAlienSaucer(ctx, 975, sy, 1.22, t, false, false);
          }
        }
      }
    });
  })();

  // ==========================================================================
  // PORTHOLE #39 · PARLOR ("perec-stage" · p39.jpg + atlas-24.webp)
  // ==========================================================================
  (function buildPortal39() {
    var B = getBG();
    if (!B) return;

    var OPEN = { openX: 175, openY: 66, openW: 930, openH: 550, doors: true };

    function drawParlorBackdrop(ctx, W, H, resolved, plates, S) {
      var t = resolved.t;
      S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 39, t, makeBackdropState(resolved), OPEN);

      ctx.save();
      ctx.beginPath();
      ctx.rect(OPEN.openX, OPEN.openY, OPEN.openW, OPEN.openH);
      ctx.clip();

      // Room ambient wash per branch
      var rg = ctx.createLinearGradient(0, OPEN.openY, 0, OPEN.openY + OPEN.openH);
      if (resolved.selectedButton === "x" && resolved.selectedTier === "probable") {
        rg.addColorStop(0, "#6e4f36"); rg.addColorStop(0.65, "#8f6744"); rg.addColorStop(1, "#4a321f");
      } else if (resolved.selectedTier === "preposterous") {
        rg.addColorStop(0, "#11222c"); rg.addColorStop(0.65, "#1b3a46"); rg.addColorStop(1, "#0d1b22");
      } else {
        rg.addColorStop(0, "#1f545c"); rg.addColorStop(0.65, "#2d6f75"); rg.addColorStop(1, "#193d42");
      }
      ctx.fillStyle = rg;
      ctx.fillRect(OPEN.openX, OPEN.openY, OPEN.openW, OPEN.openH);

      // Pyramid Song submerged lit doorway crop (atlas-24.webp: 740x297)
      var aImg = plates.atlasImg;
      var pImg = plates.portholeImg;
      var dryWarm = (resolved.selectedButton === "x" && resolved.selectedTier === "probable");
      S.drawScissorCutout(ctx, aImg, 150, 8, 450, 280, 380 + Math.sin(t * 0.45) * 6, 98, 520, 310, null, {
        filter: dryWarm ? "sepia" : "none",
        haloWidth: 3.5,
        alpha: dryWarm ? 0.55 : 0.78
      });

      // Rose-damask wallpaper swatches from p39.jpg flanking doorway
      S.drawScissorCutout(ctx, pImg, 205, 118, 165, 138, 195, 92, 225, 295, null, { filter: dryWarm ? "sepia" : "none", haloWidth: 3.5, alpha: 0.86 });
      S.drawScissorCutout(ctx, pImg, 205, 118, 165, 138, 860, 92, 225, 295, null, { filter: dryWarm ? "sepia" : "none", haloWidth: 3.5, alpha: 0.86 });

      S.drawNorsteinFog(ctx, W, H, t, dryWarm ? 0.10 : 0.22, dryWarm ? "255, 232, 195" : "205, 236, 235");

      // Wooden parlor floorboards
      S.drawTornPaperFlat(ctx, OPEN.openX - 10, 468, OPEN.openW + 20, 160, {
        fill: dryWarm ? "#6e492c" : "#304847",
        paperColor: "#e8e2d5",
        deckle: 3.5,
        seed: 19.8
      });

      if (!dryWarm) {
        B.drawWaterCaustics(ctx, W, OPEN.openY + OPEN.openH, t, { intensity: 0.20, topY: 80, stageH: 610 });
      }
      ctx.restore();
    }

    function drawParlorRig(ctx, S, plates, t, cfg) {
      var c = cfg || {};
      var pImg = plates.portholeImg;
      var zeroG = c.zeroG || 0;

      ctx.save();
      ctx.beginPath();
      ctx.rect(OPEN.openX, OPEN.openY, OPEN.openW, OPEN.openH);
      ctx.clip();

      // 1. Braided Oriental Parlor Rug Cutout from p39.jpg
      var rugLift = (c.rugVacuum ? 28 + Math.sin(t * 15) * 8 : 0) + zeroG * 135;
      ctx.save();
      ctx.translate(615, 530 - rugLift);
      ctx.rotate(zeroG * 0.18 + (c.rugWave ? Math.sin(t * 3.2) * 0.04 : 0));
      S.drawScissorCutout(ctx, pImg, 222, 418, 252, 82, -280, -58, 560, 116,
        c.rugVacuum
          ? [[0.03, 0.18], [0.55, 0.14], [0.84, -0.38], [0.98, 0.42], [0.94, 0.94], [0.02, 0.94]]
          : [[0.04, 0.08], [0.94, 0.08], [0.98, 0.94], [0.01, 0.94]],
        { haloWidth: 4.0 }
      );
      if (c.rugFluffed) {
        // Bright crimson-and-gold wool spirals revealed on fluffed rug!
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.ellipse(0, 4, 185, 24, 0, 0, TAU); ctx.stroke();
        ctx.strokeStyle = "#fbbf24";
        ctx.beginPath(); ctx.ellipse(0, 4, 120, 14, 0, 0, TAU); ctx.stroke();
      }
      ctx.restore();

      // 2. Fringed Parlor Floor Lamp Cutout from p39.jpg + Beaded Fringe & Pull-Chain!
      var lampX = 772;
      var lampY = 148 - zeroG * 28 + Math.sin(t * 1.6) * 4;
      if (c.lampLit) {
        B.drawLanternHalo(ctx, lampX + 68, lampY + 95, 275, { color: "#f59e0b", coreColor: "#fef9c3", intensity: 1.4, t: t });
      }
      S.drawScissorCutout(ctx, pImg, 368, 144, 102, 316, lampX, lampY, 138, 366, [
        [0.18, 0.03], [0.82, 0.03], [0.98, 0.36], [0.64, 0.40], [0.64, 0.92],
        [0.86, 0.98], [0.14, 0.98], [0.36, 0.92], [0.36, 0.40], [0.02, 0.36]
      ], { haloWidth: 4.5 });

      // Animated glass lampshade fringe beads when c.fringeDance!
      if (c.fringeDance) {
        for (var fb = 0; fb < 11; fb++) {
          var fx = lampX + 14 + fb * 11;
          var fy = lampY + 132;
          var swing = Math.sin(t * 12 + fb * 0.7) * 9;
          ctx.strokeStyle = fb % 2 === 0 ? "#fde047" : "#38bdf8";
          ctx.lineWidth = 2.6;
          ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + swing, fy + 22); ctx.stroke();
        }
      }

      // Beaded brass pull-chain dangling to (845, 465) [Anchor □]
      var tugY = (c.chainTug || 0) * 22;
      ctx.strokeStyle = "#f3d184";
      ctx.lineWidth = 3.0;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(lampX + 82, lampY + 138);
      ctx.lineTo(848, 458 + tugY);
      ctx.stroke();
      ctx.setLineDash([]);
      drawPaperBubble(ctx, 848, 464 + tugY, 7.5, "#fbbf24");

      // 3. Tufted Green Wingback Armchair Cutout from p39.jpg (cropped cleanly above turkey reflection!)
      var chairY = 246 - zeroG * 85 + Math.sin(t * 1.7) * 8;
      S.drawScissorCutout(ctx, pImg, 148, 244, 218, 220, 278, chairY, 288, 272, [
        [0.04, 0.10], [0.68, 0.04], [0.86, 0.14], [0.86, 0.48],
        [0.98, 0.52], [0.94, 0.96], [0.14, 0.98], [0.08, 0.62]
      ], { haloWidth: 5.0, rot: zeroG * -0.22 + Math.sin(t * 1.3) * 0.03 });

      // 4. Parlor Wooden End-Table + Scalloped White Lace Doily + Porcelain Teacup (near Anchor △: 430, 465 / center)
      var tbX = 618;
      var tbY = 432 - zeroG * 145;
      ctx.save();
      ctx.translate(tbX, tbY);
      ctx.rotate(zeroG * 0.25);
      S.drawCardboardPuppetPiece(ctx, [[-48, 0], [48, 0], [36, 98], [-36, 98]], { tone: "#6e4628", ribs: 2 });
      S.drawCutoutPaperEdge(ctx, [[-62, -4], [62, -4], [52, 12], [-52, 12]], "#fbfaf5", "#14110d", { paperRim: 2.2 });
      // Porcelain teacup
      S.drawCutoutPaperEdge(ctx, [[12, -28], [44, -28], [38, -4], [18, -4]], "#fef08a", "#14110d", { paperRim: 2.0 });
      if (c.postcardDelivered) {
        S.drawCutoutPaperEdge(ctx, [[-46, -24], [-4, -24], [0, -2], [-42, -2]], "#fbfaf5", "#14110d", { paperRim: 2.0 });
        ctx.fillStyle = "#0f8f80";
        ctx.beginPath(); ctx.arc(-22, -13, 4.5, 0, TAU); ctx.fill();
      }
      ctx.restore();

      if (c.extraInside) c.extraInside(ctx, tbX, tbY, lampX, lampY);
      ctx.restore();
    }

    B.definePortalGame(39, {
      drawBackdrop: drawParlorBackdrop,

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawParlorRig(ctx, S, plates, t, {});
        drawHotspotShimmer(ctx, B, t, resolved.tree.buttons);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawParlorRig(ctx, S, plates, t, { lampLit: true, fringeDance: true });
          B.drawVolumetricBeam(ctx, 185, 310, 840, 235, {
            color: "#38bdf8",
            coreColor: "#fef08a",
            spread: 145 * u + 25,
            intensity: 1.3 * u,
            t: t
          });
          B.drawDeterministicParticles(ctx, "kintsugi", 840, 235, resolved.stemT, { count: 20, loop: true, seed: 39.1 });
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawParlorRig(ctx, S, plates, t, { rugFluffed: u > 0.3, rugWave: true });
          drawWaterJetStream(ctx, B, 1085, 485, 615, 520, t, u, "#ef4444");
          B.drawDeterministicParticles(ctx, "bubbles", 640, 515, resolved.stemT, { count: 24, loop: true, seed: 39.2 });
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawParlorRig(ctx, S, plates, t, { postcardDelivered: u > 0.65 });
          B.drawSnailSilverTrail(ctx, 255, 545, 575, 424, u, t, { arc: 28 });
          S.drawMailSnail(ctx, B.lerp(255, 562, u), B.lerp(545, 422, u), 1.22, t, {});
          B.drawDeterministicParticles(ctx, "snail_trail", 575, 424, resolved.stemT, { count: 16, loop: true, seed: 39.3 });
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          var tug = Math.max(0, Math.sin(t * 9.0)) * u;
          drawParlorRig(ctx, S, plates, t, { chainTug: tug, fringeDance: true, lampLit: tug > 0.3 });
          drawIKTongs(ctx, S, 1105, 545, B.lerp(980, 848, u), 464 + tug * 22, 200, 190, -1, 0.14);
          B.drawDeterministicParticles(ctx, "brass_sparks", 848, 464, resolved.stemT, { count: 18, loop: true, seed: 39.4 });
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Probable] Grandma Cozy Dry Front Parlor (6.0s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawParlorRig(ctx, S, plates, t, {
              lampLit: true,
              extraInside: function (g, tbX, tbY) {
                // Oval framed Turkey Ancestor Portrait hanging on dry rose parlor wall!
                g.save();
                g.translate(635, 188);
                g.scale(e, e);
                S.drawCutoutPaperEdge(g, [[-46, 0], [-32, -56], [0, -66], [32, -56], [46, 0], [32, 56], [0, 66], [-32, 56]], "#c99842", "#14110d", { paperRim: 3.5 });
                S.drawTurkeyInCorner(g, -4, 14, 0.54, t, { dispatch: 0 });
                g.restore();

                // Tiny silver minnow swimming comically right past the "dry" armchair!
                var mx = 420 + ((t * 75) % 420);
                S.drawBrookTrout(g, mx, 338 + Math.sin(t * 5) * 6, 0.42, t, true);

                // Turkey wearing cozy fuzzy pink parlor slippers!
                S.drawTurkeyCutawayBadge(g, 248, 512, 0.98, t, { dispatch: 0.6 });
                drawPaperBubble(g, 298, 558, 16, "#f472b6");
                drawPaperBubble(g, 326, 558, 16, "#f472b6");
              }
            });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Plausible] Reverse Goldfish Bowl On Rug
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawParlorRig(ctx, S, plates, t, {
              lampLit: true,
              extraInside: function (g) {
                // Brook Trout lounging above the green velvet cushion reading a broadsheet newspaper (0 text!)
                var tx = 432, ty = 342 + Math.sin(t * 2.2) * 5;
                S.drawBrookTrout(g, tx, ty, 1.18 * e, t, true);
                g.save();
                g.translate(tx + 54, ty + 14);
                g.rotate(-0.15);
                S.drawCutoutPaperEdge(g, [[-38, -28], [38, -28], [38, 28], [-38, 28]], "#e5e5e5", "#14110d", { paperRim: 2.2 });
                g.strokeStyle = "#525252"; g.lineWidth = 2;
                for (var ln = -18; ln <= 18; ln += 9) {
                  g.beginPath(); g.moveTo(-28, ln); g.lineTo(28, ln); g.stroke();
                }
                g.restore();

                // Mail Snail curled like the family cat on a tufted red velvet footstool!
                S.drawCutoutPaperEdge(g, [[518, 498], [598, 498], [592, 532], [524, 532]], "#9f1239", "#14110d", { paperRim: 2.5 });
                S.drawMailSnail(g, 558, 488, 1.16, t, { hasReply: true, trail: false });
              }
            });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [✕ -> Preposterous] Lit Human Zoo Habitat Cage
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawParlorRig(ctx, S, plates, t, {
              lampLit: true,
              extraInside: function (g) {
                // Glowing cyan museum vivarium laser bars + holographic pictographic exhibit plaque (0 text!)
                for (var bx = 245; bx <= 1045; bx += 110) {
                  g.strokeStyle = "rgba(45, 212, 191, 0.68)";
                  g.lineWidth = 4.0;
                  g.beginPath(); g.moveTo(bx, 115); g.lineTo(bx, 610); g.stroke();
                }
                B.drawXRayOverlay(ctx, 625, 235, 195, 96, e, function (xg, cx, cy) {
                  // Pictographic Chair + Teacup exhibit icons!
                  xg.strokeStyle = "#fde047"; xg.lineWidth = 3;
                  xg.strokeRect(cx - 56, cy - 22, 34, 42);
                  xg.beginPath(); xg.arc(cx + 28, cy + 4, 18, 0, Math.PI); xg.stroke();
                }, { t: t, borderColor: "#2dd4bf" });

                S.drawAlienSaucer(g, 640, B.lerp(40, 126, e), 1.28, t, 625, 360, { beamSpread: 185 });
              }
            });
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Probable] Shimmering Underwater Living Room Mirage
            var t = resolved.t;
            drawParlorRig(ctx, S, plates, t, {
              rugFluffed: true,
              rugWave: true,
              extraInside: function (g) {
                for (var sb = 0; sb < 10; sb++) {
                  var su = ((t * 0.45 + sb / 10) % 1);
                  drawPaperBubble(g, 310 + sb * 65, B.lerp(520, 140, su), 5 + (sb % 3) * 3);
                }
                S.drawTurkeyCutawayBadge(g, 248, 512, 0.98, t, { dispatch: 0.8 });
              }
            });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Plausible + Snail Mail] Giant Noisy Creek Rug Vacuum (11.8s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawParlorRig(ctx, S, plates, t, {
              rugFluffed: true,
              rugVacuum: true,
              extraInside: function (g) {
                // Vibrating upright red-and-steel cardboard Cyclone Rug Vacuum!
                var vx = 765 + Math.sin(t * 22) * 4;
                var vy = 486;
                S.drawCardboardPuppetPiece(g, [[vx - 115, vy + 16], [vx + 26, vy + 16], [vx + 38, vy + 52], [vx - 135, vy + 52]], { tone: "#b83326", ribs: 2 });
                S.drawCardboardPuppetPiece(g, [[vx - 24, vy + 16], [vx - 40, vy - 165], [vx + 18, vy - 172], [vx + 24, vy + 16]], { tone: "#64748b", ribs: 4, pin: { x: vx, y: vy + 4, r: 5, metal: "brass" } });

                // Brook Trout peeking nervously behind the green armchair holding ears!
                S.drawBrookTrout(g, 445, B.lerp(360, 242, e), 1.06, t, true);
                // Mail Snail clinging fast to the heavy lamp base!
                S.drawMailSnail(g, 855, 498, 1.20, t, { flip: true, hasReply: true });
              }
            });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [○ -> Preposterous] Floating Fourth Dimension Gravity Parlor
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawParlorRig(ctx, S, plates, t, {
              rugFluffed: true,
              lampLit: true,
              zeroG: e,
              extraInside: function (g) {
                var sy = B.lerp(40, 122, e);
                B.drawTractorRings(g, 640, sy + 18, 615, 420, t, { spread: 210, rings: 6 });
                S.drawAlienSaucer(g, 640, sy, 1.22, t, false, false);
                // Upside-down swimming creek fish in 4D gravity!
                g.save();
                g.translate(925, 265);
                g.scale(1, -1);
                S.drawBrookTrout(g, 0, 0, 0.78, t, false);
                g.restore();
              }
            });
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Probable] Afternoon Tea Invitation On Doily
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawParlorRig(ctx, S, plates, t, {
              postcardDelivered: true,
              lampLit: true,
              extraInside: function (g) {
                S.drawMailSnail(g, 556, 422, 1.18, t, { hasReply: false });
                // Turkey peering through brass binoculars & raising speckled blue enamel cider mug!
                S.drawTurkeyCutawayBadge(g, 248, 512, 1.0, t, { dispatch: 0.7 });
                drawPaperBubble(g, 292, 478, 12, "#d4a44c");
                drawPaperBubble(g, 312, 478, 12, "#d4a44c");
                g.save();
                g.translate(348, 512);
                g.scale(e, e);
                S.drawCutoutPaperEdge(g, [[-18, -22], [18, -22], [16, 22], [-16, 22]], "#1d4ed8", "#14110d", { paperRim: 2.2 });
                g.restore();
              }
            });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Plausible] Polite Parlor Houseguest Creek Visit
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawParlorRig(ctx, S, plates, t, {
              postcardDelivered: true,
              lampLit: true,
              extraInside: function (g, tbX, tbY) {
                // Brook Trout pouring sparkling bubble-tea from floral porcelain teapot into Mail Snail's cup!
                S.drawBrookTrout(g, 935, 365, 1.14 * e, t, false);
                g.save();
                g.translate(715, 378);
                g.rotate(-0.42 + Math.sin(t * 3) * 0.08);
                S.drawCutoutPaperEdge(g, [[-28, -22], [28, -22], [34, 22], [-24, 22]], "#fbcfe8", "#14110d", { paperRim: 2.5 });
                S.drawCutoutPaperEdge(g, [[-28, -6], [-56, -18], [-48, 6], [-26, 8]], "#f9a8d4", "#14110d", { paperRim: 2.0 });
                g.restore();

                for (var tb = 0; tb < 4; tb++) {
                  var bu = ((t * 1.1 + tb / 4) % 1);
                  drawPaperBubble(g, B.lerp(662, 646, bu), B.lerp(372, 404, bu), 4.2, "#fde047");
                }
                S.drawMailSnail(g, 558, 422, 1.18, t, { hasReply: true });
              }
            });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [△ -> Preposterous Alien Finale] Delivered Mail To Dimension Four (16.0s Strip Shot!)
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawParlorRig(ctx, S, plates, t, {
              postcardDelivered: true,
              lampLit: true,
              extraInside: function (g, tbX, tbY) {
                var sy = B.lerp(40, 122, e);
                B.drawTractorRings(g, 618, sy + 18, tbX, tbY - 46, t, { spread: 125, rings: 5 });

                // Cut-glass parlor vase holding a glowing bouquet of Crystal Daisies right beside Mail Snail's postcard!
                g.save();
                g.translate(tbX, tbY - 26);
                g.scale(e, e);
                S.drawCutoutPaperEdge(g, [[-16, 22], [-22, -16], [22, -16], [16, 22]], "#38bdf8", "#14110d", { paperRim: 2.2 });
                var flPos = [[-22, -44], [0, -56], [22, -44]];
                for (var fl = 0; fl < 3; fl++) {
                  g.strokeStyle = "#34d399"; g.lineWidth = 3;
                  g.beginPath(); g.moveTo(0, -14); g.lineTo(flPos[fl][0], flPos[fl][1]); g.stroke();
                  drawCutPaperStar(g, S, flPos[fl][0], flPos[fl][1], 16, 7, 6, t + fl, "#e0f2fe", 1.5);
                  drawPaperBubble(g, flPos[fl][0], flPos[fl][1], 5, "#fde047");
                }
                g.restore();

                S.drawMailSnail(g, 535, 422, 1.22, t, { hasReply: true, hasAlienStamp: true });
                S.drawAlienSaucer(g, 618, sy, 1.24, t, false, false);
              }
            });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Probable] Swinging Beaded Lampshade Parlor Encore
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawParlorRig(ctx, S, plates, t, {
              lampLit: true,
              fringeDance: true,
              chainTug: Math.abs(Math.sin(t * 7)),
              extraInside: function (g, tbX, tbY, lampX, lampY) {
                drawIKTongs(g, S, 1085, 545, 848, 476, 190, 180, -1, 0.14);
                // Dozens of glittering rainbow diamond prisms scattered across the rose parlor!
                var pCols = ["#f43f5e", "#fde047", "#34d399", "#38bdf8", "#c084fc"];
                for (var pr = 0; pr < 16; pr++) {
                  var pa = t * 1.3 + pr * 0.9;
                  var px = lampX + 68 + Math.cos(pa) * (95 + (pr % 4) * 65);
                  var py = lampY + 95 + Math.sin(pa * 1.2) * (75 + (pr % 3) * 55);
                  drawCutPaperStar(g, S, px, py, 12 * e, 5 * e, 4, pa, pCols[pr % 5], 0);
                }
                S.drawTurkeyCutawayBadge(g, 248, 512, 1.02, t, { dispatch: 0.85 });
              }
            });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Plausible] Secret Butler Bell For Snacks
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawParlorRig(ctx, S, plates, t, {
              lampLit: true,
              fringeDance: true,
              extraInside: function (g) {
                // Butler Brook Trout wearing crisp white waiter's napkin & carrying slate tray of 3 green crackers!
                var tx = B.lerp(1080, 755, e);
                var ty = 378 + Math.sin(t * 2.8) * 5;
                S.drawBrookTrout(g, tx, ty, 1.16, t, false);
                // White linen waiter's napkin draped over pectoral fin
                S.drawCutoutPaperEdge(g, [[tx - 44, ty + 6], [tx - 24, ty + 6], [tx - 20, ty + 44], [tx - 48, ty + 44]], "#fbfaf5", "#14110d", { paperRim: 1.8 });
                // Flat stone tray + 3 crunchy green duckweed crackers
                S.drawCutoutPaperEdge(g, [[tx - 118, ty - 6], [tx - 46, ty - 6], [tx - 52, ty + 4], [tx - 112, ty + 4]], "#475569", "#14110d", { paperRim: 1.5 });
                for (var ck = 0; ck < 3; ck++) {
                  drawPaperBubble(g, tx - 102 + ck * 20, ty - 14, 7.5, "#84cc16");
                }
                S.drawMailSnail(g, 558, 422, 1.20, t, { hasReply: true });
              }
            });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // [□ -> Preposterous] Activated Saucer Chandelier Teleport Beam
            var t = resolved.t;
            var e = outcomeProgress(resolved);
            drawParlorRig(ctx, S, plates, t, {
              lampLit: true,
              fringeDance: true,
              chainTug: 0.8,
              extraInside: function (g) {
                drawIKTongs(g, S, 1085, 545, 848, 480, 190, 180, -1, 0.14);
                // Warm golden Sunday-afternoon skylight reading beam pouring from overhead Chandelier Saucer!
                var sy = B.lerp(40, 114, e);
                B.drawVolumetricBeam(g, 625, sy + 16, 625, 560, {
                  color: "#fbbf24",
                  coreColor: "#fffbeb",
                  spread: 310 * e,
                  intensity: 1.55 * e,
                  t: t
                });
                S.drawAlienSaucer(g, 625, sy, 1.30, t, false, false);
              }
            });
          }
        }
      }
    });
  })();

})(typeof window !== "undefined" ? window : globalThis);
