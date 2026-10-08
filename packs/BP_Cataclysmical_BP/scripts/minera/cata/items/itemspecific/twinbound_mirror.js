import { world, system, ItemStack } from "@minecraft/server";

const XP = 5;
const Mirror = "TwinBound Mirror";

const Dimensions = {
    "minecraft:overworld": "Overworld",
    "minecraft:nether": "Nether",
    "minecraft:the_end": "End"
};

function parseLocation(nameTag) {
    const match = nameTag?.match(/\((.+?): (-?\d+), (-?\d+), (-?\d+)\)$/);
    if (!match) return null;
    const [, dimName, x, y, z] = match;
    const dimensionId = Object.keys(Dimensions).find(id => Dimensions[id] === dimName) || dimName;

    return { dimensionId, dimName, x: Number(x), y: Number(y), z: Number(z) };
}

world.afterEvents.itemUse.subscribe((ev) => {
    const player = ev.source;
    const item = ev.itemStack;

    if (!player || !item || item.typeId !== "mnra_cata:twinbound_mirror") return;
    const handIndex = player.selectedSlotIndex;
    const inv = player.getComponent("inventory").container;

    const currentDim = player.dimension;
    const dimName = Dimensions[currentDim.id] || currentDim.id;
    const pos = player.location;

    if (player.isSneaking) {
        if (player.level < XP) {
            player.onScreenDisplay.setActionBar("§cNot enough levels");
            return;
        }

        let currentName = item.nameTag && item.nameTag.length > 0 ? item.nameTag : Mirror;
        currentName = currentName.replace(/ §r§b\(.+?: -?\d+, -?\d+, -?\d+\)$/, "");

        const newNameTag = `§r§e${currentName} §r§b(${dimName}: ${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)})`;
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

    if (!player.isSneaking && !player.getItemCooldown('twinbound_mirror')) {
        const stored = parseLocation(item.nameTag);
        if (!stored) {
            player.onScreenDisplay.setActionBar("§cMirror has no bound location");
            return;
        }

        if (player.level < XP) {
            player.onScreenDisplay.setActionBar("§cNot enough levels");
            return;
        }

        const teleportDim = world.getDimension(stored.dimensionId);
        if (!teleportDim) {
            player.onScreenDisplay.setActionBar("§cYou cannot teleport between dimensions");
            return;
        }
        const newStoredPos = {
            dimName: dimName,
            x: Math.floor(player.location.x),
            y: Math.floor(player.location.y),
            z: Math.floor(player.location.z)
        };

        player.teleport(
            { x: stored.x + 0.5, y: stored.y, z: stored.z + 0.5 },
            { dimension: teleportDim, keepVelocity: false }
        );
        player.startItemCooldown('twinbound_mirror', 300)
        player.onScreenDisplay.setActionBar(`§eMirror is now Bound to: §b${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)}`);

        const updatedNameTag =
            `§r§e${Mirror} §r§b(${newStoredPos.dimName}: ${newStoredPos.x}, ${newStoredPos.y}, ${newStoredPos.z})`;

        const newItem = new ItemStack(item.typeId, item.amount);
        newItem.nameTag = updatedNameTag;
        inv.setItem(handIndex, newItem);

        system.waitTicks(3).then(() => {
            player.playSound('respawn_anchor.deplete', { pitch: 1, location: player.location, volume: 1 })
        });

        player.runCommand(`xp -${XP}L @s`);
    }
});