import { system, BlockPermutation, GameMode } from "@minecraft/server";
import { dropsOnFortuneChance, spawnItemStack } from "../ntk_functions.js";

const BlockLeavesOnPlayerBreakComponent = {
  onPlayerBreak({ player, block, brokenBlockPermutation, dimension }, { params }) {
    const source = player;
    if (source.getGameMode() === GameMode.Creative) return;
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const blockName = child.block_name;
      const blockState = child.block_state;
      const stateValue = child.state_value;
      
      const itemObtainTool = child.item_obtain_tool ?? "mincraft:shears";
      const itemSlot = child.item_slot ?? "Mainhand";
      const obtainDrop = child.obtain_drop ?? blockName;
      const obtainDropChance = child.obtain_drop_chance ?? 0.0;
      const obtainDropCount = child.obtain_drop_count ?? 1;
      
      const stickDrop = child.stick_drop;
      const stickDropChance = child.stick_drop_chance ?? 2.0;
      const stickDropCountMin = child.stick_drop_count_min ?? 1;
      const stickDropCountMax = child.stick_drop_count_max ?? 1;
      const stickDropFortuneIChance = child.stick_drop_fortune_i_chance ?? 0.22;
      const stickDropFortuneIIChance = child.stick_drop_fortune_ii_chance ?? 0.5;
      const stickDropFortuneIIIChance = child.stick_drop_fortune_iii_chance ?? 1.33;
      
      const saplingDrop = child.sapling_drop;
      const saplingDropChance = child.sapling_drop_chance ?? 5.0;
      const saplingDropCountMin = child.sapling_drop_count_min ?? 1;
      const saplingDropCountMax = child.sapling_drop_count_max ?? 1;
      const saplingDropFortuneIChance = child.sapling_drop_fortune_i_chance ?? 1.25;
      const saplingDropFortuneIIChance = child.sapling_drop_fortune_ii_chance ?? 3.33;
      const saplingDropFortuneIIIChance = child.sapling_drop_fortune_iii_chance ?? 5.0;
      
      const fruitDrop = child.fruit_drop;
      const fruitDropChance = child.fruit_drop_chance ?? 1.0;  // Must at least have "1.0" to full have a drops.
      const fruitDropCountMin = child.fruit_drop_count_min ?? 1;
      const fruitDropCountMax = child.fruit_drop_count_max ?? 1;
      const fruitDropFortuneIChance = child.fruit_drop_fortune_i_chance ?? 0.056;
      const fruitDropFortuneIIChance = child.fruit_drop_fortune_ii_chance ?? 0.125;
      const fruitDropFortuneIIIChance = child.fruit_drop_fortune_iii_chance ?? 0.333;
      
      const particleEffect = child.particle_effect ?? false;
      const particleOffsetX = child.particle_offset_x ?? 0.0;
      const particleOffsetY = child.particle_offset_y ?? 0.0;
      const particleOffsetZ = child.particle_offset_z ?? 0.0;
      const soundEffect = child.sound_effect ?? false;
      const soundPitchMin = child.sound_pitch_min ?? 1.0;
      const soundPitchMax = child.sound_pitch_max ?? 1.0;
      const soundVolume = child.sound_volume ?? 1.0;
      
      if (Math.random() * 100 <= eventChance) {
        const sourceEquippable = source.getComponent("minecraft:equippable");
        if (!sourceEquippable) return;
        const selectedSlot = sourceEquippable.getEquipmentSlot(itemSlot);
        const itemStack = selectedSlot.getItem();
        const soundPitch = Math.random() * (soundPitchMax - soundPitchMin) + soundPitchMin;
        
        if (brokenBlockPermutation.matches(blockName, blockState ? { [blockState]: stateValue } : {})) {
          // Leaves drop item on break:
          if (selectedSlot === undefined || !selectedSlot.hasItem()) {
            if (stickDrop) {
              dropsOnFortuneChance(source, block, undefined, stickDrop, stickDropChance, stickDropCountMin, stickDropCountMax, stickDropFortuneIChance, stickDropFortuneIIChance, stickDropFortuneIIIChance, false, 0);
            }
            if (saplingDrop) {
              dropsOnFortuneChance(source, block, undefined, saplingDrop, saplingDropChance, saplingDropCountMin, saplingDropCountMax, saplingDropFortuneIChance, saplingDropFortuneIIChance, saplingDropFortuneIIIChance, false, 0);
            }
            if (fruitDrop) {
              dropsOnFortuneChance(source, block, undefined, fruitDrop, fruitDropFortuneIChance, fruitDropCountMin, fruitDropCountMax, fruitDropFortuneIIChance, fruitDropFortuneIIIChance, false, 0);
            }
          }
          else if (itemObtainTool) {
            if (itemStack.typeId === itemObtainTool || itemStack.hasTag(itemObtainTool)) {
              if (itemStack.getComponent("enchantable").getEnchantment("silk_touch")) return;
              if (Math.random() * 100 <= obtainDropChance) {
                spawnItemStack(block, obtainDrop, obtainDropCount, obtainDropCount);
              }
            }
            else {
              if (stickDrop) {
                dropsOnFortuneChance(source, block, itemStack, stickDrop, stickDropChance, stickDropCountMin, stickDropCountMax, stickDropFortuneIChance, stickDropFortuneIIChance, stickDropFortuneIIIChance, false, 0);
              }
              if (saplingDrop) {
                dropsOnFortuneChance(source, block, itemStack, saplingDrop, saplingDropChance, saplingDropCountMin, saplingDropCountMax, saplingDropFortuneIChance, saplingDropFortuneIIChance, saplingDropFortuneIIIChance, false, 0);
              }
              if (fruitDrop) {
                dropsOnFortuneChance(source, block, itemStack, fruitDrop, fruitDropFortuneIChance, fruitDropCountMin, fruitDropCountMax, fruitDropFortuneIIChance, fruitDropFortuneIIIChance, false, 0);
              }
            }
          }
          else {
            if (stickDrop) {
              dropsOnFortuneChance(source, block, itemStack, stickDrop, stickDropChance, stickDropCountMin, stickDropCountMax, stickDropFortuneIChance, stickDropFortuneIIChance, stickDropFortuneIIIChance, false, 0);
            }
            if (saplingDrop) {
              dropsOnFortuneChance(source, block, itemStack, saplingDrop, saplingDropChance, saplingDropCountMin, saplingDropCountMax, saplingDropFortuneIChance, saplingDropFortuneIIChance, saplingDropFortuneIIIChance, false, 0);
            }
            if (fruitDrop) {
              dropsOnFortuneChance(source, block, itemStack, fruitDrop, fruitDropFortuneIChance, fruitDropCountMin, fruitDropCountMax, fruitDropFortuneIIChance, fruitDropFortuneIIIChance, false, 0);
            }
          }
          // Block particle effect:
          if (particleEffect !== false) {
            block.dimension.spawnParticle(particleEffect, { x: block.location.x + particleOffsetX, y: block.location.y + particleOffsetY, z: block.location.z + particleOffsetZ });
          }
          // Block sound effect:
          if (soundEffect !== false) {
            block.dimension.playSound(soundEffect, block.location, { pitch: soundPitch, volume: soundVolume });
          }
          return;
        }
      }
    }
  },
};
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent(
    "ntk:leaves_on_player_break", BlockLeavesOnPlayerBreakComponent
  );
});
/* Used in:
MB:
- Corrupted Leaves
- Mossy Willow Leaves
- Overgrown Jungle Leaves
*/ 