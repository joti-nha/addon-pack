import { world, system, TicksPerSecond, ItemStack, EntityComponentTypes } from "@minecraft/server";
import { GivePlayerTerror, RemovePlayerTerror, GetPlayerTerrorStage } from "../CataSystem/TerrorConfig";
import { getHeldItem } from "./entityHitEntity.js";


world.afterEvents.itemUse.subscribe(ev => {
    const player = ev.source

    if (!player) return;
    if (player.typeId !== "minecraft:player") return;

    const item = getHeldItem(player);
    if (!item) return;

    const random = Math.random()

    //item type
    switch (item.typeId) {
        case "mnra_cata:ecliptic_greatsword":
            if (!player.getItemCooldown('ecliptic_greatsword')) {
                player.startItemCooldown('ecliptic_greatsword', 400)
                player.startItemCooldown('ecliptic_greatsword_test', 200)


                player.runCommand("playsound sound.sunandmoonlight_change @a[r=14] ~ ~ ~ 1 1 1")

                player.runCommand("particle mnra_cata:ecliptic_greatsword_heart ~ ~ ~")
                player.runCommand("particle mnra_cata:ecliptic_greatsword_heart ~ ~ ~")
                player.runCommand("particle mnra_cata:ecliptic_greatsword_heart ~ ~ ~")

                player.runCommand("/camerashake add @p 0.3 1 positional")
                player.runCommand("/camerashake add @p 0.3 1 rotational")

                let health = player.getComponent("minecraft:health");
                if (health.currentValue < 10) {
                    health.setCurrentValue(0)
                } else {
                    health.setCurrentValue(health.currentValue - 10)
                }
            }
            break;

        case "mnra_cata:blazing_excalibur":
            if (!player.getItemCooldown('blazing_excalibur')) {
                player.startItemCooldown('blazing_excalibur', 500)
                player.startItemCooldown('blazing_excalibur_test', 160)
                player.runCommand("playsound sound.blazing_excalibur @a[r=12] ~ ~ ~ 3 1 1")
                player.runCommand("playsound sound.blazing_excalibur_song @s ~ ~ ~ 1 1 1")

                player.runCommand("particle mnra_cata:sun_orb_explode ~ ~1 ~")
                player.runCommand("particle mnra_cata:blazing_excalibur_impact_emitter ~ ~ ~")
            }
            break;

        case "mnra_cata:sunlight":
            if (!player?.getItemCooldown('sunmoonlight') && !player.isSneaking) {
                player.startItemCooldown('sunmoonlight', 120)

                player.runCommand("playsound sound.wand @a[r=10] ^^1^2 1 1 1")
                player.runCommand('summon mnra_cata:sun_orb ^^1^2')
            }
            if (!player?.getItemCooldown('sunmoonlight') && player.isSneaking) {
                player.startItemCooldown('sunmoonlight', 20)

                const playerEquippableComp = player.getComponent("equippable");
                playerEquippableComp.setEquipment("Mainhand", new ItemStack('mnra_cata:moonlight', 1));

                player.runCommand("particle mnra_cata:moonlight_change ~ ~ ~")
                player.runCommand("playsound sound.sunandmoonlight_change @a[r=10] ^^^1 1 1 1")
            }
            break;

        case "mnra_cata:moonlight":
            if (!player?.getItemCooldown('sunmoonlight') && !player.isSneaking) {
                player.runCommand("summon mnra_cata:phantom_moonlight ~ ~1 ~")
                player.runCommand("particle mnra_cata:moonlight_second_attack ~ ~1 ~")
                player.startItemCooldown('sunmoonlight', 120)
            }
            if (!player?.getItemCooldown('sunmoonlight') && player.isSneaking) {
                player.startItemCooldown('sunmoonlight', 20)

                const playerEquippableComp = player.getComponent("equippable");
                playerEquippableComp.setEquipment("Mainhand", new ItemStack('mnra_cata:sunlight', 1));

                player.runCommand("particle mnra_cata:sunlight_change ~ ~ ~")
                player.runCommand("playsound sound.sunandmoonlight_change @a[r=10] ^^^1 1 1 1")
            }
            break;

        case "mnra_cata:twilight_spear":
            if (!player.getItemCooldown('spear')) {
                player.applyKnockback({ x: -player.getViewDirection().x * -2.5, z: -player.getViewDirection().z * -2.5 }, 0.3);
                player.startItemCooldown('spear', 30)
                player.runCommand("particle mnra_cata:twilight_edge_phantom ~ ~ ~")
                player.runCommand("particle mnra_cata:twilight_edge_impact ~ ~ ~")
                player.runCommand("playanimation @s animation.ap.lanca_golpe") // [Addon Pack] golpe normal em vez do giro da lanca
                player.runCommand("playsound sound.spear_dash @s ^^^1 1 1 1")

            }
            break;

        case "mnra_cata:exodius_spear":
            if (!player.getItemCooldown('spear')) {
                player.applyKnockback({ x: -player.getViewDirection().x * 2.5, z: -player.getViewDirection().z * 2.5 }, 0.3);
                player.startItemCooldown('spear', 10)
                player.runCommand("playanimation @s animation.ap.lanca_golpe") // [Addon Pack] golpe normal em vez do giro da lanca
                player.runCommand("playsound sound.spear_dash @s ^^^1 1 1.7 1")

            }
            break;

        case "mnra_cata:sunflare_glaive":
            if (!player?.getItemCooldown('sunflare_glaive') && !player.isSneaking) {
                player.runCommand("playsound sound.spear_dash @s ^^^1 1 0.8 1")
                player.runCommand("playanimation @s animation.ap.lanca_golpe") // [Addon Pack] golpe normal, como as lancas
                player.runCommand("particle mnra_cata:blazing_excalibur_impact_emitter ~ ~ ~")
                player.startItemCooldown('sunflare_glaive', 100)

                const nearbyEntities = player.dimension.getEntities({
                    location: player.location,
                    maxDistance: 8,
                    closest: 5,
                    excludeFamilies: ["player"]
                });
                for (const entity of nearbyEntities) {
                    if (entity.hasComponent("health")) {
                        entity.runCommand("summon mnra_cata:player_solar_pillar ~ ~ ~ ")
                    }
                }
            }
            break;

        case "mnra_cata:phoenix_blade":
            if (!player.getItemCooldown('phoenix_blade')) {
                player.startItemCooldown('phoenix_blade', 200)
                player.runCommand("summon mnra_cata:player_phantom_phoenix_blade ^^1^ facing ^^^90 start1")
                player.runCommand("summon mnra_cata:player_phantom_phoenix_blade ^^1^ facing ^-90^^90 start1")
                player.runCommand("summon mnra_cata:player_phantom_phoenix_blade ^^1^ facing ^90^^90 start1")
            }
            break;

        case "mnra_cata:divine_scythe_of_heaven":
            if (!player.getItemCooldown('divine_scythe_of_heaven')) {
                player.startItemCooldown('divine_scythe_of_heaven', 400)

                player.runCommand("summon mnra_cata:sun_totem ^^^3 facing @n")
                player.runCommand("playsound sound.sunandmoonlight_change @a[r=10] ^^^1 1 1 1")
            }
            break;

        case "mnra_cata:empty_item":
            break;

        case "mnra_cata:empty_item":
            break;
    }
});


