import { world, system, BlockPermutation, ItemStack, GameMode } from "@minecraft/server";
import { damageItemDurability, woodStrippedSound } from "../ntk_functions.js";
import { vanillaWoods } from "../ntk_listing.js";

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
  const player = event.player;
  const itemStack = event.itemStack;
  const block = event.block;
  const customAxes = [
    "ntk:brass_axe",
    "ntk:bronze_axe",
    "ntk:olivine_axe",
    "ntk:tin_axe",
    "ntk:zinc_axe"
  ];
  const customHoes = [
    "ntk:brass_hoe",
    "ntk:bronze_hoe",
    "ntk:olivine_hoe",
    "ntk:tin_hoe",
    "ntk:zinc_hoe"
  ];
  const customShovels = [
    "ntk:brass_shovel",
    "ntk:bronze_shovel",
    "ntk:olivine_shovel",
    "ntk:tin_shovel",
    "ntk:zinc_shovel"
  ];
  
  if (itemStack === undefined) return;
  if (customAxes.includes(itemStack.typeId) || customHoes.includes(itemStack.typeId) || customShovels.includes(itemStack.typeId)) {
    if (customAxes.includes(itemStack.typeId)) {
      if (vanillaWoods.includes(block.typeId)) {
        system.run(() => {
          damageItemDurability(player, itemStack, 1, "Mainhand", false);
          woodStrippedSound(block);
        });
      }
    }
    if (customHoes.includes(itemStack.typeId)) {
      const vanillaFarmSoil = [
        "minecraft:coarse_dirt",
        "minecraft:dirt",
        "minecraft:dirt_with_roots",
        "minecraft:grass_block",
        "minecraft:grass_path"
      ];
      if (vanillaFarmSoil.includes(block.typeId)) {
        system.run(() => {
          const blockAbove = block.dimension.getBlock(block.location).above(1);
          if (!blockAbove.isAir) return;
          damageItemDurability(player, itemStack, 1, "Mainhand");
          block.dimension.playSound("use.gravel", block.location, { pitch: 0.8, volume: 1.0 });
        });
      }
    }
  }
  else return;
});