import { world, system } from "@minecraft/server";

//ProjectileImpulseConfig
const ProjectileImpulseConfig = {

    "mnra_cata:exodius_elements": {
        HorizontalStrength: 0.3,
        VerticalStrength: 0,
        DurationTicks: 20,
    },
    "mnra_cata:exodius_armor_elements": {
        HorizontalStrength: 0.3,
        VerticalStrength: 0,
        DurationTicks: 45,
    },
    "mnra_cata:soul_terror_skull": {
        HorizontalStrength: 0.5,
        VerticalStrength: 0,
        DurationTicks: 100,
    },
    "mnra_cata:sun_tribunal_phantom_blade": {
        HorizontalStrength: 0.5,
        VerticalStrength: 0,
        DurationTicks: 100,
    },
    "mnra_cata:player_phantom_phoenix_blade": {
        HorizontalStrength: 0.4,
        VerticalStrength: 0,
        DurationTicks: 100,
    },
};

const Timer = new Map();

system.run(() => {
    const dimensions = [
        world.getDimension("overworld"),
        world.getDimension("nether"),
        world.getDimension("the_end"),
    ];

    system.runInterval(() => {
        for (const dimension of dimensions) {
            for (const entity of dimension.getEntities()) {
                if (!entity.isValid) continue;

                const config = ProjectileImpulseConfig[entity.typeId];
                if (!config) continue;

                const id = entity.id;

                if (!Timer.has(id)) {
                    Timer.set(id, config.DurationTicks);
                }

                let timeLeft = Timer.get(id) - 1;

                if (timeLeft <= 0) {
                    Timer.set(id, config.DurationTicks);
                    continue;
                }

                Timer.set(id, timeLeft);

                const view = entity.getViewDirection();
                const horizontalLength = Math.hypot(view.x, view.z);
                if (horizontalLength === 0) continue;

                entity.applyImpulse({
                    x: (view.x / horizontalLength) * config.HorizontalStrength,
                    y: config.VerticalStrength,
                    z: (view.z / horizontalLength) * config.HorizontalStrength,
                });
            }
        }
    }, 1);
});

//ProjectileConfigSpawning
const ProjectileConfigSpawning = {
    "mnra_cata:exodius_elements": {
        MaxDistance: 30,
        DespawnEvent: "despawn",
    },
    "mnra_cata:soul_terror_skull": {
        MaxDistance: 30,
        DespawnEvent: "despawn",
    },
    "mnra_cata:sun_tribunal_phantom_blade": {
        MaxDistance: 30,
        DespawnEvent: "despawn",
    },
    "mnra_cata:phantom_sun_dagger": {
        MaxDistance: 30,
        DespawnEvent: "despawn",
    },
    "mnra_cata:sun_tribunal_phantom_blade_telegraph": {
        MaxDistance: 30,
        DespawnEvent: "despawn",
    },
    "mnra_cata:player_phantom_phoenix_blade": {
        MaxDistance: 30,
        DespawnEvent: "despawn",
    },
};

system.run(() => {
    const dimensions = [
        world.getDimension("overworld"),
        world.getDimension("nether"),
        world.getDimension("the_end"),
    ];

    system.runInterval(() => {
        for (const dimension of dimensions) {
            const players = dimension.getPlayers();
            if (players.length === 0) continue;

            for (const entity of dimension.getEntities()) {
                const config = ProjectileConfigSpawning[entity.typeId];
                if (!config || !entity.isValid) continue;

                let closeToAnyPlayer = false;

                for (const player of players) {
                    const dx = entity.location.x - player.location.x;
                    const dy = entity.location.y - player.location.y;
                    const dz = entity.location.z - player.location.z;

                    const distanceSq = dx * dx + dy * dy + dz * dz;

                    if (distanceSq <= config.MaxDistance ** 2) {
                        closeToAnyPlayer = true;
                        break;
                    }
                }

                if (!closeToAnyPlayer) {
                    entity.triggerEvent(config.DespawnEvent);
                }
            }
        }
    }, 1);
});