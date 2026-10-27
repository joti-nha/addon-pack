import { EntityComponentTypes, EquipmentSlot, world, GameMode, TicksPerSecond, ItemStack, Player, ItemComponentTypes, EnchantmentType, WeatherType, system, BlockComponentTypes, MolangVariableMap, BlockPermutation, EntityDamageCause, LiquidType, ScriptEventSource, MemoryTier, Difficulty, EntityInitializationCause, Direction } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';

var DynamicPropertyEnum;
(function (DynamicPropertyEnum) {
    DynamicPropertyEnum["HasCast"] = "HasCast";
    DynamicPropertyEnum["HasCastHarpoon"] = "HasCastHarpoon";
    DynamicPropertyEnum["BobberID"] = "BobberID";
    DynamicPropertyEnum["HarpoonID"] = "HarpoonID";
    DynamicPropertyEnum["HarpoonPlayerID"] = "HarpoonPlayerID";
    DynamicPropertyEnum["HasCaught"] = "HasCaught";
    DynamicPropertyEnum["BaitMultiplier"] = "BaitMultiplier";
    DynamicPropertyEnum["Hook"] = "Hook";
    DynamicPropertyEnum["BiteParticle"] = "BiteParticle";
    DynamicPropertyEnum["BiteStart"] = "BiteStart";
    DynamicPropertyEnum["BaitType"] = "BaitType";
    DynamicPropertyEnum["NetTickCounter"] = "NetTickCounter";
    DynamicPropertyEnum["HarpoonedEntity"] = "HarpoonedFish";
    DynamicPropertyEnum["FishUILink"] = "FishUILink";
    DynamicPropertyEnum["StaticFishTypeId"] = "StaticFishTypeId";
    DynamicPropertyEnum["FishWeight"] = "FishWeight";
    DynamicPropertyEnum["HasFlippers"] = "HasFlippers";
    DynamicPropertyEnum["WaterBreathingCounter"] = "WaterBreathingCounter";
    DynamicPropertyEnum["SnorkelReset"] = "SnorkelReset";
    DynamicPropertyEnum["NeptuniumBreathingReset"] = "NeptuniumBreathingReset";
    DynamicPropertyEnum["ModBlock"] = "ModBlock";
    DynamicPropertyEnum["Bobber"] = "Bobber";
    DynamicPropertyEnum["Colour"] = "Colour";
    DynamicPropertyEnum["FishScale"] = "FishScale";
    DynamicPropertyEnum["HasBook"] = "HasBook";
})(DynamicPropertyEnum || (DynamicPropertyEnum = {}));

/**
 * Utility class for vector operations on 3D vectors.
 */
class VectorUtils {
    /**
     * Adds two 3D vectors.
     *
     * @param {Vector3} firstVector3 - The first vector with x, y, and z components.
     * @param {Partial<Vector3>} [secondVector3={}] - The second vector with optional x, y, and z components.
     * @returns {Vector3} A new vector which is the sum of the two input vectors.
     */
    static add(firstVector3, secondVector3 = {}) {
        return {
            x: firstVector3.x + (secondVector3.x ?? 0),
            y: firstVector3.y + (secondVector3.y ?? 0),
            z: firstVector3.z + (secondVector3.z ?? 0)
        };
    }
    static multiply(vector3, secondVector3 = {}) {
        return {
            x: vector3.x * (secondVector3.x ?? 1),
            y: vector3.y * (secondVector3.y ?? 1),
            z: vector3.z * (secondVector3.z ?? 1)
        };
    }
    /**
     * Subtracts the second 3D vector from the first 3D vector.
     *
     * @param {Vector3} firstVector3 - The vector to be subtracted from, with x, y, and z components.
     * @param {Partial<Vector3>} [secondVector3={}] - The vector to subtract, with optional x, y, and z components.
     * @returns {Vector3} A new vector which is the difference of the two input vectors.
     */
    static subtract(firstVector3, secondVector3 = {}) {
        return {
            x: firstVector3.x - (secondVector3.x ?? 0),
            y: firstVector3.y - (secondVector3.y ?? 0),
            z: firstVector3.z - (secondVector3.z ?? 0)
        };
    }
    /**
     * Floors the components of a 3D vector.
     *
     * @param {Vector3} vector3 - The vector with x, y, and z components.
     * @returns {Vector3} A new vector with each component floored to the nearest integer.
     */
    static floor(vector3) {
        return {
            x: Math.floor(vector3.x),
            y: Math.floor(vector3.y),
            z: Math.floor(vector3.z)
        };
    }
    /**
     * Rounds the components of a 3D vector.
     *
     * @param {Vector3} vector3 - The vector with x, y, and z components.
     * @returns {Vector3} A new vector with each component rounded to the nearest integer.
     */
    static round(vector3) {
        return {
            x: Math.round(vector3.x),
            y: Math.round(vector3.y),
            z: Math.round(vector3.z)
        };
    }
    static round2Decimal(vector3) {
        return {
            x: Math.round(vector3.x * 100) / 100,
            y: Math.round(vector3.y * 100) / 100,
            z: Math.round(vector3.z * 100) / 100
        };
    }
    /**
     * Clamps the components of a 3D vector within the given bounds.
     *
     * @param {Vector3} vector3 - The vector to clamp, with x, y, and z components.
     * @param {Partial<Vector3>} [min={}] - The minimum bounds with optional x, y, and z components.
     * @param {Partial<Vector3>} [max={}] - The maximum bounds with optional x, y, and z components.
     * @returns {Vector3} A new vector with each component clamped within the specified bounds.
     */
    static clamp(vector3, min = {}, max = {}) {
        return {
            x: Math.max(min.x ?? 0, Math.min(max.x ?? 1, vector3.x)),
            y: Math.max(min.y ?? 0, Math.min(max.y ?? 1, vector3.y)),
            z: Math.max(min.z ?? 0, Math.min(max.z ?? 1, vector3.z))
        };
    }
    /**
     * Computes the absolute difference between two 3D vectors.
     *
     * @param {Vector3} firstVector3 - The first vector with x, y, and z components.
     * @param {Vector3} secondVector3 - The second vector with x, y, and z components.
     * @returns {Vector3} A new vector representing the absolute difference between the two input vectors.
     */
    static difference(firstVector3, secondVector3) {
        return {
            x: Math.abs(firstVector3.x - secondVector3.x),
            y: Math.abs(firstVector3.y - secondVector3.y),
            z: Math.abs(firstVector3.z - secondVector3.z)
        };
    }
    /**
     * Checks if two 3D vectors are equal.
     * @param firstVector3 firstVector3 to compare
     * @param secondVector3 secondVector3 to compare
     * @returns true if the vectors are equal, false otherwise
     */
    static equals(firstVector3, secondVector3) {
        return firstVector3.x === secondVector3.x && firstVector3.y === secondVector3.y && firstVector3.z === secondVector3.z;
    }
    /**
     * Checks if two 2D vectors are equal.
     * @param firstVector2 firstVector2 to compare
     * @param secondVector2 secondVector2 to compare
     * @returns true if the vectors are equal, false otherwise
     */
    static equals2(firstVector2, secondVector2) {
        return firstVector2.x === secondVector2.x && firstVector2.y === secondVector2.y;
    }
    /**
     * Converts a 3D vector to a string.
     * @param vector3 vector3 to convert
     * @returns string representation of the vector3
     */
    static toString(vector3) {
        return `x:${vector3.x}, y:${vector3.y}, z:${vector3.z}`;
    }
    /**
     * Converts a 3D vector to a condensed string.
     * @param vector3
     * @returns string representation of the vector3
     */
    static toCondensedString(vector3) {
        return `${vector3.x}:${vector3.y}:${vector3.z}`;
    }
    /**
     * Converts a condensed 3D vector string to a 3D vector.
     * @param string string to convert
     * @returns 3D vector from the string
     */
    static fromCondensedString(condensedString) {
        const split = condensedString.split(":");
        return { x: parseFloat(split[0]), y: parseFloat(split[1]), z: parseFloat(split[2]) };
    }
    /**
     * Converts a 2D vector to a 3D vector. Used for storing 2D vectors in dynamic properties.
     * @param vector2 vector2 to convert
     * @returns 3D vector with x and z components from the 2D vector
     */
    static toVector3(vector2) {
        return { x: vector2.x, y: 0, z: vector2.y };
    }
    /**
     * Converts a 3D vector to a 2D vector. Used from retrieving 2D vectors from dynamic properties.
     * @param vector3 vector3 to convert
     * @returns 2D vector with x and z components from the 3D vector
     */
    static toVector2(vector3) {
        return { x: vector3.x, y: vector3.z };
    }
    static distance(vector1, vector2) {
        const deltaX = vector2.x - vector1.x;
        const deltaY = vector2.y - vector1.y;
        const deltaZ = vector2.z - vector1.z;
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);
        return distance;
    }
}

class PlayerUtils {
    static getMainHandItem(player) {
        const equipment = player.getComponent(EntityComponentTypes.Equippable);
        if (!equipment)
            return;
        return equipment.getEquipment(EquipmentSlot.Mainhand);
    }
    static setMainHandItem(player, item) {
        const equipment = player.getComponent(EntityComponentTypes.Equippable);
        if (!equipment)
            return;
        equipment.setEquipment(EquipmentSlot.Mainhand, item);
    }
    static reduceMainHandItem(player, amount) {
        const item = this.getMainHandItem(player);
        if (!item)
            return;
        const newAmount = item.amount - amount;
        if (newAmount <= 0) {
            this.setMainHandItem(player, undefined);
        }
        else {
            item.amount = newAmount;
            this.setMainHandItem(player, item);
        }
    }
}

const snorkelTime = 30 * TicksPerSecond;
class CustomItemsManager {
    static runFlippers() {
        const players = world.getPlayers().filter(player => player.isInWater);
        for (const player of players) {
            if (!player.isInWater)
                continue;
            const equippable = player.getComponent(EntityComponentTypes.Equippable);
            if (!equippable)
                continue;
            const item = equippable.getEquipment(EquipmentSlot.Feet);
            const hasFlippers = player.getDynamicProperty(DynamicPropertyEnum.HasFlippers) || false;
            const waterMovement = player.getComponent(EntityComponentTypes.UnderwaterMovement);
            if (!waterMovement)
                continue;
            let movementSpeed = waterMovement.defaultValue;
            if (!item || item.typeId !== "tm_aqc:flippers" || !player.isSwimming) {
                if (hasFlippers)
                    player.setDynamicProperty(DynamicPropertyEnum.HasFlippers, false);
                waterMovement.setCurrentValue(movementSpeed);
                continue;
            }
            if (!player.isSwimming && !player.isSprinting)
                return;
            if (!hasFlippers)
                waterMovement.setCurrentValue(movementSpeed + 0.075);
            player.dimension.spawnParticle("minecraft:cauldron_bubble_particle", player.location);
        }
    }
    static runSnorkel() {
        const players = world.getPlayers().filter(player => player.isInWater);
        for (const player of players) {
            if (!player.isInWater)
                continue;
            const reset = player.getDynamicProperty(DynamicPropertyEnum.SnorkelReset) || false;
            const blockAbove = player.dimension.getBlock(VectorUtils.add(player.location, { x: 0, y: 1, z: 0 }));
            if (blockAbove !== undefined && blockAbove.isAir) {
                player.setDynamicProperty(DynamicPropertyEnum.SnorkelReset, true);
                player.removeEffect("minecraft:water_breathing");
                continue;
            }
            if (!reset)
                continue;
            const equippable = player.getComponent(EntityComponentTypes.Equippable);
            if (!equippable)
                continue;
            const item = equippable.getEquipment(EquipmentSlot.Head);
            if (!item || item.typeId !== "tm_aqc:snorkel")
                continue;
            const head = equippable.getEquipment(EquipmentSlot.Head);
            const chest = equippable.getEquipment(EquipmentSlot.Chest);
            const legs = equippable.getEquipment(EquipmentSlot.Legs);
            const feet = equippable.getEquipment(EquipmentSlot.Feet);
            const equipment = [head, chest, legs, feet];
            let hasNeptunium = false;
            for (const eq of equipment) {
                if (!eq)
                    continue;
                if (eq.hasTag("tm_aqc:neptunium_armor")) {
                    hasNeptunium = true;
                    break;
                }
            }
            if (hasNeptunium)
                continue;
            player.addEffect("minecraft:water_breathing", snorkelTime, { showParticles: false });
            player.setDynamicProperty(DynamicPropertyEnum.SnorkelReset, false);
        }
    }
    static runNeptuniumHaste() {
        const players = world.getPlayers().filter(player => player.isInWater);
        for (const player of players) {
            if (player.getGameMode() === GameMode.Creative)
                continue;
            if (!player.isInWater)
                continue;
            const mainHand = PlayerUtils.getMainHandItem(player);
            if (!mainHand)
                continue;
            if (!mainHand.hasTag("tm_aqc:neptunium_haste"))
                continue;
            player.addEffect("minecraft:haste", 10, { amplifier: 1, showParticles: false });
        }
    }
    static runNeptuniumWaterBreathing() {
        const players = world.getPlayers().filter(player => player.isInWater);
        for (const player of players) {
            if (!player.isInWater)
                continue;
            const reset = player.getDynamicProperty(DynamicPropertyEnum.NeptuniumBreathingReset) || false;
            const blockAbove = player.dimension.getBlock(VectorUtils.add(player.location, { x: 0, y: 1, z: 0 }));
            if (blockAbove !== undefined && blockAbove.isAir) {
                player.setDynamicProperty(DynamicPropertyEnum.NeptuniumBreathingReset, true);
                player.removeEffect("minecraft:water_breathing");
                continue;
            }
            if (!reset)
                continue;
            const equippable = player.getComponent(EntityComponentTypes.Equippable);
            if (!equippable)
                continue;
            const head = equippable.getEquipment(EquipmentSlot.Head);
            const chest = equippable.getEquipment(EquipmentSlot.Chest);
            const legs = equippable.getEquipment(EquipmentSlot.Legs);
            const feet = equippable.getEquipment(EquipmentSlot.Feet);
            const equipment = [head, chest, legs, feet];
            let time = 0;
            for (const eq of equipment) {
                if (!eq)
                    continue;
                if (eq.hasTag("tm_aqc:neptunium_armor")) {
                    time += 30;
                }
            }
            if (time === 0)
                continue;
            player.addEffect("minecraft:water_breathing", time * TicksPerSecond, { showParticles: false });
            player.setDynamicProperty(DynamicPropertyEnum.NeptuniumBreathingReset, false);
        }
    }
}

var ActorPropertiesEnum;
(function (ActorPropertiesEnum) {
    ActorPropertiesEnum["LureCooldown"] = "tm_aqc:lure_cooldown";
    ActorPropertiesEnum["Bite"] = "tm_aqc:bite";
    ActorPropertiesEnum["Hook"] = "tm_aqc:hook";
    ActorPropertiesEnum["Difficulty"] = "tm_aqc:difficulty";
    ActorPropertiesEnum["Rot"] = "tm_aqc:rot";
    ActorPropertiesEnum["Bobber"] = "tm_aqc:bobber";
    ActorPropertiesEnum["Rod"] = "tm_aqc:rod";
    ActorPropertiesEnum["Colour"] = "tm_aqc:colour";
    ActorPropertiesEnum["Glow"] = "tm_aqc:glow";
    ActorPropertiesEnum["Type"] = "tm_aqc:type";
    ActorPropertiesEnum["Model"] = "tm_aqc:model";
    ActorPropertiesEnum["Caught"] = "tm_aqc:caught";
    ActorPropertiesEnum["Pearl"] = "tm_aqc:pearl";
    ActorPropertiesEnum["ClamState"] = "tm_aqc:clam_state";
    ActorPropertiesEnum["WET"] = "tm_aqc:wet";
    ActorPropertiesEnum["DRY"] = "tm_aqc:dry";
    ActorPropertiesEnum["HOT"] = "tm_aqc:hot";
    ActorPropertiesEnum["COLD"] = "tm_aqc:cold";
    ActorPropertiesEnum["OCEAN"] = "tm_aqc:ocean";
    ActorPropertiesEnum["RIVER"] = "tm_aqc:river";
    ActorPropertiesEnum["BEACH"] = "tm_aqc:beach";
    ActorPropertiesEnum["MOOSHROOM"] = "tm_aqc:mooshroom";
    ActorPropertiesEnum["CHERRY_BLOSSOM"] = "tm_aqc:cherry_blossom";
    ActorPropertiesEnum["MANGROVE"] = "tm_aqc:mangrove";
    ActorPropertiesEnum["PALE_GARDEN"] = "tm_aqc:pale_garden";
    ActorPropertiesEnum["JUNGLE"] = "tm_aqc:jungle";
})(ActorPropertiesEnum || (ActorPropertiesEnum = {}));

var DebugModeEnum;
(function (DebugModeEnum) {
    DebugModeEnum["None"] = "None";
    DebugModeEnum["RodCooldown"] = "RodCooldown";
    DebugModeEnum["CatchChance"] = "CatchChance";
    DebugModeEnum["BiomeChecker"] = "BiomeChecker";
    DebugModeEnum["DifficultyChecker"] = "DifficultyChecker";
    DebugModeEnum["FishUI"] = "FishUI";
})(DebugModeEnum || (DebugModeEnum = {}));
class DebugUtils {
    static DebugMode = new Map();
    static sendDebugMessage(message) {
        world.sendMessage(`§c[Debug]§f:§r ${message}`);
    }
    static isDebugMode(debugMode) {
        return this.DebugMode.get(debugMode) ?? false;
    }
    static setDebugModeFromString(debugMode) {
        switch (debugMode.toLowerCase()) {
            case "rodcooldown":
                this.DebugMode.set(DebugModeEnum.RodCooldown, !this.DebugMode.get(DebugModeEnum.RodCooldown));
                return true;
            case "catchchance":
                this.DebugMode.set(DebugModeEnum.CatchChance, !this.DebugMode.get(DebugModeEnum.CatchChance));
                return true;
            case "biomechecker":
                this.DebugMode.set(DebugModeEnum.BiomeChecker, !this.DebugMode.get(DebugModeEnum.BiomeChecker));
                return true;
            case "difficultychecker":
                this.DebugMode.set(DebugModeEnum.DifficultyChecker, !this.DebugMode.get(DebugModeEnum.DifficultyChecker));
                return true;
            case "fishui":
                this.DebugMode.set(DebugModeEnum.FishUI, !this.DebugMode.get(DebugModeEnum.FishUI));
                return true;
            case "all":
                for (const mode of Object.values(DebugModeEnum)) {
                    this.DebugMode.set(mode, true);
                }
                return true;
            case "none":
                for (const mode of Object.values(DebugModeEnum)) {
                    this.DebugMode.set(mode, false);
                }
                return true;
        }
        return false;
    }
    static setDebugMode(debugMode) {
        this.DebugMode.set(debugMode, true);
    }
}

var BiomeGroup;
(function (BiomeGroup) {
    BiomeGroup[BiomeGroup["Wet"] = 0] = "Wet";
    BiomeGroup[BiomeGroup["Dry"] = 1] = "Dry";
    BiomeGroup[BiomeGroup["Hot"] = 2] = "Hot";
    BiomeGroup[BiomeGroup["Cold"] = 3] = "Cold";
    BiomeGroup[BiomeGroup["Ocean"] = 4] = "Ocean";
    BiomeGroup[BiomeGroup["River"] = 5] = "River";
    BiomeGroup[BiomeGroup["Beach"] = 6] = "Beach";
    BiomeGroup[BiomeGroup["Mooshroom"] = 7] = "Mooshroom";
    BiomeGroup[BiomeGroup["CherryBlossom"] = 8] = "CherryBlossom";
    BiomeGroup[BiomeGroup["Mangrove"] = 9] = "Mangrove";
    BiomeGroup[BiomeGroup["PaleGarden"] = 10] = "PaleGarden";
    BiomeGroup[BiomeGroup["Nether"] = 11] = "Nether";
    BiomeGroup[BiomeGroup["TheEnd"] = 12] = "TheEnd";
    BiomeGroup[BiomeGroup["Jungle"] = 13] = "Jungle";
})(BiomeGroup || (BiomeGroup = {}));
const DEFAULT_BIOME_GROUPS = {
    Wet: false,
    Dry: false,
    Hot: false,
    Cold: false,
    Ocean: false,
    River: false,
    Beach: false,
    Mooshroom: false,
    CherryBlossom: false,
    Mangrove: false,
    PaleGarden: false,
    Nether: false,
    TheEnd: false,
    Jungle: false
};
class BiomeChecker {
    static checkBiomeGroups(biomeGroups, groups) {
        for (const group of biomeGroups) {
            const value = groups[BiomeGroup[group.biomeGroup]];
            if (group.operation === "==") {
                if (!value) {
                    return false;
                }
            }
            else if (group.operation === "!=") {
                if (value) {
                    return false;
                }
            }
        }
        return true;
    }
    static getBiomeGroups(location, dimension) {
        const entity = dimension.spawnEntity("tm_aqc:biome_checker", location);
        if (dimension.id === "minecraft:nether") {
            return {
                ...DEFAULT_BIOME_GROUPS,
                Nether: true
            };
        }
        if (dimension.id === "minecraft:the_end") {
            return {
                ...DEFAULT_BIOME_GROUPS,
                TheEnd: true
            };
        }
        const biomeTags = {
            Wet: entity.getProperty(ActorPropertiesEnum.WET) ?? false,
            Dry: entity.getProperty(ActorPropertiesEnum.DRY) ?? false,
            Hot: entity.getProperty(ActorPropertiesEnum.HOT) ?? false,
            Cold: entity.getProperty(ActorPropertiesEnum.COLD) ?? false,
            Ocean: entity.getProperty(ActorPropertiesEnum.OCEAN) ?? false,
            River: entity.getProperty(ActorPropertiesEnum.RIVER) ?? false,
            Beach: entity.getProperty(ActorPropertiesEnum.BEACH) ?? false,
            Mooshroom: entity.getProperty(ActorPropertiesEnum.MOOSHROOM) ?? false,
            CherryBlossom: entity.getProperty(ActorPropertiesEnum.CHERRY_BLOSSOM) ?? false,
            Mangrove: entity.getProperty(ActorPropertiesEnum.MANGROVE) ?? false,
            PaleGarden: entity.getProperty(ActorPropertiesEnum.PALE_GARDEN) ?? false,
            Nether: false,
            TheEnd: false,
            Jungle: entity.getProperty(ActorPropertiesEnum.JUNGLE) ?? false,
        };
        if (DebugUtils.isDebugMode(DebugModeEnum.BiomeChecker))
            DebugUtils.sendDebugMessage(`Biome groups: ${JSON.stringify(biomeTags)}`);
        entity.remove();
        return biomeTags;
    }
}

var SoundEnums;
(function (SoundEnums) {
    SoundEnums["EmptyFishBucket"] = "bucket.empty_fish";
    SoundEnums["ItemBreak"] = "random.break";
    SoundEnums["Splash"] = "random.splash";
    SoundEnums["PlaceFish"] = "use.slime";
    SoundEnums["FilletFish"] = "use.honey_block";
    SoundEnums["FishBones"] = "mob.skeleton.hurt";
    SoundEnums["NoteHook"] = "note.pling";
    SoundEnums["Sonar"] = "tm.aqc.sonar";
    SoundEnums["Pop"] = "random.pop2";
    SoundEnums["ModStationPlace"] = "mob.armor_stand.place";
    SoundEnums["FillCauldron"] = "cauldron.fillwater";
    SoundEnums["TakeStew"] = "cauldron.takepotion";
    SoundEnums["StewFinish"] = "random.fizz";
    SoundEnums["StewCooking"] = "bubble.pop";
    SoundEnums["StewPotLid"] = "block.grindstone.use";
    SoundEnums["GlassBreak"] = "random.glass";
    SoundEnums["UnlockFish"] = "random.levelup";
    SoundEnums["Scanner"] = "beacon.activate";
    SoundEnums["ChestOpen"] = "random.chestopen";
    SoundEnums["HarpoonCast"] = "crossbow.shoot";
    SoundEnums["BreakShell"] = "mob.creaking.unfreeze";
})(SoundEnums || (SoundEnums = {}));

