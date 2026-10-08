import { world, system, BlockPermutation } from "@minecraft/server";
import { damageItemDurability } from "../ntk_functions.js";

const vanillaDoors = [
  "minecraft:wooden_door",
  "minecraft:spruce_door",
  "minecraft:birch_door",
  "minecraft:jungle_door",
  "minecraft:acacia_door",
  "minecraft:dark_oak_door",
  "minecraft:mangrove_door",
  "minecraft:cherry_door",
  "minecraft:pale_oak_door",
  "minecraft:bamboo_door",
  "minecraft:crimson_door",
  "minecraft:warped_door",
  "minecraft:iron_door",
  "minecraft:copper_door",
  "minecraft:exposed_copper_door",
  "minecraft:weathered_copper_door",
  "minecraft:oxidized_copper_door",
  "minecraft:waxed_copper_door",
  "minecraft:waxed_exposed_copper_door",
  "minecraft:waxed_weathered_copper_door",
  "minecraft:waxed_oxidized_copper_door"
];

const BlockDoorBeforeOnPlayerPlaceComponent = {
  beforeOnPlayerPlace(event, params) {
    const { block, dimension, face, permutationToPlace, player } = event;
    event.cancel = true;
    const eventChance = params.event_chance ?? 100.0
    const blockName = params.block_name;
    if (Math.random() * 100 <= eventChance) {
      const aboveBlock = block.above();
      if (!aboveBlock.isAir && !aboveBlock.isLiquid) {
        event.cancel = true;
      }
      else {
        event.cancel = false;
      }
    }
  },
};
const BlockDoorOnPlaceComponent = {
  onPlace({ block, dimension, previousBlock }, { params }) {
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      
      const aboveBlock = block.above();
      const northBlock = block.north();
      const southBlock = block.south();
      const eastBlock = block.east();
      const westBlock = block.west();
      const cardinalDirectionState = block.permutation?.getState("minecraft:cardinal_direction");
      const doorHingeState = block.permutation?.getState("ntk:door_hinge_bit");
      const openBitState = block.permutation?.getState("ntk:open_bit");
      const powerBitState = block.permutation?.getState("ntk:powered_bit");
      
      if (Math.random() * 100 <= eventChance) {
        if (aboveBlock.isAir || aboveBlock.isLiquid) {
          if (block.permutation.matches(block.typeId, { "ntk:upper_block_bit": false })) {
            if (cardinalDirectionState === "north") {
              if (westBlock?.hasTag("ntk:door") || vanillaDoors.includes(westBlock.typeId)) {
                const changeBlockPermutation = BlockPermutation.resolve(block.typeId, {
                  "ntk:upper_block_bit": false,
                  "minecraft:cardinal_direction": cardinalDirectionState,
                  "ntk:door_hinge_bit": true,
                  "ntk:powered_bit": powerBitState
                });
                block.setPermutation(changeBlockPermutation);
                const changeAboveBlockPermutation = BlockPermutation.resolve(block.typeId, {
                  "ntk:upper_block_bit": true,
                  "minecraft:cardinal_direction": cardinalDirectionState,
                  "ntk:door_hinge_bit": true,
                  "ntk:powered_bit": powerBitState
                });
                aboveBlock.setPermutation(changeAboveBlockPermutation);
              }
              else {
                const changeAboveBlockPermutation = BlockPermutation.resolve(block.typeId, {
                  "ntk:upper_block_bit": true,
                  "minecraft:cardinal_direction": cardinalDirectionState,
                  "ntk:door_hinge_bit": doorHingeState,
                  "ntk:powered_bit": powerBitState
                });
                aboveBlock.setPermutation(changeAboveBlockPermutation);
              }
            }
            if (cardinalDirectionState === "west") {
              if (southBlock?.hasTag("ntk:door") || vanillaDoors.includes(southBlock.typeId)) {
                const changeBlockPermutation = BlockPermutation.resolve(block.typeId, {
                  "ntk:upper_block_bit": false,
                  "minecraft:cardinal_direction": cardinalDirectionState,
                  "ntk:door_hinge_bit": true,
                  "ntk:powered_bit": powerBitState
                });
                block.setPermutation(changeBlockPermutation);
                const changeAboveBlockPermutation = BlockPermutation.resolve(block.typeId, {
                  "ntk:upper_block_bit": true,
                  "minecraft:cardinal_direction": cardinalDirectionState,
                  "ntk:door_hinge_bit": true,
                  "ntk:powered_bit": powerBitState
                });
                aboveBlock.setPermutation(changeAboveBlockPermutation);
              }
              else {
                const changeAboveBlockPermutation = BlockPermutation.resolve(block.typeId, {
                  "ntk:upper_block_bit": true,
                  "minecraft:cardinal_direction": cardinalDirectionState,
                  "ntk:door_hinge_bit": doorHingeState,
                  "ntk:powered_bit": powerBitState
                });
                aboveBlock.setPermutation(changeAboveBlockPermutation);
              }
            }
            if (cardinalDirectionState === "south") {
              if (eastBlock?.hasTag("ntk:door") || vanillaDoors.includes(eastBlock.typeId)) {
                const changeBlockPermutation = BlockPermutation.resolve(block.typeId, {
                  "ntk:upper_block_bit": false,
                  "minecraft:cardinal_direction": cardinalDirectionState,
                  "ntk:door_hinge_bit": true,
                  "ntk:powered_bit": powerBitState
                });
                block.setPermutation(changeBlockPermutation);
                const changeAboveBlockPermutation = BlockPermutation.resolve(block.typeId, {
                  "ntk:upper_block_bit": true,
                  "minecraft:cardinal_direction": cardinalDirectionState,
                  "ntk:door_hinge_bit": true,
                  "ntk:powered_bit": powerBitState
                });
                aboveBlock.setPermutation(changeAboveBlockPermutation);
              }
              else {
                const changeAboveBlockPermutation = BlockPermutation.resolve(block.typeId, {
                  "ntk:upper_block_bit": true,
                  "minecraft:cardinal_direction": cardinalDirectionState,
                  "ntk:door_hinge_bit": doorHingeState,
                  "ntk:powered_bit": powerBitState
                });
                aboveBlock.setPermutation(changeAboveBlockPermutation);
              }
            }
            if (cardinalDirectionState === "east") {
              if (northBlock?.hasTag("ntk:door") || vanillaDoors.includes(northBlock.typeId)) {
                const changeBlockPermutation = BlockPermutation.resolve(block.typeId, {
                  "ntk:upper_block_bit": false,
                  "minecraft:cardinal_direction": cardinalDirectionState,
                  "ntk:door_hinge_bit": true,
                  "ntk:powered_bit": powerBitState
                });
                block.setPermutation(changeBlockPermutation);
                const changeAboveBlockPermutation = BlockPermutation.resolve(block.typeId, {
                  "ntk:upper_block_bit": true,
                  "minecraft:cardinal_direction": cardinalDirectionState,
                  "ntk:door_hinge_bit": true,
                  "ntk:powered_bit": powerBitState
                });
                aboveBlock.setPermutation(changeAboveBlockPermutation);
              }
              else {
                const changeAboveBlockPermutation = BlockPermutation.resolve(block.typeId, {
                  "ntk:upper_block_bit": true,
                  "minecraft:cardinal_direction": cardinalDirectionState,
                  "ntk:door_hinge_bit": doorHingeState,
                  "ntk:powered_bit": powerBitState
                });
                aboveBlock.setPermutation(changeAboveBlockPermutation);
              }
            }
          }
        }
      }
    }
  },
};
const BlockDoorOnBreakComponent = {
  onBreak({ block, brokenBlockPermutation, dimension, blockDestructionSource, entitySource }, { params }) {
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const blockName = child.block_name;
      
      const brokenBlock = brokenBlockPermutation;
      const belowBelow = block.below();
      const { x, y, z } = block.location;
      
      if (Math.random() * 100 <= eventChance) {
        if (brokenBlock.matches(blockName, { "ntk:upper_block_bit": true })) {
          if (belowBelow.permutation.matches(blockName, { "ntk:upper_block_bit": false })) {
            dimension.runCommand(`setblock ${x} ${y - 1} ${z} minecraft:air [] destroy`);
          }
        }
      }
    }
  }
};
const BlockDoorOnPlayerInteractComponent = {
  onPlayerInteract({ block, dimension, face, faceLocation, player }, { params }) {
    for (const child of params) {
      const closeSoundEffect = child.close_sound_effect ?? "close.wooden_door";
      const closeSoundPitchMin = child.close_sound_pitch_min ?? 1.0;
      const closeSoundPitchMax = child.close_sound_pitch_max ?? 1.0;
      const closeSoundVolume = child.close_sound_volume ?? 1.0;
      const openSoundEffect = child.open_sound_effect ?? "open.wooden_door";
      const openSoundPitchMin = child.open_sound_pitch_min ?? 1.0;
      const openSoundPitchMax = child.open_sound_pitch_max ?? 1.0;
      const openSoundVolume = child.open_sound_volume ?? 1.0;
      
      const upperBlockBitState = block.permutation.getState("ntk:upper_block_bit");
      const otherHalfBlock = upperBlockBitState ? block.below() : block.above();
      const openBitState = block.permutation.getState("ntk:open_bit");
      const otherHalfBitState = otherHalfBlock.permutation.getState("ntk:open_bit");
      const newOpenBitState = !openBitState;
      const newOtherHalfBitState = !otherHalfBitState;
      const newBlockPermutation = BlockPermutation.resolve(block.typeId, {...block.permutation.getAllStates(), "ntk:open_bit": newOpenBitState });
      const newOtherHalfBlockPermutation = BlockPermutation.resolve(otherHalfBlock.typeId, {...otherHalfBlock.permutation.getAllStates(), "ntk:open_bit": newOtherHalfBitState });
      block.setPermutation(newBlockPermutation);
      otherHalfBlock.setPermutation(newOtherHalfBlockPermutation);
      
      const soundEffect = openBitState ? closeSoundEffect : openSoundEffect;
      const soundPitchMax = openBitState ? closeSoundPitchMax : openSoundPitchMax;
      const soundPitchMin = openBitState ? closeSoundPitchMin : openSoundPitchMin;
      const soundPitch = Math.random() * (soundPitchMax - soundPitchMin) + soundPitchMin;
      const soundVolume = openBitState ? closeSoundVolume : openSoundVolume;
      block.dimension.playSound(soundEffect, block.location,  { pitch: soundPitch, volume: soundVolume });
    }
  },
};
const BlockDoorRedstoneUpdateComponent = {
  onRedstoneUpdate({ block, dimension, powerLevel }, { params }) {
    for (const child of params) {
      const closeSoundEffect = child.close_sound_effect ?? "close.wooden_door";
      const closeSoundPitchMin = child.close_sound_pitch_min ?? 1.0;
      const closeSoundPitchMax = child.close_sound_pitch_max ?? 1.0;
      const closeSoundVolume = child.close_sound_volume ?? 1.0;
      const openSoundEffect = child.open_sound_effect ?? "open.wooden_door";
      const openSoundPitchMin = child.open_sound_pitch_min ?? 1.0;
      const openSoundPitchMax = child.open_sound_pitch_max ?? 1.0;
      const openSoundVolume = child.open_sound_volume ?? 1.0;
      
      const blockPermutation = block.permutation;
      const upperBlockBitState = blockPermutation.getState("ntk:upper_block_bit");
      const openBitState = blockPermutation.getState("ntk:open_bit");
      const powerLevelState = powerLevel >= 1 ? true : false;
      const aboveBlock = block.above();
      const belowBlock = block.below();
      
      if ((upperBlockBitState === false && powerLevel === 0 && aboveBlock.getRedstonePower() !== 0) || (upperBlockBitState === true && powerLevel === 0 && belowBlock.getRedstonePower() !== 0)) return;
      block.setPermutation(BlockPermutation.resolve(block.typeId, {
        ...block.permutation.getAllStates(),
        "ntk:open_bit": powerLevelState,
        "ntk:powered_bit": true
      }));
      if (upperBlockBitState === false) {
        aboveBlock.setPermutation(BlockPermutation.resolve(aboveBlock.typeId, {
          ...aboveBlock.permutation.getAllStates(),
          "ntk:open_bit": powerLevelState,
          "ntk:powered_bit": true
        }));
      }
      else {
        belowBlock.setPermutation(BlockPermutation.resolve(belowBlock.typeId, {
          ...belowBlock.permutation.getAllStates(),
          "ntk:open_bit": powerLevelState,
          "ntk:powered_bit": true
        }));
      };
      if (openBitState === false) {
        const soundPitch = Math.random() * (closeSoundPitchMax - closeSoundPitchMin) + closeSoundPitchMin;
        block.dimension.playSound(closeSoundEffect, block.location, { pitch: soundPitch, volume: closeSoundVolume });
      }
      else {
        const soundPitch = Math.random() * (openSoundPitchMax - openSoundPitchMin) + openSoundPitchMin;
        block.dimension.playSound(openSoundEffect, block.location, { pitch: soundPitch, volume: openSoundVolume });
      }
    }
  }
};
const BlockDoorOnTickComponent = {
  onTick({ block, dimension }, { params }) {
    for (const child of params) {
      const eventChance = child.event_chance ?? 100;
      const blockName = child.block_name;
      const blockState = child.block_state;
      const stateValue = child.state_value;
      const soundEffect = child.sound_effect ?? false;
      const soundPitchMin = child.sound_pitch_min ?? 1.0;
      const soundPitchMax = child.sound_pitch_max ?? 1.0;
      const soundVolume = child.sound_volume ?? 1.0;
      
      if (Math.random() * 100 <= eventChance) {
        console.warn("Event Chance!");
        const cardinalDirectionState = block.permutation?.getState("minecraft:cardinal_direction");
        const doorHingeState = block.permutation?.getState("ntk:door_hinge_bit");
        const openBitState = block.permutation?.getState("ntk:open_bit");
        const poweredBitState = block.permutation?.getState("ntk:powered_bit");
        const upperBlockBitState = block.permutation?.getState("ntk:upper_block_bit");
        const otherHalfBlock = upperBlockBitState ? block.below() : block.above();
        const otherHalfUpperBlockBitState = otherHalfBlock.permutation?.getState("ntk:upper_block_bit");
        const redstonePower = block.getRedstonePower();
        const hasRedstone = redstonePower > 0;
        const soundPitch = Math.random() * (soundPitchMax - soundPitchMin) + soundPitchMin;
        
        if (block.permutation.matches(blockName, blockState ? { [blockState]: stateValue } : {})) {
          if (!hasRedstone && poweredBitState === true) {
            console.warn("Powered!");
            if (openBitState === true) {
              console.warn("Open Bit!");
              block.setPermutation(BlockPermutation.resolve(block.typeId, {
                "minecraft:cardinal_direction": cardinalDirectionState,
                "ntk:door_hinge_bit": doorHingeState,
                "ntk:upper_block_bit": upperBlockBitState,
                "ntk:open_bit": false,
                "ntk:powered_bit": false
              }));
              otherHalfBlock.setPermutation(BlockPermutation.resolve(otherHalfBlock.typeId, {
                "minecraft:cardinal_direction": cardinalDirectionState,
                "ntk:door_hinge_bit": doorHingeState,
                "ntk:upper_block_bit": otherHalfUpperBlockBitState,
                "ntk:open_bit": false,
                "ntk:powered_bit": false
              }));
              block.dimension.playSound(soundEffect, block.location, { pitch: soundPitch, volume: soundVolume });
            }
            else {
              console.warn("Close Bit!");
              block.setPermutation(BlockPermutation.resolve(block.typeId, {
                "minecraft:cardinal_direction": cardinalDirectionState,
                "ntk:door_hinge_bit": doorHingeState,
                "ntk:upper_block_bit": upperBlockBitState,
                "ntk:open_bit": false,
                "ntk:powered_bit": false
              }));
              otherHalfBlock.setPermutation(BlockPermutation.resolve(otherHalfBlock.typeId, {
                "minecraft:cardinal_direction": cardinalDirectionState,
                "ntk:door_hinge_bit": doorHingeState,
                "ntk:upper_block_bit": otherHalfUpperBlockBitState,
                "ntk:open_bit": false,
                "ntk:powered_bit": false
              }));
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
    "ntk:door_before_on_player_place", BlockDoorBeforeOnPlayerPlaceComponent
  );
  blockComponentRegistry.registerCustomComponent(
    "ntk:door_on_place", BlockDoorOnPlaceComponent
  );
  blockComponentRegistry.registerCustomComponent(
    "ntk:door_on_break", BlockDoorOnBreakComponent
  );
  blockComponentRegistry.registerCustomComponent(
    "ntk:door_on_player_interact", BlockDoorOnPlayerInteractComponent
  );
  blockComponentRegistry.registerCustomComponent(
    "ntk:door_on_redstone_update", BlockDoorRedstoneUpdateComponent
  );
  /*blockComponentRegistry.registerCustomComponent(
    "ntk:door_on_tick", BlockDoorOnTickComponent
  );*/
});

world.beforeEvents.playerBreakBlock.subscribe(event => {
    const { block, dimension, itemStack, player } = event;
    const { x, y, z } = block.location;
    if (player.getGameMode() === "Creative") return;
    const itemEnchantable = itemStack?.getComponent("minecraft:enchantable");
    if (itemEnchantable) {
      const silkTouch = itemEnchantable.getEnchantment("silk_touch");
      if (silkTouch) {
        const upperBlockState = block.permutation?.getState("ntk:upper_block_bit");
        if (upperBlockState === false) {
          event.cancel = true;
        }
        else return;
      }
      else return;
    }
    else return;
    system.run(() => {
      block.dimension.runCommand(`setblock ${x} ${y} ${z} minecraft:air [] destroy`);
      damageItemDurability(player, itemStack, 1, "Mainhand", false);
    });
});
/* Used in:
MB:
- Corrupted Oak Door
- Mossy Willow Door
- Overgrown Jungle Door
NCE:
- Mosshroom Door
*/