import { world, system, BlockPermutation, GameMode } from "@minecraft/server";
import { decreaseItemStack } from "./ntk_functions.js";

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
  const player = event.player;
  const itemStack = event.itemStack;
  const block = event.block;
  const blockAllState = block.permutation.getAllStates();
  const blockCardinalState = block.permutation.getState("minecraft:cardinal_direction");
  const blockPillarAxisState = block.permutation.getState("pillar_axis");
  const strippedVanillaWoods = [
    "minecraft:stripped_acacia_log",
    "minecraft:stripped_acacia_wood",
    "minecraft:stripped_bamboo_block",
    "minecraft:stripped_birch_log",
    "minecraft:stripped_birch_wood",
    "minecraft:stripped_cherry_log",
    "minecraft:stripped_cherry_wood",
    "minecraft:stripped_crimson_hyphae",
    "minecraft:stripped_crimson_stem",
    "minecraft:stripped_dark_oak_log",
    "minecraft:stripped_dark_oak_wood",
    "minecraft:stripped_jungle_log",
    "minecraft:stripped_jungle_wood",
    "minecraft:stripped_mangrove_log",
    "minecraft:stripped_mangrove_wood",
    "minecraft:stripped_oak_log",
    "minecraft:stripped_oak_wood",
    "minecraft:stripped_pale_oak_log",
    "minecraft:stripped_pale_oak_wood",
    "minecraft:stripped_spruce_log",
    "minecraft:stripped_spruce_wood",
    "minecraft:stripped_warped_hyphae",
    "minecraft:stripped_warped_stem"
  ];
  const rebarkTag = "ntk:rebarkable";
  
  if (itemStack === undefined) return;
  if (itemStack.typeId === "minecraft:bone_meal" || itemStack.hasTag("ntk:bone_meal")) {
    if (block.hasTag("ntk:stripped_woodcutter") && player.isSneaking) {
      system.run(() => {
        decreaseItemStack(player, itemStack, 1, "Mainhand");
        block.dimension.playSound("item.bone_meal.use", block.location, { pitch: 1.0, volume: 1.0 });
        block.dimension.spawnParticle("ntk:rebark_particle", { x: block.location.x, y: block.location.y, z: block.location.z });
        if (block.permutation.matches("ntk:stripped_acacia_woodcutter")) {
          block.setPermutation(BlockPermutation.resolve("ntk:acacia_woodcutter", { "minecraft:cardinal_direction": blockCardinalState }));
          return;
        }
        if (block.permutation.matches("ntk:stripped_birch_woodcutter")) {
          block.setPermutation(BlockPermutation.resolve("ntk:birch_woodcutter", { "minecraft:cardinal_direction": blockCardinalState }));
          return;
        }
        if (block.permutation.matches("ntk:stripped_cherry_woodcutter")) {
          block.setPermutation(BlockPermutation.resolve("ntk:cherry_woodcutter", { "minecraft:cardinal_direction": blockCardinalState }));
          return;
        }
        if (block.permutation.matches("ntk:stripped_crimson_woodcutter")) {
          block.setPermutation(BlockPermutation.resolve("ntk:crimson_woodcutter", { "minecraft:cardinal_direction": blockCardinalState }));
          return;
        }
        if (block.permutation.matches("ntk:stripped_dark_oak_woodcutter")) {
          block.setPermutation(BlockPermutation.resolve("ntk:darko_oak_woodcutter", { "minecraft:cardinal_direction": blockCardinalState }));
          return;
        }
        if (block.permutation.matches("ntk:stripped_jungle_woodcutter")) {
          block.setPermutation(BlockPermutation.resolve("ntk:jungle_woodcutter", { "minecraft:cardinal_direction": blockCardinalState }));
          return;
        }
        if (block.permutation.matches("ntk:stripped_mangrove_woodcutter")) {
          block.setPermutation(BlockPermutation.resolve("ntk:mangrove_woodcutter", { "minecraft:cardinal_direction": blockCardinalState }));
          return;
        }
        if (block.permutation.matches("ntk:stripped_oak_woodcutter")) {
          block.setPermutation(BlockPermutation.resolve("ntk:oak_woodcutter", { "minecraft:cardinal_direction": blockCardinalState }));
          return;
        }
        if (block.permutation.matches("ntk:stripped_pale_oak_woodcutter")) {
          block.setPermutation(BlockPermutation.resolve("ntk:pale_oak_woodcutter", { "minecraft:cardinal_direction": blockCardinalState }));
          return;
        }
        if (block.permutation.matches("ntk:stripped_spruce_woodcutter")) {
          block.setPermutation(BlockPermutation.resolve("ntk:spruce_woodcutter", { "minecraft:cardinal_direction": blockCardinalState }));
          return;
        }
        if (block.permutation.matches("ntk:stripped_warped_woodcutter")) {
          block.setPermutation(BlockPermutation.resolve("ntk:warped_woodcutter", { "minecraft:cardinal_direction": blockCardinalState }));
          return;
        }
        if (block.permutation.matches("ntk:stripped_corrupted_oak_woodcutter")) {
          block.setPermutation(BlockPermutation.resolve("ntk:corrupted_oak_woodcutter", { "minecraft:cardinal_direction": blockCardinalState }));
          return;
        }
        if (block.permutation.matches("ntk:stripped_mosshroom_woodcutter")) {
          block.setPermutation(BlockPermutation.resolve("ntk:mosshroom_woodcutter", { "minecraft:cardinal_direction": blockCardinalState }));
          return;
        }
        if (block.permutation.matches("ntk:stripped_mossy_willow_woodcutter")) {
          block.setPermutation(BlockPermutation.resolve("ntk:mossy_willow_woodcutter", { "minecraft:cardinal_direction": blockCardinalState }));
          return;
        }
        if (block.permutation.matches("ntk:stripped_overgrown_woodcutter")) {
          block.setPermutation(BlockPermutation.resolve("ntk:overgrown_woodcutter", { "minecraft:cardinal_direction": blockCardinalState }));
          return;
        }
      });
    }
    if (strippedVanillaWoods.includes(block.typeId)) {
      system.run(() => {
        decreaseItemStack(player, itemStack, 1, "Mainhand");
        block.dimension.playSound("item.bone_meal.use", block.location, { pitch: 1.0, volume: 1.0 });
        block.dimension.spawnParticle("ntk:rebark_particle", { x: block.location.x, y: block.location.y, z: block.location.z });
        if (block.permutation.matches("minecraft:stripped_acacia_log")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:acacia_log", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_acacia_wood")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:acacia_wood", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_bamboo_block")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:bamboo_block", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_birch_log")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:birch_log", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_birch_wood")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:birch_wood", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_cherry_log")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:cherry_log", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_cherry_wood")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:cherry_wood", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_crimson_stem")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:crimson_stem", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_crimson_hyphae")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:crimson_hyphae", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_dark_oak_log")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:dark_oak_log", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_dark_oak_wood")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:dark_oak_wood", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_jungle_log")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:jungle_log", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_jungle_wood")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:jungle_wood", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_mangrove_log")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:mangrove_log", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_mangrove_wood")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:mangrove_wood", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_oak_log")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:oak_log", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_oak_wood")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:oak_wood", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_pale_oak_log")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:pale_oak_log", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_pale_oak_wood")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:pale_oak_wood", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_spruce_log")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:spruce_log", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_spruce_wood")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:spruce_wood", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_warped_stem")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:warped_stem", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
        if (block.permutation.matches("minecraft:stripped_warped_hyphae")) {
          block.setPermutation(BlockPermutation.resolve("minecraft:warped_hyphae", { "pillar_axis": blockPillarAxisState } ));
          return;
        }
      });
    }
    if (block.hasTag(rebarkTag)) {
      system.run(() => {
        const strippedId = block.typeId;
        const separator = ":stripped_";
        if (!strippedId.includes(separator)) {
          return;
        }
        const unstrippedId = strippedId.replace(separator, ":");
        try {
          const states = block.permutation.getAllStates();
          const unstrippedPermutation = BlockPermutation.resolve(unstrippedId, states);
          decreaseItemStack(player, itemStack, 1, "Mainhand");
          block.dimension.playSound("item.bone_meal.use", block.location, { pitch: 1.0, volume: 1.0 });
          block.dimension.spawnParticle("ntk:rebark_particle", { x: block.location.x, y: block.location.y, z: block.location.z });
          block.setPermutation(unstrippedPermutation);
        }
        catch (error) {
          console.warn(
            `[Rebark] Unable to rebark "${strippedId}" as "${unstrippedId}": ${error}`
          );
        }
      });
    }
    else {
      return;
    }
  }
  else {
    return;
  }
});
