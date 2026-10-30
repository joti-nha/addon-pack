import { world, GameMode } from "@minecraft/server";

const fireElementalMob = [
  "minecraft:blaze",
  "ntk:firebird",
  "ntk:magma_golem",
  "ntk:nether_wisp",
  "ntk:nether_soul_wisp",
  "ntk:soul_firebird"
];

world.afterEvents.entityHurt.subscribe(event => {
  const damageAmount = event.damage;
  const source = event.damageSource;
  const target = event.hurtEntity;
  if (!source || !target) return;
  const damageType = source.cause;
  const damager = source.damagingEntity;
  const damagerProjectile = source.damagingProjectile;
  if (!damager) return;
  if (damagerProjectile) {
    if (damagerProjectile.isValid === false) return;
  }
  if (damager.isValid === false) return;
  const damagerHealth = damager.getComponent("minecraft:health");
  const targetHealth = target.getComponent("minecraft:health");
  const targetTypeFamily = target.getComponent("minecraft:type_family");
  const damagerEquippable = damager?.getComponent("minecraft:equippable");
  if (!damagerEquippable) return;
  const damagerMainhandItem = damagerEquippable.getEquipmentSlot("Mainhand").getItem();
  if (!targetHealth || !targetTypeFamily) return;
  // Hitting fire-elemental-type mobs with bare hands causes damage to the attacker:
  if (fireElementalMob.includes(target.typeId) && damageType === "entityAttack") {
    const pitchRange = Math.random() * (2.4 - 0.8) + 0.8;
    if (!damagerHealth || damager.getEffect("fire_resistance")) return;
    if (damager.typeId === "minecraft:player") {
      const damagerMainhandItem = damagerEquippable.getEquipmentSlot("Mainhand").getItem();
      if (damagerMainhandItem === undefined && damager.getGameMode() !== GameMode.Creative) {
        damager.applyDamage( 2, { cause: "fire", damagingEntity: target });
        damager.dimension.playSound("random.fizz", damager.location, { pitch: pitchRange, volume: 1.0 });
      }
    }
    else {
      // For non-player entity:
      if (damagerEquippable) {
        if (damagerMainhandItem === undefined) {
          damager.applyDamage( 1, { cause: "fire", damagingEntity: target });
          damager.dimension.playSound("random.fizz", damager.location, { pitch: pitchRange, volume: 1.0 });
        }
      }
    }
  }
});
/*Used by:
- Nico's Mobs
*/