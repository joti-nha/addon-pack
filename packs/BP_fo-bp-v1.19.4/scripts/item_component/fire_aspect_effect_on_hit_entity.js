import { system } from "@minecraft/server";
import { damageItemDurability } from "../ntk_functions.js";
import { fireElementalTypeFamily } from "../ntk_listing.js";

const ItemFireAspectEffectOnHitEntityComponent = {
  onHitEntity({ attackingEntity, hitEntity, itemStack }, { params }) {
    const target = hitEntity;
    const source = attackingEntity;
    if (target === undefined) return;
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const itemName = child.item_name;
      const itemSlot = child.item_slot ?? "Mainhand";
      
      const fireAspectEffect = child.fire_aspect_effect ?? false;
      const fireAspectLevel = child.fire_aspect_level ?? 1;
      const fireHealthRestore = child.fire_health_restore ?? false;
      const fireSideEffect = child.fire_side_effect ?? true;
      
      const particleEffect = child.particle_effect ?? false;
      const particleOffsetX = child.particle_offset_x ?? 0.0;
      const particleOffsetY = child.particle_offset_y ?? 0.0;
      const particleOffsetZ = child.particle_offset_z ?? 0.0;
      const soundEffect = child.sound_effect ?? false;
      const soundPitchMin = child.sound_pitch_min ?? 1.0;
      const soundPitchMax = child.sound_pitch_max ?? 1.0;
      const soundVolume = child.sound_volume ?? 1.0;
      
      const enhancerItem = child.enhancer_item ?? false;
      const enhancerSlot = child.enhancer_slot ?? "Offhand";
      const enhanceChance = child.enhance_chance ?? 100.0;
      const enhanceValue = child.enhance_value ?? 0;
      const damageEnhancerDurability = child.damage_enhancer_durability ?? false;
      const enhancerDurabilityDamage = child.enhancer_durability_damage ?? 1;
      
      if (Math.random() * 100 <= eventChance) {
        if (itemStack.typeId === itemName) {
          const sourceEquippable = source.getComponent("equippable");
          const soundPitch = Math.random() * (soundPitchMax - soundPitchMin) + soundPitchMin;
          // Enhancer item:
          let enhanceBaseValue = 0;
          let enhanceAmount = 0;
          if (enhancerItem !== false) {
            if (sourceEquippable) {
              const enhancerItemSlot = sourceEquippable.getEquipmentSlot(enhancerSlot);
              const enhancerItemStack = enhancerItemSlot.getItem();
              if (enhancerItemStack === undefined || !enhancerItemStack.hasTag(enhancerItem)) {
                enhanceBaseValue = 0;
                enhanceAmount = 0;
              }
              else if (enhancerItemStack.hasTag(enhancerItem)) {
                if (Math.random() * 100 <= enhanceChance) {
                  enhanceAmount = enhanceBaseValue + enhanceValue;
                  if (damageEnhancerDurability === true) {
                    damageItemDurability(source, enhancerItemStack, enhancerDurabilityDamage, enhancerSlot, false);
                  }
                }
              }
            }
          }
          // Hittable:
          const isSpiritMob = !target.matches({ excludeFamilies: [ "spirit" ] });
          const hasSpiritPiercer = itemStack.hasTag("ntk:spirit_piercer_effect");
          const hittable = (!hasSpiritPiercer && !isSpiritMob || hasSpiritPiercer && !isSpiritMob || hasSpiritPiercer && isSpiritMob);
          if (hittable) {
            // Fire-type entities:
            if (!target.matches({ excludeFamilies: fireElementalTypeFamily })) {
              // Fire health restoration effect:
              if (fireHealthRestore !== false) {
                let restorationAmount = fireHealthRestore * fireAspectLevel;
                const totalRestorationAmount = restorationAmount + enhanceAmount;
                const targetHealth = target.getComponent("minecraft:health");
                const currentHealth = targetHealth.currentValue;
                let expectedHealth = currentHealth + totalRestorationAmount;
                targetHealth.setCurrentValue(expectedHealth);
                // Target particle effect:
                if (particleEffect !== false) {
                  target.dimension.spawnParticle(particleEffect, { x: target.location.x + particleOffsetX, y: target.location.y + particleOffsetY, z: target.location.z + particleOffsetZ });
                }
                // Target sound effect:
                if (soundEffect !== false) {
                  target.dimension.playSound(soundEffect, target.location, { pitch: soundPitch, volume: soundVolume });
                }
              }
            }
            else {
              // Fire Aspect effect:
              if (fireAspectEffect !== false) {
                let effectAmount = fireAspectEffect * fireAspectLevel;
                const totalEffectAmount = effectAmount + enhanceAmount;
                target.setOnFire(totalEffectAmount, fireSideEffect);
                // Target particle effect:
                if (particleEffect !== false) {
                  target.dimension.spawnParticle(particleEffect, { x: target.location.x + particleOffsetX, y: target.location.y + particleOffsetY, z: target.location.z + particleOffsetZ });
                }
                // Target sound effect:
                if (soundEffect !== false) {
                  target.dimension.playSound(soundEffect, target.location, { pitch: soundPitch, volume: soundVolume });
                }
              }
            }
          }
        }
      }
    }
  },
};
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent(
    "ntk:fire_aspect_effect_on_hit_entity", ItemFireAspectEffectOnHitEntityComponent
  );
});
/*Used in:
NIE:
- Blazing Staff
- Magma Club
NMD:
- Piglin Fire Staff
*/