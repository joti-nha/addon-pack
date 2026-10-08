import { system, world, ItemStack, GameMode } from "@minecraft/server";
import { damageItemDurability, decreaseItemStack, detectNearbyEntities, shootProjectile, spawnItemStack } from "../ntk_functions.js";

const ItemOnUseComponent = {
  onUse({ source, itemStack }, { params }) {
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const itemName = child.item_name;
      const itemSlot = child.item_slot ?? "Mainhand";
      
      const failOnSneaking = child.fail_on_sneaking ?? false;
      
      const itemCooldownCategory = child.item_cooldown_category ?? false;
      const itemCooldownDuration = child.item_cooldown_duration ?? 0.0;
      
      const decreaseItem = child.decrease_item ?? false;
      const decreaseItemChance = child.decrease_item_chance ?? 100.0;
      
      const durabilityDamage = child.durability_damage ?? false;
      const durabilityDamageChance = child.durability_damage_chance ?? 100.0;
      
      const ammunitionType = child.ammunition_type ?? false ;
      const ammunitionSlot = child.ammunition_slot ?? "Offhand";
      const ammunitionFailGuide = child.ammunition_fail_guide ?? false;
      const ammunitionSoundEffect = child.ammunition_sound_effect ?? false;
      const ammunitionSoundPitchMin = child.ammunition_sound_pitch_min ?? 1.0;
      const ammunitionSoundPitchMax = child.ammunition_sound_pitch_max ?? 1.0;
      const ammunitionSoundVolume = child.ammunition_sound_volume ?? 1.0;
      
      const giveItem = child.give_item ?? false;
      const giveItemChance = child.give_item_chance ?? 100.0;
      const giveItemCountMin = child.give_item_count_min ?? 1;
      const giveItemCountMax = child.give_item_count_max ?? 1;
      
      const releaseEffect = child.release_effect ?? false;
      const releaseValidBlocks = child.release_valid_blocks ?? false;
      const releaseFailGuide = child.release_fail_guide ?? false;
      const releaseEffectDuration = child.release_effect_duration ?? 1;
      const releaseEffectAmplifier = child.release_effect_amplifier ?? 0;
      const releaseEffectParticles = child.release_effect_particles ?? true;
      const releaseEffectRangeMin = child.release_effect_range_min ?? 0;
      const releaseEffectRangeMax = child.release_effect_range_max ?? 1;
      const releaseParticleEffect = child.release_particle_effect ?? false;
      const releaseParticleOffsetX = child.release_particle_offset_x ?? 0.0;
      const releaseParticleOffsetY = child.release_particle_offset_y ?? 0.0;
      const releaseParticleOffsetZ = child.release_particle_offset_z ?? 0.0;
      const releaseSoundEffect = child.release_sound_effect ?? false;
      const releaseSoundPitchMin = child.release_sound_pitch_min ?? 1.0;
      const releaseSoundPitchMax = child.release_sound_pitch_max ?? 1.0;
      const releaseSoundVolume = child.release_sound_volume ?? 1.0;
      
      const projectileTypeNormal = child.projectile_type_normal ?? false;
      const projectileTypeEnhanced = child.projectile_type_enhanced;
      const shootSoundEffect = child.shoot_sound_effect;
      const shootSoundPitchMin = child.shoot_sound_pitch_min ?? 1.0;
      const shootSoundPitchMax = child.shoot_sound_pitch_max ?? 1.0;
      const shootSoundVolume = child.shoot_sound_volume ?? 1.0;
      
      const spawnItem = child.spawn_item ?? false;
      const spawnItemChance = child.spawn_item_chance ?? 100.0;
      const spawnItemCountMin = child.spawn_item_count_min ?? 1;
      const spawnItemCountMax = child.spawn_item_count_max ?? 1;
      
      const spawnLoot = child.spawn_loot ?? false;
      const spawnLootChance = child.spawn_loot_chance ?? 100.0;
      const spawnLootOffsetX = child.spawn_loot_offset_x ?? 0.0;
      const spawnLootOffsetY = child.spawn_loot_offset_y ?? 0.0;
      const spawnLootOffsetZ = child.spawn_loot_offset_z ?? 0.0;
      
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
          const ammunitionItemSlot = sourceEquippable.getEquipmentSlot(ammunitionSlot);
          const ammunitionItemStack = ammunitionItemSlot.getItem();
          const ammunitionSoundPitch = Math.random() * (ammunitionSoundPitchMax - ammunitionSoundPitchMin) + ammunitionSoundPitchMin;
          const giveItemCount = Math.floor(Math.random() * (giveItemCountMax - giveItemCountMin + 1)) + giveItemCountMin;
          const releaseSoundPitch = Math.random() * (releaseSoundPitchMax - releaseSoundPitchMin) + releaseSoundPitchMin;
          const shootSoundPitch = Math.random() * (shootSoundPitchMax - shootSoundPitchMin) + shootSoundPitchMin;
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
          // Detect dimension ID:
          let dimensionId = source.dimension.id;
          if (source.dimension.id === "minecraft:overworld") {
            dimensionId = "overworld";
          }
          if (source.dimension.id === "minecraft:nether") {
            dimensionId = "nether";
          }
          if (source.dimension.id === "minecraft:the_end") {
            dimensionId = "the_end";
          }
          // Block validation:
          const sourceOnBlock = source.dimension.getBlock({ x: source.location.x, y: source.location.y + 0.5, z: source.location.z });
          let validBlocks = [
            "minecraft:air"
          ];
          if (releaseValidBlocks === "water_type") {
            validBlocks = [
              "minecraft:flowing_water",
              "minecraft:water"
            ];
          }
          
          if (failOnSneaking === false) {
            if (itemCooldownCategory !== false) {  
              const cooldown = itemStack.getComponent("cooldown").getCooldownTicksRemaining(source);
              const cooldownDuration = (itemCooldownDuration * 20) - 1;
              if (cooldown == cooldownDuration) {
                // Ammunition requirement:
                if (ammunitionType !== false) {
                  if (ammunitionItemStack === undefined || !ammunitionItemStack.hasTag(ammunitionType)) {
                    if (ammunitionFailGuide !== false) {
                      source.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"${ammunitionFailGuide}\"}]}`);
                      source.dimension.playSound("game.player.attack.nodamage", source.location, { pitch: 1.2, volume: 1.0 });
                    }
                  }
                  else {
                    // Ammunition sound effect:
                    if (ammunitionSoundEffect !== false) {
                      source.dimension.playSound(ammunitionSoundEffect, source.location, { pitch: ammunitionSoundPitch, volume: ammunitionSoundVolume });
                    }
                  }
                }
                // Give item:
                if (giveItem !== false) {
                  if (Math.random() * 100 <= giveItemChance) {
                    source.runCommand(`gamerule sendcommandfeedback false`);
                    source.runCommand(`give @s ${giveItem} ${giveItemCount}`);
                    source.runCommand(`gamerule sendcommandfeedback true`);
                  }
                }
                // Release effect:
                if (releaseEffect !== false) {
                  const validMobs = world.getDimension(dimensionId).getEntities({
                    excludeFamilies: [ "inanimate" ],
                    excludeTypes: [ "item" ],
                    excludeTags: [ "ntk:antimagic" ],
                    location: source.location,
                    minDistance: releaseEffectRangeMin,
                    maxDistance: releaseEffectRangeMax,
                  });
                  if (releaseValidBlocks !== false) {
                    if (validBlocks.includes(sourceOnBlock.typeId)) {
                      for (const targetMob of validMobs) {
                        if (detectNearbyEntities(source, dimensionId, releaseEffectRangeMax) === true) {
                          targetMob.addEffect(releaseEffect, releaseEffectDuration, { amplifier: releaseEffectAmplifier, showParticles: releaseEffectParticles });
                          // Target particle effect:
                          if (releaseParticleEffect !== false) {
                            targetMob.dimension.spawnParticle(releaseParticleEffect, { x: targetMob.location.x + releaseParticleOffsetX, y: targetMob.location.y + releaseParticleOffsetY, z: targetMob.location.z + releaseParticleOffsetZ });
                          }
                          // Target sound effect:
                          if (releaseSoundEffect !== false) {
                            targetMob.dimension.playSound(releaseSoundEffect, targetMob.location, { pitch: releaseSoundPitch, volume: releaseSoundVolume });
                          }
                        }
                      }
                    }
                    else {
                      if (releaseFailGuide !== false) {
                        source.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"${releaseFailGuide}\"}]}`);
                        source.dimension.playSound("game.player.attack.nodamage", source.location, { pitch: 1.2, volume: 1.0 });
                        // Cancel the cooldown when used while sneaking:
                        if (itemCooldownCategory !== false) {
                          if (cooldown == cooldownDuration) {
                            system.runTimeout(() => {
                              source.startItemCooldown(itemCooldownCategory, 0 );
                              return;
                            }, 5);
                          }
                        }
                      }
                    }
                  }
                  else {
                    for (const targetMob of validMobs) {
                      if (detectNearbyEntities(source, dimensionId, releaseEffectRangeMax) === true) {
                        targetMob.addEffect(releaseEffect, releaseEffectDuration, { amplifier: releaseEffectAmplifier, showParticles: releaseEffectParticles });
                        // Target particle effect:
                        if (releaseParticleEffect !== false) {
                          targetMob.dimension.spawnParticle(releaseParticleEffect, { x: targetMob.location.x + releaseParticleOffsetX, y: targetMob.location.y + releaseParticleOffsetY, z: targetMob.location.z + releaseParticleOffsetZ });
                        }
                        // Target sound effect:
                        if (releaseSoundEffect !== false) {
                          targetMob.dimension.playSound(releaseSoundEffect, targetMob.location, { pitch: releaseSoundPitch, volume: releaseSoundVolume });
                        }
                      }
                    }
                  }
                }
                // Shoot projectile:
                if (projectileTypeNormal !== false) {
                  if (enhanceAmount === 0) {
                    shootProjectile(projectileTypeNormal, source, shootSoundEffect, shootSoundPitch, shootSoundVolume);
                  }
                  else {
                    shootProjectile(projectileTypeEnhanced, source, shootSoundEffect, shootSoundPitch, shootSoundVolume);
                  }
                }
                // Spawn item:
                if (spawnItem !== false) {
                  if (Math.random() * 100 <= spawnItemChance) {
                    spawnItemStack(source, spawnItem, spawnItemCountMin, spawnItemCountMax);
                  }
                }
                // Spawn loot:
                if (spawnLoot !== false) {
                  if (Math.random() * 100 <= spawnLootChance) {
                    source.runCommand(`loot spawn ${source.location.x + spawnLootOffsetX} ${source.location.y + spawnLootOffsetY} ${source.location.z + spawnLootOffsetZ} loot "${spawnLoot}"`);
                  }
                }
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
                // Decrease item:
                if (decreaseItem !== false) {
                  if (Math.random() * 100 <= decreaseItemChance) {
                    decreaseItemStack(source, itemStack, decreaseItem, itemSlot);
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
              // Ammunition requirement:
              if (ammunitionType !== false) {
                if (ammunitionItemStack === undefined || !ammunitionItemStack.hasTag(ammunitionType)) {
                  if (ammunitionFailGuide !== false) {
                    source.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"${ammunitionFailGuide}\"}]}`);
                    source.dimension.playSound("game.player.attack.nodamage", source.location, { pitch: 1.2, volume: 1.0 });
                  }
                }
                else {
                  // Ammunition sound effect:
                  if (ammunitionSoundEffect !== false) {
                    source.dimension.playSound(ammunitionSoundEffect, source.location, { pitch: ammunitionSoundPitch, volume: ammunitionSoundVolume });
                  }
                }
              }
              // Give item:
              if (giveItem !== false) {
                if (Math.random() * 100 <= giveItemChance) {
                  source.runCommand(`gamerule sendcommandfeedback false`);
                  source.runCommand(`give @s ${giveItem} ${giveItemCount}`);
                  source.runCommand(`gamerule sendcommandfeedback true`);
                }
              }
              // Release effect:
              if (releaseEffect !== false) {
                const validMobs = world.getDimension(dimensionId).getEntities({
                  excludeFamilies: [ "inanimate" ],
                  excludeTypes: [ "item" ],
                  excludeTags: [ "ntk:antimagic" ],
                  location: source.location,
                  minDistance: releaseEffectRangeMin,
                  maxDistance: releaseEffectRangeMax,
                });
                if (releaseValidBlocks !== false) {
                  if (validBlocks.includes(sourceOnBlock.typeId)) {
                    for (const targetMob of validMobs) {
                      if (detectNearbyEntities(source, dimensionId, releaseEffectRangeMax) === true) {
                        targetMob.addEffect(releaseEffect, releaseEffectDuration, { amplifier: releaseEffectAmplifier, showParticles: releaseEffectParticles });
                        // Target particle effect:
                        if (releaseParticleEffect !== false) {
                          targetMob.dimension.spawnParticle(releaseParticleEffect, { x: targetMob.location.x + releaseParticleOffsetX, y: targetMob.location.y + releaseParticleOffsetY, z: targetMob.location.z + releaseParticleOffsetZ });
                        }
                        // Target sound effect:
                        if (releaseSoundEffect !== false) {
                          targetMob.dimension.playSound(releaseSoundEffect, targetMob.location, { pitch: releaseSoundPitch, volume: releaseSoundVolume });
                        }
                      }
                    }
                  }
                  else {
                    if (releaseFailGuide !== false) {
                      source.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"${releaseFailGuide}\"}]}`);
                      source.dimension.playSound("game.player.attack.nodamage", source.location, { pitch: 1.2, volume: 1.0 });
                      // Cancel the cooldown when used while sneaking:
                      if (itemCooldownCategory !== false) {
                        if (cooldown == cooldownDuration) {
                          system.runTimeout(() => {
                            source.startItemCooldown(itemCooldownCategory, 0 );
                            return;
                          }, 5);
                        }
                      }
                    }
                  }
                }
                else {
                  for (const targetMob of validMobs) {
                    if (detectNearbyEntities(source, dimensionId, releaseEffectRangeMax) === true) {
                      targetMob.addEffect(releaseEffect, releaseEffectDuration, { amplifier: releaseEffectAmplifier, showParticles: releaseEffectParticles });
                      // Target particle effect:
                      if (releaseParticleEffect !== false) {
                        targetMob.dimension.spawnParticle(releaseParticleEffect, { x: targetMob.location.x + releaseParticleOffsetX, y: targetMob.location.y + releaseParticleOffsetY, z: targetMob.location.z + releaseParticleOffsetZ });
                      }
                      // Target sound effect:
                      if (releaseSoundEffect !== false) {
                        targetMob.dimension.playSound(releaseSoundEffect, targetMob.location, { pitch: releaseSoundPitch, volume: releaseSoundVolume });
                      }
                    }
                  }
                }
              }
              // Shoot projectile:
              if (projectileTypeNormal !== false) {
                if (enhanceAmount === 0) {
                  shootProjectile(projectileTypeNormal, source, shootSoundEffect, shootSoundPitch, shootSoundVolume);
                }
                else {
                  shootProjectile(projectileTypeEnhanced, source, shootSoundEffect, shootSoundPitch, shootSoundVolume);
                }
              }
              // Spawn item:
              if (spawnItem !== false) {
                if (Math.random() * 100 <= spawnItemChance) {
                  spawnItemStack(source, spawnItem, spawnItemCountMin, spawnItemCountMax);
                }
              }
              // Spawn loot:
              if (spawnLoot !== false) {
                if (Math.random() * 100 <= spawnLootChance) {
                  source.runCommand(`loot spawn ${source.location.x + spawnLootOffsetX} ${source.location.y + spawnLootOffsetY} ${source.location.z + spawnLootOffsetZ} loot "${spawnLoot}"`);
                }
              }
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
              // Decrease item:
              if (decreaseItem !== false) {
                if (Math.random() * 100 <= decreaseItemChance) {
                  decreaseItemStack(source, itemStack, decreaseItem, itemSlot);
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
                  // Ammunition requirement:
                  if (ammunitionType !== false) {
                    if (ammunitionItemStack === undefined || !ammunitionItemStack.hasTag(ammunitionType)) {
                      if (ammunitionFailGuide !== false) {
                        source.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"${ammunitionFailGuide}\"}]}`);
                        source.dimension.playSound("game.player.attack.nodamage", source.location, { pitch: 1.2, volume: 1.0 });
                      }
                    }
                    else {
                      // Ammunition sound effect:
                      if (ammunitionSoundEffect !== false) {
                        source.dimension.playSound(ammunitionSoundEffect, source.location, { pitch: ammunitionSoundPitch, volume: ammunitionSoundVolume });
                      }
                    }
                  }
                  // Give item:
                  if (giveItem !== false) {
                    if (Math.random() * 100 <= giveItemChance) {
                      source.runCommand(`gamerule sendcommandfeedback false`);
                      source.runCommand(`give @s ${giveItem} ${giveItemCount}`);
                      source.runCommand(`gamerule sendcommandfeedback true`);
                    }
                  }
                  // Release effect:
                  if (releaseEffect !== false) {
                    const validMobs = world.getDimension(dimensionId).getEntities({
                      excludeFamilies: [ "inanimate" ],
                      excludeTypes: [ "item" ],
                      excludeTags: [ "ntk:antimagic" ],
                      location: source.location,
                      minDistance: releaseEffectRangeMin,
                      maxDistance: releaseEffectRangeMax,
                    });
                    if (releaseValidBlocks !== false) {
                      if (validBlocks.includes(sourceOnBlock.typeId)) {
                        for (const targetMob of validMobs) {
                          if (detectNearbyEntities(source, dimensionId, releaseEffectRangeMax) === true) {
                            targetMob.addEffect(releaseEffect, releaseEffectDuration, { amplifier: releaseEffectAmplifier, showParticles: releaseEffectParticles });
                            // Target particle effect:
                            if (releaseParticleEffect !== false) {
                              targetMob.dimension.spawnParticle(releaseParticleEffect, { x: targetMob.location.x + releaseParticleOffsetX, y: targetMob.location.y + releaseParticleOffsetY, z: targetMob.location.z + releaseParticleOffsetZ });
                            }
                            // Target sound effect:
                            if (releaseSoundEffect !== false) {
                              targetMob.dimension.playSound(releaseSoundEffect, targetMob.location, { pitch: releaseSoundPitch, volume: releaseSoundVolume });
                            }
                          }
                        }
                      }
                      else {
                        if (releaseFailGuide !== false) {
                          source.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"${releaseFailGuide}\"}]}`);
                          source.dimension.playSound("game.player.attack.nodamage", source.location, { pitch: 1.2, volume: 1.0 });
                          // Cancel the cooldown when used while sneaking:
                          if (itemCooldownCategory !== false) {
                            if (cooldown == cooldownDuration) {
                              system.runTimeout(() => {
                                source.startItemCooldown(itemCooldownCategory, 0 );
                                return;
                              }, 5);
                            }
                          }
                        }
                      }
                    }
                    else {
                      for (const targetMob of validMobs) {
                        if (detectNearbyEntities(source, dimensionId, releaseEffectRangeMax) === true) {
                          targetMob.addEffect(releaseEffect, releaseEffectDuration, { amplifier: releaseEffectAmplifier, showParticles: releaseEffectParticles });
                          // Target particle effect:
                          if (releaseParticleEffect !== false) {
                            targetMob.dimension.spawnParticle(releaseParticleEffect, { x: targetMob.location.x + releaseParticleOffsetX, y: targetMob.location.y + releaseParticleOffsetY, z: targetMob.location.z + releaseParticleOffsetZ });
                          }
                          // Target sound effect:
                          if (releaseSoundEffect !== false) {
                            targetMob.dimension.playSound(releaseSoundEffect, targetMob.location, { pitch: releaseSoundPitch, volume: releaseSoundVolume });
                          }
                        }
                      }
                    }
                  }
                  // Shoot projectile:
                  if (projectileTypeNormal !== false) {
                    if (enhanceAmount === 0) {
                      shootProjectile(projectileTypeNormal, source, shootSoundEffect, shootSoundPitch, shootSoundVolume);
                    }
                    else {
                      shootProjectile(projectileTypeEnhanced, source, shootSoundEffect, shootSoundPitch, shootSoundVolume);
                    }
                  }
                  // Spawn item:
                  if (spawnItem !== false) {
                    if (Math.random() * 100 <= spawnItemChance) {
                      spawnItemStack(source, spawnItem, spawnItemCountMin, spawnItemCountMax);
                    }
                  }
                  // Spawn loot:
                  if (spawnLoot !== false) {
                    if (Math.random() * 100 <= spawnLootChance) {
                      source.runCommand(`loot spawn ${source.location.x + spawnLootOffsetX} ${source.location.y + spawnLootOffsetY} ${source.location.z + spawnLootOffsetZ} loot "${spawnLoot}"`);
                    }
                  }
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
                  // Decrease item:
                  if (decreaseItem !== false) {
                    if (Math.random() * 100 <= decreaseItemChance) {
                      decreaseItemStack(source, itemStack, decreaseItem, itemSlot);
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
                // Ammunition requirement:
                if (ammunitionType !== false) {
                  if (ammunitionItemStack === undefined || !ammunitionItemStack.hasTag(ammunitionType)) {
                    if (ammunitionFailGuide !== false) {
                      source.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"${ammunitionFailGuide}\"}]}`);
                      source.dimension.playSound("game.player.attack.nodamage", source.location, { pitch: 1.2, volume: 1.0 });
                    }
                  }
                  else {
                    // Ammunition sound effect:
                    if (ammunitionSoundEffect !== false) {
                      source.dimension.playSound(ammunitionSoundEffect, source.location, { pitch: ammunitionSoundPitch, volume: ammunitionSoundVolume });
                    }
                  }
                }
                // Give item:
                if (giveItem !== false) {
                  if (Math.random() * 100 <= giveItemChance) {
                    source.runCommand(`gamerule sendcommandfeedback false`);
                    source.runCommand(`give @s ${giveItem} ${giveItemCount}`);
                    source.runCommand(`gamerule sendcommandfeedback true`);
                  }
                }
                // Release effect:
                if (releaseEffect !== false) {
                  const validMobs = world.getDimension(dimensionId).getEntities({
                    excludeFamilies: [ "inanimate" ],
                    excludeTypes: [ "item" ],
                    excludeTags: [ "ntk:antimagic" ],
                    location: source.location,
                    minDistance: releaseEffectRangeMin,
                    maxDistance: releaseEffectRangeMax,
                  });
                  if (releaseValidBlocks !== false) {
                    if (validBlocks.includes(sourceOnBlock.typeId)) {
                      for (const targetMob of validMobs) {
                        if (detectNearbyEntities(source, dimensionId, releaseEffectRangeMax) === true) {
                          targetMob.addEffect(releaseEffect, releaseEffectDuration, { amplifier: releaseEffectAmplifier, showParticles: releaseEffectParticles });
                          // Target particle effect:
                          if (releaseParticleEffect !== false) {
                            targetMob.dimension.spawnParticle(releaseParticleEffect, { x: targetMob.location.x + releaseParticleOffsetX, y: targetMob.location.y + releaseParticleOffsetY, z: targetMob.location.z + releaseParticleOffsetZ });
                          }
                          // Target sound effect:
                          if (releaseSoundEffect !== false) {
                            targetMob.dimension.playSound(releaseSoundEffect, targetMob.location, { pitch: releaseSoundPitch, volume: releaseSoundVolume });
                          }
                        }
                      }
                    }
                    else {
                      if (releaseFailGuide !== false) {
                        source.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"${releaseFailGuide}\"}]}`);
                        source.dimension.playSound("game.player.attack.nodamage", source.location, { pitch: 1.2, volume: 1.0 });
                        // Cancel the cooldown when used while sneaking:
                        if (itemCooldownCategory !== false) {
                          if (cooldown == cooldownDuration) {
                            system.runTimeout(() => {
                              source.startItemCooldown(itemCooldownCategory, 0 );
                              return;
                            }, 5);
                          }
                        }
                      }
                    }
                  }
                  else {
                    for (const targetMob of validMobs) {
                      if (detectNearbyEntities(source, dimensionId, releaseEffectRangeMax) === true) {
                        targetMob.addEffect(releaseEffect, releaseEffectDuration, { amplifier: releaseEffectAmplifier, showParticles: releaseEffectParticles });
                        // Target particle effect:
                        if (releaseParticleEffect !== false) {
                          targetMob.dimension.spawnParticle(releaseParticleEffect, { x: targetMob.location.x + releaseParticleOffsetX, y: targetMob.location.y + releaseParticleOffsetY, z: targetMob.location.z + releaseParticleOffsetZ });
                        }
                        // Target sound effect:
                        if (releaseSoundEffect !== false) {
                          targetMob.dimension.playSound(releaseSoundEffect, targetMob.location, { pitch: releaseSoundPitch, volume: releaseSoundVolume });
                        }
                      }
                    }
                  }
                }
                // Shoot projectile:
                if (projectileTypeNormal !== false) {
                  if (enhanceAmount === 0) {
                    shootProjectile(projectileTypeNormal, source, shootSoundEffect, shootSoundPitch, shootSoundVolume);
                  }
                  else {
                    shootProjectile(projectileTypeEnhanced, source, shootSoundEffect, shootSoundPitch, shootSoundVolume);
                  }
                }
                // Spawn item:
                if (spawnItem !== false) {
                  if (Math.random() * 100 <= spawnItemChance) {
                    spawnItemStack(source, spawnItem, spawnItemCountMin, spawnItemCountMax);
                  }
                }
                // Spawn loot:
                if (spawnLoot !== false) {
                  if (Math.random() * 100 <= spawnLootChance) {
                    source.runCommand(`loot spawn ${source.location.x + spawnLootOffsetX} ${source.location.y + spawnLootOffsetY} ${source.location.z + spawnLootOffsetZ} loot "${spawnLoot}"`);
                  }
                }
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
                // Decrease item:
                if (decreaseItem !== false) {
                  if (Math.random() * 100 <= decreaseItemChance) {
                    decreaseItemStack(source, itemStack, decreaseItem, itemSlot);
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
    "ntk:on_use", ItemOnUseComponent
  );
});
/*Used in
NIE:
- Powder Staff
NMS:
- Guide Book
*/
