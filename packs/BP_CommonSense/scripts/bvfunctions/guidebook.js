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
		.title("Common Sense Guidebook")
		.body("         Welcome to §cCommon Sense§f!\n    Choose a category bellow to start \n        learning about the add-on. \n\n§7All Settings comes disabled by default\n   make sure enable those you want!")
		.button("Recipes", "textures/items/book_normal")
		.button("Features", "textures/items/book_enchanted")
		.button("Items Info", "textures/items/heart_amulet")
		.button("Settings", "textures/items/config")
		.button("About JFAddons", "textures/ui/MCoin"); // Espaço legal para colocar os créditos ou seu canal do YouTube

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
		.button("Back to Menu", "textures/gui/newgui/undo")
		.button("Scuba Helmet", "textures/items/scuba_helmet")
		.button("Mount Horn", "textures/items/mount_horn")
		.button("Magic Mirror\n(Trinkets)", "textures/items/magic_mirror")
		.button("Netherite Skull\n(Trinkets)", "textures/items/netherite_skull")
		.button("Miner Bless\n(Trinkets)", "textures/items/miner_bless")
		.button("Balloon\n(Trinkets)", "textures/items/ballon")
		.button("Creaking Heart Amulet\n(Trinkets)", "textures/items/heart_amulet")
		.button("Fox Armor\n", "textures/items/fox_armor")

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
		.title("Scuba Helmet")
		.body("§2==============================  \n§r§bScuba Helmet§r\nGives you Conduit Power, making you ability to breathe and see better in water\n\n§2Crafting:\n§r§g1x§r Heart of Sea\n§g1x§r Copper Helmet\n§g1x§r Glass Plane\n§2==============================")
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
		.title("Scuba Helmet")
		.body("§2==============================  \n§r§bMount Horn§r\nA horn that you can bind to your mount§7 (any Vanilla mount)§r, and use it to teleport you mount to you when you far from them\n\n§2Use:\n§r§e1§r. Sneak+Interact with the mount to bind them to you\n§e2.§r Use the horn to Teleport your mount\n\n§2Crafting:\n§r§b[ ][ ][§r§eC§r§b]\n[ ][§r§eH§r§b][ ]§r - §eC§r = Copper Ingot \n§e[C§r§b][ ][ ]§r - §eH§r = Any Goat Horn \n\n§7(PS. I added that, now goat horns drops when killing goats)\n§r§2==============================")
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
		.title("Magic Mirror")
		.body("§2==============================  \n§r§bMagic Mirror§r\nWhen used, teleport you back to your bed or your world spawn if you don't have a bed\n\n§2It can be found in:§r\n- Ruined Portals\n- Pyramids\n- Monster spawns\n\n§2==============================")
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
		.title("Netherite Skull")
		.body("§2==============================\n§r§bNetherite Skull §r§e(RARE)§r\nGives you Fire/Lava Resistance when Placed in your hot-bar\n\n§2It can be found in:§r\n- Bastion Treasure\n- Bartering with piglins\n§2==============================")
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
		.title("Miner Bless")
		.body("§2==============================  \n§r§bMiner Bless§r\nGives you Haste when placed in your Hot-bar\n\n§2It can be found in:§r\n- Abandoned Mineshafts\n§2============================== ")
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
		.body("§2==============================\n§r§bBalloon§r\nGives you Feather Falling when holding in hand\n\n§2Use:§r gives you Levitation for 5 Seconds\n§2Cooldown:§r 30 s\n\n§2Crafting:\n§r§b[ ][§r§eP§r§b][ ]§r§e P§r§7=§r§2 §rPaper\n§b[§r§eP§r§b][§r§eW§r§b][§r§eP§r§b]§r§2 §r§eW§r§7=§r§2 §rWind Charge\n§b[ ][§r§eP§r§b][§r§eS§r§b]§r§2 §r§eS§r§7=§r§2 §rString\n§2============================== ")
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
		.title("Creaking Heart Amulet")
		.body("§2==============================\n§r§bCreaking Heart Amulet§r\nGives you 6 extra hearts when in your hot bar\n\n§2Use:§r Gives you regeneration for 5 seconds\n§2Cooldown:§r 90 s\n\n§2Crafting:\n§r§b[ ][§r§eG§r§b][ ]§r§2 §r§eG§r§2 §r§7=§r Gold Ingot\n§b[§r§eG§r§b][§r§eA§r§b][§r§eG§r§b]§r§2 §r§eA§r§2 §r§7=§r§2 §rAmethyst Shard\n§b[ ][§r§eH§r§b][ ]§r§2 §r§eH§r§2 §r§7=§r§2 §rCreaking Heart Block\n§2==============================")
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
		.title("Fox Armor")
		.body("==============================\n§eFox Armor§r\n- Foxes can be tamed and equipped with armor\n- To see the armor durability you have to interact with the fox holding a stick while they're sitting\n- Fox armor can be repaired using Armadillo Scutes, just like the wolf armor\n\n§2Crafting:\n§r§8[ ][ ][ §r§eS§r§8]\n[§r§eS§r§8][§r§eS§r§8][§r§eS§r§8] = §r§e1x§r§8 §rFox Armor\n§8[§r§eS§r§8][§r§eB§r§8][§r§eS§r§8]§r\n\n§eS§r - Armadillo Scute\n§eB§r - Sweet Berries\n==============================")
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
		.title("About JFAddons")
		.body("§2==============================  \n§r§cCommon Sense§r is developed by the studio §eJFAddons.§r\nA studio made up of an independent person who makes Add-ons for Minecraft Bedrock\n\nFollow the updates and new videos on §cYouTube§r to stay up to date with news and usage tutorials!\n\n§aDonations:§r\nIf you want to support the creator through donations, they can be made through the donations tab on §cYouTube§r or via §3PayPal:\nEmail: §rjerryfilho04@gmail.com \n\n§2==============================")
		.button1("Back")
		.button2("Close");

	form.show(player).then((response) => {
		if (response.canceled) return;
		if (response.selection === 0) showMainMenu(player); // Se clicou em Voltar
	});
}