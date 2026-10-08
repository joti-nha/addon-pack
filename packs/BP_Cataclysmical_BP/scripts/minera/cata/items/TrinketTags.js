import { world, system, TicksPerSecond } from "@minecraft/server";

const AegisProtectionDamage = [
    "entityAttack",
    "entityExplosion",
    "maceSmash",
    "projectile",
    "ramAttack",
    "sonicBoom",
]
//+1.5 Aegis Protection = 3, 33.3% healed
//+2 Aegis Protection = 2.5, 40% healed
//+2.5 Aegis Protection = 2, 50% healed
//+3 Aegis Protection = 1.5, 66.7% healed
//+3.5 Aegis Protection = 1.5, 66.7% healed
//+3.8 Aegis Protection = 1.25, 80% healed

//+0.5 Aegis Reflection = 5, 20% dealt
//+1.5 Aegis Reflection = 4.5, 22.2% dealt
//+2 Aegis Reflection = 4, 25% dealt
//+2.5 Aegis Reflection = 3.5, 28.6% dealt
//+3 Aegis Reflection = 3, 33.3% dealt
//+3.5 Aegis Reflection = 2.5, 40% dealt
//+4 Aegis Reflection = 2, 50% dealt


world.afterEvents.entityHurt.subscribe(data => {
    try {

        const player = data.hurtEntity
        const mob = data.damageSource?.damagingEntity
        const cause = data.damageSource?.cause

        if (!player || player.typeId !== "minecraft:player") return
        if (!mob) return

        const isValidDamage = AegisProtectionDamage.includes(cause)
        if (!isValidDamage) return

        if (player.hasTag("mnra_cata:verdant_aegis") && !player.getItemCooldown('verdant_aegis')) {

            const health = player.getComponent("minecraft:health")
            if (!health) return

            player.startItemCooldown('verdant_aegis', 20 * 35)

            health.setCurrentValue(Math.min(health.currentValue + data.damage / 3, health.effectiveMax))

            mob.applyDamage(data.damage / 4.5, { damagingEntity: player, cause: "magic" })

            player.applyKnockback({ x: -player.getViewDirection().x * 0.1, z: -player.getViewDirection().z * 0.1 }, 0.1)

            player.runCommand("playsound sound.aegis_protection @s ~ ~ ~ 1 1 1")
            player.runCommand("particle mnra_cata:verdant_aegis_protecion ~ ~1 ~")
        }

        if (player.hasTag("mnra_cata:celestial_aegis") && !player.getItemCooldown('celestial_aegis')) {

            const health = player.getComponent("minecraft:health")
            if (!health) return

            player.startItemCooldown('celestial_aegis', 20 * 35)

            health.setCurrentValue(Math.min(health.currentValue + data.damage / 2, health.effectiveMax))

            mob.applyDamage(data.damage / 3, { damagingEntity: player, cause: "magic" })

            player.applyKnockback({ x: -player.getViewDirection().x * 0.1, z: -player.getViewDirection().z * 0.1 }, 0.1)

            player.runCommand("playsound sound.aegis_protection @s ~ ~ ~ 1 1 1")

            player.runCommand("particle mnra_cata:stellar_greatsword_emitter ~ ~1 ~")
            player.runCommand("particle mnra_cata:twilight_edge_impact ~ ~1 ~")
            player.runCommand("particle mnra_cata:stellar_greatsword_emitter ~ ~1 ~")
            player.runCommand("particle mnra_cata:twilight_edge_impact ~ ~1 ~")
            player.runCommand("particle mnra_cata:stellar_greatsword_emitter ~ ~1 ~")
            player.runCommand("particle mnra_cata:twilight_edge_impact ~ ~1 ~")
        }

    } catch (e) {
    }
})


