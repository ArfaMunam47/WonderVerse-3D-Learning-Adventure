/**
 * particles.js
 * ---------------------------------------------------------------------------
 * Lightweight, dependency-free particle bursts built from Three.js Sprites.
 * Every rewarding interaction in the game (pop, bloom, twinkle, success)
 * routes through here so the visual reward language stays consistent.
 *
 * Particles are pooled loosely (created on demand, removed on expiry) since
 * burst counts are small (15-40 sprites) and bursts are infrequent enough
 * that GC pressure is a non-issue on tablets/phones.
 * ---------------------------------------------------------------------------
 */

class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.active = []; // { sprite, velocity, life, maxLife, gravity, spin }
    this.animSpeedMultiplier = 1.0; // tied to accessibility "animation speed" setting

    this._sparkleTexture = this._makeCircleTexture("#FFFFFF");
    this._confettiColors = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#A66DD4", "#FF8FC7"];
  }

  _makeCircleTexture(color) {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, color);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }

  _makeSquareTexture(color) {
    const size = 32;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(2, 2, size - 4, size - 4);
    return new THREE.CanvasTexture(canvas);
  }

  /** Rainbow sparkle burst - used for bubbles, stars, general "tap" reward */
  burstSparkles(position, count = 22) {
    for (let i = 0; i < count; i++) {
      const hue = Math.floor(Math.random() * 360);
      const material = new THREE.SpriteMaterial({
        map: this._sparkleTexture,
        color: new THREE.Color(`hsl(${hue}, 90%, 65%)`),
        transparent: true,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(material);
      const scale = 0.15 + Math.random() * 0.25;
      sprite.scale.set(scale, scale, 1);
      sprite.position.copy(position);
      this.scene.add(sprite);

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.02 + Math.random() * 0.04;
      this.active.push({
        sprite,
        velocity: new THREE.Vector3(Math.cos(angle) * speed, 0.05 + Math.random() * 0.05, Math.sin(angle) * speed),
        life: 0,
        maxLife: 50 + Math.random() * 30,
        gravity: -0.0015,
        fade: true
      });
    }
  }

  /** Falling confetti - used for big achievements / completed activities */
  burstConfetti(position, count = 40) {
    for (let i = 0; i < count; i++) {
      const color = this._confettiColors[Math.floor(Math.random() * this._confettiColors.length)];
      const material = new THREE.SpriteMaterial({
        map: this._makeSquareTexture(color),
        transparent: true,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(0.12, 0.12, 1);
      sprite.position.set(
        position.x + (Math.random() - 0.5) * 1.5,
        position.y + Math.random() * 0.5,
        position.z + (Math.random() - 0.5) * 1.5
      );
      this.scene.add(sprite);
      this.active.push({
        sprite,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.02, 0.06 + Math.random() * 0.04, (Math.random() - 0.5) * 0.02),
        life: 0,
        maxLife: 90 + Math.random() * 40,
        gravity: -0.0025,
        spin: (Math.random() - 0.5) * 0.2,
        fade: true
      });
    }
  }

  /** Soft rain droplets falling from a cloud */
  burstRain(position, count = 25) {
    for (let i = 0; i < count; i++) {
      const material = new THREE.SpriteMaterial({
        map: this._sparkleTexture,
        color: new THREE.Color("#8FCBFF"),
        transparent: true,
        depthWrite: false,
        opacity: 0.7
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(0.08, 0.16, 1);
      sprite.position.set(
        position.x + (Math.random() - 0.5) * 1.2,
        position.y,
        position.z + (Math.random() - 0.5) * 1.2
      );
      this.scene.add(sprite);
      this.active.push({
        sprite,
        velocity: new THREE.Vector3(0, -0.05 - Math.random() * 0.02, 0),
        life: 0,
        maxLife: 60,
        gravity: 0,
        fade: false,
        stopAtGround: true
      });
    }
  }

  update() {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.life += 1 * this.animSpeedMultiplier;
      const t = p.life / p.maxLife;

      p.sprite.position.addScaledVector(p.velocity, this.animSpeedMultiplier);
      p.velocity.y += p.gravity * this.animSpeedMultiplier;
      if (p.spin) p.sprite.material.rotation += p.spin * this.animSpeedMultiplier;

      if (p.fade) p.sprite.material.opacity = Math.max(0, 1 - t);
      if (p.stopAtGround && p.sprite.position.y <= 0.05) p.life = p.maxLife;

      if (p.life >= p.maxLife) {
        this.scene.remove(p.sprite);
        p.sprite.material.dispose();
        this.active.splice(i, 1);
      }
    }
  }
}
