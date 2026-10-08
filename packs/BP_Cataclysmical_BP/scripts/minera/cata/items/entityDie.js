import { world, system, TicksPerSecond } from "@minecraft/server";
import { getHeldItem } from "./entityHitEntity.js";


world.afterEvents.entityDie.subscribe(ev => {
    const player = ev.damageSource.damagingEntity;
    const target = ev.deadEntity;

    if (!player || !target) return;
    if (player.typeId !== "minecraft:player") return;

    const item = getHeldItem(player);
    if (!item) return;

    const random = Math.random()

    //item type
    switch (item.typeId) {
        case "mnra_cata:ecliptic_greatsword":
            if (!player.getItemCooldown('ecliptic_greatsword')) {
                player.startItemCooldown('ecliptic_greatsword', 40)

                let health = player.getComponent("minecraft:health");
                if (health?.currentValue < 16) {
                    player.runCommand("particle mnra_cata:ecliptic_greatsword_heart ~ ~ ~")
                    health?.setCurrentValue(health?.currentValue + 4)
                }
            }
            break;
        case "mnra_cata:nebulous_greatsword":
            if (player.hasTag('HasNebulousMeter5') && !player.getItemCooldown('nebulous_meter_test')) {

            } else if (player.hasTag('HasNebulousMeter4') && !player.getItemCooldown('nebulous_meter_test')) {
                player.addTag("HasNebulousMeter5")
                player.runCommand("playsound note.chime @s ~ ~ ~ 0.6 1.5 1")

            } else if (player.hasTag('HasNebulousMeter3') && !player.getItemCooldown('nebulous_meter_test')) {
                player.addTag("HasNebulousMeter4")
                player.runCommand("playsound note.chime @s ~ ~ ~ 0.6 1.5 1")

            } else if (player.hasTag('HasNebulousMeter2') && !player.getItemCooldown('nebulous_meter_test')) {
                player.addTag("HasNebulousMeter3")
                player.runCommand("playsound note.chime @s ~ ~ ~ 0.6 1.5 1")

            } else if (player.hasTag('HasNebulousMeter1') && !player.getItemCooldown('nebulous_meter_test')) {
                player.addTag("HasNebulousMeter2")
                player.runCommand("playsound note.chime @s ~ ~ ~ 0.6 1.5 1")

            } else if (!player.hasTag('HasNebulousMeter1') && !player.getItemCooldown('nebulous_meter_test')) {
                player.addTag("HasNebulousMeter1")
                player.runCommand("playsound note.chime @s ~ ~ ~ 0.6 1.5 1")
            }
            break;

        case "mnra_cata:meowclysm":

            if (target.typeId !== "minecraft:cat") {
                target.runCommand("summon minecraft:cat ~ ~1 ~")
            }
            break;
    }
});