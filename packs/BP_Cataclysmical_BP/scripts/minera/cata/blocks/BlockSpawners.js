import { world, ItemStack, system } from '@minecraft/server';

system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:spawner_asteroid', {
    onTick({ player, block, dimension }) {
      const { x, y, z } = block;

      dimension.runCommand(`setblock ${x} ${y} ${z} air`)
      dimension.runCommand(`summon mnra_cata:starling ${x + 3} ${y + 5} ${z}`)
      dimension.runCommand(`summon mnra_cata:starling ${x} ${y + 5} ${z + 2}`)
      dimension.runCommand(`summon mnra_cata:starling ${x + 1} ${y + 5} ${z}`)
      dimension.runCommand(`summon mnra_cata:astro_jelly ${x} ${y + 5} ${z + 1}`)
      dimension.runCommand(`setblock ${x} ${y} ${z} air`)
    }
  })
})

system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:spawner_cosmic_spirit', {
    onTick({ player, block, dimension }) {
      const { x, y, z } = block;

      dimension.runCommand(`setblock ${x} ${y} ${z} air`)
      dimension.runCommand(`summon mnra_cata:cosmic_spirit ${x} ${y} ${z}`)
      dimension.runCommand(`summon mnra_cata:cosmic_spirit ${x} ${y} ${z}`)
    }
  })
})

system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:spawner_feralbloom', {
    onTick({ player, block, dimension }) {
      const { x, y, z } = block;

      dimension.runCommand(`summon mnra_cata:feralbloom ${x} ${y + 2} ${z}`)
      dimension.runCommand(`setblock ${x} ${y} ${z} mnra_cata:gneiss`)
    }
  })
})

system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:spawner_skeleton_paladin', {
    onTick({ player, block, dimension }) {
      const { x, y, z } = block;

      dimension.runCommand(`summon mnra_cata:skeleton_paladin ${x} ${y + 1} ${z}`)
      dimension.runCommand(`summon mnra_cata:skeleton_paladin ${x} ${y + 1} ${z}`)
      dimension.runCommand(`summon mnra_cata:skeleton_paladin ${x} ${y + 1} ${z}`)
      dimension.runCommand(`setblock ${x} ${y} ${z} air`)
    }
  })
})

system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:spawner_terror_crypt', {
    onTick({ player, block, dimension }) {
      const { x, y, z } = block;

      dimension.runCommand(`summon minecraft:wither_skeleton ${x} ${y + 2} ${z}`)
      dimension.runCommand(`summon minecraft:skeleton ${x} ${y + 2} ${z}`)
      dimension.runCommand(`summon mnra_cata:skeleton_paladin ${x} ${y + 2} ${z}`)
      dimension.runCommand(`summon mnra_cata:plasma_hive ${x} ${y + 2} ${z}`)
      dimension.runCommand(`summon mnra_cata:plasma ${x} ${y + 2} ${z}`)
      dimension.runCommand(`setblock ${x} ${y} ${z} air`)
    }
  })
})

system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:spawner_gneiss_golem', {
    onTick({ player, block, dimension }) {
      const { x, y, z } = block;

      dimension.runCommand(`summon mnra_cata:gneiss_golem ${x} ${y + 1} ${z}`)
      dimension.runCommand(`setblock ${x} ${y} ${z} mnra_cata:gneiss`)
    }
  })
})