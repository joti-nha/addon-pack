import { world, system, BlockPermutation, ItemStack } from "@minecraft/server";
import { damageItemDurability, decreaseItemStack } from "../ntk_functions.js";

const BlockCratesOnPlayerInteractComponent = {
  onPlayerInteract({ player, block, dimension, face, faceLocation }, { params }) {
    const source = player
    if (source.isSneaking) return;
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const blockName = child.block_name;
      const blockState = child.block_state;
      const stateValue = child.state_value;
      
      const failOnSneaking = child.fail_on_sneaking ?? false;
      
      const openerItem = child.opener_item;
      const itemSlot = child.item_slot ?? "Mainhand";
      
      const durabilityDamage = child.durability_damage ?? false;
      const durabilityDamageChance = child.durability_damage_chance ?? 100.0;
      
      const decreaseItemCount = child.decrease_item_count ?? false;
      const decreaseItemChance = child.decrease_item_chance ?? 100.0;
      
      const spawnLoot = child.spawn_loot ?? false;
      const spawnLootChance = child.spawn_loot_chance ?? 100.0;
      const spawnLootOffsetX = child.spawn_loot_offset_x ?? 0.0;
      const spawnLootOffsetY = child.spawn_loot_offset_y ?? 0.0;
      const spawnLootOffsetZ = child.spawn_loot_offset_z ?? 0.0;
      
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
        const soundPitch = Math.random() * (soundPitchMax - soundPitchMin) + soundPitchMin;
        
        if (block.permutation.matches(blockName, blockState ? { [blockState]: stateValue } : {})) {
          if (itemStack === undefined) {
            return;
          }
          else {
            if (itemStack.typeId === openerItem) {
              // Durability Damage:
              if (durabilityDamage !== false) {
                if (Math.random() * 100 <= durabilityDamageChance) {
                  damageItemDurability(source, itemStack, durabilityDamage, itemSlot, false);
                }
              }
              // Decrease item:
              if (decreaseItemCount !== false) {
                if (Math.random() * 100 <= decreaseItemChance) {
                  decreaseItemStack(source, itemStack, decreaseItemCount, itemSlot);
                }
              }
              // Spawn loot:
              if (spawnLoot !== false) {
                if (Math.random() * 100 <= spawnLootChance) {
                  block.dimension.runCommand(`loot spawn ${block.location.x + spawnLootOffsetX} ${block.location.y + spawnLootOffsetY} ${block.location.z + spawnLootOffsetZ} loot "${spawnLoot}"`);
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
              return;
            }
            else return;
          }
        }
      }
    }
  },
};
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent(
    "ntk:crates_on_player_interact", BlockCratesOnPlayerInteractComponent
  );
});

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
  const player = event.player;
  const itemStack = event.itemStack;
  const block = event.block;
  
  if (itemStack === undefined) {
    if (block.hasTag("ntk:wood_crate") && !player.isSneaking) {
      const pitchRange = Math.random() * (1.2 - 1.0) + 1.0;
      system.run(() => {
        block.dimension.playSound("game.player.attack.nodamage", block.location, { pitch: pitchRange, volume: 1.0 });
        player.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"§eUse um Machado de Sílex para abrir o caixote.§r\"}]}`);
      });
    }
    if (block.hasTag("ntk:locked_crate") && !player.isSneaking) {
      const pitchRange = Math.random() * (1.0 - 0.8) + 0.8;
      if (block.typeId === "ntk:copper_crate") {
        system.run(() => {
          block.dimension.playSound("block.ntk_locked_crate.lock", block.location, { pitch: pitchRange, volume: 1.0 });
          player.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"§eUse uma Chave de Caixote de Cobre para abrir o caixote.§r\"}]}`);
        });
      }
      if (block.typeId === "ntk:diamond_crate") {
        system.run(() => {
          block.dimension.playSound("block.ntk_locked_crate.lock", block.location, { pitch: pitchRange, volume: 1.0 });
          player.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"§eUse uma Chave de Caixote de Diamante para abrir o caixote.§r\"}]}`);
        });
      }
      if (block.typeId === "ntk:golden_crate") {
        system.run(() => {
          block.dimension.playSound("block.ntk_locked_crate.lock", block.location, { pitch: pitchRange, volume: 1.0 });
          player.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"§eUse uma Chave de Caixote de Ouro para abrir o caixote.§r\"}]}`);
        });
      }
      if (block.typeId === "ntk:iron_crate") {
        system.run(() => {
          block.dimension.playSound("block.ntk_locked_crate.lock", block.location, { pitch: pitchRange, volume: 1.0 });
          player.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"§eUse uma Chave de Caixote de Ferro para abrir o caixote.§r\"}]}`);
        });
      }
      if (block.typeId === "ntk:piglin_crate") {
        system.run(() => {
          block.dimension.playSound("block.ntk_locked_crate.lock", block.location, { pitch: pitchRange, volume: 1.0 });
          player.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"§eUse uma Chave de Caixote Piglin para abrir o caixote.§r\"}]}`);
        });
      }
      if (block.typeId === "ntk:trial_crate") {
        system.run(() => {
          block.dimension.playSound("block.ntk_locked_crate.lock", block.location, { pitch: pitchRange, volume: 1.0 });
          player.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"§eUse uma Chave do Desafio para abrir o caixote.§r\"}]}`);
        });
      }
      if (block.typeId === "ntk:ominous_trial_crate") {
        system.run(() => {
          block.dimension.playSound("block.ntk_locked_crate.lock", block.location, { pitch: pitchRange, volume: 1.0 });
          player.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"§eUse uma Chave do Desafio Sinistra para abrir o caixote.§r\"}]}`);
        });
      }
    }
  }
  else return;
});
/* Used in:
KC:
- Copper Crate
- Diamond Crate
- Golden Crate
- Iron Crate
- Ominous Trial Crate
- Piglin Crate
- Trial Crate
*/