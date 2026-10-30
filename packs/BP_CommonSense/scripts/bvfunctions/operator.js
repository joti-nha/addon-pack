import { world } from '@minecraft/server';

world.afterEvents.playerSpawn.subscribe((event) => {
	const player = event.player;
	if (!player || !player.isValid) return;

	const OP_KEY = "bv:op_world_identifier";
	const assignedId = world.getDynamicProperty(OP_KEY);

	// Se o player tiver XUID usa ele, senão usa o nome (essencial para testes locais/offline)
	const playerIdentifier = (player.xuid && player.xuid !== "") ? player.xuid : player.name;

	// Se ainda não existe um OP registrado no mundo
	if (!assignedId) {
		// Registra o identificador do primeiro jogador
		world.setDynamicProperty(OP_KEY, playerIdentifier);

		if (!player.hasTag("bv:op")) {
			player.addTag("bv:op");
			player.sendMessage("§a[Sistema] Você foi registrado como administrador principal (OP) deste mundo!");
		}
	} else {
		// Verifica se o jogador atual é o dono legítimo
		if (playerIdentifier === assignedId) {
			if (!player.hasTag("bv:op")) {
				player.addTag("bv:op");
			}
		} else {
			// Remove a tag caso outro jogador tente entrar com ela
			if (player.hasTag("bv:op")) {
				player.removeTag("bv:op");
			}
		}
	}
});