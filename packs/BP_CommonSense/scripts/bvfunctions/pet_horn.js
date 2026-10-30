import { world, system } from "@minecraft/server";

// 1. Vincula automaticamente o pet ao jogador quando há interação (caso o pet ainda não tenha dono)
world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const { player, target } = event;
    if (!target || !target.isValid) return;

    // Se a entidade for um mob domesticado (pet)
    if (target.hasComponent("minecraft:is_tamed")) {
        const currentOwnerId = target.getDynamicProperty("bv:owner_id");

        // Se o pet ainda não tem um dono gravado, registra o ID deste jogador
        if (!currentOwnerId) {
            target.setDynamicProperty("bv:owner_id", player.id);
        }
    }
});

// 2. Sistema do Chifre (Pet Horn) restrito aos pets do próprio dono
world.afterEvents.itemUse.subscribe((event) => {
    const { source: player, itemStack: item } = event;

    if (!player || player.typeId !== "minecraft:player") return;

    // Verifica se é o chifre de cabra com o nome exato "Pet Horn"
    if (!item || !item.typeId.includes("goat_horn") || item.nameTag !== "Pet Horn") return;

    system.run(() => {
        const dimension = player.dimension;
        const playerLoc = player.location;

        // Busca todas as entidades em um raio de 40 blocos do jogador
        const nearbyEntities = dimension.getEntities({
            location: playerLoc,
            maxDistance: 40
        });

        let affectedPetsCount = 0;

        for (const entity of nearbyEntities) {
            if (!entity.isValid) continue;

            // Verifica se é um pet domesticado
            if (entity.hasComponent("minecraft:is_tamed")) {
                const petOwnerId = entity.getDynamicProperty("bv:owner_id");

                // REGRA DE OURO: Só afeta se o pet tiver um dono registrado E o dono for o jogador atual
                if (petOwnerId === player.id) {
                    try {
                        entity.triggerEvent("bv:on_not_wandering");
                        affectedPetsCount++;
                    } catch (error) {
                        // Ignora caso ocorra algum erro no evento do mob
                    }
                }
            }
        }

        // Feedback visual na hotbar do jogador
        if (affectedPetsCount > 0) {
            player.onScreenDisplay.setActionBar(`§a[Chifre dos Pets] Sinal enviado a §e${affectedPetsCount} §ade seus pets!`);
            dimension.playSound("horn.call.0", playerLoc);
        } else {
            player.onScreenDisplay.setActionBar("§e[Chifre dos Pets] Nenhum pet num raio de 40 blocos.");
        }
    });
});