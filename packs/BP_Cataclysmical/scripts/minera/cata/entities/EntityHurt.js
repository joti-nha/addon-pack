import { world, system, TicksPerSecond } from "@minecraft/server";
import { DisablePlayerShield } from "./DisablePlayerShield.js";

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


//knockback tags
world.afterEvents.entityHurt.subscribe(({ damageSource: { damagingEntity: mob }, hurtEntity: player }) => {

    if (!mob) return;

    if (!player?.isValid) return;
    if (!mob?.isValid) return;

    const getViewDirectionX = -mob.getViewDirection().x
    const getViewDirectionZ = -mob.getViewDirection().z

    if (mob.hasTag('normal_attack')) {
        player.applyKnockback({ x: getViewDirectionX * -2, z: getViewDirectionZ * -2 }, 0.4);
    }
    if (mob.hasTag('heavy_attack')) {
        player.applyKnockback({ x: getViewDirectionX * -3, z: getViewDirectionZ * -3 }, 0.6);
    }
    if (mob.hasTag('mega_attack')) {
        player.applyKnockback({ x: getViewDirectionX * -4, z: getViewDirectionZ * -4 }, 0.8);
    }
    if (mob.hasTag('super_attack')) {
        player.applyKnockback({ x: getViewDirectionX * -5.2, z: getViewDirectionZ * -5.2 }, 1.1);
    }
});


// Use DisablePlayerShield(ev); to disable shields
world.afterEvents.entityHurt.subscribe((ev) => {
    const player = ev.hurtEntity;
    const mob = ev.damageSource.damagingEntity;

    if (!player?.isValid) return;
    if (!mob?.isValid) return;

    if (!mob) return;

    const SkinId = mob.getComponent("minecraft:skin_id")
    const getViewDirectionX = -mob.getViewDirection().x
    const getViewDirectionZ = -mob.getViewDirection().z

    switch (mob.typeId) {
        case 'mnra_cata:stone_golem':
            player.applyKnockback({ x: getViewDirectionX * -4, z: getViewDirectionZ * -4 }, 0.4);
            player.addEffect("weakness", TicksPerSecond * 5, { amplifier: 3, showParticles: false });
            player.addEffect("slowness", TicksPerSecond * 5, { amplifier: 3, showParticles: false });
            break;

        case 'mnra_cata:skeleton_paladin':
            if (SkinId?.value == 0) {
                player.applyKnockback({ x: getViewDirectionX * -3, z: getViewDirectionZ * -3 }, 0.4);
                player.addEffect("slowness", TicksPerSecond * 5, { amplifier: 0, showParticles: false });
                DisablePlayerShield(ev);
            }
            break;

        case 'mnra_cata:verdant_skeleton':
            if (SkinId.value == 1) {
                player.applyKnockback({ x: getViewDirectionX * -1.5, z: getViewDirectionZ * -1.5 }, 0.3);
                DisablePlayerShield(ev);
            }
            break;

        case 'mnra_cata:gneiss_golem':
            player.applyKnockback({ x: getViewDirectionX * -10, z: getViewDirectionZ * -10 }, 1);
            player.applyDamage(1000)
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:solarium':
            player.applyKnockback({ x: getViewDirectionX * -4, z: getViewDirectionZ * -4 }, 0.4);
            player.setOnFire(4)
            break;

        case 'mnra_cata:sun_tribunal': //Boss
            player.applyKnockback({ x: getViewDirectionX * -6, z: getViewDirectionZ * -6 }, 0.7);
            mob.triggerEvent("flawed_fight")
            player.addEffect("weakness", TicksPerSecond * 3, { amplifier: 0, showParticles: false });
            player.addEffect("slowness", TicksPerSecond * 3, { amplifier: 0, showParticles: false });
            player.addEffect("wither", TicksPerSecond * 3, { amplifier: 0, showParticles: false });
            player.removeEffect("strength")
            player.removeEffect("resistance")
            player.removeEffect("fire_resistance")
            player.removeEffect("absorption")
            player.setOnFire(4)
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:solar_tesla':
            player.applyKnockback({ x: getViewDirectionX * -3, z: getViewDirectionZ * -3 }, 0.5);
            player.setOnFire(4)
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:eternal_seal':
            player.applyKnockback({ x: getViewDirectionX * -2.5, z: getViewDirectionZ * -2.5 }, 0.5);
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:soul_terror': //Mini Boss
            player.applyKnockback({ x: getViewDirectionX * -2.3, z: getViewDirectionZ * -2.3 }, 0.5);
            player.addEffect("weakness", TicksPerSecond * 5, { amplifier: 2, showParticles: false });
            player.addEffect("wither", TicksPerSecond * 2, { amplifier: 0, showParticles: true });
            break;

        case 'mnra_cata:verdant_sentinel': //Boss
            player.addEffect("weakness", TicksPerSecond * 3, { amplifier: 2, showParticles: false });
            if (SkinId.value == 3) { //normal attack
                player.applyKnockback({ x: getViewDirectionX * -2, z: getViewDirectionZ * -2 }, 0.3);
            }
            if (SkinId.value == 7) { //dash attack
                player.applyKnockback({ x: getViewDirectionX * -4, z: getViewDirectionZ * -4 }, 0.4);
            }
            if (SkinId.value == 4) { //double attack (first hit)
                player.applyKnockback({ x: getViewDirectionX * -0.1, z: getViewDirectionZ * -0.1 }, 0.5);
            }
            if (SkinId.value == 5) { //heavy attack
                player.applyKnockback({ x: getViewDirectionX * -3, z: getViewDirectionZ * -3 }, 0.3);
            }
            if (SkinId.value == 6) { //move attack
                player.applyKnockback({ x: getViewDirectionX * -1.5, z: getViewDirectionZ * -1.5 }, 0.2);
            }
            if (SkinId.value == 8) { //stomp attack (first hit)
                player.applyKnockback({ x: getViewDirectionX * -0.5, z: getViewDirectionZ * -0.5 }, 0.5);
            }
            break;

        case 'mnra_cata:plasma_hive':
            mob.runCommand('particle mnra_cata:plasma_summon ~ ~0.5 ~')
            mob.runCommand('playsound mob.vex.charge @a[r=24] ~ ~ ~')
            break;

        case 'mnra_cata:plasma':
            mob.runCommand('playsound mob.vex.charge @a[r=24] ~ ~ ~')
            break;

        case 'mnra_cata:feralbloom':
            player.applyKnockback({ x: getViewDirectionX * -2, z: getViewDirectionZ * -2 }, 0.5);
            break;

        case 'mnra_cata:empty_mob':
            break;

        case 'mnra_cata:empty_mob':
            break;

        default:
            break;
    }
});


