import { world, system, TicksPerSecond } from "@minecraft/server";
import { getHeldItem } from "./entityHitEntity.js";

world.afterEvents.entityHitBlock.subscribe(ev => {
    const player = ev.damagingEntity
    const block = ev.hitBlock
    const { x, y, z } = block
    const BlockDimension = block.dimension

    if (!player) return;
    if (player.typeId !== "minecraft:player") return;

    const item = getHeldItem(player);
    if (!item) return;

    const random = Math.random()

    //item type
    switch (item.typeId) {
        case "mnra_cata:everbloom":
            if (player.isSneaking && !player.getItemCooldown('everbloom')) {
                player.startItemCooldown('everbloom', 120)

                block.dimension.runCommand(`playsound sound.sword_impact @a[r=14] ${x} ${y} ${z} 1 1 1`)
                system.waitTicks(2).then(() => {
                    BlockDimension.runCommand(`summon mnra_cata:feral_fang_summon ${x + 3} ${y + 1} ${z}`)
                    BlockDimension.runCommand(`summon mnra_cata:feral_fang_summon ${x - 3} ${y + 1} ${z}`)
                    BlockDimension.runCommand(`summon mnra_cata:feral_fang_summon ${x} ${y + 1} ${z + 3}`)
                    BlockDimension.runCommand(`summon mnra_cata:feral_fang_summon ${x} ${y + 1} ${z - 3}`)
                    BlockDimension.runCommand(`summon mnra_cata:feral_fang_summon ${x} ${y + 1} ${z}`)
                })
                system.waitTicks(10).then(() => {
                    BlockDimension.runCommand(`summon mnra_cata:feral_fang_summon ${x + 5} ${y + 1} ${z}`)
                    BlockDimension.runCommand(`summon mnra_cata:feral_fang_summon ${x - 5} ${y + 1} ${z}`)
                    BlockDimension.runCommand(`summon mnra_cata:feral_fang_summon ${x} ${y + 1} ${z + 5}`)
                    BlockDimension.runCommand(`summon mnra_cata:feral_fang_summon ${x} ${y + 1} ${z - 5}`)

                    BlockDimension.runCommand(`summon mnra_cata:feral_fang_summon ${x + 5} ${y + 1} ${z + 5}`)
                    BlockDimension.runCommand(`summon mnra_cata:feral_fang_summon ${x - 5} ${y + 1} ${z - 5}`)
                    BlockDimension.runCommand(`summon mnra_cata:feral_fang_summon ${x - 5} ${y + 1} ${z + 5}`)
                    BlockDimension.runCommand(`summon mnra_cata:feral_fang_summon ${x + 5} ${y + 1} ${z - 5}`)
                    BlockDimension.runCommand(`summon mnra_cata:feral_fang_summon ${x} ${y + 1} ${z}`)
                })
            }
            break;

        case "mnra_cata:empty_item":
            break;

        case "mnra_cata:empty_item":
            break;

        case "mnra_cata:empty_item":
            break;

        case "mnra_cata:empty_item":
            break;

        case "mnra_cata:empty_item":
            break;

    }
});