/* Crew 07 · Handmade PAELEO / Oulipo + Video-to-Game Portal Scenes (#31–#35)
 * Portholes:
 *   #31 · Galley B  — Dented bread-roll tin stamped WARM TO 375°F (Thermal Inversion · SCION 51)
 *   #32 · Beak Arm  — Scissor-jack tongs pinching a skeleton key (Gadget Extension · SCION 13)
 *   #33 · Salon     — Velvet iris frame around culvert bar shadows (Mystimation Silhouette · SCION 02)
 *   #34 · Organ     — Cutaway boiler room with bellows & pipes (Cutaway Section · SCION 31)
 *   #35 · Post #44  — 1943 canvas mail sack spilling at Box #44 (Fixed-Shot Handoff · Oucipo)
 */
(function () {
  "use strict";

  window.PORTAL_SCENES = window.PORTAL_SCENES || {};

  var BASE_W = 1280;
  var BASE_H = 720;
  var COCKPIT_H = 536;
  var PORT_CX = 640;
  var PORT_CY = 255;
  var PORT_R = 185;
  var PORT_OUTER_R = 228;

  // --- Deterministic Math & Easing Helpers ---
  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }
  function lerp(a, b, u) {
    return a + (b - a) * u;
  }
  function smoothstep(e0, e1, x) {
    var u = clamp((x - e0) / (e1 - e0 || 1e-6), 0, 1);
    return u * u * (3 - 2 * u);
  }
  function easeOutBack(x) {
    var u = clamp(x, 0, 1);
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
  }
  function hash01(n) {
    var s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  // Normalize time & interactive state for both 10s film render and live 60fps browser play
  function resolveSceneState(tRaw, state, defaultTool, defaultRoll) {
    var tNum = typeof tRaw === "number" && isFinite(tRaw) ? Math.max(0, tRaw) : 0;
    var t = tNum <= 10.0001 ? tNum : ((tNum % 10) + 10) % 10;
    var st = state && typeof state === "object" ? state : null;

    var showCaptions = !(st && st.showCaptions === false);

    // Control states: physical transition at t = 1.0s unless interactively overridden
    var autoLamp = defaultTool === "lamp" ? t >= 1.0 : false;
    var autoBallast = defaultTool === "ballast" ? t >= 1.0 : false;

    var lampOn = st && typeof st.lamp === "boolean" ? st.lamp : autoLamp;
    var ballastOn = st && typeof st.ballast === "boolean" ? st.ballast : autoBallast;

    // Smooth optical / hydraulic transition curves
    var lampLevel;
    if (st && typeof st.lamp === "boolean") {
      lampLevel = st.lamp ? 1.0 : 0.0;
    } else if (defaultTool === "lamp") {
      lampLevel = smoothstep(0.96, 1.38, t);
    } else {
      lampLevel = 0.0;
    }

    var ballastLevel;
    if (st && typeof st.ballast === "boolean") {
      ballastLevel = st.ballast ? 1.0 : 0.0;
    } else if (defaultTool === "ballast") {
      ballastLevel = smoothstep(0.96, 1.48, t);
    } else {
      ballastLevel = 0.0;
    }

    var viewOverride = st && (st.view === "turkey" || st.view === "trout") ? st.view : "auto";
    var act; // "setup" | "turkey" | "trout"
    if (viewOverride === "turkey") {
      act = "turkey";
    } else if (viewOverride === "trout") {
      act = "trout";
    } else {
      act = t < 2.0 ? "setup" : t < 5.6 ? "turkey" : "trout";
    }

    var troutBlend = viewOverride === "trout" ? 1 : viewOverride === "turkey" ? 0 : smoothstep(5.52, 5.88, t);
    var roll = st && typeof st.roll === "number" && st.roll >= 1 && st.roll <= 6
      ? Math.floor(st.roll)
      : (act === "trout" ? defaultRoll : 0);

    var chartProgress;
    if (viewOverride === "trout") {
      chartProgress = clamp(0.45 + 0.55 * Math.sin(tNum * 0.8) * 0.2 + 0.55, 0, 1);
    } else if (viewOverride === "turkey") {
      chartProgress = 0;
    } else {
      chartProgress = smoothstep(5.7, 8.3, t);
    }

    return {
      t: t,
      tCont: tNum,
      showCaptions: showCaptions,
      lampOn: lampOn,
      ballastOn: ballastOn,
      lampLevel: lampLevel,
      ballastLevel: ballastLevel,
      defaultTool: defaultTool,
      act: act,
      troutBlend: troutBlend,
      roll: roll,
      chartProgress: chartProgress
    };
  }

  // --- Shared Drawing Primitives (Ink, Cross-Hatching, Seaweed, Bubbles, Trout) ---
  function drawRoundRect(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  // Karel Zeman / Victorian steel-engraving line hatching inside current clip or rect
  function drawHatchLines(ctx, x, y, w, h, spacing, angleRad, color, lineWidth) {
    ctx.save();
    ctx.strokeStyle = color || "rgba(18,24,26,0.26)";
    ctx.lineWidth = lineWidth || 1;
    ctx.translate(x + w * 0.5, y + h * 0.5);
    ctx.rotate(angleRad);
    var diag = Math.hypot(w, h);
    ctx.beginPath();
    for (var d = -diag * 0.5; d <= diag * 0.5; d += spacing) {
      ctx.moveTo(d, -diag * 0.5);
      ctx.lineTo(d, diag * 0.5);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Common underwater backdrop & caustic bands inside porthole
  function drawRiverBackdrop(ctx, s, opts) {
    var o = opts || {};
    var topCol = o.topCol || "#1e5d64";
    var midCol = o.midCol || "#17484f";
    var botCol = o.botCol || "#0e2b31";
    var troutShift = s.troutBlend;

    // Slight cool/emerald luminosity shift when Trout Looks In
    var g = ctx.createLinearGradient(PORT_CX, PORT_CY - PORT_R, PORT_CX, PORT_CY + PORT_R);
    g.addColorStop(0, troutShift > 0.5 ? (o.troutTopCol || "#24767d") : topCol);
    g.addColorStop(0.58, troutShift > 0.5 ? (o.troutMidCol || "#1a565e") : midCol);
    g.addColorStop(1, botCol);
    ctx.fillStyle = g;
    ctx.fillRect(PORT_CX - PORT_R - 8, PORT_CY - PORT_R - 8, PORT_R * 2 + 16, PORT_R * 2 + 16);

    // Undulating multiplane caustic ribbons
    var currentSpeed = lerp(1.35, 0.52, s.ballastLevel);
    ctx.save();
    for (var i = 0; i < 6; i++) {
      var wy = PORT_CY - 145 + i * 34 - s.ballastLevel * 14;
      var amp = 5 + (i % 3) * 2.5;
      ctx.beginPath();
      for (var wx = PORT_CX - 195; wx <= PORT_CX + 195; wx += 16) {
        var yy = wy + Math.sin((wx * 0.024) + s.tCont * currentSpeed * 1.8 + i * 1.3) * amp;
        if (wx === PORT_CX - 195) ctx.moveTo(wx, yy);
        else ctx.lineTo(wx, yy);
      }
      ctx.strokeStyle = "rgba(175, 240, 232, " + (0.06 + (5 - i) * 0.018 + s.lampLevel * 0.03).toFixed(3) + ")";
      ctx.lineWidth = 3 + (i % 2) * 2;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Swaying creek eelgrass / kelp clump
  function drawKelpClump(ctx, baseX, baseY, blades, heightScale, t, calmFactor, tint) {
    ctx.save();
    for (var i = 0; i < blades; i++) {
      var h = (52 + hash01(baseX + i * 7) * 46) * heightScale;
      var spread = (i - (blades - 1) * 0.5) * 9;
      var sway = Math.sin(t * lerp(2.6, 1.25, calmFactor) + i * 0.9 + baseX * 0.03) * lerp(14, 5.5, calmFactor);
      ctx.beginPath();
      ctx.moveTo(baseX + spread * 0.35, baseY);
      ctx.bezierCurveTo(
        baseX + spread + sway * 0.4, baseY - h * 0.38,
        baseX + spread - sway * 0.3, baseY - h * 0.72,
        baseX + spread + sway, baseY - h
      );
      ctx.bezierCurveTo(
        baseX + spread + 6 - sway * 0.2, baseY - h * 0.7,
        baseX + spread + 7 + sway * 0.35, baseY - h * 0.35,
        baseX + spread * 0.35 + 6, baseY
      );
      ctx.closePath();
      ctx.fillStyle = tint || (i % 2 === 0 ? "#2d5f53" : "#3b7664");
      ctx.fill();
      ctx.strokeStyle = "#122423";
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Layered creek-bed stones & sandy floor
  function drawCreekBed(ctx, floorY, seed, tintFloor) {
    ctx.save();
    var fg = ctx.createLinearGradient(PORT_CX, floorY - 15, PORT_CX, PORT_CY + PORT_R + 10);
    fg.addColorStop(0, tintFloor || "#5b6758");
    fg.addColorStop(0.45, "#424d43");
    fg.addColorStop(1, "#242e2a");
    ctx.beginPath();
    ctx.moveTo(PORT_CX - 200, PORT_CY + 210);
    ctx.lineTo(PORT_CX - 200, floorY + 8);
    ctx.bezierCurveTo(PORT_CX - 90, floorY - 12, PORT_CX + 85, floorY + 14, PORT_CX + 200, floorY - 4);
    ctx.lineTo(PORT_CX + 200, PORT_CY + 210);
    ctx.closePath();
    ctx.fillStyle = fg;
    ctx.fill();
    ctx.strokeStyle = "#18221f";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Scattered inked river pebbles
    for (var i = 0; i < 11; i++) {
      var px = PORT_CX - 150 + i * 29 + (hash01(seed + i * 3) - 0.5) * 14;
      var py = floorY + 12 + hash01(seed + i * 11) * 38;
      var rx = 7 + hash01(seed + i * 17) * 11;
      var ry = rx * 0.48;
      ctx.beginPath();
      ctx.ellipse(px, py, rx, ry, (hash01(seed + i) - 0.5) * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? "#6d7868" : "#4e594d";
      ctx.fill();
      ctx.strokeStyle = "#18201e";
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Volumetric amber lamp cone shooting from 6-o'clock housing into the porthole
  function drawVolumetricLampBeam(ctx, s, aimX, aimY, spread) {
    if (s.lampLevel <= 0.01) return;
    ctx.save();
    var bx = PORT_CX;
    var by = PORT_CY + PORT_R - 4;
    var tx = aimX !== undefined ? aimX : PORT_CX;
    var ty = aimY !== undefined ? aimY : PORT_CY - 40;
    var sp = spread || 125;

    var grad = ctx.createRadialGradient(bx, by + 10, 8, tx, ty, 290);
    grad.addColorStop(0, "rgba(255, 224, 132, " + (0.46 * s.lampLevel).toFixed(3) + ")");
    grad.addColorStop(0.45, "rgba(246, 188, 88, " + (0.22 * s.lampLevel).toFixed(3) + ")");
    grad.addColorStop(1, "rgba(246, 188, 88, 0)");

    ctx.globalCompositeOperation = "screen";
    ctx.beginPath();
    ctx.moveTo(bx - 26, by);
    ctx.lineTo(tx - sp, ty - 95);
    ctx.lineTo(tx + sp, ty - 95);
    ctx.lineTo(bx + 26, by);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Floating illuminated silt motes inside the beam
    ctx.fillStyle = "rgba(255, 240, 185, " + (0.55 * s.lampLevel).toFixed(3) + ")";
    for (var i = 0; i < 14; i++) {
      var u = ((hash01(i * 19.3) + s.tCont * 0.06) % 1);
      var mx = lerp(bx, tx, u) + Math.sin(s.tCont * 1.7 + i * 2.1) * (20 + u * 55);
      var my = lerp(by - 12, ty - 60, u);
      var mr = 1.2 + (i % 3) * 0.7;
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Pre-action murky silt veil (clears when lamp aims or ballast settles)
  function drawMurkAndCurrentOverlay(ctx, s) {
    var murk = (1 - Math.max(s.lampLevel * 0.85, s.ballastLevel * 0.72)) * 0.44;
    if (murk > 0.02) {
      ctx.save();
      ctx.fillStyle = "rgba(11, 28, 33, " + murk.toFixed(3) + ")";
      ctx.fillRect(PORT_CX - PORT_R - 5, PORT_CY - PORT_R - 5, PORT_R * 2 + 10, PORT_R * 2 + 10);
      // Drifting dusk silt wisps before control is operated
      ctx.strokeStyle = "rgba(140, 178, 175, " + (murk * 0.42).toFixed(3) + ")";
      ctx.lineWidth = 4;
      for (var k = 0; k < 5; k++) {
        var sy = PORT_CY - 110 + k * 54;
        var sx = PORT_CX - 180 + ((s.tCont * 95 + k * 77) % 260);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(sx + 45, sy - 8, sx + 92, sy + 4);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Subtle refraction ripple across the glass right at the t = 5.6s Turkey -> Trout cut
    if (s.t >= 5.45 && s.t <= 6.05) {
      var rp = (s.t - 5.45) / 0.6;
      var rr = rp * 220;
      ctx.save();
      ctx.strokeStyle = "rgba(185, 248, 240, " + ((1 - rp) * 0.65).toFixed(3) + ")";
      ctx.lineWidth = 5 * (1 - rp) + 1;
      ctx.beginPath();
      ctx.arc(PORT_CX, PORT_CY, rr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // --- Articulated Spotted Brook Trout Rig (Salvelinus fontinalis) ---
  // Supports spine wave, articulated lower jaw, rowing pectoral fin, dorsal/caudal fins, spots, and props!
  function drawBrookTrout(ctx, cfg) {
    var x = cfg.x || PORT_CX;
    var y = cfg.y || PORT_CY;
    var scale = cfg.scale || 1.0;
    var flipX = cfg.facingLeft ? -1 : 1; // +1 faces right, -1 faces left; wait: default drawn nose at LEFT (-x) so facingLeft=true -> nose left!
    // Let's draw canonical Trout facing LEFT (nose at -68, tail at +75), so facingLeft=true uses +1, facingRight uses -1!
    var dir = cfg.facingRight ? -1 : 1;
    var rot = cfg.angle || 0;
    var t = cfg.t || 0;
    var jawOpen = clamp(cfg.jawOpen || 0, 0, 1);
    var swimSpeed = cfg.swimSpeed !== undefined ? cfg.swimSpeed : 5.2;
    var wag = Math.sin(t * swimSpeed + (cfg.phase || 0));
    var wag2 = Math.sin(t * swimSpeed - 1.1 + (cfg.phase || 0));

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(dir * scale, scale);

    var tailY = wag2 * 9.5;
    var midY = wag * 3.2;

    // Dorsal fin (articulated tilt)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-4, -22 + midY * 0.5);
    ctx.quadraticCurveTo(14, -42 + midY, 28, -34 + midY);
    ctx.quadraticCurveTo(24, -19 + midY * 0.5, 18, -17 + midY * 0.5);
    ctx.closePath();
    ctx.fillStyle = "#567d68";
    ctx.fill();
    ctx.strokeStyle = "#14201d";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    // Fin rays
    ctx.beginPath();
    ctx.moveTo(3, -21 + midY * 0.5); ctx.lineTo(12, -35 + midY);
    ctx.moveTo(11, -19 + midY * 0.5); ctx.lineTo(20, -34 + midY);
    ctx.strokeStyle = "rgba(20,32,29,0.55)";
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.restore();

    // Adipose fin & Anal fin
    ctx.beginPath();
    ctx.moveTo(40, -13 + tailY * 0.45);
    ctx.quadraticCurveTo(49, -22 + tailY * 0.55, 53, -12 + tailY * 0.55);
    ctx.closePath();
    ctx.fillStyle = "#5f856e";
    ctx.fill();
    ctx.strokeStyle = "#14201d";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Anal fin with white-and-black Brook Trout leading edge
    ctx.beginPath();
    ctx.moveTo(22, 16 + midY * 0.5);
    ctx.lineTo(31, 32 + tailY * 0.4);
    ctx.quadraticCurveTo(41, 29 + tailY * 0.4, 39, 13 + tailY * 0.35);
    ctx.closePath();
    ctx.fillStyle = "#c86d4c";
    ctx.fill();
    ctx.strokeStyle = "#14201d";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(22, 16 + midY * 0.5);
    ctx.lineTo(30, 31 + tailY * 0.4);
    ctx.strokeStyle = "#f6f3e8";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Forked Caudal Tail Fin (articulated whip)
    ctx.save();
    ctx.translate(58, tailY * 0.72);
    ctx.rotate(wag2 * 0.18);
    ctx.beginPath();
    ctx.moveTo(-4, -7);
    ctx.quadraticCurveTo(16, -24, 29, -23);
    ctx.quadraticCurveTo(20, -4, 15, 0);
    ctx.quadraticCurveTo(20, 5, 28, 23);
    ctx.quadraticCurveTo(14, 23, -4, 7);
    ctx.closePath();
    ctx.fillStyle = "#4d7462";
    ctx.fill();
    ctx.strokeStyle = "#14201d";
    ctx.lineWidth = 2;
    ctx.stroke();
    for (var r = -2; r <= 2; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * 2);
      ctx.lineTo(21, r * 8);
      ctx.strokeStyle = "rgba(20,32,29,0.45)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // Main Torpedo Body (olive-emerald back, rose-pink lateral band, golden-cream belly)
    ctx.beginPath();
    ctx.moveTo(-66, -3); // snout tip
    ctx.bezierCurveTo(-48, -22, -8, -26 + midY * 0.5, 26, -18 + midY * 0.4);
    ctx.bezierCurveTo(43, -14 + tailY * 0.45, 53, -9 + tailY * 0.65, 60, -6 + tailY * 0.7);
    ctx.lineTo(60, 6 + tailY * 0.7);
    ctx.bezierCurveTo(52, 9 + tailY * 0.65, 40, 15 + tailY * 0.4, 20, 18 + midY * 0.5);
    ctx.bezierCurveTo(-4, 22 + midY * 0.4, -30, 20, -44, 11);
    // Mouth cutout when jaw opens
    ctx.lineTo(-59, 4 + jawOpen * 3);
    ctx.lineTo(-47, 1);
    ctx.lineTo(-66, -3);
    ctx.closePath();

    var bg = ctx.createLinearGradient(0, -25, 0, 22);
    bg.addColorStop(0, "#2f594c");
    bg.addColorStop(0.45, "#6b937a");
    bg.addColorStop(0.68, "#d7987c");
    bg.addColorStop(1, "#ebdfc2");
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = "#131e1c";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Articulated Lower Jaw
    ctx.save();
    ctx.translate(-44, 8);
    ctx.rotate(-jawOpen * 0.52);
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.quadraticCurveTo(-12, 4, -21, -3);
    ctx.quadraticCurveTo(-12, -6, 1, -2);
    ctx.closePath();
    ctx.fillStyle = "#dfd2b4";
    ctx.fill();
    ctx.strokeStyle = "#131e1c";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Optional gleaming little tooth when jawOpen > 0.35 (for #32 Mechanical Dentist!)
    if (cfg.showTooth && jawOpen > 0.25) {
      ctx.beginPath();
      ctx.moveTo(-16, -3);
      ctx.lineTo(-14, -8);
      ctx.lineTo(-11, -3);
      ctx.closePath();
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#131e1c";
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
    ctx.restore();

    // Brook Trout Signature Spots (dark dorsal speckles + gold & crimson halo dots)
    var spots = [
      [-22, -12, "#1c332b", 1.8], [-12, -15, "#1c332b", 2.0], [0, -14, "#1c332b", 1.9],
      [12, -12, "#1c332b", 1.8], [24, -10, "#1c332b", 1.7], [35, -7, "#1c332b", 1.6],
      [-16, -3, "#e8c468", 2.1], [-3, -5, "#c93b2b", 2.1], [9, -2, "#e8c468", 2.0],
      [21, -3, "#c93b2b", 1.9], [33, 0, "#e8c468", 1.8], [-8, 4, "#e8c468", 1.8],
      [5, 5, "#c93b2b", 1.9], [18, 4, "#1c332b", 1.6]
    ];
    for (var sIdx = 0; sIdx < spots.length; sIdx++) {
      var sp = spots[sIdx];
      var syOff = sp[0] > 15 ? tailY * 0.3 : midY * 0.3;
      if (sp[2] === "#c93b2b") {
        ctx.beginPath();
        ctx.arc(sp[0], sp[1] + syOff, sp[3] + 1.3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(182, 228, 220, 0.65)";
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(sp[0], sp[1] + syOff, sp[3], 0, Math.PI * 2);
      ctx.fillStyle = sp[2];
      ctx.fill();
    }

    // Gill plate (operculum) arc
    ctx.beginPath();
    ctx.arc(-32, -1, 12, -0.85, 1.05);
    ctx.strokeStyle = "#14201d";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Articulated Pectoral Fin (rows or points!)
    ctx.save();
    ctx.translate(-27, 9);
    var finAngle = cfg.finPointAngle !== undefined
      ? cfg.finPointAngle
      : (0.35 + Math.sin(t * swimSpeed * 1.15 + 0.6) * 0.28);
    ctx.rotate(finAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(10, 17, 21, 14);
    ctx.quadraticCurveTo(16, 3, 4, -2);
    ctx.closePath();
    ctx.fillStyle = "#d47958";
    ctx.fill();
    ctx.strokeStyle = "#14201d";
    ctx.lineWidth = 1.7;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1, 1);
    ctx.lineTo(18, 14);
    ctx.strokeStyle = "#faf6ea";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Expressive Eye
    ctx.beginPath();
    ctx.arc(-47, -6, 5.8, 0, Math.PI * 2);
    ctx.fillStyle = "#f8f4e6";
    ctx.fill();
    ctx.strokeStyle = "#131e1c";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    var lookX = clamp(cfg.lookX || -1.4, -2.4, 2.4);
    var lookY = clamp(cfg.lookY || 0, -2.0, 2.0);
    ctx.beginPath();
    ctx.arc(-47 + lookX, -6 + lookY, 3.0, 0, Math.PI * 2);
    ctx.fillStyle = "#111819";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-48.2 + lookX * 0.5, -7.4 + lookY * 0.5, 1.1, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Optional Hat / Saddle Props
    if (cfg.hat === "spaTowel") {
      // Folded white spa head-towel (#31 Heated Minnow Spa!)
      ctx.save();
      ctx.translate(-36, -18);
      ctx.rotate(0.14);
      drawRoundRect(ctx, -14, -7, 26, 9, 3);
      ctx.fillStyle = "#f7f4eb";
      ctx.fill();
      ctx.strokeStyle = "#1b2826";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, -2.5);
      ctx.lineTo(8, -2.5);
      ctx.strokeStyle = "#d6684b";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();
    } else if (cfg.hat === "engineer") {
      // Striped boiler-cap (#34 Organ!)
      ctx.save();
      ctx.translate(-39, -18);
      ctx.rotate(-0.1);
      ctx.beginPath();
      ctx.arc(2, 0, 11, Math.PI, 0);
      ctx.lineTo(13, 3);
      ctx.lineTo(-16, 3);
      ctx.closePath();
      ctx.fillStyle = "#5c829c";
      ctx.fill();
      ctx.strokeStyle = "#14201d";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();
    } else if (cfg.hat === "postal") {
      // 1943 Rural Mail Carrier Cap + Strapped Canvas Saddlebag (#35 Post #44!)
      ctx.save();
      ctx.translate(-38, -17);
      ctx.rotate(-0.08);
      ctx.beginPath();
      ctx.moveTo(-14, 2);
      ctx.lineTo(-6, -7);
      ctx.lineTo(10, -6);
      ctx.lineTo(12, 2);
      ctx.closePath();
      ctx.fillStyle = "#5d7485";
      ctx.fill();
      ctx.strokeStyle = "#14201d";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      // Visor + brass badge
      ctx.beginPath();
      ctx.moveTo(-14, 2);
      ctx.lineTo(-21, 4);
      ctx.lineTo(-9, 4);
      ctx.strokeStyle = "#14201d";
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.fillStyle = "#e2b857";
      ctx.fillRect(-4, -4, 4, 3);
      ctx.restore();

      // Strapped canvas saddlebag on back
      ctx.save();
      ctx.translate(-6, -6 + midY * 0.35);
      ctx.strokeStyle = "#3a2e1f";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-2, -14);
      ctx.lineTo(-2, 22);
      ctx.stroke();
      drawRoundRect(ctx, -11, -16, 19, 14, 3);
      ctx.fillStyle = "#9c8b65";
      ctx.fill();
      ctx.strokeStyle = "#1a1f1d";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // Small silver creek minnow for #31, #33
  function drawMinnow(ctx, x, y, scale, facingRight, t, phase, warmTint) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale((facingRight ? -1 : 1) * scale, scale);
    var wag = Math.sin(t * 7.5 + phase) * 3.5;
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.quadraticCurveTo(-6, -9, 14, -3 + wag * 0.4);
    ctx.lineTo(23, -8 + wag);
    ctx.lineTo(20, 0 + wag * 0.8);
    ctx.lineTo(23, 8 + wag);
    ctx.lineTo(14, 3 + wag * 0.4);
    ctx.quadraticCurveTo(-6, 9, -22, 0);
    ctx.closePath();
    ctx.fillStyle = warmTint ? "#dfb86c" : "#8fb8b2";
    ctx.fill();
    ctx.strokeStyle = "#182422";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-14, -1.5, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#141d1c";
    ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // PORTHOLE #31 · GALLEY B — Dented bread-roll tin stamped WARM TO 375°F
  // Turkey: "Thanksgiving roasting pan or spare hull?"
  // Trout:  "Heated minnow spa or floating toaster?"
  // Rule:   Thermal Inversion (SCION 51)
  // =========================================================================
  function renderPortal31(ctx, s) {
    var lift = s.ballastLevel * 20;
    drawRiverBackdrop(ctx, s, {
      topCol: "#236f6d",
      midCol: "#195254",
      botCol: "#0e2d30",
      troutTopCol: "#2b8280"
    });

    // Distant creek boulders
    ctx.save();
    ctx.fillStyle = "#244947";
    ctx.strokeStyle = "#102423";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(PORT_CX - 190, PORT_CY + 95 + lift);
    ctx.quadraticCurveTo(PORT_CX - 135, PORT_CY + 30 + lift, PORT_CX - 75, PORT_CY + 90 + lift);
    ctx.quadraticCurveTo(PORT_CX + 65, PORT_CY + 45 + lift, PORT_CX + 190, PORT_CY + 92 + lift);
    ctx.lineTo(PORT_CX + 190, PORT_CY + 160);
    ctx.lineTo(PORT_CX - 190, PORT_CY + 160);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    drawKelpClump(ctx, PORT_CX - 135, PORT_CY + 115 + lift, 5, 1.05, s.tCont, s.ballastLevel, "#2c6454");
    drawCreekBed(ctx, PORT_CY + 112 + lift, 31, "#4e6354");

    // Volumetric Lamp Cone from bottom housing
    drawVolumetricLampBeam(ctx, s, PORT_CX + 10, PORT_CY + 15 + lift, 138);

    // --- Central Prop: Sunken Dented Bread-Roll Tin Stamped WARM TO 375°F ---
    var rockRock = Math.sin(s.tCont * 1.9) * (s.act === "turkey" ? 0.032 : 0.015);
    var thermalGlow = clamp(0.28 + s.lampLevel * 0.72, 0.25, 1.0);

    ctx.save();
    ctx.translate(PORT_CX + 16, PORT_CY + 42 + lift);
    ctx.rotate(-0.34 + rockRock);

    // Rising exterior heat-shimmer waves above the tin (Thermal Inversion SCION 51)
    if (thermalGlow > 0.4) {
      ctx.save();
      for (var hw = 0; hw < 4; hw++) {
        var hx = -55 + hw * 36;
        var hy = -92 - ((s.tCont * 26 + hw * 18) % 52);
        ctx.beginPath();
        ctx.moveTo(hx, hy + 24);
        ctx.bezierCurveTo(hx - 8, hy + 14, hx + 8, hy + 6, hx, hy - 8);
        ctx.strokeStyle = "rgba(255, 222, 148, " + ((1 - ( -92 - hy ) / 52) * 0.34 * thermalGlow).toFixed(3) + ")";
        ctx.lineWidth = 2.4;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Tin outer aluminum cylinder body with matching right-side dent!
    var tinGrad = ctx.createLinearGradient(-85, -95, 105, 55);
    tinGrad.addColorStop(0, "#7c9499");
    tinGrad.addColorStop(0.32, "#c6d5d8");
    tinGrad.addColorStop(0.55, "#eef4f5");
    tinGrad.addColorStop(0.82, "#8ca3a8");
    tinGrad.addColorStop(1, "#51666b");

    ctx.beginPath();
    ctx.moveTo(-102, 34); // lower-left lip
    ctx.bezierCurveTo(-96, -34, -55, -88, 12, -88); // arched bread-tin crown
    // Right-side dent along upper flank!
    ctx.bezierCurveTo(46, -88, 66, -68, 62, -48);
    ctx.quadraticCurveTo(53, -32, 78, -18); // inward dent crease
    ctx.bezierCurveTo(96, -4, 98, 28, 86, 56); // right lip
    ctx.quadraticCurveTo(0, 12, -102, 34);
    ctx.closePath();
    ctx.fillStyle = tinGrad;
    ctx.fill();
    ctx.strokeStyle = "#172528";
    ctx.lineWidth = 2.6;
    ctx.stroke();

    // Dent crease highlight & rib lines
    ctx.beginPath();
    ctx.moveTo(46, -54);
    ctx.quadraticCurveTo(58, -32, 77, -18);
    ctx.strokeStyle = "rgba(24, 39, 42, 0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-44, -73);
    ctx.quadraticCurveTo(22, -76, 74, -6);
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Stamped embossed metal lettering: "WARM TO 375°F"
    ctx.save();
    ctx.translate(-2, -39);
    ctx.rotate(0.32);
    ctx.font = "700 13px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText("WARM TO", 1, -13);
    ctx.fillStyle = "#25383c";
    ctx.fillText("WARM TO", 0, -14);
    ctx.font = "800 24px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillText("375°F", 1.2, 10.2);
    ctx.fillStyle = "#1d2f33";
    ctx.fillText("375°F", 0, 9);
    ctx.restore();

    // Turkey Fork visual cue B (t = 3.4..5.5s): dotted chalk "SPARE HULL" rivet patch & cutout template on flank!
    var hullCue = s.act === "turkey" ? smoothstep(3.1, 3.8, s.t) : 0.25;
    if (hullCue > 0.05) {
      ctx.save();
      ctx.globalAlpha = hullCue * 0.85;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#fef4d2";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(-44, -26, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // 4 tiny brass hull rivets around spare-port template
      for (var rv = 0; rv < 4; rv++) {
        var ra = rv * Math.PI * 0.5 + 0.4;
        ctx.beginPath();
        ctx.arc(-44 + Math.cos(ra) * 22, -26 + Math.sin(ra) * 22, 2.3, 0, Math.PI * 2);
        ctx.fillStyle = "#e6b85c";
        ctx.fill();
      }
      ctx.restore();
    }

    // --- Warm Amber Thermal Cave Mouth (front opening of bread-roll tin) ---
    ctx.beginPath();
    ctx.ellipse(-8, 42, 95, 52, 0.12, Math.PI * 1.03, Math.PI * 2.04);
    ctx.quadraticCurveTo(-8, 68, -101, 34);
    ctx.closePath();

    var caveGrad = ctx.createRadialGradient(4, 18, 8, -6, 36, 98);
    caveGrad.addColorStop(0, "rgba(255, 232, 150, " + (0.95 * thermalGlow).toFixed(3) + ")");
    caveGrad.addColorStop(0.55, "rgba(238, 168, 72, " + (0.88 * thermalGlow).toFixed(3) + ")");
    caveGrad.addColorStop(1, "rgba(96, 68, 36, 0.92)");
    ctx.fillStyle = caveGrad;
    ctx.fill();

    // Rolled metal front lip rim
    ctx.beginPath();
    ctx.ellipse(-8, 42, 95, 52, 0.12, Math.PI * 1.02, Math.PI * 2.03);
    ctx.strokeStyle = "#b9cbce";
    ctx.lineWidth = 6.5;
    ctx.stroke();
    ctx.strokeStyle = "#182629";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rising pearlescent thermal bubbles inside the 375°F tin cave
    for (var b = 0; b < 9; b++) {
      var prog = ((s.tCont * (0.45 + (b % 3) * 0.14) + b * 0.23) % 1);
      var bx = -42 + (b * 13) % 86 + Math.sin(s.tCont * 3 + b) * 5;
      var by = 48 - prog * 58;
      var br = (2.0 + (b % 3) * 1.5) * (1 - prog * 0.25);
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 248, 214, " + ((1 - prog) * 0.78 * thermalGlow).toFixed(3) + ")";
      ctx.fill();
      ctx.strokeStyle = "rgba(110, 72, 24, " + ((1 - prog) * 0.45).toFixed(3) + ")";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore(); // end tilted tin local space

    // --- Act 2 vs Act 3 Staging Inside & Around the Tin ---
    // Cozy minnows basking inside the warm amber cave (gentle in Act 2, full jacuzzi circle in Act 3!)
    var minnowCount = s.act === "trout" ? 4 : 2;
    for (var m = 0; m < minnowCount; m++) {
      var mx = PORT_CX - 34 + m * 28 + Math.sin(s.tCont * 1.6 + m * 1.7) * 8;
      var my = PORT_CY + 66 + (m % 2) * 14 + lift + Math.cos(s.tCont * 2.1 + m) * 3;
      drawMinnow(ctx, mx, my, 0.78, m < minnowCount / 2, s.tCont, m * 1.4, true);
    }

    if (s.act === "turkey") {
      // Turkey Fork visual cue A: floating brass oven thermometer + savory herb sprig drifting out of roasting pan!
      var herbAlpha = smoothstep(2.05, 2.5, s.t);
      ctx.save();
      ctx.globalAlpha = herbAlpha;
      var hx2 = PORT_CX - 58 + Math.sin(s.tCont * 1.5) * 9;
      var hy2 = PORT_CY + 34 + lift - ((s.t - 2.0) * 6);
      ctx.translate(hx2, hy2);
      ctx.rotate(-0.35 + Math.sin(s.tCont * 2.4) * 0.15);
      // Rosemary/sage herb sprig
      ctx.strokeStyle = "#355e3b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-14, 6);
      ctx.quadraticCurveTo(0, 0, 16, -8);
      ctx.stroke();
      for (var lf = -2; lf <= 2; lf++) {
        ctx.beginPath();
        ctx.ellipse(lf * 5, -lf * 1.5 - 3, 5, 2.2, -0.6, 0, Math.PI * 2);
        ctx.fillStyle = "#5b8f56";
        ctx.fill();
        ctx.strokeStyle = "#1c331e";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // Tiny bobbing brass roast-thermometer dial
      ctx.translate(28, -6);
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fillStyle = "#faf3dc";
      ctx.fill();
      ctx.strokeStyle = "#b88736";
      ctx.lineWidth = 2.4;
      ctx.stroke();
      var needleAng = -0.6 + Math.sin(s.tCont * 9) * 0.18;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(needleAng) * 8, Math.sin(needleAng) * 8);
      ctx.strokeStyle = "#c83725";
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    }

    // Act 3: Spotted Brook Trout enters with spa head-towel (6.8s: testing warm spa; 9.2s: inspecting sub's glowing "toaster" filament!)
    if (s.troutBlend > 0.02) {
      var enterU = s.act === "trout" && s.t >= 5.6 ? smoothstep(5.6, 6.6, s.t) : 1;
      var inspectToasterU = s.act === "trout" && s.t >= 5.6 ? smoothstep(7.7, 8.8, s.t) : 0;

      var troutX = lerp(PORT_CX + 215, PORT_CX + 68, enterU) - inspectToasterU * 74;
      var troutY = lerp(PORT_CY + 52, PORT_CY + 58, enterU) + inspectToasterU * 26 + lift;
      var troutRot = lerp(0.06, -0.24, inspectToasterU);

      drawBrookTrout(ctx, {
        x: troutX,
        y: troutY,
        scale: lerp(0.86, 1.02, inspectToasterU),
        facingRight: false,
        angle: troutRot,
        t: s.tCont,
        jawOpen: inspectToasterU > 0.5 ? 0.22 + 0.12 * Math.sin(s.tCont * 5) : 0.08,
        hat: "spaTowel",
        lookX: inspectToasterU > 0.4 ? -2.0 : -1.2,
        lookY: inspectToasterU > 0.4 ? 1.2 : 0.3
      });

      // At 8.0-9.8s (clear at 9.2s!): golden "floating toaster" slot-coil reflection & two toast-shaped warm bubble slices rising near sub lamp!
      if (inspectToasterU > 0.2) {
        ctx.save();
        ctx.globalAlpha = inspectToasterU * 0.88;
        for (var ts = 0; ts < 2; ts++) {
          var pop = ((s.tCont * 0.75 + ts * 0.45) % 1);
          var tx2 = PORT_CX - 28 + ts * 26;
          var ty2 = PORT_CY + 132 - pop * 48;
          ctx.save();
          ctx.translate(tx2, ty2);
          ctx.rotate((ts === 0 ? -0.12 : 0.14) + Math.sin(s.tCont * 3 + ts) * 0.08);
          // Iconic arched toast-slice golden bubble outline!
          ctx.beginPath();
          ctx.moveTo(-9, 9);
          ctx.lineTo(-9, -2);
          ctx.arc(-4.5, -4, 5.5, Math.PI, -0.2);
          ctx.arc(4.5, -4, 5.5, -Math.PI + 0.2, 0);
          ctx.lineTo(9, 9);
          ctx.closePath();
          ctx.fillStyle = "rgba(255, 214, 118, " + ((1 - pop * 0.6) * 0.52).toFixed(3) + ")";
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 238, 176, " + ((1 - pop * 0.5) * 0.85).toFixed(3) + ")";
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      }
    }

    // Foreground right kelp clump for multiplane depth
    drawKelpClump(ctx, PORT_CX + 118, PORT_CY + 148 + lift, 6, 1.15, s.tCont + 1.1, s.ballastLevel, "#235347");
    drawMurkAndCurrentOverlay(ctx, s);
  }

  // =========================================================================
  // PORTHOLE #32 · BEAK ARM — Scissor-jack tongs pinching a skeleton key
  // Turkey: "Bridge lock-pick or crab pincer?"
  // Trout:  "Mechanical dentist or lock-picking burglar?"
  // Rule:   Gadget Extension (SCION 13) — Heinz Edelmann 1968 Cutout Pop
  // =========================================================================
  function renderPortal32(ctx, s) {
    var lift = s.ballastLevel * 18;
    // Heinz Edelmann crisp cerulean & turquoise cel bands
    drawRiverBackdrop(ctx, s, {
      topCol: "#2b8b8e",
      midCol: "#1f6a70",
      botCol: "#123c43",
      troutTopCol: "#31999c"
    });

    // Sunken Walland Bridge stone arch & iron padlock plate on far right
    ctx.save();
    ctx.translate(PORT_CX + 148, PORT_CY + 8 + lift);
    ctx.fillStyle = "#3a5a59";
    ctx.strokeStyle = "#122021";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-18, -150);
    ctx.lineTo(50, -150);
    ctx.lineTo(50, 145);
    ctx.lineTo(-28, 145);
    ctx.quadraticCurveTo(-10, 10, -18, -150);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Brass bridge lock escutcheon with keyhole
    drawRoundRect(ctx, -22, -34, 24, 38, 5);
    ctx.fillStyle = "#9e7e3e";
    ctx.fill();
    ctx.strokeStyle = "#141c1d";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.fillStyle = "#101819";
    ctx.beginPath();
    ctx.arc(-10, -20, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-12.2, -18, 4.4, 11);
    ctx.restore();

    drawKelpClump(ctx, PORT_CX - 110, PORT_CY + 118 + lift, 4, 0.85, s.tCont, s.ballastLevel, "#2c6b5a");
    drawCreekBed(ctx, PORT_CY + 115 + lift, 32, "#51695b");

    // Tiny creek crab on left rock raising pincers in Act 2 ("crab pincer?")
    if (s.act === "turkey") {
      var crabWave = Math.sin(s.tCont * 8) * 0.32;
      ctx.save();
      ctx.translate(PORT_CX - 92, PORT_CY + 104 + lift);
      ctx.fillStyle = "#c94a34";
      ctx.strokeStyle = "#181d1d";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      for (var side = -1; side <= 1; side += 2) {
        ctx.save();
        ctx.translate(side * 11, -5);
        ctx.rotate(side * (-0.5 + crabWave));
        ctx.beginPath();
        ctx.arc(0, -8, 5.5, 0.4, Math.PI * 1.85);
        ctx.lineTo(0, -8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    drawVolumetricLampBeam(ctx, s, PORT_CX + 18, PORT_CY + 10 + lift, 118);

    // --- Gadget Extension (SCION 13): Yellow Nose Cone + Kinematic Scissor-Jack Pantograph ---
    // Extension parameter ext in [0.12 .. 0.92]:
    // t=0.8s -> 0.14 (retracted); t=1.8s -> 0.56 (extending on ratchets); t=4.0s -> 0.88 (clamping skeleton key!); Act 3 -> 0.78..0.86
    var ext;
    if (s.lampLevel < 0.1 && s.act === "setup") {
      ext = 0.14;
    } else if (s.act === "setup") {
      // Stepped 4-ratchet pop-art extension between 1.0s and 2.0s
      var ru = clamp((s.t - 1.0) / 1.0, 0, 1);
      var stepped = Math.floor(ru * 4) / 4 + smoothstep(0, 0.25, ru % 0.25) * 0.25;
      ext = lerp(0.14, 0.66, clamp(stepped, 0, 1));
    } else if (s.act === "turkey") {
      ext = lerp(0.66, 0.88, smoothstep(2.0, 3.4, s.t)) + Math.sin(s.tCont * 3.2) * 0.025;
    } else {
      // Act 3: hovers at dentist-inspection reach (6.8s) then jiggles lock-pick key (9.2s)
      var burgU = smoothstep(7.6, 8.6, s.t);
      ext = lerp(0.74, 0.88, burgU) + (burgU > 0.5 ? Math.sin(s.tCont * 14) * 0.02 : 0);
    }

    // Left Yellow Submarine bow hatch inside porthole left edge
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(PORT_CX - 190, PORT_CY - 135);
    ctx.quadraticCurveTo(PORT_CX - 118, PORT_CY - 12, PORT_CX - 155, PORT_CY + 128);
    ctx.lineTo(PORT_CX - 195, PORT_CY + 128);
    ctx.closePath();
    var yelGrad = ctx.createLinearGradient(PORT_CX - 190, 0, PORT_CX - 125, 0);
    yelGrad.addColorStop(0, "#b58524");
    yelGrad.addColorStop(0.65, "#ecc14b");
    yelGrad.addColorStop(1, "#f7da74");
    ctx.fillStyle = yelGrad;
    ctx.fill();
    ctx.strokeStyle = "#161d1e";
    ctx.lineWidth = 2.6;
    ctx.stroke();

    // Recessed oval hatch bezel & rivets
    ctx.beginPath();
    ctx.ellipse(PORT_CX - 148, PORT_CY - 18, 15, 52, 0.05, 0, Math.PI * 2);
    ctx.fillStyle = "#263638";
    ctx.fill();
    ctx.strokeStyle = "#919fa1";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = "#161d1e";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    // True Kinematic 3-Stage Scissor Pantograph
    var baseX = PORT_CX - 148;
    var baseY = PORT_CY - 18;
    var armTilt = -0.14 + (s.act === "trout" && s.t < 7.7 ? 0.14 : -0.03);
    var stageLen = 66;
    var halfAngle = lerp(1.06, 0.36, clamp(ext, 0.1, 0.95)); // half-scissor angle
    var dxStage = Math.cos(halfAngle) * stageLen;
    var dyHalf = Math.sin(halfAngle) * stageLen * 0.5;
    var stages = 3;

    ctx.save();
    ctx.translate(baseX, baseY);
    ctx.rotate(armTilt);

    function drawBrassLink(x0, y0, x1, y1, under) {
      var ang = Math.atan2(y1 - y0, x1 - x0);
      var len = Math.hypot(x1 - x0, y1 - y0);
      ctx.save();
      ctx.translate(x0, y0);
      ctx.rotate(ang);
      drawRoundRect(ctx, -6, -5.5, len + 12, 11, 5);
      ctx.fillStyle = under ? "#b58932" : "#e3b854";
      ctx.fill();
      ctx.strokeStyle = "#161d1e";
      ctx.lineWidth = 2.1;
      ctx.stroke();
      ctx.restore();
    }

    // Back links first, then front crossing links, then brass pivot pins
    for (var stg = 0; stg < stages; stg++) {
      var sx0 = stg * dxStage;
      var sx1 = (stg + 1) * dxStage;
      drawBrassLink(sx0, -dyHalf, sx1, dyHalf, true);
    }
    for (var stg2 = 0; stg2 < stages; stg2++) {
      var fx0 = stg2 * dxStage;
      var fx1 = (stg2 + 1) * dxStage;
      drawBrassLink(fx0, dyHalf, fx1, -dyHalf, false);
    }
    // Pivot rivets at ends, centers, and joints
    for (var stg3 = 0; stg3 <= stages; stg3++) {
      var px = stg3 * dxStage;
      var pts = [[px, -dyHalf], [px, dyHalf]];
      if (stg3 < stages) pts.push([px + dxStage * 0.5, 0]);
      for (var pIdx = 0; pIdx < pts.length; pIdx++) {
        ctx.beginPath();
        ctx.arc(pts[pIdx][0], pts[pIdx][1], 4.2, 0, Math.PI * 2);
        ctx.fillStyle = "#8a6829";
        ctx.fill();
        ctx.strokeStyle = "#141a1b";
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
    }

    // Serrated Curved Brass Pincer Tongs at tip of pantograph!
    var wristX = stages * dxStage + 20;
    // Connect final X-tips to pincer pivot
    drawBrassLink(stages * dxStage, -dyHalf, wristX, 0, true);
    drawBrassLink(stages * dxStage, dyHalf, wristX, 0, false);

    // Pincer open/pinch choreography:
    // Snap-clacks at t = 2.3..3.2s ("crab pincer?"), clamps skeleton key at t >= 3.4s!
    var pinchOpen;
    if (s.act === "setup") {
      pinchOpen = 0.42;
    } else if (s.act === "turkey" && s.t < 3.35) {
      pinchOpen = 0.15 + Math.abs(Math.sin((s.t - 2.0) * 8.5)) * 0.48;
    } else if (s.act === "trout" && s.t < 7.6) {
      // Dentist forceps gentle inspect pulse
      pinchOpen = 0.22 + Math.sin(s.tCont * 5) * 0.08;
    } else {
      pinchOpen = 0.14; // firmly pinching the skeleton key shaft!
    }

    ctx.save();
    ctx.translate(wristX, 0);

    // Upper serrated crab/tong jaw
    for (var jaw = -1; jaw <= 1; jaw += 2) {
      ctx.save();
      ctx.scale(1, jaw);
      ctx.rotate(-pinchOpen);
      ctx.beginPath();
      ctx.moveTo(-4, -6);
      ctx.bezierCurveTo(22, -26, 62, -22, 82, 3);
      // Serrated inner teeth!
      ctx.lineTo(66, 2);
      ctx.lineTo(60, -4);
      ctx.lineTo(52, 1);
      ctx.lineTo(45, -5);
      ctx.lineTo(37, 0);
      ctx.lineTo(29, -5);
      ctx.quadraticCurveTo(14, -4, -4, 4);
      ctx.closePath();
      ctx.fillStyle = jaw === -1 ? "#dfb353" : "#c79a3d";
      ctx.fill();
      ctx.strokeStyle = "#151c1d";
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();
    }

    // Central pincer hub bolt
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#b58932";
    ctx.fill();
    ctx.strokeStyle = "#151c1d";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#e7c36a";
    ctx.fill();
    ctx.stroke();

    // Ornate Victorian Iron Skeleton Key!
    // Before t=3.35s, key floats in the water just ahead; from t=3.35s onward, pinched in jaws!
    var keyHeld = (s.act === "turkey" && s.t >= 3.35) || (s.act === "trout" && s.t >= 7.6);
    if (keyHeld) {
      drawSkeletonKey(ctx, 52, -2, 0.45 + (s.act === "trout" ? Math.sin(s.tCont * 12) * 0.08 : 0));
      // Pop-art Heinz Edelmann graphic clamp rings at t=3.4..4.4s (visible at 4.0s!)
      if (s.act === "turkey" && s.t >= 3.4 && s.t <= 4.6) {
        ctx.strokeStyle = "rgba(255, 250, 215, 0.78)";
        ctx.lineWidth = 2;
        for (var cr = 0; cr < 2; cr++) {
          ctx.beginPath();
          ctx.arc(52, 0, 18 + cr * 10 + Math.sin(s.tCont * 8) * 3, -0.8, 0.8);
          ctx.stroke();
        }
      }
    }
    ctx.restore(); // end wrist
    ctx.restore(); // end pantograph

    // Floating skeleton key when not yet clamped in jaws
    if (!((s.act === "turkey" && s.t >= 3.35) || (s.act === "trout" && s.t >= 7.6))) {
      ctx.save();
      var fkX = PORT_CX + 88 + Math.sin(s.tCont * 2.1) * 5;
      var fkY = PORT_CY - 32 + Math.cos(s.tCont * 1.7) * 6 + lift;
      ctx.translate(fkX, fkY);
      drawSkeletonKey(ctx, 0, 0, 0.52 + Math.sin(s.tCont * 1.5) * 0.08);
      ctx.restore();
    }

    // --- Act 3: Trout Looks In ("Mechanical dentist or lock-picking burglar?") ---
    if (s.troutBlend > 0.02) {
      var dentistPhase = s.act === "trout" && s.t < 7.65;
      var enterT = s.act === "trout" && s.t >= 5.6 ? smoothstep(5.6, 6.45, s.t) : 1;
      var shiftBurg = s.act === "trout" && s.t >= 5.6 ? smoothstep(7.55, 8.45, s.t) : 0;

      // Secondary background lookout trout near bridge keyhole
      drawBrookTrout(ctx, {
        x: PORT_CX + 142 - shiftBurg * 18,
        y: PORT_CY + 16 + lift,
        scale: 0.68,
        facingRight: false,
        angle: 0.04,
        t: s.tCont + 1.5,
        jawOpen: 0.06
      });

      // Hero Brook Trout: at 6.8s opens mouth wide ("Ahhh!") under tongs with shiny tooth & pointing fin!
      // At 9.2s snaps jaw shut in comic suspicion watching tongs pick the bridge lock!
      drawBrookTrout(ctx, {
        x: lerp(PORT_CX + 185, PORT_CX + 46, enterT) + shiftBurg * 16,
        y: lerp(PORT_CY + 95, PORT_CY + 56, enterT) + shiftBurg * 20 + lift,
        scale: 1.08,
        facingRight: false,
        angle: lerp(-0.34, -0.08, shiftBurg),
        t: s.tCont,
        jawOpen: dentistPhase ? 0.88 : 0.05,
        showTooth: true,
        finPointAngle: dentistPhase ? -1.45 : undefined,
        lookX: dentistPhase ? 0.6 : -1.8,
        lookY: dentistPhase ? -1.6 : -0.8
      });

      // Comic burglar domino-shadow mask bar across upper pincer hub during 7.8-9.8s ("lock-picking burglar?")
      if (shiftBurg > 0.35) {
        ctx.save();
        ctx.globalAlpha = shiftBurg * 0.72;
        ctx.fillStyle = "#10181a";
        ctx.beginPath();
        ctx.ellipse(PORT_CX + 62, PORT_CY - 38 + lift, 28, 9, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fef8d8";
        ctx.beginPath();
        ctx.arc(PORT_CX + 52, PORT_CY - 39 + lift, 3.2, 0, Math.PI * 2);
        ctx.arc(PORT_CX + 71, PORT_CY - 36 + lift, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    drawKelpClump(ctx, PORT_CX + 112, PORT_CY + 148 + lift, 5, 1.0, s.tCont + 0.7, s.ballastLevel, "#25574a");
    drawMurkAndCurrentOverlay(ctx, s);
  }

  function drawSkeletonKey(ctx, x, y, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = "#7b8385";
    ctx.strokeStyle = "#141a1b";
    ctx.lineWidth = 2.1;

    // Ornate bow (top ring)
    ctx.beginPath();
    ctx.ellipse(0, -48, 19, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -48, 9, 5.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#1f6a70";
    ctx.fill();
    ctx.stroke();

    // Collar + long iron shaft + notched key bit
    ctx.fillStyle = "#8a9396";
    drawRoundRect(ctx, -6, -35, 12, 6, 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillRect(-3.6, -29, 7.2, 86);
    ctx.strokeRect(-3.6, -29, 7.2, 86);

    // Key bit teeth
    ctx.beginPath();
    ctx.moveTo(3.6, 34);
    ctx.lineTo(22, 34);
    ctx.lineTo(22, 41);
    ctx.lineTo(14, 41);
    ctx.lineTo(14, 46);
    ctx.lineTo(22, 46);
    ctx.lineTo(22, 53);
    ctx.lineTo(3.6, 53);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // =========================================================================
  // PORTHOLE #33 · SALON — Velvet iris frame around culvert bar shadows
  // Turkey: "Theater curtain or stone tunnel?"
  // Trout:  "Rivet-toothed monster jaw or movie projector?"
  // Rule:   Mystimation Silhouette (SCION 02) — Karel Zeman 1958 Engraving
  // =========================================================================
  function renderPortal33(ctx, s) {
    // Ballast defaultTool! Before ballast (t=0.8s), sub rides high (+36px vertical offset so stone lintel crowds frame);
    // once ballast snaps in (t=1.0..1.6s), sub settles behind foreground stone lip so culvert arch centers cleanly!
    var unballastedOffset = (1 - s.ballastLevel) * 42;

    // Bioluminescent emerald-cyan grotto core (Karel Zeman backlit depth)
    var radG = ctx.createRadialGradient(
      PORT_CX, PORT_CY - 8 + unballastedOffset, 16,
      PORT_CX, PORT_CY + unballastedOffset, 195
    );
    radG.addColorStop(0, "#46f2df");
    radG.addColorStop(0.38, "#1ab5a8");
    radG.addColorStop(0.72, "#0f5254");
    radG.addColorStop(1, "#071f22");
    ctx.fillStyle = radG;
    ctx.fillRect(PORT_CX - PORT_R - 8, PORT_CY - PORT_R - 8, PORT_R * 2 + 16, PORT_R * 2 + 16);

    // Shimmering subterranean water floor inside tunnel
    var waterY = PORT_CY + 58 + unballastedOffset;
    ctx.save();
    ctx.fillStyle = "#0a3337";
    ctx.fillRect(PORT_CX - 190, waterY, 380, 160);
    for (var r = 0; r < 9; r++) {
      var ry = waterY + 6 + r * 11;
      var rw = (105 - r * 7) * (0.85 + 0.15 * Math.sin(s.tCont * 3.1 + r));
      ctx.strokeStyle = "rgba(110, 248, 230, " + (0.45 - r * 0.04).toFixed(3) + ")";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(PORT_CX - rw, ry);
      ctx.lineTo(PORT_CX + rw, ry);
      ctx.stroke();
    }
    ctx.restore();

    // Distant stone grotto walls with Zeman engraving crosshatch
    ctx.save();
    ctx.fillStyle = "#103b3e";
    ctx.strokeStyle = "#08191b";
    ctx.lineWidth = 2;
    for (var wallSide = -1; wallSide <= 1; wallSide += 2) {
      ctx.beginPath();
      ctx.moveTo(PORT_CX + wallSide * 185, PORT_CY - 185);
      ctx.lineTo(PORT_CX + wallSide * 86, PORT_CY - 140 + unballastedOffset);
      ctx.quadraticCurveTo(PORT_CX + wallSide * 74, PORT_CY + 10 + unballastedOffset, PORT_CX + wallSide * 118, waterY + 12);
      ctx.lineTo(PORT_CX + wallSide * 185, waterY + 25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    drawHatchLines(ctx, PORT_CX - 185, PORT_CY - 160, 100, 260, 6, 0.55, "rgba(6,16,18,0.45)", 1.1);
    drawHatchLines(ctx, PORT_CX + 85, PORT_CY - 160, 100, 260, 6, -0.55, "rgba(6,16,18,0.45)", 1.1);
    ctx.restore();

    // Act 2 ("Theater curtain or stone tunnel?"): Silhouette cutout minnow-actors bowing on stage + falling tunnel water drops!
    if (s.act === "turkey") {
      var stageBow = Math.sin(s.tCont * 3.6) * 0.25;
      drawMinnow(ctx, PORT_CX - 26, PORT_CY + 18 + unballastedOffset, 0.82, true, s.tCont, 0, false);
      drawMinnow(ctx, PORT_CX + 26, PORT_CY + 18 + unballastedOffset, 0.82, false, s.tCont, 1.5, false);
      // Falling culvert ceiling water droplets with splash rings
      for (var dr = 0; dr < 3; dr++) {
        var dp = ((s.tCont * 0.7 + dr * 0.33) % 1);
        var dx = PORT_CX - 48 + dr * 48;
        var dy = lerp(PORT_CY - 115 + unballastedOffset, waterY, dp * dp);
        if (dp < 0.92) {
          ctx.fillStyle = "#aefaf0";
          ctx.beginPath();
          ctx.ellipse(dx, dy, 2.2, 4.5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = "rgba(174,250,240,0.7)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(dx, waterY + 2, (dp - 0.92) * 180, (dp - 0.92) * 45, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // Act 3: Spotted Brook Trout swimming behind/between the iron culvert bars!
    // At 6.8s: glides horizontally across glowing cyan center eyeing sub's "rivet-toothed monster jaw"!
    // At 9.2s: projector shutter flicker turns water mist into a cinema beam & Trout watches nose-on!
    var projFlicker = s.act === "trout" ? smoothstep(7.5, 8.4, s.t) : 0;
    if (s.troutBlend > 0.02) {
      var passU = s.act === "trout" && s.t >= 5.6 ? clamp((s.t - 5.6) / 4.2, 0, 1) : 0.35;
      var tx3 = lerp(PORT_CX + 75, PORT_CX - 18, smoothstep(0, 0.45, passU)) + projFlicker * 18;
      var ty3 = PORT_CY - 4 + Math.sin(s.tCont * 2.4) * 6 + unballastedOffset;
      var scale3 = lerp(0.95, 1.18, projFlicker);
      drawBrookTrout(ctx, {
        x: tx3,
        y: ty3,
        scale: scale3,
        facingRight: false,
        angle: projFlicker * 0.08,
        t: s.tCont,
        jawOpen: projFlicker > 0.5 ? 0.25 : 0.1,
        lookX: -1.6,
        lookY: 0.4
      });
    }

    // --- Articulated Pleated Velvet Iris Curtains (parting as ballast settles & breathing in Act 2!) ---
    var curtainOpen = lerp(0.32, 0.88, s.ballastLevel) +
      (s.act === "turkey" ? Math.sin((s.t - 2.0) * 2.2) * 0.14 : 0.06);
    curtainOpen = clamp(curtainOpen, 0.25, 1.0);

    for (var cSide = -1; cSide <= 1; cSide += 2) {
      ctx.save();
      var edgeX = PORT_CX + cSide * 165;
      var innerWaistX = PORT_CX + cSide * lerp(48, 118, curtainOpen);
      var innerTopX = PORT_CX + cSide * lerp(26, 84, curtainOpen);
      var innerBotX = PORT_CX + cSide * lerp(58, 128, curtainOpen);

      ctx.beginPath();
      ctx.moveTo(edgeX, PORT_CY - 175 + unballastedOffset);
      ctx.lineTo(innerTopX, PORT_CY - 165 + unballastedOffset);
      ctx.bezierCurveTo(
        innerTopX - cSide * 10, PORT_CY - 45 + unballastedOffset,
        innerWaistX, PORT_CY + 18 + unballastedOffset,
        innerWaistX, PORT_CY + 34 + unballastedOffset
      );
      ctx.quadraticCurveTo(
        innerBotX - cSide * 8, PORT_CY + 95 + unballastedOffset,
        innerBotX, PORT_CY + 148 + unballastedOffset
      );
      ctx.lineTo(edgeX, PORT_CY + 165 + unballastedOffset);
      ctx.closePath();

      var velGrad = ctx.createLinearGradient(innerWaistX, 0, edgeX, 0);
      velGrad.addColorStop(0, s.act === "turkey" ? "#4b2e39" : "#244649");
      velGrad.addColorStop(0.5, "#1f383b");
      velGrad.addColorStop(1, "#0f1e20");
      ctx.fillStyle = velGrad;
      ctx.fill();
      ctx.strokeStyle = "#0b1416";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Velvet fold pleats
      for (var pf = 1; pf <= 3; pf++) {
        var fu = pf / 4;
        ctx.beginPath();
        ctx.moveTo(lerp(innerTopX, edgeX, fu), PORT_CY - 160 + unballastedOffset);
        ctx.quadraticCurveTo(
          lerp(innerWaistX, edgeX, fu), PORT_CY + 28 + unballastedOffset,
          lerp(innerBotX, edgeX, fu), PORT_CY + 148 + unballastedOffset
        );
        ctx.strokeStyle = pf % 2 === 0 ? "rgba(155, 215, 208, 0.22)" : "rgba(8, 14, 16, 0.65)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Braided velvet tie-back sash & tassel at waist
      ctx.fillStyle = "#8c6d3b";
      drawRoundRect(ctx, innerWaistX - (cSide > 0 ? 2 : 24), PORT_CY + 24 + unballastedOffset, 26, 11, 4);
      ctx.fill();
      ctx.strokeStyle = "#0b1416";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();
    }

    // --- Five Vertical Iron Culvert Bars + Radial Bar Shadows ---
    var barXs = [-92, -46, 0, 46, 92];
    ctx.save();
    for (var bi = 0; bi < barXs.length; bi++) {
      var bx = PORT_CX + barXs[bi];
      // Forward water-floor bar shadow
      ctx.fillStyle = "rgba(5, 14, 16, 0.42)";
      ctx.beginPath();
      ctx.moveTo(bx - 4, waterY);
      ctx.lineTo(bx + 4, waterY);
      ctx.lineTo(bx + barXs[bi] * 0.35 + 9, PORT_CY + 185);
      ctx.lineTo(bx + barXs[bi] * 0.35 - 9, PORT_CY + 185);
      ctx.closePath();
      ctx.fill();

      // Iron bar with Zeman engraving highlight & rivets
      var bg2 = ctx.createLinearGradient(bx - 5, 0, bx + 5, 0);
      bg2.addColorStop(0, "#182426");
      bg2.addColorStop(0.45, "#5c7576");
      bg2.addColorStop(1, "#141f21");
      ctx.fillStyle = bg2;
      ctx.fillRect(bx - 5, PORT_CY - 175 + unballastedOffset, 10, 345);
      ctx.strokeStyle = "#0a1214";
      ctx.lineWidth = 1.6;
      ctx.strokeRect(bx - 5, PORT_CY - 175 + unballastedOffset, 10, 345);
    }
    ctx.restore();

    // --- Chiseled Stone Arch Ring Around Inner Culvert Mouth ---
    ctx.save();
    var numStones = 18;
    var archCy = PORT_CY + unballastedOffset * 0.85;
    for (var stIdx = 0; stIdx < numStones; stIdx++) {
      var a0 = (stIdx / numStones) * Math.PI * 2;
      var a1 = ((stIdx + 0.96) / numStones) * Math.PI * 2;
      var rIn = 150;
      var rOut = 196;
      ctx.beginPath();
      ctx.arc(PORT_CX, archCy, rOut, a0, a1);
      ctx.arc(PORT_CX, archCy, rIn, a1, a0, true);
      ctx.closePath();
      ctx.fillStyle = stIdx % 2 === 0 ? "#485958" : "#3b4b4a";
      ctx.fill();
      ctx.strokeStyle = "#11191a";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Stone highlight bevel
      ctx.beginPath();
      ctx.arc(PORT_CX, archCy, rIn + 4, a0 + 0.03, a1 - 0.03);
      ctx.strokeStyle = "rgba(165, 208, 202, 0.28)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();

    // Act 3 Visual Dual-Cue:
    // 1) 6.0..7.7s ("Rivet-toothed monster jaw"): looming shadow silhouette of sub's bolted rim & latch teeth across foreground!
    // 2) 7.7..9.8s ("Movie projector"): warm flickering 16mm cinema shutter rays & dust motes projecting through the culvert bars!
    if (s.act === "trout" && projFlicker < 0.55) {
      var jawAlpha = (1 - projFlicker) * 0.48;
      ctx.save();
      ctx.fillStyle = "rgba(10, 18, 20, " + jawAlpha.toFixed(3) + ")";
      for (var jt = -3; jt <= 3; jt++) {
        ctx.beginPath();
        ctx.moveTo(PORT_CX + jt * 38 - 14, PORT_CY - 182);
        ctx.lineTo(PORT_CX + jt * 38, PORT_CY - 154 + Math.sin(s.tCont * 4) * 3);
        ctx.lineTo(PORT_CX + jt * 38 + 14, PORT_CY - 182);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    if (projFlicker > 0.1 || s.lampLevel > 0.1) {
      var shutter = projFlicker > 0.1
        ? (0.65 + 0.35 * Math.sign(Math.sin(s.tCont * 38))) * projFlicker
        : s.lampLevel * 0.7;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      var pg = ctx.createLinearGradient(PORT_CX, PORT_CY + 175, PORT_CX, PORT_CY - 135);
      pg.addColorStop(0, "rgba(255, 220, 128, " + (0.48 * shutter).toFixed(3) + ")");
      pg.addColorStop(1, "rgba(255, 220, 128, 0)");
      ctx.beginPath();
      ctx.moveTo(PORT_CX - 28, PORT_CY + 185);
      ctx.lineTo(PORT_CX - 135, PORT_CY - 140);
      ctx.lineTo(PORT_CX + 135, PORT_CY - 140);
      ctx.lineTo(PORT_CX + 28, PORT_CY + 185);
      ctx.closePath();
      ctx.fillStyle = pg;
      ctx.fill();
      ctx.restore();
    }

    // Foreground low Shelter Stone Lip + slack dock ribbon when ballast is fitted (SCION Setup A invariant!)
    if (s.ballastLevel > 0.15) {
      var lipY = lerp(PORT_CY + 210, PORT_CY + 158, s.ballastLevel);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(PORT_CX - 175, PORT_CY + 195);
      ctx.quadraticCurveTo(PORT_CX - 45, lipY - 12, PORT_CX + 175, lipY + 6);
      ctx.lineTo(PORT_CX + 175, PORT_CY + 195);
      ctx.closePath();
      ctx.fillStyle = "#202f30";
      ctx.fill();
      ctx.strokeStyle = "#0c1516";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Slackened red-ochre dock ribbon resting calmly behind shelter lip
      ctx.beginPath();
      ctx.moveTo(PORT_CX - 95, lipY + 4);
      ctx.bezierCurveTo(PORT_CX - 35, lipY + 22, PORT_CX + 25, lipY + 18, PORT_CX + 85, lipY + 8 + Math.sin(s.tCont * 1.4) * 2);
      ctx.strokeStyle = "#c86443";
      ctx.lineWidth = 3.2;
      ctx.stroke();
      ctx.restore();
    }

    drawMurkAndCurrentOverlay(ctx, s);
  }

  // =========================================================================
  // PORTHOLE #34 · ORGAN — Cutaway boiler room with bellows & pipes
  // Turkey: "Steam-organ rescue crew or furnace?"
  // Trout:  "Polka calliope barge or rattling radiator?"
  // Rule:   Cutaway Section (SCION 31) — Georges Méliès 1904 Stenciled Brass
  // =========================================================================
  function renderPortal34(ctx, s) {
    var lift = s.ballastLevel * 18;
    drawRiverBackdrop(ctx, s, {
      topCol: "#277978",
      midCol: "#1c5a5c",
      botCol: "#113336",
      troutTopCol: "#2f8c8a"
    });

    // Creek boulders & eelgrass framing the sunken Méliès boiler-calliope
    ctx.save();
    ctx.fillStyle = "#3f5950";
    ctx.strokeStyle = "#14211e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PORT_CX - 190, PORT_CY + 62 + lift);
    ctx.quadraticCurveTo(PORT_CX - 135, PORT_CY + 52 + lift, PORT_CX - 108, PORT_CY + 108 + lift);
    ctx.lineTo(PORT_CX - 190, PORT_CY + 135 + lift);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    drawKelpClump(ctx, PORT_CX - 138, PORT_CY + 78 + lift, 5, 0.92, s.tCont, s.ballastLevel, "#2d6453");
    drawCreekBed(ctx, PORT_CY + 106 + lift, 34, "#606a56");

    drawVolumetricLampBeam(ctx, s, PORT_CX + 5, PORT_CY + 5 + lift, 132);

    // --- Méliès Cutaway Brass Boiler + Pumping Accordion Bellows + 7 Copper Organ Pipes ---
    var activePower = clamp(0.15 + s.lampLevel * 0.85, 0.15, 1.0);
    var radiatorRattle = s.act === "trout" ? smoothstep(7.7, 8.5, s.t) : 0;
    var shudderX = radiatorRattle > 0.1 ? Math.sin(s.tCont * 42) * 2.4 * radiatorRattle : 0;
    var shudderY = radiatorRattle > 0.1 ? Math.cos(s.tCont * 37) * 1.4 * radiatorRattle : 0;

    // Bellows breathing phase (synced to crank wheel!)
    var crankOmega = lerp(1.2, 4.8, activePower);
    var crankAng = s.tCont * crankOmega;
    var bellowsOpen = 0.5 + 0.5 * Math.sin(crankAng); // 0 = squeezed, 1 = expanded

    ctx.save();
    ctx.translate(PORT_CX + 4 + shudderX, PORT_CY + 66 + lift + shudderY);

    // Base brass chassis & curved feet
    ctx.fillStyle = "#9d7b38";
    ctx.strokeStyle = "#181d1c";
    ctx.lineWidth = 2.1;
    drawRoundRect(ctx, -98, 12, 186, 20, 4);
    ctx.fill();
    ctx.stroke();
    // Legs
    ctx.beginPath();
    ctx.moveTo(-90, 32); ctx.lineTo(-98, 44); ctx.lineTo(-78, 44); ctx.lineTo(-74, 32);
    ctx.moveTo(72, 32); ctx.lineTo(82, 44); ctx.lineTo(64, 44); ctx.lineTo(58, 32);
    ctx.fill();
    ctx.stroke();

    // 1) Rank of 7 Graduated Copper Organ Pipes (behind bellows)
    var pipeHeights = [66, 92, 132, 114, 94, 76, 56];
    for (var pi = 0; pi < pipeHeights.length; pi++) {
      var px = -24 + pi * 15;
      var ph = pipeHeights[pi];
      var noteActive = activePower > 0.4 && Math.sin(crankAng * 1.5 - pi * 0.75) > 0.45;
      var pipeLift = noteActive ? -2.5 : 0;

      var pg = ctx.createLinearGradient(px - 6, 0, px + 6, 0);
      pg.addColorStop(0, "#7c4728");
      pg.addColorStop(0.45, "#df9662");
      pg.addColorStop(1, "#66381e");
      ctx.fillStyle = pg;
      ctx.fillRect(px - 6, -34 - ph + pipeLift, 12, ph + 14);
      ctx.strokeStyle = "#181c1c";
      ctx.lineWidth = 1.7;
      ctx.strokeRect(px - 6, -34 - ph + pipeLift, 12, ph + 14);

      // Whistle mouth notch near base of each pipe
      ctx.fillStyle = noteActive ? "#ffe394" : "#221814";
      ctx.beginPath();
      ctx.arc(px, -48 + pipeLift, 4, Math.PI, 0);
      ctx.lineTo(px + 4, -42 + pipeLift);
      ctx.lineTo(px - 4, -42 + pipeLift);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Rising pearlescent musical bubble streams from copper pipe tops!
      if (activePower > 0.35) {
        for (var nb = 0; nb < 3; nb++) {
          var bp = ((s.tCont * (0.48 + (pi % 3) * 0.11) + nb * 0.33 + pi * 0.17) % 1);
          var bbx = px + Math.sin(s.tCont * 2.8 + pi + nb) * (4 + bp * 10);
          var bby = -38 - ph - bp * 88;
          var bbr = (3.2 + ((pi + nb) % 3) * 2.4) * (0.7 + bp * 0.45);
          ctx.beginPath();
          ctx.arc(bbx, bby, bbr, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(205, 248, 240, " + ((1 - bp) * 0.52).toFixed(3) + ")";
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, " + ((1 - bp) * 0.78).toFixed(3) + ")";
          ctx.lineWidth = 1.2;
          ctx.stroke();
          // Tinyspecular crescent inside bubble
          ctx.beginPath();
          ctx.arc(bbx - bbr * 0.3, bby - bbr * 0.3, bbr * 0.28, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255," + ((1 - bp) * 0.8).toFixed(3) + ")";
          ctx.fill();
        }
      }
    }

    // 2) Left Cylindrical Riveted Brass Boiler with Cutaway Furnace & Clockwork Gears (SCION 31!)
    var bx0 = -92;
    var bw = 62;
    var boilerGrad = ctx.createLinearGradient(bx0, 0, bx0 + bw, 0);
    boilerGrad.addColorStop(0, "#7f6128");
    boilerGrad.addColorStop(0.45, "#dfba62");
    boilerGrad.addColorStop(1, "#6c5120");

    // Domed top & chimney stack
    ctx.fillStyle = boilerGrad;
    ctx.beginPath();
    ctx.moveTo(bx0, 14);
    ctx.lineTo(bx0, -68);
    ctx.arc(bx0 + bw * 0.5, -68, bw * 0.5, Math.PI, 0);
    ctx.lineTo(bx0 + bw, 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#171d1c";
    ctx.lineWidth = 2.1;
    ctx.stroke();

    // Chimney funnel
    ctx.fillRect(bx0 + 21, -118, 20, 22);
    ctx.strokeRect(bx0 + 21, -118, 20, 22);
    drawRoundRect(ctx, bx0 + 17, -123, 28, 6, 3);
    ctx.fill();
    ctx.stroke();

    // Cutaway Section Window on Boiler Belly (showing orange furnace glow + 2 meshing gears!)
    drawRoundRect(ctx, bx0 + 9, -56, 44, 56, 8);
    var furnacePulse = activePower * (0.65 + 0.35 * Math.sin(s.tCont * 6.5));
    var fg2 = ctx.createRadialGradient(bx0 + 31, -22, 4, bx0 + 31, -28, 34);
    fg2.addColorStop(0, s.act === "turkey" ? "rgba(255, 165, 52, " + (0.95 * furnacePulse).toFixed(3) + ")" : "rgba(255, 196, 88, 0.78)");
    fg2.addColorStop(1, "#2a1f14");
    ctx.fillStyle = fg2;
    ctx.fill();
    ctx.strokeStyle = "#171d1c";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Meshing gears inside cutaway boiler window
    drawGear(ctx, bx0 + 23, -18, 12, 8, crankAng, "#d8b25c");
    drawGear(ctx, bx0 + 41, -34, 9, 7, -crankAng * (8 / 7), "#c49642");

    // Boiler pressure gauge dial
    ctx.beginPath();
    ctx.arc(bx0 + 24, -68, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#faf3dd";
    ctx.fill();
    ctx.strokeStyle = "#171d1c";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    var pAng = lerp(-2.2, -0.3 + Math.sin(s.tCont * 8) * 0.2, activePower);
    ctx.beginPath();
    ctx.moveTo(bx0 + 24, -68);
    ctx.lineTo(bx0 + 24 + Math.cos(pAng) * 6.5, -68 + Math.sin(pAng) * 6.5);
    ctx.strokeStyle = "#c83828";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // 3) Center Articulated Pleated Accordion Bellows!
    var pivotX = 12;
    var pivotY = 12;
    var spreadAng = lerp(0.26, 0.62, bellowsOpen);
    var radIn = 18;
    var radOut = 78;
    var folds = 7;

    // Pleated leather fan
    for (var fi = 0; fi < folds; fi++) {
      var fa0 = -Math.PI * 0.5 - spreadAng + (fi / folds) * (spreadAng * 2);
      var fa1 = -Math.PI * 0.5 - spreadAng + ((fi + 1) / folds) * (spreadAng * 2);
      var faMid = (fa0 + fa1) * 0.5;
      ctx.beginPath();
      ctx.moveTo(pivotX + Math.cos(fa0) * radIn, pivotY + Math.sin(fa0) * radIn);
      ctx.lineTo(pivotX + Math.cos(fa0) * radOut, pivotY + Math.sin(fa0) * radOut);
      ctx.lineTo(pivotX + Math.cos(faMid) * (radOut - 7), pivotY + Math.sin(faMid) * (radOut - 7));
      ctx.lineTo(pivotX + Math.cos(fa1) * radOut, pivotY + Math.sin(fa1) * radOut);
      ctx.lineTo(pivotX + Math.cos(fa1) * radIn, pivotY + Math.sin(fa1) * radIn);
      ctx.closePath();
      ctx.fillStyle = fi % 2 === 0 ? "#855b35" : "#593b21";
      ctx.fill();
      ctx.strokeStyle = "#181613";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Left & right brass end-paddles of the accordion bellows
    for (var bSide = -1; bSide <= 1; bSide += 2) {
      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate(bSide * spreadAng);
      drawRoundRect(ctx, -8, -radOut - 3, 16, radOut - radIn + 8, 3);
      ctx.fillStyle = "#dfb960";
      ctx.fill();
      ctx.strokeStyle = "#181c1c";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Main bottom drive gear wheel + crank pin driving bellows
    drawGear(ctx, pivotX, pivotY + 10, 20, 10, crankAng, "#d6ae52");
    drawGear(ctx, pivotX + 34, pivotY + 14, 12, 8, -crankAng * 1.25, "#b88e3b");

    // Steam puffs shooting sideways during Act 3 "rattling radiator" beat (8.0..9.8s)!
    if (radiatorRattle > 0.15) {
      for (var sp = 0; sp < 4; sp++) {
        var spProg = ((s.tCont * 1.8 + sp * 0.25) % 1);
        ctx.beginPath();
        ctx.arc(bx0 - 6 - spProg * 28, -42 + sp * 14 - spProg * 10, 5 + spProg * 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(242, 250, 246, " + ((1 - spProg) * 0.58 * radiatorRattle).toFixed(3) + ")";
        ctx.fill();
      }
    }

    ctx.restore(); // end boiler-organ machine

    // Small helper trout on upper-left in engineer cap (visible in Act 2 as "steam-organ rescue crew" & dancing polka in Act 3!)
    if (s.act !== "setup" || s.t > 1.4) {
      var polkaBob = s.act === "trout" ? Math.sin(crankAng * 2) * 8 : Math.sin(s.tCont * 2.4) * 3;
      drawBrookTrout(ctx, {
        x: PORT_CX - 98,
        y: PORT_CY - 48 + polkaBob + lift,
        scale: 0.72,
        facingRight: true,
        angle: s.act === "trout" ? Math.sin(crankAng) * 0.14 : 0.06,
        t: s.tCont,
        hat: "engineer",
        jawOpen: 0.12
      });
    }

    // Act 3 Hero Brook Trout: dances polka at 6.8s ("Polka calliope barge") -> swims close to vibrating glass/boiler at 9.2s ("rattling radiator")!
    if (s.troutBlend > 0.02) {
      var enterO = s.act === "trout" && s.t >= 5.6 ? smoothstep(5.6, 6.45, s.t) : 1;
      var polkaBounce = Math.sin(crankAng * 2) * (1 - radiatorRattle * 0.5) * 11;
      drawBrookTrout(ctx, {
        x: lerp(PORT_CX + 195, PORT_CX + 108, enterO) - radiatorRattle * 52,
        y: PORT_CY + 6 + polkaBounce + radiatorRattle * 28 + lift,
        scale: lerp(0.88, 1.04, radiatorRattle),
        facingRight: false,
        angle: Math.sin(crankAng) * 0.15 * (1 - radiatorRattle) - radiatorRattle * 0.12,
        t: s.tCont + 0.8,
        jawOpen: radiatorRattle > 0.4 ? 0.28 : 0.12,
        lookX: -1.8,
        lookY: 0.5
      });
    }

    drawKelpClump(ctx, PORT_CX + 124, PORT_CY + 144 + lift, 5, 1.05, s.tCont + 0.9, s.ballastLevel, "#235547");
    drawMurkAndCurrentOverlay(ctx, s);
  }

  function drawGear(ctx, cx, cy, r, teeth, angle, fillCol) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    for (var i = 0; i < teeth; i++) {
      var a0 = (i / teeth) * Math.PI * 2;
      var a1 = ((i + 0.35) / teeth) * Math.PI * 2;
      var a2 = ((i + 0.55) / teeth) * Math.PI * 2;
      var a3 = ((i + 0.9) / teeth) * Math.PI * 2;
      if (i === 0) ctx.moveTo(Math.cos(a0) * (r - 3), Math.sin(a0) * (r - 3));
      else ctx.lineTo(Math.cos(a0) * (r - 3), Math.sin(a0) * (r - 3));
      ctx.lineTo(Math.cos(a1) * (r + 3), Math.sin(a1) * (r + 3));
      ctx.lineTo(Math.cos(a2) * (r + 3), Math.sin(a2) * (r + 3));
      ctx.lineTo(Math.cos(a3) * (r - 3), Math.sin(a3) * (r - 3));
    }
    ctx.closePath();
    ctx.fillStyle = fillCol || "#d6ae52";
    ctx.fill();
    ctx.strokeStyle = "#171d1c";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#332818";
    ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // PORTHOLE #35 · POST #44 — 1943 canvas mail sack spilling at Box #44
  // Turkey: "Lost mission orders or laundry sack?"
  // Trout:  "Porch-pirate vacuum or mailman’s truck?"
  // Rule:   Fixed-Shot Handoff (Oucipo) — Old Loyston TVA Archive 1943
  // =========================================================================
  function renderPortal35(ctx, s) {
    // Ballast defaultTool! Before ballast (t=0.8s), swift surface drift lifts sub +38px above Box #44;
    // at t=1.0..1.6s, Ballast settles sub squarely opposite Rural Mailbox #44!
    var driftLift = (1 - s.ballastLevel) * 38;

    drawRiverBackdrop(ctx, s, {
      topCol: "#2d7d7c",
      midCol: "#205d60",
      botCol: "#133a3d",
      troutTopCol: "#348a88"
    });

    // Submerged Old Loyston 1943 valley ridges, drowned orchard fence & distant farmhouse gable
    ctx.save();
    ctx.fillStyle = "rgba(18, 52, 55, 0.65)";
    ctx.beginPath();
    ctx.moveTo(PORT_CX - 190, PORT_CY + 88 + driftLift);
    ctx.quadraticCurveTo(PORT_CX - 60, PORT_CY + 44 + driftLift, PORT_CX + 55, PORT_CY + 68 + driftLift);
    ctx.quadraticCurveTo(PORT_CX + 135, PORT_CY + 46 + driftLift, PORT_CX + 190, PORT_CY + 76 + driftLift);
    ctx.lineTo(PORT_CX + 190, PORT_CY + 195);
    ctx.lineTo(PORT_CX - 190, PORT_CY + 195);
    ctx.closePath();
    ctx.fill();

    // Subtle drowned fenceposts in background parallax
    ctx.strokeStyle = "rgba(15, 38, 40, 0.6)";
    ctx.lineWidth = 2.2;
    for (var fp = 0; fp < 5; fp++) {
      var fpx = PORT_CX - 18 + fp * 36;
      var fpy = PORT_CY + 64 + driftLift + (fp % 2) * 4;
      ctx.beginPath();
      ctx.moveTo(fpx, fpy + 22);
      ctx.lineTo(fpx + 2, fpy - 8);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(PORT_CX - 22, PORT_CY + 63 + driftLift);
    ctx.lineTo(PORT_CX + 135, PORT_CY + 67 + driftLift);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    drawVolumetricLampBeam(ctx, s, PORT_CX - 15, PORT_CY - 10 + driftLift, 128);

    // --- Leaning Cedar Post + Galvanized Rural U.S. Mail Box #44 ---
    ctx.save();
    ctx.translate(PORT_CX - 66, PORT_CY - 22 + driftLift);
    ctx.rotate(0.22); // characteristic leaning flooded post!

    // Weathered timber post with woodgrain splits
    var woodG = ctx.createLinearGradient(-15, 0, 15, 0);
    woodG.addColorStop(0, "#513e2b");
    woodG.addColorStop(0.5, "#7d6448");
    woodG.addColorStop(1, "#433323");
    ctx.fillStyle = woodG;
    ctx.strokeStyle = "#181918";
    ctx.lineWidth = 2.2;
    ctx.fillRect(-15, 16, 30, 195);
    ctx.strokeRect(-15, 16, 30, 195);

    ctx.beginPath();
    ctx.moveTo(-5, 24); ctx.lineTo(-4, 155);
    ctx.moveTo(6, 40); ctx.lineTo(5, 175);
    ctx.strokeStyle = "rgba(24,20,16,0.45)";
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // Galvanized blue-steel rural Mailbox #44 body
    var boxG = ctx.createLinearGradient(-58, -76, 48, 22);
    boxG.addColorStop(0, "#83a7b8");
    boxG.addColorStop(0.45, "#5c8396");
    boxG.addColorStop(1, "#3b5868");

    ctx.beginPath();
    ctx.moveTo(-64, 14);
    ctx.lineTo(-64, -36);
    ctx.bezierCurveTo(-64, -74, -22, -78, 8, -74);
    ctx.lineTo(56, -64);
    ctx.bezierCurveTo(72, -58, 76, -24, 72, 20);
    ctx.lineTo(-64, 14);
    ctx.closePath();
    ctx.fillStyle = boxG;
    ctx.fill();
    ctx.strokeStyle = "#151f24";
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Tin flag on top-right of mailbox (clicks UP in Act 2 at t=2.8s!)
    var flagUp = s.act === "setup" ? 0 : smoothstep(2.4, 3.1, s.t);
    ctx.save();
    ctx.translate(38, -66);
    ctx.rotate(lerp(1.35, -0.15, flagUp));
    ctx.fillStyle = flagUp > 0.5 ? "#c94b38" : "#6b8e9e";
    ctx.strokeStyle = "#151f24";
    ctx.lineWidth = 1.8;
    ctx.fillRect(-3, -26, 6, 26);
    ctx.strokeRect(-3, -26, 6, 26);
    ctx.fillRect(-3, -26, 15, 10);
    ctx.strokeRect(-3, -26, 15, 10);
    ctx.restore();

    // Stenciled "#44" on mailbox flank
    ctx.save();
    ctx.translate(-18, -18);
    ctx.rotate(0.05);
    ctx.font = "800 31px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#16242b";
    ctx.fillText("#44", 0, 0);
    ctx.restore();

    // Open mouth interior of Mailbox #44
    ctx.beginPath();
    ctx.ellipse(54, -20, 22, 42, 0.05, 0, Math.PI * 2);
    ctx.fillStyle = "#1d2d34";
    ctx.fill();
    ctx.strokeStyle = "#151f24";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Hinged front mailbox door (swings down as ballast settles at t=1.0..1.6s!)
    var doorOpen = lerp(0.32, 1.0, s.ballastLevel);
    ctx.save();
    ctx.translate(46, 18);
    ctx.rotate(lerp(-0.55, 0.62, doorOpen));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(68, 12);
    ctx.bezierCurveTo(84, 34, 62, 58, 38, 52);
    ctx.lineTo(-4, 12);
    ctx.closePath();
    ctx.fillStyle = "#6c92a4";
    ctx.fill();
    ctx.strokeStyle = "#151f24";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.restore();

    // 1943 Olive-Tan Canvas Mail Sack stuffed in mouth & bulging out!
    ctx.beginPath();
    ctx.moveTo(34, -48);
    ctx.quadraticCurveTo(68, -52, 74, -26);
    ctx.quadraticCurveTo(78, 8, 44, 16);
    ctx.quadraticCurveTo(28, -8, 34, -48);
    ctx.closePath();
    ctx.fillStyle = "#a69268";
    ctx.fill();
    ctx.strokeStyle = "#1c1f1b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Turkey Fork visual cue ("Lost mission orders or laundry sack?"):
    // In Act 2, a little white cotton sock/handkerchief corner peeks alongside "1943 U.S." stencil!
    if (s.act === "turkey") {
      var peek = smoothstep(2.2, 3.2, s.t);
      ctx.save();
      ctx.translate(64, -36);
      ctx.rotate(-0.3 + Math.sin(s.tCont * 3) * 0.12);
      ctx.globalAlpha = peek;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(14, -14, 24, -6);
      ctx.quadraticCurveTo(18, 8, 4, 8);
      ctx.closePath();
      ctx.fillStyle = "#f4f6f8";
      ctx.fill();
      ctx.strokeStyle = "#1c2426";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Stacked wax-sealed envelopes inside the canvas sack mouth
    drawWaxEnvelope(ctx, 55, -24, 0.25, 0.78);
    drawWaxEnvelope(ctx, 62, -10, -0.18, 0.8);
    drawWaxEnvelope(ctx, 56, 3, 0.12, 0.8);

    ctx.restore(); // end leaning post & Box #44

    // --- Fixed-Shot Handoff (Oucipo): Spilling Envelopes -> Postal Brook Trout Delivery! ---
    // 3 cascading envelopes along the current curve + 1 hero handoff envelope!
    var spillProgress = s.act === "setup"
      ? smoothstep(1.1, 1.95, s.t) * 0.45
      : 1.0;

    if (spillProgress > 0.05) {
      drawWaxEnvelope(
        ctx,
        PORT_CX + 12 + Math.sin(s.tCont * 2.1) * 4,
        PORT_CY - 8 + driftLift + Math.cos(s.tCont * 1.9) * 3,
        0.38 + Math.sin(s.tCont * 2.3) * 0.08,
        0.86
      );
      if (spillProgress > 0.35) {
        drawWaxEnvelope(
          ctx,
          PORT_CX + 38 + Math.sin(s.tCont * 1.8 + 1) * 5,
          PORT_CY + 18 + driftLift + Math.cos(s.tCont * 2.2 + 1) * 4,
          0.56 + Math.sin(s.tCont * 2.0 + 1) * 0.1,
          0.88
        );
      }
    }

    // Hero Handoff Envelope: drifts out across porthole in Act 2 (2.0..5.6s), caught by Postal Brook Trout at 6.6s,
    // and held right up to Turkey's porthole glass at 8.4..9.8s ("Porch-pirate vacuum or mailman's truck?")!
    if (s.act === "turkey") {
      var hu = clamp((s.t - 2.0) / 3.4, 0, 1);
      var hex = lerp(PORT_CX + 32, PORT_CX + 86, hu);
      var hey = lerp(PORT_CY + 14, PORT_CY + 44, hu) + Math.sin(s.tCont * 2.8) * 6 + driftLift;
      drawWaxEnvelope(ctx, hex, hey, -0.28 + Math.sin(s.tCont * 2.5) * 0.18, 0.96);
    } else if (s.act === "trout") {
      var catchU = smoothstep(5.6, 6.55, s.t);
      var deliverU = smoothstep(7.6, 8.75, s.t);

      var pTroutX = lerp(PORT_CX + 195, PORT_CX + 126, catchU) - deliverU * 66;
      var pTroutY = lerp(PORT_CY + 18, PORT_CY + 24, catchU) + deliverU * 22 + driftLift;

      // Envelope held right at Postal Trout's jaws (at 6.8s caught in beak/mouth; at 9.2s pressed toward glass!)
      var envX = pTroutX - 66 * lerp(0.9, 1.05, deliverU);
      var envY = pTroutY + 4 + Math.sin(s.tCont * 3.2) * 2;

      drawBrookTrout(ctx, {
        x: pTroutX,
        y: pTroutY,
        scale: lerp(0.88, 1.04, deliverU),
        facingRight: false,
        angle: lerp(0.05, -0.1, deliverU),
        t: s.tCont,
        hat: "postal",
        jawOpen: 0.24,
        lookX: -1.8,
        lookY: 0.3
      });

      drawWaxEnvelope(ctx, envX, envY, lerp(-0.36, -0.06, deliverU), lerp(0.94, 1.12, deliverU));

      // Subtle swirling suction ring near sub bottom-left when Trout wonders "Porch-pirate vacuum?" (6.2..7.6s)
      if (deliverU < 0.55) {
        ctx.save();
        ctx.strokeStyle = "rgba(188, 240, 232, 0.42)";
        ctx.lineWidth = 1.6;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.arc(envX - 24, envY + 14, 16 + Math.sin(s.tCont * 6) * 3, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Foreground undulating drowned creek wave bands
    ctx.save();
    ctx.fillStyle = "rgba(14, 46, 49, 0.52)";
    ctx.beginPath();
    ctx.moveTo(PORT_CX - 195, PORT_CY + 115 + driftLift * 0.4);
    for (var wx = PORT_CX - 195; wx <= PORT_CX + 195; wx += 30) {
      ctx.lineTo(wx, PORT_CY + 112 + Math.sin(wx * 0.03 + s.tCont * 1.8) * 7 + driftLift * 0.4);
    }
    ctx.lineTo(PORT_CX + 195, PORT_CY + 200);
    ctx.lineTo(PORT_CX - 195, PORT_CY + 200);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    drawMurkAndCurrentOverlay(ctx, s);
  }

  function drawWaxEnvelope(ctx, x, y, rot, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(scale || 1, scale || 1);

    drawRoundRect(ctx, -21, -13, 42, 26, 2);
    ctx.fillStyle = "#f6efe0";
    ctx.fill();
    ctx.strokeStyle = "#1a2122";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Envelope back flap V-lines
    ctx.beginPath();
    ctx.moveTo(-20, -12);
    ctx.lineTo(0, 3);
    ctx.lineTo(20, -12);
    ctx.moveTo(-20, 12);
    ctx.lineTo(-6, 0);
    ctx.moveTo(20, 12);
    ctx.lineTo(6, 0);
    ctx.strokeStyle = "#333d3e";
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // Crimson 1943 wax seal
    ctx.beginPath();
    ctx.arc(0, 2, 4.4, 0, Math.PI * 2);
    ctx.fillStyle = "#9e2d24";
    ctx.fill();
    ctx.strokeStyle = "#2b1210";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  // =========================================================================
  // SETUP A BREAD-TIN COCKPIT & EDITORIAL STORY STRIP
  // Invariants:
  //   - Oval bread-roll tin interior (#132427) + right-side dent
  //   - Overhead amber task-light bar
  //   - Centered 6-bolt riveted brass porthole (cx=640, cy=255, r_glass=185)
  //     with left hinge, offset right latch, 2-o'clock rim chip, and 6-o'clock lamp mount
  //   - Ballast / Single Slot bottom-left
  //   - Chalk Chart Under Glass bottom-center (route + gold dot at t >= 5.6s)
  //   - Lamp Toggle bottom-right
  //   - 1 Day of Air dial top-right
  //   - Articulated Turkey silhouette + feathered wing operating the active control!
  //   - Lower cream strip (#faf8f3, y=536..720) when showCaptions !== false;
  //     pure text-free bench apron when showCaptions === false!
  // =========================================================================
  function renderSetupACockpit(ctx, sceneMeta, s, renderInteriorWorld) {
    var showLabels = s.showCaptions;

    // 1. Bread-Roll Tin Hull Interior Wall (#132427)
    var wallGrad = ctx.createRadialGradient(
      PORT_CX, 95, 60,
      PORT_CX, 280, 740
    );
    var taskWarmth = 0.16 + s.lampLevel * 0.12;
    wallGrad.addColorStop(0, "#243d40");
    wallGrad.addColorStop(0.55, "#132427");
    wallGrad.addColorStop(1, "#0b1618");
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, BASE_W, BASE_H);

    // Oval bread-roll tin arched ceiling ribs & brushed sheet-tin seams
    ctx.save();
    for (var rib = 0; rib < 3; rib++) {
      var rx = 595 - rib * 68;
      var ry = 355 - rib * 32;
      ctx.beginPath();
      ctx.ellipse(PORT_CX, 320, rx, ry, 0, Math.PI * 1.04, Math.PI * 1.96);
      ctx.strokeStyle = rib === 1 ? "rgba(188, 218, 214, 0.09)" : "rgba(6, 12, 14, 0.52)";
      ctx.lineWidth = rib === 1 ? 3 : 5;
      ctx.stroke();
    }

    //Warm amber wash from overhead task light
    var amb = ctx.createRadialGradient(PORT_CX, 32, 12, PORT_CX, 160, 460);
    amb.addColorStop(0, "rgba(255, 194, 102, " + taskWarmth.toFixed(3) + ")");
    amb.addColorStop(1, "rgba(255, 194, 102, 0)");
    ctx.fillStyle = amb;
    ctx.fillRect(0, 0, BASE_W, COCKPIT_H);

    // Setup A Invariant: Right-Side Bread-Tin Dent! (x ~ 980..1155, y ~ 195..335)
    ctx.save();
    ctx.translate(1062, 268);
    ctx.beginPath();
    ctx.moveTo(-58, -62);
    ctx.bezierCurveTo(18, -74, 72, -32, 64, 18);
    ctx.bezierCurveTo(54, 62, -16, 72, -62, 38);
    ctx.bezierCurveTo(-34, 8, -28, -24, -58, -62);
    ctx.closePath();
    var dentG = ctx.createLinearGradient(-55, -50, 62, 48);
    dentG.addColorStop(0, "rgba(6, 13, 15, 0.72)");
    dentG.addColorStop(0.52, "rgba(38, 64, 68, 0.55)");
    dentG.addColorStop(1, "rgba(235, 186, 115, 0.16)");
    ctx.fillStyle = dentG;
    ctx.fill();
    // Crease ridge line inside dent
    ctx.beginPath();
    ctx.moveTo(-42, -40);
    ctx.quadraticCurveTo(14, -4, -38, 28);
    ctx.strokeStyle = "rgba(185, 212, 210, 0.18)";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.restore();
    ctx.restore();

    // 2. Overhead Amber Task-Light Bar (y = 14..38)
    ctx.save();
    drawRoundRect(ctx, 485, 12, 310, 22, 9);
    ctx.fillStyle = "#2b3838";
    ctx.fill();
    ctx.strokeStyle = "#0b1213";
    ctx.lineWidth = 2;
    ctx.stroke();

    drawRoundRect(ctx, 512, 16, 256, 13, 6);
    var tubeG = ctx.createLinearGradient(512, 16, 512, 29);
    tubeG.addColorStop(0, "#ffe49e");
    tubeG.addColorStop(0.5, "#edb059");
    tubeG.addColorStop(1, "#a66b24");
    ctx.fillStyle = tubeG;
    ctx.fill();
    // Brass protective cage ribs on task light
    ctx.strokeStyle = "#3a2d1b";
    ctx.lineWidth = 2;
    for (var cg = 0; cg < 6; cg++) {
      var cxBar = 538 + cg * 41;
      ctx.beginPath();
      ctx.moveTo(cxBar, 13);
      ctx.lineTo(cxBar, 33);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Clipped Underwater Multiplane World Inside Porthole Glass (cx=640, cy=255, r=185)
    ctx.save();
    ctx.beginPath();
    ctx.arc(PORT_CX, PORT_CY, PORT_R, 0, Math.PI * 2);
    ctx.clip();

    renderInteriorWorld(ctx, s);

    // Subtle Turkey reflection inside the curved glass at ~7:30 o'clock (faithful to p31..p35 stills!)
    drawTurkeyGlassReflection(ctx, s);

    // Curved glass inner shadow & upper-left specular crescent highlight
    var innerRim = ctx.createRadialGradient(PORT_CX, PORT_CY, PORT_R - 26, PORT_CX, PORT_CY, PORT_R + 2);
    innerRim.addColorStop(0, "rgba(0,0,0,0)");
    innerRim.addColorStop(0.75, "rgba(8, 18, 20, 0.22)");
    innerRim.addColorStop(1, "rgba(5, 12, 14, 0.65)");
    ctx.fillStyle = innerRim;
    ctx.fillRect(PORT_CX - PORT_R, PORT_CY - PORT_R, PORT_R * 2, PORT_R * 2);

    ctx.beginPath();
    ctx.arc(PORT_CX, PORT_CY, PORT_R - 9, -2.58, -1.68);
    ctx.strokeStyle = "rgba(235, 252, 248, 0.32)";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    // 4. Centered 6-Bolt Riveted Antique Brass Porthole Frame + 2-o'clock Chip + Offset Latch!
    drawBrassPortholeFrame(ctx, s);

    // 5. Top-Right: "1 Day of Air" Brass Gauge Dial
    drawAirDial(ctx, s, showLabels);

    // 6. Cockpit Lower Console Shelf (y = 438..536)
    ctx.save();
    var shelfG = ctx.createLinearGradient(0, 448, 0, COCKPIT_H);
    shelfG.addColorStop(0, "#1c3135");
    shelfG.addColorStop(1, "#0f1c1f");
    ctx.fillStyle = shelfG;
    ctx.beginPath();
    ctx.moveTo(0, 468);
    ctx.quadraticCurveTo(PORT_CX, 444, BASE_W, 468);
    ctx.lineTo(BASE_W, COCKPIT_H);
    ctx.lineTo(0, COCKPIT_H);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#344e52";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 7. Three Setup A Console Controls:
    //    Left: Ballast / Single Slot | Center: Chalk Chart Under Glass | Right: Lamp Toggle
    drawBallastSlotControl(ctx, s, showLabels);
    drawChalkChartUnderGlass(ctx, sceneMeta.id, s, showLabels);
    drawLampToggleControl(ctx, s, showLabels);

    // 8. Foreground Turkey Pilot Head/Shoulder Silhouette + Articulated Feathered Wing Operating Control!
    drawTurkeyPilotForeground(ctx, s);

    // 9. Lower Strip (y = 536..720):
    //    Editorial Story Strip when showCaptions !== false;
    //    Clean, zero-text River Works wooden bench apron when showCaptions === false!
    if (showLabels) {
      drawEditorialStoryStrip(ctx, sceneMeta, s);
    } else {
      drawTextFreeBenchApron(ctx);
    }
  }

  function drawTurkeyGlassReflection(ctx, s) {
    // Subtle translucent ghost reflection of Turkey peering out at lower-left inside the glass
    var nod = Math.sin(s.tCont * 2.2) * 0.05 + (s.act === "turkey" ? -0.06 : 0.02);
    var blink = (Math.abs(s.t - 2.85) < 0.09 || Math.abs(s.t - 5.15) < 0.09 || Math.abs(s.t - 8.35) < 0.09);

    ctx.save();
    ctx.globalAlpha = s.act === "trout" ? 0.48 : 0.36; // slightly clearer from outside when Trout looks in!
    ctx.translate(PORT_CX - 114, PORT_CY + 118);
    ctx.rotate(nod);

    // Feathered dome & neck
    ctx.beginPath();
    ctx.moveTo(-36, 48);
    ctx.quadraticCurveTo(-40, -14, -10, -34);
    ctx.quadraticCurveTo(22, -38, 28, -8);
    ctx.quadraticCurveTo(32, 22, 18, 52);
    ctx.closePath();
    ctx.fillStyle = "#9b6b4b";
    ctx.fill();
    ctx.strokeStyle = "#2b1c14";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Red wattle / snood
    ctx.beginPath();
    ctx.moveTo(26, 2);
    ctx.quadraticCurveTo(34, 16, 27, 26);
    ctx.quadraticCurveTo(20, 22, 22, 6);
    ctx.fillStyle = "#c94c38";
    ctx.fill();

    // Curved beak
    ctx.beginPath();
    ctx.moveTo(24, -10);
    ctx.quadraticCurveTo(44, -6, 48, 3);
    ctx.quadraticCurveTo(34, 5, 23, 2);
    ctx.closePath();
    ctx.fillStyle = "#dfb260";
    ctx.fill();
    ctx.stroke();

    // Eye (with blink!)
    ctx.beginPath();
    ctx.arc(8, -10, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = "#efe6cf";
    ctx.fill();
    ctx.stroke();
    if (blink) {
      ctx.beginPath();
      ctx.moveTo(2, -10);
      ctx.lineTo(14, -10);
      ctx.strokeStyle = "#2b1c14";
      ctx.lineWidth = 2.2;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(10, -10, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = "#181412";
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBrassPortholeFrame(ctx, s) {
    ctx.save();

    // Left heavy cast-iron double-barrel hinge
    drawRoundRect(ctx, PORT_CX - PORT_OUTER_R - 18, PORT_CY - 48, 32, 96, 5);
    ctx.fillStyle = "#3c4342";
    ctx.fill();
    ctx.strokeStyle = "#101515";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    drawRoundRect(ctx, PORT_CX - PORT_OUTER_R - 24, PORT_CY - 52, 13, 104, 6);
    ctx.fillStyle = "#2b3130";
    ctx.fill();
    ctx.stroke();
    // Hinge screws
    for (var hs = -1; hs <= 1; hs += 2) {
      ctx.beginPath();
      ctx.arc(PORT_CX - PORT_OUTER_R + 2, PORT_CY + hs * 30, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#596160";
      ctx.fill();
      ctx.stroke();
    }

    // Outer antique brass ring (donut)
    var brassG = ctx.createLinearGradient(
      PORT_CX - PORT_OUTER_R, PORT_CY - PORT_OUTER_R,
      PORT_CX + PORT_OUTER_R, PORT_CY + PORT_OUTER_R
    );
    brassG.addColorStop(0, "#d7b365");
    brassG.addColorStop(0.35, "#a9833b");
    brassG.addColorStop(0.7, "#755622");
    brassG.addColorStop(1, "#b89246");

    ctx.beginPath();
    ctx.arc(PORT_CX, PORT_CY, PORT_OUTER_R, 0, Math.PI * 2);
    ctx.arc(PORT_CX, PORT_CY, PORT_R, 0, Math.PI * 2, true);
    ctx.fillStyle = brassG;
    ctx.fill();

    // Outer & inner bevel strokes
    ctx.beginPath();
    ctx.arc(PORT_CX, PORT_CY, PORT_OUTER_R, 0, Math.PI * 2);
    ctx.strokeStyle = "#111819";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(PORT_CX, PORT_CY, PORT_R + 11, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(32, 22, 10, 0.65)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(PORT_CX, PORT_CY, PORT_R, 0, Math.PI * 2);
    ctx.strokeStyle = "#141a1b";
    ctx.lineWidth = 3;
    ctx.stroke();

    // --- SETUP A INVARIANT: 2-o'clock Rim Chip! (angle ~ -0.52 rad / -30 deg on inner bevel) ---
    ctx.save();
    ctx.translate(PORT_CX, PORT_CY);
    ctx.rotate(-0.48); // right at 2 o'clock!
    ctx.beginPath();
    ctx.moveTo(PORT_R - 2, -9);
    ctx.lineTo(PORT_R + 13, -3);
    ctx.lineTo(PORT_R + 9, 8);
    ctx.lineTo(PORT_R - 2, 6);
    ctx.closePath();
    ctx.fillStyle = "#1c2829";
    ctx.fill();
    ctx.strokeStyle = "#f2d68d"; // raw chipped brass highlight edge
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    // --- 6 Hexagonal Brass Bolts (faces 1..6; rolled bolt glints in Act 3 / interactive roll!) ---
    var boltAngles = [
      -Math.PI * 0.5,          // Bolt 1 (12 o'clock)
      -Math.PI / 6,            // Bolt 2 (2 o'clock)
      Math.PI / 6,             // Bolt 3 (4 o'clock)
      Math.PI * 0.5,           // Bolt 4 (6 o'clock)
      Math.PI * (5 / 6),       // Bolt 5 (8 o'clock)
      -Math.PI * (5 / 6)       // Bolt 6 (10 o'clock)
    ];
    var boltR = (PORT_R + PORT_OUTER_R) * 0.5 + 2;

    for (var bi = 0; bi < 6; bi++) {
      var faceNum = bi + 1;
      var ba = boltAngles[bi];
      var bx = PORT_CX + Math.cos(ba) * boltR;
      var by = PORT_CY + Math.sin(ba) * boltR;
      var isRolled = s.roll === faceNum;

      if (isRolled) {
        var pulse = 0.72 + 0.28 * Math.sin(s.tCont * 6.5);
        var haloCol = faceNum <= 2 ? "rgba(79, 209, 197, " : faceNum <= 4 ? "rgba(123, 224, 160, " : "rgba(255, 155, 115, ";
        ctx.save();
        ctx.beginPath();
        ctx.arc(bx, by, 21, 0, Math.PI * 2);
        ctx.fillStyle = haloCol + (0.42 * pulse).toFixed(3) + ")";
        ctx.fill();
        ctx.strokeStyle = "#ffe27a";
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.restore();
      }

      // Hex bolt head
      ctx.beginPath();
      for (var h = 0; h < 6; h++) {
        var ha = (h / 6) * Math.PI * 2 + 0.52;
        var hx = bx + Math.cos(ha) * 11;
        var hy = by + Math.sin(ha) * 11;
        if (h === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fillStyle = isRolled ? "#ffe07d" : "#b99245";
      ctx.fill();
      ctx.strokeStyle = "#18150e";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(bx, by, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = isRolled ? "#fff5c0" : "#9c7730";
      ctx.fill();
      ctx.stroke();
    }

    // Offset Right Brass Dog-Latch (3 o'clock, slightly below center)
    ctx.save();
    ctx.translate(PORT_CX + PORT_OUTER_R - 8, PORT_CY + 14);
    drawRoundRect(ctx, -10, -34, 22, 68, 8);
    ctx.fillStyle = "#b89144";
    ctx.fill();
    ctx.strokeStyle = "#16140f";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Latch handle tongue
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.quadraticCurveTo(-4, -12, 28, -9);
    ctx.lineTo(28, 9);
    ctx.quadraticCurveTo(-4, 12, -16, 0);
    ctx.closePath();
    ctx.fillStyle = "#d5af5c";
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 6-o'clock Aimed Brass Lamp Hood at bottom of porthole rim
    ctx.save();
    ctx.translate(PORT_CX, PORT_CY + PORT_R - 2);
    ctx.beginPath();
    ctx.arc(0, 6, 30, Math.PI, 0);
    ctx.lineTo(36, 12);
    ctx.lineTo(-36, 12);
    ctx.closePath();
    ctx.fillStyle = s.lampLevel > 0.3 ? "#d4a448" : "#7c6028";
    ctx.fill();
    ctx.strokeStyle = "#151612";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    if (s.lampLevel > 0.05) {
      ctx.beginPath();
      ctx.ellipse(0, -8, 18, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 232, 148, " + (0.85 * s.lampLevel).toFixed(3) + ")";
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  }

  function drawAirDial(ctx, s, showLabels) {
    var cx = 1110;
    var cy = 88;
    var r = 38;
    ctx.save();
    // Brass bezel
    ctx.beginPath();
    ctx.arc(cx, cy, r + 7, 0, Math.PI * 2);
    ctx.fillStyle = "#9d7a36";
    ctx.fill();
    ctx.strokeStyle = "#0e1516";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Cream gauge face
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#f4edd9";
    ctx.fill();
    ctx.stroke();

    // Safe green & reserve amber arcs
    ctx.beginPath();
    ctx.arc(cx, cy, r - 7, Math.PI * 0.8, Math.PI * 1.85);
    ctx.strokeStyle = "#2d6846";
    ctx.lineWidth = 4.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 7, Math.PI * 1.85, Math.PI * 2.2);
    ctx.strokeStyle = "#c85b32";
    ctx.lineWidth = 4.5;
    ctx.stroke();

    // Tick marks
    for (var tk = 0; tk <= 8; tk++) {
      var ta = lerp(Math.PI * 0.8, Math.PI * 2.2, tk / 8);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ta) * (r - 12), cy + Math.sin(ta) * (r - 12));
      ctx.lineTo(cx + Math.cos(ta) * (r - 4), cy + Math.sin(ta) * (r - 4));
      ctx.strokeStyle = "#1d2628";
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // Slowly breathing needle (~76% of 1 Day of Air)
    var airFrac = 0.78 - (s.t / 10) * 0.04 + Math.sin(s.tCont * 3.5) * 0.012;
    var nAng = lerp(Math.PI * 0.8, Math.PI * 2.2, airFrac);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(nAng) * (r - 9), cy + Math.sin(nAng) * (r - 9));
    ctx.strokeStyle = "#9e3d1c";
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#1c2224";
    ctx.fill();

    // Brass nameplate below dial
    drawRoundRect(ctx, cx - 54, cy + 49, 108, 19, 3);
    ctx.fillStyle = "#263b3e";
    ctx.fill();
    ctx.strokeStyle = "#8a6d33";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    if (showLabels) {
      ctx.fillStyle = "#e8dfc8";
      ctx.font = "700 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("1 DAY OF AIR", cx, cy + 62);
    }
    ctx.restore();
  }

  function drawBallastSlotControl(ctx, s, showLabels) {
    var x = 92;
    var y = 432;
    var w = 238;
    var h = 88;
    ctx.save();

    // Recessed single-attachment housing
    drawRoundRect(ctx, x, y, w, h, 8);
    ctx.fillStyle = "#142528";
    ctx.fill();
    ctx.strokeStyle = "#6c8584";
    ctx.lineWidth = 2;
    ctx.stroke();

    // LEGO-keyed Single Slot rails
    drawRoundRect(ctx, x + 16, y + 28, 152, 42, 4);
    ctx.fillStyle = "#0b1517";
    ctx.fill();
    ctx.strokeStyle = "#3c5658";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // Keyed notches on top of socket
    ctx.fillStyle = "#3c5658";
    ctx.fillRect(x + 42, y + 25, 18, 5);
    ctx.fillRect(x + 112, y + 25, 18, 5);

    // Low Rectangular Ballast Tray with one usable brass handle!
    // Slides horizontally into the keyed socket as ballastLevel goes 0 -> 1!
    var slideX = lerp(x + 56, x + 20, s.ballastLevel);
    var slideY = lerp(y + 18, y + 31, s.ballastLevel);

    ctx.save();
    ctx.translate(slideX, slideY);
    drawRoundRect(ctx, 0, 0, 144, 36, 4);
    ctx.fillStyle = s.ballastOn ? "#4e6d68" : "#384b4d";
    ctx.fill();
    ctx.strokeStyle = s.ballastOn ? "#a3dac8" : "#121c1e";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lead ballast weight bars inside tray
    for (var lw = 0; lw < 3; lw++) {
      drawRoundRect(ctx, 10 + lw * 36, 7, 28, 22, 2);
      ctx.fillStyle = "#263638";
      ctx.fill();
    }

    // Usable right brass grab-handle
    drawRoundRect(ctx, 124, 6, 14, 24, 3);
    ctx.fillStyle = "#d4ad56";
    ctx.fill();
    ctx.strokeStyle = "#161a1a";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    // Snap-lock detent LED jewel
    ctx.beginPath();
    ctx.arc(x + 202, y + 49, 8, 0, Math.PI * 2);
    ctx.fillStyle = s.ballastOn ? "#5ce0a8" : "#2b3b3c";
    ctx.fill();
    ctx.strokeStyle = "#0e1617";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    if (showLabels) {
      ctx.fillStyle = s.ballastOn ? "#a3dac8" : "#9db2b0";
      ctx.font = "700 10.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("BALLAST · SINGLE SLOT", x + 16, y + 18);
      ctx.textAlign = "center";
      ctx.fillText(s.ballastOn ? "FITTED" : "STOWED", x + 202, y + 73);
    }
    ctx.restore();
  }

  function drawChalkChartUnderGlass(ctx, portholeId, s, showLabels) {
    var x = 446;
    var y = 456;
    var w = 388;
    var h = 68;
    ctx.save();

    // Brass-framed slate box
    drawRoundRect(ctx, x, y, w, h, 7);
    ctx.fillStyle = "#1a2829";
    ctx.fill();
    ctx.strokeStyle = "#a2803c";
    ctx.lineWidth = 2.6;
    ctx.stroke();

    // Faint pre-existing chalk river bend + two trunks + Stone Steps ticks
    ctx.strokeStyle = "rgba(216, 230, 224, 0.28)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 24, y + 48);
    ctx.bezierCurveTo(x + 120, y + 18, x + 235, y + 58, x + 362, y + 26);
    ctx.stroke();

    // Stone Steps hatch ticks on bank
    ctx.strokeStyle = "rgba(216, 230, 224, 0.42)";
    ctx.lineWidth = 1.5;
    for (var st = 0; st < 4; st++) {
      ctx.beginPath();
      ctx.moveTo(x + 92 + st * 7, y + 24 + st * 3);
      ctx.lineTo(x + 98 + st * 7, y + 24 + st * 3);
      ctx.stroke();
    }

    // Progressively drawn verified chalk route + gold landmark dot at t >= 5.6s!
    if (s.chartProgress > 0.01) {
      var totalSegs = 28;
      var activeSegs = Math.max(1, Math.floor(s.chartProgress * totalSegs));
      var targetU = 0.28 + ((portholeId - 31) / 4) * 0.56; // distinct bend station per porthole #31..#35!

      ctx.save();
      ctx.strokeStyle = "#f7f3e6";
      ctx.lineWidth = 2.6;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      for (var i = 0; i <= activeSegs; i++) {
        var u = (i / totalSegs) * targetU;
        var rx = lerp(x + 26, x + 358, u);
        var ry = y + 38 + Math.sin(u * Math.PI * 2.1 - 0.5) * 14;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      if (s.chartProgress > 0.55) {
        var dotPop = easeOutBack((s.chartProgress - 0.55) / 0.45);
        var gx = lerp(x + 26, x + 358, targetU);
        var gy = y + 38 + Math.sin(targetU * Math.PI * 2.1 - 0.5) * 14;
        ctx.beginPath();
        ctx.arc(gx, gy, 8 * dotPop, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 212, 92, 0.32)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(gx, gy, 4.5 * dotPop, 0, Math.PI * 2);
        ctx.fillStyle = "#ffd45c";
        ctx.fill();
        ctx.strokeStyle = "#181c1c";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Glazing diagonal specular sheen over the chalk chart
    ctx.beginPath();
    ctx.moveTo(x + 48, y + 3);
    ctx.lineTo(x + 86, y + 3);
    ctx.lineTo(x + 52, y + h - 3);
    ctx.lineTo(x + 14, y + h - 3);
    ctx.closePath();
    ctx.fillStyle = "rgba(235, 248, 246, 0.08)";
    ctx.fill();

    if (showLabels) {
      ctx.fillStyle = "#b7cbca";
      ctx.font = "700 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("CHALK CHART UNDER GLASS", x + 14, y + 15);
      if (s.chartProgress > 0.6) {
        ctx.fillStyle = "#ffd45c";
        ctx.textAlign = "right";
        ctx.fillText("MARKED ✓", x + w - 14, y + 15);
      }
    }
    ctx.restore();
  }

  function drawLampToggleControl(ctx, s, showLabels) {
    var x = 950;
    var y = 432;
    var w = 238;
    var h = 88;
    ctx.save();

    drawRoundRect(ctx, x, y, w, h, 8);
    ctx.fillStyle = "#142528";
    ctx.fill();
    ctx.strokeStyle = "#6c8584";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Brass toggle switch escutcheon plate
    var swX = x + 84;
    var swY = y + 52;
    ctx.beginPath();
    ctx.arc(swX, swY, 21, 0, Math.PI * 2);
    ctx.fillStyle = "#8e6d2f";
    ctx.fill();
    ctx.strokeStyle = "#111718";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Heavy bat-handle brass toggle lever (flips from DOWN +0.62 rad to UP -0.62 rad at t=1.0s!)
    var leverAng = lerp(0.65, -0.65, s.lampLevel);
    ctx.save();
    ctx.translate(swX, swY);
    ctx.rotate(leverAng);
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(-7, -30);
    ctx.arc(0, -30, 7, Math.PI, 0);
    ctx.lineTo(4, 0);
    ctx.closePath();
    ctx.fillStyle = "#ebca74";
    ctx.fill();
    ctx.strokeStyle = "#141819";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Amber jewel pilot indicator
    var jx = x + 168;
    var jy = y + 52;
    if (s.lampOn) {
      var jGlow = ctx.createRadialGradient(jx, jy, 2, jx, jy, 24);
      jGlow.addColorStop(0, "rgba(255, 224, 128, 0.85)");
      jGlow.addColorStop(1, "rgba(255, 184, 68, 0)");
      ctx.fillStyle = jGlow;
      ctx.beginPath();
      ctx.arc(jx, jy, 24, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(jx, jy, 10, 0, Math.PI * 2);
    ctx.fillStyle = s.lampOn ? "#ffd25c" : "#3d2a1e";
    ctx.fill();
    ctx.strokeStyle = "#111718";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (showLabels) {
      ctx.fillStyle = s.lampOn ? "#ffd97d" : "#9db2b0";
      ctx.font = "700 10.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("AIMED LAMP TOGGLE", x + 16, y + 18);
      ctx.textAlign = "center";
      ctx.fillText(s.lampOn ? "ON" : "OFF", jx, y + 76);
    }
    ctx.restore();
  }

  // Articulated Turkey Pilot Silhouette & Feathered Wing Operating the Active Control (Act 1: t=0.2..1.75s)
  function drawTurkeyPilotForeground(ctx, s) {
    // 1. Foreground Turkey Pilot Shoulder/Head Silhouette at lower-left cockpit seat
    var headBob = Math.sin(s.tCont * 2.1) * 3;
    var headLean = s.act === "turkey" ? 10 : s.act === "trout" ? -4 : 0;

    ctx.save();
    ctx.translate(376 + headLean, 444 + headBob);
    // Feathered back & neck silhouette
    ctx.beginPath();
    ctx.moveTo(-82, 92);
    ctx.quadraticCurveTo(-76, 12, -32, -26);
    ctx.quadraticCurveTo(-8, -68, 22, -62);
    ctx.quadraticCurveTo(44, -56, 42, -28);
    // Beak silhouette pointing toward porthole
    ctx.lineTo(62, -22);
    ctx.lineTo(43, -12);
    // Wattle
    ctx.quadraticCurveTo(48, 4, 38, 12);
    ctx.quadraticCurveTo(32, 8, 32, -2);
    ctx.quadraticCurveTo(36, 42, 24, 92);
    ctx.closePath();
    var turkG = ctx.createLinearGradient(-40, -65, 45, 75);
    turkG.addColorStop(0, "#4a2c1d");
    turkG.addColorStop(0.6, "#2c1b13");
    turkG.addColorStop(1, "#17100c");
    ctx.fillStyle = turkG;
    ctx.fill();
    ctx.strokeStyle = "#8a5a3c";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Warm rim-lit eye on foreground Turkey pilot
    ctx.beginPath();
    ctx.arc(24, -36, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = "#f2dec0";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(25.4, -36, 2.1, 0, Math.PI * 2);
    ctx.fillStyle = "#14100e";
    ctx.fill();
    ctx.restore();

    // 2. Articulated 2-Segment Feathered Turkey Wing Reaching to Operate Control!
    // At t=0.8s (Strip Frame 1!), reachU = 0.96 -> wing tip is poised right on the Lamp Toggle or Ballast Handle!
    // At t=1.0s, wing flicks/slides the control!
    // By t=1.8s (Strip Frame 2!), reachU = 0.12 -> wing settles cleanly back to cockpit sill rest!
    var reachU = 0;
    if (s.t < 1.95) {
      if (s.t < 0.85) {
        reachU = smoothstep(0.18, 0.72, s.t);
      } else if (s.t < 1.18) {
        reachU = 1.0;
      } else {
        reachU = 1.0 - smoothstep(1.18, 1.82, s.t);
      }
    }

    var isRightTool = s.defaultTool === "lamp";
    var restShoulderX = isRightTool ? 835 : 375;
    var restShoulderY = 548;
    var restTipX = isRightTool ? 892 : 342;
    var restTipY = 514;

    var targetX = isRightTool ? 1034 : 248;
    var targetY = isRightTool ? 462 - smoothstep(0.94, 1.12, s.t) * 26 : 464;
    if (!isRightTool && s.t >= 0.94 && s.t <= 1.25) {
      targetX = lerp(268, 232, smoothstep(0.94, 1.16, s.t));
    }

    var tipX = lerp(restTipX, targetX, reachU);
    var tipY = lerp(restTipY, targetY, reachU);
    var elbowX = lerp(restShoulderX, tipX, 0.52) + (isRightTool ? -18 : 18) * reachU;
    var elbowY = lerp(restShoulderY, tipY, 0.52) + 24 * reachU;

    ctx.save();
    // Upper wing limb
    ctx.strokeStyle = "#1a110d";
    ctx.lineWidth = 26;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(restShoulderX, restShoulderY);
    ctx.quadraticCurveTo(elbowX, elbowY, tipX, tipY);
    ctx.stroke();

    ctx.strokeStyle = "#5d3824";
    ctx.lineWidth = 21;
    ctx.beginPath();
    ctx.moveTo(restShoulderX, restShoulderY);
    ctx.quadraticCurveTo(elbowX, elbowY, tipX, tipY);
    ctx.stroke();

    // Fan of 5 articulated primary wing feathers at the hand/tip!
    var handAng = Math.atan2(tipY - elbowY, tipX - elbowX);
    ctx.translate(tipX, tipY);
    ctx.rotate(handAng);
    for (var pf = -2; pf <= 2; pf++) {
      ctx.save();
      ctx.rotate(pf * 0.16);
      ctx.beginPath();
      ctx.ellipse(12, 0, 22, 5.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = pf % 2 === 0 ? "#7a4b31" : "#5e3823";
      ctx.fill();
      ctx.strokeStyle = "#1c120d";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Cream feather bar stripe & central quill
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(28, 0);
      ctx.strokeStyle = "#caa57c";
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawTextFreeBenchApron(ctx) {
    // Pure PAELEO blind-critic mode (showCaptions === false):
    // Renders the tactile wooden River Works bench apron & riveted brass hull trim — ZERO text!
    ctx.save();
    var woodG = ctx.createLinearGradient(0, COCKPIT_H, 0, BASE_H);
    woodG.addColorStop(0, "#241b14");
    woodG.addColorStop(0.18, "#38291e");
    woodG.addColorStop(1, "#1e1610");
    ctx.fillStyle = woodG;
    ctx.fillRect(0, COCKPIT_H, BASE_W, BASE_H - COCKPIT_H);

    // Brass top seam strip with spaced rivets
    ctx.fillStyle = "#7c602b";
    ctx.fillRect(0, COCKPIT_H, BASE_W, 8);
    ctx.strokeStyle = "#120e0a";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, COCKPIT_H, BASE_W, 8);

    for (var rx = 48; rx < BASE_W; rx += 96) {
      ctx.beginPath();
      ctx.arc(rx, COCKPIT_H + 4, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = "#d9b566";
      ctx.fill();
    }

    // Subtle horizontal wood-plank grain lines
    ctx.strokeStyle = "rgba(15, 10, 7, 0.38)";
    ctx.lineWidth = 1.4;
    for (var gy = COCKPIT_H + 28; gy < BASE_H; gy += 26) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(420, gy - 4, 860, gy + 5, BASE_W, gy - 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawEditorialStoryStrip(ctx, sceneMeta, s) {
    // VOIDBASTARD-TAO cream paper strip (#faf8f3) at y = 536..720
    ctx.save();
    ctx.fillStyle = "#faf8f3";
    ctx.fillRect(0, COCKPIT_H, BASE_W, BASE_H - COCKPIT_H);

    // Top 2px dark ink rule
    ctx.fillStyle = "#14181a";
    ctx.fillRect(0, COCKPIT_H, BASE_W, 2.5);

    // Left Column (x = 36..460): Station + Rim Clue + SCION Rule
    ctx.fillStyle = "#2d6846";
    ctx.font = "700 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.textAlign = "left";
    ctx.fillText(sceneMeta.station.toUpperCase() + "  ·  " + sceneMeta.scionRule.toUpperCase(), 38, COCKPIT_H + 34);

    ctx.fillStyle = "#6b767c";
    ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText("PRE-PRINTED RIM CLUE (OUTSIDE)", 38, COCKPIT_H + 62);

    ctx.fillStyle = "#14181a";
    ctx.font = "400 20px Georgia, 'Iowan Old Style', 'Times New Roman', serif";
    ctx.fillText(sceneMeta.clue, 38, COCKPIT_H + 92);

    // Control state pill bottom-left
    var toolTxt = "LAMP: " + (s.lampOn ? "ON" : "OFF") + "   ·   BALLAST: " + (s.ballastOn ? "FITTED" : "STOWED");
    ctx.fillStyle = "#394246";
    ctx.font = "600 11.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText(toolTxt, 38, COCKPIT_H + 148);

    // Vertical divider
    ctx.fillStyle = "#dfdad0";
    ctx.fillRect(492, COCKPIT_H + 20, 1.5, BASE_H - COCKPIT_H - 40);

    // Right Column (x = 524..1244): Active Pass Kicker + Duck/Rabbit Fork
    if (s.act === "setup") {
      var ctrlLabel = s.defaultTool === "lamp" ? "FLIPPING AIMED LAMP TOGGLE" : "SLIDING BALLAST INTO SINGLE SLOT";
      ctx.fillStyle = "#394246";
      ctx.font = "700 12.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.fillText("SETUP A · OPERATE ONE PART (" + ctrlLabel + ")", 524, COCKPIT_H + 36);

      ctx.fillStyle = "#9e3d1c";
      ctx.font = "400 21px Georgia, 'Iowan Old Style', serif";
      ctx.fillText("Turkey (1·3·5): " + sceneMeta.turkeyFork, 524, COCKPIT_H + 80);

      ctx.fillStyle = "#1d596e";
      ctx.fillText("Trout (2·4·6):  " + sceneMeta.troutFork, 524, COCKPIT_H + 116);
    } else if (s.act === "turkey") {
      ctx.fillStyle = "#9e3d1c";
      ctx.font = "700 13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.fillText("FIRST PASS · TURKEY LOOKS OUT  (ODD FACES 1 · 3 · 5)", 524, COCKPIT_H + 38);

      ctx.fillStyle = "#14181a";
      ctx.font = "400 30px Georgia, 'Iowan Old Style', 'Times New Roman', serif";
      ctx.fillText("“" + sceneMeta.turkeyFork + "”", 524, COCKPIT_H + 88);

      ctx.fillStyle = "#6b767c";
      ctx.font = "600 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.fillText("NEXT AT 5.6s → SECOND PASS · TROUT LOOKS IN (" + sceneMeta.troutFork + ")", 524, COCKPIT_H + 146);
    } else {
      ctx.fillStyle = "#1d596e";
      ctx.font = "700 13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.fillText("SECOND PASS · TROUT LOOKS IN  (EVEN FACES 2 · 4 · 6)", 524, COCKPIT_H + 38);

      ctx.fillStyle = "#14181a";
      ctx.font = "400 30px Georgia, 'Iowan Old Style', 'Times New Roman', serif";
      ctx.fillText("“" + sceneMeta.troutFork + "”", 524, COCKPIT_H + 88);

      var tierName = s.roll <= 2 ? "PROBABLE" : s.roll <= 4 ? "PLAUSIBLE" : "PREPOSTEROUS";
      var tierCol = s.roll <= 2 ? "#1d596e" : s.roll <= 4 ? "#2d6846" : "#9e3d1c";
      ctx.fillStyle = tierCol;
      ctx.font = "700 12.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.fillText(
        "ROLLED 1d6 BOLT #" + s.roll + " (" + tierName + ")  ·  CHALK CHART LANDMARK RECORDED",
        524,
        COCKPIT_H + 146
      );
    }

    ctx.restore();
  }

  // --- Register All 5 Crew-07 Portal Scenes (#31–#35) ---
  function makePortalEntry(meta, defaultRoll, interiorFn) {
    return {
      id: meta.id,
      station: meta.station,
      clue: meta.clue,
      turkeyFork: meta.turkeyFork,
      troutFork: meta.troutFork,
      scionRule: meta.scionRule,
      defaultTool: meta.defaultTool,
      render: function (ctx, W, H, t, state) {
        var w = W || BASE_W;
        var h = H || BASE_H;
        var s = resolveSceneState(t, state, meta.defaultTool, defaultRoll);
        ctx.save();
        if (w !== BASE_W || h !== BASE_H) {
          ctx.scale(w / BASE_W, h / BASE_H);
        }
        renderSetupACockpit(ctx, meta, s, interiorFn);
        ctx.restore();
      }
    };
  }

  window.PORTAL_SCENES[31] = makePortalEntry({
    id: 31,
    station: "#31 · Galley B",
    clue: "Dented bread-roll tin stamped WARM TO 375°F",
    turkeyFork: "Thanksgiving roasting pan or spare hull?",
    troutFork: "Heated minnow spa or floating toaster?",
    scionRule: "Thermal Inversion (SCION 51)",
    defaultTool: "lamp"
  }, 2, renderPortal31);

  window.PORTAL_SCENES[32] = makePortalEntry({
    id: 32,
    station: "#32 · Beak Arm",
    clue: "Scissor-jack tongs pinching a skeleton key",
    turkeyFork: "Bridge lock-pick or crab pincer?",
    troutFork: "Mechanical dentist or lock-picking burglar?",
    scionRule: "Gadget Extension (SCION 13)",
    defaultTool: "lamp"
  }, 6, renderPortal32);

  window.PORTAL_SCENES[33] = makePortalEntry({
    id: 33,
    station: "#33 · Salon",
    clue: "Velvet iris frame around culvert bar shadows",
    turkeyFork: "Theater curtain or stone tunnel?",
    troutFork: "Rivet-toothed monster jaw or movie projector?",
    scionRule: "Mystimation Silhouette (SCION 02)",
    defaultTool: "ballast"
  }, 4, renderPortal33);

  window.PORTAL_SCENES[34] = makePortalEntry({
    id: 34,
    station: "#34 · Organ",
    clue: "Cutaway boiler room with bellows & pipes",
    turkeyFork: "Steam-organ rescue crew or furnace?",
    troutFork: "Polka calliope barge or rattling radiator?",
    scionRule: "Cutaway Section (SCION 31)",
    defaultTool: "lamp"
  }, 5, renderPortal34);

  window.PORTAL_SCENES[35] = makePortalEntry({
    id: 35,
    station: "#35 · Post #44",
    clue: "1943 canvas mail sack spilling at Box #44",
    turkeyFork: "Lost mission orders or laundry sack?",
    troutFork: "Porch-pirate vacuum or mailman’s truck?",
    scionRule: "Fixed-Shot Handoff (Oucipo)",
    defaultTool: "ballast"
  }, 2, renderPortal35);
})();
