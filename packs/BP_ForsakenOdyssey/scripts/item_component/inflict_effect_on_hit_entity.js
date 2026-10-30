import { system } from "@minecraft/server";
import { damageItemDurability, decreaseItemStack } from "../ntk_functions.js";
import { earthElementalTypeFamily } from "../ntk_listing.js";

const ItemInflictEffectOnHitEntityComponent = {
  onHitEntity({ attackingEntity, hitEntity, itemStack }, { params }) {
    const target = hitEntity;
    const source = attackingEntity;
    if (target === undefined) return;
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const itemName = child.item_name;
      const itemSlot = child.item_slot ?? "Mainhand";
      
      const includeFamilyType = child.include_family_type ?? false;
      const excludeFamilyType = child.exclude_family_type ?? false;
      
      const inflictEffect = child.inflict_effect ?? false;
      const inflictDuration = child.inflict_duration ?? 0;
      const inflictAmplifier = child.inflict_amplifier ?? 0;
      const inflictLevel = child.inflict_level ?? 1;
      const inflictParticles = child.inflict_particles ?? true;
      
      const decreaseItem = child.decrease_item ?? false;
      const decreaseItemChance = child.decrease_item_chance ?? 100.0;
      
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
          // Type of entities:
          let validFamilyType = false;
          if (includeFamilyType === "earth_elemetal_type" || excludeFamilyType === "earth_elemetal_type") {
            validFamilyType = earthElementalTypeFamily;
          }
          
          // Hittable:
          const isSpiritMob = !target.matches({ excludeFamilies: [ "spirit" ] });
          const hasSpiritPiercer = itemStack.hasTag("ntk:spirit_piercer_effect");
          const hittable = (!hasSpiritPiercer && !isSpiritMob || hasSpiritPiercer && !isSpiritMob || hasSpiritPiercer && isSpiritMob);
          if (hittable) {
            // Types of entities:
            if (includeFamilyType !== false && excludeFamilyType === false) {
              if (!target.matches({ excludeFamilies: validFamilyType })) {
                // Inflict effect:
                if (inflictEffect !== false) {
                  let effectAmount = inflictDuration * inflictLevel;
                  const totalEffectAmount = effectAmount + enhanceAmount;
                  target.addEffect(inflictEffect, totalEffectAmount, { amplifier: inflictAmplifier, showParticles: inflictParticles });
                  // Decrease item:
                  if (decreaseItem !== false) {
                    if (Math.random() * 100 <= decreaseItemChance) {
                      decreaseItemStack(source, itemStack, decreaseItem, itemSlot);
                    }
                  }
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
            else if (excludeFamilyType !== false && includeFamilyType === false) {
              if (target.matches({ excludeFamilies: validFamilyType })) {
                // Inflict effect:
                if (inflictEffect !== false) {
                  let effectAmount = inflictDuration * inflictLevel;
                  const totalEffectAmount = effectAmount + enhanceAmount;
                  target.addEffect(inflictEffect, totalEffectAmount, { amplifier: inflictAmplifier, showParticles: inflictParticles });
                  // Decrease item:
                  if (decreaseItem !== false) {
                    if (Math.random() * 100 <= decreaseItemChance) {
                      decreaseItemStack(source, itemStack, decreaseItem, itemSlot);
                    }
                  }
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
            else if (includeFamilyType !== false && excludeFamilyType !== false) {
              // Inflict effect:
              if (inflictEffect !== false) {
                let effectAmount = inflictDuration * inflictLevel;
                const totalEffectAmount = effectAmount + enhanceAmount;
                target.addEffect(inflictEffect, totalEffectAmount, { amplifier: inflictAmplifier, showParticles: inflictParticles });
                // Decrease item:
                if (decreaseItem !== false) {
                  if (Math.random() * 100 <= decreaseItemChance) {
                    decreaseItemStack(source, itemStack, decreaseItem, itemSlot);
                  }
                }
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
    "ntk:inflict_effect_on_hit_entity", ItemInflictEffectOnHitEntityComponent
  );
});
/*Used in:
NM:
- Scorpion Telson
*/