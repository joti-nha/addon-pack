import { system } from "@minecraft/server";
import { damageItemDurability } from "../ntk_functions.js";
import { earthElementalTypeFamily } from "../ntk_listing.js";

const ItemFatalPoisonEffectOnHitEntityComponent = {
  onHitEntity({ attackingEntity, hitEntity, itemStack }, { params }) {
    const target = hitEntity;
    const source = attackingEntity;
    if (target === undefined) return;
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const itemName = child.item_name;
      const itemSlot = child.item_slot ?? "Mainhand";
      
      const fatalPoisonEffect = child.fatal_poison_effect ?? false;
      const fatalPoisonAmplifier = child.fatal_poison_amplifier ?? 0;
      const fatalPoisonLevel = child.fatal_poison_level ?? 1;
      const fatalPoisonParticles = child.fatal_poison_particles ?? true;
      
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
            // Earth-type entities:
            if (target.matches({ excludeFamilies: earthElementalTypeFamily })) {
              // Fatal Poison effect:
              if (fatalPoisonEffect !== false) {
                let effectAmount = fatalPoisonEffect * fatalPoisonLevel;
                const totalEffectAmount = effectAmount + enhanceAmount;
                target.addEffect("fatal_poison", totalEffectAmount, { amplifier: fatalPoisonAmplifier, showParticles: fatalPoisonParticles });
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
    "ntk:fatal_poison_effect_on_hit_entity", ItemFatalPoisonEffectOnHitEntityComponent
  );
});
/*Used in:
NM:
- Scorpion Gauntlet
*/