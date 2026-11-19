/* ============================================================================
 * Turkey Sub · V3 Branching Video-to-Game + PAELEO Oulipo Rostrum Cinema
 * File: portals/v3-pod2-a.js  (Pod 2 Lead Animator A · Portholes #12–#17)
 *
 * Registers window.PORTAL_V3_GAMES[12..17] (duration: 18.0s) via
 * BRANCH_GAME.definePortalGame(id, spec) with 17 bespoke animated states per
 * porthole (1 Root + 4 Physical Stems + 12 Playable Outcomes = 102 States):
 *   - #12 · Keel   ("duchamp-optic"      · p12.jpg + atlas-09.webp)
 *   - #13 · Arch   ("cardboard-parallax" · p13.jpg + atlas-54.webp)
 *   - #14 · Tower  ("perec-stage"        · p14.jpg + atlas-02.webp)
 *   - #15 · Lens   ("duchamp-optic"      · p15.jpg + atlas-29.webp)
 *   - #16 · Aft    ("daumier-litho"      · p16.jpg + atlas-08.webp)
 *   - #17 · Dorsal ("daumier-litho"      · p17.jpg + atlas-55.webp)
 *
 * STRICT PAELEO BLIND-MODE LAW:
 *   When resolved.blind (state.showCaptions === false), emits ZERO fillText or
 *   strokeText calls anywhere on canvas!
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var DURATION = 18.0;

  if (root && !root.PORTAL_V3_GAMES) {
    root.PORTAL_V3_GAMES = {};
  }

  var B = root && root.BRANCH_GAME;
  var _bootS = root && root.SCION_STAGE;
  if (_bootS && typeof _bootS.preloadPortalPlates === "function") {
    _bootS.preloadPortalPlates([12, 13, 14, 15, 16, 17]);
  }
  if (!B || typeof B.definePortalGame !== "function") {
    return;
  }

  // ---------- Pure Math, Guarded Text & Shared PAELEO Puppet Helpers ----------

  var clamp = B.clamp;
  var lerp = B.lerp;
  var smooth = B.smooth;
  var easeOutCubic = B.easeOutCubic;
  var easeInOutCubic = B.easeInOutCubic;
  var easeOutBack = B.easeOutBack;

  // Single strictly guarded prop-signage helper: ZERO text calls in blind mode!
  function drawPropLabel(ctx, resolved, str, x, y, opts) {
    if (!resolved || resolved.blind || resolved.showCaptions === false) return;
    if (!str) return;
    var cfg = opts || {};
    ctx.save();
    ctx.font = cfg.font || '800 13px "Big Shoulders Display", "JetBrains Mono", monospace';
    ctx.fillStyle = cfg.color || "#14110d";
    ctx.textAlign = cfg.align || "center";
    ctx.textBaseline = cfg.baseline || "middle";
    if (cfg.rot) {
      ctx.translate(x, y);
      ctx.rotate(cfg.rot);
      ctx.fillText(String(str), 0, 0);
    } else {
      ctx.fillText(String(str), x, y);
    }
    ctx.restore();
  }

  function outPop(resolved, dur) {
    var d = dur || 0.62;
    return clamp(easeOutBack(clamp((resolved.outcomeT || 0) / d, 0, 1)), 0, 1.12);
  }

  function outSmooth(resolved, dur) {
    return smooth(0, dur || 0.68, resolved.outcomeT || 0);
  }

  function limbQuad(x0, y0, x1, y1, w0, w1) {
    var dx = x1 - x0;
    var dy = y1 - y0;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len;
    var ny = dx / len;
    return [
      [x0 + nx * w0, y0 + ny * w0],
      [x1 + nx * w1, y1 + ny * w1],
      [x1 - nx * w1, y1 - ny * w1],
      [x0 - nx * w0, y0 - ny * w0]
    ];
  }

  function starPoly(cx, cy, rOuter, rInner, pts, rot) {
    var out = [];
    var n = pts || 5;
    var a0 = rot == null ? -Math.PI / 2 : rot;
    for (var i = 0; i < n * 2; i++) {
      var r = (i % 2 === 0) ? rOuter : rInner;
      var a = a0 + (i * Math.PI) / n;
      out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return out;
  }

  function drawIKCardboardArm(ctx, S, x0, y0, l1, l2, tx, ty, bendDir, opts) {
    var cfg = opts || {};
    var ik = S.solveIK2(x0, y0, l1, l2, tx, ty, bendDir);
    var w1 = cfg.w1 || 13;
    var w2 = cfg.w2 || 10;
    S.drawCardboardPuppetPiece(ctx, limbQuad(ik.x0, ik.y0, ik.jx, ik.jy, w1, w1 * 0.84), {
      tone: cfg.tone1 || "#8e8d89",
      ribs: 2,
      pin: { x: ik.x0, y: ik.y0, r: 4.6, metal: cfg.metal || "silver" }
    });
    S.drawCardboardPuppetPiece(ctx, limbQuad(ik.jx, ik.jy, ik.ex, ik.ey, w2, w2 * 0.78), {
      tone: cfg.tone2 || "#aba79e",
      ribs: 2,
      pins: [
        { x: ik.jx, y: ik.jy, r: 4.2, metal: cfg.metal || "silver" },
        { x: ik.ex, y: ik.ey, r: 3.6, metal: "brass" }
      ]
    });
    return ik;
  }

  // Articulated submarine brass scissor-probe tongs reaching from hull corner to (tx, ty)
  function drawSubBrassTongs(ctx, S, baseX, baseY, tx, ty, pinchAngle, opts) {
    var cfg = opts || {};
    var l1 = cfg.l1 || 185;
    var l2 = cfg.l2 || 175;
    var bend = cfg.bendDir != null ? cfg.bendDir : 1;
    var ik = S.solveIK2(baseX, baseY, l1, l2, tx, ty, bend);

    S.drawCardboardPuppetPiece(ctx, limbQuad(ik.x0, ik.y0, ik.jx, ik.jy, 14, 11), {
      tone: "#b88b3a",
      ribs: 2,
      pin: { x: ik.x0, y: ik.y0, r: 5.5, metal: "brass" }
    });
    S.drawCardboardPuppetPiece(ctx, limbQuad(ik.jx, ik.jy, ik.ex, ik.ey, 11, 8.5), {
      tone: "#d9ac52",
      ribs: 2,
      pin: { x: ik.jx, y: ik.jy, r: 5.0, metal: "brass" }
    });

    var ang = Math.atan2(ik.ey - ik.jy, ik.ex - ik.jx);
    var jaw = pinchAngle != null ? pinchAngle : 0.28;
    ctx.save();
    ctx.translate(ik.ex, ik.ey);
    ctx.rotate(ang);
    for (var s = -1; s <= 1; s += 2) {
      ctx.save();
      ctx.rotate(s * jaw);
      S.drawCardboardPuppetPiece(ctx, [[-4, -4 * s], [28, -11 * s], [38, -3 * s], [22, 2 * s]], {
        tone: "#f0cb78",
        ribs: 1,
        shadow: false
      });
      ctx.restore();
    }
    S.drawReinigerFiligreeHinge(ctx, 0, 0, 5.8, { metal: "brass" });
    ctx.restore();
    return ik;
  }

  // Subtle symmetric brass porthole corner arcs & rivets framing the stage cleanly
  function drawSubtleCornerBezel(ctx, W, H, resolved, S) {
    var stageH = resolved.blind ? H : 640;
    var cx = W * 0.5;
    var cy = stageH * 0.5;
    var rIn = 700;
    var rOut = 762;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, stageH);
    ctx.clip();

    var g = ctx.createLinearGradient(0, 0, W, stageH);
    g.addColorStop(0.0, "#e9ca7e");
    g.addColorStop(0.5, "#b98834");
    g.addColorStop(1.0, "#5c3f12");
    ctx.beginPath();
    ctx.arc(cx, cy, rOut, 0, TAU, false);
    ctx.arc(cx, cy, rIn, 0, TAU, true);
    ctx.fillStyle = g;
    ctx.fill("evenodd");
    ctx.strokeStyle = "#17130e";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(cx, cy, rIn, 0, TAU);
    ctx.stroke();

    var corners = [[26, 26], [W - 26, 26], [26, stageH - 26], [W - 26, stageH - 26]];
    for (var i = 0; i < corners.length; i++) {
      S.drawSplitPin(ctx, corners[i][0], corners[i][1], 6.2, { metal: "brass" });
    }
    ctx.restore();
  }

  // Swirling ballast current ribbons + cut-paper bubbles
  function drawSwirlingCurrent(ctx, S, cx, cy, rx, ry, t, color, count) {
    var n = count || 4;
    ctx.save();
    for (var i = 0; i < n; i++) {
      var a0 = t * 4.2 + i * (TAU / n);
      ctx.strokeStyle = color || "rgba(248, 113, 113, 0.72)";
      ctx.lineWidth = 3.6 - (i % 2) * 0.8;
      ctx.setLineDash([16, 9]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * (0.55 + i * 0.14), ry * (0.55 + i * 0.14), 0, a0, a0 + Math.PI * 1.15);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawCutoutBubbles(ctx, S, count, xCenter, xSpread, yMin, yMax, t, seed, tintCol) {
    var spanY = Math.max(40, yMax - yMin);
    ctx.save();
    for (var i = 0; i < count; i++) {
      var h1 = S.hash(seed + i * 7.13);
      var h2 = S.hash(seed + i * 13.37);
      var r = 4.2 + S.hash(seed + i * 3.91) * 8.5;
      var travel = ((h2 * spanY + t * (62 + h1 * 34)) % spanY);
      var by = yMax - travel;
      var bx = xCenter + (h1 - 0.5) * xSpread + Math.sin(t * 3.0 + i * 1.7) * 11;

      ctx.fillStyle = "#fbfaf5";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bx, by, r + 1.6, 0, TAU);
      ctx.fill();

      ctx.fillStyle = tintCol || "rgba(182, 236, 228, 0.84)";
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

  function drawStrawBoaterHat(ctx, S, x, y, rot, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.scale(scale || 1, scale || 1);
    S.drawCutoutPaperEdge(ctx, [[-30, 4], [30, 4], [30, 11], [-30, 11]], "#f2cf70", "#14110d", { paperRim: 2, shadow: false });
    S.drawCutoutPaperEdge(ctx, [[-18, -14], [18, -14], [19, 5], [-19, 5]], "#f7dd8c", "#14110d", { paperRim: 2, shadow: false });
    ctx.fillStyle = "#d42a1e";
    ctx.fillRect(-18, -3, 36, 6);
    ctx.restore();
  }

  function drawMusicalNoteBubble(ctx, x, y, r, col) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(251, 250, 245, 0.88)";
    ctx.strokeStyle = col || "#0f8f80";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Pure vector eighth-note inside bubble (ZERO text!)
    ctx.fillStyle = "#14110d";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(-2, 4, 4.2, 3.0, -0.35, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(1.5, 3);
    ctx.lineTo(1.5, -7);
    ctx.lineTo(7, -4);
    ctx.stroke();
    ctx.restore();
  }

  /* ==========================================================================
   * PORTHOLE #12 · KEEL ("duchamp-optic")
   * Clue: Cardboard stage with green Floor Porthole (p12.jpg + atlas-09.webp)
   * ========================================================================== */

  function drawKeelBase(ctx, W, H, resolved, plates, S, opts) {
    var cfg = opts || {};
    var t = resolved.t;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var apX = cfg.apX != null ? cfg.apX : 640;
    var apY = cfg.apY != null ? cfg.apY : 436;
    var apRx = cfg.apRx != null ? cfg.apRx : 146;
    var apRy = cfg.apRy != null ? cfg.apRy : 44;

    // Far plane: Atlas-09 curved submarine hatch arch + Duchamp eccentric rotor disc
    S.drawScissorCutout(
      ctx, aImg, 55, 18, 630, 175, 220, 32, 840, 206,
      [[0.03, 0.32], [0.22, 0.04], [0.78, 0.04], [0.97, 0.32], [0.92, 0.92], [0.08, 0.92]],
      { filter: "cyan", haloWidth: 4.5, alpha: 0.85 }
    );

    ctx.save();
    ctx.translate(640, 252);
    ctx.rotate(t * (cfg.rotorSpeed || 0.55));
    for (var dRing = 6; dRing >= 1; dRing--) {
      var ecc = (dRing % 2 === 0 ? 1 : -1) * 9;
      ctx.strokeStyle = dRing % 2 === 0 ? "rgba(246, 242, 232, 0.24)" : "rgba(15, 143, 128, 0.34)";
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(ecc, -ecc * 0.5, dRing * 27, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.14, color: "#34d399", topY: 70 });

    // Optional tilted deck mode (for square.probable rib-cage!)
    if (!cfg.hideDeck) {
      ctx.save();
      if (cfg.deckTilt) {
        ctx.translate(250, 480);
        ctx.rotate(cfg.deckTilt);
        ctx.translate(-250, -480);
      }
      S.drawCardboardPuppetPiece(
        ctx,
        [[170, 520], [308, 356], [972, 356], [1110, 520], [990, 566], [290, 566]],
        { tone: "#9d8358", ribs: 3 }
      );
      ctx.strokeStyle = "rgba(20, 17, 13, 0.38)";
      ctx.lineWidth = 1.8;
      for (var pl = -4; pl <= 4; pl++) {
        ctx.beginPath();
        ctx.moveTo(640 + pl * 68, 358);
        ctx.lineTo(640 + pl * 112, 522);
        ctx.stroke();
      }
      if (!cfg.skipFloorCrop) {
        S.drawScissorCutout(
          ctx, pImg, 188, 344, 264, 108, apX - 228, 366, 456, 150,
          [[0.08, 0.08], [0.92, 0.08], [0.98, 0.88], [0.02, 0.88]],
          { haloWidth: 4.0 }
        );
      }

      // Glowing green circular floor opening
      if (!cfg.hideHole) {
        B.drawLanternHalo(ctx, apX, apY - 12, apRx * 1.45, {
          color: cfg.glowColor || "#10b981",
          coreColor: "#a7f3d0",
          intensity: cfg.glowIntensity != null ? cfg.glowIntensity : 0.85,
          t: t
        });

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(apX, apY, apRx, apRy, 0, 0, TAU);
        ctx.fillStyle = cfg.holeBg || "#0c5642";
        ctx.fill();
        ctx.clip();

        var spinRate = cfg.vortexSpeed || 2.0;
        for (var ir = 6; ir >= 1; ir--) {
          var uR = ir / 6;
          var offX = Math.cos(t * spinRate + ir) * (cfg.vortexAmp || 5);
          ctx.fillStyle = cfg.darkHole
            ? (ir % 2 === 0 ? "#131c31" : "#1e3a5f")
            : (ir % 2 === 0 ? "#10b981" : "#6ee7b7");
          ctx.beginPath();
          ctx.ellipse(apX + offX, apY, apRx * uR, apRy * uR, 0, 0, TAU);
          ctx.fill();
        }
        if (typeof cfg.insideHoleFn === "function") {
          cfg.insideHoleFn(ctx, apX, apY, apRx, apRy);
        }
        ctx.restore();

        // Brass floor porthole bezel rim
        ctx.strokeStyle = "#d4a44c";
        ctx.lineWidth = 7.5;
        ctx.beginPath();
        ctx.ellipse(apX, apY, apRx + 3, apRy + 2, 0, 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.ellipse(apX, apY, apRx, apRy, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (typeof cfg.midStageFn === "function") {
      cfg.midStageFn(ctx, apX, apY, apRx, apRy);
    }

    // Scalloped Proscenium Curtains & Top Valance sliced from p12.jpg
    var sway = Math.sin(t * 1.7) * 0.022;
    S.drawScissorCutout(
      ctx, pImg, 155, 190, 78, 210, 154, 92, 138, 392,
      [[0.08, 0.02], [0.92, 0.04], [0.86, 0.96], [0.12, 0.98]],
      { haloWidth: 4.5, rot: sway, pin: { x: 224, y: 108, r: 5.0, metal: "brass" } }
    );
    S.drawScissorCutout(
      ctx, pImg, 406, 190, 78, 210, 988, 92, 138, 392,
      [[0.08, 0.04], [0.92, 0.02], [0.88, 0.98], [0.14, 0.96]],
      { haloWidth: 4.5, rot: -sway, pin: { x: 1056, y: 108, r: 5.0, metal: "brass" } }
    );
    S.drawScissorCutout(
      ctx, pImg, 162, 152, 316, 78, 228, 34, 824, 120,
      [[0.02, 0.08], [0.98, 0.08], [0.95, 0.92], [0.74, 0.98], [0.50, 0.90], [0.26, 0.98], [0.05, 0.92]],
      { haloWidth: 4.5 }
    );
  }

  B.definePortalGame(12, {
    drawBackdrop: function (ctx, W, H, resolved, plates, S) {
      S.drawBolasBackdrop(
        ctx, W, H, resolved.bolasStyle, 12, resolved.t,
        { showCaptions: resolved.showCaptions, lamp: resolved.lampOn, ballast: resolved.ballastOn }
      );
    },

    drawRoot: function (ctx, W, H, resolved, plates, S) {
      var t = resolved.t;
      drawKeelBase(ctx, W, H, resolved, plates, S, {
        midStageFn: function (c, apX, apY) {
          B.drawVolumetricBeam(c, apX, apY, apX, 110, {
            color: "#10b981", coreColor: "#d1fae5", sourceRadius: 135, spread: 175, intensity: 0.85, t: t
          });
          S.drawScissorCutout(
            c, plates.portholeImg, 238, 218, 164, 136, 535, 196, 210, 174,
            [[0.08, 0.06], [0.92, 0.06], [0.96, 0.94], [0.04, 0.94]],
            { haloWidth: 3.5, alpha: 0.78 }
          );
          S.drawBrookTrout(c, 945, 326 + Math.sin(t * 2.2) * 7, 1.05, t, false);
        }
      });
      S.drawTurkeyInCorner(ctx, W, H, t, { x: 132, y: 508, scale: 1.05 });
    },

    stems: {
      x: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawKeelBase(ctx, W, H, resolved, plates, S, {
          glowColor: "#38bdf8",
          glowIntensity: 1.25,
          insideHoleFn: function (c, apX, apY, rx, ry) {
            for (var k = 1; k <= 4; k++) {
              var sc = Math.pow(0.72, k);
              c.strokeStyle = "#93c5fd";
              c.lineWidth = 2.6;
              c.beginPath();
              c.ellipse(apX, apY + k * 7 * u, rx * sc, ry * sc, 0, 0, TAU);
              c.stroke();
            }
          },
          midStageFn: function (c, apX, apY) {
            var spotY = lerp(20, 118, u);
            S.drawCardboardPuppetPiece(c, [[604, spotY - 36], [676, spotY - 36], [692, spotY + 18], [588, spotY + 18]], {
              tone: "#384152", ribs: 1, pin: { x: 640, spotY: spotY - 12, y: spotY - 12, r: 4.8, metal: "brass" }
            });
            B.drawVolumetricBeam(c, 640, spotY + 18, apX, apY + 10, {
              color: "#3b82f6", coreColor: "#eff6ff", sourceRadius: 28, spread: 150 * u + 20, intensity: 1.35 * u, t: t
            });
          }
        });
      },

      o: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawKeelBase(ctx, W, H, resolved, plates, S, {
          rotorSpeed: 2.4,
          vortexSpeed: 7.5,
          vortexAmp: 16 * u,
          midStageFn: function (c, apX, apY, rx, ry) {
            drawSwirlingCurrent(c, S, apX, apY - 8, rx * (0.8 + 0.35 * u), ry * 1.35, t, "rgba(248, 113, 113, 0.82)", 5);
            drawCutoutBubbles(c, S, 16, apX, 260, 145, apY, t, 1201, "rgba(167, 243, 208, 0.88)");
          }
        });
      },

      triangle: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawKeelBase(ctx, W, H, resolved, plates, S, {
          midStageFn: function (c, apX, apY) {
            var sx = lerp(310, 488, u);
            var sy = lerp(470, 424, u);
            B.drawSnailSilverTrail(c, 290, 476, sx, sy, u, t, { arc: 8 });
            S.drawMailSnail(c, sx, sy, 1.24, t, { rot: 0.08, postcard: false });
            // Silver thread lowering golden punched ticket stub into the green hole
            var dropY = lerp(sy - 8, apY + 16, smooth(0.25, 1.0, u));
            c.strokeStyle = "#e2e8f0";
            c.lineWidth = 2.2;
            c.beginPath();
            c.moveTo(sx + 28, sy - 6);
            c.lineTo(apX - 24, dropY);
            c.stroke();
            S.drawCutoutPaperEdge(
              c,
              [[apX - 48, dropY - 14], [apX, dropY - 14], [apX, dropY + 14], [apX - 48, dropY + 14]],
              "#fbbf24", "#14110d", { paperRim: 2.2 }
            );
            c.fillStyle = "#d42a1e";
            c.beginPath();
            c.arc(apX - 24, dropY, 4.5, 0, TAU);
            c.fill();
          }
        });
      },

      square: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawKeelBase(ctx, W, H, resolved, plates, S, {
          darkHole: true,
          midStageFn: function (c, apX, apY, rx) {
            var lidAng = -0.82 * u + Math.sin(t * 4.2) * 0.03 * u;
            c.save();
            c.translate(apX - rx, apY);
            c.rotate(lidAng);
            S.drawCardboardPuppetPiece(c, [[0, -14], [rx * 2, -18], [rx * 2 - 12, 16], [0, 14]], {
              tone: "#16a34a", ribs: 2, pin: { x: 0, y: 0, r: 5.5, metal: "brass" }
            });
            // Brass pull-ring on lid right edge
            c.strokeStyle = "#fbbf24";
            c.lineWidth = 4.0;
            c.beginPath();
            c.arc(rx * 2 - 14, -2, 12, 0, TAU);
            c.stroke();
            c.restore();

            var ringX = (apX - rx) + Math.cos(lidAng) * (rx * 2 - 14);
            var ringY = apY + Math.sin(lidAng) * (rx * 2 - 14);
            drawSubBrassTongs(c, S, 965, 560, ringX, ringY, 0.14);
            B.drawDeterministicParticles(c, "brass_sparks", ringX, ringY, resolved.stemT * 0.6, { count: 14, loop: true });
          }
        });
      }
    },

    outcomes: {
      x: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Infinite nested submarine mirror shaft: 5 shrinking Droste floor portholes + waving Turkeys!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawKeelBase(ctx, W, H, resolved, plates, S, {
            glowColor: "#38bdf8",
            midStageFn: function (c, apX, apY) {
              B.drawVolumetricBeam(c, 640, 92, apX, apY + 20, {
                color: "#38bdf8", coreColor: "#e0f2fe", sourceRadius: 42, spread: 190, intensity: 1.15, t: t
              });
              for (var lv = 0; lv < 5; lv++) {
                var zoomPhase = ((lv + (t * 0.65) % 1) / 5);
                var sc = lerp(1.0, 0.20, zoomPhase) * pop;
                var ny = lerp(apY - 10, 215, zoomPhase);
                c.save();
                c.translate(apX, ny);
                c.scale(sc, sc);
                S.drawScissorCutout(
                  c, plates.portholeImg, 188, 344, 264, 108, -165, -46, 330, 92,
                  [[0.08, 0.08], [0.92, 0.08], [0.98, 0.88], [0.02, 0.88]],
                  { haloWidth: 3.0, shadow: false }
                );
                c.strokeStyle = "#fbbf24";
                c.lineWidth = 4.0;
                c.beginPath();
                c.ellipse(0, 6, 104, 30, 0, 0, TAU);
                c.stroke();
                S.drawTurkeyInCorner(c, -110, -8, 0.52, t + lv * 0.15, { dispatch: 0.7 });
                c.restore();
              }
            }
          });
          S.drawTurkeyInCorner(ctx, 175, 495, 1.16, t, { dispatch: 0.85 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // One-dollar sideshow stage spotlight: hinged red paper footlights + Brook Trout in straw boater & cane!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawKeelBase(ctx, W, H, resolved, plates, S, {
            glowColor: "#fde047",
            glowIntensity: 1.35,
            midStageFn: function (c, apX, apY, rx) {
              // Sailor & Captain peeking from stage wings (atlas-09.webp)
              S.drawScissorCutout(c, plates.atlasImg, 168, 108, 178, 268, 258, 175, 146, 218, null, { filter: "sepia", haloWidth: 4.0, rot: 0.06 });
              S.drawScissorCutout(c, plates.atlasImg, 396, 142, 218, 244, 876, 182, 160, 210, null, { filter: "sepia", haloWidth: 4.0, rot: -0.06 });

              B.drawVolumetricBeam(c, apX, apY, apX, 118, {
                color: "#facc15", coreColor: "#fef9c3", sourceRadius: 138, spread: 205, intensity: 1.25, t: t
              });

              // 5 hinged red paper clamshell footlights around rim
              for (var fl = -2; fl <= 2; fl++) {
                var fx = apX + fl * 72;
                var fy = apY + 34 + Math.abs(fl) * 4;
                S.drawCutoutPaperEdge(
                  c,
                  [[fx - 20 * pop, fy + 10], [fx - 16 * pop, fy - 18 * pop], [fx + 16 * pop, fy - 18 * pop], [fx + 20 * pop, fy + 10]],
                  "#d42a1e", "#14110d", { paperRim: 2.2 }
                );
                c.fillStyle = "#fef08a";
                c.beginPath();
                c.arc(fx, fy - 2, 7 * pop, 0, TAU);
                c.fill();
              }

              // Dancing Brook Trout tipping straw boater hat & twirling bamboo cane
              var dx = apX + Math.sin(t * 4.8) * 34;
              var dy = 298 - Math.abs(Math.cos(t * 4.8)) * 22;
              S.drawBrookTrout(c, dx, dy, 1.26, t, false, { tilt: Math.sin(t * 4.8) * 0.14 });
              drawStrawBoaterHat(c, S, dx - 54, dy - 34 - Math.abs(Math.sin(t * 4.8)) * 10, -0.22 + Math.sin(t * 4.8) * 0.25, 1.05);

              // Twirling cane
              c.save();
              c.translate(dx - 24, dy + 28);
              c.rotate(t * 7.2);
              c.strokeStyle = "#14110d";
              c.lineWidth = 5.0;
              c.beginPath();
              c.moveTo(-34, 0);
              c.lineTo(34, 0);
              c.arc(34, 6, 6, -Math.PI / 2, Math.PI / 2);
              c.stroke();
              c.strokeStyle = "#f59e0b";
              c.lineWidth = 2.6;
              c.stroke();
              c.restore();
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Secret pocket-universe star trapdoor: stars, ringed planets & Alien Saucer beneath the floorboards!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawKeelBase(ctx, W, H, resolved, plates, S, {
            apRx: 215 * pop,
            apRy: 92 * pop,
            darkHole: true,
            holeBg: "#090d1f",
            glowColor: "#a855f7",
            insideHoleFn: function (c, apX, apY, rx, ry) {
              // Twinkling deep-space stars inside the floor opening
              for (var s = 0; s < 22; s++) {
                var sx = apX + (S.hash(s * 5.1) - 0.5) * rx * 1.8;
                var sy = apY + (S.hash(s * 9.7) - 0.5) * ry * 1.7;
                c.fillStyle = s % 3 === 0 ? "#fde047" : "#e0f2fe";
                c.beginPath();
                c.arc(sx, sy, 1.5 + (s % 3), 0, TAU);
                c.fill();
              }
              // Ringed cut-paper planets orbiting beneath floorboards
              var pCols = ["#d42a1e", "#0f8f80", "#f59e0b"];
              for (var pi = 0; pi < 3; pi++) {
                var pa = t * 1.2 + pi * (TAU / 3);
                var px = apX + Math.cos(pa) * 125;
                var py = apY + Math.sin(pa) * 38;
                S.drawCutoutPaperEdge(c, [[px - 16, py - 14], [px + 16, py - 14], [px + 16, py + 14], [px - 16, py + 14]], pCols[pi], "#fbfaf5", { paperRim: 2, shadow: false });
                c.strokeStyle = "#fde68a";
                c.lineWidth = 2.4;
                c.beginPath();
                c.ellipse(px, py, 28, 8, -0.25, 0, TAU);
                c.stroke();
              }
              // 3-eyed Alien Saucer floating inside the floor pocket-universe!
              S.drawAlienSaucer(c, apX, apY + 8, 1.05, t, false);
            },
            midStageFn: function (c, apX, apY) {
              B.drawTractorRings(c, apX, apY, apX, 140, t, { spread: 165, rings: 6 });
            }
          });
        }
      },

      o: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Spinning Sea-of-Holes whirlpool drain: concentric green-and-cream Gilliam rings + Turkey paddling backward!
          var t = resolved.t;
          drawKeelBase(ctx, W, H, resolved, plates, S, {
            apRx: 185,
            apRy: 62,
            vortexSpeed: 10.5,
            vortexAmp: 22,
            midStageFn: function (c, apX, apY) {
              // Giant Gilliam concentric paper funnel rings spiraling above & into floor drain
              for (var gr = 7; gr >= 1; gr--) {
                var ang = t * 5.6 + gr * 0.7;
                var radX = 36 + gr * 26;
                var radY = 12 + gr * 8;
                var gy = apY - (7 - gr) * 8;
                c.save();
                c.translate(apX + Math.cos(ang) * 9, gy);
                c.strokeStyle = gr % 2 === 0 ? "#fbfaf5" : "#10b981";
                c.lineWidth = 6.5;
                c.beginPath();
                c.ellipse(0, 0, radX, radY, 0, 0, TAU);
                c.stroke();
                c.restore();
              }
              // Pulled brass bathtub drain plug dangling on chain
              c.strokeStyle = "#fbbf24";
              c.lineWidth = 3.2;
              c.setLineDash([5, 5]);
              c.beginPath();
              c.moveTo(apX + 45, 165);
              c.lineTo(apX + 30, 295);
              c.stroke();
              c.setLineDash([]);
              S.drawCardboardPuppetPiece(c, [[apX + 2, 290], [apX + 58, 290], [apX + 48, 318], [apX + 12, 318]], {
                tone: "#343230", pin: { x: apX + 30, y: 290, r: 4.5, metal: "brass" }
              });
            }
          });
          // Turkey paddling backward furiously on the left!
          var padX = 250 - Math.sin(t * 7.5) * 14;
          S.drawTurkeyInCorner(ctx, padX, 455, 1.22, t * 2.4, { dispatch: 0.95 });
          drawSwirlingCurrent(ctx, S, 250, 485, 95, 28, -t * 2.0, "rgba(251, 250, 245, 0.72)", 3);
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Pop-up prompt box prompter trout: Brook Trout in half-moon glasses tossing script pages toward Mail Snail!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawKeelBase(ctx, W, H, resolved, plates, S, {
            midStageFn: function (c, apX, apY) {
              // Curved cardboard opera prompter hood behind floor circle
              S.drawCardboardPuppetPiece(
                c,
                [[apX - 135, apY], [apX - 108, apY - 120 * pop], [apX + 108, apY - 120 * pop], [apX + 135, apY]],
                { tone: "#6b543b", ribs: 3, pins: [[apX - 95, apY - 22], [apX + 95, apY - 22]] }
              );

              // Brook Trout popping vertically waist-high out of the prompt hole!
              c.save();
              c.beginPath();
              c.rect(apX - 160, 140, 320, apY - 132);
              c.clip();
              S.drawBrookTrout(c, apX + 12, apY - 42 * pop + Math.sin(t * 4.2) * 6, 1.22, t, false, { tilt: -0.48 });
              // Half-moon gold spectacles on Prompter Trout
              c.strokeStyle = "#fbbf24";
              c.lineWidth = 2.8;
              c.fillStyle = "rgba(255,255,255,0.55)";
              c.beginPath();
              c.arc(apX - 48, apY - 72 * pop, 10, 0, Math.PI);
              c.fill();
              c.stroke();
              c.restore();

              // 6 fluttering script pages arcing from Trout to Mail Snail
              for (var pg = 0; pg < 6; pg++) {
                var pu = ((t * 0.55 + pg / 6) % 1);
                var px = lerp(apX - 45, 355, pu);
                var py = lerp(apY - 75, 438, pu) - Math.sin(pu * Math.PI) * 95;
                c.save();
                c.translate(px, py);
                c.rotate(Math.sin(t * 5 + pg) * 0.55);
                S.drawCutoutPaperEdge(c, [[-18, -22], [18, -22], [18, 22], [-18, 22]], "#fbfaf5", "#14110d", { paperRim: 1.5, shadow: false });
                c.strokeStyle = "#3d3831";
                c.lineWidth = 1.6;
                c.beginPath();
                c.moveTo(-11, -10); c.lineTo(11, -10);
                c.moveTo(-11, 0);   c.lineTo(9, 0);
                c.moveTo(-11, 10);  c.lineTo(11, 10);
                c.stroke();
                c.restore();
              }
              S.drawMailSnail(c, 345, 456, 1.28, t, { hasReply: true });
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Portable hole slides across stage, swallowing a prop rock and spitting it out above under the UFO!
          var t = resolved.t;
          var slideX = 640 + Math.sin(t * 2.4) * 185;
          drawKeelBase(ctx, W, H, resolved, plates, S, {
            apX: slideX,
            skipFloorCrop: true,
            midStageFn: function (c, apX, apY) {
              // Upper floating exit hole beneath the Alien Saucer
              var topHoleX = 640 - Math.sin(t * 2.4) * 95;
              var topHoleY = 228;
              c.fillStyle = "#10b981";
              c.strokeStyle = "#14110d";
              c.lineWidth = 3.5;
              c.beginPath();
              c.ellipse(topHoleX, topHoleY, 92, 26, 0, 0, TAU);
              c.fill();
              c.stroke();

              // Prop boulder swallowed at bottom slideX and simultaneously dropping out of topHoleX!
              var cyc = (t * 0.85) % 1;
              var rockBotY = lerp(340, apY + 18, cyc);
              if (cyc < 0.72) {
                S.drawCardboardPuppetPiece(
                  c,
                  [[slideX - 34, rockBotY - 24], [slideX + 28, rockBotY - 28], [slideX + 38, rockBotY + 16], [slideX - 30, rockBotY + 20]],
                  { tone: "#6b7280", ribs: 2 }
                );
              }
              var rockTopU = ((cyc + 0.45) % 1);
              var rockTopY = lerp(topHoleY + 6, 355, rockTopU);
              S.drawCardboardPuppetPiece(
                c,
                [[topHoleX - 30, rockTopY - 20], [topHoleX + 26, rockTopY - 24], [topHoleX + 34, rockTopY + 14], [topHoleX - 28, rockTopY + 18]],
                { tone: "#787f8c", ribs: 2 }
              );

              S.drawAlienSaucer(c, 640, 108, 1.18, t, topHoleX, topHoleY, { beamSpread: 130 });
            }
          });
        }
      },

      triangle: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Dead-letter chute to sub bilge: card drops down floor hole and shoots out of top brass pipe into Turkey's lap!
          var t = resolved.t;
          drawKeelBase(ctx, W, H, resolved, plates, S, {
            midStageFn: function (c, apX, apY) {
              S.drawMailSnail(c, 795, 434, 1.18, t, { flip: true });

              // Curved overhead brass pneumatic chute pipe on upper-left aimed at Turkey
              S.drawCardboardPuppetPiece(
                c,
                [[260, 70], [312, 70], [326, 198], [244, 214]],
                { tone: "#d4a44c", ribs: 2, pins: [[286, 95], [285, 175]] }
              );
              c.fillStyle = "#14110d";
              c.beginPath();
              c.ellipse(285, 206, 42, 13, -0.18, 0, TAU);
              c.fill();

              // Continuous pneumatic loop of wax-sealed cards dropping into hole & shooting out of pipe
              for (var k = 0; k < 3; k++) {
                var u = ((t * 0.72 + k / 3) % 1);
                var lx, ly, rot;
                if (u < 0.45) {
                  var dU = u / 0.45;
                  lx = lerp(755, apX, dU);
                  ly = lerp(408, apY + 10, dU * dU);
                  rot = dU * 0.8;
                } else {
                  var sU = (u - 0.45) / 0.55;
                  lx = lerp(285, 205, sU);
                  ly = lerp(214, 492, sU * sU);
                  rot = -0.5 + sU * 1.4;
                }
                c.save();
                c.translate(lx, ly);
                c.rotate(rot);
                S.drawCutoutPaperEdge(c, [[-22, -15], [22, -15], [22, 15], [-22, 15]], "#fbfaf5", "#14110d", { paperRim: 2, shadow: false });
                c.fillStyle = "#d42a1e";
                c.beginPath();
                c.arc(0, 0, 5.5, 0, TAU);
                c.fill();
                c.restore();
              }
            }
          });
          S.drawTurkeyInCorner(ctx, 188, 496, 1.16, t, { dispatch: 0.5 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Backstage dressing-room autograph swap: spotted fin with feather pen pokes up from floor circle signing star!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawKeelBase(ctx, W, H, resolved, plates, S, {
            glowColor: "#34d399",
            midStageFn: function (c, apX, apY, rx, ry) {
              // Hollywood dressing-room vanity bulbs around floor rim
              for (var vb = 0; vb < 12; vb++) {
                var va = (vb / 12) * TAU;
                var bx = apX + Math.cos(va) * (rx + 14);
                var by = apY + Math.sin(va) * (ry + 9);
                c.fillStyle = (vb + Math.floor(t * 6)) % 2 === 0 ? "#fef08a" : "#ffffff";
                c.strokeStyle = "#14110d";
                c.lineWidth = 1.6;
                c.beginPath();
                c.arc(bx, by, 7, 0, TAU);
                c.fill();
                c.stroke();
              }

              // Open cream stage program held by Mail Snail at left of rim
              var progX = 480, progY = 418;
              S.drawCutoutPaperEdge(c, [[progX - 42, progY - 32], [progX + 42, progY - 32], [progX + 46, progY + 28], [progX - 38, progY + 28]], "#fbfaf5", "#14110d", { paperRim: 2.5 });
              S.drawCutoutPaperEdge(c, starPoly(progX + 6, progY - 2, 16, 7, 5, t * 0.6), "#f59e0b", "#d42a1e", { paperRim: 1, shadow: false });

              // Spotted fin reaching up out of green hole holding scarlet ostrich feather quill!
              var penTipX = progX + 8 + Math.sin(t * 6.5) * 12;
              var penTipY = progY - 4 + Math.cos(t * 5.2) * 7;
              drawIKCardboardArm(c, S, apX + 10, apY + 12, 86 * pop, 84 * pop, penTipX + 24, penTipY - 12, -1, {
                w1: 14, w2: 11, tone1: "#7f9479", tone2: "#9db096", metal: "brass"
              });
              // Scarlet ostrich plume quill
              S.drawCutoutPaperEdge(
                c,
                [[penTipX, penTipY], [penTipX + 48, penTipY - 78], [penTipX + 86, penTipY - 92], [penTipX + 62, penTipY - 44]],
                "#e11d48", "#14110d", { paperRim: 2.2 }
              );

              S.drawMailSnail(c, 392, 444, 1.24, t, { hasReply: true });
              S.drawBrookTrout(c, 905, 355 + Math.sin(t * 2.5) * 8, 1.18, t, true);
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Wormhole postal drop to Saucer: letter enters green floor ring at bottom & simultaneously exits ceiling green ring above Saucer!
          var t = resolved.t;
          drawKeelBase(ctx, W, H, resolved, plates, S, {
            apY: 458,
            midStageFn: function (c, apX, apY) {
              var topY = 92;
              // Matching emerald wormhole ring at top of stage
              B.drawLanternHalo(c, apX, topY, 155, { color: "#10b981", coreColor: "#a7f3d0", intensity: 1.1, t: t });
              c.fillStyle = "#10b981";
              c.strokeStyle = "#fbbf24";
              c.lineWidth = 5.0;
              c.beginPath();
              c.ellipse(apX, topY, 132, 28, 0, 0, TAU);
              c.fill();
              c.stroke();

              // Alien Saucer hovering mid-air catching the teleporting giant letter
              S.drawAlienSaucer(c, apX, 232, 1.22, t, apX, apY, { beamSpread: 135 });

              // Synchronized split-portal giant stamped envelope: enters apY while simultaneously emerging from topY!
              var cyc = (t * 0.78) % 1;
              // Bottom half entering floor ring
              c.save();
              c.beginPath();
              c.rect(apX - 120, 260, 240, apY - 260);
              c.clip();
              var botEnvY = lerp(apY - 90, apY + 55, cyc);
              S.drawCutoutPaperEdge(c, [[apX - 58, botEnvY - 38], [apX + 58, botEnvY - 38], [apX + 58, botEnvY + 38], [apX - 58, botEnvY + 38]], "#fbfaf5", "#14110d", { paperRim: 3 });
              c.fillStyle = "#0f8f80";
              c.beginPath(); c.arc(apX + 34, botEnvY - 18, 9, 0, TAU); c.fill();
              c.restore();

              // Top half simultaneously exiting ceiling ring!
              c.save();
              c.beginPath();
              c.rect(apX - 120, topY, 240, 175);
              c.clip();
              var topEnvY = lerp(topY - 50, topY + 95, cyc);
              S.drawCutoutPaperEdge(c, [[apX - 58, topEnvY - 38], [apX + 58, topEnvY - 38], [apX + 58, topEnvY + 38], [apX - 58, topEnvY + 38]], "#fbfaf5", "#14110d", { paperRim: 3 });
              c.fillStyle = "#d42a1e";
              c.beginPath(); c.arc(apX - 30, topEnvY + 12, 9, 0, TAU); c.fill();
              c.restore();

              S.drawMailSnail(c, 420, 466, 1.18, t, { hasReply: true, hasAlienStamp: true });
            }
          });
        }
      },

      square: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Cardboard stage prop rib-cage: tongs tilt flat stage board up 30°, exposing carpenter struts & glue tabs!
          var t = resolved.t;
          var tilt = -0.46 * outSmooth(resolved, 0.55) + Math.sin(t * 2.5) * 0.02;
          drawKeelBase(ctx, W, H, resolved, plates, S, {
            hideDeck: true,
            midStageFn: function (c) {
              // Sub-stage carpenter rib-cage struts & folded white glue tabs underneath tilted deck
              for (var st = 0; st < 4; st++) {
                var sx = 340 + st * 175;
                S.drawCardboardPuppetPiece(c, [[sx - 18, 365], [sx + 18, 365], [sx + 24, 548], [sx - 24, 548]], {
                  tone: "#78716c", ribs: 3, pins: [[sx, 395], [sx, 515]]
                });
                // Folded white paper glue tabs
                S.drawCutoutPaperEdge(c, [[sx + 18, 430], [sx + 46, 438], [sx + 44, 475], [sx + 18, 482]], "#fbfaf5", "#14110d", { paperRim: 1.5, shadow: false });
                // Pure geometric carpenter notch tally marks (I, II, III, IV)
                for (var mk = 0; mk <= st; mk++) {
                  c.fillStyle = "#d42a1e";
                  c.fillRect(sx - 10 + mk * 6, 448, 3.5, 16);
                }
              }

              // Tilted stage deck held aloft by brass tongs
              c.save();
              c.translate(255, 515);
              c.rotate(tilt);
              S.drawCardboardPuppetPiece(c, [[0, -24], [740, -24], [760, 20], [0, 22]], {
                tone: "#9d8358", ribs: 3, pin: { x: 16, y: 0, r: 6.0, metal: "brass" }
              });
              c.fillStyle = "#10b981";
              c.strokeStyle = "#14110d";
              c.lineWidth = 3.0;
              c.beginPath();
              c.ellipse(380, -4, 118, 16, 0, 0, TAU);
              c.fill();
              c.stroke();
              c.restore();

              var tipX = 255 + Math.cos(tilt) * 720;
              var tipY = 515 + Math.sin(tilt) * 720;
              drawSubBrassTongs(c, S, 985, 565, tipX, tipY, 0.16);
            }
          });
          S.drawTurkeyInCorner(ctx, 155, 504, 1.12, t, { dispatch: 0.25 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Jack-in-the-box trout encore jump: folded paper spring shoots out of open hatch bouncing Brook Trout + star confetti!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawKeelBase(ctx, W, H, resolved, plates, S, {
            darkHole: true,
            midStageFn: function (c, apX, apY, rx) {
              // Wide-open hinged green lid on left
              c.save();
              c.translate(apX - rx, apY);
              c.rotate(-1.85);
              S.drawCardboardPuppetPiece(c, [[0, -12], [195, -14], [190, 14], [0, 12]], {
                tone: "#16a34a", pin: { x: 0, y: 0, r: 5.5, metal: "brass" }
              });
              c.restore();

              var bounceY = 235 * pop + Math.sin(t * 6.4) * 26;
              // Accordion-folded crimson/butter paper zigzag Jack-in-the-box spring
              var coils = 7;
              for (var ci = 0; ci < coils; ci++) {
                var y0 = lerp(apY, bounceY + 25, ci / coils);
                var y1 = lerp(apY, bounceY + 25, (ci + 1) / coils);
                var dir = ci % 2 === 0 ? -42 : 42;
                S.drawCardboardPuppetPiece(
                  c,
                  [[apX - dir, y0 - 6], [apX + dir, y1 - 6], [apX + dir, y1 + 8], [apX - dir, y0 + 8]],
                  { tone: ci % 2 === 0 ? "#d42a1e" : "#f7dd8c", ribs: 1, shadow: false }
                );
              }

              // Bouncing Brook Trout throwing splayed jazz-fins!
              S.drawBrookTrout(c, apX + 10, bounceY, 1.32, t, false, { tilt: -0.24 + Math.sin(t * 6.4) * 0.14 });
              drawIKCardboardArm(c, S, apX - 24, bounceY - 8, 48, 44, apX - 96, bounceY - 68, -1, { w1: 8, w2: 6, tone1: "#b87458" });
              drawIKCardboardArm(c, S, apX + 22, bounceY - 6, 48, 44, apX + 98, bounceY - 64, 1, { w1: 8, w2: 6, tone1: "#b87458" });

              // Star cutouts + confetti burst
              for (var si = 0; si < 6; si++) {
                var sa = t * 1.8 + si * (TAU / 6);
                var sx = apX + Math.cos(sa) * 175;
                var sy = bounceY + Math.sin(sa) * 75;
                S.drawCutoutPaperEdge(c, starPoly(sx, sy, 15, 6, 5, t * 2 + si), si % 2 === 0 ? "#fbbf24" : "#34d399", "#14110d", { paperRim: 1.5, shadow: false });
              }
              B.drawDeterministicParticles(c, "confetti", apX, bounceY, resolved.outcomeT, { count: 24, loop: true });
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Alien Saucer rises through trapdoor on telescoping brass lift amid billowing green stage smoke!
          var t = resolved.t;
          var riseU = outSmooth(resolved, 0.85);
          drawKeelBase(ctx, W, H, resolved, plates, S, {
            apRx: 176,
            apRy: 52,
            glowColor: "#22c55e",
            glowIntensity: 1.45,
            midStageFn: function (c, apX, apY) {
              var saucerY = lerp(apY - 12, 224, riseU) + Math.sin(t * 2.8) * 6;

              // Telescoping brass scissor-lift X-struts ascending from the green trapdoor
              var tiers = 4;
              for (var lv = 0; lv < tiers; lv++) {
                var yA = lerp(apY + 8, saucerY + 24, lv / tiers);
                var yB = lerp(apY + 8, saucerY + 24, (lv + 1) / tiers);
                S.drawCardboardPuppetPiece(c, limbQuad(apX - 46, yA, apX + 46, yB, 6, 6), { tone: "#d4a44c", shadow: false });
                S.drawCardboardPuppetPiece(c, limbQuad(apX + 46, yA, apX - 46, yB, 6, 6), {
                  tone: "#f3d184", shadow: false, pin: { x: apX, y: (yA + yB) * 0.5, r: 4.0, metal: "brass" }
                });
              }

              // Billowing emerald stage smoke clouds around floor hatch
              for (var sm = 0; sm < 7; sm++) {
                var sx = apX + (sm - 3) * 52 + Math.sin(t * 2.4 + sm) * 14;
                var sy = apY - 8 - Math.abs(Math.cos(t * 1.9 + sm)) * 26;
                B.drawLanternHalo(c, sx, sy, 68, { color: "#10b981", coreColor: "#bbf7d0", intensity: 0.72, t: t + sm });
              }

              B.drawVolumetricBeam(c, apX, saucerY, 390, 95, { color: "#34d399", spread: 95, intensity: 0.85, t: t });
              B.drawVolumetricBeam(c, apX, saucerY, 890, 95, { color: "#a855f7", spread: 95, intensity: 0.85, t: t });
              S.drawAlienSaucer(c, apX, saucerY, 1.32, t, false);
            }
          });
        }
      }
    },

    drawForeground: function (ctx, W, H, resolved, plates, S) {
      drawSubtleCornerBezel(ctx, W, H, resolved, S);
    }
  });

  /* ==========================================================================
   * PORTHOLE #13 · ARCH ("cardboard-parallax")
   * Clue: Bell Boulder arch with brass twig-bell (p13.jpg + atlas-54.webp)
   * ========================================================================== */

  function drawArchBase(ctx, W, H, resolved, plates, S, opts) {
    var cfg = opts || {};
    var t = resolved.t;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var liftY = cfg.archLiftY || 0;
    var pivotX = 640;
    var pivotY = 164 + liftY;

    // Far plane: River ripples & gravel banks from atlas-54.webp
    S.drawScissorCutout(
      ctx, aImg, 0, 0, 382, 185, 118, 24, 1044, 232,
      [[0.02, 0.04], [0.98, 0.04], [0.97, 0.94], [0.03, 0.94]],
      { filter: "mono", haloWidth: 0, shadow: false, alpha: 0.70 }
    );

    B.drawLanternHalo(ctx, 640, 325 + liftY, 305, {
      color: cfg.archGlowCol || "#eab308",
      coreColor: cfg.archCoreCol || "#fef3c7",
      intensity: cfg.archGlow != null ? cfg.archGlow : 0.78,
      t: t
    });

    S.drawScissorCutout(
      ctx, aImg, 195, 118, 184, 278, 142, 224, 236, 305,
      [[0.10, 0.05], [0.88, 0.04], [0.96, 0.94], [0.04, 0.96]],
      { filter: "mono", haloWidth: 4.0 }
    );
    S.drawScissorCutout(
      ctx, aImg, 0, 460, 382, 210, 180, 448, 920, 174,
      [[0.02, 0.14], [0.35, 0.04], [0.68, 0.06], [0.98, 0.16], [0.96, 0.96], [0.04, 0.96]],
      { filter: "mono", haloWidth: 3.5 }
    );

    if (typeof cfg.behindArchFn === "function") {
      cfg.behindArchFn(ctx, pivotX, pivotY);
    }

    // Hero Stone Arch Cutouts from p13.jpg (with optional levitation liftY!)
    ctx.save();
    ctx.translate(0, liftY);
    S.drawScissorCutout(
      ctx, pImg, 114, 162, 174, 286, 226, 98, 256, 424,
      [[0.12, 0.06], [0.92, 0.02], [0.76, 0.96], [0.08, 0.96]],
      { filter: "sepia", haloWidth: 4.5 }
    );
    S.drawScissorCutout(
      ctx, pImg, 356, 162, 170, 286, 798, 98, 256, 424,
      [[0.08, 0.02], [0.88, 0.06], [0.92, 0.96], [0.24, 0.96]],
      { filter: "sepia", haloWidth: 4.5 }
    );
    S.drawScissorCutout(
      ctx, pImg, 200, 112, 244, 104, 424, 38, 432, 152,
      [[0.04, 0.28], [0.34, 0.04], [0.72, 0.04], [0.96, 0.28], [0.88, 0.92], [0.12, 0.92]],
      { filter: "sepia", haloWidth: 4.5 }
    );

    S.drawCardboardPuppetPiece(
      ctx,
      [[548, 126], [642, 154], [748, 118], [754, 132], [644, 170], [542, 140]],
      { tone: "#5c5348", ribs: 2 }
    );
    S.drawReinigerFiligreeHinge(ctx, 640, 164, 8.5, { metal: "brass" });
    ctx.restore();

    // Swinging Golden Brass Bell Cutout from p13.jpg (264, 184, 112, 108)
    var swing = cfg.bellSwing != null ? cfg.bellSwing : (Math.sin(t * 2.1) * 0.07);
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(swing);

    if (cfg.bellBlaze) {
      B.drawLanternHalo(ctx, 0, 82, 165 * cfg.bellBlaze, {
        color: "#fbbf24", coreColor: "#ffffff", intensity: 1.4 * cfg.bellBlaze, t: t
      });
    }

    S.drawScissorCutout(
      ctx, pImg, 264, 184, 112, 108, -78, 8, 156, 148,
      [[0.34, 0.02], [0.66, 0.02], [0.78, 0.24], [0.98, 0.86], [0.84, 0.98], [0.16, 0.98], [0.02, 0.86], [0.22, 0.24]],
      { haloWidth: 4.5, shadowY: 6 }
    );

    if (cfg.bellCrack) {
      // Jagged Liberty-Bell zigzag crack!
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(6, 36);
      ctx.lineTo(-10, 66);
      ctx.lineTo(12, 94);
      ctx.lineTo(-6, 124);
      ctx.lineTo(10, 148);
      ctx.stroke();
    }

    var clapperX = (cfg.clapperShift || 0) + Math.sin(t * 6.4) * 4;
    S.drawSplitPin(ctx, clapperX, 148, 8.0, { metal: "brass" });

    var ropeEndX = cfg.ropePullX != null ? cfg.ropePullX : Math.sin(t * 3.1) * 12;
    var ropeEndY = cfg.ropePullY != null ? cfg.ropePullY : 276;
    ctx.strokeStyle = "#fbfaf5";
    ctx.lineWidth = 8.5;
    ctx.beginPath();
    ctx.moveTo(clapperX, 154);
    ctx.quadraticCurveTo(ropeEndX * 0.5, 214, ropeEndX, ropeEndY);
    ctx.stroke();
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 5.0;
    ctx.stroke();
    ctx.strokeStyle = "#d4b982";
    ctx.lineWidth = 2.6;
    ctx.stroke();
    S.drawSplitPin(ctx, ropeEndX, ropeEndY, 5.2, { metal: "silver" });
    ctx.restore();

    if (typeof cfg.frontArchFn === "function") {
      var rWorldX = pivotX + ropeEndX * Math.cos(swing) - ropeEndY * Math.sin(swing);
      var rWorldY = pivotY + ropeEndX * Math.sin(swing) + ropeEndY * Math.cos(swing);
      cfg.frontArchFn(ctx, pivotX, pivotY, rWorldX, rWorldY);
    }

    // Foreground dark root/pebble corners (la-mort-en-ce-jardin depth cue)
    S.drawCardboardPuppetPiece(ctx, [[86, 640], [94, 514], [168, 488], [244, 548], [296, 640]], { tone: "#2b2c2e", ribs: 2 });
    S.drawCardboardPuppetPiece(ctx, [[984, 640], [1028, 536], [1118, 498], [1192, 524], [1196, 640]], { tone: "#2b2c2e", ribs: 2 });
  }

  B.definePortalGame(13, {
    drawBackdrop: function (ctx, W, H, resolved, plates, S) {
      S.drawBolasBackdrop(
        ctx, W, H, resolved.bolasStyle, 13, resolved.t,
        { showCaptions: resolved.showCaptions, lamp: resolved.lampOn, ballast: resolved.ballastOn },
        { pillarbox: true }
      );
    },

    drawRoot: function (ctx, W, H, resolved, plates, S) {
      var t = resolved.t;
      drawArchBase(ctx, W, H, resolved, plates, S, {
        frontArchFn: function (c) {
          S.drawBrookTrout(c, 830 + Math.sin(t * 1.8) * 16, 396 + Math.cos(t * 2.2) * 6, 1.14, t, false);
        }
      });
      S.drawTurkeyInCorner(ctx, W, H, t, { x: 152, y: 506, scale: 1.04 });
    },

    stems: {
      x: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawArchBase(ctx, W, H, resolved, plates, S, {
          bellBlaze: u,
          frontArchFn: function (c, px, py) {
            B.drawVolumetricBeam(c, 395, 618, px, py + 82, {
              color: "#fbbf24", coreColor: "#ffffff", sourceRadius: 26, spread: 135, intensity: 1.35 * u, t: t
            });
            for (var sp = 0; sp < 6; sp++) {
              var a = t * 2.4 + sp * (TAU / 6);
              var sx = px + Math.cos(a) * (82 + Math.sin(t * 5 + sp) * 10);
              var sy = py + 82 + Math.sin(a) * 58;
              S.drawCutoutPaperEdge(c, starPoly(sx, sy, 12 * u, 4 * u, 4, a), "#fffbeb", "#d97706", { paperRim: 1, shadow: false });
            }
          }
        });
      },

      o: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        var kiss = Math.sin(resolved.stemT * 3.8) * 0.36 * u;
        drawArchBase(ctx, W, H, resolved, plates, S, {
          bellSwing: kiss,
          clapperShift: kiss * 36,
          frontArchFn: function (c, px, py) {
            drawSwirlingCurrent(c, S, 640, 355, 220 * u, 54, t, "rgba(248, 113, 113, 0.78)", 4);
            // Single crisp rim-kiss sound ring
            var ringU = ((t * 0.75) % 1);
            c.strokeStyle = "rgba(52, 211, 153, " + (1 - ringU).toFixed(3) + ")";
            c.lineWidth = 3.5;
            c.beginPath();
            c.arc(px, py + 95, 48 + ringU * 155, 0, TAU);
            c.stroke();
          }
        });
      },

      triangle: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        var tug = Math.abs(Math.sin(t * 5.2)) * 18 * u;
        drawArchBase(ctx, W, H, resolved, plates, S, {
          bellSwing: Math.sin(t * 5.2) * 0.24 * u,
          ropePullX: -22 * u,
          ropePullY: 276 + tug,
          frontArchFn: function (c, px, py, rx, ry) {
            var sx = lerp(360, 560, u);
            var sy = 468;
            B.drawSnailSilverTrail(c, 330, 480, sx, sy, u, t);
            S.drawMailSnail(c, sx, sy, 1.24, t, { hasReply: false });
            drawIKCardboardArm(c, S, sx + 18, sy - 6, 46, 44, rx, ry, -1, { w1: 7, w2: 5, tone1: "#b2bfae" });
            for (var k = 0; k < 2; k++) {
              var ru = ((t * 0.9 + k * 0.32) % 1);
              c.strokeStyle = "rgba(251, 191, 36, " + ((1 - ru) * u).toFixed(3) + ")";
              c.lineWidth = 3.0;
              c.beginPath();
              c.arc(px, py + 88, 45 + ru * 135, 0, TAU);
              c.stroke();
            }
          }
        });
      },

      square: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        var strike = B.springImpulse(resolved.stemT % 1.1, 16, 4.5);
        drawArchBase(ctx, W, H, resolved, plates, S, {
          bellSwing: -0.28 * strike,
          frontArchFn: function (c, px, py) {
            var hitX = px + 68;
            var hitY = py + 102;
            drawSubBrassTongs(c, S, 955, 565, lerp(860, hitX + strike * 18, u), lerp(460, hitY, u), 0.22);
            for (var sr = 0; sr < 4; sr++) {
              var ru = ((t * 1.1 + sr * 0.25) % 1);
              c.strokeStyle = "rgba(251, 191, 36, " + ((1 - ru) * 0.88).toFixed(3) + ")";
              c.lineWidth = 3.6;
              c.beginPath();
              c.arc(hitX - 30, hitY, 35 + ru * 185, 0, TAU);
              c.stroke();
            }
            B.drawDeterministicParticles(c, "brass_sparks", hitX, hitY, resolved.stemT * 0.8, { count: 18, loop: true });
          }
        });
      }
    },

    outcomes: {
      x: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Sneaky tripwire Thanksgiving dinner bell: glinting silver tripwire to napkin-wearing Reiniger shadow + frozen Turkey!
          var t = resolved.t;
          drawArchBase(ctx, W, H, resolved, plates, S, {
            bellBlaze: 0.8,
            bellSwing: Math.sin(t * 7.5) * 0.22,
            frontArchFn: function (c, px, py, rx, ry) {
              B.drawVolumetricBeam(c, 360, 610, 885, 365, { color: "#e2e8f0", spread: 145, intensity: 0.95, t: t });

              // Glinting taut silver tripwire across stone arch
              c.strokeStyle = "#f8fafc";
              c.lineWidth = 3.2;
              c.beginPath();
              c.moveTo(336, 452);
              c.lineTo(rx, ry);
              c.lineTo(895, 385);
              c.stroke();
              S.drawReinigerFiligreeHinge(c, 336, 452, 6.5, { metal: "silver" });

              // Cartoon napkin-wearing Lotte Reiniger shadow silhouette holding fork & carving knife!
              c.save();
              c.translate(905, 378);
              S.drawCardboardPuppetPiece(c, [[-56, 110], [-48, -28], [-22, -92], [24, -92], [52, -24], [58, 110]], {
                tone: "#171717", charcoal: false
              });
              // Tucked white paper dinner bib napkin
              S.drawCutoutPaperEdge(c, [[-26, -34], [26, -34], [34, 34], [0, 52], [-34, 34]], "#fbfaf5", "#14110d", { paperRim: 2, shadow: false });
              // Raised fork & knife hands
              var wave = Math.sin(t * 5.2) * 0.18;
              c.save();
              c.translate(-52, -16);
              c.rotate(-0.35 + wave);
              S.drawCardboardPuppetPiece(c, [[-6, 0], [6, 0], [10, -68], [-10, -68]], { tone: "#171717", shadow: false });
              c.restore();
              c.save();
              c.translate(52, -16);
              c.rotate(0.35 - wave);
              S.drawCardboardPuppetPiece(c, [[-6, 0], [6, 0], [14, -74], [-4, -64]], { tone: "#171717", shadow: false });
              c.restore();
              c.restore();
            }
          });
          S.drawTurkeyInCorner(ctx, 198, 492, 1.18, 0.2, { dispatch: 0.0 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Lit creek ferry landing lantern: warm golden halo fills arch as Brook Trout pulls alongside ferry post with Mail Snail!
          var t = resolved.t;
          var u = outSmooth(resolved, 0.8);
          drawArchBase(ctx, W, H, resolved, plates, S, {
            bellBlaze: 1.25,
            archGlow: 1.3,
            frontArchFn: function (c) {
              // Painted barber-striped creek ferry-crossing post on left bank
              for (var seg = 0; seg < 6; seg++) {
                S.drawCutoutPaperEdge(
                  c,
                  [[422, 326 + seg * 26], [448, 326 + seg * 26], [448, 352 + seg * 26], [422, 352 + seg * 26]],
                  seg % 2 === 0 ? "#0f8f80" : "#fbfaf5", "#14110d", { paperRim: 1.5, shadow: false }
                );
              }
              S.drawSplitPin(c, 435, 318, 7.5, { metal: "brass" });

              // Wooden ferry skiff gliding alongside landing post with Brook Trout & Mail Snail
              var skiffX = lerp(760, 615, u) + Math.sin(t * 2.2) * 8;
              var skiffY = 472 + Math.cos(t * 2.6) * 4;
              S.drawCardboardPuppetPiece(
                c,
                [[skiffX - 135, skiffY - 12], [skiffX + 135, skiffY - 12], [skiffX + 104, skiffY + 32], [skiffX - 104, skiffY + 32]],
                { tone: "#8c6d46", ribs: 2, pins: [[skiffX - 75, skiffY + 10], [skiffX + 75, skiffY + 10]] }
              );
              S.drawBrookTrout(c, skiffX + 38, skiffY - 36, 1.08, t, false);
              S.drawMailSnail(c, skiffX - 62, skiffY - 24, 1.16, t, { hasReply: true });
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Activated cosmic stargate toll arch: rippling cyan event-horizon water fills arch + Alien Saucer above keystone!
          var t = resolved.t;
          drawArchBase(ctx, W, H, resolved, plates, S, {
            archGlowCol: "#06b6d4",
            archCoreCol: "#cffafe",
            archGlow: 1.4,
            behindArchFn: function (c) {
              // Rippling vertical cyan event-horizon portal inside stone arch
              c.save();
              c.beginPath();
              c.arc(640, 355, 195, Math.PI, 0);
              c.lineTo(835, 510);
              c.lineTo(445, 510);
              c.closePath();
              c.fillStyle = "#083344";
              c.fill();
              c.clip();
              for (var ring = 7; ring >= 1; ring--) {
                var rr = ring * 28 + Math.sin(t * 4.5 + ring) * 8;
                c.strokeStyle = ring % 2 === 0 ? "#22d3ee" : "#a855f7";
                c.lineWidth = 5.5;
                c.beginPath();
                c.arc(640, 335, rr, 0, TAU);
                c.stroke();
              }
              c.restore();
            },
            frontArchFn: function (c) {
              S.drawAlienSaucer(c, 640, 86, 1.24, t, 640, 335, { beamSpread: 165 });
            }
          });
        }
      },

      o: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Four-bells submarine watch change: 4 expanding teal wave-rings pulse clockwise + Turkey checks brass pocket chronometer!
          var t = resolved.t;
          drawArchBase(ctx, W, H, resolved, plates, S, {
            bellSwing: Math.sin(t * 6.0) * 0.28,
            frontArchFn: function (c) {
              // 4 clockwise watch-bell wave stations at 12, 3, 6, 9 o'clock around arch
              var dirs = [[0, -135], [175, 0], [0, 135], [-175, 0]];
              var activeIdx = Math.floor(t * 2.2) % 4;
              for (var i = 0; i < 4; i++) {
                var wx = 640 + dirs[i][0];
                var wy = 320 + dirs[i][1];
                var pulse = i === activeIdx ? ((t * 2.2) % 1) : 0.35;
                c.strokeStyle = i === activeIdx ? "#2dd4bf" : "rgba(45, 212, 191, 0.45)";
                c.lineWidth = i === activeIdx ? 4.2 : 2.2;
                c.beginPath();
                c.arc(wx, wy, 24 + pulse * 48, 0, TAU);
                c.stroke();
              }

              // Brass pocket chronometer held open by Turkey at lower-left
              var cx = 295, cy = 455;
              c.fillStyle = "#d4a44c";
              c.strokeStyle = "#14110d";
              c.lineWidth = 3.5;
              c.beginPath();
              c.arc(cx, cy, 46, 0, TAU);
              c.fill();
              c.stroke();
              c.fillStyle = "#fbfaf5";
              c.beginPath();
              c.arc(cx, cy, 36, 0, TAU);
              c.fill();
              c.stroke();
              // 12 pure geometric watch ticks + sweeping hands
              for (var tk = 0; tk < 12; tk++) {
                var a = (tk / 12) * TAU;
                c.beginPath();
                c.moveTo(cx + Math.cos(a) * 28, cy + Math.sin(a) * 28);
                c.lineTo(cx + Math.cos(a) * 34, cy + Math.sin(a) * 34);
                c.stroke();
              }
              c.lineWidth = 3.0;
              c.beginPath();
              c.moveTo(cx, cy);
              c.lineTo(cx + Math.cos(t * 4.5) * 26, cy + Math.sin(t * 4.5) * 26);
              c.moveTo(cx, cy);
              c.lineTo(cx + Math.cos(t * 0.6) * 18, cy + Math.sin(t * 0.6) * 18);
              c.stroke();
              S.drawSplitPin(c, cx, cy - 52, 6.0, { metal: "brass" });
            }
          });
          S.drawTurkeyInCorner(ctx, 185, 492, 1.15, t, { dispatch: 0.7 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Ding-dong-ditch minnow pranksters: 3 tiny scissor-cut minnows peek around mossy arch giggling while Brook Trout shakes head!
          var t = resolved.t;
          drawArchBase(ctx, W, H, resolved, plates, S, {
            bellSwing: Math.sin(t * 8.2) * 0.34,
            frontArchFn: function (c) {
              var spots = [
                { x: 350, y: 265, dir: 1 },
                { x: 365, y: 365, dir: 1 },
                { x: 922, y: 305, dir: -1 }
              ];
              for (var m = 0; m < 3; m++) {
                var sp = spots[m];
                var peek = Math.sin(t * 4.5 + m * 1.4) * 14;
                var mx = sp.x + peek * sp.dir;
                var my = sp.y + Math.cos(t * 6.5 + m) * 5;
                S.drawBrookTrout(c, mx, my, 0.52, t * 1.6 + m, sp.dir > 0);
                // Little fin giggling over mouth + tiny laugh bubbles
                drawCutoutBubbles(c, S, 3, mx + sp.dir * 32, 18, my - 38, my - 4, t, 1320 + m);
              }
              // Exasperated Brook Trout shaking head center-bottom
              S.drawBrookTrout(c, 645 + Math.sin(t * 6.0) * 10, 442, 1.22, t, false, { tilt: Math.sin(t * 6.0) * 0.12 });
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Acoustic ripples lift boulder arch 40px+ off riverbed beneath the Alien Saucer!
          var t = resolved.t;
          var lift = -48 * outSmooth(resolved, 0.7) + Math.sin(t * 3.0) * 7;
          drawArchBase(ctx, W, H, resolved, plates, S, {
            archLiftY: lift,
            bellSwing: Math.sin(t * 4.4) * 0.25,
            behindArchFn: function (c) {
              // Standing golden acoustic levitation rings underneath both lifted arch bases!
              for (var side = -1; side <= 1; side += 2) {
                var bx = 640 + side * 290;
                for (var r = 0; r < 4; r++) {
                  var ry = 515 - r * 16 + Math.sin(t * 5 + r) * 3;
                  c.strokeStyle = r % 2 === 0 ? "#fbbf24" : "#34d399";
                  c.lineWidth = 3.4;
                  c.beginPath();
                  c.ellipse(bx, ry, 92 - r * 12, 14, 0, 0, TAU);
                  c.stroke();
                }
              }
            },
            frontArchFn: function (c) {
              // Floating loose riverbed pebbles hovering in zero-G
              for (var p = 0; p < 8; p++) {
                var px = 330 + p * 88;
                var py = 495 + Math.sin(t * 3.5 + p) * 18;
                S.drawCardboardPuppetPiece(c, [[px - 12, py - 8], [px + 12, py - 9], [px + 14, py + 8], [px - 10, py + 9]], {
                  tone: "#9ca3af", ribs: 1, shadow: false
                });
              }
              S.drawAlienSaucer(c, 640, 88, 1.22, t, 640, 240, { beamSpread: 220 });
            }
          });
        }
      },

      triangle: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Bridge toll paid in stamps: Mail Snail sticks triangle stamp onto boulder; hinged wooden toll-bar lifts!
          var t = resolved.t;
          var lift = outSmooth(resolved, 0.75);
          drawArchBase(ctx, W, H, resolved, plates, S, {
            frontArchFn: function (c) {
              // Big emerald triangular postage stamp stuck onto left stone pillar
              S.drawCutoutPaperEdge(
                c,
                [[318, 392], [364, 316], [410, 392]],
                "#0f8f80", "#fbfaf5", { paperRim: 3.5 }
              );
              c.strokeStyle = "#fbfaf5";
              c.lineWidth = 2.0;
              c.beginPath();
              c.arc(364, 368, 12, 0, TAU);
              c.stroke();

              // Hinged red-and-white striped wooden toll-bar lifting smoothly on brass split-pin
              c.save();
              c.translate(425, 438);
              c.rotate(-0.98 * lift);
              for (var sb = 0; sb < 7; sb++) {
                S.drawCutoutPaperEdge(
                  c,
                  [[sb * 56, -12], [(sb + 1) * 56, -12], [(sb + 1) * 56, 12], [sb * 56, 12]],
                  sb % 2 === 0 ? "#d42a1e" : "#fbfaf5", "#14110d", { paperRim: 1.2, shadow: false }
                );
              }
              S.drawReinigerFiligreeHinge(c, 0, 0, 8.0, { metal: "brass" });
              c.restore();

              S.drawMailSnail(c, 365, 448, 1.22, t, { hasReply: true });
            }
          });
          S.drawTurkeyInCorner(ctx, 185, 495, 1.14, t, { dispatch: 0.65 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Polite creek ferryman answers bell: Brook Trout in flat straw hat poles a leaf-and-twig skiff beneath arch!
          var t = resolved.t;
          var u = outSmooth(resolved, 0.85);
          drawArchBase(ctx, W, H, resolved, plates, S, {
            frontArchFn: function (c) {
              var sx = lerp(830, 625, u) + Math.sin(t * 2.0) * 8;
              var sy = 468 + Math.cos(t * 2.4) * 4;

              // Curled green leaf-and-twig skiff boat
              S.drawCutoutPaperEdge(
                c,
                [[sx - 140, sy - 22], [sx - 75, sy + 28], [sx + 95, sy + 28], [sx + 148, sy - 28], [sx + 40, sy - 6], [sx - 55, sy - 6]],
                "#2d6a4f", "#14110d", { paperRim: 3.5 }
              );
              // Long bamboo ferry pole held by Brook Trout
              c.strokeStyle = "#d9a23d";
              c.lineWidth = 6.0;
              c.beginPath();
              c.moveTo(sx + 10, sy - 76);
              c.lineTo(sx + 78 + Math.sin(t * 2.8) * 14, 548);
              c.stroke();

              S.drawBrookTrout(c, sx + 22, sy - 34, 1.15, t, false);
              drawStrawBoaterHat(c, S, sx - 32, sy - 64, -0.08, 0.95);
              S.drawMailSnail(c, 455, 468, 1.22, t, { hasReply: true });
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Saucer drops interstellar toll coin: spinning luminescent hexagon coin floats into Mail Snail's brass toll cup!
          var t = resolved.t;
          drawArchBase(ctx, W, H, resolved, plates, S, {
            bellSwing: Math.sin(t * 5.8) * 0.24,
            frontArchFn: function (c) {
              S.drawAlienSaucer(c, 640, 92, 1.20, t, 565, 445, { beamSpread: 125 });
              B.drawTractorRings(c, 640, 112, 565, 440, t, { spread: 105, rings: 5 });

              // Spinning luminescent hexagon coin descending into brass toll cup
              var cyc = (t * 0.65) % 1;
              var coinX = lerp(640, 568, cyc);
              var coinY = lerp(145, 412, easeInOutCubic(cyc));
              var spinW = Math.max(0.22, Math.abs(Math.cos(t * 5.5)));
              c.save();
              c.translate(coinX, coinY);
              c.scale(spinW, 1);
              var hex = [];
              for (var h = 0; h < 6; h++) {
                var ha = (h / 6) * TAU;
                hex.push([Math.cos(ha) * 24, Math.sin(ha) * 24]);
              }
              S.drawCutoutPaperEdge(c, hex, "#22d3ee", "#fbbf24", { paperRim: 2.5, shadow: false });
              c.restore();

              // Brass toll cup held by Mail Snail
              S.drawCardboardPuppetPiece(c, [[544, 418], [592, 418], [584, 462], [552, 462]], {
                tone: "#d4a44c", ribs: 1, pin: { x: 568, y: 440, r: 4.0, metal: "brass" }
              });
              S.drawMailSnail(c, 492, 462, 1.22, t, { hasReply: true, hasAlienStamp: true });
            }
          });
        }
      },

      square: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Cracked Liberty-bell pebble avalanche: zigzag crack on cutout bell + pebble confetti pattering onto sub nose!
          var t = resolved.t;
          drawArchBase(ctx, W, H, resolved, plates, S, {
            bellCrack: true,
            bellSwing: Math.sin(t * 7.0) * 0.14,
            frontArchFn: function (c) {
              // Submarine tin nosecone at bottom-left being pelted by bouncing pebble confetti
              S.drawCardboardPuppetPiece(c, [[110, 445], [335, 462], [358, 535], [110, 555]], {
                tone: "#6b7280", ribs: 3, pins: [[295, 485], [295, 520]]
              });
              for (var pb = 0; pb < 14; pb++) {
                var pu = ((t * (0.85 + (pb % 4) * 0.18) + pb * 0.13) % 1);
                var px = 265 + (S.hash(pb * 7.3) - 0.5) * 340;
                var py = lerp(135, 475, pu * pu);
                S.drawCutoutPaperEdge(
                  c,
                  [[px - 10, py - 8], [px + 11, py - 7], [px + 9, py + 8], [px - 9, py + 7]],
                  pb % 2 === 0 ? "#a8a29e" : "#d6d3d1", "#14110d", { paperRim: 1.5, shadow: false }
                );
              }
            }
          });
          S.drawTurkeyInCorner(ctx, 195, 495, 1.12, t, { dispatch: 0.9 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Trading-post counter opens for business: hinged flat rock flips down into shop counter stacked with buttons & shells!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawArchBase(ctx, W, H, resolved, plates, S, {
            frontArchFn: function (c) {
              // Bespectacled shopkeeper trout from atlas-54 behind counter
              S.drawScissorCutout(
                c, plates.atlasImg, 92, 156, 186, 275, 535, 292, 145, 178,
                [[0.16, 0.04], [0.84, 0.04], [0.95, 0.65], [0.80, 0.96], [0.20, 0.96], [0.05, 0.65]],
                { filter: "mono", haloWidth: 4.0 }
              );

              // Hinged flat rock counter flipped forward on brass chains
              c.strokeStyle = "#d4a44c";
              c.lineWidth = 3.0;
              c.beginPath();
              c.moveTo(435, 375); c.lineTo(445, 442);
              c.moveTo(845, 375); c.lineTo(835, 442);
              c.stroke();

              S.drawCardboardPuppetPiece(
                c,
                [[425, 438], [855, 438], [875, 488], [405, 488]],
                { tone: "#78716c", ribs: 2, pins: [[445, 462], [640, 462], [835, 462]] }
              );

              // Colorful 4-hole buttons & spiral shells displayed on counter
              var btnCols = ["#d42a1e", "#fbbf24", "#0f8f80", "#3b82f6", "#ec4899"];
              for (var bi = 0; bi < 5; bi++) {
                var bx = 468 + bi * 84;
                var by = 430 - Math.abs(Math.sin(t * 3 + bi)) * 3;
                c.fillStyle = btnCols[bi];
                c.strokeStyle = "#14110d";
                c.lineWidth = 2.2;
                c.beginPath();
                c.arc(bx, by, 15 * pop, 0, TAU);
                c.fill();
                c.stroke();
                c.fillStyle = "#fbfaf5";
                c.beginPath();
                c.arc(bx - 4, by - 4, 2.2, 0, TAU);
                c.arc(bx + 4, by - 4, 2.2, 0, TAU);
                c.arc(bx - 4, by + 4, 2.2, 0, TAU);
                c.arc(bx + 4, by + 4, 2.2, 0, TAU);
                c.fill();
              }

              S.drawBrookTrout(c, 895, 412 + Math.sin(t * 2.4) * 6, 1.14, t, false);
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Meteor dinner gong summons fleet: massive rust-and-gold shockwave rings bring 3-eyed Saucer + 2 mini wing-saucers!
          var t = resolved.t;
          drawArchBase(ctx, W, H, resolved, plates, S, {
            bellBlaze: 1.1,
            bellSwing: Math.sin(t * 9.0) * 0.32,
            frontArchFn: function (c, px, py) {
              for (var gr = 0; gr < 5; gr++) {
                var gu = ((t * 0.85 + gr * 0.2) % 1);
                c.strokeStyle = gr % 2 === 0
                  ? "rgba(212, 42, 30, " + (1 - gu).toFixed(3) + ")"
                  : "rgba(251, 191, 36, " + (1 - gu).toFixed(3) + ")";
                c.lineWidth = 4.2;
                c.beginPath();
                c.ellipse(px, py + 80 - gu * 140, 75 + gu * 340, 26 + gu * 85, 0, 0, TAU);
                c.stroke();
              }
              // Delta squadron: main Alien Saucer + two synchronized mini wing-saucers!
              S.drawAlienSaucer(c, 640, 96, 1.24, t, 640, 320, { beamSpread: 145 });
              S.drawAlienSaucer(c, 355, 148 + Math.sin(t * 3.1) * 8, 0.78, t + 0.8, 385, 420, { beamSpread: 85 });
              S.drawAlienSaucer(c, 925, 148 + Math.cos(t * 3.1) * 8, 0.78, t + 1.6, 895, 420, { beamSpread: 85 });
            }
          });
        }
      }
    },

    drawForeground: function (ctx, W, H, resolved, plates, S) {
      drawSubtleCornerBezel(ctx, W, H, resolved, S);
    }
  });

  /* ==========================================================================
   * PORTHOLE #14 · TOWER ("perec-stage")
   * Clue: Sinking crimson autumn maple leaf (p14.jpg + atlas-02.webp)
   * ========================================================================== */

  var MAPLE_POLY_14 = [
    [0.52, 0.02], [0.68, 0.22], [0.96, 0.18], [0.84, 0.48],
    [0.98, 0.66], [0.74, 0.80], [0.82, 0.94], [0.52, 0.86],
    [0.32, 0.98], [0.28, 0.82], [0.06, 0.72], [0.18, 0.52],
    [0.04, 0.24], [0.34, 0.26]
  ];

  function drawMapleLeaf14(ctx, S, pImg, x, y, size, rot, opts) {
    var cfg = opts || {};
    var half = (size || 210) * 0.5;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    S.drawScissorCutout(
      ctx, pImg, 242, 228, 158, 155, -half, -half, half * 2, half * 2,
      MAPLE_POLY_14,
      {
        haloWidth: cfg.haloWidth != null ? cfg.haloWidth : 4.2,
        filter: cfg.filter || "none",
        tint: cfg.tint || null,
        shadow: cfg.shadow !== false
      }
    );
    if (cfg.veins) {
      ctx.strokeStyle = cfg.veinColor || "#fef08a";
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-half * 0.18, half * 0.78);
      ctx.lineTo(0, -half * 0.82);
      ctx.moveTo(0, half * 0.15); ctx.lineTo(-half * 0.72, -half * 0.36);
      ctx.moveTo(0, half * 0.15); ctx.lineTo(half * 0.74, -half * 0.42);
      ctx.moveTo(0, half * 0.38); ctx.lineTo(-half * 0.68, half * 0.26);
      ctx.moveTo(0, half * 0.38); ctx.lineTo(half * 0.70, half * 0.22);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTowerCasementStage(ctx, W, H, resolved, plates, S, innerFn) {
    var t = resolved.t;
    ctx.save();
    ctx.beginPath();
    ctx.rect(236, 66, 808, 546);
    ctx.clip();

    S.drawScissorCutout(
      ctx, plates.atlasImg, 48, 18, 644, 344, 246, 72, 788, 396,
      [[0.02, 0.04], [0.98, 0.04], [0.98, 0.96], [0.02, 0.96]],
      { filter: "cyan", haloWidth: 0, shadow: false, alpha: 0.56 }
    );
    S.drawNorsteinFog(ctx, W, H, t, 0.26, "216, 232, 234");
    B.drawWaterCaustics(ctx, W, H, t, { intensity: 0.16, color: "#bae6fd", topY: 74 });

    S.drawScissorCutout(
      ctx, plates.portholeImg, 118, 360, 404, 162, 256, 444, 768, 172,
      [[0.02, 0.22], [0.28, 0.06], [0.74, 0.08], [0.98, 0.24], [0.98, 0.98], [0.02, 0.98]],
      { filter: "cyan", haloWidth: 4.0 }
    );

    if (typeof innerFn === "function") {
      innerFn(ctx, t);
    }

    S.drawNorsteinFog(ctx, W, H, t + 3.7, 0.15, "235, 240, 238");
    ctx.restore();
  }

  B.definePortalGame(14, {
    drawBackdrop: function (ctx, W, H, resolved, plates, S) {
      S.drawBolasBackdrop(
        ctx, W, H, resolved.bolasStyle, 14, resolved.t,
        { showCaptions: resolved.showCaptions, lamp: resolved.lampOn, ballast: resolved.ballastOn },
        { openX: 236, openY: 66, openW: 808, openH: 546, doors: true }
      );
    },

    drawRoot: function (ctx, W, H, resolved, plates, S) {
      var t = resolved.t;
      drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
        var lx = 640 + Math.sin(t * 1.45) * 58;
        var ly = lerp(215, 345, (Math.sin(t * 0.85) + 1) * 0.5);
        B.drawLanternHalo(c, lx, ly, 128, { color: "#ef4444", coreColor: "#fed7aa", intensity: 0.65, t: t });
        drawMapleLeaf14(c, S, plates.portholeImg, lx, ly, 212, Math.sin(t * 1.45 + 0.6) * 0.24);
        drawCutoutBubbles(c, S, 9, lx, 85, 86, ly - 48, t, 1401);
        S.drawBrookTrout(c, 885, 342 + Math.sin(t * 2.1) * 7, 1.04, t, false);
      });
      S.drawTurkeyInCorner(ctx, W, H, t, { x: 142, y: 508, scale: 1.04 });
    },

    stems: {
      x: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
          var lx = 640 + Math.sin(t * 1.5) * 28;
          var ly = 286;
          B.drawVolumetricBeam(c, 420, 608, lx, ly, {
            color: "#f97316", coreColor: "#fef08a", sourceRadius: 28, spread: 155, intensity: 1.35 * u, t: t
          });
          B.drawLanternHalo(c, lx, ly, 175 * u + 40, { color: "#dc2626", coreColor: "#fef9c3", intensity: 1.3 * u, t: t });
          drawMapleLeaf14(c, S, plates.portholeImg, lx, ly, 226, Math.sin(t * 2.0) * 0.12, {
            veins: true,
            veinColor: "#fef08a"
          });
        });
      },

      o: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
          var ly = lerp(375, 198, u) + Math.sin(t * 3.4) * 10;
          var lx = 640 + Math.cos(t * 3.8) * 46 * u;
          drawCutoutBubbles(c, S, 18, 640, 145, 95, 585, t, 1402, "rgba(254, 202, 202, 0.85)");
          drawSwirlingCurrent(c, S, lx, ly + 55, 115, 28, t * 1.3, "rgba(251, 146, 60, 0.78)", 3);
          drawMapleLeaf14(c, S, plates.portholeImg, lx, ly, 208, t * 2.2 * u);
        });
      },

      triangle: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
          var sx = lerp(360, 560, u);
          var sy = 548;
          B.drawSnailSilverTrail(c, 320, 562, sx, sy, u, t);
          var lx = lerp(640, sx + 34, u);
          var ly = lerp(290, 412, u);
          drawMapleLeaf14(c, S, plates.portholeImg, lx, ly, 196, -0.18 + Math.sin(t * 2.6) * 0.08);
          S.drawMailSnail(c, sx, sy, 1.32, t, { hasReply: false });
          // Extended snail antennas pinching the maple stem neatly
          c.strokeStyle = "#14110d";
          c.lineWidth = 3.2;
          c.beginPath();
          c.moveTo(sx + 26, sy - 14);
          c.quadraticCurveTo(sx + 44, sy - 64, lx - 18, ly + 68);
          c.stroke();
        });
      },

      square: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
          var lx = 635;
          var ly = 296;
          drawMapleLeaf14(c, S, plates.portholeImg, lx, ly, 214, -0.10, { veins: true, veinColor: "#fde68a" });
          var stemTipX = lx - 18;
          var stemTipY = ly + 78;
          drawSubBrassTongs(c, S, 960, 565, lerp(850, stemTipX, u), lerp(470, stemTipY, u), 0.12);
          B.drawDeterministicParticles(c, "brass_sparks", stemTipX, stemTipY, resolved.stemT * 0.7, { count: 12, loop: true });
        });
      }
    },

    outcomes: {
      x: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Scary November calendar countdown page: red wall-calendar sheet swirling in mist while Turkey gulps!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
            var cx = 640 + Math.sin(t * 2.0) * 18;
            var cy = 292 + Math.cos(t * 2.6) * 10;
            c.save();
            c.translate(cx, cy);
            c.rotate(Math.sin(t * 2.2) * 0.09);
            c.scale(pop, pop);

            S.drawTornPaperFlat(c, -135, -125, 270, 250, {
              fill: "#fbfaf5", paperColor: "#fecaca", deckle: 6, stroke: "#14110d"
            });
            // Red top header banner of wall calendar
            c.fillStyle = "#d42a1e";
            c.fillRect(-130, -120, 260, 54);
            // Spiral wire calendar rings along top
            for (var rg = -5; rg <= 5; rg++) {
              S.drawSplitPin(c, rg * 22, -120, 4.2, { metal: "silver" });
            }
            // Calendar day grid (4x3 boxes) + scary red circle & 4 tally bars!
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 1.8;
            for (var r = 0; r < 3; r++) {
              for (var col = 0; col < 4; col++) {
                var gx = -112 + col * 56;
                var gy = -50 + r * 52;
                c.strokeRect(gx, gy, 50, 46);
                if (r < 2 || col < 3) {
                  // Crossed-off countdown days!
                  c.strokeStyle = "#d42a1e";
                  c.lineWidth = 2.6;
                  c.beginPath();
                  c.moveTo(gx + 8, gy + 8); c.lineTo(gx + 42, gy + 38);
                  c.moveTo(gx + 42, gy + 8); c.lineTo(gx + 8, gy + 38);
                  c.stroke();
                  c.strokeStyle = "#cbd5e1";
                  c.lineWidth = 1.8;
                } else {
                  // Final circled Thanksgiving day with miniature crimson maple crest!
                  c.strokeStyle = "#d42a1e";
                  c.lineWidth = 4.0;
                  c.beginPath();
                  c.arc(gx + 25, gy + 23, 22, 0, TAU);
                  c.stroke();
                }
              }
            }
            drawMapleLeaf14(c, S, plates.portholeImg, -88, -92, 54, -0.2, { haloWidth: 2, shadow: false });
            drawPropLabel(c, resolved, "NOV 28", 16, -92, { color: "#ffffff", font: '800 26px "Big Shoulders Display", sans-serif' });
            c.restore();
          });
          S.drawTurkeyInCorner(ctx, 152, 502, 1.16, t * 2.0, { dispatch: 0.1 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Bright scarlet cardinal bird feather drifting past Brook Trout and Mail Snail in sunbeams!
          var t = resolved.t;
          drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
            B.drawVolumetricBeam(c, 330, 72, 740, 560, {
              color: "#fde68a", coreColor: "#ffffff", sourceRadius: 65, spread: 210, intensity: 1.05, t: t
            });

            var fx = 595 + Math.sin(t * 1.8) * 52;
            var fy = 295 + Math.cos(t * 1.4) * 26;
            c.save();
            c.translate(fx, fy);
            c.rotate(-0.28 + Math.sin(t * 1.8) * 0.18);
            // Curved ivory quill shaft
            c.strokeStyle = "#fbfaf5";
            c.lineWidth = 8.0;
            c.beginPath();
            c.moveTo(-148, 66);
            c.quadraticCurveTo(-12, -10, 146, -54);
            c.stroke();
            // Soft scarlet cardinal feather barbs around real p14 crimson core
            S.drawCutoutPaperEdge(
              c,
              [[-108, 48], [-46, -42], [52, -74], [148, -56], [106, 18], [22, 52], [-68, 62]],
              "#dc2626", "#14110d", { paperRim: 4.0 }
            );
            S.drawScissorCutout(
              c, plates.portholeImg, 252, 236, 138, 132, -66, -54, 154, 96,
              [[0.08, 0.48], [0.38, 0.08], [0.92, 0.14], [0.96, 0.72], [0.44, 0.94]],
              { haloWidth: 2.0, shadow: false }
            );
            c.strokeStyle = "rgba(20,17,13,0.5)";
            c.lineWidth = 1.6;
            for (var b = -4; b <= 5; b++) {
              c.beginPath();
              c.moveTo(b * 22, -8 - b * 4); c.lineTo(b * 22 + 14, -46 - b * 3);
              c.moveTo(b * 22, -8 - b * 4); c.lineTo(b * 22 + 18, 28 - b * 2);
              c.stroke();
            }
            c.restore();

            S.drawBrookTrout(c, 845, 368 + Math.sin(t * 2.4) * 8, 1.16, t, false);
            S.drawMailSnail(c, 435, 535, 1.20, t, { hasReply: true });
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Solar-sail Martian landing craft: gold mylar struts steering crimson sail smoothly up toward Alien Saucer!
          var t = resolved.t;
          var u = outSmooth(resolved, 0.85);
          drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
            S.drawAlienSaucer(c, 640, 118, 1.18, t, 640, 340, { beamSpread: 155 });

            var sx = 640 + Math.sin(t * 2.0) * 32;
            var sy = lerp(415, 292, u) + Math.cos(t * 2.5) * 8;
            c.save();
            c.translate(sx, sy);
            c.rotate(Math.sin(t * 2.0) * 0.12);
            S.drawCutoutPaperEdge(c, [[0, -138], [148, -14], [0, 78], [-148, -14]], "#f59e0b", "#14110d", { paperRim: 3.5 });
            drawMapleLeaf14(c, S, plates.portholeImg, 0, -24, 168, 0, { veins: true, veinColor: "#fef08a", shadow: false });
            S.drawCardboardPuppetPiece(c, [[-28, 28], [28, 28], [36, 70], [-36, 70]], {
              tone: "#94a3b8", ribs: 1, pin: { x: 0, y: 48, r: 4.8, metal: "brass" }
            });
            drawIKCardboardArm(c, S, -24, 64, 46, 44, -72, 118, -1, { w1: 7, w2: 5 });
            drawIKCardboardArm(c, S, 24, 64, 46, 44, 72, 118, 1, { w1: 7, w2: 5 });
            c.restore();
          });
        }
      },

      o: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Rewinding autumn back to summer: bubbles lift maple leaf to top shutter & crimson cross-fades to bright emerald green!
          var t = resolved.t;
          var greenU = outSmooth(resolved, 0.75);
          drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
            var lx = 640 + Math.sin(t * 2.2) * 28;
            var ly = lerp(340, 188, greenU) + Math.cos(t * 2.8) * 8;
            drawCutoutBubbles(c, S, 20, lx, 160, 95, 560, t, 1411, "rgba(167, 243, 208, 0.9)");
            B.drawLanternHalo(c, lx, ly, 165, { color: "#10b981", coreColor: "#ecfccb", intensity: 1.25, t: t });

            // Bright summer emerald-chlorophyll maple leaf!
            drawMapleLeaf14(c, S, plates.portholeImg, lx, ly, 224, Math.sin(t * 1.8) * 0.16, {
              filter: "hue-rotate(128deg) saturate(1.65) brightness(1.12)",
              tint: "rgba(16, 185, 129, 0.34)",
              veins: true,
              veinColor: "#bef264"
            });

            for (var sp = 0; sp < 6; sp++) {
              var a = t * 1.7 + sp * (TAU / 6);
              S.drawCutoutPaperEdge(c, starPoly(lx + Math.cos(a) * 135, ly + Math.sin(a) * 95, 13, 5, 4, a), "#fde047", "#15803d", { paperRim: 1.2, shadow: false });
            }
          });
          S.drawTurkeyInCorner(ctx, 152, 494, 1.18, t, { dispatch: 0.95 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Cozy red blanket for minnow: maple leaf settles onto mossy ledge like a quilt while Brook Trout tiptoes shushing!
          var t = resolved.t;
          drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
            // Mossy sleeping ledge at (520, 495)
            S.drawCardboardPuppetPiece(c, [[380, 488], [665, 488], [685, 545], [360, 545]], {
              tone: "#4d6b53", ribs: 2
            });
            // Sleeping baby minnow head peeking from left of maple leaf quilt
            S.drawBrookTrout(c, 485, 476, 0.58, 0.1, false);
            // Closed sleeping eyelid arc
            c.strokeStyle = "#14110d";
            c.lineWidth = 2.4;
            c.beginPath();
            c.arc(452, 473, 5, 0, Math.PI);
            c.stroke();

            // Crimson maple leaf tucked neatly over the sleeping minnow like a quilt!
            drawMapleLeaf14(c, S, plates.portholeImg, 548, 474 + Math.sin(t * 1.8) * 3, 178, 0.92);

            // Rising sleepy pearl bubbles
            drawCutoutBubbles(c, S, 5, 452, 24, 355, 458, t * 0.55, 1412);

            // Brook Trout tiptoeing past on right holding fin to lips ("shhh!")
            var tx = 835 + Math.sin(t * 1.6) * 14;
            var ty = 396 + Math.abs(Math.cos(t * 3.2)) * 8;
            S.drawBrookTrout(c, tx, ty, 1.20, t, false);
            drawIKCardboardArm(c, S, tx - 38, ty + 14, 34, 32, tx - 78, ty - 4, -1, { w1: 7, w2: 5, tone1: "#b87458" });
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Swirling red storm of Jupiter: crimson leaf spins into banded Jovian vortex orbited by 4 pearl moons beneath Saucer!
          var t = resolved.t;
          drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
            S.drawAlienSaucer(c, 640, 112, 1.18, t, 640, 336, { beamSpread: 175 });

            var jx = 640, jy = 338;
            // Banded Jovian storm sphere
            c.save();
            c.beginPath();
            c.arc(jx, jy, 96, 0, TAU);
            c.fillStyle = "#c2410c";
            c.fill();
            c.clip();
            var bands = ["#fed7aa", "#ea580c", "#fde68a", "#9a3412", "#fdba74"];
            for (var bi = 0; bi < bands.length; bi++) {
              c.fillStyle = bands[bi];
              c.fillRect(jx - 110, jy - 96 + bi * 38 + Math.sin(t * 3 + bi) * 4, 220, 22);
            }
            // Spinning crimson maple leaf Great Red Spot core
            drawMapleLeaf14(c, S, plates.portholeImg, jx, jy, 132, t * 4.2, { haloWidth: 2, shadow: false });
            c.restore();
            c.strokeStyle = "#14110d";
            c.lineWidth = 3.5;
            c.beginPath();
            c.arc(jx, jy, 96, 0, TAU);
            c.stroke();

            // 4 orbiting pearl Galilean moons
            for (var m = 0; m < 4; m++) {
              var ma = t * (1.5 + m * 0.35) + m * 1.6;
              var mrX = 142 + m * 24;
              var mrY = 34 + m * 8;
              var mx = jx + Math.cos(ma) * mrX;
              var my = jy + Math.sin(ma) * mrY;
              c.strokeStyle = "rgba(254, 243, 199, 0.28)";
              c.lineWidth = 1.4;
              c.beginPath();
              c.ellipse(jx, jy, mrX, mrY, 0, 0, TAU);
              c.stroke();
              c.fillStyle = "#fbfaf5";
              c.strokeStyle = "#14110d";
              c.lineWidth = 2.0;
              c.beginPath();
              c.arc(mx, my, 9 + (m % 2) * 3, 0, TAU);
              c.fill();
              c.stroke();
            }
          });
        }
      },

      triangle: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Stamped Canadian postcard from north: Mail Snail mounts red maple leaf onto cream postcard frame with wave postmarks!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
            c.save();
            c.translate(640, 296);
            c.rotate(Math.sin(t * 1.8) * 0.04);
            c.scale(pop, pop);

            S.drawTornPaperFlat(c, -185, -118, 370, 236, {
              fill: "#fbfaf5", paperColor: "#e2e8f0", deckle: 6, stroke: "#14110d"
            });
            // Red flanking Canadian-flag-inspired side borders + mounted real crimson maple leaf center!
            c.fillStyle = "#d42a1e";
            c.fillRect(-180, -112, 58, 224);
            c.fillRect(122, -112, 58, 224);
            drawMapleLeaf14(c, S, plates.portholeImg, 0, 0, 152, 0, { haloWidth: 3.0 });

            // Wavy postal cancellation postmarks in upper-right
            c.strokeStyle = "#0f8f80";
            c.lineWidth = 2.4;
            c.beginPath();
            c.arc(82, -74, 22, 0, TAU);
            c.stroke();
            for (var wv = 0; wv < 3; wv++) {
              c.beginPath();
              c.moveTo(18, -86 + wv * 11);
              c.bezierCurveTo(34, -92 + wv * 11, 46, -80 + wv * 11, 62, -86 + wv * 11);
              c.stroke();
            }
            c.restore();

            S.drawMailSnail(c, 535, 488, 1.32, t, { hasReply: true });
          });
          S.drawTurkeyInCorner(ctx, 152, 502, 1.14, t, { dispatch: 0.65 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Autumn sailboat for Mail Snail: curled leaf stem acts as curved prow while Mail Snail steers with Brook Trout escorting!
          var t = resolved.t;
          drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
            var bx = 575 + Math.sin(t * 1.6) * 55;
            var by = 446 + Math.cos(t * 2.8) * 8;

            // Rippling white foam wake rings
            drawSwirlingCurrent(c, S, bx, by + 28, 138, 18, t, "rgba(251, 250, 245, 0.78)", 3);

            // Crimson maple leaf hull + billowing smaller leaf mainsail on twig mast!
            S.drawCutoutPaperEdge(
              c,
              [[bx - 128, by - 12], [bx - 82, by + 32], [bx + 96, by + 32], [bx + 142, by - 28], [bx + 18, by + 4]],
              "#b91c1c", "#14110d", { paperRim: 3.5 }
            );
            c.strokeStyle = "#5c4028";
            c.lineWidth = 6.0;
            c.beginPath();
            c.moveTo(bx + 8, by + 8);
            c.lineTo(bx + 8, by - 158);
            c.stroke();
            drawMapleLeaf14(c, S, plates.portholeImg, bx + 26, by - 88, 142, 0.22);

            S.drawMailSnail(c, bx - 38, by - 8, 1.24, t, { hasReply: true });
            S.drawBrookTrout(c, bx + 225, by - 36 + Math.sin(t * 2.6) * 8, 1.15, t, false);
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Botanical specimen beamed to Saucer: emerald tractor beam cradles crimson leaf into sunlit glass dome atop Saucer!
          var t = resolved.t;
          var u = outSmooth(resolved, 0.85);
          drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
            var sx = 640, sy = 148;
            B.drawTractorRings(c, sx, sy + 18, 565, 515, t, { spread: 130, rings: 6 });

            var leafY = lerp(445, 248, u) + Math.sin(t * 3.0) * 8;
            var leafX = lerp(575, 640, u);
            B.drawLanternHalo(c, leafX, leafY, 115, { color: "#34d399", coreColor: "#fef08a", intensity: 1.1, t: t });
            drawMapleLeaf14(c, S, plates.portholeImg, leafX, leafY, 165, t * 0.9, { veins: true });

            S.drawAlienSaucer(c, sx, sy, 1.20, t, false);
            // Extra sunlit glass botanical terrarium dome atop Saucer!
            c.fillStyle = "rgba(187, 247, 208, 0.55)";
            c.strokeStyle = "#fbbf24";
            c.lineWidth = 3.0;
            c.beginPath();
            c.arc(sx, sy - 34, 38, Math.PI, 0);
            c.closePath();
            c.fill();
            c.stroke();

            S.drawMailSnail(c, 545, 534, 1.24, t, { rot: -0.22, hasReply: true, hasAlienStamp: true });
          });
        }
      },

      square: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Crunchy dry leaf proves autumn: brass tongs nip one dry tip, releasing 8 warm amber paper flecks!
          var t = resolved.t;
          drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
            var lx = 635, ly = 265;
            drawMapleLeaf14(c, S, plates.portholeImg, lx, ly, 208, -0.14);
            drawSubBrassTongs(c, S, 960, 565, lx + 78, ly - 18, 0.08 + Math.abs(Math.sin(t * 5)) * 0.16);

            // 8 warm amber & russet triangular paper flecks drifting peacefully leftward/downward toward Turkey!
            var fleckCols = ["#f59e0b", "#d97706", "#dc2626", "#fbbf24"];
            for (var fi = 0; fi < 8; fi++) {
              var fu = ((t * 0.42 + fi / 8) % 1);
              var fx = lerp(lx + 68, 310, fu) + Math.sin(fu * TAU + fi) * 24;
              var fy = lerp(ly - 12, 525, fu);
              c.save();
              c.translate(fx, fy);
              c.rotate(t * 2.5 + fi);
              S.drawCutoutPaperEdge(c, [[-14, -10], [16, -4], [-2, 14]], fleckCols[fi % 4], "#14110d", { paperRim: 1.5, shadow: false });
              c.restore();
            }
          });
          S.drawTurkeyInCorner(ctx, 152, 502, 1.15, t, { dispatch: 0.5 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Submarine wears festive bow ornament: probe pins scarlet maple leaf neatly onto upper frame while Brook Trout gives two fins up!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
            var bx = 375, by = 185;
            // Festive golden ribbon bow loops + pinned scarlet maple leaf badge
            S.drawCutoutPaperEdge(c, [[bx - 68, by - 28], [bx, by], [bx - 58, by + 34]], "#fbbf24", "#14110d", { paperRim: 2.2 });
            S.drawCutoutPaperEdge(c, [[bx + 68, by - 28], [bx, by], [bx + 58, by + 34]], "#fbbf24", "#14110d", { paperRim: 2.2 });
            drawMapleLeaf14(c, S, plates.portholeImg, bx, by + 16, 168 * pop, 0.12);
            S.drawReinigerFiligreeHinge(c, bx, by, 7.5, { metal: "brass" });
            drawSubBrassTongs(c, S, 960, 565, bx + 65, by + 45, 0.25);

            // Brook Trout giving enthusiastic TWO FINS UP!
            var tx = 735, ty = 372 + Math.sin(t * 3.2) * 8;
            S.drawBrookTrout(c, tx, ty, 1.26, t, false, { tilt: -0.12 });
            drawIKCardboardArm(c, S, tx - 42, ty - 6, 42, 38, tx - 68, ty - 74, -1, { w1: 8, w2: 6, tone1: "#b87458" });
            drawIKCardboardArm(c, S, tx + 8, ty - 6, 42, 38, tx + 34, ty - 76, 1, { w1: 8, w2: 6, tone1: "#b87458" });
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Origami leaf folds into starfighter: crimson paper dart banks in a glowing loop around 3-eyed Alien Saucer!
          var t = resolved.t;
          drawTowerCasementStage(ctx, W, H, resolved, plates, S, function (c) {
            S.drawAlienSaucer(c, 640, 255, 1.18, t, false);

            // Glowing golden elliptical flight trail around Saucer
            c.strokeStyle = "rgba(251, 191, 36, 0.55)";
            c.lineWidth = 3.5;
            c.setLineDash([12, 8]);
            c.beginPath();
            c.ellipse(640, 268, 255, 128, -0.15, 0, TAU);
            c.stroke();
            c.setLineDash([]);

            var ang = t * 2.4;
            var dx = 640 + Math.cos(ang) * 255;
            var dy = 268 + Math.sin(ang) * 128;
            var heading = Math.atan2(Math.cos(ang) * 128, -Math.sin(ang) * 255);

            c.save();
            c.translate(dx, dy);
            c.rotate(heading);
            // Crisp faceted crimson origami starfighter dart
            S.drawCutoutPaperEdge(c, [[56, 0], [-42, -38], [-22, 0], [-42, 38]], "#dc2626", "#14110d", { paperRim: 2.8 });
            S.drawCutoutPaperEdge(c, [[56, 0], [-22, 0], [-36, 16]], "#991b1b", "#14110d", { paperRim: 1.0, shadow: false });
            B.drawLanternHalo(c, -36, 0, 48, { color: "#fbbf24", coreColor: "#ffffff", intensity: 1.2, t: t });
            c.restore();

            drawSubBrassTongs(c, S, 960, 565, 845, 455, 0.34);
          });
        }
      }
    },

    drawForeground: function (ctx, W, H, resolved, plates, S) {
      drawSubtleCornerBezel(ctx, W, H, resolved, S);
    }
  });

  /* ==========================================================================
   * PORTHOLE #15 · LENS ("duchamp-optic")
   * Clue: Cyan bathroom-tile glass block wall (p15.jpg + atlas-29.webp sx>=488!)
   * ========================================================================== */

  var P15_SRC_X = [142, 258, 388];
  var P15_SRC_W = [110, 124, 110];
  var P15_SRC_Y = [120, 250, 390];
  var P15_SRC_H = [122, 132, 115];

  function drawFuzzyChick15(ctx, S, cx, cy, scale, t, idx) {
    var bob = Math.sin(t * 5.6 + idx * 1.1) * 4.5;
    var flap = Math.sin(t * 9.2 + idx * 1.7) * 0.30;
    ctx.save();
    ctx.translate(cx, cy + bob);
    ctx.scale(scale || 1, scale || 1);
    ctx.fillStyle = "rgba(255, 232, 122, 0.42)";
    ctx.beginPath();
    ctx.arc(0, 2, 34, 0, TAU);
    ctx.fill();
    S.drawCutoutPaperEdge(
      ctx,
      [[-24, 16], [-26, -4], [-14, -24], [8, -26], [22, -12], [24, 14], [6, 24], [-14, 24]],
      "#f5cb4c", "#14110d", { paperRim: 2.2, shadow: false }
    );
    ctx.save();
    ctx.translate(-4, 4);
    ctx.rotate(flap);
    S.drawCardboardPuppetPiece(ctx, [[-12, -5], [8, -6], [12, 4], [-8, 8]], {
      tone: "#e0a92b", ribs: 1, shadow: false, pin: { x: -6, y: 0, r: 2.6, metal: "brass" }
    });
    ctx.restore();
    S.drawCutoutPaperEdge(ctx, [[18, -10], [32, -5], [18, 1]], "#e05a2b", "#14110d", { paperRim: 1.2, shadow: false });
    ctx.fillStyle = "#14110d";
    ctx.beginPath();
    ctx.arc(10, -11, 2.8, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawLensBase(ctx, W, H, resolved, plates, S, opts) {
    var cfg = opts || {};
    var t = resolved.t;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    // Far plane: Atlas-29 blue motion streaks ONLY from right text-free half (sx >= 488)!
    S.drawScissorCutout(
      ctx, aImg, 488, 36, 240, 280, 88, 132, 245, 336,
      [[0.04, 0.08], [0.96, 0.04], [0.92, 0.94], [0.06, 0.96]],
      { filter: "cyan", haloWidth: 4.0, alpha: 0.72, rot: -0.04 }
    );
    S.drawScissorCutout(
      ctx, aImg, 488, 36, 240, 280, 946, 132, 245, 336,
      [[0.04, 0.04], [0.96, 0.08], [0.94, 0.96], [0.08, 0.94]],
      { filter: "cyan", haloWidth: 4.0, alpha: 0.72, rot: 0.04 }
    );

    // John Whitney counter-rotating polar rose orbits
    ctx.save();
    ctx.translate(640, 322);
    for (var wr = 0; wr < 2; wr++) {
      ctx.strokeStyle = wr === 0 ? "rgba(76, 201, 240, 0.24)" : "rgba(212, 42, 30, 0.20)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var deg = 0; deg <= 96; deg++) {
        var ang = (deg / 96) * TAU;
        var rad = 286 + Math.sin(ang * 4 + t * (wr === 0 ? 1.5 : -1.2)) * 26;
        var wx = Math.cos(ang) * rad;
        var wy = Math.sin(ang) * rad * 0.82;
        if (deg === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();

    var gridX0 = 352, gridY0 = 84;
    var cellW = 178, cellH = 148, gap = 21;

    // Mortar / steel backing frame
    S.drawCardboardPuppetPiece(
      ctx,
      [[gridX0 - 22, gridY0 - 20], [gridX0 + cellW * 3 + gap * 2 + 22, gridY0 - 20],
       [gridX0 + cellW * 3 + gap * 2 + 22, gridY0 + cellH * 3 + gap * 2 + 20], [gridX0 - 22, gridY0 + cellH * 3 + gap * 2 + 20]],
      {
        tone: cfg.frameTone || "#d8d3c4",
        ribs: 2,
        pins: [
          [gridX0 - 8, gridY0 - 8],
          [gridX0 + cellW * 3 + gap * 2 + 8, gridY0 - 8],
          [gridX0 - 8, gridY0 + cellH * 3 + gap * 2 + 8],
          [gridX0 + cellW * 3 + gap * 2 + 8, gridY0 + cellH * 3 + gap * 2 + 8]
        ]
      }
    );

    if (typeof cfg.behindCellsFn === "function") {
      cfg.behindCellsFn(ctx, gridX0, gridY0, cellW, cellH, gap);
    }

    var perm = cfg.perm || [0, 1, 2, 3, 4, 5, 6, 7, 8];
    var wobbleAmp = cfg.wobbleAmp != null ? cfg.wobbleAmp : 4.2;
    var rotAmp = cfg.rotAmp != null ? cfg.rotAmp : 0.018;

    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 3; c++) {
        var idx = r * 3 + c;
        if (cfg.skipCell === idx) continue;
        var srcIdx = perm[idx];
        var sr = Math.floor(srcIdx / 3);
        var sc = srcIdx % 3;
        var ph = t * (cfg.wobbleFreq || 2.2) + r * 0.95 + c * 1.15;
        var dx = Math.sin(ph) * wobbleAmp + (cfg.cellShiftFn ? cfg.cellShiftFn(idx, r, c).dx : 0);
        var dy = Math.cos(ph * 1.15) * (wobbleAmp * 0.8) + (cfg.cellShiftFn ? cfg.cellShiftFn(idx, r, c).dy : 0);
        var tx = gridX0 + c * (cellW + gap) + dx;
        var ty = gridY0 + r * (cellH + gap) + dy;

        var customTint = cfg.cellTintFn ? cfg.cellTintFn(idx, r, c) : (cfg.tint || null);
        S.drawScissorCutout(
          ctx, pImg,
          P15_SRC_X[sc], P15_SRC_Y[sr], P15_SRC_W[sc], P15_SRC_H[sr],
          tx, ty, cellW, cellH,
          [[0.03, 0.04], [0.97, 0.03], [0.98, 0.96], [0.02, 0.97]],
          {
            haloWidth: 3.6,
            rot: Math.sin(ph * 0.8) * rotAmp,
            filter: cfg.filter || "none",
            tint: customTint
          }
        );

        if (typeof cfg.cellOverlayFn === "function") {
          cfg.cellOverlayFn(ctx, idx, r, c, tx, ty, cellW, cellH);
        }
      }
    }

    if (typeof cfg.frontGridFn === "function") {
      cfg.frontGridFn(ctx, gridX0, gridY0, cellW, cellH, gap);
    }
  }

  B.definePortalGame(15, {
    drawBackdrop: function (ctx, W, H, resolved, plates, S) {
      S.drawBolasBackdrop(
        ctx, W, H, resolved.bolasStyle, 15, resolved.t,
        { showCaptions: resolved.showCaptions, lamp: resolved.lampOn, ballast: resolved.ballastOn }
      );
    },

    drawRoot: function (ctx, W, H, resolved, plates, S) {
      var t = resolved.t;
      drawLensBase(ctx, W, H, resolved, plates, S, {
        frontGridFn: function (c) {
          B.drawWaterCaustics(c, W, H, t, { intensity: 0.16, color: "#67e8f9", topY: 80 });
        }
      });
      S.drawTurkeyInCorner(ctx, W, H, t, { x: 138, y: 508, scale: 1.05 });
    },

    stems: {
      x: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawLensBase(ctx, W, H, resolved, plates, S, {
          cellOverlayFn: function (c, idx, r, col, tx, ty, cw, ch) {
            var cx = tx + cw * 0.5, cy = ty + ch * 0.5;
            c.strokeStyle = "rgba(186, 230, 253, " + (0.75 * u).toFixed(3) + ")";
            c.lineWidth = 3.0;
            c.strokeRect(tx + 10, ty + 10, cw - 20, ch - 20);
            B.drawLanternHalo(c, cx, cy, 72 * u, { color: "#06b6d4", coreColor: "#ffffff", intensity: 0.85 * u, t: t + idx });
          },
          frontGridFn: function (c) {
            B.drawVolumetricBeam(c, 420, 620, 640, 325, {
              color: "#38bdf8", coreColor: "#e0f2fe", sourceRadius: 24, spread: 95, intensity: 1.35 * u, t: t
            });
            for (var b = 0; b < 9; b++) {
              var br = Math.floor(b / 3), bc = b % 3;
              if (b === 4) continue;
              B.drawVolumetricBeam(c, 640, 325, 441 + bc * 199, 158 + br * 169, {
                color: "#22d3ee", spread: 42, intensity: 0.65 * u, t: t
              });
            }
          }
        });
      },

      o: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawLensBase(ctx, W, H, resolved, plates, S, {
          wobbleAmp: 4.2 + 16 * u,
          wobbleFreq: 5.4,
          rotAmp: 0.085 * u,
          frontGridFn: function (c) {
            drawSwirlingCurrent(c, S, 640, 325, 310 * u, 165, t, "rgba(248, 113, 113, 0.80)", 4);
            drawCutoutBubbles(c, S, 16, 640, 520, 90, 560, t, 1502, "rgba(254, 202, 202, 0.86)");
          }
        });
      },

      triangle: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        var stampedCount = Math.min(9, Math.floor(u * 9.5) + 1);
        drawLensBase(ctx, W, H, resolved, plates, S, {
          cellOverlayFn: function (c, idx, r, col, tx, ty, cw, ch) {
            if (idx < stampedCount) {
              var sx = tx + cw * 0.5, sy = ty + ch * 0.5;
              c.strokeStyle = "#059669";
              c.lineWidth = 3.5;
              c.beginPath();
              c.arc(sx, sy, 26, 0, TAU);
              c.stroke();
              c.beginPath();
              c.moveTo(sx - 18, sy - 4); c.lineTo(sx + 18, sy - 4);
              c.moveTo(sx - 14, sy + 5); c.lineTo(sx + 14, sy + 5);
              c.stroke();
            }
          },
          frontGridFn: function (c, gx0, gy0, cw, ch, gap) {
            var curIdx = Math.min(8, Math.floor(u * 8.99));
            var cr = Math.floor(curIdx / 3);
            var cc = curIdx % 3;
            var snailX = gx0 + cc * (cw + gap) + cw * 0.5;
            var snailY = gy0 + cr * (ch + gap) + ch + 8;
            B.drawSnailSilverTrail(c, 360, 540, snailX, snailY, u, t);
            S.drawMailSnail(c, snailX, snailY, 1.18, t, { hasReply: true });
          }
        });
      },

      square: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawLensBase(ctx, W, H, resolved, plates, S, {
          frontGridFn: function (c, gx0, gy0, cw, ch, gap) {
            var crossX = gx0 + cw * 2 + gap * 1.5;
            var crossY = gy0 + ch * 2 + gap * 1.5;
            drawSubBrassTongs(c, S, 985, 575, lerp(890, crossX, u), lerp(485, crossY, u), 0.16);
            // Bright hairline ripples flashing along mortar crossbars!
            var pulse = 0.5 + 0.5 * Math.sin(t * 9.0);
            c.strokeStyle = "rgba(254, 240, 138, " + (0.85 * u * pulse + 0.25).toFixed(3) + ")";
            c.lineWidth = 4.5;
            c.beginPath();
            c.moveTo(gx0 + cw + gap * 0.5, gy0); c.lineTo(gx0 + cw + gap * 0.5, gy0 + ch * 3 + gap * 2);
            c.moveTo(gx0 + cw * 2 + gap * 1.5, gy0); c.lineTo(gx0 + cw * 2 + gap * 1.5, gy0 + ch * 3 + gap * 2);
            c.moveTo(gx0, gy0 + ch + gap * 0.5); c.lineTo(gx0 + cw * 3 + gap * 2, gy0 + ch + gap * 0.5);
            c.moveTo(gx0, gy0 + ch * 2 + gap * 1.5); c.lineTo(gx0 + cw * 3 + gap * 2, gy0 + ch * 2 + gap * 1.5);
            c.stroke();
            B.drawDeterministicParticles(c, "brass_sparks", crossX, crossY, resolved.stemT * 0.8, { count: 16, loop: true });
          }
        });
      }
    },

    outcomes: {
      x: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Nine Cracked Porthole Leak Alarms: jagged crack shadows + Turkey slaps 9 tiny cork plugs onto glass!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawLensBase(ctx, W, H, resolved, plates, S, {
            frameTone: "#475569",
            cellOverlayFn: function (c, idx, r, col, tx, ty, cw, ch) {
              var cx = tx + cw * 0.5, cy = ty + ch * 0.5;
              // Refracted jagged crack shadow + tapered tan cork plug jammed into each block!
              c.strokeStyle = "#e0f2fe";
              c.lineWidth = 2.6;
              c.beginPath();
              c.moveTo(cx - 48, cy - 34); c.lineTo(cx, cy); c.lineTo(cx + 52, cy - 28);
              c.moveTo(cx, cy); c.lineTo(cx - 32, cy + 44);
              c.moveTo(cx, cy); c.lineTo(cx + 44, cy + 38);
              c.stroke();

              var s = pop;
              S.drawCardboardPuppetPiece(
                c,
                [[cx - 16 * s, cy - 18 * s], [cx + 16 * s, cy - 18 * s], [cx + 11 * s, cy + 16 * s], [cx - 11 * s, cy + 16 * s]],
                { tone: "#d6a76c", ribs: 2, pin: { x: cx, y: cy - 18 * s, r: 3.4, metal: "brass" } }
              );
            },
            frontGridFn: function (c) {
              B.drawDeterministicParticles(c, "bubbles", 640, 320, resolved.outcomeT, { count: 22, loop: true, spreadX: 460 });
            }
          });
          S.drawTurkeyInCorner(ctx, 162, 496, 1.16, t * 2.0, { dispatch: 0.9 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Nine Blurry Yellow Peeps Show: 9 fluffy yellow chicks behind wavy blocks + Brook Trout dandelion + Mail Snail tickets!
          var t = resolved.t;
          drawLensBase(ctx, W, H, resolved, plates, S, {
            perm: [4, 0, 2, 6, 1, 8, 3, 7, 5],
            tint: "rgba(32, 165, 160, 0.22)",
            cellOverlayFn: function (c, idx, r, col, tx, ty, cw, ch) {
              c.save();
              c.beginPath();
              c.rect(tx + 6, ty + 6, cw - 12, ch - 12);
              c.clip();
              drawFuzzyChick15(c, S, tx + cw * 0.5, ty + ch * 0.54, 0.98, t, idx);
              c.strokeStyle = "rgba(195, 250, 245, 0.58)";
              c.lineWidth = 4.2;
              for (var wv = 0; wv < 3; wv++) {
                var wy = ty + 28 + wv * 42;
                c.beginPath();
                c.moveTo(tx + 12, wy);
                c.bezierCurveTo(tx + 58, wy - 12, tx + 112, wy + 12, tx + cw - 12, wy - 4);
                c.stroke();
              }
              c.restore();
            },
            frontGridFn: function (c) {
              // Brook Trout on right holding big fluffy yellow dandelion head
              var bx = 1068, by = 335 + Math.sin(t * 2.4) * 8;
              S.drawBrookTrout(c, bx, by, 1.08, t, false);
              c.strokeStyle = "#15803d";
              c.lineWidth = 4.0;
              c.beginPath();
              c.moveTo(bx - 58, by + 8);
              c.lineTo(bx - 82, by - 58);
              c.stroke();
              B.drawLanternHalo(c, bx - 82, by - 66, 46, { color: "#facc15", coreColor: "#fef9c3", intensity: 1.2, t: t });

              // Mail Snail on left selling roll of pink perforated cinema tickets
              S.drawMailSnail(c, 205, 512, 1.22, t, { hasReply: true });
              for (var tk = 0; tk < 4; tk++) {
                S.drawCutoutPaperEdge(
                  c,
                  [[245 + tk * 26, 468 - tk * 8], [268 + tk * 26, 468 - tk * 8], [268 + tk * 26, 486 - tk * 8], [245 + tk * 26, 486 - tk * 8]],
                  "#f472b6", "#14110d", { paperRim: 1.2, shadow: false }
                );
              }
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Pixelated Saucer Force-Field Shield: 9 neon hexagon shield cells + Alien Saucer firing magenta prism lasers!
          var t = resolved.t;
          drawLensBase(ctx, W, H, resolved, plates, S, {
            frameTone: "#0f172a",
            filter: "cyan",
            tint: "rgba(15, 23, 42, 0.45)",
            cellOverlayFn: function (c, idx, r, col, tx, ty, cw, ch) {
              var cx = tx + cw * 0.5, cy = ty + ch * 0.5;
              var hex = [];
              for (var h = 0; h < 6; h++) {
                var a = (h / 6) * TAU;
                hex.push([cx + Math.cos(a) * 56, cy + Math.sin(a) * 48]);
              }
              c.strokeStyle = idx % 2 === 0 ? "#22d3ee" : "#e879f9";
              c.lineWidth = 3.8;
              c.beginPath();
              for (var k = 0; k < 6; k++) {
                if (k === 0) c.moveTo(hex[k][0], hex[k][1]);
                else c.lineTo(hex[k][0], hex[k][1]);
              }
              c.closePath();
              c.stroke();
            },
            frontGridFn: function (c) {
              S.drawAlienSaucer(c, 640, 74, 1.20, t, false);
              // Magenta prism laser rays bouncing off hexagon tiles!
              var targets = [[441, 158, 220, 95], [640, 325, 640, 595], [839, 158, 1060, 110]];
              for (var i = 0; i < targets.length; i++) {
                var tg = targets[i];
                c.strokeStyle = "#ec4899";
                c.lineWidth = 5.0;
                c.beginPath();
                c.moveTo(640, 88);
                c.lineTo(tg[0], tg[1]);
                c.lineTo(tg[2], tg[3]);
                c.stroke();
                B.drawDeterministicParticles(c, "brass_sparks", tg[0], tg[1], resolved.outcomeT + i * 0.3, { count: 12, loop: true, color: "#f472b6" });
              }
            }
          });
        }
      },

      o: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Scrambled Submarine Hull Washout: 3x3 sliding puzzle scrambling Turkey's reflection + cardboard wiper!
          var t = resolved.t;
          drawLensBase(ctx, W, H, resolved, plates, S, {
            perm: [8, 2, 5, 1, 7, 0, 4, 6, 3],
            skipCell: 4, // open dark 15-puzzle sliding slot in center!
            cellShiftFn: function (idx) {
              var slide = Math.sin(t * 3.8) * 22;
              if (idx === 1) return { dx: 0, dy: Math.max(0, slide) };
              if (idx === 3) return { dx: Math.max(0, -slide), dy: 0 };
              return { dx: 0, dy: 0 };
            },
            cellOverlayFn: function (c, idx, r, col, tx, ty, cw, ch) {
              var cx = tx + cw * 0.5, cy = ty + ch * 0.5;
              // Scrambled Turkey reflection parts: beak in [0,0], wide eye in [0,2], feathers in [2,0], wattle in [2,2]!
              if (idx === 0) {
                S.drawCutoutPaperEdge(c, [[cx - 28, cy - 18], [cx + 38, cy], [cx - 24, cy + 18]], "#f59e0b", "#14110d", { paperRim: 2, shadow: false });
              } else if (idx === 2) {
                c.fillStyle = "#fbfaf5"; c.strokeStyle = "#14110d"; c.lineWidth = 3;
                c.beginPath(); c.arc(cx, cy, 26, 0, TAU); c.fill(); c.stroke();
                c.fillStyle = "#14110d";
                c.beginPath(); c.arc(cx + 6, cy, 10, 0, TAU); c.fill();
              } else if (idx === 6) {
                for (var f = -1; f <= 1; f++) {
                  S.drawCardboardPuppetPiece(c, [[cx + f * 22 - 10, cy + 28], [cx + f * 28 - 12, cy - 28], [cx + f * 28 + 12, cy - 28], [cx + f * 22 + 10, cy + 28]], { tone: "#7d583c", shadow: false });
                }
              } else if (idx === 8) {
                S.drawCutoutPaperEdge(c, [[cx - 14, cy - 30], [cx + 22, cy + 8], [cx, cy + 34], [cx - 22, cy + 10]], "#d42a1e", "#14110d", { paperRim: 2, shadow: false });
              }
            }
          });
          // Turkey cranking a squeaking cardboard windshield-wiper blade at lower-left!
          S.drawTurkeyInCorner(ctx, 155, 504, 1.12, t, { dispatch: 0.7 });
          ctx.save();
          ctx.translate(275, 558);
          ctx.rotate(-0.65 + Math.sin(t * 5.6) * 0.58);
          S.drawCardboardPuppetPiece(ctx, [[-6, 0], [6, 0], [8, -195], [-8, -195]], {
            tone: "#334155", pin: { x: 0, y: 0, r: 5.5, metal: "brass" }
          });
          ctx.restore();
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Spinning Creek Laundromat Rinse Cycle: 9 mini washing-machine portholes swirling with striped socks!
          var t = resolved.t;
          drawLensBase(ctx, W, H, resolved, plates, S, {
            cellOverlayFn: function (c, idx, r, col, tx, ty, cw, ch) {
              var cx = tx + cw * 0.5, cy = ty + ch * 0.5;
              var ang = t * (4.2 + (idx % 3)) + idx;
              // Chrome washing-machine drum bezel
              c.strokeStyle = "#cbd5e1";
              c.lineWidth = 7.0;
              c.beginPath();
              c.arc(cx, cy, 52, 0, TAU);
              c.stroke();
              c.strokeStyle = "#14110d";
              c.lineWidth = 2.0;
              c.stroke();

              // Swirling soapy foam arc + tumbling striped sock!
              c.save();
              c.translate(cx, cy);
              c.rotate(ang);
              c.fillStyle = "rgba(255,255,255,0.75)";
              c.beginPath();
              c.arc(22, 0, 14, 0, TAU);
              c.arc(-20, 14, 11, 0, TAU);
              c.fill();
              S.drawCutoutPaperEdge(c, [[-14, -22], [6, -22], [6, 8], [22, 8], [22, 22], [-14, 22]], idx % 2 === 0 ? "#ef4444" : "#3b82f6", "#14110d", { paperRim: 1.5, shadow: false });
              c.fillStyle = "#ffffff";
              c.fillRect(-12, -10, 16, 6);
              c.restore();
            },
            frontGridFn: function (c) {
              S.drawBrookTrout(c, 1085, 365 + Math.sin(t * 2.5) * 6, 1.08, t, false);
              S.drawMailSnail(c, 1065, 485, 1.18, t, { flip: true, hasReply: true });
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Compound-Eye Bug Mothership Screen: all 9 sloshing glass blocks sprout synchronized glowing lime pupils!
          var t = resolved.t;
          var lookX = Math.sin(t * 2.6) * 20;
          var lookY = Math.cos(t * 1.9) * 8;
          drawLensBase(ctx, W, H, resolved, plates, S, {
            frameTone: "#14532d",
            wobbleAmp: 8.5,
            cellOverlayFn: function (c, idx, r, col, tx, ty, cw, ch) {
              var cx = tx + cw * 0.5, cy = ty + ch * 0.5;
              c.fillStyle = "#bef264";
              c.strokeStyle = "#14110d";
              c.lineWidth = 3.2;
              c.beginPath();
              c.ellipse(cx, cy, 56, 38, 0, 0, TAU);
              c.fill();
              c.stroke();

              c.fillStyle = "#14110d";
              c.beginPath();
              c.ellipse(cx + lookX, cy + lookY, 12, 26, 0, 0, TAU);
              c.fill();
              c.fillStyle = "#ffffff";
              c.beginPath();
              c.arc(cx + lookX - 5, cy + lookY - 8, 5, 0, TAU);
              c.fill();
            },
            frontGridFn: function (c) {
              S.drawAlienSaucer(c, 640 + lookX * 2, 74, 1.20, t, 640, 325, { beamSpread: 240 });
            }
          });
        }
      },

      triangle: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Condemned Window Safety Inspection Tags: 9 red FRAGILE stickers + Turkey wearing colander hard-hat!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawLensBase(ctx, W, H, resolved, plates, S, {
            cellOverlayFn: function (c, idx, r, col, tx, ty, cw, ch) {
              var cx = tx + cw * 0.5, cy = ty + ch * 0.5;
              c.save();
              c.translate(cx, cy);
              c.rotate(-0.22 + (idx % 3 - 1) * 0.08);
              c.scale(pop, pop);
              S.drawCutoutPaperEdge(c, [[-56, -22], [56, -22], [56, 22], [-56, 22]], "#dc2626", "#fbfaf5", { paperRim: 2.0, shadow: false });
              // Pure vector warning triangle icon (0 text in blind mode!)
              c.strokeStyle = "#ffffff";
              c.lineWidth = 2.4;
              c.beginPath();
              c.moveTo(-36, 10); c.lineTo(-24, -10); c.lineTo(-12, 10); c.closePath();
              c.stroke();
              drawPropLabel(c, resolved, "FRAGILE", 14, 1, { color: "#ffffff", font: '800 14px "JetBrains Mono", monospace' });
              c.restore();
            }
          });
          S.drawTurkeyInCorner(ctx, 165, 504, 1.15, t, { dispatch: 0.4 });
          // Upside-down perforated metal kitchen colander hard-hat on Turkey's head!
          ctx.save();
          ctx.translate(162, 458);
          S.drawCardboardPuppetPiece(ctx, [[-38, 8], [-28, -22], [28, -22], [38, 8]], { tone: "#cbd5e1", ribs: 1, shadow: false });
          ctx.fillStyle = "#14110d";
          for (var h = -2; h <= 2; h++) {
            ctx.beginPath(); ctx.arc(h * 11, -8, 2.5, 0, TAU); ctx.fill();
          }
          ctx.restore();
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Creek Post Office P.O. Boxes: hinged brass latches + Brook Trout retrieving mail from open Box #5!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawLensBase(ctx, W, H, resolved, plates, S, {
            cellOverlayFn: function (c, idx, r, col, tx, ty, cw, ch) {
              // Brass P.O. box frame & dial latch on every block
              c.strokeStyle = "#d4a44c";
              c.lineWidth = 4.5;
              c.strokeRect(tx + 8, ty + 8, cw - 16, ch - 16);
              S.drawSplitPin(c, tx + cw - 24, ty + ch * 0.5, 5.5, { metal: "brass" });

              if (idx === 4) {
                // Center Box #5 hinged wide open revealing stacked stamped postcards!
                c.fillStyle = "#1e293b";
                c.fillRect(tx + 12, ty + 12, cw - 24, ch - 24);
                for (var pc = 0; pc < 3; pc++) {
                  S.drawCutoutPaperEdge(
                    c,
                    [[tx + 34 + pc * 18, ty + 48 - pc * 8], [tx + 108 + pc * 18, ty + 48 - pc * 8], [tx + 108 + pc * 18, ty + 98 - pc * 8], [tx + 34 + pc * 18, ty + 98 - pc * 8]],
                    "#fbfaf5", "#14110d", { paperRim: 1.5, shadow: false }
                  );
                }
                // Swung-open glass P.O. box door on left hinge
                c.save();
                c.translate(tx + 8, ty + 8);
                c.scale(-0.55 * pop, 1);
                c.fillStyle = "rgba(103, 232, 249, 0.55)";
                c.strokeStyle = "#d4a44c";
                c.lineWidth = 4.0;
                c.fillRect(0, 0, cw - 16, ch - 16);
                c.strokeRect(0, 0, cw - 16, ch - 16);
                c.restore();
              }
            },
            frontGridFn: function (c) {
              S.drawBrookTrout(c, 835 + Math.sin(t * 2.4) * 10, 328, 1.18, t, false);
              S.drawMailSnail(c, 225, 496, 1.26, t, { hasReply: true });
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Tic-Tac-Toe Against Space Saucer: Mail Snail green O's vs Saucer neon rust X's + winning laser line!
          var t = resolved.t;
          // Board marks: X at [0, 4, 8] (diagonal win!), O at [1, 3, 6]
          var marks = ["x", "o", null, "o", "x", null, "o", null, "x"];
          drawLensBase(ctx, W, H, resolved, plates, S, {
            frameTone: "#1e293b",
            cellOverlayFn: function (c, idx, r, col, tx, ty, cw, ch) {
              var mk = marks[idx];
              if (!mk) return;
              var cx = tx + cw * 0.5, cy = ty + ch * 0.5;
              if (mk === "o") {
                B.drawGeometricSymbol(c, "o", cx, cy, 48, "#34d399", 7.5);
              } else {
                B.drawGeometricSymbol(c, "x", cx, cy, 48, "#f97316", 7.5);
              }
            },
            frontGridFn: function (c, gx0, gy0, cw, ch, gap) {
              S.drawAlienSaucer(c, 640, 72, 1.16, t, gx0 + cw * 2.5 + gap * 2, gy0 + ch * 2.5 + gap * 2, { beamSpread: 95 });
              S.drawMailSnail(c, 232, 488, 1.24, t, { hasReply: true, hasAlienStamp: true });

              // Flashing winning diagonal laser line from [0,0] through [1,1] to [2,2]!
              var flash = 0.55 + 0.45 * Math.sin(t * 10.0);
              c.strokeStyle = "rgba(251, 113, 133, " + flash.toFixed(3) + ")";
              c.lineWidth = 9.0;
              c.lineCap = "round";
              c.beginPath();
              c.moveTo(gx0 + 30, gy0 + 30);
              c.lineTo(gx0 + cw * 3 + gap * 2 - 30, gy0 + ch * 3 + gap * 2 - 30);
              c.stroke();
            }
          });
        }
      },

      square: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Spiderwebbed Glass Emergency Patch Job: paper-cutout silver duct-tape strips crisscross blocks + Turkey unrolling tape!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawLensBase(ctx, W, H, resolved, plates, S, {
            wobbleAmp: 6.5,
            wobbleFreq: 9.0,
            frontGridFn: function (c, gx0, gy0, cw, ch, gap) {
              var strips = [
                [gx0 + 20, gy0 + 40, gx0 + 390, gy0 + 220],
                [gx0 + 360, gy0 + 50, gx0 + 120, gy0 + 280],
                [gx0 + 210, gy0 + 240, gx0 + 560, gy0 + 440],
                [gx0 + 540, gy0 + 190, gx0 + 240, gy0 + 460],
                [gx0 + 60, gy0 + 380, gx0 + 430, gy0 + 430]
              ];
              for (var si = 0; si < strips.length; si++) {
                var st = strips[si];
                var ex = lerp(st[0], st[2], clamp(pop, 0, 1));
                var ey = lerp(st[1], st[3], clamp(pop, 0, 1));
                S.drawCardboardPuppetPiece(c, limbQuad(st[0], st[1], ex, ey, 14, 14), {
                  tone: "#94a3b8", ribs: 2
                });
              }
              // Grey duct-tape roll held by Turkey
              c.fillStyle = "#94a3b8";
              c.strokeStyle = "#14110d";
              c.lineWidth = 3.0;
              c.beginPath(); c.arc(248, 468, 28, 0, TAU); c.fill(); c.stroke();
              c.fillStyle = "#334155";
              c.beginPath(); c.arc(248, 468, 13, 0, TAU); c.fill(); c.stroke();
            }
          });
          S.drawTurkeyInCorner(ctx, 160, 502, 1.16, t * 2.2, { dispatch: 0.85 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Nine-Note Creek Glass Xylophone: rainbow blocks + Brook Trout tapping with 2 cattail mallets + note bubbles!
          var t = resolved.t;
          var noteIdx = Math.floor(t * 4.5) % 9;
          var rainbow = [
            "rgba(239,68,68,0.42)", "rgba(249,115,22,0.42)", "rgba(234,179,8,0.42)",
            "rgba(132,204,22,0.42)", "rgba(16,185,129,0.42)", "rgba(6,182,212,0.42)",
            "rgba(59,130,246,0.42)", "rgba(139,92,246,0.42)", "rgba(236,72,153,0.42)"
          ];
          drawLensBase(ctx, W, H, resolved, plates, S, {
            cellTintFn: function (idx) {
              return idx === noteIdx ? "rgba(255, 255, 255, 0.65)" : rainbow[idx];
            },
            frontGridFn: function (c, gx0, gy0, cw, ch, gap) {
              var nr = Math.floor(noteIdx / 3), nc = noteIdx % 3;
              var hitX = gx0 + nc * (cw + gap) + cw * 0.5;
              var hitY = gy0 + nr * (ch + gap) + ch * 0.5;
              B.drawLanternHalo(c, hitX, hitY, 96, { color: "#fef08a", coreColor: "#ffffff", intensity: 1.25, t: t });

              // Brook Trout percussionist wielding two brown cattail reed mallets!
              var tx = 1045, ty = 348 + Math.sin(t * 3.0) * 6;
              S.drawBrookTrout(c, tx, ty, 1.16, t, false);
              c.strokeStyle = "#15803d";
              c.lineWidth = 4.5;
              c.beginPath();
              c.moveTo(tx - 48, ty + 8); c.lineTo(hitX + 42, hitY + 18);
              c.stroke();
              S.drawCardboardPuppetPiece(c, [[hitX + 26, hitY + 8], [hitX + 56, hitY + 8], [hitX + 56, hitY + 24], [hitX + 26, hitY + 24]], {
                tone: "#5c3a21", ribs: 1, shadow: false
              });

              // Rising rainbow musical eighth-note bubbles (pure vector!)
              var cols = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#ec4899"];
              for (var nb = 0; nb < 6; nb++) {
                var nu = ((t * 0.45 + nb / 6) % 1);
                drawMusicalNoteBubble(c, 390 + nb * 95 + Math.sin(t * 3 + nb) * 14, lerp(495, 95, nu), 16, cols[nb % cols.length]);
              }
              S.drawMailSnail(c, 228, 502, 1.20, t, { hasReply: true });
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Shattered Fourth-Dimension Cube Portal: center block floats into starfield tunnel as Alien Saucer peeks through!
          var t = resolved.t;
          drawLensBase(ctx, W, H, resolved, plates, S, {
            frameTone: "#1e1b4b",
            skipCell: 4,
            behindCellsFn: function (c, gx0, gy0, cw, ch, gap) {
              var mx = gx0 + cw + gap;
              var my = gy0 + ch + gap;
              var cx = mx + cw * 0.5, cy = my + ch * 0.5;
              // 4D tesseract perspective starfield tunnel inside missing center square!
              c.fillStyle = "#09071a";
              c.fillRect(mx - 6, my - 6, cw + 12, ch + 12);
              for (var lv = 1; lv <= 5; lv++) {
                var sc = 1 - lv * 0.16;
                var rot = Math.sin(t * 2.0 + lv * 0.5) * 0.14;
                c.save();
                c.translate(cx, cy);
                c.rotate(rot);
                c.strokeStyle = lv % 2 === 0 ? "#a855f7" : "#22d3ee";
                c.lineWidth = 2.4;
                c.strokeRect(-cw * 0.5 * sc, -ch * 0.5 * sc, cw * sc, ch * sc);
                c.restore();
              }
              B.drawLanternHalo(c, cx, cy, 145, { color: "#a855f7", coreColor: "#f3e8ff", intensity: 1.35, t: t });
              // Alien Saucer peeking nose-first right through the missing center block!
              S.drawAlienSaucer(c, cx, cy + 8, 1.08, t, false);
            }
          });
        }
      }
    },

    drawForeground: function (ctx, W, H, resolved, plates, S) {
      drawSubtleCornerBezel(ctx, W, H, resolved, S);
    }
  });

  /* ==========================================================================
   * PORTHOLE #16 · AFT ("daumier-litho")
   * Clue: Identical twin Turkey Sub waving back (p16.jpg + atlas-08.webp)
   * ========================================================================== */

  var POLY_SUB_16 = [
    [0.36, 0.03], [0.58, 0.03], [0.64, 0.20], [0.80, 0.25], [0.87, 0.52],
    [0.97, 0.72], [0.92, 0.85], [0.85, 0.96], [0.15, 0.97], [0.05, 0.86],
    [0.06, 0.56], [0.15, 0.26], [0.27, 0.19]
  ];

  function drawOurProw16(ctx, S, x, y, t, opts) {
    var cfg = opts || {};
    ctx.save();
    ctx.translate(x, y);
    if (cfg.mirror) ctx.scale(-1, 1);

    S.drawCutoutPaperEdge(
      ctx,
      [[-128, -132], [48, -108], [90, -32], [94, 66], [44, 124], [-128, 136]],
      "#c8ccd0", "#0b0d10", { paperRim: 4.8 }
    );
    S.drawCardboardPuppetPiece(
      ctx,
      [[-120, -122], [42, -100], [82, -28], [86, 60], [38, 116], [-120, 128]],
      { tone: "#9da2a8", ribs: 4, pins: [[26, -80], [62, -18], [64, 46], [24, 96]] }
    );
    S.drawEngravingCrosshatch(ctx, 185, 224, 0.20, 7, { x: -112, y: -112, color: "#0b0d10" });

    // Dorsal Verne signal lamp
    var sigGlow = cfg.strobe != null ? cfg.strobe : (0.45 + 0.55 * Math.max(0, Math.sin(t * 7.0)));
    S.drawCardboardPuppetPiece(ctx, [[12, -132], [38, -132], [44, -102], [6, -102]], {
      tone: "#5c6066", pin: { x: 25, y: -116, r: 3.6, metal: "brass" }
    });
    ctx.fillStyle = "rgba(255, 240, 168, " + (0.35 + sigGlow * 0.55).toFixed(3) + ")";
    ctx.beginPath();
    ctx.arc(25, -142, 16 + sigGlow * 10, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#fff8d4";
    ctx.strokeStyle = "#0b0d10";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(25, -142, 8.5, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Brass porthole + waving Turkey silhouette inside
    ctx.fillStyle = "#d4a44c";
    ctx.strokeStyle = "#0b0d10";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(16, -4, 45, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f9e7b2";
    ctx.beginPath();
    ctx.arc(16, -4, 35, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#241911";
    ctx.beginPath();
    ctx.arc(8, 8, 15, 0, TAU);
    ctx.arc(18, -10, 8.5, 0, TAU);
    ctx.fill();

    // Optional cavalier plumed hat on our Turkey!
    if (cfg.cavalierHat) {
      S.drawCutoutPaperEdge(ctx, [[-2, -16], [34, -20], [18, -32]], "#1e293b", "#0b0d10", { paperRim: 1.2, shadow: false });
      S.drawCutoutPaperEdge(ctx, [[-6, -22], [-22, -38], [4, -30]], "#dc2626", "#0b0d10", { paperRim: 1.0, shadow: false });
    }

    var wavePh = cfg.wavePhase || 0;
    var ik = S.solveIK2(12, 4, 16, 15, 32 + Math.sin(t * 6.4 + wavePh) * 6, -14 + Math.cos(t * 6.4 + wavePh) * 9, -1);
    S.drawCardboardPuppetPiece(ctx, limbQuad(12, 4, ik.jx, ik.jy, 5, 4), { tone: "#5c3d28", shadow: false });
    S.drawCardboardPuppetPiece(ctx, limbQuad(ik.jx, ik.jy, ik.ex, ik.ey, 4, 3), {
      tone: "#785036", shadow: false, pin: { x: ik.jx, y: ik.jy, r: 2.6, metal: "brass" }
    });
    ctx.restore();
  }

  function drawTwinSubCutout16(ctx, S, pImg, x, y, w, h, t, opts) {
    var cfg = opts || {};
    S.drawScissorCutout(
      ctx, pImg, 196, 108, 252, 296, x, y, w, h,
      POLY_SUB_16,
      {
        filter: cfg.filter || "litho",
        haloWidth: cfg.haloWidth != null ? cfg.haloWidth : 5.0,
        rot: cfg.rot || 0,
        tint: cfg.tint || null
      }
    );
    if (!cfg.hideWing) {
      var wx = x + w * 0.51;
      var wy = y + h * 0.68;
      var wp = cfg.waveOffset || 0;
      var wik = S.solveIK2(wx, wy, 20 * (w / 330), 18 * (w / 330), wx + 24 + Math.sin(t * 6.4 + wp) * 10, wy - 18 + Math.cos(t * 6.4 + wp) * 9, -1);
      S.drawCardboardPuppetPiece(ctx, limbQuad(wx, wy, wik.jx, wik.jy, 5.5, 4.5), { tone: cfg.wingTone || "#4f3826", shadow: false });
      S.drawCardboardPuppetPiece(ctx, limbQuad(wik.jx, wik.jy, wik.ex, wik.ey, 4.5, 3.5), {
        tone: cfg.wingTone || "#78553a", shadow: false, pin: { x: wik.jx, y: wik.jy, r: 3.2, metal: "brass" }
      });
    }
  }

  function drawAftStageBg(ctx, W, H, resolved, plates, S) {
    S.drawScissorCutout(
      ctx, plates.atlasImg, 330, 18, 390, 355, 430, 132, 420, 256,
      [[0.06, 0.08], [0.52, 0.03], [0.94, 0.09], [0.96, 0.58], [0.84, 0.94], [0.18, 0.92], [0.03, 0.55]],
      { filter: "litho", haloWidth: 3.5, alpha: 0.44, tint: "rgba(24, 42, 62, 0.25)" }
    );
    S.drawEngravingCrosshatch(ctx, W, 430, 0.14, 11, { x: 0, y: 124, color: "#d8d3c6" });
    S.drawScissorCutout(
      ctx, plates.portholeImg, 112, 246, 98, 168, 28, 386, 128, 174,
      [[0.08, 0.12], [0.58, 0.04], [0.92, 0.34], [0.95, 0.94], [0.06, 0.96]],
      { filter: "litho", haloWidth: 4.0 }
    );
  }

  B.definePortalGame(16, {
    drawBackdrop: function (ctx, W, H, resolved, plates, S) {
      S.drawBolasBackdrop(
        ctx, W, H, resolved.bolasStyle, 16, resolved.t,
        { showCaptions: resolved.showCaptions, lamp: resolved.lampOn, ballast: resolved.ballastOn },
        { bandTop: 118, bandBot: 568 }
      );
    },

    drawRoot: function (ctx, W, H, resolved, plates, S) {
      var t = resolved.t;
      drawAftStageBg(ctx, W, H, resolved, plates, S);
      drawOurProw16(ctx, S, 242, 348, t);
      drawTwinSubCutout16(ctx, S, plates.portholeImg, 640, 166 + Math.sin(t * 2.5) * 8, 336, 360, t, {
        rot: Math.sin(t * 1.8) * 0.025
      });
      S.drawScissorCutout(
        ctx, plates.portholeImg, 298, 354, 194, 100, 745 - ((t * 34) % 150), 446 + Math.sin(t * 3.1) * 6, 228, 112,
        [[0.04, 0.48], [0.28, 0.14], [0.64, 0.06], [0.96, 0.18], [0.94, 0.84], [0.58, 0.94], [0.22, 0.82]],
        { filter: "sepia", haloWidth: 4.2 }
      );
    },

    stems: {
      x: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        var blink = Math.sin(t * 15.0) > -0.15 ? 1.0 : 0.25;
        drawAftStageBg(ctx, W, H, resolved, plates, S);
        drawOurProw16(ctx, S, 242, 348, t, { strobe: blink });
        drawTwinSubCutout16(ctx, S, plates.portholeImg, 645, 168, 336, 360, t);
        B.drawVolumetricBeam(ctx, 295, 342, 812, 392, {
          color: "#38bdf8", coreColor: "#e0f2fe", sourceRadius: 24, spread: 98, intensity: 1.45 * u * blink, t: t
        });
        B.drawLanternHalo(ctx, 812, 392, 115 * u * blink, { color: "#60a5fa", coreColor: "#ffffff", intensity: 1.2, t: t });
      },

      o: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        var pushBack = 42 * u + Math.sin(t * 7.5) * 8 * u;
        drawAftStageBg(ctx, W, H, resolved, plates, S);
        drawOurProw16(ctx, S, 242, 348, t);
        // Brass foghorn nozzle + blasting crimson bubble rings!
        S.drawCardboardPuppetPiece(ctx, [[328, 326], [386, 304], [386, 368], [328, 346]], { tone: "#d4a44c", ribs: 1 });
        for (var r = 0; r < 3; r++) {
          var ru = ((t * 1.3 + r / 3) % 1);
          var rx = lerp(395, 725, ru);
          ctx.strokeStyle = "rgba(248, 113, 113, " + ((1 - ru) * 0.92).toFixed(3) + ")";
          ctx.lineWidth = 6.0;
          ctx.beginPath();
          ctx.ellipse(rx, 338, 16 + ru * 18, 38 + ru * 55, 0, 0, TAU);
          ctx.stroke();
        }
        drawTwinSubCutout16(ctx, S, plates.portholeImg, 645 + pushBack, 168, 336, 360, t, {
          rot: 0.14 * u + Math.sin(t * 8.0) * 0.04
        });
      },

      triangle: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawAftStageBg(ctx, W, H, resolved, plates, S);
        drawOurProw16(ctx, S, 242, 348, t);
        drawTwinSubCutout16(ctx, S, plates.portholeImg, 650, 168, 336, 360, t);

        // Silver slime tightrope linking our rim to twin sub's glass
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 4.0;
        ctx.beginPath();
        ctx.moveTo(332, 362);
        ctx.quadraticCurveTo(555, 382, 785, 388);
        ctx.stroke();
        var sx = lerp(355, 625, u);
        var sy = 366 + Math.sin(u * Math.PI) * 12;
        B.drawSnailSilverTrail(ctx, 332, 362, sx, sy, u, t, { arc: -6 });
        S.drawMailSnail(ctx, sx, sy - 8, 1.18, t, { hasReply: false });
      },

      square: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawAftStageBg(ctx, W, H, resolved, plates, S);
        drawOurProw16(ctx, S, 236, 348, t);
        drawTwinSubCutout16(ctx, S, plates.portholeImg, 665, 168, 336, 360, t);

        var meetX = 548;
        var meetY = 362 + Math.sin(t * 9.0) * 5;
        drawSubBrassTongs(ctx, S, 326, 430, lerp(395, meetX - 18, u), meetY, 0.22, { l1: 145, l2: 135, bendDir: -1 });
        drawSubBrassTongs(ctx, S, 768, 430, lerp(700, meetX + 18, u), meetY, 0.22, { l1: 145, l2: 135, bendDir: 1 });
        B.drawDeterministicParticles(ctx, "brass_sparks", meetX, meetY, resolved.stemT * 0.9, { count: 20, loop: true });
      }
    },

    outcomes: {
      x: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Sunken Dressing-Room Pond Mirror: tarnished silver mirror backing & ornate gilt frame corners around twin sub!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawAftStageBg(ctx, W, H, resolved, plates, S);
          drawOurProw16(ctx, S, 236, 348, t);

          // Ornate gilt dressing-room mirror frame surrounding reflected Twin Sub!
          var mx = 575, my = 132, mw = 445, mh = 420;
          S.drawCutoutPaperEdge(ctx, [[mx - 16, my - 14], [mx + mw + 16, my - 14], [mx + mw + 16, my + mh + 14], [mx - 16, my + mh + 14]], "#d4a44c", "#0b0d10", { paperRim: 5.0 });
          var mg = ctx.createLinearGradient(mx, my, mx + mw, my + mh);
          mg.addColorStop(0.0, "#cbd5e1");
          mg.addColorStop(0.5, "#f8fafc");
          mg.addColorStop(1.0, "#64748b");
          ctx.fillStyle = mg;
          ctx.fillRect(mx, my, mw, mh);

          drawTwinSubCutout16(ctx, S, plates.portholeImg, mx + 58, my + 32, 325, 348, t);

          // Shimmering diagonal mirror glints + tarnished blotches + Reiniger gilt corner medallions
          ctx.strokeStyle = "rgba(255,255,255,0.88)";
          ctx.lineWidth = 6.0;
          var sweep = ((t * 110) % (mw - 80));
          ctx.beginPath();
          ctx.moveTo(mx + 20 + sweep, my + 16);
          ctx.lineTo(mx + 80 + sweep, my + mh - 16);
          ctx.stroke();

          S.drawReinigerFiligreeHinge(ctx, mx, my, 10 * pop, { metal: "brass" });
          S.drawReinigerFiligreeHinge(ctx, mx + mw, my, 10 * pop, { metal: "brass" });
          S.drawReinigerFiligreeHinge(ctx, mx, my + mh, 10 * pop, { metal: "brass" });
          S.drawReinigerFiligreeHinge(ctx, mx + mw, my + mh, 10 * pop, { metal: "brass" });

          B.drawVolumetricBeam(ctx, 295, 342, mx + mw * 0.5, my + mh * 0.5, {
            color: "#bae6fd", spread: 165, intensity: 0.9, t: t
          });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Cardboard Decoy Built By Trout: X-ray backlight turns twin sub translucent, revealing Brook Trout pedaling bicycle cranks!
          var t = resolved.t;
          drawAftStageBg(ctx, W, H, resolved, plates, S);
          drawOurProw16(ctx, S, 232, 348, t);
          drawTwinSubCutout16(ctx, S, plates.portholeImg, 625, 166, 350, 368, t, { tint: "rgba(15, 23, 42, 0.35)" });

          B.drawXRayOverlay(ctx, 800, 355, 320, 265, outSmooth(resolved, 0.6), function (c, cx, cy) {
            // Bicycle chain sprocket + Brook Trout pedaling cranks wired to flat cardboard Turkey stick puppet!
            var pedAng = t * 7.5;
            var gearX = cx + 18, gearY = cy + 62;
            c.strokeStyle = "#fbbf24";
            c.lineWidth = 3.5;
            c.beginPath();
            c.arc(gearX, gearY, 26, 0, TAU);
            c.stroke();
            c.beginPath();
            c.moveTo(gearX + Math.cos(pedAng) * 32, gearY + Math.sin(pedAng) * 32);
            c.lineTo(gearX - Math.cos(pedAng) * 32, gearY - Math.sin(pedAng) * 32);
            c.stroke();

            // Wooden stick driving flat decoy Turkey cutout on left
            var rodY = cy + 10 + Math.sin(pedAng) * 14;
            c.strokeStyle = "#d97706";
            c.lineWidth = 4.5;
            c.beginPath();
            c.moveTo(gearX, gearY - 24);
            c.lineTo(cx - 88, rodY);
            c.stroke();
            S.drawTurkeyInCorner(c, cx - 96, rodY - 18, 0.68, t, { dispatch: 0.8 });

            S.drawBrookTrout(c, cx + 48, cy - 8, 0.92, t * 1.8, false);
          }, { t: t, borderColor: "#38bdf8" });

          S.drawMailSnail(ctx, 520, 524, 1.20, t, { hasReply: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Parallel Universe Evil Mustache Clone: Alien Saucer violet prism ray inverts twin sub + curly mustache Turkey!
          var t = resolved.t;
          drawAftStageBg(ctx, W, H, resolved, plates, S);
          drawOurProw16(ctx, S, 236, 348, t);

          S.drawAlienSaucer(ctx, 795, 92, 1.18, t, 805, 365, { beamSpread: 175 });
          B.drawVolumetricBeam(ctx, 795, 108, 805, 385, {
            color: "#a855f7", coreColor: "#f5d0fe", spread: 175, intensity: 1.25, t: t
          });

          // Neon-negative inverted Twin Sub!
          drawTwinSubCutout16(ctx, S, plates.portholeImg, 635, 174, 340, 362, t, {
            filter: "invert(1) hue-rotate(155deg) contrast(1.35)",
            haloWidth: 5.0,
            wingTone: "#ec4899"
          });

          // Giant black curly handlebar mustache + glowing crimson eyes inside twin porthole!
          var px = 812, py = 398;
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(px - 10, py - 14, 5.5, 0, TAU);
          ctx.arc(px + 10, py - 14, 5.5, 0, TAU);
          ctx.fill();

          ctx.save();
          ctx.translate(px, py + 2);
          ctx.rotate(Math.sin(t * 6.5) * 0.14);
          ctx.strokeStyle = "#0b0d10";
          ctx.lineWidth = 6.5;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-18, -10, -32, 14, -42, -8);
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(18, -10, 32, 14, 42, -8);
          ctx.stroke();
          ctx.restore();
        }
      },

      o: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Yesterday's Echo Crew Waving Late: crimson watery clock rings + twin Turkey waving 2 beats late + calendar pages!
          var t = resolved.t;
          drawAftStageBg(ctx, W, H, resolved, plates, S);
          drawOurProw16(ctx, S, 236, 348, t, { wavePhase: 0 });
          drawTwinSubCutout16(ctx, S, plates.portholeImg, 645, 168, 336, 360, t, { waveOffset: -2.4 });

          // Concentric crimson watery clock face over twin hull
          var cx = 812, cy = 355;
          for (var r = 1; r <= 3; r++) {
            ctx.strokeStyle = "rgba(239, 68, 68, " + (0.78 - r * 0.18).toFixed(3) + ")";
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            cClockArc(ctx, cx, cy, r * 58, t);
            ctx.stroke();
          }
          ctx.strokeStyle = "#fca5a5";
          ctx.lineWidth = 4.0;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(-t * 2.4) * 95, cy + Math.sin(-t * 2.4) * 95);
          ctx.stroke();

          // Floating torn calendar pages (dots in blind mode, numbers in captioned!)
          for (var cp = 0; cp < 4; cp++) {
            var px = 465 + cp * 62;
            var py = 210 + Math.sin(t * 2.5 + cp) * 28;
            S.drawCutoutPaperEdge(ctx, [[px - 22, py - 24], [px + 22, py - 24], [px + 22, py + 24], [px - 22, py + 24]], "#fbfaf5", "#14110d", { paperRim: 1.5, shadow: false });
            ctx.fillStyle = "#d42a1e";
            ctx.fillRect(px - 20, py - 22, 40, 10);
            ctx.beginPath(); ctx.arc(px, py + 6, 4.5, 0, TAU); ctx.fill();
            drawPropLabel(ctx, resolved, String(24 + cp), px, py + 6, { color: "#14110d" });
          }
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Two-Headed Tin Creek Traffic Jam: twin sub spun sideways showing two tin prows + Traffic-Cop Brook Trout cones!
          var t = resolved.t;
          drawAftStageBg(ctx, W, H, resolved, plates, S);
          drawOurProw16(ctx, S, 195, 355, t);

          // Two-headed bolted tin creek contraption at (775, 365)
          var mx = 785, my = 375;
          S.drawScissorCutout(ctx, plates.portholeImg, 208, 206, 232, 194, mx - 165, my - 98, 330, 196, null, { filter: "litho", haloWidth: 4.8 });
          S.drawCardboardPuppetPiece(ctx, [[mx - 18, my - 92], [mx + 18, my - 92], [mx + 22, my + 92], [mx - 22, my + 92]], {
            tone: "#475569", pins: [[mx, my - 56], [mx, my], [mx, my + 56]]
          });
          // Left & right snapping tin prows/heads
          for (var s = -1; s <= 1; s += 2) {
            var hx = mx + s * 155;
            var hy = my - 88 + Math.sin(t * 4.5 + s) * 14;
            S.drawCardboardPuppetPiece(ctx, [[hx - 42, hy - 28], [hx + 42, hy - 28], [hx + 48, hy + 24], [hx - 48, hy + 24]], {
              tone: "#94a3b8", pin: { x: hx, y: hy, r: 4.5, metal: "brass" }
            });
            ctx.fillStyle = "#facc15";
            ctx.beginPath(); ctx.arc(hx + s * 18, hy - 4, 9, 0, TAU); ctx.fill();
          }

          // Traffic-Cop Brook Trout waving glowing orange traffic cones + Mail Snail writing ticket!
          var tx = 485, ty = 348 + Math.sin(t * 3.0) * 6;
          S.drawBrookTrout(ctx, tx, ty, 1.12, t, true);
          // Police peaked cap + orange glow-cones
          S.drawCutoutPaperEdge(ctx, [[tx + 34, ty - 22], [tx + 68, ty - 28], [tx + 62, ty - 12]], "#1e3a8a", "#0b0d10", { paperRim: 1.5, shadow: false });
          var coneWave = Math.sin(t * 7.2) * 18;
          S.drawCutoutPaperEdge(ctx, [[tx + 72, ty - 14 + coneWave], [tx + 114, ty - 26 + coneWave], [tx + 110, ty - 4 + coneWave]], "#f97316", "#fbfaf5", { paperRim: 2, shadow: false });
          S.drawMailSnail(ctx, 455, 505, 1.18, t, { hasReply: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Infinite Time-Loop Submarine Accordion: green chrono-beam fans 10 Droste miniature Turkey Subs into curving S-tunnel!
          var t = resolved.t;
          drawAftStageBg(ctx, W, H, resolved, plates, S);
          drawOurProw16(ctx, S, 215, 355, t);
          S.drawAlienSaucer(ctx, 640, 88, 1.18, t, 760, 340, { beamSpread: 210 });
          B.drawTractorRings(ctx, 640, 108, 760, 340, t, { spread: 185, rings: 6 });

          // Curving accordion tunnel of 10 shrinking waving Turkey Subs!
          for (var k = 9; k >= 0; k--) {
            var u = k / 9;
            var sc = lerp(0.95, 0.24, u);
            var sx = lerp(520, 1025, u);
            var sy = 250 + Math.sin(u * Math.PI * 1.6 + t * 2.2) * 75;
            drawTwinSubCutout16(ctx, S, plates.portholeImg, sx - 140 * sc, sy - 140 * sc, 280 * sc, 298 * sc, t - k * 0.25, {
              filter: k % 2 === 0 ? "cyan" : "sepia",
              haloWidth: 3.5 * sc + 1
            });
          }
        }
      },

      triangle: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Return-To-Sender Mirror Smudge Postmark: Mail Snail flattens on invisible mid-water glass, leaving green postmark over twin beak!
          var t = resolved.t;
          drawAftStageBg(ctx, W, H, resolved, plates, S);
          drawOurProw16(ctx, S, 236, 348, t);
          drawTwinSubCutout16(ctx, S, plates.portholeImg, 635, 168, 336, 360, t);

          // Invisible mid-water glass pane edge & specular streaks at x = 575..835
          ctx.strokeStyle = "rgba(226, 232, 240, 0.72)";
          ctx.lineWidth = 3.5;
          ctx.strokeRect(585, 134, 415, 416);

          // Giant backwards green ink postmark stamped right over twin Turkey's beak at (812, 396)!
          var px = 812, py = 396;
          ctx.strokeStyle = "#10b981";
          ctx.lineWidth = 5.5;
          ctx.beginPath();
          cClockArc(ctx, px, py, 48, 0);
          ctx.stroke();
          for (var wv = -1; wv <= 1; wv++) {
            ctx.beginPath();
            ctx.moveTo(px - 88, py + wv * 14);
            ctx.bezierCurveTo(px - 68, py - 8 + wv * 14, px - 54, py + 8 + wv * 14, px - 36, py + wv * 14);
            ctx.stroke();
          }

          // Flattened Mail Snail smooshed comically against the invisible glass!
          S.drawMailSnail(ctx, 735, 412 + Math.sin(t * 2.0) * 4, 1.32, t, { hasReply: true });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Two Mail Snails Swapping Bags: halfway across slime tightrope, our Mail Snail meets mirror-image Mail Snail!
          var t = resolved.t;
          drawAftStageBg(ctx, W, H, resolved, plates, S);
          drawOurProw16(ctx, S, 225, 348, t);
          drawTwinSubCutout16(ctx, S, plates.portholeImg, 685, 168, 326, 350, t);

          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = 4.5;
          ctx.beginPath();
          ctx.moveTo(318, 360);
          ctx.lineTo(845, 360);
          ctx.stroke();

          // Left Mail Snail + Right Mirror-Image Mail Snail meeting at center (565, 352) swapping tan mailbags!
          S.drawMailSnail(ctx, 512, 350, 1.28, t, { hasReply: true });
          S.drawMailSnail(ctx, 628, 350, 1.28, t, { flip: true, hasReply: true });
          // Extra jaunty blue postal cap on Twin Snail
          S.drawCutoutPaperEdge(ctx, [[620, 318], [646, 316], [642, 330], [618, 330]], "#2563eb", "#0b0d10", { paperRim: 1.5, shadow: false });

          // Swapping tan canvas mailbags arcing between them!
          var swapU = (Math.sin(t * 3.4) + 1) * 0.5;
          var bag1X = lerp(528, 612, swapU);
          var bag2X = lerp(612, 528, swapU);
          S.drawCardboardPuppetPiece(ctx, [[bag1X - 16, 304], [bag1X + 16, 304], [bag1X + 18, 332], [bag1X - 18, 332]], { tone: "#d6a76c", shadow: false });
          S.drawCardboardPuppetPiece(ctx, [[bag2X - 16, 372], [bag2X + 16, 372], [bag2X + 18, 400], [bag2X - 18, 400]], { tone: "#a3b18a", shadow: false });

          S.drawBrookTrout(ctx, 570, 488 + Math.sin(t * 3.2) * 6, 1.12, t, false);
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Clone DNA Sample Beamed Upstairs: sparks race up snail thread into Saucer, printing 3 bubble-wrapped Turkey Sub clones!
          var t = resolved.t;
          drawAftStageBg(ctx, W, H, resolved, plates, S);
          drawOurProw16(ctx, S, 220, 365, t);
          S.drawMailSnail(ctx, 465, 465, 1.18, t, { hasReply: true, hasAlienStamp: true });

          S.drawAlienSaucer(ctx, 640, 96, 1.22, t, 465, 465, { beamSpread: 130 });
          B.drawDeterministicParticles(ctx, "kintsugi", 550, 280, resolved.outcomeT, { count: 18, loop: true });

          // 3 miniature bubble-wrapped Turkey Sub clones bobbing upward like balloons!
          for (var cl = 0; cl < 3; cl++) {
            var bx = 765 + cl * 135;
            var by = 285 - cl * 28 + Math.sin(t * 2.8 + cl * 1.4) * 18;
            // Balloon tether string
            ctx.strokeStyle = "#e2e8f0";
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.moveTo(bx, by + 68);
            ctx.quadraticCurveTo(bx - 12, by + 125, bx + 4, by + 175);
            ctx.stroke();

            drawTwinSubCutout16(ctx, S, plates.portholeImg, bx - 54, by - 58, 108, 116, t + cl, { haloWidth: 2.5 });
            // Translucent iridescent bubble-wrap sphere around each mini clone!
            ctx.fillStyle = "rgba(165, 243, 252, 0.28)";
            ctx.strokeStyle = "#67e8f9";
            ctx.lineWidth = 3.0;
            ctx.beginPath();
            ctx.arc(bx, by, 72, 0, TAU);
            ctx.fill();
            ctx.stroke();
          }
        }
      },

      square: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Fencing Duel With Mirror Reflection: sparks fly as both brass probes parry in strict mirror symmetry + cavalier hat!
          var t = resolved.t;
          drawAftStageBg(ctx, W, H, resolved, plates, S);
          var parryY = 315 + Math.sin(t * 7.5) * 68;
          var parryX = 560;
          drawOurProw16(ctx, S, 232, 352, t, { cavalierHat: true });
          drawOurProw16(ctx, S, 888, 352, t, { mirror: true, cavalierHat: true });

          drawSubBrassTongs(ctx, S, 318, 415, parryX - 10, parryY, 0.14, { l1: 155, l2: 145, bendDir: -1 });
          drawSubBrassTongs(ctx, S, 802, 415, parryX + 10, parryY, 0.14, { l1: 155, l2: 145, bendDir: 1 });
          B.drawDeterministicParticles(ctx, "brass_sparks", parryX, parryY, resolved.outcomeT * 1.4, { count: 24, loop: true });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Tin Puppet Hinges Pop Loose: twin tin sub folds open like a pop-up book revealing Brook Trout & 2 minnows with puppet sticks!
          var t = resolved.t;
          var openU = outSmooth(resolved, 0.7);
          drawAftStageBg(ctx, W, H, resolved, plates, S);
          drawOurProw16(ctx, S, 212, 355, t);
          drawSubBrassTongs(ctx, S, 305, 425, 515, 365, 0.28, { l1: 135, l2: 125, bendDir: -1 });

          // Pop-up book twin sub hinged open into Left & Right tin shell halves around (765, 355)!
          var hx = 765, hy = 345;
          S.drawCardboardPuppetPiece(
            ctx,
            [[hx - 210 * openU - 40, hy - 145], [hx - 20, hy - 155], [hx - 20, hy + 155], [hx - 210 * openU - 40, hy + 145]],
            { tone: "#94a3b8", ribs: 3, pin: { x: hx - 20, y: hy, r: 5.5, metal: "brass" } }
          );
          S.drawCardboardPuppetPiece(
            ctx,
            [[hx + 20, hy - 155], [hx + 210 * openU + 40, hy - 145], [hx + 210 * openU + 40, hy + 145], [hx + 20, hy + 155]],
            { tone: "#cbd5e1", ribs: 3, pin: { x: hx + 20, y: hy, r: 5.5, metal: "brass" } }
          );

          // Inside pop-up stage: Brook Trout + 2 minnows operating wooden marionette crossbars!
          S.drawCardboardPuppetPiece(ctx, [[hx - 85, hy - 125], [hx + 85, hy - 125], [hx + 85, hy - 110], [hx - 85, hy - 110]], {
            tone: "#b45309", shadow: false
          });
          ctx.strokeStyle = "#fde68a";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(hx - 55, hy - 110); ctx.lineTo(hx - 45, hy + 25);
          ctx.moveTo(hx + 55, hy - 110); ctx.lineTo(hx + 45, hy + 25);
          ctx.stroke();

          S.drawBrookTrout(ctx, hx + 15, hy + 18 + Math.sin(t * 3.5) * 6, 1.05, t, false);
          S.drawBrookTrout(ctx, hx - 65, hy - 48, 0.48, t * 1.5, true);
          S.drawBrookTrout(ctx, hx + 72, hy - 52, 0.48, t * 1.7, false);
          S.drawMailSnail(ctx, 545, 512, 1.18, t, { hasReply: true });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Magnetic Matter-Antimatter Hull Spark: violet lightning arcs between tongs + loose rivets orbit like Saturn rings!
          var t = resolved.t;
          drawAftStageBg(ctx, W, H, resolved, plates, S);
          drawOurProw16(ctx, S, 232, 355, t);
          drawTwinSubCutout16(ctx, S, plates.portholeImg, 665, 174, 326, 350, t);
          S.drawAlienSaucer(ctx, 560, 88, 1.20, t, 560, 355, { beamSpread: 220 });

          drawSubBrassTongs(ctx, S, 318, 425, 535, 355, 0.18, { l1: 140, l2: 130, bendDir: -1 });
          drawSubBrassTongs(ctx, S, 785, 425, 585, 355, 0.18, { l1: 140, l2: 130, bendDir: 1 });

          // Jagged violet matter-antimatter lightning arcs!
          ctx.strokeStyle = "#e879f9";
          ctx.lineWidth = 4.2;
          for (var b = 0; b < 3; b++) {
            ctx.beginPath();
            ctx.moveTo(535, 355);
            ctx.lineTo(552, 335 + Math.sin(t * 22 + b * 2) * 28);
            ctx.lineTo(570, 372 + Math.cos(t * 19 + b) * 26);
            ctx.lineTo(585, 355);
            ctx.stroke();
          }
          B.drawLanternHalo(ctx, 560, 355, 135, { color: "#a855f7", coreColor: "#ffffff", intensity: 1.35, t: t });

          // 18 levitated brass rivets orbiting BOTH submarines in tilted Saturn rings!
          ctx.strokeStyle = "rgba(251, 191, 36, 0.36)";
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.ellipse(560, 355, 455, 76, -0.09, 0, TAU);
          ctx.stroke();
          for (var rv = 0; rv < 18; rv++) {
            var ra = t * 1.8 + (rv / 18) * TAU;
            var rx = 560 + Math.cos(ra) * 455;
            var ry = 355 + Math.sin(ra) * 76;
            S.drawSplitPin(ctx, rx, ry, 5.5, { metal: rv % 2 === 0 ? "brass" : "silver" });
          }
        }
      }
    },

    drawForeground: function (ctx, W, H, resolved, plates, S) {
      drawSubtleCornerBezel(ctx, W, H, resolved, S);
    }
  });

  function cClockArc(ctx, x, y, r) {
    ctx.arc(x, y, r, 0, TAU);
  }

  /* ==========================================================================
   * PORTHOLE #17 · DORSAL ("daumier-litho")
   * Clue: Trout Council stone table arguing budgets (p17.jpg + atlas-55.webp)
   * ========================================================================== */

  var COUNCIL_CROPS_17 = [
    { sx: 112, sy: 280, sw: 114, sh: 138, dx: 235, dy: 245, dw: 158, dh: 185, side: 1 },
    { sx: 194, sy: 244, sw: 98,  sh: 114, dx: 382, dy: 198, dw: 145, dh: 162, side: 1 },
    { sx: 288, sy: 230, sw: 84,  sh: 108, dx: 562, dy: 182, dw: 142, dh: 162, side: 1 },
    { sx: 366, sy: 244, sw: 100, sh: 114, dx: 735, dy: 198, dw: 146, dh: 162, side: -1 },
    { sx: 428, sy: 280, sw: 116, sh: 138, dx: 874, dy: 245, dw: 158, dh: 185, side: -1 }
  ];

  function drawPowderedWig17(ctx, S, cx, cy, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale || 1, scale || 1);
    S.drawCutoutPaperEdge(
      ctx,
      [[-38, 22], [-44, -2], [-34, -22], [-14, -30], [14, -30], [34, -22], [44, -2], [38, 22], [24, 24], [22, -4], [-22, -4], [-24, 24]],
      "#f3efe4", "#0b0d10", { paperRim: 2.4 }
    );
    ctx.restore();
  }

  function drawDorsalStage(ctx, W, H, resolved, plates, S, opts) {
    var cfg = opts || {};
    var t = resolved.t;
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.drawScissorCutout(
      ctx, aImg, 14, 65, 354, 245, 430, 124, 420, 218,
      [[0.04, 0.08], [0.50, 0.03], [0.96, 0.08], [0.94, 0.92], [0.06, 0.92]],
      { filter: "litho", haloWidth: 3.0, alpha: 0.38 }
    );
    S.drawEngravingCrosshatch(ctx, W, 440, 0.14, 10, { x: 0, y: 120, color: "#dcd6c8" });

    var activeSpeaker = Math.floor((t * 2.4) % 5);

    if (!cfg.hideCouncil) {
      for (var i = 0; i < 5; i++) {
        var c = COUNCIL_CROPS_17[i];
        var off = cfg.fishOffsetFn ? cfg.fishOffsetFn(i) : { dx: 0, dy: (i === activeSpeaker ? -12 - Math.abs(Math.sin(t * 10)) * 7 : Math.sin(t * 2.3 + i) * 3) };
        var fx = c.dx + (off.dx || 0);
        var fy = c.dy + (off.dy || 0);

        S.drawScissorCutout(
          ctx, pImg, c.sx, c.sy, c.sw, c.sh, fx, fy, c.dw, c.dh,
          [[0.08, 0.08], [0.52, 0.03], [0.92, 0.10], [0.95, 0.90], [0.50, 0.97], [0.05, 0.90]],
          { filter: cfg.fishFilter || "litho", haloWidth: 4.5, rot: off.rot || 0 }
        );

        // Glinting brass wire-rim spectacles
        var gx = fx + c.dw * 0.50;
        var gy = fy + c.dh * 0.28;
        ctx.strokeStyle = "#d4a44c";
        ctx.lineWidth = 2.2;
        ctx.fillStyle = cfg.squint ? "rgba(30,41,59,0.72)" : "rgba(255,255,255,0.38)";
        ctx.beginPath();
        ctx.arc(gx - 13, gy, 8.5, 0, cfg.squint ? Math.PI : TAU);
        ctx.arc(gx + 11, gy, 8.5, 0, cfg.squint ? Math.PI : TAU);
        ctx.fill();
        ctx.stroke();

        if (cfg.wigs) {
          drawPowderedWig17(ctx, S, gx, fy + 16, i === 2 ? 1.16 : 1.0);
        }
        if (typeof cfg.perFishFn === "function") {
          cfg.perFishFn(ctx, i, fx, fy, c.dw, c.dh, gx, gy);
        }
      }
    }

    if (!cfg.hideTable) {
      var tabX = 305, tabY = 354;
      S.drawScissorCutout(
        ctx, pImg, 166, 324, 310, 152, tabX, tabY, 670, 198,
        [[0.05, 0.14], [0.30, 0.03], [0.70, 0.03], [0.95, 0.14], [0.92, 0.62], [0.68, 0.96], [0.32, 0.96], [0.08, 0.62]],
        { filter: cfg.tableFilter || "sepia", haloWidth: 5.2 }
      );

      if (!cfg.hideFins && !cfg.hideCouncil) {
        for (var fi = 0; fi < 5; fi++) {
          var cf = COUNCIL_CROPS_17[fi];
          var shX = cf.dx + cf.dw * 0.5;
          var shY = cf.dy + cf.dh * 0.68;
          var targ = cfg.finTargetFn
            ? cfg.finTargetFn(fi, shX, shY, tabY)
            : { x: shX + (2 - fi) * -14, y: tabY + 42 - (fi === activeSpeaker ? Math.abs(Math.sin(t * 10)) * 32 : 5) };
          drawIKCardboardArm(ctx, S, shX, shY, 46, 44, targ.x, targ.y, cf.side, {
            w1: 8, w2: 6, tone1: "#7b8278", tone2: "#9aa296"
          });
        }
      }
    }

    if (typeof cfg.overlayFn === "function") {
      cfg.overlayFn(ctx, t);
    }
  }

  B.definePortalGame(17, {
    drawBackdrop: function (ctx, W, H, resolved, plates, S) {
      S.drawBolasBackdrop(
        ctx, W, H, resolved.bolasStyle, 17, resolved.t,
        { showCaptions: resolved.showCaptions, lamp: resolved.lampOn, ballast: resolved.ballastOn },
        { bandTop: 116, bandBot: 570 }
      );
    },

    drawRoot: function (ctx, W, H, resolved, plates, S) {
      var t = resolved.t;
      drawDorsalStage(ctx, W, H, resolved, plates, S);
      S.drawTurkeyInCorner(ctx, W, H, t, { x: 132, y: 504, scale: 1.04 });
    },

    stems: {
      x: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawDorsalStage(ctx, W, H, resolved, plates, S, {
          squint: true,
          fishOffsetFn: function (i) {
            return { dx: (i - 2) * 8 * u, dy: 8 * u };
          },
          overlayFn: function (c) {
            B.drawVolumetricBeam(c, 640, 118, 640, 428, {
              color: "#3b82f6", coreColor: "#dbeafe", sourceRadius: 34, spread: 215 * u + 25, intensity: 1.35 * u, t: t
            });
            B.drawLanternHalo(c, 640, 415, 180 * u, { color: "#60a5fa", coreColor: "#ffffff", intensity: 1.15 * u, t: t });
          }
        });
      },

      o: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawDorsalStage(ctx, W, H, resolved, plates, S, {
          overlayFn: function (c) {
            drawSwirlingCurrent(c, S, 640, 360, 265 * u, 95, t * 1.4, "rgba(248, 113, 113, 0.85)", 4);
            for (var p = 0; p < 10; p++) {
              var a = t * 3.6 + (p / 10) * TAU;
              var px = 640 + Math.cos(a) * (95 + (p % 3) * 58) * u;
              var py = 345 + Math.sin(a) * 68 * u;
              S.drawCutoutPaperEdge(c, [[px - 16, py - 12], [px + 16, py - 12], [px + 16, py + 12], [px - 16, py + 12]], p % 2 === 0 ? "#fbfaf5" : "#94a3b8", "#0b0d10", { paperRim: 1.5, shadow: false });
            }
          }
        });
      },

      triangle: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        drawDorsalStage(ctx, W, H, resolved, plates, S, {
          overlayFn: function (c) {
            var sx = lerp(365, 685, u);
            var sy = 418;
            B.drawSnailSilverTrail(c, 355, 424, sx, sy, u, t, { color: "rgba(52, 211, 153, 0.88)", width: 8.0, arc: 4 });
            // Loud green ink wax seal stamped at center of stone table!
            if (u > 0.45) {
              c.fillStyle = "#10b981";
              c.strokeStyle = "#0b0d10";
              c.lineWidth = 2.6;
              c.beginPath();
              c.arc(545, 422, 22, 0, TAU);
              c.fill();
              c.stroke();
            }
            S.drawMailSnail(c, sx, sy - 8, 1.24, t, { hasReply: true });
          }
        });
      },

      square: function (ctx, W, H, resolved, plates, S) {
        var u = easeOutCubic(resolved.stemU);
        var t = resolved.t;
        var knock = Math.abs(Math.sin(t * 8.5)) * 22 * u;
        drawDorsalStage(ctx, W, H, resolved, plates, S, {
          overlayFn: function (c) {
            drawSubBrassTongs(c, S, 985, 560, lerp(860, 640, u), lerp(475, 412 - knock, u), 0.16);
            for (var kr = 0; kr < 3; kr++) {
              var ku = ((t * 1.2 + kr / 3) % 1);
              c.strokeStyle = "rgba(251, 191, 36, " + ((1 - ku) * u).toFixed(3) + ")";
              c.lineWidth = 3.8;
              c.beginPath();
              c.ellipse(640, 418, 42 + ku * 185, 14 + ku * 48, 0, 0, TAU);
              c.stroke();
            }
          }
        });
      }
    },

    outcomes: {
      x: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Stern Underwater Thanksgiving Jury Verdict: 5 powdered wigs + wooden paddles + Turkey behind courtroom blinds!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawDorsalStage(ctx, W, H, resolved, plates, S, {
            wigs: true,
            tableFilter: "litho",
            finTargetFn: function (fi, shX, shY) {
              return { x: shX + 26, y: shY - 82 * pop };
            },
            perFishFn: function (c, i, fx, fy, dw) {
              // Held-up wooden verdict paddles (red X icon in all modes + "GUILTY" in captioned mode!)
              var px = fx + dw * 0.72;
              var py = fy - 18 + Math.sin(t * 4 + i) * 4;
              c.strokeStyle = "#78350f";
              c.lineWidth = 4.5;
              c.beginPath(); c.moveTo(px, py + 24); c.lineTo(px, py + 76); c.stroke();
              S.drawCutoutPaperEdge(c, [[px - 42 * pop, py - 24 * pop], [px + 42 * pop, py - 24 * pop], [px + 42 * pop, py + 24 * pop], [px - 42 * pop, py + 24 * pop]], "#fef3c7", "#0b0d10", { paperRim: 2.0, shadow: false });
              B.drawGeometricSymbol(c, "x", px, py, 16 * pop, "#d42a1e", 3.5);
              drawPropLabel(c, resolved, "GUILTY", px, py, { color: "#991b1b", font: '800 13px "Big Shoulders Display", sans-serif' });
            },
            overlayFn: function (c) {
              B.drawVolumetricBeam(c, 640, 118, 640, 435, { color: "#3b82f6", spread: 260, intensity: 0.95, t: t });
              // Carved wooden courtroom jury rail
              S.drawTornPaperFlat(c, 335, 468, 610, 66, { fill: "#3d2b1c", paperColor: "#fbfaf5", deckle: 4, stroke: "#0b0d10" });
            }
          });
          // Turkey hiding nervously behind horizontal Venetian courtroom blinds at lower-left!
          S.drawTurkeyInCorner(ctx, 152, 502, 1.12, t, { dispatch: 0.1 });
          for (var sl = 0; sl < 5; sl++) {
            ctx.fillStyle = "#e2e8f0";
            ctx.strokeStyle = "#0b0d10";
            ctx.lineWidth = 1.4;
            ctx.fillRect(88, 452 + sl * 18, 128, 7);
            ctx.strokeRect(88, 452 + sl * 18, 128, 7);
          }
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Coin-Operated Creek Parking Meter: Brook Trout drops clam coin into meter pole, flipping flag green + Mail Snail stopwatch!
          var t = resolved.t;
          var u = outSmooth(resolved, 0.75);
          drawDorsalStage(ctx, W, H, resolved, plates, S, {
            hideCouncil: true,
            hideTable: true,
            overlayFn: function (c) {
              // Two watching council fish on left
              for (var i = 0; i < 2; i++) {
                var cc = COUNCIL_CROPS_17[i];
                S.drawScissorCutout(c, plates.portholeImg, cc.sx, cc.sy, cc.sw, cc.sh, 175 + i * 145, 285 + Math.sin(t * 2.5 + i) * 5, 142, 168, null, { filter: "litho", haloWidth: 4.2 });
              }

              var mx = 590;
              S.drawScissorCutout(c, plates.portholeImg, 195, 340, 250, 130, mx - 160, 458, 320, 108, null, { filter: "sepia", haloWidth: 4.5 });
              S.drawCardboardPuppetPiece(c, [[mx - 18, 345], [mx + 18, 345], [mx + 22, 480], [mx - 22, 480]], { tone: "#94a3b8", ribs: 3 });
              S.drawCutoutPaperEdge(c, [[mx - 92, 348], [mx - 96, 215], [mx - 66, 148], [mx, 128], [mx + 66, 148], [mx + 96, 215], [mx + 92, 348]], "#cbd5e1", "#0b0d10", { paperRim: 5.5 });

              // Semicircular dial window flipping from red to PAID emerald green!
              c.fillStyle = "#fbfaf5";
              c.strokeStyle = "#0b0d10";
              c.lineWidth = 2.8;
              c.beginPath(); c.arc(mx, 236, 68, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
              c.fillStyle = "#d42a1e";
              c.beginPath(); c.moveTo(mx, 236); c.arc(mx, 236, 56, Math.PI, Math.PI * 1.35); c.closePath(); c.fill();
              c.fillStyle = "#10b981";
              c.beginPath(); c.moveTo(mx, 236); c.arc(mx, 236, 56, Math.PI * 1.35, TAU); c.closePath(); c.fill();

              var needleAng = lerp(-Math.PI * 0.85, -Math.PI * 0.20, u);
              c.strokeStyle = "#0b0d10";
              c.lineWidth = 4.5;
              c.beginPath(); c.moveTo(mx, 236); c.lineTo(mx + Math.cos(needleAng) * 48, 236 + Math.sin(needleAng) * 48); c.stroke();
              drawPropLabel(c, resolved, "PAID", mx + 24, 208, { color: "#ffffff", font: '800 14px "JetBrains Mono", monospace' });

              // Shiny golden clam coin arcing into coin slot
              var cu = (t * 0.75) % 1;
              var cx = lerp(805, mx + 38, cu);
              var cy = lerp(335, 294, cu) - Math.sin(cu * Math.PI) * 45;
              S.drawCutoutPaperEdge(c, [[cx - 16, cy - 14], [cx + 16, cy - 14], [cx + 18, cy + 12], [cx - 18, cy + 12]], "#fbbf24", "#0b0d10", { paperRim: 2, shadow: false });

              S.drawBrookTrout(c, 885, 348 + Math.sin(t * 2.4) * 6, 1.15, t, false);
              S.drawMailSnail(c, 412, 505, 1.22, t, { hasReply: true });
              // Brass stopwatch beside Mail Snail
              c.fillStyle = "#fbbf24"; c.strokeStyle = "#0b0d10"; c.lineWidth = 2.4;
              c.beginPath(); c.arc(465, 488, 18, 0, TAU); c.fill(); c.stroke();
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // High Galactic Senate Hover Pods: mossy slab splits into 5 floating repulsor disks + alien holo-glyphs!
          var t = resolved.t;
          drawDorsalStage(ctx, W, H, resolved, plates, S, {
            hideCouncil: true,
            hideTable: true,
            overlayFn: function (c) {
              S.drawAlienSaucer(c, 640, 94, 1.20, t, 640, 355, { beamSpread: 260 });
              for (var hr = 0; hr < 3; hr++) {
                c.strokeStyle = hr % 2 === 0 ? "#2dd4bf" : "#fb7185";
                c.lineWidth = 2.4;
                c.beginPath();
                c.ellipse(640, 315, 155 + hr * 72, 32 + hr * 14, Math.sin(t + hr) * 0.06, 0, TAU);
                c.stroke();
              }

              var pods = [
                { x: 215, y: 392, sc: 0.90 },
                { x: 405, y: 446, sc: 0.95 },
                { x: 640, y: 468, sc: 1.04 },
                { x: 875, y: 446, sc: 0.95 },
                { x: 1065, y: 392, sc: 0.90 }
              ];
              for (var si = 0; si < 5; si++) {
                var pod = pods[si];
                var cc = COUNCIL_CROPS_17[si];
                var hy = pod.y + Math.sin(t * 2.8 + si * 1.3) * 14;
                S.drawScissorCutout(c, plates.portholeImg, cc.sx, cc.sy, cc.sw, cc.sh, pod.x - 62 * pod.sc, hy - 128 * pod.sc, 124 * pod.sc, 138 * pod.sc, null, { filter: "cyan", haloWidth: 3.8 });
                S.drawCardboardPuppetPiece(
                  c,
                  [[pod.x - 86 * pod.sc, hy - 12], [pod.x + 86 * pod.sc, hy - 12], [pod.x + 62 * pod.sc, hy + 26], [pod.x - 62 * pod.sc, hy + 26]],
                  { tone: "#64748b", ribs: 2, pins: [[pod.x - 38 * pod.sc, hy + 8], [pod.x + 38 * pod.sc, hy + 8]] }
                );
                c.strokeStyle = "#22d3ee";
                c.lineWidth = 3.2;
                c.beginPath(); c.ellipse(pod.x, hy + 34, 48 * pod.sc, 8 * pod.sc, 0, 0, TAU); c.stroke();
              }
            }
          });
        }
      },

      o: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Hung Jury Paper Blizzard Chaos: soggy paper ballots tornado & plaster over magistrates' spectacles!
          var t = resolved.t;
          drawDorsalStage(ctx, W, H, resolved, plates, S, {
            perFishFn: function (c, i, fx, fy, dw, dh, gx, gy) {
              // Soggy white ballot plastered right over each grumpy magistrate's spectacles!
              c.save();
              c.translate(gx, gy);
              c.rotate(Math.sin(t * 5 + i) * 0.22);
              S.drawCutoutPaperEdge(c, [[-28, -18], [28, -18], [28, 18], [-28, 18]], "#fbfaf5", "#0b0d10", { paperRim: 1.5, shadow: false });
              c.restore();
            },
            overlayFn: function (c) {
              for (var b = 0; b < 22; b++) {
                var a = t * 4.5 + b * 0.65;
                var rad = 65 + (b % 5) * 68;
                var bx = 640 + Math.cos(a) * rad;
                var by = 325 + Math.sin(a * 1.3) * 145;
                c.save();
                c.translate(bx, by);
                c.rotate(a);
                S.drawCutoutPaperEdge(c, [[-18, -12], [18, -12], [18, 12], [-18, 12]], "#fbfaf5", "#0b0d10", { paperRim: 1.2, shadow: false });
                c.restore();
              }
            }
          });
          S.drawTurkeyInCorner(ctx, 152, 496, 1.18, t, { dispatch: 0.95 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Musical Chairs Creek Recess Game: 4 mossy stools + orbiting council trout + Brook Trout on winner rock + party horn!
          var t = resolved.t;
          drawDorsalStage(ctx, W, H, resolved, plates, S, {
            hideCouncil: true,
            hideTable: true,
            overlayFn: function (c) {
              drawSwirlingCurrent(c, S, 640, 385, 310, 115, t * 1.4, "rgba(52, 211, 153, 0.72)", 4);

              // 4 mossy stone stools in recess circle
              var stools = [385, 555, 725, 895];
              for (var s = 0; s < 4; s++) {
                var sx = stools[s];
                S.drawCardboardPuppetPiece(c, [[sx - 46, 462], [sx + 46, 462], [sx + 38, 522], [sx - 38, 522]], {
                  tone: "#4d6b53", ribs: 2, pin: { x: sx, y: 490, r: 4.0, metal: "silver" }
                });
              }

              // 4 council trout swimming frantically in an upper loop!
              for (var k = 0; k < 4; k++) {
                var ka = t * 2.8 + (k / 4) * TAU;
                var fx = 640 + Math.cos(ka) * 295;
                var fy = 255 + Math.sin(ka) * 58;
                var cc = COUNCIL_CROPS_17[k];
                S.drawScissorCutout(c, plates.portholeImg, cc.sx, cc.sy, cc.sw, cc.sh, fx - 54, fy - 62, 108, 124, null, { filter: "litho", haloWidth: 3.5 });
              }

              // Winner Brook Trout perched proudly on stool #2 + Mail Snail blowing red party horn!
              S.drawBrookTrout(c, 565, 425 + Math.sin(t * 4.0) * 5, 1.24, t, false);
              S.drawMailSnail(c, 265, 498, 1.26, t, { hasReply: true });
              var hornLen = 58 + Math.abs(Math.sin(t * 7.5)) * 46;
              S.drawCutoutPaperEdge(c, [[304, 482], [304 + hornLen, 468], [304 + hornLen, 488]], "#ef4444", "#0b0d10", { paperRim: 1.5, shadow: false });
              B.drawDeterministicParticles(c, "confetti", 565, 395, resolved.outcomeT, { count: 20, loop: true });
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Planetary Tax Audit Vortex Shredder: crimson eddy funnels pebbles into Alien Saucer + giant rust-red RECEIPT banner!
          var t = resolved.t;
          var unfurl = outSmooth(resolved, 0.8);
          drawDorsalStage(ctx, W, H, resolved, plates, S, {
            overlayFn: function (c) {
              S.drawAlienSaucer(c, 640, 96, 1.22, t, 640, 415, { beamSpread: 155 });

              // Swirling crimson funnel sucking shiny river pebbles upward into Saucer belly!
              for (var p = 0; p < 14; p++) {
                var pu = ((t * 0.85 + p / 14) % 1);
                var rad = lerp(145, 14, pu);
                var px = 640 + Math.cos(t * 6 + p) * rad;
                var py = lerp(425, 118, pu);
                S.drawCutoutPaperEdge(c, [[px - 10, py - 8], [px + 10, py - 8], [px + 10, py + 8], [px - 10, py + 8]], "#fbbf24", "#0b0d10", { paperRim: 1.5, shadow: false });
              }

              // Giant rust-red accordion RECEIPT banner unfurling from Saucer right side!
              var bh = 365 * unfurl;
              S.drawTornPaperFlat(c, 885, 128, 148, Math.max(40, bh), {
                fill: "#c2410c", paperColor: "#fbfaf5", deckle: 4, stroke: "#0b0d10"
              });
              c.strokeStyle = "#fed7aa";
              c.lineWidth = 3.0;
              for (var ln = 24; ln < bh - 16; ln += 24) {
                c.beginPath();
                c.moveTo(905, 128 + ln);
                c.lineTo(1012, 128 + ln);
                c.stroke();
              }
              drawPropLabel(c, resolved, "RECEIPT", 959, 152, { color: "#ffffff", font: '800 18px "JetBrains Mono", monospace' });
            }
          });
        }
      },

      triangle: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Subpoena Served To Submarine Captain: Head Magistrate goose quill + folded paper airplane against Turkey's glass!
          var t = resolved.t;
          drawDorsalStage(ctx, W, H, resolved, plates, S, {
            overlayFn: function (c) {
              // White goose quill pen held by Center Head Magistrate (#2)
              S.drawCutoutPaperEdge(c, [[625, 365], [685, 255], [712, 268], [642, 372]], "#fbfaf5", "#0b0d10", { paperRim: 2.2 });

              // Folded white paper airplane flying along dashed arc & smacking foreground glass!
              var pu = clamp(((t * 0.72) % 1) * 1.25, 0, 1);
              var ax = lerp(625, 258, pu);
              var ay = lerp(365, 448, pu) - Math.sin(pu * Math.PI) * 95;
              c.strokeStyle = "rgba(212, 42, 30, 0.55)";
              c.lineWidth = 2.4;
              c.setLineDash([7, 5]);
              c.beginPath(); c.moveTo(625, 365); c.quadraticCurveTo(440, 275, 258, 448); c.stroke();
              c.setLineDash([]);

              c.save();
              c.translate(ax, ay);
              c.rotate(pu >= 0.98 ? 0.12 : -0.35);
              S.drawCutoutPaperEdge(c, [[-58, 4], [48, -28], [26, 26]], "#fbfaf5", "#0b0d10", { paperRim: 2.5 });
              c.fillStyle = "#d42a1e";
              c.beginPath(); c.arc(4, 2, 7, 0, TAU); c.fill();
              drawPropLabel(c, resolved, "APPEAR", -4, -4, { color: "#0b0d10", font: '700 11px "JetBrains Mono", monospace' });
              c.restore();
            }
          });
          S.drawTurkeyInCorner(ctx, 148, 502, 1.15, t, { dispatch: 0.3 });
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Approved Pothole Budget For Snails: APPROVED stamps + miniature painted pebble crosswalk + Brook Trout camera flash!
          var t = resolved.t;
          drawDorsalStage(ctx, W, H, resolved, plates, S, {
            overlayFn: function (c) {
              // Painted white zebra-stripe pebble crosswalk + ceremonial red ribbon across foreground!
              S.drawCardboardPuppetPiece(c, [[420, 492], [860, 492], [895, 558], [385, 558]], { tone: "#334155", ribs: 1 });
              for (var st = 0; st < 6; st++) {
                c.fillStyle = "#fbfaf5";
                c.fillRect(435 + st * 72, 502, 44, 44);
              }
              c.strokeStyle = "#ef4444";
              c.lineWidth = 5.5;
              c.beginPath(); c.moveTo(410, 488); c.lineTo(870, 488); c.stroke();

              // Mail Snail crossing with green-stamped clipboard!
              S.drawMailSnail(c, 585 + Math.sin(t * 2.2) * 35, 498, 1.28, t, { hasReply: true });
              S.drawCutoutPaperEdge(c, [[580, 412], [695, 412], [695, 452], [580, 452]], "#d1fae5", "#059669", { paperRim: 2, shadow: false });
              drawPropLabel(c, resolved, "APPROVED", 638, 432, { color: "#065f46", font: '800 15px "JetBrains Mono", monospace' });

              // Brook Trout press photographer snapping vintage bellows camera flash!
              var flash = Math.pow(Math.max(0, Math.sin(t * 5.0)), 6);
              S.drawBrookTrout(c, 985, 425, 1.12, t, false);
              S.drawCardboardPuppetPiece(c, [[892, 405], [936, 405], [936, 442], [892, 442]], { tone: "#1e293b", pin: { x: 902, y: 424, r: 5.0, metal: "silver" } });
              if (flash > 0.05) {
                B.drawLanternHalo(c, 892, 412, 165 * flash + 35, { color: "#fef08a", coreColor: "#ffffff", intensity: 1.5 * flash, t: t });
              }
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Intergalactic Treaty Signed In Slime: Alien Saucer robotic pen co-signs glowing emerald scroll + starburst fireworks!
          var t = resolved.t;
          var pop = outPop(resolved);
          drawDorsalStage(ctx, W, H, resolved, plates, S, {
            overlayFn: function (c) {
              // Unrolled glowing emerald-trimmed treaty scroll on mossy table
              S.drawCutoutPaperEdge(c, [[455, 368], [825, 368], [842, 452], [438, 452]], "#ecfdf5", "#10b981", { paperRim: 4.0 });
              c.strokeStyle = "#059669";
              c.lineWidth = 2.6;
              for (var ln = 0; ln < 3; ln++) {
                c.beginPath();
                c.moveTo(485, 392 + ln * 18);
                c.lineTo(795, 392 + ln * 18);
                c.stroke();
              }

              S.drawAlienSaucer(c, 640, 118, 1.20, t, 640, 410, { beamSpread: 145 });
              // Articulated robotic pen arm lowered from Saucer belly to co-sign treaty!
              var signX = 640 + Math.sin(t * 7.0) * 32;
              drawIKCardboardArm(c, S, 640, 142, 145, 142, signX, 416, 1, { w1: 9, w2: 7, tone1: "#d4a44c", tone2: "#fbbf24", metal: "brass" });

              S.drawBrookTrout(c, 925, 422, 1.12, t, false);
              S.drawMailSnail(c, 415, 442, 1.24, t, { hasReply: true, hasAlienStamp: true });

              // Rising multicolor starburst fireworks!
              var fw = [[265, 185, "#fbbf24"], [445, 148, "#34d399"], [845, 152, "#f472b6"], [1025, 192, "#38bdf8"]];
              for (var fi = 0; fi < fw.length; fi++) {
                var f = fw[fi];
                S.drawCutoutPaperEdge(c, starPoly(f[0], f[1], 28 * pop, 9 * pop, 7, t * 2 + fi), f[2], "#fbfaf5", { paperRim: 1.5, shadow: false });
              }
              B.drawDeterministicParticles(c, "confetti", 640, 220, resolved.outcomeT, { count: 24, loop: true });
            }
          });
        }
      },

      square: {
        probable: function (ctx, W, H, resolved, plates, S) {
          // Order In The Submarine Courtroom: all 5 trout snap upright and salute Turkey in folded newspaper judge hat!
          var t = resolved.t;
          drawDorsalStage(ctx, W, H, resolved, plates, S, {
            fishOffsetFn: function () {
              return { dx: 0, dy: -22, rot: 0 };
            },
            finTargetFn: function (fi, shX, shY) {
              // Crisp military/courtroom fin salute to forehead!
              return { x: shX - 28, y: shY - 88 };
            }
          });
          S.drawTurkeyInCorner(ctx, 168, 495, 1.20, t, { dispatch: 0.7 });
          // Folded triangular grey-newsprint judge bicorne hat perched proudly on Turkey!
          S.drawCutoutPaperEdge(ctx, [[108, 452], [166, 404], [224, 452]], "#e5e7eb", "#0b0d10", { paperRim: 2.2 });
          ctx.strokeStyle = "#4b5563";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(142, 442); ctx.lineTo(192, 442);
          ctx.moveTo(152, 430); ctx.lineTo(182, 430);
          ctx.stroke();
        },

        plausible: function (ctx, W, H, resolved, plates, S) {
          // Cracked Nut Snacks For Everybody: center stone dish splits spilling roasted creek acorns; council munches happily!
          var t = resolved.t;
          drawDorsalStage(ctx, W, H, resolved, plates, S, {
            overlayFn: function (c) {
              // Split limestone snack bowl halves + heap of 12 glossy roasted brown creek acorns!
              S.drawCardboardPuppetPiece(c, [[525, 395], [608, 382], [615, 428], [532, 428]], { tone: "#94a3b8" });
              S.drawCardboardPuppetPiece(c, [[665, 382], [752, 395], [744, 428], [658, 428]], { tone: "#94a3b8" });

              for (var ac = 0; ac < 12; ac++) {
                var ax = 515 + (ac % 6) * 48 + (ac > 5 ? 20 : 0);
                var ay = 418 + Math.floor(ac / 6) * 24 - Math.abs(Math.sin(t * 4 + ac)) * 4;
                // Acorn nut + crosshatched cap
                c.fillStyle = "#92400e";
                c.strokeStyle = "#0b0d10";
                c.lineWidth = 1.8;
                c.beginPath(); c.ellipse(ax, ay + 4, 11, 13, 0, 0, TAU); c.fill(); c.stroke();
                c.fillStyle = "#451a03";
                c.beginPath(); c.arc(ax, ay - 2, 12, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
              }

              S.drawBrookTrout(c, 965, 442 + Math.sin(t * 3.2) * 5, 1.14, t, false);
              S.drawMailSnail(c, 395, 458, 1.22, t, { hasReply: true });
            }
          });
        },

        preposterous: function (ctx, W, H, resolved, plates, S) {
          // Ancient Stonehenge Saucer Landing Beacon: glowing rune fissures across round stone table project hologram pillar!
          var t = resolved.t;
          drawDorsalStage(ctx, W, H, resolved, plates, S, {
            tableFilter: "cyan",
            overlayFn: function (c) {
              var cx = 640, cy = 424;
              // Glowing radial rune fissures spiderwebbing across round stone council slab
              c.strokeStyle = "#2dd4bf";
              c.lineWidth = 4.2;
              for (var rf = 0; rf < 8; rf++) {
                var a = (rf / 8) * TAU + t * 0.25;
                c.beginPath();
                c.moveTo(cx, cy);
                c.lineTo(cx + Math.cos(a) * 140, cy + Math.sin(a) * 38);
                c.lineTo(cx + Math.cos(a + 0.18) * 265, cy + Math.sin(a + 0.18) * 68);
                c.stroke();
              }
              c.beginPath();
              c.ellipse(cx, cy, 225, 56, 0, 0, TAU);
              c.stroke();

              // Towering crystalline hologram beacon pillar firing straight into Alien Saucer's iris!
              B.drawVolumetricBeam(c, cx, cy, cx, 104, {
                color: "#14b8a6", coreColor: "#ccfbf1", sourceRadius: 95, spread: 58, intensity: 1.45, t: t
              });
              B.drawTractorRings(c, cx, 108, cx, cy, t, { spread: 135, rings: 7 });
              S.drawAlienSaucer(c, cx, 98, 1.26, t, false);
            }
          });
        }
      }
    },

    drawForeground: function (ctx, W, H, resolved, plates, S) {
      drawSubtleCornerBezel(ctx, W, H, resolved, S);
    }
  });

  // Ensure duration metadata is explicit on all 6 registered games
  for (var pid = 12; pid <= 17; pid++) {
    if (root.PORTAL_V3_GAMES && root.PORTAL_V3_GAMES[pid]) {
      root.PORTAL_V3_GAMES[pid].duration = DURATION;
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
