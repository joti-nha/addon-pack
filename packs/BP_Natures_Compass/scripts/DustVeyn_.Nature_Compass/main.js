import * as MC from '@minecraft/server'
import * as UI from "@minecraft/server-ui";

// ===== [Addon Pack] Nomes legiveis de biomas =====
// Tabela id -> [en_US, pt_BR]. Os textos exibidos vem do idioma do jogador via chaves "unified.biome.*"
// (pack Unified Core RP); ids fora da tabela usam um nome formatado, sem namespace.
const BIOME_NAMES = {"ocean":["Ocean","Oceano"],"deep_ocean":["Deep Ocean","Oceano profundo"],"warm_ocean":["Warm Ocean","Oceano quente"],"lukewarm_ocean":["Lukewarm Ocean","Oceano morno"],"deep_lukewarm_ocean":["Deep Lukewarm Ocean","Oceano morno profundo"],"cold_ocean":["Cold Ocean","Oceano frio"],"deep_cold_ocean":["Deep Cold Ocean","Oceano frio profundo"],"frozen_ocean":["Frozen Ocean","Oceano congelado"],"deep_frozen_ocean":["Deep Frozen Ocean","Oceano congelado profundo"],"legacy_frozen_ocean":["Frozen Ocean (Legacy)","Oceano congelado (antigo)"],"plains":["Plains","Planície"],"sunflower_plains":["Sunflower Plains","Planície de girassóis"],"desert":["Desert","Deserto"],"extreme_hills":["Windswept Hills","Colinas ventosas"],"extreme_hills_mutated":["Windswept Gravelly Hills","Colinas ventosas de cascalho"],"extreme_hills_edge":["Windswept Hills Edge","Borda das colinas ventosas"],"extreme_hills_plus_trees":["Windswept Forest","Floresta ventosa"],"extreme_hills_plus_trees_mutated":["Windswept Forest (Variant)","Floresta ventosa (variante)"],"forest":["Forest","Floresta"],"forest_hills":["Forest Hills","Colinas florestais"],"flower_forest":["Flower Forest","Floresta florida"],"birch_forest":["Birch Forest","Floresta de bétulas"],"birch_forest_hills":["Birch Forest Hills","Colinas de bétulas"],"birch_forest_mutated":["Old Growth Birch Forest","Floresta de bétulas antigas"],"birch_forest_hills_mutated":["Old Growth Birch Forest Hills","Colinas de bétulas antigas"],"roofed_forest":["Dark Forest","Floresta sombria"],"roofed_forest_mutated":["Dark Forest Hills","Colinas da floresta sombria"],"taiga":["Taiga","Taiga"],"taiga_hills":["Taiga Hills","Colinas da taiga"],"taiga_mutated":["Taiga Mountains","Montanhas da taiga"],"cold_taiga":["Snowy Taiga","Taiga nevada"],"cold_taiga_hills":["Snowy Taiga Hills","Colinas da taiga nevada"],"cold_taiga_mutated":["Snowy Taiga Mountains","Montanhas da taiga nevada"],"mega_taiga":["Old Growth Pine Taiga","Taiga de pinheiros antigos"],"mega_taiga_hills":["Old Growth Pine Taiga Hills","Colinas da taiga de pinheiros antigos"],"redwood_taiga_mutated":["Old Growth Spruce Taiga","Taiga de abetos antigos"],"redwood_taiga_hills_mutated":["Old Growth Spruce Taiga Hills","Colinas da taiga de abetos antigos"],"swampland":["Swamp","Pântano"],"swampland_mutated":["Swamp Hills","Colinas do pântano"],"mangrove_swamp":["Mangrove Swamp","Pântano de mangue"],"jungle":["Jungle","Selva"],"jungle_hills":["Jungle Hills","Colinas da selva"],"jungle_mutated":["Modified Jungle","Selva modificada"],"jungle_edge":["Sparse Jungle","Selva esparsa"],"jungle_edge_mutated":["Modified Jungle Edge","Borda da selva modificada"],"bamboo_jungle":["Bamboo Jungle","Selva de bambu"],"bamboo_jungle_hills":["Bamboo Jungle Hills","Colinas da selva de bambu"],"savanna":["Savanna","Savana"],"savanna_mutated":["Windswept Savanna","Savana ventosa"],"savanna_plateau":["Savanna Plateau","Platô da savana"],"savanna_plateau_mutated":["Windswept Savanna Plateau","Platô da savana ventosa"],"mesa":["Badlands","Terras áridas"],"mesa_bryce":["Eroded Badlands","Terras áridas erodidas"],"mesa_plateau":["Wooded Badlands","Terras áridas arborizadas"],"mesa_plateau_stone":["Wooded Badlands Plateau","Platô de terras áridas arborizadas"],"mesa_plateau_mutated":["Modified Wooded Badlands","Terras áridas arborizadas modificadas"],"mesa_plateau_stone_mutated":["Modified Wooded Badlands Plateau","Platô de terras áridas modificado"],"ice_plains":["Snowy Plains","Planície nevada"],"ice_plains_spikes":["Ice Spikes","Espinhos de gelo"],"ice_mountains":["Snowy Mountains","Montanhas nevadas"],"river":["River","Rio"],"frozen_river":["Frozen River","Rio congelado"],"beach":["Beach","Praia"],"cold_beach":["Snowy Beach","Praia nevada"],"stone_beach":["Stony Shore","Costa rochosa"],"mushroom_island":["Mushroom Fields","Campos de cogumelos"],"mushroom_island_shore":["Mushroom Fields Shore","Costa dos campos de cogumelos"],"hell":["Nether Wastes","Ermos do Nether"],"soulsand_valley":["Soul Sand Valley","Vale de areia das almas"],"crimson_forest":["Crimson Forest","Floresta carmesim"],"warped_forest":["Warped Forest","Floresta distorcida"],"basalt_deltas":["Basalt Deltas","Deltas de basalto"],"the_end":["The End","O End"],"meadow":["Meadow","Prado"],"grove":["Grove","Bosque nevado"],"snowy_slopes":["Snowy Slopes","Encostas nevadas"],"jagged_peaks":["Jagged Peaks","Picos irregulares"],"frozen_peaks":["Frozen Peaks","Picos congelados"],"stony_peaks":["Stony Peaks","Picos rochosos"],"lush_caves":["Lush Caves","Cavernas exuberantes"],"dripstone_caves":["Dripstone Caves","Cavernas de espeleotemas"],"deep_dark":["Deep Dark","Escuridão profunda"],"cherry_grove":["Cherry Grove","Bosque de cerejeiras"],"pale_garden":["Pale Garden","Jardim pálido"],"ntk:mossy_forest":["Mossy Forest","Floresta musgosa"],"ntk:corrupted_forest":["Corrupted Forest","Floresta corrompida"],"ntk:overgrown_jungle":["Overgrown Jungle","Selva tomada pela vegetação"]};
const DP_BIOME = "unified:nc_biome";
function shortId(id) { return id.replace("minecraft:", ""); }
function prettyId(id) {
    return id.replace(/^[a-z0-9_.-]+:/, "").split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
function biomeLabel(id) {
    const k = shortId(id);
    return BIOME_NAMES[k] ? { translate: "unified.biome." + k.replace(":", ".") } : { text: prettyId(id) };
}
function plainName(id) {
    const n = BIOME_NAMES[shortId(id)];
    return n ? n[0] : prettyId(id);
}
function fold(s) {
    return s.toLowerCase().replace(/[áàâãä]/g, "a").replace(/[éèêë]/g, "e").replace(/[íìîï]/g, "i")
        .replace(/[óòôõö]/g, "o").replace(/[úùûü]/g, "u").replace(/ç/g, "c");
}
function biomeSearchText(id) {
    const n = BIOME_NAMES[shortId(id)] || [];
    return fold([shortId(id).replace(/_/g, " "), prettyId(id), ...n].join(" | "));
}
function applyCompassTarget(item, id, x, y, z) {
    let hasProp = true;
    try { item.setDynamicProperty(DP_BIOME, id); } catch (e) { hasProp = false; }
    const rest = [`§8X: ${x}`, `§8Y: ${y}`, `§8Z: ${z}`];
    try {
        item.setLore([hasProp ? { rawtext: [{ text: "§7Biome: " }, biomeLabel(id)] } : `§7Biome: ${id}`, ...rest]);
    } catch (e) {
        item.setLore([`§7Biome: ${hasProp ? plainName(id) : id}`, ...rest]);
    }
}
// ===== fim =====
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
    if (!lore || lore.length < 4) return null;
    let biome;
    try { biome = item.getDynamicProperty(DP_BIOME); } catch (e) { }
    if (typeof biome !== "string") biome = lore[0].replace("§7Biome: ", "");
    const x = Number(lore[1].replace("§8X: ", ""));
    const y = Number(lore[2].replace("§8Y: ", ""));
    const z = Number(lore[3].replace("§8Z: ", ""));
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
    return { biome, x, y, z };
}
async function openSelector(player, item, search = "") {
    if (player instanceof MC.Player) {
        const biomeList = MC.BiomeTypes.getAll().map(b => b.id).sort((a, b) => {
            const x = fold(plainName(a)), y = fold(plainName(b));
            return x < y ? -1 : x > y ? 1 : 0;
        });
        const form = new UI.ActionFormData()
            .title("%dustveyn.nature_compass.select_biome.desc")
            .body("%dustveyn.nature_compass.choose_a_biome.desc");
        form.button("%dustveyn.nature_compass.search.info", "textures/DustVeyn_.Nature_Compass/ui/search")
        if (player.getGameMode() == MC.GameMode.Creative) {
            form.button("%dustveyn.nature_compass.teleport.desc", "textures/items/ender_pearl")
        }
        const needle = fold(search);
        const filteredBiomes = biomeList.filter(b => biomeSearchText(b).includes(needle));
        for (const biome of filteredBiomes) {
            form.button(biomeLabel(biome));
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
            applyCompassTarget(item, selected, Math.round(found.x), Math.round(found.y), Math.round(found.z));
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
        if (!item || !item.typeId.startsWith("dustveyn.nature_compass:compass_")) continue
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
        player.onScreenDisplay.setActionBar({ rawtext: [{ text: "§e" }, biomeLabel(data.biome), { text: ` §7| §a${(distance - 0.25).toFixed(0)}m` }] });
        if (newFrame !== currentFrame) {
            const newItem = new MC.ItemStack(`dustveyn.nature_compass:compass_${newFrame}`, 1);
            applyCompassTarget(newItem, data.biome, data.x, data.y, data.z);
            equippable.setEquipment(MC.EquipmentSlot.Mainhand, newItem);
        }
    }
}, 2);