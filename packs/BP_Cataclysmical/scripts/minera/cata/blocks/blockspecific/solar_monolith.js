import { world, ItemStack, system } from '@minecraft/server';


//place and destroy
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:solar_monolith_place', {
    onPlace({ player, block, dimension }) {
      const { x, y, z } = block;

      if (block.above().isAir) {
        dimension.runCommand(`setblock ${x} ${y + 1} ${z} mnra_cata:solar_monolith_top`)
      } else {
        dimension.runCommand(`setblock ${x} ${y} ${z} air destroy`)
      }
    }
  })
})
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:solar_monolith_top_destroy', {
    onPlayerBreak({ block, dimension, player }) {
      const { x, y, z } = block;
      dimension.runCommand(`setblock ${x} ${y - 1} ${z} air destroy`)
    }
  })
})
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:solar_monolith_bottom_destroy', {
    onPlayerBreak({ block, dimension, player }) {
      const { x, y, z } = block;
      dimension.runCommand(`setblock ${x} ${y + 1} ${z} air destroy`)
    }
  })
})

//Activate
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:solar_monolith_activate', {
    onPlayerInteract({ block, player, dimension }) {

    }
  })
})

//Deactivate
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:solar_monolith_tick', {
    onTick({ player, block, dimension }) {
      const { x, y, z } = block;
      dimension.runCommand(`setblock ${x} ${y + 1} ${z} mnra_cata:solar_monolith_top`)
      dimension.runCommand(`setblock ${x} ${y} ${z} mnra_cata:solar_monolith_bottom`)
    }
  })
})