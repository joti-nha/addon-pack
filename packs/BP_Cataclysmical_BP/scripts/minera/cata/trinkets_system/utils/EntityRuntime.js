import { Container, ContainerSlot, Dimension, Entity, EntityEquippableComponent, EntityInventoryComponent, EntityRideableComponent, EquipmentSlot, ItemStack, system, world } from "@minecraft/server";
import { log } from "./Logger";

/** @type {Map<string, RuntimeItem>} */
const RUNNING_ENTITIES = {};
const CREATORS = {};
const LOG_TAG = "EntityRuntime";

function gc() {
    const deletes = [];
    Object.keys(RUNNING_ENTITIES).forEach(id => {
        if (Date.now() - RUNNING_ENTITIES[id]["time"] >= 2000) {
            deletes.push(id);
        }
    });
    for (let key of deletes) {
        delete RUNNING_ENTITIES[key];
    }
}

class RuntimeItem {
    time = 0;
    /** @type {EntityObject} */
    data = null;
    /** @type {Entity} */
    entity = null;
}

export class EntityObjectComponent {
    /** @returns {EntityObject} */
    getObject() {
        return this.__object;
    }

    /** @returns  {Entity}*/
    getEntity() {
        return this.getObject().getEntity();
    }

    onTick() { }
    onUpdate() { }

    dropComponent() {
        const obj = this.getObject();
        if (Boolean(obj)) {
            obj.removeComponent(this);
        }
    }
}

export class EntityObject {
    updateInterval = 20;
    data = {};
    #components = [];

    constructor() {
        const self = this;
        this.data = new Proxy({}, {
            get(target, prop, receiver) {
                let value = self.getEntity().getDynamicProperty(prop)
                let valueNew = undefined
                if (typeof (value) == "string") {

                    if ((value.startsWith('\u03A9'))) {
                        value = value.substring(1)
                        const object = JSON.parse(value)
                        value = object
                    } else if ((value.startsWith('\u03A8'))) {
                        value = value.substring(1)
                        const object = JSON.parse(value)
                        value = object
                    }

                }
                if (Array.isArray(value)) {
                    return new Proxy(value, {
                        get(arrTarget, arrProp, arrReceiver) {
                            const arrValue = Reflect.get(arrTarget, arrProp, arrReceiver);
                            if (typeof arrValue === "function") {
                                return function (...args) {
                                    const result = arrValue.apply(arrTarget, args);
                                    const json = '\u03A8' + JSON.stringify(arrTarget);
                                    self.getEntity().setDynamicProperty(prop, json);
                                    return result;
                                };
                            }
                            return arrValue;
                        },
                        set(arrTarget, arrProp, newVal) {
                            arrTarget[arrProp] = newVal;
                            const json = '\u03A8' + JSON.stringify(arrTarget);
                            self.getEntity().setDynamicProperty(prop, json);
                            return true;
                        }
                    });
                }
                return value;
            },
            set(target, prop, value, receiver) {
                if (typeof (value) == "object") {
                    var valueString = JSON.stringify(value)
                    if (valueString.startsWith("{") && valueString.endsWith("}")) {
                        if (!(Object.keys(value).filter(e => ["x", "z", "y"].includes(e)).length == 3)) {
                            value = '\u03A9' + valueString
                        }
                    } else if (valueString.startsWith("[") && valueString.endsWith("]")) {
                        value = '\u03A8' + valueString
                    }

                }
                self.getEntity().setDynamicProperty(prop, value)
                return true;
            },
            has(target, prop) {
                return self.getEntity().getDynamicPropertyIds().includes(prop)
            }
        })
    }

    remRot() {
        let entity = this.getEntity();
        let player = entity.dimension.getPlayers({
            closest: true, location: entity.location
        })[0];
        /** @type {EntityEquippableComponent} */
        let equippable = player.getComponent(EntityEquippableComponent.componentId);
        let item = equippable.getEquipment(EquipmentSlot.Mainhand);
        if (!Boolean(item)) return 0;
        if (item.typeId == "dlvn_rj:remove") {
            entity.triggerEvent("dlvn_rj:killme");
            return 1;
        }
        if (item.typeId == "dlvn_rj:rotate") {
            entity.triggerEvent("dlvn_rj:rotate");
            return 1;
        }
        return 0;
    }

    // onCreate(){
    //     log("Furniture", this.getEntity().typeId);
    // }

    onTick() { }
    onUpdate() { }

    /** @returns {Array<Entity>} */
    getRiders() {
        try {
            /** @type {EntityRideableComponent} */
            const riderable = this.getEntity().getComponent(EntityRideableComponent.componentId);
            return riderable.getRiders() ?? [];
        } catch (e) {
            return [];
        }
    }

