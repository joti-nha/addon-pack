import { world, system, TicksPerSecond } from "@minecraft/server";

//function for getting item type thinggie
export function getHeldItem(player) {
    try {
        const inv = player.getComponent("inventory")?.container;
        if (!inv) return null;

        const slot = player.selectedSlotIndex;
        if (slot === undefined || slot === null) return null;

        return inv.getItem(slot) ?? null;
    } catch {
        return null;
    }
}


//vanilla greatswords
world.afterEvents.entityHitEntity.subscribe(ev => {
    const player = ev.damagingEntity;
    const target = ev.hitEntity;

    if (!player || !target) return;
    if (player.typeId !== "minecraft:player") return;

    const item = getHeldItem(player);
    if (!item) return;

    const random = Math.random()

    //item type
    switch (item.typeId) {
        case "mnra_cata:wooden_greatsword":
            target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.5 1.2 1")
            if (random < 0.8) {
                system.waitTicks(10).then(() => {
                    target.applyDamage(2, { cause: "entityAttack" })
                    target.runCommand("particle mnra_cata:greatsword_crit ~ ~ ~")
                    target.runCommand("playsound step.amethyst_block @a[r=8] ~ ~ ~ 3 0.7 10")
                    try {
                    } catch { }
                });
            }
            break;

        case "mnra_cata:stone_greatsword":
            target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.5 1.2 1")
            if (random < 0.8) {
                system.waitTicks(10).then(() => {
                    target.applyDamage(2, { cause: "entityAttack" })
                    target.runCommand("particle mnra_cata:greatsword_crit ~ ~ ~")
                    target.runCommand("playsound step.amethyst_block @a[r=8] ~ ~ ~ 3 0.7 10")
                    try {
                    } catch { }
                });
            }
            break;

        case "mnra_cata:copper_greatsword":
            target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.5 1.2 1")
            if (random < 0.8) {
                system.waitTicks(10).then(() => {
                    target.applyDamage(2, { cause: "entityAttack" })
                    target.runCommand("particle mnra_cata:greatsword_crit ~ ~ ~")
                    target.runCommand("playsound step.amethyst_block @a[r=8] ~ ~ ~ 3 0.7 10")
                    try {
                    } catch { }
                });
            }
            break;

        case "mnra_cata:iron_greatsword":
            target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.5 1.2 1")
            if (random < 0.7) {
                system.waitTicks(10).then(() => {
                    target.applyDamage(2, { cause: "entityAttack" })
                    target.runCommand("particle mnra_cata:greatsword_crit ~ ~ ~")
                    target.runCommand("playsound step.amethyst_block @a[r=8] ~ ~ ~ 3 0.7 10")
                    try {
                    } catch { }
                });
            }
            break;

        case "mnra_cata:gold_greatsword":
            target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.5 1.2 1")
            if (random < 0.8) {
                system.waitTicks(10).then(() => {
                    target.applyDamage(2, { cause: "entityAttack" })
                    target.runCommand("particle mnra_cata:greatsword_crit ~ ~ ~")
                    target.runCommand("playsound step.amethyst_block @a[r=8] ~ ~ ~ 3 0.7 10")
                    try {
                    } catch { }
                });
            }
            break;

        case "mnra_cata:diamond_greatsword":
            target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.5 1.2 1")
            if (random < 0.6) {
                system.waitTicks(10).then(() => {
                    target.applyDamage(2, { cause: "entityAttack" })
                    target.runCommand("particle mnra_cata:greatsword_crit ~ ~ ~")
                    target.runCommand("playsound step.amethyst_block @a[r=8] ~ ~ ~ 3 0.7 10")
                    try {
                    } catch { }
                });
            }
            break;

        case "mnra_cata:netherite_greatsword":
            target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.5 1.2 1")
            if (random < 0.5) {
                system.waitTicks(10).then(() => {
                    target.applyDamage(2, { cause: "entityAttack" })
                    target.runCommand("particle mnra_cata:greatsword_crit ~ ~ ~")
                    target.runCommand("playsound step.amethyst_block @a[r=8] ~ ~ ~ 3 0.7 10")
                    try {
                    } catch { }
                });
            }
            break;

        case "mnra_cata:platinum_greatsword":
            target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.5 1.2 1")
            if (random < 0.6) {
                system.waitTicks(10).then(() => {
                    target.applyDamage(2, { cause: "entityAttack" })
                    target.runCommand("particle mnra_cata:greatsword_crit ~ ~ ~")
                    target.runCommand("playsound step.amethyst_block @a[r=8] ~ ~ ~ 3 0.7 10")
                    try {
                    } catch { }
                });
            }
            break;
    }
});


