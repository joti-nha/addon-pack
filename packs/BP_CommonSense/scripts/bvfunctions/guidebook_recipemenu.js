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
		.button("Voltar ao Menu", "textures/gui/newgui/undo")
		.button("Receitas Gerais", "textures/items/iron_pickaxe")
		.button("Armaduras para Cavalo", "textures/items/iron_horse_armor")
		.button("Armaduras para Náutilo", "textures/items/nautilus")
		.button("Receitas de Cobre", "textures/items/copper_ingot")
		.button("Escadas Melhores", "textures/guidebook/Stair")
		.button("Flecha de 'Ferro'", "textures/items/arrow")
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
		.body("===============================\n§a'Serra de Madeira'§f\ncolocando troncos e blocos de madeira no CORTADOR DE PEDRAS você faz todas as receitas de madeira mais rápido\n===============================\n§aDesmontar§f\nCom um cortador de pedras vanilla você pode 'desmontar' itens como ferramentas, armaduras, escadas, portas, lajes, botões, cercas, placas de pressão, alçapões etc... e recebe parte dos itens usados\n===============================\n§aCarne em Couro§f\nVocê transforma carne podre em couro na fornalha! \nÉ só pôr a carne podre na fornalha com carvão e esperar\n===============================\n§aFundir Blocos Brutos§f\nvocê pode fundir blocos de minério bruto no alto-forno, que funde mais rápido\n===============================\n§aBloco de Carvão§f\nVocê pode fazer bloco de carvão com carvão vegetal\n===============================\n§aCarvão de Bambu§f\nvocê pode usar bloco de bambu para fazer carvão vegetal, como os outros troncos\n===============================\n§aLinha Fácil§f\nVocê faz linha com uma trepadeira\n===============================\n§aDiscos de Música§r\nTodos os discos podem ser feitos com ardósia profunda polida e corantes.\nMenos o disco 'Relic', que usa netherrack\n===============================")
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
		.title("Armadura para Cavalo")
		.body("§a===============================§f\nVocê pode fabricar armaduras para cavalo de ferro, cobre, ouro e diamante\n(ainda dá para melhorar para netherite na mesa de ferraria)\ne desmontar no cortador de pedras\n\n§aReceita:§f\n§a[§f §a][§f §a][§f1§a]§f\n§a[§f1§a][§f2§a][§f1§a]§f\n§a[§f1§a][§f §a][§f1§a]§f\n1 = Metal (ferro, cobre...)\n2 = Couro\n§a===============================")
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
		.title("Armadura para Náutilo")
		.body("§a===============================§f\nVocê pode fabricar armaduras para náutilo de ferro, cobre, ouro e diamante\n(ainda dá para melhorar para netherite na mesa de ferraria)\ne desmontar no cortador de pedras\n\n§aReceita:§f\n§a[§f1§a][§f1§a][§f1§a]§f\n§a[§f1§a][§f §a][§f1§a]§f\n§a[§f §a][§f1§a][§f1§a]§f\n1 = Metal (ferro, cobre...)\n§a===============================")
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
		.title("Receitas de Cobre")
		.body("§2===============================\n§r§eEtiqueta:§r\nVocê pode fazer etiquetas com cobre no lugar do ferro\n§2Receita:\n§r§8[§r§eC§r§8]§r §eC§r - Lingote de Cobre\n§8[§r§eP§r§8]§r§e P§r - Papel\n§8[§r§eP§r§8]§r\n\nVocê pode fazer trilhos com lingotes de cobre no lugar dos de ouro\n§eTrilhos Elétricos:\n§r§2Receita:\n§r§8[§r§e1§r§8][ ][§r§e1§r§8]\n[§r§e1§r§8][§r§e2§r§8][§r§e1§r§8]§r = 6x Trilho Elétrico\n§8[§r§e1§r§8][§r§e3§r§8][§r§e1§r§8]\n§r§e1§r§2 §r- Lingote de Cobre\n§e2§r§2 §r- Graveto\n§e3§r - Redstone\n\n§eTrilhos Ativadores:\n§r§2Receita:\n§r§8[§r§e1§r§8][§r§e2§r§8][§r§e1§r§8]\n[§r§e1§r§8][§r§e3§r§8][§r§e1§r§8]§r = 6x Trilho Ativador \n§8[§r§e1§r§8][§r§e2§r§8][§r§e1§r§8]\n§r§e1§r§2 §r- Lingote de Cobre\n§e2§r§2 §r- Graveto\n§e3§r - Tocha de Redstone\n\n§eTrilho Detector:\n§r§2Receita:\n§r§8[§r§e1§r§8][ ][§r§e1§r§8]\n[§r§e1§r§8][§r§e3§r§8][§r§e1§r§8]§r = 6x Trilho Detector \n§8[§r§e1§r§8][§r§e2§r§8][§r§e1§r§8]\n§r§e1§r§2 §r- Lingote de Cobre\n§e2§r§2 §r- Redstone\n§e3§r - Placa de Pressão de Pedra\n§2===============================")
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
		.title("Escadas Melhores")
		.body("§a===============================§f\nTodas as escadas vanilla ficam mais baratas e podem ser desmontadas\n\n§aReceita:§f\n§a[§f1§a][§f §a]\n§a[§f1§a][§f1§a]§f = 4x Escadas \n 1 = Qualquer bloco\n\n§aDesmontar:§f\n§a[§f1§a][§f1§a]\n§a[§f1§a][§f1§a]§f = 3x Blocos \n 1 = Quaisquer escadas\n\n§a===============================")
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
		.title("Escadas Melhores")
		.body("§a===============================§f\nVocê fabrica o dobro de flechas usando lingote de ferro no lugar do sílex\n\n§aReceita:§f\n§a[§f1§a][§f2§a][§f3§a]§f= 8x Flecha\n1 = lingote de ferro\n2 = graveto\n3 = pena\n§a===============================")
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
		.body("§2===============================\n§r§eÉlitro:§r\nVocê pode fabricar élitros, mas a receita é de fim de jogo, então ainda precisa ir ao End para fazer um\n\n§e1§r. Primeiro você precisa de 2 Asas de Phantom\n§2Receita:\n§r§8[§r§eM§r§8][§r§eC§r§8][ ] \n[§r§eM§r§8][§r§eM§r§8][§r§eC§r§8] =§r§e 1x§r Asas de Phantom\n§8[ ][§r§eM§r§8][§r§eC§r§8]\n§r§eM§r§8 - §rMembrana de Phantom\n§eC§r§8 - §rFruta do Coro Estourada\n\n2. Depois você precisa de 1 Creme de Magma\n§2Receita:\n§r§8[ ][§r§eM§r§8][ ]\n[§r§eP§r§8][ ][§r§eP§r§8]§r §8= §r§e1x§r Élitro\n \n§eM§r§2 §r- Creme de Magma\n§eP§r§2 §r- Membrana de Phantom\n§2===============================")
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