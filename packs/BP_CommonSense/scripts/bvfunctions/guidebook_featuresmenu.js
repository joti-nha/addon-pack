import { world, system } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { showMainMenu } from "./guidebook.js";
import { pagesound } from "./guidebook.js";

//=========================
// FEATURES
//=======================
export function showFeaturesMenu(player) {
	const form = new ActionFormData()
		.title("Features")
		.body("Choose:")
		.button("Back to Menu", "textures/gui/newgui/undo")
		.button("Dynamic Light", "textures/items/lantern")
		.button("Better Off-hand", "textures/guidebook/off_hand")
		.button("No Hurt Pets", "textures/items/bone")
		.button("Better Mounts", "textures/items/saddle")
		.button("New Pets ❤", "textures/items/fox_armor")
		.button("Smaller Features", "textures/items/paper");

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showMainMenu(player); // Volta
			pagesound(player)
		} else if (response.selection === 1) {
			showDynamicLight(player)
			pagesound(player)
			player.sendMessage("§a");
		} else if (response.selection === 2) {
			showOffHand(player)
			pagesound(player)
		} else if (response.selection === 3) {
			showNoHurt(player)
			pagesound(player)
		} else if (response.selection === 4) {
			showBetterMount(player)
			pagesound(player)
		} else if (response.selection === 5) {
			showNewPets(player)
			pagesound(player)
		} else if (response.selection === 6) {
			showSmallFeatures(player)
			pagesound(player)
		}
	});
}

function showDynamicLight(player) {
	const form = new ActionFormData()
		.title("Dynamic Light")
		.body("§a==============================\n    §c(Toggleble Feature in Settings)\n\n§f1. When holding items that emit light, they illuminate around you, with different levels of light\n\n2. Lanterns also light up when in your hot bar, like was in your 'belt', (this also can be disabled in settings)\n\n§aLight levels:\nlvl1 §f- keys, glow ink, glow lichen, magma, Redstone torch, glow berries, glow frame, enchanted golden apple\n\n§alvl2§f - soul_torch, sea_pickle, glowstone_dust, blaze_powder\n\n§alvl3§f - torch, soul_lantern, lava_bucket, blaze_rod, end_rod, shroomlight\n\n§alvl4§f - lantern, copper_torch, oxidized/weathered copper lanterns, campfire, sea_lantern, glowstone, froglights\n\n§alvl5§f - Nether Star\n\n§a===========================\n")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showFeaturesMenu(player); // Volta
			pagesound(player)
		}
	})
}

function showOffHand(player) {
	const form = new ActionFormData()
		.title("Off Hand")
		.body("§a==============================\n  §c(TOGGLEBLE FEATURE IN SETTINGS)\n\n§f1.You can use fireworks to boost elytra using off-hand, IF your main hand has another item\n\n2.Double-Crouch To swap hands with compatible items\n\n§aCompatible Items:\n§fAll torches and Lanterns, Shields, Fireworks, Totem of Undying\n§a==============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showFeaturesMenu(player); // Volta
			pagesound(player)
		}
	})
}

function showNoHurt(player) {
	const form = new ActionFormData()
		.title("No Hurt Pets")
		.body("§2==============================  \n§r§c(TOGGLEBLE FEATURE IN SETTINGS)§r\n\n1. your pets and mounts don't take damage from players\n§c(VANILLA MOBS ONLY)§r\n\n§aMode 1§r: the pets and mounts don't take damage from all players\n\n§aMode 2: §rthe pets and mounts don't take damage only from their owner\n§2==============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showFeaturesMenu(player); // Volta
			pagesound(player)
		}
	})
}

function showBetterMount(player) {
	const form = new ActionFormData()
		.title("BetterMount")
		.body("§a==============================\n  \nHappy Ghast:§f\nSpeed Modes: Interacting with stick on happy ghast while stand up in their head you can switch the modes between vanilla speed and boosted speed\n\n§aChested Mounts:§f\nall mounts can be equipped with chest\nHappy Ghast: 15 slots\nHorses: 9 slots\nDonkey: 18 slots\nMules and Camels: 24 slots\n\n§aBreak Leaves (ON/OFF)§f\nMounts Break Leaves when running though them\n\n§aHorses Stay:§f\nHorses that are tamed and saddled, will stay when not mounted by any player\n\n§a2 Riders:§f\nHorses, Mules, Donkeys also can support 2 Riders\n\n§a==============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showFeaturesMenu(player); // Volta
			pagesound(player)
		}
	})
}

function showNewPets(player) {
	const form = new ActionFormData()
		.title("Smaller Features")
		.body("§a==============================\nFoxes:§f\nfollow and sit behaviour like wolf, defend owner with attacks and leap attacks\n§aTamed with:§f bone (might change in future), \n§aFood:§f meats in general\n§aHealth:§f 20\n§aDamage:§f 4:\n\n§aFrogs:§f\nfollow and sit behaviour like wolf, defend owner with attacks\n§aTamed with:§f bone (might change in future),\n§aFood:§f meats in general\n§aHealth:§f 20\n§aDamage:§f 4\n\n§aAxolotl:§f\nFollow and sit behaviour like wolf, gives regeneration to player when touched (cooldown 15 seconds)\n§aTamed with:§f bone (might change),\n§aDisability:§f after 8 min the axolotl start to dry out that hurt then, make sure bring water with yourself (bottle of water, water buckets...).\n§aFood:§f fishes\n§aHealth:§f 20\n\n§aPolar Bear:§f\nFollow behaviour like wolf, they can be a §amount§f or a pet when without riders, they attack players target like wolfs and use the vanilla \"stomp\" bear attack also\n§aTamed with:§f bone (might change)/ mount tame (like horses)\n§aFood:§f meats in general\n§aHealth:§f 30\n§aDamage:§f 6\n==============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showFeaturesMenu(player); // Volta
			pagesound(player)
		}
	})
}

function showSmallFeatures(player) {
	const form = new ActionFormData()
		.title("Smaller Features")
		.body("==============================\n\n§aJava Saturation:§f\nsimilar do minecraft java edition, when hurt, the player will exchange saturation points to recover health\n\n§aShear Chickens:§f\nyou can 'hit' the chicken with a shear to get some feathers(1 min cooldown)\n\n§aTorch Attack:§f\nhitting any mob with a torch in hand will set him fire for 2 seconds\n\n§aAnvil Repair:§f\nNow you can repair anvils by right-clicking with an iron ingot in hand\n\n§aSoul Vision:§f\nSoul lantern/torches gives night vision when hold\n\n§aAuto Totem System (on/off)§f\nwhen a Totem of Undying is in your hot-bar, and your health is dangerous low, the system replaces your offhand with the Totem\n\n§aVillager Names:§f\nNow all villager spawn with custom names\n\n§aCampfire heal (on/off)§f\nWhen next to a campfire lit, the player receives regeneration effect\n\n==============================")
		.button("Back", "textures/gui/newgui/undo")

	form.show(player).then((response) => {
		if (response.canceled) return;

		if (response.selection === 0) {
			showFeaturesMenu(player); // Volta
			pagesound(player)
		}
	})
}