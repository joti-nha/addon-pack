import { world, system, ItemStack } from "@minecraft/server";

system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:elemental_alter_particle', {
    onTick({ player, block, dimension }) {
      const { x, y, z } = block;

      try {
        if (block.north(2).east(2).typeId === ("mnra_cata:alter_pedestal")
          && block.north(2).west(2).typeId === ("mnra_cata:alter_pedestal")
          && block.south(2).west(2).typeId === ("mnra_cata:alter_pedestal")
          && block.south(2).east(2).typeId === ("mnra_cata:alter_pedestal")) {
          dimension.runCommand(`particle mnra_cata:elemental_alter_emitter ${x} ${y} ${z} `)
        }
      } catch { }
    }
  })
})

system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:elemental_alter_empty', {
    onPlayerInteract({ block, dimension, player }) {
      const { x, y, z } = block;
      const equipment = player.getComponent('equippable'); {
        const selectedItem = equipment.getEquipment('Mainhand');
        if (selectedItem?.typeId == 'minecraft:experience_bottle') {
          block.setPermutation(block.permutation.withState('mnra_cata:powered', true));
          player.playSound('beacon.activate', { pitch: 2, location: player.location, volume: 0.7 })
          dimension.runCommand(`particle mnra_cata:elemental_alter_emitter ${x} ${y} ${z} `)
          player.runCommand(`clear @s minecraft:experience_bottle 0 1`)
        }
      }
    }
  })
})


const altarUses = new Map();
const AlterUses = 3;

