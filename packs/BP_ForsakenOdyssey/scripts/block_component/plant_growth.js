import { system, BlockPermutation } from "@minecraft/server";

const BlockPlantGrowthOnRandomTickComponent = {
  onRandomTick({ block }, { params }) {
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const blockName = child.block_name;
      const blockState = child.block_state;
      const stateValue = child.state_value;
      
      const soilBlock = child.soil_block;
      const soilAdditionalSpeed = child.soil_additional_speed ?? 65;
      const growthSpeed = child.growth_speed ?? 10;
      const growthBlock = child.growth_block;
      const growthBlockState = child.growth_block_state;
      const growthStateValue = child.growth_state_value;
      
      const particleEffect = child.particle_effect ?? false;
      const particleOffsetX = child.particle_offset_x ?? 0.0;
      const particleOffsetY = child.particle_offset_y ?? 0.0;
      const particleOffsetZ = child.particle_offset_z ?? 0.0;
      const soundEffect = child.sound_effect ?? false;
      const soundPitchMin = child.sound_pitch_min ?? 1.0;
      const soundPitchMax = child.sound_pitch_max ?? 1.0;
      const soundVolume = child.sound_volume ?? 1.0;
      
      if (Math.random() * 100 <= eventChance) {
        const soundPitch = Math.random() * (soundPitchMax - soundPitchMin) + soundPitchMin;
        
        if (block.permutation.matches(blockName, { [blockState]: stateValue })) {
          // Plant grow:
          const blockBelow = block.below(1);
          let randomChance = Math.floor(Math.random() * 100);
          let effects = false;
          if (soilBlock) {
            if (blockBelow.typeId === soilBlock) {
              if (randomChance <= growthSpeed + soilAdditionalSpeed) {
                block.setPermutation(BlockPermutation.resolve(growthBlock, { [growthBlockState]: growthStateValue }));
                effects = true;
              }
            }
            else {
              if (randomChance <= growthSpeed) {
                block.setPermutation(BlockPermutation.resolve(growthBlock, { [growthBlockState]: growthStateValue }));
                effects = true;
              }
            }
          }
          else {
            if (randomChance <= growthSpeed) {
              block.setPermutation(BlockPermutation.resolve(growthBlock, { [growthBlockState]: growthStateValue }));
              effects = true;
            }
          }
          // Particle & sound effects:
          if (effects === true) {
            // Block particle effect:
            if (particleEffect !== false) {
              block.dimension.spawnParticle(particleEffect, { x: block.location.x + particleOffsetX, y: block.location.y + particleOffsetY, z: block.location.z + particleOffsetZ });
            }
            // Block sound effect:
            if (soundEffect !== false) {
              block.dimension.playSound(soundEffect, block.location, { pitch: soundPitch, volume: soundVolume });
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
    "ntk:plant_growth_on_random_tick", BlockPlantGrowthOnRandomTickComponent
  );
});
/* Used in:
NCE:
- Moss Berry Bush
*/