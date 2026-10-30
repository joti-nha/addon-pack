import { system, Player } from "@minecraft/server";
import { damageItemDurability } from "../ntk_functions.js";

const AddEffectsOnConsumeComponent = {
  onConsume({ itemStack, source }, { params }) {
    if (!(source instanceof Player)) return;
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const itemName = child.item_name;
      const itemSlot = child.item_slot ?? "Mainhand";
      
      const effectName = child.effect_name ?? false;
      const effectType = child.effect_type;
      const effectDuration = child.effect_duration ?? 0.0;
      const effectAmplifier = child.effect_amplifier ?? 0;
      const effectParticles = child.effect_particles ?? true;
      
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
      // Additional event chance using the enhancer item:
      let totalEventChance = eventChance;
      if (effectType === "positive") {
        totalEventChance = eventChance + enhanceAmount;
      }
      else if (effectType === "negative") {
        totalEventChance = eventChance - enhanceAmount;
      }
      
      if (Math.random() * 100 <= totalEventChance) {
        if (itemStack.typeId === itemName) {
          // Adding effect:
          if (effectName !== false) {
            if (effectType === "positive") {
              const totalEffectDuration = effectDuration + enhanceAmount;
              source.addEffect(effectName, totalEffectDuration * 20, { amplifier: effectAmplifier, showParticles: effectParticles });
            }
            else if (effectType === "negative") {
              const totalEffectDuration = effectDuration - enhanceAmount;
              source.addEffect(effectName, totalEffectDuration * 20, { amplifier: effectAmplifier, showParticles: effectParticles });
            }
            // Source particle effect:
            if (particleEffect !== false) {
              source.dimension.spawnParticle(particleEffect, { x: source.location.x + particleOffsetX, y: source.location.y + particleOffsetY, z: source.location.z + particleOffsetZ });
            }
            // Source sound effect:
            if (soundEffect !== false) {
              source.dimension.playSound(soundEffect, source.location, { pitch: soundPitch, volume: soundVolume });
            }
          }
        }
      }
    }
  },
};
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent(
    "ntk:add_effects_on_consume", AddEffectsOnConsumeComponent
  );
});
/*Used in:
ACT:
- Golden Beetroot
NCE:
- Moss Berry Cookie
- Moss Berry Pie
- Mosshroom Stew
NIE:
- Amethyst Apple
- Apple Pie
- Blazing Apple
- Cactus Stew
- Cheese
- Cheese Bread
- Chocolate Bar
- Copper Apple
- Crimson Stew
- Diamond Apple
- Egg Sandwich
- Emerald Apple
- Glow Berry Cookie
- Glow Berry Pie
- Glow Lichen Stew
- Iron Apple
- Lapis Lazuli Apple
- Netherite Apple
- Pea Stew
- Pumpkin Slice
- Seagrass Stew
- Sweet Berry Cookie
- Sweet Berry Pie
- Warped Stew
NM:
- Chorus Jelly
- Raw Arthropod Meat
- Raw Clurve Meat
- Raw Lurknash Meat
- Raw Moa
- Raw Squirrel
NMD:
- Potion of Brute
- Raw Rat
- Rotten Brute Flesh
*/