import { system } from '@minecraft/server';

//blank, a place holder
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:blank', {
    onStepOn({ block }) {
      //blank
    }
  })
})

system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:sealed_heart_place', {
    onPlace({ block, dimension }) {
      const { x, y, z } = block;
      dimension.runCommand(`summon mnra_cata:sealed_heart ${x} ${y} ${z} `);
    }
  })
})

//ancient_pot
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:ancient_pot_break', {
    onPlayerBreak({ block, dimension, player }) {
      player.playSound('shatter.decorated_pot', { pitch: 1, location: player.location, volume: 3 })
    }
  })
})

//floret_ore
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:floret_ore_emitter', {
    onTick({ block, dimension }) {
      const { x, y, z } = block;
      if (block?.above()?.typeId === ('minecraft:air')) {
        dimension.runCommand(`particle mnra_cata:floret_ore_emitter ${x} ${y} ${z} `);

      } else if (block?.below()?.typeId === ('minecraft:air')) {
        dimension.runCommand(`particle mnra_cata:floret_ore_emitter ${x} ${y} ${z} `);

      } else if (block?.north()?.typeId === ('minecraft:air')) {
        dimension.runCommand(`particle mnra_cata:floret_ore_emitter ${x} ${y} ${z} `);

      } else if (block?.east()?.typeId === ('minecraft:air')) {
        dimension.runCommand(`particle mnra_cata:floret_ore_emitter ${x} ${y} ${z} `);

      } else if (block?.south()?.typeId === ('minecraft:air')) {
        dimension.runCommand(`particle mnra_cata:floret_ore_emitter ${x} ${y} ${z} `);

      } else if (block?.west()?.typeId === ('minecraft:air')) {
        dimension.runCommand(`particle mnra_cata:floret_ore_emitter ${x} ${y} ${z} `);

      } else return
    }
  })
})
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:floret_ore_explosion', {
    onPlayerBreak({ block, dimension, player }) {
      const { x, y, z } = block;
      const random = Math.random()
      if (random < 0.6) {
        dimension.runCommand(`particle mnra_cata:floret_ore_emitter ${x} ${y} ${z}`);
        dimension.runCommand(`particle mnra_cata:floret_ore_explosion ${x} ${y} ${z}`);
        dimension.runCommand(`summon mnra_cata:floret_ore_explosion ${x} ${y} ${z}`)
        player.playSound('sound.feral_gas', { pitch: 1, location: player.location, volume: 0.6 })
      } else return
    }
  })
})

//solar_ore
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:solar_ore_emitter', {
    onTick({ block, dimension }) {
      const { x, y, z } = block;
      if (block?.above().typeId === ('minecraft:air')) {
        dimension.runCommand(`particle mnra_cata:solar_ore_emitter ${x} ${y} ${z} `);

      } else if (block?.below()?.typeId === ('minecraft:air')) {
        dimension.runCommand(`particle mnra_cata:solar_ore_emitter ${x} ${y} ${z} `);

      } else if (block?.north()?.typeId === ('minecraft:air')) {
        dimension.runCommand(`particle mnra_cata:solar_ore_emitter ${x} ${y} ${z} `);

      } else if (block?.east()?.typeId === ('minecraft:air')) {
        dimension.runCommand(`particle mnra_cata:solar_ore_emitter ${x} ${y} ${z} `);

      } else if (block?.south()?.typeId === ('minecraft:air')) {
        dimension.runCommand(`particle mnra_cata:solar_ore_emitter ${x} ${y} ${z} `);

      } else if (block?.west()?.typeId === ('minecraft:air')) {
        dimension.runCommand(`particle mnra_cata:solar_ore_emitter ${x} ${y} ${z} `);

      } else return
    }
  })
})
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:solar_ore_explosion', {
    onPlayerBreak({ block, dimension, player }) {
      const { x, y, z } = block;
      const random = Math.random()
      if (random < 0.5) {
        dimension.runCommand(`particle mnra_cata:solar_ore_emitter ${x} ${y} ${z}`);
        dimension.runCommand(`particle mnra_cata:solar_ore_explosion ${x} ${y} ${z}`);
        dimension.runCommand(`summon mnra_cata:solar_ore_explosion ${x} ${y} ${z}`)
        player.playSound('sound.solar_explosion', { pitch: 1, location: player.location, volume: 0.5 })
      } else return
    }
  })
})


//astral_dust
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:astral_dust_emitter', {
    onTick({ block, dimension, player }) {
      const random = Math.random()
      const { x, y, z } = block;
      if (random < 0.50) {
        if (block.above().typeId === ('mnra_cata:asteroid')) {
          dimension.runCommand(`particle mnra_cata:astral_dust_emitter ${x} ${y} ${z} `);
        }
      }
    }
  })
})

