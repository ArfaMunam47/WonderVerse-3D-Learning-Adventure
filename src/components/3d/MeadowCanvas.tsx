import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { WorldZoneId, LetterItem, FruitItem, AnimalItem, NumberItem, ExplorerCharacterId, CharacterGender } from '../../types';
import { WORLD_ZONES, ALPHABET_DATA } from '../../data/worldZones';
import { buildWonderMeadowWorld, WorldBuildResult } from './worldBuilder';
import { GuidedTrailVisualizer, findRoadPath, ZONE_NODE_MAP, ROAD_NODES, findClosestRoadNode, clampPositionToRoadNetwork, PATH_BLOCKAGES, PathBlockageDef } from './pathNetwork';
import { InWorldDiscoveryModal, InWorldDiscoveryType } from './InWorldDiscoveryModal';
import { CompactMovementCluster } from './CompactMovementCluster';
import { AdventureDestinationCard } from '../world/AdventureDestinationCard';
import { AdventureBagModal } from '../inventory/AdventureBagModal';
import { getCharacterById } from '../../data/charactersData';
import { audioService } from '../../utils/audio';
import { AuthUser, UserProfile } from '../../utils/api';
import { LearningExperienceSideDock } from '../parent/LearningExperienceSideDock';
import { ZoomIn, ZoomOut, Compass, Sparkles, Star, Navigation, MapPin, Play, Pause, X, ChevronRight, Volume2, VolumeX, Shield, User, BookOpen, Package, Check, Award } from 'lucide-react';
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
  coins?: number;
  gems?: number;
  clovers?: number;
  stars?: number;
  onCollectItem?: (type: 'coin' | 'gem' | 'clover' | 'star', value?: number) => void;
  onOpenCharacterPicker?: () => void;
  onOpenCaregiver?: () => void;
  onOpenProfile?: () => void;
  onOpenLearn?: () => void;
  onOpenRewards?: () => void;
  onToggleSound?: () => void;
  soundEnabled?: boolean;
  user?: AuthUser | null;
  profile?: UserProfile | null;
  onReturnToStartGate?: () => void;
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
  onEarnStar,
  coins = 0,
  gems = 0,
  clovers = 0,
  stars = 0,
  onCollectItem,
  onOpenCharacterPicker,
  onOpenCaregiver,
  onOpenProfile,
  onOpenLearn,
  onOpenRewards,
  onToggleSound,
  soundEnabled = true,
  user = null,
  profile = null,
  onReturnToStartGate
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
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);
  const lastCollisionWarnTime = useRef<number>(0);

  // Adventure Bag Inventory State
  const [isBagOpen, setIsBagOpen] = useState<boolean>(false);
  const [bagBounceFlash, setBagBounceFlash] = useState<boolean>(false);
  const [bagLootFruits, setBagLootFruits] = useState<number>(3);
  const [clearedBlockages, setClearedBlockages] = useState<Record<string, boolean>>({});
  const [activeBlockagePrompt, setActiveBlockagePrompt] = useState<PathBlockageDef | null>(null);
  const unclearedBlockagesRef = useRef<Set<string>>(new Set(Object.keys(PATH_BLOCKAGES)));

  // Trail Guidance & Road Auto-Walk State
  const [guidedZoneId, setGuidedZoneId] = useState<WorldZoneId | null>(destinationZone || 'alphabet');
  const [isAutoWalkingState, setIsAutoWalkingState] = useState<boolean>(false);
  const [trailDistance, setTrailDistance] = useState<number>(0);
  const trailVisualizerRef = useRef<GuidedTrailVisualizer | null>(null);
  const autoWalkWaypoints = useRef<THREE.Vector3[]>([]);
  const isAutoWalking = useRef<boolean>(false);

  // Track collected item IDs in this session
  const collectedItemIds = useRef<Set<string>>(new Set());

  // Player Explorer Companion Position & Movement (Spawned on Start Gate Star Podium at 0, 10)
  const explorerPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.2, 10));
  const targetWalkPos = useRef<THREE.Vector3 | null>(null);
  const explorerAngle = useRef<number>(0);
  const isWalking = useRef<boolean>(false);
  const walkTime = useRef<number>(0);

  const triggerBagBounce = useCallback(() => {
    setBagBounceFlash(true);
    setTimeout(() => setBagBounceFlash(false), 800);
  }, []);

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

  const triggerCollisionNotice = (obstacleName: string) => {
    const now = performance.now();
    if (now - lastCollisionWarnTime.current > 1800) {
      lastCollisionWarnTime.current = now;
      audioService.playPop();
      setCollisionWarning(`Blocked by ${obstacleName}! Follow the paved road!`);
      setTimeout(() => {
        setCollisionWarning(null);
      }, 2200);
    }
  };

  // Start guided path along cobblestone road to a target zone
  const startGuidedTrail = useCallback((targetZId: WorldZoneId, autoWalk = true) => {
    setGuidedZoneId(targetZId);
    const targetNodeId = ZONE_NODE_MAP[targetZId];
    if (!targetNodeId) return;

    const points = findRoadPath(explorerPos.current.x, explorerPos.current.z, targetNodeId);
    if (trailVisualizerRef.current) {
      const zInfo = WORLD_ZONES.find(z => z.id === targetZId);
      trailVisualizerRef.current.setPath(points, zInfo?.name);
    }

    if (autoWalk) {
      autoWalkWaypoints.current = [...points];
      isAutoWalking.current = true;
      setIsAutoWalkingState(true);
      audioService.playSparkle();
      const zInfo = WORLD_ZONES.find(z => z.id === targetZId);
      showCelebrationToast(`🧭 Walking paved road to ${zInfo?.name || targetZId}!`);
    }
  }, []);

  // Stop auto-walk
  const stopAutoWalk = useCallback(() => {
    isAutoWalking.current = false;
    setIsAutoWalkingState(false);
    autoWalkWaypoints.current = [];
  }, []);

  // Clear guided trail completely
  const clearGuidedTrail = useCallback(() => {
    stopAutoWalk();
    setGuidedZoneId(null);
    if (trailVisualizerRef.current) {
      trailVisualizerRef.current.clear();
    }
  }, [stopAutoWalk]);

  // Sync destinationZone prop to guided trail
  useEffect(() => {
    if (destinationZone) {
      startGuidedTrail(destinationZone, false);
    }
  }, [destinationZone, startGuidedTrail]);

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
        stopAutoWalk();
        cameraDistance.current = 24;
      }
    } else {
      cameraDistance.current = 36;
    }
  }, [activeZone, stopAutoWalk]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keysPressed.current[e.key.toLowerCase()] = true;
      keysPressed.current[e.code] = true;
      // User manual input yields auto-walk
      if (isAutoWalking.current) {
        isAutoWalking.current = false;
        setIsAutoWalkingState(false);
      }
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

    // 2. Initialize 3D Guided Trail Ribbon Visualizer
    const trailVis = new GuidedTrailVisualizer(world.scene);
    trailVisualizerRef.current = trailVis;

    // 3. Click-to-Move Ripple Mesh
    const ripGeo = new THREE.RingGeometry(0.2, 0.8, 24);
    ripGeo.rotateX(-Math.PI / 2);
    const ripMat = new THREE.MeshBasicMaterial({ color: '#38BDF8', transparent: true, opacity: 0, side: THREE.DoubleSide });
    const ripMesh = new THREE.Mesh(ripGeo, ripMat);
    ripMesh.position.y = 0.25;
    world.scene.add(ripMesh);
    rippleMeshRef.current = ripMesh;

    // 4. Perspective Camera
    const camera = new THREE.PerspectiveCamera(
      48,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.5,
      600
    );
    cameraRef.current = camera;

    // 5. WebGL Renderer
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

    // Default Trail Initializer
    const initTarget = destinationZone || 'alphabet';
    const initNode = ZONE_NODE_MAP[initTarget];
    if (initNode) {
      const pts = findRoadPath(0, 8, initNode);
      trailVis.setPath(pts);
    }

    // 6. Game Animation & Physics Loop
    let lastTime = performance.now();

    const animate = (time: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Update ambient animations in world
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

        // Hidden Stars
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
              if (onCollectItem) {
                onCollectItem('star', 1);
              }
              showCelebrationToast('⭐ +1 Wonder Star! You found a secret meadow star!');
            }
          }
        });

        // 3D Collectibles loop (Finely scaled coins, sweet berries, gems, clovers)
        if (anim.collectibles) {
          const cTime = performance.now() * 0.003;
          anim.collectibles.forEach(c => {
            if (c.collected || collectedItemIds.current.has(c.id)) {
              c.mesh.visible = false;
              return;
            }

            c.mesh.rotation.y += delta * 2.5;
            c.mesh.position.y = c.initialY + Math.sin(cTime * 2 + (c.value || 1)) * 0.12;

            const cDist = Math.hypot(c.mesh.position.x - explorerPos.current.x, c.mesh.position.z - explorerPos.current.z);
            if (cDist < 2.0) {
              c.collected = true;
              collectedItemIds.current.add(c.id);
              c.mesh.visible = false;

              triggerBagBounce();
              audioService.playPop();

              if (onCollectItem) {
                onCollectItem(c.type as any, c.value || 1);
              }

              if (c.type === 'coin') {
                showCelebrationToast(`+${c.value || 1} Meadow Coin 🪙`);
              } else if (c.type === 'gem') {
                showCelebrationToast(`+${c.value || 5} Gem Crystal 💎`);
              } else if (c.type === 'clover') {
                showCelebrationToast(`+${c.value || 3} Lucky Clover 🍀`);
              } else if (c.type === 'fruit') {
                setBagLootFruits(prev => prev + 1);
                showCelebrationToast(`+1 Meadow Berry 🍓`);
              }
            }
          });
        }

        // 3D Road Blockages animation loop (Bunny, Magic Log, Ducklings, Star Gate)
        if (anim.roadBlockages) {
          const elapsedSec = performance.now() * 0.001;
          anim.roadBlockages.forEach(b => {
            b.updateAnimation(elapsedSec, !!clearedBlockages[b.id]);
          });
        }

        // 3D Start Gate Pinwheels, Bell, and Balloon animations
        if (anim.startGatePinwheels) {
          anim.startGatePinwheels.forEach((pw, idx) => {
            pw.rotation.z += delta * (idx % 2 === 0 ? 3.5 : -3.5);
          });
        }
        if (anim.startGateBell) {
          const bellTime = performance.now() * 0.003;
          anim.startGateBell.rotation.z = Math.sin(bellTime * 2) * 0.12;
        }
        if (anim.startGateBalloons) {
          const bTime = performance.now() * 0.002;
          anim.startGateBalloons.forEach((bg, idx) => {
            bg.position.y = 4.2 + Math.sin(bTime * 2 + idx) * 0.15;
            bg.rotation.z = Math.sin(bTime + idx) * 0.05;
          });
        }
      }

      // Update 3D Guided Trail Visualizer
      if (trailVisualizerRef.current) {
        trailVisualizerRef.current.update(delta);
      }

      // Animate Click Ripple
      if (rippleAnimTime.current > 0 && rippleMeshRef.current) {
        rippleAnimTime.current -= delta * 2;
        const op = Math.max(0, rippleAnimTime.current);
        (rippleMeshRef.current.material as THREE.MeshBasicMaterial).opacity = op;
        const sc = 1 + (1 - op) * 1.5;
        rippleMeshRef.current.scale.set(sc, sc, sc);
      }

      // Movement Calculations
      const moveVec = new THREE.Vector3(0, 0, 0);

      // 1. Manual Joystick input
      if (Math.abs(joystickVector.current.x) > 0.05 || Math.abs(joystickVector.current.z) > 0.05) {
        isAutoWalking.current = false;
        setIsAutoWalkingState(false);
        const forward = new THREE.Vector3(-Math.sin(cameraAzimuth.current), 0, -Math.cos(cameraAzimuth.current));
        const right = new THREE.Vector3(Math.cos(cameraAzimuth.current), 0, -Math.sin(cameraAzimuth.current));
        moveVec.add(forward.multiplyScalar(-joystickVector.current.z));
        moveVec.add(right.multiplyScalar(joystickVector.current.x));
      }

      // 2. Keyboard input (WASD / Arrows)
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

      const speed = 12.5; // Walking speed

      let nextX = explorerPos.current.x;
      let nextZ = explorerPos.current.z;

      if (moveVec.lengthSq() > 0.01) {
        // Manual Movement active
        targetWalkPos.current = null;
        moveVec.normalize();
        nextX += moveVec.x * speed * delta;
        nextZ += moveVec.z * speed * delta;

        explorerAngle.current = Math.atan2(moveVec.x, moveVec.z);
        isWalking.current = true;
      } else if (isAutoWalking.current && autoWalkWaypoints.current.length > 0) {
        // =================================================================
        // AUTO-FOLLOW PAVED ROAD WAYPOINT ROUTE (GAME-STYLE TRAIL NAVIGATION)
        // =================================================================
        const nextWp = autoWalkWaypoints.current[0];
        const toWp = new THREE.Vector3(nextWp.x - explorerPos.current.x, 0, nextWp.z - explorerPos.current.z);
        const distToWp = toWp.length();

        if (distToWp > 0.9) {
          toWp.normalize();
          nextX += toWp.x * speed * delta;
          nextZ += toWp.z * speed * delta;
          explorerAngle.current = Math.atan2(toWp.x, toWp.z);
          isWalking.current = true;
        } else {
          // Reached current waypoint, pop next
          autoWalkWaypoints.current.shift();
          if (autoWalkWaypoints.current.length === 0) {
            // Reached Destination!
            isAutoWalking.current = false;
            setIsAutoWalkingState(false);
            isWalking.current = false;
            audioService.playSparkle();
            showCelebrationToast(`🎉 You have arrived at your destination!`);
          } else {
            isWalking.current = true;
          }
        }
      } else if (targetWalkPos.current) {
        // Direct click-to-move
        const toTarget = new THREE.Vector3().subVectors(targetWalkPos.current, explorerPos.current);
        toTarget.y = 0;
        const dist = toTarget.length();

        if (dist > 0.4) {
          toTarget.normalize();
          nextX += toTarget.x * speed * delta;
          nextZ += toTarget.z * speed * delta;
          explorerAngle.current = Math.atan2(toTarget.x, toTarget.z);
          isWalking.current = true;
        } else {
          targetWalkPos.current = null;
          isWalking.current = false;
        }
      } else {
        isWalking.current = false;
      }

      // =====================================================================
      // STRICT ROAD NETWORK CONSTRAINT & PATH BLOCKAGE HANDLING
      // (Character walks/runs ONLY along paved paths, bridges, plaza & courtyards)
      // =====================================================================
      if (isWalking.current) {
        const roadClamped = clampPositionToRoadNetwork(nextX, nextZ, unclearedBlockagesRef.current);
        nextX = roadClamped.x;
        nextZ = roadClamped.z;

        if (roadClamped.isBlocked && roadClamped.blockageId) {
          const bDef = PATH_BLOCKAGES[roadClamped.blockageId];
          if (bDef && !clearedBlockages[bDef.id]) {
            setActiveBlockagePrompt(bDef);
            if (targetWalkPos.current) targetWalkPos.current = null;
            if (isAutoWalking.current) {
              isAutoWalking.current = false;
              setIsAutoWalkingState(false);
            }
          }
        }

        explorerPos.current.x = nextX;
        explorerPos.current.z = nextZ;
      }

      // Meadow Boundary limit
      const boundaryRadius = 78;
      const curDist = Math.hypot(explorerPos.current.x, explorerPos.current.z);
      if (curDist > boundaryRadius) {
        const ang = Math.atan2(explorerPos.current.z, explorerPos.current.x);
        explorerPos.current.x = Math.cos(ang) * boundaryRadius;
        explorerPos.current.z = Math.sin(ang) * boundaryRadius;
      }

      // Update 3D Character Mesh & Articulated Rig
      if (world.explorerMesh) {
        world.explorerMesh.position.x = explorerPos.current.x;
        world.explorerMesh.position.z = explorerPos.current.z;

        world.explorerMesh.rotation.y = THREE.MathUtils.lerp(
          world.explorerMesh.rotation.y,
          explorerAngle.current,
          0.15
        );

        const ctrl = world.childCharacterController;
        const now = performance.now();

        if (isWalking.current) {
          walkTime.current += delta * 12;
          world.explorerMesh.position.y = 0.2 + Math.abs(Math.sin(walkTime.current * 2)) * 0.16;

          if (ctrl?.leftLeg && ctrl?.rightLeg) {
            ctrl.leftLeg.rotation.x = Math.sin(walkTime.current) * 0.55;
            ctrl.rightLeg.rotation.x = -Math.sin(walkTime.current) * 0.55;
          }
          if (ctrl?.leftArm && ctrl?.rightArm) {
            ctrl.leftArm.rotation.x = -Math.sin(walkTime.current) * 0.45;
            ctrl.rightArm.rotation.x = Math.sin(walkTime.current) * 0.45;
          }
        } else {
          world.explorerMesh.position.y = 0.2 + Math.sin(now * 0.003) * 0.04;
          if (ctrl?.leftLeg && ctrl?.rightLeg) {
            ctrl.leftLeg.rotation.x = THREE.MathUtils.lerp(ctrl.leftLeg.rotation.x, 0, 0.1);
            ctrl.rightLeg.rotation.x = THREE.MathUtils.lerp(ctrl.rightLeg.rotation.x, 0, 0.1);
          }
          if (ctrl?.leftArm && ctrl?.rightArm) {
            ctrl.leftArm.rotation.x = THREE.MathUtils.lerp(ctrl.leftArm.rotation.x, 0, 0.1);
            ctrl.rightArm.rotation.x = THREE.MathUtils.lerp(ctrl.rightArm.rotation.x, 0, 0.1);
          }
        }
      }

      // Camera Tracking
      if (cameraRef.current) {
        const camX = explorerPos.current.x + cameraDistance.current * Math.sin(cameraPolar.current) * Math.sin(cameraAzimuth.current);
        const camY = explorerPos.current.y + cameraDistance.current * Math.cos(cameraPolar.current);
        const camZ = explorerPos.current.z + cameraDistance.current * Math.sin(cameraPolar.current) * Math.cos(cameraAzimuth.current);

        cameraRef.current.position.set(camX, camY, camZ);
        cameraRef.current.lookAt(explorerPos.current.x, explorerPos.current.y + 1.2, explorerPos.current.z);
      }

      // Location detection
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

      // Update distance to guided zone
      if (guidedZoneId) {
        const anchor = world.zoneAnchors.get(guidedZoneId);
        if (anchor) {
          const dist = Math.round(Math.hypot(anchor.x - explorerPos.current.x, anchor.z - explorerPos.current.z));
          setTrailDistance(dist);
        }
      }

      renderer.render(world.scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [characterId, gender, onEarnStar, destinationZone, guidedZoneId]);

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

    if (!hasDragged.current && containerRef.current && cameraRef.current && worldRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, cameraRef.current);

      // 1. Check interactive landmarks
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
                message: 'Welcome to Wonder Meadow! Follow the paved cobblestone roads to explore Alphabet Grove, Number Valley, Fruit Orchard, and Animal Woods!'
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
            } else if (target.type === 'start_gate') {
              confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 }
              });
              audioService.playMusicalNote(4);
              audioService.playSparkle();
              if (target.id === 'adventure_start_gate_bell') {
                showCelebrationToast('🔔 *DING-DONG!* Golden Start Bell rang! Ready to explore Wonder Meadow!');
              } else {
                showCelebrationToast('🌟 Wonder Adventure Start Gate! Stand on the Star Pad to begin!');
              }
            } else if (target.type === 'zone') {
              // Clicked on a zone landmark: guide along path there!
              startGuidedTrail(target.id as WorldZoneId, true);
            }
            return;
          }
        }
      }

      // 2. Clicked Ground: Smart Path Finding along road
      const sceneHits = raycaster.current.intersectObjects(worldRef.current.scene.children, true);
      if (sceneHits.length > 0) {
        const pt = sceneHits[0].point;
        const closestNodeId = findClosestRoadNode(pt.x, pt.z);
        const roadRoute = findRoadPath(explorerPos.current.x, explorerPos.current.z, closestNodeId);

        // Append final click point
        roadRoute.push(new THREE.Vector3(pt.x, 0.2, pt.z));

        autoWalkWaypoints.current = roadRoute;
        isAutoWalking.current = true;
        setIsAutoWalkingState(true);

        if (rippleMeshRef.current) {
          rippleMeshRef.current.position.set(pt.x, 0.22, pt.z);
          rippleAnimTime.current = 1.0;
        }
        audioService.playPop();
      }
    }
  };

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

  const handleStopMovement = useCallback(() => {
    joystickVector.current = { x: 0, z: 0 };
    targetWalkPos.current = null;
    keysPressed.current = {};
    isWalking.current = false;
    stopAutoWalk();
  }, [stopAutoWalk]);

  const activeGuidedZone = WORLD_ZONES.find(z => z.id === guidedZoneId);
  const currentCharacter = getCharacterById(characterId);

  const handleClearBlockage = (blockage: PathBlockageDef) => {
    setClearedBlockages(prev => ({ ...prev, [blockage.id]: true }));
    unclearedBlockagesRef.current.delete(blockage.id);
    setActiveBlockagePrompt(null);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
    audioService.playSparkle();

    if (onEarnStar) {
      onEarnStar();
    }
    if (onCollectItem) {
      onCollectItem('coin', 5);
      onCollectItem('star', 1);
    }
    showCelebrationToast(`🎉 ${blockage.clearedMessage} (+1 Star & +5 Coins)`);
  };

  const handleReturnToStartGate = () => {
    handleStopMovement();
    explorerPos.current.set(0, 0.2, 10);
    cameraAzimuth.current = 0;
    cameraPolar.current = Math.PI / 4.2;
    cameraDistance.current = 36;
    audioService.playMusicalNote(3);
    audioService.playSparkle();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
    showCelebrationToast('✨ Back at the Adventure Start Gate! Ready to choose a trail!');
  };

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

      {/* =========================================================================
          MINIMAL ESSENTIAL CONTROLS (UNOBTRUSIVE, CLEAN)
          ========================================================================= */}
      {/* Top-Left Subtle Gate / Home Return Button */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          id="btn-return-start-gate"
          onClick={() => {
            if (onReturnToStartGate) {
              onReturnToStartGate();
            } else {
              handleReturnToStartGate();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF7]/90 hover:bg-white text-stone-700 hover:text-stone-900 border border-amber-300 shadow-md font-sans font-bold text-xs cursor-pointer active:scale-95 transition-all backdrop-blur-xs min-h-[38px]"
          title="Return to Start Gate"
          aria-label="Return to Start Gate"
        >
          <span className="text-sm">⛩️</span>
          <span>Gate</span>
        </button>
      </div>

      {/* Top-Right Single Small Sound Control */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 pointer-events-auto flex items-center gap-2">
        {onToggleSound && (
          <button
            type="button"
            id="btn-toggle-sound"
            onClick={() => {
              audioService.playPop();
              onToggleSound();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFFDF7]/90 hover:bg-white text-stone-700 hover:text-stone-900 border border-amber-300 shadow-md flex items-center justify-center cursor-pointer active:scale-95 transition-all backdrop-blur-xs"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            aria-label={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4.5 h-4.5 text-stone-700" />
            ) : (
              <VolumeX className="w-4.5 h-4.5 text-rose-500" />
            )}
          </button>
        )}
      </div>

      {/* Real-time Reward Celebration Toast (Action -> Temporary Feedback -> Disappear) */}
      {starBannerText && (
        <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in zoom-in-95 fade-in slide-in-from-top-3 duration-300">
          <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-stone-950 font-display font-black px-5 py-2.5 rounded-full shadow-2xl border-2 border-white flex items-center gap-2 text-xs sm:text-sm tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-900 animate-spin" />
            <span>{starBannerText}</span>
          </div>
        </div>
      )}

      {/* Bottom-Left Toddler Movement Controls */}
      <CompactMovementCluster
        onMove={(dir) => {
          joystickVector.current = dir;
        }}
        onReset={() => {
          explorerPos.current.set(0, 0.2, 8);
          targetWalkPos.current = null;
          cameraAzimuth.current = 0;
          cameraDistance.current = 36;
          stopAutoWalk();
          audioService.playSparkle();
        }}
        onStop={handleStopMovement}
        reducedMotion={reducedMotion}
      />

      {/* Bottom-Right Clean Adventure Destination Card */}
      {!activeZone && (
        <AdventureDestinationCard
          destinationZoneId={guidedZoneId || destinationZone}
          onExploreZone={(zId) => {
            startGuidedTrail(zId, true);
          }}
          onOpenMap={() => onOpenMap && onOpenMap()}
        />
      )}

      {/* In-World Interactive Discovery Modal */}
      <InWorldDiscoveryModal
        discovery={activeDiscovery}
        onClose={() => setActiveDiscovery(null)}
        onEarnStar={() => {
          if (onEarnStar) {
            onEarnStar();
          }
          showCelebrationToast('⭐ +1 Wonder Star! You explored a learning station!');
        }}
        onOpenZoneView={(zoneId) => {
          setActiveDiscovery(null);
          onSelectZone(zoneId);
        }}
        onNextStation={handleNextStation}
        onPrevStation={handlePrevStation}
      />

      {/* Road Blockage Interactive Clearance Modal */}
      {activeBlockagePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in-95">
          <div className="w-full max-w-md bg-[#FFFDF7] rounded-3xl p-6 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center relative">
            <button
              onClick={() => setActiveBlockagePrompt(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 rounded-full bg-amber-100 border-3 border-amber-300 flex items-center justify-center text-4xl shadow-inner mb-4 animate-bounce">
              {activeBlockagePrompt.icon}
            </div>

            <h3 className="text-xl font-display font-black text-stone-900 mb-1">
              {activeBlockagePrompt.name}
            </h3>

            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3">
              Road Blockage • Friendly Helper Needed!
            </p>

            <p className="text-stone-700 text-sm md:text-base leading-relaxed mb-6 bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
              {activeBlockagePrompt.prompt}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => handleClearBlockage(activeBlockagePrompt)}
                className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-stone-950 font-display font-black text-base border-2 border-emerald-300 shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{activeBlockagePrompt.actionLabel}</span>
                <Sparkles className="w-4 h-4 fill-stone-950" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adventure Bag Backpack Modal */}
      <AdventureBagModal
        isOpen={isBagOpen}
        onClose={() => setIsBagOpen(false)}
        coins={coins}
        gems={gems}
        clovers={clovers}
        stars={stars}
        fruitsCount={bagLootFruits}
        clearedBlockages={clearedBlockages}
        characterId={characterId}
      />
    </div>
  );
};

