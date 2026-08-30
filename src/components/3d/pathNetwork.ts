import * as THREE from 'three';
import { WorldZoneId } from '../../types';

export interface PathNode {
  id: string;
  x: number;
  z: number;
  zoneId?: WorldZoneId;
  label?: string;
  neighbors: string[];
}

// ---------------------------------------------------------------------------
// 1. MASTER ROAD WAYPOINT GRAPH (Plaza, Bridges, Roads, Outer Loop, & Zones)
// ---------------------------------------------------------------------------
export const ROAD_NODES: Record<string, PathNode> = {
  // Entrance Grand Avenue (Connecting Spawning Path -> Grand Gate -> Central Meadow Plaza)
  entrance_spawn: { id: 'entrance_spawn', x: 0, z: 24, label: 'Wonder Meadow Entrance', neighbors: ['entrance_gate'] },
  entrance_gate: { id: 'entrance_gate', x: 0, z: 14, label: 'Grand Wonder Gate', neighbors: ['entrance_spawn', 'plaza_center', 'bridge_south_in'] },

  // Central Meadow Plaza
  plaza_center: { id: 'plaza_center', x: 0, z: 0, label: 'Wonder Fountain Plaza', neighbors: ['entrance_gate', 'bridge_north_in', 'bridge_south_in', 'bridge_west_in', 'bridge_east_in', 'bridge_nw_in', 'bridge_ne_in', 'bridge_sw_in', 'bridge_se_in'] },

  // North Bridge (towards Story Meadow)
  bridge_north_in: { id: 'bridge_north_in', x: 0, z: -16, neighbors: ['plaza_center', 'bridge_north_out'] },
  bridge_north_out: { id: 'bridge_north_out', x: 0, z: -28, neighbors: ['bridge_north_in', 'road_north_1'] },
  road_north_1: { id: 'road_north_1', x: 0, z: -48, neighbors: ['bridge_north_out', 'road_north_2'] },
  road_north_2: { id: 'road_north_2', x: 0, z: -70, neighbors: ['road_north_1', 'zone_stories', 'loop_stories_animals', 'loop_stories_stars'] },
  zone_stories: { id: 'zone_stories', x: 0, z: -88, zoneId: 'stories', label: 'Story Meadow', neighbors: ['road_north_2'] },

  // South Bridge (towards Number Valley)
  bridge_south_in: { id: 'bridge_south_in', x: 0, z: 16, neighbors: ['plaza_center', 'bridge_south_out'] },
  bridge_south_out: { id: 'bridge_south_out', x: 0, z: 28, neighbors: ['bridge_south_in', 'road_south_1'] },
  road_south_1: { id: 'road_south_1', x: 0, z: 48, neighbors: ['bridge_south_out', 'road_south_2'] },
  road_south_2: { id: 'road_south_2', x: 0, z: 72, neighbors: ['road_south_1', 'zone_numbers', 'loop_numbers_creative', 'loop_numbers_fruits'] },
  zone_numbers: { id: 'zone_numbers', x: 0, z: 92, zoneId: 'numbers', label: 'Number Valley', neighbors: ['road_south_2'] },

  // West Bridge (towards Alphabet Grove)
  bridge_west_in: { id: 'bridge_west_in', x: -16, z: 0, neighbors: ['plaza_center', 'bridge_west_out'] },
  bridge_west_out: { id: 'bridge_west_out', x: -28, z: 0, neighbors: ['bridge_west_in', 'road_west_1'] },
  road_west_1: { id: 'road_west_1', x: -48, z: 0, neighbors: ['bridge_west_out', 'road_west_2'] },
  road_west_2: { id: 'road_west_2', x: -70, z: 0, neighbors: ['road_west_1', 'zone_alphabet', 'loop_alphabet_creative', 'loop_alphabet_animals'] },
  zone_alphabet: { id: 'zone_alphabet', x: -88, z: 0, zoneId: 'alphabet', label: 'Alphabet Grove', neighbors: ['road_west_2'] },

  // East Bridge (towards Music Garden)
  bridge_east_in: { id: 'bridge_east_in', x: 16, z: 0, neighbors: ['plaza_center', 'bridge_east_out'] },
  bridge_east_out: { id: 'bridge_east_out', x: 28, z: 0, neighbors: ['bridge_east_in', 'road_east_1'] },
  road_east_1: { id: 'road_east_1', x: 48, z: 0, neighbors: ['bridge_east_out', 'road_east_2'] },
  road_east_2: { id: 'road_east_2', x: 70, z: 0, neighbors: ['road_east_1', 'zone_music', 'loop_music_fruits', 'loop_music_stars'] },
  zone_music: { id: 'zone_music', x: 88, z: 0, zoneId: 'music', label: 'Music Garden', neighbors: ['road_east_2'] },

  // North-West Path (towards Animal Woods)
  bridge_nw_in: { id: 'bridge_nw_in', x: -14, z: -14, neighbors: ['plaza_center', 'bridge_nw_out'] },
  bridge_nw_out: { id: 'bridge_nw_out', x: -25, z: -25, neighbors: ['bridge_nw_in', 'road_nw_1'] },
  road_nw_1: { id: 'road_nw_1', x: -44, z: -44, neighbors: ['bridge_nw_out', 'road_nw_2'] },
  road_nw_2: { id: 'road_nw_2', x: -60, z: -58, neighbors: ['road_nw_1', 'zone_animals', 'loop_animals_alphabet', 'loop_animals_stories'] },
  zone_animals: { id: 'zone_animals', x: -74, z: -68, zoneId: 'animals', label: 'Animal Woods', neighbors: ['road_nw_2'] },

  // South-West Path (towards Creative Corner)
  bridge_sw_in: { id: 'bridge_sw_in', x: -14, z: 14, neighbors: ['plaza_center', 'bridge_sw_out'] },
  bridge_sw_out: { id: 'bridge_sw_out', x: -25, z: 25, neighbors: ['bridge_sw_in', 'road_sw_1'] },
  road_sw_1: { id: 'road_sw_1', x: -40, z: 42, neighbors: ['bridge_sw_out', 'road_sw_2'] },
  road_sw_2: { id: 'road_sw_2', x: -54, z: 62, neighbors: ['road_sw_1', 'zone_creative', 'loop_creative_alphabet', 'loop_creative_numbers'] },
  zone_creative: { id: 'zone_creative', x: -64, z: 78, zoneId: 'creative', label: 'Creative Corner', neighbors: ['road_sw_2'] },

  // South-East Path (towards Fruit Orchard)
  bridge_se_in: { id: 'bridge_se_in', x: 14, z: 14, neighbors: ['plaza_center', 'bridge_se_out'] },
  bridge_se_out: { id: 'bridge_se_out', x: 25, z: 25, neighbors: ['bridge_se_in', 'road_se_1'] },
  road_se_1: { id: 'road_se_1', x: 42, z: 42, neighbors: ['bridge_se_out', 'road_se_2'] },
  road_se_2: { id: 'road_se_2', x: 62, z: 60, neighbors: ['road_se_1', 'zone_fruits', 'loop_fruits_numbers', 'loop_fruits_music'] },
  zone_fruits: { id: 'zone_fruits', x: 78, z: 72, zoneId: 'fruits', label: 'Fruit Orchard', neighbors: ['road_se_2'] },

  // North-East Path (towards Star Observatory)
  bridge_ne_in: { id: 'bridge_ne_in', x: 14, z: -14, neighbors: ['plaza_center', 'bridge_ne_out'] },
  bridge_ne_out: { id: 'bridge_ne_out', x: 25, z: -25, neighbors: ['bridge_ne_in', 'road_ne_1'] },
  road_ne_1: { id: 'road_ne_1', x: 40, z: -42, neighbors: ['bridge_ne_out', 'road_ne_2'] },
  road_ne_2: { id: 'road_ne_2', x: 58, z: -60, neighbors: ['road_ne_1', 'zone_stars', 'loop_stars_music', 'loop_stars_stories'] },
  zone_stars: { id: 'zone_stars', x: 74, z: -72, zoneId: 'stars', label: 'Star Observatory', neighbors: ['road_ne_2'] },

  // Outer Loop Road Segments (Scenic Circular Tour Road connecting all adjacent zones)
  loop_alphabet_creative: { id: 'loop_alphabet_creative', x: -80, z: 40, neighbors: ['road_west_2', 'loop_creative_alphabet'] },
  loop_creative_alphabet: { id: 'loop_creative_alphabet', x: -74, z: 60, neighbors: ['loop_alphabet_creative', 'road_sw_2'] },

  loop_creative_numbers: { id: 'loop_creative_numbers', x: -35, z: 88, neighbors: ['road_sw_2', 'loop_numbers_creative'] },
  loop_numbers_creative: { id: 'loop_numbers_creative', x: -18, z: 92, neighbors: ['loop_creative_numbers', 'road_south_2'] },

  loop_numbers_fruits: { id: 'loop_numbers_fruits', x: 20, z: 92, neighbors: ['road_south_2', 'loop_fruits_numbers'] },
  loop_fruits_numbers: { id: 'loop_fruits_numbers', x: 45, z: 86, neighbors: ['loop_numbers_fruits', 'road_se_2'] },

  loop_fruits_music: { id: 'loop_fruits_music', x: 86, z: 45, neighbors: ['road_se_2', 'loop_music_fruits'] },
  loop_music_fruits: { id: 'loop_music_fruits', x: 88, z: 22, neighbors: ['loop_fruits_music', 'road_east_2'] },

  loop_music_stars: { id: 'loop_music_stars', x: 88, z: -24, neighbors: ['road_east_2', 'loop_stars_music'] },
  loop_stars_music: { id: 'loop_stars_music', x: 84, z: -48, neighbors: ['loop_music_stars', 'road_ne_2'] },

  loop_stars_stories: { id: 'loop_stars_stories', x: 44, z: -86, neighbors: ['road_ne_2', 'loop_stories_stars'] },
  loop_stories_stars: { id: 'loop_stories_stars', x: 20, z: -90, neighbors: ['loop_stars_stories', 'road_north_2'] },

  loop_stories_animals: { id: 'loop_stories_animals', x: -22, z: -90, neighbors: ['road_north_2', 'loop_animals_stories'] },
  loop_animals_stories: { id: 'loop_animals_stories', x: -48, z: -84, neighbors: ['loop_stories_animals', 'road_nw_2'] },

  loop_animals_alphabet: { id: 'loop_animals_alphabet', x: -84, z: -46, neighbors: ['road_nw_2', 'loop_alphabet_animals'] },
  loop_alphabet_animals: { id: 'loop_alphabet_animals', x: -88, z: -24, neighbors: ['loop_animals_alphabet', 'road_west_2'] }
};

