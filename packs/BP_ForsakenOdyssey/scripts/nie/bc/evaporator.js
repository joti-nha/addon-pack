import { system, BlockPermutation, ItemStack, GameMode } from "@minecraft/server";
import { decreaseItemStack, changeItem, spawnItemStack } from "../../ntk_functions.js";

const BlockEvaporatorOnPlayerInteractComponent = {
  onPlayerInteract({ player, block, dimension, face, faceLocation }, { params }) {
    const source = player
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const blockType = child.block_type;
      const itemSlot = child.item_slot ?? "Mainhand";
      
      if (source.isSneaking) return;
      if (Math.random() * 100 <= eventChance) {
        const sourceEquippable = source.getComponent("minecraft:equippable");
        if (!sourceEquippable) return;
        const selectedSlot = sourceEquippable.getEquipmentSlot(itemSlot);
        const itemStack = selectedSlot.getItem();
        
        if (block.hasTag(blockType)) {
          if (block.hasTag("ntk:copper_evaporator")) {
            if (block.typeId === "ntk:copper_evaporator") {
              const validInputs = [
                "minecraft:blue_ice",
                "minecraft:ice",
                "minecraft:lava_bucket",
                "minecraft:milk_bucket",
                "minecraft:mud",
                "minecraft:packed_ice",
                "minecraft:rotten_flesh",
                "minecraft:snow",
                "minecraft:water_bucket",
                "ntk:jar_of_water_full"
              ];
              if (itemStack === undefined || !validInputs.includes(itemStack.typeId)) return;
              if (itemStack.typeId === "minecraft:blue_ice") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("dig.stone", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator_with_blue_ice"));
              }
              if (itemStack.typeId === "minecraft:ice") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("dig.stone", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator_with_ice"));
              }
              if (itemStack.typeId === "minecraft:lava_bucket") {
                changeItem(source, itemStack, "minecraft:bucket", 1, "Mainhand");
                block.dimension.playSound("bucket.empty_lava", block.location, { pitch: 1.0, volume: 0.7 });
                block.dimension.spawnParticle("ntk:evaporator_particle", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator_with_lava"));
              }
              if (itemStack.typeId === "minecraft:milk_bucket") {
                changeItem(source, itemStack, "minecraft:bucket", 1, "Mainhand");
                block.dimension.playSound("bucket.empty_water", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator_with_milk"));
              }
              if (itemStack.typeId === "minecraft:mud") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("dig.stone", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator_with_mud"));
              }
              if (itemStack.typeId === "minecraft:packed_ice") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("dig.stone", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator_with_packed_ice"));
              }
              if (itemStack.typeId === "minecraft:rotten_flesh") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("cake.add_candle", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator_with_rotten_flesh_1"));
                return;
              }
              if (itemStack.typeId === "minecraft:snow") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("use.snow", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator_with_snow"));
              }
              if (itemStack.typeId === "minecraft:water_bucket") {
                changeItem(source, itemStack, "minecraft:bucket", 1, "Mainhand");
                block.dimension.playSound("bucket.empty_water", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator_with_water"));
              }
              if (itemStack.typeId === "ntk:jar_of_water_full") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("bottle.empty", block.location, { pitch: 1.0, volume: 0.7 });
                source.runCommand(`gamerule sendcommandfeedback false`);
                source.runCommand(`give @s ntk:empty_jar 1`);
                source.runCommand(`gamerule sendcommandfeedback true`);
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator_with_water"));
              }
            }
            if (block.typeId === "ntk:copper_evaporator_with_blue_ice") {
              if (itemStack === undefined || itemStack.typeId !== "minecraft:blue_ice") {
                spawnItemStack(block, "minecraft:blue_ice", 1, 1);
                block.dimension.playSound("block.itemframe.remove_item", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
              }
              else if (itemStack.typeId === "minecraft:blue_ice") {
                block.dimension.playSound("block.click.fail", block.location, { pitch: 1.0, volume: 0.7 });
              }
            }
            if (block.typeId === "ntk:copper_evaporator_with_cheese") {
              spawnItemStack(block, "ntk:cheese", 3, 4);
              block.dimension.playSound("block.itemframe.remove_item", block.location, { pitch: 1.0, volume: 0.7 });
              block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
            }
            if (block.typeId === "ntk:copper_evaporator_with_crying_obsidian") {
              spawnItemStack(block, "minecraft:crying_obsidian", 1, 1);
              block.dimension.playSound("dig.stone", block.location, { pitch: 1.0, volume: 0.7 });
              block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
            }
            if (block.typeId === "ntk:copper_evaporator_with_ice") {
              if (itemStack === undefined || itemStack.typeId !== "minecraft:ice") {
                spawnItemStack(block, "minecraft:ice", 1, 1);
                block.dimension.playSound("block.itemframe.remove_item", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
              }
              else if (itemStack.typeId === "minecraft:ice") {
                block.dimension.playSound("block.click.fail", block.location, { pitch: 1.0, volume: 0.7 });
              }
            }
            if (block.typeId === "ntk:copper_evaporator_with_lava") {
              if (itemStack === undefined) return;
              if (itemStack.typeId === "minecraft:bucket") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                source.runCommand(`gamerule sendcommandfeedback false`);
                source.runCommand(`give @s minecraft:lava_bucket 1`);
                source.runCommand(`gamerule sendcommandfeedback true`);
                block.dimension.playSound("bucket.fill_lava", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
              }
              if (itemStack.typeId === "minecraft:ghast_tear") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("random.fizz", block.location, { pitch: 1.0, volume: 0.7 });
                block.dimension.spawnParticle("ntk:evaporator_particle", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator_with_tearing_lava"));
              }
            }
            if (block.typeId === "ntk:copper_evaporator_with_leather_scrap_1") {
              spawnItemStack(block, "ntk:leather_scrap", 3, 4);
              block.dimension.playSound("block.itemframe.remove_item", block.location, { pitch: 1.0, volume: 0.7 });
              block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
            }
            if (block.typeId === "ntk:copper_evaporator_with_leather_scrap_2") {
              spawnItemStack(block, "ntk:leather_scrap", 6, 7);
              block.dimension.playSound("block.itemframe.remove_item", block.location, { pitch: 1.0, volume: 0.7 });
              block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
            }
            if (block.typeId === "ntk:copper_evaporator_with_leather_scrap_3") {
              spawnItemStack(block, "ntk:leather_scrap", 9, 10);
              block.dimension.playSound("block.itemframe.remove_item", block.location, { pitch: 1.0, volume: 0.7 });
              block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
            }
            if (block.typeId === "ntk:copper_evaporator_with_milk") {
              if (itemStack === undefined) return;
              if (itemStack.typeId === "minecraft:bucket") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                source.runCommand(`gamerule sendcommandfeedback false`);
                source.runCommand(`give @s minecraft:milk_bucket 1`);
                source.runCommand(`gamerule sendcommandfeedback true`);
                block.dimension.playSound("bucket.fill_water", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
              }
            }
            if (block.typeId === "ntk:copper_evaporator_with_mud") {
              if (itemStack === undefined || itemStack.typeId !== "minecraft:mud") {
                spawnItemStack(block, "minecraft:mud", 1, 1);
                block.dimension.playSound("block.itemframe.remove_item", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
              }
              else if (itemStack.typeId === "minecraft:mud") {
                block.dimension.playSound("block.click.fail", block.location, { pitch: 1.0, volume: 0.7 });
              }
            }
            if (block.typeId === "ntk:copper_evaporator_with_obsidian") {
              spawnItemStack(block, "minecraft:obsidian", 1, 1);
              block.dimension.playSound("dig.stone", block.location, { pitch: 1.0, volume: 0.7 });
              block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
            }
            if (block.typeId === "ntk:copper_evaporator_with_packed_ice") {
              if (itemStack === undefined || itemStack.typeId !== "minecraft:packed_ice") {
                spawnItemStack(block, "minecraft:packed_ice", 1, 1);
                block.dimension.playSound("block.itemframe.remove_item", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
              }
              else if (itemStack.typeId === "minecraft:packed_ice") {
                block.dimension.playSound("block.click.fail", block.location, { pitch: 1.0, volume: 0.7 });
              }
            }
            if (block.typeId === "ntk:copper_evaporator_with_packed_mud") {
              spawnItemStack(block, "minecraft:packed_mud", 1, 1);
              block.dimension.playSound("dig.stone", block.location, { pitch: 1.0, volume: 0.7 });
              block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
            }
            if (block.typeId === "ntk:copper_evaporator_with_rotten_flesh_1") {
              if (itemStack === undefined || itemStack.typeId !== "minecraft:rotten_flesh") {
                spawnItemStack(block, "minecraft:rotten_flesh", 1, 1);
                block.dimension.playSound("cake.add_candle", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
              }
              else if (itemStack.typeId === "minecraft:rotten_flesh") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("cake.add_candle", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator_with_rotten_flesh_2"));
                return;
              }
            }
            if (block.typeId === "ntk:copper_evaporator_with_rotten_flesh_2") {
              if (itemStack === undefined || itemStack.typeId !== "minecraft:rotten_flesh") {
                spawnItemStack(block, "minecraft:rotten_flesh", 2, 2);
                block.dimension.playSound("cake.add_candle", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
              }
              else if (itemStack.typeId === "minecraft:rotten_flesh") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("cake.add_candle", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator_with_rotten_flesh_3"));
                return;
              }
            }
            if (block.typeId === "ntk:copper_evaporator_with_rotten_flesh_3") {
              if (itemStack === undefined || itemStack.typeId !== "minecraft:rotten_flesh") {
                spawnItemStack(block, "minecraft:rotten_flesh", 3, 3);
                block.dimension.playSound("cake.add_candle", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
              }
              else if (itemStack.typeId === "minecraft:rotten_flesh") {
                block.dimension.playSound("block.click.fail", block.location, { pitch: 1.0, volume: 0.7 });
              }
            }
            if (block.typeId === "ntk:copper_evaporator_with_salt") {
              spawnItemStack(block, "ntk:salt", 3, 4);
              block.dimension.playSound("dig.sand", block.location, { pitch: 1.0, volume: 0.7 });
              block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
            }
            if (block.typeId === "ntk:copper_evaporator_with_snow") {
              if (itemStack === undefined || itemStack.typeId !== "minecraft:snow") {
                spawnItemStack(block, "minecraft:snow", 1, 1);
                block.dimension.playSound("dig.snow", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
              }
              else if (itemStack.typeId === "minecraft:snow") {
                block.dimension.playSound("block.click.fail", block.location, { pitch: 1.0, volume: 0.7 });
              }
            }
            if (block.typeId === "ntk:copper_evaporator_with_tearing_lava") {
              if (itemStack === undefined) return;
              if (itemStack.typeId === "minecraft:bucket") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                source.runCommand(`gamerule sendcommandfeedback false`);
                source.runCommand(`give @s minecraft:lava_bucket 1`);
                source.runCommand(`gamerule sendcommandfeedback true`);
                block.dimension.playSound("bucket.fill_lava", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
              }
            }
            if (block.typeId === "ntk:copper_evaporator_with_water") {
              if (itemStack === undefined) return;
              if (itemStack.typeId === "minecraft:bucket") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                source.runCommand(`gamerule sendcommandfeedback false`);
                source.runCommand(`give @s minecraft:water_bucket 1`);
                source.runCommand(`gamerule sendcommandfeedback true`);
                block.dimension.playSound("bucket.fill_water", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
                return;
              }
              if (itemStack.typeId === "ntk:empty_jar") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                source.runCommand(`gamerule sendcommandfeedback false`);
                source.runCommand(`give @s ntk:jar_of_water_full 1`);
                source.runCommand(`gamerule sendcommandfeedback true`);
                block.dimension.playSound("bottle.fill", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:copper_evaporator"));
                return;
              }
              if (itemStack.typeId === "ntk:empty_bamboo_cup") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                source.runCommand(`gamerule sendcommandfeedback false`);
                source.runCommand(`give @s ntk:bamboo_cup_with_water 1`);
                source.runCommand(`gamerule sendcommandfeedback true`);
                block.dimension.playSound("bottle.fill", block.location, { pitch: 1.0, volume: 0.7 });
                return;
              }
            }
          }
          if (block.hasTag("ntk:metal_evaporator")) {
            if (block.typeId === "ntk:metal_evaporator") {
              const validInputs = [
                "minecraft:blue_ice",
                "minecraft:ice",
                "minecraft:lava_bucket",
                "minecraft:milk_bucket",
                "minecraft:mud",
                "minecraft:packed_ice",
                "minecraft:rotten_flesh",
                "minecraft:snow",
                "minecraft:water_bucket",
                "ntk:jar_of_water_full"
              ];
              if (itemStack === undefined || !validInputs.includes(itemStack.typeId)) return;
              if (itemStack.typeId === "minecraft:blue_ice") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("dig.stone", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator_with_blue_ice"));
              }
              if (itemStack.typeId === "minecraft:ice") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("dig.stone", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator_with_ice"));
              }
              if (itemStack.typeId === "minecraft:lava_bucket") {
                changeItem(source, itemStack, "minecraft:bucket", 1, "Mainhand");
                block.dimension.playSound("bucket.empty_lava", block.location, { pitch: 1.0, volume: 0.7 });
                block.dimension.spawnParticle("ntk:evaporator_particle", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator_with_lava"));
              }
              if (itemStack.typeId === "minecraft:milk_bucket") {
                changeItem(source, itemStack, "minecraft:bucket", 1, "Mainhand");
                block.dimension.playSound("bucket.empty_water", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator_with_milk"));
              }
              if (itemStack.typeId === "minecraft:mud") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("dig.stone", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator_with_mud"));
              }
              if (itemStack.typeId === "minecraft:packed_ice") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("dig.stone", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator_with_packed_ice"));
              }
              if (itemStack.typeId === "minecraft:rotten_flesh") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("cake.add_candle", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator_with_rotten_flesh_1"));
                return;
              }
              if (itemStack.typeId === "minecraft:snow") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("use.snow", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator_with_snow"));
              }
              if (itemStack.typeId === "minecraft:water_bucket") {
                changeItem(source, itemStack, "minecraft:bucket", 1, "Mainhand");
                block.dimension.playSound("bucket.empty_water", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator_with_water"));
              }
              if (itemStack.typeId === "ntk:jar_of_water_full") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("bottle.empty", block.location, { pitch: 1.0, volume: 0.7 });
                source.runCommand(`gamerule sendcommandfeedback false`);
                source.runCommand(`give @s ntk:empty_jar 1`);
                source.runCommand(`gamerule sendcommandfeedback true`);
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator_with_water"));
              }
            }
            if (block.typeId === "ntk:metal_evaporator_with_blue_ice") {
              if (itemStack === undefined || itemStack.typeId !== "minecraft:blue_ice") {
                spawnItemStack(block, "minecraft:blue_ice", 1, 1);
                block.dimension.playSound("block.itemframe.remove_item", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
              }
              else if (itemStack.typeId === "minecraft:blue_ice") {
                block.dimension.playSound("block.click.fail", block.location, { pitch: 1.0, volume: 0.7 });
              }
            }
            if (block.typeId === "ntk:metal_evaporator_with_cheese") {
              spawnItemStack(block, "ntk:cheese", 3, 4);
              block.dimension.playSound("block.itemframe.remove_item", block.location, { pitch: 1.0, volume: 0.7 });
              block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
            }
            if (block.typeId === "ntk:metal_evaporator_with_crying_obsidian") {
              spawnItemStack(block, "minecraft:crying_obsidian", 1, 1);
              block.dimension.playSound("dig.stone", block.location, { pitch: 1.0, volume: 0.7 });
              block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
            }
            if (block.typeId === "ntk:metal_evaporator_with_ice") {
              if (itemStack === undefined || itemStack.typeId !== "minecraft:ice") {
                spawnItemStack(block, "minecraft:ice", 1, 1);
                block.dimension.playSound("block.itemframe.remove_item", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
              }
              else if (itemStack.typeId === "minecraft:ice") {
                block.dimension.playSound("block.click.fail", block.location, { pitch: 1.0, volume: 0.7 });
              }
            }
            if (block.typeId === "ntk:metal_evaporator_with_lava") {
              if (itemStack === undefined) return;
              if (itemStack.typeId === "minecraft:bucket") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                source.runCommand(`gamerule sendcommandfeedback false`);
                source.runCommand(`give @s minecraft:lava_bucket 1`);
                source.runCommand(`gamerule sendcommandfeedback true`);
                block.dimension.playSound("bucket.fill_lava", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
              }
              if (itemStack.typeId === "minecraft:ghast_tear") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("random.fizz", block.location, { pitch: 1.0, volume: 0.7 });
                block.dimension.spawnParticle("ntk:evaporator_particle", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator_with_tearing_lava"));
              }
            }
            if (block.typeId === "ntk:metal_evaporator_with_leather_scrap_1") {
              spawnItemStack(block, "ntk:leather_scrap", 3, 4);
              block.dimension.playSound("block.itemframe.remove_item", block.location, { pitch: 1.0, volume: 0.7 });
              block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
            }
            if (block.typeId === "ntk:metal_evaporator_with_leather_scrap_2") {
              spawnItemStack(block, "ntk:leather_scrap", 6, 7);
              block.dimension.playSound("block.itemframe.remove_item", block.location, { pitch: 1.0, volume: 0.7 });
              block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
            }
            if (block.typeId === "ntk:metal_evaporator_with_leather_scrap_3") {
              spawnItemStack(block, "ntk:leather_scrap", 9, 10);
              block.dimension.playSound("block.itemframe.remove_item", block.location, { pitch: 1.0, volume: 0.7 });
              block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
            }
            if (block.typeId === "ntk:metal_evaporator_with_milk") {
              if (itemStack === undefined) return;
              if (itemStack.typeId === "minecraft:bucket") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                source.runCommand(`gamerule sendcommandfeedback false`);
                source.runCommand(`give @s minecraft:milk_bucket 1`);
                source.runCommand(`gamerule sendcommandfeedback true`);
                block.dimension.playSound("bucket.fill_water", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
              }
            }
            if (block.typeId === "ntk:metal_evaporator_with_mud") {
              if (itemStack === undefined || itemStack.typeId !== "minecraft:mud") {
                spawnItemStack(block, "minecraft:mud", 1, 1);
                block.dimension.playSound("block.itemframe.remove_item", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
              }
              else if (itemStack.typeId === "minecraft:mud") {
                block.dimension.playSound("block.click.fail", block.location, { pitch: 1.0, volume: 0.7 });
              }
            }
            if (block.typeId === "ntk:metal_evaporator_with_obsidian") {
              spawnItemStack(block, "minecraft:obsidian", 1, 1);
              block.dimension.playSound("dig.stone", block.location, { pitch: 1.0, volume: 0.7 });
              block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
            }
            if (block.typeId === "ntk:metal_evaporator_with_packed_ice") {
              if (itemStack === undefined || itemStack.typeId !== "minecraft:packed_ice") {
                spawnItemStack(block, "minecraft:packed_ice", 1, 1);
                block.dimension.playSound("block.itemframe.remove_item", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
              }
              else if (itemStack.typeId === "minecraft:packed_ice") {
                block.dimension.playSound("block.click.fail", block.location, { pitch: 1.0, volume: 0.7 });
              }
            }
            if (block.typeId === "ntk:metal_evaporator_with_packed_mud") {
              spawnItemStack(block, "minecraft:packed_mud", 1, 1);
              block.dimension.playSound("dig.stone", block.location, { pitch: 1.0, volume: 0.7 });
              block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
            }
            if (block.typeId === "ntk:metal_evaporator_with_rotten_flesh_1") {
              if (itemStack === undefined || itemStack.typeId !== "minecraft:rotten_flesh") {
                spawnItemStack(block, "minecraft:rotten_flesh", 1, 1);
                block.dimension.playSound("cake.add_candle", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
              }
              else if (itemStack.typeId === "minecraft:rotten_flesh") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("cake.add_candle", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator_with_rotten_flesh_2"));
                return;
              }
            }
            if (block.typeId === "ntk:metal_evaporator_with_rotten_flesh_2") {
              if (itemStack === undefined || itemStack.typeId !== "minecraft:rotten_flesh") {
                spawnItemStack(block, "minecraft:rotten_flesh", 2, 2);
                block.dimension.playSound("cake.add_candle", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
              }
              else if (itemStack.typeId === "minecraft:rotten_flesh") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                block.dimension.playSound("cake.add_candle", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator_with_rotten_flesh_3"));
                return;
              }
            }
            if (block.typeId === "ntk:metal_evaporator_with_rotten_flesh_3") {
              if (itemStack === undefined || itemStack.typeId !== "minecraft:rotten_flesh") {
                spawnItemStack(block, "minecraft:rotten_flesh", 3, 3);
                block.dimension.playSound("cake.add_candle", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
              }
              else if (itemStack.typeId === "minecraft:rotten_flesh") {
                block.dimension.playSound("block.click.fail", block.location, { pitch: 1.0, volume: 0.7 });
              }
            }
            if (block.typeId === "ntk:metal_evaporator_with_salt") {
              spawnItemStack(block, "ntk:salt", 3, 4);
              block.dimension.playSound("dig.sand", block.location, { pitch: 1.0, volume: 0.7 });
              block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
            }
            if (block.typeId === "ntk:metal_evaporator_with_snow") {
              if (itemStack === undefined || itemStack.typeId !== "minecraft:snow") {
                spawnItemStack(block, "minecraft:snow", 1, 1);
                block.dimension.playSound("dig.snow", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
              }
              else if (itemStack.typeId === "minecraft:snow") {
                block.dimension.playSound("block.click.fail", block.location, { pitch: 1.0, volume: 0.7 });
              }
            }
            if (block.typeId === "ntk:metal_evaporator_with_tearing_lava") {
              if (itemStack === undefined) return;
              if (itemStack.typeId === "minecraft:bucket") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                source.runCommand(`gamerule sendcommandfeedback false`);
                source.runCommand(`give @s minecraft:lava_bucket 1`);
                source.runCommand(`gamerule sendcommandfeedback true`);
                block.dimension.playSound("bucket.fill_lava", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
              }
            }
            if (block.typeId === "ntk:metal_evaporator_with_water") {
              if (itemStack === undefined) return;
              if (itemStack.typeId === "minecraft:bucket") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                source.runCommand(`gamerule sendcommandfeedback false`);
                source.runCommand(`give @s minecraft:water_bucket 1`);
                source.runCommand(`gamerule sendcommandfeedback true`);
                block.dimension.playSound("bucket.fill_water", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
                return;
              }
              if (itemStack.typeId === "ntk:empty_jar") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                source.runCommand(`gamerule sendcommandfeedback false`);
                source.runCommand(`give @s ntk:jar_of_water_full 1`);
                source.runCommand(`gamerule sendcommandfeedback true`);
                block.dimension.playSound("bottle.fill", block.location, { pitch: 1.0, volume: 0.7 });
                block.setPermutation(BlockPermutation.resolve("ntk:metal_evaporator"));
                return;
              }
              if (itemStack.typeId === "ntk:empty_bamboo_cup") {
                decreaseItemStack(source, itemStack, 1, "Mainhand");
                source.runCommand(`gamerule sendcommandfeedback false`);
                source.runCommand(`give @s ntk:bamboo_cup_with_water 1`);
                source.runCommand(`gamerule sendcommandfeedback true`);
                block.dimension.playSound("bottle.fill", block.location, { pitch: 1.0, volume: 0.7 });
                return;
              }
            }
          }
          return;
        }
      }
    }
  },
};
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent(
    "ntk:evaporator_on_player_interact", BlockEvaporatorOnPlayerInteractComponent
  );
});
/* Used in:
NIE:
- Copper Evaporators
- Metal Evaporators
*/