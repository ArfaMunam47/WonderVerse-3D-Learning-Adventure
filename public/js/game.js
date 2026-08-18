/**
 * game.js
 * ---------------------------------------------------------------------------
 * The App class ties together rendering, world, audio, speech, particles,
 * input, progress tracking and the accessibility settings that affect them
 * all. UI screen/menu logic lives in ui.js; this file is the simulation core.
 * ---------------------------------------------------------------------------
 */

const SAVE_KEY = "magicalWorldSave_v1";

class App {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.audio = new AudioEngine();
    this.speech = new SpeechManager();

    this.progress = this._loadProgress();
    this.settings = this.progress.settings;

    this._applyAccessibilitySettings();
    this._initScene();
    this._initCameraRig();
    this._bindInput();
    window.addEventListener("resize", () => this._onResize());

    this.paused = false;
    this.running = false;
  }

  /* ------------------------------ persistence ---------------------------- */
  _loadProgress() {
    const defaults = {
      stars: {},          // kind -> count of unique interactions seen
      totalInteractions: 0,
      achievements: {},   // achievementId -> true
      settings: {
        musicVolume: 0.35,
        sfxVolume: 0.7,
        voiceEnabled: true,
        animationSpeed: 1.0,   // 0.5 = slow/calm, 1 = normal
        highContrast: false,
        colorBlindMode: false,
        reducedMotion: false
      }
    };
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed, settings: { ...defaults.settings, ...(parsed.settings || {}) } };
    } catch (e) {
      return defaults;
    }
  }

  saveProgress() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.progress));
    } catch (e) { /* storage unavailable - fail silently, gameplay still works */ }
  }

  hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
  }

  /* --------------------------- accessibility ------------------------------ */
  _applyAccessibilitySettings() {
    document.body.classList.toggle("high-contrast", !!this.settings.highContrast);
    document.body.classList.toggle("color-blind", !!this.settings.colorBlindMode);
    document.body.classList.toggle("reduced-motion", !!this.settings.reducedMotion);
    this.speech.enabled = this.settings.voiceEnabled;
  }

  applySettingsLive() {
    this._applyAccessibilitySettings();
    this.audio.setMusicVolume(this.settings.musicVolume);
    this.audio.setSfxVolume(this.settings.sfxVolume);
    if (this.particles) {
      this.particles.animSpeedMultiplier = this.settings.reducedMotion ? 0.5 : this.settings.animationSpeed;
    }
    this.saveProgress();
  }

  /* -------------------------------- scene --------------------------------- */
  _initScene() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this._onResize();

    this.world = new World(this.scene);
    this.particles = new ParticleSystem(this.scene);
    this.particles.animSpeedMultiplier = this.settings.reducedMotion ? 0.5 : this.settings.animationSpeed;
  }

  _initCameraRig() {
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 6, 14);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 1, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 22;
    this.controls.maxPolarAngle = Math.PI * 0.49; // never let child flip under the ground
    this.controls.minPolarAngle = Math.PI * 0.15;
    this.controls.enablePan = false; // simpler, calmer control scheme
    this.controls.rotateSpeed = 0.5;
    this.controls.zoomSpeed = 0.6;
    this.controls.update();
  }

  /** Smoothly move the orbit target/camera toward a zone - used by the world map menu */
  travelToZone(zoneName) {
    const zone = this.world.zones[zoneName];
    if (!zone) return;
    const targetPos = zone.center.clone();
    const camGoal = new THREE.Vector3(targetPos.x * 1.4, 6, targetPos.z * 1.4 + (targetPos.length() < 0.1 ? 12 : 0));
    const startCam = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const goalTarget = new THREE.Vector3(targetPos.x, 1, targetPos.z);
    const duration = 1100;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = p * (2 - p);
      this.camera.position.lerpVectors(startCam, camGoal, eased);
      this.controls.target.lerpVectors(startTarget, goalTarget, eased);
      this.controls.update();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* -------------------------------- input ---------------------------------- */
  _bindInput() {
    const handleTap = (clientX, clientY) => {
      if (this.paused || !this.running) return;
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hits = this.raycaster.intersectObjects(
        this.world.interactiveObjects.filter(o => o.userData.interactive && o.visible),
        true
      );
      if (hits.length === 0) return;
      let obj = hits[0].object;
      while (obj.parent && !obj.userData.onInteract) obj = obj.parent;
      if (obj.userData.onInteract) {
        obj.userData.onInteract(this);
        this._trackInteraction(obj.userData.kind, obj.userData.label);
      }
    };

    let downPos = null;
    this.canvas.addEventListener("pointerdown", (e) => { downPos = { x: e.clientX, y: e.clientY }; });
    this.canvas.addEventListener("pointerup", (e) => {
      if (!downPos) return;
      const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      if (dist < 8) handleTap(e.clientX, e.clientY); // treat as tap only if it wasn't a drag/orbit
      downPos = null;
    });
  }

  _trackInteraction(kind, label) {
    if (!this.progress.stars[kind]) this.progress.stars[kind] = {};
    this.progress.stars[kind][label] = true;
    this.progress.totalInteractions += 1;
    this._checkAchievements();
    this.saveProgress();
    if (window.UI) UI.refreshHUD();
  }

  _checkAchievements() {
    const uniqueCount = (kind) => Object.keys(this.progress.stars[kind] || {}).length;
    const defs = [
      { id: "first_tap", label: "First Discovery", test: () => this.progress.totalInteractions >= 1 },
      { id: "colors_master", label: "Color Explorer", test: () => uniqueCount("flower") >= GAME_DATA.colors.length },
      { id: "shapes_master", label: "Shape Star", test: () => uniqueCount("shape") >= GAME_DATA.shapes.length },
      { id: "animals_master", label: "Animal Friend", test: () => uniqueCount("animal") >= GAME_DATA.animals.length },
      { id: "fruits_master", label: "Orchard Hero", test: () => uniqueCount("fruit") >= GAME_DATA.fruits.length },
      { id: "alphabet_master", label: "Alphabet Champion", test: () => uniqueCount("letter") >= GAME_DATA.alphabet.length },
      { id: "numbers_master", label: "Counting Star", test: () => uniqueCount("number") >= GAME_DATA.numbers.length },
      { id: "explorer_50", label: "Curious Explorer", test: () => this.progress.totalInteractions >= 50 },
      { id: "explorer_200", label: "Master Explorer", test: () => this.progress.totalInteractions >= 200 }
    ];
    defs.forEach(d => {
      if (!this.progress.achievements[d.id] && d.test()) {
        this.progress.achievements[d.id] = true;
        this._celebrateAchievement(d.label);
      }
    });
  }

  _celebrateAchievement(label) {
    this.particles.burstConfetti(this.controls.target.clone().add(new THREE.Vector3(0, 2, 0)), 50);
    this.audio.playSuccess();
    this.speech.speak(`New badge! ${label}!`);
    if (window.UI) UI.showAchievementToast(label);
  }

  /** Called by every interactive object after its own reward FX - adds the shared
   * "coin" reward feedback + occasional spoken encouragement, without ever
   * punishing or timing the child. */
  reward(coins, kind) {
    this.progress.coins = (this.progress.coins || 0) + coins;
    if (window.UI) UI.bumpCoins(coins);
    if (Math.random() < 0.35) {
      setTimeout(() => this.speech.encourage(), 900);
    }
  }

  /* -------------------------------- lifecycle ------------------------------- */
  start() {
    if (!this.audio.ctx) this.audio.init();
    this.audio.startMusic();
    this.running = true;
    this.paused = false;
    if (!this._loopStarted) {
      this._loopStarted = true;
      this._animate();
    }
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; }

  resetProgress() {
    localStorage.removeItem(SAVE_KEY);
    this.progress = this._loadProgress();
    this.settings = this.progress.settings;
    this.applySettingsLive();
  }

  _onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h);
    if (this.camera) { this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    const t = this.clock.getElapsedTime();
    if (!this.paused) {
      const speed = this.settings.reducedMotion ? 0.5 : this.settings.animationSpeed;
      this.world.update(t * speed);
      this.particles.update();
      this.controls.update();
    }
    this.renderer.render(this.scene, this.camera);
  }
}
