import { world, system, ItemStack } from "@minecraft/server";

const XP = 3;
const Mirror = "Starbound Mirror";

const Dimensions = {
    "minecraft:overworld": "Overworld",
    "minecraft:nether": "Nether",
    "minecraft:the_end": "End"
};

world.afterEvents.itemUse.subscribe((ev) => {
    const player = ev.source;
    const item = ev.itemStack;

    if (!player || !item || item.typeId !== "mnra_cata:starbound_mirror") return;

    const handIndex = player.selectedSlotIndex;
    const inv = player.getComponent("inventory").container;
    const pos = player.location;

    const currentDim = player.dimension;
    const dimName = Dimensions[currentDim.id] || currentDim.id;

    if (player.isSneaking) {
        if (player.level < XP) {
            player.onScreenDisplay.setActionBar("§cNot enough levels");
            return;
        }

        let currentName = item.nameTag && item.nameTag.length > 0 ? item.nameTag : Mirror;
        currentName = currentName.replace(/ §r§b\(.+?: -?\d+, -?\d+, -?\d+\)$/, "");

        const newNameTag =
            `§r§e${currentName} §r§b(${dimName}: ${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)})`;

        const newItem = new ItemStack(item.typeId, item.amount);
        newItem.nameTag = newNameTag;

        const durability = item.getComponent("durability");
        if (durability) newItem.getComponent("durability").damage = durability.damage;

        inv.setItem(handIndex, newItem);

        player.playSound('lodestone_compass.link_compass_to_lodestone', { pitch: 1, location: player.location, volume: 1 })
        player.onScreenDisplay.setActionBar(
            `§aMirror bound to: §b(${dimName}: ${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)})`
        );
        return;
    }

    if (!player.isSneaking && !player.getItemCooldown('starbound_mirror')) {
        const nameTag = item.nameTag;
        if (!nameTag) {
            player.onScreenDisplay.setActionBar("§cMirror has no bound location");
            return;
        }

        const match = nameTag.match(/\((.+?): (-?\d+), (-?\d+), (-?\d+)\)$/);
        if (!match) {
            player.onScreenDisplay.setActionBar("§cMirror has no bound location");
            return;
        }

        const [, savedDimName, x, y, z] = match;
        const savedDimId = Object.keys(Dimensions)
            .find(id => Dimensions[id] === savedDimName);

        if (!savedDimId) {
            player.onScreenDisplay.setActionBar("§cYou cannot teleport between dimensions");
            return;
        }
        if (savedDimId !== currentDim.id) {
            player.onScreenDisplay.setActionBar("§cYou cannot teleport between dimensions");
            return;
        }
        const teleportDim = world.getDimension(savedDimId);

        if (player.level < XP) {
            player.onScreenDisplay.setActionBar("§cNot enough levels");
            return;
        }

        player.teleport(
            { x: parseInt(x) + 0.5, y: parseInt(y), z: parseInt(z) + 0.5 },
            { dimension: teleportDim, keepVelocity: false }
        );

        player.startItemCooldown('starbound_mirror', 300)
        system.waitTicks(3).then(() => {
            player.runCommand("playsound mob.endermen.portal @s ~ ~ ~ 2 0.9 1");
            player.runCommand("particle mnra_cata:stellar_greatsword_star_crit ~ ~ ~");
            player.runCommand("particle mnra_cata:stellar_greatsword_crit ~ ~ ~");
        });

        player.runCommand(`xp -${XP}L @s`);
    }
});











//"mnra_cata:warped_mirror": ["", "§r§7On Right Click:", "§r§8 Bound the mirror to a location, crouch", "§r§8 to telport to that location.", "", "§r§7Requires 3+ levels"],
//newItem.nameTag = `§r§7${baseName} §r§b(${dimName}: ${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)})`;