world.afterEvents.entityDie.subscribe((data) => {
    try {

        const damagingEntity = data.damageSource?.damagingEntity
        const deadEntity = data.deadEntity

        if (!damagingEntity) return

        if (damagingEntity?.hasTag("mnra_cata:stellar_charm")) {
            if (!damagingEntity.getItemCooldown('stellar_charm')) {
                damagingEntity.startItemCooldown('stellar_charm', 20 * 5)
                damagingEntity.runCommand("particle mnra_cata:stellar_greatsword_star_crit ~ ~ ~")
                damagingEntity.runCommand("particle mnra_cata:stellar_greatsword_emitter ^^0.1^1.2")
                damagingEntity.addEffect("regeneration", TicksPerSecond * 5, { amplifier: 0, showParticles: true })
            }
        }

        if (damagingEntity?.hasTag("mnra_cata:floret_charm")) {
            if (!damagingEntity.getItemCooldown('floret_charm')) {

                damagingEntity.startItemCooldown('floret_charm', 20 * 15)

                const nearbyEntities = deadEntity.dimension.getEntities({
                    location: deadEntity.location,
                    maxDistance: 8,
                    closest: 12,
                    excludeFamilies: ["player"]
                })

                for (const entity of nearbyEntities) {
                    if (entity.hasComponent("health")) {
                        entity.addEffect("poison", TicksPerSecond * 8, { amplifier: 1, showParticles: true })
                        entity.runCommand("particle mnra_cata:poison_dust ~~~")
                        entity.runCommand("particle mnra_cata:poison_dust ~~~")
                    }
                }
            }
        }


        if (damagingEntity?.hasTag("mnra_cata:solar_charm")) {
            if (!damagingEntity.getItemCooldown('solar_charm')) {

                damagingEntity.startItemCooldown('solar_charm', 20 * 25)

                deadEntity.runCommand("playsound sound.solar_explosion @a[r=12] ~ ~ ~ 0.8 1 1")
                deadEntity.runCommand("summon mnra_cata:sun_orb_damage ~ ~ ~")

                const nearbyEntities = deadEntity.dimension.getEntities({
                    location: deadEntity.location,
                    maxDistance: 4.5,
                    excludeFamilies: ["player"]
                })

                for (const entity of nearbyEntities) {
                    if (entity.hasComponent("health")) {
                        entity.setOnFire(5)
                    }
                }
            }
        }

    } catch (e) {
    }
})


//hurt
world.afterEvents.entityHurt.subscribe((event) => {
    try {

        const hurtEntity = event.hurtEntity;
        const damagingEntity = event.damageSource?.damagingEntity;

        if (!hurtEntity) return;

        const random = Math.random();

        const health = hurtEntity.getComponent("minecraft:health");
        if (!health) return;

        const maxHealth = health.effectiveMax;
        const restoredHealth = Math.min(health.currentValue, maxHealth);

        if (hurtEntity?.hasTag("mnra_cata:verdant_ring") && event.damageSource?.damagingProjectile) {
            health.setCurrentValue(Math.min(health.currentValue + event.damage / 2, health.effectiveMax));
            health.setCurrentValue(restoredHealth);
            hurtEntity.runCommand("playsound random.anvil_land @a[r=15] ~ ~ ~ 0.1 2 1");
        }

        if (damagingEntity?.hasTag("mnra_cata:stellar_ring")) {
            if (!damagingEntity.getItemCooldown('stellar_ring')) {

                system.waitTicks(10).then(() => {
                    try {
                        damagingEntity.startItemCooldown('stellar_ring', 20 * 10);
                        hurtEntity.applyDamage(5, { cause: "entityAttack" });
                        hurtEntity.runCommand("particle mnra_cata:stellar_greatsword_star_crit ~ ~ ~");
                        hurtEntity.runCommand("particle mnra_cata:stellar_greatsword_emitter ^^0.1^1.2");
                        hurtEntity.runCommand("playsound mace.smash_air @a[r=10] ~ ~ ~ 0.2 1.3 1");
                    } catch (e) {
                        console.warn("stellar_ring delayed error:", e);
                    }
                });
            }
        }

        if (damagingEntity?.hasTag("mnra_cata:floret_ring")) {
            if (!damagingEntity.getItemCooldown('floret_ring')) {

                system.waitTicks(10).then(() => {
                    try {
                        damagingEntity.startItemCooldown('floret_ring', 20 * 10);
                        hurtEntity.addEffect("poison", TicksPerSecond * 5, { amplifier: 1, showParticles: true });
                        hurtEntity.runCommand("particle mnra_cata:poison_dust ^^0.1^1.2");
                    } catch (e) {
                        console.warn("floret_ring delayed error:", e);
                    }
                });
            }
        }

        if (damagingEntity?.hasTag("mnra_cata:solar_ring")) {
            if (!damagingEntity.getItemCooldown('solar_ring')) {

                system.waitTicks(10).then(() => {
                    try {
                        damagingEntity.startItemCooldown('solar_ring', 20 * 10);
                        hurtEntity.applyDamage(5, { cause: "entityAttack" });
                        hurtEntity.runCommand("particle mnra_cata:blazing_excalibur_impact_emitter ^^^");
                        hurtEntity.setOnFire(5);
                    } catch (e) {
                        console.warn("solar_ring delayed error:", e);
                    }
                });
            }
        }

        if (damagingEntity?.hasTag("mnra_cata:twilight_ring")) {
            if (!damagingEntity.getItemCooldown('twilight_ring') && random < 0.3) {

                damagingEntity.startItemCooldown('twilight_ring', 20 * 10);

                system.waitTicks(2).then(() => {
                    try {
                        hurtEntity.runCommand("summon mnra_cata:twilight_edge_phantom ~ ~ ~");
                    } catch (e) {
                        console.warn("twilight_ring delayed error:", e);
                    }
                });
            }
        }

        if (damagingEntity?.hasTag("mnra_cata:sun_ring")) {
            if (!damagingEntity.getItemCooldown('sun_ring') && random < 0.3) {

                damagingEntity.startItemCooldown('sun_ring', 20 * 15);

                system.waitTicks(10).then(() => {
                    try {
                        hurtEntity.runCommand("playsound sound.solar_explosion @a[r=12] ~ ~ ~ 0.8 1 1");
                        hurtEntity.runCommand("particle mnra_cata:blazing_excalibur_impact_emitter ^^^");
                        hurtEntity.runCommand("particle mnra_cata:morningstar_impact ^^^");
                        hurtEntity.runCommand("summon mnra_cata:sun_orb_damage ~ ~ ~");
                    } catch (e) {
                        console.warn("sun_ring delayed error:", e);
                    }
                });
            }
        }

        if (damagingEntity?.hasTag("mnra_cata:phantasma_ring")) {

            const stages = [
                { tag: "HasTerrorStage5", damage: 5 },
                { tag: "HasTerrorStage4", damage: 4 },
                { tag: "HasTerrorStage3", damage: 3 },
                { tag: "HasTerrorStage2", damage: 2 },
                { tag: "HasTerrorStage1", damage: 1 }
            ];

            for (const stage of stages) {
                if (damagingEntity.hasTag(stage.tag)) {
                    system.waitTicks(10).then(() => {
                        try {
                            hurtEntity.runCommand("particle mnra_cata:phantasma_greatsword_stage2 ^^^");
                            hurtEntity.applyDamage(stage.damage, { cause: "entityAttack" });
                        } catch (e) {
                        }
                    });
                    break;
                }
            }
        }

    } catch (e) {
    }
});