system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:elemental_alter_powered', {
    onPlayerInteract({ block, player, dimension }) {

      const equipment = player.getComponent("equippable");
      const selectedItem = equipment.getEquipment("Mainhand");
      if (!selectedItem) return;

      const { x, y, z } = block;

      function allPedestalsHaveTag(tag) {
        const positions = [
          { dx: 2, dz: 2 },
          { dx: 2, dz: -2 },
          { dx: -2, dz: 2 },
          { dx: -2, dz: -2 }
        ];

        for (const pos of positions) {
          const b = dimension.getBlock({ x: x + pos.dx, y: y, z: z + pos.dz });
          if (!b || !b.hasTag(tag)) return false;
        }
        return true;
      }

      function clearPedestals() {
        dimension.runCommand(`setblock ${x - 2} ${y} ${z - 2} mnra_cata:alter_pedestal destroy`);
        dimension.runCommand(`setblock ${x + 2} ${y} ${z + 2} mnra_cata:alter_pedestal destroy`);
        dimension.runCommand(`setblock ${x + 2} ${y} ${z - 2} mnra_cata:alter_pedestal destroy`);
        dimension.runCommand(`setblock ${x - 2} ${y} ${z + 2} mnra_cata:alter_pedestal destroy`);
      }

      function finishCraft() {
        const key = `${x},${y},${z}`;

        if (!altarUses.has(key)) altarUses.set(key, AlterUses);

        let usesLeft = altarUses.get(key) - 1;
        altarUses.set(key, usesLeft);

        player.playSound('random.anvil_land', {
          pitch: 1.3,
          location: player.location,
          volume: 0.8
        });

        clearPedestals();

        if (usesLeft <= 0) {
          block.setPermutation(block.permutation.withState('mnra_cata:powered', false));
          player.playSound('beacon.deactivate', {
            pitch: 1.3,
            location: player.location,
            volume: 0.8
          });

          altarUses.delete(key);
        } else {
          player.onScreenDisplay.setActionBar(`${usesLeft} usos restantes`);
        }
      }

      // Recipes (can work with other addons)
      const Recipes = [
        {
          input: 'mnra_cata:verdant_key',
          tag: 'alter_pedestal_floret',
          extraCheck: () =>
            block.north(2).typeId === 'mnra_cata:floret_block' &&
            block.south(2).typeId === 'mnra_cata:floret_block' &&
            block.east(2).typeId === 'mnra_cata:floret_block' &&
            block.west(2).typeId === 'mnra_cata:floret_block',
          result() {
            finishCraft();
            player.runCommand(`give @s mnra_cata:master_verdant_key 1`);
            player.runCommand(`clear @s mnra_cata:verdant_key 0 1`);
          }
        },
        {
          input: 'mnra_cata:verdant_hatchet',
          tag: 'alter_pedestal_floret',
          result() {
            finishCraft();
            equipment.setEquipment("Mainhand", new ItemStack('mnra_cata:floret_hatchet', 1));
          }
        },
        {
          input: 'mnra_cata:empty_ring',
          tag: 'alter_pedestal_floret',
          result() {
            finishCraft();
            equipment.setEquipment("Mainhand", new ItemStack('mnra_cata:floret_ring', 1));
          }
        },
        {
          input: 'mnra_cata:charm',
          tag: 'alter_pedestal_floret',
          result() {
            finishCraft();
            equipment.setEquipment("Mainhand", new ItemStack('mnra_cata:floret_charm', 1));
          }
        },
        {
          input: 'minecraft:netherite_sword',
          tag: 'alter_pedestal_solar',
          result() {
            finishCraft();
            equipment.setEquipment("Mainhand", new ItemStack('mnra_cata:morningstar', 1));
          }
        },
        {
          input: 'mnra_cata:empty_ring',
          tag: 'alter_pedestal_solar',
          result() {
            finishCraft();
            equipment.setEquipment("Mainhand", new ItemStack('mnra_cata:solar_ring', 1));
          }
        },
        {
          input: 'mnra_cata:charm',
          tag: 'alter_pedestal_solar',
          result() {
            finishCraft();
            equipment.setEquipment("Mainhand", new ItemStack('mnra_cata:solar_charm', 1));
          }
        },
        {
          input: 'minecraft:diamond_sword',
          tag: 'alter_pedestal_lunar',
          result() {
            finishCraft();
            equipment.setEquipment("Mainhand", new ItemStack('mnra_cata:moonsickle', 1));
          }
        },
        {
          input: 'minecraft:glowstone_dust',
          tag: 'alter_pedestal_astral',
          result() {
            finishCraft();
            const inventory = player.getComponent("minecraft:inventory")
            let StellarDust = new ItemStack("mnra_cata:stellar_dust")

            inventory.container.addItem(StellarDust)
            player.runCommand(`clear @s minecraft:glowstone_dust 0 1`);
          }
        },
        {
          input: 'mnra_cata:iron_greatsword',
          tag: 'alter_pedestal_astral',
          result() {
            finishCraft();
            equipment.setEquipment("Mainhand", new ItemStack('mnra_cata:stellar_greatsword', 1));
          }
        },
        {
          input: 'mnra_cata:charm',
          tag: 'alter_pedestal_astral',
          result() {
            finishCraft();
            equipment.setEquipment("Mainhand", new ItemStack('mnra_cata:stellar_charm', 1));
          }
        },
        {
          input: 'mnra_cata:empty_ring',
          tag: 'alter_pedestal_astral',
          result() {
            finishCraft();
            equipment.setEquipment("Mainhand", new ItemStack('mnra_cata:stellar_ring', 1));
          }
        },
        {
          input: 'mnra_cata:solar_core',
          tag: 'alter_pedestal_astral',
          result() {
            finishCraft();
            equipment.setEquipment("Mainhand", new ItemStack('mnra_cata:calibrated_stellar_core', 1));
          }
        },
        {
          input: 'minecraft:iron_helmet',
          tag: 'alter_pedestal_astral',
          result() {
            finishCraft();
            equipment.setEquipment("Mainhand", new ItemStack('mnra_cata:stellar_helmet', 1));
          }
        },
        {
          input: 'minecraft:iron_chestplate',
          tag: 'alter_pedestal_astral',
          result() {
            finishCraft();
            equipment.setEquipment("Mainhand", new ItemStack('mnra_cata:stellar_chestplate', 1));
          }
        },
        {
          input: 'minecraft:iron_leggings',
          tag: 'alter_pedestal_astral',
          result() {
            finishCraft();
            equipment.setEquipment("Mainhand", new ItemStack('mnra_cata:stellar_leggings', 1));
          }
        },
        {
          input: 'minecraft:iron_boots',
          tag: 'alter_pedestal_astral',
          result() {
            finishCraft();
            equipment.setEquipment("Mainhand", new ItemStack('mnra_cata:stellar_boots', 1));
          }
        }
      ];

      for (const recipe of Recipes) {
        if (selectedItem.typeId !== recipe.input) continue;
        if (!allPedestalsHaveTag(recipe.tag)) continue;
        if (recipe.extraCheck && !recipe.extraCheck()) continue;

        recipe.result();
        return;
      }
    }
  });
});


