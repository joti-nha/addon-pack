import { world, system } from "@minecraft/server";

const MobImpulseConfig = {
    "mnra_cata:solarium": [
        {
            RequiredTag: "is_charging",
            HorizontalStrength: 0.3,
            VerticalStrength: 0,
            DurationTicks: 20,
        }
    ],
    "mnra_cata:verdant_sentinel": [
        {
            RequiredTag: "is_dashing",
            HorizontalStrength: 0.15,
            VerticalStrength: 0,
            DurationTicks: 60,
        },
    ],
    "mnra_cata:sun_tribunal_phantom_blade_telegraph": [
        {
            RequiredTag: "is_moving",
            HorizontalStrength: 0.3,
            VerticalStrength: 0,
            DurationTicks: 100,
        }
    ],
    "mnra_cata:phantom_sun_dagger": [
        {
            RequiredTag: "is_moving",
            HorizontalStrength: 0.8,
            VerticalStrength: 0,
            DurationTicks: 100,
        }
    ]
};

const TicksBetweenApplies = 1;
const Timer = new Map();

system.runInterval(() => {
    const dimensions = [
        world.getDimension("overworld"),
        world.getDimension("nether"),
        world.getDimension("the_end"),
    ];
    for (const dimension of dimensions) {
        for (const entity of dimension.getEntities()) {
            if (!entity.isValid) continue;

            const configs = MobImpulseConfig[entity.typeId];
            if (!configs) continue;

            for (const config of configs) {
                const key = `${entity.id}:${config.RequiredTag}`;
                const hasTag = entity.hasTag(config.RequiredTag);

                if (hasTag && !Timer.has(key)) {
                    Timer.set(key, config.DurationTicks);
                }

                if (!Timer.has(key)) continue;

                let timeLeft = Timer.get(key) - TicksBetweenApplies;

                if (timeLeft <= 0 || !hasTag) {
                    Timer.delete(key);
                    if (hasTag) entity.removeTag(config.RequiredTag);
                    continue;
                }

                Timer.set(key, timeLeft);

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
    }
}, TicksBetweenApplies);
