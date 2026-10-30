import { world, system, BlockPermutation, GameMode } from "@minecraft/server";
import { decreaseItemStack } from "../ntk_functions.js";

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
  const player = event.player;
  const itemStack = event.itemStack;
  const block = event.block;
  const fertilizablePlants = [
    "ntk:blooming_corrupted_oak_sapling",
    "ntk:corrupted_oak_sapling",
    "ntk:mossy_willow_sapling",
    "ntk:overgrown_jungle_sapling",
    "ntk:short_moss_sprouts"
  ];
  
  if (itemStack === undefined) return;
  if (fertilizablePlants.includes(block.typeId) && (itemStack.typeId === "minecraft:bone_meal" || itemStack.hasTag("ntk:bone_meal"))) {
    system.run(() => {
      let interaction = false;
      let soilGrowthChance = 0;
      const blockBelow = block.below(1);
      let randomChance = Math.floor(Math.random() * 100.0);
      if (block.typeId === "ntk:blooming_corrupted_oak_sapling") {
        let eventChance = 100;
        let baseGrowthChance = 40;
        let soilBlock = "ntk:fossiliferous_corrupted_dirt";
        if (blockBelow.typeId === soilBlock) {
          soilGrowthChance = 50;
        }
        let growthChance = baseGrowthChance + soilGrowthChance;
        if (itemStack.typeId === "minecraft:bone_meal" || itemStack.hasTag("ntk:bone_meal")) {
          if (Math.random() * 100 <= eventChance) {
            if (randomChance <= growthChance) {
              let randomVariation = Math.random() * 100.0;
              if (randomVariation <= 16.67) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/blooming_corrupted_oak_tree_small_01" ${block.location.x - 4} ${block.location.y - 1} ${block.location.z - 4}`);
              }
              else if (randomVariation <= 33.34) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/blooming_corrupted_oak_tree_small_02" ${block.location.x - 4} ${block.location.y - 1} ${block.location.z - 4}`);
              }
              else if (randomVariation <= 50.01) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/blooming_corrupted_oak_tree_small_03" ${block.location.x - 4} ${block.location.y - 1} ${block.location.z - 4}`);
              }
              else if (randomVariation <= 66.68) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/blooming_corrupted_oak_tree_small_04" ${block.location.x - 4} ${block.location.y - 1} ${block.location.z - 4}`);
              }
              else if (randomVariation <= 100.0) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/blooming_corrupted_oak_tree_large_01" ${block.location.x - 8} ${block.location.y - 1} ${block.location.z - 8}`);
              }
            };
            interaction = true;
          }
        }
      }
      if (block.typeId === "ntk:corrupted_oak_sapling") {
        let eventChance = 100;
        let baseGrowthChance = 40;
        let soilBlock = "ntk:fossiliferous_corrupted_dirt";
        if (blockBelow.typeId === soilBlock) {
          soilGrowthChance = 50;
        }
        let growthChance = baseGrowthChance + soilGrowthChance;
        if (itemStack.typeId === "minecraft:bone_meal" || itemStack.hasTag("ntk:bone_meal")) {
          if (Math.random() * 100 <= eventChance) {
            if (randomChance <= growthChance) {
              let randomVariation = Math.random() * 100.0;
              if (randomVariation <= 20.0) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/corrupted_oak_tree_small_01" ${block.location.x - 2} ${block.location.y - 1} ${block.location.z - 2}`);
              }
              else if (randomVariation <= 40.0) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/corrupted_oak_tree_small_02" ${block.location.x - 2} ${block.location.y - 1} ${block.location.z - 2}`);
              }
              else if (randomVariation <= 60.0) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/corrupted_oak_tree_small_03" ${block.location.x - 2} ${block.location.y - 1} ${block.location.z - 2}`);
              }
              else if (randomVariation <= 80.0) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/corrupted_oak_tree_small_04" ${block.location.x - 2} ${block.location.y - 1} ${block.location.z - 2}`);
              }
              else if (randomVariation <= 100.0) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/corrupted_oak_tree_large_01" ${block.location.x - 6} ${block.location.y - 1} ${block.location.z - 6}`);
              }
            };
            interaction = true;
          }
        }
      }
      if (block.typeId === "ntk:mossy_willow_sapling") {
        let eventChance = 100;
        let baseGrowthChance = 40;
        let soilBlock = "minecraft:moss_block";
        if (blockBelow.typeId === soilBlock) {
          soilGrowthChance = 10;
        }
        let growthChance = baseGrowthChance + soilGrowthChance;
        if (itemStack.typeId === "minecraft:bone_meal" || itemStack.hasTag("ntk:bone_meal")) {
          if (Math.random() * 100 <= eventChance) {
            if (randomChance <= growthChance) {
              let randomVariation = Math.random() * 100.0;
              if (randomVariation <= 20.0) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/mossy_willow_tree_01" ${block.location.x - 3} ${block.location.y - 1} ${block.location.z - 3}`);
              }
              else if (randomVariation <= 40.0) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/mossy_willow_tree_02" ${block.location.x - 3} ${block.location.y - 1} ${block.location.z - 5}`);
              }
              else if (randomVariation <= 60.0) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/mossy_willow_tree_03" ${block.location.x - 3} ${block.location.y - 1} ${block.location.z - 3}`);
              }
              else if (randomVariation <= 80.0) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/mossy_willow_tree_04" ${block.location.x - 3} ${block.location.y - 1} ${block.location.z - 3}`);
              }
              else if (randomVariation <= 100.0) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/mossy_willow_tree_05" ${block.location.x - 4} ${block.location.y - 1} ${block.location.z - 4}`);
              }
            };
            interaction = true;
          }
        }
      }
      if (block.typeId === "ntk:overgrown_jungle_sapling") {
        let eventChance = 100;
        let baseGrowthChance = 40;
        let soilBlock = "minecraft:farmland";
        if (blockBelow.typeId === soilBlock) {
          soilGrowthChance = 10;
        }
        let growthChance = baseGrowthChance + soilGrowthChance;
        if (itemStack.typeId === "minecraft:bone_meal" || itemStack.hasTag("ntk:bone_meal")) {
          if (Math.random() * 100 <= eventChance) {
            if (randomChance <= growthChance) {
              let randomVariation = Math.random() * 100.0;
              if (randomVariation <= 50.0) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/overgrown_jungle_tree_01" ${block.location.x - 7} ${block.location.y - 2} ${block.location.z - 7}`);
              }
              else if (randomVariation <= 100.0) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                block.dimension.runCommand(`structure load "mb/overgrown_jungle_tree_02" ${block.location.x - 5} ${block.location.y - 1} ${block.location.z - 5}`);
              }
            };
            interaction = true;
          }
        }
      }
      if (block.typeId === "ntk:short_moss_sprouts") {
        let eventChance = 100;
        let baseGrowthChance = 100;
        let soilBlock = "minecraft:moss_block";
        if (blockBelow.typeId === soilBlock) {
          soilGrowthChance = 0;
        }
        let growthChance = baseGrowthChance + soilGrowthChance;
        
        if (itemStack.typeId === "minecraft:bone_meal" || itemStack.hasTag("ntk:bone_meal")) {
          if (Math.random() * 100 <= eventChance) {
            if (randomChance <= growthChance) {
              block.setPermutation(BlockPermutation.resolve("ntk:tall_moss_sprouts"));
            };
            interaction = true;
          }
        }
      }
      if (interaction === true) {
        // Decrease item:
        decreaseItemStack(player, itemStack, 1, "Mainhand");
        // Block particle effect:
        block.dimension.spawnParticle("minecraft:crop_growth_emitter", {
          x: block.location.x + 0.5,
          y: block.location.y + 0.5,
          z: block.location.z + 0.5
        });
        // Block sound effect:
        block.dimension.playSound("item.bone_meal.use", block.location, {
          pitch: 1.0,
          volume: 1.0
        });
        return;
      };
    });
  }
  else return;
});
