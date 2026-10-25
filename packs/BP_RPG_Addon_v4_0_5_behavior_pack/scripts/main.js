// src/main.ts
import { world as world12, system as system9, ItemLockMode as ItemLockMode5 } from "@minecraft/server";

// [Addon Pack] Menus do RPG (Guide, Skill Tree, Soul Shop...) tentam de novo quando o jogo responde "UserBusy"
// (acontece ao abrir logo apos usar o item; antes o menu simplesmente nao aparecia).
import { ActionFormData as __AFD, ModalFormData as __MFD, MessageFormData as __MSG } from "@minecraft/server-ui";
for (const __F of [__AFD, __MFD, __MSG]) {
  const __orig = __F.prototype.show;
  __F.prototype.show = function (player) {
    const self = this;
    return new Promise((resolve, reject) => {
      let tries = 0;
      const attempt = () => {
        __orig.call(self, player).then((r) => {
          if (r && r.canceled && r.cancelationReason === "UserBusy" && tries++ < 30) system9.runTimeout(attempt, 6);
          else resolve(r);
        }).catch(reject);
      };
      attempt();
    });
  };
}

// src/systems/init.ts
import { world, ItemStack, ItemLockMode } from "@minecraft/server";
var SCOREBOARDS = ["class", "souls", "level"];
function initScoreboards() {
  for (const sb of SCOREBOARDS) {
    if (!world.scoreboard.getObjective(sb)) {
      world.scoreboard.addObjective(sb, sb);
    }
  }
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
  // [Addon Pack] mensagens de boas-vindas/Discord removidas (evita avalanche no 1o acesso).
  initPlayer(event.player);
  // [Addon Pack] HUD do RPG desativado por padrao (1o acesso). O jogador liga em Settings > HUD (tag hide_rpg_hud).
  if (!player.hasTag("rpg_hud_default_applied")) {
    player.addTag("rpg_hud_default_applied");
    player.addTag("hide_rpg_hud");
  }
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
    player.sendMessage("\xA7a[Sistema] Voc\xEA recebeu o \xA76RPG Guide\xA7a!");
  } else {
    player.sendMessage("\xA7a[Sistema] Seu invent\xE1rio estava cheio! O \xA76RPG Guide\xA7a caiu aos seus p\xE9s.");
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
      player.sendMessage("\xA78[Mago] A Invisibilidade \xE9 permanente enquanto estiver equipada no Livro de Feiti\xE7os. N\xE3o precisa lan\xE7ar!");
      break;
    default:
      player.sendMessage("\xA7cNenhum feiti\xE7o ativo! Abra o RPG Guide para escolher um.");
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
  active_ability_sword: "\xA7ePara usar a habilidade, agache e depois pule. Ela tem 5 min de recarga depois de usada.\xA7r",
  active_ability_survivor_dash: "\xA7ePara usar Investida, agache e depois pule. Empurra voc\xEA 10 blocos para a frente, fere mobs pr\xF3ximos e concede Invisibilidade e Resist\xEAncia por 10s. (Recarga: 45s)\xA7r",
  active_ability_groundsmash: "\xA7ePara usar esta habilidade, agache e depois pule. (Recarga: 2 min)\xA7r",
  active_ability_ranger_rapidarrow: "\xA7ePara usar Chuva de Flechas, agache e depois pule. Dispara 30 flechas na hora! (Recarga: 4 min)\xA7r",
  active_ability_ranger_aim: "\xA7ePara usar Mira, agache e depois pule. Concede Vis\xE3o Noturna por 1 minuto. (Recarga: 6 min)\xA7r",
  active_ability_survivor_safety: "\xA7ePara usar Prote\xE7\xE3o, agache e depois pule. Concede Resist\xEAncia III, Resist\xEAncia ao Fogo e Absor\xE7\xE3o por 30s. (Recarga: 6 min)\xA7r",
  active_ability_survivor_speedboost: "\xA7ePara usar Impulso, agache e depois pule. Concede Velocidade III, Super Pulo II e Resist\xEAncia II por 20s. (Recarga: 4 min)\xA7r",
  active_ability_survivor_hide: "\xA7ePara usar Esconder, agache e depois pule. Concede Invisibilidade completa por 60 segundos. (Recarga: 5 min)\xA7r",
  active_ability_survivor_lock: "\xA7ePara usar Pris\xE3o, agache e depois pule. Prende inimigos pr\xF3ximos em obsidiana e aplica Lentid\xE3o III. (Recarga: 5 min)\xA7r",
  active_ability_assassin_vanish: "\xA7ePara usar Sumir, agache e depois pule. Concede Invisibilidade por 45s. (Recarga: 8 min)\xA7r"
};

