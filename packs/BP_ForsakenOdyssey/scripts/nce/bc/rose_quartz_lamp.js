import { system, BlockPermutation } from "@minecraft/server";

const BlockRoseQuartzLampOnPlayerInteractComponent = {
  onPlayerInteract({ player, block, dimension, face, faceLocation }, { params }) {
    const source = player
    if (source.isSneaking) return;
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const blockName = child.block_name;
      const blockState = child.block_state;
      const stateValue = child.state_value;
      
      const failOnSneaking = child.fail_on_sneaking ?? false;
      
      const changeBlock = child.change_block ?? false;
      const changeBlockChance = child.change_block_chance ?? 100.0;
      const changeBlockState = child.change_block_state ?? false;
      const changeStateValue = child.change_state_value;
      const copyAllBlockState = child.copy_all_block_state ?? false;
      const copyCardinalState = child.copy_cardinal_state ?? false;
      const noBlockState = child.no_block_state ?? false;
      
      const particleEffect = child.particle_effect ?? false;
      const particleOffsetX = child.particle_offset_x ?? 0.0;
      const particleOffsetY = child.particle_offset_y ?? 0.0;
      const particleOffsetZ = child.particle_offset_z ?? 0.0;
      const soundEffect = child.sound_effect ?? false;
      const soundPitchMin = child.sound_pitch_min ?? 1.0;
      const soundPitchMax = child.sound_pitch_max ?? 1.0;
      const soundVolume = child.sound_volume ?? 1.0;
      
      if (failOnSneaking === true) {
        if (source.isSneaking) return;
      }
      if (Math.random() * 100 <= eventChance) {
        const blockAllState = block.permutation?.getAllStates();
        const blockCardinalState = block.permutation?.getState("minecraft:cardinal_direction");
        const soundPitch = Math.random() * (soundPitchMax - soundPitchMin) + soundPitchMin;
        
        if (block.permutation.matches(blockName, blockState ? { [blockState]: stateValue } : {})) {
          // Change block:
          if (changeBlock !== false) {
            if (Math.random() * 100 <= changeBlockChance) {
              if (changeBlockState !== false) {
                block.setPermutation(BlockPermutation.resolve(changeBlock, { [changeBlockState]: changeStateValue }));
              }
              if (copyAllBlockState !== false) {
                block.setPermutation(BlockPermutation.resolve(changeBlock, blockAllState));
              }
              if (copyCardinalState !== false) {
                block.setPermutation(BlockPermutation.resolve(changeBlock, { [changeBlockState]: changeStateValue, "minecraft:cardinal_direction": blockCardinalState }));
              }
              if (noBlockState !== false) {
                block.setPermutation(BlockPermutation.resolve(changeBlock));
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
          return; // Stop checking other params once one condition matched.
        }
      }
    }
  },
};
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent(
    "ntk:rose_quartz_lamp_on_player_interact", BlockRoseQuartzLampOnPlayerInteractComponent
  );
});
/* Used in:
NCE:
- Rose Quartz Lamp
*/