world.beforeEvents.itemUse.subscribe(ev => {
    const player = ev.source

    if (!player) return;
    if (player.typeId !== "minecraft:player") return;

    const item = getHeldItem(player);
    if (!item) return;

    const random = Math.random()
    const head = player.getHeadLocation();

    //item type
    switch (item.typeId) {
        case "mnra_cata:ray_gun":
            if (!player.getItemCooldown('ray_gun')) {
                if (random < 0.03) {
                    system.run(() => {
                        player.runCommand("particle mnra_cata:ray_gun_overload ~ ~ ~")
                        player.runCommand("particle mnra_cata:small_impact ~ ~1.5 ~")
                        player.runCommand('tag @s add ray_gun_overload')
                        player.runCommand("particle mnra_cata:massive_impact ~ ~0.5 ~")
                        player.runCommand("playsound sound.ray_gun_overload @a[r=10] ~ ~ ~ 1 1 1")
                        player.startItemCooldown('ray_gun', 100)
                        player.setOnFire(4)
                    })
                } else if (random < 1) {
                    system.run(() => {
                        const proj = player.dimension.spawnEntity("mnra_cata:solar_bolt", { x: head.x, y: head.y + 0.1, z: head.z });
                        const playerViewDirection = player.getViewDirection()
                        const projComp = proj.getComponent(EntityComponentTypes.Projectile);
                        const scale = { x: playerViewDirection.x * 1.8, y: playerViewDirection.y * 1.8, z: playerViewDirection.z * 1.8 }
                        projComp.owner = player;
                        projComp.shoot({ x: scale.x, y: scale.y, z: scale.z });
                        player.runCommand("playsound sound.laser_shoot @a[r=10] ^^^2 0.5 1 1")
                    });
                }
            }
            break;

        case "mnra_cata:spore_thrower":
            if (!player.getItemCooldown('spore_thrower')) {
                system.run(() => {
                    const proj = player.dimension.spawnEntity("mnra_cata:spore_thrower", { x: head.x, y: head.y + 0.1, z: head.z });
                    const playerViewDirection = player.getViewDirection()
                    const projComp = proj.getComponent(EntityComponentTypes.Projectile);
                    const scale = { x: playerViewDirection.x * 1.8, y: playerViewDirection.y * 1.8, z: playerViewDirection.z * 1.8 }
                    projComp.owner = player;
                    projComp.shoot({ x: scale.x, y: scale.y, z: scale.z });
                    player.startItemCooldown('spore_thrower', 10);
                    player.runCommand('playsound sound.feral_gas @s ^^^2 0.4 1.5 1');
                });
            }
            break;

        case "mnra_cata:terror_skull_launcher":
            if (!player.getItemCooldown('terror_skull_launcher')) {
                system.run(() => {
                    const proj = player.dimension.spawnEntity("mnra_cata:terror_skull_launcher", { x: head.x, y: head.y + 0.1, z: head.z });
                    const playerViewDirection = player.getViewDirection()
                    const projComp = proj.getComponent(EntityComponentTypes.Projectile);
                    const scale = { x: playerViewDirection.x * 1.8, y: playerViewDirection.y * 1.8, z: playerViewDirection.z * 1.8 }
                    projComp.owner = player;
                    projComp.shoot({ x: scale.x, y: scale.y, z: scale.z });
                    player.startItemCooldown('terror_skull_launcher', 10);
                    player.runCommand("playsound mob.spirit_scream @a[r=10] ^^^2 0.5 0.8 1")
                });
            }
            break;

        case "mnra_cata:empty_item":
            break;
    }
});

