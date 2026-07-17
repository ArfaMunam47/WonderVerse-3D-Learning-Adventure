/**
 * world.js
 * ---------------------------------------------------------------------------
 * Builds the single continuous magical world: sky, ground, sun, decorative
 * hills/trees/rainbow, ambient floating stars, and each learning "zone"
 * populated with the interactive objects defined in objects.js.
 *
 * Zones are laid out around a circle so the child can gently orbit/pan the
 * camera (never a forced walk/run control that could overwhelm) to discover
 * each one - Bubble Pond, Flower Garden, Animal Friends, Fruit Orchard,
 * Shape Sky, Star Counting Meadow, Alphabet Grove, Cloud Coast.
 * ---------------------------------------------------------------------------
 */

class World {
  constructor(scene) {
    this.scene = scene;
    this.interactiveObjects = [];
    this.animatedObjects = [];
    this.zones = {}; // name -> { center: Vector3 }
    this._buildSky();
    this._buildLighting();
    this._buildGround();
    this._buildDecorations();
    this._buildZones();
  }

  _buildSky() {
    // Soft vertical-gradient sky using a large sphere with a canvas texture
    const canvas = document.createElement("canvas");
    canvas.width = 2; canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#8ecbff");
    grad.addColorStop(0.55, "#bfe3ff");
    grad.addColorStop(1, "#eaf7ff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2, 256);
    const tex = new THREE.CanvasTexture(canvas);
    const geo = new THREE.SphereGeometry(80, 32, 32);
    const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false });
    this.sky = new THREE.Mesh(geo, mat);
    this.scene.add(this.sky);
    this.scene.fog = new THREE.Fog(0xcfeaff, 30, 75);
  }

  _buildLighting() {
    const hemi = new THREE.HemisphereLight(0xfff6e0, 0x7bbf6a, 0.9);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff2cf, 1.1);
    sun.position.set(12, 18, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
    sun.shadow.bias = -0.002;
    this.scene.add(sun);
    this.sunLight = sun;
    const fill = new THREE.AmbientLight(0xffffff, 0.25);
    this.scene.add(fill);
  }

  _buildGround() {
    const geo = new THREE.CircleGeometry(38, 64);
    const mat = new THREE.MeshStandardMaterial({ color: 0x8bd48a, roughness: 0.9 });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // gentle rolling hills near the edge for depth
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const r = 34 + Math.random() * 4;
      const hill = new THREE.Mesh(
        new THREE.SphereGeometry(4 + Math.random() * 3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x74c476, roughness: 1 })
      );
      hill.position.set(Math.cos(angle) * r, -0.5, Math.sin(angle) * r);
      hill.receiveShadow = true;
      this.scene.add(hill);
    }
  }

  _tree(x, z, scale = 1) {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.1, 8), new THREE.MeshStandardMaterial({ color: 0x8a5a3b, roughness: 0.9 }));
    trunk.position.y = 0.55;
    trunk.castShadow = true;
    const leafColors = [0x6bcf6b, 0x7ed957, 0x57c47a];
    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 12, 12),
      new THREE.MeshStandardMaterial({ color: leafColors[Math.floor(Math.random() * leafColors.length)], roughness: 0.8 })
    );
    leaves.position.y = 1.35;
    leaves.castShadow = true;
    group.add(trunk, leaves);
    group.position.set(x, 0, z);
    group.scale.setScalar(scale);
    this.scene.add(group);
    return group;
  }

  _buildDecorations() {
    // Ring of trees around the outer edge, gaps at zone entrances
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const r = 16 + Math.random() * 2;
      this._tree(Math.cos(angle) * r, Math.sin(angle) * r, 0.8 + Math.random() * 0.5);
    }

    // Decorative rainbow arch
    const rainbowColors = [0xE84545, 0xFF9F43, 0xFFD93D, 0x6BCB77, 0x4D96FF, 0xA66DD4];
    const rainbowGroup = new THREE.Group();
    rainbowColors.forEach((c, i) => {
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(6 - i * 0.18, 0.09, 8, 32, Math.PI),
        new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, emissive: c, emissiveIntensity: 0.08 })
      );
      torus.rotation.z = Math.PI;
      rainbowGroup.add(torus);
    });
    rainbowGroup.position.set(0, 0.1, -18);
    this.scene.add(rainbowGroup);

    // Decorative floating high-altitude clouds (non-interactive, atmosphere only)
    for (let i = 0; i < 6; i++) {
      const c = Objects.createCloud.call(Objects, new THREE.Vector3((Math.random() - 0.5) * 30, 9 + Math.random() * 3, (Math.random() - 0.5) * 30));
      c.userData.interactive = false; // ambient only; interactive rain-clouds are placed separately in zone
      c.scale.setScalar(1.4);
      this.scene.add(c);
      this.animatedObjects.push(c);
    }
  }

  _placeRing(center, radius, count, factory) {
    const objs = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const pos = new THREE.Vector3(center.x + Math.cos(angle) * radius, center.y, center.z + Math.sin(angle) * radius);
      const obj = factory(pos, i);
      this.scene.add(obj);
      objs.push(obj);
    }
    return objs;
  }

  _zoneSign(center, text, color) {
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(255,255,255,0.001)";
    ctx.fillRect(0, 0, 512, 128);
    ctx.font = "bold 64px 'Baloo 2', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#00000055";
    ctx.lineWidth = 6;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.strokeText(text, 256, 64);
    ctx.fillText(text, 256, 64);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(5, 1.25, 1);
    sprite.position.set(center.x, 3.4, center.z);
    this.scene.add(sprite);
  }

  _buildZones() {
    const ZONE_RADIUS = 13;
    const zoneDefs = [
      "bubblePond", "balloonMeadow", "flowerGarden", "starMeadow",
      "fruitOrchard", "animalFriends", "alphabetGrove", "shapeSky",
      "oceanPlay", "birdNest", "vehicleValley", "musicPark"
    ];
    zoneDefs.forEach((name, i) => {
      const angle = (i / zoneDefs.length) * Math.PI * 2;
      this.zones[name] = { center: new THREE.Vector3(Math.cos(angle) * ZONE_RADIUS, 0, Math.sin(angle) * ZONE_RADIUS) };
    });

    // ---- Bubble Pond ------------------------------------------------------
    {
      const c = this.zones.bubblePond.center;
      this._zoneSign(c, "Bubble Pond", 0x4D96FF);

      const pond = new THREE.Mesh(
        new THREE.CircleGeometry(3.2, 40),
        new THREE.MeshPhysicalMaterial({
          color: 0x5fcaff,
          transparent: true,
          opacity: 0.78,
          roughness: 0.18,
          metalness: 0,
          transmission: 0.35,
          ior: 1.1,
          clearcoat: 0.8,
          clearcoatRoughness: 0.15
        })
      );
      pond.rotation.x = -Math.PI / 2;
      pond.position.set(c.x, 0.05, c.z);
      pond.receiveShadow = true;
      this.scene.add(pond);

      this._placeRing(c, 2.4, 7, (pos) => {
        pos.y = 1 + Math.random() * 0.6;
        const b = Objects.createBubble(pos);
        this.interactiveObjects.push(b);
        return b;
      });
    }

    // ---- Balloon Meadow -----------------------------------------------------
    {
      const c = this.zones.balloonMeadow.center;
      this._zoneSign(c, "Balloon Meadow", 0xFF8FC7);
      const colors = GAME_DATA.colors;
      this._placeRing(c, 2.6, 8, (pos, i) => {
        pos.y = 1.4;
        const b = Objects.createBalloon(pos, colors[i % colors.length].hex);
        this.interactiveObjects.push(b);
        return b;
      });
    }

    // ---- Flower Garden ------------------------------------------------------
    {
      const c = this.zones.flowerGarden.center;
      this._zoneSign(c, "Flower Garden", 0x6BCB77);
      this._placeRing(c, 3, GAME_DATA.colors.length, (pos, i) => {
        const f = Objects.createFlower(pos, GAME_DATA.colors[i]);
        this.interactiveObjects.push(f);
        return f;
      });
      // a couple of butterflies fluttering above the garden
      for (let i = 0; i < 2; i++) {
        const bf = Objects.createButterfly(new THREE.Vector3(c.x, 1.8, c.z));
        this.interactiveObjects.push(bf);
        this.scene.add(bf);
      }
    }

    // ---- Star Counting Meadow ------------------------------------------------
    {
      const c = this.zones.starMeadow.center;
      this._zoneSign(c, "Star Meadow", 0xFFD93D);
      GAME_DATA.numbers.forEach((n, i) => {
        const row = Math.floor(i / 5), col = i % 5;
        const pos = new THREE.Vector3(c.x - 2 + col * 1, 1.2 + row * 0.9, c.z - 1.5 + row * 1.3);
        const s = Objects.createStar(pos, n.value);
        this.interactiveObjects.push(s);
        this.scene.add(s);
      });
    }

    // ---- Fruit Orchard --------------------------------------------------------
    {
      const c = this.zones.fruitOrchard.center;
      this._zoneSign(c, "Fruit Orchard", 0xFF9F43);
      this._placeRing(c, 3, GAME_DATA.fruits.length, (pos, i) => {
        pos.y = 0.9;
        const f = Objects.createFruit(pos, GAME_DATA.fruits[i]);
        this.interactiveObjects.push(f);
        return f;
      });
    }

    // ---- Animal Friends ---------------------------------------------------
    {
      const c = this.zones.animalFriends.center;
      this._zoneSign(c, "Animal Friends", 0xA66DD4);
      this._placeRing(c, 3, GAME_DATA.animals.length, (pos, i) => {
        pos.y = 0.5;
        const a = Objects.createAnimal(pos, GAME_DATA.animals[i]);
        this.interactiveObjects.push(a);
        return a;
      });
    }

    // ---- Alphabet Grove -----------------------------------------------------
    {
      const c = this.zones.alphabetGrove.center;
      this._zoneSign(c, "Alphabet Grove", 0xE84545);
      GAME_DATA.alphabet.forEach((letterData, i) => {
        const row = Math.floor(i / 7), col = i % 7;
        const pos = new THREE.Vector3(c.x - 3 + col * 1, 1.1 + row * 0.9, c.z - 2 + row * 1.1);
        const tile = Objects.createLetterTile(pos, letterData);
        this.interactiveObjects.push(tile);
        this.scene.add(tile);
      });
    }

    // ---- Shape Sky + musical bells -----------------------------------------
    {
      const c = this.zones.shapeSky.center;
      this._zoneSign(c, "Shape Sky", 0x4dd0e1);
      this._placeRing(c, 3, GAME_DATA.shapes.length, (pos, i) => {
        pos.y = 1 + (i % 2) * 0.6;
        const s = Objects.createShape(pos, GAME_DATA.shapes[i]);
        this.interactiveObjects.push(s);
        return s;
      });
      this._placeRing(c, 1.2, 5, (pos, i) => {
        pos.y = 0.3;
        const m = Objects.createMusicalObject(pos, i);
        this.interactiveObjects.push(m);
        return m;
      });
    }

    // ---- Ocean Animals -----------------------------------------------------
    {
      const c = this.zones.oceanPlay.center;
      this._zoneSign(c, "Ocean Animals", 0x4D96FF);
      this._placeRing(c, 2.6, GAME_DATA.oceanAnimals.length, (pos, i) => {
        pos.y = 1.0;
        const o = Objects.createAnimal(pos, { ...GAME_DATA.oceanAnimals[i], kind: "ocean" });
        this.interactiveObjects.push(o);
        return o;
      });
    }

    // ---- Bird Nest ---------------------------------------------------------
    {
      const c = this.zones.birdNest.center;
      this._zoneSign(c, "Birds", 0x6BCB77);
      this._placeRing(c, 2.8, GAME_DATA.birds.length, (pos, i) => {
        pos.y = 1.2;
        const bird = Objects.createAnimal(pos, { ...GAME_DATA.birds[i], kind: "bird" });
        this.interactiveObjects.push(bird);
        return bird;
      });
    }

    // ---- Vehicle Valley ----------------------------------------------------
    {
      const c = this.zones.vehicleValley.center;
      this._zoneSign(c, "Vehicles", 0xFF8FC7);
      this._placeRing(c, 2.8, GAME_DATA.vehicles.length, (pos, i) => {
        pos.y = 0.5;
        const vehicle = Objects.createVehicle(pos, GAME_DATA.vehicles[i]);
        this.interactiveObjects.push(vehicle);
        return vehicle;
      });
    }

    // ---- Music Park --------------------------------------------------------
    {
      const c = this.zones.musicPark.center;
      this._zoneSign(c, "Music Park", 0xA66DD4);
      this._placeRing(c, 2.7, GAME_DATA.instruments.length, (pos, i) => {
        pos.y = 0.6;
        const ins = Objects.createInstrument(pos, GAME_DATA.instruments[i]);
        this.interactiveObjects.push(ins);
        return ins;
      });
    }

    // one interactive rain cloud, near the central hub
    {
      const cloud = Objects.createCloud(new THREE.Vector3(0, 3.6, 0));
      this.interactiveObjects.push(cloud);
      this.scene.add(cloud);
    }
  }

  update(t) {
    this.interactiveObjects.forEach(o => o.userData.idle && o.userData.idle(t));
    this.animatedObjects.forEach(o => o.userData.idle && o.userData.idle(t));
  }
}
