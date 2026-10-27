import { system, world } from "@minecraft/server";

function getReadableItemName(item) {
  try {
    const display = item.getComponent("minecraft:display_name");
    if (display?.value) return display.value;
  } catch { }

  if (item.nameTag) return item.nameTag;

  const raw = item.typeId.split(":")[1] ?? item.typeId;
  return raw.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

const xpValues = {
  "mnra_cata:floret_hatchet": 8,
  "mnra_cata:floret_element": 2,
  "mnra_cata:spore_thrower": 7,
  "mnra_cata:everbloom": 35,
  "mnra_cata:blooming_heart": 15,
  "mnra_cata:blossom_jewel": 30,
  "mnra_cata:feral_flower": 1,
  "mnra_cata:feral_roots": 1,
  "mnra_cata:master_verdant_key": 35,
  "mnra_cata:blooming_aegis": 15,
  "mnra_cata:floret_absorption": 10,
  "mnra_cata:floret_necklace": 15,
  "mnra_cata:floret_ring": 15,
  "mnra_cata:feralplast_brick": 2,
  "mnra_cata:feralplast": 1,
  "mnra_cata:floret_block": 20,
  "mnra_cata:polished_feralplast": 1,
  "mnra_cata:floret_ore": 3,
};

system.beforeEvents.startup.subscribe((ev) => {
  ev.blockComponentRegistry.registerCustomComponent("component:verdant_crusher", {
    onPlayerInteract(event) {
      const { block, player } = event;

      const equippable = player.getComponent("minecraft:equippable");
      const selectedItem = equippable.getEquipment("Mainhand");

      if (!selectedItem) return;

      const itemId = selectedItem.typeId;
      const xp = xpValues[itemId];

      if (!xp) {
        const readableName = getReadableItemName(selectedItem);
        player.onScreenDisplay.setActionBar(`§c${readableName} não pode ser absorvido.`);

        player.playSound("note.harp", {
          location: block.location,
          volume: 0.4,
          pitch: 1.2
        });
        return;
      }

      if (selectedItem.amount === 1) {
        equippable.setEquipment("Mainhand", undefined);
      } else {
        selectedItem.amount -= 1;
        equippable.setEquipment("Mainhand", selectedItem);
      }

      player.addExperience(xp);

      player.playSound("block.grindstone.use", {
        location: block.location,
        volume: 1,
        pitch: 1
      });

      block.dimension.spawnParticle("mnra_cata:verdant_crusher", {
        x: block.location.x + 0.5,
        y: block.location.y + 0.5,
        z: block.location.z + 0.5
      });
      block.dimension.spawnParticle("mnra_cata:verdant_crusher_floret", {
        x: block.location.x + 0.5,
        y: block.location.y + 0.5,
        z: block.location.z + 0.5
      });
    }
  });
});