const CUTTING_BOARD_PRESETS = {
    // Main Presets
    FISH_FILLET: {
        typeID: "tm_aqc:raw_fillet",
        sound: SoundEnums.FilletFish,
    },
    SHRIMP: {
        typeID: "tm_aqc:raw_shrimp",
        sound: SoundEnums.FilletFish,
    },
    CRAYFISH: {
        typeID: "tm_aqc:raw_crayfish",
        sound: SoundEnums.FilletFish,
    },
    CLAM: {
        typeID: "tm_aqc:raw_clam",
        sound: SoundEnums.FilletFish,
    },
    LOBSTER: {
        typeID: "tm_aqc:raw_lobster",
        sound: SoundEnums.FilletFish,
    },
    // Skeleton Presets
    FISH_BONES: {
        typeID: "tm_aqc:pin_bone",
        sound: SoundEnums.FishBones,
        bonus: {
            typeID: "tm_aqc:scale",
            chance: 25,
        },
    },
    SHELL_PIECE: {
        typeID: "tm_aqc:shell_piece",
        sound: SoundEnums.BreakShell,
    }
};

var FishSkeleton;
(function (FishSkeleton) {
    FishSkeleton[FishSkeleton["TINY"] = 1] = "TINY";
    FishSkeleton[FishSkeleton["SMALL"] = 2] = "SMALL";
    FishSkeleton[FishSkeleton["MEDIUM"] = 3] = "MEDIUM";
    FishSkeleton[FishSkeleton["LARGE"] = 4] = "LARGE";
    FishSkeleton[FishSkeleton["LONGNOSE"] = 5] = "LONGNOSE";
    FishSkeleton[FishSkeleton["CAT"] = 6] = "CAT";
    FishSkeleton[FishSkeleton["FLAT"] = 7] = "FLAT";
    FishSkeleton[FishSkeleton["SHRIMP"] = 8] = "SHRIMP";
    FishSkeleton[FishSkeleton["CLAM"] = 9] = "CLAM";
})(FishSkeleton || (FishSkeleton = {}));
const CuttingBoardSkeletonPresets = {
    [FishSkeleton.TINY]: CUTTING_BOARD_PRESETS.FISH_BONES,
    [FishSkeleton.SMALL]: CUTTING_BOARD_PRESETS.FISH_BONES,
    [FishSkeleton.MEDIUM]: CUTTING_BOARD_PRESETS.FISH_BONES,
    [FishSkeleton.LARGE]: CUTTING_BOARD_PRESETS.FISH_BONES,
    [FishSkeleton.LONGNOSE]: CUTTING_BOARD_PRESETS.FISH_BONES,
    [FishSkeleton.CAT]: CUTTING_BOARD_PRESETS.FISH_BONES,
    [FishSkeleton.FLAT]: CUTTING_BOARD_PRESETS.FISH_BONES,
    [FishSkeleton.SHRIMP]: CUTTING_BOARD_PRESETS.SHELL_PIECE,
    [FishSkeleton.CLAM]: CUTTING_BOARD_PRESETS.SHELL_PIECE,
};
var SpawnCatchType;
(function (SpawnCatchType) {
    SpawnCatchType["None"] = "none";
    SpawnCatchType["Rod"] = "rod";
    SpawnCatchType["Pot"] = "pot";
})(SpawnCatchType || (SpawnCatchType = {}));
var SpawnArea;
(function (SpawnArea) {
    SpawnArea["All"] = "all";
    SpawnArea["TopThird"] = "topThird";
    SpawnArea["MiddleThird"] = "middleThird";
    SpawnArea["BottomThird"] = "bottomThird";
})(SpawnArea || (SpawnArea = {}));
const ALL_FISH_DATA = {
    "tm_aqc:arapaima": {
        id: [1, 1],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.LONGNOSE,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 220 },
        spawnArea: SpawnArea.TopThird,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Wet, operation: "==" },
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "==" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" },
            { biomeGroup: BiomeGroup.Beach, operation: "!=" }
        ],
    },
    "tm_aqc:atlantic_cod": {
        id: [1, 2],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.MEDIUM,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 110 },
        spawnArea: SpawnArea.MiddleThird,
        spawnCount: { min: 2, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Cold, operation: "==" },
            { biomeGroup: BiomeGroup.Ocean, operation: "==" }
        ],
    },
    "tm_aqc:atlantic_herring": {
        id: [1, 3],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.SMALL,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 2.4 },
        spawnArea: SpawnArea.MiddleThird,
        spawnCount: { min: 3, max: 5 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Cold, operation: "==" },
            { biomeGroup: BiomeGroup.Ocean, operation: "==" }
        ],
    },
    "tm_aqc:bayad": {
        id: [1, 4],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.CAT,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 220 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "==" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:sacramento_blackfish": {
        id: [1, 5],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.MEDIUM,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 28 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Cold, operation: "==" },
            { biomeGroup: BiomeGroup.Ocean, operation: "==" }
        ],
    },
    "tm_aqc:bluegill": {
        id: [1, 6],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.SMALL,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 4.8 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:nile_tilapia": {
        id: [1, 7],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.SMALL,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 13 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:brown_shrooma": {
        id: [1, 8],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.SMALL,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 5.2 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 2, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Mooshroom, operation: "==" }
        ],
    },
    "tm_aqc:brown_trout": {
        id: [1, 9],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.MEDIUM,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 47 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 2, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" }
        ],
    },
    "tm_aqc:nile_perch": {
        id: [1, 10],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.MEDIUM,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 440 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 2, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "==" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:common_carp": {
        id: [1, 11],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.LARGE,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 105 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:blue_catfish": {
        id: [1, 12],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.CAT,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 143 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:florida_gar": {
        id: [1, 13],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.LONGNOSE,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 7 },
        spawnArea: SpawnArea.TopThird,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:goldfish": {
        id: [1, 14],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.TINY,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 5,
        realWeight: { min: 1, max: 67 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 1, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:largemouth_bass": {
        id: [1, 15],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.MEDIUM,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 22 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:muskellunge": {
        id: [2, 0],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.LONGNOSE,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 70 },
        spawnArea: SpawnArea.TopThird,
        spawnCount: { min: 1, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:yellow_perch": {
        id: [2, 1],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.SMALL,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 4.3 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 2, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:pink_salmon": {
        id: [2, 2],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.MEDIUM,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 15 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:black_piranha": {
        id: [2, 3],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.SMALL,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 45,
        realWeight: { min: 1, max: 12 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 2, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:american_pollock": {
        id: [2, 4],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.MEDIUM,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 71 },
        spawnArea: SpawnArea.MiddleThird,
        spawnCount: { min: 2, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "==" }
        ],
    },
    "tm_aqc:rainbow_trout": {
        id: [2, 5],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.MEDIUM,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 48 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 2, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:red_grouper": {
        id: [2, 6],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.MEDIUM,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 51 },
        spawnArea: SpawnArea.MiddleThird,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "==" }
        ],
    },
    "tm_aqc:red_shrooma": {
        id: [2, 7],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.SMALL,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 5.2 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 1, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Mooshroom, operation: "==" }
        ],
    },
    "tm_aqc:smallmouth_bass": {
        id: [2, 8],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.MEDIUM,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 12 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 2, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:synodontis": {
        id: [2, 9],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.CAT,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 13 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "==" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:tambaqui": {
        id: [2, 10],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.LARGE,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 97 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Wet, operation: "==" },
            { biomeGroup: BiomeGroup.Hot, operation: "==" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:skipjack_tuna": {
        id: [2, 11],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.LARGE,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 74 },
        spawnArea: SpawnArea.MiddleThird,
        spawnCount: { min: 3, max: 5 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "==" }
        ],
    },
    "tm_aqc:minnow": {
        id: [2, 12],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.TINY,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.01, max: 0.05 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 5 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:brown_bullhead": {
        id: [2, 13],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.CAT,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 7.5 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:white_catfish": {
        id: [2, 14],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.CAT,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 19.3 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:flathead_catfish": {
        id: [2, 15],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.CAT,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 123 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:airbreathing_catfish": {
        id: [3, 0],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.CAT,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 150 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:channel_catfish": {
        id: [3, 1],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.CAT,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 58 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:sharptooth_catfish": {
        id: [3, 2],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.CAT,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 132 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:bullhead_catfish": {
        id: [3, 3],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.CAT,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 11 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:yellow_bullhead": {
        id: [3, 4],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.CAT,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 6.6 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:atlantic_halibut": {
        id: [3, 5],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.FLAT,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 615 },
        spawnArea: SpawnArea.MiddleThird,
        spawnCount: { min: 1, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Wet, operation: "!=" },
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "==" },
            { biomeGroup: BiomeGroup.Cold, operation: "==" },
            { biomeGroup: BiomeGroup.Ocean, operation: "==" }
        ],
    },
    "tm_aqc:pacific_halibut": {
        id: [3, 6],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.FLAT,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 515 },
        spawnArea: SpawnArea.MiddleThird,
        spawnCount: { min: 1, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Wet, operation: "!=" },
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "==" },
            { biomeGroup: BiomeGroup.Cold, operation: "==" },
            { biomeGroup: BiomeGroup.Ocean, operation: "==" }
        ],
    },
    "tm_aqc:greenland_halibut": {
        id: [3, 7],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.FLAT,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 99 },
        spawnArea: SpawnArea.MiddleThird,
        spawnCount: { min: 1, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Wet, operation: "!=" },
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "==" },
            { biomeGroup: BiomeGroup.Cold, operation: "==" },
            { biomeGroup: BiomeGroup.Ocean, operation: "==" }
        ],
    },
    "tm_aqc:gizzard_shad": {
        id: [3, 8],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.TINY,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 3 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 5 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:bamboo_spitter": {
        id: [3, 9],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.TINY,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 5 },
        spawnArea: SpawnArea.TopThird,
        spawnCount: { min: 3, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Wet, operation: "==" },
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "==" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:white_crappie": {
        id: [3, 10],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.SMALL,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 5.2 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:black_crappie": {
        id: [3, 11],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.SMALL,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 5.5 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:pumpkinseed": {
        id: [3, 12],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.SMALL,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 1.5 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:redear_sunfish": {
        id: [3, 13],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.SMALL,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 6.5 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:green_sunfish": {
        id: [3, 14],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.SMALL,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 2.5 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:common_bream": {
        id: [3, 15],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.LARGE,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 23 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:spotted_bass": {
        id: [4, 0],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.MEDIUM,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 10.5 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:mud_sunfish": {
        id: [4, 1],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.SMALL,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 5.5 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:grass_pickerel": {
        id: [4, 2],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.LONGNOSE,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 1.5 },
        spawnArea: SpawnArea.TopThird,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:chain_pickerel": {
        id: [4, 3],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.LONGNOSE,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 9.4 },
        spawnArea: SpawnArea.TopThird,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:common_shiner": {
        id: [4, 4],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.TINY,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.01, max: 0.5 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 5 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:golden_shiner": {
        id: [4, 5],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.TINY,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.01, max: 0.5 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 5 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:warmouth": {
        id: [4, 6],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.SMALL,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 2.5 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:redfin_pickerel": {
        id: [4, 7],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.LONGNOSE,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 0.1, max: 2.3 },
        spawnArea: SpawnArea.TopThird,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:striped_bass": {
        id: [4, 8],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.MEDIUM,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 82 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 3, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" }
        ],
    },
    "tm_aqc:yellow_walleye": {
        id: [4, 9],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.MEDIUM,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 75,
        realWeight: { min: 1, max: 25 },
        spawnArea: SpawnArea.All,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:sakurafin": {
        id: [4, 10],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.SMALL,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 25,
        realWeight: { min: 1, max: 10 },
        spawnArea: SpawnArea.TopThird,
        spawnCount: { min: 3, max: 4 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.CherryBlossom, operation: "==" }
        ],
    },
    "tm_aqc:blind_creeker": {
        id: [4, 11],
        catchType: SpawnCatchType.Rod,
        skeletonModel: FishSkeleton.CAT,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.FISH_FILLET,
        weight: 25,
        realWeight: { min: 1, max: 150 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 2 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.PaleGarden, operation: "==" }
        ],
    },
    "tm_aqc:pink_shrimp": {
        id: [4, 12],
        catchType: SpawnCatchType.Pot,
        skeletonModel: FishSkeleton.SHRIMP,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.SHRIMP,
        weight: 25,
        realWeight: { min: 0.1, max: 1 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "==" }
        ],
    },
    "tm_aqc:rusty_crayfish": {
        id: [4, 13],
        catchType: SpawnCatchType.Pot,
        skeletonModel: FishSkeleton.SHRIMP,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.CRAYFISH,
        weight: 25,
        realWeight: { min: 0.1, max: 1 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:devil_crayfish": {
        id: [4, 14],
        catchType: SpawnCatchType.Pot,
        skeletonModel: FishSkeleton.SHRIMP,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.CRAYFISH,
        weight: 25,
        realWeight: { min: 0.1, max: 1 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Cold, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "!=" }
        ],
    },
    "tm_aqc:american_lobster": {
        id: [4, 15],
        catchType: SpawnCatchType.Pot,
        skeletonModel: FishSkeleton.SHRIMP,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.LOBSTER,
        weight: 25,
        realWeight: { min: 1, max: 45 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "==" }
        ],
    },
    "tm_aqc:giant_tiger_prawn": {
        id: [5, 0],
        catchType: SpawnCatchType.Pot,
        skeletonModel: FishSkeleton.SHRIMP,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.SHRIMP,
        weight: 25,
        realWeight: { min: 0.1, max: 1 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 3 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "==" }
        ],
    },
    "tm_aqc:hard_clam": {
        id: [5, 1],
        catchType: SpawnCatchType.None,
        skeletonModel: FishSkeleton.CLAM,
        cuttingBoardPreset: CUTTING_BOARD_PRESETS.CLAM,
        weight: 40,
        realWeight: { min: 0.1, max: 1 },
        spawnArea: SpawnArea.BottomThird,
        spawnCount: { min: 1, max: 1 },
        biomeGroups: [
            { biomeGroup: BiomeGroup.Dry, operation: "!=" },
            { biomeGroup: BiomeGroup.Hot, operation: "!=" },
            { biomeGroup: BiomeGroup.Ocean, operation: "==" }
        ],
    },
};

class MathUtils {
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    static randomFloat(min, max) {
        return Math.round((Math.random() * (max - min) + min) * 100) / 100;
    }
    static chance() {
        return MathUtils.randomInt(1, 100);
    }
    static isChance(chance) {
        if (chance < 0 || chance > 100)
            throw new Error("Chance must be between 1 and 100.");
        return this.chance() <= chance;
    }
}

var Dimensions;
(function (Dimensions) {
    Dimensions["Overworld"] = "minecraft:overworld";
    Dimensions["Nether"] = "minecraft:nether";
    Dimensions["TheEnd"] = "minecraft:the_end";
})(Dimensions || (Dimensions = {}));

class BlockDataManager {
    static setBlockData(block, key, data) {
        const dataKey = this.getDPKey(block, key);
        world.setDynamicProperty(dataKey, data);
    }
    static getBlockData(block, key) {
        const dataKey = this.getDPKey(block, key);
        return world.getDynamicProperty(dataKey);
    }
    static hasBlockData(block) {
        const string = `${block.location.x}|${block.location.y}|${block.location.z}`;
        return world.getDynamicPropertyIds().find(id => id.includes(string)) !== undefined;
    }
    static getDPKey(block, key) {
        return `${key}:${block.location.x}|${block.location.y}|${block.location.z}`;
    }
}

class FishUtils {
    static getDataFromID(ID) {
        const fishData = Object.entries(ALL_FISH_DATA);
        for (const [key, fish] of fishData) {
            if (fish.id[0] == ID[0] && fish.id[1] == ID[1]) {
                return fish;
            }
        }
        return undefined;
    }
    static getFishFromID(ID) {
        const fishData = Object.entries(ALL_FISH_DATA);
        for (const [key, fish] of fishData) {
            if (fish.id[0] == ID[0] && fish.id[1] == ID[1]) {
                return key;
            }
        }
        return "";
    }
    static getFishBlockItem(block, fishID) {
        let newITem = new ItemStack(fishID, 1);
        const hasBlockData = BlockDataManager.hasBlockData(block);
        if (hasBlockData) {
            const weight = BlockDataManager.getBlockData(block, DynamicPropertyEnum.FishWeight);
            if (weight > 0) {
                newITem = FishUtils.addWeightToItem(newITem, weight);
            }
            BlockDataManager.setBlockData(block, DynamicPropertyEnum.FishWeight, undefined);
        }
        return newITem;
    }
    static getIDFromFish(fish) {
        return ALL_FISH_DATA[fish].id;
    }
    static hasWeight(item) {
        const lore = item.getLore().filter(l => l.includes("Weight"));
        return lore.length > 0;
    }
    static getWeightFromItem(item) {
        const lore = item.getLore().filter(l => l.includes("Weight"));
        if (lore.length == 0)
            return 0;
        const weight = lore[0].replace("§l§dWeight:§f ", "").replace("lb", "").trim();
        return parseFloat(weight);
    }
    static addWeightToItem(item, weight) {
        const newItem = item.clone();
        const lore = [
            `§l§dWeight:§f ${weight}lb`,
        ];
        newItem.setLore(lore);
        return newItem;
    }
    static calculateFishWeight(fish, monstrous = false) {
        let min = fish.realWeight.min;
        let max = fish.realWeight.max;
        if (monstrous) {
            min = fish.realWeight.max * 1.1;
            max = fish.realWeight.max * 1.5;
        }
        const range = max - min;
        const segmends = [
            { min: min, max: min + range / 3 },
            { min: min + range / 3, max: min + (2 * range) / 3 },
            { min: min + (2 * range) / 3, max: max }
        ];
        const randomnSegment = segmends[MathUtils.randomInt(0, 2)];
        const randomWeight = MathUtils.randomFloat(randomnSegment.min, randomnSegment.max);
        return Math.round(randomWeight * 100) / 100;
    }
    static flopFish() {
        const overworldFish = world.getDimension(Dimensions.Overworld).getEntities({ families: ["tm_aqc_fish"] }).filter(fish => !fish.isInWater);
        const netherFish = world.getDimension(Dimensions.Nether).getEntities({ families: ["tm_aqc_fish"] }).filter(fish => !fish.isInWater);
        const endFish = world.getDimension(Dimensions.TheEnd).getEntities({ families: ["tm_aqc_fish"] }).filter(fish => !fish.isInWater);
        const allFish = [...overworldFish, ...netherFish, ...endFish];
        if (allFish.length == 0)
            return;
        for (const fish of allFish) {
            if (fish.isInWater || !fish.isOnGround)
                return;
            const random = MathUtils.randomFloat(-1.5, 1.5);
            const random2 = MathUtils.randomInt(0, 1);
            const rot = random2 == 0 ? -45 : 45;
            fish.applyKnockback({ x: random, z: random }, 0.5);
            fish.setRotation({ x: fish.getRotation().x + rot, y: fish.getRotation().y + rot });
        }
    }
}

var EntityTypeEnum;
(function (EntityTypeEnum) {
    EntityTypeEnum["Bobber"] = "tm_aqc:bobber";
    EntityTypeEnum["MessageInABottle"] = "tm_aqc:message_in_a_bottle";
    EntityTypeEnum["HarpoonEntity"] = "tm_aqc:harpoon_entity";
})(EntityTypeEnum || (EntityTypeEnum = {}));

var HookEnum;
(function (HookEnum) {
    HookEnum[HookEnum["Basic"] = 0] = "Basic";
    HookEnum[HookEnum["Iron"] = 1] = "Iron";
    HookEnum[HookEnum["Gold"] = 2] = "Gold";
    HookEnum[HookEnum["Diamond"] = 3] = "Diamond";
    HookEnum[HookEnum["Netherite"] = 4] = "Netherite";
    HookEnum[HookEnum["Neptunium"] = 5] = "Neptunium";
    HookEnum[HookEnum["Redstone"] = 6] = "Redstone";
    HookEnum[HookEnum["Heavy"] = 7] = "Heavy";
    HookEnum[HookEnum["Light"] = 8] = "Light";
    HookEnum[HookEnum["Double"] = 9] = "Double";
    HookEnum[HookEnum["Note"] = 10] = "Note";
    HookEnum[HookEnum["Glow"] = 11] = "Glow";
    HookEnum[HookEnum["Creeper"] = 12] = "Creeper";
})(HookEnum || (HookEnum = {}));

class BobberUtils {
    static getPlayerBobber(player) {
        let bobberID = undefined;
        try {
            bobberID = player.getDynamicProperty(DynamicPropertyEnum.BobberID) ?? undefined;
        }
        catch (error) {
            return;
        }
        if (bobberID === undefined)
            return;
        const bobber = world.getEntity(bobberID);
        return bobber;
    }
    static getOwner(bobber) {
        const projectile = bobber.getComponent(EntityComponentTypes.Projectile);
        if (!projectile)
            return;
        const owner = projectile.owner;
        if (!owner)
            return;
        if (!(owner instanceof Player))
            return;
        return owner;
    }
    static shootBobber(player, hook) {
        const spawnLocation = VectorUtils.add(player.location, { y: 1.0 });
        const bobber = player.dimension.spawnEntity(EntityTypeEnum.Bobber, spawnLocation);
        const projectile = bobber.getComponent(EntityComponentTypes.Projectile);
        if (!projectile)
            return;
        projectile.owner = player;
        let multiplyer = 1;
        if (hook !== undefined) {
            if (hook === "tm_aqc:light_hook")
                multiplyer = 0.75;
            if (hook === "tm_aqc:heavy_hook")
                multiplyer = 1.5;
        }
        const velocity = VectorUtils.multiply(player.getViewDirection(), { x: 1.5 * multiplyer, y: 1, z: 1.5 * multiplyer });
        projectile.shoot(velocity);
        return bobber;
    }
    ;
    static getHook(bobber) {
        return bobber.getProperty(ActorPropertiesEnum.Hook) ?? HookEnum.Basic;
    }
    static getParticleStart(bobber, radius) {
        const bobberLocation = bobber.location;
        const angle = Math.random() * 2 * Math.PI;
        const x = bobberLocation.x + radius * Math.cos(angle);
        const z = bobberLocation.z + radius * Math.sin(angle);
        return { x, y: bobberLocation.y, z };
    }
    static getBobberColour(typeID) {
        if (typeID === "tm_aqc:potato_bobber")
            return -1;
        let lastString = typeID.split("bobber_").pop() ?? "";
        if (lastString === "black")
            return 0;
        if (lastString === "blue")
            return 1;
        if (lastString === "brown")
            return 2;
        if (lastString === "cyan")
            return 3;
        if (lastString === "gray")
            return 4;
        if (lastString === "green")
            return 5;
        if (lastString === "light_blue")
            return 6;
        if (lastString === "light_gray")
            return 7;
        if (lastString === "lime")
            return 8;
        if (lastString === "magenta")
            return 9;
        if (lastString === "orange")
            return 10;
        if (lastString === "pink")
            return 11;
        if (lastString === "purple")
            return 12;
        if (lastString === "red")
            return 13;
        if (lastString === "white")
            return 14;
        if (lastString === "yellow")
            return 15;
        throw new Error(`Invalid bobber name for getBobberColour(): ${typeID}`);
    }
    static getBobberColourFromNumber(number) {
        switch (number) {
            case 0:
                return "black";
            case 1:
                return "blue";
            case 2:
                return "brown";
            case 3:
                return "cyan";
            case 4:
                return "gray";
            case 5:
                return "green";
            case 6:
                return "light_blue";
            case 7:
                return "light_gray";
            case 8:
                return "lime";
            case 9:
                return "magenta";
            case 10:
                return "orange";
            case 11:
                return "pink";
            case 12:
                return "purple";
            case 13:
                return "red";
            case 14:
                return "white";
            case 15:
                return "yellow";
            case -1:
                return "";
            default:
                throw new Error(`Invalid bobber number for getBobberColourFromNumber(): ${number}`);
        }
    }
}

var TagEnum;
(function (TagEnum) {
    TagEnum["Rod"] = "tm_aqc:rod";
    TagEnum["Bait"] = "tm_aqc:bait";
    TagEnum["Harpoon"] = "tm_aqc:harpoon";
})(TagEnum || (TagEnum = {}));

