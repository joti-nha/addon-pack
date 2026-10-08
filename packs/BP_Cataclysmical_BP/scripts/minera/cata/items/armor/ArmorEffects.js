import { world, system, EquipmentSlot, TicksPerSecond } from "@minecraft/server";

function getFullSetId(helmet, chest, legs, boots) {
    if (!helmet || !chest || !legs || !boots) return null;

    const base = (item) =>
        item.typeId
            .replace("mnra_cata:", "")
            .replace(/_(helmet|chestplate|leggings|boots)$/, "");

    const h = base(helmet);
    const c = base(chest);
    const l = base(legs);
    const b = base(boots);

    if (h === c && c === l && l === b) {
        return `mnra_cata:${h}_set`;
    }
    return null;
}

export const Debuff = [
    "slowness",
    "mining_fatigue",
    "instant_damage",
    "blindness",
    "wither",
    "infested",
    "raid_omen",
    "poison",
    "fatal_poison",
    "nausea",
    "hunger",
    "levitation",
    "oozing",
    "infested",
]

system.runInterval(() => {
    for (const player of world.getPlayers()) {

        const eq = player.getComponent("equippable");
        const helmet = eq?.getEquipment(EquipmentSlot.Head);
        const chest = eq?.getEquipment(EquipmentSlot.Chest);
        const legs = eq?.getEquipment(EquipmentSlot.Legs);
        const boots = eq?.getEquipment(EquipmentSlot.Feet);

        const fullSetId = getFullSetId(helmet, chest, legs, boots);

        switch ("armor") {
            case "armor":
                if (fullSetId) {
                    switch (fullSetId) {
                        //Armor Sets
                        case "mnra_cata:terrabloom_set":
                            for (const effect of Debuff) {
                                player.removeEffect(effect);
                            }
                            const nearbyPlayers = player.dimension.getEntities({
                                location: player.location,
                                maxDistance: 8,
                                closest: 4,
                                families: ["player"],
                                excludeNames: [player.name]

                            });
                            for (const entity of nearbyPlayers) {
                                entity.addEffect("regeneration", TicksPerSecond * 3, { amplifier: 1, showParticles: true });
                                player.runCommand("particle mnra_cata:terrabloom_emitter ~ ~1 ~")

                            }
                            break;

                        case "mnra_cata:stellar_set":
                            player.addEffect("health_boost", TicksPerSecond * 2, { amplifier: 0, showParticles: false });
                            break;

                        case "mnra_cata:exodius_set": {
                            const health = player.getComponent("minecraft:health");

                            if (health.currentValue < 10 && !player.getItemCooldown('exodius_armor_elements')) {
                                try {
                                    player.runCommand("function exodius_armor_elements")
                                    player.runCommand("playsound sound.sun_tribunal_dagger_spawn @a[r=8] ~ ~ ~ 1 1.4 1")
                                    player.startItemCooldown('exodius_armor_elements', 120)
                                } catch { }
                            }
                            break;
                        }

                        case "mnra_cata:infernum_set": {
                            const health = player.getComponent("minecraft:health");

                            if (health?.currentValue < 10) {
                                try {
                                    const nearbyPlayers = player.dimension.getEntities({
                                        location: player.location,
                                        maxDistance: 8,
                                        closest: 8,
                                        excludeTypes: ["player", "item"]
                                    });

                                    for (const entity of nearbyPlayers) {
                                        if (entity.hasComponent("health")) {
                                            entity.setOnFire(2)
                                        }
                                    }

                                    player.addEffect("strength", TicksPerSecond * 2, { amplifier: 0, showParticles: false });

                                } catch { }
                            }
                            break;
                        }
                    }
                }

                //Armor
                if (helmet?.typeId === "mnra_cata:helmet") {
                    player.addEffect("regeneration", 60, { amplifier: 0 });
                }

                if (chest?.typeId === "mnra_cata:chestplate") {
                    player.addEffect("regeneration", 20, { amplifier: 0 });
                }

                if (legs?.typeId === "mnra_cata:leggings") {
                    player.addEffect("regeneration", 10, { amplifier: 0 });
                }

                if (boots?.typeId === "mnra_cata:boots") {
                    player.addEffect("regeneration", 10, { amplifier: 0 });
                }

                break;
        }
    }
});
world.afterEvents.entityHurt.subscribe((event) => {
    const player = event.hurtEntity;
    const target = event.damageSource.damagingEntity
    const random = Math.random()

    if (!player || player.typeId !== "minecraft:player") return;

    const eq = player.getComponent("equippable");
    if (!eq) return;

    const helmet = eq.getEquipment(EquipmentSlot.Head);
    const chest = eq.getEquipment(EquipmentSlot.Chest);
    const legs = eq.getEquipment(EquipmentSlot.Legs);
    const boots = eq.getEquipment(EquipmentSlot.Feet);

    const fullSetId = getFullSetId(helmet, chest, legs, boots);

    switch ("armor") {
        case "armor":

            if (fullSetId) {
                switch (fullSetId) {

                    case "mnra_cata:terrabloom_set":

                        try {
                            target.applyDamage(3, { cause: "entityAttack" })
                            target.runCommand("playsound damage.thorns @a[r=8] ~ ~ ~ 2 1 1")
                            target.runCommand("particle mnra_cata:terrabloom_thorns ~ ~1 ~")
                            target.addEffect("slowness", TicksPerSecond * 3, { amplifier: 1, showParticles: true });

                            player.runCommand("particle mnra_cata:terrabloom_thorns ~ ~1 ~")
                        } catch { }
                        break;

                    case "mnra_cata:stellar_set":
                        break;

                    case "mnra_cata:infernum_set":
                        try {
                            target.setOnFire(5)
                        } catch { }
                        break;
                }
            }
    }
});