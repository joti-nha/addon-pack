import { world, system } from "@minecraft/server";

system.afterEvents.scriptEventReceive.subscribe((ev) => {
    if (ev.id !== "mnra_cata:soul_terror_teleport") return;

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

    for (let attempt = 0; attempt < 15; attempt++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = MinRadius + Math.random() * (MaxRadius - MinRadius);

        const baseX = Math.floor(target.location.x + Math.cos(angle) * radius);
        const baseZ = Math.floor(target.location.z + Math.sin(angle) * radius);
        const baseY = Math.floor(target.location.y + MaxYDistance);

        for (let y = baseY; y > target.location.y - 6; y--) {
            const block = dim.getBlock({ x: baseX, y, z: baseZ });
            const above = dim.getBlock({ x: baseX, y: y + 1, z: baseZ });
            const above2 = dim.getBlock({ x: baseX, y: y + 2, z: baseZ });

            if (!block || !above || !above2) continue;

            const isSolidGround = block.typeId !== "minecraft:air";
            const hasAirSpace =
                above.typeId === "minecraft:air" &&
                above2.typeId === "minecraft:air";

            if (isSolidGround && hasAirSpace) {
                caller.teleport(
                    { x: baseX + 0.5, y: y + 1, z: baseZ + 0.5 },
                    { dimension: dim, keepVelocity: false }
                );

                system.waitTicks(2).then(() => {
                    caller.runCommand("playsound mob.endermen.portal @a[r=32] ~ ~ ~ 0.8 1.3 1");
                });

                return;
            }
        }
    }
});