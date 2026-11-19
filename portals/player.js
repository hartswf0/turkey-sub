/* ============================================================================
 * Turkey Sub · V3 Branching Game (18.0s · 4×3=12 Branches), V2 Remake (16.0s)
 *              & V1 Setup-A Cockpit (13.0s) Unified Runtime
 * File: portals/player.js  (window.__game / window.PORTAL_PLAYER)
 *
 * Defaults to V3 Branching Video Game (window.PORTAL_V3_GAMES[1..55] powered by
 * window.BRANCH_GAME & window.PORTHOLE_BRANCH_TREES), while keeping V2 Linear
 * Cutout Remake (PORTAL_REMAKE_SCENES) and V1 Setup-A Cockpit (PORTAL_V1_SCENES)
 * switchable at any moment via [V]!
 *
 * Full V3 Input & UI Capabilities:
 *   - On-Canvas Clickable ✕ · ○ · △ · □ & Stage-2 Tier Prompts + 12-Dot Slate
 *   - Tactile HTML Controller Deck:
 *       Stage 1: ✕ Cross [1/X] · ○ Circle [2/O] · △ Triangle [3/T] · □ Square [4/S]
 *       Stage 2: Probable [1/Q] · Plausible [2/W] · Preposterous [3/E]
 *       Utility: [R] Roll Fate · [Backspace] Rewind Fork · [A] Auto-Showcase 18s
 *   - HTML5 Gamepad API (navigator.getGamepads() polled in requestAnimationFrame)
 *     for native PlayStation DualSense & Xbox controller play!
 *   - Persistent 12-Branch Discovery Tracker (localStorage, 0..660 across 55
 *     portholes) + Reusable 4×3 Interactive Branching Tree Map (mountControllerDeck).
 *   - Strict PAELEO Blind Invariant: 0 fillText/strokeText calls when
 *     state.showCaptions === false.
 * ============================================================================ */
