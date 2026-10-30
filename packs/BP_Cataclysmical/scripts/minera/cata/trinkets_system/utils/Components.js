import * as mc from "@minecraft/server";
import { log } from "./Logger";
//Variables
export var blockComponents = {}
export var itemComponents = {}
//Events
mc.system.beforeEvents.startup.subscribe(data=>{
    //console.warn("Teste2")
    for(let compName in blockComponents){
        data.blockComponentRegistry.registerCustomComponent(compName, blockComponents[compName])
    }
    for(let compName in itemComponents){
        data.itemComponentRegistry.registerCustomComponent(compName, itemComponents[compName])
    }
})