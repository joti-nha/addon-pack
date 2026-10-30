import { system } from "@minecraft/server";
import { damageItemDurability } from "../ntk_functions.js";

const ItemWarHammerEffectOnHitEntityComponent = {
  onHitEntity({ attackingEntity, hitEntity, itemStack }, { params }) {
    const target = hitEntity;
    const source = attackingEntity;
    if (target === undefined) return;
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const itemName = child.item_name;
      const itemSlot = child.item_slot ?? "Mainhand";
      
      const smashDamage = child.smash_damage ?? false;
      const slownessEffect = child.slowness_effect ?? false;
      const slownessAmplifier = child.slowness_amplifier ?? 0;
      const slownessParticles = child.slowness_particles ?? true;
      const weaknessEffect = child.weakness_effect ?? false;
      const weaknessAmplifier = child.weakness_amplifier ?? 0;
      const weaknessParticles = child.weakness_particles ?? true;
      
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
            // War Hammer effect:
            if (smashDamage !== false) {
              if (!source.getEffect("weakness")) {
                const totalEffectAmount = smashDamage + (smashDamage * (enhanceAmount / 2));
                const targetHealth = target.getComponent("minecraft:health");
                const currentHealth = targetHealth.currentValue;
                let expectedHealth = currentHealth - totalEffectAmount;
                if (expectedHealth <= 0) {
                  expectedHealth = 0;
                }
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
              // Usaged effect:
              if (slownessEffect !== false) {
                source.addEffect("slowness", (slownessEffect * 20), { 
                  amplifier: slownessAmplifier - enhanceAmount,
                  showParticles: slownessParticles
                });
              }
              if (weaknessEffect !== false) {
                source.addEffect("weakness", (weaknessEffect * 20), {
                  amplifier: weaknessAmplifier - enhanceAmount,
                  showParticles: weaknessParticles
                });
              }
              //console.warn(target.getComponent("minecraft:health").currentValue);
            }
          }
        }
      }
    }
  },
};
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent(
    "ntk:war_hammer_effect_on_hit_entity", ItemWarHammerEffectOnHitEntityComponent
  );
});
/*Used in:
NMD:
- Piglin War Hammer
*/