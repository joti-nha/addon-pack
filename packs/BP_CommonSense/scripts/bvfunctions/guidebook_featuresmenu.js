import { world, system } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { showMainMenu } from "./guidebook.js";
import { pagesound } from "./guidebook.js";

//=========================
// FEATURES
//=======================
export function showFeaturesMenu(player) {
	const form = new ActionFormData()
		.title("Features")
		.body("Choose:")
		.button("Voltar ao Menu", "textures/gui/newgui/undo")
		.button("Luz Dinâmica", "textures/items/lantern")
		.button("Mão Secundária Melhor", "textures/guidebook/off_hand")
		.button("Pets sem Dano", "textures/items/bone")
		.button("Montarias Melhores", "textures/items/saddle")
		.button("Novos Pets ❤", "textures/items/fox_armor")
		.button("Recursos Menores", "textures/items/paper");

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showMainMenu(player); // Volta
			pagesound(player)
		} else if (response.selection === 1) {
			showDynamicLight(player)
			pagesound(player)
			player.sendMessage("§a");
		} else if (response.selection === 2) {
			showOffHand(player)
			pagesound(player)
		} else if (response.selection === 3) {
			showNoHurt(player)
			pagesound(player)
		} else if (response.selection === 4) {
			showBetterMount(player)
			pagesound(player)
		} else if (response.selection === 5) {
			showNewPets(player)
			pagesound(player)
		} else if (response.selection === 6) {
			showSmallFeatures(player)
			pagesound(player)
		}
	});
}

function showDynamicLight(player) {
	const form = new ActionFormData()
		.title("Luz Dinâmica")
		.body("§a==============================\n    §c(Recurso que se liga nas Configurações)\n\n§f1. Itens que emitem luz iluminam em volta de você quando estão na mão, com níveis de luz diferentes\n\n2. Lanternas também iluminam quando estão na barra rápida, como se estivessem no 'cinto' (isso também pode ser desligado nas configurações)\n\n§aNíveis de luz:\nnív1 §f- chaves, tinta brilhante, líquen brilhante, magma, tocha de redstone, bagas brilhantes, moldura brilhante, maçã dourada encantada\n\n§anív2§f - tocha das almas, pepino-do-mar, pó de pedra luminosa, pó de blaze\n\n§anív3§f - tocha, lanterna das almas, balde de lava, vara de blaze, vara do End, cogumelo luminoso\n\n§anív4§f - lanterna, tocha de cobre, lanternas de cobre oxidado/desgastado, fogueira, lanterna do mar, pedra luminosa, luzes de sapo\n\n§anív5§f - Estrela do Nether\n\n§a===========================\n")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showFeaturesMenu(player); // Volta
			pagesound(player)
		}
	})
}

function showOffHand(player) {
	const form = new ActionFormData()
		.title("Mão Secundária")
		.body("§a==============================\n  §c(RECURSO QUE SE LIGA NAS CONFIGURAÇÕES)\n\n§f1. Você pode usar fogos de artifício na mão secundária para impulsionar o élitro, SE a mão principal estiver com outro item\n\n2. Agache duas vezes para trocar de mão com itens compatíveis\n\n§aItens compatíveis:\n§fTodas as tochas e lanternas, escudos, fogos de artifício, Totem da Imortalidade\n§a==============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showFeaturesMenu(player); // Volta
			pagesound(player)
		}
	})
}

function showNoHurt(player) {
	const form = new ActionFormData()
		.title("Pets sem Dano")
		.body("§2==============================  \n§r§c(RECURSO QUE SE LIGA NAS CONFIGURAÇÕES)§r\n\n1. seus pets e montarias não levam dano de jogadores\n§c(SÓ CRIATURAS VANILLA)§r\n\n§aModo 1§r: os pets e montarias não levam dano de nenhum jogador\n\n§aModo 2: §ros pets e montarias não levam dano só do próprio dono\n§2==============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showFeaturesMenu(player); // Volta
			pagesound(player)
		}
	})
}

