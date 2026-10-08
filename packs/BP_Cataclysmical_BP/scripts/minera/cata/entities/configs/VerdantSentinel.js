import { world, system } from "@minecraft/server";


const Projectiles = [
    "mnra_cata:verdant_sentinel_dash_attack",
    "mnra_cata:verdant_sentinel_double_attack",
    "mnra_cata:verdant_sentinel_heavy_attack",
    "mnra_cata:verdant_sentinel_move_attack",
    "mnra_cata:verdant_sentinel_normal_attack",
    "mnra_cata:verdant_sentinel_start_double_attack",
    "mnra_cata:verdant_sentinel_stomp_attack",
];

world.afterEvents.entityHurt.subscribe(event => {
    const player = event.hurtEntity;
    const source = event.damageSource?.damagingEntity;

    if (!player || player.typeId !== "minecraft:player") return;
    if (!source) return;

    if (!Projectiles.includes(source.typeId)) return;

    const dimension = player.dimension;
    const bosses = dimension.getEntities({
        type: "mnra_cata:verdant_sentinel",
        location: player.location,
        maxDistance: 64
    });

    if (bosses.length === 0) return;

    const boss = bosses[0];
    const BossProperty = "mnra_cata:is_flawless";

    boss.setProperty(BossProperty, false);
});