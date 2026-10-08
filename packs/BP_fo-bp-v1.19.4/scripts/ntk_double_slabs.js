import { world, system, BlockPermutation } from "@minecraft/server";
import { decreaseItemStack } from "./ntk_functions.js";
import { interactableBlocks } from "./ntk_listing.js";

const customSlab = [
  "ntk:andesite_brick_slab",
  "ntk:andesite_tile_slab",
  "ntk:calcite_slab",
  "ntk:corrupted_oak_slab",
  "ntk:corrupted_stone_brick_slab",
  "ntk:corrupted_stone_slab",
  "ntk:corrupted_stone_tile_slab",
  "ntk:diorite_brick_slab",
  "ntk:diorite_tile_slab",
  "ntk:dripstone_slab",
  "ntk:end_stone_slab",
  "ntk:end_stone_tile_slab",
  "ntk:granite_brick_slab",
  "ntk:granite_tile_slab",
  "ntk:limestone_brick_slab",
  "ntk:limestone_slab",
  "ntk:marble_brick_slab",
  "ntk:marble_slab",
  "ntk:mosshroom_slab",
  "ntk:mossy_andesite_brick_slab",
  "ntk:mossy_deepslate_brick_slab",
  "ntk:mossy_diorite_brick_slab",
  "ntk:mossy_end_stone_brick_slab",
  "ntk:mossy_granite_brick_slab",
  "ntk:mossy_willow_slab",
  "ntk:overgrown_jungle_slab",
  "ntk:polished_calcite_slab",
  "ntk:polished_corrupted_stone_slab",
  "ntk:polished_dripstone_slab",
  "ntk:polished_end_stone_slab",
  "ntk:polished_limestone_slab",
  "ntk:polished_marble_slab",
  "ntk:polished_soul_stone_slab",
  "ntk:polished_stone_slab",
  "ntk:rose_quartz_slab",
  "ntk:smooth_corrupted_stone_slab",
  "ntk:smooth_end_stone_slab",
  "ntk:smooth_rose_quartz_slab",
  "ntk:soul_stone_brick_slab",
  "ntk:soul_stone_slab",
  "ntk:stone_tile_slab"
];

