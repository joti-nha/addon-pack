// ==========================================
// DYNAMIC TOWER STRUCTURE SPAWNER SYSTEM
// ==========================================
// Solves Minecraft Bedrock chunk-border clipping by summoning the Tower structure
// at the outer edge of the active simulation distance (e.g. 6th-7th chunk when sim is 8).
// Probes and updates simulation distance dynamically every 1 minute.
// ==========================================

import { world, system } from "@minecraft/server";

const STRUCTURE_NAME = "mystructure:Tower";
const MIN_DISTANCE_BETWEEN_TOWERS = 350; // Blocks between towers to prevent clustering
const CHECK_INTERVAL_TICKS = 1200;       // Exactly 1 minute (20 ticks * 60)
const DYNAMIC_PROP_KEY = "rpg_towers_history";

// In-memory cache of spawned tower centers: [{ x, z }]
let spawnedTowers = [];

let historyLoaded = false;

// Initialize history from world dynamic properties
function loadTowerHistory() {
  try {
    const raw = world.getDynamicProperty(DYNAMIC_PROP_KEY);
    if (typeof raw === "string") {
      spawnedTowers = JSON.parse(raw);
    }
    historyLoaded = true;
  } catch (e) {
    // Deferred until world database is ready
  }
}

function saveTowerHistory(x, z) {
  try {
    if (!historyLoaded) loadTowerHistory();
    spawnedTowers.push({ x, z });
    // Keep last 100 towers to prevent memory bloat
    if (spawnedTowers.length > 100) spawnedTowers.shift();
    world.setDynamicProperty(DYNAMIC_PROP_KEY, JSON.stringify(spawnedTowers));
  } catch (e) {}
}


/**
 * Detects the active simulation distance (in chunks) by testing block availability outward.
 * Probes along 4 cardinal directions and returns the furthest loaded chunk (between 4 and 12).
 */
function detectSimulationDistance(dimension, player) {
  let maxSimChunk = 4; // Bedrock minimum simulation distance is 4 chunks

  const pX = Math.floor(player.location.x);
  const pY = Math.max(-50, Math.min(200, Math.floor(player.location.y)));
  const pZ = Math.floor(player.location.z);

  // Probe outward from 4 to 12 chunks (1 chunk = 16 blocks)
  for (let c = 4; c <= 12; c++) {
    const offset = c * 16;
    let loadedCount = 0;

    const probes = [
      { x: pX + offset, y: pY, z: pZ },
      { x: pX - offset, y: pY, z: pZ },
      { x: pX, y: pY, z: pZ + offset },
      { x: pX, y: pY, z: pZ - offset }
    ];

    for (const pos of probes) {
      try {
        const block = dimension.getBlock(pos);
        if (block) loadedCount++;
      } catch (e) {
        // BlockUnloadedError means chunk is outside simulation distance
      }
    }

    // If at least 2 directions are loaded, chunk radius `c` is inside simulation distance
    if (loadedCount >= 2) {
      maxSimChunk = c;
    } else {
      break; // Stop at first boundary failure
    }
  }

  return maxSimChunk;
}

/**
 * Finds the top solid surface Y coordinate at (x, z).
 * Returns null if location is ocean/water/lava or outside reasonable terrain heights.
 */
function findSurfaceY(dimension, x, z) {
  try {
    for (let y = 120; y >= 60; y--) {
      const block = dimension.getBlock({ x, y, z });
      if (!block || block.isAir) continue;

      const type = block.typeId;
      // Valid Overworld terrain blocks
      if (
        type === "minecraft:grass_block" ||
        type === "minecraft:dirt" ||
        type === "minecraft:podzol" ||
        type === "minecraft:coarse_dirt" ||
        type === "minecraft:sand" ||
        type === "minecraft:sandstone" ||
        type === "minecraft:stone"
      ) {
        return y;
      }

      // Avoid spawning inside deep oceans, rivers, or lava lakes
      if (type === "minecraft:water" || type === "minecraft:lava") {
        return null;
      }
    }
  } catch (e) {}
  return null;
}

/**
 * Checks if a given coordinate is sufficiently far from previously spawned towers.
 */
function isFarFromOtherTowers(x, z) {
  if (!historyLoaded) loadTowerHistory();
  for (const t of spawnedTowers) {
    const dx = t.x - x;
    const dz = t.z - z;
    if (Math.sqrt(dx * dx + dz * dz) < MIN_DISTANCE_BETWEEN_TOWERS) {
      return false;
    }
  }
  return true;
}

