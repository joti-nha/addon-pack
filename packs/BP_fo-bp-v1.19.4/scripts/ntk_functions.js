import { world, system, ItemStack, GameMode } from "@minecraft/server";

export function changeItem(entity, item, newItemType, stackAmount, slot) {
  if (!item) return;
  const entityEquippable = entity.getComponent("equippable");
  if (!entityEquippable) return;
  const isCreative = entity.typeId === "minecraft:player" && entity.getGameMode() === GameMode.Creative;
  const newItem = new ItemStack(newItemType, stackAmount);
  if (isCreative) {
    entity.dimension.spawnItem(newItem, entity.location);
    return;
  }
  entityEquippable.setEquipment(slot, newItem);
}
/*Imported by:
- "item_component/add_effects_on_consume.js"
- "nie/bc/evaporator.js"
*/

export function damageItemDurability(entity, item, amount, itemSlot, OnHit) {
  if (!item) return;
  if (entity.typeId === "minecraft:player" && entity.getGameMode() === GameMode.Creative) return;
  const entityEquippable = entity.getComponent("minecraft:equippable");
  if (!entityEquippable) return;
  const selectedSlot = entityEquippable.getEquipmentSlot(itemSlot);
  if (!selectedSlot.hasItem()) return;
  const selectedItem = selectedSlot.getItem();
  const itemDurability = selectedItem.getComponent("minecraft:durability");
  if (!itemDurability) return;
  // Unbreaking enchantment:
  const itemEnchantable = selectedItem.getComponent("minecraft:enchantable");
  const unbreakingLevel = itemEnchantable?.getEnchantment("unbreaking")?.level;
  const damageChance = itemDurability.getDamageChance(unbreakingLevel) / 100;
  if (Math.random() > damageChance) return;
  // Apply damage amount:
  if (OnHit === true && item.hasTag("ntk:is_need_durability_fixer")) {
    itemDurability.damage -= amount;
  }
  else {
    itemDurability.damage += amount;
  }
  // Break & update item:
  if (itemDurability.damage >= itemDurability.maxDurability) {
    selectedSlot.setItem(undefined);
    entity.playSound("random.break", { pitch: 0.9, location: entity.location, volume: 1.0 });
  }
  else {
    selectedSlot.setItem(selectedItem);
  }
}
/*Imported by:
- "block_component/crates.js"
- "block_component/door.js"
- "block_component/on_player_interact.js"
- "block_component/polyp.js"
- "item_component/add_effects_on_consume.js"
- "item_component/damageItemDurability.js"
- "item_component/extra_damage_effect_on_hit_entity.js"
- "item_component/fatal_poison_effect_on_hit_entity.js"
- "item_component/fire_aspect_effect_on_hit_entity.js"
- "item_component/inflict_effect_on_hit_entity.js"
- "item_component/knockback_effect_on_hit_entity.js"
- "item_component/levitation_effect_on_hit_entity.js"
- "item_component/magical_scourge_effect_on_hit_entity.js"
- "item_component/on_complete_use.js"
- "item_component/on_hit_entity.js"
- "item_component/on_mine_block.js"
- "item_component/on_use.js"
- "item_component/release_effect_on_use.js"
- "item_component/scatter_blink_effect_on_hit_entity.js"
- "item_component/shoot_projectile_on_use.js"
- "item_component/spawn_mob_on_use.js"
- "item_component/war_hammer_effect_on_hit_entity.js"
- "item_component/water_aspect_effect_on_hit_entity.js"
- "act/ic/identification.js"
- "cp/custom_tools_on_vanilla_blocks_cp.js"
- "cp/ic/gun.js"
- "cp/ic/identifier.js"
- "fo/all_tools_on_custom_blocks_fo.js"
- "kc/custom_tools_on_vanilla_blocks_kc.js"
- "ll/all_tools_on_custom_blocks_ll.js"
- "mb/all_tools_on_custom_blocks_mb.js"
- "nbe/all_tools_on_custom_blocks_nbe.js"
- "nce/all_tools_on_custom_blocks_nce.js"
- "nce/custom_tools_on_vanilla_blocks_nce.js"
- "nee/bc/void_block.js"
- "nie/totem_of_health_seer.js"
- "nms/wand.js"
*/

