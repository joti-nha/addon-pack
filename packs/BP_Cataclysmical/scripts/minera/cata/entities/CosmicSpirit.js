import { world, system } from "@minecraft/server";

const CosmicSpiritConfig = {
    mobId: "mnra_cata:cosmic_spirit",
    maxDistance: 45,
    checkInterval: 100,
    teleportParticle: "mnra_cata:cosmic_spirit_tp",
};

world.afterEvents.entitySpawn.subscribe((event) => {
    const entity = event.entity;
    if (entity.typeId !== CosmicSpiritConfig.mobId) return;

    const loc = entity.location;

    for (const tag of entity.getTags()) {
        if (
            tag.startsWith("spawnX:") ||
            tag.startsWith("spawnY:") ||
            tag.startsWith("spawnZ:")
        ) {
            entity.removeTag(tag);
        }
    }

    entity.addTag(`spawnX:${Math.floor(loc.x)}`);
    entity.addTag(`spawnY:${Math.floor(loc.y)}`);
    entity.addTag(`spawnZ:${Math.floor(loc.z)}`);
});


system.runInterval(() => {
    for (const entity of world.getDimension("overworld").getEntities({
        type: CosmicSpiritConfig.mobId
    })) {

        let sx, sy, sz;

        for (const tag of entity.getTags()) {
            if (tag.startsWith("spawnX:")) sx = Number(tag.slice(7));
            if (tag.startsWith("spawnY:")) sy = Number(tag.slice(7));
            if (tag.startsWith("spawnZ:")) sz = Number(tag.slice(7));
        }
        if (sx === undefined || sy === undefined || sz === undefined) {
            const loc = entity.location;

            entity.addTag(`spawnX:${Math.floor(loc.x)}`);
            entity.addTag(`spawnY:${Math.floor(loc.y)}`);
            entity.addTag(`spawnZ:${Math.floor(loc.z)}`);

            continue;
        }

        const dx = entity.location.x - sx;
        const dy = entity.location.y - sy;
        const dz = entity.location.z - sz;

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance > CosmicSpiritConfig.maxDistance) {
            if (CosmicSpiritConfig.teleportParticle) {
                entity.runCommand(
                    `particle ${CosmicSpiritConfig.teleportParticle} ~ ~ ~`
                );
            }

            entity.teleport(
                { x: sx + 0.5, y: sy, z: sz + 0.5 },
                { dimension: entity.dimension }
            );
        }
    }
}, CosmicSpiritConfig.checkInterval);