// Ensure symmetric bidirectional connections
Object.values(ROAD_NODES).forEach((node) => {
  node.neighbors.forEach((nbrId) => {
    const nbr = ROAD_NODES[nbrId];
    if (nbr && !nbr.neighbors.includes(node.id)) {
      nbr.neighbors.push(node.id);
    }
  });
});

// Map of zone ID to its destination waypoint node ID
export const ZONE_NODE_MAP: Record<WorldZoneId, string> = {
  alphabet: 'zone_alphabet',
  numbers: 'zone_numbers',
  fruits: 'zone_fruits',
  animals: 'zone_animals',
  creative: 'zone_creative',
  music: 'zone_music',
  stories: 'zone_stories',
  stars: 'zone_stars'
};

// Road Corridor Segment Definition
export interface RoadSegment {
  id: string;
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  length: number;
}

// Generate unique non-duplicate road corridor segments from ROAD_NODES graph
export const ROAD_SEGMENTS: RoadSegment[] = (() => {
  const segments: RoadSegment[] = [];
  const visited = new Set<string>();

  Object.values(ROAD_NODES).forEach((nodeA) => {
    nodeA.neighbors.forEach((nbrId) => {
      const nodeB = ROAD_NODES[nbrId];
      if (!nodeB) return;
      const key1 = `${nodeA.id}--${nodeB.id}`;
      const key2 = `${nodeB.id}--${nodeA.id}`;
      if (!visited.has(key1) && !visited.has(key2)) {
        visited.add(key1);
        visited.add(key2);
        const len = Math.hypot(nodeB.x - nodeA.x, nodeB.z - nodeA.z);
        segments.push({
          id: key1,
          x1: nodeA.x,
          z1: nodeA.z,
          x2: nodeB.x,
          z2: nodeB.z,
          length: len
        });
      }
    });
  });

  return segments;
})();