export function decreaseItemStack(entity, item, decreaseAmount, itemSlot) {
  if (!item) return;
  const entityEquippable = entity.getComponent("minecraft:equippable");
  if (!entityEquippable) return;
  if (entity.typeId === "minecraft:player" && entity.getGameMode() === GameMode.Creative) return;
  if (item.amount <= decreaseAmount) {
    entityEquippable.setEquipment(itemSlot, undefined);
  }
  else {
    const newItem = item.clone();
    newItem.amount -= decreaseAmount;
    entityEquippable.setEquipment(itemSlot, newItem);
  }
}
/*Imported by:
- "ntk_double_slabs.js"
- "ntk_rebark.js"
- "block_component/crates.js"
- "block_component/on_player_interact.js"
- "block_component/polyp.js"
- "block_component/stacking.js"
- "item_component/inflict_effect_on_hit_entity.js"
- "item_component/on_complete_use.js"
- "item_component/on_use.js"
- "item_component/potted_on_use_on.js"
- "cp/ic/supply_capsule_card.js"
- "ll/copper_waxing_ll.js"
- "mb/plant_fertilization_mb.js"
- "nce/plant_fertilization_nce.js"
- "nee/bc/void_block.js"
- "nie/bc/evaporator.js"
- "nms/wand.js"
*/

export function decreaseItemStackInventory(entity, item, decreaseAmount, itemSlot) {
  if (!item) return;
  const entityInventory = entity.getComponent("inventory");
  if (!entityInventory) return;
  const entityContainer = entityInventory.container;
  if (entity.typeId === "minecraft:player" && entity.getGameMode() === GameMode.Creative) return;
  if (item.amount <= decreaseAmount) {
    entityContainer.setItem(itemSlot, undefined);
  }
  else {
    const newItem = item.clone();
    newItem.amount -= decreaseAmount;
    entityContainer.setItem(itemSlot, newItem);
  }
}
/*Imported by:
- "nms/wand.js"
*/

