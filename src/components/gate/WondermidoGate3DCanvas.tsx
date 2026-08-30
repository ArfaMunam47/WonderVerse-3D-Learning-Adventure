import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ExplorerCharacterId } from '../../types';
import { buildExplorerCharacter, ChildCharacterController } from '../3d/worldBuilder';
import { audioService } from '../../utils/audio';

interface WondermidoGate3DCanvasProps {
  characterId: ExplorerCharacterId;
  isOpening: boolean;
  onOpenComplete: () => void;
}

export const WondermidoGate3DCanvas: React.FC<WondermidoGate3DCanvasProps> = ({
  characterId,
  isOpening,
  onOpenComplete
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isOpeningRef = useRef(isOpening);
  isOpeningRef.current = isOpening;

  const onCompleteRef = useRef(onOpenComplete);
  onCompleteRef.current = onOpenComplete;

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#7DD3FC'); // Crisp sky blue
    scene.fog = new THREE.FogExp2('#BAE6FD', 0.012);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 3.0, -11.5);
    camera.lookAt(0, 3.4, 0);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.replaceChildren(renderer.domElement);

    // 4. Lighting
    const hemiLight = new THREE.HemisphereLight('#E0F2FE', '#86EFAC', 0.75);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#FFFBEB', 1.35);
    dirLight.position.set(15, 25, -15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight('#FEF08A', 0.35);
    scene.add(ambientLight);

    // 5. Ground & Rolling Hills
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#4ADE80',
      roughness: 0.85,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Distant soft hills
    const hillMat = new THREE.MeshStandardMaterial({ color: '#22C55E', roughness: 0.9 });
    for (let h = 0; h < 6; h++) {
      const angle = (h / 6) * Math.PI * 2;
      const dist = 45 + (h % 2) * 15;
      const hill = new THREE.Mesh(new THREE.SphereGeometry(18 + (h % 3) * 6, 16, 12), hillMat);
      hill.position.set(Math.cos(angle) * dist, -8, Math.sin(angle) * dist);
      hill.scale.set(1.4, 0.45, 1.4);
      scene.add(hill);
    }

    // 6. Cobblestone Starting Pathway
    const roadGroup = new THREE.Group();
    const roadMat = new THREE.MeshStandardMaterial({ color: '#FDE68A', roughness: 0.75, metalness: 0.05 });
    const roadBorderMat = new THREE.MeshStandardMaterial({ color: '#D97706', roughness: 0.8 });

    // Main road strip
    const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 50), roadMat);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.02, 5);
    mainRoad.receiveShadow = true;
    roadGroup.add(mainRoad);

    // Road Cobblestone Detail Discs
    for (let r = -20; r <= 30; r += 2.2) {
      for (let c = -1.8; c <= 1.8; c += 1.2) {
        const stone = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35 + Math.random() * 0.15, 0.4 + Math.random() * 0.15, 0.05, 8),
          new THREE.MeshStandardMaterial({
            color: (Math.random() > 0.5 ? '#FEF3C7' : '#FDE047'),
            roughness: 0.7
          })
        );
        stone.position.set(c + (Math.random() - 0.5) * 0.3, 0.03, r + (Math.random() - 0.5) * 0.4);
        stone.receiveShadow = true;
        roadGroup.add(stone);
      }
    }

    // Road Border Curbs
    const curbL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 50), roadBorderMat);
    curbL.position.set(-2.4, 0.1, 5);
    const curbR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 50), roadBorderMat);
    curbR.position.set(2.4, 0.1, 5);
    roadGroup.add(curbL, curbR);

    scene.add(roadGroup);

    // 7. Nature Elements (Trees, Flowers, Mushrooms)
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.85 });
    const foliageMatA = new THREE.MeshStandardMaterial({ color: '#16A34A', roughness: 0.7 });
    const foliageMatB = new THREE.MeshStandardMaterial({ color: '#15803D', roughness: 0.7 });
    const flowerMats = [
      new THREE.MeshStandardMaterial({ color: '#F43F5E' }),
      new THREE.MeshStandardMaterial({ color: '#FB7185' }),
      new THREE.MeshStandardMaterial({ color: '#FBBF24' }),
      new THREE.MeshStandardMaterial({ color: '#A855F7' })
    ];

    const createTree = (x: number, z: number, scale = 1) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, 3 * scale, 8), treeTrunkMat);
      trunk.position.y = 1.5 * scale;
      trunk.castShadow = true;
      const topA = new THREE.Mesh(new THREE.SphereGeometry(1.8 * scale, 8, 8), foliageMatA);
      topA.position.y = 3.6 * scale;
      topA.castShadow = true;
      const topB = new THREE.Mesh(new THREE.SphereGeometry(1.4 * scale, 8, 8), foliageMatB);
      topB.position.set(0.3 * scale, 4.4 * scale, 0.2 * scale);
      topB.castShadow = true;
      tree.add(trunk, topA, topB);
      tree.position.set(x, 0, z);
      scene.add(tree);
    };

    // Trees framing the entrance
    createTree(-7.5, -4, 1.1);
    createTree(-9.5, 2, 1.3);
    createTree(-8.0, 10, 1.2);
    createTree(7.5, -4, 1.1);
    createTree(9.5, 2, 1.3);
    createTree(8.0, 10, 1.2);

    // Flowers along the roadside
    for (let i = 0; i < 28; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const zPos = -12 + (i / 28) * 36;
      const xPos = side * (3.0 + Math.random() * 2.5);
      const fGroup = new THREE.Group();
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 5), foliageMatA);
      stem.position.y = 0.2;
      const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), flowerMats[i % flowerMats.length]);
      bloom.position.y = 0.42;
      fGroup.add(stem, bloom);
      fGroup.position.set(xPos, 0, zPos);
      scene.add(fGroup);
    }

    // =========================================================================
    // 8. LARGE GRAND WONDERMIDO 3D ENTRANCE GATE
    // =========================================================================
    const gateRoot = new THREE.Group();
    gateRoot.position.set(0, 0, 0);

    const stoneMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.6, metalness: 0.1 });
    const woodMat = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.75, metalness: 0.05 });
    const goldMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.25, metalness: 0.7, emissive: '#78350F', emissiveIntensity: 0.2 });
    const darkIronMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.5, metalness: 0.8 });

    // A. Left & Right Heavy Stone Plinths
    const plinthL = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 2.0), stoneMat);
    plinthL.position.set(-3.6, 0.6, 0);
    plinthL.castShadow = true;
    plinthL.receiveShadow = true;

    const plinthR = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 2.0), stoneMat);
    plinthR.position.set(3.6, 0.6, 0);
    plinthR.castShadow = true;
    plinthR.receiveShadow = true;
    gateRoot.add(plinthL, plinthR);

    // B. Left & Right Grand Carved Wooden Pillars
    const pillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 6.2, 12), woodMat);
    pillarL.position.set(-3.6, 4.2, 0);
    pillarL.castShadow = true;

    const pillarR = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 6.2, 12), woodMat);
    pillarR.position.set(3.6, 4.2, 0);
    pillarR.castShadow = true;
    gateRoot.add(pillarL, pillarR);

    // C. Golden Bands & Finials on Pillars
    for (let b = 1.8; b <= 6.8; b += 2.2) {
      const ringL = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.08, 8, 16), goldMat);
      ringL.rotation.x = Math.PI / 2;
      ringL.position.set(-3.6, b, 0);
      const ringR = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.08, 8, 16), goldMat);
      ringR.rotation.x = Math.PI / 2;
      ringR.position.set(3.6, b, 0);
      gateRoot.add(ringL, ringR);
    }

    const finialL = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 12), goldMat);
    finialL.position.set(-3.6, 7.6, 0);
    const finialR = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 12), goldMat);
    finialR.position.set(3.6, 7.6, 0);
    gateRoot.add(finialL, finialR);

    // D. Grand Curved Top Archway Beam
    const archCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.6, 7.0, 0),
      new THREE.Vector3(-2.2, 8.2, 0),
      new THREE.Vector3(0, 8.6, 0),
      new THREE.Vector3(2.2, 8.2, 0),
      new THREE.Vector3(3.6, 7.0, 0)
    ]);
    const archGeo = new THREE.TubeGeometry(archCurve, 32, 0.55, 12, false);
    const archMesh = new THREE.Mesh(archGeo, woodMat);
    archMesh.castShadow = true;
    gateRoot.add(archMesh);

    // Decorative golden crest on top of arch
    const archStarCrest = new THREE.Mesh(new THREE.OctahedronGeometry(0.75, 0), goldMat);
    archStarCrest.position.set(0, 9.4, 0);
    gateRoot.add(archStarCrest);

    // E. PHYSICAL 3D "WONDERMIDO" SIGN
    // Create high-resolution dynamic canvas texture for the signboard
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 1024;
    signCanvas.height = 256;
    const ctx = signCanvas.getContext('2d');
    if (ctx) {
      // Golden wooden board background with gradient
      const grad = ctx.createLinearGradient(0, 0, 1024, 256);
      grad.addColorStop(0, '#78350F');
      grad.addColorStop(0.2, '#B45309');
      grad.addColorStop(0.5, '#F59E0B');
      grad.addColorStop(0.8, '#B45309');
      grad.addColorStop(1, '#78350F');
      ctx.fillStyle = grad;
      ctx.roundRect(16, 16, 992, 224, 40);
      ctx.fill();

      // Golden inner border
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 12;
      ctx.roundRect(32, 32, 960, 192, 32);
      ctx.stroke();

      // WONDERMIDO embossed glowing typography
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 88px "Plus Jakarta Sans", "Fredoka", "Arial Black", sans-serif';

      // Drop shadow for 3D depth
      ctx.fillStyle = '#451A03';
      ctx.fillText('WONDERMIDO', 512 + 4, 128 + 6);

      // Main golden white text
      ctx.fillStyle = '#FFFDF0';
      ctx.fillText('WONDERMIDO', 512, 128);

      // Star accents on sides
      ctx.font = '54px sans-serif';
      ctx.fillText('⭐', 110, 128);
      ctx.fillText('⭐', 914, 128);
    }
    const signTexture = new THREE.CanvasTexture(signCanvas);
    signTexture.anisotropy = 8;

    const signBoardGeo = new THREE.BoxGeometry(5.2, 1.4, 0.28);
    const signBoardMat = new THREE.MeshStandardMaterial({
      map: signTexture,
      roughness: 0.35,
      metalness: 0.15
    });
    const signBoard = new THREE.Mesh(signBoardGeo, signBoardMat);
    signBoard.position.set(0, 7.3, 0.15);
    signBoard.castShadow = true;
    gateRoot.add(signBoard);

    // F. Hanging Warm Lanterns on Pillars
    const createLantern = (x: number, y: number, z: number) => {
      const lanternGroup = new THREE.Group();
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6), darkIronMat);
      cord.position.y = 0.4;
      const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.2, 0.55, 8),
        new THREE.MeshStandardMaterial({
          color: '#FEF08A',
          emissive: '#F59E0B',
          emissiveIntensity: 0.9,
          roughness: 0.2,
          transparent: true,
          opacity: 0.9
        })
      );
      const lPoint = new THREE.PointLight('#FBBF24', 0.8, 8);
      lPoint.position.set(0, 0, 0);
      lanternGroup.add(cord, glass, lPoint);
      lanternGroup.position.set(x, y, z);
      return lanternGroup;
    };
    const lanternL = createLantern(-3.6, 5.0, 0.9);
    const lanternR = createLantern(3.6, 5.0, 0.9);
    gateRoot.add(lanternL, lanternR);

    // G. PHYSICAL 3D DOUBLE GATE DOORS (Hinged to swing open)
    const doorMat = new THREE.MeshStandardMaterial({
      color: '#92400E',
      roughness: 0.8,
      metalness: 0.05
    });

    // Left Door Pivot (Pivot at x: -2.8)
    const doorPivotL = new THREE.Group();
    doorPivotL.position.set(-2.8, 0, 0);

    const doorMeshL = new THREE.Mesh(new THREE.BoxGeometry(2.7, 5.6, 0.25), doorMat);
    doorMeshL.position.set(1.35, 2.9, 0);
    doorMeshL.castShadow = true;

    // Iron Braces & Hinges
    const brace1L = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 0.3), darkIronMat);
    brace1L.position.set(1.35, 4.8, 0);
    const brace2L = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 0.3), darkIronMat);
    brace2L.position.set(1.35, 1.2, 0);
    const starPlateL = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 8), goldMat);
    starPlateL.rotation.x = Math.PI / 2;
    starPlateL.position.set(2.6, 2.9, 0.15);
    doorMeshL.add(brace1L, brace2L, starPlateL);
    doorPivotL.add(doorMeshL);

    // Right Door Pivot (Pivot at x: +2.8)
    const doorPivotR = new THREE.Group();
    doorPivotR.position.set(2.8, 0, 0);

    const doorMeshR = new THREE.Mesh(new THREE.BoxGeometry(2.7, 5.6, 0.25), doorMat);
    doorMeshR.position.set(-1.35, 2.9, 0);
    doorMeshR.castShadow = true;

    const brace1R = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 0.3), darkIronMat);
    brace1R.position.set(-1.35, 4.8, 0);
    const brace2R = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 0.3), darkIronMat);
    brace2R.position.set(-1.35, 1.2, 0);
    const starPlateR = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 8), goldMat);
    starPlateR.rotation.x = Math.PI / 2;
    starPlateR.position.set(-2.6, 2.9, 0.15);
    doorMeshR.add(brace1R, brace2R, starPlateR);
    doorPivotR.add(doorMeshR);

    gateRoot.add(doorPivotL, doorPivotR);
    scene.add(gateRoot);

    // =========================================================================
    // 9. TWO FRIENDLY CHILD-SAFE 3D GUARDS
    // =========================================================================
    const createFriendlyGuard = (guardTheme: 'emerald' | 'amber') => {
      const gGroup = new THREE.Group();

      const gSkin = new THREE.MeshStandardMaterial({ color: '#FCE2D4', roughness: 0.5 });
      const gTunic = new THREE.MeshStandardMaterial({
        color: guardTheme === 'emerald' ? '#16A34A' : '#D97706',
        roughness: 0.5
      });
      const gGold = new THREE.MeshStandardMaterial({ color: '#FACC15', metalness: 0.5, roughness: 0.3 });
      const gHat = new THREE.MeshStandardMaterial({
        color: guardTheme === 'emerald' ? '#15803D' : '#B45309',
        roughness: 0.6
      });
      const gPants = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.6 });
      const gBoots = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.5 });
      const blushMat = new THREE.MeshBasicMaterial({ color: '#FB7185', transparent: true, opacity: 0.6 });
      const eyeMat = new THREE.MeshBasicMaterial({ color: '#1E293B' });
      const sparkleMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
      const smileMat = new THREE.MeshBasicMaterial({ color: '#9F1239' });

      // Body / Tunic
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.40, 0.60, 12), gTunic);
      body.position.y = 0.72;
      body.castShadow = true;
      gGroup.add(body);

      // Gold Belt & Buckle
      const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.41, 0.1, 12), new THREE.MeshStandardMaterial({ color: '#78350F' }));
      belt.position.y = 0.52;
      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.1), gGold);
      buckle.position.set(0, 0.52, 0.38);
      gGroup.add(belt, buckle);

      // Head
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.38, 0);

      const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), gSkin);
      headMesh.castShadow = true;
      headGroup.add(headMesh);

      // Blushes
      const bL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), blushMat);
      bL.position.set(-0.24, -0.06, 0.36);
      const bR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), blushMat);
      bR.position.set(0.24, -0.06, 0.36);
      headGroup.add(bL, bR);

      // Smiling Eyes & Pupils
      const eL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
      eL.position.set(-0.16, 0.06, 0.40);
      const spL = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), sparkleMat);
      spL.position.set(-0.13, 0.08, 0.46);
      const eR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
      eR.position.set(0.16, 0.06, 0.40);
      const spR = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), sparkleMat);
      spR.position.set(0.19, 0.08, 0.46);
      headGroup.add(eL, spL, eR, spR);

      // Sweet Smile
      const smile = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.018, 6, 10, Math.PI), smileMat);
      smile.rotation.x = Math.PI / 2 + 0.3;
      smile.rotation.z = Math.PI;
      smile.position.set(0, -0.14, 0.40);
      headGroup.add(smile);

      // Cute Ranger Feather Cap
      const hatBase = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.45, 12), gHat);
      hatBase.rotation.x = -0.2;
      hatBase.position.set(0, 0.34, -0.05);
      const feather = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.36, 5), gGold);
      feather.rotation.z = -0.5;
      feather.position.set(0.26, 0.42, 0.1);
      headGroup.add(hatBase, feather);
      gGroup.add(headGroup);

      // Arms (Left & Right for waving)
      const armL = new THREE.Group();
      armL.position.set(-0.42, 0.90, 0);
      const armMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.44, 8), gTunic);
      armMeshL.position.y = -0.18;
      const handL = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 8), gSkin);
      handL.position.y = -0.40;
      armL.add(armMeshL, handL);
      gGroup.add(armL);

      const armR = new THREE.Group();
      armR.position.set(0.42, 0.90, 0);
      const armMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.44, 8), gTunic);
      armMeshR.position.y = -0.18;
      const handR = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 8), gSkin);
      handR.position.y = -0.40;
      armR.add(armMeshR, handR);
      gGroup.add(armR);

      // Legs
      const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.35, 8), gPants);
      legL.position.set(-0.16, 0.26, 0);
      const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.32), gBoots);
      bootL.position.set(-0.16, 0.08, 0.05);

      const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.35, 8), gPants);
      legR.position.set(0.16, 0.26, 0);
      const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.32), gBoots);
      bootR.position.set(0.16, 0.08, 0.05);

      gGroup.add(legL, bootL, legR, bootR);

      // Friendly Staff / Wooden Wand in Left Hand
      const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.5, 6), woodMat);
      staff.position.set(-0.52, 0.72, 0.15);
      const staffStar = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), gGold);
      staffStar.position.set(-0.52, 1.48, 0.15);
      gGroup.add(staff, staffStar);

      return {
        group: gGroup,
        head: headGroup,
        armL,
        armR
      };
    };

    // Guard 1 -> Left Side of Gate
    const guard1 = createFriendlyGuard('emerald');
    guard1.group.position.set(-2.4, 0, -1.6);
    guard1.group.rotation.y = 0.45; // Turn slightly toward player path
    scene.add(guard1.group);

    // Guard 2 -> Right Side of Gate
    const guard2 = createFriendlyGuard('amber');
    guard2.group.position.set(2.4, 0, -1.6);
    guard2.group.rotation.y = -0.45; // Turn slightly toward player path
    scene.add(guard2.group);

    // =========================================================================
    // 10. THE EXACT SELECTED PLAYER CHARACTER IN FRONT OF GATE
    // =========================================================================
    const playerChild = buildExplorerCharacter(characterId);
    const playerGroup = new THREE.Group();
    playerGroup.add(playerChild.group);
    // Player stands in front of the gate facing inward towards the archway
    playerGroup.position.set(0, 0, -4.8);
    playerGroup.rotation.y = 0; // Facing inward toward +Z gate
    scene.add(playerGroup);

    const playerCtrl: ChildCharacterController = playerChild.controller;

    // 11. Portal Light Beam beyond Gate
    const portalBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(4.0, 5.5, 12, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: '#FEF08A',
        transparent: true,
        opacity: 0,
        side: THREE.BackSide
      })
    );
    portalBeam.rotation.x = Math.PI / 2;
    portalBeam.position.set(0, 3.2, 6.0);
    scene.add(portalBeam);

    // 12. Floating Sparkle Particles in the Sky
    const sparkleGroup = new THREE.Group();
    const sparkleMat = new THREE.MeshBasicMaterial({ color: '#FEF08A' });
    const sparklesList: THREE.Mesh[] = [];
    for (let s = 0; s < 18; s++) {
      const sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.12 + Math.random() * 0.08, 0), sparkleMat);
      sp.position.set(-8 + Math.random() * 16, 1.5 + Math.random() * 6.5, -8 + Math.random() * 16);
      sparkleGroup.add(sp);
      sparklesList.push(sp);
    }
    scene.add(sparkleGroup);

    // 13. Animation Loop & Gate Opening State Management
    let animFrameId: number;
    let clock = new THREE.Clock();
    let gateOpenProgress = 0;
    let playerWalkZ = -4.8;
    let hasCompleted = false;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Guard 1 Idle Animation (Breathing & Waving)
      guard1.head.rotation.y = Math.sin(time * 1.5) * 0.12;
      guard1.armR.rotation.x = -Math.PI / 2 + Math.sin(time * 4) * 0.3; // Gentle wave
      guard1.armR.rotation.z = Math.cos(time * 4) * 0.2;

      // Guard 2 Idle Animation (Breathing & Cheering)
      guard2.head.rotation.y = -Math.sin(time * 1.5) * 0.12;
      guard2.armR.rotation.x = -Math.PI / 2 + Math.sin(time * 3.5 + 1) * 0.3; // Gentle wave
      guard2.armR.rotation.z = -Math.cos(time * 3.5 + 1) * 0.2;

      // Subtle float on lanterns & crest star
      lanternL.position.y = 5.0 + Math.sin(time * 2) * 0.04;
      lanternR.position.y = 5.0 + Math.sin(time * 2 + 1) * 0.04;
      archStarCrest.rotation.y = time * 0.8;

      // Sparkles floating gently
      sparklesList.forEach((sp, idx) => {
        sp.position.y += Math.sin(time * 2 + idx) * 0.004;
        sp.rotation.y += 0.02;
      });

      // Handle Gate Opening Transition
      if (isOpeningRef.current) {
        // Accelerate gate door swing open
        if (gateOpenProgress < 1) {
          gateOpenProgress = Math.min(1, gateOpenProgress + 0.022);
        }

        // Doors physically swing open
        doorPivotL.rotation.y = -gateOpenProgress * (Math.PI * 0.55);
        doorPivotR.rotation.y = gateOpenProgress * (Math.PI * 0.55);

        // Guards cheer with arms up
        guard1.armL.rotation.x = -Math.PI * 0.75 + Math.sin(time * 8) * 0.2;
        guard2.armL.rotation.x = -Math.PI * 0.75 + Math.sin(time * 8) * 0.2;
        guard1.group.position.y = Math.abs(Math.sin(time * 8)) * 0.15;
        guard2.group.position.y = Math.abs(Math.sin(time * 8 + 0.5)) * 0.15;

        // Portal light intensifies
        portalBeam.material.opacity = gateOpenProgress * 0.45;

        // Player Character walks forward smoothly through the gate
        if (gateOpenProgress > 0.25 && playerWalkZ < 5.2) {
          playerWalkZ += 0.065;
          playerGroup.position.z = playerWalkZ;

          // Leg & arm walking cycle
          const walkCycle = time * 9;
          playerCtrl.leftLeg.rotation.x = Math.sin(walkCycle) * 0.65;
          playerCtrl.rightLeg.rotation.x = -Math.sin(walkCycle) * 0.65;
          playerCtrl.leftArm.rotation.x = -Math.sin(walkCycle) * 0.5;
          playerCtrl.rightArm.rotation.x = Math.sin(walkCycle) * 0.5;
          playerCtrl.head.rotation.y = Math.sin(walkCycle * 0.5) * 0.08;
          playerCtrl.body.position.y = 0.72 + Math.abs(Math.sin(walkCycle)) * 0.06;

          // Camera smoothly glides forward behind player into Wondermido world
          camera.position.z = -11.5 + (playerWalkZ + 4.8) * 0.85;
          camera.position.y = 3.0 + (playerWalkZ + 4.8) * 0.08;
          camera.lookAt(0, 3.2, playerWalkZ + 6);
        }

        // Trigger onOpenComplete once character has walked through into the meadow
        if (playerWalkZ >= 4.8 && !hasCompleted) {
          hasCompleted = true;
          setTimeout(() => {
            onCompleteRef.current();
          }, 350);
        }
      } else {
        // Idle Player Animation in front of gate
        playerCtrl.body.position.y = 0.72 + Math.sin(time * 2.5) * 0.02;
        playerCtrl.head.rotation.x = -0.08 + Math.sin(time * 2) * 0.04; // Looking up at grand gate
        playerCtrl.leftArm.rotation.z = 0.15 + Math.sin(time * 2.5) * 0.05;
        playerCtrl.rightArm.rotation.z = -0.15 - Math.sin(time * 2.5) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [characterId]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none touch-none"
      aria-label="3D Wondermido Entrance Gate Scene"
    />
  );
};
