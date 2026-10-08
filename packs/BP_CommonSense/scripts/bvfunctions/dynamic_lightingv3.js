import { world, system, EquipmentSlot, BlockPermutation, EntityComponentTypes } from "@minecraft/server";

// =====================
// LISTAS DE ITENS
// =====================
const lightItems5 = ["minecraft:ominous_trial_key", "minecraft:glow_ink_sac", "minecraft:glow_lichen", "minecraft:magma", "minecraft:redstone_torch", "minecraft:glow_berries", "minecraft:glow_frame", "minecraft:enchanted_golden_apple"];
const lightItems7 = ["minecraft:soul_torch", "minecraft:sea_pickle", "minecraft:glowstone_dust", "minecraft:blaze_powder"];
const lightItems9 = ["minecraft:torch", "minecraft:soul_lantern", "minecraft:lava_bucket", "minecraft:blaze_rod", "minecraft:end_rod", "minecraft:shroomlight"];
const lightItems11 = ["minecraft:lantern", "minecraft:waxed_oxidized_copper_lantern", "minecraft:waxed_weathered_copper_lantern", "minecraft:oxidized_copper_lantern", "minecraft:weathered_copper_lantern", "minecraft:copper_torch", "minecraft:soul_campfire"];
const lightItems13 = ["minecraft:copper_lantern", "minecraft:exposed_copper_lantern", "minecraft:waxed_copper_lantern", "minecraft:waxed_exposed_copper_lantern", "minecraft:campfire", "minecraft:glowstone", "minecraft:sea_lantern", "minecraft:verdant_froglight", "minecraft:pearlescent_froglight", "minecraft:ochre_froglight"];
const lightItems15 = ["minecraft:nether_star"];
const lanternItems = ["minecraft:lantern", "minecraft:soul_lantern", "minecraft:copper_lantern", "minecraft:exposed_copper_lantern", "minecraft:oxidized_copper_lantern", "minecraft:waxed_copper_lantern", "minecraft:waxed_exposed_copper_lantern", "minecraft:waxed_weathered_copper_lantern", "minecraft:weathered_copper_lantern", "minecraft:weathered_lantern"];

const lightMap = [
    { level: 5, items: lightItems5 }, { level: 7, items: lightItems7 }, { level: 9, items: lightItems9 },
    { level: 11, items: lightItems11 }, { level: 13, items: lightItems13 }, { level: 15, items: lightItems15 }
];

// =====================
// ESTADO (CACHE)
// =====================
const playerStates = new Map();
const debugNotified = new Set();

function getLightLevel(typeId) {
    if (!typeId) return 0;
    for (const entry of lightMap) {
        if (entry.items.includes(typeId)) return entry.level;
    }
    return 0;
}

function hasLanternInHotbar(player) {
    try {
        const inv = player.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!inv) return false;
        for (let i = 0; i < 9; i++) {
            const slot = inv.getSlot(i);
            // Verifica com segurança se o slot existe e tem item antes de ler o typeId
            if (slot?.hasItem() && lanternItems.includes(slot.typeId)) return true;
        }
    } catch (e) { }
    return false;
}

function clearLightBlock(dimension, pos) {
    if (!pos) return;
    try {
        const block = dimension.getBlock(pos);
        if (block && block.typeId === "bv:light_source") {
            block.setPermutation(BlockPermutation.resolve("minecraft:air"));
        }
    } catch (e) { }
}

// =====================
// LOOP PRINCIPAL
// =====================
system.runInterval(() => {
    for (const [id, state] of playerStates) {
        if (!world.getEntity(id)) playerStates.delete(id);
    }

    for (const player of world.getPlayers()) {
        try {
            const dimension = player.dimension;
            const lastState = playerStates.get(player.id);

            const hasTag = player.hasTag("bv:dlighton");
            const isGlobalOn = world.getDynamicProperty("bv:dynamic_light");

            if (!hasTag && !isGlobalOn) {
                if (lastState) {
                    clearLightBlock(dimension, lastState.lightPos);
                    playerStates.delete(player.id);
                }
                continue;
            }

            // --- CORREÇÃO DO ERRO FATAL AQUI ---
            const equip = player.getComponent(EntityComponentTypes.Equippable);

            const mainSlot = equip?.getEquipmentSlot(EquipmentSlot.Mainhand);
            // Só tenta ler o typeId se o slot acusar que tem um item dentro
            const mainType = mainSlot?.hasItem() ? mainSlot.typeId : undefined;

            const offSlot = equip?.getEquipmentSlot(EquipmentSlot.Offhand);
            // Faz o mesmo para a mão secundária
            const offType = offSlot?.hasItem() ? offSlot.typeId : undefined;

            let targetLight = Math.max(getLightLevel(mainType), getLightLevel(offType));

            if (targetLight === 0 && player.hasTag("bv:dlight_hotbar") && hasLanternInHotbar(player)) {
                targetLight = 11;
            }

            let currentLight = lastState ? lastState.level : 0;
            const step = 3;

            if (currentLight < targetLight) currentLight = Math.min(currentLight + step, targetLight);
            else if (currentLight > targetLight) currentLight = Math.max(currentLight - step, targetLight);

            const pLoc = player.location;
            const playerBlockPos = {
                x: Math.floor(pLoc.x),
                y: Math.floor(pLoc.y + 1.6),
                z: Math.floor(pLoc.z)
            };

            let moved = false;
            let levelChanged = false;

            if (lastState) {
                moved = lastState.playerPos.x !== playerBlockPos.x ||
                    lastState.playerPos.y !== playerBlockPos.y ||
                    lastState.playerPos.z !== playerBlockPos.z;

                levelChanged = lastState.level !== currentLight;

                if (!moved && !levelChanged) {
                    lastState.targetLight = targetLight;
                    continue;
                }

                clearLightBlock(dimension, lastState.lightPos);
            }

            let placedPos = null;

            if (currentLight > 0) {
                const offsets = [
                    { x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 }, { x: 0, y: 1, z: 0 },
                    { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 }
                ];

                for (const offset of offsets) {
                    const tryPos = { x: playerBlockPos.x + offset.x, y: playerBlockPos.y + offset.y, z: playerBlockPos.z + offset.z };
                    const block = dimension.getBlock(tryPos);

                    if (block && !block.isLiquid) {
                        if (block.typeId === "minecraft:air" || block.typeId === "bv:light_source") {
                            try {
                                const lightPerm = BlockPermutation.resolve("bv:light_source", { "bv:level": currentLight });
                                block.setPermutation(lightPerm);
                                placedPos = tryPos;
                                break;
                            } catch (e) {
                                if (lastState && lastState.targetLight !== targetLight) {
                                    player.sendMessage(`§c[DEBUG 3] Falha na Permutation: ${e}`);
                                }
                            }
                        }
                    }
                }

            }

            playerStates.set(player.id, {
                playerPos: playerBlockPos,
                lightPos: placedPos,
                level: currentLight,
                targetLight: targetLight
            });

        } catch (e) {
            if (!debugNotified.has("error_" + player.id)) {
                player.sendMessage(`§4[ERRO FATAL LUZ] ${e}`);
                debugNotified.add("error_" + player.id);
            }
        }
    }
}, 4);