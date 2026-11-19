/* ============================================================================
 * Turkey Sub · Multi-SCION Animation Remake Crew 09 (#41–#45)
 * File: portals/remake-09.js  (window.PORTAL_REMAKE_SCENES[41..45])
 *
 * 16.0s (384 frames @ 24fps, 1280×720) 4-Variation BOLAS Rostrum Cutout Cinema:
 *   - #41 · Catwalk  (daumier-litho  · Zazie × Mind Game · S15 Yuasa/Puppet + S33 IK)
 *   - #42 · Ferry    (queneau-rostrum · Ouhispo × This Land Is Mine · S02 Reiniger)
 *   - #43 · Snout    (queneau-rostrum · 99 Ways × Life Aquatic · S18 Cartoon Saloon)
 *   - #44 · Rotor    (duchamp-optic   · Anémic cinéma · S06 John Whitney)
 *   - #45 · Extruder (duchamp-optic   · Le Chant du styrène · S51 Mouris Montage)
 *
 * STRICT PAELEO BLIND-MODE INVARIANT:
 *   Contains ZERO ctx.fillText / ctx.strokeText calls anywhere in this module.
 *   All editorial slate & 4-box contact strip rendering is delegated to
 *   SCION_STAGE.drawBolasSlateAndStrip(ctx, W, H, t, state, id), which emits
 *   0 text calls when state && state.showCaptions === false.
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var PORTAL_IDS = [41, 42, 43, 44, 45];

  if (root && root.SCION_STAGE && typeof root.SCION_STAGE.preloadPortalPlates === "function") {
    root.SCION_STAGE.preloadPortalPlates(PORTAL_IDS);
  }

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, u) { return a + (b - a) * u; }

  // Helper: build a tapered cardboard limb polygon between two joints (x0,y0)->(x1,y1)
  function buildLimbPoly(x0, y0, x1, y1, w0, w1) {
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

  // Helper: draw rising cut-paper ballast bubbles when state.ballast is active
  function drawBallastBubbles(ctx, S, W, H, t, state, count) {
    if (!state || !state.ballast) return;
    var n = count || 12;
    ctx.save();
    for (var i = 0; i < n; i++) {
      var seed = i * 19.37 + 4.1;
      var speed = 55 + S.hash(seed) * 60;
      var bx = 110 + S.hash(seed + 2.3) * (W - 220) + Math.sin(t * 2.4 + i) * 14;
      var by = ((H - 90 - ((t * speed + S.hash(seed + 7.1) * 560) % 560)) + 560) % 560 + 36;
      var br = 5 + S.hash(seed + 11.9) * 9;
      ctx.fillStyle = "rgba(251, 250, 245, 0.72)";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(bx - br * 0.32, by - br * 0.32, br * 0.26, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // Helper: draw interactive Snail Mail override if user triggered snailActive in Beat A/D
  function drawInteractiveSnailOverride(ctx, S, W, t, state, beatIdx, yFloor) {
    if (!state || !state.snailActive) return;
    if (beatIdx === 1 || beatIdx === 2) return; // Already staged in Beats B & C
    var su = (typeof state.snailT === "number") ? clamp(state.snailT, 0, 1) : ((t * 0.28) % 1);
    var sx = lerp(180, W - 180, su);
    var sy = (yFloor || 530) + Math.sin(t * 5.0) * 2;
    S.drawMailSnail(ctx, sx, sy, 1.22, t, {
      hasReply: su > 0.5,
      hasAlienStamp: beatIdx === 3
    });
  }

  // Helper: apply subtle dim overlay when state.lamp === false
  function applyLampDim(ctx, W, H, state) {
    if (state && state.lamp === false) {
      ctx.save();
      ctx.fillStyle = "rgba(10, 14, 20, 0.34)";
      ctx.fillRect(-30, -30, W + 60, H + 60);
      ctx.restore();
    }
  }

  /* ==========================================================================
   * PORTHOLE #41 · CATWALK
   * bolasStyle: "daumier-litho" (modeled on boucle-la.webp)
   * Workshop: Zazie dans le métro · Director: S15 Yuasa/Puppet · Tech: S33 IK, S35 MLS, S41 Spring
   * Plates: ./portholes/p41.jpg (640×640) + ./assets/atlas-stills/atlas-28.webp (842×409, y<260 clean!)
   * ========================================================================== */
  var FISH_CUT_POLY = [
    [0.03, 0.30], [0.16, 0.38], [0.34, 0.26], [0.46, 0.05],
    [0.64, 0.14], [0.88, 0.22], [0.98, 0.34], [0.95, 0.56],
    [0.82, 0.78], [0.60, 0.94], [0.42, 0.95], [0.26, 0.84],
    [0.14, 0.70], [0.03, 0.78], [0.08, 0.54]
  ];

  function drawLithoCatwalkPlanks(ctx, S, W, yTop, px, t) {
    ctx.save();
    // Crisp white lithograph catwalk rail & cross-hatched planks inside the black band
    ctx.fillStyle = "#fbfaf5";
    ctx.strokeStyle = "#0b0c0e";
    ctx.lineWidth = 2.2;
    ctx.fillRect(-30, yTop, W + 60, 18);
    ctx.strokeRect(-30, yTop, W + 60, 18);

    // Cross-hatched plank joints scrolling with parallax
    var step = 76;
    var off = ((px * 0.9) % step + step) % step;
    ctx.strokeStyle = "#0b0c0e";
    ctx.lineWidth = 2.0;
    for (var x = -step + off; x < W + step; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, yTop);
      ctx.lineTo(x - 14, yTop + 18);
      ctx.stroke();
      S.drawSplitPin(ctx, x + 22, yTop + 9, 3.0, { metal: "silver" });
    }

    // Engraved white river ripple hairlines beneath catwalk
    ctx.strokeStyle = "rgba(251, 250, 245, 0.42)";
    ctx.lineWidth = 1.5;
    for (var r = 0; r < 3; r++) {
      var ry = yTop + 30 + r * 14;
      ctx.beginPath();
      for (var rx = -20; rx <= W + 20; rx += 28) {
        var wy = ry + Math.sin(rx * 0.02 + t * 2.2 + r * 1.4) * 3.5;
        if (rx === -20) ctx.moveTo(rx, wy);
        else ctx.lineTo(rx, wy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSunglassesFishRig(ctx, S, plates, cx, cy, scale, t, opts) {
    var cfg = opts || {};
    var sc = scale || 1.0;
    var bob = Math.sin(t * 6.0) * 5 * sc;
    var pitch = Math.sin(t * 3.0) * 0.045 + (cfg.pitch || 0);

    ctx.save();
    ctx.translate(cx, cy + bob);
    ctx.rotate(pitch);

    var dw = 310 * sc;
    var dh = 175 * sc;
    var dx = -dw * 0.48;
    var dy = -dh * 0.54;

    // Articulated lithograph tail boost behind cutout with brass split-pin
    ctx.save();
    ctx.translate(dx + dw * 0.08, dy + dh * 0.53);
    ctx.rotate(Math.sin(t * 7.5) * 0.22);
    S.drawCardboardPuppetPiece(
      ctx,
      [[0, -8 * sc], [-46 * sc, -36 * sc], [-32 * sc, 0], [-46 * sc, 36 * sc], [0, 8 * sc]],
      { tone: "#c8c5bd", ribs: 2, pin: { x: -2 * sc, y: 0, r: 4.2 * sc, metal: "brass" } }
    );
    ctx.restore();

    // Real Scissor-Cut Sea-Bream Plate Crop from p41.jpg (640×640 -> fish region 196,192,246,136)
    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      196, 192, 246, 136,
      dx, dy, dw, dh,
      FISH_CUT_POLY,
      {
        filter: cfg.filter || "litho",
        haloWidth: 5.0,
        haloColor: "#fbfaf7",
        stroke: "#0b0c0e",
        lineWidth: 2.0,
        fallbackColor: "#b8b4ac"
      }
    );

    // Articulated Cool Sunglasses Cutout Piece on hinged nose-bridge (peeks/bobs!)
    var shadeTilt = (cfg.shadeLift || 0) + Math.sin(t * 3.2) * 0.05;
    ctx.save();
    ctx.translate(dx + dw * 0.78, dy + dh * 0.30);
    ctx.rotate(shadeTilt);
    // Ear temple bar
    ctx.strokeStyle = "#0b0c0e";
    ctx.lineWidth = 4.2 * sc;
    ctx.beginPath();
    ctx.moveTo(-58 * sc, 6 * sc);
    ctx.lineTo(18 * sc, -4 * sc);
    ctx.stroke();
    // Dual dark rectangular lenses with crisp white litho glare slashes
    S.drawCutoutPaperEdge(
      ctx,
      [[-18 * sc, -12 * sc], [14 * sc, -15 * sc], [12 * sc, 11 * sc], [-18 * sc, 12 * sc]],
      "#111317",
      "#fbfaf7",
      { paperRim: 2.2 * sc, shadow: false }
    );
    S.drawCutoutPaperEdge(
      ctx,
      [[18 * sc, -15 * sc], [44 * sc, -16 * sc], [41 * sc, 8 * sc], [18 * sc, 9 * sc]],
      "#111317",
      "#fbfaf7",
      { paperRim: 2.2 * sc, shadow: false }
    );
    ctx.strokeStyle = "#fbfaf7";
    ctx.lineWidth = 2.0 * sc;
    ctx.beginPath();
    ctx.moveTo(-10 * sc, -7 * sc); ctx.lineTo(-2 * sc, 6 * sc);
    ctx.moveTo(24 * sc, -9 * sc);  ctx.lineTo(31 * sc, 3 * sc);
    ctx.stroke();
    S.drawSplitPin(ctx, -18 * sc, -2 * sc, 3.3 * sc, { metal: "silver" });
    ctx.restore();

    // Articulated Pectoral Fin tipping shades / gesturing
    ctx.save();
    ctx.translate(dx + dw * 0.54, dy + dh * 0.66);
    ctx.rotate((cfg.finAng != null ? cfg.finAng : 0.25) + Math.sin(t * 5.2) * 0.16);
    S.drawCardboardPuppetPiece(
      ctx,
      [[-6 * sc, -5 * sc], [32 * sc, 4 * sc], [26 * sc, 20 * sc], [-8 * sc, 10 * sc]],
      { tone: "#9d9a93", ribs: 1, pin: { x: 0, y: 0, r: 3.8 * sc, metal: "brass" } }
    );
    ctx.restore();

    ctx.restore();
  }

  function renderPorthole41(ctx, W, H, rawT, state) {
    var S = root.SCION_STAGE;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var lt = beat.localT;
    var plates = S.getPortalPlates(41);

    S.beginCamera(ctx, W, H, t, { state: state, pushDur: 0.65 });

    // 1. Stark Daumier/Verne Ink-Band Cinema Ground (modeled after boucle-la.webp!)
    S.drawBolasBackdrop(ctx, W, H, "daumier-litho", 41, t, state, {
      bandTop: 122,
      bandBot: 572
    });

    var pxFar = S.parallaxX(0.22, t, state);
    var pxMid = S.parallaxX(0.52, t, state);
    var pxFg = S.parallaxX(0.88, t, state);
    var pyMid = S.parallaxY(0.45, t, state);

    // 2. Plane 1 (Far): Yuasa Mind Game photographic eye/brow scissor-cut shards from atlas-28.webp (740×359)
    //    Strictly cropped at sy=18..214 (above y=235 so ZERO subtitle kanji is ever touched!)
    S.drawScissorCutout(
      ctx,
      plates.atlasImg,
      58, 18, 560, 196,
      118 + pxFar, 138 + pyMid * 0.4, 370, 138,
      [[0.02, 0.08], [0.96, 0.02], [0.99, 0.88], [0.06, 0.96]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.82, rot: -0.03 }
    );
    S.drawScissorCutout(
      ctx,
      plates.atlasImg,
      175, 32, 445, 178,
      805 + pxFar * 1.1, 146 - pyMid * 0.3, 330, 128,
      [[0.04, 0.04], [0.98, 0.10], [0.94, 0.95], [0.01, 0.86]],
      { filter: "litho", haloWidth: 4.0, alpha: 0.76, rot: 0.035 }
    );

    // 3. Plane 2 (Mid): Scissor-cut creek rock & reed flats from p41.jpg (avoiding bottom-left turkey reflection)
    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      104, 248, 132, 140,
      74 + pxMid, 366 + pyMid, 226, 152,
      [[0.06, 0.18], [0.42, 0.02], [0.88, 0.16], [0.98, 0.92], [0.04, 0.96]],
      { filter: "litho", haloWidth: 4.5 }
    );
    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      402, 286, 134, 190,
      978 + pxMid, 334 + pyMid, 228, 186,
      [[0.12, 0.04], [0.68, 0.08], [0.96, 0.44], [0.92, 0.96], [0.04, 0.94]],
      { filter: "litho", haloWidth: 4.5 }
    );

    S.drawLampBeam(ctx, W, H, t, state, { x: W * 0.5, y: 580, aimX: W * 0.5 + pxMid, alpha: 0.14 });

    var catwalkY = 508 + (state && state.ballast ? 8 : 0);
    drawLithoCatwalkPlanks(ctx, S, W, catwalkY, pxFg, t);

    // 4. 4-Variation Ouxpo / Zazie Storytelling Stage
    if (beat.index === 0) {
      // === VARIATION I (0–4.0s): "A fish in sunglasses on stilts" ===
      var walkX = lerp(495, 765, beat.u) + pxMid * 0.35;
      var bodyY = 278 + Math.abs(Math.sin(t * 6.0)) * -10;
      var strideA = t * 6.0;

      // Two 2-bone IK wooden stilts (S33 IK + split-pins + footstrike spring!)
      for (var leg = 0; leg < 2; leg++) {
        var ph = strideA + leg * Math.PI;
        var hipX = walkX + (leg === 0 ? -24 : 26);
        var hipY = bodyY + 54;
        var swing = Math.sin(ph);
        var lift = Math.max(0, Math.cos(ph)) * 38;
        var footX = walkX + swing * 74 + (leg === 0 ? -14 : 18);
        var footY = catwalkY - lift;
        var ik = S.solveIK2(hipX, hipY, 102, 108, footX, footY, leg === 0 ? 1 : -1);

        var tone = leg === 0 ? "#8a867e" : "#b5b0a6";
        S.drawCardboardPuppetPiece(ctx, buildLimbPoly(hipX, hipY, ik.jx, ik.jy, 8.5, 7.0), {
          tone: tone,
          ribs: 2,
          pin: { x: hipX, y: hipY, r: 4.6, metal: "brass" }
        });
        S.drawCardboardPuppetPiece(ctx, buildLimbPoly(ik.jx, ik.jy, ik.ex, ik.ey, 7.0, 5.2), {
          tone: tone,
          ribs: 2,
          pins: [{ x: ik.jx, y: ik.jy, r: 4.4, metal: "silver" }, { x: ik.ex, y: ik.ey, r: 3.4, metal: "brass" }]
        });

        // Litho chalk dust puff when stilt plants on catwalk
        if (lift < 4) {
          ctx.fillStyle = "#fbfaf7";
          ctx.beginPath();
          ctx.arc(ik.ex - 10, catwalkY - 2, 4.5, 0, TAU);
          ctx.arc(ik.ex + 11, catwalkY - 3, 3.5, 0, TAU);
          ctx.fill();
        }
      }

      drawSunglassesFishRig(ctx, S, plates, walkX, bodyY, 1.06, t, {
        filter: "litho",
        shadeLift: lt > 1.8 ? -0.14 * S.spring(lt, 1.8, 14, 4.5) : 0
      });
    } else if (beat.index === 1) {
      // === VARIATION II (4.0–8.0s): "A dizzy low-air water mirage" (+ Turkey & Snail Mail Out) ===
      var enterB = S.spring(lt, 0.05, 11, 4.8);
      var mirageCx = 665 + Math.sin(t * 2.8) * 34;
      var mirageCy = 300 + Math.cos(t * 2.2) * 12;

      // Shimmering wavy mirage horizon bands across the ink band
      ctx.save();
      for (var wv = 0; wv < 7; wv++) {
        var wy = 190 + wv * 44;
        var shift = Math.sin(t * 4.6 + wv * 0.9) * 36;
        ctx.strokeStyle = (wv % 2 === 0) ? "rgba(251, 250, 247, 0.34)" : "rgba(29, 89, 110, 0.55)";
        ctx.lineWidth = 3.0;
        ctx.setLineDash([26, 14]);
        ctx.beginPath();
        ctx.moveTo(260 + shift, wy);
        ctx.lineTo(1080 + shift, wy);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();

      // 3 Ghostly Horizontally-Sheared Mirage Echoes (S35 MLS/Mirage displacement!)
      for (var g = 2; g >= 0; g--) {
        var gx = mirageCx + Math.sin(t * 4.2 + g * 1.35) * (22 + g * 28);
        var gy = mirageCy + (g - 1) * 20 + Math.cos(t * 3.5 + g) * 8;
        ctx.save();
        ctx.globalAlpha = g === 0 ? 0.92 : (0.42 - g * 0.11);
        // Wavy rubbery mirage stilts bending like warm glass
        for (var ml = -1; ml <= 1; ml += 2) {
          var sx0 = gx + ml * 24;
          var sy0 = gy + 48;
          var bendX = sx0 + Math.sin(t * 5.4 + ml + g) * 38;
          S.drawCutoutPaperEdge(
            ctx,
            [[sx0 - 6, sy0], [bendX + 6, sy0 + 95], [sx0 - ml * 12 + 5, catwalkY], [sx0 - ml * 12 - 5, catwalkY], [bendX - 6, sy0 + 95]],
            "#d8d3c6",
            "#0b0c0e",
            { paperRim: 2.5, shadow: false }
          );
        }
        drawSunglassesFishRig(ctx, S, plates, gx, gy, (0.98 - g * 0.08) * clamp(enterB, 0.2, 1.15), t + g * 0.35, {
          filter: g === 0 ? "litho" : "mono",
          pitch: Math.sin(t * 4.0 + g) * 0.11
        });
        ctx.restore();
      }

      // Dizzy low-air spiral stars orbiting above mirage + Low-Air Dial (0 text!)
      for (var ds = 0; ds < 3; ds++) {
        var da = t * 3.4 + (ds / 3) * TAU;
        var dxS = mirageCx + Math.cos(da) * 145;
        var dyS = mirageCy - 98 + Math.sin(da) * 22;
        ctx.strokeStyle = "#fbfaf7";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(dxS, dyS, 11, 0, Math.PI * 1.65);
        ctx.stroke();
      }

      // Turkey Cutaway Badge dispatching Mail Snail across catwalk
      S.drawTurkeyCutawayBadge(ctx, 138, 466, 1.06, t, { dispatch: clamp(lt / 1.4, 0, 1) });
      var snailX = lerp(235, 1020, clamp(lt / 3.85, 0, 1));
      S.drawMailSnail(ctx, snailX, catwalkY - 12, 1.24, t, { hasReply: false });
    } else if (beat.index === 2) {
      // === VARIATION III (8.0–12.0s): "A rolling tin can of soup" (+ Trout & Snail Mail Climb) ===
      var rollU = clamp(lt / 3.9, 0, 1);
      var canX = lerp(330, 720, rollU);
      var canR = 88;
      var canY = catwalkY - canR - Math.abs(Math.sin(lt * 7.0)) * 8;
      var spin = lt * 4.2;

      // Folded stilt-sticks strapped neatly behind rolling soup can with brass split-pins!
      ctx.save();
      ctx.translate(canX, canY);
      ctx.rotate(spin);

      // White scissor-cutout paper halo around tin soup can
      ctx.fillStyle = "#fbfaf7";
      ctx.beginPath();
      ctx.arc(0, 0, canR + 8, 0, TAU);
      ctx.fill();

      // Cross-hatched corrugated tin cylinder + red/cream iconic soup label (0 text! Pure vector soup bowl!)
      S.drawCardboardPuppetPiece(
        ctx,
        [[-canR, -32], [-66, -72], [0, -canR], [66, -72], [canR, -32], [canR, 32], [66, 72], [0, canR], [-66, 72], [-canR, 32]],
        { tone: "#c7c9cc", ribs: 4 }
      );

      // Classic two-tone red & cream paper soup-can band
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, canR - 10, 0, TAU);
      ctx.clip();
      ctx.fillStyle = "#d42a1e";
      ctx.fillRect(-canR, -canR, canR * 2, canR);
      ctx.fillStyle = "#fbfaf5";
      ctx.fillRect(-canR, 0, canR * 2, canR);
      ctx.strokeStyle = "#0b0c0e";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-canR, 0); ctx.lineTo(canR, 0);
      ctx.stroke();

      // Center brass medallion + steaming soup bowl icon (pure vector, 0 text!)
      ctx.fillStyle = "#d8a242";
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#0b0c0e";
      ctx.beginPath();
      ctx.arc(0, 3, 12, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#0b0c0e";
      ctx.lineWidth = 1.8;
      for (var st = -1; st <= 1; st++) {
        ctx.beginPath();
        ctx.moveTo(st * 6, -3);
        ctx.quadraticCurveTo(st * 6 - 3, -9, st * 6 + 2, -14);
        ctx.stroke();
      }
      ctx.restore();

      // Folded wooden stilts pinned across the rolling tin lid + cool sunglasses perched on rim!
      S.drawCardboardPuppetPiece(ctx, [[-76, -12], [76, 6], [74, 18], [-78, 0]], {
        tone: "#9a825c",
        ribs: 2,
        pins: [[-48, -4], [0, 3], [48, 10]]
      });
      ctx.restore();

      // Sunglasses bouncing playfully atop the rolling soup can!
      S.drawCutoutPaperEdge(
        ctx,
        [[canX - 36, canY - canR - 22], [canX + 36, canY - canR - 22], [canX + 32, canY - canR - 2], [canX - 32, canY - canR - 2]],
        "#111317",
        "#fbfaf7",
        { paperRim: 3.0 }
      );

      // Brook Trout swimming behind & nudging the soup can along the catwalk!
      S.drawBrookTrout(ctx, canX - 188, canY + 14 + Math.sin(t * 4.2) * 8, 1.26, t, true);

      // Mail Snail climbing up right margin carrying stamped reply
      var climbY = lerp(520, 210, clamp(lt / 3.8, 0, 1));
      S.drawMailSnail(ctx, 1168, climbY, 1.18, t, { rot: -Math.PI * 0.5, hasReply: true });
    } else {
      // === VARIATION IV (12.0–16.0s): "An undercover Men-in-Black agent" (+ Alien Listening Post) ===
      var agentX = 640 + pxMid * 0.25;
      var agentY = 296;
      var flashT = (lt > 1.35) ? S.springImpulse(lt, 1.35, 10, 2.4) : 0;

      // Hovering 3-eyed Alien Saucer scanning the undercover agent
      S.drawAlienSaucer(ctx, 640, 96, 1.18, t, agentX, agentY + 30);

      // Two crisp black-trousered IK stilt-legs with polished Oxford shoes!
      for (var al = -1; al <= 1; al += 2) {
        var hX = agentX + al * 28;
        var hY = agentY + 64;
        var fX = agentX + al * 46 + Math.sin(t * 3.0 + al) * 10;
        var ikA = S.solveIK2(hX, hY, 96, 102, fX, catwalkY, al);
        S.drawCardboardPuppetPiece(ctx, buildLimbPoly(hX, hY, ikA.jx, ikA.jy, 11, 9), {
          tone: "#1c1e22",
          stroke: "#fbfaf7",
          pin: { x: hX, y: hY, r: 4.5, metal: "silver" }
        });
        S.drawCardboardPuppetPiece(ctx, buildLimbPoly(ikA.jx, ikA.jy, ikA.ex, ikA.ey, 9, 7), {
          tone: "#1c1e22",
          stroke: "#fbfaf7",
          pin: { x: ikA.jx, y: ikA.jy, r: 4.2, metal: "silver" }
        });
        // Scissor-cut black dress shoe
        S.drawCutoutPaperEdge(
          ctx,
          [[ikA.ex - 12, catwalkY - 12], [ikA.ex + 26, catwalkY - 10], [ikA.ex + 30, catwalkY], [ikA.ex - 14, catwalkY]],
          "#141619",
          "#fbfaf7",
          { paperRim: 2.5, shadow: false }
        );
      }

      // Sharp Black Suit Jacket + Crisp White Shirt Collar + Skinny Black Tie
      S.drawCutoutPaperEdge(
        ctx,
        [[agentX - 68, agentY + 10], [agentX + 68, agentY + 10], [agentX + 56, agentY + 82], [agentX - 56, agentY + 82]],
        "#16181c",
        "#fbfaf7",
        { paperRim: 4.0 }
      );
      // White shirt V + skinny tie
      ctx.fillStyle = "#fbfaf7";
      ctx.beginPath();
      ctx.moveTo(agentX - 22, agentY + 12);
      ctx.lineTo(agentX + 22, agentY + 12);
      ctx.lineTo(agentX, agentY + 72);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#0b0c0e";
      ctx.beginPath();
      ctx.moveTo(agentX - 5, agentY + 14);
      ctx.lineTo(agentX + 5, agentY + 14);
      ctx.lineTo(agentX + 8, agentY + 62);
      ctx.lineTo(agentX, agentY + 70);
      ctx.lineTo(agentX - 8, agentY + 62);
      ctx.closePath();
      ctx.fill();

      // Fish head in dark MIB sunglasses + Cut-Paper Black Fedora Hat!
      drawSunglassesFishRig(ctx, S, plates, agentX, agentY - 22, 0.96, t, { filter: "litho", finAng: -0.65 });
      S.drawCutoutPaperEdge(
        ctx,
        [[agentX - 84, agentY - 78], [agentX - 46, agentY - 118], [agentX + 42, agentY - 116], [agentX + 88, agentY - 76], [agentX - 84, agentY - 70]],
        "#16181c",
        "#fbfaf7",
        { paperRim: 3.5 }
      );

      // Jointed MIB Arm holding glowing Silver Neuralyzer Wand + Concentric Flash Rings!
      var wandX = agentX + 132;
      var wandY = agentY - 12 + Math.sin(t * 4.5) * 6;
      var ikW = S.solveIK2(agentX + 54, agentY + 24, 56, 54, wandX, wandY + 22, 1);
      S.drawCardboardPuppetPiece(ctx, buildLimbPoly(agentX + 54, agentY + 24, ikW.jx, ikW.jy, 9, 8), {
        tone: "#1c1e22", stroke: "#fbfaf7", pin: { x: agentX + 54, y: agentY + 24, r: 4.0, metal: "silver" }
      });
      S.drawCardboardPuppetPiece(ctx, buildLimbPoly(ikW.jx, ikW.jy, wandX, wandY + 22, 8, 6), {
        tone: "#1c1e22", stroke: "#fbfaf7", pin: { x: ikW.jx, y: ikW.jy, r: 3.8, metal: "silver" }
      });
      // Silver neuralyzer cylinder
      S.drawCutoutPaperEdge(
        ctx,
        [[wandX - 6, wandY - 26], [wandX + 6, wandY - 26], [wandX + 6, wandY + 24], [wandX - 6, wandY + 24]],
        "#d8dce0",
        "#0b0c0e",
        { paperRim: 2.5 }
      );
      var glowR = 14 + Math.abs(flashT) * 95 + (Math.sin(t * 9.0) * 0.5 + 0.5) * 18;
      ctx.strokeStyle = "rgba(212, 42, 30, 0.85)";
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(wandX, wandY - 28, glowR, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(wandX, wandY - 28, 8, 0, TAU);
      ctx.fill();

      S.drawMailSnail(ctx, 185, catwalkY - 12, 1.08, t, { hasReply: true, hasAlienStamp: true });
    }

    drawBallastBubbles(ctx, S, W, H, t, state, 12);
    drawInteractiveSnailOverride(ctx, S, W, t, state, beat.index, catwalkY - 12);
    applyLampDim(ctx, W, H, state);
    S.drawCutShutter(ctx, W, H, t, state);
    S.endCamera(ctx);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 41);
  }

  /* ==========================================================================
   * PORTHOLE #42 · FERRY
   * bolasStyle: "queneau-rostrum" (modeled on exercices-de-style.webp + Nina Paley + S02 Reiniger)
   * Workshop: Ouhispo · Director: S02 Lotte Reiniger · Tech: S32 FK, S44 Multiplane, S48 State Machines
   * Plates: ./portholes/p42.jpg (640×640) + ./assets/atlas-stills/atlas-32.webp (1398×786 This Land Is Mine)
   * ========================================================================== */
  function drawPaperElderPuppet(ctx, S, x, y, scale, t, opts) {
    var cfg = opts || {};
    var sc = scale || 1.0;
    var isLeft = !!cfg.isLeft;
    var vestCol = cfg.robeColor || (isLeft ? "#5c6e58" : "#787c64");
    var sleeveCol = cfg.robeColor ? "#d8ccb4" : (isLeft ? "#e5e0d3" : "#898c74");
    var trouserCol = "#6d6f62";
    var bow = cfg.bow || 0;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);

    // Scissor-cut cream silhouette backing behind whole puppet
    var hipY = 12;
    var stepPh = t * 3.4 + (isLeft ? 0 : Math.PI);

    // 1. Two brass-hinged legs (Thigh + Shin + Shoe with Reiniger filigree pins at hips & knees!)
    for (var l = -1; l <= 1; l += 2) {
      var lx = l * 17;
      var stride = (cfg.walk ? Math.sin(stepPh + l) * 16 : 0);
      var kneeX = lx + stride * 0.45;
      var kneeY = hipY + 52;
      var footX = lx + stride;
      var footY = hipY + 104;

      S.drawCardboardPuppetPiece(ctx, buildLimbPoly(lx, hipY, kneeX, kneeY, 12, 10), {
        tone: trouserCol,
        ribs: 1
      });
      S.drawCardboardPuppetPiece(ctx, buildLimbPoly(kneeX, kneeY, footX, footY, 10, 8), {
        tone: trouserCol,
        ribs: 1
      });
      S.drawCutoutPaperEdge(
        ctx,
        [[footX - 10, footY - 4], [footX + (l > 0 ? 20 : 16), footY + 2], [footX + (l > 0 ? 20 : 16), footY + 10], [footX - 11, footY + 10]],
        "#2a2622",
        "#14110d",
        { paperRim: 2.0, shadow: false }
      );
      S.drawReinigerFiligreeHinge(ctx, lx, hipY, 5.2);
      S.drawReinigerFiligreeHinge(ctx, kneeX, kneeY, 5.0);
    }

    // 2. Hinged Upper Body (bows/leans from waist pivot)
    ctx.save();
    ctx.rotate(bow);

    // Waistcoat / Coat Torso with white shirt V
    S.drawCutoutPaperEdge(
      ctx,
      [[-32, -68], [32, -68], [28, 14], [-28, 14]],
      vestCol,
      "#14110d",
      { paperRim: 3.5 }
    );
    ctx.fillStyle = "#f2eee2";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-11, -67);
    ctx.lineTo(11, -67);
    ctx.lineTo(0, -34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Articulated Left & Right Arms (Shoulder + Elbow brass split-pins!)
    var lArmAng = cfg.leftArm != null ? cfg.leftArm : (0.22 + Math.sin(t * 2.6) * 0.14);
    var rArmAng = cfg.rightArm != null ? cfg.rightArm : (-0.22 - Math.sin(t * 2.6 + 1.1) * 0.14);
    var armAngles = [[-33, -58, lArmAng, cfg.leftForearm || 0.35], [33, -58, rArmAng, cfg.rightForearm || -0.35]];

    for (var ai = 0; ai < 2; ai++) {
      var sx = armAngles[ai][0];
      var sy = armAngles[ai][1];
      var a1 = armAngles[ai][2] + Math.PI * 0.5;
      var a2 = a1 + armAngles[ai][3];
      var ex = sx + Math.cos(a1) * 38;
      var ey = sy + Math.sin(a1) * 38;
      var hx = ex + Math.cos(a2) * 36;
      var hy = ey + Math.sin(a2) * 36;

      S.drawCardboardPuppetPiece(ctx, buildLimbPoly(sx, sy, ex, ey, 9.5, 8.0), { tone: sleeveCol, ribs: 1 });
      S.drawCardboardPuppetPiece(ctx, buildLimbPoly(ex, ey, hx, hy, 7.8, 6.2), { tone: sleeveCol, ribs: 1 });
      S.drawCutoutPaperEdge(ctx, [[hx - 6, hy - 5], [hx + 7, hy - 5], [hx + 6, hy + 9], [hx - 6, hy + 9]], "#dfd0bc", "#14110d", { paperRim: 1.8, shadow: false });
      S.drawReinigerFiligreeHinge(ctx, sx, sy, 4.8);
      S.drawReinigerFiligreeHinge(ctx, ex, ey, 4.5);

      // Optional Cosmic Staff in Beat D or Oar in Beat C
      if (cfg.staff && ((isLeft && ai === 0) || (!isLeft && ai === 1))) {
        ctx.save();
        ctx.translate(hx, hy);
        ctx.strokeStyle = "#d8a242";
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(0, -95);
        ctx.lineTo(0, 75);
        ctx.stroke();
        ctx.fillStyle = "#0f8f80";
        ctx.strokeStyle = "#fbfaf7";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, -102, 11, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // 4. Expressive Engraved Paper Elder Head + Neck Split-Pin
    var headTilt = Math.sin(t * 2.1 + (isLeft ? 0 : 1.7)) * 0.06;
    ctx.save();
    ctx.translate(0, -72);
    ctx.rotate(headTilt);
    S.drawCutoutPaperEdge(
      ctx,
      [[-20, -34], [0, -42], [20, -34], [22, -8], [14, 6], [-14, 6], [-22, -8]],
      "#e2d3be",
      "#14110d",
      { paperRim: 3.0 }
    );
    // White side-hair tufts
    ctx.fillStyle = "#f4f2ec";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-19, -20, 7, 0, TAU);
    ctx.arc(19, -20, 7, 0, TAU);
    if (!isLeft) ctx.ellipse(0, -36, 17, 6, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Eyes, furrowed grumpy/solemn brows & nose
    var grumpy = cfg.grumpy ? 4.5 : 0;
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-13, -24 - grumpy * 0.3); ctx.lineTo(-4, -24 + grumpy * 0.5);
    ctx.moveTo(13, -24 - grumpy * 0.3);  ctx.lineTo(4, -24 + grumpy * 0.5);
    ctx.moveTo(0, -21); ctx.lineTo(2, -12); ctx.lineTo(-2, -11);
    ctx.moveTo(-8, -4 + grumpy * 0.3);
    ctx.quadraticCurveTo(0, -6 - grumpy * 0.5, 8, -4 + grumpy * 0.3);
    ctx.stroke();

    ctx.fillStyle = "#14110d";
    ctx.beginPath();
    ctx.arc(-8, -18, 2.3, 0, TAU);
    ctx.arc(8, -18, 2.3, 0, TAU);
    ctx.fill();

    // Optional Guard Cap (Beat B) or Cosmic Crown Halo (Beat D)
    if (cfg.guardCap) {
      S.drawCutoutPaperEdge(ctx, [[-24, -33], [-18, -50], [18, -50], [25, -33]], "#1d596e", "#14110d", { paperRim: 2.2, shadow: false });
      ctx.fillStyle = "#d8a242";
      ctx.beginPath(); ctx.arc(0, -41, 4.5, 0, TAU); ctx.fill();
    }
    if (cfg.cosmicCrown) {
      ctx.strokeStyle = "#d42a1e";
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(0, -24, 30, 0, TAU); ctx.stroke();
      ctx.fillStyle = "#0f8f80";
      ctx.beginPath(); ctx.arc(0, -28, 4.2, 0, TAU); ctx.fill();
    }

    S.drawSplitPin(ctx, 0, 4, 3.8, { metal: "brass" });
    ctx.restore();

    ctx.restore();
    ctx.restore();
  }

  function renderPorthole42(ctx, W, H, rawT, state) {
    var S = root.SCION_STAGE;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var lt = beat.localT;
    var plates = S.getPortalPlates(42);

    S.beginCamera(ctx, W, H, t, { state: state, pushDur: 0.65 });

    // 1. Warm Buttercream Queneau Rostrum Paper Stock (modeled after exercices-de-style.webp!)
    S.drawBolasBackdrop(ctx, W, H, "queneau-rostrum", 42, t, state, { floor: true });

    var pxFar = S.parallaxX(0.24, t, state);
    var pxMid = S.parallaxX(0.55, t, state);
    var pxFg = S.parallaxX(0.88, t, state);
    var pyMid = S.parallaxY(0.45, t, state);

    // 2. Plane 1 (Far): Nina Paley This Land Is Mine (atlas-32.webp 740×416) olive foliage canopies & rosette frieze!
    S.drawScissorCutout(
      ctx,
      plates.atlasImg,
      0, 0, 192, 372,
      16 + pxFar, 34 + pyMid * 0.4, 285, 495,
      [[0.02, 0.02], [0.92, 0.05], [0.98, 0.48], [0.58, 0.98], [0.02, 0.96]],
      { haloWidth: 4.5, alpha: 0.92 }
    );
    S.drawScissorCutout(
      ctx,
      plates.atlasImg,
      534, 0, 206, 372,
      978 + pxFar, 34 + pyMid * 0.4, 286, 495,
      [[0.08, 0.05], [0.98, 0.02], [0.98, 0.96], [0.42, 0.98], [0.02, 0.48]],
      { haloWidth: 4.5, alpha: 0.92 }
    );
    // Patterned rosette ground ribbon from bottom of atlas-32.webp!
    S.drawScissorCutout(
      ctx,
      plates.atlasImg,
      40, 379, 660, 37,
      110 + pxMid * 0.4, 514, 1060, 48,
      null,
      { haloWidth: 3.5 }
    );

    // Torn-paper teal river channel flowing between the two banks
    S.drawTornPaperFlat(ctx, 165, 444 + (state && state.ballast ? 8 : 0), 950, 78, {
      fill: "#2f6e6d",
      paperColor: "#fbfaf5",
      deckle: 6,
      seed: 42.4
    });
    S.drawWaterCaustics(ctx, W, H, t, 0.18, { color: "rgba(251,250,245,0.28)" });

    // 3. Plane 2 (Mid): Mottled Sycamore Tree Trunks scissored from p42.jpg (640×640, avoiding bottom-left turkey)
    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      112, 118, 146, 282,
      142 + pxMid, 58 + pyMid, 218, 448,
      [[0.36, 0.02], [0.92, 0.02], [0.68, 0.48], [0.88, 0.96], [0.06, 0.94], [0.22, 0.48]],
      { haloWidth: 5.0 }
    );
    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      406, 118, 126, 336,
      920 + pxMid, 58 + pyMid, 206, 448,
      [[0.08, 0.02], [0.64, 0.02], [0.84, 0.52], [0.96, 0.96], [0.24, 0.94], [0.28, 0.52]],
      { haloWidth: 5.0 }
    );

    S.drawLampBeam(ctx, W, H, t, state, { x: W * 0.5, y: 580, aimX: 640 + pxMid, alpha: 0.16 });

    // 4. 4-Variation Ouhispo / Reiniger Stage
    if (beat.index === 0) {
      // === VARIATION I (0–4.0s): "Two paper puppets between two trees" ===
      var bowL = Math.sin(t * 2.0) * 0.08;
      var bowR = -Math.sin(t * 2.0 + 0.6) * 0.08;

      drawPaperElderPuppet(ctx, S, 515 + pxMid * 0.6, 326, 1.12, t, {
        isLeft: true,
        bow: bowL,
        leftArm: 0.25 + Math.sin(t * 2.8) * 0.2,
        rightArm: -0.45 - Math.sin(t * 2.8) * 0.25
      });
      drawPaperElderPuppet(ctx, S, 760 + pxMid * 0.6, 326, 1.12, t, {
        isLeft: false,
        bow: bowR,
        leftArm: 0.45 + Math.sin(t * 2.8 + 0.8) * 0.25,
        rightArm: -0.25 - Math.sin(t * 2.8 + 0.8) * 0.2
      });

      // Scissor-cut trout from p42.jpg gliding smoothly across their waists + carved rune stone at right!
      var troutX = lerp(470, 790, (Math.sin(t * 1.4) * 0.5 + 0.5));
      S.drawScissorCutout(
        ctx,
        plates.portholeImg,
        286, 252, 206, 82,
        troutX - 135, 318 + Math.sin(t * 3.4) * 6, 270, 106,
        [[0.02, 0.52], [0.22, 0.22], [0.58, 0.06], [0.76, 0.26], [0.98, 0.12], [0.95, 0.88], [0.72, 0.78], [0.42, 0.88], [0.16, 0.72]],
        { haloWidth: 4.2 }
      );
    } else if (beat.index === 1) {
      // === VARIATION II (4.0–8.0s): "Grumpy bridge tollbooth guards" (+ Turkey & Snail Mail Out) ===
      // Torn-deckle wooden Tollbooth kiosk in center (0 text! Pure brass coin dish + lantern!)
      S.drawTornPaperFlat(ctx, 578 + pxMid * 0.4, 212, 124, 232, {
        fill: "#6a4c2b",
        paperColor: "#fbfaf5",
        deckle: 5.5,
        seed: 88.2
      });
      // Tollbooth pitched roof & window aperture
      S.drawCutoutPaperEdge(
        ctx,
        [[562 + pxMid * 0.4, 216], [640 + pxMid * 0.4, 174], [718 + pxMid * 0.4, 216]],
        "#9e3d1c",
        "#14110d",
        { paperRim: 3.5 }
      );
      ctx.fillStyle = "#fae194";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2.2;
      ctx.fillRect(602 + pxMid * 0.4, 240, 76, 66);
      ctx.strokeRect(602 + pxMid * 0.4, 240, 76, 66);

      // Two grumpy capped guards flanking the tollbooth, cranking down a striped red-and-cream barrier bar!
      drawPaperElderPuppet(ctx, S, 468 + pxMid * 0.5, 330, 1.10, t, {
        isLeft: true,
        grumpy: true,
        guardCap: true,
        leftArm: -0.95 + Math.sin(t * 5.0) * 0.22,
        rightArm: -0.55
      });
      drawPaperElderPuppet(ctx, S, 812 + pxMid * 0.5, 330, 1.10, t, {
        isLeft: false,
        grumpy: true,
        guardCap: true,
        leftArm: 0.55,
        rightArm: 0.95 - Math.sin(t * 5.0) * 0.22
      });

      // Hinged Red-and-Cream Striped Toll Barrier Arm dropping with spring bounce!
      var dropU = S.spring(lt, 0.25, 11.5, 4.2);
      var barAng = lerp(-0.85, 0.02, clamp(dropU, 0, 1.15));
      ctx.save();
      ctx.translate(515 + pxMid * 0.5, 368);
      ctx.rotate(barAng);
      S.drawCutoutPaperEdge(ctx, [[-14, -10], [295, -9], [295, 9], [-14, 10]], "#fbfaf5", "#14110d", { paperRim: 3.0 });
      ctx.fillStyle = "#d42a1e";
      for (var stp = 16; stp < 280; stp += 48) {
        ctx.fillRect(stp, -8, 24, 16);
      }
      S.drawReinigerFiligreeHinge(ctx, 0, 0, 7.5);
      ctx.restore();

      // Turkey Cutaway Badge + Mail Snail slipping politely underneath the toll gate!
      S.drawTurkeyCutawayBadge(ctx, 128, 474, 1.05, t, { dispatch: clamp(lt / 1.4, 0, 1) });
      var snailBX = lerp(240, 910, clamp(lt / 3.85, 0, 1));
      S.drawMailSnail(ctx, snailBX, 534, 1.24, t, { hasReply: false });
    } else if (beat.index === 2) {
      // === VARIATION III (8.0–12.0s): "The brand-new river ferryboat" (+ Trout & Snail Mail Reply) ===
      var ferryX = lerp(475, 695, beat.u) + Math.sin(t * 1.8) * 10;
      var ferryY = 418 + Math.sin(t * 2.8) * 5;

      // Two elders standing aboard as ferrymen poling with jointed wooden oars!
      drawPaperElderPuppet(ctx, S, ferryX - 78, ferryY - 92, 0.98, t, {
        isLeft: true,
        leftArm: -0.55 + Math.sin(t * 3.2) * 0.28,
        rightArm: -0.35
      });
      drawPaperElderPuppet(ctx, S, ferryX + 76, ferryY - 92, 0.98, t, {
        isLeft: false,
        leftArm: 0.35,
        rightArm: 0.55 - Math.sin(t * 3.2) * 0.28
      });

      // Striped scalloped paper ferry canopy overhead on brass poles
      ctx.strokeStyle = "#6a4914";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ferryX - 150, ferryY - 2); ctx.lineTo(ferryX - 150, ferryY - 165);
      ctx.moveTo(ferryX + 150, ferryY - 2); ctx.lineTo(ferryX + 150, ferryY - 165);
      ctx.stroke();
      S.drawCutoutPaperEdge(
        ctx,
        [[ferryX - 172, ferryY - 160], [ferryX, ferryY - 196], [ferryX + 172, ferryY - 160], [ferryX + 162, ferryY - 140], [ferryX - 162, ferryY - 140]],
        "#0f8f80",
        "#14110d",
        { paperRim: 3.5 }
      );

      // Deckle-edge Wooden River Ferryboat Hull + Spinning Split-Pin Paddlewheel!
      S.drawCutoutPaperEdge(
        ctx,
        [[ferryX - 210, ferryY - 10], [ferryX + 215, ferryY - 10], [ferryX + 175, ferryY + 48], [ferryX - 175, ferryY + 48]],
        "#8b5e34",
        "#14110d",
        { paperRim: 4.5 }
      );
      // Pennant bunting triangles (0 text!)
      for (var fl = -3; fl <= 3; fl++) {
        ctx.fillStyle = (fl % 2 === 0) ? "#d42a1e" : "#fae194";
        ctx.beginPath();
        ctx.moveTo(ferryX + fl * 44 - 14, ferryY - 8);
        ctx.lineTo(ferryX + fl * 44 + 14, ferryY - 8);
        ctx.lineTo(ferryX + fl * 44, ferryY + 14);
        ctx.closePath();
        ctx.fill();
      }
      // Spinning stern paddlewheel
      ctx.save();
      ctx.translate(ferryX - 182, ferryY + 22);
      ctx.rotate(t * 3.6);
      for (var sp = 0; sp < 8; sp++) {
        ctx.rotate(TAU / 8);
        S.drawCardboardPuppetPiece(ctx, [[-4, -38], [4, -38], [4, 38], [-4, 38]], { tone: "#c99842", ribs: 1, shadow: false });
      }
      S.drawReinigerFiligreeHinge(ctx, 0, 0, 8.0);
      ctx.restore();

      // Brook Trout swimming happily beside the new ferryboat + Mail Snail climbing right!
      S.drawBrookTrout(ctx, ferryX + 245, 488 + Math.sin(t * 4.0) * 6, 1.12, t, false);
      S.drawMailSnail(ctx, 1168, lerp(520, 220, clamp(lt / 3.8, 0, 1)), 1.16, t, { rot: -Math.PI * 0.5, hasReply: true });
    } else {
      // === VARIATION IV (12.0–16.0s): "Twin cosmic portal gatekeepers" (+ Alien Listening Post) ===
      var gateCx = 640 + pxMid * 0.3;
      var gateCy = 310;

      S.drawAlienSaucer(ctx, gateCx, 88, 1.15, t, gateCx, gateCy + 40);

      // Ornate Reiniger Filigree & Stained-Paper Spinning Cosmic Stargate Portal between the trees!
      ctx.save();
      ctx.translate(gateCx, gateCy);
      for (var ring = 3; ring >= 0; ring--) {
        var rad = 52 + ring * 34;
        ctx.save();
        ctx.rotate((ring % 2 === 0 ? 1 : -1) * t * (0.9 + ring * 0.35));
        ctx.strokeStyle = ring % 2 === 0 ? "#0f8f80" : "#d42a1e";
        ctx.lineWidth = ring === 3 ? 8 : 3.5;
        ctx.setLineDash(ring === 3 ? [18, 8] : [10, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        for (var k = 0; k < 8; k++) {
          var ka = (k / 8) * TAU;
          S.drawSplitPin(ctx, Math.cos(ka) * rad, Math.sin(ka) * rad, 3.6, { metal: "brass" });
        }
        ctx.restore();
      }
      // Starfield vortex core
      ctx.fillStyle = "#14110d";
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#fbfaf7";
      for (var stI = 0; stI < 12; stI++) {
        var sa = stI * 2.1 + t * 1.8;
        var sr = ((stI * 9 + t * 24) % 42);
        ctx.beginPath();
        ctx.arc(Math.cos(sa) * sr, Math.sin(sa) * sr, 2.2, 0, TAU);
        ctx.fill();
      }
      ctx.restore();

      // Twin Robed Gatekeepers flanking the cosmic portal with glowing brass staffs!
      drawPaperElderPuppet(ctx, S, 412 + pxMid * 0.5, 330, 1.14, t, {
        isLeft: true,
        robeColor: "#2a3a63",
        cosmicCrown: true,
        staff: true,
        leftArm: -0.55,
        rightArm: -0.95
      });
      drawPaperElderPuppet(ctx, S, 868 + pxMid * 0.5, 330, 1.14, t, {
        isLeft: false,
        robeColor: "#2a3a63",
        cosmicCrown: true,
        staff: true,
        leftArm: 0.95,
        rightArm: 0.55
      });

      S.drawMailSnail(ctx, 215, 536, 1.08, t, { hasReply: true, hasAlienStamp: true });
    }

    // Foreground mossy boundary stone scissored from p42.jpg (right bank anchor)
    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      366, 376, 108, 146,
      830 + pxFg, 408 + pyMid * 1.1, 142, 178,
      [[0.18, 0.08], [0.68, 0.02], [0.94, 0.24], [0.96, 0.96], [0.04, 0.96]],
      { haloWidth: 4.5 }
    );

    drawBallastBubbles(ctx, S, W, H, t, state, 10);
    drawInteractiveSnailOverride(ctx, S, W, t, state, beat.index, 536);
    applyLampDim(ctx, W, H, state);
    S.drawCutShutter(ctx, W, H, t, state);
    S.endCamera(ctx);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 42);
  }

  /* ==========================================================================
   * PORTHOLE #43 · SNOUT
   * bolasStyle: "queneau-rostrum" (99 Ways × The Life Aquatic · S18 Cartoon Saloon)
   * Tech: S45 Occlusion Compositing, S41 Secondary Dynamics, S44 Multiplane Parallax
   * Plates: ./portholes/p43.jpg (640×640) + ./assets/atlas-stills/atlas-30.webp (1048×510)
   * ========================================================================== */
  var JAGUAR_SHARK_POLY = [
    [0.02, 0.28], [0.18, 0.44], [0.34, 0.36], [0.42, 0.04],
    [0.54, 0.30], [0.80, 0.40], [0.98, 0.62], [0.96, 0.84],
    [0.74, 0.97], [0.42, 0.96], [0.24, 0.86], [0.05, 0.95],
    [0.18, 0.72], [0.03, 0.66], [0.10, 0.48]
  ];

  function drawCartoonSaloonSideArch(ctx, S, W, H, px) {
    // Decorative geometric Cartoon Saloon cut-paper sea-kelp lancet pilasters at left & right
    ctx.save();
    var cols = ["#1d596e", "#0f8f80", "#d4a44c"];
    for (var side = -1; side <= 1; side += 2) {
      var bx = side < 0 ? (28 + px * 0.4) : (W - 28 + px * 0.4);
      for (var k = 0; k < 4; k++) {
        var ky = 90 + k * 112;
        S.drawCutoutPaperEdge(
          ctx,
          [[bx - side * 10, ky], [bx + side * 54, ky + 38], [bx + side * 26, ky + 96], [bx - side * 14, ky + 78]],
          cols[k % 3],
          "#14110d",
          { paperRim: 3.0 }
        );
      }
    }
    ctx.restore();
  }

  function drawYellowSharkRig(ctx, S, plates, cx, cy, scale, t, opts) {
    var cfg = opts || {};
    var sc = scale || 1.0;
    var bob = Math.sin(t * 2.4) * 6 * sc;

    ctx.save();
    ctx.translate(cx, cy + bob);

    // Optional Beat C Sunfish Golden Rays Halo behind the shark!
    if (cfg.sunRays) {
      ctx.save();
      ctx.translate(20 * sc, 12 * sc);
      ctx.rotate(t * 0.45);
      for (var r = 0; r < 14; r++) {
        var ra = (r / 14) * TAU;
        var rLen = (r % 2 === 0 ? 255 : 205) * sc + Math.sin(t * 4.0 + r) * 10;
        ctx.save();
        ctx.rotate(ra);
        S.drawCutoutPaperEdge(
          ctx,
          [[-16 * sc, 105 * sc], [0, rLen], [16 * sc, 105 * sc]],
          r % 2 === 0 ? "#f5be36" : "#f7dd8c",
          "#14110d",
          { paperRim: 2.4 * sc, shadow: false }
        );
        ctx.restore();
      }
      ctx.restore();
    }

    var dw = 485 * sc;
    var dh = 375 * sc;
    var dx = -dw * 0.52;
    var dy = -dh * 0.52;

    // Articulated Secondary-Motion Tail Extension with Brass Split-Pin (S41)
    ctx.save();
    ctx.translate(dx + dw * 0.08, dy + dh * 0.44);
    ctx.rotate(Math.sin(t * 5.0) * 0.24);
    S.drawCutoutPaperEdge(
      ctx,
      [[0, -14 * sc], [-76 * sc, -66 * sc], [-52 * sc, -4 * sc], [-72 * sc, 56 * sc], [0, 14 * sc]],
      "#eab234",
      "#14110d",
      { paperRim: 3.5 * sc }
    );
    // Leopard spots on tail
    ctx.fillStyle = "#5b3a18";
    ctx.beginPath();
    ctx.arc(-38 * sc, -24 * sc, 6 * sc, 0, TAU);
    ctx.arc(-28 * sc, 16 * sc, 5 * sc, 0, TAU);
    ctx.fill();
    S.drawSplitPin(ctx, -4 * sc, 0, 4.8 * sc, { metal: "brass" });
    ctx.restore();

    // Optional Beat A Spinning Brass Toy Wind-Up Key on dorsal back!
    if (cfg.windupKey) {
      ctx.save();
      ctx.translate(dx + dw * 0.30, dy + dh * 0.24);
      ctx.rotate(-0.42);
      var kSpin = Math.cos(t * 5.5);
      S.drawCardboardPuppetPiece(ctx, [[-5 * sc, -38 * sc], [5 * sc, -38 * sc], [5 * sc, 10 * sc], [-5 * sc, 10 * sc]], { tone: "#d4a44c", ribs: 1 });
      ctx.save();
      ctx.translate(0, -48 * sc);
      ctx.scale(Math.max(0.22, Math.abs(kSpin)), 1);
      S.drawCutoutPaperEdge(
        ctx,
        [[-32 * sc, -16 * sc], [-8 * sc, -22 * sc], [0, -8 * sc], [8 * sc, -22 * sc], [32 * sc, -16 * sc], [26 * sc, 12 * sc], [-26 * sc, 12 * sc]],
        "#e8be66",
        "#14110d",
        { paperRim: 2.5 * sc }
      );
      ctx.restore();
      S.drawSplitPin(ctx, 0, 4 * sc, 4.5 * sc, { metal: "brass" });
      ctx.restore();
    }

    // Real Foraged Jaguar-Shark Cutout from p43.jpg (640×640 -> crop 126,154,322,252)
    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      126, 154, 322, 252,
      dx, dy, dw, dh,
      JAGUAR_SHARK_POLY,
      {
        haloWidth: 5.5,
        haloColor: "#fbfaf5",
        stroke: "#14110d",
        lineWidth: 2.0
      }
    );

    // Articulated Hinged Pectoral Fin with Split-Pin
    ctx.save();
    ctx.translate(dx + dw * 0.33, dy + dh * 0.78);
    ctx.rotate(Math.sin(t * 4.4) * 0.18);
    S.drawCutoutPaperEdge(
      ctx,
      [[0, -10 * sc], [-82 * sc, 34 * sc], [-24 * sc, 42 * sc], [24 * sc, 12 * sc]],
      "#eab234",
      "#14110d",
      { paperRim: 3.0 * sc }
    );
    S.drawSplitPin(ctx, 2 * sc, 2 * sc, 4.5 * sc, { metal: "brass" });
    ctx.restore();

    // Optional Beat B Hungry Accordion Monster Jaw!
    if (cfg.openJaw) {
      var chomp = 0.45 + Math.abs(Math.sin(t * 6.5)) * 0.55;
      ctx.save();
      ctx.translate(dx + dw * 0.64, dy + dh * 0.80);
      ctx.rotate(chomp * 0.36);
      S.drawCutoutPaperEdge(
        ctx,
        [[0, 0], [136 * sc, -8 * sc], [116 * sc, 34 * sc], [12 * sc, 28 * sc]],
        "#f2dfac",
        "#14110d",
        { paperRim: 3.0 * sc }
      );
      // Cut-paper zigzag teeth!
      ctx.fillStyle = "#fbfaf7";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var ti = 0; ti < 6; ti++) {
        var tx0 = (16 + ti * 18) * sc;
        ctx.moveTo(tx0, -2 * sc);
        ctx.lineTo(tx0 + 9 * sc, -18 * sc);
        ctx.lineTo(tx0 + 18 * sc, -3 * sc);
      }
      ctx.fill();
      ctx.stroke();
      S.drawSplitPin(ctx, 0, 2 * sc, 4.6 * sc, { metal: "silver" });
      ctx.restore();
    }

    // Optional Beat D Robotic Space-Banana Peel Flaps & Nose Radar Dish!
    if (cfg.bananaProbe) {
      var peel = 0.65 + Math.sin(t * 3.0) * 0.12;
      // Top & bottom curved yellow banana-peel hull fairings with silver rivets
      S.drawCardboardPuppetPiece(
        ctx,
        [[dx + dw * 0.52, dy + dh * 0.32], [dx + dw * 0.82, dy - 42 * sc * peel], [dx + dw * 0.98, dy - 18 * sc * peel], [dx + dw * 0.76, dy + dh * 0.42]],
        { tone: "#f0c43e", ribs: 2, pin: { x: dx + dw * 0.56, y: dy + dh * 0.35, r: 4.6 * sc, metal: "silver" } }
      );
      S.drawCardboardPuppetPiece(
        ctx,
        [[dx + dw * 0.58, dy + dh * 0.84], [dx + dw * 0.84, dy + dh + 38 * sc * peel], [dx + dw * 1.0, dy + dh + 16 * sc * peel], [dx + dw * 0.78, dy + dh * 0.78]],
        { tone: "#f0c43e", ribs: 2, pin: { x: dx + dw * 0.62, y: dy + dh * 0.82, r: 4.6 * sc, metal: "silver" } }
      );
      // Extending brass radar dish antenna on nose-tip!
      var noseX = dx + dw * 0.96;
      var noseY = dy + dh * 0.65;
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 4 * sc;
      ctx.beginPath();
      ctx.moveTo(noseX - 10 * sc, noseY);
      ctx.lineTo(noseX + 58 * sc, noseY - 12 * sc);
      ctx.stroke();
      S.drawCutoutPaperEdge(
        ctx,
        [[noseX + 46 * sc, noseY - 40 * sc], [noseX + 68 * sc, noseY - 12 * sc], [noseX + 46 * sc, noseY + 16 * sc]],
        "#c5c7ca",
        "#14110d",
        { paperRim: 2.5 * sc }
      );
      ctx.fillStyle = "#d42a1e";
      ctx.beginPath();
      ctx.arc(noseX + 76 * sc, noseY - 14 * sc, (5 + Math.sin(t * 10) * 2) * sc, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  function renderPorthole43(ctx, W, H, rawT, state) {
    var S = root.SCION_STAGE;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var lt = beat.localT;
    var plates = S.getPortalPlates(43);

    S.beginCamera(ctx, W, H, t, { state: state, pushDur: 0.65 });

    // 1. Warm Buttercream Queneau Rostrum Stock + Cartoon Saloon Teal Sea Window
    S.drawBolasBackdrop(ctx, W, H, "queneau-rostrum", 43, t, state, { floor: true });

    var pxFar = S.parallaxX(0.25, t, state);
    var pxMid = S.parallaxX(0.55, t, state);
    var pyMid = S.parallaxY(0.45, t, state);

    // 2. Plane 1 (Far): Diagonal sea-hull mass scissored from atlas-30.webp (740×360)
    S.drawScissorCutout(
      ctx,
      plates.atlasImg,
      24, 20, 692, 320,
      195 + pxFar, 72 + pyMid * 0.4, 890, 442,
      [[0.03, 0.06], [0.52, 0.02], [0.97, 0.08], [0.95, 0.94], [0.46, 0.98], [0.02, 0.90]],
      { filter: "cyan", haloWidth: 5.0, alpha: 0.88 }
    );
    S.drawWaterCaustics(ctx, W, H, t, 0.16);
    drawCartoonSaloonSideArch(ctx, S, W, H, pxMid);

    // Scissor-cut foreground sea-kelp tuft from right side of p43.jpg
    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      422, 342, 108, 168,
      935 + pxMid * 1.2, 362 + pyMid, 168, 198,
      [[0.38, 0.02], [0.88, 0.08], [0.96, 0.94], [0.06, 0.96], [0.14, 0.46]],
      { haloWidth: 4.2 }
    );

    S.drawLampBeam(ctx, W, H, t, state, { x: W * 0.5, y: 580, aimX: 590 + pxMid, alpha: 0.16 });

    // 3. 4-Variation Wes Anderson / 99 Ways Stage
    if (beat.index === 0) {
      // === VARIATION I (0–4.0s): "A spotted toy yellow shark nose" ===
      var boop = Math.sin(lt * 2.6) * 14;
      drawYellowSharkRig(ctx, S, plates, 560 + boop + pxMid * 0.4, 304, 1.02, t, {
        windupKey: true
      });

      // Symmetrical glass nose-boop concentric contact rings where toy snout presses!
      var glassX = 785 + pxMid * 0.3;
      var glassY = 342;
      ctx.save();
      ctx.strokeStyle = "rgba(251, 250, 245, 0.78)";
      ctx.lineWidth = 2.6;
      for (var cr = 1; cr <= 3; cr++) {
        var rPulse = cr * 22 + Math.max(0, boop) * 1.1;
        ctx.beginPath();
        ctx.ellipse(glassX, glassY, rPulse * 0.65, rPulse, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();

      // Small spotted trout cutout from p43.jpg watching curiously at upper-right
      S.drawScissorCutout(
        ctx,
        plates.portholeImg,
        390, 210, 128, 66,
        855 + pxMid * 0.8, 195 + Math.sin(t * 3.5) * 7, 196, 98,
        null,
        { haloWidth: 4.0 }
      );
    } else if (beat.index === 1) {
      // === VARIATION II (4.0–8.0s): "A hungry lemon-pepper sea monster" (+ Turkey & Snail Mail Out) ===
      drawYellowSharkRig(ctx, S, plates, 575 + pxMid * 0.4, 314, 1.04, t, {
        openJaw: true
      });

      // Giant Cut-Paper Lemon Slices + Tilted Brass Pepper Shaker showering black peppercorns!
      for (var lm = 0; lm < 2; lm++) {
        var lx = 335 + lm * 510 + Math.sin(t * 2.5 + lm) * 12;
        var ly = 165 + lm * 40 + Math.cos(t * 2.8 + lm) * 10;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(t * (lm === 0 ? 0.8 : -0.7));
        S.drawCutoutPaperEdge(ctx, [[-44, 0], [-30, -32], [0, -44], [32, -30], [44, 0], [30, 32], [0, 44], [-32, 30]], "#f7dd4a", "#14110d", { paperRim: 3.5 });
        ctx.fillStyle = "#fff8d2";
        ctx.beginPath(); ctx.arc(0, 0, 33, 0, TAU); ctx.fill();
        ctx.strokeStyle = "#e0b422";
        ctx.lineWidth = 2.2;
        for (var seg = 0; seg < 8; seg++) {
          var sa = (seg / 8) * TAU;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(sa) * 32, Math.sin(sa) * 32); ctx.stroke();
        }
        ctx.restore();
      }

      // Tilted Cardboard & Silver-Cap Pepper Shaker shaking above shark jaw (0 text!)
      var shX = 830;
      var shY = 142 + Math.sin(t * 11.0) * 8;
      ctx.save();
      ctx.translate(shX, shY);
      ctx.rotate(2.35 + Math.sin(t * 11.0) * 0.1);
      S.drawCardboardPuppetPiece(ctx, [[-22, -36], [22, -36], [18, 30], [-18, 30]], { tone: "#7e7c76", ribs: 2 });
      S.drawCutoutPaperEdge(ctx, [[-18, 30], [18, 30], [14, 44], [-14, 44]], "#d5d7da", "#14110d", { paperRim: 2.0, shadow: false });
      ctx.restore();

      // Falling peppercorn specks
      ctx.fillStyle = "#14110d";
      for (var pp = 0; pp < 16; pp++) {
        var pxP = 755 + S.hash(pp * 7.3) * 110;
        var pyP = 195 + ((t * 120 + pp * 23) % 185);
        ctx.beginPath(); ctx.arc(pxP, pyP, 3.0, 0, TAU); ctx.fill();
      }

      S.drawTurkeyCutawayBadge(ctx, 134, 474, 1.05, t, { dispatch: clamp(lt / 1.4, 0, 1) });
      S.drawMailSnail(ctx, lerp(240, 960, clamp(lt / 3.85, 0, 1)), 536, 1.22, t, { hasReply: false });
    } else if (beat.index === 2) {
      // === VARIATION III (8.0–12.0s): "A friendly giant yellow sunfish" (+ Trout & Snail Mail Reply) ===
      drawYellowSharkRig(ctx, S, plates, 535 + pxMid * 0.35, 305, 0.96, t, {
        sunRays: true
      });

      // Brook Trout swimming nose-to-nose in friendly greeting + heart/bubble rings!
      S.drawBrookTrout(ctx, 888, 336 + Math.sin(t * 3.6) * 8, 1.32, t, false);
      for (var hb = 0; hb < 4; hb++) {
        var bu = ((t * 0.65 + hb * 0.25) % 1);
        ctx.strokeStyle = "#fbfaf7";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(785 + Math.sin(bu * 6 + hb) * 10, 325 - bu * 95, 5 + bu * 6, 0, TAU);
        ctx.stroke();
      }

      S.drawMailSnail(ctx, 1168, lerp(520, 215, clamp(lt / 3.8, 0, 1)), 1.18, t, { rot: -Math.PI * 0.5, hasReply: true });
    } else {
      // === VARIATION IV (12.0–16.0s): "A robotic space-banana probe" (+ Alien Listening Post) ===
      S.drawAlienSaucer(ctx, 680, 92, 1.16, t, 595, 315);
      drawYellowSharkRig(ctx, S, plates, 545 + pxMid * 0.35, 316, 0.98, t, {
        bananaProbe: true
      });

      // Telemetry wave arcs emitted from the banana-probe radar nosecone!
      for (var wa = 0; wa < 3; wa++) {
        var wu = ((t * 0.9 + wa / 3) % 1);
        ctx.strokeStyle = "rgba(212, 42, 30, " + (1 - wu).toFixed(3) + ")";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(835, 330, 24 + wu * 115, -0.65, 0.65);
        ctx.stroke();
      }

      S.drawMailSnail(ctx, 210, 536, 1.08, t, { hasReply: true, hasAlienStamp: true });
    }

    drawBallastBubbles(ctx, S, W, H, t, state, 11);
    drawInteractiveSnailOverride(ctx, S, W, t, state, beat.index, 536);
    applyLampDim(ctx, W, H, state);
    S.drawCutShutter(ctx, W, H, t, state);
    S.endCamera(ctx);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 43);
  }

  /* ==========================================================================
   * PORTHOLE #44 · ROTOR
   * bolasStyle: "duchamp-optic" (Anémic cinéma 1926 · S06 John Whitney)
   * Tech: S32 FK, S35 MLS, S47 Sound-to-Action
   * Plates: ./portholes/p44.jpg (640×640) + ./assets/atlas-stills/atlas-52.webp (355×631)
   * ========================================================================== */
  function drawDuchampRotorelief(ctx, S, cx, cy, outerR, angle, opts) {
    var cfg = opts || {};
    var rings = cfg.rings || 14;
    var ecc = cfg.eccentricity != null ? cfg.eccentricity : 0.24;

    ctx.save();
    ctx.translate(cx, cy);

    // Scissor-cut cream paper disc backing + drop shadow
    ctx.fillStyle = "rgba(8, 8, 10, 0.48)";
    ctx.beginPath();
    ctx.arc(6, 8, outerR + 7, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.arc(0, 0, outerR + 6, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.arc(0, 0, outerR, 0, TAU);
    ctx.clip();

    // Authentic Marcel Duchamp Eccentric Nested Circles (creates vivid 3D apparent cone relief!)
    for (var i = 0; i < rings; i++) {
      var u = i / rings;
      var r = lerp(outerR, 14, u);
      var offMag = Math.sin(u * Math.PI) * outerR * ecc;
      var offAng = u * Math.PI * 1.85;
      var ox = Math.cos(offAng) * offMag;
      var oy = Math.sin(offAng) * offMag;

      ctx.fillStyle = (i % 2 === 0)
        ? (cfg.darkColor || "#0f1115")
        : (cfg.lightColor || "#f5f1e4");
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, TAU);
      ctx.fill();
    }

    // Subtle paper grain over optical rotor
    S.drawPaperGrainOverlay(ctx, outerR * 2, outerR * 2, 0.45, { vignette: false });
    ctx.restore();

    // Outer engraved ink rim + decorative non-textual paper-tooth notches around perimeter
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(0, 0, outerR, 0, TAU);
    ctx.stroke();

    if (cfg.pegs) {
      for (var p = 0; p < 12; p++) {
        var pa = angle + (p / 12) * TAU;
        S.drawSplitPin(ctx, Math.cos(pa) * (outerR - 6), Math.sin(pa) * (outerR - 6), 4.0, { metal: "brass" });
      }
    }

    ctx.restore();
  }

  function drawPieWheelOverlay(ctx, S, cx, cy, outerR, angle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    var pieCols = ["#f5df9e", "#dceee9", "#fae194", "#f0dfd8", "#f5df9e", "#dceee9", "#fae194", "#f0dfd8"];
    var fillCols = ["#d42a1e", "#d9822b", "#8b5e34", "#0f8f80", "#d42a1e", "#d9822b", "#8b5e34", "#0f8f80"];
    for (var s = 0; s < 8; s++) {
      var a0 = (s / 8) * TAU;
      var a1 = ((s + 1) / 8) * TAU;
      var mid = (a0 + a1) * 0.5;
      ctx.fillStyle = pieCols[s];
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, outerR - 8, a0, a1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cute vector Pie Slice Icon inside each wedge (0 text!)
      ctx.save();
      ctx.rotate(mid);
      ctx.translate(outerR * 0.60, 0);
      // Pie wedge filling
      ctx.fillStyle = fillCols[s];
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.lineTo(22, -20);
      ctx.lineTo(22, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Crimped golden crust rim + whipped-cream dollop!
      ctx.strokeStyle = "#c98a2c";
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(22, -21);
      ctx.lineTo(22, 21);
      ctx.stroke();
      ctx.fillStyle = "#fbfaf7";
      ctx.beginPath();
      ctx.arc(2, 0, 6.5, 0, TAU);
      ctx.fill();
      ctx.restore();

      // Brass rim peg between wedges
      S.drawSplitPin(ctx, Math.cos(a0) * (outerR - 8), Math.sin(a0) * (outerR - 8), 4.4, { metal: "brass" });
    }
    ctx.restore();
  }

  function renderPorthole44(ctx, W, H, rawT, state) {
    var S = root.SCION_STAGE;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var lt = beat.localT;
    var plates = S.getPortalPlates(44);

    S.beginCamera(ctx, W, H, t, { state: state, pushDur: 0.65 });

    // 1. Dark Engraved Workshop Slate (modeled after anemic-cinema!)
    S.drawBolasBackdrop(ctx, W, H, "duchamp-optic", 44, t, state);

    var pxFar = S.parallaxX(0.24, t, state);
    var pxMid = S.parallaxX(0.54, t, state);
    var pyMid = S.parallaxY(0.45, t, state);

    // 2. Plane 1 (Far): Wet circular rim shards scissored from atlas-52.webp (355×631)
    S.drawScissorCutout(
      ctx,
      plates.atlasImg,
      10, 228, 335, 290,
      98 + pxFar, 118 + pyMid * 0.4, 285, 265,
      [[0.08, 0.14], [0.54, 0.02], [0.96, 0.18], [0.94, 0.88], [0.46, 0.98], [0.04, 0.84]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.78, rot: -0.06 }
    );
    S.drawScissorCutout(
      ctx,
      plates.atlasImg,
      10, 228, 335, 290,
      895 + pxFar, 148 - pyMid * 0.4, 275, 255,
      [[0.06, 0.18], [0.58, 0.04], [0.96, 0.22], [0.92, 0.90], [0.42, 0.96], [0.04, 0.80]],
      { filter: "cyan", haloWidth: 4.0, alpha: 0.75, rot: 0.08 }
    );

    // Scissor-cut spiral plate backing & creek reeds from p44.jpg
    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      432, 316, 108, 178,
      952 + pxMid, 355 + pyMid, 172, 224,
      [[0.36, 0.02], [0.88, 0.10], [0.94, 0.96], [0.06, 0.96], [0.16, 0.48]],
      { haloWidth: 4.2 }
    );

    var hubX = 640 + pxMid * 0.35;
    var hubY = 292 + (beat.index === 3 ? Math.sin(t * 2.5) * -18 - 16 : 0);
    var rotorR = 202;
    var spinAng = t * (beat.index === 1 ? 3.8 : 2.5);

    S.drawLampBeam(ctx, W, H, t, state, { x: W * 0.5, y: 590, aimX: hubX, alpha: 0.15 });

    // 3. 4-Variation Duchamp / Whitney Stage
    if (beat.index === 0) {
      // === VARIATION I (0–4.0s): "A spinning striped paper disc" ===
      drawDuchampRotorelief(ctx, S, hubX, hubY, rotorR, spinAng, { pegs: true });

      // Articulated IK Crank Arm & Escapement Pawl ticking along rim!
      var crankX = hubX + Math.cos(spinAng) * 58;
      var crankY = hubY + Math.sin(spinAng) * 58;
      var ikC = S.solveIK2(375, 495, 165, 165, crankX, crankY, -1);
      S.drawCardboardPuppetPiece(ctx, buildLimbPoly(375, 495, ikC.jx, ikC.jy, 9, 8), {
        tone: "#9a825c", pin: { x: 375, y: 495, r: 5.0, metal: "brass" }
      });
      S.drawCardboardPuppetPiece(ctx, buildLimbPoly(ikC.jx, ikC.jy, crankX, crankY, 8, 7), {
        tone: "#b89b6c", pins: [{ x: ikC.jx, y: ikC.jy, r: 4.5, metal: "silver" }, { x: crankX, y: crankY, r: 4.5, metal: "brass" }]
      });

      // Small trout peeking from right edge (scissored from p44.jpg 428,208,112,78)
      S.drawScissorCutout(
        ctx,
        plates.portholeImg,
        428, 208, 112, 78,
        905 + pxMid * 0.7, 232 + Math.sin(t * 3.4) * 6, 185, 118,
        null,
        { haloWidth: 4.0 }
      );
    } else if (beat.index === 1) {
      // === VARIATION II (4.0–8.0s): "A dizzying hypnosis mind-trap" (+ Turkey & Snail Mail Out) ===
      // Expanding hypnotic concentric wave rings across the dark slate
      for (var hr = 0; hr < 4; hr++) {
        var hu = ((t * 0.55 + hr * 0.25) % 1);
        ctx.strokeStyle = hr % 2 === 0
          ? "rgba(15, 143, 128, " + (0.75 * (1 - hu)).toFixed(3) + ")"
          : "rgba(247, 221, 140, " + (0.75 * (1 - hu)).toFixed(3) + ")";
        ctx.lineWidth = 4.0;
        ctx.beginPath();
        ctx.arc(hubX, hubY, rotorR + hu * 230, 0, TAU);
        ctx.stroke();
      }

      // Counter-rotating dual eccentric spirals!
      drawDuchampRotorelief(ctx, S, hubX, hubY, rotorR + 10, spinAng, {
        darkColor: "#101820",
        lightColor: "#fae194",
        eccentricity: 0.28
      });
      drawDuchampRotorelief(ctx, S, hubX, hubY, rotorR * 0.54, -spinAng * 1.45, {
        rings: 8,
        darkColor: "#1d596e",
        lightColor: "#fbfaf7",
        eccentricity: 0.26
      });

      // Turkey Cutaway Badge with tiny spinning hypnosis pinwheels + Mail Snail crawling below!
      S.drawTurkeyCutawayBadge(ctx, 142, 470, 1.08, t, { dispatch: clamp(lt / 1.4, 0, 1) });
      ctx.strokeStyle = "#fae194";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(154, 456, 14, t * 8, t * 8 + Math.PI * 1.5);
      ctx.stroke();

      S.drawMailSnail(ctx, lerp(255, 1020, clamp(lt / 3.85, 0, 1)), 560, 1.22, t, { hasReply: false });
    } else if (beat.index === 2) {
      // === VARIATION III (8.0–12.0s): "The diner’s lucky pie-prize wheel" (+ Trout & Snail Mail Reply) ===
      var wheelAng = lt * 3.1;
      drawPieWheelOverlay(ctx, S, hubX, hubY, rotorR + 6, wheelAng);

      // Spring-loaded Leather & Brass Diner Pointer Clapper clicking at 12-o'clock!
      var pegClick = Math.sin(wheelAng * 8);
      var flapAng = Math.max(0, pegClick) * 0.42;
      ctx.save();
      ctx.translate(hubX, hubY - rotorR - 22);
      ctx.rotate(-flapAng);
      S.drawCutoutPaperEdge(ctx, [[-18, -16], [18, -16], [6, 36], [-6, 36]], "#d42a1e", "#fbfaf7", { paperRim: 3.0 });
      S.drawSplitPin(ctx, 0, -6, 5.2, { metal: "brass" });
      ctx.restore();

      // Brook Trout spinning the lucky pie wheel with its tail!
      S.drawBrookTrout(ctx, hubX + 275, hubY + 52 + Math.sin(t * 4.0) * 8, 1.25, t, false);
      S.drawMailSnail(ctx, 1168, lerp(530, 210, clamp(lt / 3.8, 0, 1)), 1.18, t, { rot: -Math.PI * 0.5, hasReply: true });
    } else {
      // === VARIATION IV (12.0–16.0s): "A swirling alien memory-wiper" (+ Alien Listening Post) ===
      S.drawAlienSaucer(ctx, hubX, 82, 1.16, t, hubX, hubY);

      drawDuchampRotorelief(ctx, S, hubX, hubY, rotorR * 0.92, -t * 3.6, {
        darkColor: "#16111c",
        lightColor: "#dceee9",
        eccentricity: 0.30
      });

      // John Whitney S06 Harmonic Rose-Curve / Lissajous Geometric Orbits over the rotor!
      ctx.save();
      ctx.translate(hubX, hubY);
      for (var petal = 0; petal < 2; petal++) {
        ctx.strokeStyle = petal === 0 ? "#d42a1e" : "#0f8f80";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        for (var s = 0; s <= 180; s++) {
          var th = (s / 180) * TAU;
          var rr = (145 + petal * 45) * Math.cos(4 * th + t * (petal === 0 ? 2.4 : -1.9));
          var wx = Math.cos(th) * rr;
          var wy = Math.sin(th) * rr;
          if (s === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();

      S.drawMailSnail(ctx, 200, 560, 1.08, t, { hasReply: true, hasAlienStamp: true });
    }

    // 4. Plane 3 (Foreground): Real Scissor-Cut A-Frame Trestle Stand from p44.jpg (225,282,190,248) + Hub Hinge!
    var standDrop = beat.index === 3 ? 28 : 0;
    S.drawScissorCutout(
      ctx,
      plates.portholeImg,
      225, 282, 190, 248,
      hubX - 135, hubY - 22 + standDrop, 270, 326,
      [[0.38, 0.02], [0.62, 0.02], [0.76, 0.44], [0.96, 0.98], [0.68, 0.98], [0.56, 0.58], [0.44, 0.58], [0.32, 0.98], [0.04, 0.98], [0.24, 0.44]],
      { haloWidth: 4.5 }
    );
    S.drawReinigerFiligreeHinge(ctx, hubX, hubY, 15.0, { metal: "brass" });

    drawBallastBubbles(ctx, S, W, H, t, state, 12);
    drawInteractiveSnailOverride(ctx, S, W, t, state, beat.index, 560);
    applyLampDim(ctx, W, H, state);
    S.drawCutShutter(ctx, W, H, t, state);
    S.endCamera(ctx);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 44);
  }

  /* ==========================================================================
   * PORTHOLE #45 · EXTRUDER
   * bolasStyle: "duchamp-optic" (Le Chant du styrène 1958 · S51 Mouris Montage)
   * Tech: S43 Collage Graph Rewriting, S41 Secondary Dynamics, S47 Sound-to-Action
   * Plates: ./portholes/p45.jpg (640×640) + ./assets/atlas-stills/atlas-36.webp (1123×631)
   * ========================================================================== */
  var BEAD_PALETTE = ["#d42a1e", "#f2c14e", "#0f8f80", "#fbfaf5"];

  var FUNNEL_POLY = [
    [0.06, 0.06], [0.24, 0.02], [0.82, 0.34], [0.99, 0.42],
    [0.99, 0.58], [0.82, 0.66], [0.24, 0.98], [0.06, 0.94],
    [0.01, 0.50]
  ];

  var BASTER_POLY = [
    [0.04, 0.16], [0.32, 0.02], [0.58, 0.22], [0.98, 0.68],
    [0.90, 0.94], [0.44, 0.58], [0.16, 0.68], [0.02, 0.44]
  ];

  function drawPaperBead(ctx, S, x, y, r, color, opts) {
    var cfg = opts || {};
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var a = (i / 10) * TAU;
      var jr = r * (0.94 + S.hash(i * 5.3 + (cfg.seed || 1)) * 0.12);
      pts.push([x + Math.cos(a) * jr, y + Math.sin(a) * jr]);
    }
    S.drawCutoutPaperEdge(ctx, pts, color, "#14110d", { paperRim: cfg.rim != null ? cfg.rim : 3.0 });
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, TAU);
    ctx.fill();
  }

  function renderPorthole45(ctx, W, H, rawT, state) {
    var S = root.SCION_STAGE;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var lt = beat.localT;
    var plates = S.getPortalPlates(45);

    S.beginCamera(ctx, W, H, t, { state: state, pushDur: 0.65 });

    // 1. Dark Chant-du-Styrène Reverse-Manufacture Slate
    S.drawBolasBackdrop(ctx, W, H, "duchamp-optic", 45, t, state);

    var pxFar = S.parallaxX(0.22, t, state);
    var pxMid = S.parallaxX(0.52, t, state);
    var pyMid = S.parallaxY(0.42, t, state);

    // 2. Plane 1 (Far): Timed Yellow Metered Columns & Mirrored Operators scissored from atlas-36.webp (740×416)
    S.drawScissorCutout(
      ctx,
      plates.atlasImg,
      4, 6, 172, 404,
      34 + pxFar * 0.6, 54, 175, 510,
      null,
      { haloWidth: 3.5, alpha: 0.80 }
    );
    S.drawScissorCutout(
      ctx,
      plates.atlasImg,
      554, 6, 182, 404,
      1070 + pxFar * 0.6, 54, 175, 510,
      null,
      { haloWidth: 3.5, alpha: 0.80 }
    );
    S.drawScissorCutout(
      ctx,
      plates.atlasImg,
      182, 112, 360, 290,
      395 + pxFar, 155 + pyMid * 0.3, 490, 360,
      [[0.04, 0.08], [0.48, 0.02], [0.96, 0.08], [0.94, 0.96], [0.06, 0.96]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.34 }
    );

    // Torn-paper dark riverbed strip along bottom
    var bedY = 532 + (state && state.ballast ? 8 : 0);
    S.drawTornPaperFlat(ctx, 180, bedY, 920, 86, {
      fill: "#27413f",
      paperColor: "#fbfaf5",
      deckle: 6,
      seed: 45.7
    });

    // Suspended Coral Funnel rig parameters
    var funX = 455 + pxMid * 0.5;
    var funY = 205 + Math.sin(t * 3.0) * 6 + pyMid * 0.5;
    var funW = 285;
    var funH = 235;
    var funRot = beat.index === 2 ? 0.32 : 0; // Tilts down to vacuum gravel in Beat C!

    // Twin taut suspension wires from top frame with brass split-pin shackles
    ctx.strokeStyle = "#fbfaf5";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(funX + 46, -10); ctx.lineTo(funX + 46, funY + 18);
    ctx.moveTo(funX + 218, -10); ctx.lineTo(funX + 218, funY + 76);
    ctx.stroke();

    S.drawLampBeam(ctx, W, H, t, state, { x: W * 0.5, y: 590, aimX: funX + 160, alpha: 0.14 });

    // 3. 4-Variation Chant du Styrène / Mouris Montage Stage
    if (beat.index === 0) {
      // === VARIATION I (0–4.0s): "A plastic funnel full of beads" ===
      // Articulated Red-Bulb Turkey Baster scissored from p45.jpg (128,205,155,118) squeezing rhythmically!
      var squeeze = 1 - Math.abs(Math.sin(t * 4.5)) * 0.14;
      ctx.save();
      ctx.translate(funX - 95, funY + 58);
      ctx.scale(1, squeeze);
      S.drawScissorCutout(
        ctx,
        plates.portholeImg,
        128, 205, 155, 118,
        -120, -82, 248, 178,
        BASTER_POLY,
        { haloWidth: 4.5 }
      );
      ctx.restore();

      // Scissor-cut Coral Plastic Funnel from p45.jpg (240,225,178,155)
      S.drawScissorCutout(
        ctx,
        plates.portholeImg,
        240, 225, 178, 155,
        funX, funY, funW, funH,
        FUNNEL_POLY,
        { haloWidth: 5.0, pins: [{ x: funX + 46, y: funY + 18, r: 4.6, metal: "brass" }, { x: funX + 218, y: funY + 76, r: 4.6, metal: "brass" }] }
      );

      // 14 Colorful Cut-Paper Beads popping in metered Chant-du-Styrène S-curve out the brass nozzle!
      var nozX = funX + funW - 4;
      var nozY = funY + funH * 0.50;
      for (var b = 0; b < 14; b++) {
        var bu = ((t * 0.42 + b / 14) % 1);
        var bx = nozX + bu * 290;
        var by = nozY - Math.sin(bu * Math.PI * 1.65) * 125 - bu * 45 + (b % 2 === 0 ? -12 : 12);
        drawPaperBead(ctx, S, bx, by, 15 + (b % 3) * 2.5, BEAD_PALETTE[b % 4], { seed: b });
      }

      // Trout cutout from p45.jpg watching below (310,382,202,88)
      S.drawScissorCutout(
        ctx,
        plates.portholeImg,
        310, 382, 202, 88,
        655 + pxMid * 0.7, 428 + Math.sin(t * 3.0) * 5, 290, 122,
        null,
        { haloWidth: 4.2 }
      );
    } else if (beat.index === 1) {
      // === VARIATION II (4.0–8.0s): "A machine that melts turkey basters" (+ Turkey & Snail Mail Out) ===
      // Queue of 3 red-bulb baster cutouts conveyor-feeding into the glowing heated funnel!
      for (var q = 0; q < 3; q++) {
        var qu = ((lt * 0.55 + q / 3) % 1);
        var qx = lerp(215, funX + 42, qu);
        var qy = lerp(210 + q * 18, funY + 108, qu);
        var qSc = lerp(0.86, 0.42, qu);
        ctx.save();
        ctx.translate(qx, qy);
        ctx.scale(qSc, qSc * (1 - qu * 0.35)); // Softens/melts as it enters funnel!
        S.drawScissorCutout(ctx, plates.portholeImg, 128, 205, 155, 118, -110, -68, 220, 156, BASTER_POLY, { haloWidth: 4.0 });
        ctx.restore();
      }

      // IK Mechanical Pinch-Arm pushing basters into funnel
      var ikM = S.solveIK2(280, 110, 115, 105, 355 + Math.sin(t * 5.5) * 38, 255, 1);
      S.drawCardboardPuppetPiece(ctx, buildLimbPoly(280, 110, ikM.jx, ikM.jy, 10, 8), { tone: "#8e8d89", pin: { x: 280, y: 110, r: 4.8, metal: "silver" } });
      S.drawCardboardPuppetPiece(ctx, buildLimbPoly(ikM.jx, ikM.jy, ikM.ex, ikM.ey, 8, 7), { tone: "#b88a44", pin: { x: ikM.jx, y: ikM.jy, r: 4.5, metal: "brass" } });

      // Funnel with glowing amber-red melting heater coils wrapped around cone!
      S.drawScissorCutout(ctx, plates.portholeImg, 240, 225, 178, 155, funX, funY, funW, funH, FUNNEL_POLY, {
        haloWidth: 5.0,
        tint: "rgba(212, 42, 30, 0.18)"
      });
      ctx.strokeStyle = "#f7dd4a";
      ctx.lineWidth = 4.5;
      for (var hc = 0; hc < 3; hc++) {
        var hx = funX + 95 + hc * 44;
        var hh = 76 - hc * 18;
        ctx.beginPath();
        ctx.moveTo(hx, funY + 118 - hh);
        ctx.lineTo(hx + 14, funY + 118 + hh);
        ctx.stroke();
      }

      // Melted teardrop styrene droplets dripping & hardening into red/amber beads at right!
      var mNozX = funX + funW;
      var mNozY = funY + funH * 0.50;
      for (var md = 0; md < 9; md++) {
        var mu = ((t * 0.65 + md / 9) % 1);
        var mx = mNozX + mu * 265;
        var my = mNozY + Math.pow(mu, 1.5) * 145;
        drawPaperBead(ctx, S, mx, my, 15, md % 2 === 0 ? "#d42a1e" : "#f2c14e", { seed: md + 20 });
      }

      S.drawTurkeyCutawayBadge(ctx, 136, 468, 1.06, t, { dispatch: clamp(lt / 1.4, 0, 1) });
      S.drawMailSnail(ctx, lerp(248, 980, clamp(lt / 3.85, 0, 1)), bedY - 8, 1.22, t, { hasReply: false });
    } else if (beat.index === 2) {
      // === VARIATION III (8.0–12.0s): "A giant creek gravel vacuum" (+ Trout & Snail Mail Reply) ===
      var vNozX = funX + funW - 14;
      var vNozY = funY + funH * 0.66;

      // Dashed suction vortex lines pulling pebbles UP from the riverbed into the tilted nozzle!
      ctx.save();
      ctx.strokeStyle = "rgba(251, 250, 245, 0.55)";
      ctx.lineWidth = 2.4;
      ctx.setLineDash([12, 8]);
      ctx.lineDashOffset = t * 65;
      for (var vl = -2; vl <= 2; vl++) {
        ctx.beginPath();
        ctx.moveTo(vNozX, vNozY);
        ctx.quadraticCurveTo(vNozX + 95, vNozY + 60, 860 + vl * 48, bedY + 18);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();

      // Rough cardboard creek gravel pebbles sucked upward into nozzle & shooting out left mouth!
      for (var gv = 0; gv < 14; gv++) {
        var gu = ((t * 0.58 + gv / 14) % 1);
        var gx, gy;
        if (gu < 0.6) {
          var u1 = gu / 0.6;
          gx = lerp(890 + (gv % 4 - 1.5) * 42, vNozX, u1);
          gy = lerp(bedY + 12, vNozY, u1 * u1);
        } else {
          var u2 = (gu - 0.6) / 0.4;
          gx = lerp(funX + 20, 210, u2);
          gy = lerp(funY + 95, 220 + (gv % 3 - 1) * 38, u2);
        }
        S.drawCardboardPuppetPiece(
          ctx,
          [[gx - 13, gy - 9], [gx + 4, gy - 14], [gx + 15, gy - 3], [gx + 10, gy + 12], [gx - 11, gy + 11]],
          { tone: gv % 2 === 0 ? "#8e8b82" : "#b8a88a", ribs: 1 }
        );
      }

      // Tilted Coral Funnel acting as giant suction horn
      S.drawScissorCutout(ctx, plates.portholeImg, 240, 225, 178, 155, funX, funY, funW, funH, FUNNEL_POLY, {
        haloWidth: 5.0,
        rot: funRot
      });

      // Brook Trout bracing fins against the gravel suction current + Mail Snail climbing right!
      S.drawBrookTrout(ctx, 560, 476 + Math.sin(t * 4.8) * 6, 1.20, t, false);
      S.drawMailSnail(ctx, 1168, lerp(520, 210, clamp(lt / 3.8, 0, 1)), 1.18, t, { rot: -Math.PI * 0.5, hasReply: true });
    } else {
      // === VARIATION IV (12.0–16.0s): "An alien atom-pellet replicator" (+ Alien Listening Post) ===
      S.drawAlienSaucer(ctx, 585, 86, 1.16, t, funX + 60, funY + 115);

      S.drawScissorCutout(ctx, plates.portholeImg, 240, 225, 178, 155, funX - 80, funY + 10, funW, funH, FUNNEL_POLY, {
        haloWidth: 5.0,
        pins: [{ x: funX - 34, y: funY + 28, r: 4.6, metal: "silver" }, { x: funX + 138, y: funY + 86, r: 4.6, metal: "silver" }]
      });

      // S43 Collage Graph Rewriting: 1 -> 2 -> 4 -> 8 Atom-Pellet Molecular Lattice with Orbital Rings!
      var atomCx = 875;
      var atomCy = 328;
      ctx.save();
      ctx.translate(atomCx, atomCy);

      // 3 Elliptical Electron Orbits
      for (var eo = 0; eo < 3; eo++) {
        ctx.save();
        ctx.rotate((eo / 3) * Math.PI + t * 0.7);
        ctx.strokeStyle = eo % 2 === 0 ? "rgba(15, 143, 128, 0.82)" : "rgba(212, 42, 30, 0.82)";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, 155, 54, 0, 0, TAU);
        ctx.stroke();

        var ea = t * 3.4 + eo * 2.1;
        drawPaperBead(ctx, S, Math.cos(ea) * 155, Math.sin(ea) * 54, 13, BEAD_PALETTE[eo], { seed: eo + 40, rim: 2.4 });
        drawPaperBead(ctx, S, -Math.cos(ea) * 155, -Math.sin(ea) * 54, 13, BEAD_PALETTE[(eo + 2) % 4], { seed: eo + 50, rim: 2.4 });
        ctx.restore();
      }

      // Splitting/Replicating Central Nucleus Cluster + Bond Struts!
      var splitSpread = 28 + Math.sin(t * 4.0) * 8;
      var nucNodes = [[0, -splitSpread], [splitSpread, 0], [0, splitSpread], [-splitSpread, 0]];
      ctx.strokeStyle = "#fbfaf7";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      for (var ni = 0; ni < 4; ni++) {
        ctx.moveTo(0, 0);
        ctx.lineTo(nucNodes[ni][0], nucNodes[ni][1]);
      }
      ctx.stroke();
      for (var nj = 0; nj < 4; nj++) {
        drawPaperBead(ctx, S, nucNodes[nj][0], nucNodes[nj][1], 16, BEAD_PALETTE[nj], { seed: nj + 70 });
      }
      S.drawSplitPin(ctx, 0, 0, 5.5, { metal: "brass" });
      ctx.restore();

      // Stream of replicated pellets entering from nozzle into lattice
      for (var rp = 0; rp < 4; rp++) {
        var rpu = ((t * 0.9 + rp * 0.25) % 1);
        drawPaperBead(ctx, S, lerp(funX + funW - 84, atomCx - 90, rpu), lerp(funY + 126, atomCy, rpu), 12, BEAD_PALETTE[rp], { rim: 2.2 });
      }

      S.drawMailSnail(ctx, 235, bedY - 8, 1.08, t, { hasReply: true, hasAlienStamp: true });
    }

    drawBallastBubbles(ctx, S, W, H, t, state, 12);
    drawInteractiveSnailOverride(ctx, S, W, t, state, beat.index, bedY - 8);
    applyLampDim(ctx, W, H, state);
    S.drawCutShutter(ctx, W, H, t, state);
    S.endCamera(ctx);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 45);
  }

  /* ==========================================================================
   * Export PORTAL_REMAKE_SCENES[41..45]
   * ========================================================================== */
  var PORTAL_REMAKE_SCENES = (root && root.PORTAL_REMAKE_SCENES) || {};

  var DEFINITIONS = [
    { id: 41, station: "#41 · Catwalk", bolasStyle: "daumier-litho", render: renderPorthole41 },
    { id: 42, station: "#42 · Ferry", bolasStyle: "queneau-rostrum", render: renderPorthole42 },
    { id: 43, station: "#43 · Snout", bolasStyle: "queneau-rostrum", render: renderPorthole43 },
    { id: 44, station: "#44 · Rotor", bolasStyle: "duchamp-optic", render: renderPorthole44 },
    { id: 45, station: "#45 · Extruder", bolasStyle: "duchamp-optic", render: renderPorthole45 }
  ];

  for (var i = 0; i < DEFINITIONS.length; i++) {
    (function (def) {
      PORTAL_REMAKE_SCENES[def.id] = {
        id: def.id,
        station: def.station,
        duration: 16.0,
        bolasStyle: def.bolasStyle,
        preload: function () {
          return root.SCION_STAGE.preloadPortalPlates(def.id);
        },
        render: def.render
      };
    })(DEFINITIONS[i]);
  }

  if (root) {
    root.PORTAL_REMAKE_SCENES = PORTAL_REMAKE_SCENES;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = PORTAL_REMAKE_SCENES;
  }
})(typeof window !== "undefined" ? window : globalThis);
