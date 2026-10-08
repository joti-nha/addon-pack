import {
   system,
   world,
   GameMode,
   Difficulty,
   EntityComponentTypes
} from "@minecraft/server";

import { getPlayers } from "./getPlayers.js";

const regenScore = new Map();
const REGEN_COOLDOWN = 12;

system.run(() => {
   world.gameRules.naturalRegeneration = true;
});

system.runInterval(() => {
   system.runJob(saturation());
}, 1);

function* saturation() {
   for (const player of getPlayers()) {
      if (!player.isValid) continue;

      if (player.getGameMode() !== GameMode.Survival) continue;

      const saturationComp = player.getComponent(EntityComponentTypes.Saturation);
      const hungerComp = player.getComponent(EntityComponentTypes.Hunger);
      const healthComp = player.getComponent(EntityComponentTypes.Health);

      if (!saturationComp || !hungerComp || !healthComp) continue;

      yield;

      if (!regenScore.has(player.id)) {
         regenScore.set(player.id, 0);
      }

      if (world.getDifficulty() === Difficulty.Peaceful) {
         saturationComp.currentValue = 5;
         yield;
      }

      if (healthComp.currentValue <= 0) continue;

      let score = regenScore.get(player.id);

      const canRegenBySaturation =
         healthComp.currentValue < healthComp.effectiveMax &&
         saturationComp.currentValue >= 3;

      const canRegenByHunger =
         healthComp.currentValue < healthComp.effectiveMax &&
         hungerComp.currentValue > 18;

      if (canRegenBySaturation || canRegenByHunger) {
         score++;

         if (score >= REGEN_COOLDOWN) {

            if (canRegenBySaturation && hungerComp.currentValue >= 18) {

               if (world.getDifficulty() !== Difficulty.Peaceful) {
                  saturationComp.setCurrentValue(
                     saturationComp.currentValue - 1.2
                  );
               }

               healthComp.setCurrentValue(
                  Math.min(
                     healthComp.currentValue + 1,
                     healthComp.effectiveMax
                  )
               );

            } else if (canRegenByHunger) {

               if (world.getDifficulty() !== Difficulty.Peaceful) {
                  hungerComp.setCurrentValue(
                     hungerComp.currentValue - 1
                  );
               }

               healthComp.setCurrentValue(
                  Math.min(
                     healthComp.currentValue + 1,
                     healthComp.effectiveMax
                  )
               );
            }

            score = 0;
         }
      }

      regenScore.set(player.id, score);
      yield;
   }
}