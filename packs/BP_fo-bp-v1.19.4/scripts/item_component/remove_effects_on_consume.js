import { system, Player } from "@minecraft/server";

const RemoveEffectsOnConsumeComponent = {
  onConsume({ itemStack, source }, { params }) {
    if (!(source instanceof Player)) return;
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const itemName = child.item_name;
      
      const removeAllEffects = child.remove_all_effects ?? false;
      const removeAllNegative = child.remove_all_negative ?? false;
      const removeAllPositive = child.remove_all_positive ?? false;
      
      const removeEffectName = child.remove_effect_name;
      
      const particleEffect = child.particle_effect ?? false;
      const particleOffsetX = child.particle_offset_x ?? 0.0;
      const particleOffsetY = child.particle_offset_y ?? 0.0;
      const particleOffsetZ = child.particle_offset_z ?? 0.0;
      const soundEffect = child.sound_effect ?? false;
      const soundPitchMin = child.sound_pitch_min ?? 1.0;
      const soundPitchMax = child.sound_pitch_max ?? 1.0;
      const soundVolume = child.sound_volume ?? 1.0;
      
      if (Math.random() * 100 <= eventChance) {
        if (itemStack.typeId === itemName) {
          const soundPitch = Math.random() * (soundPitchMax - soundPitchMin) + soundPitchMin;
          
          // Removing effects:
          if (removeAllEffects === true) {
            source.removeEffect("absorption");
            source.removeEffect("bad_omen");
            source.removeEffect("blindness");
            source.removeEffect("breath_of_the_nautilus");
            source.removeEffect("conduit_power");
            source.removeEffect("darkness");
            source.removeEffect("fatal_poison");
            source.removeEffect("fire_resistance");
            source.removeEffect("haste");
            source.removeEffect("health_boost");
            source.removeEffect("hunger");
            source.removeEffect("infested");
            source.removeEffect("instant_damage");
            source.removeEffect("instant_health");
            source.removeEffect("invisibility");
            source.removeEffect("jump_boost");
            source.removeEffect("levitation");
            source.removeEffect("mining_fatigue");
            source.removeEffect("nausea");
            source.removeEffect("night_vision");
            source.removeEffect("oozing");
            source.removeEffect("poison");
            source.removeEffect("raid_omen");
            source.removeEffect("regeneration");
            source.removeEffect("resistance");
            source.removeEffect("saturation");
            source.removeEffect("slow_falling");
            source.removeEffect("slowness");
            source.removeEffect("speed");
            source.removeEffect("strength");
            source.removeEffect("trial_omen");
            source.removeEffect("village_hero");
            source.removeEffect("water_breathing");
            source.removeEffect("weakness");
            source.removeEffect("weaving");
            source.removeEffect("wind_charged");
            source.removeEffect("wither");
          }
          if (removeAllNegative === true) {
            source.removeEffect("bad_omen");
            source.removeEffect("blindness");
            source.removeEffect("darkness");
            source.removeEffect("fatal_poison")
            source.removeEffect("hunger");
            source.removeEffect("infested");
            source.removeEffect("instant_damage");
            source.removeEffect("levitation");
            source.removeEffect("mining_fatigue");
            source.removeEffect("nausea");
            source.removeEffect("oozing");
            source.removeEffect("poison");
            source.removeEffect("raid_omen");
            source.removeEffect("slowness");
            source.removeEffect("trial_omen");
            source.removeEffect("weakness");
            source.removeEffect("weaving");
            source.removeEffect("wind_charged");
            source.removeEffect("wither");
          }
          if (removeAllPositive === true) {;
            source.removeEffect("absorption");
            source.removeEffect("breath_of_the_nautilus");
            source.removeEffect("conduit_power");
            source.removeEffect("fire_resistance");
            source.removeEffect("haste");
            source.removeEffect("health_boost");
            source.removeEffect("instant_health");
            source.removeEffect("invisibility");
            source.removeEffect("jump_boost");
            source.removeEffect("night_vision");
            source.removeEffect("regeneration");
            source.removeEffect("resistance");
            source.removeEffect("saturation");
            source.removeEffect("slow_falling");
            source.removeEffect("speed");
            source.removeEffect("strength");
            source.removeEffect("village_hero");
            source.removeEffect("water_breathing");
          }
          if (removeEffectName) {
            source.removeEffect(removeEffectName);
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
  },
};
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent(
    "ntk:remove_effects_on_consume", RemoveEffectsOnConsumeComponent
  );
});
/*Used in:
NIE:
- Bamboo Cup with Chocolate
- Bamboo Cup with Glow Berry Juice
- Bamboo Cup with Milk
- Bamboo Cup with Sweet Berry Juice
- Carrot Soup
- Jar of Chocolate
- Jar of Glow Berry Juice
- Jar of Honey
- Jar of Milk
- Jar of Sweet Berry Juice
- Potato Soup
- Soup
*/