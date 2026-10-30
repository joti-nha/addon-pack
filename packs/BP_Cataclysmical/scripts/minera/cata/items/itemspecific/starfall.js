import { world, system } from "@minecraft/server";

const DespawnRadius = 60;
const DespawnRadiusSquared = DespawnRadius * DespawnRadius;

function isDay() {
    const time = world.getTimeOfDay() % 24000;
    return time < 13000 || time >= 23000;
}

//despawns starfall during the day
system.runInterval(() => {
    if (!isDay()) return;

    try {
        for (const player of world.getPlayers()) {
            const dim = player.dimension;
            const px = player.location.x;
            const py = player.location.y;
            const pz = player.location.z;

            const items = dim.getEntities({
                type: "minecraft:item",
                location: player.location,
                maxDistance: DespawnRadius
            });

            for (const item of items) {
                try {
                    const stack = item.getComponent("minecraft:item")?.itemStack;
                    if (!stack) continue;
                    if (stack.typeId !== "mnra_cata:starfall") continue;

                    const dx = item.location.x - px;
                    const dy = item.location.y - py;
                    const dz = item.location.z - pz;

                    if (dx * dx + dy * dy + dz * dz > DespawnRadiusSquared) continue;

                    dim.spawnParticle("mnra_cata:starfall_despawn", item.location);
                    item.remove();

                } catch {
                    continue;
                }
            }
        }
    } catch (e) { }
}, 20);



const MinDistance = 40;
const MaxDistance = 60;

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

//spawns starfall during the night
system.runInterval(() => {

    try {
        const time = world.getTimeOfDay() % 24000;

        if (time < 13000 || time > 23000) return;

        for (const player of world.getPlayers()) {

            if (Math.random() < 0.5) continue;

            const dim = player.dimension;

            const angle = Math.random() * Math.PI * 2;
            const distance = MinDistance + Math.random() * (MaxDistance - MinDistance);

            const x = Math.floor(player.location.x + Math.cos(angle) * distance);
            const z = Math.floor(player.location.z + Math.sin(angle) * distance);

            for (let y = 130; y >= 56; y--) {
                const block = dim.getBlock({ x, y, z });
                if (!block) continue;

                if (
                    PassableBlocks.includes(block.typeId) &&
                    block.above()?.typeId === "minecraft:air"
                ) {
                    dim.spawnEntity("mnra_cata:starfall_star", {
                        x: x + 0.5,
                        y: y + 1,
                        z: z + 0.5
                    });
                    break;
                }
            }
        }
    } catch (e) { }
}, 240);