//alter_pedestal
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:alter_pedestal_astral', {
    onPlayerInteract({ block, player, dimension }) {
      const { x, y, z } = block;
      const equipment = player.getComponent('equippable'); {
        const selectedItem = equipment.getEquipment('Mainhand');
        if (selectedItem?.typeId == 'mnra_cata:astral_alloy') {
          block.setPermutation(block.permutation.withState('mnra_cata:alter_pedestal_astral', true));
          player.playSound('respawn_anchor.charge', { pitch: 1.5, location: player.location, volume: 0.5 })
          player.runCommand(`clear @s mnra_cata:astral_alloy 0 1`)
        }
      }
    }
  })
})
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:alter_pedestal_astral_remove', {
    onPlayerInteract({ block, player, dimension }) {
      const { x, y, z } = block;
      const equipment = player.getComponent('equippable'); {
        const selectedItem = equipment.getEquipment('Mainhand');
        if (player.isSneaking) {
          block.setPermutation(block.permutation.withState('mnra_cata:alter_pedestal_astral', false));
          dimension.runCommand(`loot spawn ${x} ${y + 1} ${z} loot "minera/cata/alter/astral_alloy"`)
        }
      }
    }
  })
})

system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:alter_pedestal_floret', {
    onPlayerInteract({ block, player, dimension }) {
      const { x, y, z } = block;
      const equipment = player.getComponent('equippable'); {
        const selectedItem = equipment.getEquipment('Mainhand');
        if (selectedItem?.typeId == 'mnra_cata:floret_element') {
          block.setPermutation(block.permutation.withState('mnra_cata:alter_pedestal_floret', true));
          player.playSound('respawn_anchor.charge', { pitch: 1.5, location: player.location, volume: 0.5 })
          player.runCommand(`clear @s mnra_cata:floret_element 0 1`)
        }
      }
    }
  })
})
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:alter_pedestal_floret_remove', {
    onPlayerInteract({ block, player, dimension }) {
      const { x, y, z } = block;
      const equipment = player.getComponent('equippable'); {
        const selectedItem = equipment.getEquipment('Mainhand');
        if (player.isSneaking) {
          block.setPermutation(block.permutation.withState('mnra_cata:alter_pedestal_floret', false));
          dimension.runCommand(`loot spawn ${x} ${y + 1} ${z} loot "minera/cata/alter/floret_element"`)
        }
      }
    }
  })
})

system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:alter_pedestal_solar', {
    onPlayerInteract({ block, player, dimension }) {
      const { x, y, z } = block;
      const equipment = player.getComponent('equippable'); {
        const selectedItem = equipment.getEquipment('Mainhand');
        if (selectedItem?.typeId == 'mnra_cata:solar_element') {
          block.setPermutation(block.permutation.withState('mnra_cata:alter_pedestal_solar', true));
          player.playSound('respawn_anchor.charge', { pitch: 1.5, location: player.location, volume: 0.5 })
          player.runCommand(`clear @s mnra_cata:solar_element 0 1`)
        }
      }
    }
  })
})
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:alter_pedestal_solar_remove', {
    onPlayerInteract({ block, player, dimension }) {
      const { x, y, z } = block;
      const equipment = player.getComponent('equippable'); {
        const selectedItem = equipment.getEquipment('Mainhand');
        if (player.isSneaking) {
          block.setPermutation(block.permutation.withState('mnra_cata:alter_pedestal_solar', false));
          dimension.runCommand(`loot spawn ${x} ${y + 1} ${z} loot "minera/cata/alter/solar_element"`)
        }
      }
    }
  })
})

system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:alter_pedestal_lunar', {
    onPlayerInteract({ block, player, dimension }) {
      const { x, y, z } = block;
      const equipment = player.getComponent('equippable'); {
        const selectedItem = equipment.getEquipment('Mainhand');
        if (selectedItem?.typeId == 'mnra_cata:lunar_element') {
          block.setPermutation(block.permutation.withState('mnra_cata:alter_pedestal_lunar', true));
          player.playSound('respawn_anchor.charge', { pitch: 1.5, location: player.location, volume: 0.5 })
          player.runCommand(`clear @s mnra_cata:lunar_element 0 1`)
        }
      }
    }
  })
})
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:alter_pedestal_lunar_remove', {
    onPlayerInteract({ block, player, dimension }) {
      const { x, y, z } = block;
      const equipment = player.getComponent('equippable'); {
        const selectedItem = equipment.getEquipment('Mainhand');
        if (player.isSneaking) {
          block.setPermutation(block.permutation.withState('mnra_cata:alter_pedestal_lunar', false));
          dimension.runCommand(`loot spawn ${x} ${y + 1} ${z} loot "minera/cata/alter/lunar_element"`)
        }
      }
    }
  })
})