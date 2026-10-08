import {world} from "@minecraft/server";

export let PLAYERS = world.getAllPlayers();

function updatePlayers() {
  PLAYERS = world.getAllPlayers();
}

world.afterEvents.playerJoin.subscribe(() => {
  updatePlayers();
});

world.afterEvents.entityRemove.subscribe(({typeId}) => {
  if (typeId !== "minecraft:player") return;
  updatePlayers();
});

world.afterEvents.playerSpawn.subscribe(() => {
  updatePlayers();
});
