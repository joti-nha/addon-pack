// Addon Pack - Unified Core: TABELA DE NIVEIS (editavel).
// Regra: uma picareta so quebra um minerio se NIVEL_DA_FERRAMENTA >= NIVEL_DO_MINERIO.
// Escada (menor -> maior):
//  1 madeira/ouro | 2 pedra, cobre, estanho, zinco, bronze, laton | 3 ferro, quitina, mumia, olivina, ametista(BoB), afiada(Dungeons)
//  4 diamante, netunio, titanio | 5 netherite, enderite(BoB), criorita | 6 verdita | 7 nocturita | 8 piro/sunflare
//  9 aetherium | 10 corruptium | 11 runebreaker | 12 Eternal End (maior nivel) | 99 Stardust (quebra qualquer bloco)
export const QUEBRA_TUDO = 99;

// Ferramentas: chave = id completo OU material (parte do id antes de "_pickaxe"), sem namespace.
export const FERRAMENTAS = {
  // vanilla
  "minecraft:wooden_pickaxe": 1, "minecraft:golden_pickaxe": 1, "minecraft:stone_pickaxe": 2,
  "minecraft:copper_pickaxe": 2, "minecraft:iron_pickaxe": 3, "minecraft:diamond_pickaxe": 4,
  "minecraft:netherite_pickaxe": 5,
  // Nether's ... (ntk)
  "ntk:tin_pickaxe": 2, "ntk:zinc_pickaxe": 2, "ntk:bronze_pickaxe": 2, "ntk:brass_pickaxe": 2, "ntk:olivine_pickaxe": 3,
  // Eternal Caves
  "panascais_caves:chitin_pickaxe": 3, "panascais_caves:mummy_pickaxe": 3,
  "panascais_caves:titanium_pickaxe": 4, "panascais_caves:cryorite_pickaxe": 5, "panascais_caves:verdite_pickaxe": 6,
  "panascais_caves:nocturite_pickaxe": 7, "panascais_caves:pyronite_pickaxe": 8, "panascais_caves:aetherium_pickaxe": 9,
  "panascais_caves:corruptium_pickaxe": 10, "panascais_caves:runebreaker": 11,
  // Eternal End: maiores niveis
  "panascais_end:enderite_pickaxe": 12, "panascais_end:ametrine_pickaxe": 12,
  // Better on Bedrock
  "better_on_bedrock:amethyst_pickaxe": 3, "better_on_bedrock:enderite_pickaxe": 5, "better_on_bedrock:stardust_pickaxe": QUEBRA_TUDO,
  // Outros
  "mnra_cata:sunflare_pickaxe": 8, "tm_aqc:neptunium_pickaxe": 4,
  "dungeons:sharpened_pickaxe": 3, "dungeons:sharpened_diamond_pickaxe": 4,
};

// Picareta desconhecida (de outro addon): nivel pela durabilidade maxima.
export const POR_DURABILIDADE = [[130, 1], [300, 2], [800, 3], [1700, 4], [2700, 5], [3300, 6], [3600, 7], [4100, 8], [99999, 9]];

// Minerios: id -> nivel necessario. "deepslate_" e tratado igual ao minerio base quando nao listado.
export const MINERIOS = {
  // vanilla
  "minecraft:coal_ore": 1, "minecraft:quartz_ore": 1, "minecraft:nether_gold_ore": 1,
  "minecraft:copper_ore": 2, "minecraft:iron_ore": 2, "minecraft:lapis_ore": 2,
  "minecraft:gold_ore": 3, "minecraft:redstone_ore": 3, "minecraft:lit_redstone_ore": 3, "minecraft:diamond_ore": 3, "minecraft:emerald_ore": 3,
  "minecraft:lit_deepslate_redstone_ore": 3,
  "minecraft:ancient_debris": 4, "minecraft:obsidian": 4, "minecraft:crying_obsidian": 4,
  // Better on Bedrock
  "better_on_bedrock:tin_ore": 2, "better_on_bedrock:alluminum_ore": 2, "better_on_bedrock:ender_ore": 3,
  "better_on_bedrock:corstinite_ore": 4, "better_on_bedrock:stardust_ore": 4, "better_on_bedrock:deepslate_stardust_ore": 4,
  // ntk
  "ntk:tin_ore": 2, "ntk:zinc_ore": 2, "ntk:deepslate_tin_ore": 2, "ntk:deepslate_zinc_ore": 2,
  "ntk:prismarine_ore": 2, "ntk:deepslate_prismarine_ore": 2, "ntk:netherrack_olivine_ore": 2, "ntk:heated_netherrack_olivine_ore": 2,
  "ntk:netherrack_diamond_ore": 3, "ntk:soul_sand_echo_shard_ore": 2,
  // Cataclysmical
  "mnra_cata:platinum_ore": 4, "mnra_cata:deepslate_platinum_ore": 4, "mnra_cata:floret_ore": 4,
  "mnra_cata:solar_ore": 5, "mnra_cata:astral_ore": 5, "mnra_cata:lunar_ore": 5,
  "mnra_cata:twilight_ore": 6, "mnra_cata:exodius_ore": 6,
  // blocos que antes so davam drop com a picareta Sunflare/diamante (ferramentas/drops_picaretas.py liberou o drop)
  "mnra_cata:abyssal_stone": 8, "mnra_cata:abyssal_stone_brick": 8, "mnra_cata:polished_abyssal_stone": 8, "mnra_cata:ecliptic_block": 8,
  "mnra_cata:mourning_stone": 4, "mnra_cata:polished_mourning_stone": 4,
  // RPG Addon
  "test:vibranium_ore": 7,
  // Eternal Caves (escada propria: cada minerio exige a picareta do anterior)
  "panascais_caves:salt_ore": 2, "panascais_caves:deepslate_salt_ore": 2,
  "panascais_caves:cinnabar_crystal": 2, "panascais_caves:sulfur_crystal": 2,
  "panascais_caves:titanium_ore": 4, "panascais_caves:ruby_ore": 4, "panascais_caves:sapphire_ore": 4, "panascais_caves:onyx_ore": 4,
  "panascais_caves:crystal_opal_ore": 4, "panascais_caves:sphalerite_ore": 4, "panascais_caves:cryorite_ore": 4,
  "panascais_caves:verdite_ore": 5, "panascais_caves:nocturite_ore": 6, "panascais_caves:pyronite_ore": 7,
  "panascais_caves:aetherium_ore": 8, "panascais_caves:corruptium_ore": 9,
  // Eternal End
  "panascais_end:end_stone_quartz_ore": 1, "panascais_end:purpurite_ore": 1, "panascais_end:dark_purpurite_ore": 1, "panascais_end:viridian_ore": 1,
  "panascais_end:end_stone_copper_ore": 2, "panascais_end:end_stone_iron_ore": 2, "panascais_end:end_stone_lapis_ore": 2,
  "panascais_end:end_stone_gold_ore": 3, "panascais_end:end_stone_diamond_ore": 3, "panascais_end:end_stone_emerald_ore": 3,
  "panascais_end:end_stone_redstone_ore": 3, "panascais_end:ametrine_ore": 3,
  "panascais_end:eternal_debris": 12,
};

// Nomes de nivel para a mensagem
export const NOME_NIVEL = { 1: "madeira/ouro", 2: "pedra", 3: "ferro", 4: "diamante", 5: "netherite/criorita", 6: "verdita", 7: "nocturita",
  8: "pironita/sunflare", 9: "aetherium", 10: "corruptium", 11: "runebreaker", 12: "Eternal End" };
