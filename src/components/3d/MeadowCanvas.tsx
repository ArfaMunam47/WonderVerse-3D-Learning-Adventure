import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { WorldZoneId, LetterItem, FruitItem, AnimalItem, NumberItem, ExplorerCharacterId, CharacterGender } from '../../types';
import { WORLD_ZONES, ALPHABET_DATA } from '../../data/worldZones';
import { buildWonderMeadowWorld, WorldBuildResult } from './worldBuilder';
import { InWorldDiscoveryModal, InWorldDiscoveryType } from './InWorldDiscoveryModal';
import { CompactMovementCluster } from './CompactMovementCluster';
import { AdventureDestinationCard } from '../world/AdventureDestinationCard';
import { audioService } from '../../utils/audio';
import { ZoomIn, ZoomOut, Compass, Sparkles, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MeadowCanvasProps {
  activeZone: WorldZoneId | null;
  onSelectZone: (zoneId: WorldZoneId) => void;
  onOpenMap?: () => void;
  onHoverZoneChange?: (zoneId: WorldZoneId | null) => void;
  reducedMotion?: boolean;
  gender?: CharacterGender;
  characterId?: ExplorerCharacterId;
  destinationZone?: WorldZoneId | null;
  onEarnStar?: () => void;
}

export const MeadowCanvas: React.FC<MeadowCanvasProps> = ({
  activeZone,
  onSelectZone,
  onOpenMap,
  onHoverZoneChange,
  reducedMotion = false,
  gender = 'girl',
  characterId = 'curious_explorer',
  destinationZone = null,
  onEarnStar
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // In-World Discovery Modal State
  const [activeDiscovery, setActiveDiscovery] = useState<InWorldDiscoveryType | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState<string>('Central Meadow');
  const [hoveredTargetLabel, setHoveredTargetLabel] = useState<string | null>(null);
  const [starBannerText, setStarBannerText] = useState<string | null>(null);

  // Track collected item IDs in this session
  const collectedItemIds = useRef<Set<string>>(new Set());

  // Player Explorer Companion Position & Movement
  const explorerPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.2, 8));
  const targetWalkPos = useRef<THREE.Vector3 | null>(null);
  const explorerAngle = useRef<number>(0);
  const isWalking = useRef<boolean>(false);
  const walkTime = useRef<number>(0);

  // Camera Exploration State (Spherical tracking following Explorer)
  const cameraDistance = useRef<number>(36);
  const cameraAzimuth = useRef<number>(0); // Horizontal angle around explorer
  const cameraPolar = useRef<number>(Math.PI / 4.2); // Elevation angle

  // Keyboard Velocity
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const joystickVector = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  // Mouse Drag Tracking for Camera Orbit
  const isPointerDragging = useRef(false);
  const pointerStart = useRef({ x: 0, y: 0 });
  const pointerStartAzimuth = useRef(0);
  const pointerStartPolar = useRef(0);
  const hasDragged = useRef(false);

  // World Builder result references
  const worldRef = useRef<WorldBuildResult | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Click-to-move Ripple Particle Indicator
  const rippleMeshRef = useRef<THREE.Mesh | null>(null);
  const rippleAnimTime = useRef<number>(0);

  const showCelebrationToast = (text: string) => {
    setStarBannerText(text);
    audioService.playSparkle();
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.85 } });
    setTimeout(() => {
      setStarBannerText(null);
    }, 3200);
  };

  // Update Explorer Character in 3D scene when characterId or gender prop changes
  useEffect(() => {
    if (worldRef.current) {
      if (characterId) {
        worldRef.current.setExplorerCharacter(characterId);
      } else if (gender && worldRef.current.setExplorerGender) {
        worldRef.current.setExplorerGender(gender);
      }
    }
  }, [characterId, gender]);

  // Handle Zone Focus when activeZone changes
  useEffect(() => {
    if (!worldRef.current) return;
    if (activeZone) {
      const targetPos = worldRef.current.zoneAnchors.get(activeZone);
      if (targetPos) {
        explorerPos.current.copy(targetPos);
        targetWalkPos.current = null;
        cameraDistance.current = 24;
      }
    } else {
      cameraDistance.current = 36;
    }
  }, [activeZone]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keysPressed.current[e.key.toLowerCase()] = true;
      keysPressed.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize Three.js World
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Build Scene using World Builder
    const world = buildWonderMeadowWorld();
    worldRef.current = world;
    sceneRef.current = world.scene;

    // 2. Click-to-Move Ripple Mesh
    const ripGeo = new THREE.RingGeometry(0.2, 0.8, 24);
    ripGeo.rotateX(-Math.PI / 2);
    const ripMat = new THREE.MeshBasicMaterial({ color: '#38BDF8', transparent: true, opacity: 0, side: THREE.DoubleSide });
    const ripMesh = new THREE.Mesh(ripGeo, ripMat);
    ripMesh.position.y = 0.25;
    world.scene.add(ripMesh);
    rippleMeshRef.current = ripMesh;

    // 3. Perspective Camera
    const camera = new THREE.PerspectiveCamera(
      48,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.5,
      600
    );
    cameraRef.current = camera;

    // 4. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    containerRef.current.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    // Initial character sync
    if (characterId) {
      world.setExplorerCharacter(characterId as ExplorerCharacterId);
    } else if (gender && world.setExplorerGender) {
      world.setExplorerGender(gender as 'girl' | 'boy');
    }

    // 5. Game Animation & Physics Loop
    let lastTime = performance.now();

    const animate = (time: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Update ambient animations in world (windmills, clouds, floating letters, butterflies)
      if (world.animatedElements) {
        const anim = world.animatedElements;
        // Clouds drift
        anim.clouds.forEach(c => {
          c.position.x += delta * 1.5;
          if (c.position.x > 85) c.position.x = -85;
        });

        // Butterflies flutter
        anim.butterflies.forEach(b => {
          b.angle += b.speed * delta;
          b.mesh.position.x = b.centerX + Math.cos(b.angle) * b.radius;
          b.mesh.position.z = b.centerZ + Math.sin(b.angle) * b.radius;
          b.mesh.position.y = b.height + Math.sin(b.angle * 3) * 0.4;
        });

        // Ducks swim
        anim.ducks.forEach(d => {
          d.angle += d.speed * delta;
          d.mesh.position.x = d.centerX + Math.cos(d.angle) * d.radius;
          d.mesh.position.z = d.centerZ + Math.sin(d.angle) * d.radius;
          d.mesh.rotation.y = -d.angle + Math.PI / 2;
        });

        // Windmill blades rotate
        if (anim.windmillBlades) {
          anim.windmillBlades.rotation.z += delta * 1.2;
        }

        // Observatory dome
        if (anim.observatoryDome) {
          anim.observatoryDome.rotation.y += delta * 0.1;
        }

        // Hidden Stars twinkling and check collection proximity
        anim.hiddenStars.forEach(s => {
          s.mesh.rotation.y += delta * 1.5;

          if (!s.collected && !collectedItemIds.current.has(s.id)) {
            const starDist = Math.hypot(s.mesh.position.x - explorerPos.current.x, s.mesh.position.z - explorerPos.current.z);
            if (starDist < 2.8) {
              s.collected = true;
              collectedItemIds.current.add(s.id);
              s.mesh.visible = false;
              if (onEarnStar) {
                onEarnStar();
              }
              showCelebrationToast('⭐ +1 Wonder Star! You found a secret meadow star!');
            }
          }
        });
      }

      // Animate Click Ripple if active
      if (rippleAnimTime.current > 0 && rippleMeshRef.current) {
        rippleAnimTime.current -= delta * 2;
        const op = Math.max(0, rippleAnimTime.current);
        (rippleMeshRef.current.material as THREE.MeshBasicMaterial).opacity = op;
        const sc = 1 + (1 - op) * 1.5;
        rippleMeshRef.current.scale.set(sc, sc, sc);
      }

      // Physics: Calculate Character Movement Direction
      const moveVec = new THREE.Vector3(0, 0, 0);

      // Joystick / D-pad input
      if (Math.abs(joystickVector.current.x) > 0.05 || Math.abs(joystickVector.current.z) > 0.05) {
        const forward = new THREE.Vector3(-Math.sin(cameraAzimuth.current), 0, -Math.cos(cameraAzimuth.current));
        const right = new THREE.Vector3(Math.cos(cameraAzimuth.current), 0, -Math.sin(cameraAzimuth.current));
        moveVec.add(forward.multiplyScalar(-joystickVector.current.z));
        moveVec.add(right.multiplyScalar(joystickVector.current.x));
      }

      // Keyboard input (WASD / Arrows)
      const forwardDir = new THREE.Vector3(-Math.sin(cameraAzimuth.current), 0, -Math.cos(cameraAzimuth.current)).normalize();
      const rightDir = new THREE.Vector3(Math.cos(cameraAzimuth.current), 0, -Math.sin(cameraAzimuth.current)).normalize();

      if (keysPressed.current['w'] || keysPressed.current['arrowup'] || keysPressed.current['keyw']) {
        moveVec.add(forwardDir);
      }
      if (keysPressed.current['s'] || keysPressed.current['arrowdown'] || keysPressed.current['keys']) {
        moveVec.sub(forwardDir);
      }
      if (keysPressed.current['d'] || keysPressed.current['arrowright'] || keysPressed.current['keyd']) {
        moveVec.add(rightDir);
      }
      if (keysPressed.current['a'] || keysPressed.current['arrowleft'] || keysPressed.current['keya']) {
        moveVec.sub(rightDir);
      }

      const speed = 12.0; // Units per second

      // If moving via keys/joystick, cancel click-to-move target
      if (moveVec.lengthSq() > 0.01) {
        targetWalkPos.current = null;
        moveVec.normalize();
        explorerPos.current.x += moveVec.x * speed * delta;
        explorerPos.current.z += moveVec.z * speed * delta;

        // Target angle face direction of movement
        explorerAngle.current = Math.atan2(moveVec.x, moveVec.z);
        isWalking.current = true;
      } else if (targetWalkPos.current) {
        // Move toward click-to-move point
        const toTarget = new THREE.Vector3().subVectors(targetWalkPos.current, explorerPos.current);
        toTarget.y = 0;
        const dist = toTarget.length();

        if (dist > 0.4) {
          toTarget.normalize();
          explorerPos.current.x += toTarget.x * speed * delta;
          explorerPos.current.z += toTarget.z * speed * delta;
          explorerAngle.current = Math.atan2(toTarget.x, toTarget.z);
          isWalking.current = true;
        } else {
          targetWalkPos.current = null;
          isWalking.current = false;
        }
      } else {
        isWalking.current = false;
      }

      // Constrain Explorer position to world boundary
      const boundaryRadius = 78;
      const curDist = Math.hypot(explorerPos.current.x, explorerPos.current.z);
      if (curDist > boundaryRadius) {
        const ang = Math.atan2(explorerPos.current.z, explorerPos.current.x);
        explorerPos.current.x = Math.cos(ang) * boundaryRadius;
        explorerPos.current.z = Math.sin(ang) * boundaryRadius;
      }

      // Update 3D Explorer Mesh Position & Walking Animation
      if (world.explorerMesh) {
        world.explorerMesh.position.x = explorerPos.current.x;
        world.explorerMesh.position.z = explorerPos.current.z;

        // Smooth rotation interpolation
        world.explorerMesh.rotation.y = THREE.MathUtils.lerp(
          world.explorerMesh.rotation.y,
          explorerAngle.current,
          0.15
        );

        // Character articulated animation controls
        const ctrl = world.childCharacterController;
        const now = performance.now();

        if (isWalking.current) {
          walkTime.current += delta * 12;
          // Bobbing torso
          world.explorerMesh.position.y = 0.2 + Math.abs(Math.sin(walkTime.current * 2)) * 0.16;

          // Leg swing
          if (ctrl?.leftLeg && ctrl?.rightLeg) {
            ctrl.leftLeg.rotation.x = Math.sin(walkTime.current) * 0.55;
            ctrl.rightLeg.rotation.x = -Math.sin(walkTime.current) * 0.55;
          }
          // Arm swing
          if (ctrl?.leftArm && ctrl?.rightArm) {
            ctrl.leftArm.rotation.x = -Math.sin(walkTime.current) * 0.45;
            ctrl.rightArm.rotation.x = Math.sin(walkTime.current) * 0.45;
          }
          // Wings flutter
          if (ctrl?.wings) {
            ctrl.wings.rotation.y = Math.sin(walkTime.current * 4) * 0.35;
          }
          if (ctrl?.ears && Array.isArray(ctrl.ears)) {
            const earTilt = -0.15 + Math.sin(walkTime.current * 2) * 0.18;
            ctrl.ears.forEach(ear => {
              ear.rotation.x = earTilt;
            });
          }
        } else {
          // Smooth return to relaxed stance
          world.explorerMesh.position.y = 0.2 + Math.sin(now * 0.003) * 0.04;
          if (ctrl?.leftLeg && ctrl?.rightLeg) {
            ctrl.leftLeg.rotation.x = THREE.MathUtils.lerp(ctrl.leftLeg.rotation.x, 0, 0.1);
            ctrl.rightLeg.rotation.x = THREE.MathUtils.lerp(ctrl.rightLeg.rotation.x, 0, 0.1);
          }
          if (ctrl?.leftArm && ctrl?.rightArm) {
            ctrl.leftArm.rotation.x = THREE.MathUtils.lerp(ctrl.leftArm.rotation.x, 0, 0.1);
            ctrl.rightArm.rotation.x = THREE.MathUtils.lerp(ctrl.rightArm.rotation.x, 0, 0.1);
          }
          if (ctrl?.wings) {
            ctrl.wings.rotation.y = Math.sin(now * 0.004) * 0.12;
          }
          if (ctrl?.ears && Array.isArray(ctrl.ears)) {
            const earSway = Math.sin(now * 0.0025) * 0.06;
            ctrl.ears.forEach(ear => {
              ear.rotation.x = earSway;
            });
          }
        }
      }

      // Update Camera tracking Explorer Position
      if (cameraRef.current) {
        const camX = explorerPos.current.x + cameraDistance.current * Math.sin(cameraPolar.current) * Math.sin(cameraAzimuth.current);
        const camY = explorerPos.current.y + cameraDistance.current * Math.cos(cameraPolar.current);
        const camZ = explorerPos.current.z + cameraDistance.current * Math.sin(cameraPolar.current) * Math.cos(cameraAzimuth.current);

        cameraRef.current.position.set(camX, camY, camZ);
        cameraRef.current.lookAt(explorerPos.current.x, explorerPos.current.y + 1.2, explorerPos.current.z);
      }

      // Check Nearest Zone for Location HUD
      let closestZone: string = 'Central Meadow';
      let minZoneDist = 28;

      world.zoneAnchors.forEach((pos, zId) => {
        const d = Math.hypot(pos.x - explorerPos.current.x, pos.z - explorerPos.current.z);
        if (d < minZoneDist) {
          minZoneDist = d;
          const found = WORLD_ZONES.find(z => z.id === zId);
          if (found) closestZone = found.name;
        }
      });

      setCurrentLocationName(closestZone);

      // Render Scene
      renderer.render(world.scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [characterId, gender, onEarnStar]);

  // Pointer Handlers for Orbit Drag & Click to Move
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDragging.current = true;
    hasDragged.current = false;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    pointerStartAzimuth.current = cameraAzimuth.current;
    pointerStartPolar.current = cameraPolar.current;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPointerDragging.current) {
      const dx = e.clientX - pointerStart.current.x;
      const dy = e.clientY - pointerStart.current.y;

      if (Math.hypot(dx, dy) > 4) {
        hasDragged.current = true;
        cameraAzimuth.current = pointerStartAzimuth.current - dx * 0.006;
        cameraPolar.current = Math.max(0.2, Math.min(Math.PI / 2.2, pointerStartPolar.current - dy * 0.005));
      }
    }

    // Raycast hover label over interactive items
    if (containerRef.current && cameraRef.current && worldRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const hits = raycaster.current.intersectObjects(Array.from(worldRef.current.interactiveMap.keys()), true);

      if (hits.length > 0) {
        let hitObj: THREE.Object3D | null = hits[0].object;
        while (hitObj && !worldRef.current.interactiveMap.has(hitObj)) {
          hitObj = hitObj.parent;
        }
        if (hitObj) {
          const target = worldRef.current.interactiveMap.get(hitObj);
          if (target) {
            setHoveredTargetLabel(target.label);
            if (onHoverZoneChange && target.type === 'zone') {
              onHoverZoneChange(target.id as WorldZoneId);
            }
            return;
          }
        }
      }
      setHoveredTargetLabel(null);
      if (onHoverZoneChange) onHoverZoneChange(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isPointerDragging.current = false;

    // If it was a quick click/tap (not a drag)
    if (!hasDragged.current && containerRef.current && cameraRef.current && worldRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, cameraRef.current);

      // 1. Check interactive landmarks / objects first
      const interactiveHits = raycaster.current.intersectObjects(Array.from(worldRef.current.interactiveMap.keys()), true);

      if (interactiveHits.length > 0) {
        let hitObj: THREE.Object3D | null = interactiveHits[0].object;
        while (hitObj && !worldRef.current.interactiveMap.has(hitObj)) {
          hitObj = hitObj.parent;
        }

        if (hitObj) {
          const target = worldRef.current.interactiveMap.get(hitObj);
          if (target) {
            audioService.playPop();

            if (target.type === 'letter') {
              const letterIdx = ALPHABET_DATA.findIndex(l => l.letter === target.id);
              setActiveDiscovery({
                type: 'letter',
                item: target.data as LetterItem,
                index: letterIdx >= 0 ? letterIdx : 0
              });
            } else if (target.type === 'fruit') {
              setActiveDiscovery({
                type: 'fruit',
                item: target.data as FruitItem,
                index: 0
              });
            } else if (target.type === 'animal') {
              setActiveDiscovery({
                type: 'animal',
                item: target.data as AnimalItem,
                index: 0
              });
            } else if (target.type === 'number') {
              setActiveDiscovery({
                type: 'number',
                item: target.data as NumberItem,
                index: 0
              });
            } else if (target.type === 'star') {
              setActiveDiscovery({
                type: 'star',
                starId: target.id,
                description: target.label
              });
            } else if (target.type === 'guide') {
              setActiveDiscovery({
                type: 'guide',
                title: 'Barnaby Bunny',
                message: 'Welcome to Wonder Meadow! Follow the winding flower paths to explore Alphabet Grove, Number Valley, Fruit Orchard, and Animal Woods!'
              });
            } else if (target.type === 'xylophone_key') {
              const kData = target.data as { noteIndex: number };
              audioService.playMusicalNote(kData.noteIndex);
              audioService.playSparkle();
            } else if (target.type === 'obstacle') {
              if (target.id === 'gate-alphabet') {
                setActiveDiscovery({
                  type: 'obstacle',
                  obstacleId: 'gate-alphabet',
                  title: 'Alphabet Gate',
                  subtitle: 'Letter Challenge',
                  question: 'The gate is locked! Which letter is "B" for Butterfly?',
                  options: [
                    { label: 'A', icon: '🍎', isCorrect: false, feedback: 'A is for Apple! Look for B!' },
                    { label: 'B', icon: '🦋', isCorrect: true, feedback: 'B is for Butterfly! The gate opens wide!' },
                    { label: 'C', icon: '🐱', isCorrect: false, feedback: 'C is for Cat! Look for B!' }
                  ],
                  themeColor: '#0284C7',
                  rewardZone: 'alphabet'
                });
              } else if (target.id === 'bridge-flower') {
                setActiveDiscovery({
                  type: 'obstacle',
                  obstacleId: 'bridge-flower',
                  title: 'Flower Brook Bridge',
                  subtitle: 'Color Challenge',
                  question: 'To bloom the bridge flowers, choose the Red Strawberry!',
                  options: [
                    { label: 'Blueberry', icon: '🫐', isCorrect: false, feedback: 'Blueberries are blue! Try the red one!' },
                    { label: 'Strawberry', icon: '🍓', isCorrect: true, feedback: 'Red Strawberry blooms the flowers!' },
                    { label: 'Banana', icon: '🍌', isCorrect: false, feedback: 'Bananas are yellow! Try the red one!' }
                  ],
                  themeColor: '#EC4899',
                  rewardZone: 'fruits'
                });
              } else {
                setActiveDiscovery({
                  type: 'obstacle',
                  obstacleId: target.id,
                  title: 'Stepping Stones Brook',
                  subtitle: 'Counting Challenge',
                  question: 'How many stepping stones are there across the brook? 1, 2, ... ?',
                  options: [
                    { label: '3 Stones', icon: '🪨', isCorrect: true, feedback: '3 Stones! You hopped across safely!' },
                    { label: '7 Stones', icon: '🪨', isCorrect: false, feedback: 'Too many! Try 3 stones!' },
                    { label: '0 Stones', icon: '🪨', isCorrect: false, feedback: 'Look closely! Try 3 stones!' }
                  ],
                  themeColor: '#3B82F6',
                  rewardZone: 'numbers'
                });
              }
            } else if (target.type === 'zone') {
              onSelectZone(target.id as WorldZoneId);
            }
            return;
          }
        }
      }

      // 2. Otherwise Clicked on Ground -> Move Explorer There!
      const sceneHits = raycaster.current.intersectObjects(worldRef.current.scene.children, true);
      if (sceneHits.length > 0) {
        const pt = sceneHits[0].point;
        targetWalkPos.current = new THREE.Vector3(pt.x, 0.2, pt.z);

        if (rippleMeshRef.current) {
          rippleMeshRef.current.position.set(pt.x, 0.22, pt.z);
          rippleAnimTime.current = 1.0;
        }
        audioService.playPop();
      }
    }
  };

  // Next / Previous letter station cycling in Alphabet Grove modal
  const handleNextStation = () => {
    if (activeDiscovery && activeDiscovery.type === 'letter') {
      const nextIdx = (activeDiscovery.index + 1) % ALPHABET_DATA.length;
      setActiveDiscovery({
        type: 'letter',
        item: ALPHABET_DATA[nextIdx],
        index: nextIdx
      });
      audioService.playPop();
    }
  };

  const handlePrevStation = () => {
    if (activeDiscovery && activeDiscovery.type === 'letter') {
      const prevIdx = (activeDiscovery.index - 1 + ALPHABET_DATA.length) % ALPHABET_DATA.length;
      setActiveDiscovery({
        type: 'letter',
        item: ALPHABET_DATA[prevIdx],
        index: prevIdx
      });
      audioService.playPop();
    }
  };

  // Instant Stop Action for Character Movement (#5)
  const handleStopMovement = useCallback(() => {
    joystickVector.current = { x: 0, z: 0 };
    targetWalkPos.current = null;
    keysPressed.current = {};
    isWalking.current = false;
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#BAE6FD]">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* 1. Top-Left Clean Location HUD */}
      <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 pointer-events-none flex flex-col gap-2">
        <div className="flex items-center gap-2.5 bg-[#FFFDF7]/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-amber-300 shadow-sm">
          <div className="w-6 h-6 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-2xs">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-stone-500 block leading-none">
              Location
            </span>
            <span className="text-xs md:text-sm font-display font-black text-stone-800 leading-tight">
              {currentLocationName}
            </span>
          </div>
        </div>

        {/* Hover Target Preview Tag */}
        {hoveredTargetLabel && (
          <div className="bg-sky-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-md border border-white flex items-center gap-1.5 animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{hoveredTargetLabel}</span>
          </div>
        )}
      </div>

      {/* Real-time Wonder Star Reward Celebration Toast */}
      {starBannerText && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in zoom-in-95 fade-in slide-in-from-top-4">
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-900 font-display font-black px-5 py-2.5 rounded-full shadow-2xl border-2 border-white flex items-center gap-2 text-xs sm:text-sm">
            <Star className="w-4 h-4 fill-stone-900 text-stone-900 animate-spin" />
            <span>{starBannerText}</span>
          </div>
        </div>
      )}

      {/* 2. Top-Right Zoom Controls */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => {
            cameraDistance.current = Math.max(16, cameraDistance.current - 6);
            audioService.playPop();
          }}
          className="w-9 h-9 rounded-2xl bg-[#FFFDF7]/95 hover:bg-white text-stone-700 flex items-center justify-center border border-amber-300 shadow-sm cursor-pointer active:scale-95 transition-transform"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            cameraDistance.current = Math.min(65, cameraDistance.current + 6);
            audioService.playPop();
          }}
          className="w-9 h-9 rounded-2xl bg-[#FFFDF7]/95 hover:bg-white text-stone-700 flex items-center justify-center border border-amber-300 shadow-sm cursor-pointer active:scale-95 transition-transform"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Bottom-Left Movement Controls & STOP Button (#5) */}
      <CompactMovementCluster
        onMove={(dir) => {
          joystickVector.current = dir;
        }}
        onRotate={(deltaYaw) => {
          cameraAzimuth.current += deltaYaw;
          audioService.playPop();
        }}
        onReset={() => {
          explorerPos.current.set(0, 0.2, 8);
          targetWalkPos.current = null;
          cameraAzimuth.current = 0;
          cameraDistance.current = 36;
          audioService.playSparkle();
        }}
        onStop={handleStopMovement}
        reducedMotion={reducedMotion}
      />

      {/* 4. Bottom-Right Adventure Destination Card (#6) */}
      {!activeZone && (
        <AdventureDestinationCard
          destinationZoneId={destinationZone}
          onExploreZone={onSelectZone}
          onOpenMap={() => onOpenMap && onOpenMap()}
        />
      )}

      {/* 5. In-World Interactive Discovery Modal */}
      <InWorldDiscoveryModal
        discovery={activeDiscovery}
        onClose={() => setActiveDiscovery(null)}
        onEarnStar={() => {
          if (onEarnStar) {
            onEarnStar();
          }
          showCelebrationToast('⭐ +1 Wonder Star! You solved the challenge!');
        }}
        onOpenZoneView={(zoneId) => {
          setActiveDiscovery(null);
          onSelectZone(zoneId);
        }}
        onNextStation={handleNextStation}
        onPrevStation={handlePrevStation}
      />
    </div>
  );
};