// Road Boundary Constraints
export const ROAD_CORRIDOR_HALF_WIDTH = 2.85; // Comfortable wide cobblestone road corridor
export const PLAZA_RADIUS = 16.5; // Central fountain plaza exploration circle
export const ZONE_CLEARING_RADIUS = 14.5; // Activity courtyards around each zone landmark

export interface PathBlockageDef {
  id: string;
  name: string;
  icon: string;
  x: number;
  z: number;
  radius: number;
  themeColor: string;
  question: string;
  rewardText: string;
  clearedMessage: string;
}

export const PATH_BLOCKAGES: Record<string, PathBlockageDef> = {
  'blockage_bunny': {
    id: 'blockage_bunny',
    name: 'Sleeping Bunny',
    icon: '🐰',
    x: 0,
    z: -48,
    radius: 2.8,
    themeColor: '#EC4899',
    question: 'A cute bunny is snoozing peacefully on the road! Feed a golden carrot to wake it gently?',
    rewardText: '+1 Star, +5 Gold Coins & Golden Carrot Badge!',
    clearedMessage: 'The bunny munched the crunchy carrot happily and hopped to the flower garden!'
  },
  'blockage_log': {
    id: 'blockage_log',
    name: 'Rainbow Flower Log',
    icon: '🌸',
    x: -48,
    z: 0,
    radius: 2.8,
    themeColor: '#8B5CF6',
    question: 'A mossy log covered in glowing rainbow mushrooms blocks the path! Lift with your star magic?',
    rewardText: '+1 Star, +5 Gold Coins & Magic Blossom Badge!',
    clearedMessage: 'The log bloomed into a sparkling rainbow arch over the cobblestones!'
  },
  'blockage_ducklings': {
    id: 'blockage_ducklings',
    name: 'Duckling Family Parade',
    icon: '🦆',
    x: 0,
    z: 48,
    radius: 2.8,
    themeColor: '#F59E0B',
    question: 'Mama Duck and 3 fuzzy ducklings are crossing the bridge! Help them paddle safely into the pond?',
    rewardText: '+1 Star, +5 Gold Coins & Lucky Feather Badge!',
    clearedMessage: 'Quack! The ducklings splashed into the clear stream with joyful smiles!'
  },
  'blockage_gate': {
    id: 'blockage_gate',
    name: 'Golden Melody Star Gate',
    icon: '⭐',
    x: 48,
    z: 0,
    radius: 2.8,
    themeColor: '#0284C7',
    question: 'A carved wooden gate with a spinning star lock is closed. Turn the golden star key to open?',
    rewardText: '+1 Star, +5 Gold Coins & Musical Star Key!',
    clearedMessage: 'Chime! The golden star key turned and the music gates swung wide open!'
  }
};

