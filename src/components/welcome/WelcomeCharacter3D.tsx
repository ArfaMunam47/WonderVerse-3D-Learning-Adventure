import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { audioService } from '../../utils/audio';

interface WelcomeCharacter3DProps {
  reducedMotion?: boolean;
  className?: string;
  onCharacterInteraction?: () => void;
}

/**
 * Wonder Meadow - Pip the Meadow Sproutling (Original 3D Mascot Character)
 *
 * Designed specifically for children, toddlers, and neurodivergent accessibility:
 * - Soft rounded forms, warm peach/honey palette, large expressive eyes.
 * - Organic leaf sprout antenna that reacts to motion.
 * - Interactive pointer gaze tracking, natural blinking, and gentle breathing.
 * - Friendly introductory welcome wave on load.
 * - Tactile, cheerful micro-reaction on hover or touch.
 * - Full reduced-motion and WebGL fallback support.
 */
export const WelcomeCharacter3D: React.FC<WelcomeCharacter3DProps> = ({
  reducedMotion = false,
  className = '',
  onCharacterInteraction
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isWaving, setIsWaving] = useState(false);

  // Gaze target tracking
  const pointerPosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const touchReactionRef = useRef(0);

  const handlePointerInteraction = useCallback(() => {
    touchReactionRef.current = 1.0;
    setIsWaving(true);
    setHasInteracted(true);
    try {
      audioService.playPop();
    } catch {
      // Audio fallback safe
    }
    if (onCharacterInteraction) {
      onCharacterInteraction();
    }
    setTimeout(() => {
      setIsWaving(false);
    }, 1600);
  }, [onCharacterInteraction]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animId: number;
    let disposed = false;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 0.4, 4.5);
    camera.lookAt(0, 0.15, 0);

    // 2. WebGL Renderer with Anti-aliasing and Alpha Transparency
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch {
      return; // Safe WebGL fallback
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Lighting Setup (Soft Cartoon Aesthetic with Sun Alignment)
    const ambientLight = new THREE.HemisphereLight(0xe0f2fe, 0xdcfce7, 0.95);
    scene.add(ambientLight);

    // Sun Key Light (coming from top-left to match the environmental sun)
    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    keyLight.position.set(-3, 4, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 512;
    keyLight.shadow.mapSize.height = 512;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Soft Rim Light from right for 3D depth
    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.85);
    rimLight.position.set(3, 2, -2);
    scene.add(rimLight);

    // Warm Front Fill
    const fillLight = new THREE.PointLight(0xfef3c7, 0.6, 10);
    fillLight.position.set(0, -1, 3);
    scene.add(fillLight);

    // 4. Character Materials (Soft, Velvety, High-Quality Cartoon)
    const materialsToDispose: THREE.Material[] = [];
    const geometriesToDispose: THREE.BufferGeometry[] = [];

    const regMat = <T extends THREE.Material>(m: T): T => {
      materialsToDispose.push(m);
      return m;
    };
    const regGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      geometriesToDispose.push(g);
      return g;
    };

    const bodyMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0xffcb8e, // Warm golden peach/honey
        roughness: 0.35,
        metalness: 0.05
      })
    );

    const bellyMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0xfffae0, // Soft creamy belly patch
        roughness: 0.4,
        metalness: 0.0
      })
    );

    const leafMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0x40c057, // Vibrant meadow leaf green
        roughness: 0.25,
        metalness: 0.1
      })
    );

    const leafStemMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0x2f9e44, // Forest green stem
        roughness: 0.3
      })
    );

    const eyeWhiteMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.0
      })
    );

    const eyeIrisMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0x15aabf, // Luminous teal iris
        roughness: 0.15
      })
    );

    const eyePupilMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0x1f140e, // Deep warm chocolate pupil
        roughness: 0.1
      })
    );

    const eyeHighlightMat = regMat(
      new THREE.MeshBasicMaterial({
        color: 0xffffff
      })
    );

    const blushMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0xff8787, // Soft rosy blush
        roughness: 0.6,
        transparent: true,
        opacity: 0.85
      })
    );

    const scarfMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0x0284c7, // Sky Explorer Scarf
        roughness: 0.3
      })
    );

    const goldStarMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0xfacc15, // Golden Star Explorer Medallion
        roughness: 0.2,
        metalness: 0.4
      })
    );

    // 5. Constructing PIP the 3D Sproutling Explorer
    const characterRoot = new THREE.Group();
    scene.add(characterRoot);

    // --- Ground Contact Shadow Disc ---
    const shadowGeo = regGeo(new THREE.PlaneGeometry(1.6, 1.2));
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 60);
      grad.addColorStop(0, 'rgba(15, 60, 30, 0.45)');
      grad.addColorStop(0.6, 'rgba(15, 60, 30, 0.18)');
      grad.addColorStop(1, 'rgba(15, 60, 30, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = regMat(
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      })
    );
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.78;
    characterRoot.add(shadowMesh);

    // --- Body Group (Handles Breathing, Squash & Stretch) ---
    const bodyGroup = new THREE.Group();
    characterRoot.add(bodyGroup);

    // Main Pear-Shaped Body (Soft & Huggable)
    const mainBodyGeo = regGeo(new THREE.SphereGeometry(0.72, 32, 28));
    mainBodyGeo.scale(1.0, 1.15, 0.95);
    const mainBody = new THREE.Mesh(mainBodyGeo, bodyMat);
    mainBody.position.y = 0.05;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    bodyGroup.add(mainBody);

    // Creamy Belly Patch
    const bellyGeo = regGeo(new THREE.SphereGeometry(0.52, 24, 20));
    bellyGeo.scale(0.85, 0.95, 0.4);
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.set(0, -0.08, 0.52);
    bodyGroup.add(belly);

    // --- Head / Face Features Group (Tracks Cursor Gaze) ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.15, 0.1);
    bodyGroup.add(headGroup);

    // Left Eye
    const eyeWhiteGeo = regGeo(new THREE.SphereGeometry(0.19, 20, 20));
    eyeWhiteGeo.scale(0.9, 1.1, 0.6);

    const leftEye = new THREE.Group();
    leftEye.position.set(-0.25, 0.18, 0.58);
    headGroup.add(leftEye);

    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    leftEye.add(leftEyeWhite);

    const irisGeo = regGeo(new THREE.SphereGeometry(0.12, 16, 16));
    irisGeo.scale(0.95, 1.05, 0.2);
    const leftIris = new THREE.Mesh(irisGeo, eyeIrisMat);
    leftIris.position.set(0.01, 0, 0.1);
    leftEye.add(leftIris);

    const pupilGeo = regGeo(new THREE.SphereGeometry(0.08, 16, 16));
    pupilGeo.scale(0.9, 1.0, 0.15);
    const leftPupil = new THREE.Mesh(pupilGeo, eyePupilMat);
    leftPupil.position.set(0.01, 0, 0.12);
    leftEye.add(leftPupil);

    // Catchlight Sparkles
    const glintMainGeo = regGeo(new THREE.SphereGeometry(0.035, 12, 12));
    const leftGlint1 = new THREE.Mesh(glintMainGeo, eyeHighlightMat);
    leftGlint1.position.set(-0.03, 0.04, 0.14);
    leftEye.add(leftGlint1);

    const glintSubGeo = regGeo(new THREE.SphereGeometry(0.018, 10, 10));
    const leftGlint2 = new THREE.Mesh(glintSubGeo, eyeHighlightMat);
    leftGlint2.position.set(0.035, -0.03, 0.14);
    leftEye.add(leftGlint2);

    // Right Eye
    const rightEye = new THREE.Group();
    rightEye.position.set(0.25, 0.18, 0.58);
    headGroup.add(rightEye);

    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    rightEye.add(rightEyeWhite);

    const rightIris = new THREE.Mesh(irisGeo, eyeIrisMat);
    rightIris.position.set(-0.01, 0, 0.1);
    rightEye.add(rightIris);

    const rightPupil = new THREE.Mesh(pupilGeo, eyePupilMat);
    rightPupil.position.set(-0.01, 0, 0.12);
    rightEye.add(rightPupil);

    const rightGlint1 = new THREE.Mesh(glintMainGeo, eyeHighlightMat);
    rightGlint1.position.set(-0.03, 0.04, 0.14);
    rightEye.add(rightGlint1);

    const rightGlint2 = new THREE.Mesh(glintSubGeo, eyeHighlightMat);
    rightGlint2.position.set(0.035, -0.03, 0.14);
    rightEye.add(rightGlint2);

    // Rosy Cheeks
    const cheekGeo = regGeo(new THREE.SphereGeometry(0.11, 16, 12));
    cheekGeo.scale(1.2, 0.8, 0.3);

    const leftCheek = new THREE.Mesh(cheekGeo, blushMat);
    leftCheek.position.set(-0.4, 0.02, 0.54);
    leftCheek.rotation.z = -0.15;
    headGroup.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeo, blushMat);
    rightCheek.position.set(0.4, 0.02, 0.54);
    rightCheek.rotation.z = 0.15;
    headGroup.add(rightCheek);

    // Sweet Smiling Mouth (Curved Torus)
    const mouthGeo = regGeo(new THREE.TorusGeometry(0.09, 0.025, 12, 20, Math.PI * 0.85));
    const mouthMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0x9a3412,
        roughness: 0.4
      })
    );
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.05, 0.65);
    mouth.rotation.x = Math.PI * 0.95;
    headGroup.add(mouth);

    // --- Signature Sprout Leaf Antenna (Organic & Responsive) ---
    const antennaRoot = new THREE.Group();
    antennaRoot.position.set(0, 0.82, 0);
    bodyGroup.add(antennaRoot);

    // Golden Seed Cap
    const seedGeo = regGeo(new THREE.SphereGeometry(0.09, 16, 16));
    const seedCap = new THREE.Mesh(seedGeo, goldStarMat);
    antennaRoot.add(seedCap);

    // Curved Stem
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.03, 0.12, 0.02),
      new THREE.Vector3(0.08, 0.24, -0.02),
      new THREE.Vector3(0.02, 0.35, 0)
    ]);
    const stemGeo = regGeo(new THREE.TubeGeometry(stemCurve, 12, 0.03, 8, false));
    const stemMesh = new THREE.Mesh(stemGeo, leafStemMat);
    antennaRoot.add(stemMesh);

    // Main Leaf
    const leafGeo = regGeo(new THREE.SphereGeometry(0.18, 16, 12));
    leafGeo.scale(1.4, 0.25, 0.7);
    const leaf1 = new THREE.Mesh(leafGeo, leafMat);
    leaf1.position.set(0.15, 0.36, 0.02);
    leaf1.rotation.set(0.2, 0.4, 0.35);
    antennaRoot.add(leaf1);

    // Small Companion Sprout Leaf
    const leaf2Geo = regGeo(new THREE.SphereGeometry(0.12, 12, 10));
    leaf2Geo.scale(1.2, 0.2, 0.6);
    const leaf2 = new THREE.Mesh(leaf2Geo, leafMat);
    leaf2.position.set(-0.08, 0.28, -0.02);
    leaf2.rotation.set(-0.2, -0.4, -0.35);
    antennaRoot.add(leaf2);

    // --- Explorer Neck Scarf & Medallion ---
    const scarfGeo = regGeo(new THREE.TorusGeometry(0.55, 0.09, 14, 28));
    scarfGeo.scale(1.0, 0.8, 0.95);
    const scarf = new THREE.Mesh(scarfGeo, scarfMat);
    scarf.position.set(0, -0.26, 0.05);
    scarf.rotation.x = Math.PI / 2.15;
    scarf.castShadow = true;
    bodyGroup.add(scarf);

    // Scarf Knot & Golden Star Medallion
    const medallionGeo = regGeo(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 16));
    const medallion = new THREE.Mesh(medallionGeo, goldStarMat);
    medallion.position.set(0, -0.32, 0.58);
    medallion.rotation.x = Math.PI / 2;
    bodyGroup.add(medallion);

    // --- Arms / Hands (For Waving and Tactile Reactions) ---
    // Right Arm (Waving Arm)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.56, 0.0, 0.1);
    bodyGroup.add(rightArmGroup);

    const handGeo = regGeo(new THREE.SphereGeometry(0.16, 16, 16));
    handGeo.scale(1.1, 1.0, 0.9);
    const rightHand = new THREE.Mesh(handGeo, bodyMat);
    rightHand.position.set(0.18, 0.12, 0);
    rightArmGroup.add(rightHand);

    // Left Arm (Relaxed)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.56, -0.08, 0.1);
    bodyGroup.add(leftArmGroup);

    const leftHand = new THREE.Mesh(handGeo, bodyMat);
    leftHand.position.set(-0.12, 0, 0);
    leftArmGroup.add(leftHand);

    // --- Cute Stumpy Feet ---
    const footGeo = regGeo(new THREE.SphereGeometry(0.2, 16, 12));
    footGeo.scale(1.0, 0.6, 1.4);

    const leftFoot = new THREE.Mesh(footGeo, bodyMat);
    leftFoot.position.set(-0.3, -0.68, 0.15);
    leftFoot.rotation.y = -0.15;
    characterRoot.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeo, bodyMat);
    rightFoot.position.set(0.3, -0.68, 0.15);
    rightFoot.rotation.y = 0.15;
    characterRoot.add(rightFoot);

    // 6. Pointer Tracking Handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerPosRef.current.targetX = THREE.MathUtils.clamp(normX, -1, 1);
      pointerPosRef.current.targetY = THREE.MathUtils.clamp(normY, -1, 1);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 7. Animation Loop with Welcome Wave and Organic Idles
    const clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;
    let blinkProgress = 0;

    const render = () => {
      if (disposed) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth pointer interpolation
      pointerPosRef.current.x += (pointerPosRef.current.targetX - pointerPosRef.current.x) * 0.08;
      pointerPosRef.current.y += (pointerPosRef.current.targetY - pointerPosRef.current.y) * 0.08;

      if (!reducedMotion) {
        // --- Natural Breathing & Gentle Bob ---
        const breath = Math.sin(elapsed * 2.2) * 0.035;
        bodyGroup.position.y = breath;
        bodyGroup.scale.set(1.0 + breath * 0.2, 1.0 - breath * 0.25, 1.0 + breath * 0.2);

        // --- Gaze Tracking (Eyes and Head subtle rotation) ---
        const gazeX = pointerPosRef.current.x * 0.22;
        const gazeY = pointerPosRef.current.y * 0.16;
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, gazeX, 0.1);
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -gazeY, 0.1);

        // Pupils subtle shift
        leftPupil.position.x = 0.01 + gazeX * 0.08;
        leftPupil.position.y = gazeY * 0.06;
        rightPupil.position.x = -0.01 + gazeX * 0.08;
        rightPupil.position.y = gazeY * 0.06;

        // --- Sprout Antenna Gentle Sway ---
        antennaRoot.rotation.z = Math.sin(elapsed * 2.8) * 0.12 + gazeX * 0.3;
        antennaRoot.rotation.x = Math.cos(elapsed * 2.4) * 0.08 - gazeY * 0.2;

        // --- Natural Blinking Cycle ---
        blinkTimer += delta;
        if (!isBlinking && blinkTimer > 3.2 + Math.sin(elapsed) * 1.5) {
          isBlinking = true;
          blinkTimer = 0;
          blinkProgress = 0;
        }

        if (isBlinking) {
          blinkProgress += delta * 12; // Fast, natural blink speed
          const blinkScale = Math.sin(blinkProgress * Math.PI);
          const eyeScaleY = THREE.MathUtils.lerp(1.1, 0.08, Math.max(0, blinkScale));
          leftEyeWhite.scale.y = eyeScaleY;
          rightEyeWhite.scale.y = eyeScaleY;

          if (blinkProgress >= 1.0) {
            isBlinking = false;
            leftEyeWhite.scale.y = 1.1;
            rightEyeWhite.scale.y = 1.1;
          }
        }

        // --- Introductory Welcome Wave (on load for 2.2s) & Hover Wave ---
        const isIntroWave = elapsed < 2.2;
        const isInteractiveWave = isHoveredRef.current || touchReactionRef.current > 0;

        if (isIntroWave || isInteractiveWave) {
          const waveFreq = elapsed * 8;
          const waveAngle = Math.sin(waveFreq) * 0.45 + 0.65;
          rightArmGroup.position.set(0.52, 0.25, 0.2);
          rightArmGroup.rotation.z = waveAngle;
          rightArmGroup.rotation.x = 0.3;
          rightArmGroup.rotation.y = -0.2;

          // Happy head tilt during wave
          characterRoot.rotation.z = Math.sin(elapsed * 3) * 0.04;
        } else {
          // Relaxed arm idle
          rightArmGroup.position.set(0.56, -0.08 + breath * 0.5, 0.1);
          rightArmGroup.rotation.set(0, 0, Math.sin(elapsed * 2.2) * 0.08 - 0.1);
          characterRoot.rotation.z = THREE.MathUtils.lerp(characterRoot.rotation.z, 0, 0.1);
        }

        // --- Tactile Touch/Hover Bounce Decay ---
        if (touchReactionRef.current > 0) {
          touchReactionRef.current = Math.max(0, touchReactionRef.current - delta * 2.5);
          const bounce = Math.sin(touchReactionRef.current * Math.PI * 3) * 0.08 * touchReactionRef.current;
          characterRoot.position.y = bounce;
        } else {
          characterRoot.position.y = 0;
        }
      } else {
        // Reduced Motion static friendly pose
        bodyGroup.position.y = 0;
        antennaRoot.rotation.set(0, 0, 0.05);
        rightArmGroup.position.set(0.54, 0.15, 0.15);
        rightArmGroup.rotation.set(0.2, -0.1, 0.5);
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // 8. Responsive Container Resizing via ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });

    resizeObserver.observe(container);

    // 9. Cleanup & Memory Deallocation
    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();

      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      shadowTex.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [reducedMotion]);

  return (
    <div
      id="wonder-meadow-welcome-character-container"
      className={`relative flex flex-col items-center justify-center cursor-pointer select-none group ${className}`}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      onClick={handlePointerInteraction}
      role="img"
      aria-label="Pip the Wonder Meadow Explorer Mascot - Cute 3D Character"
      title="Say hello to Pip!"
    >
      {/* 3D Canvas Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full aspect-square flex items-center justify-center will-change-transform transition-transform duration-200 group-hover:scale-105 active:scale-95"
      />

      {/* Friendly, Accessible Character Name Badge */}
      <div className="absolute -bottom-1 z-20 flex items-center gap-1.5 bg-emerald-950/85 hover:bg-emerald-900 text-white px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-display font-bold shadow-md border border-emerald-400/40 transition-all transform group-hover:scale-105 pointer-events-none">
        <span className="text-yellow-300 animate-pulse">✨</span>
        <span className="whitespace-nowrap">Meet Pip!</span>
      </div>
    </div>
  );
};
