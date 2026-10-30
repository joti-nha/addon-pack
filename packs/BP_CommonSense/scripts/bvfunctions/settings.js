import { world, system } from '@minecraft/server';
import { CustomForm, ObservableBoolean } from '@minecraft/server-ui';

const MENU_ITEM_ID = "bv:config";
const playerCooldowns = new Map();
const openMenus = new Set(); // evita abrir o menu duas vezes para o mesmo jogador

const FEATURES = [
	{ key: "bv:give_guide", defaultState: false, label: "Dar o Guia ao Morrer", desc: "Dá o guia automaticamente quando você renasce.", score: "bv:give_guidebook", prefix: "" },
	{ key: "bv:dynamic_light", defaultState: false, label: "Luz Dinâmica", desc: "Itens que emitem luz iluminam a área quando estão na mão.", score: "bv:dylight", prefix: "[F1] " },
	{ key: "bv:horse_leaves", defaultState: false, label: "Cavalos Quebram Folhas", desc: "Os cavalos quebram sozinhos as folhas por onde você passa montado.", score: "bv:breakleaves", prefix: "[F2] " },
	{ key: "bv:campfire", defaultState: true, label: "Cura da Fogueira", desc: "Ficar perto de uma fogueira dá Regeneração.", score: "bv:campheal", prefix: "" },
	{ key: "bv:nohurtpets_owner", defaultState: true, label: "Não Ferir Pets (Dono)", desc: "Impede que o dono machuque os próprios pets sem querer.", score: "bv:nohurtowner", prefix: "" },
	{ key: "bv:no_hurt", defaultState: false, label: "Não Ferir Pets (Todos)", desc: "Impede que qualquer jogador machuque qualquer pet.", score: "bv:nohurt", prefix: "" },
	{ key: "bv:auto_totem", defaultState: false, label: "Totem da Imortalidade Automático", desc: "Equipa sozinho um totem do inventário quando você leva um dano fatal.", score: "bv:auto_totem", prefix: "" },
	{ key: "bv:offtorch", defaultState: true, label: "Mão Secundária Melhor", desc: "Permite colocar tochas e usar outros blocos com a mão secundária.", score: "bv:off_hand_torch", prefix: "" },
	{ key: "bv:hotbar_lantern", defaultState: false, label: "Lanternas Iluminam na Barra Rápida", desc: "As lanternas emitem luz só de estarem na barra rápida.", score: "bv:dlight_hotbar_toggle", prefix: "" },
	{ key: "bv:java_saturation", defaultState: false, label: "Saturação do Java", desc: "Deixa a saturação e a regeneração de vida iguais às da Java Edition.", score: "bv:java_saturation_toggle", prefix: "" }
];

world.afterEvents.itemUse.subscribe((event) => {
	const { source: player, itemStack } = event;
	if (player.typeId === "minecraft:player" && itemStack?.typeId === MENU_ITEM_ID) {
		triggerMenu(player);
	}
});

world.afterEvents.worldLoad.subscribe(() => {
	const firstTime = [];
	for (const feature of FEATURES) {
		if (world.getDynamicProperty(feature.key) === undefined) {
			world.setDynamicProperty(feature.key, feature.defaultState);
			firstTime.push(feature);
		}
	}
	// [Addon Pack] Padrões pré-configurados: os recursos ligados por padrão também precisam do placar
	// (o menu só grava o placar ao alternar). Espera as funções de início criarem os objetivos.
	if (firstTime.length > 0) {
		system.runTimeout(() => {
			for (const feature of firstTime) {
				if (!feature.defaultState) continue;
				try {
					world.getDimension("overworld").runCommand(`scoreboard players set .Initialised ${feature.score} 2`);
				} catch (e) { }
			}
		}, 200);
	}
});

function triggerMenu(player) {
	const now = Date.now();
	if (playerCooldowns.has(player.id) && now - playerCooldowns.get(player.id) < 500) return;
	playerCooldowns.set(player.id, now);

	system.runTimeout(() => {
		showSettingsMenu(player);
		player.dimension.playSound("block.grindstone.use", player.location);
	}, 5);
}

// Aplica uma mudança de toggle (salva a propriedade, atualiza o scoreboard e avisa o jogador)
function applyFeatureChange(player, feature, newValue) {
	world.setDynamicProperty(feature.key, newValue);

	const statusText = newValue ? "§aATIVADO" : "§cDESATIVADO";
	player.onScreenDisplay.setActionBar(`§7${feature.prefix}${feature.label}: ${statusText}`);

	const score = newValue ? 2 : 1;
	try {
		// Atenção ao espaço entre o objetivo e o valor
		player.runCommand(`scoreboard players set .Initialised ${feature.score} ${score}`);
	} catch (e) { }
}

export function showSettingsMenu(player) {
	if (openMenus.has(player.id)) return;

	try {
		const form = new CustomForm(player, "§lConfigurações do Common Sense");

		// clientWritable: true é obrigatório para o toggle poder alterar o valor do observable
		const observables = FEATURES.map((feature) => {
			const state = world.getDynamicProperty(feature.key) ?? feature.defaultState;
			return new ObservableBoolean(state, { clientWritable: true });
		});

		let changeCount = 0;

		FEATURES.forEach((feature, i) => {
			const observable = observables[i];

			// "description" cria o texto cinza embaixo do título, igual à imagem
			form.toggle(feature.label, observable, { description: feature.desc });

			// Quando o jogador mexe no toggle, aplica na hora
			observable.subscribe((newValue) => {
				system.run(() => {
					changeCount++;
					applyFeatureChange(player, feature, newValue);
				});
			});

			// Linha divisória entre as opções
			if (i < FEATURES.length - 1) form.divider();
		});

		// Botão "X" no canto + botão de fechar no final
		form.closeButton();

		openMenus.add(player.id);

		form.show()
			.then(() => {
				openMenus.delete(player.id);
				if (changeCount > 0) {
					system.run(() => player.sendMessage(`§b[Config] Configurações salvas. ${changeCount} alteração(ões) aplicada(s).`));
				}
			})
			.catch((e) => {
				openMenus.delete(player.id);
				console.error("[Config] Erro ao processar o menu: ", e);
				system.run(() => player.sendMessage(`§c[ERRO] A janela da UI falhou: ${e}`));
			});
	} catch (e) {
		openMenus.delete(player.id);
		console.error("[Config] Erro crítico ao montar a UI: ", e);
		player.sendMessage(`§c[ERRO] Construção da UI falhou: ${e}`);
	}
}