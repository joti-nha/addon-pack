import { world, system, BlockPermutation, GameMode } from "@minecraft/server";
import { decreaseItemStack } from "../ntk_functions.js";

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
  const player = event.player;
  const itemStack = event.itemStack;
  const block = event.block;
  const fertilizablePlants = [
    "ntk:moss_berry_bush",
    "ntk:mosshroom_fungus",
    "ntk:short_glowcelium_sprouts",
    "ntk:short_mycelium_sprouts",
    "ntk:tall_mycelium_sprouts"
  ];
  
  if (itemStack === undefined) return;
  if (fertilizablePlants.includes(block.typeId) && (itemStack.typeId === "minecraft:bone_meal" || itemStack.hasTag("ntk:bone_meal"))) {
    system.run(() => {
      let interaction = false;
      let soilGrowthChance = 0;
      const blockBelow = block.below(1);
      let randomChance = Math.floor(Math.random() * 100.0);
      if (block.typeId === "ntk:moss_berry_bush") {
        let eventChance = 100; 
        let baseGrowthChance = 100;
        let soilBlock = "minecraft:farmland";
        if (blockBelow.typeId === soilBlock) {
          soilGrowthChance = 0;
        }
        let growthChance = baseGrowthChance + soilGrowthChance;
        if (itemStack.typeId === "minecraft:bone_meal" || itemStack.hasTag("ntk:bone_meal")) {
          if (block.permutation.matches("ntk:moss_berry_bush", { "ntk:growth": 1 })) {
            if (Math.random() * 100 <= eventChance) {
              if (randomChance <= growthChance) {
                block.setPermutation(BlockPermutation.resolve("ntk:moss_berry_bush", { "ntk:growth": 2 }));
              };
              interaction = true;
            }
          }
          else if (block.permutation.matches("ntk:moss_berry_bush", { "ntk:growth": 0 })) {
            if (Math.random() * 100 <= eventChance) {
              if (randomChance <= growthChance) {
                block.setPermutation(BlockPermutation.resolve("ntk:moss_berry_bush", { "ntk:growth": 1 }));
              };
              interaction = true;
            }
          }
        }
      }
      if (block.typeId === "ntk:mosshroom_fungus") {
        let eventChance = 100;
        let baseGrowthChance = 40;
        let soilBlock = "minecraft:moss_block";
        if (blockBelow.typeId === soilBlock) {
          soilGrowthChance = 40;
        }
        let growthChance = baseGrowthChance + soilGrowthChance;
        if (itemStack.typeId === "minecraft:bone_meal" || itemStack.hasTag("ntk:bone_meal")) {
          if (Math.random() * 100 <= eventChance) {
            if (randomChance <= growthChance) {
              const hugeMosshroom = [
                "nce/huge_mosshroom_01",
                "nce/huge_mosshroom_02",
                "nce/huge_mosshroom_03",
                "nce/huge_mosshroom_04",
                "nce/huge_mosshroom_05",
                "nce/huge_mosshroom_06"
              ];
              const randomIndex = Math.floor(Math.random() * hugeMosshroom.length);
              const chosen = hugeMosshroom[randomIndex];
              block.setPermutation(BlockPermutation.resolve("minecraft:air"));
              block.dimension.runCommand(`structure load "${chosen}" ${block.location.x - 2} ${block.location.y} ${block.location.z - 2}`);
            };
            interaction = true;
          }
        }
      }
      if (block.typeId === "ntk:short_glowcelium_sprouts") {
        let eventChance = 100;
        let baseGrowthChance = 100;
        let soilBlock = "minecraft:mycelium";
        if (blockBelow.typeId === soilBlock) {
          soilGrowthChance = 0;
        }
        let growthChance = baseGrowthChance + soilGrowthChance;
        if (itemStack.typeId === "ntk:glowcelium_bone_meal") {
          if (Math.random() * 100 <= eventChance) {
            if (randomChance <= growthChance) {
              block.setPermutation(BlockPermutation.resolve("ntk:tall_glowcelium_sprouts"));
            };
            interaction = true;
          }
        }
        else if (itemStack.typeId !== "ntk:glowcelium_bone_meal") {
          if (Math.random() * 100 <= eventChance) {
            if (randomChance <= growthChance) {
              block.setPermutation(BlockPermutation.resolve("ntk:tall_glowcelium_sprouts"));
            };
            interaction = true;
          }
        }
      }
      if (block.typeId === "ntk:short_mycelium_sprouts") {
        let eventChance = 100;
        let baseGrowthChance = 100;
        let soilBlock = "minecraft:mycelium";
        if (blockBelow.typeId === soilBlock) {
          soilGrowthChance = 0;
        }
        let growthChance = baseGrowthChance + soilGrowthChance;
        if (itemStack.typeId === "ntk:glowcelium_bone_meal") {
          if (Math.random() * 100 <= eventChance) {
            if (randomChance <= growthChance) {
              block.setPermutation(BlockPermutation.resolve("ntk:tall_glowcelium_sprouts"));
            };
            interaction = true;
          }
        }
        else if (itemStack.typeId !== "ntk:glowcelium_bone_meal") {
          if (Math.random() * 100 <= eventChance) {
            if (randomChance <= growthChance) {
              block.setPermutation(BlockPermutation.resolve("ntk:tall_mycelium_sprouts"));
            };
            interaction = true;
          }
        }
      }
      if (block.typeId === "ntk:tall_mycelium_sprouts") {
        let eventChance = 100;
        let baseGrowthChance = 100;
        let soilBlock = "minecraft:mycelium";
        if (blockBelow.typeId === soilBlock) {
          soilGrowthChance = 0;
        }
        let growthChance = baseGrowthChance + soilGrowthChance;
        if (itemStack.typeId === "ntk:glowcelium_bone_meal") {
          if (Math.random() * 100 <= eventChance) {
            if (randomChance <= growthChance) {
              block.setPermutation(BlockPermutation.resolve("ntk:tall_glowcelium_sprouts"));
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
