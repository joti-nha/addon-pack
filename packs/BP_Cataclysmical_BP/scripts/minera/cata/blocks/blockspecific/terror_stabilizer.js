import { world, ItemStack, system, TicksPerSecond } from '@minecraft/server';

// terror_stabilizer
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent("component:terror_stabilizer", {
    onPlayerInteract({ block, dimension, player }) {
      const equipment = player.getComponent("equippable");
      const heldItem = equipment?.getEquipment("Mainhand");

      const { x, y, z } = block;

      const TerrorStages = [
        { stage: 5, tag: "HasTerrorStage5" },
        { stage: 4, tag: "HasTerrorStage4" },
        { stage: 3, tag: "HasTerrorStage3" },
        { stage: 2, tag: "HasTerrorStage2" },
        { stage: 1, tag: "HasTerrorStage1" },
      ];

      function GetCurrentStage() {
        for (const entry of TerrorStages) {
          if (player.hasTag(entry.tag)) return entry;
        }
        return { stage: 0, tag: null };
      }
      function ShowTerror(Stage) {
        player.startItemCooldown("terror_detector", 20);
        player.onScreenDisplay.setActionBar(`§7O Terror está no estágio ${Stage}`);
        player.playSound('note.bass', { pitch: 1.6, location: player.location, volume: 0.3 })

        dimension.runCommand(`particle mnra_cata:terror_stabilizer_ectoplasm_flame ${x} ${y + 1} ${z}`);
      }

      if (heldItem?.typeId === "mnra_cata:ectoplasm") {
        const CurrentStage = GetCurrentStage();

        if (CurrentStage.stage <= 0) return;

        if (CurrentStage.tag) {
          player.removeTag(CurrentStage.tag);
        }

        const NewStage = CurrentStage.stage - 1;

        if (NewStage > 0) {
          const newTag = TerrorStages.find(entry => entry.stage === NewStage)?.tag;
          if (newTag) player.addTag(newTag);
        }

        player.onScreenDisplay.setActionBar(
          `§7O Terror agora está no estágio ${NewStage}`
        );

        player.runCommand("clear @s mnra_cata:ectoplasm 0 1");
        block.dimension.runCommand("playsound block.terror_stabilizer @a[r=10] ~ ~ ~ 1 1 1");
        player.playSound('block.terror_stabilizer', { pitch: 1, location: player.location, volume: 0.5 });

        dimension.runCommand(`particle mnra_cata:terror_stabilizer_bolt ${x} ${y} ${z}`);
        dimension.runCommand(`particle mnra_cata:terror_stabilizer ${x} ${y} ${z}`);
        dimension.runCommand(`particle mnra_cata:terror_stabilizer_ectoplasm_flame ${x} ${y + 1} ${z}`);
        return;
      }


      if (heldItem?.typeId === "mnra_cata:phantasma_matter") {
        const CurrentStage = GetCurrentStage();

        if (CurrentStage.stage >= 5) return;

        if (CurrentStage.tag) {
          player.removeTag(CurrentStage.tag);
        }

        const NewStage = CurrentStage.stage + 1;
        const newTag = TerrorStages.find(entry => entry.stage === NewStage)?.tag;
        if (newTag) player.addTag(newTag);

        player.onScreenDisplay.setActionBar(
          `§7O Terror agora está no estágio ${NewStage}`
        );

        player.runCommand("clear @s mnra_cata:phantasma_matter 0 1");

        block.dimension.runCommand("playsound block.terror_stabilizer @a[r=10] ~ ~ ~ 1 1 1");
        player.playSound('block.terror_stabilizer', { pitch: 0.8, location: player.location, volume: 0.5 });
        player.addEffect("wither", TicksPerSecond * 3, { amplifier: 1, showParticles: true });

        const { x, y, z } = block;
        dimension.runCommand(`particle mnra_cata:terror_player_death ${x} ${y} ${z}`);
        dimension.runCommand(`particle mnra_cata:terror_stabilizer_ectoplasm_flame ${x} ${y + 1} ${z}`);

        return;
      }

      const CurrentStage = GetCurrentStage();
      ShowTerror(CurrentStage.stage);
    },
  }
  );
});
system.beforeEvents.startup.subscribe(eventData => {
  eventData.blockComponentRegistry.registerCustomComponent('component:terror_stabilizer_tick', {
    onTick({ block, dimension }) {
      const { x, y, z } = block;

      dimension.runCommand(`particle mnra_cata:ectoplasm_soul ${x} ${y + 1} ${z}`)
      dimension.runCommand(`particle mnra_cata:ectoplasm_soul ${x} ${y + 1} ${z}`)
    }
  })
})