export function detectNearbyEntities(origin, dimension, radius) {
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const areaLocation = {
          x: origin.location.x + dx,
          y: origin.location.y + dy,
          z: origin.location.z + dz
        };
        const nearEntities = world.getDimension(dimension).getEntities(areaLocation);
        if (nearEntities !== undefined && nearEntities.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
}
/*Imported by:
- "item_component/on_complete_use.js"
- "item_component/on_use.js"
- "item_component/release_effect_on_use.js"
- "nee/bc/void_block.js"
*/

export function dropsOnFortuneChance(entity, block, item, dropItemType, baseChance, countMin, countMax, levelIChance, levelIIChance, levelIIIChance, dropXP, xpAmount) {
  if (!entity || entity.getGameMode() === GameMode.Creative) return;
  const dropLocation = {
    x: block.location.x + 0.5,
    y: block.location.y + 0.5,
    z: block.location.z + 0.5,
  };
  let baseCount = Math.floor(Math.random() * (countMax - countMin + 1)) + countMin;
  let fortuneChance = 0.0;
  if (item !== undefined) {
    const itemEnchantable = item.getComponent("enchantable");
    if (itemEnchantable) {
      const silkTouch = itemEnchantable.getEnchantment("silk_touch");
      if (silkTouch) return;
      const fortune = itemEnchantable.getEnchantment("fortune");
      if (fortune) {
        switch (fortune.level) {
          case 1: fortuneChance = levelIChance; break;
          case 2: fortuneChance = levelIIChance; break;
          case 3: fortuneChance = levelIIIChance; break;
          default: fortuneChance = 0.0; break;
        }
      }
    }
  }
  // Calculate total drop chance:
  const totalChance = baseChance + fortuneChance;
  const decimalChance = totalChance / 100;
  const addedCount = Math.trunc(decimalChance);
  const totalCount = (addedCount + (Math.random() <= decimalChance - addedCount ? 1 : 0)) * 1;
  const finalCount = totalCount >= 1 ? totalCount + (baseCount - 1) : 0;
  if (finalCount > 0) {
    const droppedItem = new ItemStack(dropItemType, finalCount);
    block.dimension.spawnItem(droppedItem, dropLocation);
    if (dropXP === true) {
      for (let i = 0; i < xpAmount; i++) {
        block.dimension.spawnEntity("minecraft:xp_orb", dropLocation);
      }
    }
  }
}
/*Imported by:
- "block_component/fossiliferous.js"
- "block_component/leaves.js"
- "block_component/ores.js"
- "block_component/plants.js"
*/

export function enhancerItem(source, enhancerItem, enhancerSlot, enhanceChance, enhanceValue, damageEnhancerDurability, enhancerDurabilityDamage) {
  const sourceEquippable = source.getComponent("equippable");
  let enhanceBaseValue = 0;
  let enhanceAmount = 0;
  if (sourceEquippable) {
    const enhancerItemSlot = sourceEquippable.getEquipmentSlot(enhancerSlot);
    const enhancerItemStack = enhancerItemSlot.getItem();
    if (enhancerItemStack === undefined || !enhancerItemStack.hasTag(enhancerItem)) {
      enhanceBaseValue = 0;
      enhanceAmount = 0;
      return enhanceAmount;
    }
    else if (enhancerItemStack.hasTag(enhancerItem)) {
      if (Math.random() * 100 <= enhanceChance) {
        enhanceAmount = enhanceBaseValue + enhanceValue;
        if (damageEnhancerDurability === true) {
          damageItemDurability(source, enhancerItemStack, enhancerDurabilityDamage, enhancerSlot, false);
        }
        return enhanceAmount;
      }
      else return enhanceAmount;
    }
  }
  else return enhanceAmount;
}
/*Imported by:
- "ntk_projectile_effects.js"
*/

export function findInventoryItem(entity, itemType) {
  const entityInventory = entity.getComponent("inventory");
  if (!entityInventory?.container) {
    return undefined;
  }
  const entityContainer = entityInventory.container;
  for (let slot = 0; slot < entityContainer.size; slot++) {
    const itemStack = entityContainer.getItem(slot);
    if (itemStack) {
      if (itemStack?.hasTag(itemType)) {
        return {
          slot, itemStack
        };
      }
    }
    else {
      const itemStack = entity.getComponent("equippable").getEquipmentSlot("Offhand").getItem();
      const slot = "Offhand"
      if (itemStack?.hasTag(itemType)) {
        return {
          slot, itemStack
        };
      }
    }
  }
  return undefined;
}
/*Imported by:
- "nms/wand.js"
*/

export function increaseItemStack(entity, item, maxStack, increaseAmount, itemSlot) {
  if (!item) return;
  const entityEquippable = entity.getComponent("minecraft:equippable");
  if (!entityEquippable) return;
  if (entity.typeId === "minecraft:player" && entity.getGameMode() === GameMode.Creative) return;
  if (item.amount >= maxStack) {
    const newItem = new ItemStack (item, increaseAmount);
    source.dimension.spawnItem(newItem, { x: source.location.x + 0.5, y: source.location.y + 1.0, z: source.location.z + 0.5 });
  }
  else {
    const newItem = item.clone();
    newItem.amount += increaseAmount;
    entityEquippable.setEquipment(itemSlot, newItem);
  }
}

export function randomEvent(eventPool) {
  const totalWeight = eventPool.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of eventPool) {
    random -= item.weight;
    if (random < 0) {
      return item;
    }
  }
  return eventPool[eventPool.length - 1];
};
/*Imported by:
- "cp/blinker_bullet.js"
- "nms/flourishing_magic_spell.js"
*/