system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:solar_monolith_top', {
    onTick({ block, dimension, player }) {
      const { x, y, z } = block;
      dimension.runCommand(`execute if block ${x} ${y - 1} ${z} mnra_cata:solar_monolith_bottom ["mnra_cata:solar_monolith_activate"=false] run setblock ${x} ${y} ${z} mnra_cata:solar_monolith_top ["mnra_cata:solar_monolith_activate"=false] replace`);
    }
  })
})

//dungeon spawner flame
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:dungeon_spawner_flame', {
    onTick({ block, dimension }) {
      const { x, y, z } = block;

      dimension.runCommand(`particle mnra_cata:dungeon_spawner_flame ${x} ${y} ${z} `);
    }
  })
})
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:dungeon_spawner_hard_flame', {
    onTick({ block, dimension }) {
      const { x, y, z } = block;

      dimension.runCommand(`particle mnra_cata:dungeon_spawner_hard_flame ${x} ${y} ${z} `);
    }
  })
})

//gneiss door lock
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:gneiss_door_unlock', {
    onPlayerInteract({ player, block, dimension }) {
      const { x, y, z } = block;
      const equipment = player.getComponent('equippable'); {
        const selectedItem = equipment.getEquipment('Mainhand');
        if (selectedItem?.typeId == 'mnra_cata:master_verdant_key') {
          dimension.runCommand(`particle mnra_cata:verdant_crusher ${x} ${y} ${z}`)
          player.runCommand(`execute if block ${x} ${y + 1} ${z} mnra_cata:gneiss_door run setblock ${x} ${y + 1} ${z} air destroy`)
          player.runCommand(`execute if block ${x} ${y - 1} ${z} mnra_cata:gneiss_door run setblock ${x} ${y - 1} ${z} air destroy`)
          player.runCommand(`execute if block ${x} ${y} ${z - 1} mnra_cata:gneiss_door run setblock ${x} ${y} ${z - 1} air destroy`)
          player.runCommand(`execute if block ${x} ${y} ${z + 1} mnra_cata:gneiss_door run setblock ${x} ${y} ${z + 1} air destroy`)
          player.runCommand(`execute if block ${x} ${y - 1} ${z - 1} mnra_cata:gneiss_door run setblock ${x} ${y - 1} ${z - 1} air destroy`)
          player.runCommand(`execute if block ${x} ${y - 1} ${z + 1} mnra_cata:gneiss_door run setblock ${x} ${y - 1} ${z + 1} air destroy`)
          player.runCommand(`execute if block ${x} ${y + 1} ${z + 1} mnra_cata:gneiss_door run setblock ${x} ${y + 1} ${z + 1} air destroy`)
          player.runCommand(`execute if block ${x} ${y + 1} ${z - 1} mnra_cata:gneiss_door run setblock ${x} ${y + 1} ${z - 1} air destroy`)
          player.runCommand(`execute if block ${x} ${y + 2} ${z + 1} mnra_cata:gneiss_door run setblock ${x} ${y + 2} ${z + 1} air destroy`)
          player.runCommand(`execute if block ${x} ${y + 2} ${z - 1} mnra_cata:gneiss_door run setblock ${x} ${y + 2} ${z - 1} air destroy`)
          player.runCommand(`execute if block ${x} ${y + 2} ${z} mnra_cata:gneiss_door run setblock ${x} ${y + 2} ${z} air destroy`)
          player.runCommand(`setblock ${x} ${y} ${z} air destroy`)
          player.runCommand(`execute if block ${x + 1} ${y} ${z} mnra_cata:gneiss_door run setblock ${x + 1} ${y} ${z} air destroy`)
          player.runCommand(`execute if block ${x + 1} ${y + 1} ${z} mnra_cata:gneiss_door run setblock ${x + 1} ${y + 1} ${z} air destroy`)
          player.runCommand(`execute if block ${x + 1} ${y + 2} ${z} mnra_cata:gneiss_door run setblock ${x + 1} ${y + 2} ${z} air destroy`)
          player.runCommand(`execute if block ${x + 1} ${y - 1} ${z} mnra_cata:gneiss_door run setblock ${x + 1} ${y - 1} ${z} air destroy`)
          player.runCommand(`execute if block ${x + -1} ${y} ${z} mnra_cata:gneiss_door run setblock ${x + -1} ${y} ${z} air destroy`)
          player.runCommand(`execute if block ${x + -1} ${y + 1} ${z} mnra_cata:gneiss_door run setblock ${x + -1} ${y + 1} ${z} air destroy`)
          player.runCommand(`execute if block ${x + -1} ${y + 2} ${z} mnra_cata:gneiss_door run setblock ${x + -1} ${y + 2} ${z} air destroy`)
          player.runCommand(`execute if block ${x + -1} ${y - 1} ${z} mnra_cata:gneiss_door run setblock ${x + -1} ${y - 1} ${z} air destroy`)
          player.playSound('sound.verdant_door_unlock', { pitch: 1.2, location: player.location, volume: 1 })
          player.runCommand(`clear @s mnra_cata:master_verdant_key 0 1`)
        }
      }
    }
  })
})

