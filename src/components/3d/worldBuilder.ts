import * as THREE from 'three';
import { WORLD_ZONES, ALPHABET_DATA, FRUITS_DATA, ANIMALS_DATA, NUMBERS_DATA } from '../../data/worldZones';
import { WorldZoneId, ExplorerCharacterId } from '../../types';
import { EXPLORER_CHARACTERS, DEFAULT_CHARACTER_ID } from '../../data/charactersData';

export interface InteractiveItemTarget {
  type: 'zone' | 'letter' | 'fruit' | 'animal' | 'number' | 'star' | 'guide' | 'xylophone_key' | 'obstacle';
  id: string;
  data?: unknown;
  position: THREE.Vector3;
  label: string;
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
  animatedElements: {
    clouds: THREE.Group[];
    ducks: { mesh: THREE.Group; angle: number; speed: number; radius: number; centerX: number; centerZ: number }[];
    butterflies: { mesh: THREE.Group; angle: number; speed: number; radius: number; height: number; centerX: number; centerZ: number }[];
    windmillBlades: THREE.Group | null;
    observatoryDome: THREE.Mesh | null;
    floatingItems: THREE.Object3D[];
    chimingKeys: { mesh: THREE.Mesh; noteIndex: number }[];
    hiddenStars: { mesh: THREE.Group; id: string; collected: boolean }[];
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

  if (characterId === 'curious_explorer') {
    // Pip - Curious Explorer
    shirtColor = '#0284C7';
    accentColor = '#FBBF24';
    pantsColor = '#1E3A8A';
    shoeColor = '#F59E0B';
    hairColor = '#B45309';
    backpackColor = '#F59E0B';
  } else if (characterId === 'little_inventor' || characterId === 'tiny_inventor') {
    // Milo - Little Inventor
    shirtColor = '#D97706';
    accentColor = '#0284C7';
    pantsColor = '#334155';
    shoeColor = '#EF4444';
    hairColor = '#92400E';
    backpackColor = '#059669';
  } else if (characterId === 'nature_explorer') {
    // Willow - Nature Explorer
    shirtColor = '#16A34A';
    accentColor = '#86EFAC';
    pantsColor = '#14532D';
    shoeColor = '#F59E0B';
    hairColor = '#15803D';
    backpackColor = '#F59E0B';
  } else if (characterId === 'creative_dreamer' || characterId === 'little_artist') {
    // Luna - Creative Dreamer
    shirtColor = '#9333EA';
    accentColor = '#F472B6';
    pantsColor = '#3B82F6';
    shoeColor = '#EC4899';
    hairColor = '#6D28D9';
    backpackColor = '#F59E0B';
  } else if (characterId === 'forest_fawn' || characterId === 'forest_friend') {
    // Bramble - Gentle Meadow Fawn
    shirtColor = '#B45309';
    accentColor = '#16A34A';
    pantsColor = '#FEF3C7';
    shoeColor = '#F59E0B';
    hairColor = '#D97706';
    backpackColor = '#16A34A';
  } else if (characterId === 'little_adventurer' || characterId === 'adventurous_kid') {
    // Koa - Little Adventurer
    shirtColor = '#EA580C';
    accentColor = '#0284C7';
    pantsColor = '#1E293B';
    shoeColor = '#EF4444';
    hairColor = '#3E2723';
    backpackColor = '#0284C7';
  } else if (characterId === 'star_sprite' || characterId === 'magical_companion') {
    // Nova - Star Sprite
    shirtColor = '#8B5CF6';
    accentColor = '#FDE047';
    pantsColor = '#C084FC';
    shoeColor = '#38BDF8';
    hairColor = '#DDD6FE';
    backpackColor = '#F472B6';
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

  // Optional Character Wings (for Nova) & Ears/Antlers (for Bramble)
  let wingsGroup: THREE.Group | undefined;
  let earsList: THREE.Group[] | undefined;

  // 1. Torso & Clothing (Body Group)
  const bodyGroup = new THREE.Group();
  bodyGroup.position.set(0, 0.72, 0);

  if (characterId === 'forest_fawn' || characterId === 'forest_friend') {
    // Bramble Fawn Body with White Spotted Chest
    const fawnBody = new THREE.Mesh(new THREE.SphereGeometry(0.44, 16, 16), new THREE.MeshStandardMaterial({ color: '#D97706', roughness: 0.6 }));
    fawnBody.scale.set(1.0, 1.1, 0.95);
    fawnBody.castShadow = true;
    bodyGroup.add(fawnBody);

    const fawnChest = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 14), new THREE.MeshStandardMaterial({ color: '#FEF3C7', roughness: 0.5 }));
    fawnChest.position.set(0, 0, 0.16);
    bodyGroup.add(fawnChest);

    // Fawn Tail
    const fawnTail = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), new THREE.MeshStandardMaterial({ color: '#FEF3C7', roughness: 0.7 }));
    fawnTail.position.set(0, -0.15, -0.42);
    bodyGroup.add(fawnTail);

    // Clover Collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.08, 8, 16), new THREE.MeshStandardMaterial({ color: '#16A34A' }));
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.24;
    bodyGroup.add(collar);
  } else if (characterId === 'star_sprite' || characterId === 'magical_companion') {
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
    // Human Child Torso & Backpack
    const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.58, 14), shirtMat);
    torsoMesh.castShadow = true;
    bodyGroup.add(torsoMesh);

    // Collar / Scarf
    const collarMesh = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 8, 16), shirtAccentMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.y = 0.28;
    bodyGroup.add(collarMesh);

    // Badges / Emblems
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

    // Extra tool/brush on side
    if (characterId === 'creative_dreamer' || characterId === 'little_artist') {
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

  const headSkin = (characterId === 'forest_fawn' || characterId === 'forest_friend')
    ? new THREE.MeshStandardMaterial({ color: '#D97706', roughness: 0.6 })
    : (characterId === 'star_sprite' || characterId === 'magical_companion')
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

  const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), pupilMat);
  pupilL.position.set(-0.17, 0.06, 0.48);
  const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), pupilMat);
  pupilR.position.set(0.17, 0.06, 0.48);

  const sparkleL = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), sparkleMat);
  sparkleL.position.set(-0.14, 0.09, 0.53);
  const sparkleR = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), sparkleMat);
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
    // Bramble Fawn Velvet Ears & Moss Antlers with Blossoms
    const earMat = new THREE.MeshStandardMaterial({ color: '#D97706', roughness: 0.6 });
    const earInnerMat = new THREE.MeshStandardMaterial({ color: '#FEF3C7', roughness: 0.5 });

    const earLGroup = new THREE.Group();
    earLGroup.position.set(-0.36, 0.32, 0);
    const earLMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.10, 0.45, 8, 12), earMat);
    earLMesh.rotation.z = -0.55;
    const earLInner = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.34, 8, 12), earInnerMat);
    earLInner.rotation.z = -0.55;
    earLInner.position.set(-0.02, 0, 0.04);
    earLGroup.add(earLMesh, earLInner);

    const earRGroup = new THREE.Group();
    earRGroup.position.set(0.36, 0.32, 0);
    const earRMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.10, 0.45, 8, 12), earMat);
    earRMesh.rotation.z = 0.55;
    const earRInner = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.34, 8, 12), earInnerMat);
    earRInner.rotation.z = 0.55;
    earRInner.position.set(0.02, 0, 0.04);
    earRGroup.add(earRMesh, earRInner);

    headGroup.add(earLGroup, earRGroup);
    earsList = [earLGroup, earRGroup];

    // Cute Fawn Nose
    const fawnNose = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: '#451A03' }));
    fawnNose.position.set(0, -0.06, 0.50);
    headGroup.add(fawnNose);

    // Mossy Antlers with Blossoms
    const antlerMat = new THREE.MeshStandardMaterial({ color: '#15803D', roughness: 0.7 });
    const blossomMat = new THREE.MeshStandardMaterial({ color: '#F472B6', roughness: 0.3 });

    const antL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.4, 6), antlerMat);
    antL.position.set(-0.18, 0.58, 0.05);
    antL.rotation.z = -0.25;
    const blossomL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), blossomMat);
    blossomL.position.set(-0.24, 0.76, 0.05);

    const antR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.4, 6), antlerMat);
    antR.position.set(0.18, 0.58, 0.05);
    antR.rotation.z = 0.25;
    const blossomR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), blossomMat);
    blossomR.position.set(0.24, 0.76, 0.05);

    headGroup.add(antL, blossomL, antR, blossomR);
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

  // 7. Stone Paths with Floral Borders (Connecting Central Hub to all destinations)
  const pathMat = new THREE.MeshStandardMaterial({ color: '#EFE9DE', roughness: 0.95, flatShading: true });
  const darkStoneMat = new THREE.MeshStandardMaterial({ color: '#D6CEBE', roughness: 0.9 });

  const createPathSegment = (startX: number, startZ: number, endX: number, endZ: number, width = 2.4) => {
    const dist = Math.hypot(endX - startX, endZ - startZ);
    const steps = Math.max(3, Math.floor(dist / 2.6));

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const px = startX + (endX - startX) * t + (Math.sin(s * 1.5) * 0.6);
      const pz = startZ + (endZ - startZ) * t + (Math.cos(s * 1.5) * 0.6);

      const stone = new THREE.Mesh(
        new THREE.CylinderGeometry(width * 0.48 + Math.sin(s) * 0.12, width * 0.52, 0.14, 8),
        s % 2 === 0 ? pathMat : darkStoneMat
      );
      stone.position.set(px, 0.1, pz);
      stone.rotation.y = s * 0.4;
      stone.receiveShadow = true;
      scene.add(stone);
    }
  };

  // Branching Paths from Center
  WORLD_ZONES.forEach((zone) => {
    const [zx, , zz] = zone.coordinates;
    createPathSegment(0, 0, zx, zz);
    zoneAnchors.set(zone.id, new THREE.Vector3(zx, 0, zz));
  });

  // Interconnecting Secondary Paths
  createPathSegment(-90, 0, -65, 80); // Alphabet Grove to Creative Corner
  createPathSegment(-75, -70, 0, -90); // Animal Woods to Story Meadow
  createPathSegment(0, 95, 80, 75); // Number Valley to Fruit Orchard
  createPathSegment(90, 0, 75, -75); // Music Garden to Star Observatory

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
  // 18. HIDDEN WONDER STARS (10 Secret Collectible Stars)
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
  // 19. CLOUDS & BUTTERFLIES
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
  // 20. 3D ORIGINAL CARTOON CHARACTER (Diverse Explorers Support)
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
    animatedElements: {
      clouds,
      ducks,
      butterflies,
      windmillBlades,
      observatoryDome,
      floatingItems,
      chimingKeys,
      hiddenStars
    },
    explorerMesh,
    get childCharacterController() {
      return activeController;
    },
    setExplorerCharacter,
    setExplorerGender
  };
}
