export const GUNS_LIST =
  [
    "rev:shadow_musket",
    "rev:shadow_flintlock",
    "rev:shadow_shotgun_normal",
    "rev:shadow_shotgun_s",
    "rev:shadow_hand_mortar",
    "rev:shadow_hunting_musket",
    "rev:shadow_auto_gun",
    "rev:shadow_mauler",
    "rev:shadow_despoiler"
  ]

export const forbiddenTags = [
  "minecraft:is_armor",
  "minecraft:is_food",
  "minecraft:is_hoe",
  "minecraft:is_shovel",
  "minecraft:is_trident",
  "minecraft:is_minecart",
  "minecraft:is_shears",
  "minecraft:is_spear"
]

export const damageChainValues = [
  {
    id: "rev:flintlock_bullet",
    particle: "rev:hand_cannon",
    chain_damage: 9,
    piercing: false
  },
  {
    id: "rev:musket_bullet",
    particle: "rev:musket",
    chain_damage: 24,
    piercing: true
  },
  {
    id: "rev:shotgun_normal_bullet",
    particle: "rev:shotgun",
    chain_damage: 3,
    piercing: true
  },
  {
    id: "rev:shotgun_s_bullet",
    particle: "rev:s_shotgun",
    chain_damage: 3,
    piercing: true
  },
  {
    id: "rev:mortar_bullet",
    particle: "rev:mortar",
    chain_damage: 24,
    piercing: false
  }, {
    id: "rev:crooked_mortar_bullet",
    particle: "rev:crooked_mortar",
    chain_damage: 12,
    piercing: false
  },
  {
    id: "rev:auto_gun_bullet",
    particle: "rev:auto_gun",
    chain_damage: 4,
    piercing: true
  },
  {
    id: "rev:mauler_bullet",
    particle: "rev:mauler",
    chain_damage: 16,
    piercing: true
  },
  {
    id: "rev:musket_bullet_hunting",
    particle: "rev:musket_hunt",
    chain_damage: 32,
    piercing: true
  },
  {
    id: "rev:fake_arrow",
    particle: "rev:fake_arrow",
    chain_damage: 9,
    piercing: false
  },
  {
    id: "rev:despoiler_bullet",
    particle: "rev:despoiler",
    chain_damage: 10,
    piercing: false
  }
]

