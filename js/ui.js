/**
 * ui.js
 * ---------------------------------------------------------------------------
 * Wires up every DOM screen (loading, main menu, settings, pause,
 * achievements, world map, and the two learning mini-games) to the App
 * instance. Kept separate from game.js so the 3D simulation never has to
 * know about DOM structure.
 * ---------------------------------------------------------------------------
 */

const UI = {
  app: null,

  init(app) {
    this.app = app;
    this._cacheEls();
    this._bindMainMenu();
    this._bindSettings();
    this._bindPause();
    this._bindAchievements();
    this._bindWorldMap();
    this._bindLearningGames();
    this._runLoadingSequence();
  },

  _cacheEls() {
    this.el = {};
    document.querySelectorAll("[id]").forEach(node => { this.el[node.id] = node; });
  },

  show(id) { this.el[id].classList.remove("hidden"); },
  hide(id) { this.el[id].classList.add("hidden"); },

  hideAllScreens() {
    ["main-menu","howto-screen","settings-screen","achievements-screen",
     "learning-games-screen","matching-screen","memory-screen","worldmap-screen","pause-screen"]
      .forEach(id => this.hide(id));
  },

  /* ------------------------------- loading -------------------------------- */
  _runLoadingSequence() {
    const hints = [
      "Waking up the butterflies…", "Polishing the rainbow…", "Planting the flowers…",
      "Filling the bubble pond…", "Tuning the musical bells…", "Almost ready to play…"
    ];
    let progress = 0;
    const fill = this.el["loading-bar-fill"];
    const hintEl = this.el["loading-hint"];
    const timer = setInterval(() => {
      progress += 8 + Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(timer);
        setTimeout(() => {
          this.el["loading-screen"].classList.add("fade-out");
          setTimeout(() => {
            this.el["loading-screen"].classList.add("hidden");
            this.show("main-menu");
            if (this.app.hasSave()) this.el["btn-continue"].classList.remove("hidden");
          }, 600);
        }, 300);
      }
      fill.style.width = progress + "%";
      hintEl.textContent = hints[Math.min(hints.length - 1, Math.floor((progress / 100) * hints.length))];
    }, 220);
  },

  /* ------------------------------ main menu -------------------------------- */
  _bindMainMenu() {
    const startGame = () => {
      this.hideAllScreens();
      this.el["game-layer"].classList.remove("hidden");
      this.app.start();
      this.refreshHUD();
    };
    this.el["btn-play"].addEventListener("click", () => { this.app.resetProgress(); startGame(); });
    this.el["btn-continue"].addEventListener("click", startGame);
    this.el["btn-howto"].addEventListener("click", () => { this.hideAllScreens(); this.show("howto-screen"); });
    this.el["btn-howto-back"].addEventListener("click", () => { this.hideAllScreens(); this.show("main-menu"); });
    this.el["btn-settings"].addEventListener("click", () => { this.hideAllScreens(); this._syncSettingsUI(); this.show("settings-screen"); this._settingsReturnTo = "main-menu"; });
    this.el["btn-achievements"].addEventListener("click", () => { this.hideAllScreens(); this._renderAchievements(); this.show("achievements-screen"); });
    this.el["btn-learning-games"].addEventListener("click", () => { this.hideAllScreens(); this.show("learning-games-screen"); });

    // HUD buttons (in-game)
    this.el["btn-open-map"].addEventListener("click", () => { this.app.pause(); this.hideAllScreens(); this.show("worldmap-screen"); });
    this.el["btn-open-pause"].addEventListener("click", () => { this.app.pause(); this.hideAllScreens(); this.show("pause-screen"); });
  },

  /* ------------------------------- settings -------------------------------- */
  _bindSettings() {
    const s = this.app.settings;
    const map = {
      "setting-music": "musicVolume", "setting-sfx": "sfxVolume", "setting-speed": "animationSpeed"
    };
    Object.entries(map).forEach(([id, key]) => {
      this.el[id].addEventListener("input", (e) => {
        s[key] = parseFloat(e.target.value);
        this.app.applySettingsLive();
      });
    });
    const toggles = {
      "setting-voice": "voiceEnabled", "setting-contrast": "highContrast",
      "setting-colorblind": "colorBlindMode", "setting-reduced-motion": "reducedMotion"
    };
    Object.entries(toggles).forEach(([id, key]) => {
      this.el[id].addEventListener("change", (e) => {
        s[key] = e.target.checked;
        this.app.applySettingsLive();
      });
    });
    this.el["btn-settings-back"].addEventListener("click", () => {
      this.hideAllScreens();
      this.show(this._settingsReturnTo || "main-menu");
      if (this._settingsReturnTo !== "main-menu") this.app.resume();
    });
    this.el["btn-reset-progress"].addEventListener("click", () => {
      if (confirm("Start fresh? This clears saved stars and badges.")) {
        this.app.resetProgress();
        this._syncSettingsUI();
        this.refreshHUD();
      }
    });
  },

  _syncSettingsUI() {
    const s = this.app.settings;
    this.el["setting-music"].value = s.musicVolume;
    this.el["setting-sfx"].value = s.sfxVolume;
    this.el["setting-speed"].value = s.animationSpeed;
    this.el["setting-voice"].checked = s.voiceEnabled;
    this.el["setting-contrast"].checked = s.highContrast;
    this.el["setting-colorblind"].checked = s.colorBlindMode;
    this.el["setting-reduced-motion"].checked = s.reducedMotion;
  },

  /* --------------------------------- pause ---------------------------------- */
  _bindPause() {
    this.el["btn-resume"].addEventListener("click", () => { this.hideAllScreens(); this.app.resume(); });
    this.el["btn-pause-settings"].addEventListener("click", () => { this.hideAllScreens(); this._syncSettingsUI(); this.show("settings-screen"); this._settingsReturnTo = "pause-screen"; });
    this.el["btn-pause-mainmenu"].addEventListener("click", () => {
      this.hideAllScreens();
      this.el["game-layer"].classList.add("hidden");
      this.show("main-menu");
      this.app.pause();
    });
  },

  /* ----------------------------- world map ----------------------------------- */
  _bindWorldMap() {
    this.el["world-tile-grid"].querySelectorAll(".world-tile").forEach(btn => {
      btn.addEventListener("click", () => {
        this.app.travelToZone(btn.dataset.zone);
        this.hideAllScreens();
        this.el["game-layer"].classList.remove("hidden");
        this.app.resume();
      });
    });
    this.el["btn-worldmap-back"].addEventListener("click", () => { this.hideAllScreens(); this.app.resume(); });
  },

  /* --------------------------------- HUD -------------------------------------- */
  refreshHUD() {
    this.el["coin-count"].textContent = Math.floor(this.app.progress.coins || 0);
  },
  bumpCoins() {
    this.refreshHUD();
    const pill = this.el["hud-coins"];
    pill.classList.remove("pop");
    void pill.offsetWidth; // restart animation
    pill.classList.add("pop");
  },
  showAchievementToast(label) {
    this.el["toast-label"].textContent = label;
    const toast = this.el["achievement-toast"];
    toast.classList.remove("hidden");
    toast.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  },

  /* ----------------------------- achievements screen --------------------------- */
  _bindAchievements() {
    this.el["btn-achievements-back"].addEventListener("click", () => { this.hideAllScreens(); this.show("main-menu"); });
  },

  ACHIEVEMENT_DEFS: [
    { id: "first_tap", label: "First Discovery", icon: "✨" },
    { id: "colors_master", label: "Color Explorer", icon: "🌈" },
    { id: "shapes_master", label: "Shape Star", icon: "🔷" },
    { id: "animals_master", label: "Animal Friend", icon: "🐾" },
    { id: "fruits_master", label: "Orchard Hero", icon: "🍎" },
    { id: "alphabet_master", label: "Alphabet Champion", icon: "🔤" },
    { id: "numbers_master", label: "Counting Star", icon: "⭐" },
    { id: "explorer_50", label: "Curious Explorer", icon: "🧭" },
    { id: "explorer_200", label: "Master Explorer", icon: "👑" }
  ],

  _renderAchievements() {
    const p = this.app.progress;
    const categories = ["flower","shape","animal","fruit","letter","number","bubble","balloon"];
    const labels = { flower:"Colors", shape:"Shapes", animal:"Animals", fruit:"Fruits & Veggies", letter:"Letters", number:"Numbers", bubble:"Bubbles", balloon:"Balloons" };
    let html = "";
    categories.forEach(cat => {
      const count = Object.keys(p.stars[cat] || {}).length;
      html += `<div class="progress-item"><span>${labels[cat]}</span><span class="progress-count">${count} explored</span></div>`;
    });
    html += `<div class="progress-item total"><span>Total taps</span><span class="progress-count">${p.totalInteractions || 0}</span></div>`;
    this.el["progress-summary"].innerHTML = html;

    const badgeHtml = this.ACHIEVEMENT_DEFS.map(d => {
      const earned = !!p.achievements[d.id];
      return `<div class="badge ${earned ? "earned" : "locked"}">
        <div class="badge-icon">${earned ? d.icon : "🔒"}</div>
        <div class="badge-label">${d.label}</div>
      </div>`;
    }).join("");
    this.el["badge-grid"].innerHTML = badgeHtml;
  },

  /* ------------------------------ learning games hub ---------------------------- */
  _bindLearningGames() {
    this.el["btn-learning-games-back"].addEventListener("click", () => { this.hideAllScreens(); this.show("main-menu"); });
    this.el["btn-open-matching"].addEventListener("click", () => { this.hideAllScreens(); this._startMatchingGame(); this.show("matching-screen"); });
    this.el["btn-open-memory"].addEventListener("click", () => { this.hideAllScreens(); this._startMemoryGame(); this.show("memory-screen"); });
    this.el["btn-matching-back"].addEventListener("click", () => { this.hideAllScreens(); this.show("learning-games-screen"); });
    this.el["btn-memory-back"].addEventListener("click", () => { this.hideAllScreens(); this.show("learning-games-screen"); });
  },

  /* ----- Matching Game: tap a picture, then tap the matching word ----- */
  _matchPool() {
    const EMOJI = { Apple:"🍎", Banana:"🍌", Grape:"🍇", Strawberry:"🍓", Watermelon:"🍉", Carrot:"🥕",
      Dog:"🐶", Cat:"🐱", Cow:"🐮", Duck:"🦆", Lion:"🦁", Rabbit:"🐰", Frog:"🐸" };
    return Object.entries(EMOJI).map(([name, emoji]) => ({ name, emoji }));
  },

  _startMatchingGame() {
    const pool = this._shuffle(this._matchPool()).slice(0, 5);
    const pics = this._shuffle(pool.map(p => ({ type: "pic", name: p.name, display: p.emoji })));
    const words = this._shuffle(pool.map(p => ({ type: "word", name: p.name, display: p.name })));
    let firstPick = null;
    let matchedCount = 0;
    const board = this.el["matching-board"];
    board.innerHTML = "";

    const render = () => {
      board.innerHTML = "";
      const col1 = document.createElement("div"); col1.className = "matching-col";
      const col2 = document.createElement("div"); col2.className = "matching-col";
      pics.forEach(card => col1.appendChild(this._matchCard(card)));
      words.forEach(card => col2.appendChild(this._matchCard(card)));
      board.appendChild(col1); board.appendChild(col2);
      board.querySelectorAll(".match-card").forEach(btn => btn.addEventListener("click", onPick));
    };

    const onPick = (e) => {
      const btn = e.currentTarget;
      if (btn.classList.contains("matched")) return;
      if (!firstPick) {
        firstPick = btn;
        btn.classList.add("selected");
        return;
      }
      if (firstPick === btn) { firstPick.classList.remove("selected"); firstPick = null; return; }
      const isMatch = firstPick.dataset.name === btn.dataset.name;
      if (isMatch) {
        firstPick.classList.remove("selected"); firstPick.classList.add("matched");
        btn.classList.add("matched");
        this.app.audio.playSuccess();
        this.app.speech.speak(`${btn.dataset.name}!`);
        this.app.speech.encourage();
        matchedCount++;
        this.app.particles.burstSparkles(new THREE.Vector3(0, 1.5, 0), 10);
        if (matchedCount === pics.length) {
          setTimeout(() => this.app.speech.speak("You matched them all! Wonderful!"), 700);
        }
      } else {
        this.app.audio.playSparkle();
        firstPick.classList.add("shake"); btn.classList.add("shake");
        setTimeout(() => { firstPick.classList.remove("shake"); btn.classList.remove("shake"); }, 400);
      }
      firstPick.classList.remove("selected");
      firstPick = null;
    };

    this.el["matching-instruction"].textContent = "Tap a picture, then tap its matching name!";
    render();
  },

  _matchCard(card) {
    const btn = document.createElement("button");
    btn.className = "match-card";
    btn.dataset.name = card.name;
    btn.innerHTML = card.type === "pic"
      ? `<span class="match-emoji">${card.display}</span>`
      : `<span class="match-word">${card.display}</span>`;
    return btn;
  },

  /* ----- Memory Game: flip cards to find pairs, no timer, no penalty ----- */
  _startMemoryGame() {
    const emojiSet = ["🍎","🐶","🌸","⭐","🎈","🦋","🍌","🐱"];
    let deck = this._shuffle([...emojiSet, ...emojiSet]).map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    let firstCard = null, lock = false;
    const board = this.el["memory-board"];

    const render = () => {
      board.innerHTML = "";
      deck.forEach(card => {
        const el = document.createElement("button");
        el.className = "memory-card" + (card.flipped || card.matched ? " flipped" : "") + (card.matched ? " matched" : "");
        el.innerHTML = `<span class="memory-face-front">❔</span><span class="memory-face-back">${card.emoji}</span>`;
        el.addEventListener("click", () => onFlip(card));
        board.appendChild(el);
      });
    };

    const onFlip = (card) => {
      if (lock || card.flipped || card.matched) return;
      card.flipped = true;
      render();
      if (!firstCard) { firstCard = card; this.app.audio.playNote(440); return; }
      lock = true;
      this.app.audio.playNote(523);
      setTimeout(() => {
        if (firstCard.emoji === card.emoji) {
          firstCard.matched = card.matched = true;
          this.app.audio.playChime();
          this.app.speech.encourage();
          this.app.particles.burstSparkles(new THREE.Vector3(0, 1.5, 0), 8);
        } else {
          firstCard.flipped = card.flipped = false; // gentle reset, no penalty, no timer pressure
        }
        firstCard = null; lock = false; render();
        if (deck.every(c => c.matched)) {
          setTimeout(() => this.app.speech.speak("You found every pair! Amazing memory!"), 400);
        }
      }, 800);
    };

    render();
  },

  _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
};

// ------------------------------- bootstrap ----------------------------------
window.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  UI.init(app);
});
