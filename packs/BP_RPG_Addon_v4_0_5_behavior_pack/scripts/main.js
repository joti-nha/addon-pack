// src/main.ts
import { world as world12, system as system9, ItemLockMode as ItemLockMode5 } from "@minecraft/server";

// src/systems/init.ts
import { world, ItemStack, ItemLockMode } from "@minecraft/server";
var SCOREBOARDS = ["class", "souls", "level"];
function initScoreboards() {
  try {
    for (const sb of SCOREBOARDS) {
      if (!world.scoreboard.getObjective(sb)) {
        world.scoreboard.addObjective(sb, sb);
      }
    }
  } catch (e) {}
}
world.afterEvents.playerSpawn.subscribe((event) => {
  initScoreboards();
  if (!event.initialSpawn) return;
  const player = event.player;
  if (player.hasTag("shop_ranger_poisenarrow")) {
    player.removeTag("shop_ranger_poisenarrow");
    player.addTag("shop_ranger_poisonarrow");
  }
  if (player.hasTag("shop_assassin_poisen")) {
    player.removeTag("shop_assassin_poisen");
    player.addTag("shop_assassin_poison");
  }
  event.player.sendMessage("\xA7b=========================================");
  event.player.sendMessage("\xA7eWelcome to the RPG Addon!");
  event.player.sendMessage("\xA7fIf you find any bugs or have issues, please report them on Discord.");
  event.player.sendMessage("\xA7fGive us your feedback and ideas for the next update to help make it even better!");
  event.player.sendMessage("\xA7a[ join discord , link is in addon descripion on curseforge ]");
  event.player.sendMessage("\xA7b=========================================");
  initPlayer(event.player);
});
world.afterEvents.playerLeave.subscribe((event) => {
  const pid = event.playerId;
  MAP_HOLD_TIMERS.delete(pid);
  spawnCooldowns.delete(pid);
  statsCache.delete(pid);
  lastSneakStartTick.delete(pid);
  wasSneaking.delete(pid);
  RANGER_BOW_DRAW_STATES.delete(pid);
  
  for (const [key] of SPELL_COOLDOWNS) { if (key.includes(pid)) SPELL_COOLDOWNS.delete(key); }
  for (const [key] of COOLDOWNS) { if (key.includes(pid)) COOLDOWNS.delete(key); }
  for (const [key] of COOLDOWN_MESSAGE_TICKS) { if (key.includes(pid)) COOLDOWN_MESSAGE_TICKS.delete(key); }
  for (const [key] of IK_STATES) { if (key.includes(pid)) IK_STATES.delete(key); }
  RANGER_RECENT_BOW_SHOTS.delete(pid);
  for (const [projectileId, state] of RANGER_ARROW_STATES) {
    if (state.ownerId === pid) RANGER_ARROW_STATES.delete(projectileId);
  }
});
function initPlayer(player) {
  const classObj = world.scoreboard.getObjective("class");
  const soulsObj = world.scoreboard.getObjective("souls");
  const levelObj = world.scoreboard.getObjective("level");
  if (!classObj || !soulsObj || !levelObj) return;
  if (!classObj.hasParticipant(player)) {
    classObj.setScore(player, 0);
    soulsObj.setScore(player, 0);
    levelObj.setScore(player, 1);
  } else {
    const classId = classObj.getScore(player) ?? 0;
    const level = levelObj.getScore(player) ?? 1;
    if (classId > 0) {
    }
  }
  let hasBook = false;
  const inv = player.getComponent("minecraft:inventory");
  if (inv && inv.container) {
    for (let i = 0; i < inv.container.size; i++) {
      const item = inv.container.getItem(i);
      if (item && item.typeId === "minecraft:book" && item.nameTag === "\xA7l\xA76RPG Guide") {
        hasBook = true;
        break;
      }
    }
  }
  if (!hasBook) {
    giveRPGBook(player);
  }
}
export function safeApplyDamage(target, amount, options) {
  if (!target || !target.isValid()) return false;
  try {
    const health = target.getComponent("minecraft:health");
    if (!health) return false;
    target.applyDamage(amount, options);
    return true;
  } catch (e) {
    return false;
  }
}

export function safeAddEffect(target, effectType, duration, options) {
  if (!target || !target.isValid()) return false;
  try {
    const health = target.getComponent("minecraft:health");
    if (!health) return false;
    const formattedEffect = effectType.startsWith("minecraft:") ? effectType : `minecraft:${effectType}`;
    target.addEffect(formattedEffect, duration, options);
    return true;
  } catch (e) {
    return false;
  }
}

export function safeSetOnFire(target, seconds, customSound = true) {
  if (!target || !target.isValid()) return false;
  try {
    const health = target.getComponent("minecraft:health");
    if (!health) return false;
    target.setOnFire(seconds, customSound);
    return true;
  } catch (e) {
    return false;
  }
}

export function giveOrDropItem(player, itemStack) {
  if (!player || !player.isValid()) return false;
  try {
    const inv = player.getComponent("minecraft:inventory")?.container;
    if (!inv) {
      player.dimension.spawnItem(itemStack, player.location);
      return false;
    }
    const leftover = inv.addItem(itemStack);
    if (leftover && leftover.amount > 0) {
      player.dimension.spawnItem(leftover, player.location);
      return false;
    }
    return true;
  } catch (e) {
    try {
      player.dimension.spawnItem(itemStack, player.location);
    } catch (e2) {}
    return false;
  }
}

function giveRPGBook(player) {
  const book = new ItemStack("minecraft:book", 1);
  book.nameTag = "\xA7l\xA76RPG Guide";
  book.keepOnDeath = true;
  book.lockMode = ItemLockMode.inventory;
  const added = giveOrDropItem(player, book);
  if (added) {
    player.sendMessage("\xA7a[System] You received the \xA76RPG Guide\xA7a!");
  } else {
    player.sendMessage("\xA7a[System] Your inventory was full! The \xA76RPG Guide\xA7a was dropped at your feet.");
  }
}


// src/systems/spells.ts
import { EntityDamageCause, system as system2 } from "@minecraft/server";
var SPELL_COOLDOWNS = /* @__PURE__ */ new Map();
var MAP_HOLD_TIMERS = new Map();
function checkSpellCooldown(player, cdTicks) {
  const key = player.id + "_spell_cd";
  const nextAvailable = SPELL_COOLDOWNS.get(key) || 0;
  if (system2.currentTick < nextAvailable) {
    return false;
  }
  SPELL_COOLDOWNS.set(key, system2.currentTick + cdTicks);
  return true;
}
function castSpell(player, spellId) {
  switch (spellId) {
    case "fireball":
      castFireball(player);
      break;
    case "frost":
      castFrost(player);
      break;
    case "lightning":
      castLightning(player);
      break;
    case "invisibility":
      player.sendMessage("\xA78[Mage] Invisibility is permanent while equipped in Spellbook. No need to cast!");
      break;
    default:
      player.sendMessage("\xA7cNo active spell selected! Open your RPG Guide to select one.");
      break;
  }
}
function getHitTarget(player, maxDist = 20) {
  const rayEntities = player.getEntitiesFromViewDirection({ maxDistance: maxDist });
  const rayBlock = player.getBlockFromViewDirection({ maxDistance: maxDist });
  const hitEntity = rayEntities.find((e) => e.entity.id !== player.id)?.entity;
  let hitDist = maxDist;
  if (hitEntity) {
    hitDist = rayEntities.find((e) => e.entity.id !== player.id).distance;
  } else if (rayBlock) {
    const pl = player.getHeadLocation();
    const bl = rayBlock.block.location;
    hitDist = Math.sqrt((pl.x - bl.x) ** 2 + (pl.y - bl.y) ** 2 + (pl.z - bl.z) ** 2);
  }
  return { entity: hitEntity, blockLocation: rayBlock?.block?.location, distance: hitDist };
}
function drawLineParticles(player, distance, particleId) {
  const headLoc = player.getHeadLocation();
  const viewDir = player.getViewDirection();
  for (let i = 1; i <= distance; i += 0.5) {
    const loc = {
      x: headLoc.x + viewDir.x * i,
      y: headLoc.y + viewDir.y * i,
      z: headLoc.z + viewDir.z * i
    };
    try {
      player.dimension.spawnParticle(particleId, loc);
    } catch (e) {
      console.warn(e);
    }
  }
}
function castFireball(player) {
  const hasMageshoot = player.hasTag("shop_mageshoot") && !player.hasTag("shop_mageshoot_off");
  const cooldown = hasMageshoot ? 2 * 20 : 10;
  if (!checkSpellCooldown(player, cooldown)) {
    player.playSound("note.bass");
    return;
  }
  player.playSound("mob.blaze.shoot");
  const target = getHitTarget(player, hasMageshoot ? 20 : 10);
  drawLineParticles(player, target.distance, "minecraft:basic_flame_particle");
  const center = target.entity ? target.entity.location : target.blockLocation;
  if (center) {
    if (hasMageshoot) {
      const shouldDestroy = player.hasTag("destroy_blocks");
      player.dimension.createExplosion(center, 3, { breaksBlocks: shouldDestroy, causesFire: shouldDestroy, source: player });
      const entities = player.dimension.getEntities({ location: center, maxDistance: 4 });
      for (const e of entities) {
        if (e.id !== player.id) {
          try {
            e.applyDamage(20, { cause: EntityDamageCause.fire, damagingEntity: player });
            e.setOnFire(6, true);
          } catch (err) {
            console.warn(err);
          }
        }
      }
    } else {
      if (target.entity) {
        safeApplyDamage(target.entity, 4, { cause: EntityDamageCause.fire, damagingEntity: player });
        safeSetOnFire(target.entity, 6, true);
      }
    }
  }
}
function castFrost(player) {
  const hasIce = player.hasTag("shop_ice") && !player.hasTag("shop_ice_off");
  const cooldown = hasIce ? 5 * 20 : 2 * 20;
  if (!checkSpellCooldown(player, cooldown)) {
    player.playSound("note.bass");
    return;
  }
  player.playSound("glass.break");
  const target = getHitTarget(player, hasIce ? 20 : 10);
  drawLineParticles(player, target.distance, "minecraft:snowflake_particle");
  const center = target.entity ? target.entity.location : target.blockLocation || player.location;
  const entities = player.dimension.getEntities({ location: center, maxDistance: 10 });
  const damage = hasIce ? 12 : 4;
  for (let i = 0; i < 20; i++) {
    try {
      const loc = {
        x: center.x + (Math.random() * 10 - 5),
        y: center.y + Math.random() * 2,
        z: center.z + (Math.random() * 10 - 5)
      };
      player.dimension.spawnParticle("minecraft:blue_flame_particle", loc);
    } catch (e) {
      console.warn(e);
    }
  }
  for (const e of entities) {
    if (e.id !== player.id) {
      safeApplyDamage(e, damage, { cause: EntityDamageCause.freezing, damagingEntity: player });
      safeAddEffect(e, "minecraft:slowness", 20 * 20, { amplifier: 3 });
      safeAddEffect(e, "minecraft:weakness", 20 * 20, { amplifier: 0 });
    }
  }
}
function castLightning(player) {
  if (!checkSpellCooldown(player, 5 * 20)) {
    player.playSound("note.bass");
    return;
  }
  player.playSound("ambient.weather.thunder");

  // Real lightning bolts deal their own area damage and can hurt the caster even
  // though the scripted damage below excludes them. Briefly protect only the
  // casting player before any bolts are spawned.
  player.addEffect("minecraft:resistance", 2 * 20, { amplifier: 255, showParticles: false });
  player.addEffect("minecraft:fire_resistance", 4 * 20, { amplifier: 0, showParticles: false });

  const target = getHitTarget(player, 7);
  const center = target.entity ? target.entity.location : target.blockLocation || player.location;
  const entities = player.dimension.getEntities({ location: center, maxDistance: 7 });
  for (const e of entities) {
    if (e.id !== player.id) {
      try { e.dimension.spawnEntity("minecraft:lightning_bolt", e.location); } catch (err) {}
      safeApplyDamage(e, 10, { cause: EntityDamageCause.lightning, damagingEntity: player });
    }
  }
}

// src/systems/classes.ts
import { world as world8, system as system6, ItemStack as ItemStack4, ItemLockMode as ItemLockMode4, EnchantmentTypes as EnchantmentTypes3 } from "@minecraft/server";
import { ActionFormData as ActionFormData5 } from "@minecraft/server-ui";

// src/systems/leveling.ts
import { world as world4, ItemStack as ItemStack3, EnchantmentTypes as EnchantmentTypes2, ItemLockMode as ItemLockMode3 } from "@minecraft/server";

// src/systems/shop.ts
import { world as world3, ItemStack as ItemStack2, EnchantmentTypes, ItemLockMode as ItemLockMode2 } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
var ABILITY_USAGE_MESSAGES = {
  active_ability_sword: "\xA7eTo use ability, crouch and then jump and it has a cooldown of 5 min after use.\xA7r",
  active_ability_survivor_dash: "\xA7eTo use Dash, crouch and then jump. Pushes you 10 blocks forward, damages nearby mobs, and grants Invisibility & Resistance for 10s. (Cooldown: 45s)\xA7r",
  active_ability_groundsmash: "\xA7eTo use this ability, crouch and then jump. (Cooldown: 2 min)\xA7r",
  active_ability_ranger_rapidarrow: "\xA7eTo use Rapid Arrow, crouch and then jump. Instantly shoots 30 arrows! (Cooldown: 4 min)\xA7r",
  active_ability_ranger_aim: "\xA7eTo use Aim, crouch and then jump. Grants Night Vision for 1 minute. (Cooldown: 6 min)\xA7r",
  active_ability_survivor_safety: "\xA7eTo use Safety, crouch and then jump. Grants Resistance III, Fire Resistance, and Absorption for 30s. (Cooldown: 6 min)\xA7r",
  active_ability_survivor_speedboost: "\xA7eTo use Speedboost, crouch and then jump. Grants Speed III, Jump Boost II, and Resistance II for 20s. (Cooldown: 4 min)\xA7r",
  active_ability_survivor_hide: "\xA7eTo use Hide, crouch and then jump. Grants complete Invisibility for 60 seconds. (Cooldown: 5 min)\xA7r",
  active_ability_survivor_lock: "\xA7eTo use Lock, crouch and then jump. Traps nearby enemies in obsidian and applies Slowness III. (Cooldown: 5 min)\xA7r",
  active_ability_assassin_vanish: "\xA7eTo use Vanish, crouch and then jump. Grants Invisibility for 45s. (Cooldown: 8 mins)\xA7r"
};

var WarriorShopItems = [
  {
    id: "active_ability_sword",
    name: "Summon Sword",
    description: "(Equip & Use : Crouch + Jump ) Grants an Iron Sword with Curse of Vanishing.",
    costXP: 1,
    costSouls: 100,
    tag: "active_ability_sword",
    isActiveAbility: true,
    requiresTag: "path_middle_1"
  },
  {
    id: "active_ability_groundsmash",
    name: "Ground Smash",
    description: "(Equip & Use : Crouch + Jump ) Pushes away enemies and deals damage. Gives Resistance 1 and Absorption 1.",
    costXP: 5,
    costSouls: 150,
    tag: "active_ability_groundsmash",
    isActiveAbility: true,
    requiresTag: "path_left_5"
  },
  {
    id: "active_ability_attack_strength",
    name: "Valor",
    description: "(Equip & Use : Crouch + Jump ) Gives massive buffs and damages nearby enemies.",
    costXP: 5,
    costSouls: 200,
    tag: "active_ability_attack_strength",
    isActiveAbility: true,
    requiresTag: "path_middle_3"
  },
  {
    id: "healthmet_buff",
    name: "Reinforced Recovery",
    description: "(Passive) Grants Regeneration I while wearing any helmet.",
    costXP: 5,
    costSouls: 280,
    tag: "shop_healthmet",
    requiresTag: "path_right_1"
  },
  {
    id: "assassin_skill_buff",
    name: "Swift-Footed",
    description: "(Passive) Grants permanent Speed I.",
    costXP: 5,
    costSouls: 300,
    tag: "shop_assassin_skill",
    effectId: "minecraft:speed",
    requiresTag: "path_left_1"
  },
  {
    id: "heart_buff",
    name: "Vitality",
    description: "(Passive) Permanently grants 6 Extra Hearts.",
    costXP: 5,
    costSouls: 350,
    tag: "shop_heart",
    requiresTag: "path_left_2"
  },
  {
    id: "armour_buff",
    name: "Juggernaut",
    description: "(Passive) Grants Resistance II and Jump Boost I when wearing full armor.",
    costXP: 5,
    costSouls: 200,
    tag: "shop_armour",
    requiresTag: "path_left_3"
  },
  {
    id: "strength_buff",
    name: "Rage",
    description: "(Passive) Permanently grants Strength I.",
    costXP: 5,
    costSouls: 250,
    tag: "shop_strength",
    effectId: "minecraft:strength",
    requiresTag: "path_right_2"
  },
  {
    id: "unbreakable_sword_buff",
    name: "Enhanced Summon Sword",
    description: "(Passive) Upgrades Sword Ability to Summon a Diamond Sword.",
    costXP: 5,
    costSouls: 350,
    tag: "shop_unbreakable_sword",
    requiresTag: "path_middle_2"
  },
  {
    id: "groundsmash_passive_buff",
    name: "Thick-Skinned",
    description: "(Passive) Grants permanent Resistance I.",
    costXP: 5,
    costSouls: 250,
    tag: "shop_groundsmash",
    effectId: "minecraft:resistance",
    requiresTag: "path_right_3"
  },
  {
    id: "dual_sword_buff",
    name: "Sword Mastery",
    description: "(Passive) Your melee attacks deal bonus damage based on your sword type.",
    costXP: 5,
    costSouls: 400,
    tag: "shop_dual_sword",
    requiresTag: "path_left_4"
  },
  {
    id: "shield_buff",
    name: "Bulwark",
    description: "(Passive) Instantly heals 5 hearts every 75 seconds when a Shield is equipped in offhand.",
    costXP: 5,
    costSouls: 500,
    tag: "shop_shield",
    requiresTag: "path_right_4"
  },
  {
    id: "fire_slash_buff",
    name: "Blood of Fire",
    description: "(Passive) Burns enemies when they attack you.",
    costXP: 5,
    costSouls: 500,
    tag: "shop_fire_slash",
    requiresTag: "path_right_5"
  }
];
var RangerShopItems = [
  {
    id: "ranger_agility",
    name: "Forest Walking",
    description: "(Passive) Grants permanent Speed I.",
    costSouls: 100,
    costXP: 1,
    tag: "shop_ranger_agility",
    isActiveAbility: false,
    requiresTag: "path_middle_1"
  },
  {
    id: "ranger_firearrow",
    name: "Arrows of Fire",
    description: "(Passive) Arrows fired apply Burn for 12 seconds and deal extra fire damage.",
    costSouls: 150,
    costXP: 5,
    tag: "shop_ranger_firearrow",
    isActiveAbility: false,
    requiresTag: "path_left_1"
  },
  {
    id: "ranger_poisonarrow",
    name: "Poisoned Arrows",
    description: "(Passive) Arrows fired apply Poison for 6 seconds.",
    costSouls: 150,
    costXP: 5,
    tag: "shop_ranger_poisonarrow",
    isActiveAbility: false,
    requiresTag: "path_right_1"
  },
  {
    id: "ranger_map",
    name: "Sense Heading",
    description: "(Equip & Use : Crouch + Jump ) Scans the world and lists all players with distance & direction (e.g. 140m North-East) in chat. (Cooldown: 5 mins)",
    costSouls: 100,
    costXP: 5,
    tag: "shop_ranger_map",
    isActiveAbility: true,
    requiresTag: "path_left_2"
  },
  {
    id: "ranger_arrowsunlimi",
    name: "Fletching",
    description: "(Passive) Automatically replenishes an arrow in your inventory if you are holding a bow and dont have any arrows.",
    costSouls: 250,
    costXP: 5,
    tag: "shop_ranger_arrowsunlimi",
    isActiveAbility: false,
    requiresTag: "path_left_3"
  },
  {
    id: "ranger_hearts",
    name: "Hardened Scout",
    description: "(Passive) Grants +6 extra hearts and permanent Regeneration.",
    costSouls: 300,
    costXP: 5,
    tag: "shop_ranger_hearts",
    isActiveAbility: false,
    requiresTag: "path_right_2"
  },
  {
    id: "ranger_rapidarrow",
    name: " Arrow Barrage",
    description: "(Equip & Use : Crouch + Jump ) shoot 60 magically summoned poisoned arrows rapidly. Cooldown: 4 minutes.",
    costSouls: 150,
    costXP: 5,
    tag: "active_ability_ranger_rapidarrow",
    isActiveAbility: true,
    requiresTag: "path_right_3"
  },
  {
    id: "ranger_immunearrow",
    name: "Deflect Missiles",
    description: "(Passive) Immunity to all arrow damage.",
    costSouls: 400,
    costXP: 5,
    tag: "shop_ranger_immunearrow",
    isActiveAbility: false,
    requiresTag: "path_left_5"
  },
  {
    id: "ranger_deadarrow",
    name: "Heavy Draw",
    description: "(Passive) Fully charged arrow shots from the Special Ranger Bows deal double damage.",
    costSouls: 200,
    costXP: 5,
    tag: "shop_ranger_deadarrow",
    isActiveAbility: false,
    requiresTag: "path_left_4"
  },
  {
    id: "ranger_aim",
    name: "Aspect of the Owl",
    description: "(Equip & Use : Crouch + Jump ) You gain Night Vision for 1 minute. Cooldown: 6 minutes.",
    costSouls: 100,
    costXP: 5,
    tag: "active_ability_ranger_aim",
    isActiveAbility: true,
    requiresTag: "path_middle_2"
  },
  {
    id: "ranger_archersafe",
    name: "Hunter’s Stamina",
    description: "(Passive) Grants permanent Resistance I. Holding a bow grants Speed II and +2 more extra hearts.",
    costSouls: 300,
    costXP: 5,
    tag: "shop_ranger_archersafe",
    isActiveAbility: false,
    requiresTag: "path_middle_3"
  },
  {
    id: "ranger_explosion",
    name: "Explosive Arrows",
    description: "(Passive) Arrows create an explosion upon impact.",
    costSouls: 200,
    costXP: 5,
    tag: "shop_ranger_explosion",
    isActiveAbility: false,
    requiresTag: "path_right_4"
  },
  {
    id: "ranger_armour",
    name: "Barkskin Binding",
    description: "(Passive) Grants Resistance II when wearing a full set of armor.",
    costSouls: 275,
    costXP: 5,
    tag: "shop_ranger_armour",
    isActiveAbility: false,
    requiresTag: "path_right_5"
  }
];
var AssassinShopItems = [
  {
    id: "assassin_speed",
    name: "Nimble Stride",
    description: "(Passive) Grants permanent Speed II at all times.",
    costSouls: 100,
    costXP: 1,
    tag: "shop_assassin_speed",
    isActiveAbility: false,
    requiresTag: "path_middle_1"
  },
  {
    id: "assassin_dagger",
    name: "Deep Laceration",
    description: "(Passive) Every melee hit deals +3 bonus damage.",
    costSouls: 225,
    costXP: 5,
    tag: "shop_assassin_dagger",
    isActiveAbility: false,
    requiresTag: "path_left_1"
  },
  {
    id: "assassin_silence",
    name: "Vanish",
    description: "(Active) Equip & Use: Crouch + Jump. Grants Invisibility for 45s. Cooldown: 8 mins.",
    costSouls: 200,
    costXP: 5,
    tag: "active_ability_assassin_vanish",
    isActiveAbility: true,
    requiresTag: "path_right_1"
  },
  {
    id: "assassin_critical",
    name: "Surprise Attack",
    description: "(Passive) Attacking while airborne deals +7 bonus damage. Triggers once every 2 minutes.",
    costSouls: 220,
    costXP: 5,
    tag: "shop_assassin_critical",
    isActiveAbility: false,
    requiresTag: "path_left_2"
  },
  {
    id: "assassin_bow",
    name: "Assassin's Deadly Bow",
    description: "(Passive) Receive a Power IV + Unbreaking III bow that is kept on death, automatically repaired, and restored if lost.",
    costSouls: 200,
    costXP: 5,
    tag: "shop_assassin_bow",
    isActiveAbility: false,
    requiresTag: "path_left_3"
  },
  {
    id: "assassin_blind",
    name: "Enervating Fade",
    description: "(Equip & Use : Crouch + Jump ) All mobs within 15 blocks get Weakness for 20s and you get Invisibility for 20 seconds. *PvP- Players also get Darkness* (Cooldown: 5 mins)",
    costSouls: 200,
    costXP: 5,
    tag: "shop_assassin_blind",
    isActiveAbility: true,
    requiresTag: "path_right_2"
  },
  {
    id: "assassin_lethal",
    name: "Vampiric Strike",
    description: "(Passive) Your next melee strike heals you for 5 hearts. (Cooldown: 75s)",
    costSouls: 300,
    costXP: 5,
    tag: "shop_assassin_lethal",
    isActiveAbility: false,
    requiresTag: "path_right_3"
  },
  {
    id: "assassin_arrow",
    name: "Flawless Quiver",
    description: "(Passive) Receive 7 arrows every Minecraft day to use with the Assassin Bow.",
    costSouls: 150,
    costXP: 5,
    tag: "shop_assassin_arrow",
    isActiveAbility: false,
    requiresTag: "path_middle_3"
  },
  {
    id: "assassin_shadow",
    name: "Phantom Form",
    description: "(Equip & Use : Crouch + Jump ) Gain Invisibility, Speed II, Strength II, Resistance, and Jump Boost for 30s. Enemies within 5 blocks get Poisoned and Weakness. (Cooldown: 10 mins)",
    costSouls: 350,
    costXP: 5,
    tag: "shop_assassin_shadow",
    isActiveAbility: true,
    requiresTag: "path_left_4"
  },
  {
    id: "assassin_poison",
    name: "Aura of Poison",
    description: "(Passive) Any enemy that damages you gets poisoned for 25 seconds.",
    costSouls: 350,
    costXP: 5,
    tag: "shop_assassin_poison",
    isActiveAbility: false,
    requiresTag: "path_middle_2"
  },
  {
    id: "assassin_hearts",
    name: "Demon's Deal",
    description: "(Passive) Gain +6 extra hearts and permanent Regeneration.",
    costSouls: 500,
    costXP: 5,
    tag: "shop_assassin_hearts",
    isActiveAbility: false,
    requiresTag: "path_left_5"
  },
  {
    id: "assassin_disharm",
    name: "Void Walker",
    description: "(Passive) Every 5 minutes, you become invisible for 20s and are immune to all damage except fire, lava, fall, explosions, poison, and wither damage during that time.",
    costSouls: 250,
    costXP: 5,
    tag: "shop_assassin_disharm",
    isActiveAbility: false,
    requiresTag: "path_right_4"
  },
  {
    id: "assassin_instantkill",
    name: "Deadly Strike",
    description: "(Passive) Hit the same target 3 times in 5s without being hit yourself to deal 40 bonus damage. One use per mob. 60-second cooldown after triggering.",
    costSouls: 300,
    costXP: 5,
    tag: "shop_assassin_instantkill",
    isActiveAbility: false,
    requiresTag: "path_right_5"
  }
];
var MageShopItems = [
  {
    id: "mage_staff",
    name: "Mage Staff",
    description: "(Active) Activate Mage Staff to receive a magical staff to cast your spells.",
    costSouls: 200,
    costXP: 1,
    tag: "shop_mage_staff",
    isActiveAbility: true,
    requiresTag: "path_middle_1"
  },
  {
    id: "mage_fireball",
    name: "Fireball",
    description: "(Spell) Shoots a fireball up to 10 blocks that burns enemies.",
    costSouls: 100,
    costXP: 5,
    tag: "spell_unlocked:fireball",
    isActiveAbility: false,
    requiresTag: "path_left_1"
  },
  {
    id: "mage_frost",
    name: "Frost Wave",
    description: "(Spell) Deals 4 damage to all mobs in a 10-block radius, applies Slowness & Weakness, and has a 2-second cooldown.",
    costSouls: 125,
    costXP: 5,
    tag: "spell_unlocked:frost",
    isActiveAbility: false,
    requiresTag: "path_right_1"
  },
  {
    id: "mage_manashield",
    name: "Arcane Ward",
    description: "(Equip & Use : Crouch + Jump ) Gain Fire Protection, Absorption, Resistance III, and Regeneration.",
    costSouls: 200,
    costXP: 5,
    tag: "shop_manashield",
    isActiveAbility: true,
    requiresTag: "path_left_2"
  },
  {
    id: "mage_lightning",
    name: "Lightning Blast",
    description: "(Spell) Strikes mobs in a 10-block radius with lightning. Cooldown: 5 seconds.",
    costSouls: 300,
    costXP: 5,
    tag: "spell_unlocked:lightning",
    isActiveAbility: false,
    requiresTag: "path_left_3"
  },
  {
    id: "mage_hypnosis",
    name: "Cloud of Poison",
    description: "(Equip & Use : Crouch + Jump ) Apply Poison to nearby enemies. *PvP- Players also receive Nausea*",
    costSouls: 100,
    costXP: 5,
    tag: "shop_hypnosis",
    isActiveAbility: true,
    requiresTag: "path_right_2"
  },
  {
    id: "mage_ice",
    name: "Frostbite Mastery",
    description: "(Passive) Increases Frost damage to 12 and cast range to 20 blocks, with a 5-second cooldown.",
    costSouls: 230,
    costXP: 5,
    tag: "shop_ice",
    isActiveAbility: false,
    requiresTag: "path_right_3"
  },
  {
    id: "mage_magicslash",
    name: "Hellfire Eruption",
    description: "(Equip & Use : Crouch + Jump ) to deal 20 damage and burn all mobs in a 15-block radius.",
    costSouls: 300,
    costXP: 5,
    tag: "shop_magicslash",
    isActiveAbility: true,
    requiresTag: "path_middle_3"
  },
  {
    id: "mage_mageshoot",
    name: "Flame Mastery",
    description: "(Passive) Fireball damage increases to 10, cast range to 20 blocks, and destroys blocks like a creeper, but adds a 2-second cooldown.",
    costSouls: 240,
    costXP: 5,
    tag: "shop_mageshoot",
    isActiveAbility: false,
    requiresTag: "path_left_4"
  },
  {
    id: "mage_enchantment",
    name: "Ethereal Library",
    description: "(Passive) Receive one random enchanted book every Minecraft day.",
    costSouls: 500,
    costXP: 5,
    tag: "shop_enchantment",
    isActiveAbility: false,
    requiresTag: "path_middle_2"
  },
  {
    id: "mage_effectmage",
    name: "Wild Magic Surge",
    description: "(Passive) Receive a random beneficial effect for 1 minute every 6 minutes.",
    costSouls: 400,
    costXP: 5,
    tag: "shop_effectmage",
    isActiveAbility: false,
    requiresTag: "path_left_5"
  },
  {
    id: "mage_petsmage",
    name: "Petsmage (Warden Guard)",
    description: "(Special Ability) Unlocks the 'Summon Guard!' option in the Soul Shop to summon a loyal Warden Guard.",
    costSouls: 500,
    costXP: 5,
    tag: "shop_petsmage",
    isActiveAbility: false,
    requiresTag: "path_right_4"
  },
  {
    id: "mage_invisibility",
    name: "Arcane Dissolution",
    description: "(Spell) When selected in the Spellbook, you become permanently invisible while holding your Mage Staff.",
    costSouls: 1000,
    costXP: 5,
    tag: "spell_unlocked:invisibility",
    isActiveAbility: false,
    requiresTag: "path_right_5"
  }
];
var SurvivorShopItems = [
  {
    id: "survivor_boot",
    name: "Wayfarer’s Pace",
    description: "(Passive) Grants Speed I permanently while wearing boots.",
    costSouls: 100,
    costXP: 1,
    tag: "shop_survivor_boot",
    isActiveAbility: false,
    requiresTag: "path_middle_1"
  },
  {
    id: "survivor_map",
    name: "Master Cartographer",
    description: "(Equip & Use : Crouch + Jump ) Reveals exact X-Y-Z coordinates of all online players and identifies the nearest structure in chat. (Cooldown: 8 mins)",
    costSouls: 100,
    costXP: 5,
    tag: "shop_survivor_map",
    isActiveAbility: true,
    requiresTag: "path_left_1"
  },
  {
    id: "survivor_healing",
    name: "Vagabond’s Constitution",
    description: "(Passive) Grants +4 extra hearts and Regeneration while wearing a chestplate.",
    costSouls: 215,
    costXP: 5,
    tag: "shop_survivor_healing",
    isActiveAbility: false,
    requiresTag: "path_right_1"
  },
  {
    id: "survivor_thrones",
    name: "Alchemist's Retaliation",
    description: "(Passive) Any enemy that damages you will be poisoned for 10 seconds.",
    costSouls: 200,
    costXP: 5,
    tag: "shop_survivor_thrones",
    isActiveAbility: false,
    requiresTag: "path_left_2"
  },
  {
    id: "survivor_dash",
    name: "Escape Artist",
    description: "(Equip & Use : Crouch + Jump ) Push yourself 10 blocks forward while Dealing 5 damage to mobs near start point. Grants Invisibility and Resistance for 10s. (Cooldown: 45s)",
    costSouls: 180,
    costXP: 5,
    tag: "active_ability_survivor_dash",
    isActiveAbility: true,
    requiresTag: "path_left_3"
  },
  {
    id: "survivor_medkit",
    name: "Vagabond's Constitution Mastery",
    description: "(Passive) Upgrades extra hearts to +10 total while wearing a chestplate and with Vagabond’s Constitution unlocked. Also heals you instantly for 5 hearts every 5 minutes.",
    costSouls: 350,
    costXP: 5,
    tag: "shop_survivor_medkit",
    isActiveAbility: false,
    requiresTag: "path_right_2"
  },
  {
    id: "survivor_safety",
    name: "Hero's Panic",
    description: "(Equip & Use : Crouch + Jump ) Gain Resistance III, Fire Resistance, and Absorption for 30s. (Cooldown: 6m)",
    costSouls: 150,
    costXP: 5,
    tag: "active_ability_survivor_safety",
    isActiveAbility: true,
    requiresTag: "path_right_3"
  },
  {
    id: "survivor_speedboost",
    name: "Second Wind",
    description: "(Equip & Use : Crouch + Jump ) Gain Speed III, Jump Boost II, and Resistance II for 20s. (Cooldown: 4m)",
    costSouls: 100,
    costXP: 5,
    tag: "active_ability_survivor_speedboost",
    isActiveAbility: true,
    requiresTag: "path_middle_3"
  },
  {
    id: "survivor_hide",
    name: "Camouflage",
    description: "(Equip & Use : Crouch + Jump ) Gain 60 seconds of complete Invisibility. (Cooldown: 5m)",
    costSouls: 280,
    costXP: 5,
    tag: "active_ability_survivor_hide",
    isActiveAbility: true,
    requiresTag: "path_left_4"
  },
  {
    id: "survivor_backup",
    name: "Adventure's Reserve",
    description: "(Passive) Receive food and crafting supplies every full minecraft day, an enchanted apple if also given every 5 days.",
    costSouls: 425,
    costXP: 5,
    tag: "shop_survivor_backup",
    isActiveAbility: false,
    requiresTag: "path_middle_2"
  },
  {
    id: "survivor_effect",
    name: "Potion Guzzler",
    description: "(Passive) Randomly gives a beneficial effect for 1 minute, every 6 minutes.",
    costSouls: 450,
    costXP: 5,
    tag: "shop_survivor_effect",
    isActiveAbility: false,
    requiresTag: "path_left_5"
  },
  {
    id: "survivor_vision",
    name: "Nocturnal Adaptation",
    description: "(Passive) Grants permanent Night Vision.",
    costSouls: 500,
    costXP: 5,
    tag: "shop_survivor_vision",
    isActiveAbility: false,
    requiresTag: "path_right_4"
  },
  {
    id: "survivor_lock",
    name: "Makeshift Shelter",
    description: "(Equip & Use : Crouch + Jump ) Create a permanent cobblestone emergency shelter with a crafting table and furnace. (Cooldown: 5m)",
    costSouls: 600,
    costXP: 5,
    tag: "active_ability_survivor_lock",
    isActiveAbility: true,
    requiresTag: "path_right_5"
  }
];
var AllShopItems = [...WarriorShopItems, ...RangerShopItems, ...AssassinShopItems, ...SurvivorShopItems, ...MageShopItems];
function showSoulShopUI(player) {
  const classObj = world3.scoreboard.getObjective("class");
  const classId = classObj?.getScore(player) ?? 0;
  const form = new ActionFormData().title("Soul Shop").body("Welcome to the Soul Shop! Choose a category:");
  form.button("Active Abilities");
  form.button("Passive Abilities");
  const hasPetsmage = classId === 3 && player.hasTag("shop_petsmage");
  if (hasPetsmage) {
    form.button("\xA75✨ Summon Guard! ✨\xA7r");
  }
  form.button("Close");
  form.show(player).then((response) => {
    if (response.canceled || response.selection === void 0) return;
    if (response.selection === 0) {
      showActiveAbilitiesUI(player);
    } else if (response.selection === 1) {
      showBuyBuffsUI(player);
    } else if (hasPetsmage && response.selection === 2) {
      showSummonGuardUI(player);
    }
  }).catch(e => {});
}