var WarriorShopItems = [
  {
    id: "active_ability_sword",
    name: "Invocar Espada",
    description: "(Equipe e use: agachar + pular) Concede uma Espada de Ferro com Maldi\xE7\xE3o do Desaparecimento.",
    costXP: 1,
    costSouls: 100,
    tag: "active_ability_sword",
    isActiveAbility: true,
    requiresTag: "path_middle_1"
  },
  {
    id: "active_ability_groundsmash",
    name: "Esmagar o Ch\xE3o",
    description: "(Equipe e use: agachar + pular) Empurra os inimigos e causa dano. D\xE1 Resist\xEAncia I e Absor\xE7\xE3o I.",
    costXP: 5,
    costSouls: 150,
    tag: "active_ability_groundsmash",
    isActiveAbility: true,
    requiresTag: "path_left_5"
  },
  {
    id: "active_ability_attack_strength",
    name: "Bravura",
    description: "(Equipe e use: agachar + pular) D\xE1 b\xF4nus enormes e causa dano aos inimigos pr\xF3ximos.",
    costXP: 5,
    costSouls: 200,
    tag: "active_ability_attack_strength",
    isActiveAbility: true,
    requiresTag: "path_middle_3"
  },
  {
    id: "healthmet_buff",
    name: "Recupera\xE7\xE3o Refor\xE7ada",
    description: "(Passiva) Concede Regenera\xE7\xE3o I enquanto voc\xEA usa qualquer capacete.",
    costXP: 5,
    costSouls: 280,
    tag: "shop_healthmet",
    requiresTag: "path_right_1"
  },
  {
    id: "assassin_skill_buff",
    name: "P\xE9s Ligeiros",
    description: "(Passiva) Concede Velocidade I permanente.",
    costXP: 5,
    costSouls: 300,
    tag: "shop_assassin_skill",
    effectId: "minecraft:speed",
    requiresTag: "path_left_1"
  },
  {
    id: "heart_buff",
    name: "Vitalidade",
    description: "(Passiva) Concede 6 cora\xE7\xF5es extras permanentes.",
    costXP: 5,
    costSouls: 350,
    tag: "shop_heart",
    requiresTag: "path_left_2"
  },
  {
    id: "armour_buff",
    name: "Colosso",
    description: "(Passiva) Concede Resist\xEAncia II e Super Pulo I com a armadura completa.",
    costXP: 5,
    costSouls: 200,
    tag: "shop_armour",
    requiresTag: "path_left_3"
  },
  {
    id: "strength_buff",
    name: "F\xFAria",
    description: "(Passiva) Concede For\xE7a I permanente.",
    costXP: 5,
    costSouls: 250,
    tag: "shop_strength",
    effectId: "minecraft:strength",
    requiresTag: "path_right_2"
  },
  {
    id: "unbreakable_sword_buff",
    name: "Invocar Espada Aprimorada",
    description: "(Passiva) Melhora a habilidade da espada para invocar uma Espada de Diamante.",
    costXP: 5,
    costSouls: 350,
    tag: "shop_unbreakable_sword",
    requiresTag: "path_middle_2"
  },
  {
    id: "groundsmash_passive_buff",
    name: "Casca Grossa",
    description: "(Passiva) Concede Resist\xEAncia I permanente.",
    costXP: 5,
    costSouls: 250,
    tag: "shop_groundsmash",
    effectId: "minecraft:resistance",
    requiresTag: "path_right_3"
  },
  {
    id: "dual_sword_buff",
    name: "Maestria da Espada",
    description: "(Passiva) Seus ataques corpo a corpo causam dano b\xF4nus conforme o tipo da espada.",
    costXP: 5,
    costSouls: 400,
    tag: "shop_dual_sword",
    requiresTag: "path_left_4"
  },
  {
    id: "shield_buff",
    name: "Baluarte",
    description: "(Passiva) Cura 5 cora\xE7\xF5es na hora a cada 75 segundos quando h\xE1 um Escudo na m\xE3o secund\xE1ria.",
    costXP: 5,
    costSouls: 500,
    tag: "shop_shield",
    requiresTag: "path_right_4"
  },
  {
    id: "fire_slash_buff",
    name: "Sangue de Fogo",
    description: "(Passiva) Queima os inimigos que atacarem voc\xEA.",
    costXP: 5,
    costSouls: 500,
    tag: "shop_fire_slash",
    requiresTag: "path_right_5"
  }
];
var RangerShopItems = [
  {
    id: "ranger_agility",
    name: "Andar na Floresta",
    description: "(Passiva) Concede Velocidade I permanente.",
    costSouls: 100,
    costXP: 1,
    tag: "shop_ranger_agility",
    isActiveAbility: false,
    requiresTag: "path_middle_1"
  },
  {
    id: "ranger_firearrow",
    name: "Flechas de Fogo",
    description: "(Passiva) As flechas incendeiam o alvo por 12 segundos e causam dano extra de fogo.",
    costSouls: 150,
    costXP: 5,
    tag: "shop_ranger_firearrow",
    isActiveAbility: false,
    requiresTag: "path_left_1"
  },
  {
    id: "ranger_poisonarrow",
    name: "Flechas Envenenadas",
    description: "(Passiva) As flechas envenenam o alvo por 6 segundos.",
    costSouls: 150,
    costXP: 5,
    tag: "shop_ranger_poisonarrow",
    isActiveAbility: false,
    requiresTag: "path_right_1"
  },
  {
    id: "ranger_map",
    name: "Senso de Dire\xE7\xE3o",
    description: "(Equipe e use: agachar + pular) Varre o mundo e lista no chat todos os jogadores com dist\xE2ncia e dire\xE7\xE3o (ex.: 140m Nordeste). (Recarga: 5 min)",
    costSouls: 100,
    costXP: 5,
    tag: "shop_ranger_map",
    isActiveAbility: true,
    requiresTag: "path_left_2"
  },
  {
    id: "ranger_arrowsunlimi",
    name: "Empluma\xE7\xE3o",
    description: "(Passiva) Rep\xF5e uma flecha no invent\xE1rio quando voc\xEA segura um arco e n\xE3o tem flechas.",
    costSouls: 250,
    costXP: 5,
    tag: "shop_ranger_arrowsunlimi",
    isActiveAbility: false,
    requiresTag: "path_left_3"
  },
  {
    id: "ranger_hearts",
    name: "Batedor Endurecido",
    description: "(Passiva) Concede +6 cora\xE7\xF5es extras e Regenera\xE7\xE3o permanente.",
    costSouls: 300,
    costXP: 5,
    tag: "shop_ranger_hearts",
    isActiveAbility: false,
    requiresTag: "path_right_2"
  },
  {
    id: "ranger_rapidarrow",
    name: " Chuva de Flechas",
    description: "(Equipe e use: agachar + pular) Dispara rapidamente 60 flechas envenenadas invocadas por magia. Recarga: 4 minutos.",
    costSouls: 150,
    costXP: 5,
    tag: "active_ability_ranger_rapidarrow",
    isActiveAbility: true,
    requiresTag: "path_right_3"
  },
  {
    id: "ranger_immunearrow",
    name: "Desviar Proj\xE9teis",
    description: "(Passiva) Imunidade a todo dano de flechas.",
    costSouls: 400,
    costXP: 5,
    tag: "shop_ranger_immunearrow",
    isActiveAbility: false,
    requiresTag: "path_left_5"
  },
  {
    id: "ranger_deadarrow",
    name: "Puxada Pesada",
    description: "(Passiva) Flechas totalmente carregadas dos Arcos de Patrulheiro causam dano dobrado.",
    costSouls: 200,
    costXP: 5,
    tag: "shop_ranger_deadarrow",
    isActiveAbility: false,
    requiresTag: "path_left_4"
  },
  {
    id: "ranger_aim",
    name: "Aspecto da Coruja",
    description: "(Equipe e use: agachar + pular) Voc\xEA ganha Vis\xE3o Noturna por 1 minuto. Recarga: 6 minutos.",
    costSouls: 100,
    costXP: 5,
    tag: "active_ability_ranger_aim",
    isActiveAbility: true,
    requiresTag: "path_middle_2"
  },
  {
    id: "ranger_archersafe",
    name: "F\xF4lego do Ca\xE7ador",
    description: "(Passiva) Concede Resist\xEAncia I permanente. Segurar um arco d\xE1 Velocidade II e +2 cora\xE7\xF5es extras.",
    costSouls: 300,
    costXP: 5,
    tag: "shop_ranger_archersafe",
    isActiveAbility: false,
    requiresTag: "path_middle_3"
  },
  {
    id: "ranger_explosion",
    name: "Flechas Explosivas",
    description: "(Passiva) As flechas explodem ao acertar.",
    costSouls: 200,
    costXP: 5,
    tag: "shop_ranger_explosion",
    isActiveAbility: false,
    requiresTag: "path_right_4"
  },
  {
    id: "ranger_armour",
    name: "Amarra de Casca",
    description: "(Passiva) Concede Resist\xEAncia II com um conjunto completo de armadura.",
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
    name: "Passo \xC1gil",
    description: "(Passiva) Concede Velocidade II permanente o tempo todo.",
    costSouls: 100,
    costXP: 1,
    tag: "shop_assassin_speed",
    isActiveAbility: false,
    requiresTag: "path_middle_1"
  },
  {
    id: "assassin_dagger",
    name: "Lacera\xE7\xE3o Profunda",
    description: "(Passiva) Cada golpe corpo a corpo causa +3 de dano b\xF4nus.",
    costSouls: 225,
    costXP: 5,
    tag: "shop_assassin_dagger",
    isActiveAbility: false,
    requiresTag: "path_left_1"
  },
  {
    id: "assassin_silence",
    name: "Sumir",
    description: "(Ativo) Equipe e use: agachar + pular. Concede Invisibilidade por 45s. Recarga: 8 min.",
    costSouls: 200,
    costXP: 5,
    tag: "active_ability_assassin_vanish",
    isActiveAbility: true,
    requiresTag: "path_right_1"
  },
  {
    id: "assassin_critical",
    name: "Ataque Surpresa",
    description: "(Passiva) Atacar no ar causa +7 de dano b\xF4nus. Ativa uma vez a cada 2 minutos.",
    costSouls: 220,
    costXP: 5,
    tag: "shop_assassin_critical",
    isActiveAbility: false,
    requiresTag: "path_left_2"
  },
  {
    id: "assassin_bow",
    name: "Arco Mortal do Assassino",
    description: "(Passiva) Receba um arco com For\xE7a IV + Inquebr\xE1vel III que fica com voc\xEA ao morrer, se conserta sozinho e volta se for perdido.",
    costSouls: 200,
    costXP: 5,
    tag: "shop_assassin_bow",
    isActiveAbility: false,
    requiresTag: "path_left_3"
  },
  {
    id: "assassin_blind",
    name: "Desvanecer Enfraquecedor",
    description: "(Equipe e use: agachar + pular) Todos os mobs num raio de 15 blocos recebem Fraqueza por 20s e voc\xEA recebe Invisibilidade por 20 segundos. *PvP: jogadores tamb\xE9m recebem Escurid\xE3o* (Recarga: 5 min)",
    costSouls: 200,
    costXP: 5,
    tag: "shop_assassin_blind",
    isActiveAbility: true,
    requiresTag: "path_right_2"
  },
  {
    id: "assassin_lethal",
    name: "Golpe Vamp\xEDrico",
    description: "(Passiva) Seu pr\xF3ximo golpe corpo a corpo cura 5 cora\xE7\xF5es. (Recarga: 75s)",
    costSouls: 300,
    costXP: 5,
    tag: "shop_assassin_lethal",
    isActiveAbility: false,
    requiresTag: "path_right_3"
  },
  {
    id: "assassin_arrow",
    name: "Aljava Perfeita",
    description: "(Passiva) Receba 7 flechas a cada dia do Minecraft para usar com o Arco do Assassino.",
    costSouls: 150,
    costXP: 5,
    tag: "shop_assassin_arrow",
    isActiveAbility: false,
    requiresTag: "path_middle_3"
  },
  {
    id: "assassin_shadow",
    name: "Forma Fantasma",
    description: "(Equipe e use: agachar + pular) Ganhe Invisibilidade, Velocidade II, For\xE7a II, Resist\xEAncia e Super Pulo por 30s. Inimigos a at\xE9 5 blocos recebem Veneno e Fraqueza. (Recarga: 10 min)",
    costSouls: 350,
    costXP: 5,
    tag: "shop_assassin_shadow",
    isActiveAbility: true,
    requiresTag: "path_left_4"
  },
  {
    id: "assassin_poison",
    name: "Aura de Veneno",
    description: "(Passiva) Qualquer inimigo que causar dano a voc\xEA fica envenenado por 25 segundos.",
    costSouls: 350,
    costXP: 5,
    tag: "shop_assassin_poison",
    isActiveAbility: false,
    requiresTag: "path_middle_2"
  },
  {
    id: "assassin_hearts",
    name: "Pacto do Dem\xF4nio",
    description: "(Passiva) Ganhe +6 cora\xE7\xF5es extras e Regenera\xE7\xE3o permanente.",
    costSouls: 500,
    costXP: 5,
    tag: "shop_assassin_hearts",
    isActiveAbility: false,
    requiresTag: "path_left_5"
  },
  {
    id: "assassin_disharm",
    name: "Andarilho do Vazio",
    description: "(Passiva) A cada 5 minutos voc\xEA fica invis\xEDvel por 20s e imune a todo dano, exceto fogo, lava, queda, explos\xF5es, veneno e Wither.",
    costSouls: 250,
    costXP: 5,
    tag: "shop_assassin_disharm",
    isActiveAbility: false,
    requiresTag: "path_right_4"
  },
  {
    id: "assassin_instantkill",
    name: "Golpe Mortal",
    description: "(Passiva) Acerte o mesmo alvo 3 vezes em 5s sem ser atingido para causar 40 de dano b\xF4nus. Uma vez por mob. 60 segundos de recarga depois de ativar.",
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
    name: "Cajado de Mago",
    description: "(Ativo) Ative o Cajado de Mago para receber um cajado m\xE1gico e lan\xE7ar seus feiti\xE7os.",
    costSouls: 200,
    costXP: 1,
    tag: "shop_mage_staff",
    isActiveAbility: true,
    requiresTag: "path_middle_1"
  },
  {
    id: "mage_fireball",
    name: "Bola de Fogo",
    description: "(Feiti\xE7o) Dispara uma bola de fogo de at\xE9 10 blocos que queima os inimigos.",
    costSouls: 100,
    costXP: 5,
    tag: "spell_unlocked:fireball",
    isActiveAbility: false,
    requiresTag: "path_left_1"
  },
  {
    id: "mage_frost",
    name: "Onda de Gelo",
    description: "(Feiti\xE7o) Causa 4 de dano a todos os mobs num raio de 10 blocos, aplica Lentid\xE3o e Fraqueza e tem 2 segundos de recarga.",
    costSouls: 125,
    costXP: 5,
    tag: "spell_unlocked:frost",
    isActiveAbility: false,
    requiresTag: "path_right_1"
  },
  {
    id: "mage_manashield",
    name: "Prote\xE7\xE3o Arcana",
    description: "(Equipe e use: agachar + pular) Ganhe Prote\xE7\xE3o contra Fogo, Absor\xE7\xE3o, Resist\xEAncia III e Regenera\xE7\xE3o.",
    costSouls: 200,
    costXP: 5,
    tag: "shop_manashield",
    isActiveAbility: true,
    requiresTag: "path_left_2"
  },
  {
    id: "mage_lightning",
    name: "Explos\xE3o de Raios",
    description: "(Feiti\xE7o) Atinge com raios os mobs num raio de 10 blocos. Recarga: 5 segundos.",
    costSouls: 300,
    costXP: 5,
    tag: "spell_unlocked:lightning",
    isActiveAbility: false,
    requiresTag: "path_left_3"
  },
  {
    id: "mage_hypnosis",
    name: "Nuvem de Veneno",
    description: "(Equipe e use: agachar + pular) Aplica Veneno nos inimigos pr\xF3ximos. *PvP: jogadores tamb\xE9m recebem N\xE1usea*",
    costSouls: 100,
    costXP: 5,
    tag: "shop_hypnosis",
    isActiveAbility: true,
    requiresTag: "path_right_2"
  },
  {
    id: "mage_ice",
    name: "Maestria do Congelamento",
    description: "(Passiva) O dano do Gelo sobe para 12 e o alcance para 20 blocos, com 5 segundos de recarga.",
    costSouls: 230,
    costXP: 5,
    tag: "shop_ice",
    isActiveAbility: false,
    requiresTag: "path_right_3"
  },
  {
    id: "mage_magicslash",
    name: "Erup\xE7\xE3o Infernal",
    description: "(Equipe e use: agachar + pular) Causa 20 de dano e queima todos os mobs num raio de 15 blocos.",
    costSouls: 300,
    costXP: 5,
    tag: "shop_magicslash",
    isActiveAbility: true,
    requiresTag: "path_middle_3"
  },
  {
    id: "mage_mageshoot",
    name: "Maestria das Chamas",
    description: "(Passiva) O dano da Bola de Fogo sobe para 10 e o alcance para 20 blocos, e ela quebra blocos como um creeper, mas ganha 2 segundos de recarga.",
    costSouls: 240,
    costXP: 5,
    tag: "shop_mageshoot",
    isActiveAbility: false,
    requiresTag: "path_left_4"
  },
  {
    id: "mage_enchantment",
    name: "Biblioteca Et\xE9rea",
    description: "(Passiva) Receba um livro encantado aleat\xF3rio a cada dia do Minecraft.",
    costSouls: 500,
    costXP: 5,
    tag: "shop_enchantment",
    isActiveAbility: false,
    requiresTag: "path_middle_2"
  },
  {
    id: "mage_effectmage",
    name: "Surto de Magia Selvagem",
    description: "(Passiva) Receba um efeito ben\xE9fico aleat\xF3rio por 1 minuto a cada 6 minutos.",
    costSouls: 400,
    costXP: 5,
    tag: "shop_effectmage",
    isActiveAbility: false,
    requiresTag: "path_left_5"
  },
  {
    id: "mage_petsmage",
    name: "Mago das Feras (Guardi\xE3o Warden)",
    description: "(Habilidade especial) Libera a op\xE7\xE3o 'Invocar Guardi\xE3o!' na Loja de Almas para invocar um Guardi\xE3o Warden leal.",
    costSouls: 500,
    costXP: 5,
    tag: "shop_petsmage",
    isActiveAbility: false,
    requiresTag: "path_right_4"
  },
  {
    id: "mage_invisibility",
    name: "Dissolu\xE7\xE3o Arcana",
    description: "(Feiti\xE7o) Quando escolhido no Livro de Feiti\xE7os, voc\xEA fica invis\xEDvel enquanto segura o Cajado de Mago.",
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
    name: "Passo do Viajante",
    description: "(Passiva) Concede Velocidade I permanente enquanto voc\xEA usa botas.",
    costSouls: 100,
    costXP: 1,
    tag: "shop_survivor_boot",
    isActiveAbility: false,
    requiresTag: "path_middle_1"
  },
  {
    id: "survivor_map",
    name: "Mestre Cart\xF3grafo",
    description: "(Equipe e use: agachar + pular) Mostra no chat as coordenadas X-Y-Z de todos os jogadores online e a estrutura mais pr\xF3xima. (Recarga: 8 min)",
    costSouls: 100,
    costXP: 5,
    tag: "shop_survivor_map",
    isActiveAbility: true,
    requiresTag: "path_left_1"
  },
  {
    id: "survivor_healing",
    name: "Constitui\xE7\xE3o do Andarilho",
    description: "(Passiva) Concede +4 cora\xE7\xF5es extras e Regenera\xE7\xE3o enquanto voc\xEA usa um peitoral.",
    costSouls: 215,
    costXP: 5,
    tag: "shop_survivor_healing",
    isActiveAbility: false,
    requiresTag: "path_right_1"
  },
  {
    id: "survivor_thrones",
    name: "Retalia\xE7\xE3o do Alquimista",
    description: "(Passiva) Qualquer inimigo que causar dano a voc\xEA fica envenenado por 10 segundos.",
    costSouls: 200,
    costXP: 5,
    tag: "shop_survivor_thrones",
    isActiveAbility: false,
    requiresTag: "path_left_2"
  },
  {
    id: "survivor_dash",
    name: "Mestre da Fuga",
    description: "(Equipe e use: agachar + pular) Avan\xE7a 10 blocos causando 5 de dano aos mobs perto do ponto de partida. Concede Invisibilidade e Resist\xEAncia por 10s. (Recarga: 45s)",
    costSouls: 180,
    costXP: 5,
    tag: "active_ability_survivor_dash",
    isActiveAbility: true,
    requiresTag: "path_left_3"
  },
  {
    id: "survivor_medkit",
    name: "Maestria da Constitui\xE7\xE3o do Andarilho",
    description: "(Passiva) Aumenta os cora\xE7\xF5es extras para +10 no total enquanto voc\xEA usa um peitoral e tem a Constitui\xE7\xE3o do Andarilho. Tamb\xE9m cura 5 cora\xE7\xF5es na hora a cada 5 minutos.",
    costSouls: 350,
    costXP: 5,
    tag: "shop_survivor_medkit",
    isActiveAbility: false,
    requiresTag: "path_right_2"
  },
  {
    id: "survivor_safety",
    name: "P\xE2nico do Her\xF3i",
    description: "(Equipe e use: agachar + pular) Ganhe Resist\xEAncia III, Resist\xEAncia ao Fogo e Absor\xE7\xE3o por 30s. (Recarga: 6 min)",
    costSouls: 150,
    costXP: 5,
    tag: "active_ability_survivor_safety",
    isActiveAbility: true,
    requiresTag: "path_right_3"
  },
  {
    id: "survivor_speedboost",
    name: "Segundo F\xF4lego",
    description: "(Equipe e use: agachar + pular) Ganhe Velocidade III, Super Pulo II e Resist\xEAncia II por 20s. (Recarga: 4 min)",
    costSouls: 100,
    costXP: 5,
    tag: "active_ability_survivor_speedboost",
    isActiveAbility: true,
    requiresTag: "path_middle_3"
  },
  {
    id: "survivor_hide",
    name: "Camuflagem",
    description: "(Equipe e use: agachar + pular) Ganhe 60 segundos de Invisibilidade completa. (Recarga: 5 min)",
    costSouls: 280,
    costXP: 5,
    tag: "active_ability_survivor_hide",
    isActiveAbility: true,
    requiresTag: "path_left_4"
  },
  {
    id: "survivor_backup",
    name: "Reserva do Aventureiro",
    description: "(Passiva) Receba comida e materiais a cada dia completo do Minecraft, e uma ma\xE7\xE3 encantada a cada 5 dias.",
    costSouls: 425,
    costXP: 5,
    tag: "shop_survivor_backup",
    isActiveAbility: false,
    requiresTag: "path_middle_2"
  },
  {
    id: "survivor_effect",
    name: "Bebedor de Po\xE7\xF5es",
    description: "(Passiva) D\xE1 um efeito ben\xE9fico aleat\xF3rio por 1 minuto, a cada 6 minutos.",
    costSouls: 450,
    costXP: 5,
    tag: "shop_survivor_effect",
    isActiveAbility: false,
    requiresTag: "path_left_5"
  },
  {
    id: "survivor_vision",
    name: "Adapta\xE7\xE3o Noturna",
    description: "(Passiva) Concede Vis\xE3o Noturna permanente.",
    costSouls: 500,
    costXP: 5,
    tag: "shop_survivor_vision",
    isActiveAbility: false,
    requiresTag: "path_right_4"
  },
  {
    id: "survivor_lock",
    name: "Abrigo Improvisado",
    description: "(Equipe e use: agachar + pular) Cria um abrigo de emerg\xEAncia permanente de pedregulho, com mesa de trabalho e fornalha. (Recarga: 5 min)",
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
  const form = new ActionFormData().title("Loja de Almas").body("Bem-vindo \xE0 Loja de Almas! Escolha uma categoria:");
  form.button("Habilidades Ativas");
  form.button("Habilidades Passivas");
  const hasPetsmage = classId === 3 && player.hasTag("shop_petsmage");
  if (hasPetsmage) {
    form.button("\xA75\u2728 Invocar Guardi\xE3o! \u2728\xA7r");
  }
  form.button("Fechar");
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
    .title("\xA75Controle do Guardi\xE3o Warden\xA7r")
    .body("Controle o seu Guardi\xE3o Warden leal:\n\nEstado: " + (isSitting ? "\xA7eSENTADO (parado)\xA7r" : "\xA7aDE P\xC9 E PROTEGENDO\xA7r"))
    .button("\u2728 Invocar / Chamar de volta o Guardi\xE3o Warden")
    .button(isSitting ? "🟢 Mandar o Warden LEVANTAR" : "🟡 Mandar o Warden SENTAR")
    .button("Voltar");

  form.show(player).then((res) => {
    if (res.canceled || res.selection === void 0) return;
    if (res.selection === 0) {
      handleSummonOrRecallWarden(player);
    } else if (res.selection === 1) {
      if (isSitting) {
        player.removeTag("warden_sitting");
        player.sendMessage("\xA75[Guardi\xE3o Warden]\xA7a Seu Guardi\xE3o Warden agora est\xE1 DE P\xC9 e protegendo voc\xEA!\xA7r");
      } else {
        player.addTag("warden_sitting");
        player.sendMessage("\xA75[Guardi\xE3o Warden]\xA7e Seu Guardi\xE3o Warden agora est\xE1 SENTADO. Ele fica parado e n\xE3o ataca.\xA7r");
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
    player.sendMessage(`\xA7c[Guardi\xE3o Warden]\xA74 Seu Guardi\xE3o Warden foi morto! Voc\xEA pode invocar outro em ${mcDays} dias do Minecraft (${realMins} min).\xA7r`);
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
    player.sendMessage("\xA75[Guardi\xE3o Warden]\xA7a Seu Guardi\xE3o Warden foi chamado at\xE9 voc\xEA!\xA7r");
    return;
  }

  player.sendMessage("\xA75[Ritual]\xA7e Realizando um ritual de 5 segundos para invocar seu Guardi\xE3o Warden...\xA7r");
  
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
        warden.nameTag = `\xA75Guardi\xE3o Warden de ${player.name}\xA7r`;
        try {
          player.playSound("mob.warden.emerge");
          player.dimension.spawnParticle("minecraft:sonic_explosion", player.location);
        } catch (_) {}
        player.sendMessage("\xA75[Guardi\xE3o Warden]\xA7a Seu Guardi\xE3o Warden se ergueu para proteger voc\xEA!\xA7r");
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
  const form = new ActionFormData().title("Habilidades Ativas").body(`Compre e equipe habilidades ativas.\nAlmas: \xA7c${currentSouls}\xA7r | N\xEDvel de XP: \xA7a${player.level}\xA7r\n`);
  if (visibleItems.length === 0) {
    form.body("\xA7cAinda n\xE3o h\xE1 habilidades ativas para a sua classe.");
    form.button("\xA7cVoltar");
    form.show(player).then(() => showSoulShopUI(player)).catch(e => {});
    return;
  }
  for (const item of visibleItems) {
    const hasPurchased = player.hasTag(item.tag);
    const isEquipped = player.hasTag(`equipped_${item.tag}`);
    if (isEquipped) {
      form.button(`\xA7a[Equipado] ${item.name}`);
    } else if (hasPurchased) {
      form.button(`\xA78[Comprado] ${item.name}\n\xA7eToque para equipar`);
    } else {
      form.button(`\xA7b${item.name}\n\xA78${item.costSouls} Almas | ${item.costXP} XP`);
    }
  }
  form.button("\xA7cVoltar");
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
        player.sendMessage("\xA7cEssa habilidade j\xE1 est\xE1 equipada!");
      } else {
        for (const item of shopItems) {
          player.removeTag(`equipped_${item.tag}`);
        }
        player.addTag(`equipped_${selectedItem.tag}`);
        player.sendMessage(`\xA7aEquipado: \xA7e${selectedItem.name}`);
        player.playSound("armor.equip_iron");
        if (selectedItem.tag !== "shop_mage_staff") {
          player.sendMessage(ABILITY_USAGE_MESSAGES[selectedItem.tag] || `\xA7ePara usar ${selectedItem.name}, agache e depois pule! Fique de olho na recarga.\xA7r`);
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
        player.sendMessage(`\xA7aComprado: \xA7e${selectedItem.name}`);
        player.sendMessage("\xA7a[Sistema] O seu Arco Mortal do Assassino fica travado no invent\xE1rio, se conserta sozinho e volta se for perdido.");
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
        player.sendMessage(`\xA7aComprado: \xA7eCajado de Mago`);

      } else {
        player.addTag(selectedItem.tag);
        player.sendMessage(`\xA7aComprado: \xA7e${selectedItem.name}`);
        player.sendMessage(`\xA7bUso: \xA7f${selectedItem.description.replace(/^Passive: |^Active: /g, "")}`);
        if (selectedItem.isActiveAbility) {
          const allShopItems = getShopItemsForClass(classObj.getScore(player) ?? 0);
          for (const item of allShopItems) {
            if (item.isActiveAbility) {
              player.removeTag(`equipped_${item.tag}`);
            }
          }
          player.addTag(`equipped_${selectedItem.tag}`);
          player.sendMessage(`\xA7aHabilidade ativa equipada sozinha: \xA7e${selectedItem.name}`);
        }
      }
      player.playSound("random.levelup");
    } else {
      player.sendMessage(`\xA7cRecursos insuficientes! Voc\xEA precisa de ${selectedItem.costSouls} Almas e ${selectedItem.costXP} n\xEDveis de XP.`);
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
  const form = new ActionFormData().title("Habilidades Passivas").body(`Compre habilidades passivas da sua classe.\nAlmas: \xA7c${currentSouls}\xA7r | N\xEDvel de XP: \xA7a${player.level}\xA7r\n`);
  if (shopItems.length === 0) {
    form.body("\xA7cAinda n\xE3o h\xE1 itens b\xE1sicos para a sua classe.");
    form.button("\xA7cVoltar");
    form.show(player).then(() => showSoulShopUI(player)).catch(e => {});
    return;
  }
  for (const item of shopItems) {
    const hasPurchased = player.hasTag(item.tag);
    const locked = item.unlockLevel && rpgLevel < item.unlockLevel;
    if (hasPurchased) {
      form.button(`\xA78[Comprado] ${item.name}`);
    } else if (locked) {
      form.button(`\xA78[Bloqueado - Nv ${item.unlockLevel}]\n${item.name}`);
    } else {
      form.button(`\xA72${item.name}\n\xA78${item.costSouls} Almas | ${item.costXP} XP`);
    }
  }
  form.button("\xA7cVoltar");
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
        player.sendMessage(`\xA7aHabilidade passiva ligada: \xA7e${selectedItem.name}`);
      } else {
        player.addTag(offTag);
        player.sendMessage(`\xA7cHabilidade passiva desligada: \xA7e${selectedItem.name}`);
      }
      player.playSound("random.orb");
      return;
    }
    if (selectedItem.unlockLevel && rpgLevel < selectedItem.unlockLevel) {
      player.sendMessage(`\xA7cEssa habilidade libera no n\xEDvel ${selectedItem.unlockLevel} do RPG!`);
      return;
    }
    if (currentSouls >= selectedItem.costSouls && player.level >= selectedItem.costXP) {
      soulsObj.setScore(player, currentSouls - selectedItem.costSouls);
      player.addLevels(-selectedItem.costXP);
      if (selectedItem.tag === "shop_assassin_bow") {
        player.addTag(selectedItem.tag);
        giveAssassinBow(player);
        player.sendMessage(`\xA7aComprado: \xA7e${selectedItem.name}`);
        player.sendMessage("\xA7a[Sistema] O seu Arco Mortal do Assassino fica travado no invent\xE1rio, se conserta sozinho e volta se for perdido.");
      } else {
        player.addTag(selectedItem.tag);
        grantTimedSkillRewardImmediately(player, selectedItem.tag);
        player.sendMessage(`\xA7aComprado: \xA7e${selectedItem.name}`);
        player.sendMessage(`\xA7bUso: \xA7f${selectedItem.description.replace(/^Passive: |^Active: /g, "")}`);
      }
      player.playSound("random.levelup");
    } else {
      player.sendMessage(`\xA7cRecursos insuficientes! Voc\xEA precisa de ${selectedItem.costSouls} Almas e ${selectedItem.costXP} n\xEDveis de XP.`);
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
  player.sendMessage(`\xA7a\xA7lSUBIU DE N\xCDVEL! \xA7r\xA7aAgora voc\xEA \xE9 n\xEDvel \xA7e${newLevel}\xA7a no RPG!`);
  let earnedPerks = 1;
  if (newLevel <= 7) {
    earnedPerks = 1;
  } else if (newLevel <= 15) {
    earnedPerks = 1.5;
  } else {
    earnedPerks = 2;
  }
  player.sendMessage(`\xA7b[\xC1rvore de Habilidades] \xA7fVoc\xEA ganhou \xA7e+${earnedPerks} ponto(s) de vantagem\xA7f! Abra a \xC1rvore de Habilidades para gastar.`);
  player.playSound("random.levelup");
  const shopItems = getShopItemsForClass(classId);
  let unlockedItems = [];
  for (const item of shopItems) {
    if (item.unlockLevel === newLevel) {
      unlockedItems.push(item.name);
    }
  }
  if (unlockedItems.length > 0) {
    player.sendMessage(`\xA7d[Loja de Almas] \xA7fNovas habilidades desbloqueadas: \xA7e${unlockedItems.join(", ")}`);
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
    player.sendMessage("\xA7cErro ao dar o item: " + typeId);
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
    1: { items: [["minecraft:wooden_sword"], ["minecraft:leather_chestplate"]], msg: "\xA7e[Sistema] Equipamento inicial recebido!" },
    2: { effects: [["speed", min2, 0], ["strength", min2, 0]], msg: "\xA7e[Sistema] B\xF4nus tempor\xE1rios concedidos por 2 minutos!" },
    3: { items: [["minecraft:chainmail_chestplate"], ["minecraft:stone_sword", 2]], msg: "\xA7e[Sistema] Equipamento novo recebido!" },
    4: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 4!" },
    5: { items: [["minecraft:iron_chestplate"], ["minecraft:iron_sword"], ["minecraft:iron_axe"]], msg: "\xA7a[Promo\xE7\xE3o] \xA7eDe novato a grand\xE3o! Voc\xEA ganhou equipamento de ferro." },
    6: { items: [["minecraft:iron_sword"]], msg: "\xA7e[Sistema] Voc\xEA recebeu o Espad\xE3o de Ferro!" },
    7: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 7!" },
    8: { items: [["minecraft:iron_helmet", 1, unbreaking1], ["minecraft:iron_chestplate", 1, unbreaking1], ["minecraft:iron_leggings", 1, unbreaking1], ["minecraft:iron_boots", 1, unbreaking1], ["minecraft:iron_sword", 1, { sharpness: 3 }]], msg: "\xA7e[Sistema] Equipamento de Ferro Encantado recebido!" },
    9: { effects: [["resistance", min30, 1], ["strength", min30, 1], ["health_boost", min30, 2], ["fire_resistance", min2, 0]], msg: "\xA7e[Sistema] B\xF4nus do N\xEDvel 9 concedidos!" },
    10: { items: [["minecraft:diamond_chestplate", 1, { unbreaking: 3 }], ["minecraft:diamond_sword"]], msg: "\xA7a[Promo\xE7\xE3o] \xA7eVoc\xEA ganhou equipamento de diamante!" },
    11: { items: [["minecraft:diamond_sword", 1, { sharpness: 4 }]], effects: [["strength", min10, 2], ["speed", min10, 1], ["resistance", min10, 1], ["health_boost", min10, 4]], msg: "\xA7e[Sistema] Espada poderosa e b\xF4nus de 10 min recebidos!" },
    12: { items: [["minecraft:iron_axe"], ["minecraft:diamond_chestplate", 1, { protection: 4, unbreaking: 3, thorns: 3, mending: 1 }]], msg: "\xA7e[Sistema] Peitoral de Diamante Mestre e Machado de Guerra de A\xE7o recebidos!" },
    13: { items: [["minecraft:diamond_sword", 1, { sharpness: 5, looting: 3, unbreaking: 3, mending: 1, fire_aspect: 2 }]], effects: [["strength", min10, 1]], msg: "\xA7e[Sistema] Espada de Diamante Mestre recebida!" },
    14: { effects: [["resistance", min30, 1], ["strength", min30, 1], ["health_boost", min30, 2], ["fire_resistance", min2, 0]], msg: "\xA7e[Sistema] B\xF4nus de promo\xE7\xE3o concedidos!" },
    15: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 15!" },
    16: { items: [["minecraft:diamond_sword"]], msg: "\xA7e[Sistema] Montante de Osso de Drag\xE3o recebido!" },
    17: { items: [["minecraft:netherite_ingot", 3]], effects: [["resistance", min30, 1], ["strength", min30, 1], ["health_boost", min30, 2], ["fire_resistance", min2, 0]], msg: "\xA7e[Sistema] Netherite e b\xF4nus de 30 min recebidos!" },
    18: { effects: [["resistance", min30, 1], ["strength", min30, 1], ["fire_resistance", min2, 0]], msg: "\xA7e[Sistema] B\xF4nus de promo\xE7\xE3o concedidos!" },
    20: { msg: "\xA7e[Sistema] N\xEDvel m\xE1ximo alcan\xE7ado! Parab\xE9ns, Guerreiro!" },
  },
  // Class 2: Ranger
  2: {
    1: { items: [["minecraft:arrow", 32], ["minecraft:leather_helmet"], ["minecraft:leather_chestplate"]], bow: 1, msg: "\xA7e[Sistema] Equipamento inicial de Patrulheiro recebido! \xA76Arco do Patrulheiro\xA7e preso ao invent\xE1rio." },
    2: { effects: [["speed", min2, 1]], msg: "\xA7e[Sistema] B\xF4nus tempor\xE1rios concedidos por 2 minutos!" },
    3: { items: [["minecraft:arrow", 64]], msg: "\xA7e[Sistema] Flechas recebidas!" },
    4: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 4!" },
    5: { items: [["minecraft:chainmail_helmet"], ["minecraft:chainmail_chestplate"], ["minecraft:chainmail_leggings"], ["minecraft:chainmail_boots"]], msg: "\xA7a[Promo\xE7\xE3o] \xA7eVoc\xEA ganhou equipamento de malha." },
    6: { items: [["minecraft:bow"], ["minecraft:bow", 1, { power: 1 }], ["minecraft:arrow", 64]], msg: "\xA7e[Sistema] Arco Encantado e Arco Longo do Ca\xE7ador recebidos!" },
    7: { bow: 7, msg: "\xA7e[Sistema] \xA76Arco do Patrulheiro melhorado para For\xE7a IV!" },
    8: { items: [["minecraft:iron_helmet"], ["minecraft:iron_chestplate"], ["minecraft:iron_leggings"], ["minecraft:iron_boots"]], msg: "\xA7e[Sistema] Armadura de Ferro recebida!" },
    9: { items: [["minecraft:bow", 1, { power: 2, punch: 1 }], ["minecraft:arrow", 64]], msg: "\xA7e[Sistema] Arco com For\xE7a II recebido!" },
    10: { items: [["minecraft:crossbow"], ["minecraft:arrow", 64]], effects: [["speed", min10, 2]], msg: "\xA7a[Promo\xE7\xE3o] \xA7eVoc\xEA ganhou uma besta!" },
    11: { items: [["minecraft:crossbow", 1, { quick_charge: 2, piercing: 2 }]], msg: "\xA7e[Sistema] Besta Encantada recebida!" },
    12: { items: [["minecraft:crossbow"], ["minecraft:diamond_helmet", 1, { unbreaking: 2 }], ["minecraft:diamond_boots", 1, { unbreaking: 2 }]], msg: "\xA7e[Sistema] Armadura de Diamante e Besta Fantasma recebidas!" },
    13: { items: [["minecraft:crossbow", 1, { quick_charge: 3, multishot: 1, unbreaking: 3 }]], msg: "\xA7e[Sistema] Besta Mestre recebida!" },
    14: { effects: [["speed", min30, 2], ["jump_boost", min30, 1]], msg: "\xA7e[Sistema] B\xF4nus de promo\xE7\xE3o concedidos!" },
    15: { bow: 15, msg: "\xA7e[Sistema] \xA76Arco do Patrulheiro melhorado ao M\xC1XIMO (For\xE7a V + Chama + Infinidade)!" },
    16: { items: [["minecraft:bow"], ["minecraft:bow", 1, { power: 5, flame: 1, unbreaking: 3, infinity: 1 }], ["minecraft:arrow", 1]], msg: "\xA7e[Sistema] Arco Mestre e Arco Chama-Tempestades recebidos!" },
    17: { effects: [["strength", min30, 1], ["regeneration", min30, 0]], msg: "\xA7e[Sistema] B\xF4nus de 30 min concedidos!" },
    18: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 18!" },
    20: { msg: "\xA7e[Sistema] N\xEDvel m\xE1ximo alcan\xE7ado! Parab\xE9ns, Patrulheiro!" },
  },
  // Class 3: Mage
  3: {
    1: { items: [["minecraft:leather_helmet"], ["minecraft:leather_chestplate"]] },
    2: { effects: [["speed", min2, 0]], msg: "\xA7e[Sistema] B\xF4nus tempor\xE1rios concedidos por 2 minutos!" },
    3: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 3!" },
    4: { items: [["minecraft:chainmail_helmet"], ["minecraft:chainmail_chestplate"], ["minecraft:chainmail_leggings"], ["minecraft:chainmail_boots"]], msg: "\xA7e[Sistema] Armadura de Cota de Malha recebida." },
    5: { msg: "\xA7a[Promo\xE7\xE3o] \xA7eFeiti\xE7o desbloqueado: \xA7bEspinho de Gelo\xA7e!" },
    6: { effects: [["speed", min30, 1], ["regeneration", min30, 0]], msg: "\xA7e[Sistema] B\xF4nus tempor\xE1rios concedidos por 30 minutos!" },
    7: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 7!" },
    8: { items: [["minecraft:iron_helmet", 1, { protection: 1 }], ["minecraft:iron_boots", 1, { protection: 1 }]], msg: "\xA7e[Sistema] Armadura de Ferro Encantada recebida!" },
    9: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 9!" },
    10: { items: [["minecraft:diamond_helmet"], ["minecraft:diamond_boots"]], msg: "\xA7e[Sistema] Armadura de Diamante e feiti\xE7o Nuvem Venenosa recebidos!" },
    11: { effects: [["speed", min10, 2], ["regeneration", min10, 1]], msg: "\xA7e[Sistema] B\xF4nus de 10 min concedidos!" },
    12: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 12!" },
    13: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 13!" },
    14: { effects: [["speed", min30, 2], ["resistance", min30, 1]], msg: "\xA7e[Sistema] B\xF4nus de promo\xE7\xE3o concedidos!" },
    15: { msg: "\xA7e[Sistema] Feiti\xE7o Golpe de Rel\xE2mpago desbloqueado!" },
    16: { items: [["minecraft:netherite_ingot", 2]], msg: "\xA7e[Sistema] Netherite recebido!" },
    17: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 17!" },
    18: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 18!" },
    20: { msg: "\xA7e[Sistema] N\xEDvel m\xE1ximo alcan\xE7ado! Explos\xE3o Wither desbloqueada!" },
  },
  // Class 4: Assassin
  4: {
    1: { items: [["minecraft:stone_sword", 2], ["minecraft:leather_boots"]], msg: "\xA7e[Sistema] Equipamento inicial de Assassino recebido!" },
    2: { effects: [["speed", min2, 1]], msg: "\xA7e[Sistema] B\xF4nus tempor\xE1rios concedidos por 2 minutos!" },
    3: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 3!" },
    4: { items: [["minecraft:iron_sword", 2]], msg: "\xA7e[Sistema] Espadas de Ferro recebidas!" },
    5: { items: [["minecraft:iron_helmet"], ["minecraft:iron_boots"]], msg: "\xA7a[Promo\xE7\xE3o] \xA7eVoc\xEA ganhou armadura de ferro." },
    6: { items: [["minecraft:iron_sword"], ["minecraft:iron_sword", 1, { sharpness: 2 }]], msg: "\xA7e[Sistema] Espada Encantada e Adaga Sombria recebidas!" },
    7: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 7!" },
    8: { effects: [["invisibility", min30, 0], ["strength", min30, 1]], msg: "\xA7e[Sistema] B\xF4nus de Furtividade de 30 min concedidos!" },
    9: { items: [["minecraft:diamond_sword"]], msg: "\xA7e[Sistema] Espada de Diamante recebida!" },
    10: { items: [["minecraft:diamond_boots", 1, { feather_falling: 4 }]], msg: "\xA7a[Promo\xE7\xE3o] \xA7eVoc\xEA ganhou botas com Peso-Pena!" },
    11: { items: [["minecraft:diamond_sword", 1, { sharpness: 3, fire_aspect: 1 }]], msg: "\xA7e[Sistema] Espada de Diamante Encantada recebida!" },
    12: { items: [["minecraft:diamond_sword"]], msg: "\xA7e[Sistema] L\xE2mina Dupla Venenosa recebida!" },
    13: { items: [["minecraft:diamond_sword", 1, { sharpness: 5, looting: 3, unbreaking: 3 }]], msg: "\xA7e[Sistema] Espada de Diamante Mestre recebida!" },
    14: { effects: [["strength", min30, 2], ["speed", min30, 2]], msg: "\xA7e[Sistema] B\xF4nus de explos\xE3o da promo\xE7\xE3o concedidos!" },
    15: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 15!" },
    16: { items: [["minecraft:netherite_sword"], ["minecraft:netherite_ingot", 2]], msg: "\xA7e[Sistema] Netherite e Karambit do Eclipse recebidos!" },
    17: { effects: [["strength", min10, 3]], msg: "\xA7e[Sistema] 10 min de For\xE7a Extrema concedidos!" },
    18: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 18!" },
    20: { msg: "\xA7e[Sistema] N\xEDvel m\xE1ximo alcan\xE7ado! Parab\xE9ns, Assassino!" },
  },
  // Class 5: Survivor
  5: {
    1: { items: [["minecraft:stone_pickaxe"], ["minecraft:stone_axe"], ["minecraft:leather_helmet"], ["minecraft:leather_chestplate"]], msg: "\xA7e[Sistema] Equipamento inicial de Sobrevivente recebido!" },
    2: { effects: [["resistance", min2, 0]], msg: "\xA7e[Sistema] B\xF4nus tempor\xE1rios concedidos por 2 minutos!" },
    3: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 3!" },
    4: { items: [["minecraft:shield"]], msg: "\xA7e[Sistema] Escudo recebido!" },
    5: { items: [["minecraft:iron_chestplate"], ["minecraft:iron_leggings"]], msg: "\xA7a[Promo\xE7\xE3o] \xA7eVoc\xEA ganhou armadura de ferro." },
    6: { items: [["minecraft:iron_sword"]], msg: "\xA7e[Sistema] Espad\xE3o de Ferro recebido!" },
    7: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 7!" },
    8: { items: [["minecraft:iron_helmet", 1, { protection: 2 }], ["minecraft:iron_boots", 1, { protection: 2 }]], msg: "\xA7e[Sistema] Armadura de Ferro Encantada recebida!" },
    9: { items: [["minecraft:diamond_chestplate"]], msg: "\xA7e[Sistema] Peitoral de Diamante recebido!" },
    10: { items: [["minecraft:shield", 1, { unbreaking: 3 }]], msg: "\xA7a[Promo\xE7\xE3o] \xA7eVoc\xEA ganhou um escudo encantado!" },
    11: { effects: [["invisibility", min30, 0]], msg: "\xA7e[Sistema] 30 min de Invisibilidade concedidos!" },
    12: { items: [["minecraft:iron_axe"]], msg: "\xA7e[Sistema] Machado de Guerra de A\xE7o recebido!" },
    13: { items: [["minecraft:diamond_chestplate", 1, { protection: 4, unbreaking: 3 }], ["minecraft:diamond_leggings", 1, { protection: 4, unbreaking: 3 }]], msg: "\xA7e[Sistema] Armadura de Diamante Mestre recebida!" },
    14: { effects: [["regeneration", min30, 0], ["resistance", min30, 1]], msg: "\xA7e[Sistema] B\xF4nus de defesa da promo\xE7\xE3o concedidos!" },
    15: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 15!" },
    16: { items: [["minecraft:diamond_sword"]], msg: "\xA7e[Sistema] Montante de Osso de Drag\xE3o recebido!" },
    17: { effects: [["health_boost", min30, 4]], msg: "\xA7e[Sistema] B\xF4nus de Vida M\xE1xima de 30 min concedidos!" },
    18: { msg: "\xA7e[Sistema] Voc\xEA alcan\xE7ou o N\xEDvel 18!" },
    20: { msg: "\xA7e[Sistema] N\xEDvel m\xE1ximo alcan\xE7ado! Parab\xE9ns, Sobrevivente!" },
  },
};

function applyBuffs(player, level, classId) {
  if (level === 19) {
    player.sendMessage("\xA7c[Sistema] Chefe liberado para luta! Veja no RPG Guide.");
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
    player.sendMessage("\xA7c[Erro] N\xE3o foi poss\xEDvel criar o Arco de Patrulheiro.");
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
    player.sendMessage("\xA7a[Sistema] O seu Arco de Patrulheiro foi restaurado para o seu n\xEDvel atual.");
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
    player.sendMessage("\xA7c[Erro] N\xE3o foi poss\xEDvel criar o Arco Mortal do Assassino.");
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
    player.sendMessage("\xA7a[Sistema] O seu Arco Mortal do Assassino foi restaurado.");
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
    player.sendMessage(`\xA7cVoc\xEA ainda n\xE3o pode invocar o chefe de novo! Espere alguns minutos.`);
    return;
  }
  const form = new ActionFormData2().title("\u2620 Luta contra o Chefe \u2620").body("Pronto para enfrentar o chefe? Cuidado! Ele \xE9 extremamente perigoso.").button("\xA7cEnfrentar o Chefe").button("\xA77Voltar");
  form.show(player).then((response) => {
    if (response.canceled) return;
    if (response.selection === 0) {
      startBossSequence(player);
    }
  }).catch(e => {});
}
function startBossSequence(player) {
  spawnCooldowns.set(player.id, system3.currentTick + BOSS_COOLDOWN_TICKS);
  player.sendMessage("\xA74[Sistema] O chefe chega em 7 segundos!");
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
  player.onScreenDisplay.setTitle("\xA74LUTE!");
  player.playSound("mob.enderdragon.growl");
  const spawnLoc = {
    x: player.location.x + (Math.random() * 4 - 2),
    y: player.location.y,
    z: player.location.z + (Math.random() * 4 - 2)
  };
  const warden = player.dimension.spawnEntity("minecraft:warden", spawnLoc);
  warden.nameTag = "\xA74\u2620 Warden Desperto \u2620";
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
  world5.sendMessage("\xA74[Chefe] O Warden Desperto foi invocado!");
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
  player.sendMessage(`\xA7e[\xC1rvore de Habilidades]\xA7r Pontos dispon\xEDveis: \xA7a${availablePoints}\xA7r.`);
  let form = new ActionFormData3();
  const bgMap = {
    1: "textures/warrior_skill_tree_bg",
    2: "textures/ranger_skill_tree_bg",
    3: "textures/mage_skill_tree_bg",
    4: "textures/assassin_skill_tree_bg",
    5: "textures/survivor_skill_tree_bg"
  };
  form.title(bgMap[classId] || "textures/skill_tree_bg_empty");
  form.body(`Voc\xEA tem ${availablePoints} pontos.`);
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
    choices.push({ text: `Desligado`, action: () => {
    } });
  } else if (leftLvl < 5) {
    const leftCost = getCost("left", leftLvl + 1);
    choices.push({ text: `Desbloquear caminho da esquerda (${leftLvl + 1}/5)\n${leftCost} pts de vantagem`, action: () => handleSkillUnlock(player, "left", leftLvl + 1) });
  } else {
    choices.push({ text: `Caminho da esquerda completo!`, action: () => {
    } });
  }
  if (middleLvl < 3) {
    const midCost = getCost("middle", middleLvl + 1);
    choices.push({ text: `Desbloquear caminho do meio (${middleLvl + 1}/3)\n${midCost} pts de vantagem`, action: () => handleSkillUnlock(player, "middle", middleLvl + 1) });
  } else {
    choices.push({ text: `Caminho do meio completo!`, action: () => {
    } });
  }
  if (middleLvl === 0) {
    choices.push({ text: `Desligado`, action: () => {
    } });
  } else if (rightLvl < 5) {
    const rightCost = getCost("right", rightLvl + 1);
    choices.push({ text: `Desbloquear caminho da direita (${rightLvl + 1}/5)\n${rightCost} pts de vantagem`, action: () => handleSkillUnlock(player, "right", rightLvl + 1) });
  } else {
    choices.push({ text: `Caminho da direita completo!`, action: () => {
    } });
  }
  for (const choice of choices) {
    form.button(choice.text);
  }
  form.button("Sair");
  form.button("Melhorar habilidade");
  form.button("Devolver todas as vantagens");
  form.button("Lista de habilidades");
  form.show(player).then((res) => {
    if (res.canceled || res.selection === void 0) return;
    const choiceIdx = res.selection - 13;
    if (choiceIdx >= 0 && choiceIdx < choices.length) {
      choices[choiceIdx].action();
    } else if (choiceIdx === choices.length) {
      player.sendMessage("\xA7eSaindo da \xE1rvore de habilidades.");
    } else if (choiceIdx === choices.length + 1) {
      player.sendMessage("\xA7eEm breve!");
    } else if (choiceIdx === choices.length + 2) {
      player.sendMessage("\xA7eEm breve!");
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
  form.title("Lista de habilidades");
  form.body("Todas as habilidades dispon\xEDveis e seus benef\xEDcios:\n");
  for (const node of currentUiNodes) {
    let isUnlocked = false;
    if (node.path === "left" && node.level <= leftLvl) isUnlocked = true;
    else if (node.path === "right" && node.level <= rightLvl) isUnlocked = true;
    else if (node.path === "middle" && node.level <= middleLvl) isUnlocked = true;
    const iconType = isUnlocked ? "_un" : "_l";
    const displayName = getNodeDisplayName(classId, node);
    form.button(displayName, `textures/skill_icons/${node.id}${iconType}`);
  }
  form.button("Voltar");
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
  agility: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 \xA7aVelocidade I\xA7r permanente o tempo todo.\n",
  firearrow: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 Toda flecha que voc\xEA dispara \xA76incendeia\xA7r o alvo por \xA7e12 segundos\xA7r e causa dano extra.\n\u2022 Funciona em mobs e jogadores.\n",
  poisonarrow: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 Toda flecha que voc\xEA dispara \xA72envenena\xA7r o alvo por \xA7e6 segundos\xA7r.\n\u2022 Acumula com a Flecha de Fogo: queima E envenena juntos!\n",
  map: "\xA7dTipo: Habilidade Ativa (Agachar + Pular)\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 Varre o mundo e lista no chat todos os jogadores online.\n\u2022 Mostra dist\xE2ncia e dire\xE7\xE3o (ex.: 140m Nordeste).\n\n\xA77Recarga: 5 minutos\xA7r\n",
  arrowsunlimi: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 Sua aljava \xA7anunca esvazia\xA7r: uma flecha nova aparece sozinha quando acabam.\n\u2022 \xA77Precisa de um arco na m\xE3o principal ou secund\xE1ria.\xA7r\n",
  hearts: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 Concede \xA7c+6 cora\xE7\xF5es extras\xA7r permanentes.\n\u2022 Concede \xA7aRegenera\xE7\xE3o permanente\xA7r.\n",
  rapidarrow: "\xA7dTipo: Habilidade Ativa\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 \xA7eAgachar + Pular\xA7r dispara \xA7e60 flechas\xA7r em sequ\xEAncia r\xE1pida para onde voc\xEA est\xE1 olhando.\n\u2022 As flechas levam seus efeitos de Flecha de Fogo / Flecha Venenosa.\n\n\xA77Recarga: 4 minutos\xA7r\n",
  immunearrow: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 \xA7aImunidade total\xA7r a dano de flechas e proj\xE9teis.\n\u2022 A vida \xE9 restaurada no mesmo valor de cada proj\xE9til que acertar voc\xEA.\n",
  deadarrow: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 Flechas totalmente carregadas causam \xA7cdano dobrado\xA7r al\xE9m do dano normal.\n\u2022 \xA77Dica: puxe o arco at\xE9 ele parar de tremer.\xA7r\n",
  aim: "\xA7dTipo: Habilidade Ativa\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 \xA7eAgachar + Pular\xA7r concede \xA7eVis\xE3o Noturna\xA7r por \xA7e1 minuto\xA7r, perfeita para ca\xE7adas noturnas.\n\n\xA77Recarga: 6 minutos\xA7r\n",
  archersafe: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 \xA7aResist\xEAncia I\xA7r permanente.\n\u2022 Segurando um arco: concede \xA7aVelocidade II\xA7r e \xA7c+2 cora\xE7\xF5es extras\xA7r.\n\u2022 \xA77Acumula com a habilidade Cora\xE7\xF5es.\xA7r\n",
  explosion: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 Toda flecha cria uma \xA76explos\xE3o\xA7r ao atingir, ferindo mobs pr\xF3ximos.\n\u2022 \xA77Tiros normais de arco quebram blocos. As explos\xF5es da Chuva de Flechas n\xE3o.\xA7r\n",
  armour: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 \xA7aResist\xEAncia II\xA7r usando \xA7earmadura completa\xA7r (as 4 pe\xE7as).\n\u2022 \xA7aQueda Lenta II\xA7r permanente usando \xA7ebotas\xA7r.\n"
};
var assassinSkillDescriptions = {
  speed: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 \xA7aVelocidade II\xA7r permanente o tempo todo.\n",
  dagger: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 Todo golpe corpo a corpo causa \xA7c+3 de dano b\xF4nus\xA7r (1,5 cora\xE7\xE3o extra), mesmo de m\xE3os vazias.\n",
  silence: "\xA7dTipo: Habilidade Ativa\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 \xA7eAgachar + Pular\xA7r concede \xA7aInvisibilidade\xA7r por \xA7e45 segundos\xA7r.\n\n\xA77Recarga: 8 minutos\xA7r\n",
  critical: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 Atacar \xA7eno ar (pulando/caindo)\xA7r causa \xA7c+7 de dano b\xF4nus\xA7r.\n\u2022 \xA77Vale ao acertar inimigos com espada no ar.\xA7r\n",
  bow: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 D\xE1 um arco com \xA7eFor\xE7a IV + Inquebr\xE1vel III\xA7r direto no seu invent\xE1rio.\n\u2022 \xA77Compre de novo para receber outro arco.\xA7r\n",
  blind: "\xA7dTipo: Habilidade Ativa\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 \xA7eAgachar + Pular\xA7r aplica \xA78Escurid\xE3o\xA7r e \xA7cFraqueza\xA7r em todas as entidades a at\xE9 \xA7e15 blocos\xA7r por \xA7e20s\xA7r.\n\u2022 Voc\xEA ganha \xA7aInvisibilidade\xA7r por \xA7e20s\xA7r.\n\n\xA77Recarga: 5 minutos\xA7r\n",
  lethal: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 Todo golpe corpo a corpo \xA7acura 1 cora\xE7\xE3o\xA7r (roubo de vida).\n\u2022 Uma part\xEDcula de cora\xE7\xE3o aparece a cada cura.\n",
  arrow: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 Receba \xA7e7 flechas\xA7r automaticamente a cada dia do Minecraft.\n\u2022 \xA77Combina perfeitamente com o Arco do Assassino.\xA7r\n",
  shadow: "\xA7dTipo: Habilidade Ativa\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 \xA7eAgachar + Pular\xA7r concede \xA7aInvisibilidade\xA7r, \xA7aVelocidade II\xA7r, \xA7aFor\xE7a II\xA7r, \xA7aResist\xEAncia\xA7r e \xA7aSuper Pulo\xA7r por \xA7e30s\xA7r.\n\u2022 Inimigos a at\xE9 \xA7e5 blocos\xA7r recebem \xA7cVeneno\xA7r e \xA7cFraqueza\xA7r.\n\n\xA77Recarga: 10 minutos\xA7r\n",
  poison: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 Toda entidade que causar dano a voc\xEA fica \xA72envenenada\xA7r por \xA7e25 segundos\xA7r.\n",
  hearts: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 Concede \xA7c+6 cora\xE7\xF5es extras\xA7r permanentes.\n\u2022 Concede \xA7aRegenera\xE7\xE3o permanente\xA7r.\n",
  disharm: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 A cada \xA7e5 minutos\xA7r: ganhe \xA7aInvisibilidade\xA7r por \xA7e20s\xA7r e fique \xA7aimune a dano de espada\xA7r durante esse tempo.\n\u2022 \xA77Golpes de machado N\xC3O s\xE3o bloqueados.\xA7r\n",
  instantkill: "\xA7dTipo: Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 Acerte o mesmo alvo \xA7e3 vezes em 5 segundos\xA7r sem ser atingido \u2192 cause \xA7c40 de dano b\xF4nus\xA7r.\n\u2022 Funciona s\xF3 uma vez por mob e tem \xA7e60 segundos de recarga\xA7r depois de ativar.\n\u2022 \xA77Levar um golpe de qualquer um zera seu combo!\xA7r\n"
};
var survivorSkillDescriptions = {
  boot: "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Concede Velocidade I permanente enquanto usa botas.\n",
  map: "\xA7dTipo: Habilidade Especial (Agachar + Pular)\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 Mostra no chat as coordenadas X-Y-Z exatas de todos os jogadores online.\n\u2022 Identifica o nome da estrutura mais pr\xF3xima.\n\u2022 N\xE3o precisa de mapa na m\xE3o!\n\n\xA77Recarga: 8 min\xA7r\n",
  healing: "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Concede +4 cora\xE7\xF5es extras e Regenera\xE7\xE3o enquanto usa peitoral.\n",
  thrones: "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Todo inimigo que causar dano a voc\xEA fica envenenado por 10 segundos.\n",
  dash: "\xA7dTipo: Habilidade Especial (Agachar + Pular)\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Empurra voc\xEA 10 blocos para a frente.\n- Causa 5 de dano aos mobs a at\xE9 3 blocos do ponto de partida.\n- Concede Invisibilidade e Resist\xEAncia por 10s.\n\n\xA77Recarga: 45s\xA7r\n",
  medkit: "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Aumenta os cora\xE7\xF5es extras para +10 no total enquanto usa peitoral e tem a Constitui\xE7\xE3o do Andarilho desbloqueada.\n- Cura 5 cora\xE7\xF5es na hora a cada 5 minutos enquanto a Constitui\xE7\xE3o do Andarilho estiver desbloqueada.\n",
  safety: "\xA7dTipo: Habilidade Especial (Agachar + Pular)\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Concede Resist\xEAncia III, Resist\xEAncia ao Fogo e Absor\xE7\xE3o por 30 segundos.\n\n\xA77Recarga: 6 min\xA7r\n",
  speedboost: "\xA7dTipo: Habilidade Especial (Agachar + Pular)\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Concede Velocidade III, Super Pulo II e Resist\xEAncia II por 20 segundos.\n\n\xA77Recarga: 4 min\xA7r\n",
  hide: "\xA7dTipo: Habilidade Especial (Agachar + Pular)\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Concede Invisibilidade completa por 60 segundos (os mobs n\xE3o veem voc\xEA).\n\n\xA77Recarga: 5 min\xA7r\n",
  backup: "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- D\xE1 5 cenouras douradas, 10 p\xE3es e 30 pedregulhos a cada dia do Minecraft.\n- D\xE1 uma ma\xE7\xE3 dourada encantada a cada 5 dias.\n",
  effect: "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- D\xE1 um efeito ben\xE9fico aleat\xF3rio por 1 minuto, a cada 6 minutos.\n",
  vision: "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Concede Vis\xE3o Noturna permanente.\n",
  lock: "\xA7dTipo: Habilidade Especial (Agachar + Pular)\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Prende outros jogadores em obsidiana (exceto quem estiver a at\xE9 3 blocos de voc\xEA).\n- Aplica Lentid\xE3o III em todos a at\xE9 15 blocos.\n\n\xA77Recarga: 5 min\xA7r\n"
};
var warriorSkillDescriptions = {
  "sword": "\xA7dTipo: Habilidade Especial\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia uma nova Habilidade Especial na Loja de Almas.\n- Concede uma Espada de Ferro com Maldi\xE7\xE3o do Desaparecimento.\n\n\xA77Nota: depois de desbloquear aqui, compre e equipe esta habilidade na Loja de Almas. S\xF3 \xE9 poss\xEDvel ter uma habilidade especial ativa por vez.\xA7r",
  "healthmet": "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia uma vantagem passiva na Loja de Almas.\n- Concede Regenera\xE7\xE3o I cont\xEDnua enquanto usa QUALQUER capacete.\n\n\xA77Nota: depois de desbloquear aqui, compre esta vantagem passiva na Loja de Almas. Ela fica sempre ativa depois de comprada.\xA7r",
  "assasin": "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia uma vantagem passiva na Loja de Almas.\n- Concede Velocidade I cont\xEDnua.\n\n\xA77Nota: depois de desbloquear aqui, compre esta vantagem passiva na Loja de Almas. Ela fica sempre ativa depois de comprada.\xA7r",
  "heart": "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia uma vantagem passiva na Loja de Almas.\n- Concede Cora\xE7\xF5es Extras permanentes.\n\n\xA77Nota: depois de desbloquear aqui, compre esta vantagem passiva na Loja de Almas. Ela fica sempre ativa depois de comprada.\xA7r",
  "smash": "\xA7dTipo: Habilidade Especial\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia uma habilidade ativa na Loja de Almas.\n- Impacto no Ch\xE3o: agache e pule para empurrar todos os inimigos pr\xF3ximos (a at\xE9 5 blocos) por at\xE9 10 blocos, causando 10 de dano.\n- Concede Resist\xEAncia I e Absor\xE7\xE3o I por 30 segundos.\n- Recarga: 2 minutos.\n\n\xA77Nota: para usar, equipe a habilidade e fa\xE7a Agachar + Pular.\xA7r",
  "strength": "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia uma vantagem passiva na Loja de Almas.\n- Concede For\xE7a I cont\xEDnua.\n\n\xA77Nota: depois de desbloquear aqui, compre esta vantagem passiva na Loja de Almas. Ela fica sempre ativa depois de comprada.\xA7r",
  "armour": "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia uma vantagem passiva na Loja de Almas.\n- Concede Resist\xEAncia II e Super Pulo I quando voc\xEA usa armadura completa (Capacete, Peitoral, Cal\xE7as e Botas).\n\n\xA77Nota: depois de desbloquear aqui, compre esta vantagem passiva na Loja de Almas. Ela fica sempre ativa depois de comprada.\xA7r",
  "unbreakable_sword": "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia uma vantagem passiva na Loja de Almas.\n- Melhora a Habilidade Especial da Espada para dar uma Espada de Diamante Amaldi\xE7oada Inquebr\xE1vel em vez de Ferro.\n\n\xA77Nota: depois de desbloquear aqui, compre esta vantagem passiva na Loja de Almas. Ela fica sempre ativa depois de comprada.\xA7r",
  "groundsmash": "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia uma vantagem passiva na Loja de Almas.\n- Concede Resist\xEAncia I cont\xEDnua, deixando voc\xEA mais resistente em todas as lutas.\n\n\xA77Nota: depois de desbloquear aqui, compre esta vantagem passiva na Loja de Almas. Ela fica sempre ativa depois de comprada.\xA7r",
  "dual_sword": "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia uma vantagem passiva na Loja de Almas.\n- Dobra o dano ao atacar com os punhos ou qualquer espada (de Madeira a Netherite).\n\n\xA77Nota: depois de desbloquear aqui, compre esta vantagem passiva na Loja de Almas. Ela fica sempre ativa depois de comprada.\xA7r",
  "attack_strength": "\xA7dTipo: Habilidade Especial\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia uma habilidade ativa na Loja de Almas.\n- For\xE7a de Ataque: agache e pule para ganhar For\xE7a, Resist\xEAncia, Resist\xEAncia ao Fogo, Regenera\xE7\xE3o e Cora\xE7\xF5es Extras no m\xE1ximo por 10 segundos.\n- Todos os mobs hostis a at\xE9 10 blocos recebem 20 de dano e Lentid\xE3o III por 10 segundos.\n- Recarga: 5 minutos.\n\n\xA77Nota: para usar, equipe a habilidade e fa\xE7a Agachar + Pular.\xA7r",
  "shield": "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia uma vantagem passiva na Loja de Almas.\n- Cura 5 cora\xE7\xF5es na hora a cada 30 segundos, mas S\xD3 com um Escudo na m\xE3o secund\xE1ria.\n\n\xA77Nota: depois de desbloquear aqui, compre esta vantagem passiva na Loja de Almas. Ela fica sempre ativa depois de comprada.\xA7r",
  "fire_slash": "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia uma vantagem passiva na Loja de Almas.\n- Queima passivamente todo inimigo que causar dano a voc\xEA (funciona em zumbis, creepers, jogadores etc.).\n\n\xA77Nota: depois de desbloquear aqui, compre esta vantagem passiva na Loja de Almas. Ela fica sempre ativa depois de comprada.\xA7r"
};
var mageSkillDescriptions = {
  magestaff: "\xA7dTipo: Item Base\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia o Cajado de Mago com 7 de dano f\xEDsico.\n\n\xA77Nota: nenhum feiti\xE7o ativo no in\xEDcio.\xA7r",
  fireball: "\xA7dTipo: Feiti\xE7o\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia o feiti\xE7o Bola de Fogo na Loja de Almas.\n- Dispara uma bola de fogo de at\xE9 10 blocos.\n- Causa 4 de dano e queima os inimigos por 6 segundos.\n\n\xA77Nota: equipe no Livro de Feiti\xE7os.\xA7r",
  frost: "\xA7dTipo: Feiti\xE7o\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia o feiti\xE7o Geada na Loja de Almas.\n- Causa 4 de dano a todos os mobs num raio de 10 blocos.\n- Aplica Lentid\xE3o IV e Fraqueza I.\n- Recarga: 2 segundos.\n\n\xA77Nota: equipe no Livro de Feiti\xE7os.\xA7r",
  manashield: "\xA7dTipo: Habilidade Especial\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia a habilidade Escudo de Mana na Loja de Almas.\n- Agachar + Pular: concede Prote\xE7\xE3o contra Fogo, Absor\xE7\xE3o, Resist\xEAncia III e Regenera\xE7\xE3o I por 20 segundos.\n- Recarga: 5 minutos.\xA7r",
  lightning: "\xA7dTipo: Feiti\xE7o\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia o feiti\xE7o Rel\xE2mpago na Loja de Almas.\n- Atinge com raios os mobs num raio de 10 blocos.\n- Recarga: 5 segundos.\n\n\xA77Nota: equipe no Livro de Feiti\xE7os.\xA7r",
  hypnosis: "\xA7dTipo: Habilidade Especial\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia a habilidade Hipnose na Loja de Almas.\n- Agachar + Pular: aplica N\xE1usea e Veneno em mobs/jogadores pr\xF3ximos por 20 segundos.\n- Recarga: 5 minutos.\xA7r",
  ice: "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia a passiva Gelo na Loja de Almas.\n- Melhora o feiti\xE7o Geada: dano de 4 para 12.\n- Alcance de 10 para 20 blocos.\n- A recarga da Geada passa a 5 segundos.\n\n\xA77Nota: ligue/desligue na Loja de Almas.\xA7r",
  magicslash: "\xA7dTipo: Habilidade Especial\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia a habilidade Corte M\xE1gico na Loja de Almas.\n- Agachar + Pular: causa 10 cora\xE7\xF5es (20 de dano) a todos os mobs/jogadores num raio de 15 blocos e os queima por 15 segundos.\n- Recarga: 5 minutos.\xA7r",
  mageshoot: "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia a passiva Disparo do Mago na Loja de Almas.\n- Melhora a Bola de Fogo: dano 10 e explos\xE3o flamejante.\n- Adiciona 2 segundos de recarga \xE0 Bola de Fogo.\n\n\xA77Nota: ligue/desligue na Loja de Almas.\xA7r",
  enchantment: "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia a passiva Encantamento na Loja de Almas.\n- Concede 1 livro encantado aleat\xF3rio a cada dia do Minecraft.\n\n\xA77Nota: ligue/desligue na Loja de Almas.\xA7r",
  effectmage: "\xA7dTipo: Habilidade Passiva\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia a passiva Mago dos Efeitos na Loja de Almas.\n- Concede um efeito ben\xE9fico aleat\xF3rio por 1 minuto a cada 6 minutos.\n\n\xA77Nota: ligue/desligue na Loja de Almas.\xA7r",
  petsmage: "\xA7dTipo: Habilidade Especial da Loja de Almas\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n\u2022 Desbloqueia a op\xE7\xE3o \xA7e'Invocar Guardi\xE3o!'\xA7r na Loja de Almas.\n\u2022 Invoca um leal \xA75Guardi\xE3o Warden\xA7r para proteger voc\xEA, com um ritual de 5 segundos.\n\u2022 O Warden age como um c\xE3o leal: segue voc\xEA, se teleporta at\xE9 voc\xEA e ataca mobs hostis ou inimigos que atacam voc\xEA ou que voc\xEA ataca.\n\u2022 \xA77Nunca ataca voc\xEA, nunca aplica Escurid\xE3o e nunca ataca mobs pac\xEDficos.\xA7r\n\u2022 Inclui um menu para \xA7eSentar / Levantar\xA7r.\n\u2022 Se morrer, pode ser invocado de novo depois de \xA7e5 dias do Minecraft\xA7r.\n",
  invisibility: "\xA7dTipo: Feiti\xE7o\xA7r\n\n\xA7eBenef\xEDcios:\xA7r\n- Desbloqueia o feiti\xE7o Invisibilidade na Loja de Almas.\n- Selecionado no Livro de Feiti\xE7os, voc\xEA fica invis\xEDvel enquanto ele estiver equipado. N\xE3o precisa clicar.\n\n\xA77Nota: equipe no Livro de Feiti\xE7os.\xA7r"
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
  if (classId === 2 /* Ranger */) return rangerSkillDescriptions[nodeId] || "\xA7cDescri\xE7\xE3o n\xE3o encontrada!\xA7r";
  if (classId === 3 /* Mage */) return mageSkillDescriptions[nodeId] || "\xA7cDescri\xE7\xE3o n\xE3o encontrada!\xA7r";
  if (classId === 4 /* Assassin */) return assassinSkillDescriptions[nodeId] || "\xA7cDescri\xE7\xE3o n\xE3o encontrada!\xA7r";
  if (classId === 5 /* Survivor */) return survivorSkillDescriptions[nodeId] || "\xA7cDescri\xE7\xE3o n\xE3o encontrada!\xA7r";
  if (classId === 1 /* Warrior */) return warriorSkillDescriptions[nodeId] || "\xA7cDescri\xE7\xE3o n\xE3o encontrada!\xA7r";
  return "\xA7eBenef\xEDcios:\xA7r\n- (Em breve...)\n";
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
  form.title(`Detalhes: ${displayName}`);
  let bodyText = `\xA7l${displayName}\xA7r

`;
  bodyText += `Estado: ${isUnlocked ? "\xA7aDesbloqueada\xA7r" : "\xA7cBloqueada\xA7r"}\n\n`;
  const description = getSkillDescription(classId, node);
  bodyText += description;
  form.body(bodyText);
  form.button("Voltar \xE0 lista", `textures/skill_icons/${node.id}${iconType}`);
  form.show(player).then((res) => {
    if (res.canceled) return;
    system4.run(() => spawnSkillListUI(player));
  }).catch(e => {});
}
function handleSkillUnlock(player, path, nextLvl) {
  const cost = getCost(path, nextLvl);
  const availablePoints = getSkillPoints(player);
  if (availablePoints < cost) {
    player.sendMessage(`\xA7cPontos de vantagem insuficientes! Precisa de \xA7e${cost} pts\xA7c, voc\xEA tem \xA7e${availablePoints} pts\xA7c.`);
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
    player.sendMessage(`\xA7a\u2726 N\xF3 de habilidade desbloqueado! \xA7e${nameList} \xA77j\xE1 est\xE1 na Loja de Almas! \xA77(\xA7c-${cost} pt${cost > 1 ? "s" : ""}\xA77)\xA7r`);
  } else {
    player.sendMessage(`\xA7aCaminho de habilidade avan\xE7ado! \xA77(-${cost} ponto${cost > 1 ? "s" : ""} de vantagem)`);
  }
  for (const item of unlockedItems) {
    if (classId === 3 /* Mage */ && item.tag.startsWith("spell_unlocked:")) {
      player.sendMessage(`\xA7d  \u2192 Feiti\xE7o: \xA7f${item.name} \xA7d\u2014 compre o Tomo Infinito no Livro de Feiti\xE7os!\xA7r`);
    } else if (item.isActiveAbility) {
      player.sendMessage(`\xA76  \u2192 Habilidade ativa: \xA7f${item.name} \xA77\u2014 equipe na Loja de Almas e depois \xA7eagache + pule\xA77 para ativar.\xA7r`);
    } else {
      player.sendMessage(`\xA7a  \u2192 Habilidade passiva: \xA7f${item.name} \xA77\u2014 compre na Loja de Almas para ativar sozinha.\xA7r`);
    }
  }
}
function closeSkillTreeUI(player) {
}

// src/systems/spellbook.ts
import { system as system5, world as world7 } from "@minecraft/server";
import { ActionFormData as ActionFormData4 } from "@minecraft/server-ui";
// [Addon Pack] Tomos Infinitos do Mago no RPG Guide. Cada compra de magia com almas abre a escolha de um dos tomos
// daquela magia: o tomo vai para o inventario (nao da para descartar; pode ir para um Grimorio no Atril Arcano) e
// a compra vale +1 vaga de tomo conhecido. A tela Escolher Tomos Infinitos troca quais tomos voce conhece dentro
// das vagas. O Grimorio so deixa infinito o tomo conhecido. Outras classes veem a Estante de Tomos (sem compra).
// <tomos.py>
var SPELL_TOME_OPTIONS = {"fireball": [{"tome": "fgr:infinite_tome_fire_blast", "name": "Rajada de Fogo II"}, {"tome": "fgr:infinite_tome_flame_burst", "name": "Explosão de Chamas II"}, {"tome": "fgr:infinite_tome_fire_protection", "name": "Proteção contra Fogo II"}], "frost": [{"tome": "fgr:infinite_tome_slowness", "name": "Lentidão II"}, {"tome": "fgr:infinite_tome_lethargy", "name": "Letargia II"}, {"tome": "fgr:infinite_tome_converging", "name": "Convergência II"}], "lightning": [{"tome": "fgr:infinite_tome_lightning_bolt", "name": "Raio III"}, {"tome": "fgr:infinite_tome_thunderstorm", "name": "Tempestade"}, {"tome": "fgr:infinite_tome_earthquake", "name": "Terremoto III"}], "invisibility": [{"tome": "fgr:infinite_tome_invisibility", "name": "Invisibilidade III"}, {"tome": "fgr:infinite_tome_displacement", "name": "Deslocamento III"}, {"tome": "fgr:infinite_tome_acceleration", "name": "Aceleração III"}]};
// </tomos.py>
var SPELL_TOMES = Object.fromEntries(Object.entries(SPELL_TOME_OPTIONS).map(([k, v]) => [k, v[0].tome]));
var TOME_BOUGHT = "tome_bought:"; // versao anterior: magia comprada uma vez
var TOME_BUYS = "rpg:tome_buys";   // {magia: compras}
var KNOWN_TOMES = "rpg:known_tomes";
var SPELL_OF_TOME = {};
for (const [k, v] of Object.entries(SPELL_TOME_OPTIONS)) for (const o of v) SPELL_OF_TOME[o.tome] = k;
function readKnown(player) {
  try { const a = JSON.parse(player.getDynamicProperty(KNOWN_TOMES) ?? "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}
function writeKnown(player, list) {
  player.setDynamicProperty(KNOWN_TOMES, JSON.stringify([...new Set(list)]));
  syncKnown(player);
}
// O Grimorio (outro pack) so deixa infinito o tomo que o RPG marca como conhecido.
function syncKnown(player) {
  try { player.runCommandAsync(`scriptevent fgr:tomos_conhecidos ${readKnown(player).join(",") || "-"}`); } catch (e) {}
}
function readBuys(player) {
  try { return JSON.parse(player.getDynamicProperty(TOME_BUYS) ?? "{}") || {}; } catch (e) { return {}; }
}
function writeBuys(player, b) {
  player.setDynamicProperty(TOME_BUYS, JSON.stringify(b));
}
function tomeLimit(player) {
  return Object.values(readBuys(player)).reduce((a, n) => a + (n > 0 ? n : 0), 0);
}
function giveTomeCopy(player, tome) {
  const it = new ItemStack4(tome, 1);
  try { it.keepOnDeath = true; } catch (e) {}
  const left = player.getComponent("minecraft:inventory")?.container?.addItem(it);
  if (left) player.dimension.spawnItem(left, player.location);
}
function learnTome(player, tome, give = true) {
  const known = readKnown(player);
  if (known.includes(tome) || known.length >= tomeLimit(player)) return false;
  known.push(tome);
  writeKnown(player, known);
  if (give) giveTomeCopy(player, tome);
  return true;
}
function forgetTome(player, tome) {
  writeKnown(player, readKnown(player).filter((t) => t !== tome));
  for (let sl = findCarriedTome(player, tome); sl; sl = findCarriedTome(player, tome)) sl.set(undefined);
}
function forgetAllTomes(player) {
  for (const t of readKnown(player)) forgetTome(player, t);
}
// Compras de versoes anteriores (magia do sistema antigo, tag tome_bought, tomo no inventario ou na estante) passam
// a valer como 1 compra da magia, e os tomos ja levados viram conhecidos.
function convertOwnedSpells(player) {
  const buys = readBuys(player);
  const fresh = [];
  for (const spellId of Object.keys(SPELL_TOMES)) {
    if (player.hasTag(`spell_unlocked:${spellId}`)) {
      player.removeTag(`spell_unlocked:${spellId}`);
      player.removeTag(`active_spell:${spellId}`);
      buys[spellId] = Math.max(buys[spellId] ?? 0, 1);
      fresh.push(SPELL_TOMES[spellId]);
    }
    if (player.hasTag(TOME_BOUGHT + spellId)) {
      player.removeTag(TOME_BOUGHT + spellId);
      buys[spellId] = Math.max(buys[spellId] ?? 0, 1);
    }
  }
  const shelf = readShelf(player);
  const held = carriedTomeIds(player);
  for (const [tome, spellId] of Object.entries(SPELL_OF_TOME)) {
    if (shelf[tome] > 0 || held.includes(tome)) buys[spellId] = Math.max(buys[spellId] ?? 0, 1);
  }
  writeBuys(player, buys);
  for (const tome of held) if (SPELL_OF_TOME[tome]) learnTome(player, tome, false);
  for (const tome of Object.keys(shelf)) {
    if (!SPELL_OF_TOME[tome] || !learnTome(player, tome)) continue;
    shelf[tome] -= 1;
  }
  writeShelf(player, shelf);
  for (const tome of fresh) {
    if (learnTome(player, tome)) player.sendMessage(`\xA7d[RPG Guide] \xA7aSeu feiti\xE7o virou o \xA76Tomo Infinito\xA7a ${tomeLabel(tome)}, entregue no invent\xE1rio.`);
  }
}
world7.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  if (initialSpawn) system5.runTimeout(() => { try { convertOwnedSpells(player); syncKnown(player); } catch (e) {} }, 60);
});
var MAX_BUYS = 3; // uma compra por tomo da magia
function showSpellbookUI(player, mage = true) {
  try { if (mage) convertOwnedSpells(player); } catch (e) {}
  const shelf = readShelf(player);
  const known = mage ? readKnown(player) : [];
  const limit = mage ? tomeLimit(player) : 0;
  const buys = readBuys(player);
  const rows = [];
  const listed = new Set(known);
  if (mage && limit > 0) rows.push({ text: `\xA7d\xA7lEscolher Tomos Infinitos\xA7r \xA78(${known.length}/${limit})\n\xA77Marcar v\xE1rios de uma vez`, menu: true, act: () => showChooseTomesUI(player) });
  for (const tome of known) {
    const carried = findCarriedTome(player, tome);
    rows.push({ text: `${carried ? "\xA7a[No invent\xE1rio]" : "\xA7e[Fora do invent\xE1rio]"} \xA75${tomeLabel(tome)}\n\xA77Toque para trocar${carried ? "" : " ou receber de novo"}`, menu: true, act: () => showSwapTome(player, tome) });
  }
  for (let i = known.length; i < limit; i++) rows.push({ text: `\xA7b[Vaga livre]\n\xA77Toque para escolher um tomo`, menu: true, act: () => showSwapTome(player, null) });
  if (mage) {
    for (const spell of MageShopItems.filter((item) => item.tag.startsWith("spell_unlocked:"))) {
      const spellId = spell.tag.split(":")[1];
      if (!SPELL_TOMES[spellId]) continue;
      const n = buys[spellId] ?? 0;
      if (n >= MAX_BUYS) continue;
      if (player.hasTag(spell.requiresTag)) {
        rows.push({ text: `\xA7e[Comprar] \xA7r${spell.name} \xA7a(+1 tomo) \xA78${n}/${MAX_BUYS}\n\xA77Custo: ${spell.costSouls} Almas`, menu: true, act: () => showTomeChoice(player, spell, spellId) });
      } else {
        rows.push({ text: `\xA7c[Bloqueado] \xA7r${spell.name}`, act: () => player.sendMessage("\xA7c[RPG Guide] Desbloqueie este feiti\xE7o na \xC1rvore de Habilidades primeiro!") });
      }
    }
  }
  // Outros tomos (achados, trocados ou de outras classes): guardados na estante ou levados pelo jogador.
  for (const id of Object.keys(shelf)) {
    if (listed.has(id)) continue;
    listed.add(id);
    rows.push({ text: `\xA7a[Guardado] \xA75${tomeLabel(id)}${shelf[id] > 1 ? ` \xA77x${shelf[id]}` : ""}\n\xA77Toque para pegar`, act: () => takeTome(player, id) });
  }
  for (const id of carriedTomeIds(player)) {
    if (listed.has(id)) continue;
    listed.add(id);
    rows.push({ text: `\xA7e[No invent\xE1rio] \xA75${tomeLabel(id)}\n\xA77Toque para guardar`, act: () => storeTome(player, id) });
  }
  rows.push({ text: "Voltar", back: true, act: () => {
    const classObj = world7.scoreboard.getObjective("class");
    showPlayerMenuUI(player, classObj ? getPlayerScoreSafe(classObj, player, 0) : 0);
  } });
  const body = mage
    ? `Tomos conhecidos: \xA7e${known.length}/${limit}\xA7r. Cada compra de magia com almas d\xE1 +1 vaga e um tomo \xE0 sua escolha; toque num tomo para troc\xE1-lo quando quiser.\n\nO tomo fica no invent\xE1rio (n\xE3o d\xE1 para descartar). Ponha num Grim\xF3rio no Atril Arcano para a troca r\xE1pida, ou na m\xE3o secund\xE1ria com uma varinha: o feiti\xE7o nunca acaba.`
    : "Tomos Infinitos guardados. S\xF3 o Mago conhece tomos; os daqui s\xE3o de vers\xF5es anteriores.";
  const form = new ActionFormData4().title(mage ? "\xA7dTomos Infinitos do Mago" : "\xA75Estante de Tomos").body(body);
  for (const r of rows) form.button(r.text);
  system5.run(() => {
    form.show(player).then((res) => {
      if (res.canceled) return;
      const r = rows[res.selection];
      if (!r) return;
      r.act();
      if (!r.back && !r.menu) system5.runTimeout(() => { try { showSpellbookUI(player, mage); } catch (e) {} }, 2);
    }).catch(e => {});
  });
}
// Troca: escolhe outro tomo das magias compradas no lugar de um conhecido (ou ocupa uma vaga livre). Pode trocar
// quantas vezes quiser; o tomo antigo some do invent\xE1rio e o novo \xE9 entregue.
function swapOptions(player) {
  const known = readKnown(player);
  const buys = readBuys(player);
  const out = [];
  for (const [spellId, list] of Object.entries(SPELL_TOME_OPTIONS)) {
    if (!(buys[spellId] > 0)) continue;
    const spell = MageShopItems.find((i) => i.tag === `spell_unlocked:${spellId}`);
    for (const o of list) if (!known.includes(o.tome)) out.push({ ...o, spell: spell?.name ?? spellId });
  }
  return out;
}
function showSwapTome(player, oldTome) {
  const options = swapOptions(player);
  const carried = oldTome ? findCarriedTome(player, oldTome) : true;
  const form = new ActionFormData4().title(oldTome ? `\xA7dTrocar \xA75${tomeLabel(oldTome)}` : "\xA7dEscolher Tomo Infinito");
  form.body(options.length
    ? (oldTome ? "Escolha o tomo que vai ficar no lugar deste. Voc\xEA pode trocar de novo quando quiser." : "Escolha o tomo para esta vaga. Voc\xEA pode trocar depois.")
    : "N\xE3o h\xE1 outro tomo dispon\xEDvel: compre outra magia com almas para liberar mais op\xE7\xF5es.");
  const acts = [];
  for (const o of options) {
    form.button(`\xA75${o.name} \xA78(${o.spell})`);
    acts.push(() => {
      if (readKnown(player).includes(o.tome)) return;
      if (oldTome) forgetTome(player, oldTome);
      else if (readKnown(player).length >= tomeLimit(player)) { player.sendMessage("\xA7c[RPG Guide] Sem vagas livres."); return; }
      learnTome(player, o.tome);
      player.sendMessage(oldTome
        ? `\xA7a[RPG Guide] Tomo trocado: \xA75${tomeLabel(oldTome)}\xA7a \u2192 \xA75${o.name}`
        : `\xA7a[RPG Guide] Tomo escolhido: \xA75${o.name}`);
    });
  }
  if (oldTome && !carried) {
    form.button("\xA7eReceber de novo\n\xA77S\xF3 se perdeu (n\xE3o est\xE1 num Grim\xF3rio)");
    acts.push(() => { giveTomeCopy(player, oldTome); player.sendMessage(`\xA7a[RPG Guide] Tomo entregue: \xA75${tomeLabel(oldTome)}`); });
  }
  form.button(oldTome ? "Manter" : "Voltar");
  acts.push(() => {});
  system5.run(() => {
    form.show(player).then((res) => {
      if (res.canceled) return;
      acts[res.selection]?.();
      system5.runTimeout(() => { try { showSpellbookUI(player); } catch (e) {} }, 2);
    }).catch(e => {});
  });
}
// Compra: o Mago escolhe qual tomo da magia leva (so os que ainda nao conhece).
function showTomeChoice(player, spell, spellId) {
  const known = readKnown(player);
  const options = (SPELL_TOME_OPTIONS[spellId] ?? []).filter((o) => !known.includes(o.tome));
  if (!options.length) { player.sendMessage("\xA7e[RPG Guide] Voc\xEA j\xE1 conhece todos os tomos desta magia."); return; }
  const form = new ActionFormData4().title(`\xA7d${spell.name}`);
  form.body(`Escolha o Tomo Infinito que voc\xEA quer (${spell.costSouls} Almas, +1 vaga):`);
  for (const o of options) form.button(`\xA75${o.name}`);
  form.button("Voltar");
  system5.run(() => {
    form.show(player).then((res) => {
      if (res.canceled) return;
      const choice = options[res.selection];
      if (!choice) { showSpellbookUI(player); return; }
      if (!player.hasTag(spell.requiresTag)) {
        player.sendMessage("\xA7c[RPG Guide] Desbloqueie este feiti\xE7o na \xC1rvore de Habilidades primeiro!");
        return;
      }
      const objective = world7.scoreboard.getObjective("souls");
      if (!objective) return;
      const currentSouls = objective.getScore(player) || 0;
      if (currentSouls < spell.costSouls) {
        player.sendMessage(`\xA7c[RPG Guide] Almas insuficientes! Voc\xEA precisa de ${spell.costSouls} Almas.`);
        return;
      }
      const buys = readBuys(player);
      if ((buys[spellId] ?? 0) >= MAX_BUYS) return;
      objective.setScore(player, currentSouls - spell.costSouls);
      buys[spellId] = (buys[spellId] ?? 0) + 1;
      writeBuys(player, buys);
      learnTome(player, choice.tome);
      player.sendMessage(`\xA7a[RPG Guide] Tomo Infinito comprado: \xA75${choice.name}\xA7a (+1 vaga, ${readKnown(player).length}/${tomeLimit(player)}).`);
      system5.runTimeout(() => { try { showSpellbookUI(player); } catch (e) {} }, 2);
    }).catch(e => {});
  });
}
// Tela de escolha: um marcador por tomo das magias compradas; ficam marcados os conhecidos. Ao confirmar, os
// marcados viram os conhecidos (ate o limite de vagas): os novos vao para o inventario e os desmarcados somem do
// inventario (os que estiverem num Grimorio deixam de ser infinitos).
function showChooseTomesUI(player) {
  const limit = tomeLimit(player);
  const known = readKnown(player);
  const buys = readBuys(player);
  const opts = [];
  for (const [spellId, list] of Object.entries(SPELL_TOME_OPTIONS)) {
    if (!(buys[spellId] > 0)) continue;
    const spell = MageShopItems.find((i) => i.tag === `spell_unlocked:${spellId}`);
    for (const o of list) opts.push({ ...o, spell: spell?.name ?? spellId });
  }
  const form = new __MFD().title(`\xA7dEscolher Tomos Infinitos \xA78(${limit} vaga${limit > 1 ? "s" : ""})`);
  form.label?.(`Vagas: \xA7e${limit}\xA7r (1 por compra de magia). Marque os tomos que voc\xEA quer conhecer.`);
  for (const o of opts) form.toggle(`\xA75${o.name} \xA78(${o.spell})`, known.includes(o.tome));
  form.submitButton?.("Confirmar");
  system5.run(() => {
    form.show(player).then((res) => {
      if (res.canceled || !res.formValues) { showSpellbookUI(player); return; }
      const vals = res.formValues.filter((v) => typeof v === "boolean");
      const chosen = opts.filter((o, i) => vals[i]).map((o) => o.tome);
      if (chosen.length > limit) {
        player.sendMessage(`\xA7c[RPG Guide] Voc\xEA marcou ${chosen.length} tomos, mas s\xF3 tem ${limit} vaga(s). Compre outra magia com almas para ganhar mais.`);
        system5.runTimeout(() => { try { showChooseTomesUI(player); } catch (e) {} }, 2);
        return;
      }
      for (const t of known) if (!chosen.includes(t)) forgetTome(player, t);
      for (const t of chosen) learnTome(player, t);
      player.sendMessage(`\xA7a[RPG Guide] Tomos conhecidos: \xA7e${chosen.length}/${limit}`);
      system5.runTimeout(() => { try { showSpellbookUI(player); } catch (e) {} }, 2);
    }).catch(e => {});
  });
}

// src/systems/classes.ts
var ClassNames = {
  0: "Sem classe",
  1: "Guerreiro",
  2: "Patrulheiro",
  3: "Mago",
  4: "Assassino",
  5: "Sobrevivente"
};
var ClassDescriptions = {
  1: "\xA7lGuerreiro\xA7r\n\n\xA7aVantagens:\xA7r Um tanque poderoso de curto alcance e lutador de espada que nunca aceita a derrota. Tem mais vida e resist\xEAncia, for\xE7a desbloqueada ao subir de n\xEDvel e armadura poderosa a cada n\xEDvel.",
  2: "\xA7lPatrulheiro\xA7r\n\n\xA7aVantagens:\xA7r Muita velocidade e dano \xE0 dist\xE2ncia.",
  3: "\xA7lMago\xA7r\n\n\xA7aVantagens:\xA7r Utilidade m\xE1gica e dano em \xE1rea.",
  4: "\xA7lAssassino\xA7r\n\n\xA7aVantagens:\xA7r Dano explosivo alto e mobilidade.",
  5: "\xA7lSobrevivente\xA7r\n\n\xA7aVantagens:\xA7r Atributos equilibrados, bom para iniciantes."
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
          player.sendMessage("\xA7c[RPG] O placar de classe n\xE3o existe.");
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
          player.sendMessage("\xA7c[RPG] O menu n\xE3o abriu. Use o livro de novo.");
        } catch (ignored) { console.warn("Caught error:", ignored, ignored?.stack); }
      }
    });
});
function showClassSelectionUI(player) {
  const form = new ActionFormData5().title("Escolha sua classe").body("Escolha seu destino com cuidado. Depois, s\xF3 d\xE1 para trocar nas Configura\xE7\xF5es.").button("Guerreiro").button("Patrulheiro").button("Mago").button("Assassino").button("Sobrevivente");
  form.show(player).then((response) => {
    if (response.canceled) return;
    const selection = (response.selection ?? 0) + 1;
    showClassDetailsUI(player, selection);
  }).catch(e => {});
}
function showClassDetailsUI(player, classId) {
  const desc = ClassDescriptions[classId] || "Classe desconhecida";
  const className = ClassNames[classId] || "Desconhecido";
  const form = new ActionFormData5().title(`Detalhes da classe: ${className}`).body(desc + "\n\n\xA7eTem certeza de que quer esta classe?").button("\xA72Escolher " + className).button("\xA7cVoltar ao menu");
  form.show(player).then((response) => {
    if (response.canceled) return;
    if (response.selection === 0) {
      setClass(player, classId);
      player.sendMessage("\xA7a[Sistema] O Livro de Feiti\xE7os e a \xC1rvore de Habilidades ficam no RPG Guide!");
    } else if (response.selection === 1) {
      showClassSelectionUI(player);
    }
  }).catch(e => {});
}
function setClass(player, classId) {
  const classObj = world8.scoreboard.getObjective("class");
  if (!classObj) return;
  classObj.setScore(player, classId);
  player.sendMessage("\xA7aAgora voc\xEA \xE9 um \xA7e" + ClassNames[classId] + "\xA7a!");
  player.playSound("random.levelup");
  if (classId === 3 /* Mage */ && !player.hasTag("initial_mage_souls")) {
    const soulsObj = world8.scoreboard.getObjective("souls");
    if (soulsObj) {
      const currentSouls = soulsObj.getScore(player) ?? 0;
      soulsObj.setScore(player, currentSouls + 70);
      player.addTag("initial_mage_souls");
      player.sendMessage("\xA7b[B\xF4nus] Voc\xEA recebeu 70 Almas de b\xF4nus inicial por escolher Mago!");
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
  let bodyText = `\xA7bClasse: \xA7e${ClassNames[classId]}\n`;
  bodyText += `\xA7bN\xEDvel de RPG: \xA7e${currentLevel}\n`;
  bodyText += `\xA7bAlmas: \xA7c${currentSouls}\n\n`;
  bodyText += `\xA7lRequisitos para o N\xEDvel ${currentLevel + 1}:\xA7r\n`;
  bodyText += `N\xEDveis de XP: ${player.level} / ${req.xpLevel}\n`;
  bodyText += `Almas: ${currentSouls} / ${req.souls}\n\n`;
  if (canLevelUp) {
    bodyText += "\xA7aVoc\xEA pode subir de n\xEDvel!";
  } else {
    bodyText += "\xA7cVoc\xEA precisa de mais n\xEDveis de XP ou Almas.";
  }
  const form = new ActionFormData5().title("Menu do Jogador").body(bodyText);
  const buttons = [];
  if (canLevelUp) {
    buttons.push({ text: "\xA7aSubir de n\xEDvel!", action: () => {
      player.addLevels(-req.xpLevel);
      soulsObj.setScore(player, currentSouls - req.souls);
      levelUp(player, currentLevel + 1, classId);
    } });
  } else {
    buttons.push({ text: "\xA78[N\xE3o est\xE1 pronto]", action: () => {
    } });
  }
  buttons.push({ text: "\xA7cLoja de Almas", action: () => showSoulShopUI(player) });
  if (classId !== 0 /* Unselected */) {
    buttons.push({ text: "\xA76\xC1rvore de Habilidades", action: () => spawnSkillTreeUI(player) });
  } else {
    buttons.push({ text: "\xA76\xC1rvore de Habilidades", action: () => {
      player.sendMessage("\xA7eEscolha uma classe primeiro!\xA7r");
    } });
  }
  if (currentLevel >= 19) {
    buttons.push({ text: "\xA74\u2620 Enfrentar o Chefe \u2620", action: () => showBossWarningUI(player) });
  }
  if (classId === 3 /* Mage */) {
    buttons.push({ text: "\xA75Livro de Feiti\xE7os do Mago", action: () => showSpellbookUI(player) });
  } else {
    buttons.push({ text: "\xA75Estante de Tomos", action: () => showSpellbookUI(player, false) });
  }
  buttons.push({ text: "\xA78Configura\xE7\xF5es", action: () => showSettingsUI(player) });
  buttons.push({ text: "Fechar", action: () => {
  } });
  for (const b of buttons) {
    form.button(b.text);
  }
  form.show(player).then((response) => {
    if (response.canceled) return;
    buttons[response.selection].action();
  }).catch(e => {});
}
// [Addon Pack] Inventario de tomos do Livro de Feiticos / Estante de Tomos. Tomos conhecidos do Mago ficam no livro
// (lista rpg:known_tomes); os demais ficam contados na estante (rpg:tome_shelf). Guarda so os do proprio jogador:
// o Grimorio (Forsaken Grimoires) escreve o dono na descricao do tomo ("Dono: nome") e devolve ao dono os tomos
// que outros jogadores pegarem.
var TOME_SHELF = "rpg:tome_shelf";
var isInfiniteTome = (it) => !!it && it.typeId.startsWith("fgr:infinite_tome_");
function readShelf(player) {
  try { return JSON.parse(player.getDynamicProperty(TOME_SHELF) ?? "{}") || {}; } catch (e) { return {}; }
}
function writeShelf(player, shelf) {
  for (const k of Object.keys(shelf)) if (!(shelf[k] > 0)) delete shelf[k];
  player.setDynamicProperty(TOME_SHELF, JSON.stringify(shelf));
}
function tomeLabel(id) {
  for (const list of Object.values(SPELL_TOME_OPTIONS)) for (const o of list) if (o.tome === id) return o.name;
  return id.replace("fgr:infinite_tome_", "").replace(/_/g, " ");
}
function tomeOwnedByOther(player, it) {
  try {
    const mark = "\xA77Dono: \xA7f";
    const line = it.getLore().find((l) => l.startsWith(mark));
    return !!line && line.slice(mark.length) !== player.name;
  } catch (e) { return false; }
}
var ownTome = (player, it) => isInfiniteTome(it) && !tomeOwnedByOther(player, it);
// Lugares onde o jogador leva um tomo: mao secundaria primeiro, depois o inventario.
function tomeSlots(player) {
  const out = [];
  const eq = player.getComponent("minecraft:equippable");
  if (eq) out.push({ get: () => eq.getEquipment("Offhand"), set: (it) => eq.setEquipment("Offhand", it) });
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (inv) for (let i = 0; i < inv.size; i++) out.push({ get: () => inv.getItem(i), set: (it) => inv.setItem(i, it) });
  return out;
}
function findCarriedTome(player, id) {
  return tomeSlots(player).find((sl) => { const it = sl.get(); return ownTome(player, it) && it.typeId === id; });
}
function carriedTomeIds(player) {
  const ids = [];
  for (const sl of tomeSlots(player)) { const it = sl.get(); if (ownTome(player, it) && !ids.includes(it.typeId)) ids.push(it.typeId); }
  return ids;
}
function storeTome(player, id, quiet = false) {
  const sl = findCarriedTome(player, id);
  if (!sl) return false;
  if (readKnown(player).includes(id)) {
    // conhecido: o livro ja tem o tomo, as copias levadas so voltam
    for (let c = sl; c; c = findCarriedTome(player, id)) c.set(undefined);
  } else {
    const it = sl.get();
    if (it.amount > 1) { it.amount -= 1; sl.set(it); } else sl.set(undefined);
    const shelf = readShelf(player);
    shelf[id] = (shelf[id] ?? 0) + 1;
    writeShelf(player, shelf);
  }
  if (!quiet) player.sendMessage(`\xA7a[Livro] Guardado: \xA75${tomeLabel(id)}`);
  return true;
}
function storeAllTomes(player) {
  let n = 0;
  for (const id of carriedTomeIds(player)) while (storeTome(player, id, true)) n++;
  return n;
}
// Poe um tomo na mao secundaria. Se ja houver outro tomo seu ali, ele volta para o livro; se a mao secundaria tiver
// outra coisa, o tomo vai para o inventario.
function takeTome(player, id) {
  const known = readKnown(player).includes(id);
  if (known && findCarriedTome(player, id)) return;
  if (!known) {
    const shelf = readShelf(player);
    if (!(shelf[id] > 0)) return;
    shelf[id] -= 1;
    writeShelf(player, shelf);
  }
  const eq = player.getComponent("minecraft:equippable");
  const off = eq?.getEquipment("Offhand");
  if (off && ownTome(player, off)) storeTome(player, off.typeId, true);
  const item = new ItemStack4(id, 1);
  if (eq && !eq.getEquipment("Offhand")) eq.setEquipment("Offhand", item);
  else {
    const left = player.getComponent("minecraft:inventory")?.container?.addItem(item);
    if (left) player.dimension.spawnItem(left, player.location);
  }
  player.sendMessage(`\xA7a[Livro] Na m\xE3o: \xA75${tomeLabel(id)}`);
}

function showSettingsUI(player) {
  const classObj = world8.scoreboard.getObjective("class");
  const currentClass = getPlayerScoreSafe(classObj, player, 0);

  const form = new ActionFormData5().title("Configura\xE7\xF5es").body("Escolha uma configura\xE7\xE3o:");
  form.button("Trava de itens");
  form.button("Destrui\xE7\xE3o de blocos");
  form.button("HUD");
  
  const showBowSummon = currentClass === 2 || (currentClass === 4 && player.hasTag("shop_assassin_bow"));
  if (showBowSummon) {
    form.button("Invocar arco");
  }
  
  form.button("Trocar de classe");
  form.button("Novo Come\xE7o");
  form.button("Voltar");
  form.show(player).then((response) => {
    if (response.canceled) return;
    
    let options = ["lock", "destroy", "hud"];
    if (showBowSummon) options.push("bow");
    options.push("change_class");
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
    } else if (action === "change_class") {
      showChangeClassUI(player);
    } else if (action === "new_beginning") {
      showNewBeginningUI(player);
    } else if (action === "back") {
       showPlayerMenuUI(player, currentClass);
    }
  }).catch(e => {});
}

function showNewBeginningUI(player) {
  const form = new ActionFormData5().title("Novo Come\xE7o")
    .body("Ao confirmar, todo o seu XP, pontos de habilidade, vantagens e almas v\xE3o a zero, todas as habilidades s\xE3o bloqueadas e voc\xEA escolhe a classe de novo.");
  
  form.button("Confirmar");
  form.button("Voltar");

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
      player.sendMessage("\xA7a[Sistema] Novo come\xE7o confirmado. Seus atributos foram zerados.");
    } else if (response.selection === 1) {
      showSettingsUI(player);
    }
  }).catch(e => {});
}

