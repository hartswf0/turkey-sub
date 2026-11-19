/* ============================================================================
 * Turkey Sub · Multi-SCION Rostrum Remake Crew 08 (#36–#40)
 * File: portals/remake-08.js  (window.PORTAL_REMAKE_SCENES[36..40])
 *
 * 16.0s (384 frames @ 24fps, 1280×720) 4-Variation BOLAS Oulipo Screening Room
 * Cutout, Lithograph, Proscenium & Optical-Rotor Cinema:
 *   - #36 · Bench    : "daumier-litho"   (Menu & Trondheim × S03 Ernst/Zeman × atlas-15)
 *   - #37 · Bulkhead : "queneau-rostrum" (Lécroart Folded Map × S10 MLS Origami × atlas-26)
 *   - #38 · Visor    : "queneau-rostrum" (Le Maki Mococo × S49 Royal Robertson × atlas-37)
 *   - #39 · Parlor   : "perec-stage"     (Les Lieux d'une fugue × S05 Norstein × atlas-24)
 *   - #40 · Reef     : "duchamp-optic"   (Outrapo Reversible Tape × S07 Foldès × atlas-25)
 *
 * CRITICAL PAELEO INVARIANT:
 *   Emits ZERO fillText / strokeText calls and ZERO HUD / speech-balloon chrome
 *   whenever state && state.showCaptions === false!
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var DURATION = 16.0;

  function getStage() {
    return (root && root.SCION_STAGE) || (typeof window !== "undefined" && window.SCION_STAGE) || null;
  }

  // ---------- Shared Tactile Helpers (100% Vector / Cutout, ZERO Direct Text!) ----------

  function drawJointedCardLimb(ctx, S, ik, w1, w2, tone1, tone2, metal) {
    var ux1 = Math.cos(ik.a1), uy1 = Math.sin(ik.a1);
    var nx1 = -uy1, ny1 = ux1;
    var hw1 = w1 * 0.5;
    S.drawCardboardPuppetPiece(ctx, [
      [ik.x0 + nx1 * hw1, ik.y0 + ny1 * hw1],
      [ik.jx + nx1 * (hw1 * 0.86), ik.jy + ny1 * (hw1 * 0.86)],
      [ik.jx - nx1 * (hw1 * 0.86), ik.jy - ny1 * (hw1 * 0.86)],
      [ik.x0 - nx1 * hw1, ik.y0 - ny1 * hw1]
    ], { tone: tone1 || "#8c8982", ribs: 2 });

    var ux2 = Math.cos(ik.a2), uy2 = Math.sin(ik.a2);
    var nx2 = -uy2, ny2 = ux2;
    var hw2 = w2 * 0.5;
    S.drawCardboardPuppetPiece(ctx, [
      [ik.jx + nx2 * hw2, ik.jy + ny2 * hw2],
      [ik.ex + nx2 * (hw2 * 0.78), ik.ey + ny2 * (hw2 * 0.78)],
      [ik.ex - nx2 * (hw2 * 0.78), ik.ey - ny2 * (hw2 * 0.78)],
      [ik.jx - nx2 * hw2, ik.jy - ny2 * hw2]
    ], {
      tone: tone2 || "#a39f96",
      ribs: 2,
      pins: [
        { x: ik.x0, y: ik.y0, r: 4.8, metal: metal || "brass" },
        { x: ik.jx, y: ik.jy, r: 4.4, metal: "silver" }
      ]
    });
  }

  function drawRisingBubbles(ctx, S, t, state, count, xMin, xMax, yBase, yTop, color) {
    var extra = (state && state.ballast) ? 10 : 0;
    var n = (count || 12) + extra;
    ctx.save();
    ctx.strokeStyle = color || "rgba(245, 250, 248, 0.58)";
    ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = 1.6;
    for (var i = 0; i < n; i++) {
      var h1 = S.hash(i * 13.7 + 2.1);
      var h2 = S.hash(i * 29.3 + 7.9);
      var speed = 0.22 + h2 * 0.28 + (extra ? 0.14 : 0);
      var u = (t * speed + h1) % 1;
      var bx = S.lerp(xMin, xMax, h1) + Math.sin(t * 2.2 + i * 1.7) * 14;
      var by = S.lerp(yBase, yTop, u);
      var br = 2.6 + h2 * 5.2;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawInteractiveSnailOverride(ctx, S, W, H, t, state, beat) {
    if (!state || !state.snailActive) return;
    if (beat.index === 1 || beat.index === 2) return; // already staged in Beats B & C
    var su = (typeof state.snailT === "number") ? S.clamp(state.snailT, 0, 1) : ((t * 0.35) % 1);
    var sx = S.lerp(180, W - 180, su);
    var sy = 540 - Math.sin(su * Math.PI) * 28;
    S.drawMailSnail(ctx, sx, sy, 1.22, t, {
      hasReply: su > 0.5,
      hasAlienStamp: su > 0.8
    });
  }

  function applyLampOffDimmer(ctx, W, H, state, strength) {
    if (state && state.lamp === false) {
      ctx.save();
      ctx.fillStyle = "rgba(8, 10, 14, " + (strength || 0.38) + ")";
      ctx.fillRect(-30, -30, W + 60, H + 60);
      ctx.restore();
    }
  }

  function drawQueneauRansomBanner(ctx, S, words, x, y, state) {
    if (S.isBlind(state)) return;
    ctx.save();
    var cx = x;
    var fonts = [
      '800 32px Georgia, "Times New Roman", serif',
      '900 30px "Big Shoulders Display", Impact, sans-serif',
      'italic 700 31px Georgia, serif',
      '700 26px "JetBrains Mono", monospace'
    ];
    var cols = ["#d42a1e", "#14110d", "#1d596e", "#14110d"];
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      ctx.save();
      var tilt = (S.hash(i * 7.3 + x * 0.1) - 0.5) * 0.12;
      var dy = (S.hash(i * 11.9) - 0.5) * 6;
      ctx.font = fonts[i % fonts.length];
      var tw = ctx.measureText(w).width;
      ctx.translate(cx + tw * 0.5, y + dy);
      ctx.rotate(tilt);
      // Cut-paper ransom slip under every other word
      if (i % 2 === 0) {
        ctx.fillStyle = "#fbfaf5";
        ctx.fillRect(-tw * 0.5 - 5, -24, tw + 10, 34);
        ctx.strokeStyle = "rgba(20,17,13,0.22)";
        ctx.lineWidth = 1;
        ctx.strokeRect(-tw * 0.5 - 5, -24, tw + 10, 34);
      }
      ctx.fillStyle = cols[i % cols.length];
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      S.safeText(ctx, w, 0, 0, state);
      ctx.restore();
      cx += tw + 14;
    }
    ctx.restore();
  }

  // ============================================================================
  // PORTHOLE #36 · BENCH ("daumier-litho")
  // Menu & Trondheim "Moins d'un quart de seconde" × S03 Max Ernst / Karel Zeman
  // Immovable etched hound clamping its sealed letter on an ink cinema band while
  // the entire world swaps around it across 4 variations!
  // ============================================================================
  function renderPortal36(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var u = beat.u;
    var plates = S.getPortalPlates(36);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;
    var rollBounce = beat.roll ? S.springImpulse(t % 2.0, 0.05, 16, 4.5) * 10 : 0;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.0 });

    // 1. Stark Cream Lithographic Paper + Wide Ink-Black Cinema Band (boucle-la.webp!)
    var bandTop = 106;
    var bandBot = 588;
    S.drawBolasBackdrop(ctx, W, H, "daumier-litho", null, t, state, {
      bandTop: bandTop,
      bandBot: bandBot
    });

    // Zeman nineteenth-century engraved border rules on top & bottom white margins (dresses y=588..720 for blind mode!)
    ctx.save();
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.2;
    ctx.strokeRect(36, 26, W - 72, 64);
    ctx.strokeRect(36, bandBot + 16, W - 72, H - bandBot - 36);
    S.drawEngravingCrosshatch(ctx, W - 84, 52, 0.12, 6, { x: 42, y: 32 });
    S.drawEngravingCrosshatch(ctx, W - 84, H - bandBot - 48, 0.14, 6, { x: 42, y: bandBot + 22 });
    // Engraved corner rosettes on margin rules
    var corners = [[56, 58], [W - 56, 58], [56, bandBot + 52], [W - 56, bandBot + 52]];
    for (var ci = 0; ci < corners.length; ci++) {
      S.drawReinigerFiligreeHinge(ctx, corners[ci][0], corners[ci][1], 7.5, { metal: "silver" });
    }
    ctx.restore();

    var pxFar = S.parallaxX(0.22, t, state);
    var pyFar = S.parallaxY(0.22, t, state);
    var pxMid = S.parallaxX(0.52, t, state);
    var pyMid = S.parallaxY(0.52, t, state);
    var pxFg  = S.parallaxX(0.88, t, state);

    // Clip dynamic world swaps cleanly inside the wide ink-black cinema band
    ctx.save();
    ctx.beginPath();
    ctx.rect(-20, bandTop, W + 40, bandBot - bandTop);
    ctx.clip();

    // Subtle white-ink Zeman horizontal sky engraving lines on the black band
    S.drawEngravingCrosshatch(ctx, W, 170, 0.12, 9, { x: 0, y: bandTop + 8, color: "#fbfaf5" });

    // ---------- 2. S43 Collage Graph Rewriting: 4 Complete World Swaps Around Hound ----------
    if (beat.index === 0) {
      // VARIATION I (A): "A hound statue holding a letter" — Creek Bench & Zeman Planking
      S.drawScissorCutout(
        ctx, aImg, 285, 0, 365, 225,
        140 + pxFar, bandTop + 18 + pyFar, 420, 220,
        [[0.04, 0.06], [0.95, 0.03], [0.98, 0.92], [0.03, 0.96]],
        { filter: "litho", haloWidth: 4.0, alpha: 0.78, rot: -0.02 }
      );
      // Slatted Park Bench Cutout from p36.jpg behind hound
      S.drawScissorCutout(
        ctx, pImg, 146, 212, 315, 172,
        305 + pxMid, 246 + pyMid, 620, 250,
        [[0.03, 0.08], [0.50, 0.04], [0.96, 0.10], [0.98, 0.94], [0.02, 0.95]],
        { filter: "litho", haloWidth: 5.0 }
      );
      // River stones & swaying cut-paper weeds left & right (cropped strictly above corner reflection!)
      S.drawScissorCutout(
        ctx, pImg, 114, 248, 96, 124,
        145 + pxFg, 392, 205, 175,
        [[0.08, 0.12], [0.65, 0.04], [0.96, 0.45], [0.92, 0.96], [0.04, 0.94]],
        { filter: "litho", haloWidth: 4.5 }
      );
      S.drawScissorCutout(
        ctx, pImg, 402, 348, 112, 134,
        895 + pxFg, 388, 210, 180,
        [[0.12, 0.06], [0.92, 0.14], [0.96, 0.95], [0.05, 0.94]],
        { filter: "litho", haloWidth: 4.5 }
      );
      // Hinged split-pin cardboard kelp blades swaying in current
      for (var kb = 0; kb < 4; kb++) {
        var kx = (kb < 2 ? 225 + kb * 48 : 920 + (kb - 2) * 54) + pxFg;
        var sway = Math.sin(t * 2.1 + kb * 1.4) * 0.16;
        ctx.save();
        ctx.translate(kx, 548);
        ctx.rotate(sway);
        S.drawCardboardPuppetPiece(ctx, [
          [-10, 0], [-16, -95], [0, -148], [14, -90], [10, 0]
        ], { tone: "#d8d5cc", stroke: "#0b0c0e", ribs: 3, pin: { x: 0, y: -6, r: 4.2, metal: "silver" } });
        ctx.restore();
      }
      S.drawWaterCaustics(ctx, W, bandBot, t, 0.22, { color: "rgba(251,250,245,0.26)" });
      drawRisingBubbles(ctx, S, t, state, 14, 180, 1100, 560, 130, "rgba(251,250,245,0.65)");
    } else if (beat.index === 1) {
      // VARIATION II (B): "The Governor’s Thanksgiving pardon" + Snail Mail Out!
      var dropIn = S.spring(beat.localT, 0.0, 12, 4.8);
      // Engraved Victorian Capitol Columns & Lace Witness from atlas-15.webp
      S.drawScissorCutout(
        ctx, aImg, 315, 24, 330, 388,
        835 + pxFar, 136 + pyFar, 300, 385,
        [[0.15, 0.04], [0.86, 0.04], [0.96, 0.96], [0.05, 0.96]],
        { filter: "litho", haloWidth: 4.5 }
      );
      // Twin Fluted Capitol Pillars with white scissor halos
      var colXs = [215 + pxMid, 975 + pxMid];
      for (var p = 0; p < 2; p++) {
        S.drawCutoutPaperEdge(ctx, [
          [colXs[p] - 44, bandTop + 8],
          [colXs[p] + 44, bandTop + 8],
          [colXs[p] + 38, 562],
          [colXs[p] - 38, 562]
        ], "#e8e4da", "#0b0c0e", { paperRim: 4.5 });
        S.drawEngravingCrosshatch(ctx, 64, 430, 0.35, 7, { x: colXs[p] - 32, y: bandTop + 20 });
      }
      // Scalloped Crimson-and-Cream State Swag Curtain dropping from top of band
      var curtY = bandTop - 40 + 44 * dropIn;
      S.drawCutoutPaperEdge(ctx, [
        [150, curtY], [1130, curtY], [1100, curtY + 78],
        [860, curtY + 52], [640, curtY + 86], [420, curtY + 52], [180, curtY + 78]
      ], "#b8291e", "#0b0c0e", { paperRim: 4.5 });

      // Articulated 2-Bone IK Governor's Cuffed Arm & Quill stamping the hound's letter!
      var stampX = 684 + Math.sin(t * 4.2) * 14;
      var stampY = 338 + Math.cos(t * 4.2) * 10;
      var govIK = S.solveIK2(170, 290, 275, 265, stampX - 48, stampY - 12, -1);
      drawJointedCardLimb(ctx, S, govIK, 44, 36, "#4a4946", "#dcd8ce", "brass");
      // Lace cuff & feathered quill at end of Governor's hand
      ctx.save();
      ctx.translate(govIK.ex, govIK.ey);
      ctx.rotate(Math.sin(t * 5.0) * 0.14 - 0.25);
      S.drawCutoutPaperEdge(ctx, [[-12, -14], [28, -8], [26, 12], [-12, 14]], "#fbfaf5", "#0b0c0e", { paperRim: 3 });
      S.drawCutoutPaperEdge(ctx, [[18, -6], [96, -74], [112, -58], [30, 4]], "#f3d184", "#0b0c0e", { paperRim: 2.5 });
      ctx.restore();
    } else if (beat.index === 2) {
      // VARIATION III (C): "A shiny brass creekside mailbox" + Brook Trout & Snail Reply!
      var hoodOpen = S.spring(beat.localT, 0.05, 11, 4.4);
      // Creek reed bank cutouts behind mailbox (cropped strictly above corner reflection!)
      S.drawScissorCutout(
        ctx, pImg, 114, 248, 96, 124,
        130 + pxMid, 390, 215, 178,
        null, { filter: "litho", haloWidth: 4.0 }
      );
      // Sturdy Wooden Mailbox Post & Riveted Arched Brass Mailbox Shell enclosing the hound!
      S.drawCardboardPuppetPiece(ctx, [
        [595 + pxMid, 460], [675 + pxMid, 460], [685 + pxMid, 588], [585 + pxMid, 588]
      ], { tone: "#6b5335", ribs: 3 });

      var mbX = 445 + pxMid;
      var mbY = 152 - (1 - hoodOpen) * 60;
      S.drawCutoutPaperEdge(ctx, [
        [mbX, mbY + 335],
        [mbX, mbY + 95],
        [mbX + 55, mbY + 22],
        [mbX + 195, mbY],
        [mbX + 335, mbY + 22],
        [mbX + 390, mbY + 95],
        [mbX + 390, mbY + 335]
      ], "#d4a44c", "#0b0c0e", { paperRim: 5.5 });
      // Dark interior tunnel of brass mailbox so the white-halo hound sits inside the open brass arch!
      ctx.fillStyle = "#141210";
      ctx.beginPath();
      ctx.moveTo(mbX + 26, mbY + 325);
      ctx.lineTo(mbX + 26, mbY + 108);
      ctx.quadraticCurveTo(mbX + 195, mbY + 18, mbX + 364, mbY + 108);
      ctx.lineTo(mbX + 364, mbY + 325);
      ctx.closePath();
      ctx.fill();
      // Brass rivets along mailbox arch
      for (var mr = 0; mr <= 6; mr++) {
        var ang = Math.PI + (mr / 6) * Math.PI;
        S.drawSplitPin(ctx, mbX + 195 + Math.cos(ang) * 176, mbY + 112 + Math.sin(ang) * 92, 5.0, { metal: "brass" });
      }
      // Hinged Red Signal Flag snapping UP on a split-pin!
      var flagAng = S.lerp(1.45, -0.08, S.spring(beat.localT, 0.25, 13, 4.0)) + Math.sin(t * 4.5) * 0.04;
      ctx.save();
      ctx.translate(mbX + 388, mbY + 205);
      ctx.rotate(flagAng);
      S.drawCutoutPaperEdge(ctx, [
        [-7, 8], [-7, -128], [46, -128], [34, -104], [46, -80], [9, -80], [9, 8]
      ], "#d42a1e", "#0b0c0e", { paperRim: 3.5 });
      S.drawSplitPin(ctx, 0, 0, 5.5, { metal: "brass" });
      ctx.restore();

      drawRisingBubbles(ctx, S, t, state, 12, 160, 1120, 560, 140, "rgba(251,250,245,0.55)");
    } else {
      // VARIATION IV (D): "A messenger from the Dog Star" — Sirius Astrolabe & Zeman Bubble Tubes!
      // Zeman Glass Laboratory Bubble Columns left & right from atlas-15.webp!
      S.drawScissorCutout(
        ctx, aImg, 88, 0, 210, 416,
        105 + pxFar, bandTop + 10, 240, 462,
        [[0.06, 0.02], [0.92, 0.03], [0.95, 0.98], [0.04, 0.97]],
        { filter: "litho", haloWidth: 4.0 }
      );
      S.drawScissorCutout(
        ctx, aImg, 88, 0, 210, 416,
        935 - pxFar, bandTop + 10, 240, 462,
        [[0.06, 0.02], [0.92, 0.03], [0.95, 0.98], [0.04, 0.97]],
        { filter: "litho", haloWidth: 4.0 }
      );

      // Rotating Engraved Canis Major / Sirius Celestial Astrolabe behind Hound
      ctx.save();
      ctx.translate(636, 336);
      ctx.rotate(t * 0.28);
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, 205, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([10, 7]);
      ctx.beginPath();
      ctx.arc(0, 0, 168, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      // 12-point Blazing Dog Star (Sirius) Cutout Halo
      var starPts = [];
      for (var sp = 0; sp < 16; sp++) {
        var sa = (sp / 16) * TAU;
        var sr = (sp % 2 === 0) ? 154 : 68;
        starPts.push([Math.cos(sa) * sr, Math.sin(sa) * sr]);
      }
      S.drawCutoutPaperEdge(ctx, starPts, "#f3d184", "#0b0c0e", { paperRim: 4.0, shadow: false });
      ctx.restore();

      // Constellation lines linking Sirius star nodes across the black band
      var cNodes = [[375, 215], [450, 290], [636, 230], [815, 265], [885, 195], [835, 395]];
      ctx.save();
      ctx.strokeStyle = "rgba(243, 209, 132, 0.72)";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      for (var cn = 0; cn < cNodes.length; cn++) {
        if (cn === 0) ctx.moveTo(cNodes[cn][0], cNodes[cn][1]);
        else ctx.lineTo(cNodes[cn][0], cNodes[cn][1]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      for (var cd = 0; cd < cNodes.length; cd++) {
        ctx.fillStyle = "#fbfaf5";
        ctx.beginPath();
        ctx.arc(cNodes[cd][0], cNodes[cd][1], 5.2, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // ---------- 3. S45 IMMOVABLE ICONIC HOUND + SEALED LETTER CUTOUT AT CENTER ----------
    var hx = 505;
    var hy = 188 - rollBounce;
    var hw = 268;
    var hh = 356;

    // Cross-hatched Lithograph Stone Plinth under the Hound's paws
    S.drawCutoutPaperEdge(ctx, [
      [hx - 28, hy + hh - 16],
      [hx + hw + 28, hy + hh - 16],
      [hx + hw + 44, hy + hh + 28],
      [hx - 44, hy + hh + 28]
    ], "#d9d5cb", "#0b0c0e", { paperRim: 4.5 });
    S.drawEngravingCrosshatch(ctx, hw + 50, 34, 0.35, 6, { x: hx - 25, y: hy + hh - 12 });

    // Articulated Split-Pin Cardboard Hound Tail wagging on the left!
    var tailWag = Math.sin(t * (beat.index === 1 ? 6.5 : 3.4)) * 0.24;
    ctx.save();
    ctx.translate(hx + 38, hy + 245);
    ctx.rotate(tailWag);
    S.drawCardboardPuppetPiece(ctx, [
      [6, 10], [-36, -24], [-46, -86], [-26, -98], [-12, -44], [14, -4]
    ], { tone: "#b8b3a8", stroke: "#0b0c0e", ribs: 2, pin: { x: 2, y: 0, r: 4.5, metal: "brass" } });
    ctx.restore();

    // Sculpted Lithograph Scissor-Cutout of the Hound + Letter from p36.jpg!
    S.drawScissorCutout(
      ctx, pImg, 212, 166, 214, 298,
      hx, hy, hw, hh,
      [
        [0.34, 0.04], [0.64, 0.03], [0.78, 0.14], [0.79, 0.27],
        [0.98, 0.25], [0.99, 0.52], [0.74, 0.56], [0.76, 0.96],
        [0.20, 0.97], [0.06, 0.78], [0.14, 0.50], [0.24, 0.30], [0.22, 0.16]
      ],
      { filter: "litho", haloWidth: 5.5, haloColor: "#fbfaf5", stroke: "#0b0c0e", lineWidth: 2.0 }
    );

    // Crisp Handmade Cut-Paper Envelope & S48 Glinting Crimson Wax Seal Clamped in Jaws!
    ctx.save();
    ctx.translate(hx + 188, hy + 126 + Math.sin(t * 3.0) * 1.5);
    ctx.rotate(-0.09);
    S.drawCutoutPaperEdge(ctx, [
      [-64, -38], [64, -38], [68, 38], [-60, 38]
    ], "#fbfaf5", "#0b0c0e", { paperRim: 3.0 });
    // Envelope flap crease lines
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-62, -36); ctx.lineTo(2, 6); ctx.lineTo(62, -36);
    ctx.stroke();

    // In Beat B (Governor's Pardon), add Twin Gold-Ribbon State Pardon Tails!
    if (beat.index === 1) {
      S.drawCutoutPaperEdge(ctx, [[-8, 8], [-24, 58], [-10, 50], [0, 60], [6, 12]], "#d4a44c", "#0b0c0e", { paperRim: 1.5, shadow: false });
      S.drawCutoutPaperEdge(ctx, [[4, 8], [16, 60], [24, 50], [36, 56], [16, 8]], "#d42a1e", "#0b0c0e", { paperRim: 1.5, shadow: false });
    }

    // Crimson Wax Seal (or Cyan-Gold Dog Star Seal in Beat D!)
    var sealCol = beat.index === 3 ? "#0f8f80" : "#b81d18";
    ctx.fillStyle = sealCol;
    ctx.strokeStyle = "#0b0c0e";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(3, 5, 16, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // S48 State-Machine glint star on the wax seal
    var glint = 0.55 + 0.45 * Math.sin(t * 5.2);
    ctx.strokeStyle = "rgba(255, 248, 220, " + glint.toFixed(2) + ")";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(3 - 9, 5); ctx.lineTo(3 + 9, 5);
    ctx.moveTo(3, 5 - 9); ctx.lineTo(3, 5 + 9);
    ctx.stroke();
    ctx.restore();

    // ---------- 4. Canonical Couriers per Beat (Turkey, Snail Mail, Brook Trout, Alien Saucer) ----------
    if (beat.index === 1) {
      S.drawTurkeyCutawayBadge(ctx, 118, 492, 0.96, t, { dispatch: 0.9 });
      var snailBx = S.lerp(225, 1055, u);
      S.drawMailSnail(ctx, snailBx, 542, 1.24, t, { hasReply: false });
    } else if (beat.index === 2) {
      var troutX = S.lerp(1085, 955, S.smooth(0, 0.35, u));
      S.drawBrookTrout(ctx, troutX, 368 + Math.sin(t * 2.4) * 8, 1.18, t, false);
      var climbY = S.lerp(525, 195, u);
      S.drawMailSnail(ctx, 1148, climbY, 1.18, t, { rot: -Math.PI * 0.5, hasReply: true });
    } else if (beat.index === 3) {
      S.drawAlienSaucer(ctx, 435, 152, 1.12, t, 636, 330, { beamSpread: 155 });
    }
    drawInteractiveSnailOverride(ctx, S, W, H, t, state, beat);

    // Optional Lamp Spotlight
    S.drawLampBeam(ctx, W, bandBot, t, state, { x: 640, y: bandBot + 20, aimX: 640, spread: 260, alpha: 0.14 });
    ctx.restore(); // end ink-band clip

    // Captioned-only Boucle-là white lithographic speech cartouche (ZERO calls in blind mode!)
    if (!S.isBlind(state)) {
      ctx.save();
      S.drawCutoutPaperEdge(ctx, [
        [68, 138], [418, 134], [432, 198], [408, 212], [456, 232], [380, 216], [74, 214], [56, 176]
      ], "#fbfaf7", "#0b0c0e", { paperRim: 0, lineWidth: 2.4 });
      ctx.fillStyle = "#0b0c0e";
      ctx.font = '800 18px "Big Shoulders Display", Impact, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var caps36 = [
        "« VARIATION I · STATUE DU CHIEN »",
        "« VARIATION II · GRÂCE DU GOUVERNEUR »",
        "« VARIATION III · BOÎTE AUX LETTRES »",
        "« VARIATION IV · ÉTOILE SIRIUS »"
      ];
      S.safeText(ctx, caps36[beat.index], 244, 174, state, 330);
      ctx.restore();
    }

    applyLampOffDimmer(ctx, W, H, state, 0.36);
    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 36);
  }

  // ============================================================================
  // PORTHOLE #37 · BULKHEAD ("queneau-rostrum")
  // Étienne Lécroart "Les caïds de la gaudriole" (Folded Dialogue) × S10 MLS Origami
  // A 4-panel accordion creek trail map on buttercream Queneau paper physically
  // creases and folds to transform map -> ambush trap -> handshake -> wormhole!
  // ============================================================================
  function renderPortal37(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var u = beat.u;
    var plates = S.getPortalPlates(37);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.0 });

    // 1. Queneau Buttercream Rostrum Stock + Extended Torn-Deckle Floor down to H=720!
    S.drawBolasBackdrop(ctx, W, H, "queneau-rostrum", null, t, state, { floor: false });
    S.drawTornPaperFlat(ctx, -20, 548, W + 40, 186, {
      fill: "#273b19",
      paperColor: "#f2ece0",
      deckle: 6.5,
      shadow: false,
      seed: 17.3
    });
    S.drawTornPaperFlat(ctx, -16, 578, W + 32, 8, { fill: "#d8d4c2", deckle: 0, shadow: false, seed: 31.1 });
    S.drawTornPaperFlat(ctx, -16, 612, W + 32, 8, { fill: "#d8d4c2", deckle: 0, shadow: false, seed: 47.9 });
    S.drawTornPaperFlat(ctx, -16, 668, W + 32, 7, { fill: "#40592b", deckle: 0, shadow: false, seed: 61.5 });

    var pxFar = S.parallaxX(0.25, t, state);
    var pyFar = S.parallaxY(0.25, t, state);
    var pxMid = S.parallaxX(0.55, t, state);
    var pyMid = S.parallaxY(0.55, t, state);

    // Torn-Deckle Wooden Bulkhead Door Flat on Right (modeled after SERVICE door in exercices-de-style.webp!)
    S.drawTornPaperFlat(ctx, 1028 + pxFar, 84 + pyFar, 178, 438, {
      fill: "#2b4222",
      paperColor: "#f2ecde",
      deckle: 8.5,
      seed: 91.4
    });
    // Brass bulkhead handle & rivets (0 text!)
    S.drawCutoutPaperEdge(ctx, [
      [1048 + pxFar, 278 + pyFar], [1066 + pxFar, 278 + pyFar],
      [1066 + pxFar, 330 + pyFar], [1048 + pxFar, 330 + pyFar]
    ], "#f2ecde", "#14110d", { paperRim: 1.5, shadow: false });

    // Foraged Atlas Plate (atlas-26.webp: Modest Mouse "Dashboard" peering sailor with flashlight!)
    var sailorAlpha = beat.index === 3 ? 0.55 : 0.92;
    S.drawScissorCutout(
      ctx, aImg, 88, 12, 468, 372,
      118 + pxFar, 64 + pyFar, 310, 236,
      [[0.08, 0.14], [0.46, 0.03], [0.88, 0.08], [0.96, 0.58], [0.84, 0.95], [0.12, 0.92]],
      { filter: "sepia", haloWidth: 4.5, alpha: sailorAlpha, rot: -0.04 }
    );
    // Warm Flashlight Cone from the Sailor's Torch when state.lamp !== false
    if (!state || state.lamp !== false) {
      ctx.save();
      var fg = ctx.createLinearGradient(260 + pxFar, 210 + pyFar, 640, 380);
      fg.addColorStop(0, "rgba(255, 244, 196, 0.42)");
      fg.addColorStop(1, "rgba(255, 244, 196, 0)");
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(248 + pxFar, 198 + pyFar);
      ctx.lineTo(760, 210);
      ctx.lineTo(680, 495);
      ctx.lineTo(238 + pxFar, 224 + pyFar);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // ---------- 2. S35 4-Panel Accordion-Folded Creek Trail Map Rig ----------
    // Compute physical fold angle per Variation:
    //   Beat A: flat open map (fold = 0.14)
    //   Beat B: sharp Lécroart inward fold bringing outer trap jaws together (fold = 0.68)
    //   Beat C: gentle ceremonial treaty fold behind handshake (fold = 0.24)
    //   Beat D: deep origami diamond wormhole fold (fold = 0.56)
    var targetFold = 0.14;
    if (beat.index === 1) targetFold = S.lerp(0.16, 0.68, S.spring(beat.localT, 0.05, 10, 4.2));
    else if (beat.index === 2) targetFold = 0.24 + Math.sin(t * 2.0) * 0.04;
    else if (beat.index === 3) targetFold = 0.54 + Math.sin(t * 1.8) * 0.06;
    else targetFold = 0.14 + Math.sin(t * 1.6) * 0.03;

    var mapCx = 620 + pxMid;
    var mapCy = 328 + pyMid;
    var panelW = 148;
    var panelH = 336;
    var cosInner = Math.cos(targetFold * 0.72);
    var cosOuter = Math.cos(targetFold * 1.08);
    var wInner = panelW * cosInner;
    var wOuter = panelW * cosOuter;
    var skewInner = Math.sin(targetFold * 0.72) * 26;
    var skewOuter = -Math.sin(targetFold * 1.08) * 34;

    // Rostrum contact shadow beneath the 4-panel map
    ctx.save();
    ctx.fillStyle = "rgba(20, 16, 10, 0.26)";
    ctx.beginPath();
    ctx.ellipse(mapCx + 6, mapCy + panelH * 0.48, (wInner + wOuter) * 1.02, 26, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Helper to render one foreshortened & vertically-skewed map panel from p37.jpg (sx in 140..500, sy in 176..482)
    function drawFoldPanel(xLeft, wProj, yTopLeft, yTopRight, sx, sw, shadeAlpha, tintCol) {
      ctx.save();
      var poly = [
        { x: xLeft, y: yTopLeft },
        { x: xLeft + wProj, y: yTopRight },
        { x: xLeft + wProj, y: yTopRight + panelH },
        { x: xLeft, y: yTopLeft + panelH }
      ];
      // White scissor-cut border along top & bottom of folded sheet
      ctx.strokeStyle = "#fbfaf5";
      ctx.lineWidth = 8;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(poly[0].x, poly[0].y);
      ctx.lineTo(poly[1].x, poly[1].y);
      ctx.lineTo(poly[2].x, poly[2].y);
      ctx.lineTo(poly[3].x, poly[3].y);
      ctx.closePath();
      ctx.stroke();

      ctx.clip();
      // Affine transform mapping [0..panelW, 0..panelH] -> skewed panel quad
      var dySkew = yTopRight - yTopLeft;
      ctx.transform(wProj / panelW, dySkew / panelW, 0, 1, xLeft, yTopLeft);
      if (pImg && pImg.complete && pImg.naturalWidth > 0) {
        ctx.drawImage(pImg, sx, 178, sw, 296, 0, 0, panelW, panelH);
      } else {
        ctx.fillStyle = "#e6d5b0";
        ctx.fillRect(0, 0, panelW, panelH);
      }
      if (tintCol) {
        ctx.fillStyle = tintCol;
        ctx.fillRect(0, 0, panelW, panelH);
      }
      if (shadeAlpha > 0) {
        ctx.fillStyle = "rgba(18, 14, 10, " + shadeAlpha.toFixed(3) + ")";
        ctx.fillRect(0, 0, panelW, panelH);
      }
      ctx.restore();

      // Crisp fold crease ink line
      ctx.strokeStyle = "rgba(20, 17, 13, 0.55)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(xLeft, yTopLeft);
      ctx.lineTo(xLeft + wProj, yTopRight);
      ctx.lineTo(xLeft + wProj, yTopRight + panelH);
      ctx.lineTo(xLeft, yTopLeft + panelH);
      ctx.closePath();
      ctx.stroke();
    }

    var tintD = (beat.index === 3) ? "rgba(22, 34, 72, 0.56)" : null;
    var yC = mapCy - panelH * 0.5;
    var yL1 = yC - skewInner;
    var yL2 = yL1 - skewOuter;
    var yR1 = yC - skewInner;
    var yR2 = yR1 - skewOuter;

    drawFoldPanel(mapCx - wInner - wOuter, wOuter, yL2, yL1, 140, 90, 0.06, tintD);
    drawFoldPanel(mapCx - wInner, wInner, yL1, yC, 230, 90, 0.20 + targetFold * 0.18, tintD);
    drawFoldPanel(mapCx, wInner, yC, yR1, 320, 90, 0.08, tintD);
    drawFoldPanel(mapCx + wInner, wOuter, yR1, yR2, 410, 90, 0.22 + targetFold * 0.16, tintD);

    // Brass Split-Pin Map Thumbtacks at Outer Corners
    S.drawSplitPin(ctx, mapCx - wInner - wOuter + 12, yL2 + 14, 5.2, { metal: "brass" });
    S.drawSplitPin(ctx, mapCx + wInner + wOuter - 12, yR2 + 14, 5.2, { metal: "brass" });

    // ---------- 3. Beat-Specific Foreground Props & IK Puppetry ----------
    if (beat.index === 0) {
      // Beat A: Muddy Creek Splatter Cutouts & Brass Pocket Compass on the Trail Map
      var mudSpots = [[-155, 88, 22], [135, -75, 18], [-65, 118, 15], [175, 96, 24]];
      for (var ms = 0; ms < mudSpots.length; ms++) {
        ctx.save();
        ctx.translate(mapCx + mudSpots[ms][0], mapCy + mudSpots[ms][1]);
        S.drawCutoutPaperEdge(ctx, [
          [-mudSpots[ms][2], -4], [-6, -mudSpots[ms][2] * 0.8], [mudSpots[ms][2], -5],
          [mudSpots[ms][2] * 0.7, mudSpots[ms][2] * 0.8], [-9, mudSpots[ms][2] * 0.7]
        ], "#5c4328", "#14110d", { paperRim: 2.0, shadow: false });
        ctx.restore();
      }
      // Spinning Brass Trail Compass Rose
      ctx.save();
      ctx.translate(mapCx + 190, mapCy + 115);
      S.drawCutoutPaperEdge(ctx, [[-34, 0], [0, -34], [34, 0], [0, 34]], "#d4a44c", "#14110d", { paperRim: 3 });
      ctx.rotate(Math.sin(t * 2.3) * 0.45 - 0.5);
      S.drawCutoutPaperEdge(ctx, [[-6, 0], [0, -26], [6, 0], [0, 26]], "#d42a1e", "#14110d", { paperRim: 0, shadow: false });
      S.drawSplitPin(ctx, 0, 0, 4.0, { metal: "silver" });
      ctx.restore();
    } else if (beat.index === 1) {
      // Beat B: "A tricky hidden ambush trap" — Folded Crease Snaps Serrated Red Trap Jaws Together!
      var snapClench = 0.55 + 0.45 * Math.sin(t * 5.2);
      var jawGap = S.lerp(46, 8, snapClench);
      ctx.save();
      ctx.translate(mapCx, mapCy + 6);
      for (var side = -1; side <= 1; side += 2) {
        var teeth = [[side * (jawGap + 68), -118]];
        for (var ti = 0; ti < 6; ti++) {
          var ty0 = -105 + ti * 38;
          teeth.push([side * jawGap, ty0 + 14]);
          teeth.push([side * (jawGap + 34), ty0 + 32]);
        }
        teeth.push([side * (jawGap + 68), 124]);
        S.drawCutoutPaperEdge(ctx, teeth, "#d42a1e", "#14110d", { paperRim: 3.0 });
      }
      // Red dashed ambush crosshairs & tripwire across the center crease
      ctx.strokeStyle = "#d42a1e";
      ctx.lineWidth = 3.0;
      ctx.setLineDash([9, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 74, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Nervous IK Turkey Talon Arm pointing at the ambush crease
      var talonIK = S.solveIK2(175, 425, 165, 155, mapCx - 108, mapCy + 24 + Math.sin(t * 6) * 8, -1);
      drawJointedCardLimb(ctx, S, talonIK, 34, 26, "#7d583c", "#c99842", "brass");

      S.drawTurkeyCutawayBadge(ctx, 118, 494, 0.96, t, { dispatch: 0.9 });
      S.drawMailSnail(ctx, S.lerp(230, 1045, u), 558, 1.24, t, { hasReply: false });
    } else if (beat.index === 2) {
      // Beat C: "A friendly fin-to-claw handshake" — Two Giant Split-Pin Arms Clasping & Pumping!
      var shakeY = mapCy + 14 + Math.sin(t * 6.4) * 18;
      var shakeX = mapCx;

      // Left IK Feathered Turkey Arm + Right IK Spotted Trout Fin-Arm
      var leftIK = S.solveIK2(160, 355, 235, 225, shakeX - 58, shakeY, 1);
      var rightIK = S.solveIK2(1070, 355, 235, 225, shakeX + 58, shakeY, -1);
      drawJointedCardLimb(ctx, S, leftIK, 46, 36, "#6e4e35", "#c8963e", "brass");
      drawJointedCardLimb(ctx, S, rightIK, 46, 36, "#5e7562", "#8fa38b", "silver");

      // Scissor-Cutout Clasped Claw-to-Fin Handshake from p37.jpg right at the joint!
      S.drawScissorCutout(
        ctx, pImg, 212, 272, 224, 128,
        shakeX - 142, shakeY - 76, 284, 156,
        [[0.04, 0.22], [0.46, 0.08], [0.84, 0.05], [0.97, 0.46], [0.88, 0.92], [0.44, 0.96], [0.05, 0.72]],
        { haloWidth: 5.5, rot: Math.sin(t * 6.4) * 0.04 }
      );

      // Brook Trout Witness & Climbing Reply Snail
      S.drawBrookTrout(ctx, 948, 206 + Math.sin(t * 2.6) * 7, 1.08, t, false);
      S.drawMailSnail(ctx, 1152, S.lerp(530, 185, u), 1.18, t, { rot: -Math.PI * 0.5, hasReply: true });
    } else {
      // Beat D: "A secret wormhole star chart" — Swirling Origami Einstein-Rosen Bridge + Alien Saucer!
      ctx.save();
      ctx.translate(mapCx, mapCy);
      for (var wr = 5; wr >= 1; wr--) {
        var rr = wr * 28 + Math.sin(t * 3.2 + wr) * 4;
        ctx.strokeStyle = (wr % 2 === 0) ? "#0f8f80" : "#f3d184";
        ctx.lineWidth = 2.6;
        ctx.save();
        ctx.rotate(t * (wr % 2 === 0 ? 0.65 : -0.55) + wr);
        ctx.setLineDash([12, 6]);
        ctx.beginPath();
        ctx.ellipse(0, 0, rr * 1.25, rr * 0.78, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
      // Glowing wormhole throat core
      var wg = ctx.createRadialGradient(0, 0, 4, 0, 0, 62);
      wg.addColorStop(0, "#ffffff");
      wg.addColorStop(0.45, "#0f8f80");
      wg.addColorStop(1, "rgba(15, 143, 128, 0)");
      ctx.fillStyle = wg;
      ctx.beginPath();
      ctx.arc(0, 0, 62, 0, TAU);
      ctx.fill();
      ctx.restore();

      S.drawAlienSaucer(ctx, mapCx, 118, 1.18, t, mapCx, mapCy, { beamSpread: 165 });
    }

    drawInteractiveSnailOverride(ctx, S, W, H, t, state, beat);
    drawQueneauRansomBanner(ctx, S, ["Plié", "par", "la", "carte"], 58, 62, state);

    applyLampOffDimmer(ctx, W, H, state, 0.36);
    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 37);
  }

  // ============================================================================
  // PORTHOLE #38 · VISOR ("queneau-rostrum")
  // Jean-Christophe Ribot "Le Maki Mococo" × S49 Royal Robertson / Vesuvius
  // Scissor-cut posterboard & Royal Robertson geometric visor reframed by
  // articulated drafting pantograph arms across 4 meanings!
  // ============================================================================
  function renderPortal38(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var u = beat.u;
    var plates = S.getPortalPlates(38);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.0 });

    // 1. Warm Buff Queneau Rostrum Paper + Extended Dark Slate-Green Floor down to y=724!
    S.drawBolasBackdrop(ctx, W, H, "queneau-rostrum", null, t, state, {
      paperTop: "#f4de9a",
      paperBot: "#d9bc6e",
      floor: false
    });
    S.drawTornPaperFlat(ctx, -20, 548, W + 40, 186, {
      fill: "#233628",
      paperColor: "#f3ede0",
      deckle: 6.5,
      shadow: false,
      seed: 23.7
    });
    S.drawTornPaperFlat(ctx, -16, 578, W + 32, 8, { fill: "#dfd9c6", deckle: 0, shadow: false, seed: 41.2 });
    S.drawTornPaperFlat(ctx, -16, 612, W + 32, 8, { fill: "#dfd9c6", deckle: 0, shadow: false, seed: 53.8 });

    var pxFar = S.parallaxX(0.24, t, state);
    var pyFar = S.parallaxY(0.24, t, state);
    var pxMid = S.parallaxX(0.50, t, state);
    var pyMid = S.parallaxY(0.50, t, state);

    // Royal Robertson Geometric Visor/Crown Crop from atlas-37.webp (STRICTLY center crop sx=206,sy=148,sw=220,sh=246 — ZERO album text!)
    var rrY = beat.index === 2 ? (62 + pyFar - Math.sin(t * 2.5) * 8) : (82 + pyFar);
    S.drawScissorCutout(
      ctx, aImg, 206, 148, 220, 246,
      142 + pxFar, rrY, 226, 246,
      [[0.18, 0.04], [0.82, 0.04], [0.96, 0.34], [0.88, 0.88], [0.50, 0.98], [0.12, 0.88], [0.04, 0.34]],
      { haloWidth: 4.5, rot: -0.05, alpha: 0.92 }
    );

    // ---------- 2. Wooden Easel Frame + Oxidized Copper Brackets + Posterboard Plate ----------
    var bx = 420 + pxMid;
    var by = 112 + pyMid;
    var bw = 440;
    var bh = 416;

    // Easel wooden legs reaching into the rostrum floor
    S.drawCardboardPuppetPiece(ctx, [[bx + 36, by + bh - 10], [bx + 68, by + bh - 10], [bx + 44, 620], [bx + 12, 620]], { tone: "#6e5233", ribs: 2 });
    S.drawCardboardPuppetPiece(ctx, [[bx + bw - 68, by + bh - 10], [bx + bw - 36, by + bh - 10], [bx + bw - 12, 620], [bx + bw - 44, 620]], { tone: "#6e5233", ribs: 2 });

    // Weathered timber frame + patina-teal copper corner brackets
    S.drawTornPaperFlat(ctx, bx - 18, by - 18, bw + 36, bh + 36, {
      fill: "#7c5e3c",
      paperColor: "#efe9da",
      deckle: 5.0,
      seed: 71.2
    });
    var brk = [
      [bx - 18, by - 18], [bx + bw - 46, by - 18],
      [bx - 18, by + bh - 46], [bx + bw - 46, by + bh - 46]
    ];
    for (var bi = 0; bi < 4; bi++) {
      S.drawCutoutPaperEdge(ctx, [
        [brk[bi][0], brk[bi][1]], [brk[bi][0] + 64, brk[bi][1]],
        [brk[bi][0] + 64, brk[bi][1] + 64], [brk[bi][0], brk[bi][1] + 64]
      ], "#4a8c7f", "#14110d", { paperRim: 0, shadow: false });
      S.drawSplitPin(ctx, brk[bi][0] + 16, brk[bi][1] + 16, 4.2, { metal: "brass" });
      S.drawSplitPin(ctx, brk[bi][0] + 48, brk[bi][1] + 48, 4.2, { metal: "brass" });
    }

    // Main Scissor-Cut Posterboard Diagram from p38.jpg (sx=192, sy=190, sw=256, sh=262 — pure arrows & saucer!)
    var posterTint = beat.index === 3 ? "rgba(16, 58, 108, 0.48)" : (beat.index === 1 ? "rgba(180, 32, 24, 0.10)" : null);
    S.drawScissorCutout(
      ctx, pImg, 192, 190, 256, 262,
      bx + 18, by + 18, bw - 36, bh - 36,
      [[0.02, 0.02], [0.98, 0.02], [0.97, 0.88], [0.89, 0.98], [0.02, 0.98]],
      { haloWidth: 4.0, tint: posterTint }
    );

    // ---------- 3. Le Maki Mococo Meaning-Building Overlays & IK Pantograph ----------
    var aimX = bx + bw * 0.5 + Math.cos(t * 2.2) * 95;
    var aimY = by + bh * 0.5 + Math.sin(t * 2.7) * 75;

    if (beat.index === 0) {
      // Beat A: "A soggy marker posterboard chart" — Dripping Watercolor Marker Runs & Curling Wet Corner!
      var drips = [
        [bx + 96, by + 120, "#1d596e", 95],
        [bx + 168, by + 150, "#d42a1e", 118],
        [bx + 292, by + 135, "#0f8f80", 104],
        [bx + 346, by + 175, "#1d596e", 88]
      ];
      ctx.save();
      for (var di = 0; di < drips.length; di++) {
        var dLen = drips[di][3] * (0.45 + 0.55 * ((t * 0.45 + di * 0.27) % 1));
        ctx.strokeStyle = drips[di][2];
        ctx.globalAlpha = 0.62;
        ctx.lineWidth = 4.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(drips[di][0], drips[di][1]);
        ctx.lineTo(drips[di][0], drips[di][1] + dLen);
        ctx.stroke();
        ctx.fillStyle = drips[di][2];
        ctx.beginPath();
        ctx.arc(drips[di][0], drips[di][1] + dLen + 3, 4.2, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      // Wet folded-back dog-ear corner at bottom-right of soggy posterboard
      S.drawCutoutPaperEdge(ctx, [
        [bx + bw - 68, by + bh - 18],
        [bx + bw - 18, by + bh - 68],
        [bx + bw - 74, by + bh - 72]
      ], "#d8d2c0", "#14110d", { paperRim: 2.0 });
      drawRisingBubbles(ctx, S, t, state, 12, bx - 60, bx + bw + 60, 540, 120, "rgba(35, 85, 95, 0.55)");
    } else if (beat.index === 1) {
      // Beat B: "A scary butcher-shop meat diagram" — Plump Cardboard Roast-Bird Stencil + Dashed Cut Zones + Cleaver!
      ctx.save();
      ctx.translate(bx + bw * 0.5, by + bh * 0.52);
      // Translucent kraft butcher-chart silhouette overlaid on the saucer diagram
      S.drawCutoutPaperEdge(ctx, [
        [-118, 12], [-96, -58], [-18, -78], [76, -54], [116, -8],
        [136, -24], [142, 8], [108, 48], [32, 74], [-68, 68]
      ], "rgba(244, 214, 178, 0.88)", "#14110d", { paperRim: 3.5 });
      // Dashed red butcher-partition cut lines (breast / wing / drumstick sectors — ZERO text!)
      ctx.strokeStyle = "#d42a1e";
      ctx.lineWidth = 3.2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(-24, -76); ctx.lineTo(-16, 70);
      ctx.moveTo(46, -62);  ctx.lineTo(34, 68);
      ctx.moveTo(-98, 4);   ctx.lineTo(106, 6);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Jointed Cardboard Butcher Cleaver chopping gently at upper-right corner!
      ctx.save();
      ctx.translate(bx + bw - 18, by + 68);
      ctx.rotate(-0.35 + Math.sin(t * 5.6) * 0.22);
      S.drawCardboardPuppetPiece(ctx, [[-85, -36], [10, -32], [14, 24], [-82, 20]], { tone: "#c7cacd", ribs: 2 });
      S.drawCardboardPuppetPiece(ctx, [[10, -12], [68, -10], [68, 8], [10, 8]], {
        tone: "#5c3b24", ribs: 1, pin: { x: 14, y: -2, r: 4.2, metal: "brass" }
      });
      ctx.restore();

      aimX = bx + bw * 0.48;
      aimY = by + bh * 0.50;
      S.drawTurkeyCutawayBadge(ctx, 118, 494, 0.96, t, { dispatch: 0.92 });
      S.drawMailSnail(ctx, S.lerp(235, 1045, u), 558, 1.24, t, { hasReply: false });
    } else if (beat.index === 2) {
      // Beat C: "A magical creek wish-machine" — Spinning Brass Wish Dynamo + Paper Stars + Trout Wish Lever!
      ctx.save();
      ctx.translate(bx + bw * 0.5, by + bh * 0.5);
      // Spinning notched brass wish-wheel behind saucer crop
      ctx.save();
      ctx.rotate(t * 1.4);
      var gearPts = [];
      for (var gi = 0; gi < 24; gi++) {
        var ga = (gi / 24) * TAU;
        var gr = (gi % 2 === 0) ? 128 : 108;
        gearPts.push([Math.cos(ga) * gr, Math.sin(ga) * gr]);
      }
      S.drawCutoutPaperEdge(ctx, gearPts, "#e6b84c", "#14110d", { paperRim: 3.0, shadow: false });
      ctx.restore();

      // Re-cut central brass dome from p38.jpg gleaming at center
      S.drawScissorCutout(
        ctx, pImg, 228, 244, 184, 118,
        -108, -68, 216, 136,
        [[0.04, 0.52], [0.32, 0.14], [0.50, 0.03], [0.68, 0.14], [0.96, 0.52], [0.76, 0.92], [0.24, 0.92]],
        { haloWidth: 4.0 }
      );

      // Orbiting Cut-Paper Golden Wish Stars!
      for (var st = 0; st < 5; st++) {
        var sa = t * 1.6 + (st / 5) * TAU;
        var sx = Math.cos(sa) * 156;
        var sy = Math.sin(sa) * 136;
        var sPts = [];
        for (var k = 0; k < 10; k++) {
          var ka = (k / 10) * TAU - Math.PI * 0.5;
          var kr = (k % 2 === 0) ? 18 : 8;
          sPts.push([sx + Math.cos(ka) * kr, sy + Math.sin(ka) * kr]);
        }
        S.drawCutoutPaperEdge(ctx, sPts, st % 2 === 0 ? "#fae194" : "#0f8f80", "#14110d", { paperRim: 2.0, shadow: false });
      }
      ctx.restore();

      // Hinged Cardboard Wish-Machine Lever pulled by Brook Trout!
      var levAng = -0.35 + Math.sin(t * 3.4) * 0.32;
      ctx.save();
      ctx.translate(bx + bw + 22, by + 310);
      ctx.rotate(levAng);
      S.drawCardboardPuppetPiece(ctx, [[-8, 6], [-8, -118], [8, -118], [8, 6]], {
        tone: "#8e8d89", ribs: 1, pin: { x: 0, y: 0, r: 5.0, metal: "brass" }
      });
      S.drawCutoutPaperEdge(ctx, [[-16, -134], [16, -134], [16, -106], [-16, -106]], "#d42a1e", "#14110d", { paperRim: 2 });
      ctx.restore();

      S.drawBrookTrout(ctx, 988, 318 + Math.sin(t * 2.5) * 8, 1.08, t, false);
      S.drawMailSnail(ctx, 1158, S.lerp(530, 185, u), 1.18, t, { rot: -Math.PI * 0.5, hasReply: true });
    } else {
      // Beat D: "Top-secret Roswell saucer plans" — Blueprint Grid + Levitating Saucer Cutout + Alien Saucer!
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.48)";
      ctx.lineWidth = 1.2;
      for (var gx = bx + 38; gx < bx + bw - 20; gx += 36) {
        ctx.beginPath(); ctx.moveTo(gx, by + 22); ctx.lineTo(gx, by + bh - 22); ctx.stroke();
      }
      for (var gy = by + 38; gy < by + bh - 20; gy += 36) {
        ctx.beginPath(); ctx.moveTo(bx + 22, gy); ctx.lineTo(bx + bw - 22, gy); ctx.stroke();
      }
      // Red blueprint caliper dimension arrows (pure geometry, 0 text!)
      ctx.strokeStyle = "#d42a1e";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(bx + 85, by + bh - 54); ctx.lineTo(bx + bw - 85, by + bh - 54);
      ctx.moveTo(bx + 85, by + bh - 64); ctx.lineTo(bx + 85, by + bh - 44);
      ctx.moveTo(bx + bw - 85, by + bh - 64); ctx.lineTo(bx + bw - 85, by + bh - 44);
      ctx.stroke();
      ctx.restore();

      // Central Brass Saucer Cutout from p38.jpg LEVITATING off the blueprint!
      var lift = S.spring(beat.localT, 0.08, 10, 4.0) * 56 + Math.sin(t * 3.0) * 8;
      S.drawScissorCutout(
        ctx, pImg, 228, 244, 184, 118,
        bx + bw * 0.5 - 125, by + bh * 0.5 - 64 - lift, 250, 154,
        [[0.04, 0.52], [0.32, 0.14], [0.50, 0.03], [0.68, 0.14], [0.96, 0.52], [0.76, 0.92], [0.24, 0.92]],
        { haloWidth: 5.0, shadowY: 16 + lift * 0.45, rot: Math.sin(t * 2.2) * 0.05 }
      );

      aimX = bx + bw * 0.5;
      aimY = by + bh * 0.5 - lift;
      S.drawAlienSaucer(ctx, 985, 138, 1.18, t, bx + bw * 0.5, by + bh * 0.5 - lift, { beamSpread: 150 });
    }

    // Articulated Left Cardboard Drafting Pantograph Arm (S33 IK) tracing the diagram!
    var pantoIK = S.solveIK2(178, 435, 195, 195, S.clamp(aimX - 55, 340, 540), S.clamp(aimY, 210, 460), -1);
    drawJointedCardLimb(ctx, S, pantoIK, 28, 22, "#8e8d89", "#c4b699", "brass");

    drawInteractiveSnailOverride(ctx, S, W, H, t, state, beat);
    drawQueneauRansomBanner(ctx, S, ["Tracé", "au", "feutre"], 56, 62, state);

    S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 12, aimX: 640, spread: 280, alpha: 0.12 });
    applyLampOffDimmer(ctx, W, H, state, 0.36);
    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 38);
  }

  // ============================================================================
  // PORTHOLE #39 · PARLOR ("perec-stage")
  // Georges Perec "Les Lieux d'une fugue" × S05 Yuri Norstein × Pyramid Song
  // Carved sandstone & floral proscenium swinging hinged double doors onto a
  // multiplane submerged parlor (atlas-24 + p39 floating armchair & fringed lamp)!
  // ============================================================================
  function renderPortal39(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var u = beat.u;
    var plates = S.getPortalPlates(39);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.0 });

    // Wide theatrical Perec doorway aperture (x = 185..1095, y = 74..616) surrounded by carved stone up to y=720!
    var openX = 185, openY = 74, openW = 910, openH = 542;
    S.drawBolasBackdrop(ctx, W, H, "perec-stage", null, t, state, {
      openX: openX,
      openY: openY,
      openW: openW,
      openH: openH,
      doors: false
    });

    var px1 = S.parallaxX(0.18, t, state);
    var px2 = S.parallaxX(0.42, t, state);
    var py2 = S.parallaxY(0.42, t, state);
    var px3 = S.parallaxX(0.75, t, state);
    var py3 = S.parallaxY(0.75, t, state);

    // ---------- 2. 5-Plane Yuri Norstein Submerged Parlor Inside Proscenium Recess ----------
    ctx.save();
    ctx.beginPath();
    ctx.rect(openX, openY, openW, openH);
    ctx.clip();

    // Room ambient wash: cool underwater teal in A/C, warm cozy parlor hearth in B, specimen dark in D!
    var roomGrad = ctx.createLinearGradient(0, openY, 0, openY + openH);
    if (beat.index === 1) {
      roomGrad.addColorStop(0.0, "#5e4632");
      roomGrad.addColorStop(0.65, "#876343");
      roomGrad.addColorStop(1.0, "#47311f");
    } else if (beat.index === 3) {
      roomGrad.addColorStop(0.0, "#102129");
      roomGrad.addColorStop(0.65, "#193842");
      roomGrad.addColorStop(1.0, "#0d1a20");
    } else {
      roomGrad.addColorStop(0.0, "#1f545c");
      roomGrad.addColorStop(0.65, "#2d6f75");
      roomGrad.addColorStop(1.0, "#193d42");
    }
    ctx.fillStyle = roomGrad;
    ctx.fillRect(openX, openY, openW, openH);

    // Plane 1: Pyramid Song Submerged Lit Doorway Plate (atlas-24.webp) in deep recess!
    S.drawScissorCutout(
      ctx, aImg, 150, 8, 450, 280,
      365 + px1, 108, 530, 315,
      [[0.03, 0.04], [0.97, 0.04], [0.98, 0.96], [0.02, 0.96]],
      {
        filter: beat.index === 1 ? "sepia" : "none",
        haloWidth: 3.5,
        alpha: beat.index === 1 ? 0.52 : 0.78
      }
    );

    // Plane 2: Floral Damask Wallpaper Swatches from p39.jpg flanking the doorway
    var wpFilter = beat.index === 1 ? "sepia" : "none";
    S.drawScissorCutout(ctx, pImg, 205, 118, 165, 138, 202 + px2 * 0.6, 98, 225, 295, null, { filter: wpFilter, haloWidth: 3.5, alpha: 0.86 });
    S.drawScissorCutout(ctx, pImg, 205, 118, 165, 138, 845 + px2 * 0.6, 98, 225, 295, null, { filter: wpFilter, haloWidth: 3.5, alpha: 0.86 });

    // Norstein drifting glass mist layer
    S.drawNorsteinFog(ctx, W, H, t, beat.index === 1 ? 0.12 : 0.24, beat.index === 1 ? "255, 232, 195" : "205, 236, 235");

    // Wooden parlor floorboards at bottom of room
    S.drawTornPaperFlat(ctx, openX - 10, 468, openW + 20, 160, {
      fill: beat.index === 1 ? "#6e492c" : "#304847",
      paperColor: "#e8e2d5",
      deckle: 3.5,
      seed: 19.8
    });

    // Plane 3: Oriental Parlor Rug Cutout from p39.jpg (warped upward in Beat C when vacuum sucks it!)
    var rugLift = (beat.index === 2) ? (28 + Math.sin(t * 14) * 8) : 0;
    S.drawScissorCutout(
      ctx, pImg, 218, 418, 256, 82,
      335 + px2, 474 - rugLift * 0.5, 560, 116,
      beat.index === 2
        ? [[0.03, 0.18], [0.55, 0.14], [0.84, -0.38], [0.98, 0.42], [0.94, 0.94], [0.02, 0.94]]
        : [[0.04, 0.08], [0.94, 0.08], [0.98, 0.94], [0.01, 0.94]],
      { filter: wpFilter, haloWidth: 4.0 }
    );

    // Plane 4A: Fringed Parlor Floor Lamp Cutout from p39.jpg + Golden Norstein Glow Cone!
    var lampX = 768 + px2;
    var lampBob = (beat.index === 0 || beat.index === 3) ? Math.sin(t * 1.7 + 1.1) * 10 - 12 : 0;
    var lampY = 148 + lampBob + py2 * 0.4;
    if (!state || state.lamp !== false) {
      ctx.save();
      var glowR = beat.index === 1 ? 290 : 225;
      var lg = ctx.createRadialGradient(lampX + 68, lampY + 72, 12, lampX + 68, lampY + 130, glowR);
      lg.addColorStop(0.0, "rgba(255, 234, 168, 0.62)");
      lg.addColorStop(0.5, "rgba(255, 214, 128, 0.24)");
      lg.addColorStop(1.0, "rgba(255, 214, 128, 0)");
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.arc(lampX + 68, lampY + 110, glowR, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    S.drawScissorCutout(
      ctx, pImg, 368, 144, 102, 316,
      lampX, lampY, 138, 366,
      [[0.18, 0.03], [0.82, 0.03], [0.98, 0.36], [0.64, 0.40], [0.64, 0.92], [0.86, 0.98], [0.14, 0.98], [0.36, 0.92], [0.36, 0.40], [0.02, 0.36]],
      { haloWidth: 4.5, rot: (beat.index === 0 ? Math.sin(t * 1.4) * 0.04 : 0) }
    );

    // Plane 4B: Tufted Green Wingback Armchair Cutout from p39.jpg!
    var chairFloat = (beat.index === 0)
      ? (-26 + Math.sin(t * 1.8) * 14)
      : (beat.index === 3 ? (-34 + Math.sin(t * 2.1) * 10) : 0);
    var chairRot = (beat.index === 0) ? Math.sin(t * 1.3) * 0.06 : (beat.index === 2 ? Math.sin(t * 16) * 0.015 : 0);
    S.drawScissorCutout(
      ctx, pImg, 144, 244, 222, 222,
      288 + px3, 252 + chairFloat + py3 * 0.5, 295, 276,
      [[0.04, 0.10], [0.68, 0.04], [0.86, 0.14], [0.86, 0.48], [0.98, 0.52], [0.94, 0.96], [0.14, 0.98], [0.08, 0.62]],
      { haloWidth: 5.0, rot: chairRot, shadowY: 10 - chairFloat * 0.35 }
    );

    // ---------- 3. Beat-Specific Dramaturgy Inside the Parlor ----------
    if (beat.index === 0) {
      // Beat A: "A flooded wallpapered living room" — Floating Teacup, Caustics & Bubbles!
      S.drawWaterCaustics(ctx, W, openY + openH, t, 0.24);
      drawRisingBubbles(ctx, S, t, state, 18, openX + 40, openX + openW - 40, 580, 100);
    } else if (beat.index === 1) {
      // Beat B: "Grandma’s cozy dry front parlor" — Oval Ancestor Portrait, Lace Doily Table & Steaming Teacup!
      // Oval framed Turkey Ancestor Portrait hanging on dry parlor wall
      ctx.save();
      ctx.translate(636 + px2, 198);
      S.drawCutoutPaperEdge(ctx, [[-48, 0], [-34, -58], [0, -68], [34, -58], [48, 0], [34, 58], [0, 68], [-34, 58]], "#c99842", "#14110d", { paperRim: 3.5 });
      ctx.fillStyle = "#3a281b";
      ctx.beginPath(); ctx.ellipse(0, 0, 34, 48, 0, 0, TAU); ctx.fill();
      S.drawTurkeyInCorner(ctx, -4, 14, 0.55, t, { dispatch: 0 });
      ctx.restore();

      // Cozy Wooden Side Table + White Scalloped Lace Doily + Steaming Teacup!
      var tbX = 636 + px3;
      S.drawCardboardPuppetPiece(ctx, [[tbX - 46, 412], [tbX + 46, 412], [tbX + 34, 526], [tbX - 34, 526]], { tone: "#6e4628", ribs: 2 });
      S.drawCutoutPaperEdge(ctx, [[tbX - 58, 410], [tbX + 58, 410], [tbX + 48, 424], [tbX - 48, 424]], "#fbfaf5", "#14110d", { paperRim: 2 });
      S.drawCutoutPaperEdge(ctx, [[tbX - 18, 386], [tbX + 18, 386], [tbX + 14, 410], [tbX - 14, 410]], "#f3d184", "#14110d", { paperRim: 2 });
      // Rising paper steam curls
      ctx.strokeStyle = "rgba(255, 250, 240, 0.78)";
      ctx.lineWidth = 2.4;
      for (var st = -1; st <= 1; st += 2) {
        ctx.beginPath();
        ctx.moveTo(tbX + st * 7, 380);
        ctx.quadraticCurveTo(tbX + st * 15 + Math.sin(t * 3 + st) * 6, 358, tbX + st * 5, 336);
        ctx.stroke();
      }

      S.drawTurkeyCutawayBadge(ctx, 265, 508, 0.92, t, { dispatch: 0.9 });
      S.drawMailSnail(ctx, S.lerp(375, 995, u), 556, 1.20, t, { hasReply: false });
    } else if (beat.index === 2) {
      // Beat C: "A giant noisy rug vacuum" — Articulated Cardboard Cyclone Vacuum + Brook Trout!
      var vacX = 785 + Math.sin(t * 18) * 3.5; // noisy vibration!
      var vacY = 486;
      // Vacuum Nozzle sucking up the oriental rug!
      S.drawCardboardPuppetPiece(ctx, [
        [vacX - 115, vacY + 18], [vacX + 25, vacY + 18], [vacX + 38, vacY + 52], [vacX - 135, vacY + 52]
      ], { tone: "#b83326", ribs: 2, pins: [[vacX - 95, vacY + 38], [vacX + 8, vacY + 38]] });
      // Inflated vibrating dust-bag canister upright
      var bagSwell = Math.sin(t * 15) * 5;
      S.drawCardboardPuppetPiece(ctx, [
        [vacX - 24, vacY + 18], [vacX - 38 - bagSwell, vacY - 165],
        [vacX + 16 + bagSwell, vacY - 172], [vacX + 24, vacY + 18]
      ], { tone: "#7b8489", ribs: 4, pin: { x: vacX, y: vacY + 6, r: 5, metal: "brass" } });
      // IK Corrugated Suction Hose arching into the rug wave!
      var hoseIK = S.solveIK2(vacX - 26, vacY - 75, 95, 95, vacX - 122, vacY + 28, -1);
      drawJointedCardLimb(ctx, S, hoseIK, 24, 22, "#46494c", "#5d6266", "silver");
      // Swirling dust & bubble vortex streaks entering nozzle
      ctx.strokeStyle = "rgba(251, 250, 245, 0.72)";
      ctx.lineWidth = 2.2;
      ctx.setLineDash([8, 6]);
      for (var vs = 0; vs < 3; vs++) {
        ctx.beginPath();
        ctx.moveTo(vacX - 230, vacY + 10 + vs * 16 + Math.sin(t * 10 + vs) * 8);
        ctx.lineTo(vacX - 125, vacY + 34);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      S.drawBrookTrout(ctx, vacX + 148, 368 + Math.sin(t * 3.0) * 7, 1.10, t, false);
    } else {
      // Beat D: "An alien zoo’s human cage" — Glowing Vivarium Containment Bars & Specimen Dome!
      ctx.save();
      // Glowing cyan-emerald laser cage bars across the parlor specimen habitat
      for (var bxBar = openX + 85; bxBar < openX + openW - 50; bxBar += 92) {
        var pulse = 0.55 + 0.35 * Math.sin(t * 4.0 + bxBar * 0.02);
        ctx.strokeStyle = "rgba(15, 215, 185, " + pulse.toFixed(3) + ")";
        ctx.lineWidth = 4.0;
        ctx.beginPath();
        ctx.moveTo(bxBar, openY + 95);
        ctx.lineTo(bxBar, openY + openH);
        ctx.stroke();
        S.drawSplitPin(ctx, bxBar, openY + 102, 4.5, { metal: "silver" });
      }
      // Curved brass-and-glass specimen header ring
      ctx.strokeStyle = "#d4a44c";
      ctx.lineWidth = 5.0;
      ctx.beginPath();
      ctx.moveTo(openX + 40, openY + 102);
      ctx.lineTo(openX + openW - 40, openY + 102);
      ctx.stroke();
      ctx.restore();

      S.drawAlienSaucer(ctx, 640, 148, 1.15, t, 460, 385, { beamSpread: 165 });
    }

    ctx.restore(); // end proscenium recess clip

    // Hinged Dark Carved Parlor Double Shutters Swinging Open at Proscenium Jambs (les-lieux-dune-fugue!)
    var swing = 0.68 + Math.sin(t * 0.55) * 0.05;
    var dw = 78 * swing;
    ctx.save();
    ctx.fillStyle = "#1c1511";
    ctx.strokeStyle = "#0a0705";
    ctx.lineWidth = 2.4;
    // Left shutter
    ctx.beginPath();
    ctx.moveTo(openX, openY);
    ctx.lineTo(openX + dw, openY + 18);
    ctx.lineTo(openX + dw, openY + openH - 18);
    ctx.lineTo(openX, openY + openH);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Right shutter
    ctx.beginPath();
    ctx.moveTo(openX + openW, openY);
    ctx.lineTo(openX + openW - dw, openY + 18);
    ctx.lineTo(openX + openW - dw, openY + openH - 18);
    ctx.lineTo(openX + openW, openY + openH);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // Climbing Reply Snail on the Carved Right Sandstone Jamb in Beat C!
    if (beat.index === 2) {
      S.drawMailSnail(ctx, openX + openW + 46, S.lerp(530, 185, u), 1.18, t, { rot: -Math.PI * 0.5, hasReply: true });
    }
    drawInteractiveSnailOverride(ctx, S, W, H, t, state, beat);

    // Captioned-only Perec Literary Archival Kicker at top-left of masonry (0 text in blind mode!)
    if (!S.isBlind(state)) {
      ctx.save();
      ctx.fillStyle = "rgba(251, 250, 245, 0.86)";
      ctx.font = '600 13px "JetBrains Mono", monospace';
      ctx.textAlign = "left";
      S.safeText(ctx, "P39 · PRISE " + beat.code + " · SALON ENGLOUTI", 36, 40, state);
      ctx.restore();
    }

    applyLampOffDimmer(ctx, W, H, state, 0.40);
    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 39);
  }

  // ============================================================================
  // PORTHOLE #40 · REEF ("duchamp-optic")
  // Outrapo (Reversible Stage Score) × S07 Peter Foldès × Modest Mouse Dashboard
  // Twin counter-spinning cassette hub rotors on dark engraved workshop slate
  // unspooling & reversing ribbons across tape -> cranberry sauce -> jukebox -> space city!
  // ============================================================================
  function renderPortal40(ctx, W, H, rawT, state) {
    var S = getStage();
    if (!S) return;
    var beat = S.resolveBeat(rawT, state);
    var t = beat.t;
    var u = beat.u;
    var plates = S.getPortalPlates(40);
    var pImg = plates.portholeImg;
    var aImg = plates.atlasImg;

    S.beginCamera(ctx, W, H, t, { state: state, zoom: 1.0 });

    // 1. Dark Engraved Duchamp/Outrapo Workshop Slate (covers full 1280x720!)
    S.drawBolasBackdrop(ctx, W, H, "duchamp-optic", null, t, state);

    var pxFar = S.parallaxX(0.22, t, state);
    var pyFar = S.parallaxY(0.22, t, state);
    var pxMid = S.parallaxX(0.50, t, state);
    var pyMid = S.parallaxY(0.50, t, state);

    // Foraged Atlas Plate: Modest Mouse "Dashboard" Sailor & Battered Tabletop (atlas-25.webp)
    S.drawScissorCutout(
      ctx, aImg, 245, 140, 335, 380,
      106 + pxFar, 128 + pyFar, 255, 295,
      [[0.12, 0.05], [0.86, 0.04], [0.96, 0.56], [0.90, 0.96], [0.06, 0.94]],
      { filter: "mono", haloWidth: 4.0, alpha: 0.72, rot: -0.03 }
    );
    // Battered Wooden Bench/Tabletop Slab along bottom of workshop slate (dresses y=536..720 cleanly!)
    S.drawScissorCutout(
      ctx, aImg, 160, 446, 480, 105,
      140 + pxMid * 0.4, 540, 1000, 175,
      [[0.02, 0.06], [0.98, 0.04], [0.99, 0.96], [0.01, 0.96]],
      { filter: "sepia", haloWidth: 4.0, alpha: 0.88 }
    );

    // ---------- 2. Stacked Sugar-Cube Reef / Crystal Tower Cutouts from p40.jpg ----------
    // S47 Sound-to-Action: towers pulse gently in A/C and telescope into skyscrapers in Beat D!
    var cityRise = (beat.index === 3) ? (58 * S.spring(beat.localT, 0.05, 9, 3.8)) : 0;
    var beatPulse = (beat.index === 2 || beat.index === 3) ? Math.abs(Math.sin(t * 6.2)) * 14 : 0;

    // Left Tower, Center Tall Reef Tower, Right Tower from p40.jpg
    var towers = [
      { sx: 135, sy: 198, sw: 84, sh: 238, dx: 356 + pxMid, dy: 215 - cityRise * 0.7 - beatPulse, dw: 122, dh: 325 + cityRise * 0.7 },
      { sx: 238, sy: 132, sw: 114, sh: 336, dx: 566 + pxMid, dy: 126 - cityRise - beatPulse * 1.2, dw: 158, dh: 420 + cityRise },
      { sx: 416, sy: 192, sw: 92, sh: 245, dx: 792 + pxMid, dy: 208 - cityRise * 0.8 - beatPulse, dw: 128, dh: 332 + cityRise * 0.8 }
    ];

    // In Beat C ("A booming underwater jukebox"), frame the towers & reels inside a Glowing Neon Jukebox Arch!
    if (beat.index === 2) {
      ctx.save();
      var jbX = 330 + pxMid, jbY = 82, jbW = 620, jbH = 485;
      S.drawCutoutPaperEdge(ctx, [
        [jbX, jbY + jbH], [jbX, jbY + 185], [jbX + 68, jbY + 48],
        [jbX + jbW * 0.5, jbY], [jbX + jbW - 68, jbY + 48],
        [jbX + jbW, jbY + 185], [jbX + jbW, jbY + jbH]
      ], "#2c1d33", "#14110d", { paperRim: 5.5 });
      // Glowing neon-tube trim around jukebox arch (teal & amber/crimson pulsing on beat!)
      ctx.strokeStyle = (Math.floor(t * 4) % 2 === 0) ? "#0f8f80" : "#f3d184";
      ctx.lineWidth = 7.0;
      ctx.beginPath();
      ctx.arc(jbX + jbW * 0.5, jbY + 210, jbW * 0.44, Math.PI, 0);
      ctx.stroke();
      // Horizontal brass speaker grille slats
      for (var gs = 0; gs < 5; gs++) {
        ctx.fillStyle = "#d4a44c";
        ctx.fillRect(jbX + 86, jbY + 235 + gs * 26, jbW - 172, 8);
      }
      ctx.restore();
    }

    for (var twi = 0; twi < towers.length; twi++) {
      var tw = towers[twi];
      S.drawScissorCutout(
        ctx, pImg, tw.sx, tw.sy, tw.sw, tw.sh,
        tw.dx, tw.dy, tw.dw, tw.dh,
        [[0.18, 0.02], [0.82, 0.03], [0.94, 0.45], [0.98, 0.96], [0.04, 0.97], [0.08, 0.45]],
        {
          haloWidth: 4.2,
          tint: beat.index === 3 ? "rgba(120, 235, 245, 0.22)" : null,
          alpha: beat.index === 2 ? 0.68 : 0.96
        }
      );

      // Beat D: Glowing Crystal Spire Caps & Tiny Lit Space-City Windows on each Sugar Tower!
      if (beat.index === 3) {
        S.drawCutoutPaperEdge(ctx, [
          [tw.dx + tw.dw * 0.18, tw.dy + 8],
          [tw.dx + tw.dw * 0.50, tw.dy - 48],
          [tw.dx + tw.dw * 0.82, tw.dy + 8]
        ], "#aef2eb", "#14110d", { paperRim: 2.5, shadow: false });
        for (var wy = tw.dy + 38; wy < tw.dy + tw.dh - 55; wy += 36) {
          ctx.fillStyle = ((Math.round(wy + twi * 17) % 2) === 0) ? "#fae194" : "#0f8f80";
          ctx.fillRect(tw.dx + tw.dw * 0.34, wy, 10, 14);
          ctx.fillRect(tw.dx + tw.dw * 0.56, wy, 10, 14);
        }
      }
    }

    // ---------- 3. Outrapo Reversible Twin Cassette Rotor Hubs + Peter Foldès Morphing Ribbons ----------
    // Outrapo rule: Forward (+1) in Beats A & C; Explicit Reverse (-1) in Beats B & D!
    var spinDir = (beat.index === 1 || beat.index === 3) ? -1 : 1;
    var spinRate = (beat.index === 2) ? 4.4 : 2.5;
    var reelAngle = t * spinRate * spinDir;

    var leftReelX = 438 + pxMid, rightReelX = 842 + pxMid, reelY = 486 + pyMid * 0.4;

    // Peter Foldès Metamorphosing Unspooling Ribbons!
    //   Beat A: Bronze-brown magnetic cassette tape loops curling upward like kelp
    //   Beat B: Thick glossy ridged crimson cranberry-sauce ribbons pouring from a tin can onto a platter!
    //   Beat C: Vibrant neon soundwave ribbons & cut-paper musical notes!
    //   Beat D: Luminous cyan-gold orbital skyway bridges linking the sugar-crystal towers!
    ctx.save();
    var ribbonCount = 3;
    for (var rb = 0; rb < ribbonCount; rb++) {
      var rCol = "#5c3b21";
      var rStroke = "#f3d184";
      var rWidth = 13;
      if (beat.index === 1) {
        rCol = (rb === 1) ? "#9e1420" : "#c41e2e";
        rStroke = "#fbfaf5";
        rWidth = 24; // thick jiggly cranberry sauce!
      } else if (beat.index === 2) {
        rCol = (rb % 2 === 0) ? "#0f8f80" : "#d42a1e";
        rStroke = "#fbfaf5";
        rWidth = 11;
      } else if (beat.index === 3) {
        rCol = (rb % 2 === 0) ? "#0f8f80" : "#f3d184";
        rStroke = "#ffffff";
        rWidth = 9;
      }

      ctx.beginPath();
      var steps = 28;
      for (var s = 0; s <= steps; s++) {
        var su = s / steps;
        var archH = 290 + rb * 42;
        var rx = S.lerp(leftReelX, rightReelX, su) + Math.sin(su * TAU * 1.5 + t * 2.8 * spinDir + rb) * (36 + (beat.index === 1 ? 18 : 0));
        var ry = reelY - Math.sin(su * Math.PI) * archH + Math.cos(su * TAU * 2 + t * 3.4 + rb) * 18;
        if (s === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.strokeStyle = rStroke;
      ctx.lineWidth = rWidth + 5;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.strokeStyle = rCol;
      ctx.lineWidth = rWidth;
      ctx.stroke();
    }
    ctx.restore();

    // Beat B Extra: Tipped Corrugated Cranberry Tin Can at top-center + White Platter!
    if (beat.index === 1) {
      ctx.save();
      ctx.translate(640 + pxMid, 126);
      ctx.rotate(0.42 + Math.sin(t * 3.2) * 0.08);
      S.drawCardboardPuppetPiece(ctx, [[-44, -52], [44, -52], [44, 52], [-44, 52]], { tone: "#b8bcc0", ribs: 5 });
      S.drawCutoutPaperEdge(ctx, [[-44, -18], [44, -18], [44, 18], [-44, 18]], "#b81d28", "#14110d", { paperRim: 0, shadow: false });
      ctx.restore();

      S.drawTurkeyCutawayBadge(ctx, 118, 492, 0.96, t, { dispatch: 0.9 });
      S.drawMailSnail(ctx, S.lerp(235, 1045, u), 558, 1.24, t, { hasReply: false });
    }

    // Beat C Extra: Floating Cut-Paper Eighth-Note Silhouettes (100% geometric curves, 0 text!) + Brook Trout!
    if (beat.index === 2) {
      for (var mn = 0; mn < 4; mn++) {
        var nu = (t * 0.38 + mn * 0.25) % 1;
        var nx = 440 + mn * 135 + Math.sin(t * 3 + mn) * 22;
        var ny = S.lerp(420, 120, nu);
        ctx.save();
        ctx.translate(nx, ny);
        ctx.rotate(Math.sin(t * 2.5 + mn) * 0.2);
        S.drawCutoutPaperEdge(ctx, [
          [-14, 10], [-4, 2], [2, 2], [2, -26], [22, -20], [22, -10], [8, -14], [8, 12], [-6, 18]
        ], mn % 2 === 0 ? "#fae194" : "#0f8f80", "#14110d", { paperRim: 2.2, shadow: false });
        ctx.restore();
      }
      S.drawBrookTrout(ctx, 1012, 308 + Math.sin(t * 4.2) * 10, 1.08, t, false);
      S.drawMailSnail(ctx, 1162, S.lerp(530, 185, u), 1.18, t, { rot: -Math.PI * 0.5, hasReply: true });
    }

    // Render Twin Counter-Spinning Cassette Reel Rotors (foraged p40 reel rim + rotating 6-window cardboard hub!)
    var reelXs = [leftReelX, rightReelX];
    for (var ri = 0; ri < 2; ri++) {
      var rx0 = reelXs[ri];
      var wooferScale = (beat.index === 2) ? (1.0 + Math.abs(Math.sin(t * 6.2 + ri)) * 0.10) : 1.0;
      ctx.save();
      ctx.translate(rx0, reelY);
      ctx.scale(wooferScale, wooferScale);

      // Outer white scissor-cutout paper halo
      ctx.fillStyle = "#fbfaf5";
      ctx.beginPath(); ctx.arc(0, 0, 74, 0, TAU); ctx.fill();

      // Rotating cassette spool plate crop + handmade 6-spoke cardboard hub
      ctx.rotate(reelAngle * (ri === 0 ? 1 : -1));
      ctx.save();
      ctx.beginPath(); ctx.arc(0, 0, 68, 0, TAU); ctx.clip();
      if (pImg && pImg.complete && pImg.naturalWidth > 0) {
        ctx.drawImage(pImg, 160, 402, 116, 102, -70, -70, 140, 140);
      } else {
        ctx.fillStyle = "#8e9296";
        ctx.fillRect(-70, -70, 140, 140);
      }
      ctx.restore();

      // Dark magnetic tape pack ring (or crimson cranberry spool in B!)
      ctx.strokeStyle = (beat.index === 1) ? "#9e1420" : "#3a2718";
      ctx.lineWidth = 16;
      ctx.beginPath(); ctx.arc(0, 0, 44, 0, TAU); ctx.stroke();

      // 6-Spoke Metallic Cardboard Hub + Central Brass Split-Pin!
      ctx.strokeStyle = "#d8dad9";
      ctx.lineWidth = 5.5;
      for (var spk = 0; spk < 6; spk++) {
        var aSpk = (spk / 6) * TAU;
        ctx.beginPath();
        ctx.moveTo(Math.cos(aSpk) * 14, Math.sin(aSpk) * 14);
        ctx.lineTo(Math.cos(aSpk) * 64, Math.sin(aSpk) * 64);
        ctx.stroke();
      }
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 3.0;
      ctx.beginPath(); ctx.arc(0, 0, 68, 0, TAU); ctx.stroke();
      S.drawSplitPin(ctx, 0, 0, 7.5, { metal: "brass" });
      ctx.restore();
    }

    if (beat.index === 3) {
      S.drawAlienSaucer(ctx, 965, 122, 1.16, t, 645, 340, { beamSpread: 185 });
    }
    if (beat.index === 0 || beat.index === 2) {
      drawRisingBubbles(ctx, S, t, state, 12, 220, 1060, 540, 120, "rgba(215, 240, 238, 0.45)");
    }

    drawInteractiveSnailOverride(ctx, S, W, H, t, state, beat);

    // Captioned-only Outrapo Forward/Reverse Cue Indicator (0 text in blind mode!)
    if (!S.isBlind(state)) {
      ctx.save();
      ctx.fillStyle = "rgba(251, 250, 245, 0.82)";
      ctx.font = '600 12.5px "JetBrains Mono", monospace';
      ctx.textAlign = "left";
      var dirTag = spinDir > 0 ? "▶ OUTRAPO BOBINE · SENS DIRECT" : "◀ OUTRAPO BOBINE · INVERSION";
      S.safeText(ctx, dirTag, 38, 42, state);
      ctx.restore();
    }

    S.drawLampBeam(ctx, W, H, t, state, { x: 640, y: 10, aimX: 640, spread: 310, alpha: 0.11 });
    applyLampOffDimmer(ctx, W, H, state, 0.38);
    S.endCamera(ctx);
    S.drawCutShutter(ctx, W, H, t, state);
    S.drawBolasSlateAndStrip(ctx, W, H, t, state, 40);
  }

  // ---------- Register Crew 08 Scenes (#36–#40) ----------
  var SCENES = {
    36: {
      id: 36,
      station: "#36 · Bench",
      bolasStyle: "daumier-litho",
      duration: DURATION,
      preload: function () { var S = getStage(); return S ? S.preloadPortalPlates(36) : Promise.resolve(); },
      render: renderPortal36
    },
    37: {
      id: 37,
      station: "#37 · Bulkhead",
      bolasStyle: "queneau-rostrum",
      duration: DURATION,
      preload: function () { var S = getStage(); return S ? S.preloadPortalPlates(37) : Promise.resolve(); },
      render: renderPortal37
    },
    38: {
      id: 38,
      station: "#38 · Visor",
      bolasStyle: "queneau-rostrum",
      duration: DURATION,
      preload: function () { var S = getStage(); return S ? S.preloadPortalPlates(38) : Promise.resolve(); },
      render: renderPortal38
    },
    39: {
      id: 39,
      station: "#39 · Parlor",
      bolasStyle: "perec-stage",
      duration: DURATION,
      preload: function () { var S = getStage(); return S ? S.preloadPortalPlates(39) : Promise.resolve(); },
      render: renderPortal39
    },
    40: {
      id: 40,
      station: "#40 · Reef",
      bolasStyle: "duchamp-optic",
      duration: DURATION,
      preload: function () { var S = getStage(); return S ? S.preloadPortalPlates(40) : Promise.resolve(); },
      render: renderPortal40
    }
  };

  if (root) {
    root.PORTAL_REMAKE_SCENES = root.PORTAL_REMAKE_SCENES || {};
    for (var k in SCENES) {
      if (Object.prototype.hasOwnProperty.call(SCENES, k)) {
        root.PORTAL_REMAKE_SCENES[k] = SCENES[k];
      }
    }
    if (root.SCION_STAGE && typeof root.SCION_STAGE.preloadPortalPlates === "function") {
      root.SCION_STAGE.preloadPortalPlates([36, 37, 38, 39, 40]);
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = SCENES;
  }
})(typeof window !== "undefined" ? window : globalThis);
