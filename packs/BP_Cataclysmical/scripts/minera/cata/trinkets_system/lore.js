import { world } from "@minecraft/server";

const trinketLore = {
    1: ["§6Espaço de Bugiganga I", "§7Um item misterioso"],
    2: ["§6Espaço de Bugiganga II", "§7Fortalecido pela magia"],
    3: ["§6Espaço de Bugiganga III", "§7Um poder ancestral flui por ele"],
    4: ["§6Espaço de Bugiganga IV", "§7Cuidado com a sua força"],
    5: ["§6Espaço de Bugiganga V", "§7A bugiganga suprema"]
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