import * as mc from "@minecraft/server";
import * as GMath from "./utils/GMath";
import * as EntityRun from "./utils/EntityRuntime";
import { queueTrinketEvent } from "./trinketManager";

const { world, system } = mc;

//Entities
class NewTrinkets extends EntityRun.EntityObject {
    /**@type {mc.Entity} */
    owner = undefined
    /**@type {mc.Entity} */
    entity = undefined;

    onCreate() {
        this.entity = this.getEntity();
        const entity = this.entity;
        const data = this.data
        data["owner"] = data["owner"] ?? ""
        data["id"] = data["id"] ?? entity.id
        this.owner = mc.world.getEntity(data["owner"])

        // Initialize placeholder items in empty slots
        const inventory = entity.getComponent("minecraft:inventory")
        if (inventory && inventory.container) {
            const container = inventory.container
            const containerSize = container.size

            for (let i = 0; i < containerSize; i++) {
                const slot = container.getSlot(i)
                const placeholderId = `mnra_cata:slot_placeholder_${i + 1}`;

                // Only add placeholder if slot is empty
                if (!slot.hasItem()) {
                    // Use different placeholder for each slot (1-5)
                    const placeholder = new mc.ItemStack(placeholderId, 1)
                    slot.setItem(placeholder)
                }

                // Initialize state tracking data
                // Store the item ID, which is either the real item or the placeholder
                const currentItem = slot.getItem();
                data[`slot_item_${i}`] = currentItem ? currentItem.typeId : placeholderId;
            }
        }
    }

