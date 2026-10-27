import { world, system } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";

import { showSimpleToggleMenu } from "./settings.js";
import { showRecipesMenu } from "./guidebook_recipemenu.js";
import { showFeaturesMenu } from "./guidebook_featuresmenu.js";

// ID do item que vai abrir o livro (pode ser um item customizado seu)
const GUIDE_ITEM_ID = "bv:guidebook";

world.afterEvents.itemUse.subscribe((event) => {
	const { source: player, itemStack } = event;

	// Verifica se o item usado é o nosso guia
	if (itemStack.typeId === GUIDE_ITEM_ID) {
		// UIs não podem ser abertas no mesmo tick do evento de uso do item,
		// então usamos system.run para atrasar a execução em 1 tick.
		system.run(() => {
			showMainMenu(player);
		});
		player.dimension.playSound("item.book.page_turn", player.location);
	}
});
export function pagesound(player) {
	player.dimension.playSound("item.book.page_turn", player.location);
}

export function showMainMenu(player) {
	const form = new ActionFormData()
		.title("Guia do Common Sense")
		.body("         Bem-vindo ao §cCommon Sense§f!\n    Escolha uma categoria abaixo para \n        conhecer o add-on. \n\n§7Todas as opções vêm desativadas\n   ative as que você quiser!")
		.button("Recipes", "textures/items/book_normal")
		.button("Features", "textures/items/book_enchanted")
		.button("Informações dos Itens", "textures/items/heart_amulet")
		.button("Settings", "textures/items/config")
		.button("Sobre a JFAddons", "textures/ui/MCoin"); // Espaço legal para colocar os créditos ou seu canal do YouTube

	form.show(player).then((response) => {
		if (response.canceled) return;

		switch (response.selection) {
			case 0:
				showRecipesMenu(player);
				pagesound(player)
				break;
			case 1:
				// showFunctionsMenu(player);
				showFeaturesMenu(player);
				break;
			case 2:
				// showItemsMenu(player);
				showItemsMenu(player)
				break;
			case 3:
				// showItemsMenu(player);
				showSimpleToggleMenu(player)
				break;
			case 4:
				showCredits(player);
				break;
		}
	}).catch(e => console.error(e));
}

//=========================
// ITEMS
//=======================
function showItemsMenu(player) {
	const form = new ActionFormData()
		.title("Items")
		.body("Choose:")
		.button("Voltar ao Menu", "textures/gui/newgui/undo")
		.button("Capacete de Mergulho", "textures/items/scuba_helmet")
		.button("Chifre das Montarias", "textures/items/mount_horn")
		.button("Espelho Mágico\n(Bugigangas)", "textures/items/magic_mirror")
		.button("Caveira de Netherite\n(Bugigangas)", "textures/items/netherite_skull")
		.button("Bênção do Minerador\n(Bugigangas)", "textures/items/miner_bless")
		.button("Balão\n(Bugigangas)", "textures/items/ballon")
		.button("Amuleto do Coração de Rangedor\n(Bugigangas)", "textures/items/heart_amulet")
		.button("Armadura para Raposa\n", "textures/items/fox_armor")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showMainMenu(player); // Volta
			pagesound(player)
		} else if (response.selection === 1) {
			showScubaHelmet(player)
			pagesound(player)
		} else if (response.selection === 2) {
			showMountHorn(player)
			pagesound(player)
		} else if (response.selection === 3) {
			showMagicMirror(player)
			pagesound(player)
		} else if (response.selection === 4) {
			showNetheriteSkull(player)
			pagesound(player)
		} else if (response.selection === 5) {
			showMinerBless(player)
			pagesound(player)
		} else if (response.selection === 6) {
			showBalloon(player)
			pagesound(player)
		} else if (response.selection === 7) {
			showCreakingHeartAmulet(player)
			pagesound(player)
		} else if (response.selection === 8) {
			showFoxArmor(player)
			pagesound(player)
		}
	});
}

function showScubaHelmet(player) {
	const form = new ActionFormData()
		.title("Capacete de Mergulho")
		.body("§2==============================  \n§r§bCapacete de Mergulho§r\nDá Poder do Conduíte, para você respirar e enxergar melhor na água\n\n§2Receita:\n§r§g1x§r Coração do Mar\n§g1x§r Capacete de Cobre\n§g1x§r Painel de Vidro\n§2==============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showItemsMenu(player); // Volta
			pagesound(player)
		}
	})
}

function showMountHorn(player) {
	const form = new ActionFormData()
		.title("Capacete de Mergulho")
		.body("§2==============================  \n§r§bChifre das Montarias§r\nUm chifre que você vincula à sua montaria§7 (qualquer montaria vanilla)§r e usa para teletransportá-la até você quando estiver longe\n\n§2Uso:\n§r§e1§r. Agache e interaja com a montaria para vinculá-la a você\n§e2.§r Use o chifre para teletransportar a montaria\n\n§2Receita:\n§r§b[ ][ ][§r§eC§r§b]\n[ ][§r§eH§r§b][ ]§r - §eC§r = Lingote de Cobre \n§e[C§r§b][ ][ ]§r - §eH§r = Qualquer Chifre de Cabra \n\n§7(PS: agora as cabras soltam chifres quando morrem)\n§r§2==============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showItemsMenu(player); // Volta
			pagesound(player)
		}
	})
}

