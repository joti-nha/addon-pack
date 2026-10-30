import * as mc from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { BlockPermutation, ItemStack } from "@minecraft/server";

// ─────────────────────────────────────────────
//  RACE DEFINITIONS
// ─────────────────────────────────────────────
const RACES = [
  {
    key: "human",
    label: "§fHuman",
    tag: "race_human",
    scale: 1.0,
    description: "Versatile and resilient. Villagers always cut you a deal.",
    effects: [
      { effect: "village_hero", duration: 999999, amplifier: 0, showParticles: false },
    ],
    abilityDescription: "Adaptable: Saturation + Resistance procs. Permanent 30% villager trade discount.",
  },
  {
    key: "elf",
    label: "§aElf",
    tag: "race_elf",
    scale: 1.05,
    description: "Ancient and perceptive. Swift of foot, with fey magic in their step.",
    effects: [
      { effect: "speed", duration: 999999, amplifier: 0, showParticles: false },
    ],
    abilityDescription: "Keen Mind: Speed I. +1 XP / 2 min. Cloudwake: jump again mid-air to leap upward, then drift down on fey clouds.",
  },
  {
    key: "dwarf",
    label: "§6Dwarf",
    tag: "race_dwarf",
    scale: 0.88,
    description: "Born of stone. Sees in the depths and strips veins whole.",
    effects: [
      { effect: "resistance", duration: 999999, amplifier: 1, showParticles: false },
    ],
    abilityDescription: "Stoneborn: 9 hearts. Resistance II. Underground Night Vision. Sneak-break ores to vein-mine (64).",
  },
  {
    key: "orc",
    label: "§2Orc",
    tag: "race_orc",
    scale: 1.10,
    description: "Brutal and relentless. Grows deadlier as wounds mount.",
    effects: [
      { effect: "strength", duration: 999999, amplifier: 0, showParticles: false },
    ],
    abilityDescription: "Bloodlust: Strength I; below 50% → Str II. War Cry: Jump, then crouch within 0.4s.",
  },
  {
    key: "halfling",
    label: "§eHalfling",
    tag: "race_halfling",
    scale: 0.82,
    description: "Small but nimble. Hard to pin down and quick to slip away.",
    effects: [
      { effect: "speed", duration: 999999, amplifier: 1, showParticles: false },
    ],
    abilityDescription: "Small Frame: 7 hearts. Speed II. Crouch+hit players to pickpocket (25s CD). Right-click to ride.",
  },
  {
    key: "undead",
    label: "§8Undead",
    tag: "race_undead",
    scale: 1.0,
    description: "Neither living nor dead. Feared by villagers and hunted by golems.",
    effects: [
      { effect: "saturation", duration: 999999, amplifier: 0, showParticles: false },
    ],
    abilityDescription: "Grave Bound: Undead ignore you until attacked. Hungerless. Undying (8m CD, heals to 3.5♥). Bind: drop Rotten Flesh near undead (3 max). Sneak + drop flesh on minion (or sneak-punch) to release. Hit foes to command.",
  },
  {
    key: "tiefling",
    label: "§4[Tiefling]",
    tag: "race_tiefling",
    scale: 1.0,
    description: "Infernal heritage. Fire cannot harm you; your hellfire hungers for souls.",
    effects: [
      { effect: "fire_resistance", duration: 999999, amplifier: 0, showParticles: false },
    ],
    abilityDescription: "Fire Res. Hellfire: Crouch+Jump/Hit → 5b fire wave (ignites mobs & players). Soul Feast: +2 hearts per kill.",
  },
  {
    key: "dragonborn",
    label: "§c[Dragonborn]",
    tag: "race_dragonborn",
    scale: 1.12,
    description: "Draconic lineage. Massive and tough, but heavy on their feet.",
    effects: [
      { effect: "strength", duration: 999999, amplifier: 0, showParticles: false },
      { effect: "resistance", duration: 999999, amplifier: 0, showParticles: false },
      { effect: "slowness", duration: 999999, amplifier: 0, showParticles: false },
    ],
    abilityDescription: "Breath Weapon: Crouch+Jump/Hit → fire cone (~8b, 20s CD).",
  },
  {
    key: "siren",
    label: "§3Siren",
    tag: "race_siren",
    scale: 1.02,
    description: "Born of the tides. Her voice bends wills and the sea obeys her call.",
    effects: [
      { effect: "water_breathing", duration: 999999, amplifier: 0, showParticles: false },
      { effect: "speed", duration: 999999, amplifier: 0, showParticles: false },
    ],
    abilityDescription: "Tideborn: Speed I + swift in water + lure hum. Dry on land (rain, water, or drink to refresh). Siren's Song: Crouch+Jump/Hit → 5s channel.",
  },
  {
    key: "werewolf",
    label: "§8[Werewolf]",
    tag: "race_werewolf",
    scale: 1.0,
    description: "Cursed blood. Human by day — the beast awakens only under the moon.",
    effects: [],
    abilityDescription: "Human by day. Night: Crouch+Jump → Beast Form. Beast: Crouch+Jump → Leap. Crouch+Hit → Lunge prey (players & mobs), drag 5s, then throw. Revert sickens you until 35s crouching on a bed.",
  },
  {
    key: "accursed",
    label: "§5Accursed",
    tag: "race_accursed",
    scale: 0.95,
    description: "A pathway race — weak at first, with unrealized potential.",
    effects: [],
    abilityDescription: "§88 hearts. Slightly shorter than Human. §8Abilities pending.",
  },
  {
    key: "beastfolk",
    label: "§6Beastfolk",
    isCategory: true,
    description: "Primal kin — beast blood runs in many forms.",
    abilityDescription: "Choose your beast kin — Leonin available now.",
  },
];

const VAMPIRE_RACE = {
  key: "vampire",
  label: "§4Vampire",
  tag: "race_vampire",
  scale: 1.0,
  description: "Damned immortal. The night empowers you; daylight withers your strength.",
  effects: [],
  abilityDescription: "Night: Sneak+Jump or Sneak+Use (empty hand) → Bat Form (fly, max 20 blocks up). Speed I + Night Vision. Direct sunlight: Weakness I + Hunger II; burn after 2 min exposed (3+ armor negates). Sneak+Hit: Blood drain. Diet: raw meat only.",
};

const EVOLUTION_RACES = [VAMPIRE_RACE];

// Beastfolk subraces — selected from a second menu after picking Beastfolk.
const BEASTFOLK_SUBRACES = [
  {
    key: "beastfolk_leonin",
    parentKey: "beastfolk",
    label: "§6Leonin",
    tag: "race_beastfolk_leonin",
    scale: 1.156,
    description: "Proud lion kin — fierce, swift, and dauntless before the hunt.",
    effects: [
      { effect: "strength", duration: 999999, amplifier: 0, showParticles: false },
      { effect: "speed", duration: 999999, amplifier: 0, showParticles: false },
    ],
    abilityDescription: "12 hearts. Str/Speed I. Claws: Str IV (empty hand). Mace/spear only. Roar rallies kin.",
  },
  {
    key: "beastfolk_catfolk",
    parentKey: "beastfolk",
    label: "§eCatfolk",
    tag: "race_beastfolk_catfolk",
    inDevelopment: true,
    scale: 1.0,
    description: "Feline kin with catlike grace and keen reflexes.",
    effects: [],
    abilityDescription: "§8Em Desenvolvimento",
  },
  {
    key: "beastfolk_ursa",
    parentKey: "beastfolk",
    label: "§6Ursa",
    tag: "race_beastfolk_ursa",
    inDevelopment: true,
    scale: 1.08,
    description: "Bear kin — broad-shouldered, tough, and hard to put down.",
    effects: [],
    abilityDescription: "§8Em Desenvolvimento",
  },
  {
    key: "beastfolk_foxkin",
    parentKey: "beastfolk",
    label: "§cFoxkin",
    tag: "race_beastfolk_foxkin",
    inDevelopment: true,
    scale: 0.95,
    description: "Fox kin — light on their feet and sharp of eye.",
    effects: [],
    abilityDescription: "§8Em Desenvolvimento",
  },
];

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
const COOLDOWNS          = new Map(); // playerId -> lastAbilityTimestamp
const UNDEAD_UNDYING_LOW_HP = 4; // 2 hearts — triggers Undying grasp
const UNDEAD_UNDYING_HEAL_TARGET = 7; // 3.5 hearts — regen/absorption stop here
const UNDEAD_UNDYING_CD_MS = 8 * 60 * 1000; // 8 minutes
const UNDEAD_UNDYING_GRASP = new Set(); // playerId -> healing back from the brink
const UNDEAD_UNDYING_COOLDOWNS = new Map(); // playerId -> ready timestamp (ms)
const jumpTracked        = new Map(); // playerId -> wasJumping
const sneakTracked       = new Map(); // playerId -> wasSneaking
const onGroundTracked    = new Map(); // playerId -> wasOnGround
const ELF_AIR_DASH_READY = new Map(); // playerId -> can use air dash until landing
const ELF_AIR_TICKS = new Map(); // playerId -> ticks spent airborne since last ground
const ELF_LEFT_VIA_JUMP = new Map(); // playerId -> left ground while holding jump
const ELF_CLOUDWAKE_ACTIVE = new Set(); // playerId -> drifting with slow fall until landing
const CLOUDWAKE_MIN_AIR_TICKS = 2; // must be airborne before second jump counts
const CLOUDWAKE_HOLD_FALL_TICKS = 6; // hold-jump: boost once falling past apex
const CLOUDWAKE_FORWARD = 0.9; // horizontal knockback strength
const CLOUDWAKE_VERTICAL = 0.62; // upward knockback strength
const CLOUDWAKE_PARTICLE_IDS = [
  "minecraft:cauldron_explosion_emitter",
  "minecraft:basic_smoke_particle",
];
const ORC_LOW_HP_TRIGGER = new Map(); // playerId -> bool (was below 50%)
const ORC_JUMP_ARMED     = new Map(); // playerId -> timestamp (ms) when jump armed war cry
const ORC_FEAR_COOLDOWNS = new Map(); // playerId -> last yell timestamp
const ORC_FEAR_COOLDOWN_MS = 30000;
const WEREWOLF_HOWL_COOLDOWNS = new Map();
const WEREWOLF_HOWL_CD_MS = 22000;
const WEREWOLF_HOWL_RADIUS = 10;
const WEREWOLF_LUNGE_CD_MS = 16000;
const WEREWOLF_LUNGE_RANGE = 10;
const WEREWOLF_LUNGE_GRAB_RANGE = 3.5;
const WEREWOLF_DRAG_MS = 5000;
const WEREWOLF_DRAG_DISTANCE = 2.6; // held beyond melee reach so prey can't swing back
const WEREWOLF_DRAG_SPRINT_BONUS = 1.1; // extra reach while sprinting to offset teleport lag
const WEREWOLF_LUNGE_COOLDOWNS = new Map();
const WEREWOLF_LEAP_CD_MS = 5000;
const WEREWOLF_LEAP_COOLDOWNS = new Map();
const WEREWOLF_LEAP_FORWARD = 2.0; // horizontal leap strength
const WEREWOLF_LEAP_VERTICAL = 0.7; // upward leap strength
/** @type {Map<string, { targetId: string, endMs: number }>} */
const WEREWOLF_DRAG = new Map();
/** @type {Map<string, string>} */
const WEREWOLF_DRAGGED_BY = new Map();
const WEREWOLF_BEAST_ACTIVE = new Set(); // playerId -> in beast form
const WEREWOLF_TRANSFORMING = new Set(); // playerId -> mid transform VFX
const WEREWOLF_GEAR_STASH = new Map(); // playerId -> { Head?, Chest?, Legs?, Feet? }
const WEREWOLF_STASH_SLOTS = ["Head", "Chest", "Legs", "Feet"];
const WEREWOLF_TRANSFORM_CD_MS = 30000;
const WEREWOLF_TRANSFORM_COOLDOWNS = new Map();
const WEREWOLF_TRANSFORM_TICKS = 14; // ~0.7s smoke cover before model swap
const WEREWOLF_REVERSION_SICK = new Set(); // playerId -> needs bed rest to recover
const WEREWOLF_FORCED_REVERSION = new Set(); // playerId -> dawn revert (extra nausea)
const WEREWOLF_BED_REST_SECONDS = new Map(); // playerId -> continuous seconds crouching on bed
const WEREWOLF_REST_REQUIRED_SECONDS = 35;
const ORC_FEAR_RADIUS = 10;
const ORC_FEAR_ARM_MS = 400; // crouch within 0.4s of jump
const LEONIN_LOW_HP_TRIGGER = new Map(); // playerId -> dauntless proc shown
const LEONIN_ROAR_JUMP_ARMED = new Map(); // playerId -> jump timestamp (ms)
const LEONIN_ROAR_COOLDOWNS = new Map(); // playerId -> last roar timestamp (ms)
const LEONIN_CLAW_CD = new Map(); // playerId -> next claw bonus allowed (ms)
const LEONIN_ROAR_CD_MS = 25000;
const LEONIN_ROAR_RADIUS = 9;
const LEONIN_ROAR_ARM_MS = 800;
const LEONIN_ROAR_BEASTFOLK_BUFF_TICKS = 600; // 30s Str I + Absorption for kin
const LEONIN_ROAR_MOB_FLING_BLOCKS = 4;
const LEONIN_ROAR_PLAYER_FLING_BLOCKS = 2;
const LEONIN_ROAR_FLING_LIFT = 0.35;
const undeadProvoked = new Map(); // "mobId:playerId" -> expiry timestamp (ms)
const undeadDisguiseState = new Map(); // playerId -> wearing carved pumpkin
const UNDEAD_PROVOKE_MS = 120000;
const GOLEM_PACIFY_RANGE = 24;

const UNDEAD_CALM_EVENTS = [
  "minecraft:on_calm",
  "minecraft:become_calm",
  "minecraft:stop_being_angry",
];

const VILLAGER_SCARE_EVENTS = [
  "minecraft:start_panicking",
  "minecraft:panic",
  "minecraft:become_panicked",
];

const GOLEM_CALM_EVENTS = [
  "minecraft:on_calm",
  "minecraft:become_calm",
  "minecraft:stop_being_angry",
];
const HALFLING_MAX_HEALTH = 14; // 7 hearts
const DWARF_MAX_HEALTH = 18; // 9 hearts
const LEONIN_MAX_HEALTH = 24; // 12 hearts
const ACCURSED_MAX_HEALTH = 16; // 8 hearts
const VAMPIRE_MAX_HEALTH = 20; // 10 hearts
const DEFAULT_PLAYER_MAX_HEALTH = 20; // 10 hearts
const HUD_PLAYER_MAX_HEALTH = 20; // Bedrock armor HUD expects a 10-heart row
const RACE_MAX_HEALTH_BY_KEY = {
  halfling: HALFLING_MAX_HEALTH,
  dwarf: DWARF_MAX_HEALTH,
  beastfolk_leonin: LEONIN_MAX_HEALTH,
  accursed: ACCURSED_MAX_HEALTH,
  vampire: VAMPIRE_MAX_HEALTH,
};
// Halfling/dwarf use the standard 20 HP component and are capped in script so the
// armor bar keeps all 10 icons. Leonin still needs a raised max for 12 hearts.
const RACE_HP_EVENT_BY_KEY = {
  beastfolk_leonin: "race:hp_set_leonin",
  accursed: "race:hp_set_accursed",
  vampire: "race:hp_set_vampire",
};
const RACE_HEALTH_TARGET = new Map(); // playerId -> last synced race HP cap
const HALFLING_MOUNT_GRACE = new Map(); // playerId -> tick when mounted
const HALFLING_DISMOUNT_TRACKED = new Map(); // playerId -> was sneaking last tick
const HALFLING_PICKPOCKET_COOLDOWN = new Map(); // playerId -> next attempt allowed (ms)
const HALFLING_PICKPOCKET_CD_MS = 25000;
const HALFLING_PICKPOCKET_RANGE = 5;
const HALFLING_PICKPOCKET_SUCCESS = 0.65;
const HALFLING_PICKPOCKET_NOTICE_CHANCE = 0.4;
const HALFLING_PICKPOCKET_MAX_STEAL = 8;
const HALFLING_PICKPOCKET_HIT_DEBOUNCE = new Map(); // playerId -> last attempt ms

const UNDEAD_MOB_TYPES = new Set([
  "minecraft:zombie", "minecraft:husk", "minecraft:drowned",
  "minecraft:skeleton", "minecraft:stray", "minecraft:wither_skeleton",
  "minecraft:zombie_villager", "minecraft:zoglin", "minecraft:phantom",
  "minecraft:bogged", "minecraft:zombified_piglin", "minecraft:wither",
]);

// Common undead that can be bound as minions (no boss mobs).
const UNDEAD_BINDABLE_MOB_TYPES = new Set([
  "minecraft:zombie", "minecraft:husk", "minecraft:drowned",
  "minecraft:skeleton", "minecraft:stray", "minecraft:wither_skeleton",
  "minecraft:zombie_villager", "minecraft:zoglin", "minecraft:phantom",
  "minecraft:bogged", "minecraft:zombified_piglin",
]);

const UNDEAD_MINION_MAX = 3;
const UNDEAD_MINION_BIND_RANGE = 6;
const UNDEAD_MINION_WANDER_RANGE = 18;
const UNDEAD_MINION_FOLLOW_RANGE = 32;
const UNDEAD_MINION_CATCHUP_RANGE = 24;
const UNDEAD_MINION_STANDOFF = 2.4;
const UNDEAD_MINION_RELEASE_RANGE = 4.5;
const UNDEAD_MINION_LIFETIME_MS = 5 * 60 * 1000;
const UNDEAD_MINION_BIND_CD_MS = 60 * 1000;
const UNDEAD_FLESH_OFFER_RANGE = 10;
const UNDEAD_FLESH_ACCEPT_RANGE = 2.5;
const UNDEAD_FLESH_MIN_AGE_MS = 400;
const UNDEAD_FLESH_SEEN = new Map(); // item entity id -> first seen timestamp (ms)
/** @type {Map<string, { ownerId: string, boundAt: number }>} */
const UNDEAD_MINIONS = new Map();
/** @type {Map<string, Set<string>>} */
const UNDEAD_MINION_BY_OWNER = new Map();
/** @type {Map<string, string>} */
const UNDEAD_MINION_OWNER_TARGET = new Map();
/** @type {Map<string, string>} */
const UNDEAD_MINION_ATTACK = new Map();
const UNDEAD_MINION_BIND_CD = new Map(); // playerId -> next bind allowed (ms)
const UNDEAD_MINION_CATCHUP_CD = new Map(); // mobId -> next catch-up teleport allowed (ms)
const UNDEAD_MINION_PROVOKE_CD = new Map(); // mobId -> next aggro refresh allowed (ms)
const UNDEAD_MINION_STRIKE_CD = new Map(); // mobId -> next script melee strike allowed (ms)
const UNDEAD_MINION_CHATTER_CD = new Map(); // mobId -> next ambient snarl allowed (ms)
const UNDEAD_MINION_ATTACK_TAG = "dnd_undead_minion";
const UNDEAD_BIND_ITEM = "minecraft:rotten_flesh";

const ELF_XP_INTERVAL_MS = 120000; // +1 level every 2 minutes
const ELF_XP_NEXT = new Map(); // playerId -> next grant timestamp (ms)
const HELLFIRE_VICTIMS = new Map(); // entityId -> { tieflingId, expiresMs }
const HELLFIRE_MARK_MS = 12000; // credit kills from hellfire ignite within 12s
const HELLFIRE_HEAL_AMOUNT = 4; // 2 hearts
const VEIN_MINE_MAX = 64;
const DWARF_VEIN_PENDING = new Map(); // playerId -> { family, x, y, z }
const SIREN_SONG_RADIUS = 12;
const SIREN_SONG_WATER_RADIUS = 15;
const SIREN_SONG_MOB_PULL = 0.85;
const SIREN_SONG_DURATION_MS = 5000;
const SIREN_SONG_FREEZE_RANGE = 3.5;
const SIREN_SONG_FREEZE_MS = 3000;
const SIREN_SONG_WALK_PULL = 0.2; // gentle step toward siren each tick
const SIREN_SONG_CHANNEL = new Map(); // sirenId -> { untilMs, anchor, radius }
/** @type {Map<string, { untilMs: number, sirenId: string }>} */
const SIREN_SONG_FROZEN_MOBS = new Map();
const SIREN_CHARMED_BY = new Map(); // victimPlayerId -> sirenId
const SIREN_AURA_PARTICLES = [
  "minecraft:water_splash_particle",
  "minecraft:cauldron_explosion_emitter",
];
const SIREN_LURE_SOUND = "dnd.sirens_lure";
const SIREN_ABILITY_SOUND = "dnd.sirens_song";
const SIREN_LURE_DURATION_MS = 44100;
const SIREN_ABILITY_DURATION_MS = 9300;
const SIREN_LURE_INTERVAL_MS = 420000; // 7 minutes between ambient lure songs
const SIREN_LURE_SELF_VOLUME = 0.7;
const SIREN_LURE_NEARBY_VOLUME = 0.55;
const SIREN_ABILITY_SELF_VOLUME = 0.8;
const SIREN_ABILITY_NEARBY_VOLUME = 0.65;
const SIREN_LURE_HEAR_RADIUS = 20;
const SIREN_ABILITY_HEAR_RADIUS = 20;
const SIREN_LURE_NEXT = new Map(); // playerId -> next ambient play timestamp (ms)
const SIREN_LURE_PLAYING_UNTIL = new Map(); // playerId -> passive lure clip end (ms)
const SIREN_ABILITY_PLAYING_UNTIL = new Map(); // playerId -> ability song clip end (ms)
const SIREN_MOVEMENT_LOCKED = new Set(); // sirenId -> movement input disabled during channel
const SIREN_LAND_DRYOUT_MS = 300000; // 5 minutes on land before drying out
const SIREN_LAND_WARN_MS = 270000; // warn with 30s remaining
const SIREN_LAND_DAMAGE = 2; // 1 heart per damage tick while dried out
const SIREN_LAND_MS = new Map(); // playerId -> ms spent on land since last water / drink
const SIREN_DRIED_OUT = new Set(); // playerId -> dehydrated state active
const SIREN_WATER_DRINK_PENDING = new Set(); // playerId -> started drinking a water bottle
const SIREN_SWIM_BOOST_HORIZ = 0.38;
const SIREN_SWIM_BOOST_VERT = 0.07;
const SIREN_SWIM_MAX_HORIZ = 0.36;
const SIREN_SWIM_DRAG = 0.14;
const SIREN_SWIM_SNEAK_DRAG = 0.28;

// Accursed evolution items
const RITUAL_DAGGER_UNACTIVATED_ID = "rnr:ritual_dagger_unactivated";
const RITUAL_DAGGER_ACTIVATED_ID = "rnr:ritual_dagger_activated";
const VAMPIRE_TURN_PENDING = new Set(); // playerId -> awaiting respawn ascension
const VAMPIRE_BAT_ACTIVE = new Set(); // playerId -> in bat form
const VAMPIRE_BAT_CD = new Map(); // playerId -> next bat form allowed (ms)
const VAMPIRE_BAT_CD_MS = 30000;
const VAMPIRE_BAT_MAX_HEIGHT = 20;
const VAMPIRE_BAT_GROUND_SCAN = VAMPIRE_BAT_MAX_HEIGHT + 16;
const VAMPIRE_BAT_FLIGHT_SPEED = 0.42;
const VAMPIRE_BAT_SPRINT_MULT = 1.5;
const VAMPIRE_BAT_RISE_SPEED = 0.36;
const VAMPIRE_BAT_RISE_ACCEL = 0.16;
const VAMPIRE_BAT_SPRINT_RISE_MULT = 1.45;
const VAMPIRE_BAT_SINK_SPEED = 0.26;
const VAMPIRE_BAT_SINK_ACCEL = 0.12;
const VAMPIRE_BAT_HORIZ_ACCEL = 0.042;
const VAMPIRE_BAT_SPRINT_ACCEL = 0.058;
const VAMPIRE_BAT_IDLE_DRAG = 0.05;
const JUMP_BUTTON_HELD = new Set(); // playerId -> jump button held (playerButtonInput fallback)
const VAMPIRE_CROUCH_JUMP_DEBOUNCE_MS = 300;
const VAMPIRE_CROUCH_JUMP_DEBOUNCE = new Map(); // playerId -> last trigger ms
const VAMPIRE_SUN_EXPOSURE_BURN_MS = 120000; // 2 minutes of direct sun before burning
const VAMPIRE_SUN_EXPOSURE_MS = new Map(); // playerId -> ms accumulated in direct sun
const VAMPIRE_SUN_EXPOSURE_LAST = new Map(); // playerId -> last timer update (Date.now)
const VAMPIRE_SUNLIGHT_SATURATION_MELT = 0.15;
const VAMPIRE_SUNLIGHT_EXHAUSTION_PUSH = 0.65;
const VAMPIRE_SUN_BURN_SECONDS = 8;
const VAMPIRE_SUN_BURN_DAMAGE = 1;
const VAMPIRE_BURNING_TAG = "rnr_vampire_burning";
const VAMPIRE_ARMOR_SUN_SLOTS = ["Head", "Chest", "Legs", "Feet"];
const VAMPIRE_SUN_ARMOR_MIN_PIECES = 3;
const VAMPIRE_FEED_PLAYER_CD_MS = 10000;
const VAMPIRE_FEED_TICKS = 20;
const VAMPIRE_FEED_SNAP_OFFSET = 0.58;
const VAMPIRE_FEED_TOTAL_HEAL = 4;
const VAMPIRE_FEED_TOTAL_HUNGER = 8;
const VAMPIRE_FEED_MOB_DAMAGE_TOTAL = 6;
const VAMPIRE_FEED_PLAYER_DAMAGE_TOTAL = 4;
const VAMPIRE_FEED_MAX_RANGE = 4;
const VAMPIRE_FEED_CD = new Map(); // playerId -> next feed allowed (ms)
const VAMPIRE_FEED_TARGET_CD = new Map(); // "feederId:targetId" -> next feed on target (ms)
const VAMPIRE_FEED_ACTIVE = new Map(); // feederId -> active drain session
const SNEAK_BUTTON_HELD = new Set(); // playerId -> sneak button held (playerButtonInput fallback)

const WEAPON_BAN_MSG_CD = new Map(); // playerId -> next notice allowed (ms)
const WEAPON_BAN_MSG_MS = 2000;
const LEONIN_MAINHAND_TRACK = new Map(); // playerId -> last mainhand typeId
const LEONIN_WEAPON_WEAKNESS_TICKS = 40;
const LEONIN_WEAPON_WEAKNESS_AMP = 255;
const LEONIN_CLAW_STRENGTH_AMP = 3; // Strength IV while claws are out (empty hand)
const BANNED_WEAPON_TYPE_IDS = new Set([
  "minecraft:bow",
  "minecraft:crossbow",
  "minecraft:trident",
]);
const BANNED_WEAPON_TAGS = [
  "minecraft:is_sword",
  "minecraft:is_axe",
  "minecraft:is_trident",
];

function safeSubscribe(signal, handler, label) {
  try {
    if (!signal?.subscribe) {
      console.warn(`[DnD] Missing event: ${label}`);
      return false;
    }
    signal.subscribe(handler);
    return true;
  } catch (e) {
    console.warn(`[DnD] Failed to subscribe ${label}: ${e}`);
    return false;
  }
}

const ORE_DROP_TABLE = {
  coal_ore:         { id: "minecraft:coal",          min: 1, max: 1 },
  iron_ore:         { id: "minecraft:raw_iron",      min: 1, max: 1 },
  copper_ore:       { id: "minecraft:raw_copper",  min: 2, max: 5 },
  gold_ore:           { id: "minecraft:raw_gold",      min: 1, max: 1 },
  diamond_ore:      { id: "minecraft:diamond",     min: 1, max: 1 },
  lapis_ore:        { id: "minecraft:lapis_lazuli", min: 4, max: 9 },
  redstone_ore:     { id: "minecraft:redstone",    min: 4, max: 5 },
  emerald_ore:      { id: "minecraft:emerald",     min: 1, max: 1 },
  nether_quartz_ore:{ id: "minecraft:quartz",      min: 1, max: 1 },
  nether_gold_ore:  { id: "minecraft:gold_nugget", min: 2, max: 6 },
  ancient_debris:   { id: "minecraft:ancient_debris", min: 1, max: 1 },
};

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function getAllPlayableRaces() {
  return RACES.filter((race) => race.tag && !race.isCategory).concat(BEASTFOLK_SUBRACES, EVOLUTION_RACES);
}

function clearAllRaceTags(player) {
  for (const race of getAllPlayableRaces()) {
    if (race.tag) player.removeTag(race.tag);
  }
  player.removeTag("race_beastfolk");
}

function isBeastfolkRace(race) {
  return race?.parentKey === "beastfolk" || String(race?.key ?? "").startsWith("beastfolk_");
}

function isLeoninRace(race) {
  return race?.key === "beastfolk_leonin";
}

function isLeoninPlayer(player) {
  if (!player) return false;
  if (player.hasTag?.("race_beastfolk_leonin")) return true;
  return getRace(player)?.key === "beastfolk_leonin";
}

function isBeastfolkPlayer(player) {
  return !!player?.hasTag?.("race_beastfolk");
}

function getRace(player) {
  return getAllPlayableRaces().find((race) => player.hasTag(race.tag)) ?? null;
}

function resetElfXpTimer(player) {
  ELF_XP_NEXT.set(player.id, Date.now() + ELF_XP_INTERVAL_MS);
}

function grantElfKeenMindXp(player) {
  try {
    if (typeof player.addLevels === "function") {
      player.addLevels(1);
      return true;
    }
  } catch (_) {}

  try {
    if (typeof player.addExperience === "function") {
      player.addExperience(500);
      return true;
    }
  } catch (_) {}

  try {
    player.runCommand("xp 1L @s");
    return true;
  } catch (_) {}

  return false;
}

function syncElfKeenMind(player) {
  if (!player.hasTag("race_elf")) {
    ELF_XP_NEXT.delete(player.id);
    return;
  }

  const now = Date.now();
  let nextAt = ELF_XP_NEXT.get(player.id);
  if (nextAt == null) {
    resetElfXpTimer(player);
    return;
  }

  if (now < nextAt) return;

  if (grantElfKeenMindXp(player)) {
    player.onScreenDisplay?.setActionBar?.("§aKeen Mind - +1 level");
  }
  resetElfXpTimer(player);
}