// [Addon Pack] Trocar de classe: devolve as almas e o XP gastos na loja e os pontos de habilidade (as trilhas saem,
// entao os pontos voltam sozinhos, porque sao calculados pelo nivel). O nivel continua o mesmo.
// Tambem pelo comando: /scriptevent rpg:trocar_classe
function changeClassRefund(player) {
  const classObj = world8.scoreboard.getObjective("class");
  const soulsObj = world8.scoreboard.getObjective("souls");
  if (!classObj || !soulsObj) return;
  const currentClass = getPlayerScoreSafe(classObj, player, 0);
  if (currentClass <= 0) {
    player.sendMessage("\xA7c[Sistema] Voc\xEA ainda n\xE3o escolheu uma classe.");
    return;
  }
  let souls = 0, xp = 0;
  const counted = new Set();
  for (const item of AllShopItems) {
    if (counted.has(item.tag) || !player.hasTag(item.tag)) continue;
    counted.add(item.tag);
    souls += item.costSouls || 0;
    xp += item.costXP || 0;
  }
  for (const tag of player.getTags()) {
    if (tag.startsWith("shop_") || tag.startsWith("active_ability_") || tag.startsWith("equipped_") || tag.startsWith("path_") || tag.startsWith("class_") || tag.startsWith("active_spell:") || tag.startsWith("spell_unlocked:") || tag.startsWith(TOME_BOUGHT)) {
      player.removeTag(tag);
    }
  }
  // magias compradas (cada compra deu um Tomo Infinito): as almas voltam e os tomos conhecidos somem
  const tomeBuys = readBuys(player);
  for (const item of MageShopItems) {
    if (item.tag.startsWith("spell_unlocked:")) souls += (tomeBuys[item.tag.split(":")[1]] ?? 0) * (item.costSouls || 0);
  }
  writeBuys(player, {});
  forgetAllTomes(player);
  // itens da classe antiga (cajado do Mago, arcos do Patrulheiro e do Assassino)
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (inv) {
    for (let i = 0; i < inv.size; i++) {
      const it = inv.getItem(i);
      if (!it) continue;
      const classItem = it.typeId === "rpg:mage_staff" || (it.typeId === "minecraft:bow" && (it.nameTag === "\xA76Ranger Bow" || it.nameTag === "\xA75Assassin's Deadly Bow"));
      if (classItem) inv.setItem(i, undefined);
    }
  }
  soulsObj.setScore(player, getPlayerScoreSafe(soulsObj, player, 0) + souls);
  if (xp > 0) player.addLevels(xp);
  classObj.setScore(player, 0);
  player.sendMessage(`\xA7a[Sistema] Classe liberada. Voc\xEA recebeu de volta \xA7e${souls} Almas\xA7a${xp > 0 ? ` e \xA7e${xp} n\xEDveis de XP\xA7a` : ""}, e todos os pontos de habilidade. Use o RPG Guide para escolher a nova classe.`);
  player.playSound("random.levelup");
}
function showChangeClassUI(player) {
  const form = new ActionFormData5().title("Trocar de classe")
    .body("Voc\xEA volta para a escolha de classe e recebe de volta todas as Almas e o XP gastos na Loja de Almas e todos os pontos de habilidade. O seu n\xEDvel continua o mesmo.\n\nOs Tomos Infinitos que voc\xEA j\xE1 comprou continuam com voc\xEA.");
  form.button("\xA7aConfirmar");
  form.button("Voltar");
  form.show(player).then((response) => {
    if (response.canceled) return;
    if (response.selection === 0) changeClassRefund(player);
    else showSettingsUI(player);
  }).catch(e => {});
}

