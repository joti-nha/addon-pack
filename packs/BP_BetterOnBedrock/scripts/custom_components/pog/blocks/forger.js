import { ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

/**
 * @param { import("@minecraft/server").Player } player
 * @param { string } itemId
 */
function getItemCount(player, itemId) {
	let itemCount = 0;
	const inventory = player.getComponent("inventory").container;
	for (let slot = 0; slot < inventory.size; slot++) {
		const item = inventory.getItem(slot);
		if (
			item !== undefined
			&& item.typeId == itemId
		) itemCount += item.amount;
	};

	return itemCount;
};

/** @param { import("@minecraft/server").Player } player */
function ironToolHead(player) {
    new ActionFormData()
    .title("Cabeça de Ferramenta de Ferro")
    .body("Você precisa de §7Lingotes de Ferro §8x2§r para forjar uma Cabeça de Ferramenta de Ferro.")
    .button("Forge")
    .button("§cFechar§r")
    .show(player).then((response) => {
        if (response.canceled)
            return;

        switch (response.selection) {
            case 0: {
                if (getItemCount(player, "minecraft:iron_ingot") > 0) {
                    player.dimension.spawnItem(new ItemStack("better_on_bedrock:pickaxe_head"), player.location);
                    player.runCommand("clear @s minecraft:iron_ingot 0 2");
                    player.playSound("random.anvil_use");
                }
                else {
                    player.sendMessage("§c[!] §rVocê não tem a quantidade necessária de §7Lingotes de Ferro§r.");
                };
                break;
            };
        };
    });
};

/** @type { import("@minecraft/server").BlockCustomComponent } */
export const events = {
    onPlayerInteract: ({ player }) => {
        new ActionFormData()
        .title("Bem-vindo à Forja")
        .body("Este bloco permite fabricar recursos específicos para criar itens únicos!")
        .button("Cabeça de Ferramenta de Ferro")
        .button("§cFechar§r")
        .show(player).then((response) => {
        if (response.canceled)
            return;
        
            switch (response.selection) {
                case 0: ironToolHead(player); break;
            };
        });
    },
};