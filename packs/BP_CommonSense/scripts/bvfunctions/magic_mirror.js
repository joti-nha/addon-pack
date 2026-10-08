import { world } from '@minecraft/server';

world.afterEvents.itemCompleteUse.subscribe((eventData) => {
	const { itemStack: item, source: player } = eventData;

	if (player?.typeId !== "minecraft:player" || item.typeId !== "bv:magic_mirror") return;

	try {
		const currentLoc = player.location;
		const currentDim = player.dimension;

		// Partículas ANTES de teleportar
		currentDim.spawnParticle('minecraft:mob_portal', { x: currentLoc.x, y: currentLoc.y + 1, z: currentLoc.z });
		currentDim.spawnParticle('minecraft:mob_portal', { x: currentLoc.x + 2, y: currentLoc.y, z: currentLoc.z });
		currentDim.spawnParticle('minecraft:mob_portal', { x: currentLoc.x + 1, y: currentLoc.y + 1, z: currentLoc.z });

		const spawn = player.getSpawnPoint();

		if (spawn) {
			player.teleport(
				{ x: spawn.x, y: spawn.y, z: spawn.z },
				{ dimension: spawn.dimension, checkForBlocks: true }
			);

			spawn.dimension.playSound('mob.endermen.portal', spawn);
			spawn.dimension.spawnParticle('minecraft:mob_portal', { x: spawn.x, y: spawn.y + 1, z: spawn.z - 1 });
			spawn.dimension.spawnParticle('minecraft:mob_portal', { x: spawn.x, y: spawn.y + 1, z: spawn.z + 1 });
			spawn.dimension.spawnParticle('minecraft:mob_portal', { x: spawn.x + 1, y: spawn.y + 1, z: spawn.z });

		} else {
			// Puxamos as coordenadas do spawn natural do mundo
			const defaultSpawn = world.getDefaultSpawnLocation();
			const overworld = world.getDimension("overworld");

			let targetY = defaultSpawn.y;

			// CORREÇÃO: O Minecraft às vezes retorna a altura do spawn padrão como 32767.
			// Se a altura for absurda, nós forçamos o cálculo do bloco mais alto real.
			if (targetY > 319) {
				try {
					const topBlock = overworld.getTopmostBlock({ x: defaultSpawn.x, y: 0, z: defaultSpawn.z });
					if (topBlock) {
						targetY = topBlock.y + 1; // Fica em cima do bloco
					} else {
						targetY = 100; // Fallback se o chunk estiver descarregado
					}
				} catch (e) {
					targetY = 100; // Fallback de emergência
				}
			}

			const targetLoc = { x: defaultSpawn.x, y: targetY, z: defaultSpawn.z };

			player.teleport(targetLoc, { dimension: overworld, checkForBlocks: true });

			// Efeito de Queda Lenta (Slow Falling) de 10 segundos para segurança
			// Previne danos caso o mapa demore a carregar o chão
			player.addEffect('minecraft:slow_falling', 200, { amplifier: 0, showParticles: false });

			overworld.playSound('mob.endermen.portal', targetLoc);
			overworld.spawnParticle('minecraft:mob_portal', { x: targetLoc.x, y: targetLoc.y + 1, z: targetLoc.z });
			overworld.spawnParticle('minecraft:mob_portal', { x: targetLoc.x, y: targetLoc.y + 1, z: targetLoc.z });
			overworld.spawnParticle('minecraft:mob_portal', { x: targetLoc.x, y: targetLoc.y + 1, z: targetLoc.z });
		}
	} catch (error) {
		console.warn("Erro no Magic Mirror:", error);
	}
});