export function randomTeleport(entity, dimension, range) {
  function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const mobLocation = entity.location;
  let teleportation = false;
  let minRangeX = mobLocation.x - range;
  let maxRangeX = mobLocation.x + range;
  let minRangeY = Math.max(mobLocation.y - range, -62);
  let maxRangeY = Math.min(mobLocation.y + range, 319);
  let minRangeZ = mobLocation.z - range;
  let maxRangeZ = mobLocation.z + range;
  let validBlock = null;
  const attempts = (range * range * range);
  const isSafeAirOrWater = (block) => {
    return block.isAir || ["minecraft:water", "minecraft:flowing_water"].includes(block.typeId);
  };
  const isSolidGround = (block) => {
    return (
      !block.isAir &&
      !["minecraft:water", "minecraft:flowing_water", "minecraft:lava", "minecraft:flowing_lava"].includes(block.typeId)
    );
  };
  const teleportWithEffects = (entity, location) => {
    entity.teleport(location);
    entity.dimension.playSound("mob.endermen.portal", location, { pitch: 1.0, volume: 1.0 });
    entity.dimension.spawnParticle("ntk:teleportation_magic_particle", location);
  };
  for (let i = 0; i < attempts; i++) {
    let randomX = randomRange(minRangeX, maxRangeX);
    let randomY = randomRange(minRangeY, maxRangeY);
    let randomZ = randomRange(minRangeZ, maxRangeZ);
    let block = entity.dimension.getBlock({ x: randomX, y: randomY, z: randomZ });
    let blockBelow = block?.below();
    if (block && blockBelow && isSafeAirOrWater(block) && isSolidGround(blockBelow)) {
      validBlock = block;
      break;
    }
  }
  if (validBlock) {
    teleportWithEffects(entity, validBlock.bottomCenter());
    return;
  }
  let loopCondition = system.runInterval(() => {
    let startBlock = entity.dimension.getBlock({ x: mobLocation.x, y: mobLocation.y, z: mobLocation.z });
    if (startBlock) {
      let queue = [startBlock];
      let visited = new Set();
      visited.add(`${startBlock.x},${startBlock.y},${startBlock.z}`);
      while (queue.length > 0) {
        let currentBlock = queue.shift();
        let belowBlock = currentBlock.below();
        if (
          (currentBlock.isAir || ["minecraft:water", "minecraft:flowing_water"].includes(currentBlock.typeId)) &&
          currentBlock.y > -64 &&
          belowBlock &&
          isSolidGround(belowBlock)
        ) {
          teleportWithEffects(entity, currentBlock.bottomCenter());
          system.clearRun(loopCondition);
          return;
        }
        let neighbors = [currentBlock.above(), currentBlock.below()];
        for (let next of neighbors) {
          if (!next) continue;
          let key = `${next.x},${next.y},${next.z}`;
          if (!visited.has(key) && next.y > -64) {
            visited.add(key);
            queue.push(next);
          }
        }
      }
    }
    system.clearRun(loopCondition);
  }, 1);
}
/*Imported by:
- "ntk_projectile_effects.js"
- "item_component/scatter_blink_effect_on_hit_entity.js"
- "nee/bc/void_block.js"
*/

export function removeAttachedFoliage(item, block, foliageItem, amount) {
  const spawnNewItem = new ItemStack (foliageItem, amount);
  let randomChance = Math.random();
  if (item.getComponent("enchantable").hasEnchantment("silk_touch")) {
    block.dimension.spawnItem(spawnNewItem, { x: block.location.x + 0.5, y: block.location.y + 1.0, z: block.location.z + 0.5 });
  }
  else if (item.getComponent("enchantable").hasEnchantment("fortune")) {
    if (item.getComponent("enchantable").getEnchantment("fortune").level == 1) {
      if (randomChance <= 0.5) {
        block.dimension.spawnItem(spawnNewItem, { x: block.location.x + 0.5, y: block.location.y + 1.0, z: block.location.z + 0.5 });
      }
    }
    if (item.getComponent("enchantable").getEnchantment("fortune").level == 2) {
      if (randomChance <= 0.75) {
        block.dimension.spawnItem(spawnNewItem, { x: block.location.x + 0.5, y: block.location.y + 1.0, z: block.location.z + 0.5 });
      }
    }
    if (item.getComponent("enchantable").getEnchantment("fortune").level == 3) {
      if (randomChance <= 1.0) {
        block.dimension.spawnItem(spawnNewItem, { x: block.location.x + 0.5, y: block.location.y + 1.0, z: block.location.z + 0.5 });
      }
    }
  }
  else {
    if (randomChance <= 0.25) {
      block.dimension.spawnItem(spawnNewItem, { x: block.location.x + 0.5, y: block.location.y + 1.0, z: block.location.z + 0.5 });
    }
    else return;
  }
}
/*Imported by:
- "fo/all_tools_on_custom_blocks_fo.js"
- "mb/all_tools_on_custom_blocks_mb.js"
- "nbe/all_tools_on_custom_blocks_nbe.js"
*/

export function shootProjectile(projectileName, entity, soundEffect, soundPitch, soundVolume ) {
  let projectileEntity = entity.dimension.spawnEntity(projectileName, { x: entity.location.x + (entity.getViewDirection().x), y: entity.location.y + 1.5 + (entity.getViewDirection().y), z: entity.location.z + (entity.getViewDirection().z)});
  let projectileComponent = projectileEntity.getComponent("minecraft:projectile");
  let velocity = { x: entity.getViewDirection().x, y: entity.getViewDirection().y, z: entity.getViewDirection().z };
  projectileComponent.owner = entity;
  projectileComponent.shoot(velocity);
  entity.dimension.playSound(soundEffect, entity.location, { pitch: soundPitch ?? 1.0, volume: soundVolume ?? 1.0 });
  entity.playAnimation("animation.player.first_person.attack_rotation_item");
}
/*Imported by:
- "item_component/on_complete_use.js"
- "item_component/on_use.js"
- "item_component/shoot_projectile_on_use.js"
- "cp/ic/gun.js"
- "nms/unknown_scroll_spells.js"
*/

