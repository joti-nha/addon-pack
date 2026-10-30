import { world, system } from "@minecraft/server";

system.afterEvents.scriptEventReceive.subscribe((ev) => {
    if (ev.id !== "mnra_cata:sun_tribunal_teleport") return;

    const caller = ev.sourceEntity;
    if (!caller) return;

    const dim = caller.dimension;
    const origin = caller.location;

    const players = dim.getPlayers();
    if (players.length === 0) return;

    let target = players[0];
    let bestD2 = Infinity;

    for (const p of players) {
        const dx = p.location.x - origin.x;
        const dy = p.location.y - origin.y;
        const dz = p.location.z - origin.z;
        const d2 = dx * dx + dy * dy + dz * dz;

        if (d2 < bestD2) {
            bestD2 = d2;
            target = p;
        }
    }

    const MinRadius = 3;
    const MaxRadius = 10;
    const MaxYDistance = 10;

    const Blocks = [
        "mnra_cata:chiseled_flare_stone_brick",
        "mnra_cata:chiseled_flare_stone",
        "mnra_cata:cracked_flare_stone_brick",
        "mnra_cata:flare_stone_brick_slab",
        "mnra_cata:flare_stone_brick",
        "mnra_cata:flare_stone_bulb",
        "mnra_cata:flare_stone_chain",
        "mnra_cata:flare_stone_geyser",
        "mnra_cata:flare_stone_lantern",
        "mnra_cata:flare_stone_pillar",
        "mnra_cata:flare_stone_rock",
        "mnra_cata:flare_stone_tiles",
        "mnra_cata:flare_stone",
        "mnra_cata:polished_flare_stone",
        "minecraft:bedrock",
        "minecraft:grass_block",
    ];

    for (let attempt = 0; attempt < 10; attempt++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = MinRadius + Math.random() * (MaxRadius - MinRadius);

        const baseX = Math.floor(target.location.x + Math.cos(angle) * radius);
        const baseZ = Math.floor(target.location.z + Math.sin(angle) * radius);
        const baseY = Math.floor(target.location.y + MaxYDistance);

        for (let y = baseY; y > target.location.y - 5; y--) {
            const block = dim.getBlock({ x: baseX, y, z: baseZ });
            const above = dim.getBlock({ x: baseX, y: y + 1, z: baseZ });

            if (!block || !above) continue;

            if (
                Blocks.includes(block.typeId) &&
                above.typeId === "minecraft:air"
            ) {
                caller.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger_summon");
                caller.teleport(
                    { x: baseX + 0.5, y: y + 1, z: baseZ + 0.5 },
                    { dimension: dim, keepVelocity: false }
                );
                system.waitTicks(2).then(() => {
                    caller.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=32] ~ ~ ~ 0.8 1.5 1")
                });
                return;
            }
        }
    }
});


//teleport_attack
system.afterEvents.scriptEventReceive.subscribe((ev) => {
    if (ev.id !== "mnra_cata:sun_tribunal_teleport_attack") return;

    const caller = ev.sourceEntity;
    if (!caller) return;

    const dim = caller.dimension;
    const origin = caller.location;

    const players = dim.getPlayers();
    if (players.length === 0) return;

    let target = players[0];
    let bestD2 = Infinity;

    for (const p of players) {
        const dx = p.location.x - origin.x;
        const dy = p.location.y - origin.y;
        const dz = p.location.z - origin.z;
        const d2 = dx * dx + dy * dy + dz * dz;

        if (d2 < bestD2) {
            bestD2 = d2;
            target = p;
        }
    }

    const MinRadius = 10;
    const MaxRadius = 20;
    const MaxYDistance = 10;

    const Blocks = [
        "mnra_cata:chiseled_flare_stone_brick",
        "mnra_cata:chiseled_flare_stone",
        "mnra_cata:cracked_flare_stone_brick",
        "mnra_cata:flare_stone_brick_slab",
        "mnra_cata:flare_stone_brick",
        "mnra_cata:flare_stone_bulb",
        "mnra_cata:flare_stone_chain",
        "mnra_cata:flare_stone_geyser",
        "mnra_cata:flare_stone_lantern",
        "mnra_cata:flare_stone_pillar",
        "mnra_cata:flare_stone_rock",
        "mnra_cata:flare_stone_tiles",
        "mnra_cata:flare_stone",
        "mnra_cata:polished_flare_stone",
        "minecraft:bedrock",
        "minecraft:grass_block",
    ];

    for (let attempt = 0; attempt < 10; attempt++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = MinRadius + Math.random() * (MaxRadius - MinRadius);

        const baseX = Math.floor(target.location.x + Math.cos(angle) * radius);
        const baseZ = Math.floor(target.location.z + Math.sin(angle) * radius);
        const baseY = Math.floor(target.location.y + MaxYDistance);

        for (let y = baseY; y > target.location.y - 5; y--) {
            const block = dim.getBlock({ x: baseX, y, z: baseZ });
            const above = dim.getBlock({ x: baseX, y: y + 1, z: baseZ });

            if (!block || !above) continue;

            if (
                Blocks.includes(block.typeId) &&
                above.typeId === "minecraft:air"
            ) {
                caller.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger_summon");
                caller.teleport(
                    { x: baseX + 0.5, y: y + 1, z: baseZ + 0.5 },
                    { dimension: dim, keepVelocity: false }
                );
                system.waitTicks(2).then(() => {
                    caller.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=32] ~ ~ ~ 0.8 1.5 1")
                });
                return;
            }
        }
    }
});

