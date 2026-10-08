import { world, system } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { showMainMenu } from "./guidebook.js";
import { pagesound } from "./guidebook.js";

//=========================
// RECEITAS
//=======================
export function showRecipesMenu(player) {
	const form = new ActionFormData()
		.title("Recipes")
		.body("Choose:")
		.button("Back to Menu", "textures/gui/newgui/undo")
		.button("General Recipes", "textures/items/iron_pickaxe")
		.button("Horse Armors", "textures/items/iron_horse_armor")
		.button("Nautilus Armors", "textures/items/nautilus")
		.button("Copper Recipes", "textures/items/copper_ingot")
		.button("Better Stairs", "textures/guidebook/Stair")
		.button("'Iron' Arrow", "textures/items/arrow")
		.button("Elytra", "textures/items/elytra");

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showMainMenu(player); // Volta
			pagesound(player)
		} else if (response.selection === 1) {
			showGeneralRecipes(player)
			pagesound(player)
			player.sendMessage("§a");
			// Aqui você poderia abrir um MessageFormData mostrando a receita detalhada
		} else if (response.selection === 2) {
			showHorseArmor(player)
			pagesound(player)
		} else if (response.selection === 3) {
			showNautilusArmor(player)
			pagesound(player)
		} else if (response.selection === 4) {
			showCopperRecipes(player)
			pagesound(player)
		} else if (response.selection === 5) {
			showBetterStairs(player)
			pagesound(player)
		} else if (response.selection === 6) {
			showIronArrow(player)
			pagesound(player)
		} else if (response.selection === 7) {
			showElytraRecipe(player)
			pagesound(player)
		}
	});
}