class ItemUtils {
    /**
     * Clears the lore of an item stack.
     * @param itemStack item to clear lore from
     */
    static clearLore(itemStack) {
        itemStack.setLore([]);
    }
    static reduceItemAmount(player, itemStack, amount) {
        if (player.getGameMode() === GameMode.Creative)
            return true;
        const newAmount = itemStack.amount - amount;
        const equippable = player.getComponent(EntityComponentTypes.Equippable);
        if (!equippable)
            return false;
        return equippable.setEquipment(EquipmentSlot.Mainhand, newAmount <= 0 ? undefined : new ItemStack(itemStack.typeId, newAmount));
    }
    static damageItem(player, itemStack, amount) {
        if (player.getGameMode() === GameMode.Creative || player.getGameMode() === GameMode.Spectator)
            return;
        const durabilityComponent = itemStack.getComponent(ItemComponentTypes.Durability);
        if (!durabilityComponent)
            return itemStack;
        let chance = 0;
        const enchantableComponent = itemStack.getComponent(ItemComponentTypes.Enchantable);
        if (enchantableComponent !== undefined) {
            const enchantment = enchantableComponent.getEnchantment("minecraft:unbreaking");
            if (enchantment !== undefined) {
                chance = Math.floor(100 / (enchantment.level + 1));
            }
        }
        if (MathUtils.isChance(chance))
            return;
        const newDamage = durabilityComponent.damage + amount;
        if (newDamage >= durabilityComponent.maxDurability) {
            player.playSound(SoundEnums.ItemBreak);
            PlayerUtils.setMainHandItem(player, undefined);
        }
        durabilityComponent.damage += amount;
        PlayerUtils.setMainHandItem(player, itemStack);
    }
    /**
   * Spawns items in the world at a specified location, respecting max stack size.
   * @param {ItemStack} itemStack - The ItemStack object to spawn.
   * @param {number} amount - The amount of items to spawn.
   * @param {Vector3} location - The location (Vector3) where items should be spawned.
   * @param {Dimension} dimension - The Minecraft dimension object to interact with the game.
   */
    static spawnItems(itemStack, amount, location, dimension) {
        const maxAmount = itemStack.maxAmount;
        let remainingAmount = amount;
        while (remainingAmount > 0) {
            const spawnAmount = Math.min(maxAmount, remainingAmount);
            const itemToSpawn = itemStack.clone();
            itemToSpawn.amount = spawnAmount;
            dimension.spawnItem(itemToSpawn, location);
            remainingAmount -= spawnAmount;
        }
    }
    static giveItem(player, itemStack, amount) {
        if (amount === undefined)
            amount = itemStack.amount;
        const inventory = player.getComponent(EntityComponentTypes.Inventory);
        let itemsToSpawn = 0;
        if (!inventory)
            itemsToSpawn = amount;
        const container = inventory.container;
        if (!container) {
            itemsToSpawn = amount;
            this.spawnItems(itemStack, itemsToSpawn, player.location, player.dimension);
            return;
        }
        const maxAmount = itemStack.maxAmount;
        let remainingAmount = amount;
        while (remainingAmount > 0) {
            const giveAmount = Math.min(maxAmount, remainingAmount);
            const itemToGive = itemStack.clone();
            itemToGive.amount = giveAmount;
            const remainingItem = container.addItem(itemToGive);
            if (remainingItem) {
                this.spawnItems(remainingItem, remainingItem.amount, player.location, player.dimension);
            }
            remainingAmount -= giveAmount;
        }
    }
    /**
     * Remove a specified amount of items from the player's inventory that match the given item stack.
     *
     * @param {Player} player - The player whose inventory is to be modified.
     * @param {ItemStack} itemStack - The item stack to match and remove from the inventory.
     * @param {number} amount - The amount of the item stack to remove.
     * @returns {boolean} True if the removal was completely successful, otherwise false.
     */
    static removeItem(player, itemStack, amount) {
        let { container, inventorySize: length } = player.getComponent(EntityComponentTypes.Inventory);
        let remainingAmount = amount;
        if (!container)
            return false;
        for (let i = 0; i < length && remainingAmount > 0; i++) {
            let item = container.getItem(i);
            if (!item)
                continue;
            if (ItemUtils.compareItemStacks(itemStack, item)) {
                if (item.amount > remainingAmount) {
                    item.amount -= remainingAmount;
                    remainingAmount = 0;
                    container.setItem(i, item);
                }
                else {
                    remainingAmount -= item.amount;
                    container.setItem(i, undefined);
                }
            }
        }
        return remainingAmount === 0;
    }
    /**
     * Checks if the player has the specified item in their inventory.
     * @param player player to check
     * @param itemStack item to check for
     * @returns true if the player has the item, otherwise false
     */
    static hasItem(player, itemStack) {
        const inventory = player.getComponent(EntityComponentTypes.Inventory);
        if (!inventory)
            return false;
        const container = inventory.container;
        if (!container)
            return false;
        const length = inventory.inventorySize;
        for (let i = 0; i < length; i++) {
            const item = container.getItem(i);
            if (!item)
                continue;
            if (ItemUtils.compareItemStacks(itemStack, item)) {
                return true;
            }
        }
        return false;
    }
    /**
   * Compares two ItemStacks to determine if they match exactly.
   * @param {ItemStack} itemStack The first ItemStack to compare.
   * @param {ItemStack} otherItemStack The second ItemStack to compare against.
   * @param {boolean} [compareAmount=false] Whether to compare the amount of items.
   * @returns {boolean} True if the ItemStacks match exactly, otherwise false.
   */
    static compareItemStacks(itemStack, otherItemStack, compareAmount = false) {
        //ID and Name
        if (itemStack.typeId !== otherItemStack.typeId)
            return false;
        if (itemStack.nameTag !== otherItemStack.nameTag)
            return false;
        if (compareAmount) {
            if (itemStack.amount !== otherItemStack.amount)
                return false;
        }
        else {
            //Check if they can simply stack
            if (itemStack.isStackable)
                return itemStack.isStackableWith(otherItemStack);
        }
        //Item Other NBT
        if (itemStack.keepOnDeath !== otherItemStack.keepOnDeath)
            return false;
        if (itemStack.lockMode !== otherItemStack.lockMode)
            return false;
        //Lore
        const itemStackLore = itemStack.getLore();
        const otherItemStackLore = otherItemStack.getLore();
        if (itemStackLore.length !== otherItemStackLore.length ||
            !itemStackLore.every((e, i) => e === otherItemStackLore[i]))
            return false;
        //Item Tags
        const itemStackTags = itemStack.getTags();
        const otherItemStackTags = otherItemStack.getTags();
        if (itemStackTags.length !== otherItemStackTags.length)
            return false;
        if (itemStackTags.length !== otherItemStackTags.length ||
            !itemStackTags.every((e, i) => e === otherItemStackTags[i]))
            return false;
        //Components
        const itemStackComponents = itemStack.getComponents();
        const otherItemStackComponents = otherItemStack.getComponents();
        if (itemStackComponents.length !== otherItemStackComponents.length)
            return false;
        let length = itemStackComponents.length;
        for (let i = 0; i < length; i++) {
            const component = itemStackComponents[i];
            const otherComponent = otherItemStackComponents[i];
            if (component == undefined || otherComponent == undefined)
                continue;
            switch (component.typeId) {
                case "minecraft:cooldown":
                    if (component.cooldownCategory !== otherComponent.cooldownCategory)
                        return false;
                    if (component.cooldownTicks !== otherComponent.cooldownTicks)
                        return false;
                    break;
                case "minecraft:durability":
                    if (component.damage !== otherComponent.damage)
                        return false;
                    if (component.maxDurability !== otherComponent.maxDurability)
                        return false;
                    break;
                case "minecraft:enchantable":
                    const enchants = component.getEnchantments();
                    const otherEnchants = otherComponent.getEnchantments();
                    if (enchants.length !== otherEnchants.length)
                        return false;
                    if (enchants.length > 0) {
                        let length = enchants.length;
                        for (let i = 0; i < length; i++) {
                            if (enchants[i].type !== otherEnchants[i].type)
                                return false;
                            if (enchants[i].level !== otherEnchants[i].level)
                                return false;
                        }
                    }
                    break;
                case "minecraft:food":
                    if (component.canAlwaysEat !== otherComponent.canAlwaysEat)
                        return false;
                    if (component.nutrition !== otherComponent.nutrition)
                        return false;
                    if (component.saturationModifier !== otherComponent.saturationModifier)
                        return false;
                    if (component.usingConvertsTo !== otherComponent.usingConvertsTo)
                        return false;
                    break;
                // TODO: Add Potion component when it is released
                /* case "minecraft:potion":
                  if (
                    component.potionEffectType.id !== otherComponent.potionEffectType.id
                  )
                    return false;
                  if (
                    component.potionLiquidType.id !== otherComponent.potionLiquidType.id
                  )
                    return false;
                  if (
                    component.potionModifierType.id !==
                    otherComponent.potionModifierType.id
                  )
                    return false;
                  break;*/
                // TODO: Add Dyable component when it is released
                /* case "minecraft:dyable":
                  if (component.color.blue !== otherComponent.color.blue) return false;
                  if (component.color.red !== otherComponent.color.red) return false;
                  if (component.color.green !== otherComponent.color.green)
                    return false;
                  break; */
            }
        }
        //Dynamic Properties
        const itemStackDPs = itemStack.getDynamicPropertyIds();
        const otherItemStackDPs = otherItemStack.getDynamicPropertyIds();
        if (itemStackDPs.length !== otherItemStackDPs.length)
            return false;
        for (const id of itemStackDPs) {
            const prop1 = itemStack.getDynamicProperty(id);
            const prop2 = otherItemStack.getDynamicProperty(id);
            if (typeof prop1 !== typeof prop2)
                return false;
            if (typeof prop1 === "object" && prop1 !== undefined &&
                typeof prop2 === "object" && prop2 !== undefined &&
                'x' in prop1 && 'y' in prop1 && 'z' in prop1 &&
                'x' in prop2 && 'y' in prop2 && 'z' in prop2) {
                return prop1.x === prop2.x && prop1.y === prop2.y && prop1.z === prop2.z;
            }
            if (prop1 !== prop2)
                return false;
        }
        return true;
    }
    /**
     * Creates an ItemStack object from a JSON string.
     * @param {ItemJson} json - The JSON string to parse.
     * @returns {ItemStack} The ItemStack object created from the JSON string.
     */
    static parseItem(json) {
        if (typeof json == "string") {
            json = JSON.parse(json);
        }
        let item = new ItemStack(json.type, json.amount);
        if (json.lockMode !== undefined) {
            item.lockMode = json.lockMode;
        }
        item.keepOnDeath = json.keepOnDeath ?? false;
        item.nameTag = json.nameTag;
        item.setCanDestroy(json.canDestroy);
        item.setCanPlaceOn(json.canPlaceOn);
        item.setLore(json.lore);
        json.properties?.forEach((property) => {
            item.setDynamicProperty(property.id, property.value);
        });
        if (item.getComponent("minecraft:durability")) {
            const durabilityComponent = item.getComponent("minecraft:durability");
            if (durabilityComponent) {
                if (json.durability !== undefined) {
                    durabilityComponent.damage = json.durability;
                }
            }
        }
        if (item.getComponent("minecraft:enchantable")) {
            const enchangeComponent = item.getComponent("minecraft:enchantable");
            enchangeComponent.addEnchantments((json.enchantments ?? []).map((enc) => {
                return {
                    level: enc.level,
                    type: new EnchantmentType(enc.type.id),
                };
            }));
        }
        //TODO: Add Dyeable component when it is released 
        /* if (item.getComponent("minecraft:dyeable")) {
            const dyeableComponent = item.getComponent("minecraft:dyeable") as ItemDyeableComponent;
            dyeableComponent.color = json.dyeColor;
        } */
        return item;
    }
    /**
     * Converts an ItemStack object into a JSON string.
     * @param {ItemStack} item - The ItemStack object to convert.
     * @returns {string} The JSON string representation of the ItemStack object.
     */
    static stringifyItem(item) {
        let json = {
            type: item.typeId,
            amount: item.amount,
            keepOnDeath: item.keepOnDeath,
            lockMode: item.lockMode,
            nameTag: item.nameTag,
            canDestroy: item.getCanDestroy(),
            canPlaceOn: item.getCanPlaceOn(),
            lore: item.getLore(),
            properties: item.getDynamicPropertyIds().map((id) => {
                return {
                    id: id,
                    value: item.getDynamicProperty(id),
                };
            }),
            durability: item.getComponent("minecraft:durability")?.damage,
            /* dyeColor: item.getComponent("minecraft:dyeable")?.color, TODO: Add Dyeable component when it is released */
            enchantments: item.getComponent("minecraft:enchantable")?.getEnchantments() || [],
        };
        return JSON.stringify(json);
    }
}

class WeatherManager {
    static INIT = false;
    //TODO: Remove INIT when dimension#getWeather() is implemented
    static WEATHER = {
        overworld: WeatherType.Clear,
        nether: WeatherType.Clear,
        theEnd: WeatherType.Clear
    };
    static init() {
        if (this.INIT)
            return;
        world.getDimension(Dimensions.Overworld).setWeather(WeatherType.Clear);
        system.runTimeout(() => {
            this.INIT = true;
        }, 2);
    }
    static completeInit(weather) {
        this.INIT = true;
        this.WEATHER.overworld = weather;
        world.getDimension(Dimensions.Overworld).setWeather(weather);
    }
    static getInit() {
        return this.INIT;
    }
    static setWeather(weather, dimension) {
        switch (dimension) {
            case Dimensions.Overworld:
                this.WEATHER.overworld = weather;
                break;
            case Dimensions.Nether:
                this.WEATHER.nether = weather;
                break;
            case Dimensions.TheEnd:
                this.WEATHER.theEnd = weather;
                break;
        }
    }
    static getWeather(dimension) {
        switch (dimension) {
            case Dimensions.Overworld:
                return this.WEATHER.overworld;
            case Dimensions.Nether:
                return this.WEATHER.nether;
            case Dimensions.TheEnd:
                return this.WEATHER.theEnd;
            default:
                throw new Error(`Invalid dimension: ${dimension}`);
        }
    }
}

const JUNK = [
    { biomeGroups: [], loot: "tm/aqc/fishing/junk" },
    {
        biomeGroups: [
            {
                biomeGroup: BiomeGroup.Jungle,
                operation: "==",
            },
        ],
        loot: "tm/aqc/fishing/junk",
    },
];
const TREASURE = [
    { biomeGroups: [], loot: "tm/aqc/fishing/treasure" },
];

class CatchUtils {
    static getAllFishForBiome(location, dimension, type = undefined, exclude = false) {
        const biomeGroups = BiomeChecker.getBiomeGroups(location, dimension);
        let fishData = Object.entries(ALL_FISH_DATA);
        if (type !== undefined) {
            if (!exclude)
                fishData = fishData.filter(([key, fish]) => fish.catchType === type);
            else
                fishData = fishData.filter(([key, fish]) => fish.catchType !== type);
        }
        const fishTypes = [];
        for (const [key, fish] of fishData) {
            if (BiomeChecker.checkBiomeGroups(fish.biomeGroups, biomeGroups)) {
                fishTypes.push(key);
            }
        }
        //world.sendMessage(`Fish types: ${JSON.stringify(fishTypes)}`);
        return fishTypes;
    }
    static getCaughtFish(location, dimension, type = undefined, exclude = false) {
        const types = this.getAllFishForBiome(location, dimension, type, exclude);
        let combinedWeight = 0;
        for (const type of types) {
            combinedWeight += ALL_FISH_DATA[type].weight;
        }
        let randomWeight = MathUtils.randomInt(0, combinedWeight);
        for (const type of types) {
            randomWeight -= ALL_FISH_DATA[type].weight;
            if (randomWeight <= 0) {
                //world.sendMessage(`Caught fish: ${type}`);
                return type;
            }
        }
        return types[0];
    }
    static getJunkTable(location, dimension) {
        const biomeGroups = BiomeChecker.getBiomeGroups(location, dimension);
        const junkTables = JUNK;
        const junkTable = junkTables.find((table) => BiomeChecker.checkBiomeGroups(table.biomeGroups, biomeGroups))?.loot || junkTables[0].loot;
        return junkTable;
    }
    static getTreasureTable(location, dimension) {
        const biomeGroups = BiomeChecker.getBiomeGroups(location, dimension);
        const treasureTables = TREASURE;
        const treasureTable = treasureTables.find((table) => BiomeChecker.checkBiomeGroups(table.biomeGroups, biomeGroups))?.loot || treasureTables[0].loot;
        return treasureTable;
    }
    static removeLeash(entity) {
        const location = entity.location;
        const dimension = entity.dimension;
        const leashComponents = entity.getComponent(EntityComponentTypes.Leashable);
        if (!leashComponents)
            return;
        leashComponents.unleash();
        system.run(() => {
            const items = dimension.getEntities({ type: "minecraft:item", maxDistance: 2, location: location });
            for (const item of items) {
                const itemEntity = item.getComponent(EntityComponentTypes.Item);
                if (!itemEntity)
                    continue;
                if (itemEntity.itemStack.typeId === "minecraft:lead")
                    item.remove();
            }
        });
    }
}

