import { system, BlockPermutation } from "@minecraft/server";

const BlockFenceGateOnPlayerInteractComponent = {
  onPlayerInteract({ player, block, dimension, face, faceLocation }, { params }) {
    const source = player
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const blockName = child.block_name;
      const blockState = child.block_state;
      const stateValue = child.state_value;
      const failOnSneaking = child.fail_on_sneaking ?? false;
      const changeBlock = child.change_block ?? false;
      const changeBlockChance = child.change_block_chance ?? 100.0;
      const changeBlockState = child.change_block_state ?? "ntk:open_bit";
      const changeStateValue = child.change_state_value ?? false;
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
        const blockVerticalHalfState = block.permutation?.getState("minecraft:vertical_half");
        const playerX = source.location.x - (block.x + 0.5);
        const playerZ = source.location.z - (block.z + 0.5);
        const soundPitch = Math.random() * (soundPitchMax - soundPitchMin) + soundPitchMin;
        const openAway = (blockCardinalState === "north" || blockCardinalState === "east" || blockCardinalState === "south" || blockCardinalState === "west") ? playerZ < 0 : playerX < 0;
        
        if (block.permutation.matches(blockName, blockState ? { [blockState]: stateValue } : {})) {
          if (changeBlock !== false) {
            if (Math.random() * 100 <= changeBlockChance) {
              block.setPermutation(BlockPermutation.resolve(changeBlock, { [changeBlockState]: changeStateValue, "minecraft:cardinal_direction": blockCardinalState, "ntk:open_away": openAway }));
            }
          }
          if (soundEffect !== false) {
            block.dimension.playSound(soundEffect, block.location, { pitch: soundPitch, volume: soundVolume });
          }
          return;
        }
      }
    }
  },
};
const BlockFenceGateRedstoneUpdateComponent = {
  onRedstoneUpdate({ block, dimension, powerLevel }, { params }) {
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const blockName = child.block_name;
      const blockState = child.block_state;
      const stateValue = child.state_value;
      const changeBlock = child.change_block ?? false;
      const changeBlockChance = child.change_block_chance ?? 100.0;
      const changeBlockState = child.change_block_state ?? false;
      const changeStateValue = child.change_state_value ?? false;
      const soundEffect = child.sound_effect ?? false;
      const soundPitchMin = child.sound_pitch_min ?? 1.0;
      const soundPitchMax = child.sound_pitch_max ?? 1.0;
      const soundVolume = child.sound_volume ?? 1.0;
      
      if (powerLevel <= 0) return;
      if (Math.random() * 100 <= eventChance) {
        const blockAllState = block.permutation?.getAllStates();
        const blockCardinalState = block.permutation?.getState("minecraft:cardinal_direction");
        const blockVerticalHalfState = block.permutation?.getState("minecraft:vertical_half");
        const soundPitch = Math.random() * (soundPitchMax - soundPitchMin) + soundPitchMin;
        if (block.permutation.matches(blockName, blockState ? { [blockState]: stateValue } : {})) {
          if (changeBlock !== false) {
            if (Math.random() * 100 <= changeBlockChance) {
              block.setPermutation(BlockPermutation.resolve(changeBlock, { [changeBlockState]: changeStateValue, "minecraft:cardinal_direction": blockCardinalState, "ntk:powered_bit": true }));
            }
          }
          if (soundEffect !== false) {
            block.dimension.playSound(soundEffect, block.location, { pitch: soundPitch, volume: soundVolume });
          }
          return;
        }
      }
    }
  }
};
const BlockFenceGateOnTickComponent = {
  onTick({ block, dimension }, { params }) {
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const blockName = child.block_name;
      const blockState = child.block_state;
      const stateValue = child.state_value;
      const changeBlock = child.change_block ?? false;
      const changeBlockChance = child.change_block_chance ?? 100.0;
      const changeBlockState = child.change_block_state ?? false;
      const changeStateValue = child.change_state_value ?? false;
      const soundEffect = child.sound_effect ?? false;
      const soundPitchMin = child.sound_pitch_min ?? 1.0;
      const soundPitchMax = child.sound_pitch_max ?? 1.0;
      const soundVolume = child.sound_volume ?? 1.0;
      
      if (Math.random() * 100 <= eventChance) {
        const blockAllState = block.permutation?.getAllStates();
        const blockCardinalState = block.permutation?.getState("minecraft:cardinal_direction");
        const blockVerticalHalfState = block.permutation?.getState("minecraft:vertical_half");
        const openBit = block.permutation?.getState("ntk:open_bit");
        const poweredBit = block.permutation?.getState("ntk:powered_bit");
        const redstonePower = block.getRedstonePower();
        const hasRedstone = redstonePower > 0;
        const soundPitch = Math.random() * (soundPitchMax - soundPitchMin) + soundPitchMin;
        if (block.permutation.matches(blockName, blockState ? { [blockState]: stateValue } : {})) {
          if (!hasRedstone && poweredBit === true) {
            if (changeBlock !== false) {
              if (Math.random() * 100 <= changeBlockChance) {
                block.setPermutation(BlockPermutation.resolve(changeBlock, { [changeBlockState]: changeStateValue, "minecraft:cardinal_direction": blockCardinalState, "ntk:powered_bit": false }));
              }
            }
            if (soundEffect !== false) {
              block.dimension.playSound(soundEffect, block.location, { pitch: soundPitch, volume: soundVolume });
            }
            return;
          }
        }
      }
    }
  }
};

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent(
    "ntk:fence_gate_on_player_interact", BlockFenceGateOnPlayerInteractComponent
  );
  blockComponentRegistry.registerCustomComponent(
    "ntk:fence_gate_on_redstone_update", BlockFenceGateRedstoneUpdateComponent
  );
  blockComponentRegistry.registerCustomComponent(
    "ntk:fence_gate_on_tick", BlockFenceGateOnTickComponent
  );
});
/*Used in:
MB:
- Corrupted Oak Fence Gate
- Mossy Willow Fence Gate
- Overgrown Jungle Fence Gate
NCE:
- Mosshroom Fence Gate
*/