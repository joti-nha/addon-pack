import { world, system, BlockPermutation, ItemStack, GameMode } from "@minecraft/server";
import { damageItemDurability, removeAttachedFoliage } from "../ntk_functions.js";

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
  const player = event.player;
  const itemStack = event.itemStack;
  const block = event.block;
  
  if (itemStack === undefined) return;
  if (itemStack.hasTag("minecraft:is_axe") || itemStack.hasTag("minecraft:is_hoe") || itemStack.hasTag("minecraft:is_shovel")) {
    if (itemStack.hasTag("minecraft:is_hoe")) {
      const grassedBlocks = [
        "ntk:grassed_stone",
        "ntk:grassed_oak_log_side",
        "ntk:grassed_oak_log_top",
        "ntk:grassed_spruce_log_side",
        "ntk:grassed_spruce_log_top",
        "ntk:grassed_birch_log_side",
        "ntk:grassed_birch_log_top",
        "ntk:grassed_jungle_log_side",
        "ntk:grassed_jungle_log_top",
        "ntk:grassed_acacia_log_side",
        "ntk:grassed_acacia_log_top",
        "ntk:grassed_dark_oak_log_side",
        "ntk:grassed_dark_oak_log_top",
        "ntk:grassed_mangrove_log_side",
        "ntk:grassed_mangrove_log_top",
        "ntk:grassed_cherry_log_side",
        "ntk:grassed_cherry_log_top",
        "ntk:grassed_pale_oak_log_side",
        "ntk:grassed_pale_oak_log_top"
      ];
      const mossedBlocks = [
        "ntk:mossed_stone",
        "ntk:mossed_oak_log_side",
        "ntk:mossed_oak_log_top",
        "ntk:mossed_spruce_log_side",
        "ntk:mossed_spruce_log_top",
        "ntk:mossed_birch_log_side",
        "ntk:mossed_birch_log_top",
        "ntk:mossed_jungle_log_side",
        "ntk:mossed_jungle_log_top",
        "ntk:mossed_acacia_log_side",
        "ntk:mossed_acacia_log_top",
        "ntk:mossed_dark_oak_log_side",
        "ntk:mossed_dark_oak_log_top",
        "ntk:mossed_mangrove_log_side",
        "ntk:mossed_mangrove_log_top",
        "ntk:mossed_cherry_log_side",
        "ntk:mossed_cherry_log_top",
        "ntk:mossed_pale_oak_log_side",
        "ntk:mossed_pale_oak_log_top"
      ];
      if (grassedBlocks.includes(block.typeId)) {
        system.run(() => {
          const pitchRange = Math.random() * (1.0 - 0.8) + 0.8;
          damageItemDurability(player, itemStack, 1, "Mainhand", false);
          removeAttachedFoliage(itemStack, block, "ntk:grass_carpet", 1);
          block.dimension.playSound("use.gravel", block.location, { pitch: pitchRange, volume: 0.8 });
          if (block.permutation.matches("ntk:grassed_stone")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:stone"));
          }
          if (block.permutation.matches("ntk:grassed_oak_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:oak_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:oak_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:grassed_oak_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:oak_log"));
          }
          if (block.permutation.matches("ntk:grassed_spruce_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:spruce_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:spruce_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:grassed_spruce_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:spruce_log"));
          }
          if (block.permutation.matches("ntk:grassed_birch_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:birch_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:birch_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:grassed_birch_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:birch_log"));
          }
          if (block.permutation.matches("ntk:grassed_jungle_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:jungle_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:jungle_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:grassed_jungle_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:jungle_log"));
          }
          if (block.permutation.matches("ntk:grassed_acacia_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:acacia_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:acacia_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:grassed_acacia_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:acacia_log"));
          }
          if (block.permutation.matches("ntk:grassed_dark_oak_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:dark_oak_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:dark_oak_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:grassed_dark_oak_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:dark_oak_log"));
          }
          if (block.permutation.matches("ntk:grassed_mangrove_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:mangrove_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:mangrove_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:grassed_mangrove_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:mangrove_log"));
          }
          if (block.permutation.matches("ntk:grassed_cherry_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:cherry_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:cherry_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:grassed_cherry_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:cherry_log"));
          }
          if (block.permutation.matches("ntk:grassed_pale_oak_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:pale_oak_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:pale_oak_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:grassed_pale_oak_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:pale_oak_log"));
          }
        });
      }
      if (mossedBlocks.includes(block.typeId)) {
        system.run(() => {
          const pitchRange = Math.random() * (1.0 - 0.8) + 0.8;
          damageItemDurability(player, itemStack, 1, "Mainhand", false);
          removeAttachedFoliage(itemStack, block, "minecraft:moss_carpet", 1);
          block.dimension.playSound("use.gravel", block.location, { pitch: pitchRange, volume: 0.8 });
          if (block.permutation.matches("ntk:mossed_stone")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:stone"));
          }
          if (block.permutation.matches("ntk:mossed_oak_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:oak_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:oak_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:mossed_oak_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:oak_log"));
          }
          if (block.permutation.matches("ntk:mossed_spruce_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:spruce_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:spruce_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:mossed_spruce_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:spruce_log"));
          }
          if (block.permutation.matches("ntk:mossed_birch_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:birch_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:birch_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:mossed_birch_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:birch_log"));
          }
          if (block.permutation.matches("ntk:mossed_jungle_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:jungle_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:jungle_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:mossed_jungle_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:jungle_log"));
          }
          if (block.permutation.matches("ntk:mossed_acacia_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:acacia_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:acacia_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:mossed_acacia_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:acacia_log"));
          }
          if (block.permutation.matches("ntk:mossed_dark_oak_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:dark_oak_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:dark_oak_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:mossed_dark_oak_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:dark_oak_log"));
          }
          if (block.permutation.matches("ntk:mossed_mangrove_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:mangrove_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:mangrove_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:mossed_mangrove_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:mangrove_log"));
          }
          if (block.permutation.matches("ntk:mossed_cherry_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:cherry_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:cherry_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:mossed_cherry_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:cherry_log"));
          }
          if (block.permutation.matches("ntk:mossed_pale_oak_log_side")) {
            const stateCardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            if (stateCardinalDirection === "east" || stateCardinalDirection === "west") {
              block.setPermutation(BlockPermutation.resolve("minecraft:pale_oak_log", { "pillar_axis": "x" }));
            }
            else if (stateCardinalDirection === "north" || stateCardinalDirection === "south") {
              block.setPermutation(BlockPermutation.resolve("minecraft:pale_oak_log", { "pillar_axis": "z" }));
            }
          }
          if (block.permutation.matches("ntk:mossed_pale_oak_log_top")) {
            block.setPermutation(BlockPermutation.resolve("minecraft:pale_oak_log"));
          }
        });
      }
    }
  }
  else return;
});