function blockPosKey(x, y, z) {
  return `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
}

function getOreFamily(typeId) {
  let name = String(typeId ?? "").replace("minecraft:", "");
  if (name.startsWith("deepslate_")) name = name.slice("deepslate_".length);
  if (name.startsWith("lit_")) name = name.slice("lit_".length);
  return name;
}

function getBrokenOreId(event) {
  return event.brokenBlockPermutation?.type?.id
    ?? event.brokenBlockPermutation?.typeId
    ?? event.block?.typeId
    ?? "";
}

function isOreBlock(typeId) {
  const family = getOreFamily(typeId);
  return family.endsWith("_ore") || family === "ancient_debris";
}

function getMainhandTool(player) {
  try {
    const equip = player.getComponent("minecraft:equippable");
    if (equip?.getEquipment) {
      for (const slot of ["Mainhand", "mainhand", "Hand"]) {
        try {
          const item = equip.getEquipment(slot);
          if (item !== undefined && item !== null) return item;
        } catch (_) {}
      }
    }
  } catch (_) {}

  // Selected hotbar slot is what's actually in hand — never use container slot 0.
  try {
    const container = player.getComponent("minecraft:inventory")?.container;
    const slot = player.selectedSlotIndex;
    if (container && slot >= 0 && slot <= 8) {
      return container.getItem(slot);
    }
  } catch (_) {}

  return undefined;
}

function setMainhandItem(player, itemStack) {
  try {
    const equip = player.getComponent("minecraft:equippable");
    if (equip?.setEquipment) {
      equip.setEquipment("Mainhand", itemStack);
      return true;
    }
  } catch (_) {}
  try {
    const container = player.getComponent("minecraft:inventory")?.container;
    const slot = player.selectedSlotIndex;
    if (container && slot >= 0 && slot <= 8) {
      container.setItem(slot, itemStack);
      return true;
    }
  } catch (_) {}
  return false;
}

function isAccursedPlayer(player) {
  return !!player?.hasTag?.("race_accursed");
}

function activateRitualDaggerInHand(player) {
  const item = getMainhandTool(player);
  if ((item?.typeId ?? "") !== RITUAL_DAGGER_UNACTIVATED_ID) return false;

  const activated = new ItemStack(RITUAL_DAGGER_ACTIVATED_ID, 1);
  try {
    const oldDur = item.getComponent("minecraft:durability");
    const newDur = activated.getComponent("minecraft:durability");
    if (oldDur && newDur && typeof oldDur.damage === "number") {
      newDur.damage = oldDur.damage;
    }
  } catch (_) {}

  if (!setMainhandItem(player, activated)) return false;
  player.sendMessage("§4A adaga bebe o sangue do morcego e vibra com uma luz amaldiçoada.");
  player.onScreenDisplay?.setActionBar?.("§4Adaga Ritual (Ativada)");
  return true;
}

function onRitualDaggerBatKill(deadEntity, damageSource) {
  if ((deadEntity?.typeId ?? "") !== "minecraft:bat") return;
  const killer = getDamageAttacker(damageSource);
  if (!(killer instanceof mc.Player)) return;
  if (!isAccursedPlayer(killer)) return;

  const weapon = getMainhandTool(killer);
  if ((weapon?.typeId ?? "") !== RITUAL_DAGGER_UNACTIVATED_ID) return;

  mc.system.run(() => activateRitualDaggerInHand(killer));
}

function isVampirePlayer(player) {
  return !!player?.hasTag?.("race_vampire");
}

const VAMPIRE_RAW_MEAT_TYPES = new Set([
  "minecraft:beef",
  "minecraft:porkchop",
  "minecraft:chicken",
  "minecraft:mutton",
  "minecraft:rabbit",
]);

function isVampireRawMeat(typeId) {
  const id = normalizeTypeId(typeId);
  return VAMPIRE_RAW_MEAT_TYPES.has(id);
}

function isEdibleItemStack(itemStack) {
  if (!itemStack) return false;
  const typeId = normalizeTypeId(itemStack.typeId);
  if (!typeId || typeId === "minecraft:air") return false;
  if (typeId === "minecraft:milk_bucket") return true;

  try {
    if (itemStack.getComponent("minecraft:food")) return true;
  } catch (_) {}

  try {
    if (itemStack.hasTag?.("minecraft:is_food")) return true;
    const owned = itemStack.getTags?.() ?? [];
    if (owned.includes("minecraft:is_food")) return true;
  } catch (_) {}

  return false;
}

function notifyVampireFoodRejected(player) {
  player.onScreenDisplay?.setActionBar?.("§4Isso não faz parte do seu apetite.");
}

function onVampireFoodBeforeItemUse(event) {
  const player = event.source;
  if (!(player instanceof mc.Player) || !isVampirePlayer(player)) return;

  const itemStack = event.itemStack;
  if (!isEdibleItemStack(itemStack)) return;
  if (isVampireRawMeat(itemStack?.typeId)) return;

  event.cancel = true;
  notifyVampireFoodRejected(player);
}

function consumeMainhandIfType(player, typeId) {
  const item = getMainhandTool(player);
  if ((item?.typeId ?? "") !== typeId) return false;
  if ((item.amount ?? 1) > 1) {
    return setMainhandItem(player, new ItemStack(typeId, item.amount - 1));
  }
  return setMainhandItem(player, undefined);
}

function isPlayerInSunlight(player) {
  try {
    const dim = player.dimension;
    if (dim.id === "minecraft:nether" || dim.id === "minecraft:the_end") return false;

    const time = mc.world.getTimeOfDay();
    if (time >= 13000 && time < 23000) return false;

    const x = Math.floor(player.location.x);
    const z = Math.floor(player.location.z);
    const startY = Math.floor(player.location.y) + 1;
    for (let y = startY; y < Math.min(startY + 320, 320); y++) {
      const block = dim.getBlock({ x, y, z });
      if (!block) return false;
      const id = block.typeId ?? "";
      if (id !== "minecraft:air" && id !== "minecraft:cave_air" && id !== "minecraft:void_air") {
        return false;
      }
    }
    return true;
  } catch (_) {
    return false;
  }
}

function countVampireArmorPieces(player) {
  let count = 0;
  try {
    const equip = player.getComponent("minecraft:equippable");
    if (!equip?.getEquipment) return 0;
    for (const slot of VAMPIRE_ARMOR_SUN_SLOTS) {
      const item = equip.getEquipment(slot);
      const typeId = item?.typeId ?? "";
      if (typeId && typeId !== "minecraft:air") count++;
    }
  } catch (_) {}
  return count;
}

function isVampireSunArmored(player) {
  return countVampireArmorPieces(player) >= VAMPIRE_SUN_ARMOR_MIN_PIECES;
}

function isVampireInSunExposure(player) {
  return isPlayerInSunlight(player) && !isVampireSunArmored(player);
}

function clearVampireSunExposureTimer(playerOrId) {
  const id = typeof playerOrId === "string" ? playerOrId : playerOrId?.id;
  if (!id) return;
  VAMPIRE_SUN_EXPOSURE_MS.delete(id);
  VAMPIRE_SUN_EXPOSURE_LAST.delete(id);
}

function getVampireSunExposureMs(player) {
  return VAMPIRE_SUN_EXPOSURE_MS.get(player.id) ?? 0;
}

function formatVampireSunTimer(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

function syncVampireSunExposureTimer(player) {
  if (!isVampirePlayer(player)) return;

  if (!isVampireInSunExposure(player)) {
    clearVampireSunExposureTimer(player);
    return;
  }

  const now = Date.now();
  const last = VAMPIRE_SUN_EXPOSURE_LAST.get(player.id) ?? now;
  const elapsed = Math.min(Math.max(0, now - last), 250);
  VAMPIRE_SUN_EXPOSURE_LAST.set(player.id, now);
  VAMPIRE_SUN_EXPOSURE_MS.set(player.id, getVampireSunExposureMs(player) + elapsed);

  try {
    const saturation = player.getComponent("minecraft:player.saturation");
    if (saturation?.setCurrentValue && (saturation.currentValue ?? 0) > 0) {
      saturation.setCurrentValue(Math.max(0, (saturation.currentValue ?? 0) - VAMPIRE_SUNLIGHT_SATURATION_MELT));
    }
  } catch (_) {}

  try {
    const exhaustion = player.getComponent("minecraft:player.exhaustion");
    if (exhaustion?.setCurrentValue) {
      exhaustion.setCurrentValue(Math.min(40, (exhaustion.currentValue ?? 0) + VAMPIRE_SUNLIGHT_EXHAUSTION_PUSH));
    }
  } catch (_) {}
}

function shouldVampireSunBurn(player) {
  return isVampireInSunExposure(player) && getVampireSunExposureMs(player) >= VAMPIRE_SUN_EXPOSURE_BURN_MS;
}

function applyVampireSunFireDamage(player) {
  const damage = VAMPIRE_SUN_BURN_DAMAGE;
  const fireCauses = [
    getEntityDamageCauseFire(),
    mc.EntityDamageCause?.fireTick,
    "fire",
    "fireTick",
  ].filter(Boolean);

  for (const cause of fireCauses) {
    try {
      if (player.applyDamage(damage, { cause })) return true;
    } catch (_) {}
  }

  for (const cmd of [`damage @s ${damage} fire`]) {
    try {
      player.runCommand(cmd);
      return true;
    } catch (_) {}
    try {
      player.dimension.runCommand(cmd);
      return true;
    } catch (_) {}
  }

  try {
    const health = player.getComponent("minecraft:health");
    if (health && health.currentValue > 0) {
      health.setCurrentValue(Math.max(0.5, health.currentValue - damage));
      return true;
    }
  } catch (_) {}

  return false;
}

function stopVampireBurn(player) {
  try {
    player.removeTag(VAMPIRE_BURNING_TAG);
  } catch (_) {}
  try {
    player.extinguishFire(true);
  } catch (_) {}
}

function startVampireBurn(player) {
  try {
    player.removeEffect("fire_resistance");
  } catch (_) {}
  try {
    player.addTag(VAMPIRE_BURNING_TAG);
  } catch (_) {}
  try {
    player.setOnFire(VAMPIRE_SUN_BURN_SECONDS, false);
  } catch (_) {
    try {
      player.setOnFire(VAMPIRE_SUN_BURN_SECONDS);
    } catch (_) {}
  }
  applyVampireSunFireDamage(player);
  try {
    const loc = player.location;
    const dim = player.dimension;
    spawnParticleSafe(dim, "minecraft:basic_flame_particle", { x: loc.x, y: loc.y + 1.0, z: loc.z });
    spawnParticleSafe(dim, "minecraft:basic_flame_particle", { x: loc.x, y: loc.y + 1.6, z: loc.z });
    dim.playSound?.("random.fizz", loc, { volume: 0.35, pitch: 1.2 });
  } catch (_) {}
}

function syncVampireSunBurn(player) {
  if (!isVampirePlayer(player)) {
    stopVampireBurn(player);
    return;
  }

  if (!shouldVampireSunBurn(player)) {
    stopVampireBurn(player);
    if (isVampireInSunExposure(player) && mc.system.currentTick % 40 === 0) {
      const remaining = Math.max(0, VAMPIRE_SUN_EXPOSURE_BURN_MS - getVampireSunExposureMs(player));
      player.onScreenDisplay?.setActionBar?.(`§eSun exposure §7${formatVampireSunTimer(remaining)} until burn`);
    }
    return;
  }

  startVampireBurn(player);
  if (mc.system.currentTick % 20 === 0) {
    player.onScreenDisplay?.setActionBar?.("§4Você está fraco demais para aguentar o sol");
  }
}

function syncVampirePassives(player) {
  if (!isVampirePlayer(player)) return;
  try {
    player.removeEffect("fire_resistance");
  } catch (_) {}
  try {
    if (isNightTime()) {
      if (!isVampireBatForm(player)) {
        player.addEffect("speed", 40, { amplifier: 0, showParticles: false });
      }
      player.addEffect("night_vision", 400, { amplifier: 0, showParticles: false });
      clearVampireSunExposureTimer(player);
      stopVampireBurn(player);
    }
    if (!isVampireBatForm(player) && isVampireInSunExposure(player)) {
      player.addEffect("weakness", 40, { amplifier: 0, showParticles: true });
      player.addEffect("hunger", 60, { amplifier: 1, showParticles: false });
    }
  } catch (_) {}
}

function isVampireBatForm(player) {
  return VAMPIRE_BAT_ACTIVE.has(player?.id);
}

function getBatGroundSurfaceY(dimension, x, z, fromY) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const startY = Math.floor(fromY);
  const minY = Math.max(-64, startY - VAMPIRE_BAT_GROUND_SCAN);
  for (let y = startY; y >= minY; y--) {
    try {
      const block = dimension.getBlock({ x: ix, y, z: iz });
      if (!block) continue;
      const id = block.typeId ?? "";
      if (id === "minecraft:air" || id === "minecraft:cave_air" || id === "minecraft:void_air") continue;
      return y + 1;
    } catch (_) {}
  }
  return null;
}

function getVampireBatGroundY(player) {
  const loc = player.location;
  const dim = player.dimension;
  const scanFrom = Math.floor(loc.y) + 2;

  let groundY = getBatGroundSurfaceY(dim, loc.x, loc.z, scanFrom);
  if (groundY !== null) return groundY;

  groundY = getBatGroundSurfaceY(dim, loc.x, loc.z, scanFrom + VAMPIRE_BAT_MAX_HEIGHT);
  if (groundY !== null) return groundY;

  return Math.floor(loc.y);
}

function getVampireHeightAboveGround(player) {
  return player.location.y - getVampireBatGroundY(player);
}

function clearVampireBatFlightState(playerOrId) {
  const id = typeof playerOrId === "string" ? playerOrId : playerOrId?.id;
  if (!id) return;
}

function isVampireBatRising(player, input) {
  if (input?.jumping) return true;
  if (JUMP_BUTTON_HELD.has(player?.id)) return true;
  if (jumpTracked.get(player?.id)) return true;
  try {
    const jumpState = player.inputInfo?.getButtonState?.("Jump");
    if (jumpState === "Pressed") return true;
  } catch (_) {}
  return false;
}

function revertVampireBatForm(player, forced = false) {
  if (!isVampirePlayer(player)) return;
  if (!isVampireBatForm(player)) return;

  VAMPIRE_BAT_ACTIVE.delete(player.id);
  clearVampireBatFlightState(player);
  try {
    player.removeEffect("slow_falling");
    player.removeEffect("speed");
    player.removeEffect("weakness");
    player.removeEffect("night_vision");
  } catch (_) {}
  try {
    player.triggerEvent("race:set_vampire");
  } catch (_) {}

  if (forced) {
    player.onScreenDisplay?.setActionBar?.("§8A forma de morcego some com o amanhecer.");
  } else {
    player.onScreenDisplay?.setActionBar?.("§7Vampire form");
  }
}

function enterVampireBatForm(player) {
  if (!isVampirePlayer(player)) return false;
  if (!isNightTime()) {
    player.onScreenDisplay?.setActionBar?.("§8A forma de morcego só funciona à noite.");
    return false;
  }
  if (isVampireBatForm(player)) return false;

  const now = Date.now();
  const readyAt = VAMPIRE_BAT_CD.get(player.id) ?? 0;
  if (now < readyAt) {
    const secs = Math.ceil((readyAt - now) / 1000);
    player.onScreenDisplay?.setActionBar?.(`§8Bat form cooldown: ${secs}s`);
    return false;
  }

  try {
    player.triggerEvent("race:set_vampire");
  } catch (_) {
    try {
      player.runCommand("event entity @s race:set_vampire");
    } catch (_) {}
  }

  let batApplied = false;
  try {
    player.triggerEvent("race:vampire_set_bat");
    batApplied = true;
  } catch (_) {}
  if (!batApplied) {
    try {
      player.runCommand("event entity @s race:vampire_set_bat");
      batApplied = true;
    } catch (_) {}
  }
  if (!batApplied) return false;

  VAMPIRE_BAT_ACTIVE.add(player.id);
  VAMPIRE_BAT_CD.set(player.id, now + VAMPIRE_BAT_CD_MS);
  clearVampireBatFlightState(player);
  try {
    player.addEffect("slow_falling", 999999, { amplifier: 0, showParticles: false });
    player.addEffect("speed", 999999, { amplifier: 0, showParticles: false });
    player.addEffect("weakness", 999999, { amplifier: 1, showParticles: false });
    if (isNightTime()) {
      player.addEffect("night_vision", 999999, { amplifier: 0, showParticles: false });
    }
  } catch (_) {}
  player.sendMessage("§8Você se desfaz em forma de morcego!");
  player.onScreenDisplay?.setActionBar?.("§8Forma de morcego: mova-se para planar, pule para subir, agache para descer (máx. 20 blocos)");
  return true;
}

function toggleVampireBatForm(player) {
  if (isVampireBatForm(player)) {
    revertVampireBatForm(player, false);
    return;
  }
  enterVampireBatForm(player);
}

function isVampireSneaking(player) {
  if (!player) return false;
  try {
    if (player.isSneaking) return true;
  } catch (_) {}
  if (SNEAK_BUTTON_HELD.has(player.id)) return true;
  if (sneakTracked.get(player.id)) return true;
  return false;
}

function tryVampireCrouchJump(player) {
  if (!isVampirePlayer(player)) return;
  const now = Date.now();
  const last = VAMPIRE_CROUCH_JUMP_DEBOUNCE.get(player.id) ?? 0;
  if (now - last < VAMPIRE_CROUCH_JUMP_DEBOUNCE_MS) return;
  VAMPIRE_CROUCH_JUMP_DEBOUNCE.set(player.id, now);
  toggleVampireBatForm(player);
}

function onVampireCrouchJump(player) {
  tryVampireCrouchJump(player);
}

function syncVampireBatFlight(player) {
  if (!isVampireBatForm(player)) return;

  const tick = mc.system.currentTick;
  const loc = player.location;
  const groundY = getVampireBatGroundY(player);
  const heightAbove = loc.y - groundY;
  const overHeightLimit = heightAbove >= VAMPIRE_BAT_MAX_HEIGHT;
  const input = readPlayerInputState(player);
  const moveDir = getVampireBatWorldMoveDir(player, input);
  const rising = isVampireBatRising(player, input);
  const sinking = !!input?.sneaking;
  const canRise = rising && !overHeightLimit;

  if (tick % 40 === 0) {
    try {
      player.addEffect("slow_falling", 999999, { amplifier: 0, showParticles: false });
      player.addEffect("speed", 999999, { amplifier: input?.sprinting ? 1 : 0, showParticles: false });
      if (isNightTime()) {
        player.addEffect("night_vision", 999999, { amplifier: 0, showParticles: false });
      }
    } catch (_) {}
  }

  let vel;
  try {
    vel = player.getVelocity();
  } catch (_) {
    return;
  }

  let ix = 0;
  let iz = 0;
  if (moveDir) {
    const targetSpeed = VAMPIRE_BAT_FLIGHT_SPEED * (input?.sprinting ? VAMPIRE_BAT_SPRINT_MULT : 1);
    const accel = input?.sprinting ? VAMPIRE_BAT_SPRINT_ACCEL : VAMPIRE_BAT_HORIZ_ACCEL;
    const tx = moveDir.x * targetSpeed;
    const tz = moveDir.z * targetSpeed;
    ix = Math.max(-accel, Math.min(accel, tx - vel.x));
    iz = Math.max(-accel, Math.min(accel, tz - vel.z));
  } else if (!rising && !sinking && tick % 8 === 0) {
    if (Math.abs(vel.x) > 0.05 || Math.abs(vel.z) > 0.05) {
      ix = -vel.x * VAMPIRE_BAT_IDLE_DRAG;
      iz = -vel.z * VAMPIRE_BAT_IDLE_DRAG;
    }
  }

  let iy = 0;
  if (canRise) {
    const targetVy = VAMPIRE_BAT_RISE_SPEED * (input?.sprinting ? VAMPIRE_BAT_SPRINT_RISE_MULT : 1);
    iy = Math.max(-VAMPIRE_BAT_RISE_ACCEL, Math.min(VAMPIRE_BAT_RISE_ACCEL, targetVy - vel.y));
  } else if (sinking) {
    const targetVy = -VAMPIRE_BAT_SINK_SPEED;
    iy = Math.max(-VAMPIRE_BAT_SINK_ACCEL, Math.min(VAMPIRE_BAT_SINK_ACCEL, targetVy - vel.y));
  } else if (overHeightLimit && vel.y > 0.02) {
    iy = Math.max(-VAMPIRE_BAT_SINK_ACCEL, Math.min(VAMPIRE_BAT_SINK_ACCEL, -vel.y * 0.15));
  }

  const atMaxHeight = heightAbove >= VAMPIRE_BAT_MAX_HEIGHT - 0.15;
  const wingsBlocked = atMaxHeight && rising && tick % 40 === 0;

  if (Math.abs(ix) < 0.001 && Math.abs(iy) < 0.001 && Math.abs(iz) < 0.001) {
    if (wingsBlocked) {
      player.onScreenDisplay?.setActionBar?.("§8Suas asas não conseguem levar você mais alto");
    }
    return;
  }

  try {
    player.applyImpulse({ x: ix, y: iy, z: iz });
  } catch (_) {}

  if (wingsBlocked) {
    player.onScreenDisplay?.setActionBar?.("§8Suas asas não conseguem levar você mais alto");
  } else if (overHeightLimit && tick % 40 === 0) {
    player.onScreenDisplay?.setActionBar?.("§8Acima do limite de altura: agache para descer.");
  }
}

function syncVampireDayNightForm(player) {
  if (!isVampirePlayer(player)) return;
  if (!isNightTime() && isVampireBatForm(player)) {
    revertVampireBatForm(player, true);
  }
}

function onVampireBloodFeast(deadEntity, damageSource) {
  if (deadEntity instanceof mc.Player) return;
  const killer = getDamageAttacker(damageSource);
  if (!(killer instanceof mc.Player) || !isVampirePlayer(killer)) return;
  healPlayerWithinRaceCap(killer, VAMPIRE_RACE, 2);
  killer.onScreenDisplay?.setActionBar?.("§4Blood feast — +1 heart");
}

function isVampireFeedExcludedType(typeId) {
  return typeId === "minecraft:item"
    || typeId === "minecraft:xp_orb"
    || typeId === "minecraft:armor_stand"
    || typeId === "minecraft:arrow"
    || typeId === "minecraft:snowball"
    || typeId === "minecraft:egg"
    || typeId === "minecraft:ender_pearl"
    || typeId === "minecraft:experience_orb";
}

function isVampireFeedTarget(entity, feeder) {
  if (!entity?.isValid?.() || !feeder?.isValid?.()) return false;
  if (entity.id === feeder.id) return false;

  const typeId = entity.typeId ?? "";
  if (isVampireFeedExcludedType(typeId)) return false;

  if (isUndeadMinion(entity.id) && getUndeadMinionOwnerId(entity.id) === feeder.id) {
    return false;
  }

  if (isPlayerEntity(entity)) return true;

  try {
    return !!entity.getComponent("minecraft:health");
  } catch (_) {
    return false;
  }
}

function clearVampireFeedCooldownsForPlayer(playerId) {
  VAMPIRE_FEED_CD.delete(playerId);
  for (const key of [...VAMPIRE_FEED_TARGET_CD.keys()]) {
    if (key.startsWith(`${playerId}:`) || key.endsWith(`:${playerId}`)) {
      VAMPIRE_FEED_TARGET_CD.delete(key);
    }
  }
}

function isVampireFeeding(player) {
  return VAMPIRE_FEED_ACTIVE.has(player?.id);
}

function getVampireFeedTarget(session) {
  if (!session?.targetId) return null;
  try {
    const entity = mc.world.getEntity(session.targetId);
    return entity?.isValid?.() ? entity : null;
  } catch (_) {
    return null;
  }
}

function getVampireFeedLookTarget(session, isPlayerTarget) {
  const anchor = session?.anchorPos;
  if (!anchor) return null;
  return {
    x: anchor.x,
    y: anchor.y + (isPlayerTarget ? 1.35 : 0.95),
    z: anchor.z,
  };
}

function faceVampireTowardFeedTarget(vampire, session, isPlayerTarget) {
  const lookTarget = getVampireFeedLookTarget(session, isPlayerTarget);
  if (!lookTarget) return;
  facePlayerToward(vampire, lookTarget);
}

function captureVampireFeedAnchor(target, session) {
  if (session.anchorPos) return;
  const loc = target.location;
  session.anchorPos = { x: loc.x, y: loc.y, z: loc.z };
  try {
    session.anchorYaw = target.getRotation?.()?.y ?? 0;
  } catch (_) {
    session.anchorYaw = 0;
  }
}

function ensureVampireFeedSnapDir(vampire, session) {
  if (session.snapDir) return;
  const anchor = session.anchorPos;
  if (!anchor) return;

  const vLoc = vampire.location;
  let dx = vLoc.x - anchor.x;
  let dz = vLoc.z - anchor.z;
  let dist = Math.sqrt(dx * dx + dz * dz);
  if (dist < 0.08) {
    try {
      const view = vampire.getViewDirection();
      dx = -view.x;
      dz = -view.z;
    } catch (_) {
      dx = 0;
      dz = 1;
    }
    dist = Math.sqrt(dx * dx + dz * dz) || 1;
  }
  session.snapDir = { x: dx / dist, z: dz / dist };
}

function getVampireFeedSnapPos(session, isPlayerTarget) {
  const anchor = session.anchorPos;
  const dir = session.snapDir;
  if (!anchor || !dir) return null;
  return {
    x: anchor.x + dir.x * VAMPIRE_FEED_SNAP_OFFSET,
    y: anchor.y + (isPlayerTarget ? 1.05 : 0.7),
    z: anchor.z + dir.z * VAMPIRE_FEED_SNAP_OFFSET,
  };
}

function holdVampireFeedTargetAtAnchor(target, session) {
  if (!session?.anchorPos) return;
  const anchor = session.anchorPos;
  if (entityDistance(target.location, anchor) > 0.15) {
    try {
      target.teleport(anchor, {
        dimension: target.dimension,
        rotation: { x: 0, y: session.anchorYaw ?? 0 },
        keepVelocity: false,
      });
    } catch (_) {
      try {
        target.teleport(anchor, { dimension: target.dimension });
      } catch (_) {}
    }
  }
  try {
    target.clearVelocity?.();
  } catch (_) {}
}

function snapVampireToFeedTarget(vampire, session, isPlayerTarget) {
  if (!session?.anchorPos) return;
  ensureVampireFeedSnapDir(vampire, session);
  const snapPos = getVampireFeedSnapPos(session, isPlayerTarget);
  if (!snapPos) return;

  const lookTarget = getVampireFeedLookTarget(session, isPlayerTarget);
  let rotation = { x: 0, y: session.anchorYaw ?? 0 };
  if (lookTarget) {
    rotation = getFacingRotation(
      {
        x: snapPos.x,
        y: snapPos.y + (isPlayerTarget ? 1.62 : 1.35),
        z: snapPos.z,
      },
      lookTarget,
    );
  }

  try {
    vampire.teleport(snapPos, {
      dimension: vampire.dimension,
      rotation,
      keepVelocity: false,
    });
  } catch (_) {
    try {
      vampire.teleport(snapPos, { dimension: vampire.dimension });
    } catch (_) {}
  }
  faceVampireTowardFeedTarget(vampire, session, isPlayerTarget);
  try {
    vampire.clearVelocity?.();
  } catch (_) {}
}

function applyVampireFeedGrip(target, isPlayerTarget) {
  try {
    target.addEffect("slowness", 50, { amplifier: 255, showParticles: false });
    target.addEffect("weakness", 50, { amplifier: isPlayerTarget ? 0 : 1, showParticles: isPlayerTarget });
  } catch (_) {}
}

function clearVampireFeedGrip(target) {
  if (!target?.isValid?.()) return;
  try {
    target.removeEffect("slowness");
    target.removeEffect("weakness");
  } catch (_) {}
}

function addVampireFeedHunger(player, amount) {
  if (!amount || amount <= 0) return;

  try {
    const hunger = player.getComponent("minecraft:player.hunger");
    if (hunger?.setCurrentValue) {
      const max = hunger.effectiveMax ?? 20;
      const current = typeof hunger.currentValue === "number" ? hunger.currentValue : 0;
      hunger.setCurrentValue(Math.min(max, current + amount));
    }
  } catch (_) {}

  try {
    const saturation = player.getComponent("minecraft:player.saturation");
    if (saturation?.setCurrentValue) {
      const satMax = saturation.effectiveMax ?? 20;
      const satCurrent = typeof saturation.currentValue === "number" ? saturation.currentValue : 0;
      saturation.setCurrentValue(Math.min(satMax, satCurrent + amount * 0.75));
    }
  } catch (_) {}

  try {
    player.addEffect("saturation", 4, { amplifier: 0, showParticles: false });
  } catch (_) {}
}

function spawnVampireFeedFx(vampire, target, isPlayerTarget) {
  try {
    const loc = target.location;
    const dim = target.dimension;
    spawnParticleSafe(dim, "minecraft:critical_hit_emitter", {
      x: loc.x,
      y: loc.y + (isPlayerTarget ? 1.35 : 0.95),
      z: loc.z,
    });
    spawnParticleSafe(dim, "minecraft:basic_crit_particle", {
      x: loc.x,
      y: loc.y + 1.0,
      z: loc.z,
    });
    dim.playSound("mob.witch.drink", loc, { volume: 0.7, pitch: 1.1 });
    if (isPlayerTarget) {
      dim.playSound("damage.fallbig", loc, { volume: 0.25, pitch: 1.35 });
    }
  } catch (_) {}
}

function endVampireFeed(feederId, completed = false) {
  const session = VAMPIRE_FEED_ACTIVE.get(feederId);
  if (!session) return;
  VAMPIRE_FEED_ACTIVE.delete(feederId);

  let feeder;
  try {
    feeder = mc.world.getEntity(feederId);
  } catch (_) {
    feeder = null;
  }

  const target = getVampireFeedTarget(session);
  clearVampireFeedGrip(target);

  if (feeder instanceof mc.Player && feeder.isValid?.()) {
    try {
      feeder.removeEffect("slowness");
    } catch (_) {}

    if (completed) {
      const now = Date.now();
      VAMPIRE_FEED_CD.set(feederId, now + VAMPIRE_FEED_CD_MS);
      if (session.isPlayerTarget) {
        VAMPIRE_FEED_TARGET_CD.set(`${feederId}:${session.targetId}`, now + VAMPIRE_FEED_PLAYER_CD_MS);
      }
      feeder.onScreenDisplay?.setActionBar?.("§4Blood drain complete");
    }
  }
}

function breakVampireFeed(feederId, reason = "interrupted") {
  const session = VAMPIRE_FEED_ACTIVE.get(feederId);
  if (!session) return;

  let feeder;
  try {
    feeder = mc.world.getEntity(feederId);
  } catch (_) {
    feeder = null;
  }
  const target = getVampireFeedTarget(session);

  endVampireFeed(feederId, false);

  if (feeder instanceof mc.Player && feeder.isValid?.()) {
    if (reason === "victim_struggle") {
      feeder.onScreenDisplay?.setActionBar?.("§8Sua presa se soltou.");
    } else if (reason === "distance") {
      feeder.onScreenDisplay?.setActionBar?.("§8Target broke free.");
    } else {
      feeder.onScreenDisplay?.setActionBar?.("§8Feed interrupted.");
    }
  }

  if (session.isPlayerTarget && target instanceof mc.Player && target.isValid?.()) {
    if (reason === "victim_struggle") {
      target.onScreenDisplay?.setActionBar?.("§aVocê se soltou!");
      target.sendMessage("§eVocê se solta do vampiro!");
    } else if (reason === "damaged") {
      target.onScreenDisplay?.setActionBar?.("§aO vampiro foi arremessado para longe!");
    }
  }
}

function isPlayerStrugglingFree(player) {
  if (!isPlayerSneaking(player)) return false;
  return isVampireBatRising(player, readPlayerInputState(player));
}

function getVampireFeederIdForTarget(targetId) {
  for (const [feederId, session] of VAMPIRE_FEED_ACTIVE.entries()) {
    if (session.targetId === targetId) return feederId;
  }
  return null;
}

function tickVampireFeedSessions() {
  for (const [feederId, session] of [...VAMPIRE_FEED_ACTIVE.entries()]) {
    let feeder;
    try {
      feeder = mc.world.getEntity(feederId);
    } catch (_) {
      feeder = null;
    }

    if (!(feeder instanceof mc.Player) || !feeder.isValid?.() || !isVampirePlayer(feeder)) {
      breakVampireFeed(feederId, "interrupted");
      continue;
    }

    const target = getVampireFeedTarget(session);
    if (!target || !isVampireFeedTarget(target, feeder)) {
      breakVampireFeed(feederId, "interrupted");
      continue;
    }

    if (session.isPlayerTarget && target instanceof mc.Player && isPlayerStrugglingFree(target)) {
      breakVampireFeed(feederId, "victim_struggle");
      continue;
    }

    captureVampireFeedAnchor(target, session);
    holdVampireFeedTargetAtAnchor(target, session);

    if (session.anchorPos && entityDistance(target.location, session.anchorPos) > VAMPIRE_FEED_MAX_RANGE) {
      breakVampireFeed(feederId, "distance");
      continue;
    }
    if (session.anchorPos && entityDistance(feeder.location, session.anchorPos) > VAMPIRE_FEED_MAX_RANGE + 1) {
      breakVampireFeed(feederId, "distance");
      continue;
    }

    snapVampireToFeedTarget(feeder, session, session.isPlayerTarget);
    applyVampireFeedGrip(target, session.isPlayerTarget);

    session.healBank = (session.healBank ?? 0) + session.healPerTick;
    session.hungerBank = (session.hungerBank ?? 0) + session.hungerPerTick;
    session.damageBank = (session.damageBank ?? 0) + session.damagePerTick;

    if (session.healBank >= 0.5) {
      const healNow = Math.floor(session.healBank);
      healPlayerWithinRaceCap(feeder, VAMPIRE_RACE, healNow);
      session.healBank -= healNow;
    }
    if (session.hungerBank >= 0.5) {
      const hungerNow = Math.floor(session.hungerBank);
      addVampireFeedHunger(feeder, hungerNow);
      session.hungerBank -= hungerNow;
    }
    if (session.damageBank >= 1) {
      const damageNow = Math.floor(session.damageBank);
      try {
        target.applyDamage(damageNow, {
          cause: getEntityDamageCauseEntityAttack(),
          damagingEntity: feeder,
        });
      } catch (_) {}
      session.damageBank -= damageNow;
    }

    session.tick = (session.tick ?? 0) + 1;
    if (session.tick % 4 === 0) {
      spawnVampireFeedFx(feeder, target, session.isPlayerTarget);
    }

    const progress = Math.min(1, session.tick / session.maxTicks);
    if (session.tick % 6 === 0) {
      feeder.onScreenDisplay?.setActionBar?.(`§4Draining blood... ${Math.floor(progress * 100)}%`);
    }

    if (session.tick >= session.maxTicks) {
      if (session.healBank >= 0.25) {
        healPlayerWithinRaceCap(feeder, VAMPIRE_RACE, 1);
      }
      if (session.hungerBank >= 0.25) {
        addVampireFeedHunger(feeder, 1);
      }
      endVampireFeed(feederId, true);
    }
  }
}

function startVampireFeed(attacker, targetEntity) {
  if (!(attacker instanceof mc.Player) || !isVampirePlayer(attacker)) return false;
  if (!isPlayerSneaking(attacker)) return false;
  if (isVampireBatForm(attacker)) return false;
  if (isVampireFeeding(attacker)) return false;
  if (!isVampireFeedTarget(targetEntity, attacker)) return false;

  const now = Date.now();
  if (now < (VAMPIRE_FEED_CD.get(attacker.id) ?? 0)) return false;

  const feedingPlayer = isPlayerEntity(targetEntity);
  const targetKey = `${attacker.id}:${targetEntity.id}`;
  if (feedingPlayer && now < (VAMPIRE_FEED_TARGET_CD.get(targetKey) ?? 0)) return false;

  for (const session of VAMPIRE_FEED_ACTIVE.values()) {
    if (session.targetId === targetEntity.id) return false;
  }

  const target = feedingPlayer ? (resolvePlayerEntity(targetEntity) ?? targetEntity) : targetEntity;
  const anchor = target.location;
  const session = {
    targetId: target.id,
    tick: 0,
    maxTicks: VAMPIRE_FEED_TICKS,
    isPlayerTarget: feedingPlayer,
    healPerTick: VAMPIRE_FEED_TOTAL_HEAL / VAMPIRE_FEED_TICKS,
    hungerPerTick: VAMPIRE_FEED_TOTAL_HUNGER / VAMPIRE_FEED_TICKS,
    damagePerTick: (feedingPlayer ? VAMPIRE_FEED_PLAYER_DAMAGE_TOTAL : VAMPIRE_FEED_MOB_DAMAGE_TOTAL) / VAMPIRE_FEED_TICKS,
    healBank: 0,
    hungerBank: 0,
    damageBank: 0,
    anchorPos: { x: anchor.x, y: anchor.y, z: anchor.z },
    anchorYaw: 0,
    snapDir: null,
  };
  try {
    session.anchorYaw = target.getRotation?.()?.y ?? 0;
  } catch (_) {}

  VAMPIRE_FEED_ACTIVE.set(attacker.id, session);
  captureVampireFeedAnchor(target, session);
  holdVampireFeedTargetAtAnchor(target, session);
  snapVampireToFeedTarget(attacker, session, feedingPlayer);
  applyVampireFeedGrip(target, feedingPlayer);

  if (feedingPlayer) {
    try {
      target.sendMessage("§4Um vampiro se prende a você e drena seu sangue! §7(Agachar+Pular para se soltar)");
    } catch (_) {}
  }

  spawnVampireFeedFx(attacker, target, feedingPlayer);

  attacker.onScreenDisplay?.setActionBar?.("§4Você se prende e começa a se alimentar...");
  return true;
}

function tryVampireFeed(attacker, targetEntity) {
  startVampireFeed(attacker, targetEntity);
}

function onVampireFeedEntityDeath(deadEntity) {
  const deadId = deadEntity?.id;
  if (!deadId) return;

  if (VAMPIRE_FEED_ACTIVE.has(deadId)) {
    breakVampireFeed(deadId, "interrupted");
  }

  for (const [feederId, session] of [...VAMPIRE_FEED_ACTIVE.entries()]) {
    if (session.targetId !== deadId) continue;
    breakVampireFeed(feederId, "interrupted");
    try {
      const feeder = mc.world.getEntity(feederId);
      if (feeder instanceof mc.Player) {
        feeder.onScreenDisplay?.setActionBar?.("§8Feed interrupted.");
      }
    } catch (_) {}
  }
}

function onVampireFeedInterruptHurt(event) {
  const hurt = event.hurtEntity;
  if (!(hurt instanceof mc.Player) || !isVampireFeeding(hurt)) return;
  if ((event.damage ?? 0) <= 0) return;
  breakVampireFeed(hurt.id, "damaged");
}

function onVampireFeedInterruptHit(event) {
  const hit = event.hitEntity;
  if (!(hit instanceof mc.Player) || !isVampireFeeding(hit)) return;
  breakVampireFeed(hit.id, "damaged");
}

function clearPlayerBelongings(player) {
  try {
    const container = getPlayerInventoryContainer(player);
    if (container) {
      for (let slot = 0; slot < container.size; slot++) {
        try {
          container.setItem(slot, undefined);
        } catch (_) {}
      }
    }
  } catch (_) {}

  try {
    const equip = player.getComponent("minecraft:equippable");
    if (equip?.setEquipment) {
      for (const slot of ["Head", "Chest", "Legs", "Feet", "Offhand", "Mainhand"]) {
        try {
          equip.setEquipment(slot, undefined);
        } catch (_) {}
      }
    }
  } catch (_) {}

  try {
    player.runCommand("clear @s");
  } catch (_) {}
}

function finishVampireAscension(player) {
  if (!player?.isValid?.()) return;
  if (!VAMPIRE_TURN_PENDING.has(player.id)) return;
  VAMPIRE_TURN_PENDING.delete(player.id);
  setRace(player, VAMPIRE_RACE);
  player.sendMessage("§4Você se ergue do sacrifício, renascido como Vampiro.");
  player.runCommand(`title @s title §4§lReborn`);
  player.runCommand(`title @s subtitle §7A maldição vive em suas veias`);
}

function showVampireRitualConfirm(player) {
  mc.system.run(() => {
    const form = new MessageFormData()
      .title("§4Ritual Vampírico")
      .body("§7Crave a lâmina de sangue em si mesmo.\n\n§cAceite§7 e você morre: §8todos os seus pertences§7 serão sacrificados.\n§8Você se erguerá de novo como §4Vampiro§8.")
      .button1("§4Aceitar a maldição")
      .button2("§8§lRecusar a maldição");

    form.show(player).then((result) => {
      if (result.canceled || result.selection !== 0) {
        player.onScreenDisplay?.setActionBar?.("§8Você resiste à maldição... por enquanto.");
        return;
      }
      beginVampireTransformation(player);
    }).catch(() => {});
  });
}

function tryBeginVampireRitual(player, itemStack) {
  if ((itemStack?.typeId ?? "") !== RITUAL_DAGGER_ACTIVATED_ID) return false;
  if (!isAccursedPlayer(player)) {
    player.onScreenDisplay?.setActionBar?.("§8Só os Amaldiçoados podem atender a este chamado.");
    return true;
  }
  if (isVampirePlayer(player)) {
    player.onScreenDisplay?.setActionBar?.("§8Você já está condenado.");
    return true;
  }
  if ((getMainhandTool(player)?.typeId ?? "") !== RITUAL_DAGGER_ACTIVATED_ID) {
    player.onScreenDisplay?.setActionBar?.("§8Segure a adaga ativada na mão principal.");
    return true;
  }
  showVampireRitualConfirm(player);
  return true;
}

function beginVampireTransformation(player) {
  if (!isAccursedPlayer(player)) {
    player.sendMessage("§8Só os Amaldiçoados podem se tornar vampiros.");
    return;
  }
  if (isVampirePlayer(player)) return;
  if ((getMainhandTool(player)?.typeId ?? "") !== RITUAL_DAGGER_ACTIVATED_ID) {
    player.onScreenDisplay?.setActionBar?.("§8Você precisa segurar a adaga ativada.");
    return;
  }
  if (!consumeMainhandIfType(player, RITUAL_DAGGER_ACTIVATED_ID)) {
    player.onScreenDisplay?.setActionBar?.("§8A adaga de sangue escapa das suas mãos.");
    return;
  }

  clearPlayerBelongings(player);
  VAMPIRE_TURN_PENDING.add(player.id);

  player.sendMessage("§4A lâmina cobra o seu preço. Sua antiga vida termina.");
  player.runCommand(`title @s title §4§lA Queda`);
  player.runCommand(`title @s subtitle §7Tudo o que você foi é oferecido`);

  mc.system.runTimeout(() => {
    if (!player?.isValid?.()) return;
    if (!VAMPIRE_TURN_PENDING.has(player.id)) return;
    try {
      player.applyDamage(9999);
    } catch (_) {
      try {
        player.kill();
      } catch (_) {}
    }
  }, 40);
}

function getEnchantLevel(itemStack, enchantName) {
  if (!itemStack) return 0;
  try {
    const enchantable = itemStack.getComponent("minecraft:enchantable");
    const list = enchantable?.getEnchantments?.() ?? [];
    for (const e of list) {
      const id = String(e.type?.id ?? e.typeId ?? e.type ?? "").replace("minecraft:", "");
      if (id === enchantName) return e.level ?? 1;
    }
  } catch (_) {}
  return 0;
}

function rollFortuneMultiplier(fortuneLevel) {
  if (fortuneLevel <= 0) return 1;
  return 1 + Math.floor(Math.random() * (fortuneLevel + 1));
}

function rollOreDrops(family, fortuneLevel, silkTouch, blockTypeId) {
  if (silkTouch) return [{ id: blockTypeId, count: 1 }];

  const table = ORE_DROP_TABLE[family];
  if (!table) return [];

  if (family === "lapis_ore") {
    const base = 4 + Math.floor(Math.random() * 6);
    const bonus = fortuneLevel > 0 ? Math.floor(Math.random() * (fortuneLevel + 1)) : 0;
    return [{ id: table.id, count: base + bonus }];
  }

  if (family === "redstone_ore") {
    const base = 4 + Math.floor(Math.random() * 2);
    const bonus = fortuneLevel > 0 ? Math.floor(Math.random() * (fortuneLevel + 1)) : 0;
    return [{ id: table.id, count: base + bonus }];
  }

  if (family === "nether_gold_ore") {
    const base = 2 + Math.floor(Math.random() * 5);
    return [{ id: table.id, count: base * rollFortuneMultiplier(fortuneLevel) }];
  }

  if (family === "copper_ore") {
    const count = 2 + Math.floor(Math.random() * 4);
    return [{ id: table.id, count }];
  }

  const fortuneOres = new Set([
    "coal_ore", "diamond_ore", "emerald_ore", "nether_quartz_ore",
  ]);
  if (fortuneOres.has(family)) {
    return [{ id: table.id, count: rollFortuneMultiplier(fortuneLevel) }];
  }

  const count = table.min + Math.floor(Math.random() * (table.max - table.min + 1));
  return [{ id: table.id, count }];
}

function breakOreBlockFallback(dimension, player, block, family, blockTypeId, lx, ly, lz) {
  try {
    const tool = getMainhandTool(player);
    const fortune = getEnchantLevel(tool, "fortune");
    const silk = getEnchantLevel(tool, "silk_touch") > 0;
    const drops = rollOreDrops(family, fortune, silk, blockTypeId);
    block.setPermutation(BlockPermutation.resolve("minecraft:air"));
    for (const d of drops) {
      dimension.spawnItem(new ItemStack(d.id, d.count), { x: lx, y: ly, z: lz });
    }
    return true;
  } catch (_) {
    return false;
  }
}

function breakOreBlock(dimension, player, x, y, z) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);

  let block;
  try {
    block = dimension.getBlock({ x: ix, y: iy, z: iz });
  } catch (_) {
    return false;
  }
  if (!block || block.typeId === "minecraft:air") return false;

  const blockTypeId = block.typeId;
  const family = getOreFamily(blockTypeId);
  const lx = ix + 0.5;
  const ly = iy + 0.5;
  const lz = iz + 0.5;
  const clearCmd = `setblock ${ix} ${iy} ${iz} air`;

  // loot mine + mainhand uses the player's held tool (Fortune, Silk Touch, etc.)
  const lootAttempts = [
    () => {
      player.runCommand(`loot spawn ${lx} ${ly} ${lz} mine ${ix} ${iy} ${iz} mainhand`);
      player.runCommand(clearCmd);
    },
    () => {
      player.runCommand(`execute positioned ${ix} ${iy} ${iz} run loot spawn ~ ~ ~ mine ~ ~ ~ mainhand`);
      player.runCommand(clearCmd);
    },
    () => {
      dimension.runCommand(`loot spawn ${lx} ${ly} ${lz} mine ${ix} ${iy} ${iz} mainhand`);
      dimension.runCommand(clearCmd);
    },
  ];

  for (const attempt of lootAttempts) {
    try {
      attempt();
      return true;
    } catch (_) {}
  }

  return breakOreBlockFallback(dimension, player, block, family, blockTypeId, lx, ly, lz);
}

function isUnderground(player) {
  const dim = player.dimension;
  const x = Math.floor(player.location.x);
  const z = Math.floor(player.location.z);
  const headY = Math.floor(player.location.y) + 1;
  // Scan upward for a ceiling. A solid block overhead = enclosed/underground at any Y.
  // Tree canopy (leaves/logs) does not count, to avoid triggering on the surface.
  const SCAN_UP = 40;
  for (let dy = 1; dy <= SCAN_UP; dy++) {
    try {
      const block = dim.getBlock({ x, y: headY + dy, z });
      if (!block) continue;
      const id = block.typeId;
      if (id === "minecraft:air" || id === "minecraft:cave_air") continue;
      if (id.endsWith("_leaves") || id.endsWith("_log") || id.endsWith("_wood")) return false;
      return true;
    } catch (_) {}
  }
  return false;
}

function hasCarvedPumpkin(player) {
  try {
    const equip = player.getComponent("minecraft:equippable");
    if (!equip) return false;
    const head = equip.getEquipment("Head");
    const id = head?.typeId;
    return id === "minecraft:carved_pumpkin" || id === "minecraft:jack_o_lantern";
  } catch (_) {
    return false;
  }
}

function undeadProvokeKey(mobId, playerId) {
  return `${mobId}:${playerId}`;
}

function isUndeadMobProvoked(mobId, playerId) {
  const key = undeadProvokeKey(mobId, playerId);
  const expires = undeadProvoked.get(key);
  if (!expires) return false;
  if (Date.now() > expires) {
    undeadProvoked.delete(key);
    return false;
  }
  return true;
}

function markUndeadMobProvoked(mob, player) {
  undeadProvoked.set(
    undeadProvokeKey(mob.id, player.id),
    Date.now() + UNDEAD_PROVOKE_MS,
  );
}

function pacifyUndeadMob(mob) {
  for (const eventName of UNDEAD_CALM_EVENTS) {
    try {
      mob.triggerEvent(eventName);
    } catch (_) {}
  }
}

function pacifyIronGolem(golem) {
  for (const eventName of GOLEM_CALM_EVENTS) {
    try {
      golem.triggerEvent(eventName);
    } catch (_) {}
  }
}

function scareVillagersNear(player) {
  if (hasCarvedPumpkin(player)) return;

  const types = ["minecraft:villager_v2", "minecraft:villager", "minecraft:wandering_trader"];
  let villagers = [];
  for (const type of types) {
    try {
      villagers.push(...player.dimension.getEntities({
        location: player.location,
        maxDistance: 10,
        type,
      }));
    } catch (_) {}
  }

  for (const villager of villagers) {
    for (const eventName of VILLAGER_SCARE_EVENTS) {
      try {
        villager.triggerEvent(eventName);
      } catch (_) {}
    }
    try {
      villager.addEffect("speed", 30, { amplifier: 1, showParticles: false });
    } catch (_) {}
  }
}

function syncUndeadGolemTarget(player) {
  if (!player.hasTag("race_undead")) return;
  try {
    if (hasCarvedPumpkin(player)) {
      player.removeTag("dnd_golem_target");
    } else {
      player.addTag("dnd_golem_target");
    }
  } catch (_) {}
}

function pacifyNearbyIronGolems(player, range = GOLEM_PACIFY_RANGE) {
  let golems;
  try {
    golems = player.dimension.getEntities({
      location: player.location,
      maxDistance: range,
      type: "minecraft:iron_golem",
    });
  } catch (_) {
    return;
  }

  for (const golem of golems) {
    pacifyIronGolem(golem);
  }
}

function syncUndeadDisguise(player) {
  if (!player.hasTag("race_undead")) {
    undeadDisguiseState.delete(player.id);
    return;
  }
  const disguised = hasCarvedPumpkin(player);
  if (undeadDisguiseState.get(player.id) === disguised) return;
  undeadDisguiseState.set(player.id, disguised);
  try {
    player.triggerEvent(disguised ? "race:undead_set_disguised" : "race:undead_set_hunted");
  } catch (_) {}
}

function pacifyUndeadMobsNear(player) {
  let mobs;
  try {
    mobs = player.dimension.getEntities({
      location: player.location,
      maxDistance: 20,
      families: ["undead"],
    });
  } catch (_) {
    try {
      mobs = player.dimension.getEntities({
        location: player.location,
        maxDistance: 20,
      });
    } catch (_) {
      return;
    }
  }

  for (const mob of mobs) {
    if (mob.id === player.id) continue;
    if (!entityIsUndeadMob(mob)) continue;
    if (isUndeadMinion(mob.id)) continue;
    if (isUndeadMobProvoked(mob.id, player.id)) continue;
    pacifyUndeadMob(mob);
  }
}

function locationDistanceSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function locationHorizontalDistance(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

function locationHorizontalDistanceSq(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
}

function getUndeadMinionFollowSlot(owner, mob, standoff = UNDEAD_MINION_STANDOFF) {
  const oLoc = owner.location;
  const mLoc = mob.location;
  const dx = mLoc.x - oLoc.x;
  const dz = mLoc.z - oLoc.z;
  const horiz = Math.sqrt(dx * dx + dz * dz) || 1;
  return {
    x: oLoc.x + (dx / horiz) * standoff,
    y: oLoc.y,
    z: oLoc.z + (dz / horiz) * standoff,
  };
}

function getMobYawToward(from, to) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  if (dx * dx + dz * dz < 0.0004) return null;
  return Math.atan2(-dx, dz) * (180 / Math.PI);
}

function isMinionBlockingBlock(block) {
  if (!block) return false;
  try {
    if (block.isAir) return false;
    if (block.isLiquid) return false;
  } catch (_) {}
  const id = String(block.typeId ?? "");
  if (
    id.includes("torch")
    || id.includes("sign")
    || id.includes("flower")
    || id.includes("sapling")
    || id.includes("pressure_plate")
    || id.includes("button")
    || id.includes("carpet")
    || id.includes("rail")
    || id.includes("lever")
    || id.includes("banner")
  ) {
    return false;
  }
  return true;
}

function isMinionSpaceClearAt(dim, x, y, z) {
  const bx = Math.floor(x);
  const bz = Math.floor(z);
  const footY = Math.floor(y);
  for (let dy = 0; dy <= 1; dy++) {
    try {
      const block = dim.getBlock({ x: bx, y: footY + dy, z: bz });
      if (isMinionBlockingBlock(block)) return false;
    } catch (_) {
      return false;
    }
  }
  return true;
}

function canMinionStandAt(mob, pos) {
  const dim = mob.dimension;
  if (!isMinionSpaceClearAt(dim, pos.x, pos.y, pos.z)) return false;

  const bx = Math.floor(pos.x);
  const footY = Math.floor(pos.y);
  const bz = Math.floor(pos.z);
  try {
    const below = dim.getBlock({ x: bx, y: footY - 1, z: bz });
    if (isMinionBlockingBlock(below)) return true;
    const feet = dim.getBlock({ x: bx, y: footY, z: bz });
    return isMinionBlockingBlock(feet);
  } catch (_) {
    return true;
  }
}

function tryMinionStepTo(mob, next, yaw) {
  if (!canMinionStandAt(mob, next)) return false;
  try {
    return mob.tryTeleport(next, {
      rotation: { x: 0, y: yaw },
      keepVelocity: false,
      checkForBlocks: true,
    });
  } catch (_) {
    return false;
  }
}

function forwardFromYaw(yaw) {
  const rad = yaw * (Math.PI / 180);
  return { x: -Math.sin(rad), z: Math.cos(rad) };
}

function buildMinionStepPos(loc, forward, size, dy, urgent) {
  let y = loc.y;
  if (dy > 0.45) {
    y += Math.min(urgent ? 0.45 : 0.3, dy * 0.35);
  } else if (dy < -0.55) {
    y -= Math.min(urgent ? 0.35 : 0.25, Math.abs(dy) * 0.3);
  }
  return {
    x: loc.x + forward.x * size,
    y,
    z: loc.z + forward.z * size,
  };
}

function faceUndeadMinionToward(mob, targetLoc) {
  const yaw = getMobYawToward(mob.location, targetLoc);
  if (yaw == null) return null;

  try {
    mob.setRotation({ x: 0, y: yaw });
    return yaw;
  } catch (_) {}
  try {
    mob.lookAt({ x: targetLoc.x, y: targetLoc.y + 0.8, z: targetLoc.z });
    return getMobYawToward(mob.location, targetLoc);
  } catch (_) {}
  return yaw;
}

function nudgeUndeadMinionForward(mob, horizontal, lift = 0, yaw = null) {
  let fx;
  let fz;
  if (yaw != null) {
    const forward = forwardFromYaw(yaw);
    fx = forward.x;
    fz = forward.z;
  } else {
    fx = 0;
    fz = 1;
    try {
      const view = mob.getViewDirection();
      const horiz = Math.sqrt(view.x * view.x + view.z * view.z) || 1;
      fx = view.x / horiz;
      fz = view.z / horiz;
    } catch (_) {}
  }
  applyKnockbackCompat(mob, fx, fz, horizontal, lift);
}

function stepUndeadMinionToward(mob, targetLoc, distHoriz, urgent = false) {
  const loc = mob.location;
  const yaw = faceUndeadMinionToward(mob, targetLoc);
  if (yaw == null) return false;

  let step = urgent ? 0.52 : 0.4;
  if (distHoriz > 16) step = urgent ? 0.68 : 0.55;
  else if (distHoriz > 10) step = urgent ? 0.6 : 0.48;
  else if (distHoriz > 5) step = urgent ? 0.54 : 0.44;

  const forward = forwardFromYaw(yaw);
  const dy = targetLoc.y - loc.y;
  const stepSizes = [step, step * 0.65, step * 0.35];

  for (const size of stepSizes) {
    const next = buildMinionStepPos(loc, forward, size, dy, urgent);
    if (tryMinionStepTo(mob, next, yaw)) return true;

    const stepUp = { ...next, y: loc.y + 1.0 };
    if (dy > 0.4 && tryMinionStepTo(mob, stepUp, yaw)) return true;
  }

  nudgeUndeadMinionForward(mob, step * 0.45, dy > 1 ? 0.1 : 0.02, yaw);
  return false;
}

function applyUndeadMinionHaste(mob) {
  try {
    mob.addEffect("speed", 16, { amplifier: 0, showParticles: false });
  } catch (_) {}
}

function getMinionAmbientSound(minion) {
  const type = normalizeTypeId(minion?.typeId);
  if (type.includes("skeleton")) return "mob.skeleton.say";
  if (type.includes("drowned")) return "mob.drowned.say";
  if (type.includes("husk")) return "mob.husk.say";
  if (type.includes("phantom")) return "mob.phantom.flap";
  return "mob.zombie.say";
}

function tryMinionChatter(minion, urgent = false) {
  const now = Date.now();
  const cooldownMs = urgent ? 1600 : 3200;
  const readyAt = UNDEAD_MINION_CHATTER_CD.get(minion.id) ?? 0;
  if (now < readyAt) return;
  UNDEAD_MINION_CHATTER_CD.set(minion.id, now + cooldownMs);

  const sound = getMinionAmbientSound(minion);
  try {
    minion.dimension.playSound(sound, minion.location, {
      volume: urgent ? 0.9 : 0.6,
      pitch: urgent ? 0.78 : 0.92,
    });
  } catch (_) {}
}

function rallyUndeadMinion(mob, owner) {
  faceUndeadMinionToward(mob, owner.location);
  for (const eventName of [
    "minecraft:become_angry",
    "minecraft:on_anger",
    "minecraft:start_attack",
    "minecraft:become_hostile",
  ]) {
    try {
      mob.triggerEvent(eventName);
    } catch (_) {}
  }
  applyUndeadMinionHaste(mob);
  spawnUndeadBindFx(mob);
}

function steerUndeadMinionToward(mob, targetLoc, distHoriz, urgent = false) {
  applyUndeadMinionHaste(mob);
  if (stepUndeadMinionToward(mob, targetLoc, distHoriz, urgent)) return;

  const dy = targetLoc.y - mob.location.y;
  const yaw = getMobYawToward(mob.location, targetLoc);
  if (yaw == null) return;

  let horizontal = urgent ? 0.34 : 0.26;
  if (distHoriz > 14) horizontal = urgent ? 0.48 : 0.38;
  else if (distHoriz > 8) horizontal = urgent ? 0.4 : 0.32;

  nudgeUndeadMinionForward(mob, horizontal, dy > 1.5 ? 0.14 : 0.04, yaw);
}

function catchUpUndeadMinion(mob, owner) {
  const now = Date.now();
  const readyAt = UNDEAD_MINION_CATCHUP_CD.get(mob.id) ?? 0;
  if (now < readyAt) return false;

  const distHoriz = locationHorizontalDistance(mob.location, owner.location);
  let moved = false;
  for (let i = 0; i < 2; i++) {
    if (stepUndeadMinionToward(mob, owner.location, distHoriz, true)) {
      moved = true;
    }
  }

  if (moved) {
    UNDEAD_MINION_CATCHUP_CD.set(mob.id, now + 700);
    faceUndeadMinionToward(mob, owner.location);
    applyUndeadMinionHaste(mob);
    tryMinionChatter(mob, true);
  }
  return moved;
}

function isUndeadMinion(mobId) {
  return UNDEAD_MINIONS.has(mobId);
}

function getUndeadMinionOwnerId(mobId) {
  return UNDEAD_MINIONS.get(mobId)?.ownerId ?? null;
}

function isUndeadMinionBindable(entity) {
  if (!entity) return false;
  if (entity.typeId === "minecraft:player") return false;
  if (isUndeadRacePlayer(entity)) return false;

  const typeId = normalizeTypeId(entity.typeId);
  if (typeId === "minecraft:wither") return false;
  if (UNDEAD_BINDABLE_MOB_TYPES.has(typeId)) return true;
  return entityIsUndeadMob(entity);
}

function formatUndeadMobLabel(entity) {
  return normalizeTypeId(entity?.typeId).replace("minecraft:", "").replace(/_/g, " ");
}

function getUndeadMinionCount(ownerId) {
  return UNDEAD_MINION_BY_OWNER.get(ownerId)?.size ?? 0;
}

function addUndeadMinionToOwner(ownerId, mobId) {
  let set = UNDEAD_MINION_BY_OWNER.get(ownerId);
  if (!set) {
    set = new Set();
    UNDEAD_MINION_BY_OWNER.set(ownerId, set);
  }
  set.add(mobId);
}

function removeUndeadMinionFromOwner(ownerId, mobId) {
  const set = UNDEAD_MINION_BY_OWNER.get(ownerId);
  if (!set) return;
  set.delete(mobId);
  if (set.size === 0) UNDEAD_MINION_BY_OWNER.delete(ownerId);
}

function getUndeadMinionBindCooldownRemaining(playerId) {
  const readyAt = UNDEAD_MINION_BIND_CD.get(playerId) ?? 0;
  const remaining = readyAt - Date.now();
  return remaining > 0 ? remaining : 0;
}

function spawnUndeadBindFx(entity) {
  const dim = entity.dimension;
  const loc = entity.location;
  for (let i = 0; i < 6; i++) {
    spawnParticleSafe(dim, "minecraft:basic_smoke_particle", {
      x: loc.x + (Math.random() - 0.5) * 0.8,
      y: loc.y + 1.0 + Math.random() * 0.6,
      z: loc.z + (Math.random() - 0.5) * 0.8,
    });
  }
  spawnParticleSafe(dim, "minecraft:endrod", { x: loc.x, y: loc.y + 1.4, z: loc.z });
}

function minionUsesRangedAttacks(minion) {
  const type = normalizeTypeId(minion?.typeId);
  return type.includes("skeleton") || type === "minecraft:bogged" || type === "minecraft:phantom";
}

function getMinionMeleeDamage(minion) {
  const type = normalizeTypeId(minion?.typeId);
  if (type === "minecraft:wither_skeleton") return 5;
  if (type.includes("skeleton")) return 2;
  if (type === "minecraft:zoglin") return 4;
  return 3;
}

function getEntityDamageCauseEntityAttack() {
  return mc.EntityDamageCause?.entityAttack ?? "entityAttack";
}

function getEntityDamageCauseFire() {
  return mc.EntityDamageCause?.fire
    ?? mc.EntityDamageCause?.fireTick
    ?? "fire";
}

function tryAngerMinionAt(minion, target) {
  const angerEvents = [
    "minecraft:on_anger",
    "minecraft:become_angry",
    "minecraft:start_attack",
    "minecraft:become_hostile",
    "minecraft:change_to_angry",
  ];
  for (const eventName of angerEvents) {
    try {
      minion.triggerEvent(eventName);
    } catch (_) {}
  }
  faceUndeadMinionToward(minion, target.location);
}

function tryProvokeMinionAt(minion, target) {
  tryAngerMinionAt(minion, target);

  const now = Date.now();
  const readyAt = UNDEAD_MINION_PROVOKE_CD.get(minion.id) ?? 0;
  if (now < readyAt) return;
  UNDEAD_MINION_PROVOKE_CD.set(minion.id, now + 320);

  const cause = getEntityDamageCauseEntityAttack();
  // Fake hit from the target makes the minion retaliate against them (Bedrock aggro).
  try {
    minion.applyDamage(0, { cause, damagingEntity: target });
  } catch (_) {}
}

function tryMinionMeleeStrike(minion, target) {
  if (minionUsesRangedAttacks(minion)) return false;

  const now = Date.now();
  const readyAt = UNDEAD_MINION_STRIKE_CD.get(minion.id) ?? 0;
  if (now < readyAt) return false;
  if (locationDistanceSq(minion.location, target.location) > 9) return false;

  UNDEAD_MINION_STRIKE_CD.set(minion.id, now + 700);

  const dim = minion.dimension;
  const tLoc = target.location;
  spawnParticleSafe(dim, "minecraft:critical_hit_emitter", {
    x: tLoc.x,
    y: tLoc.y + 1.0,
    z: tLoc.z,
  });
  try {
    dim.playSound("mob.zombie.attack_wooden_door", minion.location, {
      volume: 0.55,
      pitch: 0.85,
    });
  } catch (_) {}

  try {
    target.applyDamage(getMinionMeleeDamage(minion), {
      cause: getEntityDamageCauseEntityAttack(),
      damagingEntity: minion,
    });
    return true;
  } catch (_) {
    try {
      target.applyDamage(getMinionMeleeDamage(minion));
      return true;
    } catch (_) {}
  }
  return false;
}

function shouldCommandUndeadMinionsAgainst(attacker, target) {
  if (!isUndeadRacePlayer(attacker) || !target?.isValid?.()) return false;
  if (target.id === attacker.id) return false;
  if (isUndeadMinion(target.id) && getUndeadMinionOwnerId(target.id) === attacker.id) return false;
  if (isUndeadMinionBindable(target) && !isUndeadMinion(target.id)) return false;
  return true;
}

function releaseUndeadMinion(mobId, ownerHint = null) {
  UNDEAD_MINIONS.delete(mobId);
  UNDEAD_MINION_ATTACK.delete(mobId);
  UNDEAD_MINION_CATCHUP_CD.delete(mobId);
  UNDEAD_MINION_PROVOKE_CD.delete(mobId);
  UNDEAD_MINION_STRIKE_CD.delete(mobId);
  UNDEAD_MINION_CHATTER_CD.delete(mobId);

  for (const [ownerId, mobIds] of [...UNDEAD_MINION_BY_OWNER.entries()]) {
    if (mobIds.has(mobId)) {
      removeUndeadMinionFromOwner(ownerId, mobId);
      if (ownerHint && ownerId === ownerHint.id && getUndeadMinionCount(ownerId) === 0) {
        UNDEAD_MINION_OWNER_TARGET.delete(ownerId);
      }
      break;
    }
  }

  try {
    const mob = mc.world.getEntity(mobId);
    if (mob?.isValid?.()) {
      pacifyUndeadMob(mob);
      try {
        mob.removeTag(UNDEAD_MINION_ATTACK_TAG);
      } catch (_) {}
    }
  } catch (_) {}
}

function releaseAllUndeadMinions(owner, silent = false) {
  const mobIds = UNDEAD_MINION_BY_OWNER.get(owner.id);
  if (!mobIds || mobIds.size === 0) return;

  for (const mobId of [...mobIds]) {
    releaseUndeadMinion(mobId, owner);
  }
  UNDEAD_MINION_OWNER_TARGET.delete(owner.id);
  if (!silent) {
    owner.onScreenDisplay?.setActionBar?.("§8Seus lacaios vinculados foram libertados.");
  }
}

function tryBindUndeadMinion(player, mob) {
  if (!isUndeadRacePlayer(player) || !isUndeadMinionBindable(mob)) return false;
  if (mob.id === player.id) return false;

  const existingOwner = getUndeadMinionOwnerId(mob.id);
  if (existingOwner && existingOwner !== player.id) {
    player.onScreenDisplay?.setActionBar?.("§8Esse morto-vivo já serve a outro.");
    return false;
  }
  if (existingOwner === player.id) {
    player.onScreenDisplay?.setActionBar?.("§8Já está vinculado a você.");
    return false;
  }

  const distSq = locationDistanceSq(player.location, mob.location);
  if (distSq > UNDEAD_MINION_BIND_RANGE * UNDEAD_MINION_BIND_RANGE) {
    player.onScreenDisplay?.setActionBar?.("§8Longe demais para vincular esse morto-vivo.");
    return false;
  }

  const cdRemaining = getUndeadMinionBindCooldownRemaining(player.id);
  if (cdRemaining > 0) {
    player.onScreenDisplay?.setActionBar?.(
      `§8Bind recharging... ${formatCooldownMinutesSeconds(cdRemaining)}`,
    );
    return false;
  }

  if (getUndeadMinionCount(player.id) >= UNDEAD_MINION_MAX) {
    player.onScreenDisplay?.setActionBar?.(`§8Limite de lacaios atingido (${UNDEAD_MINION_MAX}). Agache e solte Carne Podre num lacaio para libertá-lo.`);
    return false;
  }

  UNDEAD_MINIONS.set(mob.id, { ownerId: player.id, boundAt: Date.now() });
  addUndeadMinionToOwner(player.id, mob.id);
  UNDEAD_MINION_BIND_CD.set(player.id, Date.now() + UNDEAD_MINION_BIND_CD_MS);
  rallyUndeadMinion(mob, player);
  try {
    mob.addTag(UNDEAD_MINION_ATTACK_TAG);
  } catch (_) {}

  const label = formatUndeadMobLabel(mob);
  const count = getUndeadMinionCount(player.id);
  player.sendMessage(`§8Você submete o(a) ${label} à sua vontade. (${count}/${UNDEAD_MINION_MAX})`);
  player.onScreenDisplay?.setActionBar?.(`§8Bound: ${label} (${count}/${UNDEAD_MINION_MAX})`);
  return true;
}

function commandUndeadMinionsAttack(owner, target) {
  if (!shouldCommandUndeadMinionsAgainst(owner, target)) return;

  const mobIds = UNDEAD_MINION_BY_OWNER.get(owner.id);
  if (!mobIds || mobIds.size === 0) return;

  UNDEAD_MINION_OWNER_TARGET.set(owner.id, target.id);
  for (const mobId of mobIds) {
    UNDEAD_MINION_ATTACK.set(mobId, target.id);
    UNDEAD_MINION_PROVOKE_CD.delete(mobId);
    try {
      const minion = mc.world.getEntity(mobId);
      if (minion?.isValid?.()) {
        tryProvokeMinionAt(minion, target);
        tryMinionChatter(minion, true);
      }
    } catch (_) {}
  }

  owner.onScreenDisplay?.setActionBar?.("§8Os mortos vinculados se voltam contra seu inimigo.");
}

function syncUndeadMinions() {
  const now = Date.now();
  const followRangeSq = UNDEAD_MINION_FOLLOW_RANGE * UNDEAD_MINION_FOLLOW_RANGE;
  const attackLeashSq = (UNDEAD_MINION_FOLLOW_RANGE - 4) * (UNDEAD_MINION_FOLLOW_RANGE - 4);

  for (const [mobId, data] of [...UNDEAD_MINIONS.entries()]) {
    let mob;
    let owner;
    try {
      mob = mc.world.getEntity(mobId);
      owner = mc.world.getEntity(data.ownerId);
    } catch (_) {
      releaseUndeadMinion(mobId);
      continue;
    }

    if (!mob?.isValid?.()) {
      releaseUndeadMinion(mobId);
      continue;
    }

    if (!owner?.isValid?.() || !owner.hasTag("race_undead")) {
      releaseUndeadMinion(mobId, owner ?? null);
      continue;
    }

    if (now - data.boundAt > UNDEAD_MINION_LIFETIME_MS) {
      releaseUndeadMinion(mobId, owner);
      owner.onScreenDisplay?.setActionBar?.("§8A bound minion's grip fades...");
      continue;
    }

    const distHoriz = locationHorizontalDistance(mob.location, owner.location);
    const distHorizSq = distHoriz * distHoriz;
    if (distHorizSq > followRangeSq) {
      releaseUndeadMinion(mobId, owner);
      owner.onScreenDisplay?.setActionBar?.("§8Um lacaio se afastou demais e se libertou.");
      continue;
    }

    const attackTargetId = UNDEAD_MINION_ATTACK.get(mobId) ?? UNDEAD_MINION_OWNER_TARGET.get(data.ownerId);
    if (attackTargetId) {
      let attackTarget;
      try {
        attackTarget = mc.world.getEntity(attackTargetId);
      } catch (_) {
        attackTarget = null;
      }

      if (attackTarget?.isValid?.()) {
        const toOwnerSq = locationHorizontalDistanceSq(mob.location, owner.location);
        const toTargetHoriz = locationHorizontalDistance(mob.location, attackTarget.location);

        if (toOwnerSq > attackLeashSq) {
          UNDEAD_MINION_ATTACK.delete(mobId);
        } else {
          tryProvokeMinionAt(mob, attackTarget);
          tryMinionChatter(mob, toTargetHoriz < 10);

          if (toTargetHoriz > 2.8) {
            steerUndeadMinionToward(mob, attackTarget.location, toTargetHoriz, true);
          } else {
            faceUndeadMinionToward(mob, attackTarget.location);
            tryMinionMeleeStrike(mob, attackTarget);
          }
          continue;
        }
      } else {
        UNDEAD_MINION_ATTACK.delete(mobId);
      }
    }

    const followSlot = getUndeadMinionFollowSlot(owner, mob);
    if (distHoriz <= UNDEAD_MINION_WANDER_RANGE) {
      continue;
    }

    if (distHoriz > UNDEAD_MINION_CATCHUP_RANGE) {
      if (!catchUpUndeadMinion(mob, owner)) {
        steerUndeadMinionToward(mob, followSlot, distHoriz, false);
      }
      tryMinionChatter(mob, false);
      continue;
    }

    steerUndeadMinionToward(mob, followSlot, distHoriz, false);
  }
}

function isRottenFleshItemEntity(entity) {
  if (!entity || entity.typeId !== "minecraft:item") return false;
  try {
    const stack = entity.getComponent("minecraft:item")?.itemStack;
    return normalizeTypeId(stack?.typeId) === UNDEAD_BIND_ITEM;
  } catch (_) {
    return false;
  }
}

function removeItemEntity(entity) {
  try {
    UNDEAD_FLESH_SEEN.delete(entity.id);
    entity.remove();
  } catch (_) {}
}

function getFleshOfferAgeMs(itemEntity) {
  const id = itemEntity.id;
  const now = Date.now();
  if (!UNDEAD_FLESH_SEEN.has(id)) UNDEAD_FLESH_SEEN.set(id, now);
  return now - UNDEAD_FLESH_SEEN.get(id);
}

function mobCanAcceptFleshOffer(mob, itemLoc, offeringPlayer) {
  if (!isUndeadMinionBindable(mob)) return false;
  if (mob.id === offeringPlayer.id) return false;

  const mobDistSq = locationDistanceSq(mob.location, itemLoc);
  const acceptSq = UNDEAD_FLESH_ACCEPT_RANGE * UNDEAD_FLESH_ACCEPT_RANGE;
  if (mobDistSq > acceptSq) return false;

  const playerDistSq = locationDistanceSq(offeringPlayer.location, itemLoc);
  return mobDistSq < playerDistSq;
}

function isPlayerSneaking(player) {
  return !!(player?.isSneaking || sneakTracked.get(player?.id));
}

function findNearestOwnedMinionNear(owner, loc, range) {
  const mobIds = UNDEAD_MINION_BY_OWNER.get(owner.id);
  if (!mobIds || mobIds.size === 0) return null;

  let best = null;
  let bestSq = range * range;
  for (const mobId of mobIds) {
    let mob;
    try {
      mob = mc.world.getEntity(mobId);
    } catch (_) {
      continue;
    }
    if (!mob?.isValid?.()) continue;
    const sq = locationDistanceSq(mob.location, loc);
    if (sq <= bestSq) {
      bestSq = sq;
      best = mob;
    }
  }
  return best;
}

function findNearestBindableMobNear(dimension, loc, range, offeringPlayer) {
  let best = null;
  let bestSq = range * range;
  let entities;
  try {
    entities = dimension.getEntities({ location: loc, maxDistance: range });
  } catch (_) {
    return null;
  }

  for (const entity of entities) {
    if (!mobCanAcceptFleshOffer(entity, loc, offeringPlayer)) continue;
    if (isUndeadMinion(entity.id)) continue;
    const sq = locationDistanceSq(entity.location, loc);
    if (sq <= bestSq) {
      bestSq = sq;
      best = entity;
    }
  }
  return best;
}

function findUndeadPlayerNearLocation(dimension, loc, maxDist) {
  let best = null;
  let bestSq = maxDist * maxDist;
  for (const player of dimension.getPlayers()) {
    if (!player.hasTag("race_undead")) continue;
    const sq = locationDistanceSq(player.location, loc);
    if (sq <= bestSq) {
      bestSq = sq;
      best = player;
    }
  }
  return best;
}

function releaseUndeadMinionWithFeedback(player, mob) {
  releaseUndeadMinion(mob.id, player);
  const count = getUndeadMinionCount(player.id);
  player.onScreenDisplay?.setActionBar?.(`§8Minion released. (${count}/${UNDEAD_MINION_MAX})`);
}

function tryUndeadFleshOffer(player, mob, itemEntity) {
  if (isPlayerSneaking(player) && getUndeadMinionOwnerId(mob.id) === player.id) {
    releaseUndeadMinionWithFeedback(player, mob);
    removeItemEntity(itemEntity);
    return true;
  }

  if (tryBindUndeadMinion(player, mob)) {
    removeItemEntity(itemEntity);
    return true;
  }
  return false;
}

function tryUndeadFleshReleaseNearDrop(player, itemEntity) {
  if (!isPlayerSneaking(player)) return false;
  if (getUndeadMinionCount(player.id) <= 0) return false;

  const ownedMinion = findNearestOwnedMinionNear(
    player,
    itemEntity.location,
    UNDEAD_MINION_RELEASE_RANGE,
  );
  if (!ownedMinion) return false;

  releaseUndeadMinionWithFeedback(player, ownedMinion);
  removeItemEntity(itemEntity);
  return true;
}

function syncUndeadFleshOffers() {
  for (const player of mc.world.getAllPlayers()) {
    if (!player.hasTag("race_undead")) continue;

    let itemEntities;
    try {
      itemEntities = player.dimension.getEntities({
        location: player.location,
        maxDistance: UNDEAD_FLESH_OFFER_RANGE,
        type: "minecraft:item",
      });
    } catch (_) {
      continue;
    }

    for (const itemEntity of itemEntities) {
      if (!isRottenFleshItemEntity(itemEntity)) continue;
      if (getFleshOfferAgeMs(itemEntity) < UNDEAD_FLESH_MIN_AGE_MS) continue;

      if (tryUndeadFleshReleaseNearDrop(player, itemEntity)) break;

      if (isPlayerSneaking(player)) continue;

      const mob = findNearestBindableMobNear(
        player.dimension,
        itemEntity.location,
        UNDEAD_FLESH_ACCEPT_RANGE,
        player,
      );
      if (!mob) continue;

      if (tryUndeadFleshOffer(player, mob, itemEntity)) break;
    }
  }

  if (UNDEAD_FLESH_SEEN.size > 64) {
    UNDEAD_FLESH_SEEN.clear();
  }
}

function onUndeadFleshPickupBefore(event) {
  const picker = event.entity;
  if (!isRottenFleshItemEntity(event.item)) return;

  // Undead players must not vacuum their own offerings — leave flesh for mobs.
  if (picker instanceof mc.Player && picker.hasTag("race_undead")) {
    event.cancel = true;
    return;
  }

  if (!isUndeadMinionBindable(picker)) return;

  const owner = findUndeadPlayerNearLocation(
    picker.dimension,
    picker.location,
    UNDEAD_FLESH_OFFER_RANGE,
  );
  if (!owner) return;
  if (!mobCanAcceptFleshOffer(picker, event.item.location, owner)) return;

  event.cancel = true;
  const mobRef = picker;
  const ownerRef = owner;
  const itemRef = event.item;
  mc.system.run(() => tryUndeadFleshOffer(ownerRef, mobRef, itemRef));
}

function clearUndeadMinionStateForPlayer(playerId) {
  UNDEAD_MINION_BIND_CD.delete(playerId);
  UNDEAD_MINION_OWNER_TARGET.delete(playerId);

  const mobIds = UNDEAD_MINION_BY_OWNER.get(playerId);
  if (mobIds) {
    for (const mobId of [...mobIds]) {
      UNDEAD_MINIONS.delete(mobId);
      UNDEAD_MINION_ATTACK.delete(mobId);
      UNDEAD_MINION_CATCHUP_CD.delete(mobId);
      UNDEAD_MINION_PROVOKE_CD.delete(mobId);
      UNDEAD_MINION_STRIKE_CD.delete(mobId);
      UNDEAD_MINION_CHATTER_CD.delete(mobId);
    }
    UNDEAD_MINION_BY_OWNER.delete(playerId);
  }
}

function clearUndeadPlayerState(player) {
  undeadDisguiseState.delete(player.id);
  try {
    player.removeTag("dnd_golem_target");
  } catch (_) {}
  for (const key of [...undeadProvoked.keys()]) {
    if (key.endsWith(`:${player.id}`)) undeadProvoked.delete(key);
  }
  releaseAllUndeadMinions(player, true);
  clearUndeadMinionStateForPlayer(player.id);
}

function getDamageAttacker(damageSource) {
  if (!damageSource) return null;
  try {
    return damageSource.damagingEntity ?? null;
  } catch (_) {
    return null;
  }
}

function isVillagerTrader(entity) {
  if (!entity) return false;
  const id = entity.typeId ?? "";
  return id === "minecraft:villager"
    || id === "minecraft:villager_v2"
    || id.startsWith("minecraft:villager_v2<");
}

function blockUndeadVillagerTrade(player, target) {
  return player.hasTag("race_undead") && isVillagerTrader(target);
}

function notifyUndeadTradeRefused(player) {
  player.sendMessage("§8O aldeão recua e se recusa a negociar com você.");
  player.onScreenDisplay?.setActionBar?.("§8Os aldeões rejeitam sua presença.");
}

function normalizeTypeId(typeId) {
  const id = String(typeId ?? "");
  if (!id) return "";
  const base = id.split("<")[0];
  return base.startsWith("minecraft:") ? base : `minecraft:${base}`;
}

function isUndeadMob(typeId) {
  return UNDEAD_MOB_TYPES.has(normalizeTypeId(typeId));
}

function isUndeadRacePlayer(entity) {
  try {
    return entity?.typeId === "minecraft:player" && entity.hasTag("race_undead");
  } catch (_) {
    return false;
  }
}

function entityIsUndeadMob(entity) {
  if (!entity) return false;
  if (entity.typeId === "minecraft:player") return false;
  if (isUndeadMob(entity.typeId)) return true;
  try {
    return entity.getComponent("minecraft:type_family")?.hasTypeFamily("undead") ?? false;
  } catch (_) {
    return false;
  }
}

function getUndeadMobAttacker(damageSource, victim) {
  if (!damageSource) return null;

  const candidates = [];
  try {
    if (damageSource.damagingEntity) candidates.push(damageSource.damagingEntity);
  } catch (_) {}
  try {
    const projectile = damageSource.damagingProjectile;
    if (projectile?.owner) candidates.push(projectile.owner);
  } catch (_) {}

  for (const entity of candidates) {
    if (entityIsUndeadMob(entity)) return entity;
  }

  // Fallback: melee/projectile hit with missing source but undead mob adjacent
  if (victim) {
    try {
      const cause = String(damageSource.cause ?? "");
      const combatHit = cause.includes("entity_attack") || cause.includes("projectile");
      if (!combatHit) return null;

      const nearby = victim.dimension.getEntities({
        location: victim.location,
        maxDistance: 3,
      });
      for (const entity of nearby) {
        if (entityIsUndeadMob(entity)) return entity;
      }
    } catch (_) {}
  }

  return null;
}

function restoreGraveBoundHealth(player, damage) {
  if (!damage || damage <= 0) return;
  healPlayerWithinRaceCap(player, getRace(player), damage);
}

function getUndeadUndyingCooldownRemaining(playerId) {
  const readyAt = UNDEAD_UNDYING_COOLDOWNS.get(playerId) ?? 0;
  const remaining = readyAt - Date.now();
  return remaining > 0 ? remaining : 0;
}

function formatCooldownMinutesSeconds(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

function startUndeadUndyingCooldown(playerId) {
  UNDEAD_UNDYING_COOLDOWNS.set(playerId, Date.now() + UNDEAD_UNDYING_CD_MS);
}

function syncUndeadSaturation(player) {
  if (!player.hasTag("race_undead")) return;

  try {
    player.addEffect("saturation", 400, { amplifier: 0, showParticles: false });
  } catch (_) {}

  try {
    const hunger = player.getComponent("minecraft:player.hunger");
    if (hunger && hunger.currentValue < hunger.effectiveMax) {
      hunger.setCurrentValue(hunger.effectiveMax);
    }
  } catch (_) {}
}

function endUndeadUndyingGrasp(player) {
  UNDEAD_UNDYING_GRASP.delete(player.id);
  try {
    player.removeEffect("regeneration");
    player.removeEffect("absorption");
  } catch (_) {}
}

function syncUndeadUndying(player) {
  if (!player.hasTag("race_undead")) {
    UNDEAD_UNDYING_GRASP.delete(player.id);
    return;
  }

  try {
    const health = player.getComponent("minecraft:health");
    if (!health) return;

    const current = health.currentValue;
    const healTarget = Math.min(getRaceMaxHealth(getRace(player)), UNDEAD_UNDYING_HEAL_TARGET);

    if (current <= UNDEAD_UNDYING_LOW_HP) {
      const cdRemaining = getUndeadUndyingCooldownRemaining(player.id);
      if (cdRemaining > 0) {
        player.onScreenDisplay?.setActionBar?.(
          `§8Undying recharging... ${formatCooldownMinutesSeconds(cdRemaining)}`,
        );
        return;
      }

      if (!UNDEAD_UNDYING_GRASP.has(player.id)) {
        startUndeadUndyingCooldown(player.id);
      }
      UNDEAD_UNDYING_GRASP.add(player.id);
      player.onScreenDisplay?.setActionBar?.("§8Imortal: você se recusa a cair...");
    }

    if (!UNDEAD_UNDYING_GRASP.has(player.id)) return;

    if (current >= healTarget) {
      endUndeadUndyingGrasp(player);
      return;
    }

    player.addEffect("regeneration", 80, { amplifier: 0, showParticles: false });
    player.addEffect("absorption", 80, { amplifier: 0, showParticles: false });
  } catch (_) {}
}

function mineOreVein(player, origin, oreFamily) {
  const dim = player.dimension;
  const sx = Math.floor(origin.x);
  const sy = Math.floor(origin.y);
  const sz = Math.floor(origin.z);
  const visited = new Set();
  const queue = [];

  // The broken block is already air — seed BFS from its neighbors
  for (const [dx, dy, dz] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]) {
    queue.push({ x: sx + dx, y: sy + dy, z: sz + dz });
  }

  let mined = 1; // includes the block the player just broke

  while (queue.length > 0 && mined < VEIN_MINE_MAX) {
    const pos = queue.shift();
    const key = blockPosKey(pos.x, pos.y, pos.z);
    if (visited.has(key)) continue;
    visited.add(key);

    let block;
    try {
      block = dim.getBlock(pos);
    } catch (_) {
      continue;
    }
    if (!block || getOreFamily(block.typeId) !== oreFamily) continue;

    if (!breakOreBlock(dim, player, pos.x, pos.y, pos.z)) continue;
    mined++;

    for (const [dx, dy, dz] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]) {
      queue.push({ x: pos.x + dx, y: pos.y + dy, z: pos.z + dz });
    }
  }

  if (mined > 1) {
    spawnVeinMineConfirm(player, { x: sx, y: sy, z: sz });
    player.onScreenDisplay?.setActionBar?.(`§6Sua Força Bruta minerou ${mined} blocos`);
  }
}

function spawnVeinMineConfirm(player, origin) {
  const dim = player.dimension;
  const cx = origin.x + 0.5;
  const cy = origin.y + 0.5;
  const cz = origin.z + 0.5;

  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const r = 0.55;
    spawnParticleSafe(dim, "minecraft:basic_crit_particle", {
      x: cx + Math.cos(angle) * r,
      y: cy + 0.25,
      z: cz + Math.sin(angle) * r,
    });
  }

  for (let i = 0; i < 8; i++) {
    spawnParticleSafe(dim, "minecraft:basic_smoke_particle", {
      x: cx + (Math.random() - 0.5) * 0.5,
      y: cy + i * 0.15,
      z: cz + (Math.random() - 0.5) * 0.5,
    });
  }
}

function spawnParticleSafe(dimension, particleId, location) {
  try {
    dimension.spawnParticle(particleId, location);
  } catch (_) {}
}

function markHellfireVictim(entity, tiefling) {
  if (!entity || entity.id === tiefling.id) return;
  HELLFIRE_VICTIMS.set(entity.id, {
    tieflingId: tiefling.id,
    expiresMs: Date.now() + HELLFIRE_MARK_MS,
  });
}

function healTieflingSoulFeast(tiefling) {
  try {
    const health = tiefling.getComponent("minecraft:health");
    if (!health) return;
    const max = getRaceMaxHealth(getRace(tiefling));
    const next = Math.min(max, health.currentValue + HELLFIRE_HEAL_AMOUNT);
    if (next <= health.currentValue) return;
    health.setCurrentValue(next);
    tiefling.onScreenDisplay?.setActionBar?.("§4Soul Feast - +2 hearts");
  } catch (_) {}
}

function findTieflingPlayer(playerId) {
  for (const player of mc.world.getAllPlayers()) {
    if (player.id === playerId && player.hasTag("race_tiefling")) return player;
  }
  return null;
}

function onHellfireVictimDeath(deadEntity) {
  const mark = HELLFIRE_VICTIMS.get(deadEntity.id);
  HELLFIRE_VICTIMS.delete(deadEntity.id);
  if (!mark || Date.now() > mark.expiresMs) return;

  const tiefling = findTieflingPlayer(mark.tieflingId);
  if (!tiefling) return;

  healTieflingSoulFeast(tiefling);
}

function normalizePotionTypeId(value) {
  return String(value?.id ?? value?.typeId ?? value ?? "").toLowerCase();
}

function isWaterBottleItem(itemStack) {
  if (!itemStack) return false;
  const typeId = itemStack.typeId ?? "";
  if (typeId === "minecraft:glass_bottle") return true;
  if (typeId !== "minecraft:potion") return false;

  try {
    const potion = itemStack.getComponent("minecraft:potion");
    if (!potion) return true;

    try {
      const deliveryId = normalizePotionTypeId(potion.potionDeliveryType);
      if (deliveryId.includes("splash") || deliveryId.includes("lingering")) {
        return false;
      }
    } catch (_) {}

    try {
      const effectId = normalizePotionTypeId(potion.potionEffectType);
      if (!effectId || effectId === "undefined" || effectId === "null") return true;
      return (
        effectId === "minecraft:water"
        || effectId === "water"
        || effectId.endsWith(":water")
      );
    } catch (_) {
      // Bedrock throws when reading potionEffectType on plain water bottles.
      return true;
    }
  } catch (_) {
    return true;
  }
}

function markSirenWaterDrink(player, itemStack) {
  if (!player?.hasTag?.("race_siren")) return;
  if (!isWaterBottleItem(itemStack)) return;
  SIREN_WATER_DRINK_PENDING.add(player.id);
}

function tryHydrateSirenFromDrink(player, itemStack) {
  if (!player?.hasTag?.("race_siren")) return;

  const pending = SIREN_WATER_DRINK_PENDING.delete(player.id);
  const consumedWater = pending || isWaterBottleItem(itemStack);
  if (!consumedWater) return;

  mc.system.run(() => hydrateSiren(player));
}

function clearSirenDryEffects(player) {
  try {
    player.removeEffect("weakness");
    player.removeEffect("slowness");
    player.removeEffect("mining_fatigue");
  } catch (_) {}
}

function hydrateSiren(player, silent = false) {
  if (!player?.isValid?.() || !player.hasTag?.("race_siren")) return;
  SIREN_LAND_MS.set(player.id, 0);
  const wasDry = SIREN_DRIED_OUT.delete(player.id);
  clearSirenDryEffects(player);
  if (!silent && wasDry) {
    player.sendMessage("§3A água penetra suas escamas e você se sente restaurado.");
  }
  player.onScreenDisplay?.setActionBar?.("§3Hydrated");
}

function applySirenDryEffects(player) {
  try {
    player.addEffect("weakness", 80, { amplifier: 0, showParticles: true });
    player.addEffect("slowness", 80, { amplifier: 1, showParticles: true });
    player.addEffect("mining_fatigue", 80, { amplifier: 0, showParticles: false });
  } catch (_) {}
}

function tickSirenDryDamage(player, tickCounter) {
  if (tickCounter % 2 !== 0) return;
  try {
    player.applyDamage(SIREN_LAND_DAMAGE);
  } catch (_) {}
}

function spawnSirenDryParticles(player) {
  const dim = player.dimension;
  const loc = player.location;
  for (let i = 0; i < 3; i++) {
    spawnParticleSafe(dim, "minecraft:basic_smoke_particle", {
      x: loc.x + (Math.random() - 0.5) * 0.6,
      y: loc.y + 1.0 + Math.random() * 0.5,
      z: loc.z + (Math.random() - 0.5) * 0.6,
    });
  }
}

function isDimensionRaining(dimension) {
  try {
    if (typeof dimension?.getWeather !== "function") return false;
    const weather = dimension.getWeather();
    const weatherText = String(weather ?? "").toLowerCase();
    return weatherText.includes("rain") || weatherText.includes("thunder");
  } catch (_) {
    return false;
  }
}

function canSeeSky(player) {
  try {
    const loc = player.location;
    const dim = player.dimension;
    const x = Math.floor(loc.x);
    const z = Math.floor(loc.z);
    const startY = Math.floor(loc.y) + 1;
    const top = Math.min((dim.heightRange?.max ?? 319) - 1, startY + 64);
    for (let y = startY; y <= top; y++) {
      const block = dim.getBlock({ x, y, z });
      if (!block) continue;
      const typeId = block.typeId ?? "";
      if (
        typeId !== "minecraft:air"
        && typeId !== "minecraft:cave_air"
        && typeId !== "minecraft:void_air"
      ) {
        return false;
      }
    }
    return true;
  } catch (_) {
    return false;
  }
}

function isSirenExposedToRain(player) {
  if (!player?.isValid?.()) return false;
  return canSeeSky(player) && isDimensionRaining(player.dimension);
}

function syncSirenLandHydration(player, tickCounter) {
  if (!player.hasTag("race_siren")) return;

  const inWater = !!player.isInWater || !!player.isSwimming;
  const inRain = !inWater && isSirenExposedToRain(player);
  if (inWater || inRain) {
    if ((SIREN_LAND_MS.get(player.id) ?? 0) > 0 || SIREN_DRIED_OUT.has(player.id)) {
      hydrateSiren(player, true);
    } else {
      SIREN_LAND_MS.set(player.id, 0);
    }
    return;
  }

  const landMs = (SIREN_LAND_MS.get(player.id) ?? 0) + 1000;
  SIREN_LAND_MS.set(player.id, landMs);

  if (landMs >= SIREN_LAND_DRYOUT_MS) {
    if (!SIREN_DRIED_OUT.has(player.id)) {
      SIREN_DRIED_OUT.add(player.id);
      player.sendMessage("§cSuas escamas racham e descascam: você está ressecando!");
    }
    applySirenDryEffects(player);
    tickSirenDryDamage(player, tickCounter);
    if (tickCounter % 15 === 0) spawnSirenDryParticles(player);
    if (tickCounter % 8 === 0) {
      player.onScreenDisplay?.setActionBar?.("§cRessecado: entre na água, fique na chuva ou beba uma garrafa de água");
    }
    return;
  }

  if (landMs >= SIREN_LAND_WARN_MS && tickCounter % 10 === 0) {
    const secsLeft = Math.ceil((SIREN_LAND_DRYOUT_MS - landMs) / 1000);
    player.onScreenDisplay?.setActionBar?.(`§7Skin drying... §3${secsLeft}s §7until dehydration`);
  }
}

function syncSirenWaterSpeed(player) {
  if (!player.hasTag("race_siren")) return;

  const inWater = !!player.isInWater || !!player.isSwimming;
  if (!inWater) return;

  let vel;
  try {
    vel = player.getVelocity();
  } catch (_) {
    return;
  }

  const horizSpeed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
  const swimming = !!player.isSwimming;
  const rising = !!player.isJumping;
  const sneaking = !!player.isSneaking;

  if (sneaking && horizSpeed > 0.02) {
    try {
      player.applyImpulse({
        x: -vel.x * SIREN_SWIM_SNEAK_DRAG,
        y: -vel.y * 0.1,
        z: -vel.z * SIREN_SWIM_SNEAK_DRAG,
      });
    } catch (_) {}
    return;
  }

  if (!swimming && !rising) {
    if (horizSpeed > 0.05) {
      try {
        player.applyImpulse({
          x: -vel.x * SIREN_SWIM_DRAG,
          y: 0,
          z: -vel.z * SIREN_SWIM_DRAG,
        });
      } catch (_) {}
    }
    return;
  }

  let look;
  try {
    look = player.getViewDirection();
  } catch (_) {
    return;
  }

  const lookHoriz = Math.sqrt(look.x * look.x + look.z * look.z) || 0;

  if (swimming) {
    if (lookHoriz < 0.15 || horizSpeed >= SIREN_SWIM_MAX_HORIZ) return;

    const dirX = look.x;
    const dirZ = look.z;
    const vertical = Math.max(0.02, look.y * 0.12);

    if (!applyKnockbackCompat(player, dirX, dirZ, SIREN_SWIM_BOOST_HORIZ, vertical)) {
      try {
        player.applyImpulse({
          x: (dirX / lookHoriz) * SIREN_SWIM_BOOST_HORIZ * 0.3,
          y: vertical * 0.3,
          z: (dirZ / lookHoriz) * SIREN_SWIM_BOOST_HORIZ * 0.3,
        });
      } catch (_) {}
    }
    return;
  }

  if (rising) {
    const vertical = Math.max(SIREN_SWIM_BOOST_VERT, look.y * 0.2);
    if (!applyKnockbackCompat(player, 0, 0, 0, vertical)) {
      try {
        player.applyImpulse({ x: 0, y: vertical * 0.3, z: 0 });
      } catch (_) {}
    }
  }
}

function spawnSirenWaterAura(player) {
  const dim = player.dimension;
  const loc = player.location;
  for (let i = 0; i < 4; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 0.4 + Math.random() * 0.5;
    const particleId = SIREN_AURA_PARTICLES[i % SIREN_AURA_PARTICLES.length];
    spawnParticleSafe(dim, particleId, {
      x: loc.x + Math.cos(angle) * r,
      y: loc.y + 0.15 + Math.random() * 0.35,
      z: loc.z + Math.sin(angle) * r,
    });
  }
}

function spawnSirenSongWave(player, radius) {
  const dim = player.dimension;
  const loc = player.location;
  for (let ring = 1; ring <= 3; ring++) {
    mc.system.runTimeout(() => {
      const r = (radius / 3) * ring;
      const steps = Math.max(14, Math.floor(r * 5));
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const px = loc.x + Math.cos(angle) * r;
        const pz = loc.z + Math.sin(angle) * r;
        spawnParticleSafe(dim, "minecraft:water_splash_particle", { x: px, y: loc.y + 0.15, z: pz });
        if (i % 3 === 0) {
          spawnParticleSafe(dim, "minecraft:endrod", { x: px, y: loc.y + 1.0, z: pz });
        }
      }
    }, ring * 5);
  }
}

function pullEntityToward(entity, targetLoc, horizontal, lift) {
  const dx = targetLoc.x - entity.location.x;
  const dz = targetLoc.z - entity.location.z;
  applyKnockbackCompat(entity, dx, dz, horizontal, lift);
}

function isSirenSinging(playerId) {
  const channel = SIREN_SONG_CHANNEL.get(playerId);
  return !!channel && Date.now() < channel.untilMs;
}

function getFlatDistanceXZ(from, to) {
  const dx = from.x - to.x;
  const dz = from.z - to.z;
  return Math.sqrt(dx * dx + dz * dz);
}

function isSirenSongMobFrozen(mobId, now = Date.now()) {
  const frozen = SIREN_SONG_FROZEN_MOBS.get(mobId);
  if (!frozen) return false;
  if (now >= frozen.untilMs) {
    SIREN_SONG_FROZEN_MOBS.delete(mobId);
    return false;
  }
  return true;
}

function maintainSirenSongMobFreeze(mob) {
  if (!mob?.isValid?.()) return;
  try {
    mob.clearVelocity();
  } catch (_) {}
  try {
    mob.addEffect("slowness", 25, { amplifier: 255, showParticles: false });
    mob.addEffect("weakness", 25, { amplifier: 255, showParticles: false });
    mob.addEffect("mining_fatigue", 25, { amplifier: 255, showParticles: false });
  } catch (_) {}
  pacifyUndeadMob(mob);
  if (mob.typeId === "minecraft:iron_golem") {
    pacifyIronGolem(mob);
  }
}

function freezeSirenSongMob(mob, sirenId, untilMs) {
  if (!mob?.isValid?.()) return;
  SIREN_SONG_FROZEN_MOBS.set(mob.id, { untilMs, sirenId });
  maintainSirenSongMobFreeze(mob);
}

function clearSirenSongFrozenMobs(sirenId) {
  for (const [mobId, data] of [...SIREN_SONG_FROZEN_MOBS.entries()]) {
    if (data.sirenId === sirenId) SIREN_SONG_FROZEN_MOBS.delete(mobId);
  }
}

function applySirenSongMobEffect(mob, sirenId, anchor, now, initialBurst = false) {
  if (!mob?.isValid?.() || isPlayerEntity(mob)) return false;

  if (isSirenSongMobFrozen(mob.id, now)) {
    maintainSirenSongMobFreeze(mob);
    return true;
  }

  const dist = getFlatDistanceXZ(mob.location, anchor);
  if (dist <= SIREN_SONG_FREEZE_RANGE) {
    freezeSirenSongMob(mob, sirenId, now + SIREN_SONG_FREEZE_MS);
    return true;
  }

  try {
    mob.addEffect("slowness", initialBurst ? 20 : 12, {
      amplifier: 1,
      showParticles: initialBurst,
    });
    mob.addEffect("weakness", initialBurst ? 20 : 12, {
      amplifier: 0,
      showParticles: initialBurst,
    });
    pullEntityToward(
      mob,
      anchor,
      initialBurst ? SIREN_SONG_MOB_PULL : SIREN_SONG_MOB_PULL * 0.35,
      initialBurst ? 0.08 : 0.04,
    );
  } catch (_) {}
  return true;
}

function clearSirenSongChannel(sirenId) {
  SIREN_SONG_CHANNEL.delete(sirenId);
  clearSirenSongFrozenMobs(sirenId);
  for (const [victimId, charmerId] of [...SIREN_CHARMED_BY.entries()]) {
    if (charmerId === sirenId) SIREN_CHARMED_BY.delete(victimId);
  }
  SIREN_MOVEMENT_LOCKED.delete(sirenId);
}

function finishSirenSong(sirenId, silent = true) {
  try {
    const siren = mc.world.getEntity(sirenId);
    if (siren instanceof mc.Player) {
      unlockSirenMovement(siren);
      if (!silent) {
        siren.onScreenDisplay?.setActionBar?.("§3Siren's Song ended");
      }
    }
  } catch (_) {}
  clearSirenSongChannel(sirenId);
}

function canPlaySirenLure(playerId) {
  const now = Date.now();
  if (now < (SIREN_LURE_PLAYING_UNTIL.get(playerId) ?? 0)) return false;
  if (now < (SIREN_ABILITY_PLAYING_UNTIL.get(playerId) ?? 0)) return false;
  return true;
}

function markSirenLurePlaying(playerId) {
  SIREN_LURE_PLAYING_UNTIL.set(playerId, Date.now() + SIREN_LURE_DURATION_MS);
}

function getPlayersNearSiren(siren, radius) {
  const hearRadius = Math.max(4, Math.min(48, radius));
  const hearRadiusSq = hearRadius * hearRadius;
  const loc = siren.location;
  const nearby = [];
  for (const listener of siren.dimension.getPlayers()) {
    const dx = listener.location.x - loc.x;
    const dy = listener.location.y - loc.y;
    const dz = listener.location.z - loc.z;
    if (dx * dx + dy * dy + dz * dz <= hearRadiusSq) nearby.push(listener);
  }
  return nearby;
}

function playSirenSoundOnPlayer(listener, soundId, volume, pitch = 1.0) {
  const vol = Math.min(1, Math.max(0.1, volume));
  const pitchClamped = Math.min(2, Math.max(0.5, pitch));
  try {
    listener.playSound(soundId, { volume: vol, pitch: pitchClamped });
    return true;
  } catch (_) {}
  try {
    const volText = vol.toFixed(2);
    const pitchText = pitchClamped.toFixed(2);
    listener.runCommand(`playsound ${soundId} @s ~ ~ ~ ${volText} ${pitchText} 1`);
    return true;
  } catch (_) {}
  return false;
}

function playSirenSoundNearby(
  siren,
  soundId,
  selfVolume,
  nearbyVolume,
  pitch = 1.0,
  radius = SIREN_LURE_HEAR_RADIUS,
) {
  let played = false;
  for (const listener of getPlayersNearSiren(siren, radius)) {
    const vol = listener.id === siren.id ? selfVolume : nearbyVolume;
    if (playSirenSoundOnPlayer(listener, soundId, vol, pitch)) played = true;
  }
  return played;
}

function playSirenAbilitySong(player) {
  const played = playSirenSoundNearby(
    player,
    SIREN_ABILITY_SOUND,
    SIREN_ABILITY_SELF_VOLUME,
    SIREN_ABILITY_NEARBY_VOLUME,
    1.0,
    SIREN_ABILITY_HEAR_RADIUS,
  );
  if (played) {
    SIREN_ABILITY_PLAYING_UNTIL.set(player.id, Date.now() + SIREN_ABILITY_DURATION_MS);
  }
  return played;
}

function scheduleNextSirenLure(playerId, fromMs = Date.now()) {
  SIREN_LURE_NEXT.set(playerId, fromMs + SIREN_LURE_DURATION_MS + SIREN_LURE_INTERVAL_MS);
}

function primeSirenLureAmbient(player) {
  SIREN_LURE_NEXT.set(player.id, Date.now() + 2000 + Math.random() * 2000);
  SIREN_LURE_PLAYING_UNTIL.delete(player.id);
  SIREN_ABILITY_PLAYING_UNTIL.delete(player.id);
  mc.system.runTimeout(() => {
    try {
      if (!player.hasTag("race_siren") || isSirenSinging(player.id)) return;
      syncSirenLureAmbient(player);
    } catch (_) {}
  }, 40);
}

function getSirenLureLocation(player) {
  return {
    x: player.location.x,
    y: player.location.y + 1.0,
    z: player.location.z,
  };
}

function playSirenLureAt(player) {
  if (!canPlaySirenLure(player.id)) return false;
  if (
    !playSirenSoundNearby(
      player,
      SIREN_LURE_SOUND,
      SIREN_LURE_SELF_VOLUME,
      SIREN_LURE_NEARBY_VOLUME,
      1.0,
      SIREN_LURE_HEAR_RADIUS,
    )
  ) {
    return false;
  }
  markSirenLurePlaying(player.id);
  return true;
}

function syncSirenLureAmbient(player) {
  if (!player.hasTag("race_siren")) return;
  if (isSirenSinging(player.id)) return;

  const now = Date.now();
  let next = SIREN_LURE_NEXT.get(player.id);
  if (next === undefined) {
    SIREN_LURE_NEXT.set(player.id, now + 3000 + Math.random() * 4000);
    return;
  }
  if (now < next || !canPlaySirenLure(player.id)) return;

  if (playSirenLureAt(player)) {
    scheduleNextSirenLure(player.id, now);
  } else {
    SIREN_LURE_NEXT.set(player.id, now + 5000);
  }
}

function lockSirenMovement(siren) {
  if (!(siren instanceof mc.Player)) return;
  if (SIREN_MOVEMENT_LOCKED.has(siren.id)) return;
  try {
    siren.inputPermissions.setPermissionCategory(mc.InputPermissionCategory.Movement, false);
    SIREN_MOVEMENT_LOCKED.add(siren.id);
    return;
  } catch (_) {}
  try {
    siren.runCommand("inputpermission set @s movement disabled");
    SIREN_MOVEMENT_LOCKED.add(siren.id);
    return;
  } catch (_) {}
  // Last resort: mild slowness only — amplifier 255 causes camera zoom glitches.
  try {
    siren.addEffect("slowness", 110, { amplifier: 5, showParticles: false });
    SIREN_MOVEMENT_LOCKED.add(siren.id);
  } catch (_) {}
}

function unlockSirenMovement(siren) {
  if (!(siren instanceof mc.Player)) return;
  if (!SIREN_MOVEMENT_LOCKED.has(siren.id)) {
    // Still try to restore in case state desynced after a reload.
    try {
      siren.inputPermissions.setPermissionCategory(mc.InputPermissionCategory.Movement, true);
    } catch (_) {}
    try {
      siren.runCommand("inputpermission set @s movement enabled");
    } catch (_) {}
    return;
  }
  SIREN_MOVEMENT_LOCKED.delete(siren.id);
  try {
    siren.inputPermissions.setPermissionCategory(mc.InputPermissionCategory.Movement, true);
  } catch (_) {}
  try {
    siren.runCommand("inputpermission set @s movement enabled");
  } catch (_) {}
  try {
    siren.removeEffect("slowness");
  } catch (_) {}
}

function stabilizeSirenPosition(siren) {
  try {
    siren.clearVelocity();
  } catch (_) {}
}

function getFacingRotation(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const horiz = Math.sqrt(dx * dx + dz * dz) || 0.0001;
  return {
    x: Math.atan2(-dy, horiz) * (180 / Math.PI),
    y: Math.atan2(-dx, dz) * (180 / Math.PI),
  };
}

function facePlayerToward(player, target) {
  let from;
  try {
    from = player.getHeadLocation();
  } catch (_) {
    from = { x: player.location.x, y: player.location.y + 1.62, z: player.location.z };
  }
  const rotation = getFacingRotation(from, target);
  try {
    player.setRotation(rotation);
    return;
  } catch (_) {}
  try {
    player.lookAt(target);
  } catch (_) {}
}

function charmPlayerTowardSiren(victim, siren, walkStrength, forceGaze) {
  if (forceGaze) {
    facePlayerToward(victim, {
      x: siren.location.x,
      y: siren.location.y + 1.35,
      z: siren.location.z,
    });
  }
  pullEntityToward(victim, siren.location, walkStrength, 0);
}

function tickSirenSongChannels() {
  const now = Date.now();
  for (const [sirenId, channel] of [...SIREN_SONG_CHANNEL.entries()]) {
    const siren = mc.world.getEntity(sirenId);
    if (!(siren instanceof mc.Player) || !siren.hasTag("race_siren") || now >= channel.untilMs) {
      finishSirenSong(sirenId, true);
      continue;
    }

    if (mc.system.currentTick % 8 === 0) stabilizeSirenPosition(siren);

    const charmedThisTick = new Set();
    const players = siren.dimension.getPlayers({
      location: channel.anchor,
      maxDistance: channel.radius,
    });
    const forceGaze = mc.system.currentTick % 4 === 0;

    for (const victim of players) {
      if (victim.id === sirenId) continue;
      charmedThisTick.add(victim.id);
      SIREN_CHARMED_BY.set(victim.id, sirenId);
      charmPlayerTowardSiren(victim, siren, SIREN_SONG_WALK_PULL, forceGaze);
      try {
        victim.addEffect("slowness", 12, { amplifier: 1, showParticles: false });
        victim.addEffect("nausea", 12, { amplifier: 0, showParticles: false });
      } catch (_) {}
    }

    for (const [victimId, charmerId] of [...SIREN_CHARMED_BY.entries()]) {
      if (charmerId === sirenId && !charmedThisTick.has(victimId)) {
        SIREN_CHARMED_BY.delete(victimId);
      }
    }

    const mobs = siren.dimension.getEntities({
      location: channel.anchor,
      maxDistance: channel.radius,
    });
    for (const entity of mobs) {
      if (entity.id === sirenId || isPlayerEntity(entity)) continue;
      applySirenSongMobEffect(entity, sirenId, channel.anchor, now, false);
    }

    if (mc.system.currentTick % 4 === 0) {
      spawnSirenSongWave(siren, channel.radius * 0.65);
      for (let i = 0; i < 4; i++) {
        spawnParticleSafe(siren.dimension, "minecraft:endrod", {
          x: channel.anchor.x + (Math.random() - 0.5) * 1.0,
          y: channel.anchor.y + 1.1 + Math.random() * 0.7,
          z: channel.anchor.z + (Math.random() - 0.5) * 1.0,
        });
      }
    }

    const secsLeft = Math.ceil((channel.untilMs - now) / 1000);
    siren.onScreenDisplay?.setActionBar?.(`§3Siren's Song... §7(${secsLeft}s)`);
  }
}

