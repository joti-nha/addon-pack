import { world, system } from "@minecraft/server";

/* ============================
   MODOS DE CÂMERA
=============================== */

const CAMERA_MODES = [
    {
        name: "first_person",
        tick: false,
        vanilla: true,
        // Clear + set first person (clear libera o F5 caso estivesse preso)
        command: `camera @s clear`
    },
    {
        name: "third_person",
        tick: false,
        vanilla: true,
        command: `camera @s set minecraft:third_person`
    },
    {
        name: "third_person_front",
        tick: false,
        vanilla: true,
        command: `camera @s set minecraft:third_person_front`
    },
    {
        name: "free_custom",
        tick: true,
        vanilla: false,
        command: `execute as @s at @s run camera @s set minecraft:free ease 0.14 in_out_quad pos ^-1 ^2 ^-2 facing ^ ^ ^6`
    },
    {
        name: "free_custom_horse",
        tick: true,
        vanilla: false,
        command: `execute as @s at @s run camera @s set minecraft:free ease 0.14 in_out_quad pos ^-1 ^2 ^-3 facing ^ ^ ^6`
    }
];

/* ============================
   HELPERS
=============================== */

function getPlayerViewIndex(player) {
    for (let i = 0; i < CAMERA_MODES.length; i++) {
        if (player.hasTag(`bv:view_${CAMERA_MODES[i].name}`)) return i;
    }
    return 0;
}

function setPlayerViewIndex(player, index) {
    for (const mode of CAMERA_MODES) {
        player.removeTag(`bv:view_${mode.name}`);
    }
    player.addTag(`bv:view_${CAMERA_MODES[index].name}`);
}

/** Pega o ItemStack da mão principal de forma robusta */
function getMainhandItem(player) {
    try {
        const equip = player.getComponent && (player.getComponent("equippable") || player.getComponent("minecraft:equippable"));
        if (!equip) return null;
        // tenta chaves com capital e minúscula (varia por runtime)
        const main = (typeof equip.getEquipment === "function")
            ? (equip.getEquipment("Mainhand") || equip.getEquipment("mainhand") || equip.getEquipment("MainHand") || equip.getEquipment("mainHand"))
            : null;
        return main || null;
    } catch (e) {
        return null;
    }
}

/* ============================
   ITEM VIEW (alternar modos)
=============================== */

world.afterEvents.itemUse.subscribe(async (event) => {
    const player = event.source;
    const item = event.itemStack;
    if (!player || !item) return;
    if (item.typeId !== "bv:view") return;

    let current = getPlayerViewIndex(player);
    let next = (current + 1) % CAMERA_MODES.length;

    setPlayerViewIndex(player, next);

    const mode = CAMERA_MODES[next];
    // se for vanilla, libera F5 antes
    if (mode.vanilla) {
        await player.runCommand("camera @s clear");
    }
    await player.runCommand(mode.command);
});

/* ============================
   HORSECAM - DETECÇÃO POR TAG "mount"
   (igual às mcfunctions que você usou)
=============================== */

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (!player.hasTag("bv:horsecam")) continue;

        const ents = player.dimension.getEntities({
            tags: ["mount"],
            location: player.location,
            maxDistance: 2
        });

        const isNearMount = ents.length > 0;
        const hasMountedTag = player.hasTag("mounted");

        if (isNearMount && !hasMountedTag) {
            player.addTag("mounted");
            const prevIndex = getPlayerViewIndex(player);
            player.addTag(`prevview_${prevIndex}`);

            const horseIndex = CAMERA_MODES.findIndex(m => m.name === "free_custom_horse");
            if (horseIndex !== -1) {
                setPlayerViewIndex(player, horseIndex);
                player.runCommand(CAMERA_MODES[horseIndex].command);
            }
        }

        if (!isNearMount && hasMountedTag) {
            player.removeTag("mounted");

            let prevIndex = 0;
            for (let i = 0; i < CAMERA_MODES.length; i++) {
                if (player.hasTag(`prevview_${i}`)) {
                    prevIndex = i;
                    player.removeTag(`prevview_${i}`);
                    break;
                }
            }

            const mode = CAMERA_MODES[prevIndex];
            if (mode.vanilla) player.runCommand("camera @s clear");

            setPlayerViewIndex(player, prevIndex);
            player.runCommand(mode.command);
        }
    }
}, 2);

/* ============================================================
   FORÇAR FIRST PERSON AO SEGURAR ARCO/BESTA E RESTAURAR AO SAIR
   - salva estado antes de forçar
   - restaura quando troca/remover item
============================================================ */

const bowForceState = new Map(); // player.id -> { prevIndex }

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (!player.hasTag("bv:bowcam")) continue;

        const main = getMainhandItem(player);

        // itens que forçam first person
        const forceItems = ["minecraft:bow", "minecraft:crossbow"];

        const mainType = main && (main.typeId || main.itemId || main.id) ? (main.typeId || main.itemId || main.id) : null;
        const isForceItem = mainType && forceItems.includes(mainType);

        const hasSaved = bowForceState.has(player.id);

        // 1) começou a segurar (item agora é arco/besta e não estava forçando)
        if (isForceItem && !hasSaved) {
            const prevIndex = getPlayerViewIndex(player);
            bowForceState.set(player.id, { prevIndex });

            const firstIndex = CAMERA_MODES.findIndex(m => m.name === "first_person");
            if (firstIndex !== -1) {
                setPlayerViewIndex(player, firstIndex);
                // limpar e setar first person (command do modo já faz clear+set)
                player.runCommand(CAMERA_MODES[firstIndex].command);
                // marcar flag curta também (para evitar retrigger visual)
                player.addTag("bv:force_first");
            }
            continue;
        }

        // 2) parou de segurar (agora não é arco/besta mas tínhamos estado salvo)
        if (!isForceItem && hasSaved) {
            const saved = bowForceState.get(player.id);
            const prev = (saved && typeof saved.prevIndex === "number") ? saved.prevIndex : 0;
            const mode = CAMERA_MODES[prev];

            // restaurar tags
            setPlayerViewIndex(player, prev);

            // liberar F5 se for vanilla
            if (mode.vanilla) player.runCommand("camera @s clear");

            // aplicar comando antigo
            player.runCommand(mode.command);

            // limpar estado
            bowForceState.delete(player.id);
            player.removeTag("bv:force_first");
            continue;
        }

        // 3) item é arco/besta e já estamos forçando -> nada a fazer
        // 4) item não é arco/besta e não tínhamos estado -> nada a fazer
    }
}, 2);

/* ============================
   LOOP DE REAPLICAÇÃO DE CAMERAS COM TICK
=============================== */

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const index = getPlayerViewIndex(player);
        const mode = CAMERA_MODES[index];

        if (mode && mode.tick) {
            // reaplica a câmera custom (não limpar aqui)
            player.runCommand(mode.command);
        }
    }
}, 1);
