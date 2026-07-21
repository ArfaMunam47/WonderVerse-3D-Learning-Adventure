/**
 * environment.js
 * ---------------------------------------------------------------------------
 * Day/night cycle, wind effects, and weather system (rain/snow).
 * Adds ambient life to the world without impacting performance.
 * ---------------------------------------------------------------------------
 */

class Environment {
  constructor(scene, sky, sunLight, particles) {
    this.scene = scene;
    this.sky = sky;
    this.sunLight = sunLight;
    this.particles = particles;

    this.timeOfDay = 0.35; // 0 = midnight, 0.5 = noon, 1 = midnight
    this.daySpeed = 0.0001; // how fast day/night cycle progresses

    this.weather = "clear"; // "clear", "rain", "snow"
    this.weatherIntensity = 0;
    this.rainDrops = [];
    this.snowflakes = [];

    this._initWeather();
  }

  /* ------------------------------- day/night ------------------------------ */
  update(t, speed) {
    this.timeOfDay += this.daySpeed * speed;
    if (this.timeOfDay > 1) this.timeOfDay -= 1;

    this._updateLighting();
    this._updateWeather(t, speed);
  }

  _updateLighting() {
    const t = this.timeOfDay;
    // Simple day/night color cycle
    const dayColor = new THREE.Color(0xfff2cf);
    const sunsetColor = new THREE.Color(0xff9966);
    const nightColor = new THREE.Color(0x1a1a3e);

    let skyTop, skyBottom, lightColor, lightIntensity;

    if (t < 0.25) {
      // Night to sunrise
      const p = t / 0.25;
      skyTop = nightColor.clone().lerp(new THREE.Color(0xff9966), p);
      skyBottom = nightColor.clone().lerp(new THREE.Color(0xffcc99), p);
      lightColor = nightColor.clone().lerp(sunsetColor, p);
      lightIntensity = 0.2 + p * 0.3;
    } else if (t < 0.35) {
      // Sunrise to day
      const p = (t - 0.25) / 0.1;
      skyTop = new THREE.Color(0xff9966).lerp(new THREE.Color(0x8ecbff), p);
      skyBottom = new THREE.Color(0xffcc99).lerp(new THREE.Color(0xbfe3ff), p);
      lightColor = sunsetColor.clone().lerp(dayColor, p);
      lightIntensity = 0.5 + p * 0.6;
    } else if (t < 0.65) {
      // Day
      skyTop = new THREE.Color(0x8ecbff);
      skyBottom = new THREE.Color(0xbfe3ff);
      lightColor = dayColor;
      lightIntensity = 1.1;
    } else if (t < 0.75) {
      // Day to sunset
      const p = (t - 0.65) / 0.1;
      skyTop = new THREE.Color(0x8ecbff).lerp(new THREE.Color(0xff9966), p);
      skyBottom = new THREE.Color(0xbfe3ff).lerp(new THREE.Color(0xffcc99), p);
      lightColor = dayColor.clone().lerp(sunsetColor, p);
      lightIntensity = 1.1 - p * 0.3;
    } else {
      // Sunset to night
      const p = (t - 0.75) / 0.25;
      skyTop = new THREE.Color(0xff9966).lerp(nightColor, p);
      skyBottom = new THREE.Color(0xffcc99).lerp(nightColor, p);
      lightColor = sunsetColor.clone().lerp(nightColor, p);
      lightIntensity = 0.8 - p * 0.6;
    }

    // Update sky gradient
    this._updateSkyGradient(skyTop, skyBottom);

    // Update sun light
    this.sunLight.color.copy(lightColor);
    this.sunLight.intensity = lightIntensity;

    // Adjust fog based on time of day
    if (t < 0.25 || t > 0.75) {
      this.scene.fog = new THREE.Fog(0x1a1a3e, 20, 50);
    } else if (t < 0.35 || t > 0.65) {
      this.scene.fog = new THREE.Fog(0xff9966, 25, 60);
    } else {
      this.scene.fog = new THREE.Fog(0xcfeaff, 30, 75);
    }
  }

  _updateSkyGradient(topColor, bottomColor) {
    // Update the sky sphere texture with new gradient
    const canvas = document.createElement("canvas");
    canvas.width = 2; canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, `#${topColor.getHexString()}`);
    grad.addColorStop(1, `#${bottomColor.getHexString()}`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2, 256);
    const tex = new THREE.CanvasTexture(canvas);
    this.sky.material.map = tex;
    this.sky.material.needsUpdate = true;
  }

  /* ------------------------------- weather -------------------------------- */
  _initWeather() {
    // Occasionally change weather
    setInterval(() => {
      if (Math.random() < 0.3) {
        this.weather = Math.random() < 0.5 ? "rain" : "clear";
        this.weatherIntensity = this.weather === "rain" ? 0.5 + Math.random() * 0.5 : 0;
      }
    }, 30000);
  }

  _updateWeather(t, speed) {
    if (this.weather === "rain" && this.weatherIntensity > 0) {
      this._spawnRain(speed);
    } else if (this.weather === "snow") {
      this._spawnSnow(speed);
    }
  }

  _spawnRain(speed) {
    const count = Math.floor(2 * speed * this.weatherIntensity);
    for (let i = 0; i < count; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        8 + Math.random() * 4,
        (Math.random() - 0.5) * 20
      );
      this.particles.burstRain(pos, 1);
    }
  }

  _spawnSnow(speed) {
    // Snow would use similar logic but with slower, drifting particles
    // For now, keeping it simple and just using rain as the weather effect
  }
}