//Weapons
world.afterEvents.entityHitEntity.subscribe(ev => {
    const player = ev.damagingEntity;
    const target = ev.hitEntity;

    if (!player || !target) return;
    if (player.typeId !== "minecraft:player") return;

    const item = getHeldItem(player);
    if (!item) return;

    const random = Math.random()

    //item type
    switch (item.typeId) {
        case "mnra_cata:stellar_greatsword":
            if (random < 0.4) {

                system.waitTicks(10).then(() => {
                    target.applyDamage(4, { cause: "entityAttack" })
                    target.runCommand("particle mnra_cata:stellar_greatsword_star_crit ~ ~ ~")
                    player.runCommand("particle mnra_cata:stellar_greatsword_emitter ^^0.1^1.2")
                    target.runCommand('playsound step.amethyst_block @a[r=8] ~ ~ ~ 10 1.6 10')
                    try {
                    } catch { }
                });

                const nearbyEntities = player.dimension.getEntities({
                    location: player.location,
                    maxDistance: 4,
                    closest: 6,
                    excludeFamilies: ["player"]
                });
                for (const entity of nearbyEntities) {
                    if (entity.hasComponent("health")) {

                        entity.applyDamage(5, { cause: "entityAttack" })
                        entity.runCommand("particle mnra_cata:stellar_greatsword_crit ~ ~ ~")
                        entity.runCommand("particle mnra_cata:stellar_greatsword_star_crit ~ ~ ~")
                        entity.runCommand("playsound mace.smash_air @a[r=10] ~ ~ ~ 0.2 1.3 1")
                        entity.applyKnockback({ x: -player.getViewDirection().x * -0.8, z: -player.getViewDirection().z * -0.8 }, 0.5);
                    }
                }
            }
            break;

        case "mnra_cata:phantasma_greatsword":
            if (player.hasTag('HasTerrorStage5')) {
                target.applyDamage(18, { cause: "entityAttack" })
                target.applyKnockback({ x: -player.getViewDirection().x * -0.6, z: -player.getViewDirection().z * -0.6 }, 0.2);
                target.runCommand(`playsound sound.solar_explosion @a[r=12] ~ ~ ~ 0.2 2.5 1`)
                target.runCommand(`particle mnra_cata:phantasma_stabilizer_bolt ~ ~ ~`)
                target.runCommand(`particle mnra_cata:phantasma_greatsword_stage3 ~ ~ ~`)

            } else if (player.hasTag('HasTerrorStage4')) {
                target.applyDamage(15, { cause: "entityAttack" })
                target.applyKnockback({ x: -player.getViewDirection().x * -0.4, z: -player.getViewDirection().z * -0.4 }, 0.2);
                target.runCommand(`playsound sound.solar_explosion @a[r=12] ~ ~ ~ 0.2 2.5 1`)
                target.runCommand(`particle mnra_cata:phantasma_stabilizer_bolt ~ ~ ~`)
                target.runCommand(`particle mnra_cata:phantasma_greatsword_stage2 ~ ~ ~`)

            } else if (player.hasTag('HasTerrorStage3')) {
                target.runCommand(`playsound sound.solar_explosion @a[r=12] ~ ~ ~ 0.2 2.5 1`)
                target.applyDamage(12, { cause: "entityAttack" })
                target.runCommand(`particle mnra_cata:phantasma_stabilizer_bolt ~ ~ ~`)
                target.runCommand(`particle mnra_cata:phantasma_greatsword_stage1 ~ ~ ~`)

            } else if (player.hasTag('HasTerrorStage2')) {
                target.runCommand(`playsound sound.solar_explosion @a[r=12] ~ ~ ~ 0.2 2.5 1`)
                target.applyDamage(9, { cause: "entityAttack" })
                target.runCommand(`particle mnra_cata:phantasma_stabilizer_bolt ~ ~ ~`)
                target.runCommand(`particle mnra_cata:phantasma_greatsword_stage1 ~ ~ ~`)

            } else if (player.hasTag('HasTerrorStage1')) {
                target.runCommand(`playsound sound.solar_explosion @a[r=12] ~ ~ ~ 0.2 2.5 1`)
                target.applyDamage(6, { cause: "entityAttack" })
                target.runCommand(`particle mnra_cata:phantasma_stabilizer_bolt ~ ~ ~`)

            }
            break;

        case "mnra_cata:exodius_greatsword":
            target.applyKnockback({ x: -player.getViewDirection().x * -0.3, z: -player.getViewDirection().z * -0.3 }, 0.3);
            target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.2 1 1")
            break;

        case "mnra_cata:twilight_edge":
            if (!player.getItemCooldown('twilight_edge')) {
                player.startItemCooldown('twilight_edge', 100)
                const nearbyEntities = player.dimension.getEntities({
                    location: target.location,
                    closest: 3,
                    maxDistance: 4,
                    excludeFamilies: ["player"]
                });
                for (const entity of nearbyEntities) {
                    if (entity.hasComponent("health")) {
                        entity.runCommand("summon mnra_cata:twilight_edge_phantom ~ ~ ~")
                    }
                }
            }
            target.runCommand("particle mnra_cata:twilight_edge_impact ~ ~ ~")
            target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.2 1 1")
            break

        case "mnra_cata:ecliptic_greatsword":
            if (player.getItemCooldown('ecliptic_greatsword_test')) {
                target.runCommand("particle mnra_cata:ecliptic_greatsword_impact ~ ~ ~")
                target.applyDamage(18, { cause: "entityAttack" })
            }

            if (player.getItemCooldown('ecliptic_greatsword_test')) {
                target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.2 0.8 1")
            } else {
                target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.2 1 1")
            }

            target.applyKnockback({ x: -player.getViewDirection().x * -0.3, z: -player.getViewDirection().z * -0.3 }, 0.3);
            target.runCommand("particle mnra_cata:ecliptic_greatsword_impact ~ ~ ~")
            break

        case "mnra_cata:verdant_blade":
            player.runCommand('particle mnra_cata:verdant_sweep ^^0.1^1.8')

            if (!player.getItemCooldown('verdant_blade')) {
                target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 1 0.8 1")
            } else {
                target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.9 1 1")
            }
            target.applyKnockback({ x: -player.getViewDirection().x * -0.5, z: -player.getViewDirection().z * -0.5 }, 0.2);

            if (!player.getItemCooldown('verdant_blade')) {
                player.startItemCooldown('verdant_blade', 200)

                target.addEffect("weakness", TicksPerSecond * 3, { amplifier: 1, showParticles: true });
                target.addEffect("slowness", TicksPerSecond * 3, { amplifier: 0, showParticles: true });
                target.applyDamage(12, { cause: "entityAttack" })
                const nearbyEntities = player.dimension.getEntities({
                    location: player.location,
                    maxDistance: 4,
                    excludeFamilies: ["player"]
                });
                for (const entity of nearbyEntities) {
                    if (entity.hasComponent("health")) {
                        entity.applyDamage(5, { cause: "entityAttack" })
                        entity.applyKnockback({ x: -player.getViewDirection().x * -0.8, z: -player.getViewDirection().z * -0.8 }, 0.5);
                    }
                }

            }
            break

        case "mnra_cata:sun_striker_claymore":
            target.runCommand("playsound sound.powerful_sword_swing @a[r=16] ~ ~ ~ 0.9 1 1")
            target.runCommand("particle mnra_cata:morningstar_impact ~ ~1 ~")
            target.setOnFire(3)
            target.applyKnockback({ x: -player.getViewDirection().x * -0.3, z: -player.getViewDirection().z * -0.3 }, 0.2);
            if (!player.getItemCooldown('sun_striker_claymore')) {
                player.startItemCooldown('sun_striker_claymore', 100)

                target.runCommand("particle mnra_cata:morningstar_impact ~ ~1 ~")
                target.runCommand("particle mnra_cata:morningstar_impact ~ ~1 ~")
                target.runCommand("playsound sound.sunandmoonlight_change @a[r=16] ~ ~ ~ 2 0.8 1")
                target.runCommand("playsound sound.sword_impact @a[r=32] ~ ~ ~ 2 0.8 1")
                target.applyKnockback({ x: -player.getViewDirection().x * -2, z: -player.getViewDirection().z * -2 }, 1);

                const nearbyEntities = player.dimension.getEntities({
                    location: player.location,
                    closest: 5,
                    maxDistance: 5,
                    excludeFamilies: ["player"]
                });
                for (const entity of nearbyEntities) {
                    if (entity.hasComponent("health")) {
                        entity.setOnFire(5)
                        entity.applyKnockback({ x: -player.getViewDirection().x * -2, z: -player.getViewDirection().z * -2 }, 1);

                        entity.runCommand("playsound sound.sword_impact @a[r=16] ~ ~ ~ 0.9 0.8 1")
                        entity.runCommand("particle mnra_cata:morningstar_impact ~ ~1 ~")
                        entity.runCommand("particle mnra_cata:morningstar_impact ~ ~1 ~")

                    }
                }
            }
            break;

        case "mnra_cata:stellar_mace":
            if (!player.getItemCooldown('stellar_mace')) {
                target.applyDamage(18, { cause: "entityAttack" })
                target.runCommand("particle mnra_cata:stellar_mace_hit ~ ~ ~")
                target.runCommand("particle mnra_cata:stellar_mace_astral_hit ~ ~ ~")
                target.runCommand("particle mnra_cata:stellar_greatsword_star_crit ~ ~ ~")
                target.runCommand("playsound mace.smash_air @a[r=10] ~ ~ ~ 1 0.8 1")
                target.applyKnockback({ x: -player.getViewDirection().x * -0.2, z: -player.getViewDirection().z * -0.2 }, 0.8);

                player.runCommand("particle mnra_cata:stellar_greatsword_emitter ^^0.1^1.2")
                player.startItemCooldown('stellar_mace', 20)

                const nearbyEntities = player.dimension.getEntities({
                    location: player.location,
                    maxDistance: 8,
                    closest: 12,
                    excludeFamilies: ["player"]
                });
                for (const entity of nearbyEntities) {
                    if (entity.hasComponent("health")) {
                        entity.applyDamage(12, { cause: "entityAttack" })
                        entity.runCommand("playsound mace.smash_air @a[r=10] ~ ~ ~ 1 0.8 1")
                        entity.applyKnockback({ x: -player.getViewDirection().x * -0.2, z: -player.getViewDirection().z * -0.2 }, 0.8);
                    }
                }
            } else if (player.getItemCooldown('stellar_mace')) {
                player.runCommand("particle mnra_cata:stellar_greatsword_emitter ^^0.1^1.2")
                player.startItemCooldown('stellar_mace', 60)
                player.addEffect("weakness", TicksPerSecond * 3, { amplifier: 5, showParticles: true });

                target.runCommand('playsound step.amethyst_block @a[r=10] ~ ~ ~ 10 1.6 10')
                return
            }
            break;

        case "mnra_cata:sunlight":
            target.applyKnockback({ x: -player.getViewDirection().x * -0.4, z: -player.getViewDirection().z * -0.4 }, 0.3);
            target.setOnFire(3)
            target.runCommand("particle mnra_cata:morningstar_impact ~ ~1 ~")

            target.runCommand("playsound sound.electric_blade @a[r=12] ~ ~ ~ 0.3 1 1")
            break;

        case "mnra_cata:moonlight":
            target.applyKnockback({ x: -player.getViewDirection().x * -0.2, z: -player.getViewDirection().z * -0.2 }, 0.3);
            target.addEffect("weakness", TicksPerSecond * 3, { amplifier: 0, showParticles: true });

            target.runCommand("playsound sound.electric_blade @a[r=12] ~ ~ ~ 0.3 1 1")
            break;

        case "mnra_cata:star_fallen":
            target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.9 0.8 1")
            target.runCommand("particle mnra_cata:stellar_greatsword_star_crit ~ ~ ~")
            break

        case "mnra_cata:sunflare_glaive":
            target.setOnFire(5)
            target.runCommand("particle mnra_cata:blazing_excalibur_impact ~ ~ ~")
            target.applyKnockback({ x: -player.getViewDirection().x * -1, z: -player.getViewDirection().z * -1 }, 0.3);


            break

        case "mnra_cata:anchor":
            target.applyKnockback({ x: -player.getViewDirection().x * 1.5, z: -player.getViewDirection().z * 1.5 }, 0.3);
            target.runCommand("playsound random.anvil_break @a[r=10] ~ ~ ~ 0.6 1.2 1")
            break

        case "mnra_cata:meowclysm":
            target.applyDamage(999)
            break

        case "mnra_cata:star_sword":
            if (!player.getItemCooldown('star_sword')) {

                const nearbyEntities = player.dimension.getEntities({
                    location: target.location,
                    maxDistance: 5,
                    closest: 1,
                    excludeFamilies: ["player"]
                });
                for (const entity of nearbyEntities) {
                    if (entity.hasComponent("health")) {
                        entity.runCommand("summon mnra_cata:star_sword ~ ~ ~")
                    }
                }
            }
            break

        case "mnra_cata:phoenix_blade":
            target.setOnFire(5)
            target.applyKnockback({ x: -player.getViewDirection().x * -1.3, z: -player.getViewDirection().z * -1.3 }, 0.3);
            target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.9 0.8 1")
            break

        case "mnra_cata:star_fracture":
            if (player.hasTag('star_fracture_active')) {
                target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.9 0.8 1")
                target.applyDamage(16, { cause: "entityAttack" })

                const nearbyEntities = player.dimension.getEntities({
                    location: target.location,
                    maxDistance: 12,
                    closest: 10,
                    excludeFamilies: ["player"]
                });
                for (const entity of nearbyEntities) {
                    if (entity.hasComponent("health")) {
                        entity.runCommand("summon mnra_cata:star_sword ~ ~ ~")
                    }
                }
            } else {
                const nearbyEntities = player.dimension.getEntities({
                    location: target.location,
                    maxDistance: 5,
                    closest: 3,
                    excludeFamilies: ["player"]
                });
                for (const entity of nearbyEntities) {
                    if (entity.hasComponent("health")) {
                        entity.runCommand("summon mnra_cata:star_sword ~ ~ ~")
                    }
                }
            }
            target.runCommand("particle mnra_cata:star_fracture_impact ~ ~1 ~")

            break

        case "mnra_cata:verdant_greatsword":
            if (!player.getItemCooldown('verdant_greatsword')) {
                player.startItemCooldown('verdant_greatsword', 20)

                const nearbyEntities = player.dimension.getEntities({
                    location: target.location,
                    maxDistance: 8,
                    closest: 2,
                    excludeFamilies: ["player"]
                });
                for (const entity of nearbyEntities) {
                    if (entity.hasComponent("health")) {
                        entity.runCommand("summon mnra_cata:verdant_sentinel_arm_summon ~ ~ ~ facing @n")
                    }
                }
            }

            break

        case "mnra_cata:divine_scythe_of_heaven":
            if (!player.getItemCooldown('mnra_cata:divine_scythe_of_heaven')) {
                target.setOnFire(5)
                target.runCommand("particle mnra_cata:blazing_excalibur_impact ~ ~ ~")
                target.runCommand("particle mnra_cata:blazing_excalibur_impact ~ ~ ~")
                target.runCommand("particle mnra_cata:blazing_excalibur_impact ~ ~ ~")
                target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.9 0.6 1")

                const nearbyEntities = player.dimension.getEntities({
                    location: target.location,
                    maxDistance: 8,
                    closest: 8,
                    excludeFamilies: ["player"]
                });
                for (const entity of nearbyEntities) {
                    if (entity.hasComponent("health")) {
                        entity.setOnFire(5)
                        entity.applyDamage(12, { cause: "entityAttack" })

                        entity.runCommand("particle mnra_cata:blazing_excalibur_impact ~ ~ ~")
                        entity.runCommand("particle mnra_cata:blazing_excalibur_impact ~ ~ ~")
                        entity.runCommand("particle mnra_cata:blazing_excalibur_impact ~ ~ ~")
                        target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.9 0.6 1")
                    }
                }
            }
            break

        case "mnra_cata:empty_item":
            break

        case "mnra_cata:empty_item":
            break

        case "mnra_cata:empty_item":
            break

        case "mnra_cata:empty_item":
            break
    }
});


