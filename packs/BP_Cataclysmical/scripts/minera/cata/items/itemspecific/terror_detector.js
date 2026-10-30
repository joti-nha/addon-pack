import { system, world } from "@minecraft/server";

const ItemCache = new Map();
const RareChance = 0.03;

//will add here sometime... i think
const ItemLore = {
    HasTerrorStage1: {
        icon: "",
        lines: [
            "§8Você se sente aterrorizado",
            // i cant think of anything lol
        ]
    },
    HasTerrorStage2: {
        icon: "",
        lines: [
            "§8Sua alma começa a tremer",
        ]
    },
    HasTerrorStage3: {
        icon: "",
        lines: [
            "§8O ar fica mais frio ao seu redor",
        ]
    },
    HasTerrorStage4: {
        icon: "",
        lines: [
            "§8Algo ancestral se agita além do vazio",
            "§8Você sente sua alma começar a queimar"
        ]
    },
    HasTerrorStage5: {
        icon: "",
        lines: [
            "§8§oOs Terrores estão observando"
        ]
    }
};

const RareMessages = [
    "§dHii Minecwaff ",
    "§8Calafrios horríveis descem pela sua espinha... (não é referência)",
    "§8§6BARRAGEM NUCLEAR DA PRAGA ARMADA, PREPARANDO O LANÇAMENTO!!!",
    "§dEsta é uma mensagem ultra rara super rara mega rara..."
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

            let icon = "";
            let bottomLine = "§8Você se sente calmo...";

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