function onSirenSongProtectBefore(event) {
  try {
    const victim = event.hurtEntity;
    if (!(victim instanceof mc.Player) || !victim.hasTag("race_siren")) return;
    if (!isSirenSinging(victim.id)) return;
    event.cancel = true;
  } catch (_) {}
}

function onSirenSongProtectAfter(event) {
  try {
    const victim = event.hurtEntity;
    if (!(victim instanceof mc.Player) || !victim.hasTag("race_siren")) return;
    if (!isSirenSinging(victim.id)) return;

    const damage = event.damage ?? 0;
    if (damage <= 0) return;

    mc.system.run(() => {
      healPlayerWithinRaceCap(victim, getRace(victim), damage);
    });
  } catch (_) {}
}

function triggerSirenSong(player) {
  if (isSirenSinging(player.id)) return;

  const inWater = !!player.isInWater || !!player.isSwimming;
  const radius = inWater ? SIREN_SONG_WATER_RADIUS : SIREN_SONG_RADIUS;
  const dim = player.dimension;
  const anchor = { ...player.location };
  const nearby = dim.getEntities({ location: anchor, maxDistance: radius });
  const now = Date.now();

  let mobCount = 0;
  let playerCount = 0;

  SIREN_SONG_CHANNEL.set(player.id, {
    untilMs: now + SIREN_SONG_DURATION_MS,
    anchor,
    radius,
  });

  for (const entity of nearby) {
    if (entity.id === player.id) continue;

    if (isPlayerEntity(entity)) {
      SIREN_CHARMED_BY.set(entity.id, player.id);
      charmPlayerTowardSiren(entity, player, SIREN_SONG_WALK_PULL, true);
      try {
        entity.addEffect("slowness", 20, { amplifier: 1, showParticles: true });
        entity.addEffect("nausea", 20, { amplifier: 0, showParticles: true });
      } catch (_) {}
      playerCount++;
      continue;
    }

    if (applySirenSongMobEffect(entity, player.id, anchor, now, true)) {
      mobCount++;
    }
  }

  lockSirenMovement(player);
  stabilizeSirenPosition(player);
  spawnSirenSongWave(player, radius);
  for (let i = 0; i < 10; i++) {
    spawnParticleSafe(dim, "minecraft:endrod", {
      x: anchor.x + (Math.random() - 0.5) * 1.2,
      y: anchor.y + 1.2 + Math.random() * 0.8,
      z: anchor.z + (Math.random() - 0.5) * 1.2,
    });
  }

  playSirenAbilitySong(player);
  scheduleNextSirenLure(player.id);

  const parts = [];
  if (mobCount > 0) parts.push(`${mobCount} mob(s)`);
  if (playerCount > 0) parts.push(`${playerCount} player(s)`);
  const summary = parts.length > 0 ? parts.join(" and ") : "nothing nearby";
  player.sendMessage(`§3Canto da Sereia! Encantando ${summary} por 5 s.`);
  player.onScreenDisplay?.setActionBar?.("§3Siren's Song...");
}

