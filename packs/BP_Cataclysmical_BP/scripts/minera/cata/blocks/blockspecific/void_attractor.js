import { world, ItemStack, system } from '@minecraft/server';

system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:void_attractor', {
    onTick({ block, dimension }) {
      const { x, y, z } = block.location;

      const target = {
        x: x + 0.5,
        y: y + 1.05,
        z: z + 0.5
      };

      if (system.currentTick % 40 === 0) {
        dimension.runCommand(`playsound beacon.power @a ${x + 0.5} ${y + 0.5} ${z + 0.5} 0.3 0.9`);
        dimension.runCommand(`particle mnra_cata:void_attractor ${x + 0.5} ${y} ${z + 0.5}`);
      }

      const nearbyEntities = dimension.getEntities({
        location: block.location,
        maxDistance: 12,
        type: "item",
      });

      for (const entity of nearbyEntities) {
        const loc = entity.location;

        let dx = target.x - loc.x;
        let dy = target.y - loc.y;
        let dz = target.z - loc.z;

        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist <= 1.50) {
          entity.applyImpulse({ x: 0, y: 0, z: 0 });
          continue;
        }

        dx /= dist;
        dy /= dist;
        dz /= dist;

        const Strength = 0.05;

        entity.applyImpulse({
          x: dx * Strength,
          y: dy * Strength,
          z: dz * Strength
        });
      }
    }
  }
  );
});
