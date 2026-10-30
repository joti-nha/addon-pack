// ==========================================
// PILLAGER BOSS FIGHT SYSTEM (DEDICATED MODULE)
// ==========================================
import { world, system, ItemStack } from "@minecraft/server";

// Aliases for compatibility
const world12 = world;
const system9 = system;

// ==========================================
// BOSS DARK BALL & TELEGRAPH SYSTEM
// ==========================================
var BOSS_ATTACK_STATES = new Map();

function triggerBossDeath(boss, bState, dimension) {
  if (!boss || !boss.isValid() || bState.isDying) return;
  bState.isDying = true;
  try {
    boss.addTag("is_dying");
    boss.triggerEvent("rpg:start_taunt");
    const healthComp = boss.getComponent("minecraft:health");
    if (healthComp) {
      try { healthComp.setCurrentValue(20); } catch (e) {}
    }
    boss.addEffect("minecraft:resistance", 120, { amplifier: 255, showParticles: false });
    boss.addEffect("minecraft:slowness", 120, { amplifier: 255, showParticles: false });
    boss.playAnimation("death2");
    dimension.playSound("mob.enderdragon.death", boss.location, { volume: 1.0, pitch: 0.8 });
    dimension.spawnParticle("minecraft:huge_explosion_emitter", boss.location);
    dimension.runCommandAsync('title @a title §6VICTORY');
    dimension.runCommandAsync('title @a subtitle §eO Chefe Saqueador caiu!');
  } catch (e) {}

  system9.runTimeout(() => {
    try {
      if (boss.isValid()) {
        const loc = boss.location;
        dimension.spawnParticle("minecraft:dragon_breath_trail", loc);
        dimension.spawnParticle("minecraft:sculk_charge_pop_particle", loc);
        try { dimension.spawnItem(new ItemStack("minecraft:nether_star", 1), loc); } catch (e) {}
        try { dimension.spawnItem(new ItemStack("minecraft:diamond", 5), loc); } catch (e) {}
        try { dimension.runCommandAsync("summon xp_orb " + loc.x + " " + loc.y + " " + loc.z); } catch (e) {}
        BOSS_ATTACK_STATES.delete(boss.id);
        boss.remove();
      }
    } catch (e) {}
  }, 94);
}

// Memory Cleanup on Boss Death
world12.afterEvents.entityDie.subscribe((event) => {
  try {
    if (event.deadEntity && event.deadEntity.typeId === "rpg:pillager_boss") {
      BOSS_ATTACK_STATES.delete(event.deadEntity.id);
    }
  } catch (e) {}
});

// Boss & Clone Death Intercept on Damage
world12.afterEvents.entityHurt.subscribe((event) => {
  try {
    const hurtEntity = event.hurtEntity;
    if (!hurtEntity) return;

    if (hurtEntity.typeId === "rpg:pillager_boss") {
      let bState = BOSS_ATTACK_STATES.get(hurtEntity.id);
      if (bState && !bState.isDying) {
        const healthComp = hurtEntity.getComponent("minecraft:health");
        if (healthComp && (healthComp.currentValue <= 15 || (event.damage && event.damage >= healthComp.currentValue))) {
          triggerBossDeath(hurtEntity, bState, hurtEntity.dimension);
        }
      }
    } else if (hurtEntity.typeId === "rpg:pillager_boss_clone") {
      if (hurtEntity.hasTag("hit_once")) {
        try { hurtEntity.kill(); } catch (e) {
          try { hurtEntity.runCommand("kill @s"); } catch(err) {}
        }
      } else {
        try { hurtEntity.addTag("hit_once"); } catch (e) {}
      }
    }
  } catch (e) {}
});

