import { Container, ContainerSlot, Entity, EntityEquippableComponent, EntityInventoryComponent, EntityTypeFamilyComponent, ItemStack } from "@minecraft/server";
import HMath from "./HMath";

export class ContainerUtils {
    /** 
     * @param {Block | Entity} target
     * @returns {Container}
     */
    static getContainer(target) {
        let container = undefined;
        if (!(target && target.isValid)) { return undefined; }
        if (target.getComponent("inventory")) {
            container = target.getComponent("inventory").container
        }


        return container;
    }
    /** 
     * @param {Block | Entity} target
     * @param {string} type
     * @returns {ContainerSlot[]} */
    static getInventoryItems(target, type = "", includeEmpty = false) {
        const container = ContainerUtils.getContainer(target)

        let slots = []
        if (container) {

            for (let i = 0; i < container.size; i++) {
                const slot = container.getSlot(i)
                if (slot && slot.hasItem()) {
                    slot.slotIndex = i
                    slots.push(slot)
                } else if (includeEmpty && slot && slot.getItem() == undefined) {
                    slot.slotIndex = i
                    slots.push(slot)
                }
            }
            if (type != "") {
                slots = slots.filter(slot => ((slot.getItem() && slot?.typeId == type) || (slot.getItem() == undefined && includeEmpty)))
            }
        }
        return slots;
    }
    /** 
      * @param {Block | Entity} target
      * @param {string} type
      * @returns {ContainerSlot[] | undefined} */
    static getAmountItems(target, type) {
        const items = ContainerUtils.getInventoryItems(target, type)
        let amount = 0
        items.forEach(slot => {
            amount += slot.amount
        })
        return amount
    }
    /**
   * 
 * @param {ContainerSlot} slot
 * @param {Block | Entity} target
 * @returns {number} 
  */
    static stackableItemOn(target, slot) {
        const container = ContainerUtils.getContainer(target)
        const item = slot.getItem()
        let stackableAmount = 0
        if (container && item) {
            const items = ContainerUtils.getInventoryItems(target, item.typeId, true)
            items.forEach(slotI => {
                const itemT = slotI.getItem()
                if (!itemT) {
                    stackableAmount += 1
                } else if (itemT && itemT.isStackableWith(itemT) == true && (itemT.amount < itemT.maxAmount)) {
                    stackableAmount += 1
                }
            })
        }
        return stackableAmount
    }
    /**
* 
* @param {string | ItemStack} item
* @param {Block | Entity} target
* @param {number} value
* @returns {boolean | ItemStack} 
*/
    static addItem(target, item, value) {
        const container = ContainerUtils.getContainer(target)
        let added = undefined
        if (container) {
            if (typeof (item) == 'string') {
                added = container.addItem(new ItemStack(item, value))
            } else {
                added = container.addItem(item)
            }

        }
        return added == undefined ? true : added
    }
    /**
* 
* @param {ContainerSlot | Number} slot
* @param {Block | Entity} target
* @param {number} value
* @returns {{ removedItem: ItemStack, slot: ContainerSlot } | undefined}
*/
    static removeSlot(target, slot, value) {
        const container = ContainerUtils.getContainer(target)
        
        let itemRemoved = undefined
        if (container) {
            if(typeof slot == "number"){
                slot = container.getSlot(slot)
            }
            const operateSlot = function (amount) {
                const item = slot.getItem()?.clone()
                if (item) {
                    var nextValue = item.amount - amount
                    item.amount = nextValue > 0 ? nextValue : 1
                    slot.setItem(nextValue <= 0 ? undefined : item)
                }
            }
            const item = slot.getItem().clone()
            const amount = HMath.clamp(item.amount, 0, value)
            operateSlot(amount)
            item.amount = amount
            itemRemoved = item
            return { removedItem: itemRemoved, slot: slot }
        }
        return undefined
    }
    /**
* 
* @param {String} itemType
* @param {Block | Entity} target
* @param {number} value
* @returns {ItemStack | undefined}
*/
    static removeItem(target, itemType, value) {
        const container = ContainerUtils.getContainer(target)
        const operateSlot = function (slot, amount) {
            const item = slot.getItem()?.clone()
            if (item) {
                var nextValue = item.amount - amount
                item.amount = nextValue > 0 ? nextValue : 1
                slot.setItem(nextValue <= 0 ? undefined : item)
            }
        }
        let itemRemoved = undefined
        if (container) {
            const items = ContainerUtils.getInventoryItems(target, itemType)
            if (items == undefined || items?.length == 0) { return undefined }
            const item = items[0].getItem().clone()
            const amount = HMath.clamp(item.amount, 0, value)
            operateSlot(items[0], amount)
            item.amount = amount
            itemRemoved = item
            return itemRemoved
        }
        return undefined
    }
    /**
* 
* @param {ContainerSlot} slot
* @param {Block | Entity} target
* @param {string | ItemStack} item 
* @param {number} value
* @returns {ContainerSlot | undefined} 
*/
    static setItem(target, slot, item, value) {
        const container = ContainerUtils.getContainer(target)
        if (container) {
            if (typeof (slot) == "number") {
                slot = container.getSlot(slot)
            }
            if (typeof (item) == "string") {
                slot.setItem(new ItemStack(item, value))
            } else {
                slot.setItem(item)
            }
            return slot
        }
        return undefined
    }

}
export class EntityUtils {
    /** 
 * @param {Entity} entity
 * @returns {ItemStack} 
 */
    static getHandItem(entity) {
        /** @type {EntityEquippableComponent} */
        const component = entity.getComponent(EntityEquippableComponent.componentId);
        return component.getEquipment(EquipmentSlot.Mainhand) ?? new ItemStack("minecraft:air", 1);
    }
     /** 
 * @param {Entity} entity
 * @returns {ContainerSlot} 
 */
     static getHandSlot(entity) {
        /** @type {EntityEquippableComponent} */
        const component = entity.getComponent(EntityEquippableComponent.componentId);
        return component.getEquipmentSlot("Mainhand");
    }