system.runInterval(() => {
    try {

        for (const player of world.getAllPlayers()) {

            const Health = player.getComponent('health');
            if (!Health) continue;

            const dimension = player.dimension;

            if (player?.hasTag("mnra_cata:starfall_necklace")) {
                if (!player.getItemCooldown('starfall_necklace') && Health.currentValue < 10) {

                    player.startItemCooldown('starfall_necklace', 20 * 25);

                    player.runCommand("summon mnra_cata:star_sword ~ ~ ~2");
                    player.runCommand("summon mnra_cata:star_sword ~ ~ ~-2");
                    player.runCommand("summon mnra_cata:star_sword ~-2 ~ ~");
                    player.runCommand("summon mnra_cata:star_sword ~2 ~ ~");

                    system.waitTicks(20).then(() => {
                        try {
                            player.runCommand("summon mnra_cata:star_sword ~ ~ ~4");
                            player.runCommand("summon mnra_cata:star_sword ~ ~ ~-4");
                            player.runCommand("summon mnra_cata:star_sword ~-4 ~ ~");
                            player.runCommand("summon mnra_cata:star_sword ~4 ~ ~");
                        } catch (e) {
                            console.warn("starfall_necklace delayed error:", e);
                        }
                    });
                }
            }

            if (player?.hasTag("mnra_cata:calibrated_stellar_core")) {
                if (!player.getItemCooldown('calibrated_stellar_core')) {
                    if (Health.currentValue < 10) {
                        player.addEffect("regeneration", TicksPerSecond * 2, { amplifier: 1, showParticles: true });
                    } else {
                        player.addEffect("weakness", TicksPerSecond * 2, { amplifier: 0, showParticles: true });
                    }
                }
            }

            if (player?.hasTag("mnra_cata:stellar_necklace")) {
                if (!player.getItemCooldown('stellar_necklace') && Health.currentValue < 10) {

                    player.startItemCooldown('stellar_necklace', 20 * 15);

                    player.addEffect("regeneration", TicksPerSecond * 5, { amplifier: 1, showParticles: true });
                    player.runCommand("particle mnra_cata:stellar_necklace_heart ~ ~ ~");
                    player.runCommand("playsound beacon.activate @a[r=6] ~ ~ ~ 1 1.8 1");
                }
            }

            if (player?.hasTag("mnra_cata:floret_necklace")) {
                player.removeEffect("minecraft:poison");
                player.removeEffect("minecraft:fatal_poison");
            }

            if (player?.hasTag("mnra_cata:verdant_necklace")) {
                player.addEffect("resistance", TicksPerSecond * 2, { amplifier: 1, showParticles: true });
                player.addEffect("slowness", TicksPerSecond * 2, { amplifier: 1, showParticles: true });
            }

            if (player?.hasTag("mnra_cata:solar_necklace")) {
                if (dimension.id === "minecraft:nether") {
                    player.addEffect("fire_resistance", TicksPerSecond * 2, { amplifier: 0, showParticles: true });
                }
            }

            if (player.hasTag("mnra_cata:terror_necklace")) {

                if (player.hasTag("HasTerrorStage5")) {
                    player.onScreenDisplay.setActionBar("");
                }

                else if (player.hasTag("HasTerrorStage4")) {
                    player.onScreenDisplay.setActionBar("");
                }

                else if (player.hasTag("HasTerrorStage3")) {
                    player.onScreenDisplay.setActionBar("");
                }

                else if (player.hasTag("HasTerrorStage2")) {
                    player.onScreenDisplay.setActionBar("");
                }

                else if (player.hasTag("HasTerrorStage1")) {
                    player.onScreenDisplay.setActionBar("");
                }

                else {
                    player.onScreenDisplay.setActionBar("");
                }
            }

            if (player?.hasTag("mnra_cata:sun_engine")) {
                if (Health.currentValue < 10) {

                    const nearbyEntities = player.dimension.getEntities({
                        location: player.location,
                        maxDistance: 8,
                        excludeFamilies: ["player"],
                        excludeTypes: ["villager"]
                    });

                    for (const entity of nearbyEntities) {
                        if (entity.hasComponent("health")) {
                            entity.setOnFire(5);
                            entity.runCommand("particle mnra_cata:solar_tesla_coil ~ ~ ~");
                        }
                    }
                }
            }

            if (player?.hasTag("mnra_cata:sun_necklace")) {

                const dimId = player.dimension.id;

                if (dimId === "minecraft:overworld") {

                    const time = world.getTimeOfDay();
                    const isDay = time > 0 && time < 12000;

                    if (isDay) {
                        player.addEffect("health_boost", TicksPerSecond * 2, { amplifier: 0, showParticles: true });
                    }
                }

                else if (dimId === "minecraft:nether") {
                    player.addEffect("health_boost", TicksPerSecond * 2, { amplifier: 1, showParticles: true });
                    player.addEffect("resistance", TicksPerSecond * 2, { amplifier: 1, showParticles: true });
                }
            }

        }

    } catch (e) {
    }
}, 20);

