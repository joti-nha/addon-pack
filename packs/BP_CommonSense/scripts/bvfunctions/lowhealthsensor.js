import { world, system, EquipmentSlot, EntityComponentTypes } from '@minecraft/server';

const LOW_HP_THRESHOLD = 5; // 5 pontos de vida (2.5 corações)
const ALERT_TAG = "hp_alert_sent";
const CHECK_INTERVAL = 10; // 10 ticks = 0.5 segundos
const REQUIRED_ITEM = "minecraft:totem_of_undying";
const REQUIRED_TAG = "autototem";

/**
 * Verifica se o jogador tem o Totem of Undying na Hotbar (slots 0 a 8).
 */
function hasTotemInHotbar(player) {
    try {
        const inv = player.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!inv) return false;

        for (let i = 0; i <= 8; i++) {
            const slot = inv.getSlot(i);
            // Uso seguro do hasItem() antes de checar o typeId
            if (slot?.hasItem() && slot.typeId === REQUIRED_ITEM) {
                return true;
            }
        }
    } catch (e) { }
    return false;
}

/**
 * Troca de forma segura o item da Offhand pelo Totem da Hotbar.
 */
function tryEquipTotemToOffhand(player) {
    try {
        const equip = player.getComponent(EntityComponentTypes.Equippable);
        const inv = player.getComponent(EntityComponentTypes.Inventory)?.container;

        if (!equip || !inv) return;

        const offSlot = equip.getEquipmentSlot(EquipmentSlot.Offhand);

        // Se a Offhand já tiver o Totem, ignora
        if (offSlot.hasItem() && offSlot.typeId === REQUIRED_ITEM) return;

        let totemSlotIndex = -1;
        for (let i = 0; i <= 8; i++) {
            const slot = inv.getSlot(i);
            if (slot?.hasItem() && slot.typeId === REQUIRED_ITEM) {
                totemSlotIndex = i;
                break;
            }
        }

        // Se achou o Totem na hotbar, faz a troca direta!
        if (totemSlotIndex !== -1) {
            const totemSlot = inv.getSlot(totemSlotIndex);

            // Pega as referências dos itens (se existirem)
            const offItem = offSlot.hasItem() ? offSlot.getItem() : undefined;
            const totemItem = totemSlot.getItem();

            // A API moderna faz a troca de "gavetas" nativamente e sem riscos
            offSlot.setItem(totemItem);
            totemSlot.setItem(offItem);

            player.onScreenDisplay.setActionBar("§b§lTotem equipado na Offhand!");
        }
    } catch (e) {
        console.warn(`[Auto Totem] Erro ao equipar: ${e}`);
    }
}

/**
 * Loop Principal: Checa a vida dos jogadores e dispara o alerta
 */
system.runInterval(() => {
    try {
        for (const player of world.getPlayers()) {
            const healthComponent = player.getComponent(EntityComponentTypes.Health);

            // Se o jogador estiver morto ou sem componente de vida, remove a tag e pula
            if (!healthComponent || healthComponent.currentValue <= 0) {
                if (player.hasTag(ALERT_TAG)) {
                    player.removeTag(ALERT_TAG);
                }
                continue;
            }

            const currentHP = healthComponent.currentValue;

            // Verifica o que está na mão esquerda no momento
            const equip = player.getComponent(EntityComponentTypes.Equippable);
            const offSlot = equip?.getEquipmentSlot(EquipmentSlot.Offhand);
            const isTotemInOffhand = offSlot?.hasItem() && offSlot.typeId === REQUIRED_ITEM;

            // Condições para ativar o sistema
            const meetsCriteria =
                currentHP <= LOW_HP_THRESHOLD &&
                player.hasTag(REQUIRED_TAG) &&
                hasTotemInHotbar(player);

            if (meetsCriteria) {
                // Se a offhand não estiver com o totem, tenta colocar
                if (!isTotemInOffhand) {
                    tryEquipTotemToOffhand(player);
                }

                // Dispara o alerta apenas uma vez (evita spam)
                if (!player.hasTag(ALERT_TAG)) {
                    player.onScreenDisplay.setActionBar("§c§lCRITICAL DAMAGE! AUTO TOTEM ACTIVATING!");
                    player.dimension.playSound('mob.ghast.scream', player.location, { volume: 0.6, pitch: 0.8 });
                    player.addTag(ALERT_TAG);
                }
            } else {
                // Se curou ou perdeu o totem, remove a tag de alerta para poder tocar de novo no futuro
                if (player.hasTag(ALERT_TAG)) {
                    player.removeTag(ALERT_TAG);
                }
            }
        }
    } catch (e) {
        console.warn(`[Low HP Alert Error] Falha na execução: ${e}`);
    }
}, CHECK_INTERVAL);