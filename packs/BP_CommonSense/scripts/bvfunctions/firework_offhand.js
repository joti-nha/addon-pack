import { world, system, EquipmentSlot, EntityComponentTypes } from "@minecraft/server";

const INITIAL_BOOST_FORCE = 1.7;
const SUSTAINED_FORCE = 0.07;
const SUSTAINED_DURATION_TICKS = 20;
const PARTICLE_SPAWN_RATE = 1;

world.beforeEvents.itemUse.subscribe(event => {
    try {
        const player = event.source;
        if (player.typeId !== "minecraft:player") return;

        const equip = player.getComponent(EntityComponentTypes.Equippable);
        if (!equip) return;

        const offhandSlot = equip.getEquipmentSlot(EquipmentSlot.Offhand);
        const chestSlot = equip.getEquipmentSlot(EquipmentSlot.Chest);

        // Valida as roupas e o estado do jogador
        if (!offhandSlot.hasItem() || offhandSlot.typeId !== "minecraft:firework_rocket") return;
        if (!chestSlot.hasItem() || chestSlot.typeId !== "minecraft:elytra") return;
        if (player.isOnGround || !player.isGliding) return;

        // Cancela a ação do item da mão principal (ele serve apenas como botão para o foguete)
        event.cancel = true;

        system.run(() => {
            // Revalida a existência do foguete na mão esquerda
            if (!offhandSlot.hasItem() || offhandSlot.typeId !== "minecraft:firework_rocket") return;

            // Consome o foguete
            if (offhandSlot.amount > 1) {
                offhandSlot.amount -= 1;
            } else {
                offhandSlot.setItem(undefined);
            }

            player.dimension.playSound("firework.launch", player.location);

            const viewDir = player.getViewDirection();
            const launchImpulse = {
                x: viewDir.x * INITIAL_BOOST_FORCE,
                y: viewDir.y * INITIAL_BOOST_FORCE,
                z: viewDir.z * INITIAL_BOOST_FORCE
            };

            player.clearVelocity();
            player.applyImpulse(launchImpulse);

            let elapsedTicks = 0;
            const sustainedBoostId = system.runInterval(() => {
                try {
                    if (!player.isValid) {
                        system.clearRun(sustainedBoostId);
                        return;
                    }

                    const direction = player.getViewDirection();
                    const headPos = player.getHeadLocation();

                    player.dimension.spawnParticle("minecraft:balloon_gas_particle", headPos);

                    if (direction.y > 0) {
                        const remaining = 1 - (elapsedTicks / SUSTAINED_DURATION_TICKS);
                        const currentForce = SUSTAINED_FORCE * Math.max(remaining, 0);

                        const boostVector = {
                            x: direction.x * currentForce,
                            y: direction.y * currentForce,
                            z: direction.z * currentForce
                        };
                        player.applyImpulse(boostVector);
                    }

                    elapsedTicks++;
                    if (elapsedTicks >= SUSTAINED_DURATION_TICKS) {
                        system.clearRun(sustainedBoostId);
                    }

                } catch (err) {
                    system.clearRun(sustainedBoostId);
                }
            }, PARTICLE_SPAWN_RATE);
        });

    } catch (err) {
        console.warn(`Erro no foguete offhand: ${err}`);
    }
});