function doubleSlab(block, itemStack, entity) {
  const mapping = {
    "ntk:andesite_brick_slab": {
      doubleSlab: "ntk:andesite_brick_double_slab",
      sound: "use.stone",
    },
    "ntk:andesite_tile_slab": {
      doubleSlab: "ntk:andesite_tile_double_slab",
      sound: "use.stone",
    },
    "ntk:calcite_slab": {
      doubleSlab: "ntk:calcite_double_slab",
      sound: "place.calcite",
    },
    "ntk:corrupted_oak_slab": {
      doubleSlab: "ntk:corrupted_oak_double_slab",
      sound: "use.wood",
    },
    "ntk:corrupted_stone_brick_slab": {
      doubleSlab: "ntk:corrupted_stone_brick_double_slab",
      sound: "use.basalt",
    },
    "ntk:corrupted_stone_tile_slab": {
      doubleSlab: "ntk:corrupted_stone_tile_double_slab",
      sound: "use.basalt",
    },
    "ntk:corrupted_stone_slab": {
      doubleSlab: "ntk:corrupted_stone_double_slab",
      sound: "use.basalt",
    },
    "ntk:diorite_brick_slab": {
      doubleSlab: "ntk:diorite_brick_double_slab",
      sound: "use.stone",
    },
    "ntk:diorite_tile_slab": {
      doubleSlab: "ntk:diorite_tile_double_slab",
      sound: "use.stone",
    },
    "ntk:dripstone_slab": {
      doubleSlab: "ntk:dripstone_double_slab",
      sound: "place.dripstone_block",
    },
    "ntk:end_stone_slab": {
      doubleSlab: "ntk:end_stone_double_slab",
      sound: "use.stone",
    },
    "ntk:end_stone_tile_slab": {
      doubleSlab: "ntk:end_stone_tile_double_slab",
      sound: "use.stone",
    },
    "ntk:granite_brick_slab": {
      doubleSlab: "ntk:granite_brick_double_slab",
      sound: "use.stone",
    },
    "ntk:granite_tile_slab": {
      doubleSlab: "ntk:granite_tile_double_slab",
      sound: "use.stone",
    },
    "ntk:limestone_brick_slab": {
      doubleSlab: "ntk:limestone_brick_double_slab",
      sound: "use.stone",
    },
    "ntk:limestone_slab": {
      doubleSlab: "ntk:limestone_double_slab",
      sound: "use.stone",
    },
    "ntk:marble_brick_slab": {
      doubleSlab: "ntk:marble_brick_double_slab",
      sound: "place.calcite",
    },
    "ntk:marble_slab": {
      doubleSlab: "ntk:marble_double_slab",
      sound: "place.calcite",
    },
    "ntk:mosshroom_slab": {
      doubleSlab: "ntk:mosshroom_double_slab",
      sound: "step.nether_wood",
    },
    "ntk:mossy_andesite_brick_slab": {
      doubleSlab: "ntk:mossy_andesite_brick_double_slab",
      sound: "use.stone",
    },
    "ntk:mossy_deepslate_brick_slab": {
      doubleSlab: "ntk:mossy_deepslate_brick_double_slab",
      sound: "use.deepslate_bricks",
    },
    "ntk:mossy_diorite_brick_slab": {
      doubleSlab: "ntk:mossy_diorite_brick_double_slab",
      sound: "use.stone",
    },
    "ntk:mossy_end_stone_brick_slab": {
      doubleSlab: "ntk:mossy_end_stone_brick_double_slab",
      sound: "use.stone",
    },
    "ntk:mossy_granite_brick_slab": {
      doubleSlab: "ntk:mossy_granite_brick_double_slab",
      sound: "use.stone",
    },
    "ntk:mossy_willow_slab": {
      doubleSlab: "ntk:mossy_willow_double_slab",
      sound: "use.wood",
    },
    "ntk:overgrown_jungle_slab": {
      doubleSlab: "ntk:overgrown_jungle_double_slab",
      sound: "use.wood",
    },
    "ntk:polished_calcite_slab": {
      doubleSlab: "ntk:polished_calcite_double_slab",
      sound: "place.calcite",
    },
    "ntk:polished_corrupted_stone_slab": {
      doubleSlab: "ntk:polished_corrupted_stone_double_slab",
      sound: "use.basalt",
    },
    "ntk:polished_dripstone_slab": {
      doubleSlab: "ntk:polished_dripstone_double_slab",
      sound: "place.dripstone_block",
    },
    "ntk:polished_end_stone_slab": {
      doubleSlab: "ntk:polished_end_stone_double_slab",
      sound: "place.calcite",
    },
    "ntk:polished_limestone_slab": {
      doubleSlab: "ntk:polished_limestone_double_slab",
      sound: "use.stone",
    },
    "ntk:polished_marble_slab": {
      doubleSlab: "ntk:polished_marble_double_slab",
      sound: "place.calcite",
    },
    "ntk:polished_soul_stone_slab": {
      doubleSlab: "ntk:polished_soul_stone_double_slab",
      sound: "use.stone",
    },
    "ntk:polished_stone_slab": {
      doubleSlab: "ntk:polished_stone_double_slab",
      sound: "use.stone",
    },
    "ntk:rose_quartz_slab": {
      doubleSlab: "ntk:rose_quartz_double_slab",
      sound: "use.stone",
    },
    "ntk:smooth_corrupted_stone_slab": {
      doubleSlab: "ntk:smooth_corrupted_stone_double_slab",
      sound: "use.basalt",
    },
    "ntk:smooth_end_stone_slab": {
      doubleSlab: "ntk:smooth_end_stone_double_slab",
      sound: "place.calcite",
    },
    "ntk:smooth_rose_quartz_slab": {
      doubleSlab: "ntk:smooth_rose_quartz_double_slab",
      sound: "use.stone",
    },
    "ntk:soul_stone_brick_slab": {
      doubleSlab: "ntk:soul_stone_brick_double_slab",
      sound: "use.stone",
    },
    "ntk:soul_stone_slab": {
      doubleSlab: "ntk:soul_stone_double_slab",
      sound: "use.stone",
    },
    "ntk:stone_tile_slab": {
      doubleSlab: "ntk:stone_tile_double_slab",
      sound: "use.stone",
    },
  };
  const entry = mapping[block.typeId];
  if (!entry) return;
  system.run(() => {
    block.setPermutation(BlockPermutation.resolve(entry.doubleSlab));
    block.dimension.playSound(entry.sound, block.location, { pitch: 0.8, volume: 1.0 });
    decreaseItemStack(entity, itemStack, 1, "Mainhand");
  });
}

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
  const player = event.player;
  const itemStack = event.itemStack;
  const block = event.block;
  const face = event.blockFace;
  if (!itemStack || !customSlab.includes(itemStack.typeId)) return;
  if (interactableBlocks.includes(block.typeId) && !player.isSneaking || block.hasTag("ntk:interactable_block") && !player.isSneaking) return;
  const faceOffsets = {
    Up: { x: 0, y: 1, z: 0 },
    Down: { x: 0, y: -1, z: 0 },
    South: { x: 0, y: 0, z: 1 },
    North: { x: 0, y: 0, z: -1 },
    East: { x: 1, y: 0, z: 0 },
    West: { x: -1, y: 0, z: 0 },
  };
  const offset = faceOffsets[face];
  if (!offset) return;
  const { x, y, z } = block.location;
  const neighborBlock = block.dimension.getBlock({ x: x + offset.x, y: y + offset.y, z: z + offset.z });
  if (!neighborBlock) return;
  const interactedSlab = customSlab.includes(block.typeId);
  const stateHalf = interactedSlab ? block.permutation.getState("minecraft:vertical_half") : null;
  const neighborBlockIsSlab = customSlab.includes(neighborBlock.typeId);
  const neighborBlockHalf = neighborBlockIsSlab ? neighborBlock.permutation.getState("minecraft:vertical_half") : null;
  if (face === "Up") {
    if ((block.typeId === itemStack.typeId) && stateHalf === "bottom") {
      doubleSlab(block, itemStack, player);
      event.cancel = true;
    }
    else if ((interactedSlab && stateHalf === "top") || !interactedSlab) {
      if (neighborBlockIsSlab && neighborBlockHalf === "top" && neighborBlock.typeId === itemStack.typeId) {
        doubleSlab(neighborBlock, itemStack, player);
      }
    }
  }
  else if (face === "Down") {
    if ((block.typeId === itemStack.typeId) && stateHalf === "top") {
      doubleSlab(block, itemStack, player);
      event.cancel = true;
    }
    else if ((interactedSlab && stateHalf === "bottom") || !interactedSlab) {
      if (neighborBlockIsSlab && neighborBlockHalf === "bottom" && neighborBlock.typeId === itemStack.typeId) {
        doubleSlab(neighborBlock, itemStack, player);
      }
    }
  }
  else {
    if (neighborBlockIsSlab && neighborBlock.typeId === itemStack.typeId) {
      doubleSlab(neighborBlock, itemStack, player);
    }
  }
});
/*Used in:
- Mythical Biomes
- Nico's Block Expansion
- Nico's Cave Expansion
*/