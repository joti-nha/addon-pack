import { world, system } from "@minecraft/server";
import { GetPlayerTerrorStage } from "../../CataSystem/TerrorConfig.js";

const TerrorScaling = "§r§bTerror ";

const TerrorLore = [
    `${TerrorScaling}Escala: +0`,
    `${TerrorScaling}I · Escala: +2`,
    `${TerrorScaling}II · Escala: +4`,
    `${TerrorScaling}III · Escala: +6`,
    `${TerrorScaling}IV · Escala: +8`,
    `${TerrorScaling}V · Escala: +10`,
];

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const inv = player.getComponent("inventory")?.container;
        if (!inv) continue;

        const terrorStage = GetPlayerTerrorStage(player);
        if (terrorStage < 0 || terrorStage > 5) continue;

        for (let slot = 0; slot < inv.size; slot++) {
            const item = inv.getItem(slot);
            if (!item) continue;

            if (item.typeId !== "mnra_cata:phantasma_greatsword") continue;

            let lore = item.getLore() ?? [];
            lore = lore.filter(line => !line.startsWith(TerrorScaling));

            lore.push(TerrorLore[terrorStage]);

            item.setLore(lore);
            inv.setItem(slot, item);
        }
    }
}, 10);