function spawnEmberAura(player) {
  const loc = player.location;
  const dim = player.dimension;
  for (let i = 0; i < 3; i++) {
    spawnParticleSafe(dim, "minecraft:basic_flame_particle", {
      x: loc.x + (Math.random() - 0.5) * 0.9,
      y: loc.y + 0.2 + Math.random() * 1.4,
      z: loc.z + (Math.random() - 0.5) * 0.9,
    });
  }
  if (Math.random() < 0.35) {
    spawnParticleSafe(dim, "minecraft:basic_smoke_particle", {
      x: loc.x + (Math.random() - 0.5) * 0.5,
      y: loc.y + 1.6,
      z: loc.z + (Math.random() - 0.5) * 0.5,
    });
  }
}

function ensureRaceEffects(player, race) {
  if (!race?.effects?.length) return;

  for (const e of race.effects) {
    // Leonin strength is managed by syncLeoninCombatStance (claws = Str IV).
    if (race.key === "beastfolk_leonin" && normalizeEffectId(e.effect) === "strength") {
      continue;
    }
    try {
      const current = player.getEffect(e.effect);
      if (!current || current.amplifier < e.amplifier) {
        player.addEffect(e.effect, e.duration, {
          amplifier: e.amplifier,
          showParticles: e.showParticles,
        });
      }
    } catch (_) {}
  }
}

