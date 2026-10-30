import { world, system, BlockPermutation, ItemStack, GameMode } from "@minecraft/server";
import { damageItemDurability, removeAttachedFoliage } from "../ntk_functions.js";

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
  const player = event.player;
  const itemStack = event.itemStack;
  const block = event.block;
  const blockAllState = block.permutation.getAllStates();
  
  if (itemStack === undefined) return;
  if (itemStack.hasTag("minecraft:is_axe") || itemStack.hasTag("minecraft:is_hoe") || itemStack.hasTag("minecraft:is_shovel")) {
    if (itemStack.hasTag("minecraft:is_axe")) {
      const customWoods = [
        "ntk:corrupted_oak_log",
        "ntk:corrupted_oak_wood",
        "ntk:mossy_willow_log",
        "ntk:mossy_willow_wood",
        "ntk:overgrown_jungle_log",
        "ntk:overgrown_jungle_wood"
      ];
      if (customWoods.includes(block.typeId)) {
        system.run(() => {
          damageItemDurability(player, itemStack, 1, "Mainhand", false);
          if (block.permutation.matches("ntk:corrupted_oak_log")) {
            block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
            block.setPermutation(BlockPermutation.resolve("ntk:stripped_corrupted_oak_log", blockAllState ));
            return;
          }
          if (block.permutation.matches("ntk:corrupted_oak_wood")) {
            block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
            block.setPermutation(BlockPermutation.resolve("ntk:stripped_corrupted_oak_wood", blockAllState ));
            return;
          }
          if (block.permutation.matches("ntk:mossy_willow_log")) {
            block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
            block.setPermutation(BlockPermutation.resolve("ntk:stripped_mossy_willow_log", blockAllState ));
            return;
          }
          if (block.permutation.matches("ntk:mossy_willow_wood")) {
            block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
            block.setPermutation(BlockPermutation.resolve("ntk:stripped_mossy_willow_wood", blockAllState ));
            return;
          }
          if (block.permutation.matches("ntk:overgrown_jungle_log")) {
            block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
            block.setPermutation(BlockPermutation.resolve("ntk:stripped_overgrown_jungle_log", blockAllState ));
            return;
          }
          if (block.permutation.matches("ntk:overgrown_jungle_wood")) {
            block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
            block.setPermutation(BlockPermutation.resolve("ntk:stripped_overgrown_jungle_wood", blockAllState ));
            return;
          }
        });
      }
    }
    if (itemStack.hasTag("minecraft:is_hoe")) {
      const mossedBlocks = [
        "ntk:mossed_corrupted_oak_log_side",
        "ntk:mossed_corrupted_oak_log_top",
        "ntk:mossed_mossy_willow_log_side",
        "ntk:mossed_mossy_willow_log_top",
        "ntk:mossed_overgrown_jungle_log_side",
        "ntk:mossed_overgrown_jungle_log_top"
      ]
      if (mossedBlocks.includes(block.typeId)) {
        system.run(() => {
          const pitchRange = Math.random() * (1.0 - 0.8) + 0.8;
          damageItemDurability(player, itemStack, 1, "Mainhand", false);
          removeAttachedFoliage(itemStack, block, "minecraft:moss_carpet", 1);
          block.dimension.playSound("use.gravel", block.location, { pitch: pitchRange, volume: 0.8 });
          if (block.permutation.matches("ntk:mossed_corrupted_oak_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            block.setPermutation(BlockPermutation.resolve("ntk:corrupted_oak_log", { "minecraft:block_face": stateCardinalDirection }));
          }
          if (block.permutation.matches("ntk:mossed_corrupted_oak_log_top")) {
            block.setPermutation(BlockPermutation.resolve("ntk:corrupted_oak_log"));
          }
          if (block.permutation.matches("ntk:mossed_mossy_willow_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            block.setPermutation(BlockPermutation.resolve("ntk:mossy_willow_log", { "minecraft:block_face": stateCardinalDirection }));
          }
          if (block.permutation.matches("ntk:mossed_mossy_willow_log_top")) {
            block.setPermutation(BlockPermutation.resolve("ntk:mossy_willow_log"));
          }
          if (block.permutation.matches("ntk:mossed_overgrown_jungle_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            block.setPermutation(BlockPermutation.resolve("ntk:overgrown_jungle_log", { "minecraft:block_face": stateCardinalDirection }));
          }
          if (block.permutation.matches("ntk:mossed_overgrown_jungle_log_top")) {
            block.setPermutation(BlockPermutation.resolve("ntk:overgrown_jungle_log"));
          }
        });
      }
    }
  }
  else return;
});
