import { world, system } from "@minecraft/server";

const bossConfig = {
    "mnra_cata:sun_tribunal": {
        flagId: "mnra_cata:boss_sun_tribunal_killed",
        buffTargets: [
            {
                typeId: "minecraft:wither_skeleton",
                applyRadius: 64,
                effects: [
                    { id: "strength", durationTicks: 95000, amplifier: 0, showParticles: false },
                    { id: "health_boost", durationTicks: 95000, amplifier: 1, showParticles: false },
                    { id: "instant_damage", durationTicks: 2, amplifier: 200, showParticles: false },
                ]
            },
            {
                typeId: "minecraft:blaze",
                applyRadius: 64,
                effects: [
                    { id: "strength", durationTicks: 95000, amplifier: 0, showParticles: false },
                    { id: "health_boost", durationTicks: 95000, amplifier: 1, showParticles: false },
                    { id: "regeneration", durationTicks: 2, amplifier: 200, showParticles: false },
                ]
            },
            {
                typeId: "mnra_cata:solar_tesla",
                applyRadius: 64,
                effects: [
                    { id: "strength", durationTicks: 95000, amplifier: 0, showParticles: false },
                    { id: "health_boost", durationTicks: 95000, amplifier: 2, showParticles: false },
                    { id: "regeneration", durationTicks: 2, amplifier: 200, showParticles: false },
                ]
            },
            {
                typeId: "mnra_cata:solarium",
                applyRadius: 64,
                effects: [
                    { id: "strength", durationTicks: 95000, amplifier: 0, showParticles: false },
                    { id: "health_boost", durationTicks: 95000, amplifier: 1, showParticles: false },
                    { id: "instant_health", durationTicks: 2, amplifier: 200, showParticles: false },
                ]
            }
        ],
        deathCommands: [
            `tellraw @a {"rawtext":[{"text":"§eBlazing Spirits surge through the Nether..."}]}`,
            `tellraw @a {"rawtext":[{"text":"§dAncient evil awakens..."}]}`
        ],
        onBuffedMobDeath: {
            "minecraft:wither_skeleton": [
                `loot spawn ~~~ loot "minera/cata/entities/boss_progress/wither_skeleton"`
            ],
            "mnra_cata:solar_tesla": [
                `loot spawn ~~~ loot "minera/cata/entities/boss_progress/solar_mob"`
            ],
            "mnra_cata:solarium": [
                `loot spawn ~~~ loot "minera/cata/entities/boss_progress/solar_mob"`
            ]
        }
    },

    "mnra_cata:verdant_sentinel": {
        flagId: "mnra_cata:boss_verdant_sentinel_killed",
        buffTargets: [
            {
                typeId: "mnra_cata:verdant_skeleton",
                applyRadius: 64,
                effects: [
                    { id: "strength", durationTicks: 95000, amplifier: 0, showParticles: false },
                    { id: "health_boost", durationTicks: 95000, amplifier: 0, showParticles: false },
                    { id: "instant_health", durationTicks: 2, amplifier: 200, showParticles: false },
                ]
            },
            {
                typeId: "mnra_cata:feralbloom",
                applyRadius: 64,
                effects: [
                    { id: "strength", durationTicks: 95000, amplifier: 0, showParticles: false },
                    { id: "health_boost", durationTicks: 95000, amplifier: 3, showParticles: false },
                    { id: "instant_health", durationTicks: 2, amplifier: 200, showParticles: false },
                ]
            }
        ],
        deathCommands: [
            `tellraw @a {"rawtext":[{"text":"§2The Dungeon Grows Restless..."}]}`
        ],
        onBuffedMobDeath: {
            "mnra_cata:verdant_skeleton": [
                `loot spawn ~~~ loot "minera/cata/entities/boss_progress/verdant_skeleton"`
            ]
        }
    }
};

function applyEffectsToEntity(entity, effects) {
    for (const e of effects) {
        entity.addEffect(e.id, e.durationTicks, {
            amplifier: e.amplifier ?? 0,
            showParticles: e.showParticles ?? false
        });
    }
}

