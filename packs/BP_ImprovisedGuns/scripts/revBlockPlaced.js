import * as server from "@minecraft/server"
import {
   ARROW_EFFECTS
} from "./vgConstants"
import {
   damageItem,
   shootProjectile,
   itemReplace,
   enchantRemover
} from "./vgFunctions"
const world = server.world


world.afterEvents.playerPlaceBlock.subscribe(data => {
   if (data.block.typeId == "rev:firearm_forger") {
      const dimension = data.block.dimension;
      const loc = data.block.location;
      dimension.spawnEntity('rev:firearm_forger', {
         x: loc.x + 0.5,
         y: loc.y,
         z: loc.z + 0.5
      })
   } else return;
})

world.beforeEvents.playerBreakBlock.subscribe(data => {
   const dimension = data.block.dimension;
   const playerLocation = data.block.location;
   if (data.block.typeId == "rev:firearm_forger") {
      const entitiesToDelete = dimension.getEntities({
         location: playerLocation,
         type: "rev:firearm_forger",
         minDistance: 0,
         maxDistance: 1
      })
      for (let i = 0; i < entitiesToDelete.length; i++) {
         const currentEntity = entitiesToDelete[i]
         if (currentEntity.typeId == "rev:firearm_forger") {
            server.system.run(() => {
               currentEntity.remove()
            });

         }
      }
   }
})

world.afterEvents.projectileHitBlock.subscribe(data => {
    if (data.projectile.typeId == "rev:fake_arrow") 
    {
        server.system.runTimeout(() => {
            data.projectile.remove();
        },2)
    } else return;
 })