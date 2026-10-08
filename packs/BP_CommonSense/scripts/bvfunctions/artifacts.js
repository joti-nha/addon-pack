import { world } from '@minecraft/server';

// Na nova API, 'itemCompleteUse' é o evento ideal para itens consumíveis,
// substituindo o 'itemStopUse' com verificação de duração zero.
world.afterEvents.itemCompleteUse.subscribe((eventData) => {
	const { itemStack, source: player } = eventData;

	// Garante que quem usou o item foi um jogador (evita bugs com mobs usando itens)
	if (player?.typeId !== "minecraft:player") return;

	try {
		// Honey Bottle (Efeito de regeneração)
		if (itemStack.typeId === "minecraft:honey_bottle") {
			player.addEffect('minecraft:regeneration', 40, { duration: 3, amplifier: 2 });
			player.dimension.spawnParticle('minecraft:mob_portal', player.location);
		}

		// Heart Amulet (Efeito de cura - customizado)
		if (itemStack.typeId === "bv:heart_amulet") {
			// Usar addEffect direto é mais rápido e confiável que o runCommand
			player.addEffect('minecraft:instant_health', 1, { amplifier: 3 });
			player.dimension.spawnParticle('minecraft:mob_portal', player.location);
		}

		// Balloon (Efeito de levitação - customizado)
		if (itemStack.typeId === "bv:balloon") {
			player.addEffect('minecraft:levitation', 100, { amplifier: 1 });
		}
	} catch (error) {
		console.warn("Erro no itemCompleteUse (Artefatos):", error);
	}
});