function getRaceMaxHealth(race) {
  const healthKey = race?.healthKey ?? race?.key;
  return RACE_MAX_HEALTH_BY_KEY[healthKey] ?? DEFAULT_PLAYER_MAX_HEALTH;
}

function getRaceHudMaxHealth(race) {
  const raceMax = getRaceMaxHealth(race);
  return raceMax > HUD_PLAYER_MAX_HEALTH ? raceMax : HUD_PLAYER_MAX_HEALTH;
}

function getRaceHealthRatio(player, race) {
  try {
    const health = player.getComponent("minecraft:health");
    if (!health) return 1;
    const cap = getRaceMaxHealth(race);
    return cap > 0 ? health.currentValue / cap : 1;
  } catch (_) {
    return 1;
  }
}

// [Addon Pack] "Vida extra": Health Boost (RPG/pocoes) soma +4 de vida por nivel; o limite da raca nao pode engoli-la.
function healthBoostBonus(player) {
  try {
    const eff = player.getEffect("health_boost");
    return eff ? (eff.amplifier + 1) * 4 : 0;
  } catch (_) { return 0; }
}

function capHealthToRace(player, race) {
  if (!player?.isValid?.() || !race) return;
  try {
    const health = player.getComponent("minecraft:health");
    if (!health) return;
    const cap = getRaceMaxHealth(race) + healthBoostBonus(player);
    if (health.currentValue > cap + 0.05) {
      health.setCurrentValue(cap);
    }
  } catch (_) {}
}

function healPlayerWithinRaceCap(player, race, amount) {
  if (!amount || amount <= 0) return;
  try {
    const health = player.getComponent("minecraft:health");
    if (!health) return;
    const cap = getRaceMaxHealth(race ?? getRace(player)) + healthBoostBonus(player);
    health.setCurrentValue(Math.min(cap, health.currentValue + amount));
  } catch (_) {}
}

function applyRaceHealthGroup(player, race) {
  if (!player?.isValid?.()) return;
  if (!race) return;
  const healthKey = race.healthKey ?? race.key;
  const eventName = RACE_HP_EVENT_BY_KEY[healthKey] ?? "race:hp_set_standard";
  try {
    player.triggerEvent(eventName);
  } catch (_) {}
}

function syncRaceMaxHealth(player) {
  if (!player.hasTag("race_assigned")) return;

  const race = getRace(player);
  if (!race) return;

  const boost = healthBoostBonus(player);
  const hudMax = getRaceHudMaxHealth(race) + boost;
  const raceCap = getRaceMaxHealth(race) + boost;
  let health;
  try {
    health = player.getComponent("minecraft:health");
  } catch (_) {
    health = null;
  }

  // Bedrock has no /attribute command — max HP must come from HP component groups.
  if (!health || Math.abs(health.effectiveMax - hudMax) > 0.05) {
    applyRaceHealthGroup(player, race);
    try {
      health = player.getComponent("minecraft:health");
    } catch (_) {
      health = null;
    }
  }

  if (!health) return;

  if (Math.abs(health.effectiveMax - hudMax) <= 0.05) {
    RACE_HEALTH_TARGET.set(player.id, raceCap);
  } else {
    RACE_HEALTH_TARGET.delete(player.id);
  }

  capHealthToRace(player, race);
}

function scheduleRaceHealthSync(player) {
  const race = getRace(player);
  if (!race) return;

  syncRaceMaxHealth(player);
  for (const delay of [1, 2, 5, 10, 20, 40, 80, 120]) {
    mc.system.runTimeout(() => {
      if (!player?.isValid?.()) return;
      if (getRace(player)?.key !== race.key) return;
      syncRaceMaxHealth(player);
    }, delay);
  }
}

function applyRaceEffects(player, race) {
  ensureRaceEffects(player, race);
}

function normalizeEffectId(effectId) {
  return String(effectId ?? "").replace("minecraft:", "");
}

function isRaceEffectId(race, effectId) {
  const id = normalizeEffectId(effectId);
  return race.effects.some(e => normalizeEffectId(e.effect) === id);
}

function restoreRaceAfterMilk(player) {
  const race = getRace(player);
  if (!race) return;

  for (const delay of [1, 3, 5, 10, 20, 40, 60]) {
    mc.system.runTimeout(() => {
      if (!player.hasTag("race_assigned")) return;
      if (getRace(player)?.key !== race.key) return;
      ensureRaceEffects(player, race);
      scheduleRaceHealthSync(player);
      if (race.key === "beastfolk_leonin") syncLeoninCombatStance(player);
    }, delay);
  }
}

function applyRaceEntityGroup(player, race) {
  try {
    if (race.key === "werewolf") {
      // Don't stomp an in-progress transform.
      if (isWerewolfTransforming(player)) return;
      // Preserve the active beast model; only re-sync delayed retries (e.g. on
      // respawn) to the form the player is actually in.
      player.triggerEvent(
        isWerewolfBeastForm(player) ? "race:werewolf_set_beast" : "race:werewolf_set_human",
      );
      return;
    }
    if (isBeastfolkRace(race)) {
      player.triggerEvent("race:set_beastfolk");
      return;
    }
    if (race.key === "vampire") {
      player.triggerEvent(
        isVampireBatForm(player) ? "race:vampire_set_bat" : "race:set_vampire",
      );
      return;
    }
    player.triggerEvent(`race:set_${race.key}`);
  } catch (e) {
    console.warn(`Race entity group failed for ${race.key}: ${e}`);
  }
}

function getBasePlayerName(player) {
  try {
    if (typeof player.name === "string" && player.name.length > 0) return player.name;
  } catch (_) {}

  const tag = String(player.nameTag ?? "");
  const marker = "§r §7";
  const idx = tag.indexOf(marker);
  if (idx !== -1) return tag.slice(idx + marker.length).trim();

  const lines = tag.split("\n");
  return (lines[lines.length - 1] ?? tag).replace(/§./g, "").trim() || "Player";
}

function formatRaceNameTag(player, race) {
  return `${race.label}§r §7${getBasePlayerName(player)}`;
}

function syncRaceNameTag(player, race) {
  if (!player?.isValid?.() || !race) return;
  try {
    const expected = formatRaceNameTag(player, race);
    if (player.nameTag !== expected) {
      player.nameTag = expected;
    }
  } catch (_) {}
}

function getPlayerDisplayName(player) {
  return getBasePlayerName(player);
}

function clearPlayerRaceState(playerId) {
  COOLDOWNS.delete(playerId);
  UNDEAD_UNDYING_GRASP.delete(playerId);
  UNDEAD_UNDYING_COOLDOWNS.delete(playerId);
  ORC_LOW_HP_TRIGGER.delete(playerId);
  ORC_JUMP_ARMED.delete(playerId);
  ORC_FEAR_COOLDOWNS.delete(playerId);
  LEONIN_LOW_HP_TRIGGER.delete(playerId);
  LEONIN_ROAR_JUMP_ARMED.delete(playerId);
  LEONIN_ROAR_COOLDOWNS.delete(playerId);
  LEONIN_CLAW_CD.delete(playerId);
  LEONIN_MAINHAND_TRACK.delete(playerId);
  WEAPON_BAN_MSG_CD.delete(playerId);
  WEREWOLF_HOWL_COOLDOWNS.delete(playerId);
  WEREWOLF_LUNGE_COOLDOWNS.delete(playerId);
  WEREWOLF_LEAP_COOLDOWNS.delete(playerId);
  WEREWOLF_TRANSFORM_COOLDOWNS.delete(playerId);
  WEREWOLF_BEAST_ACTIVE.delete(playerId);
  WEREWOLF_TRANSFORMING.delete(playerId);
  WEREWOLF_GEAR_STASH.delete(playerId);
  clearWerewolfReversionSickness(playerId);
  undeadDisguiseState.delete(playerId);
  for (const key of [...undeadProvoked.keys()]) {
    if (key.endsWith(`:${playerId}`)) undeadProvoked.delete(key);
  }
  HALFLING_MOUNT_GRACE.delete(playerId);
  RACE_HEALTH_TARGET.delete(playerId);
  HALFLING_DISMOUNT_TRACKED.delete(playerId);
  HALFLING_PICKPOCKET_COOLDOWN.delete(playerId);
  ELF_XP_NEXT.delete(playerId);
  DWARF_VEIN_PENDING.delete(playerId);
  jumpTracked.delete(playerId);
  sneakTracked.delete(playerId);
  onGroundTracked.delete(playerId);
  ELF_AIR_DASH_READY.delete(playerId);
  ELF_AIR_TICKS.delete(playerId);
  ELF_LEFT_VIA_JUMP.delete(playerId);
  ELF_CLOUDWAKE_ACTIVE.delete(playerId);
  clearSirenSongChannel(playerId);
  SIREN_LURE_NEXT.delete(playerId);
  SIREN_LURE_PLAYING_UNTIL.delete(playerId);
  SIREN_ABILITY_PLAYING_UNTIL.delete(playerId);
  SIREN_LAND_MS.delete(playerId);
  SIREN_DRIED_OUT.delete(playerId);
  SIREN_WATER_DRINK_PENDING.delete(playerId);
  VAMPIRE_BAT_ACTIVE.delete(playerId);
  VAMPIRE_BAT_CD.delete(playerId);
  clearVampireBatFlightState(playerId);
  VAMPIRE_CROUCH_JUMP_DEBOUNCE.delete(playerId);
  clearVampireFeedCooldownsForPlayer(playerId);
  endVampireFeed(playerId, false);
  clearVampireSunExposureTimer(playerId);
  try {
    const player = mc.world.getEntity(playerId);
    if (player instanceof mc.Player) {
      player.removeTag(VAMPIRE_BURNING_TAG);
    }
  } catch (_) {}
  SNEAK_BUTTON_HELD.delete(playerId);
  JUMP_BUTTON_HELD.delete(playerId);
  try {
    const player = mc.world.getEntity(playerId);
    if (player instanceof mc.Player) {
      releaseWerewolfDrag(player, false);
      unlockSirenMovement(player);
      player.removeEffect("slow_falling");
      clearSirenDryEffects(player);
    }
  } catch (_) {}
  SIREN_MOVEMENT_LOCKED.delete(playerId);
}

function applyKnockbackCompat(entity, dirX, dirZ, horizontalStrength, verticalStrength) {
  const horiz = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
  const nx = dirX / horiz;
  const nz = dirZ / horiz;
  try {
    entity.applyKnockback(nx, nz, horizontalStrength, verticalStrength);
    return true;
  } catch (_) {}
  try {
    entity.applyKnockback(
      { x: nx * horizontalStrength, z: nz * horizontalStrength },
      verticalStrength,
    );
    return true;
  } catch (_) {}
  return false;
}

function resetPlayerRace(player) {
  try {
    player.removeTag("reset_race");
    clearAllRaceTags(player);
    player.removeTag("race_assigned");
    clearUndeadPlayerState(player);
    if (WEREWOLF_GEAR_STASH.has(player.id)) {
      restoreWerewolfGear(player);
    }
    clearPlayerRaceState(player.id);
    try {
      player.triggerEvent("race:reset");
      player.triggerEvent("race:hp_set_standard");
    } catch (_) {}
    try {
      player.nameTag = getPlayerDisplayName(player);
    } catch (_) {}
    player.sendMessage("§eSua raça foi redefinida. Escolha de novo!");
    mc.system.runTimeout(() => showRaceSelector(player), 10);
  } catch (e) {
    console.warn(`[DnD] reset_race failed: ${e}`);
    mc.system.runTimeout(() => showRaceSelector(player), 20);
  }
}

function readPlayerInputState(player) {
  const state = {
    jumping: false,
    sneaking: false,
    onGround: true,
    falling: false,
    moveX: 0,
    moveY: 0,
    sprinting: false,
  };
  try {
    state.jumping = !!player.isJumping;
  } catch (_) {}
  try {
    state.sneaking = !!player.isSneaking;
  } catch (_) {}
  try {
    state.onGround = !!player.isOnGround;
  } catch (_) {}
  try {
    state.falling = !!player.isFalling;
  } catch (_) {}
  try {
    state.sprinting = !!player.isSprinting;
  } catch (_) {}
  if (!state.sneaking) {
    state.sneaking = !!(SNEAK_BUTTON_HELD.has(player.id) || sneakTracked.get(player.id));
  }
  if (!state.jumping) {
    state.jumping = !!(JUMP_BUTTON_HELD.has(player.id) || jumpTracked.get(player.id));
  }
  try {
    const jumpState = player.inputInfo?.getButtonState?.("Jump");
    if (jumpState === "Pressed") state.jumping = true;
  } catch (_) {}
  try {
    const move = player.inputInfo?.getMovementVector?.();
    if (move) {
      state.moveX = move.x ?? 0;
      state.moveY = move.y ?? 0;
    }
  } catch (_) {}
  return state;
}

function getVampireBatWorldMoveDir(player, input) {
  let view;
  try {
    view = player.getViewDirection();
  } catch (_) {
    return null;
  }

  const horizLook = Math.sqrt(view.x * view.x + view.z * view.z);
  if (horizLook < 0.01) return null;

  const forwardX = view.x / horizLook;
  const forwardZ = view.z / horizLook;
  const rightX = -forwardZ;
  const rightZ = forwardX;

  const moveX = -(input?.moveX ?? 0);
  const moveY = input?.moveY ?? 0;
  const moveMag = Math.sqrt(moveX * moveX + moveY * moveY);
  if (moveMag >= 0.08) {
    return {
      x: (forwardX * moveY + rightX * moveX) / moveMag,
      z: (forwardZ * moveY + rightZ * moveX) / moveMag,
    };
  }

  if (input?.sprinting) {
    return { x: forwardX, z: forwardZ };
  }

  return null;
}

function canElfAirDash(player) {
  try {
    if (player.isGliding) return false;
    if (player.isInWater) return false;
    if (player.isClimbing) return false;
  } catch (_) {}
  return true;
}

function spawnCloudwakeBurst(dimension, location) {
  for (let i = 0; i < 6; i++) {
    spawnParticleSafe(dimension, "minecraft:endrod", {
      x: location.x + (Math.random() - 0.5) * 0.7,
      y: location.y + 0.9 + Math.random() * 0.6,
      z: location.z + (Math.random() - 0.5) * 0.7,
    });
  }
  for (let i = 0; i < 5; i++) {
    spawnParticleSafe(dimension, CLOUDWAKE_PARTICLE_IDS[i % CLOUDWAKE_PARTICLE_IDS.length], {
      x: location.x + (Math.random() - 0.5) * 0.8,
      y: location.y + 0.15 + Math.random() * 0.25,
      z: location.z + (Math.random() - 0.5) * 0.8,
    });
  }
}

function spawnCloudwakeFeet(player) {
  const loc = player.location;
  const dim = player.dimension;
  const footY = loc.y + 0.08;
  for (let i = 0; i < 5; i++) {
    const ox = (Math.random() - 0.5) * 1.1;
    const oz = (Math.random() - 0.5) * 1.1;
    const particleId = CLOUDWAKE_PARTICLE_IDS[i % CLOUDWAKE_PARTICLE_IDS.length];
    spawnParticleSafe(dim, particleId, { x: loc.x + ox, y: footY, z: loc.z + oz });
  }
}

function endElfCloudwake(player) {
  if (!ELF_CLOUDWAKE_ACTIVE.has(player.id)) return;
  ELF_CLOUDWAKE_ACTIVE.delete(player.id);
  try {
    player.removeEffect("slow_falling");
  } catch (_) {}
}

function tryElfCloudwake(player) {
  const race = getRace(player);
  if (race?.key !== "elf") return false;
  if (!canElfAirDash(player)) return false;
  if (player.isOnGround) return false;

  const airTicks = ELF_AIR_TICKS.get(player.id) ?? 0;
  if (airTicks < CLOUDWAKE_MIN_AIR_TICKS) return false;

  const dashReady = ELF_AIR_DASH_READY.get(player.id) ?? true;
  if (!dashReady) return false;

  triggerElfCloudwake(player);
  ELF_AIR_DASH_READY.set(player.id, false);
  return true;
}

function triggerElfCloudwake(player) {
  const dir = player.getViewDirection();
  const horiz = Math.sqrt(dir.x * dir.x + dir.z * dir.z) || 1;
  const horizontal = CLOUDWAKE_FORWARD * Math.max(0.4, horiz);
  const vertical = Math.min(0.95, Math.max(CLOUDWAKE_VERTICAL, CLOUDWAKE_VERTICAL + dir.y * 0.3));

  if (!applyKnockbackCompat(player, dir.x, dir.z, horizontal, vertical)) {
    try {
      player.applyImpulse({
        x: (dir.x / horiz) * horizontal * 0.28,
        y: vertical * 0.28,
        z: (dir.z / horiz) * horizontal * 0.28,
      });
    } catch (_) {}
  }

  ELF_CLOUDWAKE_ACTIVE.add(player.id);
  try {
    player.addEffect("slow_falling", 999999, { amplifier: 0, showParticles: false });
  } catch (_) {}

  const dim = player.dimension;
  const loc = player.location;
  spawnCloudwakeBurst(dim, loc);
  spawnCloudwakeFeet(player);

  try {
    dim.playSound("mob.enderdragon.flap", loc, { volume: 0.25, pitch: 1.7 });
  } catch (_) {}

  player.onScreenDisplay?.setActionBar?.("§bCloudwake");
}

function applyRaceEntityGroupWithRetries(player, race) {
  applyRaceEntityGroup(player, race);
  mc.system.runTimeout(() => {
    if (getRace(player)?.key === race.key) applyRaceEntityGroup(player, race);
  }, 20);
}

function setRace(player, race) {
  if (race?.inDevelopment) return;

  clearAllRaceTags(player);
  player.removeTag("race_assigned");
  clearUndeadPlayerState(player);
  WEREWOLF_BEAST_ACTIVE.delete(player.id);
  WEREWOLF_TRANSFORMING.delete(player.id);
  if (WEREWOLF_GEAR_STASH.has(player.id)) {
    restoreWerewolfGear(player);
  }
  clearWerewolfReversionSickness(player);
  WEREWOLF_TRANSFORM_COOLDOWNS.delete(player.id);
  WEREWOLF_HOWL_COOLDOWNS.delete(player.id);
  WEREWOLF_LUNGE_COOLDOWNS.delete(player.id);
  WEREWOLF_LEAP_COOLDOWNS.delete(player.id);
  releaseWerewolfDrag(player, false);

  // Set new race
  player.addTag(race.tag);
  if (isBeastfolkRace(race)) {
    player.addTag("race_beastfolk");
  }
  player.addTag("race_assigned");

  applyRaceEntityGroupWithRetries(player, race);
  applyRaceHealthGroup(player, race);
  applyRaceEffects(player, race);
  scheduleRaceHealthSync(player);
  if (race.key === "beastfolk_leonin") {
    syncLeoninCombatStance(player);
  }
  if (race.key === "undead") {
    undeadDisguiseState.delete(player.id);
    for (const delay of [1, 5, 20]) {
      mc.system.runTimeout(() => {
        syncUndeadDisguise(player);
        syncUndeadGolemTarget(player);
      }, delay);
    }
  }
  if (race.key === "elf") {
    resetElfXpTimer(player);
  }
  if (race.key === "siren") {
    primeSirenLureAmbient(player);
    hydrateSiren(player, true);
  }

  // Update name tag
  syncRaceNameTag(player, race);

  // Confirmation messages
  mc.system.runTimeout(() => {
    player.sendMessage("§r");
    player.sendMessage("§l§e==============================");
    player.sendMessage(`§l§e  ${race.label}§l§e escolhida!`);
    player.sendMessage("§l§e==============================");
    player.sendMessage(`§7${race.description}`);
    player.sendMessage(`§bHabilidade: §f${race.abilityDescription}`);
    player.sendMessage("§r");
    // Title on screen
    player.runCommand(`title @s title ${race.label}`);
    player.runCommand(`title @s subtitle §7${race.description}`);
  }, 5);
}