    onTick() {
        const entity = this.getEntity()
        const data = this.data
        const owner = mc.world.getEntity(data["owner"])
        entity.nameTag = `entity.mnra_cata:trinkets_ent.name`
        if (owner) {
            this.owner = owner
            const ownerTrinketUse = owner.getDynamicProperty("current_trinkets")
            if (ownerTrinketUse != data["id"]) {
                // Player is no longer using this trinket, save and remove entity
                try {
                    let structure = mc.world.structureManager.get(`mnra_cata:trinkets_${data["id"]}`)
                    var entities = entity.dimension.getEntities({ location: owner.location, maxDistance: 3, excludeTypes: ["mnra_cata:trinkets_ent", "minecraft:player"] })
                    entities.forEach((ent) => {
                        ent.setDynamicProperty("mnra_cata:structure_saved", true)
                    })
                    if (structure) {
                        mc.world.structureManager.delete(`mnra_cata:trinkets_${data["id"]}`)
                        structure = mc.world.structureManager.createFromWorld(`mnra_cata:trinkets_${data["id"]}`, entity.dimension, entity.location, entity.location, { includeBlocks: false, includeEntities: true, saveMode: mc.StructureSaveMode.World })
                        structure.saveToWorld()
                    } else {
                        structure = mc.world.structureManager.createFromWorld(`mnra_cata:trinkets_${data["id"]}`, entity.dimension, entity.location, entity.location, { includeBlocks: false, includeEntities: true, saveMode: mc.StructureSaveMode.World })
                        structure.saveToWorld()
                    }
                    entities.forEach((ent) => {
                        ent.setDynamicProperty("mnra_cata:structure_saved", undefined)
                    })
                } catch (e) { }
                entity.remove()
            } else {
                // Player is still using this trinket, update position
                if (!owner.isSneaking) {
                    entity.teleport(new GMath.Vector3(0, -0.5, 0).add(owner.getHeadLocation()))
                    entity.triggerEvent("mnra_cata:active_collision")
                } else {
                    entity.teleport(new GMath.Vector3(0, 0, 0).add(owner.getHeadLocation()))
                    entity.triggerEvent("mnra_cata:desactive_collision")
                }

                // Maintain placeholder items and detect changes
                const inventory = entity.getComponent("minecraft:inventory");
                if (inventory && inventory.container) {
                    const container = inventory.container;
                    const containerSize = container.size;

                    const seenTrinketTypes = new Set();
                    for (let i = 0; i < containerSize; i++) {
                        const slot = container.getSlot(i);
                        const currentItem = slot.getItem();
                        const expectedPlaceholderId = `mnra_cata:slot_placeholder_${i + 1}`;
                        const requiredTag = `mnra_cata:trinkets_slot_${i + 1}`;
                        // Retrieve the type ID of the item from the previous tick
                        const lastItemTypeId = data[`slot_item_${i}`] || expectedPlaceholderId;

                        // If an item is present but does not have the proper slot tag, reject it immediately
                        if (currentItem && currentItem.typeId !== expectedPlaceholderId) {
                            const tags = currentItem.getTags?.() ?? [];
                            if (!tags.includes(requiredTag)) {
                                // Return item to player inventory/cursor by dropping it at their feet
                                if (owner) {
                                    owner.dimension.spawnItem(currentItem, owner.location);
                                }
                                // Restore placeholder
                                const placeholder = new mc.ItemStack(expectedPlaceholderId, 1);
                                slot.setItem(placeholder);
                                // Since the slot reverted to placeholder, queue deactivate if needed
                                if (lastItemTypeId !== expectedPlaceholderId && owner) {
                                    queueTrinketEvent({
                                        type: "deactivate",
                                        playerId: owner.id,
                                        trinketId: lastItemTypeId
                                    });
                                }
                                data[`slot_item_${i}`] = expectedPlaceholderId;
                                continue;
                            }

                            // Prevent duplicate trinket IDs across slots
                            if (seenTrinketTypes.has(currentItem.typeId)) {
                                if (owner) {
                                    owner.dimension.spawnItem(currentItem, owner.location);
                                    owner.sendMessage("§cVocê já está com esta bugiganga equipada.");
                                }
                                const placeholder = new mc.ItemStack(expectedPlaceholderId, 1);
                                slot.setItem(placeholder);
                                // deactivate previous record in this slot if needed
                                if (lastItemTypeId !== expectedPlaceholderId && owner) {
                                    queueTrinketEvent({
                                        type: "deactivate",
                                        playerId: owner.id,
                                        trinketId: lastItemTypeId
                                    });
                                }
                                data[`slot_item_${i}`] = expectedPlaceholderId;
                                continue;
                            }
                            seenTrinketTypes.add(currentItem.typeId);
                        }

                        // 1. Check if the slot is empty and restore the placeholder.
                        if (!currentItem) {
                            // If slot is empty, restore placeholder
                            const placeholder = new mc.ItemStack(expectedPlaceholderId, 1);
                            slot.setItem(placeholder);

                            // Detect if a real item was removed (item was present last tick, now it's gone)
                            if (lastItemTypeId !== expectedPlaceholderId) {
                                if (owner) {
                                    queueTrinketEvent({
                                        type: "deactivate",
                                        playerId: owner.id,
                                        trinketId: lastItemTypeId
                                    });
                                }
                            }
                            // Update tracking: The slot now contains the placeholder
                            data[`slot_item_${i}`] = expectedPlaceholderId;
                        }

                        // 2. Check if a real (non-placeholder) item is in the slot.
                        else if (currentItem.typeId !== expectedPlaceholderId) {
                            // If the previous tick's item was the placeholder, then a new item was placed.
                            if (lastItemTypeId === expectedPlaceholderId) {
                                if (owner) {
                                    owner.playSound('bundle.insert', { pitch: 1, location: owner.location, volume: 1 })
                                    queueTrinketEvent({
                                        type: "activate",
                                        playerId: owner.id,
                                        trinketId: currentItem.typeId
                                    });
                                }
                            }
                            // If a different item replaced another, deactivate old and activate new
                            else if (lastItemTypeId !== currentItem.typeId && lastItemTypeId !== expectedPlaceholderId) {
                                if (owner) {
                                    queueTrinketEvent({
                                        type: "deactivate",
                                        playerId: owner.id,
                                        trinketId: lastItemTypeId
                                    });
                                    queueTrinketEvent({
                                        type: "activate",
                                        playerId: owner.id,
                                        trinketId: currentItem.typeId
                                    });
                                }
                            }

                            // Update tracking: The slot now contains the real item's typeId
                            data[`slot_item_${i}`] = currentItem.typeId;
                        }

                        // 3. If the item IS the placeholder, ensure tracking data is correct
                        else {
                            data[`slot_item_${i}`] = expectedPlaceholderId;
                        }
                    }
                }
            }
        } else {
            // Owner doesn't exist, remove entity
            entity.remove()
        }
    }
}
class Player extends EntityRun.EntityObject {
    setCurrentTrinket(value = "") {
        const entity = this.getEntity()
        const normalized = value || ""
        this.data["current_trinkets"] = normalized
        /*if (entity) {
            if (normalized === "") {
                entity.setDynamicProperty(PLAYER_TRINKET_PROP, undefined)
            } else {
                entity.setDynamicProperty(PLAYER_TRINKET_PROP, normalized)
            }
        }*/
    }