//itemcompleteUse
world.afterEvents.itemCompleteUse.subscribe(ev => {
    const player = ev.source

    if (!player) return;
    if (player.typeId !== "minecraft:player") return;

    const item = getHeldItem(player);

    const inventory = player.getComponent("minecraft:inventory")
    let GlassBottle = new ItemStack("minecraft:glass_bottle")

    if (!item) return;

    //item type
    switch (item.typeId) {
        case "mnra_cata:stellar_bottle":
            player.addEffect("regeneration", TicksPerSecond * 120, { amplifier: 1, showParticles: true });
            player.addEffect("health_boost", TicksPerSecond * 160, { amplifier: 1, showParticles: true });
            player.runCommand(`clear @s mnra_cata:stellar_bottle 0 1`);

            inventory.container.addItem(GlassBottle)
            break;

        case "mnra_cata:terror_bottle":
            GivePlayerTerror(player);

            player.runCommand(`clear @s mnra_cata:terror_bottle 0 1`);
            player.addEffect("wither", TicksPerSecond * 10, { amplifier: 2, showParticles: true });

            inventory.container.addItem(GlassBottle)
            break;

        case "mnra_cata:calming_bottle":
            RemovePlayerTerror(player);


            player.runCommand(`clear @s mnra_cata:calming_bottle 0 1`);
            player.addEffect("resistance", TicksPerSecond * 10, { amplifier: 1, showParticles: true });
            player.addEffect("weakness", TicksPerSecond * 10, { amplifier: 1, showParticles: true });

            inventory.container.addItem(GlassBottle)
            break;

        case "mnra_cata:annihilation_bottle":
            GivePlayerTerror(player);
            GivePlayerTerror(player);
            GivePlayerTerror(player);

            player.runCommand(`clear @s mnra_cata:annihilation_bottle 0 1`);
            player.addEffect("weakness", TicksPerSecond * 10, { amplifier: 2, showParticles: true });
            player.addEffect("blindness", TicksPerSecond * 10, { amplifier: 2, showParticles: true });
            player.addEffect("darkness", TicksPerSecond * 10, { amplifier: 2, showParticles: true });
            player.addEffect("slowness", TicksPerSecond * 10, { amplifier: 2, showParticles: true });
            player.addEffect("wither", TicksPerSecond * 10, { amplifier: 2, showParticles: true });

            inventory.container.addItem(GlassBottle)
            break;

        case "mnra_cata:legion_horn":
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