//Damage to Elemental Mobs
world.afterEvents.entityHitEntity.subscribe(ev => {
    const player = ev.damagingEntity;
    const target = ev.hitEntity;

    if (!player || !target) return;
    if (player.typeId !== "minecraft:player") return;

    const item = getHeldItem(player);
    if (!item) return;

    const random = Math.random()
    const family = target.getComponent("type_family")
    let IsElemental = family.hasTypeFamily("elemental")

    //item type
    switch (item.typeId) {
        case "mnra_cata:platinum_greatsword":
            if (IsElemental) {
                system.waitTicks(10).then(() => {
                    target.runCommand("playsound mace.smash_ground @a[r=10] ~ ~ ~ 0.5 2 1")
                    target.applyDamage(4, { cause: "entityAttack" })
                    target.runCommand("particle mnra_cata:greatsword_crit ~ ~ ~")
                    try {
                    } catch { }
                });
            }
            break;

        case "mnra_cata:platinum_sword":
            if (IsElemental) {
                system.waitTicks(10).then(() => {
                    target.runCommand("playsound mace.smash_ground @a[r=10] ~ ~ ~ 0.5 2 1")
                    target.applyDamage(4, { cause: "entityAttack" })
                    target.runCommand("particle mnra_cata:greatsword_crit ~ ~ ~")
                    try {
                    } catch { }
                });
            }
            break;

        case "mnra_cata:platinum_halberd":
            target.runCommand("playsound sound.sword_impact @a[r=10] ~ ~ ~ 0.5 1.2 1")
            target.applyKnockback({ x: -player.getViewDirection().x * -0.8, z: -player.getViewDirection().z * -0.8 }, 0.5);
            if (IsElemental) {
                system.waitTicks(10).then(() => {
                    target.runCommand("playsound mace.smash_ground @a[r=10] ~ ~ ~ 0.5 2 1")
                    target.applyDamage(4, { cause: "entityAttack" })
                    target.runCommand("particle mnra_cata:greatsword_crit ~ ~ ~")
                    try {
                    } catch { }
                });
            }
            break;
    }
});


