import 'hitEntity'
import 'interact'
import { Vec3 } from "Vec3"
import 'break'

import { world, system, EquipmentSlot, GameMode } from "@minecraft/server";
const available_food = new Set(["dk:suspicious_weed", "dk:duck_raw", "dk:duck_cooked", "dk:human_flesh", "dk:human_flesh_cook"]);

world.afterEvents.itemCompleteUse.subscribe(({ itemStack, source }) => {
  if (!available_food.has(itemStack.typeId)) return;
  const random_chance = Math.random();

  if (itemStack.typeId == "dk:suspicious_weed") {
    source.addEffect("nausea", 300, { amplifier: 50 });
    source.addEffect("hunger", 300, { amplifier: 20 });
    if (random_chance <= 1 / 3) {
      source.addEffect("strength", 350, { amplifier: 20 });
    }
    else if (random_chance <= 2 / 3) {
      source.addEffect("poison", 350, { amplifier: 20 });
    }
    else {
      source.addEffect("speed", 350, { amplifier: 20 });
    }
  }
  if (itemStack.typeId == "dk:duck_raw") {
    if (random_chance <= 8 / 10) return;
    else {
      source.addEffect("hunger", 350, { amplifier: 10 });
    }
  }
  if (itemStack.typeId == "dk:duck_cooked") {
    source.addEffect("instant_health", 100, { amplifier: 10 });
  }
  if (itemStack.typeId == "dk:human_flesh_cook" || itemStack.typeId == "dk:human_flesh") {
    source.addEffect("nausea", 350, { amplifier: 50 });
    if (itemStack.typeId == "dk:human_flesh") {
      source.addEffect("weakness", 150, { amplifier: 30 });
      source.addEffect("hunger", 200, { amplifier: 20 });
    }
  }
});
world.beforeEvents.worldInitialize.subscribe((initEvent) => {
  initEvent.itemComponentRegistry.registerCustomComponent("dk:smoke_bomb", {
    onUse(event) {
      const player = event.source;
      const ItemStack = event.itemStack;

      if (ItemStack.typeId === 'dk:smoke_bomb') {
        console.warn('Used Smoke Bomb');

        const { x, y, z } = player.location;
        const random_chance = Math.random();
        const players = player.dimension.getPlayers({ location: player.location, minDistance: 0, maxDistance: 20 });
        for (const player of players) {
          player.playSound("random.fuse");
        }

        player.addEffect("regeneration", 180, { amplifier: 25 });
        player.addEffect("slow_falling", 200, { amplifier: 15 });
        player.runCommand(`clear @s dk:smoke_bomb 0 1`);
        player.dimension.spawnParticle("huge_explosion_lab_misc_emitter", { ...player.location, y: y - 1 });
        player.onScreenDisplay.setActionBar("A player just escaped")

        let new_location = player.location;

        if (random_chance <= 1 / 4) {
          new_location = {
            x: x,
            y: y + 50,
            z: z + 200
          }
        } else if (random_chance <= 2 / 4) {
          new_location = {
            x: x + 200,
            y: y + 50,
            z: z
          }
        } else if (random_chance <= 3 / 4) {
          new_location = {
            x: x,
            y: y + 50,
            z: z - 200
          }
        } else {
          new_location = {
            x: x - 200,
            y: y + 50,
            z: z
          }
        }

        player.teleport(new_location);
      }
    },
  });
});
system.runInterval(() => {
  const players = world.getPlayers();

  players.forEach((player) => {
    const itemMainhand = player?.getComponent("minecraft:equippable")?.getEquipmentSlot(`Mainhand`).getItem();
    const itemOffhand = player?.getComponent("minecraft:equippable")?.getEquipmentSlot(`Offhand`).getItem();

    if (player?.isSneaking && (itemMainhand?.typeId === `dk:sentinel_shield` || itemOffhand?.typeId === `dk:sentinel_shield`)) {
      player?.playAnimation(`animation.player.first_person.sentinel_shield_block`, { blendOutTime: 0, stopExpression: "!q.is_sneaking || v.attack_time > 0.0 || (!q.is_item_name_any('slot.weapon.mainhand', 0, 'dk:sentinel_shield') && !q.is_item_name_any('slot.weapon.offhand', 0, 'dk:sentinel_shield'))", controller: `shield` });
      player?.playAnimation(`animation.player.sentinel_shield_block_main_hand`, { blendOutTime: 0, stopExpression: "!q.is_sneaking || v.attack_time > 0.0 || !q.is_item_name_any('slot.weapon.mainhand', 0, 'dk:sentinel_shield')", controller: `shield` });
      player?.playAnimation(`animation.player.sentinel_shield_block_off_hand`, { blendOutTime: 0, stopExpression: "!q.is_sneaking || v.attack_time > 0.0 || !q.is_item_name_any('slot.weapon.offhand', 0, 'dk:sentinel_shield')", controller: `shield` })
    }
    if (player?.isSneaking && (itemMainhand?.typeId === `dk:unboned_shield` || itemOffhand?.typeId === `dk:unboned_shield`)) {
      player?.playAnimation(`animation.player.first_person.unboned_shield_block`, { blendOutTime: 0, stopExpression: "!q.is_sneaking || v.attack_time > 0.0 || (!q.is_item_name_any('slot.weapon.mainhand', 0, 'dk:unboned_shield') && !q.is_item_name_any('slot.weapon.offhand', 0, 'dk:unboned_shield'))", controller: `shield` });
      player?.playAnimation(`animation.player.unboned_shield_block_main_hand`, { blendOutTime: 0, stopExpression: "!q.is_sneaking || v.attack_time > 0.0 || !q.is_item_name_any('slot.weapon.mainhand', 0, 'dk:unboned_shield')", controller: `shield` });
      player?.playAnimation(`animation.player.unboned_shield_block_off_hand`, { blendOutTime: 0, stopExpression: "!q.is_sneaking || v.attack_time > 0.0 || !q.is_item_name_any('slot.weapon.offhand', 0, 'dk:unboned_shield')", controller: `shield` })
    }
  })
}, 1);