function showSummonGuardUI(player) {
  const isSitting = player.hasTag("warden_sitting");
  const form = new ActionFormData()
    .title("\xA75Warden Guard Control\xA7r")
    .body("Manage your loyal Warden Guard:\n\nStatus: " + (isSitting ? "\xA7eSITTING (Stationary)\xA7r" : "\xA7aSTANDING & GUARDING\xA7r"))
    .button("✨ Summon / Recall Warden Guard")
    .button(isSitting ? "🟢 Order Warden to STAND" : "🟡 Order Warden to SIT")
    .button("Back");

  form.show(player).then((res) => {
    if (res.canceled || res.selection === void 0) return;
    if (res.selection === 0) {
      handleSummonOrRecallWarden(player);
    } else if (res.selection === 1) {
      if (isSitting) {
        player.removeTag("warden_sitting");
        player.sendMessage("\xA75[Warden Guard]\xA7a Your Warden Guard is now STANDING and guarding you!\xA7r");
      } else {
        player.addTag("warden_sitting");
        player.sendMessage("\xA75[Warden Guard]\xA7e Your Warden Guard is now SITTING. It will stay in place and not attack.\xA7r");
      }
    } else if (res.selection === 2) {
      showSoulShopUI(player);
    }
  }).catch(e => {});
}

function handleSummonOrRecallWarden(player) {
  const cooldownKey = player.id + "_warden_pet_cd";
  const cdTick = COOLDOWNS.get(cooldownKey) ?? 0;
  const rem = cdTick - system8.currentTick;
  
  if (rem > 0) {
    const mcDays = (rem / 24000).toFixed(1);
    const realMins = (rem / 1200).toFixed(1);
    player.sendMessage(`\xA7c[Warden Guard]\xA74 Your Warden Guard was killed! You can summon a new guard in ${mcDays} MC days (${realMins} mins).\xA7r`);
    return;
  }

  const ownerTag = `guard_owner_${player.id}`;
  let existingWarden = undefined;
  try {
    for (const entity of player.dimension.getEntities({ type: "minecraft:warden" })) {
      if (entity.hasTag(ownerTag) && entity.isValid()) {
        existingWarden = entity;
        break;
      }
    }
  } catch (_) {}

  if (existingWarden) {
    existingWarden.teleport(player.location, { dimension: player.dimension });
    try {
      player.dimension.spawnParticle("minecraft:sculk_soul_particle", player.location);
      player.playSound("mob.warden.emerge");
    } catch (_) {}
    player.sendMessage("\xA75[Warden Guard]\xA7a Recalled your Warden Guard directly to your position!\xA7r");
    return;
  }

  player.sendMessage("\xA75[Ritual]\xA7e Performing 5-second ritual to summon your Warden Guard...\xA7r");
  
  let ticksLeft = 100;
  const intervalId = system8.runInterval(() => {
    if (!player.isValid()) {
      system8.clearRun(intervalId);
      return;
    }
    try {
      player.dimension.spawnParticle("minecraft:sculk_soul_particle", player.location);
      if (ticksLeft % 20 === 0) {
        player.playSound("mob.warden.listening");
      }
    } catch (_) {}
    ticksLeft -= 10;
    if (ticksLeft <= 0) {
      system8.clearRun(intervalId);
      if (player.isValid()) {
        const warden = player.dimension.spawnEntity("minecraft:warden", player.location);
        warden.addTag("warden_guard");
        warden.addTag(ownerTag);
        warden.nameTag = `\xA75${player.name}'s Warden Guard\xA7r`;
        try {
          player.playSound("mob.warden.emerge");
          player.dimension.spawnParticle("minecraft:sonic_explosion", player.location);
        } catch (_) {}
        player.sendMessage("\xA75[Warden Guard]\xA7a Your Warden Guard has risen to protect you!\xA7r");
      }
    }
  }, 10);
}
function getShopItemsForClass(classId) {
  let items = [];
  if (classId === 1) items = WarriorShopItems;
  if (classId === 2) items = RangerShopItems;
  if (classId === 3) {
    items = MageShopItems.filter((item) => !item.tag.startsWith("spell_unlocked:"));
  }
  if (classId === 4) items = AssassinShopItems;
  if (classId === 5) items = SurvivorShopItems;
  return items;
}
function showActiveAbilitiesUI(player) {
  const soulsObj = world3.scoreboard.getObjective("souls");
  const classObj = world3.scoreboard.getObjective("class");
  if (!soulsObj || !classObj) return;
  const currentSouls = soulsObj.getScore(player) ?? 0;
  const classId = classObj.getScore(player) ?? 0 /* Unselected */;
  const levelObj = world3.scoreboard.getObjective("level");
  const rpgLevel = levelObj ? levelObj.getScore(player) ?? 1 : 1;
  const shopItems = getShopItemsForClass(classId).filter((i) => i.isActiveAbility);
  const visibleItems = shopItems.filter((i) => !i.requiresTag || player.hasTag(i.requiresTag));
  const form = new ActionFormData().title("Active Abilities").body(`Purchase and Equip active abilities.
Souls: \xA7c${currentSouls}\xA7r | XP Level: \xA7a${player.level}\xA7r
`);
  if (visibleItems.length === 0) {
    form.body("\xA7cThere are currently no active abilities available for your class.");
    form.button("\xA7cBack");
    form.show(player).then(() => showSoulShopUI(player)).catch(e => {});
    return;
  }
  for (const item of visibleItems) {
    const hasPurchased = player.hasTag(item.tag);
    const isEquipped = player.hasTag(`equipped_${item.tag}`);
    if (isEquipped) {
      form.button(`\xA7a[Equipped] ${item.name}`);
    } else if (hasPurchased) {
      form.button(`\xA78[Owned] ${item.name}
\xA7eClick to Equip`);
    } else {
      form.button(`\xA7b${item.name}
\xA78${item.costSouls} Souls | ${item.costXP} XP`);
    }
  }
  form.button("\xA7cBack");
  form.show(player).then((response) => {
    if (response.canceled) return;
    if (response.selection === visibleItems.length) {
      showSoulShopUI(player);
      return;
    }
    const selectedItem = visibleItems[response.selection];
    const hasPurchased = player.hasTag(selectedItem.tag);
    if (hasPurchased) {
      const isEquipped = player.hasTag(`equipped_${selectedItem.tag}`);
      if (isEquipped) {
        player.sendMessage("\xA7cThis ability is already equipped!");
      } else {
        for (const item of shopItems) {
          player.removeTag(`equipped_${item.tag}`);
        }
        player.addTag(`equipped_${selectedItem.tag}`);
        player.sendMessage(`\xA7aSuccessfully equipped: \xA7e${selectedItem.name}`);
        player.playSound("armor.equip_iron");
        if (selectedItem.tag !== "shop_mage_staff") {
          player.sendMessage(ABILITY_USAGE_MESSAGES[selectedItem.tag] || `\xA7eTo use ${selectedItem.name}, crouch and then jump! Make sure to manage your cooldown.\xA7r`);
        }
      }
      return;
    }
    if (currentSouls >= selectedItem.costSouls && player.level >= selectedItem.costXP) {
      soulsObj.setScore(player, currentSouls - selectedItem.costSouls);
      player.addLevels(-selectedItem.costXP);
      if (selectedItem.tag === "shop_assassin_bow") {
        player.addTag(selectedItem.tag);
        giveAssassinBow(player);
        player.sendMessage(`\xA7aSuccessfully purchased: \xA7e${selectedItem.name}`);
        player.sendMessage("\xA7a[System] Your Assassin's Deadly Bow is locked to your inventory, automatically repaired, and restored if lost.");
      } else if (selectedItem.tag === "shop_mage_staff") {
        const eqComp = player.getComponent("minecraft:inventory");
        if (eqComp) {
          const staff = new ItemStack2("rpg:mage_staff", 1);
          staff.keepOnDeath = true;
          staff.lockMode = ItemLockMode2.inventory;
          const enchComp = staff.getComponent("minecraft:enchantable");
          if (enchComp) {
            try {
              enchComp.addEnchantment({ type: EnchantmentTypes.get("vanishing"), level: 1 });
            } catch (e) {
              console.warn(e);
            }
            try {
              enchComp.addEnchantment({ type: EnchantmentTypes.get("binding"), level: 1 });
            } catch (e) {
              console.warn(e);
            }
          }
          giveOrDropItem(player, staff);
        }
        player.addTag(selectedItem.tag);
        player.sendMessage(`\xA7aSuccessfully purchased: \xA7eMage Staff`);

      } else {
        player.addTag(selectedItem.tag);
        player.sendMessage(`\xA7aSuccessfully purchased: \xA7e${selectedItem.name}`);
        player.sendMessage(`\xA7bUsage: \xA7f${selectedItem.description.replace(/^Passive: |^Active: /g, "")}`);
        if (selectedItem.isActiveAbility) {
          const allShopItems = getShopItemsForClass(classObj.getScore(player) ?? 0);
          for (const item of allShopItems) {
            if (item.isActiveAbility) {
              player.removeTag(`equipped_${item.tag}`);
            }
          }
          player.addTag(`equipped_${selectedItem.tag}`);
          player.sendMessage(`\xA7aAuto-equipped active ability: \xA7e${selectedItem.name}`);
        }
      }
      player.playSound("random.levelup");
    } else {
      player.sendMessage(`\xA7cNot enough resources! You need ${selectedItem.costSouls} Souls and ${selectedItem.costXP} XP Levels.`);
      player.playSound("note.bass");
    }
  }).catch(e => {});
}
function showBuyBuffsUI(player) {
  const soulsObj = world3.scoreboard.getObjective("souls");
  const classObj = world3.scoreboard.getObjective("class");
  if (!soulsObj || !classObj) return;
  const currentSouls = soulsObj.getScore(player) ?? 0;
  const classId = classObj.getScore(player) ?? 0 /* Unselected */;
  const levelObj = world3.scoreboard.getObjective("level");
  const rpgLevel = levelObj ? levelObj.getScore(player) ?? 1 : 1;
  const shopItems = getShopItemsForClass(classId).filter((i) => !i.isActiveAbility && (!i.requiresTag || player.hasTag(i.requiresTag)));
  const form = new ActionFormData().title("Passive Abilities").body(`Purchase new passive abilities specific to your class.
Souls: \xA7c${currentSouls}\xA7r | XP Level: \xA7a${player.level}\xA7r
`);
  if (shopItems.length === 0) {
    form.body("\xA7cThere are currently no base items available for your class.");
    form.button("\xA7cBack");
    form.show(player).then(() => showSoulShopUI(player)).catch(e => {});
    return;
  }
  for (const item of shopItems) {
    const hasPurchased = player.hasTag(item.tag);
    const locked = item.unlockLevel && rpgLevel < item.unlockLevel;
    if (hasPurchased) {
      form.button(`\xA78[Owned] ${item.name}`);
    } else if (locked) {
      form.button(`\xA78[Locked - Lv ${item.unlockLevel}]
${item.name}`);
    } else {
      form.button(`\xA72${item.name}
\xA78${item.costSouls} Souls | ${item.costXP} XP`);
    }
  }
  form.button("\xA7cBack");
  form.show(player).then((response) => {
    if (response.canceled) return;
    if (response.selection === shopItems.length) {
      showSoulShopUI(player);
      return;
    }
    const selectedItem = shopItems[response.selection];
    if (selectedItem.tag !== "shop_assassin_bow" && selectedItem.tag !== "shop_mage_staff" && player.hasTag(selectedItem.tag)) {
      const offTag = `${selectedItem.tag}_off`;
      if (player.hasTag(offTag)) {
        player.removeTag(offTag);
        player.sendMessage(`\xA7aEnabled passive ability: \xA7e${selectedItem.name}`);
      } else {
        player.addTag(offTag);
        player.sendMessage(`\xA7cDisabled passive ability: \xA7e${selectedItem.name}`);
      }
      player.playSound("random.orb");
      return;
    }
    if (selectedItem.unlockLevel && rpgLevel < selectedItem.unlockLevel) {
      player.sendMessage(`\xA7cThis ability unlocks at RPG Level ${selectedItem.unlockLevel}!`);
      return;
    }
    if (currentSouls >= selectedItem.costSouls && player.level >= selectedItem.costXP) {
      soulsObj.setScore(player, currentSouls - selectedItem.costSouls);
      player.addLevels(-selectedItem.costXP);
      if (selectedItem.tag === "shop_assassin_bow") {
        player.addTag(selectedItem.tag);
        giveAssassinBow(player);
        player.sendMessage(`\xA7aSuccessfully purchased: \xA7e${selectedItem.name}`);
        player.sendMessage("\xA7a[System] Your Assassin's Deadly Bow is locked to your inventory, automatically repaired, and restored if lost.");
      } else {
        player.addTag(selectedItem.tag);
        grantTimedSkillRewardImmediately(player, selectedItem.tag);
        player.sendMessage(`\xA7aSuccessfully purchased: \xA7e${selectedItem.name}`);
        player.sendMessage(`\xA7bUsage: \xA7f${selectedItem.description.replace(/^Passive: |^Active: /g, "")}`);
      }
      player.playSound("random.levelup");
    } else {
      player.sendMessage(`\xA7cNot enough resources! You need ${selectedItem.costSouls} Souls and ${selectedItem.costXP} XP Levels.`);
      player.playSound("note.bass");
    }
  }).catch(e => {});
}

// src/systems/leveling.ts
var XP_REQUIREMENTS = [
  3,
  5,
  7,
  8,
  10,
  13,
  16,
  20,
  23,
  27,
  32,
  36,
  40,
  44,
  48,
  52,
  56,
  60,
  65,
  70
];
function getLevelRequirement(targetLevel) {
  if (targetLevel > 20) return { xpLevel: 999, souls: 99999 };
  const xpReq = XP_REQUIREMENTS[targetLevel - 2] || 999;
  return {
    xpLevel: xpReq,
    souls: xpReq * 5
    // Set Soul requirements manually to 5x the XP cost
  };
}
function levelUp(player, newLevel, classId) {
  const levelObj = world4.scoreboard.getObjective("level");
  if (!levelObj) return;
  levelObj.setScore(player, newLevel);
  player.sendMessage(`\xA7a\xA7lLEVEL UP! \xA7r\xA7aYou are now RPG Level \xA7e${newLevel}\xA7a!`);
  let earnedPerks = 1;
  if (newLevel <= 7) {
    earnedPerks = 1;
  } else if (newLevel <= 15) {
    earnedPerks = 1.5;
  } else {
    earnedPerks = 2;
  }
  player.sendMessage(`\xA7b[Skill Tree] \xA7fYou earned \xA7e+${earnedPerks} Perk Point(s)\xA7f! Open your Skill Tree to spend it.`);
  player.playSound("random.levelup");
  const shopItems = getShopItemsForClass(classId);
  let unlockedItems = [];
  for (const item of shopItems) {
    if (item.unlockLevel === newLevel) {
      unlockedItems.push(item.name);
    }
  }
  if (unlockedItems.length > 0) {
    player.sendMessage(`\xA7d[Soul Shop] \xA7fNew abilities unlocked: \xA7e${unlockedItems.join(", ")}`);
  }
  applyBuffs(player, newLevel, classId);
}
function giveItem(player, typeId, amount = 1, enchants, keepAndLock = false) {
  try {
    const inv = player.getComponent("minecraft:inventory");
    if (!inv || !inv.container) return;
    if (keepAndLock) {
      let hasItem = false;
      for (let i = 0; i < inv.container.size; i++) {
        const existing = inv.container.getItem(i);
        if (existing && existing.typeId.startsWith(typeId)) {
          hasItem = true;
          break;
        }
      }
      if (hasItem) return;
    }
    const item = new ItemStack3(typeId, amount);
    if (enchants) {
      const enchantable = item.getComponent("minecraft:enchantable");
      if (enchantable) {
        for (const [key, level] of Object.entries(enchants)) {
          const type = EnchantmentTypes2.get(key);
          if (type) {
            enchantable.addEnchantment({ type, level });
          }
        }
      }
    }
    if (keepAndLock) {
      item.keepOnDeath = true;
    }
    giveOrDropItem(player, item);
  } catch (e) {
    player.sendMessage("\xA7cError giving item: " + typeId);
  }
}
function applyTempEffect(player, effectId, durationTicks, amplifier) {
  const formattedEffect = effectId.startsWith("minecraft:") ? effectId : `minecraft:${effectId}`;
  safeAddEffect(player, formattedEffect, durationTicks, { amplifier, showParticles: true });
}
var min30 = 36e3;
var min10 = 12e3;
var min2 = 2400;
var unbreaking1 = { unbreaking: 1 };