    onUpdateHand() {
        /**
         * @type {mc.Player}
         */
        const entity = this.getEntity()
        const dimension = entity.dimension
        const data = this.data
        const handItem = this.getEquipament("Mainhand")
        // Remove placeholder from hand if somehow it got there
        if (handItem && handItem.hasItem() && handItem.getTags().includes("mnra_cata:placeholder_slot")) {
            handItem.setItem(undefined)
        }
        const items = this.getInventoryItems()
        const viewDirection = new GMath.Vector3(entity.getViewDirection()).normalize().round()
        const locationStart = entity.getHeadLocation()
        /**@type {mc.PlayerCursorInventoryComponent} */
        const cursor = entity.getComponent("cursor_inventory")
        if (cursor && cursor.item) {
            if (cursor.item.getTags().includes("mnra_cata:destroy_item")) {
                cursor.clear()
            }
            // Check if player clicked on a placeholder item from trinkets container
            else if (cursor.item.getTags().includes("mnra_cata:placeholder_slot")) {
                // Immediately clear the cursor to delete the placeholder
                cursor.clear()

                // Find the trinkets entity the player is using
                const trinketsId = data["current_trinkets"]
                if (trinketsId) {
                    const trinketsEntity = mc.world.getEntity(trinketsId)
                    if (trinketsEntity) {
                        const trinketsInventory = trinketsEntity.getComponent("minecraft:inventory")
                        if (trinketsInventory && trinketsInventory.container) {
                            const container = trinketsInventory.container
                            const containerSize = container.size

                            // Find empty slot and refresh placeholder
                            for (let i = 0; i < containerSize; i++) {
                                const slot = container.getSlot(i)
                                if (!slot.hasItem()) {
                                    // Refresh placeholder in this slot with correct ID (1-5)
                                    const placeholderId = `mnra_cata:slot_placeholder_${i + 1}`
                                    const placeholder = new mc.ItemStack(placeholderId, 1)
                                    slot.setItem(placeholder)
                                    break
                                }
                            }
                        }
                    }
                }
            }
        }
        items.forEach(slot => {
            if (slot.hasItem()) {
                if (slot.getTags().includes("mnra_cata:trinkets_bag") && slot.getDynamicProperty("trinkets_id")) {
                    const id = slot.getDynamicProperty("trinkets_id")
                    if (id != data["current_trinkets"]) {
                        slot.lockMode = mc.ItemLockMode.none
                        slot.setItem(slot.getItem())
                    }
                } else if (slot.getTags().includes("mnra_cata:destroy_item")) {
                    slot.setItem(undefined)
                }
                // Remove placeholder items from player inventory (prevent shift+click)
                else if (slot.getTags().includes("mnra_cata:placeholder_slot")) {
                    slot.setItem(undefined)
                }
            }

        })

        if (handItem && handItem.hasItem() && handItem.getTags().includes("mnra_cata:trinkets_bag")) {
            // Use a player-based bag id so all bags a player holds point to the same storage
            const playerBagId = `bag_${entity.id}`;

            // Ensure the hand item references the player's bag (so all bags in this player's inventory open the same storage).
            // Overwriting the dynamic property only affects the item in the player's hand right now (doesn't rewrite chest contents until player picks item up).
            const existingHandId = handItem.getDynamicProperty("trinkets_id");
            if (existingHandId !== playerBagId) {
                handItem.setDynamicProperty("trinkets_id", playerBagId);
                handItem.setItem(handItem.getItem());
            }

            // If player isn't already viewing a trinket UI, either place existing structure or spawn a trinket entity to create one.
            if (data["current_trinkets"] == "") {
                const trinketsData = mc.world.structureManager.get(`mnra_cata:trinkets_${playerBagId}`)
                if (trinketsData) {
                    handItem.lockMode = mc.ItemLockMode.slot
                    handItem.setItem(handItem.getItem())
                    mc.world.structureManager.place(trinketsData, dimension, locationStart, { includeBlocks: false, includeEntities: true })
                    this.setCurrentTrinket(playerBagId)
                } else {
                    // No saved structure for this player's bag yet; spawn the trinkets entity and bind it to the player's bag id
                    const trinkets = dimension.spawnEntity("mnra_cata:trinkets_ent", locationStart)
                    trinkets.setDynamicProperty("id", playerBagId)
                    this.setCurrentTrinket(playerBagId)
                    trinkets.setDynamicProperty("owner", entity.id)
                    trinkets.setDynamicProperty("original_item_type", handItem.typeId)
                    trinkets.setDynamicProperty("current_item_type", handItem.typeId)
                    trinkets.setDynamicProperty("max_pages", Number(handItem.getTags().find(e => e.startsWith("mnra_cata:trinkets_max_pages:")).replace("mnra_cata:trinkets_max_pages:", "")))
                    handItem.setDynamicProperty("owner", entity.id)
                    handItem.setDynamicProperty("trinkets_id", playerBagId)
                    handItem.lockMode = mc.ItemLockMode.slot
                    handItem.setItem(handItem.getItem())
                }
            } else {
                // If already open to another id, close that view
                if (data["current_trinkets"] != "" && data["current_trinkets"] != playerBagId) {
                    data["last_trinkets"] = data["current_trinkets"]
                    this.setCurrentTrinket("")
                }
            }
        } else {
            if (data["current_trinkets"] != "") {
                data["last_trinkets"] = data["current_trinkets"]
                this.setCurrentTrinket("")

            }
        }
    }