export function spawnItemStack(source, item, countMin, countMax) {
  const count = Math.floor(Math.random() * (countMax - countMin + 1)) + countMin;
  const newItem = new ItemStack (item, count);
  source.dimension.spawnItem(newItem, { x: source.location.x + 0.5, y: source.location.y + 1.0, z: source.location.z + 0.5 });
}
/*Imported by:
- "block_component/leaves.js"
- "block_component/on_player_interact.js"
- "block_component/on_random_tick.js"
- "block_component/on_tick.js"
- "block_component/plants.js"
- "block_component/polyp.js"
- "block_component/stacking.js"
- "item_component/on_complete_use.js"
- "item_component/on_use.js"
- "nce/all_tools_on_custom_blocks_nce.js"
- "nce/bc/active_heated_netherrack.js"
- "nie/bc/evaporator.js"
*/

export function woodStrippedSound(block) {
  if (block.permutation.matches("minecraft:oak_log") || block.permutation.matches("minecraft:stripped_oak_log")) {
    block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:oak_wood") || block.permutation.matches("minecraft:stripped_oak_wood")) {
    block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:spruce_log") || block.permutation.matches("minecraft:stripped_spruce_log")) {
    block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:spruce_wood") || block.permutation.matches("minecraft:stripped_spruce_wood")) {
    block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:birch_log") || block.permutation.matches("minecraft:stripped_birch_log")) {
    block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:birch_wood") || block.permutation.matches("minecraft:stripped_birch_wood")) {
    block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:jungle_log") || block.permutation.matches("minecraft:stripped_jungle_log")) {
    block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:jungle_wood") || block.permutation.matches("minecraft:stripped_jungle_wood")) {
    block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:acacia_log") || block.permutation.matches("minecraft:stripped_acacia_log")) {
    block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:acacia_wood") || block.permutation.matches("minecraft:stripped_acacia_wood")) {
    block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:dark_oak_log") || block.permutation.matches("minecraft:stripped_dark_oak_log")) {
    block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:dark_oak_wood") || block.permutation.matches("minecraft:stripped_dark_oak_wood")) {
    block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:mangrove_log") || block.permutation.matches("minecraft:stripped_mangrove_log")) {
    block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:mangrove_wood") || block.permutation.matches("minecraft:stripped_mangrove_wood")) {
    block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:cherry_log") || block.permutation.matches("minecraft:stripped_cherry_log")) {
    block.dimension.playSound("step.cherry_wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:cherry_wood") || block.permutation.matches("minecraft:stripped_cherry_wood")) {
    block.dimension.playSound("step.cherry_wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:crimson_stem") || block.permutation.matches("minecraft:stripped_crimson_stem")) {
    block.dimension.playSound("use.stem", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:crimson_hyphae") || block.permutation.matches("minecraft:stripped_crimson_hyphae")) {
    block.dimension.playSound("use.stem", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:warped_stem") || block.permutation.matches("minecraft:stripped_warped_stem")) {
    block.dimension.playSound("use.stem", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:warped_hyphae") || block.permutation.matches("minecraft:stripped_warped_hyphae")) {
    block.dimension.playSound("use.stem", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:bamboo_block") || block.permutation.matches("minecraft:stripped_bamboo_block")) {
    block.dimension.playSound("step.bamboo_wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:pale_oak_log") || block.permutation.matches("minecraft:stripped_pale_oak_log")) {
    block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
  if (block.permutation.matches("minecraft:pale_oak_wood") || block.permutation.matches("minecraft:stripped_pale_oak_wood")) {
    block.dimension.playSound("use.wood", block.location, { pitch: 0.8, volume: 1.0 });
  }
}
/*Imported by:
- "cp/custom_tools_on_vanilla_blocks_cp.js"
- "kc/custom_tools_on_vanilla_blocks_kc.js"
- "nce/custom_tools_on_vanilla_blocks_nce.js"
*/