function showBetterMount(player) {
	const form = new ActionFormData()
		.title("BetterMount")
		.body("§a==============================\n  \nGhast Feliz:§f\nModos de velocidade: em pé na cabeça do ghast feliz, interaja com um graveto para alternar entre a velocidade vanilla e a velocidade turbinada\n\n§aMontarias com baú:§f\ntodas as montarias podem levar baú\nGhast Feliz: 15 espaços\nCavalos: 9 espaços\nBurro: 18 espaços\nMulas e Camelos: 24 espaços\n\n§aQuebrar folhas (LIGA/DESLIGA)§f\nAs montarias quebram as folhas ao correr por elas\n\n§aCavalos parados:§f\nCavalos domados e selados ficam parados quando nenhum jogador está montado\n\n§a2 cavaleiros:§f\nCavalos, mulas e burros também aguentam 2 cavaleiros\n\n§a==============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showFeaturesMenu(player); // Volta
			pagesound(player)
		}
	})
}

function showNewPets(player) {
	const form = new ActionFormData()
		.title("Recursos Menores")
		.body("§a==============================\nRaposas:§f\nseguem e sentam como lobos, defendem o dono com ataques e botes\n§aDomada com:§f osso (pode mudar no futuro), \n§aComida:§f carnes em geral\n§aVida:§f 20\n§aDano:§f 4:\n\n§aSapos:§f\nseguem e sentam como lobos, defendem o dono com ataques\n§aDomado com:§f osso (pode mudar no futuro),\n§aComida:§f carnes em geral\n§aVida:§f 20\n§aDano:§f 4\n\n§aAxolote:§f\nSegue e senta como lobo, dá regeneração ao jogador quando encostado (recarga de 15 segundos)\n§aDomado com:§f osso (pode mudar),\n§aDesvantagem:§f depois de 8 min o axolote começa a secar e se machuca, então leve água com você (garrafa de água, baldes de água...).\n§aComida:§f peixes\n§aVida:§f 20\n\n§aUrso-Polar:§f\nSegue como lobo, pode ser §amontaria§f ou pet quando está sem cavaleiro, ataca os alvos do jogador como os lobos e também usa o ataque vanilla de \"pisão\" do urso\n§aDomado com:§f osso (pode mudar) / doma de montaria (como cavalos)\n§aComida:§f carnes em geral\n§aVida:§f 30\n§aDano:§f 6\n==============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showFeaturesMenu(player); // Volta
			pagesound(player)
		}
	})
}

function showSmallFeatures(player) {
	const form = new ActionFormData()
		.title("Recursos Menores")
		.body("==============================\n\n§aSaturação do Java:§f\nparecido com o Minecraft Java Edition: ao levar dano, o jogador troca pontos de saturação para recuperar vida\n\n§aTosquiar galinhas:§f\nvocê pode 'bater' na galinha com a tesoura para pegar penas (recarga de 1 min)\n\n§aAtaque com tocha:§f\nbater em qualquer criatura com uma tocha na mão põe fogo nela por 2 segundos\n\n§aConsertar bigorna:§f\nagora você conserta bigornas clicando com o botão direito com um lingote de ferro na mão\n\n§aVisão das almas:§f\nlanterna/tochas das almas dão visão noturna quando estão na mão\n\n§aTotem automático (liga/desliga)§f\nquando há um Totem da Imortalidade na barra rápida e a vida está perigosamente baixa, o sistema põe o totem na mão secundária\n\n§aNomes de aldeões:§f\nagora todos os aldeões nascem com nomes próprios\n\n§aCura da fogueira (liga/desliga)§f\nperto de uma fogueira acesa, o jogador recebe o efeito Regeneração\n\n==============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showFeaturesMenu(player); // Volta
			pagesound(player)
		}
	})
}