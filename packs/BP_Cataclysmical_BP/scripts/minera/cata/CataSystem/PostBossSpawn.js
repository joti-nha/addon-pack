import { world, system } from "@minecraft/server";


//THIS IS A WIP i might not add this at all lol.
// if u wanna test it out place import "./CataSystem/PostBossSpawn.js" in main.js

const MinDistance = 24;
const MaxDistance = 55;

//testies
const Debug = false;

//mobs
const postBossSpawnConfig = {
    "mnra_cata:sun_tribunal": {
        flagId: "mnra_cata:boss_sun_tribunal_killed",
        enabled: true,
        mobs: [
            {
                typeId: "mnra_cata:solarium",
                spawnIntervalTicks: 1000,
                spawnCountMin: 0,
                spawnCountMax: 2,
                spawnBlocks: [
                    "minecraft:netherrack",
                    "mnra_cata:polished_flare_stone",
                    "mnra_cata:flare_stone_brick"
                ],
                spawnDims: ["minecraft:nether"]
            },
            {
                typeId: "mnra_cata:solar_tesla",
                spawnIntervalTicks: 2000,
                spawnCountMin: 0,
                spawnCountMax: 1,
                spawnBlocks: [
                    "minecraft:netherrack",
                    "mnra_cata:polished_flare_stone",
                    "mnra_cata:flare_stone_brick"
                ],
                spawnDims: ["minecraft:nether"]
            },
        ]
    },
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function debugSpawn(player, mobType, loc, bossType) {
    if (!Debug) return;

    const msg =
        `§7${mobType} ` +
        `§7spawned by ${player.name} ` +
        `§7from ${bossType} ` +
        `§7at ${Math.floor(loc.x)} ${Math.floor(loc.y)} ${Math.floor(loc.z)}`;

    player.sendMessage(msg);
}

function findSpawnLocation(player, allowedBlocks, dim) {
    const px = player.location.x;
    const py = player.location.y;
    const pz = player.location.z;

    for (let attempts = 0; attempts < 15; attempts++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = getRandomInt(MinDistance, MaxDistance);

        const x = Math.floor(px + Math.cos(angle) * distance);
        const z = Math.floor(pz + Math.sin(angle) * distance);
        const y = Math.floor(py + 10);

        const ground = dim.getBlock({ x, y: y - 1, z });
        const body = dim.getBlock({ x, y, z });
        const head = dim.getBlock({ x, y: y + 1, z });

        if (
            ground &&
            body &&
            head &&
            allowedBlocks.includes(ground.typeId) &&
            body.typeId === "minecraft:air" &&
            head.typeId === "minecraft:air"
        ) {
            return {
                x: x + 0.5,
                y: y,
                z: z + 0.5
            };
        }
    }

    return null;
}


function spawnGroupForPlayer(player, mobConfig, bossType) {
    const dim = world.getDimension(player.dimension.id);
    if (!mobConfig.spawnDims.includes(player.dimension.id)) return;

    const count = getRandomInt(mobConfig.spawnCountMin, mobConfig.spawnCountMax);

    for (let i = 0; i < count; i++) {
        const loc = findSpawnLocation(player, mobConfig.spawnBlocks, dim);
        if (!loc) continue;

        try {
            dim.spawnEntity(mobConfig.typeId, loc);
            debugSpawn(player, mobConfig.typeId, loc, bossType);
        } catch (err) {
            console.warn(`Failed to spawn ${mobConfig.typeId}: ${err}`);
        }
    }
}

const lastSpawnTicks = {};

system.runInterval(() => {
    for (const [bossType, cfg] of Object.entries(postBossSpawnConfig)) {
        if (!cfg.enabled) continue;

        const flag = world.getDynamicProperty(cfg.flagId);
        if (!flag) continue;

        for (const mobCfg of cfg.mobs) {
            const now = system.currentTick;
            const key = `${bossType}:${mobCfg.typeId}`;

            if (!lastSpawnTicks[key]) lastSpawnTicks[key] = 0;
            if (now - lastSpawnTicks[key] < mobCfg.spawnIntervalTicks) continue;

            for (const player of world.getPlayers()) {
                spawnGroupForPlayer(player, mobCfg, bossType);
            }

            lastSpawnTicks[key] = now;
        }
    }
}, 20);

