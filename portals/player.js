/* ============================================================================
 * Turkey Sub · Wave 3 Video-to-Game 3-Pass Cockpit Runtime (portals/player.js)
 * Runs handmade SCION Setup-A scene modules (window.PORTAL_SCENES[1..55])
 * + 13.0s 3-Pass Snail Mail & Alien Listening Post layer (portals/snail-mail.js)
 * at 60fps in a live HTML5 <canvas>, with keyboard + pointer controls:
 *   - 1st Pass · Probable (Faces 1–2 · Teal #1d596e)   — Turkey Looks Out
 *   - 2nd Pass · Plausible (Faces 3–4 · Green #2d6846) — Trout Looks In
 *   - 3rd Pass · Preposterous (Faces 5–6 · Rust #9e3d1c) — Dear Alien Saucer
 * Includes per-porthole Snail Mail Postcard Dispatch persistence in localStorage,
 * procedural WebAudio cockpit + postal + cosmic saucer foley, and window.__game.
 * ============================================================================ */
(function () {
  "use strict";

  var W = 1280;
  var H = 720;
  var LOOP_DUR = 13.0;
  var SNAIL_TRIP_DUR = 2.6; // 2.6s interactive 3-stop Turkey -> Trout -> Dear Alien delivery
  var SNAIL_STORE_KEY = "turkey_sub_snail_mail_v1";

  var COL_PROBABLE = "#1d596e";     // 1–2 Teal (Turkey)
  var COL_PLAUSIBLE = "#2d6846";    // 3–4 Green (Trout)
  var COL_PREPOSTEROUS = "#9e3d1c"; // 5–6 Rust (Alien)

  var audioCtx = null;
  var ambientNodes = null;

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
      if (clean) {
        map[key] = clean;
      } else {
        delete map[key];
      }
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
        data[i] = last * 1.8;
      }
      var src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      var lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 260;

      var g = ctx.createGain();
      g.gain.value = 0.0001;
      g.gain.setTargetAtTime(0.035, ctx.currentTime, 0.25);

      src.connect(lp);
      lp.connect(g);
      g.connect(ctx.destination);
      src.start();
      ambientNodes = { src: src, gain: g, filter: lp };
    } catch (e) {}
  }

  // Synthesize cosmic tube-theremin warble + saucer telemetry pings + triangle postmark chord
  function scheduleAlienSaucerFoley(ctx, startAt) {
    // 1. Silky tube-theremin vibrato warble
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
    lfoG.gain.setValueAtTime(26.0, startAt);
    lfo.connect(lfoG);
    lfoG.connect(th.frequency);

    thG.gain.setValueAtTime(0.001, startAt);
    thG.gain.linearRampToValueAtTime(0.085, startAt + 0.09);
    thG.gain.exponentialRampToValueAtTime(0.0008, startAt + 0.72);
    th.connect(thG);
    thG.connect(ctx.destination);
    th.start(startAt);
    lfo.start(startAt);
    th.stop(startAt + 0.74);
    lfo.stop(startAt + 0.74);

    // 2. Saucer holographic telemetry scanner pips
    var scanFreqs = [1318.5, 1760.0, 1567.98, 2093.0];
    scanFreqs.forEach(function (f, i) {
      var po = ctx.createOscillator();
      var pg = ctx.createGain();
      var t0 = startAt + 0.12 + i * 0.075;
      po.type = "triangle";
      po.frequency.setValueAtTime(f, t0);
      pg.gain.setValueAtTime(0.055, t0);
      pg.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.065);
      po.connect(pg);
      pg.connect(ctx.destination);
      po.start(t0);
      po.stop(t0 + 0.07);
    });

    // 3. Cosmic triangle postmark chord
    [783.99, 1174.66, 1479.98].forEach(function (cf, ci) {
      var co = ctx.createOscillator();
      var cg = ctx.createGain();
      var tc = startAt + 0.42 + ci * 0.025;
      co.type = "sine";
      co.frequency.setValueAtTime(cf, tc);
      cg.gain.setValueAtTime(0.06 / (ci * 0.4 + 1), tc);
      cg.gain.exponentialRampToValueAtTime(0.0008, tc + 0.45);
      co.connect(cg);
      cg.connect(ctx.destination);
      co.start(tc);
      co.stop(tc + 0.47);
    });
  }

  function playSound(kind, detail, muted) {
    var ctx = ensureAudio(muted);
    if (!ctx) return;
    var now = ctx.currentTime;
    try {
      if (kind === "lamp") {
        // Brass toggle switch click + warm filament hum pulse
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(detail ? 980 : 1320, now);
        osc.frequency.exponentialRampToValueAtTime(detail ? 1560 : 620, now + 0.055);
        g.gain.setValueAtTime(0.16, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);

        if (detail) {
          var hum = ctx.createOscillator();
          var hg = ctx.createGain();
          hum.type = "sine";
          hum.frequency.setValueAtTime(220, now + 0.02);
          hum.frequency.exponentialRampToValueAtTime(293.66, now + 0.18);
          hg.gain.setValueAtTime(0.001, now + 0.02);
          hg.gain.linearRampToValueAtTime(0.06, now + 0.06);
          hg.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
          hum.connect(hg);
          hg.connect(ctx.destination);
          hum.start(now + 0.02);
          hum.stop(now + 0.25);
        }
      } else if (kind === "ballast") {
        // LEGO-like module slide & bread-tin socket clunk
        var bOsc = ctx.createOscillator();
        var bGain = ctx.createGain();
        bOsc.type = "sine";
        bOsc.frequency.setValueAtTime(detail ? 190 : 250, now);
        bOsc.frequency.exponentialRampToValueAtTime(detail ? 92 : 145, now + 0.14);
        bGain.gain.setValueAtTime(0.22, now);
        bGain.exponentialRampToValueAtTime(0.001, now + 0.16);
        bOsc.connect(bGain);
        bGain.connect(ctx.destination);
        bOsc.start(now);
        bOsc.stop(now + 0.17);

        var snap = ctx.createOscillator();
        var sg = ctx.createGain();
        snap.type = "square";
        snap.frequency.setValueAtTime(detail ? 520 : 390, now + 0.045);
        sg.gain.setValueAtTime(0.07, now + 0.045);
        sg.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        snap.connect(sg);
        sg.connect(ctx.destination);
        snap.start(now + 0.045);
        snap.stop(now + 0.095);
      } else if (kind === "snail") {
        // 1. Crisp postcard paper envelope slide into the 7:30 brass mail-hatch
        var sLen = Math.floor(ctx.sampleRate * 0.20);
        var sBuf = ctx.createBuffer(1, sLen, ctx.sampleRate);
        var sData = sBuf.getChannelData(0);
        for (var si = 0; si < sLen; si++) {
          var u = si / sLen;
          sData[si] = (Math.random() * 2 - 1) * Math.sin(u * Math.PI) * 0.55;
        }
        var nSrc = ctx.createBufferSource();
        nSrc.buffer = sBuf;
        var bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 2.4;
        bp.frequency.setValueAtTime(920, now);
        bp.frequency.exponentialRampToValueAtTime(2480, now + 0.18);
        var ng = ctx.createGain();
        ng.gain.setValueAtTime(0.18, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
        nSrc.connect(bp);
        bp.connect(ng);
        ng.connect(ctx.destination);
        nSrc.start(now);

        // Brass mail-hatch flap click
        var flap = ctx.createOscillator();
        var fg = ctx.createGain();
        flap.type = "triangle";
        flap.frequency.setValueAtTime(1180, now + 0.01);
        flap.frequency.exponentialRampToValueAtTime(740, now + 0.055);
        fg.gain.setValueAtTime(0.10, now + 0.01);
        fg.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        flap.connect(fg);
        fg.connect(ctx.destination);
        flap.start(now + 0.01);
        flap.stop(now + 0.065);

        // 2. Soft pearlescent glass-glide shimmer (7:30 -> 3:50 Trout)
        var glide = ctx.createOscillator();
        var gg = ctx.createGain();
        glide.type = "sine";
        glide.frequency.setValueAtTime(329.63, now + 0.14);
        glide.frequency.linearRampToValueAtTime(523.25, now + 1.05);
        gg.gain.setValueAtTime(0.001, now + 0.14);
        gg.gain.linearRampToValueAtTime(0.042, now + 0.36);
        gg.gain.exponentialRampToValueAtTime(0.001, now + 1.12);
        glide.connect(gg);
        gg.connect(ctx.destination);
        glide.start(now + 0.14);
        glide.stop(now + 1.14);

        // 3. Tiny brass postal-bell chime on Trout handoff (~1.12s)
        [
          { f: 1046.50, dt: 1.10, a: 0.12, dur: 0.40 },
          { f: 1567.98, dt: 1.15, a: 0.09, dur: 0.38 }
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

        // 4. Cosmic saucer telemetry & triangle postmark chime on Dear Alien arrival (~1.90s)
        scheduleAlienSaucerFoley(ctx, now + 1.88);
      } else if (kind === "alien") {
        scheduleAlienSaucerFoley(ctx, now);
      } else if (kind === "view") {
        // Across-the-glass perspective cut chime
        var notes = detail === "trout"
          ? [392.0, 587.33]
          : (detail === "turkey" ? [440.0, 523.25] : [392.0, 493.88]);
        notes.forEach(function (freq, idx) {
          var o = ctx.createOscillator();
          var gn = ctx.createGain();
          o.type = "sine";
          var st = now + idx * 0.065;
          o.frequency.setValueAtTime(freq, st);
          gn.gain.setValueAtTime(0.11, st);
          gn.gain.exponentialRampToValueAtTime(0.001, st + 0.26);
          o.connect(gn);
          gn.connect(ctx.destination);
          o.start(st);
          o.stop(st + 0.28);
        });
      } else if (kind === "roll") {
        // 4 rattle clicks + 1d6 tier brass bell chime
        for (var k = 0; k < 4; k++) {
          var tick = ctx.createOscillator();
          var tg = ctx.createGain();
          var t0 = now + k * 0.042;
          tick.type = "triangle";
          tick.frequency.setValueAtTime(700 + k * 140, t0);
          tg.gain.setValueAtTime(0.08, t0);
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
          bg.gain.setValueAtTime(0.13 / (i + 1), bs);
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
        cg.gain.setValueAtTime(0.07, now);
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
    if (r <= 2) return "Turkey · 1st Pass";
    if (r <= 4) return "Trout · 2nd Pass";
    return "Dear Alien · 3rd Pass";
  }

  function tierColor(r) {
    if (!r || r < 1) return "#6b767c";
    if (r <= 2) return COL_PROBABLE;
    if (r <= 4) return COL_PLAUSIBLE;
    return COL_PREPOSTEROUS;
  }

  // Fallback Setup-A renderer if a scene script is still loading or missing
  function renderFallbackCockpit(ctx, width, height, t, state, meta) {
    ctx.save();
    ctx.fillStyle = "#132427";
    ctx.fillRect(0, 0, width, 536);

    ctx.strokeStyle = "#1f383d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(640, 268, 595, 248, 0, 0, Math.PI * 2);
    ctx.stroke();

    var cx = 640, cy = 255, r = 185;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    var grad = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
    grad.addColorStop(0, state.lamp ? "#245c6e" : "#102a33");
    grad.addColorStop(1, "#0b1c22");
    ctx.fillStyle = grad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();

    ctx.strokeStyle = "#b8893a";
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 11, 0, Math.PI * 2);
    ctx.stroke();

    for (var i = 0; i < 6; i++) {
      var ang = -Math.PI / 2 + (i * Math.PI * 2) / 6;
      var bx = cx + Math.cos(ang) * (r + 11);
      var by = cy + Math.sin(ang) * (r + 11);
      ctx.fillStyle = (state.roll === i + 1) ? "#ffd86b" : "#785520";
      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    if (state.showCaptions !== false) {
      ctx.fillStyle = "#faf8f3";
      ctx.fillRect(0, 536, width, height - 536);
      ctx.fillStyle = "#14181a";
      ctx.font = "600 20px Georgia, serif";
      ctx.fillText((meta && meta.station ? meta.station + " — " : "") + (meta && meta.clue ? meta.clue : "Setup A Cockpit"), 36, 585);
    }
    ctx.restore();

    if (window.SNAIL_MAIL && typeof window.SNAIL_MAIL.drawCourier === "function") {
      window.SNAIL_MAIL.drawCourier(ctx, width, height, t, state, meta);
    }
  }

  // Subtle tactile feedback toast drawn on top of canvas (strictly hidden in blind-critic mode)
  function renderToastOverlay(ctx, toast, nowMs, state) {
    if (!toast || nowMs > toast.until) return;
    if (state && state.showCaptions === false) return;
    var remain = Math.max(0, Math.min(1, (toast.until - nowMs) / 850));
    var alpha = remain < 0.3 ? remain / 0.3 : 1;
    ctx.save();
    ctx.globalAlpha = alpha * 0.94;
    ctx.font = "600 15px ui-monospace, SFMono-Regular, Menlo, monospace";
    var txt = toast.text;
    var padX = 14;
    var tw = ctx.measureText(txt).width + padX * 2;
    var bx = 24;
    var by = 20;
    var bh = 32;
    ctx.fillStyle = "#faf8f3";
    ctx.strokeStyle = toast.color || "#14181a";
    ctx.lineWidth = 2;
    ctx.fillRect(bx, by, tw, bh);
    ctx.strokeRect(bx, by, tw, bh);
    ctx.fillStyle = toast.color || "#14181a";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(txt, bx + padX, by + bh / 2 + 0.5);
    ctx.restore();
  }

  var rafId = 0;
  var lastRafMs = 0;
  var activeCanvas = null;
  var activeCtx = null;
  var onUiSync = null;
  var toast = null;

  var game = {
    active: false,
    loopDuration: LOOP_DUR,
    portalId: 1,
    station: "#01 · Bow",
    clue: "",
    turkeyFork: "",
    troutFork: "",
    alienFork: "",
    scionRule: "",
    defaultTool: "lamp",
    t: 2.2,
    fps: 60,
    framesRendered: 0,
    actionCount: 0,
    lastAction: null,
    history: [],
    state: {
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

    getScene: function (id) {
      if (window.SNAIL_MAIL && typeof window.SNAIL_MAIL.attachAll === "function") {
        window.SNAIL_MAIL.attachAll();
      }
      var target = id || this.portalId;
      if (target === "intro" && window.TROUT_SUB_INTRO) return window.TROUT_SUB_INTRO;
      var scenes = window.PORTAL_SCENES || {};
      return scenes[target] || null;
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
        if (typeof onUiSync === "function") onUiSync(this);
        this.renderNow();
      }
      return clean;
    },

    _buildRenderState: function () {
      var rs = {
        lamp: !!this.state.lamp,
        ballast: !!this.state.ballast,
        view: this.state.view,
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
        t: Number(this.t.toFixed(2)),
        lamp: this.state.lamp,
        ballast: this.state.ballast,
        view: this.state.view,
        roll: this.state.roll,
        snailActive: this.state.snailActive,
        snailNote: this.state.snailNote,
        showCaptions: this.state.showCaptions
      });
      if (this.history.length > 30) this.history.shift();
      toast = {
        text: label,
        color: color || "#14181a",
        until: performance.now() + 1050
      };
      if (typeof onUiSync === "function") onUiSync(this);
      this.renderNow();
    },

    loadPortal: function (id, seedFallback) {
      if (window.SNAIL_MAIL && typeof window.SNAIL_MAIL.attachAll === "function") {
        window.SNAIL_MAIL.attachAll();
      }
      var num = Math.max(1, Math.min(55, parseInt(id, 10) || 1));
      var sc = this.getScene(num);
      var savedNote = loadPortalSnailNote(num);
      var alienLookup = (window.ALIEN_PASSES && window.ALIEN_PASSES[num]) ||
        (window.SNAIL_MAIL && typeof window.SNAIL_MAIL.getAlienFork === "function" ? window.SNAIL_MAIL.getAlienFork(num) : "");

      this.portalId = num;
      this.station = (sc && sc.station) || (seedFallback && seedFallback[0]) || ("#" + (num < 10 ? "0" + num : num));
      this.clue = (sc && sc.clue) || (seedFallback && seedFallback[1]) || "";
      this.turkeyFork = (sc && sc.turkeyFork) || (seedFallback && seedFallback[3]) || "";
      this.troutFork = (sc && sc.troutFork) || (seedFallback && seedFallback[4]) || "";
      this.alienFork = (sc && sc.alienFork) || alienLookup || "";
      this.scionRule = (sc && sc.scionRule) || (seedFallback && seedFallback[5]) || "";
      this.defaultTool = (sc && sc.defaultTool) || "lamp";

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
      toast = {
        text: "PORTAL " + this.station + " · 3-PASS READY (L / B / S / SPACE / R / C)",
        color: COL_PROBABLE,
        until: performance.now() + 1200
      };
      if (typeof onUiSync === "function") onUiSync(this);
      this.renderNow();
      return this.getSnapshot();
    },

    mount: function (canvas, id, seedFallback, uiCallback) {
      this.unmount();
      if (window.SNAIL_MAIL && typeof window.SNAIL_MAIL.attachAll === "function") {
        window.SNAIL_MAIL.attachAll();
      }
      activeCanvas = canvas;
      if (activeCanvas) {
        activeCanvas.width = W;
        activeCanvas.height = H;
        activeCtx = activeCanvas.getContext("2d");
        this._bindCanvasPointer(activeCanvas);
      }
      onUiSync = uiCallback || null;
      this.active = true;
      this.loadPortal(id, seedFallback);
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
      activeCanvas = null;
      activeCtx = null;
      onUiSync = null;
    },

    _advanceTime: function (dt) {
      if (this.state.snailActive) {
        var prevST = typeof this.state.snailT === "number" ? this.state.snailT : 0;
        var nextST = prevST + dt / SNAIL_TRIP_DUR;

        // Cut #1: Mail Snail crosses 7:30 -> 3:50 to Brook Trout (Plausible · 3–4 Green)
        if (prevST < 0.44 && nextST >= 0.44) {
          this.state.view = "trout";
          this.t = 6.4;
          this.state.routeMarked = true;
          this.state.snailDelivered = true;
          toast = {
            text: "2ND PASS · PLAUSIBLE (3–4) · TROUT STAMPS & CLIMBS TO ALIEN",
            color: COL_PLAUSIBLE,
            until: performance.now() + 1000
          };
          if (typeof onUiSync === "function") onUiSync(this);
        }

        // Cut #2: Mail Snail climbs right bezel to 12:00 Alien Saucer Pod (Preposterous · 5–6 Rust)
        if (prevST < 0.75 && nextST >= 0.75) {
          this.state.view = "alien";
          this.t = 10.4;
          this.state.routeMarked = true;
          this.state.snailDelivered = true;
          toast = {
            text: "3RD PASS · PREPOSTEROUS (5–6) · DEAR ALIEN SAUCER SCAN",
            color: COL_PREPOSTEROUS,
            until: performance.now() + 1150
          };
          if (typeof onUiSync === "function") onUiSync(this);
        }

        if (nextST >= 1.0) {
          this.state.snailT = 1.0;
          this.state.snailActive = false;
          this.state.snailDelivered = true;
          this.state.routeMarked = true;
          if (typeof onUiSync === "function") onUiSync(this);
        } else {
          this.state.snailT = nextST;
        }
      }

      if (this.state.view === "turkey") {
        // 1st Pass · Probable (1.8s .. 4.8s)
        var nextTk = this.t + dt;
        if (nextTk < 1.8 || nextTk >= 4.8) nextTk = 1.8 + ((nextTk - 1.8) % 3.0 + 3.0) % 3.0;
        this.t = nextTk;
      } else if (this.state.view === "trout") {
        // 2nd Pass · Plausible (5.2s .. 8.0s)
        var nextTr = this.t + dt;
        if (nextTr < 5.2 || nextTr >= 8.0) nextTr = 5.2 + ((nextTr - 5.2) % 2.8 + 2.8) % 2.8;
        this.t = nextTr;
      } else if (this.state.view === "alien") {
        // 3rd Pass · Preposterous / Dear Alien (9.1s .. 12.8s)
        var nextAl = this.t + dt;
        if (nextAl < 9.1 || nextAl >= 12.8) nextAl = 9.1 + ((nextAl - 9.1) % 3.7 + 3.7) % 3.7;
        this.t = nextAl;
      } else {
        var prevAutoT = this.t;
        this.t = (this.t + dt) % LOOP_DUR;
        if (this.t >= 5.0) this.state.routeMarked = true;
        // Subtle cosmic saucer foley when Auto 13s loop enters Pass 3 at t=8.85s
        if (prevAutoT < 8.85 && this.t >= 8.85 && this.active && !this.state.muted) {
          playSound("alien", true, this.state.muted);
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
      var clamped = Math.max(0, Math.min(LOOP_DUR - 0.001, Number(sec) || 0));
      this.t = clamped;
      if (typeof onUiSync === "function") onUiSync(this);
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

      this.state.view = "turkey";
      this.t = 3.85;
      this.state.paused = false;
      this.state.snailActive = true;
      this.state.snailT = 0.0;
      this.state.snailDelivered = false;
      this.state.snailCount = (this.state.snailCount || 0) + 1;

      playSound("snail", this.state.snailNote || true, this.state.muted);

      var notePreview = this.state.snailNote
        ? ('"' + (this.state.snailNote.length > 32 ? this.state.snailNote.slice(0, 32) + "…" : this.state.snailNote) + '"')
        : "TURKEY -> TROUT -> DEAR ALIEN";
      this._recordAction(
        "snail:" + this.state.snailCount,
        "[S] SNAIL MAIL · " + notePreview,
        COL_PROBABLE
      );
      return this.getSnapshot();
    },

    toggleLamp: function () {
      this.state.lamp = !this.state.lamp;
      playSound("lamp", this.state.lamp, this.state.muted);
      this._recordAction(
        "lamp:" + (this.state.lamp ? "on" : "off"),
        "[L] LAMP TOGGLE · " + (this.state.lamp ? "AIMED BEAM ON (2900K)" : "LAMP OFF"),
        this.state.lamp ? "#b8741a" : "#394246"
      );
      return this.state.lamp;
    },

    toggleBallast: function () {
      this.state.ballast = !this.state.ballast;
      playSound("ballast", this.state.ballast, this.state.muted);
      this._recordAction(
        "ballast:" + (this.state.ballast ? "on" : "off"),
        "[B] BALLAST SLOT · " + (this.state.ballast ? "FITTED (LOW SHELTER SIGHTLINE)" : "RELEASED TO BENCH"),
        this.state.ballast ? COL_PLAUSIBLE : "#394246"
      );
      return this.state.ballast;
    },

    setView: function (v) {
      var target = (v === "turkey" || v === "trout" || v === "alien" || v === "auto") ? v : "auto";
      this.state.view = target;
      this.state.snailActive = false;
      if (target === "turkey") {
        this.t = 2.8;
        playSound("view", "turkey", this.state.muted);
      } else if (target === "trout") {
        this.t = 6.4;
        this.state.routeMarked = true;
        playSound("view", "trout", this.state.muted);
      } else if (target === "alien") {
        this.t = 10.4;
        this.state.routeMarked = true;
        playSound("alien", true, this.state.muted);
      } else {
        playSound("view", "auto", this.state.muted);
      }

      var lbl = target === "turkey"
        ? "[SPACE] 1ST PASS · PROBABLE (1–2) · TURKEY LOOKING OUT"
        : (target === "trout"
          ? "[SPACE] 2ND PASS · PLAUSIBLE (3–4) · TROUT LOOKING IN"
          : (target === "alien"
            ? "[SPACE] 3RD PASS · PREPOSTEROUS (5–6) · DEAR ALIEN SAUCER"
            : "[A] AUTO 13s 3-PASS SNAIL MAIL CHAIN"));
      var col = target === "turkey"
        ? COL_PROBABLE
        : (target === "trout" ? COL_PLAUSIBLE : (target === "alien" ? COL_PREPOSTEROUS : "#14181a"));
      this._recordAction("view:" + target, lbl, col);
      return this.state.view;
    },

    // [Space] cycles: Turkey (Probable 1–2) -> Trout (Plausible 3–4) -> Alien (Preposterous 5–6) -> Auto
    flipView: function () {
      var cur = this.state.view;
      var next;
      if (cur === "turkey") {
        next = "trout";
      } else if (cur === "trout") {
        next = "alien";
      } else if (cur === "alien") {
        next = "auto";
      } else {
        next = "turkey";
      }
      return this.setView(next);
    },

    rollDie: function (forced) {
      var val = (forced >= 1 && forced <= 6)
        ? Math.floor(forced)
        : (1 + Math.floor(Math.random() * 6));
      this.state.roll = val;
      this.state.tier = tierForRoll(val);
      this.state.routeMarked = true;
      playSound("roll", val, this.state.muted);
      var voice = tierVoiceForRoll(val);
      this._recordAction(
        "roll:" + val,
        "[R] ROLLED 1d6 BOLT #" + val + " · " + this.state.tier.toUpperCase() + " (" + voice + ")",
        tierColor(val)
      );
      return val;
    },

    toggleCaptions: function () {
      this.state.showCaptions = !this.state.showCaptions;
      playSound("captions", this.state.showCaptions, this.state.muted);
      this._recordAction(
        "captions:" + (this.state.showCaptions ? "on" : "off"),
        "[C] CAPTIONS · " + (this.state.showCaptions ? "3-PASS STORY STRIP VISIBLE" : "BLIND CRITIC MODE (NO TEXT)"),
        COL_PLAUSIBLE
      );
      return this.state.showCaptions;
    },

    togglePause: function () {
      this.state.paused = !this.state.paused;
      this._recordAction(
        "pause:" + (this.state.paused ? "on" : "off"),
        this.state.paused ? "PAUSED FRAME" : "RESUMED 60FPS",
        "#14181a"
      );
      return this.state.paused;
    },

    toggleMute: function () {
      this.state.muted = !this.state.muted;
      if (this.state.muted) stopAmbient();
      else if (this.active) startAmbient(false);
      if (typeof onUiSync === "function") onUiSync(this);
      return this.state.muted;
    },

    renderNow: function (nowMs) {
      if (!activeCtx || !activeCanvas) return;
      var sc = this.getScene(this.portalId);
      var renderState = this._buildRenderState();

      activeCtx.save();
      activeCtx.setTransform(1, 0, 0, 1, 0, 0);
      activeCtx.globalAlpha = 1;
      activeCtx.globalCompositeOperation = "source-over";
      activeCtx.shadowBlur = 0;
      if (activeCtx.setLineDash) activeCtx.setLineDash([]);
      activeCtx.clearRect(0, 0, W, H);

      if (sc && typeof sc.render === "function") {
        try {
          sc.render(activeCtx, W, H, this.t, renderState);
        } catch (err) {
          renderFallbackCockpit(activeCtx, W, H, this.t, renderState, this);
        }
      } else {
        renderFallbackCockpit(activeCtx, W, H, this.t, renderState, this);
      }
      activeCtx.restore();

      renderToastOverlay(activeCtx, toast, nowMs || performance.now(), renderState);
      this.framesRendered += 1;
    },

    _bindCanvasPointer: function (canvas) {
      var self = this;
      canvas.onclick = function (ev) {
        if (!self.active) return;
        var rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        var x = ((ev.clientX - rect.left) / rect.width) * W;
        var y = ((ev.clientY - rect.top) / rect.height) * H;

        // 0. Mail Snail Courier, 7:30 hatch, 3:50 perch, or 12:00 Alien Pod -> Send Snail Mail!
        if (
          window.SNAIL_MAIL &&
          typeof window.SNAIL_MAIL.hitTest === "function" &&
          window.SNAIL_MAIL.hitTest(x, y, self.t, self._buildRenderState(), self.getScene(self.portalId))
        ) {
          self.sendSnailMail();
          return;
        }

        var dx = x - 640;
        var dy = y - 255;
        var dist = Math.sqrt(dx * dx + dy * dy);

        // 1. Porthole brass bolt ring -> Roll 1d6 bolt
        if (dist >= 175 && dist <= 238) {
          self.rollDie();
          return;
        }
        // 2. Inside porthole glass -> Cycle Turkey / Trout / Alien / Auto pass
        if (dist < 175) {
          self.flipView();
          return;
        }
        // 3. Lower story strip -> Toggle captions
        if (y > 536) {
          self.toggleCaptions();
          return;
        }
        // 4. Left cockpit zone -> Ballast module
        if (x < 430 && y >= 320) {
          self.toggleBallast();
          return;
        }
        // 5. Right cockpit zone -> Lamp toggle
        if (x > 850 && y >= 320) {
          self.toggleLamp();
          return;
        }
        // 6. Center chalk chart under glass -> Roll 1d6 & mark route
        if (x >= 430 && x <= 850 && y >= 410) {
          self.rollDie();
          return;
        }
        // Default: cycle 3-pass view
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
      if (k >= "1" && k <= "6") {
        ev.preventDefault();
        this.rollDie(parseInt(k, 10));
        return true;
      }
      return false;
    },

    getSnapshot: function () {
      return {
        active: this.active,
        loopDuration: LOOP_DUR,
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
        state: {
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
  }, true);

  window.addEventListener("keyup", function (ev) {
    if (game.active && (ev.key === " " || ev.key === "Spacebar" || ev.code === "Space")) {
      var tag = ev.target && ev.target.tagName ? ev.target.tagName.toUpperCase() : "";
      if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
        ev.preventDefault();
      }
    }
  }, true);

  window.__game = game;
  window.TROUT_PORTAL_PLAYER = game;
})();
