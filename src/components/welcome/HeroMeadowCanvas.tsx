import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { audioService } from '../../utils/audio';

interface HeroMeadowCanvasProps {
  reducedMotion?: boolean;
  className?: string;
  onChildInteraction?: () => void;
  onTalkingStateChange?: (isTalking: boolean) => void;
}

/**
 * HeroMeadowCanvas - 3D Interactive Welcome Experience for Wonder Meadow
 *
 * Art Direction & UX:
 * - Authentic, joyful 3D representation of a child with Down syndrome:
 *   almond-shaped expressive eyes, warm natural smile, soft blushing cheeks,
 *   neat bangs, cozy sage-green overalls, cream top, honey explorer boots.
 * - Interactive 3D Platform: Natural sculpted honey-oak pedestal with moss cushion & blooming daisies.
 * - Aliveness Engine: Breathing, natural periodic blinking, head & gaze cursor tracking,
 *   idle micro-movements, friendly wave and sparkle celebrations on tap/click.
 * - Environment: Stylized morning golden sunlight, soft rolling meadow hills,
 *   fluttering 3D butterflies, and floating ambient dandelion/pollen particles.
 */
export const HeroMeadowCanvas: React.FC<HeroMeadowCanvasProps> = ({
  reducedMotion = false,
  className = '',
  onChildInteraction,
  onTalkingStateChange
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isWaving, setIsWaving] = useState(false);

  // References for continuous animation & interaction
  const isHoveredRef = useRef(false);
  const waveTimeRef = useRef(0);
  const isWavingRef = useRef(false);
  const cursorRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const blinkStateRef = useRef({ isBlinking: false, timer: 2.5, progress: 0 });
  const lastSpokenRef = useRef(0);

  // Interaction trigger: Waves cheerfully, triggers sparkles & cute greeting
  const handleInteraction = useCallback(() => {
    isWavingRef.current = true;
    waveTimeRef.current = 2.4; // Wave for 2.4 seconds
    setIsWaving(true);

    const now = Date.now();
    if (now - lastSpokenRef.current > 3000) {
      lastSpokenRef.current = now;
      if (onTalkingStateChange) onTalkingStateChange(true);
      audioService.playSparkle();
      audioService.speakCuteAnimeChild(
        "Hi! Welcome to Wonder Meadow! Let's explore together!",
        true,
        () => {
          if (onTalkingStateChange) onTalkingStateChange(false);
        }
      );
    } else {
      audioService.playPop();
    }

    if (onChildInteraction) {
      onChildInteraction();
    }

    setTimeout(() => {
      setIsWaving(false);
    }, 2400);
  }, [onChildInteraction, onTalkingStateChange]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animId: number;
    let disposed = false;

    // 1. Three.js Scene & Cinematic Perspective Camera Setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    // Positioned for warm, friendly framing of the child and pedestal
    camera.position.set(0, 0.45, 4.8);
    camera.lookAt(0, 0.1, 0);

    // 2. WebGL Renderer with High-Performance Settings
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch {
      setIsLoaded(true);
      return; // Safe WebGL fallback
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);
    setIsLoaded(true);

    // 3. Track Disposable Geometries and Materials for Clean Memory Management
    const mats: THREE.Material[] = [];
    const geos: THREE.BufferGeometry[] = [];
    const regM = <T extends THREE.Material>(m: T): T => {
      mats.push(m);
      return m;
    };
    const regG = <T extends THREE.BufferGeometry>(g: T): T => {
      geos.push(g);
      return g;
    };

    // 4. Stylized Morning Sunlight & Atmosphere Lighting
    // Ambient Sky / Ground Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0xfef9c3, 0.95);
    scene.add(hemiLight);

    // Morning Sun Key Light (Warm golden sunlight from top-left)
    const sunKeyLight = new THREE.DirectionalLight(0xfffbeb, 1.45);
    sunKeyLight.position.set(-3.5, 4.5, 3.2);
    sunKeyLight.castShadow = true;
    sunKeyLight.shadow.mapSize.width = 512;
    sunKeyLight.shadow.mapSize.height = 512;
    sunKeyLight.shadow.bias = -0.001;
    sunKeyLight.shadow.camera.near = 0.5;
    sunKeyLight.shadow.camera.far = 12;
    sunKeyLight.shadow.camera.left = -2.5;
    sunKeyLight.shadow.camera.right = 2.5;
    sunKeyLight.shadow.camera.top = 3.0;
    sunKeyLight.shadow.camera.bottom = -2.0;
    scene.add(sunKeyLight);

    // Soft Golden Rim / Back Light (creates a warm silhouette outline)
    const rimLight = new THREE.DirectionalLight(0xfde047, 0.85);
    rimLight.position.set(3.2, 2.5, -2.5);
    scene.add(rimLight);

    // Soft Warm Front Fill (ensures child's smile and bright eyes are clearly illuminated)
    const frontFill = new THREE.PointLight(0xffedd5, 0.65, 8);
    frontFill.position.set(0, 0.2, 3.2);
    scene.add(frontFill);

    // =========================================================================
    // 5. COLOR & MATERIAL PALETTE (Natural, Warm, Premium Children's Design)
    // =========================================================================
    // Natural Soft Skin Material
    const skinMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0xffd1b3, // Warm natural peach skin tone
        roughness: 0.45,
        metalness: 0.02
      })
    );

    // Natural Chestnut / Light Brown Hair Material
    const hairMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0x6e4324, // Warm chestnut brown
        roughness: 0.6,
        metalness: 0.05
      })
    );

    // Sage Green Corduroy Overalls Material
    const overallsMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0x4d7c58, // Cozy sage green
        roughness: 0.55,
        metalness: 0.04
      })
    );

    // Cream Long-Sleeve Shirt Material
    const shirtMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0xfffae8, // Warm creamy white
        roughness: 0.5,
        metalness: 0.0
      })
    );

    // Honey Explorer Boots & Wooden Accents
    const bootLeatherMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0xb45309, // Warm honey leather
        roughness: 0.4,
        metalness: 0.05
      })
    );
    const bootSoleMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0x451a03, // Dark rubber sole
        roughness: 0.7
      })
    );

    // Natural Polished Honey-Oak Wood Platform
    const platformWoodMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0x92400e, // Rich honey-oak wood
        roughness: 0.45,
        metalness: 0.05
      })
    );
    const platformTrimMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0xd97706, // Warm amber-gold wood trim
        roughness: 0.35,
        metalness: 0.15
      })
    );

    // Lush Meadow Moss Cushion
    const mossMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0x22c55e, // Fresh meadow green moss
        roughness: 0.65,
        metalness: 0.0
      })
    );

    // Expressive Eye Materials
    const eyeScleraMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0xfdfdfd,
        roughness: 0.1
      })
    );
    const eyeIrisMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0x5c3317, // Warm chocolate brown iris
        roughness: 0.2
      })
    );
    const eyePupilMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0x180f0a,
        roughness: 0.05
      })
    );
    const eyeGlintMat = regM(
      new THREE.MeshBasicMaterial({
        color: 0xffffff
      })
    );

    // Soft Rosy Blush Material
    const blushMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0xf87171,
        roughness: 0.7,
        transparent: true,
        opacity: 0.75
      })
    );

    // Natural Joyful Lip Material
    const lipMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0xe17055,
        roughness: 0.4
      })
    );

    // Wildflowers & Daisies Materials
    const petalWhiteMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3
      })
    );
    const petalPinkMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0xf472b6,
        roughness: 0.3
      })
    );
    const flowerCenterMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.2,
        emissive: 0xca8a04,
        emissiveIntensity: 0.35
      })
    );

    // =========================================================================
    // 6. SCENE HIERARCHY ROOT
    // =========================================================================
    const sceneRoot = new THREE.Group();
    scene.add(sceneRoot);

    // Background Miniature Meadow Scenery (Subtle Hills & Distant Trees)
    const bgWorldGroup = new THREE.Group();
    bgWorldGroup.position.set(0, -0.4, -2.5);
    scene.add(bgWorldGroup);

    // Rolling Distant Hills
    const hillMat1 = regM(
      new THREE.MeshStandardMaterial({
        color: 0xa7f3d0, // Soft pastel mint green
        roughness: 0.8,
        flatShading: true
      })
    );
    const hillMat2 = regM(
      new THREE.MeshStandardMaterial({
        color: 0x86efac, // Spring meadow green
        roughness: 0.8,
        flatShading: true
      })
    );

    const hill1 = new THREE.Mesh(regG(new THREE.SphereGeometry(3.5, 20, 16)), hillMat1);
    hill1.scale.set(1.4, 0.45, 0.8);
    hill1.position.set(-2.8, -1.8, -1.5);
    bgWorldGroup.add(hill1);

    const hill2 = new THREE.Mesh(regG(new THREE.SphereGeometry(3.2, 20, 16)), hillMat2);
    hill2.scale.set(1.5, 0.48, 0.8);
    hill2.position.set(2.6, -1.9, -1.2);
    bgWorldGroup.add(hill2);

    // Distant Fluffy Meadow Trees
    const trunkMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0x78350f,
        roughness: 0.8
      })
    );
    const foliageMat = regM(
      new THREE.MeshStandardMaterial({
        color: 0x34d399,
        roughness: 0.6
      })
    );

    const createSmallTree = (x: number, y: number, z: number, scale: number) => {
      const tree = new THREE.Group();
      tree.position.set(x, y, z);
      tree.scale.setScalar(scale);

      const trunk = new THREE.Mesh(regG(new THREE.CylinderGeometry(0.08, 0.12, 0.8, 8)), trunkMat);
      trunk.position.y = 0.4;
      tree.add(trunk);

      const fol1 = new THREE.Mesh(regG(new THREE.SphereGeometry(0.45, 14, 12)), foliageMat);
      fol1.position.y = 0.95;
      tree.add(fol1);

      const fol2 = new THREE.Mesh(regG(new THREE.SphereGeometry(0.35, 12, 10)), foliageMat);
      fol2.position.set(0.15, 1.25, 0.05);
      tree.add(fol2);

      bgWorldGroup.add(tree);
    };

    createSmallTree(-2.5, -0.6, -1.0, 0.85);
    createSmallTree(-1.8, -0.8, -1.8, 0.65);
    createSmallTree(2.2, -0.7, -1.1, 0.8);
    createSmallTree(3.0, -0.8, -1.6, 0.7);

    // =========================================================================
    // 7. 3D MAGICAL MEADOW PLATFORM / PEDESTAL
    // =========================================================================
    const platformGroup = new THREE.Group();
    platformGroup.position.set(0, -0.72, 0);
    sceneRoot.add(platformGroup);

    // Soft Contact Shadow Disc on the floor
    const shadowGeo = regG(new THREE.PlaneGeometry(2.4, 1.8));
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 60);
      grad.addColorStop(0, 'rgba(20, 60, 30, 0.42)');
      grad.addColorStop(0.6, 'rgba(20, 60, 30, 0.15)');
      grad.addColorStop(1, 'rgba(20, 60, 30, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = regM(
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      })
    );
    const floorShadow = new THREE.Mesh(shadowGeo, shadowMat);
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.y = -0.01;
    platformGroup.add(floorShadow);

    // Tier 1: Carved Honey-Oak Base Ring
    const baseCylinder = new THREE.Mesh(
      regG(new THREE.CylinderGeometry(1.05, 1.15, 0.22, 32)),
      platformWoodMat
    );
    baseCylinder.position.y = 0.11;
    baseCylinder.receiveShadow = true;
    baseCylinder.castShadow = true;
    platformGroup.add(baseCylinder);

    // Gold/Amber Bevel Accent Rim
    const rimRing = new THREE.Mesh(
      regG(new THREE.TorusGeometry(1.05, 0.04, 12, 32)),
      platformTrimMat
    );
    rimRing.rotation.x = Math.PI / 2;
    rimRing.position.y = 0.22;
    platformGroup.add(rimRing);

    // Tier 2: Lush Meadow Moss Cushion
    const mossCushion = new THREE.Mesh(
      regG(new THREE.CylinderGeometry(0.98, 1.02, 0.16, 32)),
      mossMat
    );
    mossCushion.position.y = 0.28;
    mossCushion.receiveShadow = true;
    platformGroup.add(mossCushion);

    // Blooming Meadow Flowers around Pedestal Edge
    const createFlower = (x: number, y: number, z: number, isPink = false) => {
      const flGroup = new THREE.Group();
      flGroup.position.set(x, y, z);

      // Center disc
      const center = new THREE.Mesh(regG(new THREE.SphereGeometry(0.04, 8, 8)), flowerCenterMat);
      flGroup.add(center);

      // Petals (5 petals)
      const pMat = isPink ? petalPinkMat : petalWhiteMat;
      for (let i = 0; i < 5; i++) {
        const ang = (i * Math.PI * 2) / 5;
        const pet = new THREE.Mesh(regG(new THREE.SphereGeometry(0.035, 8, 6)), pMat);
        pet.scale.set(1.2, 0.35, 0.8);
        pet.position.set(Math.cos(ang) * 0.065, 0, Math.sin(ang) * 0.065);
        pet.rotation.y = ang;
        flGroup.add(pet);
      }
      flGroup.rotation.x = -0.15;
      platformGroup.add(flGroup);
    };

    createFlower(-0.85, 0.38, 0.35, false);
    createFlower(-0.65, 0.38, 0.72, true);
    createFlower(0.75, 0.38, 0.45, false);
    createFlower(0.55, 0.38, 0.82, true);
    createFlower(0.0, 0.38, 0.95, false);

    // =========================================================================
    // 8. 3D HERO CHILD CHARACTER (Respectful, Warm, Alive Representation)
    // =========================================================================
    const childRoot = new THREE.Group();
    childRoot.position.set(0, -0.34, 0.1);
    sceneRoot.add(childRoot);

    // Torso / Body Group (Coordinates breathing and posture shifts)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.3, 0);
    childRoot.add(torsoGroup);

    // Main Torso (Cream Long-sleeve Base)
    const torsoGeo = regG(new THREE.CylinderGeometry(0.38, 0.42, 0.65, 24));
    const mainTorso = new THREE.Mesh(torsoGeo, shirtMat);
    mainTorso.position.y = 0.22;
    mainTorso.castShadow = true;
    mainTorso.receiveShadow = true;
    torsoGroup.add(mainTorso);

    // Sage Green Overalls Bib
    const overallsGeo = regG(new THREE.CylinderGeometry(0.39, 0.43, 0.52, 24));
    const overallsMesh = new THREE.Mesh(overallsGeo, overallsMat);
    overallsMesh.position.y = 0.16;
    overallsMesh.castShadow = true;
    overallsMesh.receiveShadow = true;
    torsoGroup.add(overallsMesh);

    // Overalls Shoulder Straps
    const strapL = new THREE.Mesh(regG(new THREE.BoxGeometry(0.09, 0.5, 0.05)), overallsMat);
    strapL.position.set(-0.2, 0.32, 0.32);
    strapL.rotation.z = 0.06;
    torsoGroup.add(strapL);

    const strapR = new THREE.Mesh(regG(new THREE.BoxGeometry(0.09, 0.5, 0.05)), overallsMat);
    strapR.position.set(0.2, 0.32, 0.32);
    strapR.rotation.z = -0.06;
    torsoGroup.add(strapR);

    // Wooden Buttons on Straps
    const buttonL = new THREE.Mesh(regG(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 12)), platformWoodMat);
    buttonL.rotation.x = Math.PI / 2;
    buttonL.position.set(-0.2, 0.4, 0.36);
    torsoGroup.add(buttonL);

    const buttonR = new THREE.Mesh(regG(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 12)), platformWoodMat);
    buttonR.rotation.x = Math.PI / 2;
    buttonR.position.set(0.2, 0.4, 0.36);
    torsoGroup.add(buttonR);

    // Little Explorer Star Badge on Overalls Pocket
    const badgeMesh = new THREE.Mesh(regG(new THREE.OctahedronGeometry(0.06)), flowerCenterMat);
    badgeMesh.position.set(0, 0.22, 0.41);
    badgeMesh.rotation.z = Math.PI / 4;
    torsoGroup.add(badgeMesh);

    // --- Neck and Head Hierarchy (Interpolates Cursor Gaze & Head Tilt) ---
    const neckGroup = new THREE.Group();
    neckGroup.position.set(0, 0.54, 0.02);
    torsoGroup.add(neckGroup);

    const neck = new THREE.Mesh(regG(new THREE.CylinderGeometry(0.16, 0.18, 0.14, 16)), skinMat);
    neck.position.y = 0.06;
    neckGroup.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.28, 0.02);
    neckGroup.add(headGroup);

    // Natural Head Geometry (Soft, friendly child facial contour)
    const headGeo = regG(new THREE.SphereGeometry(0.48, 32, 28));
    headGeo.scale(1.0, 1.05, 0.98);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    head.receiveShadow = true;
    headGroup.add(head);

    // Hair: Neat Bangs and Soft Rounded Cap
    const hairCap = new THREE.Mesh(
      regG(new THREE.SphereGeometry(0.51, 30, 24, 0, Math.PI * 2, 0, Math.PI * 0.65)),
      hairMat
    );
    hairCap.position.set(0, 0.06, -0.04);
    hairCap.castShadow = true;
    headGroup.add(hairCap);

    // Soft Straight Bangs Framing the Forehead
    const bangsGeo = regG(new THREE.BoxGeometry(0.58, 0.18, 0.12));
    const bangs = new THREE.Mesh(bangsGeo, hairMat);
    bangs.position.set(0, 0.26, 0.44);
    bangs.rotation.x = 0.2;
    headGroup.add(bangs);

    // Soft Hair Side Locks
    const lockL = new THREE.Mesh(regG(new THREE.CylinderGeometry(0.09, 0.06, 0.38, 12)), hairMat);
    lockL.position.set(-0.46, 0.04, 0.14);
    lockL.rotation.z = -0.12;
    headGroup.add(lockL);

    const lockR = new THREE.Mesh(regG(new THREE.CylinderGeometry(0.09, 0.06, 0.38, 12)), hairMat);
    lockR.position.set(0.46, 0.04, 0.14);
    lockR.rotation.z = 0.12;
    headGroup.add(lockR);

    // --- Expressive Almond Eyes with Catchlight Glints & Blink Eyelids ---
    // Left Eye
    const eyeGroupL = new THREE.Group();
    eyeGroupL.position.set(-0.18, 0.06, 0.42);
    headGroup.add(eyeGroupL);

    const eyeScleraGeo = regG(new THREE.SphereGeometry(0.12, 20, 16));
    eyeScleraGeo.scale(1.15, 0.85, 0.5);
    const scleraL = new THREE.Mesh(eyeScleraGeo, eyeScleraMat);
    eyeGroupL.add(scleraL);

    const irisGeo = regG(new THREE.SphereGeometry(0.08, 16, 16));
    irisGeo.scale(1.0, 1.0, 0.2);
    const irisL = new THREE.Mesh(irisGeo, eyeIrisMat);
    irisL.position.set(0, 0, 0.06);
    eyeGroupL.add(irisL);

    const pupilGeo = regG(new THREE.SphereGeometry(0.05, 14, 14));
    pupilGeo.scale(1.0, 1.0, 0.2);
    const pupilL = new THREE.Mesh(pupilGeo, eyePupilMat);
    pupilL.position.set(0, 0, 0.08);
    eyeGroupL.add(pupilL);

    // Catchlight Sparkles
    const glint1 = new THREE.Mesh(regG(new THREE.SphereGeometry(0.024, 10, 10)), eyeGlintMat);
    glint1.position.set(-0.025, 0.025, 0.095);
    eyeGroupL.add(glint1);

    const glint2 = new THREE.Mesh(regG(new THREE.SphereGeometry(0.013, 8, 8)), eyeGlintMat);
    glint2.position.set(0.025, -0.02, 0.095);
    eyeGroupL.add(glint2);

    // Eyelid for Blinking Animation (Scales Y down over eye during blink)
    const eyelidL = new THREE.Mesh(
      regG(new THREE.SphereGeometry(0.13, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5)),
      skinMat
    );
    eyelidL.rotation.x = Math.PI;
    eyelidL.position.set(0, 0.08, 0.01);
    eyelidL.scale.set(1.15, 0.01, 0.6); // Starts fully open
    eyeGroupL.add(eyelidL);

    // Right Eye
    const eyeGroupR = new THREE.Group();
    eyeGroupR.position.set(0.18, 0.06, 0.42);
    headGroup.add(eyeGroupR);

    const scleraR = new THREE.Mesh(eyeScleraGeo, eyeScleraMat);
    eyeGroupR.add(scleraR);

    const irisR = new THREE.Mesh(irisGeo, eyeIrisMat);
    irisR.position.set(0, 0, 0.06);
    eyeGroupR.add(irisR);

    const pupilR = new THREE.Mesh(pupilGeo, eyePupilMat);
    pupilR.position.set(0, 0, 0.08);
    eyeGroupR.add(pupilR);

    const glint1R = new THREE.Mesh(regG(new THREE.SphereGeometry(0.024, 10, 10)), eyeGlintMat);
    glint1R.position.set(-0.025, 0.025, 0.095);
    eyeGroupR.add(glint1R);

    const glint2R = new THREE.Mesh(regG(new THREE.SphereGeometry(0.013, 8, 8)), eyeGlintMat);
    glint2R.position.set(0.025, -0.02, 0.095);
    eyeGroupR.add(glint2R);

    const eyelidR = new THREE.Mesh(
      regG(new THREE.SphereGeometry(0.13, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5)),
      skinMat
    );
    eyelidR.rotation.x = Math.PI;
    eyelidR.position.set(0, 0.08, 0.01);
    eyelidR.scale.set(1.15, 0.01, 0.6);
    eyeGroupR.add(eyelidR);

    // Soft Rosy Cheeks
    const cheekGeo = regG(new THREE.SphereGeometry(0.12, 16, 12));
    cheekGeo.scale(1.2, 0.75, 0.3);

    const cheekL = new THREE.Mesh(cheekGeo, blushMat);
    cheekL.position.set(-0.28, -0.08, 0.4);
    cheekL.rotation.z = -0.1;
    headGroup.add(cheekL);

    const cheekR = new THREE.Mesh(cheekGeo, blushMat);
    cheekR.position.set(0.28, -0.08, 0.4);
    cheekR.rotation.z = 0.1;
    headGroup.add(cheekR);

    // Cute Button Nose
    const nose = new THREE.Mesh(regG(new THREE.SphereGeometry(0.055, 12, 10)), skinMat);
    nose.position.set(0, -0.04, 0.48);
    headGroup.add(nose);

    // Natural Joyful Smiling Mouth (Curved Torus Arc with Gentle Smile)
    const mouthGeo = regG(new THREE.TorusGeometry(0.11, 0.024, 12, 20, Math.PI * 0.88));
    const mouth = new THREE.Mesh(mouthGeo, lipMat);
    mouth.position.set(0, -0.18, 0.44);
    mouth.rotation.x = Math.PI * 0.94;
    headGroup.add(mouth);

    // --- Arms & Hands (Right Arm handles Friendly Wave) ---
    // Left Arm (Relaxed, resting comfortably)
    const armLGroup = new THREE.Group();
    armLGroup.position.set(-0.42, 0.38, 0.05);
    torsoGroup.add(armLGroup);

    const armLMesh = new THREE.Mesh(regG(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 14)), shirtMat);
    armLMesh.position.set(-0.06, -0.18, 0.08);
    armLMesh.rotation.z = 0.32;
    armLMesh.rotation.x = 0.35;
    armLGroup.add(armLMesh);

    const handL = new THREE.Mesh(regG(new THREE.SphereGeometry(0.1, 14, 12)), skinMat);
    handL.position.set(-0.16, -0.38, 0.22);
    armLGroup.add(handL);

    // Right Arm (Articulated for Cheerful Waving)
    const armRGroup = new THREE.Group();
    armRGroup.position.set(0.42, 0.38, 0.05);
    torsoGroup.add(armRGroup);

    const armRMesh = new THREE.Mesh(regG(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 14)), shirtMat);
    armRMesh.position.set(0.08, -0.16, 0.08);
    armRMesh.rotation.z = -0.35;
    armRMesh.rotation.x = 0.25;
    armRGroup.add(armRMesh);

    const handR = new THREE.Mesh(regG(new THREE.SphereGeometry(0.1, 14, 12)), skinMat);
    handR.position.set(0.2, -0.34, 0.2);
    armRGroup.add(handR);

    // --- Comfortable Sitting / Explorer Legs & Honey Boots ---
    const legLGroup = new THREE.Group();
    legLGroup.position.set(-0.2, 0.0, 0.1);
    childRoot.add(legLGroup);

    const legL = new THREE.Mesh(regG(new THREE.CylinderGeometry(0.14, 0.13, 0.42, 16)), overallsMat);
    legL.position.set(0, -0.15, 0.12);
    legL.rotation.x = 0.65;
    legLGroup.add(legL);

    const bootL = new THREE.Group();
    bootL.position.set(0, -0.32, 0.26);
    legLGroup.add(bootL);

    const bootLMain = new THREE.Mesh(regG(new THREE.BoxGeometry(0.18, 0.15, 0.3)), bootLeatherMat);
    bootLMain.position.set(0, 0, 0.05);
    bootL.add(bootLMain);

    const bootLSole = new THREE.Mesh(regG(new THREE.BoxGeometry(0.2, 0.04, 0.32)), bootSoleMat);
    bootLSole.position.set(0, -0.08, 0.05);
    bootL.add(bootLSole);

    // Right Leg
    const legRGroup = new THREE.Group();
    legRGroup.position.set(0.2, 0.0, 0.1);
    childRoot.add(legRGroup);

    const legR = new THREE.Mesh(regG(new THREE.CylinderGeometry(0.14, 0.13, 0.42, 16)), overallsMat);
    legR.position.set(0, -0.15, 0.12);
    legR.rotation.x = 0.65;
    legRGroup.add(legR);

    const bootR = new THREE.Group();
    bootR.position.set(0, -0.32, 0.26);
    legRGroup.add(bootR);

    const bootRMain = new THREE.Mesh(regG(new THREE.BoxGeometry(0.18, 0.15, 0.3)), bootLeatherMat);
    bootRMain.position.set(0, 0, 0.05);
    bootR.add(bootRMain);

    const bootRSole = new THREE.Mesh(regG(new THREE.BoxGeometry(0.2, 0.04, 0.32)), bootSoleMat);
    bootRSole.position.set(0, -0.08, 0.05);
    bootR.add(bootRSole);

    // =========================================================================
    // 9. LIVING 3D BUTTERFLIES (Natural Flight Trajectories)
    // =========================================================================
    const butterflyGroup = new THREE.Group();
    scene.add(butterflyGroup);

    const createButterfly = (wingColor: number, scale: number) => {
      const bFly = new THREE.Group();
      bFly.scale.setScalar(scale);

      const wingMat = regM(
        new THREE.MeshStandardMaterial({
          color: wingColor,
          roughness: 0.3,
          side: THREE.DoubleSide
        })
      );

      const bBody = new THREE.Mesh(
        regG(new THREE.CylinderGeometry(0.015, 0.015, 0.14, 6)),
        platformWoodMat
      );
      bFly.add(bBody);

      // Left Wing
      const wingL = new THREE.Mesh(regG(new THREE.PlaneGeometry(0.14, 0.12)), wingMat);
      wingL.position.set(-0.07, 0, 0);
      bFly.add(wingL);

      // Right Wing
      const wingR = new THREE.Mesh(regG(new THREE.PlaneGeometry(0.14, 0.12)), wingMat);
      wingR.position.set(0.07, 0, 0);
      bFly.add(wingR);

      butterflyGroup.add(bFly);
      return { group: bFly, wingL, wingR };
    };

    const bFly1 = createButterfly(0x38bdf8, 0.85); // Gentle Azure Blue
    const bFly2 = createButterfly(0xfbbf24, 0.75); // Golden Butterfly

    // =========================================================================
    // 10. FLOATING AMBIENT PARTICLES (Dandelion Fluff & Golden Pollen)
    // =========================================================================
    const particleCount = 36;
    const particleGeo = regG(new THREE.BufferGeometry());
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 5.0;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3.0;
      particleSpeeds[i] = 0.2 + Math.random() * 0.4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = regM(
      new THREE.PointsMaterial({
        color: 0xfef08a,
        size: 0.07,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      })
    );
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // =========================================================================
    // 11. POINTER INTERACTION & CURSOR TRACKING
    // =========================================================================
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      cursorRef.current.targetX = THREE.MathUtils.clamp(normX, -1, 1);
      cursorRef.current.targetY = THREE.MathUtils.clamp(normY, -1, 1);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    // Initial greeting on first mount
    const introWaveTimeout = setTimeout(() => {
      if (!disposed && !reducedMotion) {
        isWavingRef.current = true;
        waveTimeRef.current = 1.8;
      }
    }, 600);

    // =========================================================================
    // 12. CONTINUOUS 60FPS ANIMATION LOOP (Alive Micro-Movements)
    // =========================================================================
    const clock = new THREE.Clock();

    const animate = () => {
      if (disposed) return;
      animId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Smooth cursor interpolation
      cursorRef.current.x = THREE.MathUtils.lerp(cursorRef.current.x, cursorRef.current.targetX, 0.08);
      cursorRef.current.y = THREE.MathUtils.lerp(cursorRef.current.y, cursorRef.current.targetY, 0.08);

      const curX = cursorRef.current.x;
      const curY = cursorRef.current.y;

      if (!reducedMotion) {
        // --- 1. Camera Subtle Cinematic Parallax ---
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, curX * 0.22, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.45 + curY * 0.12, 0.05);
        camera.lookAt(0, 0.1, 0);

        // --- 2. Gentle Organic Breathing ---
        const breath = Math.sin(elapsed * 2.2);
        torsoGroup.scale.set(1 + breath * 0.015, 1 + breath * 0.02, 1 + breath * 0.012);
        torsoGroup.position.y = 0.3 + breath * 0.008;

        // --- 3. Head & Gaze Tracking (Looks toward child/player/cursor) ---
        const targetHeadRotY = curX * 0.35 + Math.sin(elapsed * 0.6) * 0.04;
        const targetHeadRotX = -curY * 0.22 + Math.cos(elapsed * 0.8) * 0.02;
        const targetHeadTiltZ = -curX * 0.08;

        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetHeadRotY, 0.1);
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetHeadRotX, 0.1);
        headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, targetHeadTiltZ, 0.1);

        // Pupil Gaze Shift
        const pupilShiftX = curX * 0.018;
        const pupilShiftY = curY * 0.014;
        pupilL.position.x = pupilShiftX;
        pupilL.position.y = pupilShiftY;
        pupilR.position.x = pupilShiftX;
        pupilR.position.y = pupilShiftY;

        // --- 4. Natural Periodic Blinking ---
        blinkStateRef.current.timer -= delta;
        if (blinkStateRef.current.timer <= 0) {
          blinkStateRef.current.isBlinking = true;
          blinkStateRef.current.progress = 1.0;
          blinkStateRef.current.timer = 3.0 + Math.random() * 3.5; // Next blink in 3-6.5 seconds
        }

        if (blinkStateRef.current.isBlinking) {
          blinkStateRef.current.progress -= delta * 8.0;
          const blinkScale = Math.sin(blinkStateRef.current.progress * Math.PI);
          eyelidL.scale.y = Math.max(0.01, blinkScale * 1.0);
          eyelidR.scale.y = Math.max(0.01, blinkScale * 1.0);
          if (blinkStateRef.current.progress <= 0) {
            blinkStateRef.current.isBlinking = false;
            eyelidL.scale.y = 0.01;
            eyelidR.scale.y = 0.01;
          }
        }

        // --- 5. Arm Motion & Cheerful Waving Animation ---
        if (waveTimeRef.current > 0) {
          waveTimeRef.current -= delta;
          const waveFreq = elapsed * 12.0;
          // Raise arm up and wave back and forth
          armRGroup.rotation.z = THREE.MathUtils.lerp(armRGroup.rotation.z, -1.55 + Math.sin(waveFreq) * 0.45, 0.2);
          armRGroup.rotation.x = THREE.MathUtils.lerp(armRGroup.rotation.x, 0.55, 0.15);
          armRGroup.rotation.y = THREE.MathUtils.lerp(armRGroup.rotation.y, Math.cos(waveFreq) * 0.25, 0.2);

          // Head tilts joyfully while waving
          headGroup.rotation.z += Math.sin(elapsed * 6.0) * 0.05;
        } else {
          // Relaxed arm posture with micro-movement
          const armRestZ = -0.05 + Math.sin(elapsed * 1.5) * 0.03;
          armRGroup.rotation.z = THREE.MathUtils.lerp(armRGroup.rotation.z, armRestZ, 0.1);
          armRGroup.rotation.x = THREE.MathUtils.lerp(armRGroup.rotation.x, 0.0, 0.1);
          armRGroup.rotation.y = THREE.MathUtils.lerp(armRGroup.rotation.y, 0.0, 0.1);
        }

        // --- 6. Butterfly Flight Paths & Fluttering Wings ---
        const bTime1 = elapsed * 0.9;
        bFly1.group.position.x = Math.sin(bTime1) * 1.3 - 0.2;
        bFly1.group.position.y = 0.4 + Math.cos(bTime1 * 1.5) * 0.45;
        bFly1.group.position.z = 0.3 + Math.sin(bTime1 * 1.2) * 0.6;
        bFly1.group.rotation.y = Math.cos(bTime1) * 0.8 + Math.PI / 2;

        const wingFlap1 = Math.sin(elapsed * 24.0) * 0.85;
        bFly1.wingL.rotation.y = wingFlap1;
        bFly1.wingR.rotation.y = -wingFlap1;

        const bTime2 = elapsed * 0.7 + 2.5;
        bFly2.group.position.x = Math.cos(bTime2) * 1.1 + 0.3;
        bFly2.group.position.y = 0.2 + Math.sin(bTime2 * 1.3) * 0.35;
        bFly2.group.position.z = 0.2 + Math.cos(bTime2 * 1.1) * 0.5;
        bFly2.group.rotation.y = -Math.sin(bTime2) * 0.8;

        const wingFlap2 = Math.sin(elapsed * 22.0) * 0.85;
        bFly2.wingL.rotation.y = wingFlap2;
        bFly2.wingR.rotation.y = -wingFlap2;

        // --- 7. Floating Dandelion & Pollen Particle System ---
        const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          posArray[i * 3 + 1] += particleSpeeds[i] * delta; // Float up
          posArray[i * 3] += Math.sin(elapsed + i) * 0.003; // Gentle horizontal drift
          // Wrap around top to bottom
          if (posArray[i * 3 + 1] > 2.2) {
            posArray[i * 3 + 1] = -1.5;
            posArray[i * 3] = (Math.random() - 0.5) * 4.5;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 13. Responsive Resize Handler
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });

    resizeObserver.observe(container);

    // 14. Cleanup & Resource Disposal
    return () => {
      disposed = true;
      clearTimeout(introWaveTimeout);
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);

      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      if (renderer) {
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, [reducedMotion]);

  return (
    <div
      id="hero-meadow-3d-container"
      ref={mountRef}
      onClick={handleInteraction}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      className={`relative w-full h-full cursor-pointer touch-none select-none flex items-center justify-center ${className}`}
      role="button"
      tabIndex={0}
      aria-label="Interactive Wonder Meadow 3D character. Tap or click to say hello and see a wave!"
      title="Tap or click to say hello!"
    >
      {/* Fallback & Initial Loading Shimmer */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-400/30 border-t-emerald-500 animate-spin" />
        </div>
      )}

      {/* Touch Interaction Feedback Sparkle Ring */}
      {isWaving && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-ping duration-1000 opacity-25">
          <div className="w-48 h-48 rounded-full bg-amber-300 blur-xl" />
        </div>
      )}
    </div>
  );
};