//Dummies
world.afterEvents.entityHurt.subscribe((ev) => {
    const player = ev.hurtEntity;
    const mob = ev.damageSource.damagingEntity;

    if (!player?.isValid) return;
    if (!mob?.isValid) return;

    if (!mob) return;

    const SkinId = mob.hasComponent("minecraft:skin_id")
    const getViewDirectionX = -mob.getViewDirection().x
    const getViewDirectionZ = -mob.getViewDirection().z

    switch (mob.typeId) {
        case 'mnra_cata:sun_tribunal_double_dash_attack':
            player.applyKnockback({ x: getViewDirectionX * -2, z: getViewDirectionZ * -2 }, 2);
            player.setOnFire(4)
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:sun_totem':
            player.applyKnockback({ x: getViewDirectionX * -0.2, z: getViewDirectionZ * -0.2 }, 0.1);
            player.setOnFire(4)
            player.runCommand("particle mnra_cata:blazing_excalibur_impact_emitter ~ ~ ~")
            break;

        case 'mnra_cata:sun_tribunal_chaos_attack1':
            player.applyKnockback({ x: getViewDirectionX * -2, z: getViewDirectionZ * -2 }, 2.5);
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:cosmic_terror_heavy_attack':
            player.applyKnockback({ x: getViewDirectionX * -1, z: getViewDirectionZ * -1 }, 1.5);
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:exodius_armor_elements':
            if (SkinId.valueOf(0)) {
                player.addEffect("slowness", TicksPerSecond * 5, { amplifier: 3, showParticles: false });
                player.addEffect("poison", TicksPerSecond * 5, { amplifier: 3, showParticles: false });
            }
            if (SkinId.valueOf(1)) {
                player.setOnFire(4)
            }
            if (SkinId.valueOf(2)) {
                player.addEffect("weakness", TicksPerSecond * 5, { amplifier: 3, showParticles: false });
            }
            break;

        case 'mnra_cata:feralbloom_bloom_beam':
            player.applyKnockback({ x: getViewDirectionX * 0.1, z: getViewDirectionZ * 0.1 }, 0);
            player.addEffect("fatal_poison", TicksPerSecond * 2, { amplifier: 0, showParticles: true });
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:bloom_poison':
            player.applyKnockback({ x: getViewDirectionX * 0.1, z: getViewDirectionZ * 0.1 }, 0);
            player.addEffect("poison", TicksPerSecond * 2, { amplifier: 0, showParticles: true });
            break;

        case 'mnra_cata:solarium_charge1':
            player.applyKnockback({ x: getViewDirectionX * 0.2, z: getViewDirectionZ * 0.2 }, 0.5);
            player.setOnFire(4)
            mob.runCommand("playsound item.spear.hit @a[r=15] ~~~ 1 0.8 1")
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:solarium_charge2':
            player.applyKnockback({ x: getViewDirectionX * -3, z: getViewDirectionZ * -3 }, 0.5);
            player.setOnFire(4)
            mob.runCommand("playsound item.spear.hit @a[r=15] ~~~ 1 0.8 1")
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:verdant_sentinel_dash_attack':
            player.applyKnockback({ x: getViewDirectionX * -6, z: getViewDirectionZ * -6 }, 0.5);
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:verdant_sentinel_heavy_attack':
            player.applyKnockback({ x: getViewDirectionX * -6, z: getViewDirectionZ * -6 }, 0.5);
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:verdant_sentinel_start_double_attack':
            player.applyKnockback({ x: getViewDirectionX * -1, z: getViewDirectionZ * -1 }, 1);
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:verdant_sentinel_normal_attack':
            player.applyKnockback({ x: getViewDirectionX * -2.5, z: getViewDirectionZ * -2.5 }, 0.5);
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:verdant_sentinel_double_attack':
            player.applyKnockback({ x: getViewDirectionX * -4, z: getViewDirectionZ * -4 }, 0.5);
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:verdant_sentinel_move_attack':
            player.applyKnockback({ x: getViewDirectionX * -1, z: getViewDirectionZ * -1 }, 0.2);
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:verdant_sentinel_stomp_attack':
            player.applyKnockback({ x: getViewDirectionX * -1, z: getViewDirectionZ * -1 }, 0.8);
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:soul_terror_skull':
            player.addEffect("wither", TicksPerSecond * 3, { amplifier: 0, showParticles: true });
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:sun_tribunal_phantom_blade':
            player.addEffect("weakness", TicksPerSecond * 3, { amplifier: 0, showParticles: false });
            player.setOnFire(2)
            DisablePlayerShield(ev);
            player.applyKnockback({ x: getViewDirectionX * -0.1, z: getViewDirectionZ * -0.1 }, 0.1);
            break;

        case 'mnra_cata:solar_tesla_summon':
            player.setOnFire(5)
            break;

        case 'mnra_cata:solar_tesla_normal_attack':
            player.applyKnockback({ x: getViewDirectionX * -3, z: getViewDirectionZ * -3 }, 0.5);
            break;

        case 'mnra_cata:phantom_sun_dagger':
            player.setOnFire(2)
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:sun_tribunal_normal_attack':
            player.applyKnockback({ x: getViewDirectionX * -3, z: getViewDirectionZ * -3 }, 0.8);
            player.setOnFire(2)
            break;

        case 'mnra_cata:sun_tribunal_phantom_blade_telegraph':
            player.setOnFire(2)
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:sun_tribunal_dash_attack':
            player.applyKnockback({ x: getViewDirectionX * -4, z: getViewDirectionZ * -4 }, 0.8);
            player.setOnFire(2)
            DisablePlayerShield(ev);
            break;

        case 'mnra_cata:soul_terror_normal_attack':
            player.applyKnockback({ x: getViewDirectionX * -3, z: getViewDirectionZ * -3 }, 0.8);
            break;

        case 'mnra_cata:empty_mob':
            break;

        case 'mnra_cata:empty_mob':
            break;

        case 'mnra_cata:empty_mob':
            break;


        default:
            break;
    }
});