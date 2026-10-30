import { EquipmentSlot, world } from "@minecraft/server";

export function DisablePlayerShield(ev) {
    const player = ev.hurtEntity;
    const mob = ev.damageSource.damagingEntity;

    if (!player || player.typeId !== "minecraft:player") return false;
    if (!mob) return false;

    const eq = player.getComponent("minecraft:equippable");
    if (!eq) return false;

    const main = eq.getEquipment(EquipmentSlot.Mainhand);
    const off = eq.getEquipment(EquipmentSlot.Offhand);

    const hasShield =
        main?.typeId === "minecraft:shield" ||
        off?.typeId === "minecraft:shield";

    if (!hasShield) return false;

    if (!player.getItemCooldown('shield')) {
        player.startItemCooldown('shield', 150)
        player.runCommand("playsound random.break @a[r=12] ^^1^2 2 1 1")
    }
    return true;
}
