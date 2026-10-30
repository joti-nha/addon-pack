import { world, system } from "@minecraft/server";

world.afterEvents.entitySpawn.subscribe(eventData => {
  const convergingMagicSpell = [
    "ntk:miscellaneous_converging_magic_spell_1",
    "ntk:miscellaneous_converging_magic_spell_2",
    "ntk:miscellaneous_converging_magic_spell_3"
  ];
  if (!convergingMagicSpell.includes(eventData.entity.typeId)) return;
  const magicSpell = eventData.entity;
  const magicLocation = magicSpell.location;
  const targetBlock = magicSpell.dimension.getBlock({x: magicLocation.x, y: magicLocation.y, z: magicLocation.z });
  
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
  function convergingTeleport(entity, eventBlock) {
    if (!eventBlock) {
      entity.teleport(magicLocation);
      return;
    }
    let teleportation = false;
    const loopCondition  = system.runInterval(() => {
      if (teleportation) {
        system.clearRun(loopCondition);
        return;
      }
      if (eventBlock.isAir || eventBlock.isLiquid) {
        entity.teleport(eventBlock.bottomCenter());
        teleportation = true;
        system.clearRun(loopCondition);
        return;
      }
      let queue = [{ block: eventBlock }];
      let visited = new Set();
      visited.add(eventBlock);
      while (queue.length > 0) {
        let { block } = queue.shift();
        if (block.isAir || block.isLiquid) {
          entity.teleport(block.bottomCenter());
          teleportation = true;
          return;
        }
        let neighbors = [
          block.above(), block.below(),
          block.north(), block.south(),
          block.east(), block.west(),
          block.north().east(), block.north().west(), block.south().east(), block.south().west(),
          block.above().north(), block.above().south(), block.above().east(), block.above().west(),
          block.below().north(), block.below().south(), block.below().east(), block.below().west(),
          block.above().north().east(), block.above().north().west(), block.above().south().east(), block.above().south().west(),
          block.below().north().east(), block.below().north().west(), block.below().south().east(), block.below().south().west()
        ];
        for (let nextBlock of neighbors) {
          if (nextBlock && !visited.has(nextBlock)) {
            visited.add(nextBlock);
            queue.push({ block: nextBlock });
          }
        }
      }
      entity.teleport(magicLocation);
      teleportation = true;
    }, 10);
  }
  
  if (magicSpell.typeId === "ntk:miscellaneous_converging_magic_spell_1") {
    const dimensionId = [ "overworld", "nether", "the_end" ];
    dimensionId.forEach((dimension) => {
      const validMobs = world.getDimension(dimension).getEntities({
        excludeFamilies: [ "inanimate" ],
        excludeTypes: [ "item" ],
        excludeTags: [ "ntk:antimagic" ],
        location: magicSpell.location,
        minDistance: 0,
        maxDistance: 5,
      });
      for (const targetMob of validMobs) {
        if (detectNearbyEntities(targetMob, dimension, 5) === true) {
          const mobLocation = targetMob.location;
          targetMob.dimension.playSound("mob.endermen.portal", mobLocation, { pitch: 1.0, volume: 1.0 });
          convergingTeleport(targetMob, targetBlock);
          system.runTimeout(() => {
            targetMob.dimension.playSound("mob.endermen.portal", mobLocation, { pitch: 1.0, volume: 1.0 });
            targetMob.dimension.spawnParticle("ntk:converging_magic_spell_teleport_particle", { x: mobLocation.x, y: mobLocation.y, z: mobLocation.z });
          }, 15);
        }
      }
    });
  }
  if (magicSpell.typeId === "ntk:miscellaneous_converging_magic_spell_2") {
    const dimensionId = [ "overworld", "nether", "the_end" ];
    dimensionId.forEach((dimension) => {
      const validMobs = world.getDimension(dimension).getEntities({
        excludeFamilies: [ "inanimate" ],
        excludeTypes: [ "item" ],
        excludeTags: [ "ntk:antimagic" ],
        location: magicSpell.location,
        minDistance: 0,
        maxDistance: 10,
      });
      for (const targetMob of validMobs) {
        if (detectNearbyEntities(targetMob, dimension, 10) === true) {
          const mobLocation = targetMob.location;
          targetMob.dimension.playSound("mob.endermen.portal", mobLocation, { pitch: 1.0, volume: 1.0 });
          targetMob.dimension.spawnParticle("ntk:converging_magic_spell_teleport_particle", { x: mobLocation.x, y: mobLocation.y, z: mobLocation.z });
          convergingTeleport(targetMob, targetBlock);
          system.runTimeout(() => {
            targetMob.dimension.playSound("mob.endermen.portal", mobLocation, { pitch: 1.0, volume: 1.0 });
            targetMob.dimension.spawnParticle("ntk:converging_magic_spell_teleport_particle", { x: mobLocation.x, y: mobLocation.y, z: mobLocation.z });
          }, 15);
        }
      }
    });
  }
  if (magicSpell.typeId === "ntk:miscellaneous_converging_magic_spell_3") {
    const dimensionId = [ "overworld", "nether", "the_end" ];
    dimensionId.forEach((dimension) => {
      const validMobs = world.getDimension(dimension).getEntities({
        excludeFamilies: [ "inanimate" ],
        excludeTypes: [ "item" ],
        excludeTags: [ "ntk:antimagic" ],
        location: magicSpell.location,
        minDistance: 0,
        maxDistance: 15,
      });
      for (const targetMob of validMobs) {
        if (detectNearbyEntities(targetMob, dimension, 15) === true) {
          const mobLocation = targetMob.location;
          targetMob.dimension.playSound("mob.endermen.portal", mobLocation, { pitch: 1.0, volume: 1.0 });
          targetMob.dimension.spawnParticle("ntk:converging_magic_spell_teleport_particle", { x: mobLocation.x, y: mobLocation.y, z: mobLocation.z });
          convergingTeleport(targetMob, targetBlock);
          system.runTimeout(() => {
            targetMob.dimension.playSound("mob.endermen.portal", mobLocation, { pitch: 1.0, volume: 1.0 });
            targetMob.dimension.spawnParticle("ntk:converging_magic_spell_teleport_particle", { x: mobLocation.x, y: mobLocation.y, z: mobLocation.z });
          }, 15);
        }
      }
    });
  }
});
