import { system, BlockPermutation, GameMode } from "@minecraft/server";
import { dropsOnFortuneChance, spawnItemStack } from "../ntk_functions.js";

const BlockPlantOnPlayerBreakComponent = {
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
      
      const seedsDrop = child.seeds_drop;
      const seedsDropChance = child.seeds_drop_chance ?? 1.6;
      const seedsDropCountMin = child.seeds_drop_count_min ?? 1;
      const seedsDropCountMax = child.seeds_drop_count_max ?? 1;
      const seedsDropFortuneIChance = child.seeds_drop_fortune_i_chance ?? 0.53;
      const seedsDropFortuneIIChance = child.seeds_drop_fortune_ii_chance ?? 1.07;
      const seedsDropFortuneIIIChance = child.seeds_drop_fortune_iii_chance ?? 1.6; 
      
      const cropsDrop = child.crops_drop;
      const cropsDropChance = child.crops_drop_chance ?? 2.6;
      const cropsDropCountMin = child.crops_drop_count_min ?? 1;
      const cropsDropCountMax = child.crops_drop_count_max ?? 1;
      const cropsDropFortuneIChance = child.crops_drop_fortune_i_chance ?? 1.03;
      const cropsDropFortuneIIChance = child.crops_drop_fortune_ii_chance ?? 2.07;
      const cropsDropFortuneIIIChance = child.crops_drop_fortune_iii_chance ?? 3.1;
      
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
          // Plants drop item on break:
          if (selectedSlot === undefined || !selectedSlot.hasItem()) {
            if (seedsDrop) {
              dropsOnFortuneChance(source, block, undefined, seedsDrop, seedsDropChance, seedsDropCountMin, seedsDropCountMax, seedsDropFortuneIChance, seedsDropFortuneIIChance, seedsDropFortuneIIIChance, false, 0);
            }
            if (cropsDrop) {
              dropsOnFortuneChance(source, block, undefined, cropsDrop, cropsDropChance, cropsDropCountMin, cropsDropCountMax, cropsDropFortuneIChance, cropsDropFortuneIIChance, cropsDropFortuneIIIChance, false, 0);
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
              if (seedsDrop) {
                dropsOnFortuneChance(source, block, itemStack, seedsDrop, seedsDropChance, seedsDropCountMin, seedsDropCountMax, seedsDropFortuneIChance, seedsDropFortuneIIChance, seedsDropFortuneIIIChance, false, 0);
              }
              if (cropsDrop) {
                dropsOnFortuneChance(source, block, itemStack, cropsDrop, cropsDropChance, cropsDropCountMin, cropsDropCountMax, cropsDropFortuneIChance, cropsDropFortuneIIChance, cropsDropFortuneIIIChance, false, 0);
              }
            }
          }
          else {
            if (seedsDrop) {
              dropsOnFortuneChance(source, block, itemStack, seedsDrop, seedsDropChance, seedsDropCountMin, seedsDropCountMax, seedsDropFortuneIChance, seedsDropFortuneIIChance, seedsDropFortuneIIIChance, false, 0);
            }
            if (cropsDrop) {
              dropsOnFortuneChance(source, block, itemStack, cropsDrop, cropsDropChance, cropsDropCountMin, cropsDropCountMax, cropsDropFortuneIChance, cropsDropFortuneIIChance, cropsDropFortuneIIIChance, false, 0);
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
    "ntk:plant_on_player_break", BlockPlantOnPlayerBreakComponent
  );
});
/* Used in:
FO:
- Short Lush Bush
- Tall Lush Bush
MB:
- Corrupted Grass
- Short Moss Sprouts
- Tall Moss Sprouts
NBE:
- Tip Grasses
NCE:
- Short Glowcelium Sprouts
- Short Mycelium Sprouts
- Tall Glowcelium Sprouts
- Tall Mycelium Sprouts
NEE:
- Bryum Fronds
- Flowered Bryum Fronds
- Short Bryum Sprouts
- Short Chorus Sprouts
- Short End Stone Grass
- Tall Bryum Sprouts
- Tall Chorus Sprouts
- Tall End Stone Grass
*/ 