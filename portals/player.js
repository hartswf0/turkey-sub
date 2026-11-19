/* ============================================================================
 * Turkey Sub · Multi-SCION Remake (V2 · 16.0s) & V1 Cockpit (13.0s) Runtime
 * File: portals/player.js  (window.__game)
 *
 * Runs BOLAS Oulipo Screening Room V2 Multi-SCION Remake rigs
 * (window.PORTAL_REMAKE_SCENES[1..55], default, LOOP_DUR = 16.0s) alongside
 * preserved V1 Setup-A Cockpits (window.PORTAL_V1_SCENES[1..55], 13.0s) at 60fps:
 *   - [V] Edition: V2 SCION Remake ⇄ V1 Cockpit
 *   - [Space] 4-Beat Cycle: A Real -> B Turkey -> C Trout -> D Alien -> Auto
 *   - [L] Lamp · [B] Ballast · [S] Snail Mail Postcard · [R] 1d6 · [C] Captions
 *   - Strict PAELEO Blind Invariant: 0 fillText/strokeText calls when
 *     state.showCaptions === false.
 * ============================================================================ */
(function () {
  "use strict";

  var W = 1280;
  var H = 720;
  var LOOP_DUR = 16.0;
  var V1_LOOP_DUR = 13.0;
  var SNAIL_TRIP_DUR = 2.6;
  var SNAIL_STORE_KEY = "turkey_sub_snail_mail_v1";

  var COL_REAL = "#14110d";
  var COL_PROBABLE = "#1d596e";     // B · Turkey
  var COL_PLAUSIBLE = "#0f8f80";    // C · Trout
  var COL_PREPOSTEROUS = "#d42a1e"; // D · Alien

  var audioCtx = null;
  var ambientNodes = null;

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
      g.gain.setTargetAtTime(0.028, ctx.currentTime, 0.25);

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

    [783.99, 1174.66, 1479.98].forEach(function (cf, ci) {
      var co = ctx.createOscillator();
      var cg = ctx.createGain();
      var tc = startAt + 0.42 + ci * 0.025;
      co.type = "sine";
      co.frequency.setValueAtTime(cf, tc);
      cg.gain.setValueAtTime(0.055 / (ci * 0.4 + 1), tc);
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
        bGain.exponentialRampToValueAtTime(0.001, now + 0.16);
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

  function renderToastOverlay(ctx, toast, nowMs, state) {
    if (!toast || nowMs > toast.until) return;
    if (state && state.showCaptions === false) return;
    var remain = Math.max(0, Math.min(1, (toast.until - nowMs) / 850));
    var alpha = remain < 0.3 ? remain / 0.3 : 1;
    ctx.save();
    ctx.globalAlpha = alpha * 0.94;
    ctx.font = "600 14px 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
    var txt = toast.text;
    var padX = 14;
    var tw = ctx.measureText(txt).width + padX * 2;
    var bx = 22;
    var by = 18;
    var bh = 30;
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
    t: 0.4,
    fps: 60,
    framesRendered: 0,
    actionCount: 0,
    lastAction: null,
    history: [],
    state: {
      edition: "v2", // "v2" (16.0s BOLAS Multi-SCION Remake, default) | "v1" (13.0s Setup-A Cockpit)
      lamp: true,
      ballast: false,
      view: "auto",  // "auto" | "real" | "turkey" | "trout" | "alien"
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

    isV2Active: function (id) {
      var target = id || this.portalId;
      if (this.state.edition === "v1") return false;
      return !!(window.PORTAL_REMAKE_SCENES && window.PORTAL_REMAKE_SCENES[target]);
    },

    getActiveDuration: function (id) {
      return this.isV2Active(id) ? LOOP_DUR : V1_LOOP_DUR;
    },

    getScene: function (id, editionOverride) {
      ensureV1Snapshot();
      var target = id || this.portalId;
      if (target === "intro" && window.TROUT_SUB_INTRO) return window.TROUT_SUB_INTRO;
      var ed = editionOverride || this.state.edition || "v2";
      if (ed === "v2" && window.PORTAL_REMAKE_SCENES && window.PORTAL_REMAKE_SCENES[target]) {
        return window.PORTAL_REMAKE_SCENES[target];
      }
      var v1Map = window.PORTAL_V1_SCENES || window.PORTAL_SCENES || {};
      return v1Map[target] || (window.PORTAL_REMAKE_SCENES && window.PORTAL_REMAKE_SCENES[target]) || null;
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
        color: color || "#14110d",
        until: performance.now() + 1080
      };
      if (typeof onUiSync === "function") onUiSync(this);
      this.renderNow();
    },

    setEdition: function (ed) {
      var nextEd = (ed === "v1") ? "v1" : "v2";
      this.state.edition = nextEd;
      this.loopDuration = this.getActiveDuration();
      this.t = 0.25;
      this.state.view = "auto";
      this.state.snailActive = false;
      if (nextEd === "v2" && window.SCION_STAGE && typeof window.SCION_STAGE.preloadPortalPlates === "function") {
        window.SCION_STAGE.preloadPortalPlates(this.portalId);
      }
      playSound("edition", nextEd === "v2", this.state.muted);
      this._recordAction(
        "edition:" + nextEd,
        nextEd === "v2"
          ? "[V] EDITION: V2 MULTI-SCION BOLAS REMAKE (16.0s)"
          : "[V] EDITION: V1 ORIGINAL SETUP-A COCKPIT (13.0s)",
        nextEd === "v2" ? COL_PREPOSTEROUS : COL_PROBABLE
      );
      return this.state.edition;
    },

    toggleEdition: function () {
      return this.setEdition(this.state.edition === "v2" ? "v1" : "v2");
    },

    loadPortal: function (id, seedFallback, initialEdition) {
      ensureV1Snapshot();
      var num = Math.max(1, Math.min(55, parseInt(id, 10) || 1));
      if (initialEdition === "v1" || initialEdition === "v2") {
        this.state.edition = initialEdition;
      }
      if (window.SCION_STAGE && typeof window.SCION_STAGE.preloadPortalPlates === "function") {
        var self = this;
        window.SCION_STAGE.preloadPortalPlates(num).then(function () {
          if (self.active && self.portalId === num) self.renderNow();
        }).catch(function () {});
      }

      var sc = this.getScene(num);
      var v1Sc = this.getScene(num, "v1");
      var stOpt = (window.STUDENT_OPTIONS && window.STUDENT_OPTIONS[num]) || null;
      var savedNote = loadPortalSnailNote(num);
      var alienLookup = (stOpt && stOpt.d) || (window.ALIEN_PASSES && window.ALIEN_PASSES[num]) || "";

      this.portalId = num;
      this.loopDuration = this.getActiveDuration(num);
      this.station = (sc && sc.station) || (stOpt && stOpt.station) || (seedFallback && seedFallback[0]) || ("#" + (num < 10 ? "0" + num : num));
      this.clue = (stOpt && stOpt.a) || (sc && sc.clue) || (seedFallback && seedFallback[1]) || "";
      this.turkeyFork = (stOpt && stOpt.b) || (v1Sc && v1Sc.turkeyFork) || (seedFallback && seedFallback[3]) || "";
      this.troutFork = (stOpt && stOpt.c) || (v1Sc && v1Sc.troutFork) || (seedFallback && seedFallback[4]) || "";
      this.alienFork = alienLookup;
      this.scionRule = (sc && sc.scionRule) || (seedFallback && seedFallback[5]) || "";
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
      toast = {
        text: this.station + " · " + (this.isV2Active(num) ? "V2 SCION REMAKE (16s)" : "V1 COCKPIT (13s)") + " · [V] EDITION · [SPACE] A·B·C·D",
        color: this.isV2Active(num) ? COL_PREPOSTEROUS : COL_PROBABLE,
        until: performance.now() + 1250
      };
      if (typeof onUiSync === "function") onUiSync(this);
      this.renderNow();
      return this.getSnapshot();
    },

    mount: function (canvas, id, seedFallback, uiCallback, initialEdition) {
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
      this.loadPortal(id, seedFallback, initialEdition);
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
          if (typeof onUiSync === "function") onUiSync(this);
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

    // [Space] cycles: A Real -> B Turkey -> C Trout -> D Alien -> Auto
    flipView: function () {
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
      playSound("captions", this.state.showCaptions, this.state.muted);
      this._recordAction(
        "captions:" + (this.state.showCaptions ? "on" : "off"),
        "[C] CAPTIONS · " + (this.state.showCaptions ? "BOLAS SLATE & 4-BOX STRIP VISIBLE" : "BLIND CRITIC MODE (0 TEXT CALLS)"),
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
      if (this.state.muted) stopAmbient();
      else if (this.active) startAmbient(false);
      if (typeof onUiSync === "function") onUiSync(this);
      return this.state.muted;
    },

    renderNow: function (nowMs) {
      if (!activeCtx || !activeCanvas) return;
      var isV2 = this.isV2Active();
      var sc = this.getScene(this.portalId, isV2 ? "v2" : "v1");
      var renderState = this._buildRenderState(isV2);

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
        var isV2 = self.isV2Active();

        if (isV2) {
          // Click on 4-box contact strip in bottom-left BOLAS slate -> jump directly to Variation I..IV
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

  window.__game = game;
  window.PORTAL_PLAYER = game;
})();