var CLASS_LEVEL_REWARDS = {
  // Class 1: Warrior
  1: {
    1: { items: [["minecraft:wooden_sword"], ["minecraft:leather_chestplate"]], msg: "\xA7e[System] Granted starter gear!" },
    2: { effects: [["speed", min2, 0], ["strength", min2, 0]], msg: "\xA7e[System] Temporary boosts granted for 2 minutes!" },
    3: { items: [["minecraft:chainmail_chestplate"], ["minecraft:stone_sword", 2]], msg: "\xA7e[System] Granted new gear!" },
    4: { msg: "\xA7e[System] You reached Level 4!" },
    5: { items: [["minecraft:iron_chestplate"], ["minecraft:iron_sword"], ["minecraft:iron_axe"]], msg: "\xA7a[Rank Up] \xA7eNewbie to Big One! Iron gear granted." },
    6: { items: [["minecraft:iron_sword"]], msg: "\xA7e[System] You received the Iron Broadsword!" },
    7: { msg: "\xA7e[System] You reached Level 7!" },
    8: { items: [["minecraft:iron_helmet", 1, unbreaking1], ["minecraft:iron_chestplate", 1, unbreaking1], ["minecraft:iron_leggings", 1, unbreaking1], ["minecraft:iron_boots", 1, unbreaking1], ["minecraft:iron_sword", 1, { sharpness: 3 }]], msg: "\xA7e[System] Granted Enchanted Iron gear!" },
    9: { effects: [["resistance", min30, 1], ["strength", min30, 1], ["health_boost", min30, 2], ["fire_resistance", min2, 0]], msg: "\xA7e[System] Level 9 Boosts granted!" },
    10: { items: [["minecraft:diamond_chestplate", 1, { unbreaking: 3 }], ["minecraft:diamond_sword"]], msg: "\xA7a[Rank Up] \xA7eGranted Diamond gear!" },
    11: { items: [["minecraft:diamond_sword", 1, { sharpness: 4 }]], effects: [["strength", min10, 2], ["speed", min10, 1], ["resistance", min10, 1], ["health_boost", min10, 4]], msg: "\xA7e[System] Granted powerful sword and 10min boosts!" },
    12: { items: [["minecraft:iron_axe"], ["minecraft:diamond_chestplate", 1, { protection: 4, unbreaking: 3, thorns: 3, mending: 1 }]], msg: "\xA7e[System] Granted Master Diamond Chestplate and Steel Waraxe!" },
    13: { items: [["minecraft:diamond_sword", 1, { sharpness: 5, looting: 3, unbreaking: 3, mending: 1, fire_aspect: 2 }]], effects: [["strength", min10, 1]], msg: "\xA7e[System] Granted Master Diamond Sword!" },
    14: { effects: [["resistance", min30, 1], ["strength", min30, 1], ["health_boost", min30, 2], ["fire_resistance", min2, 0]], msg: "\xA7e[System] Rank Up Boosts granted!" },
    15: { msg: "\xA7e[System] You reached Level 15!" },
    16: { items: [["minecraft:diamond_sword"]], msg: "\xA7e[System] Granted Dragonbone Greatsword!" },
    17: { items: [["minecraft:netherite_ingot", 3]], effects: [["resistance", min30, 1], ["strength", min30, 1], ["health_boost", min30, 2], ["fire_resistance", min2, 0]], msg: "\xA7e[System] Granted Netherite and 30min boosts!" },
    18: { effects: [["resistance", min30, 1], ["strength", min30, 1], ["fire_resistance", min2, 0]], msg: "\xA7e[System] Rank Up Boosts granted!" },
    20: { msg: "\xA7e[System] Maximum level reached! Congratulations, Warrior!" },
  },
  // Class 2: Ranger
  2: {
    1: { items: [["minecraft:arrow", 32], ["minecraft:leather_helmet"], ["minecraft:leather_chestplate"]], bow: 1, msg: "\xA7e[System] Granted Ranger starter gear! \xA76Ranger Bow\xA7e locked to inventory." },
    2: { effects: [["speed", min2, 1]], msg: "\xA7e[System] Temporary boosts granted for 2 minutes!" },
    3: { items: [["minecraft:arrow", 64]], msg: "\xA7e[System] Granted arrows!" },
    4: { msg: "\xA7e[System] You reached Level 4!" },
    5: { items: [["minecraft:chainmail_helmet"], ["minecraft:chainmail_chestplate"], ["minecraft:chainmail_leggings"], ["minecraft:chainmail_boots"]], msg: "\xA7a[Rank Up] \xA7eGranted Chainmail gear." },
    6: { items: [["minecraft:bow"], ["minecraft:bow", 1, { power: 1 }], ["minecraft:arrow", 64]], msg: "\xA7e[System] Granted Enchanted Bow and Hunter's Longbow!" },
    7: { bow: 7, msg: "\xA7e[System] \xA76Ranger Bow upgraded to Power IV!" },
    8: { items: [["minecraft:iron_helmet"], ["minecraft:iron_chestplate"], ["minecraft:iron_leggings"], ["minecraft:iron_boots"]], msg: "\xA7e[System] Granted Iron armor!" },
    9: { items: [["minecraft:bow", 1, { power: 2, punch: 1 }], ["minecraft:arrow", 64]], msg: "\xA7e[System] Granted Power II Bow!" },
    10: { items: [["minecraft:crossbow"], ["minecraft:arrow", 64]], effects: [["speed", min10, 2]], msg: "\xA7a[Rank Up] \xA7eGranted Crossbow!" },
    11: { items: [["minecraft:crossbow", 1, { quick_charge: 2, piercing: 2 }]], msg: "\xA7e[System] Granted Enchanted Crossbow!" },
    12: { items: [["minecraft:crossbow"], ["minecraft:diamond_helmet", 1, { unbreaking: 2 }], ["minecraft:diamond_boots", 1, { unbreaking: 2 }]], msg: "\xA7e[System] Granted Diamond armor and Phantom Crossbow!" },
    13: { items: [["minecraft:crossbow", 1, { quick_charge: 3, multishot: 1, unbreaking: 3 }]], msg: "\xA7e[System] Granted Master Crossbow!" },
    14: { effects: [["speed", min30, 2], ["jump_boost", min30, 1]], msg: "\xA7e[System] Rank Up Boosts granted!" },
    15: { bow: 15, msg: "\xA7e[System] \xA76Ranger Bow upgraded to MAX (Power V + Flame + Infinity)!" },
    16: { items: [["minecraft:bow"], ["minecraft:bow", 1, { power: 5, flame: 1, unbreaking: 3, infinity: 1 }], ["minecraft:arrow", 1]], msg: "\xA7e[System] Granted Master Bow and Stormcaller Bow!" },
    17: { effects: [["strength", min30, 1], ["regeneration", min30, 0]], msg: "\xA7e[System] 30min Boosts granted!" },
    18: { msg: "\xA7e[System] You reached Level 18!" },
    20: { msg: "\xA7e[System] Maximum level reached! Congratulations, Ranger!" },
  },
  // Class 3: Mage
  3: {
    1: { items: [["minecraft:leather_helmet"], ["minecraft:leather_chestplate"]] },
    2: { effects: [["speed", min2, 0]], msg: "\xA7e[System] Temporary boosts granted for 2 minutes!" },
    3: { msg: "\xA7e[System] You reached Level 3!" },
    4: { items: [["minecraft:chainmail_helmet"], ["minecraft:chainmail_chestplate"], ["minecraft:chainmail_leggings"], ["minecraft:chainmail_boots"]], msg: "\xA7e[System] Granted Chainmail armor." },
    5: { msg: "\xA7a[Rank Up] \xA7eSpell unlocked: \xA7bIce Spike\xA7e!" },
    6: { effects: [["speed", min30, 1], ["regeneration", min30, 0]], msg: "\xA7e[System] Temporary boosts granted for 30 minutes!" },
    7: { msg: "\xA7e[System] You reached Level 7!" },
    8: { items: [["minecraft:iron_helmet", 1, { protection: 1 }], ["minecraft:iron_boots", 1, { protection: 1 }]], msg: "\xA7e[System] Granted Enchanted Iron armor!" },
    9: { msg: "\xA7e[System] You reached Level 9!" },
    10: { items: [["minecraft:diamond_helmet"], ["minecraft:diamond_boots"]], msg: "\xA7e[System] Granted Diamond armor and Poison Cloud spell!" },
    11: { effects: [["speed", min10, 2], ["regeneration", min10, 1]], msg: "\xA7e[System] Granted 10min boosts!" },
    12: { msg: "\xA7e[System] You reached Level 12!" },
    13: { msg: "\xA7e[System] You reached Level 13!" },
    14: { effects: [["speed", min30, 2], ["resistance", min30, 1]], msg: "\xA7e[System] Rank Up Boosts granted!" },
    15: { msg: "\xA7e[System] Lightning Strike spell unlocked!" },
    16: { items: [["minecraft:netherite_ingot", 2]], msg: "\xA7e[System] Granted Netherite!" },
    17: { msg: "\xA7e[System] You reached Level 17!" },
    18: { msg: "\xA7e[System] You reached Level 18!" },
    20: { msg: "\xA7e[System] Maximum level reached! Wither Blast unlocked!" },
  },
  // Class 4: Assassin
  4: {
    1: { items: [["minecraft:stone_sword", 2], ["minecraft:leather_boots"]], msg: "\xA7e[System] Granted Assassin starter gear!" },
    2: { effects: [["speed", min2, 1]], msg: "\xA7e[System] Temporary boosts granted for 2 minutes!" },
    3: { msg: "\xA7e[System] You reached Level 3!" },
    4: { items: [["minecraft:iron_sword", 2]], msg: "\xA7e[System] Granted Iron Swords!" },
    5: { items: [["minecraft:iron_helmet"], ["minecraft:iron_boots"]], msg: "\xA7a[Rank Up] \xA7eGranted Iron armor." },
    6: { items: [["minecraft:iron_sword"], ["minecraft:iron_sword", 1, { sharpness: 2 }]], msg: "\xA7e[System] Granted Enchanted Sword and Shadow Dagger!" },
    7: { msg: "\xA7e[System] You reached Level 7!" },
    8: { effects: [["invisibility", min30, 0], ["strength", min30, 1]], msg: "\xA7e[System] Granted 30min Stealth boosts!" },
    9: { items: [["minecraft:diamond_sword"]], msg: "\xA7e[System] Granted Diamond Sword!" },
    10: { items: [["minecraft:diamond_boots", 1, { feather_falling: 4 }]], msg: "\xA7a[Rank Up] \xA7eGranted Feather Falling boots!" },
    11: { items: [["minecraft:diamond_sword", 1, { sharpness: 3, fire_aspect: 1 }]], msg: "\xA7e[System] Granted Enchanted Diamond Sword!" },
    12: { items: [["minecraft:diamond_sword"]], msg: "\xA7e[System] Granted Venom Twinblade!" },
    13: { items: [["minecraft:diamond_sword", 1, { sharpness: 5, looting: 3, unbreaking: 3 }]], msg: "\xA7e[System] Granted Master Diamond Sword!" },
    14: { effects: [["strength", min30, 2], ["speed", min30, 2]], msg: "\xA7e[System] Rank Up Burst Boosts granted!" },
    15: { msg: "\xA7e[System] You reached Level 15!" },
    16: { items: [["minecraft:netherite_sword"], ["minecraft:netherite_ingot", 2]], msg: "\xA7e[System] Granted Netherite and Eclipse Karambit!" },
    17: { effects: [["strength", min10, 3]], msg: "\xA7e[System] 10min Extreme Strength granted!" },
    18: { msg: "\xA7e[System] You reached Level 18!" },
    20: { msg: "\xA7e[System] Maximum level reached! Congratulations, Assassin!" },
  },
  // Class 5: Survivor
  5: {
    1: { items: [["minecraft:stone_pickaxe"], ["minecraft:stone_axe"], ["minecraft:leather_helmet"], ["minecraft:leather_chestplate"]], msg: "\xA7e[System] Granted Survivor starter gear!" },
    2: { effects: [["resistance", min2, 0]], msg: "\xA7e[System] Temporary boosts granted for 2 minutes!" },
    3: { msg: "\xA7e[System] You reached Level 3!" },
    4: { items: [["minecraft:shield"]], msg: "\xA7e[System] Granted Shield!" },
    5: { items: [["minecraft:iron_chestplate"], ["minecraft:iron_leggings"]], msg: "\xA7a[Rank Up] \xA7eGranted Iron armor." },
    6: { items: [["minecraft:iron_sword"]], msg: "\xA7e[System] Granted Iron Broadsword!" },
    7: { msg: "\xA7e[System] You reached Level 7!" },
    8: { items: [["minecraft:iron_helmet", 1, { protection: 2 }], ["minecraft:iron_boots", 1, { protection: 2 }]], msg: "\xA7e[System] Granted Enchanted Iron armor!" },
    9: { items: [["minecraft:diamond_chestplate"]], msg: "\xA7e[System] Granted Diamond Chestplate!" },
    10: { items: [["minecraft:shield", 1, { unbreaking: 3 }]], msg: "\xA7a[Rank Up] \xA7eGranted Enchanted Shield!" },
    11: { effects: [["invisibility", min30, 0]], msg: "\xA7e[System] Granted 30min Invisibility!" },
    12: { items: [["minecraft:iron_axe"]], msg: "\xA7e[System] Granted Steel Waraxe!" },
    13: { items: [["minecraft:diamond_chestplate", 1, { protection: 4, unbreaking: 3 }], ["minecraft:diamond_leggings", 1, { protection: 4, unbreaking: 3 }]], msg: "\xA7e[System] Granted Master Diamond Armor!" },
    14: { effects: [["regeneration", min30, 0], ["resistance", min30, 1]], msg: "\xA7e[System] Rank Up Defense Boosts granted!" },
    15: { msg: "\xA7e[System] You reached Level 15!" },
    16: { items: [["minecraft:diamond_sword"]], msg: "\xA7e[System] Granted Dragonbone Greatsword!" },
    17: { effects: [["health_boost", min30, 4]], msg: "\xA7e[System] 30min Max Health boosts granted!" },
    18: { msg: "\xA7e[System] You reached Level 18!" },
    20: { msg: "\xA7e[System] Maximum level reached! Congratulations, Survivor!" },
  },
};

function applyBuffs(player, level, classId) {
  if (level === 19) {
    player.sendMessage("\xA7c[System] Boss unlocked to fight! Check your RPG Guide.");
  }
  const reward = CLASS_LEVEL_REWARDS[classId]?.[level];
  if (reward) {
    if (reward.items) {
      for (const itemArgs of reward.items) {
        giveItem(player, itemArgs[0], itemArgs[1] || 1, itemArgs[2], itemArgs[3] || false);
      }
    }
    if (reward.effects) {
      for (const effArgs of reward.effects) {
        applyTempEffect(player, effArgs[0], effArgs[1], effArgs[2] || 0);
      }
    }
    if (reward.bow) {
      giveRangerBow(player, reward.bow);
    }
    if (reward.msg) {
      player.sendMessage(reward.msg);
    }
  }
  if (classId === 3) {
    syncMageStaffName(player, level);
  }
}

function giveRangerBow(player, level, dropIfFull = true) {
  const inv = player.getComponent("minecraft:inventory");
  if (!inv || !inv.container) return;
  for (let i = 0; i < inv.container.size; i++) {
    const ex = inv.container.getItem(i);
    if (ex && ex.nameTag === "\xA76Ranger Bow") {
      try { inv.container.setItem(i); } catch (e) { try { inv.container.setItem(i, undefined); } catch(e2) {} }
    }
  }
  const enchants = level >= 15 ? { power: 5, flame: 1, infinity: 1, unbreaking: 3, punch: 2 } : level >= 7 ? { power: 4, unbreaking: 3, punch: 1 } : { power: 1, unbreaking: 2 };
  try {
    const bow = new ItemStack3("minecraft:bow", 1);
    bow.nameTag = "\xA76Ranger Bow";
    bow.keepOnDeath = true;
    bow.lockMode = ItemLockMode3.inventory;
    const enc = bow.getComponent("minecraft:enchantable");
    if (enc) {
      for (const [k, lv] of Object.entries(enchants)) {
        const t = EnchantmentTypes2.get(k);
        if (t) try {
          enc.addEnchantment({ type: t, level: lv });
        } catch (_) {
          console.warn(_);
        }
      }
    }
    try {
      const enchComp = bow.getComponent("minecraft:enchantable");
      if (enchComp) {
        enchComp.addEnchantment({ type: EnchantmentTypes2.get("vanishing"), level: 1 });
        enchComp.addEnchantment({ type: EnchantmentTypes2.get("binding"), level: 1 });
      }
    } catch (e) {
      console.warn(e);
    }
    const leftover = inv.container.addItem(bow);
    if (leftover && dropIfFull) {
      player.dimension.spawnItem(leftover, player.location);
    }
  } catch (e) {
    player.sendMessage("\xA7c[Error] Could not create Ranger Bow.");
  }
}
function maintainRangerBow(player, level, allowRecovery = false) {
  const inv = player.getComponent("minecraft:inventory");
  if (!inv || !inv.container) return;
  let foundRangerBow = false;
  for (let i = 0; i < inv.container.size; i++) {
    const item = inv.container.getItem(i);
    if (!item || item.typeId !== "minecraft:bow" || item.nameTag !== "\xA76Ranger Bow") continue;
    foundRangerBow = true;
    const durability = item.getComponent("minecraft:durability");
    if (durability && durability.damage > 0) {
      durability.damage = 0;
      inv.container.setItem(i, item);
    }
  }
  const equippable = player.getComponent("minecraft:equippable");
  if (equippable) {
    const offhand = equippable.getEquipment("Offhand");
    if (offhand && offhand.typeId === "minecraft:bow" && offhand.nameTag === "\xA76Ranger Bow") {
      foundRangerBow = true;
      const durability = offhand.getComponent("minecraft:durability");
      if (durability && durability.damage > 0) {
        durability.damage = 0;
        equippable.setEquipment("Offhand", offhand);
      }
    }
  }
  if (!foundRangerBow && allowRecovery) {
    giveRangerBow(player, level);
    player.sendMessage("\xA7a[System] Your Ranger Bow was restored for your current level.");
  }
}
function giveAssassinBow(player, dropIfFull = true) {
  const inv = player.getComponent("minecraft:inventory");
  if (!inv || !inv.container) return;
  for (let i = 0; i < inv.container.size; i++) {
    const existing = inv.container.getItem(i);
    if (existing && existing.typeId === "minecraft:bow" && existing.nameTag === "\xA75Assassin's Deadly Bow") {
      inv.container.setItem(i, void 0);
    }
  }
  try {
    const bow = new ItemStack3("minecraft:bow", 1);
    bow.nameTag = "\xA75Assassin's Deadly Bow";
    bow.keepOnDeath = true;
    bow.lockMode = ItemLockMode3.inventory;
    const enchComp = bow.getComponent("minecraft:enchantable");
    if (enchComp) {
      const power = EnchantmentTypes2.get("power");
      const unbreaking = EnchantmentTypes2.get("unbreaking");
      if (power) enchComp.addEnchantment({ type: power, level: 4 });
      if (unbreaking) enchComp.addEnchantment({ type: unbreaking, level: 3 });
    }
    const leftover = inv.container.addItem(bow);
    if (leftover && dropIfFull) {
      player.dimension.spawnItem(leftover, player.location);
    }
  } catch (e) {
    player.sendMessage("\xA7c[Error] Could not create Assassin's Deadly Bow.");
    console.warn(e);
  }
}
function maintainAssassinBow(player, allowRecovery = false) {
  const inv = player.getComponent("minecraft:inventory");
  if (!inv || !inv.container) return;
  let foundBow = false;
  for (let i = 0; i < inv.container.size; i++) {
    const item = inv.container.getItem(i);
    if (!item || item.typeId !== "minecraft:bow" || item.nameTag !== "\xA75Assassin's Deadly Bow") continue;
    foundBow = true;
    const durability = item.getComponent("minecraft:durability");
    if (durability && durability.damage > 0) {
      durability.damage = 0;
      inv.container.setItem(i, item);
    }
  }
  const equippable = player.getComponent("minecraft:equippable");
  if (equippable) {
    const offhand = equippable.getEquipment("Offhand");
    if (offhand && offhand.typeId === "minecraft:bow" && offhand.nameTag === "\xA75Assassin's Deadly Bow") {
      foundBow = true;
      const durability = offhand.getComponent("minecraft:durability");
      if (durability && durability.damage > 0) {
        durability.damage = 0;
        equippable.setEquipment("Offhand", offhand);
      }
    }
  }
  if (!foundBow && allowRecovery) {
    giveAssassinBow(player);
    player.sendMessage("\xA7a[System] Your Assassin's Deadly Bow was restored.");
  }
}
// src/systems/boss.ts
import { system as system3, world as world5 } from "@minecraft/server";
import { ActionFormData as ActionFormData2 } from "@minecraft/server-ui";
var BOSS_COOLDOWN_TICKS = 20 * 60 * 5;
var spawnCooldowns = /* @__PURE__ */ new Map();
function showBossWarningUI(player) {
  const cd = spawnCooldowns.get(player.id) ?? 0;
  if (system3.currentTick < cd) {
    player.sendMessage(`\xA7cYou cannot summon the boss again yet! Wait a few minutes.`);
    return;
  }
  const form = new ActionFormData2().title("\u2620 Boss Fight \u2620").body("Are you ready to fight the boss? Be careful! It is extremely dangerous.").button("\xA7cFight Boss").button("\xA77Back");
  form.show(player).then((response) => {
    if (response.canceled) return;
    if (response.selection === 0) {
      startBossSequence(player);
    }
  }).catch(e => {});
}
function startBossSequence(player) {
  spawnCooldowns.set(player.id, system3.currentTick + BOSS_COOLDOWN_TICKS);
  player.sendMessage("\xA74[System] The boss will arrive in 7 seconds!");
  player.playSound("ambient.weather.thunder");
  let secondsLeft = 7;
  const interval = system3.runInterval(() => {
    if (!player.isValid()) {
      system3.clearRun(interval);
      return;
    }
    if (secondsLeft > 0) {
      player.onScreenDisplay.setTitle(`\xA7c${secondsLeft}`, { fadeInDuration: 0, stayDuration: 20, fadeOutDuration: 0 });
      player.playSound("note.harp");
      player.dimension.spawnParticle("minecraft:large_explosion", player.location);
      secondsLeft--;
    } else {
      system3.clearRun(interval);
      spawnWardenBoss(player);
    }
  }, 20);
}
function spawnWardenBoss(player) {
  if (!player.isValid()) return;
  player.onScreenDisplay.setTitle("\xA74FIGHT!");
  player.playSound("mob.enderdragon.growl");
  const spawnLoc = {
    x: player.location.x + (Math.random() * 4 - 2),
    y: player.location.y,
    z: player.location.z + (Math.random() * 4 - 2)
  };
  const warden = player.dimension.spawnEntity("minecraft:warden", spawnLoc);
  warden.nameTag = "\xA74\u2620 Awakened Warden \u2620";
  const duration = 1e6;
  warden.addEffect("minecraft:speed", duration, { amplifier: 1, showParticles: true });
  warden.addEffect("minecraft:regeneration", duration, { amplifier: 0, showParticles: false });
  warden.addEffect("minecraft:health_boost", duration, { amplifier: 10, showParticles: false });
  warden.addEffect("minecraft:strength", duration, { amplifier: 2, showParticles: true });
  warden.addEffect("minecraft:resistance", duration, { amplifier: 1, showParticles: false });
  warden.addEffect("minecraft:fire_resistance", duration, { amplifier: 0, showParticles: false });
  system3.runTimeout(() => {
    if (warden.isValid()) {
      warden.addEffect("minecraft:instant_health", 20, { amplifier: 20, showParticles: false });
    }
  }, 5);
  world5.sendMessage("\xA74[Boss] The Awakened Warden has been summoned!");
}

