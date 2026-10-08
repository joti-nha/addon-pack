import { world, system } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';

const MENU_ITEM_ID = "bv:config";
const playerCooldowns = new Map(); // Variável para evitar que o menu abra 2x seguidas

const FEATURES = [
	{ key: "bv:give_guide", defaultState: false, label: "Give Guidebook on Death", score: "bv:give_guidebook", prefix: "" },
	{ key: "bv:dynamic_light", defaultState: false, label: "Dynamic Light", score: "bv:dylight", prefix: "[F1] " },
	{ key: "bv:horse_leaves", defaultState: false, label: "Horses Break Leaves", score: "bv:breakleaves", prefix: "[F2] " },
	{ key: "bv:campfire", defaultState: false, label: "Campfire Heal Effect", score: "bv:campheal", prefix: "" },
	{ key: "bv:nohurtpets_owner", defaultState: false, label: "No hurt pets (Owner Only)", score: "bv:nohurtowner", prefix: "" },
	{ key: "bv:no_hurt", defaultState: false, label: "No hurt pets (All Players)", score: "bv:nohurt", prefix: "" },
	{ key: "bv:auto_totem", defaultState: false, label: "Auto Totem of Undying", score: "bv:auto_totem", prefix: "" },
	{ key: "bv:offtorch", defaultState: false, label: "Better Off-hand", score: "bv:off_hand_torch", prefix: "" },
	{ key: "bv:hotbar_lantern", defaultState: false, label: "Lanterns light on Hotbar", score: "bv:dlight_hotbar_toggle", prefix: "" }
];

// 1. REGISTRO CORRETO (V2): Usando startup
system.beforeEvents.startup.subscribe((initEvent) => {
	initEvent.itemComponentRegistry.registerCustomComponent("bv:settings_menu", {
		onUse: (event) => {
			const player = event.source;
			triggerMenu(player);
		}
	});
});

// 2. REDE DE SEGURANÇA: Se o Custom Component falhar, o evento Global pega!
world.afterEvents.itemUse.subscribe((event) => {
	const { source: player, itemStack } = event;
	if (player.typeId === "minecraft:player" && itemStack?.typeId === MENU_ITEM_ID) {
		triggerMenu(player);
	}
});

// 3. CONFIGURAÇÃO CORRETA (V2): Usando worldLoad em vez de worldInitialize
world.afterEvents.worldLoad.subscribe(() => {
	for (const feature of FEATURES) {
		if (world.getDynamicProperty(feature.key) === undefined) {
			world.setDynamicProperty(feature.key, feature.defaultState);
		}
	}
});

// Função intermediária para controlar o atraso de abertura e evitar conflitos
function triggerMenu(player) {
	const now = Date.now();
	// Impede que as duas "armadilhas" abram o menu ao mesmo tempo
	if (playerCooldowns.has(player.id) && now - playerCooldowns.get(player.id) < 500) return;
	playerCooldowns.set(player.id, now);

	system.runTimeout(() => {
		showSimpleToggleMenu(player);
		player.dimension.playSound("block.grindstone.use", player.location);
	}, 5);
}

// A sua interface de UI otimizada
export function showSimpleToggleMenu(player) {
	try {
		const form = new ModalFormData();
		form.title("§lCommon Sense Settings");

		const currentStates = [];
		for (const feature of FEATURES) {
			const state = world.getDynamicProperty(feature.key) ?? feature.defaultState;
			currentStates.push(state);
			form.toggle(`§f${feature.label}`, { defaultValue: state });
		}

		form.show(player).then(response => {
			if (response.canceled) return;

			system.run(() => {
				const { formValues } = response;
				let changeCount = 0;

				for (let i = 0; i < FEATURES.length; i++) {
					const feature = FEATURES[i];
					const newValue = formValues[i];
					const oldValue = currentStates[i];

					if (newValue !== oldValue) {
						world.setDynamicProperty(feature.key, newValue);
						changeCount++;

						const statusText = newValue ? "§aENABLED" : "§cDISABLED";
						player.onScreenDisplay.setActionBar(`§7${feature.prefix}${feature.label}: ${statusText}`);

						const score = newValue ? 2 : 1;
						try {
							player.runCommand(`scoreboard players set .Initialised ${feature.score} ${score}`);
						} catch (e) { }
					}
				}

				if (changeCount === 0) {
					player.onScreenDisplay.setActionBar("§6None Settings have been changed.");
				} else {
					player.sendMessage(`§b[Config] Settings Saved. ${changeCount} Feature(s) Changed.`);
				}
			});
		}).catch(e => {
			console.error("[Config] Erro ao processar o menu: ", e);
			player.sendMessage(`§c[ERRO] A janela da UI falhou: ${e}`);
		});
	} catch (e) {
		console.error("[Config] Erro crítico ao montar a UI: ", e);
		player.sendMessage(`§c[ERRO] Construção da UI falhou: ${e}`);
	}
}