import { system, BlockPermutation } from "@minecraft/server";
import { potableItems } from "../ntk_listing.js";

const BlockPottedPlantOnPlayerInteractComponent = {
  onPlayerInteract({ player, block, dimension, face, faceLocation }, { params }) {
    const source = player;
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const blockName = child.block_name;
      const blockState = child.block_state;
      const stateValue = child.state_value;
      
      const itemSlot = child.item_slot ?? "Mainhand";
      const removedPottedPlant = child.removed_potted_plant ?? false;
      const plantCount = child.plant_count ?? 1;
      const potType = child.pot_type ?? "minecraft:flower_pot";
      
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
        
        if (block.permutation.matches(blockName, blockState ? { [blockState]: stateValue } : {})) {
          if (itemStack === undefined || !potableItems.includes(itemStack.typeId) && !itemStack.hasTag("ntk:potable")) {
            // Remove potted plant:
            if (removedPottedPlant !== false) {
              source.runCommand(`gamerule sendcommandfeedback false`);
              source.runCommand(`give @s ${removedPottedPlant} ${plantCount}`);
              source.runCommand(`gamerule sendcommandfeedback true`);
            }
            // Change potted plant:
            if (potType !== false) {
              block.setPermutation(BlockPermutation.resolve(potType));
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
    }
  },
};
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent(
    "ntk:potted_plant_on_player_interact", BlockPottedPlantOnPlayerInteractComponent
  );
});
/* Used in:
FO:
- Potted Lush Bush
MB:
- Potted Blooming Corrupted Oak Sapling
- Potted Corrupted Oak Sapling
- Potted Hanging Moss
- Potted Moss Sprouts
- Potted Mossy Willow Sapling
- Potted Overgrown Jungle Sapling
NBE:
- Potted Tip Grasses
NCE:
- Potted Mosshroom Fungus
- Potted Glowcelium Sprouts
- Potted Mycelium Sprouts
NEE:
- Potted Bryum Fronds
- Potted Bryum Sprouts
- Potted Chorus Sprouts
- Potted End Stone Grass
- Potted Flowered Bryum Fronds
*/ 