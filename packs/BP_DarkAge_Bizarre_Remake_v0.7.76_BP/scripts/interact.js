import { world, system, ItemStack } from '@minecraft/server';

world.afterEvents.itemReleaseUse.subscribe((ev) => {
  try {
    let { itemStack, useDuration, source } = ev;
    let asd = ev.us;
    if (itemStack.typeId != "dk:sentinel_bow") return;
    let { x: x1, y: y1, z: z1 } = source.location;
    let { x: x2, y: y2, z: z2 } = source.getViewDirection();
    let arrow = source.dimension.spawnEntity("dk:sun_arrow", {
      x: x1,
      y: y1 + 1.6,
      z: z1,
    });
    x2 *= (20000 - useDuration) / 5;
    y2 *= (20000 - useDuration) / 5;
    z2 *= (20000 - useDuration) / 5;
    arrow.applyImpulse({ x: x2, y: y2, z: z2 });
    arrow.getComponent("projectile").owner = source;
  } catch { }
});

world.afterEvents.itemStopUse.subscribe((eventData) => {
  const player = eventData.source;
  const location = player.location;
  const itemUsed = eventData.itemStack;
  if (itemUsed.typeId !== "dk:sentinel_bow") return;
  if (itemUsed.typeId === 'dk:sentinel_bow') {
    player.playSound(`random.bow`, { x: player.location.x, y: player.location.y, z: player.location.z });
  }
});

const available_items = new Set(["dk:vendaga", "dk:sinners_rod", "dk:sentinel_halberd", "dk:sickle_of_fatality", "dk:sword_of_fatality", "dk:unbound_arm", "dk:unbound_arm_punch", "dk:volcano_sword", "dk:sentinel_bow"]);

async function spawnEntityWithEvent(player, entityType, location, event) {
  const entity = player.dimension.spawnEntity(entityType, location);
  entity.setRotation(player.getRotation());
  entity.triggerEvent(event);
}
function playSoundForPlayers(players, sound) {
  for (const p of players) {
    p.playSound(sound);
  }
}
function changeEquippedItem(player, newItemType) {
  const newItem = new ItemStack(newItemType, 1);
  player.getComponent('equippable').setEquipment('Mainhand', newItem);
}
async function getLocalRatePlayers(rango, location) {
  const players = world.getAllPlayers();
  const distance = (a, b) => {
    return Math.sqrt(
      Math.pow(a.x - b.x, 2) +
      Math.pow(a.y - b.y, 2) +
      Math.pow(a.z - b.z, 2)
    );
  }
  const cercanos = players.filter(({ location: l1 }) => {
    const dis = distance(location, l1);

    return dis <= rango;
  });
  return cercanos;
}

