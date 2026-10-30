import { TicksPerSecond, system, world } from "@minecraft/server";

export const LoggerConfig = {
    ENABLE: false,
    CONSOLE_MODE: false,
    BLOCKED_TAGS: []
}

export function log(tag, ...messages) {
    if(!LoggerConfig.ENABLE) {
        return;
    }
    if(LoggerConfig.BLOCKED_TAGS.includes(tag)) {
        return;
    }
    let secs = Math.floor((system.currentTick+1)/TicksPerSecond) % 60;
    let mins = Math.floor(Math.floor((system.currentTick+1)/TicksPerSecond) / 60);

    if(secs < 10) {
        secs = "0"+secs;
    }
    if(mins < 10) {
        mins = "0"+mins;
    }

    let text = "";
    for(let msg of messages) {
        if(msg instanceof Error) {
            text += "Error(§b"+msg.name+"§r) { " + ": ";
            text += msg.message + "\n";
            text += "   caused by "+msg.stack + " }";
        } else if(msg) {
            text += JSON.stringify(msg);
        } else {
            text += `${msg}`;
        }
        text += " ";
    }
    if(LoggerConfig.CONSOLE_MODE) {
        console.error("["+tag+"]", "["+mins+":"+secs+"] ", text);
    } else {
        world.sendMessage("§g["+tag+"]§r§b["+mins+":"+secs+"]§r "+text);
    }
}