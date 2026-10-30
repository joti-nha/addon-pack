// FORSAKEN ODYSSEY:
import { world, system, BlockVolume, BlockPermutation } from "@minecraft/server";
import { randomEvent } from "../ntk_functions.js";

world.afterEvents.entitySpawn.subscribe(eventData => {
  const flourishingMagicSpell = [
    "ntk:miscellaneous_flourishing_magic_spell_1",
    "ntk:miscellaneous_flourishing_magic_spell_2",
    "ntk:miscellaneous_flourishing_magic_spell_3"
  ];
  if (!flourishingMagicSpell.includes(eventData.entity.typeId)) return;
  const magicSpell = eventData.entity;
  const magicLocation = magicSpell.location;
  const biomeId = magicSpell.dimension.getBiome(magicLocation).id;
  const validBlockList = [
    // Grasses:
    "minecraft:bush",
    "minecraft:fern",
    "minecraft:firefly_bush",
    "minecraft:seagrass",
    "minecraft:short_dry_grass",
    "minecraft:short_grass",
    "minecraft:tall_dry_grass",
    "ntk:short_lush_bush",
    "ntk:tall_lush_bush",
    // Sprouts:
    "ntk:short_glowcelium_sprouts",
    "ntk:short_moss_sprouts",
    "ntk:short_mycelium_sprouts",
    // Flowers:
    "minecraft:pink_petals",
    "minecraft:wildflowers",
    // Fungus:
    // Saplings:
    "minecraft:bamboo",
    "minecraft:bamboo_sapling",
    // Crops & Fruits:
    "minecraft:beetroot",
    "minecraft:carrots",
    "minecraft:cocoa",
    "minecraft:melon_stem",
    "minecraft:pitcher_crop",
    "minecraft:potatoes",
    "minecraft:pumpkin_stem",
    "minecraft:sweet_berry_bush",
    "minecraft:torchflower_crop",
    "minecraft:wheat",
    // Plants:
    "minecraft:reeds",
    // Soil Types:
    "minecraft:clay",
    "minecraft:coarse_dirt",
    "minecraft:dirt",
    "minecraft:grass_block",
    "minecraft:gravel",
    "minecraft:moss_block",
    "minecraft:mycelium",
    "minecraft:pale_moss_block",
    "minecraft:red_sand",
    "minecraft:sand",
    "ntk:corrupted_dirt",
    // Nylium:
    "minecraft:crimson_nylium",
    "minecraft:warped_nylium"
  ];
  const validBlockTags = [
    "ntk:bryumed_blocks",
    "ntk:grassed_blocks",
    "ntk:mauve_turfed_blocks",
    "ntk:mossed_blocks",
    "ntk:myceliated_blocks"
  ];
  
  function plantFlourishing(area, dimension) {
    for (const eachLocation of area.getBlockLocationIterator()) {
      let block = dimension.getBlock(eachLocation);
      if (!block) continue;
      let blockPerm = block.permutation;
      let vegetationChance = Math.random() * 100.0 + 1.0;
      let plantTypeChance = Math.random() * 100.0 + 1.0;
      let randomChance = Math.random() * 100.0 + 1.0;
      // Grasses:
      if (block.typeId === "minecraft:bush") {
        if (vegetationChance <= 75) {
          let bushSoilBlock = [
            "minecraft:coarse_dirt",
            "minecraft:dirt",
            "minecraft:dirt_with_roots",
            "minecraft:farmland",
            "minecraft:grass_block",
            "minecraft:moss_block",
            "minecraft:mud",
            "minecraft:mycelium",
            "minecraft:muddy_mangrove_roots",
            "minecraft:pale_moss_block",
            "minecraft:podzol"
          ];
          if (block.north().isAir && bushSoilBlock.includes(block.north().below().typeId)) {
            block = block.north();
            block.setType("minecraft:bush");
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.east().isAir && bushSoilBlock.includes(block.east().below().typeId)) {
            block = block.east();
            block.setType("minecraft:bush");
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.south().isAir && bushSoilBlock.includes(block.south().below().typeId)) {
            block = block.south();
            block.setType("minecraft:bush");
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.west().isAir && bushSoilBlock.includes(block.west().below().typeId)) {
            block = block.west();
            block.setType("minecraft:bush");
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.typeId === "minecraft:fern") {
        if (vegetationChance <= 50) {
          if (block.above().isAir) {
            block.setPermutation(BlockPermutation.resolve("minecraft:large_fern", { "upper_block_bit": false }));
            block.above().setPermutation(BlockPermutation.resolve("minecraft:large_fern", { "upper_block_bit": true }));
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.typeId === "minecraft:firefly_bush") {
        if (vegetationChance <= 75) {
          let fireflyBushSoilBlock = [
            "minecraft:coarse_dirt",
            "minecraft:dirt",
            "minecraft:dirt_with_roots",
            "minecraft:farmland",
            "minecraft:grass_block",
            "minecraft:moss_block",
            "minecraft:mud",
            "minecraft:mycelium",
            "minecraft:muddy_mangrove_roots",
            "minecraft:pale_moss_block",
            "minecraft:podzol"
          ];
          if (block.north().isAir && fireflyBushSoilBlock.includes(block.north().below().typeId)) {
            block = block.north();
            block.setType("minecraft:firefly_bush");
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.east().isAir && fireflyBushSoilBlock.includes(block.east().below().typeId)) {
            block = block.east();
            block.setType("minecraft:firefly_bush");
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.south().isAir && fireflyBushSoilBlock.includes(block.south().below().typeId)) {
            block = block.south();
            block.setType("minecraft:firefly_bush");
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.west().isAir && fireflyBushSoilBlock.includes(block.west().below().typeId)) {
            block = block.west();
            block.setType("minecraft:firefly_bush");
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.typeId === "minecraft:seagrass") {
        if (vegetationChance <= 50) {
          if (block.permutation.matches("minecraft:seagrass", { "sea_grass_type": "default" })) {
            if (block.above().typeId === "minecraft:water") {
              block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "double_bot" }));
              block.above().setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "double_top" }));
              dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
            }
          }
        }
      }
      if (block.typeId === "minecraft:short_dry_grass") {
        if (vegetationChance <= 100) {
          block.setType("minecraft:tall_dry_grass");
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      if (block.typeId === "minecraft:short_grass") {
        if (vegetationChance <= 50) {
          if (block.above().isAir) {
            block.setPermutation(BlockPermutation.resolve("minecraft:tall_grass", { "upper_block_bit": false }));
            block.above().setPermutation(BlockPermutation.resolve("minecraft:tall_grass", { "upper_block_bit": true }));
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.typeId === "minecraft:tall_dry_grass") {
        if (vegetationChance <= 75) {
          let dryGrassSoilBlock = [
            "minecraft:coarse_dirt",
            "minecraft:dirt",
            "minecraft:dirt_with_roots",
            "minecraft:farmland",
            "minecraft:grass_block",
            "minecraft:grass_path",
            "minecraft:hardened_clay",
            "minecraft:moss_block",
            "minecraft:mud",
            "minecraft:mycelium",
            "minecraft:muddy_mangrove_roots",
            "minecraft:pale_moss_block",
            "minecraft:podzol",
            "minecraft:red_sand",
            "minecraft:sand",
            "minecraft:suspicious_sand"
          ];
          if (block.north().isAir && dryGrassSoilBlock.includes(block.north().below().typeId)) {
            block = block.north();
            block.setType("minecraft:short_dry_grass");
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.east().isAir && dryGrassSoilBlock.includes(block.east().below().typeId)) {
            block = block.east();
            block.setType("minecraft:short_dry_grass");
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.south().isAir && dryGrassSoilBlock.includes(block.south().below().typeId)) {
            block = block.south();
            block.setType("minecraft:short_dry_grass");
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.west().isAir && dryGrassSoilBlock.includes(block.west().below().typeId)) {
            block = block.west();
            block.setType("minecraft:short_dry_grass");
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.typeId === "ntk:short_lush_bush") {
        if (vegetationChance <= 100) {
          block.setType("ntk:tall_lush_bush");
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      if (block.typeId === "ntk:tall_lush_bush") {
        if (vegetationChance <= 75) {
          let lushBushSoilBlock = [
            "minecraft:coarse_dirt",
            "minecraft:dirt",
            "minecraft:dirt_with_roots",
            "minecraft:farmland",
            "minecraft:grass_block",
            "minecraft:moss_block",
            "minecraft:mycelium",
            "minecraft:pale_moss_block",
            "minecraft:podzol"
          ];
          let soilBlockTags = [
            "ntk:bryumed_blocks",
            "ntk:grassed_blocks",
            "ntk:mauve_turfed_blocks",
            "ntk:mossed_blocks",
            "ntk:myceliated_blocks",
            "ntk:dirt",
            "ntk:moss"
          ];
          if (block.north().isAir) {
            let blockBelow = block.north().below();
            const blockTags = blockBelow.getTags();
            if (lushBushSoilBlock.includes(blockBelow.typeId) || blockTags.some(tag => soilBlockTags.includes(tag))) {
              block = block.north();
              block.setType("ntk:short_lush_bush");
              dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
            }
          }
          else if (block.east().isAir) {
            let blockBelow = block.east().below();
            const blockTags = blockBelow.getTags();
            if (lushBushSoilBlock.includes(blockBelow.typeId) || blockTags.some(tag => soilBlockTags.includes(tag))) {
              block = block.east();
              block.setType("ntk:short_lush_bush");
              dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
            }
          }
          else if (block.south().isAir) {
            let blockBelow = block.south().below();
            const blockTags = blockBelow.getTags();
            if (lushBushSoilBlock.includes(blockBelow.typeId) || blockTags.some(tag => soilBlockTags.includes(tag))) {
              block = block.south();
              block.setType("ntk:short_lush_bush");
              dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
            }
          }
          else if (block.west().isAir) {
            let blockBelow = block.west().below();
            const blockTags = blockBelow.getTags();
            if (lushBushSoilBlock.includes(blockBelow.typeId) || blockTags.some(tag => soilBlockTags.includes(tag))) {
              block = block.west();
              block.setType("ntk:short_lush_bush");
              dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
            }
          }
        }
      }
      // Sprouts:
      if (block.typeId === "ntk:short_glowcelium_sprouts") {
        if (vegetationChance <= 100) {
          block.setType("ntk:tall_glowcelium_sprouts");
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      if (block.typeId === "ntk:short_moss_sprouts") {
        if (vegetationChance <= 100) {
          block.setType("ntk:tall_moss_sprouts");
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      if (block.typeId === "ntk:short_mycelium_sprouts") {
        if (vegetationChance <= 100) {
          block.setType("ntk:tall_mycelium_sprouts");
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      // Flowers:
      if (block.typeId === "minecraft:pink_petals") {
        let cardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
        if (block.permutation.matches("minecraft:pink_petals", { "growth": 0 })) {
          block.setPermutation(BlockPermutation.resolve("minecraft:pink_petals", { "minecraft:cardinal_direction": cardinalDirection, "growth": 1 }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
        else if (block.permutation.matches("minecraft:pink_petals", { "growth": 1 })) {
          block.setPermutation(BlockPermutation.resolve("minecraft:pink_petals", { "minecraft:cardinal_direction": cardinalDirection, "growth": 2 }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
        else if (block.permutation.matches("minecraft:pink_petals", { "growth": 2 })) {
          block.setPermutation(BlockPermutation.resolve("minecraft:pink_petals", { "minecraft:cardinal_direction": cardinalDirection, "growth": 3 }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      if (block.typeId === "minecraft:wildflowers") {
        let cardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
        if (block.permutation.matches("minecraft:wildflowers", { "growth": 0 })) {
          block.setPermutation(BlockPermutation.resolve("minecraft:wildflowers", { "minecraft:cardinal_direction": cardinalDirection, "growth": 1 }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
        else if (block.permutation.matches("minecraft:wildflowers", { "growth": 1 })) {
          block.setPermutation(BlockPermutation.resolve("minecraft:wildflowers", { "minecraft:cardinal_direction": cardinalDirection, "growth": 2 }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
        else if (block.permutation.matches("minecraft:wildflowers", { "growth": 2 })) {
          block.setPermutation(BlockPermutation.resolve("minecraft:wildflowers", { "minecraft:cardinal_direction": cardinalDirection, "growth": 3 }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      // Saplings:
      if (block.typeId === "minecraft:bamboo") {
        if (block.below().typeId !== "minecraft:bamboo") {
          if (block.permutation.matches("minecraft:bamboo", { "bamboo_stalk_thickness": "thin", "bamboo_leaf_size": "no_leaves" }) && block.above(1).permutation.matches("minecraft:bamboo", { "bamboo_stalk_thickness": "thin", "bamboo_leaf_size": "small_leaves" }) && block.above(2).isAir) {
            block.above(1).setPermutation(BlockPermutation.resolve("minecraft:bamboo", { "bamboo_stalk_thickness": "thin", "bamboo_leaf_size": "small_leaves", "age_bit": false }));
            block.above(2).setPermutation(BlockPermutation.resolve("minecraft:bamboo", { "bamboo_stalk_thickness": "thin", "bamboo_leaf_size": "small_leaves", "age_bit": false }));
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.permutation.matches("minecraft:bamboo", { "bamboo_stalk_thickness": "thin", "bamboo_leaf_size": "no_leaves" }) && block.above(1).permutation.matches("minecraft:bamboo", { "bamboo_stalk_thickness": "thin", "bamboo_leaf_size": "small_leaves" }) && block.above(2).permutation.matches("minecraft:bamboo", { "bamboo_stalk_thickness": "thin", "bamboo_leaf_size": "small_leaves" }) && block.above(3).isAir) {
            block.setPermutation(BlockPermutation.resolve("minecraft:bamboo", { "bamboo_stalk_thickness": "thick", "bamboo_leaf_size": "no_leaves", "age_bit": false }));
            block.above(1).setPermutation(BlockPermutation.resolve("minecraft:bamboo", { "bamboo_stalk_thickness": "thick", "bamboo_leaf_size": "no_leaves", "age_bit": false }));
            block.above(1).above(1).setPermutation(BlockPermutation.resolve("minecraft:bamboo", { "bamboo_stalk_thickness": "thick", "bamboo_leaf_size": "small_leaves", "age_bit": false }));
            block.above(3).setPermutation(BlockPermutation.resolve("minecraft:bamboo", { "bamboo_stalk_thickness": "thick", "bamboo_leaf_size": "large_leaves", "age_bit": false }));
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.typeId === "minecraft:bamboo_sapling") {
        if (block.above().isAir) {
          block.setPermutation(BlockPermutation.resolve("minecraft:bamboo", { "bamboo_stalk_thickness": "thin", "bamboo_leaf_size": "no_leaves", "age_bit": false }));
          block.above().setPermutation(BlockPermutation.resolve("minecraft:bamboo", { "bamboo_stalk_thickness": "thin", "bamboo_leaf_size": "small_leaves", "age_bit": false }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      // Crops:
      if (block.typeId === "minecraft:beetroot") {
        let ageGrowth = blockPerm.getState("growth");
        if (ageGrowth < 7) {
          block.setPermutation(BlockPermutation.resolve("minecraft:beetroot", { "growth": 7 }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      if (block.typeId === "minecraft:carrots") {
        let ageGrowth = blockPerm.getState("growth");
        if (ageGrowth < 7) {
          block.setPermutation(BlockPermutation.resolve("minecraft:carrots", { "growth": 7 }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      if (block.typeId === "minecraft:cocoa") {
        let ageGrowth = blockPerm.getState("age");
        let facingDirection = blockPerm.getState("direction");
        if (ageGrowth != 2) {
          block.setPermutation(BlockPermutation.resolve("minecraft:cocoa", { "direction": facingDirection, "age": 2 }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      if (block.typeId === "minecraft:melon_stem") {
        let ageGrowth = blockPerm.getState("growth");
        let facingDirection = blockPerm.getState("facing_direction");
        if (ageGrowth < 7) {
          block.setPermutation(BlockPermutation.resolve("minecraft:melon_stem", { "growth": 7, "facing_direction": facingDirection }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      if (block.typeId === "minecraft:pitcher_crop") {
        if (block.permutation.matches("minecraft:pitcher_crop", { "growth": 0 })) {
          block.setPermutation(BlockPermutation.resolve("minecraft:pitcher_crop", { "growth": 1 }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
        else if (block.permutation.matches("minecraft:pitcher_crop", { "growth": 1 })) {
          block.setPermutation(BlockPermutation.resolve("minecraft:pitcher_crop", { "growth": 2 }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
        else if (block.permutation.matches("minecraft:pitcher_crop", { "growth": 2 }) && block.above().isAir) {
          block.setPermutation(BlockPermutation.resolve("minecraft:pitcher_crop", { "growth": 3 }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
        else if (block.permutation.matches("minecraft:pitcher_crop", { "growth": 3, "upper_block_bit": false })) {
          block.setPermutation(BlockPermutation.resolve("minecraft:pitcher_crop", { "growth": 4, "upper_block_bit": false }));
          block.above().setPermutation(BlockPermutation.resolve("minecraft:pitcher_crop", { "growth": 4, "upper_block_bit": true }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      if (block.typeId === "minecraft:potatoes") {
        let ageGrowth = blockPerm.getState("growth");
        if (ageGrowth < 7) {
          block.setPermutation(BlockPermutation.resolve("minecraft:potatoes", { "growth": 7 }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      if (block.typeId === "minecraft:pumpkin_stem") {
        let ageGrowth = blockPerm.getState("growth");
        let facingDirection = blockPerm.getState("facing_direction");
        if (ageGrowth < 7) {
          block.setPermutation(BlockPermutation.resolve("minecraft:pumpkin_stem", { "growth": 7, "facing_direction": facingDirection }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      if (block.typeId === "minecraft:sweet_berry_bush") {
        let ageGrowth = blockPerm.getState("growth");
        if (ageGrowth < 3) {
          block.setPermutation(BlockPermutation.resolve("minecraft:sweet_berry_bush", { "growth": 3 }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      if (block.typeId === "minecraft:torchflower_crop") {
        if (block.permutation.matches("minecraft:torchflower_crop", { "growth": 0 })) {
          block.setPermutation(BlockPermutation.resolve("minecraft:torchflower_crop", { "growth": 1 }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
        else if (block.permutation.matches("minecraft:torchflower_crop", { "growth": 1 })) {
          block.setPermutation(BlockPermutation.resolve("minecraft:torchflower"));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
        else if (block.permutation.matches("minecraft:torchflower_crop", { "growth": 2 })) {
          block.setPermutation(BlockPermutation.resolve("minecraft:torchflower"));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
        else if (block.permutation.matches("minecraft:torchflower_crop", { "growth": 3 })) {
          block.setPermutation(BlockPermutation.resolve("minecraft:torchflower"));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      if (block.typeId === "minecraft:wheat") {
        let ageGrowth = blockPerm.getState("growth");
        if (ageGrowth < 7) {
          block.setPermutation(BlockPermutation.resolve("minecraft:wheat", { "growth": 7 }));
          dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        }
      }
      // Plants:
      if (block.typeId === "minecraft:reeds") {
        if (block.below().typeId !== "minecraft:reeds") {
          if (block.above(1).isAir && block.above(2).isAir != true) {
            block.above(1).setPermutation(BlockPermutation.resolve("minecraft:reeds"));
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above(1).isAir && block.above(2).isAir) {
            block.above(1).setPermutation(BlockPermutation.resolve("minecraft:reeds"));
            block.above(2).setPermutation(BlockPermutation.resolve("minecraft:reeds"));
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above(1).typeId === "minecraft:reeds" && block.above(2).isAir) {
            block.above(2).setPermutation(BlockPermutation.resolve("minecraft:reeds"));
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      // Soil Blocks:
      if (block.typeId === "minecraft:grass_block") {
        if (vegetationChance <= 75) {
          if (block.above().isAir) {
            block = block.above();
            const grassPlantPool = [
              {
                weight: 5,
                event: (block) => {
                  block.setType("ntk:short_lush_bush");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:short_grass");
                }
              },
              {
                weight: 25,
                event: (block) => {
                  block.setType("minecraft:fern");
                }
              },
              {
                weight: 10,
                event: (block) => {
                  block.setType("minecraft:bush");
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("minecraft:firefly_bush");
                }
              }
            ];
            const flowerPlantPool = [
              {
                weight: 10,
                event: (block) => {
                  block.setType("minecraft:azure_bluet");
                }
              },
              {
                weight: 10,
                event: (block) => {
                  block.setType("minecraft:cornflower");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:dandelion");
                }
              },
              {
                weight: 50,
                event: (block) => {
                  block.setType("minecraft:poppy");
                }
              },
              {
                weight: 10,
                event: (block) => {
                  block.setType("minecraft:wildflowers");
                }
              }
            ];
            const tipGrassPlantPool = [
              {
                weight: 20,
                event: (block) => {
                  block.setType("ntk:blue_tip_grass");
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("ntk:light_blue_tip_grass");
                }
              },
              {
                weight: 20,
                event: (block) => {
                  block.setType("ntk:magenta_tip_grass");
                }
              },
              {
                weight: 10,
                event: (block) => {
                  block.setType("ntk:orange_tip_grass");
                }
              },
              {
                weight: 15,
                event: (block) => {
                  block.setType("ntk:pink_tip_grass");
                }
              },
              {
                weight: 50,
                event: (block) => {
                  block.setType("ntk:red_tip_grass");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("ntk:white_tip_grass");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("ntk:yellow_tip_grass");
                }
              }
            ];
            if (plantTypeChance <= 85) {
              const grassPlantGrow = randomEvent(grassPlantPool);
              grassPlantGrow.event(block);
            }
            else if (plantTypeChance <= 90) {
              const flowerPlantGrow = randomEvent(flowerPlantPool);
              flowerPlantGrow.event(block);
            }
            else if (plantTypeChance <= 100) {
              const tipGrassPlantGrow = randomEvent(tipGrassPlantPool);
              tipGrassPlantGrow.event(block);
            }
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above().typeId === "minecraft:water") {
            block = block.above();
            const plantPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.typeId === "minecraft:clay") {
        if (vegetationChance <= 75) {
          if (block.above().isAir && block.above(2).isAir) {
            block = block.above();
            const bigDripleafPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:air");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 0 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 1 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 2 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 3 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": false, "direction": 0 }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 0 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": false, "direction": 1 }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 1 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": false, "direction": 2 }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 2 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": false, "direction": 3 }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 3 }));
                }
              }
            ];
            const smallDripleafPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:air");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:small_dripleaf_block", { "upper_block_bit": false, "direction": 0 }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:small_dripleaf_block", { "upper_block_bit": true, "direction": 0 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:small_dripleaf_block", { "upper_block_bit": false, "direction": 1 }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:small_dripleaf_block", { "upper_block_bit": true, "direction": 1 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:small_dripleaf_block", { "upper_block_bit": false, "direction": 2 }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:small_dripleaf_block", { "upper_block_bit": true, "direction": 2 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:small_dripleaf_block", { "upper_block_bit": false, "direction": 3 }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:small_dripleaf_block", { "upper_block_bit": true, "direction": 3 }));
                }
              }
            ];
            if (plantTypeChance <= 50) {
              const bigDripleafGrow = randomEvent(bigDripleafPool);
              bigDripleafGrow.event(block);
            }
            else if (plantTypeChance <= 100) {
              const smallDripleafGrow = randomEvent(smallDripleafPool);
              smallDripleafGrow.event(block);
            }
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above().isAir && !block.above(2).isAir) {
            block = block.above();
            const bigDripleafPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:air");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 0 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 1 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 2 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 3 }));
                }
              }
            ];
            const bigDripleaf = randomEvent(bigDripleafPool);
            bigDripleaf.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above().typeId === "minecraft:water" && (block.above(2).typeId === "minecraft:water" || block.above(2).isAir)) {
            block = block.above();
            const bigDripleafPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 0 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 1 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 2 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 3 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": false, "direction": 0 }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 0 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": false, "direction": 1 }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 1 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": false, "direction": 2 }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 2 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": false, "direction": 3 }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 3 }));
                }
              }
            ];
            const smallDripleafPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:small_dripleaf_block", { "upper_block_bit": false, "direction": 0 }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:small_dripleaf_block", { "upper_block_bit": true, "direction": 0 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:small_dripleaf_block", { "upper_block_bit": false, "direction": 1 }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:small_dripleaf_block", { "upper_block_bit": true, "direction": 1 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:small_dripleaf_block", { "upper_block_bit": false, "direction": 2 }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:small_dripleaf_block", { "upper_block_bit": true, "direction": 2 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:small_dripleaf_block", { "upper_block_bit": false, "direction": 3 }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:small_dripleaf_block", { "upper_block_bit": true, "direction": 3 }));
                }
              }
            ];
            const coralPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:brain_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:bubble_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:fire_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:horn_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:tube_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:brain_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:bubble_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:fire_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:horn_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:tube_coral_fan");
                }
              }
            ];
            const warmOceanPlantPool = [
              {
                weight: 15,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:kelp", { "kelp_age": 0 }));
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("minecraft:sea_pickle");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            const oceanPlantPool = [
              {
                weight: 5,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:kelp", { "kelp_age": 0 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            if (biomeId === "minecraft:warm_ocean" || biomeId === "minecraft:lukewarm_ocean" || biomeId === "minecraft:deep_lukewarm_ocean") {
              if (plantTypeChance <= 25) {
                const coralGrow = randomEvent(coralPool);
                coralGrow.event(block);
              }
              else if (plantTypeChance <= 80) {
                const warmOceanPlantGrow = randomEvent(warmOceanPlantPool);
                warmOceanPlantGrow.event(block);
              }
              else if (plantTypeChance <= 90) {
                const bigDripleafGrow = randomEvent(bigDripleafPool);
                bigDripleafGrow.event(block);
              }
              else if (plantTypeChance <= 100) {
                const smallDripleafGrow = randomEvent(smallDripleafPool);
                smallDripleafGrow.event(block);
              }
            }
            else {
              if (plantTypeChance <= 5) {
                const coralGrow = randomEvent(coralPool);
                coralGrow.event(block);
              }
              else if (plantTypeChance <= 80) {
                const oceanPlantGrow = randomEvent(oceanPlantPool);
                oceanPlantGrow.event(block);
              }
              else if (plantTypeChance <= 90) {
                const bigDripleafGrow = randomEvent(bigDripleafPool);
                bigDripleafGrow.event(block);
              }
              else if (plantTypeChance <= 100) {
                const smallDripleafGrow = randomEvent(smallDripleafPool);
                smallDripleafGrow.event(block);
              }
            }
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above().typeId === "minecraft:water" && !block.above(2).typeId === "minecraft:water" && !block.above(2).isAir) {
            block = block.above();
            const bigDripleafPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 0 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 1 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 2 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:big_dripleaf", { "big_dripleaf_head": true, "direction": 3 }));
                }
              }
            ];
            const coralPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:brain_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:bubble_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:fire_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:horn_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:tube_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:brain_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:bubble_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:fire_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:horn_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:tube_coral_fan");
                }
              }
            ];
            const warmOceanPlantPool = [
              {
                weight: 15,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:kelp", { "kelp_age": 0 }));
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("minecraft:sea_pickle");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            const oceanPlantPool = [
              {
                weight: 5,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:kelp", { "kelp_age": 0 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            if (biomeId === "minecraft:warm_ocean" || biomeId === "minecraft:lukewarm_ocean" || biomeId === "minecraft:deep_lukewarm_ocean") {
              if (plantTypeChance <= 25) {
                const coralGrow = randomEvent(coralPool);
                coralGrow.event(block);
              }
              else if (plantTypeChance <= 90) {
                const warmOceanPlantGrow = randomEvent(warmOceanPlantPool);
                warmOceanPlantGrow.event(block);
              }
              else if (plantTypeChance <= 100) {
                const bigDripleafGrow = randomEvent(bigDripleafPool);
                bigDripleafGrow.event(block);
              }
            }
            else {
              if (plantTypeChance <= 5) {
                const coralGrow = randomEvent(coralPool);
                coralGrow.event(block);
              }
              else if (plantTypeChance <= 90) {
                const oceanPlantGrow = randomEvent(oceanPlantPool);
                oceanPlantGrow.event(block);
              }
              else if (plantTypeChance <= 100) {
                const bigDripleafGrow = randomEvent(bigDripleafPool);
                bigDripleafGrow.event(block);
              }
            }
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.typeId === "minecraft:coarse_dirt") {
        if (vegetationChance <= 75) {
          if (block.above().isAir) {
            block = block.above();
            const plantPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:air");
                }
              },
              {
                weight: 35,
                event: (block) => {
                  block.setType("minecraft:short_dry_grass");
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above().typeId === "minecraft:water") {
            block = block.above();
            const coralPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:brain_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:bubble_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:fire_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:horn_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:tube_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:brain_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:bubble_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:fire_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:horn_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:tube_coral_fan");
                }
              }
            ];
            const warmOceanPlantPool = [
              {
                weight: 15,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:kelp", { "kelp_age": 0 }));
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("minecraft:sea_pickle");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            const oceanPlantPool = [
              {
                weight: 5,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:kelp", { "kelp_age": 0 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            if (biomeId === "minecraft:warm_ocean" || biomeId === "minecraft:lukewarm_ocean" || biomeId === "minecraft:deep_lukewarm_ocean") {
              if (plantTypeChance <= 25) {
                const coralGrow = randomEvent(coralPool);
                coralGrow.event(block);
              }
              else if (plantTypeChance <= 100) {
                const warmOceanPlantGrow = randomEvent(warmOceanPlantPool);
                warmOceanPlantGrow.event(block);
              }
            }
            else {
              if (plantTypeChance <= 10) {
                const coralGrow = randomEvent(coralPool);
                coralGrow.event(block);
              }
              else if (plantTypeChance <= 100) {
                const oceanPlantGrow = randomEvent(oceanPlantPool);
                oceanPlantGrow.event(block);
              }
            }
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.typeId === "minecraft:dirt") {
        if (vegetationChance <= 75) {
          if (block.above().isAir) {
            block.setType("minecraft:grass_block");
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 1.0, z: block.location.z + 0.5 });
          }
          else if (block.above().typeId === "minecraft:water") {
            block = block.above();
            const coralPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:brain_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:bubble_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:fire_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:horn_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:tube_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:brain_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:bubble_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:fire_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:horn_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:tube_coral_fan");
                }
              }
            ];
            const warmOceanPlantPool = [
              {
                weight: 15,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:kelp", { "kelp_age": 0 }));
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("minecraft:sea_pickle");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            const oceanPlantPool = [
              {
                weight: 5,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:kelp", { "kelp_age": 0 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            if (biomeId === "minecraft:warm_ocean" || biomeId === "minecraft:lukewarm_ocean" || biomeId === "minecraft:deep_lukewarm_ocean") {
              if (plantTypeChance <= 25) {
                const coralGrow = randomEvent(coralPool);
                coralGrow.event(block);
              }
              else if (plantTypeChance <= 100) {
                const warmOceanPlantGrow = randomEvent(warmOceanPlantPool);
                warmOceanPlantGrow.event(block);
              }
            }
            else {
              if (plantTypeChance <= 10) {
                const coralGrow = randomEvent(coralPool);
                coralGrow.event(block);
              }
              else if (plantTypeChance <= 100) {
                const oceanPlantGrow = randomEvent(oceanPlantPool);
                oceanPlantGrow.event(block);
              }
            }
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.typeId === "minecraft:gravel") {
        if (vegetationChance <= 75) {
          if (block.above().typeId === "minecraft:water") {
            block = block.above();
            const coralPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:brain_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:bubble_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:fire_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:horn_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:tube_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:brain_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:bubble_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:fire_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:horn_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:tube_coral_fan");
                }
              }
            ];
            const warmOceanPlantPool = [
              {
                weight: 15,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:kelp", { "kelp_age": 0 }));
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("minecraft:sea_pickle");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            const oceanPlantPool = [
              {
                weight: 5,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:kelp", { "kelp_age": 0 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            if (biomeId === "minecraft:warm_ocean" || biomeId === "minecraft:lukewarm_ocean" || biomeId === "minecraft:deep_lukewarm_ocean") {
              if (plantTypeChance <= 25) {
                const coralGrow = randomEvent(coralPool);
                coralGrow.event(block);
              }
              else if (plantTypeChance <= 100) {
                const warmOceanPlantGrow = randomEvent(warmOceanPlantPool);
                warmOceanPlantGrow.event(block);
              }
            }
            else {
              if (plantTypeChance <= 10) {
                const coralGrow = randomEvent(coralPool);
                coralGrow.event(block);
              }
              else if (plantTypeChance <= 100) {
                const oceanPlantGrow = randomEvent(oceanPlantPool);
                oceanPlantGrow.event(block);
              }
            }
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.typeId === "minecraft:moss_block") {
        if (vegetationChance <= 75) {
          if (block.above().isAir && block.above(2).isAir) {
            block = block.above();
            const plantPool = [
              {
                weight: 1,
                event: (block) => {
                  block.setType("ntk:moss_berry_bush");
                }
              },
              {
                weight: 1,
                event: (block) => {
                  block.setType("ntk:mosshroom_fungus");
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("ntk:short_lush_bush");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("ntk:short_moss_sprouts");
                }
              },
              {
                weight: 3,
                event: (block) => {
                  block.setType("ntk:tall_lush_bush");
                }
              },
              {
                weight: 15,
                event: (block) => {
                  block.setType("ntk:tall_moss_sprouts");
                }
              },
              {
                weight: 3,
                event: (block) => {
                  block.setType("minecraft:azalea");
                }
              },
              {
                weight: 3,
                event: (block) => {
                  block.setType("minecraft:bush");
                }
              },
              {
                weight: 15,
                event: (block) => {
                  block.setType("minecraft:fern");
                }
              },
              {
                weight: 2,
                event: (block) => {
                  block.setType("minecraft:flowering_azalea");
                }
              },
              {
                weight: 3,
                event: (block) => {
                  block.setType("minecraft:moss_carpet");
                }
              },
              {
                weight: 50,
                event: (block) => {
                  block.setType("minecraft:short_grass");
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:tall_grass", { "upper_block_bit": false }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:tall_grass", { "upper_block_bit": true }));
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above().isAir && !block.above(2).isAir) {
            block = block.above();
            const plantPool = [
              {
                weight: 1,
                event: (block) => {
                  block.setType("ntk:moss_berry_bush");
                }
              },
              {
                weight: 1,
                event: (block) => {
                  block.setType("ntk:mosshroom_fungus");
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("ntk:short_lush_bush");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("ntk:short_moss_sprouts");
                }
              },
              {
                weight: 3,
                event: (block) => {
                  block.setType("ntk:tall_lush_bush");
                }
              },
              {
                weight: 15,
                event: (block) => {
                  block.setType("ntk:tall_moss_sprouts");
                }
              },
              {
                weight: 3,
                event: (block) => {
                  block.setType("minecraft:azalea");
                }
              },
              {
                weight: 3,
                event: (block) => {
                  block.setType("minecraft:bush");
                }
              },
              {
                weight: 15,
                event: (block) => {
                  block.setType("minecraft:fern");
                }
              },
              {
                weight: 2,
                event: (block) => {
                  block.setType("minecraft:flowering_azalea");
                }
              },
              {
                weight: 3,
                event: (block) => {
                  block.setType("minecraft:moss_carpet");
                }
              },
              {
                weight: 50,
                event: (block) => {
                  block.setType("minecraft:short_grass");
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above().typeId === "minecraft:water") {
            block = block.above();
            const plantPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.typeId === "minecraft:mycelium") {
        if (vegetationChance <= 75) {
          if (block.above().isAir) {
            block = block.above();
            const plantPool = [
              {
                weight: 5,
                event: (block) => {
                  block.setType("ntk:short_glowcelium_sprouts");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("ntk:short_mycelium_sprouts");
                }
              },
              {
                weight: 1,
                event: (block) => {
                  block.setType("ntk:tall_glowcelium_sprouts");
                }
              },
              {
                weight: 25,
                event: (block) => {
                  block.setType("ntk:tall_mycelium_sprouts");
                }
              },
              {
                weight: 25,
                event: (block) => {
                  block.setType("minecraft:brown_mushroom");
                }
              },
              {
                weight: 25,
                event: (block) => {
                  block.setType("minecraft:red_mushroom");
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above().typeId === "minecraft:water") {
            block = block.above();
            const plantPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.typeId === "minecraft:pale_moss_block") {
        if (vegetationChance <= 75) {
          if (block.above().isAir && block.above(2).isAir) {
            block = block.above();
            const plantPool = [
              {
                weight: 10,
                event: (block) => {
                  block.setType("ntk:short_lush_bush");
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("ntk:tall_lush_bush");
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("minecraft:bush");
                }
              },
              {
                weight: 10,
                event: (block) => {
                  block.setType("minecraft:fern");
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("minecraft:pale_moss_carpet");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:short_grass");
                }
              },
              {
                weight: 10,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:tall_grass", { "upper_block_bit": false }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:tall_grass", { "upper_block_bit": true }));
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above().isAir && !block.above(2).isAir) {
            block = block.above();
            const plantPool = [
              {
                weight: 10,
                event: (block) => {
                  block.setType("ntk:short_lush_bush");
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("ntk:tall_lush_bush");
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("minecraft:bush");
                }
              },
              {
                weight: 10,
                event: (block) => {
                  block.setType("minecraft:fern");
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("minecraft:pale_moss_carpet");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:short_grass");
                }
              },
              {
                weight: 10,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:tall_grass", { "upper_block_bit": false }));
                  block.above().setPermutation(BlockPermutation.resolve("minecraft:tall_grass", { "upper_block_bit": true }));
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above().typeId === "minecraft:water") {
            block = block.above();
            const plantPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.typeId === "minecraft:sand" || block.typeId === "minecraft:red_sand") {
        if (vegetationChance <= 75) {
          if (block.above().isAir) {
            block = block.above();
            const plantPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:air");
                }
              },
              {
                weight: 35,
                event: (block) => {
                  block.setType("minecraft:short_dry_grass");
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above().typeId === "minecraft:water") {
            block = block.above();
            const coralPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:brain_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:bubble_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:fire_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:horn_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:tube_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:brain_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:bubble_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:fire_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:horn_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:tube_coral_fan");
                }
              }
            ];
            const warmOceanPlantPool = [
              {
                weight: 15,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:kelp", { "kelp_age": 0 }));
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("minecraft:sea_pickle");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            const oceanPlantPool = [
              {
                weight: 5,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:kelp", { "kelp_age": 0 }));
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            if (biomeId === "minecraft:warm_ocean" || biomeId === "minecraft:lukewarm_ocean" || biomeId === "minecraft:deep_lukewarm_ocean") {
              if (plantTypeChance <= 25) {
                const coralGrow = randomEvent(coralPool);
                coralGrow.event(block);
              }
              else if (plantTypeChance <= 100) {
                const warmOceanPlantGrow = randomEvent(warmOceanPlantPool);
                warmOceanPlantGrow.event(block);
              }
            }
            else {
              if (plantTypeChance <= 10) {
                const coralGrow = randomEvent(coralPool);
                coralGrow.event(block);
              }
              else if (plantTypeChance <= 100) {
                const oceanPlantGrow = randomEvent(oceanPlantPool);
                oceanPlantGrow.event(block);
              }
            }
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.typeId === "ntk:corrupted_dirt") {
        if (vegetationChance <= 75) {
          if (block.above().isAir) {
            block = block.above();
            const plantPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setType("ntk:corrupted_grass");
                }
              },
              {
                weight: 10,
                event: (block) => {
                  block.setType("ntk:corrupted_oak_sapling");
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above().typeId === "minecraft:water") {
            block = block.above();
            const coralPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:dead_brain_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:dead_bubble_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:dead_fire_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:dead_horn_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:dead_tube_coral");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:dead_brain_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:dead_bubble_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:dead_fire_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:dead_horn_coral_fan");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:dead_tube_coral_fan");
                }
              }
            ];
            const plantPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            if (plantTypeChance <= 5) {
              const coralGrow = randomEvent(coralPool);
              coralGrow.event(block);
            }
            else if (plantTypeChance <= 100) {
              const plantGrow = randomEvent(plantPool);
              plantGrow.event(block);
            }
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      // Nylium:
      if (block.typeId === "minecraft:crimson_nylium") {
        if (vegetationChance <= 75) {
          if (block.above().isAir) {
            block = block.above();
            const plantPool = [
              {
                weight: 10,
                event: (block) => {
                  block.setType("minecraft:crimson_fungus");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:crimson_roots");
                }
              },
              {
                weight: 3,
                event: (block) => {
                  block.setType("minecraft:warped_fungus");
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.typeId === "minecraft:warped_nylium") {
        if (vegetationChance <= 75) {
          if (block.above().isAir) {
            block = block.above();
            const plantPool = [
              {
                weight: 3,
                event: (block) => {
                  block.setType("minecraft:crimson_fungus");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("minecraft:crimson_roots");
                }
              },
              {
                weight: 15,
                event: (block) => {
                  block.setType("minecraft:nether_sprouts");
                }
              },
              {
                weight: 10,
                event: (block) => {
                  block.setType("minecraft:warped_fungus");
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      // Foliaged Blocks:
      if (block.hasTag("ntk:grassed_blocks")) {
        if (vegetationChance <= 75) {
          if (block.above().isAir) {
            block = block.above();
            const plantPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setType("ntk:short_lush_bush");
                }
              },
              {
                weight: 10,
                event: (block) => {
                  block.setType("ntk:tall_lush_bush");
                }
              }
            ];
            const tipGrassPlantPool = [
              {
                weight: 20,
                event: (block) => {
                  block.setType("ntk:blue_tip_grass");
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("ntk:light_blue_tip_grass");
                }
              },
              {
                weight: 20,
                event: (block) => {
                  block.setType("ntk:magenta_tip_grass");
                }
              },
              {
                weight: 10,
                event: (block) => {
                  block.setType("ntk:orange_tip_grass");
                }
              },
              {
                weight: 15,
                event: (block) => {
                  block.setType("ntk:pink_tip_grass");
                }
              },
              {
                weight: 50,
                event: (block) => {
                  block.setType("ntk:red_tip_grass");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("ntk:white_tip_grass");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("ntk:yellow_tip_grass");
                }
              }
            ];
            if (plantTypeChance <= 75) {
              const plantGrow = randomEvent(plantPool);
              plantGrow.event(block);
            }
            else if (plantTypeChance <= 100) {
              const tipGrassPlantGrow = randomEvent(tipGrassPlantPool);
              tipGrassPlantGrow.event(block);
            }
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above().typeId === "minecraft:water") {
            block = block.above();
            const plantPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.hasTag("ntk:mossed_blocks")) {
        if (vegetationChance <= 75) {
          if (block.above().isAir) {
            block = block.above();
            const plantPool = [
              {
                weight: 1,
                event: (block) => {
                  block.setType("ntk:moss_berry_bush");
                }
              },
              {
                weight: 1,
                event: (block) => {
                  block.setType("ntk:mosshroom_fungus");
                }
              },
              {
                weight: 5,
                event: (block) => {
                  block.setType("ntk:short_lush_bush");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("ntk:short_moss_sprouts");
                }
              },
              {
                weight: 3,
                event: (block) => {
                  block.setType("ntk:tall_lush_bush");
                }
              },
              {
                weight: 15,
                event: (block) => {
                  block.setType("ntk:tall_moss_sprouts");
                }
              },
              {
                weight: 3,
                event: (block) => {
                  block.setType("minecraft:moss_carpet");
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above().typeId === "minecraft:water") {
            block = block.above();
            const plantPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
      if (block.hasTag("ntk:myceliated_blocks")) {
        if (vegetationChance <= 75) {
          if (block.above().isAir) {
            block = block.above();
            const plantPool = [
              {
                weight: 5,
                event: (block) => {
                  block.setType("ntk:short_glowcelium_sprouts");
                }
              },
              {
                weight: 100,
                event: (block) => {
                  block.setType("ntk:short_mycelium_sprouts");
                }
              },
              {
                weight: 1,
                event: (block) => {
                  block.setType("ntk:tall_glowcelium_sprouts");
                }
              },
              {
                weight: 25,
                event: (block) => {
                  block.setType("ntk:tall_mycelium_sprouts");
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
          else if (block.above().typeId === "minecraft:water") {
            block = block.above();
            const plantPool = [
              {
                weight: 100,
                event: (block) => {
                  block.setPermutation(BlockPermutation.resolve("minecraft:seagrass", { "sea_grass_type": "default" }));
                }
              }
            ];
            const plantGrow = randomEvent(plantPool);
            plantGrow.event(block);
            dimension.spawnParticle("minecraft:crop_growth_emitter", { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          }
        }
      }
    }
  }
  
  if (magicSpell.typeId === "ntk:miscellaneous_flourishing_magic_spell_1") {
    const radius = 4;
    const min = {
      x: magicLocation.x - radius,
      y: magicLocation.y - radius,
      z: magicLocation.z - radius
    };
    const max = {
      x: magicLocation.x + radius,
      y: magicLocation.y + radius,
      z: magicLocation.z + radius
    };
    const volume = new BlockVolume(min, max);
    const blocksArea = magicSpell.dimension.getBlocks(
      volume,
      { 
        includeTypes: validBlockList,
        includeTags: validBlockTags
      },
      true
    );
    plantFlourishing(blocksArea, magicSpell.dimension);
  }
  if (magicSpell.typeId === "ntk:miscellaneous_flourishing_magic_spell_2") {
    const radius = 8;
    const min = {
      x: magicLocation.x - radius,
      y: magicLocation.y - radius,
      z: magicLocation.z - radius
    };
    const max = {
      x: magicLocation.x + radius,
      y: magicLocation.y + radius,
      z: magicLocation.z + radius
    };
    const volume = new BlockVolume(min, max);
    const blocksArea = magicSpell.dimension.getBlocks(
      volume,
      { 
        includeTypes: validBlockList,
        includeTags: validBlockTags
      },
      true
    );
    plantFlourishing(blocksArea, magicSpell.dimension);
  }
  if (magicSpell.typeId === "ntk:miscellaneous_flourishing_magic_spell_3") {
    const radius = 12;
    const min = {
      x: magicLocation.x - radius,
      y: magicLocation.y - radius,
      z: magicLocation.z - radius
    };
    const max = {
      x: magicLocation.x + radius,
      y: magicLocation.y + radius,
      z: magicLocation.z + radius
    };
    const volume = new BlockVolume(min, max);
    const blocksArea = magicSpell.dimension.getBlocks(
      volume,
      { 
        includeTypes: validBlockList,
        includeTags: validBlockTags
      },
      true
    );
    plantFlourishing(blocksArea, magicSpell.dimension);
  }
});
