import { world, system } from "@minecraft/server";
import { CustomForm, ObservableString } from "@minecraft/server-ui";

import { showSettingsMenu } from "./settings.js";
import { showRecipesMenu } from "./guidebook_recipemenu.js";
import { showFeaturesMenu } from "./guidebook_featuresmenu.js";

// ID do item que vai abrir o guia (pode ser um item customizado seu)
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

//=========================
// HELPERS
//=======================

// Cria um formulário com título em negrito
export function createPage(player, title) {
	return new CustomForm(player, `§l${title}`);
}

// Adiciona o botão X/fechar e mostra o formulário
export function openPage(form) {
	form.closeButton();
	form.show().catch((e) => console.error("[Guidebook] Erro ao mostrar a UI: ", e));
}

// Fecha o formulário atual e abre outro logo depois.
// O pequeno atraso evita abrir duas UIs ao mesmo tempo.
export function goTo(form, next) {
	try { form.close(); } catch (e) { }
	system.runTimeout(next, 2);
}

//=========================
// MENU PRINCIPAL
//=======================
export function showMainMenu(player) {
	const isOp = player.hasTag("bv:op");
	const form = createPage(player, "Guia do Common Sense");

	form.label("Bem-vindo ao §cCommon Sense§f!\nEscolha uma categoria abaixo para conhecer o add-on.\n");
	form.label("§7Ative nas configurações os recursos que você quiser!");
	form.divider();

	form.button("Receitas", () => {
		pagesound(player);
		goTo(form, () => showRecipesMenu(player));
	});

	form.button("Recursos", () => {
		goTo(form, () => showFeaturesMenu(player));
	});

	form.button("Informações dos Itens", () => {
		pagesound(player);
		goTo(form, () => showItemsMenu(player));
	});

	form.button("Configurações", () => {
		// Verifica se o player tem a tag de OP antes de abrir as configurações
		if (!player.hasTag("bv:op")) {
			player.sendMessage("§c[Erro] Você não é OP");
			return;
		}
		goTo(form, () => showSettingsMenu(player));
	});

	// Botão Give Op só aparece para OPs
	if (isOp) {
		form.button("Dar OP", () => {
			if (!player.hasTag("bv:op")) {
				player.sendMessage("§c[Erro] Você não é OP");
				return;
			}
			pagesound(player);
			goTo(form, () => showOpManagerMenu(player));
		});
	}

	form.button("Sobre a JFAddons", () => {
		goTo(form, () => showCredits(player));
	});

	openPage(form);
}

//=========================
// GERENCIAMENTO DE OP
//=======================
function showOpManagerMenu(player) {
	const form = createPage(player, "Gerenciar OPs");

	form.label("Gerenciamento de operadores do Common Sense");
	form.divider();

	form.button("Dar OP", () => {
		pagesound(player);
		goTo(form, () => showOpInputPage(player, "give"));
	});

	form.button("Tirar OP", () => {
		pagesound(player);
		goTo(form, () => showOpInputPage(player, "remove"));
	});

	form.button("Voltar ao Menu", () => {
		pagesound(player);
		goTo(form, () => showMainMenu(player));
	});

	openPage(form);
}

function showOpInputPage(player, actionType) {
	const form = createPage(player, actionType === "give" ? "Dar OP" : "Tirar OP");

	// clientWritable: true permite que o campo de texto altere o valor
	const nameInput = new ObservableString("", { clientWritable: true });
	form.textField("Nome do jogador:", nameInput, { description: "Ex.: Steve" });
	form.divider();

	form.button("Confirmar", () => {
		processOpAction(player, actionType, nameInput.getData());
		goTo(form, () => showOpManagerMenu(player));
	});

	form.button("Voltar", () => {
		goTo(form, () => showOpManagerMenu(player));
	});

	openPage(form);
}

function processOpAction(player, actionType, username) {
	if (!username || username.trim() === "") {
		player.sendMessage("§c[Erro] O nome não pode ficar vazio");
		return;
	}

	// Procura o player online pelo nome
	const target = world.getAllPlayers().find(
		(p) => p.name.toLowerCase() === username.trim().toLowerCase()
	);

	if (!target) {
		player.sendMessage(`§c[Erro] Jogador "${username}" não encontrado ou offline`);
		return;
	}

	if (actionType === "give") {
		if (target.hasTag("bv:op")) {
			player.sendMessage(`§e${target.name} já é OP.`);
		} else {
			target.addTag("bv:op");
			player.sendMessage(`§a[Sistema] ${target.name} agora é OP!`);
			target.sendMessage("§a[Sistema] Agora você é administrador (OP)!");
		}
	} else {
		if (!target.hasTag("bv:op")) {
			player.sendMessage(`§e${target.name} não é OP.`);
		} else {
			target.removeTag("bv:op");
			player.sendMessage(`§a[Sistema] ${target.name} não é mais OP!`);
			target.sendMessage("§c[Sistema] Você não é mais OP");
		}
	}
}

