import { world, system, EquipmentSlot } from "@minecraft/server";

const lastArmor = new Map();

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const equip = player.getComponent("minecraft:equippable");
        if (!equip) continue;

        const slots = [
            EquipmentSlot.Head,
            EquipmentSlot.Chest,
            EquipmentSlot.Legs,
            EquipmentSlot.Feet
        ];

        const current = {};
        for (const slot of slots) {
            const item = equip.getEquipment(slot);
            current[slot] = item?.typeId ?? null;
        }

        const previous = lastArmor.get(player.id);

        if (previous) {
            for (const slot of slots) {
                if (current[slot] !== previous[slot]) {
                    const item = equip.getEquipment(slot);

                    const loc = player.location;
                    const dir = player.getViewDirection();

                    const soundPos = {
                        x: loc.x + dir.x * 0.8,
                        y: loc.y + 1.6 + dir.y * 0.8,
                        z: loc.z + dir.z * 0.8
                    };

                    if (item?.hasTag("mnra_cata:StrongEquipmentSound")) {

                        player.dimension.playSound(
                            "armor.equip_netherite",
                            soundPos,
                            {
                                volume: 0.7,
                                pitch: 0.7
                            }
                        );
                    }
                    if (item?.hasTag("mnra_cata:EquipmentSound")) {

                        player.dimension.playSound(
                            "armor.equip_diamond",
                            soundPos,
                            {
                                volume: 0.7,
                                pitch: 1.3
                            }
                        );
                    }
                    break;
                }
            }
        }

        lastArmor.set(player.id, current);
    }
}, 1);