function showBowSummonUI(player) {
  const form = new ActionFormData5().title("Invocar arco")
    .body("Se voc\xEA perdeu ou destruiu sem querer a arma da sua classe (Arco de Patrulheiro ou Arco Mortal do Assassino), pode invocar uma nova aqui.\n\nEla acompanha o seu n\xEDvel de RPG atual.");
  
  form.button("\xA7aInvocar arco");
  form.button("Voltar");

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

  const form = new ActionFormData5().title("Trava de itens")
    .body("Ligado, os itens importantes do RPG, como o RPG Guide e o Arco de Patrulheiro, ficam travados no invent\xE1rio para voc\xEA n\xE3o largar nem perder.");
  
  form.button(isLocked ? "\xA7cDesligar trava de itens" : "\xA7aLigar trava de itens");
  form.button("Voltar");

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
  const form = new ActionFormData5().title("Destrui\xE7\xE3o de blocos")
    .body("Ligado, as habilidades explosivas (como as melhorias da Bola de Fogo do Mago) quebram blocos e p\xF5em fogo. Desligue para explos\xF5es seguras.");
  
  form.button(isDestructive ? "\xA7cDesligar destrui\xE7\xE3o de blocos" : "\xA7aLigar destrui\xE7\xE3o de blocos");
  form.button("Voltar");

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
  const form = new ActionFormData5().title("HUD")
    .body("Desligado, o HUD do RPG (n\xEDvel, almas e b\xFAssola) some da sua tela.");
  
  form.button(isHidden ? "\xA7aMostrar HUD" : "\xA7cEsconder HUD");
  form.button("Voltar");

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
  { id: "fireball", name: "Bola de Fogo", color: "\xA7c" },
  { id: "frost", name: "Gelo", color: "\xA7b" },
  { id: "lightning", name: "Raio", color: "\xA7e" },
  { id: "invisibility", name: "Invisibilidade", color: "\xA77" }
];
function syncMageStaffName(player, level) {
  let activeSpellId = "none";
  let activeSpellName = "Sem feiti\xE7o";
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
          newItem.nameTag = `\xA7dCajado de Mago Nv.${level} \xA77[${activeSpellName}]`;
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
          item.nameTag = `\xA7dCajado de Mago Nv.${level} \xA77[${activeSpellName}]`;
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
              p.sendMessage("\xA7c[Guardi\xE3o Warden]\xA74 Seu Guardi\xE3o Warden caiu em batalha! Voc\xEA pode invocar outro em 5 dias do Minecraft.\xA7r");
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

      let stateName = "\xA78PARADO";
      if (isFlying) {
        if (variant === 1) stateName = "\xA7dVOANDO (ataque de raio)";
        else if (variant === 3) stateName = "\xA75CLONE (no ar)";
        else stateName = "\xA7dNO AR (pairando)";
      } else {
        if (variant === 0) stateName = "\xA7cMODO CORPO A CORPO (esmagar)";
        else if (variant === 1) stateName = "\xA7aMODO \xC0 DIST\xC2NCIA (tiros)";
        else if (variant === 2) stateName = "\xA77MODO PARADO";
        else if (variant === 3) stateName = "\xA75MODO CLONE";
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
        const name = isClone ? "Clone do Chefe" : "Chefe Saqueador";
        bossHpText = `\xA7l\xA75[${name}]\xA7r ${barStr} \xA7e${Math.floor(curHp)}/${maxHp}`;
      }

      const bossAiInfoText = `\xA7e[IA do Chefe] \xA7fDist: \xA7b${distStr}m \xA7f| Estado: ${stateName} \xA7f(Variante: ${variant})`;
      text = centerHudLines([compassText, bossHpText, bossAiInfoText]);
    } else {
      // Normal RPG HUD when not in boss combat
      let rpgStatsText = `\xA7l\xA76RPG\xA7r \xA78| \xA7bClasse: \xA7e${ClassNames[stats.classId]}\xA7r \xA78| \xA7aNv: \xA7e${stats.level}\xA7r \xA78| \xA7cAlmas: \xA7e${stats.souls}\xA7r \xA78| \xA7dVantagens: \xA7e${stats.perks}\xA7r`;
      if (stats.levelUpAvailable) {
        rpgStatsText += " \xA78| \xA7a\xA7l[SUBIR DE N\xCDVEL DISPON\xCDVEL]";
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
      sendCooldownMessageThrottled(player, key, `\xA7cHabilidade em recarga! (${(remaining / 20).toFixed(1)}s)`);
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
              player.sendMessage(`\xA7d[Encantamento] \xA7fVoc\xEA recebeu um livro encantado de ${randomEnchant}!`);
            }
          } catch (e) {
            player.sendMessage(`\xA7cN\xE3o foi poss\xEDvel gerar o encantamento: ${randomEnchant}`);
          }
        }
      }
      if (doEffects) {
        if (player.hasTag("shop_effectmage") && !player.hasTag("shop_effectmage_off")) {
          const randomEffect = MAGE_BLESSING_EFFECTS[Math.floor(Math.random() * MAGE_BLESSING_EFFECTS.length)];
          player.addEffect(randomEffect, 20 * 60, { amplifier: 0, showParticles: true });
          player.sendMessage(`\xA7d[Mago dos Efeitos] \xA7fVoc\xEA recebeu uma b\xEAn\xE7\xE3o aleat\xF3ria: ${randomEffect} por 1 minuto!`);
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
        player.sendMessage("\xA78[Assassino] \xA7fVoc\xEA some nas sombras! Protegido da maior parte do dano por 20s.");
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
            player.sendMessage("\xA7aOs suprimentos da Reserva do Aventureiro chegaram!");
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
          player.sendMessage("\xA7aO kit m\xE9dico curou voc\xEA!");
        }
      }
      if (doEffects && player.hasTag("shop_survivor_effect") && !player.hasTag("shop_survivor_effect_off")) {
        const buffs = ["minecraft:speed", "minecraft:jump_boost", "minecraft:haste", "minecraft:strength"];
        const buff = buffs[Math.floor(Math.random() * buffs.length)];
        player.addEffect(buff, 1200, { amplifier: 0, showParticles: true });
        player.sendMessage(`\xA7aEfeito aleat\xF3rio ativado: ${buff}!`);
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
          player.sendMessage("\xA7c\u2605 [Ataque Surpresa] \xA7f7 de dano b\xF4nus!");
          system8.runTimeout(() => {
            if ((COOLDOWNS.get(cooldownKey) ?? 0) !== readyTick || system8.currentTick < readyTick) return;
            const currentPlayer = world11.getEntity(p);
            if (currentPlayer?.isValid()) {
              currentPlayer.sendMessage("\xA7aSeu Ataque Surpresa est\xE1 pronto!");
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
          player.sendMessage("\xA7c\u2605 [Golpe Vamp\xEDrico] \xA7fCurou 5 cora\xE7\xF5es!");
          system8.runTimeout(() => {
            if ((COOLDOWNS.get(cooldownKey) ?? 0) !== readyTick || system8.currentTick < readyTick) return;
            const currentPlayer = world11.getEntity(p);
            if (currentPlayer?.isValid()) {
              currentPlayer.sendMessage("\xA7aSeu Golpe Vamp\xEDrico est\xE1 pronto!");
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
              currentPlayer.sendMessage("\xA7aSeu Golpe Mortal est\xE1 pronto!");
            }
            COOLDOWNS.delete(cdKey);
          }, 60 * 20 + 1);
          dealTrueDamage(target, 40, player);
          player.dimension.spawnParticle("minecraft:large_explosion", target.location);
          player.sendMessage("\xA7c[Golpe Mortal] \xA7fCombo! 40 de dano b\xF4nus!");
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
          source.sendMessage(`\xA7cSaraivada de Flechas em recarga! (${(remaining / 20).toFixed(1)}s)`);
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
          player.sendMessage(`\xA7cInvestida Sombria em recarga! (${(remaining / 20).toFixed(1)}s)`);
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
        sendCooldownMessageThrottled(player, cooldownKey, `\xA7cHabilidade da espada em recarga! (${(remaining / 20).toFixed(1)}s)`);
      }
    }
    if (player.hasTag("equipped_active_ability_groundsmash")) {
      const cooldownKey = player.id + "_groundsmash";
      const remaining = (COOLDOWNS.get(cooldownKey) ?? 0) - system8.currentTick;
      if (remaining <= 0) {
        castGroundSmash(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 120 * 20);
      } else {
        sendCooldownMessageThrottled(player, cooldownKey, `\xA7cEsmagar o Ch\xE3o em recarga! (${(remaining / 20).toFixed(1)}s)`);
      }
    }
    if (player.hasTag("equipped_active_ability_attack_strength")) {
      const cooldownKey = player.id + "_attack_strength";
      const remaining = (COOLDOWNS.get(cooldownKey) ?? 0) - system8.currentTick;
      if (remaining <= 0) {
        castAttackStrength(player);
        COOLDOWNS.set(cooldownKey, system8.currentTick + 300 * 20);
      } else {
        sendCooldownMessageThrottled(player, cooldownKey, `\xA7cFor\xE7a de Ataque em recarga! (${(remaining / 20).toFixed(1)}s)`);
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
  if (angle >= 337.5 || angle < 22.5) return "Norte";
  if (angle >= 22.5 && angle < 67.5) return "Nordeste";
  if (angle >= 67.5 && angle < 112.5) return "Leste";
  if (angle >= 112.5 && angle < 157.5) return "Sudeste";
  if (angle >= 157.5 && angle < 202.5) return "Sul";
  if (angle >= 202.5 && angle < 247.5) return "Sudoeste";
  if (angle >= 247.5 && angle < 292.5) return "Oeste";
  if (angle >= 292.5 && angle < 337.5) return "Noroeste";
  return "Norte";
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
  if (dim.includes("nether")) return "Fortaleza do Nether";
  if (dim.includes("the_end")) return "Cidade do End";
  return "Vila";
}
async function castMasterCartographer(player) {
  try {
    player.playSound("ui.cartography_table.take_result");
  } catch (_) {}
  let listStr = "\xA7a--- Mestre Cart\xF3grafo (Sobrevivente) ---\xA7r\n";
  const allPlayers = world11.getAllPlayers();
  let foundOther = false;
  for (const p of allPlayers) {
    if (p.id === player.id) continue;
    if (p.dimension.id !== player.dimension.id) continue;
    foundOther = true;
    listStr += `\xA7e${p.name}\xA7r: X: ${Math.floor(p.location.x)}, Y: ${Math.floor(p.location.y)}, Z: ${Math.floor(p.location.z)}\n`;
  }
  if (!foundOther) {
    listStr += "\xA77Nenhum outro jogador no mundo.\xA7r\n";
  }
  const structName = await getNearestStructureName(player);
  listStr += `\n\xA7bEstrutura mais pr\xF3xima\xA7r: \xA7e${structName}\xA7r`;
  player.sendMessage(listStr);
}
function castSenseHeading(player) {
  try {
    player.playSound("random.bow");
  } catch (_) {}
  let listStr = "\xA7a--- Senso de Dire\xE7\xE3o (Patrulheiro) ---\xA7r\n";
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
    listStr += "\xA77Nenhum outro jogador no mundo.\xA7r\n";
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
      player.sendMessage("\xA7cSeu invent\xE1rio est\xE1 cheio! A espada caiu no ch\xE3o.");
    }
  }
  if (player.hasTag("shop_unbreakable_sword")) {
    player.sendMessage("\xA7bVoc\xEA invocou uma Espada de Diamante amaldi\xE7oada e inquebr\xE1vel!");
  } else {
    player.sendMessage("\xA7bVoc\xEA invocou uma Espada de Ferro amaldi\xE7oada!");
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
  player.sendMessage("\xA7bVoc\xEA usou Esmagar o Ch\xE3o!");
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
  player.sendMessage("\xA7bVoc\xEA usou Golpe S\xEDsmico!");
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
  player.sendMessage("\xA7cVoc\xEA usou Esmagar o Ch\xE3o!");
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
  player.sendMessage("\xA78Voc\xEA usou Investida Sombria!");
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
  player.sendMessage("\xA7bVoc\xEA usou Investida!");
}
function castSurvivorSafety(player) {
  player.playSound("random.orb");
  player.addEffect("minecraft:resistance", 600, { amplifier: 2, showParticles: true });
  player.addEffect("minecraft:fire_resistance", 600, { amplifier: 0, showParticles: true });
  player.addEffect("minecraft:absorption", 600, { amplifier: 0, showParticles: true });
  player.sendMessage("\xA7aProtocolo de seguran\xE7a ativado por 30s!");
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
  player.sendMessage("\xA7aVoc\xEA usou Saraivada de Flechas!");
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
  player.sendMessage("\xA7a[Flecha R\xE1pida] \xA7f60 flechas disparadas! Mire para guiar a saraivada!");
}
function castRangerAim(player) {
  player.playSound("random.orb");
  player.addEffect("minecraft:night_vision", 1200, { amplifier: 0, showParticles: true });
  player.sendMessage("\xA7aMira ativada! Vis\xE3o Noturna por 1 minuto.");
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
  player.sendMessage("\xA7bVoc\xEA liberou For\xE7a de Ataque! B\xF4nus enormes aplicados e os hostis pr\xF3ximos sofreram dano.");
}
function castSurvivorHide(player) {
  player.playSound("mob.endermen.portal");
  player.dimension.spawnParticle("minecraft:egg_destroy_emitter", player.location);
  player.addEffect("minecraft:invisibility", 1200, { amplifier: 0, showParticles: true });
  player.sendMessage("\xA78Voc\xEA est\xE1 escondido! Os mobs v\xE3o ignorar voc\xEA por 60 segundos.");
}
function castSurvivorSpeedboost(player) {
  player.playSound("mob.enderdragon.flap");
  player.addEffect("minecraft:speed", 400, { amplifier: 2, showParticles: true });
  player.addEffect("minecraft:jump_boost", 400, { amplifier: 1, showParticles: true });
  player.addEffect("minecraft:resistance", 400, { amplifier: 1, showParticles: true });
  player.sendMessage("\xA7bImpulso de velocidade ativado por 20 segundos!");
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
  player.sendMessage("\xA77[Sobrevivente] Abrigo de emerg\xEAncia 6x6 criado com mesa de trabalho e fornalha!");
}
function castAssassinVanish(player) {
  player.playSound("random.fizz");
  player.addEffect("minecraft:invisibility", 900, { amplifier: 0, showParticles: true });
}
function castAssassinBlind(player) {
  player.sendMessage("\xA78[Assassino] Voc\xEA lan\xE7ou Cegueira nos inimigos pr\xF3ximos!");
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
  player.sendMessage("\xA78[Assassino] Voc\xEA entra nas sombras!");
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
  player.sendMessage("\xA7d[Mago] Voc\xEA ativou o Escudo de Mana!");
  player.addEffect("minecraft:fire_resistance", 20 * 20, { amplifier: 0 });
  player.addEffect("minecraft:absorption", 20 * 20, { amplifier: 0 });
  player.addEffect("minecraft:resistance", 20 * 20, { amplifier: 2 });
  player.addEffect("minecraft:regeneration", 20 * 20, { amplifier: 0 });
}
function castMageHypnosis(player) {
  player.sendMessage("\xA7d[Mago] Voc\xEA lan\xE7ou Hipnose!");
  const targets = player.dimension.getEntities({ location: player.location, maxDistance: 15 });
  for (const target of targets) {
    if (target.id !== player.id) {
      safeAddEffect(target, "minecraft:nausea", 20 * 20, { amplifier: 0 });
      safeAddEffect(target, "minecraft:poison", 20 * 20, { amplifier: 0 });
    }
  }
}
function castMageMagicslash(player) {
  player.sendMessage("\xA7d[Mago] Voc\xEA liberou o Corte M\xE1gico!");
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
  if (id === "rpg:trocar_classe" || id === "rpg:change_class") {
    system9.run(() => changeClassRefund(player));
    return;
  }
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
        player.sendMessage(`\xA7a[Sistema] ${changedCount} itens ${unlocking ? "destravados" : "travados"}!`);
      } else {
        player.sendMessage(`\xA7c[Sistema] Nenhum RPG Guide ou Arco de Patrulheiro no seu invent\xE1rio.`);
      }
    });
  } else if (id === "rpg:destroy_on" || id === "rpg:destroy_off") {
    const turnOn = id === "rpg:destroy_on";
    system9.run(() => {
      if (turnOn) {
        player.addTag("destroy_blocks");
        player.sendMessage(`\xA7a[Sistema] As explos\xF5es das habilidades agora quebram blocos e p\xF5em fogo para voc\xEA.`);
      } else {
        player.removeTag("destroy_blocks");
        player.sendMessage(`\xA7c[Sistema] As explos\xF5es das habilidades agora s\xE3o seguras e n\xE3o quebram blocos.`);
      }
    });
  } else if (id === "rpg:hud_off" || id === "rpg:hud_on") {
    const turnOn = id === "rpg:hud_on";
    system9.run(() => {
      if (turnOn) {
        player.removeTag("hide_rpg_hud");
        player.sendMessage(`\xA7a[Sistema] O HUD do RPG agora est\xE1 vis\xEDvel.`);
      } else {
        player.addTag("hide_rpg_hud");
        player.sendMessage(`\xA7c[Sistema] O HUD do RPG agora est\xE1 escondido.`);
      }
    });
  } else if (id === "rpg:reload") {
    system9.run(() => {
      player.runCommandAsync("reload");
      player.sendMessage("\xA7a[Sistema] Addon recarregado.");
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
          player.sendMessage(`\xA7c[Sistema] Voc\xEA precisa de 30 Almas para invocar o arco! Faltam ${30 - souls} Almas.`);
          return;
        }
        
        soulsObj.setScore(player, souls - 30);
        
        if (classId === 2) {
          giveRangerBow(player, level, true);
          player.sendMessage("\xA7a[Sistema] O Arco de Patrulheiro foi refeito! (-30 Almas)");
        } else if (classId === 4) {
          giveAssassinBow(player, true);
          player.sendMessage("\xA7a[Sistema] O Arco Mortal do Assassino foi refeito! (-30 Almas)");
        }
      } else {
        player.sendMessage("\xA7c[Sistema] Voc\xEA n\xE3o tem arma de classe que possa ser refeita.");
      }
    });
  }
});

// ==========================================
// PILLAGER BOSS FIGHT SYSTEM
// ==========================================
import "./systems/boss_pillager.js";

// ==========================================
// SWORD ON BACK SYSTEM (4 VERTICAL SLOTS)
// ==========================================
import { initBackSwordSystem } from "./systems/back_sword.js";
initBackSwordSystem();

