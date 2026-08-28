import * as THREE from 'three';
import { WORLD_ZONES, ALPHABET_DATA, FRUITS_DATA, ANIMALS_DATA, NUMBERS_DATA } from '../../data/worldZones';
import { WorldZoneId, ExplorerCharacterId } from '../../types';
import { EXPLORER_CHARACTERS, DEFAULT_CHARACTER_ID } from '../../data/charactersData';

export interface InteractiveItemTarget {
  type: 'zone' | 'letter' | 'fruit' | 'animal' | 'number' | 'star' | 'guide' | 'xylophone_key' | 'obstacle' | 'coin' | 'gem' | 'clover' | 'start_gate';
  id: string;
  data?: unknown;
  position: THREE.Vector3;
  label: string;
}

export interface WorldObstacle {
  id: string;
  type: 'lake' | 'boulder' | 'fence' | 'building' | 'gate' | 'tree';
  x: number;
  z: number;
  radius: number;
  name: string;
}

export interface WorldCollectible {
  id: string;
  type: 'coin' | 'gem' | 'clover' | 'star';
  mesh: THREE.Group;
  initialY: number;
  collected: boolean;
  value: number;
  label: string;
  name: string;
}

export interface ChildCharacterController {
  group: THREE.Group;
  head: THREE.Group;
  body: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  characterId: ExplorerCharacterId;
  wings?: THREE.Group;
  ears?: THREE.Group[];
}

export interface WorldBuildResult {
  scene: THREE.Scene;
  interactiveMap: Map<THREE.Object3D, InteractiveItemTarget>;
  zoneAnchors: Map<WorldZoneId, THREE.Vector3>;
  obstacles: WorldObstacle[];
  animatedElements: {
    clouds: THREE.Group[];
    ducks: { mesh: THREE.Group; angle: number; speed: number; radius: number; centerX: number; centerZ: number }[];
    butterflies: { mesh: THREE.Group; angle: number; speed: number; radius: number; height: number; centerX: number; centerZ: number }[];
    windmillBlades: THREE.Group | null;
    observatoryDome: THREE.Mesh | null;
    floatingItems: THREE.Object3D[];
    chimingKeys: { mesh: THREE.Mesh; noteIndex: number }[];
    hiddenStars: { mesh: THREE.Group; id: string; collected: boolean }[];
    collectibles: WorldCollectible[];
    startGatePinwheels?: THREE.Group[];
    startGateBell?: THREE.Group | null;
    startGateBalloons?: THREE.Group[];
  };
  explorerMesh: THREE.Group;
  childCharacterController: ChildCharacterController;
  setExplorerCharacter: (characterId: ExplorerCharacterId) => void;
  setExplorerGender?: (gender: 'girl' | 'boy') => void;
}

// =========================================================================
// HIGH-FIDELITY 3D ORIGINAL CARTOON CHARACTERS (ALL 6 DIVERSE EXPLORERS)
// =========================================================================
export function buildExplorerCharacter(characterId: ExplorerCharacterId = DEFAULT_CHARACTER_ID): {
  group: THREE.Group;
  controller: ChildCharacterController;
} {
  const rootGroup = new THREE.Group();

  // Basic Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: '#FCE2D4',
    roughness: 0.5,
    metalness: 0.05
  });
  const blushMat = new THREE.MeshBasicMaterial({
    color: '#FB7185',
    transparent: true,
    opacity: 0.65
  });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    roughness: 0.2
  });
  const pupilMat = new THREE.MeshStandardMaterial({
    color: '#1E293B',
    roughness: 0.2
  });
  const sparkleMat = new THREE.MeshBasicMaterial({
    color: '#FFFFFF'
  });
  const smileMat = new THREE.MeshBasicMaterial({
    color: '#9F1239'
  });
  const sockMat = new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    roughness: 0.6
  });
  const soleMat = new THREE.MeshStandardMaterial({
    color: '#F8FAFC',
    roughness: 0.4
  });
  const toeCapMat = new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    roughness: 0.3
  });

  // Dynamic Theme Materials per character
  let shirtColor = '#0284C7';
  let accentColor = '#FBBF24';
  let pantsColor = '#1E3A8A';
  let shoeColor = '#F59E0B';
  let hairColor = '#B45309';
  let backpackColor = '#0284C7';

  const cid = (characterId || 'curious_explorer') as string;

  if (cid === 'forest_fawn' || cid === 'forest_friend') {
    // Lumi - Joyful Child Explorer (Warm Purple Hoodie, Star Badge, Khaki Shorts, Sunny Yellow Sneakers, Teal Backpack)
    shirtColor = '#9333EA'; // Vibrant Purple Explorer Hoodie
    accentColor = '#FACC15'; // Golden Star Accent
    pantsColor = '#D4D4D8'; // Khaki Beige Shorts
    shoeColor = '#EAB308'; // Sunny Yellow Sneakers
    hairColor = '#78350F'; // Soft Warm Brown Hair
    backpackColor = '#0D9488'; // Teal Explorer Backpack
  } else if (cid === 'magical_companion' || cid === 'star_sprite') {
    // Nova - Star Companion
    shirtColor = '#8B5CF6';
    accentColor = '#FDE047';
    pantsColor = '#C084FC';
    shoeColor = '#38BDF8';
    hairColor = '#DDD6FE';
    backpackColor = '#F472B6';
  } else if (cid === 'curious_explorer') {
    // Maxi - Curious Explorer
    shirtColor = '#16A34A';
    accentColor = '#FACC15';
    pantsColor = '#1E3A8A';
    shoeColor = '#F59E0B';
    hairColor = '#B45309';
    backpackColor = '#F59E0B';
  } else if (cid === 'little_inventor' || cid === 'tiny_inventor') {
    // Milo - Little Inventor
    shirtColor = '#D97706';
    accentColor = '#0284C7';
    pantsColor = '#334155';
    shoeColor = '#EF4444';
    hairColor = '#92400E';
    backpackColor = '#059669';
  } else if (cid === 'nature_explorer' || cid === 'nature_friend') {
    // Maya - Nature & Creative Explorer
    shirtColor = '#E11D48';
    accentColor = '#F472B6';
    pantsColor = '#831843';
    shoeColor = '#F59E0B';
    hairColor = '#65A30D';
    backpackColor = '#F59E0B';
  } else if (cid === 'creative_dreamer' || cid === 'little_artist') {
    // Luna - Creative Dreamer
    shirtColor = '#9333EA';
    accentColor = '#F472B6';
    pantsColor = '#3B82F6';
    shoeColor = '#EC4899';
    hairColor = '#6D28D9';
    backpackColor = '#F59E0B';
  } else if (cid === 'little_adventurer' || cid === 'adventurous_kid') {
    // Koa - Little Adventurer
    shirtColor = '#EA580C';
    accentColor = '#0284C7';
    pantsColor = '#1E293B';
    shoeColor = '#EF4444';
    hairColor = '#3E2723';
    backpackColor = '#0284C7';
  } else {
    // Future slot / fallback
    shirtColor = '#64748B';
    accentColor = '#38BDF8';
    pantsColor = '#334155';
    shoeColor = '#94A3B8';
    hairColor = '#CBD5E1';
    backpackColor = '#64748B';
  }

  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.45 });
  const shirtAccentMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.4 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.6 });
  const sneakerMat = new THREE.MeshStandardMaterial({ color: shoeColor, roughness: 0.4 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.65 });
  const backpackMat = new THREE.MeshStandardMaterial({ color: backpackColor, roughness: 0.5 });
  const goldMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', metalness: 0.4, roughness: 0.2 });

  // Optional Character Wings & Ears
  let wingsGroup: THREE.Group | undefined;
  let earsList: THREE.Group[] | undefined;

  // 1. Torso & Clothing (Body Group)
  const bodyGroup = new THREE.Group();
  bodyGroup.position.set(0, 0.72, 0);

  if (characterId === 'star_sprite' || characterId === 'magical_companion') {
    // Magical Star Sprite Torso
    const spriteBody = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.54, 14), shirtMat);
    spriteBody.castShadow = true;
    bodyGroup.add(spriteBody);

    // Floating Starlight Sparkle Core
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 12), new THREE.MeshBasicMaterial({ color: '#FFFBEB' }));
    core.position.set(0, 0.05, 0.34);
    bodyGroup.add(core);

    // Star Wings on Back
    wingsGroup = new THREE.Group();
    wingsGroup.position.set(0, 0.12, -0.28);

    const wingMat = new THREE.MeshStandardMaterial({
      color: '#E0E7FF',
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
      metalness: 0.1
    });

    const wingL = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.32), wingMat);
    wingL.position.set(-0.24, 0, 0);
    wingL.rotation.y = -0.3;
    const wingR = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.32), wingMat);
    wingR.position.set(0.24, 0, 0);
    wingR.rotation.y = 0.3;
    wingsGroup.add(wingL, wingR);
    bodyGroup.add(wingsGroup);
  } else {
    // Full Human Child Torso & Explorer Backpack (Used for Lumi, Maxi, Maya, etc.)
    const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.58, 14), shirtMat);
    torsoMesh.castShadow = true;
    bodyGroup.add(torsoMesh);

    // Collar / Scarf
    const collarMesh = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 8, 16), shirtAccentMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.y = 0.28;
    bodyGroup.add(collarMesh);

    // Badges / Buttons
    const button1 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), shirtAccentMat);
    button1.position.set(0, 0.12, 0.38);
    const button2 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), shirtAccentMat);
    button2.position.set(0, -0.04, 0.40);
    bodyGroup.add(button1, button2);

    // Explorer Backpack on back
    const packMesh = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.46, 0.24), backpackMat);
    packMesh.position.set(0, 0.05, -0.30);
    packMesh.castShadow = true;
    bodyGroup.add(packMesh);

    // Character Unique Badges
    if (characterId === 'forest_fawn' || characterId === 'forest_friend') {
      // Lumi: Golden Star Emblem on Chest
      const starBadge = new THREE.Mesh(new THREE.OctahedronGeometry(0.085, 0), goldMat);
      starBadge.position.set(-0.16, 0.12, 0.38);
      bodyGroup.add(starBadge);
    } else if (characterId === 'creative_dreamer' || characterId === 'little_artist') {
      const brush = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.38, 8), new THREE.MeshStandardMaterial({ color: '#F472B6' }));
      brush.rotation.z = 0.2;
      brush.position.set(0.24, 0.12, -0.28);
      bodyGroup.add(brush);
    } else if (characterId === 'little_inventor' || characterId === 'tiny_inventor') {
      const gearBadge = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 8), goldMat);
      gearBadge.rotation.x = Math.PI / 2;
      gearBadge.position.set(-0.16, 0.12, 0.38);
      bodyGroup.add(gearBadge);
    } else if (characterId === 'nature_explorer') {
      const leafBadge = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshStandardMaterial({ color: '#4ADE80' }));
      leafBadge.position.set(-0.16, 0.12, 0.38);
      bodyGroup.add(leafBadge);
    }
  }

  rootGroup.add(bodyGroup);

  // 2. Head Group (with Expressive Features)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.42, 0);

  const headSkin = (characterId === 'star_sprite' || characterId === 'magical_companion')
    ? new THREE.MeshStandardMaterial({ color: '#DDD6FE', roughness: 0.4 })
    : skinMat;

  // Neck
  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.18, 10), headSkin);
  neckMesh.position.y = -0.36;
  headGroup.add(neckMesh);

  // Round Head
  const headBase = new THREE.Mesh(new THREE.SphereGeometry(0.50, 18, 18), headSkin);
  headBase.scale.set(1.0, 0.96, 0.98);
  headBase.castShadow = true;
  headGroup.add(headBase);

  // Blushing Cheeks
  const leftCheek = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 8), blushMat);
  leftCheek.position.set(-0.28, -0.06, 0.38);
  const rightCheek = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 8), blushMat);
  rightCheek.position.set(0.28, -0.06, 0.38);
  headGroup.add(leftCheek, rightCheek);

  // Big Cartoon Eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 12), eyeWhiteMat);
  eyeL.position.set(-0.17, 0.06, 0.42);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 12), eyeWhiteMat);
  eyeR.position.set(0.17, 0.06, 0.42);

  const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), pupilMat);
  pupilL.position.set(-0.17, 0.06, 0.48);
  const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), pupilMat);
  pupilR.position.set(0.17, 0.06, 0.48);

  const sparkleL = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), sparkleMat);
  sparkleL.position.set(-0.14, 0.09, 0.53);
  const sparkleR = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), sparkleMat);
  sparkleR.position.set(0.20, 0.09, 0.53);

  headGroup.add(eyeL, eyeR, pupilL, pupilR, sparkleL, sparkleR);

  // Smile
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.022, 8, 12, Math.PI), smileMat);
  smile.rotation.x = Math.PI / 2 + 0.3;
  smile.rotation.z = Math.PI;
  smile.position.set(0, -0.16, 0.44);
  headGroup.add(smile);

  // Character Unique Headwear & Accessories
  if (characterId === 'forest_fawn' || characterId === 'forest_friend') {
    // Lumi: Cozy Lavender Beanie Hat with Star Patch & Peeking Hair
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.52, 16, 16), hairMat);
    hairCap.position.set(0, 0.04, -0.02);
    headGroup.add(hairCap);

    // Beanie Hat Dome
    const beanieDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.54, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65),
      new THREE.MeshStandardMaterial({ color: '#9333EA', roughness: 0.55 })
    );
    beanieDome.position.set(0, 0.16, -0.02);

    // Folded Beanie Cuff
    const beanieCuff = new THREE.Mesh(
      new THREE.TorusGeometry(0.51, 0.07, 10, 20),
      new THREE.MeshStandardMaterial({ color: '#7E22CE', roughness: 0.6 })
    );
    beanieCuff.rotation.x = Math.PI / 2 - 0.1;
    beanieCuff.position.set(0, 0.22, 0.04);

    // Golden Star Patch on Beanie Front
    const starPatch = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.085, 0),
      new THREE.MeshStandardMaterial({ color: '#FACC15', metalness: 0.4, roughness: 0.2 })
    );
    starPatch.position.set(0, 0.28, 0.52);

    headGroup.add(beanieDome, beanieCuff, starPatch);
  } else if (characterId === 'creative_dreamer' || characterId === 'little_artist') {
    // Luna: Artist Beret & Golden Star Tip
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.52, 16, 16), hairMat);
    hairCap.position.set(0, 0.04, -0.02);
    headGroup.add(hairCap);

    const beret = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.42, 0.16, 16), new THREE.MeshStandardMaterial({ color: '#6D28D9', roughness: 0.4 }));
    beret.rotation.z = 0.25;
    beret.position.set(0.08, 0.42, -0.02);
    const beretTip = new THREE.Mesh(new THREE.OctahedronGeometry(0.08), new THREE.MeshStandardMaterial({ color: '#FACC15' }));
    beretTip.position.set(0.14, 0.56, -0.02);
    headGroup.add(beret, beretTip);
  } else if (characterId === 'little_inventor' || characterId === 'tiny_inventor') {
    // Milo: Tinker Goggles & Brass Lenses
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.52, 16, 16), hairMat);
    hairCap.position.set(0, 0.04, -0.02);
    headGroup.add(hairCap);

    // Goggles Strap
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.51, 0.035, 8, 16), new THREE.MeshStandardMaterial({ color: '#78350F' }));
    strap.rotation.x = Math.PI / 2 - 0.2;
    strap.position.set(0, 0.26, 0.06);

    // Brass Goggle Lenses
    const goggleL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12), goldMat);
    goggleL.rotation.x = Math.PI / 2;
    goggleL.position.set(-0.16, 0.32, 0.42);
    const goggleR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12), goldMat);
    goggleR.rotation.x = Math.PI / 2;
    goggleR.position.set(0.16, 0.32, 0.42);

    headGroup.add(strap, goggleL, goggleR);
  } else if (characterId === 'nature_explorer') {
    // Willow: Leaf & Wildflower Crown
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.52, 16, 16), hairMat);
    hairCap.position.set(0, 0.04, -0.02);
    headGroup.add(hairCap);

    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.04, 8, 16), new THREE.MeshStandardMaterial({ color: '#15803D' }));
    crown.rotation.x = Math.PI / 2 - 0.15;
    crown.position.set(0, 0.32, 0.08);

    const flw = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({ color: '#F472B6' }));
    flw.position.set(0, 0.42, 0.40);
    headGroup.add(crown, flw);
  } else if (characterId === 'star_sprite' || characterId === 'magical_companion') {
    // Nova: Glowing Star Crown
    const starCrown = new THREE.Mesh(new THREE.OctahedronGeometry(0.20), new THREE.MeshStandardMaterial({ color: '#FDE047', roughness: 0.1, metalness: 0.5 }));
    starCrown.position.set(0, 0.56, 0.12);
    starCrown.rotation.z = Math.PI / 4;
    headGroup.add(starCrown);
  } else if (characterId === 'curious_explorer') {
    // Pip: Sun Hat & Sky-Blue Ribbon
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.52, 16, 16), hairMat);
    hairCap.position.set(0, 0.04, -0.02);
    headGroup.add(hairCap);

    const sunHat = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.68, 0.22, 16), new THREE.MeshStandardMaterial({ color: '#FBBF24', roughness: 0.5 }));
    sunHat.position.set(0, 0.42, 0);
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.82, 0.05, 18), new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.6 }));
    hatBrim.position.set(0, 0.32, 0);
    const hatRibbon = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.03, 8, 16), new THREE.MeshStandardMaterial({ color: '#0284C7' }));
    hatRibbon.rotation.x = Math.PI / 2;
    hatRibbon.position.set(0, 0.36, 0);
    headGroup.add(sunHat, hatBrim, hatRibbon);
  } else {
    // Koa / Adventurer: Sporty Explorer Cap
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.52, 16, 16), hairMat);
    hairCap.position.set(0, 0.02, -0.04);
    headGroup.add(hairCap);

    const capDome = new THREE.Mesh(new THREE.SphereGeometry(0.53, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), shirtMat);
    capDome.position.set(0, 0.08, -0.02);
    const capBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.04, 12, 1, false, 0, Math.PI), shirtAccentMat);
    capBrim.rotation.x = 0.25;
    capBrim.position.set(0, 0.22, 0.44);
    headGroup.add(capDome, capBrim);
  }

  rootGroup.add(headGroup);

  // 3. Articulated Left & Right Arms
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.46, 0.94, 0);

  const lSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.11, 0.24, 10), shirtMat);
  lSleeve.position.y = -0.12;
  lSleeve.castShadow = true;
  const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 10), skinMat);
  lForearm.position.y = -0.32;
  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), skinMat);
  lHand.position.y = -0.44;
  leftArmGroup.add(lSleeve, lForearm, lHand);
  rootGroup.add(leftArmGroup);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.46, 0.94, 0);

  const rSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.11, 0.24, 10), shirtMat);
  rSleeve.position.y = -0.12;
  rSleeve.castShadow = true;
  const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 10), skinMat);
  rForearm.position.y = -0.32;
  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), skinMat);
  rHand.position.y = -0.44;
  rightArmGroup.add(rSleeve, rForearm, rHand);
  rootGroup.add(rightArmGroup);

  // 4. Articulated Left & Right Legs with Chunky Sneakers
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.18, 0.52, 0);

  const lPants = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.24, 10), pantsMat);
  lPants.position.y = -0.12;
  lPants.castShadow = true;
  const lSock = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.18, 10), sockMat);
  lSock.position.y = -0.30;
  const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.14, 0.34), sneakerMat);
  lShoe.position.set(0, -0.42, 0.06);
  lShoe.castShadow = true;
  const lToe = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 8), toeCapMat);
  lToe.scale.set(1.0, 0.7, 1.1);
  lToe.position.set(0, -0.42, 0.19);
  const lSole = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.38), soleMat);
  lSole.position.set(0, -0.50, 0.06);
  leftLegGroup.add(lPants, lSock, lShoe, lToe, lSole);
  rootGroup.add(leftLegGroup);

  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.18, 0.52, 0);

  const rPants = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.24, 10), pantsMat);
  rPants.position.y = -0.12;
  rPants.castShadow = true;
  const rSock = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.18, 10), sockMat);
  rSock.position.y = -0.30;
  const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.14, 0.34), sneakerMat);
  rShoe.position.set(0, -0.42, 0.06);
  rShoe.castShadow = true;
  const rToe = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 8), toeCapMat);
  rToe.scale.set(1.0, 0.7, 1.1);
  rToe.position.set(0, -0.42, 0.19);
  const rSole = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.38), soleMat);
  rSole.position.set(0, -0.50, 0.06);
  rightLegGroup.add(rPants, rSock, rShoe, rToe, rSole);
  rootGroup.add(rightLegGroup);

  const controller: ChildCharacterController = {
    group: rootGroup,
    head: headGroup,
    body: bodyGroup,
    leftArm: leftArmGroup,
    rightArm: rightArmGroup,
    leftLeg: leftLegGroup,
    rightLeg: rightLegGroup,
    characterId,
    wings: wingsGroup,
    ears: earsList
  };

  rootGroup.userData = { controller, isChildCharacter: true };

  return {
    group: rootGroup,
    controller
  };
}

