(function () {
  "use strict";

  window.PORTAL_SCENES = window.PORTAL_SCENES || {};

  // ---------------------------------------------------------------------------
  // Deterministic math & easing utilities
  // ---------------------------------------------------------------------------
  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }
  function lerp(a, b, u) {
    return a + (b - a) * clamp(u, 0, 1);
  }
  function smoothstep(e0, e1, x) {
    if (e1 === e0) return x >= e1 ? 1 : 0;
    var u = clamp((x - e0) / (e1 - e0), 0, 1);
    return u * u * (3 - 2 * u);
  }
  function easeOutBack(u) {
    u = clamp(u, 0, 1);
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
  }
  function hash1(n) {
    var s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  // ---------------------------------------------------------------------------
  // Cached procedural PAELEO paper-grain & brushed-metal textures (100% sync)
  // ---------------------------------------------------------------------------
  var _grainCanvas = null;
  function getGrainCanvas() {
    if (_grainCanvas) return _grainCanvas;
    if (typeof document === "undefined") return null;
    var c = document.createElement("canvas");
    c.width = 160;
    c.height = 160;
    var g = c.getContext("2d");
    var img = g.createImageData(160, 160);
    var d = img.data;
    for (var i = 0; i < 160 * 160; i++) {
      var r = hash1(i * 1.13);
      var v = r > 0.5 ? 255 : 15;
      var a = Math.floor(Math.abs(r - 0.5) * 28);
      d[i * 4 + 0] = v;
      d[i * 4 + 1] = v - 5;
      d[i * 4 + 2] = v - 12;
      d[i * 4 + 3] = a;
    }
    g.putImageData(img, 0, 0);
    _grainCanvas = c;
    return c;
  }

  function roundedRectPath(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  // ---------------------------------------------------------------------------
  // Shared Articulated Character Rigs (Handmade PAELEO Vector/Cutout)
  // ---------------------------------------------------------------------------

  // Articulated Spotted Brook/River Trout Rig
  // Supports spine wave, hinged lower jaw, expressive eye/brow, pointing/pushing pectoral fins!
  function drawSpottedTrout(ctx, opts) {
    var x = opts.x || 0;
    var y = opts.y || 0;
    var scale = opts.scale || 1;
    var flip = opts.flip ? -1 : 1; // default faces LEFT (-X); flip=true faces RIGHT (+X)
    var rot = opts.rot || 0;
    var t = opts.t || 0;
    var swimSpeed = opts.swimSpeed != null ? opts.swimSpeed : 5.5;
    var swimAmp = opts.swimAmp != null ? opts.swimAmp : 5.5;
    var jawOpen = clamp(opts.jawOpen || 0, 0, 0.7);
    var finPoint = opts.finPoint || 0; // -1..+1 raises front pectoral fin to gesture/push/salute
    var browMood = opts.browMood || 0; // -1 surprised, 0 neutral, +1 stern/determined
    var tint = opts.tint || "brook";
    var deputyCap = !!opts.deputyCap;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(flip * scale, scale);

    var wPhase = t * swimSpeed + (opts.seed || 0);
    var wag1 = Math.sin(wPhase) * swimAmp * 0.35;
    var wag2 = Math.sin(wPhase - 0.9) * swimAmp * 0.75;
    var wag3 = Math.sin(wPhase - 1.7) * swimAmp * 1.25;

    // Dorsal fin (articulated ripple)
    ctx.save();
    ctx.fillStyle = tint === "choir" ? "#6d8f72" : "#5c7f63";
    ctx.strokeStyle = "#181d18";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-6, -23 + wag1 * 0.2);
    ctx.quadraticCurveTo(10, -42 + wag1 * 0.5, 28, -36 + wag2 * 0.4);
    ctx.quadraticCurveTo(31, -26 + wag2 * 0.3, 24, -19 + wag1 * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Dorsal fin rays & spots
    ctx.strokeStyle = "rgba(24,29,24,0.45)";
    ctx.lineWidth = 1;
    for (var dr = 0; dr < 4; dr++) {
      var dx = 2 + dr * 6;
      ctx.beginPath();
      ctx.moveTo(dx, -21 + wag1 * 0.2);
      ctx.lineTo(dx + 4, -34 + wag1 * 0.4);
      ctx.stroke();
    }
    ctx.restore();

    // Adipose fin near tail
    ctx.save();
    ctx.fillStyle = "#6c8c6e";
    ctx.strokeStyle = "#181d18";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(46, -13 + wag2 * 0.5);
    ctx.quadraticCurveTo(54, -22 + wag2 * 0.7, 58, -12 + wag2 * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Caudal (Tail) Fin — flexing with wag3
    ctx.save();
    ctx.translate(68, wag2 * 0.7);
    ctx.rotate(wag3 * 0.022);
    var tailGrad = ctx.createLinearGradient(0, -24, 28, 24);
    tailGrad.addColorStop(0, "#56785e");
    tailGrad.addColorStop(0.5, "#7e9a76");
    tailGrad.addColorStop(1, "#b97c5b");
    ctx.fillStyle = tailGrad;
    ctx.strokeStyle = "#181d18";
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(-4, -5);
    ctx.quadraticCurveTo(16, -22, 29, -25);
    ctx.quadraticCurveTo(22, -6, 17, 0);
    ctx.quadraticCurveTo(23, 8, 28, 24);
    ctx.quadraticCurveTo(14, 20, -4, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Tail fin rays
    ctx.strokeStyle = "rgba(24,29,24,0.4)";
    ctx.lineWidth = 1;
    for (var tr = -3; tr <= 3; tr++) {
      ctx.beginPath();
      ctx.moveTo(0, tr * 1.2);
      ctx.lineTo(22, tr * 6.5);
      ctx.stroke();
    }
    ctx.restore();

    // Pelvic & Anal lower fins (brook trout white/black/rose trim)
    function drawTrimFin(fx, fy, fw, fh, ang) {
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(ang);
      ctx.fillStyle = "#cc7b63";
      ctx.strokeStyle = "#181d18";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-fw * 0.3, fh * 0.9, fw * 0.5, fh);
      ctx.quadraticCurveTo(fw, fh * 0.5, fw * 0.65, 0);
      ctx.closePath();
      ctx.fill();
      // White leading edge characteristic of Brook Trout
      ctx.strokeStyle = "#f4f1e6";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.quadraticCurveTo(-fw * 0.22, fh * 0.78, fw * 0.35, fh * 0.92);
      ctx.stroke();
      ctx.strokeStyle = "#181d18";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
    drawTrimFin(14, 18 + wag1 * 0.3, 18, 15, Math.sin(wPhase + 0.6) * 0.14);
    drawTrimFin(42, 12 + wag2 * 0.5, 16, 13, Math.sin(wPhase + 1.2) * 0.16);

    // Main Torso & Upper Head (segmented spine curve)
    var bodyGrad = ctx.createLinearGradient(0, -26, 0, 24);
    bodyGrad.addColorStop(0, "#3b5e49");
    bodyGrad.addColorStop(0.42, "#6e9273");
    bodyGrad.addColorStop(0.68, "#c9b88c");
    bodyGrad.addColorStop(1, "#e7cfa6");
    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = "#171c18";
    ctx.lineWidth = 2.1;

    ctx.beginPath();
    // Snout tip (-62, -2) -> forehead -> dorsal arch -> peduncle -> belly -> throat
    ctx.moveTo(-62, -2);
    ctx.quadraticCurveTo(-48, -18, -18, -24 + wag1 * 0.15);
    ctx.quadraticCurveTo(18, -26 + wag1 * 0.3, 46, -13 + wag2 * 0.5);
    ctx.lineTo(70, -5 + wag2 * 0.7);
    ctx.lineTo(70, 6 + wag2 * 0.7);
    ctx.quadraticCurveTo(44, 15 + wag2 * 0.5, 14, 21 + wag1 * 0.3);
    ctx.quadraticCurveTo(-18, 24 + wag1 * 0.1, -40, 14);
    // Mouth cleft cutout for hinged jaw
    ctx.lineTo(-42, 4);
    ctx.lineTo(-60, 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rose lateral flush stripe
    ctx.save();
    ctx.fillStyle = "rgba(208, 106, 86, 0.26)";
    ctx.beginPath();
    ctx.ellipse(-2, 1 + wag1 * 0.2, 52, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Articulated Hinged Lower Jaw
    ctx.save();
    ctx.translate(-39, 5);
    ctx.rotate(-jawOpen); // rotates downward when opening mouth (facing left)
    ctx.fillStyle = "#d9be94";
    ctx.strokeStyle = "#171c18";
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(2, -1);
    ctx.lineTo(-21, -2);
    ctx.quadraticCurveTo(-18, 6, -1, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Pink inner mouth tongue hint when open
    if (jawOpen > 0.08) {
      ctx.fillStyle = "#b5564c";
      ctx.beginPath();
      ctx.moveTo(0, -1);
      ctx.lineTo(-16, -2);
      ctx.lineTo(-8, -2 - jawOpen * 9);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Brook Trout Vermiculations & Spots (olive worm marks + crimson haloed spots)
    var spots = [
      [-18, -11, 2.2, 0], [-8, -14, 2.0, 0], [4, -13, 2.3, 0], [16, -11, 2.1, 0], [28, -9, 1.9, 0],
      [-22, -2, 2.3, 1], [-9, 1, 2.5, 1], [3, -2, 2.4, 1], [15, 2, 2.3, 1], [27, -1, 2.1, 1], [39, 1, 1.9, 1],
      [-14, 8, 2.0, 0], [0, 9, 2.1, 1], [12, 8, 1.9, 0], [24, 6, 1.8, 0], [48, -2, 1.8, 0], [56, 1, 1.6, 0]
    ];
    for (var si = 0; si < spots.length; si++) {
      var sp = spots[si];
      var sy = sp[1] + (sp[0] > 15 ? wag2 * 0.35 : wag1 * 0.2);
      if (sp[3] === 1) {
        // Pale blue halo + crimson spot
        ctx.fillStyle = "rgba(176, 222, 224, 0.65)";
        ctx.beginPath();
        ctx.arc(sp[0], sy, sp[2] + 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#c84632";
        ctx.beginPath();
        ctx.arc(sp[0], sy, sp[2] * 0.78, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "#233629";
        ctx.beginPath();
        ctx.arc(sp[0], sy, sp[2] * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Gill Operculum Curve
    ctx.strokeStyle = "#171c18";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(-28, -1, 14, -1.05, 1.15);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,245,220,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-29.5, -1, 13.5, -0.9, 1.0);
    ctx.stroke();

    // Articulated Pectoral Fin (can gesture, point, push shopping cart, or salute!)
    ctx.save();
    ctx.translate(-22, 11);
    var baseFinAng = 0.25 + Math.sin(wPhase + 0.3) * 0.14 - finPoint * 1.45;
    ctx.rotate(baseFinAng);
    ctx.fillStyle = "#d47d62";
    ctx.strokeStyle = "#171c18";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(10, 18, 24, 14);
    ctx.quadraticCurveTo(22, 3, 6, -3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#f7f3e8";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.quadraticCurveTo(9, 15, 20, 13);
    ctx.stroke();
    ctx.strokeStyle = "#171c18";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    // Expressive Eye + Pupil + Brow
    var ex = -44, ey = -7;
    ctx.fillStyle = "#f2dca0";
    ctx.strokeStyle = "#171c18";
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(ex, ey, 5.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    var lookX = clamp(opts.lookX || -1.2, -2.2, 2.2);
    var lookY = clamp(opts.lookY || 0, -2.0, 2.0);
    ctx.fillStyle = "#111615";
    ctx.beginPath();
    ctx.arc(ex + lookX, ey + lookY, 3.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ex + lookX - 1.1, ey + lookY - 1.2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Expressive brow ridge
    if (Math.abs(browMood) > 0.05) {
      ctx.strokeStyle = "#171c18";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      if (browMood > 0) {
        // Determined / stern detective or annoyed shopper
        ctx.moveTo(ex - 6, ey - 5 - browMood * 2);
        ctx.lineTo(ex + 6, ey - 8 + browMood * 2.5);
      } else {
        // Surprised / curious arch
        ctx.arc(ex, ey - 3, 7.5, -2.4, -0.7);
      }
      ctx.stroke();
    }

    // Optional tiny deputy cap brim (#06 Act 3)
    if (deputyCap) {
      ctx.save();
      ctx.translate(-40, -19);
      ctx.rotate(-0.18);
      ctx.fillStyle = "#2d4b5a";
      ctx.strokeStyle = "#141a1c";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-14, 3);
      ctx.lineTo(12, 3);
      ctx.lineTo(9, -6);
      ctx.quadraticCurveTo(-2, -10, -10, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Visor
      ctx.fillStyle = "#1b282e";
      ctx.beginPath();
      ctx.moveTo(-14, 3);
      ctx.quadraticCurveTo(-23, 5, -20, 7);
      ctx.lineTo(-6, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Gold badge pip on cap
      ctx.fillStyle = "#f2c15a";
      ctx.beginPath();
      ctx.arc(-2, -2, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  // Expressive Turkey Pilot inside the Glass (subtle ghost reflection in Act 2, prominent warm cabin pilot in Act 3!)
  function drawTurkeyInsideGlass(ctx, cx, cy, r, t, viewMode, opts) {
    opts = opts || {};
    var isTroutView = viewMode === "trout";
    var alpha = isTroutView ? 0.88 : 0.34;
    var baseX = isTroutView ? cx - 96 : cx - 114;
    var baseY = isTroutView ? cy + 88 : cy + 112;
    var sc = isTroutView ? 1.12 : 0.88;
    var bob = Math.sin(t * 2.7) * 3.5 - (opts.recoil || 0) * 14;
    var tilt = Math.sin(t * 1.9) * 0.06 + (opts.tilt || 0);
    var giantEye = opts.giantEye || 0; // 0..1 for #08 Act 3 "Giant eye behind glass!"

    ctx.save();
    ctx.globalAlpha = alpha;

    if (giantEye > 0.02) {
      // Special magnified lens effect for #08 Act 3 ("Giant eye behind glass!")
      var gx = lerp(baseX + 18, cx + 62, giantEye);
      var gy = lerp(baseY - 12, cy - 92, giantEye);
      var gs = lerp(1.0, 2.35, giantEye);
      ctx.save();
      ctx.translate(gx, gy);
      ctx.scale(gs, gs);
      // Warm feathered eye socket
      ctx.fillStyle = "#6e3824";
      ctx.strokeStyle = "#1c120d";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Concentric cinnamon feather rings
      ctx.strokeStyle = "#9d5333";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 17, 0, Math.PI * 2);
      ctx.stroke();
      // Amber iris
      ctx.fillStyle = "#f0a93b";
      ctx.beginPath();
      ctx.arc(1, 0, 12.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#1c120d";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Dilating dark pupil tracking Trout
      var blink = Math.abs(Math.sin(t * 1.7)) > 0.985 ? 0.15 : 1;
      ctx.save();
      ctx.scale(1, blink);
      ctx.fillStyle = "#140f0c";
      ctx.beginPath();
      ctx.arc(2.5, -0.5, 6.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff8e6";
      ctx.beginPath();
      ctx.arc(-0.5, -3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();
      ctx.restore();
      return;
    }

    ctx.translate(baseX + (opts.dx || 0), baseY + bob);
    ctx.rotate(tilt);
    ctx.scale(sc, sc);

    // Warm cabin halo behind Turkey when Trout looks in
    if (isTroutView) {
      var halo = ctx.createRadialGradient(0, -10, 8, 0, -10, 82);
      halo.addColorStop(0, "rgba(246, 178, 86, 0.42)");
      halo.addColorStop(1, "rgba(246, 178, 86, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, -10, 82, 0, Math.PI * 2);
      ctx.fill();
    }

    // Barred bronze collar feathers (ruffling on startle)
    for (var fi = -3; fi <= 2; fi++) {
      var fang = fi * 0.24 - 0.3;
      ctx.save();
      ctx.rotate(fang);
      ctx.fillStyle = fi % 2 === 0 ? "#7a4028" : "#9c5735";
      ctx.strokeStyle = "#22140e";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(-6, 36, 14, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Iridescent copper bar on feather tip
      ctx.strokeStyle = "#d9944e";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(-6, 22, 9, -2.4, -0.7);
      ctx.stroke();
      ctx.restore();
    }

    // Neck & Head (slate-blue/russet skin characteristic of wild turkey)
    var neckGrad = ctx.createLinearGradient(-15, -35, 20, 30);
    neckGrad.addColorStop(0, "#7b8d99");
    neckGrad.addColorStop(0.55, "#8f594c");
    neckGrad.addColorStop(1, "#6b3826");
    ctx.fillStyle = neckGrad;
    ctx.strokeStyle = "#20130e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-22, 42);
    ctx.quadraticCurveTo(-24, 2, -16, -24);
    ctx.quadraticCurveTo(-4, -42, 16, -34);
    ctx.quadraticCurveTo(28, -24, 22, -4);
    ctx.quadraticCurveTo(16, 18, 14, 42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red Crimson Wattle under throat (swaying)
    var wattleSwing = Math.sin(t * 4.2) * 0.12;
    ctx.save();
    ctx.translate(18, -2);
    ctx.rotate(wattleSwing);
    ctx.fillStyle = "#c93b2b";
    ctx.strokeStyle = "#20130e";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.quadraticCurveTo(-8, 18, 1, 24);
    ctx.quadraticCurveTo(9, 20, 5, 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Curved Amber Beak (facing right into the porthole)
    ctx.fillStyle = "#dfb05b";
    ctx.strokeStyle = "#20130e";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(19, -20);
    ctx.quadraticCurveTo(38, -17, 42, -9);
    ctx.quadraticCurveTo(30, -7, 19, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Lower beak
    ctx.fillStyle = "#c49445";
    ctx.beginPath();
    ctx.moveTo(18, -10);
    ctx.quadraticCurveTo(31, -8, 36, -5);
    ctx.quadraticCurveTo(26, -3, 17, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red Snood draping over beak base
    ctx.save();
    ctx.translate(23, -22);
    ctx.rotate(wattleSwing * 1.2);
    ctx.fillStyle = "#d84332";
    ctx.strokeStyle = "#20130e";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.quadraticCurveTo(6, 2, 5, 15);
    ctx.quadraticCurveTo(0, 17, -2, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Expressive Amber Turkey Eye
    var blink2 = Math.abs(Math.sin(t * 1.4 + 0.8)) > 0.985 ? 0.15 : 1;
    ctx.save();
    ctx.translate(5, -20);
    ctx.scale(1, blink2);
    ctx.fillStyle = "#f2b249";
    ctx.strokeStyle = "#20130e";
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(0, 0, 6.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#17110e";
    ctx.beginPath();
    ctx.arc(2.0, -0.5, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff9eb";
    ctx.beginPath();
    ctx.arc(0.6, -2.0, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Tiny brass pilot visor / headband detail in Act 3 so Trout reads "deputy / hall monitor / sub pilot"
    if (isTroutView) {
      ctx.strokeStyle = "#d8a24a";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(1, -21, 18, -2.3, -0.6);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // PORTHOLE #06 · Stern — "Sheriff Carp measuring tail against a lure"
  // Turkey: "Roasting-pan fitting or ID check?"
  // Trout:  "Feather-lure suspect or undercover deputy?"
  // Rule:   Detective (Oulipopo): wrong suspect | Tool: lamp
  // ---------------------------------------------------------------------------
  function renderScene06(ctx, cx, cy, r, t, env) {
    var lamp = env.lamp;
    var ballast = env.ballast;
    var isTrout = env.viewMode === "trout";
    var yShift = ballast ? -14 : Math.sin(t * 2.1) * 4;

    // 1. River Depth Background
    var bg = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
    if (isTrout) {
      bg.addColorStop(0, "#1d6b6e");
      bg.addColorStop(0.55, "#174b52");
      bg.addColorStop(1, "#0f2c32");
    } else if (lamp) {
      bg.addColorStop(0, "#2f8680");
      bg.addColorStop(0.6, "#1f5a5c");
      bg.addColorStop(1, "#133638");
    } else {
      bg.addColorStop(0, "#10282c");
      bg.addColorStop(1, "#081619");
    }
    ctx.fillStyle = bg;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    // Caustic sunbeams
    ctx.save();
    ctx.globalAlpha = lamp ? 0.16 : 0.05;
    for (var cb = 0; cb < 4; cb++) {
      var bx = cx - 130 + cb * 82 + Math.sin(t * 0.9 + cb) * 14;
      ctx.fillStyle = "#a8ece0";
      ctx.beginPath();
      ctx.moveTo(bx - 18, cy - r);
      ctx.lineTo(bx + 18, cy - r);
      ctx.lineTo(bx + 54, cy + r);
      ctx.lineTo(bx - 4, cy + r);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Distant Rock Notch (Setup A anchor) & Submerged Wooden Pier Pilings (p06.jpg)
    ctx.save();
    ctx.translate(0, yShift * 0.4);
    // Far limestone ridge with the canonical Rock Notch
    ctx.fillStyle = "#183e42";
    ctx.strokeStyle = "#0d2427";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx - r, cy + 72);
    ctx.lineTo(cx - 60, cy + 54);
    ctx.lineTo(cx - 52, cy + 66); // notch!
    ctx.lineTo(cx - 38, cy + 66);
    ctx.lineTo(cx - 30, cy + 50);
    ctx.lineTo(cx + 80, cy + 62);
    ctx.lineTo(cx + r, cy + 78);
    ctx.lineTo(cx + r, cy + r + 30);
    ctx.lineTo(cx - r, cy + r + 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wooden pier post & cross-brace on left (matching p06.jpg)
    var px = cx - 96, py = cy - 115;
    ctx.fillStyle = "#5c6859";
    ctx.strokeStyle = "#1c241e";
    ctx.lineWidth = 2;
    // Diagonal brace
    ctx.beginPath();
    ctx.moveTo(px - 28, py + 24);
    ctx.lineTo(px + 2, py + 54);
    ctx.lineTo(px + 2, py + 40);
    ctx.lineTo(px - 16, py + 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Vertical piling
    ctx.fillStyle = "#6e7a68";
    ctx.fillRect(px, py, 20, 225);
    ctx.strokeRect(px, py, 20, 225);
    // Wood grain lines
    ctx.strokeStyle = "rgba(28,36,30,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 6, py + 5);
    ctx.lineTo(px + 6, py + 220);
    ctx.moveTo(px + 13, py + 12);
    ctx.lineTo(px + 13, py + 215);
    ctx.stroke();
    // Horizontal cross-timber
    ctx.fillStyle = "#788570";
    ctx.strokeStyle = "#1c241e";
    ctx.lineWidth = 2;
    ctx.fillRect(px - 52, py + 18, 92, 16);
    ctx.strokeRect(px - 52, py + 18, 92, 16);
    // Iron bolt heads
    ctx.fillStyle = "#2d3630";
    ctx.beginPath();
    ctx.arc(px + 10, py + 26, 3.2, 0, Math.PI * 2);
    ctx.arc(px + 28, py + 26, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Riverbed boulders & swaying cattail reeds
    ctx.fillStyle = "#2b5555";
    ctx.strokeStyle = "#13292a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx - 128, cy + 92, 58, 26, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx + 122, cy + 106, 54, 24, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Swaying reeds left & right
    var reedPositions = [-148, -132, -118, 108, 124, 140];
    for (var ri = 0; ri < reedPositions.length; ri++) {
      var rx = cx + reedPositions[ri];
      var sway = Math.sin(t * 1.8 + ri * 0.9) * 10;
      ctx.strokeStyle = "#2a5d4e";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(rx, cy + 125);
      ctx.quadraticCurveTo(rx + sway * 0.5, cy + 45, rx + sway, cy - 18 + (ri % 2) * 24);
      ctx.stroke();
      if (ri === 0 || ri === 2 || ri === 4) {
        // Cattail head
        ctx.fillStyle = "#5a422b";
        ctx.strokeStyle = "#1c1813";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(rx + sway, cy - 12 + (ri % 2) * 24, 4.5, 13, sway * 0.02, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();

    // 2. Turkey inside glass (drawn BEFORE foreground trout in Act 3, or subtle reflection in Act 2)
    var turkeyRecoil = (!isTrout && t >= 2.2 && t <= 3.5) ? Math.sin((t - 2.2) / 1.3 * Math.PI) : 0;
    if (isTrout) {
      drawTurkeyInsideGlass(ctx, cx, cy, r, t, "trout", { tilt: 0.05 });
    }

    // 3. Articulated Rainbow-Feathered Fishing Lure on Monofilament Line
    var lureX = cx - 12 + Math.sin(t * 2.4) * 6;
    var lureY = cy + 66 + Math.cos(t * 1.9) * 5 + yShift * 0.6;
    var lureRot = 0.22 + Math.sin(t * 3.1) * 0.08;

    // Monofilament fishing line from top
    ctx.strokeStyle = "rgba(220, 248, 245, 0.55)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - 44, cy - r);
    ctx.quadraticCurveTo(cx - 46 + Math.sin(t * 2) * 5, cy - 10, lureX - 34, lureY - 12);
    ctx.stroke();

    ctx.save();
    ctx.translate(lureX, lureY);
    ctx.rotate(lureRot);

    // Splayed rainbow tail hackle feathers (key to BOTH Turkey's & Trout's suspicion!)
    var featherCols = ["#e84c38", "#f4a636", "#f2d64b", "#4bc4b5", "#e85d3f", "#3a98b8"];
    for (var lf = 0; lf < featherCols.length; lf++) {
      var lfa = -0.68 + lf * 0.27 + Math.sin(t * 5.2 + lf * 0.7) * 0.09;
      ctx.save();
      ctx.translate(30, 4);
      ctx.rotate(lfa);
      ctx.fillStyle = featherCols[lf];
      ctx.strokeStyle = "#191c18";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(22, -6, 46, -2);
      ctx.quadraticCurveTo(24, 6, 0, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Treble steel hooks
    ctx.strokeStyle = "#cfd8d7";
    ctx.lineWidth = 2.0;
    var hookXs = [-6, 22];
    for (var hi = 0; hi < 2; hi++) {
      var hx = hookXs[hi];
      ctx.beginPath();
      ctx.moveTo(hx, 10);
      ctx.lineTo(hx + 2, 23);
      ctx.arc(hx - 3, 23, 5, 0, Math.PI * 0.85);
      ctx.moveTo(hx + 2, 23);
      ctx.arc(hx + 7, 23, 5, Math.PI, Math.PI * 0.15, true);
      ctx.stroke();
    }

    // Painted minnow lure body
    var lg = ctx.createLinearGradient(0, -12, 0, 12);
    lg.addColorStop(0, "#3ca374");
    lg.addColorStop(0.5, "#f0c948");
    lg.addColorStop(1, "#df5c37");
    ctx.fillStyle = lg;
    ctx.strokeStyle = "#181d1a";
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(-36, -2);
    ctx.quadraticCurveTo(-12, -15, 32, 2);
    ctx.quadraticCurveTo(-8, 15, -36, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Brass eyelet ring & painted lure eye
    ctx.strokeStyle = "#e6c365";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(-38, -2, 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fff8dc";
    ctx.beginPath();
    ctx.arc(-24, -2, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(-24, -2, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Articulated SHERIFF CARP Rig + Wooden 12" Ruler!
    // Choreography:
    // - t=2.1..3.5s (Act 2a): Swings ruler horizontally/diagonally against the bread-tin rim ("Roasting-pan fitting?")
    // - t=3.5..5.6s (Act 2b): Holds ruler vertically right beside lure & squinted eye checks Turkey ("or ID check?")
    // - Act 3 (5.6..10s): Moves slightly up-left so Brook Trout enters foreground; taps Sheriff star badge at t=8.0..9.6s!
    var carpX = cx + (isTrout ? 26 : 38) + Math.sin(t * 1.5) * 5;
    var carpY = cy - (isTrout ? 36 : 16) + Math.cos(t * 1.8) * 4 + yShift * 0.5;
    var carpScale = isTrout ? 0.90 : 1.02;

    var panCheckAmt = (!isTrout && t >= 2.05 && t < 3.55)
      ? Math.sin(clamp((t - 2.05) / 1.5, 0, 1) * Math.PI)
      : 0;
    var badgeShowAmt = (isTrout && t >= 7.7) ? smoothstep(7.7, 8.4, t) : 0;

    ctx.save();
    ctx.translate(carpX, carpY);
    ctx.scale(carpScale, carpScale);

    var cWag = Math.sin(t * 3.8) * 8;

    // Carp Caudal Tail
    ctx.save();
    ctx.translate(106, 4 + cWag * 0.3);
    ctx.rotate(cWag * 0.025);
    ctx.fillStyle = "#8a7e4f";
    ctx.strokeStyle = "#1c1a12";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-8, -14);
    ctx.quadraticCurveTo(22, -42, 40, -44);
    ctx.quadraticCurveTo(24, -8, 18, 0);
    ctx.quadraticCurveTo(26, 12, 38, 42);
    ctx.quadraticCurveTo(18, 36, -8, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Long Carp Dorsal Fin
    ctx.fillStyle = "#8f8352";
    ctx.strokeStyle = "#1c1a12";
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(-12, -52);
    ctx.quadraticCurveTo(20, -92, 38, -84);
    ctx.quadraticCurveTo(64, -56, 88, -32);
    ctx.lineTo(74, -20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Carp Chunky Arched Body
    var carpGrad = ctx.createLinearGradient(0, -64, 0, 58);
    carpGrad.addColorStop(0, "#63643e");
    carpGrad.addColorStop(0.45, "#a89a64");
    carpGrad.addColorStop(0.8, "#cfc089");
    carpGrad.addColorStop(1, "#dfd3a4");
    ctx.fillStyle = carpGrad;
    ctx.strokeStyle = "#1c1a12";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-92, 12);
    ctx.quadraticCurveTo(-86, -24, -48, -46);
    ctx.quadraticCurveTo(6, -72, 62, -38);
    ctx.quadraticCurveTo(92, -20, 108, -8 + cWag * 0.3);
    ctx.lineTo(108, 14 + cWag * 0.3);
    ctx.quadraticCurveTo(78, 30, 38, 44);
    ctx.quadraticCurveTo(-18, 56, -72, 32);
    ctx.quadraticCurveTo(-92, 26, -92, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Overlapping Handmade Carp Scales
    ctx.strokeStyle = "rgba(38, 34, 20, 0.52)";
    ctx.lineWidth = 1.3;
    for (var row = -2; row <= 2; row++) {
      for (var col = -2; col <= 5; col++) {
        var sx = -20 + col * 16 + (row % 2) * 8;
        var sy = -6 + row * 13;
        if (sx * sx / 6800 + sy * sy / 2100 < 0.85) {
          ctx.beginPath();
          ctx.arc(sx, sy, 8.2, -1.2, 1.2);
          ctx.stroke();
        }
      }
    }

    // Carp Gill Plate & Lower Fins
    ctx.strokeStyle = "#1c1a12";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(-42, 4, 29, -1.0, 1.08);
    ctx.stroke();

    // Left (near) Pectoral Fin
    ctx.save();
    ctx.translate(-22, 34);
    ctx.rotate(0.2 + Math.sin(t * 3.1) * 0.14 - badgeShowAmt * 0.9);
    ctx.fillStyle = "#b59d63";
    ctx.strokeStyle = "#1c1a12";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-8, 34, 14, 42);
    ctx.quadraticCurveTo(26, 22, 12, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Carp Detective Eye & Furrowed Brow
    ctx.fillStyle = "#e8ba54";
    ctx.strokeStyle = "#1c1a12";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-58, -4, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#14120d";
    var eyeLookX = panCheckAmt > 0.3 ? -3.5 : -2.2;
    var eyeLookY = panCheckAmt > 0.3 ? 2.5 : 1.8;
    ctx.beginPath();
    ctx.arc(-58 + eyeLookX, -4 + eyeLookY, 4.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff9e6";
    ctx.beginPath();
    ctx.arc(-60, -6, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // Stern detective brow ridge
    ctx.fillStyle = "#6e6942";
    ctx.beginPath();
    ctx.moveTo(-70, -15);
    ctx.quadraticCurveTo(-56, -8, -45, -13);
    ctx.lineTo(-47, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Carp Grumpy Mouth & Drooping Handlebar Mustache / Barbels!
    ctx.fillStyle = "#b59867";
    ctx.beginPath();
    ctx.moveTo(-93, 12);
    ctx.quadraticCurveTo(-76, 6, -64, 16);
    ctx.quadraticCurveTo(-78, 22, -92, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    var mustTwitch = Math.sin(t * 6.5) * 0.06;
    ctx.save();
    ctx.translate(-78, 10);
    ctx.rotate(mustTwitch);
    ctx.fillStyle = "#1f1d18";
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.quadraticCurveTo(-18, -5, -24, 14);
    ctx.quadraticCurveTo(-28, 20, -21, 21);
    ctx.quadraticCurveTo(-15, 18, -16, 11);
    ctx.quadraticCurveTo(-11, 2, 0, 2);
    ctx.quadraticCurveTo(14, 2, 22, 15);
    ctx.quadraticCurveTo(28, 22, 34, 16);
    ctx.quadraticCurveTo(28, 14, 24, 8);
    ctx.quadraticCurveTo(16, -5, 0, -3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 5-Pointed Silver Tin SHERIFF STAR BADGE (glints & pulses during Act 3!)
    ctx.save();
    var bxStar = lerp(18, -18, badgeShowAmt);
    var byStar = lerp(-18, -10, badgeShowAmt);
    ctx.translate(bxStar, byStar);
    ctx.scale(1 + badgeShowAmt * 0.28, 1 + badgeShowAmt * 0.28);
    ctx.rotate(-0.12 + Math.sin(t * 2.2) * 0.04);
    ctx.fillStyle = "#d9e0df";
    ctx.strokeStyle = "#1f2424";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (var sp = 0; sp < 10; sp++) {
      var rad = sp % 2 === 0 ? 19 : 9;
      var ang = -Math.PI / 2 + sp * (Math.PI / 5);
      var px2 = Math.cos(ang) * rad;
      var py2 = Math.sin(ang) * rad;
      if (sp === 0) ctx.moveTo(px2, py2);
      else ctx.lineTo(px2, py2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Ball tips on sheriff star
    for (var sp2 = 0; sp2 < 5; sp2++) {
      var ang2 = -Math.PI / 2 + sp2 * (Math.PI * 2 / 5);
      ctx.fillStyle = "#eef4f2";
      ctx.beginPath();
      ctx.arc(Math.cos(ang2) * 20.5, Math.sin(ang2) * 20.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    if (env.showCaptions) {
      ctx.fillStyle = "#1f2424";
      ctx.font = "bold 5.5px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText("SHERIFF", 0, 2);
    } else {
      // Engraved inner star emblem when captions hidden
      ctx.strokeStyle = "#526060";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Right Pectoral Fin gripping the Yellow Wooden 12-Inch Ruler!
    ctx.save();
    // Default vertical beside lure; in panCheckAmt swings out horizontally to measure Turkey/roasting-pan!
    var rulerX = lerp(-96, -118, panCheckAmt);
    var rulerY = lerp(34, 62, panCheckAmt);
    var rulerAng = lerp(-0.18, -1.28, panCheckAmt) + Math.sin(t * 2.8) * 0.04;
    ctx.translate(rulerX, rulerY);
    ctx.rotate(rulerAng);

    // Wooden ruler body
    var rGrad = ctx.createLinearGradient(-12, -75, 12, 75);
    rGrad.addColorStop(0, "#f2c65e");
    rGrad.addColorStop(1, "#cfa042");
    ctx.fillStyle = rGrad;
    ctx.strokeStyle = "#211b10";
    ctx.lineWidth = 2;
    ctx.fillRect(-11, -78, 22, 156);
    ctx.strokeRect(-11, -78, 22, 156);

    // Crisp inch & quarter-inch tick marks along right edge (pointing at lure / Turkey!)
    ctx.strokeStyle = "#211b10";
    for (var tk = 0; tk <= 24; tk++) {
      var ty = -70 + tk * 5.8;
      var tlen = tk % 4 === 0 ? 9 : (tk % 2 === 0 ? 6 : 3.5);
      ctx.lineWidth = tk % 4 === 0 ? 1.6 : 1.0;
      ctx.beginPath();
      ctx.moveTo(11, ty);
      ctx.lineTo(11 - tlen, ty);
      ctx.stroke();
    }

    // Fin fingers curled around ruler!
    ctx.fillStyle = "#b59d63";
    ctx.strokeStyle = "#1c1a12";
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.ellipse(-6, -8, 12, 18, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red dashed detective measurement sightline from ruler tick to lure tail (Act 2b)
    if (!isTrout && t >= 3.5) {
      var lineAlpha = smoothstep(3.5, 3.9, t) * (0.55 + 0.35 * Math.sin(t * 8));
      ctx.save();
      ctx.strokeStyle = "rgba(255, 224, 120, " + lineAlpha.toFixed(2) + ")";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(12, 18);
      ctx.lineTo(68, 18);
      ctx.moveTo(12, 52);
      ctx.lineTo(95, 52);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    ctx.restore(); // end Carp

    // 5. Act 3 Foreground Brook Trout ("Feather-lure suspect or undercover deputy?")
    if (isTrout) {
      var trEnter = smoothstep(5.6, 6.35, t);
      var saluteAmt = smoothstep(8.0, 8.6, t);
      var tx = lerp(cx + 225, cx + 68, trEnter) + Math.sin(t * 2.2) * 5;
      var ty = cy + 92 + Math.cos(t * 2.5) * 4;
      drawSpottedTrout(ctx, {
        x: tx,
        y: ty,
        scale: 1.02,
        flip: false, // faces LEFT toward lure & Turkey!
        rot: -0.06 + saluteAmt * 0.08,
        t: t,
        jawOpen: 0.12 + 0.1 * Math.sin(t * 5.2),
        finPoint: saluteAmt > 0.3 ? 0.95 : 0.45, // first points at lure/Turkey, then salutes!
        browMood: saluteAmt > 0.3 ? -0.4 : 0.75,
        lookX: -1.8,
        lookY: -0.4,
        deputyCap: true
      });
    } else {
      // Subtle reflection of Turkey looking out in Act 2
      drawTurkeyInsideGlass(ctx, cx, cy, r, t, "turkey", { recoil: turkeyRecoil });
    }

    // Rising bubbles
    for (var bi = 0; bi < 7; bi++) {
      var by = ((cy + 90 - ((t * 36 + bi * 38) % 230)));
      var bx2 = cx - 64 + Math.sin(t * 2.5 + bi) * 9 + (bi % 3) * 8;
      var brad = 2.5 + (bi % 3) * 2.2;
      ctx.strokeStyle = "rgba(218, 250, 246, 0.65)";
      ctx.fillStyle = "rgba(218, 250, 246, 0.18)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(bx2, by, brad, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // ---------------------------------------------------------------------------
  // PORTHOLE #07 · Hatch — "River Choir around sunken Birthday Piñata"
  // Turkey: "Naval contact mine, trap, or party?"
  // Trout:  "Brass birthday kazoo or piñata bat?"
  // Rule:   Sound-Action (SCION 47): pitch shift | Tool: ballast
  // ---------------------------------------------------------------------------
  function renderScene07(ctx, cx, cy, r, t, env) {
    var lamp = env.lamp;
    var ballast = env.ballast;
    var isTrout = env.viewMode === "trout";

    // Unsettled turbulent drift BEFORE ballast engages at 1.0s!
    var chop = ballast ? 0.2 : 1.0;
    var camShakeX = Math.sin(t * 7.5) * 9 * chop;
    var camShakeY = (ballast ? 0 : 22) + Math.cos(t * 6.1) * 8 * chop;

    // SCION 47 Pitch-Shift Party Reveal:
    // From 0..3.4s looks dark/metallic like a horned Naval Contact Mine; at 3.45s pitch shifts UP into colorful Fiesta Piñata!
    var partyAmt = isTrout ? 1.0 : smoothstep(3.35, 3.95, t);

    // 1. River Depth Gradient
    var bg = ctx.createRadialGradient(cx, cy - 30, 20, cx, cy, r * 1.15);
    if (partyAmt > 0.3 || lamp || isTrout) {
      bg.addColorStop(0, isTrout ? "#2f8c8a" : "#3a9890");
      bg.addColorStop(0.65, "#1b595e");
      bg.addColorStop(1, "#0e2d33");
    } else {
      bg.addColorStop(0, "#1c4449");
      bg.addColorStop(1, "#0a1c20");
    }
    ctx.fillStyle = bg;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    ctx.save();
    ctx.translate(camShakeX, camShakeY);

    // Riverbed gravel & anchor boulder (matching p07.jpg)
    ctx.fillStyle = "#18393d";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 155, 205, 58, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flat limestone anchor stone with knotted rope loop
    var rockX = cx + 8, rockY = cy + 148;
    ctx.fillStyle = "#365f5b";
    ctx.strokeStyle = "#122626";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(rockX - 48, rockY + 12);
    ctx.quadraticCurveTo(rockX - 44, rockY - 16, rockX - 4, rockY - 18);
    ctx.quadraticCurveTo(rockX + 46, rockY - 16, rockX + 52, rockY + 10);
    ctx.quadraticCurveTo(rockX + 12, rockY + 24, rockX - 48, rockY + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Piñata / Mine Center Position (nudged into sub bumper at t=8.0..9.4s in Act 3!)
    var bonkPulse = isTrout ? Math.sin(clamp((t - 8.0) / 1.1, 0, 1) * Math.PI) : 0;
    var pinSway = Math.sin(t * 2.1) * (10 + chop * 12) - bonkPulse * 38;
    var pinX = cx + pinSway;
    var pinY = cy + 8 + Math.cos(t * 2.6) * 4 + bonkPulse * 10;

    // Braided Hemp Mooring Rope from Rock to Star Piñata
    ctx.strokeStyle = "#8f7952";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(rockX + 6, rockY - 14);
    ctx.quadraticCurveTo(cx - 10 + pinSway * 0.4, cy + 86, pinX, pinY + 34);
    ctx.stroke();
    ctx.strokeStyle = "#241d12";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Rope knot on rock
    ctx.fillStyle = "#a68d60";
    ctx.beginPath();
    ctx.arc(rockX + 4, rockY - 14, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Concentric Sound-Action Pitch Rings around Choir / Piñata (SCION 47)
    var ringFreq = lerp(1.6, 5.2, partyAmt); // slow low-pitch rings -> fast high-pitch rings!
    for (var sr = 0; sr < 3; sr++) {
      var prog = ((t * ringFreq * 0.35 + sr * 0.33) % 1);
      var rr = 48 + prog * 118;
      ctx.strokeStyle = partyAmt > 0.5
        ? "rgba(255, 232, 150, " + ((1 - prog) * 0.36).toFixed(2) + ")"
        : "rgba(140, 210, 210, " + ((1 - prog) * 0.22).toFixed(2) + ")";
      ctx.lineWidth = partyAmt > 0.5 ? 2.0 : 1.2;
      ctx.beginPath();
      ctx.arc(pinX, pinY, rr, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Central 7-Pointed Spiky Naval Mine <-> Ruffled Star Birthday Piñata!
    ctx.save();
    ctx.translate(pinX, pinY);
    ctx.rotate(pinSway * 0.008);

    // Trailing wet crepe-paper ribbons (unfurl dramatically as partyAmt -> 1!)
    if (partyAmt > 0.08) {
      var ribColors = ["#e35d7a", "#f2c85b", "#5ec9a7", "#9a74c9"];
      var spikeTips = [
        [-58, -14], [58, -14], [-42, 42], [42, 42]
      ];
      for (var rbi = 0; rbi < 4; rbi++) {
        var st = spikeTips[rbi];
        var rLen = 38 * partyAmt;
        ctx.strokeStyle = ribColors[rbi];
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.moveTo(st[0], st[1]);
        ctx.bezierCurveTo(
          st[0] + Math.sin(t * 5 + rbi) * 12, st[1] + rLen * 0.4,
          st[0] - Math.cos(t * 4.5 + rbi) * 14, st[1] + rLen * 0.8,
          st[0] + Math.sin(t * 5.5 + rbi) * 8, st[1] + rLen * 1.15
        );
        ctx.stroke();
      }
    }

    // 7 Spiky Cones around central sphere
    var numSpikes = 7;
    for (var k = 0; k < numSpikes; k++) {
      var ka = -Math.PI / 2 + k * (Math.PI * 2 / numSpikes);
      ctx.save();
      ctx.rotate(ka);
      // In mine state (partyAmt=0): dark gunmetal iron horn with contact pin!
      // In piñata state (partyAmt=1): bright teal/gold paper cone!
      ctx.fillStyle = partyAmt > 0.5 ? "#3a7d8c" : "#2c3d40";
      ctx.strokeStyle = "#151d1f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-16, -24);
      ctx.lineTo(0, -64);
      ctx.lineTo(16, -24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (partyAmt < 0.6) {
        // Naval contact mine detonator cap at tip!
        ctx.fillStyle = "#8c3b2b";
        ctx.beginPath();
        ctx.arc(0, -64, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Core body with horizontal ruffled crepe-paper stripes (when partyAmt rises) or riveted mine casing!
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.clip();

    if (partyAmt < 0.45) {
      // Dark iron naval mine sphere with bolt equator
      var mGrad = ctx.createRadialGradient(-10, -10, 4, 0, 0, 36);
      mGrad.addColorStop(0, "#50686b");
      mGrad.addColorStop(1, "#223133");
      ctx.fillStyle = mGrad;
      ctx.fillRect(-36, -36, 72, 72);
      ctx.strokeStyle = "#131c1e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-36, 0);
      ctx.lineTo(36, 0);
      ctx.stroke();
      for (var mr = -24; mr <= 24; mr += 12) {
        ctx.fillStyle = "#7a9294";
        ctx.beginPath();
        ctx.arc(mr, -5, 2.2, 0, Math.PI * 2);
        ctx.arc(mr, 5, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Festive horizontal ruffled crepe-paper fringes!
      var stripeCols = ["#f2d06b", "#6ac49a", "#d97593", "#64a8bd", "#e89a58"];
      for (var stIdx = 0; stIdx < 5; stIdx++) {
        var sy0 = -35 + stIdx * 14;
        ctx.fillStyle = stripeCols[stIdx];
        ctx.fillRect(-38, sy0, 76, 16);
        // Scalloped crepe fringe bottom edge
        ctx.strokeStyle = "#1d2626";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        for (var fx = -36; fx <= 36; fx += 8) {
          ctx.arc(fx + 4, sy0 + 14, 4, 0, Math.PI);
        }
        ctx.stroke();
      }
    }
    ctx.restore();

    ctx.strokeStyle = "#151d1f";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore(); // end piñata

    // 3. Six-Trout River Choir (3 left facing right, 3 right facing left — matching p07.jpg!)
    var choirSlots = [
      { dx: -118, dy: -88, rot: 0.34, flip: true },
      { dx: -138, dy: -8, rot: 0.05, flip: true },
      { dx: -124, dy: 72, rot: -0.24, flip: true },
      { dx: 118, dy: -88, rot: -0.34, flip: false },
      { dx: 138, dy: -8, rot: -0.05, flip: false },
      { dx: 124, dy: 72, rot: 0.24, flip: false }
    ];
    for (var ci = 0; ci < choirSlots.length; ci++) {
      // In Act 3, slot 4 (middle-right trout) swims forward as our lead Brook Trout choirmaster!
      if (isTrout && ci === 4) continue;
      var cs = choirSlots[ci];
      var singOpen = partyAmt > 0.4
        ? 0.26 + 0.22 * Math.abs(Math.sin(t * 7.2 + ci * 0.55))
        : 0.06 + 0.05 * Math.sin(t * 2.5 + ci);
      drawSpottedTrout(ctx, {
        x: cx + cs.dx + Math.sin(t * 2 + ci) * 4,
        y: cy + cs.dy + Math.cos(t * 2.3 + ci) * 4,
        scale: 0.72,
        flip: cs.flip,
        rot: cs.rot,
        t: t,
        seed: ci * 1.1,
        jawOpen: singOpen,
        browMood: partyAmt > 0.4 ? -0.5 : 0.4,
        tint: "choir"
      });
      // Rising harmonic choir bubble triplets from each singing mouth!
      var mouthX = cx + cs.dx + (cs.flip ? 46 : -46);
      var mouthY = cy + cs.dy;
      for (var nb = 0; nb < 2; nb++) {
        var bAge = (t * (1.2 + partyAmt * 1.4) + ci * 0.3 + nb * 0.5) % 1;
        ctx.fillStyle = partyAmt > 0.5 ? "rgba(255, 244, 190, 0.65)" : "rgba(200, 240, 240, 0.4)";
        ctx.beginPath();
        ctx.arc(mouthX + Math.sin(bAge * 8 + ci) * 5, mouthY - bAge * 42, 2.2 + partyAmt * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Turkey inside glass vs Act 3 Choirmaster Brook Trout ("Brass birthday kazoo or piñata bat?")
    if (isTrout) {
      drawTurkeyInsideGlass(ctx, cx, cy, r, t, "trout", { tilt: -0.04 });

      var kazooPhase = (t >= 6.0 && t < 7.8) ? smoothstep(6.0, 6.5, t) * (1 - smoothstep(7.4, 7.9, t)) : 0;
      var batPhase = smoothstep(7.8, 8.3, t);
      var leadX = lerp(cx + 88, cx + 62, kazooPhase) + batPhase * 16;
      var leadY = lerp(cy + 62, cy + 118, kazooPhase) - batPhase * 42;

      // Golden buzzing kazoo sound arcs vibrating off the sub's lower brass lamp-horn!
      if (kazooPhase > 0.1) {
        ctx.save();
        for (var kz = 0; kz < 4; kz++) {
          var kr = 18 + kz * 14 + ((t * 40) % 14);
          ctx.strokeStyle = "rgba(255, 214, 92, " + ((1 - kz * 0.22) * kazooPhase * 0.85).toFixed(2) + ")";
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.arc(cx, cy + 158, kr, -Math.PI * 0.85, -Math.PI * 0.15);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Colorful foil confetti burst when piñata bonks the tin sub at t >= 8.2s!
      if (t >= 8.15) {
        var confAge = clamp((t - 8.15) / 1.7, 0, 1);
        var confCols = ["#f5c84c", "#eb5e7b", "#5be0b6", "#74b9ff", "#ffa94d"];
        for (var cf = 0; cf < 18; cf++) {
          var ca = -Math.PI + (cf / 18) * Math.PI * 2;
          var cd = 22 + confAge * (55 + (cf % 4) * 22);
          var cfx = pinX + Math.cos(ca) * cd;
          var cfy = pinY + Math.sin(ca) * cd + confAge * confAge * 36;
          ctx.save();
          ctx.translate(cfx, cfy);
          ctx.rotate(t * 6 + cf);
          ctx.fillStyle = confCols[cf % confCols.length];
          ctx.fillRect(-4, -2.5, 8, 5);
          ctx.restore();
        }
      }

      drawSpottedTrout(ctx, {
        x: leadX,
        y: leadY,
        scale: 1.04,
        flip: false,
        rot: kazooPhase * -0.25 + batPhase * 0.12,
        t: t,
        jawOpen: kazooPhase > 0.2 ? 0.45 + 0.15 * Math.sin(t * 28) : 0.22,
        finPoint: batPhase * 0.85,
        browMood: -0.5,
        lookX: -1.6,
        lookY: kazooPhase > 0.2 ? 1.2 : 0
      });
    } else {
      var mineRecoil = (t >= 2.1 && t < 3.4) ? Math.sin((t - 2.1) / 1.3 * Math.PI) * 0.8 : 0;
      drawTurkeyInsideGlass(ctx, cx, cy, r, t, "turkey", { recoil: mineRecoil });
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // PORTHOLE #08 · Gauge — "Snail inside glass crawling on Creek Map"
  // Turkey: "Circling X or eating our map?"
  // Trout:  "Giant eye behind glass or aquarium pebble?"
  // Rule:   Occlusion (SCION 45): giant snail | Tool: lamp
  // ---------------------------------------------------------------------------
  function renderScene08(ctx, cx, cy, r, t, env) {
    var lamp = env.lamp;
    var ballast = env.ballast;
    var isTrout = env.viewMode === "trout";

    // 1. Far Creek Water visible past the torn upper-right parchment edge (matching p08.jpg!)
    var wGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    wGrad.addColorStop(0, lamp || isTrout ? "#2e8b82" : "#112c2e");
    wGrad.addColorStop(1, lamp || isTrout ? "#164d4e" : "#09191b");
    ctx.fillStyle = wGrad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    // Drifting plankton specks & current streaks in the open water corner
    ctx.fillStyle = "rgba(225, 252, 245, 0.55)";
    for (var pk = 0; pk < 18; pk++) {
      var px = cx - 140 + ((pk * 67 + t * 22) % 320);
      var py = cy - 150 + ((pk * 53 + Math.sin(t + pk) * 10) % 300);
      ctx.beginPath();
      ctx.arc(px, py, 1.4 + (pk % 2), 0, Math.PI * 2);
      ctx.fill();
    }

    // In Act 3, Turkey's Giant Magnified Eye OR Brook Trout appears in the upper-right open water gap!
    var eyePhase = isTrout ? smoothstep(5.7, 6.3, t) * (1 - smoothstep(7.5, 8.1, t)) : 0;
    var pebblePhase = isTrout ? smoothstep(7.7, 8.4, t) : 0;

    if (isTrout) {
      if (eyePhase > 0.05) {
        drawTurkeyInsideGlass(ctx, cx, cy, r, t, "trout", { giantEye: eyePhase });
      } else {
        drawTurkeyInsideGlass(ctx, cx, cy, r, t, "trout", { dx: -16, tilt: 0.08 });
      }
    }

    // 2. Wet Translucent Parchment Creek Map pressed against glass (SCION 45 Occlusion)
    ctx.save();
    var flapWave = Math.sin(t * 2.6) * (ballast ? 2.5 : 6.5);

    // Parchment polygon (diagonal torn edge from top-center to lower-right, leaving upper-right water open!)
    ctx.beginPath();
    ctx.moveTo(cx - 148, cy - 58);
    ctx.lineTo(cx - 115, cy - 128);
    ctx.lineTo(cx - 28, cy - 156);
    ctx.lineTo(cx + 12, cy - 132 + flapWave * 0.4);
    ctx.lineTo(cx + 38, cy - 62);
    ctx.lineTo(cx + 18, cy - 34); // V-tear notch
    ctx.lineTo(cx + 52, cy - 18);
    ctx.lineTo(cx + 96, cy + 32);
    ctx.lineTo(cx + 108, cy + 50);
    ctx.lineTo(cx + 165, cy + 68);
    ctx.lineTo(cx + 132, cy + 158);
    ctx.lineTo(cx + 22, cy + 178);
    ctx.lineTo(cx - 72, cy + 148);
    ctx.lineTo(cx - 128, cy + 52);
    ctx.lineTo(cx - 156, cy - 8);
    ctx.closePath();

    // Warm translucent backlit parchment when lamp ON, murky damp gray-tan when lamp OFF!
    var mapGrad = ctx.createRadialGradient(cx - 20, cy + 20, 15, cx - 10, cy + 10, 195);
    if (lamp || isTrout) {
      mapGrad.addColorStop(0, "rgba(248, 234, 196, 0.94)");
      mapGrad.addColorStop(0.65, "rgba(226, 204, 156, 0.91)");
      mapGrad.addColorStop(1, "rgba(188, 162, 114, 0.88)");
    } else {
      mapGrad.addColorStop(0, "rgba(112, 106, 88, 0.92)");
      mapGrad.addColorStop(1, "rgba(68, 66, 56, 0.92)");
    }
    ctx.fillStyle = mapGrad;
    ctx.shadowColor = "rgba(8, 24, 24, 0.45)";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#2b2316";
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Clip to map to draw inked Little River bend, contour hachures, X, and snail nibbled hole!
    ctx.save();
    ctx.clip();

    // Paper fold creases
    ctx.strokeStyle = "rgba(120, 96, 62, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 160, cy + 12);
    ctx.lineTo(cx + 150, cy - 28);
    ctx.moveTo(cx - 35, cy - 165);
    ctx.lineTo(cx + 15, cy + 185);
    ctx.stroke();

    // Winding Double-Line Inked Creek Channel (matching p08.jpg!)
    ctx.strokeStyle = "#2a2115";
    ctx.fillStyle = lamp || isTrout ? "rgba(245, 239, 220, 0.78)" : "rgba(95, 92, 80, 0.6)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - 140, cy - 105);
    ctx.bezierCurveTo(cx - 70, cy - 135, cx - 42, cy - 55, cx - 88, cy - 18);
    ctx.bezierCurveTo(cx - 132, cy + 16, cx - 92, cy + 82, cx - 36, cy + 78);
    ctx.bezierCurveTo(cx + 12, cy + 74, cx + 22, cy + 128, cx + 35, cy + 182);
    ctx.lineTo(cx + 58, cy + 182);
    ctx.bezierCurveTo(cx + 46, cy + 118, cx + 28, cy + 52, cx - 32, cy + 54);
    ctx.bezierCurveTo(cx - 72, cy + 56, cx - 102, cy + 14, cx - 64, cy - 18);
    ctx.bezierCurveTo(cx - 18, cy - 58, cx - 54, cy - 155, cx - 132, cy - 126);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tributary creek fork
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - 56, cy - 42);
    ctx.quadraticCurveTo(cx - 42, cy - 95, cx - 22, cy - 126);
    ctx.stroke();

    // Hand-brushed Ink "X" Landmark at the Bend!
    var xCx = cx - 44, xCy = cy + 24;
    ctx.strokeStyle = "#241d14";
    ctx.lineWidth = 5.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(xCx - 20, xCy - 10);
    ctx.lineTo(xCx + 20, xCy + 12);
    ctx.moveTo(xCx + 9, xCy - 20);
    ctx.lineTo(xCx - 9, xCy + 22);
    ctx.stroke();

    // Progressive Snail Nibbled Notch near the X (grows during Act 2: "or eating our map?!")
    var nibbleAmt = clamp((t - 3.1) / 2.0, 0, 1);
    if (nibbleAmt > 0.02) {
      ctx.fillStyle = lamp || isTrout ? "#1e635f" : "#0e2426"; // water showing through eaten hole!
      ctx.strokeStyle = "#3a2d1b";
      ctx.lineWidth = 1.6;
      for (var nb2 = 0; nb2 < 3; nb2++) {
        var nr = (3.5 + nb2 * 1.8) * nibbleAmt;
        ctx.beginPath();
        ctx.arc(xCx + 26 + nb2 * 6, xCy - 14 + (nb2 % 2) * 4, nr, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Glistening Iridescent Mucus Trail circling around the X!
    var crawlProg = clamp(t / 5.6, 0, 1);
    ctx.strokeStyle = "rgba(255, 252, 235, 0.58)";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    var trailSteps = Math.max(2, Math.floor(crawlProg * 28));
    for (var ts = 0; ts <= trailSteps; ts++) {
      var u = (ts / 28) * crawlProg;
      var angT = 0.85 - u * 2.55; // curves around X!
      var txp = xCx + 34 + Math.cos(angT) * 48;
      var typ = xCy + 6 + Math.sin(angT) * 42;
      if (ts === 0) ctx.moveTo(txp, typ);
      else ctx.lineTo(txp, typ);
    }
    ctx.stroke();

    ctx.restore(); // unclip map

    // Curled dog-ear flap on upper map edge
    ctx.fillStyle = lamp || isTrout ? "#cbb07c" : "#555042";
    ctx.strokeStyle = "#2b2316";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx - 28, cy - 156);
    ctx.quadraticCurveTo(cx - 8, cy - 122 + flapWave, cx + 12, cy - 132 + flapWave * 0.4);
    ctx.quadraticCurveTo(cx - 6, cy - 148, cx - 28, cy - 156);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 3. Giant Foreground Creek Snail on the Glass!
    // In Act 2: crawls in an arc around the X, waving eye-stalks & rasping map ("Circling X or eating our map?").
    // In Act 3 pebblePhase (t >= 7.7s): retracts head & stalks under smooth golden shell -> "or aquarium pebble?"!
    var sProg = clamp(t / 5.8, 0, 1);
    var sAng = 0.85 - sProg * 2.55;
    var snailX = lerp(xCx + 34 + Math.cos(sAng) * 48, cx + 38, pebblePhase * 0.65);
    var snailY = lerp(xCy + 6 + Math.sin(sAng) * 42, cy + 4, pebblePhase * 0.65);
    var snailRot = lerp(-0.52 + sProg * 0.25, -0.15, pebblePhase);
    var tuck = pebblePhase; // 0 = full extended snail, 1 = tucked pebble!

    ctx.save();
    ctx.translate(snailX, snailY);
    ctx.rotate(snailRot);

    // Muscular foot & optic eye-stalks (retract smoothly as tuck -> 1!)
    if (tuck < 0.96) {
      ctx.save();
      var bodyOut = 1 - tuck * 0.88;
      ctx.scale(bodyOut, 1 - tuck * 0.45);

      // Undulating snail foot against glass (shows pedal waves!)
      var footGrad = ctx.createLinearGradient(-64, 0, 56, 18);
      footGrad.addColorStop(0, "#7a6342");
      footGrad.addColorStop(0.5, "#9c8259");
      footGrad.addColorStop(1, "#6b5537");
      ctx.fillStyle = footGrad;
      ctx.strokeStyle = "#21190f";
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(-58, -4);
      ctx.quadraticCurveTo(-36, -14, 10, -4);
      ctx.quadraticCurveTo(44, 4, 62, 16);
      // Rippling pedal sole wave!
      for (var pw = 56; pw >= -56; pw -= 14) {
        var wy = 16 + Math.sin(t * 7.5 + pw * 0.15) * 2.4;
        ctx.lineTo(pw, wy);
      }
      ctx.quadraticCurveTo(-66, 8, -58, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tiny dark radula mouth nibbling map fiber on underside!
      var chew = Math.abs(Math.sin(t * 9.5));
      ctx.fillStyle = "#2b1d14";
      ctx.beginPath();
      ctx.ellipse(-48, 6, 4.5, 2.5 + chew * 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Two Articulated Long Eye-Stalks + Lower Feelers
      var stalk1Ang = -2.25 + Math.sin(t * 3.1) * 0.22;
      var stalk2Ang = -1.68 + Math.cos(t * 2.7) * 0.20;
      var stalks = [
        { bx: -54, by: -6, len: 30, ang: stalk1Ang },
        { bx: -45, by: -10, len: 32, ang: stalk2Ang }
      ];
      for (var stI = 0; stI < 2; stI++) {
        var sk = stalks[stI];
        var ex2 = sk.bx + Math.cos(sk.ang) * sk.len;
        var ey2 = sk.by + Math.sin(sk.ang) * sk.len;
        ctx.strokeStyle = "#5c482d";
        ctx.lineWidth = 4.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(sk.bx, sk.by);
        ctx.quadraticCurveTo((sk.bx + ex2) * 0.5, sk.by - 10, ex2, ey2);
        ctx.stroke();
        ctx.strokeStyle = "#21190f";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Bulbous eye tip
        ctx.fillStyle = "#21190f";
        ctx.beginPath();
        ctx.arc(ex2, ey2, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f7eed2";
        ctx.beginPath();
        ctx.arc(ex2 - 0.8, ey2 - 0.8, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      // Short lower sensory feelers
      ctx.strokeStyle = "#21190f";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-58, 2);
      ctx.lineTo(-70, 5 + Math.sin(t * 5) * 2);
      ctx.moveTo(-55, 6);
      ctx.lineTo(-66, 12 + Math.cos(t * 5) * 2);
      ctx.stroke();

      ctx.restore();
    }

    // Golden-Amber Logarithmic Spiral Shell (doubles visually as a smooth banded Aquarium Pebble when tucked!)
    var boopJiggle = (isTrout && t >= 8.5) ? Math.sin((t - 8.5) * 18) * Math.exp(-(t - 8.5) * 3.5) * 5 : 0;
    ctx.save();
    ctx.translate(8 + boopJiggle, -22 + tuck * 12);
    var shGrad = ctx.createRadialGradient(-8, -10, 4, 2, 2, 42);
    shGrad.addColorStop(0, "#f5d782");
    shGrad.addColorStop(0.55, "#be8c3c");
    shGrad.addColorStop(1, "#5e4019");
    ctx.fillStyle = shGrad;
    ctx.strokeStyle = "#21180d";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 38, 33, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ribbed growth bands
    ctx.strokeStyle = "rgba(45, 30, 12, 0.42)";
    ctx.lineWidth = 1.2;
    for (var rb = 0; rb < 14; rb++) {
      var ra = rb * 0.45;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ra) * 8, Math.sin(ra) * 7);
      ctx.lineTo(Math.cos(ra) * 35, Math.sin(ra) * 30);
      ctx.stroke();
    }

    // True spiral suture line
    ctx.strokeStyle = "#21180d";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (var spA = 0; spA <= Math.PI * 5.6; spA += 0.18) {
      var spR = 1.6 * Math.exp(0.175 * spA);
      if (spR > 34) break;
      var spX = 6 + Math.cos(spA) * spR;
      var spY = 3 + Math.sin(spA) * spR * 0.88;
      if (spA === 0) ctx.moveTo(spX, spY);
      else ctx.lineTo(spX, spY);
    }
    ctx.stroke();
    // Wet shell specular highlight
    ctx.fillStyle = "rgba(255, 250, 225, 0.36)";
    ctx.beginPath();
    ctx.ellipse(-10, -14, 14, 5, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore(); // end Snail

    // 4. Brook Trout peeking in at upper-right gap (and swimming down to boop the "aquarium pebble" in Act 3!)
    if (isTrout) {
      var boopReach = smoothstep(8.1, 8.65, t) * (1 - smoothstep(9.3, 9.8, t) * 0.3);
      var troutX = lerp(cx + 128, cx + 98, boopReach);
      var troutY = lerp(cy - 30, cy - 10, boopReach);
      drawSpottedTrout(ctx, {
        x: troutX,
        y: troutY,
        scale: 0.90,
        flip: false, // faces LEFT into porthole!
        rot: eyePhase > 0.3 ? 0.24 : lerp(-0.08, -0.28, boopReach),
        t: t,
        jawOpen: eyePhase > 0.3 ? 0.38 : 0.14, // gasps at Giant Eye!
        browMood: eyePhase > 0.3 ? -0.9 : -0.3,
        lookX: -1.8,
        lookY: eyePhase > 0.3 ? -1.4 : (boopReach > 0.3 ? 1.2 : 0.2)
      });
    } else {
      // Subtle peeking trout far outside at t > 4.2s foreshadowing Act 3, plus Turkey reflection inside!
      if (t > 4.0) {
        var peek = smoothstep(4.0, 5.2, t);
        drawSpottedTrout(ctx, {
          x: lerp(cx + 215, cx + 148, peek),
          y: cy - 66,
          scale: 0.78,
          flip: false,
          t: t,
          jawOpen: 0.1
        });
      }
      drawTurkeyInsideGlass(ctx, cx, cy, r, t, "turkey", { tilt: -0.05 });
    }
  }

  // ---------------------------------------------------------------------------
  // PORTHOLE #09 · Port — "Dollar General: Trout pushing wire cart"
  // Turkey: "Supply convoy or ramming cage?"
  // Trout:  "Rude aisle-blocker or returnable bottle?"
  // Rule:   Inversion (SCION 19): creek drag | Tool: ballast
  // ---------------------------------------------------------------------------
  function renderScene09(ctx, cx, cy, r, t, env) {
    var lamp = env.lamp;
    var ballast = env.ballast;
    var isTrout = env.viewMode === "trout";

    // SCION 19 Creek Drag: heavy lateral current buffeting BEFORE ballast engages at 1.0s!
    var dragShake = ballast ? 0.18 : 1.0;
    var dxCam = Math.sin(t * 6.8) * 11 * dragShake;
    var dyCam = (ballast ? 0 : -18) + Math.cos(t * 5.4) * 7 * dragShake;

    // 1. River-over-Parking-Lot Sky/Water Gradient
    var bg = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
    bg.addColorStop(0, lamp || ballast || isTrout ? "#4ca89c" : "#18383a");
    bg.addColorStop(0.55, lamp || ballast || isTrout ? "#246869" : "#10282b");
    bg.addColorStop(1, "#172b2c");
    ctx.fillStyle = bg;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    ctx.save();
    ctx.translate(dxCam, dyCam);

    // 2. Drowned Asphalt Parking Lot with Perspective Double-Yellow Stripes (matching p09.jpg!)
    ctx.fillStyle = "#22383a";
    ctx.beginPath();
    ctx.moveTo(cx - r - 20, cy + 42);
    ctx.lineTo(cx + r + 20, cy + 42);
    ctx.lineTo(cx + r + 20, cy + r + 30);
    ctx.lineTo(cx - r - 20, cy + r + 30);
    ctx.closePath();
    ctx.fill();

    // Perspective Double-Yellow Lane Lines
    var roadScroll = isTrout ? 1.0 : clamp((t - 0.6) / 5.0, 0, 1);
    ctx.fillStyle = "#ccb24c";
    ctx.strokeStyle = "#1a2422";
    ctx.lineWidth = 1.4;
    for (var ln = -1; ln <= 1; ln += 2) {
      ctx.beginPath();
      ctx.moveTo(cx + ln * 10 + 18, cy + 52);
      ctx.lineTo(cx + ln * 16 + 22, cy + 52);
      ctx.lineTo(cx + ln * 24 - 46, cy + r + 15);
      ctx.lineTo(cx + ln * 14 - 54, cy + r + 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // Asphalt cracks
    ctx.strokeStyle = "#101c1d";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(cx - 120, cy + 135);
    ctx.lineTo(cx - 42, cy + 148);
    ctx.lineTo(cx + 12, cy + 138);
    ctx.lineTo(cx + 58, cy + 168);
    ctx.stroke();

    // Backward-streaming SCION 19 Creek Drag Current Ribbons!
    ctx.strokeStyle = "rgba(185, 240, 232, 0.32)";
    ctx.lineWidth = 1.8;
    for (var cr = 0; cr < 6; cr++) {
      var cry = cy - 95 + cr * 34;
      var crx = cx - 150 + ((t * 145 + cr * 73) % 280);
      ctx.beginPath();
      ctx.moveTo(crx, cry);
      ctx.quadraticCurveTo(crx + 28, cry - 4, crx + 56, cry + 2);
      ctx.stroke();
    }

    // Billowing Silt Clouds Left & Right (kicked up by cart wheels in creek drag, matching p09.jpg!)
    function drawSiltPlume(sx, sy, dir, scP) {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(dir * scP, scP);
      ctx.fillStyle = "rgba(212, 205, 180, 0.72)";
      ctx.strokeStyle = "#2b3835";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, 40);
      for (var p = 0; p < 5; p++) {
        var puffX = p * 18 + Math.sin(t * 3 + p) * 4;
        var puffY = 25 - p * 26;
        ctx.arc(puffX, puffY, 18 + (4 - p) * 3, Math.PI * 0.7, -Math.PI * 0.35, false);
      }
      ctx.lineTo(20, 50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    drawSiltPlume(cx - 148, cy + 88, 1, 0.95);
    drawSiltPlume(cx + 138, cy + 72, -1, 0.9);

    // 3. Articulated Wire Shopping Cart + Shopper Trout!
    // In Act 2 (2.0..5.6s): Cart advances from z=0.68 to z=1.04 along the lane ("Supply convoy or ramming cage?")
    // In Act 3 (5.6..10.0s): Halted right at bumper; Shopper Trout rises over handle ("Rude aisle-blocker or returnable bottle?")
    var approach = isTrout ? 1.02 : lerp(0.66, 1.04, smoothstep(1.2, 5.4, t));
    var cartBump = (!isTrout && t > 1.2) ? Math.abs(Math.sin(t * 11)) * 2.5 : 0;
    var cartStopJolt = isTrout ? Math.sin(clamp((t - 5.6) / 0.45, 0, 1) * Math.PI) * 7 : 0;

    var cartX = cx - 14 + cartStopJolt;
    var cartY = cy + 36 - cartBump;

    // Shopper Trout behind/above handle (rises higher in Act 3 to glare & hold up green returnable bottle!)
    var blockerGlare = isTrout ? smoothstep(5.8, 6.4, t) * (1 - smoothstep(7.6, 8.2, t)) : 0;
    var bottleHold = isTrout ? smoothstep(7.8, 8.45, t) : 0;

    ctx.save();
    ctx.translate(cartX, cartY);
    ctx.scale(approach, approach);

    // Shopper Trout pushing hard against creek drag!
    var troutRiseY = isTrout ? lerp(-68, -88, smoothstep(5.7, 6.3, t)) : -68;
    drawSpottedTrout(ctx, {
      x: 52,
      y: troutRiseY,
      scale: 0.96,
      flip: false, // faces LEFT pushing cart!
      rot: isTrout ? -0.06 : -0.22, // pitched down pushing hard in Act 2; upright inspecting sub in Act 3!
      t: t,
      swimSpeed: isTrout ? 4.5 : 9.5, // thrashing tail hard against drag in Act 2!
      swimAmp: isTrout ? 4.5 : 8.0,
      jawOpen: blockerGlare > 0.3 ? 0.36 + 0.12 * Math.sin(t * 10) : 0.14,
      finPoint: blockerGlare > 0.3 ? 0.92 : (bottleHold > 0.3 ? 0.75 : -0.35),
      browMood: blockerGlare > 0.2 ? 1.0 : (bottleHold > 0.3 ? -0.4 : 0.7),
      lookX: -1.8,
      lookY: isTrout ? 0.6 : 0.1
    });

    // Undercarriage Frame & 4 Spinning Caster Wheels (front-left wobbles!)
    var wheelSpin = t * (isTrout ? 0.4 : 11.0);
    ctx.strokeStyle = "#8a7b6a";
    ctx.lineWidth = 4.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(58, -42); // rear upright from handle
    ctx.lineTo(44, 52);
    ctx.lineTo(-48, 66);
    ctx.lineTo(14, 78);
    ctx.lineTo(54, 48);
    ctx.stroke();
    ctx.strokeStyle = "#1c1a17";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    var wheels = [
      { wx: -46, wy: 74, wobble: 1 },
      { wx: 8, wy: 84, wobble: 0 },
      { wx: 22, wy: 58, wobble: 0 },
      { wx: 52, wy: 56, wobble: 0 }
    ];
    for (var wi = 0; wi < wheels.length; wi++) {
      var wh = wheels[wi];
      ctx.save();
      ctx.translate(wh.wx, wh.wy);
      if (wh.wobble && !isTrout) ctx.rotate(Math.sin(t * 16) * 0.22);
      // Caster fork
      ctx.fillStyle = "#6c655c";
      ctx.strokeStyle = "#1a1816";
      ctx.lineWidth = 1.6;
      ctx.fillRect(-4, -9, 8, 9);
      // Wheel tire
      ctx.fillStyle = "#2b3030";
      ctx.beginPath();
      ctx.ellipse(0, 2, 7.5, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Spinning hub spoke!
      ctx.strokeStyle = "#b8b2a6";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(wheelSpin) * 5, 2 + Math.sin(wheelSpin) * 6);
      ctx.lineTo(-Math.cos(wheelSpin) * 5, 2 - Math.sin(wheelSpin) * 6);
      ctx.stroke();
      ctx.restore();
    }

    // Tin Cans & Returnable Glass Bottles rattling inside Basket!
    var cans = [
      { cx: -52, cy: -12, rot: -0.18, col: "#9aa8a4", h: 36 },
      { cx: -28, cy: -18, rot: 0.12, col: "#cfa85b", h: 38 },
      { cx: -6, cy: -10, rot: -0.08, col: "#7c9968", h: 34 },
      { cx: 18, cy: -16, rot: 0.24, col: "#c47d56", h: 36 },
      { cx: 36, cy: -14, rot: -0.15, col: "#4c9c7a", h: 40, bottle: true }
    ];
    for (var cni = 0; cni < cans.length; cni++) {
      var cn = cans[cni];
      // When bottleHold > 0 in Act 3, the green glass bottle lifts up out of the cart to compare with our porthole!
      var liftX = (cn.bottle && bottleHold > 0) ? lerp(0, -86, bottleHold) : 0;
      var liftY = (cn.bottle && bottleHold > 0) ? lerp(0, -52, bottleHold) : 0;
      var jiggle = !isTrout ? Math.sin(t * 14 + cni * 1.7) * 2.2 : 0;

      ctx.save();
      ctx.translate(cn.cx + liftX, cn.cy + liftY + jiggle);
      ctx.rotate(cn.bottle && bottleHold > 0 ? lerp(cn.rot, 0.08, bottleHold) : cn.rot);

      if (cn.bottle) {
        // Green Returnable Glass Soda Bottle!
        ctx.fillStyle = "rgba(76, 178, 132, 0.88)";
        ctx.strokeStyle = "#16261f";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-8, 18);
        ctx.lineTo(-8, -4);
        ctx.quadraticCurveTo(-8, -12, -3.5, -16);
        ctx.lineTo(-3.5, -28);
        ctx.lineTo(3.5, -28);
        ctx.lineTo(3.5, -16);
        ctx.quadraticCurveTo(8, -12, 8, -4);
        ctx.lineTo(8, 18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Bottle glass highlight + white round label echoing porthole!
        ctx.fillStyle = "#f2efe4";
        ctx.beginPath();
        ctx.arc(0, 3, 5.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Gold crown cap
        ctx.fillStyle = "#e6b84c";
        ctx.fillRect(-4.5, -30, 9, 3);
      } else {
        // Ribbed Tin Can
        ctx.fillStyle = cn.col;
        ctx.strokeStyle = "#1d2220";
        ctx.lineWidth = 1.7;
        ctx.fillRect(-11, -cn.h * 0.5, 22, cn.h);
        ctx.strokeRect(-11, -cn.h * 0.5, 22, cn.h);
        // Silver top lid ellipse
        ctx.fillStyle = "#cdd6d3";
        ctx.beginPath();
        ctx.ellipse(0, -cn.h * 0.5, 11, 4.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3D Perspective Wire-Mesh Basket Front & Side Grille ("Supply convoy or ramming cage?")
    // Front grille (left-facing trapezoidal face: (-78,-26) to (-18,-18) top, (-64,26) to (-14,34) bottom)
    // Right side grille ((-18,-18) to (62,-44) top, (-14,34) to (50,12) bottom)
    ctx.strokeStyle = "#221e1a";
    ctx.lineWidth = 4.2;
    // Top rim & push handle
    ctx.beginPath();
    ctx.moveTo(-78, -26);
    ctx.lineTo(-16, -18);
    ctx.lineTo(62, -44);
    ctx.lineTo(74, -48); // push bar!
    ctx.stroke();
    ctx.strokeStyle = "#b59d84";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Basket outer silhouette wires
    ctx.strokeStyle = "#221e1a";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-78, -26);
    ctx.lineTo(-64, 26);
    ctx.lineTo(-14, 34);
    ctx.lineTo(50, 12);
    ctx.lineTo(62, -44);
    ctx.moveTo(-16, -18);
    ctx.lineTo(-14, 34);
    ctx.stroke();

    // Vertical & horizontal steel mesh wires
    ctx.strokeStyle = "rgba(188, 168, 146, 0.88)";
    ctx.lineWidth = 1.6;
    for (var vf = 1; vf <= 5; vf++) {
      var u1 = vf / 6;
      // Front face verticals
      ctx.beginPath();
      ctx.moveTo(lerp(-78, -16, u1), lerp(-26, -18, u1));
      ctx.lineTo(lerp(-64, -14, u1), lerp(26, 34, u1));
      ctx.stroke();
    }
    for (var vs = 1; vs <= 7; vs++) {
      var u2 = vs / 8;
      // Side face verticals
      ctx.beginPath();
      ctx.moveTo(lerp(-16, 62, u2), lerp(-18, -44, u2));
      ctx.lineTo(lerp(-14, 50, u2), lerp(34, 12, u2));
      ctx.stroke();
    }
    for (var hz = 1; hz <= 3; hz++) {
      var uh = hz / 4;
      ctx.beginPath();
      ctx.moveTo(lerp(-78, -64, uh), lerp(-26, 26, uh));
      ctx.lineTo(lerp(-16, -14, uh), lerp(-18, 34, uh));
      ctx.lineTo(lerp(62, 50, uh), lerp(-44, 12, uh));
      ctx.stroke();
    }

    ctx.restore(); // end Cart

    // 4. Turkey inside glass (right-bottom reflection in p09, or warm pilot in Act 3!)
    if (isTrout) {
      drawTurkeyInsideGlass(ctx, cx, cy, r, t, "trout", { dx: -8, tilt: 0.04 });
    } else {
      drawTurkeyInsideGlass(ctx, cx, cy, r, t, "turkey", { dx: 185, recoil: smoothstep(3.6, 5.2, t) * 0.5 });
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // PORTHOLE #10 · PA — "Elementary brick: flapping Clam-Shell PA"
  // Turkey: "Snapping jaw or morning intercom?"
  // Trout:  "New hall monitor or confiscated lunchbox?"
  // Rule:   Single Hinge (SCION 13): jaw pivot | Tool: lamp
  // ---------------------------------------------------------------------------
  function renderScene10(ctx, cx, cy, r, t, env) {
    var lamp = env.lamp;
    var ballast = env.ballast;
    var isTrout = env.viewMode === "trout";
    var yShift = ballast ? -10 : Math.sin(t * 2.0) * 3;

    // 1. Open School-Corridor River Water on Right
    var wGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    wGrad.addColorStop(0, lamp || isTrout ? "#389c91" : "#122b2d");
    wGrad.addColorStop(1, lamp || isTrout ? "#185254" : "#0a181a");
    ctx.fillStyle = wGrad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    ctx.save();
    ctx.translate(0, yShift);

    // 2. Submerged Elementary Red-Brick Corner Wall on Left (matching p10.jpg!)
    var wallRightX = cx + 28;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - r - 10, cy - r - 20);
    ctx.lineTo(wallRightX, cy - r - 20);
    ctx.lineTo(wallRightX, cy + 135);
    ctx.lineTo(cx - r - 10, cy + 165);
    ctx.closePath();
    ctx.fillStyle = lamp || isTrout ? "#584c42" : "#26221e"; // mortar base
    ctx.fill();
    ctx.clip();

    // Isometric brick courses
    for (var brow = -8; brow <= 12; brow++) {
      for (var bcol = -5; bcol <= 4; bcol++) {
        var bx = cx - 95 + bcol * 44 + (brow % 2) * 22;
        var by = cy - 40 + brow * 20 + bcol * 6;
        var bHue = (brow * 7 + bcol * 13) & 3;
        if (lamp || isTrout) {
          ctx.fillStyle = bHue === 0 ? "#9c533c" : (bHue === 1 ? "#8a4834" : (bHue === 2 ? "#7d513e" : "#a85f45"));
        } else {
          ctx.fillStyle = bHue % 2 === 0 ? "#3c2620" : "#32201b";
        }
        ctx.strokeStyle = "#221a16";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + 39, by + 5.5);
        ctx.lineTo(bx + 39, by + 21.5);
        ctx.lineTo(bx, by + 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // Green creek moss patches clinging to brick mortar
    var mossSpots = [
      [cx - 135, cy + 18, 28, 16],
      [cx - 52, cy - 118, 24, 14],
      [cx + 12, cy - 132, 20, 32],
      [cx - 88, cy + 68, 32, 14]
    ];
    ctx.fillStyle = lamp || isTrout ? "rgba(74, 126, 68, 0.78)" : "rgba(34, 58, 34, 0.65)";
    for (var mi = 0; mi < mossSpots.length; mi++) {
      var ms = mossSpots[mi];
      ctx.beginPath();
      ctx.ellipse(ms[0], ms[1], ms[2], ms[3], 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // Vertical brick corner edge line
    ctx.strokeStyle = "#1d1814";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(wallRightX, cy - r - 20);
    ctx.lineTo(wallRightX, cy + 135);
    ctx.stroke();

    // Sunken Schoolbook & Chalkboard Slate on riverbed floor (matching p10.jpg, no text spoiler when showCaptions=false!)
    ctx.fillStyle = "#19383a";
    ctx.fillRect(cx - r, cy + 128, r * 2, 80);

    // Sunken green schoolbook
    ctx.save();
    ctx.translate(cx - 56, cy + 140);
    ctx.rotate(-0.26);
    ctx.fillStyle = "#4d7863";
    ctx.strokeStyle = "#182620";
    ctx.lineWidth = 1.9;
    ctx.fillRect(-34, -22, 68, 48);
    ctx.strokeRect(-34, -22, 68, 48);
    ctx.fillStyle = "#d9d2be";
    ctx.fillRect(-34, 22, 66, 6);
    ctx.strokeRect(-34, 22, 66, 6);
    if (env.showCaptions) {
      ctx.fillStyle = "#182620";
      ctx.font = "bold 7px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText("READER", 0, -2);
    } else {
      ctx.strokeStyle = "#263d33";
      ctx.lineWidth = 1.4;
      ctx.strokeRect(-22, -12, 44, 22);
    }
    ctx.restore();

    // Sunken wooden-framed slate tablet
    ctx.save();
    ctx.translate(cx + 34, cy + 150);
    ctx.rotate(0.22);
    ctx.fillStyle = "#7a6d52";
    ctx.strokeStyle = "#1b1a15";
    ctx.lineWidth = 1.8;
    ctx.fillRect(-30, -18, 60, 38);
    ctx.strokeRect(-30, -18, 60, 38);
    ctx.fillStyle = "#264242";
    ctx.fillRect(-23, -12, 46, 26);
    ctx.restore();

    // 3. SCION 13 SINGLE-HINGE Brass-Mounted Flapping Clam-Shell PA!
    // Choreography:
    // - Act 1 (0..2.0s): Nearly closed (6 deg), waiting in shadow until Lamp clicks ON at 1.0s!
    // - Act 2a (2.0..3.45s): Two aggressive predator jaw SNAPS! (wide 52 deg -> sharp 2 deg chomp! "Snapping jaw?")
    // - Act 2b (3.45..5.6s): Steady rhythmic "BING-BONG! Wah-wah-wah!" morning intercom flapping + concentric sound waves!
    // - Act 3 (5.6..10.0s): Gentle intercom idle + final clack at 8.8s while Student Trout inspect Turkey ("New hall monitor or confiscated lunchbox?")
    var jawHalfAngle = 0.08; // radians per valve
    var emitWaves = 0;
    if (t < 2.0 && !isTrout) {
      jawHalfAngle = 0.07 + 0.02 * Math.sin(t * 2);
    } else if (!isTrout && t < 3.45) {
      // Two dramatic snapping-jaw chomps!
      var snapCycle = ((t - 2.0) / 0.72) % 1;
      jawHalfAngle = snapCycle < 0.65
        ? lerp(0.04, 0.56, Math.sin((snapCycle / 0.65) * Math.PI * 0.5))
        : lerp(0.56, 0.02, (snapCycle - 0.65) / 0.35);
    } else if (!isTrout) {
      // Morning intercom syllabic flapping! ("Morning intercom?")
      jawHalfAngle = 0.16 + 0.24 * Math.abs(Math.sin((t - 3.45) * 9.5));
      emitWaves = smoothstep(3.45, 3.8, t);
    } else {
      // Act 3 gentle chime + lunch-bell clack
      jawHalfAngle = 0.12 + 0.16 * Math.max(0, Math.sin(t * 6.5)) * (t > 8.4 ? 1 : 0.35);
      emitWaves = t > 8.4 ? 0.65 : 0.25;
    }

    var hingeX = cx - 96;
    var hingeY = cy - 10;

    // Concentric Turquoise/White PA Sound-Wave Arcs radiating right from Clam Mouth!
    if (emitWaves > 0.05) {
      ctx.save();
      for (var wa = 0; wa < 5; wa++) {
        var wProg = ((t * 1.85 + wa * 0.2) % 1);
        var wRad = 45 + wProg * 145;
        var wAlpha = (1 - wProg) * 0.62 * emitWaves;
        ctx.strokeStyle = "rgba(215, 252, 244, " + wAlpha.toFixed(2) + ")";
        ctx.lineWidth = 4.5 * (1 - wProg * 0.5);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(hingeX + 46, hingeY, wRad, -0.58, 0.58);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Inner Dark Pearl Cavity & Brass Intercom Megaphone Cone
    ctx.save();
    ctx.translate(hingeX, hingeY);
    ctx.fillStyle = "#1b3334";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 118, -jawHalfAngle * 1.05, jawHalfAngle * 1.05);
    ctx.closePath();
    ctx.fill();

    // Brass PA horn speaker nested inside clam hinge!
    ctx.fillStyle = "#cf9b46";
    ctx.strokeStyle = "#21190c";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(4, -6);
    ctx.lineTo(48, -16);
    ctx.lineTo(48, 16);
    ctx.lineTo(4, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#5c4119";
    ctx.beginPath();
    ctx.ellipse(48, 0, 5, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Helper to draw Upper (+1) or Lower (-1) Fluted White Clam Valve pivoting on (0,0) Single Hinge!
    function drawClamValve(sign) {
      ctx.save();
      ctx.rotate(-sign * jawHalfAngle); // sign=+1 upper rotates up (-ang); sign=-1 lower rotates down (+ang)
      ctx.scale(1, sign);

      var shellGrad = ctx.createLinearGradient(0, -68, 130, 8);
      shellGrad.addColorStop(0, lamp || isTrout ? "#f4f2ea" : "#808684");
      shellGrad.addColorStop(0.55, lamp || isTrout ? "#d5ddd8" : "#5e6866");
      shellGrad.addColorStop(1, lamp || isTrout ? "#9ab0ab" : "#3f4b4a");
      ctx.fillStyle = shellGrad;
      ctx.strokeStyle = "#192221";
      ctx.lineWidth = 2.3;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(28, -56, 86, -62);
      ctx.quadraticCurveTo(128, -60, 146, -34);
      // Wavy scalloped lip!
      ctx.quadraticCurveTo(132, -16, 114, -18);
      ctx.quadraticCurveTo(96, -6, 76, -12);
      ctx.quadraticCurveTo(44, -2, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Radial shell ribs from single hinge!
      ctx.strokeStyle = "rgba(32, 48, 46, 0.45)";
      ctx.lineWidth = 1.4;
      for (var sr2 = 1; sr2 <= 6; sr2++) {
        var u = sr2 / 7;
        ctx.beginPath();
        ctx.moveTo(4, -2);
        ctx.quadraticCurveTo(40 + u * 35, -48 * (1 - u * 0.45), 42 + u * 96, -14 - (1 - u) * 26);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawClamValve(1);  // Upper shell
    drawClamValve(-1); // Lower shell

    // Turned Brass Wall Escutcheon & Single Hinge Pin (SCION 13 anchor!)
    var bGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, 18);
    bGrad.addColorStop(0, "#ffe18c");
    bGrad.addColorStop(0.6, "#c9923b");
    bGrad.addColorStop(1, "#6e4b16");
    ctx.fillStyle = bGrad;
    ctx.strokeStyle = "#1e160a";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(-4, 0, 14, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Hinge pivot pin
    ctx.fillStyle = "#fff1ba";
    ctx.beginPath();
    ctx.arc(2, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore(); // end Clam PA

    // 4. Three Elementary Student Trout!
    // In Act 2: lined up attentively at lower-right listening to the PA (matching p10.jpg!).
    // In Act 3 ("New hall monitor or confiscated lunchbox?"):
    //   - 6.0..7.7s: Lead Brook Trout swims over holding a graphic yellow Hall-Pass Sash/Tag up to Turkey's badge-lit face!
    //   - 7.8..9.8s: Swims right over to the porthole's right-side Brass Dog-Latch, eyeing & tapping our bread-tin hull like a tin Lunchbox!
    if (isTrout) {
      drawTurkeyInsideGlass(ctx, cx, cy, r, t, "trout", { dx: -12, tilt: -0.03 });

      var passPhase = smoothstep(5.8, 6.4, t) * (1 - smoothstep(7.5, 8.1, t));
      var lunchPhase = smoothstep(7.8, 8.4, t);

      // Two classmate trout hovering behind
      drawSpottedTrout(ctx, {
        x: cx + 118, y: cy + 54, scale: 0.68, flip: false, rot: 0.14, t: t, seed: 1.4, jawOpen: 0.14
      });
      drawSpottedTrout(ctx, {
        x: cx + 142, y: cy + 20, scale: 0.62, flip: false, rot: 0.08, t: t, seed: 2.6, jawOpen: 0.10
      });

      var stuX = lerp(cx + 42, cx + 104, lunchPhase);
      var stuY = lerp(cy + 78, cy + 16, lunchPhase);

      drawSpottedTrout(ctx, {
        x: stuX,
        y: stuY,
        scale: 0.96,
        flip: lunchPhase > 0.45, // faces LEFT toward Turkey for Hall Monitor; flips RIGHT to tap the Brass Lunchbox Latch at right rim!
        rot: passPhase * -0.14 + lunchPhase * -0.08,
        t: t,
        jawOpen: lunchPhase > 0.5 ? 0.28 + 0.12 * Math.sin(t * 9) : 0.14,
        finPoint: 0.88,
        browMood: passPhase > 0.3 ? -0.5 : 0.3
      });

      // Graphic Yellow Wooden Hall-Pass Tag held up by fin during passPhase!
      if (passPhase > 0.08) {
        ctx.save();
        ctx.globalAlpha = passPhase;
        ctx.translate(stuX - 42, stuY - 18);
        ctx.rotate(-0.18 + Math.sin(t * 4) * 0.08);
        ctx.fillStyle = "#f2c94c";
        ctx.strokeStyle = "#1f1a0e";
        ctx.lineWidth = 1.8;
        roundedRectPath(ctx, -18, -11, 36, 22, 4);
        ctx.fill();
        ctx.stroke();
        // Lanyard loop & check-star icon (purely graphic when captions off!)
        ctx.beginPath();
        ctx.arc(-12, 0, 2.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#8a5a14";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-4, -3);
        ctx.lineTo(11, -3);
        ctx.moveTo(-4, 4);
        ctx.lineTo(8, 4);
        ctx.stroke();
        ctx.restore();
      }

      // Lunchbox Latch Tap Sparkles & Tin-Handle Silhouette cue at right rim during lunchPhase!
      if (lunchPhase > 0.2) {
        ctx.save();
        ctx.globalAlpha = lunchPhase;
        var tapPulse = Math.abs(Math.sin(t * 8));
        ctx.strokeStyle = "#ffe27a";
        ctx.lineWidth = 2.2;
        for (var spk = 0; spk < 4; spk++) {
          var sa = -0.9 + spk * 0.6;
          ctx.beginPath();
          ctx.moveTo(cx + 162 + Math.cos(sa) * 8, cy + 6 + Math.sin(sa) * 8);
          ctx.lineTo(cx + 162 + Math.cos(sa) * (16 + tapPulse * 8), cy + 6 + Math.sin(sa) * (16 + tapPulse * 8));
          ctx.stroke();
        }
        ctx.restore();
      }
    } else {
      // Act 2: Three attentive school trout lined up on right + Turkey inside bottom-left!
      drawSpottedTrout(ctx, {
        x: cx - 10, y: cy + 98, scale: 0.68, flip: true, rot: -0.62, t: t, seed: 0.5, jawOpen: 0.16
      });
      drawSpottedTrout(ctx, {
        x: cx + 92, y: cy + 90, scale: 0.72, flip: false, rot: 0.42, t: t, seed: 1.5, jawOpen: 0.18
      });
      drawSpottedTrout(ctx, {
        x: cx + 132, y: cy + 48, scale: 0.68, flip: false, rot: 0.22, t: t, seed: 2.5, jawOpen: 0.14
      });
      var snapRecoil = (t >= 2.0 && t < 3.4) ? Math.abs(Math.sin((t - 2.0) * 4.3)) * 0.65 : 0;
      drawTurkeyInsideGlass(ctx, cx, cy, r, t, "turkey", { recoil: snapRecoil });
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Shared Setup A Bread-Tin Cockpit + Articulated Pilot Wing + Story Strip
  // ---------------------------------------------------------------------------
  function drawBreadTinCockpitAndFrame(ctx, W, H, tFilm, rawT, env, sceneMeta, sceneDrawFn) {
    var cx = 640;
    var cy = 255;
    var rGlass = 185;
    var rOuter = 228;
    var cockpitH = 536;

    // 1. Bread-Roll Tin Hull Interior (#132427)
    ctx.fillStyle = "#0e1c1f";
    ctx.fillRect(0, 0, W, cockpitH);

    // Inset oval-cornered bread-roll tin bulkhead
    var tinGrad = ctx.createRadialGradient(cx, cy - 80, 60, cx, cy + 40, 680);
    tinGrad.addColorStop(0, env.lamp ? "#1b3337" : "#15282b");
    tinGrad.addColorStop(0.7, "#122225");
    tinGrad.addColorStop(1, "#0d191c");
    ctx.fillStyle = tinGrad;
    roundedRectPath(ctx, 44, 15, 1192, 504, 56);
    ctx.fill();
    ctx.strokeStyle = "#3f6363";
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Right-Side Bread-Tin Dent (Setup A Invariant!)
    ctx.save();
    ctx.strokeStyle = "#628b8a";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(1224, 212);
    ctx.quadraticCurveTo(1196, 266, 1223, 322);
    ctx.stroke();
    ctx.strokeStyle = "rgba(8, 16, 18, 0.7)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(1218, 218);
    ctx.quadraticCurveTo(1190, 266, 1217, 316);
    ctx.stroke();
    ctx.restore();

    // Overhead Amber Task-Light Bar (Setup A Invariant!)
    ctx.save();
    ctx.strokeStyle = "#916b43";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(135, 36);
    ctx.quadraticCurveTo(cx, 18, 1145, 36);
    ctx.stroke();
    // Central amber practical fixture
    var taskBri = env.lamp ? 1.0 : 0.55;
    var ambCone = ctx.createRadialGradient(cx, 26, 6, cx, 110, 260);
    ambCone.addColorStop(0, "rgba(244, 179, 92, " + (0.28 * taskBri).toFixed(2) + ")");
    ambCone.addColorStop(1, "rgba(244, 179, 92, 0)");
    ctx.fillStyle = ambCone;
    ctx.fillRect(cx - 280, 18, 560, 260);

    ctx.fillStyle = env.lamp ? "#f6ba66" : "#b88344";
    ctx.strokeStyle = "#291c0e";
    ctx.lineWidth = 1.6;
    roundedRectPath(ctx, cx - 44, 18, 88, 13, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Top-Left Station Plaque (shown with text only when showCaptions !== false!)
    ctx.save();
    roundedRectPath(ctx, 74, 54, 286, 84, 10);
    ctx.fillStyle = "rgba(14, 28, 31, 0.65)";
    ctx.fill();
    ctx.strokeStyle = "#355556";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    if (env.showCaptions) {
      ctx.fillStyle = "#e3b06b";
      ctx.font = "600 13px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("STATION " + sceneMeta.station, 92, 80);
      ctx.fillStyle = "#a6c5c2";
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      var fitStr = env.lamp && env.ballast ? "LAMP + BALLAST" : (env.ballast ? "BALLAST MODULE" : (env.lamp ? "LAMP BEAM ON" : "MURKY DUSK"));
      ctx.fillText("FIT: " + fitStr, 92, 102);
      ctx.fillStyle = "#8aa8a5";
      ctx.fillText(sceneMeta.scionRule, 92, 122);
    } else {
      // Non-text brass rivet & schematic wave indicator for blind-critic test!
      ctx.strokeStyle = "#5c8280";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var wx = 0; wx < 180; wx += 6) {
        var wy = 96 + Math.sin(wx * 0.08 + rawT * 2.5) * (env.ballast ? 3 : 8);
        if (wx === 0) ctx.moveTo(104 + wx, wy);
        else ctx.lineTo(104 + wx, wy);
      }
      ctx.stroke();
      ctx.fillStyle = env.lamp ? "#f3b855" : "#446364";
      ctx.beginPath();
      ctx.arc(330, 96, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Top-Right "1 Day of Air" Brass Pressure Gauge (Setup A Invariant!)
    ctx.save();
    var gx = 1094, gy = 118, gr = 56;
    var gRim = ctx.createLinearGradient(gx - gr, gy - gr, gx + gr, gy + gr);
    gRim.addColorStop(0, "#d8af64");
    gRim.addColorStop(0.5, "#9c7434");
    gRim.addColorStop(1, "#5c421b");
    ctx.fillStyle = gRim;
    ctx.strokeStyle = "#18140c";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f7f3e6";
    ctx.beginPath();
    ctx.arc(gx, gy, gr - 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Gauge ticks
    ctx.strokeStyle = "#222624";
    for (var gt = 0; gt <= 10; gt++) {
      var ga = -Math.PI * 0.85 + (gt / 10) * Math.PI * 0.95;
      ctx.lineWidth = gt % 2 === 0 ? 2.0 : 1.2;
      ctx.beginPath();
      ctx.moveTo(gx + Math.cos(ga) * (gr - 16), gy + Math.sin(ga) * (gr - 16));
      ctx.lineTo(gx + Math.cos(ga) * (gr - 9), gy + Math.sin(ga) * (gr - 9));
      ctx.stroke();
    }
    // Red air needle slowly breathing
    var needleAng = -0.92 - (tFilm / 10) * 0.14 + Math.sin(rawT * 3.8) * 0.03;
    ctx.strokeStyle = "#b03a28";
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(gx, gy + 2);
    ctx.lineTo(gx + Math.cos(needleAng) * (gr - 18), gy + Math.sin(needleAng) * (gr - 18));
    ctx.stroke();
    ctx.fillStyle = "#2b251c";
    ctx.beginPath();
    ctx.arc(gx, gy + 2, 4, 0, Math.PI * 2);
    ctx.fill();

    if (env.showCaptions) {
      ctx.fillStyle = "#1f2624";
      ctx.font = "bold 12px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("1 DAY", gx, gy + 22);
      ctx.font = "10.5px ui-monospace, monospace";
      ctx.fillText("OF AIR", gx, gy + 36);
    }
    ctx.restore();

    // 2. INSIDE PORTHOLE GLASS SCENE (Clipped to rGlass = 185 at (640, 255))
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rGlass, 0, Math.PI * 2);
    ctx.clip();

    sceneDrawFn(ctx, cx, cy, rGlass, tFilm, env);

    // Volumetric Underwater Searchlight Cone when Lamp is ON!
    if (env.lamp) {
      ctx.save();
      var coneGrad = ctx.createRadialGradient(cx, cy + 178, 12, cx, cy + 20, 290);
      coneGrad.addColorStop(0, "rgba(255, 224, 138, 0.42)");
      coneGrad.addColorStop(0.45, "rgba(255, 212, 120, 0.14)");
      coneGrad.addColorStop(1, "rgba(255, 212, 120, 0)");
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 28, cy + 185);
      ctx.lineTo(cx - 178, cy - 165);
      ctx.lineTo(cx + 178, cy - 165);
      ctx.lineTo(cx + 28, cy + 185);
      ctx.closePath();
      ctx.fill();

      // Illuminated golden dust motes in beam
      ctx.fillStyle = "rgba(255, 244, 196, 0.55)";
      for (var dm = 0; dm < 12; dm++) {
        var dmx = cx - 95 + ((dm * 37 + Math.sin(rawT * 1.4 + dm) * 18) % 190);
        var dmy = cy + 140 - ((dm * 29 + rawT * 18) % 270);
        ctx.beginPath();
        ctx.arc(dmx, dmy, 1.5 + (dm % 2) * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Murky Dusk Overlay BEFORE control action at t=1.0s (makes t=0.8s vs t=1.8s crystal clear!)
    var controlActive = env.lamp || env.ballast || env.viewMode === "trout";
    if (!controlActive) {
      ctx.fillStyle = "rgba(6, 18, 22, 0.52)";
      ctx.fillRect(cx - rGlass, cy - rGlass, rGlass * 2, rGlass * 2);
    }

    // Lower Brass Hull Lamp Housing Dome inside bottom of porthole
    var domeGrad = ctx.createLinearGradient(cx - 38, cy + 156, cx + 38, cy + 188);
    domeGrad.addColorStop(0, env.lamp ? "#f3c56b" : "#785d31");
    domeGrad.addColorStop(1, "#4d3818");
    ctx.fillStyle = domeGrad;
    ctx.strokeStyle = "#1c1409";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy + 194, 42, Math.PI * 1.08, Math.PI * 1.92);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Optical Cut Ripple at t = 5.6s (Two Views Across Glass transition!)
    if (Math.abs(tFilm - 5.6) < 0.35) {
      var ripU = (tFilm - 5.25) / 0.7;
      ctx.strokeStyle = "rgba(180, 250, 245, " + (Math.sin(ripU * Math.PI) * 0.65).toFixed(2) + ")";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, ripU * rGlass * 1.25, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Subtle PAELEO Paper/Cel Grain & Curved Convex Glass Specular Glints
    var grain = getGrainCanvas();
    if (grain) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      var pat = ctx.createPattern(grain, "repeat");
      if (pat) {
        ctx.fillStyle = pat;
        ctx.fillRect(cx - rGlass, cy - rGlass, rGlass * 2, rGlass * 2);
      }
      ctx.restore();
    }

    // Inner glass rim shadow + upper-left curved glass highlight
    var vig = ctx.createRadialGradient(cx, cy, rGlass - 26, cx, cy, rGlass + 2);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, env.viewMode === "trout" ? "rgba(12, 58, 64, 0.48)" : "rgba(8, 18, 20, 0.52)");
    ctx.fillStyle = vig;
    ctx.beginPath();
    ctx.arc(cx, cy, rGlass, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(240, 252, 250, 0.24)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, rGlass - 12, -2.35, -1.65);
    ctx.stroke();

    ctx.restore(); // end Porthole Glass Clip

    // 3. RIVETED 6-BOLT ANTIQUE BRASS PORTHOLE BEZEL + HINGE + OFFSET LATCH + 2-O'CLOCK CHIP!
    ctx.save();
    // Cast-iron left hinge block
    ctx.fillStyle = "#3a3d3b";
    ctx.strokeStyle = "#141615";
    ctx.lineWidth = 2.2;
    roundedRectPath(ctx, cx - rOuter - 20, cy - 58, 34, 116, 5);
    ctx.fill();
    ctx.stroke();
    // Hinge barrel & slotted screws
    ctx.fillStyle = "#525654";
    roundedRectPath(ctx, cx - rOuter - 25, cy - 62, 13, 124, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#222423";
    ctx.beginPath();
    ctx.arc(cx - rOuter + 2, cy - 38, 4.5, 0, Math.PI * 2);
    ctx.arc(cx - rOuter + 2, cy + 38, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Annular Brass Bezel Ring
    var brassGrad = ctx.createLinearGradient(cx - rOuter, cy - rOuter, cx + rOuter, cy + rOuter);
    brassGrad.addColorStop(0, "#d7b065");
    brassGrad.addColorStop(0.35, "#9e7738");
    brassGrad.addColorStop(0.7, "#bc944b");
    brassGrad.addColorStop(1, "#6b4d20");
    ctx.fillStyle = brassGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
    ctx.arc(cx, cy, rGlass, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    // Inner & outer brass bevel strokes
    ctx.strokeStyle = "#1a140a";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, rGlass, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 232, 170, 0.42)";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(cx, cy, rGlass + 9, 0, Math.PI * 2);
    ctx.stroke();

    // CANONICAL 2-O'CLOCK RIM CHIP! (Setup A Invariant — sharp raw-brass V-notch at -28 deg!)
    var chipAng = -0.49; // ~2 o'clock
    var chX = cx + Math.cos(chipAng) * (rGlass + 3);
    var chY = cy + Math.sin(chipAng) * (rGlass + 3);
    ctx.save();
    ctx.translate(chX, chY);
    ctx.rotate(chipAng);
    ctx.fillStyle = "#13292c"; // bite out of inner brass lip
    ctx.strokeStyle = "#ffd984"; // bright freshly chipped raw brass facet!
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-4, -11);
    ctx.lineTo(13, -3);
    ctx.lineTo(9, 6);
    ctx.lineTo(-4, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Right-Side Offset Brass Dog-Latch (Setup A Invariant!)
    ctx.save();
    ctx.translate(cx + rOuter - 12, cy + 12);
    ctx.fillStyle = "#b58b42";
    ctx.strokeStyle = "#1a140a";
    ctx.lineWidth = 2.1;
    roundedRectPath(ctx, -8, -32, 22, 64, 8);
    ctx.fill();
    ctx.stroke();
    // Swinging dog handle
    ctx.fillStyle = "#cf9f4c";
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.quadraticCurveTo(-4, -12, 28, -9);
    ctx.lineTo(28, 9);
    ctx.quadraticCurveTo(-4, 12, -22, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 6 HEXAGONAL DIE-RING BOLTS (12, 2, 4, 6, 8, 10 o'clock = Faces 1..6!)
    var boltR = (rGlass + rOuter) * 0.5;
    var activeBolt = 0;
    if (env.roll > 0) {
      activeBolt = env.roll;
    } else if (env.viewMode === "trout") {
      if (tFilm >= 5.6 && tFilm < 6.25) {
        activeBolt = (Math.floor((tFilm - 5.6) * 18) % 6) + 1; // rapid 1d6 bolt chase!
      } else {
        activeBolt = sceneMeta.defaultRoll;
      }
    }

    for (var bi = 1; bi <= 6; bi++) {
      var bang = -Math.PI / 2 + (bi - 1) * (Math.PI / 3);
      var bbx = cx + Math.cos(bang) * boltR;
      var bby = cy + Math.sin(bang) * boltR;
      var isLit = bi === activeBolt;

      if (isLit) {
        var tierCol = bi <= 2 ? "#35b8b0" : (bi <= 4 ? "#58c47c" : "#eb7a44");
        ctx.save();
        ctx.fillStyle = tierCol;
        ctx.globalAlpha = 0.42 + 0.2 * Math.sin(rawT * 8);
        ctx.beginPath();
        ctx.arc(bbx, bby, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.translate(bbx, bby);
      ctx.fillStyle = isLit ? "#ffe38e" : "#a8803c";
      ctx.strokeStyle = "#1c150a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (var hx = 0; hx < 6; hx++) {
        var ha = hx * (Math.PI / 3);
        var px = Math.cos(ha) * 12;
        var py = Math.sin(ha) * 12;
        if (hx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glinting 4-point star ray on the rolled 1d6 bolt!
      if (isLit && (env.roll > 0 || tFilm >= 6.2)) {
        ctx.save();
        ctx.rotate(rawT * 1.8);
        ctx.strokeStyle = "#fff9dc";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(-19, 0);
        ctx.lineTo(19, 0);
        ctx.moveTo(0, -19);
        ctx.lineTo(0, 19);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }
    ctx.restore();

    // 4. LOWER COCKPIT INSTRUMENTS: Ballast Slot (Left), Chalk Chart (Center), Lamp Toggle (Right)
    // 4a. Ballast / Single Attachment Slot (Bottom-Left)
    ctx.save();
    var blX = 92, blY = 428, blW = 240, blH = 72;
    roundedRectPath(ctx, blX, blY, blW, blH, 12);
    ctx.fillStyle = "#102124";
    ctx.fill();
    ctx.strokeStyle = env.ballast ? "#7fd8be" : "#89aba7";
    ctx.lineWidth = 1.9;
    ctx.stroke();

    if (env.showCaptions) {
      ctx.fillStyle = "#b5cfcc";
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("BALLAST / SINGLE SLOT", blX + blW * 0.5, blY + 20);
    }

    // Recessed Socket
    ctx.fillStyle = "#1d393c";
    ctx.strokeStyle = "#6c8f8b";
    ctx.lineWidth = 1.5;
    ctx.fillRect(blX + 38, blY + 29, 164, 28);
    ctx.strokeRect(blX + 38, blY + 29, 164, 28);

    // Physical Brass-Handled Lead Ballast Module (slides into socket when ballast is engaged!)
    var balSlide = env.ballast ? 1.0 : (sceneMeta.defaultTool === "ballast" ? smoothstep(0.75, 1.08, tFilm) : 0.0);
    var trayX = lerp(blX - 34, blX + 42, balSlide);
    var trayY = lerp(blY + 38, blY + 31, balSlide);
    ctx.save();
    ctx.globalAlpha = 0.45 + 0.55 * balSlide;
    ctx.fillStyle = "#5f7578";
    ctx.strokeStyle = "#151f21";
    ctx.lineWidth = 1.8;
    roundedRectPath(ctx, trayX, trayY, 156, 24, 4);
    ctx.fill();
    ctx.stroke();
    // Brass pull-handle
    ctx.strokeStyle = "#e0b05c";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(trayX + 54, trayY + 12);
    ctx.lineTo(trayX + 102, trayY + 12);
    ctx.stroke();
    if (balSlide > 0.92) {
      // Green seated lock indicator
      ctx.fillStyle = "#6be0ad";
      ctx.beginPath();
      ctx.arc(blX + 216, blY + 43, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.restore();

    // 4b. Chalk Chart Under Glass (Bottom-Center — progressively draws route + gold landmark dot at t >= 5.6s!)
    ctx.save();
    var chBoxX = 472, chBoxY = 436, chBoxW = 336, chBoxH = 66;
    roundedRectPath(ctx, chBoxX, chBoxY, chBoxW, chBoxH, 12);
    ctx.fillStyle = "#122427";
    ctx.fill();
    ctx.strokeStyle = "#82a6a2";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    if (env.showCaptions) {
      ctx.fillStyle = "#b5cfcc";
      ctx.font = "11.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("CHART UNDER GLASS", chBoxX + chBoxW * 0.5, chBoxY + 18);
    }

    // Chalk polyline route (Setup A canonical zig-zag river bend!)
    var chartPts = [
      [500, 484], [568, 466], [648, 482], [728, 464], [780, 472]
    ];
    var drawFrac = env.viewMode === "trout" ? 1.0 : clamp(0.18 + (tFilm / 5.6) * 0.62, 0.18, 0.82);
    var totalSegs = chartPts.length - 1;
    var segFloat = drawFrac * totalSegs;

    ctx.strokeStyle = "#eef2e6";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(chartPts[0][0], chartPts[0][1]);
    for (var cp = 0; cp < totalSegs; cp++) {
      var segU = clamp(segFloat - cp, 0, 1);
      if (segU <= 0) break;
      ctx.lineTo(
        lerp(chartPts[cp][0], chartPts[cp + 1][0], segU),
        lerp(chartPts[cp][1], chartPts[cp + 1][1], segU)
      );
    }
    ctx.stroke();

    // Gold Landmark Dot & Chalk Circle at t >= 5.6s (or Trout View)!
    if (env.viewMode === "trout" || tFilm >= 5.6) {
      var dotPop = easeOutBack(clamp((tFilm - 5.6) / 0.5, 0.35, 1));
      var markX = 728, markY = 464;
      ctx.fillStyle = "#f2b452";
      ctx.beginPath();
      ctx.arc(markX, markY, 5.8 * dotPop, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(242, 180, 82, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(markX, markY, 11 * dotPop, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Subtle diagonal glass sheen over chart
    ctx.strokeStyle = "rgba(255,255,255,0.09)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(chBoxX + 24, chBoxY + chBoxH - 8);
    ctx.lineTo(chBoxX + 58, chBoxY + 8);
    ctx.stroke();
    ctx.restore();

    // 4c. Brass Lamp Toggle Switch (Bottom-Right)
    ctx.save();
    var tgX = 982, tgY = 420, tgW = 118, tgH = 78;
    roundedRectPath(ctx, tgX, tgY, tgW, tgH, 12);
    ctx.fillStyle = "#192624";
    ctx.fill();
    ctx.strokeStyle = env.lamp ? "#f3b861" : "#9d7b49";
    ctx.lineWidth = 2.0;
    ctx.stroke();

    if (env.showCaptions) {
      ctx.fillStyle = "#d9c5a0";
      ctx.font = "11.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("TOGGLE", tgX + tgW * 0.5, tgY + 19);
    }

    // Brass toggle pivot nut & bat-handle lever
    var pivX = tgX + tgW * 0.5;
    var pivY = tgY + 50;
    var togFrac = env.lamp ? 1.0 : (sceneMeta.defaultTool === "lamp" ? smoothstep(0.88, 1.05, tFilm) : 0.0);
    var leverAng = lerp(0.62, -0.46, togFrac); // DOWN/left when off -> UP/right when ON!

    if (togFrac > 0.8) {
      var spark = ctx.createRadialGradient(pivX, pivY - 12, 2, pivX, pivY - 12, 26);
      spark.addColorStop(0, "rgba(255, 200, 96, 0.45)");
      spark.addColorStop(1, "rgba(255, 200, 96, 0)");
      ctx.fillStyle = spark;
      ctx.beginPath();
      ctx.arc(pivX, pivY - 12, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#d99e4e";
    ctx.strokeStyle = "#1c1409";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(pivX, pivY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(pivX, pivY);
    ctx.rotate(leverAng);
    ctx.fillStyle = "#f4f1e8";
    ctx.strokeStyle = "#1c1409";
    ctx.lineWidth = 1.8;
    roundedRectPath(ctx, -4, -30, 8, 30, 3.5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();

    // 5. ARTICULATED TURKEY PILOT WING OPERATING THE CONTROL IN ACT 1 (0.35s..1.75s)!
    if (tFilm >= 0.30 && tFilm <= 1.82 && (!env.hasExplicitView || env.viewMode === "turkey")) {
      var reachIn = smoothstep(0.30, 0.92, tFilm);
      var retract = smoothstep(1.18, 1.82, tFilm);
      var wingAmt = reachIn * (1 - retract);
      if (wingAmt > 0.01) {
        var targetX = sceneMeta.defaultTool === "lamp" ? 1038 : 218;
        var targetY = sceneMeta.defaultTool === "lamp" ? 458 : 468;
        var startX = 640;
        var startY = 590;
        var tipX = lerp(startX, targetX, easeOutBack(wingAmt));
        var tipY = lerp(startY, targetY, wingAmt);
        var dirSide = sceneMeta.defaultTool === "lamp" ? 1 : -1;

        ctx.save();
        // Forearm wing bone & cinnamon coverts
        ctx.fillStyle = "#6e3924";
        ctx.strokeStyle = "#1b0f0a";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(startX - dirSide * 60, 545);
        ctx.quadraticCurveTo((startX + tipX) * 0.5, 520, tipX, tipY + 12);
        ctx.lineTo(tipX - dirSide * 28, tipY + 34);
        ctx.quadraticCurveTo((startX + tipX) * 0.5 - dirSide * 30, 548, startX - dirSide * 90, 545);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Splayed Barred Primary Flight Feathers at Wingtip flipping the control!
        for (var pf = 0; pf < 5; pf++) {
          ctx.save();
          ctx.translate(tipX - dirSide * pf * 8, tipY + pf * 4);
          ctx.rotate(dirSide * (-0.35 + pf * 0.16));
          ctx.fillStyle = pf % 2 === 0 ? "#8f4d30" : "#b36b43";
          ctx.strokeStyle = "#1b0f0a";
          ctx.lineWidth = 1.7;
          ctx.beginPath();
          ctx.moveTo(-dirSide * 38, 6);
          ctx.quadraticCurveTo(-dirSide * 10, -8, dirSide * 16, -2);
          ctx.quadraticCurveTo(-dirSide * 8, 10, -dirSide * 38, 12);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Cream feather barring
          ctx.strokeStyle = "#e8d2ab";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(-dirSide * 6, -4);
          ctx.lineTo(-dirSide * 4, 6);
          ctx.moveTo(dirSide * 5, -3);
          ctx.lineTo(dirSide * 6, 4);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      }
    }

    // 6. LOWER CREAM EDITORIAL STORY STRIP (y = 536..720, #faf8f3)
    ctx.fillStyle = "#faf8f3";
    ctx.fillRect(0, cockpitH, W, H - cockpitH);
    ctx.strokeStyle = "#d8d1c2";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cockpitH + 0.75);
    ctx.lineTo(W, cockpitH + 0.75);
    ctx.stroke();

    if (env.showCaptions) {
      ctx.save();
      ctx.textAlign = "left";
      if (!env.hasExplicitView && tFilm < 2.0) {
        // Act 1 Editorial Caption
        ctx.fillStyle = "#6c6456";
        ctx.font = "600 14px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillText("SETUP A · BREAD-TIN COCKPIT   (" + sceneMeta.station + ")", 72, 574);

        ctx.fillStyle = "#23201b";
        ctx.font = "bold 36px Georgia, serif";
        ctx.fillText(sceneMeta.clue, 72, 626);

        ctx.fillStyle = "#5c5549";
        ctx.font = "italic 18.5px Georgia, serif";
        var actToolTxt = sceneMeta.defaultTool === "lamp"
          ? "Operate Lamp Toggle (1.0s) to pierce dusk · "
          : "Fit Ballast Module (1.0s) to ride calm shelter · ";
        ctx.fillText(actToolTxt + sceneMeta.scionRule, 72, 696);
      } else if (env.viewMode === "turkey") {
        // Act 2: FIRST PASS · TURKEY LOOKS OUT (rust #9e3d1c)
        ctx.fillStyle = "#9e3d1c";
        ctx.font = "600 14px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillText("FIRST PASS  ·  TURKEY LOOKS OUT   (" + sceneMeta.station + ")", 72, 574);

        ctx.font = "bold 40px Georgia, serif";
        ctx.fillText("“" + sceneMeta.turkeyFork + "”", 72, 628);

        ctx.fillStyle = "#554e43";
        ctx.font = "italic 19px Georgia, serif";
        ctx.fillText("Write odd faces (1 · 3 · 5)  ·  " + sceneMeta.scionRule, 72, 696);
      } else {
        // Act 3: SECOND PASS · TROUT LOOKS IN (teal #1d596e)
        ctx.fillStyle = "#1d596e";
        ctx.font = "600 14px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillText("SECOND PASS  ·  TROUT LOOKS IN   (" + sceneMeta.station + ")", 72, 574);

        ctx.font = "bold 40px Georgia, serif";
        ctx.fillText("“" + sceneMeta.troutFork + "”", 72, 628);

        var shownRoll = env.roll > 0 ? env.roll : sceneMeta.defaultRoll;
        ctx.fillStyle = "#554e43";
        ctx.font = "italic 19px Georgia, serif";
        ctx.fillText("Write even faces (2 · 4 · 6)  ·  Roll 1d6 bolt (#" + shownRoll + ")  ·  Mark chart for Brook", 72, 696);
      }
      ctx.restore();
    } else {
      // PAELEO BLIND-CRITIC INVARIANT: Zero text labels when showCaptions === false!
      // Only a quiet, wordless hairline progress rail so frame timing is tidy without leaking a single letter.
      var barX = 440, barY = 628, barW = 400;
      ctx.strokeStyle = "#ded7c8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(barX, barY);
      ctx.lineTo(barX + barW, barY);
      ctx.stroke();
      var uProg = clamp(tFilm / 10.0, 0, 1);
      ctx.fillStyle = env.viewMode === "trout" ? "#1d596e" : (tFilm >= 2.0 ? "#9e3d1c" : "#7d7465");
      ctx.beginPath();
      ctx.arc(barX + uProg * barW, barY, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---------------------------------------------------------------------------
  // Register Crew 02 Portholes (#06 – #10) on window.PORTAL_SCENES
  // ---------------------------------------------------------------------------
  var CREW_02_DEFS = [
    {
      id: 6,
      station: "#06 · Stern",
      clue: "Sheriff Carp measuring tail against a lure",
      turkeyFork: "Roasting-pan fitting or ID check?",
      troutFork: "Feather-lure suspect or undercover deputy?",
      scionRule: "Detective (Oulipopo): wrong suspect",
      defaultTool: "lamp",
      defaultRoll: 4,
      drawScene: renderScene06
    },
    {
      id: 7,
      station: "#07 · Hatch",
      clue: "River Choir around sunken Birthday Piñata",
      turkeyFork: "Naval contact mine, trap, or party?",
      troutFork: "Brass birthday kazoo or piñata bat?",
      scionRule: "Sound-Action (SCION 47): pitch shift",
      defaultTool: "ballast",
      defaultRoll: 2,
      drawScene: renderScene07
    },
    {
      id: 8,
      station: "#08 · Gauge",
      clue: "Snail inside glass crawling on Creek Map",
      turkeyFork: "Circling X or eating our map?",
      troutFork: "Giant eye behind glass or aquarium pebble?",
      scionRule: "Occlusion (SCION 45): giant snail",
      defaultTool: "lamp",
      defaultRoll: 6,
      drawScene: renderScene08
    },
    {
      id: 9,
      station: "#09 · Port",
      clue: "Dollar General: Trout pushing wire cart",
      turkeyFork: "Supply convoy or ramming cage?",
      troutFork: "Rude aisle-blocker or returnable bottle?",
      scionRule: "Inversion (SCION 19): creek drag",
      defaultTool: "ballast",
      defaultRoll: 2,
      drawScene: renderScene09
    },
    {
      id: 10,
      station: "#10 · PA",
      clue: "Elementary brick: flapping Clam-Shell PA",
      turkeyFork: "Snapping jaw or morning intercom?",
      troutFork: "New hall monitor or confiscated lunchbox?",
      scionRule: "Single Hinge (SCION 13): jaw pivot",
      defaultTool: "lamp",
      defaultRoll: 4,
      drawScene: renderScene10
    }
  ];

  CREW_02_DEFS.forEach(function (meta) {
    window.PORTAL_SCENES[meta.id] = {
      id: meta.id,
      station: meta.station,
      clue: meta.clue,
      turkeyFork: meta.turkeyFork,
      troutFork: meta.troutFork,
      scionRule: meta.scionRule,
      defaultTool: meta.defaultTool,
      render: function (ctx, W, H, t, state) {
        var s = state || {};
        var rawT = Number.isFinite(t) ? Math.max(0, t) : 0;
        var hasExplicitView = s.view === "turkey" || s.view === "trout";
        var tFilm = rawT <= 10.001 ? rawT : (rawT % 10.0);
        if (hasExplicitView) {
          // In interactive player view-lock mode, keep animations smoothly alive inside the chosen act!
          tFilm = s.view === "trout"
            ? 6.0 + (rawT % 3.8)
            : 2.2 + (rawT % 3.2);
        }

        var viewMode = hasExplicitView ? s.view : (tFilm >= 5.6 ? "trout" : "turkey");
        var lamp = typeof s.lamp === "boolean"
          ? s.lamp
          : (meta.defaultTool === "lamp" ? tFilm >= 1.0 : tFilm >= 5.6);
        var ballast = typeof s.ballast === "boolean"
          ? s.ballast
          : (meta.defaultTool === "ballast" ? tFilm >= 1.0 : false);
        var roll = (typeof s.roll === "number" && s.roll >= 1 && s.roll <= 6)
          ? Math.floor(s.roll)
          : 0;
        var showCaptions = s.showCaptions !== false;

        ctx.save();
        if (W !== 1280 || H !== 720) {
          ctx.scale(W / 1280, H / 720);
        }
        drawBreadTinCockpitAndFrame(
          ctx,
          1280,
          720,
          tFilm,
          hasExplicitView ? tFilm : rawT,
          {
            lamp: lamp,
            ballast: ballast,
            viewMode: viewMode,
            hasExplicitView: hasExplicitView,
            roll: roll,
            showCaptions: showCaptions
          },
          meta,
          meta.drawScene
        );
        ctx.restore();
      }
    };
  });
})();
