import { system, BlockPermutation, ItemStack, GameMode } from "@minecraft/server";
import { damageItemDurability, decreaseItemStack, spawnItemStack } from "../ntk_functions.js";

const BlockPolypOnPlayerInteractComponent = {
  onPlayerInteract({ player, block, dimension, face, faceLocation }, { params }) {
    const source = player;
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const blockName = child.block_name;
      const blockState = child.block_state;
      const stateValue = child.state_value;
      const failOnSneaking = child.fail_on_sneaking ?? false;
      const itemSlot = child.item_slot ?? "Mainhand";
      const stackedItem = child.stacked_item;
      const decreaseItem = child.added_item_count ?? false;
      const decreaseItemChance = child.added_item_chance ?? 100.0;
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
      const harvestTool = child.harvest_tool;
      const durabilityDamage = child.durability_damage ?? false;
      const durabilityDamageChance = child.durability_damage_chance ?? 100.0;
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
      const continueHatching = child.continue_hatching;
      const stopHatching = child.stop_hatching;
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
        const validDyes = [
          "minecraft:black_dye",
          "minecraft:blue_dye",
          "minecraft:brown_dye",
          "minecraft:cyan_dye",
          "minecraft:gray_dye",
          "minecraft:green_dye",
          "minecraft:light_blue_dye",
          "minecraft:light_gray_dye",
          "minecraft:lime_dye",
          "minecraft:magenta_dye",
          "minecraft:orange_dye",
          "minecraft:pink_dye",
          "minecraft:purple_dye",
          "minecraft:red_dye",
          "minecraft:white_dye",
          "minecraft:yellow_dye"
        ];
        if (block.permutation.matches(blockName, blockState ? { [blockState]: stateValue } : {})) {
          if (itemStack === undefined) {
            const bubbleSoundPitch = Math.random() * (1.1 - 0.9) + 0.9;
            block.dimension.playSound("bubble.up", block.location, { pitch: bubbleSoundPitch, volume: 1.0 });
            if (block.hasTag("ntk:polyp_1_block")) {
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "north" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "west" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "south" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "east" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
            }
            if (block.hasTag("ntk:polyp_2_block")) {
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "north" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "west" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "south" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.0 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "east" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.0 });
              }
            }
            if (block.hasTag("ntk:polyp_3_block")) {
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "north" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "west" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "south" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "east" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
              }
            }
            if (block.hasTag("ntk:polyp_4_block")) {
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "north" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_4_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "west" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_4_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.0 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "south" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_4_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 0.0 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "east" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_4_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
            }
          }
          else if (itemStack.typeId === stackedItem) {
            if (decreaseItem !== false) {
              if (Math.random() * 100 <= decreaseItemChance) {
                decreaseItemStack(source, itemStack, decreaseItem, itemSlot);
              }
            }
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
            if (increaseSoundEffect !== false) {
              block.dimension.playSound(increaseSoundEffect, block.location, { pitch: increaseSoundPitch, volume: increaseSoundVolume });
            }
          }
          else if (itemStack.typeId === harvestTool) {
            if (durabilityDamage !== false) {
              if (Math.random() * 100 <= durabilityDamageChance) {
                damageItemDurability(source, itemStack, durabilityDamage, itemSlot, false);
              }
            }
            if (spawnItemCount !== false) {
              if (Math.random() * 100 <= spawnItemChance) {
                spawnItemStack(block, stackedItem, spawnItemCount, spawnItemCount);
              }
            }
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
            if (decreaseSoundEffect !== false) {
              block.dimension.playSound(decreaseSoundEffect, block.location, { pitch: decreaseSoundPitch, volume: decreaseSoundVolume });
            }
          }
          else if (itemStack.typeId === continueHatching) {
            if (block.permutation.matches(blockName, { "ntk:hatchable": false })) {
              const hatchableSoundPitch = Math.random() * (1.2 - 1.0) + 1.0;
              decreaseItemStack(source, itemStack, 1, itemSlot);
              block.setPermutation(BlockPermutation.resolve(blockName, { "ntk:hatchable": true, "minecraft:cardinal_direction": blockCardinalState }));
              block.dimension.playSound("item.bone_meal.use", block.location, { pitch: hatchableSoundPitch, volume: 1.0 });
              block.dimension.spawnParticle("ntk:bottle_of_plankton_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              if (continueHatching === "ntk:bottle_of_plankton") {
                const newItem = new ItemStack("minecraft:glass_bottle", 1);
                source.addItem(newItem);
              }
            }
          }
          else if (itemStack.typeId === stopHatching) {
            if (block.permutation.matches(blockName, { "ntk:hatchable": true })) {
              const hatchableSoundPitch = Math.random() * (1.2 - 1.0) + 1.0;
              decreaseItemStack(source, itemStack, 1, itemSlot);
              block.setPermutation(BlockPermutation.resolve(blockName, { "ntk:hatchable": false, "minecraft:cardinal_direction": blockCardinalState }));
              block.dimension.playSound("item.bone_meal.use", block.location, { pitch: hatchableSoundPitch, volume: 1.0 });
              block.dimension.spawnParticle("ntk:jellyfish_polyp_stop_hatching_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
            }
          }
          else if (validDyes.includes(itemStack.typeId)) {
            decreaseItemStack(source, itemStack, 1, "Mainhand");
            block.dimension.playSound("land.slime", block.location, { pitch: 1.0, volume: 0.8 });
            if (itemStack.typeId === "minecraft:black_dye") {
              if (block.hasTag("ntk:polyp_1_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:black_jellyfish_polyp_1_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_2_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:black_jellyfish_polyp_2_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_3_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:black_jellyfish_polyp_3_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_4_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:black_jellyfish_polyp_4_block", blockAllState));
              }
            }
            if (itemStack.typeId === "minecraft:blue_dye") {
              if (block.hasTag("ntk:polyp_1_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:blue_jellyfish_polyp_1_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_2_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:blue_jellyfish_polyp_2_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_3_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:blue_jellyfish_polyp_3_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_4_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:blue_jellyfish_polyp_4_block", blockAllState));
              }
            }
            if (itemStack.typeId === "minecraft:brown_dye") {
              if (block.hasTag("ntk:polyp_1_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:brown_jellyfish_polyp_1_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_2_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:brown_jellyfish_polyp_2_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_3_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:brown_jellyfish_polyp_3_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_4_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:brown_jellyfish_polyp_4_block", blockAllState));
              }
            }
            if (itemStack.typeId === "minecraft:cyan_dye") {
              if (block.hasTag("ntk:polyp_1_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:cyan_jellyfish_polyp_1_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_2_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:cyan_jellyfish_polyp_2_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_3_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:cyan_jellyfish_polyp_3_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_4_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:cyan_jellyfish_polyp_4_block", blockAllState));
              }
            }
            if (itemStack.typeId === "minecraft:gray_dye") {
              if (block.hasTag("ntk:polyp_1_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:gray_jellyfish_polyp_1_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_2_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:gray_jellyfish_polyp_2_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_3_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:gray_jellyfish_polyp_3_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_4_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:gray_jellyfish_polyp_4_block", blockAllState));
              }
            }
            if (itemStack.typeId === "minecraft:green_dye") {
              if (block.hasTag("ntk:polyp_1_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:green_jellyfish_polyp_1_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_2_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:green_jellyfish_polyp_2_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_3_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:green_jellyfish_polyp_3_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_4_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:green_jellyfish_polyp_4_block", blockAllState));
              }
            }
            if (itemStack.typeId === "minecraft:light_blue_dye") {
              if (block.hasTag("ntk:polyp_1_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:light_blue_jellyfish_polyp_1_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_2_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:light_blue_jellyfish_polyp_2_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_3_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:light_blue_jellyfish_polyp_3_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_4_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:light_blue_jellyfish_polyp_4_block", blockAllState));
              }
            }
            if (itemStack.typeId === "minecraft:light_gray_dye") {
              if (block.hasTag("ntk:polyp_1_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:light_gray_jellyfish_polyp_1_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_2_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:light_gray_jellyfish_polyp_2_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_3_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:light_gray_jellyfish_polyp_3_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_4_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:light_gray_jellyfish_polyp_4_block", blockAllState));
              }
            }
            if (itemStack.typeId === "minecraft:lime_dye") {
              if (block.hasTag("ntk:polyp_1_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:lime_jellyfish_polyp_1_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_2_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:lime_jellyfish_polyp_2_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_3_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:lime_jellyfish_polyp_3_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_4_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:lime_jellyfish_polyp_4_block", blockAllState));
              }
            }
            if (itemStack.typeId === "minecraft:magenta_dye") {
              if (block.hasTag("ntk:polyp_1_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:magenta_jellyfish_polyp_1_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_2_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:magenta_jellyfish_polyp_2_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_3_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:magenta_jellyfish_polyp_3_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_4_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:magenta_jellyfish_polyp_4_block", blockAllState));
              }
            }
            if (itemStack.typeId === "minecraft:orange_dye") {
              if (block.hasTag("ntk:polyp_1_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:orange_jellyfish_polyp_1_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_2_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:orange_jellyfish_polyp_2_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_3_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:orange_jellyfish_polyp_3_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_4_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:orange_jellyfish_polyp_4_block", blockAllState));
              }
            }
            if (itemStack.typeId === "minecraft:pink_dye") {
              if (block.hasTag("ntk:polyp_1_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:pink_jellyfish_polyp_1_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_2_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:pink_jellyfish_polyp_2_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_3_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:pink_jellyfish_polyp_3_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_4_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:pink_jellyfish_polyp_4_block", blockAllState));
              }
            }
            if (itemStack.typeId === "minecraft:purple_dye") {
              if (block.hasTag("ntk:polyp_1_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:purple_jellyfish_polyp_1_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_2_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:purple_jellyfish_polyp_2_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_3_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:purple_jellyfish_polyp_3_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_4_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:purple_jellyfish_polyp_4_block", blockAllState));
              }
            }
            if (itemStack.typeId === "minecraft:red_dye") {
              if (block.hasTag("ntk:polyp_1_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:red_jellyfish_polyp_1_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_2_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:red_jellyfish_polyp_2_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_3_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:red_jellyfish_polyp_3_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_4_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:red_jellyfish_polyp_4_block", blockAllState));
              }
            }
            if (itemStack.typeId === "minecraft:white_dye") {
              if (block.hasTag("ntk:polyp_1_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:white_jellyfish_polyp_1_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_2_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:white_jellyfish_polyp_2_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_3_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:white_jellyfish_polyp_3_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_4_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:white_jellyfish_polyp_4_block", blockAllState));
              }
            }
            if (itemStack.typeId === "minecraft:yellow_dye") {
              if (block.hasTag("ntk:polyp_1_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:yellow_jellyfish_polyp_1_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_2_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:yellow_jellyfish_polyp_2_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_3_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:yellow_jellyfish_polyp_3_block", blockAllState));
              }
              if (block.hasTag("ntk:polyp_4_block")) {
                block.setPermutation(BlockPermutation.resolve("ntk:yellow_jellyfish_polyp_4_block", blockAllState));
              }
            }
          }
          else {
            const bubbleSoundPitch = Math.random() * (1.1 - 0.9) + 0.9;
            block.dimension.playSound("bubble.up", block.location, { pitch: bubbleSoundPitch, volume: 1.0 });
            if (block.hasTag("ntk:polyp_1_block")) {
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "north" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "west" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "south" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "east" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
            }
            if (block.hasTag("ntk:polyp_2_block")) {
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "north" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "west" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "south" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.0 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "east" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.0 });
              }
            }
            if (block.hasTag("ntk:polyp_3_block")) {
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "north" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "west" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "south" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "east" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
              }
            }
            if (block.hasTag("ntk:polyp_4_block")) {
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "north" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_4_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "west" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_4_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.0 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "south" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_4_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 0.0 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "east" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                block.dimension.spawnParticle("ntk:jellyfish_polyp_4_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
            }
          };
        }
      }
    }
  },
};
const BlockPolypOnRandomTickComponent = {
  onRandomTick({ block }, { params }) {
    for (const child of params) {
      const eventChance = child.event_chance ?? 100;
      const blockName = child.block_name;
      const blockState = child.block_state;
      const stateValue = child.state_value;
      const particleEffect = child.particle_effect ?? false;
      const soundEffect = child.sound_effect ?? false;
      const soundPitchMin = child.sound_pitch_min ?? 1.0;
      const soundPitchMax = child.sound_pitch_max ?? 1.0;
      const soundVolume = child.sound_volume ?? 1.0;
      if (Math.random() * 100 <= eventChance) {
        const soundPitch = Math.random() * (soundPitchMax - soundPitchMin) + soundPitchMin;
        if (block.permutation.matches(blockName, blockState ? { [blockState]: stateValue } : {})) {
          if (particleEffect !== false) {
            let randomChance = Math.random() * (100.0 - 0.0) + 0.0;
            if (block.hasTag("ntk:polyp_1_block")) {
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "north" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "west" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "south" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "east" })) {
                block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
              }
            }
            if (block.hasTag("ntk:polyp_2_block")) {
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "north" })) {
                if (randomChance <= 50.0) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
                else {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "west" })) {
                if (randomChance <= 50.0) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                }
                else {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "south" })) {
                if (randomChance <= 50.0) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                }
                else {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.0 });
                }
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "east" })) {
                if (randomChance <= 50.0) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
                else {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.0 });
                }
              }
            }
            if (block.hasTag("ntk:polyp_3_block")) {
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "north" })) {
                if (randomChance <= 33.3) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
                else if (randomChance <= 66.6) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
                else {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "west" })) {
                if (randomChance <= 33.3) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                }
                else if (randomChance <= 66.6) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
                else {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "south" })) {
                if (randomChance <= 33.3) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                }
                else if (randomChance <= 66.6) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.0 });
                }
                else {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                }
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "east" })) {
                if (randomChance <= 33.3) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
                else if (randomChance <= 66.6) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.0 });
                }
                else {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                }
              }
            }
            if (block.hasTag("ntk:polyp_4_block")) {
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "north" })) {
                if (randomChance <= 25.0) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
                else if (randomChance <= 50.0) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
                else if (randomChance <= 75.0) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
                else {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_4_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "west" })) {
                if (randomChance <= 25.0) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                }
                else if (randomChance <= 50.0) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
                else if (randomChance <= 75.0) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
                else {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_4_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.0 });
                }
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "south" })) {
                if (randomChance <= 25.0) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                }
                else if (randomChance <= 50.0) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.0 });
                }
                else if (randomChance <= 75.0) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                }
                else {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_4_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 0.0 });
                }
              }
              if (block.permutation.matches(blockName, { "minecraft:cardinal_direction": "east" })) {
                if (randomChance <= 25.0) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_1_bubble_particle", { x: block.location.x + 1.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
                else if (randomChance <= 50.0) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_2_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 0.0 });
                }
                else if (randomChance <= 75.0) {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_3_bubble_particle", { x: block.location.x + 0.5, y: block.location.y + 0.0, z: block.location.z + 1.0 });
                }
                else {
                  block.dimension.spawnParticle("ntk:jellyfish_polyp_4_bubble_particle", { x: block.location.x + 0.0, y: block.location.y + 0.0, z: block.location.z + 0.5 });
                }
              }
            }
          }
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
    "ntk:polyp_on_player_interact", BlockPolypOnPlayerInteractComponent
  );
  blockComponentRegistry.registerCustomComponent(
    "ntk:polyp_on_random_tick", BlockPolypOnRandomTickComponent
  );
});
/* Used in:
NM:
- Jellyfish Polyps (Block)
*/