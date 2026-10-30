// spawner configs components: spawnRadius(int), delayBetweenWavesTicks(int), autoActivate(bool), autoActivationDistance(int), activationSound(value), waveSet(value)
// spawner configs components: SpawnerCompleteCommands(value), CooldownTicks(value), ActivationItem(value), activationDelayTicks(int)
import { world, system, GameMode } from "@minecraft/server";

const wi = world.beforeEvents?.worldInitialize;
if (wi) {
    wi.subscribe(ev => {
        ev.propertyRegistry.registerWorldDynamicProperties({
            spawnerCooldowns: { type: "string" }
        });
    });
}

const WaveSets = {
    dungeon_spawner_basic: [
        {
            mobs: [
                { id: "minecraft:zombie", min: 1, max: 2 },
                { id: "minecraft:skeleton", min: 0, max: 2 },
                { id: "minecraft:spider", min: 0, max: 2 }
            ]
        }
    ],
    dungeon_spawner_normal: [
        {
            mobs: [
                { id: "minecraft:zombie", min: 1, max: 5 },
                { id: "minecraft:skeleton", min: 1, max: 3 }
            ]
        },
        {
            mobs: [
                { id: "minecraft:zombie", min: 2, max: 5 },
                { id: "mnra_cata:stone_golem", min: 1, max: 1 },
                { id: "minecraft:spider", min: 1, max: 4 }
            ]
        },
        {
            mobs: [
                { id: "minecraft:zombie", min: 3, max: 5 },
                { id: "minecraft:skeleton", min: 1, max: 3 },
                { id: "minecraft:spider", min: 1, max: 4 },
                { id: "mnra_cata:stone_golem", min: 1, max: 2 }
            ]
        }
    ],
    dungeon_spawner_hard: [
        {
            mobs: [
                { id: "minecraft:parched", min: 2, max: 4 },
                { id: "minecraft:husk", min: 2, max: 4 },
                { id: "minecraft:spider", min: 2, max: 4 }
            ]
        },
        {
            mobs: [
                { id: "minecraft:stray", min: 3, max: 4 },
                { id: "mnra_cata:stone_golem", min: 1, max: 2 },
                { id: "mnra_cata:skeleton_paladin", min: 2, max: 5 }
            ]
        },
        {
            mobs: [
                { id: "minecraft:cave_spider", min: 2, max: 5 },
                { id: "mnra_cata:stone_golem", min: 2, max: 4 },
                { id: "mnra_cata:skeleton_paladin", min: 3, max: 6 }
            ]
        },
        {
            mobs: [
                { id: "minecraft:cave_spider", min: 2, max: 5 },
                { id: "minecraft:zombie", min: 3, max: 5 },
                { id: "mnra_cata:stone_golem", min: 2, max: 4 },
                { id: "mnra_cata:skeleton_paladin", min: 3, max: 6 }
            ]
        }
    ],
    solar_monolith_spawn: [
        {
            mobs: [
                { id: "mnra_cata:solarium", min: 1, max: 1 },
                { id: "minecraft:blaze", min: 2, max: 5 }
            ]
        },
        {
            mobs: [
                { id: "mnra_cata:solarium", min: 2, max: 2 },
                { id: "mnra_cata:solar_tesla", min: 1, max: 1 },
                { id: "minecraft:blaze", min: 2, max: 5 }
            ]
        },
        {
            mobs: [
                { id: "mnra_cata:solar_tesla", min: 2, max: 3 },
                { id: "mnra_cata:solarium", min: 2, max: 3 },
                { id: "minecraft:blaze", min: 3, max: 5 }
            ]
        }
    ]
};

