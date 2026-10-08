// Este script permite que um jogador conserte bigornas danificadas usando barras de ferro.
// Atualizado para @minecraft/server v2.5.0 (API 1.26.0)

import {
    world,
    system,
    BlockPermutation,
    EntityComponentTypes,
    EquipmentSlot
} from "@minecraft/server";

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    const { block, itemStack, player } = event;

    // --- Condição Principal para Ativar o Conserto ---
    if (
        (block.typeId === "minecraft:chipped_anvil" || block.typeId === "minecraft:damaged_anvil") &&
        itemStack?.typeId === "minecraft:iron_ingot" &&
        !player.isSneaking
    ) {
        // Cancela a interface padrão da bigorna
        event.cancel = true;

        system.run(() => {
            const currentBlockTypeId = block.typeId;
            let newBlockTypeId = "";

            // --- Lógica de Conserto ---
            if (currentBlockTypeId === "minecraft:damaged_anvil") {
                newBlockTypeId = "minecraft:chipped_anvil";
            } else if (currentBlockTypeId === "minecraft:chipped_anvil") {
                newBlockTypeId = "minecraft:anvil";
            } else {
                return;
            }

            // --- Consome a Barra de Ferro (Novo Padrão v2.5.0) ---
            // Usamos o componente Equippable para manipular o item na mão de forma mais segura
            const equippable = player.getComponent(EntityComponentTypes.Equippable);
            if (equippable) {
                const mainhandSlot = equippable.getEquipmentSlot(EquipmentSlot.Mainhand);

                if (mainhandSlot.hasItem()) {
                    if (mainhandSlot.amount > 1) {
                        // Agora você pode simplesmente decrementar a propriedade amount do slot
                        mainhandSlot.amount -= 1;
                    } else {
                        // Remove o item se for a última barra de ferro
                        mainhandSlot.setItem(undefined);
                    }
                }
            }

            // --- Atualiza o Bloco ---
            const newPermutation = BlockPermutation.resolve(newBlockTypeId);
            block.setPermutation(newPermutation);

            // Toca um som de conserto para feedback
            player.dimension.playSound("random.anvil_land", block.location);
        });
    }
});