export const weaponStats = [{
  id: "rev:flintlock",
  projectile: "rev:flintlock_bullet",
  power: 7,
  bloom: 2,
  sound: "rev.flintlock_shot",
  damage: 1,
  burst_speed: 1,
  burst: 1,
  piercing: false,
  ammunition: "rev:flintlock_bullets",
  amount_needed: 1,
  shake: 0.4
}, {
  id: "rev:musket",
  projectile: "rev:musket_bullet",
  power: 7,
  bloom: 2,
  sound: "rev.musket_shot",
  damage: 1,
  burst_speed: 1,
  burst: 1,
  piercing: false,
  ammunition: "rev:musket_bullets",
  amount_needed: 1,
  shake: 0.7
}, {
  id: "rev:shotgun_normal",
  projectile: "rev:shotgun_normal_bullet",
  power: 7,
  bloom: 6,
  sound: "rev.shotgun_shot",
  damage: 1,
  burst_speed: 0,
  burst: 8,
  piercing: false,
  ammunition: "rev:shotgun_shells",
  amount_needed: 1,
  shake: 0.9
}, {
  id: "rev:shotgun_s",
  projectile: "rev:shotgun_s_bullet",
  power: 7,
  bloom: 16,
  sound: "rev.s_shotgun_shot",
  damage: 1,
  burst_speed: 0,
  burst: 16,
  piercing: false,
  ammunition: "rev:shotgun_shells",
  amount_needed: 2,
  shake: 1.3
}, {
  id: "rev:hunting_musket",
  projectile: "rev:musket_bullet_hunting",
  power: 7,
  bloom: 0,
  sound: "rev.musket_shot",
  damage: 1,
  burst_speed: 1,
  burst: 1,
  piercing: false,
  ammunition: "rev:musket_bullets",
  amount_needed: 1,
  shake: 0.7
}, {
  id: "rev:auto_gun",
  projectile: "rev:auto_gun_bullet",
  power: 7,
  bloom: 3,
  sound: "rev.auto_shot",
  damage: 1,
  burst_speed: 3,
  burst: 2,
  piercing: false,
  ammunition: "rev:flintlock_bullets",
  amount_needed: 1,
  shake: 0.3
}, {
  id: "rev:mauler",
  projectile: "rev:mauler_bullet",
  power: 7,
  bloom: 2,
  sound: "rev.mauler_shot",
  damage: 1,
  burst_speed: 0,
  burst: 0,
  piercing: false,
  ammunition: "rev:musket_bullets",
  amount_needed: 1,
  shake: 0.3
},{
  id: "rev:despoiler",
  projectile: "rev:despoiler_bullet",
  power: 7,
  bloom: 0.5,
  sound: "rev.despoiler_shot",
  damage: 1,
  burst_speed: 3,
  burst: 3,
  piercing: false,
  ammunition: "rev:musket_bullets",
  amount_needed: 1,
  shake: 0.7
}, {
  id: "rev:hand_mortar",
  projectile: "rev:mortar_bullet",
  power: 4,
  bloom: 1,
  sound: "rev.mortar_shot",
  damage: 1,
  burst_speed: 0,
  burst: 0,
  piercing: false,
  ammunition: "rev:mortar_bullet",
  amount_needed: 1,
  shake: 0.8
},{
  id: "rev:crooked_mortar",
  projectile: "rev:crooked_mortar_bullet",
  power: 3,
  bloom: 6,
  sound: "rev.crooked_mortar_shot",
  damage: 1,
  burst_speed: 0,
  burst: 6,
  piercing: false,
  ammunition: "rev:mortar_bullet",
  amount_needed: 1,
  shake: 1.3
},
{
  id: "rev:repeater_crossbow",
  projectile: "rev:fake_arrow",
  power: 5,
  bloom: 0.1,
  sound: "crossbow.shoot",
  damage: 1,
  burst_speed: 1,
  burst: 1,
  piercing: false,
  ammunition: "minecraft:arrow",
  amount_needed: 1,
  shake: 0.2
},
{
  id: "rev:repeater_crossbow_c_1",
  projectile: "rev:fake_arrow",
  power: 5,
  bloom: 0.1,
  sound: "crossbow.shoot",
  damage: 1,
  burst_speed: 3,
  burst: 2,
  piercing: false,
  ammunition: "minecraft:arrow",
  amount_needed: 2,
  shake: 0.3
},
{
  id: "rev:repeater_crossbow_c_2",
  projectile: "rev:fake_arrow",
  power: 5,
  bloom: 0.1,
  sound: "crossbow.shoot",
  damage: 1,
  burst_speed: 3,
  burst: 3,
  piercing: false,
  ammunition: "minecraft:arrow",
  amount_needed: 3,
  shake: 0.4
},
{
  id: "rev:repeater_crossbow_c_3",
  projectile: "rev:fake_arrow",
  power: 5,
  bloom: 0.1,
  sound: "crossbow.shoot",
  damage: 1,
  burst_speed: 3,
  burst: 4,
  piercing: false,
  ammunition: "rev:arrow",
  amount_needed: 4,
  shake: 0.5
}
];



export const ARROW_EFFECTS =
{
  6: ["night_vision", 22, 0], // Arrow of Night Vision
  7: ["night_vision", 60, 0], // Arrow of Night Vision (LONGG)
  8: ["invisibility", 22, 0], // Arrow of Invisibility
  9: ["invisibility", 60, 0], // Arrow of Invisibility (LONGG)
  10: ["jump_boost", 22, 0], // Arrow of Leaping
  11: ["jump_boost", 60, 0], // Arrow of Leaping (LONGG)
  12: ["jump_boost", 11, 1], // Arrow of Leaping (II)
  13: ["fire_resistance", 22, 0], // Arrow of Fire Resistance
  14: ["fire_resistance", 60, 0], // Arrow of Fire Resistance (LONGG)
  15: ["speed", 22, 0], // Arrow of Swiftness
  16: ["speed", 60, 0], // Arrow of Swiftness (LONGG)
  17: ["speed", 11, 1], // Arrow of Swiftness (II)
  18: ["slowness", 22, 0], // Arrow of Slowness
  19: ["slowness", 60, 0], // Arrow of Slowness (LONGG)
  20: ["water_breathing", 22, 0], // Arrow of Water Breathing
  21: ["water_breathing", 60, 0], // Arrow of Water Breathing (LONGG)
  22: ["instant_health", 1, 0], // Arrow of Healing
  23: ["instant_health", 1, 1], // Arrow of Healing (II)
  24: ["instant_damage", 1, 0], // Arrow of Harming
  25: ["instant_damage", 1, 1], // Arrow of Harming (II)
  26: ["poison", 5, 0], // Arrow of Poison
  27: ["poison", 15, 0], // Arrow of Poison (LONGG)
  28: ["poison", 5, 1], // Arrow of Poison (II)
  29: ["regeneration", 5, 0], // Arrow of Regeneration
  30: ["regeneration", 15, 0], // Arrow of Regeneration (LONGG)
  31: ["regeneration", 5, 1], // Arrow of Regeneration (II)
  32: ["strength", 22, 0], // Arrow of Strength
  33: ["strength", 60, 0], // Arrow of Strength (LONGG)
  34: ["strength", 11, 1], // Arrow of Strength (II)
  35: ["weakness", 22, 0],
  36: ["weakness", 60, 0],
  37: ["wither", 22, 0],
  38: ["resistance", 2, 2],
  39: ["resistance", 5, 2],
  40: ["resistance", 2, 4],
  41: ["slow_falling", 22, 0],
  42: ["slow_falling", 60, 0],
  43: ["slowness", 11, 1],
  44: ["wind_charged", 22, 0],
  45: ["weaving", 22, 0],
  46: ["oozing", 22, 0],
  47: ["infested", 22, 0]
}

