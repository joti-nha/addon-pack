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
        player.onScreenDisplay.setActionBar("Um jogador acabou de escapar")

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
// Addon Pack: as poses de defesa ao agachar com os escudos (Sentinela e Desossado) agora sao as do A&S
// (ferramentas/escudos_dk.py). Este laco tocava, a cada tick, tres animacoes no mesmo controle "shield",
// uma trocando a outra, e o braco piscava ao defender.

// Addon Pack: a defesa ao agachar com os escudos (Sentinela e Desossado) saiu daqui e foi para o Unified Core
// (BP_UnifiedCore/scripts/combate.js, etiqueta ap:escudo_agachar). Este handler devolvia a vida depois do golpe:
// golpe fatal matava mesmo defendendo, e dano sem atacante (queda, fogo) dava erro no script.