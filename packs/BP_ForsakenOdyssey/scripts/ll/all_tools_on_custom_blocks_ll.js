import { world, system, BlockPermutation, ItemStack, GameMode } from "@minecraft/server";
import { damageItemDurability } from "../ntk_functions.js";

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
  const player = event.player;
  const itemStack = event.itemStack;
  const block = event.block;
  const blockAllState = block.permutation.getAllStates();
  
  if (itemStack === undefined) return;
  if (itemStack.hasTag("minecraft:is_axe") || itemStack.hasTag("minecraft:is_hoe") || itemStack.hasTag("minecraft:is_shovel")) {
    if (itemStack.hasTag("minecraft:is_axe")) {
      const customCopper = [
        "ntk:exposed_copper_lamp",
        "ntk:oxidized_copper_lamp",
        "ntk:weathered_copper_lamp",
        "ntk:exposed_large_copper_lantern",
        "ntk:oxidized_large_copper_lantern",
        "ntk:weathered_large_copper_lantern"
      ];
      const customWaxedCopper = [
        "ntk:waxed_copper_lamp",
        "ntk:waxed_exposed_copper_lamp",
        "ntk:waxed_oxidized_copper_lamp",
        "ntk:waxed_weathered_copper_lamp",
        "ntk:waxed_large_copper_lantern",
        "ntk:waxed_exposed_large_copper_lantern",
        "ntk:waxed_oxidized_large_copper_lantern",
        "ntk:waxed_weathered_large_copper_lantern"
      ];
      if (customCopper.includes(block.typeId)) {
        const pitchRange = Math.random() * (1.2 - 0.8) + 0.8;
        if (block.permutation.matches("ntk:exposed_copper_lamp")) {
          system.run(() => {
            damageItemDurability(player, itemStack, 1, "Mainhand", false);
            block.dimension.playSound("scrape", block.location, { pitch: pitchRange, volume: 1.0 });
            block.dimension.spawnParticle("ntk:copper_scrape_particle", block.location);
            block.setPermutation(BlockPermutation.resolve("ntk:copper_lamp"));
            return;
          });
        }
        if (block.permutation.matches("ntk:weathered_copper_lamp")) {
          system.run(() => {
            damageItemDurability(player, itemStack, 1, "Mainhand", false);
            block.dimension.playSound("scrape", block.location, { pitch: pitchRange, volume: 1.0 });
            block.dimension.spawnParticle("ntk:copper_scrape_particle", block.location);
            block.setPermutation(BlockPermutation.resolve("ntk:exposed_copper_lamp"));
            return;
          });
        }
        if (block.permutation.matches("ntk:oxidized_copper_lamp")) {
          system.run(() => {
            damageItemDurability(player, itemStack, 1, "Mainhand", false);
            block.dimension.playSound("scrape", block.location, { pitch: pitchRange, volume: 1.0 });
            block.dimension.spawnParticle("ntk:copper_scrape_particle", block.location);
            block.setPermutation(BlockPermutation.resolve("ntk:weathered_copper_lamp"));
            return;
          });
        }
        if (block.permutation.matches("ntk:exposed_large_copper_lantern")) {
          system.run(() => {
            damageItemDurability(player, itemStack, 1, "Mainhand", false);
            block.dimension.playSound("scrape", block.location, { pitch: pitchRange, volume: 1.0 });
            block.dimension.spawnParticle("ntk:copper_scrape_particle", block.location);
            block.setPermutation(BlockPermutation.resolve("ntk:large_copper_lantern", blockAllState ));
            return;
          });
        }
        if (block.permutation.matches("ntk:weathered_large_copper_lantern")) {
          system.run(() => {
            damageItemDurability(player, itemStack, 1, "Mainhand", false);
            block.dimension.playSound("scrape", block.location, { pitch: pitchRange, volume: 1.0 });
            block.dimension.spawnParticle("ntk:copper_scrape_particle", block.location);
            block.setPermutation(BlockPermutation.resolve("ntk:exposed_large_copper_lantern", blockAllState ));
            return;
          });
        }
        if (block.permutation.matches("ntk:oxidized_large_copper_lantern")) {
          system.run(() => {
            damageItemDurability(player, itemStack, 1, "Mainhand", false);
            block.dimension.playSound("scrape", block.location, { pitch: pitchRange, volume: 1.0 });
            block.dimension.spawnParticle("ntk:copper_scrape_particle", block.location);
            block.setPermutation(BlockPermutation.resolve("ntk:weathered_large_copper_lantern", blockAllState ));
            return;
          });
        }
      }
      if (customWaxedCopper.includes(block.typeId)) {
        const pitchRange = Math.random() * (1.2 - 0.8) + 0.8;
        if (block.permutation.matches("ntk:waxed_copper_lamp")) {
          system.run(() => {
            damageItemDurability(player, itemStack, 1, "Mainhand", false);
            block.dimension.playSound("copper.wax.off", block.location, { pitch: pitchRange, volume: 1.0 });
            block.dimension.spawnParticle("ntk:copper_wax_off_particle", block.location);
            block.setPermutation(BlockPermutation.resolve("ntk:copper_lamp"));
            return;
          });
        }
        if (block.permutation.matches("ntk:waxed_exposed_copper_lamp")) {
          system.run(() => {
            damageItemDurability(player, itemStack, 1, "Mainhand", false);
            block.dimension.playSound("copper.wax.off", block.location, { pitch: pitchRange, volume: 1.0 });
            block.dimension.spawnParticle("ntk:copper_wax_off_particle", block.location);
            block.setPermutation(BlockPermutation.resolve("ntk:exposed_copper_lamp"));
            return;
          });
        }
        if (block.permutation.matches("ntk:waxed_weathered_copper_lamp")) {
          system.run(() => {
            damageItemDurability(player, itemStack, 1, "Mainhand", false);
            block.dimension.playSound("copper.wax.off", block.location, { pitch: pitchRange, volume: 1.0 });
            block.dimension.spawnParticle("ntk:copper_wax_off_particle", block.location);
            block.setPermutation(BlockPermutation.resolve("ntk:weathered_copper_lamp"));
            return;
          });
        }
        if (block.permutation.matches("ntk:waxed_oxidized_copper_lamp")) {
          system.run(() => {
            damageItemDurability(player, itemStack, 1, "Mainhand", false);
            block.dimension.playSound("copper.wax.off", block.location, { pitch: pitchRange, volume: 1.0 });
            block.dimension.spawnParticle("ntk:copper_wax_off_particle", block.location);
            block.setPermutation(BlockPermutation.resolve("ntk:oxidized_copper_lamp"));
            return;
          });
        }
        if (block.permutation.matches("ntk:waxed_large_copper_lantern")) {
          system.run(() => {
            damageItemDurability(player, itemStack, 1, "Mainhand", false);
            block.dimension.playSound("copper.wax.off", block.location, { pitch: pitchRange, volume: 1.0 });
            block.dimension.spawnParticle("ntk:copper_wax_off_particle", block.location);
            block.setPermutation(BlockPermutation.resolve("ntk:large_copper_lantern", blockAllState ));
            return;
          });
        }
        if (block.permutation.matches("ntk:waxed_exposed_large_copper_lantern")) {
          system.run(() => {
            damageItemDurability(player, itemStack, 1, "Mainhand", false);
            block.dimension.playSound("copper.wax.off", block.location, { pitch: pitchRange, volume: 1.0 });
            block.dimension.spawnParticle("ntk:copper_wax_off_particle", block.location);
            block.setPermutation(BlockPermutation.resolve("ntk:exposed_large_copper_lantern", blockAllState ));
            return;
          });
        }
        if (block.permutation.matches("ntk:waxed_weathered_large_copper_lantern")) {
          system.run(() => {
            damageItemDurability(player, itemStack, 1, "Mainhand", false);
            block.dimension.playSound("copper.wax.off", block.location, { pitch: pitchRange, volume: 1.0 });
            block.dimension.spawnParticle("ntk:copper_wax_off_particle", block.location);
            block.setPermutation(BlockPermutation.resolve("ntk:weathered_large_copper_lantern", blockAllState ));
            return;
          });
        }
        if (block.permutation.matches("ntk:waxed_oxidized_large_copper_lantern")) {
          system.run(() => {
            damageItemDurability(player, itemStack, 1, "Mainhand", false);
            block.dimension.playSound("copper.wax.off", block.location, { pitch: pitchRange, volume: 1.0 });
            block.dimension.spawnParticle("ntk:copper_wax_off_particle", block.location);
            block.setPermutation(BlockPermutation.resolve("ntk:oxidized_large_copper_lantern", blockAllState ));
            return;
          });
        }
      }
    }
  }
  else return;
});
