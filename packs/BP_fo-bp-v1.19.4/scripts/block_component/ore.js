import { system, BlockPermutation, ItemStack, GameMode } from "@minecraft/server";
import { dropsOnFortuneChance } from "../ntk_functions.js";

const BlockOreOnPlayerBreakComponent = {
  onPlayerBreak({ player, block, brokenBlockPermutation, dimension }, { params }) {
    const source = player;
    if (source.getGameMode() === GameMode.Creative) return;
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const blockName = child.block_name;
      const blockState = child.block_state;
      const stateValue = child.state_value;
      
      const itemToolType = child.item_tool_type;
      const itemSlot = child.item_slot ?? "Mainhand";
      
      const oreDrop = child.ore_drop;
      const oreDropChance = child.ore_drop_chance ?? 100.0;
      const oreDropCountMin = child.ore_drop_count_min ?? 1;
      const oreDropCountMax = child.ore_drop_count_max ?? 1;
      const oreDropFortuneIChance = child.ore_drop_fortune_i_chance ?? 33.5;
      const oreDropFortuneIIChance = child.ore_drop_fortune_ii_chance ?? 75.0;
      const oreDropFortuneIIIChance = child.ore_drop_fortune_iii_chance ?? 120.0;
      
      const xpDrop = child.xp_drop ?? false;
      const xpDropCountMin = child.xp_drop_count_min ?? 1;
      const xpDropCountMax = child.xp_drop_count_max ?? 1;
      
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
          // Ores drop item on break:
          const xpDropCount = Math.floor(Math.random() * (xpDropCountMax - xpDropCountMin + 1)) + xpDropCountMin;
          if (selectedSlot === undefined || !selectedSlot.hasItem()) return;
          if (itemToolType) {
            if (itemStack.typeId === itemToolType || itemStack.hasTag(itemToolType)) {
              if (oreDrop) {
                dropsOnFortuneChance(source, block, itemStack, oreDrop, oreDropChance, oreDropCountMin, oreDropCountMax, oreDropFortuneIChance, oreDropFortuneIIChance, oreDropFortuneIIIChance, xpDrop, xpDropCount);
              }
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
    "ntk:ore_on_player_break", BlockOreOnPlayerBreakComponent
  );
});
/* Used in:
CP:
- Aluminum Ore
- Deepslate Aluminum Ore
- Deepslate Quartz Ore
- Deepslate Silicon Ore
- Deepslate Titanium Ore
- Silicon Ore
- Stone Quartz Ore
- Titanium Ore
NCE:
- Deepslate Prismarine Ore
- Deepslate Tin Ore
- Deepslate Zinc Ore
- Heated Netherrack Olivine Ore
- Netherrack Diamond Ore
- Netherrack Olivine Ore
- Prismarine Ore
- Soul Sand Echo Shard Ore
- Tin Ore
- Zinc Ore
*/