system9.runInterval(() => {
  try {
    const players = world12.getAllPlayers();
    if (!players || players.length === 0) return;

    const currentTick = system9.currentTick;
    const dimensions = ["overworld", "nether", "the_end"];

    for (const dimName of dimensions) {
      let dimension;
      try {
        dimension = world12.getDimension(dimName);
      } catch (e) {
        continue;
      }
      if (!dimension) continue;
      
      const realBosses = dimension.getEntities({ type: "rpg:pillager_boss" });
      const fakeBosses = dimension.getEntities({ type: "rpg:pillager_boss_clone" });
      const bosses = [...realBosses, ...fakeBosses];

      for (const boss of bosses) {
        if (!boss.isValid()) continue;
        const isClone = boss.typeId === "rpg:pillager_boss_clone";

        // Infinite Regeneration I (Re-applied every 5 seconds so it doesn't interrupt healing ticks)
        if (!isClone && currentTick % 100 === 0) {
          try { boss.addEffect("minecraft:regeneration", 200, { amplifier: 0, showParticles: false }); } catch (e) {}
        }
        
        // Find nearest player to this boss in the same dimension
        let nearestPlayer = null;
        let minDist = 999;
        for (const p of players) {
          if (!p.isValid() || p.dimension.id !== dimension.id) continue;
          const dx = p.location.x - boss.location.x;
          const dy = p.location.y - boss.location.y;
          const dz = p.location.z - boss.location.z;
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (d < minDist) {
            minDist = d;
            nearestPlayer = p;
          }
        }

      if (!nearestPlayer) continue;

      const player = nearestPlayer;
      const bdx = player.location.x - boss.location.x;
      const bdz = player.location.z - boss.location.z;
      const horizDist = Math.sqrt(bdx * bdx + bdz * bdz) || 1;

      const variantComp = boss.getComponent("minecraft:variant");
      const variant = variantComp ? variantComp.value : 0;

      let bState = BOSS_ATTACK_STATES.get(boss.id);
      if (!bState) {
        bState = { state: "idle", nextAttackTick: 0, chargeStartTick: 0, targetLoc: null, shotsFired: 0, attackCount: 0, hasCloned: false, hasSpawnTaunted: false, hasTaunted80: false, hasTaunted40: false, isDying: false };
        BOSS_ATTACK_STATES.set(boss.id, bState);
      }

      // Stop all logic if boss is in dying animation
      if (bState.isDying) {
        continue;
      }

      const healthComp = boss.getComponent("minecraft:health");

      // Death check fallback in tick loop
      if (!isClone && healthComp && healthComp.currentValue <= 15) {
        triggerBossDeath(boss, bState, dimension);
        continue;
      }

      // 1. SPAWN TAUNT: Played once when the boss is first summoned
      if (!isClone && !bState.hasSpawnTaunted) {
        bState.hasSpawnTaunted = true;
        const tauntDuration = 115;
        bState.lastRoarTick = currentTick + tauntDuration;
        bState.nextAttackTick = currentTick + tauntDuration;
        try {
          boss.triggerEvent("rpg:start_taunt");
          boss.playAnimation("phase_2");
          boss.addEffect("minecraft:slowness", tauntDuration, { amplifier: 255, showParticles: false });
          boss.addEffect("minecraft:resistance", tauntDuration, { amplifier: 255, showParticles: false });
          dimension.playSound("mob.wither.spawn", boss.location, { volume: 1.0, pitch: 0.9 });
          dimension.runCommandAsync('title @a actionbar §cO Chefe Saqueador desafia você!');
        } catch (e) {}

        system9.runTimeout(() => {
          try {
            if (boss.isValid() && !bState.isDying) {
              boss.triggerEvent("rpg:stop_taunt");
            }
          } catch (e) {}
        }, 112);
        continue;
      }

      // 2. 80% HEALTH TAUNT: Flag/Staff battle cry taunt on ground
      if (!isClone && !bState.hasTaunted80 && bState.phase !== 2 && healthComp && healthComp.currentValue <= 800) {
        bState.hasTaunted80 = true;
        const tauntDuration = 115;
        bState.lastRoarTick = currentTick + tauntDuration;
        bState.nextAttackTick = currentTick + tauntDuration;
        try {
          boss.triggerEvent("rpg:start_taunt");
          boss.playAnimation("phase_2");
          boss.addEffect("minecraft:slowness", tauntDuration, { amplifier: 255, showParticles: false });
          boss.addEffect("minecraft:resistance", tauntDuration, { amplifier: 255, showParticles: false });
          dimension.playSound("ambient.weather.thunder", boss.location, { volume: 1.0, pitch: 1.0 });
          dimension.runCommandAsync('title @a actionbar §4O Chefe solta um grito de guerra sombrio!');
          dimension.spawnParticle("minecraft:large_explosion", boss.location);
        } catch (e) {}

        system9.runTimeout(() => {
          try {
            if (boss.isValid() && !bState.isDying) {
              boss.triggerEvent("rpg:stop_taunt");
            }
          } catch (e) {}
        }, 112);
        continue;
      }

      // Trigger 50% Phase 2 Transition (Roar -> Launch -> Hover)
      if (!isClone && bState.phase !== 2) {
        const healthComp = boss.getComponent("minecraft:health");
        if (healthComp && healthComp.currentValue <= 500) {
          bState.phase = 2; // Ensure it only triggers once
          
          bState.groundY = boss.location.y;
          bState.flyTargetY = bState.groundY + 3.0; // 3 full blocks above ground

          try { boss.addTag("phase_2"); } catch (e) {}
          try { boss.triggerEvent("rpg:idle_mode"); } catch (e) {}
          
          try {
            dimension.playSound("mob.wither.spawn", boss.location, { volume: 1.0, pitch: 0.8 });
            dimension.runCommandAsync('title @a actionbar §dO Chefe entra na Fase 2!');
          } catch (e) {}
          
          // Block head tracking so attempt_67 (roar) and fly (launch) animate cleanly without head twisting
          try { boss.triggerEvent("rpg:start_taunt"); } catch (e) {}
          try { boss.playAnimation("attempt_67"); } catch (e) {}
          
          // Total transition length: roar (42 ticks) + launch (60 ticks) = 102 ticks
          const transitionTicks = 102;
          bState.transitionEndTick = currentTick + transitionTicks;
          bState.nextAttackTick = currentTick + transitionTicks + 10;
          bState.lastRoarTick = currentTick + transitionTicks + 10;
          
          // Audio effect & fly launch animation when take-off begins (at tick 42)
          system9.runTimeout(() => {
            try {
              if (boss.isValid()) {
                boss.playAnimation("fly");
                dimension.playSound("mob.enderdragon.flap", boss.location, { volume: 1.0, pitch: 0.8 });
                dimension.spawnParticle("minecraft:knockback_roar_particle", boss.location);
              }
            } catch(e){}
          }, 42);

          // Once launch animation reaches 3 blocks height, elevate entity & hitbox into the air
          system9.runTimeout(() => {
            try {
              if (boss.isValid()) {
                boss.triggerEvent("rpg:stop_taunt");
                boss.triggerEvent("rpg:start_fly"); // Disable gravity
                const targetY = (bState.groundY != null ? bState.groundY : boss.location.y) + 3.0;
                bState.flyTargetY = targetY;
                boss.teleport({ x: boss.location.x, y: targetY, z: boss.location.z });
              }
            } catch(e){}
          }, transitionTicks);
          
          // Invulnerability & anchor during transition
          try { boss.addEffect("minecraft:slowness", transitionTicks + 5, { amplifier: 255, showParticles: false }); } catch(e){}
          try { boss.addEffect("minecraft:resistance", transitionTicks + 5, { amplifier: 255, showParticles: false }); } catch(e){}
        }
      }

      // Phase 2 Hover Anchor & FX (Entity + Hitbox 3 blocks in the air):
      const isAerialClone = (isClone && boss.hasTag("phase_2_clone"));
      if (isAerialClone && !bState.flyTargetY) {
        bState.flyTargetY = boss.location.y;
      }
      if ((!isClone && bState.phase === 2) || isAerialClone) {
        if (!isClone && bState.transitionEndTick && currentTick < bState.transitionEndTick) {
          // Transition FX: ground energy circle & feet lift particles
          try {
            const bLoc = boss.location;
            const numGroundP = 8;
            for (let i = 0; i < numGroundP; i++) {
              const ang = (i / numGroundP) * Math.PI * 2 + (currentTick * 0.3);
              const gx = bLoc.x + Math.cos(ang) * 2.0;
              const gz = bLoc.z + Math.sin(ang) * 2.0;
              dimension.spawnParticle("minecraft:dragon_breath_trail", { x: gx, y: bLoc.y + 0.1, z: gz });
            }
            dimension.spawnParticle("minecraft:basic_smoke_particle", { x: bLoc.x, y: bLoc.y + 0.3, z: bLoc.z });
            dimension.spawnParticle("minecraft:sculk_charge_pop_particle", { x: bLoc.x, y: bLoc.y + 0.5, z: bLoc.z });
          } catch(e){}
        } else {
          // Keep entity and hitbox locked at flyTargetY (3 blocks up in the air)
          if (bState.flyTargetY != null && Math.abs(boss.location.y - bState.flyTargetY) > 0.05) {
            try {
              const targetYaw = (Math.atan2(-bdx, bdz) * 180) / Math.PI;
              boss.teleport({ x: boss.location.x, y: bState.flyTargetY, z: boss.location.z }, { rotation: { y: targetYaw, x: 0 } });
            } catch(e){}
          }

          // Persistent hover FX: energy under the boss's floating feet and ground beacon
          if (currentTick % 4 === 0) {
            try {
              const bLoc = boss.location;
              // Particles at floating feet in the air
              dimension.spawnParticle("minecraft:dragon_breath_trail", { x: bLoc.x, y: bLoc.y - 0.2, z: bLoc.z });
              dimension.spawnParticle("minecraft:endrod", { x: bLoc.x + (Math.random() - 0.5), y: bLoc.y - 0.2, z: bLoc.z + (Math.random() - 0.5) });
              // Small beacon mark on the ground beneath boss
              if (bState.groundY != null) {
                dimension.spawnParticle("minecraft:sculk_charge_pop_particle", { x: bLoc.x, y: bState.groundY + 0.1, z: bLoc.z });
              }
            } catch(e){}
          }
        }
      }

      // Trigger 75% health clone split
      if (!isClone && !bState.hasCloned) {
        const healthComp = boss.getComponent("minecraft:health");
        if (healthComp && healthComp.currentValue <= 750) {
          bState.hasCloned = true;
          try { 
            dimension.playSound("mob.endermen.teleport", boss.location, { volume: 1.0, pitch: 0.5 });
            dimension.runCommandAsync('title @a actionbar §cO Chefe se dividiu em clones!');
          } catch (e) {}
          
          // Spawn 2 clones
          for (let i = 0; i < 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const cx = boss.location.x + Math.cos(angle) * 4;
            const cz = boss.location.z + Math.sin(angle) * 4;
            try {
              dimension.spawnEntity("rpg:pillager_boss_clone", { x: cx, y: boss.location.y, z: cz });
              dimension.spawnParticle("minecraft:huge_explosion_emitter", { x: cx, y: boss.location.y + 1, z: cz });
            } catch(e) {}
          }
          
          // Teleport real boss to a random position to shuffle them
          try {
            const angle = Math.random() * Math.PI * 2;
            const cx = boss.location.x + Math.cos(angle) * 4;
            const cz = boss.location.z + Math.sin(angle) * 4;
            dimension.spawnParticle("minecraft:huge_explosion_emitter", boss.location);
            boss.teleport({ x: cx, y: boss.location.y, z: cz });
            
            // Lock Boss state to prevent immediate attacking during the taunt
            bState.lastRoarTick = currentTick + 60;   // Delays melee attack for ~3 seconds
            bState.nextAttackTick = currentTick + 60; // Delays ranged attack for ~3 seconds
            
            // Play taunt animation with a small delay so it doesn't conflict
            system9.runTimeout(() => {
              try {
                if (boss.isValid()) {
                  boss.triggerEvent("rpg:start_taunt");
                  boss.playAnimation("taunt_2");
                  boss.addEffect("minecraft:slowness", 50, { amplifier: 255, showParticles: false }); // Lock boss in place while taunting
                  
                  // Stop the taunt block so head tracking resumes
                  system9.runTimeout(() => {
                    try { if (boss.isValid()) boss.triggerEvent("rpg:stop_taunt"); } catch(e){}
                  }, 50);
                }
              } catch(e){}
            }, 10); // 0.5s delay
            
            // Fire the 100% Dark Beam right after taunt finishes
            system9.runTimeout(() => {
              try {
                if (!boss.isValid() || !player.isValid()) return;
                
                const bLoc = boss.location;
                const handLoc = { x: bLoc.x, y: bLoc.y + 1.2, z: bLoc.z };
                const pLoc = player.location;
                
                const dx = pLoc.x - handLoc.x;
                const dy = (pLoc.y + 1.0) - handLoc.y;
                const dz = pLoc.z - handLoc.z;
                const mag = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
                const speed = 1.5;
                
                const ball = dimension.spawnEntity("rpg:purple_magic_arrow", handLoc);
                ball.nameTag = "clone_beam"; // Tag it for 100% darkness effect
                
                // INSTANTLY apply the effects to guarantee it hits (un-dodgeable effect)
                try {
                  player.addEffect("minecraft:darkness", 300, { amplifier: 0, showParticles: true }); // 15s
                  player.addEffect("minecraft:weakness", 300, { amplifier: 0, showParticles: true }); // 15s
                } catch(e) {
                  try { player.runCommand("effect @s darkness 15 0 true"); } catch(err){}
                  try { player.runCommand("effect @s weakness 15 0 true"); } catch(err){}
                }
                
                const proj = ball.getComponent("minecraft:projectile");
                if (proj && typeof proj.shoot === "function") {
                  proj.shoot({ x: (dx/mag)*speed, y: (dy/mag)*speed, z: (dz/mag)*speed });
                } else {
                  ball.applyImpulse({ x: (dx/mag)*speed, y: (dy/mag)*speed, z: (dz/mag)*speed });
                }
                dimension.playSound("mob.wither.shoot", bLoc, { volume: 1.0, pitch: 0.5 });
              } catch(e){}
            }, 55); // 2.75s delay (just as animation finishes)
          } catch(e) {}
        }
      }

      // 3. 40% HEALTH TAUNT: Airborne staff spinning taunt during Phase 2
      if (!isClone && !bState.hasTaunted40 && bState.phase === 2 && currentTick >= (bState.transitionEndTick || 0) && healthComp && healthComp.currentValue <= 400) {
        bState.hasTaunted40 = true;
        const tauntDuration = 115;
        bState.nextAttackTick = currentTick + tauntDuration;
        try {
          boss.triggerEvent("rpg:start_taunt");
          boss.playAnimation("phase_2");
          boss.addEffect("minecraft:resistance", tauntDuration, { amplifier: 255, showParticles: false });
          dimension.playSound("mob.enderdragon.flap", boss.location, { volume: 1.0, pitch: 0.7 });
          dimension.playSound("ambient.weather.thunder", boss.location, { volume: 0.8, pitch: 1.4 });
          dimension.runCommandAsync('title @a actionbar §5O Chefe canaliza o antigo poder do vazio!');
          dimension.spawnParticle("minecraft:dragon_breath_trail", boss.location);
          dimension.spawnParticle("minecraft:sculk_charge_pop_particle", boss.location);
        } catch (e) {}

        system9.runTimeout(() => {
          try {
            if (boss.isValid() && !bState.isDying) {
              boss.triggerEvent("rpg:stop_taunt");
            }
          } catch (e) {}
        }, 112);
        continue;
      }

      // Trigger 25% health aerial clone split (3 clones around real boss in the air)
      if (!isClone && !bState.hasCloned25 && bState.phase === 2) {
        const healthComp = boss.getComponent("minecraft:health");
        if (healthComp && healthComp.currentValue <= 250) {
          bState.hasCloned25 = true;
          try { 
            dimension.playSound("mob.wither.spawn", boss.location, { volume: 1.0, pitch: 1.2 });
            dimension.playSound("mob.endermen.teleport", boss.location, { volume: 1.0, pitch: 0.6 });
            dimension.runCommandAsync('title @a actionbar §cO Chefe invoca 3 Clones Aéreos!');
          } catch (e) {}

          const airY = (bState.flyTargetY != null) ? bState.flyTargetY : boss.location.y;
          const centerLoc = { x: boss.location.x, y: airY, z: boss.location.z };

          // Real boss stays in place!
          // 3 Clones spawn in a 2.5-block radius circle around the boss in the air
          const radius = 2.5;
          for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const cx = centerLoc.x + Math.cos(angle) * radius;
            const cz = centerLoc.z + Math.sin(angle) * radius;
            try {
              const clone = dimension.spawnEntity("rpg:pillager_boss_clone", { x: cx, y: airY, z: cz });
              if (clone) {
                clone.addTag("phase_2_clone");
                clone.triggerEvent("rpg:fly_mode");
                dimension.spawnParticle("minecraft:huge_explosion_emitter", { x: cx, y: airY, z: cz });
                dimension.spawnParticle("minecraft:dragon_breath_trail", { x: cx, y: airY, z: cz });
                dimension.spawnParticle("minecraft:sculk_charge_pop_particle", { x: cx, y: airY, z: cz });
              }
            } catch(e) {}
          }
        }
      }

      // MELEE MODE: Variant 0 - Shield Break Logic (Skipped in Phase 2)
      if (variant === 0 && horizDist <= 6.5 && bState.phase !== 2) {
        if (currentTick - (bState.lastRoarTick || 0) >= 40) {
          bState.lastRoarTick = currentTick; // Record that a roar just triggered
          
          // Wait 20 ticks (1 second) for the roar attack_time to complete
          system9.runTimeout(() => {
            try {
              if (!player.isValid()) return;
              // If player is blocking (sneaking) when the roar hits
              let shieldBlocked = false;
              if (player.isSneaking) {
                const eq = player.getComponent("minecraft:equippable");
                if (eq) {
                  let offItem = null;
                  let mainItem = null;
                  try { offItem = eq.getEquipment("Offhand"); } catch(e) {}
                  try { mainItem = eq.getEquipment("Mainhand"); } catch(e) {}

                  if (offItem && offItem.typeId === "minecraft:shield") {
                    shieldBlocked = true;
                    const dur = offItem.getComponent("minecraft:durability");
                    if (dur) {
                      dur.damage += 84;
                      if (dur.damage >= dur.maxDurability) {
                        try { eq.setEquipment("Offhand", undefined); } catch(e) {}
                        player.dimension.playSound("random.break", player.location);
                      } else {
                        try { eq.setEquipment("Offhand", offItem); } catch(e) {}
                        player.dimension.playSound("item.shield.block", player.location);
                      }
                    }
                  } else if (mainItem && mainItem.typeId === "minecraft:shield") {
                    shieldBlocked = true;
                    const dur = mainItem.getComponent("minecraft:durability");
                    if (dur) {
                      dur.damage += 84;
                      if (dur.damage >= dur.maxDurability) {
                        try { eq.setEquipment("Mainhand", undefined); } catch(e) {}
                        player.dimension.playSound("random.break", player.location);
                      } else {
                        try { eq.setEquipment("Mainhand", mainItem); } catch(e) {}
                        player.dimension.playSound("item.shield.block", player.location);
                      }
                    }
                  }
                }
              }

              // Apply TRUE DAMAGE if they didn't block and it's the real boss
              if (!shieldBlocked && !isClone) {
                const pHealth = player.getComponent("minecraft:health");
                if (pHealth) {
                  const newHp = Math.max(0, pHealth.currentValue - 6);
                  pHealth.setCurrentValue(newHp);
                  try { player.applyDamage(0.01, { cause: "magic" }); } catch(err) {} // Triggers screen shake and hurt animation
                }
              }
            } catch(e) {}
          }, 20);
        }
      }

      // RANGED MODE: Variant 1 (Phase 1) OR Phase 2 Airborne Combat (Boss & Aerial Clones)
      const inPhase2Combat = (!isClone && bState.phase === 2 && currentTick >= (bState.transitionEndTick || 0)) || isAerialClone;

      // Dynamic hand positioning and shooting animation in Phase 2 air combat
      if (inPhase2Combat) {
        if (horizDist <= 24.5 && player.isValid()) {
          if (variant !== 1) {
            try { boss.triggerEvent("rpg:ranged_mode"); } catch (e) {}
          }
        } else {
          if (variant !== 2) {
            try { boss.triggerEvent("rpg:idle_mode"); } catch (e) {}
          }
        }
      }

      if (variant === 1 || inPhase2Combat) {
        if (horizDist > 24.5 || !player.isValid()) {
          bState.state = "idle";
          bState.chargeStartTick = 0;
          continue;
        }

        // INSTANT ROTATION: Face player immediately so player can never sneak behind
        try {
          const targetYaw = (Math.atan2(-bdx, bdz) * 180) / Math.PI;
          boss.setRotation({ y: targetYaw, x: 0 });
        } catch (e) {
          try {
            const targetYaw = (Math.atan2(-bdx, bdz) * 180) / Math.PI;
            boss.teleport(boss.location, { rotation: { y: targetYaw, x: 0 } });
          } catch (err) {}
        }

        const currentTick = system9.currentTick;

        // ====================================================
        // POWER 1: VOID ABSORPTION SHIELD (EVERY 20 SECONDS)
        // ====================================================
        if (!bState.nextShieldTick) bState.nextShieldTick = currentTick + 400;
        if (currentTick >= bState.nextShieldTick) {
          bState.nextShieldTick = currentTick + 400; // Reset 20s timer
          bState.shieldEndTick = currentTick + 80;   // 4s duration
          dimension.playSound("item.trident.return", boss.location, { volume: 1.0, pitch: 0.8 });
          try {
            boss.addEffect("minecraft:resistance", 80, { amplifier: 4, showParticles: false });
          } catch (e) {
            try { boss.runCommand("effect @s resistance 4 4 true"); } catch (err) {}
          }
        }

        // Active Shield Visual Aura
        if (bState.shieldEndTick && currentTick < bState.shieldEndTick) {
          for (let a = 0; a < 24; a++) {
            const angle = (a / 24) * Math.PI * 2 + (currentTick * 0.2);
            const sx = boss.location.x + Math.sin(angle) * 1.5;
            const sz = boss.location.z + Math.cos(angle) * 1.5;
            const sy = boss.location.y + 1.2 + Math.sin(currentTick * 0.3 + angle) * 0.8;
            try {
              dimension.spawnParticle("minecraft:endrod", { x: sx, y: sy, z: sz });
              dimension.spawnParticle("minecraft:portal_directional", { x: sx, y: sy, z: sz });
              dimension.spawnParticle("minecraft:sculk_charge_pop_particle", { x: sx, y: sy, z: sz });
            } catch (e) {}
          }
        }

        // ====================================================
        // POWER 2: EXPANDING SLOWNESS RING PULSE (EVERY 30 SECONDS)
        // ====================================================
        if (!bState.nextRingTick) bState.nextRingTick = currentTick + 600;
        if (currentTick >= bState.nextRingTick) {
          bState.nextRingTick = currentTick + 600; // Reset 30s timer
          bState.isRingActive = true;
          bState.ringRadius = 0.5;
          dimension.playSound("ambient.weather.thunder", boss.location, { volume: 0.8, pitch: 1.2 });
        }

        // Active Expanding Slowness Ring Visual & Hit Check
        if (bState.isRingActive) {
          bState.ringRadius += 0.5; // Expands outward
          const numParticles = 24;
          for (let i = 0; i < numParticles; i++) {
            const angle = (i / numParticles) * Math.PI * 2;
            const rx = boss.location.x + Math.cos(angle) * bState.ringRadius;
            const rz = boss.location.z + Math.sin(angle) * bState.ringRadius;
            try {
              dimension.spawnParticle("minecraft:dragon_breath_trail", { x: rx, y: boss.location.y + 0.3, z: rz });
            } catch (e) {}
          }

          // Check if player is caught in the expanding ring
          const pDist = Math.sqrt(bdx * bdx + bdz * bdz);
          if (Math.abs(pDist - bState.ringRadius) <= 1.2) {
            try {
              player.addEffect("minecraft:slowness", 100, { amplifier: 1, showParticles: true }); // Slowness II for 5s
            } catch (e) {
              try { player.runCommand("effect @s slowness 5 1 true"); } catch (err) {}
            }
          }

          if (bState.ringRadius >= 12.0) {
            bState.isRingActive = false;
          }
        }

        // STEP 1: START CHARGE TELEGRAPH & SUMMON SYSTEM
        if (bState.state === "idle" && currentTick >= bState.nextAttackTick) {
          bState.state = "charging";
          bState.chargeStartTick = currentTick;
          bState.shotsFired = 0;
          bState.attackCount = (bState.attackCount || 0) + 1;

          const count = bState.attackCount;
          const is32nd = (!isClone && count % 32 === 0);
          const is16th = (!isClone && count % 16 === 0);
          bState.is100PercentHit = is16th;

          // Directional vectors for spawning
          const fwdX = bdx / horizDist;
          const fwdZ = bdz / horizDist;

          if (!bState.activeWaves) bState.activeWaves = [];

          if (is16th) {
            // MAX 4 WAVES QUEUE: If 4 waves exist, despawn the oldest wave (Wave 1)
            if (bState.activeWaves.length >= 4) {
              const oldestWave = bState.activeWaves.shift();
              if (oldestWave && oldestWave.mobs) {
                for (const mob of oldestWave.mobs) {
                  try {
                    if (mob.isValid()) {
                      dimension.spawnParticle("minecraft:basic_smoke_particle", mob.location);
                      dimension.spawnParticle("minecraft:squid_ink_particle", mob.location);
                      mob.remove();
                    }
                  } catch (e) {}
                }
              }
            }

            const currentWaveMobs = [];

            // Summoning Audio & Particle Effects
            dimension.playSound("mob.evocation_illager.prepare_summon", boss.location, { volume: 1.0, pitch: 0.9 });
            dimension.spawnParticle("minecraft:large_explosion", boss.location);
            bState.targetLoc = null; // 100% Hit Homing

            // Spawn 3 Vindicators around boss
            for (let i = 0; i < 3; i++) {
              const angle = (i / 3) * Math.PI * 2;
              const sx = boss.location.x + Math.cos(angle) * 3.0;
              const sz = boss.location.z + Math.sin(angle) * 3.0;
              try {
                const v = dimension.spawnEntity("minecraft:vindicator", { x: sx, y: boss.location.y, z: sz });
                dimension.spawnParticle("minecraft:dragon_breath_trail", { x: sx, y: boss.location.y + 1, z: sz });
                if (v) {
                  v.nameTag = "Vingador Corrompido";
                  currentWaveMobs.push(v);
                }
              } catch (e) {}
            }

            // Spawn 5 Pillagers with ENCHANTED Crossbows (Quick Charge III + Multishot)
            for (let i = 0; i < 5; i++) {
              const angle = (i / 5) * Math.PI * 2;
              const sx = boss.location.x + Math.cos(angle) * 4.5;
              const sz = boss.location.z + Math.sin(angle) * 4.5;
              try {
                const p = dimension.spawnEntity("minecraft:pillager", { x: sx, y: boss.location.y, z: sz });
                dimension.spawnParticle("minecraft:dragon_breath_trail", { x: sx, y: boss.location.y + 1, z: sz });
                if (p) {
                  p.nameTag = "Saqueador Corrompido";
                  currentWaveMobs.push(p);
                  // 1-tick delay guarantees equipment initialization before /enchant
                  system9.runTimeout(() => {
                    try {
                      if (!p.isValid()) return;
                      const eq = p.getComponent("minecraft:equippable");
                      if (eq) {
                        const bow = new ItemStack("minecraft:crossbow", 1);
                        const ench = bow.getComponent("minecraft:enchantable");
                        if (ench) {
                          try { ench.addEnchantment({ type: "quick_charge", level: 3 }); } catch (e) {}
                          try { ench.addEnchantment({ type: "multishot", level: 1 }); } catch (e) {}
                        }
                        eq.setEquipment("Mainhand", bow);
                      }
                    } catch (err) {}
                  }, 1);
                }
              } catch (e) {}
            }

            // 32ND ATTACK BONUS: Spawn 1 RAVAGER!
            if (is32nd) {
              dimension.playSound("mob.ravager.roar", boss.location, { volume: 1.0, pitch: 0.8 });
              try {
                const rx = boss.location.x + (fwdX * 4.0);
                const rz = boss.location.z + (fwdZ * 4.0);
                const r = dimension.spawnEntity("minecraft:ravager", { x: rx, y: boss.location.y, z: rz });
                dimension.spawnParticle("minecraft:large_explosion", { x: rx, y: boss.location.y + 1, z: rz });
                if (r) {
                  r.nameTag = "Devastador Corrompido";
                  currentWaveMobs.push(r);
                }
              } catch (e) {}
            }

            bState.activeWaves.push({ waveId: count, mobs: currentWaveMobs });
          } else {
            // Regular Attack: Lock-On snapshot
            bState.targetLoc = { x: player.location.x, y: player.location.y + 1.2, z: player.location.z };
            dimension.playSound("mob.evocation_illager.prepare_attack", boss.location, { volume: 1.0, pitch: 1.2 });
          }
        }

        // Directional vectors for RIGHT HAND
        const fwdX = bdx / horizDist;
        const fwdZ = bdz / horizDist;
        const rightX = fwdZ;
        const rightZ = -fwdX;

        const handY = boss.location.y + 1.8;
        const startLoc = {
          x: boss.location.x + (rightX * 0.8) + (fwdX * 0.5),
          y: handY,
          z: boss.location.z + (rightZ * 0.8) + (fwdZ * 0.5)
        };

        // STEP 2: CHARGING VISUAL TELEGRAPH (3 Ticks / 0.15s Warning for Normal Hits)
        if (bState.state === "charging") {
          // Dense charging dark particles around right hand
          try {
            dimension.spawnParticle("minecraft:basic_smoke_particle", startLoc);
            dimension.spawnParticle("minecraft:squid_ink_particle", startLoc);
            if (bState.is100PercentHit) {
              dimension.spawnParticle("minecraft:dragon_breath_trail", startLoc);
            }
          } catch (e) {}

          // Lower lock time for normal hits: 3 ticks (0.15s warning!)
          const lockThreshold = bState.is100PercentHit ? 5 : 3;
          if (currentTick - bState.chargeStartTick >= lockThreshold) {
            bState.state = "firing";
          }
        }

        // STEP 3: FIRE DARK BALL (Dense Darkness Particles Beam)
        if (bState.state === "firing") {
          // For 16th/32nd attack: 100% Hit uses real-time player location!
          const targetLoc = bState.is100PercentHit
            ? { x: player.location.x, y: player.location.y + 1.2, z: player.location.z }
            : (bState.targetLoc || { x: player.location.x, y: player.location.y + 1.2, z: player.location.z });

          const bdxAim = targetLoc.x - boss.location.x;
          const bdzAim = targetLoc.z - boss.location.z;
          const hDistAim = Math.sqrt(bdxAim * bdxAim + bdzAim * bdzAim) || 1;
          const fwdXAim = bdxAim / hDistAim;
          const fwdZAim = bdzAim / hDistAim;
          const rightXAim = fwdZAim;
          const rightZAim = -fwdXAim;

          const handYFiring = boss.location.y + 1.8;
          const handStartLoc = {
            x: boss.location.x + (rightXAim * 0.8) + (fwdXAim * 0.5),
            y: handYFiring,
            z: boss.location.z + (rightZAim * 0.8) + (fwdZAim * 0.5)
          };

          const aimDx = targetLoc.x - handStartLoc.x;
          const aimDy = targetLoc.y - handStartLoc.y;
          const aimDz = targetLoc.z - handStartLoc.z;
          const aimDist = Math.sqrt(aimDx * aimDx + aimDy * aimDy + aimDz * aimDz) || 1;

          // 16th/32nd attack is ultra-fast speed 4.5, regular is speed 3.6
          const speed = bState.is100PercentHit ? 4.5 : 3.6;
          const vx = (aimDx / aimDist) * speed;
          const vy = (aimDy / aimDist) * speed;
          const vz = (aimDz / aimDist) * speed;

          dimension.playSound("random.bow", boss.location, { volume: 0.9, pitch: 0.8 });

          // Spawn dense darkness beam particles along trajectory
          const steps = Math.max(6, Math.floor(aimDist * 2));
          for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const px = handStartLoc.x + (targetLoc.x - handStartLoc.x) * progress;
            const py = handStartLoc.y + (targetLoc.y - handStartLoc.y) * progress;
            const pz = handStartLoc.z + (targetLoc.z - handStartLoc.z) * progress;
            try {
              dimension.spawnParticle("minecraft:basic_smoke_particle", { x: px, y: py, z: pz });
              dimension.spawnParticle("minecraft:squid_ink_particle", { x: px, y: py, z: pz });
            } catch (e) {}
          }

          // Apply 10-Second Darkness Effect on 16th/32nd 100% Hit Attack
          if (bState.is100PercentHit) {
            try {
              player.addEffect("minecraft:darkness", 200, { amplifier: 0, showParticles: true });
            } catch (e) {
              try { player.runCommand("effect @s darkness 10 0 true"); } catch (err) {}
            }
          }

          try {
            const projId = isClone ? "rpg:fake_magic_arrow" : "rpg:purple_magic_arrow";
            const ball = dimension.spawnEntity(projId, handStartLoc);
            if (isAerialClone) {
              ball.nameTag = "aerial_clone_arrow";
            }
            const proj = ball.getComponent("minecraft:projectile");
            let shot = false;
            if (proj && typeof proj.shoot === "function") {
              try {
                proj.shoot({ x: vx, y: vy, z: vz });
                shot = true;
              } catch (err) {}
            }
            if (!shot) {
              ball.applyImpulse({ x: vx, y: vy, z: vz });
            }
          } catch (e) {}

          bState.shotsFired++;
          // Fire 3 dark balls per attack sequence (1 for clones)
          const maxShots = isClone ? 1 : 3;
          if (bState.shotsFired >= maxShots) {
            bState.state = "idle";
            bState.nextAttackTick = currentTick + 32; // 1.6s cooldown
          }
        }
      }
    }
  }
} catch (e) {}
}, 2);

