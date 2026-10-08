import { world, system, BlockPermutation, ItemStack, GameMode } from "@minecraft/server";
import { decreaseItemStack } from "../ntk_functions.js";

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
  const player = event.player;
  const itemStack = event.itemStack;
  const block = event.block;
  const blockAllState = block.permutation.getAllStates();
  
  if (itemStack === undefined) return;
  if (block.hasTag("ntk:waxable_block") && (itemStack.typeId === "minecraft:honeycomb" || itemStack.hasTag("ntk:honeycomb"))) {
    const pitchRange = Math.random() * (1.2 - 0.8) + 0.8;
    if (block.permutation.matches("ntk:copper_lamp")) {
      system.run(() => {
        decreaseItemStack(player, itemStack, 1, "Mainhand");
        block.dimension.playSound("copper.wax.on", block.location, { pitch: pitchRange, volume: 1.0 });
        block.dimension.spawnParticle("ntk:copper_wax_on_particle", block.location);
        block.setPermutation(BlockPermutation.resolve("ntk:waxed_copper_lamp"));
        return;
      });
    }
    if (block.permutation.matches("ntk:exposed_copper_lamp")) {
      system.run(() => {
        decreaseItemStack(player, itemStack, 1, "Mainhand");
        block.dimension.playSound("copper.wax.on", block.location, { pitch: pitchRange, volume: 1.0 });
        block.dimension.spawnParticle("ntk:copper_wax_on_particle", block.location);
        block.setPermutation(BlockPermutation.resolve("ntk:waxed_exposed_copper_lamp"));
        return;
      });
    }
    if (block.permutation.matches("ntk:weathered_copper_lamp")) {
      system.run(() => {
        decreaseItemStack(player, itemStack, 1, "Mainhand");
        block.dimension.playSound("copper.wax.on", block.location, { pitch: pitchRange, volume: 1.0 });
        block.dimension.spawnParticle("ntk:copper_wax_on_particle", block.location);
        block.setPermutation(BlockPermutation.resolve("ntk:waxed_weathered_copper_lamp"));
        return;
      });
    }
    if (block.permutation.matches("ntk:oxidized_copper_lamp")) {
      system.run(() => {
        decreaseItemStack(player, itemStack, 1, "Mainhand");
        block.dimension.playSound("copper.wax.on", block.location, { pitch: pitchRange, volume: 1.0 });
        block.dimension.spawnParticle("ntk:copper_wax_on_particle", block.location);
        block.setPermutation(BlockPermutation.resolve("ntk:waxed_oxidized_copper_lamp"));
        return;
      });
    }
    if (block.permutation.matches("ntk:large_copper_lantern")) {
      system.run(() => {
        decreaseItemStack(player, itemStack, 1, "Mainhand");
        block.dimension.playSound("copper.wax.on", block.location, { pitch: pitchRange, volume: 1.0 });
        block.dimension.spawnParticle("ntk:copper_wax_on_particle", block.location);
        block.setPermutation(BlockPermutation.resolve("ntk:waxed_large_copper_lantern", blockAllState));
        return;
      });
    }
    if (block.permutation.matches("ntk:exposed_large_copper_lantern")) {
      system.run(() => {
        decreaseItemStack(player, itemStack, 1, "Mainhand");
        block.dimension.playSound("copper.wax.on", block.location, { pitch: pitchRange, volume: 1.0 });
        block.dimension.spawnParticle("ntk:copper_wax_on_particle", block.location);
        block.setPermutation(BlockPermutation.resolve("ntk:waxed_exposed_large_copper_lantern", blockAllState));
        return;
      });
    }
    if (block.permutation.matches("ntk:weathered_large_copper_lantern")) {
      system.run(() => {
        decreaseItemStack(player, itemStack, 1, "Mainhand");
        block.dimension.playSound("copper.wax.on", block.location, { pitch: pitchRange, volume: 1.0 });
        block.dimension.spawnParticle("ntk:copper_wax_on_particle", block.location);
        block.setPermutation(BlockPermutation.resolve("ntk:waxed_weathered_large_copper_lantern", blockAllState));
        return;
      });
    }
    if (block.permutation.matches("ntk:oxidized_large_copper_lantern")) {
      system.run(() => {
        decreaseItemStack(player, itemStack, 1, "Mainhand");
        block.dimension.playSound("copper.wax.on", block.location, { pitch: pitchRange, volume: 1.0 });
        block.dimension.spawnParticle("ntk:copper_wax_on_particle", block.location);
        block.setPermutation(BlockPermutation.resolve("ntk:waxed_oxidized_large_copper_lantern", blockAllState));
        return;
      });
    }
  }
  else return;
});
