import { system, world } from "@minecraft/server";

const ItemCache = new Map();
const RareChance = 0.03;

//will add here sometime... i think
const ItemLore = {
    HasTerrorStage1: {
        icon: "",
        lines: [
            "§8You feel terrified",
            // i cant think of anything lol
        ]
    },
    HasTerrorStage2: {
        icon: "",
        lines: [
            "§8Your soul starts to tremble",
        ]
    },
    HasTerrorStage3: {
        icon: "",
        lines: [
            "§8The air is getting colder around you",
        ]
    },
    HasTerrorStage4: {
        icon: "",
        lines: [
            "§8Something ancient stirs beyond the void",
            "§8You feel your soul start to burn"
        ]
    },
    HasTerrorStage5: {
        icon: "",
        lines: [
            "§8§oTerrors are watching"
        ]
    }
};

const RareMessages = [
    "§dHii Minecwaff ",
    "§8Horrible chills go down your spine... (not a reference)",
    "§8§6PLAGUE NUKE BARRAGE ARMED, PREPARING FOR LAUNCH!!!",
    "§dThis is a ultra rare super rare mega rare message..."
];
const TerrorStages = [
    "HasTerrorStage5",
    "HasTerrorStage4",
    "HasTerrorStage3",
    "HasTerrorStage2",
    "HasTerrorStage1"
];

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const inv = player.getComponent("minecraft:inventory")?.container;
        if (!inv) continue;

        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (!item || item.typeId !== "mnra_cata:terror_detector") continue;

            let stageFound = null;
            for (const stage of TerrorStages) {
                if (player.hasTag(stage)) {
                    stageFound = stage;
                    break;
                }
            }

            let icon = "";
            let bottomLine = "§8You feel calm...";

            if (stageFound && ItemLore[stageFound]) {
                const info = ItemLore[stageFound];
                icon = info.icon;

                const last = ItemCache.get(player.id);
                if (last?.stage === stageFound) {
                    bottomLine = last.line;
                } else {
                    bottomLine =
                        Math.random() < RareChance
                            ? RareMessages[Math.floor(Math.random() * RareMessages.length)]
                            : info.lines[Math.floor(Math.random() * info.lines.length)];

                    ItemCache.set(player.id, { stage: stageFound, line: bottomLine });
                }
            } else {
                ItemCache.delete(player.id);
            }

            const desiredLore = [icon, bottomLine];
            const currentLore = item.getLore() ?? [];

            if (
                currentLore.length !== 2 ||
                currentLore[0] !== desiredLore[0] ||
                currentLore[1] !== desiredLore[1]
            ) {
                const newItem = item.clone();
                newItem.setLore(desiredLore);
                inv.setItem(i, newItem);
            }
        }
    }
}, 10);

