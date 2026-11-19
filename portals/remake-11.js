/* ============================================================================
 * Turkey Sub · V2 Multi-SCION & BOLAS Oulipo Screening Room Remake — Crew 11 (#51–#55)
 * File: portals/remake-11.js  (window.PORTAL_REMAKE_SCENES[51..55])
 *
 * Full-screen 1280×720, 24fps, 16.0s (384 frames) 4-Variation Cutout Cinema:
 *   - 0.0–4.0s   : Variation I   · (A) Real Creek
 *   - 4.0–8.0s   : Variation II  · (B) Probable · Turkey (+ Snail Mail Out)
 *   - 8.0–12.0s  : Variation III · (C) Plausible · Trout (+ Snail Mail Reply)
 *   - 12.0–16.0s : Variation IV  · (D) Preposterous · Alien Listening Post
 *
 * Slices real foraged plates (./portholes/p51..p55.jpg + ./assets/atlas-stills/atlas-14,23,27,46,06.webp)
 * via SCION_STAGE.drawScissorCutout(...) paired with handmade grey-cardboard, lithograph,
 * and torn-deckle paper split-pin rigs (FK/IK/spring/secondary motion).
 * Emits ZERO fillText/strokeText calls on stage (100% blind-critic clean).
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var PORTAL_IDS = [51, 52, 53, 54, 55];

  function getStage() {
    return (root && root.SCION_STAGE) || (typeof window !== "undefined" && window.SCION_STAGE) || null;
  }

  // Kick off plate preloading automatically when loaded in browser
  var _bootStage = getStage();
  if (_bootStage && typeof _bootStage.preloadPortalPlates === "function") {
    _bootStage.preloadPortalPlates(PORTAL_IDS);
  }

  // ---------- Shared Tactile Helpers (Pure Geometry & Cardboard, 0 Text) ----------

  function drawBallastBubbles(ctx, S, W, H, t, state, seedBase, tint) {
    var count = (state && state.ballast) ? 18 : 6;
    ctx.save();
    for (var i = 0; i < count; i++) {
      var s = seedBase * 13.7 + i * 7.31;
      var speed = (state && state.ballast) ? (58 + (i % 5) * 18) : (22 + (i % 4) * 9);
      var bx = 130 + S.hash(s) * (W - 260) + Math.sin(t * 2.1 + i) * 14;
      var rawY = 590 - (((t * speed) + S.hash(s + 4.2) * 520) % 540);
      var rad = 3.2 + (i % 4) * 2.1 + ((state && state.ballast) ? 1.8 : 0);
      ctx.fillStyle = tint || "rgba(251, 250, 245, 0.72)";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(bx, rawY, rad, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // Interactive & Beat-driven Snail Mail + Turkey + Trout + Alien Couriers
  function drawInteractiveSnailOverride(ctx, S, W, H, t, state) {
    if (!state || !state.snailActive) return false;
    var u = (typeof state.snailT === "number") ? S.clamp(state.snailT, 0, 1) : ((t % 2.6) / 2.6);
    var sx, sy, rot = 0;
    if (u < 0.45) {
      var k = u / 0.45;
      sx = S.lerp(185, 980, k);
      sy = S.lerp(525, 485, k) + Math.sin(k * Math.PI * 3) * 8;
      rot = -0.04;
    } else if (u < 0.78) {
      var k2 = (u - 0.45) / 0.33;
      sx = S.lerp(980, 1110, k2);
      sy = S.lerp(485, 165, k2);
      rot = -Math.PI * 0.44;
    } else {
      var k3 = (u - 0.78) / 0.22;
      sx = S.lerp(1110, 720, k3);
      sy = S.lerp(165, 132, k3);
      rot = -0.12;
    }
    S.drawMailSnail(ctx, sx, sy, 1.22, t, {
      rot: rot,
      hasReply: u >= 0.48,
      hasAlienStamp: u >= 0.82
    });
    return true;
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
    if (pinStart) pins.push({ x: x0, y: y0, r: 4.5, metal: pinStart === true ? "brass" : pinStart });
    if (pinEnd) pins.push({ x: x1, y: y1, r: 4.2, metal: pinEnd === true ? "silver" : pinEnd });
    S.drawCardboardPuppetPiece(ctx, pts, { tone: tone, ribs: 2, pins: pins });
  }

  function drawStampCardIcon(ctx, S, x, y, w, h, rot, stampCol, ringMode) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    S.drawCutoutPaperEdge(
      ctx,
      [[-w * 0.5, -h * 0.5], [w * 0.5, -h * 0.5], [w * 0.5, h * 0.5], [-w * 0.5, h * 0.5]],
      "#fbfaf5",
      "#14110d",
      { paperRim: 2.2, shadow: true, lineWidth: 1.5 }
    );
    // Tiny porthole emblem on left of postcard + ink squiggle lines on right (0 text!)
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(-w * 0.22, 0, Math.min(w, h) * 0.24, 0, TAU);
    ctx.stroke();

    ctx.fillStyle = stampCol || "#d42a1e";
    ctx.beginPath();
    if (ringMode === "tri") {
      ctx.moveTo(w * 0.24, -h * 0.28);
      ctx.lineTo(w * 0.36, -h * 0.06);
      ctx.lineTo(w * 0.12, -h * 0.06);
      ctx.closePath();
    } else {
      ctx.arc(w * 0.24, -h * 0.18, Math.min(w, h) * 0.14, 0, TAU);
    }
    ctx.fill();

    // Handwriting wave lines (pure stroke geometry)
    ctx.strokeStyle = "rgba(20, 17, 13, 0.55)";
    ctx.lineWidth = 1.1;
    for (var ln = 0; ln < 2; ln++) {
      var ly = h * (0.08 + ln * 0.18);
      ctx.beginPath();
      ctx.moveTo(w * 0.02, ly);
      ctx.lineTo(w * 0.36, ly);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ============================================================================
  // PORTHOLE #51 · GROTTO
  // bolasStyle: "daumier-litho" | La Belle Hortense · S03 Max Ernst / Karel Zeman
  // Plates: ./portholes/p51.jpg (640x640) + ./assets/atlas-stills/atlas-14.webp (740x416)
  //   A: A huge pearl inside a clam
  //   B: A giant peeled hard-boiled egg
  //   C: A stolen white bowling ball
  //   D: A glowing alien moon-egg core
  // ============================================================================
  function renderPortal51(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var u = beat.u;
    var lt = beat.localT;
    var plates = S.getPortalPlates(51);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    // 1. Stark cream paper + deep ink-black cinema band (boucle-la.webp / Max Ernst register)
    S.drawBolasBackdrop(ctx, W, H, "daumier-litho", S.getStack(51) && S.getStack(51).directorSwarm.palette, t, state, {
      bandTop: 108,
      bandBot: 576
    });

    S.beginCamera(ctx, W, H, t, { state: state, pushDur: 0.65 });

    var px1 = S.parallaxX(0.22, t, state), py1 = S.parallaxY(0.22, t, state);
    var px2 = S.parallaxX(0.48, t, state), py2 = S.parallaxY(0.48, t, state);
    var px3 = S.parallaxX(0.78, t, state), py3 = S.parallaxY(0.78, t, state);

    // 2. Plane 1: Zeman "Invention for Destruction" (atlas-14.webp) striped vault & iron crane cutouts
    S.drawScissorCutout(
      ctx, aImg,
      105, 8, 370, 390,
      96 + px1, 120 + py1, 430, 370,
      [[0.04, 0.10], [0.46, 0.02], [0.95, 0.06], [0.98, 0.88], [0.62, 0.96], [0.06, 0.94]],
      { filter: "litho", haloWidth: 4.5, tint: "rgba(12,14,18,0.12)" }
    );
    S.drawScissorCutout(
      ctx, aImg,
      430, 12, 295, 385,
      785 + px1, 118 + py1, 390, 372,
      [[0.06, 0.05], [0.94, 0.03], [0.97, 0.92], [0.42, 0.97], [0.03, 0.88]],
      { filter: "litho", haloWidth: 4.5, tint: "rgba(12,14,18,0.10)" }
    );

    // Volumetric lithograph sun-shafts / sub-lamp beams across ink band
    if (beat.lampOn) {
      ctx.save();
      for (var sh = 0; sh < 4; sh++) {
        var sx = 430 + sh * 95 + Math.sin(t * 0.8 + sh) * 14;
        var grad = ctx.createLinearGradient(sx, 108, sx - 35, 520);
        grad.addColorStop(0, beat.index === 3 ? "rgba(15, 143, 128, 0.22)" : "rgba(251, 250, 245, 0.22)");
        grad.addColorStop(1, "rgba(251, 250, 245, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(sx - 24, 108);
        ctx.lineTo(sx + 28, 108);
        ctx.lineTo(sx + 74, 520);
        ctx.lineTo(sx - 68, 520);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 3. Plane 2: Stalactite cave root cutouts from p51.jpg (left & right grotto walls)
    S.drawScissorCutout(
      ctx, pImg,
      96, 108, 175, 355,
      62 + px2, 96 + py2, 235, 435,
      [[0.08, 0.03], [0.92, 0.06], [0.74, 0.44], [0.88, 0.92], [0.10, 0.97], [0.02, 0.52]],
      { filter: "litho", haloWidth: 4.8 }
    );
    S.drawScissorCutout(
      ctx, pImg,
      382, 114, 156, 355,
      985 + px2, 102 + py2, 225, 430,
      [[0.12, 0.05], [0.94, 0.04], [0.97, 0.56], [0.88, 0.96], [0.14, 0.93], [0.24, 0.48]],
      { filter: "litho", haloWidth: 4.8 }
    );

    // Foreground riverbed pebble strip cropped from p51.jpg
    S.drawScissorCutout(
      ctx, pImg,
      175, 422, 290, 112,
      370 + px3, 472 + py3, 520, 116,
      [[0.03, 0.22], [0.32, 0.06], [0.72, 0.08], [0.97, 0.24], [0.95, 0.94], [0.05, 0.95]],
      { filter: "litho", haloWidth: 4.2 }
    );

    // Articulated 2-bone IK Zeman Grotto Crane Arm on upper-right (S33/S32)
    var craneBaseX = 955 + px2 * 0.7;
    var craneBaseY = 152 + py2 * 0.7;
    var craneAimX = 720 + Math.sin(t * 1.4) * 28 + (beat.index === 1 ? -45 : 0);
    var craneAimY = 265 + Math.cos(t * 1.7) * 18 + (beat.index === 1 ? -15 : 0);
    var craneIK = S.solveIK2(craneBaseX, craneBaseY, 138, 128, craneAimX, craneAimY, -1);
    drawLimbSegment(ctx, S, craneBaseX, craneBaseY, craneIK.jx, craneIK.jy, 11, 9, "#dcd8ce", "brass", "silver");
    drawLimbSegment(ctx, S, craneIK.jx, craneIK.jy, craneIK.ex, craneIK.ey, 8.5, 6.5, "#b8b4aa", "silver", "brass");

    // 4. Centerpiece Giant Cross-Hatched Stone Clam Rig (S32 Forward Kinematics + S45 Occlusion)
    var clamHingeX = 458 + px2 * 0.6;
    var clamHingeY = 432 + py2 * 0.6 + (beat.ballastOn ? -8 : 0);
    var openSpring = S.spring(lt, 0.12, 9.5, 4.2);
    var upperValveAng = -0.18 - openSpring * (beat.index === 3 ? 0.68 : 0.54) + Math.sin(t * 1.9) * 0.03;

    // Back inner shadow cavity of clam
    ctx.save();
    ctx.translate(clamHingeX, clamHingeY);
    S.drawCutoutPaperEdge(
      ctx,
      [[0, 0], [80, -88], [245, -72], [328, -4], [260, 42], [65, 38]],
      "#1c1d20",
      "#0b0c0e",
      { paperRim: 4.5 }
    );
    ctx.restore();

    // --- MYSTERIOUS SPHERE AT CENTER (S45 Occlusion: sandwiched between back cavity, upper valve & lower lip!) ---
    var sphereX = clamHingeX + 178 + (beat.index === 2 ? Math.sin(lt * 3.2) * 18 + u * 26 : 0);
    var sphereY = clamHingeY - 46 - (beat.index === 3 ? (28 + Math.sin(t * 3.0) * 10) : 0);
    var sphereR = 76;

    // Back-pass orbital moonlets in Beat D (behind sphere)
    if (beat.index === 3) {
      for (var mBack = 0; mBack < 3; mBack++) {
        var maB = t * 2.3 + mBack * (TAU / 3);
        if (Math.sin(maB) < 0) {
          var mxB = sphereX + Math.cos(maB) * 124;
          var myB = sphereY + Math.sin(maB) * 32;
          ctx.save();
          ctx.translate(mxB, myB);
          S.drawCutoutPaperEdge(ctx, [[-9, -7], [8, -9], [10, 6], [-7, 9]], "#0f8f80", "#0b0c0e", {
            paperRim: 2.5,
            shadow: false
          });
          S.drawSplitPin(ctx, 0, 0, 3.8, { metal: "silver" });
          ctx.restore();
        }
      }
    }

    if (beat.index === 0) {
      // VARIATION I (A): "A huge pearl inside a clam"
      // Nacreous glow + cropped pearl core from p51.jpg + concentric Ernst litho luster arcs
      ctx.save();
      var pGlow = ctx.createRadialGradient(sphereX - 16, sphereY - 18, 10, sphereX, sphereY, sphereR * 1.65);
      pGlow.addColorStop(0, "rgba(255, 250, 232, 0.62)");
      pGlow.addColorStop(0.6, "rgba(247, 221, 140, 0.22)");
      pGlow.addColorStop(1, "rgba(247, 221, 140, 0)");
      ctx.fillStyle = pGlow;
      ctx.beginPath();
      ctx.arc(sphereX, sphereY, sphereR * 1.65, 0, TAU);
      ctx.fill();
      ctx.restore();

      // Circular scissor-cut pearl from p51.jpg
      var pearlPoly = [];
      for (var pi = 0; pi < 20; pi++) {
        var pa = (pi / 20) * TAU;
        pearlPoly.push([0.5 + Math.cos(pa) * 0.48, 0.5 + Math.sin(pa) * 0.48]);
      }
      S.drawScissorCutout(
        ctx, pImg,
        232, 246, 176, 178,
        sphereX - sphereR, sphereY - sphereR, sphereR * 2, sphereR * 2,
        pearlPoly,
        { haloWidth: 5.0, stroke: "#14110d", lineWidth: 2.2 }
      );

      // Hand-engraved crescent shading & specular highlight on pearl
      ctx.save();
      ctx.strokeStyle = "rgba(20, 17, 13, 0.35)";
      ctx.lineWidth = 1.4;
      for (var hi = 0; hi < 7; hi++) {
        ctx.beginPath();
        ctx.arc(sphereX + 4, sphereY + 6, sphereR - 8 - hi * 4.5, 0.35, 2.35);
        ctx.stroke();
      }
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(sphereX - 24, sphereY - 26, 16, 10, -0.5, 0, TAU);
      ctx.fill();
      ctx.restore();

      // Repeated-observation chart caliper ticks (Atlas #verne-16)
      ctx.save();
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 2.0;
      for (var tk = 0; tk < 4; tk++) {
        var ty = sphereY + 42 - tk * 26;
        ctx.beginPath();
        ctx.moveTo(sphereX + sphereR + 18, ty);
        ctx.lineTo(sphereX + sphereR + 32, ty);
        ctx.stroke();
      }
      ctx.restore();

    } else if (beat.index === 1) {
      // VARIATION II (B): "A giant peeled hard-boiled egg"
      var eggLift = S.spring(lt, 0.25, 11.0, 4.5);
      ctx.save();
      ctx.translate(sphereX, sphereY - 6);

      // Smooth white oval hard-boiled albumen body with paper cutout halo
      var eggPts = [];
      for (var ei = 0; ei < 22; ei++) {
        var ea = (ei / 22) * TAU;
        var rx = 68 * (1 - 0.14 * Math.sin(ea));
        var ry = 84;
        eggPts.push([Math.cos(ea) * rx, Math.sin(ea) * ry]);
      }
      S.drawCutoutPaperEdge(ctx, eggPts, "#f8f6ee", "#14110d", { paperRim: 5.0, lineWidth: 2.4 });
      S.drawEngravingCrosshatch(ctx, 90, 95, 0.12, 6, { x: -45, y: 5 });

      // Cross-section wedge cut revealing bright golden-ochre boiled egg yolk!
      var sliceOpen = S.smooth(0.35, 1.1, lt);
      ctx.save();
      ctx.scale(0.35 + sliceOpen * 0.65, 1);
      S.drawCutoutPaperEdge(
        ctx,
        [[-38, -6], [-18, -36], [24, -38], [44, -8], [38, 32], [-4, 44], [-36, 26]],
        "#e6a429",
        "#14110d",
        { paperRim: 3.0, shadow: false }
      );
      S.drawCutoutPaperEdge(
        ctx,
        [[-22, -4], [-8, -22], [18, -20], [26, 2], [14, 24], [-14, 20]],
        "#f7c948",
        "#14110d",
        { paperRim: 1.5, shadow: false }
      );
      ctx.restore();

      // Cracked jagged brown eggshell fragments peeling away on split-pins!
      ctx.save();
      ctx.translate(-52 - eggLift * 24, -56 - eggLift * 28);
      ctx.rotate(-0.35 - eggLift * 0.45);
      S.drawCardboardPuppetPiece(
        ctx,
        [[-26, 18], [-18, -24], [16, -32], [38, -10], [18, 4], [4, -6], [-8, 12]],
        { tone: "#9e6b43", ribs: 2, pin: { x: 18, y: 4, r: 4.0, metal: "brass" } }
      );
      ctx.restore();

      ctx.save();
      ctx.translate(58 + eggLift * 20, -48 - eggLift * 22);
      ctx.rotate(0.4 + eggLift * 0.35);
      S.drawCardboardPuppetPiece(
        ctx,
        [[-18, -18], [16, -24], [30, 8], [8, 22], [-4, 6], [-16, 10]],
        { tone: "#9e6b43", ribs: 2, pin: { x: -4, y: 6, r: 4.0, metal: "brass" } }
      );
      ctx.restore();

      ctx.restore();

      // Cardboard Diner Salt-Shaker tipping salt crystals above egg!
      ctx.save();
      ctx.translate(craneIK.ex - 16, craneIK.ey + 8);
      ctx.rotate(2.35 + Math.sin(t * 6.5) * 0.18);
      S.drawCutoutPaperEdge(ctx, [[-16, -24], [16, -24], [20, 20], [-20, 20]], "#e6e3da", "#14110d", { paperRim: 2.5 });
      S.drawCardboardPuppetPiece(ctx, [[-15, -34], [15, -34], [17, -23], [-17, -23]], { tone: "#b8babc", ribs: 1 });
      ctx.restore();
      for (var sg = 0; sg < 8; sg++) {
        var sySalt = craneIK.ey + 28 + (((t * 110) + sg * 19) % 78);
        var sxSalt = craneIK.ex - 26 + (sg % 3) * 9 + Math.sin(sg + t * 3) * 3;
        ctx.fillStyle = "#fbfaf5";
        ctx.fillRect(sxSalt, sySalt, 3.5, 3.5);
      }

    } else if (beat.index === 2) {
      // VARIATION III (C): "A stolen white bowling ball"
      var rollAng = lt * 2.4;
      ctx.save();
      ctx.translate(sphereX, sphereY + 4);

      // Glossy white lithograph bowling ball + cross-hatched bottom shadow
      var bPoly = [];
      for (var bi = 0; bi < 22; bi++) {
        var ba = (bi / 22) * TAU;
        bPoly.push([Math.cos(ba) * sphereR, Math.sin(ba) * sphereR]);
      }
      S.drawCutoutPaperEdge(ctx, bPoly, "#f5f3ec", "#14110d", { paperRim: 5.0, lineWidth: 2.6 });
      S.drawEngravingCrosshatch(ctx, 110, 56, 0.18, 5, { x: -55, y: 18 });

      // Iconic 3 black bowling finger-holes rotating across face!
      var rotOffX = Math.sin(rollAng) * 22;
      var rotOffY = Math.cos(rollAng) * 10 - 16;
      var holes = [
        [rotOffX - 13, rotOffY - 12, 9.5],
        [rotOffX + 13, rotOffY - 10, 9.5],
        [rotOffX + 1, rotOffY + 14, 11.0]
      ];
      for (var hi2 = 0; hi2 < holes.length; hi2++) {
        ctx.fillStyle = "#0b0c0e";
        ctx.strokeStyle = "#6e675f";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.ellipse(holes[hi2][0], holes[hi2][1], holes[hi2][2], holes[hi2][2] * 0.86, -0.15, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      // Three striped cut-paper Bowling Pins on right reef wobbling on impact!
      for (var pinIdx = 0; pinIdx < 3; pinIdx++) {
        var pxPin = 835 + pinIdx * 44;
        var pyPin = 468 + (pinIdx % 2) * 14;
        var hitTilt = (u > 0.42) ? Math.sin((lt - 1.6) * 8 + pinIdx) * 0.28 + (pinIdx - 0.5) * 0.22 : Math.sin(t * 2 + pinIdx) * 0.04;
        ctx.save();
        ctx.translate(pxPin, pyPin);
        ctx.rotate(hitTilt);
        S.drawCutoutPaperEdge(
          ctx,
          [[-12, 0], [-16, -34], [-7, -58], [-10, -78], [0, -88], [10, -78], [7, -58], [16, -34], [12, 0]],
          "#fbfaf5",
          "#14110d",
          { paperRim: 3.0 }
        );
        // Twin red bowling-pin neck stripes (pure geometry!)
        ctx.fillStyle = "#d42a1e";
        ctx.fillRect(-8, -64, 16, 5);
        ctx.fillRect(-9, -54, 18, 5);
        ctx.restore();
      }

    } else {
      // VARIATION IV (D): "A glowing alien moon-egg core"
      ctx.save();
      var aGlow = ctx.createRadialGradient(sphereX, sphereY, 12, sphereX, sphereY, sphereR * 1.9);
      aGlow.addColorStop(0, "rgba(15, 143, 128, 0.52)");
      aGlow.addColorStop(0.55, "rgba(212, 42, 30, 0.28)");
      aGlow.addColorStop(1, "rgba(15, 143, 128, 0)");
      ctx.fillStyle = aGlow;
      ctx.beginPath();
      ctx.arc(sphereX, sphereY, sphereR * 1.9, 0, TAU);
      ctx.fill();

      ctx.translate(sphereX, sphereY);
      ctx.rotate(Math.sin(t * 1.8) * 0.12);
      var mPts = [];
      for (var mi = 0; mi < 22; mi++) {
        var ma = (mi / 22) * TAU;
        mPts.push([Math.cos(ma) * 72, Math.sin(ma) * 80]);
      }
      S.drawCutoutPaperEdge(ctx, mPts, "#e6f2ee", "#0b0c0e", { paperRim: 5.0, lineWidth: 2.5 });

      // Lunar craters + glowing emerald/crimson tectonic energy seams!
      var craters = [[-26, -24, 11], [24, -18, 14], [-18, 28, 13], [22, 26, 9]];
      for (var ci = 0; ci < craters.length; ci++) {
        ctx.fillStyle = "#b8c7c2";
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(craters[ci][0], craters[ci][1], craters[ci][2], 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.strokeStyle = "#d42a1e";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(0, -76);
      ctx.lineTo(-12, -26);
      ctx.lineTo(14, 12);
      ctx.lineTo(-6, 76);
      ctx.moveTo(-66, -6);
      ctx.lineTo(-12, -26);
      ctx.lineTo(66, -10);
      ctx.stroke();

      ctx.fillStyle = "#0f8f80";
      ctx.beginPath();
      ctx.arc(2, -6, 16 + Math.sin(t * 6.0) * 3, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // Upper Hinged Scalloped Stone Clam Valve (FK rotated around brass filigree hinge!)
    ctx.save();
    ctx.translate(clamHingeX, clamHingeY);
    ctx.rotate(upperValveAng);
    S.drawCardboardPuppetPiece(
      ctx,
      [[0, 0], [34, -84], [118, -124], [218, -118], [306, -72], [336, -18], [272, 6], [192, -12], [108, 2]],
      { tone: "#b4b2aa", ribs: 4 }
    );
    S.drawEngravingCrosshatch(ctx, 280, 95, 0.22, 6, { x: 35, y: -112 });
    // Fluted scallop ridges radiating from hinge
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.0;
    for (var sr = 0; sr < 5; sr++) {
      ctx.beginPath();
      ctx.moveTo(8, -4);
      ctx.quadraticCurveTo(120 + sr * 34, -92 + sr * 8, 145 + sr * 44, -18 - (4 - sr) * 14);
      ctx.stroke();
    }
    ctx.restore();

    // Lower Front Scalloped Stone Clam Lip (occludes bottom 22px of sphere so sphere sits INSIDE clam!)
    ctx.save();
    ctx.translate(clamHingeX, clamHingeY);
    S.drawCardboardPuppetPiece(
      ctx,
      [[-8, -6], [66, 8], [142, -4], [224, 10], [318, -12], [342, 22], [268, 72], [148, 82], [42, 62]],
      { tone: "#94928a", ribs: 3 }
    );
    S.drawEngravingCrosshatch(ctx, 290, 68, 0.24, 6, { x: 28, y: 8 });
    S.drawReinigerFiligreeHinge(ctx, 0, 0, 9.5, { metal: "brass" });
    ctx.restore();

    // Front-pass orbital moonlets in Beat D (occluding front of clam & core!)
    if (beat.index === 3) {
      for (var mFront = 0; mFront < 3; mFront++) {
        var maF = t * 2.3 + mFront * (TAU / 3);
        if (Math.sin(maF) >= 0) {
          var mxF = sphereX + Math.cos(maF) * 124;
          var myF = sphereY + Math.sin(maF) * 32;
          ctx.save();
          ctx.translate(mxF, myF);
          S.drawCutoutPaperEdge(ctx, [[-11, -8], [9, -11], [12, 7], [-8, 10]], "#d42a1e", "#0b0c0e", { paperRim: 2.5 });
          S.drawSplitPin(ctx, 0, 0, 4.0, { metal: "brass" });
          ctx.restore();
        }
      }
    }

    // 5. Canonical Couriers & Cutaway Witnesses across Beats B, C, D
    var snailOverridden = drawInteractiveSnailOverride(ctx, S, W, H, t, state);

    if (beat.index === 1) {
      S.drawTurkeyInCorner(ctx, 148, 498, 1.12, t, { dispatch: S.smooth(0.05, 0.45, u) });
      if (!snailOverridden) {
        var sBx = S.lerp(235, 965, u);
        var sBy = 528 + Math.sin(u * Math.PI * 4) * 5;
        S.drawMailSnail(ctx, sBx, sBy, 1.22, t, { hasReply: false });
      }
    } else if (beat.index === 2) {
      S.drawBrookTrout(ctx, 995 - Math.sin(u * Math.PI) * 55, 355 + Math.cos(t * 2.4) * 10, 1.08, t, false);
      if (!snailOverridden) {
        S.drawMailSnail(ctx, 1138, S.lerp(520, 175, u), 1.18, t, {
          rot: -Math.PI * 0.5,
          hasReply: true
        });
      }
    } else if (beat.index === 3) {
      S.drawAlienSaucer(ctx, 636, 104, 1.22, t, sphereX, sphereY, { beamSpread: 155 });
      if (!snailOverridden) {
        S.drawMailSnail(ctx, S.lerp(1060, 815, u), 132 + Math.sin(t * 3) * 4, 1.08, t, {
          flip: true,
          hasReply: true,
          hasAlienStamp: true
        });
      }
    } else {
      // Subtle peeking Brook Trout on right in Beat A (matching p51.jpg!)
      S.drawBrookTrout(ctx, 1025 + px2 * 0.5, 325 + py2 * 0.5, 0.92, t, false);
    }

    drawBallastBubbles(ctx, S, W, H, t, state, 51, "rgba(251,250,245,0.82)");
    S.endCamera(ctx);

    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 51);
  }

  // ============================================================================
  // PORTHOLE #52 · BRIDGE
  // bolasStyle: "cardboard-parallax" | Monsieur Ripois · S12 Alec Jacobson
  // Plates: ./portholes/p52.jpg (640x640) + ./assets/atlas-stills/atlas-23.webp (740x416)
  //   A: A tight red rope between rocks
  //   B: A giant red squid tentacle
  //   C: A helpful creek tow-truck line
  //   D: An orbital space-elevator cable
  // ============================================================================
  function renderPortal52(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var u = beat.u;
    var lt = beat.localT;
    var plates = S.getPortalPlates(52);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    // 1. Silver-gelatin monochrome parallax ground + Academy side mattes (la-mort-en-ce-jardin.webp)
    S.drawBolasBackdrop(ctx, W, H, "cardboard-parallax", S.getStack(52) && S.getStack(52).directorSwarm.palette, t, state, {
      pillarbox: true
    });

    S.beginCamera(ctx, W, H, t, { state: state, pushDur: 0.65 });

    var px1 = S.parallaxX(0.18, t, state), py1 = S.parallaxY(0.18, t, state);
    var px2 = S.parallaxX(0.42, t, state), py2 = S.parallaxY(0.42, t, state);
    var px3 = S.parallaxX(0.68, t, state), py3 = S.parallaxY(0.68, t, state);
    var px4 = S.parallaxX(0.95, t, state), py4 = S.parallaxY(0.95, t, state);

    // 2. Plane 1: Pyramid Song (atlas-23.webp) submerged fence, pool of light & receding line
    S.drawScissorCutout(
      ctx, aImg,
      18, 56, 704, 304,
      118 + px1, 56 + py1, 1020, 410,
      [[0.02, 0.06], [0.52, 0.02], [0.98, 0.05], [0.96, 0.92], [0.48, 0.97], [0.03, 0.94]],
      { filter: "mono", haloWidth: 4.2, alpha: 0.92 }
    );

    if (beat.lampOn) {
      S.drawLampBeam(ctx, W, H, t, state, { x: 460, y: 610, aimX: 650, spread: 280, alpha: 0.16 });
    }

    // 3. Plane 2: Submerged stone bridge pier & iron ring cropped from p52.jpg (right)
    S.drawScissorCutout(
      ctx, pImg,
      305, 114, 186, 292,
      785 + px2, 68 + py2, 345, 425,
      [[0.08, 0.03], [0.94, 0.05], [0.97, 0.94], [0.16, 0.96], [0.03, 0.54]],
      { filter: "mono", haloWidth: 4.5 }
    );

    // 4. Plane 3: Diagonal creek boulder & silt bed cropped from p52.jpg (lower-left)
    S.drawScissorCutout(
      ctx, pImg,
      138, 204, 232, 278,
      102 + px3, 218 + py3, 415, 355,
      [[0.05, 0.22], [0.58, 0.04], [0.96, 0.34], [0.92, 0.95], [0.04, 0.96]],
      { filter: "sepia", haloWidth: 4.5 }
    );

    // Iron Mooring Ring with Brass Split-Pin Anchor on the Bridge Pier!
    var ringX = 956 + px2;
    var ringY = 202 + py2;
    ctx.save();
    ctx.translate(ringX, ringY);
    S.drawCardboardPuppetPiece(ctx, [[-20, -28], [22, -28], [26, 4], [-22, 4]], { tone: "#4f5255", ribs: 1 });
    ctx.strokeStyle = "#fbfaf5";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(0, 18, 30, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "#2b2d2f";
    ctx.lineWidth = 9.5;
    ctx.beginPath();
    ctx.arc(0, 18, 30, 0, TAU);
    ctx.stroke();
    S.drawSplitPin(ctx, 0, -14, 5.6, { metal: "brass" });
    ctx.restore();

    // Left Anchor Boulder Crevice (grey-cardboard puppet plate)
    var leftAncX = 225 + px3;
    var leftAncY = 486 + py3;

    // 5. Centerpiece Vivid Crimson Rope / Tentacle / Tow-Line / Space-Elevator!
    if (beat.index === 0) {
      // VARIATION I (A): "A tight red rope between rocks"
      var pullU = S.spring(lt, 0.18, 10.5, 3.8);
      var sag = S.lerp(95, 4, S.clamp(pullU, 0, 1.15)) + Math.sin(t * 14.0) * Math.exp(-lt * 1.1) * 9;

      // Puff of paper-cut silt clouds kicked up along diagonal rope (matching p52.jpg!)
      for (var sc = 0; sc < 9; sc++) {
        var su = (sc + 0.5) / 9;
        var dustX = S.lerp(leftAncX, ringX - 18, su) + Math.sin(t * 2 + sc) * 10;
        var dustY = S.lerp(leftAncY, ringY + 22, su) + Math.sin(su * Math.PI) * sag + 18;
        ctx.fillStyle = "rgba(222, 214, 196, 0.34)";
        ctx.beginPath();
        ctx.arc(dustX, dustY, 16 + (sc % 3) * 7, 0, TAU);
        ctx.fill();
      }

      // 16 braided crimson rope twists with cream scissor-cut halo!
      var segs = 16;
      for (var rs = 0; rs < segs; rs++) {
        var u0 = rs / segs;
        var u1 = (rs + 1) / segs;
        var x0 = S.lerp(leftAncX, ringX - 16, u0);
        var y0 = S.lerp(leftAncY, ringY + 22, u0) + Math.sin(u0 * Math.PI) * sag;
        var x1 = S.lerp(leftAncX, ringX - 16, u1);
        var y1 = S.lerp(leftAncY, ringY + 22, u1) + Math.sin(u1 * Math.PI) * sag;
        var mx = (x0 + x1) * 0.5, my = (y0 + y1) * 0.5;
        var ang = Math.atan2(y1 - y0, x1 - x0);
        var segLen = Math.hypot(x1 - x0, y1 - y0) * 0.66;
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(ang + 0.18);
        S.drawCutoutPaperEdge(
          ctx,
          [[-segLen, -12], [segLen, -12], [segLen * 0.85, 12], [-segLen * 0.85, 12]],
          rs % 2 === 0 ? "#b5262c" : "#cf3939",
          "#14110d",
          { paperRim: 3.2, shadow: true, lineWidth: 2.0 }
        );
        ctx.restore();
      }

      // Knotted clove-hitch around iron ring
      S.drawCutoutPaperEdge(
        ctx,
        [[ringX - 38, ringY + 12], [ringX - 6, ringY - 2], [ringX + 10, ringY + 28], [ringX - 24, ringY + 42]],
        "#9e1f24",
        "#14110d",
        { paperRim: 3.5 }
      );

    } else if (beat.index === 1) {
      // VARIATION II (B): "A giant red squid tentacle"
      // Peering giant paper squid eye inside left rock cave!
      ctx.save();
      ctx.translate(leftAncX - 32, leftAncY - 24);
      S.drawCardboardPuppetPiece(
        ctx,
        [[-78, 35], [-66, -56], [18, -72], [58, -15], [46, 54], [-35, 62]],
        { tone: "#8f252a", ribs: 3 }
      );
      ctx.fillStyle = "#fbfaf5";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(-8, -12, 24, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#14110d";
      ctx.fillRect(-13, -24, 10, 24);
      ctx.restore();

      // 7-Joint Articulated Split-Pin Giant Crimson Tentacle + Cream Suction Cups!
      var joints = [];
      for (var tj = 0; tj <= 7; tj++) {
        var tu = tj / 7;
        var wave = Math.sin(t * 4.2 - tu * 4.6) * 28 * Math.sin(tu * Math.PI);
        var jx = S.lerp(leftAncX - 10, ringX - 12, tu) - wave * 0.35;
        var jy = S.lerp(leftAncY - 12, ringY + 18, tu) + wave;
        joints.push({ x: jx, y: jy, w: S.lerp(30, 8, tu) });
      }
      for (var ts = 0; ts < 7; ts++) {
        var A = joints[ts], B = joints[ts + 1];
        var tang = Math.atan2(B.y - A.y, B.x - A.x);
        var nx = -Math.sin(tang), ny = Math.cos(tang);
        // Cream suction cups along underside
        for (var cup = 0; cup < 2; cup++) {
          var cu = (cup + 0.35) * 0.5;
          var cxCup = S.lerp(A.x, B.x, cu) + nx * (A.w * 0.85);
          var cyCup = S.lerp(A.y, B.y, cu) + ny * (A.w * 0.85);
          S.drawCutoutPaperEdge(
            ctx,
            [[cxCup - 8, cyCup - 6], [cxCup + 8, cyCup - 6], [cxCup + 10, cyCup + 7], [cxCup - 10, cyCup + 7]],
            "#f5ebd6",
            "#14110d",
            { paperRim: 1.8, shadow: false }
          );
        }
        drawLimbSegment(ctx, S, A.x, A.y, B.x, B.y, A.w, B.w, ts % 2 === 0 ? "#b8282e" : "#cf3a3a", "brass", false);
      }

    } else if (beat.index === 2) {
      // VARIATION III (C): "A helpful creek tow-truck line"
      // Grey-Cardboard Creek Tow-Truck parked on right pier winching a boulder sled!
      var truckX = 918 + px2 * 0.7;
      var truckY = 236 + py2 * 0.7;
      var haulDist = u * 95;
      var sledX = leftAncX + 45 + haulDist;
      var sledY = leftAncY - 28 - haulDist * 0.38;

      // Red braided winch tow-line + steel J-hook
      ctx.save();
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(truckX - 82, truckY - 12);
      ctx.lineTo(sledX + 42, sledY - 8);
      ctx.stroke();

      ctx.strokeStyle = "#c93030";
      ctx.lineWidth = 8.5;
      ctx.beginPath();
      ctx.moveTo(truckX - 82, truckY - 12);
      ctx.lineTo(sledX + 42, sledY - 8);
      ctx.stroke();
      ctx.restore();

      // Towed grey-cardboard creek skiff/boulder sled + J-hook
      ctx.save();
      ctx.translate(sledX, sledY);
      ctx.rotate(-0.34);
      S.drawCardboardPuppetPiece(
        ctx,
        [[-72, 18], [-58, -32], [28, -36], [56, 12], [38, 28], [-54, 28]],
        { tone: "#76787a", ribs: 3, pins: [[-36, 12], [24, 12]] }
      );
      // Steel tow hook
      S.drawCutoutPaperEdge(ctx, [[42, -16], [64, -16], [66, 8], [46, 12], [46, 2], [54, 0], [54, -8], [42, -8]], "#d9dadb", "#14110d", { paperRim: 2 });
      ctx.restore();

      // Cardboard Creek Tow-Truck with boom crane & spinning split-pin wheels!
      ctx.save();
      ctx.translate(truckX, truckY);
      // Angled crane boom
      drawLimbSegment(ctx, S, -10, 6, -86, -16, 10, 7, "#636669", "brass", "silver");
      // Truck chassis & cab
      S.drawCardboardPuppetPiece(
        ctx,
        [[-48, 26], [-48, -6], [4, -8], [16, -44], [76, -44], [92, -8], [98, 26]],
        { tone: "#9a9b98", ribs: 3 }
      );
      // Cab window cutout
      S.drawCutoutPaperEdge(ctx, [[24, -36], [68, -36], [78, -10], [20, -10]], "#dfe6e8", "#14110d", { paperRim: 1.8, shadow: false });
      // Rotating winch drum
      ctx.save();
      ctx.translate(-24, -12);
      ctx.rotate(-t * 4.5);
      S.drawCutoutPaperEdge(ctx, [[-16, -16], [16, -16], [16, 16], [-16, 16]], "#b5262c", "#14110d", { paperRim: 2.0 });
      S.drawSplitPin(ctx, 0, 0, 5.0, { metal: "brass" });
      ctx.restore();
      // Spinning cardboard tires with split-pin hubs
      var wheelXs = [-22, 62];
      for (var wi = 0; wi < 2; wi++) {
        ctx.save();
        ctx.translate(wheelXs[wi], 28);
        ctx.rotate(-t * 3.8);
        S.drawCutoutPaperEdge(ctx, [[-22, -10], [-10, -22], [10, -22], [22, -10], [22, 10], [10, 22], [-10, 22], [-22, 10]], "#353739", "#14110d", { paperRim: 2.5 });
        S.drawSplitPin(ctx, 0, 0, 5.5, { metal: "silver" });
        ctx.restore();
      }
      ctx.restore();

    } else {
      // VARIATION IV (D): "An orbital space-elevator cable"
      var topCableX = 646;
      var topCableY = 114;
      var botCableX = 560;
      var botCableY = 565;

      // Taut glowing crimson space-elevator ribbon ascending vertically into Alien Saucer!
      ctx.save();
      ctx.strokeStyle = "rgba(15, 143, 128, 0.36)";
      ctx.lineWidth = 28;
      ctx.beginPath();
      ctx.moveTo(botCableX, botCableY);
      ctx.lineTo(topCableX, topCableY);
      ctx.stroke();

      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 17;
      ctx.beginPath();
      ctx.moveTo(botCableX, botCableY);
      ctx.lineTo(topCableX, topCableY);
      ctx.stroke();

      ctx.strokeStyle = "#d42a1e";
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(botCableX, botCableY);
      ctx.lineTo(topCableX, topCableY);
      ctx.stroke();
      ctx.restore();

      // Climbing Split-Pin Orbital Gondola Car ascending the cable!
      var climbU = 0.14 + u * 0.72;
      var carX = S.lerp(botCableX, topCableX, climbU);
      var carY = S.lerp(botCableY, topCableY, climbU);
      ctx.save();
      ctx.translate(carX, carY);
      ctx.rotate(Math.atan2(topCableY - botCableY, topCableX - botCableX) + Math.PI * 0.5);
      // Solar wing panels
      S.drawCutoutPaperEdge(ctx, [[-92, -12], [-38, -16], [-38, 16], [-92, 12]], "#0f8f80", "#14110d", { paperRim: 2.5 });
      S.drawCutoutPaperEdge(ctx, [[38, -16], [92, -12], [92, 12], [38, 16]], "#0f8f80", "#14110d", { paperRim: 2.5 });
      // Riveted cardboard climber cabin
      S.drawCardboardPuppetPiece(
        ctx,
        [[-36, -30], [36, -30], [42, 26], [-42, 26]],
        { tone: "#b8b4aa", ribs: 2, pins: [[-26, -20], [26, -20], [-26, 18], [26, 18]] }
      );
      // Glowing circular porthole window on gondola
      ctx.fillStyle = "#fae194";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, -2, 13, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Foreground Left & Right Creek Boulder silhouettes (Plane 4 occlusion!)
    S.drawCardboardPuppetPiece(
      ctx,
      [[86 + px4, 595], [86 + px4, 438 + py4], [198 + px4, 412 + py4], [295 + px4, 492 + py4], [335 + px4, 595]],
      { tone: "#3d3f42", ribs: 3, pin: { x: 185 + px4, y: 468 + py4, r: 5.0, metal: "silver" } }
    );
    S.drawCardboardPuppetPiece(
      ctx,
      [[945 + px4, 595], [992 + px4, 470 + py4], [1115 + px4, 430 + py4], [1194 + px4, 465 + py4], [1194 + px4, 595]],
      { tone: "#36383b", ribs: 2, pin: { x: 1085 + px4, y: 482 + py4, r: 5.0, metal: "brass" } }
    );

    // 6. Couriers across Beats A, B, C, D
    var snailOver2 = drawInteractiveSnailOverride(ctx, S, W, H, t, state);
    if (beat.index === 1) {
      S.drawTurkeyInCorner(ctx, 165, 502, 1.1, t, { dispatch: S.smooth(0.05, 0.45, u) });
      if (!snailOver2) {
        S.drawMailSnail(ctx, S.lerp(255, 920, u), 532 + Math.sin(u * Math.PI * 4) * 5, 1.2, t, { hasReply: false });
      }
    } else if (beat.index === 2) {
      S.drawBrookTrout(ctx, 790 - Math.sin(t * 2.1) * 18, 365 + Math.cos(t * 2.5) * 8, 1.04, t, false);
      if (!snailOver2) {
        S.drawMailSnail(ctx, 1118, S.lerp(515, 175, u), 1.16, t, { rot: -Math.PI * 0.5, hasReply: true });
      }
    } else if (beat.index === 3) {
      S.drawAlienSaucer(ctx, 646, 102, 1.22, t, 600, 360, { beamSpread: 145 });
      if (!snailOver2) {
        S.drawMailSnail(ctx, S.lerp(1040, 795, u), 134, 1.08, t, { flip: true, hasReply: true, hasAlienStamp: true });
      }
    } else {
      S.drawBrookTrout(ctx, 985 + px2 * 0.4, 342 + py2 * 0.4, 0.94, t, false);
    }

    drawBallastBubbles(ctx, S, W, H, t, state, 52, "rgba(238,240,238,0.68)");
    S.endCamera(ctx);

    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 52);
  }

  // ============================================================================
  // PORTHOLE #53 · FLUME
  // bolasStyle: "cardboard-parallax" | Oucipo Fibonacci · S50 LOC Archive Stage
  // Plates: ./portholes/p53.jpg (640x640) + ./assets/atlas-stills/atlas-27.webp (740x555)
  //   A: An old iron watermill wheel
  //   B: A giant kitchen pie-crust crimper
  //   C: A heavy log jamming the creek
  //   D: Planet Earth’s main spin gear
  // ============================================================================
  function renderPortal53(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var u = beat.u;
    var lt = beat.localT;
    var plates = S.getPortalPlates(53);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    // 1. LOC Historical Monochrome Print Stage + Pillarboxes
    S.drawBolasBackdrop(ctx, W, H, "cardboard-parallax", S.getStack(53) && S.getStack(53).directorSwarm.palette, t, state, {
      pillarbox: true
    });

    S.beginCamera(ctx, W, H, t, { state: state, pushDur: 0.65 });

    var px1 = S.parallaxX(0.16, t, state), py1 = S.parallaxY(0.16, t, state);
    var px2 = S.parallaxX(0.38, t, state), py2 = S.parallaxY(0.38, t, state);
    var px3 = S.parallaxX(0.65, t, state), py3 = S.parallaxY(0.65, t, state);

    // 2. Plane 1: Crop right boat/storm clouds + lower mottled water from atlas-27.webp
    // (Cleanly avoids painted calligraphy on upper-left of atlas-27.webp!)
    S.drawScissorCutout(
      ctx, aImg,
      335, 22, 392, 515,
      645 + px1, 52 + py1, 505, 455,
      [[0.05, 0.04], [0.95, 0.03], [0.97, 0.94], [0.06, 0.96]],
      { filter: "mono", haloWidth: 4.2, alpha: 0.88 }
    );
    S.drawScissorCutout(
      ctx, aImg,
      40, 392, 660, 155,
      112 + px1, 415 + py1, 980, 168,
      [[0.02, 0.14], [0.48, 0.04], [0.98, 0.12], [0.96, 0.94], [0.03, 0.95]],
      { filter: "sepia", haloWidth: 4.0, alpha: 0.92 }
    );

    // 3. Plane 2: Mossy stone mill wall & flume chute cropped from p53.jpg
    S.drawScissorCutout(
      ctx, pImg,
      142, 126, 214, 316,
      108 + px2, 58 + py2, 345, 435,
      [[0.06, 0.04], [0.92, 0.03], [0.88, 0.95], [0.05, 0.96]],
      { filter: "mono", haloWidth: 4.5 }
    );
    // Swirling flume water arc cropped from right side of p53.jpg
    S.drawScissorCutout(
      ctx, pImg,
      348, 142, 156, 292,
      705 + px2, 95 + py2, 310, 395,
      [[0.08, 0.05], [0.90, 0.08], [0.95, 0.90], [0.12, 0.94]],
      { filter: "mono", haloWidth: 4.2, alpha: 0.85 }
    );

    if (beat.lampOn) {
      S.drawLampBeam(ctx, W, H, t, state, { x: 540, y: 605, aimX: 540, spread: 290, alpha: 0.16 });
    }

    // 4. Centerpiece 12-Paddle Grey-Cardboard & Iron Millwheel (S32 FK + S48 Jam State Machine)
    var wheelX = 528 + px2 * 0.7 + (beat.index === 1 ? Math.sin(lt * 2.2) * 58 : 0);
    var wheelY = 286 + py2 * 0.7 + (beat.index === 1 ? 26 : 0);
    var wheelR = 152;

    // Compute wheel angular rotation per beat!
    var wheelAng = t * 1.05;
    var isJammed = false;
    if (beat.index === 1) {
      // Rolling back and forth as giant pie-crust crimper!
      wheelAng = Math.sin(lt * 2.2) * 0.95;
    } else if (beat.index === 2) {
      // Jams at lt = 0.55..2.35s, then Brook Trout levers log free at lt = 2.35s!
      if (lt < 0.55) {
        wheelAng = lt * 1.2;
      } else if (lt < 2.35) {
        isJammed = true;
        wheelAng = 0.66 + S.springImpulse(lt, 0.55, 24.0, 3.2) * 0.08 + Math.sin(t * 34) * 0.012;
      } else {
        wheelAng = 0.66 + (lt - 2.35) * 1.65;
      }
    } else if (beat.index === 3) {
      // Interlocked planetary gear rotation
      wheelAng = lt * 0.85;
    }

    // Overhead Wooden Flume Trough & Torn-Paper Cascade (Beats A & C)
    if (beat.index === 0 || beat.index === 2) {
      S.drawTornPaperFlat(ctx, 290 + px2, 74 + py2, 265, 36, {
        fill: "#595752",
        paperColor: "#f2eee4",
        deckle: 4.5
      });
      // Torn-paper whitewater cascade spilling onto wheel buckets
      var spillW = isJammed ? 58 : 38;
      S.drawCutoutPaperEdge(
        ctx,
        [
          [535 + px2, 92 + py2],
          [535 + spillW + px2, 96 + py2],
          [685 + px2 + Math.sin(t * 6) * 8, 255 + py2],
          [642 + px2, 268 + py2]
        ],
        "#e6ebe8",
        "#14110d",
        { paperRim: 3.0 }
      );
    }

    // Beat D Interlocked Cut-Paper Planet Earth Gear (meshing on right of millwheel!)
    if (beat.index === 3) {
      var earthX = wheelX + wheelR + 116;
      var earthY = wheelY + 34;
      var earthR = 108;
      var earthAng = -wheelAng * (wheelR / earthR) + 0.14;

      ctx.save();
      ctx.translate(earthX, earthY);
      ctx.rotate(earthAng);

      // 10 brass planetary gear teeth around globe perimeter
      for (var gt = 0; gt < 10; gt++) {
        var ga = (gt / 10) * TAU;
        ctx.save();
        ctx.rotate(ga);
        S.drawCardboardPuppetPiece(
          ctx,
          [[earthR - 6, -12], [earthR + 22, -9], [earthR + 22, 9], [earthR - 6, 12]],
          { tone: "#c9963e", ribs: 1, shadow: false }
        );
        ctx.restore();
      }

      // Globe disc + scissor-cut continent patches
      var gPts = [];
      for (var gi = 0; gi < 20; gi++) {
        var gAng = (gi / 20) * TAU;
        gPts.push([Math.cos(gAng) * earthR, Math.sin(gAng) * earthR]);
      }
      S.drawCutoutPaperEdge(ctx, gPts, "#2a4454", "#14110d", { paperRim: 4.5 });
      // Cut-paper continents (Americas + Eurasia silhouettes)
      S.drawCutoutPaperEdge(ctx, [[-62, -48], [-18, -56], [-8, -14], [-28, 12], [-12, 58], [-44, 48], [-58, 4]], "#7ba38c", "#14110d", { paperRim: 2.0, shadow: false });
      S.drawCutoutPaperEdge(ctx, [[18, -52], [68, -32], [62, 16], [28, 44], [12, 8]], "#7ba38c", "#14110d", { paperRim: 2.0, shadow: false });
      S.drawReinigerFiligreeHinge(ctx, 0, 0, 10.5, { metal: "brass" });
      ctx.restore();
    }

    // Draw the 12-Paddle Wheel!
    ctx.save();
    ctx.translate(wheelX, wheelY);
    ctx.rotate(wheelAng);

    var nPaddles = 12;
    for (var pd = 0; pd < nPaddles; pd++) {
      var pa = (pd / nPaddles) * TAU;
      ctx.save();
      ctx.rotate(pa);
      if (beat.index === 1) {
        // Fluted brass pastry-crimper teeth in Beat B!
        S.drawCutoutPaperEdge(
          ctx,
          [[wheelR - 14, -13], [wheelR + 22, -7], [wheelR + 22, 7], [wheelR - 14, 13]],
          "#d8a444",
          "#14110d",
          { paperRim: 2.2, shadow: false }
        );
      } else {
        // Grey-cardboard watermill bucket paddles
        S.drawCardboardPuppetPiece(
          ctx,
          [[wheelR - 26, -11], [wheelR + 18, -15], [wheelR + 18, 15], [wheelR - 26, 11]],
          { tone: pd % 2 === 0 ? "#686966" : "#7e7f7b", ribs: 1, shadow: false }
        );
      }
      ctx.restore();
    }

    // 6 Radial Cardboard Spokes
    for (var spk = 0; spk < 6; spk++) {
      ctx.save();
      ctx.rotate((spk / 6) * TAU);
      S.drawCardboardPuppetPiece(
        ctx,
        [[-10, -wheelR + 16], [10, -wheelR + 16], [10, wheelR - 16], [-10, wheelR - 16]],
        { tone: "#888782", ribs: 3, shadow: false }
      );
      ctx.restore();
    }

    // Outer & Inner Iron/Cardboard Rim Ring + 12 Silver Split-Pin Rivets!
    ctx.strokeStyle = "#fbfaf5";
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR - 18, 0, TAU);
    ctx.stroke();

    ctx.strokeStyle = beat.index === 1 ? "#c9963e" : "#545552";
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR - 18, 0, TAU);
    ctx.stroke();

    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR - 10, 0, TAU);
    ctx.arc(0, 0, wheelR - 26, 0, TAU);
    ctx.stroke();

    for (var rv = 0; rv < 12; rv++) {
      var ra = (rv / 12) * TAU;
      S.drawSplitPin(ctx, Math.cos(ra) * (wheelR - 18), Math.sin(ra) * (wheelR - 18), 3.8, { metal: "silver" });
    }

    // Central Axle Hub
    S.drawReinigerFiligreeHinge(ctx, 0, 0, 14, { metal: "brass" });
    ctx.restore();

    // Stone Pier Pedestal supporting the wheel axle (except Beat B where a giant Baker's IK Arm holds the crimper!)
    if (beat.index === 1) {
      // VARIATION II (B): "A giant kitchen pie-crust crimper"
      // 2-Bone IK Baker's Sleeve + Wooden Crimper Fork Handle holding axle!
      var armIK = S.solveIK2(235, 118, 195, 185, wheelX, wheelY, 1);
      drawLimbSegment(ctx, S, 235, 118, armIK.jx, armIK.jy, 26, 22, "#ebe8df", "silver", "brass");
      drawLimbSegment(ctx, S, armIK.jx, armIK.jy, wheelX, wheelY, 16, 11, "#9e6b3b", "brass", "brass");

      // Giant Scalloped Pie-Tin Dough Rim across bottom being crimped by the wheel!
      S.drawCardboardPuppetPiece(
        ctx,
        [[255, 578], [295, 476], [835, 476], [875, 578]],
        { tone: "#8f9296", ribs: 2 }
      );
      var doughPts = [[275, 482]];
      for (var dp = 0; dp <= 22; dp++) {
        var dxDough = S.lerp(285, 845, dp / 22);
        var crimpAmp = (dxDough < wheelX + 65) ? 13 : 4;
        var dyDough = 468 + ((dp % 2 === 0) ? -crimpAmp : crimpAmp);
        doughPts.push([dxDough, dyDough]);
      }
      doughPts.push([855, 498], [275, 498]);
      S.drawCutoutPaperEdge(ctx, doughPts, "#edd089", "#14110d", { paperRim: 3.5 });

    } else {
      // Mossy Stone Axle Pedestal Pier (matching p53.jpg!)
      S.drawCardboardPuppetPiece(
        ctx,
        [[368 + px2 * 0.7, 535], [385 + px2 * 0.7, 304 + py2 * 0.7], [512 + px2 * 0.7, 304 + py2 * 0.7], [532 + px2 * 0.7, 535]],
        { tone: "#6c7068", ribs: 4, pins: [[415 + px2 * 0.7, 322 + py2 * 0.7], [485 + px2 * 0.7, 322 + py2 * 0.7]] }
      );
      // Axle pillow-block bearing cap
      S.drawCardboardPuppetPiece(
        ctx,
        [[wheelX - 65, wheelY - 18], [wheelX + 18, wheelY - 18], [wheelX + 18, wheelY + 22], [wheelX - 65, wheelY + 22]],
        { tone: "#484a4c", ribs: 1, pin: { x: wheelX, y: wheelY, r: 6.5, metal: "brass" } }
      );
    }

    // Beat A: Wooden Cellar Hatch & Clicking Brass Latch at 6-o'clock (exact p53.jpg detail!)
    if (beat.index === 0) {
      var latchClick = Math.pow(Math.max(0, Math.sin(wheelAng * 12)), 4);
      var hatchX = 585 + px3 * 0.5;
      var hatchY = 496 + py3 * 0.5;
      S.drawCardboardPuppetPiece(
        ctx,
        [[hatchX - 115, hatchY + 18], [hatchX - 35, hatchY - 22], [hatchX + 135, hatchY + 8], [hatchX + 55, hatchY + 62]],
        { tone: "#786b56", ribs: 3 }
      );
      ctx.save();
      ctx.translate(hatchX + 18, hatchY + 14);
      ctx.rotate(-0.18 - latchClick * 0.36);
      S.drawCutoutPaperEdge(ctx, [[-48, -9], [16, -9], [24, 9], [-48, 9]], "#e8c060", "#14110d", { paperRim: 2.2 });
      S.drawSplitPin(ctx, 8, 0, 4.5, { metal: "brass" });
      ctx.restore();

      // White paper spark splinters when paddle clicks latch!
      if (latchClick > 0.35) {
        ctx.strokeStyle = "#fbfaf5";
        ctx.lineWidth = 2.6;
        for (var sp = 0; sp < 5; sp++) {
          var sa = -Math.PI * 0.85 + sp * 0.42;
          ctx.beginPath();
          ctx.moveTo(hatchX - 24 + Math.cos(sa) * 10, hatchY - 4 + Math.sin(sa) * 10);
          ctx.lineTo(hatchX - 24 + Math.cos(sa) * 28, hatchY - 4 + Math.sin(sa) * 28);
          ctx.stroke();
        }
      }
    }

    // Beat C: Heavy Jamming Creek Log + Brook Trout Levering It Free (Atlas #verne-18)!
    if (beat.index === 2) {
      var freeU = S.smooth(2.25, 3.1, lt);
      var logX = S.lerp(wheelX + 95, wheelX + 245, freeU);
      var logY = S.lerp(wheelY + 118, wheelY + 195, freeU);
      var logRot = S.lerp(-0.28, 0.38, freeU) + (isJammed ? Math.sin(t * 36) * 0.025 : 0);

      ctx.save();
      ctx.translate(logX, logY);
      ctx.rotate(logRot);
      S.drawCardboardPuppetPiece(
        ctx,
        [[-135, -24], [115, -28], [132, 0], [118, 26], [-128, 24], [-142, 4]],
        { tone: "#5c4d3c", ribs: 5, pins: [[-75, 0], [55, 0]] }
      );
      // Cut-paper tree-ring cross-section on end of log
      S.drawCutoutPaperEdge(ctx, [[108, -24], [132, -16], [134, 16], [110, 24], [98, 0]], "#d8c49e", "#14110d", { paperRim: 2.0, shadow: false });
      // Stubby branch knot
      S.drawCardboardPuppetPiece(ctx, [[-22, -22], [-6, -54], [12, -50], [6, -22]], { tone: "#4e4132", ribs: 1, shadow: false });
      ctx.restore();
    }

    // 5. Couriers across Beats A, B, C, D
    var snailOver3 = drawInteractiveSnailOverride(ctx, S, W, H, t, state);
    if (beat.index === 1) {
      S.drawTurkeyInCorner(ctx, 162, 502, 1.1, t, { dispatch: S.smooth(0.05, 0.45, u) });
      if (!snailOver3) {
        S.drawMailSnail(ctx, S.lerp(260, 910, u), 532 + Math.sin(u * Math.PI * 4) * 5, 1.2, t, { hasReply: false });
      }
    } else if (beat.index === 2) {
      S.drawBrookTrout(ctx, 885 - S.smooth(1.8, 2.5, lt) * 55, 365 + Math.sin(t * 3.0) * 8, 1.08, t, false);
      if (!snailOver3) {
        S.drawMailSnail(ctx, 1118, S.lerp(515, 175, u), 1.16, t, { rot: -Math.PI * 0.5, hasReply: true });
      }
    } else if (beat.index === 3) {
      S.drawAlienSaucer(ctx, 845, 106, 1.2, t, wheelX + 135, wheelY + 20, { beamSpread: 150 });
      if (!snailOver3) {
        S.drawMailSnail(ctx, S.lerp(1050, 720, u), 134, 1.08, t, { flip: true, hasReply: true, hasAlienStamp: true });
      }
    } else {
      S.drawBrookTrout(ctx, 945 + px2 * 0.5, 338 + py2 * 0.5, 0.96, t, false, { tilt: -0.22 });
    }

    drawBallastBubbles(ctx, S, W, H, t, state, 53, "rgba(240,242,240,0.72)");
    S.endCamera(ctx);

    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 53);
  }

  // ============================================================================
  // PORTHOLE #54 · LEDGE
  // bolasStyle: "cardboard-parallax" | Oubapo · S13 Nora Willett Secondary Motion
  // Plates: ./portholes/p54.jpg (640x640) + ./assets/atlas-stills/atlas-46.webp (740x416)
  //   A: A giant wrinkled creek salamander
  //   B: A ruffled porcelain gravy boat
  //   C: A clunky tin hermit crab
  //   D: The frilly Emperor of Space
  // ============================================================================
  function renderPortal54(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var u = beat.u;
    var lt = beat.localT;
    var plates = S.getPortalPlates(54);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    // 1. Silver-gelatin creek overhang ground + Academy side mattes
    S.drawBolasBackdrop(ctx, W, H, "cardboard-parallax", S.getStack(54) && S.getStack(54).directorSwarm.palette, t, state, {
      pillarbox: true
    });

    S.beginCamera(ctx, W, H, t, { state: state, pushDur: 0.65 });

    var px1 = S.parallaxX(0.18, t, state), py1 = S.parallaxY(0.18, t, state);
    var px2 = S.parallaxX(0.45, t, state), py2 = S.parallaxY(0.45, t, state);
    var px3 = S.parallaxX(0.82, t, state), py3 = S.parallaxY(0.82, t, state);

    // 2. Plane 1: Welcome to Trout Town (atlas-46.webp) underwater forest & sunbeams
    // (Cropped sw=645 to exclude corner mark at x=705!)
    S.drawScissorCutout(
      ctx, aImg,
      36, 12, 645, 375,
      115 + px1, 56 + py1, 960, 415,
      [[0.03, 0.05], [0.54, 0.02], [0.97, 0.06], [0.95, 0.94], [0.04, 0.96]],
      { filter: "mono", haloWidth: 4.2, alpha: 0.88 }
    );

    // 3. Plane 2: Overhanging shale ledge cropped from p54.jpg (upper right)
    S.drawScissorCutout(
      ctx, pImg,
      182, 114, 318, 152,
      395 + px2, 46 + py2, 720, 232,
      [[0.02, 0.34], [0.36, 0.06], [0.96, 0.04], [0.98, 0.92], [0.54, 0.78], [0.08, 0.74]],
      { filter: "sepia", haloWidth: 4.8 }
    );

    // Creek floor boulders & aquatic weeds cropped from p54.jpg
    S.drawScissorCutout(
      ctx, pImg,
      138, 252, 148, 178,
      108 + px3, 335 + py3, 245, 225,
      [[0.06, 0.08], [0.88, 0.14], [0.95, 0.92], [0.05, 0.95]],
      { filter: "mono", haloWidth: 4.0 }
    );
    S.drawScissorCutout(
      ctx, pImg,
      418, 312, 92, 172,
      955 + px3, 308 + py3, 205, 265,
      [[0.18, 0.04], [0.88, 0.08], [0.94, 0.95], [0.08, 0.94]],
      { filter: "mono", haloWidth: 4.0 }
    );

    // Iconic Bottom-Center Sub Brass Spotlight Cone (matching p54.jpg!)
    var lampX = 618 + px3 * 0.4;
    var lampY = 582;
    if (beat.lampOn) {
      S.drawLampBeam(ctx, W, H, t, state, { x: lampX, y: lampY - 12, aimX: 640, spread: 265, alpha: 0.25 });
    }

    // 4. Centerpiece 5-Segment Spine + Secondary-Motion Frill Rig (S13 Nora Willett)
    // Shared S-curve silhouette across all 4 Oubapo variations!
    var spineBase = [
      { x: 505, y: 426 }, // 0: broad flat head / gravy spout / crab front / Emperor head
      { x: 618, y: 412 }, // 1: shoulder
      { x: 735, y: 374 }, // 2: mid-body arch
      { x: 792, y: 298 }, // 3: curled hip
      { x: 655, y: 256 }, // 4: swept upper tail
      { x: 505, y: 238 }  // 5: tail tip / gravy handle
    ];
    var spine = [];
    for (var si = 0; si < spineBase.length; si++) {
      var ph = t * 2.8 - si * 0.65; // S13 phase-delayed secondary motion!
      var swayAmp = (beat.index === 1) ? 3.5 : (4.5 + si * 2.4);
      var liftD = (beat.index === 3 && si <= 1) ? -34 : 0;
      spine.push({
        x: spineBase[si].x + px2 * 0.8 + Math.cos(ph) * (swayAmp * 0.5),
        y: spineBase[si].y + py2 * 0.8 + Math.sin(ph) * swayAmp + liftD
      });
    }

    if (beat.index === 0 || beat.index === 3) {
      // VARIATION I (A): "A giant wrinkled creek salamander"
      // AND VARIATION IV (D): "The frilly Emperor of Space" (crowned & caped Hellbender!)

      if (beat.index === 3) {
        // Royal Space-Emperor Velvet & Ermine Cape flowing behind spine with secondary lag!
        var capePts = [
          [spine[0].x + 36, spine[0].y - 18],
          [spine[1].x + 75, spine[1].y - 54],
          [spine[2].x + 92 + Math.sin(t * 3.5) * 14, spine[2].y - 35],
          [spine[3].x + 68, spine[3].y + 48],
          [spine[1].x + 30, spine[1].y + 38]
        ];
        S.drawCutoutPaperEdge(ctx, capePts, "#9e2428", "#14110d", { paperRim: 4.0 });
      }

      // Swept Finned Tail -> Torso Segments (back-to-front painter's order + brass split-pins!)
      for (var seg = 4; seg >= 1; seg--) {
        var P0 = spine[seg], P1 = spine[seg + 1];
        var wA = 34 - seg * 4.2;
        var wB = Math.max(8, 30 - (seg + 1) * 4.5);
        drawLimbSegment(
          ctx, S,
          P0.x, P0.y, P1.x, P1.y,
          wA, wB,
          beat.index === 3 ? "#8b7248" : (seg % 2 === 0 ? "#9c784c" : "#8b6940"),
          "brass", false
        );
      }

      // S13 Nora Willett Undulating Ruffled Lateral Skin-Fold Ribbon (14 phase-lagged lobes!)
      var frillPts = [];
      for (var fi = 0; fi <= 14; fi++) {
        var fu = fi / 14;
        var idxF = Math.min(4, Math.floor(fu * 4));
        var subU = (fu * 4) - idxF;
        var fx = S.lerp(spine[idxF].x, spine[idxF + 1].x, subU);
        var fy = S.lerp(spine[idxF].y, spine[idxF + 1].y, subU);
        var lobeWave = Math.sin(t * 5.2 - fi * 0.85) * 13 + ((fi % 2 === 0) ? -14 : 6);
        frillPts.push([fx + 14, fy + lobeWave - 8]);
      }
      for (var bi2 = 4; bi2 >= 0; bi2--) {
        frillPts.push([spine[bi2].x - 6, spine[bi2].y + 12]);
      }
      S.drawCutoutPaperEdge(
        ctx,
        frillPts,
        beat.index === 3 ? "#0f8f80" : "#b8874e",
        "#14110d",
        { paperRim: 2.8 }
      );

      // Torso join from Shoulder (spine[1]) to Broad Flat Head (spine[0])
      drawLimbSegment(ctx, S, spine[1].x, spine[1].y, spine[0].x, spine[0].y, 36, 32, "#a47d4e", "brass", "brass");

      // Articulated 2-Bone IK Front Foot gripping creek stone (matching p54.jpg!)
      var footTargetX = 636 + px2 * 0.8 + Math.sin(t * 2.0) * 8;
      var footTargetY = 478 + py2 * 0.8;
      var legIK = S.solveIK2(spine[1].x + 14, spine[1].y + 18, 44, 42, footTargetX, footTargetY, 1);
      drawLimbSegment(ctx, S, spine[1].x + 14, spine[1].y + 18, legIK.jx, legIK.jy, 11, 9, "#8c683e", "brass", "silver");
      drawLimbSegment(ctx, S, legIK.jx, legIK.jy, legIK.ex, legIK.ey, 8.5, 7, "#9e784a", "silver", false);
      // 4 little cardboard salamander toes
      for (var toe = -1.5; toe <= 1.5; toe += 1) {
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(legIK.ex, legIK.ey);
        ctx.lineTo(legIK.ex - 10 + toe * 6, legIK.ey + 11);
        ctx.stroke();
      }

      // Beat D: Accordion-Pleated Space Ruff Collar around neck!
      if (beat.index === 3) {
        ctx.save();
        ctx.translate(spine[0].x + 42, spine[0].y - 4);
        var ruffPts = [];
        for (var rf = 0; rf < 18; rf++) {
          var ra2 = (rf / 18) * TAU;
          var rr = (rf % 2 === 0) ? 54 : 34;
          ruffPts.push([Math.cos(ra2) * rr * 0.65, Math.sin(ra2) * rr]);
        }
        S.drawCutoutPaperEdge(ctx, ruffPts, "#fbfaf5", "#14110d", { paperRim: 3.0 });
        ctx.restore();
      }

      // Broad Flat Hellbender Head + Beady Eye + Wide Smile!
      ctx.save();
      ctx.translate(spine[0].x, spine[0].y);
      ctx.rotate(Math.sin(t * 2.1) * 0.06 + (beat.index === 3 ? -0.14 : 0));
      S.drawCardboardPuppetPiece(
        ctx,
        [[-78, 6], [-66, -24], [-12, -34], [52, -26], [58, 18], [4, 28], [-58, 22]],
        { tone: "#b28956", ribs: 2, pin: { x: 34, y: 0, r: 4.8, metal: "brass" } }
      );
      // Mouth crease & speckles
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-74, 10);
      ctx.quadraticCurveTo(-24, 20, 22, 12);
      ctx.stroke();

      ctx.fillStyle = "#fbfaf5";
      ctx.beginPath();
      ctx.arc(-18, -6, 7.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#14110d";
      ctx.beginPath();
      ctx.arc(-19, -6, 3.8, 0, TAU);
      ctx.fill();

      // Beat D: Split-Pin Brass Star-Crown & Tiny Star-Scepter!
      if (beat.index === 3) {
        S.drawCutoutPaperEdge(
          ctx,
          [[-32, -28], [-38, -64], [-18, -46], [0, -72], [18, -46], [38, -64], [32, -28]],
          "#f3d184",
          "#14110d",
          { paperRim: 2.5 }
        );
        S.drawSplitPin(ctx, 0, -44, 4.2, { metal: "brass" });
      }
      ctx.restore();

    } else if (beat.index === 1) {
      // VARIATION II (B): "A ruffled porcelain gravy boat"
      var gbX = 635 + px2 * 0.8;
      var gbY = 408 + py2 * 0.8 + Math.sin(t * 2.2) * 4;

      // Oval porcelain saucer plate underneath
      S.drawCutoutPaperEdge(
        ctx,
        [[gbX - 195, gbY + 48], [gbX - 125, gbY + 26], [gbX + 135, gbY + 26], [gbX + 195, gbY + 48], [gbX + 125, gbY + 68], [gbX - 125, gbY + 68]],
        "#f7f5ee",
        "#14110d",
        { paperRim: 4.0 }
      );

      // Silver serving ladle resting inside gravy boat + rising warm paper steam curls!
      drawLimbSegment(ctx, S, gbX + 42, gbY - 46, gbX + 128, gbY - 118, 6, 8, "#d4d7db", "silver", false);
      for (var stm = 0; stm < 3; stm++) {
        var stY = gbY - 76 - (((t * 36) + stm * 28) % 85);
        var stX = gbX - 35 + stm * 38 + Math.sin(t * 3 + stm) * 10;
        ctx.strokeStyle = "rgba(251, 250, 245, 0.65)";
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(stX, stY, 12, 0.4, 2.7);
        ctx.stroke();
      }

      // Arched porcelain loop handle (matching curved salamander tail!)
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 22;
      ctx.beginPath();
      ctx.arc(gbX + 135, gbY - 36, 46, -Math.PI * 0.65, Math.PI * 0.55);
      ctx.stroke();
      ctx.strokeStyle = "#1d596e";
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(gbX + 135, gbY - 36, 46, -Math.PI * 0.65, Math.PI * 0.55);
      ctx.stroke();

      // Ruffled scalloped porcelain gravy boat body + warm brown gravy meniscus!
      S.drawCutoutPaperEdge(
        ctx,
        [
          [gbX - 168, gbY - 48], [gbX - 115, gbY - 36], [gbX - 68, gbY - 54],
          [gbX - 15, gbY - 38],  [gbX + 42, gbY - 56],  [gbX + 96, gbY - 38],
          [gbX + 138, gbY - 52], [gbX + 115, gbY + 26], [gbX + 48, gbY + 44],
          [gbX - 65, gbY + 44],  [gbX - 132, gbY + 12]
        ],
        "#fbfaf5",
        "#14110d",
        { paperRim: 4.5, lineWidth: 2.4 }
      );
      // Warm Thanksgiving gravy pool peeking at rim
      S.drawCutoutPaperEdge(
        ctx,
        [[gbX - 126, gbY - 40], [gbX - 20, gbY - 46], [gbX + 92, gbY - 42], [gbX + 55, gbY - 28], [gbX - 75, gbY - 28]],
        "#8a5328",
        "#14110d",
        { paperRim: 1.5, shadow: false }
      );
      // Blue-willow floral porcelain scroll line (pure stroke curves, 0 text!)
      ctx.strokeStyle = "#1d596e";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (var bw = 0; bw <= 16; bw++) {
        var bxW = S.lerp(gbX - 108, gbX + 96, bw / 16);
        var byW = gbY - 4 + Math.sin(bw * 1.1) * 9;
        if (bw === 0) ctx.moveTo(bxW, byW);
        else ctx.lineTo(bxW, byW);
      }
      ctx.stroke();

    } else if (beat.index === 2) {
      // VARIATION III (C): "A clunky tin hermit crab"
      var crabX = 655 + px2 * 0.8 + Math.sin(lt * 2.8) * 24;
      var crabY = 408 + py2 * 0.8;

      // Spiraled Corrugated-Tin Baking-Mould Shell on back (matching curled Hellbender!)
      S.drawCardboardPuppetPiece(
        ctx,
        [
          [crabX - 58, crabY + 24], [crabX - 42, crabY - 58], [crabX + 28, crabY - 108],
          [crabX + 128, crabY - 96], [crabX + 168, crabY - 24], [crabX + 118, crabY + 38]
        ],
        { tone: "#9ba0a4", ribs: 5, pins: [[crabX + 12, crabY - 42], [crabX + 92, crabY - 52], [crabX + 118, crabY + 4]] }
      );

      // 3 Jointed Sheet-Metal Walking Legs on right
      for (var lg = 0; lg < 3; lg++) {
        var stepW = Math.sin(t * 5.5 + lg * 1.4) * 12;
        var lIK = S.solveIK2(crabX + 18 + lg * 32, crabY + 24, 42, 44, crabX + 36 + lg * 38 + stepW, crabY + 76, -1);
        drawLimbSegment(ctx, S, crabX + 18 + lg * 32, crabY + 24, lIK.jx, lIK.jy, 8, 6.5, "#7b8085", "silver", "brass");
        drawLimbSegment(ctx, S, lIK.jx, lIK.jy, lIK.ex, lIK.ey, 6.5, 4, "#adb2b6", "brass", false);
      }

      // Clunky Tin-Can Head + Periscope Eyestalks + Snapping IK Tin Pincer!
      S.drawCardboardPuppetPiece(
        ctx,
        [[crabX - 118, crabY + 28], [crabX - 112, crabY - 26], [crabX - 24, crabY - 32], [crabX - 16, crabY + 32]],
        { tone: "#b8bdc0", ribs: 2, pins: [[crabX - 96, crabY - 14], [crabX - 36, crabY - 14]] }
      );
      // Eyestalks
      for (var ey = 0; ey < 2; ey++) {
        var exC = crabX - 92 + ey * 26;
        var eyC = crabY - 54 + Math.sin(t * 5 + ey) * 4;
        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.moveTo(exC, crabY - 26);
        ctx.lineTo(exC, eyC);
        ctx.stroke();
        S.drawCutoutPaperEdge(ctx, [[exC - 8, eyC - 8], [exC + 8, eyC - 8], [exC + 8, eyC + 8], [exC - 8, eyC + 8]], "#fae194", "#14110d", { paperRim: 1.8, shadow: false });
        ctx.fillStyle = "#14110d";
        ctx.fillRect(exC - 3, eyC - 3, 5, 5);
      }
      // Snapping Tin-Shears Pincer Claw (IK + spring snap)
      var snapAng = 0.28 + Math.abs(Math.sin(t * 4.8)) * 0.35;
      ctx.save();
      ctx.translate(crabX - 122, crabY + 14);
      S.drawCardboardPuppetPiece(ctx, [[0, -12], [-56, -34], [-68, -14], [-8, 4]], { tone: "#c9cfd2", ribs: 1 });
      ctx.save();
      ctx.rotate(-snapAng);
      S.drawCardboardPuppetPiece(ctx, [[0, 4], [-58, 22], [-66, 4], [-8, -6]], { tone: "#8f9498", ribs: 1, pin: { x: 0, y: 0, r: 4.8, metal: "brass" } });
      ctx.restore();
      ctx.restore();
    }

    // Foreground Brass Sub Spotlight Dome at bottom center (matching p54.jpg!)
    ctx.save();
    ctx.translate(lampX, lampY);
    S.drawCutoutPaperEdge(
      ctx,
      [[-76, 18], [-64, -22], [-28, -42], [28, -42], [64, -22], [76, 18]],
      "#a6782a",
      "#14110d",
      { paperRim: 3.5 }
    );
    ctx.fillStyle = beat.lampOn ? "#ffe494" : "#4a463d";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(0, -18, 44, 16, 0, Math.PI, TAU);
    ctx.fill();
    ctx.stroke();
    S.drawSplitPin(ctx, -48, 0, 4.5, { metal: "brass" });
    S.drawSplitPin(ctx, 48, 0, 4.5, { metal: "brass" });
    ctx.restore();

    // 5. Couriers across Beats A, B, C, D
    var snailOver4 = drawInteractiveSnailOverride(ctx, S, W, H, t, state);
    if (beat.index === 1) {
      S.drawTurkeyInCorner(ctx, 162, 502, 1.1, t, { dispatch: S.smooth(0.05, 0.45, u) });
      if (!snailOver4) {
        S.drawMailSnail(ctx, S.lerp(255, 920, u), 534 + Math.sin(u * Math.PI * 4) * 5, 1.2, t, { hasReply: false });
      }
    } else if (beat.index === 2) {
      // Brook Trout swims in from LEFT ledge (just like p54.jpg!)
      S.drawBrookTrout(ctx, 285 + Math.sin(u * Math.PI) * 55, 322 + Math.cos(t * 2.4) * 8, 1.06, t, true);
      if (!snailOver4) {
        S.drawMailSnail(ctx, 1118, S.lerp(515, 175, u), 1.16, t, { rot: -Math.PI * 0.5, hasReply: true });
      }
    } else if (beat.index === 3) {
      S.drawAlienSaucer(ctx, 615, 102, 1.22, t, spine[0].x, spine[0].y, { beamSpread: 155 });
      if (!snailOver4) {
        S.drawMailSnail(ctx, S.lerp(1040, 785, u), 132, 1.08, t, { flip: true, hasReply: true, hasAlienStamp: true });
      }
    } else {
      S.drawBrookTrout(ctx, 255 + px2 * 0.5, 308 + py2 * 0.5, 0.94, t, true);
    }

    drawBallastBubbles(ctx, S, W, H, t, state, 54, "rgba(240,242,238,0.70)");
    S.endCamera(ctx);

    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 54);
  }

  // ============================================================================
  // PORTHOLE #55 · EDDY  (Finale of all 55 Portholes!)
  // bolasStyle: "queneau-rostrum" | SCION System Instruction Compiler · S54 Provenance
  // Plates: ./portholes/p55.jpg (640x640) + ./assets/atlas-stills/atlas-06.webp (382x680)
  //   A: A corked brass tube of postcards
  //   B: An angry landlord’s eviction note
  //   C: The lost dead-letter creek dropbox
  //   D: A message pod from 54 galaxies
  // ============================================================================
  function renderPortal55(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var u = beat.u;
    var lt = beat.localT;
    var plates = S.getPortalPlates(55);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    // 1. Warm Buttercream Queneau Rostrum Paper + Giant Pale Watermark + Torn-Deckle Green Floor!
    // (Exact register of exercices-de-style.webp!)
    S.drawBolasBackdrop(ctx, W, H, "queneau-rostrum", S.getStack(55) && S.getStack(55).directorSwarm.palette, t, state, {
      floor: true
    });

    S.beginCamera(ctx, W, H, t, { state: state, pushDur: 0.65 });

    var px1 = S.parallaxX(0.20, t, state), py1 = S.parallaxY(0.20, t, state);
    var px2 = S.parallaxX(0.48, t, state), py2 = S.parallaxY(0.48, t, state);
    var px3 = S.parallaxX(0.76, t, state), py3 = S.parallaxY(0.76, t, state);

    // 2. Right Torn-Deckle Architectural Dispatch Window framing atlas-06.webp ("The Fish Don't Negotiate")
    // Modeled directly on the torn-edge SERVICE door in exercices-de-style.webp (with 0 text!)
    var doorX = 955 + px1;
    var doorY = 64 + py1;
    S.drawTornPaperFlat(ctx, doorX, doorY, 245, 455, {
      fill: "#263a19",
      paperColor: "#f2ece0",
      deckle: 7.5
    });
    S.drawScissorCutout(
      ctx, aImg,
      14, 168, 354, 415,
      doorX + 22, doorY + 86, 200, 265,
      [[0.04, 0.04], [0.96, 0.03], [0.95, 0.96], [0.05, 0.95]],
      { filter: "sepia", haloWidth: 4.0 }
    );
    // Cream torn-paper emblem plaque above door window (envelope seal icon — 0 text!)
    S.drawTornPaperFlat(ctx, doorX + 52, doorY + 24, 140, 38, {
      fill: "#eae3d2",
      deckle: 3.0,
      shadow: false
    });
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 1.8;
    ctx.strokeRect(doorX + 96, doorY + 32, 52, 22);
    ctx.beginPath();
    ctx.moveTo(doorX + 96, doorY + 32);
    ctx.lineTo(doorX + 122, doorY + 45);
    ctx.lineTo(doorX + 148, doorY + 32);
    ctx.stroke();

    // 3. Swirling Teal Eddy Current Scissor-Cutouts from p55.jpg on multiplane cards
    S.drawScissorCutout(
      ctx, pImg,
      138, 152, 148, 305,
      82 + px2, 88 + py2, 245, 410,
      [[0.12, 0.04], [0.88, 0.08], [0.76, 0.52], [0.92, 0.92], [0.14, 0.95], [0.04, 0.48]],
      { haloWidth: 4.8 }
    );
    S.drawScissorCutout(
      ctx, pImg,
      362, 148, 142, 302,
      682 + px2, 96 + py2, 238, 385,
      [[0.08, 0.06], [0.90, 0.04], [0.95, 0.52], [0.84, 0.94], [0.12, 0.90]],
      { haloWidth: 4.8 }
    );

    if (beat.lampOn) {
      S.drawLampBeam(ctx, W, H, t, state, { x: 520, y: 560, aimX: 500, spread: 260, alpha: 0.15 });
    }

    // 4. Centerpiece Foraged + Handmade Corked Brass & Glass Specimen Tube (matching p55.jpg!)
    var tubeX = 498 + px3 * 0.6;
    var tubeY = 308 + py3 * 0.6 + Math.sin(t * 2.2) * 6;
    var tubeAng = -0.58 + Math.sin(t * 1.5) * 0.04 + (beat.index === 3 ? 0.58 : 0);

    // Beat D Solar-Vane Brass Petals unfolding behind tube!
    if (beat.index === 3) {
      var vaneOpen = S.spring(lt, 0.15, 9.0, 4.0);
      for (var vp = 0; vp < 4; vp++) {
        var vSign = (vp < 2) ? -1 : 1;
        var vRow = (vp % 2 === 0) ? -48 : 48;
        ctx.save();
        ctx.translate(tubeX + vSign * 58, tubeY + vRow);
        ctx.rotate(vSign * (0.25 + vaneOpen * 0.52) + (vp % 2 === 0 ? -0.18 : 0.18));
        S.drawCutoutPaperEdge(
          ctx,
          [[0, -16], [vSign * 138, -28], [vSign * 148, 28], [0, 16]],
          "#0f8f80",
          "#14110d",
          { paperRim: 3.0 }
        );
        S.drawSplitPin(ctx, 0, 0, 4.5, { metal: "brass" });
        ctx.restore();
      }
    }

    // Draw Tilted Brass & Glass Tube + Real Cropped Rolled Scrolls from p55.jpg!
    ctx.save();
    ctx.translate(tubeX, tubeY);
    ctx.rotate(tubeAng);

    // Scissor-cut glass body containing real rolled scrolls from p55.jpg!
    S.drawScissorCutout(
      ctx, pImg,
      222, 212, 196, 228,
      -74, -108, 148, 216,
      [[0.04, 0.04], [0.96, 0.04], [0.96, 0.96], [0.04, 0.96]],
      { haloWidth: 5.0, stroke: "#14110d", lineWidth: 2.2 }
    );

    // Translucent glass highlight stripes
    ctx.fillStyle = "rgba(255, 255, 255, 0.36)";
    ctx.fillRect(-52, -96, 16, 192);
    ctx.fillRect(34, -96, 7, 192);

    // Upper & Lower Riveted Brass End-Collars (exact p55.jpg geometry!)
    S.drawCutoutPaperEdge(
      ctx,
      [[-84, -132], [84, -132], [88, -94], [-88, -94]],
      "#d4a44c",
      "#14110d",
      { paperRim: 3.0 }
    );
    S.drawCutoutPaperEdge(
      ctx,
      [[-88, 94], [88, 94], [82, 134], [-82, 134]],
      "#b88632",
      "#14110d",
      { paperRim: 3.0 }
    );
    S.drawSplitPin(ctx, -56, -113, 4.2, { metal: "brass" });
    S.drawSplitPin(ctx, 56, -113, 4.2, { metal: "brass" });
    S.drawSplitPin(ctx, -56, 113, 4.2, { metal: "brass" });
    S.drawSplitPin(ctx, 56, 113, 4.2, { metal: "brass" });

    // Articulated Split-Pin Cork Stopper popping open!
    var corkPop = (beat.index === 0) ? S.spring(lt, 0.85, 11.0, 4.0) : 1.0;
    ctx.save();
    ctx.translate(-corkPop * 34, -148 - corkPop * 46);
    ctx.rotate(-corkPop * 0.42);
    S.drawCardboardPuppetPiece(
      ctx,
      [[-54, -28], [54, -28], [46, 20], [-46, 20]],
      { tone: "#b88752", ribs: 2, pin: { x: 0, y: 8, r: 4.2, metal: "brass" } }
    );
    ctx.restore();

    ctx.restore();

    // 5. 4-Beat Variations around the Uncorked Tube!
    if (beat.index === 0) {
      // VARIATION I (A): "A corked brass tube of postcards"
      // Golden spiral of 12 miniature stamped porthole postcards emerging after cork pops!
      var emerge = S.smooth(0.85, 2.8, lt);
      if (emerge > 0.02) {
        var colors = ["#d42a1e", "#1d596e", "#0f8f80", "#a6782a"];
        for (var pc = 0; pc < 12; pc++) {
          var pu = S.clamp((emerge * 1.35) - pc * 0.06, 0, 1);
          if (pu <= 0) continue;
          var angP = -2.2 + pc * 0.52 + t * 0.7;
          var radP = 65 + pu * (95 + (pc % 3) * 42);
          var cxCard = tubeX + Math.cos(angP) * radP;
          var cyCard = tubeY - 20 + Math.sin(angP) * (radP * 0.62);
          drawStampCardIcon(ctx, S, cxCard, cyCard, 54, 38, Math.sin(t * 2 + pc) * 0.22, colors[pc % 4], pc % 3 === 0 ? "tri" : "circle");
        }
      }

    } else if (beat.index === 1) {
      // VARIATION II (B): "An angry landlord’s eviction note"
      // Tribute to bowler-hat gentleman in exercices-de-style.webp: jointed charcoal sleeve + tall wax-sealed scroll!
      var unroll = S.spring(lt, 0.2, 10.0, 4.2);
      var scrollX = 768;
      var scrollY = 178;
      var scrollH = S.clamp(70 + unroll * 265, 70, 345);

      // Jointed Charcoal Landlord Arm pointing sternly at the eviction scroll (IK)!
      var lArm = S.solveIK2(975, 295, 118, 108, scrollX + 68, scrollY + scrollH * 0.45 + Math.sin(t * 6.5) * 14, -1);
      drawLimbSegment(ctx, S, 975, 295, lArm.jx, lArm.jy, 20, 16, "#232426", "silver", "silver");
      drawLimbSegment(ctx, S, lArm.jx, lArm.jy, lArm.ex, lArm.ey, 15, 11, "#232426", "silver", "brass");

      // Tall Unrolling Parchment Scroll with Crimson Wax Ribbon Seal & Bold Ink Strokes (0 text!)
      S.drawCutoutPaperEdge(
        ctx,
        [[scrollX - 88, scrollY], [scrollX + 88, scrollY], [scrollX + 92, scrollY + scrollH], [scrollX - 92, scrollY + scrollH]],
        "#fbfaf5",
        "#14110d",
        { paperRim: 4.0, lineWidth: 2.4 }
      );
      // Top & bottom rolled scroll cylinders
      S.drawCutoutPaperEdge(ctx, [[scrollX - 102, scrollY - 12], [scrollX + 102, scrollY - 12], [scrollX + 102, scrollY + 12], [scrollX - 102, scrollY + 12]], "#e6d8b5", "#14110d", { paperRim: 2.0 });
      S.drawCutoutPaperEdge(ctx, [[scrollX - 104, scrollY + scrollH - 12], [scrollX + 104, scrollY + scrollH - 12], [scrollX + 104, scrollY + scrollH + 12], [scrollX - 104, scrollY + scrollH + 12]], "#e6d8b5", "#14110d", { paperRim: 2.0 });

      // Stern red ink warning triangle + ruled scribbles + dangling crimson wax seal (0 text!)
      if (scrollH > 160) {
        ctx.fillStyle = "#d42a1e";
        ctx.beginPath();
        ctx.moveTo(scrollX, scrollY + 34);
        ctx.lineTo(scrollX + 26, scrollY + 78);
        ctx.lineTo(scrollX - 26, scrollY + 78);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#fbfaf5";
        ctx.fillRect(scrollX - 3, scrollY + 48, 6, 16);
        ctx.fillRect(scrollX - 3, scrollY + 68, 6, 5);

        ctx.strokeStyle = "#14110d";
        ctx.lineWidth = 3.0;
        for (var sl = 0; sl < 5; sl++) {
          var syLine = scrollY + 105 + sl * 28;
          if (syLine > scrollY + scrollH - 42) break;
          ctx.beginPath();
          ctx.moveTo(scrollX - 64, syLine);
          ctx.lineTo(scrollX + (sl % 2 === 0 ? 62 : 36), syLine);
          ctx.stroke();
        }

        // Dangling ribbon & big crimson wax seal
        var sealY = scrollY + scrollH - 28;
        ctx.fillStyle = "#d42a1e";
        ctx.beginPath();
        ctx.moveTo(scrollX + 42, sealY);
        ctx.lineTo(scrollX + 30, sealY + 46);
        ctx.lineTo(scrollX + 42, sealY + 36);
        ctx.lineTo(scrollX + 54, sealY + 46);
        ctx.closePath();
        ctx.fill();
        S.drawCutoutPaperEdge(
          ctx,
          [[scrollX + 24, sealY - 12], [scrollX + 42, sealY - 20], [scrollX + 60, sealY - 12], [scrollX + 58, sealY + 10], [scrollX + 26, sealY + 10]],
          "#d42a1e",
          "#14110d",
          { paperRim: 2.0 }
        );
      }

    } else if (beat.index === 2) {
      // VARIATION III (C): "The lost dead-letter creek dropbox"
      // Riveted Olive-Cardboard & Brass Creek Postal Dropbox with hinged chute door!
      var boxX = 795;
      var boxY = 355;
      S.drawCardboardPuppetPiece(
        ctx,
        [[boxX - 20, boxY + 95], [boxX + 20, boxY + 95], [boxX + 24, 562], [boxX - 24, 562]],
        { tone: "#5c5f58", ribs: 2 }
      );
      S.drawCardboardPuppetPiece(
        ctx,
        [[boxX - 78, boxY + 98], [boxX - 78, boxY - 68], [boxX - 42, boxY - 112], [boxX + 42, boxY - 112], [boxX + 78, boxY - 68], [boxX + 78, boxY + 98]],
        { tone: "#3b5949", ribs: 3, pins: [[boxX - 58, boxY + 78], [boxX + 58, boxY + 78]] }
      );
      // Hinged Brass Chute Flap opening & closing as postcards feed in!
      var chuteOpen = 0.25 + Math.abs(Math.sin(t * 4.5)) * 0.55;
      ctx.save();
      ctx.translate(boxX - 62, boxY - 48);
      ctx.rotate(-chuteOpen);
      S.drawCutoutPaperEdge(ctx, [[0, -14], [116, -14], [122, 18], [0, 18]], "#d4a44c", "#14110d", { paperRim: 2.2 });
      S.drawSplitPin(ctx, 8, 0, 4.5, { metal: "brass" });
      ctx.restore();

      // Postcards flying along arc from brass tube right into the dropbox chute!
      for (var fc = 0; fc < 5; fc++) {
        var fu2 = ((lt * 0.62 + fc * 0.2) % 1);
        var fxC = S.lerp(tubeX + 42, boxX - 8, fu2);
        var fyC = S.lerp(tubeY - 48, boxY - 48, fu2) - Math.sin(fu2 * Math.PI) * 85;
        drawStampCardIcon(ctx, S, fxC, fyC, 48, 34, fu2 * 1.8, fc % 2 === 0 ? "#0f8f80" : "#d42a1e", "circle");
      }

    } else {
      // VARIATION IV (D): "A message pod from 54 galaxies"
      // 54 miniature stamped paper constellation cards orbiting the probe in 3 harmonic rings!
      var ringCounts = [14, 18, 22]; // 14 + 18 + 22 = 54 galaxies / 54 prior portholes!
      var ringRadii = [142, 212, 286];
      var stampPalette = ["#d42a1e", "#0f8f80", "#1d596e", "#a6782a"];
      for (var rg = 0; rg < 3; rg++) {
        var nCards = ringCounts[rg];
        var rRx = ringRadii[rg];
        var rRy = rRx * 0.44;
        var dirR = rg % 2 === 0 ? 1 : -1;
        for (var ci2 = 0; ci2 < nCards; ci2++) {
          var ca = (ci2 / nCards) * TAU + t * 0.55 * dirR + rg * 0.4;
          var cardX = tubeX + Math.cos(ca) * rRx;
          var cardY = tubeY + Math.sin(ca) * rRy;
          drawStampCardIcon(ctx, S, cardX, cardY, 32, 22, Math.sin(ca) * 0.25, stampPalette[(ci2 + rg) % 4], "tri");
        }
      }
    }

    // 6. Couriers across Beats A, B, C, D
    var snailOver5 = drawInteractiveSnailOverride(ctx, S, W, H, t, state);
    if (beat.index === 1) {
      S.drawTurkeyInCorner(ctx, 152, 504, 1.12, t, { dispatch: S.smooth(0.05, 0.45, u) });
      if (!snailOver5) {
        S.drawMailSnail(ctx, S.lerp(248, 935, u), 558 + Math.sin(u * Math.PI * 4) * 4, 1.22, t, { hasReply: false });
      }
    } else if (beat.index === 2) {
      S.drawBrookTrout(ctx, 965 - Math.sin(t * 2.4) * 18, 338 + Math.cos(t * 2.6) * 8, 1.06, t, false);
      if (!snailOver5) {
        S.drawMailSnail(ctx, 1142, S.lerp(525, 168, u), 1.18, t, { rot: -Math.PI * 0.5, hasReply: true });
      }
    } else if (beat.index === 3) {
      S.drawAlienSaucer(ctx, 502, 98, 1.24, t, tubeX, tubeY, { beamSpread: 168 });
      if (!snailOver5) {
        S.drawMailSnail(ctx, S.lerp(1060, 745, u), 132, 1.1, t, { flip: true, hasReply: true, hasAlienStamp: true });
      }
    } else {
      // Peeking Brook Trout on right in Beat A (matching p55.jpg!)
      S.drawBrookTrout(ctx, 928 + px2 * 0.4, 304 + py2 * 0.4, 0.96, t, false);
    }

    drawBallastBubbles(ctx, S, W, H, t, state, 55, "rgba(251,250,245,0.85)");
    S.endCamera(ctx);

    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 55);
  }

  // ---------- Register Crew 11 Scenes (#51–#55) ----------
  var SCENES = {
    51: {
      id: 51,
      station: "#51 · Grotto",
      duration: 16.0,
      bolasStyle: "daumier-litho",
      preload: function () { var s = getStage(); return s ? s.preloadPortalPlates(51) : Promise.resolve(); },
      render: renderPortal51
    },
    52: {
      id: 52,
      station: "#52 · Bridge",
      duration: 16.0,
      bolasStyle: "cardboard-parallax",
      preload: function () { var s = getStage(); return s ? s.preloadPortalPlates(52) : Promise.resolve(); },
      render: renderPortal52
    },
    53: {
      id: 53,
      station: "#53 · Flume",
      duration: 16.0,
      bolasStyle: "cardboard-parallax",
      preload: function () { var s = getStage(); return s ? s.preloadPortalPlates(53) : Promise.resolve(); },
      render: renderPortal53
    },
    54: {
      id: 54,
      station: "#54 · Ledge",
      duration: 16.0,
      bolasStyle: "cardboard-parallax",
      preload: function () { var s = getStage(); return s ? s.preloadPortalPlates(54) : Promise.resolve(); },
      render: renderPortal54
    },
    55: {
      id: 55,
      station: "#55 · Eddy",
      duration: 16.0,
      bolasStyle: "queneau-rostrum",
      preload: function () { var s = getStage(); return s ? s.preloadPortalPlates(55) : Promise.resolve(); },
      render: renderPortal55
    }
  };

  if (root) {
    root.PORTAL_REMAKE_SCENES = root.PORTAL_REMAKE_SCENES || {};
    for (var k in SCENES) {
      if (Object.prototype.hasOwnProperty.call(SCENES, k)) {
        root.PORTAL_REMAKE_SCENES[k] = SCENES[k];
      }
    }
  }
  if (typeof window !== "undefined" && window !== root) {
    window.PORTAL_REMAKE_SCENES = window.PORTAL_REMAKE_SCENES || {};
    for (var kw in SCENES) {
      if (Object.prototype.hasOwnProperty.call(SCENES, kw)) {
        window.PORTAL_REMAKE_SCENES[kw] = SCENES[kw];
      }
    }
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = SCENES;
  }
})(typeof window !== "undefined" ? window : globalThis);