export function buildCartoonChildCharacter(gender: 'girl' | 'boy' = 'girl') {
  return buildExplorerCharacter(gender === 'boy' ? 'adventurous_kid' : 'curious_explorer');
}

export function buildWonderMeadowWorld(): WorldBuildResult {
  const scene = new THREE.Scene();
  const interactiveMap = new Map<THREE.Object3D, InteractiveItemTarget>();
  const zoneAnchors = new Map<WorldZoneId, THREE.Vector3>();

  const clouds: THREE.Group[] = [];
  const ducks: { mesh: THREE.Group; angle: number; speed: number; radius: number; centerX: number; centerZ: number }[] = [];
  const butterflies: { mesh: THREE.Group; angle: number; speed: number; radius: number; height: number; centerX: number; centerZ: number }[] = [];
  let windmillBlades: THREE.Group | null = null;
  let observatoryDome: THREE.Mesh | null = null;
  const floatingItems: THREE.Object3D[] = [];
  const chimingKeys: { mesh: THREE.Mesh; noteIndex: number }[] = [];
  const hiddenStars: { mesh: THREE.Group; id: string; collected: boolean }[] = [];

  // 1. Scene Atmosphere & Fog
  scene.background = new THREE.Color('#E0F2FE'); // Soft sky blue
  scene.fog = new THREE.FogExp2('#E0F2FE', 0.0035);

  // 2. Lighting (Warm Sun + Soft Ambient + Hemisphere)
  const ambientLight = new THREE.AmbientLight('#FFFDF5', 1.05);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight('#E0F2FE', '#FAF5EE', 0.95);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight('#FFFBEB', 1.4);
  sunLight.position.set(65, 95, 45);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 320;
  sunLight.shadow.camera.left = -140;
  sunLight.shadow.camera.right = 140;
  sunLight.shadow.camera.top = 140;
  sunLight.shadow.camera.bottom = -140;
  sunLight.shadow.bias = -0.0008;
  scene.add(sunLight);

  // 3. Expansive Rolling Terrain (360x360) with Natural Perimeter Mountains
  const worldSize = 360;
  const groundGeo = new THREE.PlaneGeometry(worldSize, worldSize, 100, 100);
  groundGeo.rotateX(-Math.PI / 2);
  const posAttr = groundGeo.attributes.position;

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const distFromCenter = Math.sqrt(x * x + z * z);

    // Natural rolling hills
    let y = Math.sin(x * 0.035) * Math.cos(z * 0.035) * 2.2 +
            Math.sin(x * 0.08 + 1.2) * Math.cos(z * 0.08) * 0.9;

    // Stream valley indentation running from northwest to southeast
    const streamDist = Math.abs(x * 0.7 - z * 0.7 + 15);
    if (streamDist < 18 && distFromCenter > 15 && distFromCenter < 120) {
      y -= Math.max(0, (18 - streamDist) * 0.18);
    }

    // Star Hilltop elevation in North-East (around [75, -75])
    const distToStarHill = Math.hypot(x - 75, z - (-75));
    if (distToStarHill < 45) {
      y += (45 - distToStarHill) * 0.28;
    }

    // Natural perimeter boundary mountains (> 130 distance)
    if (distFromCenter > 125) {
      const ridgeHeight = Math.pow((distFromCenter - 125) * 0.22, 1.4);
      const mountainSpikes = Math.sin(x * 0.15) * Math.cos(z * 0.15) * 4.5;
      y += ridgeHeight + mountainSpikes;
    }

    posAttr.setY(i, y);
  }
  groundGeo.computeVertexNormals();

  const groundMat = new THREE.MeshStandardMaterial({
    color: '#82CE95', // Warm lush meadow green
    roughness: 0.88,
    metalness: 0.02,
    flatShading: true
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // 4. Perimeter Mountain Backdrop Silhouettes (for grand visual depth)
  const mountainMat = new THREE.MeshStandardMaterial({
    color: '#65A30D',
    roughness: 0.95,
    flatShading: true
  });
  const distantMountainMat = new THREE.MeshStandardMaterial({
    color: '#93C5FD',
    roughness: 0.95,
    flatShading: true
  });

  for (let m = 0; m < 28; m++) {
    const angle = (m / 28) * Math.PI * 2;
    const r = 155 + (m % 3) * 15;
    const mx = Math.cos(angle) * r;
    const mz = Math.sin(angle) * r;
    const mHeight = 22 + (m % 5) * 8;
    const mRadius = 18 + (m % 4) * 6;

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(mRadius, mHeight, 7),
      m % 2 === 0 ? mountainMat : distantMountainMat
    );
    cone.position.set(mx, mHeight / 2 - 2, mz);
    cone.castShadow = true;
    scene.add(cone);
  }

  // 5. Central Meadow Lake & Streams
  const centralLakeGeo = new THREE.CylinderGeometry(14, 13, 0.4, 36);
  const waterMat = new THREE.MeshStandardMaterial({
    color: '#38BDF8',
    roughness: 0.1,
    metalness: 0.35,
    transparent: true,
    opacity: 0.92
  });
  const lakeMesh = new THREE.Mesh(centralLakeGeo, waterMat);
  lakeMesh.position.set(0, 0.18, 6);
  scene.add(lakeMesh);

  // Water lilies & lotus blossoms in Central Lake
  const lilyMat = new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.6 });
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2 + 0.2;
    const r = 5.5 + (i % 3) * 2.8;
    const padGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.08, 12);
    const pad = new THREE.Mesh(padGeo, lilyMat);
    pad.position.set(Math.cos(angle) * r, 0.4, 6 + Math.sin(angle) * r);
    scene.add(pad);

    if (i % 2 === 0) {
      const flowerGeo = new THREE.ConeGeometry(0.5, 0.6, 6);
      const flowerMat = new THREE.MeshStandardMaterial({ color: i === 0 ? '#F472B6' : i === 2 ? '#FDE047' : '#FB7185' });
      const flower = new THREE.Mesh(flowerGeo, flowerMat);
      flower.position.set(pad.position.x, 0.72, pad.position.z);
      scene.add(flower);
    }
  }

  // Swimming Ducks & Ducklings in Lake
  for (let d = 0; d < 3; d++) {
    const duckGroup = new THREE.Group();
    const isMama = d === 0;
    const scale = isMama ? 1.0 : 0.55;
    const duckColor = isMama ? '#FACC15' : '#FEF08A';

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.5 * scale, 12, 12), new THREE.MeshStandardMaterial({ color: duckColor }));
    body.scale.set(1.2, 0.8, 0.8);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35 * scale, 10, 10), new THREE.MeshStandardMaterial({ color: duckColor }));
    head.position.set(0.45 * scale, 0.35 * scale, 0);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.15 * scale, 0.3 * scale, 6), new THREE.MeshStandardMaterial({ color: '#EA580C' }));
    beak.rotation.z = -Math.PI / 2;
    beak.position.set(0.8 * scale, 0.35 * scale, 0);

    duckGroup.add(body, head, beak);
    duckGroup.position.set(0, 0.4, 6);
    scene.add(duckGroup);

    ducks.push({
      mesh: duckGroup,
      angle: d * 0.75,
      speed: 0.006 + d * 0.002,
      radius: isMama ? 7.2 : 5.8 + d * 0.8,
      centerX: 0,
      centerZ: 6
    });
  }

  // 6. Wooden Bridges over Streams
  const bridgeMat = new THREE.MeshStandardMaterial({ color: '#92400E', roughness: 0.85 });
  const bridgePlankMat = new THREE.MeshStandardMaterial({ color: '#B45309', roughness: 0.8 });

  const createBridge = (bx: number, bz: number, rotY: number, length = 7.5) => {
    const bridgeGroup = new THREE.Group();
    const arch = new THREE.Mesh(new THREE.BoxGeometry(length, 0.28, 2.8), bridgePlankMat);
    arch.position.y = 0.52;
    const rail1 = new THREE.Mesh(new THREE.BoxGeometry(length, 0.22, 0.16), bridgeMat);
    rail1.position.set(0, 1.1, 1.3);
    const rail2 = new THREE.Mesh(new THREE.BoxGeometry(length, 0.22, 0.16), bridgeMat);
    rail2.position.set(0, 1.1, -1.3);

    bridgeGroup.add(arch, rail1, rail2);
    bridgeGroup.position.set(bx, 0, bz);
    bridgeGroup.rotation.y = rotY;
    scene.add(bridgeGroup);
  };

  createBridge(0, 24, 0); // South Bridge towards Number Valley
  createBridge(-26, 0, Math.PI / 2); // West Bridge towards Alphabet Grove
  createBridge(28, 0, Math.PI / 2); // East Bridge towards Music Garden
  createBridge(0, -26, 0); // North Bridge towards Story Meadow
  createBridge(-24, -24, Math.PI / 4); // North-West Bridge towards Animal Woods
  createBridge(24, 24, -Math.PI / 4); // South-East Bridge towards Fruit Orchard

  // Obstacle 1: Wooden Alphabet Gate towards West Path
  const alphaGateGroup = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.8 });
  const gateMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.7 });
  const pL = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 3.2, 8), postMat);
  pL.position.set(-1.8, 1.6, 0);
  const pR = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 3.2, 8), postMat);
  pR.position.set(1.8, 1.6, 0);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.35, 0.3), gateMat);
  beam.position.set(0, 3.1, 0);
  const signMat = new THREE.MeshStandardMaterial({ color: '#0284C7' });
  const gateSign = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 0.15), signMat);
  gateSign.position.set(0, 3.1, 0.2);
  alphaGateGroup.add(pL, pR, beam, gateSign);
  alphaGateGroup.position.set(-38, 0, 0);
  alphaGateGroup.rotation.y = Math.PI / 2;
  scene.add(alphaGateGroup);

  interactiveMap.set(gateSign, {
    type: 'obstacle',
    id: 'gate-alphabet',
    position: new THREE.Vector3(-38, 1.8, 0),
    label: 'Alphabet Gate (Challenge)'
  });

  // Obstacle 2: Stepping Stones Brook Challenge towards South Path
  const stoneBrookGroup = new THREE.Group();
  for (let st = -1; st <= 1; st++) {
    const stMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1.0, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: '#38BDF8', roughness: 0.5 })
    );
    stMesh.position.set(st * 2.2, 0.25, 0);
    stoneBrookGroup.add(stMesh);
  }
  stoneBrookGroup.position.set(0, 0, 38);
  scene.add(stoneBrookGroup);

  interactiveMap.set(stoneBrookGroup.children[1], {
    type: 'obstacle',
    id: 'brook-stepping-stones',
    position: new THREE.Vector3(0, 1.0, 38),
    label: 'Stepping Stones Brook (Challenge)'
  });

  // Obstacle 3: Flower Bridge Challenge towards South-East
  const flowerBridgeGroup = new THREE.Group();
  const flowerSign = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 1.2, 0.2),
    new THREE.MeshStandardMaterial({ color: '#EC4899', roughness: 0.6 })
  );
  flowerSign.position.set(0, 1.5, 0);
  flowerBridgeGroup.add(flowerSign);
  flowerBridgeGroup.position.set(34, 0, 34);
  scene.add(flowerBridgeGroup);

  interactiveMap.set(flowerSign, {
    type: 'obstacle',
    id: 'bridge-flower',
    position: new THREE.Vector3(34, 1.5, 34),
    label: 'Flower Brook Bridge (Challenge)'
  });

  // 7. HIGH-FIDELITY PAVED ROADS & COBBLESTONE TRAILS WITH CURBS & SIGNPOSTS
  const roadSurfaceMat = new THREE.MeshStandardMaterial({
    color: '#E8DFD1', // Warm sand-stone paved surface
    roughness: 0.85,
    flatShading: true
  });
  const roadCurbMat = new THREE.MeshStandardMaterial({
    color: '#B0A795', // Chiseled stone curb border
    roughness: 0.9,
    flatShading: true
  });
  const roadPaverMat = new THREE.MeshStandardMaterial({
    color: '#F4ECE1', // Highlighted stepping flagstones
    roughness: 0.75
  });
  const chevronMat = new THREE.MeshBasicMaterial({
    color: '#FBBF24',
    transparent: true,
    opacity: 0.65
  });

  // Function to create continuous paved cobblestone road with stone curbs and flagstones
  const createPavedRoad = (startX: number, startZ: number, endX: number, endZ: number, width = 3.2) => {
    const dist = Math.hypot(endX - startX, endZ - startZ);
    if (dist < 0.5) return;

    const steps = Math.max(3, Math.floor(dist / 2.2));
    const angle = Math.atan2(endX - startX, endZ - startZ);
    const perpX = Math.cos(angle);
    const perpZ = -Math.sin(angle);

    // Continuous road bed segment
    const roadBedGeo = new THREE.PlaneGeometry(width, dist);
    roadBedGeo.rotateX(-Math.PI / 2);
    const roadBed = new THREE.Mesh(roadBedGeo, roadSurfaceMat);
    roadBed.position.set((startX + endX) / 2, 0.08, (startZ + endZ) / 2);
    roadBed.rotation.y = angle;
    roadBed.receiveShadow = true;
    scene.add(roadBed);

    // Stepping pavers and raised curb borders on both sides
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const px = startX + (endX - startX) * t;
      const pz = startZ + (endZ - startZ) * t;

      // Left stone curb
      const curbL = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.16, 2.0),
        roadCurbMat
      );
      curbL.position.set(px - perpX * (width * 0.52), 0.12, pz - perpZ * (width * 0.52));
      curbL.rotation.y = angle;
      curbL.castShadow = true;
      curbL.receiveShadow = true;
      scene.add(curbL);

      // Right stone curb
      const curbR = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.16, 2.0),
        roadCurbMat
      );
      curbR.position.set(px + perpX * (width * 0.52), 0.12, pz + perpZ * (width * 0.52));
      curbR.rotation.y = angle;
      curbR.castShadow = true;
      curbR.receiveShadow = true;
      scene.add(curbR);

      // Inlaid cobblestone flagstones
      const paver = new THREE.Mesh(
        new THREE.CylinderGeometry(width * 0.36, width * 0.40, 0.08, 7),
        s % 2 === 0 ? roadPaverMat : roadSurfaceMat
      );
      paver.position.set(px, 0.1, pz);
      paver.rotation.y = s * 0.7;
      paver.receiveShadow = true;
      scene.add(paver);

      // Embedded directional chevron every 3 steps
      if (s % 3 === 1) {
        const chev = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.4, 3), chevronMat);
        chev.rotateX(-Math.PI / 2);
        chev.rotation.z = -angle;
        chev.position.set(px, 0.11, pz);
        scene.add(chev);
      }
    }
  };

  // 1. Central Plaza Ring Road around Wonder Lake
  const plazaRadius = 17;
  const plazaSegments = 24;
  for (let i = 0; i < plazaSegments; i++) {
    const a1 = (i / plazaSegments) * Math.PI * 2;
    const a2 = ((i + 1) / plazaSegments) * Math.PI * 2;
    const x1 = Math.cos(a1) * plazaRadius;
    const z1 = 6 + Math.sin(a1) * plazaRadius;
    const x2 = Math.cos(a2) * plazaRadius;
    const z2 = 6 + Math.sin(a2) * plazaRadius;
    createPavedRoad(x1, z1, x2, z2, 3.4);
  }

  // 2. Main Radial Avenues from Central Plaza to World Learning Zones
  WORLD_ZONES.forEach((zone) => {
    const [zx, , zz] = zone.coordinates;
    createPavedRoad(0, 6, zx, zz, 3.4);
    zoneAnchors.set(zone.id, new THREE.Vector3(zx, 0, zz));
  });

  // 3. Outer Loop Scenic Highway connecting adjacent zones
  createPavedRoad(-90, 0, -65, 80, 2.8); // Alphabet to Creative
  createPavedRoad(-65, 80, 0, 95, 2.8); // Creative to Numbers
  createPavedRoad(0, 95, 80, 75, 2.8); // Numbers to Fruits
  createPavedRoad(80, 75, 90, 0, 2.8); // Fruits to Music
  createPavedRoad(90, 0, 75, -75, 2.8); // Music to Stars
  createPavedRoad(75, -75, 0, -90, 2.8); // Stars to Stories
  createPavedRoad(0, -90, -75, -70, 2.8); // Stories to Animals
  createPavedRoad(-75, -70, -90, 0, 2.8); // Animals to Alphabet

  // 4. 3D Wooden Directional Road Signposts at Junctions
  const woodPostMat = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.85 });
  const signWoodMat = new THREE.MeshStandardMaterial({ color: '#D97706', roughness: 0.7 });

  const createDirectionSignpost = (
    sx: number,
    sz: number,
    signs: { text: string; angle: number; color: string }[]
  ) => {
    const postGroup = new THREE.Group();
    // Central pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 3.2, 8), woodPostMat);
    pole.position.y = 1.6;
    pole.castShadow = true;
    postGroup.add(pole);

    // Finial top cap
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), woodPostMat);
    cap.position.y = 3.3;
    postGroup.add(cap);

    // Directional signboards
    signs.forEach((s, idx) => {
      const plankGroup = new THREE.Group();
      plankGroup.position.y = 2.2 + idx * 0.4;
      plankGroup.rotation.y = s.angle;

      const board = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.32, 0.1),
        new THREE.MeshStandardMaterial({ color: s.color, roughness: 0.6 })
      );
      board.position.set(0.8, 0, 0);
      board.castShadow = true;

      // Pointer tip
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.4, 3),
        new THREE.MeshStandardMaterial({ color: s.color, roughness: 0.6 })
      );
      tip.rotation.z = -Math.PI / 2;
      tip.position.set(1.7, 0, 0);

      plankGroup.add(board, tip);
      postGroup.add(plankGroup);
    });

    postGroup.position.set(sx, 0, sz);
    scene.add(postGroup);
  };

  // Place Signposts at Key Crossroads
  createDirectionSignpost(4, 18, [
    { text: 'Number Valley', angle: Math.PI / 2, color: '#3B82F6' },
    { text: 'Fruit Orchard', angle: Math.PI / 4, color: '#F59E0B' },
    { text: 'Plaza Center', angle: -Math.PI / 2, color: '#10B981' }
  ]);

  createDirectionSignpost(-18, 4, [
    { text: 'Alphabet Grove', angle: Math.PI, color: '#0284C7' },
    { text: 'Animal Woods', angle: (3 * Math.PI) / 4, color: '#FB7185' },
    { text: 'Creative Corner', angle: -Math.PI / 4, color: '#8B5CF6' }
  ]);

  createDirectionSignpost(18, -4, [
    { text: 'Music Garden', angle: 0, color: '#0284C7' },
    { text: 'Star Observatory', angle: -Math.PI / 4, color: '#8B5CF6' }
  ]);

  createDirectionSignpost(-4, -18, [
    { text: 'Story Meadow', angle: -Math.PI / 2, color: '#EA580C' },
    { text: 'Animal Woods', angle: -Math.PI * 0.75, color: '#FB7185' }
  ]);

  // 5. Road Guide Lanterns (Cozy warm lanterns along main roads)
  const lanternPostMat = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.8 });
  const lanternGlowMat = new THREE.MeshStandardMaterial({
    color: '#FEF08A',
    emissive: '#F59E0B',
    emissiveIntensity: 0.8,
    roughness: 0.2
  });

  const createPathLantern = (lx: number, lz: number) => {
    const lanternGroup = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.6, 8), lanternPostMat);
    post.position.y = 1.3;
    post.castShadow = true;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.1), lanternPostMat);
    arm.position.set(0.25, 2.4, 0);
    const lanternHead = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), lanternGlowMat);
    lanternHead.position.set(0.45, 2.1, 0);
    lanternGroup.add(post, arm, lanternHead);
    lanternGroup.position.set(lx, 0, lz);
    scene.add(lanternGroup);
  };

  // Place lanterns along pathways
  const lanternCoords = [
    [-18, 2], [-42, 2], [-68, 2], // Alphabet Path
    [2, 20], [2, 48], [2, 72], // Numbers Path
    [18, -2], [42, -2], [68, -2], // Music Path
    [-2, -20], [-2, -48], [-2, -72], // Stories Path
    [-18, -18], [-44, -44], // Animal Path
    [18, 18], [44, 44], // Fruit Path
    [-18, 22], [-42, 52], // Creative Path
    [18, -18], [44, -44] // Stars Path
  ];
  lanternCoords.forEach(([lx, lz]) => createPathLantern(lx, lz));

  // 8. Forest Groves & Varied Trees (Oak, Pine, Apple, Willow)
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.88 });
  const birchTrunkMat = new THREE.MeshStandardMaterial({ color: '#FDFBF7', roughness: 0.7 });
  const leafMats = [
    new THREE.MeshStandardMaterial({ color: '#4ADE80', roughness: 0.75, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: '#22C55E', roughness: 0.75, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: '#86EFAC', roughness: 0.75, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: '#FCD34D', roughness: 0.75, flatShading: true }), // Autumn Gold
    new THREE.MeshStandardMaterial({ color: '#15803D', roughness: 0.8, flatShading: true }) // Deep Pine
  ];

  const createTree = (x: number, z: number, scale = 1, type: 'oak' | 'pine' | 'willow' = 'oak', matIdx = 0) => {
    const treeGroup = new THREE.Group();

    if (type === 'pine') {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * scale, 0.45 * scale, 3.2 * scale, 6), trunkMat);
      trunk.position.y = 1.6 * scale;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      for (let l = 0; l < 3; l++) {
        const foliage = new THREE.Mesh(
          new THREE.ConeGeometry((2.4 - l * 0.5) * scale, (2.6 - l * 0.3) * scale, 7),
          leafMats[4]
        );
        foliage.position.y = (3.2 + l * 1.6) * scale;
        foliage.castShadow = true;
        treeGroup.add(foliage);
      }
    } else if (type === 'willow') {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4 * scale, 0.6 * scale, 3.0 * scale, 6), birchTrunkMat);
      trunk.position.y = 1.5 * scale;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const foliage = new THREE.Mesh(
        new THREE.SphereGeometry(2.8 * scale, 8, 8),
        leafMats[2]
      );
      foliage.scale.set(1.1, 1.4, 1.1);
      foliage.position.y = 4.2 * scale;
      foliage.castShadow = true;
      treeGroup.add(foliage);
    } else {
      // Oak Tree
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, 2.6 * scale, 6), trunkMat);
      trunk.position.y = 1.3 * scale;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const f1 = new THREE.Mesh(new THREE.ConeGeometry(2.4 * scale, 3.2 * scale, 7), leafMats[matIdx % leafMats.length]);
      f1.position.y = 3.4 * scale;
      f1.castShadow = true;

      const f2 = new THREE.Mesh(new THREE.ConeGeometry(1.8 * scale, 2.4 * scale, 7), leafMats[(matIdx + 1) % leafMats.length]);
      f2.position.y = 4.8 * scale;
      f2.castShadow = true;

      treeGroup.add(f1, f2);
    }

    treeGroup.position.set(x, 0, z);
    scene.add(treeGroup);
  };

  // Populate World Tree Clusters
  const treeSpecs: [number, number, number, 'oak' | 'pine' | 'willow', number][] = [
    // Surrounding Central Meadow
    [-32, -18, 1.3, 'oak', 0], [-22, -32, 1.2, 'oak', 1], [25, -28, 1.4, 'willow', 2], [32, 18, 1.2, 'oak', 3],
    [-28, 25, 1.1, 'oak', 0], [18, 32, 1.3, 'willow', 2],
    // Surrounding Alphabet Grove
    [-115, -25, 1.4, 'oak', 0], [-118, 15, 1.5, 'oak', 1], [-95, -35, 1.3, 'oak', 2], [-92, 36, 1.2, 'oak', 3],
    [-65, -32, 1.2, 'oak', 0], [-68, 28, 1.3, 'oak', 1],
    // Animal Woods (Dense Pine Grove)
    [-88, -88, 1.6, 'pine', 4], [-68, -92, 1.5, 'pine', 4], [-94, -62, 1.7, 'pine', 4], [-58, -78, 1.4, 'pine', 4],
    [-82, -54, 1.5, 'pine', 4], [-60, -56, 1.3, 'pine', 4], [-102, -75, 1.6, 'pine', 4],
    // Story Meadow Treetops
    [-22, -105, 1.5, 'willow', 2], [24, -102, 1.6, 'willow', 2], [0, -118, 1.8, 'oak', 3],
    // Fruit Orchard Forest Edges
    [98, 62, 1.3, 'oak', 0], [105, 88, 1.4, 'oak', 1], [65, 98, 1.3, 'oak', 2],
    // Star Observatory Hill Trees
    [62, -92, 1.2, 'pine', 4], [92, -62, 1.3, 'pine', 4], [98, -88, 1.4, 'pine', 4]
  ];
  treeSpecs.forEach(([x, z, s, t, m]) => createTree(x, z, s, t, m));

  // 9. Wildflowers & Mushrooms
  const flowerColors = ['#F43F5E', '#FBBF24', '#A855F7', '#38BDF8', '#FB7185', '#34D399', '#F97316'];
  for (let i = 0; i < 220; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 8 + Math.random() * 115;
    const fx = Math.cos(angle) * dist;
    const fz = Math.sin(angle) * dist;
    const fMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 6, 6),
      new THREE.MeshBasicMaterial({ color: flowerColors[i % flowerColors.length] })
    );
    fMesh.position.set(fx, 0.28, fz);
    scene.add(fMesh);
  }

  // 10. CENTRAL MEADOW HUB & GREETING GUIDE (0, 0, 0)
  const centralPlaza = new THREE.Mesh(
    new THREE.CylinderGeometry(9.0, 9.6, 0.4, 32),
    new THREE.MeshStandardMaterial({ color: '#FFFDF7', roughness: 0.6 })
  );
  centralPlaza.position.set(0, 0.2, 0);
  centralPlaza.receiveShadow = true;
  scene.add(centralPlaza);

  // Wooden 4-Way Signpost at Central Plaza
  const signpostGroup = new THREE.Group();
  const postMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 3.6, 8), trunkMat);
  postMesh.position.y = 1.8;
  signpostGroup.add(postMesh);

  const createSignArm = (text: string, y: number, rotY: number, color: string) => {
    const armGroup = new THREE.Group();
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.08), new THREE.MeshStandardMaterial({ color: '#D97706' }));
    board.position.set(1.2, 0, 0);
    const pointer = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 3), new THREE.MeshStandardMaterial({ color: '#D97706' }));
    pointer.rotation.z = -Math.PI / 2;
    pointer.position.set(2.5, 0, 0);

    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshBasicMaterial({ color }));
    gem.position.set(0.3, 0, 0.06);

    armGroup.add(board, pointer, gem);
    armGroup.position.y = y;
    armGroup.rotation.y = rotY;
    signpostGroup.add(armGroup);
  };

  createSignArm('← Alphabet Grove', 3.2, Math.PI, '#0284C7');
  createSignArm('↑ Story Meadow', 2.7, -Math.PI / 2, '#EA580C');
  createSignArm('→ Music Garden', 2.2, 0, '#0284C7');
  createSignArm('↓ Number Valley', 1.7, Math.PI / 2, '#3B82F6');
  createSignArm('↖ Animal Woods', 1.2, (3 * Math.PI) / 4, '#FB7185');

  signpostGroup.position.set(0, 0, -4);
  scene.add(signpostGroup);

  // Friendly Barnaby Bunny Meadow Guide at Central Plaza
  const guideBunny = new THREE.Group();
  const bBody = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), new THREE.MeshStandardMaterial({ color: '#FDFBF7' }));
  bBody.position.y = 0.7;
  const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), new THREE.MeshStandardMaterial({ color: '#FDFBF7' }));
  bHead.position.y = 1.6;
  const bEarL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.8, 8), new THREE.MeshStandardMaterial({ color: '#F472B6' }));
  bEarL.position.set(-0.2, 2.2, 0);
  bEarL.rotation.z = -0.15;
  const bEarR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.8, 8), new THREE.MeshStandardMaterial({ color: '#F472B6' }));
  bEarR.position.set(0.2, 2.2, 0);
  bEarR.rotation.z = 0.15;

  guideBunny.add(bBody, bHead, bEarL, bEarR);
  guideBunny.position.set(3.5, 0.2, -2.5);
  scene.add(guideBunny);

  interactiveMap.set(bBody, {
    type: 'guide',
    id: 'barnaby-guide',
    position: new THREE.Vector3(3.5, 1.2, -2.5),
    label: 'Barnaby Bunny'
  });
  interactiveMap.set(bHead, {
    type: 'guide',
    id: 'barnaby-guide',
    position: new THREE.Vector3(3.5, 1.2, -2.5),
    label: 'Barnaby Bunny'
  });

  // =========================================================================
  // 10B. GRAND WONDER ADVENTURE STARTING GATE & SPAWN STAR POD (x: 0, z: 10)
  // (The dedicated fun Starting Point where the explorer stands and begins play)
  // =========================================================================
  const startGateGroup = new THREE.Group();
  startGateGroup.position.set(0, 0, 10);

  // 1. Golden Star Starting Podium on Ground
  const podMat = new THREE.MeshStandardMaterial({ color: '#FFFDF7', roughness: 0.5, metalness: 0.05 });
  const podRingMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.3, metalness: 0.2 });
  const starGlowMat = new THREE.MeshStandardMaterial({
    color: '#FACC15',
    emissive: '#EAB308',
    emissiveIntensity: 0.7,
    roughness: 0.2
  });

  const podMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.16, 32), podMat);
  podMesh.position.y = 0.08;
  podMesh.receiveShadow = true;

  const podRing = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.12, 12, 36), podRingMat);
  podRing.rotation.x = Math.PI / 2;
  podRing.position.y = 0.12;

  // 5-Pointed Star Inlay in the center of the podium
  const starShape = new THREE.Shape();
  const starPoints = 5;
  const outerR = 1.35;
  const innerR = 0.62;
  for (let i = 0; i < starPoints * 2; i++) {
    const angle = (i * Math.PI) / starPoints - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) starShape.moveTo(px, py);
    else starShape.lineTo(px, py);
  }
  starShape.closePath();

  const starGeo = new THREE.ShapeGeometry(starShape);
  const starMesh = new THREE.Mesh(starGeo, starGlowMat);
  starMesh.rotation.x = -Math.PI / 2;
  starMesh.position.y = 0.17;
  starMesh.receiveShadow = true;

  // Inscribed toddler shoe footprints inside the star (where player stands)
  const footprintMat = new THREE.MeshBasicMaterial({ color: '#D97706', transparent: true, opacity: 0.85 });
  for (const side of [-0.22, 0.22]) {
    const shoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.32), footprintMat);
    shoeSole.position.set(side, 0.18, 0.05);
    startGateGroup.add(shoeSole);
  }

  startGateGroup.add(podMesh, podRing, starMesh);

  // 2. Festive Candy-Striped Gate Pillars (Left & Right framing the road)
  const pillarWoodMat = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.8 });
  const pillarYellowMat = new THREE.MeshStandardMaterial({ color: '#FBBF24', roughness: 0.4 });
  const pillarRedMat = new THREE.MeshStandardMaterial({ color: '#EF4444', roughness: 0.4 });
  const pillarBlueMat = new THREE.MeshStandardMaterial({ color: '#0284C7', roughness: 0.4 });
  const goldFinialMat = new THREE.MeshStandardMaterial({ color: '#FACC15', metalness: 0.4, roughness: 0.2 });

  const buildGatePillar = (px: number) => {
    const pGroup = new THREE.Group();
    pGroup.position.set(px, 0, 0);

    // Stone base plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.9), new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.6 }));
    plinth.position.y = 0.35;
    plinth.castShadow = true;
    pGroup.add(plinth);

    // Striped pillar column (colorful ring segments)
    const stripeColors = [pillarRedMat, pillarYellowMat, pillarBlueMat, pillarYellowMat];
    for (let s = 0; s < 8; s++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.5, 16), stripeColors[s % stripeColors.length]);
      seg.position.y = 0.95 + s * 0.48;
      seg.castShadow = true;
      pGroup.add(seg);
    }

    // Capital & Golden Sphere Finial on Top
    const capital = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.8), goldFinialMat);
    capital.position.y = 4.85;
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), goldFinialMat);
    finial.position.y = 5.3;
    finial.castShadow = true;
    pGroup.add(capital, finial);

    // Warm Glow Fairy Lantern on bracket
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(px > 0 ? -0.8 : 0.8, 0.1, 0.1), pillarWoodMat);
    bracket.position.set(px > 0 ? -0.4 : 0.4, 4.0, 0);
    const lantern = new THREE.Mesh(new THREE.OctahedronGeometry(0.26), new THREE.MeshStandardMaterial({
      color: '#FEF08A',
      emissive: '#F59E0B',
      emissiveIntensity: 0.9
    }));
    lantern.position.set(px > 0 ? -0.75 : 0.75, 3.7, 0);
    pGroup.add(bracket, lantern);

    return pGroup;
  };

  const pillarLeft = buildGatePillar(-3.2);
  const pillarRight = buildGatePillar(3.2);
  startGateGroup.add(pillarLeft, pillarRight);

  // 3. Overhead Curved Rainbow Arch
  const rainbowColors = ['#F43F5E', '#FB923C', '#FACC15', '#4ADE80', '#38BDF8', '#A855F7'];
  const archSpanR = 3.3;
  rainbowColors.forEach((col, idx) => {
    const r = archSpanR + idx * 0.14;
    const arcGeo = new THREE.TorusGeometry(r, 0.08, 8, 24, Math.PI);
    const arcMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.3 });
    const arcMesh = new THREE.Mesh(arcGeo, arcMat);
    arcMesh.position.set(0, 4.8, 0);
    arcMesh.castShadow = true;
    startGateGroup.add(arcMesh);
  });

  // Hanging Triangular Colorful Bunting Flags under Arch
  const flagMats = [
    new THREE.MeshStandardMaterial({ color: '#EF4444' }),
    new THREE.MeshStandardMaterial({ color: '#F59E0B' }),
    new THREE.MeshStandardMaterial({ color: '#10B981' }),
    new THREE.MeshStandardMaterial({ color: '#3B82F6' }),
    new THREE.MeshStandardMaterial({ color: '#8B5CF6' }),
    new THREE.MeshStandardMaterial({ color: '#EC4899' })
  ];
  for (let f = 0; f < 9; f++) {
    const fx = -2.4 + f * 0.6;
    const fy = 4.7 - Math.sin((f / 8) * Math.PI) * 0.4;
    const flagGeo = new THREE.ConeGeometry(0.2, 0.35, 3);
    const flagMesh = new THREE.Mesh(flagGeo, flagMats[f % flagMats.length]);
    flagMesh.rotation.z = Math.PI;
    flagMesh.position.set(fx, fy, 0);
    startGateGroup.add(flagMesh);
  }

  // 4. Grand Wooden Welcome Signboard ("✨ START ADVENTURE ✨")
  const boardMat = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.7 });
  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.95, 0.22), boardMat);
  signBoard.position.set(0, 4.0, 0);
  signBoard.castShadow = true;

  const frameBorder = new THREE.Mesh(new THREE.BoxGeometry(4.55, 1.08, 0.18), goldFinialMat);
  frameBorder.position.set(0, 4.0, -0.02);

  const plateMat = new THREE.MeshStandardMaterial({ color: '#FFFBEB', roughness: 0.4 });
  const signPlateFront = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.72, 0.05), plateMat);
  signPlateFront.position.set(0, 4.0, 0.12);
  const signPlateBack = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.72, 0.05), plateMat);
  signPlateBack.position.set(0, 4.0, -0.12);

  // Golden Stars flanking the sign
  for (const sx of [-1.8, 1.8]) {
    for (const sz of [0.16, -0.16]) {
      const decoStar = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2), goldFinialMat);
      decoStar.position.set(sx, 4.0, sz);
      startGateGroup.add(decoStar);
    }
  }

  // Support suspension chains from arch to signboard
  for (const cx of [-1.6, 1.6]) {
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), goldFinialMat);
    chain.position.set(cx, 4.6, 0);
    startGateGroup.add(chain);
  }

  startGateGroup.add(signBoard, frameBorder, signPlateFront, signPlateBack);

  // 5. Interactive Golden Adventure Bell (Hangs in center under signboard)
  const bellGroup = new THREE.Group();
  bellGroup.position.set(0, 3.1, 0);

  const bellBody = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.42, 0.52, 16), goldFinialMat);
  bellBody.position.y = 0.1;
  bellBody.castShadow = true;
  const bellTopCap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), goldFinialMat);
  bellTopCap.position.y = 0.36;
  const bellClapper = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: '#EF4444', roughness: 0.2 }));
  bellClapper.position.y = -0.16;

  bellGroup.add(bellBody, bellTopCap, bellClapper);
  startGateGroup.add(bellGroup);

  // 6. Two Spinning Colorful Pinwheels on top of Left & Right Pillars
  const startGatePinwheels: THREE.Group[] = [];
  const buildPinwheel = (px: number) => {
    const pwGroup = new THREE.Group();
    pwGroup.position.set(px, 5.8, 0);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), pillarWoodMat);
    stem.position.y = -0.2;
    pwGroup.add(stem);

    const bladesGroup = new THREE.Group();
    const bladeMatList = [
      new THREE.MeshStandardMaterial({ color: '#EF4444', roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: '#10B981', roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: '#3B82F6', roughness: 0.3 })
    ];
    for (let b = 0; b < 4; b++) {
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 3), bladeMatList[b]);
      blade.rotation.z = (b * Math.PI) / 2;
      blade.position.set(Math.cos((b * Math.PI) / 2) * 0.28, Math.sin((b * Math.PI) / 2) * 0.28, 0.05);
      bladesGroup.add(blade);
    }
    const centerPin = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), goldFinialMat);
    centerPin.position.z = 0.08;
    bladesGroup.add(centerPin);

    pwGroup.add(bladesGroup);
    startGatePinwheels.push(bladesGroup);
    return pwGroup;
  };

  const pinwheelL = buildPinwheel(-3.2);
  const pinwheelR = buildPinwheel(3.2);
  startGateGroup.add(pinwheelL, pinwheelR);

  // 7. Cheerful Floating Balloons attached to Pillars
  const startGateBalloons: THREE.Group[] = [];
  const buildBalloonCluster = (bx: number) => {
    const bg = new THREE.Group();
    bg.position.set(bx, 4.2, 0.4);

    const balloonColors = ['#F43F5E', '#38BDF8', '#FACC15', '#A855F7'];
    for (let i = 0; i < 3; i++) {
      const bMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 14, 14),
        new THREE.MeshStandardMaterial({ color: balloonColors[i % balloonColors.length], roughness: 0.25 })
      );
      bMesh.scale.set(0.9, 1.15, 0.9);
      bMesh.position.set((i - 1) * 0.36, 0.6 + (i % 2) * 0.35, (i % 2) * 0.18);
      bMesh.castShadow = true;

      const knot = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.1, 6), new THREE.MeshStandardMaterial({ color: balloonColors[i % balloonColors.length] }));
      knot.position.set(bMesh.position.x, bMesh.position.y - 0.42, bMesh.position.z);
      knot.rotation.x = Math.PI;

      const stringLine = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.9, 4), new THREE.MeshBasicMaterial({ color: '#CBD5E1' }));
      stringLine.position.set(bMesh.position.x, bMesh.position.y - 0.85, bMesh.position.z);

      bg.add(bMesh, knot, stringLine);
    }
    startGateBalloons.push(bg);
    return bg;
  };

  const balloonsL = buildBalloonCluster(-3.6);
  const balloonsR = buildBalloonCluster(3.6);
  startGateGroup.add(balloonsL, balloonsR);

  // 8. Flower Planter Boxes & Side Welcoming Banners
  const planterMat = new THREE.MeshStandardMaterial({ color: '#B45309', roughness: 0.8 });
  for (const px of [-4.2, 4.2]) {
    const planter = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.8), planterMat);
    planter.position.set(px, 0.25, 0);
    planter.castShadow = true;
    startGateGroup.add(planter);

    for (let f = 0; f < 3; f++) {
      const fStem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 4), new THREE.MeshStandardMaterial({ color: '#16A34A' }));
      fStem.position.set(px + (f - 1) * 0.2, 0.6, (f % 2) * 0.15 - 0.05);
      const fHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshStandardMaterial({ color: f === 0 ? '#EF4444' : f === 1 ? '#FACC15' : '#EC4899' }));
      fHead.position.set(fStem.position.x, 0.8, fStem.position.z);
      startGateGroup.add(fStem, fHead);
    }
  }

  scene.add(startGateGroup);

  // Register Start Gate Interactive Targets
  interactiveMap.set(signBoard, {
    type: 'start_gate',
    id: 'adventure_start_gate',
    position: new THREE.Vector3(0, 3.5, 10),
    label: 'Wonder Adventure Gate (Start Point)'
  });
  interactiveMap.set(bellBody, {
    type: 'start_gate',
    id: 'adventure_start_gate_bell',
    position: new THREE.Vector3(0, 3.1, 10),
    label: 'Golden Adventure Bell (Ring Me!)'
  });
  interactiveMap.set(podMesh, {
    type: 'start_gate',
    id: 'adventure_start_pod',
    position: new THREE.Vector3(0, 0.2, 10),
    label: 'Star Starting Pad (Spawn Point)'
  });

  // =========================================================================
  // 11. ALPHABET GROVE ([-90, 0, 0]) - Grand Archway & 26 Real Learning Stations
  // =========================================================================
  const alphabetGroveGroup = new THREE.Group();
  alphabetGroveGroup.position.set(-90, 0, 0);

  // Grand Wooden Entrance Arch
  const archMat = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.7 });
  const archColL = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 7.2, 8), archMat);
  archColL.position.set(22, 3.6, -4.5);
  const archColR = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 7.2, 8), archMat);
  archColR.position.set(22, 3.6, 4.5);
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 11), archMat);
  archTop.position.set(22, 7.2, 0);

  alphabetGroveGroup.add(archColL, archColR, archTop);

  // 3D Letters A, B, C on Entrance Arch
  const letterMatA = new THREE.MeshStandardMaterial({ color: '#EF4444', roughness: 0.3 });
  const letterMatB = new THREE.MeshStandardMaterial({ color: '#3B82F6', roughness: 0.3 });
  const letterMatC = new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.3 });

  const cubeA = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), letterMatA);
  cubeA.position.set(22, 9.0, -3.2);
  const cubeB = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), letterMatB);
  cubeB.position.set(22, 9.2, 0);
  const cubeC = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), letterMatC);
  cubeC.position.set(22, 9.0, 3.2);

  alphabetGroveGroup.add(cubeA, cubeB, cubeC);
  floatingItems.push(cubeA, cubeB, cubeC);

  // 26 Alphabet Learning Stations spread along winding grove path
  ALPHABET_DATA.forEach((item, idx) => {
    // S-curve winding coordinates within Alphabet Grove (spanning x: -20 to +15, z: -35 to +35)
    const t = idx / 25;
    const sx = 14 - t * 36 + Math.sin(idx * 0.9) * 4.2;
    const sz = -32 + t * 64;

    const stationGroup = new THREE.Group();
    stationGroup.position.set(sx, 0, sz);

    // Glowing Stone Pedestal
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.9, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: '#FFFDF7', roughness: 0.4 })
    );
    pedestal.position.y = 0.4;
    pedestal.receiveShadow = true;
    stationGroup.add(pedestal);

    // Glowing Ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.1, 8, 24),
      new THREE.MeshBasicMaterial({ color: item.color })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.82;
    stationGroup.add(ring);

    // Giant 3D Letter Monolith / Block
    const letterBlock = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.6, 1.6),
      new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.3, metalness: 0.1 })
    );
    letterBlock.position.y = 2.0;
    stationGroup.add(letterBlock);
    floatingItems.push(letterBlock);

    alphabetGroveGroup.add(stationGroup);

    // Interactive Raycast Target
    const worldPos = new THREE.Vector3(-90 + sx, 1.5, sz);
    const target: InteractiveItemTarget = {
      type: 'letter',
      id: item.letter,
      data: item,
      position: worldPos,
      label: `Station ${item.letter} (${item.word})`
    };

    interactiveMap.set(pedestal, target);
    interactiveMap.set(letterBlock, target);
  });

  scene.add(alphabetGroveGroup);

  // Main Zone Archway Hit Target for Alphabet Grove
  interactiveMap.set(archTop, {
    type: 'zone',
    id: 'alphabet',
    position: new THREE.Vector3(-90, 2, 0),
    label: 'Alphabet Grove'
  });

  // =========================================================================
  // 12. FRUIT ORCHARD ([80, 0, 75]) - 20 Distinct Fruit Trees & Bushes
  // =========================================================================
  const fruitOrchardGroup = new THREE.Group();
  fruitOrchardGroup.position.set(80, 0, 75);

  // Orchard Entrance Signboard
  const orchardSign = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 1.2, 0.3),
    new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.5 })
  );
  orchardSign.position.set(-18, 3.8, -12);
  fruitOrchardGroup.add(orchardSign);

  // 20 Fruit Trees & Bushes along Orchard Path
  FRUITS_DATA.forEach((fruit, idx) => {
    const angle = (idx / 20) * Math.PI * 2;
    const r = 10 + (idx % 3) * 8.5;
    const fx = Math.cos(angle) * r;
    const fz = Math.sin(angle) * r;

    const plantGroup = new THREE.Group();
    plantGroup.position.set(fx, 0, fz);

    // Tree Trunk
    const treeTrunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.5, 2.6, 6),
      trunkMat
    );
    treeTrunk.position.y = 1.3;
    treeTrunk.castShadow = true;

    // Foliage
    const foliageMat = new THREE.MeshStandardMaterial({ color: idx % 2 === 0 ? '#15803D' : '#16A34A', roughness: 0.75 });
    const foliage = new THREE.Mesh(
      new THREE.SphereGeometry(2.0, 8, 8),
      foliageMat
    );
    foliage.position.y = 3.2;
    foliage.castShadow = true;

    plantGroup.add(treeTrunk, foliage);

    // Hanging Fruits
    for (let f = 0; f < 3; f++) {
      const fAngle = (f / 3) * Math.PI * 2;
      const fruitMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 8, 8),
        new THREE.MeshStandardMaterial({ color: fruit.colorHex, roughness: 0.2 })
      );
      fruitMesh.position.set(Math.cos(fAngle) * 1.5, 3.0 + Math.sin(f) * 0.4, Math.sin(fAngle) * 1.5);
      plantGroup.add(fruitMesh);

      // Interactive fruit picker
      const worldPos = new THREE.Vector3(80 + fx, 2.5, 75 + fz);
      interactiveMap.set(fruitMesh, {
        type: 'fruit',
        id: fruit.id,
        data: fruit,
        position: worldPos,
        label: fruit.name
      });
    }

    fruitOrchardGroup.add(plantGroup);

    const worldPos = new THREE.Vector3(80 + fx, 2.5, 75 + fz);
    interactiveMap.set(foliage, {
      type: 'fruit',
      id: fruit.id,
      data: fruit,
      position: worldPos,
      label: fruit.name
    });
  });

  scene.add(fruitOrchardGroup);

  interactiveMap.set(orchardSign, {
    type: 'zone',
    id: 'fruits',
    position: new THREE.Vector3(80, 2, 75),
    label: 'Fruit Orchard'
  });

  // =========================================================================
  // 13. ANIMAL WOODS ([-75, 0, -70]) - Woodland Treehouse & 12+ 3D Animals
  // =========================================================================
  const animalWoodsGroup = new THREE.Group();
  animalWoodsGroup.position.set(-75, 0, -70);

  // Woodland Treehouse Shelter
  const treehouseTrunk = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 5.5, 8), trunkMat);
  treehouseTrunk.position.y = 2.75;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.0, 4.0), new THREE.MeshStandardMaterial({ color: '#FB7185', roughness: 0.6 }));
  cabin.position.y = 5.8;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.0, 2.4, 4), new THREE.MeshStandardMaterial({ color: '#E11D48' }));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 8.2;
  animalWoodsGroup.add(treehouseTrunk, cabin, roof);

  // 12+ Friendly Animals in Forest Glades
  ANIMALS_DATA.slice(0, 12).forEach((animal, idx) => {
    const angle = (idx / 12) * Math.PI * 2;
    const r = 12 + (idx % 2) * 9;
    const ax = Math.cos(angle) * r;
    const az = Math.sin(angle) * r;

    const animalGroup = new THREE.Group();
    animalGroup.position.set(ax, 0, az);

    // Simple friendly low-poly animal body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: idx === 0 ? '#FDFBF7' : idx === 1 ? '#D97706' : idx === 6 ? '#78350F' : '#FB7185',
      roughness: 0.6
    });
    const aBody = new THREE.Mesh(new THREE.SphereGeometry(0.85, 10, 10), bodyMat);
    aBody.position.y = 0.85;
    aBody.scale.set(1.2, 0.9, 0.9);

    const aHead = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), bodyMat);
    aHead.position.set(0.7, 1.4, 0);

    animalGroup.add(aBody, aHead);
    animalWoodsGroup.add(animalGroup);

    const worldPos = new THREE.Vector3(-75 + ax, 1.2, -70 + az);
    const target: InteractiveItemTarget = {
      type: 'animal',
      id: animal.id,
      data: animal,
      position: worldPos,
      label: `${animal.name} (${animal.soundText})`
    };

    interactiveMap.set(aBody, target);
    interactiveMap.set(aHead, target);
  });

  scene.add(animalWoodsGroup);

  interactiveMap.set(cabin, {
    type: 'zone',
    id: 'animals',
    position: new THREE.Vector3(-75, 2, -70),
    label: 'Animal Woods'
  });

  // =========================================================================
  // 14. NUMBER VALLEY ([0, 0, 95]) - 20 Stepping Stones & Monoliths
  // =========================================================================
  const numberValleyGroup = new THREE.Group();
  numberValleyGroup.position.set(0, 0, 95);

  // Giant Archway "NUMBER VALLEY 1-20"
  const numArchColL = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 6.4, 8), new THREE.MeshStandardMaterial({ color: '#3B82F6' }));
  numArchColL.position.set(-5.5, 3.2, -18);
  const numArchColR = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 6.4, 8), new THREE.MeshStandardMaterial({ color: '#3B82F6' }));
  numArchColR.position.set(5.5, 3.2, -18);
  const numArchBeam = new THREE.Mesh(new THREE.BoxGeometry(13, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: '#1D4ED8' }));
  numArchBeam.position.set(0, 6.4, -18);
  numberValleyGroup.add(numArchColL, numArchColR, numArchBeam);

  // 20 Stepping Stones across the valley path
  NUMBERS_DATA.forEach((numItem, idx) => {
    const t = idx / 19;
    const nx = Math.sin(t * Math.PI * 3) * 8.5;
    const nz = -14 + t * 38;

    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.6, 0.45, 12),
      new THREE.MeshStandardMaterial({ color: numItem.color, roughness: 0.35 })
    );
    pad.position.set(nx, 0.25, nz);
    pad.receiveShadow = true;
    numberValleyGroup.add(pad);

    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.6, 0),
      new THREE.MeshStandardMaterial({ color: '#FEF08A', emissive: '#CA8A04', emissiveIntensity: 0.4 })
    );
    gem.position.set(nx, 1.4, nz);
    numberValleyGroup.add(gem);
    floatingItems.push(gem);

    const worldPos = new THREE.Vector3(nx, 1.0, 95 + nz);
    const target: InteractiveItemTarget = {
      type: 'number',
      id: String(numItem.number),
      data: numItem,
      position: worldPos,
      label: `Number ${numItem.number} (${numItem.itemName})`
    };

    interactiveMap.set(pad, target);
    interactiveMap.set(gem, target);
  });

  scene.add(numberValleyGroup);

  interactiveMap.set(numArchBeam, {
    type: 'zone',
    id: 'numbers',
    position: new THREE.Vector3(0, 2, 95),
    label: 'Number Valley'
  });

  // =========================================================================
  // 15. MUSIC GARDEN ([90, 0, 0]) - Playable Xylophone Stage & Chimes
  // =========================================================================
  const musicGardenGroup = new THREE.Group();
  musicGardenGroup.position.set(90, 0, 0);

  // Rainbow Wooden Gazebo Stage
  const stageBase = new THREE.Mesh(
    new THREE.CylinderGeometry(8.5, 9.2, 0.6, 24),
    new THREE.MeshStandardMaterial({ color: '#FFFDF7', roughness: 0.5 })
  );
  stageBase.position.y = 0.3;
  stageBase.receiveShadow = true;
  musicGardenGroup.add(stageBase);

  // 8 Playable Rainbow Xylophone Stepping Keys (C, D, E, F, G, A, B, C2)
  const rainbowColors = ['#EF4444', '#F97316', '#FBBF24', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'];
  for (let k = 0; k < 8; k++) {
    const keyWidth = 1.2;
    const keyLength = 4.2 - (k * 0.25);
    const kx = -4.5 + k * 1.3;

    const keyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(keyWidth, 0.35, keyLength),
      new THREE.MeshStandardMaterial({ color: rainbowColors[k], roughness: 0.25, metalness: 0.15 })
    );
    keyMesh.position.set(kx, 0.7, 0);
    musicGardenGroup.add(keyMesh);

    chimingKeys.push({ mesh: keyMesh, noteIndex: k });

    const worldPos = new THREE.Vector3(90 + kx, 1.2, 0);
    interactiveMap.set(keyMesh, {
      type: 'xylophone_key',
      id: `xylo-${k}`,
      data: { noteIndex: k },
      position: worldPos,
      label: `Note ${k + 1}`
    });
  }

  // Floating Musical Notes
  for (let n = 0; n < 6; n++) {
    const noteMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.12, 8, 16),
      new THREE.MeshStandardMaterial({ color: '#FDE047', emissive: '#CA8A04', emissiveIntensity: 0.5 })
    );
    noteMesh.position.set(-4 + n * 1.6, 3.5 + Math.sin(n) * 0.8, (n % 2) * 2 - 1);
    musicGardenGroup.add(noteMesh);
    floatingItems.push(noteMesh);
  }

  scene.add(musicGardenGroup);

  interactiveMap.set(stageBase, {
    type: 'zone',
    id: 'music',
    position: new THREE.Vector3(90, 2, 0),
    label: 'Music Garden'
  });

  // =========================================================================
  // 16. STORY MEADOW ([0, 0, -90]) - Storybook Cottage & Ancient Story Tree
  // =========================================================================
  const storyMeadowGroup = new THREE.Group();
  storyMeadowGroup.position.set(0, 0, -90);

  // Storybook Cottage
  const cottageWall = new THREE.Mesh(new THREE.BoxGeometry(6.4, 3.6, 5.2), new THREE.MeshStandardMaterial({ color: '#FFF7ED', roughness: 0.6 }));
  cottageWall.position.y = 1.8;
  const cottageRoof = new THREE.Mesh(new THREE.ConeGeometry(5.4, 2.6, 4), new THREE.MeshStandardMaterial({ color: '#EA580C', roughness: 0.7 }));
  cottageRoof.rotation.y = Math.PI / 4;
  cottageRoof.position.y = 4.8;
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.4, 0.8), new THREE.MeshStandardMaterial({ color: '#78350F' }));
  chimney.position.set(1.8, 5.2, 1.2);
  storyMeadowGroup.add(cottageWall, cottageRoof, chimney);

  // Giant Open 3D Storybook Pedestal
  const storyBookBase = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 0.6, 12), new THREE.MeshStandardMaterial({ color: '#FED7AA' }));
  storyBookBase.position.set(0, 0.3, 8);
  const bookL = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 2.4), new THREE.MeshStandardMaterial({ color: '#FFFDF7' }));
  bookL.position.set(-0.9, 1.6, 8);
  bookL.rotation.z = 0.18;
  const bookR = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 2.4), new THREE.MeshStandardMaterial({ color: '#FFFDF7' }));
  bookR.position.set(0.9, 1.6, 8);
  bookR.rotation.z = -0.18;
  storyMeadowGroup.add(storyBookBase, bookL, bookR);

  scene.add(storyMeadowGroup);

  interactiveMap.set(cottageWall, {
    type: 'zone',
    id: 'stories',
    position: new THREE.Vector3(0, 2, -90),
    label: 'Story Meadow'
  });
  interactiveMap.set(storyBookBase, {
    type: 'zone',
    id: 'stories',
    position: new THREE.Vector3(0, 2, -82),
    label: 'Storybook Pagoda'
  });

  // =========================================================================
  // 17. CREATIVE CORNER ([-65, 0, 80]) & STAR OBSERVATORY ([75, 0, -75])
  // =========================================================================
  // Creative Corner Rainbow Easel
  const creativeGroup = new THREE.Group();
  creativeGroup.position.set(-65, 0, 80);

  const easelCanvas = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.4, 0.2), new THREE.MeshStandardMaterial({ color: '#FAF5FF', roughness: 0.3 }));
  easelCanvas.position.set(0, 3.4, 0);
  const easelLegL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.8), new THREE.MeshStandardMaterial({ color: '#7C3AED' }));
  easelLegL.rotation.z = 0.22;
  easelLegL.position.set(-1.8, 2.8, 0);
  const easelLegR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.8), new THREE.MeshStandardMaterial({ color: '#7C3AED' }));
  easelLegR.rotation.z = -0.22;
  easelLegR.position.set(1.8, 2.8, 0);
  creativeGroup.add(easelCanvas, easelLegL, easelLegR);
  scene.add(creativeGroup);

  interactiveMap.set(easelCanvas, {
    type: 'zone',
    id: 'creative',
    position: new THREE.Vector3(-65, 2, 80),
    label: 'Creative Corner'
  });

  // Star Observatory Hilltop Dome
  const starGroup = new THREE.Group();
  starGroup.position.set(75, 0, -75);

  const obsTower = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.4, 5.2, 12), new THREE.MeshStandardMaterial({ color: '#FEF08A', roughness: 0.4 }));
  obsTower.position.y = 2.6;

  const starDome = new THREE.Mesh(
    new THREE.OctahedronGeometry(2.4, 0),
    new THREE.MeshStandardMaterial({ color: '#EAB308', emissive: '#CA8A04', emissiveIntensity: 0.7, metalness: 0.5 })
  );
  starDome.position.y = 6.6;
  observatoryDome = starDome;
  starGroup.add(obsTower, starDome);
  scene.add(starGroup);

  interactiveMap.set(obsTower, {
    type: 'zone',
    id: 'stars',
    position: new THREE.Vector3(75, 4, -75),
    label: 'Star Observatory'
  });

  // Windmill Landmark in North-East Hill
  const windmillGroup = new THREE.Group();
  const millBase = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3.2, 7.5, 8), new THREE.MeshStandardMaterial({ color: '#FDFBF7', roughness: 0.6 }));
  millBase.position.y = 3.75;
  const millRoof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 2.4, 8), new THREE.MeshStandardMaterial({ color: '#C2410C' }));
  millRoof.position.y = 8.6;
  windmillGroup.add(millBase, millRoof);

  const bladesGroup = new THREE.Group();
  bladesGroup.position.set(0, 7.2, 2.2);
  const bladeMat = new THREE.MeshStandardMaterial({ color: '#9A3412', roughness: 0.5 });
  for (let b = 0; b < 4; b++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.8, 0.1), bladeMat);
    blade.position.y = 1.9;
    const bHolder = new THREE.Group();
    bHolder.rotation.z = (b * Math.PI) / 2;
    bHolder.add(blade);
    bladesGroup.add(bHolder);
  }
  windmillGroup.add(bladesGroup);
  windmillBlades = bladesGroup;
  windmillGroup.position.set(52, 0, -48);
  scene.add(windmillGroup);

  // =========================================================================
  // 18. MEADOW OBSTACLES & BARRIERS (Physics & Collision System)
  // =========================================================================
  const obstacles: WorldObstacle[] = [
    // Lake boundary (Water hazard with bridge passages)
    { id: 'obs-lake', type: 'lake', x: 0, z: 6, radius: 13.5, name: 'Sparkling Meadow Lake' },
    // Gateways & Posts
    { id: 'obs-alpha-gate', type: 'gate', x: -38, z: 0, radius: 2.8, name: 'Alphabet Arch Gate' },
    { id: 'obs-stone-brook', type: 'boulder', x: 0, z: 38, radius: 2.6, name: 'Stepping Stones Brook' },
    { id: 'obs-flower-bridge', type: 'fence', x: 34, z: 34, radius: 2.6, name: 'Flower Brook Post' },
    // Major Zone Landmark Structures
    { id: 'obs-alpha-tree', type: 'building', x: -90, z: 0, radius: 6.2, name: 'Great Alphabet Tree' },
    { id: 'obs-number-mill', type: 'building', x: 0, z: 95, radius: 5.8, name: 'Number Valley Windmill' },
    { id: 'obs-fruit-barn', type: 'building', x: 80, z: 75, radius: 6.8, name: 'Fruit Orchard Barn' },
    { id: 'obs-animal-den', type: 'building', x: -75, z: -70, radius: 6.5, name: 'Animal Friends Woods Den' },
    { id: 'obs-creative-easel', type: 'building', x: -65, z: 80, radius: 6.2, name: 'Creative Rainbow Studio' },
    { id: 'obs-music-pavilion', type: 'building', x: 90, z: 0, radius: 6.5, name: 'Music Chime Pavilion' },
    { id: 'obs-story-cottage', type: 'building', x: 0, z: -90, radius: 6.5, name: 'Storybook Cottage' },
    { id: 'obs-star-observatory', type: 'building', x: 75, z: -75, radius: 7.2, name: 'Starlight Observatory' },
    { id: 'obs-hill-windmill', type: 'building', x: 52, z: -48, radius: 5.0, name: 'Scenic Hill Windmill' }
  ];

  // Decorative Boulders & Stone Clusters
  const boulderMat = new THREE.MeshStandardMaterial({ color: '#78716C', roughness: 0.9, flatShading: true });
  const mossMat = new THREE.MeshStandardMaterial({ color: '#4ADE80', roughness: 0.8 });

  const placeRockCluster = (x: number, z: number, name: string) => {
    const rockGroup = new THREE.Group();
    const r1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), boulderMat);
    r1.position.set(0, 1.0, 0);
    r1.scale.set(1.2, 0.8, 1.0);
    const r2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 1), boulderMat);
    r2.position.set(1.2, 0.7, 0.4);
    const r3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 1), boulderMat);
    r3.position.set(-1.0, 0.5, -0.3);
    const mossPatch = new THREE.Mesh(new THREE.SphereGeometry(0.6, 6, 6), mossMat);
    mossPatch.position.set(0.3, 1.8, 0.2);
    rockGroup.add(r1, r2, r3, mossPatch);
    rockGroup.position.set(x, 0, z);
    scene.add(rockGroup);
    obstacles.push({ id: `rock-${x}-${z}`, type: 'boulder', x, z, radius: 2.5, name });
  };

  placeRockCluster(-45, 35, 'Mossy Granite Boulders');
  placeRockCluster(45, -35, 'Crystal Ridge Stones');
  placeRockCluster(-30, -55, 'Forest Edge Boulders');
  placeRockCluster(50, 45, 'Orchard Stone Wall');
  placeRockCluster(-50, -25, 'Animal Woods Rocks');
  placeRockCluster(30, -60, 'Observatory Peak Crags');

  // =========================================================================
  // 19. RICH 3D COLLECTIBLES (Finely Scaled Coins, Berries, Gems & Clovers)
  // =========================================================================
  const collectibles: WorldCollectible[] = [];

  // Helper to create Cute Compact Golden Meadow Coin (scaled down to toddler-friendly cute size)
  const createCoin = (id: string, x: number, z: number, label: string) => {
    const cGroup = new THREE.Group();
    // Finely scaled 0.28 radius coin with beveled edge
    const coinBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.08, 16),
      new THREE.MeshStandardMaterial({
        color: '#FBBF24',
        emissive: '#D97706',
        emissiveIntensity: 0.4,
        metalness: 0.85,
        roughness: 0.2
      })
    );
    coinBody.rotation.x = Math.PI / 2;

    const starReliefFront = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.14, 0),
      new THREE.MeshStandardMaterial({ color: '#FEF3C7', emissive: '#F59E0B', emissiveIntensity: 0.6, metalness: 0.9 })
    );
    starReliefFront.scale.set(1, 1, 0.3);
    starReliefFront.position.z = 0.05;

    const starReliefBack = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.14, 0),
      new THREE.MeshStandardMaterial({ color: '#FEF3C7', emissive: '#F59E0B', emissiveIntensity: 0.6, metalness: 0.9 })
    );
    starReliefBack.scale.set(1, 1, 0.3);
    starReliefBack.position.z = -0.05;

    cGroup.add(coinBody, starReliefFront, starReliefBack);
    cGroup.position.set(x, 0.65, z);
    scene.add(cGroup);

    const item: WorldCollectible = {
      id,
      type: 'coin',
      mesh: cGroup,
      initialY: 0.65,
      collected: false,
      value: 1,
      label,
      name: 'Meadow Gold Coin'
    };
    collectibles.push(item);
    interactiveMap.set(coinBody, {
      type: 'coin',
      id,
      position: new THREE.Vector3(x, 0.65, z),
      label: `🪙 ${label}`
    });
  };

  // Helper to create Sweet Wild Meadow Strawberry
  const createBerry = (id: string, x: number, z: number, label: string) => {
    const bGroup = new THREE.Group();
    const berryMat = new THREE.MeshStandardMaterial({
      color: '#E11D48',
      emissive: '#9F1239',
      emissiveIntensity: 0.35,
      roughness: 0.3
    });
    const leafMat = new THREE.MeshStandardMaterial({ color: '#16A34A', roughness: 0.5 });

    const berryBody = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), berryMat);
    berryBody.scale.set(1, 1.25, 1);
    bGroup.add(berryBody);

    for (let i = 0; i < 4; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 4), leafMat);
      leaf.rotation.z = Math.PI / 2 + 0.3;
      leaf.rotation.y = (i * Math.PI) / 2;
      leaf.position.set(0, 0.22, 0);
      bGroup.add(leaf);
    }

    bGroup.position.set(x, 0.65, z);
    scene.add(bGroup);

    const item: WorldCollectible = {
      id,
      type: 'fruit',
      mesh: bGroup,
      initialY: 0.65,
      collected: false,
      value: 1,
      label,
      name: 'Sweet Meadow Berry'
    };
    collectibles.push(item);
    interactiveMap.set(berryBody, {
      type: 'fruit',
      id,
      position: new THREE.Vector3(x, 0.65, z),
      label: `🍓 ${label}`
    });
  };

  // Helper to create Rainbow Gem Crystal
  const gemColors = [
    { color: '#EF4444', emissive: '#991B1B', name: 'Ruby Gem' },
    { color: '#3B82F6', emissive: '#1E40AF', name: 'Sapphire Gem' },
    { color: '#10B981', emissive: '#065F46', name: 'Emerald Gem' },
    { color: '#A855F7', emissive: '#6B21A8', name: 'Amethyst Gem' },
    { color: '#F59E0B', emissive: '#B45309', name: 'Topaz Gem' }
  ];

  const createGem = (id: string, x: number, z: number, colorIdx = 0, label: string) => {
    const gGroup = new THREE.Group();
    const gConfig = gemColors[colorIdx % gemColors.length];
    const gemMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.38, 0),
      new THREE.MeshStandardMaterial({
        color: gConfig.color,
        emissive: gConfig.emissive,
        emissiveIntensity: 0.65,
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.92
      })
    );
    gemMesh.scale.set(0.9, 1.25, 0.9);
    gGroup.add(gemMesh);
    gGroup.position.set(x, 0.75, z);
    scene.add(gGroup);

    const item: WorldCollectible = {
      id,
      type: 'gem',
      mesh: gGroup,
      initialY: 0.75,
      collected: false,
      value: 5,
      label,
      name: gConfig.name
    };
    collectibles.push(item);
    interactiveMap.set(gemMesh, {
      type: 'gem',
      id,
      position: new THREE.Vector3(x, 0.75, z),
      label: `💎 ${label}`
    });
  };

  // Helper to create Four-Leaf Lucky Clover
  const createClover = (id: string, x: number, z: number, label: string) => {
    const clGroup = new THREE.Group();
    const cloverMat = new THREE.MeshStandardMaterial({
      color: '#22C55E',
      emissive: '#15803D',
      emissiveIntensity: 0.45,
      roughness: 0.3
    });
    for (let l = 0; l < 4; l++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), cloverMat);
      leaf.scale.set(1.0, 0.25, 1.4);
      leaf.rotation.y = (l * Math.PI) / 2;
      leaf.position.set(Math.cos((l * Math.PI) / 2) * 0.18, 0, Math.sin((l * Math.PI) / 2) * 0.18);
      clGroup.add(leaf);
    }
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3), cloverMat);
    stem.position.set(0, -0.15, 0);
    clGroup.add(stem);
    clGroup.position.set(x, 0.65, z);
    scene.add(clGroup);

    const item: WorldCollectible = {
      id,
      type: 'clover',
      mesh: clGroup,
      initialY: 0.65,
      collected: false,
      value: 3,
      label,
      name: 'Lucky Four-Leaf Clover'
    };
    collectibles.push(item);
    interactiveMap.set(stem, {
      type: 'clover',
      id,
      position: new THREE.Vector3(x, 0.65, z),
      label: `🍀 ${label}`
    });
  };

  // Helper to generate a straight trail of collectibles between two coordinates
  const createCoinTrail = (prefix: string, x1: number, z1: number, x2: number, z2: number, count: number, baseLabel: string) => {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const cx = x1 + (x2 - x1) * t;
      const cz = z1 + (z2 - z1) * t;
      const rx = Math.round(cx * 10) / 10;
      const rz = Math.round(cz * 10) / 10;
      if (i % 3 === 2) {
        createBerry(`${prefix}-b-${i + 1}`, rx, rz, `Meadow Berry #${i + 1}`);
      } else {
        createCoin(`${prefix}-${i + 1}`, rx, rz, `${baseLabel} #${i + 1}`);
      }
    }
  };

  // Populate dense collectible trails along all cobblestone roads, bridges & zones
  // Central Meadow Plaza Ring of Coins (Around the main spawn area)
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const cx = Math.cos(ang) * 9;
    const cz = Math.sin(ang) * 9;
    createCoin(`coin-hub-${i + 1}`, Math.round(cx * 10) / 10, Math.round(cz * 10) / 10, `Central Plaza Coin #${i + 1}`);
  }

  // 1. Alphabet Grove Trail & Bridge
  createCoinTrail('coin-a', -12, 0, -85, 0, 8, 'Alphabet Road Coin');
  createCoinTrail('coin-a-br', -24, 1.5, -34, 1.5, 3, 'Alphabet Arch Bridge Coin');
  createGem('gem-a1', -45, 2.5, 1, 'Grove Sapphire');
  createGem('gem-a2', -75, -2.5, 0, 'Alpha Ruby Gem');
  createClover('clover-a1', -35, -2.5, 'Alpha Trail Clover');
  createClover('clover-a2', -65, 3.0, 'Whispering Woods Clover');

  // 2. Number Valley Trail & Bridge
  createCoinTrail('coin-n', 0, 12, 0, 85, 8, 'Number Valley Coin');
  createCoinTrail('coin-n-br', -1.5, 22, 1.5, 30, 3, 'Counting Brook Coin');
  createGem('gem-n1', 3.0, 48, 0, 'Ruby of Numbers');
  createGem('gem-n2', -3.0, 72, 2, 'Emerald Numeracy Gem');
  createClover('clover-n1', -2.5, 35, 'Lucky Valley Clover');
  createClover('clover-n2', 3.0, 65, 'Stepping Stone Clover');

  // 3. Music Garden Trail & Bridge
  createCoinTrail('coin-m', 12, 0, 85, 0, 8, 'Music Meadow Coin');
  createCoinTrail('coin-m-br', 22, -1.5, 30, 1.5, 3, 'Harmony Arch Bridge Coin');
  createGem('gem-m1', 45, -3.0, 3, 'Amethyst Melody Gem');
  createGem('gem-m2', 70, 3.0, 4, 'Topaz Rhythm Gem');
  createClover('clover-m1', 35, 2.5, 'Chiming Clover');
  createClover('clover-m2', 65, -2.5, 'Xylophone Meadow Clover');

  // 4. Story Meadow Trail & Bridge
  createCoinTrail('coin-s', 0, -12, 0, -85, 8, 'Storybook Path Coin');
  createCoinTrail('coin-s-br', 1.5, -22, -1.5, -30, 3, 'Story Brook Arch Coin');
  createGem('gem-s1', -3.0, -45, 4, 'Topaz Tale Gem');
  createGem('gem-s2', 3.0, -70, 1, 'Sapphire Rhyme Gem');
  createClover('clover-s1', 2.5, -35, 'Storybook Clover');
  createClover('clover-s2', -2.5, -65, 'Fairy Tale Clover');

  // 5. Animal Friends Woods Trail (Southwest)
  createCoinTrail('coin-an', -14, -14, -75, -75, 7, 'Critter Woods Coin');
  createGem('gem-an1', -48, -44, 2, 'Emerald Woods Gem');
  createGem('gem-an2', -68, -62, 0, 'Woodland Ruby');
  createClover('clover-an1', -30, -32, 'Four-Leaf Woodland Clover');
  createClover('clover-an2', -55, -50, 'Forest Hollow Clover');

  // 6. Fruit Orchard Trail (Northeast)
  createCoinTrail('coin-fr', 14, 14, 75, 75, 7, 'Sweet Orchard Coin');
  createGem('gem-fr1', 48, 44, 0, 'Ruby Strawberry Gem');
  createGem('gem-fr2', 68, 62, 4, 'Citrus Topaz Gem');
  createClover('clover-fr1', 30, 32, 'Sweet Orchard Clover');
  createClover('clover-fr2', 55, 50, 'Golden Apple Clover');

  // 7. Creative Corner Trail (Northwest)
  createCoinTrail('coin-cr', -14, 14, -70, 70, 7, 'Rainbow Studio Coin');
  createGem('gem-cr1', -42, 54, 3, 'Amethyst Paint Gem');
  createGem('gem-cr2', -62, 65, 1, 'Pastel Sapphire Gem');
  createClover('clover-cr1', -25, 35, 'Rainbow Clover');
  createClover('clover-cr2', -50, 52, 'Artisan Clover');

  // 8. Star Observatory Trail (Southeast)
  createCoinTrail('coin-st', 14, -14, 75, -75, 7, 'Starlight Peak Coin');
  createGem('gem-st1', 48, -48, 1, 'Sapphire Star Gem');
  createGem('gem-st2', 68, -65, 3, 'Cosmic Amethyst Gem');
  createClover('clover-st1', 28, -28, 'Starlight Clover');
  createClover('clover-st2', 52, -50, 'Constellation Clover');

  // =========================================================================
  // 19B. INTERACTIVE 3D ROAD BLOCKAGES (Path Obstacles with Fun Clear Actions)
  // =========================================================================
  const roadBlockages: {
    id: string;
    group: THREE.Group;
    targetMesh: THREE.Mesh;
    x: number;
    z: number;
    updateAnimation: (time: number, isCleared: boolean) => void;
  }[] = [];

  // 1. Sleeping Bunny Blockage on North Road (0, -48)
  const bunnyGroup = new THREE.Group();
  bunnyGroup.position.set(0, 0.25, -48);

  const rabbitBodyMat = new THREE.MeshStandardMaterial({ color: '#FFFDF7', roughness: 0.8 });
  const rabbitPinkMat = new THREE.MeshStandardMaterial({ color: '#FDA4AF', roughness: 0.5 });
  const carrotOrangeMat = new THREE.MeshStandardMaterial({ color: '#EA580C', roughness: 0.4 });
  const carrotGreenMat = new THREE.MeshStandardMaterial({ color: '#16A34A', roughness: 0.5 });

  const bunnyBody = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), rabbitBodyMat);
  bunnyBody.scale.set(1.1, 0.8, 1.3);
  bunnyBody.position.y = 0.5;

  const bunnyHead = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), rabbitBodyMat);
  bunnyHead.position.set(0, 0.8, 0.7);

  // Twitching ears
  const earL = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.8, 8), rabbitBodyMat);
  earL.position.set(-0.25, 1.35, 0.6);
  earL.rotation.z = -0.3;
  earL.rotation.x = -0.3;
  const earR = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.8, 8), rabbitBodyMat);
  earR.position.set(0.25, 1.35, 0.6);
  earR.rotation.z = 0.3;
  earR.rotation.x = -0.3;

  // Basket of golden carrots
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.4, 10), new THREE.MeshStandardMaterial({ color: '#92400E', roughness: 0.8 }));
  basket.position.set(1.1, 0.25, 0.3);
  for (let c = 0; c < 3; c++) {
    const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 6), carrotOrangeMat);
    carrot.position.set(1.1 + (c - 1) * 0.15, 0.45, 0.3 + (c % 2) * 0.1);
    carrot.rotation.x = Math.PI / 6;
    bunnyGroup.add(carrot);
  }

  // Floating Zzz particle letter spheres
  const zParticles: THREE.Mesh[] = [];
  for (let z = 0; z < 3; z++) {
    const zDot = new THREE.Mesh(new THREE.SphereGeometry(0.12 + z * 0.05, 8, 8), new THREE.MeshBasicMaterial({ color: '#A855F7' }));
    zDot.position.set(0.3 + z * 0.2, 1.4 + z * 0.35, 0.7);
    bunnyGroup.add(zDot);
    zParticles.push(zDot);
  }

  bunnyGroup.add(bunnyBody, bunnyHead, earL, earR, basket);
  scene.add(bunnyGroup);

  interactiveMap.set(bunnyBody, {
    type: 'obstacle',
    id: 'blockage_bunny',
    position: new THREE.Vector3(0, 0.8, -48),
    label: '🐰 Sleeping Bunny (Tap to feed carrot!)'
  });

  roadBlockages.push({
    id: 'blockage_bunny',
    group: bunnyGroup,
    targetMesh: bunnyBody,
    x: 0,
    z: -48,
    updateAnimation: (time, isCleared) => {
      if (isCleared) {
        // Bunny woke up, hopped to side of road, eating carrot happily
        bunnyGroup.position.set(2.8, 0.25, -48);
        bunnyBody.scale.set(1, 1, 1);
        bunnyHead.position.y = 0.9 + Math.sin(time * 5) * 0.08;
        zParticles.forEach(p => p.visible = false);
      } else {
        // Sleeping breathing rhythm
        const breathe = Math.sin(time * 2) * 0.06;
        bunnyBody.scale.set(1.1 + breathe, 0.8 + breathe, 1.3);
        zParticles.forEach((p, idx) => {
          p.position.y = 1.4 + idx * 0.35 + Math.sin(time * 2 + idx) * 0.15;
          p.position.x = 0.3 + idx * 0.2 + Math.cos(time * 2 + idx) * 0.1;
        });
      }
    }
  });

  // 2. Flowering Rainbow Log Blockage on West Road (-48, 0)
  const logGroup = new THREE.Group();
  logGroup.position.set(-48, 0.25, 0);

  const logWoodMat = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.85 });
  const logBody = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 5.2, 12), logWoodMat);
  logBody.rotation.z = Math.PI / 2;
  logBody.position.y = 0.55;

  // Glowing rainbow mushrooms on log
  const mushColors = ['#F43F5E', '#8B5CF6', '#38BDF8', '#10B981', '#F59E0B'];
  const mushCaps: THREE.Mesh[] = [];
  for (let m = 0; m < 5; m++) {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: mushColors[m], emissive: mushColors[m], emissiveIntensity: 0.6, roughness: 0.2 })
    );
    cap.position.set(-1.8 + m * 0.9, 1.1, (m % 2 === 0 ? 0.3 : -0.3));
    logGroup.add(cap);
    mushCaps.push(cap);
  }

  logGroup.add(logBody);
  scene.add(logGroup);

  interactiveMap.set(logBody, {
    type: 'obstacle',
    id: 'blockage_log',
    position: new THREE.Vector3(-48, 0.8, 0),
    label: '🌸 Rainbow Flowering Log (Tap to clear!)'
  });

  roadBlockages.push({
    id: 'blockage_log',
    group: logGroup,
    targetMesh: logBody,
    x: -48,
    z: 0,
    updateAnimation: (time, isCleared) => {
      if (isCleared) {
        // Raised into a glowing archway over the road
        logBody.position.y = 3.8;
        logGroup.scale.set(1.1, 1.1, 1.1);
      } else {
        logBody.position.y = 0.55;
        mushCaps.forEach((cap, idx) => {
          cap.scale.setScalar(1 + Math.sin(time * 3 + idx) * 0.12);
        });
      }
    }
  });

  // 3. Duckling Family Crossing on South Road Bridge (0, 48)
  const duckParadeGroup = new THREE.Group();
  duckParadeGroup.position.set(0, 0.25, 48);

  const duckMat = new THREE.MeshStandardMaterial({ color: '#FACC15', roughness: 0.4 });
  const duckBeakMat = new THREE.MeshStandardMaterial({ color: '#F97316', roughness: 0.3 });

  // Mama duck
  const mamaBody = new THREE.Mesh(new THREE.SphereGeometry(0.65, 10, 10), duckMat);
  mamaBody.scale.set(1.2, 0.9, 1.0);
  mamaBody.position.set(1.4, 0.5, 0);
  const mamaHead = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 10), duckMat);
  mamaHead.position.set(2.0, 0.9, 0);
  const mamaBeak = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.35, 6), duckBeakMat);
  mamaBeak.rotation.z = -Math.PI / 2;
  mamaBeak.position.set(2.35, 0.9, 0);
  duckParadeGroup.add(mamaBody, mamaHead, mamaBeak);

  // 3 baby ducklings
  const babies: THREE.Group[] = [];
  for (let b = 0; b < 3; b++) {
    const babyGroup = new THREE.Group();
    const bBody = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), duckMat);
    bBody.position.set(0.4 - b * 0.9, 0.28, 0);
    const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), duckMat);
    bHead.position.set(0.65 - b * 0.9, 0.48, 0);
    const bBeak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 5), duckBeakMat);
    bBeak.rotation.z = -Math.PI / 2;
    bBeak.position.set(0.85 - b * 0.9, 0.48, 0);
    babyGroup.add(bBody, bHead, bBeak);
    duckParadeGroup.add(babyGroup);
    babies.push(babyGroup);
  }

  scene.add(duckParadeGroup);

  interactiveMap.set(mamaBody, {
    type: 'obstacle',
    id: 'blockage_ducklings',
    position: new THREE.Vector3(0, 0.8, 48),
    label: '🦆 Duckling Family Crossing (Tap to cheer!)'
  });

  roadBlockages.push({
    id: 'blockage_ducklings',
    group: duckParadeGroup,
    targetMesh: mamaBody,
    x: 0,
    z: 48,
    updateAnimation: (time, isCleared) => {
      if (isCleared) {
        // Paddling happily in side pond
        duckParadeGroup.position.set(3.8, 0.1, 48);
        mamaBody.rotation.y = Math.PI / 4;
      } else {
        // Waddling back and forth across road
        duckParadeGroup.position.x = Math.sin(time * 1.5) * 0.6;
        mamaHead.position.y = 0.9 + Math.sin(time * 4) * 0.05;
        babies.forEach((b, idx) => {
          b.position.y = Math.abs(Math.sin(time * 6 + idx)) * 0.08;
        });
      }
    }
  });

  // 4. Golden Melody Star Gate on East Road (48, 0)
  const gateGroup = new THREE.Group();
  gateGroup.position.set(48, 0.2, 0);

  const gateWoodMat = new THREE.MeshStandardMaterial({ color: '#854D0E', roughness: 0.7 });
  const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 3.8, 10), gateWoodMat);
  postL.position.set(0, 1.9, -2.4);
  const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 3.8, 10), gateWoodMat);
  postR.position.set(0, 1.9, 2.4);

  const gateDoor = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.6, 4.6), gateWoodMat);
  gateDoor.position.set(0, 1.2, 0);

  const starLock = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.45, 0),
    new THREE.MeshStandardMaterial({ color: '#FACC15', emissive: '#CA8A04', emissiveIntensity: 0.8, metalness: 0.8 })
  );
  starLock.position.set(0.18, 1.2, 0);

  gateGroup.add(postL, postR, gateDoor, starLock);
  scene.add(gateGroup);

  interactiveMap.set(gateDoor, {
    type: 'obstacle',
    id: 'blockage_gate',
    position: new THREE.Vector3(48, 1.2, 0),
    label: '⭐ Golden Melody Gate (Tap star key to open!)'
  });

  roadBlockages.push({
    id: 'blockage_gate',
    group: gateGroup,
    targetMesh: gateDoor,
    x: 48,
    z: 0,
    updateAnimation: (time, isCleared) => {
      if (isCleared) {
        // Doors swing wide open
        gateDoor.position.set(-1.8, 1.2, -1.8);
        gateDoor.rotation.y = Math.PI / 2;
        starLock.visible = false;
      } else {
        gateDoor.position.set(0, 1.2, 0);
        gateDoor.rotation.y = 0;
        starLock.visible = true;
        starLock.rotation.y = time * 2;
      }
    }
  });


  // =========================================================================
  // 20. HIDDEN WONDER STARS (10 Secret Collectible Stars)
  // =========================================================================
  const starLocations = [
    { id: 'star-pond', x: -4, z: 12, label: 'Behind the Pond Reeds' },
    { id: 'star-bridge-w', x: -26, z: 3, label: 'Under the West Bridge' },
    { id: 'star-bridge-s', x: 3, z: 24, label: 'Beside the South Stream' },
    { id: 'star-alpha-woods', x: -105, z: -15, label: 'Inside the Alphabet Grove' },
    { id: 'star-orchard', x: 92, z: 82, label: 'Behind the Golden Apple Tree' },
    { id: 'star-animal-tree', x: -84, z: -76, label: 'In the Animal Woods Hollow' },
    { id: 'star-story-lantern', x: -8, z: -94, label: 'Near the Storybook Cottage' },
    { id: 'star-music-stage', x: 96, z: -6, label: 'Behind the Xylophone Stage' },
    { id: 'star-star-hill', x: 82, z: -82, label: 'Acutely on Starlight Peak' },
    { id: 'star-creative-easel', x: -70, z: 86, label: 'Behind the Rainbow Canvas' }
  ];

  starLocations.forEach((loc) => {
    const sGroup = new THREE.Group();
    const starMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.7, 0),
      new THREE.MeshStandardMaterial({ color: '#FACC15', emissive: '#CA8A04', emissiveIntensity: 0.65, metalness: 0.6 })
    );
    starMesh.position.y = 1.2;
    sGroup.add(starMesh);
    sGroup.position.set(loc.x, 0, loc.z);
    scene.add(sGroup);

    hiddenStars.push({ mesh: sGroup, id: loc.id, collected: false });
    floatingItems.push(starMesh);

    interactiveMap.set(starMesh, {
      type: 'star',
      id: loc.id,
      position: new THREE.Vector3(loc.x, 1.2, loc.z),
      label: `Secret Star: ${loc.label}`
    });
  });

  // =========================================================================
  // 21. CLOUDS & BUTTERFLIES
  // =========================================================================
  const cloudMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.9, transparent: true, opacity: 0.92 });
  for (let c = 0; c < 12; c++) {
    const cloudGroup = new THREE.Group();
    const numPuffs = 4 + Math.floor(Math.random() * 3);
    for (let p = 0; p < numPuffs; p++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(3.0 + Math.random() * 1.6, 8, 8), cloudMat);
      puff.position.set((p - numPuffs / 2) * 2.6, Math.sin(p) * 0.8, Math.cos(p) * 1.0);
      cloudGroup.add(puff);
    }
    cloudGroup.position.set(-120 + Math.random() * 240, 32 + Math.random() * 12, -120 + Math.random() * 240);
    scene.add(cloudGroup);
    clouds.push(cloudGroup);
  }

  const butterflyColors = ['#F472B6', '#38BDF8', '#FBBF24', '#A78BFA'];
  for (let b = 0; b < 10; b++) {
    const bGroup = new THREE.Group();
    const wingMat = new THREE.MeshBasicMaterial({ color: butterflyColors[b % butterflyColors.length], side: THREE.DoubleSide });
    const wingL = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), wingMat);
    wingL.position.x = -0.25;
    const wingR = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), wingMat);
    wingR.position.x = 0.25;
    bGroup.add(wingL, wingR);
    scene.add(bGroup);

    butterflies.push({
      mesh: bGroup,
      angle: (b / 10) * Math.PI * 2,
      speed: 0.012 + Math.random() * 0.008,
      radius: 12 + Math.random() * 30,
      height: 1.8 + Math.random() * 2.5,
      centerX: (b % 2 === 0 ? 0 : -35),
      centerZ: (b % 2 === 0 ? 0 : 35)
    });
  }

  // =========================================================================
  // 22. 3D ORIGINAL CARTOON CHARACTER (Diverse Explorers Support)
  // =========================================================================
  const explorerMesh = new THREE.Group();
  let currentCharacterId: ExplorerCharacterId = DEFAULT_CHARACTER_ID;
  let initialChild = buildExplorerCharacter(currentCharacterId);
  explorerMesh.add(initialChild.group);
  explorerMesh.position.set(0, 0.2, 8); // Start in Central Meadow Hub
  scene.add(explorerMesh);

  let activeController = initialChild.controller;

  const setExplorerCharacter = (newCharId: ExplorerCharacterId) => {
    if (newCharId === currentCharacterId && explorerMesh.children.length > 0) return;
    currentCharacterId = newCharId;
    while (explorerMesh.children.length > 0) {
      explorerMesh.remove(explorerMesh.children[0]);
    }
    const newChild = buildExplorerCharacter(newCharId);
    explorerMesh.add(newChild.group);
    activeController = newChild.controller;
  };

  const setExplorerGender = (gender: 'girl' | 'boy') => {
    setExplorerCharacter(gender === 'boy' ? 'adventurous_kid' : 'curious_explorer');
  };

  return {
    scene,
    interactiveMap,
    zoneAnchors,
    obstacles,
    animatedElements: {
      clouds,
      ducks,
      butterflies,
      windmillBlades,
      observatoryDome,
      floatingItems,
      chimingKeys,
      hiddenStars,
      collectibles,
      roadBlockages,
      startGatePinwheels,
      startGateBell: bellGroup,
      startGateBalloons
    },
    explorerMesh,
    get childCharacterController() {
      return activeController;
    },
    setExplorerCharacter,
    setExplorerGender
  };
}