    /** @returns {Container | undefined} */
    getInventory() {
        return this.getEntity()?.getComponent(EntityInventoryComponent.componentId)?.container;
    }
    /** @returns {ContainerSlot[] | undefined} */
    getInventoryItems() {
        const container = this.getInventory();
        if (container) {
            const slots = []
            for (let i = 0; i < container.size; i++) {
                const slot = container.getSlot(i)
                if (slot && slot.hasItem()) {
                    slots.push(slot)
                }
            }
            return slots;
        }
        return undefined;
    }
    /** @returns {ContainerSlot[] | undefined} */
    getInventorySlots() {
        const container = this.getInventory();
        if (container) {
            const slots = []
            for (let i = 0; i < container.size; i++) {
                const slot = container.getSlot(i)
                slots.push(slot)
            }
            return slots;
        }
        return undefined;
    }
    /** @returns {ContainerSlot | undefined} */
    getEquipament(slot) {
        return this.getEntity()?.getComponent(EntityEquippableComponent.componentId)?.getEquipmentSlot(slot);
    }

    getComponents() {
        return this.#components;
    }

    addComponent(component) {
        component.__object = this;
        if (!this.#components.includes(component)) {
            this.#components.push(component);
        }
    }

    removeComponent(component) {
        if (typeof component == "string") {
            component = this.#components.filter(comp => comp.id == component)[0];
        }
        if (component.__object == this) {
            component.__object = undefined;
        }
        this.#components = this.#components.filter(comp => comp != component);
    }


    hasRiders() {
        return this.getRiders().length > 0;
    }

    isSneaking() {
        return this.getEntity().isSneaking;
    }

    /** @returns {Entity} */
    getEntity() {
        return this.__item.entity;
    }

    getActiveTime() {
        return this.getEntity().getDynamicProperty("__lifetime__") ?? 0;
    }

    setProperty(name, value) {
        this.getEntity().setProperty(name, value);
    }

    getProperty(name) {
        try {
            return this.getEntity().getProperty(name);
        } catch (e) {
            return undefined;
        }
    }
}

export class EntityRuntime {
    static register(id, clazz) {
        CREATORS[id] = clazz;
    }

    static remove(id) {
        delete CREATORS[id];
    }

    /**
     * @param {Entity} entity 
     * @param {string} name 
     * @param {*} args 
     */
    static invokeEvent(entity, name, ...args) {
        if (entity && entity.typeId in CREATORS) {
            executeSafeEvent(entity, name, ...args);
        }
    }

    /** @returns {EntityObject} */
    static getObjectFor(entity) {
        if (entity) {
            return RUNNING_ENTITIES[entity.id];
        } else {
            return undefined;
        }
    }
    /** @returns {EntityObject} */
    static getDataFor(entity) {
        if (entity && entity.id in RUNNING_ENTITIES) {
            return new Proxy({}, {
                get(target, prop, receiver) {
                    let value = entity.getDynamicProperty(prop)
                    let valueNew = undefined
                    if (typeof (value) == "string") {

                        if ((value.startsWith('\u03A9'))) {
                            value = value.substring(1)
                            const object = JSON.parse(value)
                            value = object
                        } else if ((value.startsWith('\u03A8'))) {
                            value = value.substring(1)
                            const object = JSON.parse(value)
                            value = object
                        }

                    }
                    if (Array.isArray(value)) {
                        return new Proxy(value, {
                            get(arrTarget, arrProp, arrReceiver) {
                                const arrValue = Reflect.get(arrTarget, arrProp, arrReceiver);
                                if (typeof arrValue === "function") {
                                    return function (...args) {
                                        const result = arrValue.apply(arrTarget, args);
                                        const json = '\u03A8' + JSON.stringify(arrTarget);
                                        entity.setDynamicProperty(prop, json);
                                        return result;
                                    };
                                }
                                return arrValue;
                            },
                            set(arrTarget, arrProp, newVal) {
                                arrTarget[arrProp] = newVal;
                                const json = '\u03A8' + JSON.stringify(arrTarget);
                                entity.setDynamicProperty(prop, json);
                                return true;
                            }
                        });
                    }
                    return value;
                },
                set(target, prop, value, receiver) {
                    if (typeof (value) == "object") {
                        var valueString = JSON.stringify(value)
                        if (valueString.startsWith("{") && valueString.endsWith("}")) {
                            if (!(Object.keys(value).filter(e => ["x", "z", "y"].includes(e)).length == 3)) {
                                value = '\u03A9' + valueString
                            }
                        } else if (valueString.startsWith("[") && valueString.endsWith("]")) {
                            value = '\u03A8' + valueString
                        }

                    }
                    entity.setDynamicProperty(prop, value)
                    return true;
                },
                has(target, prop) {
                    return entity.getDynamicPropertyIds().includes(prop)
                }
            })
        } else {
            return undefined
        }
    }
}


/**
 * @param {Entity} entity 
 * @param {string} name 
 * @param  {...any} args 
 */
