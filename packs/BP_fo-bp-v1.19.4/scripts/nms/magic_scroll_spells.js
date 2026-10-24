import { system } from "@minecraft/server";

export function clearSkyMagicSpell(source) {
  source.dimension.playSound("block.enchanting_table.use", source.location, { pitch: 1.3, volume: 1.0 });
  source.dimension.spawnParticle("ntk:magic_spell_cast_particle", { x: source.location.x, y: source.location.y + 0.5, z: source.location.z });
  source.runCommand(`weather clear`);
}

export function rainMagicSpell(source) {
  source.dimension.playSound("block.enchanting_table.use", source.location, { pitch: 1.3, volume: 1.0 });
  source.dimension.spawnParticle("ntk:magic_spell_cast_particle", { x: source.location.x, y: source.location.y + 0.5, z: source.location.z });
  source.runCommand(`weather rain`);
}

export function thunderstormMagicSpell(source) {
  source.dimension.playSound("block.enchanting_table.use", source.location, { pitch: 1.3, volume: 1.0 });
  source.dimension.spawnParticle("ntk:magic_spell_cast_particle", { x: source.location.x, y: source.location.y + 0.5, z: source.location.z });
  source.runCommand(`weather thunder`);
}

export function hoardingMagicSpell1(source) {
  source.dimension.playSound("block.enchanting_table.use", source.location, { pitch: 1.3, volume: 1.0 });
  source.dimension.spawnParticle("ntk:hoarding_magic_spell_particle_1", { x: source.location.x, y: source.location.y + 0.1, z: source.location.z });
  source.dimension.spawnParticle("ntk:hoarding_magic_spell_teleport_particle", { x: source.location.x, y: source.location.y + 0.1, z: source.location.z });
  const validMobs = source.dimension.getEntities({
    excludeFamilies: [ "mob", "fish", "inanimate" ],
    types: [ "item" ],
    excludeTags: [ "ntk:antimagic" ],
    location: source.location,
    minDistance: 0,
    maxDistance: 8,
  });
  for (const targetMob of validMobs) {
    targetMob.dimension.playSound("mob.endermen.portal", targetMob.location, { pitch: 1.3, volume: 1.0 });
    targetMob.dimension.spawnParticle("ntk:hoarding_magic_spell_teleport_particle", { x: targetMob.location.x, y: targetMob.location.y, z: targetMob.location.z });
    targetMob.teleport(source.location);
  }
}
export function hoardingMagicSpell2(source) {
  source.dimension.playSound("block.enchanting_table.use", source.location, { pitch: 1.3, volume: 1.0 });
  source.dimension.spawnParticle("ntk:hoarding_magic_spell_particle_2", { x: source.location.x, y: source.location.y + 0.1, z: source.location.z });
  source.dimension.spawnParticle("ntk:hoarding_magic_spell_teleport_particle", { x: source.location.x, y: source.location.y + 0.1, z: source.location.z });
  const validMobs = source.dimension.getEntities({
    excludeFamilies: [ "mob", "fish", "inanimate" ],
    types: [ "item" ],
    excludeTags: [ "ntk:antimagic" ],
    location: source.location,
    minDistance: 0,
    maxDistance: 16,
  });
  for (const targetMob of validMobs) {
    targetMob.dimension.playSound("mob.endermen.portal", targetMob.location, { pitch: 1.3, volume: 1.0 });
    targetMob.dimension.spawnParticle("ntk:hoarding_magic_spell_teleport_particle", { x: targetMob.location.x, y: targetMob.location.y, z: targetMob.location.z });
    targetMob.teleport(source.location);
  }
}
export function hoardingMagicSpell3(source) {
  source.dimension.playSound("block.enchanting_table.use", source.location, { pitch: 1.3, volume: 1.0 });
  source.dimension.spawnParticle("ntk:hoarding_magic_spell_particle_3", { x: source.location.x, y: source.location.y + 0.1, z: source.location.z });
  source.dimension.spawnParticle("ntk:hoarding_magic_spell_teleport_particle", { x: source.location.x, y: source.location.y + 0.1, z: source.location.z });
  const validMobs = source.dimension.getEntities({
    excludeFamilies: [ "mob", "fish", "inanimate" ],
    types: [ "item" ],
    excludeTags: [ "ntk:antimagic" ],
    location: source.location,
    minDistance: 0,
    maxDistance: 24,
  });
  for (const targetMob of validMobs) {
    targetMob.dimension.playSound("mob.endermen.portal", targetMob.location, { pitch: 1.3, volume: 1.0 });
    targetMob.dimension.spawnParticle("ntk:hoarding_magic_spell_teleport_particle", { x: targetMob.location.x, y: targetMob.location.y, z: targetMob.location.z });
    targetMob.teleport(source.location);
  }
}

export function homewardBoundMagicSpell(source) {
  const sourceSpawnPoint = source.getSpawnPoint();
  if (sourceSpawnPoint === undefined) {
    source.dimension.playSound("game.source.attack.nodamage", source.location, { pitch: 1.1, volume: 1.0 });
    source.onScreenDisplay?.setActionBar(`§eYou don't have a set spawn point yet.§r`);
  }
  else {
    source.dimension.spawnParticle("ntk:homeward_bound_magic_spell_casting_particle", { x: source.location.x, y: source.location.y + 0.1, z: source.location.z });
    source.dimension.playSound("portal.portal", source.location, { pitch: 0.6, volume: 1.0 });
    system.runTimeout(() => {
      source.dimension.playSound("mob.endermen.portal", source.location, { pitch: 0.3, volume: 2.0 });
      if (sourceSpawnPoint.dimension.id === "minecraft:overworld") {
        source.dimension.spawnParticle("ntk:homeward_bound_magic_spell_teleport_particle", { x: source.location.x, y: source.location.y + 0.5, z: source.location.z });
        source.runCommand(`gamerule sendcommandfeedback false`);
        source.runCommand(`execute in overworld run teleport @s ${source.getSpawnPoint().x} ${source.getSpawnPoint().y} ${source.getSpawnPoint().z} ~ ~`);
        source.runCommand(`particle ntk:homeward_bound_magic_spell_teleport_particle ~ ~ ~`);
        source.runCommand(`gamerule sendcommandfeedback true`);
      }
      if (sourceSpawnPoint.dimension.id === "minecraft:nether") {
        source.dimension.spawnParticle("ntk:homeward_bound_magic_spell_teleport_particle", { x: source.location.x, y: source.location.y + 0.5, z: source.location.z });
        source.runCommand(`gamerule sendcommandfeedback false`);
        source.runCommand(`execute in nether run teleport @s ${source.getSpawnPoint().x} ${source.getSpawnPoint().y} ${source.getSpawnPoint().z} ~ ~`);
        source.runCommand(`particle ntk:homeward_bound_magic_spell_teleport_particle ~ ~ ~`);
        source.runCommand(`gamerule sendcommandfeedback true`);
      }
      if (sourceSpawnPoint.dimension.id === "minecraft:the_end") {
        source.dimension.spawnParticle("ntk:homeward_bound_magic_spell_teleport_particle", { x: source.location.x, y: source.location.y + 0.5, z: source.location.z });
        source.runCommand(`gamerule sendcommandfeedback false`);
        source.runCommand(`execute in the_end run teleport @s ${source.getSpawnPoint().x} ${source.getSpawnPoint().y} ${source.getSpawnPoint().z} ~ ~`);
        source.runCommand(`particle ntk:homeward_bound_magic_spell_teleport_particle ~ ~ ~`);
        source.runCommand(`gamerule sendcommandfeedback true`);
      }
    }, 100);
  }
}
