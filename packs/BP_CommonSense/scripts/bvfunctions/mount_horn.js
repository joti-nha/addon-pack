import { world, system, EquipmentSlot, EntityComponentTypes } from '@minecraft/server';

const MOUNT_HORN_ITEM_ID = "bv:mount_horn";

const ALLOWED_MOUNTS = [
    "minecraft:horse",
    "minecraft:donkey",
    "minecraft:mule",
    "minecraft:skeleton_horse",
    "minecraft:zombie_horse",
    "minecraft:camel",
    "minecraft:camel_husk",
    "minecraft:nautilus",
    "minecraft:strider",
    "minecraft:happy_ghast",
    "cs:copper_mechstrider"
];

// Evita que o chifre toque duas vezes se os dois eventos dispararem juntos
const hornCooldowns = new Map();

// ====================================================================
// LISTENER 1: VINCULAR A MONTARIA (Agachar + Interagir com a entidade)
// ====================================================================
world.beforeEvents.playerInteractWithEntity.subscribe(event => {
    const { player, target } = event;

    if (player.typeId !== "minecraft:player" || !player.isSneaking) return;

    const equip = player.getComponent(EntityComponentTypes.Equippable);
    const mainSlot = equip?.getEquipmentSlot(EquipmentSlot.Mainhand);

    // Garante que está segurando o chifre
    if (!mainSlot?.hasItem() || mainSlot.typeId !== MOUNT_HORN_ITEM_ID) return;

    const isRideable = target.hasComponent(EntityComponentTypes.Rideable);
    const isAllowedType = ALLOWED_MOUNTS.includes(target.typeId);

    // SE O MOB FOR INVÁLIDO:
    if (!target || !isRideable || !isAllowedType) {
        // system.run é necessário pois não podemos exibir texto na tela dentro do beforeEvents
        system.run(() => {
            player.onScreenDisplay.setActionBar("§cEsta criatura não pode ser vinculada ao chifre.");
        });
        event.cancel = true; // Bloqueia a interação
        return;
    }

    // Bloqueia a ação padrão para o mob não abrir inventário/ser montado acidentalmente
    event.cancel = true;

    // LÓGICA DE VINCULAÇÃO (Assíncrona para não travar o jogo)
    system.run(() => {
        const mountTag = `mount_horn_${player.id}`;

        // 1. Desvincula antigas montarias
        const allEntitiesInDimension = player.dimension.getEntities({ tags: [mountTag] });

        for (const oldMount of allEntitiesInDimension) {
            oldMount.removeTag(mountTag);
            try {
                // NOVO PADRÃO: Dispara eventos da entidade nativamente
                oldMount.triggerEvent("bv:chunk_loader_disabler");
            } catch (e) { }
        }

        // 2. Vincula a nova
        target.addTag(mountTag);

        try {
            // NOVO PADRÃO: Dispara o ativador de chunk
            target.triggerEvent("bv:chunk_loader_enabler");
        } catch (e) { }

        player.onScreenDisplay.setActionBar("§aEsta montaria agora está vinculada ao seu chifre!");
        player.dimension.playSound("random.levelup", player.location);
    });
});


// ====================================================================
// LISTENER 2: CHAMAR A MONTARIA (Usar o item no ar sem agachar)
// ====================================================================

// ROTA A: Componente Customizado (Mais Rápido/Recomendado)
system.beforeEvents.startup.subscribe((initEvent) => {
    initEvent.itemComponentRegistry.registerCustomComponent("bv:mount_horn_use", {
        onUse: (event) => {
            handleHornUse(event.source);
        }
    });
});

// ROTA B: Evento Global (Rede de Segurança)
world.afterEvents.itemUse.subscribe(event => {
    const { itemStack, source: player } = event;
    if (player.typeId !== "minecraft:player" || itemStack?.typeId !== MOUNT_HORN_ITEM_ID) return;
    handleHornUse(player);
});

// A função que realmente puxa o animal
function handleHornUse(player) {
    if (player.isSneaking) return; // Se agachou, é porque quer vincular, então ignora.

    // Controle anti-duplicação de som/evento
    const now = Date.now();
    if (hornCooldowns.has(player.id) && now - hornCooldowns.get(player.id) < 500) return;
    hornCooldowns.set(player.id, now);

    const mountTag = `mount_horn_${player.id}`;

    player.dimension.playSound("horn.call.1", player.location);

    // Atraso de 10 ticks (meio segundo) para o som ecoar antes do bicho aparecer
    system.runTimeout(() => {
        const nearbyEntities = player.dimension.getEntities({
            tags: [mountTag]
        });

        if (nearbyEntities.length > 0) {
            const mount = nearbyEntities[0];
            try {
                // NOVO PADRÃO: Teleporte nativo exigindo objeto de dimensão
                mount.teleport(player.location, { dimension: player.dimension });
                player.onScreenDisplay.setActionBar("§aSua montaria foi teletransportada até você!");
            } catch (e) {
                player.onScreenDisplay.setActionBar("§cErro: A montaria não pôde ser movida.");
            }
        } else {
            player.onScreenDisplay.setActionBar("§cNenhuma montaria vinculada por perto.");
        }
    }, 10);
}