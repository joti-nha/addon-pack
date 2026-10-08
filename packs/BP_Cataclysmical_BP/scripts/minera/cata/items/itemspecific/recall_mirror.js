import { world, system, ItemStack } from "@minecraft/server";

const XP = 1;
const Mirror = "Recall Mirror";

const Dimensions = {
    "minecraft:overworld": "Overworld",
    "minecraft:nether": "Nether",
    "minecraft:the_end": "End"
};

world.afterEvents.itemUse.subscribe((ev) => {
    const player = ev.source;
    const item = ev.itemStack;

    if (!player || !item || item.typeId !== "mnra_cata:recall_mirror") return;

    if (player.isSneaking) {
        player.onScreenDisplay.setActionBar("§cThis mirror cannot be bound");
        return;
    }

    if (player.getItemCooldown("recall_mirror")) return;

    const spawn = player.getSpawnPoint();
    const inv = player.getComponent("inventory").container;
    const slot = player.selectedSlotIndex;

    if (!spawn) {
        if (item.nameTag) {
            const cleanItem = new ItemStack(item.typeId, item.amount);
            cleanItem.nameTag = `§r§e${Mirror}`;

            const durability = item.getComponent("durability");
            if (durability) {
                cleanItem.getComponent("durability").damage = durability.damage;
            }

            inv.setItem(slot, cleanItem);
        }

        player.onScreenDisplay.setActionBar("§cYou have no spawn point");
        return;
    }

    if (player.level < XP) {
        player.onScreenDisplay.setActionBar("§cNot enough levels");
        return;
    }

    if (spawn.dimension.id !== player.dimension.id) {
        player.onScreenDisplay.setActionBar("§cYou cannot teleport between dimensions");
        return;
    }

    const dimName = Dimensions[spawn.dimension.id] || spawn.dimension.id;

    const newNameTag =
        `§r${Mirror} §r§b(${dimName}: ${Math.floor(spawn.x)}, ${Math.floor(spawn.y)}, ${Math.floor(spawn.z)})`;

    if (item.nameTag !== newNameTag) {
        const newItem = new ItemStack(item.typeId, item.amount);
        newItem.nameTag = newNameTag;

        const durability = item.getComponent("durability");
        if (durability) {
            newItem.getComponent("durability").damage = durability.damage;
        }

        inv.setItem(slot, newItem);
    }

    player.teleport(
        {
            x: spawn.x + 0.5,
            y: spawn.y,
            z: spawn.z + 0.5
        },
        {
            dimension: spawn.dimension,
            keepVelocity: false
        }
    );

    player.startItemCooldown("recall_mirror", 300);

    system.waitTicks(3).then(() => {
        player.runCommand("playsound mob.endermen.portal @s ~ ~ ~ 2 0.9 1");
    });

    player.runCommand(`xp -${XP}L @s`);
});

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const invComp = player.getComponent("inventory");
        if (!invComp) continue;

        const inv = invComp.container;
        const spawn = player.getSpawnPoint();

        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (!item || item.typeId !== "mnra_cata:recall_mirror") continue;

            if (!spawn) {
                if (item.nameTag !== `§r${Mirror}`) {
                    const cleanItem = new ItemStack(item.typeId, item.amount);
                    cleanItem.nameTag = `§r${Mirror}`;

                    const durability = item.getComponent("durability");
                    if (durability) {
                        cleanItem.getComponent("durability").damage = durability.damage;
                    }

                    inv.setItem(i, cleanItem);
                }
                continue;
            }

            const dimName = Dimensions[spawn.dimension.id] || spawn.dimension.id;
            const correctNameTag =
                `§r${Mirror} §r§b(${dimName}: ${Math.floor(spawn.x)}, ${Math.floor(spawn.y)}, ${Math.floor(spawn.z)})`;

            if (item.nameTag !== correctNameTag) {
                const newItem = new ItemStack(item.typeId, item.amount);
                newItem.nameTag = correctNameTag;

                const durability = item.getComponent("durability");
                if (durability) {
                    newItem.getComponent("durability").damage = durability.damage;
                }

                inv.setItem(i, newItem);
            }
        }
    }
}, 35);











//"mnra_cata:warped_mirror": ["", "§r§7On Right Click:", "§r§8 Bound the mirror to a location, crouch", "§r§8 to telport to that location.", "", "§r§7Requires 3+ levels"],
//newItem.nameTag = `§r§7${baseName} §r§b(${dimName}: ${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)})`;