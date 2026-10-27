import { world, system } from "@minecraft/server";

let starfallActive = false;
let nightChecked = false;
let starfallIntervalId = null;

function startStarfallEvent() {
    world.sendMessage("§dStarlings estão caindo do céu!")

    const MinDistance = 40;
    const MaxDistance = 60;

    const Tick = 30;

    const Mobs = [
        { id: "mnra_cata:starfall_star", weight: 95 },
        { id: "mnra_cata:starfall_starling", weight: 85 },
        { id: "mnra_cata:starfall_comet", weight: 5 },
        { id: "mnra_cata:starfall_twilight_comet", weight: 2 },
        { id: "mnra_cata:cosmic_clock_dummy", weight: 1 },
        { id: "mnra_cata:star_fallen_dummy", weight: 1 }
    ];

    const PassableBlocks = [
        "minecraft:grass_block",
        "minecraft:dirt",
        "minecraft:sand",
        "minecraft:red_sand",
        "minecraft:snow_layer",
        "minecraft:snow",
        "minecraft:gravel",
        "minecraft:mud"
    ];

    function chooseWeightedMob() {
        const total = Mobs.reduce((sum, m) => sum + m.weight, 0);
        let random = Math.random() * total;

        for (const mob of Mobs) {
            if (random < mob.weight) return mob.id;
            random -= mob.weight;
        }
    }

    starfallIntervalId = system.runInterval(() => {

        try {
            for (const player of world.getPlayers()) {

                const dim = player.dimension;

                const angle = Math.random() * Math.PI * 2;
                const distance = MinDistance + Math.random() * (MaxDistance - MinDistance);

                const xOffset = Math.cos(angle) * distance;
                const zOffset = Math.sin(angle) * distance;

                const baseX = Math.floor(player.location.x + xOffset);
                const baseZ = Math.floor(player.location.z + zOffset);

                for (let y = 130; y >= 56; y--) {
                    const block = dim.getBlock({ x: baseX, y, z: baseZ });

                    if (!block) continue;

                    const IsPassableBlock = PassableBlocks.includes(block.typeId);

                    if (IsPassableBlock && block.above()?.typeId === "minecraft:air") {
                        const mobToSpawn = chooseWeightedMob();

                        dim.spawnEntity(mobToSpawn, {
                            x: baseX + 0.5,
                            y: y + 1,
                            z: baseZ + 0.5
                        });

                        break;
                    }
                }
            }
        } catch { }
    }, Tick);
}

export function stopStarfallEvent() {
    world.sendMessage("§dO evento Chuva de Estrelas acabou")
    if (starfallIntervalId !== null) {
        system.clearRun(starfallIntervalId);
        starfallIntervalId = null;
    }
}

export function isNight() {
    const time = world.getTimeOfDay() % 24000;
    return time >= 13000 && time <= 23000;
}

system.runInterval(() => {
    const time = world.getTimeOfDay() % 24000;

    if (isNight()) {

        if (!nightChecked && time >= 13000 && time <= 13020) {

            nightChecked = true;

            const chance = Math.random();
            if (chance <= 0.08 && !starfallActive) {
                startStarfallEvent();
                starfallActive = true;
            }
        }

    } else {

        if (starfallActive) {
            stopStarfallEvent();
            starfallActive = false;
        }

        nightChecked = false;
    }

}, 20);

//asteroid logic

//asteroids
const AsteroidBlock = "mnra_cata:asteroid";
const AsteroidBlockTypes = [
    { id: "mnra_cata:astral_ore", chance: 0.1 },
    { id: "mnra_cata:polished_asteroid", chance: 0.3 },
];

function createAsteroid(dim, center, radius) {
    const cx = Math.floor(center.x);
    const cy = Math.floor(center.y);
    const cz = Math.floor(center.z);

    for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
            for (let z = -radius; z <= radius; z++) {
                if (x * x + y * y + z * z <= radius * radius) {
                    const blockLoc = { x: cx + x, y: cy + y, z: cz + z };

                    let block = AsteroidBlock;
                    for (const ore of AsteroidBlockTypes) {
                        if (Math.random() < ore.chance) {
                            block = ore.id;
                            break;
                        }
                    }

                    try {
                        dim.getBlock(blockLoc)?.setType(block);
                    } catch { }
                }
            }
        }
    }
}

