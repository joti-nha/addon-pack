import { world, system, EntityComponentTypes, EquipmentSlot } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';

// =============================================================================
// --- DEFINIÇÕES DE CÂMERA ---
// =============================================================================

const CAMERA_MODES = [
	{ name: "Clear ('F5' unlocked)", tick: false, vanilla: true, command: `camera @s clear` },
	{ name: "Third Person", tick: false, vanilla: true, command: `camera @s set minecraft:third_person` },
	{ name: "Third Person(Front)", tick: false, vanilla: true, command: `camera @s set minecraft:third_person_front` },

	// A MÁGICA ACONTECE AQUI: 
	// 1. tick mudou para FALSE (Fim do lag de câmera!)
	// 2. O comando agora chama o preset customizado, e o seu script vai preencher o número no final automaticamente.
	{ name: "Shoulder View custom", tick: false, vanilla: false, command: `camera @s set bv:shoulder_cam_{DIST}` },

	// Caso queira fazer o mesmo para o cavalo depois, crie um JSON para ele e mude o tick para false também.
	// Por enquanto, mantive o seu comando original para não quebrar.
	{ name: "Shoulder View(horse)", tick: false, vanilla: false, command: `camera @s set bv:shoulder_cam_6` },

	{ name: "First Person", tick: false, vanilla: true, command: `camera @s set minecraft:first_person` },
];

const FEATURE_KEY_8 = "bv:view_respawn_toggle";
const DEFAULT_STATE_8 = false;

const FEATURE_KEY_9 = "bv:horse_cam_toggle";
const DEFAULT_STATE_9 = false;

const FEATURE_KEY_10 = "bv:bow_cam_toggle";
const DEFAULT_STATE_10 = false;

const FEATURE_KEY_DIST = "bv:camera_distance";
const DEFAULT_DIST = 2;

const VIEW_ITEM_ID = "bv:view";
const playerCooldowns = new Map();

function getPlayerViewIndex(player) {
	for (let i = 0; i < CAMERA_MODES.length; i++) {
		if (player.hasTag(`bv:view_${CAMERA_MODES[i].name}`)) return i;
	}
	return 0;
}

function setPlayerViewIndex(player, index) {
	for (const mode of CAMERA_MODES) {
		player.removeTag(`bv:view_${mode.name}`);
	}
	player.addTag(`bv:view_${CAMERA_MODES[index].name}`);
}

function getResolvedCommand(player, mode) {
	if (!mode.command.includes("{DIST}")) return mode.command;
	const dist = player.getDynamicProperty(FEATURE_KEY_DIST) ?? DEFAULT_DIST;
	return mode.command.replace("{DIST}", dist);
}

function getMainhandItem(player) {
	try {
		const equip = player.getComponent(EntityComponentTypes.Equippable);
		if (!equip) return null;
		const slot = equip.getEquipmentSlot(EquipmentSlot.Mainhand);
		return slot.hasItem() ? slot.getItem() : null;
	} catch (e) {
		return null;
	}
}

// NOVA FUNÇÃO: Executa comandos com segurança sem quebrar o script
function safeCommand(player, cmd) {
	try {
		player.runCommand(cmd);
	} catch (e) {
		// Ignora silenciosamente se o comando falhar (ex: limpar uma câmera já limpa)
	}
}

// =============================================================================
// --- EVENTOS DE INTERAÇÃO (CUSTOM COMPONENT + GLOBAL) ---
// =============================================================================

system.beforeEvents.startup.subscribe((initEvent) => {
	initEvent.itemComponentRegistry.registerCustomComponent("bv:view_menu", {
		onUse: (event) => {
			handleViewInteraction(event.source);
		}
	});
});

world.afterEvents.itemUse.subscribe((event) => {
	const player = event.source;
	if (player.typeId === "minecraft:player" && event.itemStack?.typeId === VIEW_ITEM_ID) {
		handleViewInteraction(player);
	}
});