const SpawnerConfigs = {
    "mnra_cata:dungeon_spawner_normal": {
        spawnRadius: 12,
        delayBetweenWavesTicks: 40,
        activationDelayTicks: 40,
        autoActivate: true,
        autoActivationDistance: 12,
        activationSound: "trial_spawner.charge_activate",
        ActivateCommands: [
            "playsound trial_spawner.detect_player @a {x} {y} {z} 1",
            "particle mnra_cata:dungeon_spawner_flame_spawn {x} {y} {z}"
        ],
        SpawnerCompleteCommands: [
            "playsound random.levelup @a {x} {y} {z} 1",
            `loot spawn {x} {y+1} {z} loot "minera/cata/chests/dungeon_spawner_normal"`,
            "particle mnra_cata:dungeon_spawner_flame_spawn {x} {y} {z}"
        ],
        waveSet: "dungeon_spawner_normal",
        CooldownTicks: 36000
    },
    "mnra_cata:dungeon_spawner_hard": {
        spawnRadius: 13,
        delayBetweenWavesTicks: 60,
        activationDelayTicks: 40,
        autoActivate: true,
        autoActivationDistance: 10,
        activationSound: "trial_spawner.charge_activate",
        ActivateCommands: [
            "playsound trial_spawner.detect_player @a {x} {y} {z} 1",
            "particle mnra_cata:dungeon_spawner_hard_flame_spawn {x} {y} {z}"
        ],
        SpawnerCompleteCommands: [
            "playsound random.levelup @a {x} {y} {z} 1",
            `loot spawn {x} {y+1} {z} loot "minera/cata/chests/dungeon_spawner_hard"`,
            "particle mnra_cata:dungeon_spawner_hard_flame_spawn {x} {y} {z}"
        ],
        waveSet: "dungeon_spawner_hard",
        CooldownTicks: 72000
    },
    "mnra_cata:dungeon_spawner_basic": {
        spawnRadius: 5,
        delayBetweenWavesTicks: 10,
        activationDelayTicks: 10,
        autoActivate: true,
        autoActivationDistance: 8,
        activationSound: "trial_spawner.charge_activate",
        ActivateCommands: [
            "playsound trial_spawner.detect_player @a {x} {y} {z} 1",
            "particle mnra_cata:dungeon_spawner_flame_spawn {x} {y} {z}"
        ],
        SpawnerCompleteCommands: [
            "playsound random.levelup @a {x} {y} {z} 1",
            `loot spawn {x} {y+1} {z} loot "minera/cata/chests/dungeon_spawner_basic"`,
            "particle mnra_cata:dungeon_spawner_flame_spawn {x} {y} {z}"
        ],
        waveSet: "dungeon_spawner_basic",
        CooldownTicks: 18000
    },
    "mnra_cata:solar_monolith_bottom": {
        spawnRadius: 5,
        delayBetweenWavesTicks: 60,
        activationDelayTicks: 10,
        ActivationItem: "mnra_cata:solar_element",
        activationSound: "respawn_anchor.charge",
        ActivateCommands: [
            `setblock {x} {y+1} {z} mnra_cata:solar_monolith_top ["mnra_cata:solar_monolith_activate"=true] replace`,
            `setblock {x} {y} {z} mnra_cata:solar_monolith_bottom ["mnra_cata:solar_monolith_activate"=true] replace`,
            "playsound sound.wand @a {x} {y} {z} 1",
        ],
        SpawnerCompleteCommands: [
            `setblock {x} {y+2} {z} air replace`,
            `setblock {x} {y} {z} mnra_cata:solar_monolith_bottom ["mnra_cata:solar_monolith_activate"=false] replace`,
            `loot spawn {x} {y+2} {z} loot "minera/cata/blocks/solar_monolith"`
        ],
        waveSet: "solar_monolith_spawn",
        CooldownTicks: 36000
    }
};