function showGeneralRecipes(player) {
	const form = new ActionFormData()
		.title("General")
		.body("===============================\n§a'Woodcutter'§f\nplacing logs and wood blocks on the STONECUTTER you can make all wood related recipes faster\n===============================\n§aUncraft System§f\nUsing an Vanilla Stonecutter you can 'uncraft' items like, tools, armors, stairs, doors, slabs, buttons, fences, pressure plates, trapdoors etc... and receive part of the used items\n===============================\n§aFlesh to Leather§f\nYou can turn Rotten Flesh to Leather using furnace! \nJust put the rotten leather on furnace with coal and wait\n===============================\n§aBlast Raw Blocks§f\nyou can smelt Raw Ore Blocks in the Blast Furnace, making them smelt faster\n===============================\n§aCoal Block§f\nYou can make coal block using Charcoal\n===============================\n§aBamboo Charcoal§f\nyou can use bamboo block to make charcoal, just like other logs\n===============================\n§aEasy String§f\nYou can make string with one vine\n===============================\n§aMusic Disc§r\nAll music discs can be crafted using Polished Deepslate and Dyes.\nWith exception of the 'Relic' disc that uses Netherack\n===============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showRecipesMenu(player); // Volta
			pagesound(player)
		}
	});
}
function showHorseArmor(player) {
	const form = new ActionFormData()
		.title("Horse Armor")
		.body("§a===============================§f\nYou can craft iron, copper, gold, diamond horse armors\n(you still can upgrade to netherite using smithing table)\nand you can uncraft them using the stonecutter\n\n§aCrafting:§f\n§a[§f §a][§f §a][§f1§a]§f\n§a[§f1§a][§f2§a][§f1§a]§f\n§a[§f1§a][§f §a][§f1§a]§f\n1 = Metal (iron,copper...)\n2 = Leather\n§a===============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showRecipesMenu(player); // Volta
			pagesound(player)
		}
	});
}
function showNautilusArmor(player) {
	const form = new ActionFormData()
		.title("Nautilus Armor")
		.body("§a===============================§f\nYou can craft iron, copper, gold, diamond Nautilus armors\n(you still can upgrade to netherite using smithing table)\nand you can uncraft them using the stonecutter\n\n§aCrafting:§f\n§a[§f1§a][§f1§a][§f1§a]§f\n§a[§f1§a][§f §a][§f1§a]§f\n§a[§f §a][§f1§a][§f1§a]§f\n1 = Metal (iron,copper...)\n§a===============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showRecipesMenu(player); // Volta
			pagesound(player)
		}
	});
}
function showCopperRecipes(player) {
	const form = new ActionFormData()
		.title("Copper Recipes")
		.body("§2===============================\n§r§eNametag:§r\nYou can make nametags using Copper instead of iron\n§2Crafting:\n§r§8[§r§eC§r§8]§r §eC§r - Copper Ingot\n§8[§r§eP§r§8]§r§e P§r - Paper\n§8[§r§eP§r§8]§r\n\nYou can make Rails using copper ingots instead of gold ingots\n§eGolden Rails:\n§r§2Crafting:\n§r§8[§r§e1§r§8][ ][§r§e1§r§8]\n[§r§e1§r§8][§r§e2§r§8][§r§e1§r§8]§r = 6x Golden Rail\n§8[§r§e1§r§8][§r§e3§r§8][§r§e1§r§8]\n§r§e1§r§2 §r- Copper Ingot\n§e2§r§2 §r- Stick\n§e3§r - Redstone\n\n§eActivator Rails:\n§r§2Crafting:\n§r§8[§r§e1§r§8][§r§e2§r§8][§r§e1§r§8]\n[§r§e1§r§8][§r§e3§r§8][§r§e1§r§8]§r = 6x Activator Rails \n§8[§r§e1§r§8][§r§e2§r§8][§r§e1§r§8]\n§r§e1§r§2 §r- Copper Ingot\n§e2§r§2 §r- Stick\n§e3§r - Redstone Torch\n\n§eDetector Rail:\n§r§2Crafting:\n§r§8[§r§e1§r§8][ ][§r§e1§r§8]\n[§r§e1§r§8][§r§e3§r§8][§r§e1§r§8]§r = 6x Activator Rails \n§8[§r§e1§r§8][§r§e2§r§8][§r§e1§r§8]\n§r§e1§r§2 §r- Copper Ingot\n§e2§r§2 §r- Redstone\n§e3§r - Stone Pressure Plate\n§2===============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showRecipesMenu(player); // Volta
			pagesound(player)
		}
	});
}
function showBetterStairs(player) {
	const form = new ActionFormData()
		.title("Better Stairs")
		.body("§a===============================§f\nAll vanilla Stairs blocks are cheaper and can be uncrafted\n\n§aCrafting:§f\n§a[§f1§a][§f §a]\n§a[§f1§a][§f1§a]§f = 4x Stairs \n 1 = Any block\n\n§aUncrafting:§f\n§a[§f1§a][§f1§a]\n§a[§f1§a][§f1§a]§f = 3x Blocks \n 1 = Any Stairs\n\n§a===============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showRecipesMenu(player); // Volta
			pagesound(player)
		}
	});
}
function showIronArrow(player) {
	const form = new ActionFormData()
		.title("Better Stairs")
		.body("§a===============================§f\nYou can Craft the double of arrows using iron ingot instead of flint\n\n§aCrafting:§f\n§a[§f1§a][§f2§a][§f3§a]§f= 8x Arrow\n1 = iron ingot\n2 = stick\n3 = Feather\n§a===============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showRecipesMenu(player); // Volta
			pagesound(player)
		}
	});
}
function showElytraRecipe(player) {
	const form = new ActionFormData()
		.title("ElytraRecipe")
		.body("§2===============================\n§r§eElytra:§r\nYou can make Elytra's, but the craft is end-game, so you still have to go to the end to craft one\n\n§e1§r. First you will need 2 Phantom Wings\n§2Crafting:\n§r§8[§r§eM§r§8][§r§eC§r§8][ ] \n[§r§eM§r§8][§r§eM§r§8][§r§eC§r§8] =§r§e 1x§r Phantom Wings\n§8[ ][§r§eM§r§8][§r§eC§r§8]\n§r§eM§r§8 - §rPhantom Membrane\n§eC§r§8 - §rPopped Chorus Fruit\n\n2. Then you will need 1 Magma Cream\n§2Crafting:\n§r§8[ ][§r§eM§r§8][ ]\n[§r§eP§r§8][ ][§r§eP§r§8]§r §8= §r§e1x§r Elytra\n \n§eM§r§2 §r- Magma Cream\n§eP§r§2 §r- Phantom Membrane\n§2===============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showRecipesMenu(player); // Volta
			pagesound(player)
		}
	});
}
//=========================
// RECEITAS FIM
//=======================