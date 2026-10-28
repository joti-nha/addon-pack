import * as server from "@minecraft/server"
import { ARROW_EFFECTS, forbiddenTags } from "./vgConstants";
import { shootProjectile, getEnchantment, itemReplace, damageItem, spParCol, completeAchievement, sendTip } from "./vgFunctions";
import { damageChainValues, weaponStats } from "./vgConstants";
import { BlockTypes } from '@minecraft/server'
const world = server.world;

let ALL_BLOCK_IDS = new Set();

server.system.run(() => {
    ALL_BLOCK_IDS = new Set(BlockTypes.getAll().map(b => b.id));
});

world.afterEvents.itemUse.subscribe(data => {

    const player = data.source;
    const mainhand = player.getComponent('minecraft:equippable').getEquipment('Mainhand');
    const offhand = player.getComponent('minecraft:equippable').getEquipment('Offhand');

    const doOffhandItemRest = player.getDynamicProperty("rev:do_offhand_item_restriction") !== false;
    if (doOffhandItemRest) {
        const isBlock = ALL_BLOCK_IDS.has(mainhand?.typeId)
        if (isBlock) return;

        const tags = mainhand?.getTags();
        if (tags?.some(i => forbiddenTags.includes(i))) return;
    }

    if (mainhand?.hasTag('rev:improvised_gun') && !mainhand.typeId.includes('repeater_crossbow')) {
        useGun(player, mainhand, 'Mainhand');
    }

    const doOffhandSneakRest = player.getDynamicProperty("rev:do_offhand_sneak_restriction") !== false;
    if (doOffhandSneakRest) {
        if (player.isSneaking && (!offhand?.typeId.includes('hunting_musket'))) return;
    }

    if (offhand != undefined)
        if (offhand.hasTag('rev:improvised_gun') && !offhand.typeId.includes('repeater_crossbow')) {
            useGun(player, offhand, 'Offhand');
        }
    if (mainhand.hasTag('rev:improvised_gun') && mainhand.typeId.includes('repeater_crossbow')) {
        handleRepeatingCrossbow(data.source, mainhand, 'Mainhand')
    }
    if (offhand == undefined) return;
    if (offhand.hasTag('rev:improvised_gun') && offhand.typeId.includes('repeater_crossbow')) {
        handleRepeatingCrossbow(data.source, offhand, 'Offhand');
    }
});

function handleRepeatingCrossbow(player, item, slot) {
    if (item.typeId.includes("rev:repeater_crossbow")) {
        let power = 5;
        const gunStats = weaponStats.find(e => e.id == item.typeId);
        const amount = gunStats.amount_needed;
        const enchant = item?.getComponent("minecraft:enchantable");
        const levelMultishot = enchant?.getEnchantment("multishot")?.level ?? 0;
        const levelPiercing = enchant?.getEnchantment("piercing")?.level ?? 0;
        const levelCharge = enchant?.getEnchantment("quick_charge")?.level ?? 0;
        const cooldown = item?.getComponent("minecraft:cooldown");
        let potionEffect = null;
        let potionDuration = 0;
        let potionAmplifier = 0;
        let cooldownRemaining = cooldown?.getCooldownTicksRemaining(player)
        if (!cooldownRemaining) cooldown.startCooldown(player)
        cooldownRemaining = cooldown?.getCooldownTicksRemaining(player)

        if (player.runCommand('testfor @s[hasitem={item=minecraft:arrow}]').successCount > 0) {
            if (player.runCommand('testfor @s[hasitem={item=minecraft:arrow,location=slot.weapon.offhand}]').successCount > 0) {
                for (let i = 6; i < 48; i++) {
                    if (player.runCommand(`testfor @s[hasitem={item=minecraft:arrow,quantity=${amount}..,location=slot.weapon.offhand,data=${i}}]`).successCount > 0) {
                        player.runCommand(`clear @s arrow ${i} ${amount}`);
                        potionEffect = ARROW_EFFECTS[i][0];
                        potionDuration = ARROW_EFFECTS[i][1];
                        potionAmplifier = ARROW_EFFECTS[i][2];
                        break;
                    }
                }
            } else {
                for (let i = 6; i < 48; i++) {
                    if (player.runCommand(`testfor @s[hasitem={item=minecraft:arrow,quantity=${amount}..,data=${i}}]`).successCount > 0) {
                        player.runCommand(`clear @s arrow ${i} ${amount}`);
                        potionEffect = ARROW_EFFECTS[i][0];
                        potionDuration = ARROW_EFFECTS[i][1];
                        potionAmplifier = ARROW_EFFECTS[i][2];
                        break;
                    }
                }
            }
            if (potionEffect == null) player.runCommand(`clear @s arrow 0 ${amount}`);
            if ((cooldown.cooldownTicks - 1 <= cooldownRemaining)) {
                if (enchant && levelMultishot > 0) {
                    shootProjectile(player, item, 0, [potionEffect, potionDuration, potionAmplifier])
                    shootProjectile(player, item, 0.1, [potionEffect, potionDuration, potionAmplifier])
                    shootProjectile(player, item, -0.1, [potionEffect, potionDuration, potionAmplifier])
                } else if (enchant && levelPiercing > 0) {
                    shootProjectile(player, item, 0.1, [potionEffect, potionDuration, potionAmplifier])
                } else shootProjectile(player, item, 0, [potionEffect, potionDuration, potionAmplifier])

                damageItem(player, 1, slot)

                player.playSound('crossbow.shoot', {
                    location: player.location
                })


            }

        }
        else {
            player.playSound('random.click', { pitch: 2 });
        }
        switch (levelCharge) {
            case 1:
                itemReplace(player, item, 'rev:repeater_crossbow_c_1', slot)
                break;
            case 2:
                itemReplace(player, item, 'rev:repeater_crossbow_c_2', slot)
                break;
            case 3:
                itemReplace(player, item, 'rev:repeater_crossbow_c_3', slot)
                break;
        }
    }
    return;
}

