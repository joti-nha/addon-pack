import { world, EquipmentSlot } from "@minecraft/server";

const TORCHES = [
	"minecraft:torch",
	"minecraft:redstone_torch",
	"minecraft:soul_torch",
	"minecraft:copper_torch",
];

world.afterEvents.entityHitEntity.subscribe((event) => {
	const attacker = event.damagingEntity;
	const target = event.hitEntity;

	// 1. Verifica se quem atacou foi realmente um jogador
	if (attacker?.typeId !== "minecraft:player") return;

	// 2. Pega o componente de inventário/equipamentos do jogador
	const equipment = attacker.getComponent("minecraft:equippable");
	if (!equipment) return;

	// 3. Lê especificamente o que está na mão principal (Mainhand)
	const itemInHand = equipment.getEquipment(EquipmentSlot.Mainhand);

	// 4. Verifica se o item existe e se é a tocha normal
	if (itemInHand && TORCHES.includes(itemInHand.typeId)) {

		// Coloca fogo no alvo por 3 segundos. 
		// O "true" no final garante que as partículas de fogo apareçam.
		target.setOnFire(2, true);
	}
});