// Zone Destinations Coordinates for Courtyard Areas
export const ZONE_CENTERS: { x: number; z: number; id: WorldZoneId }[] = [
  { x: -88, z: 0, id: 'alphabet' },
  { x: 0, z: 92, id: 'numbers' },
  { x: 78, z: 72, id: 'fruits' },
  { x: -74, z: -68, id: 'animals' },
  { x: -64, z: 78, id: 'creative' },
  { x: 88, z: 0, id: 'music' },
  { x: 0, z: -88, id: 'stories' },
  { x: 74, z: -72, id: 'stars' }
];

/**
 * Strict Road Network Projection:
 * Clamps any 2D position (x, z) strictly to the established road corridors,
 * Central Plaza, and Zone Activity Courtyards, preventing character from walking off-road!
 */
export function clampPositionToRoadNetwork(
  targetX: number,
  targetZ: number,
  unclearedBlockageIds: Set<string> = new Set()
): { x: number; z: number; isBlocked?: boolean; blockageId?: string } {
  // 1. Check uncleared path blockages collision
  for (const bId of unclearedBlockageIds) {
    const blockage = PATH_BLOCKAGES[bId];
    if (blockage) {
      const distToBlock = Math.hypot(targetX - blockage.x, targetZ - blockage.z);
      if (distToBlock < blockage.radius + 0.5) {
        // Push back outside blockage radius
        const angle = Math.atan2(targetZ - blockage.z, targetX - blockage.x);
        const safeX = blockage.x + Math.cos(angle) * (blockage.radius + 0.6);
        const safeZ = blockage.z + Math.sin(angle) * (blockage.radius + 0.6);
        return { x: safeX, z: safeZ, isBlocked: true, blockageId: bId };
      }
    }
  }

  // 2. Check if inside Central Meadow Plaza (circle at 0, 0)
  const distPlaza = Math.hypot(targetX, targetZ);
  if (distPlaza <= PLAZA_RADIUS) {
    return { x: targetX, z: targetZ };
  }

  // 3. Check if inside any Zone Activity Courtyard
  for (const zone of ZONE_CENTERS) {
    const distZone = Math.hypot(targetX - zone.x, targetZ - zone.z);
    if (distZone <= ZONE_CLEARING_RADIUS) {
      return { x: targetX, z: targetZ };
    }
  }

  // 4. Check all road corridor segments
  let closestDistSq = Infinity;
  let bestProjX = targetX;
  let bestProjZ = targetZ;
  let isInsideAnyCorridor = false;

  for (const seg of ROAD_SEGMENTS) {
    const dx = seg.x2 - seg.x1;
    const dz = seg.z2 - seg.z1;
    const lenSq = dx * dx + dz * dz;

    if (lenSq < 0.0001) continue;

    // Projection parameter t clamped to [0, 1]
    const t = Math.max(0, Math.min(1, ((targetX - seg.x1) * dx + (targetZ - seg.z1) * dz) / lenSq));
    const projX = seg.x1 + t * dx;
    const projZ = seg.z1 + t * dz;

    const distSq = (targetX - projX) ** 2 + (targetZ - projZ) ** 2;

    if (distSq <= ROAD_CORRIDOR_HALF_WIDTH * ROAD_CORRIDOR_HALF_WIDTH) {
      isInsideAnyCorridor = true;
      break;
    }

    if (distSq < closestDistSq) {
      closestDistSq = distSq;
      bestProjX = projX;
      bestProjZ = projZ;
    }
  }

  if (isInsideAnyCorridor) {
    return { x: targetX, z: targetZ };
  }

  // Also compare distance to Central Plaza boundary
  const anglePlaza = Math.atan2(targetZ, targetX);
  const plazaBoundaryX = Math.cos(anglePlaza) * (PLAZA_RADIUS - 0.2);
  const plazaBoundaryZ = Math.sin(anglePlaza) * (PLAZA_RADIUS - 0.2);
  const distToPlazaEdgeSq = (targetX - plazaBoundaryX) ** 2 + (targetZ - plazaBoundaryZ) ** 2;

  if (distToPlazaEdgeSq < closestDistSq) {
    closestDistSq = distToPlazaEdgeSq;
    bestProjX = plazaBoundaryX;
    bestProjZ = plazaBoundaryZ;
  }

  // Also compare distance to nearest zone courtyard boundary
  for (const zone of ZONE_CENTERS) {
    const ang = Math.atan2(targetZ - zone.z, targetX - zone.x);
    const zBx = zone.x + Math.cos(ang) * (ZONE_CLEARING_RADIUS - 0.2);
    const zBz = zone.z + Math.sin(ang) * (ZONE_CLEARING_RADIUS - 0.2);
    const dSq = (targetX - zBx) ** 2 + (targetZ - zBz) ** 2;
    if (dSq < closestDistSq) {
      closestDistSq = dSq;
      bestProjX = zBx;
      bestProjZ = zBz;
    }
  }

  return { x: bestProjX, z: bestProjZ };
}