function showMagicMirror(player) {
	const form = new ActionFormData()
		.title("Espelho Mágico")
		.body("§2==============================  \n§r§bEspelho Mágico§r\nAo usar, leva você de volta para sua cama ou para o ponto de nascimento do mundo, se não tiver cama\n\n§2Onde encontrar:§r\n- Portais em ruínas\n- Pirâmides\n- Geradores de monstros\n\n§2==============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showItemsMenu(player); // Volta
			pagesound(player)
		}
	})
}

function showNetheriteSkull(player) {
	const form = new ActionFormData()
		.title("Caveira de Netherite")
		.body("§2==============================\n§r§bCaveira de Netherite §r§e(RARA)§r\nDá resistência a fogo e lava quando está na barra rápida\n\n§2Onde encontrar:§r\n- Tesouro do bastião\n- Escambo com piglins\n§2==============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showItemsMenu(player); // Volta
			pagesound(player)
		}
	})
}

function showMinerBless(player) {
	const form = new ActionFormData()
		.title("Bênção do Minerador")
		.body("§2==============================  \n§r§bBênção do Minerador§r\nDá Pressa quando está na barra rápida\n\n§2Onde encontrar:§r\n- Minas abandonadas\n§2============================== ")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showItemsMenu(player); // Volta
			pagesound(player)
		}
	})
}
function showBalloon(player) {
	const form = new ActionFormData()
		.title("Balloon")
		.body("§2==============================\n§r§bBalão§r\nDá Queda Suave quando está na mão\n\n§2Uso:§r dá Levitação por 5 segundos\n§2Recarga:§r 30 s\n\n§2Receita:\n§r§b[ ][§r§eP§r§b][ ]§r§e P§r§7=§r§2 §rPapel\n§b[§r§eP§r§b][§r§eW§r§b][§r§eP§r§b]§r§2 §r§eW§r§7=§r§2 §rCarga de Vento\n§b[ ][§r§eP§r§b][§r§eS§r§b]§r§2 §r§eS§r§7=§r§2 §rLinha\n§2============================== ")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showItemsMenu(player); // Volta
			pagesound(player)
		}
	})
}
function showCreakingHeartAmulet(player) {
	const form = new ActionFormData()
		.title("Amuleto do Coração de Rangedor")
		.body("§2==============================\n§r§bAmuleto do Coração de Rangedor§r\nDá 6 corações extras quando está na barra rápida\n\n§2Uso:§r dá Regeneração por 5 segundos\n§2Recarga:§r 90 s\n\n§2Receita:\n§r§b[ ][§r§eG§r§b][ ]§r§2 §r§eG§r§2 §r§7=§r Lingote de Ouro\n§b[§r§eG§r§b][§r§eA§r§b][§r§eG§r§b]§r§2 §r§eA§r§2 §r§7=§r§2 §rFragmento de Ametista\n§b[ ][§r§eH§r§b][ ]§r§2 §r§eH§r§2 §r§7=§r§2 §rBloco de Coração de Rangedor\n§2==============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showItemsMenu(player); // Volta
			pagesound(player)
		}
	})
}
function showFoxArmor(player) {
	const form = new ActionFormData()
		.title("Armadura para Raposa")
		.body("==============================\n§eArmadura para Raposa§r\n- Raposas podem ser domadas e equipadas com armadura\n- Para ver a durabilidade da armadura, interaja com a raposa sentada segurando um graveto\n- A armadura para raposa é consertada com escamas de tatu, igual à armadura para lobo\n\n§2Receita:\n§r§8[ ][ ][ §r§eS§r§8]\n[§r§eS§r§8][§r§eS§r§8][§r§eS§r§8] = §r§e1x§r§8 §rArmadura para Raposa\n§8[§r§eS§r§8][§r§eB§r§8][§r§eS§r§8]§r\n\n§eS§r - Escama de Tatu\n§eB§r - Bagas Doces\n==============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showItemsMenu(player); // Volta
			pagesound(player)
		}
	})
}
//=========================
// CREDITOS
//=======================

// Exemplo de aba de créditos
function showCredits(player) {
	const form = new MessageFormData()
		.title("Sobre a JFAddons")
		.body("§2==============================  \n§r§cCommon Sense§r é desenvolvido pelo estúdio §eJFAddons.§r\nUm estúdio de uma pessoa só, que faz add-ons para Minecraft Bedrock\n\nAcompanhe as atualizações e os vídeos novos no §cYouTube§r para ficar por dentro das novidades e tutoriais!\n\n§aDoações:§r\nSe quiser apoiar o criador com doações, use a aba de doações no §cYouTube§r ou o §3PayPal:\nE-mail: §rjerryfilho04@gmail.com \n\n§2==============================")
		.button1("Back")
		.button2("Close");

	form.show(player).then((response) => {
		if (response.canceled) return;
		if (response.selection === 0) showMainMenu(player); // Se clicou em Voltar
	});
}