// src/systems/skills.ts
import { world as world6, system as system4 } from "@minecraft/server";
import { ActionFormData as ActionFormData3 } from "@minecraft/server-ui";
var warriorUiNodes = [
  { id: "sword", path: "middle", level: 1 },
  { id: "assasin", path: "left", level: 1 },
  { id: "healthmet", path: "right", level: 1 },
  { id: "heart", path: "left", level: 2 },
  { id: "armour", path: "left", level: 3 },
  { id: "strength", path: "right", level: 2 },
  { id: "groundsmash", path: "right", level: 3 },
  { id: "unbreakable_sword", path: "middle", level: 2 },
  { id: "dual_sword", path: "left", level: 4 },
  { id: "smash", path: "left", level: 5 },
  { id: "attack_strength", path: "middle", level: 3 },
  { id: "shield", path: "right", level: 4 },
  { id: "fire_slash", path: "right", level: 5 }
];
var rangerUiNodes = [
  { id: "agility", path: "middle", level: 1 },
  { id: "firearrow", path: "left", level: 1 },
  { id: "poisonarrow", path: "right", level: 1 },
  { id: "map", path: "left", level: 2 },
  { id: "arrowsunlimi", path: "left", level: 3 },
  { id: "hearts", path: "right", level: 2 },
  { id: "rapidarrow", path: "right", level: 3 },
  { id: "aim", path: "middle", level: 2 },
  { id: "deadarrow", path: "left", level: 4 },
  { id: "immunearrow", path: "left", level: 5 },
  { id: "archersafe", path: "middle", level: 3 },
  { id: "explosion", path: "right", level: 4 },
  { id: "armour", path: "right", level: 5 }
];
var mageUiNodes = [
  { id: "magestaff", path: "middle", level: 1 },
  { id: "fireball", path: "left", level: 1 },
  { id: "frost", path: "right", level: 1 },
  { id: "manashield", path: "left", level: 2 },
  { id: "lightning", path: "left", level: 3 },
  { id: "hypnosis", path: "right", level: 2 },
  { id: "ice", path: "right", level: 3 },
  { id: "enchantment", path: "middle", level: 2 },
  { id: "mageshoot", path: "left", level: 4 },
  { id: "effectmage", path: "left", level: 5 },
  { id: "magicslash", path: "middle", level: 3 },
  { id: "petsmage", path: "right", level: 4 },
  { id: "invisibility", path: "right", level: 5 }
];
var assassinUiNodes = [
  { id: "speed", path: "middle", level: 1 },
  { id: "dagger", path: "left", level: 1 },
  { id: "silence", path: "right", level: 1 },
  { id: "critical", path: "left", level: 2 },
  { id: "bow", path: "left", level: 3 },
  { id: "blind", path: "right", level: 2 },
  { id: "lethal", path: "right", level: 3 },
  { id: "poison", path: "middle", level: 2 },
  { id: "shadow", path: "left", level: 4 },
  { id: "hearts", path: "left", level: 5 },
  { id: "arrow", path: "middle", level: 3 },
  { id: "disharm", path: "right", level: 4 },
  { id: "instantkill", path: "right", level: 5 }
];
var survivorUiNodes = [
  { id: "boot", path: "middle", level: 1 },
  { id: "map", path: "left", level: 1 },
  { id: "healing", path: "right", level: 1 },
  { id: "thrones", path: "left", level: 2 },
  { id: "dash", path: "left", level: 3 },
  { id: "medkit", path: "right", level: 2 },
  { id: "safety", path: "right", level: 3 },
  { id: "backup", path: "middle", level: 2 },
  { id: "hide", path: "left", level: 4 },
  { id: "effect", path: "left", level: 5 },
  { id: "speedboost", path: "middle", level: 3 },
  { id: "vision", path: "right", level: 4 },
  { id: "lock", path: "right", level: 5 }
];
function getUiNodes(classId) {
  if (classId === 2 /* Ranger */) return rangerUiNodes;
  if (classId === 3 /* Mage */) return mageUiNodes;
  if (classId === 4 /* Assassin */) return assassinUiNodes;
  if (classId === 5 /* Survivor */) return survivorUiNodes;
  return warriorUiNodes;
}
function getPathLevel(player, path) {
  const tags = player.getTags();
  let maxLvl = 0;
  for (const tag of tags) {
    if (tag.startsWith(`path_${path}_`)) {
      const lvl = parseInt(tag.split("_").pop() || "0", 10);
      if (lvl > maxLvl) maxLvl = lvl;
    }
  }
  return maxLvl;
}
var skillCosts = {
  "middle_1": 1,
  "left_1": 2,
  "right_1": 2,
  "left_2": 2,
  "left_3": 2,
  "right_2": 2,
  "right_3": 2,
  "middle_2": 3,
  "middle_3": 3,
  "left_4": 3,
  "left_5": 3,
  "right_4": 3,
  "right_5": 3
};
function getCost(path, level) {
  return skillCosts[`${path}_${level}`] ?? 1;
}
function getTotalPointsSpent(player) {
  let total = 0;
  const leftLvl = getPathLevel(player, "left");
  const rightLvl = getPathLevel(player, "right");
  const middleLvl = getPathLevel(player, "middle");
  for (let i = 1; i <= leftLvl; i++) total += getCost("left", i);
  for (let i = 1; i <= rightLvl; i++) total += getCost("right", i);
  for (let i = 1; i <= middleLvl; i++) total += getCost("middle", i);
  return total;
}
function getSkillPoints(player) {
  const levelObj = world6.scoreboard.getObjective("level");
  const level = levelObj?.getScore(player) ?? 1;
  const classObj = world6.scoreboard.getObjective("class");
  const classId = classObj?.getScore(player) ?? 0;
  let totalEarned = 0;
  for (let i = 1; i <= level; i++) {
    if (i <= 7) {
      totalEarned += 1;
    } else if (i <= 15) {
      totalEarned += 1.5;
    } else {
      totalEarned += 2;
    }
  }
  // Completion bonus: every class receives the final 2 skill points at level 20.
  if (level >= 20) {
    totalEarned += 2;
  }
  return totalEarned - getTotalPointsSpent(player);
}
function spawnSkillTreeUI(player) {
  const classObj = world6.scoreboard.getObjective("class");
  if (!classObj) return;
  const classId = classObj.getScore(player) ?? 0;
  if (classId === 0) return;
  const availablePoints = getSkillPoints(player);
  player.sendMessage(`\xA7e[Skill Tree]\xA7r Available Points: \xA7a${availablePoints}\xA7r.`);
  let form = new ActionFormData3();
  const bgMap = {
    1: "textures/warrior_skill_tree_bg",
    2: "textures/ranger_skill_tree_bg",
    3: "textures/mage_skill_tree_bg",
    4: "textures/assassin_skill_tree_bg",
    5: "textures/survivor_skill_tree_bg"
  };
  form.title(bgMap[classId] || "textures/skill_tree_bg_empty");
  form.body(`You have ${availablePoints} points.`);
  const leftLvl = getPathLevel(player, "left");
  const rightLvl = getPathLevel(player, "right");
  const middleLvl = getPathLevel(player, "middle");
  const currentUiNodes = getUiNodes(classId);
  for (const node of currentUiNodes) {
    let isUnlocked = false;
    if (node.path === "left" && node.level <= leftLvl) isUnlocked = true;
    else if (node.path === "right" && node.level <= rightLvl) isUnlocked = true;
    else if (node.path === "middle" && node.level <= middleLvl) isUnlocked = true;
    const iconType = isUnlocked ? "_un" : "_l";
    form.button("hidden_node", `textures/skill_icons/${node.id}${iconType}`);
  }
  const choices = [];
  if (middleLvl === 0) {
    choices.push({ text: `Disabled`, action: () => {
    } });
  } else if (leftLvl < 5) {
    const leftCost = getCost("left", leftLvl + 1);
    choices.push({ text: `Unlock Left Path (${leftLvl + 1}/5)
${leftCost} perk pts`, action: () => handleSkillUnlock(player, "left", leftLvl + 1) });
  } else {
    choices.push({ text: `Left Path Maxed!`, action: () => {
    } });
  }
  if (middleLvl < 3) {
    const midCost = getCost("middle", middleLvl + 1);
    choices.push({ text: `Unlock Middle Path (${middleLvl + 1}/3)
${midCost} perk pts`, action: () => handleSkillUnlock(player, "middle", middleLvl + 1) });
  } else {
    choices.push({ text: `Middle Path Maxed!`, action: () => {
    } });
  }
  if (middleLvl === 0) {
    choices.push({ text: `Disabled`, action: () => {
    } });
  } else if (rightLvl < 5) {
    const rightCost = getCost("right", rightLvl + 1);
    choices.push({ text: `Unlock Right Path (${rightLvl + 1}/5)
${rightCost} perk pts`, action: () => handleSkillUnlock(player, "right", rightLvl + 1) });
  } else {
    choices.push({ text: `Right Path Maxed!`, action: () => {
    } });
  }
  for (const choice of choices) {
    form.button(choice.text);
  }
  form.button("Exit");
  form.button("Upgrade Skill");
  form.button("Refund all perks");
  form.button("List skill");
  form.show(player).then((res) => {
    if (res.canceled || res.selection === void 0) return;
    const choiceIdx = res.selection - 13;
    if (choiceIdx >= 0 && choiceIdx < choices.length) {
      choices[choiceIdx].action();
    } else if (choiceIdx === choices.length) {
      player.sendMessage("\xA7eExiting skill tree.");
    } else if (choiceIdx === choices.length + 1) {
      player.sendMessage("\xA7eComing soon!");
    } else if (choiceIdx === choices.length + 2) {
      player.sendMessage("\xA7eComing soon!");
    } else if (choiceIdx === choices.length + 3) {
      system4.run(() => spawnSkillListUI(player));
    }
  }).catch(e => {});
}
function spawnSkillListUI(player) {
  const leftLvl = getPathLevel(player, "left");
  const rightLvl = getPathLevel(player, "right");
  const middleLvl = getPathLevel(player, "middle");
  const classObj = world6.scoreboard.getObjective("class");
  const classId = classObj?.getScore(player) ?? 0;
  const currentUiNodes = getUiNodes(classId);
  const form = new ActionFormData3();
  form.title("Skill List");
  form.body("All available skills and their benefits:\n");
  for (const node of currentUiNodes) {
    let isUnlocked = false;
    if (node.path === "left" && node.level <= leftLvl) isUnlocked = true;
    else if (node.path === "right" && node.level <= rightLvl) isUnlocked = true;
    else if (node.path === "middle" && node.level <= middleLvl) isUnlocked = true;
    const iconType = isUnlocked ? "_un" : "_l";
    const displayName = getNodeDisplayName(classId, node);
    form.button(displayName, `textures/skill_icons/${node.id}${iconType}`);
  }
  form.button("Back");
  form.show(player).then((res) => {
    if (res.canceled || res.selection === void 0) return;
    if (res.selection === currentUiNodes.length) {
      system4.run(() => spawnSkillTreeUI(player));
    } else if (res.selection < currentUiNodes.length) {
      system4.run(() => spawnSkillDetailUI(player, currentUiNodes[res.selection]));
    }
  }).catch(e => {});
}
var rangerSkillDescriptions = {
  agility: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Permanent \xA7aSpeed I\xA7r at all times.\n",
  firearrow: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Every arrow you fire \xA76ignites\xA7r the target for \xA7e12 seconds\xA7r and deals extra damage.\n\u2022 Works on mobs and players.\n",
  poisonarrow: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Every arrow you fire \xA72poisons\xA7r the target for \xA7e6 seconds\xA7r.\n\u2022 Stacks with Fire Arrow \u2014 burn AND poison together!\n",
  map: "\xA7dType: Active Ability (Crouch + Jump)\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Scans the world and lists all online players in chat.\n\u2022 Displays distance and direction (e.g. 140m North-East).\n\n\xA77Cooldown: 5 minutes\xA7r\n",
  arrowsunlimi: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Your quiver \xA7anever runs dry\xA7r \u2014 a replacement arrow appears automatically when you're out.\n\u2022 \xA77Requires a bow in main hand or offhand.\xA7r\n",
  hearts: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Grants \xA7c+6 extra hearts\xA7r permanently.\n\u2022 Grants \xA7apermanent Regeneration\xA7r.\n",
  rapidarrow: "\xA7dType: Active Ability\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 \xA7eSneaking + Jumping\xA7r unleashes \xA7e60 arrows\xA7r in rapid succession toward where you're looking.\n\u2022 Arrows carry your Fire Arrow / Poison Arrow effects.\n\n\xA77Cooldown: 4 minutes\xA7r\n",
  immunearrow: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 \xA7aComplete immunity\xA7r to all incoming arrow/projectile damage.\n\u2022 Health is fully restored equal to any projectile hit.\n",
  deadarrow: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Fully-charged arrows deal \xA7cDouble damage\xA7r on top of normal damage.\n\u2022 \xA77Tip: Hold the bow back all the way until it stops wobbling.\xA7r\n",
  aim: "\xA7dType: Active Ability\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 \xA7eSneaking + Jumping\xA7r grants \xA7eNight Vision\xA7r for \xA7e1 minute\xA7r \u2014 perfect for night hunts.\n\n\xA77Cooldown: 6 minutes\xA7r\n",
  archersafe: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Permanent \xA7aResistance I\xA7r.\n\u2022 While holding a bow: grants \xA7aSpeed II\xA7r and \xA7c+2 more extra hearts\xA7r.\n\u2022 \xA77Stacks with Hearts ability.\xA7r\n",
  explosion: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Every arrow creates an \xA76explosion\xA7r on impact \u2014 damages nearby mobs.\n\u2022 \xA77Regular bow shots break blocks. Rapid Arrow explosions do not.\xA7r\n",
  armour: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 \xA7aResistance II\xA7r when wearing a \xA7efull armor set\xA7r (all 4 pieces).\n\u2022 Permanent \xA7aSlow Falling II\xA7r while wearing \xA7eboots\xA7r.\n"
};
var assassinSkillDescriptions = {
  speed: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Permanent \xA7aSpeed II\xA7r at all times.\n",
  dagger: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Every melee hit deals \xA7c+3 bonus damage\xA7r (1.5 extra hearts), even barehanded.\n",
  silence: "\xA7dType: Active Ability\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 \xA7eSneaking + Jumping\xA7r grants \xA7aInvisibility\xA7r for \xA7e45 seconds\xA7r.\n\n\xA77Cooldown: 8 minutes\xA7r\n",
  critical: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Attacking while \xA7eairborne (jumping/falling)\xA7r deals \xA7c+7 bonus damage\xA7r.\n\u2022 \xA77Applies when hitting enemies with a sword in mid-air.\xA7r\n",
  bow: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Grants a \xA7ePower IV + Unbreaking III\xA7r bow added directly to your inventory.\n\u2022 \xA77Re-purchase to receive another bow.\xA7r\n",
  blind: "\xA7dType: Active Ability\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 \xA7eSneaking + Jumping\xA7r inflicts \xA78Darkness\xA7r and \xA7cWeakness\xA7r on all entities within \xA7e15 blocks\xA7r for \xA7e20s\xA7r.\n\u2022 You gain \xA7aInvisibility\xA7r for \xA7e20s\xA7r.\n\n\xA77Cooldown: 5 minutes\xA7r\n",
  lethal: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Every melee hit \xA7aheals you for 1 heart\xA7r (lifesteal).\n\u2022 A heart particle plays on each heal.\n",
  arrow: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Receive \xA7e7 arrows\xA7r every Minecraft day automatically.\n\u2022 \xA77Pairs perfectly with the Assassin Bow.\xA7r\n",
  shadow: "\xA7dType: Active Ability\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 \xA7eSneaking + Jumping\xA7r grants \xA7aInvisibility\xA7r, \xA7aSpeed II\xA7r, \xA7aStrength II\xA7r, \xA7aResistance\xA7r, and \xA7aJump Boost\xA7r for \xA7e30s\xA7r.\n\u2022 Enemies within \xA7e5 blocks\xA7r receive \xA7cPoison\xA7r and \xA7cWeakness\xA7r.\n\n\xA77Cooldown: 10 minutes\xA7r\n",
  poison: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Any entity that damages you gets \xA72poisoned\xA7r for \xA7e25 seconds\xA7r.\n",
  hearts: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Grants \xA7c+6 extra hearts\xA7r permanently.\n\u2022 Grants \xA7apermanent Regeneration\xA7r.\n",
  disharm: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Every \xA7e5 minutes\xA7r: gain \xA7aInvisibility\xA7r for \xA7e20s\xA7r and become \xA7aimmune to sword damage\xA7r during that window.\n\u2022 \xA77Axe hits are NOT blocked.\xA7r\n",
  instantkill: "\xA7dType: Passive\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Hit the same target \xA7e3 times in 5 seconds\xA7r without being hit yourself \u2192 deal \xA7c40 bonus damage\xA7r.\n\u2022 Works only once per mob and has a \xA7e60-second cooldown\xA7r after triggering.\n\u2022 \xA77Getting hit by anyone resets your combo!\xA7r\n"
};
var survivorSkillDescriptions = {
  boot: "\xA7dType: Passive Ability\xA7r\n\n\xA7eBenefits:\xA7r\n- Grants Speed I permanently while wearing boots.\n",
  map: "\xA7dType: Special Ability (Crouch + Jump)\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Reveals exact X-Y-Z coordinates of all online players in chat.\n\u2022 Identifies the nearest structure name.\n\u2022 Requires no map item in hand!\n\n\xA77Cooldown: 8 mins\xA7r\n",
  healing: "\xA7dType: Passive Ability\xA7r\n\n\xA7eBenefits:\xA7r\n- Grants +4 extra hearts and Regeneration while wearing a chestplate.\n",
  thrones: "\xA7dType: Passive Ability\xA7r\n\n\xA7eBenefits:\xA7r\n- Any enemy that damages you will be poisoned for 10 seconds.\n",
  dash: "\xA7dType: Special Ability (Crouch + Jump)\xA7r\n\n\xA7eBenefits:\xA7r\n- Pushes you 10 blocks forward.\n- Deals 5 damage to mobs within 3 blocks of your start position.\n- Grants Invisibility & Resistance for 10s.\n\n\xA77Cooldown: 45s\xA7r\n",
  medkit: "\xA7dType: Passive Ability\xA7r\n\n\xA7eBenefits:\xA7r\n- Upgrades extra hearts to +10 total while wearing a chestplate and with Vagabond’s Constitution unlocked.\n- Instantly heals 5 hearts every 5 minutes while Vagabond’s Constitution is unlocked.\n",
  safety: "\xA7dType: Special Ability (Crouch + Jump)\xA7r\n\n\xA7eBenefits:\xA7r\n- Grants Resistance III, Fire Resistance, and Absorption for 30 seconds.\n\n\xA77Cooldown: 6 mins\xA7r\n",
  speedboost: "\xA7dType: Special Ability (Crouch + Jump)\xA7r\n\n\xA7eBenefits:\xA7r\n- Grants Speed III, Jump Boost II, and Resistance II for 20 seconds.\n\n\xA77Cooldown: 4 mins\xA7r\n",
  hide: "\xA7dType: Special Ability (Crouch + Jump)\xA7r\n\n\xA7eBenefits:\xA7r\n- Grants complete Invisibility for 60 seconds (mobs won't see you).\n\n\xA77Cooldown: 5 mins\xA7r\n",
  backup: "\xA7dType: Passive Ability\xA7r\n\n\xA7eBenefits:\xA7r\n- Gives 5 golden carrots, 10 bread, and 30 cobblestone every MC day.\n- Gives an enchanted golden apple every 5 days.\n",
  effect: "\xA7dType: Passive Ability\xA7r\n\n\xA7eBenefits:\xA7r\n- Randomly gives a beneficial effect for 1 minute, every 6 minutes.\n",
  vision: "\xA7dType: Passive Ability\xA7r\n\n\xA7eBenefits:\xA7r\n- Grants permanent Night Vision.\n",
  lock: "\xA7dType: Special Ability (Crouch + Jump)\xA7r\n\n\xA7eBenefits:\xA7r\n- Traps other players in obsidian (unless within 3 blocks of you).\n- Applies Slowness III to everyone within 15 blocks.\n\n\xA77Cooldown: 5 mins\xA7r\n"
};
var warriorSkillDescriptions = {
  "sword": "\xA7dType: Special Ability\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks a new Special Ability in the Soul Shop.\n- Grants an Iron Sword with Curse of Vanishing.\n\n\xA77Note: After unlocking here, you must purchase and equip this ability in the Soul Shop. You can only have one active special ability at a time.\xA7r",
  "healthmet": "\xA7dType: Passive Skill\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks a passive buff in the Soul Shop.\n- Grants continuous Regeneration I while wearing ANY helmet.\n\n\xA77Note: After unlocking here, you must purchase this passive buff in the Soul Shop. It is always active once purchased.\xA7r",
  "assasin": "\xA7dType: Passive Skill\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks a passive buff in the Soul Shop.\n- Grants continuous Speed I.\n\n\xA77Note: After unlocking here, you must purchase this passive buff in the Soul Shop. It is always active once purchased.\xA7r",
  "heart": "\xA7dType: Passive Skill\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks a passive buff in the Soul Shop.\n- Permanently grants Extra Hearts.\n\n\xA77Note: After unlocking here, you must purchase this passive buff in the Soul Shop. It is always active once purchased.\xA7r",
  "smash": "\xA7dType: Special Ability\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks an active ability in the Soul Shop.\n- Ground Smash: Crouch and jump to push away all nearby enemies (within 5 blocks) up to 10 blocks, dealing 10 damage.\n- Grants Resistance I and Absorption I for 30 seconds.\n- Cooldown: 2 minutes.\n\n\xA77Note: To use, equip the ability and perform a Crouch + Jump.\xA7r",
  "strength": "\xA7dType: Passive Skill\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks a passive buff in the Soul Shop.\n- Grants continuous Strength I.\n\n\xA77Note: After unlocking here, you must purchase this passive buff in the Soul Shop. It is always active once purchased.\xA7r",
  "armour": "\xA7dType: Passive Skill\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks a passive buff in the Soul Shop.\n- Grants Resistance II and Jump Boost I when you wear a full set of armor (Helmet, Chestplate, Leggings, and Boots).\n\n\xA77Note: After unlocking here, you must purchase this passive buff in the Soul Shop. It is always active once purchased.\xA7r",
  "unbreakable_sword": "\xA7dType: Passive Skill\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks a passive buff in the Soul Shop.\n- Upgrades the Sword Special Ability to grant an Unbreakable Cursed Diamond Sword instead of Iron.\n\n\xA77Note: After unlocking here, you must purchase this passive buff in the Soul Shop. It is always active once purchased.\xA7r",
  "groundsmash": "\xA7dType: Passive Skill\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks a passive buff in the Soul Shop.\n- Grants continuous Resistance I, making you tougher in all fights.\n\n\xA77Note: After unlocking here, you must purchase this passive buff in the Soul Shop. It is always active once purchased.\xA7r",
  "dual_sword": "\xA7dType: Passive Skill\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks a passive buff in the Soul Shop.\n- Doubles the damage dealt when attacking with fists or any sword (Wooden to Netherite).\n\n\xA77Note: After unlocking here, you must purchase this passive buff in the Soul Shop. It is always active once purchased.\xA7r",
  "attack_strength": "\xA7dType: Special Ability\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks an active ability in the Soul Shop.\n- Attack Strength: Crouch and jump to gain max Strength, Resistance, Fire Resistance, Regeneration, and Extra Hearts for 10 seconds.\n- All hostile mobs within 10 blocks take 20 damage and Slowness III for 10 seconds.\n- Cooldown: 5 minutes.\n\n\xA77Note: To use, equip the ability and perform a Crouch + Jump.\xA7r",
  "shield": "\xA7dType: Passive Skill\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks a passive buff in the Soul Shop.\n- Instantly heals you 5 hearts every 30 seconds, but ONLY when a Shield is equipped in your Offhand.\n\n\xA77Note: After unlocking here, you must purchase this passive buff in the Soul Shop. It is always active once purchased.\xA7r",
  "fire_slash": "\xA7dType: Passive Skill\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks a passive buff in the Soul Shop.\n- Passively burns any enemy that damages you (works on zombies, creepers, players, etc.).\n\n\xA77Note: After unlocking here, you must purchase this passive buff in the Soul Shop. It is always active once purchased.\xA7r"
};
var mageSkillDescriptions = {
  magestaff: "\xA7dType: Base Item\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks the Mage Staff with 7 physical damage.\n\n\xA77Note: No spells active initially.\xA7r",
  fireball: "\xA7dType: Spell\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks the Fireball spell in the Soul Shop.\n- Shoots a fireball up to 10 blocks.\n- Deals 4 damage and burns enemies for 6 seconds.\n\n\xA77Note: Equip in Spellbook.\xA7r",
  frost: "\xA7dType: Spell\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks the Frost spell in the Soul Shop.\n- Deals 4 damage to all mobs in a 10-block radius.\n- Applies Slowness IV and Weakness I.\n- Cooldown: 2 seconds.\n\n\xA77Note: Equip in Spellbook.\xA7r",
  manashield: "\xA7dType: Special Ability\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks the Mana Shield ability in the Soul Shop.\n- Crouch + Jump: Grants Fire Protection, Absorption, Resistance III, and Regeneration I for 20 seconds.\n- Cooldown: 5 minutes.\xA7r",
  lightning: "\xA7dType: Spell\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks the Lightning spell in the Soul Shop.\n- Strikes mobs in a 10-block radius with lightning.\n- Cooldown: 5 seconds.\n\n\xA77Note: Equip in Spellbook.\xA7r",
  hypnosis: "\xA7dType: Special Ability\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks the Hypnosis ability in the Soul Shop.\n- Crouch + Jump: Grants Nausea and Poison to nearby mobs/players for 20 seconds.\n- Cooldown: 5 minutes.\xA7r",
  ice: "\xA7dType: Passive Skill\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks the Ice passive in the Soul Shop.\n- Enhances Frost spell: Increases damage from 4 to 12.\n- Increases cast range from 10 to 20 blocks.\n- Frost cooldown becomes 5 seconds.\n\n\xA77Note: Toggle on/off in Soul Shop.\xA7r",
  magicslash: "\xA7dType: Special Ability\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks the Magic Slash ability in the Soul Shop.\n- Crouch + Jump: Deals 10 hearts (20 damage) to all mobs/players in a 15-block radius and burns them for 15 seconds.\n- Cooldown: 5 minutes.\xA7r",
  mageshoot: "\xA7dType: Passive Skill\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks the Mage Shoot passive in the Soul Shop.\n- Enhances Fireball spell: Increases damage to 10, creates a fiery explosion.\n- Adds a 2-second cooldown when casting Fireball.\n\n\xA77Note: Toggle on/off in Soul Shop.\xA7r",
  enchantment: "\xA7dType: Passive Skill\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks the Enchantment passive in the Soul Shop.\n- Grants 1 random enchanted book every Minecraft day.\n\n\xA77Note: Toggle on/off in Soul Shop.\xA7r",
  effectmage: "\xA7dType: Passive Skill\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks the Effect Mage passive in the Soul Shop.\n- Grants a random beneficial effect for 1 minute every 6 minutes.\n\n\xA77Note: Toggle on/off in Soul Shop.\xA7r",
  petsmage: "\xA7dType: Special Soul Shop Ability\xA7r\n\n\xA7eBenefits:\xA7r\n\u2022 Unlocks the \xA7e'Summon Guard!'\xA7r option in the Soul Shop.\n\u2022 Summons a loyal \xA75Warden Guard\xA7r to protect you with a 5-second ritual.\n\u2022 The Warden acts like a loyal dog \u2014 follows you, teleports to you, and attacks hostile mobs or enemies that attack you or that you attack.\n\u2022 \xA77Never attacks you, never inflicts Darkness effect, and never attacks non-hostile mobs.\xA7r\n\u2022 Includes a \xA7eSit / Stand\xA7r toggle menu.\n\u2022 If killed, can be re-summoned after \xA7e5 Minecraft days\xA7r.\n",
  invisibility: "\xA7dType: Spell\xA7r\n\n\xA7eBenefits:\xA7r\n- Unlocks the Invisibility spell in the Soul Shop.\n- When selected in the Spellbook, you become permanently invisible while equipped. No right-clicking required.\n\n\xA77Note: Equip in Spellbook.\xA7r"
};
function getShopItemForNode(classId, node) {
  const requiredTag = `path_${node.path}_${node.level}`;
  const shopItems = getShopItemsForClass(classId);
  return shopItems.find((item) => item.requiresTag === requiredTag);
}
function getNodeDisplayName(classId, node) {
  const match = getShopItemForNode(classId, node);
  if (match) return match.name;
  return node.id.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function getSkillDescription(classId, node) {
  const match = getShopItemForNode(classId, node);
  if (match?.description) return match.description;
  const nodeId = node.id;
  if (classId === 2 /* Ranger */) return rangerSkillDescriptions[nodeId] || "\xA7cDescription not found!\xA7r";
  if (classId === 3 /* Mage */) return mageSkillDescriptions[nodeId] || "\xA7cDescription not found!\xA7r";
  if (classId === 4 /* Assassin */) return assassinSkillDescriptions[nodeId] || "\xA7cDescription not found!\xA7r";
  if (classId === 5 /* Survivor */) return survivorSkillDescriptions[nodeId] || "\xA7cDescription not found!\xA7r";
  if (classId === 1 /* Warrior */) return warriorSkillDescriptions[nodeId] || "\xA7cDescription not found!\xA7r";
  return "\xA7eBenefits:\xA7r\n- (Coming soon...)\n";
}
function spawnSkillDetailUI(player, node) {
  const classObj = world6.scoreboard.getObjective("class");
  const classId = classObj?.getScore(player) ?? 0;
  const leftLvl = getPathLevel(player, "left");
  const rightLvl = getPathLevel(player, "right");
  const middleLvl = getPathLevel(player, "middle");
  let isUnlocked = false;
  if (node.path === "left" && node.level <= leftLvl) isUnlocked = true;
  else if (node.path === "right" && node.level <= rightLvl) isUnlocked = true;
  else if (node.path === "middle" && node.level <= middleLvl) isUnlocked = true;
  const iconType = isUnlocked ? "_un" : "_l";
  const displayName = getNodeDisplayName(classId, node);
  const form = new ActionFormData3();
  form.title(`${displayName} Details`);
  let bodyText = `\xA7l${displayName}\xA7r

`;
  bodyText += `Status: ${isUnlocked ? "\xA7aUnlocked\xA7r" : "\xA7cLocked\xA7r"}

`;
  const description = getSkillDescription(classId, node);
  bodyText += description;
  form.body(bodyText);
  form.button("Back to List", `textures/skill_icons/${node.id}${iconType}`);
  form.show(player).then((res) => {
    if (res.canceled) return;
    system4.run(() => spawnSkillListUI(player));
  }).catch(e => {});
}
function handleSkillUnlock(player, path, nextLvl) {
  const cost = getCost(path, nextLvl);
  const availablePoints = getSkillPoints(player);
  if (availablePoints < cost) {
    player.sendMessage(`\xA7cNot enough Perk Points! Need \xA7e${cost} pts\xA7c, you have \xA7e${availablePoints} pts\xA7c.`);
    return;
  }
  player.addTag(`path_${path}_${nextLvl}`);
  const classObj = world6.scoreboard.getObjective("class");
  const classId = classObj?.getScore(player) ?? 0;
  const requiredTag = `path_${path}_${nextLvl}`;
  const shopItems = getShopItemsForClass(classId);
  const unlockedItems = shopItems.filter((item) => item.requiresTag === requiredTag);
  if (unlockedItems.length > 0) {
    const nameList = unlockedItems.map((i) => `\xA7b${i.name}\xA7e`).join("\xA77, \xA7e");
    player.sendMessage(`\xA7a\u2726 Skill Node Unlocked! \xA7e${nameList} \xA77is now in the Soul Shop! \xA77(\xA7c-${cost} pt${cost > 1 ? "s" : ""}\xA77)\xA7r`);
  } else {
    player.sendMessage(`\xA7aSkill path advanced! \xA77(-${cost} perk point${cost > 1 ? "s" : ""})`);
  }
  for (const item of unlockedItems) {
    if (classId === 3 /* Mage */ && item.tag.startsWith("spell_unlocked:")) {
      player.sendMessage(`\xA7d  \u2192 Spell: \xA7f${item.name} \xA7d\u2014 unlock it in your Spellbook!\xA7r`);
    } else if (item.isActiveAbility) {
      player.sendMessage(`\xA76  \u2192 Active Ability: \xA7f${item.name} \xA77\u2014 equip in Soul Shop, then \xA7eSneaking + Jumping\xA77 to activate.\xA7r`);
    } else {
      player.sendMessage(`\xA7a  \u2192 Passive Skill: \xA7f${item.name} \xA77\u2014 purchase in Soul Shop to activate automatically.\xA7r`);
    }
  }
}
function closeSkillTreeUI(player) {
}

// src/systems/spellbook.ts
import { system as system5, world as world7 } from "@minecraft/server";
import { ActionFormData as ActionFormData4 } from "@minecraft/server-ui";
function showSpellbookUI(player) {
  const form = new ActionFormData4().title("\xA7dMage Spellbook").body("Manage your spells here. You can buy unlocked spells or equip them.");
  const spells = MageShopItems.filter((item) => item.tag.startsWith("spell_unlocked:"));
  form.button("\xA75Equip / Buy Spells", "textures/items/book_enchanted");
  system5.run(() => {
    form.show(player).then((res) => {
      if (res.canceled) return;
      if (res.selection === 0) {
        showSpellsList(player, spells);
      }
    }).catch(e => {});
  });
}
function showSpellsList(player, spells) {
  const form = new ActionFormData4().title("\xA7dSpells");
  let activeSpell = "";
  for (const tag of player.getTags()) {
    if (tag.startsWith("active_spell:")) {
      activeSpell = tag.split(":")[1];
      break;
    }
  }
  form.body("Select a spell to buy or equip.\n\n");
  for (const spell of spells) {
    const spellId = spell.tag.split(":")[1];
    if (player.hasTag(spell.tag)) {
      if (activeSpell === spellId) {
        form.button(`\xA7a[Equipped] \xA7r${spell.name}`);
      } else {
        form.button(`\xA78[Owned] \xA7r${spell.name}`);
      }
    } else {
      if (player.hasTag(spell.requiresTag)) {
        form.button(`\xA7e[Buy] \xA7r${spell.name}
\xA77Cost: ${spell.costSouls} Souls`);
      } else {
        form.button(`\xA7c[Locked] \xA7r${spell.name}`);
      }
    }
  }
  system5.run(() => {
    form.show(player).then((res) => {
      if (res.canceled) {
        showSpellbookUI(player);
        return;
      }
      const selectedSpell = spells[res.selection];
      const spellId = selectedSpell.tag.split(":")[1];
      if (player.hasTag(selectedSpell.tag)) {
        for (const tag of player.getTags()) {
          if (tag.startsWith("active_spell:")) {
            player.removeTag(tag);
          }
        }
        player.addTag(`active_spell:${spellId}`);
        player.sendMessage(`\xA7d[Spellbook] \xA7aEquipped spell: \xA7e${selectedSpell.name}`);
        const equippable = player.getComponent("minecraft:equippable");
        if (equippable) {
          const mainhand = equippable.getEquipment("Mainhand");
          if (mainhand && mainhand.typeId.startsWith("rpg:mage_staff")) {
            mainhand.nameTag = `\xA7dMage Staff \xA77[\xA7e${selectedSpell.name.replace(" Spell", "")}\xA77]`;
            equippable.setEquipment("Mainhand", mainhand);
          }
        }
      } else {
        if (!player.hasTag(selectedSpell.requiresTag)) {
          player.sendMessage("\xA7c[Spellbook] You must unlock this spell in the Skill Tree first!");
          return;
        }
        const objective = world7.scoreboard.getObjective("souls");
        if (!objective) return;
        const currentSouls = objective.getScore(player) || 0;
        if (currentSouls >= selectedSpell.costSouls) {
          objective.setScore(player, currentSouls - selectedSpell.costSouls);
          player.addTag(selectedSpell.tag);
          player.sendMessage(`\xA7a[Spellbook] Successfully bought: \xA7e${selectedSpell.name}`);
        } else {
          player.sendMessage(`\xA7c[Spellbook] Not enough souls! You need ${selectedSpell.costSouls} Souls.`);
        }
      }
    }).catch(e => {});
  });
}

// src/systems/classes.ts
var ClassNames = {
  0: "Unselected",
  1: "Warrior",
  2: "Ranger",
  3: "Mage",
  4: "Assassin",
  5: "Survivor"
};
var ClassDescriptions = {
  1: "\xA7lWarrior\xA7r\n\n\xA7aPros:\xA7r A powerful short range tank and sword fighter, who never accepts lose. Has more health and resistance, strength unlocked by leveling up, powerful armor on level up.",
  2: "\xA7lRanger\xA7r\n\n\xA7aPros:\xA7r High speed and ranged damage.",
  3: "\xA7lMage\xA7r\n\n\xA7aPros:\xA7r Magic utility and area damage.",
  4: "\xA7lAssassin\xA7r\n\n\xA7aPros:\xA7r High burst damage and mobility.",
  5: "\xA7lSurvivor\xA7r\n\n\xA7aPros:\xA7r Balanced stats, good for beginners."
};
function getPlayerScoreSafe(objective, player, fallback = 0) {
  try {
    const identity = player.scoreboardIdentity;
    if (identity) return objective.getScore(identity) ?? fallback;
  } catch (e) { console.warn("Caught error:", e, e?.stack); }
  try {
    return objective.getScore(player) ?? fallback;
  } catch (e) {
    return fallback;
  }
}
world8.afterEvents.itemUse.subscribe((event) => {
  const player = event.source;
  if (player.typeId !== "minecraft:player") return;
  const isGuideBook = event.itemStack.nameTag === "\xA7l\xA76RPG Guide" || (event.itemStack.typeId === "minecraft:book" && player.isSneaking);
  if (!isGuideBook) return;
  system6.run(() => {
      try {
        if (!player.isValid()) return;
        const classObj = world8.scoreboard.getObjective("class");
        if (!classObj) {
          player.sendMessage("\xA7c[RPG] The class scoreboard is missing.");
          return;
        }
        const currentClass = getPlayerScoreSafe(classObj, player, 0);
        if (player.hasTag("in_skill_box")) {
          closeSkillTreeUI(player);
        } else if (currentClass > 0) {
          showPlayerMenuUI(player, currentClass);
        } else {
          showClassSelectionUI(player);
        }
      } catch (e) {
        console.warn(`[RPG Guide] Failed to open menu: ${e}`);
        try {
          player.sendMessage("\xA7c[RPG] The menu could not open. Please use the book again.");
        } catch (ignored) { console.warn("Caught error:", ignored, ignored?.stack); }
      }
    });
});
function showClassSelectionUI(player) {
  const form = new ActionFormData5().title("Select Your Class").body("Choose your destiny carefully. This cannot be changed later!").button("Warrior").button("Ranger").button("Mage").button("Assassin").button("Survivor");
  form.show(player).then((response) => {
    if (response.canceled) return;
    const selection = (response.selection ?? 0) + 1;
    showClassDetailsUI(player, selection);
  }).catch(e => {});
}
function showClassDetailsUI(player, classId) {
  const desc = ClassDescriptions[classId] || "Unknown Class";
  const className = ClassNames[classId] || "Unknown";
  const form = new ActionFormData5().title(`Class Details: ${className}`).body(desc + "\n\n\xA7eAre you sure you want to select this class?").button("\xA72Select " + className).button("\xA7cBack to Menu");
  form.show(player).then((response) => {
    if (response.canceled) return;
    if (response.selection === 0) {
      setClass(player, classId);
      player.sendMessage("\xA7a[System] You can access your Spellbook and Skill Tree directly from the RPG Guide!");
    } else if (response.selection === 1) {
      showClassSelectionUI(player);
    }
  }).catch(e => {});
}
function setClass(player, classId) {
  const classObj = world8.scoreboard.getObjective("class");
  if (!classObj) return;
  classObj.setScore(player, classId);
  player.sendMessage("\xA7aYou have successfully become a \xA7e" + ClassNames[classId] + "\xA7a!");
  player.playSound("random.levelup");
  if (classId === 3 /* Mage */ && !player.hasTag("initial_mage_souls")) {
    const soulsObj = world8.scoreboard.getObjective("souls");
    if (soulsObj) {
      const currentSouls = soulsObj.getScore(player) ?? 0;
      soulsObj.setScore(player, currentSouls + 70);
      player.addTag("initial_mage_souls");
      player.sendMessage("\xA7b[Bonus] You received 70 Souls as a starting bonus for choosing Mage!");
    }
  }
  const levelObj = world8.scoreboard.getObjective("level");
  if (levelObj) {
    const level = levelObj.getScore(player) ?? 1;
    applyBuffs(player, level, classId);
  }
}
function showPlayerMenuUI(player, classId) {
  const levelObj = world8.scoreboard.getObjective("level");
  const soulsObj = world8.scoreboard.getObjective("souls");
  if (!levelObj || !soulsObj) return;
  const currentLevel = getPlayerScoreSafe(levelObj, player, 1);
  const currentSouls = getPlayerScoreSafe(soulsObj, player, 0);
  const req = getLevelRequirement(currentLevel + 1);
  const canLevelUp = player.level >= req.xpLevel && currentSouls >= req.souls;
  let bodyText = `\xA7bClass: \xA7e${ClassNames[classId]}
`;
  bodyText += `\xA7bRPG Level: \xA7e${currentLevel}
`;
  bodyText += `\xA7bSouls: \xA7c${currentSouls}

`;
  bodyText += `\xA7lRequirements for Level ${currentLevel + 1}:\xA7r
`;
  bodyText += `XP Levels: ${player.level} / ${req.xpLevel}
`;
  bodyText += `Souls: ${currentSouls} / ${req.souls}

`;
  if (canLevelUp) {
    bodyText += "\xA7aYou are ready to level up!";
  } else {
    bodyText += "\xA7cYou need more XP Levels or Souls.";
  }
  const form = new ActionFormData5().title("Player Menu").body(bodyText);
  const buttons = [];
  if (canLevelUp) {
    buttons.push({ text: "\xA7aLevel Up!", action: () => {
      player.addLevels(-req.xpLevel);
      soulsObj.setScore(player, currentSouls - req.souls);
      levelUp(player, currentLevel + 1, classId);
    } });
  } else {
    buttons.push({ text: "\xA78[Not Ready]", action: () => {
    } });
  }
  buttons.push({ text: "\xA7cSoul Shop", action: () => showSoulShopUI(player) });
  if (classId !== 0 /* Unselected */) {
    buttons.push({ text: "\xA76Skill Tree", action: () => spawnSkillTreeUI(player) });
  } else {
    buttons.push({ text: "\xA76Skill Tree", action: () => {
      player.sendMessage("\xA7ePlease select a class first!\xA7r");
    } });
  }
  if (currentLevel >= 19) {
    buttons.push({ text: "\xA74\u2620 Fight Boss \u2620", action: () => showBossWarningUI(player) });
  }
  if (classId === 3 /* Mage */) {
    buttons.push({ text: "\xA75Mage Spellbook", action: () => showSpellbookUI(player) });
  }
  buttons.push({ text: "\xA78Settings", action: () => showSettingsUI(player) });
  buttons.push({ text: "Close", action: () => {
  } });
  for (const b of buttons) {
    form.button(b.text);
  }
  form.show(player).then((response) => {
    if (response.canceled) return;
    buttons[response.selection].action();
  }).catch(e => {});
}
function showSettingsUI(player) {
  const classObj = world8.scoreboard.getObjective("class");
  const currentClass = getPlayerScoreSafe(classObj, player, 0);

  const form = new ActionFormData5().title("Settings").body("Choose a setting to manage:");
  form.button("Item Lock Settings");
  form.button("Block Destruction Settings");
  form.button("HUD Settings");
  
  const showBowSummon = currentClass === 2 || (currentClass === 4 && player.hasTag("shop_assassin_bow"));
  if (showBowSummon) {
    form.button("Summon Bow");
  }
  
  form.button("New Beginning");
  form.button("Back");
  form.show(player).then((response) => {
    if (response.canceled) return;
    
    let options = ["lock", "destroy", "hud"];
    if (showBowSummon) options.push("bow");
    options.push("new_beginning");
    options.push("back");

    const action = options[response.selection];

    if (action === "lock") {
      showItemLockUI(player);
    } else if (action === "destroy") {
      showBlockDestructionUI(player);
    } else if (action === "hud") {
      showHudToggleUI(player);
    } else if (action === "bow") {
      showBowSummonUI(player);
    } else if (action === "new_beginning") {
      showNewBeginningUI(player);
    } else if (action === "back") {
       showPlayerMenuUI(player, currentClass);
    }
  }).catch(e => {});
}

function showNewBeginningUI(player) {
  const form = new ActionFormData5().title("New Beginning")
    .body("By confirming, your all xp, skill points or pearks, souls will become zero and all skill will be locked and you will select your class again.");
  
  form.button("Confirm");
  form.button("Back");

  form.show(player).then((response) => {
    if (response.canceled) return;
    if (response.selection === 0) {
      player.runCommandAsync("scoreboard players set @s class 0");
      player.runCommandAsync("scoreboard players set @s souls 0");
      player.runCommandAsync("scoreboard players set @s level 1");
      player.runCommandAsync("xp -9999L @s");
      player.runCommandAsync("clear @s rpg:mage_staff");
      player.runCommandAsync("clear @s minecraft:bow");
      
      const tags = player.getTags();
      for (const tag of tags) {
        if (tag.startsWith("shop_") || tag.startsWith("active_ability_") || tag.startsWith("spell_unlocked:") || tag.startsWith("class_") || tag.startsWith("path_") || tag.startsWith("applied_") || tag.startsWith("active_spell:")) {
          player.removeTag(tag);
        }
      }
      
      giveRPGBook(player);
      player.sendMessage("§a[System] New beginning confirmed. Your stats have been reset.");
    } else if (response.selection === 1) {
      showSettingsUI(player);
    }
  }).catch(e => {});
}

function showBowSummonUI(player) {
  const form = new ActionFormData5().title("Summon Bow")
    .body("If you lost or accidentally destroyed your class weapon (Ranger Bow or Assassin's Deadly Bow), you can summon a new one here.\n\nIt will match your current RPG Level.");
  
  form.button("\xA7aSummon Bow");
  form.button("Back");

  form.show(player).then((response) => {
    if (response.canceled) return;
    if (response.selection === 0) {
      player.runCommandAsync("scriptevent rpg:fix_bow");
    } else if (response.selection === 1) {
      showSettingsUI(player);
    }
  }).catch(e => {});
}
function showItemLockUI(player) {
  let isLocked = false;
  const inv = player.getComponent("minecraft:inventory");
  if (inv && inv.container) {
    for (let i = 0; i < inv.container.size; i++) {
      const item = inv.container.getItem(i);
      if (item && item.typeId === "minecraft:book" && item.nameTag === "\xA7l\xA76RPG Guide") {
        if (item.lockMode && item.lockMode !== "none") {
          isLocked = true;
        }
        break;
      }
    }
  }

  const form = new ActionFormData5().title("Item Lock Settings")
    .body("When enabled, important RPG items like your Guide Book and Ranger Bow are locked in your inventory so you cannot drop or lose them.");
  
  form.button(isLocked ? "\xA7cDisable Item Lock" : "\xA7aEnable Item Lock");
  form.button("Back");

  form.show(player).then((response) => {
    if (response.canceled) return;
    if (response.selection === 0) {
      player.runCommandAsync(isLocked ? "scriptevent rpg:unlock" : "scriptevent rpg:lock");
    } else if (response.selection === 1) {
      showSettingsUI(player);
    }
  }).catch(e => {});
}

function showBlockDestructionUI(player) {
  const isDestructive = player.hasTag("destroy_blocks");
  const form = new ActionFormData5().title("Block Destruction")
    .body("When enabled, powerful explosive abilities (like Mage Fireball upgrades) will destroy blocks and cause fire. Disable for safe explosions.");
  
  form.button(isDestructive ? "\xA7cDisable Block Destruction" : "\xA7aEnable Block Destruction");
  form.button("Back");

  form.show(player).then((response) => {
    if (response.canceled) return;
    if (response.selection === 0) {
      player.runCommandAsync(isDestructive ? "scriptevent rpg:destroy_off" : "scriptevent rpg:destroy_on");
    } else if (response.selection === 1) {
      showSettingsUI(player);
    }
  }).catch(e => {});
}

function showHudToggleUI(player) {
  const isHidden = player.hasTag("hide_rpg_hud");
  const form = new ActionFormData5().title("HUD Settings")
    .body("When disabled, the custom RPG HUD (showing level, souls, and compass) will be hidden from your screen.");
  
  form.button(isHidden ? "\xA7aShow HUD" : "\xA7cHide HUD");
  form.button("Back");

  form.show(player).then((response) => {
    if (response.canceled) return;
    if (response.selection === 0) {
      player.runCommandAsync(isHidden ? "scriptevent rpg:hud_on" : "scriptevent rpg:hud_off");
    } else if (response.selection === 1) {
      showSettingsUI(player);
    }
  }).catch(e => {});
}
var SPELL_LIST = [
  { id: "fireball", name: "Fireball", color: "\xA7c" },
  { id: "frost", name: "Frost", color: "\xA7b" },
  { id: "lightning", name: "Lightning", color: "\xA7e" },
  { id: "invisibility", name: "Invisibility", color: "\xA77" }
];
function syncMageStaffName(player, level) {
  let activeSpellId = "none";
  let activeSpellName = "No Spell";
  for (const spell of SPELL_LIST) {
    if (player.hasTag("active_spell:" + spell.id)) {
      activeSpellName = spell.name;
      activeSpellId = spell.id;
      break;
    }
  }
  const targetTypeId = "rpg:mage_staff";
  const inv = player.getComponent("minecraft:inventory");
  if (inv && inv.container) {
    for (let i = 0; i < inv.container.size; i++) {
      const item = inv.container.getItem(i);
      if (item && item.typeId.startsWith("rpg:mage_staff")) {
        if (item.typeId !== targetTypeId) {
          const newItem = new ItemStack4(targetTypeId, 1);
          newItem.nameTag = `\xA7dMage Staff Lvl.${level} \xA77[${activeSpellName}]`;
          newItem.keepOnDeath = true;
          newItem.lockMode = ItemLockMode4.inventory;
          const enchComp = newItem.getComponent("enchantable");
          if (enchComp) {
            try {
              enchComp.addEnchantment({ type: EnchantmentTypes3.get("vanishing"), level: 1 });
            } catch (e) {
              console.warn(e);
            }
            try {
              enchComp.addEnchantment({ type: EnchantmentTypes3.get("binding"), level: 1 });
            } catch (e) {
              console.warn(e);
            }
          }
          try {
          } catch (e) {
            console.warn(e);
          }
          inv.container.setItem(i, newItem);
        } else {
          item.nameTag = `\xA7dMage Staff Lvl.${level} \xA77[${activeSpellName}]`;
          item.keepOnDeath = true;
          item.lockMode = ItemLockMode4.inventory;
          const enchComp2 = item.getComponent("enchantable");
          if (enchComp2) {
            try {
              enchComp2.addEnchantment({ type: EnchantmentTypes3.get("vanishing"), level: 1 });
            } catch (e) {
              console.warn(e);
            }
            try {
              enchComp2.addEnchantment({ type: EnchantmentTypes3.get("binding"), level: 1 });
            } catch (e) {
              console.warn(e);
            }
          }
          try {
          } catch (e) {
            console.warn(e);
          }
          inv.container.setItem(i, item);
        }
      }
    }
  }
}

// src/systems/souls.ts
import { world as world9 } from "@minecraft/server";
var PASSIVE_ENTITIES = new Set([
  "minecraft:pig", "minecraft:cow", "minecraft:sheep", "minecraft:chicken", "minecraft:horse",
  "minecraft:donkey", "minecraft:mule", "minecraft:rabbit", "minecraft:villager", "minecraft:wandering_trader",
  "minecraft:bat", "minecraft:cat", "minecraft:ocelot", "minecraft:wolf", "minecraft:parrot",
  "minecraft:turtle", "minecraft:dolphin", "minecraft:squid", "minecraft:glow_squid", "minecraft:fox",
  "minecraft:panda", "minecraft:bee", "minecraft:strider", "minecraft:goat", "minecraft:axolotl",
  "minecraft:frog", "minecraft:tadpole", "minecraft:camel", "minecraft:sniffer", "minecraft:armadillo",
  "minecraft:iron_golem", "minecraft:snow_golem", "minecraft:player"
]);
function isHostile(entity) {
  return !PASSIVE_ENTITIES.has(entity.typeId);
}
var SOUL_VALUES = {
  "minecraft:wither": 200,
  "minecraft:ender_dragon": 200,
  "minecraft:warden": 100,
  "minecraft:elder_guardian": 50,
  "minecraft:ravager": 15,
  "minecraft:evoker": 10,
  "minecraft:piglin_brute": 10,
  "minecraft:ghast": 5,
  "minecraft:enderman": 5,
  "minecraft:phantom": 3,
  "minecraft:creeper": 2,
  "minecraft:blaze": 3,
  "minecraft:witch": 3,
  "minecraft:vindicator": 3,
  "minecraft:cave_spider": 2
};
function getSoulValue(typeId) {
  return SOUL_VALUES[typeId] ?? 1;
}
world9.afterEvents.entityDie.subscribe((event) => {
  const deadEntity = event.deadEntity;
  if (deadEntity && deadEntity.typeId === "minecraft:warden" && deadEntity.hasTag("warden_guard")) {
    for (const tag of deadEntity.getTags()) {
      if (tag.startsWith("guard_owner_")) {
        const ownerId = tag.substring("guard_owner_".length);
        COOLDOWNS.set(ownerId + "_warden_pet_cd", system8.currentTick + 5 * 24000);
        try {
          for (const p of world9.getAllPlayers()) {
            if (p.id === ownerId) {
              p.sendMessage("\xA7c[Warden Guard]\xA74 Your Warden Guard has fallen in battle! You can summon a new guard in 5 Minecraft days.\xA7r");
              break;
            }
          }
        } catch (_) {}
        break;
      }
    }
  }
  const damageSource = event.damageSource;
  let killer = damageSource.damagingEntity;
  if (!killer && damageSource.damagingProjectile) {
    const projectile = damageSource.damagingProjectile;
    let projectileId = "";
    try {
      projectileId = projectile.id || "";
    } catch (e) {
    }
    const cached = projectileId ? RANGER_ARROW_STATES.get(projectileId) : void 0;
    if (cached?.ownerId) killer = getPlayerByIdRanger(cached.ownerId);
    if (!killer) {
      try {
        if (projectile.isValid()) {
          for (const tag of projectile.getTags()) {
            if (!tag.startsWith("ranger_owner:")) continue;
            killer = getPlayerByIdRanger(tag.substring("ranger_owner:".length));
            break;
          }
        }
      } catch (e) {
      }
    }
  }
  if (!killer || killer.typeId !== "minecraft:player") return;
  if (!isHostile(deadEntity)) return;
  const player = killer;
  const soulsObj = world9.scoreboard.getObjective("souls");
  if (!soulsObj) return;
  const currentSouls = soulsObj.getScore(player) ?? 0;
  const soulsAwarded = getSoulValue(deadEntity.typeId);
  soulsObj.setScore(player, currentSouls + soulsAwarded);
});

// src/systems/hud.ts
var COMPASS_TAPE = [
  "S", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7",
  "SW", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7",
  "W", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7",
  "NW", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7",
  "N", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7",
  "NE", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7",
  "E", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7",
  "SE", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7", "\xB7"
];
var COMPASS_DOUBLE_TAPE = [...COMPASS_TAPE, ...COMPASS_TAPE, ...COMPASS_TAPE];
var MC_CHAR_WIDTHS = {
  " ": 4, "!": 2, "\"": 4, "#": 6, "$": 6, "%": 6, "&": 6, "'": 2,
  "(": 4, ")": 4, "*": 4, "+": 6, ",": 2, "-": 6, ".": 2, "/": 6,
  "0": 6, "1": 6, "2": 6, "3": 6, "4": 6, "5": 6, "6": 6, "7": 6,
  "8": 6, "9": 6, ":": 2, ";": 2, "<": 5, "=": 6, ">": 5, "?": 6,
  "@": 7, "A": 6, "B": 6, "C": 6, "D": 6, "E": 6, "F": 6, "G": 6,
  "H": 6, "I": 4, "J": 6, "K": 6, "L": 6, "M": 6, "N": 6, "O": 6,
  "P": 6, "Q": 6, "R": 6, "S": 6, "T": 6, "U": 6, "V": 6, "W": 6,
  "X": 6, "Y": 6, "Z": 6, "[": 4, "\\": 6, "]": 4, "^": 6, "_": 6,
  "`": 3, "a": 6, "b": 6, "c": 6, "d": 6, "e": 6, "f": 5, "g": 6,
  "h": 6, "i": 2, "j": 6, "k": 5, "l": 3, "m": 6, "n": 6, "o": 6,
  "p": 6, "q": 6, "r": 6, "s": 6, "t": 4, "u": 6, "v": 6, "w": 6,
  "x": 6, "y": 6, "z": 6, "{": 4, "|": 2, "}": 4, "~": 7, "\xB7": 4
};
function getMcStringWidth(str) {
  let width = 0;
  let isBold = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "\xA7" || ch === "§") {
      if (i + 1 < str.length) {
        const code = str[i + 1].toLowerCase();
        if (code === "l") isBold = true;
        else if (code === "r" || (code >= "0" && code <= "9") || (code >= "a" && code <= "f")) isBold = false;
        i++;
      }
      continue;
    }
    const charW = MC_CHAR_WIDTHS[ch] ?? 6;
    width += charW + (isBold && ch !== " " ? 1 : 0);
  }
  return width;
}
function centerHudLines(lines) {
  const filtered = lines.filter((l) => l && l.length > 0);
  if (filtered.length <= 1) return filtered.join("\n");
  const widths = filtered.map((l) => getMcStringWidth(l));
  const maxWidth = Math.max(...widths);
  return filtered.map((line, idx) => {
    const padPixels = (maxWidth - widths[idx]) / 2;
    const padCount = Math.max(0, Math.round(padPixels / 4));
    return padCount > 0 ? " ".repeat(padCount) + line : line;
  }).join("\n");
}
import { world as world10, system as system7 } from "@minecraft/server";
var statsCache = /* @__PURE__ */ new Map();
var tickCount = 0;
system7.runInterval(() => {
  tickCount++;
  const classObj = world10.scoreboard.getObjective("class");
  const levelObj = world10.scoreboard.getObjective("level");
  const soulsObj = world10.scoreboard.getObjective("souls");
  if (!classObj || !levelObj || !soulsObj) return;
  for (const player of world10.getAllPlayers()) {
    const playerId = player.id;
    if (tickCount % 20 === 0 || !statsCache.has(playerId)) {
      const classId = classObj.getScore(player) ?? 0;
      const level = levelObj.getScore(player) ?? 0;
      const souls = soulsObj.getScore(player) ?? 0;
      const perks = getSkillPoints(player);
      let levelUpAvailable = false;
      if (classId > 0) {
        const req = getLevelRequirement(level + 1);
        if (player.level >= req.xpLevel && souls >= req.souls) {
          levelUpAvailable = true;
        }
      }
      statsCache.set(playerId, { classId, level, souls, perks, levelUpAvailable });
      for (const item of AllShopItems) {
        if (item.isActiveAbility || !item.effectId) continue;
        const effId = item.effectId.startsWith("minecraft:") ? item.effectId : `minecraft:${item.effectId}`;
        if (player.hasTag(item.tag)) {
          if (player.hasTag(`${item.tag}_off`)) {
            try { player.removeEffect(effId); } catch (e) {}
          } else {
            safeAddEffect(player, effId, 300, { amplifier: item.amplifier || 0, showParticles: false });
          }
        }
      }
    }
    const stats = statsCache.get(playerId) || { classId: 0, level: 0, souls: 0, perks: 0, levelUpAvailable: false };
    const yaw = player.getRotation().y;
    const angle = (yaw % 360 + 360) % 360;
    const index = Math.round(angle / 5) % 72;
    const centerIndex = index + 72;
    const window = COMPASS_DOUBLE_TAPE.slice(centerIndex - 9, centerIndex + 10);
    const compassText = `\xA7e[  ${window.join(" ")}  ]\xA7r`;
    const maxBossDetectDist = 30;
    let nearestBoss = null;
    let minBossDist = 999;
    try {
      const bosses = player.dimension.getEntities({ location: player.location, maxDistance: maxBossDetectDist, type: "rpg:pillager_boss" });
      const clones = player.dimension.getEntities({ location: player.location, maxDistance: maxBossDetectDist, type: "rpg:pillager_boss_clone" });
      for (const b of [...bosses, ...clones]) {
        const dx = b.location.x - player.location.x;
        const dy = b.location.y - player.location.y;
        const dz = b.location.z - player.location.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < minBossDist) {
          minBossDist = dist;
          nearestBoss = b;
        }
      }
    } catch (e) {}

    let text = "";
    if (nearestBoss && minBossDist <= maxBossDetectDist) {
      // Dynamic Boss HUD: Replaces RPG HUD when near boss
      const distStr = minBossDist.toFixed(1);
      const variantComp = nearestBoss.getComponent("minecraft:variant");
      const variant = variantComp ? variantComp.value : 0;
      const markComp = nearestBoss.getComponent("minecraft:mark_variant");
      const markVariant = markComp ? markComp.value : 0;
      const isClone = nearestBoss.typeId.includes("clone");
      const isFlying = markVariant === 2 || variant === 3 || nearestBoss.hasTag("phase_2");

      let stateName = "\xA78IDLE";
      if (isFlying) {
        if (variant === 1) stateName = "\xA7dFLYING (Beam Attack)";
        else if (variant === 3) stateName = "\xA75CLONE (Airborne)";
        else stateName = "\xA7dAIRBORNE (Hovering)";
      } else {
        if (variant === 0) stateName = "\xA7cMELEE MODE (Smash)";
        else if (variant === 1) stateName = "\xA7aRANGED MODE (Shooting)";
        else if (variant === 2) stateName = "\xA77IDLE MODE";
        else if (variant === 3) stateName = "\xA75CLONE MODE";
      }

      const healthComp = nearestBoss.getComponent("minecraft:health");
      let bossHpText = "";
      if (healthComp) {
        const maxHp = healthComp.effectiveMax || (isClone ? 1 : 500);
        const curHp = healthComp.currentValue;
        const p = Math.max(0, Math.min(1, curHp / maxHp));
        const bars = 20;
        const filled = Math.ceil(p * bars);
        const empty = bars - filled;
        const barStr = "\xA7c" + "|".repeat(filled) + "\xA78" + "|".repeat(empty);
        const name = isClone ? "Boss Clone" : "Pillager Boss";
        bossHpText = `\xA7l\xA75[${name}]\xA7r ${barStr} \xA7e${Math.floor(curHp)}/${maxHp}`;
      }

      const bossAiInfoText = `\xA7e[Boss AI] \xA7fDist: \xA7b${distStr}m \xA7f| State: ${stateName} \xA7f(Variant: ${variant})`;
      text = centerHudLines([compassText, bossHpText, bossAiInfoText]);
    } else {
      // Normal RPG HUD when not in boss combat
      let rpgStatsText = `\xA7l\xA76RPG\xA7r \xA78| \xA7bClass: \xA7e${ClassNames[stats.classId]}\xA7r \xA78| \xA7aLv: \xA7e${stats.level}\xA7r \xA78| \xA7cSouls: \xA7e${stats.souls}\xA7r \xA78| \xA7dPerks: \xA7e${stats.perks}\xA7r`;
      if (stats.levelUpAvailable) {
        rpgStatsText += " \xA78| \xA7a\xA7l[LEVEL UP AVAILABLE]";
      }
      text = centerHudLines([compassText, rpgStatsText]);
    }

    player.onScreenDisplay.setActionBar(player.hasTag("hide_rpg_hud") ? "" : text);
  }
  if (tickCount % 100 === 0) {
    const currentIds = new Set(world10.getAllPlayers().map((p) => p.id));
    for (const cachedId of statsCache.keys()) {
      if (!currentIds.has(cachedId)) {
        statsCache.delete(cachedId);
      }
    }
  }
}, 1);