//Elemental
world.afterEvents.entityHitEntity.subscribe(ev => {
    const player = ev.damagingEntity;
    const target = ev.hitEntity;

    if (!player || !target) return;
    if (player.typeId !== "minecraft:player") return;

    const item = getHeldItem(player);
    if (!item) return;

    const random = Math.random()
    const family = target.getComponent("type_family")
    let IsElemental = family.hasTypeFamily("elemental")

    //item type
    switch (item.typeId) {
        case "mnra_cata:floret_hatchet":
            if (!player.getItemCooldown('elemental_weapon')) {
                player.startItemCooldown('elemental_weapon', 100)

                const nearbyEntities = player.dimension.getEntities({
                    location: player.location,
                    maxDistance: 4,
                    closest: 4,
                    excludeFamilies: ["player"]
                });
                for (const entity of nearbyEntities) {
                    if (entity.hasComponent("health")) {
                        entity.applyDamage(5, { cause: "entityAttack" })

                        entity.runCommand("particle mnra_cata:poison_dust ~ ~1 ~")

                        entity.addEffect("poison", TicksPerSecond * 5, { amplifier: 2, showParticles: true });
                        entity.addEffect("slowness", TicksPerSecond * 5, { amplifier: 2, showParticles: true });
                        entity.applyKnockback({ x: -player.getViewDirection().x * -0.6, z: -player.getViewDirection().z * -0.6 }, 0.3);
                    }
                }

                player.runCommand("playsound sound.large_sword_swing @a[r=10] ^^^2 0.3 1.7 1")

                player.runCommand("particle mnra_cata:poison_sweep ^^0.1^1.2")
                target.runCommand("particle mnra_cata:poison_dust ~ ~1 ~")

            } else if (player.getItemCooldown('elemental_weapon')) {
                target.addEffect("poison", TicksPerSecond * 3, { amplifier: 0, showParticles: true });
            }
            break;

        case "mnra_cata:morningstar":
            if (!player.getItemCooldown('elemental_weapon')) {
                player.startItemCooldown('elemental_weapon', 100)
                player.runCommand("playsound sound.solar_swing @a[r=10] ~ ~ ~ 0.3 1 1")

                target.applyKnockback({ x: -player.getViewDirection().x * -0.4, z: -player.getViewDirection().z * -0.4 }, 0.7);
                target.runCommand("particle mnra_cata:morningstar_impact ~ ~1 ~")
                target.setOnFire(4)
                target.applyDamage(18, { cause: "entityAttack" })

            } else if (player.getItemCooldown('elemental_weapon')) {
                target.setOnFire(2)
                player.runCommand("playsound sound.small_sword_swing @a[r=10] ^^^2 0.8 0.7 1")
            }
            break;

        case "mnra_cata:everbloom":
            target.runCommand("particle mnra_cata:poison_dust ~ ~1 ~")
            target.runCommand("playsound sound.sword_impact @a[r=32] ~ ~ ~ 2 1.2 1")
            target.applyKnockback({ x: -player.getViewDirection().x * -0.3, z: -player.getViewDirection().z * -0.3 }, 0.2);

            if (!player.getItemCooldown('everbloom')) {
                player.startItemCooldown('everbloom', 100)

                const nearbyEntities = player.dimension.getEntities({
                    location: player.location,
                    closest: 3,
                    maxDistance: 8,
                    excludeFamilies: ["player"]
                });
                for (const entity of nearbyEntities) {
                    if (entity.hasComponent("health")) {
                        entity.runCommand("particle mnra_cata:poison_dust ~ ~1 ~")
                        entity.runCommand("particle mnra_cata:floret_bolt_impact ~ ~1 ~")

                        entity.addEffect("poison", TicksPerSecond * 5, { amplifier: 2, showParticles: true });
                        entity.runCommand("summon mnra_cata:feral_fang_summon ~ ~ ~")
                        entity.applyKnockback({ x: -player.getViewDirection().x * -0.3, z: -player.getViewDirection().z * -0.3 }, 0.2);

                    }
                }
            }
            break;

        case "mnra_cata:blazing_excalibur":
            if (player.getItemCooldown('blazing_excalibur_test')) {
                target.applyDamage(26, { cause: "entityAttack" })
                target.runCommand("particle mnra_cata:blazing_excalibur_impact ~ ~ ~")
                target.runCommand("particle mnra_cata:blazing_excalibur_impact ~ ~ ~")
                target.runCommand("particle mnra_cata:blazing_excalibur_impact_emitter ~ ~ ~")
                target.runCommand("playsound sound.sunandmoonlight_change @a[r=14] ~ ~ ~ 0.8 1.3 1")
                player.runCommand("/camerashake add @p 0.1 0.3 positional")

            }
            target.applyKnockback({ x: -player.getViewDirection().x * -0.4, z: -player.getViewDirection().z * -0.4 }, 0.3);
            target.setOnFire(3)
            target.runCommand("particle mnra_cata:blazing_excalibur_impact ~ ~ ~")
            target.runCommand("playsound sound.electric_blade @a[r=12] ~ ~ ~ 0.3 1 1")

            const nearbyEntities = player.dimension.getEntities({
                location: player.location,
                maxDistance: 4,
                closest: 8,
                excludeFamilies: ["player"]
            });
            for (const entity of nearbyEntities) {
                if (entity.hasComponent("health")) {

                    if (player.getItemCooldown('blazing_excalibur_test')) {
                        entity.applyDamage(10, { cause: "entityAttack" })
                        entity.runCommand("particle mnra_cata:blazing_excalibur_impact ~ ~ ~")
                        entity.runCommand("particle mnra_cata:blazing_excalibur_impact ~ ~ ~")

                    } else {
                        entity.applyDamage(4, { cause: "entityAttack" })
                    }
                    entity.setOnFire(3)
                    entity.runCommand("particle mnra_cata:blazing_excalibur_impact ~ ~ ~")
                    entity.applyKnockback({ x: -player.getViewDirection().x * -0.2, z: -player.getViewDirection().z * -0.2 }, 0.3);
                }
            }
            break;

        case "mnra_cata:moonsickle":
            target.runCommand("playsound sound.sword_impact @a[r=32] ~ ~ ~ 2 1.2 1")
            target.applyKnockback({ x: -player.getViewDirection().x * 2, z: -player.getViewDirection().z * 2 }, 0.5);
            target.runCommand("particle mnra_cata:moonsickle_gravity ~ ~ ~")
            if (!player.getItemCooldown('elemental_weapon')) {
                player.startItemCooldown('elemental_weapon', 20)

                const nearbyEntities = player.dimension.getEntities({
                    location: player.location,
                    closest: 5,
                    maxDistance: 5,
                    excludeFamilies: ["player"]
                });
                for (const entity of nearbyEntities) {
                    if (entity.hasComponent("health")) {
                        entity.applyDamage(10, { cause: "entityAttack" })
                        entity.applyKnockback({ x: -player.getViewDirection().x * 1, z: -player.getViewDirection().z * 1 }, 0.5);
                        entity.runCommand("playsound sound.sword_impact @a[r=32] ~ ~ ~ 0.9 1.3 1")
                        entity.runCommand("particle mnra_cata:moonsickle_gravity ~ ~ ~")
                    }
                }
            }
            break;

        case "mnra_cata:empty_item":
            break;

        case "mnra_cata:empty_item":
            break;

    }
});