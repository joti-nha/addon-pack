import { world, system } from "@minecraft/server";

let skeletonLegionActive = false;
let nightPreviously = false;


system.runInterval(() => {
    const time = world.getTimeOfDay() % 24000;
    const nightNow = time >= 13000 && time < 22000;

    if (nightNow && !nightPreviously) {
        startSkeletonLegionEvent();
    }

    if (!nightNow && nightPreviously) {
        skeletonLegionActive = false;
    }

    nightPreviously = nightNow;
}, 100);


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

export function startSkeletonLegionEvent() {
    if (skeletonLegionActive) return;

    const chance = 0.05;
    if (Math.random() > chance) return;

    skeletonLegionActive = true;

    const MinDistance = 40;
    const MaxDistance = 60;

    const Mobs = [
        { id: "minecraft:skeleton", min: 3, max: 5 },
        { id: "minecraft:stray", min: 2, max: 5 },
        { id: "mnra_cata:skeleton_paladin", min: 5, max: 8 },
    ];

    const Paladin = { id: "minecraft:parched" }; //placeholder for somthing :>

    for (const player of world.getPlayers()) {
        const dim = player.dimension;

        const angle = Math.random() * Math.PI * 2;
        const distance = MinDistance + Math.random() * (MaxDistance - MinDistance);

        const baseX = Math.floor(player.location.x + Math.cos(angle) * distance);
        const baseZ = Math.floor(player.location.z + Math.sin(angle) * distance);

        let spawnY = 0;
        for (let y = 130; y >= 56; y--) {
            const block = dim.getBlock({ x: baseX, y, z: baseZ });
            if (!block) continue;

            const below = dim.getBlock({ x: baseX, y: y - 1, z: baseZ });

            if (block.typeId === "minecraft:air" && below && PassableBlocks.includes(below.typeId)) {
                spawnY = y;
                break;
            }
        }

        if (!spawnY) continue;

        world.sendMessage(`§cUma Legião de Esqueletos está chegando em ${baseX}, ${baseZ}!`);
        player.runCommand(`playsound legion.spawn @a[r=64] ${baseX + 0.5} ${spawnY} ${baseZ + 0.5} 0.5 0.8 1`)

        dim.runCommand(`summon ${Paladin.id} ${baseX + 0.5} ${spawnY} ${baseZ + 0.5}`);

        const mobsToSpawn = [...Mobs].sort(() => Math.random() - 0.5);

        let spawnIndex = 0;

        for (const mob of mobsToSpawn) {
            const count = mob.min + Math.floor(Math.random() * (mob.max - mob.min + 1));

            for (let i = 0; i < count; i++) {

                const offsetX = baseX + (spawnIndex % 8) - 4;
                const offsetZ = baseZ + Math.floor(spawnIndex / 8) - 4;
                spawnIndex++;

                const cmd = `summon ${mob.id} ${offsetX + 0.5} ${spawnY} ${offsetZ + 0.5}`;

                try {
                    dim.runCommand(cmd);
                } catch { }
            }
        }
    }
}
