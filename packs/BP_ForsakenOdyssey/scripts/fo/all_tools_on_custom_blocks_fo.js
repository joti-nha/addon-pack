// Forsaken Odyssey:
import { world, system, BlockPermutation, ItemStack } from "@minecraft/server";
import { damageItemDurability, removeAttachedFoliage } from "../ntk_functions.js";

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
  const player = event.player;
  const itemStack = event.itemStack;
  const block = event.block;
  
  if (itemStack === undefined) return;
  if (itemStack.hasTag("minecraft:is_axe") || itemStack.hasTag("minecraft:is_hoe") || itemStack.hasTag("minecraft:is_shovel")) {
    if (itemStack.hasTag("minecraft:is_hoe")) {
      const grassedBlocks = [
        "ntk:grassed_corrupted_oak_log_side",
        "ntk:grassed_corrupted_oak_log_top",
        "ntk:grassed_mossy_willow_log_side",
        "ntk:grassed_mossy_willow_log_top",
        "ntk:grassed_overgrown_jungle_log_side",
        "ntk:grassed_overgrown_jungle_log_top"
      ];
      if (grassedBlocks.includes(block.typeId)) {
        system.run(() => {
          const pitchRange = Math.random() * (1.0 - 0.8) + 0.8;
          damageItemDurability(player, itemStack, 1, "Mainhand", false);
          removeAttachedFoliage(itemStack, block, "ntk:grass_carpet", 1);
          block.dimension.playSound("use.gravel", block.location, { pitch: pitchRange, volume: 0.8 });
          if (block.permutation.matches("ntk:grassed_corrupted_oak_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            block.setPermutation(BlockPermutation.resolve("ntk:corrupted_oak_log", { "minecraft:block_face": stateCardinalDirection }));
          }
          if (block.permutation.matches("ntk:grassed_corrupted_oak_log_top")) {
            block.setPermutation(BlockPermutation.resolve("ntk:corrupted_oak_log"));
          }
          if (block.permutation.matches("ntk:grassed_mossy_willow_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            block.setPermutation(BlockPermutation.resolve("ntk:mossy_willow_log", { "minecraft:block_face": stateCardinalDirection }));
          }
          if (block.permutation.matches("ntk:grassed_mossy_willow_log_top")) {
            block.setPermutation(BlockPermutation.resolve("ntk:mossy_willow_log"));
          }
          if (block.permutation.matches("ntk:grassed_overgrown_jungle_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            block.setPermutation(BlockPermutation.resolve("ntk:overgrown_jungle_log", { "minecraft:block_face": stateCardinalDirection }));
          }
          if (block.permutation.matches("ntk:grassed_overgrown_jungle_log_top")) {
            block.setPermutation(BlockPermutation.resolve("ntk:overgrown_jungle_log"));
          }
        });
      }
    }
  }
  else return;
});
