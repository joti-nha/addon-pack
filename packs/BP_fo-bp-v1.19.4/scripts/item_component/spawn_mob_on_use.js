import { system, world, ItemStack, GameMode } from "@minecraft/server";
import { damageItemDurability } from "../ntk_functions.js";

const ItemSpawnMobOnUseComponent = {
  onUse({ source, itemStack }, { params }) {
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const itemName = child.item_name;
      const itemSlot = child.item_slot ?? "Mainhand";
      
      const failOnSneaking = child.fail_on_sneaking ?? false;
      
      const itemCooldownCategory = child.item_cooldown_category ?? false;
      const itemCooldownDuration = child.item_cooldown_duration;
      
      const durabilityDamage = child.durability_damage ?? false;
      const durabilityDamageChance = child.durability_damage_chance ?? 100.0;
      
      const spawnMob = child.spawn_mob ?? false;
      const spawnMobChance = child.spawn_mob_chance ?? 100.0;
      const spawnMobEvent = child.spawn_mob_event;
      const spawnMobCountMin = child.spawn_mob_count_min ?? 1;
      const spawnMobCountMax = child.spawn_mob_count_max ?? 1;
      const spawnMobOffsetX = child.spawn_mob_offset_x ?? 0.0;
      const spawnMobOffsetY = child.spawn_mob_offset_y ?? 0.0;
      const spawnMobOffsetZ = child.spawn_mob_offset_z ?? 0.0;
      const spawnMobParticleEffect = child.spawn_mob_particle_effect ?? false;
      const spawnMobSoundEffect = child.spawn_mob_sound_effect ?? false;
      const spawnMobSoundPitchMin = child.spawn_mob_sound_pitch_min ?? 1.0;
      const spawnMobSoundPitchMax = child.spawn_mob_sound_pitch_max ?? 1.0;
      const spawnMobSoundVolume = child.spawn_mob_sound_volume ?? 1.0;
      
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
          const spawnMobCount = Math.floor(Math.random() * (spawnMobCountMax - spawnMobCountMin + 1)) + spawnMobCountMin;
          const spawnMobSoundPitch = Math.random() * (spawnMobSoundPitchMax - spawnMobSoundPitchMin) + spawnMobSoundPitchMin;
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
          // Enhancer calculation:
          const totalDurabilityDamage = durabilityDamage - enhanceAmount;
          const totalSpawnMobCount = spawnMobCount + enhanceAmount;
          
          if (failOnSneaking === false) {
            if (itemCooldownCategory !== false) {  
              const cooldown = itemStack.getComponent("cooldown").getCooldownTicksRemaining(source);
              const cooldownDuration = (itemCooldownDuration * 20) - 1;
              if (cooldown == cooldownDuration) {
                // Spawn mob with enhancement:
                if (spawnMob !== false) {
                  if (Math.random() * 100 <= spawnMobChance) {
                    for (let i = 0; i < totalSpawnMobCount; i++) {
                      source.dimension.runCommand(`summon ${spawnMob} ${source.location.x + spawnMobOffsetX} ${source.location.y + spawnMobOffsetY} ${source.location.z + spawnMobOffsetZ} ~ ~ ${spawnMobEvent}`);
                      // Spawn mob particle effect:
                      if (spawnMobParticleEffect !== false) {
                        source.dimension.spawnParticle(spawnMobParticleEffect, { x: source.location.x + spawnMobOffsetX, y: source.location.y + spawnMobOffsetY, z: source.location.z + spawnMobOffsetZ });
                      }
                      // Spawn mob sound effect:
                      if (spawnMobSoundEffect !== false) {
                        source.dimension.playSound(spawnMobSoundEffect, { x: source.location.x + spawnMobOffsetX, y: source.location.y + spawnMobOffsetY, z: source.location.z + spawnMobOffsetZ }, { pitch: spawnMobSoundPitch, volume: spawnMobSoundVolume });
                      }
                    }
                  }
                }
                // Durability Damage with enhancement:
                if (durabilityDamage !== false) {
                  if (Math.random() * 100 <= durabilityDamageChance) {
                    damageItemDurability(source, itemStack, totalDurabilityDamage, itemSlot, false);
                  }
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
            else {
              // Spawn mob with enhancement:
              if (spawnMob !== false) {
                if (Math.random() * 100 <= spawnMobChance) {
                  for (let i = 0; i < totalSpawnMobCount; i++) {
                    source.dimension.runCommand(`summon ${spawnMob} ${source.location.x + spawnMobOffsetX} ${source.location.y + spawnMobOffsetY} ${source.location.z + spawnMobOffsetZ} ~ ~ ${spawnMobEvent}`);
                    // Spawn mob particle effect:
                    if (spawnMobParticleEffect !== false) {
                      source.dimension.spawnParticle(spawnMobParticleEffect, { x: source.location.x + spawnMobOffsetX, y: source.location.y + spawnMobOffsetY, z: source.location.z + spawnMobOffsetZ });
                    }
                    // Spawn mob sound effect:
                    if (spawnMobSoundEffect !== false) {
                      source.dimension.playSound(spawnMobSoundEffect, { x: source.location.x + spawnMobOffsetX, y: source.location.y + spawnMobOffsetY, z: source.location.z + spawnMobOffsetZ }, { pitch: spawnMobSoundPitch, volume: spawnMobSoundVolume });
                    }
                  }
                }
              }
              // Durability Damage with enhancement:
              if (durabilityDamage !== false) {
                if (Math.random() * 100 <= durabilityDamageChance) {
                  damageItemDurability(source, itemStack, totalDurabilityDamage, itemSlot, false);
                }
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
          else if (failOnSneaking === true) {
            if (itemCooldownCategory !== false) {  
              const cooldown = itemStack.getComponent("cooldown").getCooldownTicksRemaining(source);
              const cooldownDuration = (itemCooldownDuration * 20) - 1;
              if (!source.isSneaking) {
                if (cooldown == cooldownDuration) {
                  // Spawn mob with enhancement:
                  if (spawnMob !== false) {
                    if (Math.random() * 100 <= spawnMobChance) {
                      for (let i = 0; i < totalSpawnMobCount; i++) {
                        source.dimension.runCommand(`summon ${spawnMob} ${source.location.x + spawnMobOffsetX} ${source.location.y + spawnMobOffsetY} ${source.location.z + spawnMobOffsetZ} ~ ~ ${spawnMobEvent}`);
                        // Spawn mob particle effect:
                        if (spawnMobParticleEffect !== false) {
                          source.dimension.spawnParticle(spawnMobParticleEffect, { x: source.location.x + spawnMobOffsetX, y: source.location.y + spawnMobOffsetY, z: source.location.z + spawnMobOffsetZ });
                        }
                        // Spawn mob sound effect:
                        if (spawnMobSoundEffect !== false) {
                          source.dimension.playSound(spawnMobSoundEffect, { x: source.location.x + spawnMobOffsetX, y: source.location.y + spawnMobOffsetY, z: source.location.z + spawnMobOffsetZ }, { pitch: spawnMobSoundPitch, volume: spawnMobSoundVolume });
                        }
                      }
                    }
                  }
                  // Durability Damage with enhancement:
                  if (durabilityDamage !== false) {
                    if (Math.random() * 100 <= durabilityDamageChance) {
                      damageItemDurability(source, itemStack, totalDurabilityDamage, itemSlot, false);
                    }
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
              else {
                // Cancel the cooldown when used while sneaking:
                if (cooldown == cooldownDuration) {
                  system.runTimeout(() => {
                    source.startItemCooldown(itemCooldownCategory, 0 );
                    return;
                  }, 5);
                }
              }
            }
            else {
              if (!source.isSneaking) {
                // Spawn mob with enhancement:
                if (spawnMob !== false) {
                  if (Math.random() * 100 <= spawnMobChance) {
                    for (let i = 0; i < totalSpawnMobCount; i++) {
                      source.dimension.runCommand(`summon ${spawnMob} ${source.location.x + spawnMobOffsetX} ${source.location.y + spawnMobOffsetY} ${source.location.z + spawnMobOffsetZ} ~ ~ ${spawnMobEvent}`);
                      // Spawn mob particle effect:
                      if (spawnMobParticleEffect !== false) {
                        source.dimension.spawnParticle(spawnMobParticleEffect, { x: source.location.x + spawnMobOffsetX, y: source.location.y + spawnMobOffsetY, z: source.location.z + spawnMobOffsetZ });
                      }
                      // Spawn mob sound effect:
                      if (spawnMobSoundEffect !== false) {
                        source.dimension.playSound(spawnMobSoundEffect, { x: source.location.x + spawnMobOffsetX, y: source.location.y + spawnMobOffsetY, z: source.location.z + spawnMobOffsetZ }, { pitch: spawnMobSoundPitch, volume: spawnMobSoundVolume });
                      }
                    }
                  }
                }
                // Durability Damage with enhancement:
                if (durabilityDamage !== false) {
                  if (Math.random() * 100 <= durabilityDamageChance) {
                    damageItemDurability(source, itemStack, totalDurabilityDamage, itemSlot, false);
                  }
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
      }
    }
  },
};
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent(
    "ntk:spawn_mob_on_use", ItemSpawnMobOnUseComponent
  );
});
/*Used in
NIE:
- Book of Biomes
*/