import { system, BlockPermutation, ItemStack, GameMode } from "@minecraft/server";
import { decreaseItemStack, spawnItemStack } from "../ntk_functions.js";

const BlockStackingOnPlayerInteractComponent = {
  onPlayerInteract({ player, block, dimension, face, faceLocation }, { params }) {
    const source = player;
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const blockName = child.block_name;
      const blockState = child.block_state;
      const stateValue = child.state_value;
      
      const failOnSneaking = child.fail_on_sneaking ?? false;
      
      const stackedItem = child.stacked_item;
      const itemSlot = child.item_slot ?? "Mainhand";
      const decreaseItemCount = child.added_item_count ?? false;
      const decreaseItemChance = child.added_item_chance ?? 100.0;
      const spawnItemCount = child.removed_item_count ?? false;
      const spawnItemChance = child.removed_item_chance ?? 100.0;
      
      const decreaseChangeBlock = child.decrease_change_block ?? false;
      const decreaseChangeBlockChance = child.decrease_change_block_chance ?? 100.0;
      const decreaseChangeBlockState = child.decrease_change_block_state ?? false;
      const decreaseChangeStateValue = child.decrease_change_state_value;
      const decreaseCopyAllBlockState = child.decrease_copy_all_block_state ?? false;
      const decreaseCopyCardinalState = child.decrease_copy_cardinal_state ?? false;
      const decreaseNoBlockState = child.decrease_no_block_state ?? false;
      
      const decreaseSoundEffect = child.decrease_sound_effect ?? false;
      const decreaseSoundPitchMin = child.decrease_sound_pitch_min ?? 1.0;
      const decreaseSoundPitchMax = child.decrease_sound_pitch_max ?? 1.0;
      const decreaseSoundVolume = child.decrease_sound_volume ?? 1.0;
      
      const increaseChangeBlock = child.increase_change_block ?? false;
      const increaseChangeBlockChance = child.increase_change_block_chance ?? 100.0;
      const increaseChangeBlockState = child.increase_change_block_state ?? false;
      const increaseChangeStateValue = child.increase_change_state_value;
      const increaseCopyAllBlockState = child.increase_copy_all_block_state ?? false;
      const increaseCopyCardinalState = child.increase_copy_cardinal_state ?? false;
      const increaseNoBlockState = child.increase_no_block_state ?? false;
      
      const increaseSoundEffect = child.increase_sound_effect ?? false;
      const increaseSoundPitchMin = child.increase_sound_pitch_min ?? 1.0;
      const increaseSoundPitchMax = child.increase_sound_pitch_max ?? 1.0;
      const increaseSoundVolume = child.increase_sound_volume ?? 1.0;
      
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
        const decreaseSoundPitch = Math.random() * (decreaseSoundPitchMax - decreaseSoundPitchMin) + decreaseSoundPitchMin;
        const increaseSoundPitch = Math.random() * (increaseSoundPitchMax - increaseSoundPitchMin) + increaseSoundPitchMin;
        
        if (block.permutation.matches(blockName, blockState ? { [blockState]: stateValue } : {})) {
          // Decrease:
          if (itemStack === undefined || itemStack.typeId !== stackedItem) {
            // Spawn item from block:
            if (spawnItemCount !== false) {
              if (Math.random() * 100 <= spawnItemChance) {
                spawnItemStack(block, stackedItem, spawnItemCount, spawnItemCount);
              }
            }
            // Change block:
            if (decreaseChangeBlock !== false) {
              if (Math.random() * 100 <= decreaseChangeBlockChance) {
                if (decreaseChangeBlockState !== false) {
                  block.setPermutation(BlockPermutation.resolve(decreaseChangeBlock, { [decreaseChangeBlockState]: decreaseChangeStateValue }));
                }
                if (decreaseCopyAllBlockState !== false) {
                  block.setPermutation(BlockPermutation.resolve(decreaseChangeBlock, blockAllState));
                }
                if (decreaseCopyCardinalState !== false) {
                  block.setPermutation(BlockPermutation.resolve(decreaseChangeBlock, { [decreaseChangeBlockState]: decreaseChangeStateValue, "minecraft:cardinal_direction": blockCardinalState }));
                }
                if (decreaseNoBlockState !== false) {
                  block.setPermutation(BlockPermutation.resolve(decreaseChangeBlock));
                }
              }
            }
            // Block sound effect:
            if (decreaseSoundEffect !== false) {
              block.dimension.playSound(decreaseSoundEffect, block.location, { pitch: decreaseSoundPitch, volume: decreaseSoundVolume });
            }
          }
          // Increase:
          else if (itemStack.typeId === stackedItem) {
            // Decrease item:
            if (decreaseItemCount !== false) {
              if (Math.random() * 100 <= decreaseItemChance) {
                decreaseItemStack(source, itemStack, decreaseItemCount, itemSlot);
              }
            }
            // Change block:
            if (increaseChangeBlock !== false) {
              if (Math.random() * 100 <= increaseChangeBlockChance) {
                if (increaseChangeBlockState !== false) {
                  block.setPermutation(BlockPermutation.resolve(increaseChangeBlock, { [increaseChangeBlockState]: increaseChangeStateValue }));
                }
                if (increaseCopyAllBlockState !== false) {
                  block.setPermutation(BlockPermutation.resolve(increaseChangeBlock, blockAllState));
                }
                if (increaseCopyCardinalState !== false) {
                  block.setPermutation(BlockPermutation.resolve(increaseChangeBlock, { [increaseChangeBlockState]: increaseChangeStateValue, "minecraft:cardinal_direction": blockCardinalState }));
                }
                if (increaseNoBlockState !== false) {
                  block.setPermutation(BlockPermutation.resolve(increaseChangeBlock));
                }
              }
            }
            // Block sound effect:
            if (increaseSoundEffect !== false) {
              block.dimension.playSound(increaseSoundEffect, block.location, { pitch: increaseSoundPitch, volume: increaseSoundVolume });
            }
          }
          return;
        }
      }
    }
  },
};
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent(
    "ntk:stacking_on_player_interact", BlockStackingOnPlayerInteractComponent
  );
});
/* Used in:
NBE:
- Pile of Bones
NCE:
- Glowbird Eggs (Block)
NM:
- Firebird Eggs (Block)
- Hummingbird Eggs (Block)
- Raven Eggs (Block)
- Soul Firebird Eggs (Block)
- Sparrow Eggs (Block)
*/