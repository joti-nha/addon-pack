import * as server from "@minecraft/server";
import { showConfigUI } from "./revConfigUI.js";

const world = server.world;
server.system.beforeEvents.startup.subscribe(a => {
    const ImprovisedGunsConfig = {
        name: "rev:improvisedgunsmenu",
        description: "Open the Improvised Guns menu.",
        cheatsRequired: false,
        permissionLevel: 0
    }
    a.customCommandRegistry.registerCommand(ImprovisedGunsConfig,
        (origin) => {
            if (!(origin.sourceEntity instanceof server.Player))
                return;

            server.system.run(() => {
                showConfigUI(origin.sourceEntity);
            });
        }
    )
});
