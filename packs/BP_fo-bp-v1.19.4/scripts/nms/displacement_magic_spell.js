import { world, system } from "@minecraft/server";

world.afterEvents.entitySpawn.subscribe((eventData) => {
  const displacementMagicSpell = [
    "ntk:miscellaneous_displacement_magic_spell_1",
    "ntk:miscellaneous_displacement_magic_spell_2",
    "ntk:miscellaneous_displacement_magic_spell_3"
  ];
  if (!displacementMagicSpell.includes(eventData.entity.typeId)) return;
  const magicSpell = eventData.entity;
  const magicLocation = magicSpell.location;
  
  function detectNearbyEntities(entity, dimension, radius) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const areaLocation = {
            x: magicLocation.x + dx,
            y: magicLocation.y + dy,
            z: magicLocation.z + dz
          };
          const nearEntities = world.getDimension(dimension).getEntities(areaLocation);
          if (nearEntities !== undefined && nearEntities.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }
  function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function randomTeleport(entity, dimension, range) {
    const mobLocation = entity.location;
    let teleportation = false;
    let minRangeX = mobLocation.x - range;
    let maxRangeX = mobLocation.x + range;
    let minRangeY = Math.max(mobLocation.y - range, -62);
    let maxRangeY = Math.min(mobLocation.y + range, 319);
    let minRangeZ = mobLocation.z - range;
    let maxRangeZ = mobLocation.z + range;
    let validBlock = null;
    const attempts = (range * range * range);
    const isSafeAirOrWater = (block) => {
      return block.isAir || ["minecraft:water", "minecraft:flowing_water"].includes(block.typeId);
    };
    const isSolidGround = (block) => {
      return (
        !block.isAir &&
        !["minecraft:water", "minecraft:flowing_water", "minecraft:lava", "minecraft:flowing_lava"].includes(block.typeId)
      );
    };
    const teleportWithEffects = (entity, location) => {
      entity.teleport(location);
      entity.dimension.playSound("mob.endermen.portal", location, { pitch: 1.0, volume: 1.0 });
      entity.dimension.spawnParticle("ntk:displacement_magic_spell_teleport_particle", location);
    };
    for (let i = 0; i < attempts; i++) {
      let randomX = randomRange(minRangeX, maxRangeX);
      let randomY = randomRange(minRangeY, maxRangeY);
      let randomZ = randomRange(minRangeZ, maxRangeZ);
      let block = entity.dimension.getBlock({ x: randomX, y: randomY, z: randomZ });
      let blockBelow = block?.below();
      if (block && blockBelow && isSafeAirOrWater(block) && isSolidGround(blockBelow)) {
        validBlock = block;
        break;
      }
    }
    if (validBlock) {
      teleportWithEffects(entity, validBlock.bottomCenter());
      return;
    }
    let loopCondition = system.runInterval(() => {
      let startBlock = entity.dimension.getBlock({ x: mobLocation.x, y: mobLocation.y, z: mobLocation.z });
      if (startBlock) {
        let queue = [startBlock];
        let visited = new Set();
        visited.add(`${startBlock.x},${startBlock.y},${startBlock.z}`);
        while (queue.length > 0) {
          let currentBlock = queue.shift();
          let belowBlock = currentBlock.below();
          if (
            (currentBlock.isAir || ["minecraft:water", "minecraft:flowing_water"].includes(currentBlock.typeId)) &&
            currentBlock.y > -64 &&
            belowBlock &&
            isSolidGround(belowBlock)
          ) {
            teleportWithEffects(entity, currentBlock.bottomCenter());
            system.clearRun(loopCondition);
            return;
          }
          let neighbors = [currentBlock.above(), currentBlock.below()];
          for (let next of neighbors) {
            if (!next) continue;
            let key = `${next.x},${next.y},${next.z}`;
            if (!visited.has(key) && next.y > -64) {
              visited.add(key);
              queue.push(next);
            }
          }
        }
      }
      system.clearRun(loopCondition);
    }, 1);
  }
  
  if (magicSpell.typeId === "ntk:miscellaneous_displacement_magic_spell_1") {
    const dimensionId = [ "overworld", "nether", "the_end" ];
    dimensionId.forEach((dimension) => {
      const validMobs = world.getDimension(dimension).getEntities({
        excludeFamilies: [ "inanimate" ],
        excludeTypes: [ "item" ],
        excludeTags: [ "ntk:antimagic" ],
        location: magicSpell.location,
        minDistance: 0,
        maxDistance: 4,
      });
      for (const targetMob of validMobs) {
        if (detectNearbyEntities(targetMob, dimension, 4) === true) {
          const mobLocation = targetMob.location;
          targetMob.dimension.playSound("mob.endermen.portal", mobLocation, { pitch: 1.0, volume: 1.0 });
          targetMob.dimension.spawnParticle("ntk:displacement_magic_spell_teleport_particle", { x: mobLocation.x, y: mobLocation.y, z: mobLocation.z });
          randomTeleport(targetMob, dimension, 12);
        }
      }
    });
  }
  if (magicSpell.typeId === "ntk:miscellaneous_displacement_magic_spell_2") {
    const dimensionId = [ "overworld", "nether", "the_end" ];
    dimensionId.forEach((dimension) => {
      const validMobs = world.getDimension(dimension).getEntities({
        excludeFamilies: [ "inanimate" ],
        excludeTypes: [ "item" ],
        excludeTags: [ "ntk:antimagic" ],
        location: magicSpell.location,
        minDistance: 0,
        maxDistance: 8,
      });
      for (const targetMob of validMobs) {
        if (detectNearbyEntities(targetMob, dimension, 8) === true) {
          const mobLocation = targetMob.location;
          targetMob.dimension.playSound("mob.endermen.portal", mobLocation, { pitch: 1.0, volume: 1.0 });
          targetMob.dimension.spawnParticle("ntk:displacement_magic_spell_teleport_particle", { x: mobLocation.x, y: mobLocation.y, z: mobLocation.z });
          randomTeleport(targetMob, dimension, 16);
        }
      }
    });
  }
  if (magicSpell.typeId === "ntk:miscellaneous_displacement_magic_spell_3") {
    const dimensionId = [ "overworld", "nether", "the_end" ];
    dimensionId.forEach((dimension) => {
      const validMobs = world.getDimension(dimension).getEntities({
        excludeFamilies: [ "inanimate" ],
        excludeTypes: [ "item" ],
        excludeTags: [ "ntk:antimagic" ],
        location: magicSpell.location,
        minDistance: 0,
        maxDistance: 12,
      });
      for (const targetMob of validMobs) {
        if (detectNearbyEntities(targetMob, dimension, 12) === true) {
          const mobLocation = targetMob.location;
          targetMob.dimension.playSound("mob.endermen.portal", mobLocation, { pitch: 1.0, volume: 1.0 });
          targetMob.dimension.spawnParticle("ntk:displacement_magic_spell_teleport_particle", { x: mobLocation.x, y: mobLocation.y, z: mobLocation.z });
          randomTeleport(targetMob, dimension, 20);
        }
      }
    });
  }
});