//desperation_attack
system.afterEvents.scriptEventReceive.subscribe((ev) => {
    if (ev.id !== "mnra_cata:sun_tribunal_desperation_attack") return;

    const dim = ev.sourceEntity?.dimension ?? world.getDimension("overworld");
    const origin = ev.sourceEntity?.location;

    const players = dim.getPlayers();
    if (players.length === 0) return;

    let nearest = players[0];
    if (origin) {
        let bestD2 = Infinity;
        for (const p of players) {
            const dx = p.location.x - origin.x;
            const dy = p.location.y - origin.y;
            const dz = p.location.z - origin.z;
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 < bestD2) {
                bestD2 = d2;
                nearest = p;
            }
        }
    }
    nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger1");
    nearest.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=10] ~ ~ ~ 1 1 1")

    system.waitTicks(20).then(() => {
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger2");
        nearest.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=10] ~ ~ ~ 1 1 1")
    });
    system.waitTicks(40).then(() => {
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger_side1");
        nearest.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=10] ~ ~ ~ 1 1 1")
    });
    system.waitTicks(60).then(() => {
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger_side2");
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger_side1");
        nearest.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=10] ~ ~ ~ 1 1 1")
    });
    system.waitTicks(80).then(() => {
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger2");
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger3");
        nearest.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=10] ~ ~ ~ 1 1 1")
    });
    system.waitTicks(100).then(() => {
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger4");
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger1");

        nearest.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=10] ~ ~ ~ 1 1 1")
    });
    system.waitTicks(120).then(() => {
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger_side1");
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger_side2");
        nearest.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=10] ~ ~ ~ 1 1 1")
    });
    system.waitTicks(140).then(() => {
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger1");
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger2");
        nearest.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=10] ~ ~ ~ 1 1 1")
    });
    system.waitTicks(160).then(() => {
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger_side2");
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger3");
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger4");
        nearest.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=10] ~ ~ ~ 1 1 1")
    });
    system.waitTicks(180).then(() => {
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger1");
        nearest.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=10] ~ ~ ~ 1 1 1")
    });
    system.waitTicks(200).then(() => {
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger_side2");
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger3");
        nearest.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=10] ~ ~ ~ 1 1 1")
    });

});

system.afterEvents.scriptEventReceive.subscribe((ev) => {
    if (ev.id !== "mnra_cata:sun_tribunal_summon_attack") return;

    const dim = ev.sourceEntity?.dimension ?? world.getDimension("overworld");
    const origin = ev.sourceEntity?.location;

    const players = dim.getPlayers();
    if (players.length === 0) return;

    let nearest = players[0];
    if (origin) {
        let bestD2 = Infinity;
        for (const p of players) {
            const dx = p.location.x - origin.x;
            const dy = p.location.y - origin.y;
            const dz = p.location.z - origin.z;
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 < bestD2) {
                bestD2 = d2;
                nearest = p;
            }
        }
    }
    nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger2");
    nearest.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=10] ~ ~ ~ 1 1 1")

    system.waitTicks(20).then(() => {
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger3");
        nearest.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=10] ~ ~ ~ 1 1 1")
    });
    system.waitTicks(40).then(() => {
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger3");
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger4");
        nearest.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=10] ~ ~ ~ 1 1 1")
    });
    system.waitTicks(60).then(() => {
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger1");
        nearest.runCommand("function minera/cata/sun_tribunal/phantom_sun_dagger_side1");
        nearest.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=10] ~ ~ ~ 1 1 1")
    });
});


//nearest.runCommand("function sun_tribunal/phantom_sun_dagger1");
//nearest.runCommand("function sun_tribunal/phantom_sun_dagger2");
//nearest.runCommand("function sun_tribunal/phantom_sun_dagger3");
//nearest.runCommand("function sun_tribunal/phantom_sun_dagger4");
//nearest.runCommand("function sun_tribunal/phantom_sun_dagger_side1");
//nearest.runCommand("function sun_tribunal/phantom_sun_dagger_side2");


const Projectiles = [
    "mnra_cata:sun_tribunal_phantom_blade_telegraph",
    "mnra_cata:sun_tribunal_phantom_blade",
    "mnra_cata:sun_tribunal_chaos_attack1",
    "mnra_cata:sun_tribunal_dash_attack",
    "mnra_cata:sun_tribunal_double_dash_attack",
    "mnra_cata:sun_tribunal_normal_attack",
    "mnra_cata:phantom_sun_dagger",
];

world.afterEvents.entityHurt.subscribe(event => {
    const player = event.hurtEntity;
    const source = event.damageSource?.damagingEntity;

    if (!player || player.typeId !== "minecraft:player") return;
    if (!source) return;

    if (!Projectiles.includes(source.typeId)) return;

    const dimension = player.dimension;
    const bosses = dimension.getEntities({
        type: "mnra_cata:sun_tribunal",
        location: player.location,
        maxDistance: 64
    });

    if (bosses.length === 0) return;

    const boss = bosses[0];
    const BossProperty = "mnra_cata:is_flawless";

    boss.setProperty(BossProperty, false);
    player.removeEffect("resistance")
    player.removeEffect("absorption")
});

system.runInterval(() => {

    const overworld = world.getDimension("overworld");
    const players = world.getAllPlayers();
    const SunTribunal = overworld.getEntities({ type: "mnra_cata:sun_tribunal" });

    if (SunTribunal.length === 0) return;

    for (const player of players) {

        if (!player.isGliding) continue;

        for (const mob of SunTribunal) {

            const dx = player.location.x - mob.location.x;
            const dy = player.location.y - mob.location.y;
            const dz = player.location.z - mob.location.z;

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance <= 50) {

                player.applyDamage(10);
                player.setOnFire(8)
                player.sendMessage("§6Suas asas explodem numa erupção solar");

                break;
            }
        }
    }

}, 15);