    onCreate() {
        const entity = this.getEntity()
        const data = this.data
        data["current_trinkets"] = data["current_trinkets"] || ""
        this.setCurrentTrinket(data["current_trinkets"])
        data["last_trinkets"] = data["last_trinkets"] || ""
        data["last_slot"] = 0
        data["loaded"] = data["loaded"] ?? false
        data["last_position"] = data["last_position"] || null
    }

    onItemUse(itemStack) {
        /**
         * @type {mc.Player}
         */
        const entity = this.getEntity()
        const dimension = entity.dimension
        const data = this.data
        const handItem = this.getEquipament("Mainhand")

        // Check if the used item is a trinket bag
        if (itemStack && itemStack.getTags().includes("mnra_cata:trinkets_bag")) {
            // Check if player is moving by comparing current position with last tick's position
            const currentPos = entity.location
            const lastPos = data["last_position"]

            // Check if player is moving using multiple methods
            let isMoving = false

            // Method 1: Check horizontal velocity (most reliable for walking/running)
            try {
                const velocity = entity.getVelocity()
                if (velocity) {
                    // Check horizontal speed (x and z components)
                    const horizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)
                    if (horizontalSpeed > 0.1) {
                        isMoving = true
                    }
                }
            } catch (e) {
                // Velocity check failed, try position comparison
            }

            // Method 2: Compare position with last tick (backup method)
            if (!isMoving && lastPos && typeof lastPos === "object" && lastPos.x !== undefined) {
                // Calculate horizontal distance moved since last tick
                const dx = currentPos.x - lastPos.x
                const dz = currentPos.z - lastPos.z
                const horizontalDistance = Math.sqrt(dx * dx + dz * dz)

                // If player moved more than 0.1 blocks horizontally, they're moving
                if (horizontalDistance > 0.1) {
                    isMoving = true
                }
            }

            if (isMoving) {
                entity.playSound("bundle.insert_fail")
                entity.onScreenDisplay.setActionBar("Fique parado para abrir o menu de bugigangas.")
                return // Prevent opening if moving
            }

            // player-based bag id (all bag items for this player reference the same id)
            const playerBagId = `bag_${entity.id}`;

            // Always map the used bag to the player's own bag ID so opening any bag always opens YOUR trinkets
            // If the item in-hand is a bag, set its dynamic property to the player's bag ID (keeps multiple bags synced for that player)
            try {
                itemStack.setDynamicProperty("trinkets_id", playerBagId)
            } catch (e) {
                // some contexts might not allow setting dynamic props on the passed itemStack; ignore safely
            }
            if (handItem && handItem.hasItem()) {
                const existingHandId = handItem.getDynamicProperty("trinkets_id");
                if (existingHandId !== playerBagId) {
                    handItem.setDynamicProperty("trinkets_id", playerBagId);
                    handItem.setItem(handItem.getItem());
                }
            }

            const locationStart = entity.getHeadLocation()

            // If player isn't already viewing their trinkets, either place existing structure or spawn entity
            if (data["current_trinkets"] == "") {
                const trinketsData = mc.world.structureManager.get(`mnra_cata:trinkets_${playerBagId}`)
                if (trinketsData) {
                    if (handItem && handItem.hasItem()) {
                        handItem.lockMode = mc.ItemLockMode.slot
                        handItem.setItem(handItem.getItem())
                    }
                    mc.world.structureManager.place(trinketsData, dimension, locationStart, { includeBlocks: false, includeEntities: true })
                    this.setCurrentTrinket(playerBagId)
                } else {
                    // No saved structure for this player's bag yet; spawn the trinkets entity and bind it to the player's bag id
                    const trinkets = dimension.spawnEntity("mnra_cata:trinkets_ent", locationStart)
                    trinkets.setDynamicProperty("id", playerBagId)
                    this.setCurrentTrinket(playerBagId)
                    trinkets.setDynamicProperty("owner", entity.id)
                    trinkets.setDynamicProperty("original_item_type", itemStack.typeId)
                    trinkets.setDynamicProperty("current_item_type", itemStack.typeId)
                    trinkets.setDynamicProperty("max_pages", Number(itemStack.getTags().find(e => e.startsWith("mnra_cata:trinkets_max_pages:")).replace("mnra_cata:trinkets_max_pages:", "")) || "1")
                    if (handItem && handItem.hasItem()) {
                        handItem.setDynamicProperty("owner", entity.id)
                        handItem.setDynamicProperty("trinkets_id", playerBagId)
                        handItem.lockMode = mc.ItemLockMode.slot
                        handItem.setItem(handItem.getItem())
                    }
                }
            }
        }
    }

    onTick() {
        // Track player position for movement detection
        const entity = this.getEntity()
        const data = this.data
        const currentPos = entity.location

        // Store current position as "last_position" for next tick comparison
        // Store as a simple object that will persist in dynamic properties
        if (!data["last_position"]) {
            // Initialize on first tick
            data["last_position"] = {
                x: currentPos.x,
                y: currentPos.y,
                z: currentPos.z
            }
        } else {
            // Update position every tick
            data["last_position"] = {
                x: currentPos.x,
                y: currentPos.y,
                z: currentPos.z
            }
        }

        this.onUpdateHand()
        if (this.data["loaded"] == false) {
            this.data["loaded"] = true
        }
    }

}
// Register entities
EntityRun.EntityRuntime.register("mnra_cata:trinkets_ent", NewTrinkets)
EntityRun.EntityRuntime.register("minecraft:player", Player)

