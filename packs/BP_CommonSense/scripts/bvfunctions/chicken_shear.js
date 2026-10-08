import { world, system, ItemStack, EquipmentSlot } from "@minecraft/server";

world.afterEvents.entityHitEntity.subscribe((event) => {
	// No entityHitEntity, as variáveis mudam de nome
	const attacker = event.damagingEntity;
	const target = event.hitEntity;

	// 1. Verifica se quem bateu foi um jogador e se o alvo é uma galinha
	if (attacker?.typeId !== "minecraft:player" || target?.typeId !== "minecraft:chicken") return;

	// 2. Acede aos equipamentos do jogador para verificar a mão principal
	const equipment = attacker.getComponent("minecraft:equippable");
	if (!equipment) return;

	const mainhandSlot = equipment.getEquipmentSlot(EquipmentSlot.Mainhand);
	const itemInHand = mainhandSlot.getItem();

	// 3. Verifica se o item usado para o golpe é uma tesoura
	if (itemInHand?.typeId === "minecraft:shears") {

		// --- LÓGICA DE TEMPO DE RECARGA (COOLDOWN) ---
		if (target.hasTag("cooldown_penas")) {
			attacker.onScreenDisplay.setActionBar("§eCooldown: let the chicken recover!");
			return;
		}

		target.addTag("cooldown_penas");

		// --- ENTREGA DOS ITENS ---
		const amount = Math.floor(Math.random() * 6) + 1; // 1 a 3 penas
		const feathers = new ItemStack("minecraft:feather", amount);

		const inventory = attacker.getComponent("minecraft:inventory");
		if (inventory && inventory.container) {

			// O addItem tenta colocar no inventário e devolve o que não couber
			const leftover = inventory.container.addItem(feathers);

			// Se o inventário estiver cheio, deita as penas no chão para não as perder
			if (leftover) {
				const spawnLoc = attacker.location;
				attacker.dimension.spawnItem(leftover, spawnLoc);
			}

			attacker.playSound("random.pop");
		}

		target.dimension.playSound("mob.sheep.shear", target.location);

		// --- LÓGICA DE DURABILIDADE DA TESOURA ---
		const durability = itemInHand.getComponent("minecraft:durability");
		if (durability) {
			durability.damage++;
			if (durability.damage >= durability.maxDurability) {
				mainhandSlot.setItem(undefined);
				attacker.playSound("random.break");
			} else {
				mainhandSlot.setItem(itemInHand);
			}
		}

		// --- FINALIZAÇÃO DO TEMPO DE RECARGA ---
		// 1200 ticks = 60 segundos
		system.runTimeout(() => {
			if (target.isValid()) {
				target.removeTag("cooldown_penas");
			}
		}, 1200);
	}
});