/* ============================================================================
 * Turkey Sub · V3 Interactive 12-Branch Controller Cinema — Pod 3A (#23–#28)
 * File: portals/v3-pod3-a.js
 *
 * 6 Portholes × 17 Bespoke Nodes (1 Root + 4 Physical Stems + 12 Outcomes = 102 States):
 *   - #23 · Scope B : "duchamp-optic"      (p23.jpg + atlas-42.webp) · Sea-Anemone Wall Clock
 *   - #24 · Rudder  : "cardboard-parallax" (p24.jpg + atlas-51.webp) · Chewed-Up Green Fishing Net
 *   - #25 · Lock    : "queneau-rostrum"    (p25.jpg + atlas-45.webp) · Trout in Glass Fishbowl
 *   - #26 · Boiler  : "cardboard-parallax" (p26.jpg + atlas-48.webp) · Glowing Riverbed Coals
 *   - #27 · Port M  : "duchamp-optic"      (p27.jpg + atlas-17.webp) · Sunken Rabbit-Ear TV
 *   - #28 · Stbd M  : "daumier-litho"      (p28.jpg + atlas-03.webp) · Silver Minnow Wave
 *
 * STRICT BLIND-MODE INVARIANT:
 *   Emits ZERO ctx.fillText / ctx.strokeText calls anywhere in scene code and
 *   crops ZERO baked-in text/nametags from source plates. All captions/HUD are
 *   rendered exclusively by BRANCH_GAME.drawControllerHUD when showCaptions !== false.
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var PORTAL_IDS = [23, 24, 25, 26, 27, 28];

  if (root) {
    root.PORTAL_V3_GAMES = root.PORTAL_V3_GAMES || {};
  }

  function getStage() {
    return (root && root.SCION_STAGE) || (typeof require === "function" ? require("./scion-stage.js") : null);
  }

  function getEngine() {
    return (root && root.BRANCH_GAME) || (typeof require === "function" ? require("./branch-game-engine.js") : null);
  }

  var _bootStage = getStage();
  if (_bootStage && typeof _bootStage.preloadPortalPlates === "function") {
    _bootStage.preloadPortalPlates(PORTAL_IDS);
  }

  // ==========================================================================
  // SHARED CUTOUT, KINEMATIC & DIEGETIC CONTROLLER PROP TOOLKIT (0 TEXT!)
  // ==========================================================================

  // Normalized [0..1] crop wrapper around S.drawScissorCutout (safe across plate resolutions)
  function drawPlateFrac(ctx, S, img, fx, fy, fw, fh, dx, dy, dw, dh, polyPts, opts) {
    if (!S || typeof S.drawScissorCutout !== "function") return;
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

  function limbPoly(x0, y0, x1, y1, w0, w1) {
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

  function drawIKCardboardLimb(ctx, S, x0, y0, l1, l2, tx, ty, bendDir, opts) {
    var cfg = opts || {};
    var ik = S.solveIK2(x0, y0, l1, l2, tx, ty, bendDir || 1);
    var w0 = cfg.w0 || 12;
    var w1 = cfg.w1 || 9;
    var w2 = cfg.w2 || 7;
    S.drawCardboardPuppetPiece(ctx, limbPoly(ik.x0, ik.y0, ik.jx, ik.jy, w0, w1), {
      tone: cfg.upperTone || "#8b8982",
      ribs: 2,
      shadow: cfg.shadow !== false
    });
    S.drawCardboardPuppetPiece(ctx, limbPoly(ik.jx, ik.jy, ik.ex, ik.ey, w1, w2), {
      tone: cfg.lowerTone || "#a6a39b",
      ribs: 2,
      shadow: cfg.shadow !== false,
      pins: [
        { x: ik.x0, y: ik.y0, r: cfg.pinR || 4.2, metal: cfg.metal || "brass" },
        { x: ik.jx, y: ik.jy, r: (cfg.pinR || 4.2) * 0.92, metal: "silver" }
      ]
    });
    return ik;
  }

  // Articulated 2-bone IK Submarine Brass Scissor-Probe / Tongs / Hoop (□ Square Tool!)
  function drawBrassProbe(ctx, S, BG, baseX, baseY, tipX, tipY, t, opts) {
    var cfg = opts || {};
    var u = cfg.u == null ? 1 : BG.clamp(cfg.u, 0, 1);
    var curX = BG.lerp(baseX, tipX, BG.easeOutBack(u));
    var curY = BG.lerp(baseY, tipY, BG.easeOutCubic(u));
    var ik = drawIKCardboardLimb(ctx, S, baseX, baseY, cfg.l1 || 195, cfg.l2 || 185, curX, curY, cfg.bendDir || -1, {
      w0: 15,
      w1: 11.5,
      w2: 8.5,
      upperTone: "#9e7731",
      lowerTone: "#c99842",
      pinR: 5.0,
      metal: "brass"
    });

    var ang = Math.atan2(ik.ey - ik.jy, ik.ex - ik.jx) + (cfg.tipRot || 0);
    ctx.save();
    ctx.translate(ik.ex, ik.ey);
    ctx.rotate(ang);

    if (cfg.hoop) {
      var hr = cfg.hoopR || 54;
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 13;
      ctx.beginPath();
      ctx.arc(hr + 6, 0, hr, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = cfg.hoopColor || "#e8be63";
      ctx.lineWidth = 8.5;
      ctx.beginPath();
      ctx.arc(hr + 6, 0, hr, 0, TAU);
      ctx.stroke();
      S.drawSplitPin(ctx, 4, 0, 5.2, { metal: "brass" });
    } else if (cfg.magnet) {
      // Red-and-silver U-horseshoe magnet clamped in brass tongs
      S.drawCutoutPaperEdge(
        ctx,
        [[0, -24], [38, -24], [38, -10], [14, -10], [14, 10], [38, 10], [38, 24], [0, 24]],
        "#d42a1e",
        "#14110d",
        { paperRim: 2.5 }
      );
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(26, -23, 11, 12);
      ctx.fillRect(26, 11, 11, 12);
      S.drawSplitPin(ctx, 0, 0, 4.8, { metal: "brass" });
    } else {
      var jaw = cfg.jaw != null ? cfg.jaw : (0.16 + 0.22 * Math.abs(Math.sin(t * 7.5)));
      ctx.save();
      ctx.rotate(-jaw);
      S.drawCardboardPuppetPiece(ctx, [[-6, -6], [46, -12], [54, -2], [-4, 4]], { tone: "#e3b55a", ribs: 1 });
      ctx.restore();
      ctx.save();
      ctx.rotate(jaw);
      S.drawCardboardPuppetPiece(ctx, [[-6, -4], [54, 2], [46, 12], [-4, 6]], { tone: "#cca047", ribs: 1 });
      ctx.restore();
      S.drawSplitPin(ctx, 0, 0, 4.8, { metal: "brass" });
    }
    ctx.restore();

    if (cfg.sparks !== false) {
      BG.drawDeterministicParticles(ctx, "brass_sparks", ik.ex, ik.ey, t, {
        loop: true,
        count: cfg.sparkCount || 12,
        seed: cfg.seed || 41.7
      });
    }
    return ik;
  }

  // Visible diegetic target rings aligned with PORTHOLE_BRANCH_TREES[id].buttons.*.anchor
  function drawRootHotspotTargets(ctx, BG, resolved) {
    if (!resolved || !resolved.tree || !resolved.tree.buttons) return;
    var btns = resolved.tree.buttons;
    var keys = ["x", "o", "triangle", "square"];
    var t = resolved.t || 0;
    ctx.save();
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var b = btns[k];
      if (!b || !b.anchor) continue;
      var ax = b.anchor.x;
      var ay = b.anchor.y;
      var pulse = 0.85 + 0.15 * Math.sin(t * 3.4 + i * 1.5);
      var col = b.color || "#fbbf24";
      ctx.globalAlpha = 0.48;
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(ax, ay, 22 * pulse, 0, TAU);
      ctx.stroke();

      ctx.globalAlpha = 0.72;
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(ax, ay, 26 * pulse, t * 0.8 + i, t * 0.8 + i + TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  // Crimson Ballast / Current Puff Jet (○ Circle Tool!)
  function drawCurrentPuffJet(ctx, BG, x0, y0, tx, ty, u, t, opts) {
    var cfg = opts || {};
    var prog = BG.clamp(u == null ? 1 : u, 0, 1);
    if (prog <= 0.01) return;
    var dx = tx - x0;
    var dy = ty - y0;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len;
    var ny = dx / len;
    var col = cfg.color || "#f87171";

    ctx.save();
    for (var i = -2; i <= 2; i++) {
      var lat = i * 16;
      ctx.strokeStyle = i === 0 ? "rgba(251, 250, 245, 0.78)" : BG.rgba(col, 0.62);
      ctx.lineWidth = i === 0 ? 3.8 : 2.6;
      ctx.setLineDash([16, 10]);
      ctx.lineDashOffset = -t * 150 - Math.abs(i) * 12;
      ctx.beginPath();
      var sx = x0 + nx * lat * 0.35;
      var sy = y0 + ny * lat * 0.35;
      var ex = BG.lerp(x0, tx, prog) + nx * lat * 1.35;
      var ey = BG.lerp(y0, ty, prog) + ny * lat * 1.35;
      var mx = (sx + ex) * 0.5 + nx * Math.sin(t * 6 + i) * 18;
      var my = (sy + ey) * 0.5 + ny * Math.sin(t * 6 + i) * 18;
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(mx, my, ex, ey);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();

    BG.drawDeterministicParticles(ctx, "bubbles", BG.lerp(x0, tx, prog * 0.85), BG.lerp(y0, ty, prog * 0.85), t, {
      loop: true,
      count: cfg.bubbles || 20,
      spreadX: 95,
      spreadY: 48,
      color: "rgba(254, 202, 202, 0.82)",
      seed: cfg.seed || 29.4
    });
  }

  function drawStarPoly(ctx, S, cx, cy, points, rOuter, rInner, rot, fill, stroke, rim) {
    var pts = [];
    var n = points * 2;
    for (var i = 0; i < n; i++) {
      var r = i % 2 === 0 ? rOuter : rInner;
      var a = (i / n) * TAU + (rot || 0);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    S.drawCutoutPaperEdge(ctx, pts, fill || "#fde047", stroke || "#14110d", {
      paperRim: rim != null ? rim : 2.2
    });
  }

  function drawCutoutMinnow(ctx, S, x, y, ang, sc, wag, fillCol, opts) {
    var cfg = opts || {};
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang || 0);
    ctx.scale(sc || 1, sc || 1);
    var w = wag || 0;
    S.drawCutoutPaperEdge(
      ctx,
      [[20, 0], [6, -7.5], [-11, -5.5], [-22, -11 + w], [-16, w * 0.5], [-22, 11 + w], [-11, 5.5], [6, 7.5]],
      fillCol || "#f8fafc",
      cfg.stroke || "#14110d",
      { paperRim: cfg.rim != null ? cfg.rim : 2.0, lineWidth: 1.7, shadow: cfg.shadow !== false }
    );
    ctx.fillStyle = "#14110d";
    ctx.beginPath();
    ctx.arc(11, -1.5, 1.8, 0, TAU);
    ctx.fill();
    if (cfg.backpack) {
      S.drawCutoutPaperEdge(ctx, [[-6, -13], [5, -13], [5, -5], [-6, -5]], cfg.backpack, "#14110d", {
        paperRim: 1.2,
        shadow: false
      });
    }
    if (cfg.plume) {
      S.drawCutoutPaperEdge(ctx, [[4, -7], [9, -21], [15, -7]], cfg.plume, "#14110d", {
        paperRim: 1.0,
        shadow: false
      });
    }
    if (cfg.windupKey) {
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-2, 7);
      ctx.lineTo(-2, 16);
      ctx.arc(-6, 18, 4, 0, TAU);
      ctx.arc(2, 18, 4, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==========================================================================
  // PORTHOLE #23 · SCOPE B — Pink Sea-Anemone Wall Clock ("duchamp-optic")
  // Plates: portholes/p23.jpg + assets/atlas-stills/atlas-42.webp
  // ==========================================================================
  function drawP23Backdrop(ctx, W, H, resolved, plates, S) {
    var BG = getEngine();
    var t = resolved.t;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var pxB = S.parallaxX(0.22, t, resolved);
    var pyB = S.parallaxY(0.22, t, resolved);
    var pxM = S.parallaxX(0.5, t, resolved);

    S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 23, t, resolved);

    // Patchwork glowing indigo/violet theatre curtains from atlas-42.webp (clean zero-text plate!)
    drawPlateFrac(
      ctx, S, aImg,
      0.0, 0.02, 0.28, 0.80,
      20 + pxB, 42 + pyB, 270, 520,
      [[0.03, 0.03], [0.94, 0.05], [0.86, 0.96], [0.04, 0.95]],
      { haloWidth: 4.0, alpha: 0.86 }
    );
    drawPlateFrac(
      ctx, S, aImg,
      0.70, 0.02, 0.30, 0.80,
      988 + pxB, 46 + pyB, 270, 515,
      [[0.06, 0.05], [0.97, 0.03], [0.95, 0.96], [0.12, 0.95]],
      { haloWidth: 4.0, alpha: 0.86 }
    );

    // Mossy barnacle pier timber above & below clock from p23.jpg (cropped strictly outside numeral dial!)
    var cx = 640 + pxM * 0.6;
    drawPlateFrac(
      ctx, S, pImg,
      0.37, 0.15, 0.24, 0.13,
      cx - 96, 36, 192, 138,
      [[0.08, 0.04], [0.92, 0.04], [0.95, 0.96], [0.05, 0.96]],
      { haloWidth: 4.0 }
    );
    drawPlateFrac(
      ctx, S, pImg,
      0.35, 0.60, 0.28, 0.25,
      cx - 112, 434, 224, 192,
      [[0.06, 0.05], [0.94, 0.05], [0.96, 0.96], [0.04, 0.96]],
      { haloWidth: 4.5 }
    );

    BG.drawWaterCaustics(ctx, W, H, t, { intensity: 0.20, color: "#67e8f9" });
    BG.drawDepthFog(ctx, W, H, t, { density: 0.13, color: "#94a3b8" });
  }

  // Reusable Sea-Anemone Clock rig (100% vector ticks, zero baked-in dial numbers!)
  function drawAnemoneClockProp(ctx, S, BG, plates, t, opts) {
    var cfg = opts || {};
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var cx = cfg.cx != null ? cfg.cx : 640;
    var cy = cfg.cy != null ? cfg.cy : 332;
    var scale = cfg.scale || 1.0;
    var dialR = 122;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    if (cfg.rot) ctx.rotate(cfg.rot);

    // Scissored real pink sea-anemone tentacle clusters from p23.jpg (left & right outer rims — zero numerals!)
    if (cfg.hidePlateTentacles !== true) {
      drawPlateFrac(
        ctx, S, pImg,
        0.20, 0.21, 0.17, 0.42,
        -252, -162, 152, 316,
        [[0.12, 0.08], [0.92, 0.04], [0.88, 0.96], [0.08, 0.90]],
        { haloWidth: 3.8, rot: Math.sin(t * 1.9) * 0.04 }
      );
      drawPlateFrac(
        ctx, S, pImg,
        0.62, 0.20, 0.16, 0.42,
        102, -162, 152, 316,
        [[0.08, 0.04], [0.90, 0.10], [0.92, 0.92], [0.10, 0.96]],
        { haloWidth: 3.8, rot: -Math.sin(t * 1.8) * 0.04 }
      );
    }

    // 12 (or 20) articulated pink paper sea-anemone tentacles around the clock bezel
    var nTent = cfg.tentacleCount || 12;
    var rainbowCols = ["#ff4d6d", "#fbbf24", "#34d399", "#38bdf8", "#c084fc", "#fb7185"];
    for (var ti = 0; ti < nTent; ti++) {
      var baseAng = (ti / nTent) * TAU - Math.PI * 0.5;
      var sway = S.wobble(t, 2.5, 0.12, ti * 0.7);
      var curlBias = 0;
      if (typeof cfg.lightAngle === "number") {
        var diff = Math.atan2(Math.sin(cfg.lightAngle - baseAng), Math.cos(cfg.lightAngle - baseAng));
        curlBias = diff * 0.34;
      }
      if (cfg.partPetals) {
        curlBias += (Math.cos(baseAng) >= 0 ? 0.38 : -0.38);
      }
      var lunge = cfg.lunge ? (1.32 + 0.22 * Math.sin(t * 6.8 + ti)) : 1.0;
      var tLen = (146 + (ti % 3) * 18) * lunge;
      var tCol = cfg.disco
        ? rainbowCols[(ti + Math.floor(t * 8)) % rainbowCols.length]
        : (cfg.lunge ? (ti % 2 === 0 ? "#f43f5e" : "#db2777") : (ti % 2 === 0 ? "#ec8ca3" : "#f4a3b8"));

      ctx.save();
      ctx.rotate(baseAng + sway + curlBias);
      var tipBend = typeof cfg.lightAngle === "number" ? 24 : 6;
      S.drawCutoutPaperEdge(
        ctx,
        [[-11, 98], [-15, 98 + tLen * 0.54], [tipBend, 98 + tLen], [14, 98 + tLen * 0.48], [11, 98]],
        tCol,
        "#14110d",
        { paperRim: 2.2, shadow: false }
      );
      if (cfg.disco) {
        ctx.fillStyle = "#fffbeb";
        ctx.beginPath();
        ctx.arc(tipBend * 0.7, 98 + tLen * 0.85, 5.5, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // Side brass winding crown stem at 3-o'clock bezel (for □ Square tongs!)
    ctx.save();
    ctx.translate(dialR + 18, 0);
    ctx.rotate(cfg.crownRot || 0);
    S.drawCardboardPuppetPiece(ctx, [[-8, -18], [18, -22], [18, 22], [-8, 18]], {
      tone: "#d4a44c",
      ribs: 2,
      pin: { x: 6, y: 0, r: 4.2, metal: "brass" }
    });
    ctx.restore();

    // Optional Twin School Dismissal Hammer-Bells atop clock
    if (cfg.schoolBells) {
      var ringShake = Math.sin(t * 36) * 0.22;
      for (var bi = -1; bi <= 1; bi += 2) {
        ctx.save();
        ctx.translate(bi * 72, -dialR - 26);
        ctx.rotate(bi * 0.38 + ringShake * bi);
        S.drawCutoutPaperEdge(ctx, [[-34, 10], [-26, -24], [26, -24], [34, 10]], "#eab308", "#14110d", { paperRim: 2.5 });
        ctx.restore();
      }
      ctx.save();
      ctx.translate(0, -dialR - 14);
      ctx.rotate(Math.sin(t * 42) * 0.55);
      S.drawCardboardPuppetPiece(ctx, [[-4, 0], [-4, -36], [4, -36], [4, 0]], { tone: "#94a3b8" });
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(0, -38, 8, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // Outer Bezel Circle
    var bezelPts = [];
    for (var k = 0; k < 24; k++) {
      var ba = (k / 24) * TAU;
      bezelPts.push([Math.cos(ba) * (dialR + 16), Math.sin(ba) * (dialR + 16)]);
    }
    S.drawCutoutPaperEdge(
      ctx,
      bezelPts,
      cfg.goldWatch ? "#d4a44c" : (cfg.lunge ? "#4c1d2e" : "#242c33"),
      "#14110d",
      { paperRim: 4.8 }
    );

    // Inner Dial Face
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, dialR, 0, TAU);
    ctx.clip();

    if (cfg.vortex || cfg.goldWatch) {
      drawPlateFrac(
        ctx, S, aImg,
        0.31, 0.25, 0.38, 0.56,
        -dialR, -dialR, dialR * 2, dialR * 2,
        [[-0.05, -0.05], [1.05, -0.05], [1.05, 1.05], [-0.05, 1.05]],
        { haloWidth: 0, shadow: false, filter: cfg.goldWatch ? "sepia" : "none", alpha: 0.92 }
      );
      if (cfg.goldWatch) {
        ctx.fillStyle = "rgba(253, 224, 114, 0.62)";
        ctx.fillRect(-dialR, -dialR, dialR * 2, dialR * 2);
      }
    } else {
      ctx.fillStyle = cfg.lunge ? "#3b0a1e" : "#f8f2df";
      ctx.fillRect(-dialR, -dialR, dialR * 2, dialR * 2);
      S.drawEngravingCrosshatch(ctx, dialR * 2, dialR * 2, 0.07, 9, { x: -dialR, y: -dialR });
    }

    if (cfg.vortex) {
      for (var sp = 0; sp < 7; sp++) {
        var sa = t * (sp % 2 === 0 ? 3.2 : -2.6) + sp * 0.8;
        ctx.strokeStyle = sp % 2 === 0 ? "rgba(244, 114, 182, 0.88)" : "rgba(56, 189, 248, 0.85)";
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.arc(Math.cos(sa) * 14, Math.sin(sa) * 14, 16 + sp * 15, 0, TAU);
        ctx.stroke();
      }
    } else if (cfg.lunge) {
      // Venus flytrap serrated chomp jaws inside dial!
      var chomp = 0.2 + 0.8 * Math.abs(Math.sin(t * 5.8));
      var gap = 12 + chomp * 48;
      ctx.fillStyle = "#9f1239";
      ctx.fillRect(-dialR, -dialR, dialR * 2, dialR - gap * 0.5);
      ctx.fillRect(-dialR, gap * 0.5, dialR * 2, dialR);
      for (var th = -4; th <= 4; th++) {
        var tx = th * 24;
        S.drawCutoutPaperEdge(ctx, [[tx - 9, -gap * 0.5], [tx + 9, -gap * 0.5], [tx, -gap * 0.5 + 24]], "#fbfaf5", "#14110d", { paperRim: 0, shadow: false });
        S.drawCutoutPaperEdge(ctx, [[tx - 9, gap * 0.5], [tx + 9, gap * 0.5], [tx, gap * 0.5 - 24]], "#fbfaf5", "#14110d", { paperRim: 0, shadow: false });
      }
    } else {
      // Pure geometric 12 hour batons & 60 minute ticks (0 text!)
      for (var m = 0; m < 60; m++) {
        var ma = (m / 60) * TAU - Math.PI * 0.5;
        var isQ = (m % 15 === 0);
        var isH = (m % 5 === 0);
        var r0 = isQ ? dialR - 26 : (isH ? dialR - 18 : dialR - 9);
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = isQ ? 4.4 : (isH ? 2.8 : 1.2);
        ctx.beginPath();
        ctx.moveTo(Math.cos(ma) * r0, Math.sin(ma) * r0);
        ctx.lineTo(Math.cos(ma) * (dialR - 4), Math.sin(ma) * (dialR - 4));
        ctx.stroke();
      }
      if (cfg.sneezeEyes) {
        // Ticklish scrunched happy "> <" eyes on clockface!
        ctx.strokeStyle = "#be185d";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-54, -34); ctx.lineTo(-28, -22); ctx.lineTo(-54, -10);
        ctx.moveTo(54, -34);  ctx.lineTo(28, -22);  ctx.lineTo(54, -10);
        ctx.stroke();
      }
    }
    ctx.restore(); // end dial clip

    // Articulated Cardboard Clock Hands (0 rad = 12 o'clock, +PI/2 = 3 o'clock / :15!)
    var minAng = cfg.minAng != null ? cfg.minAng : (Math.PI * 0.34 + Math.floor(t * 2) * 0.03);
    var hrAng = cfg.hrAng != null ? cfg.hrAng : (Math.PI * 0.53);
    ctx.save();
    ctx.rotate(minAng);
    S.drawCardboardPuppetPiece(ctx, [[-5.5, 16], [-3.8, -94], [0, -108], [3.8, -94], [5.5, 16]], {
      tone: cfg.goldWatch ? "#78350f" : "#1f2937",
      ribs: 1
    });
    ctx.restore();

    ctx.save();
    ctx.rotate(hrAng);
    S.drawCardboardPuppetPiece(ctx, [[-7.5, 14], [-5.5, -66], [0, -78], [5.5, -66], [7.5, 14]], {
      tone: cfg.lunge ? "#e11d48" : "#14110d",
      ribs: 1
    });
    ctx.restore();

    S.drawReinigerFiligreeHinge(ctx, 0, 0, 10.5, { metal: "brass" });
    ctx.restore();
  }

  var P23_SPEC = {
    drawBackdrop: drawP23Backdrop,

    drawRoot: function (ctx, W, H, resolved, plates, S) {
      var BG = getEngine();
      var t = resolved.t;
      drawAnemoneClockProp(ctx, S, BG, plates, t, {
        cx: 640,
        cy: 332,
        minAng: Math.PI * 0.32 + Math.floor(t * 2) * 0.025,
        hrAng: Math.PI * 0.53
      });
      // Spotted trout from p23.jpg nosing 3-o'clock rim
      drawPlateFrac(
        ctx, S, plates.portholeImg,
        0.54, 0.42, 0.29, 0.14,
        742 + Math.sin(t * 1.8) * 10, 312 + Math.cos(t * 2.2) * 6, 236, 102,
        [[0.04, 0.36], [0.46, 0.06], [0.96, 0.14], [0.96, 0.88], [0.42, 0.94], [0.04, 0.68]],
        { haloWidth: 3.8, rot: Math.sin(t * 2.0) * 0.04 }
      );
      S.drawTurkeyInCorner(ctx, 132, 512, 0.98, t, { dispatch: 0 });
      drawRootHotspotTargets(ctx, BG, resolved);
    },

    stems: {
      x: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        var sweepAng = -Math.PI * 0.5 + u * TAU;
        var lx = 640 + Math.cos(sweepAng) * 135;
        var ly = 332 + Math.sin(sweepAng) * 135;
        drawAnemoneClockProp(ctx, S, BG, plates, t, {
          cx: 640,
          cy: 332,
          lightAngle: sweepAng,
          minAng: Math.PI * 0.36 + u * 0.14,
          hrAng: Math.PI * 0.53
        });
        BG.drawVolumetricBeam(ctx, 210, 595, lx, ly, {
          color: "#60a5fa",
          coreColor: "#eff6ff",
          spread: 145,
          intensity: 1.15,
          t: t
        });
        BG.drawLanternHalo(ctx, lx, ly, 110, { color: "#3b82f6", intensity: 0.95, t: t });
        S.drawTurkeyInCorner(ctx, 132, 512, 0.98, t, { dispatch: 0.2 });
      },

      o: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        var snap = BG.easeOutBack(u);
        drawAnemoneClockProp(ctx, S, BG, plates, t, {
          cx: 640 + Math.sin(t * 14) * 2.5 * (1 - u * 0.4),
          cy: 332,
          minAng: BG.lerp(Math.PI * 0.22, Math.PI * 0.5, snap), // Spins forward 2 notches to 3:15 sharp (+PI/2)!
          hrAng: Math.PI * 0.54
        });
        drawCurrentPuffJet(ctx, BG, 1080, 260, 680, 325, u, t, { color: "#f87171", bubbles: 24 });
        S.drawTurkeyInCorner(ctx, 132, 512, 0.98, t, { dispatch: 0.1 });
      },

      triangle: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        drawAnemoneClockProp(ctx, S, BG, plates, t, { cx: 640, cy: 320, minAng: 0, hrAng: 0.03 });
        // Brass factory timeclock slot under 6-o'clock tentacle + yellow dismissal timecard!
        S.drawCardboardPuppetPiece(ctx, [[592, 466], [688, 466], [688, 514], [592, 514]], {
          tone: "#92400e",
          ribs: 2,
          pins: [[606, 490], [674, 490]]
        });
        var cardDrop = BG.smoothstep(0.45, 0.92, u) * 18;
        S.drawCutoutPaperEdge(
          ctx,
          [[612, 422 + cardDrop], [668, 422 + cardDrop], [668, 478 + cardDrop], [612, 478 + cardDrop]],
          "#fde047",
          "#14110d",
          { paperRim: 2.2 }
        );
        if (u > 0.62) {
          ctx.fillStyle = "#d42a1e";
          ctx.beginPath();
          ctx.arc(640, 448 + cardDrop, 8, 0, TAU);
          ctx.fill();
        }
        var sx = BG.lerp(220, 565, BG.easeOutCubic(u));
        var sy = BG.lerp(525, 488, BG.easeOutCubic(u));
        BG.drawSnailSilverTrail(ctx, 220, 535, sx, sy + 10, u, t);
        S.drawMailSnail(ctx, sx, sy, 1.22, t, { postcard: true });
        S.drawTurkeyCutawayBadge(ctx, 126, 502, 0.95, t, { dispatch: 0.8 });
      },

      square: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        var clicks = Math.floor(u * 3.99);
        drawAnemoneClockProp(ctx, S, BG, plates, t, {
          cx: 640,
          cy: 332,
          crownRot: clicks * 0.52,
          minAng: -0.18 + clicks * 0.08
        });
        drawBrassProbe(ctx, S, BG, 1085, 555, 782, 332, t, {
          u: u,
          jaw: 0.08 + 0.14 * Math.abs(Math.sin(u * Math.PI * 3)),
          seed: 23.4
        });
        S.drawTurkeyInCorner(ctx, 132, 512, 0.98, t, { dispatch: 0.15 });
      }
    },

    outcomes: {
      x: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Hungry Carnivorous Sea-Flower Awakening + Turkey slams Venetian blinds!
          var BG = getEngine();
          var t = resolved.t;
          var u = resolved.outcomeU;
          BG.drawVolumetricBeam(ctx, 195, 585, 650, 332, { color: "#3b82f6", spread: 195, intensity: 1.1, t: t });
          drawAnemoneClockProp(ctx, S, BG, plates, t, {
            cx: 660,
            cy: 332,
            scale: 1.08 + 0.05 * Math.sin(t * 4.5),
            tentacleCount: 20,
            lunge: true
          });
          S.drawTurkeyInCorner(ctx, 165, 505, 1.06, t, { dispatch: 0.85 });

          // Slamming horizontal cream Venetian blinds across left half of porthole!
          var blindDrop = BG.easeOutCubic(BG.clamp(u * 2.0, 0, 1));
          var slats = Math.floor(blindDrop * 11) + 2;
          for (var si = 0; si < slats; si++) {
            var sy = 56 + si * 40;
            S.drawCardboardPuppetPiece(ctx, [[48, sy], [420, sy], [416, sy + 28], [52, sy + 28]], {
              tone: si % 2 === 0 ? "#f5f0e1" : "#e2d9c3",
              ribs: 1,
              shadow: false
            });
          }
          // Blind pull-cord & tassel yanked by Turkey
          ctx.strokeStyle = "#fbfaf5";
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.moveTo(395, 56);
          ctx.lineTo(225, 485);
          ctx.stroke();
          drawStarPoly(ctx, S, 225, 488, 4, 12, 6, 0, "#d42a1e", "#14110d", 1.5);
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Principal Trout's Shiny Gold Pocketwatch + spectacles + Mail Snail
          var BG = getEngine();
          var t = resolved.t;
          BG.drawVolumetricBeam(ctx, 210, 585, 560, 335, { color: "#60a5fa", spread: 165, intensity: 0.95, t: t });
          // Ornate pocketwatch bow ring & draped gold chain at 12 o'clock
          ctx.strokeStyle = "#facc15";
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.arc(560, 162, 26, 0, TAU);
          ctx.stroke();
          ctx.setLineDash([10, 6]);
          ctx.beginPath();
          ctx.moveTo(584, 162);
          ctx.quadraticCurveTo(735, 115, 865, 295);
          ctx.stroke();
          ctx.setLineDash([]);

          drawAnemoneClockProp(ctx, S, BG, plates, t, {
            cx: 560,
            cy: 335,
            goldWatch: true,
            partPetals: true,
            rot: Math.sin(t * 2.2) * 0.05
          });
          BG.drawLanternHalo(ctx, 560, 335, 155, { color: "#fde047", intensity: 0.85, t: t });

          // Principal Brook Trout wearing wire-rim spectacles!
          var tx = 935 + Math.sin(t * 1.8) * 10;
          var ty = 345 + Math.cos(t * 2.2) * 6;
          S.drawBrookTrout(ctx, tx, ty, 1.28, t, false);
          ctx.strokeStyle = "#fde047";
          ctx.lineWidth = 3.0;
          ctx.beginPath();
          ctx.arc(tx - 72, ty - 8, 12, 0, TAU);
          ctx.arc(tx - 48, ty - 8, 11, 0, TAU);
          ctx.moveTo(tx - 60, ty - 8);
          ctx.lineTo(tx - 59, ty - 8);
          ctx.stroke();

          S.drawMailSnail(ctx, 845, 498, 1.2, t, { hasReply: true, postcard: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Living Biomorphic Time-Machine Portal: spiraling paper ammonites & trilobites!
          var BG = getEngine();
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 640, 106, 1.24, t, 640, 345, { beamSpread: 190 });
          BG.drawTractorRings(ctx, 640, 132, 640, 355, t, { spread: 165, rings: 6 });

          drawAnemoneClockProp(ctx, S, BG, plates, t, {
            cx: 640,
            cy: 352,
            vortex: true,
            minAng: -t * 7.5,
            hrAng: t * 3.1
          });

          // 6 spiraling cut-paper prehistoric ammonites & segmented trilobites orbiting vortex!
          for (var i = 0; i < 6; i++) {
            var oa = t * 1.45 + (i / 6) * TAU;
            var ox = 640 + Math.cos(oa) * 238;
            var oy = 352 + Math.sin(oa) * 142;
            ctx.save();
            ctx.translate(ox, oy);
            ctx.rotate(oa + t * 2);
            if (i % 2 === 0) {
              // Spiral paper ammonite shell
              S.drawCutoutPaperEdge(ctx, [[-24, 0], [-14, -22], [14, -22], [24, 0], [14, 22], [-14, 22]], "#f0abfc", "#14110d", { paperRim: 2.2 });
              ctx.strokeStyle = "#581c87";
              ctx.lineWidth = 2.2;
              ctx.beginPath();
              for (var s = 0; s < 22; s++) {
                var a = s * 0.45;
                var r = s * 0.85;
                if (s === 0) ctx.moveTo(0, 0);
                else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
              }
              ctx.stroke();
            } else {
              // Segmented cardboard trilobite
              S.drawCardboardPuppetPiece(ctx, [[-26, -14], [18, -18], [28, 0], [18, 18], [-26, 14]], {
                tone: "#5eead4",
                ribs: 4
              });
            }
            ctx.restore();
          }
        }
      },

      o: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Three-Fifteen School Dismissal Stampede: twin bells + backpack minnows!
          var BG = getEngine();
          var t = resolved.t;
          var shakeX = Math.sin(t * 28) * 3.5;
          drawAnemoneClockProp(ctx, S, BG, plates, t, {
            cx: 640 + shakeX,
            cy: 325,
            minAng: 0,
            hrAng: 0.03,
            schoolBells: true
          });
          BG.drawDeterministicParticles(ctx, "bubbles", 640, 175, t, { loop: true, count: 22, spreadX: 160 });

          var packCols = ["#ef4444", "#3b82f6", "#eab308", "#10b981", "#a855f7"];
          for (var mi = 0; mi < 22; mi++) {
            var mx = (((t * (260 + (mi % 4) * 45) + mi * 72) % 1340) - 60);
            var my = 185 + (mi % 6) * 58 + Math.sin(t * 6 + mi) * 12;
            drawCutoutMinnow(ctx, S, mx, my, 0.04 * Math.sin(t * 8 + mi), 1.05, Math.sin(t * 14 + mi) * 6, "#e2e8f0", {
              backpack: packCols[mi % packCols.length]
            });
          }
          S.drawTurkeyInCorner(ctx, 148, 512, 1.06, t, { dispatch: 0.65 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Tardy Yellow Minnow Bus Rush: Brook Trout with lunchbox chasing Mail Snail's express scooter!
          var BG = getEngine();
          var t = resolved.t;
          drawAnemoneClockProp(ctx, S, BG, plates, t, { cx: 470, cy: 275, scale: 0.82, minAng: 0.02, hrAng: 0.04 });

          // Mail Snail zooming right on a yellow wheeled express scooter!
          var scootX = 875 + Math.sin(t * 4.5) * 26;
          var scootY = 472;
          S.drawCardboardPuppetPiece(ctx, [[scootX - 75, scootY + 14], [scootX + 68, scootY + 14], [scootX + 62, scootY + 28], [scootX - 70, scootY + 28]], {
            tone: "#facc15",
            pins: [[scootX - 52, scootY + 30], [scootX + 48, scootY + 30]]
          });
          // Handlebar stem
          ctx.strokeStyle = "#14110d";
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(scootX + 46, scootY + 14);
          ctx.lineTo(scootX + 34, scootY - 46);
          ctx.lineTo(scootX + 54, scootY - 46);
          ctx.stroke();
          S.drawMailSnail(ctx, scootX - 8, scootY, 1.24, t, { hasReply: true, postcard: true });

          // Sprinting Brook Trout carrying red plaid lunchbox + comic speed lines!
          var runX = 615 + Math.sin(t * 7.5) * 18;
          var runY = 435 + Math.abs(Math.sin(t * 11)) * -18;
          ctx.strokeStyle = "rgba(251, 250, 245, 0.78)";
          ctx.lineWidth = 3;
          for (var sl = 0; sl < 5; sl++) {
            var ly = runY - 32 + sl * 18;
            ctx.beginPath();
            ctx.moveTo(runX - 185 - (sl % 2) * 35, ly);
            ctx.lineTo(runX - 95, ly);
            ctx.stroke();
          }
          S.drawBrookTrout(ctx, runX, runY, 1.25, t, true); // facing right chasing scooter!
          // Red lunchbox dangling from fin
          S.drawCutoutPaperEdge(ctx, [[runX + 18, runY + 18], [runX + 66, runY + 18], [runX + 66, runY + 54], [runX + 18, runY + 54]], "#dc2626", "#14110d", { paperRim: 2 });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Tentacled Doomsday Countdown Hits Zero: disco mirror-ball from Alien Saucer!
          var BG = getEngine();
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 640, 96, 1.22, t, false, false, { beam: false });

          // Lowered glittering faceted mirror-ball + colourful disco shafts!
          var ballY = 205 + Math.sin(t * 2.8) * 8;
          var discoCols = ["#f43f5e", "#38bdf8", "#a855f7", "#fde047", "#34d399"];
          for (var b = 0; b < 5; b++) {
            var ba = t * 1.9 + (b / 5) * TAU;
            BG.drawVolumetricBeam(ctx, 640, ballY, 640 + Math.cos(ba) * 460, 360 + Math.sin(ba) * 210, {
              color: discoCols[b],
              spread: 68,
              intensity: 0.72,
              t: t
            });
          }
          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(640, 118);
          ctx.lineTo(640, ballY - 38);
          ctx.stroke();

          var ballPts = [];
          for (var p = 0; p < 16; p++) {
            var pa = (p / 16) * TAU;
            ballPts.push([640 + Math.cos(pa) * 38, ballY + Math.sin(pa) * 38]);
          }
          S.drawCutoutPaperEdge(ctx, ballPts, "#f1f5f9", "#14110d", { paperRim: 2.5 });
          for (var gr = -2; gr <= 2; gr++) {
            for (var gc = -2; gc <= 2; gc++) {
              ctx.fillStyle = ((gr + gc + Math.floor(t * 9)) % 2 === 0) ? "#ffffff" : "#94a3b8";
              ctx.fillRect(640 + gc * 11 - 4, ballY + gr * 11 - 4, 8, 8);
            }
          }

          drawAnemoneClockProp(ctx, S, BG, plates, t, {
            cx: 640,
            cy: 392,
            scale: 0.88,
            disco: true,
            minAng: -Math.PI * 0.5,
            hrAng: -Math.PI * 0.5
          });
        }
      },

      triangle: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Overdue Submarine Library Book Fine: clock points accusingly at Mail Snail slip; Turkey holds soggy book!
          var BG = getEngine();
          var t = resolved.t;
          drawAnemoneClockProp(ctx, S, BG, plates, t, {
            cx: 660,
            cy: 298,
            scale: 0.94,
            minAng: Math.PI * 0.65,
            hrAng: Math.PI * 0.52
          });

          // Mail Snail holding giant crimson-stamped overdue notice slip
          S.drawCutoutPaperEdge(ctx, [[565, 438], [735, 430], [742, 522], [572, 530]], "#fef08a", "#14110d", { paperRim: 3 });
          for (var r = 0; r < 3; r++) {
            ctx.fillStyle = "#d42a1e";
            ctx.beginPath();
            ctx.arc(620 + r * 36, 476, 11, 0, TAU);
            ctx.fill();
          }
          S.drawMailSnail(ctx, 515, 504, 1.26, t, { postcard: true });

          // Sheepish Turkey holding up soggy emerald hardcover book with brass submarine emblem!
          S.drawTurkeyInCorner(ctx, 165, 498, 1.06, t, { dispatch: 0.75 });
          ctx.save();
          ctx.translate(295, 442 + Math.sin(t * 3.0) * 5);
          ctx.rotate(-0.14);
          S.drawCutoutPaperEdge(ctx, [[-48, -58], [48, -58], [52, 58], [-44, 58]], "#115e59", "#14110d", { paperRim: 3 });
          S.drawCutoutPaperEdge(ctx, [[-26, -12], [24, -12], [30, 6], [-26, 6]], "#fbbf24", "#14110d", { paperRim: 1.5, shadow: false });
          ctx.restore();
          BG.drawDeterministicParticles(ctx, "bubbles", 295, 495, t, { loop: true, count: 8 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Quitting-Time Whistle For Mail Snail: striped beach chair + sunglasses + lemonade with Brook Trout!
          var BG = getEngine();
          var t = resolved.t;
          drawAnemoneClockProp(ctx, S, BG, plates, t, { cx: 640, cy: 252, scale: 0.78, minAng: 0, hrAng: 0.03 });

          // Mossy creek boulder lounge deck
          S.drawTornPaperFlat(ctx, 360, 468, 590, 96, { fill: "#3f4e45", paperColor: "#e2e8f0", seed: 23.9 });

          // Striped folding beach chair + cocktail umbrella
          S.drawCardboardPuppetPiece(ctx, [[465, 482], [585, 482], [555, 395], [445, 415]], {
            tone: "#ef4444",
            ribs: 3,
            pins: [[475, 480], [568, 480]]
          });
          // Yellow lemonade glasses with pink paper cocktail umbrellas!
          for (var g = 0; g < 2; g++) {
            var gx = 635 + g * 54;
            S.drawCutoutPaperEdge(ctx, [[gx - 12, 438], [gx + 12, 438], [gx + 9, 474], [gx - 9, 474]], "#fde047", "#14110d", { paperRim: 1.8 });
            S.drawCutoutPaperEdge(ctx, [[gx - 18, 424], [gx, 408], [gx + 18, 424]], "#ec4899", "#14110d", { paperRim: 1.2 });
          }

          S.drawMailSnail(ctx, 518, 456, 1.28, t, { hasReply: true, postcard: false });
          // Sunglasses on Mail Snail
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(534, 436, 22, 9);

          S.drawBrookTrout(ctx, 835, 432, 1.24, t, false);
          // Cool dark sunglasses on Brook Trout!
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(752, 420, 26, 12);
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Frozen Temporal Stasis Bubble Creek: glass marble bubbles + frozen splash Trout + drifting Saucer & Snail!
          var BG = getEngine();
          var t = resolved.t;
          drawAnemoneClockProp(ctx, S, BG, plates, 0.0, { cx: 560, cy: 332, minAng: 0, hrAng: 0 }); // Frozen t=0!

          // Motionless glossy glass-marble stasis bubbles suspended across mid-water
          for (var i = 0; i < 18; i++) {
            var bx = 185 + BG.hash(i * 7.3) * 910;
            var by = 125 + BG.hash(i * 13.9) * 390;
            var br = 10 + (i % 4) * 5.5;
            ctx.fillStyle = "rgba(186, 230, 253, 0.55)";
            ctx.strokeStyle = "#e0f2fe";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(bx, by, br, 0, TAU);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(bx - br * 0.35, by - br * 0.35, br * 0.28, 0, TAU);
            ctx.fill();
          }

          // Frozen mid-splash Brook Trout encapsulated in crystalline ice-halo
          BG.drawLanternHalo(ctx, 905, 365, 130, { color: "#38bdf8", intensity: 0.75, t: 0 });
          S.drawBrookTrout(ctx, 905, 365, 1.22, 0.0, false, { tilt: -0.32 });

          // ONLY Alien Saucer & Mail Snail drift smoothly across the frozen frame!
          var driftX = 360 + Math.sin(t * 1.4) * 210;
          S.drawAlienSaucer(ctx, driftX, 118, 1.18, t, driftX, 265, { beamSpread: 110 });
          S.drawMailSnail(ctx, driftX + 42, 248 + Math.cos(t * 2.1) * 10, 1.18, t, { hasAlienStamp: true });
        }
      },

      square: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Ticklish Anemone Sneezes Pink Confetti!
          var BG = getEngine();
          var t = resolved.t;
          var cycle = (t * 1.4) % 1;
          var swell = cycle < 0.45 ? (1 + (cycle / 0.45) * 0.18) : (1.18 - ((cycle - 0.45) / 0.55) * 0.22);
          drawAnemoneClockProp(ctx, S, BG, plates, t, {
            cx: 640,
            cy: 332,
            scale: swell,
            sneezeEyes: true
          });
          // Giant burst of pink paper-pollen dots across glass!
          BG.drawDeterministicParticles(ctx, "confetti", 640, 332, t, {
            loop: true,
            count: 38,
            color: "#f472b6",
            seed: 23.8
          });
          for (var pi = 0; pi < 14; pi++) {
            var pu = ((t * 0.85 + pi * 0.07) % 1);
            var px = BG.lerp(640, 140 + BG.hash(pi * 9.1) * 980, pu);
            var py = BG.lerp(332, 85 + BG.hash(pi * 5.7) * 440, pu);
            ctx.fillStyle = pi % 2 === 0 ? "#fbcfe8" : "#f43f5e";
            ctx.strokeStyle = "#14110d";
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.arc(px, py, 7 + (pi % 3) * 3, 0, TAU);
            ctx.fill();
            ctx.stroke();
          }
          // Ducking Turkey at bottom corner
          S.drawTurkeyInCorner(ctx, 138, 548 + Math.sin(t * 6) * 6, 0.96, t, { dispatch: 0.4 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Cuckoo-Clock Hermit Crab Pops Out on brass accordion spring!
          var BG = getEngine();
          var t = resolved.t;
          drawAnemoneClockProp(ctx, S, BG, plates, t, { cx: 585, cy: 368, scale: 0.92 });

          // Wooden Alpine chalet gable roof & open cuckoo doors at 12 o'clock
          S.drawCardboardPuppetPiece(ctx, [[505, 195], [585, 128], [665, 195]], { tone: "#78350f", ribs: 2 });
          S.drawCardboardPuppetPiece(ctx, [[548, 168], [622, 168], [622, 224], [548, 224]], { tone: "#1e1b18" });

          // Brass accordion spring shooting cheerful red Hermit Crab forward!
          var boing = 65 + Math.abs(Math.sin(t * 5.2)) * 75;
          ctx.strokeStyle = "#eab308";
          ctx.lineWidth = 4.2;
          ctx.beginPath();
          for (var z = 0; z <= 8; z++) {
            var zx = 585 + (z / 8) * boing;
            var zy = 196 + (z % 2 === 0 ? -10 : 10);
            if (z === 0) ctx.moveTo(585, 196);
            else ctx.lineTo(zx, zy);
          }
          ctx.stroke();

          var crabX = 585 + boing + 24;
          var crabY = 196;
          // Spotted hermit shell + snappy red pincers!
          S.drawCutoutPaperEdge(ctx, [[crabX - 32, crabY + 12], [crabX - 18, crabY - 26], [crabX + 18, crabY - 14], [crabX + 12, crabY + 18]], "#d97706", "#14110d", { paperRim: 2.5 });
          S.drawCutoutPaperEdge(ctx, [[crabX + 8, crabY - 8], [crabX + 42, crabY - 26], [crabX + 34, crabY - 4]], "#ef4444", "#14110d", { paperRim: 2 });
          S.drawCutoutPaperEdge(ctx, [[crabX + 8, crabY + 6], [crabX + 42, crabY + 24], [crabX + 34, crabY + 4]], "#ef4444", "#14110d", { paperRim: 2 });

          S.drawBrookTrout(ctx, 930, 355, 1.22, t, false);
          S.drawMailSnail(ctx, 845, 502, 1.18, t, { hasReply: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Rewound Creek Runs Completely Backwards: Saucer chrono-cone, sinking bubbles, moonwalking Trout!
          var BG = getEngine();
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 640, 108, 1.22, t, 640, 355, { beamSpread: 205 });
          BG.drawTractorRings(ctx, 640, 355, 640, 130, t, { spread: 165, rings: 5 });

          drawAnemoneClockProp(ctx, S, BG, plates, t, {
            cx: 560,
            cy: 352,
            minAng: -t * 9.5,
            hrAng: -t * 2.8
          });

          // Silver bubbles falling DOWNWARD + orange creek leaves un-falling UPWARD!
          for (var i = 0; i < 16; i++) {
            var u = ((t * 0.48 + i / 16) % 1);
            var bx = 220 + BG.hash(i * 11.3) * 840;
            var by = BG.lerp(95, 535, u); // sinking down!
            ctx.fillStyle = "rgba(224, 242, 254, 0.78)";
            ctx.strokeStyle = "#14110d";
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(bx, by, 6.5, 0, TAU);
            ctx.fill();
            ctx.stroke();

            if (i % 2 === 0) {
              var ly = BG.lerp(530, 90, u); // floating up!
              var lx = 260 + BG.hash(i * 5.1) * 760 + Math.sin(t * 3 + i) * 18;
              S.drawCutoutPaperEdge(ctx, [[lx - 14, ly], [lx, ly - 10], [lx + 14, ly], [lx, ly + 10]], "#f59e0b", "#14110d", { paperRim: 1.5 });
            }
          }

          // Brook Trout moonwalking tail-first across right stage!
          var moonX = 1040 - ((t * 145) % 360);
          S.drawBrookTrout(ctx, moonX, 412 + Math.sin(t * 6) * 8, 1.22, -t, true); // faces right while sliding left!
        }
      }
    }
  };

  // ==========================================================================
  // PORTHOLE #24 · RUDDER — Chewed-Up Green Fishing Net ("cardboard-parallax")
  // Plates: portholes/p24.jpg + assets/atlas-stills/atlas-51.webp
  // ==========================================================================
  function drawP24Backdrop(ctx, W, H, resolved, plates, S) {
    var BG = getEngine();
    var t = resolved.t;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var px1 = S.parallaxX(0.22, t, resolved);

    S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 24, t, resolved, { pillarbox: false });

    // Rocky creek floor from p24.jpg + hanging net curtains from atlas-51.webp (0 text!)
    drawPlateFrac(
      ctx, S, pImg,
      0.18, 0.56, 0.62, 0.26,
      140 + px1, 418, 980, 195,
      [[0.02, 0.16], [0.50, 0.04], [0.98, 0.14], [0.98, 0.96], [0.02, 0.96]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.85 }
    );
    drawPlateFrac(
      ctx, S, aImg,
      0.02, 0.02, 0.36, 0.72,
      105 + px1, 56, 225, 395,
      [[0.04, 0.04], [0.92, 0.06], [0.84, 0.96], [0.06, 0.92]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.86 }
    );
    drawPlateFrac(
      ctx, S, aImg,
      0.60, 0.04, 0.38, 0.68,
      945 + px1, 62, 225, 385,
      [[0.08, 0.06], [0.96, 0.04], [0.94, 0.94], [0.14, 0.96]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.86 }
    );

    BG.drawWaterCaustics(ctx, W, H, t, { intensity: 0.18, color: "#99f6e4" });
    BG.drawDepthFog(ctx, W, H, t, { density: 0.14, color: "#cbd5e1" });
  }

  function drawP24Pillarbox(ctx, W, H) {
    ctx.fillStyle = "#17181a";
    ctx.fillRect(0, 0, 76, H);
    ctx.fillRect(W - 76, 0, 76, H);
  }

  // Deformable Green Twine Net + Cork Bobbers & Snagged Tin Sinker
  function drawGreenTwineNet(ctx, S, t, opts) {
    var cfg = opts || {};
    var cols = 14;
    var rows = 8;
    var x0 = cfg.x0 != null ? cfg.x0 : 185;
    var y0 = cfg.y0 != null ? cfg.y0 : 92;
    var stepX = cfg.stepX || 70;
    var stepY = cfg.stepY || 56;
    var holeCX = cfg.holeCX != null ? cfg.holeCX : 640;
    var holeCY = cfg.holeCY != null ? cfg.holeCY : 322;
    var holeR = cfg.holeR != null ? cfg.holeR : 96;
    var billow = cfg.billow || 0;
    var partCurtain = cfg.partCurtain || 0;
    var strokeCol = cfg.color || "#3d7a62";

    function nodePos(c, r) {
      var uX = c / (cols - 1);
      var uY = r / (rows - 1);
      var bx = x0 + c * stepX + (r % 2) * 20;
      var by = y0 + r * stepY - c * 4;

      if (cfg.hammock) {
        bx = 290 + uX * 700;
        by = 285 + Math.sin(uX * Math.PI) * 145 + uY * 26;
      } else if (cfg.volleyball) {
        bx = 250 + uX * 780;
        by = 305 + uY * 115 + Math.sin(uX * Math.PI) * 10;
      } else {
        if (partCurtain > 0) {
          bx += (uX < 0.5 ? -1 : 1) * partCurtain * 240 * Math.sin(uY * Math.PI * 0.85 + 0.15);
        }
        var dome = Math.sin(uX * Math.PI) * Math.sin(uY * Math.PI) * billow;
        bx += (uX - 0.5) * dome * 0.9;
        by -= dome * 0.72;
      }

      var wx = Math.sin(t * 2.1 + c * 0.5 + r * 0.4) * 5.5;
      var wy = Math.cos(t * 1.8 + c * 0.4) * 4.5;
      var px = bx + wx;
      var py = by + wy;

      var dx = px - holeCX;
      var dy = py - holeCY;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (!cfg.hammock && !cfg.volleyball && dist < holeR) {
        return { x: px, y: py, cut: true };
      }
      var push = (!cfg.hammock && !cfg.volleyball && dist < holeR + 52)
        ? (1 - (dist - holeR) / 52) * 16
        : 0;
      return { x: px + (dx / dist) * push, y: py + (dy / dist) * push, cut: false };
    }

    ctx.save();
    ctx.lineCap = "round";
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var p0 = nodePos(c, r);
        if (p0.cut) continue;
        var nbrs = [[c + 1, r], [c, r + 1]];
        for (var ni = 0; ni < nbrs.length; ni++) {
          var nc = nbrs[ni][0], nr = nbrs[ni][1];
          if (nc >= cols || nr >= rows) continue;
          var p1 = nodePos(nc, nr);
          ctx.strokeStyle = cfg.laser ? ((c + r) % 2 === 0 ? "#34d399" : "#e879f9") : strokeCol;
          ctx.lineWidth = cfg.laser ? 3.8 : (p1.cut ? 2.2 : 3.4);
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          if (p1.cut) {
            ctx.lineTo(S.lerp(p0.x, p1.x, 0.42), S.lerp(p0.y, p1.y, 0.42) + 8);
          } else {
            ctx.lineTo(p1.x, p1.y);
          }
          ctx.stroke();
        }
        ctx.fillStyle = cfg.laser ? "#fef08a" : "#fbfaf5";
        ctx.beginPath();
        ctx.arc(p0.x, p0.y, cfg.laser ? 3.8 : 2.3, 0, TAU);
        ctx.fill();
      }
    }

    // Cork bobbers along top headline + snagged tin sinker at bottom
    if (cfg.bobbers !== false) {
      for (var bi = 1; bi < cols - 1; bi += 3) {
        var topP = nodePos(bi, 0);
        if (topP.cut) continue;
        S.drawCutoutPaperEdge(
          ctx,
          [[topP.x - 13, topP.y - 10], [topP.x + 13, topP.y - 10], [topP.x + 10, topP.y + 12], [topP.x - 10, topP.y + 12]],
          bi % 2 === 0 ? "#dc2626" : "#f59e0b",
          "#14110d",
          { paperRim: 2.0 }
        );
      }
      var botP = nodePos(8, rows - 1);
      if (!botP.cut) {
        S.drawCardboardPuppetPiece(ctx, [[botP.x - 12, botP.y], [botP.x + 12, botP.y], [botP.x + 18, botP.y + 34], [botP.x - 18, botP.y + 34]], {
          tone: "#94a3b8",
          pin: { x: botP.x, y: botP.y + 8, r: 3.6, metal: "silver" }
        });
      }
    }
    ctx.restore();
  }

  var P24_SPEC = {
    drawBackdrop: drawP24Backdrop,
    drawForeground: function (ctx, W, H) { drawP24Pillarbox(ctx, W, H); },

    drawRoot: function (ctx, W, H, resolved, plates, S) {
      var BG = getEngine();
      var t = resolved.t;
      drawGreenTwineNet(ctx, S, t, { holeCX: 640, holeCY: 322, holeR: 92 });
      // Spine-rigged spotted trout from p24.jpg swimming near chewed hole
      var sx = 635 + Math.sin(t * 1.9) * 24;
      var sy = 322 + Math.cos(t * 2.3) * 8;
      drawPlateFrac(
        ctx, S, plates.portholeImg,
        0.41, 0.39, 0.34, 0.18,
        sx - 110, sy - 52, 224, 104,
        [[0.04, 0.24], [0.48, 0.04], [0.96, 0.18], [0.94, 0.84], [0.46, 0.95], [0.04, 0.76]],
        { haloWidth: 4.0, rot: Math.sin(t * 2.2) * 0.05 }
      );
      S.drawTurkeyInCorner(ctx, 162, 506, 0.98, t, { dispatch: 0 });
      drawRootHotspotTargets(ctx, BG, resolved);
    },

    stems: {
      x: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        var tx = BG.lerp(430, 640, u);
        var ty = BG.lerp(275, 322, u);
        drawGreenTwineNet(ctx, S, t, { holeCX: 640, holeCY: 322, holeR: 98, color: "#34d399" });
        BG.drawVolumetricBeam(ctx, 210, 585, tx, ty, { color: "#3b82f6", spread: 155, intensity: 1.15, t: t });
        BG.drawLanternHalo(ctx, 640, 322, 125, { color: "#60a5fa", intensity: u, t: t });
        S.drawTurkeyInCorner(ctx, 162, 506, 0.98, t, { dispatch: 0.2 });
      },

      o: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        drawGreenTwineNet(ctx, S, t, {
          holeCX: 640,
          holeCY: 300,
          holeR: 84,
          billow: BG.easeOutBack(u) * 125
        });
        drawCurrentPuffJet(ctx, BG, 640, 585, 640, 235, u, t, { color: "#f87171", bubbles: 28 });
        S.drawTurkeyInCorner(ctx, 162, 506, 0.98, t, { dispatch: 0.15 });
      },

      triangle: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        drawGreenTwineNet(ctx, S, t, { holeCX: 640, holeCY: 322, holeR: 90 + u * 45 });
        // Master center knot loosening in emerald slime!
        BG.drawLanternHalo(ctx, 545, 335, 68 * u, { color: "#10b981", intensity: 0.9, t: t });
        var sx = BG.lerp(235, 535, BG.easeOutCubic(u));
        var sy = BG.lerp(525, 335, BG.easeOutCubic(u));
        BG.drawSnailSilverTrail(ctx, 235, 530, sx, sy + 8, u, t, { color: "rgba(52, 211, 153, 0.85)" });
        S.drawMailSnail(ctx, sx, sy, 1.22, t, { postcard: true });
        S.drawTurkeyCutawayBadge(ctx, 156, 502, 0.94, t, { dispatch: 0.75 });
      },

      square: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        var snapped = u > 0.52 ? BG.smoothstep(0.52, 1.0, u) : 0;
        drawGreenTwineNet(ctx, S, t, {
          holeCX: 640,
          holeCY: 322,
          holeR: 92 + snapped * 75,
          partCurtain: snapped * 0.45
        });
        drawBrassProbe(ctx, S, BG, 1085, 555, 725, 338, t, {
          u: u,
          jaw: u > 0.52 ? 0.02 : 0.34,
          seed: 24.4
        });
        S.drawTurkeyInCorner(ctx, 162, 506, 0.98, t, { dispatch: 0.2 });
      }
    },

    outcomes: {
      x: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Sneaky Hunter's Thanksgiving Turkey Snare: painted wooden duck decoy + Turkey spins sub helm!
          var BG = getEngine();
          var t = resolved.t;
          BG.drawVolumetricBeam(ctx, 220, 585, 665, 295, { color: "#3b82f6", spread: 185, intensity: 1.1, t: t });

          // Chipped painted wooden duck decoy & snare crossbar bobbing behind net!
          var dy = 285 + Math.sin(t * 3.2) * 12;
          S.drawCardboardPuppetPiece(ctx, [[465, 138], [865, 138], [855, 166], [475, 166]], {
            tone: "#78350f",
            ribs: 3,
            pins: [[500, 152], [830, 152]]
          });
          ctx.save();
          ctx.translate(665, dy);
          ctx.rotate(Math.sin(t * 2.6) * 0.08);
          S.drawCutoutPaperEdge(ctx, [[-72, 24], [-54, -18], [26, -16], [48, -54], [74, -52], [62, 24]], "#92400e", "#14110d", { paperRim: 3 });
          S.drawCutoutPaperEdge(ctx, [[44, -54], [76, -54], [68, -24], [38, -24]], "#065f46", "#14110d", { paperRim: 1.5, shadow: false });
          S.drawCutoutPaperEdge(ctx, [[72, -48], [102, -42], [72, -34]], "#facc15", "#14110d", { paperRim: 1.5 });
          ctx.restore();

          drawGreenTwineNet(ctx, S, t, { holeCX: 665, holeCY: 295, holeR: 62 });

          // Alarmed Turkey spinning spoked brass submarine helm wheel hard-to-port!
          S.drawTurkeyInCorner(ctx, 190, 495, 1.08, t, { dispatch: 0.9 });
          ctx.save();
          ctx.translate(315, 492);
          ctx.rotate(-t * 5.8);
          ctx.strokeStyle = "#d97706";
          ctx.lineWidth = 9;
          ctx.beginPath();
          ctx.arc(0, 0, 56, 0, TAU);
          for (var sp = 0; sp < 6; sp++) {
            var sa = (sp / 6) * TAU;
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(sa) * 74, Math.sin(sa) * 74);
          }
          ctx.stroke();
          S.drawSplitPin(ctx, 0, 0, 6.0, { metal: "brass" });
          ctx.restore();
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Great Trap Pond Trout Jailbreak: 6 cheering minnows swim single-file through lit hole!
          var BG = getEngine();
          var t = resolved.t;
          drawGreenTwineNet(ctx, S, t, { holeCX: 600, holeCY: 315, holeR: 122 });
          BG.drawVolumetricBeam(ctx, 210, 585, 600, 315, { color: "#60a5fa", spread: 145, intensity: 1.0, t: t });
          BG.drawLanternHalo(ctx, 600, 315, 130, { color: "#fde047", intensity: 0.75, t: t });

          for (var i = 0; i < 6; i++) {
            var u = ((t * 0.42 + i / 6) % 1);
            var mx = BG.lerp(360, 845, u);
            var my = 315 + Math.sin(u * TAU + t * 3) * 28;
            drawCutoutMinnow(ctx, S, mx, my, Math.cos(u * TAU) * 0.16, 1.12, Math.sin(t * 12 + i) * 6, "#f8fafc");
          }

          S.drawBrookTrout(ctx, 945, 385, 1.24, t, false, { tilt: 0.16 + Math.sin(t * 3) * 0.1 });
          S.drawMailSnail(ctx, 835, 502, 1.2, t, { hasReply: true, postcard: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Snapped Tractor-Beam Laser Grid Web!
          var BG = getEngine();
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 640, 104, 1.22, t, 640, 335, { beamSpread: 225 });
          BG.drawTractorRings(ctx, 640, 128, 640, 360, t, { spread: 195, rings: 6 });
          drawGreenTwineNet(ctx, S, t, { holeCX: 640, holeCY: 325, holeR: 72, laser: true, bobbers: false });
          BG.drawDeterministicParticles(ctx, "brass_sparks", 640, 325, t, {
            loop: true,
            count: 20,
            color: "#34d399",
            seed: 24.9
          });
        }
      },

      o: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Parachute Sea-Anchor Slows Submarine: giant green dome + taut cork lines + lurching Turkey!
          var BG = getEngine();
          var t = resolved.t;
          drawCurrentPuffJet(ctx, BG, 640, 585, 640, 210, 1.0, t, { color: "#f87171", bubbles: 26 });
          // Inflated green parachute canopy dome
          S.drawCutoutPaperEdge(
            ctx,
            [[280, 365], [345, 175], [510, 108], [770, 108], [935, 175], [1000, 365], [820, 330], [640, 348], [460, 330]],
            "#15803d",
            "#14110d",
            { paperRim: 4.0 }
          );
          drawGreenTwineNet(ctx, S, t, { holeCX: 640, holeCY: 240, holeR: 0, billow: 140 });
          // Taut rigging cords pulling to corners
          ctx.strokeStyle = "#fbfaf5";
          ctx.lineWidth = 3.2;
          var shroudX = [285, 460, 820, 995];
          for (var si = 0; si < shroudX.length; si++) {
            ctx.beginPath();
            ctx.moveTo(shroudX[si], 355);
            ctx.lineTo(640 + (si - 1.5) * 95, 595);
            ctx.stroke();
          }
          // Turkey lurching large forward near glass!
          S.drawTurkeyInCorner(ctx, 255 + Math.sin(t * 5) * 8, 468, 1.32, t, { dispatch: 0.95 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Underwater Volleyball Match Over Net: Brook Trout spikes dandelion ball to Mail Snail!
          var BG = getEngine();
          var t = resolved.t;
          // Cattail net posts
          S.drawCardboardPuppetPiece(ctx, [[238, 255], [254, 255], [254, 545], [238, 545]], { tone: "#57534e" });
          S.drawCardboardPuppetPiece(ctx, [[1026, 255], [1042, 255], [1042, 545], [1026, 545]], { tone: "#57534e" });
          drawGreenTwineNet(ctx, S, t, { volleyball: true, bobbers: false });

          // Parabolic bouncing puffy white dandelion-seed water-ball!
          var ballPhase = (t * 0.85) % 1;
          var dir = Math.floor(t * 0.85) % 2 === 0;
          var bx = dir ? BG.lerp(875, 405, ballPhase) : BG.lerp(405, 875, ballPhase);
          var by = 335 - Math.sin(ballPhase * Math.PI) * 195;
          drawStarPoly(ctx, S, bx, by, 14, 34, 25, t * 2.2, "#fbfaf5", "#14110d", 2.0);

          S.drawBrookTrout(ctx, 895, 295 - Math.max(0, Math.sin(t * 5.3)) * 38, 1.24, t, false, { tilt: -0.25 });
          S.drawMailSnail(ctx, 395, 455 - Math.max(0, Math.cos(t * 5.3)) * 22, 1.32, t, { hasReply: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Tangled Space-Kraken Mint Dental Floss between cosmic asteroid teeth!
          var BG = getEngine();
          var t = resolved.t;
          var flossX = Math.sin(t * 5.4) * 65;
          S.drawAlienSaucer(ctx, 640, 105, 1.22, t, 640 + flossX * 0.4, 425, { beamSpread: 205 });

          for (var kt = -3; kt <= 3; kt++) {
            var tx = 640 + kt * 68;
            S.drawCutoutPaperEdge(ctx, [[tx - 26, 550], [tx - 18, 412], [tx + 18, 412], [tx + 26, 550]], "#f8fafc", "#14110d", { paperRim: 3.5 });
          }
          ctx.strokeStyle = "#5eead4";
          ctx.lineWidth = 7.5;
          ctx.beginPath();
          ctx.moveTo(275 + flossX * 0.6, 358);
          ctx.lineTo(640 + flossX, 438);
          ctx.lineTo(1005 + flossX * 0.6, 358);
          ctx.stroke();

          drawIKCardboardLimb(ctx, S, 175, 565, 145, 130, 275 + flossX * 0.6, 358, -1, {
            w0: 26, w1: 18, w2: 12, upperTone: "#6b21a8", lowerTone: "#9333ea", pinR: 5.5
          });
          drawIKCardboardLimb(ctx, S, 1105, 565, 145, 130, 1005 + flossX * 0.6, 358, 1, {
            w0: 26, w1: 18, w2: 12, upperTone: "#6b21a8", lowerTone: "#9333ea", pinR: 5.5
          });
          drawStarPoly(ctx, S, 640 - flossX * 0.5, 396, 4, 24, 8, t * 3, "#fef08a", "#0f8f80", 1.5);
        }
      },

      triangle: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Tagged Evidence From Propeller Sabotage: yellow tag + Detective Turkey with giant magnifying glass!
          var BG = getEngine();
          var t = resolved.t;
          drawGreenTwineNet(ctx, S, t, { holeCX: 685, holeCY: 325, holeR: 88 });

          // Yellow notched crime-scene evidence tag (pure geometric stripes & seal — 0 text!)
          S.drawCutoutPaperEdge(ctx, [[545, 225], [645, 225], [658, 250], [645, 335], [545, 335]], "#facc15", "#14110d", { paperRim: 3 });
          ctx.fillStyle = "#14110d";
          ctx.fillRect(562, 256, 66, 8);
          ctx.fillRect(562, 274, 48, 8);
          ctx.fillStyle = "#d42a1e";
          ctx.beginPath();
          ctx.arc(622, 306, 12, 0, TAU);
          ctx.fill();

          S.drawMailSnail(ctx, 512, 232, 1.2, t, { postcard: true });

          // Detective Turkey in plaid deerstalker hat peering through giant brass magnifying lens!
          S.drawTurkeyInCorner(ctx, 195, 495, 1.08, t, { dispatch: 0.7 });
          S.drawCutoutPaperEdge(ctx, [[165, 452], [200, 428], [238, 452]], "#92400e", "#14110d", { paperRim: 2 });
          var magX = 395 + Math.sin(t * 2.2) * 24;
          var magY = 395 + Math.cos(t * 1.9) * 16;
          S.drawCardboardPuppetPiece(ctx, [[255, 495], [magX - 38, magY + 32], [magX - 28, magY + 44], [265, 508]], { tone: "#78350f" });
          ctx.fillStyle = "rgba(186, 230, 253, 0.42)";
          ctx.strokeStyle = "#d97706";
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(magX, magY, 64, 0, TAU);
          ctx.fill();
          ctx.stroke();
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Cozy Woven Creek Hammock Nap: net draped between two reeds with lounging Brook Trout!
          var BG = getEngine();
          var t = resolved.t;
          S.drawCardboardPuppetPiece(ctx, [[272, 145], [292, 145], [292, 545], [272, 545]], { tone: "#4d7c0f", ribs: 2 });
          S.drawCardboardPuppetPiece(ctx, [[988, 145], [1008, 145], [1008, 545], [988, 545]], { tone: "#4d7c0f", ribs: 2 });
          drawGreenTwineNet(ctx, S, t * 0.4, { hammock: true, bobbers: false });

          // Relaxed Brook Trout lounging in hammock gentle swing!
          var rockY = 392 + Math.sin(t * 1.8) * 12;
          S.drawBrookTrout(ctx, 640, rockY, 1.38, t * 0.35, false, { tilt: -0.06 + Math.sin(t * 1.8) * 0.05 });
          S.drawMailSnail(ctx, 325, 272, 1.18, t, { hasReply: true });
          BG.drawDeterministicParticles(ctx, "bubbles", 555, rockY - 42, t, { loop: true, count: 6 });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Woven Wormhole Cradle Lifts Saucer: cat's-cradle trampoline bouncing the 3-eyed Saucer!
          var BG = getEngine();
          var t = resolved.t;
          var bounce = Math.abs(Math.sin(t * 3.8));
          var saucerY = 315 - bounce * 185;
          var dent = (1 - bounce) * 65;

          drawGreenTwineNet(ctx, S, t, { hammock: true, laser: true, bobbers: false });
          // Rainbow trampoline shockwave rings
          for (var ri = 0; ri < 3; ri++) {
            var ru = ((t * 0.9 + ri / 3) % 1);
            ctx.strokeStyle = ri === 0 ? "#34d399" : (ri === 1 ? "#f472b6" : "#fde047");
            ctx.lineWidth = 3.2 * (1 - ru);
            ctx.beginPath();
            ctx.ellipse(640, 395 + dent * 0.4, 80 + ru * 340, 22 + ru * 75, 0, 0, TAU);
            ctx.stroke();
          }
          S.drawAlienSaucer(ctx, 640, saucerY, 1.28, t, 640, 415, { beamSpread: 140 });
          S.drawMailSnail(ctx, 295, 285, 1.18, t, { hasAlienStamp: true });
        }
      },

      square: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Freed Rudder Spins Full Speed: parted net curtains + whirring brass propeller + Captain Turkey salute!
          var BG = getEngine();
          var t = resolved.t;
          drawGreenTwineNet(ctx, S, t, { holeCX: 640, holeCY: 320, holeR: 175, partCurtain: 1.0 });

          // Spinning 3-blade brass submarine propeller at center!
          ctx.save();
          ctx.translate(640, 332);
          ctx.rotate(t * 14.0);
          for (var b = 0; b < 3; b++) {
            ctx.save();
            ctx.rotate((b / 3) * TAU);
            S.drawCutoutPaperEdge(ctx, [[-14, 0], [-38, -118], [38, -118], [14, 0]], "#eab308", "#14110d", { paperRim: 2.5 });
            ctx.restore();
          }
          S.drawSplitPin(ctx, 0, 0, 12, { metal: "brass" });
          ctx.restore();
          BG.drawDeterministicParticles(ctx, "bubbles", 640, 332, t, { loop: true, count: 28, spreadX: 180, spreadY: 120 });

          // Captain Turkey in white naval cap saluting!
          S.drawTurkeyInCorner(ctx, 185, 498, 1.08, t, { dispatch: 0.85 });
          S.drawCutoutPaperEdge(ctx, [[158, 452], [218, 446], [212, 466], [162, 468]], "#f8fafc", "#14110d", { paperRim: 2 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Giant Tin Tailor Shears Ribbon-Cutting with Brook Trout & Mail Snail!
          var BG = getEngine();
          var t = resolved.t;
          var snip = 0.08 + 0.32 * Math.abs(Math.sin(t * 6.8));
          drawGreenTwineNet(ctx, S, t, { holeCX: 640, holeCY: 325, holeR: 135, partCurtain: 0.45 });

          // Ceremonial crimson ribbon bow stretched across center
          S.drawCutoutPaperEdge(ctx, [[420, 316], [860, 316], [860, 338], [420, 338]], "#dc2626", "#14110d", { paperRim: 2 });

          // Giant Tin Dressmaker Shears wielded from right by Brook Trout!
          ctx.save();
          ctx.translate(640, 326);
          ctx.rotate(Math.PI - 0.12);
          ctx.save();
          ctx.rotate(-snip);
          S.drawCardboardPuppetPiece(ctx, [[-24, -10], [175, -4], [145, 14], [-24, 8]], { tone: "#cbd5e1", ribs: 2 });
          ctx.restore();
          ctx.save();
          ctx.rotate(snip);
          S.drawCardboardPuppetPiece(ctx, [[-24, -8], [145, -14], [175, 4], [-24, 10]], { tone: "#94a3b8", ribs: 2 });
          ctx.restore();
          S.drawSplitPin(ctx, 0, 0, 7.0, { metal: "brass" });
          ctx.restore();

          drawBrassProbe(ctx, S, BG, 210, 560, 535, 326, t, { jaw: snip, seed: 24.7 });
          S.drawBrookTrout(ctx, 945, 355, 1.25, t, false);
          S.drawMailSnail(ctx, 640, 502, 1.22, t, { hasReply: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Severed Orbital Tether Floats Skyward: cork bobbers rocket up like mini ringed planets!
          var BG = getEngine();
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 640, 106, 1.24, t, 640, 460, { beamSpread: 220 });
          BG.drawTractorRings(ctx, 640, 132, 640, 480, t, { spread: 195, rings: 6 });

          drawGreenTwineNet(ctx, S, t, { holeCX: 640, holeCY: 335, holeR: 165, partCurtain: 0.85, bobbers: false });

          for (var ci = 0; ci < 8; ci++) {
            var u = ((t * 0.45 + ci / 8) % 1);
            var bx = 420 + (ci % 4) * 145 + Math.sin(t * 3 + ci) * 22;
            var by = BG.lerp(535, 145, u);
            ctx.strokeStyle = "#fde047";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.ellipse(bx, by, 32, 9, 0.25, 0, TAU);
            ctx.stroke();
            S.drawCutoutPaperEdge(ctx, [[bx - 16, by - 16], [bx + 16, by - 16], [bx + 16, by + 16], [bx - 16, by + 16]], ci % 2 === 0 ? "#ef4444" : "#f97316", "#14110d", { paperRim: 2.2 });
          }
        }
      }
    }
  };

  // ==========================================================================
  // PORTHOLE #25 · LOCK — Trout Wearing a Glass Fishbowl ("queneau-rostrum")
  // Plates: portholes/p25.jpg + assets/atlas-stills/atlas-45.webp
  // ==========================================================================
  function drawP25Backdrop(ctx, W, H, resolved, plates, S) {
    var BG = getEngine();
    var t = resolved.t;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var spaceMode = (resolved.phase === "outcome" && resolved.selectedTier === "preposterous");
    var pxB = S.parallaxX(0.24, t, resolved);
    var pxM = S.parallaxX(0.5, t, resolved);

    S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 25, t, resolved, {
      paperTop: spaceMode ? "#1e293b" : "#fae194",
      paperBot: spaceMode ? "#0f172a" : "#eed07c",
      floorColor: spaceMode ? "#334155" : "#273b19"
    });

    // Torn-deckle airlock service door on right with pure geometric Sight + Air icons (0 text!)
    var doorX = 972 + pxB;
    S.drawTornPaperFlat(ctx, doorX, 76, 205, 462, {
      fill: "#223618",
      paperColor: "#f3eee2",
      deckle: 7.5,
      stroke: "#14110d",
      seed: 25.8
    });
    S.drawCutoutPaperEdge(ctx, [[doorX + 36, 134], [doorX + 170, 134], [doorX + 170, 180], [doorX + 36, 180]], "#f3eee2", "#14110d", { paperRim: 0, shadow: false });
    ctx.fillStyle = "#0f8f80";
    ctx.beginPath();
    ctx.arc(doorX + 74, 157, 11, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.moveTo(doorX + 118, 157);
    ctx.lineTo(doorX + 146, 144);
    ctx.lineTo(doorX + 146, 170);
    ctx.closePath();
    ctx.fill();

    // Left cavern stalactite wall & stone floor ledge from p25.jpg
    drawPlateFrac(
      ctx, S, pImg,
      0.21, 0.19, 0.17, 0.44,
      36 + pxB, 72, 198, 448,
      [[0.04, 0.04], [0.94, 0.06], [0.68, 0.94], [0.06, 0.96]],
      { haloWidth: 4.2 }
    );
    // Warm hanging amber diner lamp from atlas-45.webp (strictly x:0.36..0.52, y:0.0..0.30 — zero newspaper text!)
    drawPlateFrac(
      ctx, S, aImg,
      0.36, 0.0, 0.16, 0.30,
      465 + pxB * 0.7, 28, 155, 138,
      [[0.18, 0.02], [0.82, 0.02], [0.96, 0.92], [0.04, 0.92]],
      { haloWidth: 3.8 }
    );
    drawPlateFrac(
      ctx, S, pImg,
      0.30, 0.67, 0.44, 0.16,
      335 + pxM * 0.5, 482, 470, 92,
      [[0.04, 0.18], [0.96, 0.12], [0.94, 0.94], [0.06, 0.92]],
      { haloWidth: 4.0 }
    );

    BG.drawWaterCaustics(ctx, W, H, t, { intensity: 0.16, color: "#fef08a" });
    BG.drawDepthFog(ctx, W, H, t, { density: 0.10, color: "#fef3c7" });
  }

  // Reusable Bipedal Diner Trout in Upside-Down Dry-Air Glass Fishbowl Helmet
  function drawFishbowlDinerTrout(ctx, S, plates, t, opts) {
    var cfg = opts || {};
    var pImg = plates.portholeImg;
    var ax = cfg.x != null ? cfg.x : 585;
    var ay = cfg.y != null ? cfg.y : 348;
    var sc = cfg.scale || 1.0;
    var bowlR = (cfg.bowlR || 88);
    var walk = t * (cfg.walkSpeed != null ? cfg.walkSpeed : 4.2);

    ctx.save();
    ctx.translate(ax, ay);
    ctx.scale(sc, sc);
    if (cfg.rot) ctx.rotate(cfg.rot);

    // 2-bone IK striding fin-legs (+ optional roller skates!)
    var s1x = -18 + Math.sin(walk) * 34;
    var s1y = 148 - Math.max(0, Math.cos(walk)) * 16;
    var s2x = 22 + Math.sin(walk + Math.PI) * 34;
    var s2y = 148 - Math.max(0, Math.cos(walk + Math.PI)) * 16;
    drawIKCardboardLimb(ctx, S, -10, 56, 50, 48, s1x, s1y, 1, { w0: 12, w1: 9.5, w2: 8, upperTone: "#8f9c8a", lowerTone: "#b8b48c" });
    drawIKCardboardLimb(ctx, S, 16, 56, 50, 48, s2x, s2y, 1, { w0: 12, w1: 9.5, w2: 8, upperTone: "#8f9c8a", lowerTone: "#b8b48c" });

    var feet = [[s1x, s1y], [s2x, s2y]];
    for (var fi = 0; fi < 2; fi++) {
      var fx = feet[fi][0], fy = feet[fi][1];
      S.drawCardboardPuppetPiece(ctx, [[fx - 34, fy + 2], [fx + 14, fy - 6], [fx + 18, fy + 10], [fx - 30, fy + 12]], {
        tone: "#b8a86c",
        pin: { x: fx, y: fy, r: 3.6, metal: "brass" }
      });
      if (cfg.skates) {
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(fx - 20, fy + 17, 6.5, 0, TAU);
        ctx.arc(fx + 6, fy + 17, 6.5, 0, TAU);
        ctx.fill();
      }
    }

    // Spotted tail counterbalance
    S.drawCardboardPuppetPiece(ctx, [[34, 38], [96, 10], [86, 68], [28, 58]], {
      tone: "#8f9c8a",
      ribs: 2,
      pin: { x: 36, y: 48, r: 4.0, metal: "silver" }
    });

    // Brass diving cuirass from p25.jpg + striped soda-jerk paper apron!
    drawPlateFrac(
      ctx, S, pImg,
      0.40, 0.41, 0.23, 0.17,
      -56, -42, 118, 106,
      [[0.08, 0.06], [0.92, 0.06], [0.90, 0.94], [0.10, 0.94]],
      { haloWidth: 3.4 }
    );
    var apronJit = cfg.vibrate ? Math.sin(t * 48) * 5 : 0;
    S.drawCutoutPaperEdge(
      ctx,
      [[-42 + apronJit, -8], [32 + apronJit, -8], [44 + apronJit, 68], [-48 + apronJit, 68]],
      "#fbfaf5",
      "#14110d",
      { paperRim: 2.0 }
    );
    ctx.fillStyle = "#ef4444";
    for (var st = -32; st <= 24; st += 16) {
      ctx.fillRect(st + apronJit, -6, 6, 72);
    }

    // Rubber sink-gasket collar
    S.drawCardboardPuppetPiece(ctx, [[-64, -36], [64, -36], [58, -18], [-58, -18]], {
      tone: "#334155",
      ribs: 1,
      pins: [[-42, -27], [0, -27], [42, -27]]
    });

    // Layer 1: Back inverted glass fishbowl dome
    var bowlY = -112 + (cfg.bowlLift || 0);
    var bPts = [];
    for (var b = 0; b < 20; b++) {
      var ba = (b / 20) * TAU;
      var wob = cfg.wobbleBowl ? Math.sin(ba * 3 + t * 14) * 5 : 0;
      bPts.push([Math.cos(ba) * (bowlR + wob), bowlY + Math.sin(ba) * (bowlR + wob)]);
    }
    S.drawCutoutPaperEdge(ctx, bPts, cfg.bowlFill || "#cffafe", "#14110d", { paperRim: 4.2 });

    // Layer 2: Scissored Trout Head inside dry-air dome from p25.jpg
    drawPlateFrac(
      ctx, S, pImg,
      0.39, 0.28, 0.22, 0.16,
      -62, bowlY - 44, 128, 96,
      [[0.06, 0.14], [0.58, 0.04], [0.96, 0.22], [0.92, 0.92], [0.08, 0.90]],
      { haloWidth: 0, shadow: false, rot: Math.sin(t * 2.2) * 0.04 }
    );

    if (cfg.pompadour) {
      // Glossy black Elvis pompadour hairdo inside dry helmet!
      S.drawCutoutPaperEdge(
        ctx,
        [[-58, bowlY - 26], [-72, bowlY - 68], [-8, bowlY - 76], [38, bowlY - 44], [24, bowlY - 18]],
        "#0f172a",
        "#14110d",
        { paperRim: 2.0 }
      );
    }

    if (typeof cfg.insideBowlFn === "function") {
      cfg.insideBowlFn(ctx, 0, bowlY, bowlR);
    }

    // Layer 3: Inverted flat base lip atop dome + front glass specular crescent
    ctx.fillStyle = "#e0f2fe";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(0, bowlY - bowlR * 0.84, bowlR * 0.56, 11, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (cfg.diverLattice) {
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(0, bowlY, bowlR, 0, TAU);
      ctx.moveTo(-bowlR, bowlY); ctx.lineTo(bowlR, bowlY);
      ctx.moveTo(0, bowlY - bowlR); ctx.lineTo(0, bowlY + bowlR);
      ctx.stroke();
      S.drawSplitPin(ctx, 0, bowlY, 6.0, { metal: "brass" });
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.88)";
    ctx.lineWidth = cfg.defogged ? 11 : 6.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, bowlY, bowlR - 14, Math.PI * 1.06, Math.PI * 1.52);
    ctx.stroke();

    // Pectoral fin arm
    ctx.save();
    ctx.translate(-26, -2);
    ctx.rotate(cfg.armAng != null ? cfg.armAng : (0.24 + Math.sin(walk + Math.PI) * 0.25));
    S.drawCardboardPuppetPiece(ctx, [[6, -8], [-50, 14], [-44, 30], [8, 10]], {
      tone: "#b8a86c",
      pin: { x: 0, y: 0, r: 4.0, metal: "brass" }
    });
    ctx.restore();

    ctx.restore();
  }

  var P25_SPEC = {
    drawBackdrop: drawP25Backdrop,

    drawRoot: function (ctx, W, H, resolved, plates, S) {
      var BG = getEngine();
      var t = resolved.t;
      // Pancake & milkshake counter plate from atlas-45.webp (clean x:0.32..0.52, y:0.58..0.88!)
      drawPlateFrac(
        ctx, S, plates.atlasImg,
        0.32, 0.58, 0.20, 0.29,
        250, 398, 185, 135,
        [[0.05, 0.06], [0.95, 0.06], [0.94, 0.94], [0.06, 0.94]],
        { haloWidth: 3.5 }
      );
      drawFishbowlDinerTrout(ctx, S, plates, t, {
        x: 595 + Math.sin(t * 1.1) * 22,
        y: 348
      });
      S.drawTurkeyInCorner(ctx, 128, 504, 0.98, t, { dispatch: 0 });
      drawRootHotspotTargets(ctx, BG, resolved);
    },

    stems: {
      x: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        drawFishbowlDinerTrout(ctx, S, plates, t, {
          x: 595,
          y: 348,
          defogged: true,
          insideBowlFn: function (c, bx, by, br) {
            // Misty fog beads evaporating outward as u -> 1
            c.fillStyle = "rgba(255,255,255," + ((1 - u) * 0.68).toFixed(3) + ")";
            for (var i = 0; i < 8; i++) {
              var a = (i / 8) * TAU;
              c.beginPath();
              c.arc(bx + Math.cos(a) * br * 0.55, by + Math.sin(a) * br * 0.55, 14 * (1 - u * 0.8), 0, TAU);
              c.fill();
            }
          }
        });
        BG.drawVolumetricBeam(ctx, 215, 585, 595, 236, { color: "#60a5fa", spread: 135, intensity: 1.15, t: t });
        BG.drawLanternHalo(ctx, 595, 236, 120, { color: "#bae6fd", intensity: 0.9, t: t });
        S.drawTurkeyInCorner(ctx, 128, 504, 0.98, t, { dispatch: 0.2 });
      },

      o: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        // Fat crimson-lit air bubble rising and slipping under collar, plumping up dome!
        var bubY = BG.lerp(540, 315, BG.clamp(u * 1.35, 0, 1));
        drawFishbowlDinerTrout(ctx, S, plates, t, {
          x: 595,
          y: 348 - u * 10,
          bowlR: 88 + BG.smoothstep(0.45, 1.0, u) * 18
        });
        drawCurrentPuffJet(ctx, BG, 880, 520, 615, 325, u, t, { color: "#f87171", bubbles: 20 });
        if (u < 0.78) {
          ctx.fillStyle = "rgba(254, 202, 202, 0.85)";
          ctx.strokeStyle = "#14110d";
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.arc(625, bubY, 24, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
        S.drawTurkeyInCorner(ctx, 128, 504, 0.98, t, { dispatch: 0.15 });
      },

      triangle: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        drawFishbowlDinerTrout(ctx, S, plates, t, { x: 595, y: 356, walkSpeed: 1.5 });
        // Mail Snail climbs onto inverted dome top like a hood ornament with waterproof diner order ticket!
        var sx = BG.lerp(225, 595, BG.easeOutCubic(u));
        var sy = BG.lerp(525, 152, BG.easeOutCubic(u));
        BG.drawSnailSilverTrail(ctx, 225, 530, sx, sy + 10, u, t);
        S.drawMailSnail(ctx, sx, sy, 1.18, t, { postcard: true });
        if (u > 0.65) {
          S.drawCutoutPaperEdge(ctx, [[628, 128], [674, 124], [678, 174], [632, 178]], "#fef9c3", "#14110d", { paperRim: 2 });
        }
        S.drawTurkeyCutawayBadge(ctx, 124, 500, 0.94, t, { dispatch: 0.8 });
      },

      square: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        drawFishbowlDinerTrout(ctx, S, plates, t, {
          x: 595,
          y: 348,
          wobbleBowl: u > 0.35
        });
        drawBrassProbe(ctx, S, BG, 1085, 545, 686, 236, t, {
          u: u,
          jaw: 0.12,
          seed: 25.4
        });
        if (u > 0.35) {
          for (var r = 0; r < 3; r++) {
            var ru = ((t * 1.8 + r / 3) % 1);
            ctx.strokeStyle = "rgba(251, 191, 36, " + (1 - ru).toFixed(3) + ")";
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.arc(684, 236, 12 + ru * 75, 0, TAU);
            ctx.stroke();
          }
        }
        S.drawTurkeyInCorner(ctx, 128, 504, 0.98, t, { dispatch: 0.15 });
      }
    },

    outcomes: {
      x: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Rival Deep-Sea Salvage Diver Suit + Turkey hides secret submarine logbook!
          var BG = getEngine();
          var t = resolved.t;
          BG.drawVolumetricBeam(ctx, 210, 585, 625, 240, { color: "#3b82f6", spread: 165, intensity: 1.05, t: t });
          // Braided air hoses trailing to airlock door
          ctx.strokeStyle = "#1e293b";
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(685, 275);
          ctx.quadraticCurveTo(845, 385, 985, 310);
          ctx.stroke();

          drawFishbowlDinerTrout(ctx, S, plates, t, {
            x: 625,
            y: 348,
            diverLattice: true,
            bowlFill: "#99f6e4"
          });

          // Frantic Turkey hiding crimson secret logbook behind wing!
          S.drawTurkeyInCorner(ctx, 195, 495, 1.12, t, { dispatch: 0.9 });
          ctx.save();
          ctx.translate(122, 472 + Math.sin(t * 7) * 5);
          ctx.rotate(-0.28);
          S.drawCutoutPaperEdge(ctx, [[-38, -48], [38, -48], [38, 48], [-38, 48]], "#991b1b", "#14110d", { paperRim: 2.5 });
          drawStarPoly(ctx, S, 0, 0, 5, 16, 7, 0, "#fbbf24", "#14110d", 1.2);
          ctx.restore();
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Dry-Hair Salon Helmet For Trout: Elvis pompadour + pink comb + Mail Snail holding hand mirror!
          var BG = getEngine();
          var t = resolved.t;
          BG.drawVolumetricBeam(ctx, 220, 585, 585, 235, { color: "#60a5fa", spread: 150, intensity: 0.95, t: t });
          drawFishbowlDinerTrout(ctx, S, plates, t, {
            x: 585,
            y: 352,
            pompadour: true,
            defogged: true,
            armAng: -1.15 + Math.sin(t * 5.5) * 0.22,
            insideBowlFn: function (c, bx, by) {
              // Pink pocket comb grooming the pompadour!
              var cx2 = -22 + Math.sin(t * 5.5) * 18;
              c.fillStyle = "#ec4899";
              c.fillRect(cx2, by - 78, 44, 10);
            }
          });

          // Mail Snail holding up oval silver salon hand-mirror!
          S.drawMailSnail(ctx, 815, 488, 1.24, t, { hasReply: true, flip: true });
          S.drawCardboardPuppetPiece(ctx, [[772, 472], [782, 472], [768, 355], [756, 355]], { tone: "#d97706" });
          ctx.fillStyle = "#e0f2fe";
          ctx.strokeStyle = "#cbd5e1";
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.ellipse(758, 318, 42, 56, -0.15, 0, TAU);
          ctx.fill();
          ctx.stroke();
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Reverse-Ocean Tourist From Water Planet: holographic alien glyph ring + Vulcan fin salute to Saucer!
          var BG = getEngine();
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 360, 108, 1.22, t, 635, 255, { beamSpread: 175 });
          BG.drawTractorRings(ctx, 360, 134, 635, 255, t, { spread: 145, rings: 5 });

          drawFishbowlDinerTrout(ctx, S, plates, t, {
            x: 635,
            y: 332 + Math.sin(t * 2.2) * 14,
            bowlFill: "#164e63",
            armAng: -0.95
          });

          // Scrolling cyan geometric Hydra-9 hologram glyphs orbiting helmet visor (0 text!)
          for (var g = 0; g < 8; g++) {
            var ga = t * 1.9 + (g / 8) * TAU;
            var gx = 635 + Math.cos(ga) * 116;
            var gy = 220 + Math.sin(ga) * 32;
            BG.drawGeometricSymbol(ctx, ["x", "o", "triangle", "square"][g % 4], gx, gy, 11, "#22d3ee", 2.4);
          }
          // Split V-fin Vulcan salute!
          S.drawCutoutPaperEdge(ctx, [[568, 295], [542, 248], [562, 245], [574, 282], [586, 245], [606, 248], [582, 295]], "#eab308", "#14110d", { paperRim: 2 });
        }
      },

      o: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Over-Inflated Scuba Helmet Float-Away: giant balloon fishbowl floats Diner Trout skyward!
          var BG = getEngine();
          var t = resolved.t;
          var floatY = 238 + Math.sin(t * 2.4) * 18;
          drawCurrentPuffJet(ctx, BG, 640, 585, 620, 320, 1.0, t, { color: "#f87171", bubbles: 22 });
          drawFishbowlDinerTrout(ctx, S, plates, t, {
            x: 625,
            y: floatY,
            bowlR: 126,
            bowlLift: -20,
            walkSpeed: 9.5,
            rot: Math.sin(t * 2.0) * 0.08
          });
          S.drawTurkeyInCorner(ctx, 168, 504, 1.04, t, { dispatch: 0.85 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Underwater Soda-Fountain Fizzy Refill: chrome collar lever spritzes bubble-soda into paper cones!
          var BG = getEngine();
          var t = resolved.t;
          drawFishbowlDinerTrout(ctx, S, plates, t, { x: 545, y: 352, walkSpeed: 1.2 });

          // Chrome soda-jerk dispenser tap on collar + fizzy stream into 2 paper cone cups!
          S.drawCardboardPuppetPiece(ctx, [[605, 315], [658, 315], [658, 332], [605, 332]], {
            tone: "#e2e8f0",
            pin: { x: 645, y: 305, r: 4.5, metal: "silver" }
          });
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 6;
          ctx.setLineDash([8, 6]);
          ctx.lineDashOffset = -t * 95;
          ctx.beginPath();
          ctx.moveTo(652, 332);
          ctx.lineTo(695, 448);
          ctx.stroke();
          ctx.setLineDash([]);

          for (var ci = 0; ci < 2; ci++) {
            var cx2 = 692 + ci * 54;
            S.drawCutoutPaperEdge(ctx, [[cx2 - 18, 445], [cx2 + 18, 445], [cx2, 496]], "#fbfaf5", "#14110d", { paperRim: 2 });
            ctx.fillStyle = ci === 0 ? "#38bdf8" : "#f472b6";
            ctx.beginPath();
            ctx.arc(cx2, 442, 16, Math.PI, 0);
            ctx.fill();
          }
          BG.drawDeterministicParticles(ctx, "bubbles", 695, 438, t, { loop: true, count: 16 });
          S.drawMailSnail(ctx, 815, 496, 1.24, t, { hasReply: true, flip: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Zero-Gravity Astro-Trout Spacewalk Tether: slow somersaults on coiled silver air-hose!
          var BG = getEngine();
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 415, 112, 1.24, t, 685, 315, { beamSpread: 210 });
          BG.drawTractorRings(ctx, 415, 138, 685, 315, t, { spread: 185, rings: 6 });

          // Coiled silver spacewalk tether hose from Saucer to Astro-Trout
          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = 5.5;
          ctx.beginPath();
          for (var s = 0; s <= 36; s++) {
            var su = s / 36;
            var hx = BG.lerp(415, 685, su) + Math.sin(su * TAU * 3 + t * 3) * 22;
            var hy = BG.lerp(132, 315, su) + Math.cos(su * TAU * 3 + t * 3) * 14;
            if (s === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.stroke();

          drawFishbowlDinerTrout(ctx, S, plates, t, {
            x: 685,
            y: 315,
            scale: 0.88,
            rot: t * 1.35,
            bowlFill: "#0e7490"
          });
        }
      },

      triangle: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Bird-In-A-Bottle Rescue Misunderstanding: flapping canary inside glass dome + Turkey with boat-hook!
          var t = resolved.t;
          drawFishbowlDinerTrout(ctx, S, plates, t, {
            x: 645,
            y: 352,
            insideBowlFn: function (c, bx, by) {
              // Fluttering golden-scarlet canary reflected upside-down inside dome!
              var flap = Math.sin(t * 14) * 18;
              S.drawCutoutPaperEdge(c, [[-26, by - 4], [0, by - 22], [28, by - 4], [0, by + 16]], "#facc15", "#14110d", { paperRim: 1.8 });
              S.drawCutoutPaperEdge(c, [[-8, by - 8], [-32, by - 26 + flap], [12, by - 12]], "#ef4444", "#14110d", { paperRim: 1.4 });
            }
          });
          S.drawMailSnail(ctx, 645, 152, 1.16, t, { postcard: true });

          // Heroic Turkey reaching out with a long brass boat-hook!
          S.drawTurkeyInCorner(ctx, 168, 498, 1.08, t, { dispatch: 0.9 });
          S.drawCardboardPuppetPiece(ctx, [[225, 478], [525, 282], [532, 294], [232, 490]], { tone: "#92400e" });
          ctx.strokeStyle = "#eab308";
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.moveTo(528, 288);
          ctx.lineTo(556, 270);
          ctx.arc(546, 296, 18, -0.6, Math.PI * 0.8);
          ctx.stroke();
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Curbside Submarine Carhop Burger Tray: roller-skating Diner Trout + kelp-shakes & hushpuppies!
          var t = resolved.t;
          drawFishbowlDinerTrout(ctx, S, plates, t, {
            x: 645 + Math.sin(t * 2.4) * 28,
            y: 332,
            skates: true
          });

          // Aluminum drive-in carhop tray hooked onto lower porthole sill!
          var tx = 455;
          var ty = 468;
          S.drawCardboardPuppetPiece(ctx, [[tx - 135, ty], [tx + 135, ty], [tx + 118, ty + 34], [tx - 118, ty + 34]], {
            tone: "#cbd5e1",
            ribs: 2,
            pins: [[tx - 105, ty + 16], [tx + 105, ty + 16]]
          });
          // Two frosted kelp-milkshake glasses with red-striped straws + golden hushpuppies!
          for (var m = 0; m < 2; m++) {
            var mx = tx - 72 + m * 58;
            ctx.strokeStyle = "#dc2626";
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.moveTo(mx + 6, ty - 42);
            ctx.lineTo(mx + 18, ty - 78);
            ctx.stroke();
            S.drawCutoutPaperEdge(ctx, [[mx - 18, ty - 52], [mx + 18, ty - 52], [mx + 13, ty], [mx - 13, ty]], "#86efac", "#14110d", { paperRim: 2 });
          }
          for (var h = 0; h < 3; h++) {
            S.drawCutoutPaperEdge(ctx, [[tx + 28 + h * 26, ty - 22], [tx + 52 + h * 26, ty - 24], [tx + 50 + h * 26, ty - 2], [tx + 26 + h * 26, ty - 2]], "#d97706", "#14110d", { paperRim: 1.5 });
          }
          S.drawMailSnail(ctx, 265, 492, 1.22, t, { hasReply: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Gill-Breathing Saucer Pilot Helmet Swap: mini 3-eyed green alien in water-bowl + Diner Trout in air-bowl!
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 375, 96, 1.18, t, 375, 345, { beamSpread: 125 });

          // Lowered wire + miniature 3-eyed green alien wearing water-filled blue fishbowl!
          var ay = 305 + Math.sin(t * 2.5) * 14;
          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(375, 118);
          ctx.lineTo(375, ay - 76);
          ctx.stroke();

          S.drawCardboardPuppetPiece(ctx, [[345, ay - 8], [405, ay - 8], [398, ay + 68], [352, ay + 68]], { tone: "#94a3b8", ribs: 2 });
          var aBowl = [];
          for (var b = 0; b < 18; b++) {
            var ba = (b / 18) * TAU;
            aBowl.push([375 + Math.cos(ba) * 62, ay - 42 + Math.sin(ba) * 62]);
          }
          S.drawCutoutPaperEdge(ctx, aBowl, "#0284c7", "#14110d", { paperRim: 3.5 });
          // 3-eyed green alien head inside water bowl!
          S.drawCardboardPuppetPiece(ctx, [[352, ay - 32], [350, ay - 62], [375, ay - 72], [400, ay - 62], [398, ay - 32]], { tone: "#4ade80", shadow: false });
          for (var e = -1; e <= 1; e++) {
            ctx.fillStyle = "#fbfaf5";
            ctx.beginPath();
            ctx.arc(375 + e * 12, ay - 52 - (e === 0 ? 5 : 0), 4.8, 0, TAU);
            ctx.fill();
            ctx.fillStyle = "#14110d";
            ctx.beginPath();
            ctx.arc(375 + e * 12, ay - 52 - (e === 0 ? 5 : 0), 2.0, 0, TAU);
            ctx.fill();
          }

          drawFishbowlDinerTrout(ctx, S, plates, t, { x: 745, y: 352, armAng: -0.85 });
          S.drawMailSnail(ctx, 558, 495, 1.22, t, { hasAlienStamp: true });
        }
      },

      square: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Sonar Bell Rings Inside Helmet: concentric chime waves rattle Diner Trout while Turkey winces!
          var BG = getEngine();
          var t = resolved.t;
          var jit = Math.sin(t * 42) * 5;
          drawFishbowlDinerTrout(ctx, S, plates, t, {
            x: 615 + jit,
            y: 348,
            wobbleBowl: true,
            vibrate: true
          });
          for (var r = 0; r < 4; r++) {
            var ru = ((t * 1.5 + r / 4) % 1);
            ctx.strokeStyle = "rgba(250, 204, 21, " + ((1 - ru) * 0.85).toFixed(3) + ")";
            ctx.lineWidth = 3.6;
            ctx.beginPath();
            ctx.arc(615, 236, 25 + ru * 175, 0, TAU);
            ctx.stroke();
          }
          drawBrassProbe(ctx, S, BG, 1085, 540, 708, 236, t, { jaw: 0.1, seed: 25.7 });
          S.drawTurkeyInCorner(ctx, 145, 518, 1.02, t, { dispatch: 0.5 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Tip-Jar Coin Drop Clink: brass washer drops into piggy-bank slot atop bowl + diner bell!
          var BG = getEngine();
          var t = resolved.t;
          drawFishbowlDinerTrout(ctx, S, plates, t, { x: 585, y: 358, walkSpeed: 1.6 });

          // Slot atop bowl + dropping golden brass washer coin!
          ctx.fillStyle = "#14110d";
          ctx.fillRect(562, 168, 46, 7);
          var dropU = (t * 0.95) % 1;
          var coinY = BG.lerp(105, 225, dropU);
          ctx.fillStyle = "#facc15";
          ctx.strokeStyle = "#14110d";
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.arc(585, coinY, 18, 0, TAU);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#cffafe";
          ctx.beginPath();
          ctx.arc(585, coinY, 6, 0, TAU);
          ctx.fill();

          drawBrassProbe(ctx, S, BG, 985, 195, 608, 112, t, { jaw: 0.25, seed: 25.8 });
          // Brass diner counter bell beside Mail Snail!
          S.drawCutoutPaperEdge(ctx, [[775, 504], [790, 476], [820, 476], [835, 504]], "#eab308", "#14110d", { paperRim: 2 });
          S.drawMailSnail(ctx, 885, 496, 1.22, t, { hasReply: true, flip: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Snowglobe Gravity Shake Inside Bowl: swirling silver stars & mini Saturn inside helmet!
          var BG = getEngine();
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 595, 98, 1.24, t, 595, 245, { beamSpread: 165 });

          drawFishbowlDinerTrout(ctx, S, plates, t, {
            x: 595,
            y: 356,
            bowlR: 102,
            bowlFill: "#1e1b4b",
            insideBowlFn: function (c, bx, by, br) {
              // Miniature ringed Saturn + swirling snowglobe stars!
              var sx = Math.cos(t * 2.4) * 32;
              var sy = by - 22 + Math.sin(t * 2.4) * 16;
              c.strokeStyle = "#fde047";
              c.lineWidth = 2.6;
              c.beginPath();
              c.ellipse(sx, sy, 26, 7, -0.25, 0, TAU);
              c.stroke();
              c.fillStyle = "#f97316";
              c.beginPath();
              c.arc(sx, sy, 11, 0, TAU);
              c.fill();

              for (var st = 0; st < 12; st++) {
                var a = t * 3.1 + (st / 12) * TAU;
                var r = 24 + (st % 3) * 22;
                drawStarPoly(c, S, Math.cos(a) * r, by + Math.sin(a) * r * 0.75, 4, 7, 3, a, "#f8fafc", "#14110d", 0);
              }
            }
          });
          BG.drawDeterministicParticles(ctx, "brass_sparks", 595, 244, t, { loop: true, count: 16, color: "#e0e7ff" });
        }
      }
    }
  };

  // ==========================================================================
  // PORTHOLE #26 · BOILER — Glowing Hot Coals on the Riverbed ("cardboard-parallax")
  // Plates: portholes/p26.jpg + assets/atlas-stills/atlas-48.webp
  // ==========================================================================
  function drawP26Backdrop(ctx, W, H, resolved, plates, S) {
    var BG = getEngine();
    var t = resolved.t;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var pxF = S.parallaxX(0.22, t, resolved);
    var pyF = S.parallaxY(0.22, t, resolved);
    var pxM = S.parallaxX(0.52, t, resolved);
    var pyM = S.parallaxY(0.52, t, resolved);
    var alienTint = (resolved.phase === "outcome" && resolved.selectedTier === "preposterous");

    S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 26, t, resolved, { pillarbox: false });

    // Pegboard lure wall from atlas-48.webp (strictly x:0.06..0.72, y:0.01..0.37 — well above "HANK" nametag!)
    drawPlateFrac(
      ctx, S, aImg,
      0.06, 0.01, 0.64, 0.36,
      155 + pxF, 32 + pyF, 420, 265,
      [[0.03, 0.06], [0.52, 0.02], [0.97, 0.07], [0.94, 0.94], [0.46, 0.98], [0.05, 0.91]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.72, rot: -0.02 }
    );
    drawPlateFrac(
      ctx, S, aImg,
      0.06, 0.02, 0.64, 0.35,
      710 + pxF, 38 + pyF, 405, 258,
      [[0.05, 0.04], [0.64, 0.02], [0.96, 0.09], [0.95, 0.92], [0.35, 0.97], [0.03, 0.89]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.68, rot: 0.02 }
    );

    // Rocky cleft ledges from p26.jpg + jointed split-pin cardboard reeds
    drawPlateFrac(
      ctx, S, pImg,
      0.18, 0.34, 0.23, 0.26,
      96 + pxM, 255 + pyM, 330, 270,
      [[0.04, 0.12], [0.48, 0.03], [0.95, 0.22], [0.98, 0.92], [0.06, 0.96]],
      { filter: alienTint ? "cyan" : "mono", haloWidth: 4.4 }
    );
    drawPlateFrac(
      ctx, S, pImg,
      0.62, 0.50, 0.19, 0.26,
      855 + pxM, 264 + pyM, 325, 265,
      [[0.06, 0.20], [0.55, 0.04], [0.96, 0.14], [0.94, 0.96], [0.04, 0.92]],
      { filter: alienTint ? "cyan" : "mono", haloWidth: 4.4 }
    );

    var reedXs = [195, 248, 1015, 1068];
    for (var ri = 0; ri < reedXs.length; ri++) {
      ctx.save();
      ctx.translate(reedXs[ri] + pxM, 492 + pyM);
      ctx.rotate(S.wobble(t, 2.1, 0.13, ri * 1.3));
      S.drawCardboardPuppetPiece(ctx, [[-8, 0], [-5, -92], [5, -92], [8, 0]], {
        tone: ri % 2 === 0 ? "#6c6d69" : "#848580",
        ribs: 2,
        pin: { x: 0, y: -4, r: 3.6, metal: "silver" }
      });
      ctx.translate(0, -88);
      ctx.rotate(S.wobble(t, 2.7, 0.20, ri * 1.3 - 0.7));
      S.drawCardboardPuppetPiece(ctx, [[-5, 4], [-2, -84], [3, -84], [5, 4]], {
        tone: "#9a9993",
        ribs: 2,
        pin: { x: 0, y: 0, r: 3.2, metal: "brass" }
      });
      ctx.restore();
    }

    BG.drawWaterCaustics(ctx, W, H, t, { intensity: 0.16, color: "#fde68a" });
    BG.drawDepthFog(ctx, W, H, t, { density: 0.15, color: "#e2e8f0" });
  }

  function drawRiverbedCoalHearth(ctx, S, BG, plates, t, opts) {
    var cfg = opts || {};
    var pImg = plates.portholeImg;
    var cx = cfg.cx != null ? cfg.cx : 640;
    var cy = cfg.cy != null ? cfg.cy : 482;
    var heat = cfg.heat != null ? cfg.heat : 1.0;

    // Radial ember glow
    BG.drawLanternHalo(ctx, cx, cy - 35, 310 * heat, {
      color: cfg.glowColor || "#f97316",
      coreColor: "#fef08a",
      intensity: 0.95 * Math.min(1.5, heat),
      t: t
    });

    // Scissored real glowing coal pile & rising flame-bubble plume from p26.jpg!
    if (cfg.hidePlume !== true) {
      drawPlateFrac(
        ctx, S, pImg,
        0.41, 0.18, 0.18, 0.36,
        cx - 88 + Math.sin(t * 2.4) * 8, cy - 375, 176, 305,
        [[0.22, 0.03], [0.76, 0.04], [0.92, 0.48], [0.84, 0.96], [0.16, 0.96], [0.08, 0.46]],
        { haloWidth: 3.8, alpha: 0.88 }
      );
    }
    drawPlateFrac(
      ctx, S, pImg,
      0.38, 0.54, 0.25, 0.23,
      cx - 145, cy - 78, 290, 158,
      [[0.08, 0.25], [0.34, 0.05], [0.68, 0.04], [0.93, 0.26], [0.96, 0.86], [0.52, 0.97], [0.05, 0.85]],
      { haloWidth: 4.4 }
    );

    // Sunken stone hearth ring + breathing orange/cherry-gold ember nuggets
    for (var ci = 0; ci < 7; ci++) {
      var ang = (ci / 6) * Math.PI - Math.PI;
      var ex = cx + Math.cos(ang) * 96 + (ci - 3) * 8;
      var ey = cy - 4 + Math.sin(ci * 2.1) * 14;
      var pulse = (0.88 + 0.18 * Math.sin(t * 5.6 + ci * 1.4)) * Math.min(1.35, heat);
      ctx.save();
      ctx.translate(ex, ey);
      ctx.scale(pulse, pulse);
      S.drawCutoutPaperEdge(
        ctx,
        [[-22, -8], [-6, -18], [18, -12], [24, 6], [6, 16], [-18, 12]],
        cfg.cherryBright ? (ci % 2 === 0 ? "#fef08a" : "#fb923c") : (ci % 2 === 0 ? "#f97316" : "#facc15"),
        "#1b140e",
        { paperRim: 2.2 }
      );
      ctx.restore();
    }

    // Cast-iron grate straddling hearth stones
    if (cfg.grate !== false) {
      S.drawCardboardPuppetPiece(ctx, [[cx - 148, cy - 58], [cx + 148, cy - 58], [cx + 142, cy - 44], [cx - 142, cy - 44]], {
        tone: "#27272a",
        ribs: 4,
        pins: [[cx - 128, cy - 51], [cx + 128, cy - 51]]
      });
    }
  }

  var P26_SPEC = {
    drawBackdrop: drawP26Backdrop,
    drawForeground: function (ctx, W, H) { drawP24Pillarbox(ctx, W, H); },

    drawRoot: function (ctx, W, H, resolved, plates, S) {
      var BG = getEngine();
      var t = resolved.t;
      drawRiverbedCoalHearth(ctx, S, BG, plates, t, { cx: 640, cy: 482, heat: 1.0 });
      BG.drawDeterministicParticles(ctx, "bubbles", 640, 425, t, { loop: true, count: 14, spreadX: 110 });
      S.drawBrookTrout(ctx, 895 + Math.sin(t * 1.7) * 14, 255 + Math.cos(t * 2.2) * 8, 1.2, t, false);
      S.drawTurkeyInCorner(ctx, 168, 506, 0.98, t, { dispatch: 0 });
      drawRootHotspotTargets(ctx, BG, resolved);
    },

    stems: {
      x: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        drawRiverbedCoalHearth(ctx, S, BG, plates, t, {
          cx: 640,
          cy: 482,
          glowColor: "#e879f9",
          heat: 1.15
        });
        BG.drawVolumetricBeam(ctx, 210, 585, 640, 445, { color: "#3b82f6", spread: 165, intensity: 1.1, t: t });
        BG.drawXRayOverlay(ctx, 640, 415, 340, 175, u, function (c, cx, cy, rw, rh) {
          // Gold-and-magenta infrared thermal contour waves rising off embers (0 text!)
          for (var w = 0; w < 4; w++) {
            c.strokeStyle = w % 2 === 0 ? "#facc15" : "#f472b6";
            c.lineWidth = 3.2;
            c.beginPath();
            for (var x = cx - rw * 0.44; x <= cx + rw * 0.44; x += 14) {
              var wy = cy + 38 - w * 28 + Math.sin(x * 0.05 + t * 6 + w) * 10;
              if (x === cx - rw * 0.44) c.moveTo(x, wy);
              else c.lineTo(x, wy);
            }
            c.stroke();
          }
        }, { t: t, borderColor: "#f472b6" });
        S.drawTurkeyInCorner(ctx, 168, 506, 0.98, t, { dispatch: 0.2 });
      },

      o: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        drawRiverbedCoalHearth(ctx, S, BG, plates, t, {
          cx: 640,
          cy: 482,
          cherryBright: true,
          heat: 1.0 + u * 0.55
        });
        drawCurrentPuffJet(ctx, BG, 1060, 290, 665, 455, u, t, { color: "#fb923c", bubbles: 28 });
        BG.drawDeterministicParticles(ctx, "brass_sparks", 640, 445, t, { loop: true, count: 22, seed: 26.2 });
        S.drawTurkeyInCorner(ctx, 168, 506, 0.98, t, { dispatch: 0.15 });
      },

      triangle: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        drawRiverbedCoalHearth(ctx, S, BG, plates, t, { cx: 665, cy: 482, heat: 0.95 });

        // Waterproof green-and-brass Campfire Permit sign staked on cool left river rock (flame + checkmark, 0 text!)
        if (u > 0.42) {
          var pop = BG.easeOutBack((u - 0.42) / 0.58);
          ctx.save();
          ctx.translate(435, 445);
          ctx.scale(pop, pop);
          S.drawCardboardPuppetPiece(ctx, [[-6, 0], [6, 0], [6, 62], [-6, 62]], { tone: "#78350f" });
          S.drawCutoutPaperEdge(ctx, [[-48, -56], [48, -56], [48, 8], [-48, 8]], "#ecfccb", "#15803d", { paperRim: 2.5 });
          drawStarPoly(ctx, S, -16, -24, 5, 16, 8, 0, "#f97316", "#14110d", 1.0);
          ctx.strokeStyle = "#15803d";
          ctx.lineWidth = 4.5;
          ctx.beginPath();
          ctx.moveTo(8, -24); ctx.lineTo(18, -12); ctx.lineTo(34, -36);
          ctx.stroke();
          ctx.restore();
        }
        var sx = BG.lerp(220, 385, BG.easeOutCubic(u));
        BG.drawSnailSilverTrail(ctx, 220, 520, sx, 498, u, t);
        S.drawMailSnail(ctx, sx, 490, 1.22, t, { postcard: true });
        S.drawTurkeyCutawayBadge(ctx, 156, 500, 0.94, t, { dispatch: 0.8 });
      },

      square: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        drawRiverbedCoalHearth(ctx, S, BG, plates, t, { cx: 640, cy: 482, cherryBright: u > 0.4, heat: 1.25 });
        drawBrassProbe(ctx, S, BG, 1085, 545, 645, 455, t, {
          u: u,
          jaw: 0.14,
          sparkCount: 28,
          seed: 26.4
        });
        S.drawTurkeyInCorner(ctx, 168, 506, 0.98, t, { dispatch: 0.2 });
      }
    },

    outcomes: {
      x: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Giant Boiling Turkey Soup Cauldron + thermal carrot/celery/drumstick shadows + horrified Turkey!
          var BG = getEngine();
          var t = resolved.t;
          drawRiverbedCoalHearth(ctx, S, BG, plates, t, { cx: 650, cy: 492, hidePlume: true, grate: false, heat: 1.2 });
          BG.drawVolumetricBeam(ctx, 210, 585, 650, 355, { color: "#3b82f6", spread: 195, intensity: 0.95, t: t });

          // Giant riveted iron cauldron straddling coals
          ctx.save();
          ctx.translate(650, 358);
          S.drawCardboardPuppetPiece(ctx, [[-165, -82], [165, -82], [146, 86], [-146, 86]], {
            tone: "#3f3f46",
            ribs: 4,
            pins: [[-128, -62], [0, -62], [128, -62], [0, 24]]
          });
          S.drawCutoutPaperEdge(ctx, [[-156, -82], [0, -104], [156, -82], [0, -62]], "#eab308", "#14110d", { paperRim: 3 });

          // Bobbing carrot wheel, green celery stalk & cartoon drumstick bone!
          var b1 = Math.sin(t * 4.5) * 8;
          S.drawCutoutPaperEdge(ctx, [[-92, -88 + b1], [-62, -96 + b1], [-56, -76 + b1], [-88, -70 + b1]], "#ea580c", "#14110d", { paperRim: 2 });
          S.drawCutoutPaperEdge(ctx, [[54, -92 - b1], [92, -98 - b1], [96, -76 - b1], [58, -72 - b1]], "#65a30d", "#14110d", { paperRim: 2 });
          S.drawCutoutPaperEdge(ctx, [[-24, -106], [14, -110], [20, -88], [-20, -86]], "#b45309", "#14110d", { paperRim: 2 });
          S.drawCutoutPaperEdge(ctx, [[14, -102], [48, -110], [52, -96], [16, -92]], "#fefce8", "#14110d", { paperRim: 1.8 });
          ctx.restore();

          S.drawTurkeyInCorner(ctx, 162 - Math.abs(Math.sin(t * 5)) * 14, 504, 1.08, t, { dispatch: 0.95 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Sunken Camper's Cast-Iron Griddle: Chef Brook Trout flipping golden flapjacks onto Mail Snail's plate!
          var BG = getEngine();
          var t = resolved.t;
          drawRiverbedCoalHearth(ctx, S, BG, plates, t, { cx: 600, cy: 488, hidePlume: true, heat: 1.05 });
          BG.drawVolumetricBeam(ctx, 210, 585, 600, 385, { color: "#60a5fa", spread: 165, intensity: 0.85, t: t });

          // Cast-iron skillet on grate + flipping golden sand-dollar pancake in mid-air!
          S.drawCardboardPuppetPiece(ctx, [[485, 405], [715, 405], [702, 432], [498, 432]], { tone: "#18181b", ribs: 1 });
          S.drawCardboardPuppetPiece(ctx, [[710, 412], [815, 392], [818, 406], [712, 424]], { tone: "#27272a" });

          var flipU = (t * 1.15) % 1;
          var px = BG.lerp(600, 415, flipU);
          var py = 400 - Math.sin(flipU * Math.PI) * 165;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(flipU * TAU);
          S.drawCutoutPaperEdge(ctx, [[-34, -10], [34, -10], [38, 10], [-38, 10]], "#facc15", "#14110d", { paperRim: 2.2 });
          ctx.restore();

          // Chef Brook Trout wearing tall white paper chef toque!
          var tx = 915;
          var ty = 378 + Math.sin(t * 2.5) * 6;
          S.drawBrookTrout(ctx, tx, ty, 1.26, t, false);
          S.drawCutoutPaperEdge(ctx, [[tx - 78, ty - 20], [tx - 88, ty - 76], [tx - 32, ty - 76], [tx - 42, ty - 20]], "#fbfaf5", "#14110d", { paperRim: 2.5 });

          // Mail Snail waiting with white diner plate!
          S.drawCutoutPaperEdge(ctx, [[365, 468], [465, 468], [452, 482], [378, 482]], "#f8fafc", "#14110d", { paperRim: 2 });
          S.drawMailSnail(ctx, 325, 495, 1.22, t, { hasReply: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Fiery Baby Star Hatchery Nest: 3 cosmic coal-shells hatch 5-pointed golden baby stars!
          var BG = getEngine();
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 640, 106, 1.24, t, 640, 435, { beamSpread: 205 });
          drawRiverbedCoalHearth(ctx, S, BG, plates, t, { cx: 640, cy: 492, hidePlume: true, grate: false, glowColor: "#f43f5e" });

          for (var ei = -1; ei <= 1; ei++) {
            var hx = 640 + ei * 145;
            var hy = 462;
            var openA = 0.42 + 0.22 * Math.sin(t * 2.8 + ei);
            ctx.save();
            ctx.translate(hx, hy);
            ctx.save();
            ctx.rotate(-openA);
            S.drawCardboardPuppetPiece(ctx, [[-38, 0], [-28, -44], [0, -24], [0, 12]], { tone: "#57534e", ribs: 2 });
            ctx.restore();
            ctx.save();
            ctx.rotate(openA);
            S.drawCardboardPuppetPiece(ctx, [[38, 0], [28, -44], [0, -24], [0, 12]], { tone: "#78716c", ribs: 2 });
            ctx.restore();
            S.drawSplitPin(ctx, 0, 8, 4.2, { metal: "brass" });
            ctx.restore();

            var rise = ((t * 0.38 + (ei + 1) * 0.28) % 1);
            var sy = BG.lerp(425, 175, rise);
            var sx = hx + Math.sin(t * 2.4 + ei * 1.9) * 24;
            drawStarPoly(ctx, S, sx, sy, 5, 32, 14, t * 2.2 + ei, ei === 0 ? "#fde047" : "#fb923c", "#14110d", 2.5);
          }
        }
      },

      o: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Captain Nemo's Sunken Nautilus Fuel: roaring thermal plume + Captain Turkey tapping brass steam gauge!
          var BG = getEngine();
          var t = resolved.t;
          drawRiverbedCoalHearth(ctx, S, BG, plates, t, { cx: 685, cy: 488, cherryBright: true, heat: 1.45 });
          BG.drawDeterministicParticles(ctx, "bubbles", 685, 360, t, { loop: true, count: 32, spreadX: 165 });

          // Large riveted brass Nautilus steam pressure dial inside left viewport (0 text, pure gauge arcs & needle!)
          ctx.save();
          ctx.translate(335, 395);
          S.drawCutoutPaperEdge(ctx, [[-82, -82], [82, -82], [82, 82], [-82, 82]], "#d97706", "#14110d", { paperRim: 4 });
          ctx.fillStyle = "#fef9c3";
          ctx.beginPath();
          ctx.arc(0, 0, 64, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#16a34a";
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(0, 0, 50, -Math.PI * 0.85, -Math.PI * 0.15);
          ctx.stroke();
          ctx.rotate(0.55 + Math.sin(t * 9) * 0.12);
          S.drawCardboardPuppetPiece(ctx, [[-5, 12], [0, -54], [5, 12]], { tone: "#dc2626" });
          S.drawSplitPin(ctx, 0, 0, 5.5, { metal: "brass" });
          ctx.restore();

          S.drawTurkeyInCorner(ctx, 178, 498, 1.08, t, { dispatch: 0.9 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Cozy Creek Jacuzzi For Tourists: warm bubble curtain + 4 fish in knitted scarves with Brook Trout & Snail!
          var BG = getEngine();
          var t = resolved.t;
          drawRiverbedCoalHearth(ctx, S, BG, plates, t, { cx: 640, cy: 492, cherryBright: true, heat: 1.25 });
          BG.drawDeterministicParticles(ctx, "bubbles", 640, 390, t, { loop: true, count: 36, spreadX: 260, spreadY: 95 });

          var scarfCols = ["#ef4444", "#3b82f6", "#a855f7", "#eab308"];
          for (var fi = 0; fi < 4; fi++) {
            var fx = 465 + fi * 115 + Math.sin(t * 2 + fi) * 10;
            var fy = 335 + (fi % 2) * 34 + Math.cos(t * 2.5 + fi) * 8;
            drawCutoutMinnow(ctx, S, fx, fy, 0, 1.25, Math.sin(t * 5 + fi) * 3, "#cbd5e1");
            // Tiny knitted winter scarf on each spa tourist fish!
            S.drawCutoutPaperEdge(ctx, [[fx + 2, fy - 9], [fx + 12, fy - 9], [fx + 14, fy + 18], [fx + 2, fy + 18]], scarfCols[fi], "#14110d", { paperRim: 1.0, shadow: false });
          }
          S.drawBrookTrout(ctx, 945, 365, 1.22, t, false);
          S.drawMailSnail(ctx, 335, 495, 1.22, t, { hasReply: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Subterranean Magma Saucer Refuel Hose: metallic bendy-pipe slurps orange sparks into blushing pink dome!
          var BG = getEngine();
          var t = resolved.t;
          drawRiverbedCoalHearth(ctx, S, BG, plates, t, { cx: 640, cy: 488, cherryBright: true, hidePlume: true, heat: 1.35 });

          // Segmented bendy-straw refuel pipe from Saucer down into coal bed
          ctx.strokeStyle = "#cbd5e1";
          ctx.lineWidth = 22;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(640, 138);
          ctx.bezierCurveTo(545, 235, 735, 335, 640, 448);
          ctx.stroke();

          // Glowing orange plasma pulses slurping UP the straw!
          for (var p = 0; p < 5; p++) {
            var pu = 1 - ((t * 0.9 + p / 5) % 1);
            var px = 640 + Math.sin(pu * TAU) * 42;
            var py = BG.lerp(138, 448, pu);
            BG.drawLanternHalo(ctx, px, py, 38, { color: "#fb923c", coreColor: "#fef08a", intensity: 1.1, t: t });
          }

          S.drawAlienSaucer(ctx, 640, 114, 1.26, t, false, false, { beam: false });
          // Warm pink blush glow over Saucer dome!
          BG.drawLanternHalo(ctx, 640, 102, 75, { color: "#f472b6", intensity: 0.85, t: t });
        }
      },

      triangle: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Smokey-Bear Underwater Fire Safety Check: Ranger Mail Snail + crossed-out pot sign + relieved Turkey!
          var BG = getEngine();
          var t = resolved.t;
          drawRiverbedCoalHearth(ctx, S, BG, plates, t, { cx: 715, cy: 488, heat: 0.85 });

          // Wooden Ranger Safety Signboard (crossed-out soup pot icon — 0 text!)
          S.drawCardboardPuppetPiece(ctx, [[472, 365], [488, 365], [488, 505], [472, 505]], { tone: "#78350f" });
          S.drawCutoutPaperEdge(ctx, [[395, 255], [565, 255], [565, 375], [395, 375]], "#fef3c7", "#15803d", { paperRim: 3.5 });
          S.drawCardboardPuppetPiece(ctx, [[445, 295], [515, 295], [508, 345], [452, 345]], { tone: "#3f3f46" });
          ctx.strokeStyle = "#dc2626";
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.arc(480, 316, 44, 0, TAU);
          ctx.moveTo(448, 284);
          ctx.lineTo(512, 348);
          ctx.stroke();

          S.drawMailSnail(ctx, 355, 492, 1.28, t, { postcard: true });
          // Ranger hat on Mail Snail
          S.drawCutoutPaperEdge(ctx, [[332, 456], [355, 436], [378, 456]], "#92400e", "#14110d", { paperRim: 1.5 });
          S.drawTurkeyInCorner(ctx, 175, 498, 1.06, t, { dispatch: 0.85 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Underwater S'mores Roast On Twigs: Brook Trout & Mail Snail toasting puffy marshmallows!
          var BG = getEngine();
          var t = resolved.t;
          drawRiverbedCoalHearth(ctx, S, BG, plates, t, { cx: 640, cy: 492, hidePlume: true, heat: 1.1 });

          // Mossy log stools + twin twig skewers holding golden-toasted puffball marshmallows over coals!
          S.drawCardboardPuppetPiece(ctx, [[335, 472], [445, 472], [440, 525], [340, 525]], { tone: "#57534e", ribs: 2 });
          ctx.strokeStyle = "#78350f";
          ctx.lineWidth = 4.5;
          ctx.beginPath();
          ctx.moveTo(435, 445); ctx.lineTo(595, 378);
          ctx.moveTo(845, 405); ctx.lineTo(685, 378);
          ctx.stroke();

          S.drawCutoutPaperEdge(ctx, [[578, 358], [612, 358], [612, 392], [578, 392]], "#fef3c7", "#d97706", { paperRim: 2.5 });
          S.drawCutoutPaperEdge(ctx, [[668, 358], [702, 358], [702, 392], [668, 392]], "#fde68a", "#b45309", { paperRim: 2.5 });

          S.drawMailSnail(ctx, 390, 458, 1.26, t, { hasReply: true });
          S.drawBrookTrout(ctx, 915, 412, 1.24, t, false);
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Solar-Flare Postcard Singed Around Edges lifting into Alien Saucer mail beam!
          var BG = getEngine();
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 640, 108, 1.24, t, 640, 445, { beamSpread: 185 });
          BG.drawTractorRings(ctx, 640, 134, 640, 445, t, { spread: 155, rings: 5 });
          drawRiverbedCoalHearth(ctx, S, BG, plates, t, { cx: 640, cy: 492, hidePlume: true, heat: 1.15 });

          var liftU = (t * 0.42) % 1;
          var py = BG.lerp(425, 175, liftU);
          ctx.save();
          ctx.translate(640 + Math.sin(t * 3) * 18, py);
          ctx.rotate(Math.sin(t * 2.5) * 0.14);
          S.drawTornPaperFlat(ctx, -58, -38, 116, 76, { fill: "#d97706", paperColor: "#451a03", deckle: 6, seed: 26.8 });
          drawStarPoly(ctx, S, 0, 0, 8, 22, 10, t * 2, "#fef08a", "#14110d", 1.5);
          ctx.restore();

          BG.drawDeterministicParticles(ctx, "brass_sparks", 640, py + 28, t, { loop: true, count: 18, seed: 26.9 });
          S.drawMailSnail(ctx, 395, 492, 1.2, t, { hasAlienStamp: true });
        }
      },

      square: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Warm Brass Tongs Toast Bread: retracting probe holds golden buttered toast for delighted Turkey!
          var BG = getEngine();
          var t = resolved.t;
          drawRiverbedCoalHearth(ctx, S, BG, plates, t, { cx: 695, cy: 488, heat: 1.05 });

          var tx = 445 + Math.sin(t * 2.2) * 14;
          var ty = 375 + Math.cos(t * 2.8) * 8;
          drawBrassProbe(ctx, S, BG, 1065, 535, tx + 65, ty, t, { jaw: 0.12, seed: 26.6 });

          // Crisp golden-brown submarine toast cutout + melting yellow butter square!
          ctx.save();
          ctx.translate(tx, ty);
          ctx.rotate(-0.12);
          S.drawCutoutPaperEdge(
            ctx,
            [[-52, -44], [-22, -62], [22, -62], [52, -44], [46, 54], [-46, 54]],
            "#d97706",
            "#78350f",
            { paperRim: 3.5 }
          );
          S.drawCutoutPaperEdge(ctx, [[-18, -16], [18, -16], [18, 18], [-18, 18]], "#fde047", "#14110d", { paperRim: 1.5 });
          ctx.restore();

          S.drawTurkeyInCorner(ctx, 195, 495, 1.12, t, { dispatch: 0.9 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Blacksmith Trout Forging Tiny Horseshoes on silver anvil for Mail Snail!
          var BG = getEngine();
          var t = resolved.t;
          drawRiverbedCoalHearth(ctx, S, BG, plates, t, { cx: 560, cy: 492, hidePlume: true, heat: 1.15 });

          // Silver miniature blacksmith anvil on stone block
          S.drawCardboardPuppetPiece(ctx, [[695, 445], [815, 445], [785, 495], [715, 495]], { tone: "#94a3b8", ribs: 2 });
          // Glowing golden miniature horseshoe on anvil!
          ctx.strokeStyle = "#facc15";
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.arc(752, 434, 18, Math.PI * 0.85, Math.PI * 0.15, false);
          ctx.stroke();

          var strike = Math.abs(Math.sin(t * 7.5));
          if (strike < 0.25) {
            BG.drawDeterministicParticles(ctx, "brass_sparks", 752, 434, t, { loop: true, count: 22, seed: 26.7 });
          }

          // Blacksmith Brook Trout in leather apron swinging hammer!
          S.drawBrookTrout(ctx, 935, 395, 1.25, t, false);
          ctx.save();
          ctx.translate(855, 405);
          ctx.rotate(-0.9 + strike * 0.95);
          S.drawCardboardPuppetPiece(ctx, [[0, -4], [-85, -4], [-85, 4], [0, 4]], { tone: "#78350f" });
          S.drawCardboardPuppetPiece(ctx, [[-96, -22], [-72, -22], [-72, 22], [-96, 22]], { tone: "#475569" });
          ctx.restore();

          S.drawMailSnail(ctx, 375, 492, 1.24, t, { hasReply: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Cracked Geode Releases Plasma Sprites dancing figure-eights around Alien Saucer!
          var BG = getEngine();
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 640, 128, 1.24, t, 640, 455, { beamSpread: 195 });
          drawRiverbedCoalHearth(ctx, S, BG, plates, t, { cx: 640, cy: 492, hidePlume: true, grate: false, glowColor: "#a855f7" });

          // Split-open glowing amethyst coal geode at center
          S.drawCutoutPaperEdge(ctx, [[565, 475], [595, 415], [632, 455], [632, 488]], "#7e22ce", "#14110d", { paperRim: 3 });
          S.drawCutoutPaperEdge(ctx, [[715, 475], [685, 415], [648, 455], [648, 488]], "#9333ea", "#14110d", { paperRim: 3 });

          // 18 neon-orange & cyan geometric plasma sprites spiraling in figure-eights!
          for (var s = 0; s < 18; s++) {
            var a = t * 2.4 + (s / 18) * TAU;
            var sx = 640 + Math.sin(a) * 265;
            var sy = 255 + Math.sin(a * 2) * 115;
            drawStarPoly(ctx, S, sx, sy, 4, 14, 6, a, s % 2 === 0 ? "#fb923c" : "#22d3ee", "#fbfaf5", 1.0);
          }
        }
      }
    }
  };

  // ==========================================================================
  // PORTHOLE #27 · PORT M — Old Sunken Rabbit-Ear TV ("duchamp-optic")
  // Plates: portholes/p27.jpg + assets/atlas-stills/atlas-17.webp
  // ==========================================================================
  function drawP27Backdrop(ctx, W, H, resolved, plates, S) {
    var BG = getEngine();
    var t = resolved.t;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var pxF = S.parallaxX(0.24, t, resolved);
    var pyF = S.parallaxY(0.24, t, resolved);
    var pxM = S.parallaxX(0.52, t, resolved);

    S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 27, t, resolved);

    // Emerald-cyan stage aura from atlas-17.webp (strictly x:0.02..0.52, y:0.02..0.80 — avoids bottom-right "UNI" drum!)
    drawPlateFrac(
      ctx, S, aImg,
      0.02, 0.02, 0.50, 0.78,
      95 + pxF, 34 + pyF, 465, 465,
      [[0.06, 0.08], [0.54, 0.02], [0.95, 0.12], [0.92, 0.92], [0.44, 0.98], [0.04, 0.88]],
      { haloWidth: 4.0, alpha: 0.62 }
    );

    // Duchamp eccentric counter-rotating optical disc on dark workshop slate
    ctx.save();
    ctx.translate(640 + pxF * 0.8, 280 + pyF * 0.8);
    ctx.rotate(t * 0.65);
    for (var ri = 6; ri >= 1; ri--) {
      ctx.strokeStyle = ri % 2 === 0 ? "rgba(251, 250, 245, 0.18)" : "rgba(15, 143, 128, 0.24)";
      ctx.lineWidth = 5.0;
      ctx.beginPath();
      ctx.arc((6 - ri) * 6.5, 0, ri * 42, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    S.drawTornPaperFlat(ctx, 36, 492, W - 72, 128, {
      fill: "#1f2e30",
      paperColor: "#ebe5d5",
      deckle: 6.5,
      seed: 27.4
    });
    drawPlateFrac(
      ctx, S, pImg,
      0.17, 0.34, 0.15, 0.26,
      82 + pxM, 265, 175, 250,
      [[0.08, 0.06], [0.85, 0.04], [0.94, 0.92], [0.06, 0.96]],
      { haloWidth: 4.0 }
    );

    BG.drawWaterCaustics(ctx, W, H, t, { intensity: 0.18, color: "#5eead4" });
    BG.drawDepthFog(ctx, W, H, t, { density: 0.12, color: "#94a3b8" });
  }

  // Reusable Wood-Grain Rabbit-Ear CRT Television Prop (0 text!)
  function drawRabbitEarCRT(ctx, S, plates, t, opts) {
    var cfg = opts || {};
    var pImg = plates.portholeImg;
    var tx = cfg.x != null ? cfg.x : 535;
    var ty = cfg.y != null ? cfg.y : 342;
    var sc = cfg.scale || 1.0;

    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(sc, sc);
    ctx.rotate(cfg.rot != null ? cfg.rot : -0.03);

    // Jointed tinfoil rabbit-ear V-dipole antennas on silver split-pin base
    var antTilt = cfg.antennaBend || 0;
    var antL = -0.66 + antTilt + S.wobble(t, 3.2, 0.07, 0.4);
    var antR = 0.62 + antTilt + S.wobble(t, 3.6, 0.07, 1.9);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    var lx = -6 + Math.sin(antL) * 148, ly = -126 - Math.cos(antL) * 148;
    var rx = 10 + Math.sin(antR) * 156, ry = -126 - Math.cos(antR) * 156;
    ctx.moveTo(-6, -126); ctx.lineTo(lx, ly);
    ctx.moveTo(10, -126); ctx.lineTo(rx, ry);
    ctx.stroke();

    // Tinfoil balls on antenna tips
    var foilR = cfg.bigFoil ? 15 : 8;
    S.drawCutoutPaperEdge(ctx, [[lx - foilR, ly], [lx, ly - foilR], [lx + foilR, ly], [lx, ly + foilR]], "#f1f5f9", "#14110d", { paperRim: 1.5 });
    S.drawCutoutPaperEdge(ctx, [[rx - foilR, ry], [rx, ry - foilR], [rx + foilR, ry], [rx, ry + foilR]], "#f1f5f9", "#14110d", { paperRim: 1.5 });
    S.drawCutoutPaperEdge(ctx, [[-38, -114], [-22, -134], [26, -134], [42, -114]], "#94a3b8", "#14110d", { paperRim: 2.5 });
    S.drawSplitPin(ctx, 2, -124, 4.4, { metal: "silver" });

    // Real sunken wooden CRT cabinet plate from p27.jpg (0 text!)
    drawPlateFrac(
      ctx, S, pImg,
      0.26, 0.29, 0.43, 0.35,
      -205, -118, 410, 286,
      [[0.03, 0.06], [0.88, 0.02], [0.98, 0.09], [0.97, 0.92], [0.12, 0.98], [0.02, 0.88]],
      { haloWidth: 4.8 }
    );

    // Custom CRT Screen Viewport (-132..86, -74..110)
    if (cfg.openDoor !== true) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(-132, -74, 218, 184);
      ctx.clip();
      if (typeof cfg.screenFn === "function") {
        cfg.screenFn(ctx, -23, 18, 218, 184);
      } else {
        // Default: cheerful yellow AlgaeWipe sponge commercial + scanlines!
        ctx.fillStyle = "rgba(204, 251, 241, 0.35)";
        ctx.fillRect(-132, -74, 218, 184);
        var sx = -22 + Math.sin(t * 2.8) * 24;
        var sy = 16 + Math.cos(t * 5.6) * 8;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(Math.sin(t * 2.8) * 0.16);
        S.drawCutoutPaperEdge(ctx, [[-34, -44], [30, -48], [36, 36], [-28, 42]], "#facc15", "#14110d", { paperRim: 2.5 });
        ctx.fillStyle = "#14110d";
        ctx.beginPath();
        ctx.arc(-8, -6, 3.5, 0, TAU);
        ctx.arc(10, -7, 3.5, 0, TAU);
        ctx.fill();
        S.drawCutoutPaperEdge(ctx, [[-56, -18], [-32, -24], [-28, 8], [-52, 12]], "#38bdf8", "#14110d", { paperRim: 1.8 });
        ctx.restore();
      }

      // CRT horizontal scanlines
      if (cfg.staticLevel !== 0) {
        var stA = cfg.staticLevel != null ? cfg.staticLevel : 0.22;
        ctx.fillStyle = "rgba(16, 185, 129, " + stA.toFixed(3) + ")";
        for (var sl = -74; sl < 110; sl += 8) {
          ctx.fillRect(-132, sl + ((t * 40) % 8), 218, 2);
        }
      }
      ctx.restore();
    }

    // Two rotary VHF/UHF knobs on right bezel
    for (var di = 0; di < 2; di++) {
      ctx.save();
      ctx.translate(142, -46 + di * 54);
      ctx.rotate((cfg.knobRot != null && di === 0) ? cfg.knobRot : t * (0.6 - di * 1.1));
      S.drawCardboardPuppetPiece(ctx, [[-18, -18], [18, -18], [18, 18], [-18, 18]], { tone: "#cbd5e1", ribs: 1 });
      S.drawSplitPin(ctx, 0, 0, 4.0, { metal: "brass" });
      ctx.restore();
    }

    ctx.restore();
  }

  var P27_SPEC = {
    drawBackdrop: drawP27Backdrop,

    drawRoot: function (ctx, W, H, resolved, plates, S) {
      var BG = getEngine();
      var t = resolved.t;
      drawRabbitEarCRT(ctx, S, plates, t, { x: 520, y: 342 });
      // Two watching couch-potato trout from p27.jpg!
      drawPlateFrac(
        ctx, S, plates.portholeImg,
        0.46, 0.55, 0.34, 0.23,
        695, 362, 315, 205,
        [[0.05, 0.24], [0.58, 0.04], [0.96, 0.14], [0.95, 0.94], [0.06, 0.95]],
        { haloWidth: 4.4 }
      );
      S.drawTurkeyInCorner(ctx, 132, 508, 0.98, t, { dispatch: 0 });
      drawRootHotspotTargets(ctx, BG, resolved);
    },

    stems: {
      x: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        drawRabbitEarCRT(ctx, S, plates, t, {
          x: 520,
          y: 342,
          staticLevel: 0.35 * (1 - u)
        });
        BG.drawVolumetricBeam(ctx, 210, 585, 500, 355, { color: "#3b82f6", spread: 155, intensity: 1.15, t: t });
        // Degauss focus ring tightening onto CRT screen
        ctx.strokeStyle = "#60a5fa";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(500, 355, BG.lerp(145, 24, u), 0, TAU);
        ctx.stroke();
        S.drawTurkeyInCorner(ctx, 132, 508, 0.98, t, { dispatch: 0.2 });
      },

      o: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        drawRabbitEarCRT(ctx, S, plates, t, {
          x: 520,
          y: 342,
          antennaBend: BG.easeOutBack(u) * 0.78, // 45 degrees!
          screenFn: function (c, cx, cy, sw, sh) {
            // Rainbow channel-surf snow bars!
            var cols = ["#f43f5e", "#facc15", "#34d399", "#38bdf8", "#a855f7"];
            for (var b = 0; b < 5; b++) {
              c.fillStyle = cols[(b + Math.floor(t * 14)) % 5];
              c.fillRect(-132 + b * 44, -74, 44, 184);
            }
          }
        });
        drawCurrentPuffJet(ctx, BG, 985, 165, 535, 165, u, t, { color: "#f87171", bubbles: 22 });
        S.drawTurkeyInCorner(ctx, 132, 508, 0.98, t, { dispatch: 0.15 });
      },

      triangle: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        drawRabbitEarCRT(ctx, S, plates, t, { x: 520, y: 348 });
        // Mail Snail crawls across walnut cabinet top & pastes cream TV-Guide grid card beside VHF knob!
        var sx = BG.lerp(335, 625, BG.easeOutCubic(u));
        BG.drawSnailSilverTrail(ctx, 335, 224, sx, 214, u, t);
        S.drawMailSnail(ctx, sx, 206, 1.18, t, { postcard: true });
        if (u > 0.55) {
          S.drawCutoutPaperEdge(ctx, [[642, 232], [705, 232], [705, 305], [642, 305]], "#fef9c3", "#14110d", { paperRim: 2 });
          ctx.fillStyle = "#0f8f80";
          ctx.fillRect(650, 242, 46, 10);
          ctx.fillStyle = "#14110d";
          ctx.fillRect(650, 260, 46, 4);
          ctx.fillRect(650, 272, 36, 4);
        }
        S.drawTurkeyCutawayBadge(ctx, 126, 502, 0.94, t, { dispatch: 0.8 });
      },

      square: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        var clicks = Math.floor(u * 3.99);
        drawRabbitEarCRT(ctx, S, plates, t, {
          x: 520,
          y: 342,
          knobRot: clicks * 0.65
        });
        drawBrassProbe(ctx, S, BG, 1085, 520, 662, 296, t, {
          u: u,
          jaw: 0.14,
          seed: 27.4
        });
        S.drawTurkeyInCorner(ctx, 132, 508, 0.98, t, { dispatch: 0.2 });
      }
    },

    outcomes: {
      x: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Urgent Surface Rescue News Bulletin: Anchor Trout at news desk with Turkey Sub sketch!
          var BG = getEngine();
          var t = resolved.t;
          BG.drawVolumetricBeam(ctx, 210, 585, 525, 345, { color: "#60a5fa", spread: 165, intensity: 0.9, t: t });
          drawRabbitEarCRT(ctx, S, plates, t, {
            x: 545,
            y: 342,
            scale: 1.06,
            staticLevel: 0,
            screenFn: function (c) {
              c.fillStyle = "#1e3a8a";
              c.fillRect(-132, -74, 218, 184);
              // Picture box of our golden Submarine in upper-left corner!
              c.fillStyle = "#fde047";
              c.strokeStyle = "#14110d";
              c.lineWidth = 2;
              c.fillRect(-118, -58, 72, 48);
              c.strokeRect(-118, -58, 72, 48);
              c.fillStyle = "#d97706";
              c.beginPath();
              c.ellipse(-82, -32, 24, 11, 0, 0, TAU);
              c.fill();
              // Anchor Trout behind crimson news desk!
              S.drawBrookTrout(c, 18, 22, 0.85, t, false);
              c.fillStyle = "#dc2626";
              c.fillRect(-132, 52, 218, 58);
            }
          });
          S.drawTurkeyInCorner(ctx, 178, 495 + Math.abs(Math.sin(t * 8)) * -18, 1.12, t, { dispatch: 1.0 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Live Picture-In-Picture Porthole Cam: infinite nested Droste TVs + Brook Trout photobombing!
          var t = resolved.t;
          // Real Brook Trout & Mail Snail photobombing right behind the rabbit ears!
          S.drawBrookTrout(ctx, 645, 168 + Math.sin(t * 3.5) * 10, 1.18, t, false, { tilt: 0.12 });
          S.drawMailSnail(ctx, 435, 195, 1.14, t, { hasReply: true });

          drawRabbitEarCRT(ctx, S, plates, t, {
            x: 535,
            y: 358,
            staticLevel: 0.08,
            screenFn: function (c) {
              // 5 nested Nam-June-Paik Droste picture-in-picture frames!
              for (var d = 0; d < 5; d++) {
                var sc = Math.pow(0.66, d);
                c.save();
                c.translate(-23, 18);
                c.scale(sc, sc);
                c.fillStyle = d % 2 === 0 ? "#0f766e" : "#1e293b";
                c.strokeStyle = "#fde047";
                c.lineWidth = 4;
                c.fillRect(-105, -88, 210, 176);
                c.strokeRect(-105, -88, 210, 176);
                S.drawBrookTrout(c, 22, -24, 0.55, t, false);
                c.restore();
              }
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Hypnotic Alien Brainwashing Swirl Tube: cosmic operator + hypnosis spirals + square-swimming minnows!
          var t = resolved.t;
          // Blue cosmic operator from atlas-17.webp (strictly x:0.50..0.90, y:0.16..0.78 — stops cleanly above "UNI"!)
          drawPlateFrac(
            ctx, S, plates.atlasImg,
            0.50, 0.16, 0.40, 0.62,
            88, 145, 235, 295,
            [[0.12, 0.04], [0.84, 0.04], [0.96, 0.52], [0.88, 0.96], [0.08, 0.94]],
            { haloWidth: 4.2 }
          );
          S.drawAlienSaucer(ctx, 520, 102, 1.2, t, 520, 325, { beamSpread: 155 });

          drawRabbitEarCRT(ctx, S, plates, t, {
            x: 495,
            y: 355,
            scale: 0.94,
            screenFn: function (c) {
              c.fillStyle = "#2e1065";
              c.fillRect(-132, -74, 218, 184);
              for (var r = 1; r <= 5; r++) {
                c.strokeStyle = r % 2 === 0 ? "#e879f9" : "#a3e635";
                c.lineWidth = 5;
                c.beginPath();
                c.arc(-23, 18, r * 18, t * 6 + r, t * 6 + r + Math.PI * 1.5);
                c.stroke();
              }
            }
          });

          // Projecting magenta-lime hypnosis rings + 8 minnows marching along a rigid square perimeter!
          for (var hi = 0; hi < 4; hi++) {
            var hu = ((t * 0.65 + hi / 4) % 1);
            ctx.strokeStyle = hi % 2 === 0 ? "#e879f9" : "#a3e635";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.ellipse(S.lerp(620, 945, hu), 355, 22, S.lerp(36, 98, hu), 0, 0, TAU);
            ctx.stroke();
          }
          var sqCorners = [[835, 255], [1055, 255], [1055, 455], [835, 455]];
          for (var m = 0; m < 8; m++) {
            var prog = ((t * 0.5 + m / 8) % 1) * 4;
            var seg = Math.floor(prog) % 4;
            var su = prog - Math.floor(prog);
            var pA = sqCorners[seg], pB = sqCorners[(seg + 1) % 4];
            drawCutoutMinnow(ctx, S, S.lerp(pA[0], pB[0], su), S.lerp(pA[1], pB[1], su), seg * Math.PI * 0.5, 0.95, 0, "#a3e635");
          }
        }
      },

      o: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Thanksgiving Parade Broadcast Interception: B&W giant Turkey balloon on CRT + proud puffed Turkey!
          var t = resolved.t;
          drawRabbitEarCRT(ctx, S, plates, t, {
            x: 565,
            y: 342,
            antennaBend: 0.65,
            staticLevel: 0.14,
            screenFn: function (c) {
              c.fillStyle = "#cbd5e1";
              c.fillRect(-132, -74, 218, 184);
              // Monochrome skyscraper silhouettes
              c.fillStyle = "#475569";
              c.fillRect(-125, 25, 42, 85);
              c.fillRect(-72, 5, 48, 105);
              c.fillRect(28, 18, 52, 92);
              // Giant floating monochrome inflatable Turkey parade balloon + tether strings!
              var by = -18 + Math.sin(t * 2.5) * 8;
              c.strokeStyle = "#1e293b";
              c.lineWidth = 1.5;
              c.beginPath();
              c.moveTo(-35, by + 28); c.lineTo(-20, 105);
              c.moveTo(5, by + 28);   c.lineTo(-5, 105);
              c.stroke();
              S.drawCutoutPaperEdge(c, [[-55, by], [-25, by - 36], [15, by - 32], [32, by + 8], [-15, by + 28]], "#f8fafc", "#0f172a", { paperRim: 2 });
            }
          });
          S.drawTurkeyInCorner(ctx, 185, 492, 1.24, t, { dispatch: 0.85 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Creek Cable Repairman Trout Arrives: sunken van + hard-hat Trout crimping giant tinfoil onto rabbit ears!
          var t = resolved.t;
          // Boxy cardboard cable repair van parked behind left!
          S.drawCardboardPuppetPiece(ctx, [[145, 255], [395, 255], [425, 345], [425, 465], [145, 465]], {
            tone: "#d6d3d1",
            ribs: 3,
            pins: [[185, 465], [375, 465]]
          });
          S.drawCutoutPaperEdge(ctx, [[152, 355], [418, 355], [418, 382], [152, 382]], "#0f8f80", "#14110d", { paperRim: 1.5 });

          drawRabbitEarCRT(ctx, S, plates, t, { x: 585, y: 362, scale: 0.92, bigFoil: true, staticLevel: 0.04 });

          // Repairman Brook Trout in yellow hard-hat & toolbelt reaching rabbit ears!
          var rx = 865;
          var ry = 265 + Math.sin(t * 2.4) * 8;
          S.drawBrookTrout(ctx, rx, ry, 1.24, t, false);
          S.drawCutoutPaperEdge(ctx, [[rx - 82, ry - 22], [rx - 66, ry - 48], [rx - 28, ry - 46], [rx - 18, ry - 20]], "#facc15", "#14110d", { paperRim: 2 });
          // Red metal toolbox beside Mail Snail
          S.drawCutoutPaperEdge(ctx, [[835, 465], [925, 465], [925, 512], [835, 512]], "#dc2626", "#14110d", { paperRim: 2 });
          S.drawMailSnail(ctx, 985, 498, 1.2, t, { hasReply: true, flip: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Alpha-Centauri Miracle Space Sponge Ad: 3-eyed alien pitchman on CRT + Saucer dropping free sponge samples!
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 845, 106, 1.2, t, 845, 440, { beamSpread: 165 });

          drawRabbitEarCRT(ctx, S, plates, t, {
            x: 455,
            y: 352,
            antennaBend: -0.55,
            screenFn: function (c) {
              c.fillStyle = "#1e1b4b";
              c.fillRect(-132, -74, 218, 184);
              // Purple nebula wiped clean in half by glowing sponge!
              c.fillStyle = "#c084fc";
              c.beginPath();
              c.arc(-72, -18, 42, 0, TAU);
              c.fill();
              // 3-eyed green alien pitchman in plaid jacket!
              S.drawCardboardPuppetPiece(c, [[-12, 18], [56, 18], [64, 108], [-22, 108]], { tone: "#eab308", ribs: 3 });
              S.drawCardboardPuppetPiece(c, [[-6, 18], [-8, -22], [22, -34], [52, -22], [48, 18]], { tone: "#4ade80" });
              for (var e = -1; e <= 1; e++) {
                c.fillStyle = "#fbfaf5";
                c.beginPath();
                c.arc(22 + e * 13, -10, 5, 0, TAU);
                c.fill();
              }
              S.drawCutoutPaperEdge(c, [[-56, -8], [-24, -12], [-20, 28], [-52, 32]], "#fde047", "#14110d", { paperRim: 2 });
            }
          });

          // 3 free yellow sample sponges parachuting down from the Alien Saucer!
          for (var sp = 0; sp < 3; sp++) {
            var su = ((t * 0.38 + sp / 3) % 1);
            var sx = 765 + sp * 82 + Math.sin(t * 2.5 + sp) * 14;
            var sy = S.lerp(148, 495, su);
            S.drawCutoutPaperEdge(ctx, [[sx - 28, sy - 28], [sx, sy - 46], [sx + 28, sy - 28]], "#fbfaf5", "#14110d", { paperRim: 1.5 });
            S.drawCutoutPaperEdge(ctx, [[sx - 16, sy - 6], [sx + 16, sy - 6], [sx + 16, sy + 22], [sx - 16, sy + 22]], "#facc15", "#14110d", { paperRim: 1.8 });
          }
        }
      },

      triangle: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Overdue Cable-Bill Disconnect Screen: SMPTE color bars + clam coin icon + broke Turkey empty pockets!
          var t = resolved.t;
          drawRabbitEarCRT(ctx, S, plates, t, {
            x: 575,
            y: 342,
            staticLevel: 0.05,
            screenFn: function (c) {
              var smpte = ["#f8fafc", "#facc15", "#22d3ee", "#4ade80", "#e879f9", "#ef4444", "#2563eb"];
              for (var b = 0; b < 7; b++) {
                c.fillStyle = smpte[b];
                c.fillRect(-132 + b * 32, -74, 32, 184);
              }
              // Scalloped clam-shell coin slot icon card at center (0 text!)
              S.drawCutoutPaperEdge(c, [[-68, -28], [26, -28], [26, 52], [-68, 52]], "#0f172a", "#fbfaf5", { paperRim: 2 });
              S.drawCutoutPaperEdge(c, [[-44, 24], [-36, -6], [-6, -6], [2, 24]], "#fde047", "#14110d", { paperRim: 1.5 });
            }
          });
          S.drawMailSnail(ctx, 645, 206, 1.18, t, { postcard: true });

          // Turkey turning two empty white cloth pockets inside out!
          S.drawTurkeyInCorner(ctx, 185, 498, 1.08, t, { dispatch: 0.7 });
          S.drawCutoutPaperEdge(ctx, [[122, 505], [94, 536], [126, 542]], "#f8fafc", "#14110d", { paperRim: 1.5 });
          S.drawCutoutPaperEdge(ctx, [[228, 505], [258, 536], [224, 542]], "#f8fafc", "#14110d", { paperRim: 1.5 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Saturday Morning Snail Cartoon Hour: Super Shell Rangers on CRT + Trout & minnows with kelp-popcorn!
          var t = resolved.t;
          drawRabbitEarCRT(ctx, S, plates, t, {
            x: 465,
            y: 342,
            staticLevel: 0.05,
            screenFn: function (c) {
              c.fillStyle = "#38bdf8";
              c.fillRect(-132, -74, 218, 184);
              // Hero snail zooming with crimson cape!
              var hx = -25 + Math.sin(t * 6) * 32;
              S.drawCutoutPaperEdge(c, [[hx - 58, -12], [hx - 12, -4], [hx - 54, 18]], "#dc2626", "#14110d", { paperRim: 1.5 });
              S.drawMailSnail(c, hx, 12, 1.15, t * 2, { postcard: false, trail: false });
            }
          });

          // Pebble beanbags + red-and-white striped bucket of green kelp-popcorn!
          S.drawCutoutPaperEdge(ctx, [[735, 445], [795, 445], [785, 512], [745, 512]], "#ef4444", "#14110d", { paperRim: 2.2 });
          for (var p = 0; p < 5; p++) {
            ctx.fillStyle = "#86efac";
            ctx.beginPath();
            ctx.arc(746 + p * 10, 440 - (p % 2) * 6, 8, 0, TAU);
            ctx.fill();
          }
          S.drawBrookTrout(ctx, 905, 435, 1.2, t, false);
          S.drawMailSnail(ctx, 685, 498, 1.2, t, { hasReply: true });
          for (var m = 0; m < 4; m++) {
            drawCutoutMinnow(ctx, S, 835 + (m % 2) * 85, 345 + Math.floor(m / 2) * 42, Math.PI, 0.92, Math.sin(t * 7 + m) * 4, "#e2e8f0");
          }
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // First-Contact Broadcast Beamed To Stars: green rings climb rabbit ears to Saucer + lilypad drive-in!
          var BG = getEngine();
          var t = resolved.t;
          drawRabbitEarCRT(ctx, S, plates, t, { x: 465, y: 392, scale: 0.86 });
          S.drawMailSnail(ctx, 472, 275, 1.14, t, { hasAlienStamp: true });

          // Glowing green signal rings climbing from antenna to Alien Saucer
          BG.drawTractorRings(ctx, 475, 195, 665, 110, t, { spread: 95, rings: 5 });
          S.drawAlienSaucer(ctx, 665, 102, 1.22, t, 965, 185, { beamSpread: 155 });

          // Underside creek lilypad serving as giant floating drive-in movie screen!
          S.drawCutoutPaperEdge(ctx, [[825, 118], [1115, 118], [1135, 252], [805, 252]], "#166534", "#14110d", { paperRim: 3.5 });
          S.drawCutoutPaperEdge(ctx, [[850, 138], [1090, 138], [1090, 234], [850, 234]], "#fef9c3", "#14110d", { paperRim: 2 });
          drawStarPoly(ctx, S, 970, 186, 5, 28, 12, t * 2, "#f43f5e", "#14110d", 1.5);
        }
      },

      square: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Submarine Periscope Rear-View Backup Cam: green sonar grid + spinning stern propeller on CRT!
          var BG = getEngine();
          var t = resolved.t;
          drawRabbitEarCRT(ctx, S, plates, t, {
            x: 555,
            y: 342,
            knobRot: 1.8,
            staticLevel: 0.12,
            screenFn: function (c) {
              c.fillStyle = "#064e3b";
              c.fillRect(-132, -74, 218, 184);
              // Spinning brass submarine propeller on backup cam!
              c.save();
              c.translate(-23, 8);
              c.rotate(t * 11);
              for (var b = 0; b < 3; b++) {
                c.rotate(TAU / 3);
                c.fillStyle = "#eab308";
                c.fillRect(-8, -46, 16, 46);
              }
              c.restore();
              // Green / Yellow / Red backup camera trapezoid guide lines (0 text!)
              c.strokeStyle = "#4ade80";
              c.lineWidth = 3;
              c.strokeRect(-98, 42, 150, 52);
              c.strokeStyle = "#facc15";
              c.strokeRect(-78, 58, 110, 36);
            }
          });
          drawBrassProbe(ctx, S, BG, 1085, 525, 695, 296, t, { jaw: 0.12, seed: 27.6 });
          S.drawTurkeyInCorner(ctx, 178, 498, 1.06, t, { dispatch: 0.8 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Pop-Out Sponge Salesman Handshake: hinged CRT glass swings open + Brook Trout offers 3 yellow sponges!
          var t = resolved.t;
          drawRabbitEarCRT(ctx, S, plates, t, { x: 485, y: 348, openDoor: true });

          // Open dark cabinet interior + swung-open glass frame door on left!
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(352, 272, 218, 184);
          S.drawCardboardPuppetPiece(ctx, [[255, 258], [352, 272], [352, 456], [255, 472]], {
            tone: "#94a3b8",
            pins: [[350, 285], [350, 442]]
          });

          // Pitchman Brook Trout popping halfway out of TV in straw boater hat offering 3 neon yellow sponges!
          var px = 565 + Math.sin(t * 3.2) * 18;
          S.drawBrookTrout(ctx, px, 355, 1.22, t, true); // facing right out of screen!
          S.drawCutoutPaperEdge(ctx, [[px + 28, 325], [px + 86, 325], [px + 78, 306], [px + 36, 306]], "#fde047", "#dc2626", { paperRim: 2 });

          for (var sp = 0; sp < 3; sp++) {
            var sy = 315 + sp * 38;
            S.drawCutoutPaperEdge(ctx, [[675, sy], [715, sy - 4], [718, sy + 24], [678, sy + 26]], "#facc15", "#14110d", { paperRim: 2 });
          }
          S.drawMailSnail(ctx, 825, 488, 1.24, t, { hasReply: true, flip: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Poltergeist Portal Pulls Toys Upstairs: rainbow scanline ribbon + surfing yellow rubber ducks!
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 835, 108, 1.24, t, 465, 345, { beam: false });
          drawRabbitEarCRT(ctx, S, plates, t, { x: 445, y: 368, scale: 0.94, openDoor: true });

          // Curved zero-G rainbow scanline ribbon pouring from CRT screen into Saucer!
          var rbCols = ["#ef4444", "#f97316", "#fde047", "#4ade80", "#38bdf8", "#a855f7"];
          for (var r = 0; r < rbCols.length; r++) {
            ctx.strokeStyle = rbCols[r];
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.moveTo(445, 340 + r * 10);
            ctx.bezierCurveTo(615, 345 + r * 8, 695, 225 + r * 6, 835, 132 + r * 4);
            ctx.stroke();
          }

          // 3 yellow paper rubber-ducks surfing happily up the rainbow light wave!
          for (var d = 0; d < 3; d++) {
            var du = ((t * 0.42 + d / 3) % 1);
            var dx = S.lerp(455, 825, du);
            var dy = S.lerp(365, 138, Math.pow(du, 0.85)) - Math.sin(du * Math.PI) * 28;
            S.drawCutoutPaperEdge(ctx, [[dx - 22, dy + 8], [dx - 16, dy - 10], [dx + 6, dy - 8], [dx + 14, dy - 24], [dx + 24, dy - 20], [dx + 22, dy + 8]], "#facc15", "#14110d", { paperRim: 2 });
            S.drawCutoutPaperEdge(ctx, [[dx + 22, dy - 22], [dx + 34, dy - 18], [dx + 22, dy - 14]], "#f97316", "#14110d", { paperRim: 1 });
          }
        }
      }
    }
  };

  // ==========================================================================
  // PORTHOLE #28 · STBD M — Silver Minnows Swimming in a Wave ("daumier-litho")
  // Plates: portholes/p28.jpg + assets/atlas-stills/atlas-03.webp
  // ==========================================================================
  function drawP28Backdrop(ctx, W, H, resolved, plates, S) {
    var BG = getEngine();
    var t = resolved.t;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var pxF = S.parallaxX(0.24, t, resolved);
    var pxM = S.parallaxX(0.52, t, resolved);

    S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 28, t, resolved, { bandTop: 124, bandBot: 572 });

    // Etched sea-wave base from atlas-03.webp (strictly x:0.02..0.96, y:0.78..0.98 — avoids upper-left "COPYRIGHTED"!)
    drawPlateFrac(
      ctx, S, aImg,
      0.02, 0.78, 0.94, 0.19,
      78 + pxF, 472, 1120, 96,
      [[0.02, 0.14], [0.50, 0.04], [0.98, 0.12], [0.99, 0.92], [0.50, 0.97], [0.01, 0.90]],
      { filter: "litho", haloWidth: 3.5, alpha: 0.78 }
    );
    // Mossy stone bridge arch from p28.jpg (0 text!)
    drawPlateFrac(
      ctx, S, pImg,
      0.18, 0.16, 0.64, 0.28,
      245 + pxM * 0.6, 104, 790, 212,
      [[0.02, 0.88], [0.08, 0.34], [0.28, 0.05], [0.50, 0.02], [0.72, 0.05], [0.92, 0.34], [0.98, 0.88], [0.84, 0.94], [0.74, 0.48], [0.50, 0.34], [0.26, 0.48], [0.16, 0.94]],
      { filter: "litho", haloWidth: 4.8 }
    );

    BG.drawWaterCaustics(ctx, W, H, t, { intensity: 0.14, color: "#f8fafc" });
  }

  function sampleMinnowSCurve(S, u, t) {
    var y = S.lerp(536, 198, u);
    var sCurve = Math.sin(u * Math.PI * 1.85 - 0.35) * 215 * (1 - u * 0.35);
    var breathe = Math.sin(t * 2.4 - u * 4.2) * 16;
    var x = 615 + sCurve + breathe + (u > 0.72 ? (u - 0.72) * 410 : 0);
    return { x: x, y: y };
  }

  function drawMinnowSchoolWave(ctx, S, t, count, curveFn, opts) {
    var cfg = opts || {};
    var n = count || 36;
    for (var i = 0; i < n; i++) {
      var u = i / Math.max(1, n - 1);
      var lane = ((i % 5) - 2) * (1 - u * 0.7) * (cfg.spread != null ? cfg.spread : 16);
      var p0 = curveFn(u, t);
      var p1 = curveFn(Math.min(1, u + 0.025), t);
      var ang = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      var nx = -Math.sin(ang) * lane;
      var ny = Math.cos(ang) * lane;
      var flash = (typeof cfg.dazzleU === "number" && Math.abs(u - cfg.dazzleU) < 0.14);
      drawCutoutMinnow(
        ctx,
        S,
        p0.x + nx,
        p0.y + ny,
        ang,
        0.84 + (1 - Math.abs((i % 5) - 2) * 0.12) * 0.28,
        Math.sin(t * 9.5 - i * 0.55) * 5.5,
        flash ? "#fef08a" : (cfg.fill || "#fbfaf7"),
        cfg
      );
      if (flash) {
        drawStarPoly(ctx, S, p0.x + nx + 8, p0.y + ny, 4, 15, 5, t * 4, "#ffffff", "#2563eb", 0);
      }
    }
  }

  var P28_SPEC = {
    drawBackdrop: drawP28Backdrop,

    drawRoot: function (ctx, W, H, resolved, plates, S) {
      var BG = getEngine();
      var t = resolved.t;
      drawMinnowSchoolWave(ctx, S, t, 38, function (u, tm) { return sampleMinnowSCurve(S, u, tm); });
      S.drawTurkeyInCorner(ctx, 134, 498, 0.98, t, { dispatch: 0 });
      drawRootHotspotTargets(ctx, BG, resolved);
    },

    stems: {
      x: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        var focusPt = sampleMinnowSCurve(S, u, t);
        drawMinnowSchoolWave(ctx, S, t, 40, function (s, tm) { return sampleMinnowSCurve(S, s, tm); }, {
          dazzleU: u
        });
        BG.drawVolumetricBeam(ctx, 210, 565, focusPt.x, focusPt.y, {
          color: "#60a5fa",
          coreColor: "#ffffff",
          spread: 135,
          intensity: 1.2,
          t: t
        });
        S.drawTurkeyInCorner(ctx, 134, 498, 0.98, t, { dispatch: 0.2 });
      },

      o: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        // Vertical roller-coaster loop-de-loop!
        drawMinnowSchoolWave(ctx, S, t, 40, function (s, tm) {
          var loopA = s * TAU * 1.35 - Math.PI * 0.5;
          var rad = 145 * BG.easeOutBack(u);
          var cx = BG.lerp(360, 880, s);
          return {
            x: BG.lerp(cx, 640 + Math.cos(loopA) * rad, Math.sin(s * Math.PI)),
            y: BG.lerp(420 - s * 120, 345 + Math.sin(loopA) * rad, Math.sin(s * Math.PI))
          };
        }, { spread: 10 });
        drawCurrentPuffJet(ctx, BG, 1045, 285, 650, 345, u, t, { color: "#f87171", bubbles: 24 });
        S.drawTurkeyInCorner(ctx, 134, 498, 0.98, t, { dispatch: 0.15 });
      },

      triangle: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        drawMinnowSchoolWave(ctx, S, t, 36, function (s, tm) { return sampleMinnowSCurve(S, s, tm); });
        var lead = sampleMinnowSCurve(S, 0.96, t);
        var sx = BG.lerp(320, lead.x + 12, BG.easeOutCubic(u));
        var sy = BG.lerp(510, lead.y - 12, BG.easeOutCubic(u));
        BG.drawSnailSilverTrail(ctx, 320, 515, sx, sy + 8, u, t);
        S.drawMailSnail(ctx, sx, sy, 1.15, t, { postcard: false });
        // Checkered green parade flag waved by Mail Snail on lead minnow's nose!
        S.drawCardboardPuppetPiece(ctx, [[sx + 16, sy - 6], [sx + 20, sy - 58], [sx + 24, sy - 58], [sx + 20, sy - 6]], { tone: "#eab308" });
        S.drawCutoutPaperEdge(ctx, [[sx + 22, sy - 58], [sx + 68, sy - 46], [sx + 22, sy - 30]], "#10b981", "#14110d", { paperRim: 1.8 });
        S.drawTurkeyCutawayBadge(ctx, 128, 498, 0.94, t, { dispatch: 0.8 });
      },

      square: function (ctx, W, H, resolved, plates, S) {
        var BG = getEngine();
        var t = resolved.t;
        var u = resolved.stemU;
        // Minnow ribbon threads cleanly through brass O-ring hoop at (705, 345)!
        drawMinnowSchoolWave(ctx, S, t, 38, function (s, tm) {
          return {
            x: BG.lerp(280, 1020, s),
            y: 345 + Math.sin((s - 0.58) * TAU + tm * 2) * 85 * Math.abs(s - 0.58)
          };
        }, { spread: 8 });
        drawBrassProbe(ctx, S, BG, 1065, 535, 645, 345, t, {
          u: u,
          hoop: true,
          hoopR: 56,
          seed: 28.4
        });
        S.drawTurkeyInCorner(ctx, 134, 498, 0.98, t, { dispatch: 0.2 });
      }
    },

    outcomes: {
      x: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Glowing Creek Highway Exit Arrow: reflective emerald gantry sign + 40 minnows locked into blinking chevron!
          var BG = getEngine();
          var t = resolved.t;
          BG.drawVolumetricBeam(ctx, 210, 565, 665, 295, { color: "#60a5fa", spread: 195, intensity: 0.95, t: t });

          // Overhead highway gantry board (shield + blinking bulb chevron — 0 text!)
          var gx = 665, gy = 278;
          S.drawCardboardPuppetPiece(ctx, [[gx - 265, gy - 12], [gx - 248, gy - 12], [gx - 248, 560], [gx - 265, 560]], { tone: "#94a3b8" });
          S.drawCardboardPuppetPiece(ctx, [[gx + 248, gy - 12], [gx + 265, gy - 12], [gx + 265, 560], [gx + 248, 560]], { tone: "#94a3b8" });
          S.drawCutoutPaperEdge(ctx, [[gx - 230, gy - 82], [gx + 230, gy - 82], [gx + 230, gy + 74], [gx - 230, gy + 74]], "#0f8f80", "#14110d", { paperRim: 5 });

          // 28 lit silver minnows locked into a giant upward-right blinking EXIT chevron!
          var flash = Math.floor(t * 6) % 2 === 0;
          for (var i = 0; i < 16; i++) {
            var u = i / 15;
            drawCutoutMinnow(ctx, S, S.lerp(gx - 155, gx + 125, u), S.lerp(gy + 36, gy - 28, u), -0.22, 0.95, 0, flash ? "#fde047" : "#f8fafc");
          }
          for (var j = 0; j < 10; j++) {
            var wing = j < 5 ? -1 : 1;
            var wu = (j % 5) / 4;
            drawCutoutMinnow(ctx, S, gx + 145 - wu * 68, gy - 32 + wing * wu * 52, -0.22, 0.95, 0, "#fde047");
          }

          // Navigator Turkey holding unfolded creek road map!
          S.drawTurkeyInCorner(ctx, 175, 495, 1.08, t, { dispatch: 0.85 });
          S.drawCutoutPaperEdge(ctx, [[235, 455], [335, 442], [342, 522], [242, 532]], "#fef3c7", "#14110d", { paperRim: 2 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Flashy Holiday Creek Parade Leader: Méliès cheering crew + Drum-Major Brook Trout + plumed marching minnows!
          var t = resolved.t;
          // Méliès submarine crew from atlas-03.webp (strictly x:0.32..0.85, y:0.28..0.74 — zero "COPYRIGHTED"!)
          drawPlateFrac(
            ctx, S, plates.atlasImg,
            0.32, 0.28, 0.53, 0.46,
            155, 220, 345, 245,
            [[0.05, 0.08], [0.92, 0.04], [0.96, 0.94], [0.04, 0.95]],
            { filter: "litho", haloWidth: 4.2 }
          );

          for (var mi = 0; mi < 18; mi++) {
            var col = mi % 6, row = Math.floor(mi / 6);
            var mx = 365 + col * 68 + Math.sin(t * 4 + row) * 8;
            var my = 398 + row * 48 - Math.abs(Math.sin(t * 7.5 + col * 0.6)) * 14;
            drawCutoutMinnow(ctx, S, mx, my, 0, 1.0, Math.sin(t * 10 + mi) * 4, "#fbfaf7", { plume: "#dc2626" });
          }

          var dmX = 875, dmY = 368 - Math.abs(Math.sin(t * 7.5)) * 16;
          S.drawBrookTrout(ctx, dmX, dmY, 1.32, t, true);
          S.drawCutoutPaperEdge(ctx, [[dmX + 38, dmY - 22], [dmX + 44, dmY - 68], [dmX + 82, dmY - 64], [dmX + 78, dmY - 18]], "#dc2626", "#14110d", { paperRim: 2.5 });
          // Spinning cattail baton overhead!
          ctx.save();
          ctx.translate(dmX + 108, dmY - 108 - Math.abs(Math.sin(t * 3.8)) * 52);
          ctx.rotate(t * 11.5);
          S.drawCutoutPaperEdge(ctx, [[-48, -4], [48, -4], [48, 4], [-48, 4]], "#facc15", "#14110d", { paperRim: 2 });
          ctx.restore();

          S.drawMailSnail(ctx, 1045, 504, 1.2, t, { hasReply: true, flip: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Liquid-Mercury Nanobot Swarm Sculpture: 40 foil fish morph into spinning chrome 3D Saucer model!
          var BG = getEngine();
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 640, 108, 1.22, t, 640, 365, { beamSpread: 215 });
          BG.drawTractorRings(ctx, 640, 134, 640, 365, t, { spread: 185, rings: 5 });

          var cx = 640, cy = 372;
          // Rim ring (24 chrome minnows) + Dome ring (16 chrome minnows) spinning in 3D!
          for (var i = 0; i < 24; i++) {
            var a = (i / 24) * TAU + t * 1.8;
            var rx = cx + Math.cos(a) * 215;
            var ry = cy + Math.sin(a) * 52;
            drawCutoutMinnow(ctx, S, rx, ry, a + Math.PI * 0.5, 0.92, 0, i % 2 === 0 ? "#e2e8f0" : "#94a3b8");
          }
          for (var d = 0; d < 14; d++) {
            var da = (d / 14) * TAU - t * 2.2;
            var dx = cx + Math.cos(da) * 98;
            var dy = cy - 54 + Math.sin(da) * 26;
            drawCutoutMinnow(ctx, S, dx, dy, da - Math.PI * 0.5, 0.85, 0, "#bae6fd");
          }
        }
      },

      o: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Living Silver Lasso Wraps Bow: 3 whirling silver lasso loops + Cowboy-Hat Turkey!
          var t = resolved.t;
          for (var ring = 0; ring < 3; ring++) {
            var count = 12;
            var rx = 185 + ring * 72;
            var ry = 95 + ring * 38;
            for (var i = 0; i < count; i++) {
              var a = (i / count) * TAU + t * (3.2 - ring * 0.5);
              var px = 640 + Math.cos(a) * rx;
              var py = 355 + Math.sin(a) * ry;
              drawCutoutMinnow(ctx, S, px, py, a + Math.PI * 0.5, 0.92, Math.sin(t * 12 + i) * 5, "#f8fafc");
            }
          }
          S.drawTurkeyInCorner(ctx, 185, 498, 1.08, t, { dispatch: 0.8 });
          // Wide-brim brown cardboard cowboy hat on Turkey!
          S.drawCutoutPaperEdge(ctx, [[135, 458], [238, 458], [212, 446], [198, 422], [172, 422], [158, 446]], "#92400e", "#14110d", { paperRim: 2 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Double-Dutch Jump-Rope For Brook Trout + counting Mail Snail!
          var t = resolved.t;
          for (var rope = 0; rope < 2; rope++) {
            var phase = t * 5.2 + rope * Math.PI;
            var arcH = Math.sin(phase) * 165;
            for (var i = 0; i < 18; i++) {
              var u = i / 17;
              var rx = S.lerp(285, 995, u);
              var ry = 385 + Math.sin(u * Math.PI) * arcH;
              drawCutoutMinnow(ctx, S, rx, ry, rope === 0 ? 0 : Math.PI, 0.88, Math.sin(t * 10 + i) * 4, rope === 0 ? "#f8fafc" : "#bae6fd");
            }
          }
          var hopY = 365 - Math.abs(Math.sin(t * 5.2)) * 68;
          S.drawBrookTrout(ctx, 640, hopY, 1.28, t, false);
          S.drawMailSnail(ctx, 255, 498, 1.22, t, { hasReply: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Living Starlane Roller-Coaster Track: toy-sized Alien Saucer banks loop-de-loops along silver track!
          var BG = getEngine();
          var t = resolved.t;
          function coasterPt(u) {
            var a = u * TAU;
            return {
              x: 640 + Math.sin(a) * 375,
              y: 355 + Math.sin(a * 2) * 145
            };
          }
          drawMinnowSchoolWave(ctx, S, t, 42, function (u) { return coasterPt(u); }, { spread: 6, fill: "#e0f2fe" });

          var su = (t * 0.36) % 1;
          var p0 = coasterPt(su);
          S.drawAlienSaucer(ctx, p0.x, p0.y - 18, 0.68, t * 2, false, false, { beam: false });
          BG.drawDeterministicParticles(ctx, "brass_sparks", p0.x, p0.y, t, { loop: true, count: 16, seed: 28.5 });
        }
      },

      triangle: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // VIP Submarine Escort Motorcade: crisp V-formation flashing blue lights + royal waving Turkey!
          var BG = getEngine();
          var t = resolved.t;
          S.drawMailSnail(ctx, 945, 345, 1.24, t, { postcard: true });

          for (var side = -1; side <= 1; side += 2) {
            for (var i = 0; i < 12; i++) {
              var mx = 865 - i * 44;
              var my = 345 + side * (28 + i * 13);
              drawCutoutMinnow(ctx, S, mx, my, 0, 0.95, Math.sin(t * 9 + i) * 4, "#f8fafc");
              if ((i + Math.floor(t * 10)) % 3 === 0) {
                BG.drawLanternHalo(ctx, mx + 6, my - 8, 22, { color: "#3b82f6", coreColor: "#eff6ff", intensity: 1.1, t: t });
              }
            }
          }
          // Royal Turkey wearing golden paper crown!
          S.drawTurkeyInCorner(ctx, 178, 498, 1.08, t, { dispatch: 0.95 });
          S.drawCutoutPaperEdge(ctx, [[162, 456], [166, 434], [180, 446], [192, 432], [204, 446], [216, 434], [218, 456]], "#facc15", "#14110d", { paperRim: 1.5 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Pony-Express Zip-Line Mail Delivery: 40 minnows flip postcard straight into Brook Trout's mailbox!
          var t = resolved.t;
          drawMinnowSchoolWave(ctx, S, t, 38, function (u, tm) { return sampleMinnowSCurve(S, u, tm); }, { spread: 8 });

          // Postcard zooming lightning-fast down the S-curve!
          var zipU = (t * 1.1) % 1;
          var pt = sampleMinnowSCurve(S, zipU, t);
          ctx.save();
          ctx.translate(pt.x, pt.y - 16);
          ctx.rotate(t * 9);
          S.drawCutoutPaperEdge(ctx, [[-24, -16], [24, -16], [24, 16], [-24, 16]], "#fbfaf5", "#14110d", { paperRim: 2 });
          ctx.fillStyle = "#d42a1e";
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, TAU);
          ctx.fill();
          ctx.restore();

          // Brook Trout's rural postbox with raised red flag at top-right!
          S.drawCardboardPuppetPiece(ctx, [[885, 225], [898, 225], [898, 365], [885, 365]], { tone: "#78350f" });
          S.drawCutoutPaperEdge(ctx, [[845, 178], [945, 178], [945, 228], [845, 228]], "#cbd5e1", "#14110d", { paperRim: 2.5 });
          S.drawCutoutPaperEdge(ctx, [[915, 198], [915, 148], [942, 158], [915, 168]], "#dc2626", "#14110d", { paperRim: 1.5 });

          S.drawBrookTrout(ctx, 1025, 275, 1.18, t, false);
          S.drawMailSnail(ctx, 325, 522, 1.2, t, { hasReply: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Cursive Skywriting Message To Aliens: calligraphic silver loop ribbon + Saucer snaps giant Polaroid!
          var BG = getEngine();
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 640, 106, 1.22, t, 640, 355, { beamSpread: 210 });

          // Calligraphic figure-eight cursive flourish loops formed by 42 silver foil minnows (0 text!)
          function cursivePt(u) {
            var x = S.lerp(255, 965, u) + Math.sin(u * TAU * 3) * 58;
            var y = 375 + Math.cos(u * TAU * 3) * 82;
            return { x: x, y: y };
          }
          BG.drawSnailSilverTrail(ctx, 255, 445, 965, 445, 1.0, t);
          drawMinnowSchoolWave(ctx, S, t, 42, cursivePt, { spread: 0, fill: "#f8fafc" });
          S.drawMailSnail(ctx, 985, 445, 1.18, t, { hasAlienStamp: true });

          // Giant white-bordered space Polaroid developing beside Saucer + periodic camera flash!
          var flash = Math.max(0, Math.sin(t * 4.5));
          if (flash > 0.85) {
            BG.drawLanternHalo(ctx, 640, 138, 220, { color: "#ffffff", intensity: 1.3, t: t });
          }
          ctx.save();
          ctx.translate(935, 195);
          ctx.rotate(0.14);
          S.drawCutoutPaperEdge(ctx, [[-68, -74], [68, -74], [68, 86], [-68, 86]], "#fbfaf5", "#14110d", { paperRim: 3 });
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(-54, -60, 108, 104);
          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(-18, -8, 18, 0, TAU);
          ctx.arc(18, -8, 18, 0, TAU);
          ctx.stroke();
          ctx.restore();
        }
      },

      square: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Magnetic Tin Minnows Cling Together: wind-up tin fish magnet-clink onto brass probe in silver beard!
          var BG = getEngine();
          var t = resolved.t;
          var tipX = 635, tipY = 335;
          drawBrassProbe(ctx, S, BG, 1065, 535, tipX, tipY, t, { magnet: true, seed: 28.7 });

          for (var i = 0; i < 20; i++) {
            var a = (i / 20) * Math.PI * 1.35 + Math.PI * 0.32;
            var r = 38 + (i % 3) * 34;
            var mx = tipX - 18 + Math.cos(a) * r + Math.sin(t * 14 + i) * 2.5;
            var my = tipY + Math.sin(a) * r;
            drawCutoutMinnow(ctx, S, mx, my, a + Math.PI, 0.96, 0, "#cbd5e1", { windupKey: i % 2 === 0 });
          }
          S.drawTurkeyInCorner(ctx, 178, 498, 1.08, t, { dispatch: 0.85 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Circus Flea-Fish Flaming Hoop Trick: Ringmaster Brook Trout + flaming brass hoop + triple somersault!
          var BG = getEngine();
          var t = resolved.t;
          var hx = 635, hy = 332;
          drawBrassProbe(ctx, S, BG, 1065, 535, hx - 58, hy, t, { hoop: true, hoopR: 62, seed: 28.8 });

          // Ring of cut-paper orange & yellow circus flames around brass hoop!
          for (var f = 0; f < 12; f++) {
            var fa = (f / 12) * TAU + t * 2.2;
            drawStarPoly(ctx, S, hx + Math.cos(fa) * 68, hy + Math.sin(fa) * 68, 4, 14, 6, fa, f % 2 === 0 ? "#f97316" : "#fde047", "#14110d", 1.0);
          }

          // Leaping somersaulting minnows arcing cleanly through flaming hoop!
          for (var m = 0; m < 8; m++) {
            var mu = ((t * 0.55 + m / 8) % 1);
            var mx = BG.lerp(335, 925, mu);
            var my = 425 - Math.sin(mu * Math.PI) * 165;
            var spin = Math.abs(mu - 0.5) < 0.16 ? t * 18 : (mu - 0.5) * 1.1;
            drawCutoutMinnow(ctx, S, mx, my, spin, 1.05, Math.sin(t * 12 + m) * 5, "#fbfaf7");
          }

          // Ringmaster Brook Trout in crimson coat & black top hat!
          S.drawBrookTrout(ctx, 325, 425, 1.24, t, true);
          S.drawCutoutPaperEdge(ctx, [[355, 396], [362, 355], [398, 355], [402, 396]], "#18181b", "#dc2626", { paperRim: 2 });
          S.drawMailSnail(ctx, 845, 512, 1.22, t, { hasReply: true, flip: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Stargate Ring Teleports Minnow Stream: enter cyan brass ring -> splash out golden portal under Saucer!
          var BG = getEngine();
          var t = resolved.t;
          S.drawAlienSaucer(ctx, 835, 108, 1.22, t, false, false, { beam: false });

          // Entry brass O-ring glowing cyan at lower-left (485, 425)
          var inX = 485, inY = 425;
          drawBrassProbe(ctx, S, BG, 965, 555, inX - 58, inY, t, { hoop: true, hoopR: 56, hoopColor: "#22d3ee", seed: 28.9 });
          ctx.fillStyle = "rgba(34, 211, 238, 0.45)";
          ctx.beginPath();
          ctx.arc(inX, inY, 50, 0, TAU);
          ctx.fill();

          // Matching golden exit portal ring beneath Alien Saucer at (835, 195)!
          var outX = 835, outY = 195;
          ctx.fillStyle = "rgba(250, 204, 21, 0.48)";
          ctx.strokeStyle = "#facc15";
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.ellipse(outX, outY, 68, 22, 0, 0, TAU);
          ctx.fill();
          ctx.stroke();

          // Minnows swimming into cyan ring & splashing downward out of golden Saucer portal!
          for (var i = 0; i < 16; i++) {
            var u = ((t * 0.6 + i / 16) % 1);
            if (u < 0.5) {
              var u1 = u * 2;
              drawCutoutMinnow(ctx, S, BG.lerp(185, inX, u1), BG.lerp(495, inY, u1), -0.24, 0.96, Math.sin(t * 12 + i) * 5, "#bae6fd");
            } else {
              var u2 = (u - 0.5) * 2;
              drawCutoutMinnow(ctx, S, outX + Math.sin(u2 * 5 + i) * 36, BG.lerp(outY + 12, 515, u2), Math.PI * 0.5, 0.96, Math.sin(t * 12 + i) * 5, "#fef08a");
            }
          }
        }
      }
    }
  };

  // ==========================================================================
  // REGISTER V3 PORTAL GAMES (#23..#28) ON BRANCH_GAME & window.PORTAL_V3_GAMES
  // ==========================================================================
  var SPECS = {
    23: P23_SPEC,
    24: P24_SPEC,
    25: P25_SPEC,
    26: P26_SPEC,
    27: P27_SPEC,
    28: P28_SPEC
  };

  function registerAll() {
    var BG = getEngine();
    var S = getStage();
    if (S && typeof S.preloadPortalPlates === "function") {
      S.preloadPortalPlates(PORTAL_IDS);
    }
    if (!BG || typeof BG.definePortalGame !== "function") return null;
    var out = {};
    for (var i = 0; i < PORTAL_IDS.length; i++) {
      var id = PORTAL_IDS[i];
      var game = BG.definePortalGame(id, SPECS[id]);
      out[id] = game;
      if (root) {
        root.PORTAL_V3_GAMES = root.PORTAL_V3_GAMES || {};
        root.PORTAL_V3_GAMES[id] = game;
      }
    }
    return out;
  }

  var REGISTERED = registerAll();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = REGISTERED || SPECS;
  }
})(typeof window !== "undefined" ? window : globalThis);
