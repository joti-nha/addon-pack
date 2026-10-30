import { world, system } from "@minecraft/server";

const BossConfigs = [
    {
        typeId: "mnra_cata:sun_tribunal",
        maxDistance: 50,
        despawnEvent: "despawn_from_distance",
        message: "§cO Tribunal do Sol foi selado de novo."
    },
    {
        typeId: "mnra_cata:soul_terror",
        maxDistance: 50,
        despawnEvent: "despawn_from_distance",
    },
];

system.runInterval(() => {

    const players = world.getPlayers();
    if (players.length === 0) return;

    for (const config of BossConfigs) {

        const dimensions = [
            world.getDimension("overworld"),
            world.getDimension("nether"),
            world.getDimension("the_end")
        ];

        for (const dimension of dimensions) {

            const bosses = dimension.getEntities({ type: config.typeId });

            for (const boss of bosses) {

                if (boss.hasTag("mnra_cata:distance_despawning")) continue;

                let isPlayerNearby = false;

                for (const player of players) {

                    if (player.dimension.id !== boss.dimension.id) continue;

                    const dx = player.location.x - boss.location.x;
                    const dy = player.location.y - boss.location.y;
                    const dz = player.location.z - boss.location.z;

                    const distanceSquared = dx * dx + dy * dy + dz * dz;

                    if (distanceSquared <= config.maxDistance * config.maxDistance) {
                        isPlayerNearby = true;
                        break;
                    }
                }

                if (!isPlayerNearby) {

                    boss.addTag("mnra_cata:distance_despawning");

                    if (config.message) {
                        world.sendMessage(config.message);
                    }

                    boss.triggerEvent(config.despawnEvent);
                }
            }
        }
    }

}, 20);