// src/systems/combat.ts
import { world as world11, system as system8, Player as Player11, EntityDamageCause as EntityDamageCause2, ItemStack as ItemStack5, EnchantmentTypes as EnchantmentTypes4, BlockPermutation as BlockPermutation2 } from "@minecraft/server";
var COOLDOWNS = /* @__PURE__ */ new Map();
var COOLDOWN_MESSAGE_TICKS = /* @__PURE__ */ new Map();
var IK_STATES = /* @__PURE__ */ new Map();
var lastSneakStartTick = /* @__PURE__ */ new Map();
// Ranger projectile state is cached while an arrow is still valid. Bedrock can
// invalidate an arrow before entityHurt finishes, so hit handlers must not read
// tags or components from the projectile after impact.
var RANGER_ARROW_STATES = /* @__PURE__ */ new Map();
var RANGER_BOW_DRAW_STATES = /* @__PURE__ */ new Map();
var RANGER_RECENT_BOW_SHOTS = /* @__PURE__ */ new Map();
var RANGER_FULL_DRAW_TICKS = 20;
var RANGER_DRAW_RESULT_LIFETIME_TICKS = 12;
function getPlayerByIdRanger(playerId) {
  if (!playerId) return void 0;
  return world11.getAllPlayers().find((player) => player.id === playerId);
}
function isRangerBowItemRanger(item) {
  if (!item || item.typeId !== "minecraft:bow") return false;
  const plainName = (item.nameTag || "").replace(/\xA7[0-9a-fk-or]/gi, "").trim();
  return plainName === "Ranger Bow";
}
function playerHasRangerBowEquippedRanger(player) {
  try {
    const equippable = player?.getComponent("minecraft:equippable");
    return isRangerBowItemRanger(equippable?.getEquipment("Mainhand")) || isRangerBowItemRanger(equippable?.getEquipment("Offhand"));
  } catch (e) {
    return false;
  }
}
function beginRangerBowDrawRanger(player) {
  if (!player) return;
  const startTick = system8.currentTick;
  RANGER_BOW_DRAW_STATES.set(player.id, {
    startTick,
    stopTick: -1,
    drawTicks: 0,
    fullyCharged: false,
    expiresTick: startTick + 1200
  });
  const playerId = player.id;
  system8.runTimeout(() => {
    const state = RANGER_BOW_DRAW_STATES.get(playerId);
    if (state && state.startTick === startTick && state.expiresTick <= system8.currentTick) {
      RANGER_BOW_DRAW_STATES.delete(playerId);
    }
  }, 1201);
}
function finishRangerBowDrawRanger(player) {
  if (!player) return { drawTicks: 0, fullyCharged: false };
  const now = system8.currentTick;
  let state = RANGER_BOW_DRAW_STATES.get(player.id);
  if (!state) {
    state = {
      startTick: now,
      stopTick: now,
      drawTicks: 0,
      fullyCharged: false,
      expiresTick: now + RANGER_DRAW_RESULT_LIFETIME_TICKS
    };
  } else if (state.stopTick < 0) {
    state.stopTick = now;
    state.drawTicks = Math.max(0, now - state.startTick);
    state.fullyCharged = state.drawTicks >= RANGER_FULL_DRAW_TICKS;
    state.expiresTick = now + RANGER_DRAW_RESULT_LIFETIME_TICKS;
  }
  RANGER_BOW_DRAW_STATES.set(player.id, state);
  const playerId = player.id;
  const expectedStart = state.startTick;
  system8.runTimeout(() => {
    const current = RANGER_BOW_DRAW_STATES.get(playerId);
    if (current && current.startTick === expectedStart && current.expiresTick <= system8.currentTick) {
      RANGER_BOW_DRAW_STATES.delete(playerId);
    }
  }, RANGER_DRAW_RESULT_LIFETIME_TICKS + 1);
  return { drawTicks: state.drawTicks, fullyCharged: state.fullyCharged };
}
function getRangerBowChargeForShotRanger(player) {
  if (!player) return { drawTicks: 0, fullyCharged: false };
  const now = system8.currentTick;
  const recent = RANGER_RECENT_BOW_SHOTS.get(player.id);
  if (recent && recent.expiresTick >= now) {
    return { drawTicks: recent.drawTicks || 0, fullyCharged: recent.fullyCharged === true };
  }
  const state = RANGER_BOW_DRAW_STATES.get(player.id);
  if (!state) return { drawTicks: 0, fullyCharged: false };
  if (state.stopTick >= 0) {
    if (state.expiresTick < now) return { drawTicks: 0, fullyCharged: false };
    return { drawTicks: state.drawTicks || 0, fullyCharged: state.fullyCharged === true };
  }
  const drawTicks = Math.max(0, now - state.startTick);
  return { drawTicks, fullyCharged: drawTicks >= RANGER_FULL_DRAW_TICKS };
}
function rememberRecentRangerBowShotRanger(player) {
  if (!player || !playerHasRangerBowEquippedRanger(player)) return;
  const drawResult = finishRangerBowDrawRanger(player);
  const expiresTick = system8.currentTick + 20;
  RANGER_RECENT_BOW_SHOTS.set(player.id, {
    drawTicks: drawResult.drawTicks,
    fullyCharged: drawResult.fullyCharged,
    expiresTick
  });
  const playerId = player.id;
  system8.runTimeout(() => {
    const recent = RANGER_RECENT_BOW_SHOTS.get(playerId);
    if (recent && recent.expiresTick <= system8.currentTick) RANGER_RECENT_BOW_SHOTS.delete(playerId);
  }, 21);
}
function findRecentRangerBowShooterNearRanger(entity) {
  try {
    let closest;
    let closestDistance = 8;
    for (const player of world11.getAllPlayers()) {
      if (player.dimension.id !== entity.dimension.id) continue;
      const recent = RANGER_RECENT_BOW_SHOTS.get(player.id);
      const drawState = RANGER_BOW_DRAW_STATES.get(player.id);
      const hasRecent = !!recent && recent.expiresTick >= system8.currentTick;
      const hasActiveDraw = !!drawState && (drawState.stopTick < 0 || drawState.expiresTick >= system8.currentTick);
      if (!hasRecent && !hasActiveDraw) continue;
      const dx = player.location.x - entity.location.x;
      const dy = player.location.y - entity.location.y;
      const dz = player.location.z - entity.location.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = player;
      }
    }
    return closest;
  } catch (e) {
    return void 0;
  }
}
function rememberRangerArrowStateRanger(projectile, state) {
  if (!projectile || !state?.ownerId) return;
  try {
    const tags = projectile.getTags();
    if (!tags.some((tag) => tag.startsWith("ranger_owner:"))) {
      projectile.addTag(`ranger_owner:${state.ownerId}`);
    }
    if (state.fullyCharged && !projectile.hasTag("fully_charged")) projectile.addTag("fully_charged");
    if (!state.isTemporary && !projectile.hasTag("ranger_bow_arrow")) projectile.addTag("ranger_bow_arrow");
  } catch (e) {
  }
  state.effectTargets = state.effectTargets || /* @__PURE__ */ new Set();
  state.heavyDrawTargets = state.heavyDrawTargets || /* @__PURE__ */ new Set();
  state.exploded = state.exploded === true;
  state.expiresTick = system8.currentTick + 400;
  RANGER_ARROW_STATES.set(projectile.id, state);
  const projectileId = projectile.id;
  system8.runTimeout(() => {
    const current = RANGER_ARROW_STATES.get(projectileId);
    if (current && current.expiresTick <= system8.currentTick) RANGER_ARROW_STATES.delete(projectileId);
  }, 401);
}
function tryCaptureRangerArrowStateRanger(entity, attempt = 0) {
  try {
    if (!entity?.isValid()) return;
    const projectile = entity.getComponent("minecraft:projectile");
    let owner = projectile?.owner;
    if (!owner || owner.typeId !== "minecraft:player") {
      const remembered = RANGER_ARROW_STATES.get(entity.id);
      if (remembered?.ownerId) owner = getPlayerByIdRanger(remembered.ownerId);
    }
    if (!owner || owner.typeId !== "minecraft:player") {
      for (const tag of entity.getTags()) {
        if (!tag.startsWith("ranger_owner:")) continue;
        owner = getPlayerByIdRanger(tag.substring("ranger_owner:".length));
        break;
      }
    }
    if (!owner || owner.typeId !== "minecraft:player") {
      owner = findRecentRangerBowShooterNearRanger(entity);
    }
    if (!owner || owner.typeId !== "minecraft:player") {
      if (attempt < 8) system8.runTimeout(() => tryCaptureRangerArrowStateRanger(entity, attempt + 1), 1);
      return;
    }
    const tags = entity.getTags();
    const isTemporary = tags.includes("rpg_temp_ranger_arrow");
    const recent = RANGER_RECENT_BOW_SHOTS.get(owner.id);
    const usesRangerBow = !isTemporary && (playerHasRangerBowEquippedRanger(owner) || !!recent && recent.expiresTick >= system8.currentTick);
    const hasTaggedEffect = tags.includes("ranger_arrow_fire") || tags.includes("ranger_arrow_poison") || tags.includes("ranger_arrow_explosion");
    if (!usesRangerBow && !isTemporary && !hasTaggedEffect) return;
    const fire = tags.includes("ranger_arrow_fire") || usesRangerBow && owner.hasTag("shop_ranger_firearrow") && !owner.hasTag("shop_ranger_firearrow_off");
    const poison = tags.includes("ranger_arrow_poison") || usesRangerBow && owner.hasTag("shop_ranger_poisonarrow") && !owner.hasTag("shop_ranger_poisonarrow_off");
    const explosive = tags.includes("ranger_arrow_explosion") || usesRangerBow && owner.hasTag("shop_ranger_explosion") && !owner.hasTag("shop_ranger_explosion_off");
    const chargeResult = getRangerBowChargeForShotRanger(owner);
    const fullyCharged = usesRangerBow && !isTemporary && chargeResult.fullyCharged;
    rememberRangerArrowStateRanger(entity, {
      ownerId: owner.id,
      fire,
      poison,
      explosive,
      fullyCharged,
      isTemporary
    });
  } catch (e) {
    if (attempt < 5) {
      system8.runTimeout(() => tryCaptureRangerArrowStateRanger(entity, attempt + 1), 1);
    } else {
      console.warn(e);
    }
  }
}
function resolveRangerArrowOwnerRanger(projectile, source, cachedState) {
  if (source?.typeId === "minecraft:player") return source;
  if (cachedState?.ownerId) {
    const cachedOwner = getPlayerByIdRanger(cachedState.ownerId);
    if (cachedOwner) return cachedOwner;
  }
  try {
    if (projectile?.isValid()) {
      const componentOwner = projectile.getComponent("minecraft:projectile")?.owner;
      if (componentOwner?.typeId === "minecraft:player") return componentOwner;
      for (const tag of projectile.getTags()) {
        if (tag.startsWith("ranger_owner:")) return getPlayerByIdRanger(tag.substring("ranger_owner:".length));
      }
    }
  } catch (e) {
  }
  return void 0;
}
function getFallbackRangerArrowStateRanger(player) {
  if (!player) return void 0;
  const recent = RANGER_RECENT_BOW_SHOTS.get(player.id);
  const hasRecent = !!recent && recent.expiresTick >= system8.currentTick;
  if (!hasRecent && !playerHasRangerBowEquippedRanger(player)) return void 0;
  return {
    ownerId: player.id,
    fire: player.hasTag("shop_ranger_firearrow") && !player.hasTag("shop_ranger_firearrow_off"),
    poison: player.hasTag("shop_ranger_poisonarrow") && !player.hasTag("shop_ranger_poisonarrow_off"),
    explosive: player.hasTag("shop_ranger_explosion") && !player.hasTag("shop_ranger_explosion_off"),
    fullyCharged: hasRecent && recent.fullyCharged === true,
    isTemporary: false,
    effectTargets: /* @__PURE__ */ new Set(),
    heavyDrawTargets: /* @__PURE__ */ new Set(),
    exploded: false,
    expiresTick: system8.currentTick + 40
  };
}
function markProjectileExplodedRanger(projectile) {
  try {
    if (projectile?.isValid() && !projectile.hasTag("exploded")) projectile.addTag("exploded");
  } catch (e) {
  }
}
function triggerRangerArrowExplosionRanger(projectile, location, player, state) {
  if (!state || state.exploded || !state.explosive || !player) return;
  state.exploded = true;
  markProjectileExplodedRanger(projectile);
  if (state.isTemporary) {
    player.dimension.createExplosion(location, 2.5, {
      breaksBlocks: false,
      causesFire: false,
      source: player
    });
    return;
  }
  const shouldDestroy = player.hasTag("destroy_blocks");
  player.dimension.createExplosion(location, 3, {
    breaksBlocks: shouldDestroy,
    causesFire: shouldDestroy,
    source: player
  });
  const entities = player.dimension.getEntities({ location, maxDistance: 4 });
  for (const entity of entities) {
    if (entity.id === player.id) continue;
    try {
      entity.applyDamage(10, { cause: EntityDamageCause2.entityExplosion, damagingEntity: player });
      entity.setOnFire(6, true);
    } catch (e) {
      console.warn(e);
    }
  }
}
function applyRangerArrowEffectsRanger(target, player, projectile, state) {
  if (!target || !player || !state || target.id === player.id) return;
  if (state.effectTargets.has(target.id)) return;
  state.effectTargets.add(target.id);
  if (state.fire) {
    try {
      target.setOnFire(12, true);
      target.applyDamage(6, { cause: "fire", damagingEntity: player });
    } catch (e) {
      console.warn(e);
    }
  }
  if (state.poison) {
    try {
      target.addEffect("minecraft:poison", 6 * 20, { amplifier: 0 });
    } catch (e) {
      console.warn(e);
    }
  }
  if (state.explosive) {
    triggerRangerArrowExplosionRanger(projectile, target.location, player, state);
  }
}
function applyRangerHeavyDrawRanger(target, player, state, originalDamage) {
  if (!target || !player || !state || target.id === player.id) return;
  if (!state.fullyCharged || state.isTemporary) return;
  if (!player.hasTag("shop_ranger_deadarrow") || player.hasTag("shop_ranger_deadarrow_off")) return;
  if (state.heavyDrawTargets.has(target.id)) return;
  state.heavyDrawTargets.add(target.id);
  const health = target.getComponent("minecraft:health");
  if (health) {
    health.setCurrentValue(Math.max(0, health.currentValue - originalDamage));
  }
}
function sendCooldownMessageThrottled(player, key, message) {
  const messageKey = `${player.id}:${key}`;
  const nextAllowedTick = COOLDOWN_MESSAGE_TICKS.get(messageKey) ?? 0;
  if (system8.currentTick < nextAllowedTick) return;
  COOLDOWN_MESSAGE_TICKS.set(messageKey, system8.currentTick + 60);
  player.sendMessage(message);
}
function checkCooldown(player, key, cooldownSeconds) {
  if (COOLDOWNS.has(key)) {
    const remaining = COOLDOWNS.get(key) - system8.currentTick;
    if (remaining > 0) {
      sendCooldownMessageThrottled(player, key, `\xA7cAbility is on cooldown! (${(remaining / 20).toFixed(1)}s)`);
      return true;
    }
  }
  return false;
}
function dealTrueDamage(target, amount, player) {
  const healthComp = target.getComponent("minecraft:health");
  if (!healthComp) return;
  const newHealth = Math.max(0, healthComp.currentValue - amount);
  if (newHealth <= 0) {
    try {
      target.applyDamage(amount, { cause: EntityDamageCause2.entityAttack, damagingEntity: player });
    } catch (e) {
      healthComp.setCurrentValue(0);
    }
  } else {
    healthComp.setCurrentValue(newHealth);
  }
}
var shieldTickTimer = 0;
var rangerBowRecoveryTickTimer = 0;
var mapTickTimer = 0;
var petsMageTickTimer = 0;
var assassinPotionTickTimer = 0;
var backupTickTimer = 0;
var effectsTickTimer = 0;
var medkitTickTimer = 0;
var disharmTickTimer = 0;
var backupDays = 0;
function inventoryHasItem(player, typeId) {
  const inventory = player.getComponent("minecraft:inventory");
  if (!inventory || !inventory.container) return false;
  for (let slot = 0; slot < inventory.container.size; slot++) {
    const item = inventory.container.getItem(slot);
    if (item && item.typeId === typeId) return true;
  }
  return false;
}
function addItemIfMissing(player, typeId, commandFallback) {
  if (inventoryHasItem(player, typeId)) return;
  try {
    if (commandFallback) {
      player.runCommand(commandFallback);
    } else {
      giveOrDropItem(player, new ItemStack5(typeId, 1));
    }
  } catch (e) {
    console.warn(`[Simple RPG] Failed to give ${typeId}: ${e}`);
  }
}
const TIMED_REWARD_CONFIG = {
};
function getTimedRewardNext(player, key) {
  try {
    const value = player.getDynamicProperty(key);
    return typeof value === "number" ? value : 0;
  } catch (e) {
    return 0;
  }
}
function setTimedRewardNext(player, key, value) {
  try {
    player.setDynamicProperty(key, value);
  } catch (e) {
    console.warn(`[Simple RPG] Failed to save reward cooldown: ${e}`);
  }
}
function grantTimedSkillRewardImmediately(player, skillTag) {
  const config = TIMED_REWARD_CONFIG[skillTag];
  if (!config) return;
  addItemIfMissing(player, config.typeId, config.command);
  setTimedRewardNext(player, config.key, Date.now() + config.cooldownMs);
}
function processTimedSkillReward(player, skillTag) {
  const config = TIMED_REWARD_CONFIG[skillTag];
  if (!config || config.oneTime || !player.hasTag(skillTag) || player.hasTag(`${skillTag}_off`)) return;
  const now = Date.now();
  const next = getTimedRewardNext(player, config.key);
  if (next <= 0) {
    setTimedRewardNext(player, config.key, now + config.cooldownMs);
    return;
  }
  if (now >= next && !inventoryHasItem(player, config.typeId)) {
    addItemIfMissing(player, config.typeId, config.command);
    setTimedRewardNext(player, config.key, now + config.cooldownMs);
  }
}
var MAGE_ENCHANTMENT_POOL = [
  "protection", "fire_protection", "feather_falling", "blast_protection", "projectile_protection",
  "respiration", "aqua_affinity", "thorns", "depth_strider", "frost_walker", "binding", "sharpness",
  "smite", "bane_of_arthropods", "knockback", "fire_aspect", "looting", "sweeping", "efficiency",
  "silk_touch", "unbreaking", "fortune", "power", "punch", "flame", "infinity", "luck_of_the_sea",
  "lure", "loyalty", "impaling", "riptide", "channeling", "multishot", "quick_charge", "piercing",
  "mending", "vanishing", "soul_speed", "swift_sneak"
];
var MAGE_BLESSING_EFFECTS = [
  "minecraft:regeneration", "minecraft:speed", "minecraft:haste", "minecraft:strength", "minecraft:jump_boost", "minecraft:resistance", "minecraft:fire_resistance",
  "minecraft:water_breathing", "minecraft:invisibility", "minecraft:night_vision", "minecraft:absorption", "minecraft:saturation", "minecraft:slow_falling", "minecraft:conduit_power"
];

