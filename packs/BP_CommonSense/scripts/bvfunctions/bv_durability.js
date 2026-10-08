import { world, system } from "@minecraft/server";
//Durability function
function applyDurability(player) {
    const inv = player.getComponent("inventory")?.container;
    const slot = inv?.getSlot(player.selectedSlotIndex);
    const item = slot?.getItem();

    if (!item || !item.hasTag("bv:durability")) return;

    const durability = item.getComponent("durability");
    if (!durability) return;

    durability.damage += 1;

    if (durability.damage >= durability.maxDurability) {
        player.playSound("random.break");
        slot.setItem(undefined);
    } else {
        slot.setItem(item);
    }
}
//Break block
world.afterEvents.playerBreakBlock.subscribe(({ player }) => {
    if (player) applyDurability(player);
});
//Hit entity
world.beforeEvents.worldInitialize.subscribe(initEvent => {
    initEvent.itemComponentRegistry.registerCustomComponent("bv:durability", {
        onHitEntity(entity) {
            const player = entity?.source;
            if (player) applyDurability(player);
        }
    });

});
//Use Item
world.afterEvents.itemUse.subscribe(event => {
    const cooldown_time = event.itemStack.getComponent("cooldown");
    if (cooldown_time > 0) {
        player.playSound("random.break");
        return;
    }
    const player = event.source; // Pega o jogador que usou o item.
    // Se há um jogador (garantia), aplica a durabilidade.
    if (player) applyDurability(player);
});