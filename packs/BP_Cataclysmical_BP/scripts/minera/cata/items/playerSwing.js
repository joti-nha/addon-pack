import { world, system, TicksPerSecond, ItemStack } from "@minecraft/server";
import { getHeldItem } from "./entityHitEntity.js";


const Volume = 0.4;
const Volume1 = 2

//Sound Effects
world.afterEvents.playerSwingStart.subscribe(ev => {
    const player = ev.player;

    if (!player) return;
    if (player.typeId !== "minecraft:player") return;

    const item = getHeldItem(player);
    if (!item) return;

    //item type
    switch (item.typeId) {
        case "mnra_cata:wooden_greatsword":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1.5 1`)
            break;

        case "mnra_cata:stone_greatsword":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1.5 1`)
            break;

        case "mnra_cata:copper_greatsword":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1.5 1`)
            break;

        case "mnra_cata:iron_greatsword":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1.5 1`)
            break;

        case "mnra_cata:gold_greatsword":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1.5 1`)
            break;

        case "mnra_cata:diamond_greatsword":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1.5 1`)
            break;

        case "mnra_cata:netherite_greatsword":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1.5 1`)
            break;

        case "mnra_cata:platinum_greatsword":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1.5 1`)
            break;

        case "mnra_cata:phantasma_greatsword":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1.5 1`)
            break;

        case "mnra_cata:twilight_edge":
            player.runCommand(`playsound sound.powerful_sword_swing @a[r=10] ^^^2 ${Volume} 1 1`)
            break;

        case "mnra_cata:exodius_greatsword":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1.6 1`)
            break;

        case "mnra_cata:stellar_greatsword":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 2 1`)
            break;

        case "mnra_cata:ecliptic_greatsword":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1.6 1`)
            break;

        case "mnra_cata:star_fallen":
            player.runCommand(`playsound sound.powerful_sword_swing @a[r=10] ^^^2 ${Volume} 1 1`)
            break;

        case "mnra_cata:floret_hatchet":
            player.runCommand(`playsound sound.small_sword_swing @a[r=10] ^^^2 ${Volume1} 1 1`)

            break;
        case "mnra_cata:morningstar":
            player.runCommand(`playsound sound.small_sword_swing @a[r=10] ^^^2 ${Volume1} 1 1`)
            break;

        case "mnra_cata:everbloom":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1 1`)
            break;

        case "mnra_cata:blazing_excalibur":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1 1`)
            break;

        case "mnra_cata:sun_striker_claymore":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1 1`)
            break;

        case "mnra_cata:sunlight":
            player.runCommand(`playsound sound.small_sword_swing @a[r=10] ^^^2 ${Volume1} 1 1`)
            break;

        case "mnra_cata:moonlight":
            player.runCommand(`playsound sound.small_sword_swing @a[r=10] ^^^2 ${Volume1} 1 1`)
            break;

        case "mnra_cata:platinum_halberd":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1 1`)
            break;

        case "mnra_cata:verdant_blade":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1 1`)
            break;

        case "mnra_cata:verdant_greatsword":
            player.runCommand(`playsound sound.massive_weapon_swing @a[r=10] ^^^2 ${Volume} 1 1`)
            break;

        case "mnra_cata:anchor":
            player.runCommand(`playsound random.anvil_land @a[r=10] ^^^2 ${Volume} 1.3 1`)
            break;

        case "mnra_cata:moonsickle":
            player.runCommand(`playsound sound.small_sword_swing @a[r=10] ^^^2 ${Volume1} 1 1`)
            break;

        case "mnra_cata:star_sword":
            player.runCommand(`playsound sound.small_sword_swing @a[r=10] ^^^2 ${Volume1} 1.2 1`)
            break;

        case "mnra_cata:meowclysm":
            player.runCommand(`playsound sound.meowclysm @a[r=10] ^^^2 ${Volume} 1 1`)
            break;

        case "mnra_cata:phoenix_blade":
            player.runCommand(`playsound mob.sun_tribunal_normal_attack_projectile @a[r=10] ^^^2 ${Volume} 1 1`)
            break;

        case "mnra_cata:star_fracture":
            player.runCommand(`playsound sound.powerful_sword_swing @a[r=10] ^^^2 ${Volume} 1 1`)
            break;

        case "mnra_cata:divine_scythe_of_heaven":
            player.runCommand(`playsound sound.powerful_sword_swing @a[r=10] ^^^2 ${Volume} 0.6 1`)
            break;

        case "mnra_cata:empty_item":
            player.runCommand(`playsound sound.powerful_sword_swing @a[r=10] ^^^2 ${Volume} 1 1`)
            break;

        case "mnra_cata:empty_item":
            player.runCommand(`playsound sound.powerful_sword_swing @a[r=10] ^^^2 ${Volume} 1 1`)
            break;

        case "mnra_cata:empty_item":
            player.runCommand(`playsound sound.powerful_sword_swing @a[r=10] ^^^2 ${Volume} 1 1`)
            break;

        case "mnra_cata:empty_item":
            player.runCommand(`playsound sound.powerful_sword_swing @a[r=10] ^^^2 ${Volume} 1 1`)
            break;
    }
});


world.afterEvents.playerSwingStart.subscribe(ev => {
    const player = ev.player;

    if (!player) return;
    if (player.typeId !== "minecraft:player") return;

    const item = getHeldItem(player);
    if (!item) return;

    //item type
    switch (item.typeId) {

        case "mnra_cata:exodius_greatsword":
            if (!player.getItemCooldown('exodius_greatsword')) {
                player.runCommand("/summon mnra_cata:exodius_elements ^^1^1 facing ^90^^90 floret")
                player.runCommand("/summon mnra_cata:exodius_elements ^^1^1 facing ^^^90 solar")
                player.runCommand("/summon mnra_cata:exodius_elements ^^1^1 facing ^-90^^90 lunar")
                player.runCommand(`playsound sound.sunandmoonlight_change @a[r=10] ^^^2 ${Volume} 1.5 1`)
                player.startItemCooldown('exodius_greatsword', 40)
            }
            break;

        case "mnra_cata:twilight_spear":
            player.applyKnockback({ x: -player.getViewDirection().x * 3, z: -player.getViewDirection().z * 3 }, 0.2);
            player.runCommand("particle mnra_cata:twilight_edge_impact ~ ~ ~")
            break;

        case "mnra_cata:sunflare_glaive":
            player.runCommand(`playsound sound.solar_swing @a[r=10] ^^^2 ${Volume} 1.1 1`)
            break;

        case "mnra_cata:phoenix_blade":
            if (!player.getItemCooldown('phoenix_blade')) {
                player.startItemCooldown('phoenix_blade', 60)
                player.runCommand("summon mnra_cata:player_phantom_phoenix_blade ^^1^ facing ^^^90 start1")
            }
            break;

        case "mnra_cata:exodius_spear": {
            const roll = Math.random();

            if (roll < 1 / 3) {
                player.runCommand("/summon mnra_cata:exodius_elements ^^1^1 facing ^^^90 lunar");
            } else if (roll < 2 / 3) {
                player.runCommand("/summon mnra_cata:exodius_elements ^^1^1 facing ^^^90 solar");
            } else {
                player.runCommand("/summon mnra_cata:exodius_elements ^^1^1 facing ^^^90 floret");
            }
            break;

        }

    }
});