function handleViewInteraction(player) {
	const now = Date.now();
	if (playerCooldowns.has(player.id) && now - playerCooldowns.get(player.id) < 500) return;
	playerCooldowns.set(player.id, now);

	if (player.isSneaking) {
		system.runTimeout(() => {
			showViewMenu(player);
		}, 5);
	} else {
		system.run(() => {
			let current = getPlayerViewIndex(player);
			let next = (current + 1) % CAMERA_MODES.length;

			setPlayerViewIndex(player, next);
			const mode = CAMERA_MODES[next];

			// 1. Tenta limpar a câmera (se falhar porque já está limpa, o safeCommand absorve)
			if (mode.vanilla) safeCommand(player, "camera @s clear");

			// 2. Se o comando não for apenas "limpar", ele aplica a nova câmera
			if (mode.command !== "camera @s clear") {
				safeCommand(player, getResolvedCommand(player, mode));
			}

			player.onScreenDisplay.setActionBar(`§aCamera Mode: §f${mode.name}`);
		});
	}
}
// =============================================================================
// --- LÓGICA AUTOMÁTICA (LOOPS) ---
// =============================================================================

system.runInterval(() => {
	for (const player of world.getPlayers()) {
		const isEnabled = player.getDynamicProperty(FEATURE_KEY_9) ?? DEFAULT_STATE_9;
		if (!isEnabled) continue;

		const ents = player.dimension.getEntities({ tags: ["mount"], location: player.location, maxDistance: 2 });
		const isNearMount = ents.length > 0;
		const hasMountedTag = player.hasTag("mounted");

		if (isNearMount && !hasMountedTag) {
			player.addTag("mounted");
			const prevIndex = getPlayerViewIndex(player);
			player.addTag(`prevview_${prevIndex}`);

			// CORREÇÃO: Puxando o índice correto para o cavalo
			const horseIndex = CAMERA_MODES.findIndex(m => m.name === "Shoulder View(horse)");
			if (horseIndex !== -1) {
				setPlayerViewIndex(player, horseIndex);
				safeCommand(player, getResolvedCommand(player, CAMERA_MODES[horseIndex]));
			}
		}

		if (!isNearMount && hasMountedTag) {
			player.removeTag("mounted");
			let prevIndex = 0;
			for (let i = 0; i < CAMERA_MODES.length; i++) {
				if (player.hasTag(`prevview_${i}`)) {
					prevIndex = i;
					player.removeTag(`prevview_${i}`);
					break;
				}
			}
			const mode = CAMERA_MODES[prevIndex];

			if (mode.vanilla) safeCommand(player, "camera @s clear");
			if (mode.command !== "camera @s clear") safeCommand(player, getResolvedCommand(player, mode));

			setPlayerViewIndex(player, prevIndex);
		}
	}
}, 2);

const bowForceState = new Map();
system.runInterval(() => {
	for (const player of world.getPlayers()) {
		const isEnabled = player.getDynamicProperty(FEATURE_KEY_10) ?? DEFAULT_STATE_10;
		if (!isEnabled) continue;

		const main = getMainhandItem(player);
		const forceItems = ["minecraft:bow", "minecraft:crossbow"];
		const mainType = main?.typeId;
		const isForceItem = mainType && forceItems.includes(mainType);
		const hasSaved = bowForceState.has(player.id);

		if (isForceItem && !hasSaved) {
			const prevIndex = getPlayerViewIndex(player);
			bowForceState.set(player.id, { prevIndex });

			const firstIndex = CAMERA_MODES.findIndex(m => m.name === "Clear ('F5' unlocked)");
			if (firstIndex !== -1) {
				setPlayerViewIndex(player, firstIndex);
				safeCommand(player, "camera @s clear");
				player.addTag("bv:force_first");
			}
			continue;
		}

		if (!isForceItem && hasSaved) {
			const saved = bowForceState.get(player.id);
			const prev = (saved && typeof saved.prevIndex === "number") ? saved.prevIndex : 0;
			const mode = CAMERA_MODES[prev];

			setPlayerViewIndex(player, prev);

			if (mode.vanilla) safeCommand(player, "camera @s clear");
			if (mode.command !== "camera @s clear") safeCommand(player, getResolvedCommand(player, mode));

			bowForceState.delete(player.id);
			player.removeTag("bv:force_first");
		}
	}
}, 2);

