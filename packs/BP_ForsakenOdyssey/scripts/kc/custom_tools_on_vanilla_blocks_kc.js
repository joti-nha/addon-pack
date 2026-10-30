import { world, system, BlockPermutation, ItemStack, GameMode } from "@minecraft/server";
import { damageItemDurability, woodStrippedSound } from "../ntk_functions.js";
import { vanillaWoods } from "../ntk_listing.js";

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
  const player = event.player;
  const itemStack = event.itemStack;
  const block = event.block;
  const customAxes = [
    "ntk:flint_axe"
  ];
  
  if (itemStack === undefined) return;
  if (customAxes.includes(itemStack.typeId)) {
    if (customAxes.includes(itemStack.typeId)) {
      if (vanillaWoods.includes(block.typeId)) {
        system.run(() => {
          damageItemDurability(player, itemStack, 1, "Mainhand", false);
          woodStrippedSound(block);
        });
      }
    }
  }
  else return;
});