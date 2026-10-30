import { world, TicksPerSecond, system, EntityDamageCause, EquipmentSlot } from '@minecraft/server'


//ecliptic_greatsword_test
system.runInterval(
    () => {
        world.getAllPlayers().filter(
            (player) => {
                if (player.getItemCooldown('ecliptic_greatsword_test')) {
                    player.runCommand("particle mnra_cata:ecliptic_greatsword_impact ~ ~ ~")
                    player.runCommand("particle mnra_cata:ecliptic_greatsword_impact ~ ~ ~")
                }
            }
        )
    }, 5)
//exodius_greatsword
const Particles = [
    "mnra_cata:floret_particle_projectile",
    "mnra_cata:solar_particle_projectile",
    "mnra_cata:lunar_particle_projectile"
];

let tick = 0;
system.runInterval(() => {
    tick++;
    if (tick % 5 !== 0) return;

    for (const player of world.getPlayers()) {

        const equip = player.getComponent("equippable");
        const main = equip?.getEquipment(EquipmentSlot.Mainhand);

        if (!main || main.typeId !== "mnra_cata:exodius_greatsword") continue;
        if (player.getItemCooldown("exodius_greatsword")) continue;

        const pos = player.location;
        const height = 3;
        const radius = 2;
        const t = Date.now() / 400;

        for (let i = 0; i < 3; i++) {
            const angle = t + (i * (Math.PI * 2 / 3));
            const x = pos.x + Math.cos(angle) * radius;
            const y = pos.y + height
            const z = pos.z + Math.sin(angle) * radius;

            player.dimension.spawnParticle(Particles[i], { x, y, z });
        }
    }
});
//star_fracture
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (player.typeId !== "minecraft:player") continue;

        const inv = player.getComponent("inventory")?.container;
        const item = inv?.getItem(player.selectedSlotIndex);
        if (!item || !(item.typeId === "mnra_cata:star_fracture")) continue;

        if (player.hasTag("star_fracture_meter10")) player.onScreenDisplay.setActionBar("");
        else if (player.hasTag("star_fracture_meter9")) player.onScreenDisplay.setActionBar("");
        else if (player.hasTag("star_fracture_meter8")) player.onScreenDisplay.setActionBar("");
        else if (player.hasTag("star_fracture_meter7")) player.onScreenDisplay.setActionBar("");
        else if (player.hasTag("star_fracture_meter6")) player.onScreenDisplay.setActionBar("");
        else if (player.hasTag("star_fracture_meter5")) player.onScreenDisplay.setActionBar("");
        else if (player.hasTag("star_fracture_meter4")) player.onScreenDisplay.setActionBar("");
        else if (player.hasTag("star_fracture_meter3")) player.onScreenDisplay.setActionBar("");
        else if (player.hasTag("star_fracture_meter2")) player.onScreenDisplay.setActionBar("");
        else if (player.hasTag("star_fracture_meter1")) player.onScreenDisplay.setActionBar("");
        else player.onScreenDisplay.setActionBar(""); // no meter
    }
}, 2);
system.runInterval(() => {
    world.getAllPlayers().forEach((player) => {
        if (player.hasTag('star_fracture_active')) {

            player.runCommand("particle mnra_cata:star_fracture_activate_emitter1 ~ ~ ~");
            player.runCommand("particle mnra_cata:star_fracture_activate_emitter2 ~ ~ ~");

            const activeTimers = new Set();

            if (!activeTimers.has(player.id)) {
                activeTimers.add(player.id);

                system.runTimeout(() => {
                    if (player.hasTag('star_fracture_active')) {
                        player.removeTag('star_fracture_active');
                    }
                    activeTimers.delete(player.id);
                }, 400);
            }
        }
    });
}, 1);

system.runInterval(
    () => {
        world.getAllPlayers().filter(
            (player) => {
                if (player.getItemCooldown('blazing_excalibur_test')) {
                    player.setOnFire(2)
                    player.removeEffect("fire_resistance")
                    player.runCommand("particle mnra_cata:blazing_excalibur_rage_emitter ~ ~ ~")

                    const nearbyEntities = player.dimension.getEntities({
                        location: player.location,
                        maxDistance: 4,
                        closest: 6,
                        excludeFamilies: ["player"]
                    });
                    for (const entity of nearbyEntities) {
                        if (entity.hasComponent("health")) {
                            entity.setOnFire(3)
                            entity.runCommand("particle mnra_cata:blazing_excalibur_impact ~ ~ ~")
                        }
                    }
                }
            }
        )
    }, 1)
const Blasters = [
    "mnra_cata:ray_gun",
    "mnra_cata:spore_thrower",
    "mnra_cata:terror_skull_launcher",
];

system.runInterval(() => {

    for (const player of world.getAllPlayers()) {

        const selectedItem = player.getComponent('equippable').getEquipment('Mainhand')

        if (!selectedItem) continue;

        // Check if the held item is one of your guns
        if (Blasters.includes(selectedItem.typeId)) {
            player.runCommand("playanimation @s animation.mnra_cataplayer.test.hold_gun");
        }
    }

}, 1);