//solar_tesla_coil
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:solar_tesla_coil', {
    onTick({ block, dimension }) {
      const { x, y, z } = block;
      const nearbyEntities = block.dimension.getEntities({
        location: block.location,
        maxDistance: 5,
        excludeFamilies: ["player"]
      });
      for (const entity of nearbyEntities) {
        if (entity.hasComponent('health') && !entity.hasTag("solar_protection") && block.below().typeId !== ('mnra_cata:solar_ore')) {
          dimension.runCommand(`particle mnra_cata:solar_tesla_coil ${x} ${y} ${z} `)
          entity.runCommand(`playsound sound.tesla_coil_zap @a[r=12] ${x} ${y} ${z}`)
          entity.runCommand(`particle mnra_cata:solar_ore_emitter ${x} ${y + 1} ${z} `)
          entity.applyDamage(8, { cause: "entityAttack" })
          entity.setOnFire(1)
        } else if (entity.hasComponent('health') && !entity.hasTag("solar_protection") && block.below().typeId === ('mnra_cata:solar_ore')) {
          const random = Math.random()
          if (random < 0.30) {
            dimension.runCommand(`setblock ${x} ${y - 1} ${z} mnra_cata:flare_stone destroy `)
          } else if (random < 1) {

          }
          dimension.runCommand(`particle mnra_cata:solar_ore_explosion ${x} ${y} ${z}`);
          dimension.runCommand(`particle mnra_cata:solar_tesla_coil ${x} ${y} ${z} `)
          entity.runCommand(`playsound sound.solar_explosion @a[r=12] ${x} ${y} ${z}`)
          entity.runCommand(`playsound sound.tesla_coil_zap @a[r=12] ${x} ${y} ${z}`)
          entity.runCommand(`particle mnra_cata:solar_ore_emitter ${x} ${y + 1} ${z} `)
          entity.applyDamage(12, { cause: "entityAttack" })
          entity.setOnFire(2)
        }
      }
    }
  })
})

//occult_alter
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:occult_alter', {
    onPlayerInteract({ block, player, dimension }) {
      const equipment = player.getComponent('equippable'); {
        const selectedItem = equipment.getEquipment('Mainhand');
        if (selectedItem?.typeId == 'mnra_cata:solar_core') {

          block.setPermutation(block.permutation.withState('mnra_cata:activated', true));
          player.playSound('respawn_anchor.charge', { pitch: 1.2, location: block.location, volume: 0.5 })
          player.runCommand(`clear @s mnra_cata:solar_core 0 1`)
          const { x, y, z } = block;
          dimension.runCommand(`summon mnra_cata:solar_core_beam ${x} ${y} ${z}`)
        }
      }
    }
  })
})

//verdant_vault
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:verdant_vault', {
    onPlayerInteract({ player, block, dimension }) {
      const { x, y, z } = block;
      const equipment = player.getComponent('equippable'); {
        const selectedItem = equipment.getEquipment('Mainhand');
        if (selectedItem?.typeId == 'mnra_cata:verdant_key') {
          player.playSound('vault.insert_item', { pitch: 0.7, location: player.location, volume: 1 })
          player.runCommand(`clear @s mnra_cata:verdant_key 0 1`)
          block.setPermutation(block.permutation.withState('mnra_cata:activate', true));
        } else if (selectedItem?.typeId !== 'mnra_cata:verdant_key') {
          player.playSound('vault.insert_item_fail', { pitch: 0.7, location: player.location, volume: 1 })
        }
      }
    }
  })
})
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:verdant_vault_break', {
    onTick({ block, dimension }) {
      const { x, y, z } = block;
      dimension.runCommand(`setblock ${x} ${y} ${z} air destroy`)
      dimension.runCommand(`loot spawn ${x} ${y + 1} ${z} loot "minera/cata/chests/verdant_vault"`)
      dimension.runCommand(`particle mnra_cata:verdant_crusher ${x} ${y} ${z}`)
    }
  })
})