function keyForBlock(block) {
    const { x, y, z } = block.location;
    return `${block.dimension.id}:${x}:${y}:${z}`;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const sessions = new Map();
const spawnerCooldowns = new Map();
const entityToSession = new Map();
const trackedSpawners = new Map();


function loadCooldowns() {
    const raw = world.getDynamicProperty("spawnerCooldowns");
    if (!raw) return;
    try {
        const data = JSON.parse(raw);
        for (const k in data) spawnerCooldowns.set(k, data[k]);
    } catch { }
}

function saveCooldowns() {
    const obj = {};
    for (const [k, v] of spawnerCooldowns) obj[k] = v;
    world.setDynamicProperty("spawnerCooldowns", JSON.stringify(obj));
}

system.run(loadCooldowns);


function finishSession(session) {

    const { block, cfg, dim } = session;
    const l = block.location;

    for (let cmd of cfg.SpawnerCompleteCommands ?? []) {
        dim.runCommand(
            cmd.replace(/\{x\}/g, l.x)
                .replace(/\{y\}/g, l.y)
                .replace(/\{y\+1\}/g, l.y + 1)
                .replace(/\{y\+2\}/g, l.y + 2)
                .replace(/\{z\}/g, l.z)
        );
    }

    if (cfg.CooldownTicks) {
        spawnerCooldowns.set(session.key, system.currentTick + cfg.CooldownTicks);
        saveCooldowns();
    }

    sessions.delete(session.key);

    for (const [id, s] of entityToSession) {
        if (s === session) entityToSession.delete(id);
    }
}

function spawnWave(session) {
    const wave = session.waves[session.waveIndex];
    if (!wave) return;

    session.spawnedCount = 0;
    session.waitingForKills = true;

    const base = session.block.location;
    const radius = session.cfg.spawnRadius ?? 6;

    for (const mob of wave.mobs) {
        const count = randInt(mob.min, mob.max);

        for (let i = 0; i < count; i++) {

            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * radius;

            const x = Math.floor(base.x + Math.cos(angle) * dist);
            const z = Math.floor(base.z + Math.sin(angle) * dist);

            let spawnY = base.y;

            for (let yOffset = 3; yOffset >= -4; yOffset--) {
                const block = session.dim.getBlock({ x, y: base.y + yOffset, z });
                const above1 = session.dim.getBlock({ x, y: base.y + yOffset + 1, z });
                const above2 = session.dim.getBlock({ x, y: base.y + yOffset + 2, z });

                if (
                    block &&
                    block.typeId !== "minecraft:air" &&
                    above1?.typeId === "minecraft:air" &&
                    above2?.typeId === "minecraft:air"
                ) {
                    spawnY = base.y + yOffset + 1;
                    break;
                }
            }

            const pos = {
                x: x + 0.5,
                y: spawnY,
                z: z + 0.5
            };

            const e = session.dim.spawnEntity(mob.id, pos);
            entityToSession.set(e.id, session);

            session.spawnedCount++;
        }
    }
}

function startSession(block, dim, cfg, player) {
    const key = keyForBlock(block);

    if (spawnerCooldowns.get(key) > system.currentTick) return;
    if (sessions.has(key)) return;

    const l = block.location;
    for (let cmd of cfg.ActivateCommands ?? []) {
        dim.runCommand(
            cmd.replace(/\{x\}/g, l.x)
                .replace(/\{y\}/g, l.y)
                .replace(/\{y\+1\}/g, l.y + 1)
                .replace(/\{z\}/g, l.z)
        );
    }

    const session = {
        key,
        block,
        dim,
        cfg,
        waveIndex: 0,
        ownerPlayer: player,
        waves: WaveSets[cfg.waveSet] ?? [],
        spawnedCount: 0,
        waitingForKills: false
    };

    sessions.set(key, session);

    system.runTimeout(() => {
        if (!sessions.has(key)) return;
        spawnWave(session);
    }, cfg.activationDelayTicks ?? 0);
}

world.afterEvents.entityDie.subscribe(ev => {
    const session = entityToSession.get(ev.deadEntity?.id);
    if (!session) return;

    entityToSession.delete(ev.deadEntity.id);
    session.spawnedCount--;

    if (session.spawnedCount <= 0) {
        session.waitingForKills = false;

        if (++session.waveIndex < session.waves.length) {
            system.runTimeout(
                () => spawnWave(session),
                session.cfg.delayBetweenWavesTicks
            );
        } else {
            finishSession(session);
        }
    }
});


system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent("component:is_mob_spawner", {
        onTick({ block, dimension }) {

            const cfg = SpawnerConfigs[block.typeId];
            if (!cfg) return;

            const range = cfg.autoActivationDistance ?? 16;

            const nearbyEntities = block.dimension.getEntities({
                location: block.location,
                maxDistance: range,
                families: ["player"]
            });

            for (const player of nearbyEntities) {

                if (player.getGameMode() === GameMode.Creative) continue;

                startSession(block, dimension, cfg, player);
            }

        }
    });
});


world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    if (!ev.isFirstEvent) return;

    const cfg = SpawnerConfigs[ev.block?.typeId];
    if (!cfg?.ActivationItem) return;

    const inv = ev.player.getComponent("minecraft:inventory")?.container;
    const item = inv?.getItem(ev.player.selectedSlotIndex);

    if (!item || item.typeId !== cfg.ActivationItem) return;
    const key = keyForBlock(ev.block);

    if (spawnerCooldowns.get(key) > system.currentTick) return;
    ev.cancel = true;

    system.run(() => {
        const i = inv.getItem(ev.player.selectedSlotIndex);
        if (!i || i.typeId !== cfg.ActivationItem) return;
        i.amount > 1 ? (i.amount--, inv.setItem(ev.player.selectedSlotIndex, i)) : inv.setItem(ev.player.selectedSlotIndex);
        startSession(ev.block, ev.block.dimension, cfg, ev.player);
    });
});