// Find closest road node to any arbitrary [x, z] position
export function findClosestRoadNode(x: number, z: number): string {
  let closestId = 'plaza_center';
  let minDistSq = Infinity;

  Object.entries(ROAD_NODES).forEach(([id, node]) => {
    const dSq = (node.x - x) ** 2 + (node.z - z) ** 2;
    if (dSq < minDistSq) {
      minDistSq = dSq;
      closestId = id;
    }
  });

  return closestId;
}

// ---------------------------------------------------------------------------
// 2. DIJKSTRA SHORTEST-PATH FINDER ALONG ROAD NETWORK
// ---------------------------------------------------------------------------
export function findRoadPath(
  startX: number,
  startZ: number,
  targetNodeId: string
): THREE.Vector3[] {
  const startNodeId = findClosestRoadNode(startX, startZ);
  if (!ROAD_NODES[startNodeId] || !ROAD_NODES[targetNodeId]) {
    return [new THREE.Vector3(startX, 0.2, startZ)];
  }

  // If already at target
  if (startNodeId === targetNodeId) {
    const targetNode = ROAD_NODES[targetNodeId];
    return [
      new THREE.Vector3(startX, 0.2, startZ),
      new THREE.Vector3(targetNode.x, 0.2, targetNode.z)
    ];
  }

  // Priority Queue / Dijkstra
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  Object.keys(ROAD_NODES).forEach((id) => {
    distances[id] = Infinity;
    previous[id] = null;
    unvisited.add(id);
  });

  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let lowestDist = Infinity;

    unvisited.forEach((id) => {
      if (distances[id] < lowestDist) {
        lowestDist = distances[id];
        currentId = id;
      }
    });

    if (!currentId || lowestDist === Infinity || currentId === targetNodeId) {
      break;
    }

    unvisited.delete(currentId);
    const currNode = ROAD_NODES[currentId];

    currNode.neighbors.forEach((nbrId) => {
      if (unvisited.has(nbrId)) {
        const nbrNode = ROAD_NODES[nbrId];
        const edgeDist = Math.hypot(currNode.x - nbrNode.x, currNode.z - nbrNode.z);
        const alt = distances[currentId!] + edgeDist;
        if (alt < distances[nbrId]) {
          distances[nbrId] = alt;
          previous[nbrId] = currentId;
        }
      }
    });
  }

  // Reconstruct path
  const pathNodeIds: string[] = [];
  let curr: string | null = targetNodeId;
  while (curr) {
    pathNodeIds.unshift(curr);
    curr = previous[curr];
  }

  if (pathNodeIds.length === 0 || pathNodeIds[0] !== startNodeId) {
    // Fallback direct
    const targetNode = ROAD_NODES[targetNodeId];
    return [
      new THREE.Vector3(startX, 0.2, startZ),
      new THREE.Vector3(targetNode.x, 0.2, targetNode.z)
    ];
  }

  const resultPoints: THREE.Vector3[] = [];
  // Start from character current position
  resultPoints.push(new THREE.Vector3(startX, 0.2, startZ));

  // Add waypoint nodes
  pathNodeIds.forEach((id) => {
    const node = ROAD_NODES[id];
    resultPoints.push(new THREE.Vector3(node.x, 0.2, node.z));
  });

  return resultPoints;
}