function initCombatSystem() {


  system8.runInterval(() => {
    shieldTickTimer += 40;
    rangerBowRecoveryTickTimer += 40;
    const doRangerBowRecovery = rangerBowRecoveryTickTimer >= 400;
    if (doRangerBowRecovery) {
      rangerBowRecoveryTickTimer = 0;
    }
    const doShieldHeal = shieldTickTimer >= 1500;
    if (doShieldHeal) {
      shieldTickTimer = 0;
    }
    backupTickTimer += 40;
    const doBackupDaily = backupTickTimer >= 24e3;
    if (doBackupDaily) {
      backupTickTimer = 0;
      backupDays++;
    }
    effectsTickTimer += 40;
    const doEffects = effectsTickTimer >= 7200;
    if (doEffects) effectsTickTimer = 0;
    medkitTickTimer += 40;
    const doMedkitHeal = medkitTickTimer >= 6000;
    if (doMedkitHeal) medkitTickTimer = 0;
    disharmTickTimer += 40;
    const doDisharm = disharmTickTimer >= 6e3;
    if (doDisharm) disharmTickTimer = 0;
    const classObj = world11.scoreboard.getObjective("class");
    const levelObj = world11.scoreboard.getObjective("level");
    if (!classObj) return;
    for (const player of world11.getAllPlayers()) {
      if (!player.isValid()) continue;
      const classId = classObj.getScore(player) ?? 0;
      if (classId === 0) continue;
      if (classId === 2) {
        const rangerLevel = levelObj?.getScore(player) ?? 1;
        maintainRangerBow(player, rangerLevel, false);
      }
      if (classId === 4 && player.hasTag("shop_assassin_bow")) {
        maintainAssassinBow(player, false);
      }
      if (player.hasTag("shop_petsmage")) {
        const ownerTag = `guard_owner_${player.id}`;
        try {
          for (const warden of player.dimension.getEntities({ type: "minecraft:warden" })) {
            if (warden.hasTag(ownerTag) && warden.isValid()) {
              try { player.removeEffect("minecraft:darkness"); } catch (e) {}
              const isSitting = player.hasTag("warden_sitting");
              if (!isSitting) {
                const dx = warden.location.x - player.location.x;
                const dy = warden.location.y - player.location.y;
                const dz = warden.location.z - player.location.z;
                const distSq = dx * dx + dy * dy + dz * dz;
                if (distSq > 324 || warden.dimension.id !== player.dimension.id) {
                  warden.teleport(player.location, { dimension: player.dimension });
                  try {
                    player.dimension.spawnParticle("minecraft:sculk_soul_particle", player.location);
                  } catch (_) {}
                }
              }
            }
          }
        } catch (_) {}
      }
      const shopItems = getShopItemsForClass(classId);
      for (const item of shopItems) {
        if (item.effectId && player.hasTag(item.tag) && !player.hasTag(`${item.tag}_off`)) {
          let amplifier = 0;
          if (item.name.includes("II")) amplifier = 1;
          if (item.name.includes("III")) amplifier = 2;
          safeAddEffect(player, item.effectId, 300, { amplifier, showParticles: false });
        }
      }
      if (doBackupDaily) {
        if (player.hasTag("shop_enchantment") && !player.hasTag("shop_enchantment_off")) {
          const randomEnchant = MAGE_ENCHANTMENT_POOL[Math.floor(Math.random() * MAGE_ENCHANTMENT_POOL.length)];
          try {
            const book = new ItemStack5("minecraft:enchanted_book", 1);
            const enchComp = book.getComponent("minecraft:enchantable");
            if (EnchantmentTypes4.get(randomEnchant)) {
              enchComp.addEnchantment({ type: EnchantmentTypes4.get(randomEnchant), level: 1 });
            }
            const eqComp = player.getComponent("minecraft:inventory");
            if (eqComp && eqComp.container) {
              const leftover = eqComp.container.addItem(book);
              if (leftover) player.dimension.spawnItem(leftover, player.location);
              player.sendMessage(`\xA7d[Enchantment] \xA7fYou received an enchanted book of ${randomEnchant}!`);
            }
          } catch (e) {
            player.sendMessage(`\xA7cFailed to generate enchantment: ${randomEnchant}`);
          }
        }
      }
      if (doEffects) {
        if (player.hasTag("shop_effectmage") && !player.hasTag("shop_effectmage_off")) {
          const randomEffect = MAGE_BLESSING_EFFECTS[Math.floor(Math.random() * MAGE_BLESSING_EFFECTS.length)];
          player.addEffect(randomEffect, 20 * 60, { amplifier: 0, showParticles: true });
          player.sendMessage(`\xA7d[Effect Mage] \xA7fYou received a random blessing: ${randomEffect} for 1 minute!`);
        }
      }
      if (player.hasTag("active_spell:invisibility")) {
        const equippable = player.getComponent("minecraft:equippable");
        if (equippable) {
          const mainhand = equippable.getEquipment("Mainhand");
          if (mainhand && mainhand.typeId === "rpg:mage_staff") {
            player.addEffect("minecraft:invisibility", 300, { amplifier: 0, showParticles: false });
          }
        }
      }
      let hasWarriorHearts = false;
      if (player.hasTag("shop_heart") && !player.hasTag("shop_heart_off")) {
        hasWarriorHearts = true;
        if (!player.getEffect("minecraft:health_boost") || player.getEffect("minecraft:health_boost")?.amplifier !== 2) {
          player.addEffect("minecraft:health_boost", 2e7, { amplifier: 2, showParticles: false });
        }
        if (!player.hasTag("applied_warrior_health_boost")) {
          player.addTag("applied_warrior_health_boost");
        }
      }
      if (!hasWarriorHearts && player.hasTag("applied_warrior_health_boost")) {
        try { player.removeEffect("minecraft:health_boost"); } catch (e) {}
        player.removeTag("applied_warrior_health_boost");
      }
      if (player.hasTag("shop_groundsmash") && !player.hasTag("shop_groundsmash_off")) {
        player.addEffect("minecraft:resistance", 300, { amplifier: 0, showParticles: false });
      }
      if (player.hasTag("shop_healthmet") && !player.hasTag("shop_healthmet_off")) {
        const equippable = player.getComponent("minecraft:equippable");
        if (equippable) {
          const headItem = equippable.getEquipment("Head");
          if (headItem) {
            player.addEffect("minecraft:regeneration", 300, { amplifier: 0, showParticles: false });
          }
        }
      }
      if (player.hasTag("shop_armour") && !player.hasTag("shop_armour_off")) {
        const equippable = player.getComponent("minecraft:equippable");
        if (equippable) {
          const headItem = equippable.getEquipment("Head");
          const chestItem = equippable.getEquipment("Chest");
          const legsItem = equippable.getEquipment("Legs");
          const feetItem = equippable.getEquipment("Feet");
          if (headItem && chestItem && legsItem && feetItem) {
            player.addEffect("minecraft:resistance", 300, { amplifier: 1, showParticles: false });
            player.addEffect("minecraft:jump_boost", 300, { amplifier: 0, showParticles: false });
          }
        }
      }
      if (doShieldHeal && player.hasTag("shop_shield") && !player.hasTag("shop_shield_off")) {
        const equippable = player.getComponent("minecraft:equippable");
        if (equippable) {
          const offhand = equippable.getEquipment("Offhand");
          if (offhand && offhand.typeId === "minecraft:shield") {
            const health = player.getComponent("minecraft:health");
            if (health) {
              const newHealth = Math.min(health.currentValue + 10, health.effectiveMax);
              health.setCurrentValue(newHealth);
              player.dimension.spawnParticle("minecraft:heart_particle", player.location);
            }
          }
        }
      }
      if (classId === 4) {
        if (!player.hasTag("active_assassin_dash")) {
          player.addTag("active_assassin_dash");
        }
      } else {
        if (player.hasTag("active_assassin_dash")) {
          player.removeTag("active_assassin_dash");
        }
      }
      if (player.hasTag("shop_assassin_speed") && !player.hasTag("shop_assassin_speed_off")) {
        player.addEffect("minecraft:speed", 300, { amplifier: 1, showParticles: false });
      }
      if (player.hasTag("shop_assassin_skill") && !player.hasTag("shop_assassin_skill_off")) {
        player.addEffect("minecraft:speed", 300, { amplifier: 0, showParticles: false });
      }
      if (player.nameTag === "") player.nameTag = player.name;
      let hasAssassinHearts = false;
      if (player.hasTag("shop_assassin_hearts") && !player.hasTag("shop_assassin_hearts_off")) {
        hasAssassinHearts = true;
        if (!player.getEffect("minecraft:health_boost") || player.getEffect("minecraft:health_boost")?.amplifier !== 2) {
          player.addEffect("minecraft:health_boost", 2e7, { amplifier: 2, showParticles: false });
        }
        if (!player.getEffect("minecraft:regeneration") || player.getEffect("minecraft:regeneration")?.duration < 100) {
          player.addEffect("minecraft:regeneration", 2e7, { amplifier: 0, showParticles: false });
        }
        if (!player.hasTag("applied_assassin_health_boost")) {
          player.addTag("applied_assassin_health_boost");
        }
      }
      if (!hasAssassinHearts && player.hasTag("applied_assassin_health_boost")) {
        try { player.removeEffect("minecraft:health_boost"); } catch (e) {}
        try { player.removeEffect("minecraft:regeneration"); } catch (e) {}
        player.removeTag("applied_assassin_health_boost");
      }
      if (doBackupDaily && player.hasTag("shop_assassin_arrow") && !player.hasTag("shop_assassin_arrow_off")) {
        const inv = player.getComponent("minecraft:inventory");
        if (inv && inv.container) {
          try {
            const leftover = inv.container.addItem(new ItemStack5("minecraft:arrow", 7));
            if (leftover) player.dimension.spawnItem(leftover, player.location);
          } catch (e) {
            console.warn(e);
          }
        }
      }
      if (doDisharm && player.hasTag("shop_assassin_disharm") && !player.hasTag("shop_assassin_disharm_off")) {
        player.addEffect("minecraft:invisibility", 400, { amplifier: 0, showParticles: false });
        player.addTag("active_disharm_immunity");
        player.sendMessage("\xA78[Assassin] \xA7fYou vanish into the shadows! Protected from most damage for 20s.");
        system8.runTimeout(() => {
          if (player.isValid()) player.removeTag("active_disharm_immunity");
        }, 400);
      }
      if (player.hasTag("shop_survivor_boot") && !player.hasTag("shop_survivor_boot_off")) {
        const equippable = player.getComponent("minecraft:equippable");
        if (equippable && equippable.getEquipment("Feet")) {
          player.addEffect("minecraft:speed", 300, { amplifier: 0, showParticles: false });
        }
      }
      let hasChestplate = false;
      if (player.hasTag("shop_survivor_healing") && !player.hasTag("shop_survivor_healing_off")) {
        const equippable = player.getComponent("minecraft:equippable");
        if (equippable && equippable.getEquipment("Chest")) {
          hasChestplate = true;
          if (player.hasTag("shop_survivor_medkit") && !player.hasTag("shop_survivor_medkit_off")) {
            if (!player.getEffect("minecraft:health_boost") || player.getEffect("minecraft:health_boost")?.amplifier !== 4) {
              player.addEffect("minecraft:health_boost", 2e7, { amplifier: 4, showParticles: false });
            }
          } else {
            if (!player.getEffect("minecraft:health_boost") || player.getEffect("minecraft:health_boost")?.amplifier !== 1) {
              player.addEffect("minecraft:health_boost", 2e7, { amplifier: 1, showParticles: false });
            }
          }
          player.addEffect("minecraft:regeneration", 300, { amplifier: 0, showParticles: false });
          if (!player.hasTag("applied_survivor_health_boost")) {
            player.addTag("applied_survivor_health_boost");
          }
        }
      }
      if (!hasChestplate && player.hasTag("applied_survivor_health_boost")) {
        try { player.removeEffect("minecraft:health_boost"); } catch (e) {}
        player.removeTag("applied_survivor_health_boost");
      }
      if (doBackupDaily && player.hasTag("shop_survivor_backup") && !player.hasTag("shop_survivor_backup_off")) {
        const inv = player.getComponent("minecraft:inventory");
        if (inv && inv.container) {
          try {
            const items = [
              new ItemStack5("minecraft:golden_carrot", 5),
              new ItemStack5("minecraft:bread", 10),
              new ItemStack5("minecraft:cobblestone", 30)
            ];
            if (backupDays % 5 === 0) {
              items.push(new ItemStack5("minecraft:enchanted_golden_apple", 1));
            }
            for (const item of items) {
              const leftover = inv.container.addItem(item);
              if (leftover) player.dimension.spawnItem(leftover, player.location);
            }
            player.sendMessage("\xA7aAdventure's Reserve supplies arrived!");
          } catch (e) {
            console.warn(e);
          }
        }
      }
      if (doMedkitHeal && player.hasTag("shop_survivor_medkit") && !player.hasTag("shop_survivor_medkit_off") && player.hasTag("shop_survivor_healing") && !player.hasTag("shop_survivor_healing_off")) {
        const health = player.getComponent("minecraft:health");
        if (health) {
          const newHealth = Math.min(health.currentValue + 10, health.effectiveMax);
          health.setCurrentValue(newHealth);
          player.dimension.spawnParticle("minecraft:heart_particle", player.location);
          player.sendMessage("\xA7aMedkit healed you!");
        }
      }
      if (doEffects && player.hasTag("shop_survivor_effect") && !player.hasTag("shop_survivor_effect_off")) {
        const buffs = ["minecraft:speed", "minecraft:jump_boost", "minecraft:haste", "minecraft:strength"];
        const buff = buffs[Math.floor(Math.random() * buffs.length)];
        player.addEffect(buff, 1200, { amplifier: 0, showParticles: true });
        player.sendMessage(`\xA7aRandom Effect triggered: ${buff}!`);
      }
      if (player.hasTag("shop_survivor_vision") && !player.hasTag("shop_survivor_vision_off")) {
        player.addEffect("minecraft:night_vision", 400, { amplifier: 0, showParticles: false });
      }

      if (player.hasTag("shop_ranger_agility") && !player.hasTag("shop_ranger_agility_off")) {
        player.addEffect("minecraft:speed", 300, { amplifier: 0, showParticles: false });
      }
      let targetRangerAmplifier = -1;
      let hasRangerHearts = player.hasTag("shop_ranger_hearts") && !player.hasTag("shop_ranger_hearts_off");
      let hasArcherSafe = player.hasTag("shop_ranger_archersafe") && !player.hasTag("shop_ranger_archersafe_off");
      if (hasRangerHearts) {
        targetRangerAmplifier = 2;
        player.addEffect("minecraft:regeneration", 300, { amplifier: 0, showParticles: false });
      }
      if (hasArcherSafe) {
        player.addEffect("minecraft:resistance", 300, { amplifier: 0, showParticles: false });
        const equippable = player.getComponent("minecraft:equippable");
        if (equippable) {
          const mainhand = equippable.getEquipment("Mainhand");
          if (mainhand && mainhand.typeId === "minecraft:bow") {
            player.addEffect("minecraft:speed", 300, { amplifier: 1, showParticles: false });
            if (hasRangerHearts) {
              targetRangerAmplifier = 3;
            } else {
              targetRangerAmplifier = 0;
            }
          }
        }
      }
      if (targetRangerAmplifier >= 0) {
        if (!player.getEffect("minecraft:health_boost") || player.getEffect("minecraft:health_boost")?.amplifier !== targetRangerAmplifier) {
          player.addEffect("minecraft:health_boost", 2e7, { amplifier: targetRangerAmplifier, showParticles: false });
        }
        if (!player.hasTag("applied_ranger_health_boost")) {
          player.addTag("applied_ranger_health_boost");
        }
      } else if (player.hasTag("applied_ranger_health_boost")) {
        try { player.removeEffect("minecraft:health_boost"); } catch (e) {}
        player.removeTag("applied_ranger_health_boost");
      }
      if (player.hasTag("shop_ranger_armour") && !player.hasTag("shop_ranger_armour_off")) {
        const equippable = player.getComponent("minecraft:equippable");
        if (equippable) {
          const headItem = equippable.getEquipment("Head");
          const chestItem = equippable.getEquipment("Chest");
          const legsItem = equippable.getEquipment("Legs");
          const feetItem = equippable.getEquipment("Feet");
          if (headItem && chestItem && legsItem && feetItem) {
            player.addEffect("minecraft:resistance", 300, { amplifier: 1, showParticles: false });
          }
          if (feetItem) {
            player.addEffect("minecraft:slow_falling", 300, { amplifier: 1, showParticles: false });
          }
        }
      }
      if (player.hasTag("shop_ranger_arrowsunlimi") && !player.hasTag("shop_ranger_arrowsunlimi_off")) {
        const equippable = player.getComponent("minecraft:equippable");
        if (equippable) {
          const mainhand = equippable.getEquipment("Mainhand");
          const offhand = equippable.getEquipment("Offhand");
          if (mainhand && mainhand.typeId === "minecraft:bow" || offhand && offhand.typeId === "minecraft:bow") {
            const inv = player.getComponent("minecraft:inventory");
            if (inv && inv.container) {
              let hasArrow = false;
              for (let i = 0; i < inv.container.size; i++) {
                const item = inv.container.getItem(i);
                if (item && item.typeId === "minecraft:arrow") {
                  hasArrow = true;
                  break;
                }
              }
              if (!hasArrow) {
                giveOrDropItem(player, new ItemStack5("minecraft:arrow", 1));
              }
            }
          }
        }
      }

    }
  }, 40);
  world11.afterEvents.entityHitEntity.subscribe((event) => {
    const damager = event.damagingEntity;
    const target = event.hitEntity;
    
    // Original player logic
    const player = damager;
    if (player.typeId !== "minecraft:player") return;
    const equippable = player.getComponent("minecraft:equippable");
    const weapon = equippable ? equippable.getEquipment("Mainhand") : void 0;
    if (weapon && (weapon.typeId === "test:vibranium_sword" || weapon.typeId === "rpg:vibranium_sword")) {
      if (Math.random() < 0.15) {
        const dim = player.dimension;
        const hitPos = target.location;
        try {
          dim.spawnParticle("minecraft:knockback_roar_particle", hitPos);
          dim.playSound("ambient.weather.thunder", hitPos, { volume: 0.8, pitch: 1.5 });
          const targets = dim.getEntities({
            location: hitPos,
            maxDistance: 4,
            excludeTypes: ["minecraft:player"]
          });
          for (const entity of targets) {
            let dx = entity.location.x - hitPos.x;
            let dz = entity.location.z - hitPos.z;
            let len = Math.sqrt(dx * dx + dz * dz);
            if (len === 0) {
              dx = 1;
              dz = 0;
              len = 1;
            }
            try {
              entity.applyKnockback(dx / len, dz / len, 1.2, 0.3);
              const damageAmount = Math.floor(Math.random() * 2) + 3;
              dealTrueDamage(entity, damageAmount, player);
            } catch (e) { console.warn("Caught error:", e, e?.stack); }
          }
        } catch (e) { console.warn("Caught error:", e, e?.stack); }
      }
    }
    if (player.hasTag("shop_dual_sword")) {
      let extraDamage = 0;
      if (!weapon) {
        extraDamage = 1;
      } else if (weapon.typeId.endsWith("_sword")) {
        if (weapon.typeId === "minecraft:wooden_sword" || weapon.typeId === "minecraft:golden_sword") extraDamage = 2;
        else if (weapon.typeId === "minecraft:stone_sword") extraDamage = 3;
        else if (weapon.typeId === "minecraft:iron_sword") extraDamage = 4;
        else if (weapon.typeId === "minecraft:diamond_sword") extraDamage = 4;
        else if (weapon.typeId === "minecraft:netherite_sword") extraDamage = 5;
      }
      if (extraDamage > 0) {
        dealTrueDamage(target, extraDamage, player);
      }
    }
    if (player.hasTag("shop_assassin_dagger") && !player.hasTag("shop_assassin_dagger_off")) {
      dealTrueDamage(target, 3, player);
    }
    if (player.hasTag("shop_assassin_critical") && !player.hasTag("shop_assassin_critical_off")) {
      if (!player.isOnGround) {
        const cooldownKey = `assassin_critical_cd_${player.id}`;
        const currentTick = system8.currentTick;
        if ((COOLDOWNS.get(cooldownKey) ?? 0) <= currentTick) {
          const readyTick = currentTick + 120 * 20;
          const playerId = player.id;
          COOLDOWNS.set(cooldownKey, readyTick);
          dealTrueDamage(target, 7, player);
          player.sendMessage("\xA7c\u2605 [Surprise Attack] \xA7f7 bonus damage!");
          system8.runTimeout(() => {
            if ((COOLDOWNS.get(cooldownKey) ?? 0) !== readyTick || system8.currentTick < readyTick) return;
            const currentPlayer = world11.getEntity(p);
            if (currentPlayer?.isValid()) {
              currentPlayer.sendMessage("\xA7aYour Surprise Attack is Ready!");
            }
            COOLDOWNS.delete(cooldownKey);
          }, 120 * 20 + 1);
        }
      }
    }
    if (player.hasTag("shop_assassin_lethal") && !player.hasTag("shop_assassin_lethal_off")) {
      const cooldownKey = `assassin_lethal_cd_${player.id}`;
      const currentTick = system8.currentTick;
      if ((COOLDOWNS.get(cooldownKey) ?? 0) <= currentTick) {
        const readyTick = currentTick + 75 * 20;
        const playerId = player.id;
        const health = player.getComponent("minecraft:health");
        if (health) {
          COOLDOWNS.set(cooldownKey, readyTick);
          health.setCurrentValue(Math.min(health.effectiveMax, health.currentValue + 10));
          player.dimension.spawnParticle("minecraft:heart_particle", player.location);
          player.sendMessage("\xA7c\u2605 [Vampiric Strike] \xA7fHealed 5 hearts!");
          system8.runTimeout(() => {
            if ((COOLDOWNS.get(cooldownKey) ?? 0) !== readyTick || system8.currentTick < readyTick) return;
            const currentPlayer = world11.getEntity(p);
            if (currentPlayer?.isValid()) {
              currentPlayer.sendMessage("\xA7aYour Vampiric Strike is Ready!");
            }
            COOLDOWNS.delete(cooldownKey);
          }, 75 * 20 + 1);
        }
      }
    }
    if (player.hasTag("shop_assassin_instantkill") && !player.hasTag("shop_assassin_instantkill_off")) {
      const currentTime = system8.currentTick;
      const targetId = target.id;
      const ikDataKey = `ik_${player.id}_${targetId}`;
      const ikState = IK_STATES.get(ikDataKey) || { hits: 0, firstHitTick: 0 };
      if (currentTime - ikState.firstHitTick > 100) {
        ikState.hits = 1;
        ikState.firstHitTick = currentTime;
      } else {
        ikState.hits++;
      }
      IK_STATES.set(ikDataKey, ikState);
      if (ikState.hits >= 3) {
        let applyKill = true;
        const cdKey = `ik_cd_${player.id}`;
        if ((COOLDOWNS.get(cdKey) ?? 0) > currentTime) {
          applyKill = false;
        }
        if (applyKill && target.typeId !== "minecraft:player") {
          const mobIkKey = `ik_mob_${targetId}`;
          if (COOLDOWNS.get(mobIkKey)) {
            applyKill = false;
          } else {
            COOLDOWNS.set(mobIkKey, 1);
          }
        }
        if (applyKill) {
          const readyTick = currentTime + 60 * 20;
          const playerId = player.id;
          COOLDOWNS.set(cdKey, readyTick);
          system8.runTimeout(() => {
            // Look the player up again instead of relying on the old event object.
            // The extra tick also prevents the callback from running just before readyTick.
            if ((COOLDOWNS.get(cdKey) ?? 0) !== readyTick || system8.currentTick < readyTick) return;
            const currentPlayer = world11.getEntity(p);
            if (currentPlayer?.isValid()) {
              currentPlayer.sendMessage("\xA7aYour Deadly Strike is Ready!");
            }
            COOLDOWNS.delete(cdKey);
          }, 60 * 20 + 1);
          dealTrueDamage(target, 40, player);
          player.dimension.spawnParticle("minecraft:large_explosion", target.location);
          player.sendMessage("\xA7c[Deadly Strike] \xA7fCombo triggered! 40 bonus damage!");
        }
        ikState.hits = 0;
        IK_STATES.set(ikDataKey, ikState);
      }
    }
  });
  world11.afterEvents.entityHurt.subscribe((event) => {
    const hurtPlayer = event.hurtEntity;
    const attacker = event.damageSource?.damagingEntity;

    // Warden Guard Dog AI - Defend Owner when Owner is attacked
    if (hurtPlayer && hurtPlayer.typeId === "minecraft:player" && attacker) {
      if (!hurtPlayer.hasTag("warden_sitting")) {
        const ownerTag = `guard_owner_${hurtPlayer.id}`;
        try {
          for (const warden of hurtPlayer.dimension.getEntities({ type: "minecraft:warden" })) {
            if (warden.hasTag(ownerTag) && warden.isValid() && attacker.id !== warden.id) {
              dealTrueDamage(attacker, 8, warden);
              break;
            }
          }
        } catch (_) {}
      }
    }

    // Warden Guard Dog AI - Assist Owner when Owner attacks a target
    if (attacker && attacker.typeId === "minecraft:player" && hurtPlayer) {
      if (!attacker.hasTag("warden_sitting")) {
        const ownerTag = `guard_owner_${attacker.id}`;
        try {
          for (const warden of attacker.dimension.getEntities({ type: "minecraft:warden" })) {
            if (warden.hasTag(ownerTag) && warden.isValid() && hurtPlayer.id !== warden.id && hurtPlayer.id !== attacker.id) {
              dealTrueDamage(hurtPlayer, 8, warden);
              break;
            }
          }
        } catch (_) {}
      }
    }

    if (hurtPlayer.typeId === "minecraft:player" && attacker) {
      if (hurtPlayer.hasTag("shop_survivor_thrones") && !hurtPlayer.hasTag("shop_survivor_thrones_off")) {
        try {
          attacker.addEffect("minecraft:poison", 200, { amplifier: 0 });
        } catch (e) {
          console.warn(e);
        }
      }
      if (hurtPlayer.hasTag("shop_assassin_poison") && !hurtPlayer.hasTag("shop_assassin_poison_off")) {
        try {
          attacker.addEffect("minecraft:poison", 500, { amplifier: 0 });
        } catch (e) {
          console.warn(e);
        }
      }
      if (hurtPlayer.hasTag("shop_assassin_instantkill") && !hurtPlayer.hasTag("shop_assassin_instantkill_off")) {
        for (const [key] of IK_STATES) {
          if (key.startsWith(`ik_${hurtPlayer.id}_`)) {
            IK_STATES.delete(key);
          }
        }
      }
      if (hurtPlayer.hasTag("shop_fire_slash") && !hurtPlayer.hasTag("shop_fire_slash_off")) {
        try {
          attacker.setOnFire(5, true);
        } catch (e) {
          console.warn(e);
        }
      }
    }
    if (hurtPlayer.typeId === "minecraft:player") {
      if (hurtPlayer.hasTag("shop_ranger_explosion") && !hurtPlayer.hasTag("shop_ranger_explosion_off")) {
        const cause = event.damageSource?.cause;
        if (cause === EntityDamageCause2.blockExplosion || cause === EntityDamageCause2.entityExplosion || cause === EntityDamageCause2.none) {
          if (event.damageSource?.damagingEntity?.id === hurtPlayer.id) {
            const health = hurtPlayer.getComponent("minecraft:health");
            if (health && health.currentValue > 0) {
              try {
                const newHealth = Math.min(health.effectiveMax, health.currentValue + event.damage);
                health.setCurrentValue(newHealth);
              } catch (e) {}
            }
          }
        }
      }
      const classObj = world11.scoreboard.getObjective("class");
      if (classObj) {
        const classId = classObj.getScore(hurtPlayer) ?? 0;
        if (classId === 3) {
          if (event.damageSource?.cause === EntityDamageCause2.lightning) {
            const health = hurtPlayer.getComponent("minecraft:health");
            if (health && health.currentValue > 0) {
              try {
                const newHealth = Math.min(health.effectiveMax, health.currentValue + event.damage);
                health.setCurrentValue(newHealth);
              } catch (e) {}
            }
          }
        }
      }
      if (hurtPlayer.hasTag("shop_ranger_immunearrow") && !hurtPlayer.hasTag("shop_ranger_immunearrow_off")) {
        if (event.damageSource?.cause === EntityDamageCause2.projectile) {
          const health = hurtPlayer.getComponent("minecraft:health");
          if (health && health.currentValue > 0) {
            try {
              const newHealth = Math.min(health.effectiveMax, health.currentValue + event.damage);
              health.setCurrentValue(newHealth);
            } catch (e) {}
          }
        }
      }
      if (hurtPlayer.hasTag("active_disharm_immunity")) {
        const damageCause = event.damageSource?.cause;
        const unprotectedCauses = new Set([
          "fire",
          "fireTick",
          "lava",
          "fall",
          "blockExplosion",
          "entityExplosion",
          "magic",
          "wither"
        ]);
        if (!unprotectedCauses.has(damageCause)) {
          const health = hurtPlayer.getComponent("minecraft:health");
          if (health && health.currentValue > 0) {
            try {
              const newHealth = Math.min(health.effectiveMax, health.currentValue + event.damage);
              health.setCurrentValue(newHealth);
            } catch (e) {}
          }
        }
      }
    }
    const hurtEnt = event.hurtEntity;
    const damageSource = event.damageSource;
    if (damageSource?.cause === EntityDamageCause2.projectile) {
      const shooterEnt = damageSource.damagingEntity;
      const projEnt = damageSource.damagingProjectile || (shooterEnt?.typeId === "minecraft:arrow" ? shooterEnt : void 0);
      let projectileId = "";
      try {
        projectileId = projEnt?.id || "";
      } catch (e) {
      }
      let state = projectileId ? RANGER_ARROW_STATES.get(projectileId) : void 0;
      let rangerPlayer = shooterEnt?.typeId === "minecraft:player" ? shooterEnt : resolveRangerArrowOwnerRanger(projEnt, shooterEnt, state);
      if (!state && rangerPlayer) {
        state = getFallbackRangerArrowStateRanger(rangerPlayer);
        if (state && projectileId) RANGER_ARROW_STATES.set(projectileId, state);
      }
      if (state && !rangerPlayer) rangerPlayer = getPlayerByIdRanger(state.ownerId);
      if (state && rangerPlayer && hurtEnt.id !== rangerPlayer.id) {
        applyRangerArrowEffectsRanger(hurtEnt, rangerPlayer, projEnt, state);
        applyRangerHeavyDrawRanger(hurtEnt, rangerPlayer, state, event.damage);
      }
    }
  });
  world11.afterEvents.itemStartUse?.subscribe((event) => {
    const { source, itemStack } = event;
    if (!source || source.typeId !== "minecraft:player" || !isRangerBowItemRanger(itemStack)) return;
    beginRangerBowDrawRanger(source);
  });
  world11.afterEvents.itemStopUse?.subscribe((event) => {
    const { source, itemStack } = event;
    if (!source || source.typeId !== "minecraft:player" || !isRangerBowItemRanger(itemStack)) return;
    finishRangerBowDrawRanger(source);
    rememberRecentRangerBowShotRanger(source);
  });
  world11.afterEvents.itemUse.subscribe((event) => {
    const { source, itemStack } = event;
    if (!(source instanceof Player11)) return;
    if (isRangerBowItemRanger(itemStack)) rememberRecentRangerBowShotRanger(source);
    if (itemStack.typeId === "minecraft:nautilus_shell" && itemStack.nameTag === "\xA7aVolley Focus") {
      if (!source.hasTag("active_ranger_volley")) return;
      const cooldownKey = source.id + "_volley";
      if (COOLDOWNS.has(cooldownKey)) {
        const remaining = COOLDOWNS.get(cooldownKey) - system8.currentTick;
        if (remaining > 0) {
          source.sendMessage(`\xA7cArrow Volley is on cooldown! (${(remaining / 20).toFixed(1)}s)`);
          return;
        }
      }
      castRangerVolley(source);
      COOLDOWNS.set(cooldownKey, system8.currentTick + 30 * 20);
    }
  });
  world11.afterEvents.projectileHitBlock.subscribe((event) => {
    const { projectile, source } = event;
    const blockHit = event.getBlockHit();
    if (!blockHit?.block) return;
    let projectileId = "";
    try {
      projectileId = projectile?.id || "";
    } catch (e) {
    }
    let state = projectileId ? RANGER_ARROW_STATES.get(projectileId) : void 0;
    let player = resolveRangerArrowOwnerRanger(projectile, source, state);
    if (!state && player) {
      state = getFallbackRangerArrowStateRanger(player);
      if (state && projectileId) RANGER_ARROW_STATES.set(projectileId, state);
    }
    if (!state || !player || !state.explosive) return;
    let impactLocation = {
      x: blockHit.block.location.x + 0.5,
      y: blockHit.block.location.y + 0.5,
      z: blockHit.block.location.z + 0.5
    };
    try {
      if (projectile?.isValid()) impactLocation = projectile.location;
    } catch (e) {
    }
    triggerRangerArrowExplosionRanger(projectile, impactLocation, player, state);
  });
  world11.afterEvents.projectileHitEntity.subscribe((event) => {
    const { projectile, source } = event;
    const hitInfo = event.getEntityHit();
    if (!hitInfo?.entity) return;
    const target = hitInfo.entity;
    // Preserve the separate Volley Focus projectile behavior.
    try {
      if (projectile?.isValid() && projectile.hasTag("volley_arrow")) {
        target.applyDamage(6, { cause: EntityDamageCause2.magic });
        target.addEffect("minecraft:poison", 10 * 20, { amplifier: 1 });
        target.addEffect("minecraft:weakness", 10 * 20, { amplifier: 1 });
        return;
      }
    } catch (e) {
    }
    let projectileId = "";
    try {
      projectileId = projectile?.id || "";
    } catch (e) {
    }
    let state = projectileId ? RANGER_ARROW_STATES.get(projectileId) : void 0;
    let player = resolveRangerArrowOwnerRanger(projectile, source, state);
    if (!state && player) {
      state = getFallbackRangerArrowStateRanger(player);
      if (state && projectileId) RANGER_ARROW_STATES.set(projectileId, state);
    }
    // entityHurt supplies the real arrow damage for Heavy Draw. This callback
    // is only a fallback for elemental effects and explosion placement.
    if (state && player) applyRangerArrowEffectsRanger(target, player, projectile, state);
  });
  system8.runInterval(() => {
    for (const player of world11.getAllPlayers()) {
      handlePhysicalInputs(player);
    }
  }, 1);
  system8.runInterval(() => {
    const now = system8.currentTick;
    for (const [projectileId, state] of RANGER_ARROW_STATES) {
      if (state.expiresTick <= now) RANGER_ARROW_STATES.delete(projectileId);
    }
    for (const [playerId, shot] of RANGER_RECENT_BOW_SHOTS) {
      if (shot.expiresTick <= now) RANGER_RECENT_BOW_SHOTS.delete(playerId);
    }
    for (const [playerId, draw] of RANGER_BOW_DRAW_STATES) {
      if (draw.expiresTick <= now) RANGER_BOW_DRAW_STATES.delete(playerId);
    }
  }, 100);
}
var wasSneaking = /* @__PURE__ */ new Map();
function handlePhysicalInputs(player) {
  const isSneaking = player.isSneaking;
  const isJumping = player.isJumping;
  const prevSneaking = wasSneaking.get(player.id) ?? false;
  if (isSneaking && !prevSneaking) {
    const currentTick = system8.currentTick;
    const lastSneakTick = lastSneakStartTick.get(player.id) ?? 0;
    if (currentTick - lastSneakTick < 10) {
      if (player.hasTag("active_assassin_dash")) {
        const cooldownKey = player.id + "_dash";
        const remaining = (COOLDOWNS.get(cooldownKey) ?? 0) - currentTick;
        if (remaining <= 0) {
          castAssassinDash(player);
          COOLDOWNS.set(cooldownKey, currentTick + 4 * 20);
        } else {
          player.sendMessage(`\xA7cShadow Dash is on cooldown! (${(remaining / 20).toFixed(1)}s)`);
        }
      }
      lastSneakStartTick.set(player.id, 0);
    } else {
      lastSneakStartTick.set(player.id, currentTick);
    }
  }
  wasSneaking.set(player.id, isSneaking);
  if (isSneaking && isJumping) {
    if (player.hasTag("active_warrior_smash")) {
      const cooldownKey = player.id + "_smash";
      const remaining = (COOLDOWNS.get(cooldownKey) ?? 0) - system8.currentTick;
      if (remaining <= 0) {
        castWarriorSmash(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 8 * 20);
      }
    }
    if (player.hasTag("equipped_active_ability_sword")) {
      const cooldownKey = player.id + "_sword";
      const remaining = (COOLDOWNS.get(cooldownKey) ?? 0) - system8.currentTick;
      if (remaining <= 0) {
        castSwordAbility(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 300 * 20);
      } else {
        sendCooldownMessageThrottled(player, cooldownKey, `\xA7cSword Ability is on cooldown! (${(remaining / 20).toFixed(1)}s)`);
      }
    }
    if (player.hasTag("equipped_active_ability_groundsmash")) {
      const cooldownKey = player.id + "_groundsmash";
      const remaining = (COOLDOWNS.get(cooldownKey) ?? 0) - system8.currentTick;
      if (remaining <= 0) {
        castGroundSmash(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 120 * 20);
      } else {
        sendCooldownMessageThrottled(player, cooldownKey, `\xA7cGround Smash is on cooldown! (${(remaining / 20).toFixed(1)}s)`);
      }
    }
    if (player.hasTag("equipped_active_ability_attack_strength")) {
      const cooldownKey = player.id + "_attack_strength";
      const remaining = (COOLDOWNS.get(cooldownKey) ?? 0) - system8.currentTick;
      if (remaining <= 0) {
        castAttackStrength(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 300 * 20);
      } else {
        sendCooldownMessageThrottled(player, cooldownKey, `\xA7cAttack Strength is on cooldown! (${(remaining / 20).toFixed(1)}s)`);
      }
    }
    if (player.hasTag("equipped_active_ability_warrior_earthquake")) {
      const equippable = player.getComponent("minecraft:equippable");
      if (equippable) {
        const offhand = equippable.getEquipment("Offhand");
        const mainhand = equippable.getEquipment("Mainhand");
        if (offhand && offhand.typeId === "minecraft:shield" || mainhand && mainhand.typeId === "minecraft:shield") {
          const cooldownKey = player.id + "_warrior_earthquake";
          const remaining = (COOLDOWNS.get(cooldownKey) ?? 0) - system8.currentTick;
          if (remaining <= 0) {
            castWarriorEarthquake(player);
            COOLDOWNS.set(cooldownKey, system8.currentTick + 15 * 20);
          }
        }
      }
    }
    if (player.hasTag("equipped_shop_assassin_blind")) {
      const cooldownKey = player.id + "_assassin_blind";
      if (!checkCooldown(player, cooldownKey, 300)) {
        castAssassinBlind(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 300 * 20);
      }
    }
    if (player.hasTag("equipped_active_ability_assassin_vanish")) {
      const cooldownKey = player.id + "_assassin_vanish";
      if (!checkCooldown(player, cooldownKey, 480)) {
        castAssassinVanish(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 480 * 20);
      }
    }
    if (player.hasTag("equipped_shop_assassin_shadow")) {
      const cooldownKey = player.id + "_assassin_shadow";
      if (!checkCooldown(player, cooldownKey, 600)) {
        castAssassinShadow(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 600 * 20);
      }
    }
    if (player.hasTag("equipped_active_ability_survivor_hide")) {
      const cooldownKey = player.id + "_survivor_hide";
      if (!checkCooldown(player, cooldownKey, 300)) {
        castSurvivorHide(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 300 * 20);
      }
    }
    if (player.hasTag("equipped_active_ability_survivor_speedboost")) {
      const cooldownKey = player.id + "_survivor_speedboost";
      if (!checkCooldown(player, cooldownKey, 240)) {
        castSurvivorSpeedboost(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 240 * 20);
      }
    }
    if (player.hasTag("equipped_active_ability_survivor_lock")) {
      const cooldownKey = player.id + "_survivor_lock";
      if (!checkCooldown(player, cooldownKey, 300)) {
        castSurvivorLock(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 300 * 20);
      }
    }
    if (player.hasTag("equipped_active_ability_survivor_safety")) {
      const cooldownKey = player.id + "_survivor_safety";
      if (!checkCooldown(player, cooldownKey, 360)) {
        castSurvivorSafety(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 360 * 20);
      }
    }
    if (player.hasTag("equipped_active_ability_survivor_dash")) {
      const cooldownKey = player.id + "_survivor_dash";
      if (!checkCooldown(player, cooldownKey, 45)) {
        castSurvivorDash(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 45 * 20);
      }
    }
    if (player.hasTag("equipped_active_ability_ranger_rapidarrow")) {
      const cooldownKey = player.id + "_ranger_rapidarrow";
      if (!checkCooldown(player, cooldownKey, 240)) {
        castRangerRapidArrow(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 240 * 20);
      }
    }
    if (player.hasTag("equipped_active_ability_ranger_aim")) {
      const cooldownKey = player.id + "_ranger_aim";
      if (!checkCooldown(player, cooldownKey, 360)) {
        castRangerAim(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 360 * 20);
      }
    }
    if (player.hasTag("equipped_shop_manashield")) {
      const cooldownKey = player.id + "_manashield";
      if (!checkCooldown(player, cooldownKey, 300)) {
        castMageManashield(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 300 * 20);
      }
    }
    if (player.hasTag("equipped_shop_hypnosis")) {
      const cooldownKey = player.id + "_hypnosis";
      if (!checkCooldown(player, cooldownKey, 300)) {
        castMageHypnosis(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 300 * 20);
      }
    }
    if (player.hasTag("equipped_shop_magicslash")) {
      const cooldownKey = player.id + "_magicslash";
      if (!checkCooldown(player, cooldownKey, 300)) {
        castMageMagicslash(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 300 * 20);
      }
    }
    if (player.hasTag("equipped_shop_survivor_map")) {
      const cooldownKey = player.id + "_survivor_map";
      if (!checkCooldown(player, cooldownKey, 480)) {
        castMasterCartographer(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 480 * 20);
      }
    }
    if (player.hasTag("equipped_shop_ranger_map")) {
      const cooldownKey = player.id + "_ranger_map";
      if (!checkCooldown(player, cooldownKey, 300)) {
        castSenseHeading(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 300 * 20);
      }
    }
  }
}
function getCardinalDirection(dx, dz) {
  let angle = Math.atan2(dx, -dz) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  if (angle >= 337.5 || angle < 22.5) return "North";
  if (angle >= 22.5 && angle < 67.5) return "North-East";
  if (angle >= 67.5 && angle < 112.5) return "East";
  if (angle >= 112.5 && angle < 157.5) return "South-East";
  if (angle >= 157.5 && angle < 202.5) return "South";
  if (angle >= 202.5 && angle < 247.5) return "South-West";
  if (angle >= 247.5 && angle < 292.5) return "West";
  if (angle >= 292.5 && angle < 337.5) return "North-West";
  return "North";
}
async function getNearestStructureName(player) {
  const dim = player.dimension.id;
  let candidates = ["village", "mineshaft", "pillager_outpost", "stronghold", "ancient_city", "monument"];
  if (dim.includes("nether")) {
    candidates = ["fortress", "bastion_remnant"];
  } else if (dim.includes("the_end")) {
    candidates = ["end_city"];
  }
  for (const struct of candidates) {
    try {
      const res = await player.runCommandAsync(`locate structure ${struct}`);
      if (res && res.successCount > 0) {
        return struct.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      }
    } catch (_) {}
  }
  if (dim.includes("nether")) return "Nether Fortress";
  if (dim.includes("the_end")) return "End City";
  return "Village";
}
async function castMasterCartographer(player) {
  try {
    player.playSound("ui.cartography_table.take_result");
  } catch (_) {}
  let listStr = "\xA7a--- Master Cartographer (Survivor) ---\xA7r\n";
  const allPlayers = world11.getAllPlayers();
  let foundOther = false;
  for (const p of allPlayers) {
    if (p.id === player.id) continue;
    if (p.dimension.id !== player.dimension.id) continue;
    foundOther = true;
    listStr += `\xA7e${p.name}\xA7r: X: ${Math.floor(p.location.x)}, Y: ${Math.floor(p.location.y)}, Z: ${Math.floor(p.location.z)}\n`;
  }
  if (!foundOther) {
    listStr += "\xA77No other players found in the world.\xA7r\n";
  }
  const structName = await getNearestStructureName(player);
  listStr += `\n\xA7bNearest Structure\xA7r: \xA7e${structName}\xA7r`;
  player.sendMessage(listStr);
}
function castSenseHeading(player) {
  try {
    player.playSound("random.bow");
  } catch (_) {}
  let listStr = "\xA7a--- Sense Heading (Ranger) ---\xA7r\n";
  const allPlayers = world11.getAllPlayers();
  let foundOther = false;
  for (const p of allPlayers) {
    if (p.id === player.id) continue;
    if (p.dimension.id !== player.dimension.id) continue;
    foundOther = true;
    const dx = p.location.x - player.location.x;
    const dy = p.location.y - player.location.y;
    const dz = p.location.z - player.location.z;
    const dist = Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz));
    const dirStr = getCardinalDirection(dx, dz);
    listStr += `\xA7e${p.name}\xA7r: \xA7b${dist}m ${dirStr}\xA7r\n`;
  }
  if (!foundOther) {
    listStr += "\xA77No other players found in the world.\xA7r\n";
  }
  player.sendMessage(listStr);
}
function castSwordAbility(player) {
  player.playSound("random.anvil_use");
  const inv = player.getComponent("minecraft:inventory");
  if (inv && inv.container) {
    const isDiamond = player.hasTag("shop_unbreakable_sword");
    const sword = new ItemStack5(isDiamond ? "minecraft:diamond_sword" : "minecraft:iron_sword", 1);
    const ench = sword.getComponent("minecraft:enchantable");
    if (ench) {
      try {
        const vanishing = EnchantmentTypes4.get("vanishing");
        if (vanishing) ench.addEnchantment({ type: vanishing, level: 1 });
        if (isDiamond) {
          const unbreaking = EnchantmentTypes4.get("unbreaking");
          if (unbreaking) ench.addEnchantment({ type: unbreaking, level: 3 });
        }
      } catch (e) { console.warn("Caught error:", e, e?.stack); }
    }
    const durability = sword.getComponent("minecraft:durability");
    if (durability && isDiamond) {
      durability.damage = 0;
    }
    const added = giveOrDropItem(player, sword);
    if (!added) {
      player.sendMessage("\xA7cYour inventory is full! The sword fell to the ground.");
    }
  }
  if (player.hasTag("shop_unbreakable_sword")) {
    player.sendMessage("\xA7bYou summoned an Unbreakable Cursed Diamond Sword!");
  } else {
    player.sendMessage("\xA7bYou summoned a cursed Iron Sword!");
  }
}
function castGroundSmash(player) {
  player.playSound("random.explode");
  player.dimension.spawnParticle("minecraft:large_explosion", player.location);
  const nearby = player.dimension.getEntities({
    location: player.location,
    maxDistance: 5,
    excludeTypes: ["minecraft:item"]
  });
  for (const entity of nearby) {
    if (entity.id === player.id) continue;
    safeApplyDamage(entity, 10, { cause: EntityDamageCause2.entityAttack, damagingEntity: player });
    const dx = entity.location.x - player.location.x;
    const dz = entity.location.z - player.location.z;
    const dist = Math.sqrt(dx * dx + dz * dz) || 1;
    try {
      entity.applyKnockback(dx / dist, dz / dist, 3.5, 0.5);
    } catch (e) {
      console.warn(e);
    }
  }
  player.addEffect("minecraft:resistance", 30 * 20, { amplifier: 0, showParticles: true });
  player.addEffect("minecraft:absorption", 30 * 20, { amplifier: 0, showParticles: true });
  player.sendMessage("\xA7bYou used Ground Smash!");
}
function castWarriorEarthquake(player) {
  player.playSound("random.anvil_land");
  player.dimension.spawnParticle("minecraft:huge_explosion_emitter", player.location);
  const nearby = player.dimension.getEntities({
    location: player.location,
    maxDistance: 6,
    excludeTypes: ["minecraft:item"]
  });
  for (const entity of nearby) {
    if (entity.id === player.id) continue;
    safeApplyDamage(entity, 5, { cause: EntityDamageCause2.entityAttack, damagingEntity: player });
    safeAddEffect(entity, "minecraft:slowness", 5 * 20, { amplifier: 3 });
    const dx = entity.location.x - player.location.x;
    const dz = entity.location.z - player.location.z;
    const dist = Math.sqrt(dx * dx + dz * dz) || 1;
    try {
      entity.applyKnockback(dx / dist, dz / dist, 2, 0.5);
    } catch (e) { console.warn("Caught error:", e, e?.stack); }
  }
  player.sendMessage("\xA7bYou used Earthquake Slam!");
}
function castWarriorSmash(player) {
  player.playSound("random.explode");
  player.dimension.spawnParticle("minecraft:large_explosion", player.location);
  const nearby = player.dimension.getEntities({
    location: player.location,
    maxDistance: 5,
    excludeTypes: ["minecraft:item"]
  });
  for (const entity of nearby) {
    if (entity.id === player.id) continue;
    safeApplyDamage(entity, 10, { cause: EntityDamageCause2.entityAttack, damagingEntity: player });
    const dx = entity.location.x - player.location.x;
    const dz = entity.location.z - player.location.z;
    const dist = Math.sqrt(dx * dx + dz * dz) || 1;
    try {
      entity.applyKnockback(dx / dist, dz / dist, 1.5, 0.5);
    } catch (e) { console.warn("Caught error:", e, e?.stack); }
  }
  player.sendMessage("\xA7cYou used Ground Smash!");
}
function castAssassinDash(player) {
  const viewDir = player.getViewDirection();
  const currentLoc = player.location;
  const distance = 5;
  const newLoc = {
    x: currentLoc.x + viewDir.x * distance,
    y: currentLoc.y,
    z: currentLoc.z + viewDir.z * distance
  };
  player.playSound("mob.endermen.portal");
  player.teleport(newLoc, { checkForBlocks: true });
  player.dimension.spawnParticle("minecraft:endrod", currentLoc);
  player.dimension.spawnParticle("minecraft:endrod", player.location);
  player.sendMessage("\xA78You used Shadow Dash!");
}
function castSurvivorDash(player) {
  player.playSound("mob.enderdragon.flap");
  const prevLocation = player.location;
  const viewDir = player.getViewDirection();
  const nearby = player.dimension.getEntities({
    location: prevLocation,
    maxDistance: 3,
    excludeTypes: ["minecraft:item"]
  });
  for (const entity of nearby) {
    if (entity.id === player.id) continue;
    safeApplyDamage(entity, 5, { cause: EntityDamageCause2.entityAttack, damagingEntity: player });
  }
  try {
    const dx = viewDir.x || 1e-3;
    const dz = viewDir.z || 1e-3;
    const dist = Math.sqrt(dx * dx + dz * dz) || 1;
    player.applyKnockback(dx / dist, dz / dist, 4.5, 0.2);
  } catch (e) {
    console.warn(e);
  }
  player.addEffect("minecraft:invisibility", 200, { amplifier: 0, showParticles: true });
  player.addEffect("minecraft:resistance", 200, { amplifier: 0, showParticles: true });
  player.sendMessage("\xA7bYou used Dash!");
}
function castSurvivorSafety(player) {
  player.playSound("random.orb");
  player.addEffect("minecraft:resistance", 600, { amplifier: 2, showParticles: true });
  player.addEffect("minecraft:fire_resistance", 600, { amplifier: 0, showParticles: true });
  player.addEffect("minecraft:absorption", 600, { amplifier: 0, showParticles: true });
  player.sendMessage("\xA7aSafety protocol activated for 30s!");
}
function castRangerVolley(player) {
  player.playSound("random.bow");
  const viewDir = player.getViewDirection();
  const spreads = [
    { dx: 0, dy: 0, dz: 0 },
    { dx: 0.2, dy: 0, dz: -0.2 },
    { dx: -0.2, dy: 0, dz: 0.2 },
    { dx: 0.1, dy: 0.1, dz: 0.1 },
    { dx: -0.1, dy: 0.1, dz: -0.1 }
  ];
  for (const spread of spreads) {
    const arrow = player.dimension.spawnEntity("minecraft:arrow", {
      x: player.location.x,
      y: player.location.y + 1.5,
      z: player.location.z
    });
    arrow.addTag("volley_arrow");
    const velocity = {
      x: (viewDir.x + spread.dx) * 2.5,
      y: (viewDir.y + spread.dy) * 2.5,
      z: (viewDir.z + spread.dz) * 2.5
    };
    arrow.applyImpulse(velocity);
  }
  player.sendMessage("\xA7aYou used Arrow Volley!");
}
function castRangerRapidArrow(player) {
  player.playSound("random.bow");
  player.dimension.spawnParticle("minecraft:large_explosion", player.location);
  const hasFire = player.hasTag("shop_ranger_firearrow") && !player.hasTag("shop_ranger_firearrow_off");
  const hasPoison = player.hasTag("shop_ranger_poisonarrow") && !player.hasTag("shop_ranger_poisonarrow_off");
  const hasExplode = player.hasTag("shop_ranger_explosion") && !player.hasTag("shop_ranger_explosion_off");
  let arrowsShot = 0;
  const shootInterval = system8.runInterval(() => {
    if (!player.isValid()) {
      system8.clearRun(shootInterval);
      return;
    }
    const currentViewDir = player.getViewDirection();
    const spawnLoc = {
      x: player.location.x + currentViewDir.x * 1.5,
      y: player.location.y + 1.5 + currentViewDir.y * 1.5,
      z: player.location.z + currentViewDir.z * 1.5
    };
    const arrow = player.dimension.spawnEntity("minecraft:arrow", spawnLoc);
    arrow.addTag("rpg_temp_ranger_arrow");
    arrow.addTag(`ranger_owner:${player.id}`);
    if (hasFire) arrow.addTag("ranger_arrow_fire");
    arrow.addTag("ranger_arrow_poison");
    if (hasExplode) arrow.addTag("ranger_arrow_explosion");
    const spreadX = (Math.random() - 0.5) * 0.1;
    const spreadY = (Math.random() - 0.5) * 0.1;
    const spreadZ = (Math.random() - 0.5) * 0.1;
    arrow.applyImpulse({
      x: (currentViewDir.x + spreadX) * 3,
      y: (currentViewDir.y + spreadY) * 3,
      z: (currentViewDir.z + spreadZ) * 3
    });
    arrowsShot++;
    if (arrowsShot >= 60) {
      system8.clearRun(shootInterval);
    }
  }, 2);
  player.sendMessage("\xA7a[Rapid Arrow] \xA7f60 arrows unleashed! Aim to direct the volley!");
}
function castRangerAim(player) {
  player.playSound("random.orb");
  player.addEffect("minecraft:night_vision", 1200, { amplifier: 0, showParticles: true });
  player.sendMessage("\xA7aAim activated! Night Vision granted for 1 minute.");
}
function castAttackStrength(player) {
  player.playSound("mob.enderdragon.growl");
  player.dimension.spawnParticle("minecraft:totem_particle", player.location);
  player.addEffect("minecraft:strength", 200, { amplifier: 2 });
  player.addEffect("minecraft:resistance", 200, { amplifier: 2 });
  player.addEffect("minecraft:fire_resistance", 200, { amplifier: 0 });
  player.addEffect("minecraft:regeneration", 200, { amplifier: 1 });
  player.addEffect("minecraft:health_boost", 200, { amplifier: 2 });
  const health = player.getComponent("minecraft:health");
  if (health) {
    system8.runTimeout(() => {
      if (player.isValid()) {
        const newHealth = Math.min(health.effectiveMax, health.currentValue + 12);
        health.setCurrentValue(newHealth);
      }
    }, 1);
  }
  const hostiles = player.dimension.getEntities({
    location: player.location,
    maxDistance: 10,
    families: ["monster"]
  });
  for (const mob of hostiles) {
    if (mob.id === player.id) continue;
    safeAddEffect(mob, "minecraft:slowness", 200, { amplifier: 2 });
    try {
      safeApplyDamage(mob, 20, { cause: EntityDamageCause2.entityAttack, damagingEntity: player });
    } catch (e) {
      const mobHealth = mob.getComponent("minecraft:health");
      if (mobHealth) {
        const newHealth = Math.max(0, mobHealth.currentValue - 20);
        mobHealth.setCurrentValue(newHealth);
      }
    }
  }
  player.sendMessage("\xA7bYou unleashed Attack Strength! Massive buffs applied and nearby hostiles took damage.");
}
function castSurvivorHide(player) {
  player.playSound("mob.endermen.portal");
  player.dimension.spawnParticle("minecraft:egg_destroy_emitter", player.location);
  player.addEffect("minecraft:invisibility", 1200, { amplifier: 0, showParticles: true });
  player.sendMessage("\xA78You are now hidden! Mobs will ignore you for 60 seconds.");
}
function castSurvivorSpeedboost(player) {
  player.playSound("mob.enderdragon.flap");
  player.addEffect("minecraft:speed", 400, { amplifier: 2, showParticles: true });
  player.addEffect("minecraft:jump_boost", 400, { amplifier: 1, showParticles: true });
  player.addEffect("minecraft:resistance", 400, { amplifier: 1, showParticles: true });
  player.sendMessage("\xA7bSpeedboost activated for 20 seconds!");
}
function castSurvivorLock(player) {
  player.playSound("random.anvil_land");
  const center = {
    x: Math.floor(player.location.x),
    y: Math.floor(player.location.y),
    z: Math.floor(player.location.z)
  };
  const minX = center.x - 2;
  const maxX = center.x + 3;
  const minZ = center.z - 2;
  const maxZ = center.z + 3;
  const cobblestone = "minecraft:cobblestone";
  const isAir = (block) => block && (block.typeId === "minecraft:air" || block.typeId === "minecraft:cave_air" || block.typeId === "minecraft:void_air");
  for (let x = minX; x <= maxX; x++) {
    for (let y = center.y; y <= center.y + 2; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        const isWall = x === minX || x === maxX || z === minZ || z === maxZ;
        const isRoof = y === center.y + 2;
        if (!isWall && !isRoof) continue;
        try {
          const block = player.dimension.getBlock({ x, y, z });
          if (isAir(block)) block.setType(cobblestone);
        } catch (e) {
          console.warn(e);
        }
      }
    }
  }
  const view = player.getViewDirection();
  let workstationLocations;
  let furnaceDirection;
  if (Math.abs(view.x) > Math.abs(view.z)) {
    const backX = view.x >= 0 ? minX + 1 : maxX - 1;
    furnaceDirection = view.x >= 0 ? "east" : "west";
    workstationLocations = [
      { x: backX, y: center.y, z: minZ + 1 },
      { x: backX, y: center.y, z: maxZ - 1 }
    ];
  } else {
    const backZ = view.z >= 0 ? minZ + 1 : maxZ - 1;
    furnaceDirection = view.z >= 0 ? "south" : "north";
    workstationLocations = [
      { x: minX + 1, y: center.y, z: backZ },
      { x: maxX - 1, y: center.y, z: backZ }
    ];
  }
  const workstationTypes = ["minecraft:crafting_table", "minecraft:furnace"];
  for (let i = 0; i < workstationLocations.length; i++) {
    try {
      const location = workstationLocations[i];
      const block = player.dimension.getBlock(location);
      if (!isAir(block)) continue;
      if (workstationTypes[i] === "minecraft:furnace") {
        try {
          block.setPermutation(BlockPermutation2.resolve("minecraft:furnace", {
            "minecraft:cardinal_direction": furnaceDirection
          }));
        } catch (e) {
          block.setType("minecraft:furnace");
        }
      } else {
        block.setType(workstationTypes[i]);
      }
    } catch (e) {
      console.warn(e);
    }
  }
  player.sendMessage("\xA77[Survivor] 6x6 emergency shelter created with a crafting table and furnace!");
}
function castAssassinVanish(player) {
  player.playSound("random.fizz");
  player.addEffect("minecraft:invisibility", 900, { amplifier: 0, showParticles: true });
}
function castAssassinBlind(player) {
  player.sendMessage("\xA78[Assassin] You cast Blindness on nearby enemies!");
  player.addEffect("minecraft:invisibility", 20 * 20, { amplifier: 0, showParticles: false });
  const targets = player.dimension.getEntities({ location: player.location, maxDistance: 15 });
  for (const target of targets) {
    if (target.id !== player.id) {
      safeAddEffect(target, "minecraft:darkness", 20 * 20, { amplifier: 0 });
      safeAddEffect(target, "minecraft:weakness", 20 * 20, { amplifier: 0 });
    }
  }
}
function castAssassinShadow(player) {
  player.sendMessage("\xA78[Assassin] You enter the shadows!");
  player.addEffect("minecraft:invisibility", 30 * 20, { amplifier: 0, showParticles: false });
  player.addEffect("minecraft:resistance", 30 * 20, { amplifier: 0, showParticles: true });
  player.addEffect("minecraft:speed", 30 * 20, { amplifier: 1, showParticles: true });
  player.addEffect("minecraft:jump_boost", 30 * 20, { amplifier: 0, showParticles: true });
  player.addEffect("minecraft:strength", 30 * 20, { amplifier: 1, showParticles: true });
  const targets = player.dimension.getEntities({ location: player.location, maxDistance: 5 });
  for (const target of targets) {
    if (target.id !== player.id) {
      safeAddEffect(target, "minecraft:poison", 30 * 20, { amplifier: 0 });
      safeAddEffect(target, "minecraft:weakness", 30 * 20, { amplifier: 0 });
    }
  }
}
function castMageManashield(player) {
  player.sendMessage("\xA7d[Mage] You activate Mana Shield!");
  player.addEffect("minecraft:fire_resistance", 20 * 20, { amplifier: 0 });
  player.addEffect("minecraft:absorption", 20 * 20, { amplifier: 0 });
  player.addEffect("minecraft:resistance", 20 * 20, { amplifier: 2 });
  player.addEffect("minecraft:regeneration", 20 * 20, { amplifier: 0 });
}
function castMageHypnosis(player) {
  player.sendMessage("\xA7d[Mage] You cast Hypnosis!");
  const targets = player.dimension.getEntities({ location: player.location, maxDistance: 15 });
  for (const target of targets) {
    if (target.id !== player.id) {
      safeAddEffect(target, "minecraft:nausea", 20 * 20, { amplifier: 0 });
      safeAddEffect(target, "minecraft:poison", 20 * 20, { amplifier: 0 });
    }
  }
}
function castMageMagicslash(player) {
  player.sendMessage("\xA7d[Mage] You unleash Magic Slash!");
  player.playSound("mob.enderdragon.growl");
  const targets = player.dimension.getEntities({ location: player.location, maxDistance: 15 });
  for (const target of targets) {
    if (target.id !== player.id) {
      safeApplyDamage(target, 20, { cause: EntityDamageCause2.magic, damagingEntity: player });
      safeSetOnFire(target, 15, true);
    }
  }
}
world11.afterEvents.entitySpawn.subscribe((event) => {
  const entity = event.entity;
  if (entity.typeId !== "minecraft:arrow") return;
  // Capture immediately so point-blank impacts retain owner, skill, and charge
  // information even if Bedrock invalidates the projectile on the same tick.
  tryCaptureRangerArrowStateRanger(entity, 0);
});

