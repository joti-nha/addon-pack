import { system } from "@minecraft/server";
import {
  damageItemDurability,
  decreaseItemStack,
  decreaseItemStackInventory,
  findInventoryItem
} from "../ntk_functions.js";
import {
  clearSkyMagicSpell,
  rainMagicSpell,
  thunderstormMagicSpell,
  hoardingMagicSpell1,
  hoardingMagicSpell2,
  hoardingMagicSpell3,
  homewardBoundMagicSpell
} from "./magic_scroll_spells.js";
import { unknownMagicSpell } from "./unknown_scroll_spells.js";

const ItemWandOnUseComponent = {
  onUse({ source, itemStack }, { params }) {
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const itemName = child.item_name;
      const itemSlot = child.item_slot ?? itemSlot;
      const ammunitionType = child.ammunition_type ?? false ;
      const ammunitionSlot = child.ammunition_slot ?? "Inventory";
      const ammunitionFailGuide = child.ammunition_fail_guide ?? false;
      if (Math.random() * 100 <= eventChance) {
        if (itemStack.typeId === itemName) {
          const sourceEquippable = source.getComponent("equippable");
          const sourceInventory = source.getComponent("inventory");
          if (ammunitionType !== false) {
            if (ammunitionSlot === "Inventory") {
              let hasAmmunition = false;
              const ammunitionItemContainer = sourceInventory.container;
              for (let i = 0; i < ammunitionItemContainer.size; i++) {
                const ammunitionItemStack = ammunitionItemContainer.getItem(i);
                if (ammunitionItemStack) {
                  if (ammunitionItemStack?.hasTag(ammunitionType)) {
                    hasAmmunition = true;
                  }
                }
                else {
                  const ammunitionItemStack = sourceEquippable.getEquipmentSlot("Offhand").getItem();
                  if (ammunitionItemStack?.hasTag(ammunitionType)) {
                    hasAmmunition = true;
                  }
                }
              }
              if (hasAmmunition === false) {
                if (ammunitionFailGuide !== false) {
                  source.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"§e${ammunitionFailGuide}§r\"}]}`);
                  source.dimension.playSound("game.player.attack.nodamage", source.location, { pitch: 1.2, volume: 1.0 });
                }
              }
            }
            else {
              const ammunitionItemSlot = sourceEquippable.getEquipmentSlot(ammunitionSlot);
              const ammunitionItemStack = ammunitionItemSlot.getItem();
              if (ammunitionItemStack === undefined || !ammunitionItemStack.hasTag(ammunitionType)) {
                if (ammunitionFailGuide !== false) {
                  source.runCommand(`tellraw @p {\"rawtext\":[{\"text\":\"§e${ammunitionFailGuide}§r\"}]}`);
                  source.dimension.playSound("game.player.attack.nodamage", source.location, { pitch: 1.2, volume: 1.0 });
                }
              }
            }
          }
        }
      }
    }
  },
};
const ItemWandOnCompleteUseComponent = {
  onCompleteUse({ source, itemStack }, { params }) {
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const itemName = child.item_name;
      const itemSlot = child.item_slot ?? itemSlot;
      const ammunitionType = child.ammunition_type ?? false ;
      const ammunitionSlot = child.ammunition_slot ?? "Inventory";
      const ammunitionFailGuide = child.ammunition_fail_guide ?? false;
      const ammunitionSoundEffect = child.ammunition_sound_effect ?? false;
      const ammunitionSoundPitchMin = child.ammunition_sound_pitch_min ?? 1.0;
      const ammunitionSoundPitchMax = child.ammunition_sound_pitch_max ?? 1.0;
      const ammunitionSoundVolume = child.ammunition_sound_volume ?? 1.0;
      const particleEffect = child.particle_effect ?? false;
      const particleOffsetX = child.particle_offset_x ?? 0.0;
      const particleOffsetY = child.particle_offset_y ?? 0.0;
      const particleOffsetZ = child.particle_offset_z ?? 0.0;
      const soundEffect = child.sound_effect ?? false;
      const soundPitchMin = child.sound_pitch_min ?? 1.0;
      const soundPitchMax = child.sound_pitch_max ?? 1.0;
      const soundVolume = child.sound_volume ?? 1.0;
      if (Math.random() * 100 <= eventChance) {
        if (itemStack.typeId === itemName) {
          const soundPitch = Math.random() * (soundPitchMax - soundPitchMin) + soundPitchMin;
          const sourceEquippable = source.getComponent("equippable");
          const sourceInventory = source.getComponent("inventory");
          if (ammunitionType !== false) {
            const ammunitionSoundPitch = Math.random() * (ammunitionSoundPitchMax - ammunitionSoundPitchMin) + ammunitionSoundPitchMin;
            if (ammunitionSlot === "Inventory") {
              let hasAmmunition = false;
              let hasProjectileScroll = false;
              const foundItem = findInventoryItem(source, ammunitionType);
              const ammunitionItemStack = foundItem.itemStack;
              const ammunitionItemSlot = foundItem.slot;
              if (ammunitionItemStack?.hasTag(ammunitionType)) {
                hasAmmunition = true;
              }
              if (ammunitionItemStack?.hasTag("ntk:projectile")) {
                hasProjectileScroll = true;
              }
              if (hasProjectileScroll === true) {
                if (ammunitionSoundEffect !== false) {
                  source.dimension.playSound(ammunitionSoundEffect, source.location, { pitch: ammunitionSoundPitch, volume: ammunitionSoundVolume });
                }
                return;
              }
              else if (hasProjectileScroll === false) {
                if (ammunitionItemStack.typeId === "ntk:scroll_of_clear_sky") {
                  clearSkyMagicSpell(source);
                  decreaseItemStackInventory(source, ammunitionItemStack, 1, ammunitionItemSlot);
                  damageItemDurability(source, itemStack, 1, itemSlot);
                  return;
                }
                if (ammunitionItemStack.typeId === "ntk:scroll_of_rain") {
                  rainMagicSpell(source);
                  decreaseItemStackInventory(source, ammunitionItemStack, 1, ammunitionItemSlot);
                  damageItemDurability(source, itemStack, 1, itemSlot);
                  return;
                }
                if (ammunitionItemStack.typeId === "ntk:scroll_of_thunderstorm") {
                  thunderstormMagicSpell(source);
                  decreaseItemStackInventory(source, ammunitionItemStack, 1, ammunitionItemSlot);
                  damageItemDurability(source, itemStack, 1, itemSlot);
                  return;
                }
                if (ammunitionItemStack.typeId === "ntk:scroll_of_hoarding_1") {
                  hoardingMagicSpell1(source);
                  decreaseItemStackInventory(source, ammunitionItemStack, 1, ammunitionItemSlot);
                  damageItemDurability(source, itemStack, 1, itemSlot);
                  return;
                }
                if (ammunitionItemStack.typeId === "ntk:scroll_of_hoarding_2") {
                  hoardingMagicSpell2(source);
                  decreaseItemStackInventory(source, ammunitionItemStack, 1, ammunitionItemSlot);
                  damageItemDurability(source, itemStack, 1, itemSlot);
                  return;
                }
                if (ammunitionItemStack.typeId === "ntk:scroll_of_hoarding_3") {
                  hoardingMagicSpell3(source);
                  decreaseItemStackInventory(source, ammunitionItemStack, 1, ammunitionItemSlot);
                  damageItemDurability(source, itemStack, 1, itemSlot);
                  return;
                }
                if (ammunitionItemStack.typeId === "ntk:scroll_of_homeward_bound") {
                  homewardBoundMagicSpell(source);
                  if (source.getSpawnPoint() !== undefined) {
                    decreaseItemStackInventory(source, ammunitionItemStack, 1, ammunitionItemSlot);
                    damageItemDurability(source, itemStack, 1, itemSlot);
                  }
                  return;
                }
                if (ammunitionItemStack.typeId === "ntk:unknown_scroll") {
                  unknownMagicSpell(source);
                  decreaseItemStackInventory(source, ammunitionItemStack, 1, ammunitionItemSlot);
                  damageItemDurability(source, itemStack, 1, itemSlot);
                  return;
                }
              }
              if (hasAmmunition === false) {
                if (particleEffect !== false) {
                  source.dimension.spawnParticle(particleEffect, { x: source.location.x + particleOffsetX, y: source.location.y + particleOffsetY, z: source.location.z + particleOffsetZ });
                }
                if (soundEffect !== false) {
                  source.dimension.playSound(soundEffect, source.location, { pitch: soundPitch, volume: soundVolume });
                }
              }
            }
            else {
              const ammunitionItemSlot = sourceEquippable.getEquipmentSlot(ammunitionSlot);
              const ammunitionItemStack = ammunitionItemSlot.getItem();
              if (ammunitionItemStack === undefined || !ammunitionItemStack.hasTag(ammunitionType)) {
                if (particleEffect !== false) {
                  source.dimension.spawnParticle(particleEffect, { x: source.location.x + particleOffsetX, y: source.location.y + particleOffsetY, z: source.location.z + particleOffsetZ });
                }
                if (soundEffect !== false) {
                  source.dimension.playSound(soundEffect, source.location, { pitch: soundPitch, volume: soundVolume });
                }
              }
              else if (ammunitionItemStack.hasTag(ammunitionType)) {
                if (ammunitionItemStack.hasTag("ntk:instant_magic_scroll")) {
                  if (ammunitionItemStack.typeId === "ntk:scroll_of_clear_sky") {
                    clearSkyMagicSpell(source);
                    decreaseItemStack(source, ammunitionItemStack, 1, ammunitionSlot);
                    damageItemDurability(source, itemStack, 1, itemSlot);
                  }
                  if (ammunitionItemStack.typeId === "ntk:scroll_of_rain") {
                    rainMagicSpell(source);
                    decreaseItemStack(source, ammunitionItemStack, 1, ammunitionSlot);
                    damageItemDurability(source, itemStack, 1, itemSlot);
                  }
                  if (ammunitionItemStack.typeId === "ntk:scroll_of_thunderstorm") {
                    thunderstormMagicSpell(source);
                    decreaseItemStack(source, ammunitionItemStack, 1, ammunitionSlot);
                    damageItemDurability(source, itemStack, 1, itemSlot);
                  }
                  if (ammunitionItemStack.typeId === "ntk:scroll_of_hoarding_1") {
                    hoardingMagicSpell1(source);
                    decreaseItemStack(source, ammunitionItemStack, 1, ammunitionSlot);
                    damageItemDurability(source, itemStack, 1, itemSlot);
                  }
                  if (ammunitionItemStack.typeId === "ntk:scroll_of_hoarding_2") {
                    hoardingMagicSpell2(source);
                    decreaseItemStack(source, ammunitionItemStack, 1, ammunitionSlot);
                    damageItemDurability(source, itemStack, 1, itemSlot);
                  }
                  if (ammunitionItemStack.typeId === "ntk:scroll_of_hoarding_3") {
                    hoardingMagicSpell3(source);
                    decreaseItemStack(source, ammunitionItemStack, 1, ammunitionSlot);
                    damageItemDurability(source, itemStack, 1, itemSlot);
                  }
                  if (ammunitionItemStack.typeId === "ntk:scroll_of_homeward_bound") {
                    homewardBoundMagicSpell(source);
                    if (source.getSpawnPoint() !== undefined) {
                      decreaseItemStack(source, ammunitionItemStack, 1, ammunitionSlot);
                      damageItemDurability(source, itemStack, 1, itemSlot);
                    }
                  }
                  if (ammunitionItemStack.typeId === "ntk:unknown_scroll") {
                    unknownMagicSpell(source);
                    decreaseItemStack(source, ammunitionItemStack, 1, ammunitionSlot);
                    damageItemDurability(source, itemStack, 1, itemSlot);
                  }
                }
                else {
                  if (ammunitionSoundEffect !== false) {
                    source.dimension.playSound(ammunitionSoundEffect, source.location, { pitch: ammunitionSoundPitch, volume: ammunitionSoundVolume });
                  }
                }
              }
            }
          }
        }
      }
    }
  },
};
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent(
    "ntk:wand_on_use", ItemWandOnUseComponent
  );
  itemComponentRegistry.registerCustomComponent(
    "ntk:wand_on_complete_use", ItemWandOnCompleteUseComponent
  );
});
/*Used in
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
