import "./utils/Components.js";
import "./entities.js";

import * as mc from "@minecraft/server";
import { TrinketManager, drainTrinketEvents, EffectHandler } from "./trinketManager.js";

const { world, system } = mc;

function formatName(id) {
    const raw = id.split(":")[1] ?? id;

    return raw
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

class TagTrinket extends EffectHandler {
    constructor(id) {
        super(id, formatName(id));

        this.itemId = id;
        this.tag = id;
    }

    onActivate(player, manager) {
        super.onActivate(player, manager);

        if (!player.hasTag(this.tag)) {
            player.addTag(this.tag);
        }
    }

    onDeactivate(player, manager) {
        if (player.hasTag(this.tag)) {
            player.removeTag(this.tag);
        }

        super.onDeactivate(player, manager);
    }

    onTick(player, manager) { }
}

// Trinket ids
const TrinketIds = [

    // place the ids of the item here, example: "mnra_cata:place_holder_trinket"

    "mnra_cata:ancient_ring",
    "mnra_cata:astro_jelly_in_a_bottle",
    "mnra_cata:calibrated_stellar_core",
    "mnra_cata:ecliptic_aegis",
    "mnra_cata:empty_ring",
    "mnra_cata:floret_charm",
    "mnra_cata:floret_necklace",
    "mnra_cata:floret_ring",
    "mnra_cata:phantasma_necklace",
    "mnra_cata:phantasma_ring",
    "mnra_cata:solar_charm",
    "mnra_cata:solar_necklace",
    "mnra_cata:solar_ring",
    "mnra_cata:starfall_necklace",
    "mnra_cata:stellar_charm",
    "mnra_cata:stellar_necklace",
    "mnra_cata:stellar_ring",
    "mnra_cata:sun_engine",
    "mnra_cata:sun_necklace",
    "mnra_cata:sun_ring",
    "mnra_cata:terror_eye",
    "mnra_cata:terror_necklace",
    "mnra_cata:terror_ring",
    "mnra_cata:twilight_charm",
    "mnra_cata:twilight_necklace",
    "mnra_cata:twilight_ring",
    "mnra_cata:verdant_aegis",
    "mnra_cata:verdant_necklace",
    "mnra_cata:verdant_ring",
    "mnra_cata:celestial_aegis",
];

export const Trinkets = TrinketIds.map(
    id => new TagTrinket(id)
);

// Manager Setup
const manager = new TrinketManager();

for (const trinket of Trinkets) {
    manager.registerTrinket(trinket.itemId, trinket);
}

system.runInterval(() => {
    const events = drainTrinketEvents();

    for (const event of events) {
        manager.handleEvent(event);
    }

    manager.tickActiveTrinkets();
}, 10);

world.afterEvents.playerLeave?.subscribe((event) => {
    manager.activeEffects.delete(event.playerId);
});

const inventory_ui = [
    "mnra_cata:slot_placeholder_1",
    "mnra_cata:slot_placeholder_2",
    "mnra_cata:slot_placeholder_3",
    "mnra_cata:slot_placeholder_4",
    "mnra_cata:slot_placeholder_5"
];

system.runInterval(() => {

    const dimensions = [
        world.getDimension("overworld"),
        world.getDimension("nether"),
        world.getDimension("the_end")
    ];

    for (const dimension of dimensions) {
        const items = dimension.getEntities({ type: "minecraft:item" });

        for (const itemEntity of items) {
            const itemComp = itemEntity.getComponent("minecraft:item");
            if (!itemComp) continue;

            const itemId = itemComp.itemStack.typeId;

            if (inventory_ui.includes(itemId)) {
                itemEntity.remove();
            }
        }
    }

}, 10); // [Addon Pack] era a cada tick
