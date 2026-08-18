/**
 * objects.js
 * ---------------------------------------------------------------------------
 * Builds every tappable 3D object in the world. Each factory function returns
 * a THREE.Group with:
 *   - group.userData.kind        : category name (for progress tracking)
 *   - group.userData.label       : spoken/caption text
 *   - group.userData.onInteract  : function(app) called when tapped
 *   - group.userData.idle        : function(t) called every frame for idle animation
 *   - group.userData.interactive : true (marks it raycast-tappable)
 *
 * Geometry is intentionally simple/low-poly (spheres, cones, cylinders) so
 * the whole world renders at a smooth frame rate on phones and tablets,
 * while soft materials + lighting keep the "premium" feel.
 * ---------------------------------------------------------------------------
 */

const Objects = {

  /* --------------------------------------------------------------------- */
  /* Helper: soft, toon-ish material so shapes read as friendly & rounded   */
  /* --------------------------------------------------------------------- */
  softMaterial(color, opts = {}) {
    return new THREE.MeshStandardMaterial({
      color, roughness: 0.45, metalness: 0.05, ...opts
    });
  },

  /** Simple canvas-drawn cute face texture applied to spheres */
  faceTexture() {
    if (this._faceTex) return this._faceTex;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 128, 128);
    ctx.fillStyle = "#2E2E2E";
    ctx.beginPath(); ctx.arc(44, 56, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(84, 56, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#2E2E2E";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(64, 66, 20, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    this._faceTex = new THREE.CanvasTexture(c);
    return this._faceTex;
  },

  addFace(mesh, radius) {
    const geo = new THREE.PlaneGeometry(radius * 1.3, radius * 1.3);
    const mat = new THREE.MeshBasicMaterial({ map: this.faceTexture(), transparent: true });
    const face = new THREE.Mesh(geo, mat);
    face.position.set(0, 0, radius * 0.98);
    mesh.add(face);
    return face;
  },

  // =========================================================================
  // BUBBLE - tap to pop with a rainbow burst
  // =========================================================================
  createBubble(position) {
    const group = new THREE.Group();
    const geo = new THREE.SphereGeometry(0.4, 24, 24);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, transparent: true, opacity: 0.35,
      roughness: 0.05, metalness: 0, transmission: 0.9, thickness: 0.5
    });
    const sphere = new THREE.Mesh(geo, mat);
    group.add(sphere);
    group.position.copy(position);
    group.userData = {
      kind: "bubble",
      label: "Pop!",
      interactive: true,
      floatOffset: Math.random() * Math.PI * 2,
      idle(t) {
        group.position.y = position.y + Math.sin(t * 0.7 + this.floatOffset) * 0.3;
        group.rotation.y += 0.004;
      },
      onInteract(app) {
        app.particles.burstSparkles(group.getWorldPosition(new THREE.Vector3()), 26);
        app.audio.playPop();
        app.speech.speak("Pop!");
        app.reward(0.5);
        group.visible = false;
        setTimeout(() => {
          group.visible = true;
          group.scale.set(0.001, 0.001, 0.001);
          new TWEENlite(group.scale, { x: 1, y: 1, z: 1 }, 500);
        }, 1400);
      }
    };
    return group;
  },

  // =========================================================================
  // BALLOON - tap to float up into the sky, then reset
  // =========================================================================
  createBalloon(position, colorHex) {
    const group = new THREE.Group();
    const knot = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 8), this.softMaterial(colorHex));
    knot.position.y = -0.5;
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), this.softMaterial(colorHex, { roughness: 0.3 }));
    body.scale.set(1, 1.25, 1);
    const stringMat = new THREE.LineBasicMaterial({ color: 0xcccccc });
    const stringGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -0.55, 0), new THREE.Vector3(0, -1.4, 0)
    ]);
    const string = new THREE.Line(stringGeo, stringMat);
    group.add(body, knot, string);
    group.position.copy(position);
    group.userData = {
      kind: "balloon",
      label: "Bye bye balloon!",
      interactive: true,
      floating: false,
      basePos: position.clone(),
      floatOffset: Math.random() * Math.PI * 2,
      idle(t) {
        if (!this.floating) {
          group.position.y = this.basePos.y + Math.sin(t * 0.8 + this.floatOffset) * 0.15;
          group.rotation.z = Math.sin(t * 0.6 + this.floatOffset) * 0.05;
        } else {
          group.position.y += 0.03;
          group.position.x += Math.sin(t * 2 + this.floatOffset) * 0.01;
          if (group.position.y > this.basePos.y + 6) {
            this.floating = false;
            group.position.copy(this.basePos);
          }
        }
      },
      onInteract(app) {
        if (this.floating) return;
        this.floating = true;
        app.particles.burstSparkles(group.getWorldPosition(new THREE.Vector3()), 14);
        app.audio.playChime();
        app.speech.speak("Up, up, and away!");
        app.reward(0.5);
      }
    };
    return group;
  },

  // =========================================================================
  // FLOWER - tap to bloom and announce its color
  // =========================================================================
  createFlower(position, colorData) {
    const group = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8), this.softMaterial(0x4caf50));
    stem.position.y = 0.3;
    group.add(stem);

    const petalGroup = new THREE.Group();
    petalGroup.position.y = 0.62;
    const petalMat = this.softMaterial(colorData.hex, { roughness: 0.5 });
    for (let i = 0; i < 6; i++) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), petalMat);
      const angle = (i / 6) * Math.PI * 2;
      petal.position.set(Math.cos(angle) * 0.18, 0, Math.sin(angle) * 0.18);
      petal.scale.set(1, 0.5, 1);
      petalGroup.add(petal);
    }
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), this.softMaterial(0xffd93d));
    petalGroup.add(center);
    petalGroup.scale.set(0.001, 0.001, 0.001);
    group.add(petalGroup);
    group.position.copy(position);

    group.userData = {
      kind: "flower",
      label: colorData.name,
      interactive: true,
      bloomed: false,
      idle(t) {
        group.rotation.y = Math.sin(t * 0.3) * 0.1;
        if (this.bloomed) petalGroup.rotation.y += 0.01;
      },
      onInteract(app) {
        app.particles.burstSparkles(group.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.6, 0)), 16);
        app.audio.playChime();
        app.speech.speak(colorData.name + "!");
        app.reward(0.5);
        this.bloomed = true;
        new TWEENlite(petalGroup.scale, { x: 1, y: 1, z: 1 }, 600, "back");
      }
    };
    return group;
  },

  // =========================================================================
  // STAR - counting zone; tap to twinkle and speak its number
  // =========================================================================
  createStar(position, number) {
    const group = new THREE.Group();
    const shape = new THREE.Shape();
    const spikes = 5, outerR = 0.32, innerR = 0.14;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
    }
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
    const mat = new THREE.MeshStandardMaterial({ color: 0xffe066, emissive: 0xffd93d, emissiveIntensity: 0.3, roughness: 0.3, metalness: 0.4 });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);
    group.position.copy(position);
    group.userData = {
      kind: "number",
      label: String(number),
      interactive: true,
      floatOffset: Math.random() * Math.PI * 2,
      idle(t) {
        group.rotation.z += 0.008;
        group.position.y = position.y + Math.sin(t + this.floatOffset) * 0.12;
      },
      onInteract(app) {
        app.particles.burstSparkles(group.getWorldPosition(new THREE.Vector3()), 18);
        app.audio.playFlutter();
        app.speech.speak(`${number}`);
        app.reward(0.5, "number");
      }
    };
    return group;
  },

  // =========================================================================
  // SHAPE - Shape Sky zone; tap to hear its name
  // =========================================================================
  createShape(position, shapeData) {
    const group = new THREE.Group();
    let geo;
    const s = 0.35;
    switch (shapeData.name) {
      case "Circle":    geo = new THREE.CylinderGeometry(s, s, 0.1, 32); break;
      case "Square":    geo = new THREE.BoxGeometry(s * 1.4, s * 1.4, 0.1); break;
      case "Rectangle": geo = new THREE.BoxGeometry(s * 2, s, 0.1); break;
      case "Triangle": {
        const tShape = new THREE.Shape();
        tShape.moveTo(0, s); tShape.lineTo(-s, -s); tShape.lineTo(s, -s); tShape.closePath();
        geo = new THREE.ExtrudeGeometry(tShape, { depth: 0.1, bevelEnabled: false });
        break;
      }
      case "Pentagon": geo = new THREE.CylinderGeometry(s, s, 0.1, 5); break;
      case "Hexagon":  geo = new THREE.CylinderGeometry(s, s, 0.1, 6); break;
      case "Oval":      geo = new THREE.CylinderGeometry(s, s, 0.1, 32); break;
      case "Diamond":   geo = new THREE.BoxGeometry(s * 1.2, s * 1.2, 0.1); break;
      case "Star": {
        const shape = new THREE.Shape();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? s : s * 0.45;
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(a) * r, y = Math.sin(a) * r;
          i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
        }
        shape.closePath();
        geo = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
        break;
      }
      case "Heart": {
        const heart = new THREE.Shape();
        heart.moveTo(0, -s * 0.6);
        heart.bezierCurveTo(-s, s * 0.3, -s * 0.5, s, 0, s * 0.4);
        heart.bezierCurveTo(s * 0.5, s, s, s * 0.3, 0, -s * 0.6);
        geo = new THREE.ExtrudeGeometry(heart, { depth: 0.1, bevelEnabled: false });
        break;
      }
      default: geo = new THREE.BoxGeometry(s, s, 0.1);
    }
    const palette = [0xE84545, 0xFF9F43, 0xFFD93D, 0x6BCB77, 0x4D96FF, 0xA66DD4, 0xFF8FC7];
    const color = palette[Math.floor(Math.random() * palette.length)];
    const mesh = new THREE.Mesh(geo, this.softMaterial(color, { roughness: 0.4 }));
    if (shapeData.rotate) mesh.rotation.z = Math.PI / 4;
    if (shapeData.squash) mesh.scale.set(1, 0.6, 1);
    if (shapeData.wide) mesh.scale.set(1.3, 0.7, 1);
    group.add(mesh);
    group.position.copy(position);
    group.userData = {
      kind: "shape",
      label: shapeData.name,
      interactive: true,
      floatOffset: Math.random() * Math.PI * 2,
      idle(t) {
        group.rotation.y += 0.012;
        group.position.y = position.y + Math.sin(t * 0.9 + this.floatOffset) * 0.2;
      },
      onInteract(app) {
        app.particles.burstSparkles(group.getWorldPosition(new THREE.Vector3()), 16);
        app.audio.playNote(GAME_DATA.notes[Math.floor(Math.random() * GAME_DATA.notes.length)]);
        app.speech.speak(shapeData.name);
        app.reward(0.5, "shape");
      }
    };
    return group;
  },

  // =========================================================================
  // FRUIT / VEGETABLE - tap to hear name + first letter
  // =========================================================================
  createFruit(position, fruitData) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), this.softMaterial(fruitData.color, { roughness: 0.35 }));
    if (fruitData.name === "Banana") body.scale.set(1.6, 0.5, 0.5);
    if (fruitData.name === "Carrot") { body.scale.set(0.6, 1.4, 0.6); body.geometry = new THREE.ConeGeometry(0.22, 0.7, 12); }
    if (fruitData.name === "Corn") body.scale.set(0.5, 1.5, 0.5);
    group.add(body);
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 6), this.softMaterial(0x4caf50));
    leaf.position.y = 0.32;
    if (!["Carrot"].includes(fruitData.name)) group.add(leaf);
    group.position.copy(position);
    group.userData = {
      kind: "fruit",
      label: fruitData.name,
      interactive: true,
      floatOffset: Math.random() * Math.PI * 2,
      idle(t) {
        group.rotation.y += 0.006;
        group.position.y = position.y + Math.sin(t * 0.8 + this.floatOffset) * 0.15;
      },
      onInteract(app) {
        app.particles.burstSparkles(group.getWorldPosition(new THREE.Vector3()), 16);
        app.audio.playChime();
        app.speech.speak(`${fruitData.name}. ${fruitData.colorName} ${fruitData.name.toLowerCase()}. ${fruitData.letter} for ${fruitData.name}.`);
        app.reward(0.5, "fruit");
      }
    };
    return group;
  },

  // =========================================================================
  // ANIMAL - tap to wave/bounce and speak its name + sound
  // =========================================================================
  createAnimal(position, animalData) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), this.softMaterial(animalData.color));
    body.scale.set(1, 0.9, 1.1);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), this.softMaterial(animalData.color));
    head.position.set(0, 0.32, 0.22);
    this.addFace(head, 0.2);
    const earGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const earMat = this.softMaterial(animalData.color);
    const earL = new THREE.Mesh(earGeo, earMat); earL.position.set(-0.14, 0.46, 0.2);
    const earR = new THREE.Mesh(earGeo, earMat); earR.position.set(0.14, 0.46, 0.2);
    const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.18, 8);
    const legMat = this.softMaterial(animalData.color);
    const legs = [[-0.15, -0.28, 0.15], [0.15, -0.28, 0.15], [-0.15, -0.28, -0.15], [0.15, -0.28, -0.15]]
      .map(p => { const l = new THREE.Mesh(legGeo, legMat); l.position.set(...p); return l; });
    group.add(body, head, earL, earR, ...legs);
    group.position.copy(position);
    group.userData = {
      kind: "animal",
      label: animalData.name,
      interactive: true,
      dancing: false,
      danceT: 0,
      idle(t) {
        if (this.dancing) {
          this.danceT += 0.15;
          group.rotation.y = Math.sin(this.danceT * 3) * 0.4;
          group.position.y = position.y + Math.abs(Math.sin(this.danceT * 6)) * 0.25;
          if (this.danceT > 6) { this.dancing = false; group.rotation.y = 0; }
        } else {
          group.position.y = position.y + Math.sin(t * 1.2) * 0.05;
        }
      },
      onInteract(app) {
        this.dancing = true;
        this.danceT = 0;
        app.particles.burstSparkles(group.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.4, 0)), 16);
        app.audio.playSuccess();
        app.speech.speak(`${animalData.name}!`);
        app.reward(0.5, "animal");
      }
    };
    return group;
  },

  // =========================================================================
  // ALPHABET TILE - tap to hear "A. A for Apple."
  // =========================================================================
  createLetterTile(position, letterData) {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.15), this.softMaterial(0xFFFFFF, { roughness: 0.6 }));
    group.add(base);

    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFF8E7"; ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = "#5B0202";
    ctx.font = "bold 80px 'Baloo 2', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(letterData.letter, 64, 68);
    const tex = new THREE.CanvasTexture(canvas);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    face.position.z = 0.076;
    group.add(face);
    group.position.copy(position);
    group.userData = {
      kind: "letter",
      label: letterData.letter,
      interactive: true,
      floatOffset: Math.random() * Math.PI * 2,
      idle(t) {
        group.rotation.y = Math.sin(t * 0.6 + this.floatOffset) * 0.5;
        group.position.y = position.y + Math.sin(t * 0.9 + this.floatOffset) * 0.18;
      },
      onInteract(app) {
        app.particles.burstSparkles(group.getWorldPosition(new THREE.Vector3()), 18);
        app.audio.playChime();
        app.speech.speak(`${letterData.letter}. ${letterData.letter} for ${letterData.word}.`);
        app.reward(0.5, "letter");
      }
    };
    return group;
  },

  // =========================================================================
  // CLOUD - tap for gentle rain + rainbow
  // =========================================================================
  createCloud(position) {
    const group = new THREE.Group();
    const mat = this.softMaterial(0xffffff, { roughness: 0.9 });
    const puffPositions = [[0,0,0,0.35],[0.3,0.08,0,0.28],[-0.3,0.08,0,0.28],[0.15,0.2,0,0.22],[-0.15,0.2,0,0.22]];
    puffPositions.forEach(([x,y,z,r]) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 14), mat);
      puff.position.set(x, y, z);
      group.add(puff);
    });
    group.position.copy(position);
    group.userData = {
      kind: "cloud",
      label: "Rain!",
      interactive: true,
      idle(t) { group.position.x = position.x + Math.sin(t * 0.15) * 0.4; },
      onInteract(app) {
        app.particles.burstRain(group.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, -0.4, 0)), 30);
        app.audio.playRain();
        app.speech.speak("Rain! And a rainbow!");
        app.reward(0.5);
      }
    };
    return group;
  },

  // =========================================================================
  // MUSICAL DRUM/BELL - tap to play a note
  // =========================================================================
  createMusicalObject(position, index) {
    const group = new THREE.Group();
    const colors = [0xE84545,0xFF9F43,0xFFD93D,0x6BCB77,0x4D96FF,0xA66DD4,0xFF8FC7,0x4dd0e1];
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.3, 20), this.softMaterial(colors[index % colors.length], { metalness: 0.3, roughness: 0.3 }));
    group.add(mesh);
    group.position.copy(position);
    group.userData = {
      kind: "music",
      label: "♪",
      interactive: true,
      idle(t) { group.rotation.y += 0.003; },
      onInteract(app) {
        app.particles.burstSparkles(group.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,0.3,0)), 10);
        app.audio.playNote(GAME_DATA.notes[index % GAME_DATA.notes.length]);
        new TWEENlite(mesh.scale, { x: 1.25, y: 0.8, z: 1.25 }, 120, null, () => {
          new TWEENlite(mesh.scale, { x: 1, y: 1, z: 1 }, 200);
        });
        app.reward(0.25);
      }
    };
    return group;
  },

  // =========================================================================
  // BUTTERFLY - flies a gentle loop path, leaving glitter, tap to change color
  // =========================================================================
  createButterfly(position) {
    const group = new THREE.Group();
    const wingMat = this.softMaterial(0xFF8FC7, { roughness: 0.4, side: THREE.DoubleSide });
    const wingGeo = new THREE.CircleGeometry(0.22, 12);
    const wingL = new THREE.Mesh(wingGeo, wingMat); wingL.position.x = -0.05; wingL.rotation.y = 0.3;
    const wingR = new THREE.Mesh(wingGeo, wingMat); wingR.position.x = 0.05; wingR.rotation.y = -0.3;
    const bodyGroup = new THREE.Group();
    const bodyMat = this.softMaterial(0x3a3a3a);
    const bodyMid = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), bodyMat);
    const bodyCapTop = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), bodyMat);
    const bodyCapBottom = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), bodyMat);
    bodyCapTop.position.y = 0.1;
    bodyCapBottom.position.y = -0.1;
    bodyGroup.add(bodyMid, bodyCapTop, bodyCapBottom);
    bodyGroup.rotation.z = Math.PI / 2;
    group.add(wingL, wingR, bodyGroup);
    group.position.copy(position);
    group.userData = {
      kind: "butterfly",
      label: "Flutter!",
      interactive: true,
      t: Math.random() * 10,
      idle(t) {
        this.t += 0.01;
        group.position.x = position.x + Math.sin(this.t) * 1.2;
        group.position.z = position.z + Math.cos(this.t) * 1.2;
        group.position.y = position.y + Math.sin(this.t * 3) * 0.15;
        wingL.rotation.y = 0.3 + Math.sin(t * 12) * 0.5;
        wingR.rotation.y = -0.3 - Math.sin(t * 12) * 0.5;
        group.rotation.y = -this.t;
      },
      onInteract(app) {
        const hue = Math.floor(Math.random() * 360);
        const c = new THREE.Color(`hsl(${hue}, 80%, 70%)`);
        wingMat.color = c;
        app.particles.burstSparkles(group.getWorldPosition(new THREE.Vector3()), 12);
        app.audio.playSparkle();
        app.speech.speak("Flutter, flutter!");
        app.reward(0.25);
      }
    };
    return group;
  }
};

/**
 * Minimal tween helper (no external library needed) - animates numeric
 * properties of an object toward target values over a duration in ms.
 */
function TWEENlite(target, to, duration, ease, onComplete) {
  const from = {};
  Object.keys(to).forEach(k => (from[k] = target[k]));
  const start = performance.now();
  function step(now) {
    const p = Math.min(1, (now - start) / duration);
    const eased = ease === "back" ? backOut(p) : p * (2 - p); // ease-out default
    Object.keys(to).forEach(k => {
      target[k] = from[k] + (to[k] - from[k]) * eased;
    });
    if (p < 1) requestAnimationFrame(step);
    else if (onComplete) onComplete();
  }
  requestAnimationFrame(step);
  function backOut(x) {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }
}