/**
 * Spawns the complete, intact Tower at (x, y - 15, z).
 * Preserves the 15-block underground foundation with zero missing blocks.
 */
function spawnTower(dimension, x, surfaceY, z) {
  const placementY = surfaceY - 15;
  const loc = { x, y: placementY, z };

  let placed = false;
  // Primary method: StructureManager.place
  try {
    if (world.structureManager && typeof world.structureManager.place === "function") {
      world.structureManager.place(STRUCTURE_NAME, dimension, loc);
      placed = true;
    }
  } catch (e) {
    placed = false;
  }

  // Robust fallback: native structure load command
  if (!placed) {
    try {
      dimension.runCommandAsync(`structure load ${STRUCTURE_NAME} ${x} ${placementY} ${z}`);
      placed = true;
    } catch (err) {}
  }

  if (placed) {
    saveTowerHistory(x, z);
  }
}

// Player position tracking to only attempt generation when exploring
const lastPlayerCheckPos = new Map();

// Main Generation Loop - DISABLED (structure summoning turned off)
system.runInterval(() => {
  return; // Disabled: structure summoning turned off
  try {
    const players = world.getAllPlayers();
    if (!players || players.length === 0) return;

    for (const player of players) {
      if (!player.isValid()) continue;

      const dim = player.dimension;
      // Towers only generate in the Overworld
      if (dim.id !== "minecraft:overworld") continue;

      const pLoc = player.location;
      const lastPos = lastPlayerCheckPos.get(player.id);

      // Check if player has moved at least 64 blocks since last check (prevents AFK tower spam)
      if (lastPos) {
        const dx = pLoc.x - lastPos.x;
        const dz = pLoc.z - lastPos.z;
        if (Math.sqrt(dx * dx + dz * dz) < 64) {
          continue;
        }
      }
      lastPlayerCheckPos.set(player.id, { x: pLoc.x, z: pLoc.z });

      // 1. Detect current active simulation distance dynamically
      const currentSimChunks = detectSimulationDistance(dim, player);

      // 2. Select target chunk at 6th-7th chunk (mostly 7th chunk for 8-chunk sim)
      // e.g. for sim=8 -> target is 7. For sim=6 -> target is 5. For sim=4 -> target is 3.
      const targetChunkDist = Math.max(3, currentSimChunks - 1);
      const targetDistanceBlocks = targetChunkDist * 16;

      // 3. 40% chance per minute of generating a tower when exploring new areas
      if (Math.random() > 0.40) continue;

      // 4. Test 8 surrounding angles at the target chunk distance
      const angles = [0, 45, 90, 135, 180, 225, 270, 315];
      // Shuffle angles
      for (let i = angles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [angles[i], angles[j]] = [angles[j], angles[i]];
      }

      for (const deg of angles) {
        const rad = (deg * Math.PI) / 180;
        // Snap to chunk origin (multiple of 16) for clean alignment
        const candidateX = Math.floor((pLoc.x + Math.cos(rad) * targetDistanceBlocks) / 16) * 16;
        const candidateZ = Math.floor((pLoc.z + Math.sin(rad) * targetDistanceBlocks) / 16) * 16;

        if (!isFarFromOtherTowers(candidateX, candidateZ)) continue;

        const surfaceY = findSurfaceY(dim, candidateX + 13, candidateZ + 13); // Center of 27x27 tower
        if (surfaceY === null) continue;

        // Verify all 4 footprint corners have solid terrain (avoid floating on cliffs)
        const corner1 = findSurfaceY(dim, candidateX, candidateZ);
        const corner2 = findSurfaceY(dim, candidateX + 26, candidateZ);
        const corner3 = findSurfaceY(dim, candidateX, candidateZ + 26);
        const corner4 = findSurfaceY(dim, candidateX + 26, candidateZ + 26);

        if (corner1 === null || corner2 === null || corner3 === null || corner4 === null) continue;
        if (Math.abs(corner1 - corner2) > 8 || Math.abs(corner3 - corner4) > 8) continue; // Avoid extreme slopes

        // Found perfect location! Spawn the full 100% tower
        spawnTower(dim, candidateX, surfaceY, candidateZ);
        break; // Only 1 tower per check cycle
      }
    }
  } catch (e) {}
}, CHECK_INTERVAL_TICKS);