mc.world.beforeEvents.playerInteractWithEntity.subscribe(data => {
    const target = data.target
    const player = data.player
    if (target.typeId == "mnra_cata:trinkets_ent" && target.getDynamicProperty("owner") != player.id) {
        data.cancel = true
    }
})
world.afterEvents.entityLoad.subscribe(data => {
    const entity = data.entity;
    if (!entity) return;

    try {
        if (entity.getDynamicPropertyIds()?.includes("mnra_cata:structure_saved")) {
            system.run(() => {
                try { entity.remove(); } catch { }
            });
            return;
        }
    } catch { }

    if (entity.typeId === "minecraft:item") {
        const itemComp = entity.getComponent("minecraft:item");
        if (!itemComp?.itemStack) return;

        if (itemComp.itemStack.getTags()?.includes("mnra_cata:destroy_item")) {
            system.run(() => {
                try { entity.remove(); } catch { }
            });
        }
    }
});

world.afterEvents.entitySpawn.subscribe(data => {
    const entity = data.entity;
    if (!entity) return;

    if (entity.typeId === "minecraft:item") {
        try {
            const itemComp = entity.getComponent("minecraft:item");
            if (!itemComp?.itemStack) return;

            if (itemComp.itemStack.getTags()?.includes("mnra_cata:destroy_item")) {
                system.run(() => {
                    try { entity.remove(); } catch { }
                });
            }
        } catch { }
    }
});