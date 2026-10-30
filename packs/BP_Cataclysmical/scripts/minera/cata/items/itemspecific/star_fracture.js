import { world, system } from "@minecraft/server";

const MaxMeter = 10;
function getMeter(player) {
    for (let i = MaxMeter; i >= 1; i--) {
        if (player.hasTag(`${"star_fracture_meter"}${i}`)) return i;
    }
    return 0;
}

function setMeter(player, value) {
    value = Math.max(0, Math.min(MaxMeter, value));
    for (let i = 1; i <= MaxMeter; i++) player.removeTag(`${"star_fracture_meter"}${i}`);
    if (value > 0) player.addTag(`${"star_fracture_meter"}${value}`);
}

function addMeter(player, amount) {
    const cooldown = player.getItemCooldown?.("star_fracture") ?? 0;
    if (amount > 0 && cooldown > 0) return;
    const oldMeter = getMeter(player);
    setMeter(player, oldMeter + amount);
}

function holdingStarFracture(player) {
    try {
        const inv = player.getComponent("inventory")?.container;
        if (!inv) return false;
        const slot = player.selectedSlotIndex;
        if (slot === undefined || slot === null) return false;
        const item = inv.getItem(slot);
        if (!item) return false;
        const itemId = item.id ?? item.typeId;
        return itemId === "mnra_cata:star_fracture";
    } catch {
        return false;
    }
}

const Damage = [
    "entityAttack",
    "entityExplosion",
    "maceSmash",
    "projectile",
    "ramAttack",
    "sonicBoom",
]

world.afterEvents.entityHurt.subscribe((ev) => {
    const victim = ev.hurtEntity;
    const cause = ev.damageSource?.cause
    const isValidDamage = Damage.includes(cause)

    if (victim?.typeId === "minecraft:player") {

        if (!isValidDamage) return
        addMeter(victim, -1);
    }
});


world.afterEvents.entityDie.subscribe((ev) => {
    const dead = ev.deadEntity;
    const killer = ev.damageSource?.damagingEntity;
    if (killer?.typeId === "minecraft:player" && dead.typeId !== "minecraft:player") {
        addMeter(killer, 2);
    }
    if (dead.typeId === "minecraft:player") {
        addMeter(dead, -5);
    }
});

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (holdingStarFracture(player)) {
            addMeter(player, 1);
        } else {
            addMeter(player, -1);
        }
    }
}, 80);

world.afterEvents.itemUse.subscribe((ev) => {
    const player = ev.source;
    if (!player || player.typeId !== "minecraft:player") return;

    const inv = player.getComponent("inventory")?.container;
    const slot = player.selectedSlotIndex;
    const item = inv?.getItem(slot);
    const itemId = item?.id ?? item?.typeId;

    if (itemId !== "mnra_cata:star_fracture") return;
    if (getMeter(player) < MaxMeter) return;
    if (player.getItemCooldown("star_fracture") > 0) return;

    player.addTag("star_fracture_active");
    setMeter(player, 0);
    player.startItemCooldown("star_fracture", 300);
    player.runCommand("playsound sound.nebulous_greatsword_song @a[r=32] ~ ~ ~ 1 1 1");
    player.runCommand("/camerashake add @p 0.3 1 positional");
    player.runCommand("particle mnra_cata:star_fracture_activate ~ ~ ~");
    player.runCommand("/camerashake add @p 0.3 1 rotational");

    system.runTimeout(() => {
        player.removeTag("star_fracture_active");
    }, 200);
});
