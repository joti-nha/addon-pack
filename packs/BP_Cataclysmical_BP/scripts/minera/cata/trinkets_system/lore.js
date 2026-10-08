import { world } from "@minecraft/server";

const trinketLore = {
    1: ["§6Trinket Slot I", "§7A mysterious item"],
    2: ["§6Trinket Slot II", "§7Empowered by magic"],
    3: ["§6Trinket Slot III", "§7Ancient power flows through"],
    4: ["§6Trinket Slot IV", "§7Beware its strength"],
    5: ["§6Trinket Slot V", "§7Ultimate trinket"]
};

function applyLoreToTaggedItems(player, slotNumber) {
    const tag = `mnra_cata:trinkets_slot_${slotNumber}`;
    player.getComponents().forEach(component => {
    });

    const inventory = player.getComponent("inventory").container;
    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (!item) continue;

        if (item.hasTag(tag)) {
            item.setLore(trinketLore[slotNumber]);
        }
    }
}

world.events.playerJoin.subscribe(ev => {
    const player = ev.player;
    for (let slot = 1; slot <= 5; slot++) {
        applyLoreToTaggedItems(player, slot);
    }
});

world.events.itemUse.subscribe(ev => {
    const player = ev.source;
    for (let slot = 1; slot <= 5; slot++) {
        applyLoreToTaggedItems(player, slot);
    }
});