function executeEvent(entity, name, ...args) {
    try {
        if (!(entity.id in RUNNING_ENTITIES)) {
            const item = new RuntimeItem();
            item.time = Date.now()
            item.entity = entity;
            item.data = new CREATORS[entity.typeId];
            item.data.__item = item;
            RUNNING_ENTITIES[entity.id] = item;
            executeSafeEvent(entity, "create");
        }
        /** @type {RuntimeItem} */
        const data = RUNNING_ENTITIES[entity.id];
        data.entity = entity;
        data.time = Date.now();

        const entityObject = data.data;

        if (name in entityObject) {
            try {
                entityObject[name](...args);
            } catch (error) {
                log(LOG_TAG, "Error on call entity function ", name, error);
            }
        }
        for (let component of entityObject.getComponents()) {
            component.__object = entityObject;
            if (name in component) {
                try {
                    component[name](...args);
                } catch (e) {
                    log(LOG_TAG, "Error on call entity function on component", name, error);
                }
            }
        }
    } catch (e) {
        // log("Error: ", e)
    }
}

/** @param {string} name  */
function parseEventName(name) {
    name = name + "";
    if (name.includes(":")) {
        name = name.split(":")[1];
    }
    name = name.toLowerCase();
    const allowed = "abcdefghijklmnopqrstuvwxyz";
    let formatted = "";
    for (let i = 0; i < name.length; i++) {
        const ch = name.charAt(i);
        if (allowed.includes(ch)) {
            formatted += ch;
        } else if (!formatted.endsWith(".")) {
            formatted += ".";
        }
    }
    let finalName = "";
    formatted.split(".").forEach(segment => {
        if (segment.length > 1) {
            finalName += segment.charAt(0).toUpperCase() + segment.substring(1).toLowerCase();
        }
    })
    return finalName;
}


/**
 * @param {Entity} entiy 
 * @param {string} rawName 
 */
function executeSafeEvent(entiy, rawName, ...args) {
    const name = "on" + parseEventName(rawName);
    if (entiy && entiy.typeId in CREATORS) {
        executeEvent(entiy, name, ...args);
    }
}

system.runInterval(() => {
    let activeDimensions = {};
    world.getAllPlayers().forEach(player => activeDimensions[player.dimension.id] = player.dimension);
    /** @type {Array<Entity>} */
    let entities = [];
    for (let dimen of Object.values(activeDimensions)) {
        /** @type {Dimension} */
        const dimension = dimen;
        dimension.getEntities().forEach(e => {
            if (e && e.typeId in CREATORS) {
                entities.push(e);
            }
        });
    }
    for (let entity of entities) {
        try {
            const ticks = (entity.getDynamicProperty("__lifetime__") ?? -1) + 1;
            entity.setDynamicProperty("__lifetime__", ticks);
            executeEvent(entity, "onTick");
            const obj = RUNNING_ENTITIES[entity.id].data;
            if (ticks % obj.updateInterval == 0) {
                executeEvent(entity, "onUpdate");
            }
        } catch (e) {
            // log("Error: ", e)
        }
    }
    entities = [];
    gc();
});

world.afterEvents.entityHitEntity.subscribe(e => {
    executeSafeEvent(e.damagingEntity, "hit", e.hitEntity)
    executeSafeEvent(e.hitEntity, "damage", e.damagingEntity)
});

system.afterEvents.scriptEventReceive.subscribe(e => {
    if (e.sourceEntity && e.sourceEntity.typeId in CREATORS) {
        try {
            let msg = e.message;
            while (msg.includes("  ")) msg = msg.replace("  ", " ");
            msg = msg.split(" ");
            let args = [];
            for (let msgPart of msg) {
                if (msgPart.replace(".", "").match(/^\d*$/)) {
                    msg = parseFloat(msgPart);
                } else if (msgPart == "true" || msgPart == "false") {
                    args.push(msgPart == "true");
                } else {
                    args.push(msgPart);
                }
            }
            executeSafeEvent(e.sourceEntity, e.id, ...args);
        } catch (e) {
            log(LOG_TAG, "Error on process script event", e);
        }
    }
});
world.afterEvents.entityLoad.subscribe(e => executeSafeEvent(e.entity, "load"));
world.beforeEvents.entityRemove.subscribe(e => executeSafeEvent(e.removedEntity, "remove"));
world.afterEvents.itemUse.subscribe(e => executeSafeEvent(e.source, "item_use", e.itemStack));
world.afterEvents.dataDrivenEntityTrigger.subscribe(e => executeSafeEvent(e.entity, e.eventId));
world.afterEvents.entitySpawn.subscribe(e => executeSafeEvent(e.entity, "spawn"))
world.afterEvents.entityHitBlock.subscribe(e => executeSafeEvent(e.damagingEntity, "hit_block", e.hitBlock));
world.afterEvents.entityHurt.subscribe(e => executeSafeEvent(e.hurtEntity, "hurt", e.damage, e.damageSource));
world.afterEvents.projectileHitEntity.subscribe(e => {
    executeSafeEvent(e.projectile, "hit", e.getEntityHit().entity);
    executeSafeEvent(e.projectile, "projectile_hit", e.location);
})
world.afterEvents.projectileHitBlock.subscribe(e => {
    executeSafeEvent(e.projectile, "hit_block", e.getBlockHit().block);
    executeSafeEvent(e.projectile, "projectile_hit", e.location);
})