// ─────────────────────────────────────────────
//  RACE SELECTION FORM (ActionFormData)
// ─────────────────────────────────────────────
function showBeastfolkSubraceSelector(player) {
  mc.system.run(() => {
    const form = new ActionFormData()
      .title("Escolha Sua Linhagem de Povo-Fera")
      .body("§7Escolha a linhagem animal que corre em suas veias.\n§6Leonino§7 já está disponível.\n§8Felinos, Ursa e Raposinos estão em desenvolvimento.\n");

    for (const subrace of BEASTFOLK_SUBRACES) {
      if (subrace.inDevelopment) {
        form.button(`${subrace.label}\n§8Em Desenvolvimento`);
      } else {
        form.button(`${subrace.label}\n§7${subrace.abilityDescription}`);
      }
    }
    form.button("§8← Voltar às Raças\n§7Retorna à lista principal");

    RACE_FORM_PENDING.set(player.id, mc.system.currentTick);
    form.show(player).then((result) => {
      RACE_FORM_PENDING.delete(player.id);
      if (result.canceled || result.selection === undefined) {
        if (!player.hasTag("race_assigned")) {
          mc.system.runTimeout(() => showBeastfolkSubraceSelector(player), 40);
        }
        return;
      }
      if (result.selection === BEASTFOLK_SUBRACES.length) {
        showRaceSelector(player);
        return;
      }
      const chosen = BEASTFOLK_SUBRACES[result.selection];
      if (chosen?.inDevelopment) {
        player.onScreenDisplay?.setActionBar?.("§cEm desenvolvimento: em breve!");
        player.sendMessage(`§7${chosen.label} §8ainda está em desenvolvimento.`);
        mc.system.runTimeout(() => showBeastfolkSubraceSelector(player), 100);
        return;
      }
      if (chosen) setRace(player, chosen);
    }).catch(() => {
      RACE_FORM_PENDING.delete(player.id);
      if (!player.hasTag("race_assigned")) {
        mc.system.runTimeout(() => showBeastfolkSubraceSelector(player), 60);
      }
    });
  });
}

const RACE_FORM_PENDING = new Map(); // playerId -> tick em que o formulario foi aberto
// [Addon Pack] valvula de seguranca: se o jogador fechar a tela varias vezes seguidas (ou ela nao aparecer
// direito), para de reabrir por 1 minuto, para nunca prender a tela.
const RACE_FORM_CLOSES = new Map(); // playerId -> fechamentos seguidos
const RACE_FORM_PAUSE = new Map();  // playerId -> tick ate o qual nao reabre
function raceFormClosed(player) {
  const n = (RACE_FORM_CLOSES.get(player.id) ?? 0) + 1;
  if (n >= 3) {
    RACE_FORM_CLOSES.set(player.id, 0);
    RACE_FORM_PAUSE.set(player.id, mc.system.currentTick + 1200);
    try { player.sendMessage("§eA escolha de raça volta a aparecer em 1 minuto. §7(Ela é obrigatória.)"); } catch (_) {}
    return false;
  }
  RACE_FORM_CLOSES.set(player.id, n);
  return true;
}
function showRaceSelector(player) {
  mc.system.run(() => {
    if (!player?.isValid?.() || player.hasTag("race_assigned")) return;
    const since = RACE_FORM_PENDING.get(player.id);
    if (since !== undefined && mc.system.currentTick - since < 1200) return; // ja aberto
    if ((RACE_FORM_PAUSE.get(player.id) ?? 0) > mc.system.currentTick) return; // pausa de seguranca
    RACE_FORM_PENDING.set(player.id, mc.system.currentTick);
    const form = new ActionFormData()
      .title("Escolha Sua Raça")
      .body("§7Sua escolha é §cpermanente§7. Escolha com sabedoria!\n");

    for (const race of RACES) {
      form.button(`${race.label}\n§7${race.abilityDescription}`);
    }

    form.show(player).then((result) => {
      RACE_FORM_PENDING.delete(player.id);
      if (result.canceled || result.selection === undefined) {
        // [Addon Pack] tela obrigatoria: se estava ocupado, tenta de novo; se o jogador fechou, reabre em breve.
        const busy = result.cancelationReason === "UserBusy";
        if (!player.hasTag("race_assigned") && (busy || raceFormClosed(player))) {
          mc.system.runTimeout(() => showRaceSelector(player), busy ? 20 : 60);
        }
        return;
      }
      RACE_FORM_CLOSES.set(player.id, 0);
      const chosen = RACES[result.selection];
      if (!chosen) return;
      if (chosen.isCategory && chosen.key === "beastfolk") {
        showBeastfolkSubraceSelector(player);
        return;
      }
      if (!chosen.isCategory) setRace(player, chosen);
    }).catch(() => {
      RACE_FORM_PENDING.delete(player.id);
      if (!player.hasTag("race_assigned")) {
        mc.system.runTimeout(() => showRaceSelector(player), 60);
      }
    });
  });
}

// [Addon Pack] Rede de seguranca: qualquer jogador sem raca escolhida (mundo antigo, formulario
// perdido, outro menu aberto na hora) volta a ver a tela de selecao.
mc.system.runInterval(() => {
  for (const p of mc.world.getAllPlayers()) {
    if (!p.hasTag("race_assigned")) showRaceSelector(p);
  }
}, 100);
mc.world.beforeEvents.playerLeave.subscribe(({ player }) => { RACE_FORM_PENDING.delete(player.id); });

// ─────────────────────────────────────────────
//  SPAWN HANDLER
// ─────────────────────────────────────────────
mc.world.afterEvents.playerSpawn.subscribe((event) => {
  const { player, initialSpawn } = event;

  if (initialSpawn && !player.hasTag("race_assigned")) {
    // Delay so world loads fully before showing form
    mc.system.runTimeout(() => showRaceSelector(player), 80);
  } else if (!initialSpawn && VAMPIRE_TURN_PENDING.has(player.id)) {
    for (const delay of [1, 5, 10, 20, 40]) {
      mc.system.runTimeout(() => finishVampireAscension(player), delay);
    }
  } else {
    const race = getRace(player);
    if (race) {
      for (const delay of [5, 20, 60, 100, 200]) {
        mc.system.runTimeout(() => {
          if (!player?.isValid?.()) return;
          const currentRace = getRace(player);
          if (!currentRace || currentRace.key !== race.key) return;
          syncRaceNameTag(player, currentRace);
          applyRaceEntityGroupWithRetries(player, currentRace);
          applyRaceHealthGroup(player, currentRace);
          applyRaceEffects(player, currentRace);
          scheduleRaceHealthSync(player);
          if (currentRace.key === "elf") resetElfXpTimer(player);
          if (currentRace.key === "siren") primeSirenLureAmbient(player);
        }, delay);
      }
    }
  }
});

// ─────────────────────────────────────────────
//  PASSIVE TICK (every second = 20 ticks)
// ─────────────────────────────────────────────
let tick = 0;
mc.system.runInterval(() => {
  tick++;

  for (const player of mc.world.getAllPlayers()) {
    if (!player.hasTag("race_assigned")) continue;
    const race = getRace(player);
    if (!race) continue;

    // Re-apply any missing race effects every second (covers milk, etc.)
    ensureRaceEffects(player, race);

    // Re-verify max HP every second (covers respawn, milk, stale entity overrides).
    syncRaceMaxHealth(player);

    if (tick % 100 === 0) {
      syncRaceNameTag(player, race);
    }

    // ── ORC: Bloodlust ──
    if (race.key === "orc") {
      try {
        const ratio = getRaceHealthRatio(player, race);
        if (ratio < 0.5) {
          player.addEffect("strength", 40, { amplifier: 1, showParticles: true });
          if (!ORC_LOW_HP_TRIGGER.get(player.id)) {
            ORC_LOW_HP_TRIGGER.set(player.id, true);
            player.addEffect("speed", 140, { amplifier: 0, showParticles: true });
            player.onScreenDisplay?.setActionBar?.("§2Bloodlust!");
          }
        } else {
          ORC_LOW_HP_TRIGGER.set(player.id, false);
          player.addEffect("strength", 999999, { amplifier: 0, showParticles: false });
        }
      } catch (_) {}
    }

    // ── VAMPIRE: night power / sun weakness / bat form ──
    if (race.key === "vampire") {
      syncVampirePassives(player);
      syncVampireDayNightForm(player);
    }

    // ── LEONIN: Dauntless ──
    if (race.key === "beastfolk_leonin") {
      syncLeoninCombatStance(player);
      try {
        const ratio = getRaceHealthRatio(player, race);
        if (ratio < 0.5) {
          player.addEffect("resistance", 40, { amplifier: 0, showParticles: false });
          if (!LEONIN_LOW_HP_TRIGGER.get(player.id)) {
            LEONIN_LOW_HP_TRIGGER.set(player.id, true);
            player.onScreenDisplay?.setActionBar?.("§6Dauntless!");
          }
        } else {
          LEONIN_LOW_HP_TRIGGER.set(player.id, false);
        }
      } catch (_) {}
    }

    // ── ELF: Keen Mind (+1 level every 2 minutes) ──
    if (race.key === "elf") {
      syncElfKeenMind(player);
    }

    // ── HUMAN: Adaptable ──
    if (race.key === "human" && tick % 200 === 0) {
      player.addEffect("saturation", 20, { amplifier: 0, showParticles: false });
      if (Math.random() < 0.3) {
        player.addEffect("resistance", 100, { amplifier: 1, showParticles: false });
      }
    }

    // ── DWARF: Underground Night Vision ──
    if (race.key === "dwarf" && isUnderground(player)) {
      player.addEffect("night_vision", 400, { amplifier: 0, showParticles: false });
    }

    // ── TIEFLING: Ember Aura ──
    if (race.key === "tiefling" && tick % 8 === 0) {
      spawnEmberAura(player);
    }

    if (race.key === "siren") {
      syncSirenLureAmbient(player);
      try {
        syncSirenLandHydration(player, tick);
        if ((player.isInWater || player.isSwimming) && tick % 12 === 0) {
          spawnSirenWaterAura(player);
        }
      } catch (_) {}
    }

    if (race.key === "werewolf") {
      syncWerewolfNightBuffs(player);
      syncWerewolfReversionSickness(player);
    }

    // ── UNDEAD: Grave Bound pacify + Undying + hungerless ──
    if (race.key === "undead") {
      syncUndeadSaturation(player);
      if (tick % 5 === 0) {
        pacifyUndeadMobsNear(player);
        syncUndeadUndying(player);
      }
      if (tick % 10 === 0) {
        scareVillagersNear(player);
      }
    }

  }
}, 20);

mc.system.runInterval(() => {
  for (const player of mc.world.getAllPlayers()) {
    if (!isLeoninPlayer(player)) continue;
    syncLeoninCombatStance(player);
  }
}, 5);

mc.system.runInterval(() => {
  for (const player of mc.world.getAllPlayers()) {
    if (!player.hasTag("race_undead")) continue;
    syncUndeadDisguise(player);
    syncUndeadGolemTarget(player);
    syncUndeadSaturation(player);
    syncUndeadUndying(player);
    pacifyUndeadMobsNear(player);
    if (hasCarvedPumpkin(player)) {
      pacifyNearbyIronGolems(player);
    }
  }
  syncUndeadFleshOffers();
}, 10);

mc.system.runInterval(() => {
  syncUndeadMinions();
}, 5);

// ─────────────────────────────────────────────
//  HALFLING: Pickpocket, piggyback riding, Nimble proc on hit
// ─────────────────────────────────────────────
function isPlayerEntity(entity) {
  return entity?.typeId === "minecraft:player";
}

function getRideTarget(player) {
  try {
    const riding = player.getComponent("minecraft:riding");
    return riding?.entityRidingOn ?? riding?.entityRiding ?? null;
  } catch (_) {
    return null;
  }
}

function formatItemLabel(typeId) {
  return String(typeId ?? "item")
    .replace("minecraft:", "")
    .replace(/_/g, " ");
}

function getPlayerInventoryContainer(player) {
  try {
    const inv = player.getComponent("minecraft:inventory") ?? player.getComponent("inventory");
    return inv?.container ?? null;
  } catch (_) {
    return null;
  }
}

function cloneItemStack(item, amount) {
  try {
    const copy = item.clone();
    copy.amount = amount;
    return copy;
  } catch (_) {
    return new ItemStack(item.typeId, amount);
  }
}

function giveItemToPlayer(player, itemStack) {
  const container = getPlayerInventoryContainer(player);
  if (!container) return false;

  try {
    const leftover = container.addItem(itemStack);
    if (!leftover) return true;
    player.dimension.spawnItem(leftover, player.location);
    return true;
  } catch (_) {
    try {
      player.dimension.spawnItem(itemStack, player.location);
      return true;
    } catch (_) {}
  }
  return false;
}

function getPickpocketableSlots(container) {
  if (!container) return [];
  const slots = [];
  const limit = Math.min(container.size, 36);
  for (let slot = 0; slot < limit; slot++) {
    try {
      const item = container.getItem(slot);
      if (item && item.amount > 0) slots.push(slot);
    } catch (_) {}
  }
  return slots;
}

function getItemCommandName(typeId) {
  return String(typeId ?? "").replace("minecraft:", "");
}