// ---------------------------------------------------------------------------
// 3. INTERACTIVE 3D GUIDED TRAIL / BREADCRUMB ROUTE VISUALIZER
// ---------------------------------------------------------------------------
export class GuidedTrailVisualizer {
  public group: THREE.Group;
  private scene: THREE.Scene;
  private waypoints: THREE.Vector3[] = [];
  private stepDots: THREE.Mesh[] = [];
  private targetBeacon: THREE.Group;
  private beaconGlowRing: THREE.Mesh;
  private animOffset = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'guided_trail_group';

    // Target Destination Beacon (Game Waypoint Marker)
    this.targetBeacon = new THREE.Group();
    const beaconMat = new THREE.MeshStandardMaterial({
      color: '#FACC15',
      emissive: '#F59E0B',
      emissiveIntensity: 0.8,
      roughness: 0.2
    });

    const starMarker = new THREE.Mesh(new THREE.OctahedronGeometry(1.1, 0), beaconMat);
    starMarker.position.y = 3.2;

    const ringGeo = new THREE.RingGeometry(1.6, 2.2, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#FACC15',
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    this.beaconGlowRing = new THREE.Mesh(ringGeo, ringMat);
    this.beaconGlowRing.position.y = 0.22;

    const beamGeo = new THREE.CylinderGeometry(0.1, 0.8, 6, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: '#FEF08A',
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 3.0;

    this.targetBeacon.add(starMarker, this.beaconGlowRing, beam);
    this.targetBeacon.visible = false;
    this.group.add(this.targetBeacon);

    this.scene.add(this.group);
  }

  public setPath(points: THREE.Vector3[], targetLabel?: string) {
    this.waypoints = points;

    // Clear old dots
    this.stepDots.forEach((dot) => this.group.remove(dot));
    this.stepDots = [];

    if (points.length < 2) {
      this.targetBeacon.visible = false;
      return;
    }

    // Set Target Beacon at final destination point
    const lastPt = points[points.length - 1];
    this.targetBeacon.position.set(lastPt.x, 0, lastPt.z);
    this.targetBeacon.visible = true;

    // Generate Golden Glowing Stepping Dots along the route
    const dotGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.12, 12);
    const dotMat = new THREE.MeshStandardMaterial({
      color: '#FBBF24',
      emissive: '#F59E0B',
      emissiveIntensity: 0.9,
      roughness: 0.2
    });

    const arrowMat = new THREE.MeshBasicMaterial({
      color: '#FFFFFF'
    });

    for (let i = 0; i < points.length - 1; i++) {
      const pA = points[i];
      const pB = points[i + 1];
      const dist = pA.distanceTo(pB);
      const stepCount = Math.max(1, Math.floor(dist / 2.8));

      for (let s = 1; s <= stepCount; s++) {
        const t = s / (stepCount + 1);
        const px = pA.x + (pB.x - pA.x) * t;
        const pz = pA.z + (pB.z - pA.z) * t;

        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.set(px, 0.18, pz);

        // Direction chevron pointing forward along the path
        const chevron = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.44, 3), arrowMat);
        chevron.rotateX(-Math.PI / 2);
        const ang = Math.atan2(pB.x - pA.x, pB.z - pA.z);
        chevron.rotation.z = -ang;
        chevron.position.set(0, 0.08, 0);
        dot.add(chevron);

        this.group.add(dot);
        this.stepDots.push(dot);
      }
    }
  }

  public update(delta: number) {
    if (!this.targetBeacon.visible) return;

    this.animOffset += delta * 3.5;

    // Animate target beacon
    this.targetBeacon.children[0].rotation.y += delta * 2;
    this.targetBeacon.children[0].position.y = 3.2 + Math.sin(this.animOffset) * 0.35;
    const ringScale = 1 + Math.sin(this.animOffset * 2) * 0.15;
    this.beaconGlowRing.scale.set(ringScale, ringScale, 1);

    // Pulse stepping dots with light animation traveling along the path
    this.stepDots.forEach((dot, idx) => {
      const pulse = Math.sin(this.animOffset * 2 - idx * 0.4);
      const scale = 0.85 + (pulse + 1) * 0.2;
      dot.scale.set(scale, 1, scale);
      dot.position.y = 0.18 + Math.max(0, pulse * 0.08);
    });
  }

  public clear() {
    this.waypoints = [];
    this.stepDots.forEach((dot) => this.group.remove(dot));
    this.stepDots = [];
    this.targetBeacon.visible = false;
  }
}
