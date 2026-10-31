import { world, system, EquipmentSlot, EntityComponentTypes, ItemStack } from "@minecraft/server";

const VALID_ITEMS = [
    "minecraft:torch", "minecraft:lantern", "minecraft:soul_lantern",
    "minecraft:redstone_torch", "minecraft:soul_torch", "minecraft:lava_bucket",
    "minecraft:copper_lantern", "minecraft:exposed_copper_lantern",
    "minecraft:oxidized_copper_lantern", "minecraft:waxed_copper_lantern",
    "minecraft:waxed_exposed_copper_lantern", "minecraft:waxed_oxidized_copper_lantern",
    "minecraft:waxed_weathered_copper_lantern", "minecraft:weathered_copper_lantern",
    "minecraft:copper_torch", "minecraft:wind_charge"
];

const EQUIP_ITEMS = [
    "minecraft:firework_rocket",
    "minecraft:shield",
    "minecraft:totem_of_undying",
];

const VALID_TAGS = [
    "bv:is_trinket"
];

// ====================================================================
//  SISTEMA DOUBLE SNEAK
// ====================================================================
let lastSneakTick = new Map();

system.runInterval(() => {
    const tick = system.currentTick;

    for (const player of world.getPlayers()) {
        const wasSneaking = player.getDynamicProperty("bv:lastSneakState") || false;

        if (player.isSneaking && !wasSneaking) {
            const last = lastSneakTick.get(player.id) || 0;
            if (tick - last <= 18) {
                swapOffhand(player);
            }
            lastSneakTick.set(player.id, tick);
        }

        player.setDynamicProperty("bv:lastSneakState", player.isSneaking);
    }
}, 1);

// ====================================================================
//  FUNÇÃO DE TROCA INTELIGENTE
// ====================================================================
function swapOffhand(player) {
    if (!player.hasTag("bv:offhandtorch")) return;

    const equip = player.getComponent(EntityComponentTypes.Equippable);
    if (!equip) return;

    const mainSlot = equip.getEquipmentSlot(EquipmentSlot.Mainhand);
    const offSlot = equip.getEquipmentSlot(EquipmentSlot.Offhand);

    const isMainEmpty = !mainSlot.hasItem();
    const isOffEmpty = !offSlot.hasItem();

    if (isMainEmpty && isOffEmpty) return;

    const mainItem = isMainEmpty ? undefined : mainSlot.getItem();
    const offItem = isOffEmpty ? undefined : offSlot.getItem();

    try {
        // ---------------------------------------------------------
        // AÇÃO COMUM: TRAZER DA OFFHAND PARA A MÃO PRINCIPAL
        // ---------------------------------------------------------
        if (isMainEmpty && !isOffEmpty) {
            mainSlot.setItem(offItem);
            offSlot.setItem(undefined);
            player.playSound("armor.equip_generic");
            return;
        }

        // ---------------------------------------------------------
        // BIFURCAÇÃO DE ROTAS (MÃO PRINCIPAL CHEIA)
        // ---------------------------------------------------------
        const mainType = mainItem.typeId;
        const mainCount = mainItem.amount;

        // Verifica em qual lista o item se encaixa
        const tags = mainItem.getTags() ?? [];
        // Addon Pack: escudos de addons (etiqueta de escudo do A&S) trocam de mao como o escudo do jogo
        const isNative = EQUIP_ITEMS.includes(mainType) || tags.includes("oreville:is_shield");
        const isForced = VALID_ITEMS.includes(mainType) || tags.some(t => VALID_TAGS.includes(t));

        // Se o item não estiver em nenhuma lista, cancela a troca
        if (!isNative && !isForced) return;

        // Clona o que estiver na segunda mão para não perder durante a troca
        const offClone = offItem ? offItem.clone() : undefined;

        // ROTA 1: MÉTODO NATIVO (Escudos, Foguetes, Totens)
        if (isNative) {
            offSlot.setItem(mainItem);
            mainSlot.setItem(offClone);
            player.playSound("armor.equip_generic");
        }

        // ROTA 2: MÉTODO FORÇADO VIA COMANDO (Tochas, Lanternas, Baldes)
        else if (isForced) {
            mainSlot.setItem(offClone); // Salva o item antigo na mão principal

            system.run(() => {
                try {
                    player.runCommand(`replaceitem entity @s slot.weapon.offhand 0 ${mainType} ${mainCount}`);
                    player.playSound("armor.equip_generic");
                } catch (err) {
                    // Rede de segurança
                    const inv = player.getComponent(EntityComponentTypes.Inventory)?.container;
                    if (inv) inv.addItem(new ItemStack(mainType, mainCount));

                    player.sendMessage(`§c[Aviso Offhand] Troca bloqueada. Seu item foi devolvido!`);
                }
            });
        }

    } catch (err) {
        // Erros silenciosos para proteger o loop
    }
}