function stealViaCommands(victim, thief, item, stealCount) {
  const itemName = getItemCommandName(item.typeId);
  if (!itemName) return null;

  const victimName = getBasePlayerName(victim).replace(/"/g, '\\"');
  const thiefName = getBasePlayerName(thief).replace(/"/g, '\\"');
  const dim = thief.dimension;

  try {
    dim.runCommand(`clear "${victimName}" ${itemName} ${stealCount}`);
    dim.runCommand(`give "${thiefName}" ${itemName} ${stealCount}`);
    return cloneItemStack(item, stealCount);
  } catch (_) {}

  try {
    victim.runCommand(`clear @s ${itemName} ${stealCount}`);
    thief.runCommand(`give @s ${itemName} ${stealCount}`);
    return cloneItemStack(item, stealCount);
  } catch (_) {}

  return null;
}

function stealRandomInventoryItem(victim, thief) {
  const container = getPlayerInventoryContainer(victim);
  const slots = getPickpocketableSlots(container);
  if (!slots.length) return null;

  const slot = slots[Math.floor(Math.random() * slots.length)];
  let item;
  try {
    item = container.getItem(slot);
  } catch (_) {
    return null;
  }
  if (!item || item.amount <= 0) return null;

  const stealCount = item.amount === 1
    ? 1
    : Math.min(
      item.amount,
      1 + Math.floor(Math.random() * Math.min(item.amount, HALFLING_PICKPOCKET_MAX_STEAL)),
    );
  const taken = cloneItemStack(item, stealCount);

  let stole = false;
  if (container) {
    try {
      if (item.amount <= stealCount) {
        container.setItem(slot, undefined);
      } else {
        container.setItem(slot, cloneItemStack(item, item.amount - stealCount));
      }
      stole = giveItemToPlayer(thief, taken);
    } catch (_) {}
  }

  if (!stole) {
    const cmdTaken = stealViaCommands(victim, thief, item, stealCount);
    if (!cmdTaken) return null;
    return cmdTaken;
  }

  return taken;
}

function getDistanceBetween(a, b) {
  const dx = a.location.x - b.location.x;
  const dy = a.location.y - b.location.y;
  const dz = a.location.z - b.location.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function isHalflingSneaking(player) {
  const input = readPlayerInputState(player);
  return !!(player.isSneaking || sneakTracked.get(player.id) || input?.sneaking);
}

function onHalflingPickpocketHitEntity(event) {
  const attacker = event.damagingEntity;
  if (!attacker?.hasTag?.("race_halfling")) return;
  if (!isHalflingSneaking(attacker)) return;
  if (!isPlayerEntity(event.hitEntity)) return;

  const thief = resolvePlayerEntity(attacker) ?? attacker;
  const victim = resolvePlayerEntity(event.hitEntity) ?? event.hitEntity;
  mc.system.run(() => onHalflingPickpocketHit(thief, victim));
}

function isEmptyHandItem(itemStack) {
  if (!itemStack) return true;
  const id = itemStack.typeId;
  return !id || id === "minecraft:air";
}

function itemHasAnyTag(itemStack, tags) {
  if (!itemStack) return false;
  try {
    for (const tag of tags) {
      if (itemStack.hasTag?.(tag)) return true;
    }
    const owned = itemStack.getTags?.() ?? [];
    for (const tag of tags) {
      if (owned.includes(tag)) return true;
    }
  } catch (_) {}
  return false;
}

function isMaceItem(itemStack) {
  if (isEmptyHandItem(itemStack)) return false;
  if (itemStack.typeId === "minecraft:mace") return true;
  return itemHasAnyTag(itemStack, ["minecraft:is_mace"]);
}

function isSpearItem(itemStack) {
  if (isEmptyHandItem(itemStack)) return false;
  if (itemStack.typeId.endsWith("_spear")) return true;
  return itemHasAnyTag(itemStack, ["minecraft:is_spear"]);
}

function isAllowedCombatWeapon(itemStack) {
  if (isEmptyHandItem(itemStack)) return true;
  return isMaceItem(itemStack) || isSpearItem(itemStack);
}

function isBannedCombatWeapon(itemStack) {
  if (isEmptyHandItem(itemStack)) return false;
  if (isAllowedCombatWeapon(itemStack)) return false;

  const typeId = itemStack.typeId;
  if (BANNED_WEAPON_TYPE_IDS.has(typeId)) return true;
  if (typeId.endsWith("_sword")) return true;
  if (typeId.endsWith("_axe") && !typeId.includes("pickaxe")) return true;
  if (itemHasAnyTag(itemStack, BANNED_WEAPON_TAGS)) return true;

  try {
    if (itemStack.hasComponent("minecraft:shooter")) return true;
    if (itemStack.hasComponent("minecraft:piercing_weapon") && !isSpearItem(itemStack)) return true;
    if (itemStack.hasComponent("minecraft:kinetic_weapon") && !isMaceItem(itemStack)) return true;
  } catch (_) {}

  return false;
}

function notifyWeaponBanned(player) {
  const now = Date.now();
  if (now < (WEAPON_BAN_MSG_CD.get(player.id) ?? 0)) return;
  WEAPON_BAN_MSG_CD.set(player.id, now + WEAPON_BAN_MSG_MS);
  player.onScreenDisplay?.setActionBar?.("§cLeoninos só podem lutar com maças e lanças.");
}

function isLeoninClawsOut(player) {
  return isLeoninPlayer(player) && isEmptyHandItem(getMainhandTool(player));
}

function applyLeoninStrength(player, amplifier) {
  try {
    const current = player.getEffect("strength");
    const currentAmp = current?.amplifier ?? -1;
    if (currentAmp === amplifier && (current?.duration ?? 0) > 60) return;

    player.removeEffect("strength");
    player.addEffect("strength", 999999, {
      amplifier,
      showParticles: false,
    });
  } catch (_) {}
}

function syncLeoninCombatStance(player) {
  if (!isLeoninPlayer(player)) return;

  const weapon = getMainhandTool(player);
  const typeId = weapon?.typeId ?? "minecraft:air";
  const banned = isBannedCombatWeapon(weapon);
  const clawsOut = isEmptyHandItem(weapon);
  const prevType = LEONIN_MAINHAND_TRACK.get(player.id);
  const mainhandChanged = prevType !== typeId;

  if (banned) {
    try {
      player.removeEffect("strength");
      player.addEffect("weakness", LEONIN_WEAPON_WEAKNESS_TICKS, {
        amplifier: LEONIN_WEAPON_WEAKNESS_AMP,
        showParticles: false,
      });
    } catch (_) {}
    if (mainhandChanged) notifyWeaponBanned(player);
  } else {
    try {
      player.removeEffect("weakness");
    } catch (_) {}

    const desiredAmp = clawsOut ? LEONIN_CLAW_STRENGTH_AMP : 0;
    const currentAmp = player.getEffect("strength")?.amplifier ?? -1;
    if (mainhandChanged || currentAmp !== desiredAmp) {
      applyLeoninStrength(player, desiredAmp);
    }
  }

  LEONIN_MAINHAND_TRACK.set(player.id, typeId);
}

function scheduleLeoninCombatStanceSync(player) {
  if (!isLeoninPlayer(player)) return;
  syncLeoninCombatStance(player);
  mc.system.runTimeout(() => {
    if (player?.isValid?.() && isLeoninPlayer(player)) syncLeoninCombatStance(player);
  }, 1);
}

function revertLeoninBannedWeaponHit(attacker, target, damage) {
  if (!target?.isValid?.() || damage <= 0) return;

  healPlayerWithinRaceCap(target, getRace(target), damage);

  notifyWeaponBanned(attacker);
}

function resolveLeoninAttackerFromDamage(damageSource) {
  if (!damageSource) return null;

  const direct = damageSource.damagingEntity;
  if (direct instanceof mc.Player) {
    return isLeoninPlayer(direct) ? direct : null;
  }

  if (direct?.isValid?.()) {
    try {
      const owner = direct.getComponent("minecraft:projectile")?.owner;
      if (owner instanceof mc.Player && isLeoninPlayer(owner)) return owner;
    } catch (_) {}
  }

  return null;
}

function onLeoninWeaponBanBeforeHurt(event) {
  const attacker = resolveLeoninAttackerFromDamage(event.damageSource);
  if (!attacker) return;

  const weapon = getMainhandTool(attacker);
  if (!isBannedCombatWeapon(weapon)) return;

  event.cancel = true;
  try {
    if (typeof event.damage === "number") event.damage = 0;
  } catch (_) {}
  notifyWeaponBanned(attacker);
}

function onLeoninWeaponBanAfterHurt(event) {
  const attacker = resolveLeoninAttackerFromDamage(event.damageSource);
  if (!attacker) return;

  const weapon = getMainhandTool(attacker);
  if (!isBannedCombatWeapon(weapon)) return;

  const damage = event.damage ?? 0;
  if (damage <= 0) return;

  revertLeoninBannedWeaponHit(attacker, event.hurtEntity, damage);
}

function onLeoninWeaponBanHitEntity(event) {
  const attacker = event.damagingEntity;
  if (!(attacker instanceof mc.Player)) return;
  if (!isLeoninPlayer(attacker)) return;

  const weapon = getMainhandTool(attacker);
  if (!isBannedCombatWeapon(weapon)) return;

  const target = event.hitEntity;
  if (!target?.isValid?.()) return;

  const healthBefore = target.getComponent("minecraft:health")?.currentValue;
  if (healthBefore === undefined) return;

  mc.system.run(() => {
    if (!target.isValid()) return;
    try {
      const health = target.getComponent("minecraft:health");
      if (!health) return;
      if (health.currentValue < healthBefore) {
        health.setCurrentValue(healthBefore);
        notifyWeaponBanned(attacker);
      }
    } catch (_) {}
  });
}

function onWeaponBanBeforeItemUse(event) {
  const player = event.source;
  if (!(player instanceof mc.Player)) return;
  if (!isLeoninPlayer(player)) return;
  if (!isBannedCombatWeapon(event.itemStack)) return;

  event.cancel = true;
  notifyWeaponBanned(player);
  scheduleLeoninCombatStanceSync(player);
}

function resolvePlayerEntity(entity) {
  if (entity instanceof mc.Player) return entity;
  if (!isPlayerEntity(entity)) return null;
  try {
    for (const player of mc.world.getAllPlayers()) {
      if (player.id === entity.id) return player;
    }
  } catch (_) {}
  return null;
}

function onHalflingPickpocketHit(attacker, victimEntity) {
  if (!attacker?.hasTag?.("race_halfling")) return;
  if (!isHalflingSneaking(attacker)) return;
  if (getRideTarget(attacker)) return;
  if (!isPlayerEntity(victimEntity)) return;

  const victim = resolvePlayerEntity(victimEntity);
  if (!victim || victim.id === attacker.id) return;

  const now = Date.now();
  const last = HALFLING_PICKPOCKET_HIT_DEBOUNCE.get(attacker.id) ?? 0;
  if (now - last < 400) return;
  HALFLING_PICKPOCKET_HIT_DEBOUNCE.set(attacker.id, now);

  tryHalflingPickpocket(attacker, victim);
}

function isHalflingPickpocketOnCooldown(halfling) {
  const now = Date.now();
  const readyAt = HALFLING_PICKPOCKET_COOLDOWN.get(halfling.id) ?? 0;
  if (now >= readyAt) return false;

  const secs = Math.ceil((readyAt - now) / 1000);
  halfling.onScreenDisplay?.setActionBar?.(`§cPickpocket cooldown: ${secs}s`);
  return true;
}

function markHalflingPickpocketUsed(halfling) {
  HALFLING_PICKPOCKET_COOLDOWN.set(halfling.id, Date.now() + HALFLING_PICKPOCKET_CD_MS);
}

function tryHalflingPickpocket(halfling, victim) {
  if (!halfling.hasTag("race_halfling")) return false;
  const victimPlayer = resolvePlayerEntity(victim);
  if (!victimPlayer || victimPlayer.id === halfling.id) return false;
  victim = victimPlayer;
  if (getRideTarget(halfling)) return false;

  if (getDistanceBetween(halfling, victim) > HALFLING_PICKPOCKET_RANGE) {
    halfling.sendMessage("§7Longe demais para bater carteira.");
    return false;
  }

  if (isHalflingPickpocketOnCooldown(halfling)) return false;

  markHalflingPickpocketUsed(halfling);

  if (Math.random() > HALFLING_PICKPOCKET_SUCCESS) {
    victim.sendMessage(`§c${getBasePlayerName(halfling)} tentou bater sua carteira!`);
    halfling.sendMessage("§cPego no flagra!");
    halfling.onScreenDisplay?.setActionBar?.("§cPickpocket failed!");
    return false;
  }

  const stolen = stealRandomInventoryItem(victim, halfling);
  if (!stolen) {
    halfling.sendMessage("§7Os bolsos estão vazios, ou o acesso ao inventário está bloqueado.");
    halfling.onScreenDisplay?.setActionBar?.("§7Nada para roubar.");
    return false;
  }

  const label = formatItemLabel(stolen.typeId);
  halfling.sendMessage(`§eVocê furtou §f${stolen.amount}x ${label}§e.`);
  halfling.onScreenDisplay?.setActionBar?.("§eLight fingers...");

  if (Math.random() < HALFLING_PICKPOCKET_NOTICE_CHANCE) {
    victim.sendMessage("§7Você sente algo escorregar do seu bolso...");
  }

  try {
    spawnParticleSafe(halfling.dimension, "minecraft:endrod", {
      x: victim.location.x,
      y: victim.location.y + 1.0,
      z: victim.location.z,
    });
  } catch (_) {}

  return true;
}

function isMountablePlayer(target) {
  if (!isPlayerEntity(target)) return false;
  if (!target.hasTag("race_assigned")) return false;
  return !target.hasTag("race_halfling");
}

function findNearestMountablePlayer(halfling, maxDistance) {
  let nearest = null;
  let bestDist = maxDistance;

  for (const other of halfling.dimension.getPlayers()) {
    if (other.id === halfling.id) continue;
    if (!isMountablePlayer(other)) continue;

    const dx = other.location.x - halfling.location.x;
    const dy = other.location.y - halfling.location.y;
    const dz = other.location.z - halfling.location.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < bestDist) {
      bestDist = dist;
      nearest = other;
    }
  }

  return nearest;
}

function findMountTarget(halfling, maxDistance) {
  try {
    const hits = halfling.getEntitiesFromViewDirection({ maxDistance });
    for (const hit of hits) {
      if (isMountablePlayer(hit.entity)) return hit.entity;
    }
  } catch (_) {}

  return findNearestMountablePlayer(halfling, maxDistance);
}

function mountHasPlayerRider(target, ignoreRider) {
  try {
    const rideable = target.getComponent("minecraft:rideable");
    const riders = rideable?.getRiders?.() ?? [];
    return riders.some(r => isPlayerEntity(r) && r.id !== ignoreRider?.id);
  } catch (_) {
    return false;
  }
}

function tryMountHalfling(halfling, mount) {
  if (!halfling.hasTag("race_halfling")) return false;
  if (!isMountablePlayer(mount)) {
    if (isPlayerEntity(mount) && mount.hasTag("race_halfling")) {
      halfling.sendMessage("§cPequeninos não podem montar em outros Pequeninos!");
    }
    return false;
  }
  if (halfling.id === mount.id) return false;
  if (getRideTarget(halfling)) return false;

  if (mountHasPlayerRider(mount, halfling)) {
    halfling.onScreenDisplay?.setActionBar?.("§cAlguém já está montado nesse jogador!");
    return false;
  }

  const mountName = getBasePlayerName(mount);

  try {
    const rideable = mount.getComponent("minecraft:rideable");
    if (rideable?.addRider?.(halfling)) {
      HALFLING_MOUNT_GRACE.set(halfling.id, tick);
      halfling.onScreenDisplay?.setActionBar?.(`§eMontado em ${mountName}: agache para descer`);
      mount.sendMessage(`§e${getBasePlayerName(halfling)} subiu nos seus ombros!`);
      return true;
    }
  } catch (_) {}

  try {
    const name = mountName.replace(/"/g, '\\"');
    halfling.runCommand(`ride @s start_riding @a[name="${name}",c=1]`);
    HALFLING_MOUNT_GRACE.set(halfling.id, tick);
    halfling.onScreenDisplay?.setActionBar?.(`§eMontado em ${mountName}: agache para descer`);
    mount.sendMessage(`§e${getBasePlayerName(halfling)} subiu nos seus ombros!`);
    return true;
  } catch (_) {}

  try {
    halfling.mount(mount);
    HALFLING_MOUNT_GRACE.set(halfling.id, tick);
    halfling.onScreenDisplay?.setActionBar?.(`§eMontado em ${mountName}: agache para descer`);
    mount.sendMessage(`§e${getBasePlayerName(halfling)} subiu nos seus ombros!`);
    return true;
  } catch (e) {
    halfling.sendMessage("§cNão foi possível montar nesse jogador.");
    console.warn(`Halfling mount failed: ${e}`);
    return false;
  }
}

function tryDismountHalfling(halfling) {
  const mount = getRideTarget(halfling);
  if (!mount) return false;
  if (!halfling.hasTag("race_halfling")) return false;

  const grace = HALFLING_MOUNT_GRACE.get(halfling.id) ?? 0;
  if (tick <= grace + 15) return false;

  try {
    const rideable = mount.getComponent("minecraft:rideable");
    if (rideable?.ejectRider?.(halfling)) {
      halfling.onScreenDisplay?.setActionBar?.("§7Dismounted.");
      return true;
    }
  } catch (_) {}

  try {
    if (typeof halfling.dismount === "function") {
      halfling.dismount();
      halfling.onScreenDisplay?.setActionBar?.("§7Dismounted.");
      return true;
    }
  } catch (_) {}

  try {
    halfling.runCommand("ride @s stop_riding");
    halfling.onScreenDisplay?.setActionBar?.("§7Dismounted.");
    return true;
  } catch (_) {}

  return false;
}

mc.world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  const halfling = event.player;
  const target = event.target;
  if (!halfling.hasTag("race_halfling")) return;
  if (!isPlayerEntity(target)) return;

  if (getRideTarget(halfling)) {
    if (halfling.isSneaking) tryDismountHalfling(halfling);
    return;
  }

  tryMountHalfling(halfling, target);
});

mc.system.runInterval(() => {
  for (const player of mc.world.getAllPlayers()) {
    if (!player.hasTag("race_halfling")) continue;

    const wasSneaking = HALFLING_DISMOUNT_TRACKED.get(player.id) ?? false;
    if (getRideTarget(player) && player.isSneaking && !wasSneaking) {
      tryDismountHalfling(player);
    }
    HALFLING_DISMOUNT_TRACKED.set(player.id, player.isSneaking);
  }
}, 2);

mc.world.afterEvents.entityHurt.subscribe((event) => {
  const player = event.hurtEntity;
  if (!(player instanceof mc.Player)) return;
  if (!player.hasTag("race_halfling")) return;

  if (Math.random() < 0.25) {
    const attacker = event.damageSource?.damagingEntity;
    if (attacker) {
      try {
        attacker.addEffect("slowness", 60, { amplifier: 2, showParticles: true });
        player.sendMessage("§eÁgil! Atacante desacelerado.");
      } catch (_) {}
    }
  }
});

try {
  mc.world.afterEvents.entityDie.subscribe((event) => {
    try {
      onHellfireVictimDeath(event.deadEntity);
    } catch (_) {}
    try {
      onRitualDaggerBatKill(event.deadEntity, event.damageSource);
    } catch (_) {}
    try {
      onVampireBloodFeast(event.deadEntity, event.damageSource);
    } catch (_) {}
    try {
      onVampireFeedEntityDeath(event.deadEntity);
    } catch (_) {}
    try {
      if (isUndeadMinion(event.deadEntity.id)) {
        releaseUndeadMinion(event.deadEntity.id);
      }
      if (event.deadEntity instanceof mc.Player) {
        forceRestoreWerewolfStash(event.deadEntity);
        finishSirenSong(event.deadEntity.id, true);
        SIREN_CHARMED_BY.delete(event.deadEntity.id);
        if (event.deadEntity.hasTag("race_undead")) {
          releaseAllUndeadMinions(event.deadEntity, true);
          clearUndeadMinionStateForPlayer(event.deadEntity.id);
        }
      }

    } catch (_) {}
  });
} catch (_) {}

mc.world.afterEvents.playerSpawn.subscribe((e) => {
  UNDEAD_UNDYING_GRASP.delete(e.player.id);
  ORC_LOW_HP_TRIGGER.delete(e.player.id);
  ORC_JUMP_ARMED.delete(e.player.id);
  ORC_FEAR_COOLDOWNS.delete(e.player.id);
  LEONIN_LOW_HP_TRIGGER.delete(e.player.id);
  LEONIN_ROAR_JUMP_ARMED.delete(e.player.id);
  LEONIN_ROAR_COOLDOWNS.delete(e.player.id);
  LEONIN_CLAW_CD.delete(e.player.id);
  LEONIN_MAINHAND_TRACK.delete(e.player.id);
  WEAPON_BAN_MSG_CD.delete(e.player.id);
  WEREWOLF_HOWL_COOLDOWNS.delete(e.player.id);
  WEREWOLF_LUNGE_COOLDOWNS.delete(e.player.id);
  WEREWOLF_LEAP_COOLDOWNS.delete(e.player.id);
  WEREWOLF_TRANSFORM_COOLDOWNS.delete(e.player.id);
  WEREWOLF_BEAST_ACTIVE.delete(e.player.id);
  WEREWOLF_TRANSFORMING.delete(e.player.id);
  WEREWOLF_BED_REST_SECONDS.delete(e.player.id);
  VAMPIRE_BAT_ACTIVE.delete(e.player.id);
  clearVampireBatFlightState(e.player);
  releaseWerewolfDrag(e.player, false);
  if (WEREWOLF_GEAR_STASH.has(e.player.id)) {
    mc.system.runTimeout(() => {
      if (e.player?.isValid?.()) restoreWerewolfGear(e.player);
    }, 5);
  } else {
    WEREWOLF_GEAR_STASH.delete(e.player.id);
  }
  clearUndeadPlayerState(e.player);
  HALFLING_MOUNT_GRACE.delete(e.player.id);
  HALFLING_DISMOUNT_TRACKED.delete(e.player.id);
  HALFLING_PICKPOCKET_COOLDOWN.delete(e.player.id);
  DWARF_VEIN_PENDING.delete(e.player.id);
  finishSirenSong(e.player.id, true);
  SIREN_CHARMED_BY.delete(e.player.id);
});

// ─────────────────────────────────────────────
//  DWARF: Vein Miner (sneak + break ore)
// ─────────────────────────────────────────────
try {
  mc.world.beforeEvents.playerBreakBlock.subscribe((event) => {
    const player = event.player;
    if (!player.hasTag("race_dwarf") || !player.isSneaking) return;

    const oreId = event.block?.typeId ?? "";
    if (!isOreBlock(oreId)) return;

    const loc = event.block.location;
    DWARF_VEIN_PENDING.set(player.id, {
      family: getOreFamily(oreId),
      x: Math.floor(loc.x),
      y: Math.floor(loc.y),
      z: Math.floor(loc.z),
    });
  });
} catch (_) {}

mc.world.afterEvents.playerBreakBlock.subscribe((event) => {
  const player = event.player;
  const pending = DWARF_VEIN_PENDING.get(player.id);
  DWARF_VEIN_PENDING.delete(player.id);

  if (!pending) return;
  if (!player.hasTag("race_dwarf")) return;

  const oreId = getBrokenOreId(event);
  if (!isOreBlock(oreId)) return;

  const origin = { x: pending.x, y: pending.y, z: pending.z };
  const family = pending.family;
  mc.system.run(() => mineOreVein(player, origin, family));
});

// ─────────────────────────────────────────────
//  UNDEAD: Grave Bound (mob ignore + villager trade block)
// ─────────────────────────────────────────────
function shouldBlockUndeadMobDamage(victim, damageSource) {
  if (!isUndeadRacePlayer(victim)) return false;
  const attacker = getUndeadMobAttacker(damageSource, victim);
  if (!attacker) return false;
  if (getUndeadMinionOwnerId(attacker.id) === victim.id) return false;
  if (isUndeadMinion(attacker.id)) return false;
  if (isUndeadMobProvoked(attacker.id, victim.id)) return false;
  return true;
}

function onUndeadBeforeHurt(event) {
  try {
    const victim = event.hurtEntity;
    if (!isUndeadRacePlayer(victim)) return;

    const attacker = event.damageSource?.damagingEntity;
    if (attacker?.typeId === "minecraft:iron_golem" && hasCarvedPumpkin(victim)) {
      event.cancel = true;
      pacifyIronGolem(attacker);
      return;
    }

    if (!attacker || attacker.typeId === "minecraft:player") {
      if (shouldBlockUndeadMobDamage(victim, event.damageSource)) {
        event.cancel = true;
      }
      return;
    }

    if (!entityIsUndeadMob(attacker)) return;
    if (isUndeadMobProvoked(attacker.id, victim.id)) return;

    event.cancel = true;
    pacifyUndeadMob(attacker);
  } catch (_) {}
}

function onUndeadAfterHurtGraveBound(event) {
  try {
    const victim = event.hurtEntity;
    if (!isUndeadRacePlayer(victim)) return;
    if (!shouldBlockUndeadMobDamage(victim, event.damageSource)) return;

    const damage = event.damage ?? 0;
    if (damage <= 0) return;

    mc.system.run(() => restoreGraveBoundHealth(victim, damage));
  } catch (_) {}
}

safeSubscribe(
  mc.world.beforeEvents?.entityHurt,
  onUndeadBeforeHurt,
  "beforeEvents.entityHurt"
);

safeSubscribe(
  mc.world.beforeEvents?.entityHurt,
  onSirenSongProtectBefore,
  "beforeEvents.entityHurt (siren song)"
);

mc.world.afterEvents.entityHurt.subscribe(onSirenSongProtectAfter);

safeSubscribe(
  mc.world.beforeEvents?.playerInteractWithEntity,
  (event) => {
    try {
      if (!blockUndeadVillagerTrade(event.player, event.target)) return;
      event.cancel = true;
      const player = event.player;
      mc.system.run(() => notifyUndeadTradeRefused(player));
    } catch (_) {}
  },
  "beforeEvents.playerInteractWithEntity"
);

safeSubscribe(
  mc.world.beforeEvents?.entityHitEntity,
  (event) => {
    try {
      if (!event.damagingEntity?.hasTag?.("race_halfling")) return;
      if (!isHalflingSneaking(event.damagingEntity)) return;
      if (!isPlayerEntity(event.hitEntity)) return;
      event.cancel = true;
    } catch (_) {}
  },
  "beforeEvents.entityHitEntity (halfling pickpocket)"
);

mc.world.afterEvents.entityHitEntity.subscribe(onHalflingPickpocketHitEntity);

// A mob/player held in a werewolf's grip can't land attacks.
safeSubscribe(
  mc.world.beforeEvents?.entityHitEntity,
  (event) => {
    try {
      const attacker = event.damagingEntity;
      if (attacker && WEREWOLF_DRAGGED_BY.has(attacker.id)) {
        event.cancel = true;
      }
    } catch (_) {}
  },
  "beforeEvents.entityHitEntity (werewolf drag suppress)"
);

safeSubscribe(
  mc.world.beforeEvents?.entityHurt,
  onLeoninWeaponBanBeforeHurt,
  "beforeEvents.entityHurt (leonin weapon ban)"
);

mc.world.afterEvents.entityHurt.subscribe(onLeoninWeaponBanAfterHurt);

mc.world.afterEvents.entityHitEntity.subscribe(onLeoninWeaponBanHitEntity);

safeSubscribe(
  mc.world.beforeEvents?.entityHitEntity,
  (event) => {
    try {
      const target = event.hitEntity;
      if (!(target instanceof mc.Player) || !target.hasTag("race_siren")) return;
      if (!isSirenSinging(target.id)) return;
      event.cancel = true;
    } catch (_) {}
  },
  "beforeEvents.entityHitEntity (siren song)"
);

safeSubscribe(
  mc.world.beforeEvents?.itemUse,
  onWeaponBanBeforeItemUse,
  "beforeEvents.itemUse (weapon ban)"
);

safeSubscribe(
  mc.world.beforeEvents?.itemUse,
  onVampireFoodBeforeItemUse,
  "beforeEvents.itemUse (vampire diet)"
);

// Always heal Grave Bound damage in afterEvents (beforeEvents cancel alone is unreliable)
mc.world.afterEvents.entityHurt.subscribe(onUndeadAfterHurtGraveBound);

mc.world.afterEvents.entityHurt.subscribe((event) => {
  try {
    onVampireFeedInterruptHurt(event);
  } catch (_) {}
});

mc.world.afterEvents.entityHurt.subscribe((event) => {
  try {
    const victim = event.hurtEntity;
    if (isUndeadRacePlayer(victim)) {
      mc.system.run(() => syncUndeadUndying(victim));

      const attacker = event.damageSource?.damagingEntity;
      if (attacker?.isValid?.() && attacker.id !== victim.id) {
        if (!(isUndeadMinion(attacker.id) && getUndeadMinionOwnerId(attacker.id) === victim.id)) {
          commandUndeadMinionsAttack(victim, attacker);
        }
      }
    }

    const attacker = event.damageSource?.damagingEntity;
    if (!isUndeadRacePlayer(attacker)) return;

    if (victim?.isValid?.() && shouldCommandUndeadMinionsAgainst(attacker, victim)) {
      commandUndeadMinionsAttack(attacker, victim);
    }

    if (victim && entityIsUndeadMob(victim)) {
      if (getUndeadMinionOwnerId(victim.id) === attacker.id) return;
      if (!isUndeadMinion(victim.id)) {
        markUndeadMobProvoked(victim, attacker);
      }
    }
  } catch (_) {}
});

mc.world.afterEvents.entityHitEntity.subscribe((event) => {
  try {
    if (event.hitEntity instanceof mc.Player && isVampireFeeding(event.hitEntity)) {
      onVampireFeedInterruptHit(event);
      return;
    }

    const attacker = event.damagingEntity;
    const target = event.hitEntity;
    if (!target?.isValid?.()) return;

    if (
      isUndeadRacePlayer(attacker)
      && isPlayerSneaking(attacker)
      && isUndeadMinion(target.id)
      && getUndeadMinionOwnerId(target.id) === attacker.id
    ) {
      releaseUndeadMinionWithFeedback(attacker, target);
      return;
    }

    tryLeoninClawBonus(attacker, target);

    if (!shouldCommandUndeadMinionsAgainst(attacker, target)) return;
    commandUndeadMinionsAttack(attacker, target);
  } catch (_) {}
});

safeSubscribe(
  mc.world.beforeEvents?.entityItemPickup,
  onUndeadFleshPickupBefore,
  "beforeEvents.entityItemPickup (undead bind)"
);

// ─────────────────────────────────────────────
//  ACTIVE ABILITIES: Crouch + Jump
//  Tiefling: Hellfire | Dragonborn: Breath
// ─────────────────────────────────────────────
const ABILITY_COOLDOWN_MS = 20000;

function isAbilityRace(race) {
  return race?.key === "tiefling" || race?.key === "dragonborn" || race?.key === "siren";
}

function tryTriggerAbility(player, race) {
  if (!isAbilityRace(race)) return;
  if (!player.isSneaking) return;
  if (race?.key === "siren" && isSirenSinging(player.id)) return;
  triggerAbility(player, race);
}

function getPerpendicularBasis(dir) {
  const perpA = { x: -dir.z, y: 0, z: dir.x };
  const perpALen = Math.sqrt(perpA.x * perpA.x + perpA.z * perpA.z) || 1;
  perpA.x /= perpALen;
  perpA.z /= perpALen;
  const perpB = {
    x: dir.y * perpA.z - dir.z * perpA.y,
    y: dir.z * perpA.x - dir.x * perpA.z,
    z: dir.x * perpA.y - dir.y * perpA.x,
  };
  return { perpA, perpB };
}

function offsetOnDisk(perpA, perpB, radius, angle) {
  return {
    x: (Math.cos(angle) * perpA.x + Math.sin(angle) * perpB.x) * radius,
    y: (Math.cos(angle) * perpA.y + Math.sin(angle) * perpB.y) * radius,
    z: (Math.cos(angle) * perpA.z + Math.sin(angle) * perpB.z) * radius,
  };
}

function spawnHellfireWave(player, origin) {
  const dim = player.dimension;
  const MAX_RADIUS = 5;
  const WAVE_SPEED = 2;

  for (let r = 1; r <= MAX_RADIUS; r++) {
    mc.system.runTimeout(() => {
      const ringParticles = Math.max(28, r * 16);

      for (let j = 0; j < ringParticles; j++) {
        const angle = (j / ringParticles) * Math.PI * 2;
        const px = origin.x + Math.cos(angle) * r;
        const pz = origin.z + Math.sin(angle) * r;

        for (const h of [0.05, 0.45, 0.95, 1.5, 2.1, 2.7]) {
          spawnParticleSafe(dim, "minecraft:basic_flame_particle", { x: px, y: origin.y + h, z: pz });
        }

        if (j % 2 === 0) {
          spawnParticleSafe(dim, "minecraft:basic_smoke_particle", { x: px, y: origin.y + 3.2, z: pz });
        }

        if (j % 3 === 0) {
          spawnParticleSafe(dim, "minecraft:lava_particle", { x: px, y: origin.y + 0.15, z: pz });
        }
      }

      const fillCount = r * 10;
      for (let f = 0; f < fillCount; f++) {
        const fillR = Math.random() * r;
        const fillAngle = Math.random() * Math.PI * 2;
        spawnParticleSafe(dim, "minecraft:basic_flame_particle", {
          x: origin.x + Math.cos(fillAngle) * fillR,
          y: origin.y + Math.random() * 2.2,
          z: origin.z + Math.sin(fillAngle) * fillR,
        });
      }

      for (let j = 0; j < ringParticles; j += 2) {
        const angle = (j / ringParticles) * Math.PI * 2;
        const innerR = r * 0.65;
        const px = origin.x + Math.cos(angle) * innerR;
        const pz = origin.z + Math.sin(angle) * innerR;
        spawnParticleSafe(dim, "minecraft:basic_smoke_particle", { x: px, y: origin.y + 1.2, z: pz });
      }
    }, r * WAVE_SPEED);
  }

  for (let pulse = 0; pulse < 5; pulse++) {
    mc.system.runTimeout(() => {
      for (let h = 0; h < 14; h++) {
        for (let k = 0; k < 5; k++) {
          spawnParticleSafe(dim, "minecraft:basic_flame_particle", {
            x: origin.x + (Math.random() - 0.5) * 1.4,
            y: origin.y + h * 0.3,
            z: origin.z + (Math.random() - 0.5) * 1.4,
          });
        }
      }
      spawnParticleSafe(dim, "minecraft:basic_smoke_particle", { x: origin.x, y: origin.y + 4.5, z: origin.z });
    }, pulse * 4);
  }
}

function spawnDragonBreathCone(player, head, dir) {
  const dim = player.dimension;
  const BREATH_RANGE = 8;
  const { perpA, perpB } = getPerpendicularBasis(dir);

  for (let m = 0; m < 24; m++) {
    const burst = 0.55;
    spawnParticleSafe(dim, "minecraft:basic_flame_particle", {
      x: head.x + (Math.random() - 0.5) * burst,
      y: head.y + (Math.random() - 0.5) * burst,
      z: head.z + (Math.random() - 0.5) * burst,
    });
  }

  for (let i = 1; i <= BREATH_RANGE; i++) {
    mc.system.runTimeout(() => {
      const spread = i * 0.24;
      const baseX = head.x + dir.x * i;
      const baseY = head.y + dir.y * i;
      const baseZ = head.z + dir.z * i;
      const ringSteps = Math.max(14, Math.floor(i * 3.5));

      for (let j = 0; j < ringSteps; j++) {
        const angle = (j / ringSteps) * Math.PI * 2;
        const outer = offsetOnDisk(perpA, perpB, spread, angle);
        const inner = offsetOnDisk(perpA, perpB, spread * 0.5, angle);

        spawnParticleSafe(dim, "minecraft:basic_flame_particle", {
          x: baseX + outer.x, y: baseY + outer.y, z: baseZ + outer.z,
        });
        spawnParticleSafe(dim, "minecraft:basic_flame_particle", {
          x: baseX + inner.x, y: baseY + inner.y, z: baseZ + inner.z,
        });

        if (j % 2 === 0) {
          spawnParticleSafe(dim, "minecraft:lava_particle", {
            x: baseX + inner.x, y: baseY + inner.y - 0.25, z: baseZ + inner.z,
          });
        }
      }

      const fillCount = Math.floor(i * i * 3);
      for (let f = 0; f < fillCount; f++) {
        const r = spread * Math.sqrt(Math.random());
        const angle = Math.random() * Math.PI * 2;
        const offset = offsetOnDisk(perpA, perpB, r, angle);
        spawnParticleSafe(dim, "minecraft:basic_flame_particle", {
          x: baseX + offset.x, y: baseY + offset.y, z: baseZ + offset.z,
        });
      }

      for (let c = 0; c < 6; c++) {
        spawnParticleSafe(dim, "minecraft:basic_flame_particle", {
          x: baseX + dir.x * c * 0.15,
          y: baseY + dir.y * c * 0.15,
          z: baseZ + dir.z * c * 0.15,
        });
      }

      if (i % 2 === 0) {
        for (let s = 0; s < 12; s++) {
          const sr = spread * Math.random();
          const sa = Math.random() * Math.PI * 2;
          const smoke = offsetOnDisk(perpA, perpB, sr, sa);
          spawnParticleSafe(dim, "minecraft:basic_smoke_particle", {
            x: baseX + smoke.x - dir.x * 0.6,
            y: baseY + smoke.y + 0.35,
            z: baseZ + smoke.z - dir.z * 0.6,
          });
        }
      }
    }, i);
  }
}

function isNightTime() {
  const t = mc.world.getTimeOfDay();
  return t >= 13000 && t < 23000;
}

function isWerewolfBeastForm(player) {
  return WEREWOLF_BEAST_ACTIVE.has(player.id);
}

function isWerewolfTransforming(player) {
  return WEREWOLF_TRANSFORMING.has(player.id);
}

function cloneEquippedItem(item) {
  if (!item) return undefined;
  try {
    if (typeof item.clone === "function") return item.clone();
  } catch (_) {}
  try {
    return new ItemStack(item.typeId, item.amount);
  } catch (_) {
    return undefined;
  }
}

function refreshWerewolfEquipmentSlot(player, slot, item) {
  try {
    const equip = player.getComponent("minecraft:equippable");
    if (!equip || !item) return;
    equip.setEquipment(slot, undefined);
    mc.system.runTimeout(() => {
      try {
        if (!player?.isValid?.()) return;
        player.getComponent("minecraft:equippable")?.setEquipment(slot, item);
      } catch (_) {}
    }, 1);
  } catch (_) {}
}

function scheduleWerewolfEquipmentRefresh(player) {
  if (!player?.isValid?.()) return;
  try {
    const equip = player.getComponent("minecraft:equippable");
    if (!equip) return;
    for (const slot of WEREWOLF_STASH_SLOTS) {
      const item = equip.getEquipment(slot);
      if (item) refreshWerewolfEquipmentSlot(player, slot, cloneEquippedItem(item) ?? item);
    }
  } catch (_) {}
  mc.system.runTimeout(() => {
    if (player?.isValid?.()) scheduleWerewolfEquipmentRefreshPass(player);
  }, 12);
}

function scheduleWerewolfEquipmentRefreshPass(player) {
  if (!player?.isValid?.()) return;
  try {
    const equip = player.getComponent("minecraft:equippable");
    if (!equip) return;
    for (const slot of WEREWOLF_STASH_SLOTS) {
      const item = equip.getEquipment(slot);
      if (item) refreshWerewolfEquipmentSlot(player, slot, cloneEquippedItem(item) ?? item);
    }
  } catch (_) {}
}

function stashWerewolfGear(player) {
  try {
    const equip = player.getComponent("minecraft:equippable");
    if (!equip) return;

    const stash = { ...(WEREWOLF_GEAR_STASH.get(player.id) ?? {}) };
    for (const slot of WEREWOLF_STASH_SLOTS) {
      const item = equip.getEquipment(slot);
      if (!item) continue;
      const clone = cloneEquippedItem(item);
      if (!clone) continue;
      stash[slot] = clone;
      equip.setEquipment(slot, undefined);
    }

    if (Object.keys(stash).length > 0) {
      WEREWOLF_GEAR_STASH.set(player.id, stash);
    }
  } catch (_) {}
}

function restoreWerewolfGear(player) {
  const stash = WEREWOLF_GEAR_STASH.get(player.id);
  if (!stash) {
    scheduleWerewolfEquipmentRefresh(player);
    return;
  }

  WEREWOLF_GEAR_STASH.delete(player.id);
  try {
    const equip = player.getComponent("minecraft:equippable");
    if (!equip) return;
    for (const slot of WEREWOLF_STASH_SLOTS) {
      const item = stash[slot];
      if (item) equip.setEquipment(slot, item);
    }
  } catch (_) {}

  mc.system.runTimeout(() => {
    if (player?.isValid?.()) scheduleWerewolfEquipmentRefresh(player);
  }, 2);
}

function forceRestoreWerewolfStash(player) {
  if (!player) return;
  if (!WEREWOLF_GEAR_STASH.has(player.id)) return;
  try {
    if (!player.isValid()) {
      WEREWOLF_GEAR_STASH.delete(player.id);
      return;
    }
  } catch (_) {
    WEREWOLF_GEAR_STASH.delete(player.id);
    return;
  }
  restoreWerewolfGear(player);
}

function spawnWerewolfTransformBurst(player, toBeast, progress, finale = false) {
  const dim = player.dimension;
  const loc = player.location;
  const ringCount = finale ? 30 : 12 + Math.floor(progress * 14);
  const height = 1.0 + progress * 1.1;

  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2 + progress * Math.PI * 1.4;
    const radius = 0.35 + Math.random() * 1.15;
    const px = loc.x + Math.cos(angle) * radius;
    const py = loc.y + 0.15 + Math.random() * height * 1.7;
    const pz = loc.z + Math.sin(angle) * radius;
    spawnParticleSafe(dim, "minecraft:large_smoke_particle", { x: px, y: py, z: pz });
    if (i % 2 === 0) {
      spawnParticleSafe(dim, "minecraft:basic_smoke_particle", {
        x: px + (Math.random() - 0.5) * 0.25,
        y: py + 0.1,
        z: pz + (Math.random() - 0.5) * 0.25,
      });
    }
    if (toBeast && i % 3 === 0) {
      spawnParticleSafe(dim, "minecraft:endrod", { x: px, y: py + 0.2, z: pz });
    }
  }

  if (progress < 0.35 || finale) {
    spawnParticleSafe(dim, "minecraft:cauldron_explosion_emitter", {
      x: loc.x,
      y: loc.y + 1.0,
      z: loc.z,
    });
  }

  if (!toBeast) {
    spawnParticleSafe(dim, "minecraft:villager_happy", {
      x: loc.x,
      y: loc.y + 1.4,
      z: loc.z,
    });
  }
}

function runWerewolfTransformSequence(player, kind, onSwap) {
  if (!player?.isValid?.()) return false;
  if (WEREWOLF_TRANSFORMING.has(player.id)) return false;

  const toBeast = kind === "beast";
  WEREWOLF_TRANSFORMING.add(player.id);

  const dim = player.dimension;
  try {
    player.addEffect("blindness", 42, { amplifier: 0, showParticles: false });
    player.addEffect("slowness", 42, { amplifier: 4, showParticles: false });
  } catch (_) {}

  try {
    player.onScreenDisplay?.setActionBar?.(toBeast ? "§8§oShifting..." : "§7§oReverting...");
    player.runCommand(`title @s subtitle ${toBeast ? "§8§oThe moon calls..." : "§7§oSunlight returns..."}`);
  } catch (_) {}

  try {
    dim.playSound(toBeast ? "mob.wolf.growl" : "mob.wolf.whine", player.location, {
      volume: 1.1,
      pitch: toBeast ? 0.65 : 1.0,
    });
  } catch (_) {}
  mc.system.runTimeout(() => {
    try {
      if (player?.isValid?.()) {
        dim.playSound("mob.evocation_illager.prepare_attack", player.location, {
          volume: 0.45,
          pitch: toBeast ? 0.35 : 0.55,
        });
      }
    } catch (_) {}
  }, 4);

  for (let tick = 0; tick <= WEREWOLF_TRANSFORM_TICKS; tick++) {
    mc.system.runTimeout(() => {
      if (!player?.isValid?.()) return;
      spawnWerewolfTransformBurst(player, toBeast, tick / WEREWOLF_TRANSFORM_TICKS);
    }, tick);
  }

  mc.system.runTimeout(() => {
    try {
      if (player?.isValid?.()) onSwap?.(player);
    } catch (_) {}

    mc.system.runTimeout(() => {
      if (player?.isValid?.()) {
        spawnWerewolfTransformBurst(player, toBeast, 1, true);
        try {
          dim.playSound(
            toBeast ? "mob.wolf.howl" : "random.pop",
            player.location,
            { volume: toBeast ? 0.55 : 0.35, pitch: toBeast ? 1.15 : 1.4 },
          );
        } catch (_) {}
      }
      WEREWOLF_TRANSFORMING.delete(player.id);
    }, 8);
  }, WEREWOLF_TRANSFORM_TICKS);

  return true;
}

function syncWerewolfBeastBuffs(player) {
  if (!player.hasTag("race_werewolf") || !isWerewolfBeastForm(player)) return;
  try {
    player.addEffect("speed", 40, { amplifier: 1, showParticles: false });
    player.addEffect("strength", 40, { amplifier: 1, showParticles: false });
    player.addEffect("resistance", 40, { amplifier: 1, showParticles: false });
  } catch (_) {}
}

function clearWerewolfBeastBuffs(player) {
  try {
    player.removeEffect("speed");
    player.removeEffect("strength");
    player.removeEffect("resistance");
  } catch (_) {}
}

function isBedBlock(typeId) {
  return !!typeId && (typeId === "minecraft:bed" || typeId.endsWith("_bed"));
}

function isPlayerNearBedBlock(player) {
  const dim = player.dimension;
  const loc = player.location;
  const fx = Math.floor(loc.x);
  const fy = Math.floor(loc.y);
  const fz = Math.floor(loc.z);

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        try {
          const block = dim.getBlock({ x: fx + dx, y: fy + dy, z: fz + dz });
          if (isBedBlock(block?.typeId)) return true;
        } catch (_) {}
      }
    }
  }
  return false;
}

function isPlayerCrouchingAtBed(player) {
  try {
    if (!player.isSneaking) return false;
  } catch (_) {
    return false;
  }
  return isPlayerNearBedBlock(player);
}

function ensureWerewolfReversionDebuffs(player) {
  if (!WEREWOLF_REVERSION_SICK.has(player.id)) return;
  const forced = WEREWOLF_FORCED_REVERSION.has(player.id);
  try {
    player.addEffect("weakness", 80, { amplifier: 0, showParticles: true });
    player.addEffect("slowness", 80, { amplifier: 0, showParticles: true });
    player.addEffect("mining_fatigue", 80, { amplifier: 0, showParticles: false });
    if (forced) {
      player.addEffect("nausea", 80, { amplifier: 0, showParticles: true });
    }
  } catch (_) {}
}

function clearWerewolfReversionSickness(playerOrId) {
  const id = typeof playerOrId === "string" ? playerOrId : playerOrId?.id;
  if (!id) return;

  WEREWOLF_REVERSION_SICK.delete(id);
  WEREWOLF_FORCED_REVERSION.delete(id);
  WEREWOLF_BED_REST_SECONDS.delete(id);

  let player = typeof playerOrId === "string"
    ? undefined
    : playerOrId;
  if (!player?.isValid?.()) {
    try {
      player = mc.world.getAllPlayers().find((p) => p.id === id);
    } catch (_) {
      player = undefined;
    }
  }

  if (!player?.isValid?.()) return;
  try {
    player.removeEffect("weakness");
    player.removeEffect("slowness");
    player.removeEffect("mining_fatigue");
    player.removeEffect("nausea");
  } catch (_) {}
}

function applyWerewolfHumanRevertDebuff(player, forced = false) {
  if (!player?.isValid?.() || !player.hasTag("race_werewolf")) return;

  WEREWOLF_REVERSION_SICK.add(player.id);
  if (forced) {
    WEREWOLF_FORCED_REVERSION.add(player.id);
  } else {
    WEREWOLF_FORCED_REVERSION.delete(player.id);
  }
  WEREWOLF_BED_REST_SECONDS.delete(player.id);
  ensureWerewolfReversionDebuffs(player);

  player.onScreenDisplay?.setActionBar?.("§7Reversion sickness");
  if (forced) {
    player.sendMessage("§7A luz do sol arranca a fera de você e você se sente esgotado.");
  } else {
    player.sendMessage("§7A fera recua, deixando você fraco e lento.");
  }
  player.sendMessage(`§7Agache em uma cama por ${WEREWOLF_REST_REQUIRED_SECONDS} segundos para se recuperar.`);
}

function syncWerewolfReversionSickness(player) {
  if (!player.hasTag("race_werewolf")) return;
  if (!WEREWOLF_REVERSION_SICK.has(player.id)) return;

  ensureWerewolfReversionDebuffs(player);

  if (isPlayerCrouchingAtBed(player)) {
    const rested = (WEREWOLF_BED_REST_SECONDS.get(player.id) ?? 0) + 1;
    WEREWOLF_BED_REST_SECONDS.set(player.id, rested);

    if (rested >= WEREWOLF_REST_REQUIRED_SECONDS) {
      clearWerewolfReversionSickness(player);
      player.sendMessage("§aUm longo descanso afasta o mal-estar da reversão.");
      player.onScreenDisplay?.setActionBar?.("§aRecovered");
      return;
    }

    const remaining = WEREWOLF_REST_REQUIRED_SECONDS - rested;
    player.onScreenDisplay?.setActionBar?.(`§7Descansando na cama... ${remaining} s`);
    return;
  }

  if (isPlayerNearBedBlock(player) && WEREWOLF_BED_REST_SECONDS.has(player.id)) {
    player.onScreenDisplay?.setActionBar?.("§7Agache na cama para continuar descansando");
  }

  WEREWOLF_BED_REST_SECONDS.delete(player.id);
}

function revertWerewolfHumanForm(player, forced = false) {
  if (!player.hasTag("race_werewolf")) return;
  if (!isWerewolfBeastForm(player)) return;
  if (isWerewolfTransforming(player)) return;

  runWerewolfTransformSequence(player, "human", (p) => {
    WEREWOLF_BEAST_ACTIVE.delete(p.id);
    clearWerewolfBeastBuffs(p);
    releaseWerewolfDrag(p, false);
    try {
      p.triggerEvent("race:werewolf_set_human");
    } catch (_) {}

    mc.system.runTimeout(() => {
      if (p?.isValid?.()) {
        restoreWerewolfGear(p);
        applyWerewolfHumanRevertDebuff(p, forced);
      }
    }, 2);

    if (forced) {
      p.onScreenDisplay?.setActionBar?.("§7Human form");
    }
  });
}

function enterWerewolfBeastForm(player) {
  if (!player.hasTag("race_werewolf")) return false;
  if (!isNightTime()) {
    player.onScreenDisplay?.setActionBar?.("§7A fera só desperta à noite.");
    return false;
  }
  if (isWerewolfBeastForm(player)) return false;
  if (isWerewolfTransforming(player)) return false;

  const now = Date.now();
  const readyAt = WEREWOLF_TRANSFORM_COOLDOWNS.get(player.id) ?? 0;
  if (now < readyAt) {
    const secs = Math.ceil((readyAt - now) / 1000);
    player.onScreenDisplay?.setActionBar?.(`§8Beast form cooldown: ${secs}s`);
    return false;
  }

  const started = runWerewolfTransformSequence(player, "beast", (p) => {
    if (!p.hasTag("race_werewolf") || !isNightTime()) return;

    stashWerewolfGear(p);
    try {
      p.triggerEvent("race:werewolf_set_beast");
    } catch (_) {
      restoreWerewolfGear(p);
      return;
    }

    WEREWOLF_BEAST_ACTIVE.add(p.id);
    WEREWOLF_TRANSFORM_COOLDOWNS.set(p.id, Date.now() + WEREWOLF_TRANSFORM_CD_MS);
    syncWerewolfBeastBuffs(p);
    p.sendMessage("§8Você assume a forma de fera!");
    p.onScreenDisplay?.setActionBar?.("§8Beast form");
  });

  return started;
}

function syncWerewolfDayNightForm(player) {
  if (!player.hasTag("race_werewolf")) return;

  if (!isNightTime()) {
    if (isWerewolfBeastForm(player)) revertWerewolfHumanForm(player, true);
    return;
  }

  if (isWerewolfBeastForm(player)) syncWerewolfBeastBuffs(player);
}

function entityDistance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function isWerewolfLungeTarget(entity, predator) {
  if (!entity?.isValid?.()) return false;
  if (!predator?.isValid?.()) return false;
  if (entity.id === predator.id) return false;
  if (entity instanceof mc.Player) return true;
  try {
    return !!entity.getComponent("minecraft:health");
  } catch (_) {
    return false;
  }
}

function findWerewolfLungeTarget(player) {
  try {
    const hits = player.getEntitiesFromViewDirection({ maxDistance: WEREWOLF_LUNGE_RANGE });
    for (const hit of hits) {
      if (isWerewolfLungeTarget(hit.entity, player)) return hit.entity;
    }
  } catch (_) {}
  return undefined;
}

function applyWerewolfDragGrip(target) {
  try {
    target.addEffect("slowness", 120, { amplifier: 255, showParticles: false });
    target.addEffect("weakness", 120, { amplifier: 255, showParticles: false });
    target.addEffect("resistance", 120, { amplifier: 1, showParticles: false });
  } catch (_) {}
}

function clearWerewolfDragGrip(target) {
  if (!target?.isValid?.()) return;
  try {
    target.removeEffect("slowness");
    target.removeEffect("weakness");
    target.removeEffect("resistance");
  } catch (_) {}
}

function applyWerewolfDragPosition(predator, target) {
  const dir = predator.getViewDirection();
  const loc = predator.location;
  // Hold prey at arm's length, lifted off the ground and facing away, so melee
  // mobs stay outside their own attack reach and never trigger a swing.
  // Per-tick teleport lags behind a moving predator, so push the prey further
  // ahead while sprinting to compensate for the catch-up delay.
  let distance = WEREWOLF_DRAG_DISTANCE;
  try {
    if (predator.isSprinting) distance += WEREWOLF_DRAG_SPRINT_BONUS;
  } catch (_) {}
  const dragPos = {
    x: loc.x + dir.x * distance,
    y: loc.y + 0.85,
    z: loc.z + dir.z * distance,
  };
  try {
    const yaw = Math.atan2(-dir.x, dir.z) * (180 / Math.PI);
    target.teleport(dragPos, {
      dimension: predator.dimension,
      rotation: { x: 0, y: yaw },
    });
  } catch (_) {
    try {
      target.teleport(dragPos, { dimension: predator.dimension });
    } catch (_) {}
  }
  applyWerewolfDragGrip(target);
}