function useGun(player, item, slot) {
    
    if (item.typeId.includes('repeater_crossbow')) return;
    let gunStats = weaponStats.find(e => e.id == item.typeId);
    if (gunStats == undefined) {
        gunStats = weaponStats.find(e => e.id == (item.typeId).replace("rev:shadow_", "rev:"));
        if (gunStats == undefined) return;
    }
    const ammo = gunStats.ammunition;
    const amount = gunStats.amount_needed;

    const hasAmmo = (player.runCommand(`testfor @s[hasitem={item=${ammo},quantity=${amount}..}]`).successCount > 0)
    if (!hasAmmo) {
        player.playSound('random.click', { pitch: 2 });
        return;
    }

    let cooldown = item.getComponent('minecraft:cooldown').cooldownTicks
    let cooldownRemaining = item
        .getComponent('minecraft:cooldown')
        .getCooldownTicksRemaining(player)


    if (cooldownRemaining == 0) {
        item.getComponent('minecraft:cooldown').startCooldown(player)
        cooldownRemaining = item
            .getComponent('minecraft:cooldown')
            .getCooldownTicksRemaining(player)
    }

    const enchanting = item.getComponent('minecraft:enchantable');
    if (enchanting != undefined) completeAchievement(player, 'rev:dark_age_achievement')
    const infinity = getEnchantment(enchanting, 'infinity');

    if (Math.abs(cooldown - cooldownRemaining) <= 1) {
        damageItem(player, 1, slot);
        completeAchievement(player, 'rev:improv_betsy_achievement');
        sendTip(player, "rev.tip.dual_wielding", "revImprovisedDualWieldingTip1");
        sendTip(player, "rev.tip.settings_command", "revImprovisedSettingsCommandTip1");
        sendTip(player, "rev.tip.bloom_reduction", "revImprovisedBloomReductionTip1");
        shootProjectile(player, item);
        {
            if (infinity == 0)
                player.runCommand(`clear @s ${ammo} 0 ${amount}`)
            else if (infinity){
                const doPseudoInfinity = world.getDynamicProperty("rev:do_pseudo_infinity") ?? true;
                if (doPseudoInfinity)
                    if (Math.random() > 0.5)
                        player.runCommand(`clear @s ${ammo} 0 ${amount}`)
            }
        }
    }
};