// Manual Hit Detection for Magic Arrows
system9.runInterval(() => {
  try {
    const dimensions = ["overworld", "nether", "the_end"];
    for (const dimName of dimensions) {
      let dimension;
      try { dimension = world12.getDimension(dimName); } catch (e) { continue; }
      if (!dimension) continue;
      const arrows = dimension.getEntities({ type: "rpg:purple_magic_arrow" });
      for (const arrow of arrows) {
        if (!arrow.isValid()) continue;
        const players = dimension.getPlayers({ location: arrow.location, maxDistance: 1.5 });
        if (players.length > 0) {
          const hitEntity = players[0];
        
        // Base damage
        try { hitEntity.applyDamage(12, { cause: "magic" }); } catch (e) {
          try { hitEntity.runCommand("damage @s 12 magic"); } catch (err) {}
        }
        
        // Clone Beam 100% Guaranteed Debuff
        if (arrow.nameTag === "clone_beam") {
          try {
            hitEntity.addEffect("minecraft:darkness", 300, { amplifier: 0, showParticles: true }); // 15 seconds
            hitEntity.addEffect("minecraft:weakness", 300, { amplifier: 0, showParticles: true }); // 15 seconds
          } catch(e) {
            try { hitEntity.runCommand("effect @s darkness 15 0 true"); } catch(err){}
            try { hitEntity.runCommand("effect @s weakness 15 0 true"); } catch(err){}
          }
        }
        
        // 1% Chance Death Blow (Darkness, Weakness, Slowness II, 40 Damage Creeper Explosion)
        if (Math.random() < 0.01) {
          try {
            hitEntity.addEffect("minecraft:darkness", 1200, { amplifier: 0, showParticles: true });
            hitEntity.addEffect("minecraft:weakness", 1200, { amplifier: 0, showParticles: true });
            hitEntity.addEffect("minecraft:slowness", 1200, { amplifier: 1, showParticles: true });
            
            hitEntity.dimension.spawnParticle("minecraft:huge_explosion_emitter", hitEntity.location);
            hitEntity.dimension.playSound("random.explode", hitEntity.location, { volume: 1.0, pitch: 1.0 });
            hitEntity.applyDamage(40, { cause: "entityExplosion" });
          } catch(e) {
             try { hitEntity.runCommand("effect @s darkness 60 0 true"); } catch(err){}
             try { hitEntity.runCommand("effect @s weakness 60 0 true"); } catch(err){}
             try { hitEntity.runCommand("effect @s slowness 60 1 true"); } catch(err){}
             try { hitEntity.runCommand("damage @s 40 entity_explosion"); } catch(err){}
          }
        }
        
        // 40% Chance for explosive fire strike
        if (Math.random() < 0.40) {
          try { hitEntity.setOnFire(4, true); } catch (e) {}
          try {
            hitEntity.dimension.spawnParticle("minecraft:huge_explosion_emitter", hitEntity.location);
            hitEntity.dimension.playSound("random.explode", hitEntity.location, { volume: 1.0, pitch: 1.0 });
            hitEntity.applyDamage(4, { cause: "entityExplosion" });
          } catch (e) {}
        }
        
        // Destroy the arrow
        try { arrow.remove(); } catch (e) {
          try { arrow.runCommand("kill @s"); } catch (err) {}
        }
      }
    }

    // Aerial Clone Dark Arrow (+1 slightly increased damage)
    const fakeArrows = dimension.getEntities({ type: "rpg:fake_magic_arrow" });
    for (const arrow of fakeArrows) {
      if (arrow.nameTag === "aerial_clone_arrow") {
        const players = dimension.getPlayers({ location: arrow.location, maxDistance: 1.5 });
        if (players.length > 0) {
          const hitEntity = players[0];
          try { hitEntity.applyDamage(2, { cause: "magic" }); } catch(err) {
            try { hitEntity.runCommand("damage @s 2 magic"); } catch(e) {}
          }
          try { arrow.remove(); } catch(e) {}
        }
      }
    }
  }
} catch (e) {}
}, 1); // Run every tick for accurate hit detection

