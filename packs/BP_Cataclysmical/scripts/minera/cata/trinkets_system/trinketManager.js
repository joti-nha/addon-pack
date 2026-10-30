import { world, EffectTypes } from "@minecraft/server"; 

const pendingEvents = [];

/**
 * Trinket Manager - Advanced Effects System
 * This class handles the registration of trinkets and manages
 * the activation/deactivation of effects using EffectHandlers.
 */
export class TrinketManager {
    constructor() {
        this.activeEffects = new Map(); // playerId -> Set<trinketId>
        this.effectHandlers = new Map(); // trinketId -> EffectHandler
    }

    /**
     * Register a trinket effect handler
     * @param {string} trinketId 
     * @param {EffectHandler} handler 
     */
    registerTrinket(trinketId, handler) {
        this.effectHandlers.set(trinketId, handler);
    }

    /**
     * Apply attribute modifier to player (Placeholder for complex implementation)
     */
    applyAttributeModifier(player, attribute, amount, operation = "add") {
        // Implementation for attribute modification goes here if needed.
    }

    /**
     * Apply effect to player (using status effects)
     * @param {Player} player 
     * @param {string} effectType 
     * @param {number} durationInSeconds 
     * @param {number} amplifier 
     */
    applyEffect(player, effectType, durationInSeconds, amplifier = 0) {
        try {
            const mcEffectType = EffectTypes.get(`minecraft:${effectType}`); 
            if (mcEffectType) {
                // Duration is in ticks (20 ticks per second)
                player.addEffect(mcEffectType, durationInSeconds * 20, {
                    amplifier: amplifier,
                    showParticles: false // Hide particles for trinket effects
                });
            } else {
                console.warn(`Unknown effect type: ${effectType}`);
            }
        } catch (error) {
            console.error(`Could not apply effect ${effectType} to ${player.name}:`, error);
        }
    }

    /**
     * Remove effect from player
     * @param {Player} player 
     * @param {string} effectType 
     */
    removeEffect(player, effectType) {
        try {
            const mcEffectType = EffectTypes.get(`minecraft:${effectType}`);
            if (mcEffectType) {
                player.removeEffect(mcEffectType);
            }
        } catch (error) {
            console.error(`Could not remove effect ${effectType} from ${player.name}:`, error);
        }
    }

    handleEvent(event) {
        const handler = this.effectHandlers.get(event.trinketId);
        if (!handler) {
            return;
        }
        const player = this.getPlayerById(event.playerId);
        if (!player) {
            return;
        }

        let activeSet = this.activeEffects.get(event.playerId);
        if (event.type === "activate") {
            handler.onActivate(player, this);
            if (!activeSet) {
                activeSet = new Set();
                this.activeEffects.set(event.playerId, activeSet);
            }
            activeSet.add(event.trinketId);
        } else if (event.type === "deactivate") {
            handler.onDeactivate(player, this);
            if (activeSet) {
                activeSet.delete(event.trinketId);
                if (activeSet.size === 0) {
                    this.activeEffects.delete(event.playerId);
                }
            }
        }
    }

    tickActiveTrinkets() {
        if (this.activeEffects.size === 0) {
            return;
        }
        for (const [playerId, trinketSet] of this.activeEffects) {
            if (trinketSet.size === 0) continue;
            const player = this.getPlayerById(playerId);
            if (!player) continue;
            for (const trinketId of trinketSet) {
                const handler = this.effectHandlers.get(trinketId);
                handler?.onTick(player, this);
            }
        }
    }

    getPlayerById(playerId) {
        const players = world.getPlayers();
        for (const player of players) {
            if (player.id === playerId) {
                return player;
            }
        }
        return undefined;
    }
}

/**
 * Base class for trinket effect handlers
 */
export class EffectHandler {
    constructor(trinketId, name) {
        this.trinketId = trinketId;
        this.name = name;
    }

    /**
     * Called when trinket is activated
     */
    onActivate(player, manager) {
        player.onScreenDisplay.setActionBar(`§a${this.name} ativado!`);
    }

    /**
     * Called when trinket is deactivated
     */
    onDeactivate(player, manager) {
        player.onScreenDisplay.setActionBar(`§c${this.name} desativado.`);
    }

    /**
     * Called every check interval while trinket is active
     */
    onTick(player, manager) {
        // Override in subclasses for continuous effects (e.g., healing)
    }
}

/**
 * Queue a trinket change event.
 * @param {object} event
 * @param {"activate"|"deactivate"} event.type
 * @param {string} event.playerId
 * @param {string} event.trinketId
 */
export function queueTrinketEvent(event) {
    if (!event || !event.playerId || !event.trinketId || !event.type) {
        return;
    }
    pendingEvents.push(event);
}

export function drainTrinketEvents() {
    if (pendingEvents.length === 0) return [];
    const events = pendingEvents.slice();
    pendingEvents.length = 0;
    return events;
}