function releaseWerewolfDrag(predator, throwVictim) {
  const drag = WEREWOLF_DRAG.get(predator.id);
  if (!drag) return;

  WEREWOLF_DRAG.delete(predator.id);
  WEREWOLF_DRAGGED_BY.delete(drag.targetId);

  try {
    predator?.triggerEvent?.("rnr:werewolf_drag_stop");
  } catch (_) {}

  let target;
  try {
    target = mc.world.getEntity(drag.targetId);
  } catch (_) {
    target = undefined;
  }

  clearWerewolfDragGrip(target);

  if (throwVictim && target?.isValid?.() && predator?.isValid?.()) {
    const dir = predator.getViewDirection();
    applyKnockbackCompat(target, dir.x, dir.z, 2.8, 0.85);
    try {
      predator.dimension.playSound("random.anvil_land", target.location, { volume: 0.55, pitch: 1.35 });
    } catch (_) {}
    spawnParticleSafe(predator.dimension, "minecraft:critical_hit_emitter", target.location);
    predator.onScreenDisplay?.setActionBar?.("§8Thrown!");
    if (target instanceof mc.Player && target.id !== predator.id) {
      target.onScreenDisplay?.setActionBar?.("§8A fera arremessa você para longe!");
    }
  }
}

function startWerewolfDrag(predator, target) {
  if (!isWerewolfBeastForm(predator)) return false;
  if (!isWerewolfLungeTarget(target, predator)) return false;
  if (WEREWOLF_DRAG.has(predator.id)) return false;
  if (WEREWOLF_DRAGGED_BY.has(target.id)) return false;

  WEREWOLF_DRAG.set(predator.id, {
    targetId: target.id,
    endMs: Date.now() + WEREWOLF_DRAG_MS,
  });
  WEREWOLF_DRAGGED_BY.set(target.id, predator.id);

  try {
    predator.triggerEvent("rnr:werewolf_drag_start");
  } catch (_) {}

  applyWerewolfDragPosition(predator, target);
  predator.onScreenDisplay?.setActionBar?.("§8Dragging prey — 5s");
  if (target instanceof mc.Player && target.id !== predator.id) {
    target.onScreenDisplay?.setActionBar?.("§8O lobisomem pegou você!");
  }
  try {
    predator.dimension.playSound("mob.wolf.growl", predator.location, { volume: 1.0, pitch: 0.75 });
  } catch (_) {}
  return true;
}

function tryGrabWerewolfLungeTarget(predator, target) {
  if (!target?.isValid?.() || !predator?.isValid?.()) return;
  const dist = entityDistance(predator.location, target.location);
  if (dist > WEREWOLF_LUNGE_GRAB_RANGE) return;
  startWerewolfDrag(predator, target);
}

function triggerWerewolfLunge(player, forcedTarget) {
  if (!isWerewolfBeastForm(player)) return;
  if (WEREWOLF_DRAG.has(player.id)) {
    player.onScreenDisplay?.setActionBar?.("§8Já está arrastando uma presa.");
    return;
  }

  const now = Date.now();
  const last = WEREWOLF_LUNGE_COOLDOWNS.get(player.id) ?? 0;
  if (now - last < WEREWOLF_LUNGE_CD_MS) {
    const secs = Math.ceil((WEREWOLF_LUNGE_CD_MS - (now - last)) / 1000);
    player.onScreenDisplay?.setActionBar?.(`§8Lunge cooldown: ${secs}s`);
    return;
  }
  WEREWOLF_LUNGE_COOLDOWNS.set(player.id, now);

  const target = forcedTarget?.isValid?.() && isWerewolfLungeTarget(forcedTarget, player)
    ? forcedTarget
    : findWerewolfLungeTarget(player);

  const dim = player.dimension;
  const loc = player.location;

  if (!target) {
    const dir = player.getViewDirection();
    applyKnockbackCompat(player, dir.x, dir.z, 1.6, 0.2);
    player.onScreenDisplay?.setActionBar?.("§8Bote: nenhuma presa à vista.");
    try {
      dim.playSound("mob.wolf.step", loc, { volume: 0.9, pitch: 0.7 });
    } catch (_) {}
    return;
  }

  const dx = target.location.x - loc.x;
  const dz = target.location.z - loc.z;
  applyKnockbackCompat(player, dx, dz, 2.4, 0.35);
  spawnParticleSafe(dim, "minecraft:villager_angry", {
    x: loc.x + dx * 0.15,
    y: loc.y + 1.0,
    z: loc.z + dz * 0.15,
  });
  try {
    dim.playSound("mob.wolf.step", loc, { volume: 1.0, pitch: 0.65 });
  } catch (_) {}

  const targetId = target.id;
  mc.system.runTimeout(() => {
    if (!player?.isValid?.() || !isWerewolfBeastForm(player)) return;
    let prey;
    try {
      prey = mc.world.getEntity(targetId);
    } catch (_) {
      return;
    }
    if (!isWerewolfLungeTarget(prey, player)) return;
    tryGrabWerewolfLungeTarget(player, prey);
  }, 6);
}

function tickWerewolfDrags() {
  const now = Date.now();
  for (const [predatorId, drag] of [...WEREWOLF_DRAG.entries()]) {
    let predator;
    try {
      predator = mc.world.getEntity(predatorId);
    } catch (_) {
      predator = undefined;
    }

    if (!(predator instanceof mc.Player) || !predator.isValid?.() || !isWerewolfBeastForm(predator)) {
      if (predator instanceof mc.Player) releaseWerewolfDrag(predator, false);
      else {
        WEREWOLF_DRAG.delete(predatorId);
        WEREWOLF_DRAGGED_BY.delete(drag.targetId);
      }
      continue;
    }

    let target;
    try {
      target = mc.world.getEntity(drag.targetId);
    } catch (_) {
      target = undefined;
    }

    if (!isWerewolfLungeTarget(target, predator)) {
      releaseWerewolfDrag(predator, false);
      continue;
    }

    if (now >= drag.endMs) {
      releaseWerewolfDrag(predator, true);
      continue;
    }

    applyWerewolfDragPosition(predator, target);

    if (mc.system.currentTick % 20 === 0) {
      const secs = Math.ceil((drag.endMs - now) / 1000);
      predator.onScreenDisplay?.setActionBar?.(`§8Dragging prey — ${secs}s`);
    }
  }
}

function triggerWerewolfLeap(player) {
  if (!isWerewolfBeastForm(player)) return;
  if (WEREWOLF_DRAG.has(player.id)) {
    player.onScreenDisplay?.setActionBar?.("§8Não dá para saltar arrastando uma presa.");
    return;
  }

  const now = Date.now();
  const last = WEREWOLF_LEAP_COOLDOWNS.get(player.id) ?? 0;
  if (now - last < WEREWOLF_LEAP_CD_MS) {
    const secs = Math.ceil((WEREWOLF_LEAP_CD_MS - (now - last)) / 1000);
    player.onScreenDisplay?.setActionBar?.(`§8Leap cooldown: ${secs}s`);
    return;
  }
  WEREWOLF_LEAP_COOLDOWNS.set(player.id, now);

  const dim = player.dimension;
  const loc = player.location;
  const dir = player.getViewDirection();

  if (!applyKnockbackCompat(player, dir.x, dir.z, WEREWOLF_LEAP_FORWARD, WEREWOLF_LEAP_VERTICAL)) {
    try {
      player.applyImpulse({
        x: dir.x * WEREWOLF_LEAP_FORWARD * 0.3,
        y: WEREWOLF_LEAP_VERTICAL * 0.45,
        z: dir.z * WEREWOLF_LEAP_FORWARD * 0.3,
      });
    } catch (_) {}
  }

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    spawnParticleSafe(dim, "minecraft:basic_smoke_particle", {
      x: loc.x + Math.cos(angle) * 0.6,
      y: loc.y + 0.1,
      z: loc.z + Math.sin(angle) * 0.6,
    });
  }
  try {
    dim.playSound("mob.wolf.step", loc, { volume: 1.0, pitch: 0.8 });
  } catch (_) {}
  player.onScreenDisplay?.setActionBar?.("§8Beast Leap!");
}

function onWerewolfCrouchJump(player) {
  if (!player.hasTag("race_werewolf")) return;
  if (isWerewolfTransforming(player)) return;

  if (!isNightTime()) {
    player.onScreenDisplay?.setActionBar?.("§7Forma de fera só à noite.");
    return;
  }

  if (isWerewolfBeastForm(player)) {
    triggerWerewolfLeap(player);
    return;
  }

  enterWerewolfBeastForm(player);
}

function syncWerewolfNightBuffs(player) {
  syncWerewolfDayNightForm(player);
}

function triggerWerewolfHowl(player) {
  if (!isWerewolfBeastForm(player)) return;
  const now = Date.now();
  const last = WEREWOLF_HOWL_COOLDOWNS.get(player.id) ?? 0;
  if (now - last < WEREWOLF_HOWL_CD_MS) {
    const secs = Math.ceil((WEREWOLF_HOWL_CD_MS - (now - last)) / 1000);
    player.onScreenDisplay?.setActionBar?.(`§8Howl cooldown: ${secs}s`);
    return;
  }
  WEREWOLF_HOWL_COOLDOWNS.set(player.id, now);

  const dim = player.dimension;
  const loc = player.location;
  const nearby = dim.getEntities({ location: loc, maxDistance: WEREWOLF_HOWL_RADIUS });
  let mobCount = 0;

  for (const entity of nearby) {
    if (entity.id === player.id || entity instanceof mc.Player) continue;
    try {
      entity.addEffect("weakness", 120, { amplifier: 0, showParticles: true });
      entity.addEffect("slowness", 120, { amplifier: 0, showParticles: true });
      mobCount++;
    } catch (_) {}
  }

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    spawnParticleSafe(dim, "minecraft:villager_angry", {
      x: loc.x + Math.cos(angle) * 1.8,
      y: loc.y + 1.2,
      z: loc.z + Math.sin(angle) * 1.8,
    });
  }

  try {
    dim.playSound("mob.wolf.howl", loc, { volume: 1.2, pitch: 0.85 });
  } catch (_) {}

  player.onScreenDisplay?.setActionBar?.("§8Moon Howl!");
  if (mobCount > 0) {
    player.sendMessage(`§8Seu uivo perturba ${mobCount} criatura(s) próxima(s).`);
  }
}

function tryLeoninClawBonus(attacker, target) {
  if (!isLeoninClawsOut(attacker)) return;
  if (!target?.isValid?.() || target.id === attacker.id) return;

  const now = Date.now();
  if (now < (LEONIN_CLAW_CD.get(attacker.id) ?? 0)) return;
  LEONIN_CLAW_CD.set(attacker.id, now + 500);

  try {
    target.applyDamage(2, {
      cause: getEntityDamageCauseEntityAttack(),
      damagingEntity: attacker,
    });
  } catch (_) {}
}

function shouldLeoninRoarAffectMob(entity, roarer) {
  if (!entity?.isValid?.()) return false;
  if (isRealPlayerEntity(entity)) return false;

  const typeId = entity.typeId ?? "";
  if (
    typeId === "minecraft:item"
    || typeId === "minecraft:xp_orb"
    || typeId === "minecraft:armor_stand"
    || typeId === "minecraft:arrow"
    || typeId === "minecraft:snowball"
    || typeId === "minecraft:egg"
  ) {
    return false;
  }

  if (isUndeadMinion(entity.id) && getUndeadMinionOwnerId(entity.id) === roarer.id) {
    return false;
  }

  try {
    const tame = entity.getComponent("minecraft:is_tamed");
    const owner = tame?.tamedToPlayer ?? tame?.tamedTo;
    if (owner?.id === roarer.id) return false;
  } catch (_) {}

  return true;
}

function isRealPlayerEntity(entity) {
  return entity?.typeId === "minecraft:player";
}

function flingFromLeoninRoar(entity, roarerLoc, distanceBlocks, lift = LEONIN_ROAR_FLING_LIFT) {
  if (!entity?.isValid?.()) return false;

  const loc = entity.location;
  let dx = loc.x - roarerLoc.x;
  let dz = loc.z - roarerLoc.z;
  let dist = Math.sqrt(dx * dx + dz * dz);
  if (dist < 0.05) {
    const angle = Math.random() * Math.PI * 2;
    dx = Math.cos(angle);
    dz = Math.sin(angle);
    dist = 1;
  }

  const nx = dx / dist;
  const nz = dz / dist;
  const stepSizes = [distanceBlocks, distanceBlocks * 0.85, distanceBlocks * 0.7, distanceBlocks * 0.5];

  for (const step of stepSizes) {
    const next = {
      x: loc.x + nx * step,
      y: loc.y,
      z: loc.z + nz * step,
    };

    try {
      if (entity.tryTeleport(next, { keepVelocity: false, checkForBlocks: true })) {
        applyKnockbackCompat(entity, 0, 0, 0, lift);
        return true;
      }
    } catch (_) {}

    try {
      entity.teleport(next, { dimension: entity.dimension, keepVelocity: false });
      applyKnockbackCompat(entity, 0, 0, 0, lift);
      return true;
    } catch (_) {}
  }

  if (applyKnockbackCompat(entity, dx, dz, distanceBlocks * 0.72, lift)) {
    return true;
  }

  try {
    entity.applyImpulse({
      x: nx * distanceBlocks * 0.22,
      y: lift * 0.45,
      z: nz * distanceBlocks * 0.22,
    });
    return true;
  } catch (_) {
    return false;
  }
}

function flingMobFromLeoninRoar(mob, roarerLoc) {
  if (!mob?.isValid?.()) return false;

  pacifyUndeadMob(mob);
  if (mob.typeId === "minecraft:iron_golem") {
    pacifyIronGolem(mob);
  }

  return flingFromLeoninRoar(mob, roarerLoc, LEONIN_ROAR_MOB_FLING_BLOCKS);
}

function buffBeastfolkFromLeoninRoar(ally, roarerId) {
  if (!isRealPlayerEntity(ally)) return false;
  if (!isBeastfolkPlayer(ally)) return false;

  try {
    ally.addEffect("strength", LEONIN_ROAR_BEASTFOLK_BUFF_TICKS, {
      amplifier: 0,
      showParticles: true,
    });
    ally.addEffect("absorption", LEONIN_ROAR_BEASTFOLK_BUFF_TICKS, {
      amplifier: 0,
      showParticles: true,
    });
    if (ally.id !== roarerId) {
      ally.onScreenDisplay?.setActionBar?.("§6Rallied by a Leonin's roar!");
    }
    return true;
  } catch (_) {
    return false;
  }
}

function triggerLeoninRoar(player) {
  const now = Date.now();
  const last = LEONIN_ROAR_COOLDOWNS.get(player.id) ?? 0;
  if (now - last < LEONIN_ROAR_CD_MS) {
    const secs = Math.ceil((LEONIN_ROAR_CD_MS - (now - last)) / 1000);
    player.onScreenDisplay?.setActionBar?.(`§cRoar cooldown: ${secs}s`);
    return;
  }
  LEONIN_ROAR_COOLDOWNS.set(player.id, now);

  const dim = player.dimension;
  const loc = player.location;
  let mobCount = 0;
  let playerCount = 0;
  let beastfolkCount = 0;

  let nearby;
  try {
    nearby = dim.getEntities({ location: loc, maxDistance: LEONIN_ROAR_RADIUS });
  } catch (_) {
    nearby = [];
  }

  for (const entity of nearby) {
    if (entity.id === player.id) continue;

    if (isRealPlayerEntity(entity)) {
      const otherPlayer = resolvePlayerEntity(entity);
      if (!otherPlayer) continue;

      if (buffBeastfolkFromLeoninRoar(otherPlayer, player.id)) {
        beastfolkCount++;
        continue;
      }

      try {
        flingFromLeoninRoar(otherPlayer, loc, LEONIN_ROAR_PLAYER_FLING_BLOCKS);
        playerCount++;
      } catch (_) {}
      continue;
    }

    if (!shouldLeoninRoarAffectMob(entity, player)) continue;
    if (flingMobFromLeoninRoar(entity, loc)) {
      mobCount++;
    }
  }

  // Leonin counts as Beastfolk — rally self too.
  if (buffBeastfolkFromLeoninRoar(player, player.id)) {
    beastfolkCount++;
  }

  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const r = 2.2;
    spawnParticleSafe(dim, "minecraft:basic_smoke_particle", {
      x: loc.x + Math.cos(angle) * r,
      y: loc.y + 1.0,
      z: loc.z + Math.sin(angle) * r,
    });
    if (i % 2 === 0) {
      spawnParticleSafe(dim, "minecraft:endrod", {
        x: loc.x + Math.cos(angle) * (r * 0.7),
        y: loc.y + 1.35,
        z: loc.z + Math.sin(angle) * (r * 0.7),
      });
    }
  }

  try {
    dim.playSound("mob.ravager.roar", loc, { volume: 1.1, pitch: 0.95 });
  } catch (_) {}

  player.onScreenDisplay?.setActionBar?.("§6Lion's Roar!");
  const parts = [];
  if (mobCount > 0) parts.push(`${mobCount} mob(s) flung`);
  if (playerCount > 0) parts.push(`${playerCount} player(s) flung`);
  if (beastfolkCount > 0) parts.push(`${beastfolkCount} Beastfolk rallied`);
  if (parts.length > 0) {
    player.sendMessage(`§6Seu rugido: ${parts.join(", ")}.`);
  }
}

function triggerOrcFearYell(player) {
  const now = Date.now();
  const last = ORC_FEAR_COOLDOWNS.get(player.id) ?? 0;
  if (now - last < ORC_FEAR_COOLDOWN_MS) {
    const secs = Math.ceil((ORC_FEAR_COOLDOWN_MS - (now - last)) / 1000);
    player.onScreenDisplay?.setActionBar?.(`§cCooldown: ${secs}s`);
    return;
  }
  ORC_FEAR_COOLDOWNS.set(player.id, now);

  const dim = player.dimension;
  const loc = player.location;
  const nearby = dim.getEntities({ location: loc, maxDistance: ORC_FEAR_RADIUS });

  let mobCount = 0;
  let playerCount = 0;

  for (const entity of nearby) {
    if (entity.id === player.id) continue;

    if (entity instanceof mc.Player) {
      try {
        entity.addEffect("blindness", 160, { amplifier: 0, showParticles: true });
        entity.addEffect("weakness", 160, { amplifier: 1, showParticles: true });
        playerCount++;
      } catch (_) {}
      continue;
    }

    try {
      entity.addEffect("slowness", 200, { amplifier: 1, showParticles: true });
      entity.addEffect("weakness", 200, { amplifier: 1, showParticles: true });
      const dx = entity.location.x - loc.x;
      const dz = entity.location.z - loc.z;
      const dist = Math.sqrt(dx * dx + dz * dz) || 1;
      applyKnockbackCompat(entity, dx, dz, 1.2, 0.35);
      mobCount++;
    } catch (_) {}
  }

  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const r = 2.5;
    spawnParticleSafe(dim, "minecraft:basic_smoke_particle", {
      x: loc.x + Math.cos(angle) * r,
      y: loc.y + 1.0,
      z: loc.z + Math.sin(angle) * r,
    });
    spawnParticleSafe(dim, "minecraft:large_smoke_particle", {
      x: loc.x + Math.cos(angle) * (r * 0.5),
      y: loc.y + 1.4,
      z: loc.z + Math.sin(angle) * (r * 0.5),
    });
  }

  try {
    dim.playSound("mob.ravager.roar", loc, { volume: 1.3, pitch: 0.75 });
  } catch (_) {}

  player.onScreenDisplay?.setActionBar?.("§2Berserker's War Cry!");
  if (mobCount > 0 || playerCount > 0) {
    player.sendMessage(`§2Seu grito de guerra quebra ${mobCount} criatura(s) e aflige ${playerCount} jogador(es).`);
  }
}

mc.system.runInterval(() => {
  tickSirenSongChannels();
}, 2);

mc.system.runInterval(() => {
  for (const player of mc.world.getAllPlayers()) {
    if (!player.hasTag("race_siren")) continue;
    syncSirenWaterSpeed(player);
  }
}, 2);

mc.system.runInterval(() => {
  for (const player of mc.world.getAllPlayers()) {
    const input = readPlayerInputState(player);
    if (!input) continue;

    const race = getRace(player);
    const wasJumping = jumpTracked.get(player.id) ?? false;
    const { jumping, sneaking, onGround, falling } = input;
    const wasSneaking = sneakTracked.get(player.id) ?? false;
    const wasOnGround = onGroundTracked.get(player.id) ?? onGround;

    if (onGround) {
      ELF_AIR_DASH_READY.set(player.id, true);
      ELF_AIR_TICKS.set(player.id, 0);
      ELF_LEFT_VIA_JUMP.set(player.id, false);
      endElfCloudwake(player);
    } else {
      ELF_AIR_TICKS.set(player.id, (ELF_AIR_TICKS.get(player.id) ?? 0) + 1);
      if (wasOnGround && jumping) {
        ELF_LEFT_VIA_JUMP.set(player.id, true);
      }
    }

    if (ELF_CLOUDWAKE_ACTIVE.has(player.id) && !onGround && (mc.system.currentTick % 4 === 0)) {
      spawnCloudwakeFeet(player);
    }

    if (race?.key === "elf") {
      const airTicks = ELF_AIR_TICKS.get(player.id) ?? 0;
      const leftViaJump = ELF_LEFT_VIA_JUMP.get(player.id) ?? false;
      const jumpPressed = jumping && !wasJumping;
      const tapSecondJump = jumpPressed && !onGround && airTicks >= CLOUDWAKE_MIN_AIR_TICKS;
      const holdSecondJump = (
        jumping
        && !onGround
        && leftViaJump
        && falling
        && airTicks >= CLOUDWAKE_HOLD_FALL_TICKS
      );
      if (tapSecondJump || holdSecondJump) {
        tryElfCloudwake(player);
      }
    }

    if (isAbilityRace(race) && sneaking && jumping && !wasJumping) {
      triggerAbility(player, race);
    }

    if (race?.key === "werewolf" && sneaking && jumping && !wasJumping) {
      onWerewolfCrouchJump(player);
    }

    if (race?.key === "vampire" && (sneaking || isVampireSneaking(player)) && jumping && !wasJumping) {
      tryVampireCrouchJump(player);
    }

    if (race?.key === "orc") {
      const now = Date.now();
      if (jumping && !wasJumping && !wasSneaking) {
        ORC_JUMP_ARMED.set(player.id, now);
      }

      const armedAt = ORC_JUMP_ARMED.get(player.id);
      if (armedAt !== undefined && now - armedAt > ORC_FEAR_ARM_MS) {
        ORC_JUMP_ARMED.delete(player.id);
      }

      const armedAfterExpire = ORC_JUMP_ARMED.get(player.id);
      if (sneaking && !wasSneaking && armedAfterExpire !== undefined) {
        if (now - armedAfterExpire <= ORC_FEAR_ARM_MS) {
          triggerOrcFearYell(player);
        }
        ORC_JUMP_ARMED.delete(player.id);
      }
    }

    if (race?.key === "beastfolk_leonin") {
      const now = Date.now();
      if (jumping && !wasJumping && !wasSneaking) {
        LEONIN_ROAR_JUMP_ARMED.set(player.id, now);
      }

      const leoninArmedAt = LEONIN_ROAR_JUMP_ARMED.get(player.id);
      if (leoninArmedAt !== undefined && now - leoninArmedAt > LEONIN_ROAR_ARM_MS) {
        LEONIN_ROAR_JUMP_ARMED.delete(player.id);
      }

      const leoninArmed = LEONIN_ROAR_JUMP_ARMED.get(player.id);
      if (sneaking && !wasSneaking && leoninArmed !== undefined) {
        if (now - leoninArmed <= LEONIN_ROAR_ARM_MS) {
          triggerLeoninRoar(player);
        }
        LEONIN_ROAR_JUMP_ARMED.delete(player.id);
      }
    }

    jumpTracked.set(player.id, jumping);
    sneakTracked.set(player.id, sneaking);
    onGroundTracked.set(player.id, onGround);
  }

  tickWerewolfDrags();
  tickVampireFeedSessions();
  for (const player of mc.world.getAllPlayers()) {
    if (!isVampirePlayer(player)) continue;
    syncVampireSunExposureTimer(player);
    syncVampireSunBurn(player);
  }
}, 2);


mc.system.runInterval(() => {
  for (const player of mc.world.getAllPlayers()) {
    if (!player.hasTag("race_vampire")) continue;
    syncVampireBatFlight(player);
  }
}, 1);

function triggerAbility(player, race) {
  const now = Date.now();
  const last = COOLDOWNS.get(player.id) ?? 0;

  if (now - last < ABILITY_COOLDOWN_MS) {
    const secs = Math.ceil((ABILITY_COOLDOWN_MS - (now - last)) / 1000);
    player.onScreenDisplay?.setActionBar?.(`§cCooldown: ${secs}s`);
    return;
  }

  COOLDOWNS.set(player.id, now);

  if (race.key === "tiefling") {
    const nearby = player.dimension.getEntities({
      location: player.location,
      maxDistance: 5,
    });
    let mobCount = 0;
    let playerCount = 0;
    for (const entity of nearby) {
      if (entity.id === player.id) continue;
      try {
        entity.setOnFire(6);
        markHellfireVictim(entity, player);
        if (entity.typeId === "minecraft:player") {
          playerCount++;
        } else {
          mobCount++;
        }
      } catch (_) {}
    }
    const origin = { ...player.location };
    spawnHellfireWave(player, origin);

    try {
      player.dimension.playSound("mob.blaze.shoot", player.location, { volume: 0.8, pitch: 0.7 });
    } catch (_) {}
    const parts = [];
    if (mobCount > 0) parts.push(`${mobCount} mob(s)`);
    if (playerCount > 0) parts.push(`${playerCount} player(s)`);
    const summary = parts.length > 0 ? parts.join(" and ") : "nothing nearby";
    player.sendMessage(`§4Fogo do Inferno! ${summary} em chamas.`);
    player.onScreenDisplay?.setActionBar?.("§4Hellfire!");
  }

  if (race.key === "dragonborn") {
    const dir = player.getViewDirection();
    const head = player.getHeadLocation();
    const BREATH_RANGE = 8;
    const CONE_DOT = 0.55;

    // Find all entities in a forward cone
    const nearby = player.dimension.getEntities({
      location: player.location,
      maxDistance: BREATH_RANGE,
    });

    let count = 0;
    for (const entity of nearby) {
      if (entity.id === player.id) continue;
      if (entity.typeId === "minecraft:player") continue;

      // Dot product check — is entity within the forward cone?
      const dx = entity.location.x - head.x;
      const dy = entity.location.y - head.y;
      const dz = entity.location.z - head.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist === 0) continue;
      const dot = (dx / dist) * dir.x + (dy / dist) * dir.y + (dz / dist) * dir.z;
      if (dot < CONE_DOT) continue;

      try {
        entity.setOnFire(6);
      } catch (_) {}
      try {
        entity.applyDamage(6);
        count++;
      } catch (_) {
        try {
          entity.setOnFire(6);
          count++;
        } catch (_) {}
      }
    }

    spawnDragonBreathCone(player, head, dir);

    try {
      player.dimension.playSound("mob.enderdragon.flap", player.location, { volume: 0.6, pitch: 1.4 });
    } catch (_) {}
    player.sendMessage(`§cSopro de Dragão! Atingiu ${count} inimigos.`);
    player.onScreenDisplay?.setActionBar?.("§cDragon Breath!");
  }

  if (race.key === "siren") {
    if (isSirenSinging(player.id)) return;
    triggerSirenSong(player);
  }
}

// ─────────────────────────────────────────────
//  ACTIVE ABILITIES: Crouch + Hit (melee)
// ─────────────────────────────────────────────
safeSubscribe(
  mc.world.afterEvents?.entityHitEntity,
  (event) => {
    try {
      const attacker = event.damagingEntity;
      if (!(attacker instanceof mc.Player)) return;
      if (!attacker.hasTag("race_assigned")) return;

      const input = readPlayerInputState(attacker);
      if (!input?.sneaking) return;

      if (attacker.hasTag("race_halfling") && isPlayerEntity(event.hitEntity)) return;

      if (isWerewolfBeastForm(attacker) && isWerewolfLungeTarget(event.hitEntity, attacker)) {
        triggerWerewolfLunge(attacker, event.hitEntity);
        return;
      }

      if (isVampirePlayer(attacker)) {
        tryVampireFeed(attacker, event.hitEntity);
        return;
      }

      const race = getRace(attacker);
      if (isAbilityRace(race)) triggerAbility(attacker, race);
    } catch (_) {}
  },
  "afterEvents.entityHitEntity"
);

// ─────────────────────────────────────────────
//  ADMIN: tag player with "reset_race" to repick
// ─────────────────────────────────────────────
mc.system.runInterval(() => {
  for (const player of mc.world.getAllPlayers()) {
    if (player.hasTag("reset_race")) {
      resetPlayerRace(player);
    }
  }
}, 20);

// ─────────────────────────────────────────────
//  MILK FIX: Re-apply race effects when cleared
// ─────────────────────────────────────────────
function onItemUse(event) {
  const player = event.source;
  if (!(player instanceof mc.Player)) return;

  if (player.hasTag("race_halfling") && !getRideTarget(player) && isEmptyHandItem(event.itemStack)) {
    const mount = findMountTarget(player, 4);
    if (mount && tryMountHalfling(player, mount)) return;
  }

  if (event.itemStack?.typeId === "minecraft:milk_bucket") {
    if (player.hasTag("race_assigned")) restoreRaceAfterMilk(player);
    return;
  }

  if (player.hasTag("race_siren") && isWaterBottleItem(event.itemStack)) {
    markSirenWaterDrink(player, event.itemStack);
    return;
  }

  if (tryBeginVampireRitual(player, event.itemStack)) return;

  if (player.hasTag("race_vampire") && isVampireSneaking(player) && isEmptyHandItem(event.itemStack)) {
    tryVampireCrouchJump(player);
    return;
  }

  if (!player.hasTag("race_assigned") || !player.isSneaking) return;
  if (!isEmptyHandItem(event.itemStack)) return;

  tryTriggerAbility(player, getRace(player));
}

mc.world.afterEvents.itemUse.subscribe(onItemUse);

try {
  mc.world.afterEvents.playerHotbarSelectedSlotChange?.subscribe?.((event) => {
    scheduleLeoninCombatStanceSync(event.player);
  });
} catch (_) {}

try {
  mc.world.afterEvents.playerButtonInput?.subscribe?.((event) => {
    const player = event.player;
    if (!(player instanceof mc.Player)) return;

    if (event.button === "Sneak") {
      if (event.newButtonState === "Pressed") SNEAK_BUTTON_HELD.add(player.id);
      else if (event.newButtonState === "Released") SNEAK_BUTTON_HELD.delete(player.id);
      sneakTracked.set(player.id, event.newButtonState === "Pressed");
      return;
    }

    if (event.button === "Jump") {
      if (event.newButtonState === "Pressed") {
        JUMP_BUTTON_HELD.add(player.id);
        jumpTracked.set(player.id, true);
        tryElfCloudwake(player);
        if (player.hasTag("race_vampire") && isVampireSneaking(player)) {
          tryVampireCrouchJump(player);
        }
      } else if (event.newButtonState === "Released") {
        JUMP_BUTTON_HELD.delete(player.id);
        jumpTracked.set(player.id, false);
      }
      return;
    }

    if (event.newButtonState !== "Pressed") return;
  });
} catch (_) {}
mc.world.afterEvents.itemCompleteUse.subscribe((event) => {
  const player = event.source;
  if (!(player instanceof mc.Player)) return;
  if (event.itemStack?.typeId === "minecraft:milk_bucket" && player.hasTag("race_assigned")) {
    restoreRaceAfterMilk(player);
    return;
  }
  if (player.hasTag("race_siren")) {
    tryHydrateSirenFromDrink(player, event.itemStack);
  }
});
try {
  mc.world.afterEvents.itemReleaseUse?.subscribe?.((event) => {
    const player = event.source;
    if (!(player instanceof mc.Player)) return;
    if (!player.hasTag("race_siren")) return;
    if (!SIREN_WATER_DRINK_PENDING.has(player.id)) return;
    if (event.useDuration > 0 && event.itemStack && isWaterBottleItem(event.itemStack)) {
      return;
    }
    SIREN_WATER_DRINK_PENDING.delete(player.id);
  });
} catch (_) {}

try {
  mc.world.afterEvents.effectRemove?.subscribe?.((event) => {
    const entity = event.entity;
    if (!(entity instanceof mc.Player)) return;
    if (!entity.hasTag("race_assigned")) return;

    const race = getRace(entity);
    if (!race || race.effects.length === 0) return;

    const removed = event.effectType?.id ?? event.effectType;
    if (race.key === "beastfolk_leonin" && normalizeEffectId(removed) === "strength") {
      mc.system.run(() => syncLeoninCombatStance(entity));
      return;
    }

    if (!isRaceEffectId(race, removed)) return;

    restoreRaceAfterMilk(entity);
  });
} catch (_) {}

try {
  mc.world.afterEvents.worldLoad.subscribe(() => {
    mc.system.runTimeout(() => {
      for (const player of mc.world.getAllPlayers()) {
        finishSirenSong(player.id, true);
        unlockSirenMovement(player);
        const race = getRace(player);
        if (race) {
          syncRaceNameTag(player, race);
          applyRaceEntityGroupWithRetries(player, race);
          applyRaceHealthGroup(player, race);
          scheduleRaceHealthSync(player);
        }
      }
    }, 20);
  });
} catch (_) {}

mc.world.sendMessage("§arnr-v1.4-the-accursed loaded!");
mc.world.sendMessage("§7Ative as §eAPIs Beta§7 para todas as habilidades das raças.");
