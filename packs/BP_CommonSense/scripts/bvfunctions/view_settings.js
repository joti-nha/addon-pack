import { world, system, EntityComponentTypes, EquipmentSlot } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';

// =============================================================================
// --- DEFINIÇÕES DE CÂMERA ---
// =============================================================================

const CAMERA_MODES = [
	{ name: "Clear ('F5' unlocked)", tick: false, vanilla: true, command: `camera @s clear` },
	{ name: "Third Person", tick: false, vanilla: true, command: `camera @s set minecraft:third_person` },
	{ name: "Shoulder View custom", tick: false, vanilla: false, command: `camera @s set bv:shoulder_cam_{DIST}` },
	{ name: "Shoulder View(horse)", tick: false, vanilla: false, command: `camera @s set bv:shoulder_cam_6` }
];

const FEATURE_KEY_8 = "bv:view_respawn_toggle";
const DEFAULT_STATE_8 = false;

const FEATURE_KEY_9 = "bv:horse_cam_toggle";
const DEFAULT_STATE_9 = false;

const FEATURE_KEY_10 = "bv:bow_cam_toggle";
const DEFAULT_STATE_10 = false;

const FEATURE_KEY_DIST = "bv:camera_distance";
const DEFAULT_DIST = 2;

// CONFIGURAÇÃO: Aim Assist
const FEATURE_KEY_AIM = "bv:aim_assist_toggle";
const DEFAULT_AIM = false;

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

// Executa comandos com segurança sem quebrar o script
function safeCommand(player, cmd) {
	try {
		player.runCommand(cmd);
	} catch (e) {
		// Ignora silenciosamente se o comando falhar
	}
}

// Centraliza a mudança de câmera e aplica o Aim Assist com 1 tick de atraso para evitar conflitos
function applyCameraAndAimAssist(player, mode) {
	// 1. Aplica a câmera imediatamente
	if (mode.vanilla) safeCommand(player, "camera @s clear");

	if (mode.command !== "camera @s clear") {
		safeCommand(player, getResolvedCommand(player, mode));
	}

	// 2. Aplica o Aim Assist com 1 tick de atraso para garantir que a câmera já foi processada pela engine
	system.runTimeout(() => {
		if (!player.isValid) return;

		const aimAssistEnabled = player.getDynamicProperty(FEATURE_KEY_AIM) ?? DEFAULT_AIM;
		if (aimAssistEnabled && !mode.vanilla) {
			safeCommand(player, "aimassist @s set 60 60 16 angle bv:aim_preset");
		} else {
			safeCommand(player, "aimassist @s clear");
		}
	}, 1);
}

// =============================================================================
// --- EVENTOS DE INTERAÇÃO (CUSTOM COMPONENT + GLOBAL) ---
// =============================================================================

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

			applyCameraAndAimAssist(player, mode);

			player.onScreenDisplay.setActionBar(`§aModo de câmera: §f${mode.name}`);
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

			const horseIndex = CAMERA_MODES.findIndex(m => m.name === "Shoulder View(horse)");
			if (horseIndex !== -1) {
				setPlayerViewIndex(player, horseIndex);
				const horseMode = CAMERA_MODES[horseIndex];
				applyCameraAndAimAssist(player, horseMode);
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
			applyCameraAndAimAssist(player, mode);
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
		const forceItems = ["minecraft:bow", "minecraft:crossbow", "bv:fireball"];
		const mainType = main?.typeId;
		const isForceItem = mainType && forceItems.includes(mainType);
		const hasSaved = bowForceState.has(player.id);

		if (isForceItem && !hasSaved) {
			const prevIndex = getPlayerViewIndex(player);
			bowForceState.set(player.id, { prevIndex });

			const firstIndex = CAMERA_MODES.findIndex(m => m.name === "Clear ('F5' unlocked)");
			if (firstIndex !== -1) {
				setPlayerViewIndex(player, firstIndex);
				applyCameraAndAimAssist(player, CAMERA_MODES[firstIndex]);
				player.addTag("bv:force_first");
			}
			continue;
		}

		if (!isForceItem && hasSaved) {
			const saved = bowForceState.get(player.id);
			const prev = (saved && typeof saved.prevIndex === "number") ? saved.prevIndex : 0;
			const mode = CAMERA_MODES[prev];

			setPlayerViewIndex(player, prev);
			applyCameraAndAimAssist(player, mode);

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
		const sAim = player.getDynamicProperty(FEATURE_KEY_AIM) ?? DEFAULT_AIM;

		const form = new ModalFormData();
		form.title("§lMinhas Configurações de Visão");

		form.toggle("§fDar o Editor de Visão (ao morrer)", { defaultValue: s8 });
		form.toggle("§fCâmera automática no cavalo", { defaultValue: s9 });
		form.toggle("§fCâmera automática no arco", { defaultValue: s10 });
		form.slider("§fDistância da câmera", 2, 7, { valueStep: 1, defaultValue: sDist });
		form.toggle("§fAtivar assistência de mira", { defaultValue: sAim });

		form.show(player).then(response => {
			if (response.canceled) return;

			system.run(() => {
				const [res8, res9, res10, resDist, resAim] = response.formValues;
				let changeCount = 0;
				let distanceChanged = false;

				if (res8 !== s8) { player.setDynamicProperty(FEATURE_KEY_8, res8); changeCount++; }
				if (res9 !== s9) { player.setDynamicProperty(FEATURE_KEY_9, res9); changeCount++; }
				if (res10 !== s10) { player.setDynamicProperty(FEATURE_KEY_10, res10); changeCount++; }
				if (resAim !== sAim) { player.setDynamicProperty(FEATURE_KEY_AIM, resAim); changeCount++; }

				if (resDist !== sDist) {
					player.setDynamicProperty(FEATURE_KEY_DIST, resDist);
					changeCount++;
					distanceChanged = true;
				}

				if (changeCount > 0) {
					player.onScreenDisplay.setActionBar("§b[Configurações pessoais] Salvas.");

					if (distanceChanged) {
						const currentIndex = getPlayerViewIndex(player);
						const currentMode = CAMERA_MODES[currentIndex];

						if (currentMode.name === "Shoulder View custom") {
							applyCameraAndAimAssist(player, currentMode);
						}
					}
				} else {
					player.onScreenDisplay.setActionBar("§6Nada foi alterado.");
				}
			});
		}).catch(e => {
			console.error("[ViewConfig] Erro na janela da UI: ", e);
		});
	} catch (e) {
		console.error("[ViewConfig] Erro crítico ao construir UI: ", e);
	}
}