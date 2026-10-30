import { BlockPermutation, EntityEquippableComponent, EquipmentSlot, world } from '@minecraft/server';

world.afterEvents.entityHurt.subscribe(async ({ damageSource: { damagingEntity }, hurtEntity }) => {
  const damager = damagingEntity;
  const damaged = hurtEntity;
  const dimension = hurtEntity?.dimension;
  const item = damager?.getComponent(EntityEquippableComponent.componentId)?.getEquipmentSlot(EquipmentSlot.Mainhand).getItem();
  if (!item) return;

  if (item?.typeId === `dk:vendaga`) {
    damaged?.addEffect(`poison`, 120, { amplifier: 20, showParticles: true })
  }
  if (item?.typeId === `dk:halberd`) {
    damager.addEffect(`weakness`, 140, { amplifier: 200, showParticles: false });
  }
  if (item?.typeId === `dk:unbound_arm`) {
    damager.addEffect(`weakness`, 140, { amplifier: 50, showParticles: false });
    damager.addTag('unbound_player');

    dimension.spawnEntity('dk:unbound_arm_hit', damager.location);
  }
  if (item?.typeId === `dk:unbound_arm_punch`) {
    dimension.spawnEntity('dk:unbound_arm_projectile', damager.location);
  }
  if (item?.typeId === `dk:sickle_of_fatality`) {
    damager.addEffect(`weakness`, 140, { amplifier: 50, showParticles: false });
    damager.addTag('sickle_player');
    dimension.spawnEntity('dk:player_sickle', damager.location);
  }
  if (item?.typeId === `dk:volcano_sword`) {
    if (!damager.isOnGround) {
      dimension.spawnParticle("minecraft:huge_explosion_lab_misc_emitter", { ...damager.location, y: damager.location.y - 1 });
      damager.addEffect(`slowness`, 10, { amplifier: 10, showParticles: false })

      const players = dimension.getPlayers({ location: damager.location, minDistance: 0, maxDistance: 20 });
      for (const player of players) {
        player.playSound("random.explode", {
          volume: 1.0,
          pitch: .5
        });
      }

      const circle = await getLocationsCircleBase(hurtEntity.location, 3);
      for (const lc of circle) {
        const block = damagingEntity.dimension.getBlock(lc);
        if (block.typeId !== "minecraft:air") continue;

        block.setPermutation(BlockPermutation.resolve("minecraft:fire"));
      }
    }
  }
});

async function getLocationsCircleBase(location, radius = 2) {
  const locations = [];
  const centerX = location.x;
  const centerY = location.y;
  const centerZ = location.z;

  for (let xOffset = -radius; xOffset <= radius; xOffset++) {
    for (let yOffset = -radius; yOffset <= radius; yOffset++) {
      for (let zOffset = -radius; zOffset <= radius; zOffset++) {
        const distance = Math.sqrt(xOffset * xOffset + yOffset * yOffset + zOffset * zOffset);
        if (distance <= radius) {
          locations.push({
            x: centerX + xOffset,
            y: centerY + yOffset,
            z: centerZ + zOffset
          });
        }
      }
    }
  }
  return locations;
}