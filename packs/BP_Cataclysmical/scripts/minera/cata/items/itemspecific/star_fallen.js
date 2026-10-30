import { world, system } from "@minecraft/server";

const Star_Fallen = "mnra_cata:star_fallen";
const DashDuration = 20;

const dashingPlayers = new Map();
world.afterEvents.itemUse.subscribe(ev => {
    const player = ev.source;
    const item = ev.itemStack;
    if (!player.getItemCooldown("star_fallen")) {
        if (!player || item.typeId !== Star_Fallen) return;
        dashingPlayers.set(player.id, { ticksLeft: DashDuration });
        if (player.isGliding) {
            player.runCommand("playanimation @s animation.mnra_cataplayer.test.star_fallen_dash")
            player.runCommand("playsound sound.spear_dash @s ^^^1 1 1.2 1")
        } else {
            player.runCommand("playanimation @s animation.mnra_cataplayer.test.star_fallen_dash_normal")
            player.runCommand("playsound sound.spear_dash @s ^^^1 1 1.2 1")
        }
        player.startItemCooldown("star_fallen", 300)
    }
});

const glidingPlayers = new Map();
const fallingPlayers = new Map();

system.runInterval(() => {
    for (const [playerId, data] of dashingPlayers.entries()) {
        const player = [...world.getPlayers()].find(p => p.id === playerId);
        if (!player) {
            dashingPlayers.delete(playerId);
            continue;
        }

        const vel = player.getVelocity();
        if (vel.y < 0 && !fallingPlayers.has(playerId)) {
            fallingPlayers.set(playerId, player.location.y);
        }

        player.applyKnockback({ x: -player.getViewDirection().x * -2, z: -player.getViewDirection().z * -2 }, -player.getViewDirection().y * -1);

        player.dimension.spawnParticle("mnra_cata:stellar_greatsword_crit", {
            x: player.location.x,
            y: player.location.y,
            z: player.location.z
        });
        player.dimension.spawnParticle("mnra_cata:stellar_greatsword_crit", {
            x: player.location.x,
            y: player.location.y,
            z: player.location.z
        });
        player.dimension.spawnParticle("mnra_cata:stellar_greatsword_star_crit", {
            x: player.location.x,
            y: player.location.y,
            z: player.location.z
        });

        data.ticksLeft--;
        if (data.ticksLeft <= 0) {
            dashingPlayers.delete(playerId);
        }
        if (player && player.isGliding) {
            glidingPlayers.set(player.id, true);
        } else if (glidingPlayers.has(playerId)) {

            if (data.ticksLeft < 10) {
                const explodeLocation = player ? player.location : data.lastLocation;
                if (explodeLocation) {

                    let startY = fallingPlayers.get(playerId) ?? player.location.y;
                    let endY = player.location.y;
                    fallingPlayers.delete(playerId);
                    let fallDistance = Math.max(0, startY - endY);

                    fallDistance = Math.min(fallDistance, 50);
                    let minPower = 0.5;
                    let maxPower = 15;

                    let explosionPower = minPower + ((fallDistance / 50) * (maxPower - minPower));
                    explosionPower = Math.round(explosionPower);

                    player.dimension.createExplosion(explodeLocation, explosionPower, {
                        breaksBlocks: true,
                        causesFire: false,
                        source: player || null,
                        allowUnderwater: true
                    });
                    //world.sendMessage(`Fall Distance: ${fallDistance}`);      Tracks the fall distance when dashing
                    //world.sendMessage(`Explosion Power: ${explosionPower}`);  Tracks the explosion power when BECOMING A MISSILE RAHHHH

                    player.dimension.runCommand(`particle mnra_cata:stellar_mace_astral_hit ${explodeLocation.x} ${explodeLocation.y} ${explodeLocation.z}`);
                    player.dimension.runCommand(`summon mnra_cata:star_fallen_sword_impact ${explodeLocation.x} ${explodeLocation.y} ${explodeLocation.z}`);
                    system.waitTicks(3).then(() => {
                        player.applyKnockback({ x: -player.getViewDirection().x * -0.5, z: -player.getViewDirection().z * -0.5 }, 4);
                    });

                    dashingPlayers.delete(playerId);
                }
            }
            glidingPlayers.delete(playerId);
        }
    }
});