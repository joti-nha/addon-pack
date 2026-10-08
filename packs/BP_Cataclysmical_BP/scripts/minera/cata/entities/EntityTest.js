import * as server from "@minecraft/server"
import { TicksPerSecond, system } from "@minecraft/server";
const world = server.world


system.runInterval(() => {
    let mob =
        world.getDimension('overworld').getEntities({ families: ['debuff_immunity'] }).concat(
            world.getDimension('nether').getEntities({ families: ['debuff_immunity'] }),
            world.getDimension('the_end').getEntities({ families: ['debuff_immunity'] })
        )

    mob.forEach(entity => {
        entity.removeEffect("slowness")
        entity.removeEffect("mining_fatigue")
        entity.removeEffect("instant_damage")
        entity.removeEffect("blindness")
        entity.removeEffect("wither")
        entity.removeEffect("infested")
        entity.removeEffect("bad_omen")
    })
}, 20)


