import { world, system, EntityDamageCause } from "@minecraft/server";

const MobActionConfig = {
    "mnra_cata:verdant_sentinel": [
        {
            RequiredTag: "is_dashing_fast",
            DurationTicks: 50,

            Action(mob, dimension) {
                const targets = dimension.getEntities({
                    location: mob.location,
                    maxDistance: 4,
                    excludeFamilies: ["verdant_sentinel"]
                });

                for (const target of targets) {

                    target.applyKnockback({ x: -mob.getViewDirection().x * -0.2, z: -mob.getViewDirection().z * -0.2 }, 0.1);
                    target.applyDamage(8, {
                        cause: EntityDamageCause.entityAttack,
                        damagingEntity: mob
                    });
                }
            }
        },
    ],
    "mnra_cata:phantom_sun_dagger": [
        {
            RequiredTag: "is_moving",
            DurationTicks: 999,

            Action(mob, dimension) {
                const targets = dimension.getEntities({
                    location: mob.location,
                    maxDistance: 1.55,
                    excludeFamilies: ["sun_tribunal"]
                });

                for (const target of targets) {

                    target.applyKnockback({ x: -mob.getViewDirection().x * -0.2, z: -mob.getViewDirection().z * -0.2 }, 0.1);
                    target.applyDamage(20, {
                        cause: EntityDamageCause.entityAttack,
                        damagingEntity: mob
                    });
                }
            }
        },
    ],
    "mnra_cata:sun_tribunal_phantom_blade_telegraph": [
        {
            RequiredTag: "is_moving",
            DurationTicks: 999,

            Action(mob, dimension) {
                const SkinId = mob.getComponent("minecraft:skin_id")
                if (SkinId.value == 1) {

                    const targets = dimension.getEntities({
                        location: mob.location,
                        maxDistance: 1.8,
                        excludeFamilies: ["sun_tribunal"]
                    });

                    for (const target of targets) {

                        target.applyKnockback({ x: -mob.getViewDirection().x * -0.2, z: -mob.getViewDirection().z * -0.2 }, 0.1);
                        target.applyDamage(33, {
                            cause: EntityDamageCause.entityAttack,
                            damagingEntity: mob
                        });
                    }
                }
                if (SkinId.value == 2) {

                    const targets = dimension.getEntities({
                        location: mob.location,
                        maxDistance: 2.6,
                        excludeFamilies: ["sun_tribunal"]
                    });

                    for (const target of targets) {

                        target.applyKnockback({ x: -mob.getViewDirection().x * -0.2, z: -mob.getViewDirection().z * -0.2 }, 0.1);
                        target.applyDamage(25, {
                            cause: EntityDamageCause.entityAttack,
                            damagingEntity: mob
                        });
                    }
                }
            }
        },
    ]
};

const TicksBetweenRuns = 0.1;
const timers = new Map();

system.runInterval(() => {
    const dimensions = [
        world.getDimension("overworld"),
        world.getDimension("nether"),
        world.getDimension("the_end"),
    ];

    for (const dimension of dimensions) {
        for (const entity of dimension.getEntities()) {
            if (!entity.isValid) continue;

            const configs = MobActionConfig[entity.typeId];
            if (!configs) continue;

            for (const config of configs) {
                const key = `${entity.id}:${config.RequiredTag}`;
                const hasTag = entity.hasTag(config.RequiredTag);

                if (hasTag && !timers.has(key)) {
                    timers.set(key, config.DurationTicks);
                }

                if (!timers.has(key)) continue;

                let timeLeft = timers.get(key) - TicksBetweenRuns;

                if (timeLeft <= 0 || !hasTag) {
                    timers.delete(key);
                    if (hasTag) entity.removeTag(config.RequiredTag);
                    continue;
                }

                timers.set(key, timeLeft);

                try {
                    config.Action(entity, dimension);
                } catch (e) {
                }
            }
        }
    }
}, TicksBetweenRuns);
