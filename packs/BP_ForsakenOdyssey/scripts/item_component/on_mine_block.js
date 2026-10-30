import { system } from "@minecraft/server";
import { damageItemDurability } from "../ntk_functions.js";
import { instantDiggableBlocks } from "../ntk_listing.js";

const ItemOnMineBlockComponent = {
  onMineBlock({ source, itemStack, block, minedBlockPermutation }, { params }) {
    if (instantDiggableBlocks.includes(minedBlockPermutation.type.id) || minedBlockPermutation.hasTag("ntk:instant_diggable")) return;
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const itemName = child.item_name;
      const itemSlot = child.item_slot ?? "Mainhand";
      
      const durabilityDamage = child.durability_damage ?? false;
      const durabilityDamageChance = child.durability_damage_chance ?? 100.0;
      
      const particleEffect = child.particle_effect ?? false;
      const particleOffsetX = child.particle_offset_x ?? 0.0;
      const particleOffsetY = child.particle_offset_y ?? 0.0;
      const particleOffsetZ = child.particle_offset_z ?? 0.0;
      const soundEffect = child.sound_effect ?? false;
      const soundPitchMin = child.sound_pitch_min ?? 1.0;
      const soundPitchMax = child.sound_pitch_max ?? 1.0;
      const soundVolume = child.sound_volume ?? 1.0;
      
      const enhancerItem = child.enhancer_item ?? false;
      const enhancerSlot = child.enhancer_slot ?? "Offhand";
      const enhanceChance = child.enhance_chance ?? 100.0;
      const enhanceValue = child.enhance_value ?? 0;
      const damageEnhancerDurability = child.damage_enhancer_durability ?? false;
      const enhancerDurabilityDamage = child.enhancer_durability_damage ?? 1;
      
      if (Math.random() * 100 <= eventChance) {
        if (itemStack.typeId === itemName) {
          const sourceEquippable = source.getComponent("equippable");
          const soundPitch = Math.random() * (soundPitchMax - soundPitchMin) + soundPitchMin;
          // Enhancer item:
          let enhanceBaseValue = 0;
          let enhanceAmount = 0;
          if (enhancerItem !== false) {
            if (sourceEquippable) {
              const enhancerItemSlot = sourceEquippable.getEquipmentSlot(enhancerSlot);
              const enhancerItemStack = enhancerItemSlot.getItem();
              if (enhancerItemStack === undefined || !enhancerItemStack.hasTag(enhancerItem)) {
                enhanceBaseValue = 0;
                enhanceAmount = 0;
              }
              else if (enhancerItemStack.hasTag(enhancerItem)) {
                if (Math.random() * 100 <= enhanceChance) {
                  enhanceAmount = enhanceBaseValue + enhanceValue;
                  if (damageEnhancerDurability === true) {
                    damageItemDurability(source, enhancerItemStack, enhancerDurabilityDamage, enhancerSlot, false);
                  }
                }
              }
            }
          }
          // Enhancer calculation:
          const totalDurabilityDamage = durabilityDamage - enhanceAmount;
          // Durability Damage with enhancement:
          if (durabilityDamage !== false) {
            if (Math.random() * 100 <= durabilityDamageChance) {
              damageItemDurability(source, itemStack, totalDurabilityDamage, itemSlot, false);
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
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent(
    "ntk:on_mine_block", ItemOnMineBlockComponent
  );
});
/*Used in:
ACT:
- Amethyst Sword
- Identification
- Tool
CP:
- Aluminum Tools
- Anti Gravity Gun
- Blinker Gun
- Block Identifier
- Laser Blades
- Laser Pistol
- Laser Rifle
- Metal Tools
- Silicon Tools
- Titanium Tools
K&C:
- Flint Axe
NCE:
- Brass Tools
- Bronze Tools
- Olivine Tools
- Tin Tools
- Zinc Tools
NIE:
- Arcance Staff
- Blazing Staff
- Jar Opener
- Levitation Staff
- Powder Staff
- Staff of the Sea
- Teleportation Staff
NM:
- Bone Dagger
- Scorpion Gauntlet
NMD:
- Curserer Staff
- Piglin Fire Staff
- Piglin War Hammer
NMS:
- Amethyst Spellweaver Wand
- Amethyst Wand
- Diamond Spellweaver Wand
- Diamond Wand
- Golden Spellweaver Wand
- Golden Wand
- Quartz Spellweaver Wand
- Quartz Wand
*/
