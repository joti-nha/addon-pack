import { world, system } from "@minecraft/server";

world.afterEvents.entitySpawn.subscribe(eventData => {
  const lightningBoltMagicSpell = [
    "ntk:miscellaneous_lightning_bolt_magic_spell_1",
    "ntk:miscellaneous_lightning_bolt_magic_spell_2",
    "ntk:miscellaneous_lightning_bolt_magic_spell_3"
  ];
  if (!lightningBoltMagicSpell.includes(eventData.entity.typeId)) return;
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
  
  if (magicSpell.typeId === "ntk:miscellaneous_lightning_bolt_magic_spell_1") {
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
          targetMob.dimension.runCommand(`summon minecraft:lightning_bolt ${targetMob.location.x} ${targetMob.location.y} ${targetMob.location.z}`);
        }
      }
    });
  }
  if (magicSpell.typeId === "ntk:miscellaneous_lightning_bolt_magic_spell_2") {
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
          targetMob.dimension.runCommand(`summon minecraft:lightning_bolt ${targetMob.location.x} ${targetMob.location.y} ${targetMob.location.z}`);
        }
      }
    });
  }
  if (magicSpell.typeId === "ntk:miscellaneous_lightning_bolt_magic_spell_3") {
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
          targetMob.dimension.runCommand(`summon minecraft:lightning_bolt ${targetMob.location.x} ${targetMob.location.y} ${targetMob.location.z}`);
        }
      }
    });
  }
});