world.afterEvents.entityHurt.subscribe((data) => {
  const player = data.hurtEntity;
  const damager = data.damageSource.damagingEntity;
  const damage = data.damage;
  const equipment = player.getComponent("minecraft:equippable");
  const itemMainhand = player?.getComponent("minecraft:equippable")?.getEquipmentSlot(`Mainhand`).getItem();
  const itemOffhand = player?.getComponent("minecraft:equippable")?.getEquipmentSlot(`Offhand`).getItem();

  if (player?.typeId === `minecraft:player` && player?.isSneaking && (itemMainhand?.typeId === `dk:sentinel_shield` || itemOffhand?.typeId === `dk:sentinel_shield`)) {
    const directionVec = Vec3(damager.location.x - player.location.x, damager.location.y - player.location.y, damager.location.z - player.location.z);
    const direction = Vec3.normalize(directionVec);

    const lookDirection = player.getViewDirection();
    let angle = Math.atan2(lookDirection.x * direction.z - lookDirection.z * direction.x, lookDirection.x * direction.x + lookDirection.z * direction.z) * (180 / Math.PI);

    if (angle > 180) {
      angle -= 360;
    } else if (angle < -180) {
      angle += 360;
    };

    const angleThreshold = 45;
    if (Math.abs(angle) <= angleThreshold) {
      const impulse = 1.3;
      const currentHealth = player.getComponent("minecraft:health").currentValue;
      let newItem = undefined;
      damager?.applyKnockback(direction.x, direction.z, impulse, impulse * 0.4);
      player?.applyKnockback(0, 0, 0, 0);
      player.getComponent("minecraft:health").setCurrentValue(currentHealth + damage);
      world.playSound(`item.shield.block`, player.location);

      if (newItem !== undefined) {
        if (itemMainhand?.typeId === `dk:sentinel_shield`) {
          equipment.setEquipment(`Mainhand`, newItem);
        } else if (itemOffhand?.typeId === `dk:sentinel_shield`) {
          equipment.setEquipment(`Offhand`, itemOffhand);
        }
      }
    }
  }
  if (player?.typeId === `minecraft:player` && player?.isSneaking && (itemMainhand?.typeId === `dk:unboned_shield` || itemOffhand?.typeId === `dk:unboned_shield`)) {
    const directionVec = Vec3(damager.location.x - player.location.x, damager.location.y - player.location.y, damager.location.z - player.location.z);
    const direction = Vec3.normalize(directionVec);

    const lookDirection = player.getViewDirection();
    let angle = Math.atan2(lookDirection.x * direction.z - lookDirection.z * direction.x, lookDirection.x * direction.x + lookDirection.z * direction.z) * (180 / Math.PI);

    if (angle > 180) {
      angle -= 360;
    } else if (angle < -180) {
      angle += 360;
    };

    const angleThreshold = 45;
    if (Math.abs(angle) <= angleThreshold) {
      const impulse = 1.3;
      const currentHealth = player.getComponent("minecraft:health").currentValue;
      let newItem = undefined;
      damager?.applyKnockback(direction.x, direction.z, impulse, impulse * 0.4);
      player?.applyKnockback(0, 0, 0, 0);
      player.getComponent("minecraft:health").setCurrentValue(currentHealth + damage);
      world.playSound(`item.shield.block`, player.location);

      if (newItem !== undefined) {
        if (itemMainhand?.typeId === `dk:unboned_shield`) {
          equipment.setEquipment(`Mainhand`, newItem);
        } else if (itemOffhand?.typeId === `dk:unboned_shield`) {
          equipment.setEquipment(`Offhand`, itemOffhand);
        }
      }
    }
  }
  return;
});