const usedDoubleJump = new Set();
const wasJumping = new Map();
const airTicks = new Map();

system.runInterval(() => {
    for (const player of world.getPlayers()) {

        if (!player.hasTag("mnra_cata:astro_jelly_in_a_bottle")) continue;

        const onGround = player.isOnGround;
        const jumping = player.isJumping;

        if (onGround) {
            usedDoubleJump.delete(player.id);
            airTicks.set(player.id, 0);
        } else {
            airTicks.set(player.id, (airTicks.get(player.id) ?? 0) + 1);
        }

        const jumpedThisTick =
            jumping && !wasJumping.get(player.id);

        const timeInAir = airTicks.get(player.id) ?? 0;

        if (
            !onGround &&
            jumpedThisTick &&
            !usedDoubleJump.has(player.id) &&
            timeInAir >= 5
        ) {
            player.applyKnockback({ x: -player.getViewDirection().x * -0.5, z: -player.getViewDirection().z * -0.5 }, 1);
            player.runCommand("playsound wind_charge.burst @a[r=8] ~ ~ ~ 0.6 1.2 1")
            player.runCommand("particle mnra_cata:astro_jelly_in_a_bottle ~ ~ ~")
            player.runCommand("particle mnra_cata:small_impact ~ ~ ~")
            usedDoubleJump.add(player.id);
        }

        wasJumping.set(player.id, jumping);
    }
}, 1);