(function () {
  "use strict";

  var W = 1280;
  var H = 720;
  var V3_LOOP_DUR = 18.0;
  var LOOP_DUR = 16.0;
  var V1_LOOP_DUR = 13.0;
  var SNAIL_TRIP_DUR = 2.6;
  var SNAIL_STORE_KEY = "turkey_sub_snail_mail_v1";

  var COL_REAL = "#14110d";
  var COL_PROBABLE = "#1d596e";     // B · Turkey
  var COL_PLAUSIBLE = "#0f8f80";    // C · Trout
  var COL_PLAUSIBLE_DEEP = "#2d6846";
  var COL_PREPOSTEROUS = "#d42a1e"; // D · Alien
  var COL_PREPOSTEROUS_RUST = "#9e3d1c";

  var BTN_COLORS = {
    x: "#2563eb",
    o: "#d42a1e",
    triangle: "#0f8f80",
    square: "#b45309"
  };
  var BTN_SYMBOLS = {
    x: "\u2715",
    o: "\u25cb",
    triangle: "\u25b3",
    square: "\u25a1"
  };
  var BTN_HOTKEYS = {
    x: "1 / X",
    o: "2 / O",
    triangle: "3 / T",
    square: "4 / S"
  };
  var TIER_HOTKEYS = {
    probable: "1 / Q",
    plausible: "2 / W",
    preposterous: "3 / E"
  };

  var audioCtx = null;
  var ambientNodes = null;
  var hitProbeCanvas = null;
  var hitProbeCtx = null;

  function escHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pad2(n) {
    var v = Math.max(0, Math.floor(Number(n) || 0));
    return v < 10 ? "0" + v : String(v);
  }

  function ensureHitProbeCtx() {
    if (hitProbeCtx) return hitProbeCtx;
    if (typeof document === "undefined") return null;
    try {
      hitProbeCanvas = document.createElement("canvas");
      hitProbeCanvas.width = 16;
      hitProbeCanvas.height = 16;
      hitProbeCtx = hitProbeCanvas.getContext("2d");
      return hitProbeCtx;
    } catch (e) {
      return null;
    }
  }

  function ensureV1Snapshot() {
    if (window.SNAIL_MAIL && typeof window.SNAIL_MAIL.attachAll === "function") {
      window.SNAIL_MAIL.attachAll();
    }
    if (!window.PORTAL_V1_SCENES && window.PORTAL_SCENES) {
      window.PORTAL_V1_SCENES = {};
      Object.keys(window.PORTAL_SCENES).forEach(function (k) {
        window.PORTAL_V1_SCENES[k] = window.PORTAL_SCENES[k];
      });
    }
  }

  function loadAllSnailNotes() {
    try {
      var raw = window.localStorage ? window.localStorage.getItem(SNAIL_STORE_KEY) : null;
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return (parsed && typeof parsed === "object") ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function loadPortalSnailNote(portalId) {
    var map = loadAllSnailNotes();
    var val = map[String(portalId)];
    return typeof val === "string" ? val : "";
  }

  function savePortalSnailNote(portalId, noteText) {
    try {
      if (!window.localStorage) return;
      var map = loadAllSnailNotes();
      var key = String(portalId);
      var clean = typeof noteText === "string" ? noteText.trim().slice(0, 180) : "";
      if (clean) map[key] = clean;
      else delete map[key];
      window.localStorage.setItem(SNAIL_STORE_KEY, JSON.stringify(map));
    } catch (e) {}
  }

  function ensureAudio(muted) {
    if (muted) return null;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(function () {});
      }
      return audioCtx;
    } catch (e) {
      return null;
    }
  }

  function stopAmbient() {
    if (!ambientNodes) return;
    try {
      ambientNodes.gain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.05);
      setTimeout(function () {
        if (ambientNodes) {
          try { ambientNodes.src.stop(); } catch (e) {}
          try { ambientNodes.src.disconnect(); } catch (e) {}
          ambientNodes = null;
        }
      }, 120);
    } catch (e) {
      ambientNodes = null;
    }
  }

  function startAmbient(muted) {
    if (muted) { stopAmbient(); return; }
    var ctx = ensureAudio(muted);
    if (!ctx || ambientNodes) return;
    try {
      var len = ctx.sampleRate * 2;
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var data = buf.getChannelData(0);
      var last = 0;
      for (var i = 0; i < len; i++) {
        var white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 1.6;
      }
      var src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      var lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 250;

      var g = ctx.createGain();
      g.gain.value = 0.0001;
      g.gain.setTargetAtTime(0.024, ctx.currentTime, 0.25);

      src.connect(lp);
      lp.connect(g);
      g.connect(ctx.destination);
      src.start();
      ambientNodes = { src: src, gain: g, filter: lp };
    } catch (e) {}
  }

  function scheduleAlienSaucerFoley(ctx, startAt) {
    var th = ctx.createOscillator();
    var lfo = ctx.createOscillator();
    var lfoG = ctx.createGain();
    var thG = ctx.createGain();
    th.type = "sine";
    th.frequency.setValueAtTime(587.33, startAt);
    th.frequency.exponentialRampToValueAtTime(880.0, startAt + 0.28);
    th.frequency.exponentialRampToValueAtTime(659.25, startAt + 0.68);

    lfo.type = "sine";
    lfo.frequency.setValueAtTime(11.5, startAt);
    lfoG.gain.setValueAtTime(24.0, startAt);
    lfo.connect(lfoG);
    lfoG.connect(th.frequency);

    thG.gain.setValueAtTime(0.001, startAt);
    thG.gain.linearRampToValueAtTime(0.075, startAt + 0.09);
    thG.gain.exponentialRampToValueAtTime(0.0008, startAt + 0.72);
    th.connect(thG);
    thG.connect(ctx.destination);
    th.start(startAt);
    lfo.start(startAt);
    th.stop(startAt + 0.74);
    lfo.stop(startAt + 0.74);

    [1318.5, 1760.0, 1567.98, 2093.0].forEach(function (f, i) {
      var po = ctx.createOscillator();
      var pg = ctx.createGain();
      var t0 = startAt + 0.12 + i * 0.075;
      po.type = "triangle";
      po.frequency.setValueAtTime(f, t0);
      pg.gain.setValueAtTime(0.048, t0);
      pg.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.065);
      po.connect(pg);
      pg.connect(ctx.destination);
      po.start(t0);
      po.stop(t0 + 0.07);
    });
  }

  function playSound(kind, detail, muted) {
    var ctx = ensureAudio(muted);
    if (!ctx) return;
    var now = ctx.currentTime;
    try {
      if (kind === "lamp" || kind === "edition") {
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(detail ? 980 : 1280, now);
        osc.frequency.exponentialRampToValueAtTime(detail ? 1560 : 640, now + 0.06);
        g.gain.setValueAtTime(0.14, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.085);
      } else if (kind === "ballast") {
        var bOsc = ctx.createOscillator();
        var bGain = ctx.createGain();
        bOsc.type = "sine";
        bOsc.frequency.setValueAtTime(detail ? 190 : 250, now);
        bOsc.frequency.exponentialRampToValueAtTime(detail ? 92 : 145, now + 0.14);
        bGain.gain.setValueAtTime(0.20, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        bOsc.connect(bGain);
        bGain.connect(ctx.destination);
        bOsc.start(now);
        bOsc.stop(now + 0.17);
      } else if (kind === "snail") {
        var sLen = Math.floor(ctx.sampleRate * 0.20);
        var sBuf = ctx.createBuffer(1, sLen, ctx.sampleRate);
        var sData = sBuf.getChannelData(0);
        for (var si = 0; si < sLen; si++) {
          var u = si / sLen;
          sData[si] = (Math.random() * 2 - 1) * Math.sin(u * Math.PI) * 0.52;
        }
        var nSrc = ctx.createBufferSource();
        nSrc.buffer = sBuf;
        var bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 2.4;
        bp.frequency.setValueAtTime(920, now);
        bp.frequency.exponentialRampToValueAtTime(2480, now + 0.18);
        var ng = ctx.createGain();
        ng.gain.setValueAtTime(0.16, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
        nSrc.connect(bp);
        bp.connect(ng);
        ng.connect(ctx.destination);
        nSrc.start(now);

        [
          { f: 1046.50, dt: 1.10, a: 0.11, dur: 0.40 },
          { f: 1567.98, dt: 1.15, a: 0.08, dur: 0.38 }
        ].forEach(function (b) {
          var bo = ctx.createOscillator();
          var bg = ctx.createGain();
          var t0 = now + b.dt;
          bo.type = "sine";
          bo.frequency.setValueAtTime(b.f, t0);
          bg.gain.setValueAtTime(b.a, t0);
          bg.gain.exponentialRampToValueAtTime(0.0008, t0 + b.dur);
          bo.connect(bg);
          bg.connect(ctx.destination);
          bo.start(t0);
          bo.stop(t0 + b.dur + 0.02);
        });
        scheduleAlienSaucerFoley(ctx, now + 1.88);
      } else if (kind === "alien") {
        scheduleAlienSaucerFoley(ctx, now);
      } else if (kind === "view") {
        var notes = detail === "real" ? [329.63, 440.0]
          : (detail === "turkey" ? [440.0, 523.25]
          : (detail === "trout" ? [392.0, 587.33] : [392.0, 493.88]));
        notes.forEach(function (freq, idx) {
          var o = ctx.createOscillator();
          var gn = ctx.createGain();
          o.type = "sine";
          var st = now + idx * 0.06;
          o.frequency.setValueAtTime(freq, st);
          gn.gain.setValueAtTime(0.095, st);
          gn.gain.exponentialRampToValueAtTime(0.001, st + 0.24);
          o.connect(gn);
          gn.connect(ctx.destination);
          o.start(st);
          o.stop(st + 0.26);
        });
      } else if (kind === "roll") {
        for (var k = 0; k < 4; k++) {
          var tick = ctx.createOscillator();
          var tg = ctx.createGain();
          var t0 = now + k * 0.042;
          tick.type = "triangle";
          tick.frequency.setValueAtTime(700 + k * 140, t0);
          tg.gain.setValueAtTime(0.075, t0);
          tg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.028);
          tick.connect(tg);
          tg.connect(ctx.destination);
          tick.start(t0);
          tick.stop(t0 + 0.03);
        }
        var face = detail || 1;
        var baseFreq = face <= 2 ? 523.25 : (face <= 4 ? 587.33 : 659.25);
        [baseFreq, baseFreq * 1.5].forEach(function (f, i) {
          var bell = ctx.createOscillator();
          var bg = ctx.createGain();
          var bs = now + 0.18 + i * 0.03;
          bell.type = "sine";
          bell.frequency.setValueAtTime(f, bs);
          bg.gain.setValueAtTime(0.12 / (i + 1), bs);
          bg.gain.exponentialRampToValueAtTime(0.001, bs + 0.45);
          bell.connect(bg);
          bg.connect(ctx.destination);
          bell.start(bs);
          bell.stop(bs + 0.46);
        });
      } else if (kind === "captions") {
        var cOsc = ctx.createOscillator();
        var cg = ctx.createGain();
        cOsc.type = "sine";
        cOsc.frequency.setValueAtTime(detail ? 840 : 620, now);
        cg.gain.setValueAtTime(0.065, now);
        cg.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        cOsc.connect(cg);
        cg.connect(ctx.destination);
        cOsc.start(now);
        cOsc.stop(now + 0.05);
      }
    } catch (e) {}
  }

  function tierForRoll(r) {
    if (!r || r < 1) return null;
    if (r <= 2) return "Probable";
    if (r <= 4) return "Plausible";
    return "Preposterous";
  }

  function tierVoiceForRoll(r) {
    if (!r || r < 1) return "";
    if (r <= 2) return "B · Turkey";
    if (r <= 4) return "C · Trout";
    return "D · Alien";
  }

  function tierColor(r) {
    if (!r || r < 1) return "#6b767c";
    if (r <= 2) return COL_PROBABLE;
    if (r <= 4) return COL_PLAUSIBLE;
    return COL_PREPOSTEROUS;
  }

  function renderFallbackCockpit(ctx, width, height, t, state, meta) {
    ctx.save();
    ctx.fillStyle = "#fbfaf7";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#181d22";
    ctx.fillRect(24, 24, width - 48, 594);
    ctx.strokeStyle = "#b8893a";
    ctx.lineWidth = 10;
    ctx.strokeRect(24, 24, width - 48, 594);
    if (state.showCaptions !== false) {
      ctx.fillStyle = "#14110d";
      ctx.font = "700 24px Georgia, serif";
      ctx.fillText((meta && meta.station ? meta.station + " — " : "") + (meta && meta.clue ? meta.clue : "Multi-SCION Rostrum Stage"), 36, 672);
    }
    ctx.restore();
  }

  /* V3 Bridge Renderer when a pod scene file is still loading:
   * Uses BRANCH_GAME camera, volumetric effects, particles & HUD layered over
   * the blind V2 Multi-SCION cutout plate so all 17 nodes are 100% playable!
   * Emits ZERO fillText/strokeText calls when showCaptions === false!
   */
  function renderV3BridgeScene(ctx, width, height, rawT, machineOrState, portalId, fallbackMeta) {
    var BG = window.BRANCH_GAME;
    if (!BG) {
      renderFallbackCockpit(ctx, width, height, rawT, machineOrState || {}, fallbackMeta);
      return;
    }
    var showCap = !(machineOrState && machineOrState.showCaptions === false);
    var resolved = BG.resolveState(portalId, rawT, machineOrState, { showCaptions: showCap });
    var v2Sc = window.PORTAL_REMAKE_SCENES && window.PORTAL_REMAKE_SCENES[portalId];
    var S = window.SCION_STAGE;

    var mappedV2Time = 1.0 + ((resolved.t || 0) % 2.6);
    if (resolved.phase === "stem" || resolved.phase === "tier_select") {
      var bIdx = BG.BUTTON_ORDER.indexOf(resolved.selectedButton || "x");
      mappedV2Time = 0.8 + bIdx * 0.55 + ((resolved.stemT || 0) % 1.8);
    } else if (resolved.phase === "outcome") {
      var baseBeat = resolved.selectedTier === "probable" ? 4.4
        : (resolved.selectedTier === "plausible" ? 8.4 : 12.4);
      mappedV2Time = baseBeat + ((resolved.outcomeT || 0) % 3.2);
    }

    ctx.save();
    BG.beginCameraRig(ctx, width, height, resolved.camPose, { stageH: resolved.blind ? height : BG.STAGE_H });

    if (v2Sc && typeof v2Sc.render === "function") {
      v2Sc.render(ctx, width, height, mappedV2Time, {
        edition: "v2",
        lamp: resolved.lampOn,
        ballast: resolved.ballastOn,
        view: resolved.phase === "outcome"
          ? (resolved.selectedTier === "probable" ? "turkey" : (resolved.selectedTier === "plausible" ? "trout" : "alien"))
          : "real",
        showCaptions: false,
        snailActive: resolved.snailActive,
        snailT: resolved.snailT,
        snailMail: resolved.snailActive ? resolved.snailT : false
      });
    } else if (S && typeof S.drawBolasBackdrop === "function") {
      S.drawBolasBackdrop(ctx, width, height, resolved.bolasStyle, portalId, resolved.t, { showCaptions: false });
      var plates = S.getPortalPlates ? S.getPortalPlates(portalId) : null;
      if (plates && plates.portholeImg && S.drawScissorCutout) {
        S.drawScissorCutout(ctx, plates.portholeImg, 0.1, 0.1, 0.8, 0.8, 390, 120, 500, 400, { seed: portalId });
      }
    }

    // Button-specific volumetric shader accents
    if (resolved.selectedButton === "x") {
      var ax = (resolved.buttonInfo && resolved.buttonInfo.anchor && resolved.buttonInfo.anchor.x) || 430;
      var ay = (resolved.buttonInfo && resolved.buttonInfo.anchor && resolved.buttonInfo.anchor.y) || 270;
      BG.drawVolumetricBeam(ctx, 80, 90, ax, ay, { color: "#60a5fa", coreColor: "#eff6ff", spread: 145, t: resolved.t, intensity: 0.95 });
      BG.drawLanternHalo(ctx, ax, ay, 125, { color: "#60a5fa", t: resolved.t, intensity: 0.75 });
    } else if (resolved.selectedButton === "o") {
      var ox = (resolved.buttonInfo && resolved.buttonInfo.anchor && resolved.buttonInfo.anchor.x) || 850;
      var oy = (resolved.buttonInfo && resolved.buttonInfo.anchor && resolved.buttonInfo.anchor.y) || 275;
      BG.drawDeterministicParticles(ctx, "bubbles", ox, oy + 40, resolved.t, { loop: true, count: 20, spreadX: 160 });
    } else if (resolved.selectedButton === "triangle" && BG.drawSnailSilverTrail) {
      var tx = (resolved.buttonInfo && resolved.buttonInfo.anchor && resolved.buttonInfo.anchor.x) || 435;
      var ty = (resolved.buttonInfo && resolved.buttonInfo.anchor && resolved.buttonInfo.anchor.y) || 455;
      BG.drawSnailSilverTrail(ctx, 180, 520, tx, ty, Math.min(1, (resolved.stemT || 0.6) / 1.8), { t: resolved.t });
    } else if (resolved.selectedButton === "square") {
      var sqx = (resolved.buttonInfo && resolved.buttonInfo.anchor && resolved.buttonInfo.anchor.x) || 845;
      var sqy = (resolved.buttonInfo && resolved.buttonInfo.anchor && resolved.buttonInfo.anchor.y) || 455;
      BG.drawLanternHalo(ctx, sqx, sqy, 110, { color: "#fbbf24", t: resolved.t, intensity: 0.75 });
    }

    if (resolved.phase === "outcome" && resolved.selectedTier === "preposterous" && BG.drawTractorRings) {
      BG.drawTractorRings(ctx, 640, 110, 640, 430, resolved.t, { color: "#0f8f80", altColor: "#d42a1e", alpha: 0.75 });
    }

    if (machineOrState && machineOrState.particles && typeof machineOrState.particles.draw === "function" && !resolved.isShowcase) {
      machineOrState.particles.draw(ctx);
    }
    if (resolved.shockwave && resolved.shockwave.anchor) {
      BG.drawInputShockwave(ctx, resolved.shockwave.anchor.x, resolved.shockwave.anchor.y, resolved.shockwave.u, resolved.shockwave.button || resolved.shockwave.color);
    }

    BG.endCameraRig(ctx);
    BG.drawVignetteGrain(ctx, width, height, resolved.t, { fullHeight: resolved.blind, strength: 0.42 });

    var hud = BG.drawControllerHUD(ctx, width, height, resolved, {
      portalId: portalId,
      showCaptions: !resolved.blind
    });
    if (machineOrState && typeof machineOrState === "object" && hud && hud.hitboxes) {
      machineOrState.hitboxes = hud.hitboxes;
    }
    ctx.restore();
  }

  function renderToastOverlay(ctx, toast, nowMs, state) {
    if (!toast || nowMs > toast.until) return;
    if (state && state.showCaptions === false) return;
    var remain = Math.max(0, Math.min(1, (toast.until - nowMs) / 850));
    var alpha = remain < 0.3 ? remain / 0.3 : 1;
    ctx.save();
    ctx.globalAlpha = alpha * 0.94;
    ctx.font = "600 13.5px 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
    var txt = toast.text;
    var padX = 13;
    var tw = ctx.measureText(txt).width + padX * 2;
    var bx = 20;
    var by = 16;
    var bh = 28;
    ctx.fillStyle = "#fbfaf7";
    ctx.strokeStyle = toast.color || "#14110d";
    ctx.lineWidth = 2;
    ctx.fillRect(bx, by, tw, bh);
    ctx.strokeRect(bx, by, tw, bh);
    ctx.fillStyle = toast.color || "#14110d";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(txt, bx + padX, by + bh / 2 + 0.5);
    ctx.restore();
  }

  function svgSymbolMarkup(btnKey, size) {
    var sz = size || 18;
    if (btnKey === "x") {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    }
    if (btnKey === "o") {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><circle cx="12" cy="12" r="7.5"/></svg>';
    }
    if (btnKey === "triangle") {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linejoin="round"><polygon points="12,4.5 20,18.5 4,18.5"/></svg>';
    }
    return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linejoin="round"><rect x="5.5" y="5.5" width="13" height="13" rx="1"/></svg>';
  }

  function injectDeckStyles() {
    if (typeof document === "undefined") return;
    if (document.getElementById("ts-v3-deck-styles")) return;
    var st = document.createElement("style");
    st.id = "ts-v3-deck-styles";
    st.textContent = [
      ".v3-deck-wrap { font-family: 'Literata', Georgia, serif; color: #14110d; margin-top: 10px; display: grid; gap: 12px; }",
      ".v3-pad-shell { background: #14181f; color: #f8f6f0; border: 2px solid #14110d; padding: 12px 14px 14px; display: grid; gap: 10px; box-shadow: 0 4px 0 #14110d; }",
      ".v3-pad-top { display: flex; justify-content: space-between; align-items: center; gap: 8px 12px; flex-wrap: wrap; padding-bottom: 9px; border-bottom: 1px solid rgba(255,255,255,0.14); font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11.5px; }",
      ".v3-stage-pill { display: inline-flex; align-items: center; gap: 7px; padding: 4px 10px; border-radius: 2px; background: #2563eb; color: #fff; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; font-size: 11px; }",
      ".v3-stage-pill.ph-tier { background: #0f8f80; }",
      ".v3-stage-pill.ph-outcome { background: #d42a1e; }",
      ".v3-stage-pill.ph-showcase { background: #b45309; }",
      ".v3-stage-msg { color: #e5e1d6; font-size: 12px; }",
      ".v3-pad-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }",
      ".v3-mini-btn { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; padding: 4px 8px; border: 1px solid rgba(255,255,255,0.28); background: #1e242e; color: #f8f6f0; border-radius: 2px; cursor: pointer; }",
      ".v3-mini-btn:hover { border-color: #fff; background: #2a3240; }",
      ".v3-mini-btn.on { border-color: #34d399; color: #a7f3d0; }",
      ".v3-gp-badge { padding: 3px 8px; border-radius: 2px; font-size: 10.5px; border: 1px solid rgba(255,255,255,0.2); color: #9ca3af; }",
      ".v3-gp-badge.live { border-color: #34d399; color: #6ee7b7; background: rgba(16,185,129,0.14); font-weight: 700; }",
      ".v3-face-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 9px; }",
      ".v3-face-btn { display: grid; grid-template-columns: 36px minmax(0, 1fr); align-items: center; gap: 9px; text-align: left; padding: 9px 10px; background: #1d232d; border: 2px solid rgba(255,255,255,0.16); border-radius: 4px; color: #f8f6f0; cursor: pointer; transition: transform 0.08s ease, border-color 0.12s ease, background 0.12s ease; }",
      ".v3-face-btn:hover { transform: translateY(-1px); background: #252d3a; border-color: var(--btn-col, #60a5fa); }",
      ".v3-face-btn.selected { background: color-mix(in srgb, var(--btn-col, #2563eb) 28%, #181d26); border-color: #ffffff; box-shadow: 0 0 0 2px var(--btn-col, #2563eb); }",
      ".v3-cap { width: 34px; height: 34px; border-radius: 50%; background: #101318; border: 2px solid var(--btn-col, #60a5fa); color: var(--btn-col, #60a5fa); display: grid; place-items: center; flex-shrink: 0; }",
      ".v3-face-btn.selected .v3-cap { background: var(--btn-col, #2563eb); color: #fff; border-color: #fff; }",
      ".v3-face-title { font-family: 'Big Shoulders Display', Impact, sans-serif; font-weight: 800; font-size: 18px; letter-spacing: 0.02em; text-transform: uppercase; line-height: 1.05; color: #fff; display: flex; justify-content: space-between; align-items: center; gap: 4px; }",
      ".v3-face-sub { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; color: #cbd5e1; line-height: 1.25; margin-top: 2px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
      ".v3-kbd { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 9.8px; padding: 1px 5px; background: rgba(255,255,255,0.1); border-radius: 2px; color: #e2e8f0; font-weight: 600; white-space: nowrap; }",
      ".v3-dots3 { display: inline-flex; gap: 3px; margin-top: 4px; }",
      ".v3-dots3 i { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.18); display: inline-block; }",
      ".v3-dots3 i.u { background: #34d399; }",
      ".v3-tier-bar { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)) auto; gap: 8px; align-items: stretch; padding-top: 4px; }",
      ".v3-tier-btn { text-align: left; padding: 8px 10px; border-radius: 3px; border: 1.5px solid rgba(255,255,255,0.2); background: #1b212a; color: #f8f6f0; cursor: pointer; display: grid; gap: 2px; transition: border-color 0.12s ease, background 0.12s ease; }",
      ".v3-tier-btn:hover { border-color: var(--tier-hi, #38bdf8); background: #232b37; }",
      ".v3-tier-btn.ready { border-color: var(--tier-hi, #38bdf8); background: color-mix(in srgb, var(--tier-col, #1d596e) 32%, #171c24); }",
      ".v3-tier-btn.active { border-color: #fff; background: var(--tier-col, #1d596e); box-shadow: 0 0 0 1.5px #fff; }",
      ".v3-tier-top { display: flex; justify-content: space-between; align-items: center; gap: 6px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--tier-hi, #7dd3fc); }",
      ".v3-tier-btn.active .v3-tier-top { color: #fff; }",
      ".v3-tier-preview { font-size: 12.5px; line-height: 1.25; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
      ".v3-util-cluster { display: flex; gap: 6px; flex-wrap: wrap; align-items: stretch; }",
      ".v3-util-btn { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; font-weight: 600; padding: 7px 10px; border: 1.5px solid rgba(255,255,255,0.24); background: #202733; color: #f8f6f0; border-radius: 3px; cursor: pointer; white-space: nowrap; }",
      ".v3-util-btn:hover { border-color: #f2b85a; color: #fde68a; }",
      ".v3-util-btn.on { background: #b45309; border-color: #fde68a; color: #fff; }",
      ".v3-matrix-card { border: 2px solid #14110d; background: #fffdf8; padding: 12px 14px 14px; }",
      ".v3-matrix-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px 14px; flex-wrap: wrap; padding-bottom: 8px; border-bottom: 1.5px solid #14110d; margin-bottom: 10px; }",
      ".v3-matrix-head h4 { font-family: 'Big Shoulders Display', Impact, sans-serif; font-weight: 900; font-size: 21px; letter-spacing: 0.02em; text-transform: uppercase; margin: 0; color: #14110d; }",
      ".v3-matrix-prog { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11.5px; color: #1d596e; font-weight: 700; }",
      ".v3-matrix-grid { display: grid; grid-template-columns: minmax(150px, 0.95fr) repeat(3, minmax(0, 1fr)); gap: 7px; align-items: stretch; }",
      ".v3-m-colhead { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; padding: 6px 8px; background: #f3efe6; border: 1px solid #d6d3cc; border-top: 3px solid var(--tcol, #14110d); color: #14110d; }",
      ".v3-m-rowstub { display: flex; align-items: center; gap: 8px; padding: 8px 9px; background: #f8f6f0; border: 1.5px solid #d6d3cc; border-left: 4px solid var(--bcol, #2563eb); text-align: left; cursor: pointer; }",
      ".v3-m-rowstub:hover { border-color: #14110d; background: #f1ede2; }",
      ".v3-m-sym { width: 24px; height: 24px; border-radius: 50%; background: var(--bcol, #2563eb); color: #fff; display: grid; place-items: center; flex-shrink: 0; }",
      ".v3-m-cell { text-align: left; padding: 8px 9px; border: 1.5px solid #d6d3cc; background: #fbfaf7; border-radius: 2px; cursor: pointer; display: grid; gap: 3px; align-content: start; transition: border-color 0.1s ease, background 0.1s ease; }",
      ".v3-m-cell:hover { border-color: #14110d; background: #f3efe6; }",
      ".v3-m-cell.unlocked { background: #ffffff; border-color: #8c8577; border-left: 4px solid var(--tcol, #1d596e); }",
      ".v3-m-cell.playing { border: 2px solid #d42a1e; background: #fff7ed; box-shadow: 2px 2px 0 #14110d; }",
      ".v3-m-tag { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: #766e62; display: flex; justify-content: space-between; gap: 4px; }",
      ".v3-m-cell.unlocked .v3-m-tag { color: var(--tcol, #1d596e); font-weight: 700; }",
      ".v3-m-cell.playing .v3-m-tag { color: #d42a1e; font-weight: 700; }",
      ".v3-m-title { font-weight: 600; font-size: 13px; line-height: 1.28; color: #14110d; }",
      ".v3-m-cell:not(.unlocked) .v3-m-title { color: #5b5348; font-size: 12.2px; }",
      ".v3-m-cap { font-size: 11.5px; line-height: 1.3; color: #5b5348; }",
      ".v3-legacy-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }",
      "@media (max-width: 900px) { .v3-face-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .v3-tier-bar { grid-template-columns: 1fr; } .v3-matrix-grid { grid-template-columns: 1fr; } .v3-m-colhead { display: none; } }"
    ].join("\n");
    document.head.appendChild(st);
  }

  var rafId = 0;
  var lastRafMs = 0;
  var activeCanvas = null;
  var activeCtx = null;
  var onUiSync = null;
  var toast = null;
  var mountedDecks = [];
  var prevExtraPadState = {};

  function notifyAllSubscribers(gm) {
    if (typeof onUiSync === "function") {
      try { onUiSync(gm); } catch (e) {}
    }
    for (var i = mountedDecks.length - 1; i >= 0; i--) {
      var d = mountedDecks[i];
      if (!d || !d.el || (typeof document !== "undefined" && !document.body.contains(d.el))) {
        mountedDecks.splice(i, 1);
        continue;
      }
      if (typeof d.sync === "function") {
        try { d.sync(gm); } catch (e) {}
      }
    }
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      try {
        window.dispatchEvent(new CustomEvent("turkeysub:gamechange", { detail: gm.getSnapshot() }));
      } catch (e) {}
    }
  }

  var game = {
    active: false,
    loopDuration: V3_LOOP_DUR,
    portalId: 1,
    station: "#01 · Bow",
    clue: "",
    turkeyFork: "",
    troutFork: "",
    alienFork: "",
    scionRule: "",
    defaultTool: "lamp",
    t: 0.0,
    fps: 60,
    framesRendered: 0,
    actionCount: 0,
    lastAction: null,
    gamepadConnected: false,
    gamepadId: "",
    machine: null,
    history: [],
    state: {
      edition: "v3", // "v3" (18.0s 12-Branch Game, default) | "v2" (16.0s Linear Cutout) | "v1" (13.0s Setup-A Cockpit)
      lamp: true,
      ballast: false,
      view: "auto",
      roll: 0,
      tier: null,
      routeMarked: false,
      showCaptions: true,
      muted: false,
      paused: false,
      snailActive: false,
      snailT: 0,
      snailDelivered: false,
      snailCount: 0,
      snailNote: ""
    },

    _ensureMachine: function () {
      var BG = window.BRANCH_GAME;
      if (!BG || typeof BG.createMachine !== "function") return null;
      if (!this.machine) {
        var self = this;
        this.machine = BG.createMachine(this.portalId || 1, {
          showCaptions: this.state.showCaptions !== false,
          muted: !!this.state.muted,
          onChange: function (m, eventTag, extra) {
            self.t = m.t;
            self.actionCount += 1;
            self.lastAction = eventTag;
            if (extra && extra.newlyUnlocked && typeof window !== "undefined") {
              toast = {
                text: "\u2713 UNLOCKED BRANCH " + (extra.portalCount || 1) + "/12 \u00b7 GLOBAL " + (extra.totalCount || 1) + "/660",
                color: COL_PLAUSIBLE,
                until: performance.now() + 1350
              };
            }
            notifyAllSubscribers(self);
          }
        });
      }
      this.machine.showCaptions = (this.state.showCaptions !== false);
      this.machine.muted = !!this.state.muted;
      return this.machine;
    },

    isV3Active: function () {
      return this.state.edition === "v3" && !!window.BRANCH_GAME;
    },

    isV2Active: function (id) {
      var target = id || this.portalId;
      if (this.state.edition !== "v2") return false;
      return !!(window.PORTAL_REMAKE_SCENES && window.PORTAL_REMAKE_SCENES[target]);
    },

    getActiveDuration: function (id) {
      if (this.isV3Active()) return V3_LOOP_DUR;
      if (this.isV2Active(id)) return LOOP_DUR;
      return V1_LOOP_DUR;
    },

    getScene: function (id, editionOverride) {
      ensureV1Snapshot();
      var target = id || this.portalId;
      if (target === "intro" && window.TROUT_SUB_INTRO) return window.TROUT_SUB_INTRO;
      var ed = editionOverride || this.state.edition || "v3";
      if (ed === "v3") {
        if (window.PORTAL_V3_GAMES && window.PORTAL_V3_GAMES[target]) {
          return window.PORTAL_V3_GAMES[target];
        }
        if (window.BRANCH_GAME && typeof window.BRANCH_GAME.getGame === "function") {
          var bgSc = window.BRANCH_GAME.getGame(target);
          if (bgSc) return bgSc;
        }
        return null; // Handled cleanly by renderV3BridgeScene
      }
      if (ed === "v2" && window.PORTAL_REMAKE_SCENES && window.PORTAL_REMAKE_SCENES[target]) {
        return window.PORTAL_REMAKE_SCENES[target];
      }
      var v1Map = window.PORTAL_V1_SCENES || window.PORTAL_SCENES || {};
      return v1Map[target] || (window.PORTAL_REMAKE_SCENES && window.PORTAL_REMAKE_SCENES[target]) || null;
    },

    getBranchTree: function (id) {
      var target = id || this.portalId;
      if (window.BRANCH_GAME && typeof window.BRANCH_GAME.getBranchTree === "function") {
        return window.BRANCH_GAME.getBranchTree(target);
      }
      if (window.PORTHOLE_BRANCH_TREES && window.PORTHOLE_BRANCH_TREES[target]) {
        return window.PORTHOLE_BRANCH_TREES[target];
      }
      return null;
    },

    getDiscoveryMatrix: function (id) {
      var target = id || this.portalId;
      if (window.BRANCH_GAME && window.BRANCH_GAME.discovery) {
        return window.BRANCH_GAME.discovery.getMatrix(target);
      }
      return { portalId: target, unlockedCount: 0, totalBranches: 12, globalUnlockedCount: 0, globalTotalBranches: 660, rows: [] };
    },

    getUnlockedCount: function (id) {
      if (window.BRANCH_GAME && window.BRANCH_GAME.discovery) {
        return window.BRANCH_GAME.discovery.getPortalCount(id || this.portalId);
      }
      return 0;
    },

    getGlobalUnlockedCount: function () {
      if (window.BRANCH_GAME && window.BRANCH_GAME.discovery) {
        return window.BRANCH_GAME.discovery.getTotalCount();
      }
      return 0;
    },

    getSnailNote: function (id) {
      return loadPortalSnailNote(id || this.portalId);
    },

    getAllSnailNotes: function () {
      return loadAllSnailNotes();
    },

    setSnailNote: function (noteText, id) {
      var targetId = id || this.portalId;
      var clean = typeof noteText === "string" ? noteText.trim().slice(0, 180) : "";
      savePortalSnailNote(targetId, clean);
      if (Number(targetId) === Number(this.portalId)) {
        this.state.snailNote = clean;
        if (!clean && !this.state.snailActive) {
          this.state.snailDelivered = false;
        }
        notifyAllSubscribers(this);
        this.renderNow();
      }
      return clean;
    },

    _buildRenderState: function (isV2) {
      var viewForScene = this.state.view;
      if (!isV2 && viewForScene === "real") {
        viewForScene = "auto";
      }
      var rs = {
        edition: isV2 ? "v2" : "v1",
        lamp: !!this.state.lamp,
        ballast: !!this.state.ballast,
        view: viewForScene,
        roll: this.state.roll,
        showCaptions: this.state.showCaptions,
        snailActive: !!this.state.snailActive,
        snailNote: this.state.snailNote || "",
        snailMail: this.state.snailActive ? this.state.snailT : !!this.state.snailDelivered
      };
      if (this.state.snailActive) {
        rs.snailT = this.state.snailT;
      }
      return rs;
    },

    _recordAction: function (tag, label, color) {
      this.actionCount += 1;
      this.lastAction = tag;
      this.history.push({
        seq: this.actionCount,
        action: tag,
        edition: this.state.edition,
        t: Number(this.t.toFixed(2)),
        phase: this.machine ? this.machine.phase : null,
        button: this.machine ? this.machine.selectedButton : null,
        tier: this.machine ? this.machine.selectedTier : this.state.tier,
        showCaptions: this.state.showCaptions
      });
      if (this.history.length > 40) this.history.shift();
      if (label) {
        toast = {
          text: label,
          color: color || "#14110d",
          until: performance.now() + 1080
        };
      }
      notifyAllSubscribers(this);
      this.renderNow();
    },

    /* ---------- V3 2-Stage Branching Controls ---------- */

    selectButton: function (btnKey) {
      if (!this.isV3Active()) this.setEdition("v3");
      var m = this._ensureMachine();
      if (!m) return false;
      this.state.paused = false;
      var ok = m.selectButton(btnKey);
      this.renderNow();
      return ok;
    },

    pressButton: function (btnKey) {
      if (!this.isV3Active()) this.setEdition("v3");
      var m = this._ensureMachine();
      if (!m) return false;
      this.state.paused = false;
      var ok = m.pressButton(btnKey);
      this.renderNow();
      return ok;
    },

    selectTier: function (tierKey, btnOverride) {
      if (!this.isV3Active()) this.setEdition("v3");
      var m = this._ensureMachine();
      if (!m) return false;
      this.state.paused = false;
      var ok = m.selectTier(tierKey, btnOverride);
      this.renderNow();
      return ok;
    },

    jumpToBranch: function (btnKey, tierKey) {
      if (!this.isV3Active()) this.setEdition("v3");
      var m = this._ensureMachine();
      if (!m) return false;
      this.state.paused = false;
      var ok = m.jumpToBranch(btnKey, tierKey);
      this.renderNow();
      return ok;
    },

    rewindFork: function () {
      if (!this.isV3Active()) return false;
      var m = this._ensureMachine();
      if (!m) return false;
      this.state.paused = false;
      var ok = m.rewind();
      this.renderNow();
      return ok;
    },

    rewind: function () {
      return this.rewindFork();
    },

    resetToRoot: function () {
      if (!this.isV3Active()) return false;
      var m = this._ensureMachine();
      if (!m) return false;
      this.state.paused = false;
      var ok = m.resetToRoot();
      this.renderNow();
      return ok;
    },

    rollFate: function (seed) {
      if (this.isV3Active()) {
        var m = this._ensureMachine();
        if (!m) return false;
        this.state.paused = false;
        var ok = m.randomBranch(seed);
        this.renderNow();
        return ok;
      }
      return this.rollDie(seed);
    },

    randomBranch: function (seed) {
      return this.rollFate(seed);
    },

    startAutoShowcase: function (atSec) {
      if (!this.isV3Active()) this.setEdition("v3");
      var m = this._ensureMachine();
      if (!m) return false;
      this.state.paused = false;
      m.startShowcase(typeof atSec === "number" ? atSec : 0);
      this.t = m.t;
      toast = {
        text: "[A] 18.0s BRANCHING SHOWCASE REEL \u00b7 PRESS \u2715 \u00b7 \u25cb \u00b7 \u25b3 \u00b7 \u25a1 TO TAKE CONTROL",
        color: "#b45309",
        until: performance.now() + 1250
      };
      notifyAllSubscribers(this);
      this.renderNow();
      return true;
    },

    toggleShowcase: function () {
      if (!this.isV3Active()) return this.startAutoShowcase(0);
      var m = this._ensureMachine();
      if (!m) return false;
      if (m.phase === "showcase") {
        return this.resetToRoot();
      }
      return this.startAutoShowcase(0);
    },

    /* ---------- Edition Switcher: V3 (18s) ⇄ V2 (16s) ⇄ V1 (13s) ---------- */

    setEdition: function (ed) {
      var nextEd = (ed === "v1" || ed === "v2" || ed === "v3") ? ed : "v3";
      if (nextEd === "v3" && !window.BRANCH_GAME) nextEd = "v2";
      this.state.edition = nextEd;
      this.loopDuration = this.getActiveDuration();
      this.t = nextEd === "v3" ? 0.0 : 0.25;
      this.state.view = "auto";
      this.state.snailActive = false;
      if (nextEd === "v3") {
        var m = this._ensureMachine();
        if (m) m.setPortal(this.portalId, "root");
      }
      if ((nextEd === "v3" || nextEd === "v2") && window.SCION_STAGE && typeof window.SCION_STAGE.preloadPortalPlates === "function") {
        window.SCION_STAGE.preloadPortalPlates(this.portalId);
      }
      playSound("edition", nextEd !== "v1", this.state.muted);
      var edLabel = nextEd === "v3"
        ? "[V] EDITION: V3 BRANCHING GAME (\u2715\u00b7\u25cb\u00b7\u25b3\u00b7\u25a1 \u00d7 3 TIERS = 12 ENDINGS)"
        : (nextEd === "v2"
          ? "[V] EDITION: V2 LINEAR CUTOUT REMAKE (16.0s)"
          : "[V] EDITION: V1 ORIGINAL SETUP-A COCKPIT (13.0s)");
      var edCol = nextEd === "v3" ? "#2563eb" : (nextEd === "v2" ? COL_PREPOSTEROUS : COL_PROBABLE);
      this._recordAction("edition:" + nextEd, edLabel, edCol);
      return this.state.edition;
    },

    toggleEdition: function () {
      var order = window.BRANCH_GAME ? ["v3", "v2", "v1"] : ["v2", "v1"];
      var idx = order.indexOf(this.state.edition);
      var next = order[(idx + 1) % order.length];
      return this.setEdition(next);
    },

    loadPortal: function (id, seedFallback, initialEdition, startPhase) {
      ensureV1Snapshot();
      var num = Math.max(1, Math.min(55, parseInt(id, 10) || 1));
      if (initialEdition === "v1" || initialEdition === "v2" || initialEdition === "v3") {
        this.state.edition = (initialEdition === "v3" && !window.BRANCH_GAME) ? "v2" : initialEdition;
      } else if (!this.state.edition) {
        this.state.edition = window.BRANCH_GAME ? "v3" : "v2";
      }

      if (window.SCION_STAGE && typeof window.SCION_STAGE.preloadPortalPlates === "function") {
        var self = this;
        window.SCION_STAGE.preloadPortalPlates(num).then(function () {
          if (self.active && self.portalId === num) self.renderNow();
        }).catch(function () {});
      }

      var v2Sc = this.getScene(num, "v2");
      var v1Sc = this.getScene(num, "v1");
      var tree = this.getBranchTree(num);
      var stOpt = (window.STUDENT_OPTIONS && window.STUDENT_OPTIONS[num]) || null;
      var savedNote = loadPortalSnailNote(num);
      var alienLookup = (stOpt && stOpt.d) || (window.ALIEN_PASSES && window.ALIEN_PASSES[num]) || "";

      this.portalId = num;
      this.loopDuration = this.getActiveDuration(num);
      this.station = (tree && tree.station) || (v2Sc && v2Sc.station) || (stOpt && stOpt.station) || (seedFallback && seedFallback[0]) || ("#" + pad2(num));
      this.clue = (tree && tree.clue) || (stOpt && stOpt.a) || (v2Sc && v2Sc.clue) || (seedFallback && seedFallback[1]) || "";
      this.turkeyFork = (stOpt && stOpt.b) || (v1Sc && v1Sc.turkeyFork) || (seedFallback && seedFallback[3]) || "";
      this.troutFork = (stOpt && stOpt.c) || (v1Sc && v1Sc.troutFork) || (seedFallback && seedFallback[4]) || "";
      this.alienFork = alienLookup;
      this.scionRule = (v2Sc && v2Sc.scionRule) || (seedFallback && seedFallback[5]) || "";
      this.defaultTool = (v1Sc && v1Sc.defaultTool) || "lamp";

      this.state.lamp = this.defaultTool !== "ballast";
      this.state.ballast = this.defaultTool === "ballast";
      this.state.view = "auto";
      this.state.roll = 0;
      this.state.tier = null;
      this.state.routeMarked = false;
      this.state.paused = false;
      this.state.snailActive = false;
      this.state.snailT = 0;
      this.state.snailNote = savedNote;
      this.state.snailDelivered = !!savedNote;
      this.state.snailCount = savedNote ? 1 : 0;
      this.t = 0.0;
      this.framesRendered = 0;
      this.lastAction = "load:" + num;

      var m = this._ensureMachine();
      if (m) {
        m.setPortal(num, startPhase || "root");
      }

      toast = {
        text: this.station + " \u00b7 " + (this.isV3Active()
          ? "V3 12-BRANCH GAME \u00b7 PRESS \u2715 \u00b7 \u25cb \u00b7 \u25b3 \u00b7 \u25a1"
          : (this.isV2Active(num) ? "V2 SCION REMAKE (16s)" : "V1 COCKPIT (13s)")),
        color: this.isV3Active() ? "#2563eb" : (this.isV2Active(num) ? COL_PREPOSTEROUS : COL_PROBABLE),
        until: performance.now() + 1150
      };
      notifyAllSubscribers(this);
      this.renderNow();
      return this.getSnapshot();
    },

    mount: function (canvas, id, seedFallback, uiCallback, initialEdition, startPhase) {
      this.unmount();
      ensureV1Snapshot();
      activeCanvas = canvas;
      if (activeCanvas) {
        activeCanvas.width = W;
        activeCanvas.height = H;
        activeCtx = activeCanvas.getContext("2d");
        this._bindCanvasPointer(activeCanvas);
      }
      onUiSync = uiCallback || null;
      this.active = true;
      this.loadPortal(id, seedFallback, initialEdition || "v3", startPhase);
      lastRafMs = performance.now();
      startAmbient(this.state.muted);
      var self = this;
      function loop(nowMs) {
        if (!self.active) return;
        rafId = requestAnimationFrame(loop);
        var dt = Math.min(0.1, Math.max(0, (nowMs - lastRafMs) / 1000));
        lastRafMs = nowMs;
        if (dt > 0.001) {
          self.fps = Math.round(0.85 * self.fps + 0.15 * (1 / dt));
        }
        self._pollGamepad();
        if (!self.state.paused) {
          self._advanceTime(dt);
        }
        self.renderNow(nowMs);
      }
      rafId = requestAnimationFrame(loop);
      return this;
    },

    unmount: function () {
      this.active = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      stopAmbient();
      if (activeCanvas) {
        activeCanvas.style.cursor = "default";
      }
      activeCanvas = null;
      activeCtx = null;
      onUiSync = null;
    },

    _pollGamepad: function () {
      if (typeof navigator === "undefined" || typeof navigator.getGamepads !== "function") return;
      var pads;
      try { pads = navigator.getGamepads(); } catch (e) { return; }
      if (!pads) return;

      var connectedAny = false;
      var padName = "";
      for (var i = 0; i < pads.length; i++) {
        var gp = pads[i];
        if (gp && gp.connected) {
          connectedAny = true;
          padName = gp.id || "Gamepad";
          // Extra shoulder / trigger / D-pad bindings
          var extras = [
            { idx: 4, act: "prev_portal" }, // L1 / LB
            { idx: 5, act: "next_portal" }, // R1 / RB
            { idx: 6, act: "rewind" },      // L2 / LT
            { idx: 7, act: "showcase" }     // R2 / RT
          ];
          for (var e = 0; e < extras.length; e++) {
            var ex = extras[e];
            var btnObj = gp.buttons && gp.buttons[ex.idx];
            var pressed = !!(btnObj && (btnObj.pressed || btnObj.value > 0.6));
            var k = i + ":ex:" + ex.idx;
            var was = !!prevExtraPadState[k];
            prevExtraPadState[k] = pressed;
            if (pressed && !was) {
              if (ex.act === "rewind") this.rewindFork();
              else if (ex.act === "showcase") this.toggleShowcase();
              else if (ex.act === "prev_portal" && this.portalId > 1) {
                this.loadPortal(this.portalId - 1, null, this.state.edition);
              } else if (ex.act === "next_portal" && this.portalId < 55) {
                this.loadPortal(this.portalId + 1, null, this.state.edition);
              }
            }
          }
        }
      }

      if (connectedAny !== this.gamepadConnected) {
        this.gamepadConnected = connectedAny;
        this.gamepadId = padName;
        notifyAllSubscribers(this);
      }

      if (this.isV3Active() && this.machine && typeof this.machine.pollGamepad === "function") {
        this.machine.pollGamepad(navigator);
      }
    },

    _advanceTime: function (dt) {
      if (this.isV3Active()) {
        var m = this._ensureMachine();
        if (m) {
          this.loopDuration = V3_LOOP_DUR;
          m.update(dt);
          this.t = m.t;
          return;
        }
      }

      var isV2 = this.isV2Active();
      var dur = isV2 ? LOOP_DUR : V1_LOOP_DUR;
      this.loopDuration = dur;

      if (this.state.snailActive) {
        var prevST = typeof this.state.snailT === "number" ? this.state.snailT : 0;
        var nextST = prevST + dt / SNAIL_TRIP_DUR;

        if (prevST < 0.44 && nextST >= 0.44) {
          this.state.view = "trout";
          this.t = isV2 ? 8.35 : 6.4;
          this.state.routeMarked = true;
          this.state.snailDelivered = true;
          toast = {
            text: "C · PLAUSIBLE · BROOK TROUT STAMPS & CLIMBS TO ALIEN",
            color: COL_PLAUSIBLE,
            until: performance.now() + 1000
          };
          notifyAllSubscribers(this);
        }

        if (prevST < 0.75 && nextST >= 0.75) {
          this.state.view = "alien";
          this.t = isV2 ? 12.35 : 10.4;
          this.state.routeMarked = true;
          this.state.snailDelivered = true;
          toast = {
            text: "D · PREPOSTEROUS · ALIEN LISTENING POST SCAN",
            color: COL_PREPOSTEROUS,
            until: performance.now() + 1150
          };
          notifyAllSubscribers(this);
        }

        if (nextST >= 1.0) {
          this.state.snailT = 1.0;
          this.state.snailActive = false;
          this.state.snailDelivered = true;
          this.state.routeMarked = true;
          notifyAllSubscribers(this);
        } else {
          this.state.snailT = nextST;
        }
      }

      if (isV2) {
        if (this.state.view === "real") {
          var nr = this.t + dt;
          if (nr < 0.35 || nr >= 3.85) nr = 0.35 + ((nr - 0.35) % 3.5 + 3.5) % 3.5;
          this.t = nr;
        } else if (this.state.view === "turkey") {
          var ntk = this.t + dt;
          if (ntk < 4.15 || ntk >= 7.85) ntk = 4.15 + ((ntk - 4.15) % 3.7 + 3.7) % 3.7;
          this.t = ntk;
        } else if (this.state.view === "trout") {
          var ntr = this.t + dt;
          if (ntr < 8.15 || ntr >= 11.85) ntr = 8.15 + ((ntr - 8.15) % 3.7 + 3.7) % 3.7;
          this.t = ntr;
        } else if (this.state.view === "alien") {
          var nal = this.t + dt;
          if (nal < 12.15 || nal >= 15.85) nal = 12.15 + ((nal - 12.15) % 3.7 + 3.7) % 3.7;
          this.t = nal;
        } else {
          var prevT2 = this.t;
          this.t = (this.t + dt) % dur;
          if (this.t >= 6.0) this.state.routeMarked = true;
          if (prevT2 < 12.02 && this.t >= 12.02 && this.active && !this.state.muted) {
            playSound("alien", true, this.state.muted);
          }
        }
      } else {
        if (this.state.view === "real") {
          var v1r = this.t + dt;
          if (v1r < 0.4 || v1r >= 1.8) v1r = 0.4 + ((v1r - 0.4) % 1.4 + 1.4) % 1.4;
          this.t = v1r;
        } else if (this.state.view === "turkey") {
          var nextTk = this.t + dt;
          if (nextTk < 1.8 || nextTk >= 4.8) nextTk = 1.8 + ((nextTk - 1.8) % 3.0 + 3.0) % 3.0;
          this.t = nextTk;
        } else if (this.state.view === "trout") {
          var nextTr = this.t + dt;
          if (nextTr < 5.2 || nextTr >= 8.0) nextTr = 5.2 + ((nextTr - 5.2) % 2.8 + 2.8) % 2.8;
          this.t = nextTr;
        } else if (this.state.view === "alien") {
          var nextAl = this.t + dt;
          if (nextAl < 9.1 || nextAl >= 12.8) nextAl = 9.1 + ((nextAl - 9.1) % 3.7 + 3.7) % 3.7;
          this.t = nextAl;
        } else {
          var prevAutoT = this.t;
          this.t = (this.t + dt) % dur;
          if (this.t >= 5.0) this.state.routeMarked = true;
          if (prevAutoT < 8.85 && this.t >= 8.85 && this.active && !this.state.muted) {
            playSound("alien", true, this.state.muted);
          }
        }
      }
    },

    step: function (dtSec) {
      var d = typeof dtSec === "number" ? dtSec : 1 / 60;
      this._advanceTime(d);
      this.renderNow(performance.now());
      return this.getSnapshot();
    },

    setTime: function (sec) {
      var dur = this.getActiveDuration();
      var clamped = Math.max(0, Math.min(dur - 0.001, Number(sec) || 0));
      this.t = clamped;
      if (this.isV3Active() && this.machine) {
        if (this.machine.phase === "showcase") {
          this.machine.setShowcaseTime(clamped);
        } else {
          this.machine.t = clamped;
        }
      }
      notifyAllSubscribers(this);
      this.renderNow(performance.now());
      return this.getSnapshot();
    },

    sendSnailMail: function (note) {
      if (typeof note === "string") {
        var trimmed = note.trim().slice(0, 180);
        if (trimmed.length > 0) {
          this.state.snailNote = trimmed;
          savePortalSnailNote(this.portalId, trimmed);
        }
      } else if (!this.state.snailNote) {
        var existing = loadPortalSnailNote(this.portalId);
        if (existing) this.state.snailNote = existing;
      }

      if (this.isV3Active()) {
        this.state.snailCount = (this.state.snailCount || 0) + 1;
        this.state.snailDelivered = true;
        this.selectButton("triangle");
        return this.getSnapshot();
      }

      var isV2 = this.isV2Active();
      this.state.view = "turkey";
      this.t = isV2 ? 4.35 : 3.85;
      this.state.paused = false;
      this.state.snailActive = true;
      this.state.snailT = 0.0;
      this.state.snailDelivered = false;
      this.state.snailCount = (this.state.snailCount || 0) + 1;

      playSound("snail", this.state.snailNote || true, this.state.muted);

      var notePreview = this.state.snailNote
        ? ('"' + (this.state.snailNote.length > 32 ? this.state.snailNote.slice(0, 32) + "…" : this.state.snailNote) + '"')
        : "B TURKEY -> C TROUT -> D ALIEN";
      this._recordAction(
        "snail:" + this.state.snailCount,
        "[S] SNAIL MAIL · " + notePreview,
        COL_PROBABLE
      );
      return this.getSnapshot();
    },

    toggleLamp: function () {
      if (this.isV3Active()) {
        return this.selectButton("x");
      }
      this.state.lamp = !this.state.lamp;
      playSound("lamp", this.state.lamp, this.state.muted);
      this._recordAction(
        "lamp:" + (this.state.lamp ? "on" : "off"),
        "[L] LAMP TOGGLE · " + (this.state.lamp ? "SPOTLIGHT / BACKLIGHT ON" : "LAMP OFF"),
        this.state.lamp ? "#9a6514" : "#394246"
      );
      return this.state.lamp;
    },

    toggleBallast: function () {
      if (this.isV3Active()) {
        return this.selectButton("o");
      }
      this.state.ballast = !this.state.ballast;
      playSound("ballast", this.state.ballast, this.state.muted);
      this._recordAction(
        "ballast:" + (this.state.ballast ? "on" : "off"),
        "[B] BALLAST SLOT · " + (this.state.ballast ? "TRIMMED LOW" : "RELEASED"),
        this.state.ballast ? COL_PLAUSIBLE : "#394246"
      );
      return this.state.ballast;
    },

    setView: function (v) {
      if (this.isV3Active()) {
        if (v === "auto") return this.startAutoShowcase(0);
        if (v === "real") return this.resetToRoot();
        if (v === "turkey") return this.selectTier("probable");
        if (v === "trout") return this.selectTier("plausible");
        if (v === "alien") return this.selectTier("preposterous");
      }
      var target = (v === "real" || v === "turkey" || v === "trout" || v === "alien" || v === "auto") ? v : "auto";
      var isV2 = this.isV2Active();
      this.state.view = target;
      this.state.snailActive = false;

      if (target === "real") {
        this.t = 0.6;
        playSound("view", "real", this.state.muted);
      } else if (target === "turkey") {
        this.t = isV2 ? 4.4 : 2.8;
        playSound("view", "turkey", this.state.muted);
      } else if (target === "trout") {
        this.t = isV2 ? 8.4 : 6.4;
        this.state.routeMarked = true;
        playSound("view", "trout", this.state.muted);
      } else if (target === "alien") {
        this.t = isV2 ? 12.4 : 10.4;
        this.state.routeMarked = true;
        playSound("alien", true, this.state.muted);
      } else {
        playSound("view", "auto", this.state.muted);
      }

      var lblMap = {
        real: "[SPACE] BEAT A · REAL CREEK",
        turkey: "[SPACE] BEAT B · PROBABLE (TURKEY)",
        trout: "[SPACE] BEAT C · PLAUSIBLE (TROUT)",
        alien: "[SPACE] BEAT D · PREPOSTEROUS (ALIEN)",
        auto: "[A] AUTO " + (isV2 ? "16s 4-VARIATION FILM" : "13s 3-PASS CHAIN")
      };
      var colMap = {
        real: COL_REAL,
        turkey: COL_PROBABLE,
        trout: COL_PLAUSIBLE,
        alien: COL_PREPOSTEROUS,
        auto: COL_REAL
      };
      this._recordAction("view:" + target, lblMap[target], colMap[target]);
      return this.state.view;
    },

    flipView: function () {
      if (this.isV3Active()) {
        return this.rollFate();
      }
      var order = ["real", "turkey", "trout", "alien", "auto"];
      var idx = order.indexOf(this.state.view);
      var next = order[(idx + 1) % order.length];
      return this.setView(next);
    },

    rollDie: function (forced) {
      var val = (forced >= 1 && forced <= 6)
        ? Math.floor(forced)
        : (1 + Math.floor(Math.random() * 6));
      this.state.roll = val;
      this.state.tier = tierForRoll(val);
      this.state.routeMarked = true;
      if (this.isV3Active()) {
        var mappedTier = val <= 2 ? "probable" : (val <= 4 ? "plausible" : "preposterous");
        var m = this._ensureMachine();
        if (m && m.selectedButton) {
          m.selectTier(mappedTier);
        } else {
          this.rollFate();
        }
        return val;
      }
      playSound("roll", val, this.state.muted);
      var voice = tierVoiceForRoll(val);
      this._recordAction(
        "roll:" + val,
        "[R] ROLLED 1d6 #" + val + " · " + this.state.tier.toUpperCase() + " (" + voice + ")",
        tierColor(val)
      );
      return val;
    },

    toggleCaptions: function () {
      this.state.showCaptions = !this.state.showCaptions;
      if (this.machine) this.machine.showCaptions = this.state.showCaptions;
      playSound("captions", this.state.showCaptions, this.state.muted);
      this._recordAction(
        "captions:" + (this.state.showCaptions ? "on" : "off"),
        "[C] CAPTIONS · " + (this.state.showCaptions ? "HUD & SLATE VISIBLE" : "BLIND CRITIC MODE (0 TEXT CALLS)"),
        COL_PLAUSIBLE
      );
      return this.state.showCaptions;
    },

    togglePause: function () {
      this.state.paused = !this.state.paused;
      this._recordAction(
        "pause:" + (this.state.paused ? "on" : "off"),
        this.state.paused ? "PAUSED FRAME" : "RESUMED 60FPS",
        COL_REAL
      );
      return this.state.paused;
    },

    toggleMute: function () {
      this.state.muted = !this.state.muted;
      if (this.machine) this.machine.muted = this.state.muted;
      if (window.BRANCH_GAME && window.BRANCH_GAME.audio) {
        window.BRANCH_GAME.audio.muted = this.state.muted;
      }
      if (this.state.muted) stopAmbient();
      else if (this.active) startAmbient(false);
      notifyAllSubscribers(this);
      return this.state.muted;
    },

    _ensureV3Hitboxes: function (v3Sc) {
      var m = this._ensureMachine();
      if (!m || this.state.showCaptions === false) return;
      if (Array.isArray(m.hitboxes) && m.hitboxes.length > 0) return;
      var probe = ensureHitProbeCtx();
      if (probe && window.BRANCH_GAME && typeof window.BRANCH_GAME.drawControllerHUD === "function") {
        var res = window.BRANCH_GAME.drawControllerHUD(probe, W, H, m, {
          portalId: this.portalId,
          showCaptions: true,
          hotspots: (v3Sc && v3Sc.hotspots) || null
        });
        if (res && res.hitboxes) m.hitboxes = res.hitboxes;
      }
    },

    renderNow: function (nowMs) {
      if (!activeCtx || !activeCanvas) return;

      activeCtx.save();
      activeCtx.setTransform(1, 0, 0, 1, 0, 0);
      activeCtx.globalAlpha = 1;
      activeCtx.globalCompositeOperation = "source-over";
      activeCtx.shadowBlur = 0;
      if (activeCtx.setLineDash) activeCtx.setLineDash([]);
      activeCtx.clearRect(0, 0, W, H);

      if (this.isV3Active()) {
        var m = this._ensureMachine();
        var v3Sc = this.getScene(this.portalId, "v3");
        var v3State = m ? m.getState() : { portalId: this.portalId, showCaptions: this.state.showCaptions };
        v3State.showCaptions = this.state.showCaptions;
        if (m) m.hitboxes = [];

        if (v3Sc && typeof v3Sc.render === "function") {
          try {
            v3Sc.render(activeCtx, W, H, this.t, v3State);
            if (m && v3State.hitboxes && v3State.hitboxes.length) {
              m.hitboxes = v3State.hitboxes;
            }
          } catch (err) {
            renderV3BridgeScene(activeCtx, W, H, this.t, m || v3State, this.portalId, this);
          }
        } else {
          renderV3BridgeScene(activeCtx, W, H, this.t, m || v3State, this.portalId, this);
        }

        if (m && (!m.hitboxes || !m.hitboxes.length) && this.state.showCaptions !== false) {
          this._ensureV3Hitboxes(v3Sc);
        }
        activeCtx.restore();
        renderToastOverlay(activeCtx, toast, nowMs || performance.now(), v3State);
        this.framesRendered += 1;
        return;
      }

      var isV2 = this.isV2Active();
      var sc = this.getScene(this.portalId, isV2 ? "v2" : "v1");
      var renderState = this._buildRenderState(isV2);

      if (sc && typeof sc.render === "function") {
        try {
          sc.render(activeCtx, W, H, this.t, renderState);
        } catch (err2) {
          renderFallbackCockpit(activeCtx, W, H, this.t, renderState, this);
        }
      } else {
        renderFallbackCockpit(activeCtx, W, H, this.t, renderState, this);
      }
      activeCtx.restore();

      renderToastOverlay(activeCtx, toast, nowMs || performance.now(), renderState);
      this.framesRendered += 1;
    },

    _hitTestV3Canvas: function (x, y) {
      var m = this._ensureMachine();
      if (!m) return null;
      var v3Sc = this.getScene(this.portalId, "v3");
      this._ensureV3Hitboxes(v3Sc);
      var hb = m.hitTest(x, y);
      if (hb) return hb;

      // Also hit-test diegetic world anchor circles in root / showcase
      if (m.phase === "root" || m.phase === "showcase") {
        var tree = this.getBranchTree(this.portalId);
        if (tree && tree.buttons) {
          var keys = ["x", "o", "triangle", "square"];
          for (var i = 0; i < keys.length; i++) {
            var bk = keys[i];
            var anc = tree.buttons[bk] && tree.buttons[bk].anchor;
            if (!anc) continue;
            var dx = x - anc.x;
            var dy = y - anc.y;
            if (dx * dx + dy * dy <= 52 * 52) {
              return { kind: "button", button: bk, anchor: anc };
            }
          }
        }
      }
      return null;
    },

    _bindCanvasPointer: function (canvas) {
      var self = this;

      canvas.onmousemove = function (ev) {
        if (!self.active || !self.isV3Active()) {
          canvas.style.cursor = "pointer";
          return;
        }
        var rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        var x = ((ev.clientX - rect.left) / rect.width) * W;
        var y = ((ev.clientY - rect.top) / rect.height) * H;
        var hit = self._hitTestV3Canvas(x, y);
        canvas.style.cursor = hit ? "pointer" : "default";
      };

      canvas.onclick = function (ev) {
        if (!self.active) return;
        var rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        var x = ((ev.clientX - rect.left) / rect.width) * W;
        var y = ((ev.clientY - rect.top) / rect.height) * H;

        if (self.isV3Active()) {
          var m = self._ensureMachine();
          var hit = self._hitTestV3Canvas(x, y);
          if (hit) {
            if (hit.kind === "button") self.selectButton(hit.button);
            else if (hit.kind === "tier") self.selectTier(hit.tier);
            else if (hit.kind === "rewind") self.rewindFork();
            else if (hit.kind === "root") self.resetToRoot();
            else if (hit.kind === "random") self.rollFate();
            else if (hit.kind === "matrix") self.jumpToBranch(hit.button, hit.tier);
            return;
          }
          if (m && m.phase === "showcase") {
            self.resetToRoot();
            return;
          }
          if (m && m.phase === "stem" && m.phaseT > 0.2) {
            m.pressButton(m.selectedButton);
            notifyAllSubscribers(self);
            self.renderNow();
            return;
          }
          return;
        }

        var isV2 = self.isV2Active();
        if (isV2) {
          if (y >= 590 && x >= 18 && x <= 320 && self.state.showCaptions !== false) {
            var boxIdx = Math.min(3, Math.max(0, Math.floor((x - 18) / 74)));
            var vNames = ["real", "turkey", "trout", "alien"];
            self.setView(vNames[boxIdx]);
            return;
          }
          if (y > 638) {
            self.toggleCaptions();
            return;
          }
          self.flipView();
          return;
        }

        // V1 Setup-A Cockpit hit zones
        if (
          window.SNAIL_MAIL &&
          typeof window.SNAIL_MAIL.hitTest === "function" &&
          window.SNAIL_MAIL.hitTest(x, y, self.t, self._buildRenderState(false), self.getScene(self.portalId, "v1"))
        ) {
          self.sendSnailMail();
          return;
        }
        var dx = x - 640;
        var dy = y - 255;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= 175 && dist <= 238) { self.rollDie(); return; }
        if (dist < 175) { self.flipView(); return; }
        if (y > 536) { self.toggleCaptions(); return; }
        if (x < 430 && y >= 320) { self.toggleBallast(); return; }
        if (x > 850 && y >= 320) { self.toggleLamp(); return; }
        if (x >= 430 && x <= 850 && y >= 410) { self.rollDie(); return; }
        self.flipView();
      };
    },

    handleKeyDown: function (ev) {
      if (!this.active) return false;
      var tag = ev.target && ev.target.tagName ? ev.target.tagName.toUpperCase() : "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return false;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return false;

      var k = ev.key;
      var code = ev.code;

      if (k === "v" || k === "V" || code === "KeyV") {
        ev.preventDefault();
        this.toggleEdition();
        return true;
      }
      if (k === "c" || k === "C" || code === "KeyC") {
        ev.preventDefault();
        this.toggleCaptions();
        return true;
      }
      if (k === "m" || k === "M" || code === "KeyM") {
        ev.preventDefault();
        this.toggleMute();
        return true;
      }

      if (this.isV3Active()) {
        var m = this._ensureMachine();
        var phase = m ? m.phase : "root";

        if (k === "Backspace" || code === "Backspace") {
          ev.preventDefault();
          this.rewindFork();
          return true;
        }
        if (k === "r" || k === "R" || code === "KeyR") {
          ev.preventDefault();
          this.rollFate();
          return true;
        }
        if (k === "a" || k === "A" || code === "KeyA") {
          ev.preventDefault();
          this.toggleShowcase();
          return true;
        }
        // Stage-2 dedicated tier hotkeys Q / W / E
        if (k === "q" || k === "Q" || code === "KeyQ") {
          ev.preventDefault();
          this.selectTier("probable");
          return true;
        }
        if (k === "w" || k === "W" || code === "KeyW") {
          ev.preventDefault();
          this.selectTier("plausible");
          return true;
        }
        if (k === "e" || k === "E" || code === "KeyE") {
          ev.preventDefault();
          this.selectTier("preposterous");
          return true;
        }
        // Context-aware number keys 1..4 (Stage 1: ✕ ○ △ □ | Stage 2 tier_select: Probable / Plausible / Preposterous / Rewind)
        if (k === "1") {
          ev.preventDefault();
          if (phase === "tier_select") this.selectTier("probable");
          else this.selectButton("x");
          return true;
        }
        if (k === "2") {
          ev.preventDefault();
          if (phase === "tier_select") this.selectTier("plausible");
          else this.selectButton("o");
          return true;
        }
        if (k === "3") {
          ev.preventDefault();
          if (phase === "tier_select") this.selectTier("preposterous");
          else this.selectButton("triangle");
          return true;
        }
        if (k === "4") {
          ev.preventDefault();
          if (phase === "tier_select") this.rewindFork();
          else this.selectButton("square");
          return true;
        }
        // PlayStation Face Button Hotkeys: X (✕), O (○), T (△), S (□)
        if (k === "x" || k === "X" || code === "KeyX") {
          ev.preventDefault();
          if (phase === "tier_select" || (phase === "stem" && m.selectedButton === "x")) this.pressButton("x");
          else this.selectButton("x");
          return true;
        }
        if (k === "o" || k === "O" || code === "KeyO") {
          ev.preventDefault();
          if (phase === "tier_select" || (phase === "stem" && m.selectedButton === "o")) this.pressButton("o");
          else this.selectButton("o");
          return true;
        }
        if (k === "t" || k === "T" || code === "KeyT") {
          ev.preventDefault();
          if (phase === "tier_select" || (phase === "stem" && m.selectedButton === "triangle")) this.pressButton("triangle");
          else this.selectButton("triangle");
          return true;
        }
        if (k === "s" || k === "S" || code === "KeyS") {
          ev.preventDefault();
          if (phase === "tier_select" || (phase === "stem" && m.selectedButton === "square")) this.pressButton("square");
          else this.selectButton("square");
          return true;
        }
        if (k === " " || k === "Spacebar" || code === "Space") {
          ev.preventDefault();
          if (phase === "stem" && m) {
            m.pressButton(m.selectedButton || "x");
            notifyAllSubscribers(this);
            this.renderNow();
          } else if (phase === "showcase") {
            this.resetToRoot();
          } else {
            this.togglePause();
          }
          return true;
        }
        return false;
      }

      // Legacy V2 / V1 Keyboard Shortcuts
      if (k === "l" || k === "L" || code === "KeyL") {
        ev.preventDefault();
        this.toggleLamp();
        return true;
      }
      if (k === "b" || k === "B" || code === "KeyB") {
        ev.preventDefault();
        this.toggleBallast();
        return true;
      }
      if (k === "s" || k === "S" || code === "KeyS") {
        ev.preventDefault();
        this.sendSnailMail();
        return true;
      }
      if (k === " " || k === "Spacebar" || code === "Space") {
        ev.preventDefault();
        this.flipView();
        return true;
      }
      if (k === "a" || k === "A" || code === "KeyA") {
        ev.preventDefault();
        this.setView("auto");
        return true;
      }
      if (k === "r" || k === "R" || code === "KeyR") {
        ev.preventDefault();
        this.rollDie();
        return true;
      }
      if (k >= "1" && k <= "6") {
        ev.preventDefault();
        this.rollDie(parseInt(k, 10));
        return true;
      }
      return false;
    },

    /* ---------- Tactile HTML Controller Deck + 4×3 Branching Tree Map ---------- */

    mountControllerDeck: function (containerEl, opts) {
      if (!containerEl) return null;
      injectDeckStyles();
      var cfg = opts || {};
      var self = this;
      var lastRenderedKey = "";

      function syncDeck() {
        var pid = self.portalId || 1;
        var ed = self.state.edition || "v3";
        var matrix = self.getDiscoveryMatrix(pid);
        var tree = self.getBranchTree(pid);
        var m = self._ensureMachine();
        var phase = (ed === "v3" && m) ? m.phase : ed;
        var selBtn = (ed === "v3" && m) ? m.selectedButton : null;
        var selTier = (ed === "v3" && m) ? m.selectedTier : null;

        var structKey = [
          pid, ed, phase, selBtn || "-", selTier || "-",
          matrix.unlockedCount, matrix.globalUnlockedCount,
          self.state.showCaptions ? "1" : "0",
          self.state.muted ? "1" : "0",
          self.gamepadConnected ? "gp1" : "gp0",
          self.state.lamp ? "l1" : "l0",
          self.state.ballast ? "b1" : "b0",
          self.state.view
        ].join("|");

        if (structKey === lastRenderedKey) return;
        lastRenderedKey = structKey;

        if (ed !== "v3") {
          containerEl.innerHTML = (
            '<div class="v3-deck-wrap">' +
              '<div class="v3-pad-shell">' +
                '<div class="v3-legacy-bar">' +
                  '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
                    '<button type="button" class="v3-util-btn on" data-act="ed-v3">🎮 Switch to V3 12-Branch Game [V]</button>' +
                    '<button type="button" class="v3-mini-btn" data-act="ed-cycle">[V] Edition: ' + (ed === "v2" ? "V2 Remake (16s)" : "V1 Cockpit (13s)") + '</button>' +
                    '<button type="button" class="v3-mini-btn" data-act="v-beat">[Space] Cycle A·B·C·D (' + escHtml(self.state.view) + ')</button>' +
                    '<button type="button" class="v3-mini-btn" data-act="v-lamp">[L] Lamp: ' + (self.state.lamp ? "ON" : "OFF") + '</button>' +
                    '<button type="button" class="v3-mini-btn" data-act="v-ballast">[B] Ballast: ' + (self.state.ballast ? "IN" : "OUT") + '</button>' +
                    '<button type="button" class="v3-mini-btn" data-act="v-snail">[S] Snail Mail</button>' +
                    '<button type="button" class="v3-mini-btn" data-act="v-roll">[R] 1d6</button>' +
                  '</div>' +
                  '<div style="display:flex;gap:6px">' +
                    '<button type="button" class="v3-mini-btn" data-act="captions">[C] ' + (self.state.showCaptions !== false ? "Captions" : "BLIND") + '</button>' +
                    '<button type="button" class="v3-mini-btn" data-act="mute">[M] ' + (self.state.muted ? "Muted" : "Sound") + '</button>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>'
          );
          bindDeckActions();
          return;
        }

        var stageBadgeTxt = "Stage 1: Choose ✕ / ○ / △ / □ Action";
        var stageBadgeCls = "v3-stage-pill";
        var stageSubTxt = (tree && tree.clue) ? ("Prop: " + tree.clue) : "Pick a submarine or courier move you can see!";

        if (phase === "stem" && selBtn && tree && tree.buttons[selBtn]) {
          stageBadgeTxt = "Stage 1: " + BTN_SYMBOLS[selBtn] + " " + tree.buttons[selBtn].shortLabel + " → Stage 2 Ready";
          stageSubTxt = tree.buttons[selBtn].physicalStem || "Now choose Probable, Plausible, or Preposterous!";
        } else if (phase === "tier_select" && selBtn && tree && tree.buttons[selBtn]) {
          stageBadgeTxt = "Stage 2: Choose Probable / Plausible / Preposterous Outcome";
          stageBadgeCls = "v3-stage-pill ph-tier";
          stageSubTxt = "After [" + BTN_SYMBOLS[selBtn] + " " + tree.buttons[selBtn].shortLabel + "] — choose who answers!";
        } else if (phase === "outcome" && selBtn && selTier && tree && tree.branches[selBtn]) {
          var outObj = tree.branches[selBtn][selTier] || {};
          stageBadgeTxt = "Outcome Playing: Rewind or Pick Next Branch";
          stageBadgeCls = "v3-stage-pill ph-outcome";
          stageSubTxt = "[" + BTN_SYMBOLS[selBtn] + " → " + selTier.toUpperCase() + "] " + (outObj.title || "") + (outObj.caption ? " — " + outObj.caption : "");
        } else if (phase === "showcase") {
          stageBadgeTxt = "Showcase (0:18): Press ✕ / ○ / △ / □ to Play";
          stageBadgeCls = "v3-stage-pill ph-showcase";
          stageSubTxt = "Watching 18.0s branching showcase — click any button or 4×3 cell to take live control!";
        }

        // Build 4 PlayStation Face Buttons
        var faceHtml = "";
        var bOrder = ["x", "o", "triangle", "square"];
        for (var bi = 0; bi < bOrder.length; bi++) {
          var bKey = bOrder[bi];
          var bInfo = (tree && tree.buttons && tree.buttons[bKey]) || { shortLabel: bKey, actionPrompt: "" };
          var isSel = (selBtn === bKey && phase !== "showcase");
          var dotsHtml = "";
          var tOrder = ["probable", "plausible", "preposterous"];
          for (var d = 0; d < 3; d++) {
            var isU = self.isBranchUnlocked(pid, bKey, tOrder[d]);
            dotsHtml += '<i class="' + (isU ? "u" : "") + '"></i>';
          }
          faceHtml += (
            '<button type="button" class="v3-face-btn' + (isSel ? " selected" : "") + '" id="ctrlBtn-' + bKey + '" data-v3-btn="' + bKey + '" style="--btn-col:' + BTN_COLORS[bKey] + '">' +
              '<span class="v3-cap" aria-hidden="true">' + svgSymbolMarkup(bKey, 18) + '</span>' +
              '<span style="min-width:0">' +
                '<span class="v3-face-title"><span>' + escHtml(bInfo.shortLabel) + '</span><span class="v3-kbd">' + BTN_HOTKEYS[bKey] + '</span></span>' +
                '<span class="v3-face-sub">' + escHtml(bInfo.actionPrompt) + '</span>' +
                '<span class="v3-dots3" aria-hidden="true">' + dotsHtml + '</span>' +
              '</span>' +
            '</button>'
          );
        }

        // Build 3 Stage-2 Outcome Tier Buttons + Utility Cluster
        var previewBtnKey = selBtn || "x";
        var tierConfigs = [
          { key: "probable", label: "Probable · Turkey", col: COL_PROBABLE, hi: "#7dd3fc" },
          { key: "plausible", label: "Plausible · Trout", col: COL_PLAUSIBLE_DEEP, hi: "#6ee7b7" },
          { key: "preposterous", label: "Preposterous · Alien", col: COL_PREPOSTEROUS_RUST, hi: "#fda4af" }
        ];
        var tiersHtml = "";
        for (var ti = 0; ti < tierConfigs.length; ti++) {
          var tc = tierConfigs[ti];
          var brPreview = (tree && tree.branches && tree.branches[previewBtnKey] && tree.branches[previewBtnKey][tc.key]) || {};
          var isTierActive = (phase === "outcome" && selTier === tc.key);
          var isTierReady = (phase === "tier_select" || phase === "stem");
          var unlMark = self.isBranchUnlocked(pid, previewBtnKey, tc.key) ? "✓ " : "";
          tiersHtml += (
            '<button type="button" class="v3-tier-btn' + (isTierActive ? " active" : (isTierReady ? " ready" : "")) + '" id="ctrlTier-' + tc.key + '" data-v3-tier="' + tc.key + '" style="--tier-col:' + tc.col + ';--tier-hi:' + tc.hi + '">' +
              '<span class="v3-tier-top"><span>' + unlMark + escHtml(tc.label) + '</span><span class="v3-kbd">' + TIER_HOTKEYS[tc.key] + '</span></span>' +
              '<span class="v3-tier-preview">' + BTN_SYMBOLS[previewBtnKey] + ' → ' + escHtml(brPreview.title || tc.label) + '</span>' +
            '</button>'
          );
        }

        // Build 4×3 Interactive Branching Tree Matrix
        var matrixHtml = "";
        if (cfg.showTreeMatrix !== false) {
          var rowsMarkup = "";
          for (var r = 0; r < matrix.rows.length; r++) {
            var row = matrix.rows[r];
            var bPrompt = (tree && tree.buttons && tree.buttons[row.button] && tree.buttons[row.button].actionPrompt) || "";
            rowsMarkup += (
              '<button type="button" class="v3-m-rowstub" data-v3-btn="' + row.button + '" style="--bcol:' + row.color + '" title="Stage 1: ' + escHtml(row.shortLabel) + '">' +
                '<span class="v3-m-sym" aria-hidden="true">' + svgSymbolMarkup(row.button, 14) + '</span>' +
                '<span style="min-width:0">' +
                  '<strong style="display:block;font-size:13px;line-height:1.2">' + escHtml(row.shortLabel) + '</strong>' +
                  '<span style="display:block;font-family:\'JetBrains Mono\',monospace;font-size:10px;color:#5b5348;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(bPrompt) + '</span>' +
                '</span>' +
              '</button>'
            );
            for (var c = 0; c < row.cells.length; c++) {
              var cell = row.cells[c];
              var isPlayingCell = (phase === "outcome" && selBtn === cell.button && selTier === cell.tier);
              var tCol = cell.tier === "probable" ? COL_PROBABLE : (cell.tier === "plausible" ? COL_PLAUSIBLE_DEEP : COL_PREPOSTEROUS_RUST);
              rowsMarkup += (
                '<button type="button" class="v3-m-cell' + (cell.unlocked ? " unlocked" : "") + (isPlayingCell ? " playing" : "") + '" ' +
                  'data-v3-branch="' + cell.id + '" data-btn="' + cell.button + '" data-tier="' + cell.tier + '" style="--tcol:' + tCol + '">' +
                  '<span class="v3-m-tag">' +
                    '<span>' + cell.buttonSymbol + ' · ' + escHtml(cell.tier) + '</span>' +
                    '<span>' + (isPlayingCell ? "▶ PLAYING" : (cell.unlocked ? "✓ UNLOCKED" : "CLICK TO PLAY")) + '</span>' +
                  '</span>' +
                  '<span class="v3-m-title">' + escHtml(cell.unlocked || isPlayingCell || cfg.revealAllTitles ? cell.title : ("Discover " + cell.buttonSymbol + " → " + cell.tier.charAt(0).toUpperCase() + cell.tier.slice(1))) + '</span>' +
                  (cell.unlocked || isPlayingCell ? '<span class="v3-m-cap">' + escHtml(cell.caption) + '</span>' : '') +
                '</button>'
              );
            }
          }

          matrixHtml = (
            '<div class="v3-matrix-card">' +
              '<div class="v3-matrix-head">' +
                '<h4>4 × 3 Interactive Branching Tree · ' + escHtml(self.station) + '</h4>' +
                '<span class="v3-matrix-prog">Porthole: ' + matrix.unlockedCount + ' / 12 Endings · All 55 Portholes: ' + matrix.globalUnlockedCount + ' / 660 Unlocked</span>' +
              '</div>' +
              '<div class="v3-matrix-grid">' +
                '<div class="v3-m-colhead" style="--tcol:#14110d">Stage 1 · Button</div>' +
                '<div class="v3-m-colhead" style="--tcol:' + COL_PROBABLE + '">Probable · Turkey (1–2)</div>' +
                '<div class="v3-m-colhead" style="--tcol:' + COL_PLAUSIBLE_DEEP + '">Plausible · Trout + Snail (3–4)</div>' +
                '<div class="v3-m-colhead" style="--tcol:' + COL_PREPOSTEROUS_RUST + '">Preposterous · Alien Saucer (5–6)</div>' +
                rowsMarkup +
              '</div>' +
            '</div>'
          );
        }

        containerEl.innerHTML = (
          '<div class="v3-deck-wrap">' +
            '<div class="v3-pad-shell">' +
              '<div class="v3-pad-top">' +
                '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-width:0">' +
                  '<span class="' + stageBadgeCls + '" id="ctrlStageBadge">' + escHtml(stageBadgeTxt) + '</span>' +
                  '<span class="v3-stage-msg" id="ctrlStageMsg">' + escHtml(stageSubTxt) + '</span>' +
                '</div>' +
                '<div class="v3-pad-meta">' +
                  '<span class="v3-gp-badge' + (self.gamepadConnected ? " live" : "") + '">' +
                    (self.gamepadConnected ? "🎮 Gamepad Live" : "🎮 DualSense / Pad Ready") +
                  '</span>' +
                  '<button type="button" class="v3-mini-btn" data-act="ed-cycle" title="Switch V3 Branching / V2 Remake / V1 Cockpit">[V] V3 12-Branch ⇄ V2/V1</button>' +
                  '<button type="button" class="v3-mini-btn' + (self.state.showCaptions !== false ? " on" : "") + '" data-act="captions">[C] ' + (self.state.showCaptions !== false ? "HUD On" : "Blind") + '</button>' +
                  '<button type="button" class="v3-mini-btn' + (!self.state.muted ? " on" : "") + '" data-act="mute">[M] ' + (self.state.muted ? "Muted" : "Sound") + '</button>' +
                '</div>' +
              '</div>' +
              '<div class="v3-face-grid" role="group" aria-label="Stage 1 Submarine and Courier Face Buttons">' +
                faceHtml +
              '</div>' +
              '<div class="v3-tier-bar" role="group" aria-label="Stage 2 Outcome Tiers and Transport">' +
                tiersHtml +
                '<div class="v3-util-cluster">' +
                  '<button type="button" class="v3-util-btn" id="ctrlRollFate" data-act="roll-fate" title="Shortcut: R">🎲 Roll Fate [R]</button>' +
                  '<button type="button" class="v3-util-btn" id="ctrlRewind" data-act="rewind" title="Shortcut: Backspace">↺ Rewind [Bksp]</button>' +
                  '<button type="button" class="v3-util-btn' + (phase === "showcase" ? " on" : "") + '" id="ctrlShowcase" data-act="showcase" title="Shortcut: A">▶ Showcase 18s [A]</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
            matrixHtml +
          '</div>'
        );

        bindDeckActions();
      }

      function bindDeckActions() {
        function preInteract() {
          if (typeof cfg.onBeforeInteract === "function") {
            try { cfg.onBeforeInteract(); } catch (e) {}
          }
        }
        containerEl.querySelectorAll("[data-v3-btn]").forEach(function (b) {
          b.onclick = function () {
            preInteract();
            var bk = b.getAttribute("data-v3-btn");
            var m = self._ensureMachine();
            if (m && m.phase === "stem" && m.selectedButton === bk && m.phaseT > 0.15) {
              self.pressButton(bk);
            } else {
              self.selectButton(bk);
            }
          };
        });
        containerEl.querySelectorAll("[data-v3-tier]").forEach(function (tb) {
          tb.onclick = function () {
            preInteract();
            self.selectTier(tb.getAttribute("data-v3-tier"));
          };
        });
        containerEl.querySelectorAll("[data-v3-branch]").forEach(function (cellBtn) {
          cellBtn.onclick = function () {
            preInteract();
            self.jumpToBranch(cellBtn.getAttribute("data-btn"), cellBtn.getAttribute("data-tier"));
          };
        });
        containerEl.querySelectorAll("[data-act]").forEach(function (ab) {
          ab.onclick = function () {
            var act = ab.getAttribute("data-act");
            if (act === "roll-fate" || act === "rewind" || act === "showcase" || act === "ed-v3") preInteract();
            if (act === "roll-fate") self.rollFate();
            else if (act === "rewind") self.rewindFork();
            else if (act === "showcase") self.toggleShowcase();
            else if (act === "ed-cycle") self.toggleEdition();
            else if (act === "ed-v3") self.setEdition("v3");
            else if (act === "captions") self.toggleCaptions();
            else if (act === "mute") self.toggleMute();
            else if (act === "v-beat") self.flipView();
            else if (act === "v-lamp") self.toggleLamp();
            else if (act === "v-ballast") self.toggleBallast();
            else if (act === "v-snail") self.sendSnailMail();
            else if (act === "v-roll") self.rollDie();
          };
        });
      }

      // Replace any previous subscription on the same container element
      for (var i = mountedDecks.length - 1; i >= 0; i--) {
        if (mountedDecks[i].el === containerEl) mountedDecks.splice(i, 1);
      }
      var handle = { el: containerEl, sync: syncDeck };
      mountedDecks.push(handle);
      syncDeck();
      return handle;
    },

    isBranchUnlocked: function (portalId, btnKey, tierKey) {
      if (window.BRANCH_GAME && window.BRANCH_GAME.discovery) {
        return window.BRANCH_GAME.discovery.isUnlocked(portalId || this.portalId, btnKey, tierKey);
      }
      return false;
    },

    getSnapshot: function () {
      var m = this.machine;
      return {
        active: this.active,
        edition: this.state.edition,
        loopDuration: this.getActiveDuration(),
        portalId: this.portalId,
        station: this.station,
        clue: this.clue,
        turkeyFork: this.turkeyFork,
        troutFork: this.troutFork,
        alienFork: this.alienFork,
        defaultTool: this.defaultTool,
        t: Number(this.t.toFixed(3)),
        fps: this.fps,
        framesRendered: this.framesRendered,
        actionCount: this.actionCount,
        lastAction: this.lastAction,
        gamepadConnected: this.gamepadConnected,
        v3: m ? {
          phase: m.phase,
          selectedButton: m.selectedButton,
          selectedTier: m.selectedTier,
          unlockedCount: this.getUnlockedCount(this.portalId),
          globalUnlockedCount: this.getGlobalUnlockedCount()
        } : null,
        state: {
          edition: this.state.edition,
          lamp: this.state.lamp,
          ballast: this.state.ballast,
          view: this.state.view,
          roll: this.state.roll,
          tier: this.state.tier,
          routeMarked: this.state.routeMarked,
          showCaptions: this.state.showCaptions,
          muted: this.state.muted,
          paused: this.state.paused,
          snailActive: !!this.state.snailActive,
          snailT: Number((this.state.snailT || 0).toFixed(3)),
          snailDelivered: !!this.state.snailDelivered,
          snailCount: this.state.snailCount || 0,
          snailNote: this.state.snailNote || ""
        }
      };
    }
  };

  window.addEventListener("keydown", function (ev) {
    game.handleKeyDown(ev);
  });

  window.addEventListener("gamepadconnected", function (ev) {
    game.gamepadConnected = true;
    game.gamepadId = (ev && ev.gamepad && ev.gamepad.id) || "Gamepad";
    notifyAllSubscribers(game);
  });

  window.addEventListener("gamepaddisconnected", function () {
    game.gamepadConnected = false;
    notifyAllSubscribers(game);
  });

  window.__game = game;
  window.PORTAL_PLAYER = game;
})();
