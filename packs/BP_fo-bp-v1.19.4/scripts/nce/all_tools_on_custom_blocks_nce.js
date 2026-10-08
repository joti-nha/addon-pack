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
        "ntk:mosshroom_stem",
        "ntk:mosshroom_hyphae"
      ];
      if (customWoods.includes(block.typeId)) {
        system.run(() => {
          damageItemDurability(player, itemStack, 1, "Mainhand", false);
          if (block.permutation.matches("ntk:mosshroom_hyphae")) {
            block.dimension.playSound("use.stem", block.location, { pitch: 0.8, volume: 1.0 });
            block.setPermutation(BlockPermutation.resolve("ntk:stripped_mosshroom_hyphae", blockAllState ));
            return;
          }
          if (block.permutation.matches("ntk:mosshroom_stem")) {
            block.dimension.playSound("use.stem", block.location, { pitch: 0.8, volume: 1.0 });
            block.setPermutation(BlockPermutation.resolve("ntk:stripped_mosshroom_stem", blockAllState ));
            return;
          }
        });
      }
    }
    if (itemStack.hasTag("minecraft:is_hoe")) {
      const myceliatedBlocks = [
        "ntk:myceliated_deepslate"
      ]
      if (myceliatedBlocks.includes(block.typeId)) {
        system.run(() => {
          const pitchRange = Math.random() * (1.0 - 0.8) + 0.8;
          damageItemDurability(player, itemStack, 1, "Mainhand", false);
          removeAttachedFoliage(itemStack, block, "ntk:short_mycelium_sprouts", 1);
          block.dimension.playSound("use.gravel", block.location, { pitch: pitchRange, volume: 0.8 });
          if (block.permutation.matches("ntk:myceliated_deepslate")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:deepslate"));
          }
        });
      }
    }
  }
  else return;
});