//=========================
// ITEMS
//=======================
const ITEMS = [
	{
		name: "Capacete de Mergulho",
		text: "§bCapacete de Mergulho§r\nDá Poder do Conduíte, para você respirar e enxergar melhor na água\n\n§2Receita:\n§r§g1x§r Coração do Mar\n§g1x§r Capacete de Cobre\n§g1x§r Painel de Vidro"
	},
	{
		name: "Chifre das Montarias",
		text: "§bChifre das Montarias§r\nUm chifre que você vincula à sua montaria§7 (qualquer montaria vanilla)§r e usa para teletransportá-la até você quando estiver longe\n\n§2Uso:\n§r§e1§r. Agache e interaja com a montaria para vinculá-la a você\n§e2.§r Use o chifre para teletransportar a montaria\n\n§2Receita:\n§r§b[ ][ ][§r§eC§r§b]\n[ ][§r§eH§r§b][ ]§r - §eC§r = Lingote de Cobre \n§e[C§r§b][ ][ ]§r - §eH§r = Qualquer Chifre de Cabra \n\n§7(PS: agora as cabras soltam chifres quando morrem)"
	},
	{
		name: "Espelho Mágico",
		tag: "Trinkets",
		text: "§bEspelho Mágico§r\nAo usar, leva você de volta para sua cama ou para o ponto de nascimento do mundo, se não tiver cama\n\n§2Onde encontrar:§r\n- Pirâmides\n- Geradores de monstros"
	},
	{
		name: "Caveira de Netherite",
		tag: "Trinkets",
		text: "§bCaveira de Netherite §r§e(RARA)§r\nDá resistência a fogo e lava quando está na barra rápida\n\n§2Onde encontrar:§r\n- Tesouro do bastião\n- Escambo com piglins"
	},
	{
		name: "Bênção do Minerador",
		tag: "Trinkets",
		text: "§bBênção do Minerador§r\nDá Pressa quando está na barra rápida\n\n§2Onde encontrar:§r\n- Minas abandonadas"
	},
	{
		name: "Balão",
		tag: "Trinkets",
		text: "§bBalão§r\nDá Queda Suave quando está na mão\n\n§2Uso:§r dá Levitação por 5 segundos\n§2Recarga:§r 30 s\n\n§2Receita:\n§r§b[ ][§r§eP§r§b][ ]§r§e P§r§7=§r§2 §rPapel\n§b[§r§eP§r§b][§r§eW§r§b][§r§eP§r§b]§r§2 §r§eW§r§7=§r§2 §rCarga de Vento\n§b[ ][§r§eP§r§b][§r§eS§r§b]§r§2 §r§eS§r§7=§r§2 §rLinha"
	},
	{
		name: "Amuleto do Coração de Rangedor",
		tag: "Trinkets",
		text: "§bAmuleto do Coração de Rangedor§r\nDá 6 corações extras quando está na barra rápida\n\n§2Uso:§r dá Regeneração por 5 segundos\n§2Recarga:§r 90 s\n\n§2Receita:\n§r§b[ ][§r§eG§r§b][ ]§r§2 §r§eG§r§2 §r§7=§r Lingote de Ouro\n§b[§r§eG§r§b][§r§eA§r§b][§r§eG§r§b]§r§2 §r§eA§r§2 §r§7=§r§2 §rFragmento de Ametista\n§b[ ][§r§eH§r§b][ ]§r§2 §r§eH§r§2 §r§7=§r§2 §rBloco de Coração de Rangedor"
	},
	{
		name: "Armadura para Raposa",
		text: "§eArmadura para Raposa§r\n- Raposas podem ser domadas e equipadas com armadura\n- A armadura para raposa é consertada com escamas de tatu, igual à armadura para lobo\n\n§2Receita:\n§r§8[ ][ ][ §r§eS§r§8]\n[§r§eS§r§8][§r§eS§r§8][§r§eS§r§8] = §r§e1x§r§8 §rArmadura para Raposa\n§8[§r§eS§r§8][§r§eB§r§8][§r§eS§r§8]§r\n\n§eS§r - Escama de Tatu\n§eB§r - Bagas Doces"
	}
];

function showItemsMenu(player) {
	const form = createPage(player, "Itens");

	form.label("Escolha:");

	// Botões não aceitam códigos de cor (§) nem quebra de linha,
	// então os itens são agrupados por seção em vez de ter a tag no nome do botão.
	const addButtons = (list) => {
		for (const item of list) {
			form.button(item.name, () => {
				pagesound(player);
				goTo(form, () => showItemPage(player, item));
			});
		}
	};

	form.divider();
	form.header("Itens");
	addButtons(ITEMS.filter((item) => !item.tag));

	form.divider();
	form.header("Bugigangas");
	addButtons(ITEMS.filter((item) => item.tag === "Trinkets"));

	form.divider();
	form.button("Voltar ao Menu", () => {
		pagesound(player);
		goTo(form, () => showMainMenu(player));
	});

	openPage(form);
}

function showItemPage(player, item) {
	const form = createPage(player, item.name);

	form.label(item.text);
	form.divider();

	form.button("Voltar", () => {
		pagesound(player);
		goTo(form, () => showItemsMenu(player));
	});

	openPage(form);
}

//=========================
// CREDITOS
//=======================
function showCredits(player) {
	const form = createPage(player, "Sobre a JFAddons");

	form.label("O §cCommon Sense§r é desenvolvido pelo estúdio §eJFAddons.§r Um estúdio formado §esó por mim, Jerry.§r\n\n '§eespero que todos se divirtam e curtam meus projetos :)§e§r'");
	form.divider();
	form.label("Acompanhe as atualizações e os vídeos novos no §cYouTube§r para ficar por dentro das novidades e tutoriais!");
	form.divider();
	form.label("§aDoações:§r\nSe quiser apoiar o criador com doações, use a aba de doações no §cYouTube §r ou\n §3PayPal:\nE-mail: §rjerryfilho04@gmail.com \n §3Kofi: §rko-fi.com/jerryfonsecafilho");
	form.divider();

	form.button("Voltar", () => {
		goTo(form, () => showMainMenu(player));
	});

	openPage(form);
}