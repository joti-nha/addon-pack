import { world } from "@minecraft/server";
import { enhancerItem, randomTeleport } from "./ntk_functions.js";
import { magicalTypeFamily } from "./ntk_listing.js";

world.afterEvents.projectileHitEntity.subscribe((event) => {
  const dimension = event.dimension;
  const direction = event.hitVector;
  const projectile = event.projectile;
  const source = event.source;
  const hitEntity = event.getEntityHit();
  
  if (!projectile || !hitEntity || !hitEntity.entity) return;
  if (projectile.isValid === false) return;
  const dimensionId = dimension.id;
  const target = hitEntity.entity;
  const targetHealth = target.getComponent("minecraft:health");
  const targetTypeFamily = target.getComponent("minecraft:type_family");
  if (!targetHealth || !targetTypeFamily) return;
  
  const sourceEquippable = source.getComponent("equippable");
  /* Echancer:
  let enhanceAmount = 0;
  if (sourceEquippable) {
    const enhanceValue = enhancerItem(source, "ntk:item_enchancer", "Offhand", 100, 1, true, 1);
    enhanceAmount = 0 + enhanceValue;
  } 
  else {
    enhanceAmount = 0;
  }*/
  
  if (target.matches({ excludeFamilies: [ "inanimate" ], excludeTypes: [ "item" ] })) {
    // Magical Sourge:
    if (!target.matches({ excludeFamilies: magicalTypeFamily })) {
      const enhanceAmount = enhancerItem(source, "ntk:item_enchancer", "Offhand", 100, 1, true, 1);
      const currentHealth = targetHealth.currentValue;
      if (!projectile.matches({ excludeFamilies: [ "magical_scourge_1" ] })) {
        const totalEffectAmount = 2 + enhanceAmount;
        let expectedHealth = currentHealth - totalEffectAmount;
        if (expectedHealth <= 0) {
          expectedHealth = 0;
        }
        targetHealth.setCurrentValue(expectedHealth);
      }
      if (!projectile.matches({ excludeFamilies: [ "magical_scourge_2" ] })) {
        const totalEffectAmount = 4 + enhanceAmount;
        let expectedHealth = currentHealth - totalEffectAmount;
        if (expectedHealth <= 0) {
          expectedHealth = 0;
        }
        targetHealth.setCurrentValue(expectedHealth);
      }
    }
    // Scatter Blinker:
    if (!projectile.matches({ excludeFamilies: [ "scatter_blink_1" ] })) {
      target.dimension.playSound("mob.endermen.portal", target.location, { pitch: 1.0, volume: 1.0 });
      target.dimension.spawnParticle("ntk:teleportation_magic_particle", { x: target.location.x, y: target.location.y, z: target.location.z });
      randomTeleport(target, dimensionId, 16);
    }
    if (!projectile.matches({ excludeFamilies: [ "scatter_blink_2" ] })) {
      target.dimension.playSound("mob.endermen.portal", target.location, { pitch: 1.0, volume: 1.0 });
      target.dimension.spawnParticle("ntk:teleportation_magic_particle", { x: target.location.x, y: target.location.y, z: target.location.z });
      randomTeleport(target, dimensionId, 24);
    }
  }
});
/*Used by:
- Nico's Item Expansion
- Nico's More Dungeon
*/