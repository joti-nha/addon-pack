import { system, BlockPermutation } from "@minecraft/server";
import { spawnItemStack } from "../ntk_functions.js";

const BlockOnTickComponent = {
  onTick({ block }, { params }) {
    for (const child of params) {
      const eventChance = child.event_chance ?? 100;
      const blockName = child.block_name;
      const blockState = child.block_state;
      const stateValue = child.state_value;
      
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

      if (Math.random() * 100 <= eventChance) {
        const blockAllState = block.permutation?.getAllStates();
        const blockCardinalState = block.permutation?.getState("minecraft:cardinal_direction");
        const soundPitch = Math.random() * (soundPitchMax - soundPitchMin) + soundPitchMin;
        const spawnMobCount = Math.floor(Math.random() * (spawnMobCountMax - spawnMobCountMin + 1)) + spawnMobCountMin;
        const spawnMobSoundPitch = Math.random() * (spawnMobSoundPitchMax - spawnMobSoundPitchMin) + spawnMobSoundPitchMin;
        
        if (block.permutation.matches(blockName, blockState ? { [blockState]: stateValue } : {})) {
          // Spawn item from block:
          if (spawnItem !== false) {
            if (Math.random() * 100 <= spawnItemChance) {
              spawnItemStack(block, spawnItem, spawnItemCountMin, spawnItemCountMax);
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
          return;
        }
      }
    }
  },
};
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent(
    "ntk:on_tick", BlockOnTickComponent
  );
});
/* Used in:
ACT:
- Structure Spawner
ARS:
- Spawner Mobs
CP:
- Structure Spawners
K&C:
- Spawner Crates Trader
- Spawner Piglin Crates Trader
FO:
- Jar of Forest Wisp (Uncharged)
NBE:
- Grafting Table
NCE:
- Glow Bird Egg Block
- Glowceling Egg Block
- Myceling Egg Block
NIE:
- Artifacture Table
- Copper Evaporator with Blue Ice
- Copper Evaporator with Ice
- Copper Evaporator with Lava
- Copper Evaporator with Milk
- Copper Evaporator with Mud
- Copper Evaporator with Packed Ice
- Copper Evaporator with Rotten Flesh
- Copper Evaporator with Snow
- Copper Evaporator with Tearing Lava
- Copper Evaporator with Water
- Metal Evaporator with Blue Ice
- Metal Evaporator with Ice
- Metal Evaporator with Lava
- Metal Evaporator with Milk
- Metal Evaporator with Mud
- Metal Evaporator with Packed Ice
- Metal Evaporator with Rotten Flesh
- Metal Evaporator with Snow
- Metal Evaporator with Tearing Lava
- Metal Evaporator with Water
- Spore Pots
NM:
- Firebird Eggs (Block)
- Hummingbird Eggs (Block)
- Moa Egg Block
- Raven Eggs (Block)
- Soul Firebird Eggs (Block)
- Sparrow Eggs (Block)
- Spawner Book Curserer
- Spawner Cave Dweller
NMD:
- Spawner Mobs
NMS:
- Magic Spells Table
- Spawner Book Keeper
- Spawner Scrollwright
*/ 