class BlockUtils {
    static setPowered(block) {
        const state = block.permutation.getAllStates();
        if (state === undefined)
            return;
        if (Array.isArray(state) && !state.includes("tm_aqc:powered"))
            return;
        const powered = block.getRedstonePower();
        if (powered && powered > 0) {
            const powered = block.permutation.getState("tm_aqc:powered");
            if (!powered)
                block.setPermutation(block.permutation.withState("tm_aqc:powered", true));
        }
        else {
            const powered = block.permutation.getState("tm_aqc:powered");
            if (powered)
                block.setPermutation(block.permutation.withState("tm_aqc:powered", false));
        }
    }
    static isPowered(block) {
        const powered = block.getRedstonePower();
        return powered !== undefined && powered > 0;
    }
    static getPlacedBlockLocation(block, blockFace) {
        let x = block.location.x;
        let y = block.location.y;
        let z = block.location.z;
        switch (blockFace) {
            case "Down":
                y--;
                break;
            case "East":
                x++;
                break;
            case "North":
                z--;
                break;
            case "South":
                z++;
                break;
            case "Up":
                y++;
                break;
            case "West":
                x--;
                break;
        }
        return { x: x, y: y, z: z };
    }
    static destroyBlock(block, replaceBlockId = "air") {
        block.dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ${replaceBlockId} destroy`);
    }
    static isUnderground(dimension, location) {
        const raycast = dimension.getBlockFromRay(location, { x: 0, y: 1, z: 0 }, {
            includeLiquidBlocks: false,
            includePassableBlocks: false,
            maxDistance: dimension.heightRange.max - location.y
        });
        return raycast !== undefined;
    }
}

class CommonUtils {
    static toCamelCase(str) {
        return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    }
    static underscoreToCamelCase(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }
}

class RodUtils {
    static getRodNumber(typeId) {
        switch (typeId) {
            case "tm_aqc:gold_fishing_rod":
                return 1;
            case "tm_aqc:diamond_fishing_rod":
                return 2;
            case "tm_aqc:netherite_fishing_rod":
                return 3;
            case "tm_aqc:neptunium_fishing_rod":
                return 4;
            default:
                return 0;
        }
    }
    static getHookNumber(typeId) {
        switch (typeId) {
            case "tm_aqc:iron_hook":
                return 1;
            case "tm_aqc:gold_hook":
                return 2;
            case "tm_aqc:diamond_hook":
                return 3;
            case "tm_aqc:neptunium_hook":
                return 4;
            case "tm_aqc:redstone_hook":
                return 5;
            case "tm_aqc:heavy_hook":
                return 6;
            case "tm_aqc:light_hook":
                return 7;
            case "tm_aqc:double_hook":
                return 8;
            case "tm_aqc:note_hook":
                return 9;
            case "tm_aqc:glow_hook":
                return 10;
            case "tm_aqc:creeper_hook":
                return 11;
            case "tm_aqc:essence_hook":
                return 12;
            default:
                return 0;
        }
    }
    static getHookFromNumber(number) {
        switch (number) {
            case 1:
                return "tm_aqc:iron_hook";
            case 2:
                return "tm_aqc:gold_hook";
            case 3:
                return "tm_aqc:diamond_hook";
            case 4:
                return "tm_aqc:neptunium_hook";
            case 5:
                return "tm_aqc:redstone_hook";
            case 6:
                return "tm_aqc:heavy_hook";
            case 7:
                return "tm_aqc:light_hook";
            case 8:
                return "tm_aqc:double_hook";
            case 9:
                return "tm_aqc:note_hook";
            case 10:
                return "tm_aqc:glow_hook";
            case 11:
                return "tm_aqc:creeper_hook";
            case 12:
                return "tm_aqc:essence_hook";
            default:
                return "default";
        }
    }
    static getBobberNumber(typeId) {
        if (typeId.includes("basic_bobber"))
            return 1;
        if (typeId.includes("feathered_bobber"))
            return 2;
        if (typeId.includes("winged_bobber"))
            return 3;
        if (typeId.includes("creeper_bobber"))
            return 4;
        if (typeId.includes("potato"))
            return 5;
        return 0;
    }
    static getBobberFromNumber(number) {
        switch (number) {
            case 1:
                return "tm_aqc:basic_bobber";
            case 2:
                return "tm_aqc:feathered_bobber";
            case 3:
                return "tm_aqc:winged_bobber";
            case 4:
                return "tm_aqc:creeper_bobber";
            case 5:
                return "tm_aqc:potato_bobber";
            default:
                return "default";
        }
    }
    static getUpdatedLore(rod) {
        const lore = [];
        const bobber = rod.getDynamicProperty(DynamicPropertyEnum.Bobber);
        if (bobber) {
            const bobberName = bobber.split(":")[1].replace(/_/g, " ");
            lore.push(`§eBobber§r: ${CommonUtils.underscoreToCamelCase(bobberName)}§r`);
        }
        const hook = rod.getDynamicProperty(DynamicPropertyEnum.Hook);
        if (hook) {
            const hookName = hook.split(":")[1].replace(/_/g, " ");
            lore.push(`§dHook§r: ${CommonUtils.underscoreToCamelCase(hookName)}§r`);
        }
        return lore;
    }
}

class FishCatalogeManager {
    static isFishUnlocked(typeId, player) {
        const dpKey = this.getDPKey(typeId);
        const dpValue = player.getDynamicProperty(dpKey);
        return dpValue !== undefined && dpValue === true;
    }
    static unlockFish(typeId, player) {
        const dpKey = this.getDPKey(typeId);
        player.setDynamicProperty(dpKey, true);
        player.playSound(SoundEnums.UnlockFish, { volume: 1.5 });
        player.sendMessage({ translate: `tm_aqc.message.${typeId}.discovered` });
    }
    static getDPKey(typeId) {
        return `fish_catalogue:${typeId}`;
    }
}

var CatchType;
(function (CatchType) {
    CatchType[CatchType["Fish"] = 0] = "Fish";
    CatchType[CatchType["Junk"] = 1] = "Junk";
    CatchType[CatchType["Treasure"] = 2] = "Treasure";
})(CatchType || (CatchType = {}));
var BaitType;
(function (BaitType) {
    BaitType[BaitType["Multiplier"] = 0] = "Multiplier";
    BaitType[BaitType["Magnet"] = 1] = "Magnet";
    BaitType[BaitType["GoldMagnet"] = 2] = "GoldMagnet";
    BaitType[BaitType["GoldWorm"] = 3] = "GoldWorm";
    BaitType[BaitType["Spinner"] = 4] = "Spinner";
})(BaitType || (BaitType = {}));
class RodManager {
    static init() {
        system.runInterval(() => {
            const players = world.getAllPlayers().filter(player => this.hasCast(player));
            for (const player of players) {
                this.handleFarFromBobber(player);
                this.handleLine(player);
            }
        }, 1);
        system.runInterval(() => {
            const overworldBobbers = world.getDimension(Dimensions.Overworld).getEntities({ type: "tm_aqc:bobber", propertyOptions: [{ propertyId: ActorPropertiesEnum.LureCooldown, value: { greaterThan: 0 } }] });
            const netherBobbers = world.getDimension(Dimensions.Nether).getEntities({ type: "tm_aqc:bobber", propertyOptions: [{ propertyId: ActorPropertiesEnum.LureCooldown, value: { greaterThan: 0 } }] });
            const endBobbers = world.getDimension(Dimensions.TheEnd).getEntities({ type: "tm_aqc:bobber", propertyOptions: [{ propertyId: ActorPropertiesEnum.LureCooldown, value: { greaterThan: 0 } }] });
            const bobbers = [...overworldBobbers, ...netherBobbers, ...endBobbers];
            for (const bobber of bobbers) {
                this.handleLure(bobber);
            }
        }, 1);
    }
    static onUseRod(player, item) {
        const hasCast = this.hasCast(player);
        if (hasCast)
            this.uncast(player, item);
        else
            this.cast(player, item);
    }
    static cast(player, item) {
        const hook = item.getDynamicProperty(DynamicPropertyEnum.Hook);
        const bobber = BobberUtils.shootBobber(player, hook);
        if (!bobber)
            return;
        //player.setDynamicProperty(DynamicPropertyEnum.HasCast, true);
        player.setDynamicProperty(DynamicPropertyEnum.BobberID, bobber.id);
        player.playAnimation("animation.tm_aqc.rod.set_cast");
        {
            const leashComponents = bobber.getComponent(EntityComponentTypes.Leashable);
            if (!leashComponents)
                return;
            leashComponents.leashTo(player);
        }
        let baitMultiplier = 1;
        const bait = this.getBait(player);
        if (bait) {
            this.consumeBait(player, bait);
            const baitType = this.getBaitType(bait);
            bobber.setDynamicProperty(DynamicPropertyEnum.BaitType, baitType);
            if (baitType === BaitType.Multiplier) {
                baitMultiplier = this.getBaitMultiplier(bait);
            }
        }
        //TODO: Create backup for dynamic property loss between updates to check the lore and re-set the DPs
        const savedBobber = item.getDynamicProperty(DynamicPropertyEnum.Bobber) ?? "default";
        const savedHook = item.getDynamicProperty(DynamicPropertyEnum.Hook) ?? "default";
        const bobberNumber = RodUtils.getBobberNumber(savedBobber);
        const bobberColour = item.getDynamicProperty(DynamicPropertyEnum.Colour) ?? 0;
        const hookNumber = RodUtils.getHookNumber(savedHook);
        bobber.setDynamicProperty(DynamicPropertyEnum.BaitMultiplier, baitMultiplier);
        bobber.setProperty(ActorPropertiesEnum.Bobber, bobberNumber);
        bobber.setProperty(ActorPropertiesEnum.Hook, hookNumber);
        bobber.setProperty(ActorPropertiesEnum.Colour, bobberColour);
        const hookType = RodUtils.getHookFromNumber(hookNumber ?? 0);
        if (hookType === "tm_aqc:glow_hook")
            bobber.setProperty(ActorPropertiesEnum.Glow, true);
        player.playSound("random.bow", { volume: 1, pitch: MathUtils.randomFloat(0.33, 0.5) });
    }
    static startBobber(bobber) {
        const owner = BobberUtils.getOwner(bobber);
        if (!owner)
            return;
        const equippeable = owner.getComponent(EntityComponentTypes.Equippable);
        if (!equippeable)
            return;
        const item = equippeable.getEquipment(EquipmentSlot.Mainhand);
        if (!item)
            return;
        const lureCooldown = this.calculateLureCooldown(bobber, item);
        bobber.setProperty(ActorPropertiesEnum.LureCooldown, lureCooldown * TicksPerSecond);
        bobber.applyImpulse({ x: 0, y: 0.25, z: 0 });
    }
    static uncast(player, item, canceled = false) {
        //player.setDynamicProperty(DynamicPropertyEnum.HasCast, undefined);
        const bobber = BobberUtils.getPlayerBobber(player);
        if (!bobber || !player)
            return;
        player.playAnimation("animation.tm_aqc.rod.set_uncast");
        {
            CatchUtils.removeLeash(bobber);
        }
        if (!canceled)
            this.handleCatch(bobber, item, player);
        bobber.remove();
    }
    static uncaught(bobber) {
        //Method to handle bobber that has not been caught incase we need to do other stuff on top of startBobber
        this.startBobber(bobber);
    }
    static handleCatch(bobber, rod, player) {
        const caught = bobber.getProperty(ActorPropertiesEnum.Bite) ?? false;
        if (!caught)
            return;
        if (!rod)
            return;
        const hook = bobber.getProperty(ActorPropertiesEnum.Hook);
        const hookType = RodUtils.getHookFromNumber(hook ?? 0);
        let damageItem = 100;
        if (hookType === "tm_aqc:iron_hook")
            damageItem = 10;
        if (hookType === "tm_aqc:gold_hook")
            damageItem = 15;
        if (hookType === "tm_aqc:diamond_hook")
            damageItem = 20;
        if (hookType === "tm_aqc:netherite_hook" && bobber.dimension.id === Dimensions.Nether)
            damageItem = 25;
        if (hookType === "tm_aqc:neptunium_hook" && bobber.dimension.id === Dimensions.Overworld)
            damageItem = 25;
        if (MathUtils.isChance(damageItem)) {
            ItemUtils.damageItem(player, rod, 1);
        }
        let minXp = 1;
        let maxXp = 6;
        const essenceChance = MathUtils.randomInt(0, 1);
        if (hookType === "tm_aqc:essence_hook" && essenceChance === 0) {
            minXp = 2;
            maxXp = 12;
        }
        player.addExperience(MathUtils.randomInt(minXp, maxXp));
        let catches = 1;
        if (hookType === "tm_aqc:double_hook")
            catches = MathUtils.chance() <= 25 ? 2 : 1;
        if (hookType === "tm_aqc:creeper_hook")
            bobber.dimension.createExplosion(bobber.location, 4, { allowUnderwater: true, breaksBlocks: false, causesFire: false, source: player });
        for (let i = 0; i < catches; i++) {
            const catchType = this.getCatchType(bobber, rod);
            if (catchType === CatchType.Fish) {
                this.catchFish(bobber.dimension, bobber.location, player, rod);
            }
            else {
                this.catchJunkOrTreasure(bobber.dimension, bobber.location, player, rod, catchType);
            }
        }
    }
    static catchFish(dimension, location, player, item) {
        let fish = CatchUtils.getCaughtFish(location, dimension, SpawnCatchType.Rod);
        const largeWeight = 10;
        if (MathUtils.isChance(largeWeight)) {
            fish = `${fish}_monstrous`;
        }
        const fishItem = new ItemStack(fish, 1);
        const addedToChest = this.addItemtoChest(player, fishItem);
        if (!addedToChest) {
            const itemEntity = dimension.spawnItem(fishItem, location);
            this.launchLoot(itemEntity, player);
        }
        let fishTypeId = fish;
        if (fishTypeId.includes("_monstrous")) {
            dimension.spawnParticle("tm_aqc:monstrous_alert", location);
            fishTypeId = fishTypeId.replace("_monstrous", "");
            world.sendMessage({ rawtext: [
                    { text: `§l§d${player.name}§r ` },
                    { translate: `tm_aqc.message.caught.monstrous` },
                    { text: " §b" },
                    { translate: `entity.${fishTypeId}.name` },
                    { text: "§r!" }
                ] });
        }
        const isFishUnlocked = FishCatalogeManager.isFishUnlocked(fishTypeId, player);
        if (!isFishUnlocked)
            FishCatalogeManager.unlockFish(fishTypeId, player);
    }
    static catchJunkOrTreasure(dimension, location, player, item, catchType) {
        let lootTable = "";
        switch (catchType) {
            case CatchType.Junk:
                lootTable = CatchUtils.getJunkTable(location, dimension);
                break;
            case CatchType.Treasure:
                lootTable = CatchUtils.getTreasureTable(location, dimension);
                break;
        }
        dimension.runCommand(`loot spawn ${location.x + 0.5} ${location.y + 0.5} ${location.z + 0.5} loot "${lootTable}"`);
        system.runTimeout(() => {
            const items = dimension.getEntities({ type: "minecraft:item", location: location, maxDistance: 1 });
            for (const item of items) {
                const itemEntity = item.getComponent(EntityComponentTypes.Item);
                if (!itemEntity)
                    continue;
                const addedToChest = this.addItemtoChest(player, itemEntity.itemStack);
                if (addedToChest) {
                    player.playSound(SoundEnums.ChestOpen, { volume: 1 });
                    item.remove();
                    continue;
                }
                this.launchLoot(item, player);
            }
        }, 1);
    }
    static launchLoot(entity, player) {
        const location = entity.location;
        const playerLocation = player.location;
        entity.clearVelocity();
        const direction = {
            x: (playerLocation.x - location.x) / 22,
            y: (playerLocation.y - location.y) / 22 + 0.6,
            z: (playerLocation.z - location.z) / 22
        };
        entity.applyImpulse(direction);
    }
    static addItemtoChest(player, item) {
        const dimension = player.dimension;
        const riding = player.getComponent(EntityComponentTypes.Riding);
        if (!riding)
            return false;
        const seat = dimension.getBlock(player.location);
        if (!seat)
            return false;
        const northChest = dimension.getBlock(VectorUtils.add(seat.location, { x: 0, y: 0, z: -1 }));
        const eastChest = dimension.getBlock(VectorUtils.add(seat.location, { x: 1, y: 0, z: 0 }));
        const southChest = dimension.getBlock(VectorUtils.add(seat.location, { x: 0, y: 0, z: 1 }));
        const westChest = dimension.getBlock(VectorUtils.add(seat.location, { x: -1, y: 0, z: 0 }));
        const chests = [];
        if (northChest && northChest.getComponent(BlockComponentTypes.Inventory) !== undefined)
            chests.push(northChest);
        if (eastChest && eastChest.getComponent(BlockComponentTypes.Inventory) !== undefined)
            chests.push(eastChest);
        if (southChest && southChest.getComponent(BlockComponentTypes.Inventory) !== undefined)
            chests.push(southChest);
        if (westChest && westChest.getComponent(BlockComponentTypes.Inventory) !== undefined)
            chests.push(westChest);
        if (chests.length === 0)
            return false;
        for (const chest of chests) {
            const inventory = chest.getComponent(BlockComponentTypes.Inventory);
            if (!inventory)
                continue;
            const container = inventory.container;
            if (!container)
                continue;
            const leftOverItemStack = container.addItem(item);
            if (leftOverItemStack === undefined) {
                player.sendMessage({ translate: "tm_aqc.message.added_to_chest" });
                return true;
            }
        }
        return false;
    }
    static getCatchType(bobber, item) {
        let luck = 0;
        const enchantComponent = item.getComponent(ItemComponentTypes.Enchantable);
        if (enchantComponent) {
            const luckEnchant = enchantComponent.getEnchantment("minecraft:luck_of_the_sea");
            if (luckEnchant)
                luck = luckEnchant.level;
        }
        let fishChance = 85;
        let junkChance = 10;
        let treasureChance = 5;
        let luckFish = 0;
        let luckJunk = 0;
        let luckTreasure = 0;
        switch (luck) {
            case 1:
                luckFish = 84.8 - fishChance;
                luckJunk = 8.1 - junkChance;
                luckTreasure = 7.1 - treasureChance;
                break;
            case 2:
                luckFish = 84.7 - fishChance;
                luckJunk = 6.1 - junkChance;
                luckTreasure = 9.2 - treasureChance;
                break;
            case 3:
                luckFish = 84.5 - fishChance;
                luckJunk = 4.2 - junkChance;
                luckTreasure = 11.3 - treasureChance;
                break;
        }
        const baitType = bobber.getDynamicProperty(DynamicPropertyEnum.BaitType);
        if (baitType !== undefined) {
            switch (baitType) {
                case BaitType.GoldWorm:
                    fishChance = 0;
                    junkChance = 0;
                    treasureChance = Math.min(treasureChance + 100, 100);
                    break;
                case BaitType.Magnet:
                    fishChance = 20;
                    junkChance = 50;
                    treasureChance = 30;
                    break;
                case BaitType.GoldMagnet:
                    fishChance = 20;
                    junkChance = 30;
                    treasureChance = 50;
                    break;
                case BaitType.Spinner:
                    fishChance = 95;
                    junkChance = 4;
                    treasureChance = 1;
                    break;
            }
        }
        if (luck > 0) {
            fishChance = Math.max(0, Math.min(100, fishChance + luckFish));
            junkChance = Math.max(0, Math.min(100, junkChance + luckJunk));
            treasureChance = Math.max(0, Math.min(100, treasureChance + luckTreasure));
            fishChance = Math.floor(fishChance);
            junkChance = Math.floor(junkChance);
            treasureChance = Math.floor(treasureChance);
        }
        const random = MathUtils.randomInt(1, 100);
        if (DebugUtils.isDebugMode(DebugModeEnum.CatchChance))
            DebugUtils.sendDebugMessage(`FishChance: ${fishChance} JunkChance: ${junkChance} TreasureChance: ${treasureChance} Random: ${random}`);
        if (random <= fishChance)
            return CatchType.Fish;
        if (random <= fishChance + junkChance)
            return CatchType.Junk;
        return CatchType.Treasure;
    }
    static calculateLureCooldown(bobber, item) {
        let min = 5;
        let max = 30;
        let lure = 0;
        const enchantComponent = item.getComponent(ItemComponentTypes.Enchantable);
        if (enchantComponent) {
            const lureEnchant = enchantComponent.getEnchantment("minecraft:lure");
            if (lureEnchant)
                lure = lureEnchant.level;
        }
        if (item.typeId === "tm_aqc:neptunium_fishing_rod")
            lure += 1;
        min = Math.max(1, min - lure * 5);
        max = Math.max(5, max - lure * 5);
        const baitMultiplier = bobber.getDynamicProperty(DynamicPropertyEnum.BaitMultiplier) ?? 0;
        max = Math.max(1, max - (baitMultiplier * 3));
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    static bite(bobber) {
        const hook = bobber.getProperty(ActorPropertiesEnum.Hook);
        const hookType = RodUtils.getHookFromNumber(hook ?? 0);
        if (hookType === "tm_aqc:redstone_hook")
            bobber.triggerEvent("tm_aqc:bite_redstone_hook");
        else
            bobber.triggerEvent("tm_aqc:bite");
        bobber.dimension.playSound(SoundEnums.Splash, bobber.location, { volume: 0.75 });
        if (hookType === "tm_aqc:note_hook") {
            const player = BobberUtils.getOwner(bobber);
            if (!player)
                return;
            player.playSound(SoundEnums.NoteHook, { volume: 2 });
        }
    }
    static handleLure(bobber) {
        const aboveBlock = bobber.dimension.getBlock(VectorUtils.add(bobber.location, { x: 0, y: 1, z: 0 }));
        if (aboveBlock !== undefined && aboveBlock.isLiquid)
            return;
        let lureCooldown = bobber.getProperty(ActorPropertiesEnum.LureCooldown);
        if (lureCooldown === undefined)
            return;
        if (lureCooldown === -1)
            return;
        const bite = bobber.getProperty(ActorPropertiesEnum.Bite) ?? false;
        if (bite)
            return;
        if (lureCooldown > 0) {
            const isUnderground = BlockUtils.isUnderground(bobber.dimension, bobber.location);
            const weather = WeatherManager.getWeather(bobber.dimension.id);
            let cooldown = 1;
            const paricleCooldown = bobber.getDynamicProperty(DynamicPropertyEnum.BiteParticle);
            if (paricleCooldown === undefined && lureCooldown <= 4 * TicksPerSecond) {
                const radius = MathUtils.randomInt(lureCooldown === 1 ? 1 : 2, lureCooldown / TicksPerSecond);
                bobber.setDynamicProperty(DynamicPropertyEnum.BiteParticle, radius);
                bobber.setDynamicProperty(DynamicPropertyEnum.BiteStart, BobberUtils.getParticleStart(bobber, radius));
            }
            //If the bobber is not directly exposed to sun or moonlight, the wait time is approximately doubled (each tick has a 50% chance of not decrementing the count).
            if (isUnderground && weather !== WeatherType.Rain) {
                cooldown = MathUtils.randomInt(0, 1);
            }
            // If the bobber's block is being rained on, the wait time is reduced by approximately 20% (each tick has a 25% chance of counting down 2 instead of 1).
            else if (!isUnderground && weather === WeatherType.Rain) {
                const quarterChance = MathUtils.randomInt(0, 3);
                if (quarterChance === 0)
                    cooldown = 2;
            }
            cooldown = lureCooldown - cooldown;
            if (cooldown < 0)
                cooldown = 0;
            if (cooldown === lureCooldown)
                return;
            this.handleBite(bobber, cooldown);
            if (DebugUtils.isDebugMode(DebugModeEnum.RodCooldown)) {
                world.getAllPlayers().forEach(player => {
                    player.onScreenDisplay.setActionBar(`Cooldown: ${cooldown}`);
                });
            }
            bobber.setProperty(ActorPropertiesEnum.LureCooldown, cooldown);
            return;
        }
        this.bite(bobber);
    }
    static handleBite(bobber, cooldown) {
        if (!bobber)
            return;
        const paricleCooldown = bobber.getDynamicProperty(DynamicPropertyEnum.BiteParticle);
        if (paricleCooldown === undefined)
            return;
        if (paricleCooldown <= 0) {
            bobber.setDynamicProperty(DynamicPropertyEnum.BiteParticle, undefined);
            return;
        }
        if (cooldown > paricleCooldown * TicksPerSecond)
            return;
        const particleLocation = bobber.getDynamicProperty(DynamicPropertyEnum.BiteStart);
        if (particleLocation === undefined)
            return;
        bobber.setDynamicProperty(DynamicPropertyEnum.BiteParticle, paricleCooldown - 1);
        let closerLocation = particleLocation;
        const block = bobber.dimension.getBlock(closerLocation);
        if (!block || !block.isLiquid)
            return;
        const splashMolangMap = new MolangVariableMap();
        splashMolangMap.setFloat("particle_random_1", MathUtils.randomFloat(0.0, 1.0));
        splashMolangMap.setFloat("particle_random_2", MathUtils.randomFloat(0.1, 2.0));
        splashMolangMap.setVector3("direction", { x: 0, y: 0, z: 0 });
        bobber.dimension.spawnParticle("minecraft:water_splash_particle", closerLocation, splashMolangMap);
        const doPos = MathUtils.randomInt(0, 1) === 0;
        if (doPos) {
            const fishPosMolangMap = new MolangVariableMap();
            fishPosMolangMap.setFloat("particle_random_1", MathUtils.randomFloat(0.5, 1.0));
            fishPosMolangMap.setFloat("particle_random_2", MathUtils.randomFloat(0.5, 1.0));
            fishPosMolangMap.setVector3("direction", { x: 0, y: 0, z: 0 });
            bobber.dimension.spawnParticle("minecraft:fish_pos_particle", closerLocation, fishPosMolangMap);
        }
        closerLocation = {
            x: closerLocation.x + (bobber.location.x - closerLocation.x) * 0.1,
            y: closerLocation.y,
            z: closerLocation.z + (bobber.location.z - closerLocation.z) * 0.1
        };
        bobber.setDynamicProperty(DynamicPropertyEnum.BiteStart, closerLocation);
    }
    static handleLine(player) {
        {
            player.playAnimation(`animation.tm_aqc.line.hold`);
            return;
        }
    }
    static handleFarFromBobber(player) {
        const bobber = BobberUtils.getPlayerBobber(player);
        if (!bobber)
            return;
        const bobberLocation = bobber.location;
        const playerLocation = player.location;
        const bobberDistance = Math.floor(Math.sqrt(Math.pow(bobberLocation.x - playerLocation.x, 2) +
            Math.pow(bobberLocation.y - playerLocation.y, 2) +
            Math.pow(bobberLocation.z - playerLocation.z, 2)));
        if (bobberDistance >= 32)
            this.uncast(player, undefined, true);
    }
    static hasCast(player) {
        return BobberUtils.getPlayerBobber(player) !== undefined;
        //return player.getDynamicProperty(DynamicPropertyEnum.HasCast) as boolean ?? false;
    }
    static getBait(player) {
        const equippable = player.getComponent(EntityComponentTypes.Equippable);
        if (!equippable)
            return;
        const item = equippable.getEquipment(EquipmentSlot.Offhand);
        if (item && this.isBait(item))
            return item;
    }
    static isBait(item) {
        return item.getTags().some(tag => tag.startsWith(TagEnum.Bait));
    }
    static getBaitType(item) {
        if (item.getTags().some(tag => tag.startsWith(TagEnum.Bait + "_"))) {
            return BaitType.Multiplier;
        }
        switch (item.typeId) {
            case "tm_aqc:gold_worm":
                return BaitType.GoldWorm;
            case "tm_aqc:magnet":
                return BaitType.Magnet;
            case "tm_aqc:gold_magnet":
                return BaitType.GoldMagnet;
            case "tm_aqc:spinner":
                return BaitType.Spinner;
            default:
                return undefined;
        }
    }
    static getBaitMultiplier(item) {
        const tags = item.getTags();
        for (const tag of tags) {
            if (tag.startsWith(TagEnum.Bait)) {
                const multiplier = parseFloat(tag.split("_")[1]);
                if (!isNaN(multiplier))
                    return multiplier;
            }
        }
        return 1;
    }
    static consumeBait(player, bait) {
        if (bait.typeId.includes("slime")) {
            if (MathUtils.isChance(75))
                return;
        }
        const equippable = player.getComponent(EntityComponentTypes.Equippable);
        if (!equippable)
            return;
        const item = equippable.getEquipment(EquipmentSlot.Offhand);
        if (item && item.typeId === bait.typeId) {
            equippable.setEquipment(EquipmentSlot.Offhand, item.amount === 1 ? undefined : new ItemStack(item.typeId, item.amount - 1));
            return;
        }
    }
}

const RodCustomComponent = {
    onUse(event) {
        const player = event.source;
        const item = event.itemStack;
        if (!item)
            return;
        RodManager.onUseRod(player, item);
    }
};

const BucketPlaceComponent = {
    onUseOn(event) {
        const entity = event.source;
        const block = event.block;
        const blockFace = event.blockFace;
        event.itemStack;
        if (!(entity instanceof Player))
            return;
        const player = entity;
        if (block.dimension.id === Dimensions.Nether) {
            block.dimension.spawnParticle("minecraft:water_evaporation_bucket_emitter", VectorUtils.add(block.location, { y: 0.5 }));
            block.dimension.playSound(SoundEnums.StewFinish, block.location);
            return;
        }
        const blockLocation = BlockUtils.getPlacedBlockLocation(block, blockFace);
        block.dimension.setBlockPermutation(blockLocation, BlockPermutation.resolve("minecraft:flowing_water"));
        /* const fishName = item.typeId.replace("tm_aqc:bucket_", "");
        const fish = ALL_FISH_DATA[fishName]; */
        if (player.getGameMode() === GameMode.Survival)
            ItemUtils.giveItem(player, new ItemStack("minecraft:bucket", 1));
        block.dimension.playSound(SoundEnums.EmptyFishBucket, blockLocation, { volume: 2 });
        player.playSound(SoundEnums.EmptyFishBucket, { volume: 2 });
    }
};

const FishBlockComponent = {
    onPlayerBreak(event) {
        const block = event.block;
        const permutation = event.brokenBlockPermutation;
        const ID_1 = permutation.getState("tm_aqc:ID_1");
        const ID_2 = permutation.getState("tm_aqc:ID_2");
        const monstrous = permutation.getState("tm_aqc:monstrous");
        if (ID_1 == undefined || ID_2 == undefined || monstrous === undefined)
            return;
        const fish = FishUtils.getFishFromID([ID_1, ID_2]);
        if (fish == "")
            return;
        let fishID = fish;
        if (monstrous) {
            fishID = fish + "_monstrous";
        }
        let newITem = FishUtils.getFishBlockItem(block, fishID);
        ItemUtils.spawnItems(newITem, 1, VectorUtils.add(block.location, { x: 0.5, z: 0.5 }), block.dimension);
    },
    onPlayerInteract(event) {
        const block = event.block;
        const player = event.player;
        if (!player)
            return;
        const mainHand = PlayerUtils.getMainHandItem(player);
        if (mainHand !== undefined && mainHand.hasTag("tm_aqc:is_knife") && block.typeId === "tm_aqc:cutting_board") {
            filletKnife(player, mainHand, block);
            return;
        }
        const ID_1 = block.permutation.getState("tm_aqc:ID_1");
        const ID_2 = block.permutation.getState("tm_aqc:ID_2");
        const monstrous = block.permutation.getState("tm_aqc:monstrous");
        if (ID_1 == undefined || ID_2 == undefined || monstrous == undefined)
            return;
        if (ID_1 === 0 && ID_2 === 0)
            addFish(player, block);
        else
            fishDisplayText(player, ID_1, ID_2, block);
    }
};
function addFish(player, block) {
    const item = PlayerUtils.getMainHandItem(player);
    if (!item)
        return;
    const fishName = item.typeId.includes("monstrous") ? item.typeId.replace("_monstrous", "") : item.typeId;
    const fishID = FishUtils.getIDFromFish(fishName);
    if (!fishID)
        return;
    block.setPermutation(block.permutation
        .withState("tm_aqc:ID_1", fishID[0])
        .withState("tm_aqc:ID_2", fishID[1])
        .withState("tm_aqc:monstrous", item.typeId.includes("monstrous")));
    const weight = FishUtils.getWeightFromItem(item);
    if (weight > 0)
        BlockDataManager.setBlockData(block, DynamicPropertyEnum.FishWeight, weight);
    block.dimension.playSound(SoundEnums.PlaceFish, block.location, { volume: 1 });
    ItemUtils.reduceItemAmount(player, item, 1);
}
function fishDisplayText(player, ID_1, ID_2, block) {
    if (block.typeId !== "tm_aqc:fish_mount")
        return;
    const fishID = FishUtils.getFishFromID([ID_1, ID_2]);
    if (fishID == "")
        return;
    const message = {
        rawtext: [
            { translate: "tm_aqc.fish_mount.fish" },
            { text: " " },
            { translate: `entity.${fishID}.name` },
        ]
    };
    if (!message.rawtext) {
        message.rawtext = [];
    }
    const weight = BlockDataManager.getBlockData(block, DynamicPropertyEnum.FishWeight);
    if (weight !== undefined && weight > 0) {
        message.rawtext.push({ text: "\n" });
        message.rawtext.push({ translate: "tm_aqc.fish_mount.weight" });
        message.rawtext.push({ text: " " });
        message.rawtext.push({ text: `${weight}lb` });
    }
    player.onScreenDisplay.setActionBar(message);
}
function filletKnife(player, item, block) {
    const ID_1 = block.permutation.getState("tm_aqc:ID_1");
    const ID_2 = block.permutation.getState("tm_aqc:ID_2");
    if (ID_1 == undefined || ID_2 == undefined)
        return;
    if (ID_1 === 0 && ID_2 === 0)
        return;
    const fishData = FishUtils.getDataFromID([ID_1, ID_2]);
    if (!fishData) {
        const skeletonPreset = CuttingBoardSkeletonPresets[ID_2];
        if (skeletonPreset === undefined)
            throw new Error(`Cutting board skeleton preset not found for fish ID: ${ID_2}`);
        ItemUtils.giveItem(player, new ItemStack(skeletonPreset.typeID), getNeptuniumAmount(item));
        block.dimension.playSound(skeletonPreset.sound, block.location, { volume: 1, pitch: 1.5 });
        ItemUtils.damageItem(player, item, 1);
        block.setPermutation(block.permutation
            .withState("tm_aqc:ID_1", 0)
            .withState("tm_aqc:ID_2", 0));
        giveBonus(player, item, skeletonPreset);
        return;
    }
    const cuttingBoardPreset = fishData.cuttingBoardPreset;
    if (cuttingBoardPreset === undefined)
        throw new Error(`Cutting board preset not found for fish ID: ${fishData.id}`);
    giveBonus(player, item, cuttingBoardPreset);
    ItemUtils.giveItem(player, new ItemStack(cuttingBoardPreset.typeID), getNeptuniumAmount(item));
    ItemUtils.damageItem(player, item, 1);
    block.dimension.playSound(cuttingBoardPreset.sound, block.location, { volume: 1, pitch: 1.2 });
    block.setPermutation(block.permutation
        .withState("tm_aqc:ID_1", 0)
        .withState("tm_aqc:ID_2", fishData.skeletonModel));
}
function getNeptuniumAmount(item) {
    if (item.typeId !== "tm_aqc:neptunium_fillet_knife")
        return 1;
    return MathUtils.randomInt(0, 1) == 0 ? 1 : 2;
}
function giveBonus(player, item, cuttingBoardPreset) {
    if (cuttingBoardPreset.bonus === undefined)
        return;
    const bonus = cuttingBoardPreset.bonus;
    if (!MathUtils.isChance(bonus.chance))
        return;
    ItemUtils.giveItem(player, new ItemStack(bonus.typeID), getNeptuniumAmount(item));
}

class HopperUtils {
    static getItemFromHopper(hopper, components) {
        const inventoryComponent = hopper.getComponent(BlockComponentTypes.Inventory);
        if (!inventoryComponent)
            return undefined;
        const container = inventoryComponent.container;
        if (!container)
            return undefined;
        let item;
        let slot = 0;
        for (let i = 0; i < container.size; i++) {
            slot = i;
            item = container.getItem(i);
            if (components) {
                let hasAllComponents = false;
                for (const component of components) {
                    if (item && item.hasComponent(component))
                        hasAllComponents = true;
                    else {
                        hasAllComponents = false;
                        break;
                    }
                }
                if (item && hasAllComponents)
                    break;
            }
            if (item)
                break;
        }
        if (!item)
            return undefined;
        return { itemStack: item, slot: slot };
    }
    static removeItemFromHopper(hopper, hopperItem) {
        if (hopper.typeId !== "minecraft:hopper")
            return;
        const inventoryComponent = hopper.getComponent(BlockComponentTypes.Inventory);
        if (!inventoryComponent)
            return;
        const container = inventoryComponent.container;
        if (!container)
            return;
        const item = container.getItem(hopperItem.slot);
        if (!item)
            return;
        if (item.typeId !== hopperItem.itemStack.typeId)
            return;
        if (item.amount > 1) {
            item.amount -= 1;
            container.setItem(hopperItem.slot, item);
        }
        else {
            container.setItem(hopperItem.slot, undefined);
        }
    }
}

const WormFarmComponent = {
    onPlayerInteract(event) {
        const player = event.player;
        const block = event.block;
        if (!player)
            return;
        const fillLevel = block.permutation.getState("tm_aqc:fill_level");
        if (fillLevel === undefined)
            return;
        if (fillLevel >= 8) {
            if (world.gameRules.doTileDrops)
                ItemUtils.spawnItems(getWorm(), 1, VectorUtils.add(block.location, { x: 0.5, y: 1, z: 0.5 }), block.dimension);
            block.dimension.playSound("block.composter.empty", block.location, { volume: 1, pitch: 1 });
            block.setPermutation(block.permutation.withState("tm_aqc:fill_level", 0));
            return;
        }
        const item = PlayerUtils.getMainHandItem(player);
        if (!item)
            return;
        if (fillLevel == 7)
            return;
        const isFilled = fillFarm(block, item);
        if (!isFilled)
            return;
        ItemUtils.reduceItemAmount(player, item, 1);
    },
    onTick(event) {
        const block = event.block;
        const fillLevel = block.permutation.getState("tm_aqc:fill_level");
        if (fillLevel === undefined)
            return;
        if (fillLevel >= 8)
            return;
        if (fillLevel === 7) {
            const random = MathUtils.randomInt(0, 3);
            if (random !== 0)
                return;
            block.dimension.playSound("block.composter.ready", block.location, { volume: 1, pitch: 1 });
            block.setPermutation(block.permutation.withState("tm_aqc:fill_level", 8));
            playParticle(block);
            const bottomBlock = block.offset({ x: 0, y: -1, z: 0 });
            let addedToHopper = false;
            if (bottomBlock && bottomBlock.typeId === "minecraft:hopper") {
                addedToHopper = bottomHopper(bottomBlock);
            }
            if (addedToHopper) {
                block.dimension.playSound("block.composter.empty", block.location, { volume: 1, pitch: 1 });
                block.setPermutation(block.permutation.withState("tm_aqc:fill_level", 0));
                return;
            }
        }
        const topBlock = block.offset({ x: 0, y: 1, z: 0 });
        if (topBlock && topBlock.typeId === "minecraft:hopper" && topBlock.permutation.getState("facing_direction") === 0)
            topHopper(topBlock, block);
    }
};
function playParticle(block) {
    block.dimension.spawnParticle("minecraft:crop_growth_emitter", VectorUtils.add(block.location, { x: 0.5, y: 0.5, z: 0.5 }));
}
function fillFarm(block, item) {
    const fillLevel = block.permutation.getState("tm_aqc:fill_level");
    if (fillLevel === undefined)
        return false;
    if (fillLevel >= 8)
        return false;
    const compostComponent = item.getComponent(ItemComponentTypes.Compostable);
    if (!compostComponent)
        return false;
    playParticle(block);
    const chance = compostComponent.compostingChance;
    const random = MathUtils.randomInt(0, 100);
    if (random > chance) {
        block.dimension.playSound("item.bone_meal.use", block.location, { volume: 1.0, pitch: MathUtils.randomFloat(0.9, 1.1) });
        return true;
    }
    block.setPermutation(block.permutation.withState("tm_aqc:fill_level", fillLevel + 1));
    block.dimension.playSound("block.composter.fill", block.location, { volume: 1.3, pitch: 1 });
    return true;
}
function topHopper(block, farmBlock) {
    const hopperItem = HopperUtils.getItemFromHopper(block, ["minecraft:compostable"]);
    if (!hopperItem)
        return;
    const isFilled = fillFarm(farmBlock, hopperItem.itemStack);
    if (!isFilled)
        return;
    HopperUtils.removeItemFromHopper(block, hopperItem);
}
function bottomHopper(block) {
    if (block.typeId !== "minecraft:hopper")
        return false;
    const inventoryComponent = block.getComponent(BlockComponentTypes.Inventory);
    if (!inventoryComponent)
        return false;
    const container = inventoryComponent.container;
    if (!container)
        return false;
    const item = container.addItem(getWorm());
    if (!item)
        return true;
    return false;
}
function getWorm() {
    if (MathUtils.isChance(5))
        return new ItemStack("tm_aqc:gold_worm", 1);
    return new ItemStack("tm_aqc:worm", 1);
}

const SonarComponent = {
    onUse(event) {
        event.itemStack;
        const player = event.source;
        if (!player.isInWater) {
            player.sendMessage({ translate: "tm_aqc.message.sonar.error" });
            return;
        }
        player.dimension.playSound(SoundEnums.Sonar, player.location, { volume: 2, pitch: MathUtils.randomFloat(0.9, 1.1) });
        player.dimension.spawnParticle("tm_aqc:sonar", VectorUtils.add(player.location, { x: 0.5, y: 0.5, z: 0.5 }));
        system.runTimeout(() => {
            const fish = player.dimension.getEntities({ families: ["tm_aqc_fish"], location: player.location, maxDistance: 40 });
            for (const entity of fish) {
                entity.triggerEvent("tm_aqc:outline");
            }
        }, 5);
    }
};

class ModStationManager {
    static addRod(item, block, player) {
        const direction = block.permutation.getState("minecraft:cardinal_direction") ?? "north";
        let rotation = 0;
        switch (direction) {
            case "east":
                rotation = 90;
                break;
            case "south":
                rotation = 180;
                break;
            case "west":
                rotation = -90;
                break;
        }
        const table = block.dimension.spawnEntity("tm_aqc:modification_station_entity", VectorUtils.add(block.location, { x: 0.5, y: 0, z: 0.5 }));
        table.setDynamicProperty(DynamicPropertyEnum.ModBlock, VectorUtils.toString(block.location));
        table.setProperty(ActorPropertiesEnum.Rot, rotation);
        const rodNumber = RodUtils.getRodNumber(item.typeId);
        table.setProperty(ActorPropertiesEnum.Rod, rodNumber);
        const savedBobber = item.getDynamicProperty(DynamicPropertyEnum.Bobber) ?? "default";
        const savedHook = item.getDynamicProperty(DynamicPropertyEnum.Hook) ?? "default";
        const bobberNumber = RodUtils.getBobberNumber(savedBobber);
        const bobberColour = item.getDynamicProperty(DynamicPropertyEnum.Colour) ?? 0;
        const hookNumber = RodUtils.getHookNumber(savedHook);
        table.setProperty(ActorPropertiesEnum.Colour, bobberColour);
        table.setProperty(ActorPropertiesEnum.Bobber, bobberNumber);
        table.setProperty(ActorPropertiesEnum.Hook, hookNumber);
        this.setRod(table, item);
        PlayerUtils.setMainHandItem(player, undefined);
        table.dimension.playSound(SoundEnums.ModStationPlace, table.location, { volume: 1 });
    }
    static getTable(location, dimension) {
        const entities = dimension.getEntitiesAtBlockLocation(location);
        if (!entities)
            return;
        for (const entity of entities) {
            if (entity.typeId !== "tm_aqc:modification_station_entity")
                continue;
            const modBlock = entity.getDynamicProperty(DynamicPropertyEnum.ModBlock);
            if (!modBlock)
                continue;
            if (VectorUtils.toString(location) !== modBlock)
                continue;
            return entity;
        }
        return;
    }
    static getRod(table) {
        const inventory = table.getComponent(EntityComponentTypes.Inventory);
        if (!inventory)
            return;
        const container = inventory.container;
        if (!container)
            return;
        return container.getItem(0);
    }
    static getBobber(table) {
        const inventory = table.getComponent(EntityComponentTypes.Inventory);
        if (!inventory)
            return;
        const container = inventory.container;
        if (!container)
            return;
        return container.getItem(1);
    }
    static setRod(table, item) {
        const inventory = table.getComponent(EntityComponentTypes.Inventory);
        if (!inventory)
            return;
        const container = inventory.container;
        if (!container)
            return;
        container.setItem(0, item);
    }
    static addBobber(item, block, player) {
        const table = this.getTable(block.location, block.dimension);
        if (!table)
            return;
        const currentBobber = table.getProperty(ActorPropertiesEnum.Bobber) ?? 0;
        if (currentBobber !== 0)
            this.dropBobber(table);
        const rod = this.getRod(table);
        if (!rod)
            return;
        const bobberNumber = RodUtils.getBobberNumber(item.typeId);
        if (bobberNumber === 0)
            return;
        rod.setDynamicProperty(DynamicPropertyEnum.Bobber, item.typeId);
        const bobberColour = BobberUtils.getBobberColour(item.typeId);
        rod.setDynamicProperty(DynamicPropertyEnum.Colour, bobberColour);
        table.setProperty(ActorPropertiesEnum.Colour, bobberColour);
        table.setProperty(ActorPropertiesEnum.Bobber, bobberNumber);
        const lore = RodUtils.getUpdatedLore(rod);
        rod.setLore(lore);
        this.setRod(table, rod);
        PlayerUtils.setMainHandItem(player, undefined);
        table.dimension.playSound(SoundEnums.ModStationPlace, table.location, { volume: 1 });
    }
    static addHook(item, block, player) {
        const table = this.getTable(block.location, block.dimension);
        if (!table)
            return;
        const currentHook = table.getProperty(ActorPropertiesEnum.Hook) ?? 0;
        if (currentHook !== 0)
            this.dropHook(table);
        const rod = this.getRod(table);
        if (!rod)
            return;
        const hookNumber = RodUtils.getHookNumber(item.typeId);
        if (hookNumber === 0)
            return;
        rod.setDynamicProperty(DynamicPropertyEnum.Hook, item.typeId);
        table.setProperty(ActorPropertiesEnum.Hook, hookNumber);
        const lore = RodUtils.getUpdatedLore(rod);
        rod.setLore(lore);
        this.setRod(table, rod);
        PlayerUtils.setMainHandItem(player, undefined);
        table.dimension.playSound(SoundEnums.ModStationPlace, table.location, { volume: 1 });
    }
    static async interact(block, player) {
        const table = this.getTable(block.location, block.dimension);
        if (!table)
            return;
        const rod = this.getRod(table);
        if (!rod)
            return;
        const hook = table.getProperty(ActorPropertiesEnum.Hook) ?? 0;
        const bobber = table.getProperty(ActorPropertiesEnum.Bobber) ?? 0;
        const hookName = RodUtils.getHookFromNumber(hook);
        const bobberName = RodUtils.getBobberFromNumber(bobber);
        const bobberColour = table.getProperty(ActorPropertiesEnum.Colour) ?? 0;
        let form = new ActionFormData();
        form.title({ translate: "tm_aqc.form.modStation.title" });
        const colour = bobberColour === -1 ? "" : `_${BobberUtils.getBobberColourFromNumber(bobberColour)}`;
        const bobberNameCheck = bobberName === "tm_aqc:potato_bobber" ? "tm_aqc:potato_bobber" : `${bobberName}${colour}`;
        let formBody = {
            rawtext: [
                { translate: `tm_aqc.form.modStation.rod` },
                { text: ' ' },
                { translate: `item.${rod.typeId}.name` },
                { text: '\n\n' },
                { translate: `tm_aqc.form.modStation.bobber` },
                { text: ' ' },
                { translate: bobberName === "default" ? `tm_aqc.form.default` : `item.${bobberNameCheck}.name` },
                { text: '\n\n' },
                { translate: `tm_aqc.form.modStation.hook` },
                { text: ' ' },
                { translate: hookName === "default" ? `tm_aqc.form.default` : `item.${hookName}.name` },
                { text: '\n\n' },
            ]
        };
        form.body(formBody);
        const rodTextures = [
            ["tm_aqc:iron_fishing_rod", "iron_fishing_rod_cast"],
            ["tm_aqc:gold_fishing_rod", "gold_fishing_rod_cast"],
            ["tm_aqc:diamond_fishing_rod", "diamond_fishing_rod_cast"],
            ["tm_aqc:netherite_fishing_rod", "netherite_fishing_rod_cast"],
            ["tm_aqc:neptunium_fishing_rod", "neptunium_fishing_rod_cast"],
        ];
        const buttons = [];
        form.button({ translate: `tm_aqc.form.modStation.button.pickupRod` }, `textures/tm/aqc/items/tools/${rodTextures.find(([key]) => key === rod.typeId)?.[1] ?? ""}`);
        buttons.push("pickupRod");
        if (bobberName !== "default") {
            const bobberTexture = bobberName === "tm_aqc:potato_bobber"
                ? "potato"
                : `${bobberName.split(":")[1].split("_")[0]}/${colour.slice(1)}`;
            form.button({ translate: `tm_aqc.form.modStation.button.remove.bobber` }, `textures/tm/aqc/items/bobber/${bobberTexture}`);
            buttons.push("pickupBobber");
        }
        if (hookName !== "default") {
            const hookTexture = hookName.split("_hook")[0].split(":")[1];
            form.button({ translate: `tm_aqc.form.modStation.button.remove.hook` }, `textures/tm/aqc/items/hooks/${hookTexture}`);
            buttons.push("pickupHook");
        }
        const result = await form.show(player);
        if (!result)
            return;
        if (result.canceled)
            return;
        if (result.selection === undefined)
            return;
        const selection = buttons[result.selection];
        if (selection === "pickupRod") {
            this.dropRod(table, player);
            table.remove();
            return;
        }
        if (selection === "pickupBobber") {
            this.dropBobber(table, player);
            table.setProperty(ActorPropertiesEnum.Bobber, 0);
            rod.setDynamicProperty(DynamicPropertyEnum.Bobber, undefined);
            const updatedLore = RodUtils.getUpdatedLore(rod);
            rod.setLore(updatedLore);
            this.setRod(table, rod);
            return;
        }
        if (selection === "pickupHook") {
            this.dropHook(table, player);
            table.setProperty(ActorPropertiesEnum.Hook, 0);
            rod.setDynamicProperty(DynamicPropertyEnum.Hook, undefined);
            const updatedLore = RodUtils.getUpdatedLore(rod);
            rod.setLore(updatedLore);
            this.setRod(table, rod);
            return;
        }
    }
    static dropItems(table) {
        this.dropRod(table);
        this.dropBobber(table);
        this.dropHook(table);
    }
    static dropRod(table, player = undefined) {
        const rod = this.getRod(table);
        if (!rod)
            return;
        if (player)
            ItemUtils.giveItem(player, rod, 1);
        else
            ItemUtils.spawnItems(rod, 1, table.location, table.dimension);
        table.dimension.playSound(SoundEnums.Pop, table.location, { volume: 1 });
    }
    static dropBobber(table, player = undefined) {
        const bobber = table.getProperty(ActorPropertiesEnum.Bobber) ?? 0;
        const bobberColour = table.getProperty(ActorPropertiesEnum.Colour) ?? 0;
        const bobberName = RodUtils.getBobberFromNumber(bobber);
        const colour = bobberColour === -1 ? "" : `_${BobberUtils.getBobberColourFromNumber(bobberColour)}`;
        if (bobberName === "default")
            return;
        const bobbertem = new ItemStack(`${bobberName}${colour}`, 1);
        if (player)
            ItemUtils.giveItem(player, bobbertem, 1);
        else
            ItemUtils.spawnItems(bobbertem, 1, table.location, table.dimension);
        table.dimension.playSound(SoundEnums.Pop, table.location, { volume: 1 });
    }
    static dropHook(table, player = undefined) {
        const hook = table.getProperty(ActorPropertiesEnum.Hook) ?? 0;
        const hookName = RodUtils.getHookFromNumber(hook);
        if (hookName === "default")
            return;
        const hookItem = new ItemStack(hookName, 1);
        if (player)
            ItemUtils.giveItem(player, hookItem, 1);
        else
            ItemUtils.spawnItems(hookItem, 1, table.location, table.dimension);
        table.dimension.playSound(SoundEnums.Pop, table.location, { volume: 1 });
    }
}

const ModificationStationComponent = {
    onPlayerInteract(event) {
        const player = event.player;
        const block = event.block;
        const faceLocation = event.faceLocation;
        if (!player)
            return;
        const item = PlayerUtils.getMainHandItem(player);
        if (!item && faceLocation !== undefined) {
            ModStationManager.interact(block, player);
            return;
        }
        if (!item)
            return;
        if (item.hasTag("tm_aqc:rod") && ModStationManager.getTable(block.location, block.dimension) === undefined) {
            ModStationManager.addRod(item, block, player);
            return;
        }
        if (item.hasTag("tm_aqc:bobber") && ModStationManager.getTable(block.location, block.dimension) !== undefined) {
            ModStationManager.addBobber(item, block, player);
            return;
        }
        if (item.hasTag("tm_aqc:hook") && ModStationManager.getTable(block.location, block.dimension) !== undefined) {
            ModStationManager.addHook(item, block, player);
            return;
        }
    },
    onPlayerBreak(event) {
        const block = event.block;
        const dimension = block.dimension;
        const table = ModStationManager.getTable(block.location, dimension);
        if (!table)
            return;
        ModStationManager.dropRod(table, event.player);
        table.remove();
    }
};

class HarpoonManager {
    static init() {
        system.runInterval(() => {
            const players = world.getAllPlayers().filter(player => this.hasCast(player));
            for (const player of players) {
                this.handleLine(player);
            }
        }, 1);
    }
    static onUseHarpoon(player, item) {
        const hasCast = this.hasCast(player);
        if (hasCast)
            this.uncast(player, item);
        else
            this.cast(player, item);
    }
    static cast(player, item) {
        if (!player.isInWater)
            return;
        const raycast = player.getEntitiesFromViewDirection({ maxDistance: 10, includeLiquidBlocks: false, families: ["tm_aqc_fish"] });
        if (raycast === undefined || raycast.length == 0) {
            this.failedCast(player, item);
            return;
        }
        let hit = raycast[0];
        for (const fish of raycast) {
            if (fish !== undefined) {
                hit = fish;
                break;
            }
        }
        if (hit === undefined) {
            this.failedCast(player, item);
            return;
        }
        //player.setDynamicProperty(DynamicPropertyEnum.HasCastHarpoon, true);
        player.playAnimation("animation.tm_aqc.rod.set_cast");
        player.playSound(SoundEnums.HarpoonCast);
        const entity = hit.entity;
        const location = entity.location;
        const harpoonEntity = entity.dimension.spawnEntity("tm_aqc:harpoon_entity", location);
        if (harpoonEntity === undefined)
            return;
        const rideable = harpoonEntity.getComponent(EntityComponentTypes.Rideable);
        if (rideable === undefined)
            return;
        rideable.addRider(entity);
        const leashComponents = harpoonEntity.getComponent(EntityComponentTypes.Leashable);
        if (!leashComponents)
            return;
        leashComponents.leashTo(player);
        player.setDynamicProperty(DynamicPropertyEnum.HarpoonID, harpoonEntity.id);
        harpoonEntity.setDynamicProperty(DynamicPropertyEnum.HarpoonPlayerID, player.id);
        player.dimension.spawnParticle("tm_aqc:harpoon_bubbles", VectorUtils.add(player.location, { y: 1 }));
        const isFishUnlocked = FishCatalogeManager.isFishUnlocked(entity.typeId, player);
        if (!isFishUnlocked)
            FishCatalogeManager.unlockFish(entity.typeId, player);
    }
    static failedCast(player, item) {
        //player.setDynamicProperty(DynamicPropertyEnum.HasCastHarpoon, undefined);
        player.playAnimation("animation.tm_aqc.rod.set_uncast");
        player.playAnimation("animation.tm_aqc.rod.first_person_use");
        const harpoon = this.getPlayerHarpoon(player);
        if (harpoon === undefined)
            return;
        CatchUtils.removeLeash(harpoon);
        harpoon.remove();
    }
    static uncast(player, item) {
        const harpoon = this.getPlayerHarpoon(player);
        if (harpoon === undefined)
            return;
        player.setDynamicProperty(DynamicPropertyEnum.HarpoonID, undefined);
        harpoon.dimension;
        harpoon.location;
        const rideable = harpoon.getComponent(EntityComponentTypes.Rideable);
        if (rideable === undefined)
            return;
        const rider = rideable.getRiders()[0];
        if (rider === undefined)
            return;
        rider.teleport(VectorUtils.add(player.location, { x: 0, y: 1, z: 0 }));
        CatchUtils.removeLeash(harpoon);
        harpoon.remove();
        //player.setDynamicProperty(DynamicPropertyEnum.HasCastHarpoon, undefined);
        player.playAnimation("animation.tm_aqc.rod.set_uncast");
        ItemUtils.damageItem(player, item, 1);
        system.runTimeout(() => {
            rider.applyDamage(100, { damagingEntity: player, cause: EntityDamageCause.entityAttack });
        }, 5);
    }
    static removeCast(player) {
        //player.setDynamicProperty(DynamicPropertyEnum.HasCastHarpoon, undefined);
        const harpoon = this.getPlayerHarpoon(player);
        if (harpoon === undefined || !player)
            return;
        player.playAnimation("animation.tm_aqc.rod.set_uncast");
        CatchUtils.removeLeash(harpoon);
        harpoon.remove();
    }
    static hasCast(player) {
        return this.getPlayerHarpoon(player) !== undefined;
        //return player.getDynamicProperty(DynamicPropertyEnum.HasCastHarpoon) as boolean ?? false;
    }
    static harpoonDespawn(entity) {
        const ID = entity.getDynamicProperty(DynamicPropertyEnum.HarpoonPlayerID) ?? undefined;
        if (!ID)
            return;
        const playerEntity = world.getEntity(ID);
        if (!playerEntity)
            return;
        if (!(playerEntity instanceof Player))
            return;
        const player = playerEntity;
        //player.setDynamicProperty(DynamicPropertyEnum.HasCastHarpoon, undefined);
        player.playAnimation("animation.tm_aqc.rod.set_uncast");
        player.setDynamicProperty(DynamicPropertyEnum.HarpoonID, undefined);
        CatchUtils.removeLeash(entity);
        entity.remove();
    }
    static handleLine(player) {
        player.playAnimation(`animation.tm_aqc.line.hold.harpoon`);
    }
    static getPlayerHarpoon(player) {
        const harpoonID = player.getDynamicProperty(DynamicPropertyEnum.HarpoonID) ?? undefined;
        if (!harpoonID)
            return;
        const harpoon = world.getEntity(harpoonID);
        return harpoon;
    }
}

const HarpoonComponent = {
    onUse(event) {
        const player = event.source;
        const item = event.itemStack;
        if (!item)
            return;
        HarpoonManager.onUseHarpoon(player, item);
    }
};

const FoodEffectsData = {
    "tm_aqc:green_juice": {
        effects: [
            { type: "minecraft:hunger", duration: 300 },
            { type: "minecraft:speed", duration: 300 }
        ]
    },
    "tm_aqc:green_juice_bucket": {
        effects: [
            { type: "minecraft:hunger", duration: 900 },
            { type: "minecraft:speed", duration: 900 }
        ]
    }
};

const FoodEffectsComponent = {
    onConsume(event) {
        const entity = event.source;
        const item = event.itemStack;
        if (!(entity instanceof Player))
            return;
        const player = entity;
        const data = FoodEffectsData[item.typeId];
        if (!data)
            return;
        const effects = data.effects;
        if (effects.length === 0)
            return;
        for (const effect of effects) {
            const duration = effect.duration * TicksPerSecond;
            if (effect.options)
                player.addEffect(effect.type, duration, effect.options);
            else
                player.addEffect(effect.type, duration);
        }
    }
};

const LiquidStates = {
    "0:0": "water",
    "0:1": "milk",
    "0:2": "lava",
    "0:3": "ingredients_1",
    "0:4": "ingredients_2",
    "1:0": "stew1",
    "1:1": "stew2",
    "1:2": "stew3",
    "1:3": "stew4",
    "1:4": "stew5",
    "2:0": "stew6",
    "2:1": "stew7",
    "2:2": "stew8",
};
const StewPotRecipes = {
    "tm_aqc:garbage_goulash": {
        ID: [1, 0],
        liquid: "null",
        ingredient_1: "null",
        ingredient_2: "null",
        ingredient_3: "null"
    },
    "tm_aqc:stone_soup": {
        ID: [1, 1],
        liquid: "minecraft:water_bucket",
        ingredient_1: "minecraft:cobblestone",
        ingredient_2: "minecraft:potato",
        ingredient_3: "minecraft:carrot"
    },
    "tm_aqc:fish_chowder": {
        ID: [1, 2],
        liquid: "minecraft:milk_bucket",
        ingredient_1: "tm_aqc:raw_fillet",
        ingredient_2: "minecraft:potato",
        ingredient_3: "minecraft:carrot"
    },
    "tm_aqc:clam_chowder": {
        ID: [1, 3],
        liquid: "minecraft:milk_bucket",
        ingredient_1: "tm_aqc:raw_clam",
        ingredient_2: "minecraft:potato",
        ingredient_3: "minecraft:carrot"
    },
    "tm_aqc:green_juice": {
        ID: [1, 4],
        liquid: "minecraft:water_bucket",
        ingredient_1: "tm_aqc:algae",
        ingredient_2: "tm_aqc:algae",
        ingredient_3: "tm_aqc:algae"
    },
    "tm_aqc:gumbo": {
        ID: [2, 0],
        liquid: "minecraft:water_bucket",
        ingredient_1: "tm_aqc:raw_shrimp",
        ingredient_2: "minecraft:porkchop",
        ingredient_3: "minecraft:wheat"
    },
    "tm_aqc:super_mushroom_stew": {
        ID: [2, 1],
        liquid: "minecraft:water_bucket",
        ingredient_1: "minecraft:red_mushroom",
        ingredient_2: "minecraft:brown_mushroom",
        ingredient_3: "minecraft:mushroom_stem"
    },
    "tm_aqc:lobster_bisque": {
        ID: [2, 2],
        liquid: "minecraft:milk_bucket",
        ingredient_1: "tm_aqc:raw_lobster",
        ingredient_2: "minecraft:carrot",
        ingredient_3: "minecraft:carrot"
    }
};

class StewPotManager {
    static addLiquid(pot, item, player) {
        if (item.typeId !== "minecraft:water_bucket" && item.typeId !== "minecraft:milk_bucket")
            return;
        const cookingState = pot.permutation.getState("tm_aqc:cooking_state");
        const liquidState1 = pot.permutation.getState("tm_aqc:liquid_1");
        const liquidState2 = pot.permutation.getState("tm_aqc:liquid_2");
        const liquidState = LiquidStates[`${liquidState1}:${liquidState2}`];
        let canAddLiquid = false;
        if (cookingState === "empty")
            canAddLiquid = true;
        else if (cookingState === "level_3" && !liquidState.includes("stew"))
            canAddLiquid = true;
        if (!canAddLiquid)
            return;
        let liquid = item.typeId === "minecraft:water_bucket" ? 0 : 1;
        pot.setPermutation(pot.permutation
            .withState("tm_aqc:cooking_state", "level_3")
            .withState("tm_aqc:liquid_1", 0)
            .withState("tm_aqc:liquid_2", liquid));
        pot.dimension.playSound(SoundEnums.FillCauldron, pot.location, { volume: 1, pitch: 1 });
        PlayerUtils.reduceMainHandItem(player, 1);
        ItemUtils.giveItem(player, new ItemStack("minecraft:bucket", 1));
    }
    static addIngredient(pot, item, player) {
        const cookingState = pot.permutation.getState("tm_aqc:cooking_state");
        const liquidState1 = pot.permutation.getState("tm_aqc:liquid_1");
        const liquidState2 = pot.permutation.getState("tm_aqc:liquid_2");
        const liquidState = LiquidStates[`${liquidState1}:${liquidState2}`];
        if (cookingState !== "level_3" && liquidState.includes("stew"))
            return;
        let data = this.getStewPot(pot);
        if (data === undefined) {
            data = {
                ID: [0, 0],
                liquid: liquidState === "water" ? "minecraft:water_bucket" : "minecraft:milk_bucket",
                ingredient_1: "",
                ingredient_2: "",
                ingredient_3: ""
            };
        }
        let ingredient = item.typeId;
        if (data.ingredient_1 === "")
            data.ingredient_1 = ingredient;
        else if (data.ingredient_2 === "")
            data.ingredient_2 = ingredient;
        else if (data.ingredient_3 === "")
            data.ingredient_3 = ingredient;
        pot.setPermutation(pot.permutation
            .withState("tm_aqc:cooking_state", "level_3")
            .withState("tm_aqc:liquid_1", 0)
            .withState("tm_aqc:liquid_2", data.ingredient_2 === "" ? 3 : 4));
        this.saveStewPot(pot, data);
        PlayerUtils.reduceMainHandItem(player, 1);
        pot.dimension.playSound(SoundEnums.Pop, pot.location, { volume: 1, pitch: 1 });
        if (data.ingredient_3 !== "")
            this.startCooking(pot, data);
    }
    static takeStew(pot, item, player) {
        const cookingState = pot.permutation.getState("tm_aqc:cooking_state");
        const liquidState1 = pot.permutation.getState("tm_aqc:liquid_1");
        const liquidState2 = pot.permutation.getState("tm_aqc:liquid_2");
        const liquidState = LiquidStates[`${liquidState1}:${liquidState2}`];
        if ((cookingState !== "level_3" && cookingState !== "level_2" && cookingState !== "level_1") && !liquidState.includes("stew"))
            return;
        if (item.typeId !== "minecraft:bowl" && item.typeId !== "minecraft:bucket")
            return;
        let stewTypeId = this.getStewTypeFromID([liquidState1, liquidState2]);
        if (item.typeId === "minecraft:bucket") {
            stewTypeId = `${stewTypeId}_bucket`;
        }
        if (!stewTypeId)
            return;
        ItemUtils.giveItem(player, new ItemStack(stewTypeId, 1));
        PlayerUtils.reduceMainHandItem(player, 1);
        pot.dimension.playSound(SoundEnums.TakeStew, pot.location, { volume: 1, pitch: 1 });
        if (item.typeId === "minecraft:bucket") {
            pot.setPermutation(pot.permutation
                .withState("tm_aqc:cooking_state", "empty"));
            return;
        }
        const newCookingState = cookingState === "level_3" ? "level_2" : cookingState === "level_2" ? "level_1" : "empty";
        pot.setPermutation(pot.permutation
            .withState("tm_aqc:cooking_state", newCookingState));
    }
    static getRecipeResult(currentRecipe) {
        const recipe = Object.entries(StewPotRecipes).find(([_, value]) => this.isCorrectRecipe(value, currentRecipe));
        if (!recipe)
            return undefined;
        return recipe[0];
    }
    static startCooking(pot, data) {
        const underBlock = pot.below(1);
        const recipe = this.getRecipeResult(data);
        let IDs = [1, 0];
        const recipeData = StewPotRecipes[recipe];
        if (recipeData !== undefined) {
            IDs = recipeData.ID;
        }
        this.removeStewPot(pot);
        if (!underBlock) {
            pot.setPermutation(pot.permutation
                .withState("tm_aqc:cooking_state", "not_cooking")
                .withState("tm_aqc:liquid_1", IDs[0])
                .withState("tm_aqc:liquid_2", IDs[1]));
        }
        else {
            pot.setPermutation(pot.permutation
                .withState("tm_aqc:cooking_state", "cooking")
                .withState("tm_aqc:liquid_1", IDs[0])
                .withState("tm_aqc:liquid_2", IDs[1]));
        }
    }
    static saveStewPot(pot, recipe) {
        world.setDynamicProperty(this.getDataID(pot), JSON.stringify(recipe));
    }
    static removeStewPot(pot) {
        world.setDynamicProperty(this.getDataID(pot), undefined);
    }
    static getStewPot(pot) {
        const data = world.getDynamicProperty(this.getDataID(pot));
        if (!data)
            return undefined;
        return JSON.parse(data);
    }
    static isCorrectRecipe(recipe, currentRecipe) {
        if (recipe.liquid !== currentRecipe.liquid)
            return false;
        const recipeIngredients = [recipe.ingredient_1, recipe.ingredient_2, recipe.ingredient_3];
        const currentRecipeIngredients = [currentRecipe.ingredient_1, currentRecipe.ingredient_2, currentRecipe.ingredient_3];
        recipeIngredients.sort();
        currentRecipeIngredients.sort();
        return recipeIngredients.every((ingredient, index) => ingredient === currentRecipeIngredients[index]);
    }
    static getDataID(pot) {
        return `${pot.dimension.id}:${pot.location.x},${pot.location.y},${pot.location.z}`;
    }
    static getStewFromID(id) {
        const entry = Object.entries(StewPotRecipes).find(([, r]) => r.ID[0] === id[0] && r.ID[1] === id[1]);
        if (!entry)
            return undefined;
        const recipe = entry[1];
        return recipe;
    }
    static getStewTypeFromID(id) {
        const entry = Object.entries(StewPotRecipes).find(([, r]) => r.ID[0] === id[0] && r.ID[1] === id[1]);
        if (!entry)
            return undefined;
        const key = entry[0];
        return key;
    }
}

const StewPotComponent = {
    onPlayerInteract(event) {
        const block = event.block;
        const player = event.player;
        if (!player)
            return;
        const item = PlayerUtils.getMainHandItem(player);
        if (!item)
            return;
        const cookingState = block.permutation.getState("tm_aqc:cooking_state");
        const liquidState1 = block.permutation.getState("tm_aqc:liquid_1");
        const liquidState2 = block.permutation.getState("tm_aqc:liquid_2");
        const liquidState = LiquidStates[`${liquidState1}:${liquidState2}`];
        if (cookingState === "cooking" || cookingState === "not_cooking")
            return;
        if (item.typeId === "minecraft:water_bucket" || item.typeId === "minecraft:milk_bucket") {
            StewPotManager.addLiquid(block, item, player);
            return;
        }
        if (cookingState === "empty")
            return;
        if (liquidState.includes("stew")) {
            StewPotManager.takeStew(block, item, player);
            return;
        }
        const allowedItemTags = [
            "minecraft:is_food",
            "minecraft:is_fish",
            "minecraft:is_meat",
            "minecraft:is_fish",
            "tm_aqc:can_stewpot",
        ];
        const ingredients = [];
        const recipes = Object.entries(StewPotRecipes);
        for (const recipe of recipes) {
            const ingredient_1 = recipe[1].ingredient_1;
            const ingredient_2 = recipe[1].ingredient_2;
            const ingredient_3 = recipe[1].ingredient_3;
            if (ingredient_1 !== "null" && !ingredients.includes(ingredient_1))
                ingredients.push(ingredient_1);
            if (ingredient_2 !== "null" && !ingredients.includes(ingredient_2))
                ingredients.push(ingredient_2);
            if (ingredient_3 !== "null" && !ingredients.includes(ingredient_3))
                ingredients.push(ingredient_3);
        }
        const itemTags = item.getTags();
        const isAllowedItem = itemTags.some(tag => allowedItemTags.includes(tag)) || ingredients.includes(item.typeId);
        if (!isAllowedItem)
            return;
        StewPotManager.addIngredient(block, item, player);
    }
};
const StewPotCookingComponent = {
    onTick(event) {
        const block = event.block;
        const cookingState = block.permutation.getState("tm_aqc:cooking_state");
        const belowBlock = block.below(1);
        if (!belowBlock)
            return;
        let canCook = false;
        if (belowBlock.typeId === "minecraft:fire")
            canCook = true;
        if (belowBlock.typeId === "minecraft:campfire" || belowBlock.typeId === "minecraft:soul_campfire") {
            const exstiguishState = belowBlock.permutation.getState("extinguished");
            canCook = exstiguishState !== undefined ? !exstiguishState : false;
        }
        if (!canCook && cookingState === "cooking") {
            block.setPermutation(block.permutation
                .withState("tm_aqc:cooking_state", "not_cooking"));
            return;
        }
        if (!canCook)
            return;
        if (canCook && cookingState === "not_cooking") {
            block.setPermutation(block.permutation
                .withState("tm_aqc:cooking_state", "cooking"));
            return;
        }
        const cookTime = block.permutation.getState("tm_aqc:cook_time");
        if (cookTime === undefined)
            return;
        if (cookTime >= 3) {
            block.setPermutation(block.permutation
                .withState("tm_aqc:cooking_state", "level_3")
                .withState("tm_aqc:cook_time", 0));
            block.dimension.playSound(SoundEnums.StewFinish, block.location, { volume: 1, pitch: 1 });
            block.dimension.playSound(SoundEnums.StewPotLid, block.location, { volume: 1, pitch: 0.5 });
            block.dimension.spawnParticle("minecraft:llama_spit_smoke", VectorUtils.add(block.location, { x: 0.5, y: 0.5, z: 0.5 }));
            return;
        }
        const liquidState1 = block.permutation.getState("tm_aqc:liquid_1");
        const liquidState2 = block.permutation.getState("tm_aqc:liquid_2");
        const liquidState = LiquidStates[`${liquidState1}:${liquidState2}`];
        if (liquidState === "stew1")
            block.dimension.spawnParticle("tm_aqc:bad_stew", VectorUtils.add(block.location, { x: 0.5, y: 0.5, z: 0.5 }));
        else
            block.dimension.spawnParticle("tm_aqc:stew", VectorUtils.add(block.location, { x: 0.5, y: 0.5, z: 0.5 }));
        block.dimension.playSound(SoundEnums.StewCooking, block.location, { volume: 1, pitch: 0.5 });
        const cookChance = MathUtils.randomInt(0, 4);
        if (cookChance !== 0)
            return;
        block.setPermutation(block.permutation
            .withState("tm_aqc:cook_time", cookTime + 1));
    }
};

//Blank compoonent to give an item swing animation on use on
const ItemSwingComponent = {
    onUseOn(event) {
    }
};

const NeptuniumSwordComponent = {
    onHitEntity(event) {
        const attacker = event.attackingEntity;
        const victim = event.hitEntity;
        const item = event.itemStack;
        const hadEffect = event.hadEffect;
        if (!item || !hadEffect)
            return;
        if (!victim.isInWater || !attacker.isInWater)
            return;
        system.runTimeout(() => {
            if (!victim || !attacker)
                return;
            victim.applyDamage(5, { cause: EntityDamageCause.entityAttack, damagingEntity: attacker });
        }, 10);
    }
};

async function showFishCatalogeForm(player, backFunction) {
    let form = new ActionFormData();
    player.removeTag("tm_aqc:fish_ui");
    const fishUILink = player.getDynamicProperty(DynamicPropertyEnum.FishUILink);
    if (fishUILink) {
        const oldFishUI = world.getEntity(fishUILink);
        if (oldFishUI)
            oldFishUI.remove();
    }
    form.title({ translate: "tm_aqc.form.button.catalogue" });
    form.body({ translate: "tm_aqc.form.fish_cataloge.body" });
    const buttons = [];
    const fishData = Object.entries(ALL_FISH_DATA).sort(([keyA], [keyB]) => {
        return keyA.localeCompare(keyB);
    });
    const lockedFish = [];
    fishData.forEach(([key, data]) => {
        const fishName = key.split(":")[1];
        const isFishUnlocked = FishCatalogeManager.isFishUnlocked(key, player);
        if (!isFishUnlocked) {
            lockedFish.push(data);
        }
        else {
            form.button({ rawtext: [
                    { text: "§l" },
                    { translate: `entity.${key}.name` },
                    { text: "§r" },
                ] }, `textures/tm/aqc/items/fish/${fishName}`);
            buttons.push({ name: key, data: data });
        }
    });
    if (lockedFish.length > 0) {
        lockedFish.forEach(() => {
            form.button({ text: "§l???§r" }, "textures/tm/aqc/icons/lock");
            buttons.push({ name: "locked" });
        });
    }
    form.button({ rawtext: [
            { text: "§l" },
            { translate: `tm_aqc.form.button.back` },
            { text: "§r" },
        ] }, "textures/tm/aqc/icons/forms/arrow");
    buttons.push({ name: "back" });
    const result = await form.show(player);
    if (result.canceled)
        return;
    if (result.selection === undefined)
        return;
    const selectedButton = buttons[result.selection];
    if (selectedButton.name === "locked") {
        return;
    }
    if (selectedButton.name === "back") {
        backFunction(player);
        return;
    }
    const data = selectedButton.data;
    if (!data)
        return;
    showFishUI(player, selectedButton.name, data);
}
function showFishUI(player, typeId, fishData, canGoBAck = true) {
    const fishName = typeId.split(":")[1];
    const fishIndex = Object.keys(ALL_FISH_DATA).findIndex(key => ALL_FISH_DATA[key] === fishData);
    const currentFishUILink = player.getDynamicProperty(DynamicPropertyEnum.FishUILink);
    if (currentFishUILink) {
        const currentFishUI = world.getEntity(currentFishUILink);
        if (currentFishUI) {
            currentFishUI.remove();
        }
    }
    const oldFishUI = player.dimension.getEntities({ type: "tm_aqc:fish_ui", tags: [`${player.name}`] });
    if (oldFishUI.length > 0) {
        oldFishUI.forEach((fishUI) => {
            fishUI.remove();
        });
    }
    if (player.getGameMode() === GameMode.Creative) {
        player.sendMessage({ translate: "tm_aqc.form.fish_cataloge.creative_mode" });
        return;
    }
    const fish_UI = player.dimension.spawnEntity("tm_aqc:fish_ui", { x: player.location.x, y: player.dimension.heightRange.min, z: player.location.z });
    fish_UI.setProperty(ActorPropertiesEnum.Type, fishIndex);
    fish_UI.setProperty(ActorPropertiesEnum.Model, fishData.skeletonModel - 1);
    if (DebugUtils.isDebugMode(DebugModeEnum.FishUI))
        DebugUtils.sendDebugMessage(`Fish UI
        Fish Name: ${fishName}
        Fish Index: ${fishIndex}
        Fish UI: ${fishData.skeletonModel - 1}`);
    fish_UI.setDynamicProperty(DynamicPropertyEnum.FishUILink, player.id);
    player.setDynamicProperty(DynamicPropertyEnum.FishUILink, fish_UI.id);
    fish_UI.addTag(`${player.name}`);
    if (!canGoBAck)
        fish_UI.addTag("noback");
    const biomeGroups = fishData.biomeGroups;
    const amountOfBiomes = biomeGroups.length <= 6 ? biomeGroups.length : 6;
    for (let i = 0; i < amountOfBiomes; i++) {
        const biomeGroup = biomeGroups[i];
        const biomeGroupNumber = biomeGroupRenderController(biomeGroup);
        //world.sendMessage(`Biome Group Number: ${biomeGroupNumber}`);
        fish_UI.setProperty(`tm_aqc:icon${i + 1}`, biomeGroupNumber);
    }
    system.runTimeout(() => { player.runCommand(`dialogue open @e[type=tm_aqc:fish_ui, tag="${player.name}"] @s ${fishName}`); }, 1);
}
function biomeGroupRenderController(biomeGroup) {
    if (biomeGroup.operation === "==") {
        switch (biomeGroup.biomeGroup) {
            case BiomeGroup.Beach:
                return 1;
            case BiomeGroup.CherryBlossom:
                return 2;
            case BiomeGroup.Cold:
                return 3;
            case BiomeGroup.Dry:
                return 4;
            case BiomeGroup.Hot:
                return 5;
            case BiomeGroup.Jungle:
                return 6;
            case BiomeGroup.Mangrove:
                return 7;
            case BiomeGroup.Mooshroom:
                return 8;
            case BiomeGroup.Ocean:
                return 9;
            case BiomeGroup.PaleGarden:
                return 10;
            case BiomeGroup.River:
                return 11;
            case BiomeGroup.Wet:
                return 12;
        }
    }
    else {
        switch (biomeGroup.biomeGroup) {
            case BiomeGroup.Beach:
                return 13;
            case BiomeGroup.CherryBlossom:
                return 14;
            case BiomeGroup.Cold:
                return 15;
            case BiomeGroup.Dry:
                return 16;
            case BiomeGroup.Hot:
                return 17;
            case BiomeGroup.Jungle:
                return 18;
            case BiomeGroup.Mangrove:
                return 19;
            case BiomeGroup.Mooshroom:
                return 20;
            case BiomeGroup.Ocean:
                return 21;
            case BiomeGroup.PaleGarden:
                return 22;
            case BiomeGroup.River:
                return 23;
            case BiomeGroup.Wet:
                return 24;
        }
    }
    return 0;
}

const FishScannerComponent = {
    onUse(event) {
        const player = event.source;
        const item = event.itemStack;
        if (!item)
            return;
        const rayCast = player.getEntitiesFromViewDirection({ maxDistance: 10, includeLiquidBlocks: false, families: ["tm_aqc_fish"] });
        player.playSound(SoundEnums.Scanner, { volume: 1, pitch: 2 });
        if (!rayCast || rayCast.length === 0)
            return;
        const entity = rayCast[0].entity;
        const isFishUnlocked = FishCatalogeManager.isFishUnlocked(entity.typeId, player);
        if (!isFishUnlocked)
            FishCatalogeManager.unlockFish(entity.typeId, player);
        const fishData = ALL_FISH_DATA[entity.typeId];
        if (fishData) {
            showFishUI(player, entity.typeId, fishData, false);
        }
    }
};

const netCatchNumber = 10;
const potCatchNumber = 10;
class FishingPotManager {
    static run() {
        this.runFishingNets();
        this.runFishingPots();
    }
    static dropSelf(entity) {
        const item = new ItemStack(entity.typeId, 1);
        if (!item)
            return;
        if (world.gameRules.doTileDrops)
            ItemUtils.spawnItems(item, 1, VectorUtils.add(entity.location, { x: 0.5, y: 0, z: 0.5 }), entity.dimension);
        entity.remove();
    }
    static collectCatch(entity) {
        const rideComponent = entity.getComponent(EntityComponentTypes.Rideable);
        if (!rideComponent)
            return;
        const caughtEntity = rideComponent.getRiders()[0];
        if (!caughtEntity)
            return;
        const item = new ItemStack(caughtEntity.typeId, 1);
        if (!item)
            return;
        ItemUtils.spawnItems(item, 1, VectorUtils.add(entity.location, { x: 0.5, y: 0, z: 0.5 }), entity.dimension);
        caughtEntity.remove();
    }
    static runFishingNets() {
        system.runInterval(() => {
            const fishingNets = this.getfishingNets();
            if (fishingNets === undefined || fishingNets.length === 0)
                return;
            for (const net of fishingNets) {
                if (net === undefined)
                    continue;
                const counter = net.getDynamicProperty(DynamicPropertyEnum.NetTickCounter) ?? 0;
                const random = MathUtils.randomInt(0, 10);
                let newCounter = random == 0 ? counter + 1 : counter;
                net.setDynamicProperty(DynamicPropertyEnum.NetTickCounter, newCounter);
                if (newCounter >= netCatchNumber) {
                    net.setDynamicProperty(DynamicPropertyEnum.NetTickCounter, undefined);
                    const fish = CatchUtils.getCaughtFish(net.location, net.dimension, SpawnCatchType.Rod);
                    if (fish === undefined)
                        continue;
                    const fishEntity = net.dimension.spawnEntity(fish, VectorUtils.add(net.location, { x: 0.5, y: 0, z: 0.5 }));
                    if (!fishEntity)
                        continue;
                    const rideComponent = net.getComponent(EntityComponentTypes.Rideable);
                    if (!rideComponent)
                        continue;
                    rideComponent.addRider(fishEntity);
                }
            }
        }, 30 * TicksPerSecond);
    }
    static runFishingPots() {
        system.runInterval(() => {
            const fishingPots = this.getFishingPots();
            if (fishingPots === undefined || fishingPots.length === 0)
                return;
            for (const pot of fishingPots) {
                if (pot === undefined)
                    continue;
                const counter = pot.getDynamicProperty(DynamicPropertyEnum.NetTickCounter) ?? 0;
                const random = MathUtils.randomInt(0, 10);
                let newCounter = random == 0 ? counter + 1 : counter;
                pot.setDynamicProperty(DynamicPropertyEnum.NetTickCounter, newCounter);
                if (newCounter >= potCatchNumber) {
                    pot.setDynamicProperty(DynamicPropertyEnum.NetTickCounter, undefined);
                    const crustacean = CatchUtils.getCaughtFish(pot.location, pot.dimension, SpawnCatchType.Pot);
                    if (crustacean === undefined)
                        continue;
                    const crustaceanEntity = pot.dimension.spawnEntity(crustacean, VectorUtils.add(pot.location, { x: 0.5, y: 0, z: 0.5 }));
                    if (!crustaceanEntity)
                        continue;
                    const rideComponent = pot.getComponent(EntityComponentTypes.Rideable);
                    if (!rideComponent)
                        continue;
                    rideComponent.addRider(crustaceanEntity);
                }
            }
        }, 30 * TicksPerSecond);
    }
    static getfishingNets() {
        const fishingNets = world.getDimension(Dimensions.Overworld).getEntities({ type: "tm_aqc:fishing_net", propertyOptions: [{ propertyId: ActorPropertiesEnum.Caught, value: false }] });
        return fishingNets;
    }
    static getFishingPots() {
        const fishingPots = world.getDimension(Dimensions.Overworld).getEntities({ type: "tm_aqc:fishing_pot", propertyOptions: [{ propertyId: ActorPropertiesEnum.Caught, value: false }] });
        return fishingPots;
    }
}

const seats = {
    "tm_aqc:fishing_stool": { x: 0, y: 0.7, z: 0 },
};
const SeatComponent = {
    onPlayerInteract(event) {
        const block = event.block;
        const player = event.player;
        if (!player)
            return;
        const offset = seats[block.typeId];
        if (!offset)
            return;
        const centre = VectorUtils.add(block.location, { x: 0.5, y: 0, z: 0.5 });
        const spawnLocation = VectorUtils.add(centre, offset);
        const seat = block.dimension.spawnEntity("tm_aqc:seat", spawnLocation);
        if (!seat)
            return;
        const ridable = seat.getComponent(EntityComponentTypes.Rideable);
        if (!ridable)
            return;
        ridable.addRider(player);
    }
};

const CatchscaleComponent = {
    onPlayerBreak(event) {
        const block = event.block;
        const player = event.player;
        if (!player)
            return;
        const fish = block.dimension.getEntitiesAtBlockLocation(VectorUtils.add(block.location, { x: 0, y: 1, z: 0 })).filter(e => e.typeId === "tm_aqc:static_fish");
        if (fish.length === 0)
            return;
        for (const f of fish) {
            dropFish(f, block);
        }
    },
    onPlayerInteract(event) {
        const block = event.block;
        const player = event.player;
        if (!player)
            return;
        const fish = block.dimension.getEntitiesAtBlockLocation(VectorUtils.add(block.location, { x: 0, y: 1, z: 0 })).filter(e => e.typeId === "tm_aqc:static_fish");
        if (fish.length > 0) {
            giveFish(player, fish[0], block);
            return;
        }
        const mainHand = PlayerUtils.getMainHandItem(player);
        if (!mainHand)
            return;
        if (!mainHand.hasTag("tm_aqc:fish"))
            return;
        if (FishUtils.hasWeight(mainHand))
            return;
        addStaticFish(block, mainHand, player);
    }
};
function dropFish(fish, block) {
    const fishID = fish.getDynamicProperty(DynamicPropertyEnum.StaticFishTypeId);
    const weight = fish.getDynamicProperty(DynamicPropertyEnum.FishWeight);
    const item = new ItemStack(fishID, 1);
    ItemUtils.spawnItems(FishUtils.addWeightToItem(item, weight), 1, VectorUtils.add(block.location, { x: 0.5, y: 1, z: 0.5 }), block.dimension);
    fish.remove();
    block.dimension.playSound(SoundEnums.PlaceFish, block.location, { volume: 1 });
}
function giveFish(player, fish, block) {
    const fishID = fish.getDynamicProperty(DynamicPropertyEnum.StaticFishTypeId);
    const weight = fish.getDynamicProperty(DynamicPropertyEnum.FishWeight);
    const item = new ItemStack(fishID, 1);
    ItemUtils.giveItem(player, FishUtils.addWeightToItem(item, weight));
    fish.remove();
    block.setPermutation(block.permutation.withState("tm_aqc:weight", 0));
    block.dimension.playSound(SoundEnums.PlaceFish, block.location, { volume: 1 });
}
function addStaticFish(block, item, player) {
    const spawnLocation = VectorUtils.add(block.location, { x: 0.5, y: 1, z: 0.5 });
    const itemID = item.typeId.includes("monstrous") ? item.typeId.replace("_monstrous", "") : item.typeId;
    const fishData = ALL_FISH_DATA[itemID];
    if (fishData === undefined)
        return;
    const fishIndex = Object.keys(ALL_FISH_DATA).findIndex(key => ALL_FISH_DATA[key] === fishData);
    const staticFish = block.dimension.spawnEntity("tm_aqc:static_fish", spawnLocation);
    if (!staticFish)
        return;
    staticFish.setProperty(ActorPropertiesEnum.Type, fishIndex);
    staticFish.setProperty(ActorPropertiesEnum.Model, fishData.skeletonModel - 1);
    staticFish.setDynamicProperty(DynamicPropertyEnum.StaticFishTypeId, item.typeId);
    block.dimension.playSound(SoundEnums.PlaceFish, block.location, { volume: 1 });
    const direction = block.permutation.getState("minecraft:cardinal_direction") ?? "north";
    let rotation = -90;
    switch (direction) {
        case "east":
            rotation = 0;
            break;
        case "south":
            rotation = 90;
            break;
        case "west":
            rotation = 180;
            break;
    }
    staticFish.setProperty(ActorPropertiesEnum.Rot, rotation);
    const fishWeight = FishUtils.calculateFishWeight(fishData, item.typeId.includes("monstrous"));
    staticFish.setDynamicProperty(DynamicPropertyEnum.FishWeight, fishWeight);
    const rangePosition = calculateRangePosition(fishData.realWeight.min, fishData.realWeight.max, fishWeight);
    block.setPermutation(block.permutation.withState("tm_aqc:weight", rangePosition));
    PlayerUtils.reduceMainHandItem(player, 1);
    const message = {
        rawtext: [
            { translate: "tm_aqc.fish_mount.fish" },
            { text: " " },
            { translate: `entity.${item.typeId}.name` },
        ]
    };
    if (!message.rawtext) {
        message.rawtext = [];
    }
    if (fishWeight !== undefined && fishWeight > 0) {
        message.rawtext.push({ text: "\n" });
        message.rawtext.push({ translate: "tm_aqc.fish_mount.weight" });
        message.rawtext.push({ text: " " });
        message.rawtext.push({ text: `${fishWeight}lb` });
    }
    player.onScreenDisplay.setActionBar(message);
}
function calculateRangePosition(min, max, num) {
    const range = max - min;
    const stepSize = range / 7;
    const position = Math.floor((num - min) / stepSize);
    return Math.min(Math.max(position + 1, 1), 7);
}

const DurabilityComponent = {
    onMineBlock(event) {
        const entity = event.source;
        const item = event.itemStack;
        event.block;
        const blockPermutation = event.minedBlockPermutation;
        if (blockPermutation.canBeDestroyedByLiquidSpread(LiquidType.Water))
            return;
        if (!item)
            return;
        if (!(entity instanceof Player))
            return;
        const player = entity;
        if (!player)
            return;
        if (player.getGameMode() === GameMode.Creative)
            return;
        let damage = 1;
        if (item.hasTag("minecraft:is_sword"))
            damage = 2;
        ItemUtils.damageItem(player, item, damage);
    },
    onUseOn(event) {
        const entity = event.source;
        const item = event.itemStack;
        event.block;
        const blockPermutation = event.usedOnBlockPermutation;
        if (!item)
            return;
        if (!(entity instanceof Player))
            return;
        const player = entity;
        if (!player)
            return;
        if (player.getGameMode() === GameMode.Creative)
            return;
        let damage = 0;
        const hoeBlocks = [
            "minecraft:grass_block",
            "minecraft:dirt",
            "minecraft:coarse_dirt",
            "minecraft:rooted_dirt",
        ];
        if (item.hasTag("minecraft:is_axe") && (blockPermutation.hasTag("minecraft:logs") || blockPermutation.type.id.includes("waxed")))
            damage = 1;
        if (item.hasTag("minecraft:is_hoe") && hoeBlocks.includes(blockPermutation.type.id))
            damage = 1;
        if (damage === 0)
            return;
        ItemUtils.damageItem(player, item, damage);
    }
};

const BulbComponent = {
    onTick(event) {
        const block = event.block;
        BlockUtils.setPowered(block);
    }
};

const changeLogData = [
    {
        date: "6th May 2025",
        version: "V1.0",
        changeLog: `Initial Submission`
    },
    {
        date: "12th July 2025",
        version: "V1.1",
        changeLog: `§a§lFixed:§r
§e-§r Bait overriding chances when using Luck of the Sea
§e-§r Some bobbers turning red in the Modification Table
§e-§r Junk table issue causing it not to spawn
§e-§r Scale and Neptunium armor absorbing all damage
§e-§r Fish spawning in the End
§e-§r Stew pot Lobster Bisque being invisible
§e-§r Text issues in the catalogue
§e-§r Mushroom fish not spawning in Mooshroom biomes
§e-§r Fish Schooling Behaviors

§6§lAdded:§r
§e-§r Message in a Bottle to the treasure loot table
§e-§r Lily pads to the junk loot table
§e-§r Spawn caps for fish spawning depending on device memory

§b§lChanged:§r
§e-§r Increased chance of getting a golden worm
§e-§r Increased Neptunium Chances
§e-§r Increased Catch Window Timing
§e-§r Tweaked rod casting detection to prevent cast locking
`
    }
];

async function showMainGuideForm(player) {
    let form = new ActionFormData();
    form.title({ translate: "tm_aqc.form.main.title" });
    form.body({ translate: "tm_aqc.form.main.body" });
    form.button({ translate: "tm_aqc.form.button.catalogue" }, "textures/tm/aqc/icons/forms/fish_catalogue");
    form.button({ translate: "tm_aqc.form.button.systems" }, "textures/tm/aqc/icons/forms/systems");
    form.button({ translate: "tm_aqc.form.button.changelog" }, "textures/tm/aqc/icons/forms/changelog");
    form.button({ translate: "tm_aqc.form.button.contact" }, "textures/tm/aqc/icons/forms/contact_us");
    const result = await form.show(player);
    if (result === undefined)
        return;
    if (result.canceled)
        return;
    if (result.selection === undefined)
        return;
    switch (result.selection) {
        case 0:
            showFishCatalogeForm(player, showMainGuideForm);
            break;
        case 1:
            showSystemsForm(player);
            break;
        case 2:
            showChangeLogForm(player);
            break;
        case 3:
            showDynamicForm(player, {
                title: { translate: "tm_aqc.form.button.contact" },
                formBody: { translate: "tm_aqc.form.contact.body" }
            }, showMainGuideForm);
            break;
    }
}
async function showDynamicForm(player, data, backFunction) {
    let form = new ActionFormData();
    form.title(data.title);
    if (data.formBody)
        form.body(data.formBody);
    form.button({ translate: "tm_aqc.form.button.back" }, "textures/tm/aqc/icons/forms/arrow");
    const result = await form.show(player);
    const selection = result.selection;
    if (result.canceled)
        return;
    if (selection === 0)
        backFunction(player);
}
async function showChangeLogForm(player) {
    let form = new ActionFormData();
    form.title({ translate: "tm_aqc.form.button.changelog" });
    form.divider();
    changeLogData.slice().reverse().forEach(log => {
        form.label({ text: `§dData§r: ${log.date}` });
        form.label({ text: `§bVersão§r: ${log.version}` });
        form.label({ text: `§eInformações§r:\n${log.changeLog}` });
        form.divider();
    });
    form.button({ translate: "tm_aqc.form.button.back" }, "textures/tm/aqc/icons/forms/arrow");
    const result = await form.show(player);
    if (result.selection === 0) {
        showMainGuideForm(player);
    }
}
async function showSystemsForm(player) {
    let form = new ActionFormData();
    form.title({ translate: "tm_aqc.form.button.systems" });
    //form.body({ translate: "tm_aqc.form.systems.body" });
    const buttons = [];
    form.button({ translate: "tm_aqc.form.button.angling" }, "textures/tm/aqc/icons/forms/angling");
    form.button({ translate: "tm_aqc.form.button.wild_fish" }, "textures/tm/aqc/icons/forms/wild_fish");
    form.button({ translate: "tm_aqc.form.button.biome_group" }, "textures/tm/aqc/icons/forms/biome_group");
    form.button({ translate: "tm_aqc.form.button.cutting_board" }, "textures/tm/aqc/icons/forms/cutting_board");
    form.button({ translate: "tm_aqc.form.button.stew_pot" }, "textures/tm/aqc/icons/forms/stew_pot");
    form.button({ translate: "tm_aqc.form.button.fish_mount" }, "textures/tm/aqc/icons/forms/fish_mount");
    form.button({ translate: "tm_aqc.form.button.catchscale" }, "textures/tm/aqc/icons/forms/catchscale");
    form.button({ translate: "tm_aqc.form.button.fishing_stool" }, "textures/tm/aqc/icons/forms/fishing_stool");
    form.button({ translate: "tm_aqc.form.button.fish_capturing" }, "textures/tm/aqc/icons/forms/fish_capturing");
    form.button({ translate: "tm_aqc.form.button.worm_farm" }, "textures/tm/aqc/icons/forms/worm_farm");
    form.button({ translate: "tm_aqc.form.button.aquatic_products" }, "textures/tm/aqc/icons/forms/aquatic_products");
    form.button({ translate: "tm_aqc.form.button.neptunium" }, "textures/tm/aqc/icons/forms/neptunium");
    form.button({ translate: "tm_aqc.form.button.back" }, "textures/tm/aqc/icons/forms/arrow");
    buttons.push("angling", "wild_fish", "biome_group", "cutting_board", "stew_pot", "fish_mount", "catchscale", "fishing_stool", "fish_capturing", "worm_farm", "aquatic_products", "neptunium", "back");
    const result = await form.show(player);
    if (result === undefined)
        return;
    if (result.canceled)
        return;
    if (result.selection === undefined)
        return;
    const selectedButton = buttons[result.selection];
    if (selectedButton === "back") {
        showMainGuideForm(player);
        return;
    }
    showDynamicForm(player, {
        title: { translate: `tm_aqc.form.button.${selectedButton}` },
        formBody: { translate: `tm_aqc.form.${selectedButton}.body` }
    }, showSystemsForm);
}

const GuidebookComponent = {
    onUse(event) {
        const player = event.source;
        const item = event.itemStack;
        if (!item)
            return;
        showMainGuideForm(player);
    }
};

system.beforeEvents.startup.subscribe(({ blockComponentRegistry, itemComponentRegistry }) => {
    // Register custom block components
    blockComponentRegistry.registerCustomComponent("tm_aqc:fish_block", FishBlockComponent);
    blockComponentRegistry.registerCustomComponent("tm_aqc:worm_farm", WormFarmComponent);
    blockComponentRegistry.registerCustomComponent("tm_aqc:modification_station", ModificationStationComponent);
    blockComponentRegistry.registerCustomComponent("tm_aqc:stew_pot", StewPotComponent);
    blockComponentRegistry.registerCustomComponent("tm_aqc:stew_pot_cooking", StewPotCookingComponent);
    blockComponentRegistry.registerCustomComponent("tm_aqc:seat", SeatComponent);
    blockComponentRegistry.registerCustomComponent("tm_aqc:catchscale", CatchscaleComponent);
    blockComponentRegistry.registerCustomComponent("tm_aqc:bulb", BulbComponent);
    // Register custom item components
    itemComponentRegistry.registerCustomComponent("tm_aqc:rod", RodCustomComponent);
    itemComponentRegistry.registerCustomComponent("tm_aqc:bucket_place", BucketPlaceComponent);
    itemComponentRegistry.registerCustomComponent("tm_aqc:sonar", SonarComponent);
    itemComponentRegistry.registerCustomComponent("tm_aqc:harpoon", HarpoonComponent);
    itemComponentRegistry.registerCustomComponent("tm_aqc:food_effects", FoodEffectsComponent);
    itemComponentRegistry.registerCustomComponent("tm_aqc:item_swing", ItemSwingComponent);
    itemComponentRegistry.registerCustomComponent("tm_aqc:neptunium_sword", NeptuniumSwordComponent);
    itemComponentRegistry.registerCustomComponent("tm_aqc:fish_scanner", FishScannerComponent);
    itemComponentRegistry.registerCustomComponent("tm_aqc:custom_durability", DurabilityComponent);
    itemComponentRegistry.registerCustomComponent("tm_aqc:guidebook", GuidebookComponent);
});
world.afterEvents.worldLoad.subscribe(() => {
    RodManager.init();
    HarpoonManager.init();
    WeatherManager.init();
    FishingPotManager.run();
    const version = world.getDynamicProperty("version") ?? "";
    if (version !== "")
        return;
    world.setDynamicProperty("version", "1.0");
});

const PLAYER_CACHE = new Map(); // Player ID, rod typeId
system.runInterval(() => {
    const players = world.getAllPlayers();
    for (const player of players) {
        const equipment = player.getComponent(EntityComponentTypes.Equippable);
        if (!equipment)
            continue;
        const item = equipment.getEquipment(EquipmentSlot.Mainhand);
        const cached = PLAYER_CACHE.get(player.id);
        const typeId = item ? item.typeId : "";
        if (cached !== typeId) {
            if (cached?.includes("tm_aqc") && cached.includes("fishing_rod"))
                RodManager.uncast(player, undefined, true);
            if (cached?.includes("tm_aqc") && cached.includes("harpoon"))
                HarpoonManager.removeCast(player);
        }
        PLAYER_CACHE.set(player.id, typeId);
    }
}, 1);
world.afterEvents.playerLeave.subscribe((event) => {
    PLAYER_CACHE.delete(event.playerId);
});
world.afterEvents.entityDie.subscribe((event) => {
    const entity = event.deadEntity;
    if (entity.typeId !== EntityTypeEnum.Bobber)
        return;
    const projectile = entity.getComponent(EntityComponentTypes.Projectile);
    if (!projectile)
        return;
    const owner = projectile.owner;
    if (!owner || !(owner instanceof Player))
        return;
    RodManager.uncast(owner, undefined, true);
    entity.remove();
});

world.afterEvents.weatherChange.subscribe((event) => {
    const weather = event.newWeather;
    const dimension = event.dimension;
    const weatherInit = WeatherManager.getInit();
    if (!weatherInit && dimension === "overworld") {
        WeatherManager.completeInit(event.previousWeather);
        return;
    }
    else {
        WeatherManager.setWeather(weather, dimension);
    }
});

world.afterEvents.dataDrivenEntityTrigger.subscribe((event) => {
    const entity = event.entity;
    const eventID = event.eventId;
    if (entity.typeId === EntityTypeEnum.Bobber && eventID === "tm_aqc:float")
        RodManager.uncaught(entity);
    if (entity.typeId === EntityTypeEnum.Bobber && eventID === "tm_aqc:in_water")
        RodManager.startBobber(entity);
    if (entity.typeId === EntityTypeEnum.MessageInABottle) {
        let location = entity.location;
        const dimension = entity.dimension;
        if (location.y < dimension.heightRange.min) {
            const topMostBlock = dimension.getTopmostBlock({ x: location.x, z: location.z });
            location.y = topMostBlock !== undefined ? topMostBlock.y + 1 : dimension.heightRange.min + 1;
        }
        if (location.y > dimension.heightRange.max)
            location.y = dimension.heightRange.max - 1;
        dimension.playSound(SoundEnums.GlassBreak, location, { volume: 2 });
        dimension.spawnParticle("tm_aqc:glass_break", location);
        dimension.runCommand(`loot spawn ${location.x + 0.5} ${location.y} ${location.z + 0.5} loot "tm/aqc/message_in_a_bottle"`);
        entity.remove();
    }
    if (entity.typeId === EntityTypeEnum.HarpoonEntity && eventID === "tm_aqc:despawn")
        HarpoonManager.harpoonDespawn(entity);
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
    const { id, initiator, message, sourceBlock, sourceEntity, sourceType, } = event;
    let sender = sourceType == ScriptEventSource.Entity ? sourceEntity : null;
    const player = sender;
    if (id === "tm_aqc:fish_cataloge") {
        system.runTimeout(() => {
            showFishCatalogeForm(player, showMainGuideForm);
        }, 10);
        return;
    }
    if (id.includes("dev")) {
        devCommands(player, id, message);
        return;
    }
});
function devCommands(player, messageID, message) {
    switch (messageID) {
        // Developer Commands
        case "tm_aqc_dev:setDurability":
            const item = PlayerUtils.getMainHandItem(player);
            if (!item)
                return;
            const amount = parseInt(message);
            if (isNaN(amount))
                return;
            ItemUtils.damageItem(player, item, amount);
            player.sendMessage(`Set durability to ${amount}`);
            break;
        case "tm_aqc_dev:getDurability":
            const itemStack = PlayerUtils.getMainHandItem(player);
            if (!itemStack)
                return;
            const durabilityComponent = itemStack.getComponent(ItemComponentTypes.Durability);
            if (!durabilityComponent)
                return;
            player.sendMessage(`Damage: ${durabilityComponent.damage}
                Max Durability: ${durabilityComponent.maxDurability}`);
            break;
        case "tm_aqc_dev:giveFish":
            const fish = Object.keys(ALL_FISH_DATA);
            for (const fishName of fish) {
                player.sendMessage(`Giving ${fishName}`);
                const item = new ItemStack(fishName);
                ItemUtils.giveItem(player, item);
            }
            break;
        case "tm_aqc_dev:spawnFish":
            const fishSpawn = Object.keys(ALL_FISH_DATA);
            for (const fishName of fishSpawn) {
                player.dimension.spawnEntity(fishName, player.location);
            }
            break;
        case "tm_aqc_dev:debug":
            const setDebug = DebugUtils.setDebugModeFromString(message);
            if (!setDebug)
                player.sendMessage(`Invalid debug mode: ${message}`);
            else
                player.sendMessage(`Toggled ${message} debug mode`);
            break;
        case "tm_aqc_dev:fishUI":
            const fishUI = ALL_FISH_DATA[message];
            if (!fishUI)
                return;
            const fishKey = Object.keys(ALL_FISH_DATA).find(key => ALL_FISH_DATA[key] === fishUI);
            player.sendMessage(`Fish UI: ${fishKey}`);
            const fishIndex = Object.keys(ALL_FISH_DATA).findIndex(key => ALL_FISH_DATA[key] === fishUI);
            player.sendMessage(`Fish Index: ${fishIndex}`);
            player.sendMessage(`Fish UI: ${fishUI.skeletonModel}`);
            const fish_UI = player.dimension.spawnEntity("tm_aqc:fish_ui", player.location);
            fish_UI.setProperty(ActorPropertiesEnum.Type, fishIndex);
            fish_UI.setProperty(ActorPropertiesEnum.Model, fishUI.skeletonModel - 1);
            break;
        case "tm_aqc_dev:getData":
            let getIDs = world.getDynamicPropertyIds();
            if (message !== "") {
                getIDs = getIDs.filter(id => id.startsWith(message));
            }
            for (const ID of getIDs) {
                const data = world.getDynamicProperty(ID);
                sendData(player, ID, data);
            }
            break;
        case "tm_aqc_dev:clearData":
            const IDs = world.getDynamicPropertyIds();
            for (const ID of IDs) {
                world.setDynamicProperty(ID, undefined);
            }
            player.sendMessage("Cleared all data");
            break;
    }
}
function sendData(player, ID, data) {
    if (data === undefined) {
        player.sendMessage(`No data found for ${ID}`);
        return;
    }
    if (typeof data === "object")
        player.sendMessage(`${ID}: ${JSON.stringify(data)}`);
    else
        player.sendMessage(`${ID}: ${data}`);
}

world.afterEvents.entityHitBlock.subscribe((event) => {
    const entity = event.damagingEntity;
    const block = event.hitBlock;
    if (!(entity instanceof Player))
        return;
    const player = entity;
    if (player.getGameMode() === GameMode.Creative)
        return;
    PlayerUtils.getMainHandItem(player);
    if (block.typeId === "tm_aqc:cutting_board" || block.typeId === "tm_aqc:fish_mount") {
        const ID_1 = block.permutation.getState("tm_aqc:ID_1");
        const ID_2 = block.permutation.getState("tm_aqc:ID_2");
        const monstrous = block.permutation.getState("tm_aqc:monstrous");
        if (ID_1 == undefined || ID_2 == undefined || monstrous === undefined)
            return;
        const fish = FishUtils.getFishFromID([ID_1, ID_2]);
        if (fish == "")
            return;
        let fishID = fish;
        if (monstrous) {
            fishID = fish + "_monstrous";
        }
        let newITem = FishUtils.getFishBlockItem(block, fishID);
        ItemUtils.spawnItems(newITem, 1, VectorUtils.add(block.location, { x: 0.5, z: 0.5 }), block.dimension);
        block.dimension.playSound(SoundEnums.PlaceFish, block.location, { volume: 1 });
        block.setPermutation(block.permutation
            .withState("tm_aqc:ID_1", 0)
            .withState("tm_aqc:ID_2", 0)
            .withState("tm_aqc:monstrous", false));
    }
});

class FishSpawnManager {
    static spawnFish(spawner) {
        const location = spawner.location;
        const dimension = spawner.dimension;
        spawner.remove();
        let fish = CatchUtils.getCaughtFish(location, dimension);
        const fishData = ALL_FISH_DATA[fish];
        if (!fishData)
            return;
        let spawnLimit = 50;
        const memory = system.serverSystemInfo.memoryTier;
        switch (memory) {
            case MemoryTier.SuperLow:
                spawnLimit = 10;
                break;
            case MemoryTier.Low:
                spawnLimit = 20;
                break;
            case MemoryTier.Mid:
                spawnLimit = 30;
                break;
            case MemoryTier.High:
                spawnLimit = 40;
                break;
        }
        const entities = dimension.getEntities({ families: ["tm_aqc_fish", "tm_aqc_crustacean"], location: location, maxDistance: 50 });
        if (entities.length >= spawnLimit)
            return;
        const spawnAmount = MathUtils.randomInt(fishData.spawnCount.min, fishData.spawnCount.max);
        const bottomLocation = getLastBlockInDirection(location, -1, dimension);
        const topLocation = getLastBlockInDirection(location, 1, dimension);
        const height = topLocation.y - bottomLocation.y;
        const bottomThird = { min: bottomLocation.y, max: bottomLocation.y + Math.floor(height * 0.33) };
        const middleThird = { min: bottomThird.max, max: bottomThird.max + Math.floor(height * 0.66) };
        const topThird = { min: middleThird.max, max: topLocation.y };
        let spawnLocation = location;
        switch (fishData.spawnArea) {
            case SpawnArea.TopThird:
                spawnLocation = { x: location.x, y: MathUtils.randomInt(topThird.min, topThird.max), z: location.z };
                break;
            case SpawnArea.MiddleThird:
                spawnLocation = { x: location.x, y: MathUtils.randomInt(middleThird.min, middleThird.max), z: location.z };
                break;
            case SpawnArea.BottomThird:
                spawnLocation = { x: location.x, y: MathUtils.randomInt(bottomThird.min, bottomThird.max), z: location.z };
                break;
            case SpawnArea.All:
                spawnLocation = { x: location.x, y: MathUtils.randomInt(bottomLocation.y, topLocation.y), z: location.z };
                break;
        }
        for (let i = 0; i < spawnAmount; i++) {
            try {
                const newEntity = dimension.spawnEntity(fish, spawnLocation);
                const familyComponent = newEntity.getComponent(EntityComponentTypes.TypeFamily);
                if (familyComponent && familyComponent.hasTypeFamily("tm_aqc:clam")) {
                    newEntity.triggerEvent("tm_aqc:random_pearl");
                }
            }
            catch (error) {
            }
        }
    }
}
function getLastBlockInDirection(location, direction, dimension) {
    let currentLocation = location;
    let currentBlock = dimension.getBlock(currentLocation);
    if (!currentBlock)
        return currentLocation;
    while (currentBlock.permutation.matches("minecraft:water") || currentBlock.permutation.matches("minecraft:flowing_water")) {
        const nextBlock = dimension.getBlock(VectorUtils.add(currentBlock.location, { x: 0, y: direction, z: 0 }));
        if (!nextBlock)
            break;
        if (!nextBlock.permutation.matches("minecraft:water") && !nextBlock.permutation.matches("minecraft:flowing_water"))
            break;
        currentBlock = nextBlock;
    }
    return currentBlock.location;
}

// @deprecated, drowned has attachables set to false, left incase it changes in the future
var ArmorType;
(function (ArmorType) {
    ArmorType[ArmorType["Helmet"] = 0] = "Helmet";
    ArmorType[ArmorType["HelmetChestplate"] = 1] = "HelmetChestplate";
    ArmorType[ArmorType["HelmetChestplateLeggings"] = 2] = "HelmetChestplateLeggings";
    ArmorType[ArmorType["FullSet"] = 3] = "FullSet";
})(ArmorType || (ArmorType = {}));
class EntityManager {
    static handleDrowned(entity) {
        this.shrimpJocky(entity);
    }
    static swapDrowned(entity) {
    }
    static shrimpJocky(entity) {
        const isBaby = entity.getComponent(EntityComponentTypes.IsBaby);
        if (isBaby === undefined)
            return;
        const firstCheck = MathUtils.randomInt(1, 100);
        if (firstCheck < 5) {
            const shrimps = entity.dimension.getEntities({ type: "tm_aqc:pink_shrimp", location: { x: entity.location.x + 5, y: entity.location.y - 3, z: entity.location.z + 5 }, volume: { x: 10, y: 6, z: 10 } });
            if (shrimps.length > 0) {
                const shrimp = shrimps[MathUtils.randomInt(0, shrimps.length - 1)];
                shrimp.triggerEvent("tm_aqc:scale_normal");
                const ridable = shrimp.getComponent(EntityComponentTypes.Rideable);
                if (ridable) {
                    ridable.addRider(entity);
                    return;
                }
            }
        }
        const secondCheck = MathUtils.randomInt(1, 100);
        if (secondCheck > 5)
            return;
        const shrimp = entity.dimension.spawnEntity("tm_aqc:pink_shrimp", entity.location);
        if (!shrimp)
            return;
        shrimp.triggerEvent("tm_aqc:scale_normal");
        const ridable = shrimp.getComponent(EntityComponentTypes.Rideable);
        if (!ridable)
            return;
        ridable.addRider(entity);
    }
    static clamDropPearl(entity, onDeath = false) {
        let clamState = undefined;
        try {
            clamState = entity.getProperty(ActorPropertiesEnum.ClamState);
        }
        catch (error) {
            return;
        }
        if ((clamState === undefined || clamState !== "open") && !onDeath)
            return;
        const pearlType = entity.getProperty(ActorPropertiesEnum.Pearl) ?? 0;
        let pearlName = "";
        switch (pearlType) {
            case 1:
                pearlName = "tm_aqc:pearl";
                break;
            case 2:
                pearlName = "tm_aqc:gold_pearl";
                break;
            case 3:
                pearlName = "tm_aqc:black_pearl";
                break;
        }
        if (pearlName !== "")
            entity.dimension.spawnItem(new ItemStack(pearlName), entity.location);
        if (!onDeath)
            entity.triggerEvent("tm_aqc:ready");
    }
    static setDrownedArmor(entity) {
        const diffuclty = world.getDifficulty();
        if (diffuclty === Difficulty.Peaceful || diffuclty === Difficulty.Easy)
            return;
        let hasArmor = MathUtils.randomFloat(0.0, 15.0);
        if (diffuclty === Difficulty.Hard)
            hasArmor = MathUtils.randomFloat(1.875, 15.0);
        if (hasArmor <= 0.0)
            return;
        const armorChance = MathUtils.randomFloat(1.0, 100.0);
        if (armorChance > hasArmor)
            return;
        let headChest = 75;
        let headChestLegs = 56.25;
        let fullSet = 42.19;
        if (diffuclty === Difficulty.Hard) {
            headChest = 90;
            headChestLegs = 81;
            fullSet = 72.9;
        }
        const armorTypeChance = MathUtils.randomFloat(0.0, 100.0);
        let armorType = ArmorType.Helmet;
        if (armorTypeChance <= headChest)
            armorType = ArmorType.HelmetChestplate;
        if (armorTypeChance <= headChestLegs)
            armorType = ArmorType.HelmetChestplateLeggings;
        if (armorTypeChance <= fullSet)
            armorType = ArmorType.FullSet;
        const armorSet = MathUtils.randomFloat(0.0, 100.0) <= 0.04 ? "tm_aqc:neptunium_" : "tm_aqc:scale_";
        const equippable = entity.getComponent(EntityComponentTypes.Equippable);
        if (!equippable)
            return;
        switch (armorType) {
            case ArmorType.Helmet:
                equippable.setEquipment(EquipmentSlot.Head, new ItemStack(`${armorSet}helmet`));
                break;
            case ArmorType.HelmetChestplate:
                equippable.setEquipment(EquipmentSlot.Head, new ItemStack(`${armorSet}helmet`));
                equippable.setEquipment(EquipmentSlot.Chest, new ItemStack(`${armorSet}chestplate`));
                break;
            case ArmorType.HelmetChestplateLeggings:
                equippable.setEquipment(EquipmentSlot.Head, new ItemStack(`${armorSet}helmet`));
                equippable.setEquipment(EquipmentSlot.Chest, new ItemStack(`${armorSet}chestplate`));
                equippable.setEquipment(EquipmentSlot.Legs, new ItemStack(`${armorSet}leggings`));
                break;
            case ArmorType.FullSet:
                equippable.setEquipment(EquipmentSlot.Head, new ItemStack(`${armorSet}helmet`));
                equippable.setEquipment(EquipmentSlot.Chest, new ItemStack(`${armorSet}chestplate`));
                equippable.setEquipment(EquipmentSlot.Legs, new ItemStack(`${armorSet}leggings`));
                equippable.setEquipment(EquipmentSlot.Feet, new ItemStack(`${armorSet}boots`));
                break;
        }
    }
}

world.afterEvents.entitySpawn.subscribe(event => {
    const entity = event.entity;
    const cause = event.cause;
    if (entity.typeId === "minecraft:drowned")
        EntityManager.handleDrowned(entity);
    if (cause !== EntityInitializationCause.Spawned)
        return;
    if (entity.typeId.includes("tm_aqc:fish_spawner"))
        FishSpawnManager.spawnFish(entity);
    if (entity.typeId === "tm_aqc:synodontis") {
        if (MathUtils.isChance(2)) {
            entity.setProperty("tm_aqc:upsidedown", true);
        }
    }
});

world.afterEvents.entityDie.subscribe((event) => {
    const entity = event.deadEntity;
    const damageSource = event.damageSource;
    if (entity.typeId === "tm_aqc:bobber") {
        const player = BobberUtils.getOwner(entity);
        if (!player)
            return;
        RodManager.uncast(player, undefined, true);
    }
    if (entity.typeId === "tm_aqc:harpoon_entity") {
        HarpoonManager.harpoonDespawn(entity);
    }
    if (entity.typeId === "tm_aqc:hard_clam") {
        EntityManager.clamDropPearl(entity, true);
    }
    if (entity.typeId === "tm_aqc:modification_station_entity")
        ModStationManager.dropRod(entity);
    if (ALL_FISH_DATA[entity.typeId] !== undefined) {
        dropFishLoot(entity, damageSource);
        const player = damageSource.damagingEntity;
        if (!(player instanceof Player))
            return;
        const isFishUnlocked = FishCatalogeManager.isFishUnlocked(entity.typeId, player);
        if (!isFishUnlocked)
            FishCatalogeManager.unlockFish(entity.typeId, player);
    }
});
function dropFishLoot(entity, source) {
    if (!world.gameRules.doEntityDrops)
        return;
    const location = VectorUtils.add(entity.location, { x: 0.5, y: 0, z: 0.5 });
    const dimension = entity.dimension;
    const FishData = ALL_FISH_DATA[entity.typeId];
    if (!FishData)
        return;
    const scaleComponent = entity.getComponent(EntityComponentTypes.Scale);
    let itemId = entity.typeId;
    if (scaleComponent) {
        const scale = scaleComponent.value;
        itemId = scale > 1 ? `${entity.typeId}_monstrous` : entity.typeId;
    }
    const fishItem = new ItemStack(itemId);
    if (!fishItem)
        return;
    ItemUtils.spawnItems(fishItem, 1, location, dimension);
    let dropLoot = false;
    if (!dropLoot && source.damagingEntity !== undefined) {
        const equippable = source.damagingEntity.getComponent(EntityComponentTypes.Equippable);
        if (equippable) {
            const item = equippable.getEquipment(EquipmentSlot.Mainhand);
            dropLoot = item === undefined ? false : item.hasTag("tm_aqc:fish_loot");
        }
    }
    if (!dropLoot && source.damagingProjectile !== undefined) {
        const familyComponent = source.damagingProjectile.getComponent(EntityComponentTypes.TypeFamily);
        dropLoot = familyComponent === undefined ? false : familyComponent.hasTypeFamily("tm_aqc:fish_loot");
    }
    if (!dropLoot)
        return;
    MathUtils.randomInt(0, 1);
    const preset = CuttingBoardSkeletonPresets[FishData.skeletonModel];
    const mainType = preset.typeID;
    const bonus = preset.bonus === undefined ? undefined : preset.bonus.typeID;
    const max = itemId.includes("monstrous") ? 3 : 2;
    ItemUtils.spawnItems(new ItemStack(mainType), MathUtils.randomInt(1, max), location, dimension);
    if (bonus !== undefined)
        ItemUtils.spawnItems(new ItemStack(bonus), MathUtils.randomInt(1, max), location, dimension);
}

world.beforeEvents.playerLeave.subscribe((event) => {
    const player = event.player;
    system.run(() => {
        RodManager.uncast(player, undefined, true);
        HarpoonManager.removeCast(player);
    });
    const fishUILink = player.getDynamicProperty(DynamicPropertyEnum.FishUILink);
    if (fishUILink) {
        const oldFishUI = world.getEntity(fishUILink);
        if (oldFishUI)
            system.run(() => { oldFishUI.remove(); });
    }
});

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const player = event.player;
    const entity = event.target;
    const item = event.itemStack;
    if (entity.typeId === "tm_aqc:fishing_net" || entity.typeId === "tm_aqc:fishing_pot") {
        FishingPotManager.collectCatch(entity);
        return;
    }
    if (entity.typeId === "tm_aqc:hard_clam") {
        EntityManager.clamDropPearl(entity, false);
        return;
    }
    if (!item)
        return;
    if (entity.typeId === "tm_aqc:bobber" && RodManager.hasCast(player) && item.hasTag("tm_aqc:rod"))
        RodManager.uncast(player, item, true);
});

world.afterEvents.pistonActivate.subscribe(event => {
    const direction = getPistonDirection(event.block);
    const attachedLocations = event.piston.getAttachedBlocksLocations();
    const tables = event.dimension.getEntities({ type: "tm_aqc:modification_station_entity" });
    for (const table of tables) {
        const block = event.dimension.getBlock(table.location);
        if (!block)
            continue;
        if (block.typeId === "tm_aqc:modification_station")
            continue;
        ModStationManager.dropRod(table);
        table.remove();
    }
    system.runTimeout(() => {
        const blocks = attachedLocations.map((location, i) => {
            return getBlockInDirection(event.dimension, location, direction, event.isExpanding ? 1 : -1);
        });
        for (const block of blocks) {
            if (!block)
                continue;
            if (block.typeId !== "tm_aqc:fish_mount" && block.typeId !== "tm_aqc:cutting_board")
                continue;
            const permutation = block.permutation;
            const ID_1 = permutation.getState("tm_aqc:ID_1");
            const ID_2 = permutation.getState("tm_aqc:ID_2");
            const monstrous = permutation.getState("tm_aqc:monstrous");
            if (ID_1 == undefined || ID_2 == undefined || monstrous === undefined)
                return;
            if (ID_1 === 0 && ID_2 === 0)
                continue;
            if (block.typeId !== "tm_aqc:cutting_board" && ID_1 === 0)
                continue;
            const fish = FishUtils.getFishFromID([ID_1, ID_2]);
            if (fish == "")
                return;
            let fishID = fish;
            if (monstrous) {
                fishID = fish + "_monstrous";
            }
            let newITem = FishUtils.getFishBlockItem(block, fishID);
            ItemUtils.spawnItems(newITem, 1, VectorUtils.add(block.location, { x: 0.5, z: 0.5 }), block.dimension);
            if (world.gameRules.doTileDrops)
                ItemUtils.spawnItems(new ItemStack("tm_aqc:fish_mount"), 1, VectorUtils.add(block.location, { x: 0.5, z: 0.5 }), block.dimension);
            block.setPermutation(BlockPermutation.resolve("air"));
        }
    }, 2);
});
function getBlockInDirection(dimension, location, direction, steps) {
    const newLocation = getLocationInDirection(location, direction, steps);
    return dimension.getBlock(newLocation);
}
function getPistonDirection(piston) {
    const state = piston.permutation.getState("facing_direction");
    switch (state) {
        case 0:
            return Direction.Down;
        case 1:
            return Direction.Up;
        case 2:
            return Direction.South;
        case 3:
            return Direction.North;
        case 4:
            return Direction.East;
        case 5:
            return Direction.West;
        default:
            throw new Error("Invalid piston state");
    }
}
function getLocationInDirection(location, direction, steps = 1) {
    let addLocation;
    switch (direction.toLowerCase()) {
        case Direction.Up.toLowerCase():
            addLocation = { x: 0, y: steps, z: 0 };
            break;
        case Direction.Down.toLowerCase():
            addLocation = { x: 0, y: -steps, z: 0 };
            break;
        case Direction.North.toLowerCase():
            addLocation = { x: 0, y: 0, z: -steps };
            break;
        case Direction.South.toLowerCase():
            addLocation = { x: 0, y: 0, z: steps };
            break;
        case Direction.East.toLowerCase():
            addLocation = { x: steps, y: 0, z: 0 };
            break;
        case Direction.West.toLowerCase():
            addLocation = { x: -steps, y: 0, z: 0 };
            break;
        default:
            throw new Error("Invalid direction");
    }
    return VectorUtils.add(addLocation, location);
}

world.afterEvents.playerBreakBlock.subscribe((event) => {
    const perm = event.brokenBlockPermutation;
    const block = event.block;
    if (perm.matches("tm_aqc:stew_pot")) {
        StewPotManager.removeStewPot(block);
    }
});

world.beforeEvents.effectAdd.subscribe((event) => {
    const entity = event.entity;
    const effect = event.effectType;
    if (effect !== "minecraft:mining_fatigue" && !effect.includes("Mining Fatigue"))
        return;
    const equippable = entity.getComponent(EntityComponentTypes.Equippable);
    if (!equippable)
        return;
    const head = equippable.getEquipment(EquipmentSlot.Head);
    const chest = equippable.getEquipment(EquipmentSlot.Chest);
    const legs = equippable.getEquipment(EquipmentSlot.Legs);
    const feet = equippable.getEquipment(EquipmentSlot.Feet);
    if (!head || !chest || !legs || !feet)
        return;
    if (head.typeId !== "tm_aqc:neptunium_helmet" ||
        chest.typeId !== "tm_aqc:neptunium_chestplate" ||
        legs.typeId !== "tm_aqc:neptunium_leggings" ||
        feet.typeId !== "tm_aqc:neptunium_boots")
        return;
    event.cancel = true;
});

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    const block = event.block;
    event.player;
    const item = event.itemStack;
    if (!item)
        return;
    if (item.typeId === "tm_aqc:neptunium_hoe" && block.typeId === "minecraft:farmland") {
        block.setPermutation(block.permutation.withState("moisturized_amount", 7));
    }
});

world.afterEvents.entityHitEntity.subscribe((event) => {
    const entity = event.hitEntity;
    const hitter = event.damagingEntity;
    if (!(hitter instanceof Player))
        return;
    if (entity.typeId === "tm_aqc:fishing_net" || entity.typeId === "tm_aqc:fishing_pot") {
        FishingPotManager.dropSelf(entity);
        return;
    }
});

world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;
    //RodManager.uncast(player, undefined, true);
    const hasBobber = RodManager.hasCast(player);
    const hasHarpoon = HarpoonManager.hasCast(player);
    if (hasBobber) {
        RodManager.uncast(player, undefined, true);
    }
    if (hasHarpoon) {
        HarpoonManager.removeCast(player);
    }
    const fishUILink = player.getDynamicProperty(DynamicPropertyEnum.FishUILink);
    if (fishUILink) {
        const oldFishUI = world.getEntity(fishUILink);
        if (oldFishUI)
            oldFishUI.remove();
    }
    if (!event.initialSpawn)
        return;
    const hasBook = player.getDynamicProperty(DynamicPropertyEnum.HasBook);
    if (!hasBook) {
        // [Addon Pack] guia nao e mais entregue no 1o acesso (continua craftavel)
        player.setDynamicProperty(DynamicPropertyEnum.HasBook, true);
    }
});

// Ticks
system.runInterval(() => {
    CustomItemsManager.runFlippers();
    CustomItemsManager.runSnorkel();
    CustomItemsManager.runNeptuniumHaste();
    CustomItemsManager.runNeptuniumWaterBreathing();
}, 1);
system.runInterval(() => {
    FishUtils.flopFish();
}, 10);
/*
TODO:Developer Notes

./Checkers/BiomeChecker.ts
- Once dimension#getBiome is added, change all implmentations to a custom biome checker

./Listeners/custom/StoppedHoldingRod.ts
- Change when PlayerHotbarSelectedSlotChangeAfterEvent is added

*/
