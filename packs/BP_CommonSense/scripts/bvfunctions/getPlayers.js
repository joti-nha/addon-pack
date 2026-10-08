import { world } from "@minecraft/server";

export function getPlayers() {
   return world.getAllPlayers();
}