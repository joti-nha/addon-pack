import * as MC from '@minecraft/server'
import * as UI from "@minecraft/server-ui";

function formatId(id) {
    return id.replace("minecraft:", "").split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
function angleToFrame(angle) {
    const normalized = (angle + 360) % 360;
    const segment = 360 / 32;
    return Math.floor(normalized / segment) % 32;
}
function getAngle(player, targetX, targetZ) {
    const dx = targetX - player.location.x;
    const dz = targetZ - player.location.z;
    const angleRad = Math.atan2(dx, -dz);
    const angleDeg = angleRad * (180 / Math.PI);
    return angleDeg - player.getRotation().y;
}
function getCompassData(item) {
    const lore = item.getLore();
    if (!lore || lore.length < 3) return null;
    const biome = lore[0].replace("§7Biome: ", "");
    const x = Number(lore[1].replace("§8X: ", ""));
    const y = Number(lore[2].replace("§8Y: ", ""));
    const z = Number(lore[3].replace("§8Z: ", ""));
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
    return { biome, x, y, z };
}
async function openSelector(player, item, search = "") {
    if (player instanceof MC.Player) {
        const biomeList = MC.BiomeTypes.getAll().map(b => b.id).sort();
        const form = new UI.ActionFormData()
            .title("%dustveyn.nature_compass.select_biome.desc")
            .body("%dustveyn.nature_compass.choose_a_biome.desc");
        form.button("%dustveyn.nature_compass.search.info", "textures/DustVeyn_.Nature_Compass/ui/search")
        if (player.getGameMode() == MC.GameMode.Creative) {
            form.button("%dustveyn.nature_compass.teleport.desc", "textures/items/ender_pearl")
        }
        const filteredBiomes = biomeList.filter(b =>
            formatId(b).toLowerCase().includes(search.toLowerCase())
        );
        for (const biome of filteredBiomes) {
            form.button(formatId(biome));
        }
        const res = await form.show(player);
        if (res.canceled) return;
        if (res.selection == 0) {
            new UI.ModalFormData()
                .title("%dustveyn.nature_compass.search.info")
                .textField("%dustveyn.nature_compass.biome_name.desc", "")
                .show(player)
                .then(r => {
                    if (r.canceled) return
                    let search = r.formValues[0] || ""
                    openSelector(player, item, search)
                })
        } else if (res.selection == 1 && player.getGameMode() == MC.GameMode.Creative) {
            const data = getCompassData(item)
            if (!data) return
            player.teleport({ x: data.x, y: data.y, z: data.z }, {
                dimension: player.dimension
            })
        } else {
            const selected = filteredBiomes[res.selection - (player.getGameMode() == MC.GameMode.Creative ? 2 : 1)];
            if (!selected) return

            const found = player.dimension.calculateClosestBiomeFromSeed(player.location, MC.BiomeTypes.get(`${selected}`));
            if (!found) return player.sendMessage("§4%dustveyn.nature_compass.biome_not_found.desc")
            item.setLore([`§7Biome: ${selected}`, `§8X: ${Math.round(found.x)}`, `§8Y: ${Math.round(found.y)}`, `§8Z: ${Math.round(found.z)}`]);
            player.getComponent(MC.EntityComponentTypes.Equippable).setEquipment(MC.EquipmentSlot.Mainhand, item);
        }
    }
}
MC.world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }) => {
    if (!item || !item.typeId.startsWith("dustveyn.nature_compass:compass_")) return;
    openSelector(player, item);
});
MC.system.runInterval(() => {
    for (const player of MC.world.getAllPlayers()) {
        const equippable = player.getComponent(MC.EntityComponentTypes.Equippable);
        const item = equippable.getEquipment(MC.EquipmentSlot.Mainhand);
        if (!item || !item.typeId.startsWith("dustveyn.nature_compass:compass_")) return
        const data = getCompassData(item);
        if (!data) continue;
        const px = player.location.x;
        const py = player.location.y;
        const pz = player.location.z;
        const dx = data.x - px;
        const dy = data.y - py;
        const dz = data.z - pz;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (player.dimension.getBiome(player.location).id == data.biome) {
            equippable.setEquipment(MC.EquipmentSlot.Mainhand, new MC.ItemStack("dustveyn.nature_compass:compass_0"));
            player.sendMessage("§a%dustveyn.nature_compass.biome_found.desc")
            continue;
        }
        const angle = getAngle(player, data.x, data.z);
        const newFrame = angleToFrame(angle);
        const currentFrame = parseInt(item.typeId.replace("dustveyn.nature_compass:compass_", ""));
        player.onScreenDisplay.setActionBar(`§e${formatId(data.biome)} §7| §a${(distance - 0.25).toFixed(0)}m`);
        if (newFrame !== currentFrame) {
            const newItem = new MC.ItemStack(`dustveyn.nature_compass:compass_${newFrame}`, 1);
            newItem.setLore(item.getLore());
            equippable.setEquipment(MC.EquipmentSlot.Mainhand, newItem);
        }
    }
}, 2);