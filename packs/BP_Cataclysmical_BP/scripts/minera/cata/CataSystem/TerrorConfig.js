import { world, system, TicksPerSecond } from "@minecraft/server";

const TerrorConfig = {
  baseChance: 0.03,
  maxStage: 5,

  trinketModifiers: {
    "mnra_cata:terror_eye": 0.8,
    "mnra_cata:phantasma_necklace": 1.5,
  },

  damagePerStage: 1,
};

const ElementalMobs = [
  "mnra_cata:feralbloom",
  "mnra_cata:gneiss_golem",
  "mnra_cata:verdant_sentinel",
  "mnra_cata:verdant_skeleton",
  "mnra_cata:solarium",
  "mnra_cata:solar_tesla",
  "mnra_cata:eternal_seal",
  "mnra_cata:sun_tribunal",
  "mnra_cata:lunar_wraith",
  "mnra_cata:lunar_guardian",
];

const ValidDamage = [
  "entityAttack",
  "entityExplosion",
  "projectile",
  "sonicBoom",
  "ramAttack",
  "maceSmash",
];

const TerrorStages = [
  { stage: 5, tag: "HasTerrorStage5" },
  { stage: 4, tag: "HasTerrorStage4" },
  { stage: 3, tag: "HasTerrorStage3" },
  { stage: 2, tag: "HasTerrorStage2" },
  { stage: 1, tag: "HasTerrorStage1" },
];


function getTerrorStage(player) {
  for (const stageObj of TerrorStages) {
    if (player.hasTag(stageObj.tag)) return stageObj.stage;
  }
  return 0;
}

function setTerrorStage(player, stage) {
  for (const stageObj of TerrorStages) {
    player.removeTag(stageObj.tag);
  }

  const newStage = TerrorStages.find(s => s.stage === stage);
  if (newStage) player.addTag(newStage.tag);
}

function getModifiedChance(player) {
  let chance = TerrorConfig.baseChance;

  for (const tag in TerrorConfig.trinketModifiers) {
    if (player.hasTag(tag)) {
      chance *= TerrorConfig.trinketModifiers[tag];
    }
  }

  return chance;
}

function terrorEffects(player, stage) {
  player.addEffect("darkness", TicksPerSecond * 8, { showParticles: false });

  if (stage >= 3) {
    player.addEffect("wither", TicksPerSecond * (stage + 0), { showParticles: false });
  }

  player.runCommand(`particle mnra_cata:terror_stage ~ ~ ~`);
  player.runCommand(`playsound sound.terror_ambient @a[r=32] ~ ~ ~`);
}

world.afterEvents.entityDie.subscribe(({ deadEntity, damageSource }) => {
  const player = damageSource.damagingEntity;
  if (!player || player.typeId !== "minecraft:player") return;

  if (!ElementalMobs.includes(deadEntity.typeId)) return;

  const chance = getModifiedChance(player);
  const roll = Math.random();

  if (roll > chance) return;

  let stage = getTerrorStage(player) + 1;

  if (stage > TerrorConfig.maxStage) {
    deadEntity.runCommand(`summon mnra_cata:soul_terror ~ ~ ~`);
    setTerrorStage(player, 0);
    return;
  }

  setTerrorStage(player, stage);
  terrorEffects(player, stage);

  if (stage === 5) {
    player.runCommand(`tellraw @s {"rawtext":[{"text":"§5Os Terrores estão observando..."}]}`);
  }
});

world.afterEvents.entityHurt.subscribe((data) => {
  const player = data.hurtEntity;
  const mob = data.damageSource.damagingEntity

  if (player.typeId !== "minecraft:player") return;

  if (!ValidDamage.includes(data.damageSource.cause)) return;

  const stage = getTerrorStage(player);
  if (stage <= 0) return;

  const extraDamage = stage * TerrorConfig.damagePerStage;

  system.run(() => {
    player.applyDamage(data.damage + extraDamage, { cause: "entityAttack" });

    for (let i = 0; i < stage; i++) {
      player.runCommand(`particle mnra_cata:terror_stage_damage ~ ~ ~`);
    }

    if (stage >= 3) {
      player.addEffect("wither", TicksPerSecond * (stage + 0), { amplifier: 0, showParticles: true });
    }

    if (stage >= 3 && Math.random() < 0.05 && mob) {
      const mob = data.hurtEntity;
      mob.runCommand(`summon mnra_cata:plasma ~ ~1 ~`);
    }
  });
});

//death
world.afterEvents.entityDie.subscribe(({ deadEntity, damageSource }) => {
  if (!deadEntity || deadEntity.typeId !== "minecraft:player") return;

  const stage = getTerrorStage(deadEntity);

  if (stage > 0) {
    for (let i = 0; i < stage; i++) {
      deadEntity.runCommand("particle mnra_cata:terror_player_death ~ ~1 ~");
    }
  }
  setTerrorStage(deadEntity, 0);
});



export function GetPlayerTerrorStage(player) {
  for (const entry of TerrorStages) {
    if (player.hasTag(entry.tag)) {
      return entry.stage;
    }
  }
  return 0;
}

export function SetPlayerTerrorStage(player, stage) {
  for (const entry of TerrorStages) {
    player.removeTag(entry.tag);
  }
  const found = TerrorStages.find(t => t.stage === stage);
  if (found) {
    player.addTag(found.tag);
  }
}

export function GivePlayerTerror(player) {
  if (!player) return;

  const current = GetPlayerTerrorStage(player);

  if (current >= 5) return;

  SetPlayerTerrorStage(player, current + 1);
}

export function RemovePlayerTerror(player) {
  if (!player) return;

  const current = GetPlayerTerrorStage(player);

  if (current <= 0) return;

  SetPlayerTerrorStage(player, current - 1);
}