//platinum_vault
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:platinum_vault', {
    onPlayerInteract({ player, block, dimension }) {
      const { x, y, z } = block;
      const equipment = player.getComponent('equippable'); {
        const selectedItem = equipment.getEquipment('Mainhand');
        if (selectedItem?.typeId == 'mnra_cata:platinum_key') {
          player.playSound('vault.insert_item', { pitch: 1.2, location: player.location, volume: 1 })
          player.runCommand(`clear @s mnra_cata:platinum_key 0 1`)
          block.setPermutation(block.permutation.withState('mnra_cata:activate', true));
        } else if (selectedItem?.typeId !== 'mnra_cata:platinum_key') {
          player.playSound('vault.insert_item_fail', { pitch: 1.2, location: player.location, volume: 1 })
        }
      }
    }
  })
})
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:platinum_vault_break', {
    onTick({ block, dimension }) {
      const { x, y, z } = block;
      dimension.runCommand(`setblock ${x} ${y} ${z} air destroy`)
      dimension.runCommand(`loot spawn ${x} ${y + 1} ${z} loot "minera/cata/chests/platinum_vault"`)
    }
  })
})


//emberglow
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:emberglow_stepon', {
    onStepOn({ block, entity, dimension }) {
      const { x, y, z } = block;
      if (entity.hasComponent('health') && !entity.hasComponent('minecraft:fire_immune')) {
        dimension.runCommand(`particle mnra_cata:solar_ore_emitter ${x} ${y + 2} ${z} `);
        block.setPermutation(block.permutation.withState('mnra_cata:stepon', true));
        entity.applyDamage(18, { cause: "entityAttack" })
        entity.setOnFire(5)
        entity.runCommand(`playsound sound.tesla_coil_zap @a[r=12] ${x} ${y} ${z}`)
      }
    }
  })
})
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:emberglow', {
    onTick({ block, dimension, player }) {
      const { x, y, z } = block;
      const nearbyEntities = block.dimension.getEntities({
        location: block.location,
        maxDistance: 2,
        excludeFamilies: ["solar"]
      });
      for (const entity of nearbyEntities) {
        if (entity.hasComponent('health')) {
          entity.runCommand(`playsound sound.tesla_coil_zap @a[r=12] ${x} ${y} ${z}`)
          dimension.runCommand(`particle mnra_cata:solar_ore_emitter ${x} ${y + 2} ${z} `);
          entity.applyDamage(18, { cause: "entityAttack" })
          entity.setOnFire(5)
        }
      }
    }
  })
})
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:emberglow_stepoff', {
    onStepOff({ block, entity, dimension }) {
      const { x, y, z } = block;
      block.setPermutation(block.permutation.withState('mnra_cata:stepon', false));
    }
  })
})

//sealed_heart
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:sealed_heart', {
    onPlayerInteract({ block, player, dimension }) {
      if (block.north(6).hasTag('occult_alter_is_powered') &&
        block.east(6).hasTag('occult_alter_is_powered') &&
        block.south(6).hasTag('occult_alter_is_powered') &&
        block.west(6).hasTag('occult_alter_is_powered') &&
        block.north(5).east(5).hasTag('occult_alter_is_powered') &&
        block.south(5).west(5).hasTag('occult_alter_is_powered') &&
        block.north(5).west(5).hasTag('occult_alter_is_powered') &&
        block.south(5).east(5).hasTag('occult_alter_is_powered')) {
        //Start Event
        const { x, y, z } = block;

        dimension.runCommand(`summon mnra_cata:occult_alter_activated ${x} ${y} ${z}`)
        dimension.runCommand(`setblock ${x} ${y} ${z} air`)
        dimension.runCommand(`setblock ${x} ${y} ${z + 6} mnra_cata:occult_alter`)
        dimension.runCommand(`setblock ${x} ${y} ${z - 6} mnra_cata:occult_alter`)
        dimension.runCommand(`setblock ${x + 6} ${y} ${z} mnra_cata:occult_alter`)
        dimension.runCommand(`setblock ${x - 6} ${y} ${z} mnra_cata:occult_alter`)
        dimension.runCommand(`setblock ${x + 5} ${y} ${z + 5} mnra_cata:occult_alter`)
        dimension.runCommand(`setblock ${x - 5} ${y} ${z + 5} mnra_cata:occult_alter`)
        dimension.runCommand(`setblock ${x + 5} ${y} ${z - 5} mnra_cata:occult_alter`)
        dimension.runCommand(`setblock ${x - 5} ${y} ${z - 5} mnra_cata:occult_alter`)
        player.runCommand(`event entity @e occult_alter_activated_despawn`)

      } else {
        //Event Fails
      }
    }
  })
})