world.beforeEvents.worldInitialize.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent("dk:on_use", {
    async onUse(event) {
      const player = event.source;
      const itemUsed = event.itemStack;
      if (!available_items.has(itemUsed.typeId)) return;
      const { x, y, z } = player.location;

      switch (itemUsed.typeId) {
        case 'dk:vendaga':
          player.playAnimation("animation.assassin.hide", {
            nextState: "animation.assassin.not_hide",
            blendOutTime: 6
          });
          player.addEffect("invisibility", 26, { amplifier: 10, showParticles: false });
          player.dimension.spawnParticle("darkage:gray_small_tornado", player.location);
          break;

        case 'dk:sinners_rod':
          // fgr: com pergaminho na mão secundária o cajado conjura o pergaminho
          if (player.getComponent('equippable')?.getEquipment('Offhand')?.hasTag('ntk:magic_scroll')) break;
          if (!player.isSneaking) {
            await spawnEntityWithEvent(player, "dk:putrefied", player.location, "dk:putrefied_event_mode_ally");
            player.playSound("mob.evocation_illager.prepare_summon");
          }
          break;

        case 'dk:sentinel_halberd':
          const players = await getLocalRatePlayers(30, player.location);
          let spawn_location = { x: x + 2, y: y + 2, z: z + 2 };
          if (!player.isSneaking) {
            player.addTag("none_halberd");
            await spawnEntityWithEvent(player, "dk:unknown_portal", spawn_location, "dk:unknown_portal_one_ally");

            spawn_location = { x, y: y + 2, z };
            await spawnEntityWithEvent(player, "dk:unknown_portal", spawn_location, "dk:unknown_portal_one_ally");

            spawn_location = { x, y: y + 4, z };
            await spawnEntityWithEvent(player, "dk:unknown_portal", spawn_location, "dk:unknown_portal_two_ally");

            spawn_location = { x: x - 2, y: y + 3, z: z - 2 };
            await spawnEntityWithEvent(player, "dk:unknown_portal", spawn_location, "dk:unknown_portal_three_ally");

            playSoundForPlayers(players, "item.trident.throw");
          } else {
            player.addTag("none_halberd_two");
            spawn_location = { x, y: y + 3, z };
            await spawnEntityWithEvent(player, "dk:halberd_sacred", spawn_location, "dk:halberd_sacred_ally");

            playSoundForPlayers(players, "item.trident.throw");
          }
          break;

        case 'dk:sword_of_fatality':
          if (!player.isSneaking) {
            await spawnEntityWithEvent(player, "dk:plague_dog", { x: x + 1.5, y, z }, "dk:plague_dog_event_mode_pet_player");
            await spawnEntityWithEvent(player, "dk:plague_dog", { x: x - 1.5, y, z }, "dk:plague_dog_event_mode_pet_player");
            player.playSound("mob.evocation_illager.prepare_summon");
          } else {
            changeEquippedItem(player, "dk:sickle_of_fatality");
          }
          break;

        case 'dk:sickle_of_fatality':
          if (!player.isSneaking) {
            const velocity = player.getViewDirection();
            const headLoc = player.getHeadLocation();
            const projectile = player.dimension.spawnEntity('dk:plague_sickle', { x: headLoc.x + velocity.x, y: headLoc.y + velocity.y, z: headLoc.z + velocity.z });
            const projectileComp = projectile.getComponent('minecraft:projectile');
            projectileComp?.shoot({ x: velocity.x * 3, y: velocity.y * 3, z: velocity.z * 3 });
            player.addTag("tp_player");
            player.runCommand(`clear @s dk:sickle_of_fatality 0 1`);
          } else {
            changeEquippedItem(player, "dk:sword_of_fatality");
          }
          break;

        case 'dk:unbound_arm':
          if (!player.isSneaking) {
            await spawnEntityWithEvent(player, "dk:unboned", { x: x + 1.5, y, z }, "dk:unboned_event_mode_ally");
            await spawnEntityWithEvent(player, "dk:unboned", { x: x + 1.5, y, z: z + 1.5 }, "dk:unboned_event_mode_ally");
            await spawnEntityWithEvent(player, "dk:unboned", { x: x + -1.5, y, z: z + -1.5 }, "dk:unboned_event_mode_ally");
            await spawnEntityWithEvent(player, "dk:unboned", { x: x + -1.5, y, z }, "dk:unboned_event_mode_ally");
            await spawnEntityWithEvent(player, "dk:unboned", { x, y, z: z + 1.5 }, "dk:unboned_event_mode_ally");
            await spawnEntityWithEvent(player, "dk:unboned", { x, y, z: z + -1.5 }, "dk:unboned_event_mode_ally");
            player.playSound("mob.evocation_illager.prepare_summon");
          } else {
            changeEquippedItem(player, "dk:unbound_arm_punch");
          }
          break;

        case 'dk:unbound_arm_punch':
          if (!player.isSneaking) {
            const velocity = player.getViewDirection();
            const headLoc = player.getHeadLocation();
            const projectile = player.dimension.spawnEntity('dk:unbound_arm_projectile_two', { x: headLoc.x + velocity.x, y: headLoc.y + velocity.y, z: headLoc.z + velocity.z });
            const projectileComp = projectile.getComponent('minecraft:projectile');
            projectileComp?.shoot({ x: velocity.x * 1, y: velocity.y * 1, z: velocity.z * 1 });
          } else {
            changeEquippedItem(player, "dk:unbound_arm");
          }
          break;

        case 'dk:volcano_sword':
          if (!player.isSneaking) {
            const velocity = player.getViewDirection();
            const headLoc = player.getHeadLocation();
            const projectile = player.dimension.spawnEntity('dk:elemental_knight_storm_player', { x: headLoc.x + velocity.x, y: headLoc.y + velocity.y, z: headLoc.z + velocity.z });
            const projectileComp = projectile.getComponent('minecraft:projectile');
            projectileComp?.shoot({ x: velocity.x * 2, y: velocity.y * 2, z: velocity.z * 2 });
            player.runCommand(`kill @e[type=dk:elemental_knight_storm_player,c=1,r=1]`);
          } else {
            const velocity = player.getViewDirection();
            const headLoc = player.getHeadLocation();
            const projectile = player.dimension.spawnEntity('dk:ring_of_light', { x: headLoc.x + velocity.x, y: headLoc.y + velocity.y, z: headLoc.z + velocity.z });
            const projectileComp = projectile.getComponent('minecraft:projectile');
            projectileComp?.shoot({ x: velocity.x * 3, y: velocity.y * 3, z: velocity.z * 3 });
          }
          break;

        case 'dk:sentinel_bow':
          player.runCommandAsync(`playanimation @s animation.player.bow_equipped none 0 "variable.is_first_person || !query.is_using_item || !query.is_item_name_any('slot.weapon.mainhand', 1, 'dk:sentinel_bow')" using_bow`)
          break;
      }
    },
  });
});

// fgr: botão de ataque conjura o feitiço padrão do cajado (chamado pelo pack FO)
system.afterEvents.scriptEventReceive.subscribe(({ id, message, sourceEntity: player }) => {
  if (id !== "fgr:cajado_ataque" || message !== "dk:sinners_rod" || player?.typeId !== "minecraft:player") return;
  if (player.isSneaking || player.getItemCooldown("sinners_rod") > 0) return;
  if (player.getComponent('equippable')?.getEquipment('Mainhand')?.typeId !== "dk:sinners_rod") return;
  player.startItemCooldown("sinners_rod", 120 * 20);
  spawnEntityWithEvent(player, "dk:putrefied", player.location, "dk:putrefied_event_mode_ally");
  player.playSound("mob.evocation_illager.prepare_summon");
});
