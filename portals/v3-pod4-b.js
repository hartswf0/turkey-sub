/* ============================================================================
 * Turkey Sub · V3 Video-to-Game + PAELEO Oulipo Branching Pod 4B (#40–#44)
 * File: portals/v3-pod4-b.js  (window.PORTAL_V3_GAMES[40..44])
 *
 * Assigned Portholes (17 Bespoke Nodes = 1 Root + 4 Stems + 12 Outcomes each):
 *   - #40 · Reef    ("duchamp-optic"   · p40.jpg + atlas-25.webp · Outrapo / Foldès)
 *   - #41 · Catwalk ("daumier-litho"   · p41.jpg + atlas-28.webp · Zazie / Yuasa)
 *   - #42 · Ferry   ("queneau-rostrum" · p42.jpg + atlas-32.webp · Ouhispo / Reiniger)
 *   - #43 · Snout   ("queneau-rostrum" · p43.jpg + atlas-30.webp · 99Ways / CartoonSaloon)
 *   - #44 · Rotor   ("duchamp-optic"   · p44.jpg + atlas-52.webp · Anémic cinéma / Whitney)
 *
 * STRICT PAELEO BLIND-MODE LAW:
 *   Emits zero canvas text API calls anywhere in this module. All prop cues
 *   (jukebox arches, sunglasses, clipboards, postmarks, pie slices, recipe
 *   rings, and cosmic badges) are 100% pure geometric and scissor-cutout
 *   vector craft; atlas-28.webp is cropped strictly above y=200 so zero baked
 *   subtitle glyphs ever enter the frame.
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var PORTAL_IDS = [40, 41, 42, 43, 44];

  function getStage() {
    return (root && root.SCION_STAGE) ? root.SCION_STAGE : null;
  }

  function getEngine() {
    return (root && root.BRANCH_GAME) ? root.BRANCH_GAME : null;
  }

  var S0 = getStage();
  if (S0 && typeof S0.preloadPortalPlates === "function") {
    S0.preloadPortalPlates(PORTAL_IDS);
  }

  // ---------- Pure Stateless Math & Geometry Craft Helpers (0 Text!) ----------

  function clamp(v, a, b) {
    return v < a ? a : (v > b ? b : v);
  }

  function lerp(a, b, u) {
    return a + (b - a) * u;
  }

  function easeOutCubic(u) {
    var x = clamp(u, 0, 1);
    return 1 - Math.pow(1 - x, 3);
  }

  function easeOutBack(u) {
    var x = clamp(u, 0, 1);
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  function buildLimbPoly(x0, y0, x1, y1, w0, w1) {
    var dx = x1 - x0;
    var dy = y1 - y0;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len;
    var ny = dx / len;
    var ex = (dx / len) * (w0 * 0.32);
    var ey = (dy / len) * (w0 * 0.32);
    return [
      [x0 - ex + nx * w0, y0 - ey + ny * w0],
      [x1 + ex + nx * w1, y1 + ey + ny * w1],
      [x1 + ex - nx * w1, y1 + ey - ny * w1],
      [x0 - ex - nx * w0, y0 - ey - ny * w0]
    ];
  }

  // Subtle diegetic glints at the 4 button anchors in Root so blind & captioned modes feel alive
  function drawRootHotspotGlints(ctx, B, resolved) {
    if (!resolved || !resolved.tree || !resolved.tree.buttons) return;
    var keys = ["x", "o", "triangle", "square"];
    var cols = ["#60a5fa", "#f87171", "#34d399", "#fbbf24"];
    var t = resolved.t || 0;
    ctx.save();
    for (var i = 0; i < 4; i++) {
      var btn = resolved.tree.buttons[keys[i]];
      if (!btn || !btn.anchor) continue;
      var ax = btn.anchor.x;
      var ay = btn.anchor.y;
      var pulse = 0.45 + 0.55 * Math.sin(t * 3.8 + i * 1.55);
      ctx.strokeStyle = B.rgba(cols[i], 0.24 + pulse * 0.28);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(ax, ay, 10 + pulse * 8, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = B.rgba("#fbfaf5", 0.4 + pulse * 0.35);
      ctx.beginPath();
      ctx.arc(ax, ay, 2.6, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // Articulated 2-Bone IK Brass Manipulator Probe / Caliper Tongs (for [□] Square Stems & Outcomes!)
  function drawArticulatedBrassProbe(ctx, S, B, baseX, baseY, tipX, tipY, progress, t, opts) {
    var cfg = opts || {};
    var u = easeOutBack(clamp(progress, 0, 1));
    var tx = lerp(baseX - 40, tipX, clamp(u, 0, 1.08));
    var ty = lerp(baseY + 40, tipY, clamp(u, 0, 1.08));
    var ik = S.solveIK2(baseX, baseY, cfg.l1 || 175, cfg.l2 || 170, tx, ty, cfg.bendDir || -1);

    ctx.save();
    // Upper & forearm riveted brass-cardboard struts
    S.drawCardboardPuppetPiece(ctx, buildLimbPoly(baseX, baseY, ik.jx, ik.jy, 13, 10.5), {
      tone: "#b58938",
      ribs: 2
    });
    S.drawCardboardPuppetPiece(ctx, buildLimbPoly(ik.jx, ik.jy, ik.ex, ik.ey, 10.5, 8.5), {
      tone: "#d4a44c",
      ribs: 2
    });
    S.drawReinigerFiligreeHinge(ctx, baseX, baseY, 8.5, { metal: "brass" });
    S.drawReinigerFiligreeHinge(ctx, ik.jx, ik.jy, 7.2, { metal: "brass" });

    // Dual hinged brass caliper pincers at end-effector
    var jawAng = Math.atan2(ik.ey - ik.jy, ik.ex - ik.jx);
    var pinch = cfg.pinch != null ? cfg.pinch : (0.14 + Math.abs(Math.sin(t * 9.0)) * 0.24);
    ctx.save();
    ctx.translate(ik.ex, ik.ey);
    ctx.rotate(jawAng);
    for (var side = -1; side <= 1; side += 2) {
      ctx.save();
      ctx.rotate(side * pinch);
      S.drawCutoutPaperEdge(
        ctx,
        [[0, -side * 3], [28, -side * 15], [44, -side * 5], [38, side * 2], [14, -side * 6]],
        "#f3d184",
        "#14110d",
        { paperRim: 2.0, shadow: false }
      );
      ctx.restore();
    }
    S.drawSplitPin(ctx, 0, 0, 5.4, { metal: "silver" });
    ctx.restore();

    if (cfg.sparks !== false && progress > 0.22) {
      B.drawDeterministicParticles(ctx, "brass_sparks", ik.ex + Math.cos(jawAng) * 34, ik.ey + Math.sin(jawAng) * 34, (t * 1.3) % 0.85, {
        count: 12,
        loop: true,
        seed: cfg.seed || 44.7
      });
    }
    ctx.restore();
    return { x: ik.ex + Math.cos(jawAng) * 34, y: ik.ey + Math.sin(jawAng) * 34, angle: jawAng };
  }

  // Pure geometric 5-point or 4-point cutout star / sparkle (0 text!)
  function drawStarShape(ctx, cx, cy, rOuter, rInner, points, fillCol, strokeCol, rot) {
    var n = points || 5;
    ctx.save();
    ctx.translate(cx, cy);
    if (rot) ctx.rotate(rot);
    ctx.beginPath();
    for (var i = 0; i < n * 2; i++) {
      var r = (i % 2 === 0) ? rOuter : rInner;
      var a = (i / (n * 2)) * TAU - Math.PI * 0.5;
      var px = Math.cos(a) * r;
      var py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (fillCol) {
      ctx.fillStyle = fillCol;
      ctx.fill();
    }
    if (strokeCol) {
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Pure geometric eighth-note / beamed music note cutout (0 text!)
  function drawMusicNoteCutout(ctx, S, x, y, sc, color, rot) {
    var s = sc || 1.0;
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.scale(s, s);
    S.drawCutoutPaperEdge(
      ctx,
      [[-12, 10], [-3, 3], [2, 3], [2, -24], [20, -18], [20, -9], [8, -13], [8, 12], [-5, 17]],
      color || "#fae194",
      "#14110d",
      { paperRim: 2.2, shadow: false }
    );
    ctx.restore();
  }

  // Pure geometric purple/crimson postal cancellation stamp (0 text!)
  function drawPictographicPostmark(ctx, S, cx, cy, scale, rot, color) {
    var sc = scale || 1.0;
    var col = color || "#7e22ce";
    ctx.save();
    ctx.translate(cx, cy);
    if (rot) ctx.rotate(rot);
    ctx.scale(sc, sc);

    // Perforated postage stamp square backing
    S.drawCutoutPaperEdge(
      ctx,
      [[-28, -24], [28, -24], [28, 24], [-28, 24]],
      "#fbfaf5",
      col,
      { paperRim: 3.0 }
    );
    // Scalloped perforation dots
    ctx.fillStyle = col;
    for (var px = -22; px <= 22; px += 11) {
      ctx.beginPath();
      ctx.arc(px, -24, 2.0, 0, TAU);
      ctx.arc(px, 24, 2.0, 0, TAU);
      ctx.fill();
    }
    // Concentric cancellation rings + postal envelope/horn icon inside
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(-2, 0, 16, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-2, 0, 11, 0, TAU);
    ctx.stroke();
    // Envelope triangle inside stamp
    ctx.beginPath();
    ctx.rect(-9, -5, 14, 10);
    ctx.moveTo(-9, -5);
    ctx.lineTo(-2, 1);
    ctx.lineTo(5, -5);
    ctx.stroke();
    // Wavy cancellation lines to the right
    for (var wy = -9; wy <= 9; wy += 6) {
      ctx.beginPath();
      ctx.moveTo(14, wy);
      ctx.quadraticCurveTo(21, wy - 3, 28, wy);
      ctx.quadraticCurveTo(35, wy + 3, 42, wy);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==========================================================================
  // PORTHOLE #40 · REEF ("duchamp-optic" · p40.jpg + atlas-25.webp)
  // Outrapo Reversible Tape Reef & Sugar-Cube Quartz Towers
  // ==========================================================================

  function drawReefBase(ctx, W, H, resolved, plates, S, B, cfg) {
    var opts = cfg || {};
    var t = resolved.t || 0;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var pxFar = Math.sin(t * 0.45) * 8;
    var pxMid = Math.sin(t * 0.62) * 14;

    // 1. Far Plane: Scissored Modest Mouse "Dashboard" Sailor & Wooden Pub Table (atlas-25.webp 740×555)
    S.drawScissorCutout(
      ctx, aImg, 245, 140, 335, 380,
      86 + pxFar, 112, 248, 286,
      [[0.12, 0.05], [0.86, 0.04], [0.96, 0.56], [0.90, 0.96], [0.06, 0.94]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.72, rot: -0.03 }
    );
    S.drawScissorCutout(
      ctx, aImg, 160, 446, 480, 105,
      120 + pxMid * 0.35, 535, 1040, 128,
      [[0.02, 0.06], [0.98, 0.04], [0.99, 0.96], [0.01, 0.96]],
      { filter: "sepia", haloWidth: 4.0, alpha: 0.88 }
    );

    B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.18, color: "#67e8f9" });
    B.drawDepthFog(ctx, W, H, t, { density: 0.12, color: "#94a3b8" });

    // Optional Jukebox Arch behind towers (x.plausible)
    if (opts.jukeboxArch) {
      ctx.save();
      var jbX = 324 + pxMid * 0.5;
      var jbY = 66;
      var jbW = 632;
      var jbH = 492;
      S.drawCutoutPaperEdge(ctx, [
        [jbX, jbY + jbH], [jbX, jbY + 180], [jbX + 70, jbY + 46],
        [jbX + jbW * 0.5, jbY], [jbX + jbW - 70, jbY + 46],
        [jbX + jbW, jbY + 180], [jbX + jbW, jbY + jbH]
      ], "#2d1b38", "#14110d", { paperRim: 5.0 });
      ctx.strokeStyle = (Math.floor(t * 5) % 2 === 0) ? "#34d399" : "#fbbf24";
      ctx.lineWidth = 7.5;
      ctx.beginPath();
      ctx.arc(jbX + jbW * 0.5, jbY + 205, jbW * 0.43, Math.PI, 0);
      ctx.stroke();
      for (var gs = 0; gs < 4; gs++) {
        ctx.fillStyle = "#d4a44c";
        ctx.fillRect(jbX + 92, jbY + 235 + gs * 28, jbW - 184, 7);
      }
      ctx.restore();
    }

    // 2. Three Stacked White Quartz "Sugar-Cube" Towers cropped from p40.jpg (640×640)
    var cityRise = opts.spaceCity ? 54 * easeOutCubic(clamp(opts.cityU || 1, 0, 1)) : 0;
    var discoBounce = opts.discoPulse ? Math.abs(Math.sin(t * 7.2)) * 15 : 0;
    var towers = [
      { sx: 135, sy: 198, sw: 84, sh: 238, dx: 352 + pxMid * 0.6, dy: 208 - cityRise * 0.7 - discoBounce, dw: 124, dh: 326 + cityRise * 0.7 },
      { sx: 238, sy: 132, sw: 114, sh: 336, dx: 562 + pxMid * 0.6, dy: 122 - cityRise - discoBounce * 1.2, dw: 158, dh: 418 + cityRise },
      { sx: 416, sy: 192, sw: 92, sh: 245, dx: 790 + pxMid * 0.6, dy: 202 - cityRise * 0.8 - discoBounce, dw: 128, dh: 332 + cityRise * 0.8 }
    ];

    for (var ti = 0; ti < 3; ti++) {
      var tw = towers[ti];
      var tintCol = opts.discoPulse
        ? B.rgba(ti === 0 ? "#60a5fa" : (ti === 1 ? "#34d399" : "#f472b6"), 0.28 + 0.2 * Math.sin(t * 8 + ti))
        : (opts.spaceCity ? "rgba(103, 232, 249, 0.24)" : null);
      S.drawScissorCutout(
        ctx, pImg, tw.sx, tw.sy, tw.sw, tw.sh,
        tw.dx, tw.dy, tw.dw, tw.dh,
        [[0.18, 0.02], [0.82, 0.03], [0.94, 0.45], [0.98, 0.96], [0.04, 0.97], [0.08, 0.45]],
        { haloWidth: 4.4, tint: tintCol }
      );

      if (opts.spaceCity) {
        S.drawCutoutPaperEdge(ctx, [
          [tw.dx + tw.dw * 0.2, tw.dy + 8],
          [tw.dx + tw.dw * 0.5, tw.dy - 46],
          [tw.dx + tw.dw * 0.8, tw.dy + 8]
        ], "#67e8f9", "#14110d", { paperRim: 2.5, shadow: false });
        for (var wy = tw.dy + 34; wy < tw.dy + tw.dh - 54; wy += 34) {
          ctx.fillStyle = ((Math.round(wy + ti * 13) % 2) === 0) ? "#fde047" : "#34d399";
          ctx.fillRect(tw.dx + tw.dw * 0.32, wy, 11, 14);
          ctx.fillRect(tw.dx + tw.dw * 0.56, wy, 11, 14);
        }
      }
    }

    // 3. Magnetic Tape Ribbons (customized per stem/outcome!)
    var leftReelX = 436 + pxMid * 0.5;
    var rightReelX = 844 + pxMid * 0.5;
    var reelY = 486;
    var spinDir = opts.spinDir != null ? opts.spinDir : 1;
    var spinSpeed = opts.spinSpeed != null ? opts.spinSpeed : 2.2;
    var strobeHold = opts.strobe ? (Math.floor(t * 10) / 10) : t;
    var reelAngle = strobeHold * spinSpeed * spinDir;

    if (!opts.hideDefaultRibbons) {
      ctx.save();
      var ribbonCount = opts.ribbonCount || 3;
      var tidyCoil = opts.coiledClean ? clamp(opts.coilU || 1, 0, 1) : 0;
      for (var rb = 0; rb < ribbonCount; rb++) {
        var rCol = opts.cranberry ? (rb === 1 ? "#9f1239" : "#be123c") : (opts.rainbowTape ? ["#38bdf8", "#fbbf24", "#f472b6"][rb % 3] : "#5c3b21");
        var rRim = opts.cranberry ? "#ffe4e6" : "#f3d184";
        var rW = opts.cranberry ? 24 : (opts.standingWave ? 11 : 12);

        ctx.beginPath();
        var steps = 32;
        var spanRight = lerp(rightReelX, leftReelX + 75, tidyCoil * 0.78);
        for (var s = 0; s <= steps; s++) {
          var su = s / steps;
          var archH = (260 + rb * 44) * (1 - tidyCoil * 0.65);
          var wave = opts.standingWave
            ? Math.sin(su * Math.PI * (3 + rb)) * Math.cos(t * 18.0) * 34
            : Math.sin(su * TAU * 1.5 + t * 3.2 * spinDir + rb) * (32 + (opts.cranberry ? 18 : 0));
          var rx = lerp(leftReelX, spanRight, su) + wave * 0.55;
          var ry = reelY - Math.sin(su * Math.PI) * archH + (opts.standingWave ? wave : Math.cos(su * TAU * 2 + t * 3.0 + rb) * 16);
          if (s === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        }
        ctx.strokeStyle = rRim;
        ctx.lineWidth = rW + 4.5;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.strokeStyle = rCol;
        ctx.lineWidth = rW;
        ctx.stroke();

        // Ridged cranberry jelly slice lines!
        if (opts.cranberry) {
          ctx.strokeStyle = "rgba(255,255,255,0.38)";
          ctx.lineWidth = 2.0;
          ctx.setLineDash([4, 14]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      ctx.restore();
    }

    // 4. Twin Aluminum Take-Up Reels (scissored p40.jpg + 3 cinema cutout windows + brass hub patch!)
    var reelXs = [leftReelX, rightReelX];
    for (var ri = 0; ri < 2; ri++) {
      var rx0 = reelXs[ri];
      var pulseScale = opts.discoPulse ? (1 + Math.abs(Math.sin(t * 7.2 + ri)) * 0.09) : 1.0;
      ctx.save();
      ctx.translate(rx0, reelY);
      ctx.scale(pulseScale, pulseScale);

      // Scissor-cut cream halo
      ctx.fillStyle = "#fbfaf5";
      ctx.beginPath();
      ctx.arc(0, 0, 74, 0, TAU);
      ctx.fill();

      ctx.rotate(reelAngle * (ri === 0 ? 1 : -1));
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, 68, 0, TAU);
      ctx.clip();
      if (pImg && pImg.complete && pImg.naturalWidth > 0) {
        ctx.drawImage(pImg, 160, 402, 116, 102, -70, -70, 140, 140);
      } else {
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(-70, -70, 140, 140);
      }
      ctx.restore();

      // Wound magnetic tape pack ring
      var packThick = (opts.coiledClean && ri === 0) ? 24 : 15;
      ctx.strokeStyle = opts.cranberry ? "#9f1239" : "#3b2616";
      ctx.lineWidth = packThick;
      ctx.beginPath();
      ctx.arc(0, 0, 43, 0, TAU);
      ctx.stroke();

      // Aluminum flange with 3 classic trapezoid cinema-reel cutout windows
      ctx.strokeStyle = opts.strobe ? "#93c5fd" : "#d8dce0";
      ctx.lineWidth = 7.0;
      for (var w = 0; w < 3; w++) {
        var wa = (w / 3) * TAU;
        ctx.beginPath();
        ctx.moveTo(Math.cos(wa) * 18, Math.sin(wa) * 18);
        ctx.lineTo(Math.cos(wa) * 65, Math.sin(wa) * 65);
        ctx.stroke();
      }
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(0, 0, 68, 0, TAU);
      ctx.stroke();

      // Tactile brass hub patch covering center cap cleanly (0 text!)
      S.drawReinigerFiligreeHinge(ctx, 0, 0, 12.5, { metal: "brass" });
      ctx.restore();
    }

    return { leftReelX: leftReelX, rightReelX: rightReelX, reelY: reelY, towers: towers, pxMid: pxMid };
  }

  function registerPorthole40(B) {
    B.definePortalGame(40, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        S.drawBolasBackdrop(
          ctx, W, H,
          resolved.bolasStyle,
          40,
          resolved.t,
          { showCaptions: !resolved.blind, lamp: resolved.lampOn },
          {}
        );
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawReefBase(ctx, W, H, resolved, plates, S, B, { spinSpeed: 1.8 });
        // Scissor-cut creek trout from p40.jpg swimming gracefully past the right quartz tower
        S.drawScissorCutout(
          ctx, plates.portholeImg,
          334, 272, 196, 80,
          720 + Math.sin(t * 1.5) * 32, 268 + Math.cos(t * 2.2) * 8, 255, 104,
          [[0.02, 0.50], [0.24, 0.18], [0.58, 0.04], [0.78, 0.24], [0.98, 0.12], [0.96, 0.88], [0.68, 0.78], [0.28, 0.88]],
          { haloWidth: 4.2 }
        );
        B.drawDeterministicParticles(ctx, "bubbles", 640, 520, t, { count: 10, loop: true, spreadX: 420, seed: 40.1 });
        drawRootHotspotGlints(ctx, B, resolved);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          var flash = 0.55 + 0.45 * Math.sign(Math.sin(t * 22.0));
          var st = drawReefBase(ctx, W, H, resolved, plates, S, B, { strobe: true, spinSpeed: 4.2 });
          B.drawVolumetricBeam(ctx, 180, 42, st.leftReelX, st.reelY, {
            color: "#3b82f6", coreColor: "#dbeafe", spread: 135, intensity: (0.45 + 0.55 * flash) * easeOutCubic(u), t: t
          });
          B.drawVolumetricBeam(ctx, 1100, 42, st.rightReelX, st.reelY, {
            color: "#2563eb", coreColor: "#eff6ff", spread: 135, intensity: (0.45 + 0.55 * (1 - flash * 0.4)) * easeOutCubic(u), t: t
          });
          B.drawLanternHalo(ctx, st.leftReelX, st.reelY, 105, { color: "#60a5fa", intensity: 0.75 * u, t: t });
          B.drawLanternHalo(ctx, st.rightReelX, st.reelY, 105, { color: "#60a5fa", intensity: 0.75 * u, t: t + 0.4 });
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          var st = drawReefBase(ctx, W, H, resolved, plates, S, B, { spinDir: -1, spinSpeed: 7.5 });
          // Crimson reverse-current jet ribbons sweeping right-to-left across spools
          ctx.save();
          for (var j = 0; j < 4; j++) {
            var jy = 290 + j * 56;
            var off = ((t * 420 + j * 95) % 760);
            ctx.strokeStyle = j % 2 === 0 ? "rgba(248, 113, 113, 0.72)" : "rgba(224, 242, 254, 0.65)";
            ctx.lineWidth = 4.2;
            ctx.setLineDash([28, 14]);
            ctx.beginPath();
            ctx.moveTo(1060 - off * 0.5, jy);
            ctx.quadraticCurveTo(640, jy - 28, 240, jy + 10);
            ctx.stroke();
          }
          ctx.setLineDash([]);
          ctx.restore();
          B.drawDeterministicParticles(ctx, "bubbles", st.rightReelX, st.reelY, t, { count: 22, loop: true, spreadX: 280, seed: 40.2 });
          B.drawDeterministicParticles(ctx, "bubbles", st.leftReelX, st.reelY, t + 0.5, { count: 18, loop: true, spreadX: 200, seed: 40.25 });
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          drawReefBase(ctx, W, H, resolved, plates, S, B, { hideDefaultRibbons: true, spinSpeed: 1.4 });
          // Brass splicing block on foreground reef + two snapped ends joined by silver slime!
          var blkX = 435;
          var blkY = 468;
          S.drawCardboardPuppetPiece(ctx, [[blkX - 58, blkY - 14], [blkX + 58, blkY - 14], [blkX + 64, blkY + 18], [blkX - 64, blkY + 18]], {
            tone: "#c99842", ribs: 2, pins: [[blkX - 44, blkY], [blkX + 44, blkY]]
          });
          var gap = lerp(34, 0, easeOutCubic(u));
          ctx.strokeStyle = "#5c3b21";
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.moveTo(280, 495);
          ctx.quadraticCurveTo(360, 440, blkX - gap, blkY - 4);
          ctx.moveTo(blkX + gap, blkY - 4);
          ctx.quadraticCurveTo(640, 310, 844, 486);
          ctx.stroke();
          if (u > 0.45) {
            ctx.fillStyle = "#e2e8f0";
            ctx.strokeStyle = "#0f8f80";
            ctx.lineWidth = 2.4;
            ctx.fillRect(blkX - 18, blkY - 13, 36, 18);
            ctx.strokeRect(blkX - 18, blkY - 13, 36, 18);
            drawStarShape(ctx, blkX, blkY - 4, 9, 4, 4, "#fef08a", null, t * 3);
          }
          var snailX = lerp(210, blkX - 10, easeOutCubic(u));
          B.drawSnailSilverTrail(ctx, 210, 505, snailX, blkY - 26, u, t);
          S.drawMailSnail(ctx, snailX, blkY - 28, 1.24, t, { postcard: false });
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          drawReefBase(ctx, W, H, resolved, plates, S, B, { standingWave: true, spinSpeed: 2.0 });
          var tip = drawArticulatedBrassProbe(ctx, S, B, 1140, 560, 745, 365, u, t, { seed: 40.4 });
          // Acoustic bass sonar rings radiating from plucked tape span
          for (var r = 0; r < 3; r++) {
            var ru = ((t * 1.4 + r / 3) % 1);
            ctx.strokeStyle = B.rgba("#fbbf24", (1 - ru) * 0.75);
            ctx.lineWidth = 3.0;
            ctx.beginPath();
            ctx.arc(tip.x - 45, tip.y, 18 + ru * 115, 0, TAU);
            ctx.stroke();
          }
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var ou = easeOutBack(clamp(resolved.outcomeU * 1.4, 0, 1));
            var st = drawReefBase(ctx, W, H, resolved, plates, S, B, { cranberry: true, strobe: true, spinSpeed: 2.8 });
            B.drawVolumetricBeam(ctx, 220, 30, 640, 320, { color: "#3b82f6", spread: 190, intensity: 0.72, t: t });
            // Tipped corrugated cranberry tin can at top pouring ridged crimson jelly!
            ctx.save();
            ctx.translate(640, 110 * clamp(ou, 0.2, 1.1));
            ctx.rotate(0.45 + Math.sin(t * 3.8) * 0.09);
            S.drawCardboardPuppetPiece(ctx, [[-46, -54], [46, -54], [46, 54], [-46, 54]], { tone: "#cbd5e1", ribs: 5 });
            S.drawCutoutPaperEdge(ctx, [[-46, -18], [46, -18], [46, 18], [-46, 18]], "#be123c", "#14110d", { paperRim: 0, shadow: false });
            ctx.restore();
            // Shuddering Turkey sticking out comical pink cut-paper tongue in disgust!
            var shudderX = 132 + Math.sin(t * 28.0) * 4.5;
            S.drawTurkeyInCorner(ctx, shudderX, 502, 1.15, t, { dispatch: 0.4 });
            S.drawCutoutPaperEdge(ctx, [[shudderX + 34, 492], [shudderX + 64, 498], [shudderX + 60, 510], [shudderX + 32, 502]], "#fb7185", "#14110d", { paperRim: 2.0 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var st = drawReefBase(ctx, W, H, resolved, plates, S, B, { jukeboxArch: true, discoPulse: true, rainbowTape: true, spinSpeed: 4.5 });
            B.drawVolumetricBeam(ctx, 640, 40, 640, 460, { color: "#38bdf8", spread: 240, intensity: 0.65, t: t });
            for (var mn = 0; mn < 5; mn++) {
              var nu = ((t * 0.45 + mn * 0.2) % 1);
              drawMusicNoteCutout(ctx, S, 410 + mn * 115 + Math.sin(t * 4 + mn) * 18, lerp(440, 120, nu), 1.05, mn % 2 === 0 ? "#fde047" : "#34d399", Math.sin(t * 3 + mn) * 0.25);
            }
            // Brook Trout bopping on beat + Mail Snail spinning atop left aluminum reel like a DJ!
            S.drawBrookTrout(ctx, 1005, 315 + Math.sin(t * 7.2) * 16, 1.18, t, true, { tilt: Math.sin(t * 7.2) * 0.14 });
            S.drawMailSnail(ctx, st.leftReelX, st.reelY - 76, 1.16, t, { hasReply: true, rot: Math.sin(t * 7.2) * 0.12 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var st = drawReefBase(ctx, W, H, resolved, plates, S, B, { spaceCity: true, cityU: resolved.outcomeU * 1.6, rainbowTape: true, spinSpeed: 3.2 });
            B.drawTractorRings(ctx, 640, 118, 640, 430, t, { spread: 210, rings: 6 });
            S.drawAlienSaucer(ctx, 640, 98, 1.18, t, 640, 360);
            // Miniature glowing light-cars zooming along skyway bridges between crystal towers!
            for (var lc = 0; lc < 4; lc++) {
              var cu = ((t * 0.55 + lc * 0.25) % 1);
              var cx = lerp(390, 860, cu);
              var cy = 280 - Math.sin(cu * Math.PI) * 95 + (lc % 2) * 44;
              S.drawCutoutPaperEdge(ctx, [[cx - 14, cy], [cx - 6, cy - 8], [cx + 10, cy - 8], [cx + 16, cy], [cx - 14, cy + 5]], lc % 2 === 0 ? "#fde047" : "#67e8f9", "#14110d", { paperRim: 2.0, shadow: false });
            }
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawReefBase(ctx, W, H, resolved, plates, S, B, { spinDir: -1, spinSpeed: 4.0, coiledClean: true, coilU: resolved.outcomeU * 1.5 });
            // Cleared brass submarine propeller spinning freely on right!
            ctx.save();
            ctx.translate(1035, 385);
            S.drawCardboardPuppetPiece(ctx, [[0, -18], [95, -28], [95, 28], [0, 18]], { tone: "#78532a", ribs: 2 });
            ctx.save();
            ctx.rotate(t * 9.0);
            for (var bl = 0; bl < 3; bl++) {
              ctx.rotate(TAU / 3);
              S.drawCutoutPaperEdge(ctx, [[0, 0], [-18, -56], [18, -56]], "#d4a44c", "#14110d", { paperRim: 2.0, shadow: false });
            }
            ctx.restore();
            S.drawSplitPin(ctx, 0, 0, 7.0, { metal: "brass" });
            ctx.restore();
            // Relieved Turkey checking chrome round bicycle rear-view mirror!
            S.drawTurkeyInCorner(ctx, 138, 502, 1.15, t, { dispatch: 0.2 });
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.moveTo(185, 495);
            ctx.lineTo(232, 422);
            ctx.stroke();
            S.drawCutoutPaperEdge(ctx, [[212, 396], [254, 396], [258, 428], [208, 428]], "#bae6fd", "#14110d", { paperRim: 3.0 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var st = drawReefBase(ctx, W, H, resolved, plates, S, B, { spinDir: -1, spinSpeed: 6.5, rainbowTape: true });
            // Inverted downward-moving bubbles + reversed mirrored eighth notes!
            for (var bi = 0; bi < 10; bi++) {
              var bu = 1 - ((t * 0.5 + bi * 0.1) % 1);
              var bx = 380 + bi * 54 + Math.sin(t * 3 + bi) * 12;
              var by = lerp(110, 480, 1 - bu);
              ctx.strokeStyle = "#a7f3d0";
              ctx.lineWidth = 2.2;
              ctx.beginPath();
              ctx.arc(bx, by, 7 + (bi % 3) * 3, 0, TAU);
              ctx.stroke();
            }
            for (var rn = 0; rn < 3; rn++) {
              ctx.save();
              ctx.translate(480 + rn * 150, 185 + Math.sin(t * 4 + rn) * 16);
              ctx.scale(-1, 1);
              drawMusicNoteCutout(ctx, S, 0, 0, 1.1, "#f87171", -0.15);
              ctx.restore();
            }
            // Brook Trout swimming backward (facing right while drifting left!) + moonwalking Mail Snail on quartz cube!
            var backX = lerp(980, 740, (t * 0.35) % 1);
            S.drawBrookTrout(ctx, backX, 310 + Math.sin(t * 5) * 10, 1.18, t, false);
            var moonX = lerp(685, 575, (t * 0.4) % 1);
            S.drawMailSnail(ctx, moonX, 114, 1.08, t, { hasReply: true, flip: false });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawReefBase(ctx, W, H, resolved, plates, S, B, { spinDir: -1, spinSpeed: 8.0 });
            S.drawAlienSaucer(ctx, 640, 92, 1.16, t, 640, 355);
            // Glowing needle-ray touching rewinding tape + 3 holographic circular replay medallions (duck, raincloud, canoe — 0 text!)
            ctx.strokeStyle = "#fb7185";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(640, 122);
            ctx.lineTo(640, 352);
            ctx.stroke();
            var holoXs = [370, 640, 910];
            for (var hi = 0; hi < 3; hi++) {
              var hx = holoXs[hi];
              var hy = 205 + Math.sin(t * 3.2 + hi) * 8;
              ctx.fillStyle = "rgba(16, 185, 129, 0.22)";
              ctx.strokeStyle = "#34d399";
              ctx.lineWidth = 2.6;
              ctx.beginPath();
              ctx.arc(hx, hy, 54, 0, TAU);
              ctx.fill();
              ctx.stroke();
              if (hi === 0) {
                // Duck silhouette
                S.drawCutoutPaperEdge(ctx, [[hx - 24, hy + 14], [hx - 16, hy - 4], [hx + 4, hy - 4], [hx + 10, hy - 22], [hx + 24, hy - 18], [hx + 18, hy + 14]], "#fde047", "#14110d", { paperRim: 1.8, shadow: false });
              } else if (hi === 1) {
                // Raincloud + lightning bolt
                S.drawCutoutPaperEdge(ctx, [[hx - 26, hy - 4], [hx - 14, hy - 20], [hx + 12, hy - 20], [hx + 26, hy - 4], [hx + 20, hy + 6], [hx - 20, hy + 6]], "#bae6fd", "#14110d", { paperRim: 1.8, shadow: false });
                S.drawCutoutPaperEdge(ctx, [[hx - 2, hy + 6], [hx + 8, hy + 6], [hx, hy + 26], [hx - 8, hy + 16]], "#fde047", "#14110d", { paperRim: 1.2, shadow: false });
              } else {
                // Canoe silhouette
                S.drawCutoutPaperEdge(ctx, [[hx - 34, hy - 2], [hx - 22, hy + 14], [hx + 22, hy + 14], [hx + 34, hy - 2], [hx + 14, hy + 3], [hx - 14, hy + 3]], "#f97316", "#14110d", { paperRim: 1.8, shadow: false });
              }
            }
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawReefBase(ctx, W, H, resolved, plates, S, B, { hideDefaultRibbons: true, spinSpeed: 2.4 });
            // Continuous tidy ski-lift loop around the quartz towers hung with festive autumn bunting pennants!
            ctx.save();
            ctx.strokeStyle = "#f3d184";
            ctx.lineWidth = 14;
            ctx.beginPath();
            ctx.ellipse(640, 330, 255, 115, -0.06, 0, TAU);
            ctx.stroke();
            ctx.strokeStyle = "#6d4425";
            ctx.lineWidth = 9;
            ctx.stroke();
            var buntCols = ["#d42a1e", "#f59e0b", "#0f8f80", "#eab308"];
            for (var bp = 0; bp < 12; bp++) {
              var ba = (bp / 12) * TAU + t * 0.9;
              var bx = 640 + Math.cos(ba) * 255;
              var by = 330 + Math.sin(ba) * 115;
              S.drawCutoutPaperEdge(ctx, [[bx - 11, by], [bx + 11, by], [bx, by + 24]], buntCols[bp % 4], "#14110d", { paperRim: 1.6, shadow: false });
            }
            ctx.restore();
            S.drawTurkeyInCorner(ctx, 138, 502, 1.15, t * 2.2, { dispatch: 0.85 });
            S.drawMailSnail(ctx, 310, 535, 1.15, t, { hasReply: false });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawReefBase(ctx, W, H, resolved, plates, S, B, { hideDefaultRibbons: true, discoPulse: true, spinSpeed: 3.6 });
            // Seamless glowing loop + silver splice seam passing magnetized creek pebble + EQ bars!
            ctx.strokeStyle = "#34d399";
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.ellipse(640, 350, 235, 95, 0, 0, TAU);
            ctx.stroke();
            var seamA = t * 3.4;
            drawStarShape(ctx, 640 + Math.cos(seamA) * 235, 350 + Math.sin(seamA) * 95, 14, 6, 4, "#ffffff", "#0f8f80", seamA);
            // 8 Equalizer wave bars pulsing in center
            for (var eq = 0; eq < 8; eq++) {
              var eh = 24 + Math.abs(Math.sin(t * 8.5 + eq * 0.9)) * 78;
              ctx.fillStyle = eq % 2 === 0 ? "#34d399" : "#fbbf24";
              ctx.fillRect(548 + eq * 24, 380 - eh, 16, eh);
            }
            var nod = Math.sin(t * 8.5) * 0.16;
            S.drawBrookTrout(ctx, 995, 320, 1.18, t, true, { tilt: nod });
            S.drawMailSnail(ctx, 305, 515, 1.22, t, { hasReply: true, rot: nod * 0.8 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawReefBase(ctx, W, H, resolved, plates, S, B, { hideDefaultRibbons: true, spinSpeed: 3.0 });
            S.drawAlienSaucer(ctx, 640, 94, 1.18, t, 640, 335);
            B.drawTractorRings(ctx, 640, 122, 640, 360, t, { spread: 195, rings: 5 });
            // Half-twist figure-8 Möbius ribbon + golden scout-spark riding forever!
            ctx.save();
            for (var pass = 0; pass < 2; pass++) {
              ctx.strokeStyle = pass === 0 ? "#f8fafc" : "#a855f7";
              ctx.lineWidth = pass === 0 ? 18 : 12;
              ctx.beginPath();
              for (var ms = 0; ms <= 64; ms++) {
                var mu = (ms / 64) * TAU;
                var mx = 640 + Math.sin(mu) * 265;
                var my = 340 + Math.sin(mu * 2) * 95;
                if (ms === 0) ctx.moveTo(mx, my);
                else ctx.lineTo(mx, my);
              }
              ctx.closePath();
              ctx.stroke();
            }
            var spU = t * 2.4;
            var spX = 640 + Math.sin(spU) * 265;
            var spY = 340 + Math.sin(spU * 2) * 95;
            B.drawLanternHalo(ctx, spX, spY, 48, { color: "#fde047", intensity: 1.2, t: t });
            drawStarShape(ctx, spX, spY, 16, 7, 5, "#fef08a", "#14110d", t * 5);
            ctx.restore();
            S.drawMailSnail(ctx, 260, 528, 1.15, t, { hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawReefBase(ctx, W, H, resolved, plates, S, B, { standingWave: true, spinSpeed: 1.8 });
            drawArticulatedBrassProbe(ctx, S, B, 1140, 560, 760, 370, 1.0, t, { sparks: false });
            // Professor Turkey with wire spectacles + vibrating silver U-shaped tuning fork!
            S.drawTurkeyInCorner(ctx, 138, 502, 1.15, t, { dispatch: 0.5 });
            ctx.save();
            ctx.translate(228, 442);
            ctx.rotate(Math.sin(t * 24.0) * 0.08);
            ctx.strokeStyle = "#e2e8f0";
            ctx.lineWidth = 5.0;
            ctx.beginPath();
            ctx.moveTo(0, 36); ctx.lineTo(0, 6);
            ctx.moveTo(-12, -32); ctx.lineTo(-12, 6); ctx.lineTo(12, 6); ctx.lineTo(12, -32);
            ctx.stroke();
            for (var wv = 1; wv <= 2; wv++) {
              ctx.strokeStyle = "rgba(96, 165, 250, 0.7)";
              ctx.lineWidth = 2.0;
              ctx.beginPath();
              ctx.arc(0, -18, 18 + wv * 12, -0.7, 0.7);
              ctx.stroke();
            }
            ctx.restore();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawReefBase(ctx, W, H, resolved, plates, S, B, { standingWave: true, discoPulse: true, spinSpeed: 3.2 });
            drawArticulatedBrassProbe(ctx, S, B, 1150, 565, 780, 395, 1.0, t, { seed: 40.8 });
            // Brook Trout shredding a cut-paper green kelp bass guitar + Mail Snail playing pebble bongos!
            var tx = 965;
            var ty = 295 + Math.sin(t * 7.0) * 10;
            S.drawBrookTrout(ctx, tx, ty, 1.18, t, true);
            S.drawCutoutPaperEdge(ctx, [[tx - 65, ty + 6], [tx - 18, ty - 14], [tx + 24, ty + 8], [tx - 14, ty + 28]], "#15803d", "#14110d", { paperRim: 2.2 });
            ctx.strokeStyle = "#fde047";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(tx - 18, ty + 6); ctx.lineTo(tx - 88, ty - 18);
            ctx.stroke();
            // Pebble bongos + Mail Snail
            S.drawCutoutPaperEdge(ctx, [[315, 520], [355, 520], [362, 550], [308, 550]], "#94a3b8", "#14110d", { paperRim: 2.5 });
            S.drawCutoutPaperEdge(ctx, [[364, 526], [398, 526], [404, 550], [358, 550]], "#cbd5e1", "#14110d", { paperRim: 2.5 });
            S.drawMailSnail(ctx, 272, 525 + Math.abs(Math.sin(t * 10)) * -8, 1.18, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawReefBase(ctx, W, H, resolved, plates, S, B, { hideDefaultRibbons: true, spinSpeed: 2.8 });
            drawArticulatedBrassProbe(ctx, S, B, 1150, 565, 830, 420, 1.0, t, { seed: 40.9 });
            S.drawAlienSaucer(ctx, 640, 94, 1.18, t, 640, 340);
            // Glowing neon-gold Cosmic Superstring + 3 orbiting sugar-cube ringed planets!
            ctx.save();
            ctx.strokeStyle = "#fde047";
            ctx.lineWidth = 7.0;
            ctx.beginPath();
            for (var sx = 360; sx <= 920; sx += 16) {
              var sy = 350 + Math.sin((sx - 360) / 560 * Math.PI * 3) * Math.cos(t * 16.0) * 42;
              if (sx === 360) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
            for (var pl = 0; pl < 3; pl++) {
              var pa = t * (1.8 + pl * 0.4) + pl * 2.1;
              var px = 490 + pl * 150 + Math.cos(pa) * 34;
              var py = 250 + Math.sin(pa) * 56;
              S.drawCutoutPaperEdge(ctx, [[px - 22, py - 22], [px + 22, py - 22], [px + 22, py + 22], [px - 22, py + 22]], "#f8fafc", "#14110d", { paperRim: 2.5 });
              ctx.strokeStyle = pl === 1 ? "#34d399" : "#f472b6";
              ctx.lineWidth = 3.0;
              ctx.beginPath();
              ctx.ellipse(px, py, 38, 11, 0.35, 0, TAU);
              ctx.stroke();
            }
            ctx.restore();
          }
        }
      }
    });
  }

  // ==========================================================================
  // PORTHOLE #41 · CATWALK ("daumier-litho" · p41.jpg + atlas-28.webp)
  // Sea Bream in Sunglasses Walking on Forked Hickory Stilts (atlas-28 y<200!)
  // ==========================================================================

  var FISH_41_POLY = [
    [0.03, 0.30], [0.16, 0.38], [0.34, 0.26], [0.46, 0.05],
    [0.64, 0.14], [0.88, 0.22], [0.98, 0.34], [0.95, 0.56],
    [0.82, 0.78], [0.60, 0.94], [0.42, 0.95], [0.26, 0.84],
    [0.14, 0.70], [0.03, 0.78], [0.08, 0.54]
  ];

  function drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B) {
    var t = resolved.t || 0;
    var pxFar = Math.sin(t * 0.45) * 9;
    var pxMid = Math.sin(t * 0.65) * 15;
    var catwalkY = 508;

    // Far plane: Yuasa Mind Game eyes/brow shards from atlas-28.webp (740×359)
    // CRITICAL: Cropped strictly at sy=18, sh=178 (y <= 196, well above subtitle at y>255!)
    S.drawScissorCutout(
      ctx, plates.atlasImg, 58, 18, 560, 178,
      110 + pxFar, 132, 360, 128,
      [[0.02, 0.08], [0.96, 0.02], [0.99, 0.88], [0.06, 0.96]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.80, rot: -0.025 }
    );
    S.drawScissorCutout(
      ctx, plates.atlasImg, 180, 24, 440, 168,
      810 + pxFar, 138, 330, 122,
      [[0.04, 0.04], [0.98, 0.10], [0.94, 0.95], [0.01, 0.86]],
      { filter: "litho", haloWidth: 4.0, alpha: 0.75, rot: 0.03 }
    );

    // Mid plane: Creek rocks & reeds from p41.jpg (640×640)
    S.drawScissorCutout(
      ctx, plates.portholeImg, 104, 248, 132, 140,
      68 + pxMid, 364, 224, 148,
      [[0.06, 0.18], [0.42, 0.02], [0.88, 0.16], [0.98, 0.92], [0.04, 0.96]],
      { filter: "litho", haloWidth: 4.5 }
    );
    S.drawScissorCutout(
      ctx, plates.portholeImg, 402, 286, 134, 190,
      982 + pxMid, 332, 224, 182,
      [[0.12, 0.04], [0.68, 0.08], [0.96, 0.44], [0.92, 0.96], [0.04, 0.94]],
      { filter: "litho", haloWidth: 4.5 }
    );

    B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.14, color: "#e2e8f0", topY: 130 });

    // Crisp Daumier lithograph catwalk planks across black band
    ctx.save();
    ctx.fillStyle = "#fbfaf5";
    ctx.strokeStyle = "#0b0c0e";
    ctx.lineWidth = 2.4;
    ctx.fillRect(-20, catwalkY, W + 40, 18);
    ctx.strokeRect(-20, catwalkY, W + 40, 18);
    for (var x = 18; x < W + 40; x += 78) {
      ctx.beginPath();
      ctx.moveTo(x, catwalkY);
      ctx.lineTo(x - 14, catwalkY + 18);
      ctx.stroke();
      S.drawSplitPin(ctx, x + 24, catwalkY + 9, 3.0, { metal: "silver" });
    }
    ctx.restore();

    return { catwalkY: catwalkY, pxMid: pxMid };
  }

  function drawStiltBreamActor(ctx, S, plates, cx, cy, catwalkY, scale, t, opts) {
    var cfg = opts || {};
    var sc = scale || 1.0;
    var stridePh = cfg.stridePhase != null ? cfg.stridePhase : (t * 5.2);

    // 1. Two 2-Bone IK Forked Hickory Twig Stilts (unless hidden)
    var leftKnee = null;
    if (cfg.stilts !== false) {
      for (var leg = 0; leg < 2; leg++) {
        var ph = stridePh + leg * Math.PI;
        var hipX = cx + (leg === 0 ? -24 : 26) * sc;
        var hipY = cy + 52 * sc;
        var swing = cfg.oneLegHop && leg === 0 ? -0.55 : Math.sin(ph);
        var lift = cfg.oneLegHop && leg === 0 ? 78 : Math.max(0, Math.cos(ph)) * (cfg.highBound ? 85 : 34);
        var footX = cfg.footOverrideX != null ? (cfg.footOverrideX + (leg === 0 ? -18 : 18)) : (cx + swing * 70 * sc);
        var footY = (cfg.footBaseY != null ? cfg.footBaseY : catwalkY) - lift;
        var ik = S.solveIK2(hipX, hipY, 102 * sc, 108 * sc, footX, footY, leg === 0 ? 1 : -1);
        if (leg === 0) leftKnee = ik;

        var woodTone = leg === 0 ? "#8a7962" : "#b39f84";
        S.drawCardboardPuppetPiece(ctx, buildLimbPoly(hipX, hipY, ik.jx, ik.jy, 8.5 * sc, 7.0 * sc), {
          tone: woodTone, ribs: 2, pin: { x: hipX, y: hipY, r: 4.5 * sc, metal: "brass" }
        });
        S.drawCardboardPuppetPiece(ctx, buildLimbPoly(ik.jx, ik.jy, ik.ex, ik.ey, 7.0 * sc, 5.2 * sc), {
          tone: woodTone, ribs: 2, pins: [{ x: ik.jx, y: ik.jy, r: 4.2 * sc, metal: "silver" }, { x: ik.ex, y: ik.ey, r: 3.4 * sc, metal: "brass" }]
        });

        if (cfg.sproutLeaf && leg === 1) {
          S.drawCutoutPaperEdge(
            ctx,
            [[ik.jx + 4, ik.jy - 4], [ik.jx + 34, ik.jy - 24], [ik.jx + 42, ik.jy - 4], [ik.jx + 18, ik.jy + 6]],
            "#22c55e", "#14110d", { paperRim: 2.2, shadow: false }
          );
        }
      }
    }

    // 2. Scissor-Cut Sea-Bream Body from p41.jpg + Hinged Sunglasses!
    ctx.save();
    ctx.translate(cx, cy + Math.sin(t * 5.2) * 4 * sc);
    ctx.rotate(cfg.pitch || Math.sin(t * 2.6) * 0.04);

    var dw = 308 * sc;
    var dh = 174 * sc;
    var dx = -dw * 0.48;
    var dy = -dh * 0.54;

    S.drawScissorCutout(
      ctx, plates.portholeImg, 196, 192, 246, 136,
      dx, dy, dw, dh, FISH_41_POLY,
      { filter: cfg.filter || "litho", haloWidth: 5.0, haloColor: "#fbfaf7", stroke: "#0b0c0e", lineWidth: 2.0 }
    );

    // Hinged Cool Sunglasses
    var shadeDrop = cfg.shadeDrop || 0;
    ctx.save();
    ctx.translate(dx + dw * 0.78, dy + dh * 0.30 + shadeDrop * 16);
    ctx.rotate(shadeDrop * 0.35 + Math.sin(t * 3.0) * 0.04);
    if (shadeDrop > 0.15) {
      // Wide-open comic fish eye peeking over lowered shades!
      ctx.fillStyle = "#fbfaf7";
      ctx.strokeStyle = "#0b0c0e";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(4 * sc, -18 * sc, 9 * sc, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#0b0c0e";
      ctx.beginPath();
      ctx.arc(6 * sc, -18 * sc, 4 * sc, 0, TAU);
      ctx.fill();
    }
    S.drawCutoutPaperEdge(ctx, [[-18 * sc, -12 * sc], [14 * sc, -15 * sc], [12 * sc, 11 * sc], [-18 * sc, 12 * sc]], "#111317", "#fbfaf7", { paperRim: 2.2 * sc, shadow: false });
    S.drawCutoutPaperEdge(ctx, [[18 * sc, -15 * sc], [44 * sc, -16 * sc], [41 * sc, 8 * sc], [18 * sc, 9 * sc]], "#111317", "#fbfaf7", { paperRim: 2.2 * sc, shadow: false });
    S.drawSplitPin(ctx, -18 * sc, -2 * sc, 3.2 * sc, { metal: "silver" });

    if (cfg.lensFlare) {
      drawStarShape(ctx, -2 * sc, -2 * sc, 38 * sc, 8 * sc, 4, "#ffffff", "#60a5fa", t * 2.4);
      drawStarShape(ctx, 30 * sc, -4 * sc, 32 * sc, 7 * sc, 4, "#dbeafe", "#2563eb", -t * 2.1);
    }
    ctx.restore();

    // Articulated Pectoral Fin
    ctx.save();
    ctx.translate(dx + dw * 0.54, dy + dh * 0.66);
    ctx.rotate((cfg.finAng != null ? cfg.finAng : 0.25) + Math.sin(t * 5.0) * 0.15);
    S.drawCardboardPuppetPiece(ctx, [[-6 * sc, -5 * sc], [32 * sc, 4 * sc], [26 * sc, 20 * sc], [-8 * sc, 10 * sc]], {
      tone: "#9d9a93", ribs: 1, pin: { x: 0, y: 0, r: 3.8 * sc, metal: "brass" }
    });
    ctx.restore();

    ctx.restore();
    return { shadeX: cx + 92 * sc, shadeY: cy - 38 * sc, leftKnee: leftKnee };
  }

  function registerPorthole41(B) {
    B.definePortalGame(41, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        S.drawBolasBackdrop(
          ctx, W, H,
          resolved.bolasStyle,
          41,
          resolved.t,
          { showCaptions: !resolved.blind, lamp: resolved.lampOn },
          { bandTop: 120, bandBot: 572 }
        );
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
        var walkX = 635 + Math.sin(t * 1.1) * 85;
        drawStiltBreamActor(ctx, S, plates, walkX, 278, env.catwalkY, 1.04, t, {});
        drawRootHotspotGlints(ctx, B, resolved);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
          var act = drawStiltBreamActor(ctx, S, plates, 625, 276, env.catwalkY, 1.06, t, { lensFlare: true, finAng: -0.55 });
          B.drawVolumetricBeam(ctx, 180, 70, act.shadeX, act.shadeY, {
            color: "#3b82f6", coreColor: "#ffffff", spread: 115, intensity: easeOutCubic(u), t: t
          });
          B.drawLanternHalo(ctx, act.shadeX, act.shadeY, 125, { color: "#60a5fa", coreColor: "#ffffff", intensity: 0.95 * u, t: t });
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
          var hopY = 260 - Math.abs(Math.sin(t * 6.5)) * 28;
          drawStiltBreamActor(ctx, S, plates, 645, hopY, env.catwalkY, 1.05, t, { oneLegHop: true, pitch: -0.09 });
          // Crimson current wave sweeping pebbles across catwalk
          B.drawDeterministicParticles(ctx, "bubbles", 760, env.catwalkY - 12, t, { count: 24, loop: true, spreadX: 320, seed: 41.2 });
          ctx.strokeStyle = "rgba(248, 113, 113, 0.78)";
          ctx.lineWidth = 4.5;
          ctx.beginPath();
          ctx.moveTo(980, env.catwalkY - 18);
          ctx.quadraticCurveTo(720, env.catwalkY - 52, 460, env.catwalkY - 14);
          ctx.stroke();
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
          drawStiltBreamActor(ctx, S, plates, 690, 278, env.catwalkY, 1.04, t, { stridePhase: 0.3 });
          var sx = lerp(240, 485, easeOutCubic(u));
          B.drawSnailSilverTrail(ctx, 240, env.catwalkY - 8, sx, env.catwalkY - 8, u, t);
          S.drawMailSnail(ctx, sx, env.catwalkY - 14, 1.24, t, { postcard: false });
          // Tall wooden official clipboard held skyward (pure pictographic checkboxes, 0 text!)
          var cbX = sx + 34;
          var cbY = env.catwalkY - 96 * easeOutBack(u);
          S.drawCutoutPaperEdge(ctx, [[cbX - 26, cbY - 38], [cbX + 26, cbY - 38], [cbX + 26, cbY + 38], [cbX - 26, cbY + 38]], "#d9a23d", "#0b0c0e", { paperRim: 2.5 });
          ctx.fillStyle = "#fbfaf7";
          ctx.fillRect(cbX - 20, cbY - 26, 40, 56);
          B.drawGeometricSymbol(ctx, "x", cbX - 9, cbY - 10, 7, "#d42a1e", 2.0);
          B.drawGeometricSymbol(ctx, "o", cbX + 9, cbY + 12, 7, "#0f8f80", 2.0);
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
          drawStiltBreamActor(ctx, S, plates, 585, 278, env.catwalkY, 1.04, t, { stridePhase: 0.45 });
          var tip = drawArticulatedBrassProbe(ctx, S, B, 1120, 540, 635, 425, u, t, { seed: 41.4 });
          for (var k = 1; k <= 2; k++) {
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(tip.x - 12, tip.y, 12 + k * 12 + Math.sin(t * 16) * 4, -0.8, 0.8);
            ctx.stroke();
          }
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
            // Yuasa wavy mirage lines + 3 ghostly sheared stilt-bream echoes!
            for (var wv = 0; wv < 6; wv++) {
              ctx.strokeStyle = wv % 2 === 0 ? "rgba(251,250,247,0.36)" : "rgba(56,189,248,0.45)";
              ctx.lineWidth = 2.8;
              ctx.setLineDash([22, 12]);
              ctx.beginPath();
              ctx.moveTo(260 + Math.sin(t * 4.5 + wv) * 35, 175 + wv * 52);
              ctx.lineTo(1060 + Math.sin(t * 4.5 + wv) * 35, 175 + wv * 52);
              ctx.stroke();
            }
            ctx.setLineDash([]);
            for (var g = 2; g >= 0; g--) {
              ctx.save();
              ctx.globalAlpha = g === 0 ? 0.94 : 0.34;
              drawStiltBreamActor(ctx, S, plates, 680 + Math.sin(t * 4 + g) * (20 + g * 26), 278 + (g - 1) * 14, env.catwalkY, 1.0 - g * 0.06, t + g * 0.3, { lensFlare: g === 0 });
              ctx.restore();
            }
            // Flabbergasted Turkey + brass circular Oxygen Dial Gauge (green arc + needle, 0 text!)
            S.drawTurkeyInCorner(ctx, 136, 488, 1.14, t, { dispatch: 0.6 });
            ctx.save();
            ctx.translate(238, 420);
            S.drawCutoutPaperEdge(ctx, [[-34, -34], [34, -34], [34, 34], [-34, 34]], "#fbfaf5", "#14110d", { paperRim: 3.0 });
            ctx.strokeStyle = "#22c55e";
            ctx.lineWidth = 6.0;
            ctx.beginPath();
            ctx.arc(0, 4, 22, Math.PI * 1.1, Math.PI * 1.9);
            ctx.stroke();
            ctx.strokeStyle = "#d42a1e";
            ctx.lineWidth = 2.8;
            var ndl = -0.4 + Math.sin(t * 8.0) * 0.22;
            ctx.beginPath();
            ctx.moveTo(0, 6);
            ctx.lineTo(Math.sin(ndl) * 20, 6 - Math.cos(ndl) * 20);
            ctx.stroke();
            S.drawSplitPin(ctx, 0, 6, 4.0, { metal: "brass" });
            ctx.restore();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
            drawStiltBreamActor(ctx, S, plates, 560, 274, env.catwalkY, 1.06, t, { lensFlare: true, finAng: -0.6 });
            // Brook Trout wearing dark mussel-shell sunglasses + Mail Snail holding autograph card & feather quill!
            var tx = 955;
            var ty = 325 + Math.sin(t * 3.8) * 8;
            S.drawBrookTrout(ctx, tx, ty, 1.24, t, true);
            S.drawCutoutPaperEdge(ctx, [[tx - 82, ty - 18], [tx - 52, ty - 20], [tx - 54, ty + 2], [tx - 80, ty + 2]], "#1e293b", "#fbfaf7", { paperRim: 2.0, shadow: false });
            S.drawMailSnail(ctx, 775, env.catwalkY - 14, 1.20, t, { hasReply: true, flip: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
            var act = drawStiltBreamActor(ctx, S, plates, 640, 286, env.catwalkY, 1.05, t, { lensFlare: true, finAng: -0.75 });
            // Upward blue neuralyzer beams from fish shades -> Panicked Alien Saucer hiding under twig-and-leaf bush disguise!
            B.drawVolumetricBeam(ctx, act.shadeX, act.shadeY, 640, 102, { color: "#3b82f6", coreColor: "#ffffff", spread: 130, intensity: 0.9, t: t });
            S.drawAlienSaucer(ctx, 640 + Math.sin(t * 9) * 6, 104, 1.18, t, false, false, { beam: false });
            var bushCols = ["#15803d", "#22c55e", "#166534"];
            for (var lf = -2; lf <= 2; lf++) {
              S.drawCutoutPaperEdge(
                ctx,
                [[640 + lf * 24 - 18, 82], [640 + lf * 28, 42 - Math.abs(lf) * 4], [640 + lf * 24 + 18, 82]],
                bushCols[(lf + 2) % 3], "#14110d", { paperRim: 2.2, shadow: false }
              );
            }
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
            // Moonwalking bream striding briskly against current + Turkey furiously pedaling brass sub bicycle cranks!
            drawStiltBreamActor(ctx, S, plates, 720 + Math.sin(t * 2.5) * 35, 276, env.catwalkY, 1.05, t, { stridePhase: -t * 9.5 });
            S.drawTurkeyInCorner(ctx, 140, 468, 1.12, t * 2.5, { dispatch: 0.7 });
            ctx.save();
            ctx.translate(215, 518);
            ctx.rotate(t * 10.0);
            ctx.strokeStyle = "#d4a44c";
            ctx.lineWidth = 5.0;
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, TAU);
            ctx.moveTo(-32, 0); ctx.lineTo(32, 0);
            ctx.stroke();
            S.drawSplitPin(ctx, 0, 0, 5.0, { metal: "brass" });
            ctx.restore();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
            var canX = 620 + Math.sin(t * 2.4) * 55;
            var canR = 54;
            var canY = env.catwalkY - canR;
            // Rolling red-and-cream soup tin can (steaming bowl icon, 0 text!) + Bream log-rolling atop it!
            ctx.save();
            ctx.translate(canX, canY);
            ctx.rotate(t * 5.0);
            S.drawCutoutPaperEdge(ctx, [[-canR, -20], [-38, -46], [38, -46], [canR, -20], [canR, 20], [38, 46], [-38, 46], [-canR, 20]], "#d42a1e", "#0b0c0e", { paperRim: 3.5 });
            ctx.fillStyle = "#fbfaf5";
            ctx.fillRect(-38, 0, 76, 38);
            ctx.fillStyle = "#d4a44c";
            ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.fill();
            ctx.restore();
            drawStiltBreamActor(ctx, S, plates, canX, 222, canY - canR, 0.96, t, { footOverrideX: canX, footBaseY: canY - canR + 4, stridePhase: t * 8.0 });
            // Brook Trout & Mail Snail holding star score paddles!
            S.drawBrookTrout(ctx, 985, 340, 1.16, t, true);
            S.drawMailSnail(ctx, 320, env.catwalkY - 14, 1.18, t, { hasReply: true });
            drawStarShape(ctx, 358, env.catwalkY - 64, 18, 8, 5, "#fde047", "#0b0c0e", 0.1);
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
            S.drawAlienSaucer(ctx, 640, 92, 1.16, t, 640, 340);
            B.drawVolumetricBeam(ctx, 640, 118, 640, env.catwalkY, { color: "#e879f9", coreColor: "#fdf4ff", spread: 230, intensity: 0.72, t: t });
            var boundY = 232 - Math.abs(Math.sin(t * 3.6)) * 68;
            drawStiltBreamActor(ctx, S, plates, 640 + Math.cos(t * 1.8) * 90, boundY, env.catwalkY, 1.04, t, { highBound: true });
            // Rainbow disco shockwaves along catwalk
            var cols = ["#f472b6", "#38bdf8", "#fde047"];
            for (var sw = 0; sw < 3; sw++) {
              ctx.strokeStyle = cols[sw];
              ctx.lineWidth = 3.2;
              ctx.beginPath();
              ctx.ellipse(640, env.catwalkY, 95 + sw * 65 + (t * 60) % 55, 14 + sw * 5, 0, 0, TAU);
              ctx.stroke();
            }
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
            // Bream lowers shades to read Mail Snail's tiny clipboard & pink ticket while Turkey chuckles!
            drawStiltBreamActor(ctx, S, plates, 685, 282, env.catwalkY, 1.05, t, { shadeDrop: 0.85, pitch: -0.08, stridePhase: 0.2 });
            S.drawMailSnail(ctx, 495, env.catwalkY - 14, 1.24, t, { hasReply: false });
            S.drawCutoutPaperEdge(ctx, [[525, env.catwalkY - 96], [575, env.catwalkY - 96], [575, env.catwalkY - 34], [525, env.catwalkY - 34]], "#fda4af", "#0b0c0e", { paperRim: 2.5 });
            S.drawTurkeyInCorner(ctx, 138, 490, 1.12, t, { dispatch: 0.4 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
            drawStiltBreamActor(ctx, S, plates, 640, 276, env.catwalkY, 1.04, t, { finAng: -0.7, stridePhase: 0.35 });
            // Stamped white feather-signed rental slip held under fin (cut-paper feather icon, 0 text!)
            S.drawCutoutPaperEdge(ctx, [[545, 295], [608, 286], [614, 346], [550, 354]], "#fbfaf7", "#0b0c0e", { paperRim: 2.5 });
            S.drawCutoutPaperEdge(ctx, [[566, 336], [592, 300], [598, 314], [574, 342]], "#0f8f80", "#0b0c0e", { paperRim: 1.2, shadow: false });
            S.drawMailSnail(ctx, 455, env.catwalkY - 14, 1.22, t, { hasReply: true });
            S.drawBrookTrout(ctx, 980, 305, 1.18, t, true);
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
            drawStiltBreamActor(ctx, S, plates, 665, 280, env.catwalkY, 1.05, t, { lensFlare: true, finAng: -0.65 });
            // Hinged clam-wallet projecting spinning 6-pointed golden Galactic Star-Badge + Saucer twin-ray salute!
            S.drawCutoutPaperEdge(ctx, [[535, 318], [585, 302], [592, 332], [540, 342]], "#7e22ce", "#fbfaf7", { paperRim: 2.2 });
            B.drawLanternHalo(ctx, 505, 275, 76, { color: "#34d399", coreColor: "#fef08a", intensity: 0.95, t: t });
            drawStarShape(ctx, 505, 275, 32, 14, 6, "#fde047", "#0b0c0e", t * 2.8);
            S.drawMailSnail(ctx, 435, env.catwalkY - 14, 1.22, t, { hasReply: true, hasAlienStamp: true });
            S.drawAlienSaucer(ctx, 640, 92, 1.16, t, 505, 275);
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
            // Green hickory leaf sprouting on tapped twig stilt + Bream tipping shades to relieved Turkey!
            drawStiltBreamActor(ctx, S, plates, 650, 276, env.catwalkY, 1.05, t, { sproutLeaf: true, shadeDrop: 0.22, finAng: -0.85 });
            drawArticulatedBrassProbe(ctx, S, B, 1130, 545, 725, 420, 1.0, t, { sparks: false });
            S.drawTurkeyInCorner(ctx, 138, 490, 1.14, t, { dispatch: 0.3 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
            drawStiltBreamActor(ctx, S, plates, 610, 276, env.catwalkY, 1.04, t, { stridePhase: 0.6 });
            // Brass kickstand parked neatly on catwalk + approving Brook Trout & Mail Snail!
            S.drawCardboardPuppetPiece(ctx, [[610, 415], [665, env.catwalkY], [652, env.catwalkY], [598, 415]], { tone: "#d4a44c", pin: { x: 604, y: 415, r: 4.5, metal: "brass" } });
            drawArticulatedBrassProbe(ctx, S, B, 1140, 550, 685, 435, 1.0, t, { sparks: false });
            S.drawBrookTrout(ctx, 955, 315, 1.20, t, true, { tilt: -0.1 });
            S.drawMailSnail(ctx, 340, env.catwalkY - 14, 1.18, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var env = drawCatwalkEnvironment(ctx, W, H, resolved, plates, S, B);
            drawStiltBreamActor(ctx, S, plates, 790, 282, env.catwalkY, 0.98, t, { finAng: -0.4 });
            S.drawAlienSaucer(ctx, 455, 92, 1.15, t, 435, 325);
            // Towering Martian Tripod blueprint projected in X-Ray overlay beside casual bream!
            B.drawXRayOverlay(ctx, 435, 328, 250, 285, easeOutCubic(clamp(resolved.outcomeU * 1.8, 0, 1)), function (g, cx, cy) {
              g.strokeStyle = "#67e8f9";
              g.lineWidth = 3.2;
              g.beginPath();
              g.ellipse(cx, cy - 75, 46, 26, 0, 0, TAU);
              g.moveTo(cx - 28, cy - 52); g.lineTo(cx - 72, cy + 115);
              g.moveTo(cx, cy - 48);      g.lineTo(cx + 6, cy + 118);
              g.moveTo(cx + 28, cy - 52); g.lineTo(cx + 76, cy + 115);
              g.stroke();
              g.fillStyle = "#fb7185";
              g.beginPath(); g.arc(cx, cy - 75, 9, 0, TAU); g.fill();
            }, { t: t });
          }
        }
      }
    });
  }

  // ==========================================================================
  // PORTHOLE #42 · FERRY ("queneau-rostrum" · p42.jpg + atlas-32.webp)
  // Two Brass-Pinned Cutout Elders Strung Between Twin Sycamore Roots
  // ==========================================================================

  function drawElderPuppet42(ctx, S, x, y, scale, t, opts) {
    var cfg = opts || {};
    var sc = scale || 1.0;
    var isLeft = !!cfg.isLeft;
    var vestCol = cfg.vestCol || (isLeft ? "#5c6e58" : "#787c64");
    var sleeveCol = isLeft ? "#e5e0d3" : "#9ca089";

    ctx.save();
    ctx.translate(x, y);
    if (cfg.edgeThin) ctx.scale(0.16 * sc, sc);
    else ctx.scale(sc, sc);

    // Hinged legs with Reiniger filigree brads
    var jig = cfg.jig ? Math.sin(t * 9.0 + (isLeft ? 0 : 1.6)) * 22 : 0;
    for (var l = -1; l <= 1; l += 2) {
      var lx = l * 16;
      var kx = lx + jig * 0.6;
      var ky = 62 - Math.abs(jig) * 0.4;
      var fx = lx - jig * 0.4;
      var fy = 114 - Math.abs(jig) * 0.5;
      S.drawCardboardPuppetPiece(ctx, buildLimbPoly(lx, 12, kx, ky, 11, 9.5), { tone: "#6d6f62", ribs: 1 });
      S.drawCardboardPuppetPiece(ctx, buildLimbPoly(kx, ky, fx, fy, 9.5, 7.5), { tone: "#6d6f62", ribs: 1 });
      S.drawReinigerFiligreeHinge(ctx, lx, 12, 4.8);
      S.drawReinigerFiligreeHinge(ctx, kx, ky, 4.6);
    }

    ctx.save();
    ctx.rotate(cfg.bow || 0);
    if (cfg.goldHalo) {
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 5.5;
      ctx.strokeRect(-36, -116, 72, 134);
    }
    S.drawCutoutPaperEdge(ctx, [[-31, -68], [31, -68], [27, 14], [-27, 14]], vestCol, "#14110d", { paperRim: 3.5 });

    // Articulated arms + optional staff
    var la = cfg.leftArm != null ? cfg.leftArm : (0.25 + Math.sin(t * 2.4) * 0.12);
    var ra = cfg.rightArm != null ? cfg.rightArm : (-0.25 - Math.sin(t * 2.4) * 0.12);
    var arms = [[-32, -56, la], [32, -56, ra]];
    for (var ai = 0; ai < 2; ai++) {
      var sx = arms[ai][0];
      var sy = arms[ai][1];
      var ang = arms[ai][2] + Math.PI * 0.5;
      var ex = sx + Math.cos(ang) * 38;
      var ey = sy + Math.sin(ang) * 38;
      var hx = ex + Math.cos(ang + (ai === 0 ? 0.25 : -0.25)) * 34;
      var hy = ey + Math.sin(ang + (ai === 0 ? 0.25 : -0.25)) * 34;
      S.drawCardboardPuppetPiece(ctx, buildLimbPoly(sx, sy, ex, ey, 9, 7.5), { tone: sleeveCol, ribs: 1 });
      S.drawCardboardPuppetPiece(ctx, buildLimbPoly(ex, ey, hx, hy, 7.5, 6), { tone: sleeveCol, ribs: 1 });
      S.drawReinigerFiligreeHinge(ctx, sx, sy, 4.6);
      S.drawReinigerFiligreeHinge(ctx, ex, ey, 4.4);

      if (cfg.staff && ((isLeft && ai === 1) || (!isLeft && ai === 0))) {
        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate(cfg.staffTilt || 0);
        ctx.strokeStyle = "#92400e";
        ctx.lineWidth = 5.0;
        ctx.beginPath();
        ctx.moveTo(0, -110); ctx.lineTo(0, 68);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Engraved Paper Elder Head
    S.drawCutoutPaperEdge(ctx, [[-19, -106], [0, -114], [19, -106], [21, -80], [13, -68], [-13, -68], [-21, -80]], "#e2d3be", "#14110d", { paperRim: 3.0 });
    ctx.fillStyle = "#14110d";
    ctx.beginPath();
    ctx.arc(-7, -90, 2.3, 0, TAU);
    ctx.arc(7, -90, 2.3, 0, TAU);
    ctx.fill();
    if (cfg.hat) {
      S.drawCutoutPaperEdge(ctx, [[-26, -106], [-16, -124], [16, -124], [26, -106]], "#1d596e", "#14110d", { paperRim: 2.2, shadow: false });
    }
    S.drawSplitPin(ctx, 0, -68, 3.8, { metal: "brass" });
    ctx.restore();

    ctx.restore();

    // Protruding brass split-pin prongs visible on back when turned edge-on!
    if (cfg.edgeThin) {
      for (var py = -60; py <= 60; py += 40) {
        S.drawSplitPin(ctx, x + 12, y + py * sc, 5.0, { metal: "brass" });
      }
    }
  }

  function drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, opts) {
    var cfg = opts || {};
    var t = resolved.t || 0;
    var pxFar = Math.sin(t * 0.45) * 8;
    var pxMid = Math.sin(t * 0.62) * 14;

    // Far plane: Nina Paley olive trees & bottom rosette frieze from atlas-32.webp (740×416)
    S.drawScissorCutout(ctx, plates.atlasImg, 0, 0, 192, 372, 16 + pxFar, 34, 275, 485, [[0.02, 0.02], [0.92, 0.05], [0.98, 0.48], [0.58, 0.98], [0.02, 0.96]], { haloWidth: 4.5, alpha: 0.9 });
    S.drawScissorCutout(ctx, plates.atlasImg, 534, 0, 206, 372, 988 + pxFar, 34, 276, 485, [[0.08, 0.05], [0.98, 0.02], [0.98, 0.96], [0.42, 0.98], [0.02, 0.48]], { haloWidth: 4.5, alpha: 0.9 });
    S.drawScissorCutout(ctx, plates.atlasImg, 40, 379, 660, 37, 110, 514, 1060, 46, null, { haloWidth: 3.5 });

    // Teal river channel
    S.drawTornPaperFlat(ctx, 165, 444, 950, 76, { fill: "#2f6e6d", paperColor: "#fbfaf5", deckle: 6, seed: 42.4 });
    B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.16, color: "#f8fafc" });

    // Twin Sycamore Roots/Trunks from p42.jpg (640×640)
    S.drawScissorCutout(ctx, plates.portholeImg, 112, 118, 146, 282, 142 + pxMid, 58, 214, 446, [[0.36, 0.02], [0.92, 0.02], [0.68, 0.48], [0.88, 0.96], [0.06, 0.94], [0.22, 0.48]], { haloWidth: 5.0 });
    S.drawScissorCutout(ctx, plates.portholeImg, 406, 118, 126, 336, 922 + pxMid, 58, 204, 446, [[0.08, 0.02], [0.64, 0.02], [0.84, 0.52], [0.96, 0.96], [0.24, 0.94], [0.28, 0.52]], { haloWidth: 5.0 });

    // Taut ferry guide-cord strung between the twin sycamore roots
    var cordY = cfg.cordY || 255;
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(285 + pxMid, cordY);
    ctx.quadraticCurveTo(640, cordY + 14, 985 + pxMid, cordY);
    ctx.stroke();

    // Foreground mossy boundary stone from p42.jpg + brass survey medallion patch
    var stoneX = 835 + (cfg.stoneNudge || 0);
    S.drawScissorCutout(ctx, plates.portholeImg, 366, 376, 108, 146, stoneX, 408, 138, 172, [[0.18, 0.08], [0.68, 0.02], [0.94, 0.24], [0.96, 0.96], [0.04, 0.96]], { haloWidth: 4.2 });
    S.drawReinigerFiligreeHinge(ctx, stoneX + 68, 476, 11.0, { metal: "brass" });

    return { pxMid: pxMid, cordY: cordY, stoneX: stoneX };
  }

  function registerPorthole42(B) {
    B.definePortalGame(42, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        S.drawBolasBackdrop(
          ctx, W, H,
          resolved.bolasStyle,
          42,
          resolved.t,
          { showCaptions: !resolved.blind, lamp: resolved.lampOn },
          { floor: true }
        );
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var env = drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, {});
        drawElderPuppet42(ctx, S, 520 + env.pxMid * 0.5, 326, 1.08, t, { isLeft: true, bow: Math.sin(t * 2) * 0.05 });
        drawElderPuppet42(ctx, S, 755 + env.pxMid * 0.5, 326, 1.08, t, { isLeft: false, bow: -Math.sin(t * 2) * 0.05 });
        // Scissored p42 trout gliding across channel
        S.drawScissorCutout(ctx, plates.portholeImg, 286, 252, 206, 82, 510 + Math.sin(t * 1.4) * 95, 326, 245, 96, [[0.02, 0.52], [0.22, 0.22], [0.58, 0.06], [0.98, 0.14], [0.95, 0.88], [0.42, 0.88]], { haloWidth: 4.0 });
        drawRootHotspotGlints(ctx, B, resolved);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          var env = drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, {});
          B.drawVolumetricBeam(ctx, 640, 560, 640, 220, { color: "#2563eb", coreColor: "#dbeafe", spread: 340, intensity: easeOutCubic(u), t: t });
          // Crisp dark Reiniger shadow-puppet profiles cast across both white sycamore trunks!
          ctx.save();
          ctx.globalAlpha = 0.62 * easeOutCubic(u);
          drawElderPuppet42(ctx, S, 245 + env.pxMid, 295, 1.32, t, { isLeft: true, vestCol: "#090a0f", leftArm: -0.6, rightArm: 0.5 });
          drawElderPuppet42(ctx, S, 1020 + env.pxMid, 295, 1.32, t, { isLeft: false, vestCol: "#090a0f", leftArm: -0.5, rightArm: 0.6 });
          ctx.restore();
          drawElderPuppet42(ctx, S, 520, 326, 1.08, t, { isLeft: true });
          drawElderPuppet42(ctx, S, 755, 326, 1.08, t, { isLeft: false });
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          var env = drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, {});
          var glide = lerp(-95, 115, easeOutCubic(u)) + Math.sin(t * 2.5) * 14;
          drawElderPuppet42(ctx, S, 520 + glide, 326, 1.08, t, { isLeft: true, bow: 0.08 });
          drawElderPuppet42(ctx, S, 745 + glide, 326, 1.08, t, { isLeft: false, bow: 0.08 });
          B.drawDeterministicParticles(ctx, "bubbles", 580 + glide, 455, t, { count: 18, loop: true, spreadX: 240, seed: 42.2 });
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          var env = drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, {});
          drawElderPuppet42(ctx, S, 505, 326, 1.08, t, { isLeft: true });
          drawElderPuppet42(ctx, S, 770, 326, 1.08, t, { isLeft: false });
          // Shared woven paper toll basket hanging between elders + stamped acorn token!
          S.drawCutoutPaperEdge(ctx, [[604, 348], [676, 348], [664, 396], [616, 396]], "#b45309", "#14110d", { paperRim: 2.8 });
          var sx = lerp(300, 635, easeOutCubic(u));
          B.drawSnailSilverTrail(ctx, 300, env.cordY, sx, env.cordY + 6, u, t);
          S.drawMailSnail(ctx, sx, env.cordY - 12, 1.18, t, { postcard: false });
          if (u > 0.45) {
            var ay = lerp(env.cordY + 12, 344, clamp((u - 0.45) / 0.45, 0, 1));
            S.drawCutoutPaperEdge(ctx, [[628, ay - 10], [652, ay - 10], [648, ay + 12], [632, ay + 12]], "#d97706", "#14110d", { paperRim: 2.0, shadow: false });
            S.drawCutoutPaperEdge(ctx, [[624, ay - 16], [656, ay - 16], [652, ay - 6], [628, ay - 6]], "#451a03", "#14110d", { paperRim: 1.6, shadow: false });
          }
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, {});
          var lift = lerp(0, -1.35, easeOutBack(u));
          drawElderPuppet42(ctx, S, 515, 326, 1.08, t, { isLeft: true, rightArm: lift, leftArm: 0.2 });
          drawElderPuppet42(ctx, S, 760, 326, 1.08, t, { isLeft: false, leftArm: -lift, rightArm: -0.2 });
          drawArticulatedBrassProbe(ctx, S, B, 1130, 545, 558, 290, u, t, { seed: 42.4 });
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, {});
            B.drawVolumetricBeam(ctx, 640, 560, 640, 180, { color: "#2563eb", spread: 360, intensity: 0.85, t: t });
            // Towering stern shadow elders + Turkey spilling mason jar of buttons, washers & yellow corn kernels!
            ctx.save();
            ctx.globalAlpha = 0.68;
            drawElderPuppet42(ctx, S, 250, 280, 1.42, t, { isLeft: true, vestCol: "#090a0f", hat: true });
            drawElderPuppet42(ctx, S, 1020, 280, 1.42, t, { isLeft: false, vestCol: "#090a0f", hat: true });
            ctx.restore();
            drawElderPuppet42(ctx, S, 510, 326, 1.08, t, { isLeft: true, hat: true, leftArm: 0.7, rightArm: -0.7 });
            drawElderPuppet42(ctx, S, 765, 326, 1.08, t, { isLeft: false, hat: true, leftArm: 0.7, rightArm: -0.7 });
            S.drawTurkeyInCorner(ctx, 136, 492, 1.14, t, { dispatch: 0.8 });
            // Mason jar + spilled buttons & corn kernels on shelf
            S.drawCutoutPaperEdge(ctx, [[210, 505], [265, 492], [272, 535], [214, 542]], "#bae6fd", "#14110d", { paperRim: 2.2 });
            var coinCols = ["#fde047", "#94a3b8", "#d42a1e", "#fde047", "#38bdf8"];
            for (var c = 0; c < 6; c++) {
              ctx.fillStyle = coinCols[c % 5];
              ctx.strokeStyle = "#14110d";
              ctx.lineWidth = 1.6;
              ctx.beginPath();
              ctx.arc(285 + c * 22, 532 + (c % 2) * 8, 7.5, 0, TAU);
              ctx.fill();
              ctx.stroke();
            }
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, {});
            B.drawVolumetricBeam(ctx, 320, 120, 640, 330, { color: "#60a5fa", spread: 210, intensity: 0.68, t: t });
            // Elders turned edge-on showing wafer-thin 3px laminated paper + brass brad prongs on back!
            drawElderPuppet42(ctx, S, 525, 326, 1.12, t, { isLeft: true, edgeThin: true });
            drawElderPuppet42(ctx, S, 745, 326, 1.12, t, { isLeft: false, edgeThin: true });
            S.drawBrookTrout(ctx, 635 + Math.sin(t * 4) * 35, 305, 1.22, t, false);
            S.drawMailSnail(ctx, 360, 526, 1.20, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, {});
            S.drawAlienSaucer(ctx, 640, 92, 1.16, t, false, false, { beam: false });
            // Razor-thin flat sheet beam + geometric origami paper-doll saucer hologram bowing on bark!
            ctx.fillStyle = "rgba(52, 211, 153, 0.36)";
            ctx.fillRect(634, 118, 12, 340);
            S.drawCutoutPaperEdge(ctx, [[190, 250], [250, 215], [310, 250], [275, 285], [225, 285]], "#a7f3d0", "#0f8f80", { paperRim: 3.0 });
            drawElderPuppet42(ctx, S, 520, 326, 1.10, t, { isLeft: true, goldHalo: true });
            drawElderPuppet42(ctx, S, 755, 326, 1.10, t, { isLeft: false, goldHalo: true });
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, {});
            // Both elders bowing symmetrically at brass waist-pins + Turkey tipping captain's cap!
            drawElderPuppet42(ctx, S, 455, 330, 1.10, t, { isLeft: true, bow: 0.38, hat: true, rightArm: -0.9 });
            drawElderPuppet42(ctx, S, 825, 330, 1.10, t, { isLeft: false, bow: -0.38, hat: true, leftArm: 0.9 });
            S.drawTurkeyInCorner(ctx, 138, 492, 1.15, t, { dispatch: 0.65 });
            S.drawCutoutPaperEdge(ctx, [[116, 444], [164, 434], [174, 452], [114, 458]], "#1d596e", "#14110d", { paperRim: 2.0 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, {});
            var fx = 540 + Math.sin(t * 1.5) * 110;
            var fy = 432;
            drawElderPuppet42(ctx, S, fx - 92, fy - 95, 0.96, t, { isLeft: true, staff: true });
            drawElderPuppet42(ctx, S, fx + 92, fy - 95, 0.96, t, { isLeft: false, staff: true });
            // Wooden cable-ferry hull + Brook Trout & Mail Snail commuting aboard!
            S.drawCutoutPaperEdge(ctx, [[fx - 175, fy - 10], [fx + 175, fy - 10], [fx + 145, fy + 42], [fx - 145, fy + 42]], "#8b5e34", "#14110d", { paperRim: 4.0 });
            S.drawBrookTrout(ctx, fx - 12, fy - 34, 0.98, t, false);
            S.drawMailSnail(ctx, fx + 62, fy - 24, 1.08, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, {});
            drawElderPuppet42(ctx, S, 395, 328, 1.10, t, { isLeft: true, staff: true });
            drawElderPuppet42(ctx, S, 885, 328, 1.10, t, { isLeft: false, staff: true });
            S.drawAlienSaucer(ctx, 640, 90, 1.16, t, 640, 320);
            // Shimmering aurora-green oval stargate curtain between parted elders!
            for (var ar = 3; ar >= 0; ar--) {
              ctx.strokeStyle = ar % 2 === 0 ? "#34d399" : "#a855f7";
              ctx.lineWidth = 5.0;
              ctx.beginPath();
              ctx.ellipse(640, 325, 65 + ar * 26, 115 + ar * 16, 0, 0, TAU);
              ctx.stroke();
            }
            B.drawDeterministicParticles(ctx, "bubbles", 640, 410, t, { count: 20, loop: true, spreadX: 110, color: "#6ee7b7", seed: 42.6 });
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, { cordY: 195 });
            // Weighted acorn basket raises both staffs into a welcoming arch + Turkey throttles forward!
            S.drawCutoutPaperEdge(ctx, [[606, 392], [674, 392], [664, 436], [616, 436]], "#b45309", "#14110d", { paperRim: 2.8 });
            drawElderPuppet42(ctx, S, 495, 326, 1.08, t, { isLeft: true, staff: true, staffTilt: 0.52, rightArm: -1.1 });
            drawElderPuppet42(ctx, S, 785, 326, 1.08, t, { isLeft: false, staff: true, staffTilt: -0.52, leftArm: 1.1 });
            S.drawTurkeyInCorner(ctx, 138, 492, 1.15, t, { dispatch: 0.9 });
            S.drawCardboardPuppetPiece(ctx, [[225, 535], [255, 455], [268, 460], [238, 538]], { tone: "#d4a44c", pin: { x: 231, y: 535, r: 5.0, metal: "brass" } });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var scuttle = Math.sin(t * 9.0) * 10;
            var env = drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, { stoneNudge: 16 });
            drawElderPuppet42(ctx, S, 515, 326, 1.06, t, { isLeft: true });
            drawElderPuppet42(ctx, S, 755, 326, 1.06, t, { isLeft: false });
            S.drawMailSnail(ctx, 638, 245, 1.12, t, { hasReply: true });
            // Brook Trout shining mirror-pebble beam onto cheeky red articulated crawdad at boundary stone!
            S.drawBrookTrout(ctx, 665, 425, 1.12, t, false);
            B.drawVolumetricBeam(ctx, 735, 425, env.stoneX + 105, 520, { color: "#fef08a", spread: 58, intensity: 0.85, t: t });
            var cx = env.stoneX + 125 + scuttle;
            S.drawCutoutPaperEdge(ctx, [[cx - 28, 522], [cx + 22, 514], [cx + 34, 534], [cx - 22, 540]], "#dc2626", "#14110d", { paperRim: 2.2 });
            S.drawCutoutPaperEdge(ctx, [[cx - 46, 510], [cx - 24, 502], [cx - 20, 522]], "#ef4444", "#14110d", { paperRim: 1.8, shadow: false });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, {});
            S.drawAlienSaucer(ctx, 640, 90, 1.16, t, 640, 365);
            B.drawTractorRings(ctx, 640, 118, 640, 365, t, { spread: 155, rings: 5 });
            drawElderPuppet42(ctx, S, 500, 326, 1.10, t, { isLeft: true, goldHalo: true });
            drawElderPuppet42(ctx, S, 780, 326, 1.10, t, { isLeft: false, goldHalo: true });
            S.drawCutoutPaperEdge(ctx, [[602, 355], [678, 355], [666, 404], [614, 404]], "#d97706", "#14110d", { paperRim: 3.0 });
            // 3 glowing gold star-tokens descending into basket behind Mail Snail!
            for (var st = 0; st < 3; st++) {
              var sy = 185 + ((t * 95 + st * 55) % 165);
              drawStarShape(ctx, 624 + (st - 1) * 18, sy, 14, 6, 5, "#fde047", "#14110d", t * 3 + st);
            }
            S.drawMailSnail(ctx, 415, 245, 1.16, t, { hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, {});
            drawElderPuppet42(ctx, S, 495, 326, 1.08, t, { isLeft: true, rightArm: -1.35 });
            drawElderPuppet42(ctx, S, 785, 326, 1.08, t, { isLeft: false, leftArm: 1.35 });
            // Raised striped railroad crossing gate arm swung upward + Turkey pulling whistle cord!
            ctx.save();
            ctx.translate(525, 305);
            ctx.rotate(-1.08);
            S.drawCutoutPaperEdge(ctx, [[0, -9], [260, -8], [260, 8], [0, 9]], "#fbfaf5", "#14110d", { paperRim: 2.6 });
            ctx.fillStyle = "#d42a1e";
            for (var p = 20; p < 245; p += 46) ctx.fillRect(p, -7, 22, 14);
            S.drawReinigerFiligreeHinge(ctx, 0, 0, 7.0);
            ctx.restore();
            S.drawTurkeyInCorner(ctx, 138, 492, 1.15, t, { dispatch: 0.75 });
            ctx.strokeStyle = "#d4a44c";
            ctx.lineWidth = 4.0;
            ctx.beginPath(); ctx.moveTo(192, 60); ctx.lineTo(192, 465); ctx.stroke();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, {});
            // Lively 4-armed folk dance puppet jig!
            var armWave = Math.sin(t * 9.0) * 0.75;
            drawElderPuppet42(ctx, S, 515, 316, 1.08, t, { isLeft: true, jig: true, staff: true, leftArm: -0.9 + armWave, rightArm: -0.9 - armWave });
            drawElderPuppet42(ctx, S, 765, 316, 1.08, t, { isLeft: false, jig: true, staff: true, leftArm: 0.9 + armWave, rightArm: 0.9 - armWave });
            S.drawBrookTrout(ctx, 640, 470 + Math.abs(Math.sin(t * 9)) * -14, 1.12, t, false);
            S.drawMailSnail(ctx, 355, 526, 1.18, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawFerryEnvironment(ctx, W, H, resolved, plates, S, B, {});
            drawElderPuppet42(ctx, S, 505, 326, 1.10, t, { isLeft: true, staff: true, staffTilt: 0.62, rightArm: -1.15 });
            drawElderPuppet42(ctx, S, 775, 326, 1.10, t, { isLeft: false, staff: true, staffTilt: -0.62, leftArm: 1.15 });
            S.drawAlienSaucer(ctx, 640, 88, 1.16, t, 640, 215);
            // Faceted diamond star-prism at crossed staff apex scattering compass-rose rays!
            for (var ray = 0; ray < 8; ray++) {
              var ra = (ray / 8) * TAU + t * 0.6;
              B.drawVolumetricBeam(ctx, 640, 218, 640 + Math.cos(ra) * 260, 218 + Math.sin(ra) * 180, {
                color: ray % 2 === 0 ? "#38bdf8" : "#fde047", spread: 28, intensity: 0.55, t: t
              });
            }
            drawStarShape(ctx, 640, 218, 34, 15, 4, "#e0f2fe", "#0284c7", t * 1.4);
          }
        }
      }
    });
  }

  // ==========================================================================
  // PORTHOLE #43 · SNOUT ("queneau-rostrum" · p43.jpg + atlas-30.webp)
  // SHOWSTOPPER SPOT-CHECK (#43): Crayon-Spotted Yellow Shark Nose on Glass!
  // Wes Anderson Belafonte Cutaway × Cartoon Saloon Geometric Sea Craft
  // ==========================================================================

  var SHARK_43_POLY = [
    [0.02, 0.28], [0.18, 0.44], [0.34, 0.36], [0.42, 0.04],
    [0.54, 0.30], [0.80, 0.40], [0.98, 0.62], [0.96, 0.84],
    [0.74, 0.97], [0.42, 0.96], [0.24, 0.86], [0.05, 0.95],
    [0.18, 0.72], [0.03, 0.66], [0.10, 0.48]
  ];

  function drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B) {
    var t = resolved.t || 0;
    var pxFar = Math.sin(t * 0.44) * 9;
    var pxMid = Math.sin(t * 0.62) * 15;

    // Far plane: Dramatic diagonal ship hull from atlas-30.webp (740×360)
    S.drawScissorCutout(
      ctx, plates.atlasImg, 24, 20, 692, 320,
      195 + pxFar, 68, 890, 442,
      [[0.03, 0.06], [0.52, 0.02], [0.97, 0.08], [0.95, 0.94], [0.46, 0.98], [0.02, 0.90]],
      { filter: "cyan", haloWidth: 5.0, alpha: 0.86 }
    );
    B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.18, color: "#fef9c3" });

    // Cartoon Saloon decorative geometric sea-kelp lancet pilasters framing left & right
    var cols = ["#1d596e", "#0f8f80", "#d4a44c"];
    for (var side = -1; side <= 1; side += 2) {
      var bx = side < 0 ? (28 + pxMid * 0.3) : (W - 28 + pxMid * 0.3);
      for (var k = 0; k < 4; k++) {
        var ky = 88 + k * 112;
        S.drawCutoutPaperEdge(
          ctx,
          [[bx - side * 10, ky], [bx + side * 52, ky + 36], [bx + side * 24, ky + 96], [bx - side * 14, ky + 78]],
          cols[k % 3], "#14110d", { paperRim: 3.0 }
        );
      }
    }

    // Scissored foreground kelp tuft from right side of p43.jpg (640×640)
    S.drawScissorCutout(
      ctx, plates.portholeImg, 422, 342, 108, 168,
      945 + pxMid, 358, 166, 196,
      [[0.38, 0.02], [0.88, 0.08], [0.96, 0.94], [0.06, 0.96], [0.14, 0.46]],
      { haloWidth: 4.2 }
    );

    return { pxMid: pxMid };
  }

  function drawYellowSharkShowstopper(ctx, S, plates, cx, cy, scale, t, opts) {
    var cfg = opts || {};
    var sc = scale || 1.0;
    var bob = Math.sin(t * 2.5) * 6 * sc;

    ctx.save();
    ctx.translate(cx, cy + bob);
    if (cfg.rot) ctx.rotate(cfg.rot);

    // Optional warm golden Sunfish Halo Rays behind body
    if (cfg.sunRays) {
      ctx.save();
      ctx.translate(18 * sc, 10 * sc);
      ctx.rotate(t * 0.42);
      for (var sr = 0; sr < 12; sr++) {
        ctx.save();
        ctx.rotate((sr / 12) * TAU);
        S.drawCutoutPaperEdge(ctx, [[-15 * sc, 110 * sc], [0, (sr % 2 === 0 ? 245 : 198) * sc], [15 * sc, 110 * sc]], sr % 2 === 0 ? "#f59e0b" : "#fde047", "#14110d", { paperRim: 2.2 * sc, shadow: false });
        ctx.restore();
      }
      ctx.restore();
    }

    var dw = 495 * sc;
    var dh = 382 * sc;
    var dx = -dw * 0.52;
    var dy = -dh * 0.52;

    // Articulated Secondary-Motion Tail with Brass Split-Pin
    ctx.save();
    ctx.translate(dx + dw * 0.08, dy + dh * 0.44);
    ctx.rotate(Math.sin(t * (cfg.fastTail ? 11.0 : 5.0)) * 0.24);
    S.drawCutoutPaperEdge(
      ctx,
      [[0, -14 * sc], [-78 * sc, -66 * sc], [-52 * sc, -4 * sc], [-74 * sc, 56 * sc], [0, 14 * sc]],
      "#eab308", "#14110d", { paperRim: 3.5 * sc }
    );
    S.drawSplitPin(ctx, -4 * sc, 0, 4.8 * sc, { metal: "brass" });
    ctx.restore();

    // Real Scissor-Cut Leopard-Spotted Yellow Shark Nose from p43.jpg (126,154,322,252)
    S.drawScissorCutout(
      ctx, plates.portholeImg, 126, 154, 322, 252,
      dx, dy, dw, dh, SHARK_43_POLY,
      { haloWidth: 5.5, haloColor: "#fbfaf5", stroke: "#14110d", lineWidth: 2.2 }
    );

    // 3 Tactile Ruffled Yellow Cardstock Gill Slits + Brass Rivet Seam!
    var gillX = dx + dw * 0.44;
    var gillY = dy + dh * 0.58;
    for (var gi = 0; gi < 3; gi++) {
      var gx = gillX + gi * 18 * sc;
      var openAmt = (cfg.openGill && gi === 1) ? cfg.openGill : 0;
      ctx.save();
      ctx.translate(gx, gillY);
      ctx.rotate(-openAmt * 0.85);
      S.drawCutoutPaperEdge(ctx, [[-4 * sc, -26 * sc], [8 * sc, -22 * sc], [8 * sc, 22 * sc], [-4 * sc, 26 * sc]], openAmt > 0.2 ? "#d97706" : "#facc15", "#14110d", { paperRim: 1.6 * sc, shadow: false });
      ctx.restore();
    }
    S.drawSplitPin(ctx, dx + dw * 0.36, dy + dh * 0.48, 4.4 * sc, { metal: "brass" });

    // Hinged Pectoral Fin
    ctx.save();
    ctx.translate(dx + dw * 0.33, dy + dh * 0.78);
    ctx.rotate(Math.sin(t * 4.4) * 0.18);
    S.drawCutoutPaperEdge(ctx, [[0, -10 * sc], [-82 * sc, 34 * sc], [-24 * sc, 42 * sc], [24 * sc, 12 * sc]], "#eab308", "#14110d", { paperRim: 3.0 * sc });
    S.drawSplitPin(ctx, 2 * sc, 2 * sc, 4.5 * sc, { metal: "brass" });
    ctx.restore();

    // Optional Blush Cheek Patch (o.probable toothless monster!)
    if (cfg.blush) {
      ctx.fillStyle = "rgba(249, 115, 22, 0.52)";
      ctx.beginPath();
      ctx.ellipse(dx + dw * 0.72, dy + dh * 0.68, 34 * sc, 20 * sc, -0.1, 0, TAU);
      ctx.fill();
    }

    // Optional Jiggling Teeth (o stem)
    if (cfg.jiggleTeeth) {
      ctx.save();
      ctx.translate(dx + dw * 0.68, dy + dh * 0.82 + Math.sin(t * 28) * 4);
      for (var jt = 0; jt < 5; jt++) {
        S.drawCutoutPaperEdge(ctx, [[jt * 20 * sc, 0], [(jt * 20 + 10) * sc, 18 * sc], [(jt * 20 + 20) * sc, 0]], "#fbfaf7", "#14110d", { paperRim: 1.4, shadow: false });
      }
      ctx.restore();
    }

    // Optional Accordion Trumpet Snout (o.plausible duet!)
    if (cfg.accordionSnout) {
      var stretch = 1 + Math.sin(t * 6.5) * 0.25;
      ctx.save();
      ctx.translate(dx + dw * 0.92, dy + dh * 0.66);
      for (var ac = 0; ac < 4; ac++) {
        S.drawCutoutPaperEdge(
          ctx,
          [[ac * 18 * stretch * sc, -22 * sc], [(ac + 1) * 18 * stretch * sc, -30 * sc], [(ac + 1) * 18 * stretch * sc, 30 * sc], [ac * 18 * stretch * sc, 22 * sc]],
          ac % 2 === 0 ? "#fde047" : "#eab308", "#14110d", { paperRim: 2.0, shadow: false }
        );
      }
      ctx.restore();
    }

    // Optional Purple Postmark on Yellow Nose Tip (triangle stem & outcomes!)
    if (cfg.postmark) {
      drawPictographicPostmark(ctx, S, dx + dw * 0.84, dy + dh * 0.58, 0.92 * sc, -0.18, "#7e22ce");
    }

    ctx.restore();
    return {
      noseX: cx + dw * 0.42,
      noseY: cy + bob + dh * 0.12,
      gillX: cx - dw * 0.04,
      gillY: cy + bob + dh * 0.08,
      cutX: cx + dw * 0.06,
      cutY: cy + bob - dh * 0.02
    };
  }

  function registerPorthole43(B) {
    B.definePortalGame(43, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        S.drawBolasBackdrop(
          ctx, W, H,
          resolved.bolasStyle,
          43,
          resolved.t,
          { showCaptions: !resolved.blind, lamp: resolved.lampOn },
          { floor: true }
        );
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
        var boop = Math.sin(t * 2.6) * 14;
        var rig = drawYellowSharkShowstopper(ctx, S, plates, 555 + boop, 306, 1.02, t, {});
        // Glass nose-boop concentric squeak rings + nostril bubbles
        ctx.strokeStyle = "rgba(251, 250, 245, 0.82)";
        ctx.lineWidth = 2.6;
        for (var cr = 1; cr <= 3; cr++) {
          var rp = cr * 20 + Math.max(0, boop) * 1.1;
          ctx.beginPath();
          ctx.ellipse(rig.noseX + 20, rig.noseY + 14, rp * 0.65, rp, 0, 0, TAU);
          ctx.stroke();
        }
        B.drawDeterministicParticles(ctx, "bubbles", rig.noseX - 28, rig.noseY - 8, t, { count: 8, loop: true, spreadX: 30, seed: 43.0 });
        // Curious upper-right brook trout cutout from p43.jpg
        S.drawScissorCutout(ctx, plates.portholeImg, 390, 210, 128, 66, 865, 188 + Math.sin(t * 3.4) * 7, 196, 98, null, { haloWidth: 4.0 });
        drawRootHotspotGlints(ctx, B, resolved);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
          var rig = drawYellowSharkShowstopper(ctx, S, plates, 555, 306, 1.03, t, {});
          B.drawVolumetricBeam(ctx, 160, 75, rig.cutX, rig.cutY, { color: "#2563eb", coreColor: "#dbeafe", spread: 165, intensity: easeOutCubic(u), t: t });
          // Dollhouse cross-section cutaway inside yellow shark nose revealing 3 meshing brass/paper gears!
          B.drawXRayOverlay(ctx, rig.cutX, rig.cutY, 210, 132, u, function (g, cx, cy) {
            var gearSpecs = [[-52, -8, 30, 1], [8, 12, 26, -1.2], [58, -10, 24, 1.3]];
            for (var gi = 0; gi < 3; gi++) {
              var gs = gearSpecs[gi];
              g.save();
              g.translate(cx + gs[0], cy + gs[1]);
              g.rotate(t * 3.2 * gs[3]);
              g.fillStyle = gi === 1 ? "#f3d184" : "#d4a44c";
              g.strokeStyle = "#14110d";
              g.lineWidth = 2.0;
              g.beginPath();
              for (var tooth = 0; tooth < 16; tooth++) {
                var ta = (tooth / 16) * TAU;
                var tr = (tooth % 2 === 0) ? gs[2] : (gs[2] - 7);
                if (tooth === 0) g.moveTo(Math.cos(ta) * tr, Math.sin(ta) * tr);
                else g.lineTo(Math.cos(ta) * tr, Math.sin(ta) * tr);
              }
              g.closePath();
              g.fill();
              g.stroke();
              S.drawSplitPin(g, 0, 0, 4.5, { metal: "silver" });
              g.restore();
            }
          }, { radius: 28, bg: "rgba(30, 41, 59, 0.90)", borderColor: "#60a5fa", t: t });
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
          var recoil = -42 * Math.sin(clamp(u * 1.2, 0, 1) * Math.PI * 0.65);
          var rig = drawYellowSharkShowstopper(ctx, S, plates, 555 + recoil, 306, 1.02, t, { jiggleTeeth: true });
          // Brass submarine tugboat horn bell on right blasting fat crimson ballast bubble rings!
          S.drawCutoutPaperEdge(ctx, [[1140, 295], [1005, 250], [1005, 360], [1140, 315]], "#d4a44c", "#14110d", { paperRim: 3.5 });
          for (var hr = 0; hr < 3; hr++) {
            var hu = ((t * 1.6 + hr / 3) % 1);
            var hx = lerp(1000, rig.noseX + 25, hu);
            ctx.strokeStyle = hr % 2 === 0 ? "#ef4444" : "#fbfaf5";
            ctx.lineWidth = 5.0 * (1 - hu * 0.4);
            ctx.beginPath();
            ctx.ellipse(hx, 318, 18 + hu * 26, 36 + hu * 55, 0, 0, TAU);
            ctx.stroke();
          }
          B.drawDeterministicParticles(ctx, "bubbles", rig.noseX + 40, 320, t, { count: 22, loop: true, spreadX: 160, seed: 43.2 });
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
          var stamped = u > 0.52;
          var rig = drawYellowSharkShowstopper(ctx, S, plates, 545, 306, 1.02, t, { postmark: stamped });
          var sx = lerp(340, rig.noseX - 18, easeOutCubic(u));
          var sy = lerp(510, rig.noseY - 46, easeOutCubic(u));
          B.drawSnailSilverTrail(ctx, 340, 510, sx, sy + 14, u, t);
          S.drawMailSnail(ctx, sx, sy, 1.24, t, { postcard: false });
          if (stamped) {
            B.drawDeterministicParticles(ctx, "confetti", rig.noseX - 20, rig.noseY - 10, (u - 0.52) * 1.8, { count: 14, color: "#a855f7", seed: 43.3 });
          }
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
          var openU = clamp((u - 0.25) / 0.65, 0, 1);
          var rig = drawYellowSharkShowstopper(ctx, S, plates, 550, 306, 1.02, t, { openGill: openU });
          // Hinged inspection hatch open at pinched gill!
          if (openU > 0.1) {
            S.drawCutoutPaperEdge(
              ctx,
              [[rig.gillX - 24, rig.gillY - 28], [rig.gillX + 34, rig.gillY - 28], [rig.gillX + 34, rig.gillY + 28], [rig.gillX - 24, rig.gillY + 28]],
              "#1e293b", "#d4a44c", { paperRim: 2.4 }
            );
            S.drawSplitPin(ctx, rig.gillX, rig.gillY, 5.5, { metal: "brass" });
          }
          drawArticulatedBrassProbe(ctx, S, B, 1135, 550, rig.gillX + 26, rig.gillY, u, t, { seed: 43.4 });
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
            var rig = drawYellowSharkShowstopper(ctx, S, plates, 585, 302, 1.06, t, {});
            B.drawVolumetricBeam(ctx, 145, 420, rig.cutX, rig.cutY, { color: "#3b82f6", coreColor: "#fef3c7", spread: 195, intensity: 0.85, t: t });
            // Wes Anderson Belafonte oiled-parchment cutaway galley with 2 red-beanie sea-monk chefs grinding pepper & lemon!
            ctx.save();
            var gx = rig.cutX - 135;
            var gy = rig.cutY - 78;
            var gw = 265;
            var gh = 152;
            S.drawCutoutPaperEdge(ctx, [[gx, gy], [gx + gw, gy], [gx + gw, gy + gh], [gx, gy + gh]], "#fef3c7", "#b45309", { paperRim: 4.0 });
            // Bulkhead divider & galley shelf
            ctx.strokeStyle = "#92400e";
            ctx.lineWidth = 4.0;
            ctx.beginPath();
            ctx.moveTo(gx + gw * 0.52, gy); ctx.lineTo(gx + gw * 0.52, gy + gh);
            ctx.moveTo(gx, gy + gh - 22); ctx.lineTo(gx + gw, gy + gh - 22);
            ctx.stroke();
            // Two miniature Zissou red-beanie chef puppets + wooden pepper mill + lemon slice!
            for (var ch = 0; ch < 2; ch++) {
              var cxp = gx + 58 + ch * 135;
              var cyp = gy + 96 + Math.sin(t * 7 + ch) * 3;
              S.drawCardboardPuppetPiece(ctx, [[cxp - 18, cyp - 12], [cxp + 18, cyp - 12], [cxp + 20, cyp + 32], [cxp - 20, cyp + 32]], { tone: "#38bdf8", ribs: 1 });
              S.drawCutoutPaperEdge(ctx, [[cxp - 14, cyp - 36], [cxp + 14, cyp - 36], [cxp + 14, cyp - 12], [cxp - 14, cyp - 12]], "#fed7aa", "#14110d", { paperRim: 1.5, shadow: false });
              S.drawCutoutPaperEdge(ctx, [[cxp - 16, cyp - 36], [cxp, cyp - 54], [cxp + 16, cyp - 36]], "#dc2626", "#14110d", { paperRim: 1.5, shadow: false });
            }
            // Tall wooden pepper mill & golden lemon wheel inside galley
            S.drawCardboardPuppetPiece(ctx, [[gx + 92, gy + 58], [gx + 112, gy + 58], [gx + 116, gy + 112], [gx + 88, gy + 112]], { tone: "#78350f", ribs: 2 });
            ctx.fillStyle = "#facc15";
            ctx.strokeStyle = "#14110d";
            ctx.lineWidth = 2.0;
            ctx.beginPath(); ctx.arc(gx + 225, gy + 88, 20, 0, TAU); ctx.fill(); ctx.stroke();
            // Swirling golden spice motes
            for (var sp = 0; sp < 14; sp++) {
              ctx.fillStyle = sp % 2 === 0 ? "#14110d" : "#eab308";
              ctx.beginPath();
              ctx.arc(gx + 30 + ((sp * 37 + t * 48) % 210), gy + 30 + ((sp * 29 + t * 35) % 95), 2.6, 0, TAU);
              ctx.fill();
            }
            ctx.restore();
            // Gasping Turkey clutching silver gravy ladle + fogged breath cloud on glass!
            S.drawTurkeyInCorner(ctx, 138, 492, 1.16, t, { dispatch: 0.85 });
            ctx.strokeStyle = "#e2e8f0";
            ctx.lineWidth = 5.0;
            ctx.beginPath();
            ctx.moveTo(192, 495); ctx.lineTo(235, 435);
            ctx.arc(242, 430, 14, 0, Math.PI);
            ctx.stroke();
            ctx.fillStyle = "rgba(255, 255, 255, 0.34)";
            ctx.beginPath(); ctx.ellipse(225, 470, 36 + Math.sin(t * 4) * 6, 22, -0.2, 0, TAU); ctx.fill();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
            var rig = drawYellowSharkShowstopper(ctx, S, plates, 505, 306, 1.0, t, { sunRays: true });
            B.drawLanternHalo(ctx, rig.cutX + 20, rig.cutY + 10, 175, { color: "#fbbf24", intensity: 0.95, t: t });
            // Warm glowing Sunfish Snack Counter folded open with striped awning & canned kelp snacks (0 text!)
            var sx = rig.cutX - 70;
            var sy = rig.cutY - 58;
            S.drawCutoutPaperEdge(ctx, [[sx, sy], [sx + 185, sy], [sx + 185, sy + 110], [sx, sy + 110]], "#fef9c3", "#14110d", { paperRim: 3.5 });
            for (var aw = 0; aw < 5; aw++) {
              S.drawCutoutPaperEdge(ctx, [[sx + aw * 37, sy - 22], [sx + (aw + 1) * 37, sy - 22], [sx + (aw + 1) * 37, sy + 4], [sx + aw * 37, sy + 4]], aw % 2 === 0 ? "#d42a1e" : "#fbfaf5", "#14110d", { paperRim: 1.2, shadow: false });
            }
            for (var cn = 0; cn < 3; cn++) {
              S.drawCutoutPaperEdge(ctx, [[sx + 24 + cn * 48, sy + 64], [sx + 54 + cn * 48, sy + 64], [sx + 54 + cn * 48, sy + 102], [sx + 24 + cn * 48, sy + 102]], cn === 1 ? "#15803d" : "#0284c7", "#14110d", { paperRim: 1.8, shadow: false });
            }
            // Brook Trout trading shiny silver pebbles + Mail Snail auditing menu board!
            S.drawBrookTrout(ctx, 935, 336 + Math.sin(t * 3.8) * 8, 1.24, t, true);
            S.drawMailSnail(ctx, 795, 526, 1.20, t, { hasReply: true, flip: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
            S.drawAlienSaucer(ctx, 640, 88, 1.18, t, 555, 305);
            B.drawVolumetricBeam(ctx, 640, 115, 555, 305, { color: "#ec4899", coreColor: "#fdf2f8", spread: 185, intensity: 0.88, t: t });
            var rig = drawYellowSharkShowstopper(ctx, S, plates, 555, 312, 0.98, t, {});
            // 4 Peeled glowing yellow banana skins + hovering crystalline potassium core scanning Turkey!
            var peelU = 0.65 + Math.sin(t * 3.2) * 0.14;
            for (var pl = -1; pl <= 1; pl += 2) {
              S.drawCutoutPaperEdge(
                ctx,
                [[560, 310 + pl * 36], [685, 310 + pl * 145 * peelU], [765, 310 + pl * 110 * peelU], [660, 310 + pl * 24]],
                "#fde047", "#14110d", { paperRim: 3.0 }
              );
            }
            B.drawLanternHalo(ctx, 710, 312, 88, { color: "#22d3ee", coreColor: "#ffffff", intensity: 1.2, t: t });
            drawStarShape(ctx, 710, 312, 36, 16, 6, "#67e8f9", "#0e7490", t * 3.0);
            B.drawVolumetricBeam(ctx, 710, 312, 145, 495, { color: "#34d399", spread: 95, intensity: 0.78, t: t });
            S.drawTurkeyInCorner(ctx, 138, 495, 1.12, t, { dispatch: 0.4 });
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
            // Blushing embarrassed shark nose after cardboard dentures flutter off into silt!
            var rig = drawYellowSharkShowstopper(ctx, S, plates, 535, 298, 1.02, t, { blush: true });
            var dropY = lerp(375, 525, clamp(resolved.outcomeU * 1.5, 0, 1));
            ctx.save();
            ctx.translate(715 + Math.sin(t * 5) * 18, dropY);
            ctx.rotate(Math.sin(t * 4) * 0.22);
            S.drawCutoutPaperEdge(ctx, [[-68, -14], [68, -14], [62, 18], [-62, 18]], "#fb7185", "#14110d", { paperRim: 2.5 });
            for (var dt = -52; dt <= 44; dt += 24) {
              S.drawCutoutPaperEdge(ctx, [[dt, -12], [dt + 11, -34], [dt + 22, -12]], "#fbfaf7", "#14110d", { paperRim: 1.4, shadow: false });
            }
            ctx.restore();
            // Proud Turkey puffing a huge fan of tail feathers in victory!
            for (var tf = -3; tf <= 3; tf++) {
              ctx.save();
              ctx.translate(118, 505);
              ctx.rotate(tf * 0.24 - 0.35);
              S.drawCutoutPaperEdge(ctx, [[-12, 0], [-18, -95], [18, -95], [12, 0]], tf % 2 === 0 ? "#92400e" : "#d97706", "#14110d", { paperRim: 2.0, shadow: false });
              ctx.restore();
            }
            S.drawTurkeyInCorner(ctx, 138, 495, 1.16, t, { dispatch: 0.5 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
            var rig = drawYellowSharkShowstopper(ctx, S, plates, 470, 312, 0.96, t, { accordionSnout: true, sunRays: true });
            // Rhythmic golden bubble-hoop rings + Brook Trout leaping through like circus hoops + Mail Snail waving checkered baton!
            for (var hp = 0; hp < 3; hp++) {
              var hu = ((t * 0.48 + hp / 3) % 1);
              var hx = lerp(745, 1085, hu);
              var hy = 318 - Math.sin(hu * Math.PI) * 35;
              ctx.strokeStyle = hp % 2 === 0 ? "#fde047" : "#67e8f9";
              ctx.lineWidth = 4.5;
              ctx.beginPath();
              ctx.ellipse(hx, hy, 22, 56, 0, 0, TAU);
              ctx.stroke();
            }
            var leapU = (t * 0.75) % 1;
            var leapX = lerp(1060, 770, leapU);
            var leapY = 330 - Math.sin(leapU * Math.PI) * 95;
            S.drawBrookTrout(ctx, leapX, leapY, 1.18, t, true, { tilt: (leapU - 0.5) * 0.65 });
            S.drawMailSnail(ctx, 845, 528, 1.22, t, { hasReply: true, flip: true });
            // Checkered conductor flag baton
            ctx.save();
            ctx.translate(820, 488);
            ctx.rotate(Math.sin(t * 8.0) * 0.45);
            S.drawCutoutPaperEdge(ctx, [[0, 0], [0, -44], [32, -44], [32, -20], [0, -20]], "#fbfaf7", "#14110d", { paperRim: 1.8, shadow: false });
            ctx.fillStyle = "#14110d";
            ctx.fillRect(0, -44, 16, 12);
            ctx.fillRect(16, -32, 16, 12);
            ctx.restore();
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
            S.drawAlienSaucer(ctx, 680, 92, 1.16, t, 640, 310);
            B.drawTractorRings(ctx, 680, 120, 640, 320, t, { spread: 175, rings: 5 });
            drawYellowSharkShowstopper(ctx, S, plates, 485, 316, 0.98, t, {});
            // Unlatched yellow cargo bay launching 4 winged banana-shaped scout drones!
            for (var bd = 0; bd < 4; bd++) {
              var ba = t * 2.2 + (bd / 4) * TAU;
              var bx = 785 + Math.cos(ba) * 145;
              var by = 255 + Math.sin(ba * 1.5) * 85;
              ctx.save();
              ctx.translate(bx, by);
              ctx.rotate(Math.cos(ba) * 0.35);
              S.drawCutoutPaperEdge(ctx, [[-28, 4], [-10, -14], [18, -12], [32, 8], [10, 2], [-12, 6]], "#facc15", "#14110d", { paperRim: 2.2, shadow: false });
              S.drawCutoutPaperEdge(ctx, [[-6, -10], [4, -28], [14, -8]], "#67e8f9", "#14110d", { paperRim: 1.4, shadow: false });
              ctx.restore();
            }
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
            var rig = drawYellowSharkShowstopper(ctx, S, plates, 560, 306, 1.02, t, { postmark: true });
            // Peeling kraft brown packing tape along seam + dangling corrugated novelty tag (parcel cube icon, 0 text!)
            S.drawCutoutPaperEdge(ctx, [[545, 196], [685, 228], [715, 178], [670, 248], [540, 214]], "#d9a23d", "#14110d", { paperRim: 2.2 });
            ctx.save();
            ctx.translate(rig.noseX - 10, rig.noseY + 34);
            ctx.rotate(Math.sin(t * 3.5) * 0.16);
            S.drawCutoutPaperEdge(ctx, [[-28, 0], [28, 0], [32, 64], [-32, 64]], "#e5d3b3", "#14110d", { paperRim: 2.5 });
            B.drawGeometricSymbol(ctx, "square", 0, 36, 16, "#b45309", 3.0);
            S.drawSplitPin(ctx, 0, 6, 3.6, { metal: "brass" });
            ctx.restore();
            S.drawTurkeyInCorner(ctx, 138, 492, 1.15, t, { dispatch: 0.6 });
            S.drawMailSnail(ctx, 360, 532, 1.18, t, { hasReply: false });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
            B.drawVolumetricBeam(ctx, 640, 20, 560, 320, { color: "#fde047", spread: 240, intensity: 0.55, t: t });
            drawYellowSharkShowstopper(ctx, S, plates, 535, 314, 1.0, t, { postmark: true });
            // Jaunty navy postal cap atop yellow shark head + leather saddlebags strapped across fin!
            S.drawCutoutPaperEdge(ctx, [[545, 174], [575, 136], [658, 146], [682, 188]], "#1e293b", "#14110d", { paperRim: 3.0 });
            S.drawSplitPin(ctx, 618, 158, 5.5, { metal: "brass" });
            S.drawCardboardPuppetPiece(ctx, [[430, 345], [515, 345], [525, 428], [420, 428]], { tone: "#92400e", ribs: 2, pin: { x: 472, y: 365, r: 5.0, metal: "brass" } });
            S.drawBrookTrout(ctx, 925, 325, 1.20, t, true);
            S.drawMailSnail(ctx, 760, 528, 1.22, t, { hasReply: true, flip: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
            var liftY = 304 - easeOutCubic(clamp(resolved.outcomeU * 1.4, 0, 1)) * 68 + Math.sin(t * 3.0) * 10;
            S.drawAlienSaucer(ctx, 610, 82, 1.20, t, 575, liftY);
            B.drawTractorRings(ctx, 610, 112, 575, liftY + 45, t, { spread: 215, rings: 6 });
            drawYellowSharkShowstopper(ctx, S, plates, 565, liftY, 0.94, t, { postmark: true, rot: -0.08 });
            // Glowing holographic lavender parcel twine & bow wrapped around levitating yellow shark!
            ctx.strokeStyle = "#e879f9";
            ctx.lineWidth = 5.0;
            ctx.setLineDash([12, 6]);
            ctx.beginPath();
            ctx.ellipse(575, liftY + 12, 65, 145, 0.15, 0, TAU);
            ctx.ellipse(575, liftY + 12, 210, 52, -0.08, 0, TAU);
            ctx.stroke();
            ctx.setLineDash([]);
            drawStarShape(ctx, 585, liftY - 125, 28, 12, 4, "#f0abfc", "#7e22ce", t * 2);
            S.drawMailSnail(ctx, 265, 532, 1.22, t, { hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
            var sputterX = 520 - clamp(resolved.outcomeU * 1.3, 0, 1) * 55 + Math.sin(t * 22) * 3;
            var rig = drawYellowSharkShowstopper(ctx, S, plates, sputterX, 308, 1.0, t, { openGill: 1.0, fastTail: true });
            // Giant brass wind-up key spinning furiously backward + uncoiling clockwork ribbon spring!
            ctx.save();
            ctx.translate(rig.gillX - 10, rig.gillY - 95);
            ctx.scale(Math.max(0.2, Math.abs(Math.cos(t * 14.0))), 1);
            S.drawCutoutPaperEdge(ctx, [[-44, -22], [-10, -28], [0, -8], [10, -28], [44, -22], [36, 18], [-36, 18]], "#f3d184", "#14110d", { paperRim: 3.0 });
            ctx.restore();
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 4.2;
            ctx.beginPath();
            for (var sp = 0; sp < 42; sp++) {
              var sa = sp * 0.55 - t * 8;
              var sr = 8 + sp * 2.2;
              var px = rig.gillX + 20 + Math.cos(sa) * sr;
              var py = rig.gillY + 25 + Math.sin(sa) * sr;
              if (sp === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
            drawArticulatedBrassProbe(ctx, S, B, 1140, 555, rig.gillX + 55, rig.gillY + 10, 1.0, t, { sparks: false });
            // Relieved Turkey wiping blue sweat droplet!
            S.drawTurkeyInCorner(ctx, 138, 492, 1.15, t, { dispatch: 0.7 });
            S.drawCutoutPaperEdge(ctx, [[174, 442], [184, 462], [174, 470], [164, 462]], "#38bdf8", "#14110d", { paperRim: 1.6, shadow: false });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
            var rig = drawYellowSharkShowstopper(ctx, S, plates, 515, 306, 1.0, t, { openGill: 1.0, sunRays: true });
            drawArticulatedBrassProbe(ctx, S, B, 1140, 555, rig.gillX + 18, rig.gillY - 24, 1.0, t, { sparks: false });
            // Tumbling gold & silver foil-wrapped snack wafer tins into Brook Trout's fins!
            for (var wf = 0; wf < 5; wf++) {
              var wu = ((t * 0.65 + wf * 0.2) % 1);
              var wx = lerp(rig.gillX + 12, 875, wu);
              var wy = lerp(rig.gillY + 12, 345, wu) - Math.sin(wu * Math.PI) * 55;
              S.drawCutoutPaperEdge(ctx, [[wx - 18, wy - 11], [wx + 18, wy - 11], [wx + 18, wy + 11], [wx - 18, wy + 11]], wf % 2 === 0 ? "#fde047" : "#e2e8f0", "#14110d", { paperRim: 2.0, shadow: false });
            }
            S.drawBrookTrout(ctx, 940, 342, 1.24, t, true);
            S.drawMailSnail(ctx, 760, 528, 1.20, t, { hasReply: true, flip: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var unfold = easeOutBack(clamp(resolved.outcomeU * 1.5, 0, 1));
            drawSnoutEnvironment(ctx, W, H, resolved, plates, S, B);
            S.drawAlienSaucer(ctx, 640, 88, 1.16, t, 565, 308);
            // 4 Unfolding glittering gold-foil banana-peel solar array wings + rainbow cockpit spots!
            var wingAngles = [-0.85, -0.35, 0.35, 0.85];
            for (var wi = 0; wi < 4; wi++) {
              ctx.save();
              ctx.translate(565, 308);
              ctx.rotate(wingAngles[wi] * unfold);
              S.drawCutoutPaperEdge(ctx, [[0, -18], [245 * unfold, -36], [265 * unfold, 0], [245 * unfold, 36], [0, 18]], wi % 2 === 0 ? "#facc15" : "#38bdf8", "#14110d", { paperRim: 3.0 });
              ctx.restore();
            }
            drawYellowSharkShowstopper(ctx, S, plates, 555, 312, 0.96, t, { openGill: 1.0 });
            B.drawDeterministicParticles(ctx, "confetti", 640, 310, t, { count: 18, loop: true, spreadX: 420, seed: 43.9 });
          }
        }
      }
    });
  }

  // ==========================================================================
  // PORTHOLE #44 · ROTOR ("duchamp-optic" · p44.jpg + atlas-52.webp)
  // Anémic Cinéma Eccentric Spiral Rotor Disc on Sunken A-Frame Stand
  // ==========================================================================

  function drawDuchampRotorDisc(ctx, S, plates, cx, cy, outerR, angle, opts) {
    var cfg = opts || {};
    var rings = cfg.rings || 13;
    var ecc = cfg.ecc != null ? cfg.ecc : 0.24;

    ctx.save();
    ctx.translate(cx, cy);
    if (cfg.tilt) ctx.rotate(cfg.tilt);

    // Scalloped cream paper outer rim
    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    for (var sc = 0; sc < 36; sc++) {
      var sa = angle + (sc / 36) * TAU;
      var sr = outerR + 6 + (sc % 2) * 5;
      if (sc === 0) ctx.moveTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
      else ctx.lineTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
    }
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.arc(0, 0, outerR, 0, TAU);
    ctx.clip();

    // Subtle real p44.jpg spiral plate texture under eccentric Duchamp rings
    if (plates && plates.portholeImg && plates.portholeImg.complete && plates.portholeImg.naturalWidth > 0 && !cfg.pieMode) {
      ctx.globalAlpha = 0.28;
      ctx.drawImage(plates.portholeImg, 158, 146, 324, 324, -outerR, -outerR, outerR * 2, outerR * 2);
      ctx.globalAlpha = 1.0;
    }

    var rainbow = ["#f43f5e", "#f59e0b", "#fde047", "#10b981", "#38bdf8", "#a855f7"];
    for (var i = 0; i < rings; i++) {
      var u = i / rings;
      var r = lerp(outerR, 14, u);
      var offMag = Math.sin(u * Math.PI) * outerR * ecc;
      var ox = Math.cos(u * Math.PI * 1.85) * offMag;
      var oy = Math.sin(u * Math.PI * 1.85) * offMag;
      ctx.fillStyle = cfg.rainbow
        ? rainbow[i % rainbow.length]
        : ((i % 2 === 0) ? (cfg.darkCol || "#101216") : (cfg.lightCol || "#f5f1e4"));
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, TAU);
      ctx.fill();
    }

    // Optional Diner Pie Wedges (o.plausible / square.plausible — pure vector pie icons, 0 text!)
    if (cfg.pieMode) {
      var wedgeCols = ["#fef3c7", "#dcfce7", "#fae8ff", "#fee2e2", "#fef3c7", "#dcfce7", "#f3e8ff", "#fee2e2"];
      var berryCols = ["#dc2626", "#d97706", "#7e22ce", "#0f8f80", "#dc2626", "#d97706", "#581c87", "#be123c"];
      for (var w = 0; w < 8; w++) {
        var a0 = (w / 8) * TAU;
        var a1 = ((w + 1) / 8) * TAU;
        ctx.fillStyle = wedgeCols[w];
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, outerR - 8, a0, a1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cute Pie Slice Icon inside each wedge
        ctx.save();
        ctx.rotate((a0 + a1) * 0.5);
        ctx.translate(outerR * 0.60, 0);
        ctx.fillStyle = berryCols[w];
        ctx.beginPath();
        ctx.moveTo(-22, 0); ctx.lineTo(20, -18); ctx.lineTo(20, 18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 5.0;
        ctx.beginPath(); ctx.moveTo(20, -19); ctx.lineTo(20, 19); ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(2, 0, 5.5, 0, TAU); ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();

    // 12 Brass Rim Pegs
    for (var p = 0; p < 12; p++) {
      var pa = angle + (p / 12) * TAU;
      S.drawSplitPin(ctx, Math.cos(pa) * (outerR - 6), Math.sin(pa) * (outerR - 6), 4.0, { metal: "brass" });
    }
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(0, 0, outerR, 0, TAU);
    ctx.stroke();

    ctx.restore();
  }

  function drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, hubX, hubY, standOnly) {
    var t = resolved.t || 0;
    if (!standOnly) {
      // Far plane: Centrifuge bowl shards from atlas-52.webp (355×631) + creek reeds from p44.jpg
      S.drawScissorCutout(ctx, plates.atlasImg, 10, 228, 335, 290, 92, 118, 275, 255, [[0.08, 0.14], [0.54, 0.02], [0.96, 0.18], [0.94, 0.88], [0.04, 0.84]], { filter: "mono", haloWidth: 4.0, alpha: 0.76, rot: -0.05 });
      S.drawScissorCutout(ctx, plates.atlasImg, 10, 228, 335, 290, 905, 142, 268, 248, [[0.06, 0.18], [0.58, 0.04], [0.96, 0.22], [0.92, 0.90], [0.04, 0.80]], { filter: "cyan", haloWidth: 4.0, alpha: 0.74, rot: 0.06 });
      S.drawScissorCutout(ctx, plates.portholeImg, 432, 316, 108, 178, 956, 355, 168, 220, [[0.36, 0.02], [0.88, 0.10], [0.94, 0.96], [0.06, 0.96]], { haloWidth: 4.2 });
      B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.15, color: "#93c5fd" });
    } else {
      // Foreground scissored A-Frame Trestle Stand from p44.jpg (225,282,190,248) + Brass Hub Hinge!
      S.drawScissorCutout(
        ctx, plates.portholeImg, 225, 282, 190, 248,
        hubX - 135, hubY - 22, 270, 326,
        [[0.38, 0.02], [0.62, 0.02], [0.76, 0.44], [0.96, 0.98], [0.68, 0.98], [0.56, 0.58], [0.44, 0.58], [0.32, 0.98], [0.04, 0.98], [0.24, 0.44]],
        { haloWidth: 4.5 }
      );
      S.drawReinigerFiligreeHinge(ctx, hubX, hubY, 15.0, { metal: "brass" });
    }
  }

  function registerPorthole44(B) {
    var HUB_X = 640;
    var HUB_Y = 292;
    var ROTOR_R = 200;

    B.definePortalGame(44, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        S.drawBolasBackdrop(
          ctx, W, H,
          resolved.bolasStyle,
          44,
          resolved.t,
          { showCaptions: !resolved.blind, lamp: resolved.lampOn },
          {}
        );
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
        drawDuchampRotorDisc(ctx, S, plates, HUB_X, HUB_Y, ROTOR_R, t * 2.4, {});
        drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
        S.drawScissorCutout(ctx, plates.portholeImg, 428, 208, 112, 78, 905, 232 + Math.sin(t * 3.2) * 6, 182, 116, null, { haloWidth: 4.0 });
        B.drawDeterministicParticles(ctx, "bubbles", HUB_X + 185, HUB_Y - 40, t, { count: 10, loop: true, spreadX: 80, seed: 44.0 });
        drawRootHotspotGlints(ctx, B, resolved);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          var steppedAng = Math.floor(t * 12) * 0.22;
          drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
          drawDuchampRotorDisc(ctx, S, plates, HUB_X, HUB_Y, ROTOR_R, steppedAng, { lightCol: "#dbeafe" });
          B.drawVolumetricBeam(ctx, 210, 60, HUB_X, HUB_Y, { color: "#3b82f6", coreColor: "#ffffff", spread: 215, intensity: easeOutCubic(u), t: t });
          // Popping 3D geometric cutout rings jumping forward in strobe!
          for (var rg = 0; rg < 2; rg++) {
            ctx.strokeStyle = "#60a5fa";
            ctx.lineWidth = 5.0;
            ctx.setLineDash([18, 12]);
            ctx.beginPath();
            ctx.arc(HUB_X, HUB_Y, (95 + rg * 62) * easeOutBack(u), 0, TAU);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
          drawDuchampRotorDisc(ctx, S, plates, HUB_X, HUB_Y, ROTOR_R, -t * 9.2, { ecc: 0.28 });
          drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
          // Pressurized crimson ballast wake jet blasting top-right scalloped rim!
          B.drawVolumetricBeam(ctx, 1080, 140, HUB_X + 120, HUB_Y - 140, { color: "#ef4444", coreColor: "#fee2e2", spread: 75, intensity: 0.9 * easeOutCubic(u), t: t });
          B.drawDeterministicParticles(ctx, "bubbles", HUB_X + 90, HUB_Y - 145, t, { count: 26, loop: true, spreadX: 160, seed: 44.2 });
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          var ang = t * 3.0;
          drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
          drawDuchampRotorDisc(ctx, S, plates, HUB_X, HUB_Y, ROTOR_R, ang, {});
          drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
          // Stiff red leather postal clapper glued at 12-o'clock clicking against brass pegs!
          if (u > 0.35) {
            var click = Math.max(0, Math.sin(ang * 12)) * 0.45;
            ctx.save();
            ctx.translate(HUB_X, HUB_Y - ROTOR_R - 18);
            ctx.rotate(-click);
            S.drawCutoutPaperEdge(ctx, [[-18, -16], [18, -16], [6, 36], [-6, 36]], "#d42a1e", "#fbfaf7", { paperRim: 2.8 });
            S.drawSplitPin(ctx, 0, -6, 5.0, { metal: "brass" });
            ctx.restore();
          }
          var sx = lerp(310, HUB_X - 70, easeOutCubic(u));
          var sy = lerp(495, HUB_Y - ROTOR_R - 16, easeOutCubic(u));
          B.drawSnailSilverTrail(ctx, 310, 495, sx, sy, u, t);
          S.drawMailSnail(ctx, sx, sy, 1.18, t, { postcard: false });
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = resolved.stemU;
          var brakeAng = u < 0.55 ? (t * 2.4 * (1 - u)) : (Math.sin(t * 24) * 0.04 * (1 - u * 0.5));
          drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
          drawDuchampRotorDisc(ctx, S, plates, HUB_X, HUB_Y, ROTOR_R, brakeAng, {});
          drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
          drawArticulatedBrassProbe(ctx, S, B, 1135, 550, HUB_X + 18, HUB_Y, u, t, { pinch: 0.06, seed: 44.4 });
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
            drawDuchampRotorDisc(ctx, S, plates, HUB_X, HUB_Y, ROTOR_R, Math.floor(t * 8) * 0.15, { lightCol: "#fef3c7" });
            B.drawVolumetricBeam(ctx, 160, 470, HUB_X, HUB_Y, { color: "#3b82f6", spread: 220, intensity: 0.85, t: t });
            // Floating 3D recipe emblem ring (roasting pan + sage leaf icons, 0 text!)
            for (var ic = 0; ic < 6; ic++) {
              var ia = (ic / 6) * TAU + Math.sin(t * 2) * 0.2;
              var ix = HUB_X + Math.cos(ia) * 135;
              var iy = HUB_Y + Math.sin(ia) * 135;
              if (ic % 2 === 0) {
                // Roasting pan silhouette
                S.drawCutoutPaperEdge(ctx, [[ix - 24, iy], [ix + 24, iy], [ix + 18, iy + 16], [ix - 18, iy + 16]], "#94a3b8", "#14110d", { paperRim: 2.0, shadow: false });
              } else {
                // Green sage leaf silhouette
                S.drawCutoutPaperEdge(ctx, [[ix - 18, iy], [ix, iy - 14], [ix + 18, iy], [ix, iy + 14]], "#22c55e", "#14110d", { paperRim: 2.0, shadow: false });
              }
            }
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
            // Turkey covering eyes with wings + dizzy orbiting paper stars!
            S.drawTurkeyInCorner(ctx, 138, 495, 1.15, t, { dispatch: 1.0 });
            for (var ds = 0; ds < 3; ds++) {
              var da = t * 4.2 + (ds / 3) * TAU;
              drawStarShape(ctx, 145 + Math.cos(da) * 58, 435 + Math.sin(da) * 18, 12, 5, 5, "#fde047", "#14110d", da);
            }
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
            drawDuchampRotorDisc(ctx, S, plates, HUB_X, HUB_Y, ROTOR_R, t * 2.2, { lightCol: "#e0f2fe" });
            // Translucent bubbly washing-machine drum window inside rotor tumbling colourful socks & white handkerchiefs!
            ctx.save();
            ctx.fillStyle = "rgba(186, 230, 253, 0.85)";
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 8.0;
            ctx.beginPath();
            ctx.arc(HUB_X, HUB_Y, 132, 0, TAU);
            ctx.fill();
            ctx.stroke();
            var sockCols = ["#ef4444", "#fbbf24", "#fbfaf7", "#34d399"];
            for (var sk = 0; sk < 4; sk++) {
              var sa = t * 3.5 + (sk / 4) * TAU;
              var sx = HUB_X + Math.cos(sa) * 72;
              var sy = HUB_Y + Math.sin(sa) * 72;
              ctx.save();
              ctx.translate(sx, sy);
              ctx.rotate(sa * 1.4);
              S.drawCutoutPaperEdge(ctx, [[-10, -20], [8, -20], [8, 6], [22, 6], [22, 20], [-10, 20]], sockCols[sk], "#14110d", { paperRim: 1.8, shadow: false });
              ctx.restore();
            }
            ctx.restore();
            B.drawDeterministicParticles(ctx, "bubbles", HUB_X, HUB_Y + 60, t, { count: 18, loop: true, spreadX: 160, seed: 44.5 });
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
            S.drawBrookTrout(ctx, 960, 330, 1.18, t, true);
            S.drawMailSnail(ctx, 315, 535, 1.20, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
            S.drawAlienSaucer(ctx, HUB_X, 82, 1.16, t, HUB_X, HUB_Y);
            // Deep receding striped wormhole tunnel where upside-down miniature paper fish & stars float!
            for (var wr = 8; wr >= 0; wr--) {
              var r = 24 + wr * 24;
              var shiftX = Math.sin(t * 3 + wr * 0.5) * (8 - wr) * 3;
              ctx.fillStyle = wr % 2 === 0 ? "#1e1b4b" : "#ede9fe";
              ctx.beginPath();
              ctx.arc(HUB_X + shiftX, HUB_Y, r, 0, TAU);
              ctx.fill();
            }
            ctx.save();
            ctx.translate(HUB_X, HUB_Y);
            ctx.scale(1, -1);
            S.drawBrookTrout(ctx, Math.sin(t * 2) * 35, 0, 0.58, t, false);
            ctx.restore();
            drawStarShape(ctx, HUB_X - 55, HUB_Y - 45, 11, 4, 4, "#fde047", null, t * 3);
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
            drawDuchampRotorDisc(ctx, S, plates, HUB_X, HUB_Y, ROTOR_R, -t * 7.5, {});
            // Peeling curly black licorice ink ribbons spiraling off disc!
            for (var lr = 0; lr < 4; lr++) {
              var la = -t * 4 + (lr / 4) * TAU;
              ctx.strokeStyle = "#101216";
              ctx.lineWidth = 7.0;
              ctx.beginPath();
              ctx.moveTo(HUB_X + Math.cos(la) * 185, HUB_Y + Math.sin(la) * 185);
              ctx.quadraticCurveTo(HUB_X + Math.cos(la + 0.5) * 265, HUB_Y + Math.sin(la + 0.5) * 265, HUB_X + Math.cos(la + 0.9) * 310, HUB_Y + Math.sin(la + 0.9) * 310);
              ctx.stroke();
            }
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
            // Un-hypnotized Turkey wearing a comical red rooster comb & crooked captain's hat!
            S.drawTurkeyInCorner(ctx, 138, 495, 1.15, t, { dispatch: 0.6 });
            S.drawCutoutPaperEdge(ctx, [[125, 448], [132, 422], [144, 436], [154, 418], [164, 448]], "#dc2626", "#14110d", { paperRim: 2.0, shadow: false });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var settleAng = -Math.PI * 0.62 + Math.exp(-resolved.outcomeT * 1.4) * Math.sin(t * 8) * 1.8;
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
            drawDuchampRotorDisc(ctx, S, plates, HUB_X, HUB_Y, ROTOR_R + 6, settleAng, { pieMode: true });
            // Glittering jackpot spotlight at top blackberry pie wedge!
            B.drawLanternHalo(ctx, HUB_X, HUB_Y - 125, 85, { color: "#a855f7", coreColor: "#fef08a", intensity: 1.1, t: t });
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
            // Cheering Brook Trout + Mail Snail ringing silver diner counter bell!
            S.drawBrookTrout(ctx, 965, 310 + Math.abs(Math.sin(t * 7)) * -22, 1.24, t, true);
            S.drawCutoutPaperEdge(ctx, [[320, 548], [326, 520], [364, 520], [370, 548]], "#e2e8f0", "#14110d", { paperRim: 2.4 });
            S.drawMailSnail(ctx, 275, 534, 1.20, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
            S.drawAlienSaucer(ctx, HUB_X, 82, 1.16, t, HUB_X, HUB_Y);
            B.drawTractorRings(ctx, HUB_X, 110, HUB_X, HUB_Y, t, { spread: 190, rings: 5 });
            drawDuchampRotorDisc(ctx, S, plates, HUB_X, HUB_Y, ROTOR_R, -t * 6.5, { lightCol: "#bbf7d0" });
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
            // Floating holographic cartoon thought-bubbles of tiny aliens riding tricycles!
            var tbPos = [[325, 220], [955, 225], [345, 435]];
            for (var tb = 0; tb < 3; tb++) {
              var bx = tbPos[tb][0] + Math.sin(t * 2.5 + tb) * 14;
              var by = tbPos[tb][1] + Math.cos(t * 2.8 + tb) * 10;
              ctx.fillStyle = "rgba(52, 211, 153, 0.28)";
              ctx.strokeStyle = "#6ee7b7";
              ctx.lineWidth = 2.6;
              ctx.beginPath();
              ctx.arc(bx, by, 52, 0, TAU);
              ctx.fill();
              ctx.stroke();
              // Cute geometric tricycle + green alien rider inside bubble!
              ctx.strokeStyle = "#fde047";
              ctx.lineWidth = 2.4;
              ctx.beginPath();
              ctx.arc(bx - 16, by + 16, 10, 0, TAU);
              ctx.arc(bx + 18, by + 18, 8, 0, TAU);
              ctx.moveTo(bx - 16, by + 16); ctx.lineTo(bx, by - 4); ctx.lineTo(bx + 18, by + 18);
              ctx.stroke();
              ctx.fillStyle = "#4ade80";
              ctx.beginPath(); ctx.arc(bx, by - 14, 9, 0, TAU); ctx.fill();
            }
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
            drawDuchampRotorDisc(ctx, S, plates, HUB_X, HUB_Y, ROTOR_R, t * 1.4, {});
            // Soggy damp black-and-white cardstock stripe flopping limp over top edge!
            S.drawCutoutPaperEdge(ctx, [[HUB_X - 45, HUB_Y - ROTOR_R + 10], [HUB_X + 45, HUB_Y - ROTOR_R + 10], [HUB_X + 62, HUB_Y - ROTOR_R + 82 + Math.sin(t * 3) * 8], [HUB_X - 30, HUB_Y - ROTOR_R + 76]], "#e2e8f0", "#14110d", { paperRim: 2.5 });
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
            S.drawMailSnail(ctx, HUB_X - 78, HUB_Y - ROTOR_R - 14, 1.15, t, { hasReply: false });
            // Turkey + clipboard with red [✕] crossed over spiral icon (0 text!)
            S.drawTurkeyInCorner(ctx, 138, 495, 1.15, t, { dispatch: 0.5 });
            S.drawCutoutPaperEdge(ctx, [[215, 455], [275, 455], [275, 525], [215, 525]], "#fbfaf7", "#14110d", { paperRim: 2.5 });
            B.drawGeometricSymbol(ctx, "x", 245, 490, 22, "#d42a1e", 3.6);
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            var ang = t * 3.8;
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
            drawDuchampRotorDisc(ctx, S, plates, HUB_X, HUB_Y, ROTOR_R, ang, {});
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
            // Clicking red leather pointer + Mail Snail wearing green raffle eyeshade visor!
            S.drawCutoutPaperEdge(ctx, [[HUB_X - 18, HUB_Y - ROTOR_R - 32], [HUB_X + 18, HUB_Y - ROTOR_R - 32], [HUB_X + 5, HUB_Y - ROTOR_R + 18], [HUB_X - 5, HUB_Y - ROTOR_R + 18]], "#d42a1e", "#fbfaf7", { paperRim: 2.5 });
            S.drawMailSnail(ctx, HUB_X, HUB_Y - ROTOR_R - 46, 1.16, t, { hasReply: true });
            S.drawCutoutPaperEdge(ctx, [[HUB_X + 8, HUB_Y - ROTOR_R - 58], [HUB_X + 32, HUB_Y - ROTOR_R - 52], [HUB_X + 14, HUB_Y - ROTOR_R - 46]], "#10b981", "#14110d", { paperRim: 1.2, shadow: false });
            // Fluttering colourful raffle ticket stubs caught by Brook Trout!
            B.drawDeterministicParticles(ctx, "confetti", HUB_X + 165, HUB_Y - 40, t, { count: 18, loop: true, spreadX: 140, seed: 44.7 });
            S.drawBrookTrout(ctx, 965, 325 + Math.sin(t * 5) * 12, 1.22, t, true);
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
            drawDuchampRotorDisc(ctx, S, plates, HUB_X, HUB_Y, ROTOR_R, t * 5.2, { rainbow: true });
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
            S.drawAlienSaucer(ctx, HUB_X, 76, 1.18, t, HUB_X, HUB_Y - ROTOR_R - 12);
            // Glowing saucer claw tipping pointer + shower of glittering 5-pointed star stamps!
            ctx.strokeStyle = "#34d399";
            ctx.lineWidth = 4.0;
            ctx.beginPath();
            ctx.moveTo(HUB_X, 96); ctx.lineTo(HUB_X, HUB_Y - ROTOR_R - 14);
            ctx.stroke();
            for (var st = 0; st < 12; st++) {
              var su = ((t * 0.45 + st / 12) % 1);
              var sx = 240 + ((st * 173) % 800) + Math.sin(t * 3 + st) * 22;
              var sy = lerp(110, 560, su);
              drawStarShape(ctx, sx, sy, 14, 6, 5, st % 2 === 0 ? "#fde047" : "#f472b6", "#14110d", t * 3 + st);
            }
            S.drawMailSnail(ctx, 275, 535, 1.18, t, { hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
            // Stopped flat disc hanging crookedly off-axis with zero eccentricity illusion!
            drawDuchampRotorDisc(ctx, S, plates, HUB_X + 12, HUB_Y + 16, ROTOR_R, 0.28 + Math.sin(t * 3) * 0.02, { ecc: 0.0, tilt: 0.18 });
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
            drawArticulatedBrassProbe(ctx, S, B, 1135, 550, HUB_X + 16, HUB_Y, 1.0, t, { pinch: 0.04, sparks: false });
            S.drawTurkeyInCorner(ctx, 138, 495, 1.16, t, { dispatch: 0.4 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
            drawDuchampRotorDisc(ctx, S, plates, HUB_X, HUB_Y, ROTOR_R, 0.0, { pieMode: true });
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
            drawArticulatedBrassProbe(ctx, S, B, 1140, 555, HUB_X + 18, HUB_Y, 1.0, t, { pinch: 0.04, sparks: false });
            // Hinged tin pie-pan door popped open on right rim serving steaming cherry lattice pie!
            S.drawCutoutPaperEdge(ctx, [[HUB_X + 110, HUB_Y - 36], [HUB_X + 215, HUB_Y - 36], [HUB_X + 205, HUB_Y + 26], [HUB_X + 120, HUB_Y + 26]], "#cbd5e1", "#14110d", { paperRim: 3.0 });
            S.drawCutoutPaperEdge(ctx, [[HUB_X + 122, HUB_Y - 52], [HUB_X + 202, HUB_Y - 52], [HUB_X + 210, HUB_Y - 34], [HUB_X + 114, HUB_Y - 34]], "#d97706", "#14110d", { paperRim: 2.0, shadow: false });
            S.drawBrookTrout(ctx, 985, 295, 1.20, t, true);
            S.drawMailSnail(ctx, 325, 535, 1.18, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            var t = resolved.t;
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, false);
            // Rotor locked completely solid at 0.0 rad by brass caliper while Alien Saucer spins wildly like a top!
            drawDuchampRotorDisc(ctx, S, plates, HUB_X, HUB_Y, ROTOR_R, 0.0, {});
            drawRotorFrameAndStand(ctx, W, H, resolved, plates, S, B, HUB_X, HUB_Y, true);
            drawArticulatedBrassProbe(ctx, S, B, 1135, 550, HUB_X + 16, HUB_Y, 1.0, t, { pinch: 0.03, seed: 44.9 });
            B.drawTractorRings(ctx, HUB_X, 115, HUB_X, HUB_Y, t * 2.5, { spread: 165, rings: 6 });
            ctx.save();
            var orbitX = HUB_X + Math.cos(t * 8.5) * 48;
            var orbitY = 96 + Math.sin(t * 8.5) * 16;
            ctx.translate(orbitX, orbitY);
            ctx.rotate(Math.sin(t * 12.0) * 0.42);
            ctx.scale(Math.cos(t * 9.0), 1);
            S.drawAlienSaucer(ctx, 0, 0, 1.16, t, false, false, { beam: false });
            ctx.restore();
            B.drawDeterministicParticles(ctx, "kintsugi", HUB_X, 96, t, { count: 16, loop: true, spreadX: 160, seed: 44.95 });
          }
        }
      }
    });
  }

  // ---------- Register All 5 Pod 4B Porthole Games (#40–#44) ----------

  function initPod4B() {
    var B = getEngine();
    var S = getStage();
    if (S && typeof S.preloadPortalPlates === "function") {
      S.preloadPortalPlates(PORTAL_IDS);
    }
    if (!B || typeof B.definePortalGame !== "function") return false;
    registerPorthole40(B);
    registerPorthole41(B);
    registerPorthole42(B);
    registerPorthole43(B);
    registerPorthole44(B);
    return true;
  }

  initPod4B();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { initPod4B: initPod4B, ids: PORTAL_IDS };
  }
})(typeof window !== "undefined" ? window : globalThis);
