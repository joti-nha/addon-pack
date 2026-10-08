import { system, BlockPermutation, GameMode } from "@minecraft/server";
import { changeItem } from "../ntk_functions.js";

const ItemBucketOnUseOnComponent = {
  onUseOn({ block, blockFace, faceLocation, itemStack,  source, usedOnBlockPermutation }, { params }) {
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const itemName = child.item_name;
      const itemSlot = child.item_slot ?? "Mainhand";
      
      const convertItem = child.convert_item ?? false;
      const fluidBlocks = child.fluid_blocks ?? false;
      const changeBlock = child.change_block ?? false;
      
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
      const particleOffsetX = child.particle_offset_x ?? 0.5;
      const particleOffsetY = child.particle_offset_y ?? 0.5;
      const particleOffsetZ = child.particle_offset_z ?? 0.5;
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
          const validFluidBlocks = [
            "minecraft:flowing_lava",
            "minecraft:flowing_water",
            "minecraft:lava",
            "minecraft:water"
          ];
          if (fluidBlocks !== false) {
            if (validFluidBlocks.includes(block.typeId)) {
              if (block.typeId === "minecraft:water" || block.typeId === "minecraft:flowing_water") {
                // Spawn mob from bucket with enhancement:
                if (spawnMob !== false) {
                  if (Math.random() * 100 <= spawnMobChance) {
                    for (let i = 0; i < totalSpawnMobCount; i++) {
                      source.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} facing @p ${spawnMobEvent}`);
                      // Spawn mob particle effect:
                      if (spawnMobParticleEffect !== false) {
                        block.dimension.spawnParticle(spawnMobParticleEffect, { x: block.location.x + spawnMobOffsetX, y: block.location.y + spawnMobOffsetY, z: block.location.z + spawnMobOffsetZ });
                      }
                      // Spawn mob sound effect:
                      if (spawnMobSoundEffect !== false) {
                        block.dimension.playSound(spawnMobSoundEffect, { x: block.location.x + spawnMobOffsetX, y: block.location.y + spawnMobOffsetY, z: block.location.z + spawnMobOffsetZ }, { pitch: spawnMobSoundPitch, volume: spawnMobSoundVolume });
                      }
                    }
                  }
                }
                if (dimensionId !== "nether") {
                  // Change block:
                  if (changeBlock !== false) {
                    block.setType(changeBlock);
                  }
                  // Source sound effect:
                  if (soundEffect !== false) {
                    source.dimension.playSound(soundEffect, source.location, { pitch: soundPitch, volume: soundVolume });
                  }
                }
                else {
                  const pitchRange = Math.random() * (2.4 - 1.8) + 1.8;
                  block.dimension.playSound("random.fizz", block.location, { pitch: pitchRange, volume: 0.5 });
                  block.dimension.spawnParticle("minecraft:water_evaporation_bucket_emitter", { x: block.location.x, y: block.location.y, z: block.location.z });
                }
              }
              if (block.typeId === "minecraft:lava" || block.typeId === "minecraft:flowing_lava") {
                // Spawn mob from bucket with enhancement:
                if (spawnMob !== false) {
                  if (Math.random() * 100 <= spawnMobChance) {
                    for (let i = 0; i < totalSpawnMobCount; i++) {
                      source.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} facing @p ${spawnMobEvent}`);
                      // Spawn mob particle effect:
                      if (spawnMobParticleEffect !== false) {
                        block.dimension.spawnParticle(spawnMobParticleEffect, { x: block.location.x + spawnMobOffsetX, y: block.location.y + spawnMobOffsetY, z: block.location.z + spawnMobOffsetZ });
                      }
                      // Spawn mob sound effect:
                      if (spawnMobSoundEffect !== false) {
                        block.dimension.playSound(spawnMobSoundEffect, { x: block.location.x + spawnMobOffsetX, y: block.location.y + spawnMobOffsetY, z: block.location.z + spawnMobOffsetZ }, { pitch: spawnMobSoundPitch, volume: spawnMobSoundVolume });
                      }
                    }
                  }
                }
                if (dimensionId !== "nether") {
                  // Change block:
                  if (changeBlock !== false) {
                    block.setType(changeBlock);
                  }
                  // Source sound effect:
                  if (soundEffect !== false) {
                    source.dimension.playSound(soundEffect, source.location, { pitch: soundPitch, volume: soundVolume });
                  }
                }
                else {
                  block.dimension.playSound("bucket.empty_lava", block.location, { pitch: 1.0, volume: 1.0 });
                  block.dimension.spawnParticle("minecraft:water_evaporation_bucket_emitter", { x: block.location.x, y: block.location.y, z: block.location.z });
                }
              }
            }
            else {
              if (blockFace === "Up") {
                // Spawn mob from bucket with enhancement:
                if (spawnMob !== false) {
                  if (Math.random() * 100 <= spawnMobChance) {
                    for (let i = 0; i < totalSpawnMobCount; i++) {
                      source.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY + 1.0} ${block.location.z + spawnMobOffsetZ} facing @p ${spawnMobEvent}`);
                      // Spawn mob particle effect:
                      if (spawnMobParticleEffect !== false) {
                        block.dimension.spawnParticle(spawnMobParticleEffect, { x: block.location.x + spawnMobOffsetX, y: block.location.y + spawnMobOffsetY + 1.0, z: block.location.z + spawnMobOffsetZ });
                      }
                      // Spawn mob sound effect:
                      if (spawnMobSoundEffect !== false) {
                        block.dimension.playSound(spawnMobSoundEffect, { x: block.location.x + spawnMobOffsetX, y: block.location.y + spawnMobOffsetY + 1.0, z: block.location.z + spawnMobOffsetZ }, { pitch: spawnMobSoundPitch, volume: spawnMobSoundVolume });
                      }
                    }
                  }
                }
                if (dimensionId !== "nether") {
                  // Change block:
                  if (changeBlock !== false) {
                    block.above(1).setType(changeBlock);
                  }
                  // Source sound effect:
                  if (soundEffect !== false) {
                    source.dimension.playSound(soundEffect, source.location, { pitch: soundPitch, volume: soundVolume });
                  }
                }
                else {
                  const pitchRange = Math.random() * (2.4 - 1.8) + 1.8;
                  block.dimension.playSound("random.fizz", block.location, { pitch: pitchRange, volume: 0.5 });
                  block.dimension.spawnParticle("minecraft:water_evaporation_bucket_emitter", {
                    x: block.location.x,
                    y: block.location.y + 1.0,
                    z: block.location.z
                  });
                }
              }
              if (blockFace === "Down") {
                // Spawn mob from bucket with enhancement:
                if (spawnMob !== false) {
                  if (Math.random() * 100 <= spawnMobChance) {
                    for (let i = 0; i < totalSpawnMobCount; i++) {
                      source.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY - 1.0} ${block.location.z + spawnMobOffsetZ} facing @p ${spawnMobEvent}`);
                      // Spawn mob particle effect:
                      if (spawnMobParticleEffect !== false) {
                        block.dimension.spawnParticle(spawnMobParticleEffect, { x: block.location.x + spawnMobOffsetX, y: block.location.y + spawnMobOffsetY - 1.0, z: block.location.z + spawnMobOffsetZ });
                      }
                      // Spawn mob sound effect:
                      if (spawnMobSoundEffect !== false) {
                        block.dimension.playSound(spawnMobSoundEffect, { x: block.location.x + spawnMobOffsetX, y: block.location.y + spawnMobOffsetY - 1.0, z: block.location.z + spawnMobOffsetZ }, { pitch: spawnMobSoundPitch, volume: spawnMobSoundVolume });
                      }
                    }
                  }
                }
                if (dimensionId !== "nether") {
                  // Change block:
                  if (changeBlock !== false) {
                    block.below(1).setType(changeBlock);
                  }
                  // Source sound effect:
                  if (soundEffect !== false) {
                    source.dimension.playSound(soundEffect, source.location, { pitch: soundPitch, volume: soundVolume });
                  }
                }
                else {
                  const pitchRange = Math.random() * (2.4 - 1.8) + 1.8;
                  block.dimension.playSound("random.fizz", block.location, { pitch: pitchRange, volume: 0.5 });
                  block.dimension.spawnParticle("minecraft:water_evaporation_bucket_emitter", {
                    x: block.location.x,
                    y: block.location.y - 1.0,
                    z: block.location.z
                  });
                }
              }
              if (blockFace === "North") {
                // Spawn mob from bucket with enhancement:
                if (spawnMob !== false) {
                  if (Math.random() * 100 <= spawnMobChance) {
                    for (let i = 0; i < totalSpawnMobCount; i++) {
                      source.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ - 1.0} facing @p ${spawnMobEvent}`);
                      // Spawn mob particle effect:
                      if (spawnMobParticleEffect !== false) {
                        block.dimension.spawnParticle(spawnMobParticleEffect, { x: block.location.x + spawnMobOffsetX, y: block.location.y + spawnMobOffsetY, z: block.location.z + spawnMobOffsetZ - 1.0 });
                      }
                      // Spawn mob sound effect:
                      if (spawnMobSoundEffect !== false) {
                        block.dimension.playSound(spawnMobSoundEffect, { x: block.location.x + spawnMobOffsetX, y: block.location.y + spawnMobOffsetY, z: block.location.z + spawnMobOffsetZ - 1.0 }, { pitch: spawnMobSoundPitch, volume: spawnMobSoundVolume });
                      }
                    }
                  }
                }
                if (dimensionId !== "nether") {
                  // Change block:
                  if (changeBlock !== false) {
                    block.north(1).setType(changeBlock);
                  }
                  // Source sound effect:
                  if (soundEffect !== false) {
                    source.dimension.playSound(soundEffect, source.location, { pitch: soundPitch, volume: soundVolume });
                  }
                }
                else {
                  const pitchRange = Math.random() * (2.4 - 1.8) + 1.8;
                  block.dimension.playSound("random.fizz", block.location, { pitch: pitchRange, volume: 0.5 });
                  block.dimension.spawnParticle("minecraft:water_evaporation_bucket_emitter", {
                    x: block.location.x,
                    y: block.location.y,
                    z: block.location.z - 1.0
                  });
                }
              }
              if (blockFace === "South") {
                // Spawn mob from bucket with enhancement:
                if (spawnMob !== false) {
                  if (Math.random() * 100 <= spawnMobChance) {
                    for (let i = 0; i < totalSpawnMobCount; i++) {
                      source.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ + 1.0} facing @p ${spawnMobEvent}`);
                      // Spawn mob particle effect:
                      if (spawnMobParticleEffect !== false) {
                        block.dimension.spawnParticle(spawnMobParticleEffect, { x: block.location.x + spawnMobOffsetX, y: block.location.y + spawnMobOffsetY, z: block.location.z + spawnMobOffsetZ + 1.0 });
                      }
                      // Spawn mob sound effect:
                      if (spawnMobSoundEffect !== false) {
                        block.dimension.playSound(spawnMobSoundEffect, { x: block.location.x + spawnMobOffsetX, y: block.location.y + spawnMobOffsetY, z: block.location.z + spawnMobOffsetZ + 1.0 }, { pitch: spawnMobSoundPitch, volume: spawnMobSoundVolume });
                      }
                    }
                  }
                }
                if (dimensionId !== "nether") {
                  // Change block:
                  if (changeBlock !== false) {
                    block.south(1).setType(changeBlock);
                  }
                  // Source sound effect:
                  if (soundEffect !== false) {
                    source.dimension.playSound(soundEffect, source.location, { pitch: soundPitch, volume: soundVolume });
                  }
                }
                else {
                  const pitchRange = Math.random() * (2.4 - 1.8) + 1.8;
                  block.dimension.playSound("random.fizz", block.location, { pitch: pitchRange, volume: 0.5 });
                  block.dimension.spawnParticle("minecraft:water_evaporation_bucket_emitter", {
                    x: block.location.x,
                    y: block.location.y,
                    z: block.location.z + 1.0
                  });
                }
              }
              if (blockFace === "East") {
                // Spawn mob from bucket with enhancement:
                if (spawnMob !== false) {
                  if (Math.random() * 100 <= spawnMobChance) {
                    for (let i = 0; i < totalSpawnMobCount; i++) {
                      source.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX + 1.0} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} facing @p ${spawnMobEvent}`);
                      // Spawn mob particle effect:
                      if (spawnMobParticleEffect !== false) {
                        block.dimension.spawnParticle(spawnMobParticleEffect, { x: block.location.x + spawnMobOffsetX + 1.0, y: block.location.y + spawnMobOffsetY, z: block.location.z + spawnMobOffsetZ });
                      }
                      // Spawn mob sound effect:
                      if (spawnMobSoundEffect !== false) {
                        block.dimension.playSound(spawnMobSoundEffect, { x: block.location.x + spawnMobOffsetX + 1.0, y: block.location.y + spawnMobOffsetY, z: block.location.z + spawnMobOffsetZ }, { pitch: spawnMobSoundPitch, volume: spawnMobSoundVolume });
                      }
                    }
                  }
                }
                if (dimensionId !== "nether") {
                  // Change block:
                  if (changeBlock !== false) {
                    block.east(1).setType(changeBlock);
                  }
                  // Source sound effect:
                  if (soundEffect !== false) {
                    source.dimension.playSound(soundEffect, source.location, { pitch: soundPitch, volume: soundVolume });
                  }
                }
                else {
                  const pitchRange = Math.random() * (2.4 - 1.8) + 1.8;
                  block.dimension.playSound("random.fizz", block.location, { pitch: pitchRange, volume: 0.5 });
                  block.dimension.spawnParticle("minecraft:water_evaporation_bucket_emitter", {
                    x: block.location.x + 1.0,
                    y: block.location.y,
                    z: block.location.z
                  });
                }
              }
              if (blockFace === "West") {
                // Spawn mob from bucket with enhancement:
                if (spawnMob !== false) {
                  if (Math.random() * 100 <= spawnMobChance) {
                    for (let i = 0; i < totalSpawnMobCount; i++) {
                      source.dimension.runCommand(`summon ${spawnMob} ${block.location.x + spawnMobOffsetX - 1.0} ${block.location.y + spawnMobOffsetY} ${block.location.z + spawnMobOffsetZ} facing @p ${spawnMobEvent}`);
                      // Spawn mob particle effect:
                      if (spawnMobParticleEffect !== false) {
                        block.dimension.spawnParticle(spawnMobParticleEffect, { x: block.location.x + spawnMobOffsetX - 1.0, y: block.location.y + spawnMobOffsetY, z: block.location.z + spawnMobOffsetZ });
                      }
                      // Spawn mob sound effect:
                      if (spawnMobSoundEffect !== false) {
                        block.dimension.playSound(spawnMobSoundEffect, { x: block.location.x + spawnMobOffsetX - 1.0, y: block.location.y + spawnMobOffsetY, z: block.location.z + spawnMobOffsetZ }, { pitch: spawnMobSoundPitch, volume: spawnMobSoundVolume });
                      }
                    }
                  }
                }
                if (dimensionId !== "nether") {
                  // Change block:
                  if (changeBlock !== false) {
                    block.west(1).setType(changeBlock);
                  }
                  // Source sound effect:
                  if (soundEffect !== false) {
                    source.dimension.playSound(soundEffect, source.location, { pitch: soundPitch, volume: soundVolume });
                  }
                }
                else {
                  const pitchRange = Math.random() * (2.4 - 1.8) + 1.8;
                  block.dimension.playSound("random.fizz", block.location, { pitch: pitchRange, volume: 0.5 });
                  block.dimension.spawnParticle("minecraft:water_evaporation_bucket_emitter", {
                    x: block.location.x - 1.0,
                    y: block.location.y,
                    z: block.location.z
                  });
                }
              }
            }
          }
          if (convertItem !== false) {
            if (source.getGameMode() !== GameMode.Creative) {
              changeItem(source, itemStack, convertItem, 1, itemSlot);
            }
          }
        }
      }
    }
  },
};
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent(
    "ntk:bucket_on_use_on", ItemBucketOnUseOnComponent
  );
});
/*Used in:
NM:
- Bucket of Jellyfish
- Bucket of Prismarine Clam
*/