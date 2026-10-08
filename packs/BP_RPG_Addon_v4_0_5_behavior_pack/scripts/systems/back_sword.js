/**
 * =============================================================================
 * SWORD ON BACK SYSTEM
 * =============================================================================
 * Detects swords in the 4 vertical slots:
 * Supports both rightmost vertical column (Slots 17, 26, 35, 8) as shown in user's
 * setup, and leftmost vertical column (Slots 9, 18, 27, 0).
 *
 * Scans with strict priority from top toward down:
 * - Row 0 (Top):    Slot 17 (right) or Slot 9 (left)   -- Priority 1
 * - Row 1 (Middle): Slot 26 (right) or Slot 18 (left)  -- Priority 2
 * - Row 2 (Bottom): Slot 35 (right) or Slot 27 (left)  -- Priority 3
 * - Row 3 (Hotbar): Slot 8 (right) or Slot 0 (left)    -- Priority 4
 *
 * Supported Swords: Wooden, Stone, Iron, Golden, Diamond, Netherite.
 * Checks for enchantment glint via enchantable component.
 * Synchronizes to client via entity properties:
 * - rpg:back_sword: 0 (none), 1 (wood), 2 (stone), 3 (iron), 4 (gold), 5 (diamond), 6 (netherite)
 * - rpg:sword_enchanted: boolean
 */

import { world, system } from "@minecraft/server";

// Priority slots from top toward down (Right column first, then Left column)
export const VERTICAL_SLOT_PRIORITY = [
    // Top Row (Row 0)
    [17, 9],
    // Middle Row (Row 1)
    [26, 18],
    // Bottom Row of main inventory (Row 2)
    [35, 27],
    // Hotbar (Row 3)
    [8, 0]
];

// Map of sword type IDs to integer IDs
export const SWORD_IDS = {
    "minecraft:wooden_sword": 1,
    "wooden_sword": 1,
    "minecraft:stone_sword": 2,
    "stone_sword": 2,
    "minecraft:iron_sword": 3,
    "iron_sword": 3,
    "minecraft:golden_sword": 4,
    "golden_sword": 4,
    "minecraft:gold_sword": 4,
    "gold_sword": 4,
    "minecraft:diamond_sword": 5,
    "diamond_sword": 5,
    "minecraft:netherite_sword": 6,
    "netherite_sword": 6,
    "test:vibranium_sword": 6,
    "rpg:vibranium_sword": 6,
    "vibranium_sword": 6,
    "test:sword_1": 3,
    "rpg:sword_1": 3,
    "sword_1": 3
};

/**
 * Scan a player's vertical slots and determine which sword to display.
 * @param {Player} player
 */
function updatePlayerBackSword(player) {
    if (!player || !player.isValid()) return;

    const inv = player.getComponent("minecraft:inventory")?.container;
    if (!inv) return;

    let targetSwordId = 0;
    let isEnchanted = false;

    // Check row by row from top toward down
    for (const rowSlots of VERTICAL_SLOT_PRIORITY) {
        let foundInRow = false;
        for (const slotIndex of rowSlots) {
            const item = inv.getItem(slotIndex);
            if (item && item.typeId && SWORD_IDS[item.typeId]) {
                targetSwordId = SWORD_IDS[item.typeId];

                // Check if enchanted across all API variants
                try {
                    const enchantable = item.getComponent("minecraft:enchantable") || item.getComponent("enchantable");
                    if (enchantable && typeof enchantable.getEnchantments === "function") {
                        const enchants = enchantable.getEnchantments();
                        if (Array.isArray(enchants) && enchants.length > 0) {
                            isEnchanted = true;
                        }
                    } else {
                        const legacy = item.getComponent("enchantments");
                        if (legacy?.enchantments && (legacy.enchantments.slot > 0 || (legacy.enchantments._list && legacy.enchantments._list.length > 0))) {
                            isEnchanted = true;
                        }
                    }
                } catch (e) {}

                foundInRow = true;
                break;
            }
        }

        // If a sword was found in this row, take it (top row has higher priority)
        if (foundInRow) {
            break;
        }
    }

    // Update entity properties only when changed
    try {
        const currentSword = player.getProperty("rpg:back_sword") ?? 0;
        const currentEnch = player.getProperty("rpg:sword_enchanted") ?? false;

        if (currentSword !== targetSwordId) {
            player.setProperty("rpg:back_sword", targetSwordId);
        }
        if (currentEnch !== isEnchanted) {
            player.setProperty("rpg:sword_enchanted", isEnchanted);
        }
    } catch (err) {
        // Player properties may not be ready on very first join tick
    }
}

/**
 * Initialize the Sword on Back detection loop.
 */
export function initBackSwordSystem() {
    system.runInterval(() => {
        for (const player of world.getPlayers()) {
            updatePlayerBackSword(player);
        }
    }, 4);

    console.warn("[RPG System] Sword on Back System initialized (Vertical slots 4 rows priority).");
}
