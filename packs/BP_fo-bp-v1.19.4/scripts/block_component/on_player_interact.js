import { system, BlockPermutation, ItemStack } from "@minecraft/server";
import { damageItemDurability, decreaseItemStack, spawnItemStack } from "../ntk_functions.js";

const BlockOnPlayerInteractComponent = {
  onPlayerInteract({ player, block, dimension, face, faceLocation }, { params }) {
    const source = player;
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const blockName = child.block_name;
      const blockState = child.block_state;
      const stateValue = child.state_value;
      
      const failOnSneaking = child.fail_on_sneaking ?? false;
      
      const itemSlot = child.item_slot ?? "Mainhand";
      const itemType = child.item_type ?? false;
      const itemUndefinedOnly = child.item_undefined_only ?? false;
      
      const interactGuide = child.interact_guide ?? false;
      const interactFailGuide = child.interact_fail_guide ?? false;
      
      const decreaseItem = child.decrease_item ?? false;
      const decreaseItemChance = child.decrease_item_chance ?? 100.0;
      
      const durabilityDamage = child.durability_damage ?? false;
      const durabilityDamageChance = child.durability_damage_chance ?? 100.0;
      
      const giveItem = child.give_item ?? false;
      const giveItemChance = child.give_item_chance ?? 100.0;
      const giveItemCountMin = child.give_item_count_min ?? 1;
      const giveItemCountMax = child.give_item_count_max ?? 1;
      
      const spawnItem = child.spawn_item ?? false;
      const spawnItemChance = child.spawn_item_chance ?? 100.0;
      const spawnItemCountMin = child.spawn_item_count_min ?? 1;
      const spawnItemCountMax = child.spawn_item_count_max ?? 1;
      
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
      
      const spawnStructure = child.spawn_structure ?? false;
      const spawnStructureChance = child.spawn_structure_chance ?? 100.0;
      const spawnStructureOffsetX = child.spawn_structure_offset_x ?? 0;
      const spawnStructureOffsetY = child.spawn_structure_offset_y ?? 0;
      const spawnStructureOffsetZ = child.spawn_structure_offset_z ?? 0;
      
      const changeBlock = child.change_block ?? false;
      const changeBlockChance = child.change_block_chance ?? 100.0;
      const changeBlockState = child.change_block_state ?? false;
      const changeStateValue = child.change_state_value;
      const copyAllBlockState = child.copy_all_block_state ?? false;
      const copyCardinalState = child.copy_cardinal_state ?? false;
      const noBlockState = child.no_block_state ?? false;
      
      const particleEffect = child.particle_effect ?? false;
      const particleOffsetX = child.particle_offset_x ?? 0.0;
      const particleOffsetY = child.particle_offset_y ?? 0.0;
      const particleOffsetZ = child.particle_offset_z ?? 0.0;
      const soundEffect = child.sound_effect ?? false;
      const soundPitchMin = child.sound_pitch_min ?? 1.0;
      const soundPitchMax = child.sound_pitch_max ?? 1.0;
      const soundVolume = child.sound_volume ?? 1.0;
      
      if (failOnSneaking === true) {
        if (source.isSneaking) return;
      }
      if (Math.random() * 100 <= eventChance) {
        const sourceEquippable = source.getComponent("minecraft:equippable");
        if (!sourceEquippable) return;
        const selectedSlot = sourceEquippable.getEquipmentSlot(itemSlot);
        const itemStack = selectedSlot.getItem();
        const blockAllState = block.permutation?.getAllStates();
        const blockCardinalState = block.permutation?.getState("minecraft:cardinal_direction");
        const giveItemCount = Math.floor(Math.random() * (giveItemCountMax - giveItemCountMin + 1)) + giveItemCountMin;
        const soundPitch = Math.random() * (soundPitchMax - soundPitchMin) + soundPitchMin;
        const spawnMobCount = Math.floor(Math.random() * (spawnMobCountMax - spawnMobCountMin + 1)) + spawnMobCountMin;
        const spawnMobSoundPitch = Math.random() * (spawnMobSoundPitchMax - spawnMobSoundPitchMin) + spawnMobSoundPitchMin;
        
        if (block.permutation.matches(blockName, blockState ? { [blockState]: stateValue } : {})) {
          if (itemType !== false) {
            if (itemStack !== undefined) {
              if (itemStack.typeId === itemType || itemStack.hasTag(itemType)) {
                // Interaction Guide:
                if (interactGuide !== false) {
                  source.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"${interactGuide}\"}]}`);
                  source.dimension.playSound("game.player.attack.nodamage", source.location, { pitch: 1.2, volume: 1.0 });
                }
                // Decrease item:
                if (decreaseItem !== false) {
                  if (Math.random() * 100 <= decreaseItemChance) {
                    decreaseItemStack(source, itemStack, decreaseItem, itemSlot);
                  }
                }
                // Durability Damage:
                if (durabilityDamage !== false) {
                  if (Math.random() * 100 <= durabilityDamageChance) {
                    damageItemDurability(source, itemStack, durabilityDamage, itemSlot, false);
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
                // Spawn item from block:
                if (spawnItem !== false) {
                  if (Math.random() * 100 <= spawnItemChance) {
                    spawnItemStack(block, spawnItem, spawnItemCountMin, spawnItemCountMax);
                  }
                }
                // Change block:
                if (changeBlock !== false) {
                  if (Math.random() * 100 <= changeBlockChance) {
                    if (changeBlockState !== false) {
                      block.setPermutation(BlockPermutation.resolve(changeBlock, { [changeBlockState]: changeStateValue }));
                    }
                    if (copyAllBlockState !== false) {
                      block.setPermutation(BlockPermutation.resolve(changeBlock, blockAllState));
                    }
                    if (copyCardinalState !== false) {
                      block.setPermutation(BlockPermutation.resolve(changeBlock, { [changeBlockState]: changeStateValue, "minecraft:cardinal_direction": blockCardinalState }));
                    }
                    if (noBlockState !== false) {
                      block.setPermutation(BlockPermutation.resolve(changeBlock));
                    }
                  }
                }
                // Spawn mob from block:
                if (spawnMob !== false) {
                  if (Math.random() * 100 <= spawnMobChance) {
                    for (let i = 0; i < spawnMobCount; i++) {
                      if (blockCardinalState) {
                        if (blockCardinalState === "north") {
                          block.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} 180 0 ${spawnMobEvent}`);
                        }
                        if (blockCardinalState === "west") {
                          block.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} 90 0 ${spawnMobEvent}`);
                        }
                        if (blockCardinalState === "south") {
                          block.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} 0 0 ${spawnMobEvent}`);
                        }
                        if (blockCardinalState === "east") {
                          block.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} 270 0 ${spawnMobEvent}`);
                        }
                      }
                      else {
                        block.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} facing @p ${spawnMobEvent}`);
                      }
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
                // Spawn structure:
                if (spawnStructure !== false) {
                  if (Math.random() * 100 <= spawnStructureChance) {
                    block.dimension.runCommand(`structure load "${spawnStructure}" ${block.location.x + spawnStructureOffsetX} ${block.location.y + spawnStructureOffsetY} ${block.location.z + spawnStructureOffsetZ}`);
                  }
                }
                // Block particle effect:
                if (particleEffect !== false) {
                  block.dimension.spawnParticle(particleEffect, { x: block.location.x + particleOffsetX, y: block.location.y + particleOffsetY, z: block.location.z + particleOffsetZ });
                }
                // Block sound effect:
                if (soundEffect !== false) {
                  block.dimension.playSound(soundEffect, block.location, { pitch: soundPitch, volume: soundVolume });
                }
              }
              else {
                if (itemUndefinedOnly === false) {
                  if (interactFailGuide !== false) {
                    source.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"${interactFailGuide}\"}]}`);
                    source.dimension.playSound("game.player.attack.nodamage", source.location, { pitch: 1.2, volume: 1.0 });
                  }
                }
              }
            }
            else {
              if (interactFailGuide !== false) {
                source.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"${interactFailGuide}\"}]}`);
                source.dimension.playSound("game.player.attack.nodamage", source.location, { pitch: 1.2, volume: 1.0 });
              }
            }
          }
          else {
            if (itemUndefinedOnly !== false) {
              if (itemStack === undefined) {
                // Interaction Guide:
                if (interactGuide !== false) {
                  source.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"${interactGuide}\"}]}`);
                  source.dimension.playSound("game.player.attack.nodamage", source.location, { pitch: 1.2, volume: 1.0 });
                }
                // Give item:
                if (giveItem !== false) {
                  if (Math.random() * 100 <= giveItemChance) {
                    source.runCommand(`gamerule sendcommandfeedback false`);
                    source.runCommand(`give @s ${giveItem} ${giveItemCount}`);
                    source.runCommand(`gamerule sendcommandfeedback true`);
                  }
                }
                // Spawn item from block:
                if (spawnItem !== false) {
                  if (Math.random() * 100 <= spawnItemChance) {
                    spawnItemStack(block, spawnItem, spawnItemCountMin, spawnItemCountMax);
                  }
                }
                // Change block:
                if (changeBlock !== false) {
                  if (Math.random() * 100 <= changeBlockChance) {
                    if (changeBlockState !== false) {
                      block.setPermutation(BlockPermutation.resolve(changeBlock, { [changeBlockState]: changeStateValue }));
                    }
                    if (copyAllBlockState !== false) {
                      block.setPermutation(BlockPermutation.resolve(changeBlock, blockAllState));
                    }
                    if (copyCardinalState !== false) {
                      block.setPermutation(BlockPermutation.resolve(changeBlock, { [changeBlockState]: changeStateValue, "minecraft:cardinal_direction": blockCardinalState }));
                    }
                    if (noBlockState !== false) {
                      block.setPermutation(BlockPermutation.resolve(changeBlock));
                    }
                  }
                }
                // Spawn mob from block:
                if (spawnMob !== false) {
                  if (Math.random() * 100 <= spawnMobChance) {
                    for (let i = 0; i < spawnMobCount; i++) {
                      if (blockCardinalState) {
                        if (blockCardinalState === "north") {
                          block.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} 180 0 ${spawnMobEvent}`);
                        }
                        if (blockCardinalState === "west") {
                          block.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} 90 0 ${spawnMobEvent}`);
                        }
                        if (blockCardinalState === "south") {
                          block.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} 0 0 ${spawnMobEvent}`);
                        }
                        if (blockCardinalState === "east") {
                          block.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} 270 0 ${spawnMobEvent}`);
                        }
                      }
                      else {
                        block.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} facing @p ${spawnMobEvent}`);
                      }
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
                // Spawn structure:
                if (spawnStructure !== false) {
                  if (Math.random() * 100 <= spawnStructureChance) {
                    block.dimension.runCommand(`structure load "${spawnStructure}" ${block.location.x + spawnStructureOffsetX} ${block.location.y + spawnStructureOffsetY} ${block.location.z + spawnStructureOffsetZ}`);
                  }
                }
                // Block particle effect:
                if (particleEffect !== false) {
                  block.dimension.spawnParticle(particleEffect, { x: block.location.x + particleOffsetX, y: block.location.y + particleOffsetY, z: block.location.z + particleOffsetZ });
                }
                // Block sound effect:
                if (soundEffect !== false) {
                  block.dimension.playSound(soundEffect, block.location, { pitch: soundPitch, volume: soundVolume });
                }
              }
            }
            else {
              // Interaction Guide:
              if (interactGuide !== false) {
                source.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"${interactGuide}\"}]}`);
                source.dimension.playSound("game.player.attack.nodamage", source.location, { pitch: 1.2, volume: 1.0 });
              }
              // Give item:
              if (giveItem !== false) {
                if (Math.random() * 100 <= giveItemChance) {
                  source.runCommand(`gamerule sendcommandfeedback false`);
                  source.runCommand(`give @s ${giveItem} ${giveItemCount}`);
                  source.runCommand(`gamerule sendcommandfeedback true`);
                }
              }
              // Spawn item from block:
              if (spawnItem !== false) {
                if (Math.random() * 100 <= spawnItemChance) {
                  spawnItemStack(block, spawnItem, spawnItemCountMin, spawnItemCountMax);
                }
              }
              // Change block:
              if (changeBlock !== false) {
                if (Math.random() * 100 <= changeBlockChance) {
                  if (changeBlockState !== false) {
                    block.setPermutation(BlockPermutation.resolve(changeBlock, { [changeBlockState]: changeStateValue }));
                  }
                  if (copyAllBlockState !== false) {
                    block.setPermutation(BlockPermutation.resolve(changeBlock, blockAllState));
                  }
                  if (copyCardinalState !== false) {
                    block.setPermutation(BlockPermutation.resolve(changeBlock, { [changeBlockState]: changeStateValue, "minecraft:cardinal_direction": blockCardinalState }));
                  }
                  if (noBlockState !== false) {
                    block.setPermutation(BlockPermutation.resolve(changeBlock));
                  }
                }
              }
              // Spawn mob from block:
              if (spawnMob !== false) {
                if (Math.random() * 100 <= spawnMobChance) {
                  for (let i = 0; i < spawnMobCount; i++) {
                    if (blockCardinalState) {
                      if (blockCardinalState === "north") {
                        block.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} 180 0 ${spawnMobEvent}`);
                      }
                      if (blockCardinalState === "west") {
                        block.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} 90 0 ${spawnMobEvent}`);
                      }
                      if (blockCardinalState === "south") {
                        block.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} 0 0 ${spawnMobEvent}`);
                      }
                      if (blockCardinalState === "east") {
                        block.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} 270 0 ${spawnMobEvent}`);
                      }
                    }
                    else {
                      block.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} facing @p ${spawnMobEvent}`);
                    }
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
              // Spawn structure:
              if (spawnStructure !== false) {
                if (Math.random() * 100 <= spawnStructureChance) {
                  block.dimension.runCommand(`structure load "${spawnStructure}" ${block.location.x + spawnStructureOffsetX} ${block.location.y + spawnStructureOffsetY} ${block.location.z + spawnStructureOffsetZ}`);
                }
              }
              // Block particle effect:
              if (particleEffect !== false) {
                block.dimension.spawnParticle(particleEffect, { x: block.location.x + particleOffsetX, y: block.location.y + particleOffsetY, z: block.location.z + particleOffsetZ });
              }
              // Block sound effect:
              if (soundEffect !== false) {
                block.dimension.playSound(soundEffect, block.location, { pitch: soundPitch, volume: soundVolume });
              }
            }
          }
        }
      }
    }
  },
};
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent(
    "ntk:on_player_interact", BlockOnPlayerInteractComponent
  );
});
/* Used in:
CP:
- Hover Monitor Deploy
- Hover Platform Deploy
- Smasher Bot Deploy
- Solar Drone Deploy
- Solar Laser Drone Deploy
- Stash Bot Deploy
FO:
- Jar of Forest Wisp (Charged)
- Jar of Forest Wisp (Uncharged)
- Jar of Moss Berry Cookies (1-8)
NBE:
- Grafting Table
NIE:
- Artifacture Table
- Empty Jar
- Jar of Chocolate (Full)
- Jar of Chocolate (Half)
- Jar of Cookies (1-8)
- Jar of Glow Berry Cookies (1-8)
- Jar of Glow Berry Juice (Full)
- Jar of Glow Berry Juice (Half)
- Jar of Honey (Full)
- Jar of Honey (Half)
- Jar of Milk (Full)
- Jar of Milk (Half)
- Jar of Sweet Berry Cookies (1-8)
- Jar of Sweet Berry Juice (Full)
- Jar of Sweet Berry Juice (Half)
- Jar of Water (Full)
- Jar of Water (Half)
- Spore Pots
NMS:
- Magic Spells Table
*/ 