export const DEFAULT_PARTICLE_COLORS = {
  "rev:flintlock_bullet": { red: 255, green: 100, blue: 0 },
  "rev:musket_bullet": { red: 200, green: 200, blue: 180 },
  "rev:shotgun_normal_bullet": { red: 150, green: 150, blue: 150 },
  "rev:shotgun_s_bullet": { red: 100, green: 100, blue: 255 },
  "rev:mauler_bullet": { red: 255, green: 255, blue: 0 },
  "rev:mortar_bullet": { red: 255, green: 0, blue: 0 },
  "rev:crooked_mortar_bullet": { red: 255, green: 0, blue: 0 },
  "rev:auto_gun_bullet": { red: 0, green: 255, blue: 255 },
  "rev:despoiler_bullet": { red: 255, green: 100, blue: 255 },
  "rev:musket_bullet_hunting": { red: 255, green: 150, blue: 50 },
  "rev:fake_arrow": { red: 255, green: 255, blue: 255 }
};

export const WEAPON_TYPES_FOR_UI = [
  { id: "rev:flintlock_bullet", label: "item.rev:flintlock" },
  { id: "rev:musket_bullet", label: "item.rev:musket" },
  { id: "rev:shotgun_normal_bullet", label: "item.rev:shotgun_normal" },
  { id: "rev:shotgun_s_bullet", label: "item.rev:shotgun_s" },
  { id: "rev:mauler_bullet", label: "item.rev:mauler" },
  { id: "rev:mortar_bullet", label: "item.rev:hand_mortar" },
  { id: "rev:crooked_mortar_bullet", label: "item.rev:crooked_mortar" },

  { id: "rev:auto_gun_bullet", label: "item.rev:auto_gun" },
  { id: "rev:despoiler_bullet", label: "item.rev:despoiler" },
  { id: "rev:musket_bullet_hunting", label: "item.rev:hunting_musket" },
  { id: "rev:fake_arrow", label: "item.rev:repeater_crossbow" }
];

export const raritiesColor = {
  'common': ['a', 3],
  'rare': ['b', 5],
  'epic': ['u', 7]
}

export const achievements = [
  {
    id: 'rev:improv_betsy_achievement',
    name: 'rev.ui.advancement.ibetz.name',
    description: 'rev.ui.advancement.ibetz.desc',
    rarity: 'common'
  },
  {
    id: 'rev:showdown_achievement',
    name: 'rev.ui.advancement.shdwn.name',
    description: 'rev.ui.advancement.shdwn.desc',
    rarity: 'common'
  },
  {
    id: 'rev:valid_strategy_achievement',
    name: 'rev.ui.advancement.vdstr.name',
    description: 'rev.ui.advancement.vdstr.desc',
    rarity: 'rare'
  },
  {
    id: 'rev:dont_take_aim_achievement',
    name: 'rev.ui.advancement.dntai.name',
    description: 'rev.ui.advancement.dntai.desc',
    rarity: 'rare'
  },
  {
    id: 'rev:dark_age_achievement',
    name: 'rev.ui.advancement.drage.name',
    description: 'rev.ui.advancement.drage.desc',
    rarity: 'epic'
  },
  {
    id: 'rev:collateral_damage_achievement2',
    name: 'rev.ui.advancement.cldmg.name',
    description: 'rev.ui.advancement.cldmg.desc',
    rarity: 'epic'
  },
  {
    id: 'rev:no_chance_achievement',
    name: 'rev.ui.advancement.nocha.name',
    description: 'rev.ui.advancement.nocha.desc',
    rarity: 'epic'
  }
]