//twilight_asteroids
const MourningStone = "mnra_cata:mourning_stone";
const TwilightOre = "mnra_cata:twilight_ore";
const TwilightOreChance = 0.3;
const PolishedMourningStone = [
    { id: "mnra_cata:polished_mourning_stone", chance: 0.5 },
];

function createTwilightAsteroid(dim, center, radius) {
    const cx = Math.floor(center.x);
    const cy = Math.floor(center.y);
    const cz = Math.floor(center.z);

    for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
            for (let z = -radius; z <= radius; z++) {
                if (x * x + y * y + z * z <= radius * radius) {
                    const blockLoc = { x: cx + x, y: cy + y, z: cz + z };

                    let block = MourningStone;
                    for (const ore of PolishedMourningStone) {
                        if (Math.random() < ore.chance) {
                            block = ore.id;
                            break;
                        }
                    }

                    try {
                        dim.getBlock(blockLoc)?.setType(block);
                    } catch { }
                }
            }
        }
    }

    placeCrystals(dim, center, radius);
}

function placeCrystals(dim, center, radius) {
    const cx = Math.floor(center.x);
    const cy = Math.floor(center.y);
    const cz = Math.floor(center.z);

    for (let x = -radius; x <= radius; x++) {
        for (let z = -radius; z <= radius; z++) {
            if (x * x + z * z > radius * radius) continue;

            let highestY = null;
            for (let y = radius; y >= -radius; y--) {
                const block = dim.getBlock({ x: cx + x, y: cy + y, z: cz + z });
                if (!block) continue;

                const isAsteroid =
                    block.typeId === MourningStone ||
                    PolishedMourningStone.some(o => block.typeId === o.id);

                if (isAsteroid) {
                    highestY = cy + y;
                    break;
                }
            }

            if (highestY !== null && Math.random() < TwilightOreChance) {
                const above = dim.getBlock({ x: cx + x, y: highestY + 1, z: cz + z });
                try {
                    above?.setType(TwilightOre);
                } catch { }
            }
        }
    }
}

system.afterEvents.scriptEventReceive.subscribe((ev) => {
    if (ev.id !== "mnra_cata:starfall_comet_twilight") return;

    const caller = ev.sourceEntity;
    if (!caller) return;

    const radius = 0.5 + Math.random() * 2;

    createTwilightAsteroid(caller.dimension, caller.location, radius);

    caller.runCommand("particle mnra_cata:starfall_comet_impact_dust ~ ~ ~");
    caller.runCommand("playsound random.explode @a[r=12] ~ ~ ~ 0.5 1.3 1")
});

system.afterEvents.scriptEventReceive.subscribe((ev) => {
    if (ev.id !== "mnra_cata:starfall_comet") return;

    const caller = ev.sourceEntity;
    if (!caller) return;

    const radius = 0.5 + Math.random() * 2;

    createAsteroid(caller.dimension, caller.location, radius);

    caller.runCommand("particle mnra_cata:starfall_comet_impact_dust ~ ~ ~");
    caller.runCommand("playsound random.explode @a[r=12] ~ ~ ~ 0.5 1.3 1")
});

system.afterEvents.scriptEventReceive.subscribe((ev) => {
    if (ev.id !== "mnra_cata:starfall_starling") return;

    const caller = ev.sourceEntity;
    if (!caller) return;

    caller.runCommand("summon mnra_cata:starling ~ ~ ~ facing ~ ~ ~ is_starfall_summoned")
    caller.runCommand("particle mnra_cata:starfall_starling_impact_dust ~ ~ ~")
});


world.afterEvents.itemUse.subscribe((event) => {
    const item = event.itemStack;
    const player = event.source;

    if (!item || item.typeId !== "mnra_cata:cosmic_clock") return;

    if (starfallActive) {
        player.onScreenDisplay.setActionBar("§cO evento Chuva de Estrelas está ativo");
        return;
    }

    if (!isNight()) {
        player.onScreenDisplay.setActionBar("§7Só pode ser invocado à noite");
        return;
    }

    startStarfallEvent();
    starfallActive = true;
    player.runCommand(`clear @s mnra_cata:cosmic_clock 0 1`);

    player.runCommand("particle mnra_cata:cosmic_spirit_tp ~ ~1.5 ~")
    player.runCommand("particle mnra_cata:cosmic_spirit_tp ~ ~1.5 ~")
    player.playSound('respawn_anchor.deplete', { pitch: 1.3, location: player.location, volume: 1 })
});



