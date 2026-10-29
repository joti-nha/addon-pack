import { world } from '@minecraft/server';

world.afterEvents.itemCompleteUse.subscribe((eventData) => {
	const { itemStack: item, source: player } = eventData;

	if (player?.typeId !== "minecraft:player" || item.typeId !== "bv:magic_mirror") return;

	try {
		const spawn = player.getSpawnPoint();

		// Se o player não tiver uma cama/spawnpoint definido, impede o teleporte e avisa na hotbar
		if (!spawn) {
			player.onScreenDisplay.setActionBar("§cYou don't have a Bed as Spawnpoint!");
			return;
		}

		const currentLoc = player.location;
		const currentDim = player.dimension;

		// Partículas ANTES de teleportar
		currentDim.spawnParticle('minecraft:mob_portal', { x: currentLoc.x, y: currentLoc.y + 1, z: currentLoc.z });
		currentDim.spawnParticle('minecraft:mob_portal', { x: currentLoc.x + 2, y: currentLoc.y, z: currentLoc.z });
		currentDim.spawnParticle('minecraft:mob_portal', { x: currentLoc.x + 1, y: currentLoc.y + 1, z: currentLoc.z });

		player.teleport(
			{ x: spawn.x, y: spawn.y, z: spawn.z },
			{ dimension: spawn.dimension, checkForBlocks: true }
		);

		spawn.dimension.playSound('mob.endermen.portal', spawn);
		spawn.dimension.spawnParticle('minecraft:mob_portal', { x: spawn.x, y: spawn.y + 1, z: spawn.z - 1 });
		spawn.dimension.spawnParticle('minecraft:mob_portal', { x: spawn.x, y: spawn.y + 1, z: spawn.z + 1 });
		spawn.dimension.spawnParticle('minecraft:mob_portal', { x: spawn.x + 1, y: spawn.y + 1, z: spawn.z });

	} catch (error) {
		console.warn("Erro no Magic Mirror:", error);
	}
});