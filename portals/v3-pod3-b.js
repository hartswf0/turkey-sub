/* ============================================================================
 * Turkey Sub · V3 Interactive 12-Branch Porthole Cinema — Pod 3 Slice B (#29–#33)
 * File: portals/v3-pod3-b.js  (window.PORTAL_V3_GAMES[29..33])
 *
 * 18.0s Deterministic Showcase + Live 2-Stage PlayStation (✕ · ○ · △ · □) Rig:
 *   - #29 · Deck     ("queneau-rostrum"    · p29.jpg + atlas-20.webp)
 *   - #30 · Top      ("queneau-rostrum"    · p30.jpg + atlas-43.webp)
 *   - #31 · Galley B ("queneau-rostrum"    · p31.jpg + atlas-11.webp)
 *   - #32 · Beak Arm ("cardboard-parallax" · p32.jpg + atlas-40.webp)
 *   - #33 · Salon    ("daumier-litho"      · p33.jpg + atlas-13.webp)
 *
 * STRICT PAELEO BLIND-MODE INVARIANT:
 *   - ZERO ctx.fillText / ctx.strokeText calls anywhere in this file!
 *   - All vowel filaments (#30), stamps, gauges, cue cards, and music notes are
 *     100% pure geometric vector paths, and baked plate text ("375°F" on #31,
 *     "AEIOUY" on #30, tiny plaque on atlas-11) is cleanly cropped out or covered
 *     by riveted cardboard/brass hardware.
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  root.PORTAL_V3_GAMES = root.PORTAL_V3_GAMES || {};

  if (root.SCION_STAGE && typeof root.SCION_STAGE.preloadPortalPlates === "function") {
    root.SCION_STAGE.preloadPortalPlates([29, 30, 31, 32, 33]);
  }

  function getBG() {
    return root.BRANCH_GAME;
  }

  // ---------- Shared Tactile Cutout, Puppet & Prop Primitives (0 Text!) ----------

  function parallaxOffset(depth, t, ampX, ampY) {
    return {
      x: Math.sin(t * 0.58 + depth * 1.3) * (ampX || 16) * depth,
      y: Math.cos(t * 0.46 + depth * 0.9) * (ampY || 7) * depth
    };
  }

  function stemProgress(resolved) {
    var BG = getBG();
    var u = resolved && typeof resolved.stemU === "number" ? resolved.stemU : 1;
    return BG.clamp(u / 0.38, 0, 1);
  }

  function outcomeEnter(resolved) {
    var BG = getBG();
    var ot = resolved && typeof resolved.outcomeT === "number" ? resolved.outcomeT : 1.5;
    return BG.easeOutBack(BG.clamp(ot / 0.48, 0, 1));
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
    if (cfg.pinStart) S.drawSplitPin(ctx, x1, y1, cfg.pinR || 4.6, { metal: cfg.metal || "brass" });
    if (cfg.pinEnd) S.drawSplitPin(ctx, x2, y2, cfg.pinR || 4.6, { metal: cfg.metalEnd || "silver" });
  }

  function drawIKBrassTongs(ctx, S, BG, baseX, baseY, targetX, targetY, t, opts) {
    var cfg = opts || {};
    var reachU = cfg.reach != null ? cfg.reach : 1.0;
    var tx = BG.lerp(baseX, targetX, reachU);
    var ty = BG.lerp(baseY, targetY, reachU);
    var l1 = cfg.l1 || 235;
    var l2 = cfg.l2 || 225;
    var ik = S.solveIK2(baseX, baseY, l1, l2, tx, ty, cfg.bendDir || -1);

    drawLinkageBar(ctx, S, ik.x0, ik.y0, ik.jx, ik.jy, cfg.w1 || 13, cfg.tone1 || "#b88a3c", {
      pinStart: true,
      pinEnd: true,
      metal: "brass"
    });
    drawLinkageBar(ctx, S, ik.jx, ik.jy, ik.ex, ik.ey, cfg.w2 || 10.5, cfg.tone2 || "#d4a44c", {
      pinStart: true,
      pinEnd: true,
      metal: "brass",
      metalEnd: "silver"
    });

    var ang = Math.atan2(ik.ey - ik.jy, ik.ex - ik.jx);
    var pinch = cfg.pinch != null ? cfg.pinch : (0.16 + Math.abs(Math.sin(t * 5.2)) * 0.18);

    ctx.save();
    ctx.translate(ik.ex, ik.ey);
    ctx.rotate(ang);
    ctx.save();
    ctx.rotate(-pinch);
    S.drawCardboardPuppetPiece(ctx, [
      [-4, -8], [36, -24], [64, -8], [52, 2], [32, -6], [6, 2]
    ], { tone: "#e2b659", ribs: 1, shadow: false });
    ctx.restore();
    ctx.save();
    ctx.rotate(pinch);
    S.drawCardboardPuppetPiece(ctx, [
      [-4, 8], [36, 24], [64, 8], [52, -2], [32, 6], [6, -2]
    ], { tone: "#c7963b", ribs: 1, shadow: false });
    ctx.restore();
    S.drawReinigerFiligreeHinge(ctx, 0, 0, 8.5, { metal: "brass" });
    ctx.restore();

    if (cfg.sparks) {
      BG.drawDeterministicParticles(ctx, "brass_sparks", ik.ex + Math.cos(ang) * 44, ik.ey + Math.sin(ang) * 44, t, {
        loop: true,
        count: cfg.sparkCount || 12,
        seed: cfg.seed || 41.7
      });
    }
    return ik;
  }

  function drawHotspotShimmer(ctx, BG, resolved) {
    var tree = resolved.tree;
    if (!tree || !tree.buttons) return;
    var t = resolved.t || 0;
    var keys = ["x", "o", "triangle", "square"];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (resolved.phase !== "root" && resolved.selectedButton !== k) continue;
      var btn = tree.buttons[k];
      if (!btn || !btn.anchor) continue;
      var ax = btn.anchor.x;
      var ay = btn.anchor.y;
      var pulse = 0.5 + 0.5 * Math.sin(t * 4.4 + i * 1.5);
      var rad = resolved.phase === "root" ? (18 + pulse * 7) : (26 + pulse * 9);

      ctx.save();
      ctx.strokeStyle = BG.rgba(btn.color || "#fbbf24", resolved.phase === "root" ? 0.46 : 0.72);
      ctx.lineWidth = 2.2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(ax, ay, rad, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = BG.rgba("#fffbeb", 0.55 + pulse * 0.35);
      ctx.beginPath();
      ctx.arc(ax, ay, 3.8, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawStarPoly(ctx, S, x, y, rOuter, rInner, points, rot, fillCol, strokeCol, rim) {
    var pts = [];
    var n = (points || 5) * 2;
    for (var i = 0; i < n; i++) {
      var r = i % 2 === 0 ? rOuter : rInner;
      var a = (i / n) * TAU - Math.PI * 0.5 + (rot || 0);
      pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
    }
    S.drawCutoutPaperEdge(ctx, pts, fillCol || "#fbbf24", strokeCol || "#14110d", {
      paperRim: rim != null ? rim : 2.2,
      shadow: false
    });
  }

  function drawPostmarkSeal(ctx, x, y, r, color, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.18);
    ctx.strokeStyle = color || "#0f8f80";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, TAU);
    ctx.stroke();
    // Wavy postal cancellation lines (0 text!)
    for (var w = -1; w <= 1; w++) {
      ctx.beginPath();
      for (var sx = 0; sx <= 34; sx += 5) {
        var wy = w * 6 + Math.sin(sx * 0.45 + (t || 0) * 4) * 2.5;
        if (sx === 0) ctx.moveTo(r * 0.85 + sx, wy);
        else ctx.lineTo(r * 0.85 + sx, wy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCutPaperEnvelope(ctx, S, x, y, sc, rot, paperCol, sealCol, openU) {
    var ou = openU || 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.scale(sc || 1, sc || 1);
    S.drawCutoutPaperEdge(ctx, [
      [-46, -28], [46, -28], [48, 28], [-48, 28]
    ], paperCol || "#fbf6e8", "#14110d", { paperRim: 2.5 });

    // Flap (curls open upward when openU > 0)
    var flapTipY = 8 - ou * 58;
    S.drawCutoutPaperEdge(ctx, [
      [-45, -27], [0, flapTipY], [45, -27]
    ], "#efe3c5", "#14110d", { paperRim: 1.5, shadow: false });

    // Wavy decorative script squiggle lines (pure sine stroke, 0 text!)
    ctx.strokeStyle = "rgba(32, 92, 180, 0.55)";
    ctx.lineWidth = 1.8;
    for (var row = 0; row < 2; row++) {
      ctx.beginPath();
      for (var ix = -28; ix <= 28; ix += 6) {
        var iy = 6 + row * 9 + Math.sin(ix * 0.55 + row) * 2.2;
        if (ix === -28) ctx.moveTo(ix, iy);
        else ctx.lineTo(ix, iy);
      }
      ctx.stroke();
    }

    ctx.fillStyle = sealCol || "#d42a1e";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, flapTipY, 6.8, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawMusicNoteCard(ctx, S, x, y, sc, rot, col) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.scale(sc || 1, sc || 1);
    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.arc(0, -2, 19, 0, TAU);
    ctx.fill();

    ctx.fillStyle = col || "#d42a1e";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(-4, 7, 6.8, 5.0, -0.35, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillRect(0.5, -14, 3.4, 21);
    ctx.beginPath();
    ctx.moveTo(2, -14);
    ctx.quadraticCurveTo(13, -10, 10, -1);
    ctx.quadraticCurveTo(7, -6, 2, -8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawMinnowPuppet(ctx, S, x, y, sc, rot, t, opts) {
    var cfg = opts || {};
    var wag = Math.sin((t || 0) * 8.5 + (cfg.phase || 0)) * 5;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.scale(sc || 1, sc || 1);
    S.drawCutoutPaperEdge(ctx, [
      [22, 0], [6, -9], [-12, -6], [-24, -12 + wag], [-18, wag * 0.4], [-24, 12 + wag], [-12, 6], [6, 9]
    ], cfg.fill || "#d8e2dc", "#14110d", { paperRim: 2.2, shadow: false });

    if (cfg.cucumber) {
      ctx.fillStyle = "#84cc16";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(11, -2, 5.2, 0, TAU);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = "#14110d";
      ctx.beginPath();
      ctx.arc(12, -2, 2.2, 0, TAU);
      ctx.fill();
    }

    if (cfg.backpack) {
      S.drawCutoutPaperEdge(ctx, [[-8, -15], [5, -15], [7, -4], [-6, -4]], "#15803d", "#14110d", {
        paperRim: 1.4,
        shadow: false
      });
    }
    ctx.restore();
  }

  function drawPaperBubble(ctx, x, y, r, tint) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.arc(0, 0, r + 2.0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = tint || "rgba(198, 238, 232, 0.78)";
    ctx.strokeStyle = "#181613";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-r * 0.34, -r * 0.34, Math.max(1.4, r * 0.26), 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // Pure geometric vector vowel glyph (A E I O U Y) — ZERO fillText/strokeText!
  function drawVectorVowelFilament(ctx, idx, r, glowCol, coreCol) {
    var s = r * 0.46;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (var pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass === 0 ? glowCol : coreCol;
      ctx.lineWidth = pass === 0 ? 7.6 : 3.4;
      ctx.beginPath();
      if (idx === 0) {
        ctx.moveTo(-s * 0.72, s * 0.85);
        ctx.lineTo(0, -s * 0.88);
        ctx.lineTo(s * 0.72, s * 0.85);
        ctx.moveTo(-s * 0.44, s * 0.22);
        ctx.lineTo(s * 0.44, s * 0.22);
      } else if (idx === 1) {
        ctx.moveTo(s * 0.58, -s * 0.82);
        ctx.lineTo(-s * 0.56, -s * 0.82);
        ctx.lineTo(-s * 0.56, s * 0.82);
        ctx.lineTo(s * 0.58, s * 0.82);
        ctx.moveTo(-s * 0.56, 0);
        ctx.lineTo(s * 0.38, 0);
      } else if (idx === 2) {
        ctx.moveTo(-s * 0.36, -s * 0.82);
        ctx.lineTo(s * 0.36, -s * 0.82);
        ctx.moveTo(0, -s * 0.82);
        ctx.lineTo(0, s * 0.82);
        ctx.moveTo(-s * 0.36, s * 0.82);
        ctx.lineTo(s * 0.36, s * 0.82);
      } else if (idx === 3) {
        ctx.ellipse(0, 0, s * 0.66, s * 0.84, 0, 0, TAU);
      } else if (idx === 4) {
        ctx.moveTo(-s * 0.62, -s * 0.84);
        ctx.lineTo(-s * 0.62, s * 0.22);
        ctx.arc(0, s * 0.22, s * 0.62, Math.PI, 0, true);
        ctx.lineTo(s * 0.62, -s * 0.84);
      } else {
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

  function drawGoldenVowelOrb(ctx, S, x, y, r, vowelIdx, opts) {
    var cfg = opts || {};
    var sx = cfg.squashX || 1;
    var sy = cfg.squashY || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);

    var haloCol = cfg.haloColor || "rgba(255, 236, 145, 0.82)";
    var og = ctx.createRadialGradient(0, 0, 8, 0, 0, r * 1.55);
    og.addColorStop(0.0, haloCol);
    og.addColorStop(0.65, cfg.midHalo || "rgba(245, 192, 66, 0.32)");
    og.addColorStop(1.0, "rgba(245, 192, 66, 0)");
    ctx.fillStyle = og;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.55, 0, TAU);
    ctx.fill();

    ctx.fillStyle = cfg.bodyFill || "rgba(38, 58, 56, 0.82)";
    ctx.strokeStyle = cfg.rimColor || "#f7dd8c";
    ctx.lineWidth = 4.4;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, 0, r + 2.4, 0, TAU);
    ctx.stroke();

    drawVectorVowelFilament(
      ctx,
      vowelIdx,
      r,
      cfg.filamentGlow || "rgba(255, 224, 112, 0.78)",
      cfg.filamentCore || "#fffbe6"
    );

    ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(0, 0, r - 8, -Math.PI * 0.78, -Math.PI * 0.34);
    ctx.stroke();
    ctx.restore();
  }

  // ============================================================================
  // PORTHOLE #29 · DECK ("queneau-rostrum" · p29.jpg + atlas-20.webp)
  // Root: An open sunken family photo album
  // ============================================================================
  (function registerPortal29() {
    var BG = getBG();
    if (!BG) return;

    function drawOpenAlbumProp(ctx, S, plates, x, y, t, opts) {
      var cfg = opts || {};
      var pImg = plates.portholeImg;
      var aImg = plates.atlasImg;

      // Scissor-cut open leather family photo album from p29.jpg (640x640)
      S.drawScissorCutout(
        ctx, pImg,
        182, 285, 270, 198,
        x - 215, y - 108, 430, 232,
        [[0.08, 0.34], [0.38, 0.06], [0.68, 0.06], [0.95, 0.36], [0.98, 0.78], [0.52, 0.96], [0.04, 0.82]],
        { filter: cfg.filter || "none", haloWidth: 5.0, seed: 2901 }
      );

      // Articulated turning page(s) on brass split-pin spine
      var speed = cfg.flipSpeed || 0.75;
      var pageCount = cfg.riffle ? 4 : 1;
      for (var p = 0; p < pageCount; p++) {
        var flipU = ((t * speed + p * 0.23) % 1 + 1) % 1;
        var pageScaleX = Math.cos(flipU * Math.PI);
        ctx.save();
        ctx.translate(x, y + 6);
        ctx.scale(pageScaleX, 1);
        S.drawCutoutPaperEdge(
          ctx,
          [[0, -82], [136, -104 - p * 4], [148, -10], [0, 14]],
          cfg.uvGlow ? "#dbeafe" : "#efe4c6",
          "#2a2117",
          { paperRim: 2.2, shadow: false }
        );
        if (cfg.uvGlow) {
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2.2;
          ctx.strokeRect(24, -74, 88, 56);
        }
        ctx.restore();
      }
      S.drawSplitPin(ctx, x, y + 8, 5.2, { metal: "brass" });

      if (cfg.floatingCards !== false) {
        var cards = [
          { img: pImg, sx: 238, sy: 224, sw: 86, sh: 76, bx: 415, by: 268, w: 132, h: 108, ph: 0.2 },
          { img: pImg, sx: 344, sy: 174, sw: 112, sh: 96, bx: 855, by: 276, w: 148, h: 118, ph: 1.6 },
          { img: pImg, sx: 304, sy: 106, sw: 132, sh: 108, bx: 430, by: 452, w: 136, h: 108, ph: 3.0 },
          { img: pImg, sx: 274, sy: 276, sw: 94, sh: 82, bx: 845, by: 448, w: 138, h: 112, ph: 4.3 }
        ];
        var gust = cfg.gust || 1.0;
        for (var i = 0; i < cards.length; i++) {
          if (cfg.skipCard === i) continue;
          var c = cards[i];
          var fx = c.bx - c.w * 0.5 + Math.cos(t * 1.6 * gust + c.ph) * (12 * gust);
          var fy = c.by - c.h * 0.5 + Math.sin(t * 2.0 * gust + c.ph) * (13 * gust);
          var frot = Math.sin(t * 1.8 * gust + c.ph) * (0.13 * gust) + (i % 2 === 0 ? -0.08 : 0.09);
          S.drawScissorCutout(
            ctx, c.img,
            c.sx, c.sy, c.sw, c.sh,
            fx, fy, c.w, c.h,
            [[0.03, 0.04], [0.97, 0.03], [0.96, 0.96], [0.04, 0.97]],
            { filter: cfg.cardFilter || "sepia", haloWidth: 4.8, rot: frot, seed: 2910 + i }
          );
        }
      }
    }

    BG.definePortalGame(29, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var pFar = parallaxOffset(0.24, t, 18, 7);
        var pNear = parallaxOffset(0.75, t, 20, 8);
        var aImg = plates.atlasImg; // atlas-20.webp (740x416)
        var pImg = plates.portholeImg; // p29.jpg (640x640)

        var isAlien = resolved.selectedTier === "preposterous";
        S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 29, t, resolved, {
          paperTop: isAlien ? "#d7d3e8" : "#fae194",
          paperBot: isAlien ? "#b5add2" : "#eed07c",
          floorColor: "#273b19"
        });
        // Extend mossy deck-timber ledge to bottom of 720p canvas for blind mode
        S.drawTornPaperFlat(ctx, -20, 622, W + 40, 118, {
          fill: "#1f3014",
          paperColor: "#efe8d8",
          deckle: 5,
          shadow: false,
          seed: 29.8
        });

        // Multiplane Ellis Island casement window & portrait flat from atlas-20.webp (740x416)
        S.drawScissorCutout(
          ctx, aImg,
          8, 8, 142, 396,
          64 + pFar.x, 42 + pFar.y, 198, 442,
          [[0.04, 0.03], [0.95, 0.04], [0.96, 0.96], [0.05, 0.95]],
          { filter: "sepia", haloWidth: 4.5, alpha: 0.86, seed: 2902 }
        );
        S.drawTornPaperFlat(ctx, 1004 - pFar.x, 58 + pFar.y, 202, 446, {
          fill: "#384d26",
          paperColor: "#f3ede0",
          deckle: 7.5,
          seed: 29.3
        });
        S.drawScissorCutout(
          ctx, aImg,
          588, 10, 144, 392,
          1028 - pFar.x, 82 + pFar.y, 154, 386,
          null,
          { filter: "sepia", haloWidth: 3.8, alpha: 0.78, seed: 2903 }
        );

        // Creek mossy stones & weeds left/right from p29.jpg
        S.drawScissorCutout(
          ctx, pImg,
          102, 228, 96, 215,
          178 + pNear.x, 318 + pNear.y, 152, 244,
          [[0.10, 0.05], [0.85, 0.12], [0.95, 0.94], [0.06, 0.96]],
          { haloWidth: 4.2, seed: 2904 }
        );
        S.drawScissorCutout(
          ctx, pImg,
          442, 336, 96, 175,
          938 + pNear.x, 344 + pNear.y, 154, 224,
          [[0.12, 0.08], [0.90, 0.05], [0.95, 0.95], [0.08, 0.95]],
          { haloWidth: 4.2, seed: 2905 }
        );

        BG.drawWaterCaustics(ctx, W, H, t, { intensity: 0.20, color: "#fffbeb" });
        BG.drawDepthFog(ctx, W, H, t, { density: 0.12, color: isAlien ? "#c4b5fd" : "#fef3c7" });
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawOpenAlbumProp(ctx, S, plates, 610, 455, t, { flipSpeed: 0.65 });
        S.drawBrookTrout(ctx, 1010 + Math.sin(t * 1.7) * 12, 355 + Math.cos(t * 2.1) * 8, 1.08, t, false);
        S.drawTurkeyInCorner(ctx, 138, 505, 0.96, t, { dispatch: 0.1 });
        drawHotspotShimmer(ctx, BG, resolved);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawOpenAlbumProp(ctx, S, plates, 610, 455, t, { uvGlow: true, cardFilter: "cyan", flipSpeed: 0.5 });

          BG.drawVolumetricBeam(ctx, 175, 560, 565 + Math.sin(t * 2.4) * 55, 415, {
            intensity: 1.25 * u,
            color: "#3b82f6",
            coreColor: "#bae6fd",
            spread: 175,
            t: t
          });
          BG.drawLanternHalo(ctx, 415, 270, 125 * u, { color: "#60a5fa", coreColor: "#e0f2fe", t: t });

          // UV X-Ray silver-halide ghost portrait & glowing script lines
          BG.drawXRayOverlay(ctx, 455, 295, 235, 165, u, function (c, cx, cy, rw, rh) {
            S.drawScissorCutout(c, plates.atlasImg, 165, 12, 410, 390, cx - 72, cy - 66, 144, 118, null, {
              filter: "cyan",
              haloWidth: 2.5,
              shadow: false
            });
            c.strokeStyle = "#67e8f9";
            c.lineWidth = 2.4;
            c.beginPath();
            for (var sx = -85; sx <= 85; sx += 8) {
              var sy = cy + 58 + Math.sin(sx * 0.25 + t * 6) * 4;
              if (sx === -85) c.moveTo(cx + sx, sy);
              else c.lineTo(cx + sx, sy);
            }
            c.stroke();
          }, { t: t, borderColor: "#38bdf8" });
          drawHotspotShimmer(ctx, BG, resolved);
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          var jolt = BG.springImpulse(resolved.stemT || 0.4, 0.02, 14, 3.8) * 18;

          // Crimson ballast jet nozzle & roaring bubble stream
          drawLinkageBar(ctx, S, 96, 330, 215, 305, 16, "#b91c1c", { pinStart: true, pinEnd: true });
          BG.drawVolumetricBeam(ctx, 220, 304, 855, 280, {
            intensity: 0.85 * u,
            color: "#f87171",
            coreColor: "#fee2e2",
            spread: 135,
            t: t
          });
          drawOpenAlbumProp(ctx, S, plates, 610 + jolt, 455, t, { riffle: true, flipSpeed: 3.4, gust: 2.4 });
          BG.drawDeterministicParticles(ctx, "bubbles", 560, 385, t, {
            loop: true,
            count: 28,
            spreadX: 280,
            seed: 292.1
          });
          drawHotspotShimmer(ctx, BG, resolved);
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawOpenAlbumProp(ctx, S, plates, 640, 455, t, { skipCard: 2 });

          // Enlarged drifting portrait at (430, 470) with golden corner mounts & snail postmark!
          ctx.save();
          ctx.translate(430, 455);
          S.drawScissorCutout(ctx, plates.portholeImg, 304, 106, 132, 108, -92, -74, 184, 148, null, {
            filter: "sepia",
            haloWidth: 5.5,
            seed: 2931
          });
          // 4 golden photo corner mounts
          var corners = [[-86, -68, 1, 1], [86, -68, -1, 1], [-86, 68, 1, -1], [86, 68, -1, -1]];
          for (var ci = 0; ci < 4; ci++) {
            var cm = corners[ci];
            S.drawCutoutPaperEdge(ctx, [
              [cm[0], cm[1]], [cm[0] + cm[2] * 26, cm[1]], [cm[0], cm[1] + cm[3] * 26]
            ], "#f59e0b", "#14110d", { paperRim: 1.2, shadow: false });
          }
          if (u > 0.35) {
            drawPostmarkSeal(ctx, 28, 22, 26, "#d42a1e", t);
          }
          ctx.restore();

          BG.drawSnailSilverTrail(ctx, 185, 535, 385, 488, u, t, { arc: 28 });
          S.drawMailSnail(ctx, BG.lerp(185, 385, u), BG.lerp(535, 488, u) + Math.sin(t * 6) * 2.5, 1.32, t, {
            hasReply: false
          });
          drawHotspotShimmer(ctx, BG, resolved);
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawOpenAlbumProp(ctx, S, plates, 560, 465, t, { skipCard: 3 });

          // Ancestral sepia snapshot held flat against gleaming glass frame at (845, 465)
          var cardX = BG.lerp(780, 845, u);
          var cardY = BG.lerp(420, 415, u);
          ctx.save();
          ctx.translate(cardX, cardY);
          ctx.rotate(Math.sin(t * 2.5) * 0.04);
          S.drawScissorCutout(ctx, plates.atlasImg, 165, 12, 410, 390, -98, -82, 196, 164, null, {
            filter: "sepia",
            haloWidth: 6.0,
            seed: 2941
          });
          // Glass reflection sheen stripes
          ctx.strokeStyle = "rgba(255, 255, 255, 0.68)";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-68, -58);
          ctx.lineTo(-24, 52);
          ctx.moveTo(-42, -58);
          ctx.lineTo(2, 52);
          ctx.stroke();
          ctx.restore();

          drawIKBrassTongs(ctx, S, BG, 1140, 565, cardX + 42, cardY + 52, t, {
            reach: u,
            pinch: 0.08,
            sparks: true,
            seed: 294.4
          });
          drawHotspotShimmer(ctx, BG, resolved);
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Glowing Bag of Soggy Letters: UV beam curls album pages into envelopes + Turkey with magnifying loupe!
            var t = resolved.t;
            var enter = outcomeEnter(resolved);
            BG.drawVolumetricBeam(ctx, 210, 520, 660, 360, {
              intensity: 1.3,
              color: "#2563eb",
              coreColor: "#bfdbfe",
              spread: 210,
              t: t
            });

            // Tipped canvas mailbag spilling glowing UV-lit soggy envelopes
            ctx.save();
            ctx.translate(455, 455);
            ctx.rotate(0.28);
            S.drawCardboardPuppetPiece(ctx, [[-125, -72], [75, -86], [112, -26], [106, 66], [-120, 78]], {
              tone: "#8b7355",
              ribs: 3,
              pins: [[84, -58], [88, 0], [82, 48]]
            });
            ctx.restore();

            for (var i = 0; i < 8; i++) {
              var u = ((t * 0.34 + i * 0.125) % 1);
              var ex = BG.lerp(520, 1020, u);
              var ey = BG.lerp(430, 175 + (i % 3) * 88, Math.sin(u * Math.PI * 0.85));
              drawCutPaperEnvelope(ctx, S, ex, ey, 0.95, Math.sin(t * 2.5 + i) * 0.25, "#dbeafe", "#2563eb", 0.65);
            }

            // Turkey pressing beak to glass with giant brass magnifying loupe!
            S.drawTurkeyCutawayBadge(ctx, 195 * enter, 455, 1.32, t, { dispatch: 0.7 });
            drawLinkageBar(ctx, S, 245, 465, 340, 385, 8, "#b88a3c", { pinStart: true });
            drawPaperBubble(ctx, 372, 356, 46, "rgba(186, 230, 253, 0.62)");
            ctx.strokeStyle = "#d4a44c";
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.arc(372, 356, 46, 0, TAU);
            ctx.stroke();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Nosy Creek Paparazzi Flashbulb: Accordion press camera flash + glamorous Brook Trout + Snail press flag!
            var t = resolved.t;
            var flashPop = Math.max(0, Math.sin(t * 7.5));
            drawOpenAlbumProp(ctx, S, plates, 480, 470, t, { floatingCards: false, uvGlow: true });

            // Vintage accordion press camera on brass tripod
            var camX = 485, camY = 335;
            drawLinkageBar(ctx, S, camX - 12, camY + 34, camX - 78, 555, 7, "#8a6838", { pinStart: true });
            drawLinkageBar(ctx, S, camX + 12, camY + 34, camX + 78, 555, 7, "#8a6838", { pinStart: true });
            S.drawCardboardPuppetPiece(ctx, [[camX - 58, camY - 48], [camX + 26, camY - 48], [camX + 26, camY + 38], [camX - 58, camY + 38]], {
              tone: "#6e472b",
              ribs: 2
            });
            S.drawCardboardPuppetPiece(ctx, [[camX + 26, camY - 40], [camX + 94, camY - 26], [camX + 94, camY + 22], [camX + 26, camY + 32]], {
              tone: "#3c3b39",
              ribs: 4
            });
            drawPaperBubble(ctx, camX - 18, camY - 88, 36, "#e5e7eb");
            if (flashPop > 0.15) {
              drawStarPoly(ctx, S, camX - 18, camY - 88, 78 * flashPop + 26, 24, 10, t * 2, "#fef08a", "#2563eb", 2.5);
              BG.drawVolumetricBeam(ctx, camX + 96, camY - 4, 885, 345, {
                intensity: 1.4,
                color: "#60a5fa",
                coreColor: "#ffffff",
                spread: 185,
                t: t
              });
            }

            // Glamorous posing Brook Trout + Mail Snail waving checkered press-pass flag!
            S.drawBrookTrout(ctx, 885, 345 + Math.sin(t * 3.5) * 10, 1.38, t, false, { tilt: -0.14 });
            drawStarPoly(ctx, S, 815, 290, 18, 7, 4, t * 3, "#ffffff", "#38bdf8", 1.5);
            S.drawMailSnail(ctx, 720, 505, 1.26, t, { hasReply: true });
            drawLinkageBar(ctx, S, 745, 495, 765, 425, 3.5, "#14110d", { shadow: false });
            S.drawCutoutPaperEdge(ctx, [[765, 425], [825, 434], [818, 464], [762, 456]], "#34d399", "#14110d", { paperRim: 2 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Lit Time Traveler Memory Book: 3-eyed Saucer prism beam + holographic carousel of eras!
            var t = resolved.t;
            var hubX = 640, hubY = 335;
            S.drawAlienSaucer(ctx, 640, 102, 1.24, t, hubX, 465, { beamSpread: 215 });
            BG.drawTractorRings(ctx, 640, 126, hubX, 465, t, { spread: 205, rings: 6 });

            drawOpenAlbumProp(ctx, S, plates, hubX, 492, t, { floatingCards: false, uvGlow: true, filter: "cyan" });

            // Spinning holographic carousel ring
            ctx.save();
            ctx.translate(hubX, hubY);
            ctx.strokeStyle = "#a855f7";
            ctx.lineWidth = 3.2;
            ctx.setLineDash([12, 7]);
            ctx.beginPath();
            ctx.ellipse(0, 0, 235, 86, 0, 0, TAU);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            for (var i = 0; i < 4; i++) {
              var a = t * 1.15 + (i / 4) * TAU;
              var ox = hubX + Math.cos(a) * 235;
              var oy = hubY + Math.sin(a) * 86;
              if (i === 0) {
                // 1890s ancestor cutout
                S.drawScissorCutout(ctx, plates.atlasImg, 165, 12, 410, 390, ox - 52, oy - 44, 104, 88, null, {
                  filter: "cyan",
                  haloWidth: 3.8
                });
              } else if (i === 1) {
                // Dinosaur silhouette card
                S.drawCutoutPaperEdge(ctx, [[ox - 52, oy - 40], [ox + 52, oy - 40], [ox + 52, oy + 40], [ox - 52, oy + 40]], "#dcfce7", "#14110d", { paperRim: 3 });
                S.drawCardboardPuppetPiece(ctx, [
                  [ox - 34, oy + 24], [ox - 20, oy - 4], [ox + 10, oy - 4], [ox + 24, oy - 30], [ox + 36, oy - 26], [ox + 22, oy + 8], [ox + 28, oy + 24]
                ], { tone: "#15803d", ribs: 1, shadow: false });
              } else if (i === 2) {
                // Covered bridge cutout
                S.drawScissorCutout(ctx, plates.portholeImg, 344, 174, 112, 96, ox - 54, oy - 42, 108, 84, null, {
                  filter: "sepia",
                  haloWidth: 3.8
                });
              } else {
                // 2700s hover-car & star-turkey card
                S.drawCutoutPaperEdge(ctx, [[ox - 54, oy - 40], [ox + 54, oy - 40], [ox + 54, oy + 40], [ox - 54, oy + 40]], "#312e81", "#f43f5e", { paperRim: 3 });
                S.drawCutoutPaperEdge(ctx, [[ox - 38, oy + 6], [ox - 16, oy - 16], [ox + 20, oy - 16], [ox + 40, oy + 6], [ox + 24, oy + 18], [ox - 24, oy + 18]], "#fbbf24", "#14110d", { paperRim: 1.8, shadow: false });
              }
            }
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Hurricane of Unread Town Mail: Dozens of sepia cards plastered to glass + frantic Turkey sorting with sticky notes!
            var t = resolved.t;
            drawOpenAlbumProp(ctx, S, plates, 680, 480, t, { riffle: true, flipSpeed: 4.2, floatingCards: false });
            BG.drawDeterministicParticles(ctx, "bubbles", 640, 420, t, { loop: true, count: 32, spreadX: 460, seed: 295.1 });
            BG.drawDeterministicParticles(ctx, "confetti", 640, 320, t, { loop: true, count: 20, seed: 295.2 });

            // 9 sepia cutouts & soggy letters plastered across the porthole view
            for (var i = 0; i < 9; i++) {
              var ang = (i / 9) * TAU + Math.sin(t * 1.4 + i) * 0.08;
              var rad = 165 + (i % 2) * 82;
              var px = 670 + Math.cos(ang) * rad * 1.25;
              var py = 310 + Math.sin(ang) * rad * 0.72;
              if (i % 2 === 0) {
                S.drawScissorCutout(ctx, plates.portholeImg, 238, 224, 86, 76, px - 58, py - 46, 116, 92, null, {
                  filter: "sepia",
                  haloWidth: 4.2,
                  rot: Math.sin(t * 3 + i) * 0.22,
                  seed: 2950 + i
                });
              } else {
                drawCutPaperEnvelope(ctx, S, px, py, 0.92, Math.cos(t * 3 + i) * 0.28, "#fef3c7", "#d42a1e", 0.2);
              }
            }

            // Frantic Turkey sorting with yellow sticky-note paddles on IK wings!
            S.drawTurkeyCutawayBadge(ctx, 215, 445, 1.34, t, { dispatch: 0.95 });
            for (var w = 0; w < 2; w++) {
              var wx = 315 + w * 58 + Math.sin(t * 9 + w * 2) * 28;
              var wy = 395 - w * 64 + Math.cos(t * 9 + w) * 22;
              drawLinkageBar(ctx, S, 245, 445, wx, wy, 7, "#694830", { pinStart: true });
              S.drawCutoutPaperEdge(ctx, [[wx - 22, wy - 22], [wx + 22, wy - 22], [wx + 22, wy + 22], [wx - 22, wy + 22]], "#fde047", "#14110d", { paperRim: 1.8 });
            }
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Spinning Lost Picture Frame Tornado: Merry-go-round eddy + Trout leaping through empty gilt frame + Snail clipboard!
            var t = resolved.t;
            var cx = 610, cy = 330;

            // Swirling eddy rings
            ctx.save();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
            ctx.lineWidth = 3;
            ctx.setLineDash([16, 10]);
            for (var r = 1; r <= 3; r++) {
              ctx.beginPath();
              ctx.ellipse(cx, cy, r * 92, r * 54, t * 0.6, 0, TAU);
              ctx.stroke();
            }
            ctx.setLineDash([]);
            ctx.restore();

            // Orbiting snapshots
            for (var i = 0; i < 6; i++) {
              var a = t * 1.6 + (i / 6) * TAU;
              var sx = cx + Math.cos(a) * 245;
              var sy = cy + Math.sin(a) * 125;
              S.drawScissorCutout(ctx, plates.portholeImg, 344, 174, 112, 96, sx - 52, sy - 40, 104, 80, null, {
                filter: "sepia",
                haloWidth: 3.8,
                rot: a * 0.3,
                seed: 2960 + i
              });
            }

            // Ornate empty gilt picture frame at center + Brook Trout leaping right through it!
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(Math.sin(t * 2.2) * 0.08);
            ctx.strokeStyle = "#14110d";
            ctx.lineWidth = 22;
            ctx.strokeRect(-78, -94, 156, 188);
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 15;
            ctx.strokeRect(-78, -94, 156, 188);
            ctx.restore();

            var leapArc = Math.sin(t * 3.2);
            S.drawBrookTrout(ctx, cx + leapArc * 68, cy - Math.abs(leapArc) * 28, 1.24, t, true, {
              tilt: leapArc * 0.28
            });

            // Mail Snail tallying laps on waterproof clipboard
            S.drawMailSnail(ctx, 965, 498, 1.28, t, { flip: true, hasReply: true });
            S.drawCutoutPaperEdge(ctx, [[885, 435], [935, 435], [935, 495], [885, 495]], "#fef9c3", "#14110d", { paperRim: 2 });
            ctx.strokeStyle = "#0f8f80";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(895, 452); ctx.lineTo(903, 462); ctx.lineTo(922, 444);
            ctx.moveTo(895, 474); ctx.lineTo(903, 484); ctx.lineTo(922, 466);
            ctx.stroke();
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Ejected Saucer Memory Card Storm: Crimson wake braids into emerald saucer vortex sucking copper data wafers up!
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 98, 1.26, t, 640, 485, { beamSpread: 220 });
            BG.drawTractorRings(ctx, 640, 124, 640, 485, t, { spread: 210, rings: 7 });
            drawOpenAlbumProp(ctx, S, plates, 640, 505, t, { riffle: true, flipSpeed: 4.5, floatingCards: false });

            // Braided crimson & emerald vortex spirals + ascending glowing copper data wafers!
            for (var b = 0; b < 2; b++) {
              ctx.strokeStyle = b === 0 ? "rgba(212, 42, 30, 0.72)" : "rgba(16, 185, 129, 0.78)";
              ctx.lineWidth = 4.2;
              ctx.beginPath();
              for (var y = 490; y >= 135; y -= 14) {
                var u = (490 - y) / 355;
                var x = 640 + Math.sin(u * 9 - t * 5 + b * Math.PI) * BG.lerp(165, 28, u);
                if (y === 490) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.stroke();
            }

            for (var w = 0; w < 8; w++) {
              var wu = ((t * 0.48 + w / 8) % 1);
              var wy = BG.lerp(475, 138, wu);
              var wx = 640 + Math.cos(wu * 7 + w + t * 3) * BG.lerp(148, 22, wu);
              ctx.save();
              ctx.translate(wx, wy);
              ctx.rotate(wu * 4 + w);
              S.drawCutoutPaperEdge(ctx, [[-34, -24], [24, -24], [34, -14], [34, 24], [-34, 24]], "#d97706", "#14110d", {
                paperRim: 2.0,
                shadow: false
              });
              // Gold circuit traces on memory card wafer (0 text!)
              ctx.strokeStyle = "#fef08a";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(-22, -12); ctx.lineTo(14, -12); ctx.lineTo(20, 0);
              ctx.moveTo(-22, 4); ctx.lineTo(18, 4);
              ctx.stroke();
              ctx.restore();
            }
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Postmarked Bundle of Wet Letters: Stamped portrait bundle + proud saluting Turkey cranking tin mail-slot!
            var t = resolved.t;
            // Big ribbon-tied bundle of stamped sepia portraits & letters
            ctx.save();
            ctx.translate(685, 365);
            S.drawScissorCutout(ctx, plates.portholeImg, 304, 106, 132, 108, -135, -98, 270, 196, null, {
              filter: "sepia",
              haloWidth: 6.0,
              seed: 2971
            });
            // Red postal twine cross-ribbon
            ctx.strokeStyle = "#b91c1c";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(-135, 0); ctx.lineTo(135, 0);
            ctx.moveTo(0, -98); ctx.lineTo(0, 98);
            ctx.stroke();
            drawPostmarkSeal(ctx, 32, -24, 38, "#0f8f80", t);
            ctx.restore();

            S.drawMailSnail(ctx, 685, 515, 1.32, t, { hasReply: false });

            // Saluting Turkey + riveted brass tin mail-slot cranking open with bubbles!
            S.drawTurkeyCutawayBadge(ctx, 215, 415, 1.32, t, { dispatch: 0.85 });
            var flapOpen = 0.5 + 0.5 * Math.sin(t * 3.6);
            S.drawCardboardPuppetPiece(ctx, [[315, 435], [475, 435], [475, 515], [315, 515]], {
              tone: "#94a3b8",
              ribs: 2,
              pins: [[330, 450], [460, 450], [330, 500], [460, 500]]
            });
            S.drawCutoutPaperEdge(ctx, [
              [335, 458], [455, 458], [462, 458 + 28 * flapOpen + 8], [328, 458 + 28 * flapOpen + 8]
            ], "#cbd5e1", "#14110d", { paperRim: 1.8 });
            BG.drawDeterministicParticles(ctx, "bubbles", 395, 462, t, { loop: true, count: 14, seed: 297.3 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Autographed Celebrity Trout Glossy: Velvet kelp cushion + Brook Trout berry-ink star signature!
            var t = resolved.t;
            // Scalloped green velvet kelp leaf mat + glossy portrait
            S.drawCutoutPaperEdge(ctx, [
              [395, 435], [445, 245], [645, 225], [815, 265], [795, 465], [585, 490]
            ], "#15803d", "#14110d", { paperRim: 4.0 });

            S.drawScissorCutout(ctx, plates.portholeImg, 344, 174, 112, 96, 465, 262, 275, 195, null, {
              filter: "sepia",
              haloWidth: 6.0,
              seed: 2981
            });
            drawPostmarkSeal(ctx, 525, 315, 28, "#0f8f80", t);
            // Flashy berry-magenta star signature!
            drawStarPoly(ctx, S, 685, 405, 34, 13, 5, Math.sin(t * 3) * 0.2, "#db2777", "#14110d", 2.5);

            // Berry inkpot + Brook Trout dipping IK pectoral fin to sign!
            S.drawCutoutPaperEdge(ctx, [[755, 468], [805, 468], [812, 518], [748, 518]], "#831843", "#14110d", { paperRim: 2.5 });
            var tx = 955, ty = 365;
            var ikSign = S.solveIK2(tx - 42, ty + 14, 118, 112, 695 + Math.sin(t * 5) * 18, 405 + Math.cos(t * 5) * 12, 1);
            drawLinkageBar(ctx, S, ikSign.x0, ikSign.y0, ikSign.jx, ikSign.jy, 11, "#8f9c8a", { pinStart: true });
            drawLinkageBar(ctx, S, ikSign.jx, ikSign.jy, ikSign.ex, ikSign.ey, 9, "#db2777", { pinStart: true });
            S.drawBrookTrout(ctx, tx, ty, 1.28, t, false);
            S.drawMailSnail(ctx, 435, 505, 1.26, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Stamped Temporal Passport From Mars: Origami time-gate unfolding + magenta runes + Snail tipping cap!
            var t = resolved.t;
            var gx = 640, gy = 345;
            S.drawAlienSaucer(ctx, 640, 96, 1.24, t, gx, gy + 40, { beamSpread: 210 });
            BG.drawTractorRings(ctx, 640, 120, gx, gy + 60, t, { spread: 195, rings: 6 });

            // Glowing multi-faceted origami time-gate portal unfolding from the album!
            ctx.save();
            ctx.translate(gx, gy);
            for (var ring = 0; ring < 2; ring++) {
              ctx.save();
              ctx.rotate(t * (ring === 0 ? 0.9 : -1.2));
              var rad = ring === 0 ? 155 : 108;
              var pts = [];
              for (var p = 0; p < 8; p++) {
                var a = (p / 8) * TAU;
                var rr = p % 2 === 0 ? rad : rad * 0.72;
                pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
              }
              S.drawCutoutPaperEdge(ctx, pts, ring === 0 ? "#4c1d95" : "#be185d", "#f472b6", {
                paperRim: 3.0,
                shadow: false
              });
              ctx.restore();
            }
            // Inner star-warp vortex + neon magenta geometric runes (0 text!)
            BG.drawLanternHalo(ctx, 0, 0, 115, { color: "#ec4899", coreColor: "#fdf2f8", t: t });
            for (var ri = 0; ri < 6; ri++) {
              var ra = t * 1.8 + (ri / 6) * TAU;
              drawStarPoly(ctx, S, Math.cos(ra) * 72, Math.sin(ra) * 72, 14, 6, 4, ra, "#f0abfc", "#831843", 1.2);
            }
            ctx.restore();

            drawOpenAlbumProp(ctx, S, plates, gx, 512, t, { floatingCards: false, filter: "cyan" });
            S.drawMailSnail(ctx, 355, 512, 1.32, t, { hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Pinched Soggy Recipe Postcard: Portrait flush to glass + gravy swirls + upside-down Turkey in spectacles!
            var t = resolved.t;
            // Big sepia Uncle Arthur portrait held flush to porthole glass
            S.drawScissorCutout(ctx, plates.atlasImg, 165, 12, 410, 390, 515, 195, 315, 275, null, {
              filter: "sepia",
              haloWidth: 6.5,
              seed: 2991
            });
            // Bleeding gravy-colored sepia swirls
            ctx.strokeStyle = "rgba(120, 53, 15, 0.65)";
            ctx.lineWidth = 4.5;
            for (var s = 0; s < 3; s++) {
              ctx.beginPath();
              ctx.arc(595 + s * 65, 425 + Math.sin(t * 3 + s) * 8, 22, 0, Math.PI * 1.5);
              ctx.stroke();
            }

            drawIKBrassTongs(ctx, S, BG, 1120, 555, 815, 345, t, { pinch: 0.06, sparks: false });

            // Turkey tilting head upside-down wearing wire-rimmed reading spectacles!
            ctx.save();
            ctx.translate(255, 365);
            ctx.rotate(Math.PI * 0.78 + Math.sin(t * 2.5) * 0.12);
            S.drawTurkeyInCorner(ctx, 0, 0, 1.38, t, { dispatch: 0.3 });
            // Wire spectacles on beak
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.arc(8, -14, 13, 0, TAU);
            ctx.arc(30, -11, 13, 0, TAU);
            ctx.stroke();
            ctx.restore();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Framed Creek Photo Booth Strip: 3-panel photo strip + Trout lining snout behind handlebar mustache!
            var t = resolved.t;
            var sx = 595, sy = 315;

            // Vertical 3-frame cream photo-booth strip held by IK tongs
            S.drawCutoutPaperEdge(ctx, [
              [sx - 82, sy - 205], [sx + 82, sy - 205], [sx + 82, sy + 205], [sx - 82, sy + 205]
            ], "#fbfaf5", "#14110d", { paperRim: 4.0 });
            for (var f = 0; f < 3; f++) {
              var fy = sy - 185 + f * 126;
              ctx.fillStyle = f === 1 ? "rgba(186, 230, 253, 0.45)" : "#d6ccc2";
              ctx.strokeStyle = "#14110d";
              ctx.lineWidth = 2.5;
              ctx.fillRect(sx - 66, fy, 132, 108);
              ctx.strokeRect(sx - 66, fy, 132, 108);
              if (f !== 1) {
                S.drawScissorCutout(ctx, plates.portholeImg, 238, 224, 86, 76, sx - 60, fy + 6, 120, 96, null, {
                  filter: "sepia",
                  haloWidth: 0,
                  shadow: false
                });
              }
            }

            // Brook Trout photobombing behind center frame + handlebar mustache cutout!
            S.drawBrookTrout(ctx, sx + 85, sy + 5 + Math.sin(t * 4) * 6, 1.32, t, false);
            S.drawCardboardPuppetPiece(ctx, [
              [sx - 46, sy + 14], [sx - 18, sy - 4], [sx, sy + 6], [sx + 18, sy - 4], [sx + 46, sy + 14],
              [sx + 26, sy + 24], [sx, sy + 12], [sx - 26, sy + 24]
            ], { tone: "#292524", ribs: 1, shadow: false });

            drawIKBrassTongs(ctx, S, BG, 1110, 545, sx + 78, sy - 120, t, { pinch: 0.08 });
            // Giggling wobbling Mail Snail
            S.drawMailSnail(ctx, 365, 505, 1.28, t, { rot: Math.sin(t * 14) * 0.14, hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Captured Chrono Scrapbook Evidence: Saucer green laser loupe zooms onto 1912 UFO photobomb over Grandma's barn!
            var t = resolved.t;
            var px = 615, py = 365;
            S.drawAlienSaucer(ctx, 565, 98, 1.24, t, px, py - 35, { beamSpread: 185 });

            // Tong-pinched sepia barn snapshot
            S.drawScissorCutout(ctx, plates.portholeImg, 304, 106, 132, 108, px - 145, py - 115, 290, 230, null, {
              filter: "sepia",
              haloWidth: 6.0,
              seed: 2999
            });
            drawIKBrassTongs(ctx, S, BG, 1125, 555, px + 135, py + 75, t, { pinch: 0.07 });

            // Green laser zoom-loupe revealing shimmering silver-leaf miniature 1912 UFO over the barn!
            BG.drawXRayOverlay(ctx, px + 18, py - 52, 185, 128, 1.0, function (c, cx, cy) {
              S.drawScissorCutout(c, plates.portholeImg, 304, 106, 132, 108, cx - 88, cy - 32, 176, 98, null, {
                filter: "sepia",
                haloWidth: 0,
                shadow: false
              });
              // Shimmering silver-leaf 1912 tin saucer hovering above barn roof!
              var ux = cx + Math.sin(t * 5) * 18;
              var uy = cy - 30 + Math.cos(t * 6) * 5;
              S.drawCutoutPaperEdge(c, [
                [ux - 34, uy], [ux - 16, uy - 10], [ux + 16, uy - 10], [ux + 34, uy], [ux + 18, uy + 8], [ux - 18, uy + 8]
              ], "#e2e8f0", "#10b981", { paperRim: 2.0, shadow: false });
              drawStarPoly(c, S, ux + 26, uy - 14, 10, 4, 4, t * 4, "#ffffff", "#34d399", 1.0);
            }, { t: t, borderColor: "#10b981", bg: "rgba(6, 44, 34, 0.88)" });
          }
        }
      }
    });
  })();

  // ============================================================================
  // PORTHOLE #30 · TOP ("queneau-rostrum" · p30.jpg + atlas-43.webp)
  // Root: Six glowing letter bubbles rising (Pure Vector Vowel Filaments — 0 Text!)
  // ============================================================================
  (function registerPortal30() {
    var BG = getBG();
    if (!BG) return;

    function orbBaseX(idx) {
      return 235 + idx * 162;
    }

    BG.definePortalGame(30, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var pFar = parallaxOffset(0.24, t, 18, 7);
        var pMid = parallaxOffset(0.52, t, 18, 7);
        var aImg = plates.atlasImg;    // atlas-43.webp (740x416)
        var pImg = plates.portholeImg; // p30.jpg (640x640, cropped ABOVE y=280 so zero "AEIOUY" bitmap!)
        var isAlien = resolved.selectedTier === "preposterous";

        S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 30, t, resolved, {
          paperTop: isAlien ? "#cbd5e1" : "#fae194",
          paperBot: isAlien ? "#94a3b8" : "#eed07c",
          floorColor: "#273b19"
        });
        S.drawTornPaperFlat(ctx, -20, 622, W + 40, 118, {
          fill: "#1f3014",
          paperColor: "#efe8d8",
          deckle: 5,
          shadow: false,
          seed: 30.8
        });

        // Cartoon Saloon luminous sea ribbons from atlas-43.webp (740x416)
        S.drawScissorCutout(ctx, aImg, 10, 10, 440, 396, 62 + pFar.x, 42 + pFar.y, 485, 445, [
          [0.04, 0.06], [0.88, 0.02], [0.96, 0.92], [0.06, 0.96]
        ], { haloWidth: 4.5, alpha: 0.85, seed: 3001 });
        S.drawScissorCutout(ctx, aImg, 452, 10, 278, 396, 895 - pFar.x, 46 + pFar.y, 315, 445, [
          [0.08, 0.04], [0.95, 0.06], [0.94, 0.96], [0.04, 0.92]
        ], { haloWidth: 4.5, alpha: 0.84, seed: 3002 });

        // Clean mossy stone bridge arch from p30.jpg (sy=102, sh=175 -> ends at y=277, well above "AEIOUY"!)
        S.drawScissorCutout(ctx, pImg, 135, 102, 370, 175, 275 + pMid.x, 48 + pMid.y, 730, 305, [
          [0.03, 0.94], [0.08, 0.36], [0.28, 0.05], [0.50, 0.02], [0.72, 0.05],
          [0.92, 0.36], [0.97, 0.94], [0.78, 0.95], [0.70, 0.56], [0.50, 0.42], [0.30, 0.56], [0.22, 0.95]
        ], { haloWidth: 5.0, seed: 3003 });

        // Sacred Cartoon Saloon concentric golden rings
        ctx.save();
        ctx.translate(640 + pMid.x * 0.5, 290 + pMid.y * 0.5);
        ctx.strokeStyle = "rgba(20, 17, 13, 0.16)";
        ctx.lineWidth = 1.6;
        ctx.setLineDash([8, 6]);
        ctx.beginPath(); ctx.arc(0, 0, 235, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 175, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        BG.drawWaterCaustics(ctx, W, H, t, { intensity: 0.22, color: "#e0f2fe" });
        BG.drawDepthFog(ctx, W, H, t, { density: 0.12, color: "#fef9c3" });
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        for (var i = 0; i < 6; i++) {
          var ox = orbBaseX(i);
          var oy = 322 + Math.sin(t * 2.5 + i * 0.95) * 14;
          drawGoldenVowelOrb(ctx, S, ox, oy, 52, i);
        }
        S.drawBrookTrout(ctx, 1020, 455 + Math.sin(t * 2) * 8, 1.12, t, false);
        S.drawTurkeyInCorner(ctx, 138, 505, 0.96, t, { dispatch: 0.1 });
        drawHotspotShimmer(ctx, BG, resolved);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          var prismCols = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"];

          BG.drawVolumetricBeam(ctx, 155, 345, 1140, 315, {
            intensity: 1.35 * u,
            color: "#3b82f6",
            coreColor: "#e0f2fe",
            spread: 155,
            t: t
          });

          // Giant projected rainbow vector letters on the stone bridge arch + glowing orbs!
          for (var i = 0; i < 6; i++) {
            var ox = orbBaseX(i);
            var oy = 325 + Math.sin(t * 2.6 + i) * 10;
            ctx.save();
            ctx.translate(ox, 165);
            ctx.globalAlpha = 0.72 * u;
            drawVectorVowelFilament(ctx, i, 78, prismCols[i], "#ffffff");
            ctx.restore();

            BG.drawLanternHalo(ctx, ox, oy, 92 * u, { color: prismCols[i], coreColor: "#ffffff", t: t });
            drawGoldenVowelOrb(ctx, S, ox, oy, 52, i, { rimColor: prismCols[i] });
          }
          drawHotspotShimmer(ctx, BG, resolved);
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawLinkageBar(ctx, S, 1085, 305, 965, 285, 15, "#b91c1c", { pinStart: true, pinEnd: true });
          BG.drawDeterministicParticles(ctx, "bubbles", 640, 345, t, { loop: true, count: 30, spreadX: 480, seed: 302.1 });

          // Bouncy anagram scramble dance with jelly squash-and-stretch!
          var perm = [5, 2, 0, 4, 1, 3];
          for (var i = 0; i < 6; i++) {
            var targetIdx = perm[i];
            var ox = BG.lerp(orbBaseX(i), orbBaseX(targetIdx), u) + Math.sin(t * 6.5 + i * 2) * 22;
            var oy = 315 + Math.cos(t * 7.2 + i * 1.7) * 44;
            var sq = 1 + Math.sin(t * 11 + i) * 0.14;
            drawGoldenVowelOrb(ctx, S, ox, oy, 50, i, { squashX: sq, squashY: 2 - sq });
          }
          drawHotspotShimmer(ctx, BG, resolved);
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          // Wooden courier sorting rack bar
          drawLinkageBar(ctx, S, 210, 392, 925, 392, 9, "#8c6239", { pinStart: true, pinEnd: true });

          for (var i = 0; i < 5; i++) {
            drawGoldenVowelOrb(ctx, S, 245 + i * 135, 330, 46, i);
          }
          // Runaway 'Y' orb lassoed by Mail Snail's silver slime ribbon!
          var yx = BG.lerp(1035, 920, u);
          var yy = BG.lerp(215, 330, u) + Math.sin(t * 4) * 8;
          BG.drawSnailSilverTrail(ctx, 425, 475, yx, yy + 42, 1.0, t, { arc: -26 });
          drawGoldenVowelOrb(ctx, S, yx, yy, 50, 5, { rimColor: "#34d399" });

          S.drawMailSnail(ctx, 425, 485, 1.32, t, { hasReply: false });
          drawHotspotShimmer(ctx, BG, resolved);
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          for (var i = 0; i < 6; i++) {
            var ox = orbBaseX(i);
            var oy = 325 + Math.sin(t * 2.4 + i) * 8;
            if (i === 3) {
              // Fat 'O' orb wobbling like jelly + ringing soprano harmonic rings!
              var wob = 1 + Math.sin(t * 18) * 0.18 * u;
              drawGoldenVowelOrb(ctx, S, ox, oy, 58, 3, {
                squashX: wob,
                squashY: 2 - wob,
                rimColor: "#fbbf24"
              });
              for (var r = 1; r <= 3; r++) {
                var ru = ((t * 1.4 + r / 3) % 1);
                ctx.strokeStyle = BG.rgba("#fde047", (1 - ru) * 0.85 * u);
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(ox, oy, 58 + ru * 88, 0, TAU);
                ctx.stroke();
              }
            } else {
              drawGoldenVowelOrb(ctx, S, ox, oy, 48, i);
            }
          }
          drawIKBrassTongs(ctx, S, BG, 1110, 555, orbBaseX(3) + 46, 345, t, {
            reach: u,
            pinch: 0.12,
            sparks: true,
            seed: 304.2
          });
          drawHotspotShimmer(ctx, BG, resolved);
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Illuminated Floating Naval Letter Mines: Spiked naval mine vowels + Turkey in colander helmet behind periscope!
            var t = resolved.t;
            BG.drawVolumetricBeam(ctx, 195, 515, 760, 290, {
              intensity: 1.25,
              color: "#2563eb",
              coreColor: "#93c5fd",
              spread: 220,
              t: t
            });

            for (var i = 0; i < 6; i++) {
              var mx = 345 + i * 145;
              var my = 295 + Math.sin(t * 2.4 + i) * 16;
              // Swaying anchor chain
              ctx.strokeStyle = "#1e293b";
              ctx.lineWidth = 4.5;
              ctx.setLineDash([8, 5]);
              ctx.beginPath();
              ctx.moveTo(mx, my + 48);
              ctx.lineTo(mx + Math.sin(t * 2 + i) * 14, 548);
              ctx.stroke();
              ctx.setLineDash([]);

              // Contact-horn spikes around vowel orb
              for (var sp = 0; sp < 8; sp++) {
                var sa = (sp / 8) * TAU + t * 0.3;
                S.drawCutoutPaperEdge(ctx, [
                  [mx + Math.cos(sa) * 44, my + Math.sin(sa) * 44],
                  [mx + Math.cos(sa) * 66, my + Math.sin(sa) * 66],
                  [mx + Math.cos(sa + 0.14) * 44, my + Math.sin(sa + 0.14) * 44]
                ], "#475569", "#14110d", { paperRim: 1.4, shadow: false });
              }
              drawGoldenVowelOrb(ctx, S, mx, my, 46, i, {
                bodyFill: "#1e293b",
                rimColor: i % 2 === 0 ? "#ef4444" : "#3b82f6"
              });
            }

            // Turkey wearing aluminum colander helmet + brass periscope crank!
            drawLinkageBar(ctx, S, 285, 165, 285, 535, 12, "#b88a3c", { pinStart: true, pinEnd: true });
            S.drawTurkeyInCorner(ctx, 185, 455, 1.28, t, { dispatch: 0.4 });
            // Perforated silver colander helmet on Turkey's head!
            S.drawCutoutPaperEdge(ctx, [[152, 418], [164, 382], [212, 382], [224, 418]], "#cbd5e1", "#14110d", { paperRim: 2.2 });
            for (var h = 0; h < 4; h++) {
              ctx.fillStyle = "#1e293b";
              ctx.beginPath();
              ctx.arc(168 + h * 13, 402, 2.6, 0, TAU);
              ctx.fill();
            }
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Lit Underwater Spelling Bee Stage: Marquee bulbs + Brook Trout at podium + Snail holding 'Y' cue card!
            var t = resolved.t;
            // Chasing golden game-show marquee bulbs along bridge arch
            for (var b = 0; b < 13; b++) {
              var ba = Math.PI * 1.08 + (b / 12) * Math.PI * 0.84;
              var bx = 640 + Math.cos(ba) * 330;
              var by = 325 + Math.sin(ba) * 215;
              var on = (Math.floor(t * 8) + b) % 3 === 0;
              drawPaperBubble(ctx, bx, by, on ? 10 : 7, on ? "#fef08a" : "#f59e0b");
            }

            for (var i = 0; i < 6; i++) {
              drawGoldenVowelOrb(ctx, S, 275 + i * 145, 215 + Math.sin(t * 3 + i) * 8, 38, i);
            }

            // Spotlight on wooden contestant podium + Brook Trout wearing ribbon rosette!
            BG.drawVolumetricBeam(ctx, 640, 62, 655, 435, {
              intensity: 1.2,
              color: "#60a5fa",
              coreColor: "#fef9c3",
              spread: 175,
              t: t
            });
            S.drawCardboardPuppetPiece(ctx, [[565, 415], [725, 415], [705, 555], [585, 555]], {
              tone: "#8c6239",
              ribs: 3,
              pins: [[585, 432], [705, 432]]
            });
            S.drawBrookTrout(ctx, 665, 368, 1.24, t, false);
            drawStarPoly(ctx, S, 645, 455, 24, 11, 8, t * 0.5, "#fbbf24", "#14110d", 2.0);

            // Mail Snail holding up cue card flashing vector 'Y' + star!
            S.drawMailSnail(ctx, 945, 502, 1.26, t, { flip: true, hasReply: true });
            S.drawCutoutPaperEdge(ctx, [[855, 365], [955, 365], [955, 445], [855, 445]], "#fbfaf5", "#14110d", { paperRim: 3 });
            ctx.save();
            ctx.translate(905, 405);
            drawVectorVowelFilament(ctx, 5, 42, "#34d399", "#0f8f80");
            ctx.restore();
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Glowing Earth Self Destruct Cipher: Saucer lifts 6 vowels into orbital cipher ring around wireframe Earth!
            var t = resolved.t;
            var gx = 640, gy = 395;
            S.drawAlienSaucer(ctx, 640, 96, 1.26, t, gx, gy, { beamSpread: 235 });
            BG.drawTractorRings(ctx, 640, 122, gx, gy, t, { spread: 225, rings: 6 });

            // Wireframe Earth hologram + flashing red X access-denied lock!
            ctx.save();
            ctx.translate(gx, gy);
            S.drawCutoutPaperEdge(ctx, [
              [-92, 0], [-65, -65], [0, -92], [65, -65], [92, 0], [65, 65], [0, 92], [-65, 65]
            ], "#0f172a", "#ef4444", { paperRim: 3.5 });
            ctx.strokeStyle = "#14b8a6";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(0, 0, 74, 0, TAU);
            ctx.ellipse(0, 0, 74 * Math.abs(Math.cos(t * 1.4)), 74, 0, 0, TAU);
            ctx.ellipse(0, 0, 74, 30, 0, 0, TAU);
            ctx.stroke();
            if (Math.sin(t * 9) > -0.2) {
              BG.drawGeometricSymbol(ctx, "x", 0, 0, 44, "#ef4444", 6.5);
            }
            ctx.restore();

            for (var i = 0; i < 6; i++) {
              var a = t * 1.3 + (i / 6) * TAU;
              var ox = gx + Math.cos(a) * 235;
              var oy = gy + Math.sin(a) * 118;
              drawGoldenVowelOrb(ctx, S, ox, oy, 40, i, {
                bodyFill: "#31102f",
                rimColor: "#f43f5e",
                filamentGlow: "#fb7185"
              });
            }
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Bouncing Bumped Explosive Minefield: Ricocheting orbs + Turkey peeking + 'U' squished into pink heart!
            var t = resolved.t;
            BG.drawDeterministicParticles(ctx, "bubbles", 640, 385, t, { loop: true, count: 26, spreadX: 440, seed: 305.1 });

            for (var i = 0; i < 6; i++) {
              var bx = 330 + i * 145 + Math.sin(t * 5.2 + i * 2.1) * 36;
              var by = 295 + Math.abs(Math.cos(t * 4.8 + i * 1.4)) * 95;
              if (i === 4) {
                // 'U' orb squishes harmlessly into a giant pink cut-paper heart!
                ctx.save();
                ctx.translate(bx, by);
                var hs = 1 + Math.sin(t * 8) * 0.12;
                ctx.scale(hs, 2 - hs);
                S.drawCutoutPaperEdge(ctx, [
                  [0, 44], [-48, -4], [-38, -42], [-10, -44], [0, -22], [10, -44], [38, -42], [48, -4]
                ], "#f472b6", "#14110d", { paperRim: 3.0 });
                drawVectorVowelFilament(ctx, 4, 42, "#fce7f3", "#ffffff");
                ctx.restore();
              } else {
                drawGoldenVowelOrb(ctx, S, bx, by, 46, i, { squashX: 1.12, squashY: 0.9 });
              }
            }

            // Turkey squeezing cardboard wings over his eyes!
            S.drawTurkeyCutawayBadge(ctx, 195, 445, 1.32, t, { dispatch: 0.9 });
            S.drawCardboardPuppetPiece(ctx, [[175, 405], [235, 398], [242, 432], [172, 435]], {
              tone: "#694830",
              ribs: 2,
              pin: { x: 180, y: 420, r: 4, metal: "brass" }
            });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Scrambled Spelling Bee Buzzer Chaos: Y-O-U-I-E-A scramble + Trout tail-slapping clam buzzer + Snail red hankie!
            var t = resolved.t;
            var rev = [5, 3, 4, 2, 1, 0];
            for (var i = 0; i < 6; i++) {
              drawGoldenVowelOrb(ctx, S, 245 + i * 155, 185 + Math.sin(t * 6 + i) * 18, 42, rev[i], {
                rimColor: "#ef4444"
              });
            }

            // Giant spring-loaded clam-shell buzzer dome + zig-zag shockwaves!
            var bzX = 565, bzY = 475;
            var slam = Math.max(0, Math.sin(t * 7.5));
            S.drawCardboardPuppetPiece(ctx, [[bzX - 95, bzY], [bzX + 95, bzY], [bzX + 108, 545], [bzX - 108, 545]], {
              tone: "#475569",
              ribs: 2
            });
            S.drawCutoutPaperEdge(ctx, [
              [bzX - 74, bzY + slam * 16], [bzX - 56, bzY - 54 + slam * 16], [bzX + 56, bzY - 54 + slam * 16], [bzX + 74, bzY + slam * 16]
            ], "#dc2626", "#14110d", { paperRim: 3.5 });
            if (slam > 0.3) {
              drawStarPoly(ctx, S, bzX - 115, bzY - 55, 42, 16, 6, t * 3, "#fef08a", "#dc2626", 2.0);
              drawStarPoly(ctx, S, bzX + 115, bzY - 55, 42, 16, 6, -t * 3, "#fef08a", "#dc2626", 2.0);
            }

            // Brook Trout slapping buzzer with tail + Mail Snail waving red penalty hankie!
            S.drawBrookTrout(ctx, bzX - 145, 395, 1.28, t, false, { tilt: 0.22 });
            S.drawMailSnail(ctx, 885, 502, 1.28, t, { flip: true, hasReply: true });
            S.drawCutoutPaperEdge(ctx, [
              [835, 425], [875, 395 + Math.sin(t * 5) * 18], [895, 445], [848, 462]
            ], "#ef4444", "#14110d", { paperRim: 2.2 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Jostled Plasma Orb Countdown Code: Tangled translation ray + saucer spitting long hieroglyph ticker-tape!
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 98, 1.24, t, false);

            // Tangled translation ray knots chasing bouncing plasma orbs
            ctx.strokeStyle = "#a855f7";
            ctx.lineWidth = 4.2;
            ctx.beginPath();
            ctx.moveTo(640, 120);
            for (var i = 0; i < 6; i++) {
              var ox = 245 + i * 155 + Math.cos(t * 4 + i) * 26;
              var oy = 335 + Math.sin(t * 5 + i * 1.6) * 52;
              ctx.quadraticCurveTo(640 + (i - 2.5) * 95, 210 + (i % 2) * 140, ox, oy);
            }
            ctx.stroke();

            for (var k = 0; k < 6; k++) {
              var px = 245 + k * 155 + Math.cos(t * 4 + k) * 26;
              var py = 335 + Math.sin(t * 5 + k * 1.6) * 52;
              drawGoldenVowelOrb(ctx, S, px, py, 44, 5 - k, { rimColor: "#34d399" });
            }

            // Curling paper ticker-tape spitting from saucer with geometric alien polygons (0 text!)
            ctx.save();
            ctx.fillStyle = "#fbfaf5";
            ctx.strokeStyle = "#14110d";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(695, 112);
            ctx.bezierCurveTo(855, 145, 965, 285, 925 + Math.sin(t * 4) * 25, 485);
            ctx.lineTo(968 + Math.sin(t * 4) * 25, 475);
            ctx.bezierCurveTo(1008, 275, 895, 135, 725, 106);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            for (var g = 0; g < 6; g++) {
              var gu = (g + 0.5) / 6;
              var gx = BG.lerp(725, 945, gu);
              var gy = BG.lerp(125, 455, gu);
              BG.drawGeometricSymbol(ctx, ["x", "o", "triangle", "square"][g % 4], gx, gy, 9, "#d42a1e", 2.2);
            }
            ctx.restore();
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Secret Surface Lock Password Lineup: Slime-string arch of vowel beads + Turkey scribbling grease-pencil vowels!
            var t = resolved.t;
            BG.drawSnailSilverTrail(ctx, 295, 365, 985, 365, 1.0, t, { arc: 115, width: 7 });
            for (var i = 0; i < 6; i++) {
              var u = i / 5;
              var bx = BG.lerp(315, 965, u);
              var by = 365 - Math.sin(u * Math.PI) * 115;
              drawGoldenVowelOrb(ctx, S, bx, by, 44, i, { rimColor: "#14b8a6" });
            }
            S.drawMailSnail(ctx, 995, 395, 1.24, t, { hasReply: false });

            // Turkey scribbling mirrored grease-pencil vector vowels on glass!
            S.drawTurkeyCutawayBadge(ctx, 195, 455, 1.3, t, { dispatch: 0.85 });
            drawLinkageBar(ctx, S, 245, 445, 355 + Math.sin(t * 6) * 24, 425, 6, "#fde047", { pinStart: true });
            for (var v = 0; v < 5; v++) {
              ctx.save();
              ctx.translate(385 + v * 68, 468);
              ctx.scale(-1, 1);
              drawVectorVowelFilament(ctx, v, 32, "rgba(253, 224, 71, 0.45)", "#fde047");
              ctx.restore();
            }
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Strict Snail Spelling Bee Judge: Gold foil star on Trout's forehead + 6 choir vowel orbs!
            var t = resolved.t;
            for (var i = 0; i < 6; i++) {
              var cx = 265 + i * 142;
              var cy = 235 + Math.sin(t * 3.8 + i * 0.7) * 12;
              // White scalloped choir-collar under each orb
              S.drawCutoutPaperEdge(ctx, [
                [cx - 38, cy + 32], [cx, cy + 54], [cx + 38, cy + 32]
              ], "#fbfaf5", "#14110d", { paperRim: 1.5, shadow: false });
              drawGoldenVowelOrb(ctx, S, cx, cy, 40, i);
              if (i % 2 === 0) {
                drawMusicNoteCard(ctx, S, cx + 28, cy - 54 - ((t * 24 + i * 9) % 28), 0.78, 0.15, "#0f8f80");
              }
            }

            S.drawBrookTrout(ctx, 745, 415, 1.34, t, false);
            // Shiny 5-point gold foil star stamped right on Trout's forehead!
            drawStarPoly(ctx, S, 678, 392, 24, 10, 5, Math.sin(t * 3) * 0.15, "#facc15", "#14110d", 2.2);
            S.drawMailSnail(ctx, 515, 435, 1.32, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Postmarked Galactic Vowel Treaty: Velvet cushion with 3 cosmic rune crystals traded for tethered 'U' orb!
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 96, 1.24, t, 545, 395, { beamSpread: 195 });
            BG.drawTractorRings(ctx, 640, 122, 545, 395, t, { spread: 185, rings: 5 });

            // Royal purple velvet cushion descending with 3 glowing alien rune gems!
            var cy = 355 + Math.sin(t * 2.5) * 10;
            S.drawCutoutPaperEdge(ctx, [
              [445, cy], [495, cy - 22], [595, cy - 22], [645, cy], [615, cy + 28], [475, cy + 28]
            ], "#6b21a8", "#fbbf24", { paperRim: 3.0 });
            for (var c = 0; c < 3; c++) {
              drawStarPoly(ctx, S, 495 + c * 50, cy - 26, 20, 9, 4, t * 2 + c, "#38bdf8", "#14110d", 1.8);
            }

            // Mail Snail proudly handing over tethered 'U' bubble!
            S.drawMailSnail(ctx, 795, 485, 1.32, t, { flip: true, hasReply: true, hasAlienStamp: true });
            BG.drawSnailSilverTrail(ctx, 785, 465, 765, 285, 1.0, t, { arc: 18 });
            drawGoldenVowelOrb(ctx, S, 765, 255 + Math.sin(t * 3) * 8, 50, 4, { rimColor: "#a855f7" });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Poked Booby Trap Bubble Mine: Ringing golden 'O' + relieved Turkey conducting with wooden soup spoon!
            var t = resolved.t;
            for (var i = 0; i < 6; i++) {
              var ox = 335 + i * 142;
              var oy = 305 + Math.sin(t * 3.5 + i) * 12;
              drawGoldenVowelOrb(ctx, S, ox, oy, i === 3 ? 56 : 42, i);
              if (i === 3) {
                for (var r = 1; r <= 3; r++) {
                  var ru = ((t * 1.2 + r / 3) % 1);
                  ctx.strokeStyle = BG.rgba("#fbbf24", (1 - ru) * 0.85);
                  ctx.lineWidth = 3.2;
                  ctx.beginPath();
                  ctx.arc(ox, oy, 56 + ru * 95, 0, TAU);
                  ctx.stroke();
                }
              }
            }
            drawMusicNoteCard(ctx, S, 760, 195 + Math.sin(t * 4) * 12, 1.05, -0.2, "#d97706");
            drawIKBrassTongs(ctx, S, BG, 1135, 555, 335 + 3 * 142 + 48, 325, t, { pinch: 0.1 });

            // Relieved Turkey conducting with wooden soup spoon!
            S.drawTurkeyCutawayBadge(ctx, 195, 445, 1.32, t, { dispatch: 0.7 });
            var batAng = -0.5 + Math.sin(t * 6.5) * 0.55;
            ctx.save();
            ctx.translate(255, 435);
            ctx.rotate(batAng);
            drawLinkageBar(ctx, S, 0, 0, 105, 0, 5, "#b45309", { pinStart: true });
            S.drawCutoutPaperEdge(ctx, [[95, -16], [135, -18], [142, 0], [135, 18], [95, 16]], "#d97706", "#14110d", { paperRim: 2 });
            ctx.restore();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Loud School Spelling Buzzer Ding: Ringing 'O' megaphone + Brook Trout & 6 backpack minnows darting out!
            var t = resolved.t;
            var ox = 525, oy = 255;
            // Megaphone cone attached to ringing 'O' bubble
            S.drawCutoutPaperEdge(ctx, [
              [ox + 35, oy - 28], [ox + 155, oy - 74], [ox + 155, oy + 74], [ox + 35, oy + 28]
            ], "#f59e0b", "#14110d", { paperRim: 3.0 });
            drawGoldenVowelOrb(ctx, S, ox, oy, 54, 3);
            drawIKBrassTongs(ctx, S, BG, 215, 545, ox - 48, oy + 20, t, { bendDir: 1, sparks: true, seed: 309.2 });

            // Brook Trout + 6 backpack minnows rushing out for recess!
            S.drawBrookTrout(ctx, 855 + Math.sin(t * 5) * 18, 385, 1.22, t, true);
            for (var m = 0; m < 6; m++) {
              var mx = 685 + (m % 3) * 135 + ((t * 95 + m * 40) % 140);
              var my = 315 + Math.floor(m / 3) * 135 + Math.sin(t * 7 + m) * 10;
              drawMinnowPuppet(ctx, S, mx, my, 1.15, -0.06, t, { backpack: true, phase: m });
            }
            S.drawMailSnail(ctx, 415, 512, 1.18, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Triggered Planet Vowel Tuning Fork: Sonic rings vibrate Saucer like jello + rainbow 'O' smoke rings!
            var t = resolved.t;
            var ox = 640, oy = 445;
            drawGoldenVowelOrb(ctx, S, ox, oy, 56, 3, { rimColor: "#fbbf24" });
            drawIKBrassTongs(ctx, S, BG, 1110, 555, ox + 52, oy + 12, t, { sparks: true, seed: 309.9 });

            // Rising sonic rings into wobbling jello saucer
            for (var r = 0; r < 4; r++) {
              var ru = ((t * 0.9 + r / 4) % 1);
              var ry = BG.lerp(395, 155, ru);
              ctx.strokeStyle = BG.rgba("#fde047", (1 - ru) * 0.85);
              ctx.lineWidth = 3.2;
              ctx.beginPath();
              ctx.ellipse(640, ry, BG.lerp(42, 118, ru), 18, 0, 0, TAU);
              ctx.stroke();
            }

            ctx.save();
            var jello = 1 + Math.sin(t * 20) * 0.14;
            ctx.translate(640, 128);
            ctx.scale(jello, 2 - jello);
            S.drawAlienSaucer(ctx, 0, 0, 1.28, t, false);
            ctx.restore();

            // Puffing rainbow 'O' smoke rings!
            var rainbow = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#a855f7"];
            for (var p = 0; p < 5; p++) {
              var pu = ((t * 0.55 + p / 5) % 1);
              var px = BG.lerp(715, 1045, pu);
              var py = BG.lerp(115, 78 + p * 22, pu);
              ctx.strokeStyle = rainbow[p];
              ctx.lineWidth = 5.5;
              ctx.beginPath();
              ctx.arc(px, py, 16 + pu * 24, 0, TAU);
              ctx.stroke();
            }
          }
        }
      }
    });
  })();

  // ============================================================================
  // PORTHOLE #31 · GALLEY B ("queneau-rostrum" · p31.jpg + atlas-11.webp)
  // Root: A dented metal bread-roll baking tin ("375°F" 100% covered by riveted patch!)
  // ============================================================================
  (function registerPortal31() {
    var BG = getBG();
    if (!BG) return;

    function drawCleanBakingTin(ctx, S, plates, x, y, rot, t, opts) {
      var cfg = opts || {};
      var pImg = plates.portholeImg; // p31.jpg (640x640)

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot || 0);

      S.drawScissorCutout(ctx, pImg, 186, 156, 312, 276, -215, -182, 430, 368, [
        [0.34, 0.06], [0.64, 0.03], [0.88, 0.16], [0.97, 0.42],
        [0.92, 0.74], [0.82, 0.94], [0.52, 0.96], [0.16, 0.92],
        [0.04, 0.74], [0.06, 0.46], [0.18, 0.22]
      ], {
        haloWidth: 5.5,
        filter: cfg.filter || "none",
        seed: 3101
      });

      // ALWAYS cover painted "375°F" (local x=-52..136, y=-108..12) with riveted brushed-aluminum plate + brass dial!
      S.drawCardboardPuppetPiece(ctx, [
        [-58, -96], [34, -114], [142, -26], [116, 22], [-46, -42]
      ], {
        tone: cfg.patchTone || "#aeb6be",
        ribs: 2,
        pins: [[-40, -68], [114, -8]]
      });
      // Pure geometric kitchen temperature dial on the aluminum patch (0 text!)
      drawPaperBubble(ctx, 42, -52, 22, "#fef3c7");
      ctx.strokeStyle = cfg.dialColor || "#d42a1e";
      ctx.lineWidth = 3.2;
      var dialAng = cfg.cool ? -2.2 : (-0.4 + Math.sin(t * 3) * 0.25);
      ctx.beginPath();
      ctx.moveTo(42, -52);
      ctx.lineTo(42 + Math.cos(dialAng) * 16, -52 + Math.sin(dialAng) * 16);
      ctx.stroke();
      S.drawSplitPin(ctx, 42, -52, 3.8, { metal: "brass" });

      // Interior glow
      var glowCol = cfg.glowColor || "rgba(255, 214, 125, 0.34)";
      var gg = ctx.createRadialGradient(-34, 34, 8, -28, 38, 145);
      gg.addColorStop(0, glowCol);
      gg.addColorStop(1, "rgba(255, 210, 120, 0)");
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(-28, 38, 145, 0, TAU);
      ctx.fill();

      if (cfg.minnows !== false) {
        S.drawScissorCutout(ctx, pImg, 232, 340, 96, 62, -138 + Math.sin(t * 2.8) * 12, 18, 108, 68, null, {
          haloWidth: 3.0,
          shadow: false,
          rot: Math.sin(t * 3.2) * 0.08,
          seed: 3104
        });
        S.drawScissorCutout(ctx, pImg, 330, 348, 92, 58, -28 + Math.cos(t * 2.5) * 12, 34, 102, 64, null, {
          haloWidth: 3.0,
          shadow: false,
          rot: -Math.sin(t * 2.9) * 0.08,
          seed: 3105
        });
      }
      ctx.restore();
    }

    BG.definePortalGame(31, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var pFar = parallaxOffset(0.22, t, 16, 6);
        var pFg = parallaxOffset(0.75, t, 18, 6);
        var aImg = plates.atlasImg;    // atlas-11.webp (740x569 — avoid x=170..230, y=128..170 copyright plaque!)
        var pImg = plates.portholeImg; // p31.jpg (640x640)
        var isAlien = resolved.selectedTier === "preposterous";

        S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 31, t, resolved, {
          paperTop: isAlien ? "#dfd0a6" : "#fae194",
          paperBot: isAlien ? "#bfa978" : "#eccd76",
          floorColor: resolved.selectedTier === "probable" && resolved.selectedButton === "x" ? "#3c1f16" : "#273b19"
        });
        S.drawTornPaperFlat(ctx, -20, 622, W + 40, 118, {
          fill: "#1f3014",
          paperColor: "#efe8d8",
          deckle: 5,
          shadow: false,
          seed: 31.8
        });

        // Méliès painted sea waves (12,442,716,120) & left brass boiler (6,188,162,232) — 100% zero text!
        S.drawScissorCutout(ctx, aImg, 12, 442, 716, 120, 68 + pFar.x, 442 + pFar.y, 695, 110, null, {
          filter: "sepia",
          haloWidth: 4.5,
          alpha: 0.86,
          seed: 3111
        });
        S.drawScissorCutout(ctx, aImg, 6, 188, 162, 232, 72 + pFar.x, 168 + pFar.y, 205, 255, [
          [0.06, 0.08], [0.55, 0.03], [0.95, 0.12], [0.97, 0.92], [0.05, 0.95]
        ], { filter: "mono", haloWidth: 4.5, seed: 3112 });

        // Torn-deckle Queneau pantry door on right (pure geometric brass plaque, 0 text!)
        var doorX = 995 - pFar.x, doorY = 74 + pFar.y;
        S.drawTornPaperFlat(ctx, doorX, doorY, 204, 458, {
          fill: "#223819",
          paperColor: "#f3ede0",
          deckle: 7.5,
          seed: 31.7
        });
        S.drawCutoutPaperEdge(ctx, [
          [doorX + 46, doorY + 86], [doorX + 158, doorY + 86], [doorX + 158, doorY + 124], [doorX + 46, doorY + 124]
        ], "#ede7d8", "#2d3b24", { paperRim: 0, shadow: false });
        S.drawSplitPin(ctx, doorX + 68, doorY + 105, 3.8, { metal: "brass" });
        S.drawSplitPin(ctx, doorX + 136, doorY + 105, 3.8, { metal: "brass" });

        // Creek stones & reeds from p31.jpg
        S.drawScissorCutout(ctx, pImg, 98, 228, 108, 235, 188 + pFg.x, 305, 148, 255, null, {
          haloWidth: 4.2,
          seed: 3115
        });

        BG.drawWaterCaustics(ctx, W, H, t, { intensity: 0.20, color: "#fef3c7" });
        BG.drawDepthFog(ctx, W, H, t, { density: 0.12, color: "#fde68a" });
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawCleanBakingTin(ctx, S, plates, 605, 335 + Math.sin(t * 2) * 4, 0, t);
        for (var b = 0; b < 6; b++) {
          var bu = ((t * 0.4 + b * 0.16) % 1);
          drawPaperBubble(ctx, 555 + b * 24, BG.lerp(385, 215, bu), 5 + (b % 3) * 2, "rgba(255, 240, 185, 0.8)");
        }
        S.drawBrookTrout(ctx, 995, 385, 1.08, t, false);
        S.drawTurkeyInCorner(ctx, 138, 505, 0.96, t, { dispatch: 0.1 });
        drawHotspotShimmer(ctx, BG, resolved);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawCleanBakingTin(ctx, S, plates, 605, 335, 0, t, { patchTone: "#cbd5e1", glowColor: "rgba(96, 165, 250, 0.42)" });
          BG.drawVolumetricBeam(ctx, 185, 535, 645, 275, {
            intensity: 1.3 * u,
            color: "#3b82f6",
            coreColor: "#dbeafe",
            spread: 165,
            t: t
          });
          // X-Ray blueprint overlay scanning the 12 muffin-cup wireframe dimples!
          BG.drawXRayOverlay(ctx, 435, 265, 225, 148, u, function (c, cx, cy) {
            c.strokeStyle = "#67e8f9";
            c.lineWidth = 2.0;
            for (var r = 0; r < 3; r++) {
              for (var col = 0; col < 4; col++) {
                c.beginPath();
                c.arc(cx - 66 + col * 44, cy - 36 + r * 36, 14, 0, TAU);
                c.stroke();
              }
            }
          }, { t: t, borderColor: "#60a5fa" });
          drawHotspotShimmer(ctx, BG, resolved);
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          var flex = BG.springImpulse(resolved.stemT || 0.4, 0.02, 16, 4.0) * 0.08;
          drawLinkageBar(ctx, S, 1065, 265, 915, 285, 15, "#dc2626", { pinStart: true, pinEnd: true });
          BG.drawVolumetricBeam(ctx, 915, 285, 585, 345, {
            intensity: 0.95 * u,
            color: "#38bdf8",
            coreColor: "#e0f2fe",
            spread: 145,
            t: t
          });
          drawCleanBakingTin(ctx, S, plates, 605, 335, flex, t, {
            cool: true,
            dialColor: "#0284c7",
            glowColor: "rgba(125, 211, 252, 0.42)"
          });
          BG.drawDeterministicParticles(ctx, "bubbles", 610, 345, t, { loop: true, count: 32, spreadX: 290, seed: 312.2 });
          drawHotspotShimmer(ctx, BG, resolved);
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawCleanBakingTin(ctx, S, plates, 625, 335, 0, t, { cool: true });

          // Glass bath-thermometer dipped into tin + emerald safety postmark seal!
          drawLinkageBar(ctx, S, 455, 345, 485, 435, 6, "#e2e8f0", { shadow: false });
          drawPaperBubble(ctx, 488, 442, 11, "#10b981");
          if (u > 0.35) {
            drawPostmarkSeal(ctx, 505, 315, 28, "#0f8f80", t);
          }
          BG.drawSnailSilverTrail(ctx, 195, 535, 425, 480, u, t, { arc: 22 });
          S.drawMailSnail(ctx, BG.lerp(195, 425, u), BG.lerp(535, 480, u), 1.32, t, { hasReply: false });
          drawHotspotShimmer(ctx, BG, resolved);
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          var shake = Math.sin(t * 28) * 5 * u;
          drawCleanBakingTin(ctx, S, plates, 585 + shake, 335, shake * 0.01, t);

          // Concentric kitchen-pan BONG shockwave rings!
          for (var r = 1; r <= 3; r++) {
            var ru = ((t * 1.5 + r / 3) % 1);
            ctx.strokeStyle = BG.rgba("#f59e0b", (1 - ru) * 0.85 * u);
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.arc(765, 415, 24 + ru * 115, 0, TAU);
            ctx.stroke();
          }
          drawIKBrassTongs(ctx, S, BG, 1125, 555, 775, 420, t, {
            reach: u,
            sparks: true,
            sparkCount: 16,
            seed: 314.5
          });
          drawHotspotShimmer(ctx, BG, resolved);
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Terrifying Thanksgiving Oven Roasting Pan: Oven wire rack + cut-paper flames + IK baster + horrified Turkey!
            var t = resolved.t;
            // Flickering red/amber cut-paper oven flames & wire rack
            for (var f = 0; f < 8; f++) {
              var fx = 395 + f * 62;
              var fh = 48 + Math.sin(t * 10 + f * 1.5) * 20;
              S.drawCutoutPaperEdge(ctx, [
                [fx - 22, 505], [fx - 4, 480 - fh], [fx + 10, 480 - fh * 0.55], [fx + 22, 505]
              ], f % 2 === 0 ? "#dc2626" : "#f97316", "#14110d", { paperRim: 2.2 });
            }
            drawLinkageBar(ctx, S, 365, 485, 875, 485, 8, "#64748b", { pinStart: true, pinEnd: true });
            drawCleanBakingTin(ctx, S, plates, 625, 315, -0.06, t, { glowColor: "rgba(239, 68, 68, 0.52)" });

            // Overhead IK oven-mitt & turkey baster
            var ikB = S.solveIK2(955, 52, 185, 175, 655 + Math.sin(t * 4) * 32, 215, -1);
            drawLinkageBar(ctx, S, ikB.x0, ikB.y0, ikB.jx, ikB.jy, 12, "#78716c", { pinStart: true });
            drawLinkageBar(ctx, S, ikB.jx, ikB.jy, ikB.ex, ikB.ey, 10, "#b91c1c", { pinStart: true });
            drawPaperBubble(ctx, ikB.ex + 22, ikB.ey, 20, "#ef4444");

            // Horrified Turkey fanning with potholder & pulling reverse throttle lever!
            S.drawTurkeyCutawayBadge(ctx, 195, 435, 1.34, t, { dispatch: 0.9 });
            drawLinkageBar(ctx, S, 295, 535, 265, 425, 7, "#d4a44c", { pinStart: true, pinEnd: true });
            S.drawCutoutPaperEdge(ctx, [[235, 365], [285, 355], [295, 405], [245, 415]], "#dc2626", "#fbfaf5", { paperRim: 2.5 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Sparkling Twelve Cup Minnow Spa: 12 illuminated muffin jacuzzi pools + cucumber-eye minnows + Trout towels!
            var t = resolved.t;
            BG.drawVolumetricBeam(ctx, 625, 55, 605, 425, {
              intensity: 1.15,
              color: "#38bdf8",
              coreColor: "#fef9c3",
              spread: 245,
              t: t
            });

            // Top-down tilted 12-cup muffin spa deck!
            S.drawCardboardPuppetPiece(ctx, [
              [345, 265], [845, 265], [895, 485], [305, 485]
            ], { tone: "#94a3b8", ribs: 3, pins: [[365, 282], [825, 282], [328, 468], [872, 468]] });

            for (var r = 0; r < 3; r++) {
              for (var c = 0; c < 4; c++) {
                var idx = r * 4 + c;
                var cx = 408 + c * 124 + (r - 1) * 8;
                var cy = 308 + r * 66;
                drawPaperBubble(ctx, cx, cy, 34, "rgba(125, 211, 252, 0.85)");
                drawMinnowPuppet(ctx, S, cx, cy + Math.sin(t * 3 + idx) * 3, 0.85, 0.05, t, {
                  cucumber: true,
                  phase: idx
                });
              }
            }

            // Brook Trout handing out pink kelp towels + Mail Snail!
            S.drawBrookTrout(ctx, 1025, 375, 1.22, t, false);
            S.drawCutoutPaperEdge(ctx, [[895, 375], [965, 370], [968, 408], [892, 412]], "#f472b6", "#14110d", { paperRim: 2.5 });
            S.drawMailSnail(ctx, 235, 505, 1.24, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Scanned Spaceship Reentry Heat Shield: Saucer orange laser grid + 3D ablative nosecone schematic + sparks!
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 96, 1.24, t, 565, 365, { beamSpread: 215 });
            drawCleanBakingTin(ctx, S, plates, 555, 365, 0.35, t, {
              filter: "sepia",
              minnows: false,
              glowColor: "rgba(249, 115, 22, 0.55)"
            });

            // Orange laser grid sweeping over dented baking tin
            ctx.strokeStyle = "rgba(249, 115, 22, 0.78)";
            ctx.lineWidth = 2.0;
            for (var g = -3; g <= 3; g++) {
              ctx.beginPath();
              ctx.moveTo(640, 122);
              ctx.lineTo(555 + g * 52 + Math.sin(t * 3) * 14, 485);
              ctx.stroke();
            }
            BG.drawDeterministicParticles(ctx, "brass_sparks", 615, 345, t, { loop: true, count: 18, seed: 315.4 });

            // Floating 3D wireframe nosecone schematic on right!
            BG.drawXRayOverlay(ctx, 945, 315, 235, 175, 1.0, function (c, cx, cy) {
              c.strokeStyle = "#fb923c";
              c.lineWidth = 2.2;
              c.beginPath();
              c.moveTo(cx + 82, cy);
              c.quadraticCurveTo(cx + 20, cy - 68, cx - 78, cy - 54);
              c.lineTo(cx - 78, cy + 54);
              c.quadraticCurveTo(cx + 20, cy + 68, cx + 82, cy);
              c.stroke();
              c.beginPath();
              c.ellipse(cx - 25, cy, 18, 52, 0, 0, TAU);
              c.ellipse(cx + 28, cy, 12, 36, 0, 0, TAU);
              c.stroke();
            }, { t: t, borderColor: "#f97316", bg: "rgba(43, 18, 8, 0.88)" });
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Cooled Emergency Spare Hull Plate: Chilled tin + Turkey examining naval sub blueprint with muffin dimples!
            var t = resolved.t;
            drawCleanBakingTin(ctx, S, plates, 745, 345, 0.04, t, {
              cool: true,
              patchTone: "#bae6fd",
              glowColor: "rgba(125, 211, 252, 0.35)"
            });
            BG.drawDeterministicParticles(ctx, "bubbles", 745, 345, t, { loop: true, count: 20, seed: 316.1 });

            // Unrolled cyanotype submarine blueprint scroll + nodding Turkey!
            S.drawCutoutPaperEdge(ctx, [
              [285, 235], [565, 235], [565, 435], [285, 435]
            ], "#1e3a8a", "#fbfaf5", { paperRim: 4.0 });
            ctx.strokeStyle = "#93c5fd";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.ellipse(425, 335, 98, 44, 0, 0, TAU);
            for (var d = 0; d < 6; d++) {
              ctx.moveTo(365 + d * 24, 335);
              ctx.arc(365 + d * 24, 335, 7, 0, TAU);
            }
            ctx.stroke();

            S.drawTurkeyCutawayBadge(ctx, 185, 445, 1.32, t, { dispatch: 0.65 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Whirlpool Jets In Minnow Hot Tub: Cedar spa + drink umbrella + Brook Trout in shower cap + rubber ducky!
            var t = resolved.t;
            S.drawTornPaperFlat(ctx, 345, 445, 495, 68, { fill: "#92400e", paperColor: "#fbfaf5", deckle: 4.5, seed: 316.5 });
            drawCleanBakingTin(ctx, S, plates, 585, 325, 0, t, { glowColor: "rgba(253, 224, 71, 0.45)" });

            // Pink cocktail umbrella + curly steam + yellow rubber ducky!
            drawLinkageBar(ctx, S, 455, 295, 435, 215, 3, "#14110d", { shadow: false });
            S.drawCutoutPaperEdge(ctx, [[392, 222], [435, 192], [478, 222]], "#ec4899", "#14110d", { paperRim: 2.5 });
            // Cute yellow rubber ducky bobbing!
            var dx = 545 + Math.sin(t * 3) * 14, dy = 368 + Math.cos(t * 4) * 5;
            S.drawCutoutPaperEdge(ctx, [[dx - 18, dy + 8], [dx - 14, dy - 12], [dx + 12, dy - 8], [dx + 20, dy + 8]], "#facc15", "#14110d", { paperRim: 2 });

            // Brook Trout lounging in polka-dot shower cap + Mail Snail!
            S.drawBrookTrout(ctx, 885, 385, 1.28, t, false);
            S.drawCutoutPaperEdge(ctx, [[805, 362], [818, 332], [858, 335], [868, 365]], "#f472b6", "#14110d", { paperRim: 2.2 });
            S.drawMailSnail(ctx, 295, 505, 1.24, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Cryo Chilled Mothership Waffle Mold: Frost rays lift 12 miniature ice-saucers in baker's-dozen formation!
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 92, 1.24, t, 640, 445, { beamSpread: 245 });
            drawCleanBakingTin(ctx, S, plates, 640, 445, 0, t, {
              cool: true,
              minnows: false,
              patchTone: "#bae6fd",
              glowColor: "rgba(186, 230, 253, 0.55)"
            });

            // 12 miniature crystalline ice-saucers hovering in 4x3 formation!
            for (var r = 0; r < 3; r++) {
              for (var c = 0; c < 4; c++) {
                var idx = r * 4 + c;
                var ix = 445 + c * 130 + Math.sin(t * 3 + idx) * 8;
                var iy = 215 + r * 54 + Math.cos(t * 3.5 + idx) * 6;
                S.drawCutoutPaperEdge(ctx, [
                  [ix - 34, iy], [ix - 14, iy - 12], [ix + 14, iy - 12], [ix + 34, iy], [ix + 16, iy + 9], [ix - 16, iy + 9]
                ], "#cffafe", "#0284c7", { paperRim: 2.0, shadow: false });
              }
            }
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Certified Safe Cold Roasting Pan: Green safety seal + relieved Turkey wiping brow with checkered napkin!
            var t = resolved.t;
            drawCleanBakingTin(ctx, S, plates, 685, 340, 0, t, { cool: true, dialColor: "#10b981" });
            drawPostmarkSeal(ctx, 615, 275, 42, "#10b981", t);
            S.drawMailSnail(ctx, 565, 495, 1.26, t, { hasReply: false });

            // Relieved Turkey wiping brow with red-and-white checkered napkin + thumbs-up wing!
            S.drawTurkeyCutawayBadge(ctx, 215, 425, 1.35, t, { dispatch: 0.85 });
            S.drawCutoutPaperEdge(ctx, [
              [265, 345 + Math.sin(t * 6) * 12], [315, 345 + Math.sin(t * 6) * 12],
              [322, 398 + Math.sin(t * 6) * 12], [258, 398 + Math.sin(t * 6) * 12]
            ], "#ef4444", "#fbfaf5", { paperRim: 3.0 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Five Star Creek Resort Inspection: 5 gold star stamps along tin rim + Trout in terrycloth robe tipping pebble!
            var t = resolved.t;
            drawCleanBakingTin(ctx, S, plates, 565, 345, 0, t);
            for (var s = 0; s < 5; s++) {
              drawStarPoly(ctx, S, 435 + s * 56, 205 + Math.sin(t * 4 + s) * 4, 20, 8, 5, 0, "#facc15", "#14110d", 2.0);
            }

            // Brook Trout bowing in white terrycloth bathrobe + shiny pearl pebble tip!
            S.drawBrookTrout(ctx, 935, 395, 1.28, t, false, { tilt: 0.14 });
            S.drawCutoutPaperEdge(ctx, [[885, 368], [955, 368], [962, 422], [882, 422]], "#fbfaf5", "#0f8f80", { paperRim: 2.2 });
            drawPaperBubble(ctx, 815, 455, 14, "#fde68a");
            S.drawMailSnail(ctx, 745, 495, 1.28, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Impounded Crashed Saucer Armor Plate: Pink parking ticket + sheepish Saucer winching baking tin up on tow-cable!
            var t = resolved.t;
            var liftY = 305 - Math.sin(t * 2.2) * 28;
            S.drawAlienSaucer(ctx, 640, 96, 1.24, t, 640, liftY, { beamSpread: 165 });

            // Braided steel tractor tow-cable + hook!
            ctx.strokeStyle = "#facc15";
            ctx.lineWidth = 5;
            ctx.setLineDash([10, 6]);
            ctx.beginPath();
            ctx.moveTo(640, 118);
            ctx.lineTo(640, liftY - 95);
            ctx.stroke();
            ctx.setLineDash([]);

            drawCleanBakingTin(ctx, S, plates, 640, liftY, -0.22, t, { minnows: false });
            // Bright pink citation tag slapped on tin!
            S.drawCutoutPaperEdge(ctx, [
              [525, liftY - 55], [595, liftY - 65], [602, liftY - 15], [532, liftY - 5]
            ], "#f472b6", "#14110d", { paperRim: 2.5 });

            S.drawMailSnail(ctx, 365, 505, 1.32, t, { hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Banging Haunted Kitchen Dinner Gong: Soundwaves off pan + startled Turkey puffed into round dandelion ball!
            var t = resolved.t;
            var shake = Math.sin(t * 30) * 6;
            drawCleanBakingTin(ctx, S, plates, 685 + shake, 335, 0.05, t);
            drawIKBrassTongs(ctx, S, BG, 1125, 555, 845, 395, t, { sparks: true, seed: 319.1 });

            for (var r = 1; r <= 4; r++) {
              var ru = ((t * 1.6 + r / 4) % 1);
              ctx.strokeStyle = BG.rgba("#ef4444", (1 - ru) * 0.78);
              ctx.lineWidth = 3.5;
              ctx.beginPath();
              ctx.arc(685, 335, 65 + ru * 185, 0, TAU);
              ctx.stroke();
            }

            // Startled Turkey puffed into a huge spiky round feather-dandelion ball under brass periscope!
            drawLinkageBar(ctx, S, 245, 95, 245, 295, 11, "#b88a3c", { pinStart: true, pinEnd: true });
            drawStarPoly(ctx, S, 245, 415, 118, 86, 16, Math.sin(t * 8) * 0.08, "#7d583c", "#14110d", 3.5);
            S.drawTurkeyInCorner(ctx, 245, 415, 1.15, t, { dispatch: 0.9 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Floating Creek Toaster Pop Up: 6 golden amber creek snails spring up out of tin like toasted brioche!
            var t = resolved.t;
            drawCleanBakingTin(ctx, S, plates, 585, 385, 0, t, { minnows: false });
            drawIKBrassTongs(ctx, S, BG, 215, 545, 415, 425, t, { bendDir: 1, sparks: true, seed: 319.4 });

            for (var s = 0; s < 6; s++) {
              var popH = Math.abs(Math.sin(t * 4.5 + s * 0.55)) * 125 + 35;
              var sx = 435 + s * 62;
              var sy = 335 - popH;
              // Coiled toaster spring wire underneath each popping snail!
              ctx.strokeStyle = "#475569";
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(sx, 355);
              ctx.lineTo(sx, sy + 18);
              ctx.stroke();
              S.drawMailSnail(ctx, sx, sy, 0.86, t + s, { postcard: false, trail: false });
            }
            S.drawBrookTrout(ctx, 985, 395, 1.26, t, false);
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Resonant Alien Alloy Drum Solo: 5-color Close Encounters saucer panels + light-mallets steel-drum jam!
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 98, 1.28, t, 640, 415, { beamSpread: 225 });
            // 5 glowing Close Encounters color chord panels on saucer rim!
            var cols = ["#ef4444", "#facc15", "#a855f7", "#10b981", "#3b82f6"];
            var activeNote = Math.floor(t * 6) % 5;
            for (var p = 0; p < 5; p++) {
              var px = 568 + p * 36;
              S.drawCutoutPaperEdge(ctx, [[px - 14, 118], [px + 14, 118], [px + 12, 138], [px - 12, 138]],
                cols[p], "#14110d", { paperRim: p === activeNote ? 3.5 : 1.0, shadow: false });
            }

            drawCleanBakingTin(ctx, S, plates, 625, 395, 0, t, { minnows: false });
            // Beams & bouncing light-mallets playing steel-drum solo!
            for (var m = 0; m < 5; m++) {
              var mx = 485 + m * 72;
              var my = 315 - Math.abs(Math.sin(t * 7 + m * 1.2)) * 68;
              ctx.strokeStyle = cols[m];
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(568 + m * 36, 138);
              ctx.lineTo(mx, my);
              ctx.stroke();
              drawPaperBubble(ctx, mx, my, 13, cols[m]);
            }
            drawMusicNoteCard(ctx, S, 395, 245 + Math.sin(t * 4) * 12, 1.0, -0.2, "#ec4899");
            drawMusicNoteCard(ctx, S, 865, 235 + Math.cos(t * 4) * 12, 1.0, 0.2, "#10b981");
            drawIKBrassTongs(ctx, S, BG, 1125, 555, 815, 425, t, { sparks: false });
          }
        }
      }
    });
  })();

  // ============================================================================
  // PORTHOLE #32 · BEAK ARM ("cardboard-parallax" · p32.jpg + atlas-40.webp)
  // Root: Metal tongs pinching an old key
  // ============================================================================
  (function registerPortal32() {
    var BG = getBG();
    if (!BG) return;

    function drawPantographTongs(ctx, S, plates, baseX, baseY, tipX, tipY, t, opts) {
      var cfg = opts || {};
      var pImg = plates.portholeImg;
      var ik = S.solveIK2(baseX, baseY, 260, 260, tipX, tipY, -1);
      var dx = ik.ex - baseX, dy = ik.ey - baseY;
      var axisLen = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / axisLen, uy = dy / axisLen;
      var nx = -uy, ny = ux;
      var segs = 3;
      var segLen = axisLen / segs;
      var spread = BG.clamp(Math.sqrt(Math.max(225, 118 * 118 - (segLen * 0.5) * (segLen * 0.5))), 26, 92);
      var toneA = cfg.toneA || "#9c9991";
      var toneB = cfg.toneB || "#6e6c67";

      for (var s = 0; s < segs; s++) {
        var sx0 = baseX + ux * (s * segLen), sy0 = baseY + uy * (s * segLen);
        var mx = baseX + ux * ((s + 0.5) * segLen), my = baseY + uy * ((s + 0.5) * segLen);
        var sx1 = baseX + ux * ((s + 1) * segLen), sy1 = baseY + uy * ((s + 1) * segLen);
        var topJx = mx + nx * spread, topJy = my + ny * spread;
        var botJx = mx - nx * spread, botJy = my - ny * spread;

        drawLinkageBar(ctx, S, sx0, sy0, botJx, botJy, 10, toneB);
        drawLinkageBar(ctx, S, topJx, topJy, sx1, sy1, 10, toneB);
        drawLinkageBar(ctx, S, sx0, sy0, topJx, topJy, 10, toneA, { pinStart: true, pinEnd: true, metal: "brass" });
        drawLinkageBar(ctx, S, botJx, botJy, sx1, sy1, 10, toneA, { pinStart: true, pinEnd: true, metal: "silver" });
        S.drawSplitPin(ctx, mx, my, cfg.oiled ? 6.2 : 4.6, { metal: cfg.oiled ? "silver" : "brass" });
        if (cfg.oiled) {
          drawStarPoly(ctx, S, mx, my - 12, 11, 4, 4, t * 3 + s, "#ffffff", "#34d399", 1.0);
        }
      }

      if (cfg.drawKey !== false) {
        var kx = ik.ex + ux * 74 + (cfg.keyOffsetX || 0);
        var ky = ik.ey + uy * 74 + (cfg.keyOffsetY || 12);
        S.drawScissorCutout(ctx, pImg, 355, 126, 148, 188, kx - 86, ky - 110, 172, 220, [
          [0.06, 0.04], [0.58, 0.02], [0.66, 0.28], [0.96, 0.82],
          [0.82, 0.98], [0.56, 0.88], [0.22, 0.36], [0.04, 0.22]
        ], {
          haloWidth: 4.8,
          rot: cfg.keyRot != null ? cfg.keyRot : (0.08 + Math.sin(t * 3) * 0.08),
          filter: cfg.keyFilter || "sepia",
          seed: 3209
        });
      }

      var headAng = Math.atan2(uy, ux);
      var pinch = cfg.pinch != null ? cfg.pinch : (0.22 + Math.abs(Math.sin(t * 3.2)) * 0.16);
      ctx.save();
      ctx.translate(ik.ex, ik.ey);
      ctx.rotate(headAng);
      ctx.save();
      ctx.rotate(-pinch);
      S.drawCardboardPuppetPiece(ctx, [[-6, -12], [58, -34], [106, -12], [90, 2], [50, -4], [4, 4]], { tone: "#b89650", ribs: 2 });
      ctx.restore();
      ctx.save();
      ctx.rotate(pinch);
      S.drawCardboardPuppetPiece(ctx, [[-6, 12], [54, 34], [102, 14], [86, -2], [48, 4], [4, -4]], { tone: "#9c7b38", ribs: 2 });
      ctx.restore();
      S.drawReinigerFiligreeHinge(ctx, 0, 0, 10.5, { metal: "brass" });
      ctx.restore();

      return ik;
    }

    BG.definePortalGame(32, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var p1 = parallaxOffset(0.2, t, 16, 5);
        var p2 = parallaxOffset(0.45, t, 18, 6);
        var aImg = plates.atlasImg;    // atlas-40.webp (740x416)
        var pImg = plates.portholeImg; // p32.jpg (640x640)

        S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 32, t, resolved, { pillarbox: true });

        // Monochrome clay cutouts from atlas-40.webp (740x416)
        S.drawScissorCutout(ctx, aImg, 24, 0, 200, 380, 96 + p1.x, 18, 285, 445, null, {
          filter: "mono",
          haloWidth: 3.5,
          alpha: 0.72,
          seed: 3201
        });
        S.drawScissorCutout(ctx, aImg, 265, 95, 400, 270, 685 - p1.x, 155 + p1.y, 465, 315, [
          [0.06, 0.42], [0.48, 0.08], [0.88, 0.05], [0.96, 0.54], [0.92, 0.96], [0.04, 0.96]
        ], { filter: "mono", haloWidth: 3.8, alpha: 0.78, seed: 3202 });

        S.drawScissorCutout(ctx, aImg, 0, 250, 740, 166, 86 + p2.x, 468 + p2.y, 1108, 215, null, {
          filter: "mono",
          haloWidth: 4.2,
          seed: 3203
        });

        // Left sub flange from p32.jpg (cropped above y=375 to avoid glass reflection)
        S.drawScissorCutout(ctx, pImg, 96, 162, 92, 212, 92 + p2.x * 0.6, 132 + p2.y, 148, 345, [
          [0.08, 0.04], [0.88, 0.02], [0.96, 0.35], [0.82, 0.96], [0.08, 0.94]
        ], { haloWidth: 4.5, seed: 3204 });

        BG.drawWaterCaustics(ctx, W, H, t, { intensity: 0.16, color: "#cbd5e1" });
        BG.drawDepthFog(ctx, W, H, t, { density: 0.15, color: "#94a3b8" });
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        drawPantographTongs(ctx, S, plates, 192, 286, 685 + Math.sin(t * 2) * 28, 252 + Math.cos(t * 2.4) * 18, t);
        S.drawScissorCutout(ctx, plates.portholeImg, 296, 320, 180, 198, 535, 345, 228, 238, [
          [0.04, 0.12], [0.46, 0.04], [0.88, 0.16], [0.96, 0.62], [0.86, 0.96], [0.52, 0.94], [0.24, 0.62], [0.04, 0.34]
        ], { haloWidth: 4.8, seed: 3212 });
        drawHotspotShimmer(ctx, BG, resolved);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          BG.drawVolumetricBeam(ctx, 215, 555, 805, 285, {
            intensity: 1.35 * u,
            color: "#3b82f6",
            coreColor: "#dbeafe",
            spread: 165,
            t: t
          });
          drawPantographTongs(ctx, S, plates, 192, 286, 695, 248, t, { keyFilter: "cyan" });
          BG.drawLanternHalo(ctx, 785, 315, 110 * u, { color: "#60a5fa", coreColor: "#ffffff", t: t });

          // Giant keyhole silhouette projected onto riverbed!
          ctx.save();
          ctx.translate(935, 435);
          ctx.scale(u, u);
          S.drawCutoutPaperEdge(ctx, [
            [-28, 12], [-44, 78], [44, 78], [28, 12]
          ], "#0f172a", "#60a5fa", { paperRim: 2.5 });
          drawPaperBubble(ctx, 0, -12, 34, "#0f172a");
          ctx.restore();
          drawHotspotShimmer(ctx, BG, resolved);
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          var pump = Math.sin(t * 9.5) * 145 * u;
          BG.drawDeterministicParticles(ctx, "bubbles", 525, 315, t, { loop: true, count: 28, spreadX: 340, seed: 322.1 });
          drawPantographTongs(ctx, S, plates, 192, 286, 595 + pump, 275, t, {
            keyRot: Math.sin(t * 10) * 0.38,
            pinch: 0.1 + Math.abs(Math.sin(t * 10)) * 0.35
          });
          drawHotspotShimmer(ctx, BG, resolved);
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawPantographTongs(ctx, S, plates, 192, 286, 695, 265, t, { oiled: true, toneA: "#cbd5e1" });
          BG.drawSnailSilverTrail(ctx, 215, 345, 565, 285, u, t, { arc: -38, width: 6.5 });
          var sx = BG.lerp(235, 545, u), sy = BG.lerp(335, 295, u);
          S.drawMailSnail(ctx, sx, sy, 1.28, t, { hasReply: false });
          // Tiny brass oil-can spout!
          S.drawCutoutPaperEdge(ctx, [[sx + 28, sy - 6], [sx + 58, sy - 22], [sx + 52, sy + 4]], "#f59e0b", "#14110d", { paperRim: 1.5 });
          drawHotspotShimmer(ctx, BG, resolved);
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          var clash = Math.sin(t * 14) * 16 * u;
          drawPantographTongs(ctx, S, plates, 192, 286, 615 + clash, 275, t);
          drawIKBrassTongs(ctx, S, BG, 1095, 535, 735 - clash, 315, t, {
            reach: u,
            sparks: true,
            sparkCount: 16,
            seed: 324.6
          });
          drawHotspotShimmer(ctx, BG, resolved);
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Shadow of Giant Crab Pincer: Spiny red crab claw + giant shadow + Turkey locking double hatch bolts!
            var t = resolved.t;
            BG.drawVolumetricBeam(ctx, 245, 565, 785, 255, {
              intensity: 1.3,
              color: "#2563eb",
              coreColor: "#93c5fd",
              spread: 215,
              t: t
            });

            // Giant ominous black crab-claw shadow on upper-right wall!
            ctx.save();
            ctx.globalAlpha = 0.55;
            S.drawCutoutPaperEdge(ctx, [
              [725, 195], [895, 85], [1075, 145], [965, 215], [1065, 275], [885, 315]
            ], "#090a0d", "#1e3a8a", { paperRim: 0, shadow: false });
            ctx.restore();

            drawPantographTongs(ctx, S, plates, 192, 286, 665, 265, t, {
              toneA: "#b91c1c",
              toneB: "#7f1d1d",
              pinch: 0.15 + Math.abs(Math.sin(t * 8)) * 0.35
            });

            // Gulping Turkey sliding two heavy brass hatch bolts shut!
            S.drawTurkeyCutawayBadge(ctx, 215, 455, 1.32, t, { dispatch: 0.8 });
            for (var b = 0; b < 2; b++) {
              var bx = 315 + Math.min(1, (resolved.outcomeT || 1)) * 38;
              drawLinkageBar(ctx, S, bx, 425 + b * 44, bx + 78, 425 + b * 44, 9, "#f59e0b", { pinStart: true, pinEnd: true });
            }
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Bright Lamp At Fish Dentist: Dental mirror & lamp + reclining Trout in bib + Snail with paper rinse cup!
            var t = resolved.t;
            BG.drawVolumetricBeam(ctx, 565, 195, 815, 395, {
              intensity: 1.25,
              color: "#60a5fa",
              coreColor: "#ffffff",
              spread: 155,
              t: t
            });
            drawPantographTongs(ctx, S, plates, 192, 245, 585, 215, t, { drawKey: false });
            drawPaperBubble(ctx, 685, 235, 28, "rgba(224, 242, 254, 0.95)");

            // Split-pin dental chair + reclining Trout in white paper bib!
            drawLinkageBar(ctx, S, 715, 495, 965, 405, 14, "#475569", { pinStart: true, pinEnd: true });
            S.drawScissorCutout(ctx, plates.portholeImg, 296, 320, 180, 198, 705, 285, 235, 245, null, {
              haloWidth: 4.8,
              rot: 0.24,
              seed: 3251
            });
            S.drawCutoutPaperEdge(ctx, [[765, 395], [825, 408], [812, 468], [752, 452]], "#fbfaf5", "#14110d", { paperRim: 2 });

            // Mail Snail holding tiny paper rinse cup!
            S.drawMailSnail(ctx, 515, 505, 1.26, t, { hasReply: true });
            S.drawCutoutPaperEdge(ctx, [[552, 468], [582, 468], [576, 504], [558, 504]], "#dbeafe", "#14110d", { paperRim: 1.8 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Glowing Dimension Vault Skeleton Key: Key turns 90° unlocking starry galaxy keyhole cut into creek!
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 695, 94, 1.24, t, 815, 345, { beamSpread: 185 });
            BG.drawVolumetricBeam(ctx, 215, 545, 815, 345, {
              intensity: 1.15,
              color: "#ec4899",
              coreColor: "#f0abfc",
              spread: 155,
              t: t
            });

            // Giant floating galaxy keyhole portal unlocked in mid-water!
            ctx.save();
            ctx.translate(855, 345);
            S.drawCutoutPaperEdge(ctx, [
              [-55, 15], [-85, 155], [85, 155], [55, 15], [75, -45], [45, -115], [-45, -115], [-75, -45]
            ], "#090514", "#f472b6", { paperRim: 4.5 });
            // Swirling spiral galaxy & stars inside keyhole!
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (var a = 0; a < 18; a++) {
              var ang = a * 0.55 + t * 2.5;
              var rr = a * 3.8;
              var gx = Math.cos(ang) * rr, gy = -25 + Math.sin(ang) * rr * 0.7;
              if (a === 0) ctx.moveTo(gx, gy);
              else ctx.lineTo(gx, gy);
            }
            ctx.stroke();
            drawStarPoly(ctx, S, -28, 85, 14, 5, 4, t * 2, "#fef08a", "#a855f7", 1.0);
            drawStarPoly(ctx, S, 32, 110, 12, 4, 4, -t * 2, "#ffffff", "#38bdf8", 1.0);
            ctx.restore();

            drawPantographTongs(ctx, S, plates, 192, 286, 625, 305, t, {
              keyRot: Math.PI * 0.5,
              keyOffsetX: 65,
              keyOffsetY: 0,
              keyFilter: "cyan"
            });
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Snapping Iron Bridge Lock Pick: Accordion tongs + giant padlock diagram + Turkey sketching linkage!
            var t = resolved.t;
            var pump = Math.sin(t * 7) * 95;
            drawPantographTongs(ctx, S, plates, 192, 265, 615 + pump, 265, t);

            // Giant cut-paper bridge padlock on right being picked!
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 16;
            ctx.beginPath();
            ctx.arc(935, 255, 48, Math.PI, 0.2);
            ctx.stroke();
            S.drawCardboardPuppetPiece(ctx, [[865, 255], [1005, 255], [1005, 385], [865, 385]], {
              tone: "#b45309",
              ribs: 2,
              pins: [[882, 272], [988, 272]]
            });

            // Gadgeteer Turkey sketching linkage on cream notepad!
            S.drawTurkeyCutawayBadge(ctx, 215, 465, 1.3, t, { dispatch: 0.75 });
            S.drawCutoutPaperEdge(ctx, [[305, 415], [425, 405], [435, 505], [315, 515]], "#fef9c3", "#14110d", { paperRim: 2.5 });
            ctx.strokeStyle = "#1d4ed8";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(328, 438); ctx.lineTo(368, 478); ctx.lineTo(408, 438);
            ctx.moveTo(328, 478); ctx.lineTo(368, 438); ctx.lineTo(408, 478);
            ctx.stroke();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Chattering Mechanical Dentist Pliers: Wind-up novelty teeth + backpedaling Trout + Snail toothbrush leaflet!
            var t = resolved.t;
            var ik = drawPantographTongs(ctx, S, plates, 192, 275, 565 + Math.sin(t * 8) * 35, 305, t, { drawKey: false });

            // Oversized clacking wind-up white novelty teeth in tong jaws!
            var chomp = Math.abs(Math.sin(t * 16)) * 22;
            S.drawCutoutPaperEdge(ctx, [
              [ik.ex + 45, ik.ey - 12 - chomp], [ik.ex + 135, ik.ey - 12 - chomp],
              [ik.ex + 130, ik.ey - 38 - chomp], [ik.ex + 50, ik.ey - 38 - chomp]
            ], "#f43f5e", "#14110d", { paperRim: 2 });
            for (var th = 0; th < 4; th++) {
              S.drawCutoutPaperEdge(ctx, [
                [ik.ex + 52 + th * 20, ik.ey - 12 - chomp], [ik.ex + 70 + th * 20, ik.ey - 12 - chomp],
                [ik.ex + 68 + th * 20, ik.ey + 8 - chomp], [ik.ex + 54 + th * 20, ik.ey + 8 - chomp]
              ], "#ffffff", "#14110d", { paperRim: 1, shadow: false });
            }

            // Backpedaling Trout peeking behind boulder + Mail Snail with toothbrush-icon pamphlet!
            S.drawTornPaperFlat(ctx, 795, 355, 195, 185, { fill: "#334155", paperColor: "#e2e8f0", deckle: 6, seed: 326.3 });
            S.drawBrookTrout(ctx, 985 + Math.sin(t * 12) * 10, 345, 1.24, t, false);
            S.drawMailSnail(ctx, 515, 508, 1.24, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Haywire UFO Abduction Claw Game: Arcade crane jerking tongs + sunken tin boot + key on cartoon spring!
            var t = resolved.t;
            var craneX = 640 + Math.sin(t * 3.8) * 145;
            S.drawAlienSaucer(ctx, craneX, 96, 1.24, t, craneX, 465, { beamSpread: 165 });
            drawPantographTongs(ctx, S, plates, craneX, 128, craneX + Math.sin(t * 6) * 28, 335, t, {
              toneA: "#38bdf8",
              toneB: "#0284c7",
              drawKey: false
            });

            // Dropped skeleton key bouncing on coiled cartoon spring + sunken tin boot!
            var bounceY = 445 - Math.abs(Math.sin(t * 7)) * 75;
            ctx.strokeStyle = "#facc15";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            for (var s = 0; s <= 10; s++) {
              var sy = BG.lerp(525, bounceY + 45, s / 10);
              var sx = 565 + (s % 2 === 0 ? -16 : 16);
              if (s === 0) ctx.moveTo(565, sy);
              else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
            S.drawScissorCutout(ctx, plates.portholeImg, 355, 126, 148, 188, 505, bounceY - 55, 125, 155, null, {
              haloWidth: 4.0,
              rot: t * 3,
              seed: 3269
            });
            // Sunken tin boot prize!
            S.drawCardboardPuppetPiece(ctx, [[755, 425], [805, 425], [808, 495], [858, 502], [855, 532], [748, 532]], {
              tone: "#64748b",
              ribs: 2
            });
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Greased Stealthy Burglar Pincer Arm: Slime-oiled tongs in burglar mask + Turkey eavesdropping with glass!
            var t = resolved.t;
            var ik = drawPantographTongs(ctx, S, plates, 192, 286, 715 + Math.sin(t * 1.6) * 35, 275, t, {
              oiled: true,
              toneA: "#cbd5e1"
            });
            // Sneaky black cut-paper domino burglar mask on tongs hinge!
            S.drawCutoutPaperEdge(ctx, [
              [ik.ex - 36, ik.ey - 22], [ik.ex + 36, ik.ey - 22], [ik.ex + 28, ik.ey + 6], [ik.ex, ik.ey - 4], [ik.ex - 28, ik.ey + 6]
            ], "#0f172a", "#fbfaf5", { paperRim: 2.0 });

            S.drawMailSnail(ctx, 565, 512, 1.22, t, { hasReply: false });
            // Suspicious Turkey pressing drinking glass to hull wall!
            S.drawTurkeyCutawayBadge(ctx, 225, 445, 1.32, t, { dispatch: 0.5 });
            S.drawCutoutPaperEdge(ctx, [[122, 412], [168, 418], [164, 456], [118, 462]], "rgba(186, 230, 253, 0.85)", "#14110d", { paperRim: 2 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Polite Snail Dental Floss Checkup: Slime-floss buffing skeleton key teeth + grinning Brook Trout!
            var t = resolved.t;
            drawPantographTongs(ctx, S, plates, 192, 265, 565, 245, t, { oiled: true });

            // Mail Snail stretching sparkling slime-floss ribbon across key teeth!
            var flossY = 355 + Math.sin(t * 8) * 18;
            BG.drawSnailSilverTrail(ctx, 525, flossY, 745, flossY, 1.0, t, { arc: 4, width: 6 });
            drawStarPoly(ctx, S, 665, 345, 22, 8, 4, t * 4, "#ffffff", "#38bdf8", 1.5);
            S.drawMailSnail(ctx, 515, 485, 1.28, t, { hasReply: true });

            // Grinning Brook Trout flashing sparkling reflection!
            S.drawBrookTrout(ctx, 945, 385, 1.32, t, false);
            drawStarPoly(ctx, S, 862, 388, 16, 6, 4, -t * 4, "#fef08a", "#14110d", 1.2);
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Lubricated Star Cruiser Docking Clamp: Mini scout pod docks into greased jaws & turns key like ignition!
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 88, 1.18, t, 685, 295, { beamSpread: 155 });
            var ik = drawPantographTongs(ctx, S, plates, 192, 286, 625, 295, t, {
              oiled: true,
              keyRot: t * 4.5,
              keyFilter: "cyan"
            });

            // Miniature turquoise scout-pod drone docked cleanly into jaws with charging indicator lights!
            var dx = ik.ex + 52, dy = ik.ey - 12;
            S.drawCutoutPaperEdge(ctx, [
              [dx - 54, dy], [dx - 26, dy - 28], [dx + 26, dy - 28], [dx + 54, dy], [dx + 32, dy + 22], [dx - 32, dy + 22]
            ], "#0d9488", "#fef08a", { paperRim: 3.0 });
            for (var li = 0; li < 4; li++) {
              var lit = ((Math.floor(t * 6) >= li));
              drawPaperBubble(ctx, dx - 27 + li * 18, dy, 6, lit ? "#fef08a" : "#134e4a");
            }
            S.drawMailSnail(ctx, 415, 512, 1.24, t, { hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Twin Scissor Tongs Thumb Wrestle: Creek iron tongs + sub brass tongs duel + championship key medal + Turkey cap tip!
            var t = resolved.t;
            var tap = Math.sin(t * 8) * 18;
            drawPantographTongs(ctx, S, plates, 192, 275, 585 + tap, 275, t, { drawKey: false });
            drawIKBrassTongs(ctx, S, BG, 1085, 495, 695 - tap, 275, t, { sparks: true, seed: 329.1 });

            // Skeleton key dangling on crimson championship medal ribbon at center!
            ctx.strokeStyle = "#dc2626";
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.moveTo(605, 275); ctx.lineTo(640, 345); ctx.lineTo(675, 275);
            ctx.stroke();
            S.drawScissorCutout(ctx, plates.portholeImg, 355, 126, 148, 188, 575, 325, 130, 168, null, {
              haloWidth: 4.5,
              seed: 3292
            });

            // Turkey tipping captain's visor cap!
            S.drawTurkeyCutawayBadge(ctx, 215, 465, 1.3, t, { dispatch: 0.7 });
            S.drawCutoutPaperEdge(ctx, [[185, 392], [248, 385], [262, 405], [182, 410]], "#1e3a8a", "#fbbf24", { paperRim: 2 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Lock Picking Creek Burglar Handoff: Two claws passing key back & forth + gasping Trout + Snail camera flash!
            var t = resolved.t;
            var handoff = 0.5 + 0.5 * Math.sin(t * 3.6);
            drawPantographTongs(ctx, S, plates, 192, 275, 535, 285, t, { drawKey: false });
            drawIKBrassTongs(ctx, S, BG, 1085, 485, 755, 285, t, { sparks: false });

            var kx = BG.lerp(585, 705, handoff);
            S.drawScissorCutout(ctx, plates.portholeImg, 355, 126, 148, 188, kx - 72, 215, 144, 184, null, {
              haloWidth: 4.8,
              rot: (handoff - 0.5) * 0.4,
              seed: 3295
            });

            S.drawBrookTrout(ctx, 885, 455, 1.24, t, false);
            S.drawMailSnail(ctx, 415, 505, 1.26, t, { hasReply: true });
            if (Math.sin(t * 7) > 0.5) {
              drawStarPoly(ctx, S, 445, 468, 36, 12, 8, t, "#fef08a", "#14110d", 1.8);
            }
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Robotic Claw High Five Contact: 3-way mechanical salute (creek tongs + sub brass arm + chrome saucer claw)!
            var t = resolved.t;
            var cx = 640, cy = 325;
            S.drawAlienSaucer(ctx, 640, 88, 1.22, t, cx, cy, { beamSpread: 185 });
            BG.drawTractorRings(ctx, 640, 115, cx, cy, t, { spread: 165, rings: 5 });

            // Top 3-fingered chrome saucer claw descending to center!
            drawLinkageBar(ctx, S, 640, 122, cx, cy - 58, 12, "#e2e8f0", { pinStart: true, pinEnd: true, metal: "silver" });
            for (var f = -1; f <= 1; f++) {
              drawLinkageBar(ctx, S, cx, cy - 58, cx + f * 36, cy - 12, 7, "#cbd5e1", { pinStart: true });
            }

            drawPantographTongs(ctx, S, plates, 192, 295, cx - 72, cy + 12, t, { drawKey: false });
            drawIKBrassTongs(ctx, S, BG, 1095, 515, cx + 72, cy + 12, t, { sparks: true, sparkCount: 18, seed: 329.9 });

            // Glowing skeleton key levitating right at the 3-claw nexus!
            BG.drawLanternHalo(ctx, cx, cy + 18, 95, { color: "#34d399", coreColor: "#ffffff", t: t });
            S.drawScissorCutout(ctx, plates.portholeImg, 355, 126, 148, 188, cx - 64, cy - 42, 128, 165, null, {
              haloWidth: 4.5,
              filter: "cyan",
              rot: Math.sin(t * 4) * 0.15,
              seed: 3299
            });
          }
        }
      }
    });
  })();

  // ============================================================================
  // PORTHOLE #33 · SALON ("daumier-litho" · p33.jpg + atlas-13.webp)
  // Root: Dark drainpipe bars in the shadows
  // ============================================================================
  (function registerPortal33() {
    var BG = getBG();
    if (!BG) return;

    var BAR_XS = [415, 528, 640, 752, 865];

    function drawSalonBarsAndMoss(ctx, S, plates, t, opts) {
      var cfg = opts || {};
      var pImg = plates.portholeImg; // p33.jpg (640x640)

      if (cfg.bars !== false) {
        for (var k = 0; k < BAR_XS.length; k++) {
          var spread = cfg.partBars ? (k - 2) * 42 : 0;
          var vib = cfg.vibrateBar === k || cfg.vibrateAll ? Math.sin(t * 28 + k) * 5 : 0;
          var bx = BAR_XS[k] + spread + vib;

          if (cfg.neonBars) {
            ctx.strokeStyle = k % 2 === 0 ? "#22d3ee" : "#e879f9";
            ctx.lineWidth = 14;
            ctx.beginPath();
            ctx.moveTo(bx, 108);
            ctx.lineTo(bx, 572);
            ctx.stroke();
          }
          drawLinkageBar(ctx, S, bx, 112, bx, 568, 10.5, cfg.neonBars ? "#0e7490" : "#35393d", {
            pinStart: true,
            pinEnd: true,
            metal: "silver"
          });
          ctx.strokeStyle = cfg.neonBars ? "#a5f3fc" : "#fbfaf7";
          ctx.lineWidth = 2.0;
          ctx.strokeRect(bx - 12, 116, 24, 448);
        }
      }

      // Draped crimson-tinted creek-moss curtains left & right from p33.jpg (cropped cleanly above reflection)
      var sway = Math.sin(t * 2.2) * 0.03;
      var partX = cfg.partCurtain || 0;
      S.drawScissorCutout(ctx, pImg, 142, 152, 100, 232, 148 - partX, 104, 198, 468, [
        [0.04, 0.02], [0.94, 0.04], [0.76, 0.56], [0.88, 0.96], [0.06, 0.98]
      ], {
        filter: "litho",
        tint: cfg.crimson ? "rgba(196, 36, 28, 0.65)" : "rgba(155, 34, 38, 0.38)",
        haloWidth: 5.0,
        rot: sway,
        seed: 3308
      });
      S.drawScissorCutout(ctx, pImg, 398, 152, 104, 265, 934 + partX, 104, 198, 468, [
        [0.06, 0.04], [0.96, 0.02], [0.94, 0.98], [0.12, 0.96], [0.24, 0.56]
      ], {
        filter: "litho",
        tint: cfg.crimson ? "rgba(196, 36, 28, 0.65)" : "rgba(155, 34, 38, 0.38)",
        haloWidth: 5.0,
        rot: -sway,
        seed: 3309
      });
    }

    BG.definePortalGame(33, {
      drawBackdrop: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        var pFar = parallaxOffset(0.22, t, 18, 6);
        var aImg = plates.atlasImg; // atlas-13.webp (740x416 Karel Zeman)

        S.drawBolasBackdrop(ctx, W, H, resolved.bolasStyle, 33, t, resolved, {
          bandTop: 98,
          bandBot: 582
        });

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 98, W, 484);
        ctx.clip();

        // Deep emerald/crimson cave tunnel glow
        var cg = ctx.createRadialGradient(640 + pFar.x, 340, 20, 640 + pFar.x, 340, 385);
        cg.addColorStop(0, resolved.selectedTier === "preposterous" ? "rgba(168, 85, 247, 0.48)" : "rgba(45, 212, 191, 0.44)");
        cg.addColorStop(0.65, "rgba(15, 118, 110, 0.18)");
        cg.addColorStop(1, "rgba(11, 12, 14, 0)");
        ctx.fillStyle = cg;
        ctx.fillRect(120, 98, 1040, 484);

        // Karel Zeman etched cigar sub hull (145,108,345,192) & stalactite arch (95,0,550,138)
        S.drawScissorCutout(ctx, aImg, 145, 108, 345, 192, 430 + pFar.x + Math.sin(t * 0.8) * 24, 215, 415, 208, [
          [0.04, 0.44], [0.36, 0.08], [0.84, 0.12], [0.96, 0.52], [0.82, 0.92], [0.32, 0.92]
        ], { filter: "litho", haloWidth: 4.2, alpha: 0.84, seed: 3301 });

        S.drawScissorCutout(ctx, aImg, 95, 0, 550, 138, 225 + pFar.x * 0.6, 94, 830, 136, [
          [0.02, 0.02], [0.98, 0.02], [0.95, 0.88], [0.76, 0.58], [0.52, 0.92], [0.26, 0.56], [0.05, 0.88]
        ], { filter: "litho", haloWidth: 4.2, seed: 3302 });

        S.drawEngravingCrosshatch(ctx, 960, 460, 0.14, 8, { x: 160, y: 110, color: "#fbfaf7" });
        BG.drawWaterCaustics(ctx, W, 575, t, { intensity: 0.18, color: "#99f6e4", topY: 115 });
        ctx.restore();
      },

      drawRoot: function (ctx, W, H, resolved, plates, S) {
        var t = resolved.t;
        // Swimming trout behind the 5 iron bars!
        var swimX = 635 + Math.sin(t * 1.45) * 145;
        S.drawScissorCutout(ctx, plates.portholeImg, 246, 276, 188, 86, swimX - 132, 282, 264, 120, null, {
          haloWidth: 4.5,
          seed: 3305
        });
        drawSalonBarsAndMoss(ctx, S, plates, t);
        drawHotspotShimmer(ctx, BG, resolved);
      },

      stems: {
        x: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          BG.drawVolumetricBeam(ctx, 225, 565, 765, 245, {
            intensity: 1.4 * u,
            color: "#3b82f6",
            coreColor: "#ffffff",
            spread: 235,
            t: t
          });
          drawSalonBarsAndMoss(ctx, S, plates, t);

          // Dramatic Zeman black-and-white cinema shadow stripes across gravel stage!
          for (var k = 0; k < BAR_XS.length; k++) {
            var bx = BAR_XS[k];
            ctx.fillStyle = "rgba(11, 12, 14, " + (0.62 * u).toFixed(2) + ")";
            ctx.beginPath();
            ctx.moveTo(bx - 12, 565);
            ctx.lineTo(bx + 12, 565);
            ctx.lineTo(bx + 58 + (k - 2) * 28, 638);
            ctx.lineTo(bx + 18 + (k - 2) * 28, 638);
            ctx.closePath();
            ctx.fill();
          }
          drawHotspotShimmer(ctx, BG, resolved);
        },

        o: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          S.drawScissorCutout(ctx, plates.portholeImg, 246, 276, 188, 86, 515, 285, 250, 114, null, { haloWidth: 4.2 });
          drawSalonBarsAndMoss(ctx, S, plates, t, { crimson: true, partCurtain: 72 * u });

          // Scalloped crimson velvet opera valance & golden tie-cords!
          for (var sc = 0; sc < 7; sc++) {
            var vx = 235 + sc * 135;
            S.drawCutoutPaperEdge(ctx, [
              [vx - 68, 98], [vx + 68, 98], [vx + 52, 158 + u * 18], [vx, 176 + u * 18], [vx - 52, 158 + u * 18]
            ], "#b91c1c", "#0b0c0e", { paperRim: 3.0 });
          }
          BG.drawDeterministicParticles(ctx, "bubbles", 640, 485, t, { loop: true, count: 28, spreadX: 460, seed: 332.1 });
          drawHotspotShimmer(ctx, BG, resolved);
        },

        triangle: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          drawSalonBarsAndMoss(ctx, S, plates, t);

          // Sunken autumn oak-leaf ticket with star hole punched cleanly out!
          S.drawCutoutPaperEdge(ctx, [
            [455, 425], [575, 412], [588, 482], [468, 495]
          ], "#d97706", "#0b0c0e", { paperRim: 3.0 });
          if (u > 0.35) {
            drawStarPoly(ctx, S, 522, 454, 18, 7, 5, 0.2, "#0b0c0e", "#fbfaf7", 1.2);
            BG.drawDeterministicParticles(ctx, "confetti", 522, 454, t, { loop: true, count: 10, seed: 333.2 });
          }

          BG.drawSnailSilverTrail(ctx, 205, 545, 415, 485, u, t, { arc: 22 });
          S.drawMailSnail(ctx, BG.lerp(205, 415, u), BG.lerp(545, 485, u), 1.32, t, { hasReply: false });
          drawHotspotShimmer(ctx, BG, resolved);
        },

        square: function (ctx, W, H, resolved, plates, S) {
          var t = resolved.t;
          var u = stemProgress(resolved);
          var sweepIdx = Math.floor((t * 5) % 5);
          drawSalonBarsAndMoss(ctx, S, plates, t, { vibrateBar: sweepIdx });

          var barX = BAR_XS[sweepIdx];
          for (var r = 1; r <= 2; r++) {
            var ru = ((t * 2.2 + r / 2) % 1);
            ctx.strokeStyle = BG.rgba("#fbbf24", (1 - ru) * 0.85);
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(barX, 385, 18 + ru * 75, 0, TAU);
            ctx.stroke();
          }
          drawIKBrassTongs(ctx, S, BG, 1095, 555, barX, 395, t, {
            reach: u,
            sparks: true,
            seed: 334.4
          });
          drawHotspotShimmer(ctx, BG, resolved);
        }
      },

      outcomes: {
        x: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Grand Red Velvet Opera Stage: Footlight shells + crimson valance + bowing Turkey in red bow-tie!
            var t = resolved.t;
            BG.drawVolumetricBeam(ctx, 640, 575, 640, 145, {
              intensity: 1.3,
              color: "#3b82f6",
              coreColor: "#fef08a",
              spread: 285,
              t: t
            });
            drawSalonBarsAndMoss(ctx, S, plates, t, { crimson: true, partBars: true });

            // Scalloped red velvet valance & 6 golden brass footlight shells!
            for (var sc = 0; sc < 7; sc++) {
              var vx = 235 + sc * 135;
              S.drawCutoutPaperEdge(ctx, [[vx - 68, 98], [vx + 68, 98], [vx + 52, 168], [vx, 186], [vx - 52, 168]], "#b91c1c", "#0b0c0e", { paperRim: 3 });
            }
            for (var fl = 0; fl < 6; fl++) {
              var fx = 340 + fl * 120;
              S.drawCutoutPaperEdge(ctx, [[fx - 22, 580], [fx, 548], [fx + 22, 580]], "#f59e0b", "#0b0c0e", { paperRim: 2.5 });
            }

            // Bowing Turkey inside porthole wearing crisp red paper bow-tie!
            ctx.save();
            ctx.translate(225, 455);
            ctx.rotate(Math.sin(t * 3) * 0.16 + 0.12);
            S.drawTurkeyCutawayBadge(ctx, 0, 0, 1.35, t, { dispatch: 0.5 });
            S.drawCutoutPaperEdge(ctx, [[-18, 6], [0, 16], [-18, 26]], "#dc2626", "#fbfaf7", { paperRim: 1.5, shadow: false });
            S.drawCutoutPaperEdge(ctx, [[18, 6], [0, 16], [18, 26]], "#dc2626", "#fbfaf7", { paperRim: 1.5, shadow: false });
            ctx.restore();
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Flickering Old Timey Creek Projector: Dual-reel cinema projector + Trout sea-dragon shadow puppet + Snail popcorn!
            var t = resolved.t;
            // Torn-paper screen behind bars with roaring sea-dragon shadow puppet!
            S.drawTornPaperFlat(ctx, 595, 165, 315, 345, { fill: "#f5f5f4", paperColor: "#ffffff", deckle: 5.5, seed: 335.2 });
            S.drawCutoutPaperEdge(ctx, [
              [675, 445], [695, 315], [755, 245], [835, 235], [795, 285], [845, 305], [775, 345], [795, 445]
            ], "#0b0c0e", "#0b0c0e", { paperRim: 0, shadow: false });

            drawSalonBarsAndMoss(ctx, S, plates, t);

            // Flickering 16mm projector on left + Brook Trout wiggling fins in the light cone!
            var px = 265, py = 385;
            BG.drawVolumetricBeam(ctx, px + 55, py - 8, 765, 335, {
              intensity: 0.95 + (Math.sin(t * 28) > 0 ? 0.25 : 0),
              color: "#e2e8f0",
              coreColor: "#ffffff",
              spread: 165,
              t: t
            });
            S.drawCardboardPuppetPiece(ctx, [[px - 42, py - 34], [px + 44, py - 34], [px + 44, py + 32], [px - 42, py + 32]], { tone: "#334155", ribs: 2 });
            drawPaperBubble(ctx, px - 24, py - 58, 26, "#cbd5e1");
            drawPaperBubble(ctx, px + 26, py - 52, 24, "#cbd5e1");

            S.drawBrookTrout(ctx, 485, 355 + Math.sin(t * 6) * 14, 1.15, t, true);
            // Mail Snail munching popped duckweed from red-white striped tub!
            S.drawMailSnail(ctx, 385, 525, 1.22, t, { hasReply: true });
            S.drawCutoutPaperEdge(ctx, [[432, 488], [472, 488], [466, 535], [438, 535]], "#ef4444", "#fbfaf7", { paperRim: 2 });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Shadow Space Beast Cage Bars: Violet saucer backlight turns tiny minnows into 3 giant googly-eyed shadow beasts!
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 82, 1.22, t, 640, 365, { beamSpread: 245 });

            // 3 towering crosshatched lithograph shadow monsters behind the bars!
            var beasts = [435, 640, 845];
            for (var b = 0; b < 3; b++) {
              var bx = beasts[b] + Math.sin(t * 3 + b * 2) * 16;
              var by = 325 + Math.cos(t * 2.5 + b) * 12;
              S.drawCutoutPaperEdge(ctx, [
                [bx - 68, by + 135], [bx - 75, by - 45], [bx - 42, by - 95], [bx - 16, by - 55],
                [bx + 16, by - 55], [bx + 42, by - 95], [bx + 75, by - 45], [bx + 68, by + 135]
              ], "#18181b", "#e879f9", { paperRim: 3.5 });
              drawPaperBubble(ctx, bx - 22, by - 25, 13, "#fef08a");
              drawPaperBubble(ctx, bx + 22, by - 25, 13, "#fef08a");
            }

            drawSalonBarsAndMoss(ctx, S, plates, t);
            // Tiny harmless giggling minnows in foreground!
            for (var m = 0; m < 4; m++) {
              drawMinnowPuppet(ctx, S, 465 + m * 115, 505 + Math.sin(t * 6 + m) * 6, 0.85, 0, t, { phase: m });
            }
          }
        },

        o: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Parted Curtain To Secret Tunnel: Wide-parted crimson moss + silver stone shortcut + Turkey with brass spyglass!
            var t = resolved.t;
            // Calm silver-lit stone tunnel shortcut revealed!
            BG.drawLanternHalo(ctx, 640, 335, 225, { color: "#99f6e4", coreColor: "#ffffff", t: t });
            drawSalonBarsAndMoss(ctx, S, plates, t, { crimson: true, partCurtain: 98, partBars: true });

            // Turkey extending 3-draw brass spyglass telescope!
            S.drawTurkeyCutawayBadge(ctx, 215, 455, 1.32, t, { dispatch: 0.8 });
            drawLinkageBar(ctx, S, 245, 435, 395, 385, 11, "#b88a3c", { pinStart: true });
            drawLinkageBar(ctx, S, 395, 385, 465, 362, 8, "#d4a44c", { pinStart: false });
            drawPaperBubble(ctx, 472, 360, 12, "#bae6fd");
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Yawning Rivet Toothed Monster Jaw: Billowing moss & chomping iron rivet-teeth + gulping Trout + Snail!
            var t = resolved.t;
            var yawn = 45 + Math.abs(Math.sin(t * 4.5)) * 55;
            drawSalonBarsAndMoss(ctx, S, plates, t, { bars: false, crimson: true, partCurtain: 35 });

            // 5 iron bars hinged into yawning upper & lower whale-jaw teeth!
            for (var k = 0; k < BAR_XS.length; k++) {
              var bx = BAR_XS[k];
              S.drawCutoutPaperEdge(ctx, [[bx - 20, 102], [bx + 20, 102], [bx, 285 - yawn]], "#334155", "#fbfaf7", { paperRim: 3 });
              S.drawCutoutPaperEdge(ctx, [[bx - 20, 576], [bx + 20, 576], [bx, 395 + yawn]], "#334155", "#fbfaf7", { paperRim: 3 });
              S.drawSplitPin(ctx, bx, 120, 5, { metal: "silver" });
              S.drawSplitPin(ctx, bx, 558, 5, { metal: "silver" });
            }

            // Startled Brook Trout gulping a giant bubble + reassuring Mail Snail!
            S.drawBrookTrout(ctx, 945, 365, 1.28, t, false);
            drawPaperBubble(ctx, 845, 345, 22, "rgba(186, 230, 253, 0.85)");
            S.drawMailSnail(ctx, 415, 515, 1.26, t, { hasReply: true });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Dilating Giant Saucer Camera Iris: 8-blade mechanical aperture shutter spinning in sync with saucer!
            var t = resolved.t;
            S.drawAlienSaucer(ctx, 640, 84, 1.26, t, 640, 345, { beamSpread: 225 });
            drawSalonBarsAndMoss(ctx, S, plates, t, { crimson: true, partCurtain: 65 });

            // Giant 8-blade brass & stipple mechanical camera iris dilating at culvert center!
            var cx = 640, cy = 342;
            var openR = 85 + Math.sin(t * 4) * 42;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(t * 1.4);
            for (var b = 0; b < 8; b++) {
              ctx.save();
              ctx.rotate((b / 8) * TAU);
              S.drawCardboardPuppetPiece(ctx, [
                [openR, -22], [185, -58], [195, 42], [openR, 28]
              ], { tone: b % 2 === 0 ? "#b88a3c" : "#334155", ribs: 1, pin: { x: 165, y: 0, r: 4.2, metal: "brass" } });
              ctx.restore();
            }
            if (Math.sin(t * 4) > 0.7) {
              drawStarPoly(ctx, S, 0, 0, 88, 28, 8, t * 2, "#ffffff", "#f43f5e", 2.0);
            }
            ctx.restore();
          }
        },

        triangle: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Sold Out Culvert Theater Matinee: Usher Snail flashlight wand + Turkey pressing 2 golden corn kernels to glass!
            var t = resolved.t;
            drawSalonBarsAndMoss(ctx, S, plates, t, { crimson: true });

            // Red velvet carpet runner + Usher Snail waving glowing wand!
            S.drawTornPaperFlat(ctx, 445, 485, 395, 92, { fill: "#991b1b", paperColor: "#fde047", deckle: 4, seed: 337.1 });
            S.drawMailSnail(ctx, 565, 495, 1.32, t, { hasReply: false });
            BG.drawVolumetricBeam(ctx, 595, 475, 845, 365, {
              intensity: 1.15,
              color: "#34d399",
              coreColor: "#fef08a",
              spread: 95,
              t: t
            });

            // Turkey pressing two shiny golden corn kernels against the glass!
            S.drawTurkeyCutawayBadge(ctx, 215, 445, 1.34, t, { dispatch: 0.85 });
            for (var c = 0; c < 2; c++) {
              var kx = 335 + c * 46, ky = 415 + Math.sin(t * 4 + c) * 6;
              S.drawCutoutPaperEdge(ctx, [
                [kx - 16, ky + 16], [kx - 18, ky - 14], [kx, ky - 24], [kx + 18, ky - 14], [kx + 16, ky + 16]
              ], "#facc15", "#14110d", { paperRim: 2.5 });
            }
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Front Row Creek Cinema Pass: Flickering countdown reel + Trout handing acorn cap + Snail tail-stamp!
            var t = resolved.t;
            // Flickering silent-cinema countdown circle crosshair behind bars (0 text!)
            ctx.save();
            ctx.translate(640, 295);
            ctx.fillStyle = "rgba(251, 250, 245, 0.28)";
            ctx.beginPath(); ctx.arc(0, 0, 135, 0, TAU); ctx.fill();
            ctx.strokeStyle = "#fbfaf7";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 125, 0, TAU);
            ctx.arc(0, 0, 88, 0, TAU);
            ctx.moveTo(-135, 0); ctx.lineTo(135, 0);
            ctx.moveTo(0, -135); ctx.lineTo(0, 135);
            ctx.stroke();
            // Sweeping radar/countdown hand
            var sweepA = (t * 4.5) % TAU;
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 4.5;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(sweepA) * 125, Math.sin(sweepA) * 125); ctx.stroke();
            ctx.restore();

            drawSalonBarsAndMoss(ctx, S, plates, t);

            // Smooth pebble seat + Brook Trout + acorn cap coin + Mail Snail stamping Trout's tail!
            S.drawTornPaperFlat(ctx, 645, 485, 215, 78, { fill: "#64748b", paperColor: "#fbfaf7", deckle: 5, seed: 338.2 });
            S.drawBrookTrout(ctx, 735, 445, 1.24, t, false);
            // Cute brown acorn cap coin!
            S.drawCutoutPaperEdge(ctx, [[595, 445], [635, 445], [628, 472], [602, 472]], "#78350f", "#fbfaf7", { paperRim: 2 });
            S.drawMailSnail(ctx, 885, 455, 1.26, t, { flip: true, hasReply: true });
            drawStarPoly(ctx, S, 822, 445, 18, 7, 5, 0, "#10b981", "#fbfaf7", 1.5);
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // VIP Ticket To Shadow Dimension: Glowing metallic ticket on green beam + Snail star-punch + Saucer waiting in line!
            var t = resolved.t;
            drawSalonBarsAndMoss(ctx, S, plates, t, { neonBars: true });
            S.drawAlienSaucer(ctx, 640, 86, 1.26, t, 640, 465, { beamSpread: 175 });
            BG.drawTractorRings(ctx, 640, 114, 640, 465, t, { spread: 165, rings: 5 });

            // Floating glowing metallic gold VIP ticket with star punched cleanly through!
            var ty = 325 + Math.sin(t * 3.5) * 28;
            S.drawCutoutPaperEdge(ctx, [
              [555, ty - 42], [725, ty - 42], [725, ty + 42], [555, ty + 42]
            ], "#facc15", "#0b0c0e", { paperRim: 4.0 });
            drawStarPoly(ctx, S, 640, ty, 24, 10, 5, t, "#10b981", "#0b0c0e", 2.0);

            S.drawMailSnail(ctx, 495, 495, 1.34, t, { hasReply: true, hasAlienStamp: true });
          }
        },

        square: {
          probable: function (ctx, W, H, resolved, plates, S) {
            // Clanging Prison Break Tunnel Grate: Vibrating culvert bars + Turkey dragging tin cup across brass rim!
            var t = resolved.t;
            drawSalonBarsAndMoss(ctx, S, plates, t, { vibrateAll: true });
            for (var k = 0; k < BAR_XS.length; k++) {
              var ru = ((t * 1.8 + k * 0.2) % 1);
              ctx.strokeStyle = BG.rgba("#fbbf24", (1 - ru) * 0.72);
              ctx.lineWidth = 2.6;
              ctx.beginPath();
              ctx.arc(BAR_XS[k], 340, 18 + ru * 64, 0, TAU);
              ctx.stroke();
            }

            // Escape-movie Turkey dragging tin cup back & forth across rim with sparks!
            S.drawTurkeyCutawayBadge(ctx, 215, 455, 1.34, t, { dispatch: 0.85 });
            var cupX = 345 + Math.sin(t * 9) * 58;
            drawLinkageBar(ctx, S, 255, 455, cupX, 465, 7, "#694830", { pinStart: true });
            S.drawCardboardPuppetPiece(ctx, [[cupX - 20, 440], [cupX + 20, 440], [cupX + 18, 492], [cupX - 18, 492]], {
              tone: "#cbd5e1",
              ribs: 2
            });
            BG.drawDeterministicParticles(ctx, "brass_sparks", cupX, 492, t, { loop: true, count: 14, seed: 339.1 });
          },

          plausible: function (ctx, W, H, resolved, plates, S) {
            // Booming Drainpipe Xylophone Concert: Rising bubble rings & notes + jitterbugging Trout + Snail shell-drums!
            var t = resolved.t;
            var hitIdx = Math.floor((t * 6) % 5);
            drawSalonBarsAndMoss(ctx, S, plates, t, { vibrateBar: hitIdx });
            drawIKBrassTongs(ctx, S, BG, 1095, 545, BAR_XS[hitIdx], 355, t, { sparks: true, seed: 339.4 });

            for (var k = 0; k < BAR_XS.length; k++) {
              var nu = ((t * 0.75 + k * 0.2) % 1);
              drawMusicNoteCard(ctx, S, BAR_XS[k], BG.lerp(425, 145, nu), 0.88, Math.sin(t * 4 + k) * 0.25,
                k % 2 === 0 ? "#f59e0b" : "#10b981");
            }

            // Jitterbugging Brook Trout + Mail Snail tapping percussion sticks on his own shell!
            S.drawBrookTrout(ctx, 640 + Math.sin(t * 8) * 35, 485, 1.24, t, true, {
              tilt: Math.sin(t * 8) * 0.28
            });
            S.drawMailSnail(ctx, 355, 515, 1.28, t, { hasReply: true });
            drawLinkageBar(ctx, S, 365, 485, 345, 455 + Math.sin(t * 16) * 10, 3, "#fde047", { shadow: false });
          },

          preposterous: function (ctx, W, H, resolved, plates, S) {
            // Awakened Shadow Space Tuning Grate: Neon cyan laser harp bars + sparkling cosmic starfield & dancing notes!
            var t = resolved.t;
            // Starfield portal between the glowing harp bars!
            ctx.save();
            ctx.fillStyle = "#09051a";
            ctx.fillRect(395, 108, 490, 464);
            for (var s = 0; s < 24; s++) {
              var sx = 410 + BG.hash(s * 7.3) * 460;
              var sy = 125 + BG.hash(s * 13.1) * 430;
              var tw = 1.5 + Math.sin(t * 6 + s) * 1.5;
              ctx.fillStyle = s % 3 === 0 ? "#67e8f9" : "#fdf4ff";
              ctx.beginPath();
              ctx.arc(sx, sy, Math.max(0.8, tw), 0, TAU);
              ctx.fill();
            }
            ctx.restore();

            S.drawAlienSaucer(ctx, 640, 84, 1.26, t, 640, 345, { beamSpread: 245 });
            drawSalonBarsAndMoss(ctx, S, plates, t, { neonBars: true, vibrateAll: true });

            for (var n = 0; n < 5; n++) {
              var ny = 225 + n * 58 + Math.sin(t * 4.5 + n) * 24;
              var nx = 465 + n * 88 + Math.cos(t * 3.5 + n) * 18;
              drawMusicNoteCard(ctx, S, nx, ny, 0.95, Math.sin(t * 3 + n) * 0.3, n % 2 === 0 ? "#22d3ee" : "#f472b6");
            }
          }
        }
      }
    });
  })();
})(typeof window !== "undefined" ? window : globalThis);