function applyBuffsAroundLocation(dimension, location, buffTarget, bossType) {
    const radius = Math.max(1, buffTarget.applyRadius || 16);
    const query = {
        location,
        maxDistance: radius,
        type: buffTarget.typeId
    };

    for (const ent of dimension.getEntities(query)) {
        applyEffectsToEntity(ent, buffTarget.effects);
        ent.addTag(`mnra_cata:buffed_by_${bossType}`);
    }
}

function runDeathCommands(dimension, commands = []) {
    for (const cmd of commands) {
        dimension.runCommand(cmd);
    }
}

function triggerBossDefeat(bossType, dimension, location) {
    const cfg = bossConfig[bossType];
    if (!cfg) return;

    const wasKilledBefore = world.getDynamicProperty(cfg.flagId) === true;
    world.setDynamicProperty(cfg.flagId, true);

    for (const bt of cfg.buffTargets) {
        applyBuffsAroundLocation(dimension, location, bt, bossType);
    }

    if (!wasKilledBefore) {
        runDeathCommands(dimension, cfg.deathCommands);
    }
}

system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id !== "mnra_cata:sun_tribunal_start") return;

    const source = event.sourceEntity;
    if (!source) return;

    const dim = world.getDimension(source.dimension.id ?? "overworld");
    triggerBossDefeat("mnra_cata:sun_tribunal", dim, source.location);
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id !== "mnra_cata:verdant_sentinel_start") return;

    const source = event.sourceEntity;
    if (!source) return;

    const dim = world.getDimension(source.dimension.id ?? "overworld");
    triggerBossDefeat("mnra_cata:verdant_sentinel", dim, source.location);
});

function handleBuffedMobDeath(event) {
    const dead = event.deadEntity;
    if (!dead) return;
    if (dead.hasTag("mnra_cata:buffed_death_processed")) return;

    const killer = event.damageSource?.damagingEntity;
    if (!killer || killer.typeId !== "minecraft:player") return;

    const dim = world.getDimension(dead.dimension.id ?? "overworld");
    const { x, y, z } = dead.location;

    for (const [bossType, cfg] of Object.entries(bossConfig)) {
        if (!dead.hasTag(`mnra_cata:buffed_by_${bossType}`)) continue;

        const cmds = cfg.onBuffedMobDeath?.[dead.typeId];
        if (!cmds) continue;

        for (let cmd of cmds) {
            cmd = cmd.replace(/~\s*~\s*~/g, `${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)}`);
            dim.runCommand(cmd);
        }

        dead.addTag("mnra_cata:buffed_death_processed");
    }
}

world.afterEvents.entityDie.subscribe((event) => {
    const dead = event.deadEntity;
    if (!dead) return;

    if (bossConfig[dead.typeId]) {
        const dim = world.getDimension(dead.dimension.id ?? "overworld");
        triggerBossDefeat(dead.typeId, dim, dead.location);
    }

    try {
        handleBuffedMobDeath(event);
    } catch { }
});

world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (!entity) return;

    for (const [bossType, cfg] of Object.entries(bossConfig)) {
        if (!world.getDynamicProperty(cfg.flagId)) continue;

        for (const t of cfg.buffTargets) {
            if (entity.typeId === t.typeId) {
                applyEffectsToEntity(entity, t.effects);
                entity.addTag(`mnra_cata:buffed_by_${bossType}`);
            }
        }
    }
});

system.runInterval(() => {
    for (const [bossType, cfg] of Object.entries(bossConfig)) {
        if (!world.getDynamicProperty(cfg.flagId)) continue;

        const dimensions = [
            world.getDimension("minecraft:overworld"),
            world.getDimension("minecraft:nether"),
            world.getDimension("minecraft:the_end")
        ];

        for (const dimension of dimensions) {
            for (const target of cfg.buffTargets) {
                const ents = dimension.getEntities({ type: target.typeId });

                for (const ent of ents) {
                    const tag = `mnra_cata:buffed_by_${bossType}`;
                    if (ent.hasTag(tag)) continue;

                    applyEffectsToEntity(ent, target.effects);
                    ent.addTag(tag);
                }
            }
        }
    }
}, 100);