world.afterEvents.projectileHitEntity.subscribe(data => {
    const projectile = data.projectile;
    if (!projectile.isValid) return;
    const pComp = projectile.getComponent('minecraft:projectile');

    const damageValues = damageChainValues.find(item => item.id === projectile.typeId);
    if (!damageValues) return

    const fromDual = projectile.getDynamicProperty('rev:from_dual') ?? false;

    const target = data.getEntityHit().entity;
    const energy = target.getDynamicProperty('rev:energy_current') ?? 0;

    let damageValue = (damageValues.chain_damage) * (fromDual ? 0.86 : 1.0);
    const doPiercing = damageValues.piercing;
    const type = damageValues.type;

    const ePower = projectile.getDynamicProperty('rev:vg_power') ?? 0;
    const eFlame = projectile.getDynamicProperty('rev:vg_flame') ?? 0;
    const ePunch = projectile.getDynamicProperty('rev:vg_punch') ?? 0;

    damageValue = ePower == 0 ? damageValue : Math.ceil(damageValue + ((ePower + 1) * (damageValue * 0.34)))

    //aura monster

    // [Addon Pack] so os alvos atingidos ha pouco entram na contagem (antes: todas as entidades do mundo a cada tick)
    let chainValue = chainTargets.has(target.id) ? (target.getDynamicProperty('rev:chain_damage') ?? 0) : 0;
    {
        {
            target.setDynamicProperty('rev:chain_reset', 8);
            chainTargets.set(target.id, target);
            const isPlayer = target.typeId.includes('player');
            target.setDynamicProperty('rev:chain_damage', chainValue + damageValue);
            const finalValue = (chainValue + damageValue) * (isPlayer ? 0.5 : 1.0);
            if (target.typeId == "minecraft:iron_golem" && finalValue > 100) completeAchievement(pComp.owner, 'rev:no_chance_achievement')
            target.applyDamage(finalValue, {
                damagingEntity: pComp.owner,
                damagingProjectile: projectile
            });
            if (pComp.owner?.getDynamicProperty('rev:do_hit_sound') !== false)
                pComp.owner?.playSound('random.orb', { volume: 0.67, pitch: 0.5 + (Math.random() / 10) })
            if (eFlame > 0) target.setOnFire(5)
            if (ePunch > 0) target.applyKnockback({ x: projectile.getVelocity().x * (0.01 + (ePunch / 5)), z: projectile.getVelocity().z * (0.01 + (ePunch / 5)) }, ePunch / 5)
        }
    }

    try {
        const ownLoc = pComp.owner.location;
        const hrtLoc = target.location;
        const difLoc = (distance3D(ownLoc, hrtLoc));
        const willDie = target.getComponent('health').currentValue <= 0 ? true : false;
        if (willDie && target.typeId == "rev:offshoot") completeAchievement(pComp.owner, 'rev:showdown_achievement')
        if (difLoc > 40 && willDie) completeAchievement(pComp.owner, 'rev:valid_strategy_achievement');
        if (difLoc > 60 && willDie && projectile.typeId == "rev:musket_bullet_hunting") completeAchievement(pComp.owner, 'rev:dont_take_aim_achievement');
    }
    catch { }

    if (data.projectile.typeId == "rev:fake_arrow") {
        const entityHit = data.getEntityHit().entity;
        const arrow = data.projectile.getDynamicProperty('rev:arrow_counter')
        const piercing = data.projectile.getDynamicProperty('rev:piercing')
        const effect = data.projectile.getDynamicProperty('rev:potion_effect')
        data.projectile.setDynamicProperty('rev:arrow_counter', arrow + 1)
        if (effect != null) {
            entityHit.addEffect(effect, data.projectile.getDynamicProperty('rev:potion_duration') * 20)
        }
        if (arrow == 0) {
            data.projectile.remove();
            return;
        }
        if (arrow == piercing) {
            data.projectile.remove()
        }
    }
    if (doPiercing == false) projectile.remove();
    else {
        const cuP = projectile.getDynamicProperty('rev:piercing_other') ?? 1;
        projectile.setDynamicProperty('rev:piercing_other', cuP + 1);
        if (cuP > 4) {
            completeAchievement(pComp.owner, 'rev:collateral_damage_achievement2')
        }
    }
});

// [Addon Pack] alvos com dano em cadeia ativo (id -> entidade)
const chainTargets = new Map();
server.system.runInterval(() => {
    if (chainTargets.size === 0) return;
    for (const [id, e] of chainTargets) {
        if (!e.isValid) { chainTargets.delete(id); continue; }
        const reset = e.getDynamicProperty('rev:chain_reset')
        if (reset != undefined && reset > 0) {
            e.setDynamicProperty('rev:chain_reset', reset - 1);
        }
        else {
            e.setDynamicProperty('rev:chain_damage', 0);
            e.setDynamicProperty('rev:chain_reset', undefined);
            chainTargets.delete(id);
        }
    }
});

server.system.runInterval(() => {
    const overworld = world.getDimension('minecraft:overworld').getEntities({ families: ['rev_improvised_bullet'] });
    const nether = world.getDimension('minecraft:nether').getEntities({ families: ['rev_improvised_bullet'] });
    const end = world.getDimension('minecraft:the_end').getEntities({ families: ['rev_improvised_bullet'] });
    const entities = overworld.concat(nether).concat(end);
    entities.forEach(e => {

        const attr = damageChainValues.find(item => item.id === e.typeId);
        if (attr != undefined && e.isValid) {
            spParCol(e.location, e.dimension, e.getComponent('projectile').owner, e.typeId)
        }
    });
});


function distance3D(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

const bulletTypes = 
[
        "rev:flintlock_bullet", "rev:musket_bullet", "rev:shotgun_normal_bullet",
        "rev:shotgun_s_bullet", "rev:mortar_bullet", "rev:auto_gun_bullet","rev:crooked_mortar_bullet",
        "rev:mauler_bullet", "rev:musket_bullet_hunting", "rev:fake_arrow", "rev:despoiler_bullet"
];

world.afterEvents.entitySpawn.subscribe(data => {
    const entity = data.entity;
    
    if (bulletTypes.includes(entity.typeId)) {
        let owner;
        try { owner = entity.getComponent('minecraft:projectile')?.owner; } catch (e) { }
        if (owner && owner.typeId === "rev:offshoot") {
            try {
                const stats = weaponStats.find(item => item.projectile == entity.typeId);
                const sound = stats.sound;
                owner.triggerEvent('rev:start_reload');
                owner.dimension.playSound(sound, owner.location, { pitch: 1.0 });
            } catch (e) { }
        }
    }
    if (entity.typeId == "rev:offshoot") {
        const enableOffshoot = world.getDynamicProperty("rev:enable_offshoot") ?? true;
        const cause = data.cause;
        if (!enableOffshoot)  
        {
            entity.remove();
        }
    }
});
