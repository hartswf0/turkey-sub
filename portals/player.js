/* ============================================================================
 * Turkey Sub · Video-to-Game Interactive Cockpit Runtime (portals/player.js)
 * Runs handmade SCION Setup-A scene modules (window.PORTAL_SCENES[1..55])
 * at 60fps in a live HTML5 <canvas>, with keyboard + pointer controls,
 * procedural WebAudio cockpit foley, and inspectable window.__game state.
 * ============================================================================ */
(function () {
  "use strict";

  var W = 1280;
  var H = 720;
  var LOOP_DUR = 10.0;

  var audioCtx = null;
  var ambientNodes = null;

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
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
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
      } else if (kind === "view") {
        // Across-the-glass perspective cut chime
        var notes = detail === "trout" ? [392.0, 587.33] : (detail === "turkey" ? [440.0, 329.63] : [392.0, 493.88]);
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

  function tierColor(r) {
    if (!r || r < 1) return "#6b767c";
    if (r <= 2) return "#1d596e";
    if (r <= 4) return "#2d6846";
    return "#9e3d1c";
  }

  // Fallback Setup-A renderer if a scene script is still loading or missing
  function renderFallbackCockpit(ctx, width, height, t, state, meta) {
    ctx.save();
    ctx.fillStyle = "#132427";
    ctx.fillRect(0, 0, width, 536);

    // Subtle bread-tin ribs & right-side dent
    ctx.strokeStyle = "#1f383d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(640, 268, 595, 248, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Porthole water
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

    // Brass rim + 6 bolts + 2-o'clock chip
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
  }

  // Subtle tactile feedback toast drawn on top of canvas for 0.85s after key/click
  function renderToastOverlay(ctx, toast, nowMs, state) {
    if (!toast || nowMs > toast.until) return;
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
    portalId: 1,
    station: "#01 · Bow",
    clue: "",
    turkeyFork: "",
    troutFork: "",
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
      paused: false
    },

    getScene: function (id) {
      var target = id || this.portalId;
      if (target === "intro" && window.TROUT_SUB_INTRO) return window.TROUT_SUB_INTRO;
      var scenes = window.PORTAL_SCENES || {};
      return scenes[target] || null;
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
        showCaptions: this.state.showCaptions
      });
      if (this.history.length > 30) this.history.shift();
      toast = {
        text: label,
        color: color || "#14181a",
        until: performance.now() + 950
      };
      if (typeof onUiSync === "function") onUiSync(this);
      this.renderNow();
    },

    loadPortal: function (id, seedFallback) {
      var num = Math.max(1, Math.min(55, parseInt(id, 10) || 1));
      var sc = this.getScene(num);
      this.portalId = num;
      this.station = (sc && sc.station) || (seedFallback && seedFallback[0]) || ("#" + (num < 10 ? "0" + num : num));
      this.clue = (sc && sc.clue) || (seedFallback && seedFallback[1]) || "";
      this.turkeyFork = (sc && sc.turkeyFork) || (seedFallback && seedFallback[3]) || "";
      this.troutFork = (sc && sc.troutFork) || (seedFallback && seedFallback[4]) || "";
      this.scionRule = (sc && sc.scionRule) || (seedFallback && seedFallback[5]) || "";
      this.defaultTool = (sc && sc.defaultTool) || "lamp";

      this.state.lamp = this.defaultTool !== "ballast";
      this.state.ballast = this.defaultTool === "ballast";
      this.state.view = "auto";
      this.state.roll = 0;
      this.state.tier = null;
      this.state.routeMarked = false;
      this.state.paused = false;
      this.t = 0.0;
      this.framesRendered = 0;
      this.lastAction = "load:" + num;
      toast = {
        text: "PORTAL " + this.station + " · READY (L / B / SPACE / R / C)",
        color: "#1d596e",
        until: performance.now() + 1200
      };
      if (typeof onUiSync === "function") onUiSync(this);
      this.renderNow();
      return this.getSnapshot();
    },

    mount: function (canvas, id, seedFallback, uiCallback) {
      this.unmount();
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
      if (this.state.view === "turkey") {
        // Keep t inside Act 2 (2.2s .. 5.4s) so both t-based and state.view-based rigs enact Turkey's pass
        var nextTk = this.t + dt;
        if (nextTk < 2.2 || nextTk >= 5.4) nextTk = 2.2 + ((nextTk - 2.2) % 3.2 + 3.2) % 3.2;
        this.t = nextTk;
      } else if (this.state.view === "trout") {
        // Keep t inside Act 3 (5.8s .. 9.6s) so both t-based and state.view-based rigs enact Trout's pass
        var nextTr = this.t + dt;
        if (nextTr < 5.8 || nextTr >= 9.6) nextTr = 5.8 + ((nextTr - 5.8) % 3.8 + 3.8) % 3.8;
        this.t = nextTr;
      } else {
        this.t = (this.t + dt) % LOOP_DUR;
        if (this.t >= 5.6) this.state.routeMarked = true;
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
        this.state.ballast ? "#2d6846" : "#394246"
      );
      return this.state.ballast;
    },

    setView: function (v) {
      var target = (v === "turkey" || v === "trout" || v === "auto") ? v : "auto";
      this.state.view = target;
      if (target === "turkey" && (this.t < 2.2 || this.t >= 5.4)) {
        this.t = 2.6;
      } else if (target === "trout" && (this.t < 5.8 || this.t >= 9.6)) {
        this.t = 6.4;
        this.state.routeMarked = true;
      }
      playSound("view", target, this.state.muted);
      var lbl = target === "turkey"
        ? "[SPACE] FIRST PASS · TURKEY LOOKING OUT (1·3·5)"
        : (target === "trout"
          ? "[SPACE] SECOND PASS · TROUT LOOKING IN (2·4·6)"
          : "[A] AUTO 10s TWO-PASS CYCLE");
      var col = target === "turkey" ? "#9e3d1c" : (target === "trout" ? "#1d596e" : "#14181a");
      this._recordAction("view:" + target, lbl, col);
      return this.state.view;
    },

    flipView: function () {
      var next;
      if (this.state.view === "turkey") {
        next = "trout";
      } else if (this.state.view === "trout") {
        next = "turkey";
      } else {
        next = this.t < 5.6 ? "trout" : "turkey";
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
      var side = (val % 2 === 1) ? "Turkey Odd" : "Trout Even";
      this._recordAction(
        "roll:" + val,
        "[R] ROLLED 1d6 BOLT #" + val + " · " + this.state.tier.toUpperCase() + " (" + side + ")",
        tierColor(val)
      );
      return val;
    },

    toggleCaptions: function () {
      this.state.showCaptions = !this.state.showCaptions;
      playSound("captions", this.state.showCaptions, this.state.muted);
      this._recordAction(
        "captions:" + (this.state.showCaptions ? "on" : "off"),
        "[C] CAPTIONS · " + (this.state.showCaptions ? "STORY STRIP VISIBLE" : "BLIND CRITIC MODE (NO TEXT)"),
        "#2d6846"
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
      var renderState = {
        lamp: !!this.state.lamp,
        ballast: !!this.state.ballast,
        view: this.state.view,
        roll: this.state.roll,
        showCaptions: this.state.showCaptions
      };

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

      // If showCaptions === false, enforce PAELEO blind-critic invariant cleanly on lower strip if a crew left text
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

        var dx = x - 640;
        var dy = y - 255;
        var dist = Math.sqrt(dx * dx + dy * dy);

        // 1. Porthole brass bolt ring -> Roll 1d6 bolt
        if (dist >= 175 && dist <= 238) {
          self.rollDie();
          return;
        }
        // 2. Inside porthole glass -> Flip Turkey / Trout perspective
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
        // Default: flip view
        self.flipView();
      };
    },

    handleKeyDown: function (ev) {
      if (!this.active) return false;
      var tag = ev.target && ev.target.tagName ? ev.target.tagName.toUpperCase() : "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return false;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return false;

      var k = ev.key;
      if (k === "l" || k === "L") {
        ev.preventDefault();
        this.toggleLamp();
        return true;
      }
      if (k === "b" || k === "B") {
        ev.preventDefault();
        this.toggleBallast();
        return true;
      }
      if (k === " " || k === "Spacebar") {
        ev.preventDefault();
        this.flipView();
        return true;
      }
      if (k === "a" || k === "A") {
        ev.preventDefault();
        this.setView("auto");
        return true;
      }
      if (k === "r" || k === "R") {
        ev.preventDefault();
        this.rollDie();
        return true;
      }
      if (k === "c" || k === "C") {
        ev.preventDefault();
        this.toggleCaptions();
        return true;
      }
      if (k === "m" || k === "M") {
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
        portalId: this.portalId,
        station: this.station,
        clue: this.clue,
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
          paused: this.state.paused
        }
      };
    }
  };

  window.addEventListener("keydown", function (ev) {
    game.handleKeyDown(ev);
  }, true);

  window.addEventListener("keyup", function (ev) {
    if (game.active && (ev.key === " " || ev.key === "Spacebar")) {
      var tag = ev.target && ev.target.tagName ? ev.target.tagName.toUpperCase() : "";
      if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
        ev.preventDefault();
      }
    }
  }, true);

  window.__game = game;
  window.TROUT_PORTAL_PLAYER = game;
})();