system.runInterval(() => {
	for (const player of world.getPlayers()) {
		const index = getPlayerViewIndex(player);
		const mode = CAMERA_MODES[index];
		if (mode && mode.tick) {
			safeCommand(player, getResolvedCommand(player, mode));
		}
	}
}, 1);

world.afterEvents.playerSpawn.subscribe((event) => {
	const player = event.player;
	if (!event.initialSpawn) {
		const isEnabled = player.getDynamicProperty(FEATURE_KEY_8) ?? DEFAULT_STATE_8;
		if (isEnabled) {
			// Lógica para dar item ao morrer
		}
	}
});

// =============================================================================
// --- MENU DE CONFIGURAÇÃO (FORM) ---
// =============================================================================

function showViewMenu(player) {
	try {
		const s8 = player.getDynamicProperty(FEATURE_KEY_8) ?? DEFAULT_STATE_8;
		const s9 = player.getDynamicProperty(FEATURE_KEY_9) ?? DEFAULT_STATE_9;
		const s10 = player.getDynamicProperty(FEATURE_KEY_10) ?? DEFAULT_STATE_10;
		const sDist = player.getDynamicProperty(FEATURE_KEY_DIST) ?? DEFAULT_DIST;

		const form = new ModalFormData();
		form.title("§lMy View Settings");

		form.toggle("§fGive View Changer(onDeath)", { defaultValue: s8 });
		form.toggle("§fAuto Horse Camera", { defaultValue: s9 });
		form.toggle("§fAuto Bow Camera", { defaultValue: s10 });
		form.slider("§fCamera Distance", 2, 7, { valueStep: 1, defaultValue: sDist });

		form.show(player).then(response => {
			if (response.canceled) return;

			system.run(() => {
				const [res8, res9, res10, resDist] = response.formValues;
				let changeCount = 0;
				let distanceChanged = false; // Flag para rastrear se o slider mexeu

				if (res8 !== s8) { player.setDynamicProperty(FEATURE_KEY_8, res8); changeCount++; }
				if (res9 !== s9) { player.setDynamicProperty(FEATURE_KEY_9, res9); changeCount++; }
				if (res10 !== s10) { player.setDynamicProperty(FEATURE_KEY_10, res10); changeCount++; }

				if (resDist !== sDist) {
					player.setDynamicProperty(FEATURE_KEY_DIST, resDist);
					changeCount++;
					distanceChanged = true; // Confirma que o zoom foi alterado
				}

				if (changeCount > 0) {
					player.onScreenDisplay.setActionBar("§b[Personal Settings] Saved.");

					// SE O ZOOM MUDOU, ATUALIZA A CÂMERA NA HORA
					if (distanceChanged) {
						const currentIndex = getPlayerViewIndex(player);
						const currentMode = CAMERA_MODES[currentIndex];

						// Checa se o jogador está com a câmera customizada ativa
						if (currentMode.name === "Shoulder View custom") {
							// Limpa a câmera antes para evitar que o Minecraft recuse a atualização
							safeCommand(player, "camera @s clear");
							// Aplica o novo JSON (ex: commonsense:camera_ombro_5)
							safeCommand(player, getResolvedCommand(player, currentMode));
						}
					}
				} else {
					player.onScreenDisplay.setActionBar("§6No changes were made.");
				}
			});
		}).catch(e => {
			console.error("[ViewConfig] Erro na janela da UI: ", e);
		});
	} catch (e) {
		console.error("[ViewConfig] Erro crítico ao construir UI: ", e);
	}
}