    /**
     * @param {Entity} entity 
     */
    static hasFamily(entity, family) {
        const familyComponent = entity.getComponent(EntityTypeFamilyComponent.componentId);
        if (familyComponent) {
            return familyComponent.hasTypeFamily(family);
        }
        return false;
    }
    /** @returns {ContainerSlot[] | undefined} */
    static getInventoryItems(entity) {
        const container = entity.getComponent("inventory")?.container;
        if(container){
            const slots = []
            for(let i = 0; i < container.size; i++){
                const slot = container.getSlot(i)
                if(slot && slot.hasItem()){
                    slots.push(slot)
                }
            }
            return slots;
        }
        return undefined;
    }
    /** @returns {Container | undefined} */
    static getContainer(entity) {
        const container = entity.getComponent("inventory")?.container;
        return container;
    }
    static hasItems(entity, id, count = 1) {
        /** @type {EntityInventoryComponent} */
        const inventory = entity.getComponent(EntityInventoryComponent.componentId);
        let amount = count;

        for (let i = 0; i < inventory.inventorySize; i++) {
            const item = inventory.container.getItem(i);
            if (item && item.typeId == id) {
                amount -= item.amount;
                if (amount <= 0) return true;
            }
        }

        return amount <= 0;
    }
    /**
     * 
     * @param {ContainerSlot} slot 
     * @param {string} type 
     */
    static transformType(slot, type){
        const item = slot.getItem().clone()
        const newItem = new ItemStack(type)
        newItem.setLore(item.getLore())
        newItem.amount = item.amount
        newItem.keepOnDeath = item.keepOnDeath
        newItem.lockMode = item.lockMode
        item.getDynamicPropertyIds().forEach((id)=>{
            newItem.setDynamicProperty(id, item.getDynamicProperty(id))
        })
       // console.warn("Transformando")
        slot.setItem(newItem)
    }
}