/* ============================================================================
 * Turkey Sub · V3 Video-to-Game + PAELEO Oulipo Branching Runtime Engine
 * File: portals/branch-game-engine.js  (window.BRANCH_GAME)
 *
 * Layered cleanly atop window.SCION_STAGE (100% backward-compatible with V1/V2).
 * Powers 60fps interactive 12-branch PlayStation-style gameplay (✕ · ○ · △ · □
 * -> Probable · Plausible · Preposterous) AND deterministic 18.0s (432f @ 24fps)
 * Video-to-Game showcase rendering across all 55 portholes (#01–#55).
 *
 * Core Subsystems:
 *   1. 2-Stage Branching State Machine: BRANCH_GAME.createMachine(portalId, opts)
 *      + stateless deterministic resolver BRANCH_GAME.resolveState(id, t, state)
 *      across "root" | "stem" | "tier_select" | "outcome" | "showcase" (0..18.0s).
 *   2. Cinema-Grade Video-to-Game Camera & Atmosphere Primitives:
 *      - Spring Camera Rig (cam): 2.5D pan, focal zoom/dolly, ballast surge roll,
 *        hit-stop, and damped trauma screen-shake (triggerShake(amp)).
 *      - Volumetric Shaders: drawVolumetricBeam, drawLanternHalo,
 *        drawWaterCaustics, drawDepthFog, drawVignetteGrain, drawXRayOverlay,
 *        drawTractorRings, drawSnailSilverTrail.
 *      - Deterministic + Live 60fps ParticlePool: bubbles, brass_sparks,
 *        kintsugi, ink_puffs, confetti, sonar, snail_trail, tractor_rings,
 *        plus drawInputShockwave expanding from the pressed button's world anchor.
 *   3. Diegetic PlayStation ✕ · ○ · △ · □ Prompt & BOLAS Slate HUD:
 *      - drawControllerHUD(ctx, W, H, machineState, opts) with clickable hitboxes
 *        and a 4 × 3 (12-dot) Branch Discovery Matrix.
 *      - STRICT PAELEO BLIND-MODE LAW: When showCaptions === false, emits ZERO
 *        fillText / strokeText calls anywhere on canvas and hides all HUD chrome!
 *   4. Procedural WebAudio + Offline PCM Synthesizer (BRANCH_GAME.audio):
 *      - Distinct tactile foley for ✕, ○, △, □, Probable, Plausible,
 *        Preposterous, Rewind, and Random Branch.
 * ============================================================================ */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var DEFAULT_W = 1280;
  var DEFAULT_H = 720;
  var STAGE_H = 640;
  var SLATE_Y = 640;
  var SLATE_H = 80;
  var SHOWCASE_DURATION = 18.0;
  var STEM_DURATION = 2.2;
  var OUTCOME_DURATION = 4.5;
  var FPS = 24;
  var TOTAL_FRAMES = 432;
  var DISCOVERY_STORAGE_KEY = "turkey_sub_v3_branches_v1";

  // Ensure global V3 games registry exists
  if (root && !root.PORTAL_V3_GAMES) {
    root.PORTAL_V3_GAMES = {};
  }
  var GAMES_REGISTRY = (root && root.PORTAL_V3_GAMES) ? root.PORTAL_V3_GAMES : {};

  var BUTTON_ORDER = ["x", "o", "triangle", "square"];
  var TIER_ORDER = ["probable", "plausible", "preposterous"];

  var BUTTONS = {
    x: {
      key: "x",
      symbol: "\u2715",
      name: "Cross",
      color: "#2563eb",
      glow: "#60a5fa",
      rim: "#dbeafe",
      dark: "#1e3a8a",
      defaultLabel: "Shine Lamp",
      defaultPrompt: "Sweep tungsten searchlight beam",
      particlePreset: "kintsugi",
      rollImpulse: -0.008,
      zoomTarget: 1.08,
      shakeAmp: 8.5,
      gamepadIndex: 0
    },
    o: {
      key: "o",
      symbol: "\u25cb",
      name: "Circle",
      color: "#d42a1e",
      glow: "#f87171",
      rim: "#fee2e2",
      dark: "#7f1d1d",
      defaultLabel: "Blow Ballast",
      defaultPrompt: "Purge ballast air & surge current",
      particlePreset: "bubbles",
      rollImpulse: 0.022,
      zoomTarget: 1.07,
      shakeAmp: 11.0,
      gamepadIndex: 1
    },
    triangle: {
      key: "triangle",
      symbol: "\u25b3",
      name: "Triangle",
      color: "#0f8f80",
      glow: "#34d399",
      rim: "#d1fae5",
      dark: "#064e3b",
      defaultLabel: "Send Mail Snail",
      defaultPrompt: "Dispatch pneumatic Mail Snail",
      particlePreset: "snail_trail",
      rollImpulse: -0.012,
      zoomTarget: 1.09,
      shakeAmp: 7.5,
      gamepadIndex: 3
    },
    square: {
      key: "square",
      symbol: "\u25a1",
      name: "Square",
      color: "#b45309",
      glow: "#fbbf24",
      rim: "#fef3c7",
      dark: "#78350f",
      defaultLabel: "Tap Brass Probe",
      defaultPrompt: "Clank articulated brass probe",
      particlePreset: "brass_sparks",
      rollImpulse: 0.014,
      zoomTarget: 1.10,
      shakeAmp: 10.5,
      gamepadIndex: 2
    }
  };

  var TIERS = {
    probable: {
      key: "probable",
      index: 0,
      code: "B",
      roman: "II",
      button: "square",
      symbol: "\u25a1",
      shortLabel: "Probable",
      actor: "Turkey",
      label: "Probable \u00b7 Turkey",
      color: "#1d596e",
      badgeColor: "#b45309",
      glow: "#38bdf8",
      paperTint: "#dceaf0",
      particlePreset: "confetti"
    },
    plausible: {
      key: "plausible",
      index: 1,
      code: "C",
      roman: "III",
      button: "x",
      symbol: "\u2715",
      shortLabel: "Plausible",
      actor: "Trout",
      label: "Plausible \u00b7 Trout",
      color: "#0f8f80",
      altColor: "#2d6846",
      badgeColor: "#2563eb",
      glow: "#34d399",
      paperTint: "#dcf2ec",
      particlePreset: "bubbles"
    },
    preposterous: {
      key: "preposterous",
      index: 2,
      code: "D",
      roman: "IV",
      button: "triangle",
      symbol: "\u25b3",
      shortLabel: "Preposterous",
      actor: "Alien",
      label: "Preposterous \u00b7 Alien",
      color: "#d42a1e",
      altColor: "#9e3d1c",
      badgeColor: "#0f8f80",
      glow: "#fb7185",
      paperTint: "#f9e1de",
      particlePreset: "tractor_rings"
    }
  };

  // Stage-2 controller face button -> tier or rewind mapping (matches brief #82)
  var TIER_SELECT_BUTTON_MAP = {
    square: "probable",
    x: "plausible",
    triangle: "preposterous",
    o: "rewind"
  };

  // Default non-overlapping diegetic world anchors (x, y) & badge offsets (bx, by)
  var DEFAULT_HOTSPOTS = {
    x:        { x: 430, y: 270, bx: 300, by: 196 },
    o:        { x: 850, y: 275, bx: 980, by: 200 },
    triangle: { x: 435, y: 455, bx: 300, by: 525 },
    square:   { x: 845, y: 455, bx: 980, by: 525 }
  };

  var DEFAULT_TIER_OFFSETS = {
    probable:     { dx: -235, dy: -115 },
    plausible:    { dx: 0,    dy: -158 },
    preposterous: { dx: 235,  dy: -115 }
  };

  var PALETTE = {
    paper: "#fbfaf7",
    paper2: "#f1ede2",
    ink: "#14110d",
    inkSoft: "#3d3831",
    mute: "#6e675f",
    rule: "#dcd6c8",
    stamp: "#d42a1e",
    brass: "#d4a44c",
    brassHi: "#f3d184",
    stageDark: "#121519"
  };

  // ---------- Pure Math, Hashing & Color Helpers ----------

  function clamp(v, a, b) {
    return v < a ? a : (v > b ? b : v);
  }

  function lerp(a, b, u) {
    return a + (b - a) * u;
  }

  function smoothstep(a, b, x) {
    var u = clamp((x - a) / ((b - a) || 1e-6), 0, 1);
    return u * u * (3 - 2 * u);
  }

  function easeOutCubic(u) {
    var x = clamp(u, 0, 1);
    return 1 - Math.pow(1 - x, 3);
  }

  function easeInOutCubic(u) {
    var x = clamp(u, 0, 1);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function easeOutBack(u) {
    var x = clamp(u, 0, 1);
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  function pad2(n) {
    var v = Math.max(0, Math.floor(n || 0));
    return v < 10 ? "0" + v : String(v);
  }

  function hash(n) {
    var s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  function hash2(x, y) {
    var s = Math.sin(x * 127.1 + y * 311.7 + 74.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  function springEval(dt, freq, damp) {
    if (dt <= 0) return 0;
    var w = freq || 13.0;
    var d = damp || 5.0;
    var dec = Math.exp(-d * dt);
    return 1 - dec * (Math.cos(w * dt) + (d / w) * Math.sin(w * dt));
  }

  function springImpulse(dt, freq, damp) {
    if (dt <= 0) return 0;
    var w = freq || 15.0;
    var d = damp || 4.8;
    return Math.exp(-d * dt) * Math.sin(w * dt);
  }

  function hexToRgb(hex) {
    var clean = String(hex || "#ffffff").replace("#", "").trim();
    if (clean.length === 3) {
      clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
    }
    var num = parseInt(clean, 16);
    if (isNaN(num)) return { r: 255, g: 255, b: 255 };
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgba(hex, alpha) {
    var c = hexToRgb(hex);
    return "rgba(" + c.r + "," + c.g + "," + c.b + "," + clamp(alpha == null ? 1 : alpha, 0, 1).toFixed(3) + ")";
  }

  function roundedRectPath(ctx, x, y, w, h, r) {
    var rr = Math.max(0, Math.min(r || 0, w * 0.5, h * 0.5));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  // ---------- Strict PAELEO Blind-Mode Guard ----------

  function isBlindMode(state, opts) {
    if (opts && opts.showCaptions === false) return true;
    if (state && state.showCaptions === false) return true;
    if (state && state.blind === true && (!opts || opts.showCaptions !== true)) return true;
    return false;
  }

  function safeHudFillText(ctx, text, x, y, blind, maxWidth) {
    if (blind) return;
    var str = String(text == null ? "" : text);
    if (!str) return;
    if (typeof maxWidth === "number" && maxWidth > 0) {
      ctx.fillText(str, x, y, maxWidth);
    } else {
      ctx.fillText(str, x, y);
    }
  }

  function safeHudStrokeText(ctx, text, x, y, blind, maxWidth) {
    if (blind) return;
    var str = String(text == null ? "" : text);
    if (!str) return;
    if (typeof maxWidth === "number" && maxWidth > 0) {
      ctx.strokeText(str, x, y, maxWidth);
    } else {
      ctx.strokeText(str, x, y);
    }
  }

  function getScionStage() {
    return (root && root.SCION_STAGE) ? root.SCION_STAGE : null;
  }

  // ---------- Branch Tree Adapter & Fallback Synthesizer ----------

  function normalizeButtonKey(raw) {
    if (!raw) return null;
    var k = String(raw).toLowerCase().trim();
    if (k === "x" || k === "cross" || k === "\u2715" || k === "1") return "x";
    if (k === "o" || k === "circle" || k === "\u25cb" || k === "2") return "o";
    if (k === "triangle" || k === "tri" || k === "\u25b3" || k === "t" || k === "3") return "triangle";
    if (k === "square" || k === "sq" || k === "\u25a1" || k === "s" || k === "4") return "square";
    return null;
  }

  function normalizeTierKey(raw) {
    if (!raw) return null;
    var k = String(raw).toLowerCase().trim();
    if (k === "probable" || k === "turkey" || k === "b" || k === "1") return "probable";
    if (k === "plausible" || k === "trout" || k === "c" || k === "2") return "plausible";
    if (k === "preposterous" || k === "alien" || k === "d" || k === "3") return "preposterous";
    return null;
  }

  function _computeOutwardBadgePos(ax, ay, fallback) {
    var cx = DEFAULT_W * 0.5;
    var cy = STAGE_H * 0.5;
    var dx = ax - cx;
    var dy = ay - cy;
    var sideX = dx >= 0 ? 1 : -1;
    var sideY = dy >= 0 ? 1 : -1;
    // Place callout pill radially outward from stage center, clamped safely inside stage
    var bx = clamp(ax + sideX * 128, 120, DEFAULT_W - 120);
    var by = clamp(ay + sideY * 66, 48, STAGE_H - 52);
    if (Math.abs(dx) < 55 && Math.abs(dy) < 45 && fallback) {
      bx = fallback.bx;
      by = fallback.by;
    }
    return { bx: bx, by: by };
  }

  function parseHotspot(rawAnchor, fallback) {
    if (!rawAnchor) return { x: fallback.x, y: fallback.y, bx: fallback.bx, by: fallback.by };
    if (Array.isArray(rawAnchor) && rawAnchor.length >= 2) {
      var ax = Number(rawAnchor[0]) || fallback.x;
      var ay = Number(rawAnchor[1]) || fallback.y;
      var autoB = _computeOutwardBadgePos(ax, ay, fallback);
      return {
        x: ax,
        y: ay,
        bx: rawAnchor.length >= 4 ? Number(rawAnchor[2]) : autoB.bx,
        by: rawAnchor.length >= 4 ? Number(rawAnchor[3]) : autoB.by
      };
    }
    if (typeof rawAnchor === "object") {
      var ox = typeof rawAnchor.x === "number" ? rawAnchor.x : fallback.x;
      var oy = typeof rawAnchor.y === "number" ? rawAnchor.y : fallback.y;
      var autoObjB = _computeOutwardBadgePos(ox, oy, fallback);
      var hasExplicitBx = (typeof rawAnchor.bx === "number" || typeof rawAnchor.badgeX === "number");
      var hasExplicitBy = (typeof rawAnchor.by === "number" || typeof rawAnchor.badgeY === "number");
      return {
        x: ox,
        y: oy,
        bx: hasExplicitBx ? (typeof rawAnchor.bx === "number" ? rawAnchor.bx : rawAnchor.badgeX) : autoObjB.bx,
        by: hasExplicitBy ? (typeof rawAnchor.by === "number" ? rawAnchor.by : rawAnchor.badgeY) : autoObjB.by
      };
    }
    return { x: fallback.x, y: fallback.y, bx: fallback.bx, by: fallback.by };
  }

  function getBranchTree(portalId) {
    var pid = clamp(Math.round(Number(portalId) || 1), 1, 55);
    var S = getScionStage();
    var student = S && typeof S.getStudentOptions === "function"
      ? S.getStudentOptions(pid)
      : {
          station: "#" + pad2(pid),
          a: "Submerged creek clue",
          b: "Probable Turkey reading",
          c: "Plausible Brook Trout reading",
          d: "Preposterous Alien reading"
        };

    var ext = (root && root.PORTHOLE_BRANCH_TREES && root.PORTHOLE_BRANCH_TREES[pid]) || null;
    var buttonsOut = {};
    var branchesOut = {};

    for (var bi = 0; bi < BUTTON_ORDER.length; bi++) {
      var bKey = BUTTON_ORDER[bi];
      var bMeta = BUTTONS[bKey];
      var rawBtn = (ext && ext.buttons && ext.buttons[bKey]) || (ext && ext.stems && ext.stems[bKey]) || {};
      var hs = parseHotspot(rawBtn.anchor || rawBtn.hotspot || (ext && ext.hotspots && ext.hotspots[bKey]), DEFAULT_HOTSPOTS[bKey]);

      buttonsOut[bKey] = {
        key: bKey,
        symbol: bMeta.symbol,
        color: rawBtn.color || bMeta.color,
        shortLabel: rawBtn.shortLabel || rawBtn.label || bMeta.defaultLabel,
        actionPrompt: rawBtn.actionPrompt || rawBtn.prompt || bMeta.defaultPrompt,
        physicalStem: rawBtn.physicalStem || rawBtn.stem || (bMeta.defaultLabel + " activates " + student.a),
        soundCue: rawBtn.soundCue || bKey,
        anchor: hs
      };

      branchesOut[bKey] = {};
      for (var ti = 0; ti < TIER_ORDER.length; ti++) {
        var tKey = TIER_ORDER[ti];
        var tMeta = TIERS[tKey];
        var rawOutcome =
          (ext && ext.branches && ext.branches[bKey] && ext.branches[bKey][tKey]) ||
          (ext && ext.outcomes && ext.outcomes[bKey] && ext.outcomes[bKey][tKey]) ||
          (rawBtn.branches && rawBtn.branches[tKey]) ||
          {};
        var fallbackTitle = tKey === "probable" ? student.b : (tKey === "plausible" ? student.c : student.d);
        branchesOut[bKey][tKey] = {
          id: bKey + "." + tKey,
          button: bKey,
          tier: tKey,
          title: rawOutcome.title || fallbackTitle,
          caption: rawOutcome.caption || rawOutcome.text || fallbackTitle,
          visualAction: rawOutcome.visualAction || rawOutcome.action || fallbackTitle,
          soundCue: rawOutcome.soundCue || tKey
        };
      }
    }

    return {
      id: pid,
      station: (ext && ext.station) || student.station,
      clue: (ext && (ext.clue || ext.rootPrompt || ext.realClue)) || student.a,
      rootSetup: (ext && ext.rootSetup) || student.a,
      bolasStyle: (ext && ext.bolasStyle) || (S && S.getBolasStyle ? S.getBolasStyle(pid) : "queneau-rostrum"),
      recipeBadge: (S && S.getRecipeBadge) ? S.getRecipeBadge(pid) : "PAELEO \u00b7 Video-to-Game V3",
      buttons: buttonsOut,
      branches: branchesOut,
      showcaseScript: (ext && ext.showcaseScript) || null
    };
  }

  // ---------- Persistent 12-Branch Discovery Matrix Tracker (0..660) ----------

  var _memoryDiscovery = {};

  function _readDiscoveryMap() {
    try {
      if (root && root.localStorage) {
        var raw = root.localStorage.getItem(DISCOVERY_STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") return parsed;
        }
      }
    } catch (e) {}
    return _memoryDiscovery;
  }

  function _writeDiscoveryMap(map) {
    _memoryDiscovery = map || {};
    try {
      if (root && root.localStorage) {
        root.localStorage.setItem(DISCOVERY_STORAGE_KEY, JSON.stringify(_memoryDiscovery));
      }
    } catch (e) {}
  }

  var discovery = {
    branchKey: function (btnKey, tierKey) {
      var b = normalizeButtonKey(btnKey) || "x";
      var t = normalizeTierKey(tierKey) || "probable";
      return b + "." + t;
    },

    unlock: function (portalId, btnKey, tierKey) {
      var pid = String(clamp(Math.round(Number(portalId) || 1), 1, 55));
      var b = normalizeButtonKey(btnKey);
      var t = normalizeTierKey(tierKey);
      if (!b || !t) {
        return {
          newlyUnlocked: false,
          portalCount: this.getPortalCount(pid),
          totalCount: this.getTotalCount()
        };
      }
      var code = b + "." + t;
      var all = _readDiscoveryMap();
      if (!all[pid] || typeof all[pid] !== "object") all[pid] = {};
      var newly = !all[pid][code];
      all[pid][code] = 1;
      _writeDiscoveryMap(all);
      return {
        newlyUnlocked: newly,
        branchId: code,
        portalCount: Object.keys(all[pid]).length,
        totalCount: this.getTotalCount()
      };
    },

    isUnlocked: function (portalId, btnKey, tierKey) {
      var pid = String(clamp(Math.round(Number(portalId) || 1), 1, 55));
      var b = normalizeButtonKey(btnKey);
      var t = normalizeTierKey(tierKey);
      if (!b || !t) return false;
      var all = _readDiscoveryMap();
      return !!(all[pid] && all[pid][b + "." + t]);
    },

    getPortalUnlocked: function (portalId) {
      var pid = String(clamp(Math.round(Number(portalId) || 1), 1, 55));
      var all = _readDiscoveryMap();
      var src = (all[pid] && typeof all[pid] === "object") ? all[pid] : {};
      var copy = {};
      for (var bi = 0; bi < BUTTON_ORDER.length; bi++) {
        for (var ti = 0; ti < TIER_ORDER.length; ti++) {
          var k = BUTTON_ORDER[bi] + "." + TIER_ORDER[ti];
          if (src[k]) copy[k] = true;
        }
      }
      return copy;
    },

    getPortalCount: function (portalId) {
      return Object.keys(this.getPortalUnlocked(portalId)).length;
    },

    getTotalCount: function () {
      var all = _readDiscoveryMap();
      var sum = 0;
      for (var p = 1; p <= 55; p++) {
        var rec = all[String(p)];
        if (rec && typeof rec === "object") {
          for (var bi = 0; bi < BUTTON_ORDER.length; bi++) {
            for (var ti = 0; ti < TIER_ORDER.length; ti++) {
              if (rec[BUTTON_ORDER[bi] + "." + TIER_ORDER[ti]]) sum += 1;
            }
          }
        }
      }
      return sum;
    },

    getMatrix: function (portalId) {
      var pid = clamp(Math.round(Number(portalId) || 1), 1, 55);
      var tree = getBranchTree(pid);
      var unlockedMap = this.getPortalUnlocked(pid);
      var rows = [];
      for (var bi = 0; bi < BUTTON_ORDER.length; bi++) {
        var bKey = BUTTON_ORDER[bi];
        var bInfo = tree.buttons[bKey];
        var cells = [];
        for (var ti = 0; ti < TIER_ORDER.length; ti++) {
          var tKey = TIER_ORDER[ti];
          var br = tree.branches[bKey][tKey];
          var id = bKey + "." + tKey;
          cells.push({
            id: id,
            button: bKey,
            buttonSymbol: BUTTONS[bKey].symbol,
            buttonColor: BUTTONS[bKey].color,
            tier: tKey,
            tierLabel: TIERS[tKey].label,
            tierColor: TIERS[tKey].color,
            unlocked: !!unlockedMap[id],
            title: br.title,
            caption: br.caption,
            visualAction: br.visualAction
          });
        }
        rows.push({
          button: bKey,
          symbol: BUTTONS[bKey].symbol,
          color: BUTTONS[bKey].color,
          shortLabel: bInfo.shortLabel,
          cells: cells
        });
      }
      return {
        portalId: pid,
        unlockedCount: Object.keys(unlockedMap).length,
        totalBranches: 12,
        globalUnlockedCount: this.getTotalCount(),
        globalTotalBranches: 660,
        rows: rows
      };
    },

    resetPortal: function (portalId) {
      var pid = String(clamp(Math.round(Number(portalId) || 1), 1, 55));
      var all = _readDiscoveryMap();
      delete all[pid];
      _writeDiscoveryMap(all);
    },

    resetAll: function () {
      _writeDiscoveryMap({});
    }
  };

  // ---------- Procedural WebAudio + Offline PCM Synthesizer ----------

  var _audioCtx = null;

  function _getAudioContext(muted) {
    if (muted) return null;
    if (!root) return null;
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    try {
      if (!_audioCtx) _audioCtx = new AC();
      if (_audioCtx.state === "suspended" && typeof _audioCtx.resume === "function") {
        _audioCtx.resume().catch(function () {});
      }
      return _audioCtx;
    } catch (e) {
      return null;
    }
  }

  function _playNoiseBurst(ctx, startAt, dur, filterType, fStart, fEnd, qVal, peakGain) {
    var len = Math.max(64, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) {
      var u = i / len;
      data[i] = (Math.random() * 2 - 1) * Math.sin(u * Math.PI);
    }
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var flt = ctx.createBiquadFilter();
    flt.type = filterType || "bandpass";
    flt.Q.value = qVal || 2.0;
    flt.frequency.setValueAtTime(Math.max(40, fStart || 500), startAt);
    if (fEnd && fEnd !== fStart) {
      flt.frequency.exponentialRampToValueAtTime(Math.max(40, fEnd), startAt + dur);
    }
    var g = ctx.createGain();
    g.gain.setValueAtTime(Math.max(0.0005, peakGain || 0.12), startAt);
    g.gain.exponentialRampToValueAtTime(0.0005, startAt + dur);
    src.connect(flt);
    flt.connect(g);
    g.connect(ctx.destination);
    src.start(startAt);
    src.stop(startAt + dur + 0.02);
  }

  function _playTone(ctx, type, f0, f1, startAt, dur, gainPeak) {
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(Math.max(24, f0), startAt);
    if (f1 && f1 !== f0) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(24, f1), startAt + dur);
    }
    g.gain.setValueAtTime(0.0008, startAt);
    g.gain.linearRampToValueAtTime(gainPeak || 0.1, startAt + Math.min(0.018, dur * 0.25));
    g.gain.exponentialRampToValueAtTime(0.0006, startAt + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + dur + 0.02);
  }

  var audio = {
    muted: false,

    playButton: function (btnKey, mutedOverride) {
      var isMuted = (typeof mutedOverride === "boolean") ? mutedOverride : this.muted;
      var ctx = _getAudioContext(isMuted);
      if (!ctx) return false;
      var b = normalizeButtonKey(btnKey) || "x";
      var now = ctx.currentTime;
      try {
        if (b === "x") {
          // ✕ Cross: Warm tungsten shutter click + brass bell harmonic
          _playNoiseBurst(ctx, now, 0.045, "highpass", 1800, 900, 1.2, 0.13);
          _playTone(ctx, "triangle", 520, 1180, now, 0.055, 0.12);
          _playTone(ctx, "sine", 880.0, 880.0, now + 0.02, 0.42, 0.11);
          _playTone(ctx, "sine", 1318.5, 1318.5, now + 0.035, 0.36, 0.065);
        } else if (b === "o") {
          // ○ Circle: Deep ballast valve whoosh + rising bubble cascade
          _playTone(ctx, "sine", 195, 68, now, 0.24, 0.20);
          _playNoiseBurst(ctx, now, 0.30, "lowpass", 680, 210, 1.8, 0.16);
          var bubbleNotes = [392, 494, 587, 698, 880, 1046];
          for (var i = 0; i < bubbleNotes.length; i++) {
            var bt = now + 0.06 + i * 0.042;
            _playTone(ctx, "sine", bubbleNotes[i] * 0.78, bubbleNotes[i] * 1.32, bt, 0.075, 0.075);
          }
        } else if (b === "triangle") {
          // △ Triangle: Pneumatic brass mail tube pop-whoosh + two-note postal chime
          _playTone(ctx, "sine", 160, 420, now, 0.08, 0.15);
          _playNoiseBurst(ctx, now + 0.02, 0.19, "bandpass", 880, 2600, 2.6, 0.14);
          _playTone(ctx, "sine", 1046.5, 1046.5, now + 0.14, 0.34, 0.11);
          _playTone(ctx, "sine", 1567.98, 1567.98, now + 0.23, 0.42, 0.095);
        } else {
          // □ Square: Mechanical clack + resonant underwater brass sonar ping
          _playNoiseBurst(ctx, now, 0.035, "bandpass", 2200, 1100, 3.0, 0.16);
          _playTone(ctx, "square", 310, 145, now, 0.045, 0.08);
          _playTone(ctx, "sine", 987.77, 984.0, now + 0.03, 0.58, 0.13);
          _playTone(ctx, "sine", 1975.5, 1968.0, now + 0.04, 0.38, 0.045);
          _playTone(ctx, "sine", 987.77, 982.0, now + 0.26, 0.42, 0.045);
        }
        return true;
      } catch (e) {
        return false;
      }
    },

    playTier: function (tierKey, mutedOverride) {
      var isMuted = (typeof mutedOverride === "boolean") ? mutedOverride : this.muted;
      var ctx = _getAudioContext(isMuted);
      if (!ctx) return false;
      var t = normalizeTierKey(tierKey) || "probable";
      var now = ctx.currentTime;
      try {
        if (t === "probable") {
          // Probable (Turkey): Warm woodwind / cello pastoral cadence
          var cello = [196.0, 293.66, 392.0, 493.88];
          for (var i = 0; i < cello.length; i++) {
            _playTone(ctx, i < 2 ? "triangle" : "sine", cello[i], cello[i] * 1.002, now + i * 0.065, 0.52, 0.085 / (1 + i * 0.22));
          }
        } else if (t === "plausible") {
          // Plausible (Brook Trout): Wooden marimba + rippling river harp arpeggio
          var harp = [392.0, 493.88, 587.33, 739.99, 880.0];
          for (var j = 0; j < harp.length; j++) {
            var ht = now + j * 0.055;
            _playTone(ctx, "triangle", harp[j], harp[j], ht, 0.32, 0.09);
            _playTone(ctx, "sine", harp[j] * 2, harp[j] * 2, ht, 0.14, 0.035);
          }
        } else {
          // Preposterous (Alien Saucer): Tube-theremin glide + saucer telemetry bleeps
          var th = ctx.createOscillator();
          var lfo = ctx.createOscillator();
          var lfoG = ctx.createGain();
          var thG = ctx.createGain();
          th.type = "sine";
          th.frequency.setValueAtTime(523.25, now);
          th.frequency.exponentialRampToValueAtTime(932.33, now + 0.28);
          th.frequency.exponentialRampToValueAtTime(659.25, now + 0.68);
          lfo.type = "sine";
          lfo.frequency.setValueAtTime(11.5, now);
          lfoG.gain.setValueAtTime(26.0, now);
          lfo.connect(lfoG);
          lfoG.connect(th.frequency);
          thG.gain.setValueAtTime(0.001, now);
          thG.gain.linearRampToValueAtTime(0.09, now + 0.08);
          thG.gain.exponentialRampToValueAtTime(0.0007, now + 0.72);
          th.connect(thG);
          thG.connect(ctx.destination);
          th.start(now);
          lfo.start(now);
          th.stop(now + 0.74);
          lfo.stop(now + 0.74);

          var bleeps = [1318.5, 1760.0, 1479.98, 2093.0];
          for (var k = 0; k < bleeps.length; k++) {
            _playTone(ctx, "triangle", bleeps[k], bleeps[k] * 1.04, now + 0.11 + k * 0.075, 0.07, 0.055);
          }
        }
        return true;
      } catch (e) {
        return false;
      }
    },

    playRewind: function (mutedOverride) {
      var isMuted = (typeof mutedOverride === "boolean") ? mutedOverride : this.muted;
      var ctx = _getAudioContext(isMuted);
      if (!ctx) return false;
      var now = ctx.currentTime;
      try {
        _playNoiseBurst(ctx, now, 0.18, "bandpass", 2400, 620, 2.2, 0.12);
        _playTone(ctx, "sawtooth", 880, 290, now, 0.16, 0.055);
        _playTone(ctx, "triangle", 640, 960, now + 0.15, 0.06, 0.08);
        return true;
      } catch (e) {
        return false;
      }
    },

    playRandom: function (mutedOverride) {
      var isMuted = (typeof mutedOverride === "boolean") ? mutedOverride : this.muted;
      var ctx = _getAudioContext(isMuted);
      if (!ctx) return false;
      var now = ctx.currentTime;
      try {
        for (var i = 0; i < 5; i++) {
          _playTone(ctx, "triangle", 520 + i * 130, 580 + i * 130, now + i * 0.038, 0.032, 0.075);
        }
        _playTone(ctx, "sine", 1174.66, 1174.66, now + 0.2, 0.34, 0.10);
        return true;
      } catch (e) {
        return false;
      }
    },

    // Deterministic offline stereo/mono Float32 PCM foley bed for 18.0s showcase MP4 rendering in Node!
    synthesizeShowcaseFoleyPCM: function (portalId, sampleRate, durationSec) {
      var sr = sampleRate || 44100;
      var dur = durationSec || SHOWCASE_DURATION;
      var n = Math.floor(sr * dur);
      var left = new Float32Array(n);
      var right = new Float32Array(n);
      var pid = clamp(Math.round(Number(portalId) || 1), 1, 55);

      function addTone(t0, d, f0, f1, amp, pan, vibratoHz, vibratoAmp) {
        var i0 = Math.max(0, Math.floor(t0 * sr));
        var i1 = Math.min(n, Math.floor((t0 + d) * sr));
        var phase = 0;
        var lGain = Math.cos((clamp(pan || 0, -1, 1) + 1) * Math.PI * 0.25);
        var rGain = Math.sin((clamp(pan || 0, -1, 1) + 1) * Math.PI * 0.25);
        for (var i = i0; i < i1; i++) {
          var lt = (i - i0) / sr;
          var u = lt / (d || 1e-6);
          var env = Math.sin(Math.min(1, u * 8) * Math.PI * 0.5) * Math.exp(-3.4 * u);
          var freq = f0 + (f1 - f0) * u;
          if (vibratoHz) freq += Math.sin(lt * TAU * vibratoHz) * (vibratoAmp || 18);
          phase += (TAU * freq) / sr;
          var s = Math.sin(phase) * amp * env;
          left[i] += s * lGain;
          right[i] += s * rGain;
        }
      }

      // Warm underwater hydrophone, rostrum projector motor & gentle harmonic bed (RMS ~0.048 > 0.035)
      var lpL = 0, lpR = 0;
      var droneFreq = 110 + (pid % 7) * 8;
      for (var i = 0; i < n; i++) {
        var sec = i / sr;
        var nL = hash(i * 0.73 + pid) * 2 - 1;
        var nR = hash(i * 1.19 + pid * 3.1) * 2 - 1;
        lpL = lpL * 0.955 + nL * 0.045;
        lpR = lpR * 0.955 + nR * 0.045;
        var swell = 0.78 + 0.22 * Math.sin(sec * 1.4);
        var pad = (
          Math.sin(sec * TAU * droneFreq) * 0.056 +
          Math.sin(sec * TAU * droneFreq * 1.5) * 0.036 +
          Math.sin(sec * TAU * droneFreq * 2.0 + Math.sin(sec * 2.1) * 0.4) * 0.022
        ) * swell;
        left[i] += lpL * 0.14 + pad;
        right[i] += lpR * 0.14 + pad;
      }

      // 2.2s: [✕] Button registration shutter + bell
      addTone(2.20, 0.06, 540, 1220, 0.22, -0.2);
      addTone(2.23, 0.45, 880, 880, 0.18, -0.15);
      addTone(2.25, 0.38, 1318.5, 1318.5, 0.11, 0.15);

      // 4.4s: Probable (Turkey) cello/woodwind chord
      addTone(4.40, 0.55, 196.0, 196.5, 0.18, -0.25);
      addTone(4.47, 0.52, 293.66, 294.0, 0.16, 0.0);
      addTone(4.54, 0.50, 392.0, 392.0, 0.14, 0.25);

      // 7.8s: Rewind chirp + [○] Ballast valve + bubbles
      addTone(7.80, 0.16, 920, 310, 0.18, 0.0);
      addTone(7.98, 0.28, 190, 72, 0.24, -0.2);
      for (var b = 0; b < 6; b++) {
        addTone(8.05 + b * 0.05, 0.09, 380 + b * 110, 520 + b * 135, 0.15, (b % 2 ? 0.3 : -0.3));
      }

      // 9.8s: Plausible (Trout + Snail Mail) marimba harp + postal chime
      var harp = [392.0, 493.88, 587.33, 739.99, 880.0];
      for (var h = 0; h < harp.length; h++) {
        addTone(9.80 + h * 0.06, 0.35, harp[h], harp[h], 0.16, -0.3 + h * 0.15);
      }
      addTone(11.10, 0.36, 1046.5, 1046.5, 0.16, 0.2);
      addTone(11.20, 0.42, 1567.98, 1567.98, 0.14, 0.25);

      // 13.8s: [△] Mail Snail pneumatic tube + 14.7s Preposterous Alien Saucer theremin
      addTone(13.80, 0.10, 180, 460, 0.20, 0.25);
      addTone(13.92, 0.32, 1046.5, 1046.5, 0.16, 0.2);
      addTone(14.70, 0.85, 587.33, 880.0, 0.20, 0.0, 11.5, 28);
      addTone(14.95, 0.08, 1318.5, 1360.0, 0.14, -0.35);
      addTone(15.05, 0.08, 1760.0, 1810.0, 0.14, 0.35);
      addTone(15.15, 0.08, 2093.0, 2140.0, 0.13, -0.2);

      for (var c = 0; c < n; c++) {
        left[c] = clamp(left[c], -0.95, 0.95);
        right[c] = clamp(right[c], -0.95, 0.95);
      }
      return { sampleRate: sr, duration: dur, left: left, right: right };
    }
  };

  // ---------- Spring Camera Rig (2.5D Pan, Zoom/Dolly, Roll & Trauma Shake) ----------

  function createCameraRig(opts) {
    var cfg = opts || {};
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      targetX: 0,
      targetY: 0,
      zoom: 1.0,
      vZoom: 0,
      targetZoom: 1.0,
      roll: 0,
      vRoll: 0,
      targetRoll: 0,
      shakeAmp: 0,
      shakeElapsed: 0,
      stiffness: cfg.stiffness || 115,
      damping: cfg.damping || 16,
      _active: false,

      triggerShake: function (amp) {
        this.shakeAmp = Math.min(24, Math.max(this.shakeAmp * 0.5, Number(amp) || 8.0));
        this.shakeElapsed = 0;
      },

      focusOn: function (worldX, worldY, zoom, rollDegOrRad) {
        var cx = DEFAULT_W * 0.5;
        var cy = STAGE_H * 0.5;
        var z = clamp(Number(zoom) || 1.06, 0.92, 1.35);
        // Pan gently (35% of offset) so scene edges stay framed inside 1280x640
        this.targetX = clamp((cx - (worldX == null ? cx : worldX)) * 0.32, -135, 135);
        this.targetY = clamp((cy - (worldY == null ? cy : worldY)) * 0.28, -85, 85);
        this.targetZoom = z;
        this.targetRoll = clamp(Number(rollDegOrRad) || 0, -0.08, 0.08);
      },

      resetFocus: function () {
        this.targetX = 0;
        this.targetY = 0;
        this.targetZoom = 1.0;
        this.targetRoll = 0;
      },

      update: function (dt) {
        var step = clamp(Number(dt) || (1 / 60), 0, 0.05);
        var k = this.stiffness;
        var d = this.damping;

        var ax = (this.targetX - this.x) * k - this.vx * d;
        var ay = (this.targetY - this.y) * k - this.vy * d;
        this.vx += ax * step;
        this.vy += ay * step;
        this.x += this.vx * step;
        this.y += this.vy * step;

        var az = (this.targetZoom - this.zoom) * (k * 0.85) - this.vZoom * d;
        this.vZoom += az * step;
        this.zoom = clamp(this.zoom + this.vZoom * step, 0.9, 1.4);

        var ar = (this.targetRoll - this.roll) * (k * 0.75) - this.vRoll * (d * 0.9);
        this.vRoll += ar * step;
        this.roll += this.vRoll * step;

        if (this.shakeAmp > 0.05) {
          this.shakeElapsed += step;
          this.shakeAmp *= Math.exp(-9.5 * step);
          if (this.shakeAmp < 0.08) this.shakeAmp = 0;
        } else {
          this.shakeAmp = 0;
        }
      },

      getPose: function (rawT) {
        var t = Number(rawT) || this.shakeElapsed || 0;
        var sx = 0, sy = 0, sRoll = 0;
        if (this.shakeAmp > 0.05) {
          sx = (Math.sin(t * 53.0) * 0.65 + Math.cos(t * 89.0) * 0.35) * this.shakeAmp;
          sy = (Math.cos(t * 61.0) * 0.65 + Math.sin(t * 97.0) * 0.35) * this.shakeAmp;
          sRoll = Math.sin(t * 47.0) * this.shakeAmp * 0.0009;
        }
        return {
          panX: this.x + sx,
          panY: this.y + sy,
          zoom: this.zoom,
          roll: this.roll + sRoll,
          shakeAmp: this.shakeAmp
        };
      },

      begin: function (ctx, W, H, opts) {
        beginCameraRig(ctx, W, H, this.getPose(), opts);
        this._active = true;
      },

      end: function (ctx) {
        if (this._active) {
          endCameraRig(ctx);
          this._active = false;
        }
      },

      parallaxX: function (baseX, depth) {
        return baseX + this.x * (depth == null ? 0.5 : depth);
      },

      parallaxY: function (baseY, depth) {
        return baseY + this.y * (depth == null ? 0.5 : depth);
      }
    };
  }

  // Deterministic camera pose solver for showcase mode or stateless seeking
  function computeDeterministicCameraPose(resolved, tree) {
    var t = resolved.t || 0;
    var breatheX = Math.sin(t * 0.95) * 4.5;
    var breatheY = Math.cos(t * 0.78) * 3.0;
    var breatheRoll = Math.sin(t * 0.62) * 0.003;

    if (resolved.phase === "root") {
      return {
        panX: breatheX,
        panY: breatheY,
        zoom: 1.0 + Math.sin(t * 0.8) * 0.008,
        roll: breatheRoll,
        shakeAmp: 0
      };
    }

    var bKey = resolved.selectedButton || "x";
    var btnMeta = BUTTONS[bKey] || BUTTONS.x;
    var anchor = (tree && tree.buttons && tree.buttons[bKey] && tree.buttons[bKey].anchor) || DEFAULT_HOTSPOTS[bKey];
    var cx = DEFAULT_W * 0.5;
    var cy = STAGE_H * 0.5;
    var goalX = clamp((cx - anchor.x) * 0.30, -125, 125);
    var goalY = clamp((cy - anchor.y) * 0.26, -78, 78);

    if (resolved.phase === "stem" || resolved.phase === "tier_select") {
      var dt = resolved.phase === "stem" ? resolved.phaseT : (STEM_DURATION + resolved.phaseT);
      var sp = springEval(dt, 9.5, 4.2);
      var shakeEnv = dt < 0.55 ? btnMeta.shakeAmp * Math.exp(-9.0 * dt) : 0;
      var sx = shakeEnv * Math.sin(dt * 58.0);
      var sy = shakeEnv * Math.cos(dt * 67.0);
      return {
        panX: goalX * sp + breatheX * 0.6 + sx,
        panY: goalY * sp + breatheY * 0.6 + sy,
        zoom: 1.0 + (btnMeta.zoomTarget - 1.0) * sp,
        roll: btnMeta.rollImpulse * springImpulse(dt, 8.0, 3.2) + breatheRoll,
        shakeAmp: shakeEnv
      };
    }

    // Outcome phase: settle wider or sweep toward outcome focal point with gentle impact shake
    var odt = resolved.outcomeT || 0;
    var osp = springEval(odt, 8.2, 4.0);
    var tierKey = resolved.selectedTier || "probable";
    var tierZoom = tierKey === "preposterous" ? 1.045 : (tierKey === "plausible" ? 1.055 : 1.065);
    var tierPanX = tierKey === "probable" ? 24 : (tierKey === "plausible" ? -18 : 0);
    var tierPanY = tierKey === "preposterous" ? 16 : -8;
    var oShake = odt < 0.45 ? 6.5 * Math.exp(-9.5 * odt) : 0;

    return {
      panX: lerp(goalX, tierPanX, clamp(osp, 0, 1)) + breatheX * 0.7 + oShake * Math.sin(odt * 54.0),
      panY: lerp(goalY, tierPanY, clamp(osp, 0, 1)) + breatheY * 0.7 + oShake * Math.cos(odt * 63.0),
      zoom: lerp(btnMeta.zoomTarget, tierZoom, clamp(osp, 0, 1)),
      roll: breatheRoll + (tierKey === "preposterous" ? Math.sin(t * 1.9) * 0.008 : 0),
      shakeAmp: oShake
    };
  }

  function beginCameraRig(ctx, W, H, camOrState, opts) {
    var w = W || DEFAULT_W;
    var h = H || DEFAULT_H;
    var cfg = opts || {};
    var clipH = cfg.fullHeight ? h : Math.min(h, cfg.stageH || STAGE_H);
    var pose = camOrState;
    if (camOrState && typeof camOrState.getPose === "function") {
      pose = camOrState.getPose();
    } else if (camOrState && camOrState.camPose) {
      pose = camOrState.camPose;
    } else if (!pose || typeof pose !== "object") {
      pose = { panX: 0, panY: 0, zoom: 1, roll: 0 };
    }

    var z = clamp(pose.zoom || 1, 0.85, 1.45);
    var px = pose.panX || 0;
    var py = pose.panY || 0;
    var roll = pose.roll || 0;
    var cx = w * 0.5;
    var cy = clipH * 0.5;

    ctx.save();
    if (cfg.clip !== false) {
      ctx.beginPath();
      ctx.rect(0, 0, w, clipH);
      ctx.clip();
    }
    // Slight overscan fill if roll/pan exposes 1-2px corner on zoom=1
    ctx.translate(cx + px, cy + py);
    if (roll) ctx.rotate(roll);
    ctx.scale(z, z);
    ctx.translate(-cx, -cy);
  }

  function endCameraRig(ctx) {
    ctx.restore();
  }

  // ---------- Deterministic + Live 60fps Particle Emitter Pool ----------

  function _drawSingleParticle(ctx, p) {
    var u = clamp(p.age / (p.life || 1), 0, 1);
    if (u <= 0 || u >= 1) return;
    var fade = u < 0.15 ? (u / 0.15) : (1 - smoothstep(0.55, 1.0, u));
    var alpha = clamp(fade * (p.alpha == null ? 0.88 : p.alpha), 0, 1);
    if (alpha <= 0.01) return;

    var kind = p.kind || "bubbles";
    ctx.save();
    ctx.globalAlpha = alpha;

    if (kind === "bubbles") {
      var r = p.size * (0.85 + 0.25 * u);
      var wx = p.x + Math.sin(p.age * 5.2 + p.seed * 6.0) * 8.0;
      ctx.fillStyle = "#fbfaf5";
      ctx.beginPath();
      ctx.arc(wx, p.y, r + 1.8, 0, TAU);
      ctx.fill();
      ctx.fillStyle = p.color || "rgba(176, 232, 228, 0.82)";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(wx, p.y, r, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(wx - r * 0.32, p.y - r * 0.32, Math.max(1.1, r * 0.26), 0, TAU);
      ctx.fill();
    } else if (kind === "brass_sparks" || kind === "sparks") {
      var spLen = Math.max(4, Math.sqrt(p.vx * p.vx + p.vy * p.vy) * 0.045);
      var ang = Math.atan2(p.vy, p.vx);
      ctx.strokeStyle = p.color || "#fbbf24";
      ctx.lineWidth = Math.max(1.6, p.size * 0.42);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p.x - Math.cos(ang) * spLen, p.y - Math.sin(ang) * spLen);
      ctx.lineTo(p.x + Math.cos(ang) * 2, p.y + Math.sin(ang) * 2);
      ctx.stroke();
      ctx.fillStyle = "#fffbeb";
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1.4, p.size * 0.28), 0, TAU);
      ctx.fill();
    } else if (kind === "kintsugi" || kind === "gold_ripples") {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot + p.age * p.spin);
      var gs = p.size * (1 - u * 0.3);
      ctx.fillStyle = p.color || "#f3d184";
      ctx.strokeStyle = "#926214";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(0, -gs);
      ctx.lineTo(gs * 0.65, 0);
      ctx.lineTo(0, gs);
      ctx.lineTo(-gs * 0.65, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (kind === "ink_puffs" || kind === "ink") {
      var ir = p.size * (0.65 + u * 1.45);
      ctx.fillStyle = p.color || "rgba(24, 22, 20, 0.55)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, ir, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(251, 250, 245, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    } else if (kind === "confetti" || kind === "torn_paper") {
      ctx.translate(p.x + Math.sin(p.age * 4.5 + p.seed * 9) * 10, p.y);
      ctx.rotate(p.rot + p.age * p.spin);
      var flipW = Math.max(0.22, Math.abs(Math.cos(p.age * 5.8 + p.seed * 4)));
      var cw = p.size * 1.35 * flipW;
      var ch = p.size * 0.92;
      ctx.fillStyle = "#fbfaf5";
      ctx.fillRect(-cw * 0.5 - 1.5, -ch * 0.5 - 1.5, cw + 3, ch + 3);
      ctx.fillStyle = p.color || "#d42a1e";
      ctx.fillRect(-cw * 0.5, -ch * 0.5, cw, ch);
    } else if (kind === "snail_trail") {
      var sr = p.size * (1 - u * 0.4);
      ctx.fillStyle = "#fbfaf5";
      ctx.beginPath();
      ctx.arc(p.x, p.y, sr + 1.5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = p.color || "#34d399";
      ctx.beginPath();
      ctx.arc(p.x, p.y, sr, 0, TAU);
      ctx.fill();
    } else if (kind === "tractor_rings" || kind === "alien") {
      var rx = p.size * (0.8 + u * 2.1);
      var ry = rx * 0.34;
      ctx.strokeStyle = p.color || (p.idx % 2 === 0 ? "#0f8f80" : "#d42a1e");
      ctx.lineWidth = 2.0;
      ctx.setLineDash([7, 4]);
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, rx, ry, 0, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      // sonar ring particle
      var sRad = p.size * (0.5 + u * 3.2);
      ctx.strokeStyle = p.color || "#60a5fa";
      ctx.lineWidth = Math.max(1.2, 2.8 * (1 - u));
      ctx.beginPath();
      ctx.arc(p.x, p.y, sRad, 0, TAU);
      ctx.stroke();
    }

    ctx.restore();
  }

  function _spawnSpecForPreset(preset, idx, count, x, y, seed, opts) {
    var cfg = opts || {};
    var h1 = hash(seed + idx * 3.17);
    var h2 = hash(seed + idx * 7.91 + 11.3);
    var h3 = hash(seed + idx * 13.37 + 29.1);
    var confettiCols = ["#d42a1e", "#1d596e", "#0f8f80", "#d4a44c", "#2563eb"];

    if (preset === "bubbles") {
      return {
        kind: "bubbles",
        idx: idx,
        x0: x + (h1 - 0.5) * (cfg.spreadX || 72),
        y0: y + (h2 - 0.5) * (cfg.spreadY || 28),
        vx0: (h3 - 0.5) * 28,
        vy0: -(58 + h1 * 88),
        gravity: -22,
        drag: 0.98,
        size: 4.5 + h2 * 8.5,
        life: 0.85 + h3 * 0.95,
        rot: 0,
        spin: 0,
        seed: h1 * 10,
        color: cfg.color || "rgba(176, 232, 228, 0.84)",
        alpha: 0.9
      };
    }
    if (preset === "brass_sparks" || preset === "sparks") {
      var ang = -Math.PI * 0.15 - h1 * Math.PI * 0.7 + (h2 - 0.5) * 1.4;
      var spd = 110 + h2 * 220;
      return {
        kind: "brass_sparks",
        idx: idx,
        x0: x + (h3 - 0.5) * 14,
        y0: y + (h1 - 0.5) * 14,
        vx0: Math.cos(ang) * spd,
        vy0: Math.sin(ang) * spd - 40,
        gravity: 340,
        drag: 0.96,
        size: 4.5 + h3 * 4.5,
        life: 0.42 + h1 * 0.45,
        rot: ang,
        spin: 0,
        seed: h2 * 10,
        color: cfg.color || (idx % 2 === 0 ? "#fbbf24" : "#fde68a"),
        alpha: 0.96
      };
    }
    if (preset === "confetti" || preset === "torn_paper") {
      var cAng = -Math.PI * 0.5 + (h1 - 0.5) * 2.1;
      var cSpd = 75 + h2 * 155;
      return {
        kind: "confetti",
        idx: idx,
        x0: x + (h3 - 0.5) * 32,
        y0: y + (h1 - 0.5) * 20,
        vx0: Math.cos(cAng) * cSpd,
        vy0: Math.sin(cAng) * cSpd - 35,
        gravity: 165,
        drag: 0.965,
        size: 6.5 + h3 * 6.0,
        life: 0.95 + h1 * 0.85,
        rot: h2 * TAU,
        spin: (h3 - 0.5) * 7.5,
        seed: h1 * 12,
        color: cfg.color || confettiCols[idx % confettiCols.length],
        alpha: 0.95
      };
    }
    if (preset === "ink_puffs" || preset === "ink") {
      var iAng = (idx / Math.max(1, count)) * TAU + h1 * 0.5;
      var iSpd = 28 + h2 * 64;
      return {
        kind: "ink_puffs",
        idx: idx,
        x0: x + (h3 - 0.5) * 18,
        y0: y + (h1 - 0.5) * 18,
        vx0: Math.cos(iAng) * iSpd,
        vy0: Math.sin(iAng) * iSpd - 16,
        gravity: -12,
        drag: 0.94,
        size: 9 + h2 * 13,
        life: 0.7 + h3 * 0.65,
        rot: 0,
        spin: 0,
        seed: h1 * 8,
        color: cfg.color || "rgba(26, 23, 19, 0.52)",
        alpha: 0.82
      };
    }
    if (preset === "snail_trail") {
      return {
        kind: "snail_trail",
        idx: idx,
        x0: x - idx * 9 + (h1 - 0.5) * 22,
        y0: y + (h2 - 0.5) * 16,
        vx0: (h3 - 0.5) * 24,
        vy0: -18 - h1 * 32,
        gravity: -8,
        drag: 0.97,
        size: 3.5 + h2 * 4.2,
        life: 0.75 + h3 * 0.7,
        rot: 0,
        spin: 0,
        seed: h1 * 9,
        color: cfg.color || (idx % 3 === 0 ? "#f3d184" : "#34d399"),
        alpha: 0.88
      };
    }
    if (preset === "tractor_rings" || preset === "alien") {
      return {
        kind: "tractor_rings",
        idx: idx,
        x0: x + (h1 - 0.5) * 16,
        y0: y + (idx - count * 0.5) * 18,
        vx0: 0,
        vy0: -32 - h2 * 28,
        gravity: 0,
        drag: 0.99,
        size: 16 + h3 * 22,
        life: 0.85 + h1 * 0.6,
        rot: 0,
        spin: 0,
        seed: h2 * 7,
        color: cfg.color || (idx % 2 === 0 ? "#0f8f80" : "#8b5cf6"),
        alpha: 0.82
      };
    }
    // Default: kintsugi gold shards
    var kAng = (idx / Math.max(1, count)) * TAU + (h1 - 0.5) * 0.45;
    var kSpd = 65 + h2 * 135;
    return {
      kind: "kintsugi",
      idx: idx,
      x0: x,
      y0: y,
      vx0: Math.cos(kAng) * kSpd,
      vy0: Math.sin(kAng) * kSpd - 20,
      gravity: 95,
      drag: 0.955,
      size: 5.5 + h3 * 5.5,
      life: 0.65 + h1 * 0.55,
      rot: h2 * TAU,
      spin: (h3 - 0.5) * 6.0,
      seed: h1 * 10,
      color: cfg.color || (idx % 2 === 0 ? "#f3d184" : "#60a5fa"),
      alpha: 0.94
    };
  }

  function ParticlePool(seed) {
    this.seed = seed || 17.3;
    this.live = [];
    this.maxLive = 180;
    this._burstSeq = 0;
  }

  ParticlePool.prototype.clear = function () {
    this.live.length = 0;
  };

  ParticlePool.prototype.emit = function (preset, x, y, count, opts) {
    var n = clamp(Math.round(count || 14), 1, 60);
    this._burstSeq += 1;
    var baseSeed = this.seed + this._burstSeq * 19.7;
    for (var i = 0; i < n; i++) {
      var sp = _spawnSpecForPreset(preset || "kintsugi", i, n, x, y, baseSeed, opts);
      sp.x = sp.x0;
      sp.y = sp.y0;
      sp.vx = sp.vx0;
      sp.vy = sp.vy0;
      sp.age = 0.001;
      if (this.live.length >= this.maxLive) this.live.shift();
      this.live.push(sp);
    }
  };

  ParticlePool.prototype.update = function (dt) {
    var step = clamp(Number(dt) || (1 / 60), 0, 0.06);
    for (var i = this.live.length - 1; i >= 0; i--) {
      var p = this.live[i];
      p.age += step;
      if (p.age >= p.life) {
        this.live.splice(i, 1);
        continue;
      }
      var drag = Math.pow(p.drag || 0.97, step * 60);
      p.vx *= drag;
      p.vy = p.vy * drag + (p.gravity || 0) * step;
      p.x += p.vx * step;
      p.y += p.vy * step;
    }
  };

  ParticlePool.prototype.draw = function (ctx) {
    for (var i = 0; i < this.live.length; i++) {
      _drawSingleParticle(ctx, this.live[i]);
    }
  };

  // Stateless 100% deterministic burst/stream evaluator for headless MP4 showcase & seeking!
  ParticlePool.prototype.drawDeterministic = function (ctx, preset, x, y, localT, opts) {
    drawDeterministicParticles(ctx, preset, x, y, localT, opts);
  };

  function createParticlePool(seed) {
    return new ParticlePool(seed);
  }

  function drawDeterministicParticles(ctx, preset, x, y, localT, opts) {
    var cfg = opts || {};
    var count = clamp(Math.round(cfg.count || 16), 1, 64);
    var seed = cfg.seed != null ? cfg.seed : (x * 0.13 + y * 0.29 + 7.7);
    var loop = !!cfg.loop;
    var t = Number(localT) || 0;
    if (!loop && t <= 0) return;

    for (var i = 0; i < count; i++) {
      var sp = _spawnSpecForPreset(preset || "bubbles", i, count, x, y, seed, cfg);
      var age = loop
        ? (((t + (i / count) * sp.life) % sp.life + sp.life) % sp.life)
        : (t - (cfg.stagger ? i * cfg.stagger : (i % 4) * 0.022));
      if (age <= 0 || age >= sp.life) continue;
      // Closed-form kinematic evaluation at exact age
      var dampFactor = (1 - Math.pow(sp.drag || 0.97, age * 60)) / (1 - (sp.drag || 0.97) || 0.03) / 60;
      sp.age = age;
      sp.x = sp.x0 + sp.vx0 * dampFactor;
      sp.y = sp.y0 + sp.vy0 * dampFactor + 0.5 * (sp.gravity || 0) * age * age;
      sp.vx = sp.vx0 * Math.pow(sp.drag || 0.97, age * 60);
      sp.vy = sp.vy0 * Math.pow(sp.drag || 0.97, age * 60) + (sp.gravity || 0) * age;
      _drawSingleParticle(ctx, sp);
    }
  }

  // ---------- Volumetric Lighting, Shaders & Diegetic Shockwaves (0 Text!) ----------

  // Pure geometric PlayStation vector icon (✕ · ○ · △ · □) — ZERO fillText/strokeText!
  function drawGeometricSymbol(ctx, btnKey, cx, cy, r, strokeColor, lineWidth) {
    var b = normalizeButtonKey(btnKey) || "x";
    ctx.save();
    ctx.strokeStyle = strokeColor || "#ffffff";
    ctx.lineWidth = lineWidth || Math.max(2.2, r * 0.26);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (b === "x") {
      var d = r * 0.56;
      ctx.beginPath();
      ctx.moveTo(cx - d, cy - d);
      ctx.lineTo(cx + d, cy + d);
      ctx.moveTo(cx + d, cy - d);
      ctx.lineTo(cx - d, cy + d);
      ctx.stroke();
    } else if (b === "o") {
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.62, 0, TAU);
      ctx.stroke();
    } else if (b === "triangle") {
      var tr = r * 0.68;
      ctx.beginPath();
      ctx.moveTo(cx, cy - tr);
      ctx.lineTo(cx + tr * 0.88, cy + tr * 0.62);
      ctx.lineTo(cx - tr * 0.88, cy + tr * 0.62);
      ctx.closePath();
      ctx.stroke();
    } else {
      var sq = r * 0.56;
      ctx.strokeRect(cx - sq, cy - sq, sq * 2, sq * 2);
    }
    ctx.restore();
  }

  // Expanding sonar/controller shockwave from pressed button's world anchor (0 text!)
  function drawInputShockwave(ctx, x, y, progress, btnKeyOrColor, opts) {
    var u = clamp(Number(progress) || 0, 0, 1);
    if (u <= 0.001 || u >= 0.999) return;
    var cfg = opts || {};
    var bKey = normalizeButtonKey(btnKeyOrColor);
    var meta = bKey ? BUTTONS[bKey] : null;
    var col = meta ? meta.color : (btnKeyOrColor || "#60a5fa");
    var glowCol = meta ? meta.glow : col;
    var maxR = cfg.maxRadius || 155;
    var r1 = lerp(14, maxR, easeOutCubic(u));
    var r2 = lerp(8, maxR * 0.68, easeOutCubic(clamp((u - 0.08) / 0.92, 0, 1)));
    var fade = 1 - smoothstep(0.35, 1.0, u);

    ctx.save();
    // Outer sonar ring
    ctx.globalAlpha = fade * 0.82;
    ctx.strokeStyle = glowCol;
    ctx.lineWidth = Math.max(1.5, 4.5 * (1 - u));
    ctx.beginPath();
    ctx.arc(x, y, r1, 0, TAU);
    ctx.stroke();

    // Inner dashed ring
    ctx.globalAlpha = fade * 0.65;
    ctx.strokeStyle = "#fbfaf5";
    ctx.lineWidth = Math.max(1.2, 2.5 * (1 - u));
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(x, y, r2, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pure geometric vector shape echo at center during first 0.55 of shockwave
    if (bKey && u < 0.62 && cfg.symbol !== false) {
      var su = u / 0.62;
      ctx.globalAlpha = (1 - su) * 0.85;
      drawGeometricSymbol(ctx, bKey, x, y, lerp(14, 34, easeOutCubic(su)), glowCol, 3.2 * (1 - su * 0.4));
    }

    ctx.restore();
  }

  function drawVolumetricBeam(ctx, x0, y0, targetX, targetY, opts) {
    var cfg = opts || {};
    var intensity = clamp(cfg.intensity == null ? 1.0 : cfg.intensity, 0, 2);
    if (intensity <= 0.01) return;

    var dx = targetX - x0;
    var dy = targetY - y0;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len;
    var ny = dx / len;
    var w0 = cfg.sourceRadius != null ? cfg.sourceRadius : 18;
    var w1 = cfg.spread != null ? cfg.spread : 135;
    var col = cfg.color || "#fde68a";
    var coreCol = cfg.coreColor || "#fffbeb";
    var t = Number(cfg.t) || 0;
    var seed = cfg.seed || (x0 * 0.1 + y0 * 0.2);

    ctx.save();
    ctx.globalCompositeOperation = cfg.blend || "screen";

    // Outer volumetric shaft
    var grad = ctx.createLinearGradient(x0, y0, targetX, targetY);
    grad.addColorStop(0.0, rgba(col, 0.36 * intensity));
    grad.addColorStop(0.55, rgba(col, 0.18 * intensity));
    grad.addColorStop(1.0, rgba(col, 0.0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x0 + nx * w0, y0 + ny * w0);
    ctx.lineTo(targetX + nx * w1, targetY + ny * w1);
    ctx.lineTo(targetX - nx * w1, targetY - ny * w1);
    ctx.lineTo(x0 - nx * w0, y0 - ny * w0);
    ctx.closePath();
    ctx.fill();

    // Inner bright core cone
    var cGrad = ctx.createLinearGradient(x0, y0, targetX, targetY);
    cGrad.addColorStop(0.0, rgba(coreCol, 0.44 * intensity));
    cGrad.addColorStop(0.65, rgba(col, 0.14 * intensity));
    cGrad.addColorStop(1.0, rgba(col, 0.0));
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.moveTo(x0 + nx * (w0 * 0.45), y0 + ny * (w0 * 0.45));
    ctx.lineTo(targetX + nx * (w1 * 0.46), targetY + ny * (w1 * 0.46));
    ctx.lineTo(targetX - nx * (w1 * 0.46), targetY - ny * (w1 * 0.46));
    ctx.lineTo(x0 - nx * (w0 * 0.45), y0 - ny * (w0 * 0.45));
    ctx.closePath();
    ctx.fill();

    // Target rim pool highlight on prop
    if (cfg.rimPool !== false) {
      var pGrad = ctx.createRadialGradient(targetX, targetY, 4, targetX, targetY, w1 * 0.85);
      pGrad.addColorStop(0.0, rgba(coreCol, 0.34 * intensity));
      pGrad.addColorStop(0.55, rgba(col, 0.14 * intensity));
      pGrad.addColorStop(1.0, rgba(col, 0.0));
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.ellipse(targetX, targetY, w1 * 0.85, w1 * 0.42, Math.atan2(dy, dx), 0, TAU);
      ctx.fill();
    }

    // Drifting dust / underwater silt motes suspended inside beam
    var moteCount = cfg.motes != null ? cfg.motes : 18;
    for (var i = 0; i < moteCount; i++) {
      var u = ((hash(seed + i * 3.7) + t * (0.04 + hash(seed + i * 9.1) * 0.05)) % 1 + 1) % 1;
      var lat = (hash(seed + i * 5.3) - 0.5) * 1.55 + Math.sin(t * 1.6 + i * 2.1) * 0.18;
      if (Math.abs(lat) > 0.92) continue;
      var halfW = lerp(w0, w1, u);
      var mx = lerp(x0, targetX, u) + nx * halfW * lat;
      var my = lerp(y0, targetY, u) + ny * halfW * lat;
      var mr = 1.3 + hash(seed + i * 11.7) * 2.6;
      var ma = Math.sin(u * Math.PI) * (1 - Math.abs(lat)) * 0.65 * intensity;
      ctx.fillStyle = rgba(coreCol, ma);
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawLanternHalo(ctx, x, y, radius, opts) {
    var cfg = opts || {};
    var t = Number(cfg.t) || 0;
    var flicker = 1 + Math.sin(t * 7.3) * 0.035 + Math.cos(t * 13.1) * 0.02;
    var r = Math.max(8, (radius || 95) * flicker);
    var col = cfg.color || "#fbbf24";
    var coreCol = cfg.coreColor || "#fffbeb";
    var intensity = clamp(cfg.intensity == null ? 1.0 : cfg.intensity, 0, 2);

    ctx.save();
    ctx.globalCompositeOperation = cfg.blend || "screen";
    var g = ctx.createRadialGradient(x, y, 2, x, y, r);
    g.addColorStop(0.0, rgba(coreCol, 0.72 * intensity));
    g.addColorStop(0.28, rgba(col, 0.36 * intensity));
    g.addColorStop(0.68, rgba(col, 0.10 * intensity));
    g.addColorStop(1.0, rgba(col, 0.0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawWaterCaustics(ctx, W, H, t, opts) {
    var w = W || DEFAULT_W;
    var h = Math.min(H || DEFAULT_H, (opts && opts.stageH) || STAGE_H);
    var cfg = opts || {};
    var time = Number(t) || 0;
    var intensity = clamp(cfg.intensity == null ? 0.22 : cfg.intensity, 0, 1);
    var col = cfg.color || "#7dd3fc";
    var bands = cfg.bands || 7;

    ctx.save();
    ctx.globalCompositeOperation = cfg.blend || "screen";
    for (var b = 0; b < bands; b++) {
      var baseY = (cfg.topY || 36) + (b / bands) * (h * 0.72);
      var alpha = intensity * (1 - b / (bands * 1.25)) * (0.75 + 0.25 * Math.sin(time * 1.8 + b));
      ctx.strokeStyle = rgba(col, alpha);
      ctx.lineWidth = 2.2 + (b % 3) * 1.2;
      ctx.beginPath();
      for (var x = 0; x <= w; x += 32) {
        var wy = baseY
          + Math.sin(x * 0.014 + time * 1.9 + b * 1.3) * 11
          + Math.cos(x * 0.029 - time * 1.3 + b * 2.1) * 5.5;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawDepthFog(ctx, W, H, t, opts) {
    var w = W || DEFAULT_W;
    var h = Math.min(H || DEFAULT_H, (opts && opts.stageH) || STAGE_H);
    var cfg = opts || {};
    var time = Number(t) || 0;
    var col = cfg.color || "#cbd5e1";
    var density = clamp(cfg.density == null ? 0.16 : cfg.density, 0, 0.8);
    var layers = cfg.layers || 3;

    ctx.save();
    for (var l = 0; l < layers; l++) {
      var yMid = h * (0.36 + l * 0.22);
      var bandH = 78 + l * 28;
      var drift = ((time * (14 + l * 9)) % (w * 0.5));
      var g = ctx.createLinearGradient(0, yMid - bandH, 0, yMid + bandH);
      g.addColorStop(0.0, rgba(col, 0));
      g.addColorStop(0.5, rgba(col, density * (0.7 + l * 0.15)));
      g.addColorStop(1.0, rgba(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, yMid + bandH);
      for (var x = 0; x <= w; x += 40) {
        var wave = Math.sin((x + drift) * 0.008 + l * 2.1) * 16;
        ctx.lineTo(x, yMid - bandH * 0.45 + wave);
      }
      ctx.lineTo(w, yMid + bandH);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawVignetteGrain(ctx, W, H, t, opts) {
    var w = W || DEFAULT_W;
    var h = Math.min(H || DEFAULT_H, (opts && opts.fullHeight) ? (H || DEFAULT_H) : STAGE_H);
    var cfg = opts || {};
    var strength = clamp(cfg.strength == null ? 0.55 : cfg.strength, 0, 1);
    var S = getScionStage();
    if (S && typeof S.drawPaperGrainOverlay === "function" && cfg.paperGrain !== false) {
      S.drawPaperGrainOverlay(ctx, w, h, strength * 0.65, { vignette: false });
    }
    ctx.save();
    var vig = ctx.createRadialGradient(w * 0.5, h * 0.48, w * 0.28, w * 0.5, h * 0.48, w * 0.68);
    vig.addColorStop(0.0, "rgba(0,0,0,0)");
    vig.addColorStop(1.0, "rgba(12,10,8," + (0.34 * strength).toFixed(3) + ")");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawTractorRings(ctx, x0, y0, x1, y1, t, opts) {
    var cfg = opts || {};
    var time = Number(t) || 0;
    var spread = cfg.spread || 120;
    var count = cfg.rings || 5;

    ctx.save();
    var cone = ctx.createLinearGradient(x0, y0, x1, y1);
    cone.addColorStop(0.0, "rgba(139, 92, 246, 0.30)");
    cone.addColorStop(0.5, "rgba(15, 143, 128, 0.22)");
    cone.addColorStop(1.0, "rgba(15, 143, 128, 0.0)");
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(x0 - 22, y0);
    ctx.lineTo(x1 - spread, y1);
    ctx.lineTo(x1 + spread, y1);
    ctx.lineTo(x0 + 22, y0);
    ctx.closePath();
    ctx.fill();

    for (var i = 0; i < count; i++) {
      var u = ((time * 0.65 + i / count) % 1 + 1) % 1;
      var rx = lerp(x0, x1, u);
      var ry = lerp(y0 + 14, y1, u);
      var radX = lerp(24, spread * 0.88, u);
      var radY = radX * 0.26;
      var a = Math.sin(u * Math.PI) * 0.85;
      ctx.strokeStyle = i % 2 === 0 ? rgba("#34d399", a) : rgba("#a855f7", a);
      ctx.lineWidth = 2.2;
      ctx.setLineDash([9, 5]);
      ctx.beginPath();
      ctx.ellipse(rx, ry, radX, radY, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawSnailSilverTrail(ctx, x0, y0, x1, y1, progress, t, opts) {
    var u = clamp(Number(progress == null ? 1 : progress), 0, 1);
    if (u <= 0.01) return;
    var time = Number(t) || 0;
    var cfg = opts || {};
    var ex = lerp(x0, x1, u);
    var ey = lerp(y0, y1, u);

    ctx.save();
    ctx.strokeStyle = cfg.color || "rgba(241, 245, 249, 0.78)";
    ctx.lineWidth = cfg.width || 5.5;
    ctx.lineCap = "round";
    ctx.setLineDash([11, 6]);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    var mx = (x0 + ex) * 0.5;
    var my = (y0 + ey) * 0.5 - (cfg.arc || 18) * u;
    ctx.quadraticCurveTo(mx, my, ex, ey);
    ctx.stroke();
    ctx.setLineDash([]);

    for (var i = 0; i < 7; i++) {
      var su = (i + 0.5) / 7 * u;
      var omt = 1 - su;
      var sx = omt * omt * x0 + 2 * omt * su * mx + su * su * ex;
      var sy = omt * omt * y0 + 2 * omt * su * my + su * su * ey;
      var tw = 0.5 + 0.5 * Math.sin(time * 7.5 + i * 1.9);
      ctx.fillStyle = rgba("#fef08a", 0.35 + tw * 0.55);
      ctx.beginPath();
      ctx.arc(sx, sy - 2, 1.8 + tw * 1.8, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawXRayOverlay(ctx, cx, cy, w, h, progress, drawInsideFn, opts) {
    var u = clamp(Number(progress == null ? 1 : progress), 0, 1);
    if (u <= 0.01) return;
    var cfg = opts || {};
    var rw = w * easeOutBack(u);
    var rh = h * easeOutBack(u);
    var x = cx - rw * 0.5;
    var y = cy - rh * 0.5;

    ctx.save();
    roundedRectPath(ctx, x, y, rw, rh, cfg.radius || 14);
    ctx.fillStyle = cfg.bg || "rgba(10, 25, 47, 0.88)";
    ctx.fill();
    ctx.clip();

    // Blueprint grid lines (0 text!)
    ctx.strokeStyle = "rgba(96, 165, 250, 0.22)";
    ctx.lineWidth = 1;
    for (var gx = x; gx <= x + rw; gx += 18) {
      ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + rh); ctx.stroke();
    }
    for (var gy = y; gy <= y + rh; gy += 18) {
      ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + rw, gy); ctx.stroke();
    }

    if (typeof drawInsideFn === "function") {
      drawInsideFn(ctx, cx, cy, rw, rh, u);
    }

    // Scanning bar sweep
    var scanY = y + (((Number(cfg.t) || 0) * 110) % Math.max(20, rh));
    var sg = ctx.createLinearGradient(0, scanY - 12, 0, scanY + 12);
    sg.addColorStop(0, "rgba(96,165,250,0)");
    sg.addColorStop(0.5, "rgba(147,197,253,0.42)");
    sg.addColorStop(1, "rgba(96,165,250,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(x, scanY - 12, rw, 24);
    ctx.restore();

    ctx.save();
    roundedRectPath(ctx, x, y, rw, rh, cfg.radius || 14);
    ctx.strokeStyle = cfg.borderColor || "#60a5fa";
    ctx.lineWidth = 2.6;
    ctx.stroke();
    ctx.restore();
  }

  // ---------- 18.0s Deterministic Showcase Timeline & State Resolver ----------

  /* Showcase 18.0s Choreography (matches #82 & #83 6-column contact strips!):
   *   0.0 – 2.2s  : Root (4 floating prompts visible; strip sample @ 1.2s)
   *   2.2 – 4.4s  : Stem "x" (✕ action stem; thumb @ 3.2s, strip sample @ 3.4s)
   *   4.4 – 7.8s  : Outcome "x.probable" (Turkey Probable; strip sample @ 6.0s)
   *   7.8 – 9.8s  : Rewind + Stem "o" (○ action stem; strip sample @ 9.0s)
   *   9.8 – 13.8s : Outcome "o.plausible" (Trout + Snail Mail; strip sample @ 11.8s)
   *  13.8 – 14.7s : Stem "triangle" (△ courier dispatch)
   *  14.7 – 18.0s : Outcome "triangle.preposterous" (Alien Saucer; strip sample @ 16.0s)
   */
  function resolveShowcaseTimeline(portalId, rawT, treeOpt) {
    var t = (typeof rawT === "number" && isFinite(rawT)) ? rawT : 0;
    if (t < 0) t = 0;
    if (t > SHOWCASE_DURATION + 0.0001) t = t % SHOWCASE_DURATION;

    var tree = treeOpt || getBranchTree(portalId);
    var sc = (tree && tree.showcaseScript) || {};
    var b1 = normalizeButtonKey(sc.firstButton) || "x";
    var b2 = normalizeButtonKey(sc.secondButton) || "o";
    var b3 = normalizeButtonKey(sc.thirdButton) || "triangle";

    var phase = "root";
    var selectedButton = null;
    var selectedTier = null;
    var phaseT = t;
    var phaseDur = 2.2;
    var stemT = 0;
    var outcomeT = 0;
    var rewindFlash = 0;
    var shockwave = null;
    var snailActive = false;
    var snailT = 0;

    if (t < 2.2) {
      phase = "root";
      phaseT = t;
      phaseDur = 2.2;
    } else if (t < 4.4) {
      phase = "stem";
      selectedButton = b1;
      phaseT = t - 2.2;
      phaseDur = 2.2;
      stemT = phaseT;
      if (phaseT < 0.85) {
        shockwave = { button: b1, u: phaseT / 0.85, anchor: tree.buttons[b1].anchor };
      }
    } else if (t < 7.8) {
      phase = "outcome";
      selectedButton = b1;
      selectedTier = "probable";
      phaseT = t - 4.4;
      phaseDur = 3.4;
      stemT = STEM_DURATION;
      outcomeT = phaseT;
      if (phaseT < 0.75) {
        shockwave = { button: "square", color: TIERS.probable.color, u: phaseT / 0.75, anchor: tree.buttons[b1].anchor };
      }
    } else if (t < 9.8) {
      phase = "stem";
      selectedButton = b2;
      phaseT = t - 7.8;
      phaseDur = 2.0;
      stemT = phaseT;
      rewindFlash = phaseT < 0.28 ? (1 - phaseT / 0.28) : 0;
      if (phaseT < 0.85) {
        shockwave = { button: b2, u: phaseT / 0.85, anchor: tree.buttons[b2].anchor };
      }
    } else if (t < 13.8) {
      phase = "outcome";
      selectedButton = b2;
      selectedTier = "plausible";
      phaseT = t - 9.8;
      phaseDur = 4.0;
      stemT = STEM_DURATION;
      outcomeT = phaseT;
      snailActive = true;
      snailT = clamp(phaseT / 3.4, 0, 1);
      if (phaseT < 0.75) {
        shockwave = { button: "x", color: TIERS.plausible.color, u: phaseT / 0.75, anchor: tree.buttons[b2].anchor };
      }
    } else if (t < 14.7) {
      phase = "stem";
      selectedButton = b3;
      phaseT = t - 13.8;
      phaseDur = 0.9;
      stemT = (phaseT / 0.9) * STEM_DURATION;
      rewindFlash = phaseT < 0.22 ? (1 - phaseT / 0.22) : 0;
      if (phaseT < 0.75) {
        shockwave = { button: b3, u: phaseT / 0.75, anchor: tree.buttons[b3].anchor };
      }
    } else {
      phase = "outcome";
      selectedButton = b3;
      selectedTier = "preposterous";
      phaseT = t - 14.7;
      phaseDur = 3.3;
      stemT = STEM_DURATION;
      outcomeT = phaseT;
      if (phaseT < 0.75) {
        shockwave = { button: "triangle", color: TIERS.preposterous.color, u: phaseT / 0.75, anchor: tree.buttons[b3].anchor };
      }
    }

    // Progressive discovery dots lighting up along the showcase timeline
    var showcaseUnlocked = {};
    if (t >= 4.4) showcaseUnlocked[b1 + ".probable"] = true;
    if (t >= 9.8) showcaseUnlocked[b2 + ".plausible"] = true;
    if (t >= 14.7) showcaseUnlocked[b3 + ".preposterous"] = true;

    return {
      isShowcase: true,
      mode: "showcase",
      phase: phase,
      selectedButton: selectedButton,
      selectedTier: selectedTier,
      t: t,
      phaseT: phaseT,
      phaseDur: phaseDur,
      phaseU: clamp(phaseT / (phaseDur || 1), 0, 1),
      stemT: stemT,
      stemU: clamp(stemT / STEM_DURATION, 0, 1),
      outcomeT: outcomeT,
      outcomeU: clamp(outcomeT / OUTCOME_DURATION, 0, 1),
      rewindFlash: rewindFlash,
      shockwave: shockwave,
      snailActive: snailActive,
      snailT: snailT,
      showcaseUnlocked: showcaseUnlocked
    };
  }

  function computeNodeId(phase, btn, tier) {
    if (phase === "outcome" && btn && tier) return "outcome:" + btn + "." + tier;
    if ((phase === "stem" || phase === "tier_select") && btn) return "stem:" + btn;
    return "root";
  }

  // Unified state resolver: accepts machine, machineState snapshot, custom test override, or null (showcase)
  function resolveState(portalId, rawT, stateOrMachine, opts) {
    var pid = clamp(Math.round(Number(portalId) || (stateOrMachine && stateOrMachine.portalId) || 1), 1, 55);
    var tree = getBranchTree(pid);
    var st = (stateOrMachine && typeof stateOrMachine.getState === "function")
      ? stateOrMachine.getState()
      : (stateOrMachine || {});
    var blind = isBlindMode(st, opts);
    var t = (typeof rawT === "number" && isFinite(rawT)) ? rawT : (Number(st.t) || 0);

    // Support shorthand node / button+tier overrides from automated playtesters (e.g. { node: "x.probable" } or { button: "o", tier: "plausible" })
    var explicitPhase = st.phase;
    var explicitBtn = normalizeButtonKey(st.selectedButton || st.button);
    var explicitTier = normalizeTierKey(st.selectedTier || st.tier);

    if (typeof st.node === "string" && st.node.length > 0) {
      var rawNode = st.node.replace(/^outcome:|^stem:/, "");
      if (rawNode === "root") {
        explicitPhase = "root";
        explicitBtn = null;
        explicitTier = null;
      } else if (rawNode.indexOf(".") !== -1) {
        var parts = rawNode.split(".");
        explicitBtn = normalizeButtonKey(parts[0]) || "x";
        explicitTier = normalizeTierKey(parts[1]) || "probable";
        explicitPhase = "outcome";
      } else {
        explicitBtn = normalizeButtonKey(rawNode) || "x";
        explicitPhase = explicitPhase || "stem";
      }
    } else if (!explicitPhase && explicitBtn && explicitTier) {
      explicitPhase = "outcome";
    } else if (!explicitPhase && explicitBtn) {
      explicitPhase = "stem";
    }

    var useShowcase = (!explicitPhase || explicitPhase === "showcase" || st.mode === "showcase");
    var base;

    if (useShowcase) {
      base = resolveShowcaseTimeline(pid, t, tree);
    } else {
      var ph = explicitPhase;
      var pT = typeof st.phaseT === "number" ? st.phaseT : t;
      var sT = typeof st.stemT === "number"
        ? st.stemT
        : (ph === "stem" ? pT : (ph === "tier_select" || ph === "outcome" ? STEM_DURATION : 0));
      var oT = typeof st.outcomeT === "number" ? st.outcomeT : (ph === "outcome" ? pT : 0);
      var pDur = ph === "stem" ? STEM_DURATION : (ph === "outcome" ? OUTCOME_DURATION : 4.0);
      var sw = st.shockwave || null;
      if (!sw && st.lastInput && typeof st.lastInput.age === "number" && st.lastInput.age < 0.85) {
        sw = {
          button: st.lastInput.button,
          color: st.lastInput.color,
          u: clamp(st.lastInput.age / 0.85, 0, 1),
          anchor: { x: st.lastInput.anchorX, y: st.lastInput.anchorY }
        };
      }
      base = {
        isShowcase: false,
        mode: "interactive",
        phase: ph,
        selectedButton: explicitBtn,
        selectedTier: explicitTier,
        t: t,
        phaseT: pT,
        phaseDur: pDur,
        phaseU: clamp(pT / pDur, 0, 1),
        stemT: sT,
        stemU: clamp(sT / STEM_DURATION, 0, 1),
        outcomeT: oT,
        outcomeU: clamp(oT / OUTCOME_DURATION, 0, 1),
        rewindFlash: st.rewindFlash || 0,
        shockwave: sw,
        snailActive: !!(st.snailActive || (ph === "outcome" && explicitTier === "plausible") || (ph !== "root" && explicitBtn === "triangle")),
        snailT: typeof st.snailT === "number" ? st.snailT : clamp((ph === "outcome" ? oT : sT) / 3.0, 0, 1),
        showcaseUnlocked: null
      };
    }

    var bKey = base.selectedButton;
    var tKey = base.selectedTier;
    var nodeId = computeNodeId(base.phase, bKey, tKey);
    var branchKey = (bKey && tKey) ? (bKey + "." + tKey) : null;
    var buttonInfo = bKey ? tree.buttons[bKey] : null;
    var outcomeInfo = (bKey && tKey && tree.branches[bKey]) ? tree.branches[bKey][tKey] : null;

    var unlockedMap = discovery.getPortalUnlocked(pid);
    if (base.showcaseUnlocked) {
      var merged = {};
      Object.keys(unlockedMap).forEach(function (k) { merged[k] = true; });
      Object.keys(base.showcaseUnlocked).forEach(function (k) { merged[k] = true; });
      unlockedMap = merged;
    } else if (branchKey) {
      unlockedMap[branchKey] = true;
    }

    var camPose = (st.cam && typeof st.cam.getPose === "function" && !useShowcase)
      ? st.cam.getPose(t)
      : computeDeterministicCameraPose(base, tree);

    return {
      portalId: pid,
      station: tree.station,
      clue: tree.clue,
      bolasStyle: tree.bolasStyle,
      recipeBadge: tree.recipeBadge,
      tree: tree,

      isShowcase: base.isShowcase,
      mode: base.mode,
      phase: base.phase,
      nodeId: nodeId,
      branchId: branchKey,
      selectedButton: bKey,
      selectedTier: tKey,
      button: bKey,
      tier: tKey,
      buttonMeta: bKey ? BUTTONS[bKey] : null,
      tierMeta: tKey ? TIERS[tKey] : null,
      buttonInfo: buttonInfo,
      outcomeInfo: outcomeInfo,

      t: base.t,
      localT: base.phase === "outcome" ? base.outcomeT : (base.phase === "stem" ? base.stemT : base.phaseT),
      phaseT: base.phaseT,
      phaseDur: base.phaseDur,
      phaseU: base.phaseU,
      stemT: base.stemT,
      stemU: base.stemU,
      outcomeT: base.outcomeT,
      outcomeU: base.outcomeU,
      outcomeLoopT: base.outcomeT > OUTCOME_DURATION ? (base.outcomeT - OUTCOME_DURATION) : 0,
      rewindFlash: base.rewindFlash,

      lampOn: bKey === "x" ? true : (typeof st.lamp === "boolean" ? st.lamp : true),
      ballastOn: bKey === "o" ? true : !!st.ballast,
      snailActive: base.snailActive,
      snailT: base.snailT,

      blind: blind,
      showCaptions: !blind,
      camPose: camPose,
      shockwave: base.shockwave,
      unlocked: unlockedMap,
      unlockedCount: Object.keys(unlockedMap).length
    };
  }

  // ---------- 2-Stage Interactive Branching State Machine ----------

  function createMachine(portalId, opts) {
    var cfg = opts || {};
    var pid = clamp(Math.round(Number(portalId) || 1), 1, 55);
    var cam = createCameraRig(cfg.camera);
    var particles = createParticlePool(pid * 13.7 + 5.1);
    var prevGamepadButtons = {};

    var machine = {
      portalId: pid,
      phase: cfg.initialPhase || "root", // "root" | "stem" | "tier_select" | "outcome" | "showcase"
      selectedButton: normalizeButtonKey(cfg.selectedButton),
      selectedTier: normalizeTierKey(cfg.selectedTier),
      t: Number(cfg.t) || 0,
      phaseT: 0,
      stemT: 0,
      outcomeT: 0,
      hitStopT: 0,
      rewindFlash: 0,
      showCaptions: cfg.showCaptions !== false,
      muted: !!cfg.muted,
      cam: cam,
      particles: particles,
      hitboxes: [],
      lastInput: null,
      history: [],
      onChange: typeof cfg.onChange === "function" ? cfg.onChange : null,

      _notify: function (eventTag, extra) {
        this.history.push({
          event: eventTag,
          phase: this.phase,
          button: this.selectedButton,
          tier: this.selectedTier,
          t: Number(this.t.toFixed(3))
        });
        if (this.history.length > 40) this.history.shift();
        if (typeof this.onChange === "function") {
          try { this.onChange(this, eventTag, extra || null); } catch (e) {}
        }
      },

      setPortal: function (nextPortalId, startPhase) {
        this.portalId = clamp(Math.round(Number(nextPortalId) || 1), 1, 55);
        this.phase = startPhase || "root";
        this.selectedButton = null;
        this.selectedTier = null;
        this.t = 0;
        this.phaseT = 0;
        this.stemT = 0;
        this.outcomeT = 0;
        this.hitStopT = 0;
        this.rewindFlash = 0;
        this.lastInput = null;
        this.hitboxes = [];
        this.cam.resetFocus();
        this.particles.clear();
        var S = getScionStage();
        if (S && typeof S.preloadPortalPlates === "function") {
          S.preloadPortalPlates(this.portalId);
        }
        this._notify("portal:" + this.portalId);
        return this;
      },

      // Stage-1 explicit selection: presses one of ✕ / ○ / △ / □ and plays 0..2.2s physical stem
      selectButton: function (btnKey, anchorOverride) {
        var b = normalizeButtonKey(btnKey);
        if (!b) return false;
        var tree = getBranchTree(this.portalId);
        var bInfo = tree.buttons[b];
        var bMeta = BUTTONS[b];
        var anchor = anchorOverride || bInfo.anchor || DEFAULT_HOTSPOTS[b];

        this.phase = "stem";
        this.selectedButton = b;
        this.selectedTier = null;
        this.phaseT = 0;
        this.stemT = 0;
        this.outcomeT = 0;
        this.hitStopT = 0.052; // Tactile Nit's Check hit-stop!
        this.lastInput = {
          type: "button",
          button: b,
          tier: null,
          symbol: bMeta.symbol,
          color: bMeta.color,
          anchorX: anchor.x,
          anchorY: anchor.y,
          atT: this.t,
          age: 0
        };

        this.cam.focusOn(anchor.x, anchor.y, bMeta.zoomTarget, bMeta.rollImpulse);
        this.cam.triggerShake(bMeta.shakeAmp);
        this.particles.emit(bMeta.particlePreset, anchor.x, anchor.y, 18, { color: bMeta.glow });
        audio.playButton(b, this.muted);
        this._notify("stem:" + b, { button: b });
        return true;
      },

      // Stage-2 explicit selection: chooses Probable / Plausible / Preposterous for active button
      selectTier: function (tierKey, btnOverride) {
        var tKey = normalizeTierKey(tierKey);
        if (!tKey) return false;
        var bKey = normalizeButtonKey(btnOverride) || this.selectedButton || "x";
        var tree = getBranchTree(this.portalId);
        var anchor = tree.buttons[bKey].anchor || DEFAULT_HOTSPOTS[bKey];
        var tMeta = TIERS[tKey];

        this.selectedButton = bKey;
        this.selectedTier = tKey;
        this.phase = "outcome";
        this.phaseT = 0;
        this.stemT = Math.max(this.stemT, STEM_DURATION);
        this.outcomeT = 0;
        this.hitStopT = 0.045;
        this.lastInput = {
          type: "tier",
          button: tMeta.button,
          tier: tKey,
          symbol: tMeta.symbol,
          color: tMeta.color,
          anchorX: anchor.x,
          anchorY: anchor.y,
          atT: this.t,
          age: 0
        };

        var unlockRes = discovery.unlock(this.portalId, bKey, tKey);
        var panTargetX = tKey === "probable" ? 560 : (tKey === "plausible" ? 700 : 640);
        var panTargetY = tKey === "preposterous" ? 270 : 340;
        this.cam.focusOn(panTargetX, panTargetY, 1.05, tKey === "preposterous" ? -0.01 : 0);
        this.cam.triggerShake(7.5);
        this.particles.emit(tMeta.particlePreset, anchor.x, anchor.y, 22, { color: tMeta.glow });
        audio.playTier(tKey, this.muted);
        this._notify("outcome:" + bKey + "." + tKey, unlockRes);
        return true;
      },

      // Direct jump from 4×3 Branching Tree Matrix or automated playtester!
      jumpToBranch: function (btnKey, tierKey) {
        var b = normalizeButtonKey(btnKey) || "x";
        var t = normalizeTierKey(tierKey) || "probable";
        this.selectedButton = b;
        this.stemT = STEM_DURATION;
        return this.selectTier(t, b);
      },

      // Context-sensitive PlayStation face button handler (✕ · ○ · △ · □)
      pressButton: function (btnKey, anchorOverride) {
        var b = normalizeButtonKey(btnKey);
        if (!b) return false;
        if (this.phase === "root" || this.phase === "showcase") {
          return this.selectButton(b, anchorOverride);
        }
        if (this.phase === "stem") {
          if (b === this.selectedButton && this.phaseT > 0.25) {
            // Pressing same button again fast-forwards straight to tier_select!
            this.phase = "tier_select";
            this.phaseT = 0;
            this.stemT = STEM_DURATION;
            this._notify("tier_select:" + b);
            return true;
          }
          return this.selectButton(b, anchorOverride);
        }
        if (this.phase === "tier_select") {
          var mapped = TIER_SELECT_BUTTON_MAP[b];
          if (mapped === "rewind") return this.rewind();
          return this.selectTier(mapped);
        }
        if (this.phase === "outcome") {
          if (b === "o") return this.rewindToTierSelect();
          if (b === "square") return this.selectTier("probable");
          if (b === "x") return this.selectTier("plausible");
          if (b === "triangle") return this.selectTier("preposterous");
        }
        return false;
      },

      rewindToTierSelect: function () {
        if (!this.selectedButton) return this.resetToRoot();
        this.phase = "tier_select";
        this.selectedTier = null;
        this.phaseT = 0;
        this.outcomeT = 0;
        this.rewindFlash = 1.0;
        var tree = getBranchTree(this.portalId);
        var anchor = tree.buttons[this.selectedButton].anchor;
        this.cam.focusOn(anchor.x, anchor.y, 1.05, 0);
        audio.playRewind(this.muted);
        this._notify("rewind:tier_select");
        return true;
      },

      rewind: function () {
        if (this.phase === "outcome" && this.selectedButton) {
          return this.rewindToTierSelect();
        }
        return this.resetToRoot();
      },

      resetToRoot: function () {
        this.phase = "root";
        this.selectedButton = null;
        this.selectedTier = null;
        this.phaseT = 0;
        this.stemT = 0;
        this.outcomeT = 0;
        this.hitStopT = 0;
        this.rewindFlash = 1.0;
        this.cam.resetFocus();
        audio.playRewind(this.muted);
        this._notify("rewind:root");
        return true;
      },

      randomBranch: function (deterministicSeed) {
        var unlocked = discovery.getPortalUnlocked(this.portalId);
        var candidates = [];
        var all = [];
        for (var bi = 0; bi < BUTTON_ORDER.length; bi++) {
          for (var ti = 0; ti < TIER_ORDER.length; ti++) {
            var pair = { b: BUTTON_ORDER[bi], t: TIER_ORDER[ti] };
            all.push(pair);
            if (!unlocked[pair.b + "." + pair.t]) candidates.push(pair);
          }
        }
        var pool = candidates.length > 0 ? candidates : all;
        var r = typeof deterministicSeed === "number" ? hash(deterministicSeed) : Math.random();
        var pick = pool[Math.floor(r * pool.length) % pool.length];
        audio.playRandom(this.muted);
        return this.jumpToBranch(pick.b, pick.t);
      },

      startShowcase: function (atTimeSec) {
        this.phase = "showcase";
        this.t = typeof atTimeSec === "number" ? clamp(atTimeSec, 0, SHOWCASE_DURATION) : 0;
        this.phaseT = 0;
        this.cam.resetFocus();
        this.particles.clear();
        this._notify("showcase:start");
        return this;
      },

      setShowcaseTime: function (sec) {
        this.phase = "showcase";
        var clamped = Number(sec) || 0;
        if (clamped < 0) clamped = 0;
        if (clamped > SHOWCASE_DURATION + 0.0001) clamped = clamped % SHOWCASE_DURATION;
        this.t = clamped;
        return this.resolve();
      },

      update: function (dt) {
        var step = clamp(Number(dt) || (1 / 60), 0, 0.1);
        this.t += step;

        if (this.rewindFlash > 0) {
          this.rewindFlash = Math.max(0, this.rewindFlash - step * 3.8);
        }
        if (this.lastInput) {
          this.lastInput.age += step;
        }

        if (this.phase === "showcase") {
          this.t = this.t % SHOWCASE_DURATION;
          return this.resolve();
        }

        // Camera & particles continue updating during brief hit-stop for ultra-juicy feel!
        this.cam.update(step);
        this.particles.update(step);

        if (this.hitStopT > 0) {
          this.hitStopT = Math.max(0, this.hitStopT - step);
          return this.resolve();
        }

        this.phaseT += step;
        if (this.phase === "stem") {
          this.stemT = this.phaseT;
          if (this.phaseT >= STEM_DURATION) {
            this.phase = "tier_select";
            this.phaseT = 0;
            this.stemT = STEM_DURATION;
            this._notify("tier_select:" + this.selectedButton);
          }
        } else if (this.phase === "tier_select") {
          this.stemT += step;
        } else if (this.phase === "outcome") {
          this.outcomeT = this.phaseT;
        }

        return this.resolve();
      },

      hitTest: function (canvasX, canvasY) {
        for (var i = this.hitboxes.length - 1; i >= 0; i--) {
          var hb = this.hitboxes[i];
          if (
            canvasX >= hb.x &&
            canvasX <= hb.x + hb.w &&
            canvasY >= hb.y &&
            canvasY <= hb.y + hb.h
          ) {
            return hb;
          }
        }
        return null;
      },

      handleClick: function (canvasX, canvasY) {
        var hit = this.hitTest(canvasX, canvasY);
        if (!hit) return null;
        if (hit.kind === "button") {
          this.selectButton(hit.button, hit.anchor);
        } else if (hit.kind === "tier") {
          this.selectTier(hit.tier);
        } else if (hit.kind === "rewind") {
          this.rewind();
        } else if (hit.kind === "root") {
          this.resetToRoot();
        } else if (hit.kind === "random") {
          this.randomBranch();
        } else if (hit.kind === "matrix") {
          this.jumpToBranch(hit.button, hit.tier);
        }
        return hit;
      },

      pollGamepad: function (navOverride) {
        var nav = navOverride || (root && root.navigator) || null;
        if (!nav || typeof nav.getGamepads !== "function") return null;
        var pads;
        try { pads = nav.getGamepads(); } catch (e) { return null; }
        if (!pads) return null;

        var mapping = [
          { idx: 0, act: "x" },        // Cross / A
          { idx: 1, act: "o" },        // Circle / B
          { idx: 2, act: "square" },   // Square / X
          { idx: 3, act: "triangle" }, // Triangle / Y
          { idx: 8, act: "root" },     // Share / Back -> New Button
          { idx: 9, act: "random" }    // Options / Start -> Random Branch
        ];

        for (var p = 0; p < pads.length; p++) {
          var pad = pads[p];
          if (!pad || !pad.connected || !pad.buttons) continue;
          for (var m = 0; m < mapping.length; m++) {
            var item = mapping[m];
            var gpBtn = pad.buttons[item.idx];
            var down = !!(gpBtn && (gpBtn.pressed || gpBtn.value > 0.55));
            var key = p + ":" + item.idx;
            var wasDown = !!prevGamepadButtons[key];
            prevGamepadButtons[key] = down;
            if (down && !wasDown) {
              if (item.act === "root") this.resetToRoot();
              else if (item.act === "random") this.randomBranch();
              else this.pressButton(item.act);
              return item.act;
            }
          }
        }
        return null;
      },

      getState: function () {
        return {
          portalId: this.portalId,
          phase: this.phase,
          nodeId: computeNodeId(this.phase, this.selectedButton, this.selectedTier),
          selectedButton: this.selectedButton,
          selectedTier: this.selectedTier,
          t: this.t,
          phaseT: this.phaseT,
          stemT: this.stemT,
          outcomeT: this.outcomeT,
          hitStopT: this.hitStopT,
          rewindFlash: this.rewindFlash,
          showCaptions: this.showCaptions,
          muted: this.muted,
          lastInput: this.lastInput,
          cam: this.cam,
          particles: this.particles,
          unlocked: discovery.getPortalUnlocked(this.portalId),
          unlockedCount: discovery.getPortalCount(this.portalId),
          totalUnlockedCount: discovery.getTotalCount()
        };
      },

      resolve: function (opts) {
        return resolveState(this.portalId, this.t, this, opts);
      }
    };

    var S = getScionStage();
    if (S && typeof S.preloadPortalPlates === "function") {
      S.preloadPortalPlates(pid);
    }

    return machine;
  }

  // ---------- Diegetic PlayStation ✕ · ○ · △ · □ Prompt & BOLAS Slate HUD ----------

  function drawPSBadge(ctx, btnKey, cx, cy, r, opts) {
    var b = normalizeButtonKey(btnKey) || "x";
    var meta = BUTTONS[b];
    var cfg = opts || {};
    var rad = r || 17;
    var active = !!cfg.active;
    var pulse = cfg.pulse || 0;

    ctx.save();
    if (pulse > 0) {
      ctx.strokeStyle = rgba(meta.glow, 0.45 * pulse);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, rad + 4 + pulse * 5, 0, TAU);
      ctx.stroke();
    }

    // Contact shadow
    ctx.fillStyle = "rgba(10, 9, 8, 0.42)";
    ctx.beginPath();
    ctx.arc(cx + 1.5, cy + 2.5, rad + 1, 0, TAU);
    ctx.fill();

    // Tactile dark slate button cap + ivory/color rim
    ctx.fillStyle = active ? meta.color : "#181b20";
    ctx.strokeStyle = active ? "#ffffff" : meta.glow;
    ctx.lineWidth = active ? 2.6 : 2.0;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Specular top highlight arc
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(cx, cy, rad - 3, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Pure geometric PlayStation vector symbol (0 text!)
    drawGeometricSymbol(
      ctx,
      b,
      cx,
      cy,
      rad * 0.82,
      active ? "#ffffff" : meta.glow,
      Math.max(2.3, rad * 0.19)
    );
    ctx.restore();
  }

  function _drawCalloutPromptPill(ctx, btnKey, labelText, subText, anchorX, anchorY, badgeX, badgeY, accentColor, blind, opts) {
    if (blind) return null;
    var cfg = opts || {};
    var pulse = cfg.pulse || 0;

    ctx.save();
    ctx.font = '700 13px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
    var wMain = ctx.measureText(labelText || "").width;
    var wSub = 0;
    if (subText) {
      ctx.font = '600 10.5px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
      wSub = ctx.measureText(subText).width;
    }
    var pillW = Math.ceil(Math.max(wMain, wSub) + 54);
    var pillH = subText ? 40 : 32;
    var px = clamp(badgeX - pillW * 0.5, 16, DEFAULT_W - pillW - 16);
    var py = clamp(badgeY - pillH * 0.5, 14, STAGE_H - pillH - 14);
    var nearX = clamp(anchorX, px, px + pillW);
    var nearY = clamp(anchorY, py, py + pillH);

    // Leader line + target hotspot pin dot
    if (cfg.leader !== false) {
      ctx.strokeStyle = "rgba(20, 17, 13, 0.55)";
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(nearX, nearY);
      ctx.lineTo(anchorX, anchorY);
      ctx.stroke();

      ctx.strokeStyle = "#fbfaf7";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(nearX, nearY);
      ctx.lineTo(anchorX, anchorY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#fbfaf7";
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(anchorX, anchorY, 4.8, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Pill shadow + cream PAELEO tag card
    ctx.fillStyle = "rgba(12, 10, 8, 0.36)";
    roundedRectPath(ctx, px + 2.5, py + 3.5, pillW, pillH, 16);
    ctx.fill();

    ctx.fillStyle = cfg.active ? accentColor : "rgba(251, 250, 247, 0.95)";
    ctx.strokeStyle = cfg.active ? "#ffffff" : accentColor;
    ctx.lineWidth = cfg.active ? 2.4 : 2.0;
    roundedRectPath(ctx, px, py, pillW, pillH, 16);
    ctx.fill();
    ctx.stroke();

    // PS vector badge on left of pill
    drawPSBadge(ctx, btnKey, px + 18, py + pillH * 0.5, 13.5, {
      active: !!cfg.active,
      pulse: pulse
    });

    // Crisp label text (guarded by blind check)
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = '700 12.5px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = cfg.active ? "#ffffff" : PALETTE.ink;
    safeHudFillText(ctx, labelText, px + 38, py + (subText ? 13.5 : pillH * 0.5 + 0.5), blind);

    if (subText) {
      ctx.font = '600 10px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillStyle = cfg.active ? "rgba(255,255,255,0.88)" : accentColor;
      safeHudFillText(ctx, subText, px + 38, py + 28.5, blind);
    }

    ctx.restore();
    return {
      x: px,
      y: py,
      w: pillW,
      h: pillH,
      anchor: { x: anchorX, y: anchorY }
    };
  }

  function _fmtClock24(sec) {
    var v = Math.max(0, Number(sec) || 0);
    var s = Math.floor(v);
    var f = Math.floor((v - s) * 24 + 0.001) % 24;
    return pad2(s) + ":" + pad2(f);
  }

  /* drawControllerHUD(ctx, W, H, machineState, opts)
   * STRICT PAELEO BLIND-MODE LAW:
   *   When opts.showCaptions === false OR machineState.showCaptions === false,
   *   draws ZERO text (0 fillText / strokeText calls) and hides HUD bars cleanly!
   */
  function drawControllerHUD(ctx, W, H, machineState, opts) {
    var cfg = opts || {};
    var pid = (cfg.portalId) || (machineState && machineState.portalId) || 1;
    var resolved = (machineState && machineState.tree && machineState.nodeId)
      ? machineState
      : resolveState(pid, cfg.t != null ? cfg.t : (machineState && machineState.t), machineState, cfg);

    var blind = isBlindMode(machineState, cfg);
    if (blind) {
      if (machineState && Array.isArray(machineState.hitboxes)) {
        machineState.hitboxes.length = 0;
      }
      return { hitboxes: [], blind: true };
    }

    var w = W || DEFAULT_W;
    var h = H || DEFAULT_H;
    var slateH = SLATE_H; // 80px -> y = 640..720
    var slateY = h - slateH;
    var tree = resolved.tree;
    var hitboxes = [];
    var pulse = 0.5 + 0.5 * Math.sin((resolved.t || 0) * 5.2);

    // Optional hotspot overrides passed per-scene in opts.hotspots
    function getHotspot(bKey) {
      if (cfg.hotspots && cfg.hotspots[bKey]) {
        return parseHotspot(cfg.hotspots[bKey], tree.buttons[bKey].anchor);
      }
      return tree.buttons[bKey].anchor;
    }

    ctx.save();

    // 1. Diegetic Stage Prompts (y < 640) with pairwise vertical collision separation
    if (resolved.phase === "root") {
      var rootPlacements = [];
      for (var bi0 = 0; bi0 < BUTTON_ORDER.length; bi0++) {
        var k0 = BUTTON_ORDER[bi0];
        var hs0 = getHotspot(k0);
        var bob0 = Math.sin((resolved.t || 0) * 3.1 + bi0 * 1.4) * 3.5;
        rootPlacements.push({
          key: k0,
          info: tree.buttons[k0],
          ax: hs0.x,
          ay: hs0.y,
          bx: hs0.bx,
          by: hs0.by + bob0
        });
      }
      // Relax vertical overlap if two pills sit horizontally within 230px
      for (var pass = 0; pass < 2; pass++) {
        for (var iA = 0; iA < rootPlacements.length; iA++) {
          for (var iB = iA + 1; iB < rootPlacements.length; iB++) {
            var pA = rootPlacements[iA];
            var pB = rootPlacements[iB];
            if (Math.abs(pA.bx - pB.bx) < 235 && Math.abs(pA.by - pB.by) < 46) {
              var push = (46 - Math.abs(pA.by - pB.by)) * 0.55;
              if (pA.by <= pB.by) {
                pA.by = clamp(pA.by - push, 34, STAGE_H - 42);
                pB.by = clamp(pB.by + push, 34, STAGE_H - 42);
              } else {
                pA.by = clamp(pA.by + push, 34, STAGE_H - 42);
                pB.by = clamp(pB.by - push, 34, STAGE_H - 42);
              }
            }
          }
        }
      }
      for (var bi = 0; bi < rootPlacements.length; bi++) {
        var rp = rootPlacements[bi];
        var bKey = rp.key;
        var bInfo = rp.info;
        var rect = _drawCalloutPromptPill(
          ctx,
          bKey,
          bInfo.shortLabel,
          null,
          rp.ax,
          rp.ay,
          rp.bx,
          rp.by,
          BUTTONS[bKey].color,
          blind,
          { pulse: pulse * 0.7 }
        );
        if (rect) {
          hitboxes.push({
            id: "btn:" + bKey,
            kind: "button",
            button: bKey,
            x: rect.x,
            y: rect.y,
            w: rect.w,
            h: rect.h,
            anchor: rect.anchor,
            label: bInfo.shortLabel
          });
        }
      }
    } else if (resolved.phase === "stem" && resolved.selectedButton) {
      var sb = resolved.selectedButton;
      var sbInfo = tree.buttons[sb];
      var shs = getHotspot(sb);
      var sRect = _drawCalloutPromptPill(
        ctx,
        sb,
        sbInfo.shortLabel.toUpperCase(),
        "STAGE 1 ACTION",
        shs.x,
        shs.y,
        shs.bx,
        shs.by,
        BUTTONS[sb].color,
        blind,
        { active: true, pulse: 1.0 }
      );
      if (sRect) {
        hitboxes.push({
          id: "btn:" + sb,
          kind: "button",
          button: sb,
          x: sRect.x,
          y: sRect.y,
          w: sRect.w,
          h: sRect.h,
          anchor: sRect.anchor,
          label: sbInfo.shortLabel
        });
      }
    } else if (resolved.phase === "tier_select" && resolved.selectedButton) {
      var tbKey = resolved.selectedButton;
      var centerHs = getHotspot(tbKey);
      var hubX = clamp(centerHs.x, 340, w - 340);
      var hubY = clamp(centerHs.y, 240, 470);
      var fanIn = easeOutBack(clamp(resolved.phaseT / 0.38, 0, 1));

      for (var ti = 0; ti < TIER_ORDER.length; ti++) {
        var tKey = TIER_ORDER[ti];
        var tMeta = TIERS[tKey];
        var off = DEFAULT_TIER_OFFSETS[tKey];
        var outSpec = tree.branches[tbKey][tKey];
        var bx = hubX + off.dx * fanIn;
        var by = hubY + off.dy * fanIn + Math.sin((resolved.t || 0) * 3.4 + ti * 1.7) * 3;
        var tRect = _drawCalloutPromptPill(
          ctx,
          tMeta.button,
          tMeta.label,
          outSpec.title.slice(0, 28),
          centerHs.x,
          centerHs.y,
          bx,
          by,
          tMeta.color,
          blind,
          { pulse: pulse * 0.85 }
        );
        if (tRect) {
          hitboxes.push({
            id: "tier:" + tKey,
            kind: "tier",
            tier: tKey,
            button: tbKey,
            x: tRect.x,
            y: tRect.y,
            w: tRect.w,
            h: tRect.h,
            label: tMeta.label
          });
        }
      }

      // [○] Rewind pill in top-left
      var rwRect = _drawCalloutPromptPill(
        ctx,
        "o",
        "Rewind",
        null,
        92,
        34,
        92,
        34,
        BUTTONS.o.color,
        blind,
        { leader: false }
      );
      if (rwRect) {
        hitboxes.push({
          id: "rewind",
          kind: "rewind",
          x: rwRect.x,
          y: rwRect.y,
          w: rwRect.w,
          h: rwRect.h,
          label: "Rewind"
        });
      }
    } else if (resolved.phase === "outcome" && !resolved.isShowcase) {
      // Non-intrusive top action bar in interactive play so player can explore other tiers/buttons
      var pillSpecs = [
        { id: "rewind", kind: "rewind", btn: "o", txt: "Try Another Tier", col: BUTTONS.o.color, x: 112 },
        { id: "root", kind: "root", btn: "x", txt: "New Button [Bksp]", col: PALETTE.inkSoft, x: 302 },
        { id: "random", kind: "random", btn: "triangle", txt: "Random Branch [R]", col: TIERS.plausible.color, x: 498 }
      ];
      for (var pi = 0; pi < pillSpecs.length; pi++) {
        var ps = pillSpecs[pi];
        var pr = _drawCalloutPromptPill(ctx, ps.btn, ps.txt, null, ps.x, 30, ps.x, 30, ps.col, blind, { leader: false });
        if (pr) {
          hitboxes.push({
            id: ps.id,
            kind: ps.kind,
            x: pr.x,
            y: pr.y,
            w: pr.w,
            h: pr.h,
            label: ps.txt
          });
        }
      }
    }

    // Subtle tape-rewind flash overlay on rewind transition
    if (resolved.rewindFlash > 0.02) {
      ctx.fillStyle = rgba("#fbfaf7", resolved.rewindFlash * 0.22);
      ctx.fillRect(0, 0, w, slateY);
    }

    // 2. Bottom BOLAS Editorial Slate (y = 640..720) + 4×3 Branch Discovery Matrix
    ctx.fillStyle = PALETTE.paper;
    ctx.fillRect(0, slateY, w, slateH);
    ctx.fillStyle = PALETTE.ink;
    ctx.fillRect(0, slateY, w, 2.5);

    var topRowY = slateY + 19;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.font = '700 12.5px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = PALETTE.ink;
    safeHudFillText(ctx, tree.station, 20, topRowY, blind);

    // Path Breadcrumb Pills
    var crumbX = 144;
    if (resolved.selectedButton) {
      var bMeta = BUTTONS[resolved.selectedButton];
      var bLabel = tree.buttons[resolved.selectedButton].shortLabel.toUpperCase();
      ctx.font = '700 11px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
      var bw = Math.ceil(ctx.measureText(bLabel).width + 34);
      roundedRectPath(ctx, crumbX, topRowY - 11, bw, 22, 4);
      ctx.fillStyle = bMeta.color;
      ctx.fill();
      drawGeometricSymbol(ctx, resolved.selectedButton, crumbX + 12, topRowY, 6.5, "#ffffff", 2.0);
      ctx.fillStyle = "#ffffff";
      safeHudFillText(ctx, bLabel, crumbX + 23, topRowY + 0.5, blind);
      crumbX += bw + 8;

      ctx.fillStyle = PALETTE.mute;
      safeHudFillText(ctx, "\u2192", crumbX, topRowY, blind);
      crumbX += 18;

      if (resolved.selectedTier) {
        var tMeta2 = TIERS[resolved.selectedTier];
        var tTxt = tMeta2.label.toUpperCase();
        var tw2 = Math.ceil(ctx.measureText(tTxt).width + 34);
        roundedRectPath(ctx, crumbX, topRowY - 11, tw2, 22, 4);
        ctx.fillStyle = tMeta2.color;
        ctx.fill();
        drawGeometricSymbol(ctx, tMeta2.button, crumbX + 12, topRowY, 6.5, "#ffffff", 2.0);
        ctx.fillStyle = "#ffffff";
        safeHudFillText(ctx, tTxt, crumbX + 23, topRowY + 0.5, blind);
      } else {
        ctx.fillStyle = PALETTE.inkSoft;
        safeHudFillText(ctx, "STAGE 2 \u00b7 PICK OUTCOME TIER [\u25a1 \u00b7 \u2715 \u00b7 \u25b3]", crumbX, topRowY + 0.5, blind);
      }
    } else {
      ctx.font = '600 11.5px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillStyle = PALETTE.inkSoft;
      safeHudFillText(ctx, "STAGE 1 \u00b7 PRESS A PROP ACTION  [\u2715 LAMP \u00b7 \u25cb BALLAST \u00b7 \u25b3 SNAIL \u00b7 \u25a1 PROBE]", crumbX, topRowY + 0.5, blind);
    }

    // Main literary headline row (y = 692)
    var mainRowY = slateY + 53;
    var headline = tree.clue;
    var badgeCol = PALETTE.ink;
    var badgeCode = "A";

    if (resolved.phase === "stem" && resolved.buttonInfo) {
      headline = resolved.buttonInfo.physicalStem;
      badgeCol = BUTTONS[resolved.selectedButton].color;
      badgeCode = "1";
    } else if (resolved.phase === "tier_select" && resolved.buttonInfo) {
      headline = resolved.buttonInfo.actionPrompt + " \u2014 What happens next?";
      badgeCol = BUTTONS[resolved.selectedButton].color;
      badgeCode = "?";
    } else if (resolved.phase === "outcome" && resolved.outcomeInfo) {
      var oTitle = String(resolved.outcomeInfo.title || "").trim();
      var oCap = String(resolved.outcomeInfo.caption || "").trim();
      headline = (oCap && oCap.toLowerCase() !== oTitle.toLowerCase())
        ? (oTitle + " \u2014 " + oCap)
        : (oTitle || oCap);
      badgeCol = TIERS[resolved.selectedTier].color;
      badgeCode = TIERS[resolved.selectedTier].code;
    }

    roundedRectPath(ctx, 20, mainRowY - 13, 26, 25, 3);
    ctx.fillStyle = badgeCol;
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = '800 13.5px "Big Shoulders Display", -apple-system, BlinkMacSystemFont, sans-serif';
    safeHudFillText(ctx, badgeCode, 33, mainRowY + 0.5, blind);

    ctx.textAlign = "left";
    ctx.fillStyle = PALETTE.ink;
    ctx.font = '600 19.5px "Literata", Georgia, "Iowan Old Style", serif';
    safeHudFillText(ctx, headline, 56, mainRowY + 0.5, blind, w - 330);

    // 3. Right-hand 12-Dot Branch Discovery Matrix (4 rows × 3 cols) + Counter & Timecode
    var matX = w - 138;
    var matY = slateY + 13;
    var rowStep = 14;
    var colStep = 18;

    // Matrix backing card
    roundedRectPath(ctx, matX - 24, matY - 6, 86, 62, 5);
    ctx.fillStyle = PALETTE.paper2;
    ctx.fill();
    ctx.strokeStyle = PALETTE.rule;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    for (var r = 0; r < 4; r++) {
      var rBtn = BUTTON_ORDER[r];
      var ry = matY + 4 + r * rowStep;
      // Mini geometric row icon (✕ ○ △ □)
      drawGeometricSymbol(ctx, rBtn, matX - 12, ry, 4.8, BUTTONS[rBtn].color, 1.6);

      for (var c = 0; c < 3; c++) {
        var cTier = TIER_ORDER[c];
        var cx = matX + 6 + c * colStep;
        var brId = rBtn + "." + cTier;
        var isUnl = !!(resolved.unlocked && resolved.unlocked[brId]);
        var isCurr = (resolved.selectedButton === rBtn && resolved.selectedTier === cTier && resolved.phase === "outcome");

        if (isCurr) {
          ctx.strokeStyle = PALETTE.stamp;
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.arc(cx, ry, 6.2, 0, TAU);
          ctx.stroke();
        }

        ctx.fillStyle = isUnl ? TIERS[cTier].color : "#d6d0c2";
        ctx.strokeStyle = isUnl ? "#14110d" : "#b5ae9e";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(cx, ry, isCurr ? 4.2 : 3.8, 0, TAU);
        ctx.fill();
        ctx.stroke();

        hitboxes.push({
          id: "matrix:" + brId,
          kind: "matrix",
          button: rBtn,
          tier: cTier,
          x: cx - 7,
          y: ry - 6,
          w: 14,
          h: 12,
          label: rBtn + "." + cTier
        });
      }
    }

    // Rightmost timecode & N/12 counter
    ctx.textAlign = "right";
    ctx.fillStyle = PALETTE.ink;
    ctx.font = '700 13.5px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
    safeHudFillText(ctx, _fmtClock24(resolved.t), w - 16, slateY + 26, blind);

    ctx.fillStyle = resolved.unlockedCount >= 12 ? TIERS.plausible.color : PALETTE.mute;
    ctx.font = '700 11px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
    safeHudFillText(ctx, resolved.unlockedCount + "/12", w - 16, slateY + 48, blind);

    // Bottom progress hairline
    ctx.fillStyle = PALETTE.rule;
    ctx.fillRect(0, h - 3.5, w, 3.5);
    ctx.fillStyle = badgeCol;
    var prog = resolved.isShowcase ? clamp(resolved.t / SHOWCASE_DURATION, 0, 1) : resolved.phaseU;
    ctx.fillRect(0, h - 3.5, w * prog, 3.5);

    ctx.restore();

    if (machineState && typeof machineState === "object") {
      machineState.hitboxes = hitboxes;
    }
    return { hitboxes: hitboxes, blind: false };
  }

  // ---------- High-Level Portal Game Registration & Stage Wrapper ----------

  function registerGame(portalId, gameDef) {
    var pid = clamp(Math.round(Number(portalId) || 1), 1, 55);
    var def = gameDef || {};
    def.id = pid;
    if (!def.duration) def.duration = SHOWCASE_DURATION;
    GAMES_REGISTRY[pid] = def;
    if (root && root.PORTAL_V3_GAMES) {
      root.PORTAL_V3_GAMES[pid] = def;
    }
    var S = getScionStage();
    if (S && typeof S.preloadPortalPlates === "function") {
      S.preloadPortalPlates(pid);
    }
    return def;
  }

  /* definePortalGame(portalId, spec):
   * Optional declarative wrapper for pod animators! Accepts either:
   *   - spec.renderScene(ctx, W, H, resolved, helpers)
   *   - OR structured node callbacks:
   *       spec.drawBackdrop(ctx, W, H, resolved)
   *       spec.drawRoot(ctx, W, H, resolved)
   *       spec.stems = { x, o, triangle, square }
   *       spec.outcomes = { x: { probable, plausible, preposterous }, ... }
   * Automatically runs resolveState, SpringCamera rig, deterministic/live particles,
   * input shockwaves, vignette grain, and blind-safe drawControllerHUD!
   */
  function definePortalGame(portalId, spec) {
    var pid = clamp(Math.round(Number(portalId) || 1), 1, 55);
    var cfg = spec || {};

    var gameObj = {
      id: pid,
      duration: SHOWCASE_DURATION,
      hotspots: cfg.hotspots || null,
      spec: cfg,
      render: function (ctx, W, H, rawT, state) {
        var w = W || DEFAULT_W;
        var h = H || DEFAULT_H;
        var resolved = resolveState(pid, rawT, state, { showCaptions: state ? state.showCaptions : true });
        var S = getScionStage();
        var plates = (S && typeof S.getPortalPlates === "function") ? S.getPortalPlates(pid) : { portholeImg: null, atlasImg: null, ready: false };

        ctx.save();
        beginCameraRig(ctx, w, h, resolved.camPose, { stageH: resolved.blind ? h : STAGE_H });

        if (typeof cfg.drawBackdrop === "function") {
          cfg.drawBackdrop(ctx, w, h, resolved, plates, S);
        } else if (S && typeof S.drawBolasBackdrop === "function") {
          S.drawBolasBackdrop(ctx, w, h, pid, resolved.t, { style: resolved.bolasStyle });
        }

        if (typeof cfg.renderScene === "function") {
          cfg.renderScene(ctx, w, h, resolved, plates, S);
        } else {
          if (resolved.phase === "root") {
            if (typeof cfg.drawRoot === "function") cfg.drawRoot(ctx, w, h, resolved, plates, S);
          } else if (resolved.phase === "stem" || resolved.phase === "tier_select") {
            var stemFn = cfg.stems && cfg.stems[resolved.selectedButton];
            if (typeof stemFn === "function") stemFn(ctx, w, h, resolved, plates, S);
            else if (typeof cfg.drawRoot === "function") cfg.drawRoot(ctx, w, h, resolved, plates, S);
          } else if (resolved.phase === "outcome") {
            var outGroup = cfg.outcomes && cfg.outcomes[resolved.selectedButton];
            var outFn = outGroup && outGroup[resolved.selectedTier];
            var flatFn = cfg.outcomes && cfg.outcomes[resolved.selectedButton + "." + resolved.selectedTier];
            if (typeof outFn === "function") outFn(ctx, w, h, resolved, plates, S);
            else if (typeof flatFn === "function") flatFn(ctx, w, h, resolved, plates, S);
          }
        }

        // Live or deterministic particle burst + sonar input shockwave on stage
        if (state && state.particles && typeof state.particles.draw === "function" && !resolved.isShowcase) {
          state.particles.draw(ctx);
        } else if (resolved.shockwave && resolved.shockwave.anchor) {
          var preset = resolved.selectedTier
            ? TIERS[resolved.selectedTier].particlePreset
            : (resolved.selectedButton ? BUTTONS[resolved.selectedButton].particlePreset : "kintsugi");
          drawDeterministicParticles(
            ctx,
            preset,
            resolved.shockwave.anchor.x,
            resolved.shockwave.anchor.y,
            resolved.shockwave.u * 0.85,
            { count: 16, seed: pid * 19.3 + (resolved.t > 8 ? 7 : 1) }
          );
        }

        if (resolved.shockwave && resolved.shockwave.anchor) {
          drawInputShockwave(
            ctx,
            resolved.shockwave.anchor.x,
            resolved.shockwave.anchor.y,
            resolved.shockwave.u,
            resolved.shockwave.button || resolved.shockwave.color
          );
        }

        if (typeof cfg.drawForeground === "function") {
          cfg.drawForeground(ctx, w, h, resolved, plates, S);
        }

        endCameraRig(ctx);

        if (cfg.vignette !== false) {
          drawVignetteGrain(ctx, w, h, resolved.t, {
            fullHeight: resolved.blind,
            strength: cfg.vignetteStrength != null ? cfg.vignetteStrength : 0.48
          });
        }

        drawControllerHUD(ctx, w, h, resolved, {
          portalId: pid,
          showCaptions: !resolved.blind,
          hotspots: cfg.hotspots || null
        });

        if (state && typeof state === "object" && resolved.hitboxes) {
          state.hitboxes = resolved.hitboxes;
        }
        ctx.restore();
      }
    };

    return registerGame(pid, gameObj);
  }

  function getGame(portalId) {
    var pid = clamp(Math.round(Number(portalId) || 1), 1, 55);
    return (root && root.PORTAL_V3_GAMES && root.PORTAL_V3_GAMES[pid]) || GAMES_REGISTRY[pid] || null;
  }

  // ---------- Public API Export ----------

  var BRANCH_GAME = {
    VERSION: "3.0.0",
    W: DEFAULT_W,
    H: DEFAULT_H,
    STAGE_H: STAGE_H,
    SLATE_Y: SLATE_Y,
    SLATE_H: SLATE_H,
    DURATION: SHOWCASE_DURATION,
    SHOWCASE_DURATION: SHOWCASE_DURATION,
    STEM_DURATION: STEM_DURATION,
    OUTCOME_DURATION: OUTCOME_DURATION,
    FPS: FPS,
    TOTAL_FRAMES: TOTAL_FRAMES,

    BUTTON_ORDER: BUTTON_ORDER,
    TIER_ORDER: TIER_ORDER,
    BUTTONS: BUTTONS,
    TIERS: TIERS,
    PALETTE: PALETTE,
    DEFAULT_HOTSPOTS: DEFAULT_HOTSPOTS,
    GAMES: GAMES_REGISTRY,

    // Math & Guard Helpers
    clamp: clamp,
    lerp: lerp,
    smooth: smoothstep,
    smoothstep: smoothstep,
    easeOutCubic: easeOutCubic,
    easeInOutCubic: easeInOutCubic,
    easeOutBack: easeOutBack,
    spring: springEval,
    springImpulse: springImpulse,
    hash: hash,
    hash2: hash2,
    rgba: rgba,
    pad2: pad2,
    isBlind: isBlindMode,
    normalizeButtonKey: normalizeButtonKey,
    normalizeTierKey: normalizeTierKey,

    // Tree, Discovery & State Machine
    getBranchTree: getBranchTree,
    discovery: discovery,
    createMachine: createMachine,
    resolveShowcaseTimeline: resolveShowcaseTimeline,
    resolveState: resolveState,

    // Camera Rig
    createCameraRig: createCameraRig,
    computeDeterministicCameraPose: computeDeterministicCameraPose,
    beginCameraRig: beginCameraRig,
    endCameraRig: endCameraRig,

    // Volumetric Lighting, Shaders & Particles
    ParticlePool: ParticlePool,
    createParticlePool: createParticlePool,
    drawDeterministicParticles: drawDeterministicParticles,
    drawGeometricSymbol: drawGeometricSymbol,
    drawPSBadge: drawPSBadge,
    drawInputShockwave: drawInputShockwave,
    drawVolumetricBeam: drawVolumetricBeam,
    drawLanternHalo: drawLanternHalo,
    drawWaterCaustics: drawWaterCaustics,
    drawDepthFog: drawDepthFog,
    drawVignetteGrain: drawVignetteGrain,
    drawTractorRings: drawTractorRings,
    drawSnailSilverTrail: drawSnailSilverTrail,
    drawXRayOverlay: drawXRayOverlay,

    // Controller HUD & BOLAS Editorial Slate
    drawControllerHUD: drawControllerHUD,

    // Procedural WebAudio & Offline PCM Foley
    audio: audio,

    // Portal V3 Game Registry Helpers
    registerGame: registerGame,
    definePortalGame: definePortalGame,
    getGame: getGame
  };

  if (root) {
    root.BRANCH_GAME = BRANCH_GAME;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = BRANCH_GAME;
  }
})(typeof window !== "undefined" ? window : globalThis);