// src/main.ts
world12.afterEvents.itemUse.subscribe((event) => {
  const { source, itemStack } = event;
  if (source.typeId !== "minecraft:player") return;
  if (itemStack.typeId.startsWith("rpg:mage_staff")) {
    let activeSpell = "";
    const tags = source.getTags();
    for (const tag of tags) {
      if (tag.startsWith("active_spell:")) {
        activeSpell = tag.split(":")[1];
        break;
      }
    }
    if (activeSpell) {
      castSpell(source, activeSpell);
    }
  }
});
world12.afterEvents.worldInitialize.subscribe((initEvent) => {
  initScoreboards();
});
system9.run(() => {
  initCombatSystem();
});
console.warn("RPG Add-On loaded!");
system9.afterEvents.scriptEventReceive.subscribe((event) => {
  const id = event.id;
  const player = event.sourceEntity;
  if (!player || player.typeId !== "minecraft:player") return;
  if (id === "rpg:unlock" || id === "rpg:lock") {
    const unlocking = id === "rpg:unlock";
    system9.run(() => {
      const inv = player.getComponent("minecraft:inventory");
      if (!inv || !inv.container) return;
      let changedCount = 0;
      for (let i = 0; i < inv.container.size; i++) {
        const item = inv.container.getItem(i);
        if (item) {
          const isRpgGuide = item.typeId === "minecraft:book" && item.nameTag === "\xA7l\xA76RPG Guide";
          const isRangerBow = item.typeId === "minecraft:bow" && item.nameTag === "\xA76Ranger Bow";
          if (isRpgGuide || isRangerBow) {
            item.lockMode = unlocking ? ItemLockMode5.none : ItemLockMode5.inventory;
            inv.container.setItem(i, item);
            changedCount++;
          }
        }
      }
      if (changedCount > 0) {
        player.sendMessage(`\xA7a[System] Successfully ${unlocking ? "unlocked" : "locked"} ${changedCount} items!`);
      } else {
        player.sendMessage(`\xA7c[System] No RPG Guide or Ranger Bow found in your personal inventory.`);
      }
    });
  } else if (id === "rpg:destroy_on" || id === "rpg:destroy_off") {
    const turnOn = id === "rpg:destroy_on";
    system9.run(() => {
      if (turnOn) {
        player.addTag("destroy_blocks");
        player.sendMessage(`\xA7a[System] Ability explosions will now destroy blocks and cause fire for you.`);
      } else {
        player.removeTag("destroy_blocks");
        player.sendMessage(`\xA7c[System] Ability explosions are now safe and will not destroy blocks.`);
      }
    });
  } else if (id === "rpg:hud_off" || id === "rpg:hud_on") {
    const turnOn = id === "rpg:hud_on";
    system9.run(() => {
      if (turnOn) {
        player.removeTag("hide_rpg_hud");
        player.sendMessage(`\xA7a[System] RPG HUD is now visible.`);
      } else {
        player.addTag("hide_rpg_hud");
        player.sendMessage(`\xA7c[System] RPG HUD is now hidden.`);
      }
    });
  } else if (id === "rpg:reload") {
    system9.run(() => {
      player.runCommandAsync("reload");
      player.sendMessage("\xA7a[System] Addon reloaded successfully.");
    });
  } else if (id === "rpg:fix_bow") {
    system9.run(() => {
      const classObj = world.scoreboard.getObjective("class");
      if (!classObj) return;
      const classId = classObj.getScore(player) ?? 0;
      
      const levelObj = world.scoreboard.getObjective("level");
      const level = levelObj?.getScore(player) ?? 1;

      if (classId === 2 || (classId === 4 && player.hasTag("shop_assassin_bow"))) {
        const soulsObj = world.scoreboard.getObjective("souls");
        const souls = soulsObj?.getScore(player) ?? 0;
        
        if (souls < 30) {
          player.sendMessage(`\xA7c[System] You need 30 Souls to summon your bow! You are missing ${30 - souls} Souls.`);
          return;
        }
        
        soulsObj.setScore(player, souls - 30);
        
        if (classId === 2) {
          giveRangerBow(player, level, true);
          player.sendMessage("\xA7a[System] Ranger Bow has been manually regenerated! (-30 Souls)");
        } else if (classId === 4) {
          giveAssassinBow(player, true);
          player.sendMessage("\xA7a[System] Assassin's Deadly Bow has been manually regenerated! (-30 Souls)");
        }
      } else {
        player.sendMessage("\xA7c[System] You do not have a class weapon that can be regenerated.");
      }
    });
  }
});

// ==========================================
// PILLAGER BOSS FIGHT SYSTEM
// ==========================================
import "./systems/boss_pillager.js";




